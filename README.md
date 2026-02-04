# ☁️ OpenClaw Cloud

**让 AI 智能体真正"活"起来。一次部署，全平台对话——Element、Telegram、Discord、Slack 无缝切换。技能即插即用，基础设施一键拉起，让你专注于创造，而非配置。**

**The command center for your AI Agent fleet.** Orchestrate intelligent agents with enterprise-grade infrastructure, seamless skill composition, and unified multi-channel presence.

---
![OpenClaw Cloud Dashboard](docs/images/dashboard.webp)

## ✨ 为什么选择 OpenClaw Cloud？

OpenClaw Cloud 不仅仅是一个管理面板，它是一个为 AI Agent 生态设计的统一调度中枢。我们为你解决繁琐的部署、配置和集成问题，让你能专注于 Agent 核心能力的创造。

- **🚀 云原生架构, 一键部署**: 忘记复杂的环境配置。通过 Docker 一键拉起完整、独立的 Agent 实例，每个实例都拥有自己的运行时和数据存储。
- **💬 全渠道对话, 无缝切换**: 在你最喜欢的平台与 Agent 交流。无论是 Element、Telegram 还是 Discord，都能获得一致的实时对话体验。
- **🧩 技能即插即用, 无限定制**: 从拥有 700+ 技能的 ClawHub 市场一键安装社区技能，或创建你自己的私有技能，即时生效，无需重启。
- **🔧 统一管理, 运筹帷幄**: 在一个清爽、直观的界面中监控所有 Agent 实例的状态、管理技能和插件、查看对话历史。
- **🔐 安全隔离, 数据私有**: 每个 Agent 实例都运行在隔离的环境中，确保数据安全和隐私。
- **🌍 开源开放, 社区驱动**: 100% 开源，你可以自由修改、部署，并与全球开发者社区共同构建下一代 AI Agent 生态。

## 🏗️ 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS 4
- **后端**: Node.js + Express + tRPC 11
- **数据库**: MySQL/TiDB with Drizzle ORM
- **认证**: Manus OAuth (可轻松替换)
- **核心**: Docker, pnpm

## 🚀 快速开始

### 环境准备

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose
- MySQL 8+ 或 TiDB

### 本地部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclaw-cloud.git
   cd openclaw-cloud
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   复制 `.env.example` 文件并重命名为 `.env`，然后根据你的环境（数据库、认证信息等）修改其中的配置。
   ```bash
   cp .env.example .env
   ```

4. **初始化数据库**
   ```bash
   pnpm db:push
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

现在，应用应该已经在 `http://localhost:3000` 上运行了！

## 📚 文档

我们提供了详尽的文档来帮助你更好地使用和开发 OpenClaw Cloud。

- **[用户手册](./docs/user-manual.md)**: 从零开始，学习如何使用平台的所有核心功能。
- **[部署指南](./docs/deployment.md)**: 如何将 OpenClaw Cloud 部署到生产环境。
- **[插件开发](./docs/plugin-development.md)**: 学习如何创建自己的插件来扩展平台功能。
- **[技能编写](./docs/skill-writing-guide.md)**: 学习如何为 OpenClaw Agent 编写技能。
- **[API 参考](./docs/api.md)**: 后端 tRPC API 的详细文档。

## 🤝 贡献

我们热烈欢迎来自社区的任何贡献！无论是功能建议、代码提交还是文档改进，都是对项目的重要支持。

请在开始前阅读我们的 **[贡献指南](./CONTRIBUTING.md)**。

## 📄 开源许可

本项目基于 [MIT License](./LICENSE) 开源。
