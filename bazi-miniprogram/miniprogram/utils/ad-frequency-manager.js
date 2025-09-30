/**
 * 广告防骚扰频次管理器
 * 负责控制广告展示频次，防止过度打扰用户
 */

const { AD_CONFIG } = require('./ad-config.js');

class AdFrequencyManager {
  constructor() {
    this.storageKey = 'ad_frequency_data';
    this.init();
  }

  /**
   * 初始化频次管理器
   */
  init() {
    try {
      this.data = wx.getStorageSync(this.storageKey) || {
        dailyCount: {},
        lastShowTime: {},
        firstUseFlags: {},
        lastResetDate: this.getCurrentDate()
      };
      
      // 检查是否需要重置每日计数
      if (this.data.lastResetDate !== this.getCurrentDate()) {
        this.resetDailyCount();
      }
    } catch (error) {
      console.warn('初始化广告频次管理器失败:', error);
      this.data = {
        dailyCount: {},
        lastShowTime: {},
        firstUseFlags: {},
        lastResetDate: this.getCurrentDate()
      };
    }
  }

  /**
   * 获取当前日期字符串
   * @returns {string} YYYY-MM-DD格式的日期
   */
  getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * 重置每日计数
   */
  resetDailyCount() {
    this.data.dailyCount = {};
    this.data.lastResetDate = this.getCurrentDate();
    this.saveData();
  }

  /**
   * 检查是否可以展示广告
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   * @returns {boolean} 是否可以展示
   */
  canShowAd(adType, pageName = '') {
    try {
      // 检查新用户保护
      if (this.isFirstUse(adType, pageName) && AD_CONFIG.antiHarassment.newUserProtection) {
        return false;
      }

      // 检查每日限制
      if (!this.checkDailyLimit(adType)) {
        return false;
      }

      // 检查时间间隔
      if (!this.checkTimeInterval(adType)) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn('检查广告展示权限失败:', error);
      return false;
    }
  }

  /**
   * 检查是否为首次使用该功能
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   * @returns {boolean} 是否为首次使用
   */
  isFirstUse(adType, pageName) {
    const key = `${adType}_${pageName}`;
    return !this.data.firstUseFlags[key];
  }

  /**
   * 标记功能已使用
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   */
  markAsUsed(adType, pageName) {
    const key = `${adType}_${pageName}`;
    this.data.firstUseFlags[key] = true;
    this.saveData();
  }

  /**
   * 检查每日限制
   * @param {string} adType 广告类型
   * @returns {boolean} 是否在限制内
   */
  checkDailyLimit(adType) {
    const limit = AD_CONFIG.antiHarassment.dailyLimits[adType];
    if (!limit) return true;

    const currentCount = this.data.dailyCount[adType] || 0;
    return currentCount < limit;
  }

  /**
   * 检查时间间隔
   * @param {string} adType 广告类型
   * @returns {boolean} 是否满足时间间隔要求
   */
  checkTimeInterval(adType) {
    const now = Date.now();
    const intervals = AD_CONFIG.antiHarassment.intervals;
    
    // 检查任意广告间隔
    const lastAnyAdTime = this.getLastAnyAdTime();
    if (lastAnyAdTime && (now - lastAnyAdTime) < intervals.anyAd) {
      return false;
    }

    // 检查特定类型广告间隔
    const typeInterval = intervals[adType];
    if (typeInterval) {
      const lastShowTime = this.data.lastShowTime[adType];
      if (lastShowTime && (now - lastShowTime) < typeInterval) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取最后一次展示任意广告的时间
   * @returns {number|null} 时间戳
   */
  getLastAnyAdTime() {
    const times = Object.values(this.data.lastShowTime);
    return times.length > 0 ? Math.max(...times) : null;
  }

  /**
   * 记录广告展示
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   */
  recordAdShow(adType, pageName = '') {
    try {
      const now = Date.now();
      
      // 更新每日计数
      this.data.dailyCount[adType] = (this.data.dailyCount[adType] || 0) + 1;
      
      // 更新最后展示时间
      this.data.lastShowTime[adType] = now;
      
      // 标记为已使用
      this.markAsUsed(adType, pageName);
      
      // 保存数据
      this.saveData();
      
      console.log(`广告展示记录: ${adType}, 今日次数: ${this.data.dailyCount[adType]}`);
    } catch (error) {
      console.warn('记录广告展示失败:', error);
    }
  }

  /**
   * 获取广告展示统计
   * @returns {object} 统计数据
   */
  getStatistics() {
    return {
      dailyCount: { ...this.data.dailyCount },
      lastShowTime: { ...this.data.lastShowTime },
      date: this.data.lastResetDate
    };
  }

  /**
   * 计算列表中应该插入广告的位置
   * @param {number} listLength 列表长度
   * @returns {Array} 广告位置数组
   */
  calculateListAdPositions(listLength) {
    const ratio = AD_CONFIG.antiHarassment.listAdRatio;
    const positions = [];
    
    // 从第ratio个位置开始，每ratio个位置插入一个广告
    for (let i = ratio - 1; i < listLength; i += ratio + 1) {
      positions.push(i);
    }
    
    return positions;
  }

  /**
   * 保存数据到本地存储
   */
  saveData() {
    try {
      wx.setStorageSync(this.storageKey, this.data);
    } catch (error) {
      console.warn('保存广告频次数据失败:', error);
    }
  }

  /**
   * 清空所有数据（仅供调试使用）
   */
  clearAll() {
    this.data = {
      dailyCount: {},
      lastShowTime: {},
      firstUseFlags: {},
      lastResetDate: this.getCurrentDate()
    };
    this.saveData();
    console.log('广告频次数据已清空');
  }

  /**
   * 强制重置特定广告类型的限制（仅供调试使用）
   * @param {string} adType 广告类型
   */
  resetAdType(adType) {
    delete this.data.dailyCount[adType];
    delete this.data.lastShowTime[adType];
    this.saveData();
    console.log(`已重置${adType}广告限制`);
  }
}

// 创建单例实例
let instance = null;

/**
 * 获取广告频次管理器单例
 * @returns {AdFrequencyManager} 管理器实例
 */
function getInstance() {
  if (!instance) {
    instance = new AdFrequencyManager();
  }
  return instance;
}

module.exports = {
  AdFrequencyManager,
  getInstance
};
