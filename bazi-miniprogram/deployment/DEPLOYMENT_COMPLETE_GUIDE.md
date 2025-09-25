# 八字运势小程序 - 完整部署指南

## 📋 概述

本指南将帮助你完成八字运势小程序从服务器部署到小程序发布的完整流程。整个过程分为两个主要部分：

1. **服务器部署** - 在阿里云服务器上部署后端API服务
2. **小程序发布** - 配置并发布微信小程序

## 🎯 前置准备

### 必需资源
- ✅ 阿里云ECS服务器（1核2GB及以上）
- ✅ 域名（用于API服务）
- ✅ 微信小程序账号（已认证）
- ✅ GitHub代码仓库访问权限

### 预计时间
- **服务器部署**: 15-20分钟
- **小程序配置**: 10-15分钟
- **审核等待**: 1-7天
- **总计**: 约30分钟配置 + 审核时间

### 预计成本
- **ECS服务器**: ~100元/月
- **域名**: ~50元/年
- **SSL证书**: 免费(Let's Encrypt)
- **总成本**: ~100元/月

---

## 🚀 第一阶段：服务器部署

### 📝 步骤1：配置部署参数

1. **修改配置文件**
   ```bash
   cd bazi-miniprogram/deployment
   vim deploy_config.sh
   ```

2. **必填配置项**
   ```bash
   # 服务器信息
   export SERVER_IP="123.456.789.0"              # 你的服务器IP
   export DOMAIN_NAME="example.com"               # 你的域名
   export API_SUBDOMAIN="api.example.com"        # API子域名
   
   # SSL证书
   export SSL_EMAIL="your-email@example.com"     # 你的邮箱
   ```

3. **验证配置**
   ```bash
   bash deploy_config.sh
   ```

### 🔧 步骤2：执行自动部署

1. **运行部署脚本**
   ```bash
   bash auto_deploy.sh
   ```

2. **部署过程监控**
   部署脚本将自动执行以下步骤：
   - ✅ 系统更新和依赖安装
   - ✅ Python环境配置
   - ✅ 项目代码克隆
   - ✅ 系统服务创建
   - ✅ Nginx反向代理配置
   - ✅ SSL证书申请
   - ✅ 服务启动和验证

3. **部署结果验证**
   ```bash
   # 检查API服务状态
   curl https://api.yourdomain.com/health
   
   # 检查服务运行状态
   systemctl status bazi-api
   ```

### 📊 步骤3：配置DNS解析

在你的域名服务商处配置DNS记录：

```
类型    名称    值               TTL
A       api     123.456.789.0    600
```

---

## 📱 第二阶段：小程序发布

### 📝 步骤1：配置小程序参数

1. **修改配置文件**
   ```bash
   cd bazi-miniprogram/deployment
   vim miniprogram_config.js
   ```

2. **必填配置项**
   ```javascript
   module.exports = {
     appId: 'wx1234567890abcdef',                    // 小程序AppID
     production: {
       apiDomain: 'https://api.yourdomain.com',     // API域名
     },
     wechat: {
       account: 'your-wechat-email@example.com',    // 微信账号
     },
     version: '1.0.0',                              // 版本号
   }
   ```

### 🔧 步骤2：准备发布包

1. **运行准备脚本**
   ```bash
   node prepare_miniprogram.js production
   ```

2. **验证生成结果**
   脚本将自动：
   - ✅ 更新API地址为生产环境
   - ✅ 清理开发代码和console语句
   - ✅ 优化图片资源
   - ✅ 生成版本信息
   - ✅ 测试API连接
   - ✅ 创建发布指南

### 📤 步骤3：上传小程序代码

1. **打开微信开发者工具**
   - 导入项目：选择 `miniprogram` 目录
   - 确认AppID正确

2. **编译检查**
   - 点击"编译"按钮
   - 确保没有错误和警告
   - 测试主要功能页面

3. **上传代码**
   - 点击"上传"按钮
   - 版本号：1.0.0
   - 项目备注：首次发布版本
   - 确认上传

### 🌐 步骤4：配置微信后台

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用你的微信账号登录

2. **配置服务器域名**
   ```
   设置 > 开发设置 > 服务器域名
   
   request合法域名：https://api.yourdomain.com
   socket合法域名：https://api.yourdomain.com
   uploadFile合法域名：https://api.yourdomain.com
   downloadFile合法域名：https://api.yourdomain.com
   ```

3. **业务域名配置**（可选）
   ```
   设置 > 开发设置 > 业务域名
   
   业务域名：api.yourdomain.com
   ```

### 📋 步骤5：提交审核

1. **进入版本管理**
   ```
   开发管理 > 版本管理 > 开发版本
   ```

2. **提交审核**
   - 点击"提交审核"
   - 填写功能页面介绍
   - 上传功能截图
   - 填写版本说明
   - 提交审核

3. **等待审核结果**
   - 审核时间：1-7个工作日
   - 可在"审核版本"查看状态

### 🎉 步骤6：发布上线

1. **审核通过后**
   - 在"审核版本"中点击"发布"
   - 确认发布信息
   - 小程序正式上线

---

## 🔧 运维和维护

### 📊 服务监控

1. **API服务状态检查**
   ```bash
   # 查看服务状态
   systemctl status bazi-api
   
   # 查看实时日志
   journalctl -u bazi-api -f
   
   # 重启服务
   systemctl restart bazi-api
   ```

2. **Nginx状态检查**
   ```bash
   # 查看Nginx状态
   systemctl status nginx
   
   # 查看访问日志
   tail -f /var/log/nginx/api.yourdomain.com_access.log
   
   # 重载配置
   systemctl reload nginx
   ```

### 🔐 SSL证书维护

```bash
# 检查证书有效期
certbot certificates

# 手动续期
certbot renew

# 测试自动续期
certbot renew --dry-run
```

### 📱 小程序更新

1. **代码更新流程**
   ```bash
   # 拉取最新代码
   git pull origin main
   
   # 准备发布包
   node prepare_miniprogram.js production
   
   # 上传新版本（在微信开发者工具中）
   ```

2. **版本管理**
   - 及时更新版本号
   - 记录详细的更新日志
   - 备份重要版本

---

## 🛠️ 故障排除

### 常见问题

#### 1. API服务无法访问
**症状**: 小程序提示网络错误
**排查步骤**:
```bash
# 检查服务状态
systemctl status bazi-api

# 检查端口监听
netstat -tlnp | grep 8001

# 检查防火墙
ufw status

# 测试API
curl https://api.yourdomain.com/health
```

#### 2. SSL证书问题
**症状**: 浏览器提示证书错误
**解决方案**:
```bash
# 重新申请证书
certbot --nginx -d api.yourdomain.com

# 检查证书状态
openssl s_client -connect api.yourdomain.com:443
```

#### 3. 域名解析问题
**症状**: 域名无法访问
**排查步骤**:
```bash
# 检查DNS解析
nslookup api.yourdomain.com

# 检查域名配置
dig api.yourdomain.com
```

#### 4. 小程序审核被拒
**常见原因**:
- 功能描述不准确
- 缺少用户协议
- 涉嫌违规内容
- 测试账号信息不完整

**解决方案**:
- 仔细阅读拒绝原因
- 完善功能描述和截图
- 添加必要的用户协议
- 提供完整的测试信息

---

## 📞 技术支持

### 获取帮助

1. **查看日志文件**
   ```bash
   # 部署日志
   cat deployment/deploy_*.log
   
   # 服务日志
   journalctl -u bazi-api --since "1 hour ago"
   
   # Nginx错误日志
   tail -f /var/log/nginx/error.log
   ```

2. **性能监控**
   ```bash
   # 系统资源使用
   htop
   
   # 磁盘使用
   df -h
   
   # 网络连接
   netstat -tuln
   ```

3. **备份重要数据**
   ```bash
   # 备份配置文件
   tar -czf config_backup_$(date +%Y%m%d).tar.gz /opt/bazi-app
   
   # 备份数据库（如有）
   # mysqldump -u root -p database_name > backup.sql
   ```

### 联系方式

- **技术文档**: 参考项目README和相关文档
- **GitHub Issues**: 在项目仓库创建Issue
- **社区支持**: 查看项目Wiki和讨论区

---

## ✅ 部署检查清单

### 服务器部署 ✓
- [ ] 阿里云ECS服务器准备完成
- [ ] 域名购买和DNS配置完成
- [ ] deploy_config.sh配置正确
- [ ] auto_deploy.sh执行成功
- [ ] API服务正常运行
- [ ] SSL证书配置成功
- [ ] 防火墙端口开放正确

### 小程序配置 ✓
- [ ] 微信小程序账号准备完成
- [ ] miniprogram_config.js配置正确
- [ ] prepare_miniprogram.js执行成功
- [ ] 代码上传到微信后台
- [ ] 服务器域名配置完成
- [ ] 功能测试通过
- [ ] 审核材料准备完整

### 上线验证 ✓
- [ ] API接口响应正常
- [ ] 小程序功能正常
- [ ] 用户体验良好
- [ ] 监控和日志正常
- [ ] 备份策略实施
- [ ] 运维文档完整

---

**文档版本**: v1.0  
**更新时间**: 2025年9月25日  
**适用版本**: 八字运势小程序 v1.0.0

🎉 **恭喜！按照本指南，你的八字运势小程序将成功上线运行！**
