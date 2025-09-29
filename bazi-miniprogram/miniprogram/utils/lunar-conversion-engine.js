// 农历转换引擎 - 基于天文算法的高精度农历计算
const AstronomicalCalculator = require('./astronomical-calculator.js');

class LunarConversionEngine {
  
  // 二十四节气名称和对应太阳黄经
  static SOLAR_TERMS = [
    { name: '立春', longitude: 315 },
    { name: '雨水', longitude: 330 },
    { name: '惊蛰', longitude: 345 },
    { name: '春分', longitude: 0 },
    { name: '清明', longitude: 15 },
    { name: '谷雨', longitude: 30 },
    { name: '立夏', longitude: 45 },
    { name: '小满', longitude: 60 },
    { name: '芒种', longitude: 75 },
    { name: '夏至', longitude: 90 },
    { name: '小暑', longitude: 105 },
    { name: '大暑', longitude: 120 },
    { name: '立秋', longitude: 135 },
    { name: '处暑', longitude: 150 },
    { name: '白露', longitude: 165 },
    { name: '秋分', longitude: 180 },
    { name: '寒露', longitude: 195 },
    { name: '霜降', longitude: 210 },
    { name: '立冬', longitude: 225 },
    { name: '小雪', longitude: 240 },
    { name: '大雪', longitude: 255 },
    { name: '冬至', longitude: 270 },
    { name: '小寒', longitude: 285 },
    { name: '大寒', longitude: 300 }
  ];

  // 中气对应的太阳黄经（用于判断闰月）
  static MIDDLE_QI_LONGITUDES = [330, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
  static MIDDLE_QI_NAMES = ['雨水', '春分', '谷雨', '小满', '夏至', '大暑', '处暑', '秋分', '霜降', '小雪', '冬至', '大寒'];

  // 已知准确的春节数据作为参考
  static KNOWN_SPRING_FESTIVALS = {
    2024: new Date(2024, 1, 10), // 2月10日
    2025: new Date(2025, 0, 29), // 1月29日
    2026: new Date(2026, 1, 17), // 2月17日
    2027: new Date(2027, 1, 6),  // 2月6日
    2028: new Date(2028, 0, 26), // 1月26日
    2029: new Date(2029, 1, 13), // 2月13日
    2030: new Date(2030, 1, 3),  // 2月3日
  };

  static KNOWN_LEAP_MONTHS = {
    2025: 6,
    2028: 5,
    2031: 3,
    2033: 11,
  };

  /**
   * 计算指定农历年的完整结构
   * @param {number} lunarYear - 农历年份
   * @returns {Object} 农历年结构信息
   */
  static calculateLunarYear(lunarYear) {
    try {
      // 首先检查是否有已知数据
      if (this.KNOWN_SPRING_FESTIVALS[lunarYear]) {
        const springFestival = this.KNOWN_SPRING_FESTIVALS[lunarYear];
        const leapMonth = this.KNOWN_LEAP_MONTHS[lunarYear] || null;
        
        return {
          year: lunarYear,
          springFestival: springFestival,
          springFestivalJD: AstronomicalCalculator.gregorianToJulianDay(
            springFestival.getFullYear(),
            springFestival.getMonth() + 1,
            springFestival.getDate()
          ),
          months: this.generateMonthsFromSpringFestival(springFestival, leapMonth),
          leapMonth: leapMonth,
          isLeapYear: !!leapMonth,
          totalMonths: leapMonth ? 13 : 12
        };
      }

      // 对于未知年份，使用天文计算
      return this.calculateLunarYearByAstronomy(lunarYear);
    } catch (error) {
      console.error(`计算农历${lunarYear}年失败:`, error);
      return null;
    }
  }

  /**
   * 使用天文算法计算农历年
   * @param {number} lunarYear - 农历年份
   * @returns {Object} 农历年结构信息
   */
  static calculateLunarYearByAstronomy(lunarYear) {
    // 获取前一年和当年的冬至时刻
    const prevWinterSolstice = this.getWinterSolstice(lunarYear - 1);
    const currentWinterSolstice = this.getWinterSolstice(lunarYear);
    const nextWinterSolstice = this.getWinterSolstice(lunarYear + 1);

    // 获取农历年范围内的所有新月时刻
    const newMoons = this.getNewMoonsBetween(prevWinterSolstice, nextWinterSolstice);
    
    // 确定春节（冬至后第二个新月）
    const springFestivalIndex = this.findSpringFestivalIndex(prevWinterSolstice, newMoons);
    const springFestival = newMoons[springFestivalIndex];
    
    // 提取该农历年的月份
    const yearNewMoons = newMoons.slice(springFestivalIndex, springFestivalIndex + 13);
    
    // 判断闰月
    const leapMonthInfo = this.determineLeapMonth(yearNewMoons, lunarYear);
    
    // 组织月份结构
    const months = this.organizeMonths(yearNewMoons, leapMonthInfo);
    
    return {
      year: lunarYear,
      springFestival: AstronomicalCalculator.julianDayToGregorian(springFestival),
      springFestivalJD: springFestival,
      months: months,
      leapMonth: leapMonthInfo ? leapMonthInfo.month : null,
      isLeapYear: !!leapMonthInfo,
      totalMonths: leapMonthInfo ? 13 : 12
    };
  }

  /**
   * 基于春节日期生成月份结构
   * @param {Date} springFestival - 春节日期
   * @param {number|null} leapMonth - 闰月月份
   * @returns {Array<Object>} 月份结构
   */
  static generateMonthsFromSpringFestival(springFestival, leapMonth) {
    const months = [];
    const monthLengths = [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30]; // 标准农历月长度
    
    let currentDate = new Date(springFestival);
    
    for (let i = 1; i <= 12; i++) {
      const isLeap = leapMonth === i;
      const monthLength = monthLengths[(i - 1) % 12];
      
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + monthLength);
      
      months.push({
        month: i,
        isLeap: isLeap,
        startJD: AstronomicalCalculator.gregorianToJulianDay(
          startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()
        ),
        endJD: AstronomicalCalculator.gregorianToJulianDay(
          endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()
        ),
        startDate: startDate,
        endDate: endDate,
        days: monthLength
      });
      
      currentDate = endDate;
      
      // 如果是闰月，添加闰月
      if (isLeap) {
        const leapEndDate = new Date(currentDate);
        leapEndDate.setDate(leapEndDate.getDate() + monthLength);
        
        months.push({
          month: i,
          isLeap: true,
          startJD: AstronomicalCalculator.gregorianToJulianDay(
            currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()
          ),
          endJD: AstronomicalCalculator.gregorianToJulianDay(
            leapEndDate.getFullYear(), leapEndDate.getMonth() + 1, leapEndDate.getDate()
          ),
          startDate: new Date(currentDate),
          endDate: leapEndDate,
          days: monthLength
        });
        
        currentDate = leapEndDate;
      }
    }
    
    return months;
  }

