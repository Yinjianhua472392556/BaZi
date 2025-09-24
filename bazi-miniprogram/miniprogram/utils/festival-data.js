// 节日数据管理 - 使用动态计算确保长期准确性
const DynamicFestivalCalculator = require('./dynamic-festival-calculator.js');

class FestivalData {
  // 获取未来13个月内的节日 - 使用动态计算
  static getUpcomingFestivals(limit = 15) {
    try {
      // 使用动态计算器获取13个月内的节日
      const festivals = DynamicFestivalCalculator.getFutureThirteenMonthsFestivals();
      
      // 数据验证
      const isValid = DynamicFestivalCalculator.validateFestivalData(festivals);
      if (!isValid) {
        console.warn('节日数据验证失败，使用备用数据');
        return this.getFallbackFestivals(limit);
      }
      
      // 处理农历信息
      const processedFestivals = festivals.map(festival => {
        return this.enrichFestivalData(festival);
      });
      
      // 限制返回数量并按时间排序
      return processedFestivals
        .filter(festival => festival.daysUntil >= 0)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, limit);
        
    } catch (error) {
      console.error('动态节日计算失败:', error);
      return this.getFallbackFestivals(limit);
    }
  }

  // 丰富节日数据 - 添加农历信息
  static enrichFestivalData(festival) {
    // 如果是农历节日，使用原有的农历日期
    if (festival.calendar === 'lunar' && festival.lunarMonth && festival.lunarDay) {
      return {
        ...festival,
        lunarMonth: festival.lunarMonth,
        lunarDay: festival.lunarDay
      };
    }
    
    // 如果是公历节日，计算对应的农历日期
    // 这里可以集成更复杂的农历转换逻辑
    return {
      ...festival,
      lunarMonth: Math.floor(Math.random() * 12) + 1, // 临时简化处理
      lunarDay: Math.floor(Math.random() * 29) + 1   // 临时简化处理
    };
  }

  // 备用节日数据 - 当动态计算失败时使用
  static getFallbackFestivals(limit) {
    const today = new Date();
    const fallbackData = [
      { name: '国庆节', month: 10, day: 1, type: 'modern', level: 'major' },
      { name: '元旦', month: 1, day: 1, type: 'modern', level: 'major' },
      { name: '春节', month: 2, day: 10, type: 'traditional', level: 'major' }, // 近似日期
      { name: '清明节', month: 4, day: 5, type: 'traditional', level: 'major' },
      { name: '劳动节', month: 5, day: 1, type: 'modern', level: 'major' },
      { name: '端午节', month: 6, day: 10, type: 'traditional', level: 'major' }, // 近似日期
      { name: '中秋节', month: 9, day: 15, type: 'traditional', level: 'major' }, // 近似日期
      { name: '圣诞节', month: 12, day: 25, type: 'western', level: 'normal' }
    ];
    
    const currentYear = today.getFullYear();
    const festivals = [];
    
    [currentYear, currentYear + 1].forEach(year => {
      fallbackData.forEach((festival, index) => {
        const festivalDate = new Date(year, festival.month - 1, festival.day);
        const diffTime = festivalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          festivals.push({
            id: `fallback_${index}_${year}`,
            name: festival.name,
            year: year,
            month: festival.month,
            day: festival.day,
            date: festivalDate,
            daysUntil: diffDays,
            type: festival.type,
            level: festival.level,
            lunarMonth: Math.floor(Math.random() * 12) + 1,
            lunarDay: Math.floor(Math.random() * 29) + 1
          });
        }
      });
    });
    
    return festivals
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, limit);
  }
  
  // 检查指定日期是否为节日
  static getFestivalByDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return this.CORE_FESTIVALS.find(festival => 
      festival.year === year && 
      festival.month === month && 
      festival.day === day
    );
  }
  
  // 获取节日的装饰信息
  static getFestivalDecoration(festivalType) {
    const decorations = {
      traditional: {
        borderColor: '#C8860D',
        backgroundColor: '#FFF8DC',
        textColor: '#8B4513'
      },
      modern: {
        borderColor: '#DC143C',
        backgroundColor: '#FFE4E1',
        textColor: '#B22222'
      },
      western: {
        borderColor: '#228B22',
        backgroundColor: '#F0FFF0',
        textColor: '#006400'
      }
    };
    
    return decorations[festivalType] || decorations.traditional;
  }
}

module.exports = FestivalData;
