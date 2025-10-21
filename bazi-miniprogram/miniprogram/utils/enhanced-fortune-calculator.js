// 增强运势计算器 - 集成缓存和后端API
const FortuneCacheManager = require('./fortune-cache-manager.js');

class EnhancedFortuneCalculator {
  constructor() {
    this.cacheManager = new FortuneCacheManager();
    this.API_BASE_URL = 'http://10.60.20.222:8001';
    this.MAX_RETRY_COUNT = 2;
    this.REQUEST_TIMEOUT = 10000; // 10秒超时
  }

  /**
   * 计算单人每日运势 - 带缓存机制
   * @param {Object} baziData - 八字数据
   * @param {string} targetDate - 目标日期 (YYYY-MM-DD)
   * @returns {Promise<Object>} 运势结果
   */
  async calculateDailyFortune(baziData, targetDate = null) {
    try {
      // 默认使用今天
      const dateToUse = targetDate || this.formatDate(new Date());
      
      console.log('🎯 开始计算每日运势:', { baziData, dateToUse });
      
      // 1. 检查缓存
      const cachedResult = this.cacheManager.getCachedFortune(baziData, dateToUse);
      if (cachedResult) {
        console.log('✅ 运势缓存命中，直接返回');
        return {
          success: true,
          data: cachedResult,
          source: 'cache',
          timestamp: new Date().toISOString()
        };
      }

      // 2. 调用后端API
      console.log('🌐 缓存未命中，调用后端API');
      const apiResult = await this.callFortuneAPI(baziData, dateToUse);
      
      if (apiResult.success) {
        // 3. 缓存结果
        this.cacheManager.setCachedFortune(baziData, dateToUse, apiResult.data);
        console.log('✅ 运势计算成功，已缓存');
        
        return {
          success: true,
          data: apiResult.data,
          source: 'api',
          timestamp: new Date().toISOString()
        };
      } else {
        // 4. API失败，返回错误信息
        console.log('⚠️ 后端API失败');
        return {
          success: false,
          error: apiResult.error || '运势服务暂时不可用',
          source: 'api_failed',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      console.error('❌ 运势计算出错:', error);
      // 5. 异常情况，返回错误信息
      return {
        success: false,
        error: error.message || '运势计算服务异常',
        source: 'api_error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 批量计算家庭运势 - 带缓存机制
   * @param {Array} membersData - 成员数据列表
   * @param {string} targetDate - 目标日期
   * @returns {Promise<Object>} 批量运势结果
   */
  async calculateBatchFortune(membersData, targetDate = null) {
    try {
      const dateToUse = targetDate || this.formatDate(new Date());
      
      console.log('🎯 开始批量计算运势:', { membersCount: membersData.length, dateToUse });

      // 1. 检查批量缓存
      const cachedResult = this.cacheManager.getCachedBatchFortune(membersData, dateToUse);
      if (cachedResult) {
        console.log('✅ 批量运势缓存命中');
        return {
          success: true,
          data: cachedResult,
          source: 'cache',
          timestamp: new Date().toISOString()
        };
      }

      // 2. 调用后端批量API
      console.log('🌐 批量缓存未命中，调用后端API');
      const apiResult = await this.callBatchFortuneAPI(membersData, dateToUse);
      
      if (apiResult.success) {
        // 3. 缓存批量结果
        this.cacheManager.setCachedBatchFortune(membersData, dateToUse, apiResult.data);
        console.log('✅ 批量运势计算成功，已缓存');
        
        return {
          success: true,
          data: apiResult.data,
          source: 'api',
          timestamp: new Date().toISOString()
        };
      } else {
        // 4. API失败，返回错误信息
        console.log('⚠️ 批量运势API失败');
        return {
          success: false,
          error: apiResult.error || '批量运势服务暂时不可用',
          source: 'api_failed',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      console.error('❌ 批量运势计算出错:', error);
      return {
        success: false,
        error: error.message || '批量运势计算服务异常',
        source: 'api_error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 调用后端运势API
   * @param {Object} baziData - 八字数据
   * @param {string} targetDate - 目标日期
   * @returns {Promise<Object>} API结果
   */
  async callFortuneAPI(baziData, targetDate) {
    return new Promise((resolve) => {
      const requestData = {
        bazi_data: baziData,
        target_date: targetDate
      };

      console.log('🌐 发送运势API请求:', requestData);

      const app = getApp();
      app.request({
        url: '/api/v1/calculate-fortune',
        method: 'POST',
        data: requestData,
        timeout: this.REQUEST_TIMEOUT,
        success: (res) => {
          console.log('✅ 运势API响应:', res);
          if (res.success) {
            resolve({
              success: true,
              data: res.data
            });
          } else {
            console.error('❌ 运势API返回错误:', res);
            resolve({
              success: false,
              error: res.error || '服务器返回错误'
            });
          }
        },
        fail: (error) => {
          console.error('❌ 运势API请求失败:', error);
          resolve({
            success: false,
            error: error.errMsg || '网络请求失败'
          });
        }
      });
    });
  }

  /**
   * 调用后端批量运势API
   * @param {Array} membersData - 成员数据
   * @param {string} targetDate - 目标日期
   * @returns {Promise<Object>} API结果
   */
  async callBatchFortuneAPI(membersData, targetDate) {
    return new Promise((resolve) => {
      const requestData = {
        members_data: membersData,
        target_date: targetDate
      };

      console.log('🌐 发送批量运势API请求:', requestData);

      const app = getApp();
      app.request({
        url: '/api/v1/batch-fortune',
        method: 'POST',
        data: requestData,
        timeout: this.REQUEST_TIMEOUT,
        success: (res) => {
          console.log('✅ 批量运势API响应:', res);
          if (res.success) {
            resolve({
              success: true,
              data: res.data
            });
          } else {
            console.error('❌ 批量运势API返回错误:', res);
            resolve({
              success: false,
              error: res.error || '服务器返回错误'
            });
          }
        },
        fail: (error) => {
          console.error('❌ 批量运势API请求失败:', error);
          resolve({
            success: false,
            error: error.errMsg || '网络请求失败'
          });
        }
      });
    });
  }


  /**
   * 生成家庭运势概览
   * @param {Array} results - 成员运势结果
   * @returns {Object} 家庭概览
   */
  generateFamilyOverview(results) {
    if (!results || results.length === 0) {
      return {
        total_members: 0,
        average_score: 0,
        best_member: null,
        family_lucky_color: "绿色",
        suggestions: ["添加家庭成员开始使用"],
        active_members: 0
      };
    }

    const validMembers = results.filter(r => r.has_valid_fortune);

    if (validMembers.length === 0) {
      return {
        total_members: results.length,
        average_score: 0,
        best_member: null,
        family_lucky_color: "绿色",
        suggestions: ["重新计算运势"],
        active_members: 0
      };
    }

    // 计算平均分数
    const totalScore = validMembers.reduce((sum, member) => sum + member.fortune.overall_score, 0);
    const averageScore = Math.round((totalScore / validMembers.length) * 10) / 10;

    // 找出运势最好的成员
    const bestMember = validMembers.reduce((best, current) => 
      current.fortune.overall_score > best.fortune.overall_score ? current : best
    );

    // 生成家庭建议
    const suggestions = this.generateFamilySuggestions(validMembers);

    return {
      total_members: results.length,
      average_score: averageScore,
      best_member: bestMember,
      family_lucky_color: bestMember.fortune.lucky_elements?.lucky_color || "绿色",
      suggestions: suggestions,
      active_members: validMembers.length,
      last_updated: new Date().getTime()
    };
  }

  /**
   * 生成家庭建议
   * @param {Array} members - 有效成员列表
   * @returns {Array} 建议列表
   */
  generateFamilySuggestions(members) {
    const suggestions = [];

    if (members.length === 1) {
      suggestions.push("添加更多家庭成员，获得完整的家庭运势分析");
    }

    if (members.length >= 2) {
      suggestions.push("全家人今天适合一起活动，增进感情");
    }

    const highScoreMembers = members.filter(m => m.fortune.overall_score >= 4);

    if (highScoreMembers.length > 0) {
      const names = highScoreMembers.map(m => m.member_name).join('、');
      suggestions.push(`${names}今日运势特别好`);
    }

    suggestions.push("每天查看运势，把握最佳时机");

    return suggestions;
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} 格式化的日期字符串 (YYYY-MM-DD)
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 预热常用运势缓存
   * @param {Array} commonBaziList - 常用八字列表
   * @param {Array} targetDates - 目标日期列表
   */
  async preloadFortuneCache(commonBaziList, targetDates) {
    console.log('🔥 开始预热运势缓存...');
    
    for (const baziData of commonBaziList) {
      for (const date of targetDates) {
        try {
          // 检查是否已有缓存
          const cached = this.cacheManager.getCachedFortune(baziData, date);
          if (!cached) {
            // 异步预加载，不等待结果
            this.calculateDailyFortune(baziData, date).catch(error => {
              console.log('预热缓存失败，但不影响主流程:', error);
            });
          }
        } catch (error) {
          console.log('预热过程出错:', error);
        }
      }
    }
    
    console.log('🔥 运势缓存预热已启动');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return this.cacheManager.getCacheStats();
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    this.cacheManager.cleanExpiredCache();
  }

  /**
   * 清理所有运势缓存
   */
  clearAllCache() {
    this.cacheManager.clearAllFortuneCache();
  }
}

// 导出增强运势计算器
module.exports = EnhancedFortuneCalculator;