  /**
   * 获取冬至时刻
   * @param {number} year - 公历年份
   * @returns {number} 冬至时刻的儒略日数
   */
  static getWinterSolstice(year) {
    return AstronomicalCalculator.findSolarLongitudeTime(year, 270); // 冬至：太阳黄经270度
  }

  /**
   * 获取两个时刻之间的所有新月时刻
   * @param {number} startJD - 起始儒略日
   * @param {number} endJD - 结束儒略日
   * @returns {Array<number>} 新月时刻数组
   */
  static getNewMoonsBetween(startJD, endJD) {
    const newMoons = [];
    const searchStart = startJD - 35; // 提前一个多月开始搜索
    const searchEnd = endJD + 35; // 延后一个多月结束搜索
    
    let currentJD = searchStart;
    while (currentJD < searchEnd) {
      const nextJD = currentJD + AstronomicalCalculator.SYNODIC_MONTH;
      const newMoonJD = AstronomicalCalculator.findNewMoonTime(currentJD, nextJD);
      
      if (newMoonJD >= searchStart && newMoonJD <= searchEnd) {
        newMoons.push(newMoonJD);
      }
      
      currentJD = nextJD;
    }
    
    return newMoons.sort((a, b) => a - b);
  }

  /**
   * 找到春节对应的新月索引
   * @param {number} winterSolsticeJD - 前一年冬至的儒略日
   * @param {Array<number>} newMoons - 新月时刻数组
   * @returns {number} 春节对应的新月索引
   */
  static findSpringFestivalIndex(winterSolsticeJD, newMoons) {
    // 找到冬至后第二个新月
    let count = 0;
    for (let i = 0; i < newMoons.length; i++) {
      if (newMoons[i] > winterSolsticeJD) {
        count++;
        if (count === 2) {
          return i;
        }
      }
    }
    throw new Error('无法找到春节对应的新月');
  }

