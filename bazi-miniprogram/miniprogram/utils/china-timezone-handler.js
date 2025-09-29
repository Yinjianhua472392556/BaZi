// 中国时区处理核心类 - 解决所有时区相关问题
class ChinaTimezoneHandler {
  
  // 中国标准时间常数
  static CST_OFFSET_HOURS = 8; // UTC+8
  static CST_OFFSET_MS = 8 * 60 * 60 * 1000; // 8小时的毫秒数
  static CST_OFFSET_DAYS = 8 / 24; // 8小时对应的天数（用于儒略日）
  
  /**
   * 将儒略日转换为中国标准时间的Date对象
   * @param {number} julianDay - 儒略日数
   * @returns {Date} 中国标准时间的Date对象
   */
  static julianDayToCST(julianDay) {
    // 先转换为UTC时间
    const utcDate = this.julianDayToUTC(julianDay);
    
    // 转换为CST（UTC+8）
    const cstTime = utcDate.getTime() + this.CST_OFFSET_MS;
    const cstDate = new Date(cstTime);
    
    // 确保返回的是中国时区的日期
    return new Date(
      cstDate.getUTCFullYear(),
      cstDate.getUTCMonth(),
      cstDate.getUTCDate(),
      cstDate.getUTCHours(),
      cstDate.getUTCMinutes(),
      cstDate.getUTCSeconds()
    );
  }
  
  /**
   * 将儒略日转换为UTC时间（基础转换）
   * @param {number} jd - 儒略日数
   * @returns {Date} UTC时间的Date对象
   */
  static julianDayToUTC(jd) {
    const jdInt = Math.floor(jd + 0.5);
    const fraction = jd + 0.5 - jdInt;
    
    let a = jdInt;
    if (jdInt >= 2299161) {
      const alpha = Math.floor((jdInt - 1867216.25) / 36524.25);
      a = jdInt + 1 + alpha - Math.floor(alpha / 4);
    }
    
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e);
    const month = e <= 13 ? e - 1 : e - 13;
    const year = month <= 2 ? c - 4715 : c - 4716;
    
    // 计算时分秒
    const timeOfDay = fraction * 24;
    const hour = Math.floor(timeOfDay);
    const minute = Math.floor((timeOfDay - hour) * 60);
    const second = ((timeOfDay - hour) * 60 - minute) * 60;
    
    return new Date(Date.UTC(year, month - 1, day, hour, minute, Math.floor(second)));
  }
  
  /**
   * 将公历日期转换为儒略日（考虑中国时区）
   * @param {number} year - 年份
   * @param {number} month - 月份 (1-12)
   * @param {number} day - 日期
   * @param {number} hour - 小时 (默认12，表示中午CST)
   * @param {number} minute - 分钟 (默认0)
   * @param {number} second - 秒钟 (默认0)
   * @returns {number} 儒略日数
   */
  static gregorianToJulianDayCST(year, month, day, hour = 12, minute = 0, second = 0) {
    // 先按UTC计算儒略日
    const utcJD = this.gregorianToJulianDayUTC(year, month, day, hour, minute, second);
    
    // 减去8小时的偏移量，因为输入的时间是CST
    return utcJD - this.CST_OFFSET_DAYS;
  }
  
  /**
   * 将公历日期转换为儒略日（UTC基准）
   * @param {number} year - 年份
   * @param {number} month - 月份 (1-12)
   * @param {number} day - 日期
   * @param {number} hour - 小时 (默认12)
   * @param {number} minute - 分钟 (默认0)
   * @param {number} second - 秒钟 (默认0)
   * @returns {number} 儒略日数
   */
  static gregorianToJulianDayUTC(year, month, day, hour = 12, minute = 0, second = 0) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    
    let a = Math.floor(year / 100);
    let b = 0;
    
    // 格里高利历改革：1582年10月15日之后
    if (year > 1582 || (year === 1582 && month > 10) || 
        (year === 1582 && month === 10 && day >= 15)) {
      b = 2 - a + Math.floor(a / 4);
    }
    
    const jd = Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + b - 1524.5;
    
    // 添加时分秒
    const timeOfDay = (hour + minute / 60 + second / 3600) / 24;
    
    return jd + timeOfDay;
  }
  
  /**
   * 确保日期使用中国标准时间的午夜
   * @param {Date} date - 原始日期
   * @returns {Date} CST午夜的日期
   */
  static ensureCSTMidnight(date) {
    // 获取年月日，忽略时分秒
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // 创建CST午夜时刻的日期
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  
  /**
   * 检查两个日期是否为同一天（CST标准）
   * @param {Date} date1 - 日期1
   * @param {Date} date2 - 日期2
   * @returns {boolean} 是否为同一天
   */
  static isSameDayCST(date1, date2) {
    const cst1 = this.ensureCSTMidnight(date1);
    const cst2 = this.ensureCSTMidnight(date2);
    
    return cst1.getTime() === cst2.getTime();
  }
  
  /**
   * 格式化日期为中国标准时间字符串
   * @param {Date} date - 日期对象
   * @param {boolean} includeTime - 是否包含时间
   * @returns {string} 格式化的日期字符串
   */
  static formatDateCST(date, includeTime = false) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (!includeTime) {
      return `${year}-${month}-${day}`;
    }
    
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second} CST`;
  }
  
  /**
   * 将Date对象转换为CST日期字符串（用于比较）
   * @param {Date} date - 日期对象
   * @returns {string} YYYY-MM-DD格式的日期字符串
   */
  static dateToCST(date) {
    if (!date || !(date instanceof Date)) {
      return null;
    }
    
    // 确保使用CST时区的日期部分
    const cstDate = this.ensureCSTMidnight(date);
    return this.formatDateCST(cstDate, false);
  }
  
  /**
   * 获取当前的中国标准时间
   * @returns {Date} 当前CST时间
   */
  static now() {
    const now = new Date();
    // 调整到CST时区
    const cstTime = now.getTime() + (this.CST_OFFSET_HOURS - (-now.getTimezoneOffset() / 60)) * 60 * 60 * 1000;
    return new Date(cstTime);
  }
  
  /**
   * 计算两个日期之间的天数差（CST标准）
   * @param {Date} date1 - 起始日期
   * @param {Date} date2 - 结束日期
   * @returns {number} 天数差
   */
  static daysBetweenCST(date1, date2) {
    const cst1 = this.ensureCSTMidnight(date1);
    const cst2 = this.ensureCSTMidnight(date2);
    
    const diffMs = cst2.getTime() - cst1.getTime();
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }
  
  /**
   * 验证时区转换的正确性
   * @returns {Object} 验证结果
   */
  static validateTimezoneConversion() {
    const testCases = [
      {
        name: '2025年大雪节气测试',
        utcJD: 2460670.9944, // 假设的UTC儒略日
        expectedCST: '2025-12-07'
      },
      {
        name: '春节时间测试',
        utcJD: 2460702.5, // 假设的UTC儒略日
        expectedCST: '2026-01-29'
      }
    ];
    
    const results = [];
    
    testCases.forEach(testCase => {
      const cstDate = this.julianDayToCST(testCase.utcJD);
      const cstString = this.dateToCST(cstDate);
      
      results.push({
        name: testCase.name,
        utcJD: testCase.utcJD,
        convertedCST: cstString,
        expectedCST: testCase.expectedCST,
        isCorrect: cstString === testCase.expectedCST
      });
    });
    
    return {
      testCases: results,
      allPassed: results.every(r => r.isCorrect),
      passedCount: results.filter(r => r.isCorrect).length,
      totalCount: results.length
    };
  }
}

module.exports = ChinaTimezoneHandler;
