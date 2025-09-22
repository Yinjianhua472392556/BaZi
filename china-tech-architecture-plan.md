# 八字小程序国内化技术架构完整方案

## 目录
1. [技术栈统一选择](#技术栈统一选择)
2. [云服务选型](#云服务选型)
3. [开发环境搭建](#开发环境搭建)
4. [生产环境架构](#生产环境架构)
5. [数据库设计](#数据库设计)
6. [CI/CD流水线](#cicd流水线)
7. [域名备案流程](#域名备案流程)
8. [监控运维方案](#监控运维方案)
9. [成本预算](#成本预算)

---

## 技术栈统一选择

### 核心原则
- **开发生产环境完全一致**
- **优先选择国内服务商**
- **考虑中国网络环境优化**
- **确保小程序合规性**

### 技术栈详情

#### 后端技术栈
```yaml
编程语言: Python 3.11 (稳定版本)
Web框架: FastAPI 0.104.1 (高性能异步框架)
数据库: MySQL 8.0 (开发生产一致)
缓存: Redis 7.0 (性能缓存)
ORM: SQLAlchemy 2.0 (异步支持)
容器化: Docker + Docker Compose
服务器: Nginx (反向代理)
```

#### 前端技术栈
```yaml
框架: 微信小程序原生开发
语言: JavaScript ES6+ / TypeScript
UI库: Vant Weapp 1.11.4
状态管理: MobX-miniprogram
构建工具: 微信开发者工具
```

#### 数据库统一方案
```yaml
开发环境: MySQL 8.0 (Docker容器)
测试环境: MySQL 8.0 (Docker容器)
生产环境: 腾讯云MySQL 8.0 (云数据库)
连接池: SQLAlchemy连接池
备份策略: 每日自动备份
```

---

## 云服务选型

### 腾讯云服务清单 (推荐)

#### 核心服务
```yaml
计算服务:
  - 轻量应用服务器 2核4G (CVM)
  - 负载均衡 CLB (可选扩容)

数据服务:
  - 云数据库MySQL 8.0 (1核1G基础版)
  - 云数据库Redis (256MB基础版)

存储服务:
  - 对象存储 COS (静态资源)
  - 云硬盘 CBS (数据持久化)

网络服务:
  - 内容分发网络 CDN
  - SSL证书服务 (免费DV证书)

监控服务:
  - 云监控 CM
  - 日志服务 CLS
```

#### 成本预估 (月费用)
```yaml
轻量应用服务器: 24元/月
云数据库MySQL: 30元/月
云数据库Redis: 9元/月
对象存储COS: 5元/月
CDN流量费: 5元/月
域名(年费): 55元/年 ≈ 5元/月
SSL证书: 免费
总计: 约78元/月
```

### 阿里云服务清单 (备选)

#### AI服务重点
```yaml
AI服务:
  - 通义千问API (主要AI服务)
  - 内容安全API (敏感词过滤)
  - OCR识别 (图片处理，可选)

其他服务:
  - ECS云服务器 (2核4G)
  - RDS MySQL (基础版)
  - OSS对象存储
  - CDN加速
```

---

## 开发环境搭建

### 项目目录结构
```
bazi-project/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── main.py            # FastAPI应用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # 数据库连接
│   │   ├── models/            # 数据模型
│   │   ├── schemas/           # Pydantic模型
│   │   ├── services/          # 业务逻辑
│   │   ├── api/               # API路由
│   │   └── utils/             # 工具函数
│   ├── tests/                 # 测试代码
│   ├── requirements.txt       # Python依赖
│   ├── Dockerfile            # Docker配置
│   └── alembic.ini           # 数据库迁移
├── miniprogram/               # 小程序前端
│   ├── pages/                # 页面
│   ├── components/           # 组件
│   ├── utils/                # 工具
│   ├── config/               # 配置
│   ├── app.js               # 应用入口
│   └── project.config.json   # 项目配置
├── deploy/                   # 部署配置
│   ├── docker/              # Docker相关
│   ├── nginx/               # Nginx配置
│   └── scripts/             # 部署脚本
├── docs/                    # 项目文档
└── .github/workflows/       # CI/CD配置
```

### Docker开发环境
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # MySQL数据库 (开发环境)
  mysql:
    image: mysql:8.0
    container_name: bazi-mysql-dev
    environment:
      MYSQL_ROOT_PASSWORD: root123456
      MYSQL_DATABASE: bazi_dev
      MYSQL_USER: bazi_user
      MYSQL_PASSWORD: bazi_pass123
    ports:
      - "3306:3306"
    volumes:
      - mysql_dev_data:/var/lib/mysql
      - ./backend/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
    networks:
      - bazi-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: bazi-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    command: redis-server --appendonly yes
    networks:
      - bazi-network

  # 后端API服务
  api:
    build: 
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: bazi-api-dev
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql://bazi_user:bazi_pass123@mysql:3306/bazi_dev
      - REDIS_URL=redis://redis:6379/0
      - ENV=development
      - QWEN_API_KEY=${QWEN_API_KEY}
      - QWEN_APP_ID=${QWEN_APP_ID}
    volumes:
      - ./backend:/app
    depends_on:
      - mysql
      - redis
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    networks:
      - bazi-network

volumes:
  mysql_dev_data:
  redis_dev_data:

networks:
  bazi-network:
    driver: bridge
```

### 配置文件模板
```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # 应用基础配置
    APP_NAME: str = "八字运势小程序API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # 环境配置
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV == "development"
    
    # 数据库配置 (开发生产一致)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql://bazi_user:bazi_pass123@localhost:3306/bazi_dev"
    )
    
    # Redis配置
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # 微信小程序配置
    WECHAT_APP_ID: Optional[str] = os.getenv("WECHAT_APP_ID")
    WECHAT_APP_SECRET: Optional[str] = os.getenv("WECHAT_APP_SECRET")
    
    # AI服务配置 (国内优先)
    QWEN_API_KEY: Optional[str] = os.getenv("QWEN_API_KEY")
    QWEN_APP_ID: Optional[str] = os.getenv("QWEN_APP_ID")
    BAIDU_API_KEY: Optional[str] = os.getenv("BAIDU_API_KEY")
    BAIDU_SECRET_KEY: Optional[str] = os.getenv("BAIDU_SECRET_KEY")
    
    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 文件存储配置 (腾讯云COS)
    COS_SECRET_ID: Optional[str] = os.getenv("COS_SECRET_ID")
    COS_SECRET_KEY: Optional[str] = os.getenv("COS_SECRET_KEY")
    COS_REGION: str = "ap-shanghai"
    COS_BUCKET: str = "bazi-static"
    
    # 日志配置
    LOG_LEVEL: str = "INFO" if ENV == "production" else "DEBUG"
    LOG_FILE: str = f"/var/log/bazi/app.log" if ENV == "production" else "app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 全局配置实例
settings = Settings()
```

### 小程序配置
```javascript
// miniprogram/config/index.js
const config = {
  development: {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 15000,
    enableDebug: true,
    enableMock: false,
    // 开发环境微信配置
    wechat: {
      appId: 'wx242bfcf732f6881e', // 开发环境AppID
    }
  },
  
  production: {
    baseURL: 'https://api.yourdomain.com/api/v1',
    timeout: 10000,
    enableDebug: false,
    enableMock: false,
    // 生产环境微信配置
    wechat: {
      appId: 'wx0987654321fedcba', // 生产环境AppID
    }
  }
};

// 自动检测环境
function getEnv() {
  const accountInfo = wx.getAccountInfoSync();
  const envVersion = accountInfo.miniProgram.envVersion;
  
  if (envVersion === 'develop' || envVersion === 'trial') {
    return 'development';
  }
  return 'production';
}

const currentEnv = getEnv();
module.exports = config[currentEnv];
```

---

## 生产环境架构

### 系统架构图
```
用户端:
┌─────────────────┐
│   微信小程序     │
│   (用户界面)    │
└─────────────────┘
         │
         ▼
网络层:
┌─────────────────┐
│   腾讯云CDN     │
│   (全国加速)    │
└─────────────────┘
         │
         ▼
接入层:
┌─────────────────┐    ┌─────────────────┐
│   Nginx         │────│   SSL证书       │
│   (负载均衡)    │    │   (HTTPS加密)   │
└─────────────────┘    └─────────────────┘
         │
         ▼
应用层:
┌─────────────────┐    ┌─────────────────┐
│   FastAPI       │────│   Redis         │
│   (业务逻辑)    │    │   (缓存)        │
└─────────────────┘    └─────────────────┘
         │
         ▼
数据层:
┌─────────────────┐    ┌─────────────────┐
│   MySQL 8.0     │────│   腾讯云COS     │
│   (主数据库)    │    │   (静态存储)    │
└─────────────────┘    └─────────────────┘
         │
         ▼
AI服务:
┌─────────────────┐    ┌─────────────────┐
│   阿里云通义千问 │────│   本地Ollama    │
│   (主AI服务)    │    │   (备用AI)      │
└─────────────────┘    └─────────────────┘
```

### 生产环境Docker配置
```yaml
# docker-compose.prod.yml
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
      - ./deploy/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./deploy/nginx/ssl:/etc/nginx/ssl
      - ./deploy/nginx/logs:/var/log/nginx
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - bazi-network

  # 后端API服务 (多实例)
  api:
    image: bazi-api:latest
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ENV=production
      - QWEN_API_KEY=${QWEN_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./logs:/var/log/bazi
    networks:
      - bazi-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: bazi-redis-prod
    volumes:
      - redis_prod_data:/data
      - ./deploy/redis/redis.conf:/etc/redis/redis.conf
    command: redis-server /etc/redis/redis.conf --appendonly yes
    restart: unless-stopped
    networks:
      - bazi-network

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
