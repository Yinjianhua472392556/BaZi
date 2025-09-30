/**
 * 激励视频广告组件 - 简化版
 * 封装微信小程序的激励视频广告
 */

const AdManager = require('../../utils/ad-manager');

Component({
  properties: {
    // 页面名称，用于配置检查
    pageName: {
      type: String,
      value: ''
    },
    // 广告单元ID（可选）
    adUnitId: {
      type: String,
      value: ''
    },
    // 按钮文字
    buttonText: {
      type: String,
      value: '观看视频获得奖励'
    }
  },

  data: {
    // 是否显示组件
    showComponent: false,
    // 按钮状态：normal, loading, disabled
    buttonState: 'normal',
    // 错误信息
    errorMsg: '',
    // 是否显示错误提示
    showError: false
  },

  lifetimes: {
    attached() {
      this.adManager = AdManager.getInstance();
      this.checkAndInitComponent();
    },

    detached() {
      // 清理资源
      this.cleanUp();
    }
  },

  methods: {
    /**
     * 检查并初始化组件
     */
    checkAndInitComponent() {
      const { pageName } = this.properties;
      
      // 检查是否应该显示激励视频广告
      if (!this.adManager.shouldShowAd('rewardVideo', pageName)) {
        console.log('激励视频广告未启用或不满足显示条件');
        this.setData({ showComponent: false });
        return;
      }

      // 获取广告配置
      const adConfig = this.adManager.getAdConfiguration('rewardVideo', pageName);
      if (!adConfig || !adConfig.unitId) {
        console.log('激励视频广告配置无效');
        this.setData({ showComponent: false });
        return;
      }

      this.setData({ showComponent: true });
      console.log('激励视频广告组件初始化完成');
    },

    /**
     * 点击观看广告按钮
     */
    onWatchAdClick() {
      // 检查按钮状态
      if (this.data.buttonState !== 'normal') {
        return;
      }

      this.showRewardedVideoAd();
    },

    /**
     * 显示激励视频广告
     */
    showRewardedVideoAd() {
      const { adUnitId, pageName } = this.properties;
      const adConfig = this.adManager.getAdConfiguration('rewardVideo', pageName);
      const finalUnitId = adUnitId || (adConfig && adConfig.unitId);

      if (!finalUnitId) {
        this.showError('广告配置错误');
        return;
      }

      this.setData({ 
        buttonState: 'loading',
        showError: false 
      });

      // 显示激励视频广告
      this.adManager.showRewardedVideoAd(finalUnitId, () => {
        // 用户完整观看了视频，给予奖励
        this.onRewardEarned();
      }).then(() => {
        console.log('激励视频广告显示成功');
        this.setData({ buttonState: 'normal' });
      }).catch((err) => {
        console.error('激励视频广告显示失败:', err);
        this.setData({ buttonState: 'normal' });
        this.showError(err.message || '广告加载失败，请稍后重试');
      });
    },

    /**
     * 用户获得奖励
     */
    onRewardEarned() {
      console.log('用户获得激励视频奖励');
      
      // 触发奖励事件
      this.triggerEvent('reward', {
        type: 'rewardVideo',
        timestamp: Date.now()
      });

      // 显示奖励获得提示
      wx.showToast({
        title: '奖励已获得！',
        icon: 'success',
        duration: 2000
      });
    },

    /**
     * 显示错误信息
     * @param {string} message 错误信息
     */
    showError(message) {
      console.error('[激励视频广告错误]:', message);
      
      this.setData({
        showError: true,
        errorMsg: message
      });

      // 3秒后自动隐藏错误信息
      setTimeout(() => {
        this.setData({ showError: false });
      }, 3000);
    },

    /**
     * 重试加载广告
     */
    retryLoad() {
      this.setData({
        showError: false,
        buttonState: 'normal'
      });
      
      // 延迟重试
      setTimeout(() => {
        this.checkAndInitComponent();
      }, 1000);
    },

    /**
     * 清理资源
     */
    cleanUp() {
      const { adUnitId, pageName } = this.properties;
      const adConfig = this.adManager.getAdConfiguration('rewardVideo', pageName);
      const finalUnitId = adUnitId || (adConfig && adConfig.unitId);
      
      if (finalUnitId) {
        this.adManager.destroyAd('reward', finalUnitId);
      }
    }
  }
});
