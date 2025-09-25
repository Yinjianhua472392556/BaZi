# 八字运势小程序 🔮

> **一个基于传统文化的娱乐性八字测算微信小程序**  
> **后端**: FastAPI + Python 3.13 + 真实算法  
> **前端**: 微信小程序原生开发  
> **最后更新**: 2025-09-25 ✅ 完全正常运行

## 🚀 快速启动 (30秒)

### 方法一：一键启动脚本 (推荐)
```bash
cd bazi-miniprogram
./start.sh          # 启动服务
./start.sh --check   # 检查状态  
./start.sh --help    # 查看帮助
```

### 方法二：手动启动
```bash
cd bazi-miniprogram
source venv/bin/activate
python main.py
```

**成功标志**:
```
✅ 算法模块导入成功
🚀 启动八字运势小程序 FastAPI 服务器 (真实算法版)  
📍 本机IP地址: 10.60.20.222
🌐 访问地址: http://10.60.20.222:8001
🧮 算法状态: 真实算法已启用
```

## 📱 微信小程序配置

1. **打开微信开发者工具**
2. **导入项目**: `/Users/yinjianhua/Desktop/Demo/Bazi/bazi-miniprogram/miniprogram`
3. **设置测试号**: 无需真实AppID
4. **关闭域名校验**: 详情 → 本地设置 → ✅ 不校验域名
5. **编译运行**: 开始开发！

## 🎯 项目功能

### 核心功能 ✅
- **八字排盘**: 基于真实算法的八字计算 (sxtwl库)
- **智能起名**: 根据八字五行推荐姓名
- **生肖配对**: 十二生肖匹配度分析  
- **节日查询**: 传统节日和节气信息
- **历史记录**: 测算记录保存和管理

### 技术特性 ✅
- **真实算法**: 使用专业的sxtwl、zhdate等计算库
- **降级机制**: 算法库不可用时自动切换到模拟数据
- **热重载**: 开发时代码自动更新
- **API文档**: 完整的Swagger接口文档
- **跨平台**: 支持真机和模拟器测试

## 🔗 快速访问链接

| 服务 | 地址 | 用途 |
|------|------|------|
| **API文档** | http://10.60.20.222:8001/docs | 在线测试所有接口 |
| **健康检查** | http://10.60.20.222:8001/health | 验证服务状态 |
| **后端首页** | http://10.60.20.222:8001/ | 服务基本信息 |
| **小程序代码** | `./miniprogram` | 前端源代码目录 |

## 📚 文档指南

### 📖 用户文档
- **[QUICK_START.md](QUICK_START.md)** - ⚡ 30秒快速启动指南
- **[MINIPROGRAM_QUICK_START.md](MINIPROGRAM_QUICK_START.md)** - 📱 小程序配置详解
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - 🔧 故障排除大全

### 🛠 开发文档  
- **[docs/development-setup.md](docs/development-setup.md)** - 开发环境搭建
- **[docs/miniprogram-setup-guide.md](docs/miniprogram-setup-guide.md)** - 小程序开发指南
- **[docs/naming-feature-design.md](docs/naming-feature-design.md)** - 起名功能设计

### 🚀 部署文档
- **[deployment/README.md](deployment/README.md)** - 部署指南
- **[QUICK_START.md](QUICK_START.md)** - 最简启动指南

## 🧮 API接口列表

### 已验证正常的接口 ✅

