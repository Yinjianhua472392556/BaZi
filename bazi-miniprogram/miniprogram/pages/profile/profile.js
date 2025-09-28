// profile.js
Page({
  data: {
    showCollectedModal: false,
    showCollectedDetail: false,
    collectedNames: [],
    selectedCollectedName: null
  },

  onLoad() {
    // 页面加载时的初始化逻辑
  },

  onShow() {
    // 页面显示时的逻辑
    this.loadCollectedNames();
  },

  /**
   * 加载收藏的名字
   */
  loadCollectedNames() {
    const collectedNames = wx.getStorageSync('collectedNames') || [];
    
    // 格式化收藏时间
    const formattedNames = collectedNames.map(name => ({
      ...name,
      collected_time_formatted: this.formatCollectedTime(name.collected_time)
    }));
    
    this.setData({
      collectedNames: formattedNames
    });
  },

  /**
   * 格式化收藏时间
   */
  formatCollectedTime(isoString) {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  /**
   * 查看收藏的名字
   */
  viewCollectedNames() {
    this.loadCollectedNames();
    this.setData({
      showCollectedModal: true
    });
  },

  /**
   * 关闭收藏模态框
   */
  closeCollectedModal() {
    this.setData({
      showCollectedModal: false
    });
  },

  /**
   * 查看收藏名字详情
   */
  viewCollectedDetail(e) {
    const index = e.currentTarget.dataset.index;
    const selectedName = this.data.collectedNames[index];
    
    this.setData({
      selectedCollectedName: selectedName,
      showCollectedDetail: true
    });
  },

  /**
   * 关闭收藏详情模态框
   */
  closeCollectedDetail() {
    this.setData({
      showCollectedDetail: false,
      selectedCollectedName: null
    });
  },

  /**
   * 移除收藏
   */
  removeCollected(e) {
    const index = e.currentTarget.dataset.index;
    const name = this.data.collectedNames[index];
    
    wx.showModal({
      title: '确认删除',
      content: `确定要取消收藏"${name.full_name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从本地存储中移除
          let collectedNames = wx.getStorageSync('collectedNames') || [];
          collectedNames = collectedNames.filter(item => item.full_name !== name.full_name);
          wx.setStorageSync('collectedNames', collectedNames);
          
          // 更新页面数据
          this.loadCollectedNames();
          
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        }
      }
    });
  },

  // 关于小程序
  aboutApp() {
    wx.showModal({
      title: '关于八字运势小程序',
      content: '这是一个基于传统文化的娱乐性八字测算小程序，采用中国古代天干地支理论，为用户提供个性化的运势分析。\n\n✨ 主要功能：\n• 八字测算与分析\n• 五行平衡查看\n• 历史记录管理\n\n⚠️ 重要提醒：\n所有测算结果仅供娱乐参考，请理性对待，不要将其作为人生重大决策的依据。传统文化应以科学的态度去了解和欣赏。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#40E0D0'
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '八字运势测算 - 传统文化娱乐小程序',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '八字运势测算 - 传统文化娱乐小程序',
      query: 'from=timeline',
      imageUrl: '/images/share-bg.png'
    }
  }
})
