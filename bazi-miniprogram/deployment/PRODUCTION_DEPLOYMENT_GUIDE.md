# 八字运势小程序 - 线上部署指导

## 🚀 服务器部署步骤

### 环境信息
- **服务器IP**: 119.91.146.128
- **域名**: bazi365.top
- **API子域名**: api.bazi365.top
- **SSL邮箱**: 18620526218@163.com

### 第一步：连接服务器

```bash
# 使用SSH连接到服务器
ssh root@119.91.146.128

# 或使用您的SSH密钥
ssh -i ~/.ssh/your_key root@119.91.146.128
```

### 第二步：准备部署环境

```bash
# 更新系统
apt update && apt upgrade -y

# 创建部署目录
mkdir -p /opt/bazi-app

# 切换到部署目录
cd /opt/bazi-app
```

### 第三步：克隆项目代码

```bash
# 克隆最新代码
git clone https://github.com/Yinjianhua472392556/BaZi.git

# 进入项目目录
cd BaZi/bazi-miniprogram/deployment
```

### 第四步：执行自动部署

```bash
# 运行部署脚本
bash auto_deploy.sh
```

## 📋 部署脚本功能说明

修复后的 `auto_deploy.sh` 脚本将自动执行以下操作：

### 1. 环境检测 🔍
- 自动判断本地/远程部署模式
- 检查系统工具和依赖
- 验证配置文件完整性

### 2. 系统准备 ⚙️
- 安装Python 3、pip、nginx等基础软件
- 创建应用用户和目录
- 设置权限和环境变量

### 3. 代码部署 📦
- 创建Python虚拟环境
- 安装项目依赖包
- 验证算法模块正常

### 4. 服务配置 🔧
- 创建systemd服务（直接使用main.py）
- 配置Nginx反向代理
- 申请和配置SSL证书

### 5. 启动验证 ✅
- 启动API服务和Nginx
- 检查服务状态
- 测试API访问

## 🛠 部署配置说明

### 核心配置文件
- `deploy_config.sh` - 服务器和域名配置
- `auto_deploy.sh` - 主部署脚本
- `DEPLOYMENT_FIX_GUIDE.md` - 问题修复说明

### 关键修复点
1. **systemd服务路径**：直接使用 `main.py` 而不是 `production_server.py`
2. **环境检测**：自动判断部署模式，本地部署时跳过SSH
3. **配置验证**：检查必填项和格式正确性
4. **错误处理**：提供诊断和修复建议

## 📊 部署验证

### 检查服务状态
```bash
# 检查API服务
systemctl status bazi-api

# 检查Nginx状态  
systemctl status nginx

# 查看服务日志
journalctl -u bazi-api -f
```

### 测试API访问
```bash
# 本地测试
curl http://localhost:8001/health

# 域名测试
curl https://api.bazi365.top/health
```

### 验证端口监听
```bash
# 检查端口占用
netstat -tlnp | grep -E ':(80|443|8001) '
```

## 🔧 常见问题解决

### 1. 服务启动失败
```bash
# 查看详细错误信息
systemctl status bazi-api --no-pager -l
journalctl -u bazi-api --no-pager -n 50

# 手动测试启动
cd /opt/bazi-app/BaZi/bazi-miniprogram
source venv/bin/activate
python main.py
```

### 2. 域名访问失败
```bash
# 检查DNS解析
nslookup api.bazi365.top

# 检查防火墙
ufw status
```

### 3. SSL证书问题
```bash
# 重新申请证书
certbot --nginx -d api.bazi365.top --email 18620526218@163.com --agree-tos --non-interactive
```

## 🎯 部署成功标志

✅ **部署成功后您应该看到：**

1. **服务运行正常**
   ```bash
   systemctl status bazi-api
   # ● bazi-api.service - 八字运势小程序 API服务
   #    Active: active (running)
   ```

2. **API健康检查通过**
   ```bash
   curl https://api.bazi365.top/health
   # 返回: {"status": "healthy"}
   ```

3. **端口正常监听**
   ```bash
   netstat -tlnp | grep :8001
   # tcp 0 0 0.0.0.0:8001 0.0.0.0:* LISTEN
   ```

## 📱 小程序配置更新

部署成功后，需要更新小程序中的API地址：

```javascript
// miniprogram/app.js
App({
  globalData: {
    apiBaseUrl: 'https://api.bazi365.top'
  }
})
```

## 🔄 日常维护

### 服务管理命令
```bash
# 重启API服务
systemctl restart bazi-api

# 重载Nginx配置
systemctl reload nginx

# 查看实时日志
tail -f /var/log/nginx/api.bazi365.top_access.log
```

### 更新代码
```bash
cd /opt/bazi-app/BaZi
git pull origin main
systemctl restart bazi-api
```

---

**部署支持**: 如有问题请查看 `DEPLOYMENT_FIX_GUIDE.md` 或提供错误日志进行分析
