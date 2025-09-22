# 云服务线上环境搭建指南

## 目录
1. [环境概述](#环境概述)
2. [云服务商选择](#云服务商选择)
3. [服务器购买与配置](#服务器购买与配置)
4. [域名注册与备案](#域名注册与备案)
5. [数据库云服务配置](#数据库云服务配置)
6. [Docker生产环境部署](#docker生产环境部署)
7. [Nginx反向代理配置](#nginx反向代理配置)
8. [SSL证书配置](#ssl证书配置)
9. [CDN和存储服务](#cdn和存储服务)
10. [监控与日志系统](#监控与日志系统)
11. [安全配置与备份](#安全配置与备份)
12. [性能优化与扩容](#性能优化与扩容)

---

## 环境概述

### 生产环境架构
```
用户端:
┌─────────────────┐
│   微信小程序     │
│   (全国用户)    │
└─────────────────┘
         │
         ▼
CDN加速:
┌─────────────────┐
│   腾讯云CDN     │
│   (全国节点)    │
└─────────────────┘
         │
         ▼
负载均衡:
┌─────────────────┐    ┌─────────────────┐
│   Nginx         │────│   SSL证书       │
│   (反向代理)    │    │   (HTTPS)       │
└─────────────────┘    └─────────────────┘
         │
         ▼
应用服务:
┌─────────────────┐    ┌─────────────────┐
│   Docker容器    │────│   宝塔面板      │
│   (FastAPI)     │    │   (服务管理)    │
└─────────────────┘    └─────────────────┘
         │
         ▼
数据服务:
┌─────────────────┐    ┌─────────────────┐
│   云数据库      │────│   对象存储      │
│   (MySQL+Redis) │    │   (静态资源)    │
└─────────────────┘    └─────────────────┘
         │
         ▼
外部服务:
┌─────────────────┐    ┌─────────────────┐
│   通义千问API   │────│   监控告警      │
│   (AI服务)      │    │   (日志分析)    │
└─────────────────┘    └─────────────────┘
```

### 技术栈配置
- **云服务商**: 腾讯云（主）+ 阿里云（AI服务）
- **服务器**: 轻量应用服务器 2核4G
- **数据库**: 云数据库 MySQL 8.0 + Redis
- **存储**: 对象存储 COS
- **CDN**: 腾讯云 CDN 全球加速
- **监控**: 云监控 + 日志服务
- **安全**: SSL证书 + 安全组 + 防火墙

---

## 云服务商选择

### 腾讯云服务包（推荐主要服务商）

#### 核心优势
- **网络稳定**: 国内网络环境优化良好
- **小程序支持**: 与微信生态深度整合
- **价格合理**: 新用户优惠力度大
- **技术支持**: 中文技术支持，响应速度快

#### 服务清单及价格
```yaml
计算服务:
  轻量应用服务器 2核4G 5M带宽: 24元/月
  负载均衡 CLB (按需): 18元/月

数据服务:
  云数据库MySQL基础版 1核1G: 30元/月
  云数据库Redis 256MB: 9元/月

存储网络:
  对象存储COS 标准存储: 0.118元/GB/月
  内容分发网络CDN: 0.21元/GB
  
安全服务:
  SSL证书 (DV免费版): 0元
  Web应用防火墙 (可选): 385元/月

监控日志:
  云监控 (基础版): 免费
  日志服务CLS: 0.35元/GB

总计预估: 78-100元/月 (不含WAF)
```

### 阿里云服务包（AI服务主要提供商）

#### 核心优势
- **AI服务完善**: 通义千问、百炼平台
- **技术先进**: 在AI领域投入较大
- **API稳定**: 调用成功率高

#### AI服务价格
```yaml
AI服务:
  通义千问-Plus (qwen-plus): 0.008元/千tokens
  通义千问-Turbo (qwen-turbo): 0.002元/千tokens
  文本内容安全检测: 1.5元/千次
  
预估月费用:
  日均1000次AI调用: 60-120元/月
  内容安全检测: 45元/月
  
总计: 105-165元/月
```

---

## 服务器购买与配置

### 1. 购买腾讯云轻量应用服务器

#### 购买步骤
1. 访问 [腾讯云轻量应用服务器](https://cloud.tencent.com/product/lighthouse)
2. 选择配置：
   - **地域**: 上海/北京/广州（根据主要用户分布选择）
   - **操作系统**: Ubuntu 20.04 LTS
   - **CPU**: 2核
   - **内存**: 4GB
   - **存储**: 60GB SSD
   - **带宽**: 5Mbps
   - **流量**: 1000GB/月

#### 购买命令行配置（可选）
```bash
# 通过腾讯云CLI购买（需先安装并配置CLI）
tccli lighthouse CreateInstances \
  --region ap-shanghai \
  --instance-count 1 \
  --blueprint-id ubuntu_20_04 \
  --bundle-id bundle_linux_2c4g5m \
  --instance-names "bazi-prod-server" \
  --auto-voucher true
```

### 2. 服务器基础配置

#### 连接服务器
```bash
# 使用SSH连接（替换为实际IP）
ssh ubuntu@your-server-ip

# 或使用腾讯云控制台的网页终端
```

#### 系统初始化
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget vim git htop unzip

# 配置时区
sudo timedatectl set-timezone Asia/Shanghai

# 创建应用用户
sudo useradd -m -s /bin/bash bazi
sudo usermod -aG sudo bazi

# 设置用户密码
sudo passwd bazi
```

#### 安全配置
```bash
# 配置防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8000  # FastAPI端口
sudo ufw allow 3306  # MySQL端口（仅内网）
sudo ufw allow 6379  # Redis端口（仅内网）

# 禁用root远程登录
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 配置fail2ban防暴力破解
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. 安装Docker环境

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用户到docker组
sudo usermod -aG docker $USER
sudo usermod -aG docker bazi

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version

# 配置Docker国内镜像
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

# 重启Docker服务
sudo systemctl daemon-reload
sudo systemctl restart docker
sudo systemctl enable docker
```

---

## 域名注册与备案

### 1. 域名注册

#### 推荐域名注册商
- **腾讯云**: 与服务器在同一平台，管理方便
- **阿里云**: 价格相对便宜
- **Godaddy**: 国际域名注册商

#### 域名选择建议
```
主域名: yourdomain.com (55元/年)
API子域名: api.yourdomain.com
CDN子域名: cdn.yourdomain.com
管理子域名: admin.yourdomain.com
```

#### 腾讯云域名注册步骤
1. 访问 [腾讯云域名注册](https://cloud.tencent.com/product/domain)
2. 搜索并选择心仪的域名
3. 完成购买和实名认证
4. 等待实名认证通过（1-3个工作日）

### 2. 域名备案（重要）

#### 备案必要性
- **法律要求**: 在中国大陆使用云服务器必须备案
- **访问速度**: 备案后可使用国内CDN加速
- **小程序要求**: 微信小程序生产环境必须使用备案域名

#### 备案流程
```bash
# 备案所需材料
个人备案:
  - 身份证正反面照片
  - 域名证书
  - 服务器购买凭证
  - 网站备案承诺书

企业备案:
  - 营业执照
  - 法人身份证
  - 域名证书
  - 服务器购买凭证
  - 网站备案承诺书
  - 授权委托书（如非法人操作）
```

#### 腾讯云备案步骤
1. 登录 [腾讯云备案控制台](https://console.cloud.tencent.com/beian)
2. 选择"首次备案"
3. 填写主体信息（个人或企业信息）
4. 填写网站信息：
   - **网站名称**: 八字文化小程序
   - **网站内容**: 传统文化传播，娱乐服务
   - **网站服务内容**: 选择"其他"
5. 上传所需材料
6. 等待初审（1-2个工作日）
7. 邮寄或上传幕布照片
8. 等待管局审核（7-20个工作日）

#### 备案期间临时解决方案
```bash
# 使用香港/海外服务器（无需备案）
# 腾讯云香港轻量服务器: 25元/月
# 缺点: 访问速度较慢，无法使用国内CDN

# 购买命令
tccli lighthouse CreateInstances \
  --region ap-hongkong \
  --instance-count 1 \
  --blueprint-id ubuntu_20_04 \
  --bundle-id bundle_linux_2c4g5m
```

### 3. DNS解析配置

#### 腾讯云DNS配置
```bash
# 域名解析记录配置
记录类型: A
主机记录: @
记录值: your-server-ip
TTL: 600

记录类型: A  
主机记录: api
记录值: your-server-ip
TTL: 600

记录类型: CNAME
主机记录: cdn
记录值: your-cdn-domain.com
TTL: 600

记录类型: CNAME
主机记录: www
记录值: yourdomain.com
TTL: 600
```

#### 验证DNS解析
```bash
# 验证解析是否生效
nslookup yourdomain.com
nslookup api.yourdomain.com

# 或使用dig命令
dig yourdomain.com
dig api.yourdomain.com
```

---

## 数据库云服务配置

### 1. MySQL云数据库配置

#### 购买云数据库MySQL
1. 访问 [腾讯云MySQL](https://cloud.tencent.com/product/cdb)
2. 选择配置：
   - **版本**: MySQL 8.0
   - **架构**: 基础版（开发阶段）→ 双节点（生产阶段）
   - **规格**: 1核1G → 2核4G（根据需求升级）
   - **存储**: 25GB → 100GB
   - **网络**: 私有网络（与服务器同一VPC）

#### 数据库初始配置
```sql
-- 连接云数据库
mysql -h your-mysql-host -P 3306 -u root -p

-- 创建应用数据库
CREATE DATABASE bazi_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建应用用户
CREATE USER 'bazi_user'@'%' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON bazi_prod.* TO 'bazi_user'@'%';
FLUSH PRIVILEGES;

-- 优化配置
SET GLOBAL innodb_buffer_pool_size = 1073741824;  -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864;  -- 64MB
```

#### 数据库安全配置
```bash
# 配置安全组规则
# 仅允许应用服务器访问数据库
Source: 10.0.0.0/8 (内网)
Port: 3306
Protocol: TCP

# 启用SSL连接
ALTER USER 'bazi_user'@'%' REQUIRE SSL;

# 设置访问白名单
# 在腾讯云控制台配置安全组，仅允许应用服务器IP访问
```

#### 数据库备份配置
```bash
# 设置自动备份
# 在腾讯云控制台设置：
# - 备份时间: 02:00-06:00
# - 备份保留: 7天
# - 备份方式: 物理备份

# 手动备份命令
mysqldump -h your-mysql-host -u bazi_user -p \
  --single-transaction --routines --triggers \
  bazi_prod > bazi_backup_$(date +%Y%m%d).sql
```

### 2. Redis云数据库配置

#### 购买云数据库Redis
1. 访问 [腾讯云Redis](https://cloud.tencent.com/product/crs)
2. 选择配置：
   - **版本**: Redis 5.0
   - **架构**: 标准架构
   - **规格**: 256MB → 1GB（根据需求）
   - **网络**: 私有网络（与服务器同一VPC）

#### Redis安全配置
```bash
# 设置Redis密码（在控制台配置）
# 密码要求: 8-30位，包含字母数字特殊字符

# 配置安全组
Source: 10.0.0.0/8 (内网)
Port: 6379
Protocol: TCP

# 测试连接
redis-cli -h your-redis-host -p 6379 -a your-password
```

#### Redis性能优化
```bash
# 配置参数优化（在控制台设置）
maxmemory-policy: allkeys-lru
timeout: 0
tcp-keepalive: 300
maxclients: 10000

# 监控内存使用
redis-cli -h your-redis-host -p 6379 -a your-password info memory
```

---

## Docker生产环境部署

### 1. 创建项目目录结构

```bash
# 切换到应用用户
sudo su - bazi

# 创建项目目录
mkdir -p /home/bazi/bazi-prod
cd /home/bazi/bazi-prod

# 创建项目结构
mkdir -p {app,nginx,ssl,logs,backup,scripts}
```

### 2. 上传项目代码

```bash
# 方式1: 使用Git克隆（推荐）
git clone https://github.com/yourusername/bazi-miniprogram.git .

# 方式2: 使用SCP上传
# 在本地机器执行：
scp -r ./bazi-miniprogram/* ubuntu@your-server-ip:/home/bazi/bazi-prod/

# 方式3: 使用rsync同步
rsync -avz --exclude '.git' ./bazi-miniprogram/ ubuntu@your-server-ip:/home/bazi/bazi-prod/
```

### 3. 创建生产环境配置

#### 生产环境Docker Compose
```bash
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: bazi-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - bazi-network

  # FastAPI应用
  api:
    build: 
      context: ./app
      dockerfile: Dockerfile.prod
    container_name: bazi-api-prod
    environment:
      - ENV=production
      - DATABASE_URL=mysql://bazi_user:${DB_PASSWORD}@${DB_HOST}:3306/bazi_prod
      - REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:6379/0
      - QWEN_API_KEY=${QWEN_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./logs/app:/var/log/bazi
    restart: unless-stopped
    networks:
      - bazi-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    container_name: bazi-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - bazi-network

volumes:
  prometheus_data:

networks:
  bazi-network:
    driver: bridge
EOF
```

#### 生产环境Dockerfile
```bash
cat > app/Dockerfile.prod << 'EOF'
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
EOF
```

#### 生产环境变量配置
```bash
cat > .env.prod << 'EOF'
# 生产环境配置
ENV=production
DEBUG=false

# 数据库配置（替换为实际值）
DB_HOST=your-mysql-host.tencentcdb.com
DB_PASSWORD=your-strong-db-password
REDIS_HOST=your-redis-host.tencentcloudapi.com
REDIS_PASSWORD=your-strong-redis-password

# 微信小程序配置
WECHAT_APP_ID=your-production-appid
WECHAT_APP_SECRET=your-production-app-secret

# AI服务配置
QWEN_API_KEY=your-qwen-api-key

# 安全配置
SECRET_KEY=your-super-secret-production-key

# 文件存储配置
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_REGION=ap-shanghai
COS_BUCKET=bazi-prod-static
EOF

# 设置文件权限
chmod 600 .env.prod
```

### 4. 构建和启动服务

```bash
# 构建Docker镜像
docker-compose -f docker-compose.prod.yml build

# 启动所有服务
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f api
```

---

## Nginx反向代理配置

### 1. Nginx主配置文件

```bash
cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
}
EOF
```

### 2. 站点配置文件

```bash
mkdir -p nginx/conf.d

cat > nginx/conf.d/bazi.conf << 'EOF'
# 上游服务器配置
upstream bazi_api {
    server api:8000;
    keepalive 32;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    
    # Let's Encrypt验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他请求重定向到HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS主站配置
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 主页
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ =404;
    }
}

# API服务器配置
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/api.yourdomain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.yourdomain.com.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # CORS配置
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
    add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;

    # 处理预检请求
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type "text/plain; charset=utf-8";
        add_header Content-Length 0;
        return 204;
    }

    # API代理
    location / {
        proxy_pass http://bazi_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        access_log off;
        proxy_pass http://bazi_api;
    }
}
EOF
```

---

## SSL证书配置

### 1. 使用Let's Encrypt免费证书

#### 安装Certbot
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 为域名申请证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. 腾讯云SSL证书（推荐）

#### 申请免费DV证书
1. 访问 [腾讯云SSL证书](https://console.cloud.tencent.com/ssl)
2. 申请免费DV证书
3. 选择DNS验证方式
4. 下载证书文件

#### 配置SSL证书
```bash
# 创建SSL目录
mkdir -p ssl

# 上传证书文件到ssl目录
# yourdomain.com.crt (证书文件)
# yourdomain.com.key (私钥文件)

# 设置文件权限
chmod 600 ssl/*.key
chmod 644 ssl/*.crt

# 验证证书
openssl x509 -in ssl/yourdomain.com.crt -text -noout
```

---

## CDN和存储服务

### 1. 腾讯云COS对象存储

#### 创建存储桶
```bash
# 创建存储桶配置
bucket_name="bazi-prod-static"
region="ap-shanghai"
access_policy="public-read"  # 公开读取

# 通过控制台创建或使用命令行工具
```

#### COS配置示例
```python
# 在FastAPI应用中集成COS
import os
from qcloud_cos import CosConfig, CosS3Client

# COS配置
cos_config = CosConfig(
    Region=os.getenv('COS_REGION'),
    SecretId=os.getenv('COS_SECRET_ID'),
    SecretKey=os.getenv('COS_SECRET_KEY')
)
cos_client = CosS3Client(cos_config)

# 文件上传示例
def upload_file_to_cos(file_path, object_key):
    response = cos_client.upload_file(
        Bucket=os.getenv('COS_BUCKET'),
        LocalFilePath=file_path,
        Key=object_key
    )
    return f"https://{os.getenv('COS_BUCKET')}.cos.{os.getenv('COS_REGION')}.myqcloud.com/{object_key}"
```

### 2. 腾讯云CDN配置

#### CDN加速域名配置
```bash
# CDN配置要点
加速域名: cdn.yourdomain.com
源站类型: 对象存储COS
回源协议: HTTPS
缓存规则:
  - 图片文件(.jpg,.png,.gif): 30天
  - CSS/JS文件: 7天
  - API接口: 不缓存
```

#### CDN优化配置
```bash
# 创建CDN配置文件
cat > cdn-config.json << 'EOF'
{
  "domain": "cdn.yourdomain.com",
  "origin": {
    "origins": ["bazi-prod-static.cos.ap-shanghai.myqcloud.com"],
    "origin_type": "cos",
    "origin_pull_protocol": "https"
  },
  "cache": [
    {
      "path": "*.jpg;*.png;*.gif;*.jpeg",
      "cache_time": 2592000,
      "ignore_cache_control": false
    },
    {
      "path": "*.css;*.js",
      "cache_time": 604800,
      "ignore_cache_control": false
    },
    {
      "path": "/api/*",
      "cache_time": 0,
      "ignore_cache_control": true
    }
  ],
  "https": {
    "https_switch": "on",
    "http2_switch": "on",
    "force_redirect": {
      "switch": "on",
      "redirect_type": "https",
      "redirect_status_code": 301
    }
  }
}
EOF
```

---

## 监控与日志系统

### 1. 腾讯云监控配置

#### 云监控告警配置
```bash
# 服务器监控指标
- CPU使用率 > 80% (持续5分钟)
- 内存使用率 > 85% (持续5分钟)  
- 磁盘使用率 > 90% (持续10分钟)
- 网络出带宽 > 80% (持续5分钟)

# 数据库监控指标
- MySQL连接数 > 150 (持续5分钟)
- MySQL CPU使用率 > 80% (持续5分钟)
- Redis内存使用率 > 80% (持续5分钟)

# 应用监控指标
- API响应时间 > 3秒 (持续3分钟)
- HTTP 5xx错误率 > 5% (持续3分钟)
- 应用容器重启次数 > 3次 (1小时内)
```

### 2. 日志服务配置

#### 配置日志收集
```bash
# 安装日志收集器
wget https://mirrors.tencent.com/install/cls/loglistener-linux-x64-2.6.6.tar.gz
tar -zxf loglistener-linux-x64-2.6.6.tar.gz
cd loglistener

# 配置日志收集
cat > conf/loglistener.conf << 'EOF'
{
    "api_version": "v2",
    "endpoint": "ap-shanghai.cls.tencentcs.com",
    "secret_id": "your-secret-id",
    "secret_key": "your-secret-key"
}
EOF

# 启动日志收集器
sudo ./bin/install.sh
sudo systemctl start loglistener
sudo systemctl enable loglistener
```

#### 应用日志配置
```python
# 在FastAPI应用中配置结构化日志
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_api_request(self, method, path, status_code, response_time, user_id=None):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "api_request",
            "method": method,
            "path": path,
            "status_code": status_code,
            "response_time_ms": response_time,
            "user_id": user_id
        }
        self.logger.info(json.dumps(log_data))

    def log_error(self, error_type, error_message, traceback=None):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "error",
            "error_type": error_type,
            "error_message": error_message,
            "traceback": traceback
        }
        self.logger.error(json.dumps(log_data))
```

---

## 安全配置与备份

### 1. 安全加固

#### Web应用防火墙（可选）
```bash
# 腾讯云WAF配置
- 网站防护: 开启SQL注入、XSS攻击防护
- 访问控制: 限制海外访问（可选）
- 频率控制: 单IP每分钟最多60次请求
- 自定义规则: 拦截恶意爬虫和攻击

# 成本: 385元/月（基础版）
```

#### 服务器安全配置
```bash
# 更新系统安全补丁
sudo apt update && sudo apt upgrade -y

# 安装安全扫描工具
sudo apt install chkrootkit rkhunter -y

# 定期安全扫描
echo "0 3 * * 0 /usr/bin/chkrootkit" | sudo crontab -
echo "0 4 * * 0 /usr/bin/rkhunter --check --skip-keypress" | sudo crontab -

# 配置自动安全更新
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. 数据备份策略

#### 数据库备份脚本
```bash
cat > scripts/backup_database.sh << 'EOF'
#!/bin/bash

# 配置变量
DB_HOST="your-mysql-host.tencentcdb.com"
DB_USER="bazi_user"
DB_PASS="your-db-password"
DB_NAME="bazi_prod"
BACKUP_DIR="/home/bazi/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS \
  --single-transaction --routines --triggers \
  $DB_NAME > $BACKUP_DIR/mysql_backup_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/mysql_backup_$DATE.sql

# 上传到COS
cosutil cp $BACKUP_DIR/mysql_backup_$DATE.sql.gz \
  cos://bazi-prod-backup/database/

# 删除本地7天前的备份
find $BACKUP_DIR -name "mysql_backup_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: mysql_backup_$DATE.sql.gz"
EOF

chmod +x scripts/backup_database.sh

# 设置定时备份（每天凌晨2点）
echo "0 2 * * * /home/bazi/bazi-prod/scripts/backup_database.sh" | crontab -
```

#### 应用备份脚本
```bash
cat > scripts/backup_application.sh << 'EOF'
#!/bin/bash

# 配置变量
APP_DIR="/home/bazi/bazi-prod"
BACKUP_DIR="/home/bazi/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 打包应用文件
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
  --exclude='.git' \
  --exclude='logs/*' \
  --exclude='*.pyc' \
  $APP_DIR

# 上传到COS
cosutil cp $BACKUP_DIR/app_backup_$DATE.tar.gz \
  cos://bazi-prod-backup/application/

# 删除本地3天前的备份
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +3 -delete

echo "应用备份完成: app_backup_$DATE.tar.gz"
EOF

chmod +x scripts/backup_application.sh

# 设置定时备份（每周日凌晨3点）
echo "0 3 * * 0 /home/bazi/bazi-prod/scripts/backup_application.sh" | crontab -
```

---

## 性能优化与扩容

### 1. 性能优化配置

#### 数据库性能优化
```sql
-- MySQL性能优化配置
SET GLOBAL innodb_buffer_pool_size = 2147483648;  -- 2GB
SET GLOBAL innodb_log_file_size = 268435456;      -- 256MB
SET GLOBAL innodb_log_buffer_size = 16777216;     -- 16MB
SET GLOBAL query_cache_size = 134217728;          -- 128MB
SET GLOBAL max_connections = 300;
SET GLOBAL innodb_flush_log_at_trx_commit = 2;    -- 性能优化

-- 索引优化
CREATE INDEX idx_created_at ON bazi_records(created_at);
CREATE INDEX idx_user_created ON bazi_records(user_id, created_at);
CREATE INDEX idx_fortune_date ON daily_fortune(fortune_date);

-- 定期优化表
OPTIMIZE TABLE bazi_records;
OPTIMIZE TABLE yuanfen_records;
```

#### Redis性能优化
```bash
# Redis配置优化
redis-cli CONFIG SET maxmemory 1073741824     # 1GB
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET save "900 1 300 10 60 10000"
redis-cli CONFIG SET timeout 300
redis-cli CONFIG SET tcp-keepalive 60

# 定期清理过期键
redis-cli --scan --pattern "temp:*" | xargs redis-cli DEL
```

### 2. 扩容方案

#### 垂直扩容（升级配置）
```bash
# 服务器升级路径
当前配置: 2核4G → 4核8G → 8核16G
存储扩容: 60GB → 100GB → 200GB

# 数据库升级路径
MySQL: 1核1G → 2核4G → 4核8G
Redis: 256MB → 1GB → 2GB

# 升级步骤
1. 创建数据备份
2. 升级服务器配置
3. 重启相关服务
4. 验证服务正常
```

#### 水平扩容（多实例）
```bash
# 负载均衡配置
upstream bazi_api {
    server api1:8000 weight=1;
    server api2:8000 weight=1;
    server api3:8000 weight=1;
    keepalive 32;
}

# 数据库读写分离
主数据库: 写操作
从数据库: 读操作（1-3个实例）

# Redis集群
配置Redis Cluster模式
3主3从架构，提供高可用
```

### 3. 监控和告警优化

#### 自定义监控脚本
```bash
cat > scripts/health_check.sh << 'EOF'
#!/bin/bash

# API健康检查
API_URL="https://api.yourdomain.com/health"
WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-webhook-key"

# 检查API状态
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -ne 200 ]; then
    # 发送告警消息
    curl -X POST $WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
            "msgtype": "text",
            "text": {
                "content": "🚨 八字小程序API异常！\n状态码: '$response'\n时间: '$(date)'\n请立即检查服务状态！"
            }
        }'
    
    # 记录日志
    echo "[$(date)] API健康检查失败，状态码: $response" >> /home/bazi/logs/health_check.log
    
    # 尝试重启服务
    cd /home/bazi/bazi-prod
    docker-compose -f docker-compose.prod.yml restart api
    
    exit 1
else
    echo "[$(date)] API健康检查正常" >> /home/bazi/logs/health_check.log
fi

# 检查数据库连接
DB_CHECK=$(docker exec bazi-api-prod python -c "
import pymysql
import os
try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        port=3306,
        user='bazi_user',
        password=os.getenv('DB_PASSWORD'),
        database='bazi_prod'
    )
    conn.close()
    print('OK')
except Exception as e:
    print('ERROR:', str(e))
")

if [[ $DB_CHECK != "OK" ]]; then
    curl -X POST $WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
            "msgtype": "text",
            "text": {
                "content": "🚨 数据库连接异常！\n错误: '$DB_CHECK'\n时间: '$(date)'"
            }
        }'
fi

echo "[$(date)] 健康检查完成" >> /home/bazi/logs/health_check.log
EOF

chmod +x scripts/health_check.sh

# 设置定时健康检查（每5分钟）
echo "*/5 * * * * /home/bazi/bazi-prod/scripts/health_check.sh" | crontab -
```

#### 性能监控脚本
```bash
cat > scripts/performance_monitor.sh << 'EOF'
#!/bin/bash

# 性能监控脚本
LOG_FILE="/home/bazi/logs/performance.log"
WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-webhook-key"

# 获取系统负载
load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# 检查是否超过阈值
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    curl -X POST $WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
            "msgtype": "text",
            "text": {
                "content": "⚠️ CPU使用率过高！\n当前使用率: '$cpu_usage'%\n时间: '$(date)'"
            }
        }'
fi

if (( $(echo "$memory_usage > 85" | bc -l) )); then
    curl -X POST $WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
            "msgtype": "text",
            "text": {
                "content": "⚠️ 内存使用率过高！\n当前使用率: '$memory_usage'%\n时间: '$(date)'"
            }
        }'
fi

if [ $disk_usage -gt 90 ]; then
    curl -X POST $WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
            "msgtype": "text",
            "text": {
                "content": "⚠️ 磁盘使用率过高！\n当前使用率: '$disk_usage'%\n时间: '$(date)'"
            }
        }'
fi

# 记录性能数据
echo "[$(date)] Load:$load_avg CPU:$cpu_usage% Memory:$memory_usage% Disk:$disk_usage%" >> $LOG_FILE
EOF

chmod +x scripts/performance_monitor.sh

# 设置定时性能监控（每10分钟）
echo "*/10 * * * * /home/bazi/bazi-prod/scripts/performance_monitor.sh" | crontab -
```

---

## 部署验证与测试

### 1. 部署完整性检查

```bash
# 创建部署验证脚本
cat > scripts/deployment_check.sh << 'EOF'
#!/bin/bash

echo "🔍 开始验证云服务部署..."
echo "=" * 50

# 检查服务状态
echo "📋 检查Docker服务状态:"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n📋 检查服务健康状态:"
# API服务检查
api_status=$(curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health)
if [ $api_status -eq 200 ]; then
    echo "✅ API服务正常 (状态码: $api_status)"
else
    echo "❌ API服务异常 (状态码: $api_status)"
fi

# 数据库连接检查
echo -e "\n📋 检查数据库连接:"
mysql_check=$(docker exec bazi-api-prod python -c "
import pymysql, os
try:
    conn = pymysql.connect(host=os.getenv('DB_HOST'), port=3306, user='bazi_user', password=os.getenv('DB_PASSWORD'), database='bazi_prod')
    conn.close()
    print('MySQL连接正常')
except Exception as e:
    print('MySQL连接失败:', str(e))
")
echo "✅ $mysql_check"

# Redis连接检查
redis_check=$(docker exec bazi-api-prod python -c "
import redis, os
try:
    r = redis.Redis.from_url(os.getenv('REDIS_URL'))
    r.ping()
    print('Redis连接正常')
except Exception as e:
    print('Redis连接失败:', str(e))
")
echo "✅ $redis_check"

# SSL证书检查
echo -e "\n📋 检查SSL证书:"
ssl_status=$(echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates)
echo "✅ SSL证书状态: $ssl_status"

# 域名解析检查
echo -e "\n📋 检查域名解析:"
main_domain=$(nslookup yourdomain.com | grep "Address" | tail -1 | awk '{print $2}')
api_domain=$(nslookup api.yourdomain.com | grep "Address" | tail -1 | awk '{print $2}')
echo "✅ 主域名解析: yourdomain.com -> $main_domain"
echo "✅ API域名解析: api.yourdomain.com -> $api_domain"

echo -e "\n🎉 部署验证完成！"
EOF

chmod +x scripts/deployment_check.sh

# 运行部署验证
./scripts/deployment_check.sh
```

### 2. 功能测试

```bash
# 创建API功能测试脚本
cat > scripts/api_test.sh << 'EOF'
#!/bin/bash

API_BASE="https://api.yourdomain.com"

echo "🧪 开始API功能测试..."

# 测试健康检查接口
echo "1. 测试健康检查接口:"
health_response=$(curl -s "$API_BASE/health")
echo "响应: $health_response"

# 测试八字计算接口（需要实际实现后测试）
echo -e "\n2. 测试八字计算接口:"
bazi_test='{"birth_year":1990,"birth_month":5,"birth_day":15,"birth_hour":10,"gender":1}'
bazi_response=$(curl -s -X POST "$API_BASE/api/v1/bazi/calculate" \
    -H "Content-Type: application/json" \
    -d "$bazi_test")
echo "响应: $bazi_response"

# 测试每日运势接口
echo -e "\n3. 测试每日运势接口:"
fortune_response=$(curl -s "$API_BASE/api/v1/fortune/daily")
echo "响应: $fortune_response"

echo -e "\n✅ API功能测试完成"
EOF

chmod +x scripts/api_test.sh
```

---

## 运维管理指南

### 1. 常用运维命令

```bash
# 创建运维工具脚本
cat > scripts/ops_tools.sh << 'EOF'
#!/bin/bash

case $1 in
    "status")
        echo "📊 服务状态检查:"
        docker-compose -f docker-compose.prod.yml ps
        echo -e "\n💾 资源使用情况:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
        echo "内存: $(free -h | awk 'NR==2{printf "已用: %s/%s (%.2f%%)\n", $3,$2,$3*100/$2 }')"
        echo "磁盘: $(df -h / | awk 'NR==2{printf "已用: %s/%s (%s)\n", $3,$2,$5}')"
        ;;
    "logs")
        echo "📝 查看应用日志:"
        docker-compose -f docker-compose.prod.yml logs -f --tail=100 api
        ;;
    "restart")
        echo "🔄 重启所有服务:"
        docker-compose -f docker-compose.prod.yml restart
        echo "✅ 服务重启完成"
        ;;
    "update")
        echo "🔄 更新应用代码:"
        git pull origin main
        docker-compose -f docker-compose.prod.yml build api
        docker-compose -f docker-compose.prod.yml up -d api
        echo "✅ 应用更新完成"
        ;;
    "backup")
        echo "💾 执行备份:"
        ./scripts/backup_database.sh
        ./scripts/backup_application.sh
        echo "✅ 备份完成"
        ;;
    "clean")
        echo "🧹 清理系统:"
        docker system prune -f
        docker volume prune -f
        find /home/bazi/logs -name "*.log" -mtime +30 -delete
        echo "✅ 系统清理完成"
        ;;
    *)
        echo "🛠️ 运维工具使用说明:"
        echo "  $0 status   - 查看服务状态和资源使用"
        echo "  $0 logs     - 查看应用日志"
        echo "  $0 restart  - 重启所有服务"
        echo "  $0 update   - 更新应用代码"
        echo "  $0 backup   - 执行数据备份"
        echo "  $0 clean    - 清理系统垃圾"
        ;;
esac
EOF

chmod +x scripts/ops_tools.sh

# 创建快捷命令别名
echo "alias ops='/home/bazi/bazi-prod/scripts/ops_tools.sh'" >> ~/.bashrc
source ~/.bashrc
```

### 2. 应急响应手册

```bash
cat > docs/emergency_response.md << 'EOF'
# 应急响应手册

## 🚨 常见故障处理

### 1. API服务异常
**症状**: 小程序无法正常请求数据，API返回5xx错误

**排查步骤**:
```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看API日志
docker-compose -f docker-compose.prod.yml logs api

# 检查系统资源
top
free -h
df -h
```

**解决方案**:
```bash
# 重启API服务
docker-compose -f docker-compose.prod.yml restart api

# 如果问题持续，回滚到上一版本
git checkout HEAD~1
docker-compose -f docker-compose.prod.yml build api
docker-compose -f docker-compose.prod.yml up -d api
```

### 2. 数据库连接异常
**症状**: API报数据库连接错误

**排查步骤**:
```bash
# 检查数据库状态（在腾讯云控制台）
# 测试连接
mysql -h your-mysql-host -u bazi_user -p bazi_prod -e "SELECT 1;"
```

**解决方案**:
```bash
# 检查安全组规则
# 重启应用服务
docker-compose -f docker-compose.prod.yml restart api

# 联系腾讯云技术支持（数据库实例故障）
```

### 3. SSL证书过期
**症状**: 浏览器显示证书过期警告

**解决方案**:
```bash
# 更新Let's Encrypt证书
sudo certbot renew

# 或重新申请腾讯云证书并替换
# 重启Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 4. 磁盘空间不足
**症状**: 系统响应缓慢，日志显示磁盘写入错误

**解决方案**:
```bash
# 清理Docker镜像和容器
docker system prune -a -f

# 清理应用日志
find /home/bazi/logs -name "*.log" -mtime +7 -delete

# 清理备份文件
find /home/bazi/backup -name "*backup*" -mtime +30 -delete

# 扩容磁盘（在腾讯云控制台操作）
```

## 💡 预防措施

### 1. 定期检查清单
- 每周检查服务器资源使用情况
- 每月检查SSL证书有效期
- 每季度检查域名到期时间
- 每半年进行安全漏洞扫描

### 2. 备份验证
- 每月验证数据库备份可用性
- 每季度进行灾难恢复演练

### 3. 性能优化
- 定期清理数据库冗余数据
- 优化SQL查询性能
- 清理过期的Redis缓存

## 📞 紧急联系方式

- **腾讯云技术支持**: 4009100100
- **阿里云技术支持**: 95187
- **微信开放平台客服**: 在线提交工单
- **服务器运维负责人**: [填入联系方式]
- **开发团队负责人**: [填入联系方式]

## 📋 故障等级定义

**P0 - 严重故障**
- 服务完全不可用
- 数据丢失风险
- 影响所有用户

**P1 - 重要故障**  
- 部分功能不可用
- 性能严重下降
- 影响大部分用户

**P2 - 一般故障**
- 小范围功能异常
- 轻微性能影响
- 影响少数用户

**P3 - 轻微故障**
- 体验优化问题
- 不影响核心功能
- 计划内修复
EOF
```

---

## 总结

通过以上详细步骤，您已经拥有了完整的八字运势小程序云服务线上环境搭建指南，包括：

### ✅ 已完成配置

**🌐 云服务基础设施**
- 腾讯云轻量服务器 (2核4G)
- 云数据库 MySQL + Redis
- 对象存储 COS + CDN 加速
- 域名注册与备案流程

**🐳 容器化部署**
- Docker 生产环境配置
- Nginx 反向代理
- SSL 证书自动化管理
- 环境变量安全管理

**🔐 安全与监控**
- 防火墙与安全组配置
- SSL/TLS 加密传输
- 应用与系统监控
- 自动化备份策略

**⚡ 性能优化**
- 数据库性能调优
- Redis 缓存优化
- CDN 内容分发
- 负载均衡配置

**🛠️ 运维管理**
- 自动化脚本工具
- 健康检查机制
- 应急响应流程
- 扩容升级方案

### 📊 成本预估

**基础版配置 (78-100元/月)**
- 轻量服务器: 24元/月
- MySQL数据库: 30元/月  
- Redis缓存: 9元/月
- 对象存储: 15元/月
- CDN流量: 20元/月

**AI服务成本 (105-165元/月)**
- 通义千问API: 60-120元/月
- 内容安全检测: 45元/月

**总计: 183-265元/月**

### 🚀 部署流程总览

1. **购买云服务** → 服务器、域名、数据库
2. **域名备案** → 完成ICP备案(7-20工作日)
3. **服务器配置** → 安全设置、Docker环境
4. **代码部署** → Git代码、Docker构建
5. **SSL配置** → 证书申请、HTTPS启用
6. **监控配置** → 告警设置、日志收集
7. **性能优化** → 缓存配置、CDN加速
8. **上线测试** → 功能验证、压力测试

### 🎯 下一步行动

1. **立即开始**: 按照指南购买云服务资源
2. **域名备案**: 尽早提交备案申请
3. **环境搭建**: 配置开发和生产环境
4. **功能开发**: 完善小程序核心功能
5. **测试上线**: 全面测试后正式发布

**祝您的八字运势小程序部署成功，项目顺利上线！** 🎉

如有任何部署问题，请参考应急响应手册或联系相关技术支持。
