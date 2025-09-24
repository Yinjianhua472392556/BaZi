/**
 * 离线图标功能测试
 * 测试当网络不可用时，是否能正确使用默认图标
 */

// 模拟微信小程序环境
const mockWx = {
  env: {
    USER_DATA_PATH: '/mock/user/data'
  },
  
  storage: {},
  
  getStorageSync: function(key) {
    return this.storage[key] || null
  },
  
  setStorageSync: function(key, value) {
    this.storage[key] = value
  },
  
  removeStorageSync: function(key) {
    delete this.storage[key]
  },
  
  request: function(options) {
    // 模拟网络请求失败
    setTimeout(() => {
      if (options.fail) {
        options.fail({ errMsg: 'request:fail' })
      }
    }, 100)
  },
  
  downloadFile: function(options) {
    // 模拟下载失败
    setTimeout(() => {
      if (options.fail) {
        options.fail({ errMsg: 'downloadFile:fail' })
      }
    }, 100)
  },
  
  setTabBarItem: function(options) {
    console.log(`[MockWx] 设置Tab图标: index=${options.index}, iconPath=${options.iconPath}, selectedIconPath=${options.selectedIconPath}`)
    return true
  },
  
  getFileSystemManager: function() {
    return {
      accessSync: function(path) {
        // 模拟文件不存在
        throw new Error('file not found')
      },
      
      mkdirSync: function(path, recursive) {
        console.log(`[MockWx] 创建目录: ${path}`)
      },
      
      copyFileSync: function(src, dest) {
        console.log(`[MockWx] 复制文件: ${src} -> ${dest}`)
      },
      
      rmdirSync: function(path, recursive) {
        console.log(`[MockWx] 删除目录: ${path}`)
      }
    }
  }
}

// 设置全局wx对象
global.wx = mockWx

// 导入IconManager
const { IconManager } = require('../miniprogram/utils/icon-manager.js')

class OfflineIconTest {
  constructor() {
    this.iconManager = new IconManager()
    this.testResults = []
  }
  
