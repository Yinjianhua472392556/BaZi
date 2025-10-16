// 八字显示名称管理器

class BaziDisplayManager {
  
  // 获取显示名称（优先使用自定义备注）
  static getDisplayName(birthInfo, fingerprint) {
    const customNotes = wx.getStorageSync('baziCustomNotes') || {};
    return customNotes[fingerprint] || this.generateAutoName(birthInfo);
  }
  
  // 设置自定义备注
  static setCustomNote(fingerprint, note) {
    const customNotes = wx.getStorageSync('baziCustomNotes') || {};
    if (note && note.trim()) {
      customNotes[fingerprint] = note.trim();
    } else {
      delete customNotes[fingerprint];
    }
    wx.setStorageSync('baziCustomNotes', customNotes);
    
    // 触发全局更新事件
    this.triggerUpdateEvent(fingerprint, note);
  }
  
  // 删除自定义备注
  static removeCustomNote(fingerprint) {
    this.setCustomNote(fingerprint, null);
  }
  
  // 自动生成名称
  static generateAutoName(birthInfo) {
    if (!birthInfo) {
      return '未知用户';
    }
    
    // 简单的名称生成逻辑
    const year = birthInfo.year || birthInfo.date?.split('-')[0] || '未知';
    const genderText = birthInfo.gender === 'female' ? '女' : '男';
    return `${year}年${genderText}性`;
  }
  
  // 生成八字指纹
  static generateBaziFingerprint(baziResult) {
    if (!baziResult || !baziResult.ganzhi) {
      return 'unknown';
    }
    
    // 基于干支组合生成指纹
    const ganzhi = baziResult.ganzhi;
    const fingerprint = `${ganzhi.year || ''}-${ganzhi.month || ''}-${ganzhi.day || ''}-${ganzhi.hour || ''}`;
    return fingerprint;
  }
  
