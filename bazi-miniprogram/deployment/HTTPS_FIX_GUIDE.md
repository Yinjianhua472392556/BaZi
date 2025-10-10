# 🔒 HTTPS一键修复指南

## 📋 问题描述

当您遇到以下HTTPS访问问题时：
- ✅ HTTP访问正常：`curl -I http://api.bazi365.top/health` 返回200
- ❌ HTTPS访问失败：`curl -I https://api.bazi365.top/health` 连接重置

## 🚀 一键修复方案

### 使用方法

在腾讯云服务器终端执行以下命令：

```bash
# 进入项目目录
cd /opt/bazi-app/bazi-miniprogram/deployment

# 执行一键修复脚本
sudo bash fix_https.sh
```

### 修复流程

脚本将自动执行以下10个步骤：

1. **环境诊断** - 检测HTTPS问题和服务状态
2. **停止服务** - 安全停止Nginx和API服务
3. **清理配置** - 删除损坏的配置文件
4. **重新生成SSL证书** - 使用Let's Encrypt重新申请证书
5. **修复证书权限** - 确保Nginx可以读取证书文件
6. **创建HTTPS配置** - 生成正确的Nginx HTTPS配置
7. **配置防火墙** - 开放443端口
8. **启动服务** - 重新启动所有服务
9. **验证HTTPS访问** - 测试HTTPS是否正常工作
10. **完整测试** - 运行所有API接口测试

## 🎯 预期结果

修复完成后，您应该看到：

```bash
✅ HTTPS访问成功！
🎉 所有API测试通过！
🌐 请访问: https://api.bazi365.top/health
```

## 📊 修复特点

- **完全自动化** - 无需手动干预
- **安全可靠** - 包含备份和错误处理
- **详细日志** - 记录每个步骤的执行结果
- **智能诊断** - 自动检测和修复常见问题

## 🔧 故障排除

### 如果修复失败

1. **检查权限**：确保使用 `sudo` 执行
2. **检查网络**：确保服务器可以访问Let's Encrypt
3. **检查域名**：确认 `api.bazi365.top` 解析到正确IP
4. **查看日志**：检查 `/tmp/https_fix_*.log` 文件

### 手动验证

修复完成后可以手动验证：

```bash
# 测试HTTPS访问
curl -I https://api.bazi365.top/health

# 查看服务状态
systemctl status bazi-api nginx

# 查看端口监听
netstat -tlnp | grep -E "(80|443|8001)"
```

## 📝 日志文件

- **修复日志**：`/tmp/https_fix_YYYYMMDD_HHMMSS.log`
- **修复报告**：`/tmp/https_fix_report_YYYYMMDD_HHMMSS.txt`

## ⚡ 快速命令

```bash
# 一键修复HTTPS
cd /opt/bazi-app/bazi-miniprogram/deployment && sudo bash fix_https.sh

# 验证修复结果
curl -I https://api.bazi365.top/health && echo "✅ HTTPS访问正常"

# 运行完整测试
bash test_all_apis.sh
```

## 🎉 修复成功标志

当看到以下输出时，说明HTTPS修复成功：

```
═══════════════════════════════════════════════════════════════
                🎉 HTTPS修复完成！
═══════════════════════════════════════════════════════════════

🎯 HTTPS修复成功完成！
🌐 请访问: https://api.bazi365.top/health
```

## 📞 技术支持

如果仍有问题，请提供：
1. 修复日志文件内容
2. 服务器系统信息：`uname -a`
3. 错误症状详细描述

---

**注意**：此脚本专门设计用于修复HTTPS配置问题，在执行前会自动备份现有配置。
