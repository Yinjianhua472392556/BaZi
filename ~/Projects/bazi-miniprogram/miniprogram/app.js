// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功，code:', res.code)
      }
    })
  },
  
  globalData: {
    userInfo: null,
    apiBaseUrl: 'http://localhost:8000',  // 后端API地址
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

  // 保存八字测算结果到本地
  saveBaziResult(result) {
    // 保存当前结果到全局数据
    this.globalData.baziResult = result
    
    // 同时保存到缓存，供结果页面使用
    wx.setStorageSync('lastBaziResult', result)
    
    // 保存到历史记录
    const history = wx.getStorageSync('baziHistory') || []
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...result
    }
    history.unshift(newRecord)
    
    // 只保留最近20条记录
    if (history.length > 20) {
      history.splice(20)
    }
    
    wx.setStorageSync('baziHistory', history)
    this.globalData.baziHistory = history
    
    console.log('八字结果已保存:', result)
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
