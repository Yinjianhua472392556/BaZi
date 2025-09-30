/**
 * 广告配置管理 - 简化版
 * 用于管理小程序的广告展示配置
 */

const AD_CONFIG = {
  // 全局广告开关 - 控制是否展示任何广告
  globalEnabled: false,
  
  // 广告位配置
  adUnits: {
    // Banner广告位
    banner: {
      enabled: false,
      unitId: '', // 流量主开通后填入对应的广告位ID
      intervals: 30, // 自动刷新间隔（秒）
      type: 'banner'
    },
    
    // 视频广告位
    video: {
      enabled: false,
      unitId: '',
      type: 'video'
    },
    
    // 格子广告位
    grid: {
      enabled: false,
      unitId: '',
      type: 'grid'
    },
    
    // 激励视频广告
    rewardVideo: {
      enabled: false,
      unitId: ''
    },
    
    // 插屏广告
    interstitial: {
      enabled: false,
      unitId: ''
    }
  },
  
  // 页面广告配置
  pages: {
    // 首页
    index: {
      banner: false,
      video: false
    },
    
    // 运势页面
    result: {
      banner: false,
      rewardVideo: false
    },
    
    // 节日页面
    festival: {
      banner: false,
      grid: false
    },
    
    // 生肖配对页面
    zodiacMatching: {
      banner: false,
      interstitial: false
    },
    
    // 起名页面
    naming: {
      banner: false,
      video: false
    },
    
    // 个人中心
    profile: {
      banner: false
    }
  },
  
  // 错误处理配置
  errorHandling: {
    // 自动重试次数
    maxRetries: 3,
    // 重试间隔（毫秒）
    retryDelay: 2000,
    // 是否在错误时隐藏广告容器
    hideOnError: true
  }
};

/**
 * 获取广告配置
 * @param {string} type 广告类型
 * @param {string} page 页面名称
 * @returns {object} 广告配置
 */
function getAdConfig(type, page) {
  // 检查全局开关
  if (!AD_CONFIG.globalEnabled) {
    return null;
  }
  
  // 检查广告类型配置
  const adUnit = AD_CONFIG.adUnits[type];
  if (!adUnit || !adUnit.enabled || !adUnit.unitId) {
    return null;
  }
  
  // 检查页面配置
  if (page && AD_CONFIG.pages[page] && !AD_CONFIG.pages[page][type]) {
    return null;
  }
  
  return adUnit;
}

/**
 * 检查是否可以展示广告
 * @param {string} type 广告类型
 * @param {string} page 页面名称
 * @returns {boolean} 是否可以展示
 */
function canShowAd(type, page) {
  return getAdConfig(type, page) !== null;
}

/**
 * 获取错误处理配置
 * @returns {object} 错误处理配置
 */
function getErrorHandlingConfig() {
  return AD_CONFIG.errorHandling;
}

/**
 * 更新广告配置（仅供开发调试使用）
 * @param {object} config 新的配置
 */
function updateAdConfig(config) {
  if (typeof config === 'object' && config !== null) {
    Object.assign(AD_CONFIG, config);
    console.log('广告配置已更新:', AD_CONFIG);
  }
}

module.exports = {
  AD_CONFIG,
  getAdConfig,
  canShowAd,
  getErrorHandlingConfig,
  updateAdConfig
};
