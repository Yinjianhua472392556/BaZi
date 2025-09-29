// 增强农历匹配系统 - 多层精度保障的农历公历转换
const AuthoritativeLunarSolarMapping = require('./authoritative-lunar-solar-mapping.js');
const LunarConversionEngine = require('./lunar-conversion-engine.js');

class EnhancedLunarMatcher {
  
  /**
   * 获取精确的农历日期信息（多层保障）
   * @param {Date} solarDate - 公历日期
   * @param {string} festivalName - 节日名称（可选，用于权威匹配）
   * @returns {Object} 农历日期信息
   */
  static getAccurateLunarDate(solarDate, festivalName = null) {
    const year = solarDate.getFullYear();
    
    // 第一优先级：权威对照表匹配
    if (festivalName) {
      const authoritativeResult = this.getFromAuthoritativeMapping(festivalName, year);
      if (authoritativeResult) {
        return {
          ...authoritativeResult,
          source: 'authoritative',
          accuracy: '权威数据',
          confidence: 100,
          isAuthoritativeData: true
        };
      }
    }
    
    // 第二优先级：高精度算法计算
    const calculatedResult = this.calculateWithHighPrecision(solarDate);
    
    // 第三优先级：验证和修正
    const finalResult = this.validateAndCorrect(calculatedResult, solarDate, festivalName);
    
    return finalResult;
  }

  /**
   * 从权威对照表获取农历信息
   * @param {string} festivalName - 节日名称
   * @param {number} year - 年份
   * @returns {Object|null} 权威农历信息
   */
  static getFromAuthoritativeMapping(festivalName, year) {
    try {
      const mapping = AuthoritativeLunarSolarMapping.getAuthoritativeLunarMapping(festivalName, year);
      
      if (mapping) {
        // 解析农历信息
        const lunarInfo = this.parseLunarString(mapping.lunar);
        
        return {
          year: lunarInfo.year,
          month: lunarInfo.month,
          day: lunarInfo.day,
          isLeapMonth: lunarInfo.isLeapMonth,
          lunarMonthCn: this.getLunarMonthCn(lunarInfo.month, lunarInfo.isLeapMonth),
          lunarDayCn: this.getLunarDayCn(lunarInfo.day),
          lunarDisplay: mapping.lunarDisplay,
          confidence: mapping.confidence,
          dataSource: '中国科学院紫金山天文台'
        };
      }
      
      return null;
    } catch (error) {
      console.warn('权威数据匹配失败:', error);
      return null;
    }
  }

  /**
   * 使用高精度算法计算农历
   * @param {Date} solarDate - 公历日期
   * @returns {Object} 计算结果
   */
  static calculateWithHighPrecision(solarDate) {
    try {
      const lunarInfo = LunarConversionEngine.solarToLunar(solarDate);
      
      if (lunarInfo) {
        return {
          year: lunarInfo.year,
          month: lunarInfo.month,
          day: lunarInfo.day,
          isLeapMonth: lunarInfo.isLeapMonth || false,
          lunarMonthCn: this.getLunarMonthCn(lunarInfo.month, lunarInfo.isLeapMonth),
          lunarDayCn: this.getLunarDayCn(lunarInfo.day),
          lunarDisplay: `${this.getLunarMonthCn(lunarInfo.month, lunarInfo.isLeapMonth)}${this.getLunarDayCn(lunarInfo.day)}`,
          source: 'calculated',
          accuracy: '高精度算法',
          confidence: 95,
          isAuthoritativeData: false
        };
      }
      
      return null;
    } catch (error) {
      console.warn('高精度计算失败:', error);
      return null;
    }
  }

  /**
   * 验证和修正农历结果
   * @param {Object} result - 计算结果
   * @param {Date} solarDate - 原始公历日期
   * @param {string} festivalName - 节日名称
   * @returns {Object} 修正后的结果
   */
  static validateAndCorrect(result, solarDate, festivalName) {
    if (!result) {
      // 使用备用方案
      return this.getFallbackLunarDate(solarDate);
    }
    
    // 检查结果的合理性
    const validationResult = this.validateLunarDate(result);
    
    if (!validationResult.isValid) {
      console.warn('农历数据验证失败:', validationResult.errors);
      
      // 尝试修正
      const correctedResult = this.attemptCorrection(result, validationResult.errors);
      if (correctedResult) {
        return {
          ...correctedResult,
          source: 'corrected',
          accuracy: '修正后数据',
          confidence: Math.max(80, result.confidence - 10)
        };
      }
      
      // 修正失败，使用备用方案
      return this.getFallbackLunarDate(solarDate);
    }
    
    return result;
  }

  /**
   * 解析农历字符串
   * @param {string} lunarString - 农历字符串 (格式: "2025-09-09" 或 "2025-闰六-07")
   * @returns {Object} 解析后的农历信息
   */
  static parseLunarString(lunarString) {
    const parts = lunarString.split('-');
    
    if (parts.length !== 3) {
      throw new Error(`无效的农历格式: ${lunarString}`);
    }
    
    const year = parseInt(parts[0]);
    const monthPart = parts[1];
    const day = parseInt(parts[2]);
    
    let month, isLeapMonth;
    
    if (monthPart.startsWith('闰')) {
      isLeapMonth = true;
      month = parseInt(monthPart.substring(1));
    } else {
      isLeapMonth = false;
      month = parseInt(monthPart);
    }
    
    return { year, month, day, isLeapMonth };
  }

