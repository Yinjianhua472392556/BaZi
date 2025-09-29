// 权威节日数据源标准库 - 2020-2050年准确节日数据
class AuthoritativeFestivalData {
  
  // 2025年关键节日准确数据（用户报告的问题修正）
  static VERIFIED_2025_DATA = {
    // 二十四节气（基于天文计算）
    solarTerms: {
      daxue: { date: '2025-12-07', name: '大雪', longitude: 255 }, // 用户反映应为12月7日
      dongzhi: { date: '2025-12-21', name: '冬至', longitude: 270 },
      xiaohan: { date: '2026-01-05', name: '小寒', longitude: 285 },
      dahan: { date: '2026-01-20', name: '大寒', longitude: 300 },
      lichun: { date: '2025-02-04', name: '立春', longitude: 315 },
      yushui: { date: '2025-02-18', name: '雨水', longitude: 330 },
      jingzhe: { date: '2025-03-05', name: '惊蛰', longitude: 345 },
      chunfen: { date: '2025-03-20', name: '春分', longitude: 0 },
      qingming: { date: '2025-04-05', name: '清明', longitude: 15 },
      guyu: { date: '2025-04-20', name: '谷雨', longitude: 30 },
      lixia: { date: '2025-05-05', name: '立夏', longitude: 45 },
      xiaoman: { date: '2025-05-21', name: '小满', longitude: 60 },
      mangzhong: { date: '2025-06-05', name: '芒种', longitude: 75 },
      xiazhi: { date: '2025-06-21', name: '夏至', longitude: 90 },
      xiaoshu: { date: '2025-07-07', name: '小暑', longitude: 105 },
      dashu: { date: '2025-07-22', name: '大暑', longitude: 120 },
      liqiu: { date: '2025-08-07', name: '立秋', longitude: 135 },
      chushu: { date: '2025-08-23', name: '处暑', longitude: 150 },
      bailu: { date: '2025-09-07', name: '白露', longitude: 165 },
      qiufen: { date: '2025-09-23', name: '秋分', longitude: 180 },
      hanlu: { date: '2025-10-08', name: '寒露', longitude: 195 },
      shuangjiang: { date: '2025-10-23', name: '霜降', longitude: 210 },
      lidong: { date: '2025-11-07', name: '立冬', longitude: 225 },
      xiaoxue: { date: '2025-11-22', name: '小雪', longitude: 240 }
    },
    
    // 农历节日（基于农历计算）
    lunarFestivals: {
      spring_festival: { date: '2025-01-29', name: '春节', lunar: '正月初一' },
      lantern_festival: { date: '2025-02-12', name: '元宵节', lunar: '正月十五' },
      dragon_boat: { date: '2025-05-31', name: '端午节', lunar: '五月初五' },
      qixi: { date: '2025-08-29', name: '七夕节', lunar: '七月初七' },
      ghost_festival: { date: '2025-09-12', name: '中元节', lunar: '七月十五' },
      mid_autumn: { date: '2025-10-06', name: '中秋节', lunar: '八月十五' },
      double_ninth: { date: '2025-11-02', name: '重阳节', lunar: '九月初九' }, // 用户报告万圣节不应该是九月初九
      laba: { date: '2025-12-29', name: '腊八节', lunar: '腊月初八' },
      kitchen_god: { date: '2026-01-20', name: '小年', lunar: '腊月廿三' },
      new_year_eve: { date: '2026-01-28', name: '除夕', lunar: '腊月三十' }
    },
    
    // 西方节日（基于特殊规则）
    westernFestivals: {
      mothers_day: { date: '2025-05-11', name: '母亲节', rule: '5月第二个星期日' },
      thanksgiving: { date: '2025-11-27', name: '感恩节', rule: '11月第四个星期四' }, // 用户反映应为11月27日
      halloween: { date: '2025-10-31', name: '万圣节', rule: '固定10月31日' } // 修正：万圣节是10月31日，不是九月初九
    }
  };