  // 获取所有唯一八字记录
  static getUniqueBaziRecords() {
    console.log('🔍 开始获取唯一八字记录...')
    
    const app = getApp();
    const history = app.getBaziHistory() || [];
    const customNotes = wx.getStorageSync('baziCustomNotes') || {};
    const primaryBazi = wx.getStorageSync('primaryBazi') || null;
    
    console.log('🔍 原始历史数据:', {
      count: history.length,
      customNotesCount: Object.keys(customNotes).length,
      primaryBazi
    })
    
    const uniqueBazi = new Map();
    
    history.forEach((record, index) => {
      try {
        console.log(`🔍 处理历史记录 ${index + 1}:`, {
          id: record.id,
          timestamp: record.timestamp,
          has_bazi_result: !!record.bazi_result,
          has_birthInfo: !!record.birthInfo,
          bazi_result_structure: record.bazi_result ? Object.keys(record.bazi_result) : 'null'
        })
        
        if (!record.bazi_result) {
          console.warn(`🔍 记录 ${record.id} 缺少bazi_result，跳过`)
          return
        }
        
        const fingerprint = this.generateBaziFingerprint(record.bazi_result);
        console.log(`🔍 生成指纹: ${fingerprint}`)
        
        if (!uniqueBazi.has(fingerprint)) {
          const displayName = customNotes[fingerprint] || this.generateAutoName(record.birthInfo)
          
          uniqueBazi.set(fingerprint, {
            ...record,
            fingerprint: fingerprint,
            display_name: displayName,
            has_custom_note: !!customNotes[fingerprint],
            is_primary: fingerprint === primaryBazi,
            last_used: record.timestamp
          });
          
          console.log(`🔍 添加新的唯一八字:`, {
            fingerprint,
            display_name: displayName,
            has_custom_note: !!customNotes[fingerprint],
            is_primary: fingerprint === primaryBazi
          })
        } else {
          // 更新为最新的记录时间
          const existing = uniqueBazi.get(fingerprint);
          if (record.timestamp > existing.last_used) {
            existing.last_used = record.timestamp;
            console.log(`🔍 更新八字记录时间:`, fingerprint)
          }
        }
      } catch (error) {
        console.error(`🔍 处理记录 ${index + 1} 失败:`, error, record)
      }
    });
    
    // 排序：主要八字 > 最近使用 > 时间顺序
    const result = Array.from(uniqueBazi.values()).sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return b.is_primary - a.is_primary;
      }
      return b.last_used - a.last_used;
    });
    
    console.log('🔍 唯一八字记录处理完成:', {
      uniqueCount: result.length,
      records: result.map(r => ({
        fingerprint: r.fingerprint,
        display_name: r.display_name,
        is_primary: r.is_primary
      }))
    })
    
    return result;
  }
  
  // 设置主要八字
  static setPrimaryBazi(fingerprint) {
    wx.setStorageSync('primaryBazi', fingerprint);
    this.triggerUpdateEvent(fingerprint, null);
  }
  
  // 获取主要八字
  static getPrimaryBazi() {
    return wx.getStorageSync('primaryBazi') || null;
  }
  
  // 触发更新事件
  static triggerUpdateEvent(fingerprint, note) {
    // 可以在这里添加事件通知机制
    // 暂时使用 console.log 作为调试
    console.log('八字显示名称更新:', fingerprint, note);
  }
  
  // 获取八字对应的每日运势
  // 注意：此方法不再进行本地运势计算，需要通过后端API获取运势
  static getDailyFortunesForAllBazi(targetDate = new Date()) {
    console.log('🔍 开始获取专属运势（需要API支持）...')
    
    const uniqueBazi = this.getUniqueBaziRecords();
    console.log('🔍 唯一八字记录:', {
      count: uniqueBazi.length,
      records: uniqueBazi.map(r => ({
        fingerprint: r.fingerprint,
        display_name: r.display_name,
        has_bazi_result: !!r.bazi_result
      }))
    })
    
    const dailyFortunes = [];
    
    uniqueBazi.forEach((bazi, index) => {
      console.log(`🔍 处理第${index + 1}个八字:`, {
        fingerprint: bazi.fingerprint,
        display_name: bazi.display_name
      })
      
      // 不再进行本地计算，返回默认运势
      const fortune = this.getDefaultFortune();
      
      dailyFortunes.push({
        ...bazi,
        daily_fortune: fortune,
        needs_api_calculation: true  // 标记需要API计算
      });
    });
    
    return dailyFortunes;
  }
  
  // 获取默认运势（当计算失败时）
  static getDefaultFortune() {
    return {
      overall_score: 3,
      detailed_scores: {
        wealth: 3,
        career: 3,
        health: 3,
        love: 3,
        study: 3
      },
      lucky_elements: {
        lucky_color: "绿色",
        lucky_number: 8,
        lucky_direction: "东方"
      },
      suggestions: ["宜平常心", "注意身体"],
      warnings: ["忌急躁"],
      detailed_analysis: "今日运势平稳，保持平常心即可。"
    };
  }
  
  // 检查缓存是否有效
  static isCacheValid(timestamp) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < oneDay;
  }
  
  // 清理过期缓存并保存
  static cleanAndSaveCache(fortuneCache) {
    const cleanedCache = {};
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 保留7天
    
    Object.keys(fortuneCache).forEach(key => {
      if (fortuneCache[key].timestamp > cutoffTime) {
        cleanedCache[key] = fortuneCache[key];
      }
    });
    
    wx.setStorageSync('dailyFortuneCache', cleanedCache);
  }
  
  // 格式化日期
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 获取通用每日运势（不基于个人八字）
  static getUniversalDailyFortune(targetDate = new Date()) {
    const dateStr = this.formatDate(targetDate);
    const cacheKey = `universal-${dateStr}`;
    
    // 检查缓存
    const universalCache = wx.getStorageSync('universalFortuneCache') || {};
    if (universalCache[cacheKey] && this.isCacheValid(universalCache[cacheKey].timestamp)) {
      return universalCache[cacheKey].data;
    }
    
    // 计算通用运势
    const universalFortune = this.calculateUniversalFortune(targetDate);
    
    // 保存到缓存
    universalCache[cacheKey] = {
      data: universalFortune,
      timestamp: Date.now()
    };
    
    // 清理过期缓存
    const cleanedUniversalCache = {};
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    Object.keys(universalCache).forEach(key => {
      if (universalCache[key].timestamp > cutoffTime) {
        cleanedUniversalCache[key] = universalCache[key];
      }
    });
    
    wx.setStorageSync('universalFortuneCache', cleanedUniversalCache);
    
    return universalFortune;
  }
  
  // 计算通用运势（简化版本，不依赖复杂算法）
  static calculateUniversalFortune(targetDate) {
    // 简化的通用运势计算
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    
    // 基于日期生成简单运势
    const baseScore = 2.5 + ((day + month) % 3) * 0.5; // 2.5-4.0 之间
    const overallScore = Math.max(1, Math.min(5, Math.round(baseScore * 10) / 10));
    
    // 简单的幸运色彩轮换
    const colors = ["红色", "蓝色", "绿色", "黄色", "紫色"];
    const luckyColor = colors[(day + month) % colors.length];
    
    const luckyNumbers = this.calculateUniversalLuckyNumbers(targetDate);
    
    // 简化的五行轮换
    const wuxingArray = ["木", "火", "土", "金", "水"];
    const dailyWuxing = wuxingArray[day % wuxingArray.length];
    
    return {
      date: this.formatDate(targetDate),
      overall_score: overallScore,
      lucky_color: luckyColor,
      lucky_numbers: luckyNumbers,
      suitable_activities: this.getUniversalSuitableActivities(dailyWuxing),
      warnings: this.getUniversalWarnings(overallScore / 5),
      description: this.generateSimpleUniversalDescription(overallScore)
    };
  }
  
  // 计算通用幸运数字
  static calculateUniversalLuckyNumbers(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const num1 = (day + month) % 10;
    const num2 = (day * month) % 10;
    return [num1, num2].filter(n => n > 0);
  }
  
  // 获取通用适宜活动
  static getUniversalSuitableActivities(wuxing) {
    const activities = {
      "木": ["学习", "创作", "运动"],
      "火": ["社交", "表达", "展示"],
      "土": ["储蓄", "规划", "稳健投资"],
      "金": ["整理", "收纳", "理财"],
      "水": ["思考", "冥想", "学习"]
    };
    
    return activities[wuxing] || ["学习", "休息", "思考"];
  }
  
  // 获取通用警告
  static getUniversalWarnings(solarTermEffect) {
    if (solarTermEffect < 0.4) {
      return ["注意保暖", "忌过度劳累"];
    } else if (solarTermEffect > 0.8) {
      return ["注意防暑", "忌急躁"];
    } else {
      return ["保持平和心态"];
    }
  }
  
  // 生成简化的通用描述
  static generateSimpleUniversalDescription(score) {
    if (score >= 4) {
      return "今日运势较佳，适合积极行动，把握机会。";
    } else if (score >= 3) {
      return "今日运势平稳，宜保持平常心，稳步前进。";
    } else {
      return "今日运势较弱，宜谨慎行事，静待良机。";
    }
  }
}

module.exports = BaziDisplayManager;
