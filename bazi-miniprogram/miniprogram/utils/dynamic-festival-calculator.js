// 动态节日计算器 - 基于天文算法的无限期节日计算
const FestivalCacheManager = require('./festival-cache-manager.js');
const LunarConversionEngine = require('./lunar-conversion-engine.js');
const AstronomicalCalculator = require('./astronomical-calculator.js');

class DynamicFestivalCalculator {
  
  // 节日规则定义 - 基于固定规则动态计算
  static FESTIVAL_RULES = {
    // 传统农历节日 - 基于农历日期
    lunar: {
      'spring_festival': { 
        name: '春节', 
        month: 1, 
        day: 1, 
        type: 'traditional',
        level: 'major'
      },
      'lantern_festival': { 
        name: '元宵节', 
        month: 1, 
        day: 15, 
        type: 'traditional',
        level: 'normal'
      },
      'dragon_boat': { 
        name: '端午节', 
        month: 5, 
        day: 5, 
        type: 'traditional',
        level: 'major'
      },
      'qixi': { 
        name: '七夕节', 
        month: 7, 
        day: 7, 
        type: 'traditional',
        level: 'normal'
      },
      'mid_autumn': { 
        name: '中秋节', 
        month: 8, 
        day: 15, 
        type: 'traditional',
        level: 'major'
      },
      'double_ninth': { 
        name: '重阳节', 
        month: 9, 
        day: 9, 
        type: 'traditional',
        level: 'normal'
      }
    },
    
    // 现代公历节日 - 基于公历日期
    solar: {
      'new_year': { 
        name: '元旦', 
        month: 1, 
        day: 1, 
        type: 'modern',
        level: 'major'
      },
      'labor_day': { 
        name: '劳动节', 
        month: 5, 
        day: 1, 
        type: 'modern',
        level: 'major'
      },
      'national_day': { 
        name: '国庆节', 
        month: 10, 
        day: 1, 
        type: 'modern',
        level: 'major'
      },
      'christmas_eve': { 
        name: '平安夜', 
        month: 12, 
        day: 24, 
        type: 'western',
        level: 'normal'
      },
      'christmas': { 
        name: '圣诞节', 
        month: 12, 
        day: 25, 
        type: 'western',
        level: 'normal'
      }
    },
    
    // 特殊节日 - 需要复杂计算规则
    special: {
      'qingming': {
        name: '清明节',
        type: 'traditional',
        level: 'major',
        calculator: 'calculateQingming' // 基于节气计算
      }
    }
  };

  // 获取未来13个月内的所有节日
  static getFutureThirteenMonthsFestivals() {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 13); // 13个月后
    
    const festivals = [];
    
    // 计算涉及的年份
    const startYear = today.getFullYear();
    const endYear = endDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      // 计算该年的所有节日
      const yearFestivals = this.calculateYearFestivals(year);
      
      // 筛选在时间窗口内的节日
      const filteredFestivals = yearFestivals.filter(festival => {
        return festival.date >= today && festival.date <= endDate;
      });
      
