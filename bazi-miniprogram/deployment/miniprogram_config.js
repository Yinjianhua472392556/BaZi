/**
 * ===============================================
 * 八字运势小程序 - 发布配置文件
 * ===============================================
 * 
 * 使用说明：
 * 1. 根据你的实际情况修改下面的配置
 * 2. 运行: node prepare_miniprogram.js
 * 3. 按照生成的指南完成发布
 * 
 * ===============================================
 */

module.exports = {
  // 🔧 【必填】小程序基本信息
  // ===============================================
  appId: 'your_miniprogram_appid',              // 替换为你的小程序AppID
  appName: '八字运势',                           // 小程序名称
  appDescription: '专业八字测算和智能起名服务',    // 小程序描述
  
  // 📝 【必填】版本信息
  // ===============================================
  version: '1.0.0',                            // 版本号（建议使用语义化版本）
  versionDescription: '首次发布版本，包含八字测算、智能起名、生肖配对等功能',
  
  // 🌐 【必填】服务器配置
  // ===============================================
  production: {
    apiDomain: 'https://api.yourdomain.com',    // 替换为你的生产环境API域名
    backupDomain: '',                          // 备用域名（可选）
    environment: 'production'
  },
  
  development: {
    apiDomain: 'http://10.60.20.222:8001',     // 开发环境API地址
    environment: 'development'
  },
  
  // 🔐 【必填】微信后台信息
  // ===============================================
  wechat: {
    account: 'your-wechat-email@example.com',   // 替换为你的微信账号邮箱
    appSecret: 'your_app_secret',              // 小程序密钥（用于API调用）
    privateKeyPath: '',                        // 私钥文件路径（用于代码上传）
  },
  
  // 🎯 【可选】发布设置
  // ===============================================
  release: {
    autoUpload: true,                          // 是否自动上传代码
    autoSubmitReview: false,                   // 是否自动提交审核（建议手动）
    environment: 'production',                 // 发布环境
    robot: 1,                                  // 上传机器人编号（1-30）
    qrcodeFormat: 'image',                     // 二维码格式
    qrcodeOutputDest: './preview_qrcode.jpg',  // 二维码保存路径
  },
  
  // 📱 【可选】小程序页面配置
  // ===============================================
  pages: [
    'pages/index/index',                       // 首页
    'pages/result/result',                     // 结果页
    'pages/history/history',                   // 历史记录
    'pages/naming/naming',                     // 智能起名
    'pages/festival/festival',                 // 节日运势
    'pages/zodiac-matching/zodiac-matching',   // 生肖配对
    'pages/profile/profile'                    // 个人中心
  ],
  
  // 🎨 【可选】主题配置
  // ===============================================
  theme: {
    navigationBarTitleText: '八字运势',
    navigationBarBackgroundColor: '#2c3e50',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f8f9fa',
    backgroundTextStyle: 'dark'
  },
  
  // 🔒 【可选】权限配置
  // ===============================================
  permissions: {
    'scope.userInfo': {
      desc: '用于个性化服务和历史记录管理'
    },
    'scope.userLocation': {
      desc: '用于精确时区计算，提升测算准确性',
      required: false
    }
  },
  
  // 📊 【可选】分析和监控
  // ===============================================
  analytics: {
    enable: true,                              // 是否启用数据分析
    providers: ['wechat'],                     // 分析服务提供商
    events: [                                  // 要跟踪的事件
      'calculate_bazi',
      'generate_names', 
      'zodiac_matching',
      'view_history'
    ]
  },
  
  // 🚀 【可选】性能优化
  // ===============================================
  optimization: {
    preloadPages: ['pages/index/index'],       // 预加载页面
    lazyCodeLoading: true,                     // 懒加载代码
    compressImages: true,                      // 压缩图片
    enablePullDownRefresh: false,              // 全局下拉刷新
    enableReachBottom: false                   // 全局上拉触底
  },
  
  // 🛡️【可选】安全配置
  // ===============================================
  security: {
    checkDomain: true,                         // 检查域名安全
    enableHttps: true,                         // 强制HTTPS
    validateResponse: true,                    // 验证API响应
    encryptStorage: false                      // 本地存储加密
  },
  
  // 📋 【可选】审核信息
  // ===============================================
  review: {
    category: '工具',                          // 小程序分类
    tags: ['测算', '传统文化', '娱乐', '工具'],   // 标签
    testAccount: {                             // 测试账号
      username: '',
      password: '',
      desc: '提供给微信审核团队的测试账号'
    },
    remark: '本小程序为娱乐性质的八字测算工具，基于传统文化，仅供娱乐参考，不涉及封建迷信内容。',
    screenshots: [                             // 功能截图路径
      'screenshots/home.jpg',
      'screenshots/calculate.jpg', 
      'screenshots/result.jpg',
      'screenshots/naming.jpg'
    ]
  },
  
  // 📦 【可选】构建配置
  // ===============================================
  build: {
    outputPath: './dist',                      // 构建输出目录
    sourceMap: false,                          // 是否生成sourceMap
    minify: true,                             // 是否压缩代码
    deleteConsole: true,                      // 删除console语句
    ignoredFiles: [                           // 忽略的文件
      '*.md',
      'tests/**/*',
      'docs/**/*',
      '.git/**/*'
    ]
  }
}

