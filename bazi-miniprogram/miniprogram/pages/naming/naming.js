// pages/naming/naming.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户输入数据
    surname: '',
    gender: 'male',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: 12,
    calendarType: 'solar',
    nameLength: 2,
    
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
    
    // 历法类型选项
    calendarOptions: [
      { value: 'solar', text: '公历' },
      { value: 'lunar', text: '农历' }
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
    
    // 当前年份（用于选择器）
    currentYear: new Date().getFullYear(),
    
    // 出生时辰选项
    hourOptions: [
      { value: 0, text: '子时 (23:00-01:00)' },
      { value: 2, text: '丑时 (01:00-03:00)' },
      { value: 4, text: '寅时 (03:00-05:00)' },
      { value: 6, text: '卯时 (05:00-07:00)' },
      { value: 8, text: '辰时 (07:00-09:00)' },
      { value: 10, text: '巳时 (09:00-11:00)' },
      { value: 12, text: '午时 (11:00-13:00)' },
      { value: 14, text: '未时 (13:00-15:00)' },
      { value: 16, text: '申时 (15:00-17:00)' },
      { value: 18, text: '酉时 (17:00-19:00)' },
      { value: 20, text: '戌时 (19:00-21:00)' },
      { value: 22, text: '亥时 (21:00-23:00)' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '智能起名'
    });
  },

  /**
   * 输入事件处理
   */
  onSurnameInput(e) {
    this.setData({
      surname: e.detail.value
    });
  },

  onGenderChange(e) {
    this.setData({
      gender: this.data.genderOptions[e.detail.value].value
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
    this.setData({
      birthHour: this.data.hourOptions[e.detail.value].value
    });
  },

  onCalendarTypeChange(e) {
    this.setData({
      calendarType: this.data.calendarOptions[e.detail.value].value
    });
  },

  onNameLengthChange(e) {
    this.setData({
      nameLength: this.data.nameLengthOptions[e.detail.value].value
    });
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { surname, birthYear, birthMonth, birthDay } = this.data;
    
    if (!surname || surname.trim() === '') {
      wx.showToast({
        title: '请输入姓氏',
        icon: 'none'
      });
      return false;
    }
    
    if (surname.length > 3) {
      wx.showToast({
        title: '姓氏不能超过3个字',
        icon: 'none'
      });
      return false;
    }
    
    if (!birthYear || !birthMonth || !birthDay) {
      wx.showToast({
        title: '请完善出生日期',
        icon: 'none'
      });
      return false;
    }
    
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    
    if (year < 1900 || year > this.data.currentYear) {
      wx.showToast({
        title: `年份应在1900-${this.data.currentYear}之间`,
        icon: 'none'
      });
      return false;
    }
    
    if (month < 1 || month > 12) {
      wx.showToast({
        title: '月份应在1-12之间',
        icon: 'none'
      });
      return false;
    }
    
    if (day < 1 || day > 31) {
      wx.showToast({
        title: '日期应在1-31之间',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  /**
   * 开始起名
   */
  async startNaming() {
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      analyzing: true,
      generating: true,
      showResults: false
    });
    
    wx.showLoading({
      title: '正在分析八字...'
    });
    
    try {
      // 调用起名接口
      const response = await this.generateNames();
      
      if (response.success) {
        this.setData({
          baziAnalysis: response.data.bazi_analysis,
          recommendations: response.data.recommendations,
          analysisSummary: response.data.analysis_summary,
          namingSuggestions: response.data.naming_suggestions,
          showResults: true
        });
        
        wx.showToast({
          title: '起名完成',
          icon: 'success'
        });
      } else {
        throw new Error(response.error || '起名失败');
      }
    } catch (error) {
      console.error('起名错误:', error);
      wx.showToast({
        title: error.message || '起名失败，请重试',
        icon: 'none',
        duration: 3000
      });
    } finally {
      wx.hideLoading();
      this.setData({
        analyzing: false,
        generating: false
      });
    }
  },

  /**
   * 调用起名API
   */
  generateNames() {
    const app = getApp();
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.apiBaseUrl + '/api/v1/naming/generate-names',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          surname: this.data.surname.trim(),
          gender: this.data.gender,
          year: parseInt(this.data.birthYear),
          month: parseInt(this.data.birthMonth),
          day: parseInt(this.data.birthDay),
          hour: this.data.birthHour,
          calendar_type: this.data.calendarType,
          name_length: this.data.nameLength,
          count: 10
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.error || '网络请求失败'));
          }
        },
        fail: (err) => {
          reject(new Error('网络连接失败'));
        }
      });
    });
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
    
    // 添加收藏
    collectedNames.push({
      ...name,
      collected_time: new Date().toISOString(),
      birth_info: {
        surname: this.data.surname,
        gender: this.data.gender,
        birthYear: this.data.birthYear,
        birthMonth: this.data.birthMonth,
        birthDay: this.data.birthDay
      }
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
   * 分享名字
   */
  shareName(e) {
    const index = e.currentTarget.dataset.index;
    const name = this.data.recommendations[index];
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 设置分享内容
    this.shareData = {
      title: `我的起名结果：${name.full_name}`,
      path: `/pages/naming/naming?shared=true&name=${encodeURIComponent(name.full_name)}`,
      imageUrl: '/images/share-naming.png'
    };
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
  }
});