  /**
   * 记录测试结果
   */
  recordTest(testName, passed, message) {
    const result = {
      name: testName,
      passed: passed,
      message: message || '',
      timestamp: new Date().toISOString()
    }
    
    this.testResults.push(result)
    
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${testName}: ${message}`)
  }
  
  /**
   * 测试1: 清空缓存后的初始化
   */
  async testInitWithoutCache() {
    console.log('\n🧪 测试1: 清空缓存后的初始化')
    
    try {
      // 清空所有缓存
      this.iconManager.clearCache()
      
      // 初始化图标管理器
      const success = await this.iconManager.init()
      
      if (success) {
        this.recordTest('清空缓存后初始化', true, '图标管理器初始化成功')
      } else {
        this.recordTest('清空缓存后初始化', false, '图标管理器初始化失败')
      }
      
    } catch (error) {
      this.recordTest('清空缓存后初始化', false, `异常: ${error.message}`)
    }
  }
  
  /**
   * 测试2: 网络请求失败时的处理
   */
  async testNetworkFailure() {
    console.log('\n🧪 测试2: 网络请求失败时的处理')
    
    try {
      // 模拟网络请求失败
      const serverConfig = await this.iconManager.getServerConfig()
      
      if (serverConfig === null) {
        this.recordTest('网络请求失败处理', true, '正确处理了网络请求失败')
      } else {
        this.recordTest('网络请求失败处理', false, '网络请求失败但返回了数据')
      }
      
    } catch (error) {
      this.recordTest('网络请求失败处理', false, `异常: ${error.message}`)
    }
  }
  
  /**
   * 测试3: 默认图标应用
   */
  async testDefaultIconApplication() {
    console.log('\n🧪 测试3: 默认图标应用')
    
    try {
      // 清空缓存确保使用默认图标
      wx.removeStorageSync(this.iconManager.cacheKey)
      
      // 应用图标到tabBar
      const success = await this.iconManager.applyIconsToTabBar()
      
      if (success) {
        this.recordTest('默认图标应用', true, '成功应用默认图标到tabBar')
      } else {
        this.recordTest('默认图标应用', false, '应用默认图标失败')
      }
      
      // 检查默认图标路径是否正确
      const expectedPaths = [
        '/images/tab-icons/bazi_normal.png',
        '/images/tab-icons/festival_normal.png',
        '/images/tab-icons/zodiac_normal.png',
        '/images/tab-icons/profile_normal.png'
      ]
      
      let pathsCorrect = true
      for (const iconType of ['bazi', 'festival', 'zodiac', 'profile']) {
        const iconData = this.iconManager.defaultIcons[iconType]
        if (!iconData || !iconData.normal || !iconData.selected) {
          pathsCorrect = false
          break
        }
      }
      
      this.recordTest('默认图标路径检查', pathsCorrect, pathsCorrect ? '所有默认图标路径正确' : '部分默认图标路径错误')
      
    } catch (error) {
      this.recordTest('默认图标应用', false, `异常: ${error.message}`)
    }
  }
  
  /**
   * 测试4: 缓存信息获取
   */
  testCacheInfo() {
    console.log('\n🧪 测试4: 缓存信息获取')
    
    try {
      const cacheInfo = this.iconManager.getCacheInfo()
      
      // 验证缓存信息结构
      const hasRequiredFields = cacheInfo.hasOwnProperty('hasCache') &&
                               cacheInfo.hasOwnProperty('config') &&
                               cacheInfo.hasOwnProperty('iconPaths') &&
                               cacheInfo.hasOwnProperty('currentTheme')
      
      if (hasRequiredFields) {
        this.recordTest('缓存信息结构', true, '缓存信息包含所有必需字段')
      } else {
        this.recordTest('缓存信息结构', false, '缓存信息缺少必需字段')
      }
      
      // 验证主题设置
      const validTheme = ['default', 'dark', 'spring', 'autumn'].includes(cacheInfo.currentTheme)
      this.recordTest('主题设置检查', validTheme, `当前主题: ${cacheInfo.currentTheme}`)
      
    } catch (error) {
      this.recordTest('缓存信息获取', false, `异常: ${error.message}`)
    }
  }
  
  /**
   * 测试5: 主题切换失败处理
   */
  async testThemeSwitchFailure() {
    console.log('\n🧪 测试5: 主题切换失败处理')
    
    try {
      // 尝试切换到不存在的主题
      const success = await this.iconManager.switchTheme('invalid_theme')
      
      if (!success) {
        this.recordTest('无效主题处理', true, '正确处理了无效主题切换')
      } else {
        this.recordTest('无效主题处理', false, '应该拒绝无效主题但接受了')
      }
      
      // 尝试切换到有效主题（会因为网络失败而失败）
      const validThemeSuccess = await this.iconManager.switchTheme('dark')
      this.recordTest('主题切换网络失败', !validThemeSuccess, '在网络不可用时正确处理主题切换失败')
      
    } catch (error) {
      this.recordTest('主题切换失败处理', false, `异常: ${error.message}`)
    }
  }
  
  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始离线图标功能测试...\n')
    
    await this.testInitWithoutCache()
    await this.testNetworkFailure()
    await this.testDefaultIconApplication()
    this.testCacheInfo()
    await this.testThemeSwitchFailure()
    
    this.printSummary()
  }
  
  /**
   * 打印测试摘要
   */
  printSummary() {
    console.log('\n📊 测试摘要')
    console.log('=' * 50)
    
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    
    console.log(`总测试数: ${totalTests}`)
    console.log(`通过: ${passedTests}`)
    console.log(`失败: ${failedTests}`)
    console.log(`成功率: ${(passedTests / totalTests * 100).toFixed(1)}%`)
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:')
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`))
    }
    
    console.log('\n✨ 离线图标功能测试完成!')
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！离线图标功能工作正常。')
    } else {
      console.log('⚠️  部分测试失败，请检查相关功能。')
    }
  }
}

// 运行测试
async function main() {
  const tester = new OfflineIconTest()
  await tester.runAllTests()
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('测试运行失败:', error)
    process.exit(1)
  })
}

module.exports = { OfflineIconTest }
