/**
 * 广告管理器 - 简化版
 * 统一管理小程序广告的加载、展示、错误处理
 */

const { getAdConfig, canShowAd, getErrorHandlingConfig } = require('./ad-config');

class AdManager {
  constructor() {
    this.adInstances = new Map(); // 存储广告实例
    this.retryCounters = new Map(); // 重试计数器
  }

  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * 检查广告是否应该显示
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   * @returns {boolean} 是否应该显示
   */
  shouldShowAd(adType, pageName) {
    return canShowAd(adType, pageName);
  }

  /**
   * 获取广告配置信息
   * @param {string} adType 广告类型
   * @param {string} pageName 页面名称
   * @returns {object|null} 广告配置
   */
  getAdConfiguration(adType, pageName) {
    return getAdConfig(adType, pageName);
  }

  /**
   * 创建激励视频广告
   * @param {string} unitId 广告单元ID
   * @returns {object|null} 广告实例
   */
  createRewardedVideoAd(unitId) {
    if (!unitId) {
      console.warn('激励视频广告单元ID为空');
      return null;
    }

    try {
      if (typeof wx.createRewardedVideoAd === 'function') {
        const ad = wx.createRewardedVideoAd({
          adUnitId: unitId
        });

        // 设置事件监听
        this.setupRewardedVideoAdEvents(ad, unitId);
        
        this.adInstances.set(`reward_${unitId}`, ad);
        return ad;
      } else {
        console.warn('当前版本不支持激励视频广告');
        return null;
      }
    } catch (error) {
      console.error('创建激励视频广告失败:', error);
      return null;
    }
  }

  /**
   * 创建插屏广告
   * @param {string} unitId 广告单元ID
   * @returns {object|null} 广告实例
   */
  createInterstitialAd(unitId) {
    if (!unitId) {
      console.warn('插屏广告单元ID为空');
      return null;
    }

    try {
      if (typeof wx.createInterstitialAd === 'function') {
        const ad = wx.createInterstitialAd({
          adUnitId: unitId
        });

        // 设置事件监听
        this.setupInterstitialAdEvents(ad, unitId);
        
        this.adInstances.set(`interstitial_${unitId}`, ad);
        return ad;
      } else {
        console.warn('当前版本不支持插屏广告');
        return null;
      }
    } catch (error) {
      console.error('创建插屏广告失败:', error);
      return null;
    }
  }

  /**
   * 设置激励视频广告事件监听
   * @param {object} ad 广告实例
   * @param {string} unitId 广告单元ID
   */
  setupRewardedVideoAdEvents(ad, unitId) {
    // 广告加载成功
    ad.onLoad(() => {
      console.log('激励视频广告加载成功:', unitId);
    });

    // 广告加载失败
    ad.onError((err) => {
      console.error('激励视频广告加载失败:', err);
      this.handleAdError('reward', err.errCode, err.errMsg, unitId);
    });

    // 广告关闭
    ad.onClose((res) => {
      console.log('激励视频广告关闭:', res);
      if (res && res.isEnded) {
        console.log('用户完整观看了激励视频');
      } else {
        console.log('用户提前关闭了激励视频');
      }
    });
  }

  /**
   * 设置插屏广告事件监听
   * @param {object} ad 广告实例
   * @param {string} unitId 广告单元ID
   */
  setupInterstitialAdEvents(ad, unitId) {
    // 广告加载成功
    ad.onLoad(() => {
      console.log('插屏广告加载成功:', unitId);
    });

    // 广告加载失败
    ad.onError((err) => {
      console.error('插屏广告加载失败:', err);
      this.handleAdError('interstitial', err.errCode, err.errMsg, unitId);
    });

    // 广告关闭
    ad.onClose(() => {
      console.log('插屏广告关闭');
    });
  }

