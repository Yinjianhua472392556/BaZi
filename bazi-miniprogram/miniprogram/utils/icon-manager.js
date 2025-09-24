/**
 * 图标管理器 - 动态图标下载和缓存
 */

class IconManager {
  constructor() {
    this.baseUrl = 'http://localhost:8000/api/v1/tab-icons'
    this.cacheKey = 'bazi_app_icons'
    this.configKey = 'bazi_app_icon_config'
    this.version = '1.0.0'
    
    // 默认图标配置
    this.defaultIcons = {
      bazi: { normal: '', selected: '' },
      festival: { normal: '', selected: '' },
      zodiac: { normal: '', selected: '' },
      profile: { normal: '', selected: '' }
    }
    
    // 支持的主题
    this.themes = {
      default: {
        normal: '#666666',
        selected: '#C8860D'
      },
      dark: {
        normal: '#888888',
        selected: '#FFD700'
      },
      spring: {
        normal: '#8B4513',
        selected: '#FF6B6B'
      },
      autumn: {
        normal: '#A0522D',
        selected: '#FF8C00'
      }
    }
  }

  /**
   * 初始化图标管理器
   */
  async init() {
    try {
      console.log('[IconManager] 开始初始化图标管理器')
      
      // 检查是否需要更新图标
      const needUpdate = await this.checkForUpdates()
      
      if (needUpdate) {
        console.log('[IconManager] 需要更新图标，开始下载...')
        await this.downloadAllIcons()
      } else {
        console.log('[IconManager] 图标已是最新版本')
      }
      
      // 应用图标到tabBar
      await this.applyIconsToTabBar()
      
      console.log('[IconManager] 图标管理器初始化完成')
      return true
      
    } catch (error) {
      console.error('[IconManager] 初始化失败:', error)
      // 初始化失败时使用文字标签
      return false
    }
  }

  /**
   * 检查是否需要更新图标
   */
  async checkForUpdates() {
    try {
      // 获取本地配置
      const localConfig = wx.getStorageSync(this.configKey)
      
      if (!localConfig) {
        console.log('[IconManager] 本地无配置，需要首次下载')
        return true
      }
      
      // 获取服务器配置
      const serverConfig = await this.getServerConfig()
      
      if (!serverConfig) {
        console.log('[IconManager] 无法获取服务器配置，使用本地缓存')
        return false
      }
      
      // 比较版本
      const needUpdate = localConfig.version !== serverConfig.version ||
                        localConfig.last_updated !== serverConfig.last_updated
      
      console.log('[IconManager] 版本检查:', {
        local: localConfig.version,
        server: serverConfig.version,
        needUpdate
      })
      
      return needUpdate
      
    } catch (error) {
      console.error('[IconManager] 检查更新失败:', error)
      return false
    }
  }

