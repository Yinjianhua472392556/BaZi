# 书籍联盟营销功能 - 5分钟快速上手

## 🚀 快速部署（1分钟）

### 一键部署命令
```bash
cd bazi-miniprogram/deployment
sudo bash auto_deploy.sh
```

就这样！部署完成后联盟营销功能自动可用。

## 📱 小程序集成（2分钟）

### 在结果页面显示推荐
只需在`pages/result/result.js`中添加：

```javascript
// 获取八字结果后调用
async getBaziResult(resultId) {
  // 现有代码...
  
  // 新增：获取书籍推荐
  await this.getBookRecommendations(baziResult);
},

// 新增：获取推荐方法
async getBookRecommendations(baziResult) {
  try {
    const res = await wx.request({
      url: `${app.globalData.apiBase}/api/v1/books/recommendations`,
      method: 'POST',
      data: {
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

### 在页面显示推荐书籍
在`pages/result/result.wxml`中添加：

```xml
<!-- 书籍推荐区域 -->
<view wx:if="{{bookRecommendations.length > 0}}" class="book-section">
  <text class="section-title">📚 深入了解相关知识</text>
  <view class="book-list">
    <view 
      wx:for="{{bookRecommendations}}" 
      wx:key="book_id"
      class="book-card"
      data-book-id="{{item.book_id}}"
      data-platform="{{item.platform}}"
      bindtap="onBookClick"
    >
      <image class="book-cover" src="{{item.cover_url}}" mode="aspectFit" />
      <view class="book-info">
        <text class="book-title">{{item.title}}</text>
        <text class="book-price">¥{{item.price}}</text>
        <text class="book-reason">{{item.reason}}</text>
      </view>
    </view>
  </view>
</view>
```

### 处理点击事件
继续在`pages/result/result.js`中添加：

```javascript
// 新增：处理书籍点击
async onBookClick(e) {
  const { bookId, platform } = e.currentTarget.dataset;
  
  try {
    wx.showLoading({ title: '生成链接中...' });
    
    const res = await wx.request({
      url: `${app.globalData.apiBase}/api/v1/books/affiliate-link`,
      method: 'POST',
      data: {
        book_id: bookId,
        platform: platform
      }
    });
    
    if (res.data.success) {
      // 尝试跳转小程序
      wx.navigateToMiniProgram({
        appId: res.data.miniprogram_config.appId,
        path: res.data.miniprogram_config.path,
        fail: () => {
          // 跳转失败，复制链接
          wx.setClipboardData({
            data: res.data.affiliate_link,
            success: () => {
              wx.showToast({
                title: '链接已复制，请在浏览器打开',
                icon: 'none',
                duration: 2000
              });
            }
          });
        }
      });
    }
  } catch (error) {
    wx.showToast({ title: '获取链接失败', icon: 'error' });
  } finally {
    wx.hideLoading();
  }
}
```

## 🎨 样式美化（1分钟）

在`pages/result/result.wxss`中添加：

```css
/* 书籍推荐样式 */
.book-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.book-card {
  display: flex;
  padding: 20rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.book-card:active {
  transform: scale(0.98);
  background-color: #f8f8f8;
}

.book-cover {
  width: 100rpx;
  height: 130rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.3;
}

.book-price {
  font-size: 32rpx;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.book-reason {
  font-size: 24rpx;
  color: #666;
  line-height: 1.2;
}
```

## 🧪 测试验证（1分钟）

### 1. 测试API接口
```bash
curl -X POST https://your-domain.com/api/v1/books/recommendations \
  -H "Content-Type: application/json" \
  -d '{"wuxing_lack":["金"],"function_type":"bazi_calculation"}'
```

### 2. 在小程序中测试
1. 进行一次八字测算
2. 查看结果页面是否显示书籍推荐
3. 点击书籍测试跳转功能

### 3. 预期效果
- ✅ 结果页面显示3-5本相关书籍
- ✅ 点击书籍能跳转到购买页面
- ✅ 跳转失败时自动复制链接

## 📊 成功指标

### 立即可见的效果
- 用户完成测算后看到相关书籍推荐
- 推荐理由与测算结果相关
- 点击体验流畅，跳转成功

### 预期业务指标
- 推荐展示率：100%（所有测算用户）
- 点击率目标：> 5%
- 转化率目标：> 3%

## 🔧 常见问题速查

### Q: 部署后看不到推荐？
**A**: 检查以下内容：
```bash
# 1. 验证服务状态
systemctl status bazi-api

# 2. 检查日志
journalctl -u bazi-api -n 50

# 3. 测试API
curl -X POST localhost:8001/api/v1/books/recommendations \
  -H "Content-Type: application/json" \
  -d '{"wuxing_lack":["金"]}'
```

### Q: 小程序跳转失败？
**A**: 这是正常的！系统会自动复制链接到剪贴板，用户在浏览器打开即可。

### Q: 如何查看佣金收益？
**A**: 登录各平台的联盟后台查看：
- 淘宝联盟：https://pub.alimama.com/
- 京东联盟：https://union.jd.com/
- 拼多多联盟：https://jinbao.pinduoduo.com/

## 🎉 恭喜完成！

现在您的八字小程序已经具备了书籍联盟营销功能！

### 下一步可以做什么？
1. **监控数据**：观察用户点击和转化情况
2. **优化推荐**：根据数据调整推荐策略
3. **扩展功能**：在其他页面也添加推荐
4. **A/B测试**：测试不同的展示样式

### 技术支持
如遇到问题，请查看：
- 📖 [完整集成指南](./book-affiliate-marketing-integration-guide.md)
- 📋 [需求文档](../../book-affiliate-marketing-requirements.md)
- 🛠 [技术设计文档](../../book-affiliate-marketing-technical-design.md)

---

**快速上手时间**：5分钟  
**预期收益**：月增收5000-15000元  
**用户体验**：显著提升学习价值
