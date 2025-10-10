# 八字运势小程序 - 快速部署指南 (28元/月方案)

## 🎯 部署概览

**总成本**: 28元/月  
**部署时间**: 30-60分钟  
**技术栈**: FastAPI + Nginx + 腾讯云轻量服务器  

## 📋 部署清单

### ✅ 准备工作 (5分钟)
- [ ] 腾讯云轻量应用服务器 2核4G (24元/月)
- [ ] 域名 (可选，50元/年，约4元/月)
- [ ] 本地电脑安装git、ssh工具

### ✅ 服务器配置 (必填项)
- [ ] 服务器IP地址
- [ ] SSH用户名和密码/密钥
- [ ] 域名(如果有)
- [ ] 邮箱地址(用于SSL证书)

## 🚀 快速部署步骤

### 第一步：购买腾讯云服务器 (5分钟)

1. **访问腾讯云轻量服务器**: https://cloud.tencent.com/product/lighthouse
2. **选择配置**:
   - 地域: 选择离您最近的(上海/北京/广州)
   - 镜像: Ubuntu 20.04 LTS
   - 套餐: 2核4GB内存 60GB SSD 5M带宽
   - 购买时长: 按需选择
3. **安全组配置**:
   - 开放端口: 22(SSH), 80(HTTP), 443(HTTPS), 8001(API)
4. **获取服务器信息**:
   - 记录公网IP地址
   - 记录root密码或配置SSH密钥

### 第二步：配置部署参数 (5分钟)

1. **修改配置文件**:
```bash
cd bazi-miniprogram/deployment
vim deploy_config.sh
```

2. **必填配置项**:
```bash
# 🔧 【必填】服务器基本信息
export SERVER_IP="123.456.789.123"           # 替换为您的服务器IP
export DOMAIN_NAME="yourdomain.com"           # 如果有域名就填写，没有就用IP
export API_SUBDOMAIN="api.yourdomain.com"     # 如果有域名就填写，没有就用IP

# 🔐 【必填】SSH连接信息  
export SSH_USER="root"                        # 通常是root
export SSH_PORT="22"                          # 默认22

# 🌐 【必填】SSL证书配置
export SSL_EMAIL="your-email@example.com"     # 替换为您的邮箱
```

3. **验证配置**:
```bash
bash deploy_config.sh
```

### 第三步：执行一键部署 (15-20分钟)

```bash
bash auto_deploy.sh
```

**脚本会自动执行**:
- ✅ 系统更新和依赖安装
- ✅ Python环境配置
- ✅ 项目代码部署
- ✅ 系统服务创建
- ✅ Nginx反向代理配置
- ✅ SSL证书申请(如果有域名)
- ✅ 服务启动和验证

### 第四步：验证部署结果 (5分钟)

1. **API健康检查**:
```bash
# 如果有域名和SSL
curl https://api.yourdomain.com/health

# 如果没有域名，使用IP
curl http://123.456.789.123:8001/health
```

2. **测试API功能**:
```bash
# 测试八字计算
curl -X POST http://您的服务器IP:8001/api/v1/calculate-bazi \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":5,"day":15,"hour":10,"gender":"male"}'
```

### 第五步：配置小程序 (10分钟)

1. **修改API地址**:
```javascript
// miniprogram/app.js 或相关配置文件
const API_BASE_URL = 'https://api.yourdomain.com'  // 或 'http://您的IP:8001'
```

2. **微信后台配置**:
   - 登录: https://mp.weixin.qq.com
   - 开发设置 → 服务器域名
   - 添加: `https://api.yourdomain.com` (或使用IP地址)

3. **上传小程序代码**:
   - 微信开发者工具导入项目
   - 编译测试
   - 上传代码

## 🔧 无域名快速方案

如果您暂时没有域名，可以直接使用IP地址快速上线：

1. **修改配置**:
```bash
export DOMAIN_NAME="123.456.789.123"      # 直接使用IP
export API_SUBDOMAIN="123.456.789.123"    # 直接使用IP
export ENABLE_SSL="no"                     # 暂时不启用SSL
```

2. **小程序配置**:
```javascript
const API_BASE_URL = 'http://123.456.789.123:8001'
```

3. **微信后台**:
   - 服务器域名配置: `123.456.789.123:8001`

## 📊 成本分析

| 项目 | 费用 | 说明 |
|------|------|------|
| 腾讯云轻量服务器 2核4G | 24元/月 | 基础运行环境 |
| 域名 | 4元/月 | 可选，50元/年 |
| SSL证书 | 免费 | Let's Encrypt |
| **总计** | **28元/月** | 不含域名仅24元/月 |

## ⚡ 性能预期

- **并发处理**: 50-100并发用户
- **响应时间**: 100-300ms
- **服务可用性**: 99.9%
- **扩展能力**: 可无缝升级到更高配置

## 🛠️ 运维管理

### 常用命令
```bash
# 查看服务状态
systemctl status bazi-api

# 重启服务
systemctl restart bazi-api

# 查看日志
journalctl -u bazi-api -f

# 检查API健康
curl http://localhost:8001/health
```

### 服务管理
```bash
# 停止服务
systemctl stop bazi-api

# 启动服务  
systemctl start bazi-api

# 重启Nginx
systemctl restart nginx
```

## 🚨 常见问题

### 1. SSH连接失败
**解决方案**:
- 检查服务器IP是否正确
- 确认SSH端口(22)已开放
- 验证用户名和密码

### 2. API无法访问
**解决方案**:
```bash
# 检查服务状态
systemctl status bazi-api

# 检查端口监听
netstat -tlnp | grep 8001

# 检查防火墙
ufw status
```

### 3. 小程序无法连接API
**解决方案**:
- 确认微信后台域名配置正确
- 检查API地址是否正确
- 确认服务器防火墙已开放相应端口

## 🎉 部署完成检查清单

- [ ] 服务器购买并配置完成
- [ ] 部署脚本执行成功
- [ ] API健康检查通过
- [ ] 小程序API地址配置正确
- [ ] 微信后台域名配置完成
- [ ] 功能测试通过

## 📞 技术支持

如果遇到问题:
1. 查看部署日志: `deployment/deploy_*.log`
2. 检查系统日志: `journalctl -u bazi-api`
3. 网络连接测试: `ping`, `telnet`, `curl`

---

**祝您部署成功！28元/月即可享受专业八字运势小程序服务！** 🎊
