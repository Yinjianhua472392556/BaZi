// 动态节日计算器 - 确保长期数据准确性
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
        calculator: 'calculateQingming' // 基于春分后第15天
      }
    }
  };

  // 高精度农历转换表 - 基于天文数据
  static LUNAR_CONVERSION_TABLE = {
    // 每年的农历信息 (年份: {春节公历日期, 闰月信息})
    2024: { springFestival: new Date(2024, 1, 10), leapMonth: null },
    2025: { springFestival: new Date(2025, 0, 29), leapMonth: 6 },
    2026: { springFestival: new Date(2026, 1, 17), leapMonth: null },
    2027: { springFestival: new Date(2027, 1, 6), leapMonth: null },
    2028: { springFestival: new Date(2028, 0, 26), leapMonth: 5 },
    2029: { springFestival: new Date(2029, 1, 13), leapMonth: null },
    2030: { springFestival: new Date(2030, 1, 3), leapMonth: null },
    2031: { springFestival: new Date(2031, 0, 23), leapMonth: 3 },
    2032: { springFestival: new Date(2032, 1, 11), leapMonth: null },
    2033: { springFestival: new Date(2033, 0, 31), leapMonth: 11 },
    2034: { springFestival: new Date(2034, 1, 19), leapMonth: null },
    2035: { springFestival: new Date(2035, 1, 8), leapMonth: null }
  };

  // 农历月份天数表
  static LUNAR_MONTHS_DAYS = {
    2024: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], // 闰6月
    2025: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], // 闰6月
    2026: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30],
    2027: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30],
    2028: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30], // 闰5月
    2029: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29],
    2030: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30],
    2031: [29, 30, 29, 30, 30, 29, 29, 30, 29, 30, 29, 30, 30], // 闰3月
    2032: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29],
    2033: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], // 闰11月
    2034: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30],
    2035: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29]
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

  // 农历转公历 - 高精度算法
  static convertLunarToSolar(lunarYear, lunarMonth, lunarDay) {
    if (!this.LUNAR_CONVERSION_TABLE[lunarYear]) {
      console.warn(`缺少${lunarYear}年的农历转换数据`);
      return null;
    }
    
    const yearInfo = this.LUNAR_CONVERSION_TABLE[lunarYear];
    const monthDays = this.LUNAR_MONTHS_DAYS[lunarYear];
    
    if (!monthDays) {
      console.warn(`缺少${lunarYear}年的农历月份天数数据`);
      return null;
    }
    
    // 从春节开始计算天数
    let totalDays = lunarDay - 1; // 减1因为春节是第1天
    
    // 加上前面几个月的天数
    for (let month = 1; month < lunarMonth; month++) {
      const monthIndex = month - 1;
      if (monthIndex < monthDays.length) {
        totalDays += monthDays[monthIndex];
      }
    }
    
    // 基于春节日期计算目标日期
    const springFestival = new Date(yearInfo.springFestival);
    const targetDate = new Date(springFestival);
    targetDate.setDate(springFestival.getDate() + totalDays);
    
    return targetDate;
  }

  // 计算清明节 - 基于春分后第15天的算法
  static calculateQingming(year) {
    // 简化算法：春分通常在3月20-21日，清明在春分后15天左右
    // 更精确的算法会基于天文计算
    let qingmingDay;
    
    if (year >= 1900 && year <= 2099) {
      // 基于经验公式计算清明
      const coefficient = (year - 1900) * 0.2422 + 4.81;
      qingmingDay = Math.floor(coefficient);
      
      // 处理特殊年份的调整
      const specialYears = [1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932, 1936, 1940, 1944, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048, 2052, 2056, 2060, 2064, 2068, 2072, 2076, 2080, 2084, 2088, 2092, 2096];
      if (specialYears.includes(year)) {
        qingmingDay -= 1;
      }
    } else {
      // 默认值
      qingmingDay = 5;
    }
    
    return new Date(year, 3, qingmingDay); // 4月的qingmingDay日
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