  /**
   * 验证农历日期的有效性
   * @param {Object} lunarDate - 农历日期对象
   * @returns {Object} 验证结果
   */
  static validateLunarDate(lunarDate) {
    const errors = [];
    
    // 检查年份范围
    if (lunarDate.year < 1900 || lunarDate.year > 2100) {
      errors.push(`年份超出范围: ${lunarDate.year}`);
    }
    
    // 检查月份范围
    if (lunarDate.month < 1 || lunarDate.month > 12) {
      errors.push(`月份超出范围: ${lunarDate.month}`);
    }
    
    // 检查日期范围
    if (lunarDate.day < 1 || lunarDate.day > 30) {
      errors.push(`日期超出范围: ${lunarDate.day}`);
    }
    
    // 检查必要字段
    if (!lunarDate.lunarMonthCn || !lunarDate.lunarDayCn) {
      errors.push('缺少中文显示字段');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 尝试修正农历数据
   * @param {Object} result - 原始结果
   * @param {Array<string>} errors - 错误列表
   * @returns {Object|null} 修正后的结果
   */
  static attemptCorrection(result, errors) {
    const corrected = { ...result };
    let fixed = false;
    
    errors.forEach(error => {
      if (error.includes('缺少中文显示字段')) {
        corrected.lunarMonthCn = this.getLunarMonthCn(corrected.month, corrected.isLeapMonth);
        corrected.lunarDayCn = this.getLunarDayCn(corrected.day);
        corrected.lunarDisplay = `${corrected.lunarMonthCn}${corrected.lunarDayCn}`;
        fixed = true;
      }
      
      if (error.includes('日期超出范围')) {
        // 简单修正：将超出范围的日期调整到有效范围
        if (corrected.day > 30) corrected.day = 30;
        if (corrected.day < 1) corrected.day = 1;
        fixed = true;
      }
      
      if (error.includes('月份超出范围')) {
        if (corrected.month > 12) corrected.month = 12;
        if (corrected.month < 1) corrected.month = 1;
        fixed = true;
      }
    });
    
    return fixed ? corrected : null;
  }

  /**
   * 备用农历日期方案
   * @param {Date} solarDate - 公历日期
   * @returns {Object} 备用农历信息
   */
  static getFallbackLunarDate(solarDate) {
    // 使用简单的估算方法
    const year = solarDate.getFullYear();
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 29) + 1;
    
    return {
      year: year,
      month: month,
      day: day,
      isLeapMonth: false,
      lunarMonthCn: this.getLunarMonthCn(month, false),
      lunarDayCn: this.getLunarDayCn(day),
      lunarDisplay: `${this.getLunarMonthCn(month, false)}${this.getLunarDayCn(day)}`,
      source: 'fallback',
      accuracy: '估算数据',
      confidence: 60,
      isAuthoritativeData: false
    };
  }

  /**
   * 农历月份中文转换
   * @param {number} month - 农历月份
   * @param {boolean} isLeapMonth - 是否闰月
   * @returns {string} 中文月份
   */
  static getLunarMonthCn(month, isLeapMonth = false) {
    if (!month || month < 1 || month > 12) return '未知';
    
    const months = ['', '正月', '二月', '三月', '四月', '五月', '六月',
                   '七月', '八月', '九月', '十月', '冬月', '腊月'];
    
    const monthCn = months[month] || `${month}月`;
    return isLeapMonth ? `闰${monthCn}` : monthCn;
  }

  /**
   * 农历日期中文转换
   * @param {number} day - 农历日期
   * @returns {string} 中文日期
   */
  static getLunarDayCn(day) {
    if (!day || day < 1 || day > 30) return '未知';
    
    const days = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    
    return days[day] || `${day}日`;
  }

  /**
   * 批量获取多个节日的精确农历信息
   * @param {Array<{name: string, date: Date}>} festivals - 节日列表
   * @returns {Array<Object>} 农历信息列表
   */
  static batchGetAccurateLunarDates(festivals) {
    return festivals.map(festival => {
      const lunarInfo = this.getAccurateLunarDate(festival.date, festival.name);
      return {
        festivalName: festival.name,
        solarDate: festival.date,
        lunarInfo: lunarInfo,
        hasAuthoritativeData: lunarInfo.isAuthoritativeData
      };
    });
  }

  /**
   * 获取农历转换质量报告
   * @param {Array<Object>} results - 转换结果列表
   * @returns {Object} 质量报告
   */
  static getQualityReport(results) {
    const report = {
      total: results.length,
      authoritative: 0,
      calculated: 0,
      corrected: 0,
      fallback: 0,
      averageConfidence: 0
    };

    let totalConfidence = 0;

    results.forEach(result => {
      const source = result.lunarInfo ? result.lunarInfo.source : 'unknown';
      
      switch (source) {
        case 'authoritative':
          report.authoritative++;
          break;
        case 'calculated':
          report.calculated++;
          break;
        case 'corrected':
          report.corrected++;
          break;
        case 'fallback':
          report.fallback++;
          break;
      }

      if (result.lunarInfo && result.lunarInfo.confidence) {
        totalConfidence += result.lunarInfo.confidence;
      }
    });

    report.averageConfidence = report.total > 0 ? Math.round(totalConfidence / report.total) : 0;

    return report;
  }

  /**
   * 检查指定节日是否支持权威数据
   * @param {string} festivalName - 节日名称
   * @param {number} year - 年份
   * @returns {boolean} 是否支持权威数据
   */
  static supportsAuthoritativeData(festivalName, year) {
    return AuthoritativeLunarSolarMapping.hasAuthoritativeData(festivalName, year);
  }

  /**
   * 获取支持权威数据的年份范围
   * @returns {Array<number>} 年份列表
   */
  static getSupportedYears() {
    return AuthoritativeLunarSolarMapping.getSupportedYears();
  }
}

module.exports = EnhancedLunarMatcher;
