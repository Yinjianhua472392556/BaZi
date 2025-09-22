// index.js
const app = getApp()

Page({
  data: {
    birthDate: '',
    birthTime: '',
    gender: 'male',
    name: '',
    calculating: false,
    canCalculate: false,
    maxDate: ''
  },

  onLoad() {
    // 设置最大日期为今天
    const today = new Date()
    const maxDate = today.toISOString().split('T')[0]
    this.setData({
      maxDate: maxDate
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      birthDate: e.detail.value
    })
    this.checkCanCalculate()
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      birthTime: e.detail.value
    })
    this.checkCanCalculate()
  },

  // 性别选择
  onGenderChange(e) {
    this.setData({
      gender: e.detail.value
    })
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 检查是否可以测算
  checkCanCalculate() {
    const { birthDate, birthTime } = this.data
    this.setData({
      canCalculate: birthDate && birthTime
    })
  },

  // 填充示例数据
  fillExample() {
    this.setData({
      birthDate: '1990-01-01',
      birthTime: '12:00',
      gender: 'male',
      name: '张三'
    })
    this.checkCanCalculate()
  },

  // 测试API连接
  testApi() {
    wx.showLoading({
      title: '测试连接中...'
    })

    app.request({
      url: '/api/v1/test',
      method: 'GET',
      success: (data) => {
        wx.hideLoading()
        wx.showModal({
          title: '连接测试成功',
          content: `API状态: ${data.data.status}\n功能: ${data.data.features.join(', ')}`,
          showCancel: false
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showModal({
          title: '连接测试失败',
          content: '请检查后端服务是否启动\n确认地址: http://localhost:8000',
          showCancel: false
        })
      }
    })
  },

  // 开始测算八字
  calculateBazi() {
    if (!this.data.canCalculate) {
      wx.showToast({
        title: '请完善出生信息',
        icon: 'none'
      })
      return
    }

    this.setData({
      calculating: true
    })

    // 解析出生日期和时间
    const birthDateTime = new Date(`${this.data.birthDate} ${this.data.birthTime}`)
    const birthData = {
      year: birthDateTime.getFullYear(),
      month: birthDateTime.getMonth() + 1,
      day: birthDateTime.getDate(),
      hour: birthDateTime.getHours(),
      gender: this.data.gender,
      name: this.data.name || '匿名用户'
    }

    wx.showLoading({
      title: '正在测算中...'
    })

    // 调用后端API
    app.request({
      url: '/api/v1/calculate-bazi',
      method: 'POST',
      data: birthData,
      success: (result) => {
        wx.hideLoading()
        this.setData({
          calculating: false
        })

        if (result.success) {
          // 保存测算结果
          const resultData = {
            ...result.data,
            birthInfo: {
              date: this.data.birthDate,
              time: this.data.birthTime,
              gender: this.data.gender,
              name: this.data.name
            }
          }
          app.saveBaziResult(resultData)

          // 跳转到结果页面
          wx.navigateTo({
            url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`
          })
        } else {
          wx.showModal({
            title: '测算失败',
            content: result.error || '测算过程中出现错误',
            showCancel: false
          })
        }
      },
      fail: (error) => {
        wx.hideLoading()
        this.setData({
          calculating: false
        })
        
        console.error('测算请求失败:', error)
        wx.showModal({
          title: '测算失败',
          content: '网络连接失败，请检查后端服务状态',
          showCancel: false
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '八字运势测算 - 探索您的命运密码',
      path: '/pages/index/index'
    }
  }
})
