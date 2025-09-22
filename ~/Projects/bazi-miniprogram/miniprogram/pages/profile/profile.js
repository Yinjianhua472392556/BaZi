// profile.js
Page({
  data: {},

  onLoad() {
    
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            })
          } catch (error) {
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 关于小程序
  aboutApp() {
    wx.showModal({
      title: '关于八字运势小程序',
      content: '版本：v1.0.0\n\n这是一个基于传统文化的娱乐性八字测算小程序。\n\n所有测算结果仅供娱乐参考，请理性对待，不要将其作为人生重大决策的依据。',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})
