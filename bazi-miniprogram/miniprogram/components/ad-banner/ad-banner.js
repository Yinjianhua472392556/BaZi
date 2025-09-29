/**
 * Banner广告组件
 * 封装微信小程序的banner广告
 */

const AdManager = require('../../utils/ad-manager');

Component({
  properties: {
    // 广告单元ID
    adUnitId: {
      type: String,
      value: ''
    },
    // 页面名称，用于配置检查
    pageName: {
      type: String,
      value: ''
    },
    // 自定义样式类
    customClass: {
      type: String,
      value: ''
    },
    // 是否自动刷新
    autoRefresh: {
      type: Boolean,
      value: true
    },
    // 刷新间隔（秒）
    refreshInterval: {
      type: Number,
      value: 30
    }
  },

  data: {
    // 是否显示广告
    showAd: false,
    // 是否显示错误占位符
    showError: false,
    // 错误信息
    errorMsg: '',
    // 广告是否加载中
    loading: false
  },

  lifetimes: {
    attached() {
      this.adManager = AdManager.getInstance();
      this.checkAndInitAd();
    },

    detached() {
      this.clearRefreshTimer();
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
      if (!adConfig || !adConfig.unitId) {
        console.log('Banner广告配置无效');
        this.setData({ showAd: false });
        return;
      }

      // 使用配置中的unitId，如果组件没有传入的话
      const finalUnitId = adUnitId || adConfig.unitId;
      
      this.setData({ 
        showAd: true,
        loading: true
      });

      // 设置自动刷新
      if (this.properties.autoRefresh) {
        this.setupAutoRefresh(adConfig.intervals || this.properties.refreshInterval);
      }
    },

    /**
     * 设置自动刷新
     * @param {number} interval 刷新间隔（秒）
     */
    setupAutoRefresh(interval) {
      this.clearRefreshTimer();
      
      if (interval > 0) {
        this.refreshTimer = setInterval(() => {
          this.refreshAd();
        }, interval * 1000);
      }
    },

    /**
     * 清除刷新定时器
     */
    clearRefreshTimer() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    /**
     * 刷新广告
     */
    refreshAd() {
      console.log('刷新Banner广告');
      // banner广告会自动刷新，这里主要用于统计
      this.adManager.reportShow('banner');
    },

    /**
     * 广告加载成功
     */
    onAdLoad() {
      console.log('Banner广告加载成功');
      this.setData({ 
        loading: false,
        showError: false 
      });
      this.adManager.reportShow('banner');
      
      // 触发自定义事件
      this.triggerEvent('adload', {
        type: 'banner'
      });
    },

    /**
     * 广告加载失败
     */
    onAdError(e) {
      console.error('Banner广告加载失败:', e.detail);
      
      const { errCode, errMsg } = e.detail;
      this.adManager.reportError('banner', errCode, errMsg);
      
      this.setData({ 
        loading: false,
        showError: true,
        errorMsg: `广告加载失败: ${errMsg || '未知错误'}`
      });

      // 触发自定义事件
      this.triggerEvent('aderror', {
        type: 'banner',
        errCode,
        errMsg
      });
    },

    /**
     * 广告点击
     */
    onAdClick() {
      console.log('Banner广告被点击');
      this.adManager.reportClick('banner');
      
      // 触发自定义事件
      this.triggerEvent('adclick', {
        type: 'banner'
      });
    },

    /**
     * 广告关闭
     */
    onAdClose() {
      console.log('Banner广告被关闭');
      
      // 触发自定义事件
      this.triggerEvent('adclose', {
        type: 'banner'
      });
    },

    /**
     * 重新加载广告
     */
    reloadAd() {
      this.setData({ 
        showError: false,
        loading: true 
      });
      
      // 延迟一段时间后重新检查
      setTimeout(() => {
        this.checkAndInitAd();
      }, 1000);
    }
  }
});
