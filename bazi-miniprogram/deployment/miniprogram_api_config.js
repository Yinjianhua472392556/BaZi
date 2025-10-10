// ===============================================
// 八字运势小程序 - API配置文件
// ===============================================
// 
// 使用说明：
// 1. 根据您的服务器部署情况修改下面的配置
// 2. 将此文件内容复制到小程序的相应配置文件中
// 3. 确保微信后台已配置相应的域名白名单
//
// ===============================================

// 🌐 API配置 - 根据您的实际部署情况修改
const API_CONFIG = {
  // 生产环境配置
  production: {
    // 使用您的实际域名和SSL证书
    apiBaseUrl: 'https://api.bazi365.top',
    
    // 备用IP地址配置（如果域名出现问题可以临时使用）
    // apiBaseUrl: 'http://119.91.146.128:8001',
    
    timeout: 10000,        // 请求超时时间(毫秒)
    retryTimes: 2,         // 重试次数
    enableLog: false       // 是否启用调试日志
  },
  
  // 开发环境配置(本地测试)
  development: {
    apiBaseUrl: 'http://localhost:8001',
    timeout: 5000,
    retryTimes: 1,
    enableLog: true
  }
}

// 🔧 自动环境检测
const ENV = wx.getAccountInfoSync().miniProgram.envVersion || 'release'
let currentConfig

switch(ENV) {
  case 'develop':    // 开发版
  case 'trial':      // 体验版
    currentConfig = API_CONFIG.development
    break
  case 'release':    // 正式版
  default:
    currentConfig = API_CONFIG.production
    break
}

// 📡 API请求封装
const request = (options = {}) => {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true,
    loadingText = '加载中...'
  } = options

  // 显示加载提示
  if (showLoading) {
    wx.showLoading({
      title: loadingText,
      mask: true
    })
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${currentConfig.apiBaseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: currentConfig.timeout,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading()
        }

        if (currentConfig.enableLog) {
          console.log(`API请求成功: ${method} ${url}`, res)
        }

        // 检查HTTP状态码
        if (res.statusCode === 200) {
          // 检查业务状态码
          if (res.data && res.data.success !== false) {
            resolve(res.data)
          } else {
            reject(new Error(res.data?.message || '请求失败'))
          }
        } else {
          reject(new Error(`服务器错误: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading()
        }

        if (currentConfig.enableLog) {
          console.error(`API请求失败: ${method} ${url}`, err)
        }

        // 网络错误处理
        let errorMessage = '网络连接失败'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接'
          } else if (err.errMsg.includes('fail')) {
            errorMessage = '无法连接到服务器'
          }
        }

        reject(new Error(errorMessage))
      }
    })
  })
}

// 📱 具体API接口封装
const API = {
  // 健康检查
  healthCheck() {
    return request({
      url: '/health',
      method: 'GET',
      showLoading: false
    })
  },

  // 网络连接测试
  networkTest() {
    return request({
      url: '/api/v1/network-test',
      method: 'GET',
      showLoading: false
    })
  },

  // 八字计算
  calculateBazi(birthData) {
    return request({
      url: '/api/v1/calculate-bazi',
      method: 'POST',
      data: birthData,
      loadingText: '计算八字中...'
    })
  },

  // 起名建议
  generateNames(namingData) {
    return request({
      url: '/api/v1/naming/generate-names',
      method: 'POST',
      data: namingData,
      loadingText: '生成名字中...'
    })
  },

  // 生肖配对
  zodiacMatching(matchingData) {
    return request({
      url: '/api/v1/zodiac-matching',
      method: 'POST',
      data: matchingData,
      loadingText: '分析配对中...'
    })
  },

  // 节日查询
  getFestivals() {
    return request({
      url: '/api/v1/festivals',
      method: 'GET',
      loadingText: '查询节日中...'
    })
  },

  // 农历转公历
  lunarToSolar(lunarData) {
    return request({
      url: '/api/v1/lunar-to-solar',
      method: 'POST',
      data: lunarData,
      showLoading: false
    })
  },

  // 公历转农历
  solarToLunar(solarData) {
    return request({
      url: '/api/v1/solar-to-lunar',
      method: 'POST',
      data: solarData,
      showLoading: false
    })
  }
}

// 🔌 错误处理和重试机制
const requestWithRetry = async (apiFunc, ...args) => {
  let lastError = null
  
  for (let i = 0; i <= currentConfig.retryTimes; i++) {
    try {
      const result = await apiFunc(...args)
      return result
    } catch (error) {
      lastError = error
      
      if (currentConfig.enableLog) {
        console.warn(`API请求第${i + 1}次失败:`, error.message)
      }
      
      // 如果不是最后一次，等待后重试
      if (i < currentConfig.retryTimes) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// 🏷️ 导出配置和API
module.exports = {
  API_CONFIG,
  currentConfig,
  request,
  API,
  requestWithRetry
}

// ===============================================
// 使用示例
// ===============================================
/*

// 在页面中使用：

// 1. 引入API配置
const { API, requestWithRetry } = require('../../utils/api-config')

// 2. 在页面中调用API
Page({
  data: {
    baziResult: null
  },

  // 计算八字
  async calculateBazi() {
    try {
      const birthData = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 10,
        gender: 'male',
        name: '张三'
      }

      // 使用重试机制
      const result = await requestWithRetry(API.calculateBazi, birthData)
      
      this.setData({
        baziResult: result
      })

      wx.showToast({
        title: '计算完成',
        icon: 'success'
      })

    } catch (error) {
      console.error('八字计算失败:', error)
      
      wx.showToast({
        title: error.message || '计算失败',
        icon: 'none'
      })
    }
  },

  // 网络连接测试
  async testConnection() {
    try {
      await API.networkTest()
      wx.showToast({
        title: '连接正常',
        icon: 'success'
      })
    } catch (error) {
      wx.showModal({
        title: '连接异常',
        content: `无法连接到服务器: ${error.message}`,
        showCancel: false
      })
    }
  }
})

*/

// ===============================================
// 微信后台域名配置指南
// ===============================================
/*

请在微信公众平台配置以下域名：
https://mp.weixin.qq.com

开发设置 → 服务器域名：

request合法域名：
- https://api.yourdomain.com (如果使用域名)
- 或配置IP白名单

socket合法域名：
- https://api.yourdomain.com (如果使用域名)

uploadFile合法域名：
- https://api.yourdomain.com (如果使用域名)

downloadFile合法域名：
- https://api.yourdomain.com (如果使用域名)

注意：
1. 如果使用IP地址，需要联系微信客服配置IP白名单
2. 建议使用域名和HTTPS，更稳定和安全
3. 域名必须备案(如果服务器在国内)

*/
