// 动态节日计算器 - 基于天文算法的无限期节日计算（支持中国时区）
const FestivalCacheManager = require('./festival-cache-manager.js');
const LunarConversionEngine = require('./lunar-conversion-engine.js');
const AstronomicalCalculator = require('./astronomical-calculator.js');
const ChinaTimezoneHandler = require('./china-timezone-handler.js');

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
      'ghost_festival': { 
        name: '中元节', 
        month: 7, 
        day: 15, 
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
      },
      'laba': { 
        name: '腊八节', 
        month: 12, 
        day: 8, 
        type: 'traditional',
        level: 'normal'
      },
      'kitchen_god': { 
        name: '小年', 
        month: 12, 
        day: 23, 
        type: 'traditional',
        level: 'normal'
      },
      'new_year_eve': { 
        name: '除夕', 
        month: 12, 
        day: 30, 
        type: 'traditional',
        level: 'major'
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
      'valentines': { 
        name: '情人节', 
        month: 2, 
        day: 14, 
        type: 'western',
        level: 'normal'
      },
      'womens_day': { 
        name: '妇女节', 
        month: 3, 
        day: 8, 
        type: 'modern',
        level: 'normal'
      },
      'tree_planting': { 
        name: '植树节', 
        month: 3, 
        day: 12, 
        type: 'modern',
        level: 'normal'
      },
      'april_fools': { 
        name: '愚人节', 
        month: 4, 
        day: 1, 
        type: 'western',
        level: 'normal'
      },
      'labor_day': { 
        name: '劳动节', 
        month: 5, 
        day: 1, 
        type: 'modern',
        level: 'major'
      },
      'youth_day': { 
        name: '青年节', 
        month: 5, 
        day: 4, 
        type: 'modern',
        level: 'normal'
      },
      'mothers_day': { 
        name: '母亲节', 
        month: 5, 
        day: 12, 
        type: 'western',
        level: 'normal',
        calculator: 'calculateMothersDay' // 5月第二个星期日
      },
      'childrens_day': { 
        name: '儿童节', 
        month: 6, 
        day: 1, 
        type: 'modern',
        level: 'normal'
      },
      'party_founding': { 
        name: '建党节', 
        month: 7, 
        day: 1, 
        type: 'modern',
        level: 'normal'
      },
      'army_day': { 
        name: '建军节', 
        month: 8, 
        day: 1, 
        type: 'modern',
        level: 'normal'
      },
      'teachers_day': { 
        name: '教师节', 
        month: 9, 
        day: 10, 
        type: 'modern',
        level: 'normal'
      },
      'national_day': { 
        name: '国庆节', 
        month: 10, 
        day: 1, 
        type: 'modern',
        level: 'major'
      },
      'halloween': { 
        name: '万圣节', 
        month: 10, 
        day: 31, 
        type: 'western',
        level: 'normal'
      },
      'singles_day': { 
        name: '光棍节', 
        month: 11, 
        day: 11, 
        type: 'modern',
        level: 'normal'
      },
      'thanksgiving': { 
        name: '感恩节', 
        month: 11, 
        day: 27, 
        type: 'western',
        level: 'normal',
        calculator: 'calculateThanksgiving' // 11月第四个星期四
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
    
    // 24节气 - 基于天文计算
    solar_terms: {
      'lichun': { 
        name: '立春', 
        longitude: 315, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'yushui': { 
        name: '雨水', 
        longitude: 330, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'jingzhe': { 
        name: '惊蛰', 
        longitude: 345, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'chunfen': { 
        name: '春分', 
        longitude: 0, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'qingming': { 
        name: '清明', 
        longitude: 15, 
        type: 'solar_term',
        level: 'major',
        calculator: 'calculateSolarTerm'
      },
      'guyu': { 
        name: '谷雨', 
        longitude: 30, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'lixia': { 
        name: '立夏', 
        longitude: 45, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'xiaoman': { 
        name: '小满', 
        longitude: 60, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'mangzhong': { 
        name: '芒种', 
        longitude: 75, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'xiazhi': { 
        name: '夏至', 
        longitude: 90, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'xiaoshu': { 
        name: '小暑', 
        longitude: 105, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'dashu': { 
        name: '大暑', 
        longitude: 120, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'liqiu': { 
        name: '立秋', 
        longitude: 135, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'chushu': { 
        name: '处暑', 
        longitude: 150, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'bailu': { 
        name: '白露', 
        longitude: 165, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'qiufen': { 
        name: '秋分', 
        longitude: 180, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'hanlu': { 
        name: '寒露', 
        longitude: 195, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'shuangjiang': { 
        name: '霜降', 
        longitude: 210, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'lidong': { 
        name: '立冬', 
        longitude: 225, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'xiaoxue': { 
        name: '小雪', 
        longitude: 240, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'daxue': { 
        name: '大雪', 
        longitude: 255, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'dongzhi': { 
        name: '冬至', 
        longitude: 270, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'xiaohan': { 
        name: '小寒', 
        longitude: 285, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      },
      'dahan': { 
        name: '大寒', 
        longitude: 300, 
        type: 'solar_term',
        level: 'normal',
        calculator: 'calculateSolarTerm'
      }
    },
    
    // 特殊节日 - 需要复杂计算规则（保留兼容性）
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
      let solarDate = null;
      
      // 特殊处理除夕（腊月最后一天）
      if (id === 'new_year_eve') {
        // 除夕是农历十二月的最后一天，需要动态计算天数
        const lunarYearData = FestivalCacheManager.getLunarYearData(year);
        if (lunarYearData && lunarYearData.months) {
          // 找到腊月（十二月）
          const lastMonth = lunarYearData.months.find(m => m.month === 12 && !m.isLeap);
          if (lastMonth) {
            solarDate = this.convertLunarToSolar(year, 12, lastMonth.days); // 使用实际天数
          }
        }
      } else {
        // 正常农历节日
        solarDate = this.convertLunarToSolar(year, rule.month, rule.day);
      }
      
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
    
    // 计算24节气
    Object.entries(this.FESTIVAL_RULES.solar_terms).forEach(([id, rule]) => {
      const date = this.calculateSolarTerm(year, rule.longitude);
      if (date) {
        festivals.push({
          id: `${id}_${year}`,
          name: rule.name,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          date: date,
          longitude: rule.longitude,
          type: rule.type,
          level: rule.level,
          calendar: 'solar_term'
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

  // 计算24节气 - 基于天文算法
  static calculateSolarTerm(year, longitude) {
    try {
      // 优先使用缓存的节气数据
      const solarTerms = FestivalCacheManager.getSolarTermsData(year);
      
      if (solarTerms) {
        // 根据太阳黄经找到对应的节气
        const term = solarTerms.find(t => t.longitude === longitude);
        if (term) {
          return term.date;
        }
      }
      
      // 如果缓存失败，使用直接天文计算
      const julianDay = AstronomicalCalculator.findSolarLongitudeTime(year, longitude);
      return AstronomicalCalculator.julianDayToGregorian(julianDay);
    } catch (error) {
      console.error(`计算${year}年太阳黄经${longitude}度节气失败:`, error);
      
      // 降级到近似算法
      return this.approximateSolarTerm(year, longitude);
    }
  }

  // 近似节气计算 - 降级算法（修正版）
  static approximateSolarTerm(year, longitude) {
    try {
      // 24节气的近似日期（基于实际天文数据修正）
      const baseTermDates = {
        315: new Date(year, 1, 4),   // 立春 (2月4日左右)
        330: new Date(year, 1, 19),  // 雨水 (2月19日左右)
        345: new Date(year, 2, 5),   // 惊蛰 (3月5日左右)
        0: new Date(year, 2, 20),    // 春分 (3月20日左右)
        15: new Date(year, 3, 5),    // 清明 (4月5日左右)
        30: new Date(year, 3, 20),   // 谷雨 (4月20日左右)
        45: new Date(year, 4, 5),    // 立夏 (5月5日左右)
        60: new Date(year, 4, 21),   // 小满 (5月21日左右)
        75: new Date(year, 5, 5),    // 芒种 (6月5日左右)
        90: new Date(year, 5, 21),   // 夏至 (6月21日左右)
        105: new Date(year, 6, 7),   // 小暑 (7月7日左右)
        120: new Date(year, 6, 22),  // 大暑 (7月22日左右)
        135: new Date(year, 7, 7),   // 立秋 (8月7日左右)
        150: new Date(year, 7, 23),  // 处暑 (8月23日左右)
        165: new Date(year, 8, 7),   // 白露 (9月7日左右)
        180: new Date(year, 8, 23),  // 秋分 (9月23日左右)
        195: new Date(year, 9, 8),   // 寒露 (10月8日左右)
        210: new Date(year, 9, 23),  // 霜降 (10月23日左右)
        225: new Date(year, 10, 7),  // 立冬 (11月7日左右)
        240: new Date(year, 10, 22), // 小雪 (11月22日左右)
        255: new Date(year, 11, 7),  // 大雪 (12月7日左右) - 修正关键问题
        270: new Date(year, 11, 22), // 冬至 (12月22日左右)
        285: new Date(year + 1, 0, 5),   // 小寒 (次年1月5日左右) - 修正年份
        300: new Date(year + 1, 0, 20)   // 大寒 (次年1月20日左右) - 修正年份
      };

      let baseDate = baseTermDates[longitude];
      if (!baseDate) {
        console.warn(`未知的太阳黄经: ${longitude}`);
        return null;
      }

      // 根据年份差异调整（更精确的偏移计算）
      const yearsSince2000 = year - 2000;
      const leapYearOffset = Math.floor(yearsSince2000 / 4);
      const fineOffset = (yearsSince2000 % 4) * 0.25;
      const totalOffset = Math.round(leapYearOffset + fineOffset);
      
      baseDate.setDate(baseDate.getDate() + totalOffset);

      return baseDate;
    } catch (error) {
      console.error(`近似计算节气失败:`, error);
      return null;
    }
  }

  // 计算清明节 - 基于天文节气计算
  static calculateQingming(year) {
    try {
      // 清明节就是清明节气
      return this.calculateSolarTerm(year, 15);
    } catch (error) {
      console.error(`计算${year}年清明节失败:`, error);
      
      // 降级到简化算法
      const approximateDay = 4 + Math.floor((year - 2000) * 0.2422);
      return new Date(year, 3, Math.max(1, Math.min(30, approximateDay))); // 限制在4月1-30日
    }
  }

  // 计算母亲节 - 5月第二个星期日
  static calculateMothersDay(year) {
    try {
      const mayFirst = new Date(year, 4, 1); // 5月1日
      const firstDayOfWeek = mayFirst.getDay(); // 星期几（0=周日）
      
      // 计算第一个星期日
      let firstSunday = 1;
      if (firstDayOfWeek !== 0) {
        firstSunday = 8 - firstDayOfWeek;
      }
      
      // 第二个星期日
      const secondSunday = firstSunday + 7;
      return new Date(year, 4, secondSunday);
    } catch (error) {
      console.error(`计算${year}年母亲节失败:`, error);
      return new Date(year, 4, 12); // 默认5月12日
    }
  }

  // 计算感恩节 - 11月第四个星期四（修复版算法）
  static calculateThanksgiving(year) {
    try {
      const november1 = new Date(year, 10, 1); // 11月1日
      const firstDayOfWeek = november1.getDay(); // 星期几（0=周日, 1=周一, ..., 6=周六）
      
      // 计算第一个星期四的日期 - 使用标准算法
      // 公式：1 + (4 - firstDayOfWeek + 7) % 7
      const firstThursday = 1 + (4 - firstDayOfWeek + 7) % 7;
      
      // 第四个星期四 = 第一个星期四 + 21天
      const fourthThursday = firstThursday + 21;
      
      // 验证日期是否合理（11月应该有30天）
      if (fourthThursday > 30) {
        console.warn(`${year}年感恩节计算异常: 11月${fourthThursday}日，使用备用算法`);
        return this.calculateThanksgivingFallback(year);
      }
      
      const thanksgivingDate = new Date(year, 10, fourthThursday);
      
      // 验证确实是星期四
      if (thanksgivingDate.getDay() !== 4) {
        console.warn(`${year}年感恩节计算错误: ${fourthThursday}日不是星期四，使用备用算法`);
        return this.calculateThanksgivingFallback(year);
      }
      
      return thanksgivingDate;
    } catch (error) {
      console.error(`计算${year}年感恩节失败:`, error);
      return this.calculateThanksgivingFallback(year);
    }
  }
  
  // 感恩节备用计算算法
  static calculateThanksgivingFallback(year) {
    // 使用更直接的方法：遍历11月的每一天，找到第四个星期四
    const thursdays = [];
    
    for (let day = 1; day <= 30; day++) {
      const date = new Date(year, 10, day);
      if (date.getDay() === 4) { // 星期四
        thursdays.push(day);
      }
    }
    
    if (thursdays.length >= 4) {
      return new Date(year, 10, thursdays[3]); // 第四个星期四（索引3）
    }
    
    // 最后的备用方案：经验日期
    console.error(`${year}年无法找到第四个星期四，使用经验日期`);
    return new Date(year, 10, 25); // 11月25日左右通常是感恩节
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
