// result.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    resultData: null,
    showAnalysisModal: false,
    showAdPlaceholder: false,
    lunarDate: '',
    baziString: '',
    wuxingString: '',
    wuxingLack: '',
    shengxiao: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('result页面加载，参数:', options);
    
    let resultData = null;
    
    // 1. 首先尝试从URL参数中获取数据
    if (options.data) {
      try {
        resultData = JSON.parse(decodeURIComponent(options.data));
        console.log('从URL参数获取数据成功:', resultData);
      } catch (error) {
        console.error('解析URL参数失败:', error);
      }
    }
    
    // 2. 从全局数据中获取
    if (!resultData) {
      const app = getApp();
      if (app.globalData.baziResult) {
        resultData = app.globalData.baziResult;
        console.log('从全局数据获取数据成功:', resultData);
      }
    }
    
    // 3. 从缓存中获取
    if (!resultData) {
      const cachedResult = wx.getStorageSync('lastBaziResult');
      if (cachedResult) {
        resultData = cachedResult;
        console.log('从缓存获取数据成功:', resultData);
      }
    }
    
    // 4. 处理获取到的数据
    if (resultData) {
      this.setData({
        resultData: resultData
      });
      this.processResultData();
    } else {
      // 如果没有数据，显示提示并返回首页
      console.error('未找到计算结果数据');
      wx.showModal({
        title: '提示',
        content: '未找到计算结果，请重新进行八字测算',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    }
  },

  /**
   * 处理结果数据，生成显示用的字符串
   */
  processResultData() {
    const { resultData } = this.data;
    if (!resultData) return;

    try {
      // 处理农历日期
      const lunarInfo = resultData.lunar_info || {};
      const lunarDate = this.generateLunarDate(lunarInfo);

      // 处理八字字符串
      const bazi = resultData.bazi || {};
      const baziString = `${bazi.year || '庚子'}-${bazi.month || '乙酉'}-${bazi.day || '戊辰'}-${bazi.hour || '壬子'}`;

      // 处理五行字符串
      const wuxing = resultData.wuxing || {};
      const wuxingString = this.generateWuxingString(bazi);

      // 计算五行缺陷
      const wuxingLack = this.calculateWuxingLack(wuxing);

      // 计算生肖
      const shengxiao = this.calculateShengxiao(resultData.user_info?.birth_date);

      this.setData({
        lunarDate,
        baziString,
        wuxingString,
        wuxingLack,
        shengxiao
      });

    } catch (error) {
      console.error('处理结果数据出错:', error);
      wx.showToast({
        title: '数据处理出错',
        icon: 'none'
      });
    }
  },

  /**
   * 生成农历日期字符串
   */
  generateLunarDate(lunarInfo) {
    if (!lunarInfo || !lunarInfo.year) {
      return '八月初六';
    }
    
    // 农历月份映射
    const lunarMonths = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    const lunarDays = [
      '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

    // 使用真实的农历信息
    const year = lunarInfo.year;
    const month = lunarInfo.month || 1;
    const day = lunarInfo.day || 1;
    
    const monthStr = lunarMonths[month - 1] || '正月';
    const dayStr = lunarDays[day] || '初一';
    
    return `${year}年${monthStr}${dayStr}`;
  },

  /**
   * 生成五行字符串
   */
  generateWuxingString(bazi) {
    if (!bazi) return '金水-木金-土土-水水';

    const wuxingMap = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };

    const result = [];
    ['year', 'month', 'day', 'hour'].forEach(key => {
      const zhu = bazi[key] || '甲子';
      const gan = zhu[0];
      const zhi = zhu[1];
      const ganWuxing = wuxingMap[gan] || '木';
      const zhiWuxing = wuxingMap[zhi] || '水';
      result.push(`${ganWuxing}${zhiWuxing}`);
    });

    return result.join('-');
  },

  /**
   * 计算五行缺陷
   */
  calculateWuxingLack(wuxing) {
    if (!wuxing) return '火';

    const wuxingElements = ['木', '火', '土', '金', '水'];
    const lackElements = [];

    wuxingElements.forEach(element => {
      if (!wuxing[element] || wuxing[element] === 0) {
        lackElements.push(element);
      }
    });

    return lackElements.length > 0 ? lackElements.join('、') : '无';
  },

  /**
   * 计算生肖
   */
  calculateShengxiao(birthDate) {
    if (!birthDate) return '鼠';

    const year = parseInt(birthDate.split('-')[0]);
    const shengxiaoList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const index = (year - 1900) % 12;
    return shengxiaoList[index] || '鼠';
  },

  /**
   * 显示分析结果弹窗
   */
  showAnalysis() {
    console.log('显示分析结果');
    this.setData({
      showAnalysisModal: true
    });
  },

  /**
   * 隐藏分析结果弹窗
   */
  hideAnalysis() {
    this.setData({
      showAnalysisModal: false
    });
  },

  /**
   * 防止弹窗关闭
   */
  preventClose() {
    // 阻止事件冒泡，防止点击内容区域关闭弹窗
  },

  /**
   * 重新计算
   */
  calculateAgain() {
    console.log('重新计算');
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 图片加载错误处理
   */
  onImageError(e) {
    console.log('图片加载失败:', e.detail);
    this.setData({
      showAdPlaceholder: true
    });
  },

  /**
   * 图片加载成功处理
   */
  onImageLoad(e) {
    console.log('图片加载成功:', e.detail);
    this.setData({
      showAdPlaceholder: false
    });
  },

  /**
   * 广告加载成功处理
   */
  onAdLoad(e) {
    console.log('Banner广告加载成功:', e.detail);
    // 可以在这里添加统计逻辑
  },

  /**
   * 广告加载失败处理
   */
  onAdError(e) {
    console.log('Banner广告加载失败:', e.detail);
    // 可以在这里添加错误统计或备用方案
  },

  /**
   * 广告点击处理
   */
  onAdClick(e) {
    console.log('Banner广告被点击:', e.detail);
    // 可以在这里添加点击统计
  },

  /**
   * 激励视频奖励处理
   */
  onVideoReward(e) {
    console.log('用户获得视频奖励:', e.detail);
    
    // 给用户解锁高级运势功能
    wx.showModal({
      title: '奖励获得',
      content: '恭喜您获得高级运势分析！现在可以查看更详细的运势解读。',
      showCancel: false,
      success: () => {
        // 可以在这里解锁高级功能
        this.unlockAdvancedFeatures();
      }
    });
  },

  /**
   * 激励视频错误处理
   */
  onVideoError(e) {
    console.log('激励视频广告错误:', e.detail);
    wx.showToast({
      title: '视频加载失败，请稍后重试',
      icon: 'none'
    });
  },

  /**
   * 解锁高级功能
   */
  unlockAdvancedFeatures() {
    // 这里可以实现解锁高级功能的逻辑
    // 比如显示更详细的分析内容、解锁特殊功能等
    
    // 示例：更新页面数据，显示高级内容
    const { resultData } = this.data;
    if (resultData && resultData.analysis) {
      // 可以在这里添加高级分析内容
      const enhancedAnalysis = {
        ...resultData.analysis,
        advanced_personality: '高级性格分析：根据您的八字，您具有独特的领导才能...',
        lucky_colors: ['红色', '金色', '紫色'],
        lucky_numbers: [3, 8, 9],
        lucky_direction: '正南方',
        relationship_advice: '在感情中，您需要更多的耐心和理解...'
      };
      
      this.setData({
        'resultData.analysis': enhancedAnalysis
      });
      
      wx.showToast({
        title: '高级功能已解锁',
        icon: 'success'
      });
    }
  },

  /**
   * 保存到历史记录
   */
  saveToHistory() {
    const { resultData } = this.data;
    if (!resultData) {
      wx.showToast({
        title: '没有可保存的数据',
        icon: 'none'
      });
      return;
    }

    // 准备保存的数据，包含显示信息
    const saveData = {
      ...resultData,
      displayInfo: {
        lunarDate: this.data.lunarDate,
        baziString: this.data.baziString,
        wuxingString: this.data.wuxingString,
        wuxingLack: this.data.wuxingLack,
        shengxiao: this.data.shengxiao
      }
    };

    // 调用全局的保存方法
    const app = getApp();
    const success = app.saveToHistory(saveData);
    
    if (success) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 关闭弹窗
      this.hideAnalysis();
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    const { lunarDate, baziString } = this.data;
    return {
      title: `我的八字运势：${baziString}`,
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.png'
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { lunarDate, baziString } = this.data;
    return {
      title: `八字运势测算：${baziString}`,
      query: 'from=timeline',
      imageUrl: '/images/share-bg.png'
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成后的逻辑
    console.log('result页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时的逻辑
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时的逻辑
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时的逻辑
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 上拉触底
  }
});
