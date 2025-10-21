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

  // 初始化图标系统 - 简化版本
  async initIcons() {
    try {
      console.log('使用静态图标配置，无需动态下载')
      
      // 简单初始化，仅用于兼容性
      const success = await iconManager.init()
      
      if (success) {
        console.log('静态图标配置确认正常')
        this.globalData.iconManager = iconManager
      }
    } catch (error) {
      console.error('图标系统检查出错:', error)
    }
  },
  
  globalData: {
    userInfo: null,
    apiBaseUrl: 'http://10.60.20.222:8001',  // 本地调试服务器
    // apiBaseUrl: 'http://119.91.146.128:8001',  // 临时使用IP地址（备案期间）
    // 正式域名：'https://api.bazi365.top' （备案完成后恢复）
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
    
    console.log('八字结果已保存到缓存:', result)
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
