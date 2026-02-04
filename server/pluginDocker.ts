import Docker from "dockerode";
import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";
import { getPluginDefinition, PluginDefinition } from "./pluginRegistry";

const docker = new Docker();
const PLUGINS_BASE_PATH = "/home/ubuntu/openclaw-plugins";

/**
 * 插件状态
 */
export interface PluginStatus {
  running: boolean;
  containerId?: string;
  status: "running" | "stopped" | "error" | "not_installed";
  health?: "healthy" | "unhealthy" | "starting";
  ports?: Record<string, number>;
  error?: string;
}

/**
 * 插件安装配置
 */
export interface PluginInstallConfig {
  pluginId: string;
  definitionId: string;
  config: Record<string, any>;
}

/**
 * 创建插件数据目录
 */
async function createPluginDirectories(pluginId: string) {
  const pluginPath = path.join(PLUGINS_BASE_PATH, pluginId);
  const dataPath = path.join(pluginPath, "data");
  const configPath = path.join(pluginPath, "config");

  await fs.mkdir(pluginPath, { recursive: true });
  await fs.mkdir(dataPath, { recursive: true });
  await fs.mkdir(configPath, { recursive: true });

  return {
    pluginPath,
    dataPath,
    configPath,
  };
}

/**
 * 获取下一个可用端口
 */
async function getNextAvailablePort(startPort: number = 8100): Promise<number> {
  const containers = await docker.listContainers({ all: true });
  const usedPorts = new Set<number>();

  for (const container of containers) {
    if (container.Ports) {
      for (const port of container.Ports) {
        if (port.PublicPort) {
          usedPorts.add(port.PublicPort);
        }
      }
    }
  }

  let port = startPort;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

/**
 * 生成随机密钥
 */
function generateRandomSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 50; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 处理环境变量模板
 */
function processEnvTemplate(template: Record<string, string>, config: Record<string, any>): string[] {
  const envVars: string[] = [];
  
  for (const [key, valueTemplate] of Object.entries(template)) {
    let value = valueTemplate;
    // 替换 {{variable}} 模板
    const matches = valueTemplate.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      for (const match of matches) {
        const varName = match.replace(/\{\{|\}\}/g, "");
        const configValue = config[varName];
        if (configValue !== undefined) {
          value = value.replace(match, String(configValue));
        }
      }
    }
    envVars.push(`${key}=${value}`);
  }
  
  return envVars;
}

/**
 * Synapse 特定配置生成
 */
async function generateSynapseConfig(
  config: Record<string, any>,
  paths: { dataPath: string; configPath: string }
): Promise<void> {
  const homeserverConfig = {
    server_name: config.serverName,
    pid_file: "/data/homeserver.pid",
    listeners: [
      {
        port: 8008,
        tls: false,
        type: "http",
        x_forwarded: true,
        bind_addresses: ["0.0.0.0"],
        resources: [
          {
            names: ["client", "federation"],
            compress: false,
          },
        ],
      },
    ],
    database: {
      name: "sqlite3",
      args: {
        database: "/data/homeserver.db",
      },
    },
    log_config: "/data/log.config",
    media_store_path: "/data/media_store",
    report_stats: config.reportStats || false,
    signing_key_path: "/data/signing.key",
    trusted_key_servers: [
      {
        server_name: "matrix.org",
      },
    ],
    enable_registration: config.enableRegistration || false,
    enable_registration_without_verification: config.enableRegistration || false,
    registration_shared_secret: config.registrationSharedSecret || null,
    macaroon_secret_key: generateRandomSecret(),
    form_secret: generateRandomSecret(),
    suppress_key_server_warning: true,
  };

  await fs.writeFile(
    path.join(paths.dataPath, "homeserver.yaml"),
    yaml.stringify(homeserverConfig)
  );

  const logConfig = {
    version: 1,
    formatters: {
      precise: {
        format: "%(asctime)s - %(name)s - %(lineno)d - %(levelname)s - %(request)s - %(message)s",
      },
    },
    handlers: {
      console: {
        class: "logging.StreamHandler",
        formatter: "precise",
      },
    },
    loggers: {
      synapse: {
        level: "INFO",
      },
      "synapse.storage.SQL": {
        level: "INFO",
      },
    },
    root: {
      level: "INFO",
      handlers: ["console"],
    },
    disable_existing_loggers: false,
  };

  await fs.writeFile(
    path.join(paths.dataPath, "log.config"),
    yaml.stringify(logConfig)
  );
}

/**
 * 生成 Synapse signing key
 */
async function generateSigningKey(dataPath: string): Promise<void> {
  const keyPath = path.join(dataPath, "signing.key");
  try {
    await fs.access(keyPath);
  } catch {
    const containerName = `synapse-keygen-${Date.now()}`;
    try {
      const container = await docker.createContainer({
        name: containerName,
        Image: "matrixdotorg/synapse:latest",
        Cmd: ["generate_signing_key", "-o", "/data/signing.key"],
        HostConfig: {
          Binds: [`${dataPath}:/data:rw`],
          AutoRemove: true,
        },
      });
      await container.start();
      await container.wait();
    } catch (error) {
      const simpleKey = `ed25519 a_${generateRandomSecret().substring(0, 4)} ${generateRandomSecret()}`;
      await fs.writeFile(keyPath, simpleKey);
    }
  }
}

