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
    personalFortunes: [],
    fortuneLoading: false
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
      
      // 准备批量运势计算数据 - 修复数据结构问题
      const membersData = allMembers.map(member => {
        // 尝试从多个位置获取出生信息
        const birthInfo = member.birthInfo || {};
        
        // 如果birthInfo中没有年月日，尝试从member本身获取
        const year = birthInfo.year || member.year;
        const month = birthInfo.month || member.month;
        const day = birthInfo.day || member.day;
        const hour = birthInfo.hour || member.hour || 12;
        const gender = birthInfo.gender || member.gender || 'male';
        const calendarType = birthInfo.calendarType || member.calendarType || 'solar';
        
        console.log(`🔍 首页成员 ${member.name} 数据构建:`, {
          id: member.id,
          name: member.name,
          year, month, day, hour, gender, calendarType,
          hasBirthInfo: !!member.birthInfo,
          birthInfoKeys: member.birthInfo ? Object.keys(member.birthInfo) : [],
          memberKeys: Object.keys(member)
        });
        
        return {
          id: member.id,
          name: member.name,
          year: year,
          month: month,
          day: day,
          hour: hour,
          gender: gender,
          calendarType: calendarType
        };
      })
      
      console.log('🧮 准备批量计算运势:', membersData.length, '个成员')
      
      // 使用增强运势计算器进行批量计算
      const batchResult = await this.fortuneCalculator.calculateBatchFortune(membersData)
      
      if (batchResult.success) {
        console.log('✅ 批量运势计算成功，数据来源:', batchResult.source)
        
        const familyData = batchResult.data
        const membersWithFortune = familyData.members || []
        const familyOverview = familyData.family_overview || {}
        
        // 增强显示数据 - 修复数据结构不匹配问题
        const enhancedMembers = membersWithFortune.map(memberFortune => {
          const memberInfo = allMembers.find(m => m.id === memberFortune.member_id)
          
          // 修复：从memberFortune中正确提取daily_fortune数据
          let daily_fortune_data = null;
          if (memberFortune.daily_fortune) {
            // 如果有daily_fortune字段，直接使用
            daily_fortune_data = memberFortune.daily_fortune;
          } else if (memberFortune.fortune) {
            // 如果是fortune字段，映射为daily_fortune
            daily_fortune_data = memberFortune.fortune;
          } else {
            // 创建默认的运势数据结构
            daily_fortune_data = {
              date: new Date().toISOString().split('T')[0],
              overall_score: 0,
              detailed_scores: {
                wealth: 0,
                career: 0,
                health: 0,
                love: 0,
                study: 0
              },
              lucky_elements: {
                lucky_color: "绿色",
                lucky_colors: ["绿色"],
                lucky_number: 8,
                lucky_numbers: [8],
                lucky_direction: "东方",
                beneficial_wuxing: "木"
              },
              suggestions: ["数据获取失败"],
              warnings: [],
              detailed_analysis: "运势数据不可用"
            };
          }
          
          return {
            ...memberInfo,
            // 修复：正确设置daily_fortune字段
            daily_fortune: daily_fortune_data,
            hasValidFortune: memberFortune.has_valid_fortune,
            fortuneSource: batchResult.source,
            // 调试信息
            _debug: {
              originalStructure: Object.keys(memberFortune),
              hasDailyFortune: !!memberFortune.daily_fortune,
              hasFortune: !!memberFortune.fortune,
              memberFortuneId: memberFortune.member_id
            }
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
          fortuneLoading: false
        })
        
        // 静默处理，不显示错误提示
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
          fortuneLoading: false
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
          fortuneLoading: false
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
          fortuneLoading: false
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
          fortuneLoading: false
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

  // 查看成员详情 - 修复数据结构问题和今日运势一致性
  async viewMemberDetail(memberData) {
    try {
      console.log('🔍 查看成员详情，原始数据:', memberData)
      
      // 验证数据完整性
      if (!memberData) {
        console.error('❌ 成员数据为空')
        wx.showToast({
          title: '数据不完整，无法查看详情',
          icon: 'error'
        })
        return
      }

      // 显示加载状态
      wx.showLoading({
        title: '加载详情中...'
      })

      // 从多个可能的数据源提取信息
      let bazi = null;
      let wuxing = null;
      let analysis = null;

      // 尝试从 baziData 中获取八字信息
      if (memberData.baziData) {
        bazi = memberData.baziData.bazi || memberData.baziData.bazi_result;
        wuxing = memberData.baziData.wuxing || memberData.baziData.wuxing_analysis;
        analysis = memberData.baziData.analysis || memberData.baziData.comprehensive_analysis;
      }

      // 如果没有八字数据，尝试重新计算
      if (!bazi) {
        wx.hideLoading()
        console.log('🔄 没有八字数据，尝试重新计算...')
        this.recalculateMemberBazi(memberData);
        return;
      }

      // 提取出生信息
      const birthInfo = memberData.birthInfo || {};
      const year = birthInfo.year || memberData.year;
      const month = birthInfo.month || memberData.month;
      const day = birthInfo.day || memberData.day;
      const hour = birthInfo.hour || memberData.hour || 12;
      const gender = birthInfo.gender || memberData.gender || 'male';
      const calendarType = birthInfo.calendarType || memberData.calendarType || 'solar';

      // 获取完整的八字分析结果（确保与"开始测算"使用完全相同的接口和算法）
      let freshBaziResult = null;
      try {
        console.log('🔮 为家庭成员重新计算完整八字分析（包含今日运势）...')
        
        // 构建与"开始测算"完全相同的请求数据
        const requestData = {
          year: year,
          month: month,
          day: day,
          hour: hour,
          gender: gender,
          name: memberData.name || '家庭成员',
          calendarType: calendarType
        };

        // 调用与"开始测算"完全相同的后端API
        const app = getApp();
        const baziResult = await new Promise((resolve, reject) => {
          app.request({
            url: '/api/v1/calculate-bazi',
            method: 'POST',
            data: requestData,
            success: (result) => {
              if (result.success) {
                resolve(result.data);
              } else {
                console.warn('八字重新计算返回失败，使用原有数据:', result.error);
                resolve(null);
              }
            },
            fail: (error) => {
              console.warn('八字重新计算网络请求失败，使用原有数据:', error);
              resolve(null);
            }
          });
        });

        freshBaziResult = baziResult;
        console.log('✅ 家庭成员完整八字分析获取成功:', !!freshBaziResult);
        
        // 如果获取到新的数据，使用新数据；否则使用原有数据
        if (freshBaziResult) {
          bazi = freshBaziResult.bazi || bazi;
          wuxing = freshBaziResult.wuxing || wuxing;
          analysis = freshBaziResult.analysis || analysis;
          
          // 更新本地存储的成员数据（可选）
          try {
            const updatedMemberData = {
              ...memberData,
              baziData: {
                ...memberData.baziData,
                bazi: freshBaziResult.bazi,
                wuxing: freshBaziResult.wuxing,
                analysis: freshBaziResult.analysis,
                lastUpdate: Date.now()
              }
            };
            FamilyBaziManager.updateMemberData(memberData.id, updatedMemberData);
            console.log('✅ 本地成员数据已更新');
          } catch (updateError) {
            console.warn('本地数据更新失败:', updateError);
          }
        }
        
      } catch (baziError) {
        console.warn('❌ 重新计算八字失败，使用原有数据继续显示详情:', baziError);
        freshBaziResult = null;
      }

      // 构造与result.js期望格式一致的数据结构
      const resultData = {
        // 核心八字数据
        bazi: bazi,
        wuxing: wuxing,
        analysis: analysis,

        // 基础出生信息（多种格式确保兼容性）
        year: year,
        month: month,
        day: day,
        hour: hour,
        gender: gender,
        calendar_type: calendarType,
        calendarType: calendarType,

        // 出生信息对象
        birth_info: {
          year: year,
          month: month,
          day: day,
          hour: hour,
          gender: gender,
          calendar_type: calendarType
        },

        // 兼容历史格式
        birthInfo: {
          date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          time: `${hour.toString().padStart(2, '0')}:00`,
          gender: gender,
          name: memberData.name || '家庭成员',
          calendarType: calendarType
        },

        // 用户信息
        user_info: {
          birth_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          gender: gender,
          hour: hour
        },

        // 农历信息（如果有的话）
        lunar_info: memberData.baziData?.lunar_info || {
          year: year,
          month: month,
          day: day,
          leap: false
        },

        // 公历信息
        solar_info: {
          year: year,
          month: month,
          day: day
        },

        // 八字结果（确保result.js能正确读取）
        bazi_result: bazi,
        wuxing_analysis: wuxing,
        comprehensive_analysis: analysis,

        // 今日运势（与"开始测算"保持一致） - 使用新计算的数据
        daily_fortune: freshBaziResult?.daily_fortune || null,

        // 其他信息
        timestamp: memberData.timestamp || Date.now(),
        id: memberData.id,
        from: 'family_member',
        display_name: memberData.name || '家庭成员'
      };

      wx.hideLoading()

      console.log('✅ 构造的结果数据结构:', {
        hasBazi: !!resultData.bazi,
        hasWuxing: !!resultData.wuxing,
        hasAnalysis: !!resultData.analysis,
        hasDailyFortune: !!resultData.daily_fortune,
        hasBasicFields: !!(resultData.year && resultData.month && resultData.day !== undefined),
        birthInfo: resultData.birthInfo,
        userInfo: resultData.user_info
      })

      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`
      })
    } catch (error) {
      wx.hideLoading()
      console.error('❌ 查看详情失败:', error)
      wx.showModal({
        title: '查看详情失败',
        content: `错误信息：${error.message || '未知错误'}`,
        showCancel: false
      })
    }
  },

  // 重新计算成员八字
  async recalculateMemberBazi(memberData) {
    try {
      wx.showLoading({
        title: '重新计算八字中...'
      })

      // 构建请求数据
      const birthInfo = memberData.birthInfo || {};
      const requestData = {
        year: birthInfo.year || memberData.year,
        month: birthInfo.month || memberData.month,
        day: birthInfo.day || memberData.day,
        hour: birthInfo.hour || memberData.hour || 12,
        gender: birthInfo.gender || memberData.gender || 'male',
        name: memberData.name || '家庭成员',
        calendarType: birthInfo.calendarType || memberData.calendarType || 'solar'
      };

      console.log('🔄 重新计算八字，请求数据:', requestData)

      const app = getApp();
      app.request({
        url: '/api/v1/calculate-bazi',
        method: 'POST',
        data: requestData,
        success: (result) => {
          wx.hideLoading()

          if (result.success) {
            console.log('✅ 重新计算成功')
            
            // 更新家庭成员数据
            const updatedMemberData = {
              ...memberData,
              baziData: {
                ...memberData.baziData,
                bazi: result.data.bazi,
                wuxing: result.data.wuxing,
                analysis: result.data.analysis,
                bazi_result: result.data.bazi,
                wuxing_analysis: result.data.wuxing,
                comprehensive_analysis: result.data.analysis
              }
            };

            // 保存更新后的数据
            FamilyBaziManager.updateMemberData(memberData.id, updatedMemberData);

            // 重新调用查看详情
            this.viewMemberDetail(updatedMemberData);
          } else {
            wx.showModal({
              title: '重新计算失败',
              content: result.error || '计算过程中出现错误',
              showCancel: false
            })
          }
        },
        fail: (error) => {
          wx.hideLoading()
          console.error('❌ 重新计算失败:', error)
          wx.showModal({
            title: '重新计算失败',
            content: '网络连接失败，请检查后端服务状态',
            showCancel: false
          })
        }
      })
    } catch (error) {
      wx.hideLoading()
      console.error('❌ 重新计算过程出错:', error)
      wx.showToast({
        title: '计算失败',
        icon: 'error'
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

  // 计算运势进度条显示
  getFortuneProgressBar(score) {
    const percentage = Math.round(score * 20); // 0-5分转换为0-100%
    const filledCount = Math.round(percentage / 10); // 每10%一个█
    const emptyCount = 10 - filledCount;
    return '█'.repeat(filledCount) + '░'.repeat(emptyCount) + ` ${percentage}%`;
  },

  // ASCII按钮事件处理函数
  handleViewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const memberData = this.data.membersWithFortune[index];
    
    if (memberData) {
      this.viewMemberDetail(memberData);
    } else {
      wx.showToast({
        title: '数据获取失败',
        icon: 'error'
      });
    }
  },

  handleEditNote(e) {
    const memberId = e.currentTarget.dataset.memberId;
    const memberName = e.currentTarget.dataset.memberName;
    
    if (memberId && memberName) {
      this.editMemberNote(memberId, memberName);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
    }
  },

  handleDeleteMember(e) {
    const memberId = e.currentTarget.dataset.memberId;
    const memberName = e.currentTarget.dataset.memberName;
    
    if (memberId && memberName) {
      this.deleteMember(memberId, memberName);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
    }
  },

  onShareAppMessage() {
    return {
      title: '八字运势测算 - 探索您的命运密码',
      path: '/pages/index/index'
    }
  }
})
