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

    // 计算配对结果
    const result = this.calculateZodiacMatch(maleZodiac, femaleZodiac);
    
    this.setData({
      matchResult: result
    });
  },

  /**
   * 生肖配对算法 - 基于传统六合三合理论
   */
  calculateZodiacMatch: function(male, female) {
    // 六合配对 (最佳匹配)
    const liuheMatches = {
      '鼠': '牛', '牛': '鼠',
      '虎': '猪', '猪': '虎', 
      '兔': '狗', '狗': '兔',
      '龙': '鸡', '鸡': '龙',
      '蛇': '猴', '猴': '蛇',
      '马': '羊', '羊': '马'
    };

    // 三合配对 (优秀匹配)
    const sanheGroups = [
      ['鼠', '龙', '猴'], // 申子辰三合
      ['牛', '蛇', '鸡'], // 巳酉丑三合
      ['虎', '马', '狗'], // 寅午戌三合
      ['兔', '羊', '猪']  // 亥卯未三合
    ];

    // 相冲配对 (需要磨合)
    const chongMatches = {
      '鼠': '马', '马': '鼠',
      '牛': '羊', '羊': '牛',
      '虎': '猴', '猴': '虎',
      '兔': '鸡', '鸡': '兔',
      '龙': '狗', '狗': '龙',
      '蛇': '猪', '猪': '蛇'
    };

    // 相害配对 (谨慎考虑)
    const haiMatches = {
      '鼠': '羊', '羊': '鼠',
      '牛': '马', '马': '牛',
      '虎': '蛇', '蛇': '虎',
      '兔': '龙', '龙': '兔',
      '猴': '猪', '猪': '猴',
      '鸡': '狗', '狗': '鸡'
    };

    let score, level, emoji, analysis, advantages, challenges, suggestions;

    // 判断配对类型
    if (liuheMatches[male] === female) {
      // 六合配对
      score = Math.floor(Math.random() * 6) + 95; // 95-100分
      level = '天作之合';
      emoji = '💯';
      analysis = `${male}与${female}为传统六合配对，天生一对，相互吸引，感情深厚，是最理想的组合。你们的性格互补，能够相互理解和支持。`;
      advantages = '性格互补，默契十足，感情稳定，相互扶持，共同进步，婚姻美满。';
      challenges = '过于完美的搭配有时可能缺乏激情，需要适当制造浪漫和惊喜。';
      suggestions = '珍惜这份难得的缘分，保持沟通，共同成长，定期为感情增添新鲜感。';
    } else if (this.isInSanheGroup(male, female, sanheGroups)) {
      // 三合配对
      score = Math.floor(Math.random() * 10) + 85; // 85-94分
      level = '金玉良缘';
      emoji = '⭐';
      analysis = `${male}与${female}为三合配对，志同道合，价值观相近，能够相互扶持，共创美好未来。`;
      advantages = '价值观一致，目标明确，相互支持，事业爱情双丰收，家庭和谐。';
      challenges = '有时过于理性，需要增加感性的交流和浪漫的氛围。';
      suggestions = '发挥各自优势，相互学习，在理性中不忘感性，在稳定中寻求激情。';
    } else if (chongMatches[male] === female) {
      // 相冲配对
      score = Math.floor(Math.random() * 15) + 40; // 40-54分
      level = '谨慎考虑';
      emoji = '💔';
      analysis = `${male}与${female}为相冲配对，性格差异较大，容易产生矛盾，需要更多的理解和包容。`;
      advantages = '差异互补，能够相互学习，激发彼此的潜能，关系充满挑战性。';
      challenges = '性格冲突较多，沟通困难，需要大量的耐心和理解，容易产生争执。';
      suggestions = '加强沟通，学会换位思考，寻找共同点，化解分歧，需要更多的包容和妥协。';
    } else if (haiMatches[male] === female) {
      // 相害配对
      score = Math.floor(Math.random() * 15) + 55; // 55-69分
      level = '需要磨合';
      emoji = '⚠️';
      analysis = `${male}与${female}为相害配对，存在一定的挑战，但通过努力可以改善关系。`;
      advantages = '能够相互促进成长，在困难中增强感情，共同面对挑战。';
      challenges = '容易产生误解，需要更多的沟通和理解，关系需要持续维护。';
      suggestions = '增强沟通技巧，培养共同兴趣，多关注对方的感受，用心经营这份感情。';
    } else {
      // 一般配对
      score = Math.floor(Math.random() * 15) + 70; // 70-84分
      level = '佳偶天成';
      emoji = '👫';
      analysis = `${male}与${female}为一般配对，关系平稳，通过努力可以建立良好的感情基础。`;
      advantages = '关系稳定，相处融洽，能够建立深厚的友谊和感情基础。';
      challenges = '缺乏特别的火花，需要主动创造浪漫和激情，避免关系平淡。';
      suggestions = '多制造惊喜，保持新鲜感，深入了解对方，培养共同的兴趣爱好。';
    }

    return {
      score: score,
      level: level,
      emoji: emoji,
      analysis: analysis,
      advantages: advantages,
      challenges: challenges,
      suggestions: suggestions
    };
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