/**
 * 通用插件安装
 */
export async function installPlugin(
  pluginId: string,
  definitionId: string,
  config: Record<string, any>
): Promise<{ success: boolean; error?: string; port?: number; containerId?: string }> {
  try {
    const definition = getPluginDefinition(definitionId);
    if (!definition) {
      return { success: false, error: `未找到插件定义: ${definitionId}` };
    }

    // 创建目录
    const paths = await createPluginDirectories(pluginId);

    // 获取端口配置
    const portField = definition.configFields.find(f => f.name === "port" || f.name === "httpPort" || f.name === "apiPort");
    const configuredPort = config[portField?.name || "port"] || config.httpPort || config.port;
    const hostPort = configuredPort || await getNextAvailablePort(definition.defaultPort);

    // 拉取镜像
    console.log(`[Plugin:${definitionId}] Pulling image ${definition.dockerImage}:${definition.dockerTag}...`);
    await new Promise<void>((resolve, reject) => {
      docker.pull(`${definition.dockerImage}:${definition.dockerTag}`, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) {
          reject(err);
          return;
        }
        docker.modem.followProgress(stream, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // 特殊处理：Synapse 需要生成配置文件
    if (definitionId === "synapse") {
      console.log("[Plugin:synapse] Generating Synapse config...");
      await generateSynapseConfig(config, paths);
      await generateSigningKey(paths.dataPath);
    }

    // 处理环境变量
    const envVars = processEnvTemplate(definition.envTemplate, config);
    
    // 添加额外的环境变量（如 Redis 密码）
    if (definitionId === "redis" && config.password) {
      // Redis 通过命令行参数设置密码
    }

    // 创建容器
    console.log(`[Plugin:${definitionId}] Creating container...`);
    const containerName = `openclaw-plugin-${definitionId}-${pluginId}`;

    // 检查是否已存在同名容器
    try {
      const existingContainer = docker.getContainer(containerName);
      const info = await existingContainer.inspect();
      if (info) {
        await existingContainer.remove({ force: true });
      }
    } catch {
      // Container doesn't exist, continue
    }

    // 构建容器配置
    const containerConfig: Docker.ContainerCreateOptions = {
      name: containerName,
      Image: `${definition.dockerImage}:${definition.dockerTag}`,
      Env: envVars,
      ExposedPorts: {
        [`${definition.containerPort}/tcp`]: {},
      },
      HostConfig: {
        PortBindings: {
          [`${definition.containerPort}/tcp`]: [{ HostPort: hostPort.toString() }],
        },
        Binds: [`${paths.dataPath}:${definition.dataVolume}:rw`],
        RestartPolicy: {
          Name: "unless-stopped",
        },
      },
    };

    // MinIO 特殊处理：需要额外的控制台端口和启动命令
    if (definitionId === "minio") {
      const consolePort = config.consolePort || 9001;
      containerConfig.Cmd = ["server", "/data", "--console-address", `:${consolePort}`];
      containerConfig.ExposedPorts![`${consolePort}/tcp`] = {};
      containerConfig.HostConfig!.PortBindings![`${consolePort}/tcp`] = [{ HostPort: consolePort.toString() }];
    }

    // Redis 特殊处理：密码通过命令行参数
    if (definitionId === "redis" && config.password) {
      containerConfig.Cmd = ["redis-server", "--requirepass", config.password];
      if (config.maxMemory) {
        containerConfig.Cmd.push("--maxmemory", `${config.maxMemory}mb`);
      }
    }

    // Nginx 特殊处理：HTTPS 端口
    if (definitionId === "nginx" && config.httpsPort) {
      containerConfig.ExposedPorts!["443/tcp"] = {};
      containerConfig.HostConfig!.PortBindings!["443/tcp"] = [{ HostPort: config.httpsPort.toString() }];
    }

    const container = await docker.createContainer(containerConfig);

    // 启动容器
    console.log(`[Plugin:${definitionId}] Starting container...`);
    await container.start();

    // 保存配置信息
    const pluginInfo = {
      pluginId,
      definitionId,
      containerId: container.id,
      containerName,
      hostPort,
      config,
      dataPath: paths.dataPath,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(paths.configPath, "plugin-info.json"),
      JSON.stringify(pluginInfo, null, 2)
    );

    return {
      success: true,
      port: hostPort,
      containerId: container.id,
    };
  } catch (error: any) {
    console.error(`[Plugin:${definitionId}] Installation failed:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 启动插件
 */
export async function startPlugin(
  pluginId: string,
  definitionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const containerName = `openclaw-plugin-${definitionId}-${pluginId}`;
    const container = docker.getContainer(containerName);

    const info = await container.inspect();
    if (!info.State.Running) {
      await container.start();
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 停止插件
 */
export async function stopPlugin(
  pluginId: string,
  definitionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const containerName = `openclaw-plugin-${definitionId}-${pluginId}`;
    const container = docker.getContainer(containerName);

    const info = await container.inspect();
    if (info.State.Running) {
      await container.stop();
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 卸载插件
 */
export async function uninstallPlugin(
  pluginId: string,
  definitionId: string,
  removeData: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const containerName = `openclaw-plugin-${definitionId}-${pluginId}`;

    // 停止并删除容器
    try {
      const container = docker.getContainer(containerName);
      const info = await container.inspect();
      if (info.State.Running) {
        await container.stop();
      }
      await container.remove();
    } catch {
      // Container might not exist
    }

    // 可选删除数据
    if (removeData) {
      const pluginPath = path.join(PLUGINS_BASE_PATH, pluginId);
      await fs.rm(pluginPath, { recursive: true, force: true });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 获取插件状态
 */
export async function getPluginStatus(
  pluginId: string,
  definitionId: string
): Promise<PluginStatus> {
  try {
    const containerName = `openclaw-plugin-${definitionId}-${pluginId}`;
    const container = docker.getContainer(containerName);
    const info = await container.inspect();

    const ports: Record<string, number> = {};
    if (info.NetworkSettings.Ports) {
      for (const [containerPort, bindings] of Object.entries(info.NetworkSettings.Ports)) {
        if (bindings && bindings[0]) {
          ports[containerPort] = parseInt(bindings[0].HostPort);
        }
      }
    }

    let health: "healthy" | "unhealthy" | "starting" | undefined;
    if (info.State.Health) {
      switch (info.State.Health.Status) {
        case "healthy":
          health = "healthy";
          break;
        case "unhealthy":
          health = "unhealthy";
          break;
        case "starting":
          health = "starting";
          break;
      }
    }

    return {
      running: info.State.Running,
      containerId: info.Id,
      status: info.State.Running ? "running" : "stopped",
      health,
      ports,
    };
  } catch (error: any) {
    if (error.statusCode === 404) {
      return {
        running: false,
        status: "not_installed",
      };
    }
    return {
      running: false,
      status: "error",
      error: error.message,
    };
  }
}

/**
 * 获取插件日志
 */
export async function getPluginLogs(
  pluginId: string,
  definitionId: string,
  tail: number = 100
): Promise<{ success: boolean; logs?: string; error?: string }> {
  try {
    const containerName = `openclaw-plugin-${definitionId}-${pluginId}`;
    const container = docker.getContainer(containerName);

    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    // 处理 Docker 日志流格式
    const logString = logs.toString("utf8").replace(/[\x00-\x08]/g, "");

    return { success: true, logs: logString };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 获取插件配置信息
 */
export async function getPluginConfig(
  pluginId: string
): Promise<{ success: boolean; config?: any; error?: string }> {
  try {
    const configPath = path.join(PLUGINS_BASE_PATH, pluginId, "config", "plugin-info.json");
    const configData = await fs.readFile(configPath, "utf-8");
    return { success: true, config: JSON.parse(configData) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 检查 Docker 是否可用
 */
export async function checkDockerAvailable(): Promise<{ available: boolean; version?: string; error?: string }> {
  try {
    const info = await docker.version();
    return { available: true, version: info.Version };
  } catch (error: any) {
    return { available: false, error: error.message };
  }
}

/**
 * Synapse 特定功能：创建管理员用户
 */
export async function createSynapseAdmin(
  pluginId: string,
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const containerName = `openclaw-plugin-synapse-${pluginId}`;
    const container = docker.getContainer(containerName);

    // 获取配置信息
    const configResult = await getPluginConfig(pluginId);
    if (!configResult.success || !configResult.config) {
      return { success: false, error: "无法获取插件配置" };
    }

    const serverName = configResult.config.config?.serverName || "matrix.local";

    // 执行注册命令
    const exec = await container.exec({
      Cmd: [
        "register_new_matrix_user",
        "-c", "/data/homeserver.yaml",
        "-u", username,
        "-p", password,
        "-a",
        `http://localhost:8008`,
      ],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({ hijack: true, stdin: false });
    
    return new Promise((resolve) => {
      let output = "";
      stream.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      stream.on("end", () => {
        if (output.includes("Success") || output.includes("created")) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: output || "创建用户失败" });
        }
      });
      stream.on("error", (err: Error) => {
        resolve({ success: false, error: err.message });
      });
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 保持向后兼容的别名
export const installSynapse = (pluginId: string, config: any) => installPlugin(pluginId, "synapse", config);
export const startSynapse = (pluginId: string) => startPlugin(pluginId, "synapse");
export const stopSynapse = (pluginId: string) => stopPlugin(pluginId, "synapse");
export const uninstallSynapse = (pluginId: string, removeData?: boolean) => uninstallPlugin(pluginId, "synapse", removeData);
export const getSynapseStatus = (pluginId: string) => getPluginStatus(pluginId, "synapse");
export const getSynapseLogs = (pluginId: string, tail?: number) => getPluginLogs(pluginId, "synapse", tail);
export const getSynapseConfig = (pluginId: string) => getPluginConfig(pluginId);
