// 天文计算引擎 - 基于高精度天文算法，支持中国时区
const ChinaTimezoneHandler = require('./china-timezone-handler.js');

class AstronomicalCalculator {
  
  // 常数定义
  static J2000 = 2451545.0; // J2000.0 历元
  static TROPICAL_YEAR = 365.2421896698; // 回归年长度（天）
  static SYNODIC_MONTH = 29.5305888531; // 朔望月长度（天）
  static AU = 149597870.7; // 天文单位（千米）
  static LIGHT_SPEED = 299792458; // 光速（米/秒）
  
  // 增强的太阳黄经计算用常数（VSOP87简化版，包含更多项）
  static SOLAR_LONGITUDE_TERMS = [
    // L0项 (主要项 - 扩展版)
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.0758500],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.6910],
    [1199, 1.1096, 1577.3435],
    [990, 5.233, 5884.927],
    [902, 2.045, 26.298],
    [857, 3.508, 398.149],
    [780, 1.179, 5223.694],
    [753, 2.533, 5507.553],
    [505, 4.583, 18849.228],
    [492, 4.205, 775.523],
    [357, 2.920, 0.067],
    [317, 5.849, 11790.629]
  ];
  
  // L1项（一阶项）
  static SOLAR_LONGITUDE_L1_TERMS = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.075850],
    [4303, 2.6351, 12566.1517],
    [425, 1.590, 3.523],
    [119, 5.796, 26.298],
    [109, 2.966, 1577.344],
    [93, 2.59, 18849.23],
    [72, 1.14, 529.69],
    [68, 1.87, 398.15],
    [67, 4.41, 5507.55]
  ];
  
  // L2项（二阶项）
  static SOLAR_LONGITUDE_L2_TERMS = [
    [52919, 0, 0],
    [8720, 1.0721, 6283.0758],
    [309, 0.867, 12566.152],
    [27, 0.05, 3.52],
    [16, 5.19, 26.30],
    [16, 3.68, 155.42],
    [10, 0.76, 18849.23],
    [9, 2.06, 77713.77],
    [7, 0.83, 775.52],
    [5, 4.66, 1577.34]
  ];
  
  // 月球位置计算用主要项
  static LUNAR_LONGITUDE_TERMS = [
    [6288774, 0, 0, 1],
    [1274027, 2.1354, 1, 0],
    [658314, 0, 2, 0],
    [213618, -1.2411, 0, 2],
    [-185116, 1.5707, 1, 1],
    [-114332, 0, 0, 2],
    [58793, 2.4997, 2, -1],
    [57066, 4.0142, 1, -1],
    [53322, 1.8509, 2, 1],
    [45758, 1.2712, 0, -1],
    [-40923, 3.9726, 1, 2],
    [-34720, 5.9398, 2, 0],
    [-30383, 1.9178, 0, 1],
    [15327, 4.8434, 2, 2],
    [-12528, 0, 1, -2],
    [10980, 0.7736, 1, 1],
    [10675, 1.9679, 0, -2],
    [10034, 0.8601, 4, 0],
    [8548, 5.4806, 2, -2],
    [-7888, 5.4794, 3, 0]
  ];

  /**
   * 计算太阳黄经（增强版VSOP87）
   * @param {number} jd - 儒略日数
   * @returns {number} 太阳黄经（弧度）
   */
  static solarLongitude(jd) {
    const T = (jd - this.J2000) / 36525.0;
    
    // 计算L0项（主项）
    let L0 = 0;
    this.SOLAR_LONGITUDE_TERMS.forEach(term => {
      const [A, B, C] = term;
      L0 += A * Math.cos(B + C * T);
    });
    
    // 计算L1项（一阶项）
    let L1 = 0;
    this.SOLAR_LONGITUDE_L1_TERMS.forEach(term => {
      const [A, B, C] = term;
      L1 += A * Math.cos(B + C * T);
    });
    
    // 计算L2项（二阶项）
    let L2 = 0;
    this.SOLAR_LONGITUDE_L2_TERMS.forEach(term => {
      const [A, B, C] = term;
      L2 += A * Math.cos(B + C * T);
    });
    
    // 合成黄经
    let L = (L0 + L1 * T + L2 * T * T) / 100000000.0;
    
    // 转换为度数并标准化
    L = this.radToDeg(L);
    L = L % 360;
    if (L < 0) L += 360;
    
    // 应用修正
    const precession = this.calculatePrecession(T);
    const nutation = this.calculateNutation(T);
    const aberration = this.calculateAberration(T);
    
    L += this.radToDeg(precession + nutation + aberration);
    
    // 最终标准化
    L = L % 360;
    if (L < 0) L += 360;
    
    return this.degToRad(L);
  }

  /**
   * 儒略日转换为公历（支持中国时区）
   * @param {number} jd - 儒略日数
   * @param {boolean} useCST - 是否转换为中国标准时间（默认true）
   * @returns {Date} JavaScript Date对象
   */
  static julianDayToGregorian(jd, useCST = true) {
    if (useCST) {
      // 使用中国时区处理器进行转换
      return ChinaTimezoneHandler.julianDayToCST(jd);
    } else {
      // 原始UTC转换逻辑（保留兼容性）
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
      
      return new Date(year, month - 1, day, hour, minute, Math.floor(second));
    }
  }

  /**
   * 公历转换为儒略日（支持中国时区）
   * @param {number} year - 年份
   * @param {number} month - 月份 (1-12)
   * @param {number} day - 日期
   * @param {number} hour - 小时 (默认12，表示中午)
   * @param {number} minute - 分钟 (默认0)
   * @param {number} second - 秒钟 (默认0)
   * @param {boolean} useCST - 输入时间是否为中国标准时间（默认true）
   * @returns {number} 儒略日数
   */
  static gregorianToJulianDay(year, month, day, hour = 12, minute = 0, second = 0, useCST = true) {
    if (useCST) {
      // 使用中国时区处理器进行转换
      return ChinaTimezoneHandler.gregorianToJulianDayCST(year, month, day, hour, minute, second);
    } else {
      // 原始UTC转换逻辑（保留兼容性）
      return ChinaTimezoneHandler.gregorianToJulianDayUTC(year, month, day, hour, minute, second);
    }
  }

  /**
   * 计算岁差修正
   * @param {number} T - 儒略世纪数
   * @returns {number} 岁差修正（弧度）
   */
  static calculatePrecession(T) {
    // IAU 2000 岁差公式
    const pA = this.degToRad((5029.0966 * T + 1.1120 * T * T - 0.000006 * T * T * T) / 3600.0);
    return pA;
  }

  /**
   * 计算章动修正（IAU 2000A简化版）
   * @param {number} T - 儒略世纪数
   * @returns {number} 章动修正（弧度）
   */
  static calculateNutation(T) {
    // 月球升交点平黄经
    const omega = this.degToRad(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0);
    
    // 主要章动项
    const dpsi = -0.000083 * Math.sin(omega) - 0.000001 * Math.sin(2 * omega);
    
    return dpsi;
  }

  /**
   * 计算光行差修正
   * @param {number} T - 儒略世纪数
   * @returns {number} 光行差修正（弧度）
   */
  static calculateAberration(T) {
    // 地球轨道偏心率
    const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    
    // 太阳平均近点角
    const M = this.degToRad(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    
    // 光行差常数（弧度）
    const K = this.degToRad(20.49552 / 3600.0);
    
    // 简化的光行差修正
    return -K * Math.cos(M) - K * e * Math.cos(2 * M);
  }

  /**
   * 计算月球黄经（简化版 ELP-2000）
   * @param {number} jd - 儒略日数
   * @returns {number} 月球黄经（弧度）
   */
  static lunarLongitude(jd) {
    const T = (jd - this.J2000) / 36525.0;
    
    // 月球平均黄经
    const L = this.degToRad(218.3164477 + 481267.88123421 * T - 
              0.0015786 * T * T + T * T * T / 538841.0 - T * T * T * T / 65194000.0);
    
    // 月球距地距离的平近点角
    const D = this.degToRad(297.8501921 + 445267.1114034 * T - 
              0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0);
    
    // 太阳平均近点角
    const M = this.degToRad(357.5291092 + 35999.0502909 * T - 
              0.0001536 * T * T + T * T * T / 24490000.0);
    
    // 月球平均近点角
    const Mp = this.degToRad(134.9633964 + 477198.8675055 * T + 
               0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0);
    
    // 月球升交点平黄经
    const F = this.degToRad(93.2720950 + 483202.0175233 * T - 
              0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0);
    
    // 计算周期项修正
    let longitude = L;
    this.LUNAR_LONGITUDE_TERMS.forEach(term => {
      const [coeff, phase, d, m, mp, f] = term;
      const arg = d * D + m * M + mp * Mp + f * F;
      longitude += this.degToRad(coeff / 1000000) * Math.sin(arg + this.degToRad(phase));
    });
    
    return this.normalizeAngle(longitude);
  }

  /**
   * 寻找新月时刻（月球黄经与太阳黄经相等的时刻）
   * @param {number} jdStart - 搜索起始儒略日
   * @param {number} jdEnd - 搜索结束儒略日
   * @returns {number} 新月时刻的儒略日数
   */
  static findNewMoonTime(jdStart, jdEnd) {
    const precision = 1e-6; // 精度：约0.1秒
    let jd1 = jdStart;
    let jd2 = jdEnd;
    
    // 二分法寻找新月时刻
    while (jd2 - jd1 > precision) {
      const jdMid = (jd1 + jd2) / 2;
      const sunLon = this.solarLongitude(jdMid);
      const moonLon = this.lunarLongitude(jdMid);
      
      // 计算月日黄经差
      let diff = moonLon - sunLon;
      diff = this.normalizeAngle(diff);
      
      if (diff > Math.PI) {
        diff -= 2 * Math.PI;
      }
      
      if (diff < 0) {
        jd1 = jdMid;
      } else {
        jd2 = jdMid;
      }
    }
    
    return (jd1 + jd2) / 2;
  }

  /**
   * 计算指定年份的所有新月时刻
   * @param {number} year - 年份
   * @returns {Array<number>} 新月时刻的儒略日数组
   */
  static getNewMoonsInYear(year) {
    const jdStart = this.gregorianToJulianDay(year - 1, 12, 1);
    const jdEnd = this.gregorianToJulianDay(year + 1, 2, 1);
    const newMoons = [];
    
    // 从年初前一个月开始，寻找所有新月
    let jd = jdStart;
    while (jd < jdEnd) {
      const nextJd = jd + this.SYNODIC_MONTH;
      const newMoonJd = this.findNewMoonTime(jd, nextJd);
      
      if (newMoonJd >= jdStart && newMoonJd <= jdEnd) {
        newMoons.push(newMoonJd);
      }
      
      jd = nextJd;
    }
    
    return newMoons.sort((a, b) => a - b);
  }

  /**
   * 计算太阳到达指定黄经的时刻（修复版）
   * @param {number} year - 年份
   * @param {number} longitude - 目标黄经（度）
   * @returns {number} 儒略日数
   */
  static findSolarLongitudeTime(year, longitude) {
    const targetLon = this.degToRad(longitude);
    
    // 根据黄经确定搜索时间范围
    let searchStart, searchEnd;
    
    if (longitude >= 270 || longitude < 90) {
      // 冬季和春季节气 (270°-360°, 0°-90°)
      if (longitude >= 270) {
        // 冬季节气：前一年12月到当年2月
        searchStart = this.gregorianToJulianDay(year - 1, 11, 1);  // 前年11月
        searchEnd = this.gregorianToJulianDay(year, 2, 28);        // 当年2月
      } else {
        // 春季节气：当年2月到5月
        searchStart = this.gregorianToJulianDay(year, 1, 1);       // 当年1月
        searchEnd = this.gregorianToJulianDay(year, 5, 31);        // 当年5月
      }
    } else if (longitude >= 90 && longitude < 180) {
      // 夏季节气 (90°-180°)：当年5月到8月
      searchStart = this.gregorianToJulianDay(year, 4, 1);         // 当年4月
      searchEnd = this.gregorianToJulianDay(year, 8, 31);          // 当年8月
    } else if (longitude >= 180 && longitude < 270) {
      // 秋季节气 (180°-270°)：当年8月到11月
      searchStart = this.gregorianToJulianDay(year, 7, 1);         // 当年7月
      searchEnd = this.gregorianToJulianDay(year, 11, 30);         // 当年11月
    }
    
    // 特殊处理大雪节气（255度）
    if (longitude === 255) {
      searchStart = this.gregorianToJulianDay(year, 11, 15);       // 11月15日
      searchEnd = this.gregorianToJulianDay(year + 1, 1, 15);      // 次年1月15日
    }
    
    const precision = 1e-6;
    let bestJd = null;
    let minDiff = Infinity;
    
    // 在搜索范围内寻找最佳匹配
    for (let jd = searchStart; jd <= searchEnd; jd += 0.1) {
      const sunLon = this.solarLongitude(jd);
      const sunLonDeg = this.radToDeg(sunLon);
      
      let diff = Math.abs(sunLonDeg - longitude);
      if (diff > 180) diff = 360 - diff;  // 处理角度跨越0度的情况
      
      if (diff < minDiff) {
        minDiff = diff;
        bestJd = jd;
      }
    }
    
    if (!bestJd) {
      console.warn(`无法找到${year}年太阳黄经${longitude}度的时刻，使用备用算法`);
      return this.fallbackSolarLongitudeTime(year, longitude);
    }
    
    // 在最佳匹配点附近进行精细搜索
    let jd1 = bestJd - 1;
    let jd2 = bestJd + 1;
    
    while (jd2 - jd1 > precision) {
      const jdMid = (jd1 + jd2) / 2;
      const sunLon = this.solarLongitude(jdMid);
      const sunLonDeg = this.radToDeg(sunLon);
      
      let diff = sunLonDeg - longitude;
      
      // 处理跨年情况（360度-0度）
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      if (diff < 0) {
        jd1 = jdMid;
      } else {
        jd2 = jdMid;
      }
    }
    
    return (jd1 + jd2) / 2;
  }
  
  /**
   * 备用太阳黄经时刻计算（基于经验公式）
   * @param {number} year - 年份
   * @param {number} longitude - 目标黄经（度）
   * @returns {number} 儒略日数
   */
  static fallbackSolarLongitudeTime(year, longitude) {
    // 基于经验的节气日期估算
    const solarTermDates = {
      0: [3, 20],     // 春分
      15: [4, 5],     // 清明
      30: [4, 20],    // 谷雨
      45: [5, 5],     // 立夏
      60: [5, 21],    // 小满
      75: [6, 5],     // 芒种
      90: [6, 21],    // 夏至
      105: [7, 7],    // 小暑
      120: [7, 22],   // 大暑
      135: [8, 7],    // 立秋
      150: [8, 23],   // 处暑
      165: [9, 7],    // 白露
      180: [9, 23],   // 秋分
      195: [10, 8],   // 寒露
      210: [10, 23],  // 霜降
      225: [11, 7],   // 立冬
      240: [11, 22],  // 小雪
      255: [12, 7],   // 大雪 - 修正为12月7日
      270: [12, 22],  // 冬至
      285: [1, 5],    // 小寒（次年）
      300: [1, 20],   // 大寒（次年）
      315: [2, 4],    // 立春
      330: [2, 19]    // 雨水
    };
    
    const termDate = solarTermDates[longitude];
    if (!termDate) {
      console.error(`未知的太阳黄经: ${longitude}`);
      return this.gregorianToJulianDay(year, 6, 21); // 默认返回夏至
    }
    
    let [month, day] = termDate;
    let termYear = year;
    
    // 处理跨年的节气
    if (longitude >= 285 && longitude <= 330) {
      termYear = year + 1;
    }
    
    // 年份修正（简单的线性校正）
    const yearOffset = Math.round((year - 2000) * 0.0078); // 每年约0.0078天的偏移
    day += yearOffset;
    
    // 处理日期溢出
    if (day > 31) {
      day -= 31;
      month += 1;
    } else if (day < 1) {
      day += 31;
      month -= 1;
    }
    
    return this.gregorianToJulianDay(termYear, month, day, 12, 0, 0);
  }

  // 辅助函数
  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  static radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  static normalizeAngle(angle) {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }
}

module.exports = AstronomicalCalculator;
