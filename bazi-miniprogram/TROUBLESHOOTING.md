# 八字运势小程序 - 故障排除指南 🔧

> **2025-09-25 更新** - 基于最新实际操作经验整理

## 🚀 快速诊断清单

### 1. 后端服务问题诊断 (30秒)
```bash
# 检查虚拟环境
cd bazi-miniprogram && source venv/bin/activate && which python

# 检查关键依赖
pip list | grep -E "(fastapi|uvicorn|sxtwl|zhdate)"

# 检查服务状态
curl -s http://10.60.20.222:8001/health

# 检查端口占用
lsof -i:8001
```

### 2. 前端小程序问题诊断 (30秒)
- [ ] 微信开发者工具已安装且最新版本
- [ ] 项目目录正确：`/Users/yinjianhua/Desktop/Demo/Bazi/bazi-miniprogram/miniprogram`
- [ ] 域名校验已关闭：详情 → 本地设置 → 不校验域名
- [ ] 网络请求显示连接到 `10.60.20.222:8001`

---

## 🔥 最常见问题及解决方案

### 问题1: 后端服务启动失败
**症状**: `python main.py` 报错或无法启动

**解决方案**:
```bash
# 方案A: 检查虚拟环境
cd bazi-miniprogram
source venv/bin/activate
python --version  # 应显示 3.13.7

# 方案B: 重新安装关键依赖
pip install fastapi uvicorn sxtwl zhdate pillow

# 方案C: 检查端口冲突
lsof -ti:8001 | xargs kill -9
python main.py
```

**成功标志**:
```
✅ 算法模块导入成功
🚀 启动八字运势小程序 FastAPI 服务器 (真实算法版)
📍 本机IP地址: 10.60.20.222
🌐 访问地址: http://10.60.20.222:8001
```

### 问题2: 小程序网络请求失败
**症状**: 小程序中API调用失败，控制台显示网络错误

**解决方案**:
```bash
# 1. 确认后端服务正常
curl -s http://10.60.20.222:8001/health

# 2. 微信开发者工具设置
# 详情 → 本地设置 → ✅ 不校验合法域名
# 详情 → 本地设置 → ✅ 开启调试模式

# 3. 检查小程序中的请求地址
# 确保使用 http://10.60.20.222:8001 而不是其他地址
```

### 问题3: 算法模块导入失败
**症状**: 看到 "❌ 算法模块导入失败" 或 "降级模式"

**解决方案**:
```bash
# 检查关键库安装
pip list | grep sxtwl
pip list | grep zhdate

# 重新安装算法库
pip uninstall sxtwl zhdate -y
pip install sxtwl==2.0.7 zhdate==0.1

# 重启服务
python main.py
```

**成功标志**: 看到 "✅ 算法模块导入成功" 和 "真实算法已启用"

### 问题4: 端口被占用
**症状**: `Address already in use` 或端口冲突错误

**解决方案**:
```bash
# 查看占用进程
lsof -i:8001

# 强制杀死占用进程
lsof -ti:8001 | xargs kill -9

# 或者修改端口 (在 main.py 最后一行)
# uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
```

### 问题5: IP地址变化导致连接失败
**症状**: 小程序无法连接，API地址不对

**解决方案**:
```bash
# 1. 查看当前IP
python main.py | grep "本机IP地址"

# 2. 更新小程序中的API地址
# 编辑 miniprogram/utils/request.js 或相关配置文件
# 将 baseURL 更新为新的IP地址

# 3. 使用固定IP (可选)
# 在路由器中为开发机器设置静态IP
```

---

## 🛠 进阶故障排除

### Python环境问题

**问题**: pip 安装失败
```bash
# 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple/ package_name

# 升级pip
python -m pip install --upgrade pip

# 清理缓存
pip cache purge
```

**问题**: 虚拟环境问题
```bash
# 重建虚拟环境
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 微信开发者工具问题

**问题**: 工具版本过旧
```bash
# 更新微信开发者工具
# 工具菜单 → 检查更新

# 或重新下载安装
# https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

