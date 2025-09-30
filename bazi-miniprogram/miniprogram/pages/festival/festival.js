// 节日页面逻辑
const FestivalData = require('../../utils/festival-data.js');
const LunarCalendar = require('../../utils/lunar-calendar.js');
const AlmanacUtils = require('../../utils/almanac-utils.js');

Page({
  data: {
    festivals: [],
    loading: true,
    refreshing: false,
    lastUpdateTime: '',
    error: null
  },

  onLoad(options) {
    // 加载节日数据
    this.loadFestivals();
    
    // 预加载下一批数据（性能优化）
    this.preloadNextBatch();
  },

  onShow() {
    // 每次显示页面时更新倒计时
    this.updateCountdown();
  },

  onReady() {
    // 页面渲染完成后的优化
    this.optimizePerformance();
  },

  onHide() {
    // 页面隐藏时清理定时器
    this.clearTimers();
  },

  onUnload() {
    // 页面卸载时清理资源
    this.cleanup();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadFestivals(() => {
      wx.stopPullDownRefresh();
      this.setData({ refreshing: false });
    });
  },

  // 加载节日数据
  loadFestivals(callback) {
    this.setData({ loading: true, error: null });
    
    try {
      // 获取未来13个月内的所有节日（不限制数量）
      const upcomingFestivals = FestivalData.getUpcomingFestivals();
      const processedFestivals = upcomingFestivals.map(festival => {
        return this.processFestivalData(festival);
      });

      this.setData({
        festivals: processedFestivals,
        loading: false,
        lastUpdateTime: this.formatUpdateTime(new Date())
      });

      console.log('节日数据加载成功:', processedFestivals);
      
    } catch (error) {
      console.error('加载节日数据失败:', error);
      this.setData({
        loading: false,
        error: '加载节日数据失败，请稍后重试'
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000
      });
    }
    
    if (callback) callback();
  },

  // 处理节日数据 - 增强版
  processFestivalData(festival) {
    const { date, name, daysUntil, type } = festival;
    
    // 使用新的显示信息获取方法
    const displayInfo = FestivalData.getDisplayInfo(festival);
    
    // 获取节日的文化信息
    const culturalInfo = this.getFestivalCulturalInfo(name, type);
    
    // 获取农历信息（对于非节气类型）
    let lunarInfo = null;
    let activities = null;
    
    if (type !== 'solar_term') {
      try {
        lunarInfo = LunarCalendar.getLunarInfo(date, festival);
        activities = AlmanacUtils.getFullAlmanacInfo(date, festival, lunarInfo);
        
        // 确保宜忌活动数据完整性
        if (!activities || (!activities.suitable && !activities.unsuitable)) {
          activities = this.getDefaultActivities(name, type);
        }
      } catch (error) {
        console.warn('获取农历信息失败:', error);
        lunarInfo = { lunarMonthCn: '未知', lunarDayCn: '未知' };
        activities = this.getDefaultActivities(name, type);
      }
    }

    return {
      id: festival.id,
      name,
      type,
      date: typeof date === 'string' ? date : LunarCalendar.formatDate(date),
      lunarDate: displayInfo.lunarDisplay || 
                 (lunarInfo ? `${lunarInfo.lunarMonthCn}${lunarInfo.lunarDayCn}` : ''),
      dayOfWeek: typeof date === 'string' ? 
                 LunarCalendar.getDayOfWeekCn(new Date(date)) : 
                 LunarCalendar.getDayOfWeekCn(date),
      daysUntil,
      countdownText: this.getCountdownText(daysUntil),
      
      // 新增字段
      displayName: displayInfo.displayName,
      typeDisplay: displayInfo.typeDisplay,
      importance: displayInfo.importance,
      isToday: displayInfo.isToday,
      isTomorrow: displayInfo.isTomorrow,
      isThisWeek: displayInfo.isThisWeek,
      
      // 文化信息增强
      description: culturalInfo.description,
      culturalBackground: culturalInfo.background,
      customs: culturalInfo.customs,
      popularityLevel: culturalInfo.popularity,
      
      // 视觉设计字段 - 优化颜色对比度
      primaryColor: this.optimizeColorContrast('#FFFFFF', culturalInfo.primaryColor, 4.5),
      accentColor: this.optimizeColorContrast('#FFFFFF', culturalInfo.accentColor, 4.5),
      iconEmoji: culturalInfo.iconEmoji,
      backgroundPattern: culturalInfo.backgroundPattern,
      
      // 确保文字颜色满足无障碍要求
      titleTextColor: this.optimizeColorContrast('#FFFFFF', culturalInfo.primaryColor, 7.0),
      subtitleTextColor: this.optimizeColorContrast('#F8F9FA', '#666666', 4.5),
      descriptionTextColor: this.optimizeColorContrast('#F8F9FA', '#2F4F4F', 4.5),
      
      // 高精度数据标识
      isHighPrecision: festival.isHighPrecision || false,
      precisionLevel: festival.precisionLevel || 'calculated',
      precisionDisplay: festival.precisionDisplay || '📊计算',
      precisionDescription: festival.precisionDescription || '天文算法计算',
      precisionColor: festival.precisionColor || '#32CD32',
      dataSource: festival.dataSource || { source: '动态计算', reliability: 'standard' },
      qualityLevel: festival.qualityLevel || 'standard_grade',
      
      // 传统信息（仅对非节气类型）
      ganZhi: lunarInfo ? `${lunarInfo.ganZhi || ''}·${lunarInfo.ganZhiLuck || ''}` : '',
      shierShen: lunarInfo ? `${lunarInfo.shierShen || ''}·${lunarInfo.shierShenLuck || ''}` : '',
      xingXiu: lunarInfo ? `${lunarInfo.xingxiuFull || ''}·${lunarInfo.xingxiuLuck || ''}` : '',
      
      // 宜忌活动（仅对非节气类型）
      activities: activities || { suitable: [], unsuitable: [] },
      
      // 装饰样式
      decoration: displayInfo.decoration,
      
      // 节气特殊信息
      isolarTerm: type === 'solar_term',
      longitude: festival.longitude || null,
      
      // 交互功能字段
      isBookmarkable: true,
      hasDetailPage: true,
      shareText: this.generateShareText(name, date, daysUntil)
    };
  },

  // 获取倒计时文本
  getCountdownText(daysUntil) {
    if (daysUntil === 0) {
      return '今天';
    } else if (daysUntil === 1) {
      return '明天';
    } else if (daysUntil === 2) {
      return '后天';
    } else {
      return `距离${daysUntil}天`;
    }
  },

  // 更新倒计时
  updateCountdown() {
    if (this.data.festivals.length === 0) return;

    const festivals = this.data.festivals.map(festival => {
      // 重新计算倒计时
      const festivalDate = new Date(festival.date);
      const today = new Date();
      const diffTime = festivalDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...festival,
        daysUntil: diffDays >= 0 ? diffDays : 0,
        countdownText: this.getCountdownText(diffDays >= 0 ? diffDays : 0)
      };
    });

    this.setData({ festivals });
  },

  // 格式化更新时间
  formatUpdateTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 点击节日卡片 - 直接显示详情
  onFestivalTap(e) {
    const { festival } = e.currentTarget.dataset;
    console.log('点击节日卡片:', festival);
    
    // 直接显示详情弹窗
    this.showFestivalDetailModal(festival);
  },

  // 分享节日
  onShareFestival(e) {
    const { festival } = e.currentTarget.dataset;
    console.log('分享节日:', festival);
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 设置临时的分享数据
    this.tempShareData = {
      title: `${festival.iconEmoji} ${festival.name}`,
      path: `/pages/festival/festival?festivalId=${festival.id}`,
      imageUrl: ''
    };
    
    wx.showToast({
      title: '点击右上角分享',
      icon: 'none',
      duration: 2000
    });
  },


  // 节日详情
  onFestivalDetail(e) {
    const { festival } = e.currentTarget.dataset;
    console.log('查看节日详情:', festival);
    
    this.showFestivalDetailModal(festival);
  },

  // 显示快速预览（点击卡片）
  showQuickPreview(festival) {
    const content = this.formatQuickPreviewContent(festival);
    
    wx.showModal({
      title: `${festival.iconEmoji} ${festival.name}`,
      content: content,
      confirmText: '查看详情',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          // 用户选择查看详情，显示完整信息
          this.showFestivalDetailModal(festival);
        }
      }
    });
  },

  // 显示节日详情弹窗（完整信息）
  showFestivalDetailModal(festival) {
    const content = this.formatFestivalDetailContent(festival);
    
    wx.showModal({
      title: `${festival.iconEmoji} ${festival.name} 详情`,
      content: content,
      confirmText: '知道了',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认查看详情');
        }
      }
    });
  },

  // 格式化快速预览内容（简化版）
  formatQuickPreviewContent(festival) {
    let content = '';
    
    // 基本信息
    content += `📅 ${festival.date} ${festival.dayOfWeek}\n`;
    if (festival.lunarDate) {
      content += `🌙 ${festival.lunarDate}\n`;
    }
    content += `⏰ ${festival.countdownText}\n\n`;
    
    // 节日描述（简短）
    if (festival.description) {
      content += `📝 ${festival.description}\n\n`;
    }
    
    // 主要习俗（最多3个）
    if (festival.customs && festival.customs.length > 0) {
      const displayCustoms = festival.customs.slice(0, 3);
      content += `🎉 主要习俗：${displayCustoms.join('、')}${festival.customs.length > 3 ? '等' : ''}`;
    }
    
    return content;
  },

  // 格式化节日详情内容
  formatFestivalDetailContent(festival) {
    let content = '';
    
    // 基本信息
    content += `📅 ${festival.date} ${festival.dayOfWeek}\n`;
    if (festival.lunarDate) {
      content += `🌙 ${festival.lunarDate}\n`;
    }
    content += `⏰ ${festival.countdownText}\n\n`;
    
    // 节日描述
    if (festival.description) {
      content += `📝 ${festival.description}\n\n`;
    }
    
    // 主要习俗
    if (festival.customs && festival.customs.length > 0) {
      content += `🎉 主要习俗：\n${festival.customs.join('、')}\n\n`;
    }
    
    // 传统信息（仅对非节气类型）
    if (!festival.isolarTerm) {
      if (festival.ganZhi) {
        content += `⚡ 值神：${festival.ganZhi}\n`;
      }
      if (festival.shierShen) {
        content += `🛡️ 十二神：${festival.shierShen}\n`;
      }
      if (festival.xingXiu) {
        content += `⭐ 星宿：${festival.xingXiu}\n`;
      }
    }
    
    return content;
  },


  // 重试加载
  onRetry() {
    this.loadFestivals();
  },

  // 分享节日信息
  onShareAppMessage() {
    return {
      title: '最近节日 - 传统节日黄历查询',
      path: '/pages/festival/festival',
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '最近节日 - 传统节日黄历查询',
      imageUrl: ''
    };
  },

  /**
   * 计算颜色对比度
   */
  calculateContrastRatio(color1, color2) {
    // 转换颜色为RGB
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    // 计算相对亮度
    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);
    
    // 计算对比度
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * 将十六进制颜色转换为RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  },

  /**
   * 计算相对亮度
   */
  getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  },

  /**
   * 优化颜色对比度
   */
  optimizeColorContrast(backgroundColor, textColor, minRatio = 4.5) {
    const contrast = this.calculateContrastRatio(backgroundColor, textColor);
    
    if (contrast >= minRatio) {
      return textColor; // 对比度已达标
    }
    
    // 调整文字颜色亮度
    const bgRgb = this.hexToRgb(backgroundColor);
    const bgLuminance = this.getRelativeLuminance(bgRgb);
    
    // 如果背景较亮，使用深色文字；如果背景较暗，使用浅色文字
    if (bgLuminance > 0.5) {
      return this.darkenColor(textColor, minRatio, backgroundColor);
    } else {
      return this.lightenColor(textColor, minRatio, backgroundColor);
    }
  },

  /**
   * 加深颜色
   */
  darkenColor(color, targetRatio, backgroundColor) {
    const rgb = this.hexToRgb(color);
    let factor = 0.9;
    
    while (factor > 0.1) {
      const newRgb = {
        r: Math.round(rgb.r * factor),
        g: Math.round(rgb.g * factor),
        b: Math.round(rgb.b * factor)
      };
      
      const newColor = this.rgbToHex(newRgb);
      const contrast = this.calculateContrastRatio(backgroundColor, newColor);
      
      if (contrast >= targetRatio) {
        return newColor;
      }
      
      factor -= 0.1;
    }
    
    return '#333333'; // 返回深灰色作为备选
  },

  /**
   * 提亮颜色
   */
  lightenColor(color, targetRatio, backgroundColor) {
    const rgb = this.hexToRgb(color);
    let factor = 1.1;
    
    while (factor < 3.0) {
      const newRgb = {
        r: Math.min(255, Math.round(rgb.r * factor)),
        g: Math.min(255, Math.round(rgb.g * factor)),
        b: Math.min(255, Math.round(rgb.b * factor))
      };
      
      const newColor = this.rgbToHex(newRgb);
      const contrast = this.calculateContrastRatio(backgroundColor, newColor);
      
      if (contrast >= targetRatio) {
        return newColor;
      }
      
      factor += 0.1;
    }
    
    return '#FFFFFF'; // 返回白色作为备选
  },

  /**
   * RGB转十六进制
   */
  rgbToHex(rgb) {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  },

  // 获取节日文化信息
  getFestivalCulturalInfo(name, type) {
    const culturalData = {
      // 传统节日
      '春节': {
        description: '中华民族最隆重的传统佳节',
        background: '农历正月初一，象征团圆和新的开始',
        customs: ['贴春联', '放鞭炮', '吃年夜饭', '拜年', '发红包'],
        popularity: 'popular',
        primaryColor: '#DC143C',
        accentColor: '#FFD700',
        iconEmoji: '🧧',
        backgroundPattern: 'fireworks'
      },
      '元宵节': {
        description: '正月十五，春节的最后一天',
        background: '又称上元节、灯节，标志着春节的结束',
        customs: ['赏花灯', '猜灯谜', '吃汤圆', '舞龙舞狮'],
        popularity: 'popular',
        primaryColor: '#FF6347',
        accentColor: '#FFD700',
        iconEmoji: '🏮',
        backgroundPattern: 'lanterns'
      },
      '清明节': {
        description: '踏青扫墓的传统节日',
        background: '既是节气又是节日，祭祀先祖、踏青郊游',
        customs: ['扫墓祭祖', '踏青', '插柳', '放风筝'],
        popularity: 'popular',
        primaryColor: '#32CD32',
        accentColor: '#98FB98',
        iconEmoji: '🌿',
        backgroundPattern: 'spring'
      },
      '端午节': {
        description: '纪念屈原的传统节日',
        background: '农历五月初五，又称龙舟节',
        customs: ['吃粽子', '赛龙舟', '挂艾草', '佩香囊'],
        popularity: 'popular',
        primaryColor: '#4169E1',
        accentColor: '#87CEEB',
        iconEmoji: '🚣',
        backgroundPattern: 'water'
      },
      '中秋节': {
        description: '团圆赏月的美好节日',
        background: '农历八月十五，月圆人团圆',
        customs: ['赏月', '吃月饼', '团圆聚餐', '拜月'],
        popularity: 'popular',
        primaryColor: '#FFD700',
        accentColor: '#FFA500',
        iconEmoji: '🌕',
        backgroundPattern: 'moon'
      },
      '重阳节': {
        description: '登高敬老的传统节日',
        background: '农历九月九日，又称老人节',
        customs: ['登高', '赏菊', '插茱萸', '敬老'],
        popularity: 'normal',
        primaryColor: '#8A2BE2',
        accentColor: '#DDA0DD',
        iconEmoji: '🏔️',
        backgroundPattern: 'mountain'
      },
      '冬至': {
        description: '重要的传统节气',
        background: '北半球白昼最短的一天',
        customs: ['吃饺子', '吃汤圆', '数九', '祭祖'],
        popularity: 'normal',
        primaryColor: '#4682B4',
        accentColor: '#B0E0E6',
        iconEmoji: '❄️',
        backgroundPattern: 'winter'
      },
      // 现代节日
      '元旦': {
        description: '公历新年，新的开始',
        background: '1月1日，全世界共同庆祝的新年',
        customs: ['新年聚会', '制定计划', '观看烟火'],
        popularity: 'popular',
        primaryColor: '#FF1493',
        accentColor: '#FFB6C1',
        iconEmoji: '🎉',
        backgroundPattern: 'celebration'
      },
      '国庆节': {
        description: '庆祝中华人民共和国成立',
        background: '10月1日，国家法定节假日',
        customs: ['观看阅兵', '旅游', '升国旗'],
        popularity: 'popular',
        primaryColor: '#DC143C',
        accentColor: '#FFD700',
        iconEmoji: '🇨🇳',
        backgroundPattern: 'flag'
      },
      '劳动节': {
        description: '向劳动者致敬的节日',
        background: '5月1日国际劳动节',
        customs: ['休假旅游', '劳动表彰', '游行'],
        popularity: 'popular',
        primaryColor: '#FF4500',
        accentColor: '#FFA500',
        iconEmoji: '⚒️',
        backgroundPattern: 'work'
      },
      // 西方节日
      '圣诞节': {
        description: '西方重要的宗教节日',
        background: '12月25日，纪念耶稣诞生',
        customs: ['装圣诞树', '互赠礼物', '圣诞聚餐'],
        popularity: 'normal',
        primaryColor: '#228B22',
        accentColor: '#DC143C',
        iconEmoji: '🎄',
        backgroundPattern: 'christmas'
      },
      '情人节': {
        description: '爱情与浪漫的节日',
        background: '2月14日，表达爱意的日子',
        customs: ['送花', '约会', '表白', '互赠礼物'],
        popularity: 'normal',
        primaryColor: '#FF69B4',
        accentColor: '#FFB6C1',
        iconEmoji: '💝',
        backgroundPattern: 'love'
      },
      '万圣节': {
        description: '西方传统节日',
        background: '10月31日，充满神秘色彩',
        customs: ['变装', '要糖果', '装饰南瓜'],
        popularity: 'normal',
        primaryColor: '#FF8C00',
        accentColor: '#000000',
        iconEmoji: '🎃',
        backgroundPattern: 'halloween'
      }
    };

    // 获取具体节日信息，如果没有则使用默认值
    const festivalInfo = culturalData[name];
    if (festivalInfo) {
      return festivalInfo;
    }

    // 根据类型返回默认信息
    const typeDefaults = {
      'traditional': {
        description: '中华传统文化的重要组成部分',
        background: '承载着深厚的历史文化内涵',
        customs: ['祭祀', '团聚', '传承'],
        popularity: 'normal',
        primaryColor: '#C8860D',
        accentColor: '#FFF8DC',
        iconEmoji: '🏮',
        backgroundPattern: 'traditional'
      },
      'modern': {
        description: '现代社会的重要节日',
        background: '体现现代文明的价值观念',
        customs: ['庆祝', '聚会', '娱乐'],
        popularity: 'normal',
        primaryColor: '#DC143C',
        accentColor: '#FFE4E1',
        iconEmoji: '🎉',
        backgroundPattern: 'modern'
      },
      'western': {
        description: '西方文化的传统节日',
        background: '体现西方的文化传统',
        customs: ['聚会', '装饰', '礼物'],
        popularity: 'normal',
        primaryColor: '#228B22',
        accentColor: '#F0FFF0',
        iconEmoji: '🎄',
        backgroundPattern: 'western'
      },
      'solar_term': {
        description: '中国传统二十四节气之一',
        background: '反映季节变化和农事活动',
        customs: ['养生', '农事', '应时'],
        popularity: 'normal',
        primaryColor: '#4169E1',
        accentColor: '#F0F8FF',
        iconEmoji: '🌤️',
        backgroundPattern: 'seasonal'
      }
    };

    return typeDefaults[type] || typeDefaults['traditional'];
  },

  // 获取默认宜忌活动
  getDefaultActivities(name, type) {
    const activityData = {
      '春节': {
        suitable: ['祭祀', '祈福', '嫁娶', '出行', '移徙', '开业'],
        unsuitable: ['动土', '破土', '安葬']
      },
      '清明节': {
        suitable: ['祭祀', '扫墓', '修坟', '启攒', '成服', '除服'],
        unsuitable: ['嫁娶', '开业', '动土']
      },
      '端午节': {
        suitable: ['祭祀', '祈福', '求嗣', '开光', '出行'],
        unsuitable: ['嫁娶', '安葬', '作灶']
      },
      '中秋节': {
        suitable: ['祭祀', '祈福', '求嗣', '嫁娶', '出行', '会亲友'],
        unsuitable: ['开市', '立券', '动土']
      },
      '冬至': {
        suitable: ['祭祀', '作灶', '补垣', '塞穴', '入学'],
        unsuitable: ['嫁娶', '出行', '动土', '破土']
      }
    };

    if (activityData[name]) {
      return activityData[name];
    }

    // 根据类型返回默认宜忌
    const typeDefaults = {
      'traditional': {
        suitable: ['祭祀', '祈福', '会亲友', '进人口', '嫁娶'],
        unsuitable: ['开市', '立券', '纳财', '分居']
      },
      'modern': {
        suitable: ['会亲友', '出行', '嫁娶', '开业', '庆典'],
        unsuitable: ['安葬', '破土', '动土']
      },
      'western': {
        suitable: ['会亲友', '嫁娶', '庆典', '出行'],
        unsuitable: ['祭祀', '斋醮', '作灶']
      }
    };

    return typeDefaults[type] || typeDefaults['traditional'];
  },

  // 生成分享文案
  generateShareText(name, date, daysUntil) {
    const dateStr = typeof date === 'string' ? date : date.toLocaleDateString();
    
    if (daysUntil === 0) {
      return `今天是${name}，祝大家节日快乐！🎉`;
    } else if (daysUntil === 1) {
      return `明天就是${name}了，记得提前准备哦！📅`;
    } else if (daysUntil <= 7) {
      return `还有${daysUntil}天就是${name}了，期待中...⏰`;
    } else {
      return `${name}将在${dateStr}到来，距今还有${daysUntil}天 📆`;
    }
  },

  // 预加载下一批数据（性能优化）
  preloadNextBatch() {
    // 预加载策略：在空闲时间加载更多数据
    setTimeout(() => {
      try {
        // 预缓存下一年的节日数据
        FestivalData.preloadFestivalData(new Date().getFullYear() + 1);
        console.log('预加载节日数据完成');
      } catch (error) {
        console.warn('预加载节日数据失败:', error);
      }
    }, 2000);
  },

  // 性能优化
  optimizePerformance() {
    // 启用长列表性能优化
    if (this.data.festivals.length > 20) {
      this.setData({
        'lazyLoad': true,
        'virtualList': true
      });
    }
    
    // 图片懒加载（如果有图片）
    this.enableLazyLoading();
    
    // 设置更新定时器
    this.setupUpdateTimer();
  },

  // 启用懒加载
  enableLazyLoading() {
    // 创建IntersectionObserver来监听元素进入视口
    if (typeof wx.createIntersectionObserver === 'function') {
      this.intersectionObserver = wx.createIntersectionObserver(this);
      this.intersectionObserver.relativeToViewport({bottom: 100});
      this.intersectionObserver.observe('.festival-card', (res) => {
        // 元素进入视口时的处理逻辑
        if (res.intersectionRatio > 0) {
          // 可以在这里触发数据加载或动画
        }
      });
    }
  },

  // 设置更新定时器
  setupUpdateTimer() {
    // 每5分钟更新一次倒计时
    this.updateTimer = setInterval(() => {
      this.updateCountdown();
    }, 5 * 60 * 1000);
  },

  // 清理定时器
  clearTimers() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  },

  // 资源清理
  cleanup() {
    this.clearTimers();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    // 清理临时数据
    this.tempShareData = null;
  },

  /**
   * 原生广告事件处理
   */
  onNativeAdLoad(e) {
    console.log('节日页面原生广告加载成功:', e.detail)
  },

  onNativeAdClick(e) {
    console.log('节日页面原生广告被点击:', e.detail)
  },

  onNativeAdClose(e) {
    console.log('节日页面原生广告被关闭:', e.detail)
  },

  onNativeAdError(e) {
    console.log('节日页面原生广告加载失败:', e.detail)
  }
});
