// 天文计算引擎 - 基于高精度天文算法
class AstronomicalCalculator {
  
  // 常数定义
  static J2000 = 2451545.0; // J2000.0 历元
  static TROPICAL_YEAR = 365.2421896698; // 回归年长度（天）
  static SYNODIC_MONTH = 29.5305888531; // 朔望月长度（天）
  
  // 太阳黄经计算用常数
  static SOLAR_LONGITUDE_TERMS = [
    // L0项 (主要项)
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.0758500],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.6910]
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
   * 公历转换为儒略日
   * @param {number} year - 年份
   * @param {number} month - 月份 (1-12)
   * @param {number} day - 日期
   * @param {number} hour - 小时 (默认12，表示中午)
   * @param {number} minute - 分钟 (默认0)
   * @param {number} second - 秒钟 (默认0)
   * @returns {number} 儒略日数
   */
  static gregorianToJulianDay(year, month, day, hour = 12, minute = 0, second = 0) {
    // 处理公历改革前的日期
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
   * 儒略日转换为公历
   * @param {number} jd - 儒略日数
   * @returns {Date} JavaScript Date对象
   */
  static julianDayToGregorian(jd) {
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

  /**
   * 计算太阳的黄经 (简化但实用的算法)
   * @param {number} jd - 儒略日数
   * @returns {number} 太阳黄经（弧度）
   */
  static solarLongitude(jd) {
    const T = (jd - this.J2000) / 36525.0; // 儒略世纪数
    
    // 太阳平均黄经（简化公式）
    let L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    
    // 太阳平均近点角
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    M = this.degToRad(M);
    
    // 中心方程
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
              0.000289 * Math.sin(3 * M);
    
    // 真太阳黄经
    L = L + C;
    
    // 章动修正（简化）
    const omega = 125.04 - 1934.136 * T;
    const nutation = -0.00569 - 0.00478 * Math.sin(this.degToRad(omega));
    L = L + nutation;
    
    // 转换为弧度并标准化
    return this.normalizeAngle(this.degToRad(L));
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
   * 计算太阳到达指定黄经的时刻
   * @param {number} year - 年份
   * @param {number} longitude - 目标黄经（度）
   * @returns {number} 儒略日数
   */
  static findSolarLongitudeTime(year, longitude) {
    const targetLon = this.degToRad(longitude);
    const jdStart = this.gregorianToJulianDay(year, 1, 1);
    const jdEnd = this.gregorianToJulianDay(year + 1, 1, 1);
    
    const precision = 1e-6;
    let jd1 = jdStart;
    let jd2 = jdEnd;
    
    // 二分法寻找目标时刻
    while (jd2 - jd1 > precision) {
      const jdMid = (jd1 + jd2) / 2;
      const sunLon = this.solarLongitude(jdMid);
      
      let diff = sunLon - targetLon;
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
