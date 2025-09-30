/**
 * 统一广告管理器
 * 支持模拟广告和真实广告的无缝切换
 */

const { getAdConfig, isSimulationMode, AD_CONFIG } = require('./ad-config');
const { getInstance: getFrequencyManager } = require('./ad-frequency-manager');

// 模拟广告类
class MockAd {
  constructor(type, config, options = {}) {
    this.type = type;
    this.config = config;
    this.options = options;
    this.visible = false;
    this.destroyed = false;
    
    // 事件回调
    this.callbacks = {
      onLoad: null,
      onError: null,
      onClose: null
    };
  }

  async show() {
    if (this.destroyed) {
      throw new Error('广告实例已销毁');
    }

    // 模拟加载延迟
    await this.simulateDelay(300);

    // 模拟失败概率（使用配置文件中的失败率）
    const failureRate = AD_CONFIG.errorHandling?.mockFailureRate || 0.1;
    if (Math.random() < failureRate) {
      const error = { errCode: 1004, errMsg: '模拟网络错误' };
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      throw error;
    }

    this.visible = true;
    
    // 触发加载成功回调
    if (this.callbacks.onLoad) {
      this.callbacks.onLoad();
    }

    // 处理不同类型的广告展示
    this.handleAdDisplay();
    
    return Promise.resolve();
  }

  async hide() {
    this.visible = false;
  }

  onLoad(callback) {
    this.callbacks.onLoad = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  onClose(callback) {
    this.callbacks.onClose = callback;
  }

  destroy() {
    this.destroyed = true;
    this.visible = false;
    this.callbacks = {};
  }

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleAdDisplay() {
    // 子类实现具体的展示逻辑
  }
}

// 主广告管理器类
class AdManager {
  constructor() {
    this.adInstances = new Map();
    this.retryCounters = new Map();
    this.frequencyManager = getFrequencyManager();
    this.config = AD_CONFIG;
  }

