/**
 * 统一广告管理器
 * 支持模拟广告和真实广告的无缝切换
 */

const { getAdConfig, isSimulationMode } = require('./ad-config');
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

    // 模拟失败概率
    if (Math.random() < 0.1) { // 10%失败率
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

// 模拟横幅广告
class MockBannerAd extends MockAd {
  constructor(config, options = {}) {
    super('banner', config, options);
  }

  handleAdDisplay() {
    console.log('模拟横幅广告展示:', this.config.title);
    // 横幅广告通常持续显示，不自动关闭
  }
}

// 模拟激励视频广告
class MockRewardVideoAd extends MockAd {
  constructor(config, options = {}) {
    super('rewardVideo', config, options);
  }

  async handleAdDisplay() {
    console.log('模拟激励视频广告开始播放:', this.config.title);
    
    // 模拟视频播放时长
    const duration = this.config.duration || 15000;
    await this.simulateDelay(duration);
    
    // 视频播放完成
    if (this.callbacks.onClose) {
      this.callbacks.onClose({ isEnded: true });
    }
    
    this.visible = false;
  }
}

// 模拟插屏广告
class MockInterstitialAd extends MockAd {
  constructor(config, options = {}) {
    super('interstitial', config, options);
  }

  async handleAdDisplay() {
    console.log('模拟插屏广告展示:', this.config.title);
    
    // 模拟自动关闭时间
    const autoCloseTime = this.config.autoCloseTime || 3000;
    await this.simulateDelay(autoCloseTime);
    
    // 自动关闭
    if (this.callbacks.onClose) {
      this.callbacks.onClose({});
    }
    
    this.visible = false;
  }
}

// 模拟原生广告
class MockNativeAd extends MockAd {
  constructor(config, options = {}) {
    super('native', config, options);
  }

  handleAdDisplay() {
    console.log('模拟原生广告展示:', this.config.title);
    // 原生广告嵌入在页面中，不需要特殊处理
  }
}

// 主广告管理器类
class AdManager {
  constructor() {
    this.adInstances = new Map();
    this.retryCounters = new Map();
    this.frequencyManager = getFrequencyManager();
  }

  static getInstance() {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
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
    switch (adType) {
      case 'banner':
        return new MockBannerAd(config, options);
      case 'rewardVideo':
        return new MockRewardVideoAd(config, options);
      case 'interstitial':
        return new MockInterstitialAd(config, options);
      case 'native':
        return new MockNativeAd(config, options);
      default:
        throw new Error(`不支持的模拟广告类型: ${adType}`);
    }
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
   * 快捷方法：展示激励视频广告
   * @param {string} pageName 页面名称
   * @param {function} onReward 奖励回调
   * @returns {Promise} 展示结果
   */
  async showRewardVideoAd(pageName, onReward) {
    return this.showAd('rewardVideo', { pageName, onReward });
  }

  /**
   * 快捷方法：展示横幅广告
   * @param {string} pageName 页面名称
   * @returns {Promise} 展示结果
   */
  async showBannerAd(pageName) {
    return this.showAd('banner', { pageName });
  }

  /**
   * 在列表中插入广告数据
   * @param {Array} dataList 原始数据列表
   * @param {string} adType 广告类型
   * @returns {Array} 插入广告后的列表
   */
  insertAdsIntoList(dataList, adType = 'native') {
    const positions = this.frequencyManager.calculateListAdPositions(dataList.length);
    const result = [...dataList];
    
    // 从后往前插入，避免位置偏移
    positions.reverse().forEach((position, index) => {
      if (position < result.length) {
        const adConfig = getAdConfig(adType);
        if (adConfig) {
          result.splice(position, 0, {
            isAd: true,
            adType: adType,
            id: `ad_${adType}_${index}`,
            config: adConfig.config
          });
        }
      }
    });
    
    return result;
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