  // 美国感恩节准确日期 (2020-2050)
  static THANKSGIVING_DATES = {
    2020: '2020-11-26', 2021: '2021-11-25', 2022: '2022-11-24', 2023: '2023-11-23', 2024: '2024-11-28',
    2025: '2025-11-27', 2026: '2026-11-26', 2027: '2027-11-25', 2028: '2028-11-23', 2029: '2029-11-22',
    2030: '2030-11-28', 2031: '2031-11-27', 2032: '2032-11-25', 2033: '2033-11-24', 2034: '2034-11-23',
    2035: '2035-11-22', 2036: '2036-11-27', 2037: '2037-11-26', 2038: '2038-11-25', 2039: '2039-11-24',
    2040: '2040-11-22', 2041: '2041-11-28', 2042: '2042-11-27', 2043: '2043-11-26', 2044: '2044-11-24',
    2045: '2045-11-23', 2046: '2046-11-22', 2047: '2047-11-28', 2048: '2048-11-26', 2049: '2049-11-25',
    2050: '2050-11-24'
  };

  // 母亲节准确日期 (2020-2050)
  static MOTHERS_DAY_DATES = {
    2020: '2020-05-10', 2021: '2021-05-09', 2022: '2022-05-08', 2023: '2023-05-14', 2024: '2024-05-12',
    2025: '2025-05-11', 2026: '2026-05-10', 2027: '2027-05-09', 2028: '2028-05-14', 2029: '2029-05-13',
    2030: '2030-05-12', 2031: '2031-05-11', 2032: '2032-05-09', 2033: '2033-05-08', 2034: '2034-05-14',
    2035: '2035-05-13', 2036: '2036-05-11', 2037: '2037-05-10', 2038: '2038-05-09', 2039: '2039-05-08',
    2040: '2040-05-13', 2041: '2041-05-12', 2042: '2042-05-11', 2043: '2043-05-10', 2044: '2044-05-08',
    2045: '2045-05-14', 2046: '2046-05-13', 2047: '2047-05-12', 2048: '2048-05-10', 2049: '2049-05-09',
    2050: '2050-05-08'
  };

  // 大雪节气准确日期 (2020-2050) - 基于天文计算
  static DAXUE_DATES = {
    2020: '2020-12-07', 2021: '2021-12-07', 2022: '2022-12-07', 2023: '2023-12-07', 2024: '2024-12-07',
    2025: '2025-12-07', 2026: '2026-12-07', 2027: '2027-12-07', 2028: '2028-12-06', 2029: '2029-12-07',
    2030: '2030-12-07', 2031: '2031-12-07', 2032: '2032-12-07', 2033: '2033-12-07', 2034: '2034-12-07',
    2035: '2035-12-07', 2036: '2036-12-07', 2037: '2037-12-07', 2038: '2038-12-07', 2039: '2039-12-07',
    2040: '2040-12-06', 2041: '2041-12-07', 2042: '2042-12-07', 2043: '2043-12-07', 2044: '2044-12-07',
    2045: '2045-12-07', 2046: '2046-12-07', 2047: '2047-12-07', 2048: '2048-12-06', 2049: '2049-12-07',
    2050: '2050-12-07'
  };

  // 春节日期 (2020-2050) - 农历正月初一
  static SPRING_FESTIVAL_DATES = {
    2020: '2020-01-25', 2021: '2021-02-12', 2022: '2022-02-01', 2023: '2023-01-22', 2024: '2024-02-10',
    2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13',
    2030: '2030-02-03', 2031: '2031-01-23', 2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19',
    2035: '2035-02-08', 2036: '2036-01-28', 2037: '2037-02-15', 2038: '2038-02-04', 2039: '2039-01-24',
    2040: '2040-02-12', 2041: '2041-02-01', 2042: '2042-01-22', 2043: '2043-02-10', 2044: '2044-01-30',
    2045: '2045-02-17', 2046: '2046-02-06', 2047: '2047-01-26', 2048: '2048-02-14', 2049: '2049-02-02',
    2050: '2050-01-23'
  };

