// history.js
const app = getApp()
const AdManager = require('../../utils/ad-manager')
const BaziDisplayManager = require('../../utils/bazi-display-manager')

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
    
    // 使用BaziDisplayManager增强历史记录显示名称
    const enhancedHistory = history.map(item => {
      try {
        console.log('🔍 处理历史记录项:', {
          id: item.id,
          timestamp: item.timestamp,
          has_bazi_result: !!item.bazi_result,
          has_birthInfo: !!item.birthInfo
        })
        
        // 修复：使用正确的方法名
        const fingerprint = BaziDisplayManager.generateBaziFingerprint(item.bazi_result)
        console.log('🔍 生成指纹:', fingerprint)
        
        // 修复：使用正确的参数调用getDisplayName
        const displayName = BaziDisplayManager.getDisplayName(item.birthInfo, fingerprint)
        
        // 检查是否有自定义备注
        const customNotes = wx.getStorageSync('baziCustomNotes') || {}
        const hasCustomNote = !!customNotes[fingerprint]
        
        console.log('🔍 显示信息:', {
          fingerprint,
          displayName,
          hasCustomNote
        })
        
        return {
          ...item,
          fingerprint: fingerprint,
          display_name: displayName,
          has_custom_note: hasCustomNote,
          formattedDate: this.formatTimestamp(item.timestamp)
        }
      } catch (error) {
        console.error('处理历史记录项失败:', error, item)
        // 如果出错，使用原始数据
        return {
          ...item,
          display_name: item.user_info?.name || item.birthInfo?.name || '匿名用户',
          has_custom_note: false,
          formattedDate: this.formatTimestamp(item.timestamp)
        }
      }
    })

    // 按时间排序，最新的在前
    enhancedHistory.sort((a, b) => b.timestamp - a.timestamp)

    this.setData({
      historyList: enhancedHistory
    })
    
    console.log('历史记录加载完成:', {
      total: enhancedHistory.length,
      withCustomNotes: enhancedHistory.filter(item => item.has_custom_note).length
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
          // 清除历史记录
          wx.removeStorageSync('baziHistory')
          app.globalData.baziHistory = []
          
          // 同时清除家庭成员数据（解决删除历史记录后仍显示家庭运势的问题）
          wx.removeStorageSync('family_bazi_members')
          
          // 清除相关缓存
          wx.removeStorageSync('dailyFortuneCache')
          wx.removeStorageSync('universalFortuneCache')
          wx.removeStorageSync('baziCustomNotes')
          
          this.setData({
            historyList: []
          })
          
          wx.showToast({
            title: '已清空所有记录',
            icon: 'success'
          })
          
          console.log('🧹 已清空历史记录和家庭成员数据')
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
