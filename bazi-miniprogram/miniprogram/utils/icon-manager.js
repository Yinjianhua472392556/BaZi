/**
 * 图标管理器 - 简化版本
 * 注：Tab图标现在完全使用app.json中的静态配置，不再需要动态下载
 */

class IconManager {
  constructor() {
    console.log('[IconManager] 使用静态图标配置 - 不再需要动态下载')
  }

  /**
   * 初始化图标管理器 - 简化版本
   */
  async init() {
    try {
      console.log('[IconManager] 静态图标配置已启用')
      console.log('[IconManager] Tab图标路径配置:')
      console.log('  - 八字测算: /images/tab-icons/bazi_normal.png | bazi_selected.png')
      console.log('  - 智能起名: /images/tab-icons/naming_normal.png | naming_selected.png')
      console.log('  - 节日列表: /images/tab-icons/festival_normal.png | festival_selected.png')
      console.log('  - 生肖配对: /images/tab-icons/zodiac_normal.png | zodiac_selected.png')
      console.log('  - 个人中心: /images/tab-icons/profile_normal.png | profile_selected.png')
      
      return true
      
    } catch (error) {
      console.error('[IconManager] 初始化失败:', error)
      return false
    }
  }

  /**
   * 获取缓存信息 - 简化版本
   */
  getCacheInfo() {
    return {
      hasCache: true,
      config: { version: "static", type: "local_files" },
      iconPaths: "使用app.json静态配置",
      currentTheme: 'static'
    }
  }
}

// 创建全局实例
const iconManager = new IconManager()

module.exports = {
  iconManager,
  IconManager
}
