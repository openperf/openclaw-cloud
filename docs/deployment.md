# OpenClaw Cloud 部署指南

本文档提供OpenClaw Cloud的完整部署说明，包括本地开发、Docker部署和生产环境部署。

## 📋 系统要求

### 最低要求
- **操作系统**: Linux (Ubuntu 20.04+), macOS 10.15+, Windows 10+ (with WSL2)
- **Node.js**: 22.0.0 或更高版本
- **pnpm**: 10.0.0 或更高版本
- **数据库**: MySQL 8.0+ 或 TiDB
- **内存**: 至少 2GB RAM
- **磁盘**: 至少 5GB 可用空间

### 推荐配置
- **CPU**: 4核心或更多
- **内存**: 8GB RAM 或更多
- **磁盘**: 20GB SSD 或更多
- **网络**: 稳定的互联网连接

## 🚀 快速开始（Docker Compose）

这是最简单的部署方式，适合快速体验和开发环境。

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/openclaw-cloud.git
cd openclaw-cloud
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**必须配置的变量**：

```env
# 数据库密码（请修改为强密码）
DB_ROOT_PASSWORD=your_strong_root_password
DB_PASSWORD=your_strong_db_password

# JWT密钥（请生成随机字符串）
JWT_SECRET=your_random_jwt_secret_at_least_32_characters

# 应用端口
APP_PORT=3000
```

**生成随机密钥的方法**：

```bash
# 生成JWT密钥
openssl rand -base64 32

# 或使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 4. 初始化数据库

```bash
# 进入应用容器
docker-compose exec app sh

# 运行数据库迁移
pnpm db:push

# 退出容器
exit
```

### 5. 访问应用

打开浏览器访问: `http://localhost:3000`

### 6. 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

## 💻 本地开发部署

适合开发和调试。

### 1. 安装依赖

```bash
# 安装Node.js 22+
# 访问 https://nodejs.org/ 下载安装

# 安装pnpm
npm install -g pnpm

# 克隆项目
git clone https://github.com/yourusername/openclaw-cloud.git
cd openclaw-cloud

# 安装项目依赖
pnpm install
```

### 2. 配置数据库

**选项A: 使用Docker运行MySQL**

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

安装MySQL 8.0+，然后创建数据库：

```sql
CREATE DATABASE openclaw_cloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'openclaw'@'localhost' IDENTIFIED BY 'openclaw_pass';
GRANT ALL PRIVILEGES ON openclaw_cloud.* TO 'openclaw'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL=mysql://openclaw:openclaw_pass@localhost:3306/openclaw_cloud
JWT_SECRET=your_random_jwt_secret
NODE_ENV=development
```

### 4. 初始化数据库

```bash
# 生成并应用数据库迁移
pnpm db:push
```

### 5. 启动开发服务器

```bash
# 启动开发服务器（支持热重载）
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 6. 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并监听变化
pnpm test --watch

# 查看测试覆盖率
pnpm test --coverage
```

## 🏭 生产环境部署

适合生产环境使用。

### 方式一：使用Docker Compose（推荐）

1. **准备服务器**

确保服务器已安装：
- Docker 20.10+
- Docker Compose 2.0+

2. **上传项目文件**

```bash
# 在本地打包项目
tar -czf openclaw-cloud.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  openclaw-cloud/

# 上传到服务器
scp openclaw-cloud.tar.gz user@your-server:/opt/

# 在服务器上解压
ssh user@your-server
cd /opt
tar -xzf openclaw-cloud.tar.gz
cd openclaw-cloud
```

3. **配置生产环境变量**

```bash
# 创建 .env 文件
nano .env
```

**生产环境配置示例**：

```env
# 数据库配置（使用强密码）
DB_ROOT_PASSWORD=<strong-random-password>
DB_PASSWORD=<strong-random-password>
DB_NAME=openclaw_cloud
DB_USER=openclaw
DB_PORT=3306

# 应用配置
APP_PORT=3000
NODE_ENV=production

# 安全配置（必须修改）
JWT_SECRET=<generate-a-strong-random-secret>

# 如果使用Manus认证，配置以下变量
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name
```

4. **启动服务**

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f app

# 等待服务启动完成
docker-compose ps
```

5. **配置反向代理（Nginx）**

创建Nginx配置文件 `/etc/nginx/sites-available/openclaw-cloud`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 代理配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 客户端最大上传大小
    client_max_body_size 100M;
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/openclaw-cloud /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

6. **配置SSL证书（Let's Encrypt）**

```bash
# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

7. **配置防火墙**

```bash
# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

### 方式二：传统部署

1. **安装依赖**

```bash
# 安装Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装pnpm
sudo npm install -g pnpm

# 安装MySQL
sudo apt update
sudo apt install mysql-server
```

2. **配置MySQL**

```bash
# 安全配置
sudo mysql_secure_installation

# 创建数据库
sudo mysql -u root -p
```

```sql
CREATE DATABASE openclaw_cloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'openclaw'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON openclaw_cloud.* TO 'openclaw'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **部署应用**

