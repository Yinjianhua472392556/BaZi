# 微信小程序广告系统使用指南

## 概述

本项目实现了一套完整的微信小程序流量主广告管理系统，支持Banner广告、激励视频广告等多种广告形式。系统设计考虑到目前可能还未达到开通流量主条件的情况，通过配置文件可以灵活控制广告的显示与隐藏。

## 系统架构

### 核心组件
1. **广告配置管理** (`ad-config.js`) - 统一管理广告配置和开关
2. **广告管理器** (`ad-manager.js`) - 负责广告实例的创建、管理和统计
3. **Banner广告组件** (`ad-banner`) - 封装微信小程序的banner广告
4. **激励视频广告组件** (`ad-reward-video`) - 封装激励视频广告功能

### 文件结构
```
miniprogram/
├── utils/
│   ├── ad-config.js          # 广告配置文件
│   └── ad-manager.js         # 广告管理核心类
├── components/
│   ├── ad-banner/            # Banner广告组件
│   │   ├── ad-banner.js
│   │   ├── ad-banner.wxml
│   │   ├── ad-banner.wxss
│   │   └── ad-banner.json
│   └── ad-reward-video/      # 激励视频广告组件
│       ├── ad-reward-video.js
│       ├── ad-reward-video.wxml
│       ├── ad-reward-video.wxss
│       └── ad-reward-video.json
└── pages/
    └── result/               # 示例集成页面
        ├── result.js
        ├── result.wxml
        ├── result.wxss
        └── result.json
```

## 快速开始

### 1. 启用广告系统

在 `miniprogram/utils/ad-config.js` 中修改配置：

```javascript
const AD_CONFIG = {
  // 开启全局广告开关
  globalEnabled: true,
  
  // 配置具体广告位
  adUnits: {
    banner: {
      enabled: true,
      unitId: 'adunit-xxxxxxxx', // 填入你的广告位ID
      intervals: 30,
      theme: 'white',
      type: 'banner'
    },
    rewardVideo: {
      enabled: true,
      unitId: 'adunit-yyyyyyyy'  // 填入你的激励视频广告位ID
    }
  },
  
  // 配置页面广告显示
  pages: {
    result: {
      banner: true,      // 在结果页显示Banner广告
      rewardVideo: true  // 在结果页显示激励视频广告
    }
  }
};
```

### 2. 在页面中使用广告组件

在页面的 `.wxml` 文件中添加广告组件：

```xml
<!-- Banner广告 -->
<ad-banner 
  page-name="result"
  custom-class="my-banner-ad"
  bindadload="onAdLoad"
  bindaderror="onAdError"
  bindadclick="onAdClick">
</ad-banner>

<!-- 激励视频广告 -->
<ad-reward-video 
  page-name="result"
  button-text="观看视频获得奖励"
  button-class="primary"
  reward-desc="观看完整视频即可获得特殊奖励"
  show-reward-desc="{{true}}"
  bindreward="onVideoReward"
  binderror="onVideoError">
</ad-reward-video>
```

在页面的 `.js` 文件中处理广告事件：

```javascript
Page({
  // 广告加载成功
  onAdLoad(e) {
    console.log('广告加载成功:', e.detail);
  },

  // 广告加载失败
  onAdError(e) {
    console.log('广告加载失败:', e.detail);
  },

  // 广告点击
  onAdClick(e) {
    console.log('广告被点击:', e.detail);
  },

  // 激励视频奖励
  onVideoReward(e) {
    console.log('用户获得奖励:', e.detail);
    // 给用户发放奖励
    this.giveUserReward();
  },

  // 激励视频错误
  onVideoError(e) {
    console.log('视频广告错误:', e.detail);
    wx.showToast({
      title: '视频加载失败',
      icon: 'none'
    });
  }
});
```

## 组件详细说明

### Banner广告组件 (ad-banner)

#### 属性参数
- `page-name` (String): 页面名称，用于配置检查
- `ad-unit-id` (String): 广告单元ID（可选，会优先使用配置文件中的ID）
- `custom-class` (String): 自定义样式类
- `auto-refresh` (Boolean): 是否自动刷新，默认true
- `refresh-interval` (Number): 刷新间隔（秒），默认30

#### 事件
- `bindadload`: 广告加载成功
- `bindaderror`: 广告加载失败
- `bindadclick`: 广告被点击
- `bindadclose`: 广告被关闭

### 激励视频广告组件 (ad-reward-video)

#### 属性参数
- `page-name` (String): 页面名称
- `ad-unit-id` (String): 广告单元ID（可选）
- `button-text` (String): 按钮文字，默认"观看视频获得奖励"
- `button-class` (String): 按钮样式类：default/primary/success/warning
- `disabled` (Boolean): 是否禁用按钮
- `reward-desc` (String): 奖励描述
- `show-reward-desc` (Boolean): 是否显示奖励描述

