// zodiac-matching.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 生肖选项
    zodiacOptions: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    
    // 当前选择的生肖
    maleZodiac: '牛',
    femaleZodiac: '猪',
    maleZodiacIndex: 1, // 牛的索引
    femaleZodiacIndex: 11, // 猪的索引
    
    // 配对结果
    matchResult: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面加载时执行初始配对
    this.performMatching();
  },

  /**
   * 男生生肖选择变化
   */
  onMaleZodiacChange: function(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      maleZodiacIndex: index,
      maleZodiac: this.data.zodiacOptions[index]
    });
  },

  /**
   * 女生生肖选择变化
   */
  onFemaleZodiacChange: function(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      femaleZodiacIndex: index,
      femaleZodiac: this.data.zodiacOptions[index]
    });
  },

  /**
   * 执行配对分析
   */
  performMatching: function() {
    const maleZodiac = this.data.maleZodiac;
    const femaleZodiac = this.data.femaleZodiac;
    
    if (!maleZodiac || !femaleZodiac) {
      wx.showToast({
        title: '请选择生肖',
        icon: 'none'
      });
      return;
    }

    // 显示加载状态
    wx.showLoading({
      title: '分析中...',
      mask: true
    });

    // 尝试调用后端API进行配对分析
    this.callBackendAPI(maleZodiac, femaleZodiac);
  },

  /**
   * 调用后端API进行生肖配对
   */
  callBackendAPI: function(maleZodiac, femaleZodiac) {
    const self = this;
    const app = getApp();
    
    app.request({
      url: '/api/v1/zodiac-matching',
      method: 'POST',
      data: {
        zodiac1: maleZodiac,
        zodiac2: femaleZodiac
      },
      success: function(res) {
        wx.hideLoading();
        
        if (res.success) {
          // 使用后端返回的结果
          const backendResult = res.data;
          const result = self.formatBackendResult(backendResult, maleZodiac, femaleZodiac);
          
          self.setData({
            matchResult: result
          });
        } else {
          // API调用失败，使用本地算法
          console.warn('后端API调用失败，使用本地算法');
          self.fallbackToLocalCalculation(maleZodiac, femaleZodiac);
        }
      },
      fail: function(error) {
        wx.hideLoading();
        console.warn('网络请求失败，使用本地算法:', error);
        // 网络失败，使用本地算法
        self.fallbackToLocalCalculation(maleZodiac, femaleZodiac);
      }
    });
  },

  /**
   * 格式化后端返回的结果
   */
  formatBackendResult: function(backendResult, maleZodiac, femaleZodiac) {
    // 新的后端API返回了完整的数据结构
    if (backendResult.detailed_scores && backendResult.famous_couples) {
      // 使用新的多维度API返回结果
      return {
        score: backendResult.compatibility_score,
        level: backendResult.compatibility_level,
        emoji: backendResult.emoji || '💕',
        analysis: backendResult.analysis,
        advantages: backendResult.advantages,
        challenges: backendResult.challenges, 
        suggestions: backendResult.suggestions,
        scores: backendResult.detailed_scores, // 多维度评分
        famousCouples: backendResult.famous_couples, // 历史名人案例
        dimensions: backendResult.dimensions, // 维度说明
        calculationMethod: backendResult.calculation_method // 算法说明
      };
    } else {
      // 兼容旧的简单API格式
      const score = backendResult.compatibility_score;
      let level, emoji;
      
      if (score >= 90) {
        level = '天作之合';
        emoji = '💯';
      } else if (score >= 85) {
        level = '金玉良缘';
        emoji = '⭐';
      } else if (score >= 75) {
        level = '佳偶天成';
        emoji = '👫';
      } else if (score >= 65) {
        level = '需要磨合';
        emoji = '⚠️';
      } else {
        level = '谨慎考虑';
        emoji = '💔';
      }

      return {
        score: score,
        level: level,
        emoji: emoji,
        analysis: backendResult.analysis || `${maleZodiac}与${femaleZodiac}的配对分析`,
        advantages: Array.isArray(backendResult.advantages) ? backendResult.advantages.join('，') : backendResult.advantages || '性格互补，相互理解',
        challenges: '需要加强沟通和理解',
        suggestions: Array.isArray(backendResult.suggestions) ? backendResult.suggestions.join('，') : backendResult.suggestions || '保持沟通，相互包容'
      };
    }
  },

  /**
   * 降级到本地计算（移除随机性）
   */
  fallbackToLocalCalculation: function(maleZodiac, femaleZodiac) {
    const result = this.calculateZodiacMatchFixed(maleZodiac, femaleZodiac);
    this.setData({
      matchResult: result
    });
  },


  /**
   * 计算感情匹配度 (30%)
   */
  calculateEmotionScore: function(male, female) {
    const emotionMatrix = {
      '鼠': { '牛': 95, '龙': 90, '猴': 88, '马': 45, '羊': 50, '鸡': 60, '猪': 75, '虎': 70, '兔': 65, '蛇': 72, '狗': 68 },
      '牛': { '鼠': 95, '蛇': 92, '鸡': 90, '羊': 40, '马': 48, '狗': 55, '猪': 85, '虎': 65, '兔': 70, '龙': 75, '猴': 68 },
      '虎': { '猪': 94, '马': 89, '狗': 87, '猴': 42, '蛇': 45, '龙': 58, '牛': 65, '鼠': 70, '兔': 72, '鸡': 68, '羊': 75 },
      '兔': { '狗': 93, '羊': 88, '猪': 86, '鸡': 43, '龙': 47, '鼠': 65, '牛': 70, '虎': 72, '蛇': 75, '马': 68, '猴': 70 },
      '龙': { '鸡': 96, '鼠': 90, '猴': 85, '狗': 40, '兔': 47, '羊': 55, '猪': 70, '牛': 75, '虎': 58, '蛇': 80, '马': 72 },
      '蛇': { '猴': 94, '牛': 92, '鸡': 88, '猪': 41, '虎': 45, '马': 60, '龙': 80, '鼠': 72, '兔': 75, '狗': 65, '羊': 68 },
      '马': { '羊': 95, '虎': 89, '狗': 86, '鼠': 45, '牛': 48, '兔': 68, '龙': 72, '蛇': 60, '猴': 70, '鸡': 65, '猪': 75 },
      '羊': { '马': 95, '兔': 88, '猪': 85, '牛': 40, '鼠': 50, '狗': 72, '龙': 55, '虎': 75, '蛇': 68, '猴': 70, '鸡': 65 },
      '猴': { '蛇': 94, '鼠': 88, '龙': 85, '虎': 42, '猪': 46, '牛': 68, '马': 70, '兔': 70, '狗': 75, '鸡': 72, '羊': 70 },
      '鸡': { '龙': 96, '牛': 90, '蛇': 88, '兔': 43, '狗': 44, '羊': 65, '鼠': 60, '虎': 68, '马': 65, '猴': 72, '猪': 70 },
      '狗': { '兔': 93, '虎': 87, '马': 86, '龙': 40, '鸡': 44, '牛': 55, '羊': 72, '鼠': 68, '蛇': 65, '猴': 75, '猪': 80 },
      '猪': { '虎': 94, '兔': 86, '羊': 85, '蛇': 41, '猴': 46, '鸡': 70, '牛': 85, '鼠': 75, '龙': 70, '马': 75, '狗': 80 }
    };
    
    return emotionMatrix[male] ? (emotionMatrix[male][female] || 65) : 65;
  },

  /**
   * 计算性格互补度 (25%)
   */
  calculatePersonalityScore: function(male, female) {
    const personalityTraits = {
      '鼠': { active: 9, smart: 9, social: 8, stable: 6 },
      '牛': { active: 5, smart: 7, social: 6, stable: 9 },
      '虎': { active: 9, smart: 8, social: 8, stable: 5 },
      '兔': { active: 6, smart: 8, social: 7, stable: 8 },
      '龙': { active: 8, smart: 9, social: 9, stable: 6 },
      '蛇': { active: 6, smart: 9, social: 6, stable: 8 },
      '马': { active: 9, smart: 7, social: 9, stable: 5 },
      '羊': { active: 6, smart: 7, social: 7, stable: 8 },
      '猴': { active: 8, smart: 9, social: 9, stable: 6 },
      '鸡': { active: 7, smart: 8, social: 7, stable: 8 },
      '狗': { active: 7, smart: 7, social: 8, stable: 9 },
      '猪': { active: 6, smart: 6, social: 8, stable: 8 }
    };

    const maleTraits = personalityTraits[male];
    const femaleTraits = personalityTraits[female];
    
    // 计算互补性：差异适中最好
    const activeDiff = Math.abs(maleTraits.active - femaleTraits.active);
    const smartDiff = Math.abs(maleTraits.smart - femaleTraits.smart);
    const socialDiff = Math.abs(maleTraits.social - femaleTraits.social);
    const stableDiff = Math.abs(maleTraits.stable - femaleTraits.stable);
    
    // 理想差异是2-3，过小或过大都不好
    const optimalDiff = 2.5;
    const activeScore = Math.max(0, 100 - Math.abs(activeDiff - optimalDiff) * 15);
    const smartScore = Math.max(0, 100 - Math.abs(smartDiff - optimalDiff) * 15);
    const socialScore = Math.max(0, 100 - Math.abs(socialDiff - optimalDiff) * 15);
    const stableScore = Math.max(0, 100 - Math.abs(stableDiff - optimalDiff) * 15);
    
    return Math.round((activeScore + smartScore + socialScore + stableScore) / 4);
  },

  /**
   * 计算事业协调度 (20%)
   */
  calculateCareerScore: function(male, female) {
    const careerCompatibility = {
      '鼠牛': 92, '鼠虎': 75, '鼠兔': 68, '鼠龙': 88, '鼠蛇': 72, '鼠马': 55, '鼠羊': 62, '鼠猴': 85, '鼠鸡': 70, '鼠狗': 75, '鼠猪': 80,
      '牛虎': 68, '牛兔': 72, '牛龙': 78, '牛蛇': 90, '牛马': 58, '牛羊': 50, '牛猴': 70, '牛鸡': 88, '牛狗': 65, '牛猪': 82,
      '虎兔': 70, '虎龙': 65, '虎蛇': 55, '虎马': 86, '虎羊': 72, '虎猴': 48, '虎鸡': 62, '虎狗': 85, '虎猪': 90,
      '兔龙': 58, '兔蛇': 72, '兔马': 68, '兔羊': 85, '兔猴': 65, '兔鸡': 52, '兔狗': 88, '兔猪': 86,
      '龙蛇': 78, '龙马': 70, '龙羊': 62, '龙猴': 82, '龙鸡': 95, '龙狗': 45, '龙猪': 72,
      '蛇马': 65, '蛇羊': 68, '蛇猴': 92, '蛇鸡': 86, '蛇狗': 60, '蛇猪': 48,
      '马羊': 90, '马猴': 72, '马鸡': 68, '马狗': 83, '马猪': 75,
      '羊猴': 68, '羊鸡': 65, '羊狗': 70, '羊猪': 84,
      '猴鸡': 75, '猴狗': 72, '猴猪': 58,
      '鸡狗': 52, '鸡猪': 68,
      '狗猪': 82
    };
    
    const key1 = male + female;
    const key2 = female + male;
    
    return careerCompatibility[key1] || careerCompatibility[key2] || 70;
  },

  /**
   * 计算生活习惯匹配度 (15%)
   */
  calculateLifestyleScore: function(male, female) {
    const lifestyleMatrix = {
      '鼠': { '牛': 85, '龙': 88, '猴': 92, '马': 58, '羊': 65, '鸡': 72, '猪': 78, '虎': 70, '兔': 68, '蛇': 75, '狗': 72 },
      '牛': { '鼠': 85, '蛇': 90, '鸡': 88, '羊': 52, '马': 55, '狗': 68, '猪': 82, '虎': 65, '兔': 75, '龙': 78, '猴': 70 },
      '虎': { '猪': 88, '马': 85, '狗': 82, '猴': 55, '蛇': 58, '龙': 65, '牛': 65, '鼠': 70, '兔': 75, '鸡': 68, '羊': 78 },
      '兔': { '狗': 86, '羊': 84, '猪': 81, '鸡': 54, '龙': 58, '鼠': 68, '牛': 75, '虎': 75, '蛇': 78, '马': 70, '猴': 72 },
      '龙': { '鸡': 90, '鼠': 88, '猴': 80, '狗': 48, '兔': 58, '羊': 65, '猪': 72, '牛': 78, '虎': 65, '蛇': 82, '马': 75 },
      '蛇': { '猴': 87, '牛': 90, '鸡': 85, '猪': 52, '虎': 58, '马': 68, '龙': 82, '鼠': 75, '兔': 78, '狗': 68, '羊': 70 },
      '马': { '羊': 89, '虎': 85, '狗': 80, '鼠': 58, '牛': 55, '兔': 70, '龙': 75, '蛇': 68, '猴': 72, '鸡': 68, '猪': 78 },
      '羊': { '马': 89, '兔': 84, '猪': 81, '牛': 52, '鼠': 65, '狗': 75, '龙': 65, '虎': 78, '蛇': 70, '猴': 72, '鸡': 68 },
      '猴': { '蛇': 87, '鼠': 92, '龙': 80, '虎': 55, '猪': 58, '牛': 70, '马': 72, '兔': 72, '狗': 78, '鸡': 75, '羊': 72 },
      '鸡': { '龙': 90, '牛': 88, '蛇': 85, '兔': 54, '狗': 56, '羊': 68, '鼠': 72, '虎': 68, '马': 68, '猴': 75, '猪': 72 },
      '狗': { '兔': 86, '虎': 82, '马': 80, '龙': 48, '鸡': 56, '牛': 68, '羊': 75, '鼠': 72, '蛇': 68, '猴': 78, '猪': 85 },
      '猪': { '虎': 88, '兔': 81, '羊': 81, '蛇': 52, '猴': 58, '鸡': 72, '牛': 82, '鼠': 78, '龙': 72, '马': 78, '狗': 85 }
    };
    
    return lifestyleMatrix[male] ? (lifestyleMatrix[male][female] || 70) : 70;
  },

  /**
   * 计算沟通默契度 (10%)
   */
  calculateCommunicationScore: function(male, female) {
    const communicationMatrix = {
      '鼠牛': 88, '鼠虎': 72, '鼠兔': 68, '鼠龙': 85, '鼠蛇': 75, '鼠马': 58, '鼠羊': 65, '鼠猴': 90, '鼠鸡': 70, '鼠狗': 75, '鼠猪': 78,
      '牛虎': 65, '牛兔': 75, '牛龙': 78, '牛蛇': 88, '牛马': 55, '牛羊': 52, '牛猴': 72, '牛鸡': 85, '牛狗': 68, '牛猪': 80,
      '虎兔': 72, '虎龙': 68, '虎蛇': 58, '虎马': 83, '虎羊': 75, '虎猴': 52, '虎鸡': 65, '虎狗': 82, '虎猪': 86,
      '兔龙': 62, '兔蛇': 75, '兔马': 70, '兔羊': 82, '兔猴': 68, '兔鸡': 55, '兔狗': 85, '兔猪': 83,
      '龙蛇': 80, '龙马': 72, '龙羊': 65, '龙猴': 78, '龙鸡': 92, '龙狗': 48, '龙猪': 70,
      '蛇马': 68, '蛇羊': 70, '蛇猴': 88, '蛇鸡': 83, '蛇狗': 62, '蛇猪': 52,
      '马羊': 86, '马猴': 70, '马鸡': 65, '马狗': 80, '马猪': 72,
      '羊猴': 70, '羊鸡': 68, '羊狗': 72, '羊猪': 81,
      '猴鸡': 78, '猴狗': 75, '猴猪': 62,
      '鸡狗': 55, '鸡猪': 70,
      '狗猪': 79
    };
    
    const key1 = male + female;
    const key2 = female + male;
    
    return communicationMatrix[key1] || communicationMatrix[key2] || 70;
  },

  /**
   * 获取历史名人案例
   */
  getFamousCouples: function(male, female) {
    const coupleDatabase = {
      '鼠牛': [
        { name: '钱学森 & 蒋英', story: '科学家与音乐家的完美结合，理性与感性的平衡', traits: '互补合作，成就彼此' },
        { name: '梁思成 & 林徽因', story: '建筑学家夫妇，学术与生活的双重伴侣', traits: '志同道合，相互成就' }
      ],
      '虎猪': [
        { name: '周恩来 & 邓颖超', story: '革命伴侣，风雨同舟数十载', traits: '忠诚坚定，患难与共' },
        { name: '朱德 & 康克清', story: '将军与战士的革命情缘', traits: '志向一致，共同奋斗' }
      ],
      '兔狗': [
        { name: '钱钟书 & 杨绛', story: '文学伉俪，才华横溢的学者夫妇', traits: '才华相配，琴瑟和鸣' },
        { name: '老舍 & 胡絜青', story: '作家与画家的艺术人生', traits: '艺术共鸣，相互理解' }
      ],
      '龙鸡': [
        { name: '郭沫若 & 于立群', story: '诗人与才女的浪漫传奇', traits: '才情相投，浪漫多情' },
        { name: '巴金 & 萧珊', story: '作家夫妇的深情厚爱', traits: '深情专一，相伴终生' }
      ],
      '蛇猴': [
        { name: '张爱玲 & 胡兰成', story: '才女与才子的文学因缘', traits: '才华相配，情深意重' }
      ],
      '马羊': [
        { name: '徐志摩 & 陆小曼', story: '诗人与才女的浪漫爱情', traits: '浪漫多情，艺术气质' }
      ]
    };

    const key1 = male + female;
    const key2 = female + male;
    
    return coupleDatabase[key1] || coupleDatabase[key2] || [
      { name: '普通恋人', story: '平凡而真挚的爱情同样美好', traits: '真诚相待，平凡幸福' }
    ];
  },

  /**
   * 固定的生肖配对算法 - 使用多维度评分体系
   */
  calculateZodiacMatchFixed: function(male, female) {
    // 计算多维度评分
    const emotionScore = this.calculateEmotionScore(male, female);
    const personalityScore = this.calculatePersonalityScore(male, female);
    const careerScore = this.calculateCareerScore(male, female);
    const lifestyleScore = this.calculateLifestyleScore(male, female);
    const communicationScore = this.calculateCommunicationScore(male, female);

    const scores = {
      emotion: emotionScore,
      personality: personalityScore,
      career: careerScore,
      lifestyle: lifestyleScore,
      communication: communicationScore,
      overall: Math.round(emotionScore * 0.3 + personalityScore * 0.25 + careerScore * 0.2 + lifestyleScore * 0.15 + communicationScore * 0.1)
    };
    
    // 获取历史名人案例
    const famousCouples = this.getFamousCouples(male, female);
    
    // 根据综合评分确定等级和emoji
    let level, emoji;
    const score = scores.overall;
    
    if (score >= 90) {
      level = '天作之合';
      emoji = '💯';
    } else if (score >= 85) {
      level = '金玉良缘';
      emoji = '⭐';
    } else if (score >= 75) {
      level = '佳偶天成';
      emoji = '👫';
    } else if (score >= 65) {
      level = '需要磨合';
      emoji = '⚠️';
    } else {
      level = '谨慎考虑';
      emoji = '💔';
    }

    // 根据配对类型生成详细分析
    const analysis = this.generateDetailedAnalysis(male, female, scores);
    
    // 生成优势、挑战和建议
    const matchingDetails = this.generateMatchingDetails(male, female, scores);

    return {
      score: score,
      level: level,
      emoji: emoji,
      analysis: analysis,
      advantages: matchingDetails.advantages,
      challenges: matchingDetails.challenges,
      suggestions: matchingDetails.suggestions,
      scores: scores, // 多维度详细评分
      famousCouples: famousCouples // 历史名人案例
    };
  },

  /**
   * 生成详细分析
   */
  generateDetailedAnalysis: function(male, female, scores) {
    const emotionLevel = scores.emotion >= 85 ? '深厚' : scores.emotion >= 70 ? '良好' : '需要培养';
    const personalityLevel = scores.personality >= 85 ? '高度互补' : scores.personality >= 70 ? '较为互补' : '差异较大';
    const careerLevel = scores.career >= 85 ? '高度协调' : scores.career >= 70 ? '基本协调' : '需要磨合';
    
    return `${male}与${female}的配对分析：感情匹配度${emotionLevel}(${scores.emotion}分)，性格${personalityLevel}(${scores.personality}分)，事业发展${careerLevel}(${scores.career}分)。你们在生活习惯方面匹配度为${scores.lifestyle}分，沟通默契度为${scores.communication}分。综合来看，这是一个${scores.overall >= 85 ? '非常理想' : scores.overall >= 75 ? '相当不错' : scores.overall >= 65 ? '有潜力' : '需要努力'}的配对组合。`;
  },

  /**
   * 生成配对详情
   */
  generateMatchingDetails: function(male, female, scores) {
    let advantages, challenges, suggestions;
    
    // 根据各维度分数生成优势
    const strongPoints = [];
    if (scores.emotion >= 80) strongPoints.push('感情深厚');
    if (scores.personality >= 80) strongPoints.push('性格互补');
    if (scores.career >= 80) strongPoints.push('事业协调');
    if (scores.lifestyle >= 80) strongPoints.push('生活和谐');
    if (scores.communication >= 80) strongPoints.push('沟通顺畅');
    
    advantages = strongPoints.length > 0 ? strongPoints.join('，') + '，为关系发展奠定良好基础。' : '虽然各方面都有提升空间，但真诚的感情可以克服困难。';
    
    // 根据各维度分数生成挑战
    const weakPoints = [];
    if (scores.emotion < 70) weakPoints.push('感情培养');
    if (scores.personality < 70) weakPoints.push('性格磨合');
    if (scores.career < 70) weakPoints.push('事业协调');
    if (scores.lifestyle < 70) weakPoints.push('生活习惯调适');
    if (scores.communication < 70) weakPoints.push('沟通技巧');
    
    challenges = weakPoints.length > 0 ? '需要在' + weakPoints.join('、') + '方面多加努力和理解。' : '各方面匹配度都不错，主要是保持现有的好状态。';
    
    // 生成建议
    const suggestionList = [];
    if (scores.emotion < 75) suggestionList.push('多创造浪漫时光，增进感情');
    if (scores.personality < 75) suggestionList.push('理解彼此性格差异，求同存异');
    if (scores.career < 75) suggestionList.push('在事业发展上相互支持配合');
    if (scores.lifestyle < 75) suggestionList.push('协调生活节奏，培养共同兴趣');
    if (scores.communication < 75) suggestionList.push('加强沟通交流，学会倾听理解');
    
    if (suggestionList.length === 0) {
      suggestions = '保持现有的良好状态，定期为关系注入新鲜感，珍惜彼此的缘分。';
    } else {
      suggestions = suggestionList.join('；') + '。用心经营这份感情，相信会有美好的未来。';
    }
    
    return { advantages, challenges, suggestions };
  },

  /**
   * 生肖配对算法 - 基于传统六合三合理论 (保留原函数作为备用)
   */
  calculateZodiacMatch: function(male, female) {
    // 直接调用固定算法，移除随机性
    return this.calculateZodiacMatchFixed(male, female);
  },

  /**
   * 判断是否在同一个三合组
   */
  isInSanheGroup: function(zodiac1, zodiac2, sanheGroups) {
    for (let group of sanheGroups) {
      if (group.includes(zodiac1) && group.includes(zodiac2)) {
        return true;
      }
    }
    return false;
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const male = this.data.maleZodiac;
    const female = this.data.femaleZodiac;
    const result = this.data.matchResult;
    
    return {
      title: `${male}💖${female} 生肖配对结果：${result ? result.level : ''}`,
      path: '/pages/zodiac-matching/zodiac-matching',
      imageUrl: ''
    };
  }
});
