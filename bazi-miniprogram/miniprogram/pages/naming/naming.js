// pages/naming/naming.js
const app = getApp()
const AdManager = require('../../utils/ad-manager')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 基本信息
    surname: '',
    gender: 'male',
    
    // 出生信息 - 与八字测算页面统一
    birthDate: '',
    birthTime: '',
    calendarType: 'solar',
    maxDate: '',
    
    // 农历选择相关 - 与八字测算页面完全一致
    lunarYear: '1990',
    lunarMonth: '正月',
    lunarDay: '初八',
    lunarYearIndex: -1,
    lunarMonthIndex: 0,
    lunarDayIndex: 7,
    lunarYears: [],
    lunarMonths: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    lunarDays: [],
    
    // 对应日期显示
    correspondingLunarDate: '',
    correspondingSolarDate: '',
    
    // 起名偏好
    nameLength: 2,
    
    // 选择器索引
    genderIndex: 0,
    nameLengthIndex: 1,
    
    // 性别选项
    genderOptions: [
      { value: 'male', text: '男' },
      { value: 'female', text: '女' }
    ],
    
    // 名字长度选项
    nameLengthOptions: [
      { value: 1, text: '单名' },
      { value: 2, text: '双名' }
    ],
    
    // 分析结果
    baziAnalysis: null,
    recommendations: [],
    analysisSummary: '',
    namingSuggestions: '',
    
    // UI状态
    analyzing: false,
    generating: false,
    showResults: false,
    selectedName: null,
    showNameDetail: false,
    showShareModal: false,
    shareNameIndex: null,
    canNaming: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 设置最大日期为今天
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const maxDate = `${year}-${month}-${day}`;
    
    // 初始化农历年份选择器
    const currentYear = today.getFullYear();
    const lunarYears = [];
    for (let year = 1900; year <= currentYear; year++) {
      lunarYears.push(year.toString());
    }
    
    // 初始化农历日期选择器 - 修复undefined问题
    const lunarDays = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    
    // 计算1990年在数组中的正确索引
    const defaultYearIndex = lunarYears.findIndex(year => year === '1990');
    
    this.setData({
      maxDate: maxDate,
      lunarYears: lunarYears,
      lunarDays: lunarDays,
      lunarYearIndex: defaultYearIndex >= 0 ? defaultYearIndex : 90
    });

    // 如果从八字页面跳转过来，获取出生信息
    if (options.birthInfo) {
      try {
        const birthInfo = JSON.parse(decodeURIComponent(options.birthInfo));
        this.setData({
          birthYear: birthInfo.year,
          birthMonth: birthInfo.month,
          birthDay: birthInfo.day,
          birthHour: birthInfo.hour || 12,
          gender: birthInfo.gender || 'male',
          calendarType: birthInfo.calendarType || 'solar'
        });
      } catch (e) {
        console.error('解析出生信息失败:', e);
      }
    }
  },

  /**
   * 输入事件处理
   */
  onSurnameInput(e) {
    this.setData({
      surname: e.detail.value
    });
    this.checkCanNaming();
  },

  onGenderChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      genderIndex: index,
      gender: this.data.genderOptions[index].value
    });
  },

  onBirthYearInput(e) {
    this.setData({
      birthYear: e.detail.value
    });
  },

  onBirthMonthInput(e) {
    this.setData({
      birthMonth: e.detail.value
    });
  },

  onBirthDayInput(e) {
    this.setData({
      birthDay: e.detail.value
    });
  },

  onHourChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      hourIndex: index,
      birthHour: this.data.hourOptions[index].value
    });
  },

  // 日历类型选择 - 与八字测算页面完全一致
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
    
    this.checkCanNaming()
  },

  // 日期选择 - 与八字测算页面完全一致
  onDateChange(e) {
    const birthDate = e.detail.value
    this.setData({
      birthDate: birthDate
    })
    
    // 如果是公历模式，更新对应的农历显示
    if (this.data.calendarType === 'solar') {
      this.updateSolarToLunar(birthDate)
    }
    
    this.checkCanNaming()
  },

  // 时间选择 - 与八字测算页面完全一致
  onTimeChange(e) {
    this.setData({
      birthTime: e.detail.value
    })
    this.checkCanNaming()
  },

  onNameLengthChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      nameLengthIndex: index,
      nameLength: this.data.nameLengthOptions[index].value
    });
  },

  // 农历年选择 - 与八字测算页面完全一致
  onLunarYearChange(e) {
    const index = e.detail.value
    const year = this.data.lunarYears[index]
    this.setData({
      lunarYearIndex: index,
      lunarYear: year
    })
    this.updateLunarToSolar()
  },

  // 农历月选择 - 与八字测算页面完全一致
  onLunarMonthChange(e) {
    const index = e.detail.value
    const month = this.data.lunarMonths[index]
    this.setData({
      lunarMonthIndex: index,
      lunarMonth: month
    })
    this.updateLunarToSolar()
  },

  // 农历日选择 - 与八字测算页面完全一致
  onLunarDayChange(e) {
    const index = e.detail.value
    const day = this.data.lunarDays[index]
    this.setData({
      lunarDayIndex: index,
      lunarDay: day
    })
    this.updateLunarToSolar()
  },

  // 农历转公历并更新显示 - 与八字测算页面完全一致
  updateLunarToSolar() {
    const { lunarYearIndex, lunarMonthIndex, lunarDayIndex } = this.data
    
    // 添加参数验证
    if (lunarYearIndex < 0 || lunarMonthIndex < 0 || lunarDayIndex < 0) {
      console.log('农历日期参数不完整，跳过转换')
      return
    }
    
    // 验证索引范围
    if (lunarYearIndex >= this.data.lunarYears.length || 
        lunarMonthIndex >= this.data.lunarMonths.length || 
        lunarDayIndex >= this.data.lunarDays.length) {
      console.error('农历日期索引超出范围:', { lunarYearIndex, lunarMonthIndex, lunarDayIndex })
      return
    }
    
    // 确保获取正确的数值
    const year = parseInt(this.data.lunarYears[lunarYearIndex])
    const month = parseInt(lunarMonthIndex) + 1  // 确保是数字类型
    const day = parseInt(lunarDayIndex) + 1      // 确保是数字类型
    
    // 参数范围验证
    if (isNaN(year) || year < 1900 || year > 2100) {
      console.error('农历年份无效:', year)
      return
    }
    if (isNaN(month) || month < 1 || month > 12) {
      console.error('农历月份无效:', month, '原始索引:', lunarMonthIndex)
      return
    }
    if (isNaN(day) || day < 1 || day > 30) {
      console.error('农历日期无效:', day, '原始索引:', lunarDayIndex)
      return
    }
    
    console.log('准备调用农历转公历API:', { year, month, day })
    
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
        console.log('农历转公历API响应:', result)
        if (result.success) {
          const solarDate = result.data.solar_date
          const solarDateStr = `${solarDate.year}-${solarDate.month.toString().padStart(2, '0')}-${solarDate.day.toString().padStart(2, '0')}`
          
          this.setData({
            birthDate: solarDateStr,
            correspondingSolarDate: solarDateStr
          })
          this.checkCanNaming()
        }
      },
      fail: (error) => {
        console.error('农历转公历API请求失败:', error)
        wx.showToast({
          title: '日期转换失败',
          icon: 'none'
        })
      }
    })
  },

  // 公历日期变化时更新对应农历显示 - 与八字测算页面完全一致
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

  // 检查是否可以起名 - 与八字测算页面的checkCanCalculate逻辑一致
  checkCanNaming() {
    const { surname, birthDate, birthTime, calendarType, lunarYearIndex, lunarMonthIndex, lunarDayIndex } = this.data
    
    // 检查姓氏
    if (!surname || surname.trim() === '') {
      this.setData({ canNaming: false })
      return
    }
    
    // 检查日期完整性
    let dateComplete = false
    if (calendarType === 'lunar') {
      // 农历模式：检查三个选择器都已选择
      dateComplete = lunarYearIndex >= 0 && lunarMonthIndex >= 0 && lunarDayIndex >= 0
    } else {
      // 公历模式：检查日期字符串
      dateComplete = birthDate && birthDate.length > 0
    }
    
    // 检查时间
    const timeComplete = birthTime && birthTime.length > 0
    
    this.setData({
      canNaming: dateComplete && timeComplete
    })
  },

  /**
   * 开始起名 - 使用与八字测算页面一致的数据结构
   */
  async startNaming() {
    if (!this.data.canNaming) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      })
      return
    }

    // 3. 点击开始起名时展示激励视频广告
    try {
      const adManager = AdManager.getInstance()
      const adResult = await adManager.showRewardVideoAd('naming')
      
      if (adResult.skipped) {
        console.log('激励视频广告已跳过，原因:', adResult.reason)
      } else if (adResult.success) {
        console.log('激励视频广告观看完成，给予额外奖励')
        // 可以给用户更多起名选择或优质名字
        wx.showToast({
          title: '获得高质量起名',
          icon: 'success'
        })
      } else {
        console.log('激励视频广告展示失败，继续执行:', adResult.error)
      }
    } catch (error) {
      console.warn('激励视频广告展示出错，继续执行:', error)
    }

    this.setData({
      analyzing: true
    })

    let birthData;
    
    // 验证出生时间
    if (!this.data.birthTime) {
      wx.showToast({
        title: '请选择出生时间',
        icon: 'none'
      })
      this.setData({ analyzing: false })
      return
    }
    
    // 解析时间
    const timeArr = this.data.birthTime.split(':')
    const hour = timeArr.length >= 2 ? parseInt(timeArr[0]) : 12
    
    if (this.data.calendarType === 'lunar') {
      // 农历模式：使用农历选择的数据
      if (this.data.lunarYearIndex < 0 || this.data.lunarMonthIndex < 0 || this.data.lunarDayIndex < 0) {
        wx.showToast({
          title: '请选择完整的农历日期',
          icon: 'none'
        })
        this.setData({ analyzing: false })
        return
      }
      
      const year = parseInt(this.data.lunarYears[this.data.lunarYearIndex])
      const month = parseInt(this.data.lunarMonthIndex) + 1
      const day = parseInt(this.data.lunarDayIndex) + 1
      
      birthData = {
        year: year,
        month: month,
        day: day,
        hour: hour,
        gender: this.data.gender,
        calendarType: 'lunar'
      }
    } else {
      // 公历模式：解析出生日期
      if (!this.data.birthDate) {
        wx.showToast({
          title: '请选择出生日期',
          icon: 'none'
        })
        this.setData({ analyzing: false })
        return
      }
      
      const dateArr = this.data.birthDate.split('-')
      if (dateArr.length !== 3) {
        wx.showToast({
          title: '日期格式错误',
          icon: 'none'
        })
        this.setData({ analyzing: false })
        return
      }
      
      birthData = {
        year: parseInt(dateArr[0]),
        month: parseInt(dateArr[1]),
        day: parseInt(dateArr[2]),
        hour: hour,
        gender: this.data.gender,
        calendarType: 'solar'
      }
    }

    wx.showLoading({
      title: '正在分析八字并起名...'
    })

    // 生成会话级随机种子，确保每次点击产生不同结果
    const sessionSeed = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 调用起名API
    app.request({
      url: '/api/v1/naming/generate-names',
      method: 'POST',
      data: {
        surname: this.data.surname.trim(),
        gender: this.data.gender,
        birth_year: birthData.year,
        birth_month: birthData.month,
        birth_day: birthData.day,
        birth_hour: birthData.hour,
        calendar_type: birthData.calendarType,
        name_length: this.data.nameLength,
        count: 10,
        session_seed: sessionSeed  // 新增会话种子参数
      },
      success: (result) => {
        wx.hideLoading()
        this.setData({
          analyzing: false
        })

        if (result.success) {
          this.setData({
            baziAnalysis: result.data.bazi_analysis,
            recommendations: result.data.recommendations,
            analysisSummary: result.data.analysis_summary,
            namingSuggestions: result.data.naming_suggestions,
            showResults: true
          })

          wx.showToast({
            title: '起名完成',
            icon: 'success'
          })
        } else {
          wx.showModal({
            title: '起名失败',
            content: result.error || '起名过程中出现错误',
            showCancel: false
          })
        }
      },
      fail: (error) => {
        wx.hideLoading()
        this.setData({
          analyzing: false
        })
        
        console.error('起名请求失败:', error)
        wx.showModal({
          title: '起名失败',
          content: '网络连接失败，请检查后端服务状态',
          showCancel: false
        })
      }
    })
  },

  /**
   * 查看名字详情
   */
  viewNameDetail(e) {
    const index = e.currentTarget.dataset.index;
    const name = this.data.recommendations[index];
    
    this.setData({
      selectedName: name,
      showNameDetail: true
    });
  },

  /**
   * 关闭名字详情
   */
  closeNameDetail() {
    this.setData({
      showNameDetail: false,
      selectedName: null
    });
  },

  /**
   * 收藏名字
   */
  collectName(e) {
    const index = e.currentTarget.dataset.index;
    const name = this.data.recommendations[index];
    
    // 获取已收藏的名字
    let collectedNames = wx.getStorageSync('collectedNames') || [];
    
    // 检查是否已收藏
    const isCollected = collectedNames.some(item => 
      item.full_name === name.full_name
    );
    
    if (isCollected) {
      wx.showToast({
        title: '已收藏过此名字',
        icon: 'none'
      });
      return;
    }
    
    // 构建出生信息
    let birthInfo = {
      surname: this.data.surname,
      gender: this.data.gender,
      calendarType: this.data.calendarType
    };
    
    // 添加具体的出生日期信息
    if (this.data.calendarType === 'lunar') {
      birthInfo.lunarYear = this.data.lunarYear;
      birthInfo.lunarMonth = this.data.lunarMonth;
      birthInfo.lunarDay = this.data.lunarDay;
      birthInfo.solarDate = this.data.birthDate;
    } else {
      birthInfo.birthDate = this.data.birthDate;
    }
    birthInfo.birthTime = this.data.birthTime;
    
    // 添加收藏
    collectedNames.push({
      ...name,
      collected_time: new Date().toISOString(),
      birth_info: birthInfo
    });
    
    // 保存到本地存储
    wx.setStorageSync('collectedNames', collectedNames);
    
    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    });
  },

  /**
   * 重新起名
   */
  restartNaming() {
    this.setData({
      showResults: false,
      recommendations: [],
      baziAnalysis: null,
      analysisSummary: '',
      namingSuggestions: ''
    });
  },

  /**
   * 显示分享选项
   */
  showShareOptions(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showShareModal: true,
      shareNameIndex: index
    });
  },

  /**
   * 关闭分享模态框
   */
  closeShareModal() {
    this.setData({
      showShareModal: false,
      shareNameIndex: null
    });
  },

  /**
   * 准备分享给微信好友
   */
  prepareShareToFriend() {
    if (this.data.shareNameIndex === null) return;
    
    const name = this.data.recommendations[this.data.shareNameIndex];
    
    // 设置分享内容
    this.shareData = {
      title: `我的起名结果：${name.full_name}`,
      path: `/pages/naming/naming?shared=true&name=${encodeURIComponent(name.full_name)}&score=${name.overall_score}`,
      imageUrl: '/images/share-naming.png'
    };
    
    // 关闭分享模态框
    this.closeShareModal();
    
    // 注意：不需要手动调用wx.shareAppMessage，button的open-type="share"会自动触发
  },

  /**
   * 分享到朋友圈（显示引导）
   */
  shareToTimeline() {
    if (this.data.shareNameIndex === null) return;
    
    const name = this.data.recommendations[this.data.shareNameIndex];
    
    // 设置分享内容，用于朋友圈分享时使用
    this.shareData = {
      title: `我通过智能起名得到了一个好名字：${name.full_name}，评分${name.overall_score}分！快来试试吧~`,
      query: `shared=true&name=${encodeURIComponent(name.full_name)}&score=${name.overall_score}`,
      imageUrl: '/images/share-naming.png'
    };
    
    // 关闭分享模态框
    this.closeShareModal();
    
    // 显示操作引导
    wx.showModal({
      title: '分享到朋友圈',
      content: '请点击右上角的"..."按钮，然后选择"分享到朋友圈"即可分享这个起名结果',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#C8860D',
      success: () => {
        // 启用分享菜单，确保用户可以看到分享选项
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时的处理
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时的处理
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时的处理
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 上拉加载更多
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return this.shareData || {
      title: '智能起名 - 基于八字五行的专业起名',
      path: '/pages/naming/naming',
      imageUrl: '/images/share-naming.png'
    };
  },

  /**
   * 用户点击右上角分享到朋友圈
   */
  onShareTimeline() {
    return this.shareData || {
      title: '智能起名 - 基于八字五行的专业起名',
      query: '',
      imageUrl: '/images/share-naming.png'
    };
  },

  /**
   * 原生广告事件处理
   */
  onNativeAdLoad(e) {
    console.log('起名页面原生广告加载成功:', e.detail)
  },

  onNativeAdClick(e) {
    console.log('起名页面原生广告被点击:', e.detail)
  },

  onNativeAdClose(e) {
    console.log('起名页面原生广告被关闭:', e.detail)
  },

  onNativeAdError(e) {
    console.log('起名页面原生广告加载失败:', e.detail)
  }
});