#### 事件
- `bindreward`: 用户获得奖励（完整观看视频）
- `binderror`: 广告错误

## 配置详解

### 全局配置

```javascript
const AD_CONFIG = {
  // 全局广告开关
  globalEnabled: false,  // 设为true启用广告
  
  // 广告位配置
  adUnits: {
    banner: {
      enabled: false,      // 广告位开关
      unitId: '',         // 广告位ID
      intervals: 30,      // 自动刷新间隔
      theme: 'white',     // 主题色
      type: 'banner'      // 广告类型
    }
  },
  
  // 页面级配置
  pages: {
    index: {
      banner: false       // 页面级开关
    }
  },
  
  // 错误处理配置
  errorHandling: {
    maxRetries: 3,        // 最大重试次数
    retryDelay: 2000,     // 重试延迟
    hideOnError: true     // 错误时隐藏容器
  },
  
  // 统计配置
  analytics: {
    enabled: true,        // 启用统计
    reportShow: true,     // 上报展示事件
    reportClick: true,    // 上报点击事件
    reportError: true     // 上报错误事件
  }
};
```

### 页面级配置

通过页面级配置可以精确控制每个页面显示哪些广告：

```javascript
pages: {
  // 首页
  index: {
    banner: false,
    video: false
  },
  
  // 运势页面
  result: {
    banner: true,
    rewardVideo: true
  },
  
  // 节日页面
  festival: {
    banner: true,
    grid: false
  }
}
```

## 样式自定义

### Banner广告样式

可以通过 `custom-class` 属性添加自定义样式：

```css
/* 自定义Banner广告样式 */
.my-banner-ad {
  margin: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

/* 使用预定义主题 */
.ad-banner-container.light-theme {
  background-color: #ffffff;
  border: 1rpx solid #e0e0e0;
}

.ad-banner-container.dark-theme {
  background-color: #1a1a1a;
  border: 1rpx solid #333;
}
```

### 激励视频按钮样式

组件支持多种按钮样式主题：

```xml
<!-- 不同样式的按钮 -->
<ad-reward-video button-class="primary">   <!-- 蓝色主题 -->
<ad-reward-video button-class="success">   <!-- 绿色主题 -->
<ad-reward-video button-class="warning">   <!-- 黄色主题 -->
<ad-reward-video button-class="default">   <!-- 红色主题 -->
```

## 常见问题

### 1. 广告不显示

检查以下配置：
- `globalEnabled` 是否为 `true`
- 对应广告位的 `enabled` 是否为 `true`
- 广告位 `unitId` 是否正确填写
- 页面级配置是否允许显示该广告

### 2. 还未开通流量主

如果还未达到流量主开通条件：
- 保持 `globalEnabled: false`
- 或者将对应广告位的 `enabled` 设为 `false`
- 广告组件会自动隐藏，不影响页面布局

### 3. 测试广告

在开发和测试阶段：
- 可以使用微信官方提供的测试广告位ID
- 注意在正式上线前替换为真实的广告位ID

### 4. 错误处理

系统内置了完善的错误处理机制：
- 自动重试失败的广告加载
- 错误统计和上报
- 优雅降级，错误时不影响用户体验

## 流量主开通后的配置流程

1. **获取广告位ID**
   - 登录微信公众平台
   - 进入流量主功能
   - 创建对应的广告位
   - 获取广告位ID

2. **更新配置文件**
   ```javascript
   const AD_CONFIG = {
     globalEnabled: true,  // 开启全局开关
     adUnits: {
       banner: {
         enabled: true,
         unitId: 'adunit-1234567890',  // 填入真实ID
       }
     }
   };
   ```

3. **更新页面配置**
   ```javascript
   pages: {
     result: {
       banner: true,      // 开启页面广告
       rewardVideo: true
     }
   }
   ```

4. **测试验证**
   - 在开发者工具中测试
   - 真机调试验证
   - 确认广告正常显示和交互

## 最佳实践

### 1. 广告位置选择
- Banner广告适合放在页面顶部或底部
- 激励视频广告适合在用户需要奖励的场景
- 避免过度影响用户体验

### 2. 用户体验
- 提供明确的奖励说明
- 避免强制观看广告
- 合理设置广告刷新频率

### 3. 数据分析
- 监控广告展示率和点击率
- 分析用户互动数据
- 根据数据优化广告策略

### 4. 错误处理
- 准备广告加载失败的备用方案
- 提供友好的错误提示
- 确保广告错误不影响核心功能

## 技术支持

如果在使用过程中遇到问题：
1. 检查微信开发者工具控制台的错误信息
2. 确认广告位ID和配置的正确性
3. 参考微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/ad/
4. 查看本项目的相关日志和错误提示

本系统已经在八字测算小程序中成功集成和测试，具有良好的稳定性和扩展性。
