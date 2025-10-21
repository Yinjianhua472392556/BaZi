// index.js
const app = getApp()
const AdManager = require('../../utils/ad-manager')
const BaziDisplayManager = require('../../utils/bazi-display-manager')
const FamilyBaziManager = require('../../utils/family-bazi-manager')
const BaziDataAdapter = require('../../utils/bazi-data-adapter')
const EnhancedFortuneCalculator = require('../../utils/enhanced-fortune-calculator')

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
    correspondingSolarDate: '',
    
    // 每日运势相关
    showDailyFortune: true,
    todayDate: '',
    universalFortune: null,
    personalFortunes: []
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
    
    // 初始化每日运势
    this.initDailyFortune()
  },

  // 初始化每日运势
  initDailyFortune() {
    const today = new Date()
    const todayStr = `${today.getMonth() + 1}月${today.getDate()}日`
    
    this.setData({
      todayDate: todayStr
    })
    
    // 加载运势数据
    this.loadDailyFortune()
  },

  // 加载每日运势 - 使用增强运势计算器
  async loadDailyFortune() {
    console.log('🔄 开始加载增强运势系统...')
    
    try {
      // 初始化增强运势计算器
      if (!this.fortuneCalculator) {
        this.fortuneCalculator = new EnhancedFortuneCalculator()
      }
      
      // 获取所有家庭成员
      const allMembers = FamilyBaziManager.getAllMembers()
      console.log('👨‍👩‍👧‍👦 家庭成员总数:', allMembers.length)
      
      if (allMembers.length === 0) {
        // 没有家庭成员，显示通用运势和提示
        const universalFortune = BaziDisplayManager.getUniversalDailyFortune()
        
        this.setData({
          showDailyFortune: true,
          familyOverview: {
            totalMembers: 0,
            averageScore: 0,
            suggestions: ['测算八字后获得专属运势', '添加家庭成员获得家庭运势分析'],
            familyLuckyColor: '绿色',
            activeMembers: 0
          },
          membersWithFortune: [],
          universalFortune: universalFortune,
          personalFortunes: [],
          fortuneLoading: false
        })
        return
      }
      
      // 设置加载状态
      this.setData({ fortuneLoading: true })
      
      // 准备批量运势计算数据
      const membersData = allMembers.map(member => ({
        id: member.id,
        name: member.name,
        bazi_data: BaziDataAdapter.extractFortuneCalculatorData(member.baziData)
      }))
      
      console.log('🧮 准备批量计算运势:', membersData.length, '个成员')
      
      // 使用增强运势计算器进行批量计算
      const batchResult = await this.fortuneCalculator.calculateBatchFortune(membersData)
      
      if (batchResult.success) {
        console.log('✅ 批量运势计算成功，数据来源:', batchResult.source)
        
        const familyData = batchResult.data
        const membersWithFortune = familyData.members_fortune || []
        const familyOverview = familyData.family_overview || {}
        
        // 增强显示数据
        const enhancedMembers = membersWithFortune.map(memberFortune => {
          const memberInfo = allMembers.find(m => m.id === memberFortune.member_id)
          return {
            ...memberInfo,
            daily_fortune: memberFortune.fortune,
            hasValidFortune: memberFortune.has_valid_fortune,
            fortuneSource: batchResult.source
          }
        })
        
        // 获取通用运势作为补充
        const universalFortune = BaziDisplayManager.getUniversalDailyFortune()
        
        this.setData({
          showDailyFortune: true,
          familyOverview: {
            ...familyOverview,
            lastUpdated: batchResult.timestamp,
            dataSource: batchResult.source
          },
          membersWithFortune: enhancedMembers,
          universalFortune: universalFortune,
          personalFortunes: enhancedMembers, // 保持兼容性
          fortuneLoading: false,
          lastFortuneUpdate: this.formatUpdateTime()
        })
        
        console.log('✅ 增强运势系统加载完成:', {
          totalMembers: familyOverview.total_members,
          averageScore: familyOverview.average_score,
          activeMembers: familyOverview.active_members,
          dataSource: batchResult.source
        })
        
      } else {
        // API失败，显示错误状态
        console.log('⚠️ 运势API服务不可用:', batchResult.error)
        
        const universalFortune = BaziDisplayManager.getUniversalDailyFortune()
        
        this.setData({
          showDailyFortune: true,
          familyOverview: {
            totalMembers: allMembers.length,
            averageScore: 0,
            suggestions: ['运势服务暂时不可用，请稍后重试', '或检查网络连接状态'],
            familyLuckyColor: '绿色',
            activeMembers: 0,
            serviceError: true
          },
          membersWithFortune: [],
          universalFortune: universalFortune,
          personalFortunes: [],
          fortuneLoading: false,
          fortuneError: batchResult.error || '运势服务暂时不可用'
        })
        
        // 显示错误提示
        wx.showToast({
          title: '运势服务暂时不可用',
          icon: 'none',
          duration: 3000
        })
      }
      
    } catch (error) {
      console.error('❌ 增强运势系统加载失败:', error)
      
      // 降级到原有的家庭管理器
      console.log('🔄 降级到原有运势系统...')
      try {
        const familyOverview = FamilyBaziManager.getFamilyFortuneOverview()
        const membersWithFortune = FamilyBaziManager.getAllMembersFortuneToday()
        const universalFortune = BaziDisplayManager.getUniversalDailyFortune()
        
        this.setData({
          showDailyFortune: true,
          familyOverview: familyOverview,
          membersWithFortune: membersWithFortune,
          universalFortune: universalFortune,
          personalFortunes: membersWithFortune,
          fortuneLoading: false,
          fortuneError: error.message
        })
        
        console.log('✅ 降级运势系统加载完成')
        
      } catch (fallbackError) {
        console.error('❌ 降级运势系统也失败:', fallbackError)
        
        // 最终降级：显示基础数据
        this.setData({
          showDailyFortune: true,
          familyOverview: {
            totalMembers: 0,
            averageScore: 0,
            suggestions: ['运势系统暂时不可用，请稍后重试'],
            familyLuckyColor: '绿色',
            activeMembers: 0
          },
          membersWithFortune: [],
          universalFortune: {
            overall_score: 3,
            lucky_color: '蓝色',
            lucky_numbers: [8]
          },
          personalFortunes: [],
          fortuneLoading: false,
          fortuneError: '运势计算服务暂时不可用'
        })
      }
    }
  },

  // 刷新运势 - 使用增强运势计算器
  async refreshFortune() {
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showToast({
            title: '网络连接不可用',
            icon: 'none',
            duration: 3000
          })
          return
        }
        this.performFortuneRefresh()
      },
      fail: () => {
        // 网络检查失败，仍然尝试刷新
        this.performFortuneRefresh()
      }
    })
  },

  // 执行运势刷新
  async performFortuneRefresh() {
    wx.showLoading({
      title: '刷新运势中...'
    })
    
    try {
      // 清除所有运势缓存
      if (this.fortuneCalculator) {
        this.fortuneCalculator.clearAllCache()
      }
      wx.removeStorageSync('dailyFortuneCache')
      wx.removeStorageSync('universalFortuneCache')
      
      console.log('🧹 运势缓存已清除')
      
      // 重新加载运势
      await this.loadDailyFortune()
      
      wx.hideLoading()
      wx.showToast({
        title: '运势已刷新',
        icon: 'success'
      })
      
      console.log('✅ 运势刷新完成')
      
    } catch (error) {
      console.error('❌ 运势刷新失败:', error)
      wx.hideLoading()
      
      // 区分错误类型，提供不同的处理方式
      if (error.message && error.message.includes('ERR_CONNECTION_REFUSED')) {
        // 连接被拒绝，可能是后端服务未启动
        wx.showModal({
          title: '服务连接失败',
          content: '后端服务暂时不可用，是否使用离线模式？',
          confirmText: '离线模式',
          cancelText: '稍后重试',
          success: (res) => {
            if (res.confirm) {
              this.loadOfflineFortune()
            }
          }
        })
      } else if (error.message && (error.message.includes('timeout') || error.message.includes('网络'))) {
        // 网络超时或网络问题
        wx.showModal({
          title: '网络超时',
          content: '网络连接超时，请检查网络后重试',
          showCancel: false,
          confirmText: '确定'
        })
      } else {
        // 其他未知错误
        wx.showToast({
          title: '刷新失败，请稍后重试',
          icon: 'none',
          duration: 3000
        })
      }
    }
  },

  // 加载离线运势（降级方案）
  loadOfflineFortune() {
    try {
      const allMembers = FamilyBaziManager.getAllMembers()
      
      if (allMembers.length === 0) {
        // 没有成员，显示通用运势
        const universalFortune = BaziDisplayManager.getUniversalDailyFortune()
        
        this.setData({
          showDailyFortune: true,
          familyOverview: {
            totalMembers: 0,
            averageScore: 0,
            suggestions: ['离线模式：使用本地运势数据', '连接网络后可获取最新运势'],
            familyLuckyColor: '绿色',
            activeMembers: 0,
            isOfflineMode: true
          },
          membersWithFortune: [],
          universalFortune: universalFortune,
          fortuneLoading: false,
          fortuneError: null
        })
      } else {
        // 使用本地家庭管理器的离线运势
        const familyOverview = FamilyBaziManager.getFamilyFortuneOverview()
        const membersWithFortune = FamilyBaziManager.getAllMembersFortuneToday()
        
        this.setData({
          showDailyFortune: true,
          familyOverview: {
            ...familyOverview,
            suggestions: [...(familyOverview.suggestions || []), '离线模式：使用本地运势数据'],
            isOfflineMode: true
          },
          membersWithFortune: membersWithFortune,
          universalFortune: BaziDisplayManager.getUniversalDailyFortune(),
          fortuneLoading: false,
          fortuneError: null
        })
      }
      
      wx.showToast({
        title: '已切换到离线模式',
        icon: 'success'
      })
      
      console.log('✅ 离线运势加载完成')
      
    } catch (error) {
      console.error('❌ 离线运势加载失败:', error)
      wx.showToast({
        title: '离线模式加载失败',
        icon: 'error'
      })
    }
  },

  // 显示成员操作菜单
  showMemberActions(e) {
    const memberData = e.currentTarget.dataset.memberData
    const memberId = e.currentTarget.dataset.memberId
    const memberName = e.currentTarget.dataset.memberName
    
    if (!memberData || !memberId) {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      return
    }
    
    // 构建操作菜单
    const actions = ['查看详情', '编辑备注']
    
    // 如果不是主要八字，可以删除
    const primaryBazi = wx.getStorageSync('primaryBazi') || null
    if (memberId !== primaryBazi) {
      actions.push('删除成员')
    }
    
    wx.showActionSheet({
      itemList: actions,
      success: (res) => {
        switch (actions[res.tapIndex]) {
          case '查看详情':
            this.viewMemberDetail(memberData)
            break
          case '编辑备注':
            this.editMemberNote(memberId, memberName)
            break
          case '删除成员':
            this.deleteMember(memberId, memberName)
            break
        }
      }
    })
  },

  // 查看成员详情
  viewMemberDetail(memberData) {
    try {
      console.log('🔍 查看成员详情，原始数据:', memberData)
      
      // 验证数据完整性
      if (!memberData || !memberData.baziData) {
        console.error('❌ 成员数据不完整:', memberData)
        wx.showToast({
          title: '数据不完整，无法查看详情',
          icon: 'error'
        })
        return
      }

      // 构造与历史记录页面一致的结果数据格式
      const resultData = {
        // 基础八字数据
        bazi_result: memberData.baziData.bazi_result || {},
        wuxing_analysis: memberData.baziData.wuxing_analysis || {},
        comprehensive_analysis: memberData.baziData.comprehensive_analysis || {},
        
        // 确保有完整的出生信息
        birth_info: memberData.baziData.birth_info || {},
        birthInfo: memberData.birthInfo || {},
        
        // 运势分析数据
        fortune_analysis: memberData.baziData.fortune_analysis || {},
        name_suggestions: memberData.baziData.name_suggestions || {},
        
        // 用户信息（保持与历史记录一致）
        user_info: memberData.userInfo || {},
        
        // 时间戳和ID
        timestamp: memberData.timestamp || Date.now(),
        id: memberData.id,
        
        // 标识来源
        from: 'index_management',
        
        // 显示信息
        display_name: memberData.name || '匿名用户',
        
        // 确保有必要的基础字段
        year: memberData.baziData.year || memberData.birthInfo?.year,
        month: memberData.baziData.month || memberData.birthInfo?.month,
        day: memberData.baziData.day || memberData.birthInfo?.day,
        hour: memberData.baziData.hour || memberData.birthInfo?.hour,
        gender: memberData.baziData.gender || memberData.birthInfo?.gender
      }

      // 数据完整性验证
      const hasRequiredData = resultData.bazi_result && 
                             (resultData.birth_info || resultData.birthInfo) &&
                             (resultData.year && resultData.month && resultData.day !== undefined)

      if (!hasRequiredData) {
        console.error('❌ 构造的数据缺少必要字段:', {
          hasBaziResult: !!resultData.bazi_result,
          hasBirthInfo: !!(resultData.birth_info || resultData.birthInfo),
          hasBasicFields: !!(resultData.year && resultData.month && resultData.day !== undefined),
          resultData: resultData
        })
        
        wx.showModal({
          title: '数据错误',
          content: '八字数据不完整，无法查看详情。请重新测算。',
          showCancel: false
        })
        return
      }

      console.log('✅ 构造完整的结果数据:', {
        hasBaziResult: !!resultData.bazi_result,
        hasBirthInfo: !!(resultData.birth_info || resultData.birthInfo),
        hasBasicFields: !!(resultData.year && resultData.month && resultData.day !== undefined),
        dataStructure: Object.keys(resultData)
      })

      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`
      })
    } catch (error) {
      console.error('❌ 查看详情失败:', error)
      wx.showModal({
        title: '查看详情失败',
        content: `错误信息：${error.message || '未知错误'}`,
        showCancel: false
      })
    }
  },

  // 编辑成员备注
  editMemberNote(memberId, currentName) {
    wx.showModal({
      title: '编辑成员备注',
      editable: true,
      placeholderText: '请输入备注名称（如：爸爸、妈妈等）',
      content: currentName || '',
      success: (res) => {
        if (res.confirm) {
          const newName = (res.content || '').trim()
          if (newName) {
            this.updateMemberName(memberId, newName)
          } else {
            wx.showToast({
              title: '备注不能为空',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 更新成员名称
  updateMemberName(memberId, newName) {
    try {
      const success = FamilyBaziManager.updateMemberName(memberId, newName)
      
      if (success) {
        wx.showToast({
          title: '备注已更新',
          icon: 'success'
        })
        
        // 刷新运势数据
        setTimeout(() => {
          this.loadDailyFortune()
        }, 500)
      } else {
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('更新成员名称失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      })
    }
  },

  // 删除成员（增强版：同步删除对应的历史记录）
  deleteMember(memberId, memberName) {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除成员"${memberName}"吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          try {
            
            // 删除家庭成员
            const success = FamilyBaziManager.deleteMember(memberId)
            
            if (success) {
              console.log('✅ 家庭成员删除成功，同步操作完成')
              
              wx.showToast({
                title: '成员已删除',
                icon: 'success'
              })
              
              // 刷新运势数据
              setTimeout(() => {
                this.loadDailyFortune()
              }, 500)
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'error'
              })
            }
          } catch (error) {
            console.error('❌ 删除成员失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 页面显示时刷新运势（如果是新的一天）
  onShow() {
    console.log('首页onShow被调用')
    
    // 总是重新加载运势，确保数据同步
    this.loadDailyFortune()
    
    // 记录更新时间
    const today = new Date().toDateString()
    wx.setStorageSync('lastFortuneUpdateDate', today)
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
        name: '测算用户', // 后端API要求非null字符串
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
        name: '测算用户', // 后端API要求非null字符串
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
          // 构造完整的数据结构，确保包含BaziDisplayManager需要的所有字段
          const resultData = {
            ...result.data,  // 包含所有后端返回的数据
            bazi_result: result.data.bazi_result,
            birth_info: result.data.birth_info,
            fortune_analysis: result.data.fortune_analysis,
            name_suggestions: result.data.name_suggestions,
            
            // 确保有birthInfo字段（BaziDisplayManager需要）
            birthInfo: {
              date: this.data.birthDate,
              time: this.data.birthTime,
              gender: this.data.gender,
              name: '匿名用户',
              calendarType: this.data.calendarType
            },
            
            // 确保有基础字段（用于指纹生成）
            year: birthData.year,
            month: birthData.month,
            day: birthData.day,
            hour: birthData.hour,
            gender: birthData.gender,
            calendarType: birthData.calendarType
          }
          
          console.log('🔍 准备保存的完整数据结构:', {
            hasBaziResult: !!resultData.bazi_result,
            hasBirthInfo: !!resultData.birthInfo,
            hasBasicFields: !!(resultData.year && resultData.month && resultData.day),
            structure: Object.keys(resultData)
          })
          
          try {
            // 使用新的家庭管理器保存成员数据，不传递customName让系统自动生成智能备注名
            const memberData = FamilyBaziManager.saveFamilyMember(birthData, result, null)
            console.log('👨‍👩‍👧‍👦 家庭成员保存成功:', memberData.name)
            
            // 保存到临时缓存（供结果页使用）
            app.saveBaziResult(resultData)
            
            
          } catch (saveError) {
            console.error('❌ 保存数据失败:', saveError)
            // 即使保存失败，也继续显示结果
          }
          
          // 立即刷新首页运势数据
          setTimeout(() => {
            console.log('🔍 开始刷新首页运势数据...')
            this.loadDailyFortune()
          }, 500)  // 延迟500ms确保数据已保存

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

  // 格式化更新时间
  formatUpdateTime() {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  },

  onShareAppMessage() {
    return {
      title: '八字运势测算 - 探索您的命运密码',
      path: '/pages/index/index'
    }
  }
})
