# API 请求日志系统使用指南

## 功能概述

本系统为八字小程序添加了统一的API请求日志功能，支持详细的请求/响应记录和灵活的开关控制。

## 主要特性

### 1. 统一日志管理
- 所有API请求都通过 `app.request()` 方法进行
- 统一的日志格式和输出
- 支持请求ID追踪，便于问题排查

### 2. 详细日志信息
- **请求日志**: URL、方法、参数、时间戳
- **响应日志**: 状态码、响应数据、耗时
- **错误日志**: 详细错误信息和调试数据
- **性能监控**: 每个请求的耗时统计

### 3. 灵活的开关控制
- 全局开关: 一键开启/关闭所有日志
- 分类开关: 可单独控制请求、响应、错误日志
- 详细程度控制: 简单模式/详细模式切换

## 配置说明

### 在 `app.js` 中的配置
```javascript
globalData: {
  // API日志配置
  apiLogger: {
    enabled: true,        // 主开关，上线时设为false
    logRequest: true,     // 记录请求信息
    logResponse: true,    // 记录响应信息
    logError: true,       // 记录错误信息
    logTiming: true,      // 记录请求耗时
    detailedLog: true     // 详细日志（包含完整数据）
  }
}
```

## 日志格式示例

### 请求日志
```
🚀 [API请求-a1b2c3] POST /api/v1/calculate-bazi
📤 [请求参数-a1b2c3]: { birth_year: 1990, birth_month: 5, ... }
⏰ [请求时间-a1b2c3]: 2025-01-21 17:01:30
```

### 成功响应日志
```
✅ [API响应-a1b2c3] POST /api/v1/calculate-bazi (200)
⏱️ [响应耗时-a1b2c3]: 1245ms
📥 [响应数据-a1b2c3]: { success: true, data: { ... } }
```

### 错误日志
```
❌ [API错误-a1b2c3] POST /api/v1/calculate-bazi
⏱️ [错误耗时-a1b2c3]: 5032ms
🔥 [错误详情-a1b2c3]: { errMsg: "request:fail timeout", ... }
```

## 使用方法

### 1. 开发环境 - 开启详细日志
```javascript
// 在app.js的onLaunch中或任意页面
const app = getApp();
app.enableApiLogger(true);          // 开启日志
app.setApiLogLevel(true);           // 开启详细模式
```

### 2. 生产环境 - 关闭日志
```javascript
const app = getApp();
app.enableApiLogger(false);         // 关闭所有日志
```

### 3. 调试模式 - 只看错误
```javascript
const app = getApp();
app.globalData.apiLogger.logRequest = false;   // 关闭请求日志
app.globalData.apiLogger.logResponse = false;  // 关闭响应日志
app.globalData.apiLogger.logError = true;      // 只保留错误日志
```

## 快速控制方法

### 全局控制方法
```javascript
const app = getApp();

// 开启/关闭API日志
app.enableApiLogger(true);   // 开启
app.enableApiLogger(false);  // 关闭

// 设置详细程度
app.setApiLogLevel(true);    // 详细模式
app.setApiLogLevel(false);   // 简单模式
```

### 控制台快速命令
在微信开发者工具的控制台中，可以直接使用：
```javascript
// 关闭所有API日志（上线前）
getApp().enableApiLogger(false);

// 开启API日志（开发调试）
getApp().enableApiLogger(true);

// 只看简单日志
getApp().setApiLogLevel(false);
```

## 上线部署

### 上线前必做
1. 在 `app.js` 中设置：
```javascript
apiLogger: {
  enabled: false,        // 关闭主开关
  // 其他设置可保持不变
}
```

2. 或者在发布前执行：
```javascript
getApp().enableApiLogger(false);
```

## 已统一的API调用

以下文件已经统一使用 `app.request()` 方法：

### 页面文件
- `pages/index/index.js` - 八字计算相关API
- `pages/naming/naming.js` - 起名相关API  
- `pages/zodiac-matching/zodiac-matching.js` - 生肖配对API

### 工具文件
- `utils/enhanced-fortune-calculator.js` - 运势计算API
- `components/book-recommendation/book-recommendation.js` - 书籍推荐API

## 性能考虑

- 日志功能设计为轻量级，对性能影响极小
- 生产环境关闭日志后，几乎无性能损耗
- 请求ID生成采用简单随机算法，高效快速

## 故障排查

### 1. 日志不显示
检查控制台是否有以下信息：
```
🔧 API日志已开启
```

### 2. 只有部分日志
检查各个开关的状态：
```javascript
console.log(getApp().globalData.apiLogger);
```

### 3. 请求失败无日志
确认 `logError` 开关是否开启

## 扩展功能

如需增加新的API调用，请使用以下格式：
```javascript
const app = getApp();
app.request({
  url: '/api/v1/your-endpoint',
  method: 'POST',
  data: { /* 请求数据 */ },
  success: (res) => {
    // 处理成功响应
  },
  fail: (err) => {
    // 处理错误
  }
});
```

## 注意事项

1. **安全性**: 敏感数据会在日志中显示，生产环境务必关闭
2. **存储**: 日志仅在控制台显示，不会持久化存储
3. **兼容性**: 保持与现有代码的完全兼容
4. **调试**: 开发时建议开启详细日志，便于调试
