// 天文计算引擎 - 基于高精度天文算法
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
   * 计算太阳的黄经 (简化但精确的算法)
   * @param {number} jd - 儒略日数
   * @returns {number} 太阳黄经（弧度）
   */
  static solarLongitude(jd) {
    const T = (jd - this.J2000) / 36525.0; // 儒略世纪数
    
    // 使用简化但精确的太阳黄经公式（基于Meeus算法）
    // 太阳几何平黄经
    let L0 = this.degToRad(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    
    // 太阳平近点角
    let M = this.degToRad(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    
    // 地心真黄经（加入椭圆轨道修正）
    let C = this.degToRad((1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
                          (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
                          0.000289 * Math.sin(3 * M));
    
    // 太阳真黄经
    let theta = L0 + C;
    
    // 太阳真近点角
    let nu = M + C;
    
    // 日地距离修正（用于光行差）
    let R = 1.000001018 * (1 - 0.01671123 * Math.cos(M) - 0.00014 * Math.cos(2 * M));
    
    // 黄经章动修正
    let omega = this.degToRad(125.04 - 1934.136 * T);
    theta = theta - this.degToRad(0.00569) - this.degToRad(0.00478 * Math.sin(omega));
    
    return this.normalizeAngle(theta);
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
