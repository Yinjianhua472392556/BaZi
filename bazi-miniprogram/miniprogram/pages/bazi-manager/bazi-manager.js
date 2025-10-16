// bazi-manager.js
const BaziDisplayManager = require('../../utils/bazi-display-manager')

Page({
  data: {
    baziList: [],
    customNotesCount: 0,
    todayDate: '',
    showEditModal: false,
    currentNote: '',
    editingFingerprint: ''
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadBaziList()
  },

  // 初始化页面
  initPage() {
    const today = new Date()
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}`
    
    this.setData({
      todayDate: todayStr
    })
    
    this.loadBaziList()
  },

  // 加载八字列表
  loadBaziList() {
    try {
      wx.showLoading({
        title: '加载中...'
      })

      // 获取唯一八字记录和运势数据
      const baziList = BaziDisplayManager.getDailyFortunesForAllBazi()
      
      // 统计自定义备注数量
      const customNotesCount = baziList.filter(item => item.has_custom_note).length
      
      this.setData({
        baziList: baziList,
        customNotesCount: customNotesCount
      })
      
      console.log('八字列表加载完成:', {
        count: baziList.length,
        customNotesCount: customNotesCount
      })

    } catch (error) {
      console.error('加载八字列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 设置主要八字
  setPrimary(e) {
    const fingerprint = e.currentTarget.dataset.fingerprint
    
    wx.showModal({
      title: '设置主要八字',
      content: '确定将此八字设为主要八字吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            BaziDisplayManager.setPrimaryBazi(fingerprint)
            
            // 重新加载列表
            this.loadBaziList()
            
            wx.showToast({
              title: '设置成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('设置主要八字失败:', error)
            wx.showToast({
              title: '设置失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 编辑备注
  editNote(e) {
    const fingerprint = e.currentTarget.dataset.fingerprint
    const currentNote = e.currentTarget.dataset.currentNote || ''
    
    this.setData({
      showEditModal: true,
      currentNote: currentNote,
      editingFingerprint: fingerprint
    })
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({
      currentNote: e.detail.value
    })
  },

  // 保存备注
  saveNote() {
    const { currentNote, editingFingerprint } = this.data
    
    if (!editingFingerprint) {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      return
    }

    try {
      BaziDisplayManager.setCustomNote(editingFingerprint, currentNote)
      
      this.setData({
        showEditModal: false,
        currentNote: '',
        editingFingerprint: ''
      })
      
      // 重新加载列表
      this.loadBaziList()
      
      wx.showToast({
        title: currentNote ? '备注已保存' : '备注已清除',
        icon: 'success'
      })
      
    } catch (error) {
      console.error('保存备注失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 关闭编辑弹窗
  closeEditModal() {
    this.setData({
      showEditModal: false,
      currentNote: '',
      editingFingerprint: ''
    })
  },

  // 删除备注
  deleteNote(e) {
    const fingerprint = e.currentTarget.dataset.fingerprint
    
    wx.showModal({
      title: '删除备注',
      content: '确定删除此备注吗？删除后将恢复为自动生成的名称。',
      success: (res) => {
        if (res.confirm) {
          try {
            BaziDisplayManager.removeCustomNote(fingerprint)
            
            // 重新加载列表
            this.loadBaziList()
            
            wx.showToast({
              title: '备注已删除',
              icon: 'success'
            })
          } catch (error) {
            console.error('删除备注失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 查看详情
  viewDetail(e) {
    const fingerprint = e.currentTarget.dataset.fingerprint
    const targetItem = this.data.baziList.find(item => item.fingerprint === fingerprint)
    
    if (!targetItem) {
      wx.showToast({
        title: '记录不存在',
        icon: 'error'
      })
      return
    }

    // 跳转到结果详情页
    const resultData = {
      bazi_result: targetItem.bazi_result,
      wuxing_analysis: targetItem.wuxing_analysis,
      comprehensive_analysis: targetItem.comprehensive_analysis,
      birthInfo: targetItem.birthInfo
    }

    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}&from=manager`
    })
  },

  // 刷新所有运势
  refreshAllFortunes() {
    wx.showModal({
      title: '刷新运势',
      content: '确定刷新所有八字的今日运势吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '刷新中...'
          })

          try {
            // 清除运势缓存
            wx.removeStorageSync('dailyFortuneCache')
            wx.removeStorageSync('universalFortuneCache')
            
            // 重新加载列表
            setTimeout(() => {
              this.loadBaziList()
              wx.hideLoading()
              wx.showToast({
                title: '刷新完成',
                icon: 'success'
              })
            }, 1000)
            
          } catch (error) {
            console.error('刷新运势失败:', error)
            wx.hideLoading()
            wx.showToast({
              title: '刷新失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 导出数据
  exportData() {
    wx.showModal({
      title: '导出数据',
      content: '将为您生成八字数据总结，可以截图保存或分享。',
      success: (res) => {
        if (res.confirm) {
          this.generateDataSummary()
        }
      }
    })
  },

  // 生成数据总结
  generateDataSummary() {
    const { baziList, customNotesCount } = this.data
    
    let summary = `八字管理数据总结\n`
    summary += `生成时间：${new Date().toLocaleString()}\n\n`
    summary += `总计八字记录：${baziList.length} 个\n`
    summary += `自定义备注：${customNotesCount} 个\n\n`
    
    summary += `详细记录：\n`
    baziList.forEach((item, index) => {
      summary += `${index + 1}. ${item.display_name}\n`
      summary += `   八字：${item.bazi_result.year_pillar} ${item.bazi_result.month_pillar} ${item.bazi_result.day_pillar} ${item.bazi_result.hour_pillar}\n`
      summary += `   出生：${item.birthInfo.date} ${item.birthInfo.time}\n`
      if (item.daily_fortune) {
        summary += `   今日运势：${item.daily_fortune.overall_score}/5星\n`
      }
      summary += `\n`
    })
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: summary,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showModal({
          title: '数据总结',
          content: summary,
          showCancel: false
        })
      }
    })
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '八字管理 - 管理您的八字记录',
      path: '/pages/bazi-manager/bazi-manager'
    }
  }
})
