/**
 * 通用插件注册表
 * 定义所有可安装的 Docker 插件及其配置模板
 */

export interface PluginConfigField {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "password";
  required?: boolean;
  default?: string | number | boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[]; // for select type
}

export interface PluginDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: "infrastructure" | "channel" | "deployment" | "monitoring" | "skill-provider" | "other";
  version: string;
  author: string;
  icon: string; // lucide icon name
  dockerImage: string;
  dockerTag: string;
  defaultPort: number;
  containerPort: number;
  dataVolume: string; // container path for data persistence
  envTemplate: Record<string, string>; // environment variable template
  configFields: PluginConfigField[];
  healthCheck?: {
    endpoint?: string;
    interval?: number;
  };
  postInstallCommands?: string[]; // commands to run after container starts
  documentation?: string;
}

/**
 * 预定义的插件列表
 */
export const PLUGIN_REGISTRY: PluginDefinition[] = [
  {
    id: "synapse",
    name: "synapse",
    displayName: "Matrix Synapse",
    description: "Matrix 协议服务器，支持 Element 客户端连接，实现安全的即时通讯",
    type: "infrastructure",
    version: "1.0.0",
    author: "Matrix.org",
    icon: "Server",
    dockerImage: "matrixdotorg/synapse",
    dockerTag: "latest",
    defaultPort: 8008,
    containerPort: 8008,
    dataVolume: "/data",
    envTemplate: {
      SYNAPSE_SERVER_NAME: "{{serverName}}",
      SYNAPSE_REPORT_STATS: "{{reportStats}}",
      SYNAPSE_ENABLE_REGISTRATION: "{{enableRegistration}}",
    },
    configFields: [
      {
        name: "serverName",
        label: "服务器名称",
        type: "text",
        required: true,
        default: "matrix.local",
        placeholder: "matrix.example.com",
        description: "用于标识您的 Matrix 服务器，建议使用域名格式",
      },
      {
        name: "httpPort",
        label: "HTTP 端口",
        type: "number",
        required: false,
        default: 8008,
        description: "对外暴露的 HTTP 端口",
      },
      {
        name: "enableRegistration",
        label: "允许注册",
        type: "boolean",
        required: false,
        default: true,
        description: "允许新用户自行注册账号",
      },
      {
        name: "reportStats",
        label: "匿名统计",
        type: "boolean",
        required: false,
        default: false,
        description: "向 Matrix.org 报告匿名使用统计",
      },
    ],
    healthCheck: {
      endpoint: "/_matrix/client/versions",
      interval: 30,
    },
    documentation: "https://matrix-org.github.io/synapse/latest/",
  },
  {
    id: "postgres",
    name: "postgres",
    displayName: "PostgreSQL",
    description: "强大的开源关系型数据库，适用于复杂查询和大规模数据存储",
    type: "infrastructure",
    version: "16.0",
    author: "PostgreSQL Global Development Group",
    icon: "Database",
    dockerImage: "postgres",
    dockerTag: "16-alpine",
    defaultPort: 5432,
    containerPort: 5432,
    dataVolume: "/var/lib/postgresql/data",
    envTemplate: {
      POSTGRES_USER: "{{username}}",
      POSTGRES_PASSWORD: "{{password}}",
      POSTGRES_DB: "{{database}}",
    },
    configFields: [
      {
        name: "username",
        label: "用户名",
        type: "text",
        required: true,
        default: "postgres",
        placeholder: "postgres",
      },
      {
        name: "password",
        label: "密码",
        type: "password",
        required: true,
        placeholder: "设置数据库密码",
        description: "请设置一个强密码",
      },
      {
        name: "database",
        label: "数据库名",
        type: "text",
        required: true,
        default: "openclaw",
        placeholder: "openclaw",
      },
      {
        name: "port",
        label: "端口",
        type: "number",
        required: false,
        default: 5432,
      },
    ],
    healthCheck: {
      interval: 30,
    },
    documentation: "https://www.postgresql.org/docs/",
  },
  {
    id: "redis",
    name: "redis",
    displayName: "Redis",
    description: "高性能内存数据库，支持缓存、消息队列、会话存储等场景",
    type: "infrastructure",
    version: "7.0",
    author: "Redis Ltd.",
    icon: "Zap",
    dockerImage: "redis",
    dockerTag: "7-alpine",
    defaultPort: 6379,
    containerPort: 6379,
    dataVolume: "/data",
    envTemplate: {},
    configFields: [
      {
        name: "port",
        label: "端口",
        type: "number",
        required: false,
        default: 6379,
      },
      {
        name: "password",
        label: "密码",
        type: "password",
        required: false,
        placeholder: "可选，设置访问密码",
        description: "留空则不设置密码认证",
      },
      {
        name: "maxMemory",
        label: "最大内存 (MB)",
        type: "number",
        required: false,
        default: 256,
        description: "Redis 可使用的最大内存",
      },
    ],
    healthCheck: {
      interval: 30,
    },
    documentation: "https://redis.io/docs/",
  },
  {
    id: "minio",
    name: "minio",
    displayName: "MinIO",
    description: "高性能对象存储服务，兼容 S3 API，适用于文件存储和备份",
    type: "infrastructure",
    version: "latest",
    author: "MinIO, Inc.",
    icon: "HardDrive",
    dockerImage: "minio/minio",
    dockerTag: "latest",
    defaultPort: 9000,
    containerPort: 9000,
    dataVolume: "/data",
    envTemplate: {
      MINIO_ROOT_USER: "{{accessKey}}",
      MINIO_ROOT_PASSWORD: "{{secretKey}}",
    },
    configFields: [
      {
        name: "accessKey",
        label: "Access Key",
        type: "text",
        required: true,
        default: "minioadmin",
        placeholder: "minioadmin",
      },
      {
        name: "secretKey",
        label: "Secret Key",
        type: "password",
        required: true,
        placeholder: "设置 Secret Key",
        description: "至少 8 个字符",
      },
      {
        name: "apiPort",
        label: "API 端口",
        type: "number",
        required: false,
        default: 9000,
      },
      {
        name: "consolePort",
        label: "控制台端口",
        type: "number",
        required: false,
        default: 9001,
      },
    ],
    healthCheck: {
      endpoint: "/minio/health/live",
      interval: 30,
    },
    documentation: "https://min.io/docs/minio/container/index.html",
  },
  {
    id: "nginx",
    name: "nginx",
    displayName: "Nginx",
    description: "高性能 Web 服务器和反向代理，适用于负载均衡和静态文件服务",
    type: "infrastructure",
    version: "1.25",
    author: "Nginx, Inc.",
    icon: "Globe",
    dockerImage: "nginx",
    dockerTag: "alpine",
    defaultPort: 80,
    containerPort: 80,
    dataVolume: "/usr/share/nginx/html",
    envTemplate: {},
    configFields: [
      {
        name: "httpPort",
        label: "HTTP 端口",
        type: "number",
        required: false,
        default: 80,
      },
      {
        name: "httpsPort",
        label: "HTTPS 端口",
        type: "number",
        required: false,
        default: 443,
      },
    ],
    healthCheck: {
      endpoint: "/",
      interval: 30,
    },
    documentation: "https://nginx.org/en/docs/",
  },
];

/**
 * 根据 ID 获取插件定义
 */
export function getPluginDefinition(id: string): PluginDefinition | undefined {
  return PLUGIN_REGISTRY.find(p => p.id === id);
}

/**
 * 获取所有插件定义
 */
export function getAllPluginDefinitions(): PluginDefinition[] {
  return PLUGIN_REGISTRY;
}

/**
 * 根据类型筛选插件
 */
export function getPluginsByType(type: PluginDefinition["type"]): PluginDefinition[] {
  return PLUGIN_REGISTRY.filter(p => p.type === type);
}
