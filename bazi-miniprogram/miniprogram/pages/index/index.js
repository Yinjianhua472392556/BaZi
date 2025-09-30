// index.js
const app = getApp()
const AdManager = require('../../utils/ad-manager')

Page({
  data: {
    birthDate: '',
    birthTime: '',
    gender: 'male',
    calendarType: 'solar', // 默认选择公历
    calculating: false,
    canCalculate: false,
    maxDate: '',
    
    // 农历选择相关 - 设置合理默认值
    lunarYear: '1990',
    lunarMonth: '正月',
    lunarDay: '初八',
    lunarYearIndex: -1,   // 初始化为-1，在onLoad中正确设置
    lunarMonthIndex: 0,   // 对应正月
    lunarDayIndex: 7,     // 对应初八 (index从0开始，初八是第8个，所以是index 7)
    lunarYears: [],
    lunarMonths: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    lunarDays: [],
    
    // 对应日期显示
    correspondingLunarDate: '',
    correspondingSolarDate: ''
  },

  onLoad() {
    // 设置最大日期为今天，确保格式正确
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const maxDate = `${year}-${month}-${day}`
    
    console.log('设置maxDate:', maxDate) // 调试日志
    
    // 初始化农历年份选择器 - 只存储数字，不包含"年"字
    const currentYear = today.getFullYear()
    const lunarYears = []
    for (let year = 1900; year <= currentYear; year++) {
      lunarYears.push(year.toString()) // 存储纯数字字符串
    }
    
    // 初始化农历日期选择器 - 修复undefined问题
    const lunarDays = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    
    // 计算1990年在数组中的正确索引
    const defaultYearIndex = lunarYears.findIndex(year => year === '1990')
    
    this.setData({
      maxDate: maxDate,
      lunarYears: lunarYears,
      lunarDays: lunarDays,
      lunarYearIndex: defaultYearIndex >= 0 ? defaultYearIndex : 90  // 如果找不到1990年，使用90作为默认值
    })
    
    console.log('初始化完成，农历年份数组长度:', lunarYears.length) // 调试日志
  },

  // 日期选择
  onDateChange(e) {
    const birthDate = e.detail.value
    this.setData({
      birthDate: birthDate
    })
    
    // 如果是公历模式，更新对应的农历显示
    if (this.data.calendarType === 'solar') {
      this.updateSolarToLunar(birthDate)
    }
    
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

  // 日历类型选择
  onCalendarTypeChange(e) {
    const calendarType = e.detail.value
    
    if (calendarType === 'lunar') {
      // 切换到农历模式时，恢复默认值
      this.setData({
        calendarType: calendarType,
        birthDate: '',
        lunarYear: '1990',
        lunarMonth: '正月',
        lunarDay: '初八',
        lunarYearIndex: 1990 - 1900,  // 动态计算1990年的索引
        lunarMonthIndex: 0,
        lunarDayIndex: 7,
        correspondingLunarDate: '',
        correspondingSolarDate: ''
      })
      // 自动更新对应的公历日期
      this.updateLunarToSolar()
    } else {
      // 切换到公历模式时，重置所有选择
      this.setData({
        calendarType: calendarType,
        birthDate: '',
        lunarYear: '',
        lunarMonth: '',
        lunarDay: '',
        lunarYearIndex: -1,
        lunarMonthIndex: -1,
        lunarDayIndex: -1,
        correspondingLunarDate: '',
        correspondingSolarDate: ''
      })
    }
    
    this.checkCanCalculate()
  },

  // 农历年选择
  onLunarYearChange(e) {
    const index = e.detail.value
    const year = this.data.lunarYears[index]
    this.setData({
      lunarYearIndex: index,
      lunarYear: year
    })
    this.updateLunarToSolar()
  },

  // 农历月选择
  onLunarMonthChange(e) {
    const index = e.detail.value
    const month = this.data.lunarMonths[index]
    this.setData({
      lunarMonthIndex: index,
      lunarMonth: month
    })
    this.updateLunarToSolar()
  },

  // 农历日选择
  onLunarDayChange(e) {
    const index = e.detail.value
    const day = this.data.lunarDays[index]
    this.setData({
      lunarDayIndex: index,
      lunarDay: day
    })
    this.updateLunarToSolar()
  },

  // 农历转公历并更新显示
  updateLunarToSolar() {
    const { lunarYearIndex, lunarMonthIndex, lunarDayIndex } = this.data
    
    if (lunarYearIndex >= 0 && lunarMonthIndex >= 0 && lunarDayIndex >= 0) {
      const year = parseInt(this.data.lunarYears[lunarYearIndex])
      const month = lunarMonthIndex + 1
      const day = lunarDayIndex + 1
      
      // 调用后端API进行农历转公历
      app.request({
        url: '/api/v1/lunar-to-solar',
        method: 'POST',
        data: {
          year: year,
          month: month,
          day: day,
          leap: false
        },
        success: (result) => {
          if (result.success) {
            const solarDate = result.data.solar_date
            const solarDateStr = `${solarDate.year}-${solarDate.month.toString().padStart(2, '0')}-${solarDate.day.toString().padStart(2, '0')}`
            
            this.setData({
              birthDate: solarDateStr,
              correspondingSolarDate: solarDateStr
            })
            this.checkCanCalculate()
          }
        },
        fail: (error) => {
          console.error('农历转公历失败:', error)
        }
      })
    }
  },

  // 公历日期变化时更新对应农历显示
  updateSolarToLunar(solarDate) {
    if (!solarDate) return
    
    const dateArr = solarDate.split('-')
    if (dateArr.length !== 3) return
    
    app.request({
      url: '/api/v1/solar-to-lunar',
      method: 'POST',
      data: {
        year: parseInt(dateArr[0]),
        month: parseInt(dateArr[1]),
        day: parseInt(dateArr[2])
      },
      success: (result) => {
        if (result.success) {
          const lunarDate = result.data.lunar_date
          const lunarDateStr = `${lunarDate.year}年${this.data.lunarMonths[lunarDate.month - 1]}${this.data.lunarDays[lunarDate.day - 1]}`
          
          this.setData({
            correspondingLunarDate: lunarDateStr
          })
        }
      },
      fail: (error) => {
        console.error('公历转农历失败:', error)
      }
    })
  },

  // 检查是否可以测算
  checkCanCalculate() {
    const { birthDate, birthTime, calendarType, lunarYearIndex, lunarMonthIndex, lunarDayIndex } = this.data
    
    let dateComplete = false
    if (calendarType === 'lunar') {
      // 农历模式：检查三个选择器都已选择
      dateComplete = lunarYearIndex >= 0 && lunarMonthIndex >= 0 && lunarDayIndex >= 0
    } else {
      // 公历模式：检查日期字符串
      dateComplete = birthDate && birthDate.length > 0
    }
    
    this.setData({
      canCalculate: dateComplete && birthTime
    })
  },

  // 开始测算八字
  async calculateBazi() {
    if (!this.data.canCalculate) {
      wx.showToast({
        title: '请完善出生信息',
        icon: 'none'
      })
      return
    }

    // 1. 点击八字测算页面的开始测算时展示插屏广告
    try {
      const adManager = AdManager.getInstance()
      const adResult = await adManager.showInterstitialAd('index')
      
      if (adResult.skipped) {
        console.log('广告已跳过，原因:', adResult.reason)
      } else if (adResult.success) {
        console.log('插屏广告展示成功')
      } else {
        console.log('插屏广告展示失败，继续执行:', adResult.error)
      }
    } catch (error) {
      console.warn('广告展示出错，继续执行:', error)
    }

    this.setData({
      calculating: true
    })

    let birthData;
    
    // 验证出生时间
    if (!this.data.birthTime) {
      wx.showToast({
        title: '请选择出生时间',
        icon: 'none'
      })
      this.setData({ calculating: false })
      return
    }
    
    // 解析时间
    const timeArr = this.data.birthTime.split(':')
    const hour = timeArr.length >= 2 ? parseInt(timeArr[0]) : 12
    
    if (this.data.calendarType === 'lunar') {
      // 农历模式：使用农历选择的数据
      console.log('农历模式调试信息:', {
        lunarYearIndex: this.data.lunarYearIndex,
        lunarMonthIndex: this.data.lunarMonthIndex,
        lunarDayIndex: this.data.lunarDayIndex,
        lunarYearsLength: this.data.lunarYears.length,
        lunarMonthsLength: this.data.lunarMonths.length,
        lunarDaysLength: this.data.lunarDays.length
      })
      
      if (this.data.lunarYearIndex < 0 || this.data.lunarMonthIndex < 0 || this.data.lunarDayIndex < 0) {
        wx.showToast({
          title: '请选择完整的农历日期',
          icon: 'none'
        })
        this.setData({ calculating: false })
        return
      }
      
      // 验证索引范围
      if (this.data.lunarYearIndex >= this.data.lunarYears.length ||
          this.data.lunarMonthIndex >= this.data.lunarMonths.length ||
          this.data.lunarDayIndex >= this.data.lunarDays.length) {
        console.error('农历索引超出范围:', {
          yearIndex: this.data.lunarYearIndex,
          monthIndex: this.data.lunarMonthIndex, 
          dayIndex: this.data.lunarDayIndex,
          yearArrayLength: this.data.lunarYears.length,
          monthArrayLength: this.data.lunarMonths.length,
          dayArrayLength: this.data.lunarDays.length
        })
        wx.showToast({
          title: '日期选择错误，请重新选择',
          icon: 'none'
        })
        this.setData({ calculating: false })
        return
      }
      
      // 从数组中获取正确的数值
      const year = parseInt(this.data.lunarYears[this.data.lunarYearIndex])
      const month = parseInt(this.data.lunarMonthIndex) + 1  // 确保是数字
      const day = parseInt(this.data.lunarDayIndex) + 1      // 确保是数字
      
      // 验证计算结果
      if (isNaN(year) || isNaN(month) || isNaN(day) || 
          month < 1 || month > 12 || day < 1 || day > 30) {
        console.error('农历数据计算错误:', {
          year, month, day,
          yearIndex: this.data.lunarYearIndex,
          monthIndex: this.data.lunarMonthIndex,
          dayIndex: this.data.lunarDayIndex
        })
        wx.showToast({
          title: '日期计算错误，请重新选择',
          icon: 'none'
        })
        this.setData({ calculating: false })
        return
      }
      
      birthData = {
        year: year,
        month: month,
        day: day,
        hour: hour,
        gender: this.data.gender,
        name: '匿名用户',
        calendarType: 'lunar'
      }
      
      console.log('农历模式发送数据:', birthData) // 调试日志
      
    } else {
      // 公历模式：解析出生日期
      if (!this.data.birthDate) {
        wx.showToast({
          title: '请选择出生日期',
          icon: 'none'
        })
        this.setData({ calculating: false })
        return
      }
      
      const dateArr = this.data.birthDate.split('-')
      if (dateArr.length !== 3) {
        wx.showToast({
          title: '日期格式错误',
          icon: 'none'
        })
        this.setData({ calculating: false })
        return
      }
      
      birthData = {
        year: parseInt(dateArr[0]),
        month: parseInt(dateArr[1]),
        day: parseInt(dateArr[2]),
        hour: hour,
        gender: this.data.gender,
        name: '匿名用户',
        calendarType: 'solar'
      }
      
      console.log('公历模式发送数据:', birthData) // 调试日志
    }
    
    // 最终数据验证
    if (!birthData.year || !birthData.month || !birthData.day || birthData.hour === undefined ||
        birthData.month < 1 || birthData.month > 12 || birthData.day < 1 || birthData.day > 31) {
      console.error('最终数据验证失败:', birthData)
      wx.showToast({
        title: '数据格式错误，请重新选择',
        icon: 'none'
      })
      this.setData({ calculating: false })
      return
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
              name: '匿名用户'
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
