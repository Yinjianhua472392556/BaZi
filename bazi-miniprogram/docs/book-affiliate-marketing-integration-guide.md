# 书籍联盟营销功能集成指南

## 1. 一键部署指南

### 1.1 快速部署
```bash
# 唯一需要的操作 - 一键部署
cd bazi-miniprogram/deployment
sudo bash auto_deploy.sh
```

### 1.2 部署完成验证
```bash
# 验证服务状态
systemctl status bazi-api

# 测试联盟营销API
curl -X POST https://your-domain.com/api/v1/books/recommendations \
  -H "Content-Type: application/json" \
  -d '{"wuxing_lack":["金"],"function_type":"bazi_calculation"}'
```

## 2. API接口文档

### 2.1 获取书籍推荐
**接口**：`POST /api/v1/books/recommendations`

**请求参数**：
```json
{
  "type": "bazi_result",
  "wuxing_lack": ["金", "水"],
  "function_type": "bazi_calculation",
  "count": 5
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "book_id": "book_001",
        "title": "金系养生调理法",
        "author": "张三",
        "price": 39.8,
        "platform": "taobao",
        "cover_url": "https://example.com/cover.jpg",
        "reason": "适合五行缺金的调理"
      }
    ]
  },
  "timestamp": 1697251200
}
```

### 2.2 生成联盟链接
**接口**：`POST /api/v1/books/affiliate-link`

**请求参数**：
```json
{
  "book_id": "book_001",
  "platform": "taobao",
  "user_id": "user_123"
}
```

**响应示例**：
```json
{
  "success": true,
  "affiliate_link": "https://s.click.taobao.com/xxx",
  "miniprogram_config": {
    "appId": "wxbc8f7bc25e6b9798",
    "path": "pages/detail/detail?id=book_001"
  },
  "tracking_id": "track_xxx"
}
```

## 3. 小程序集成示例

### 3.1 结果页面集成
```javascript
// pages/result/result.js
async getBookRecommendations(baziResult) {
  try {
    const res = await wx.request({
      url: `${app.globalData.apiBase}/api/v1/books/recommendations`,
      method: 'POST',
      data: {
        type: 'bazi_result',
        wuxing_lack: baziResult.wuxing_lack || [],
        function_type: 'bazi_calculation'
      }
    });
    
    if (res.data.success) {
      this.setData({
        bookRecommendations: res.data.data.recommendations
      });
    }
  } catch (error) {
    console.error('获取推荐失败:', error);
  }
}
```

### 3.2 推荐展示组件
```xml
<!-- pages/result/result.wxml -->
<view wx:if="{{bookRecommendations.length > 0}}" class="book-recommendations">
  <text class="recommendation-title">深入了解相关知识</text>
  <view class="book-grid">
    <view 
      wx:for="{{bookRecommendations}}" 
      wx:key="book_id"
      class="book-item"
      data-book-id="{{item.book_id}}"
      data-platform="{{item.platform}}"
      bindtap="onBookClick"
    >
      <image class="book-cover" src="{{item.cover_url}}" />
      <text class="book-title">{{item.title}}</text>
      <text class="book-price">¥{{item.price}}</text>
      <text class="book-reason">{{item.reason}}</text>
    </view>
  </view>
</view>
```

## 4. 故障排除

### 4.1 常见问题

**问题1：API返回"联盟营销服务不可用"**
- 检查：`backend/app/book_affiliate.py`文件是否存在
- 检查：`requirements.txt`中是否包含`aiohttp>=3.8.0`
- 解决：重新执行部署脚本

**问题2：获取推荐返回空结果**
- 检查：网络连接是否正常
- 检查：平台API密钥是否正确配置
- 解决：查看服务日志确认具体错误

**问题3：小程序跳转失败**
- 检查：目标小程序appId是否正确
- 检查：小程序是否已发布
- 解决：使用复制链接的降级方案

### 4.2 日志查看
```bash
# 查看服务日志
journalctl -u bazi-api -f

# 查看错误日志
tail -f /var/log/bazi-api.error.log
```

## 5. 配置说明

### 5.1 平台配置
所有平台配置内置在代码中，包括：
- 淘宝联盟（主要平台）
- 京东联盟
- 拼多多联盟

### 5.2 推荐规则
内置推荐规则包括：
- 五行缺失对应书籍
- 功能使用对应书籍
- 通用传统文化书籍

## 6. 性能优化

### 6.1 缓存策略
- API响应缓存1小时
- 推荐结果本地缓存
- 联盟链接缓存30分钟

### 6.2 降级机制
- 平台API不可用时自动降级
- 网络异常时显示友好提示
- 小程序跳转失败时复制链接

## 7. 监控指标

### 7.1 关键指标
- API响应时间：< 2秒
- 推荐成功率：> 95%
- 链接生成成功率：> 90%
- 小程序跳转成功率：> 60%

### 7.2 业务指标
- 推荐点击率：目标 > 5%
- 转化率：目标 > 3%
- 用户满意度：目标 > 4.0/5.0

---

**文档版本**：v1.0  
**编写日期**：2025年10月14日  
**适用版本**：终极简化版