  static getInstance() {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * 检查是否应该显示广告
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   * @returns {boolean} 是否应该显示
   */
  shouldShowAd(adType, pageName = '') {
    try {
      console.log(`[广告管理器] 检查广告显示权限: ${adType} @ ${pageName}`);
      
      // 调试模式：强制显示广告
      if (this.config.debug && this.config.debug.enabled && this.config.debug.forceShowAds) {
        console.log('[广告管理器] 🔧 调试模式：强制显示广告');
        return true;
      }
      
      // 检查全局开关
      if (!this.config.globalEnabled) {
        console.log('[广告管理器] 广告全局开关已关闭');
        return false;
      }

      // 检查广告类型是否启用
      const adUnit = this.config.adUnits[adType];
      if (!adUnit || !adUnit.enabled) {
        console.log(`[广告管理器] 广告类型 ${adType} 未启用`, adUnit);
        return false;
      }

      // 检查页面配置
      if (pageName) {
        const pageConfig = this.config.pages[pageName];
        console.log(`[广告管理器] 页面配置:`, pageConfig);
        
        if (pageConfig && pageConfig[adType] === false) {
          console.log(`[广告管理器] 页面 ${pageName} 明确禁止显示 ${adType} 广告`);
          return false;
        }
        
        // 如果页面配置存在但没有该广告类型的配置，允许显示（兼容模式）
        if (pageConfig && pageConfig[adType] === undefined) {
          console.log(`[广告管理器] 页面 ${pageName} 没有 ${adType} 广告配置，允许显示`);
        }
      }

      // 检查频次限制（调试模式可忽略）
      if (!(this.config.debug && this.config.debug.enabled && this.config.debug.ignoreFrequencyLimits)) {
        if (!this.frequencyManager.canShowAd(adType, pageName)) {
          console.log(`[广告管理器] 广告 ${adType} 受频次限制`);
          return false;
        }
      } else {
        console.log('[广告管理器] 🔧 调试模式：忽略频次限制');
      }

      console.log(`[广告管理器] ✅ 允许显示广告: ${adType} @ ${pageName}`);
      return true;
    } catch (error) {
      console.error('[广告管理器] 检查广告显示权限时出错:', error);
      return false;
    }
  }

  /**
   * 获取广告配置（组件接口兼容方法）
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   * @returns {object|null} 广告配置
   */
  getAdConfiguration(adType, pageName) {
    try {
      console.log(`[广告管理器] 获取广告配置: ${adType} @ ${pageName}`);
      
      const config = getAdConfig(adType, pageName);
      if (!config) {
        console.log(`[广告管理器] 无法获取广告配置: ${adType} @ ${pageName}`);
        return null;
      }
      
      console.log(`[广告管理器] 广告配置获取成功:`, config);
      
      // 返回组件期望的格式
      return {
        unitId: config.isSimulation ? 'mock-unit-id' : config.config.unitId,
        isSimulation: config.isSimulation,
        config: config.config
      };
    } catch (error) {
      console.error('[广告管理器] 获取广告配置时出错:', error);
      return null;
    }
  }

  /**
   * 创建广告实例（统一接口）
   * @param {string} adType 广告类型
   * @param {object} options 选项
   * @returns {object|null} 广告实例
   */
  createAd(adType, options = {}) {
    const config = getAdConfig(adType, options.pageName);
    
    if (!config) {
      console.warn(`无法获取${adType}广告配置`);
      return null;
    }

    try {
      if (config.isSimulation) {
        return this.createMockAd(adType, config.config, options);
      } else {
        return this.createRealAd(adType, config.config, options);
      }
    } catch (error) {
      console.error('创建广告实例失败:', error);
      return null;
    }
  }

  /**
   * 创建模拟广告
   * @param {string} adType 广告类型
   * @param {object} config 配置
   * @param {object} options 选项
   * @returns {MockAd} 模拟广告实例
   */
  createMockAd(adType, config, options) {
    return new MockAd(adType, config, options);
  }

  /**
   * 创建真实广告
   * @param {string} adType 广告类型
   * @param {object} config 配置
   * @param {object} options 选项
   * @returns {object} 真实广告实例
   */
  createRealAd(adType, config, options) {
    const { unitId } = config;
    
    if (!unitId) {
      throw new Error(`${adType}广告单元ID为空`);
    }

    switch (adType) {
      case 'banner':
        return wx.createBannerAd({ 
          adUnitId: unitId,
          ...options 
        });
      case 'rewardVideo':
        return wx.createRewardedVideoAd({ 
          adUnitId: unitId,
          ...options 
        });
      case 'interstitial':
        return wx.createInterstitialAd({ 
          adUnitId: unitId,
          ...options 
        });
      default:
        throw new Error(`不支持的真实广告类型: ${adType}`);
    }
  }

  /**
   * 统一的广告展示方法
   * @param {string} adType 广告类型
   * @param {object} options 选项
   * @returns {Promise} 展示结果
   */
  async showAd(adType, options = {}) {
    const { pageName = '', onReward = null } = options;
    
    // 检查频次限制
    if (!this.frequencyManager.canShowAd(adType, pageName)) {
      console.log(`${adType}广告频次限制，跳过展示`);
      return Promise.resolve({ skipped: true, reason: 'frequency_limit' });
    }

    try {
      // 创建广告实例
      const ad = this.createAd(adType, options);
      
      if (!ad) {
        throw new Error(`无法创建${adType}广告`);
      }

      // 设置事件监听
      this.setupAdEvents(ad, adType, onReward);

      // 展示广告
      await ad.show();

      // 记录展示
      this.frequencyManager.recordAdShow(adType, pageName);

      console.log(`${adType}广告展示成功`);
      return { success: true };

    } catch (error) {
      console.warn(`${adType}广告展示失败:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置广告事件监听
   * @param {object} ad 广告实例
   * @param {string} adType 广告类型
   * @param {function} onReward 奖励回调
   */
  setupAdEvents(ad, adType, onReward) {
    // 加载成功
    ad.onLoad && ad.onLoad(() => {
      console.log(`${adType}广告加载成功`);
    });

    // 加载失败
    ad.onError && ad.onError((err) => {
      console.error(`${adType}广告加载失败:`, err);
    });

    // 关闭事件
    ad.onClose && ad.onClose((res) => {
      console.log(`${adType}广告关闭:`, res);
      
      // 激励视频特殊处理
      if (adType === 'rewardVideo' && onReward && res && res.isEnded) {
        onReward();
      }
    });
  }

  /**
   * 快捷方法：展示插屏广告
   * @param {string} pageName 页面名称
   * @returns {Promise} 展示结果
   */
  async showInterstitialAd(pageName) {
    return this.showAd('interstitial', { pageName });
  }

  /**
   * 获取广告展示统计
   * @returns {object} 统计数据
   */
  getStatistics() {
    return this.frequencyManager.getStatistics();
  }

  /**
   * 重新初始化（切换模式时使用）
   */
  reinitialize() {
    this.destroyAllAds();
    this.frequencyManager = getFrequencyManager();
    console.log('广告管理器已重新初始化');
  }

  /**
   * 销毁所有广告实例
   */
  destroyAllAds() {
    this.adInstances.forEach((ad) => {
      if (ad && typeof ad.destroy === 'function') {
        ad.destroy();
      }
    });
    this.adInstances.clear();
    this.retryCounters.clear();
    console.log('所有广告实例已销毁');
  }
}

module.exports = AdManager;
