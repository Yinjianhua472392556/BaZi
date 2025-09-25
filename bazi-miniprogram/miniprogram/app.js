// app.js
const { iconManager } = require('./utils/icon-manager.js')

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 延迟初始化图标管理器，确保 globalData 已设置
    setTimeout(() => {
      this.initIcons()
    }, 100)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功，code:', res.code)
      }
    })
  },

  // 初始化图标系统
  async initIcons() {
    try {
      console.log('开始初始化动态图标系统...')
      
      // 确保 globalData 已初始化
      if (!this.globalData) {
        console.warn('globalData 未初始化，跳过图标系统初始化')
        return
      }
      
      const success = await iconManager.init()
      
      if (success) {
        console.log('动态图标系统初始化成功')
        // 将图标管理器添加到全局数据
        this.globalData.iconManager = iconManager
      } else {
        console.log('动态图标系统初始化失败，使用默认图标')
      }
    } catch (error) {
      console.error('图标系统初始化出错，将使用默认图标:', error)
    }
  },
  
  globalData: {
    userInfo: null,
    apiBaseUrl: 'http://10.60.20.222:8001',  // 后端API地址（内网IP，用于真机测试）
    baziHistory: [],  // 八字测算历史记录
    baziResult: null,  // 当前八字测算结果
    currentUser: null
  },

  // 全局API请求方法
  request(options) {
    const { url, method = 'GET', data = {}, success, fail } = options
    
    wx.request({
      url: this.globalData.apiBaseUrl + url,
      method: method,
      data: data,
      header: {
        'content-type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log('API请求成功:', url, res.data)
        if (success) success(res.data)
      },
      fail: (err) => {
        console.error('API请求失败:', url, err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        if (fail) fail(err)
      }
    })
  },

  // 保存八字测算结果到本地（不自动保存到历史记录）
  saveBaziResult(result) {
    // 保存当前结果到全局数据
    this.globalData.baziResult = result
    
    // 同时保存到缓存，供结果页面使用
    wx.setStorageSync('lastBaziResult', result)
    
    console.log('八字结果已保存到缓存:', result)
  },

  // 手动保存到历史记录
  saveToHistory(result) {
    try {
      // 获取现有历史记录
      const history = wx.getStorageSync('baziHistory') || []
      
      // 创建新的历史记录
      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...result
      }
      
      // 添加到历史记录开头
      history.unshift(newRecord)
      
      // 限制历史记录数量（最多50条）
      if (history.length > 50) {
        history.splice(50)
      }
      
      // 保存到缓存
      wx.setStorageSync('baziHistory', history)
      this.globalData.baziHistory = history
      
      console.log('已保存到历史记录:', newRecord)
      return true
    } catch (error) {
      console.error('保存历史记录失败:', error)
      return false
    }
  },

  // 获取八字历史记录
  getBaziHistory() {
    const history = wx.getStorageSync('baziHistory') || []
    this.globalData.baziHistory = history
    return history
  },

  // 格式化日期为中文
  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  },

  // 格式化时间为中文
  formatTime(hour, minute = 0) {
    const hourNames = [
      '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
      '午时', '未时', '申时', '酉时', '戌时', '亥时'
    ]
    const hourIndex = Math.floor(((hour + 1) % 24) / 2)
    return `${hourNames[hourIndex]}(${hour}:${minute.toString().padStart(2, '0')})`
  }
})
