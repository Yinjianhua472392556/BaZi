/**
 * 统一广告配置管理
 * 支持模拟广告和真实广告无缝切换
 */

const AD_CONFIG = {
  // 核心开关：true=模拟广告，false=真实广告
  simulationMode: true,
  
  // 全局广告开关 - 永久关闭所有广告（微信广告系统自己集成）
  globalEnabled: false,
  
  // 统一广告单元配置
  adUnits: {
    // 横幅广告
    banner: {
      enabled: false,  // 已禁用 - 微信广告系统自己集成
      // 模拟配置
      mockConfig: {
        title: "精准八字测算",
        description: "专业大师在线解读",
        backgroundColor: "#FF6B6B",
        textColor: "#FFFFFF",
        image: "/images/ad-placeholder.png",
        height: 80
      },
      // 真实配置（开通流量主后填入）
      realConfig: {
        unitId: ''  // 微信广告位ID
      }
    },
    
    // 激励视频广告
    rewardVideo: {
      enabled: false,  // 已禁用 - 微信广告系统自己集成
      // 模拟配置
      mockConfig: {
        duration: 15000,  // 模拟15秒视频
        title: "观看视频获得更详细解读",
        skipTime: 5000,   // 5秒后可跳过
        backgroundColor: "#4ECDC4",
        textColor: "#FFFFFF"
      },
      // 真实配置
      realConfig: {
        unitId: ''
      }
    },
    
    // 插屏广告
    interstitial: {
      enabled: false,  // 已禁用 - 微信广告系统自己集成
      // 模拟配置
      mockConfig: {
        title: "专业起名服务",
        description: "基于五行八字智能推荐",
        autoCloseTime: 3000,  // 3秒后自动关闭
        backgroundColor: "#4ECDC4",
        textColor: "#FFFFFF",
        image: "/images/ad-placeholder.png"
      },
      // 真实配置
      realConfig: {
        unitId: ''
      }
    },
    
    // 原生广告（用于列表插入）
    native: {
      enabled: false,  // 已禁用 - 微信广告系统自己集成
      // 模拟配置
      mockConfig: {
        title: "AI智能起名",
        description: "根据生辰八字推荐好名字",
        buttonText: "立即体验",
        image: "/images/ad-placeholder.png",
        backgroundColor: "#FFF",
        borderColor: "#E8E8E8",
        textColor: "#333"
      },
      // 真实配置
      realConfig: {
        unitId: ''
      }
    }
  },
  
  // 页面广告配置
  pages: {
    // 首页（八字测算）
    index: {
      interstitial: true,  // 开始测算时
      banner: false
    },
    
    // 运势页面（八字解读）
    result: {
      banner: true,       // 页面底部
      rewardVideo: false
    },
    
    // 节日页面
    festival: {
      banner: true,       // 列表中插入
      native: true
    },
    
    // 生肖配对页面
    'zodiac-matching': {
      interstitial: true, // 配对按钮点击时
      banner: false
    },
    
    // 起名页面
    naming: {
      rewardVideo: true,  // 开始起名时
      native: true        // 名字列表中插入
    },
    
    // 个人中心/历史记录
    profile: {
      banner: true        // 有记录时页面顶部
    },
    
  },
  
  // 防骚扰配置 - 调试模式优化
  antiHarassment: {
    // 每日展示次数限制 - 调试模式放宽限制
    dailyLimits: {
      rewardVideo: 100,     // 激励视频每天100次（调试用）
      interstitial: 100,    // 插屏广告每天100次（调试用）
      banner: 100,          // 横幅广告每天100次（调试用）
      native: 100           // 原生广告每天100次（调试用）
    },
    // 时间间隔限制（毫秒） - 调试模式缩短间隔
    intervals: {
      anyAd: 1000,          // 任意广告间隔1秒（调试用）
      interstitial: 2000,   // 插屏广告间隔2秒（调试用）
      rewardVideo: 2000,    // 激励视频间隔2秒（调试用）
      banner: 1000          // 横幅广告间隔1秒（调试用）
    },
    // 自动关闭时间
    autoCloseTime: {
      interstitial: 3000,    // 插屏广告3秒后自动关闭
      banner: -1             // 横幅广告不自动关闭
    },
    // 新用户保护（首次使用功能不展示广告）- 调试模式关闭
    newUserProtection: false,
    // 列表广告比例
    listAdRatio: 3  // 每3个内容项最多1个广告（调试用，更频繁显示）
  },
  
  // 错误处理配置
  errorHandling: {
    // 自动重试次数
    maxRetries: 3,
    // 重试间隔（毫秒）
    retryDelay: 2000,
    // 是否在错误时隐藏广告容器
    hideOnError: true,
    // 模拟失败率（仅在模拟模式下生效） - 调试模式降低失败率
    mockFailureRate: 0.01  // 1%的模拟失败率（调试用）
  },
  
  // 调试模式配置
  debug: {
    // 是否开启调试模式
    enabled: true,
    // 是否在控制台显示详细日志
    verbose: true,
    // 是否忽略所有频次限制
    ignoreFrequencyLimits: true,
    // 是否强制显示广告（忽略所有条件）
    forceShowAds: true
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
  if (!adUnit || !adUnit.enabled) {
    return null;
  }
  
  // 检查页面配置
  if (page && AD_CONFIG.pages[page] && !AD_CONFIG.pages[page][type]) {
    return null;
  }
  
  // 根据模拟模式返回相应配置
  if (AD_CONFIG.simulationMode) {
    return {
      ...adUnit,
      config: adUnit.mockConfig,
      isSimulation: true
    };
  } else {
    // 真实模式下检查unitId是否存在
    if (!adUnit.realConfig.unitId) {
      return null;
    }
    return {
      ...adUnit,
      config: adUnit.realConfig,
      isSimulation: false
    };
  }
}

/**
 * 判断是否为模拟模式
 * @param {string} type 广告类型
 * @returns {boolean} 是否为模拟模式
 */
function isSimulationMode(type) {
  return AD_CONFIG.simulationMode;
}

/**
 * 切换到真实广告模式
 * @param {object} adUnitIds 真实广告单元ID配置
 */
function switchToRealAds(adUnitIds) {
  AD_CONFIG.simulationMode = false;
  
  // 更新真实广告单元ID
  Object.keys(adUnitIds).forEach(type => {
    if (AD_CONFIG.adUnits[type]) {
      AD_CONFIG.adUnits[type].realConfig.unitId = adUnitIds[type];
    }
  });
  
  console.log('已切换到真实广告模式');
  return AD_CONFIG;
}

/**
 * 切换到模拟广告模式
 */
function switchToMockAds() {
  AD_CONFIG.simulationMode = true;
  console.log('已切换到模拟广告模式');
  return AD_CONFIG;
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
  updateAdConfig,
  isSimulationMode,
  switchToRealAds,
  switchToMockAds
};
