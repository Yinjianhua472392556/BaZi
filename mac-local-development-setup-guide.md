# Mac电脑本地开发环境搭建指南

## 目录
1. [环境概述](#环境概述)
2. [前置要求](#前置要求)
3. [开发工具安装](#开发工具安装)
4. [Python环境配置](#python环境配置)
5. [数据库环境搭建](#数据库环境搭建)
6. [微信小程序开发环境](#微信小程序开发环境)
7. [项目初始化](#项目初始化)
8. [开发环境测试](#开发环境测试)
9. [常见问题解决](#常见问题解决)

---

## 环境概述

### 技术栈组件
- **操作系统**: macOS 10.15+
- **编程语言**: Python 3.11
- **Web框架**: FastAPI 0.104.1
- **数据库**: MySQL 8.0 + Redis 7.0
- **前端**: 微信小程序原生开发
- **容器化**: Docker Desktop for Mac
- **版本控制**: Git
- **代码编辑器**: VS Code + 微信开发者工具

### 环境架构
```
本地开发环境架构:
┌─────────────────┐    ┌─────────────────┐
│   微信开发者工具  │────│   小程序前端     │
│   (前端开发)     │    │   (用户界面)     │
└─────────────────┘    └─────────────────┘
         │                       │
         │              HTTP API调用
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   VS Code       │────│   FastAPI       │
│   (后端开发)     │    │   (业务逻辑)     │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Docker        │────│   MySQL+Redis   │
│   (容器管理)     │    │   (数据存储)     │
└─────────────────┘    └─────────────────┘
```

---

## 前置要求

### 系统要求
- **操作系统**: macOS 10.15 (Catalina) 及以上版本
- **内存**: 至少 8GB RAM（推荐 16GB）
- **存储空间**: 至少 20GB 可用空间
- **网络**: 稳定的互联网连接

### 权限要求
- 管理员权限（用于安装开发工具）
- 开发者账户访问权限
- 微信开发者账号

---

## 开发工具安装

### 1. 安装 Homebrew 包管理器

打开终端应用，执行以下命令：

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 验证安装
brew --version

# 更新 Homebrew
brew update
```

### 2. 安装 Git 版本控制

```bash
# 通过 Homebrew 安装 Git
brew install git

# 验证安装
git --version

# 配置 Git 用户信息
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱"
```

### 3. 安装 VS Code 代码编辑器

```bash
# 通过 Homebrew 安装 VS Code
brew install --cask visual-studio-code

# 或者从官网下载: https://code.visualstudio.com/
```

**推荐 VS Code 插件安装：**
- Python Extension Pack
- Python Docstring Generator
- GitLens
- Docker
- MySQL
- Chinese (Simplified) Language Pack

### 4. 安装 Docker Desktop

```bash
# 通过 Homebrew 安装 Docker Desktop
brew install --cask docker

# 启动 Docker Desktop 应用
open /Applications/Docker.app
```

**Docker 配置：**
- 内存分配：至少 4GB
- CPU 分配：至少 2 核心
- 启用 Kubernetes（可选）

### 5. 安装微信开发者工具

```bash
# 从官网下载微信开发者工具
# https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

# 或通过 Homebrew 安装
brew install --cask wechat-devtools
```

---

## Python环境配置

### 1. 安装 Python 3.11

```bash
# 通过 Homebrew 安装 Python 3.11
brew install python@3.11

# 验证安装
python3.11 --version

# 创建软链接（可选）
ln -s /opt/homebrew/bin/python3.11 /usr/local/bin/python3
```

### 2. 安装 pyenv (Python版本管理器)

```bash
# 安装 pyenv
brew install pyenv

# 配置 shell 环境
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# 重新加载 shell 配置
source ~/.zshrc

# 安装 Python 3.11
pyenv install 3.11.7
pyenv global 3.11.7

# 验证版本
python --version
```

### 3. 配置虚拟环境

```bash
# 创建项目目录
mkdir ~/Projects/bazi-miniprogram
cd ~/Projects/bazi-miniprogram

# 创建 Python 虚拟环境
python -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 更新 pip
pip install --upgrade pip

# 验证虚拟环境
which python
python --version
```

### 4. 安装项目依赖包

创建 `requirements.txt` 文件：

```bash
# 创建 requirements.txt 文件
cat > requirements.txt << 'EOF'
# 核心框架依赖
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
requests==2.31.0
pydantic==2.5.0

# 日期和时间处理
python-dateutil==2.8.2
pytz==2023.3

# 数据库相关
sqlalchemy==2.0.23
alembic==1.13.1
pymysql==1.1.0
cryptography==41.0.7

# Redis 缓存
redis==5.0.1

# 文件处理
aiofiles==23.2.1

# 安全相关
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# 八字计算专用库
sxtwl==1.1.3
zhdate==0.1
chinese-calendar==1.8.0
lunardate==0.2.0

# 开发和测试工具
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
black==23.11.0
flake8==6.1.0
mypy==1.7.1
coverage==7.3.2
EOF

# 安装所有依赖
pip install -r requirements.txt
```

### 5. 验证 Python 环境

```bash
# 测试关键包导入
python -c "
import fastapi
import uvicorn
import sqlalchemy
import redis
import requests
print('所有 Python 依赖包安装成功！')
"
```

---

## 数据库环境搭建

### 1. 创建 Docker 配置文件

在项目根目录创建 `docker-compose.dev.yml`：

```bash
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  # MySQL 数据库
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
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --sql-mode=STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO
    restart: unless-stopped
    networks:
      - bazi-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: bazi-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
      - ./redis/redis.conf:/etc/redis/redis.conf
    command: redis-server /etc/redis/redis.conf --appendonly yes
    restart: unless-stopped
    networks:
      - bazi-network

  # phpMyAdmin (数据库管理工具)
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: bazi-phpmyadmin-dev
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_USER: bazi_user
      PMA_PASSWORD: bazi_pass123
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - bazi-network

volumes:
  mysql_dev_data:
  redis_dev_data:

networks:
  bazi-network:
    driver: bridge
EOF
```

### 2. 创建数据库初始化文件

```bash
# 创建 SQL 目录
mkdir -p sql

# 创建数据库初始化脚本
cat > sql/init.sql << 'EOF'
-- 八字小程序数据库初始化脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS bazi_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bazi_dev;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信用户唯一标识',
    nickname VARCHAR(100) COMMENT '用户昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 八字计算记录表
CREATE TABLE IF NOT EXISTS bazi_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    birth_year INT NOT NULL COMMENT '出生年份',
    birth_month INT NOT NULL COMMENT '出生月份',
    birth_day INT NOT NULL COMMENT '出生日期',
    birth_hour INT NOT NULL COMMENT '出生小时',
    gender TINYINT DEFAULT 1 COMMENT '性别：1-男，2-女',
    year_gan_zhi VARCHAR(10) NOT NULL COMMENT '年柱',
    month_gan_zhi VARCHAR(10) NOT NULL COMMENT '月柱',
    day_gan_zhi VARCHAR(10) NOT NULL COMMENT '日柱',
    hour_gan_zhi VARCHAR(10) NOT NULL COMMENT '时柱',
    wuxing_analysis JSON COMMENT '五行分析结果',
    ai_analysis TEXT COMMENT 'AI分析结果',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='八字计算记录表';

-- 缘分测试记录表
CREATE TABLE IF NOT EXISTS yuanfen_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user1_bazi JSON NOT NULL COMMENT '用户1八字信息',
    user2_bazi JSON NOT NULL COMMENT '用户2八字信息',
    compatibility_score INT NOT NULL COMMENT '匹配度分数',
    analysis_result TEXT COMMENT '分析结果',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='缘分测试记录表';

-- 每日运势表
CREATE TABLE IF NOT EXISTS daily_fortune (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fortune_date DATE NOT NULL COMMENT '运势日期',
    top_zodiac JSON NOT NULL COMMENT '前三名最旺星座',
    content TEXT COMMENT '运势内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_date (fortune_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日运势表';

-- 插入初始数据
INSERT INTO daily_fortune (fortune_date, top_zodiac, content) VALUES
(CURDATE(), 
 JSON_ARRAY(
   JSON_OBJECT('name', '白羊座', 'score', 95, 'desc', '今日运势极佳，工作顺利'),
   JSON_OBJECT('name', '狮子座', 'score', 92, 'desc', '贵人运旺，感情甜蜜'),
   JSON_OBJECT('name', '射手座', 'score', 88, 'desc', '财运亨通，投资有收获')
 ),
 '今日整体运势平稳，适合处理重要事务');
EOF
```

### 3. 创建 Redis 配置文件

```bash
# 创建 Redis 配置目录
mkdir -p redis

# 创建 Redis 配置文件
cat > redis/redis.conf << 'EOF'
# Redis 开发环境配置

# 基本配置
port 6379
bind 0.0.0.0
protected-mode no

# 内存配置
maxmemory 256mb
maxmemory-policy allkeys-lru

# 持久化配置
save 900 1
save 300 10
save 60 10000

# 日志配置
loglevel notice
logfile ""

# 数据库配置
databases 16

# 网络配置
timeout 0
tcp-keepalive 300

# 其他配置
appendonly yes
appendfilename "appendonly.aof"
EOF
```

### 4. 启动数据库服务

```bash
# 启动所有数据库服务
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看日志
docker-compose -f docker-compose.dev.yml logs mysql
docker-compose -f docker-compose.dev.yml logs redis
```

### 5. 验证数据库连接

```bash
# 测试 MySQL 连接
mysql -h 127.0.0.1 -P 3306 -u bazi_user -pbazi_pass123 bazi_dev -e "SHOW TABLES;"

# 测试 Redis 连接
redis-cli -h 127.0.0.1 -p 6379 ping

# 访问 phpMyAdmin 管理界面
# 在浏览器中打开: http://localhost:8080
# 用户名: bazi_user
# 密码: bazi_pass123
```

---

## 微信小程序开发环境

### 1. 注册微信小程序

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号
3. 完成账号认证
4. 获取 AppID

### 2. 配置微信开发者工具

```bash
# 启动微信开发者工具
open /Applications/微信web开发者工具.app

# 或者通过命令行启动
/Applications/微信web开发者工具.app/Contents/MacOS/微信web开发者工具
```

**工具配置步骤：**
1. 使用微信扫码登录开发者工具
2. 创建新的小程序项目
3. 填入项目信息：
   - 项目名称：八字运势小程序
   - 目录：选择项目 miniprogram 目录
   - AppID：填入申请的小程序 AppID
   - 开发模式：小程序

### 3. 创建小程序项目结构

```bash
# 创建小程序目录
mkdir -p miniprogram

# 进入小程序目录
cd miniprogram

# 创建基础文件和目录结构
mkdir -p pages/index pages/bazi pages/yuanfen pages/result
mkdir -p components utils config images

# 创建 app.js
cat > app.js << 'EOF'
// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('八字运势小程序启动');
    
    // 检查更新
    this.checkUpdate();
    
    // 初始化配置
    this.initConfig();
  },

  globalData: {
    userInfo: null,
    apiBaseUrl: 'http://localhost:8000/api/v1'
  },

  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
    }
  },

  initConfig() {
    // 初始化网络配置
    wx.setStorageSync('apiBaseUrl', this.globalData.apiBaseUrl);
  }
});
EOF

# 创建 app.json
cat > app.json << 'EOF'
{
  "pages": [
    "pages/index/index",
    "pages/bazi/bazi",
    "pages/yuanfen/yuanfen",
    "pages/result/result"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#1890ff",
    "navigationBarTitleText": "八字运势",
    "navigationBarTextStyle": "white",
    "enablePullDownRefresh": false
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#1890ff",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/bazi/bazi",
        "text": "八字测算",
        "iconPath": "images/bazi.png", 
        "selectedIconPath": "images/bazi-active.png"
      },
      {
        "pagePath": "pages/yuanfen/yuanfen",
        "text": "缘分测试",
        "iconPath": "images/love.png",
        "selectedIconPath": "images/love-active.png"
      }
    ]
  },
  "useExtendedLib": {
    "vant": true
  },
  "sitemapLocation": "sitemap.json"
}
EOF

# 创建 app.wxss
cat > app.wxss << 'EOF'
/* app.wxss 全局样式 */
.container {
  padding: 20rpx;
  box-sizing: border-box;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 40rpx 0;
}

.disclaimer {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8rpx;
  padding: 20rpx;
  margin: 20rpx 0;
  font-size: 24rpx;
  color: #856404;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(45deg, #1890ff, #40a9ff);
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 24rpx;
  font-size: 32rpx;
  margin: 20rpx 0;
}

.btn-primary:active {
  background: linear-gradient(45deg, #0050b3, #1890ff);
}

/* 加载状态 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx;
  color: #999;
}
EOF

# 创建 sitemap.json
cat > sitemap.json << 'EOF'
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
EOF

# 创建 project.config.json
cat > project.config.json << 'EOF'
{
  "description": "八字运势小程序",
  "packOptions": {
    "ignore": [
      {
        "type": "file",
        "value": ".eslintrc.js"
      }
    ]
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "你的小程序AppID",
  "projectname": "bazi-miniprogram",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
EOF
```

### 4. 创建工具函数

```bash
# 创建网络请求工具
cat > utils/request.js << 'EOF'
// utils/request.js 网络请求封装
const baseURL = wx.getStorageSync('apiBaseUrl') || 'http://localhost:8000/api/v1';

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          wx.showToast({
            title: '请求失败',
            icon: 'error'
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        });
        reject(err);
      }
    });
  });
};

module.exports = {
  get: (url, data, header) => request({ url, method: 'GET', data, header }),
  post: (url, data, header) => request({ url, method: 'POST', data, header }),
  put: (url, data, header) => request({ url, method: 'PUT', data, header }),
  delete: (url, data, header) => request({ url, method: 'DELETE', data, header })
};
EOF

# 创建工具函数
cat > utils/util.js << 'EOF'
// utils/util.js 通用工具函数

// 格式化时间
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' ' +
    [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

// 显示加载中
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

// 隐藏加载
const hideLoading = () => {
  wx.hideLoading();
};

// 显示成功提示
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title,
    icon: 'success',
    duration: 2000
  });
};

// 显示错误提示
const showError = (title = '操作失败') => {
  wx.showToast({
    title,
    icon: 'error',
    duration: 2000
  });
};

// 本地存储
const storage = {
  set: (key, value) => {
    try {
      wx.setStorageSync(key, value);
    } catch (e) {
      console.error('存储失败:', e);
    }
  },
  get: (key) => {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      console.error('读取失败:', e);
      return null;
    }
  },
  remove: (key) => {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error('删除失败:', e);
    }
  }
};

module.exports = {
  formatTime,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  storage
};
EOF
```

---

## 项目初始化

### 1. 创建项目目录结构

```bash
# 返回项目根目录
cd ~/Projects/bazi-miniprogram

# 创建完整的项目结构
mkdir -p backend/app/{models,schemas,services,api,utils}
mkdir -p backend/tests
mkdir -p deploy/{docker,nginx,scripts}
mkdir -p docs

# 创建 .env 环境变量文件
cat > .env << 'EOF'
# 开发环境配置
ENV=development
DEBUG=true

# 数据库配置
DATABASE_URL=mysql://bazi_user:bazi_pass123@localhost:3306/bazi_dev
REDIS_URL=redis://localhost:6379/0

# 微信小程序配置
WECHAT_APP_ID=你的小程序AppID
WECHAT_APP_SECRET=你的小程序AppSecret

# AI服务配置
QWEN_API_KEY=你的通义千问API密钥
QWEN_APP_ID=你的通义千问应用ID

# 安全配置
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 文件存储配置（可选）
COS_SECRET_ID=你的腾讯云COS密钥ID
COS_SECRET_KEY=你的腾讯云COS密钥
COS_REGION=ap-shanghai
COS_BUCKET=bazi-static
EOF
```

### 2. 初始化 Git 仓库

```bash
# 初始化 Git 仓库
git init

# 创建 .gitignore 文件
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# 虚拟环境
venv/
env/
ENV/

# 环境变量
.env
.env.local
.env.development
.env.production

# 数据库
*.db
*.sqlite3

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db

# 日志文件
*.log
logs/

# 微信小程序
miniprogram/node_modules/
miniprogram/dist/

# Docker 数据
mysql_dev_data/
redis_dev_data/

# 临时文件
tmp/
temp/
*.tmp

# 密钥文件
*.pem
*.key
*.crt
EOF

# 添加所有文件到版本控制
git add .

# 创建首次提交
git commit -m "初始化八字小程序项目 - 开发环境搭建完成"
```

### 3. 创建基础 FastAPI 应用

```bash
# 创建后端目录
mkdir -p backend/app

# 创建主应用文件
cat > backend/app/main.py << 'EOF'
"""
八字运势小程序 - FastAPI 主应用
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建 FastAPI 应用实例
app = FastAPI(
    title="八字运势小程序 API",
    description="基于传统文化的娱乐性八字测算 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查接口
@app.get("/")
async def root():
    return {"message": "八字运势小程序 API 服务正常运行", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": os.getenv("ENV", "development"),
        "version": "1.0.0"
    }

# 测试接口
@app.get("/api/v1/test")
async def test_api():
    return {
        "message": "API 测试成功",
        "data": {
            "timestamp": "2025-09-19",
            "features": ["八字排盘", "缘分测试", "每日运势"]
        }
    }

# 异常处理
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "接口不存在", "error": "Not Found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "服务器内部错误", "error": "Internal Server Error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
EOF

# 创建配置文件
cat > backend/app/config.py << 'EOF'
"""
应用配置文件
"""
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
    
    # 数据库配置
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql://bazi_user:bazi_pass123@localhost:3306/bazi_dev"
    )
    
    # Redis配置
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # 微信小程序配置
    WECHAT_APP_ID: Optional[str] = os.getenv("WECHAT_APP_ID")
    WECHAT_APP_SECRET: Optional[str] = os.getenv("WECHAT_APP_SECRET")
    
    # AI服务配置
    QWEN_API_KEY: Optional[str] = os.getenv("QWEN_API_KEY")
    QWEN_APP_ID: Optional[str] = os.getenv("QWEN_APP_ID")
    
    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 文件存储配置
    COS_SECRET_ID: Optional[str] = os.getenv("COS_SECRET_ID")
    COS_SECRET_KEY: Optional[str] = os.getenv("COS_SECRET_KEY")
    COS_REGION: str = "ap-shanghai"
    COS_BUCKET: str = "bazi-static"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 全局配置实例
settings = Settings()
EOF
```

---

## 开发环境测试

### 1. 启动后端服务

```bash
# 激活虚拟环境
source venv/bin/activate

# 进入后端目录
cd backend

# 启动 FastAPI 开发服务器
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 或者直接运行主文件
python app/main.py
```

### 2. 测试 API 接口

在新的终端窗口中进行测试：

```bash
# 测试健康检查接口
curl http://localhost:8000/health

# 测试 API 接口
curl http://localhost:8000/api/v1/test

# 在浏览器中访问 API 文档
# http://localhost:8000/docs
```

### 3. 测试数据库连接

```bash
# 测试 MySQL 连接
python -c "
import pymysql
try:
    conn = pymysql.connect(
        host='localhost',
        port=3306,
        user='bazi_user',
        password='bazi_pass123',
        database='bazi_dev'
    )
    print('✅ MySQL 连接成功')
    conn.close()
except Exception as e:
    print(f'❌ MySQL 连接失败: {e}')
"

# 测试 Redis 连接
python -c "
import redis
try:
    r = redis.Redis(host='localhost', port=6379, db=0)
    r.ping()
    print('✅ Redis 连接成功')
except Exception as e:
    print(f'❌ Redis 连接失败: {e}')
"
```

### 4. 测试微信小程序

1. 在微信开发者工具中打开项目
2. 修改 `project.config.json` 中的 AppID
3. 编译并预览小程序
4. 检查控制台是否有错误信息

### 5. 完整环境验证清单

运行以下验证脚本：

```bash
# 创建环境验证脚本
cat > test_environment.py << 'EOF'
#!/usr/bin/env python3
"""
开发环境验证脚本
"""
import sys
import subprocess
import requests
import pymysql
import redis
from datetime import datetime

def check_python():
    """检查 Python 版本"""
    version = sys.version_info
    if version.major == 3 and version.minor >= 11:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python 版本过低: {version.major}.{version.minor}.{version.micro}")
        return False

def check_packages():
    """检查关键包"""
    packages = ['fastapi', 'uvicorn', 'sqlalchemy', 'redis', 'requests']
    results = []
    
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} 已安装")
            results.append(True)
        except ImportError:
            print(f"❌ {package} 未安装")
            results.append(False)
    
    return all(results)

def check_mysql():
    """检查 MySQL 连接"""
    try:
        conn = pymysql.connect(
            host='localhost',
            port=3306,
            user='bazi_user',
            password='bazi_pass123',
            database='bazi_dev'
        )
        print("✅ MySQL 连接成功")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ MySQL 连接失败: {e}")
        return False

def check_redis():
    """检查 Redis 连接"""
    try:
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis 连接成功")
        return True
    except Exception as e:
        print(f"❌ Redis 连接失败: {e}")
        return False

def check_api():
    """检查 API 服务"""
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ API 服务正常")
            return True
        else:
            print(f"❌ API 服务异常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API 服务无法访问: {e}")
        return False

def main():
    print("🔍 开始验证开发环境...")
    print("=" * 50)
    
    checks = [
        ("Python 版本", check_python),
        ("Python 包", check_packages),
        ("MySQL 数据库", check_mysql),
        ("Redis 缓存", check_redis),
        ("API 服务", check_api)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n📋 检查 {name}:")
        results.append(check_func())
    
    print("\n" + "=" * 50)
    if all(results):
        print("🎉 环境验证完成！所有组件正常运行")
    else:
        print("⚠️  环境验证失败，请检查上述错误并重新配置")
    
    print(f"🕐 验证时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
EOF

# 运行验证脚本
python test_environment.py
```

---

## 常见问题解决

### 1. Python 相关问题

**问题：pyenv 安装 Python 3.11 失败**
```bash
# 解决方案：安装必要的依赖
brew install openssl readline sqlite3 xz zlib

# 设置编译环境变量
export LDFLAGS="-L$(brew --prefix openssl)/lib -L$(brew --prefix readline)/lib -L$(brew --prefix sqlite)/lib -L$(brew --prefix zlib)/lib"
export CPPFLAGS="-I$(brew --prefix openssl)/include -I$(brew --prefix readline)/include -I$(brew --prefix sqlite)/include -I$(brew --prefix zlib)/include"

# 重新安装 Python
pyenv install 3.11.7
```

**问题：pip 安装包失败**
```bash
# 解决方案：升级 pip 并使用国内镜像
pip install --upgrade pip
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple/ package_name
```

### 2. Docker 相关问题

**问题：Docker Desktop 启动失败**
```bash
# 解决方案：重置 Docker Desktop
# 1. 完全退出 Docker Desktop
# 2. 删除 Docker 数据
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/.docker

# 3. 重新启动 Docker Desktop
open /Applications/Docker.app
```

**问题：MySQL 容器启动失败**
```bash
# 解决方案：清理 Docker 数据并重新启动
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
docker-compose -f docker-compose.dev.yml up -d
```

### 3. 数据库连接问题

**问题：MySQL 连接被拒绝**
```bash
# 检查 MySQL 容器状态
docker ps | grep mysql

# 查看 MySQL 日志
docker logs bazi-mysql-dev

# 重启 MySQL 容器
docker restart bazi-mysql-dev
```

**问题：Redis 连接超时**
```bash
# 检查 Redis 容器状态
docker ps | grep redis

# 查看 Redis 日志
docker logs bazi-redis-dev

# 重启 Redis 容器
docker restart bazi-redis-dev

# 测试 Redis 连接
redis-cli -h 127.0.0.1 -p 6379 ping
```

### 4. 微信小程序问题

**问题：小程序无法预览**
```bash
# 解决方案：
# 1. 检查 AppID 是否正确
# 2. 确认开发者工具版本是否最新
# 3. 检查项目路径是否正确

# 更新开发者工具
# 在工具菜单中选择 "检查更新"
```

**问题：网络请求失败**
```bash
# 解决方案：
# 1. 在开发者工具中启用 "不校验合法域名"
# 2. 确认后端 API 服务正在运行
# 3. 检查 CORS 配置是否正确
```

### 5. 端口冲突问题

**问题：端口 3306 已被占用**
```bash
# 查看端口占用情况
lsof -i :3306

# 停止占用端口的进程
sudo kill -9 PID

# 或者修改 docker-compose.dev.yml 中的端口映射
# 将 "3306:3306" 改为 "3307:3306"
```

### 6. 权限问题

**问题：Docker 权限不足**
```bash
# 解决方案：将当前用户添加到 docker 组
sudo dscl . -append /Groups/docker GroupMembership $(whoami)

# 重新登录或重启终端
```

### 7. 网络问题

**问题：Homebrew 安装慢**
```bash
# 使用国内镜像
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles' >> ~/.zshrc
source ~/.zshrc

# 重新安装
brew install package_name
```

---

## 开发环境维护

### 日常维护命令

```bash
# 更新系统包
brew update && brew upgrade

# 更新 Python 包
pip list --outdated
pip install --upgrade package_name

# 清理 Docker 资源
docker system prune -f
docker volume prune -f

# 重启开发服务
docker-compose -f docker-compose.dev.yml restart

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f
```

### 备份与恢复

```bash
# 备份数据库
docker exec bazi-mysql-dev mysqldump -u bazi_user -pbazi_pass123 bazi_dev > backup.sql

# 恢复数据库
docker exec -i bazi-mysql-dev mysql -u bazi_user -pbazi_pass123 bazi_dev < backup.sql

# 备份 Redis 数据
docker exec bazi-redis-dev redis-cli save
docker cp bazi-redis-dev:/data/dump.rdb ./redis_backup.rdb
```

### 性能优化建议

1. **内存使用优化**
   - 调整 Docker Desktop 内存分配
   - 关闭不必要的应用程序
   - 使用 Redis 内存优化配置

2. **启动速度优化**
   - 使用 SSD 存储
   - 优化 Python 虚拟环境位置
   - 缓存 Docker 镜像

3. **开发效率提升**
   - 配置 IDE 自动补全
   - 使用热重载功能
   - 设置代码格式化工具

---

## 总结

通过以上步骤，您已经成功在 Mac 电脑上搭建了八字运势小程序的完整开发环境，包括：

✅ **开发工具**: Homebrew、Git、VS Code、Docker、微信开发者工具  
✅ **Python 环境**: Python 3.11、虚拟环境、项目依赖包  
✅ **数据库环境**: MySQL 8.0、Redis 7.0、phpMyAdmin  
✅ **小程序环境**: 项目结构、配置文件、工具函数  
✅ **API 服务**: FastAPI 应用、健康检查、配置管理  
✅ **开发工具**: 环境验证、错误处理、维护脚本

现在您可以开始进行八字小程序的功能开发了！如遇到问题，请参考常见问题解决部分或查看相关日志信息。

**下一步建议：**
1. 完善 API 接口开发（八字计算、缘分测试等）
2. 开发小程序页面和交互功能
3. 集成 AI 服务进行个性化分析
4. 进行功能测试和性能优化
5. 准备生产环境部署

祝您开发顺利！🚀
