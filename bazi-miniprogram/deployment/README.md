# 八字运势小程序 - 终极万能部署脚本

## 🎯 概述

**一个脚本解决所有问题！** 

这是一个完全重写的终极部署脚本，集成了所有修复功能，专为腾讯云服务器优化。

## 📁 文件结构

```
deployment/
├── auto_deploy.sh      # 👑 终极万能部署脚本 (唯一需要的脚本)
├── deploy_config.sh    # 📝 配置文件
└── README.md          # 📖 使用说明 (本文件)
```

## 🚀 快速部署 (3步完成)

### 第1步：修改配置

```bash
vim deploy_config.sh
```

**必须修改的配置项**：
```bash
export SERVER_IP="您的腾讯云服务器IP"
export API_SUBDOMAIN="api.您的域名.com"  
export SSL_EMAIL="您的邮箱@example.com"
```

### 第2步：执行部署

```bash
sudo bash auto_deploy.sh
```

### 第3步：验证结果

```bash
# 测试API访问
curl https://api.您的域名.com/health
# 或
curl http://您的IP:8001/health
```

## ✨ 脚本特性

### 🔧 智能功能
- ✅ **全自动部署** - 无需手动干预
- ✅ **智能SSL修复** - 自动解决证书问题
- ✅ **错误自动修复** - 遇到问题自动诊断修复
- ✅ **进度实时显示** - 清晰的部署进度
- ✅ **详细日志记录** - 完整的操作日志

### 🛡️ 安全特性
- ✅ **HTTPS自动配置** - Let's Encrypt免费证书
- ✅ **安全头设置** - 完整的Web安全配置
- ✅ **权限管理** - 最小权限原则
- ✅ **自动续期** - SSL证书自动续期

### 🔄 容错特性
- ✅ **多重备选方案** - SSL失败自动回退HTTP
- ✅ **智能重试机制** - 关键步骤自动重试
- ✅ **环境冲突处理** - 自动清理端口冲突
- ✅ **服务健康检查** - 全面的部署验证

## 📊 部署步骤详解

脚本自动执行以下12个步骤：

1. **配置验证** - 检查配置文件完整性
2. **系统环境** - 安装基础依赖和工具
3. **用户目录** - 创建应用用户和目录
4. **代码部署** - 克隆最新代码到服务器
5. **Python环境** - 配置虚拟环境和依赖
6. **系统服务** - 创建systemd服务
7. **SSL证书** - 智能申请和配置SSL证书
8. **Nginx配置** - 配置反向代理和HTTPS
9. **服务启动** - 启动所有相关服务
10. **功能验证** - 全面测试API功能
11. **状态检查** - 验证服务运行状态
12. **生成报告** - 输出详细部署报告

## ⚙️ 服务管理

### 常用命令
```bash
# 查看服务状态
systemctl status bazi-api
systemctl status nginx

# 重启服务
systemctl restart bazi-api
systemctl restart nginx

# 查看日志
journalctl -u bazi-api -f
tail -f /var/log/nginx/api.您的域名.com_access.log

# 测试API
curl http://localhost:8001/health
curl https://api.您的域名.com/health
```

### 故障排除
```bash
# 检查端口监听
netstat -tlnp | grep -E ':(80|443|8001)'

# 检查证书状态
openssl x509 -in /etc/letsencrypt/live/api.您的域名.com/fullchain.pem -text -noout | grep "Not After"

# 检查Nginx配置
nginx -t

# 重新申请SSL证书
certbot certonly --standalone -d api.您的域名.com --force-renewal
```

## 🌐 小程序配置

部署完成后，更新小程序API地址：

```javascript
// miniprogram/app.js
App({
  globalData: {
    // HTTPS (推荐)
    apiBaseUrl: 'https://api.您的域名.com'
    
    // 或 HTTP (备用)
    // apiBaseUrl: 'http://您的IP:8001'
  }
})
```

## 📋 配置说明

### 必填配置
| 配置项 | 说明 | 示例 |
|--------|------|------|
| `SERVER_IP` | 腾讯云服务器公网IP | `119.91.146.128` |
| `API_SUBDOMAIN` | API子域名 | `api.example.com` |
| `SSL_EMAIL` | SSL证书申请邮箱 | `admin@example.com` |

### 可选配置
| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `ENABLE_SSL` | `yes` | 是否启用SSL证书 |
| `SERVICE_PORT` | `8001` | API服务端口 |
| `DEPLOY_PATH` | `/opt/bazi-app` | 部署路径 |

## 💰 成本说明

**月总成本**: 约28元
- 腾讯云轻量服务器 2核4G: 24元/月
- 域名(可选): 4元/月 (50元/年)
- SSL证书: 免费 (Let's Encrypt)

## ❓ 常见问题

### Q: HTTPS访问失败怎么办？
A: 脚本会自动尝试多种SSL申请方式，如果都失败会自动回退到HTTP。可以检查：
1. 域名DNS解析是否正确
2. 腾讯云安全组是否开放443端口
3. 重新运行脚本进行SSL修复

### Q: 如何重新部署？
A: 直接重新运行 `sudo bash auto_deploy.sh` 即可，脚本会自动备份现有代码。

### Q: 如何查看详细日志？
A: 日志文件位置会在部署开始时显示，通常在 `/tmp/bazi_deploy_*.log`

### Q: 服务启动失败怎么办？
A: 脚本有自动修复功能，会尝试诊断和修复常见问题。如果仍有问题，请查看具体的错误日志。

## 🎉 部署完成检查清单

- [ ] 配置文件已正确修改
- [ ] 脚本执行成功无错误
- [ ] API健康检查返回正常
- [ ] 小程序API地址已更新
- [ ] 域名DNS解析配置正确
- [ ] 腾讯云安全组端口开放

---

**🎊 享受您的八字运势小程序部署之旅！**

> 如有问题，请查看详细日志或重新运行部署脚本。
