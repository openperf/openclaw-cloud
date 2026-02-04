# 贡献指南

感谢您对 OpenClaw Cloud 的关注！我们欢迎任何形式的贡献，包括但不限于：

- 报告 Bug
- 提交功能建议
- 改进文档
- 提交代码修复
- 开发新功能

## 行为准则

参与本项目即表示您同意遵守我们的行为准则：

- **尊重他人** - 对所有参与者保持尊重和友善
- **建设性沟通** - 提供建设性的反馈和建议
- **包容性** - 欢迎来自不同背景的贡献者
- **专业态度** - 保持专业的讨论氛围

## 如何贡献

### 报告 Bug

1. 在 [GitHub Issues](https://github.com/yourusername/openclaw-cloud/issues) 搜索是否已有相关问题
2. 如果没有，创建新的 Issue
3. 使用 Bug 报告模板，提供以下信息：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、Node.js 版本等）
   - 相关日志或截图

### 提交功能建议

1. 在 [GitHub Issues](https://github.com/yourusername/openclaw-cloud/issues) 搜索是否已有相关建议
2. 如果没有，创建新的 Issue
3. 使用功能请求模板，描述：
   - 功能概述
   - 使用场景
   - 预期实现方式
   - 可能的替代方案

### 提交代码

#### 开发环境设置

1. Fork 本仓库
2. 克隆您的 Fork：
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclaw-cloud.git
   cd openclaw-cloud
   ```
3. 添加上游仓库：
   ```bash
   git remote add upstream https://github.com/yourusername/openclaw-cloud.git
   ```
4. 安装依赖：
   ```bash
   pnpm install
   ```
5. 创建功能分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### 代码规范

- **TypeScript** - 使用 TypeScript 编写所有代码
- **ESLint** - 遵循项目的 ESLint 配置
- **Prettier** - 使用 Prettier 格式化代码
- **命名规范** - 使用有意义的变量和函数名
- **注释** - 为复杂逻辑添加注释

#### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型（type）：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式（不影响功能）
- `refactor` - 代码重构
- `test` - 测试相关
- `chore` - 构建/工具相关

示例：
```
feat(skills): add skill import/export functionality

- Add export button to skill card
- Add import dialog with file upload
- Support markdown files with frontmatter

Closes #123
```

#### 提交 Pull Request

1. 确保代码通过所有测试：
   ```bash
   pnpm test
   ```
2. 确保代码通过 lint 检查：
   ```bash
   pnpm lint
   ```
3. 推送到您的 Fork：
   ```bash
   git push origin feature/your-feature-name
   ```
4. 在 GitHub 上创建 Pull Request
5. 填写 PR 模板，描述您的更改
6. 等待代码审查

### 改进文档

文档位于 `docs/` 目录，使用 Markdown 格式。欢迎：

- 修复错别字和语法错误
- 改进描述和示例
- 添加缺失的文档
- 翻译文档

## 开发指南

### 项目结构

```
openclaw-cloud/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── lib/           # 工具函数
│   │   └── pages/         # 页面组件
├── server/                 # 后端代码
│   ├── routers.ts         # tRPC 路由
│   ├── storage.ts         # 数据存储
│   └── ...
├── shared/                 # 共享代码
├── docs/                   # 文档
└── ...
```

### 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS 4
- **后端**: Node.js + Express + tRPC 11
- **数据库**: MySQL/TiDB + Drizzle ORM
- **构建工具**: Vite

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test -- --grep "test name"

# 查看测试覆盖率
pnpm test --coverage
```

### 调试

1. 使用 VS Code 的调试功能
2. 在代码中添加 `console.log` 或 `debugger`
3. 使用浏览器开发者工具

## 发布流程

维护者负责发布新版本：

1. 更新版本号
2. 更新 CHANGELOG
3. 创建 Git 标签
4. 发布到 npm（如适用）

## 获取帮助

如果您在贡献过程中遇到问题：

- 查看 [文档](./docs/)
- 在 [Discord](https://discord.gg/openclaw) 提问
- 创建 [GitHub Issue](https://github.com/yourusername/openclaw-cloud/issues)

## 致谢

感谢所有贡献者的付出！您的贡献使 OpenClaw Cloud 变得更好。

---

再次感谢您的贡献！🎉
