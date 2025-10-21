// 八字显示名称管理器 - 简化版本（只处理家庭成员数据）

class BaziDisplayManager {
  
  // 获取显示名称（直接从家庭成员数据中获取）
  static getDisplayName(memberData) {
    if (!memberData) {
      return '未知用户';
    }
    
    // 优先使用自定义名称
    if (memberData.name && memberData.name.trim()) {
      return memberData.name.trim();
    }
    
    // 其次使用生成的自动名称
    return this.generateAutoName(memberData.birthInfo || memberData.userInfo);
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
  
  // 获取所有家庭成员
  static getAllFamilyMembers() {
    console.log('🔍 开始获取所有家庭成员...')
    
    const FamilyBaziManager = require('./family-bazi-manager.js');
    const members = FamilyBaziManager.getAllMembers() || [];
    
    console.log('🔍 家庭成员数据:', {
      count: members.length,
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        has_bazi_data: !!m.baziData
      }))
    });
    
    // 为每个成员添加显示名称和指纹
    const enhancedMembers = members.map(member => {
      try {
        const fingerprint = member.baziData?.bazi_result ? 
          this.generateBaziFingerprint(member.baziData.bazi_result) : 'unknown';
        
        return {
          ...member,
          fingerprint: fingerprint,
          display_name: this.getDisplayName(member),
          last_used: member.lastUsed || member.createTime || Date.now()
        };
      } catch (error) {
        console.error('处理家庭成员失败:', error, member);
        return {
          ...member,
          fingerprint: 'unknown',
          display_name: '未知用户',
          last_used: member.lastUsed || member.createTime || Date.now()
        };
      }
    });
    
    // 按最近使用时间排序
    const result = enhancedMembers.sort((a, b) => b.last_used - a.last_used);
    
    console.log('🔍 家庭成员处理完成:', {
      count: result.length,
      members: result.map(r => ({
        id: r.id,
        display_name: r.display_name,
        fingerprint: r.fingerprint
      }))
    });
    
    return result;
  }
  
  // 获取家庭成员的每日运势
  static getDailyFortunesForAllMembers(targetDate = new Date()) {
    console.log('🔍 开始获取家庭成员专属运势...');
    
    const familyMembers = this.getAllFamilyMembers();
    console.log('🔍 家庭成员:', {
      count: familyMembers.length,
      members: familyMembers.map(m => ({
        id: m.id,
        display_name: m.display_name,
        has_bazi_data: !!m.baziData
      }))
    });
    
    const dailyFortunes = [];
    
    familyMembers.forEach((member, index) => {
      console.log(`🔍 处理第${index + 1}个家庭成员:`, {
        id: member.id,
        display_name: member.display_name
      });
      
      // 不再进行本地计算，返回默认运势
      const fortune = this.getDefaultFortune();
      
      dailyFortunes.push({
        ...member,
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
