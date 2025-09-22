// history.js
const app = getApp()

Page({
  data: {
    historyList: []
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  // 加载历史记录
  loadHistory() {
    const history = app.getBaziHistory()
    
    // 格式化日期
    const formattedHistory = history.map(item => ({
      ...item,
      formattedDate: this.formatTimestamp(item.timestamp)
    }))

    this.setData({
      historyList: formattedHistory
    })
  },

  // 格式化时间戳
  formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  },

  // 查看结果
  viewResult(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(item))}`
    })
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('baziHistory')
          app.globalData.baziHistory = []
          this.setData({
            historyList: []
          })
          wx.showToast({
            title: '已清空历史记录',
            icon: 'success'
          })
        }
      }
    })
  }
})
