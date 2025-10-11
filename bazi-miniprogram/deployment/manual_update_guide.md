# 八字运势小程序 - 线上部署更新指南

## 🚀 更新步骤

### 方式一：使用自动部署脚本（推荐）

**在服务器上执行以下命令：**

```bash
# 1. 连接到服务器
ssh root@119.91.146.128

# 2. 进入项目目录（如果已部署）
cd /opt/bazi-app/bazi-miniprogram/deployment

# 3. 执行自动部署脚本
sudo bash auto_deploy.sh
```

### 方式二：手动更新步骤

**如果自动部署脚本遇到问题，可以手动执行以下步骤：**

#### 1. 连接服务器并停止服务
```bash
ssh root@119.91.146.128
systemctl stop bazi-api
systemctl stop nginx
```

#### 2. 备份当前版本
```bash
cd /opt/bazi-app
cp -r bazi-miniprogram bazi-miniprogram.backup.$(date +%Y%m%d_%H%M%S)
```

#### 3. 拉取最新代码
```bash
cd /opt/bazi-app/bazi-miniprogram
git pull origin main
```

#### 4. 更新Python依赖（如有新依赖）
```bash
source venv/bin/activate
pip install -r requirements.txt
```

#### 5. 重启服务
```bash
systemctl start bazi-api
systemctl start nginx
```

#### 6. 验证服务状态
```bash
systemctl status bazi-api
systemctl status nginx
curl http://api.bazi365.top/health
```

### 方式三：使用简化更新脚本

**创建简化的更新脚本：**

```bash
#!/bin/bash
# 简化更新脚本

echo "🔄 开始更新八字运势小程序..."

# 停止服务
systemctl stop bazi-api

# 进入项目目录
cd /opt/bazi-app/bazi-miniprogram

# 拉取最新代码
git pull origin main

# 重启服务
systemctl start bazi-api

# 检查服务状态
sleep 5
if systemctl is-active --quiet bazi-api; then
    echo "✅ 更新成功，服务运行正常"
    systemctl status bazi-api --no-pager
else
    echo "❌ 服务启动失败，请检查日志"
    journalctl -u bazi-api --no-pager -n 10
fi
```

## 📊 验证更新结果

### 1. 检查服务状态
```bash
systemctl status bazi-api
systemctl status nginx
```

### 2. 测试API功能
```bash
# 测试健康检查
curl http://api.bazi365.top/health

# 测试基础起名功能
curl -X POST "http://api.bazi365.top/api/v1/naming/generate" \
-H "Content-Type: application/json" \
-d '{
  "surname": "李",
  "gender": "male",
  "birth_year": 1990,
  "birth_month": 5,
  "birth_day": 15,
  "birth_hour": 12,
  "calendar_type": "solar",
  "name_length": 2,
  "count": 3
}'

# 测试个性化起名功能（已修复）
curl -X POST "http://api.bazi365.top/api/v1/naming/personalized-generate" \
-H "Content-Type: application/json" \
-d '{
  "surname": "李",
  "gender": "male",
  "birth_year": 1990,
  "birth_month": 3,
  "birth_day": 15,
  "birth_hour": 10,
  "calendar_type": "solar",
  "name_length": 2,
  "count": 3,
  "cultural_level": "modern",
  "popularity": "high",
  "era": "contemporary"
}'
```

### 3. 检查日志
```bash
# 查看API服务日志
journalctl -u bazi-api -f

# 查看Nginx日志
tail -f /var/log/nginx/api.bazi365.top_access.log
tail -f /var/log/nginx/api.bazi365.top_error.log
```

## 🔧 故障排除

### 如果服务启动失败：
1. 查看详细日志：`journalctl -u bazi-api --no-pager -n 20`
2. 检查端口占用：`netstat -tlnp | grep 8001`
3. 检查Python环境：`cd /opt/bazi-app/bazi-miniprogram && source venv/bin/activate && python main.py`

### 如果SSL证书有问题：
1. 重新申请证书：`certbot certonly --standalone -d api.bazi365.top`
2. 重启Nginx：`systemctl restart nginx`

## 📋 本次更新内容

✅ **已修复的问题：**
- 修复智能起名个性化偏好功能返回空结果的问题
- 修复API参数映射错误（era_style -> era）
- 修复增强字库数据格式一致性问题
- 改进数据字段访问的安全性
- 优化个性化偏好筛选算法

✅ **验证步骤：**
- 个性化起名功能现在可以正常返回推荐名字
- 偏好设置（文化层次、流行度、时代风格）正确生效
- API响应包含完整的偏好应用信息

## 📞 联系信息

如果遇到问题，请：
1. 查看详细日志文件
2. 使用故障排除步骤
3. 必要时重新运行完整部署脚本

更新完成时间：$(date '+%Y-%m-%d %H:%M:%S')
