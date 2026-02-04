# OpenClaw Cloud - 快速开始指南

本指南帮助您在5分钟内完成OpenClaw Cloud的本地部署。

## 📋 前置要求

- Docker 20.10+ 和 Docker Compose 2.0+
- 或 Node.js 22+ 和 pnpm 10+

## 🚀 方式一：Docker Compose（推荐）

### 1. 解压项目

```bash
tar -xzf openclaw-cloud-package.tar.gz
cd openclaw-cloud
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cat > .env << 'EOF'
# 数据库配置
DB_ROOT_PASSWORD=openclaw_root_2026
DB_PASSWORD=openclaw_pass_2026
DB_NAME=openclaw_cloud
DB_USER=openclaw
DB_PORT=3306

# 应用配置
APP_PORT=3000
NODE_ENV=production

# 安全配置（生产环境请修改）
JWT_SECRET=your_random_jwt_secret_please_change_this_in_production
EOF
```

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看启动日志
docker-compose logs -f
```

### 4. 初始化数据库

```bash
# 等待数据库启动（约10秒）
sleep 10

# 进入应用容器
docker-compose exec app sh

# 运行数据库迁移
pnpm db:push

# 退出容器
exit
```

### 5. 访问应用

打开浏览器访问: http://localhost:3000

### 停止服务

```bash
docker-compose down
```

## 💻 方式二：本地开发

### 1. 解压项目

```bash
tar -xzf openclaw-cloud-package.tar.gz
cd openclaw-cloud
```

### 2. 安装依赖

```bash
# 安装pnpm（如果未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 启动MySQL

**选项A: 使用Docker**

```bash
docker run -d \
  --name openclaw-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=openclaw_cloud \
  -e MYSQL_USER=openclaw \
  -e MYSQL_PASSWORD=openclaw_pass \
  -p 3306:3306 \
  mysql:8.0
```

**选项B: 使用本地MySQL**

创建数据库：

```sql
CREATE DATABASE openclaw_cloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'openclaw'@'localhost' IDENTIFIED BY 'openclaw_pass';
GRANT ALL PRIVILEGES ON openclaw_cloud.* TO 'openclaw'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 配置环境变量

```bash
cat > .env << 'EOF'
DATABASE_URL=mysql://openclaw:openclaw_pass@localhost:3306/openclaw_cloud
JWT_SECRET=your_random_jwt_secret
NODE_ENV=development
EOF
```

### 5. 初始化数据库

```bash
pnpm db:push
```

### 6. 启动开发服务器

```bash
pnpm dev
```

应用将在 http://localhost:3000 启动。

## 🎯 下一步

1. **阅读文档**
   - [用户指南](./docs/user-guide.md) - 了解如何使用平台
   - [部署文档](./docs/deployment.md) - 生产环境部署指南
   - [插件开发](./docs/plugin-development.md) - 开发自定义插件

2. **创建第一个实例**
   - 登录后在Dashboard点击"Create Instance"
   - 填写实例名称和描述
   - 点击"Create"完成创建

3. **浏览Skills市场**
   - 点击侧边栏的"Skills"
   - 浏览700+个社区Skills
   - 安装您需要的Skills

## ❓ 常见问题

### 端口被占用

如果3306或3000端口被占用，修改`.env`文件：

```env
DB_PORT=3307
APP_PORT=8080
```

然后修改`docker-compose.yml`中的端口映射。

### 数据库连接失败

1. 检查MySQL是否运行：`docker-compose ps`
2. 检查DATABASE_URL配置
3. 等待数据库完全启动（约10-15秒）

### 应用无法启动

1. 查看日志：`docker-compose logs app`
2. 检查环境变量配置
3. 确认数据库迁移已完成

## 📞 获取帮助

- 文档: [docs/](./docs/)
- GitHub: https://github.com/yourusername/openclaw-cloud
- Discord: https://discord.gg/openclaw
- Issues: https://github.com/yourusername/openclaw-cloud/issues

---

**祝您使用愉快！** 🎉