**问题**: 项目编译失败
```bash
# 清除缓存
# 工具栏 → 清缓存 → 清除所有数据

# 重新编译
# Cmd+Shift+R (macOS)
```

### 性能相关问题

**问题**: 启动速度慢
```bash
# 检查系统资源
top -pid $(pgrep -f "python main.py")

# 优化虚拟环境位置 (移动到SSD)
# 检查内存使用情况
```

**问题**: API响应慢
```bash
# 检查算法库加载时间
# 查看启动日志中的初始化时间

# 监控内存使用
# 在main.py中添加性能监控
```

---

## 📱 设备相关问题

### macOS特定问题

**问题**: 权限错误
```bash
# 给予完整磁盘访问权限
# 系统偏好设置 → 安全性与隐私 → 隐私 → 完整磁盘访问

# 检查终端权限
sudo chmod +x /usr/local/bin/python3
```

**问题**: Homebrew相关
```bash
# 更新Homebrew
brew update && brew upgrade

# 重新安装Python
brew reinstall python@3.13
```

### 网络相关问题

**问题**: 防火墙阻止
```bash
# 临时关闭防火墙 (仅开发环境)
sudo pfctl -d

# 或添加端口规则
# 系统偏好设置 → 安全性与隐私 → 防火墙 → 防火墙选项
# 添加 Python 应用允许列表
```

**问题**: DNS解析问题
```bash
# 刷新DNS缓存
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## 🔍 调试技巧

### 后端调试
```bash
# 查看详细错误日志
python main.py --log-level debug

# 监控网络请求
# 在浏览器中访问 http://10.60.20.222:8001/docs
# 使用 Swagger UI 测试接口

# 查看实时日志
tail -f logs/app.log  # 如果有日志文件
```

### 前端调试
```bash
# 微信开发者工具调试技巧:
# 1. 打开调试器: F12 或 Cmd+Opt+I
# 2. 查看Network标签页监控请求
# 3. 查看Console查看JS错误
# 4. 使用Storage查看本地存储

# 真机调试
# 开发者工具 → 预览 → 生成二维码
# 用微信扫码在真机上测试
```

### 性能分析
```bash
# 后端性能分析
pip install pytest-benchmark
python -m pytest tests/ --benchmark-only

# 内存使用分析
pip install memory-profiler
python -m memory_profiler main.py
```

---

## 🆘 紧急救援方案

### 完全重置项目 (最后手段)
```bash
# 1. 备份数据
cp -r bazi-miniprogram bazi-miniprogram-backup

# 2. 重置虚拟环境
cd bazi-miniprogram
rm -rf venv __pycache__
python -m venv venv
source venv/bin/activate

# 3. 重新安装依赖
pip install -r requirements.txt

# 4. 重启服务
python main.py
```

### 降级运行方案
如果算法库无法安装，项目支持降级模式：
```bash
# 项目会自动切换到模拟数据模式
# 功能依然可用，但使用模拟的八字计算结果
# 可用于演示和基础功能验证
```

### 联系支持
如果问题仍无法解决：
1. 查看 `QUICK_START.md` 基础指南
2. 查看 `PROJECT_FINAL_STATUS.md` 项目状态
3. 检查 GitHub Issues
4. 查看项目日志文件

---

## 📊 状态检查工具

### 自动诊断脚本
```bash
# 创建诊断脚本
cat > diagnose.sh << 'EOF'
#!/bin/bash
echo "🔍 八字小程序诊断开始..."

echo "1. 检查Python环境..."
cd bazi-miniprogram && source venv/bin/activate
python --version

echo "2. 检查关键依赖..."
pip list | grep -E "(fastapi|uvicorn|sxtwl|zhdate)"

echo "3. 检查服务状态..."
curl -s http://10.60.20.222:8001/health || echo "❌ 服务未运行"

echo "4. 检查端口..."
lsof -i:8001 || echo "✅ 端口空闲"

echo "📊 诊断完成"
EOF

chmod +x diagnose.sh
./diagnose.sh
```

---

**最后更新**: 2025-09-25  
**测试环境**: macOS, Python 3.13.7, 微信开发者工具最新版  
**项目状态**: ✅ 完全正常运行
