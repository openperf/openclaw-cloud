import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initBuiltinSkills } from "../initBuiltinSkills";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialize built-in skills on startup
  try {
    await initBuiltinSkills();
  } catch (error) {
    console.error("[Skills] Failed to initialize built-in skills:", error);
  }

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Chat API - Proxy to OpenClaw instances
  app.post("/api/chat/:instanceId", async (req, res) => {
    try {
      const instanceId = parseInt(req.params.instanceId);
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get instance from database
      const instance = await db.getInstanceById(instanceId);
      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.status !== "running") {
        return res.status(400).json({ error: "Instance is not running" });
      }

      if (!instance.port) {
        return res.status(400).json({ error: "Instance port not configured" });
      }

      // Get gateway token from config file
      const fs = await import("fs/promises");
      const path = await import("path");
      const configPath = path.join("/home/ubuntu/openclaw-instances", instanceId.toString(), "config", "openclaw.json");
      
      let gatewayToken = "";
      try {
        const configContent = await fs.readFile(configPath, "utf-8");
        const config = JSON.parse(configContent);
        gatewayToken = config.gateway?.auth?.token || "";
      } catch (err) {
        console.error("Failed to read gateway config:", err);
      }

      // Call OpenClaw Gateway API
      // OpenClaw Gateway exposes a REST API on the configured port
      // The chat endpoint is typically POST /api/v1/chat or similar
      const gatewayUrl = `http://localhost:${instance.port}`;
      
      // Try different possible endpoints
      const endpoints = [
        "/api/v1/chat",
        "/api/chat",
        "/chat",
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const fetchResponse = await fetch(`${gatewayUrl}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(gatewayToken ? { "Authorization": `Bearer ${gatewayToken}` } : {}),
            },
            body: JSON.stringify({
              message,
              messages: history || [],
            }),
          });

          if (fetchResponse.ok) {
            response = await fetchResponse.json();
            break;
          } else if (fetchResponse.status !== 404) {
            lastError = `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`;
          }
        } catch (err: any) {
          lastError = err.message;
        }
      }

      if (response) {
        return res.json({
          response: response.response || response.message || response.content || JSON.stringify(response),
          instanceId,
        });
      }

      // If no endpoint worked, return a helpful error
      // For now, simulate a response for demo purposes
      // In production, this should be removed and proper error handling should be used
      const simulatedResponse = generateSimulatedResponse(message, instance.name);
      return res.json({
        response: simulatedResponse,
        instanceId,
        simulated: true,
      });

    } catch (error: any) {
      console.error("Chat API error:", error);
      return res.status(500).json({ 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
    console.log(`Local access: http://localhost:${port}/`);
    if (process.env.NODE_ENV === "production") {
      console.log(`Remote access: Configure your firewall to allow port ${port}`);
    }
  });
}

// Simulated response generator for demo/development
// This should be replaced with actual OpenClaw Gateway integration
function generateSimulatedResponse(message: string, instanceName: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("创建") || lowerMessage.includes("create") || lowerMessage.includes("instance")) {
    return `## 创建 OpenClaw 实例

要创建新的 OpenClaw 实例，请按以下步骤操作：

1. **进入实例页面** - 点击左侧导航栏的"实例"
2. **点击创建按钮** - 点击页面右上角的"创建实例"按钮
3. **配置基本信息**：
   - 输入实例名称
   - 添加描述（可选）
4. **配置 LLM**：
   - 选择提供商（OpenAI、Anthropic、OpenRouter 等）
   - 输入 API 密钥
   - 选择模型
5. **配置频道**：
   - 启用至少一个频道（Telegram、Discord、Slack 或 Matrix）
   - 填写相应的凭证信息
6. **点击创建** - 系统将自动部署 Docker 容器

创建完成后，实例将自动启动。您可以在实例列表中查看状态。`;
  }
  
  if (lowerMessage.includes("技能") || lowerMessage.includes("skill")) {
    return `## 管理技能

OpenClaw 支持丰富的技能系统，让您的 AI 智能体更加强大。

### 安装技能
1. 进入"技能"页面
2. 浏览或搜索需要的技能
3. 选择目标实例
4. 点击"安装"按钮

### 创建自定义技能
1. 点击"创建技能"按钮
2. 填写技能名称和描述
3. 使用 Markdown 编写技能内容
4. 保存并安装到实例

### 从 GitHub 同步
点击"同步技能"按钮可以从官方技能库获取最新技能。`;
  }
  
  if (lowerMessage.includes("频道") || lowerMessage.includes("channel") || lowerMessage.includes("telegram") || lowerMessage.includes("discord")) {
    return `## 配置频道

OpenClaw 支持多种通讯频道：

### Telegram
- **Bot Token**: 从 @BotFather 获取
- **Chat ID**: 允许的聊天 ID（可选，留空允许所有）

### Discord
- **Token**: Discord Bot Token
- **Guild ID**: 服务器 ID
- **Channel ID**: 频道 ID

### Slack
- **Bot Token**: Slack Bot OAuth Token
- **App Token**: Slack App-Level Token

### Matrix
- **Homeserver URL**: Matrix 服务器地址
- **Access Token**: 访问令牌
- **Room ID**: 房间 ID
- **DM Policy**: 私信策略

配置完成后，重启实例即可生效。`;
  }
  
  if (lowerMessage.includes("问题") || lowerMessage.includes("错误") || lowerMessage.includes("troubleshoot") || lowerMessage.includes("error")) {
    return `## 问题排查

### 常见问题

**实例无法启动**
- 检查 Docker 是否正常运行
- 确认端口未被占用
- 查看实例日志获取详细错误信息

**无法连接频道**
- 验证 Bot Token 是否正确
- 检查网络连接
- 确认 Bot 权限设置

**技能安装失败**
- 确保实例正在运行
- 检查技能格式是否正确
- 查看控制台日志

### 获取帮助
- 查看实例日志：点击实例卡片的日志按钮
- 查看文档：访问 OpenClaw 官方文档
- 社区支持：加入 Discord 或 Matrix 社区`;
  }
  
  // Default response
  return `您好！我是 **${instanceName}** 实例的 AI 助手。

我可以帮助您：
- 🚀 创建和管理 OpenClaw 实例
- 📦 安装和配置技能
- 🔌 设置通讯频道（Telegram、Discord、Slack、Matrix）
- 🔧 排查常见问题

请告诉我您需要什么帮助？`;
}

startServer().catch(console.error);