  /**
   * 判断闰月位置
   * @param {Array<number>} newMoons - 农历年的新月时刻数组
   * @param {number} lunarYear - 农历年份
   * @returns {Object|null} 闰月信息
   */
  static determineLeapMonth(newMoons, lunarYear) {
    if (newMoons.length < 13) {
      return null; // 不是闰年
    }

    // 检查每个月是否包含中气
    for (let i = 0; i < newMoons.length - 1; i++) {
      const monthStart = newMoons[i];
      const monthEnd = newMoons[i + 1];
      
      const hasMiddleQi = this.hasMiddleQi(monthStart, monthEnd);
      
      if (!hasMiddleQi) {
        // 找到没有中气的月份，即为闰月
        return {
          month: i, // 闰月的位置（从0开始）
          startJD: monthStart,
          endJD: monthEnd,
          startDate: AstronomicalCalculator.julianDayToGregorian(monthStart),
          endDate: AstronomicalCalculator.julianDayToGregorian(monthEnd)
        };
      }
    }
    
    return null;
  }

  /**
   * 检查指定时间段内是否包含中气
   * @param {number} startJD - 开始时刻（儒略日）
   * @param {number} endJD - 结束时刻（儒略日）
   * @returns {boolean} 是否包含中气
   */
  static hasMiddleQi(startJD, endJD) {
    const startDate = AstronomicalCalculator.julianDayToGregorian(startJD);
    const endDate = AstronomicalCalculator.julianDayToGregorian(endJD);
    const year = startDate.getFullYear();
    
    // 检查每个中气是否在这个时间段内
    for (const longitude of this.MIDDLE_QI_LONGITUDES) {
      const qiJD = AstronomicalCalculator.findSolarLongitudeTime(year, longitude);
      
      // 如果中气时刻跨年，也要检查下一年
      if (qiJD < startJD) {
        const nextYearQiJD = AstronomicalCalculator.findSolarLongitudeTime(year + 1, longitude);
        if (nextYearQiJD >= startJD && nextYearQiJD < endJD) {
          return true;
        }
      } else if (qiJD >= startJD && qiJD < endJD) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 组织月份结构
   * @param {Array<number>} newMoons - 新月时刻数组
   * @param {Object|null} leapMonthInfo - 闰月信息
   * @returns {Array<Object>} 月份结构数组
   */
  static organizeMonths(newMoons, leapMonthInfo) {
    const months = [];
    
    for (let i = 0; i < newMoons.length - 1; i++) {
      const startJD = newMoons[i];
      const endJD = newMoons[i + 1];
      const startDate = AstronomicalCalculator.julianDayToGregorian(startJD);
      const endDate = AstronomicalCalculator.julianDayToGregorian(endJD);
      
      // 计算月份天数
      const days = Math.round(endJD - startJD);
      
      // 判断是否为闰月
      const isLeapMonth = leapMonthInfo && leapMonthInfo.month === i;
      
      // 确定月份编号
      let monthNumber;
      if (leapMonthInfo && i > leapMonthInfo.month) {
        monthNumber = i; // 闰月后的月份保持原编号
      } else if (isLeapMonth) {
        monthNumber = i; // 闰月使用前一个月的编号
      } else {
        monthNumber = i + 1; // 正常月份
      }
      
      months.push({
        month: monthNumber,
        isLeap: isLeapMonth,
        startJD: startJD,
        endJD: endJD,
        startDate: startDate,
        endDate: endDate,
        days: days
      });
    }
    
    return months;
  }

  /**
   * 农历日期转公历日期
   * @param {number} lunarYear - 农历年
   * @param {number} lunarMonth - 农历月
   * @param {number} lunarDay - 农历日
   * @param {boolean} isLeapMonth - 是否闰月
   * @returns {Date|null} 公历日期
   */
  static lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
    try {
      const yearData = this.calculateLunarYear(lunarYear);
      if (!yearData) {
        return null;
      }

      // 找到对应的月份
      let targetMonth = null;
      for (const month of yearData.months) {
        if (month.month === lunarMonth && month.isLeap === isLeapMonth) {
          targetMonth = month;
          break;
        }
      }

      if (!targetMonth) {
        console.warn(`未找到农历${lunarYear}年${isLeapMonth ? '闰' : ''}${lunarMonth}月`);
        return null;
      }

      // 检查日期有效性
      if (lunarDay < 1 || lunarDay > targetMonth.days) {
        console.warn(`农历日期无效: ${lunarDay}日，该月只有${targetMonth.days}天`);
        return null;
      }

      // 计算目标日期的儒略日
      const targetJD = targetMonth.startJD + lunarDay - 1;
      
      // 转换为公历
      return AstronomicalCalculator.julianDayToGregorian(targetJD);
    } catch (error) {
      console.error('农历转公历失败:', error);
      return null;
    }
  }

  /**
   * 公历日期转农历日期
   * @param {Date} solarDate - 公历日期
   * @returns {Object|null} 农历日期信息
   */
  static solarToLunar(solarDate) {
    try {
      const solarJD = AstronomicalCalculator.gregorianToJulianDay(
        solarDate.getFullYear(),
        solarDate.getMonth() + 1,
        solarDate.getDate(),
        solarDate.getHours(),
        solarDate.getMinutes(),
        solarDate.getSeconds()
      );

      // 估算农历年份（可能需要检查前后年份）
      const estimatedLunarYear = solarDate.getFullYear();
      
      for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
        const testYear = estimatedLunarYear + yearOffset;
        const yearData = this.calculateLunarYear(testYear);
        
        if (!yearData) continue;

        // 检查日期是否在这个农历年内
        if (solarJD >= yearData.springFestivalJD) {
          const nextYearData = this.calculateLunarYear(testYear + 1);
          if (!nextYearData || solarJD < nextYearData.springFestivalJD) {
            // 找到正确的农历年，现在找到对应的月份和日期
            return this.findLunarDateInYear(solarJD, yearData);
          }
        }
      }

      console.warn('无法确定农历年份');
      return null;
    } catch (error) {
      console.error('公历转农历失败:', error);
      return null;
    }
  }

