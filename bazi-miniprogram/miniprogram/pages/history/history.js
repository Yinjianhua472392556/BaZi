// history.js
const app = getApp()
const AdManager = require('../../utils/ad-manager')

Page({
  data: {
    historyList: []
  },

  async onLoad() {
    this.loadHistory()
    
    // 7. 访问历史记录页面时展示横幅广告
    try {
      const adManager = AdManager.getInstance()
      const adResult = await adManager.showBannerAd('history-page')
      
      if (adResult.skipped) {
        console.log('历史记录页横幅广告已跳过，原因:', adResult.reason)
      } else if (adResult.success) {
        console.log('历史记录页横幅广告展示成功')
      } else {
        console.log('历史记录页横幅广告展示失败:', adResult.error)
      }
    } catch (error) {
      console.warn('历史记录页横幅广告展示出错:', error)
    }
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

    // 按时间排序，最新的在前
    formattedHistory.sort((a, b) => b.timestamp - a.timestamp)

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
    } else if (diff < 604800000) { // 1周内
      const days = Math.floor(diff / 86400000)
      return `${days}天前`
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
  },

  // 查看结果详情
  viewResult(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(item))}`
    })
  },

  // 查看详情（操作按钮）
  viewDetail(e) {
    // 在小程序中使用 e.detail 来阻止冒泡
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(item))}`
    })
  },

  // 删除单个记录
  deleteItem(e) {
    // 移除 stopPropagation 调用，在小程序中不支持
    const item = e.currentTarget.dataset.item
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.removeHistoryItem(item.id)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 从存储中移除历史记录项
  removeHistoryItem(itemId) {
    const history = app.getBaziHistory()
    const filteredHistory = history.filter(item => item.id !== itemId)
    
    wx.setStorageSync('baziHistory', filteredHistory)
    app.globalData.baziHistory = filteredHistory
    
    this.loadHistory()
  },

  // 清空全部历史记录
  clearAllHistory() {
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
            title: '已清空所有历史记录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '八字运势测算 - 我的历史记录',
      path: '/pages/index/index'
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHistory()
    wx.stopPullDownRefresh()
  },

  // 跳转到首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
