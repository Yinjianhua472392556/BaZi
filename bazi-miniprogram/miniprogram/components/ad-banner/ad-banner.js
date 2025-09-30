/**
 * Banner广告组件 - 简化版
 * 封装微信小程序的banner广告
 */

const AdManager = require('../../utils/ad-manager');

Component({
  properties: {
    // 页面名称，用于配置检查
    pageName: {
      type: String,
      value: ''
    },
    // 广告单元ID（可选，会优先使用配置文件中的ID）
    adUnitId: {
      type: String,
      value: ''
    }
  },

  data: {
    // 是否显示广告
    showAd: false,
    // 是否显示错误占位符
    showError: false,
    // 错误信息
    errorMsg: '',
    // 是否为模拟模式
    isSimulation: false,
    // 广告配置
    adConfig: {},
    // 广告单元ID
    adUnitId: '',
    // 加载状态
    loading: false
  },

  lifetimes: {
    attached() {
      this.adManager = AdManager.getInstance();
      this.checkAndInitAd();
    }
  },

  methods: {
    /**
     * 检查并初始化广告
     */
    checkAndInitAd() {
      const { adUnitId, pageName } = this.properties;
      
      // 检查是否应该显示广告
      if (!this.adManager.shouldShowAd('banner', pageName)) {
        console.log('Banner广告未启用或不满足显示条件');
        this.setData({ showAd: false });
        return;
      }

      // 获取广告配置
      const adConfig = this.adManager.getAdConfiguration('banner', pageName);
      if (!adConfig) {
        console.log('Banner广告配置无效');
        this.setData({ showAd: false });
        return;
      }

      // 使用配置中的unitId，如果组件没有传入的话
      const finalUnitId = adUnitId || adConfig.unitId;
      
      // 设置数据
      this.setData({ 
        showAd: true,
        isSimulation: adConfig.isSimulation,
        adConfig: adConfig.config || {},
        adUnitId: finalUnitId
      });
      
      console.log('Banner广告组件初始化完成', {
        isSimulation: adConfig.isSimulation,
        unitId: finalUnitId,
        config: adConfig.config
      });
      
      // 如果是模拟模式，模拟加载过程
      if (adConfig.isSimulation) {
        this.simulateAdLoad();
      }
    },

    /**
     * 模拟广告加载过程
     */
    simulateAdLoad() {
      this.setData({ loading: true });
      
      // 模拟加载延迟
      setTimeout(() => {
        this.setData({ loading: false });
        this.onAdLoad();
      }, 500);
    },

    /**
     * 广告加载成功
     */
    onAdLoad() {
      console.log('Banner广告加载成功');
      this.setData({ showError: false });
    },

    /**
     * 广告加载失败
     */
    onAdError(e) {
      console.error('Banner广告加载失败:', e.detail);
      
      const { errCode, errMsg } = e.detail;
      this.setData({ 
        showError: true,
        errorMsg: `广告加载失败: ${errMsg || '未知错误'}`
      });
    },

    /**
     * 广告点击
     */
    onAdClick() {
      console.log('Banner广告被点击');
    },

    /**
     * 广告关闭
     */
    onAdClose() {
      console.log('Banner广告被关闭');
    },

    /**
     * 重新加载广告
     */
    reloadAd() {
      this.setData({ showError: false });
      
      // 延迟一段时间后重新检查
      setTimeout(() => {
        this.checkAndInitAd();
      }, 1000);
    }
  }
});
