// result.js
const AdManager = require('../../utils/ad-manager')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    resultData: null,
    showAnalysisModal: false,
    showAdPlaceholder: false,
    lunarDate: '',
    baziString: '',
    wuxingString: '',
    wuxingLack: '',
    shengxiao: '',
    bookRecommendationContext: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('result页面加载，参数:', options);
    
    let resultData = null;
    
    // 1. 首先尝试从URL参数中获取数据
    if (options.data) {
      try {
        resultData = JSON.parse(decodeURIComponent(options.data));
        console.log('从URL参数获取数据成功:', resultData);
      } catch (error) {
        console.error('解析URL参数失败:', error);
      }
    }
    
    // 2. 从全局数据中获取
    if (!resultData) {
      const app = getApp();
      if (app.globalData.baziResult) {
        resultData = app.globalData.baziResult;
        console.log('从全局数据获取数据成功:', resultData);
      }
    }
    
    // 3. 从缓存中获取
    if (!resultData) {
      const cachedResult = wx.getStorageSync('lastBaziResult');
      if (cachedResult) {
        resultData = cachedResult;
        console.log('从缓存获取数据成功:', resultData);
      }
    }
    
    // 4. 处理获取到的数据
    if (resultData) {
      this.setData({
        resultData: resultData
      });
      this.processResultData();
    } else {
      // 如果没有数据，显示提示并返回首页
      console.error('未找到计算结果数据');
      wx.showModal({
        title: '提示',
        content: '未找到计算结果，请重新进行八字测算',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    }
  },

  /**
   * 处理结果数据，生成显示用的字符串
   */
  processResultData() {
    const { resultData } = this.data;
    if (!resultData) return;

    try {
      console.log('处理结果数据:', resultData); // 调试日志

      // 处理农历日期
      const lunarInfo = resultData.lunar_info || {};
      const lunarDate = this.generateLunarDate(lunarInfo);

      // 处理八字字符串
      const bazi = resultData.bazi || {};
      const baziString = `${bazi.year || '庚子'}-${bazi.month || '乙酉'}-${bazi.day || '戊辰'}-${bazi.hour || '壬子'}`;

      // 处理五行字符串
      const wuxing = resultData.wuxing || {};
      const wuxingString = this.generateWuxingString(bazi);

      // 计算五行缺陷
      const wuxingLack = this.calculateWuxingLack(wuxing);

      // 获取正确的出生日期信息
      const birthDate = this.extractBirthDate(resultData);
      const solarDate = birthDate.solar;
      const lunarDateStr = birthDate.lunar;

      // 计算生肖
      const shengxiao = this.calculateShengxiao(solarDate);

      // 更新resultData中的用户信息，确保显示正确的日期
      const updatedResultData = {
        ...resultData,
        user_info: {
          ...resultData.user_info,
          birth_date: solarDate,
          solar_date: solarDate,
          lunar_date: lunarDateStr
        }
      };

      this.setData({
        lunarDate: lunarDateStr,
        baziString,
        wuxingString,
        wuxingLack,
        shengxiao,
        resultData: updatedResultData
      });

      console.log('数据处理完成:', {
        solarDate,
        lunarDate: lunarDateStr,
        baziString,
        calendarType: resultData.calendar_type
      }); // 调试日志

    } catch (error) {
      console.error('处理结果数据出错:', error);
      wx.showToast({
        title: '数据处理出错',
        icon: 'none'
      });
    }
  },

  /**
   * 从结果数据中提取正确的出生日期信息
   */
  extractBirthDate(resultData) {
    console.log('🔍 开始提取出生日期，原始数据结构:', {
      hasYear: !!resultData.year,
      hasMonth: !!resultData.month,
      hasDay: !!resultData.day,
      hasBirthInfo: !!resultData.birthInfo,
      hasUserInfo: !!resultData.user_info,
      hasSolarInfo: !!resultData.solar_info,
      hasLunarInfo: !!resultData.lunar_info,
      dataKeys: Object.keys(resultData || {})
    });
    
    // 尝试从多个可能的字段中提取日期信息
    let inputYear = resultData.year;
    let inputMonth = resultData.month;
    let inputDay = resultData.day;
    
    console.log('🔍 主字段提取结果:', { inputYear, inputMonth, inputDay });
    
    // 如果主字段无效，尝试从其他字段获取
    if (!inputYear || !inputMonth || inputDay === undefined) {
      console.log('🔍 主字段无效，尝试从其他字段获取...');
      
      // 尝试从 birthInfo 字段获取
      if (resultData.birthInfo) {
        console.log('🔍 尝试从 birthInfo 获取:', resultData.birthInfo);
        if (resultData.birthInfo.date) {
          const dateArr = resultData.birthInfo.date.split('-');
          if (dateArr.length === 3) {
            inputYear = parseInt(dateArr[0]);
            inputMonth = parseInt(dateArr[1]);
            inputDay = parseInt(dateArr[2]);
            console.log('✅ 从 birthInfo.date 获取成功:', { inputYear, inputMonth, inputDay });
          }
        }
        // 尝试从 birthInfo 的单独字段获取
        if ((!inputYear || !inputMonth || inputDay === undefined) && resultData.birthInfo.year) {
          inputYear = resultData.birthInfo.year;
          inputMonth = resultData.birthInfo.month;
          inputDay = resultData.birthInfo.day;
          console.log('✅ 从 birthInfo 单独字段获取成功:', { inputYear, inputMonth, inputDay });
        }
      }
      
      // 尝试从 user_info 字段获取
      if ((!inputYear || !inputMonth || inputDay === undefined) && resultData.user_info) {
        console.log('🔍 尝试从 user_info 获取:', resultData.user_info);
        if (resultData.user_info.birth_date) {
          const dateArr = resultData.user_info.birth_date.split('-');
          if (dateArr.length === 3) {
            inputYear = parseInt(dateArr[0]);
            inputMonth = parseInt(dateArr[1]);
            inputDay = parseInt(dateArr[2]);
            console.log('✅ 从 user_info.birth_date 获取成功:', { inputYear, inputMonth, inputDay });
          }
        }
      }
      
      // 尝试从 solar_info 字段获取
      if ((!inputYear || !inputMonth || inputDay === undefined) && resultData.solar_info) {
        console.log('🔍 尝试从 solar_info 获取:', resultData.solar_info);
        inputYear = resultData.solar_info.year;
        inputMonth = resultData.solar_info.month;
        inputDay = resultData.solar_info.day;
        console.log('✅ 从 solar_info 获取成功:', { inputYear, inputMonth, inputDay });
      }
      
      // 尝试从 birth_info 字段获取（后端返回格式）
      if ((!inputYear || !inputMonth || inputDay === undefined) && resultData.birth_info) {
        console.log('🔍 尝试从 birth_info 获取:', resultData.birth_info);
        inputYear = resultData.birth_info.year;
        inputMonth = resultData.birth_info.month;
        inputDay = resultData.birth_info.day;
        console.log('✅ 从 birth_info 获取成功:', { inputYear, inputMonth, inputDay });
      }
    }
    
    // 兼容不同的字段名称格式
    const calendarType = resultData.calendar_type || resultData.calendarType || 'solar';
    
    console.log('🔍 最终提取的日期信息:', {
      inputYear, inputMonth, inputDay, calendarType
    });

    // 增强的数据验证 - 更宽松的验证条件
    const isValidYear = inputYear && inputYear >= 1900 && inputYear <= 2100;
    const isValidMonth = inputMonth && inputMonth >= 1 && inputMonth <= 12;
    const isValidDay = inputDay !== undefined && inputDay >= 1 && inputDay <= 31;
    
    if (!isValidYear || !isValidMonth || !isValidDay) {
      console.error('🚨 数据验证失败:', { 
        inputYear, inputMonth, inputDay,
        isValidYear, isValidMonth, isValidDay,
        availableFields: Object.keys(resultData || {})
      });
      
      // 尝试使用默认值而不是直接报错
      const currentYear = new Date().getFullYear();
      const fallbackData = {
        year: inputYear || currentYear,
        month: inputMonth || 1,
        day: inputDay || 1
      };
      
      console.log('⚠️ 使用降级数据:', fallbackData);
      
      wx.showToast({
        title: '部分数据缺失，使用默认值',
        icon: 'none',
        duration: 3000
      });
      
      // 使用降级数据继续处理
      inputYear = fallbackData.year;
      inputMonth = fallbackData.month;
      inputDay = fallbackData.day;
    }

    let solarDate = '';
    let lunarDate = '';

    try {
      if (calendarType === 'lunar') {
        // 如果输入的是农历，那么输入的就是农历日期
        lunarDate = this.formatLunarDate(inputYear, inputMonth, inputDay);
        
        // 尝试获取对应的公历日期 - 多重来源
        if (resultData.solar_info) {
          solarDate = this.formatSolarDate(resultData.solar_info.year, resultData.solar_info.month, resultData.solar_info.day);
        } else if (resultData.user_info && resultData.user_info.birth_date) {
          solarDate = resultData.user_info.birth_date;
        } else {
          // 使用农历转公历的近似算法
          const approximateSolar = this.approximateLunarToSolar(inputYear, inputMonth, inputDay);
          solarDate = this.formatSolarDate(approximateSolar.year, approximateSolar.month, approximateSolar.day);
        }
      } else {
        // 如果输入的是公历，那么输入的就是公历日期
        solarDate = this.formatSolarDate(inputYear, inputMonth, inputDay);
        
        // 尝试获取对应的农历日期 - 多重来源
        if (resultData.lunar_info) {
          lunarDate = this.generateLunarDate(resultData.lunar_info);
        } else {
          // 使用公历转农历的近似算法
          const approximateLunar = this.approximateSolarToLunar(inputYear, inputMonth, inputDay);
          lunarDate = this.generateLunarDate(approximateLunar);
        }
      }

      console.log('✅ 最终提取结果:', { solar: solarDate, lunar: lunarDate });

      return {
        solar: solarDate,
        lunar: lunarDate
      };
      
    } catch (error) {
      console.error('❌ 日期处理过程中出错:', error);
      
      // 返回基础格式化的日期
      const safeSolarDate = this.formatSolarDate(inputYear, inputMonth, inputDay);
      const safeLunarDate = this.formatLunarDate(inputYear, inputMonth, inputDay);
      
      return {
        solar: safeSolarDate,
        lunar: safeLunarDate
      };
    }
  },

  /**
   * 公历转农历的近似算法
   */
  approximateSolarToLunar(year, month, day) {
    // 简单的近似转换算法
    const lunarMonth = month === 1 ? 12 : month - 1;
    const lunarYear = month === 1 ? year - 1 : year;
    const lunarDay = day <= 15 ? day + 15 : day - 15;
    
    return {
      year: lunarYear,
      month: Math.max(1, Math.min(12, lunarMonth)),
      day: Math.max(1, Math.min(30, lunarDay))
    };
  },

  /**
   * 农历转公历的近似算法
   */
  approximateLunarToSolar(year, month, day) {
    // 简单的近似转换算法
    const solarMonth = month === 12 ? 1 : month + 1;
    const solarYear = month === 12 ? year + 1 : year;
    const solarDay = day <= 15 ? day + 15 : day - 15;
    
    return {
      year: solarYear,
      month: Math.max(1, Math.min(12, solarMonth)),
      day: Math.max(1, Math.min(28, solarDay)) // 保守估计28天
    };
  },

  /**
   * 格式化公历日期
   */
  formatSolarDate(year, month, day) {
    const y = String(year).padStart(4, '0');
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * 格式化农历日期
   */
  formatLunarDate(year, month, day) {
    const lunarMonths = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    const lunarDays = [
      '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

    const monthStr = lunarMonths[month - 1] || '正月';
    const dayStr = lunarDays[day] || '初一';
    
    return `${year}年${monthStr}${dayStr}`;
  },

  /**
   * 生成农历日期字符串
   */
  generateLunarDate(lunarInfo) {
    if (!lunarInfo || !lunarInfo.year) {
      return '八月初六';
    }
    
    // 农历月份映射
    const lunarMonths = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    const lunarDays = [
      '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

    // 使用真实的农历信息
    const year = lunarInfo.year;
    const month = lunarInfo.month || 1;
    const day = lunarInfo.day || 1;
    
    const monthStr = lunarMonths[month - 1] || '正月';
    const dayStr = lunarDays[day] || '初一';
    
    return `${year}年${monthStr}${dayStr}`;
  },

  /**
   * 生成五行字符串
   */
  generateWuxingString(bazi) {
    if (!bazi) return '金水-木金-土土-水水';

    const wuxingMap = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };

    const result = [];
    ['year', 'month', 'day', 'hour'].forEach(key => {
      const zhu = bazi[key] || '甲子';
      const gan = zhu[0];
      const zhi = zhu[1];
      const ganWuxing = wuxingMap[gan] || '木';
      const zhiWuxing = wuxingMap[zhi] || '水';
      result.push(`${ganWuxing}${zhiWuxing}`);
    });

    return result.join('-');
  },

  /**
   * 计算五行缺陷
   */
  calculateWuxingLack(wuxing) {
    if (!wuxing) return '火';

    const wuxingElements = ['木', '火', '土', '金', '水'];
    const lackElements = [];

    wuxingElements.forEach(element => {
      if (!wuxing[element] || wuxing[element] === 0) {
        lackElements.push(element);
      }
    });

    return lackElements.length > 0 ? lackElements.join('、') : '无';
  },

  /**
   * 计算生肖
   */
  calculateShengxiao(birthDate) {
    if (!birthDate) return '鼠';

    const year = parseInt(birthDate.split('-')[0]);
    const shengxiaoList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const index = (year - 1900) % 12;
    return shengxiaoList[index] || '鼠';
  },

  /**
   * 显示分析结果弹窗
   */
  async showAnalysis() {
    console.log('显示分析结果');
    
    // 2. 点击八字解读时展示横幅广告
    try {
      const adManager = AdManager.getInstance()
      const adResult = await adManager.showBannerAd('result')
      
      if (adResult.skipped) {
        console.log('横幅广告已跳过，原因:', adResult.reason)
      } else if (adResult.success) {
        console.log('横幅广告展示成功')
      } else {
        console.log('横幅广告展示失败，继续执行:', adResult.error)
      }
    } catch (error) {
      console.warn('横幅广告展示出错，继续执行:', error)
    }
    
    // 准备书籍推荐上下文
    this.prepareBookRecommendationContext();
    
    this.setData({
      showAnalysisModal: true
    });
  },

  /**
   * 准备书籍推荐上下文
   */
  prepareBookRecommendationContext() {
    const { resultData, wuxingLack } = this.data;
    
    if (!resultData) return;

    // 基于八字分析结果生成推荐上下文
    const recommendationContext = {
      function_type: 'bazi_calculation',
      wuxing_lack: wuxingLack ? wuxingLack.split('、') : [],
      user_info: {
        gender: resultData.user_info?.gender || 'unknown',
        birth_year: resultData.user_info?.birth_date ? 
          parseInt(resultData.user_info.birth_date.split('-')[0]) : null
      },
      analysis_keywords: this.extractAnalysisKeywords(resultData)
    };

    console.log('书籍推荐上下文:', recommendationContext);

    this.setData({
      bookRecommendationContext: recommendationContext
    });
  },

  /**
   * 从分析结果中提取关键词
   */
  extractAnalysisKeywords(resultData) {
    const keywords = [];
    
    if (resultData.analysis) {
      // 从性格分析中提取关键词
      if (resultData.analysis.personality) {
        if (resultData.analysis.personality.includes('事业')) {
          keywords.push('事业运势');
        }
        if (resultData.analysis.personality.includes('财运')) {
          keywords.push('财运');
        }
        if (resultData.analysis.personality.includes('感情')) {
          keywords.push('感情');
        }
      }
      
      // 从五行分析中提取关键词
      if (resultData.analysis.wuxing_analysis) {
        keywords.push('五行');
        keywords.push('风水');
      }
    }

    // 基于生肖添加关键词
    if (this.data.shengxiao) {
      keywords.push('生肖运势');
    }

    return keywords.length > 0 ? keywords : ['命理', '运势'];
  },

  /**
   * 隐藏分析结果弹窗
   */
  hideAnalysis() {
    this.setData({
      showAnalysisModal: false
    });
  },

  /**
   * 防止弹窗关闭
   */
  preventClose() {
    // 阻止事件冒泡，防止点击内容区域关闭弹窗
  },

  /**
   * 重新计算
   */
  calculateAgain() {
    console.log('重新计算');
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 图片加载错误处理
   */
  onImageError(e) {
    console.log('图片加载失败:', e.detail);
    this.setData({
      showAdPlaceholder: true
    });
  },

  /**
   * 图片加载成功处理
   */
  onImageLoad(e) {
    console.log('图片加载成功:', e.detail);
    this.setData({
      showAdPlaceholder: false
    });
  },

  /**
   * 激励视频奖励处理（简化版）
   */
  onVideoReward(e) {
    console.log('用户获得视频奖励:', e.detail);
    
    // 给用户解锁高级运势功能
    wx.showModal({
      title: '奖励获得',
      content: '恭喜您获得高级运势分析！现在可以查看更详细的运势解读。',
      showCancel: false,
      success: () => {
        this.unlockAdvancedFeatures();
      }
    });
  },

  /**
   * 解锁高级功能
   */
  unlockAdvancedFeatures() {
    // 这里可以实现解锁高级功能的逻辑
    // 比如显示更详细的分析内容、解锁特殊功能等
    
    // 示例：更新页面数据，显示高级内容
    const { resultData } = this.data;
    if (resultData && resultData.analysis) {
      // 可以在这里添加高级分析内容
      const enhancedAnalysis = {
        ...resultData.analysis,
        advanced_personality: '高级性格分析：根据您的八字，您具有独特的领导才能...',
        lucky_colors: ['红色', '金色', '紫色'],
        lucky_numbers: [3, 8, 9],
        lucky_direction: '正南方',
        relationship_advice: '在感情中，您需要更多的耐心和理解...'
      };
      
      this.setData({
        'resultData.analysis': enhancedAnalysis
      });
      
      wx.showToast({
        title: '高级功能已解锁',
        icon: 'success'
      });
    }
  },


  /**
   * 保存到历史记录 - 使用智能备注名
   */
  saveToHistory() {
    const { resultData } = this.data;
    if (!resultData) {
      wx.showToast({
        title: '没有数据可保存',
        icon: 'none'
      });
      return;
    }

    try {
      // 引入 BaziDataAdapter 来生成智能备注名
      const BaziDataAdapter = require('../../utils/bazi-data-adapter');
      
      // 构建出生信息对象
      const birthInfo = this.extractBirthInfoFromResultData(resultData);
      
      // 生成智能备注名
      const intelligentDisplayName = BaziDataAdapter.generateDisplayName(birthInfo);
      
      console.log('生成的智能备注名:', intelligentDisplayName);
      
      // 保存到app的历史记录
      const app = getApp();
      if (app.saveToHistory) {
        // 添加智能备注名到结果数据中
        const enhancedResultData = {
          ...resultData,
          intelligentDisplayName: intelligentDisplayName,
          customName: intelligentDisplayName // 同时设置customName以保持兼容性
        };
        app.saveToHistory(enhancedResultData);
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } else {
        // 直接保存到本地存储
        const history = wx.getStorageSync('baziHistory') || [];
        const newRecord = {
          ...resultData,
          saveTime: Date.now(),
          id: Date.now().toString(),
          intelligentDisplayName: intelligentDisplayName,
          customName: intelligentDisplayName
        };
        history.unshift(newRecord);
        
        // 限制历史记录数量
        if (history.length > 50) {
          history.splice(50);
        }
        
        wx.setStorageSync('baziHistory', history);
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('保存历史记录失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
    
    // 关闭弹窗
    this.hideAnalysis();
  },

  /**
   * 从结果数据中提取出生信息
   */
  extractBirthInfoFromResultData(resultData) {
    // 从多个可能的字段中提取出生信息
    let year, month, day, hour, gender;
    
    // 尝试从主字段获取
    if (resultData.year && resultData.month && resultData.day) {
      year = resultData.year;
      month = resultData.month;
      day = resultData.day;
      hour = resultData.hour || 0;
      gender = resultData.gender || 'male';
    }
    // 尝试从 user_info 获取
    else if (resultData.user_info) {
      if (resultData.user_info.birth_date) {
        const dateArr = resultData.user_info.birth_date.split('-');
        year = parseInt(dateArr[0]);
        month = parseInt(dateArr[1]);
        day = parseInt(dateArr[2]);
      }
      hour = resultData.user_info.hour || resultData.hour || 0;
      gender = resultData.user_info.gender || resultData.gender || 'male';
    }
    // 尝试从 solar_info 获取
    else if (resultData.solar_info) {
      year = resultData.solar_info.year;
      month = resultData.solar_info.month;
      day = resultData.solar_info.day;
      hour = resultData.hour || 0;
      gender = resultData.gender || 'male';
    }
    
    // 如果还是没有获取到，使用默认值
    if (!year || !month || !day) {
      console.warn('无法从resultData中提取完整的出生信息，使用默认值');
      year = 1990;
      month = 1;
      day = 1;
      hour = 0;
      gender = 'male';
    }
    
    return {
      year: year,
      month: month,
      day: day,
      hour: hour,
      gender: gender,
      calendarType: resultData.calendar_type || 'solar'
    };
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    const { lunarDate, baziString } = this.data;
    return {
      title: `我的八字运势：${baziString}`,
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.png'
    };
  },

  /**
   * 处理书籍点击事件
   */
  onBookClick(event) {
    const { book } = event.detail;
    console.log('书籍点击:', book.title);
    
    // 可以在这里添加统计或其他逻辑
    wx.reportAnalytics('book_click', {
      book_id: book.id,
      book_title: book.title,
      source: 'result_page'
    });
  },

  /**
   * 处理书籍收藏事件
   */
  onBookCollect(event) {
    const { book } = event.detail;
    console.log('书籍收藏:', book.title);
    
    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    });
  },

  /**
   * 处理书籍分享事件
   */
  onBookShare(event) {
    const { book } = event.detail;
    console.log('书籍分享:', book.title);
    
    // 触发分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { lunarDate, baziString } = this.data;
    return {
      title: `八字运势测算：${baziString}`,
      query: 'from=timeline',
      imageUrl: '/images/share-bg.png'
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成后的逻辑
    console.log('result页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时的逻辑
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时的逻辑
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时的逻辑
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
    // 上拉触底
  }
});
