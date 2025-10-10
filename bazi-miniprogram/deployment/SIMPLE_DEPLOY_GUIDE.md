# 八字运势小程序 - 极简部署指导

## 🚀 腾讯云服务器一键部署

### 环境信息
- **服务器**: 119.91.146.128 (腾讯云)
- **域名**: api.bazi365.top
- **SSL**: 自动配置

### 💡 部署步骤（仅需2个命令）

在腾讯云服务器终端中执行：

```bash
# 1. 克隆代码
git clone https://github.com/Yinjianhua472392556/BaZi.git

# 2. 执行部署
cd BaZi/bazi-miniprogram/deployment && bash auto_deploy.sh
```

## ✨ 脚本自动完成的工作

### 🔧 系统环境
- 更新系统包
- 安装 Python 3 + pip + venv
- 安装 Nginx + SSL 工具
- 创建应用用户和目录

### 📦 应用部署
- 创建 Python 虚拟环境
- 安装项目依赖
- 配置 systemd 服务
- 设置 Nginx 反向代理

### 🔒 SSL 配置
- 自动申请 Let's Encrypt 证书
- 配置 HTTPS 重定向
- 设置证书自动续期

### ✅ 验证启动
- 启动 API 服务
- 检查服务状态
- 测试 API 访问

## 🎯 部署完成标志

看到以下信息表示部署成功：

```
✅ API服务启动成功
✅ Nginx服务启动成功
✅ SSL证书配置完成
🎉 部署完成！

API地址: https://api.bazi365.top/health
```

## 🔍 验证部署

部署完成后，可以通过以下方式验证：

```bash
# 检查服务状态
systemctl status bazi-api

# 测试API访问
curl https://api.bazi365.top/health

# 查看服务日志
journalctl -u bazi-api -f
```

## ⚡ 常用管理命令

```bash
# 重启服务
systemctl restart bazi-api

# 重载Nginx
systemctl reload nginx

# 查看实时日志
tail -f /var/log/nginx/api.bazi365.top_access.log
```

## 🔄 代码更新

如需更新代码：

```bash
cd /opt/bazi-app/BaZi
git pull origin main
systemctl restart bazi-api
```

---

**就是这么简单！** 克隆代码 → 执行脚本 → 部署完成 🎉