| 接口 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/health` | GET | 健康检查 | ✅ |
| `/api/v1/calculate-bazi` | POST | 八字计算 | ✅ |
| `/api/v1/naming/generate-names` | POST | 起名建议 | ✅ |  
| `/api/v1/naming/evaluate` | POST | 名字评估 | ✅ |
| `/api/v1/zodiac-matching` | POST | 生肖配对 | ✅ |
| `/api/v1/festivals` | GET | 节日查询 | ✅ |
| `/api/v1/tab-icons/{type}` | GET | 图标生成 | ✅ |
| `/api/v1/lunar-to-solar` | POST | 农历转公历 | ✅ |
| `/api/v1/solar-to-lunar` | POST | 公历转农历 | ✅ |

## 🔧 开发环境信息

### 运行环境 ✅
- **操作系统**: macOS
- **Python版本**: 3.13.7
- **虚拟环境**: ✅ 已配置 (`./venv`)
- **服务端口**: 8001
- **IP地址**: 10.60.20.222 (自动获取)

### 核心依赖 ✅  
- **FastAPI**: 0.104.1 (Web框架)
- **Uvicorn**: 0.24.0 (ASGI服务器)
- **sxtwl**: 2.0.7 (寿星天文历，八字核心算法)
- **zhdate**: 0.1 (中国农历库)
- **Pillow**: 11.3.0 (图像处理)

## 🔄 快速操作命令

### 服务管理
```bash
# 启动服务
./start.sh

# 检查状态
./start.sh --check

# 停止服务
./start.sh --stop

# 重启服务  
./start.sh --restart
```

### 快速验证
```bash
# 检查后端健康
curl -s http://10.60.20.222:8001/health

# 测试八字计算
curl -X POST http://10.60.20.222:8001/api/v1/calculate-bazi \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":6,"day":15,"hour":14,"gender":"male","name":"测试"}'

# 测试起名功能
curl -X POST http://10.60.20.222:8001/api/v1/naming/generate-names \
  -H "Content-Type: application/json" \
  -d '{"surname":"李","gender":"male","birth_year":1990,"birth_month":6,"birth_day":15}'
```

### 故障处理
```bash
# 端口冲突
lsof -ti:8001 | xargs kill -9

# 重装依赖
pip install -r requirements.txt

# 重建虚拟环境
rm -rf venv && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

## 🏗 项目结构

```
bazi-miniprogram/
├── 📁 backend/           # 后端算法模块
│   └── app/
│       ├── bazi_calculator.py    # 八字计算核心
│       ├── naming_calculator.py  # 起名算法
│       └── icon_generator.py     # 图标生成
├── 📁 miniprogram/      # 微信小程序前端
│   ├── pages/           # 页面文件
│   ├── utils/           # 工具函数  
│   ├── images/          # 图片资源
│   └── app.js           # 小程序配置
├── 📁 docs/             # 详细文档
├── 📁 deployment/       # 部署相关
├── 📁 tests/            # 测试文件
├── 📄 main.py           # 后端主程序 ⭐
├── 📄 start.sh          # 一键启动脚本 ⭐  
├── 📄 requirements.txt  # Python依赖
└── 📄 venv/             # 虚拟环境 ✅
```

## 🎉 使用流程

1. **启动后端**: `./start.sh` 或 `python main.py`
2. **配置小程序**: 导入`miniprogram`目录，关闭域名校验
3. **开始开发**: 前后端联调，享受开发！
4. **遇到问题**: 查看 `TROUBLESHOOTING.md`

## ⚠️ 重要提醒

- **域名校验**: 开发环境必须关闭域名校验
- **端口号**: 新版本使用8001端口，不是8000
- **IP地址**: 会自动获取本机IP，网络变化后需重启
- **算法状态**: 启动时注意查看"真实算法已启用"提示

## 🔄 更新历史

- **2025-09-25**: ✅ 创建完整的文档体系，一键启动脚本
- **2025-09-25**: ✅ 验证所有功能正常，算法模块稳定运行
- **2025-09-25**: ✅ 优化启动流程，添加状态检查功能

---

## 💡 开发小贴士

1. **API测试**: 推荐使用 http://10.60.20.222:8001/docs 在线测试
2. **热重载**: 修改Python代码后会自动重启，无需手动重启
3. **日志查看**: 所有请求都会在终端显示详细日志
4. **性能监控**: 可在浏览器Network标签查看API响应时间
5. **真机测试**: 用微信开发者工具生成二维码，真机扫码测试

**祝开发愉快！** 🚀✨
