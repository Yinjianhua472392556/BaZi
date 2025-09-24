// profile.js
Page({
  data: {},

  onLoad() {
    // 页面加载时的初始化逻辑
  },

  onShow() {
    // 页面显示时的逻辑
  },

  // 关于小程序
  aboutApp() {
    wx.showModal({
      title: '关于八字运势小程序',
      content: '这是一个基于传统文化的娱乐性八字测算小程序，采用中国古代天干地支理论，为用户提供个性化的运势分析。\n\n✨ 主要功能：\n• 八字测算与分析\n• 五行平衡查看\n• 历史记录管理\n\n⚠️ 重要提醒：\n所有测算结果仅供娱乐参考，请理性对待，不要将其作为人生重大决策的依据。传统文化应以科学的态度去了解和欣赏。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#40E0D0'
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '八字运势测算 - 传统文化娱乐小程序',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '八字运势测算 - 传统文化娱乐小程序',
      query: 'from=timeline',
      imageUrl: '/images/share-bg.png'
    }
  }
})
