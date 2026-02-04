# OpenClaw Cloud 远程访问配置指南

本文档说明如何配置OpenClaw Cloud以支持远程访问。

## 🌐 服务器配置

OpenClaw Cloud默认监听`0.0.0.0`，这意味着它可以接受来自任何网络接口的连接。

### 查看监听状态

启动服务器后，您会看到类似的输出：

```
Server running on http://0.0.0.0:3000/
Local access: http://localhost:3000/
```

这表示服务器正在监听所有网络接口。

## 🔥 防火墙配置

### Ubuntu/Debian (UFW)

```bash
# 允许3000端口
sudo ufw allow 3000/tcp

# 查看防火墙状态
sudo ufw status

# 如果防火墙未启用，启用它
sudo ufw enable
```

### CentOS/RHEL (firewalld)

```bash
# 允许3000端口
sudo firewall-cmd --permanent --add-port=3000/tcp

# 重新加载防火墙
sudo firewall-cmd --reload

# 查看防火墙状态
sudo firewall-cmd --list-ports
```

### 云服务器安全组

如果您使用云服务器（AWS、阿里云、腾讯云等），还需要在云控制台配置安全组规则：

1. 登录云服务商控制台
2. 找到您的服务器实例
3. 进入"安全组"或"防火墙"设置
4. 添加入站规则：
   - 协议：TCP
   - 端口：3000
   - 来源：0.0.0.0/0（所有IP）或特定IP段

## 🔒 安全建议

### 1. 使用Nginx反向代理

不要直接暴露Node.js应用到公网，使用Nginx作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 配置SSL/TLS

使用Let's Encrypt获取免费SSL证书：

```bash
# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 3. 限制访问IP

如果只需要特定IP访问，在Nginx配置中添加：

```nginx
location / {
    allow 192.168.1.0/24;  # 允许局域网
    allow 1.2.3.4;          # 允许特定IP
    deny all;               # 拒绝其他所有IP
    
    proxy_pass http://localhost:3000;
    # ... 其他配置
}
```

### 4. 使用VPN

对于企业内部使用，推荐使用VPN：

- WireGuard
- OpenVPN
- Tailscale（推荐，零配置）

## 📱 访问方式

### 本地访问

```
http://localhost:3000
```

### 局域网访问

```
http://服务器IP:3000
```

例如：`http://192.168.1.100:3000`

### 公网访问（配置Nginx后）

```
https://your-domain.com
```

## 🔍 故障排查

### 无法远程访问

1. **检查服务器是否监听0.0.0.0**

```bash
# 查看监听端口
sudo netstat -tlnp | grep 3000

# 或使用ss命令
sudo ss -tlnp | grep 3000
```

应该看到类似输出：
```
tcp   0   0 0.0.0.0:3000   0.0.0.0:*   LISTEN   12345/node
```

2. **检查防火墙规则**

```bash
# Ubuntu/Debian
sudo ufw status

# CentOS/RHEL
sudo firewall-cmd --list-ports
```

3. **检查云服务器安全组**

登录云控制台，确认安全组规则已正确配置。

4. **测试端口连通性**

从另一台机器测试：

```bash
# 使用telnet
telnet 服务器IP 3000

# 使用nc
nc -zv 服务器IP 3000

# 使用curl
curl http://服务器IP:3000
```

### 连接超时

1. 检查服务器是否运行：`pm2 status` 或 `docker-compose ps`
2. 检查防火墙规则
3. 检查云服务商安全组
4. 检查网络连接

### SSL证书错误

1. 确认证书未过期：`sudo certbot certificates`
2. 测试自动续期：`sudo certbot renew --dry-run`
3. 检查Nginx配置：`sudo nginx -t`

## 🌍 域名配置

### 1. 购买域名

从域名注册商购买域名（如阿里云、腾讯云、GoDaddy等）。

### 2. 配置DNS

添加A记录指向您的服务器IP：

```
类型: A
主机记录: @（或www）
记录值: 您的服务器IP
TTL: 600
```

### 3. 等待DNS生效

DNS记录通常需要几分钟到几小时生效。使用以下命令检查：

```bash
# 查询DNS记录
nslookup your-domain.com

# 或使用dig
dig your-domain.com
```

### 4. 配置Nginx

参考上面的Nginx配置示例。

### 5. 获取SSL证书

```bash
sudo certbot --nginx -d your-domain.com
```

## 📊 监控访问

### 查看Nginx访问日志

```bash
# 实时查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 查看应用日志

```bash
# PM2
pm2 logs openclaw-cloud

# Docker Compose
docker-compose logs -f app
```

## 🔐 高级安全配置

### 1. 启用HTTP/2

在Nginx配置中：

```nginx
listen 443 ssl http2;
```

### 2. 配置HSTS

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. 配置CSP

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 4. 限制请求速率

```nginx
# 在http块中
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

# 在location块中
limit_req zone=mylimit burst=20 nodelay;
```

### 5. 配置fail2ban

防止暴力破解：

```bash
# 安装fail2ban
sudo apt install fail2ban

# 创建配置文件
sudo nano /etc/fail2ban/jail.local
```

添加配置：

```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

## 📞 获取帮助

如果遇到问题：

1. 查看[部署文档](./deployment.md)
2. 查看[故障排查指南](./troubleshooting.md)
3. 搜索[GitHub Issues](https://github.com/yourusername/openclaw-cloud/issues)
4. 提交[新Issue](https://github.com/yourusername/openclaw-cloud/issues/new)

---

**注意**: 远程访问涉及安全风险，请务必遵循安全最佳实践，定期更新系统和应用，使用强密码，并监控访问日志。
