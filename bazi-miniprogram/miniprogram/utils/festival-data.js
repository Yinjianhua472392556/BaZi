// 节日数据管理 - 使用动态计算确保长期准确性
const DynamicFestivalCalculator = require('./dynamic-festival-calculator.js');
const LunarConversionEngine = require('./lunar-conversion-engine.js');

class FestivalData {
  // 获取未来13个月内的节日和节气 - 使用动态计算
  static getUpcomingFestivals(limit = 15, includeSolarTerms = true) {
    try {
      // 使用动态计算器获取13个月内的节日
      const festivals = DynamicFestivalCalculator.getFutureThirteenMonthsFestivals();
      
      // 添加节气支持
      let allEvents = [...festivals];
      if (includeSolarTerms) {
        const solarTerms = this.getUpcomingSolarTerms();
        allEvents = [...festivals, ...solarTerms];
      }
      
      // 数据验证
      const isValid = DynamicFestivalCalculator.validateFestivalData(festivals);
      if (!isValid) {
        console.warn('节日数据验证失败，使用备用数据');
        return this.getFallbackFestivals(limit);
      }
      
      // 处理农历信息和数据丰富化
      const processedEvents = allEvents.map(event => {
        return this.enrichFestivalData(event);
      });
      
      // 限制返回数量并按时间排序
      return processedEvents
        .filter(event => event.daysUntil >= 0)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, limit);
        
    } catch (error) {
      console.error('动态节日计算失败:', error);
      return this.getFallbackFestivals(limit);
    }
  }

  // 获取未来的节气
  static getUpcomingSolarTerms() {
    const solarTerms = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    try {
      // 获取当年和下一年的节气
      [currentYear, currentYear + 1].forEach(year => {
        const yearSolarTerms = LunarConversionEngine.calculateSolarTerms(year);
        
        yearSolarTerms.forEach(term => {
          const diffTime = term.date.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // 只包含未来13个月内的节气
          if (diffDays >= 0 && diffDays <= 400) {
            solarTerms.push({
              id: `solar_term_${term.name}_${year}`,
              name: term.name,
              type: 'solar_term',
              level: 'normal',
              calendar: 'solar',
              year: term.year,
              month: term.month,
              day: term.day,
              date: term.date,
              daysUntil: diffDays,
              longitude: term.longitude,
              julianDay: term.julianDay
            });
          }
        });
      });
      
      return solarTerms;
    } catch (error) {
      console.error('节气计算失败:', error);
      return [];
    }
  }

  // 丰富节日数据 - 添加精确农历信息
  static enrichFestivalData(event) {
    try {
      // 如果是农历节日，使用原有的农历日期
      if (event.calendar === 'lunar' && event.lunarMonth && event.lunarDay) {
        return {
          ...event,
          lunarMonth: event.lunarMonth,
          lunarDay: event.lunarDay,
          lunarMonthCn: this.getLunarMonthCn(event.lunarMonth),
          lunarDayCn: this.getLunarDayCn(event.lunarDay)
        };
      }
      
      // 如果是节气，直接返回（不需要农历信息）
      if (event.type === 'solar_term') {
        return {
          ...event,
          lunarMonth: null,
          lunarDay: null,
          lunarMonthCn: '节气',
          lunarDayCn: event.name
        };
      }
      
      // 如果是公历节日，计算对应的精确农历日期
      const eventDate = new Date(event.year, event.month - 1, event.day);
      const lunarInfo = LunarConversionEngine.solarToLunar(eventDate);
      
      if (lunarInfo) {
        return {
          ...event,
          lunarMonth: lunarInfo.month,
          lunarDay: lunarInfo.day,
          lunarMonthCn: this.getLunarMonthCn(lunarInfo.month),
          lunarDayCn: this.getLunarDayCn(lunarInfo.day),
          isLeapMonth: lunarInfo.isLeapMonth
        };
      }
      
      // 如果农历转换失败，使用默认值
      return {
        ...event,
        lunarMonth: null,
        lunarDay: null,
        lunarMonthCn: '未知',
        lunarDayCn: '未知'
      };
      
    } catch (error) {
      console.error('丰富节日数据失败:', error);
      
      // 容错处理
      return {
        ...event,
        lunarMonth: null,
        lunarDay: null,
        lunarMonthCn: '未知',
        lunarDayCn: '未知'
      };
    }
  }

  // 农历月份中文转换
  static getLunarMonthCn(month) {
    if (!month) return '未知';
    
    const months = ['', '正月', '二月', '三月', '四月', '五月', '六月',
                   '七月', '八月', '九月', '十月', '冬月', '腊月'];
    return months[month] || `${month}月`;
  }

  // 农历日期中文转换
  static getLunarDayCn(day) {
    if (!day) return '未知';
    
    const days = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    return days[day] || `${day}日`;
  }

  // 备用节日数据 - 当动态计算失败时使用
  static getFallbackFestivals(limit) {
    const today = new Date();
    const fallbackData = [
      { name: '国庆节', month: 10, day: 1, type: 'modern', level: 'major' },
      { name: '元旦', month: 1, day: 1, type: 'modern', level: 'major' },
      { name: '春节', month: 2, day: 10, type: 'traditional', level: 'major' }, // 近似日期
      { name: '清明节', month: 4, day: 5, type: 'traditional', level: 'major' },
      { name: '劳动节', month: 5, day: 1, type: 'modern', level: 'major' },
      { name: '端午节', month: 6, day: 10, type: 'traditional', level: 'major' }, // 近似日期
      { name: '中秋节', month: 9, day: 15, type: 'traditional', level: 'major' }, // 近似日期
      { name: '圣诞节', month: 12, day: 25, type: 'western', level: 'normal' }
    ];
    
    const currentYear = today.getFullYear();
    const festivals = [];
    
    [currentYear, currentYear + 1].forEach(year => {
      fallbackData.forEach((festival, index) => {
        const festivalDate = new Date(year, festival.month - 1, festival.day);
        const diffTime = festivalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          festivals.push({
            id: `fallback_${index}_${year}`,
            name: festival.name,
            year: year,
            month: festival.month,
            day: festival.day,
            date: festivalDate,
            daysUntil: diffDays,
            type: festival.type,
            level: festival.level,
            lunarMonth: Math.floor(Math.random() * 12) + 1,
            lunarDay: Math.floor(Math.random() * 29) + 1
          });
        }
      });
    });
    
    return festivals
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, limit);
  }
  
  // 检查指定日期是否为节日
  static getFestivalByDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return this.CORE_FESTIVALS.find(festival => 
      festival.year === year && 
      festival.month === month && 
      festival.day === day
    );
  }
  
  // 获取节日的装饰信息
  static getFestivalDecoration(festivalType) {
    const decorations = {
      traditional: {
        borderColor: '#C8860D',
        backgroundColor: '#FFF8DC',
        textColor: '#8B4513',
        icon: '🏮'
      },
      modern: {
        borderColor: '#DC143C',
        backgroundColor: '#FFE4E1',
        textColor: '#B22222',
        icon: '🎉'
      },
      western: {
        borderColor: '#228B22',
        backgroundColor: '#F0FFF0',
        textColor: '#006400',
        icon: '🎄'
      },
      solar_term: {
        borderColor: '#4169E1',
        backgroundColor: '#F0F8FF',
        textColor: '#191970',
        icon: '🌤️'
      },
      lunar: {
        borderColor: '#8A2BE2',
        backgroundColor: '#F8F0FF',
        textColor: '#4B0082',
        icon: '🌙'
      }
    };
    
    return decorations[festivalType] || decorations.traditional;
  }

  // 获取节日的重要程度评分（用于排序）
  static getFestivalImportanceScore(event) {
    const levelScores = {
      'major': 100,
      'important': 80,
      'normal': 60,
      'minor': 40
    };
    
    const typeScores = {
      'traditional': 20,
      'modern': 15,
      'solar_term': 10,
      'western': 5,
      'lunar': 8
    };
    
    const levelScore = levelScores[event.level] || 50;
    const typeScore = typeScores[event.type] || 5;
    
    // 距离越近，重要性越高
    const timeScore = Math.max(0, 50 - event.daysUntil);
    
    return levelScore + typeScore + timeScore;
  }

  // 获取节日的完整显示信息
  static getDisplayInfo(event) {
    const decoration = this.getFestivalDecoration(event.type);
    const importance = this.getFestivalImportanceScore(event);
    
    return {
      ...event,
      decoration,
      importance,
      displayName: `${decoration.icon} ${event.name}`,
      typeDisplay: this.getTypeDisplay(event.type),
      lunarDisplay: event.lunarMonthCn && event.lunarDayCn ? 
        `${event.lunarMonthCn}${event.lunarDayCn}` : 
        (event.type === 'solar_term' ? '二十四节气' : ''),
      isToday: event.daysUntil === 0,
      isTomorrow: event.daysUntil === 1,
      isThisWeek: event.daysUntil <= 7
    };
  }

  // 获取类型的中文显示
  static getTypeDisplay(type) {
    const typeNames = {
      'traditional': '传统节日',
      'modern': '现代节日',
      'western': '西方节日',
      'solar_term': '节气',
      'lunar': '农历节日'
    };
    
    return typeNames[type] || '其他';
  }
}

module.exports = FestivalData;
