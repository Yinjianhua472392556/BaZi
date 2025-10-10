# SSL/HTTPS 问题修复说明

## 🔍 问题诊断

当前您遇到的问题：
- ✅ HTTP访问正常
- ❌ HTTPS访问失败 (`Connection reset by peer`)  
- **原因**：SSL证书路径不存在或Nginx HTTPS配置有问题

## 🚀 快速修复方案

### 方案一：使用修复后的一键部署脚本（推荐）

```bash
# 1. 拉取最新代码（包含修复的SSL逻辑）
cd /opt/bazi-app/bazi-miniprogram
git pull origin main

# 2. 重新运行优化的部署脚本
cd deployment
sudo bash auto_deploy.sh
```

### 方案二：使用专用SSL修复脚本

```bash
# 1. 进入部署目录
cd /opt/bazi-app/bazi-miniprogram/deployment

# 2. 运行SSL专用修复脚本
sudo bash fix_ssl_issues.sh
```

### 方案三：手动步骤修复

```bash
# 1. 停止服务
systemctl stop nginx bazi-api

# 2. 清理问题证书
rm -rf /etc/letsencrypt/live/api.bazi365.top

# 3. 重新申请SSL证书
certbot certonly --standalone -d api.bazi365.top --email your-email@example.com --agree-tos --non-interactive

# 4. 重新启动服务
systemctl start bazi-api nginx
```

## 🔧 修复后的改进

我们的修复脚本包含以下智能功能：

1. **三阶段SSL配置**：
   - 阶段1：启动HTTP服务
   - 阶段2：申请SSL证书  
   - 阶段3：配置HTTPS

2. **多种证书申请方式**：
   - webroot方式（首选）
   - nginx插件方式
   - standalone方式（备选）

3. **智能降级机制**：
   - SSL申请失败时自动保持HTTP配置
   - 确保服务不会中断

4. **完整的权限修复**：
   - 自动设置证书文件权限
   - 修复目录所有者

## 📊 验证修复结果

修复完成后，验证以下内容：

```bash
# 1. 检查服务状态
systemctl status bazi-api nginx

# 2. 检查证书文件
ls -la /etc/letsencrypt/live/api.bazi365.top/

# 3. 测试HTTPS访问
curl -I https://api.bazi365.top/health

# 4. 检查端口监听
netstat -tlnp | grep -E ':(80|443|8001) '
```

## 🎯 预期结果

修复成功后您应该看到：
- ✅ SSL证书文件存在于 `/etc/letsencrypt/live/api.bazi365.top/`
- ✅ Nginx配置测试通过 (`nginx -t`)
- ✅ HTTPS访问正常 (`curl -I https://api.bazi365.top/health`)
- ✅ 自动续期已设置

## 💡 关键改进

相比之前的脚本，我们的修复版本：

1. **更安全**：不会在证书申请前配置HTTPS
2. **更稳定**：包含多种备选方案
3. **更智能**：自动诊断和恢复
4. **更完整**：处理权限、防火墙等问题

## 🆘 如果修复失败

如果所有方案都失败，请联系技术支持并提供：

```bash
# 收集诊断信息
systemctl status nginx bazi-api --no-pager
nginx -t
ls -la /etc/letsencrypt/live/
curl -I http://api.bazi365.top/health
curl -I https://api.bazi365.top/health
```

---

**注意**：我们已经完全重写了SSL处理逻辑，现在的脚本更加稳定可靠！
