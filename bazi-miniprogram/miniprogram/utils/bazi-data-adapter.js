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
   * 生成显示用的名称 - 综合智能标识方案
   * @param {Object} birthInfo - 出生信息  
   * @param {String} customName - 自定义名称
   * @returns {String} 显示名称
   */
  static generateDisplayName(birthInfo, customName = null) {
    // 1. 优先使用自定义名称
    if (customName) {
      return customName;
    }
    
    const { year, month, day, hour, gender } = birthInfo;
    const genderText = gender === 'male' ? '男' : '女';
    
    // 2. 判断是否需要显示完整日期
    if (this.shouldShowFullDate(birthInfo)) {
      return `${year}年${month}月${day}日${genderText}`;
    }
    
    // 3. 使用生肖+时辰的简洁标识
    const shengxiao = this.getShengxiao(year);
    const timeText = this.getTimeText(hour);
    return `${shengxiao}${genderText}·${timeText}`;
  }
  
  /**
   * 判断是否需要显示完整日期
   * @param {Object} birthInfo - 出生信息
   * @returns {Boolean} 是否显示完整日期
   */
  static shouldShowFullDate(birthInfo) {
    const { month, day } = birthInfo;
    
    // 特殊日期：重要节日或纪念日
    const specialDates = [
      '1-1',   // 元旦
      '2-14',  // 情人节
      '3-8',   // 妇女节
      '5-1',   // 劳动节
      '6-1',   // 儿童节
      '8-15',  // 中秋节(农历，这里用公历近似)
      '10-1',  // 国庆节
      '12-25'  // 圣诞节
    ];
    
    const dateKey = `${month}-${day}`;
    return specialDates.includes(dateKey);
  }
  
  /**
   * 获取生肖
   * @param {Number} year - 年份
   * @returns {String} 生肖
   */
  static getShengxiao(year) {
    const shengxiaoList = [
      '鼠', '牛', '虎', '兔', '龙', '蛇', 
      '马', '羊', '猴', '鸡', '狗', '猪'
    ];
    
    // 计算生肖索引 (1900年为鼠年)
    const baseYear = 1900;
    const index = (year - baseYear) % 12;
    return shengxiaoList[index] || '鼠';
  }
  
  /**
   * 获取优雅的时辰表示
   * @param {Number} hour - 小时 (0-23)
   * @returns {String} 时辰
   */
  static getTimeText(hour) {
    const timeMapping = {
      23: "子", 0: "子", 1: "丑", 2: "丑",
      3: "寅", 4: "寅", 5: "卯", 6: "卯", 
      7: "辰", 8: "辰", 9: "巳", 10: "巳",
      11: "午", 12: "午", 13: "未", 14: "未",
      15: "申", 16: "申", 17: "酉", 18: "酉",
      19: "戌", 20: "戌", 21: "亥", 22: "亥"
    };
    
    return timeMapping[hour] || '子';
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
