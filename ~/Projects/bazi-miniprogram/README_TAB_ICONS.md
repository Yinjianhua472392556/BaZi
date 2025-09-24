# 微信小程序 Tab 图标动态配置功能

> 通过后端API实现微信小程序tabBar图标的动态配置、多主题支持和智能缓存管理

## 🚀 快速开始

### 后端服务
```bash
# 安装依赖
pip install fastapi uvicorn Pillow cairosvg

# 启动服务
cd backend/app
python main.py
```

### 前端集成
```javascript
// 在 app.js 中添加
const { iconManager } = require('./utils/icon-manager.js')

App({
  async onLaunch() {
    // 初始化图标系统
    await iconManager.init()
  }
})
```

## ✨ 核心特性

- 🎨 **多主题支持** - 4种预设主题 + 自定义颜色
- 📱 **动态更新** - 无需发版即可更新图标
- 💾 **智能缓存** - 版本控制 + 本地缓存优化
- 🔧 **易于集成** - 一行代码完成集成
- 🛡️ **错误容错** - 网络异常时自动降级

## 📋 支持的图标

| 图标 | 类型 | 描述 |
|------|------|------|
| 八字测算 | bazi | 太极八卦图标 |
| 节日列表 | festival | 日历图标 |
| 生肖配对 | zodiac | 心形图标 |
| 个人中心 | profile | 用户图标 |

## 🎨 主题配色

```javascript
// 支持的主题
themes: {
  default: { normal: '#666666', selected: '#C8860D' },
  dark:    { normal: '#888888', selected: '#FFD700' },
  spring:  { normal: '#8B4513', selected: '#FF6B6B' },
  autumn:  { normal: '#A0522D', selected: '#FF8C00' }
}
```

## 📡 API 接口

### 获取配置
```http
GET /api/v1/tab-icons/config
```

### 获取图标
```http
GET /api/v1/tab-icons/{icon_type}?style={style}&theme_color={color}
```

## 🧪 功能测试

```bash
# 测试后端API
curl "http://localhost:8001/api/v1/tab-icons/config"

# 测试前端管理器
node test_icon_manager.js
```

## 📚 完整文档

- 📖 [技术实现文档](docs/tab-icon-configuration-guide.md)
- 📋 [项目总结报告](TAB_ICON_FEATURE_SUMMARY.md)

## 📦 文件结构

```
├── backend/app/
│   ├── main.py              # API服务
│   └── icon_generator.py    # 图标生成器
├── miniprogram/
│   ├── app.js               # 小程序入口
│   └── utils/icon-manager.js # 图标管理器
├── docs/                    # 技术文档
└── test_icon_manager.js     # 测试脚本
```

## ✅ 已验证功能

- [x] SVG → PNG 动态生成
- [x] 多主题颜色支持
- [x] 版本管理和增量更新
- [x] 本地缓存和文件管理
- [x] 错误处理和降级方案
- [x] 微信小程序集成

---

⭐ **Ready for Production** - 所有核心功能已完成并通过测试验证
