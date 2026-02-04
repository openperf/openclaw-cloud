import Docker from "dockerode";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

const docker = new Docker();
const OPENCLAW_IMAGE = "openclaw:local";
const INSTANCES_BASE_PATH = "/home/ubuntu/openclaw-instances";

export interface InstanceConfig {
  instanceId: string;
  name: string;
  description?: string;
  provider: string;
  model?: string;
  apiKey: string;
  baseUrl?: string;
  agentName?: string;
  timezone?: string;
  sandboxMode?: "all" | "none" | "tools";
  sessionMode?: "per-sender" | "shared" | "per-group";
  telegramToken?: string;
  telegramChatId?: string;
  discordToken?: string;
  discordGuildId?: string;
  discordChannelId?: string;
  slackBotToken?: string;
  slackAppToken?: string;
  matrixHomeserverUrl?: string;
  matrixAccessToken?: string;
  matrixRoomId?: string;
  matrixDmPolicy?: "pairing" | "open" | "allowlist" | "disabled";
  port: number;
}

/**
 * 创建实例目录结构
 */
async function createInstanceDirectories(instanceId: string) {
  const instancePath = path.join(INSTANCES_BASE_PATH, instanceId);
  const workspacePath = path.join(instancePath, "workspace");
  const skillsPath = path.join(workspacePath, "skills");
  const configPath = path.join(instancePath, "config");

  await fs.mkdir(instancePath, { recursive: true });
  await fs.mkdir(workspacePath, { recursive: true });
  await fs.mkdir(skillsPath, { recursive: true });
  await fs.mkdir(configPath, { recursive: true });

  return {
    instancePath,
    workspacePath,
    skillsPath,
    configPath,
  };
}

/**
 * 生成Gateway Token
 */
function generateGatewayToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * 生成完整的OpenClaw配置文件
 * 基于官方文档: https://docs.openclaw.ai/gateway/configuration
 */
async function generateOpenClawConfig(
  config: InstanceConfig,
  paths: { configPath: string }
) {
  const gatewayToken = generateGatewayToken();

  // 生成完整的配置文件（参考用户提供的配置结构）
  const configContent: any = {
    // Env配置（API Keys）
    env: {},

    // Messages配置
    messages: {
      ackReactionScope: "group-mentions",
    },

    // Agent配置
    agents: {
      defaults: {
        maxConcurrent: 4,
        subagents: {
          maxConcurrent: 8,
        },
        compaction: {
          mode: "safeguard",
        },
        workspace: "/home/node/.openclaw/workspace", // 容器内工作目录
        // Model配置（根据provider生成）
        models: {},
        model: {
          primary: "", // 稍后填充
        },
      },
    },

    // Gateway配置
    gateway: {
      mode: "local",
      auth: {
        mode: "token",
        token: gatewayToken,
      },
      port: 18789, // 容器内部端口固定为18789
      bind: "loopback", // 使用loopback而不是0.0.0.0
      tailscale: {
        mode: "off",
        resetOnExit: false,
      },
    },

    // Auth profiles配置
    auth: {
      profiles: {},
    },

    // Skills配置
    skills: {
      install: {
        nodeManager: "pnpm",
      },
    },

    // Hooks配置
    hooks: {
      internal: {
        enabled: true,
        entries: {
          "session-memory": {
            enabled: true,
          },
        },
      },
    },
  };

  // 配置Model（根据provider生成完整的model配置）
  // 注意：config.model可能已经包含provider前缀（如"openrouter/anthropic/claude-sonnet-4.5"）
  let fullModelKey: string;
  if (config.model && config.model.includes("/")) {
    // 如果已经包含"/"，说明是完整的model key，直接使用
    fullModelKey = config.model;
  } else {
    // 否则根据provider添加前缀
    const modelName = config.model || (config.provider === "openrouter" ? "auto" : "default");
    fullModelKey = config.provider === "openrouter" 
      ? `openrouter/${modelName}`
      : config.provider === "anthropic"
      ? `anthropic/${modelName}`
      : config.provider === "openai"
      ? modelName // OpenAI不需要前缀
      : `${config.provider}/${modelName}`;
  }

  configContent.agents.defaults.models[fullModelKey] = {
    alias: config.provider === "openrouter" ? "OpenRouter" : undefined,
  };
  configContent.agents.defaults.model.primary = fullModelKey;

  // 配置API Key到env块
  const envKeyMap: Record<string, string> = {
    openrouter: "OPENROUTER_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    ollama: "OLLAMA_BASE_URL", // Ollama使用base URL而不是API Key
  };
  const envKey = envKeyMap[config.provider] || `${config.provider.toUpperCase()}_API_KEY`;
  if (config.apiKey) {
    configContent.env[envKey] = config.apiKey;
  }
  if (config.baseUrl && config.provider !== "ollama") {
    configContent.env[`${config.provider.toUpperCase()}_BASE_URL`] = config.baseUrl;
  }

  // 配置Auth Profile（注意：OpenClaw不需要在这里配置API Key）
  const profileKey = `${config.provider}:default`;
  configContent.auth.profiles[profileKey] = {
    provider: config.provider,
    mode: "api_key",
    // 不在这里配置api_key，OpenClaw会从环境变量中读取
  };
  if (config.baseUrl) {
    configContent.auth.profiles[profileKey].base_url = config.baseUrl;
  }

  // 添加Channels配置
  configContent.channels = {};
  
  // 添加Plugins配置（如果有channel需要plugin）
  configContent.plugins = {
    load: {
      paths: [],
    },
    entries: {},
  };

  if (config.telegramToken) {
    const allowFrom = config.telegramChatId
      ? config.telegramChatId.split(",").map((id: string) => id.trim())
      : ["*"];
    
    configContent.channels.telegram = {
      enabled: true,
      botToken: config.telegramToken,
      allowFrom,
    };
  }

  if (config.discordToken) {
    const guildId = config.discordGuildId || "*";
    const channelIds = config.discordChannelId
      ? config.discordChannelId.split(",").map((id: string) => id.trim())
      : ["*"];
    
    configContent.channels.discord = {
      enabled: true,
      token: config.discordToken,
      guilds: {
        [guildId]: {
          channels: channelIds,
          requireMention: false,
        },
      },
    };
  }

  if (config.slackBotToken && config.slackAppToken) {
    configContent.channels.slack = {
      enabled: true,
      botToken: config.slackBotToken,
      appToken: config.slackAppToken,
    };
  }

  if (config.matrixHomeserverUrl && config.matrixAccessToken) {
    const roomIds = config.matrixRoomId
      ? config.matrixRoomId.split(",").map((id: string) => id.trim())
      : ["*"];
    
    configContent.channels.matrix = {
      enabled: true,
      homeserver: config.matrixHomeserverUrl, // 注意：用户配置使用homeserver而不homeserverUrl
      accessToken: config.matrixAccessToken,
      deviceName: "OpenClaw Cloud Gateway",
      encryption: true,
      rooms: roomIds.length > 0 && roomIds[0] !== "*" ? roomIds : undefined,
      dm: {
        policy: config.matrixDmPolicy || "pairing", // 默认使用pairing
        allowFrom: config.matrixDmPolicy === "open" ? ["*"] : undefined, // open policy需要显式设置
      },
    };

    // Matrix需要plugin支持
    configContent.plugins.entries.matrix = {
      enabled: true,
    };
  }

  // 写入配置文件
  await fs.writeFile(
    path.join(paths.configPath, "openclaw.json"),
    JSON.stringify(configContent, null, 2)
  );

  return gatewayToken;
}

