/**
 * 原生广告组件
 * 支持模拟广告和真实广告的统一展示
 */

const { getAdConfig, isSimulationMode } = require('../../utils/ad-config');
const { getInstance: getFrequencyManager } = require('../../utils/ad-frequency-manager');

Component({
  properties: {
    // 广告类型
    adType: {
      type: String,
      value: 'native'
    },
    // 页面名称
    pageName: {
      type: String,
      value: ''
    },
    // 是否显示关闭按钮
    showCloseButton: {
      type: Boolean,
      value: true
    },
    // 自定义配置
    customConfig: {
      type: Object,
      value: null
    }
  },

  data: {
    // 广告配置
    adConfig: null,
    // 是否为模拟模式
    isSimulation: true,
    // 是否可见
    visible: false,
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  },

  lifetimes: {
    attached() {
      this.initAd();
    },

    detached() {
      this.destroyAd();
    }
  },

  methods: {
    /**
     * 初始化广告
     */
    initAd() {
      try {
        // 获取广告配置
        const config = this.properties.customConfig || getAdConfig(this.properties.adType, this.properties.pageName);
        
        if (!config) {
          console.warn('无法获取原生广告配置');
          return;
        }

        // 检查频次限制
        const frequencyManager = getFrequencyManager();
        if (!frequencyManager.canShowAd(this.properties.adType, this.properties.pageName)) {
          console.log('原生广告频次限制，不展示');
          return;
        }

        this.setData({
          adConfig: config.config,
          isSimulation: config.isSimulation,
          visible: true,
          loading: false,
          error: null
        });

        // 记录广告展示
        frequencyManager.recordAdShow(this.properties.adType, this.properties.pageName);

        // 模拟加载过程
        if (config.isSimulation) {
          this.simulateAdLoad();
        }

        console.log('原生广告初始化成功:', this.properties.adType);

      } catch (error) {
        console.error('原生广告初始化失败:', error);
        this.handleError(error.message);
      }
    },

    /**
     * 模拟广告加载过程
     */
    simulateAdLoad() {
      this.setData({ loading: true });

      // 模拟加载延迟
      setTimeout(() => {
        // 模拟10%的失败率
        if (Math.random() < 0.1) {
          this.handleError('模拟网络错误');
          return;
        }

        this.setData({ 
          loading: false,
          visible: true 
        });

        // 触发加载成功事件
        this.triggerEvent('adload', {
          adType: this.properties.adType
        });

      }, 500 + Math.random() * 1000); // 0.5-1.5秒随机延迟
    },

    /**
     * 处理广告点击
     */
    onAdClick() {
      console.log('原生广告被点击:', this.data.adConfig.title);
      
      // 触发点击事件
      this.triggerEvent('adclick', {
        adType: this.properties.adType,
        adConfig: this.data.adConfig
      });

      // 模拟广告跳转（仅模拟模式）
      if (this.data.isSimulation) {
        wx.showToast({
          title: '广告跳转(模拟)',
          icon: 'none',
          duration: 1500
        });
      }
    },

    /**
     * 处理广告关闭
     */
    onAdClose() {
      this.setData({ visible: false });
      
      // 触发关闭事件
      this.triggerEvent('adclose', {
        adType: this.properties.adType
      });

      console.log('原生广告已关闭');
    },

    /**
     * 处理真实广告加载成功
     */
    onAdLoad(e) {
      console.log('真实原生广告加载成功:', e);
      this.setData({ 
        loading: false,
        error: null 
      });

      // 触发加载成功事件
      this.triggerEvent('adload', {
        adType: this.properties.adType,
        detail: e.detail
      });
    },

    /**
     * 处理真实广告加载失败
     */
    onAdError(e) {
      console.error('真实原生广告加载失败:', e);
      this.handleError(e.detail ? e.detail.errMsg : '广告加载失败');
    },

    /**
     * 处理错误
     * @param {string} errorMsg 错误信息
     */
    handleError(errorMsg) {
      this.setData({
        loading: false,
        error: errorMsg,
        visible: false
      });

      // 触发错误事件
      this.triggerEvent('aderror', {
        adType: this.properties.adType,
        error: errorMsg
      });
    },

    /**
     * 刷新广告
     */
    refreshAd() {
      this.setData({
        visible: false,
        loading: false,
        error: null
      });

      // 延迟重新初始化
      setTimeout(() => {
        this.initAd();
      }, 100);
    },

    /**
     * 显示广告
     */
    showAd() {
      if (this.data.adConfig && !this.data.error) {
        this.setData({ visible: true });
      }
    },

    /**
     * 隐藏广告
     */
    hideAd() {
      this.setData({ visible: false });
    },

    /**
     * 销毁广告
     */
    destroyAd() {
      this.setData({
        adConfig: null,
        visible: false,
        loading: false,
        error: null
      });
    },

    /**
     * 获取广告状态
     * @returns {object} 广告状态信息
     */
    getAdStatus() {
      return {
        visible: this.data.visible,
        loading: this.data.loading,
        error: this.data.error,
        isSimulation: this.data.isSimulation,
        adType: this.properties.adType
      };
    }
  }
});