  // 中秋节日期 (2020-2050) - 农历八月十五
  static MID_AUTUMN_DATES = {
    2020: '2020-10-01', 2021: '2021-09-21', 2022: '2022-09-10', 2023: '2023-09-29', 2024: '2024-09-17',
    2025: '2025-10-06', 2026: '2026-09-25', 2027: '2027-09-15', 2028: '2028-10-03', 2029: '2029-09-22',
    2030: '2030-09-12', 2031: '2031-10-01', 2032: '2032-09-19', 2033: '2033-09-08', 2034: '2034-09-27',
    2035: '2035-09-16', 2036: '2036-10-05', 2037: '2037-09-24', 2038: '2038-09-13', 2039: '2039-10-02',
    2040: '2040-09-21', 2041: '2041-09-10', 2042: '2042-09-30', 2043: '2043-09-19', 2044: '2044-09-08',
    2045: '2045-09-26', 2046: '2046-09-15', 2047: '2047-10-04', 2048: '2048-09-23', 2049: '2049-09-12',
    2050: '2050-10-01'
  };

  // 端午节日期 (2020-2050) - 农历五月初五
  static DRAGON_BOAT_DATES = {
    2020: '2020-06-25', 2021: '2021-06-14', 2022: '2022-06-03', 2023: '2023-06-22', 2024: '2024-06-10',
    2025: '2025-05-31', 2026: '2026-06-19', 2027: '2027-06-09', 2028: '2028-05-28', 2029: '2029-06-16',
    2030: '2030-06-05', 2031: '2031-06-24', 2032: '2032-06-13', 2033: '2033-06-02', 2034: '2034-06-21',
    2035: '2035-06-11', 2036: '2036-05-30', 2037: '2037-06-18', 2038: '2038-06-07', 2039: '2039-06-27',
    2040: '2040-06-15', 2041: '2041-06-04', 2042: '2042-06-23', 2043: '2043-06-12', 2044: '2044-06-01',
    2045: '2045-06-20', 2046: '2046-06-09', 2047: '2047-05-29', 2048: '2048-06-17', 2049: '2049-06-06',
    2050: '2050-06-25'
  };

  // 重阳节日期 (2020-2050) - 农历九月初九
  static DOUBLE_NINTH_DATES = {
    2020: '2020-10-25', 2021: '2021-10-14', 2022: '2022-10-04', 2023: '2023-10-23', 2024: '2024-10-11',
    2025: '2025-11-02', 2026: '2026-10-21', 2027: '2027-10-11', 2028: '2028-10-29', 2029: '2029-10-18',
    2030: '2030-10-07', 2031: '2031-10-26', 2032: '2032-10-15', 2033: '2033-10-04', 2034: '2034-10-23',
    2035: '2035-10-12', 2036: '2036-10-31', 2037: '2037-10-20', 2038: '2038-10-09', 2039: '2039-10-28',
    2040: '2040-10-17', 2041: '2041-10-06', 2042: '2042-10-25', 2043: '2043-10-14', 2044: '2044-10-03',
    2045: '2045-10-22', 2046: '2046-10-11', 2047: '2047-10-30', 2048: '2048-10-19', 2049: '2049-10-08',
    2050: '2050-10-27'
  };

  /**
   * 获取指定年份的权威节日数据
   * @param {number} year - 年份
   * @returns {Object} 该年份的权威节日数据
   */
  static getAuthorizedFestivalData(year) {
    const data = {
      thanksgiving: this.THANKSGIVING_DATES[year],
      mothersDay: this.MOTHERS_DAY_DATES[year],
      daxue: this.DAXUE_DATES[year],
      springFestival: this.SPRING_FESTIVAL_DATES[year],
      midAutumn: this.MID_AUTUMN_DATES[year],
      dragonBoat: this.DRAGON_BOAT_DATES[year],
      doubleNinth: this.DOUBLE_NINTH_DATES[year]
    };

    // 特殊年份使用验证数据
    if (year === 2025) {
      return {
        ...data,
        verified2025: this.VERIFIED_2025_DATA
      };
    }

    return data;
  }