  /**
   * 显示激励视频广告
   * @param {string} unitId 广告单元ID
   * @param {function} onReward 奖励回调
   * @returns {Promise} 显示结果
   */
  showRewardedVideoAd(unitId, onReward) {
    return new Promise((resolve, reject) => {
      const adKey = `reward_${unitId}`;
      let ad = this.adInstances.get(adKey);

      if (!ad) {
        ad = this.createRewardedVideoAd(unitId);
        if (!ad) {
          reject(new Error('无法创建激励视频广告'));
          return;
        }
      }

      // 设置奖励回调
      if (onReward && typeof onReward === 'function') {
        const originalOnClose = ad.onClose;
        ad.onClose = (res) => {
          if (res && res.isEnded) {
            onReward();
          }
          if (originalOnClose) {
            originalOnClose(res);
          }
        };
      }

      // 显示广告
      ad.show().then(() => {
        console.log('激励视频广告显示成功');
        resolve();
      }).catch((err) => {
        console.error('激励视频广告显示失败:', err);
        this.handleAdError('reward', err.errCode, err.errMsg, unitId);
        reject(err);
      });
    });
  }

  /**
   * 显示插屏广告
   * @param {string} unitId 广告单元ID
   * @returns {Promise} 显示结果
   */
  showInterstitialAd(unitId) {
    return new Promise((resolve, reject) => {
      const adKey = `interstitial_${unitId}`;
      let ad = this.adInstances.get(adKey);

      if (!ad) {
        ad = this.createInterstitialAd(unitId);
        if (!ad) {
          reject(new Error('无法创建插屏广告'));
          return;
        }
      }

      // 显示广告
      ad.show().then(() => {
        console.log('插屏广告显示成功');
        resolve();
      }).catch((err) => {
        console.error('插屏广告显示失败:', err);
        this.handleAdError('interstitial', err.errCode, err.errMsg, unitId);
        reject(err);
      });
    });
  }

  /**
   * 处理广告错误（简化版，只有控制台输出和重试）
   * @param {string} adType 广告类型
   * @param {number} errCode 错误码
   * @param {string} errMsg 错误信息
   * @param {string} unitId 广告单元ID
   */
  handleAdError(adType, errCode, errMsg, unitId) {
    // 只在控制台输出错误信息
    console.error(`[广告错误] ${adType}:`, errCode, errMsg);
    
    const errorConfig = getErrorHandlingConfig();
    const retryKey = `${adType}_${unitId}`;
    const currentRetries = this.retryCounters.get(retryKey) || 0;

    // 某些错误码不需要重试
    const noRetryErrors = [1002, 1006, 1007, 1008]; // 参数错误、被驳回、被封禁、已关闭
    
    if (noRetryErrors.includes(errCode)) {
      console.log(`错误码 ${errCode} 不进行重试`);
      return;
    }

    // 检查是否需要重试
    if (currentRetries < errorConfig.maxRetries) {
      this.retryCounters.set(retryKey, currentRetries + 1);
      
      setTimeout(() => {
        console.log(`广告重试第 ${currentRetries + 1} 次:`, adType, unitId);
        // 重新创建广告实例
        this.recreateAd(adType, unitId);
      }, errorConfig.retryDelay);
    } else {
      console.log(`广告重试次数已达上限:`, adType, unitId);
      this.retryCounters.delete(retryKey);
    }
  }

  /**
   * 重新创建广告实例
   * @param {string} adType 广告类型
   * @param {string} unitId 广告单元ID
   */
  recreateAd(adType, unitId) {
    const adKey = `${adType}_${unitId}`;
    
    // 清除旧实例
    if (this.adInstances.has(adKey)) {
      this.adInstances.delete(adKey);
    }

    // 创建新实例
    if (adType === 'reward') {
      this.createRewardedVideoAd(unitId);
    } else if (adType === 'interstitial') {
      this.createInterstitialAd(unitId);
    }
  }

  /**
   * 销毁广告实例
   * @param {string} adType 广告类型
   * @param {string} unitId 广告单元ID
   */
  destroyAd(adType, unitId) {
    const adKey = `${adType}_${unitId}`;
    const ad = this.adInstances.get(adKey);
    
    if (ad && typeof ad.destroy === 'function') {
      ad.destroy();
      this.adInstances.delete(adKey);
      console.log('广告实例已销毁:', adKey);
    }
  }

  /**
   * 销毁所有广告实例
   */
  destroyAllAds() {
    this.adInstances.forEach((ad, key) => {
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