  /**
   * 获取服务器配置
   */
  async getServerConfig() {
    return new Promise((resolve) => {
      wx.request({
        url: `${this.baseUrl}/config`,
        method: 'GET',
        timeout: 5000,
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data.data)
          } else {
            console.error('[IconManager] 获取服务器配置失败:', res)
            resolve(null)
          }
        },
        fail: (error) => {
          console.error('[IconManager] 请求服务器配置失败:', error)
          resolve(null)
        }
      })
    })
  }

  /**
   * 下载所有图标
   */
  async downloadAllIcons() {
    try {
      const iconTypes = ['bazi', 'festival', 'zodiac', 'profile']
      const styles = ['normal', 'selected']
      const currentTheme = this.getCurrentTheme()
      
      const downloadPromises = []
      const iconPaths = {}
      
      // 创建下载任务
      for (const iconType of iconTypes) {
        iconPaths[iconType] = {}
        
        for (const style of styles) {
          const promise = this.downloadSingleIcon(iconType, style, currentTheme)
          downloadPromises.push(promise)
          
          // 将promise结果映射到iconPaths
          promise.then(localPath => {
            iconPaths[iconType][style] = localPath
          }).catch(error => {
            console.error(`[IconManager] 下载${iconType}_${style}失败:`, error)
            iconPaths[iconType][style] = ''
          })
        }
      }
      
      // 等待所有下载完成
      await Promise.allSettled(downloadPromises)
      
      // 保存图标路径到本地存储
      wx.setStorageSync(this.cacheKey, iconPaths)
      
      // 保存配置信息
      const serverConfig = await this.getServerConfig()
      if (serverConfig) {
        wx.setStorageSync(this.configKey, {
          ...serverConfig,
          theme: currentTheme,
          cached_at: new Date().toISOString()
        })
      }
      
      console.log('[IconManager] 所有图标下载完成:', iconPaths)
      return iconPaths
      
    } catch (error) {
      console.error('[IconManager] 下载图标失败:', error)
      throw error
    }
  }

  /**
   * 下载单个图标
   */
  async downloadSingleIcon(iconType, style, theme) {
    return new Promise((resolve, reject) => {
      const themeColor = this.themes[theme] ? this.themes[theme][style] : this.themes.default[style]
      const fileName = `${iconType}_${style}.png`
      
      wx.downloadFile({
        url: `${this.baseUrl}/${iconType}?style=${style}&theme_color=${encodeURIComponent(themeColor)}`,
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200) {
            // 保存到本地文件系统
            const fs = wx.getFileSystemManager()
            const localPath = `${wx.env.USER_DATA_PATH}/icons/${fileName}`
            
            try {
              // 确保目录存在
              try {
                fs.mkdirSync(`${wx.env.USER_DATA_PATH}/icons`, true)
              } catch (e) {
                // 目录可能已存在，忽略错误
              }
              
              // 复制文件到本地
              fs.copyFileSync(res.tempFilePath, localPath)
              
              console.log(`[IconManager] ${fileName} 下载成功:`, localPath)
              resolve(localPath)
              
            } catch (error) {
              console.error(`[IconManager] 保存${fileName}失败:`, error)
              reject(error)
            }
          } else {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error(`[IconManager] 下载${fileName}失败:`, error)
          reject(error)
        }
      })
    })
  }

  /**
   * 应用图标到tabBar
   */
  async applyIconsToTabBar() {
    try {
      // 获取缓存的图标路径
      const iconPaths = wx.getStorageSync(this.cacheKey)
      
      if (!iconPaths || Object.keys(iconPaths).length === 0) {
        console.log('[IconManager] 没有缓存图标，保持文字模式')
        return false
      }
      
      // tabBar配置映射
      const tabConfig = [
        { index: 0, iconType: 'bazi' },
        { index: 1, iconType: 'festival' },
        { index: 2, iconType: 'zodiac' },
        { index: 3, iconType: 'profile' }
      ]
      
      // 应用图标到每个tab
      for (const config of tabConfig) {
        const { index, iconType } = config
        const iconData = iconPaths[iconType]
        
        if (iconData && iconData.normal && iconData.selected) {
          try {
            // 检查文件是否存在
            if (this.checkFileExists(iconData.normal) && this.checkFileExists(iconData.selected)) {
              wx.setTabBarItem({
                index: index,
                iconPath: iconData.normal,
                selectedIconPath: iconData.selected
              })
              
              console.log(`[IconManager] Tab ${index} (${iconType}) 图标应用成功`)
            } else {
              console.warn(`[IconManager] Tab ${index} 图标文件不存在`)
            }
          } catch (error) {
            console.error(`[IconManager] 应用Tab ${index} 图标失败:`, error)
          }
        }
      }
      
      return true
      
    } catch (error) {
      console.error('[IconManager] 应用图标失败:', error)
      return false
    }
  }

  /**
   * 检查文件是否存在
   */
  checkFileExists(filePath) {
    try {
      const fs = wx.getFileSystemManager()
      fs.accessSync(filePath)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    try {
      const savedTheme = wx.getStorageSync('icon_theme')
      return savedTheme || 'default'
    } catch (error) {
      return 'default'
    }
  }

  /**
   * 切换主题
   */
  async switchTheme(themeName) {
    try {
      if (!this.themes[themeName]) {
        console.error('[IconManager] 不支持的主题:', themeName)
        return false
      }
      
      // 保存主题设置
      wx.setStorageSync('icon_theme', themeName)
      
      // 重新下载图标
      await this.downloadAllIcons()
      
      // 应用新图标
      await this.applyIconsToTabBar()
      
      console.log('[IconManager] 主题切换成功:', themeName)
      return true
      
    } catch (error) {
      console.error('[IconManager] 切换主题失败:', error)
      return false
    }
  }

  /**
   * 清除图标缓存
   */
  clearCache() {
    try {
      // 删除本地图标文件
      const fs = wx.getFileSystemManager()
      try {
        fs.rmdirSync(`${wx.env.USER_DATA_PATH}/icons`, true)
      } catch (error) {
        console.log('[IconManager] 删除图标目录失败或目录不存在')
      }
      
      // 清除存储
      wx.removeStorageSync(this.cacheKey)
      wx.removeStorageSync(this.configKey)
      
      console.log('[IconManager] 图标缓存已清除')
      return true
      
    } catch (error) {
      console.error('[IconManager] 清除缓存失败:', error)
      return false
    }
  }

  /**
   * 获取缓存信息
   */
  getCacheInfo() {
    try {
      const iconPaths = wx.getStorageSync(this.cacheKey)
      const config = wx.getStorageSync(this.configKey)
      
      return {
        hasCache: !!(iconPaths && Object.keys(iconPaths).length > 0),
        config: config,
        iconPaths: iconPaths,
        currentTheme: this.getCurrentTheme()
      }
      
    } catch (error) {
      console.error('[IconManager] 获取缓存信息失败:', error)
      return {
        hasCache: false,
        config: null,
        iconPaths: null,
        currentTheme: 'default'
      }
    }
  }
}

// 创建全局实例
const iconManager = new IconManager()

module.exports = {
  iconManager,
  IconManager
}