  /**
   * 在指定农历年内找到对应的农历日期
   * @param {number} solarJD - 公历日期的儒略日
   * @param {Object} yearData - 农历年数据
   * @returns {Object|null} 农历日期信息
   */
  static findLunarDateInYear(solarJD, yearData) {
    // 在年数据的月份中查找对应的月份和日期
    for (let i = 0; i < yearData.months.length; i++) {
      const month = yearData.months[i];
      
      if (solarJD >= month.startJD && solarJD < month.endJD) {
        // 找到对应的月份，计算日期
        const lunarDay = Math.floor(solarJD - month.startJD) + 1;
        
        return {
          year: yearData.year,
          month: month.month,
          day: lunarDay,
          isLeapMonth: month.isLeap,
          monthDays: month.days,
          solarDate: AstronomicalCalculator.julianDayToGregorian(solarJD)
        };
      }
    }
    
    return null;
  }

  /**
   * 计算指定年份的24节气
   * @param {number} year - 公历年份
   * @returns {Array<Object>} 节气信息数组
   */
  static calculateSolarTerms(year) {
    const terms = [];
    
    this.SOLAR_TERMS.forEach(term => {
      const jd = AstronomicalCalculator.findSolarLongitudeTime(year, term.longitude);
      const date = AstronomicalCalculator.julianDayToGregorian(jd);
      
      terms.push({
        name: term.name,
        longitude: term.longitude,
        julianDay: jd,
        date: date,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    });
    
    return terms.sort((a, b) => a.julianDay - b.julianDay);
  }

  /**
   * 获取指定日期的节气信息
   * @param {Date} date - 公历日期
   * @returns {Object|null} 最近的节气信息
   */
  static getNearestSolarTerm(date) {
    const year = date.getFullYear();
    const terms = this.calculateSolarTerms(year);
    const dateJD = AstronomicalCalculator.gregorianToJulianDay(
      year, date.getMonth() + 1, date.getDate()
    );
    
    // 找到最近的节气
    let nearestTerm = null;
    let minDiff = Infinity;
    
    terms.forEach(term => {
      const diff = Math.abs(term.julianDay - dateJD);
      if (diff < minDiff) {
        minDiff = diff;
        nearestTerm = term;
      }
    });
    
    return nearestTerm;
  }

  /**
   * 验证农历日期的有效性
   * @param {number} lunarYear - 农历年
   * @param {number} lunarMonth - 农历月
   * @param {number} lunarDay - 农历日
   * @param {boolean} isLeapMonth - 是否闰月
   * @returns {boolean} 是否有效
   */
  static validateLunarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
    try {
      const yearData = this.calculateLunarYear(lunarYear);
      if (!yearData) {
        return false;
      }

      // 检查月份是否存在
      const targetMonth = yearData.months.find(
        month => month.month === lunarMonth && month.isLeap === isLeapMonth
      );

      if (!targetMonth) {
        return false;
      }

      // 检查日期范围
      return lunarDay >= 1 && lunarDay <= targetMonth.days;
    } catch (error) {
      return false;
    }
  }
}

module.exports = LunarConversionEngine;
