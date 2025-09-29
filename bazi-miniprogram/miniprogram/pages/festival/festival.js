// 节日页面逻辑
const FestivalData = require('../../utils/festival-data.js');
const LunarCalendar = require('../../utils/lunar-calendar.js');
const AlmanacUtils = require('../../utils/almanac-utils.js');

Page({
  data: {
    festivals: [],
    loading: true,
    refreshing: false,
    lastUpdateTime: '',
    error: null
  },

  onLoad() {
    this.loadFestivals();
  },

  onShow() {
    // 每次显示页面时更新倒计时
    this.updateCountdown();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadFestivals(() => {
      wx.stopPullDownRefresh();
      this.setData({ refreshing: false });
    });
  },

  // 加载节日数据
  loadFestivals(callback) {
    this.setData({ loading: true, error: null });
    
    try {
      // 获取未来13个月内的所有节日（不限制数量）
      const upcomingFestivals = FestivalData.getUpcomingFestivals();
      const processedFestivals = upcomingFestivals.map(festival => {
        return this.processFestivalData(festival);
      });

      this.setData({
        festivals: processedFestivals,
        loading: false,
        lastUpdateTime: this.formatUpdateTime(new Date())
      });

      console.log('节日数据加载成功:', processedFestivals);
      
    } catch (error) {
      console.error('加载节日数据失败:', error);
      this.setData({
        loading: false,
        error: '加载节日数据失败，请稍后重试'
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'error',
        duration: 2000
      });
    }
    
    if (callback) callback();
  },

  // 处理节日数据
  processFestivalData(festival) {
    const { date, name, daysUntil, type } = festival;
    
    // 使用新的显示信息获取方法
    const displayInfo = FestivalData.getDisplayInfo(festival);
    
    // 获取农历信息（对于非节气类型）
    let lunarInfo = null;
    let activities = null;
    
    if (type !== 'solar_term') {
      try {
        lunarInfo = LunarCalendar.getLunarInfo(date, festival);
        activities = AlmanacUtils.getFullAlmanacInfo(date, festival, lunarInfo);
      } catch (error) {
        console.warn('获取农历信息失败:', error);
        lunarInfo = { lunarMonthCn: '未知', lunarDayCn: '未知' };
        activities = { suitable: [], unsuitable: [] };
      }
    }

    return {
      id: festival.id,
      name,
      type,
      date: typeof date === 'string' ? date : LunarCalendar.formatDate(date),
      lunarDate: displayInfo.lunarDisplay || 
                 (lunarInfo ? `${lunarInfo.lunarMonthCn}${lunarInfo.lunarDayCn}` : ''),
      dayOfWeek: typeof date === 'string' ? 
                 LunarCalendar.getDayOfWeekCn(new Date(date)) : 
                 LunarCalendar.getDayOfWeekCn(date),
      daysUntil,
      countdownText: this.getCountdownText(daysUntil),
      
      // 新增字段
      displayName: displayInfo.displayName,
      typeDisplay: displayInfo.typeDisplay,
      importance: displayInfo.importance,
      isToday: displayInfo.isToday,
      isTomorrow: displayInfo.isTomorrow,
      isThisWeek: displayInfo.isThisWeek,
      
      // 高精度数据标识
      isHighPrecision: festival.isHighPrecision || false,
      precisionLevel: festival.precisionLevel || 'calculated',
      precisionDisplay: festival.precisionDisplay || '📊计算',
      precisionDescription: festival.precisionDescription || '天文算法计算',
      precisionColor: festival.precisionColor || '#32CD32',
      dataSource: festival.dataSource || { source: '动态计算', reliability: 'standard' },
      qualityLevel: festival.qualityLevel || 'standard_grade',
      
      // 传统信息（仅对非节气类型）
      ganZhi: lunarInfo ? `${lunarInfo.ganZhi || ''}·${lunarInfo.ganZhiLuck || ''}` : '',
      shierShen: lunarInfo ? `${lunarInfo.shierShen || ''}·${lunarInfo.shierShenLuck || ''}` : '',
      xingXiu: lunarInfo ? `${lunarInfo.xingxiuFull || ''}·${lunarInfo.xingxiuLuck || ''}` : '',
      
      // 宜忌活动（仅对非节气类型）
      activities: activities || { suitable: [], unsuitable: [] },
      
      // 装饰样式
      decoration: displayInfo.decoration,
      
      // 节气特殊信息
      isolarTerm: type === 'solar_term',
      longitude: festival.longitude || null
    };
  },

  // 获取倒计时文本
  getCountdownText(daysUntil) {
    if (daysUntil === 0) {
      return '今天';
    } else if (daysUntil === 1) {
      return '明天';
    } else if (daysUntil === 2) {
      return '后天';
    } else {
      return `距离${daysUntil}天`;
    }
  },

  // 更新倒计时
  updateCountdown() {
    if (this.data.festivals.length === 0) return;

    const festivals = this.data.festivals.map(festival => {
      // 重新计算倒计时
      const festivalDate = new Date(festival.date);
      const today = new Date();
      const diffTime = festivalDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...festival,
        daysUntil: diffDays >= 0 ? diffDays : 0,
        countdownText: this.getCountdownText(diffDays >= 0 ? diffDays : 0)
      };
    });

    this.setData({ festivals });
  },

  // 格式化更新时间
  formatUpdateTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 点击节日卡片
  onFestivalTap(e) {
    const { festival } = e.currentTarget.dataset;
    console.log('点击节日:', festival);
    
    // 可以跳转到节日详情页或显示更多信息
    wx.showModal({
      title: festival.name,
      content: `${festival.lunarDate} (${festival.date})\n${festival.dayOfWeek}\n\n值神：${festival.ganZhi}\n十二神：${festival.shierShen}\n星宿：${festival.xingXiu}`,
      confirmText: '知道了',
      showCancel: false
    });
  },

  // 重试加载
  onRetry() {
    this.loadFestivals();
  },

  // 分享节日信息
  onShareAppMessage() {
    return {
      title: '最近节日 - 传统节日黄历查询',
      path: '/pages/festival/festival',
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '最近节日 - 传统节日黄历查询',
      imageUrl: ''
    };
  }
});
