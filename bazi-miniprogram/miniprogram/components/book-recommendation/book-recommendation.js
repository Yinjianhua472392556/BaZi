// book-recommendation.js - 书籍推荐通用组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 推荐上下文 - 用于生成推荐
    context: {
      type: Object,
      value: {}
    },
    // 推荐数量
    count: {
      type: Number,
      value: 3
    },
    // 显示样式
    layout: {
      type: String,
      value: 'card' // card, list, minimal
    },
    // 是否显示标题
    showTitle: {
      type: Boolean,
      value: true
    },
    // 自定义标题
    title: {
      type: String,
      value: '相关书籍推荐'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    loading: true,
    recommendations: [],
    error: null,
    duplicateBooks: [] // 防重复推荐的本地存储
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      console.log('书籍推荐组件已挂载');
      this.loadDuplicateBooks();
      this.fetchRecommendations();
    }
  },

  /**
   * 监听属性变化
   */
  observers: {
    'context.**': function(context) {
      if (context && Object.keys(context).length > 0) {
        this.fetchRecommendations();
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 从本地存储加载已推荐过的书籍
     */
    loadDuplicateBooks() {
      try {
        const stored = wx.getStorageSync('book_recommendations_history');
        if (stored) {
          this.setData({
            duplicateBooks: stored
          });
        }
      } catch (error) {
        console.warn('加载书籍推荐历史失败:', error);
      }
    },

    /**
     * 保存推荐历史到本地存储
     */
    saveDuplicateBooks(bookIds) {
      try {
        const { duplicateBooks } = this.data;
        const newHistory = [...duplicateBooks, ...bookIds].slice(-20); // 只保留最近20条
        
        this.setData({
          duplicateBooks: newHistory
        });
        
        wx.setStorageSync('book_recommendations_history', newHistory);
      } catch (error) {
        console.warn('保存书籍推荐历史失败:', error);
      }
    },

    /**
     * 获取书籍推荐
     */
    async fetchRecommendations() {
      const { context, count } = this.properties;
      
      if (!context || Object.keys(context).length === 0) {
        console.warn('书籍推荐组件：缺少推荐上下文');
        return;
      }

      this.setData({ 
        loading: true, 
        error: null 
      });

      try {
        // 获取API基础URL
        const app = getApp();
        const apiBaseUrl = app.globalData.apiBaseUrl || 'http://localhost:8001';
        
        // 准备请求数据
        const requestData = {
          ...context,
          count: count,
          exclude_books: this.data.duplicateBooks // 排除已推荐的书籍
        };

        console.log('书籍推荐请求:', requestData);

        const response = await wx.request({
          url: `${apiBaseUrl}/api/v1/books/recommendations`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: requestData
        });

        if (response.statusCode === 200 && response.data.success) {
          const recommendations = response.data.data.recommendations || [];
          
          // 保存新推荐的书籍ID到历史记录
          const newBookIds = recommendations.map(book => book.book_id);
          this.saveDuplicateBooks(newBookIds);
          
          this.setData({
            recommendations: recommendations,
            loading: false
          });

          console.log('书籍推荐成功:', recommendations);
        } else {
          throw new Error(response.data.error || '获取推荐失败');
        }

      } catch (error) {
        console.error('获取书籍推荐失败:', error);
        this.setData({
          loading: false,
          error: error.message || '网络错误'
        });
        
        // 显示错误提示
        wx.showToast({
          title: '推荐加载失败',
          icon: 'none',
          duration: 2000
        });
      }
    },

    /**
     * 点击书籍 - 生成联盟链接并跳转
     */
    async onBookTap(event) {
      const { book } = event.currentTarget.dataset;
      
      if (!book) {
        console.error('书籍信息缺失');
        return;
      }

      // 显示加载提示
      wx.showLoading({
        title: '正在打开...',
        mask: true
      });

      try {
        // 生成联盟链接
        const linkResponse = await this.generateAffiliateLink(book);
        
        if (linkResponse.success) {
          const link = linkResponse.affiliate_link;
          const platform = book.platform;
          
          // 尝试跳转到对应的小程序或复制链接
          await this.jumpToShopping(link, platform, book);
        } else {
          throw new Error(linkResponse.error || '生成购买链接失败');
        }

      } catch (error) {
        console.error('处理书籍点击失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      } finally {
        wx.hideLoading();
      }

      // 触发自定义事件
      this.triggerEvent('bookclick', {
        book: book,
        action: 'click'
      });
    },

    /**
     * 生成联盟推广链接
     */
    async generateAffiliateLink(book) {
      try {
        const app = getApp();
        const apiBaseUrl = app.globalData.apiBaseUrl || 'http://localhost:8001';
        
        // 获取用户ID（可以是openid或其他唯一标识）
        const userId = wx.getStorageSync('user_openid') || 'anonymous';
        
        const response = await wx.request({
          url: `${apiBaseUrl}/api/v1/books/affiliate-link`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            book_id: book.book_id,
            platform: book.platform || 'taobao',
            user_id: userId
          }
        });

        if (response.statusCode === 200) {
          return response.data;
        } else {
          throw new Error('API请求失败');
        }

      } catch (error) {
        console.error('生成联盟链接失败:', error);
        return {
          success: false,
          message: error.message
        };
      }
    },

    /**
     * 跳转到购物平台
     */
    async jumpToShopping(link, platform, book) {
      // 根据平台选择对应的小程序AppID
      const platformConfig = {
        'taobao': {
          appId: 'wxbda7bbe1bc4a0ad7', // 手机淘宝官方小程序
          path: `pages/detail/detail?url=${encodeURIComponent(link)}`,
          name: '淘宝'
        },
        'jd': {
          appId: 'wx91d27dbf599dff74', // 京东购物官方小程序
          path: `pages/detail/detail?url=${encodeURIComponent(link)}`,
          name: '京东'
        },
        'pdd': {
          appId: 'wx32540bd863b27570', // 拼多多官方小程序
          path: `pages/detail/detail?url=${encodeURIComponent(link)}`,
          name: '拼多多'
        }
      };

      const config = platformConfig[platform];
      
      if (config) {
        // 优先尝试跳转到对应的小程序
        try {
          await wx.navigateToMiniProgram({
            appId: config.appId,
            path: config.path,
            extraData: {
              source: 'bazi_recommendation',
              book_id: book.book_id,
              tracking: Date.now()
            }
          });
          
          // 记录成功跳转
          console.log(`✅ 成功跳转到${config.name}小程序`);
          return;
          
        } catch (error) {
          console.warn(`⚠️ 跳转${config.name}小程序失败，使用备用方案:`, error);
          
          // 显示跳转失败提示
          wx.showToast({
            title: `无法打开${config.name}`,
            icon: 'none',
            duration: 1500
          });
        }
      }

      // 备用方案：复制链接到剪贴板
      try {
        await wx.setClipboardData({
          data: link
        });
        
        const platformName = config ? config.name : platform;
        wx.showModal({
          title: '购买链接已复制',
          content: `《${book.title}》的${platformName}购买链接已复制到剪贴板，请在浏览器或相应APP中打开购买。`,
          showCancel: false,
          confirmText: '知道了'
        });
        
        // 记录备用方案使用
        console.log(`📋 已复制${platformName}购买链接到剪贴板`);
        
      } catch (error) {
        console.error('❌ 复制链接失败:', error);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },

    /**
     * 刷新推荐
     */
    onRefresh() {
      this.fetchRecommendations();
    },

    /**
     * 收藏书籍
     */
    onCollect(event) {
      const { book } = event.currentTarget.dataset;
      
      try {
        // 获取已收藏的书籍
        const collected = wx.getStorageSync('collected_books') || [];
        
        // 检查是否已收藏
        const isCollected = collected.some(item => item.id === book.id);
        
        if (isCollected) {
          wx.showToast({
            title: '已收藏过了',
            icon: 'none'
          });
          return;
        }
        
        // 添加到收藏
        collected.push({
          ...book,
          collected_at: new Date().toISOString()
        });
        
        wx.setStorageSync('collected_books', collected);
        
        wx.showToast({
          title: '收藏成功',
          icon: 'success'
        });

        // 触发收藏事件
        this.triggerEvent('bookcollect', {
          book: book,
          action: 'collect'
        });

      } catch (error) {
        console.error('收藏失败:', error);
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        });
      }
    },

    /**
     * 分享书籍
     */
    onShare(event) {
      const { book } = event.currentTarget.dataset;
      
      // 触发分享事件，由父组件处理
      this.triggerEvent('bookshare', {
        book: book,
        action: 'share'
      });
    }
  }
});
