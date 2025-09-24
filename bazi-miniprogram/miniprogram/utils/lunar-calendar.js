// 农历计算工具 - 包含天干地支、星宿、黄历等传统元素
class LunarCalendar {
  // 天干地支
  static TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  static DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  static ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  // 二十八宿
  static XINGXIU = [
    '角', '亢', '氐', '房', '心', '尾', '箕',  // 东方青龙
    '斗', '牛', '女', '虚', '危', '室', '壁',  // 北方玄武  
    '奎', '娄', '胃', '昴', '毕', '觜', '参',  // 西方白虎
    '井', '鬼', '柳', '星', '张', '翼', '轸'   // 南方朱雀
  ];
  
  // 星宿吉凶
  static XINGXIU_LUCK = {
    '角': '吉', '亢': '凶', '氐': '凶', '房': '吉', '心': '凶', '尾': '吉', '箕': '吉',
    '斗': '吉', '牛': '凶', '女': '凶', '虚': '凶', '危': '凶', '室': '吉', '壁': '吉',
    '奎': '凶', '娄': '吉', '胃': '吉', '昴': '凶', '毕': '吉', '觜': '凶', '参': '吉',
    '井': '吉', '鬼': '凶', '柳': '凶', '星': '凶', '张': '吉', '翼': '凶', '轸': '吉'
  };
  
  // 十二神
  static SHIER_SHEN = ['青龙', '明堂', '天刑', '朱雀', '金匮', '天德', '白虎', '玉堂', '天牢', '玄武', '司命', '勾陈'];
  static SHIER_SHEN_LUCK = {
    '青龙': '吉', '明堂': '吉', '天刑': '凶', '朱雀': '凶', '金匮': '吉', '天德': '吉',
    '白虎': '凶', '玉堂': '吉', '天牢': '凶', '玄武': '凶', '司命': '吉', '勾陈': '凶'
  };
  
  // 农历月份名称
  static LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  
  // 农历日期名称
  static LUNAR_DAYS = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  // 计算某日的天干地支
  static getGanZhi(date) {
    // 以1900年1月31日（庚子日）为基准计算
    const baseDate = new Date(1900, 0, 31);
    const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
    
    const ganIndex = (6 + diffDays) % 10; // 庚为第6个天干（从0开始）
    const zhiIndex = (0 + diffDays) % 12; // 子为第0个地支
    
    return {
      gan: this.TIANGAN[ganIndex],
      zhi: this.DIZHI[zhiIndex],
      ganZhi: this.TIANGAN[ganIndex] + this.DIZHI[zhiIndex]
    };
  }
  
  // 计算星宿
  static getXingXiu(date) {
    // 简化算法：以日期为基础循环计算
    const dayOfYear = this.getDayOfYear(date);
    const xingxiuIndex = (dayOfYear - 1) % 28;
    const xingxiu = this.XINGXIU[xingxiuIndex];
    
    return {
      name: xingxiu,
      luck: this.XINGXIU_LUCK[xingxiu],
      full: xingxiu + '水' + this.getXingxiuAnimal(xingxiuIndex)
    };
  }
  
  // 获取星宿对应的动物
  static getXingxiuAnimal(index) {
    const animals = ['蛟', '龙', '貉', '兔', '狐', '虎', '豹', '獬', '牛', '蝠', '鼠', '燕', '猪', '獝', '狼', '狗', '鸡', '乌', '猴', '猿', '犴', '羊', '獐', '马', '鹿', '蛇', '蚓', '蚯'];
    return animals[index];
  }
  
  // 计算十二神
  static getShierShen(date) {
    const ganZhi = this.getGanZhi(date);
    const zhiIndex = this.DIZHI.indexOf(ganZhi.zhi);
    
    // 简化算法：基于地支计算十二神
    const shenIndex = (zhiIndex + 2) % 12; // 从青龙开始
    const shen = this.SHIER_SHEN[shenIndex];
    
    return {
      name: shen,
      luck: this.SHIER_SHEN_LUCK[shen]
    };
  }
  
  // 计算农历信息（简化版）
  static getLunarInfo(date, festival) {
    const ganZhi = this.getGanZhi(date);
    const xingxiu = this.getXingXiu(date);
    const shierShen = this.getShierShen(date);
    
    return {
      lunarMonth: festival.lunarMonth,
      lunarDay: festival.lunarDay,
      lunarMonthCn: this.LUNAR_MONTHS[festival.lunarMonth - 1],
      lunarDayCn: this.LUNAR_DAYS[festival.lunarDay - 1],
      ganZhi: ganZhi.ganZhi,
      ganZhiLuck: this.getGanZhiLuck(ganZhi.ganZhi),
      xingxiu: xingxiu.name,
      xingxiuFull: xingxiu.full,
      xingxiuLuck: xingxiu.luck,
      shierShen: shierShen.name,
      shierShenLuck: shierShen.luck
    };
  }
  
  // 获取天干地支吉凶
  static getGanZhiLuck(ganZhi) {
    // 简化的吉凶判断
    const luckyGanZhi = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉'];
    return luckyGanZhi.includes(ganZhi) ? '吉' : '凶';
  }
  
  // 获取一年中的第几天
  static getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  
  // 获取星期几的中文表示
  static getDayOfWeekCn(date) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }
  
  // 格式化日期
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
}

module.exports = LunarCalendar;
