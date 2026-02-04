# OpenClaw Cloud API 文档

OpenClaw Cloud 提供基于 tRPC 的类型安全 API，支持实例管理、技能管理、插件管理等功能。

## API 概述

### 基础信息

- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **认证方式**: JWT Token / OAuth
- **API 风格**: tRPC (类型安全的 RPC)

### 基础 URL

```
开发环境: http://localhost:3000/api/trpc
生产环境: https://your-domain.com/api/trpc
```

## 认证

### 获取访问令牌

如果使用 Manus OAuth：

1. 重定向用户到认证页面
2. 用户完成认证后，系统自动获取令牌
3. 令牌存储在 HTTP-only Cookie 中

### 使用令牌

所有 API 请求自动携带认证 Cookie，无需手动添加。

## API 端点

### 实例管理 (Instances)

#### 获取所有实例

```typescript
// tRPC 调用
const instances = await trpc.instances.getAll.query();

// 返回类型
interface Instance {
  id: number;
  name: string;
  description: string | null;
  status: 'running' | 'stopped' | 'error';
  port: number | null;
  config: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 获取单个实例

```typescript
const instance = await trpc.instances.getById.query({ id: 1 });
```

#### 创建实例

```typescript
const newInstance = await trpc.instances.create.mutate({
  name: 'my-instance',
  description: 'My OpenClaw instance',
  config: {
    llmProvider: 'deepseek',
    apiKey: 'your-api-key'
  }
});
```

#### 更新实例

```typescript
const updated = await trpc.instances.update.mutate({
  id: 1,
  name: 'updated-name',
  description: 'Updated description'
});
```

#### 删除实例

```typescript
await trpc.instances.delete.mutate({ id: 1 });
```

#### 启动实例

```typescript
await trpc.instances.start.mutate({ id: 1 });
```

#### 停止实例

```typescript
await trpc.instances.stop.mutate({ id: 1 });
```

### 技能管理 (Skills)

#### 获取所有技能

```typescript
const skills = await trpc.skills.getAll.query();

// 返回类型
interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  author: string | null;
  sourceUrl: string | null;
  docsUrl: string | null;
  downloads: number;
  rating: number;
  isBuiltin: boolean;
  isCustom: boolean;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 搜索技能

```typescript
const results = await trpc.skills.search.query({
  query: 'coding',
  category: 'development'
});
```

#### 获取技能详情

```typescript
const skill = await trpc.skills.getById.query({ id: 1 });
```

#### 创建自定义技能

```typescript
const customSkill = await trpc.skills.createCustom.mutate({
  name: 'my-custom-skill',
  description: 'A custom skill',
  category: 'productivity',
  content: '# My Skill\n\nSkill content in markdown...'
});
```

#### 更新自定义技能

```typescript
await trpc.skills.updateCustom.mutate({
  id: 1,
  name: 'updated-skill',
  content: '# Updated Content'
});
```

#### 删除自定义技能

```typescript
await trpc.skills.deleteCustom.mutate({ id: 1 });
```

#### 安装技能到实例

```typescript
await trpc.skills.install.mutate({
  skillId: 1,
  instanceId: 1
});
```

#### 卸载技能

```typescript
await trpc.skills.uninstall.mutate({
  skillId: 1,
  instanceId: 1
});
```

#### 同步技能库

```typescript
await trpc.skills.sync.mutate();
```

### 插件管理 (Plugins)

#### 获取所有插件

```typescript
const plugins = await trpc.plugins.getAll.query();

// 返回类型
interface Plugin {
  id: number;
  name: string;
  displayName: string;
  type: 'channel' | 'deployment' | 'monitoring' | 'skill-provider';
  version: string;
  description: string;
  author: string;
  configSchema: Record<string, any>;
  config: Record<string, any> | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 获取插件详情

```typescript
const plugin = await trpc.plugins.getById.query({ id: 1 });
```

#### 安装插件

```typescript
await trpc.plugins.install.mutate({
  name: 'matrix-channel',
  displayName: 'Matrix Channel',
  type: 'channel',
  version: '1.0.0',
  description: 'Matrix protocol support',
  author: 'OpenClaw',
  configSchema: { /* ... */ }
});
```

#### 配置插件

```typescript
await trpc.plugins.configure.mutate({
  id: 1,
  config: {
    homeserverUrl: 'https://matrix.org',
    accessToken: 'your-token'
  }
});
```

#### 启用/禁用插件

```typescript
await trpc.plugins.setEnabled.mutate({
  id: 1,
  enabled: true
});
```

#### 卸载插件

```typescript
await trpc.plugins.uninstall.mutate({ id: 1 });
```

### 收藏集管理 (Collections)

#### 获取所有收藏集

```typescript
const collections = await trpc.collections.getAll.query();