/**
 * 创建并启动OpenClaw容器
 */
export async function createInstance(config: InstanceConfig) {
  try {
    const paths = await createInstanceDirectories(config.instanceId);
    const gatewayToken = await generateOpenClawConfig(config, paths);

    const containerName = `openclaw-${config.instanceId}`;

    // 创建容器
    const container = await docker.createContainer({
      name: containerName,
      Image: OPENCLAW_IMAGE,
      // Use bash to run init script then start gateway
      Cmd: [
        "/bin/bash",
        "-c",
        "cd /home/node/.openclaw/workspace && ([ ! -d .git ] && git init && git config user.name 'OpenClaw' && git config user.email 'openclaw@workspace.local' && echo '# OpenClaw Workspace' > README.md && git add README.md && git commit -m 'Initial commit' || echo 'Git already initialized') && cd /app && node dist/index.js gateway"
      ],
      Env: [
        "NODE_ENV=production",
        `OPENCLAW_GATEWAY_TOKEN=${gatewayToken}`,
        // 配置文件路径
        "OPENCLAW_CONFIG_PATH=/home/node/.openclaw/openclaw.json",
        // LLM API keys for aider and other AI coding tools
        ...(config.apiKey ? [
          // Map provider to appropriate env var
          config.provider === "openai" ? `OPENAI_API_KEY=${config.apiKey}` :
          config.provider === "anthropic" ? `ANTHROPIC_API_KEY=${config.apiKey}` :
          `DEEPSEEK_API_KEY=${config.apiKey}`, // Default to DeepSeek
        ] : []),
      ],
      ExposedPorts: {
        "18789/tcp": {},
      },
      HostConfig: {
        PortBindings: {
          "18789/tcp": [{ HostPort: config.port.toString() }],
        },
        Binds: [
          // 挂载配置文件（只读）
          `${path.join(paths.configPath, "openclaw.json")}:/home/node/.openclaw/openclaw.json:ro`,
          // 挂载workspace目录（读写）
          `${paths.workspacePath}:/home/node/.openclaw/workspace:rw`,
        ],
        RestartPolicy: {
          Name: "unless-stopped",
        },
      },
      Healthcheck: {
        Test: ["CMD", "node", "dist/index.js", "health"],
        Interval: 30000000000, // 30s in nanoseconds
        Timeout: 10000000000, // 10s
        Retries: 3,
        StartPeriod: 60000000000, // 60s
      },
    });

    // 启动容器
    await container.start();

    return {
      success: true,
      containerId: container.id,
      gatewayToken,
      port: config.port,
    };
  } catch (error: any) {
    console.error("Failed to create OpenClaw instance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 启动实例 - 重新创建容器以应用最新配置
 */
export async function startInstance(instanceId: string, instanceConfig?: any) {
  try {
    const containerName = `openclaw-${instanceId}`;
    
    // Try to remove existing container if it exists
    try {
      const existingContainer = docker.getContainer(containerName);
      try {
        await existingContainer.stop();
      } catch (e) {
        // Container might already be stopped
      }
      await existingContainer.remove();
    } catch (e) {
      // Container doesn't exist, which is fine
    }
    
    // If instanceConfig is provided, recreate container with new config
    if (instanceConfig) {
      await createInstance(instanceConfig);
      return { success: true };
    }
    
    // Otherwise just try to start existing container
    const container = docker.getContainer(containerName);
    await container.start();
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to start instance ${instanceId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 停止实例
 */
export async function stopInstance(instanceId: string) {
  try {
    const containerName = `openclaw-${instanceId}`;
    const container = docker.getContainer(containerName);
    await container.stop();
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to stop instance ${instanceId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 删除实例
 */
export async function deleteInstance(instanceId: string) {
  try {
    const containerName = `openclaw-${instanceId}`;
    const container = docker.getContainer(containerName);

    // 先停止容器
    try {
      await container.stop();
    } catch (e) {
      // 容器可能已经停止，忽略错误
    }

    // 删除容器
    await container.remove();

    // 删除实例目录
    const instancePath = path.join(INSTANCES_BASE_PATH, instanceId);
    await fs.rm(instancePath, { recursive: true, force: true });

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete instance ${instanceId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取实例状态
 */
export async function getInstanceStatus(instanceId: string) {
  try {
    const containerName = `openclaw-${instanceId}`;
    const container = docker.getContainer(containerName);
    const info = await container.inspect();

    return {
      success: true,
      status: info.State.Status,
      running: info.State.Running,
      startedAt: info.State.StartedAt,
      finishedAt: info.State.FinishedAt,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 获取容器日志
 */
export async function getInstanceLogs(
  instanceId: string,
  tail: number = 100
) {
  try {
    const containerName = `openclaw-${instanceId}`;
    const container = docker.getContainer(containerName);

    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    return {
      success: true,
      logs: logs.toString("utf-8"),
    };
  } catch (error: any) {
    console.error(`Failed to get logs for instance ${instanceId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 获取容器资源统计
 */
export async function getInstanceStats(instanceId: string) {
  try {
    const containerName = `openclaw-${instanceId}`;
    const container = docker.getContainer(containerName);

    const stats = await container.stats({ stream: false });

    // 计算CPU使用率
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent =
      (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

    // 计算内存使用率
    const memoryUsage = stats.memory_stats.usage;
    const memoryLimit = stats.memory_stats.limit;
    const memoryPercent = (memoryUsage / memoryLimit) * 100;

    return {
      success: true,
      cpu: cpuPercent.toFixed(2),
      memory: {
        usage: memoryUsage,
        limit: memoryLimit,
        percent: memoryPercent.toFixed(2),
      },
    };
  } catch (error: any) {
    console.error(`Failed to get stats for instance ${instanceId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 重启实例
 */
export async function restartInstance(instanceId: string) {
  try {
    const containerName = `openclaw-${instanceId}`;
    const container = docker.getContainer(containerName);
    await container.restart();
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to restart instance ${instanceId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 安装Skill到实例
 */
export async function installSkillToInstance(
  instanceId: string,
  skillName: string,
  skillContent: string
) {
  try {
    const instancePath = path.join(INSTANCES_BASE_PATH, instanceId);
    const skillsPath = path.join(instancePath, "workspace", "skills");
    const skillFilePath = path.join(skillsPath, `${skillName}.md`);

    // 写入Skill文件
    await fs.writeFile(skillFilePath, skillContent);

    // 重启容器使Skills生效
    await restartInstance(instanceId);

    return { success: true };
  } catch (error: any) {
    console.error(
      `Failed to install skill ${skillName} to instance ${instanceId}:`,
      error
    );
    return { success: false, error: error.message };
  }
}