// ===============================================
// 配置验证函数（请勿修改）
// ===============================================
function validateConfig(config) {
  const errors = []
  
  // 检查必填项
  if (!config.appId || config.appId === 'your_miniprogram_appid') {
    errors.push('请设置 appId（小程序AppID）')
  }
  
  if (!config.production.apiDomain || config.production.apiDomain === 'https://api.yourdomain.com') {
    errors.push('请设置 production.apiDomain（生产环境API域名）')
  }
  
  if (!config.wechat.account || config.wechat.account === 'your-wechat-email@example.com') {
    errors.push('请设置 wechat.account（微信账号邮箱）')
  }
  
  // 检查版本号格式
  const versionRegex = /^\d+\.\d+\.\d+$/
  if (!versionRegex.test(config.version)) {
    errors.push('版本号格式不正确，请使用语义化版本（如 1.0.0）')
  }
  
  // 检查域名格式
  const domainRegex = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!domainRegex.test(config.production.apiDomain)) {
    errors.push('生产环境API域名格式不正确')
  }
  
  if (errors.length > 0) {
    console.error('❌ 配置验证失败:')
    errors.forEach(error => console.error(`   - ${error}`))
    console.error('')
    console.error('📖 配置帮助:')
    console.error('   1. appId: 在微信公众平台小程序管理后台获取')
    console.error('   2. apiDomain: 你部署的API服务器域名')
    console.error('   3. wechat.account: 小程序管理员微信账号')
    console.error('   4. version: 使用 x.y.z 格式的版本号')
    return false
  }
  
  console.log('✅ 配置验证通过！')
  console.log('')
  console.log('📋 小程序配置摘要:')
  console.log(`   AppID: ${config.appId}`)
  console.log(`   名称: ${config.appName}`)
  console.log(`   版本: ${config.version}`)
  console.log(`   API域名: ${config.production.apiDomain}`)
  console.log(`   微信账号: ${config.wechat.account}`)
  console.log('')
  
  return true
}

// ===============================================
// 环境切换函数（请勿修改）
// ===============================================
function switchEnvironment(config, env = 'production') {
  if (env === 'development') {
    return {
      ...config,
      currentApiDomain: config.development.apiDomain,
      currentEnvironment: 'development'
    }
  } else {
    return {
      ...config,
      currentApiDomain: config.production.apiDomain,
      currentEnvironment: 'production'
    }
  }
}

// ===============================================
// 导出配置和工具函数
// ===============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports.validateConfig = validateConfig
  module.exports.switchEnvironment = switchEnvironment
}

// 如果直接运行此文件，进行配置验证
if (require.main === module) {
  const config = module.exports
  validateConfig(config)
}