// 返回类型
interface Collection {
  id: number;
  name: string;
  description: string | null;
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 创建收藏集

```typescript
const collection = await trpc.collections.create.mutate({
  name: 'My Collection',
  description: 'A collection of useful skills',
  skillIds: [1, 2, 3]
});
```

#### 更新收藏集

```typescript
await trpc.collections.update.mutate({
  id: 1,
  name: 'Updated Collection',
  skillIds: [1, 2, 3, 4]
});
```

#### 删除收藏集

```typescript
await trpc.collections.delete.mutate({ id: 1 });
```

#### 批量安装收藏集技能

```typescript
await trpc.collections.installAll.mutate({
  collectionId: 1,
  instanceId: 1
});
```

### AI 对话 (Chat)

#### 发送消息

```typescript
const response = await trpc.chat.sendMessage.mutate({
  instanceId: 1,
  message: 'Hello, how can you help me?'
});

// 返回类型
interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: Date;
}
```

#### 获取对话历史

```typescript
const history = await trpc.chat.getHistory.query({
  instanceId: 1,
  limit: 50
});
```

#### 清除对话历史

```typescript
await trpc.chat.clearHistory.mutate({ instanceId: 1 });
```

## 错误处理

### 错误格式

```typescript
interface TRPCError {
  code: string;
  message: string;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
  };
}
```

### 常见错误码

| 错误码 | HTTP 状态码 | 描述 |
|--------|-------------|------|
| `UNAUTHORIZED` | 401 | 未认证或令牌无效 |
| `FORBIDDEN` | 403 | 无权限访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `BAD_REQUEST` | 400 | 请求参数错误 |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器内部错误 |

### 错误处理示例

```typescript
try {
  const instance = await trpc.instances.getById.query({ id: 999 });
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Instance not found');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 前端集成

### React Query 集成

OpenClaw Cloud 使用 tRPC 与 React Query 集成：

```typescript
import { trpc } from '@/lib/trpc';

function InstanceList() {
  const { data: instances, isLoading, error } = trpc.instances.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {instances?.map(instance => (
        <li key={instance.id}>{instance.name}</li>
      ))}
    </ul>
  );
}
```

### Mutation 示例

```typescript
function CreateInstanceButton() {
  const utils = trpc.useUtils();
  const createInstance = trpc.instances.create.useMutation({
    onSuccess: () => {
      utils.instances.getAll.invalidate();
    }
  });

  return (
    <button
      onClick={() => createInstance.mutate({
        name: 'new-instance',
        description: 'A new instance'
      })}
      disabled={createInstance.isPending}
    >
      {createInstance.isPending ? 'Creating...' : 'Create Instance'}
    </button>
  );
}
```

## WebSocket 支持

对于实时功能（如 AI 对话），OpenClaw Cloud 支持 WebSocket 连接：

```typescript
// WebSocket 连接用于实时对话
const ws = new WebSocket('wss://your-domain.com/api/chat');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.send(JSON.stringify({
  type: 'message',
  instanceId: 1,
  content: 'Hello!'
}));
```

## 速率限制

API 有以下速率限制：

| 端点类型 | 限制 |
|----------|------|
| 读取操作 | 100 次/分钟 |
| 写入操作 | 30 次/分钟 |
| AI 对话 | 20 次/分钟 |

超过限制将返回 `429 Too Many Requests` 错误。

## 版本控制

API 版本通过 URL 路径控制：

- 当前版本: `/api/trpc` (v1)
- 未来版本: `/api/v2/trpc`

## 更多资源

- [tRPC 官方文档](https://trpc.io/docs)
- [React Query 文档](https://tanstack.com/query/latest)
- [OpenClaw Cloud GitHub](https://github.com/yourusername/openclaw-cloud)
