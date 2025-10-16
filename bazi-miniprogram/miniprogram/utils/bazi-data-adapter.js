// 八字数据标准化适配器
// 解决后端API返回格式与前端期望格式不匹配的问题

class BaziDataAdapter {
  
  /**
   * 将后端API返回的八字数据标准化为前端统一格式
   * @param {Object} backendResponse - 后端API完整响应
   * @returns {Object} 标准化的八字数据
   */
  static normalizeBaziData(backendResponse) {
    if (!backendResponse || !backendResponse.success || !backendResponse.data) {
      throw new Error('无效的后端响应数据');
    }
    
    const { data } = backendResponse;
    
    // 标准化八字数据 - 转换字段名称
    const standardBazi = {
      year_pillar: data.bazi.year,      // 年柱：己巳
      month_pillar: data.bazi.month,    // 月柱：丁丑  
      day_pillar: data.bazi.day,        // 日柱：庚辰
      hour_pillar: data.bazi.hour       // 时柱：癸未
    };
    
    // 返回标准化的完整数据结构
    return {
      // 核心八字数据（DailyFortuneCalculator需要的格式）
      bazi_result: standardBazi,
      
      // 详细排盘信息
      paipan: data.paipan,
      
      // 五行分析
      wuxing: data.wuxing,
      
      // 性格分析等
      analysis: data.analysis,
      
      // 大运信息
      dayun: data.dayun,
      
      // 今日运势
      today_fortune: data.today_fortune,
      
      // 历法信息
      lunar_info: data.lunar_info,
      solar_info: data.solar_info,
      calendar_type: data.calendar_type,
      
      // 元数据
      timestamp: backendResponse.timestamp,
      algorithm_version: backendResponse.algorithm_version
    };
  }
  
  /**
   * 生成稳定的个人标识符
   * @param {Object} birthInfo - 出生信息
   * @returns {String} 个人唯一标识
   */
  static generatePersonId(birthInfo) {
    const { year, month, day, hour, gender, calendarType } = birthInfo;
    return `${calendarType}-${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${hour.toString().padStart(2, '0')}-${gender}`;
  }
  
  /**
   * 生成显示用的名称
   * @param {Object} birthInfo - 出生信息  
   * @param {String} customName - 自定义名称
   * @returns {String} 显示名称
   */
  static generateDisplayName(birthInfo, customName = null) {
    if (customName) {
      return customName;
    }
    
    const { year, gender, hour } = birthInfo;
    const genderText = gender === 'male' ? '男' : '女';
    
    // 时辰映射
    const hourMapping = {
      23: "子时", 0: "子时", 1: "丑时", 2: "丑时",
      3: "寅时", 4: "寅时", 5: "卯时", 6: "卯时", 
      7: "辰时", 8: "辰时", 9: "巳时", 10: "巳时",
      11: "午时", 12: "午时", 13: "未时", 14: "未时",
      15: "申时", 16: "申时", 17: "酉时", 18: "酉时",
      19: "戌时", 20: "戌时", 21: "亥时", 22: "亥时"
    };
    
    const timeText = hourMapping[hour] || '未知时';
    return `${year}年${genderText}(${timeText})`;
  }
  
  /**
   * 验证八字数据完整性
   * @param {Object} baziData - 八字数据
   * @returns {Boolean} 是否有效
   */
  static validateBaziData(baziData) {
    if (!baziData || !baziData.bazi_result) {
      return false;
    }
    
    const { year_pillar, month_pillar, day_pillar, hour_pillar } = baziData.bazi_result;
    
    return !!(year_pillar && month_pillar && day_pillar && hour_pillar);
  }
  
  /**
   * 提取DailyFortuneCalculator需要的数据格式
   * @param {Object} normalizedData - 标准化数据
   * @returns {Object} 运势计算器所需格式
   */
  static extractFortuneCalculatorData(normalizedData) {
    if (!this.validateBaziData(normalizedData)) {
      throw new Error('八字数据不完整，无法进行运势计算');
    }
    
    return normalizedData.bazi_result;
  }
}

module.exports = BaziDataAdapter;
