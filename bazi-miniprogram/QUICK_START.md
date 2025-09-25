# 八字运势小程序 - 快速启动指南 ⚡

> **一键启动，无需复杂配置！**  
> 适用于已配置环境的项目快速重新启动

## 🚀 超级快速启动 (30秒)

### 1. 启动后端服务
```bash
cd bazi-miniprogram
source venv/bin/activate
python main.py
```

**期待输出**:
```
✅ 算法模块导入成功
🚀 启动八字运势小程序 FastAPI 服务器 (真实算法版)
📍 本机IP地址: 10.60.20.222
🌐 访问地址: http://10.60.20.222:8001
📚 API文档: http://10.60.20.222:8001/docs
🧮 算法状态: 真实算法已启用
```

### 2. 启动微信小程序 (并行操作)
1. 打开微信开发者工具
2. 导入项目: `/Users/yinjianhua/Desktop/Demo/Bazi/bazi-miniprogram/miniprogram`
3. 选择"测试号"
4. ✅ 勾选"不校验合法域名"
5. 编译运行

## 📍 重要地址 (一键访问)

| 服务 | 地址 | 用途 |
|------|------|------|
| API 文档 | http://10.60.20.222:8001/docs | 查看所有接口 |
| 健康检查 | http://10.60.20.222:8001/health | 验证服务状态 |
| 后端首页 | http://10.60.20.222:8001/ | 服务信息 |
| 小程序目录 | `./miniprogram` | 前端代码 |

## ⚡ 一键命令合集

### 快速验证服务
```bash
# 检查后端健康状态
curl -s http://10.60.20.222:8001/health

# 测试八字计算接口
curl -X POST http://10.60.20.222:8001/api/v1/calculate-bazi \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":6,"day":15,"hour":14,"gender":"male","name":"测试用户"}'
```

### 快速重启服务
```bash
# 如果服务异常，快速重启
cd bazi-miniprogram
source venv/bin/activate
python main.py
```

## 🔧 常见问题 30秒解决

| 问题 | 解决方案 |
|------|----------|
| 端口被占用 | `lsof -ti:8001 \| xargs kill -9` |
| 虚拟环境失效 | `source venv/bin/activate` |
| 依赖缺失 | `pip install fastapi uvicorn sxtwl zhdate pillow` |
| 小程序网络失败 | 开发者工具 → 详情 → 不校验域名 |

## ✅ 快速状态检查清单

### 后端服务检查 (2分钟)
- [ ] 虚拟环境已激活 (`which python` 显示 venv 路径)
- [ ] 服务启动成功 (看到"算法模块导入成功")
- [ ] 端口正常监听 (`lsof -i:8001`)
- [ ] 健康检查通过 (`curl http://10.60.20.222:8001/health`)

### 前端服务检查 (1分钟)
- [ ] 微信开发者工具已安装
- [ ] 项目导入成功
- [ ] 域名校验已关闭
- [ ] 编译无错误

## 🎯 验证完整功能 (可选)

```bash
# 1. 验证八字计算
curl -X POST http://10.60.20.222:8001/api/v1/calculate-bazi \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":6,"day":15,"hour":14,"gender":"male","name":"验证测试"}'

# 2. 验证起名功能
curl -X POST http://10.60.20.222:8001/api/v1/naming/generate-names \
  -H "Content-Type: application/json" \
  -d '{"surname":"李","gender":"male","birth_year":1990,"birth_month":6,"birth_day":15}'

# 3. 验证生肖配对
curl -X POST http://10.60.20.222:8001/api/v1/zodiac-matching \
  -H "Content-Type: application/json" \
  -d '{"zodiac1":"龙","zodiac2":"虎"}'
```

## 🚫 停止服务

```bash
# 停止后端服务
# 在运行 python main.py 的终端按 Ctrl+C

# 或者强制停止
lsof -ti:8001 | xargs kill -9
```

---

## 📱 项目状态信息

- **最后测试时间**: 2025-09-25
- **Python版本**: 3.13.7  
- **服务端口**: 8001
- **算法状态**: 真实算法已启用 ✅
- **依赖状态**: 全部正常 ✅

## 💡 小贴士

1. **首次使用**: 如果是第一次运行，请参考 `mac-local-development-setup-guide.md`
2. **开发调试**: 后端支持热重载，修改代码后自动重启
3. **API文档**: 访问 `/docs` 可查看所有接口的详细说明和在线测试
4. **日志查看**: 后端运行时会显示详细的请求日志
5. **网络问题**: 确保防火墙没有阻止 8001 端口

🎉 **享受开发吧！**
