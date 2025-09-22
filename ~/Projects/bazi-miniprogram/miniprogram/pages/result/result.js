// result.js
const app = getApp()

Page({
  data: {
    resultData: {},
    wuxingList: []
  },

  onLoad(options) {
    // 从页面参数获取结果数据
    if (options.data) {
      try {
        const resultData = JSON.parse(decodeURIComponent(options.data))
        console.log('接收到的结果数据:', resultData)
        
        this.setData({
          resultData: resultData
        })
        
        // 处理新的数据结构
        if (resultData.wuxing) {
          this.processWuxingData(resultData.wuxing)
        } else {
          console.warn('五行数据缺失')
        }
      } catch (error) {
        console.error('解析结果数据失败:', error)
        this.handleDataError()
      }
    } else {
      this.handleDataError()
    }
  },

  // 处理五行数据
  processWuxingData(wuxing) {
    if (!wuxing) return

    const wuxingNames = ['木', '火', '土', '金', '水']
    const wuxingColors = {
      '木': '#22C55E',  // 绿色
      '火': '#EF4444',  // 红色
      '土': '#A3A3A3',  // 灰色
      '金': '#F59E0B',  // 金色
      '水': '#3B82F6'   // 蓝色
    }

    // 计算总数
    const total = Object.values(wuxing).reduce((sum, count) => sum + count, 0)

    const wuxingList = wuxingNames.map(name => {
      const count = wuxing[name] || 0
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0
      
      return {
        name: name,
        count: count,
        percentage: percentage,
        color: wuxingColors[name]
      }
    })

    this.setData({
      wuxingList: wuxingList
    })
  },

  // 处理数据错误
  handleDataError() {
    wx.showModal({
      title: '数据加载失败',
      content: '未能获取到测算结果，请重新测算',
      showCancel: false,
      success: () => {
        wx.navigateBack()
      }
    })
  },

  // 保存到历史记录
  saveToHistory() {
    try {
      app.saveBaziResult(this.data.resultData)
      wx.showToast({
        title: '已保存到历史记录',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存历史记录失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 分享结果
  shareResult() {
    const { resultData } = this.data
    const shareData = {
      title: `${resultData.birthInfo.name || '我'}的八字运势测算结果`,
      path: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`,
      imageUrl: '' // 可以添加分享图片
    }

    // 触发分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    })
  },

  // 重新测算
  calculateAgain() {
    wx.navigateBack()
  },

  // 返回首页
  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    const { resultData } = this.data
    let name = '我'
    
    // 处理新的数据结构
    if (resultData.user_info?.name) {
      name = resultData.user_info.name
    } else if (resultData.birthInfo?.name) {
      name = resultData.birthInfo.name
    }
    
    return {
      title: `${name}的八字运势测算结果`,
      path: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`,
      imageUrl: ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { resultData } = this.data
    let name = '我'
    
    // 处理新的数据结构
    if (resultData.user_info?.name) {
      name = resultData.user_info.name
    } else if (resultData.birthInfo?.name) {
      name = resultData.birthInfo.name
    }
    
    return {
      title: `${name}的八字运势测算 - 八字运势小程序`,
      query: `data=${encodeURIComponent(JSON.stringify(resultData))}`,
      imageUrl: ''
    }
  },

  // 页面显示时的处理
  onShow() {
    // 设置页面标题
    const resultData = this.data.resultData
    let name = '匿名用户'
    
    // 处理新的数据结构
    if (resultData.user_info?.name) {
      name = resultData.user_info.name
    } else if (resultData.birthInfo?.name) {
      // 兼容老格式
      name = resultData.birthInfo.name
    }
    
    wx.setNavigationBarTitle({
      title: `${name}的八字结果`
    })
  },

  // 复制八字到剪贴板
  copyBazi() {
    const { resultData } = this.data
    let baziText = ''
    
    // 处理新的数据结构
    if (resultData.bazi) {
      baziText = `${resultData.bazi.year} ${resultData.bazi.month} ${resultData.bazi.day} ${resultData.bazi.hour}`
    } else if (resultData.year) {
      // 兼容老格式
      baziText = `${resultData.year} ${resultData.month} ${resultData.day} ${resultData.hour}`
    }
    
    if (baziText) {
      wx.setClipboardData({
        data: baziText,
        success: () => {
          wx.showToast({
            title: '八字已复制',
            icon: 'success'
          })
        }
      })
    } else {
      wx.showToast({
        title: '八字数据缺失',
        icon: 'none'
      })
    }
  },

  // 查看详细分析（预留功能）
  viewDetailAnalysis() {
    wx.showToast({
      title: '详细分析功能开发中',
      icon: 'none'
    })
  }
})