      festivals.push(...filteredFestivals);
    }
    
    // 按日期排序
    festivals.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // 计算倒计时
    return festivals.map(festival => ({
      ...festival,
      daysUntil: Math.ceil((festival.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  // 计算指定年份的所有节日
  static calculateYearFestivals(year) {
    const festivals = [];
    
    // 计算公历节日
    Object.entries(this.FESTIVAL_RULES.solar).forEach(([id, rule]) => {
      const date = new Date(year, rule.month - 1, rule.day);
      festivals.push({
        id: `${id}_${year}`,
        name: rule.name,
        year: year,
        month: rule.month,
        day: rule.day,
        date: date,
        type: rule.type,
        level: rule.level,
        calendar: 'solar'
      });
    });
    
    // 计算农历节日
    Object.entries(this.FESTIVAL_RULES.lunar).forEach(([id, rule]) => {
      const solarDate = this.convertLunarToSolar(year, rule.month, rule.day);
      if (solarDate) {
        festivals.push({
          id: `${id}_${year}`,
          name: rule.name,
          year: solarDate.getFullYear(),
          month: solarDate.getMonth() + 1,
          day: solarDate.getDate(),
          date: solarDate,
          lunarMonth: rule.month,
          lunarDay: rule.day,
          type: rule.type,
          level: rule.level,
          calendar: 'lunar'
        });
      }
    });
    
    // 计算特殊节日
    Object.entries(this.FESTIVAL_RULES.special).forEach(([id, rule]) => {
      const date = this[rule.calculator](year);
      if (date) {
        festivals.push({
          id: `${id}_${year}`,
          name: rule.name,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          date: date,
          type: rule.type,
          level: rule.level,
          calendar: 'special'
        });
      }
    });
    
    return festivals;
  }

  // 农历转公历 - 基于天文算法的高精度转换
  static convertLunarToSolar(lunarYear, lunarMonth, lunarDay) {
    try {
      // 使用缓存的农历转换引擎
      return FestivalCacheManager.lunarToSolarCached(lunarYear, lunarMonth, lunarDay, false);
    } catch (error) {
      console.error(`农历转公历失败: ${lunarYear}-${lunarMonth}-${lunarDay}`, error);
      return null;
    }
  }

  // 计算清明节 - 基于天文节气计算
  static calculateQingming(year) {
    try {
      // 获取该年的节气数据
      const solarTerms = FestivalCacheManager.getSolarTermsData(year);
      
      if (solarTerms) {
        // 找到清明节气
        const qingming = solarTerms.find(term => term.name === '清明');
        if (qingming) {
          return qingming.date;
        }
      }
      
      // 如果缓存失败，使用直接计算
      const qingmingJD = AstronomicalCalculator.findSolarLongitudeTime(year, 15); // 清明：太阳黄经15度
      return AstronomicalCalculator.julianDayToGregorian(qingmingJD);
    } catch (error) {
      console.error(`计算${year}年清明节失败:`, error);
      
      // 降级到简化算法
      const approximateDay = 4 + Math.floor((year - 2000) * 0.2422);
      return new Date(year, 3, Math.max(1, Math.min(30, approximateDay))); // 限制在4月1-30日
    }
  }

  /**
   * 获取指定农历年的春节日期
   * @param {number} lunarYear - 农历年份
   * @returns {Date|null} 春节公历日期
   */
  static getSpringFestivalDate(lunarYear) {
    try {
      const yearData = FestivalCacheManager.getLunarYearData(lunarYear);
      return yearData ? yearData.springFestival : null;
    } catch (error) {
      console.error(`获取${lunarYear}年春节日期失败:`, error);
      return null;
    }
  }

  /**
   * 判断指定年份是否为农历闰年
   * @param {number} lunarYear - 农历年份
   * @returns {boolean} 是否为闰年
   */
  static isLunarLeapYear(lunarYear) {
    try {
      const yearData = FestivalCacheManager.getLunarYearData(lunarYear);
      return yearData ? yearData.isLeapYear : false;
    } catch (error) {
      console.error(`判断${lunarYear}年是否闰年失败:`, error);
      return false;
    }
  }

  /**
   * 获取指定农历年的闰月月份
   * @param {number} lunarYear - 农历年份
   * @returns {number|null} 闰月月份，无闰月返回null
   */
  static getLeapMonth(lunarYear) {
    try {
      const yearData = FestivalCacheManager.getLunarYearData(lunarYear);
      return yearData ? yearData.leapMonth : null;
    } catch (error) {
      console.error(`获取${lunarYear}年闰月信息失败:`, error);
      return null;
    }
  }

  /**
   * 计算两个日期之间的所有节日
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Array<Object>} 节日列表
   */
  static getFestivalsBetweenDates(startDate, endDate) {
    const festivals = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      const yearFestivals = this.calculateYearFestivals(year);
      
      const filteredFestivals = yearFestivals.filter(festival => {
        return festival.date >= startDate && festival.date <= endDate;
      });
      
      festivals.push(...filteredFestivals);
    }
    
    return festivals.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * 获取指定日期的节日信息
   * @param {Date} date - 指定日期
   * @returns {Array<Object>} 该日期的节日列表
   */
  static getFestivalsOnDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const yearFestivals = this.calculateYearFestivals(year);
    
    return yearFestivals.filter(festival => 
      festival.year === year && 
      festival.month === month && 
      festival.day === day
    );
  }

  /**
   * 获取性能统计信息
   * @returns {Object} 性能统计
   */
  static getPerformanceStats() {
    return FestivalCacheManager.getCacheStatistics();
  }

  /**
   * 预热缓存 - 预计算常用年份数据
   * @param {number} centerYear - 中心年份
   * @param {number} range - 前后年份范围
   */
  static async warmupCache(centerYear = new Date().getFullYear(), range = 10) {
    const startYear = centerYear - range;
    const yearCount = range * 2 + 1;
    
    console.log(`开始预热缓存: ${startYear}-${startYear + yearCount - 1}年`);
    await FestivalCacheManager.precomputeYears(startYear, yearCount);
    console.log('缓存预热完成');
  }

  // 数据验证 - 确保计算结果的合理性
  static validateFestivalData(festivals) {
    const errors = [];
    
    festivals.forEach(festival => {
      // 检查日期是否合理
      if (!(festival.date instanceof Date) || isNaN(festival.date.getTime())) {
        errors.push(`${festival.name}: 无效的日期`);
      }
      
      // 检查倒计时是否合理
      if (festival.daysUntil < 0 || festival.daysUntil > 400) {
        errors.push(`${festival.name}: 倒计时天数异常(${festival.daysUntil}天)`);
      }
      
      // 检查必要字段
      if (!festival.name || !festival.type || !festival.level) {
        errors.push(`${festival.name || '未知节日'}: 缺少必要字段`);
      }
    });
    
    if (errors.length > 0) {
      console.warn('节日数据验证发现问题:', errors);
    }
    
    return errors.length === 0;
  }

  // 获取节日在指定年份的准确日期（用于验证）
  static getFestivalDateInYear(festivalId, year) {
    const yearFestivals = this.calculateYearFestivals(year);
    return yearFestivals.find(f => f.id.startsWith(festivalId));
  }
}

module.exports = DynamicFestivalCalculator;