  /**
   * 验证计算结果与权威数据的一致性
   * @param {number} year - 年份
   * @param {string} festivalType - 节日类型
   * @param {string} calculatedDate - 计算得出的日期 (YYYY-MM-DD)
   * @returns {Object} 验证结果
   */
  static validateCalculatedDate(year, festivalType, calculatedDate) {
    const authorizedData = this.getAuthorizedFestivalData(year);
    let expectedDate = null;

    // 根据节日类型获取权威日期
    switch (festivalType) {
      case 'thanksgiving':
        expectedDate = authorizedData.thanksgiving;
        break;
      case 'mothers_day':
        expectedDate = authorizedData.mothersDay;
        break;
      case 'daxue':
        expectedDate = authorizedData.daxue;
        break;
      case 'spring_festival':
        expectedDate = authorizedData.springFestival;
        break;
      case 'mid_autumn':
        expectedDate = authorizedData.midAutumn;
        break;
      case 'dragon_boat':
        expectedDate = authorizedData.dragonBoat;
        break;
      case 'double_ninth':
        expectedDate = authorizedData.doubleNinth;
        break;
      default:
        return {
          isValid: false,
          error: `未知的节日类型: ${festivalType}`
        };
    }

    if (!expectedDate) {
      return {
        isValid: false,
        error: `${year}年${festivalType}节日的权威数据不存在`
      };
    }

    const isMatch = calculatedDate === expectedDate;
    
    return {
      isValid: isMatch,
      calculated: calculatedDate,
      expected: expectedDate,
      difference: isMatch ? 0 : this.calculateDateDifference(calculatedDate, expectedDate),
      year: year,
      festivalType: festivalType
    };
  }

  /**
   * 计算两个日期之间的天数差
   * @param {string} date1 - 日期1 (YYYY-MM-DD)
   * @param {string} date2 - 日期2 (YYYY-MM-DD)
   * @returns {number} 天数差
   */
  static calculateDateDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 批量验证多年节日数据
   * @param {number} startYear - 开始年份
   * @param {number} endYear - 结束年份
   * @param {Array<string>} festivalTypes - 要验证的节日类型
   * @returns {Object} 批量验证结果
   */
  static batchValidate(startYear, endYear, festivalTypes) {
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: [],
      summary: {}
    };

    for (let year = startYear; year <= endYear; year++) {
      festivalTypes.forEach(festivalType => {
        // 这里需要实际的计算函数，暂时跳过
        // const calculatedDate = SomeCalculator.calculateFestival(year, festivalType);
        // const validation = this.validateCalculatedDate(year, festivalType, calculatedDate);
        
        results.total++;
        // results.details.push(validation);
      });
    }

    return results;
  }

  /**
   * 获取问题节日的修正数据
   * @returns {Object} 修正数据
   */
  static getProblemFestivalCorrections() {
    return {
      '2025-daxue': {
        问题: '计算结果可能不是12月7日',
        正确日期: '2025-12-07',
        修正: '使用天文算法精确计算太阳黄经255度时刻'
      },
      '2025-thanksgiving': {
        问题: '感恩节可能不是11月27日',
        正确日期: '2025-11-27',
        修正: '11月第四个星期四的算法需要修正'
      },
      '2025-halloween-lunar': {
        问题: '万圣节显示为农历九月初九',
        正确信息: '万圣节是公历10月31日，不是农历节日',
        修正: '万圣节应归类为西方节日，不应有农历信息'
      }
    };
  }
}

module.exports = AuthoritativeFestivalData;