```bash
# 克隆项目
cd /opt
git clone https://github.com/yourusername/openclaw-cloud.git
cd openclaw-cloud

# 安装依赖
pnpm install --frozen-lockfile

# 配置环境变量
nano .env

# 构建应用
pnpm build

# 初始化数据库
pnpm db:push
```

4. **使用PM2管理进程**

```bash
# 安装PM2
sudo npm install -g pm2

# 启动应用
pm2 start npm --name "openclaw-cloud" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs openclaw-cloud

# 监控
pm2 monit
```

## 🔧 配置说明

### 数据库配置

**DATABASE_URL格式**:
```
mysql://用户名:密码@主机:端口/数据库名
```

**示例**:
```env
# 本地MySQL
DATABASE_URL=mysql://openclaw:password@localhost:3306/openclaw_cloud

# 远程MySQL
DATABASE_URL=mysql://openclaw:password@192.168.1.100:3306/openclaw_cloud

# TiDB Cloud
DATABASE_URL=mysql://user:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/openclaw_cloud?ssl={"rejectUnauthorized":true}
```

### 认证配置

OpenClaw Cloud支持两种认证方式：

1. **Manus OAuth（推荐）**

配置以下环境变量：
```env
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name
```

2. **自定义认证**

如果不使用Manus OAuth，可以修改 `server/_core/auth.ts` 实现自定义认证逻辑。

### 端口配置

默认端口是3000，可以通过环境变量修改：

```env
APP_PORT=8080
```

如果使用Docker Compose，还需要修改 `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"
```

## 🔍 故障排查

### 数据库连接失败

**问题**: `Error: connect ECONNREFUSED`

**解决方案**:
1. 检查MySQL是否运行: `docker-compose ps` 或 `sudo systemctl status mysql`
2. 检查DATABASE_URL配置是否正确
3. 检查防火墙是否允许数据库端口
4. 检查数据库用户权限

### 应用无法启动

**问题**: 应用启动后立即退出

**解决方案**:
1. 查看日志: `docker-compose logs app` 或 `pm2 logs`
2. 检查环境变量配置
3. 检查端口是否被占用: `lsof -i :3000`
4. 检查数据库迁移是否完成: `pnpm db:push`

### 前端无法访问后端API

**问题**: 前端显示网络错误

**解决方案**:
1. 检查CORS配置
2. 检查反向代理配置
3. 检查防火墙规则
4. 检查SSL证书配置

### Docker构建失败

**问题**: `docker-compose build` 失败

**解决方案**:
1. 清理Docker缓存: `docker system prune -a`
2. 检查Dockerfile语法
3. 检查网络连接
4. 增加Docker内存限制

## 📊 监控和维护

### 日志管理

**Docker Compose**:
```bash
# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app

# 查看最近100行日志
docker-compose logs --tail=100 app
```

**PM2**:
```bash
# 查看日志
pm2 logs openclaw-cloud

# 清空日志
pm2 flush
```

### 备份数据库

**自动备份脚本**:

创建 `/opt/backup-openclaw.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/openclaw"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/openclaw_cloud_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec -T db mysqldump -u openclaw -popenclaw_pass openclaw_cloud > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除30天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

设置定时任务:

```bash
# 编辑crontab
crontab -e

# 添加每天凌晨2点备份
0 2 * * * /opt/backup-openclaw.sh
```

### 恢复数据库

```bash
# 解压备份
gunzip openclaw_cloud_20260201_020000.sql.gz

# 恢复数据库
docker-compose exec -T db mysql -u openclaw -popenclaw_pass openclaw_cloud < openclaw_cloud_20260201_020000.sql
```

### 更新应用

```bash
# 停止服务
docker-compose down

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 运行数据库迁移（如果有）
docker-compose exec app pnpm db:push
```

## 🔐 安全建议

1. **使用强密码**: 所有密码应至少16个字符，包含大小写字母、数字和特殊字符
2. **启用HTTPS**: 生产环境必须使用SSL/TLS加密
3. **定期更新**: 及时更新依赖包和系统补丁
4. **限制访问**: 使用防火墙限制数据库端口访问
5. **备份数据**: 定期备份数据库和重要文件
6. **监控日志**: 定期检查应用和系统日志
7. **最小权限**: 使用专用用户运行应用，不要使用root

## 📞 获取帮助

如果遇到问题：

1. 查看[常见问题](./faq.md)
2. 搜索[GitHub Issues](https://github.com/yourusername/openclaw-cloud/issues)
3. 加入[Discord社区](https://discord.gg/openclaw)
4. 提交[新Issue](https://github.com/yourusername/openclaw-cloud/issues/new)

## 📝 下一步

部署完成后，您可以：

1. 阅读[用户指南](./user-guide.md)了解如何使用
2. 阅读[插件开发指南](./plugin-development.md)了解如何开发插件
3. 查看[API文档](./api.md)了解API接口
4. 浏览[示例项目](../examples/)获取灵感
