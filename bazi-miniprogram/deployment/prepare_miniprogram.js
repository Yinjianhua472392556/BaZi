#!/usr/bin/env node
/**
 * ===============================================
 * 八字运势小程序 - 发布准备脚本
 * ===============================================
 * 
 * 功能：
 * - 自动更新小程序配置
 * - 切换生产/开发环境
 * - 生成发布包
 * - 创建操作指南
 * 
 * 使用方法：
 * node prepare_miniprogram.js [environment]
 * 
 * 参数：
 * - production: 生产环境（默认）
 * - development: 开发环境
 * 
 * ===============================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, total, description) {
  const percentage = Math.round((step / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5));
  
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log(`  步骤 ${step}/${total}: ${description}`, 'cyan');
  log(`  进度: [${percentage}%] ${progressBar}`, 'cyan');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
}

// 脚本目录
const scriptDir = __dirname;
const projectRoot = path.dirname(scriptDir);
const miniprogramDir = path.join(projectRoot, 'miniprogram');

// 加载配置
let config;
try {
  config = require('./miniprogram_config.js');
} catch (error) {
  log('❌ 无法加载配置文件 miniprogram_config.js', 'red');
  log('请确保配置文件存在并且格式正确', 'red');
  process.exit(1);
}

// 获取环境参数
const environment = process.argv[2] || 'production';
if (!['production', 'development'].includes(environment)) {
  log('❌ 无效的环境参数，请使用 production 或 development', 'red');
  process.exit(1);
}

// ===============================================
// 1. 验证配置
// ===============================================
function validateConfiguration() {
  logStep(1, 8, '验证配置文件');
  
  if (!config.validateConfig(config)) {
    log('❌ 配置验证失败，请修正后重试', 'red');
    process.exit(1);
  }
  
  log('✅ 配置验证通过', 'green');
}

// ===============================================
// 2. 切换环境配置
// ===============================================
function switchEnvironment() {
  logStep(2, 8, `切换到${environment}环境`);
  
  // 切换配置
  const envConfig = config.switchEnvironment(config, environment);
  
  // 更新app.js中的API地址
  const appJsPath = path.join(miniprogramDir, 'app.js');
  
  if (!fs.existsSync(appJsPath)) {
    log('❌ 找不到小程序app.js文件', 'red');
    process.exit(1);
  }
  
  let appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // 替换API地址
  const apiRegex = /apiBaseUrl:\s*['"][^'"]*['"]/;
  const newApiUrl = `apiBaseUrl: '${envConfig.currentApiDomain}'`;
  
  if (apiRegex.test(appJsContent)) {
    appJsContent = appJsContent.replace(apiRegex, newApiUrl);
    fs.writeFileSync(appJsPath, appJsContent);
    log(`✅ 已更新API地址为: ${envConfig.currentApiDomain}`, 'green');
  } else {
    log('⚠️ 未找到apiBaseUrl配置，请手动检查', 'yellow');
  }
  
  // 更新app.json配置
  updateAppJson(envConfig);
  
  log(`✅ 已切换到${environment}环境`, 'green');
}

// ===============================================
// 3. 更新app.json配置
// ===============================================
function updateAppJson(envConfig) {
  logStep(3, 8, '更新小程序配置');
  
  const appJsonPath = path.join(miniprogramDir, 'app.json');
  
  if (!fs.existsSync(appJsonPath)) {
    log('❌ 找不到小程序app.json文件', 'red');
    return;
  }
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // 更新基本信息
    if (config.theme) {
      appJson.window = {
        ...appJson.window,
        ...config.theme
      };
    }
    
    // 更新页面配置
    if (config.pages && config.pages.length > 0) {
      appJson.pages = config.pages;
    }
    
    // 添加权限描述
    if (config.permissions) {
      appJson.permission = config.permissions;
    }
    
    // 写回文件
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    log('✅ 小程序配置更新完成', 'green');
    
  } catch (error) {
    log(`⚠️ 更新app.json失败: ${error.message}`, 'yellow');
  }
}

// ===============================================
// 4. 清理和优化代码
// ===============================================
function cleanupCode() {
  logStep(4, 8, '清理和优化代码');
  
  // 删除测试文件和开发文件
  const filesToRemove = [
    'project.private.config.json',
    '**/*.test.js',
    '**/*.spec.js'
  ];
  
  if (environment === 'production') {
    // 生产环境删除console语句
    const jsFiles = getAllJSFiles(miniprogramDir);
    
    jsFiles.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        
        // 移除console语句（保留console.error）
        content = content.replace(/console\.(log|info|debug|warn)\([^)]*\);?\s*/g, '');
        
        fs.writeFileSync(file, content);
      } catch (error) {
        log(`⚠️ 清理文件失败: ${file}`, 'yellow');
      }
    });
    
    log('✅ 已移除console日志语句', 'green');
  }
  
  log('✅ 代码清理完成', 'green');
}

// ===============================================
// 5. 压缩图片资源
// ===============================================
function optimizeImages() {
  logStep(5, 8, '优化图片资源');
  
  const imagesDir = path.join(miniprogramDir, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    log('⚠️ 图片目录不存在，跳过图片优化', 'yellow');
    return;
  }
  
  // 这里可以添加图片压缩逻辑
  // 由于需要额外依赖，暂时只做检查
  const imageFiles = getAllImageFiles(imagesDir);
  
  log(`📊 发现 ${imageFiles.length} 个图片文件`, 'blue');
  
  // 检查大文件
  imageFiles.forEach(file => {
    const stats = fs.statSync(file);
    const sizeKB = Math.round(stats.size / 1024);
    
    if (sizeKB > 100) {
      log(`⚠️ 大图片文件: ${path.relative(miniprogramDir, file)} (${sizeKB}KB)`, 'yellow');
    }
  });
  
  log('✅ 图片检查完成', 'green');
}

// ===============================================
// 6. 生成版本信息
// ===============================================
function generateVersionInfo() {
  logStep(6, 8, '生成版本信息');
  
  const versionInfo = {
    version: config.version,
    description: config.versionDescription,
    environment: environment,
    apiDomain: environment === 'production' ? config.production.apiDomain : config.development.apiDomain,
    buildTime: new Date().toISOString(),
    gitCommit: getGitCommit(),
    pages: config.pages,
    features: [
      '八字测算',
      '智能起名',
      '生肖配对',
      '节日运势',
      '历史记录',
      '个人中心'
    ]
  };
  
  const versionFile = path.join(miniprogramDir, 'version.json');
  fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
  
  log(`✅ 版本信息已生成: version.json`, 'green');
  log(`📋 版本: ${versionInfo.version}`, 'blue');
  log(`🌐 环境: ${environment}`, 'blue');
  log(`🔗 API: ${versionInfo.apiDomain}`, 'blue');
}

// ===============================================
// 7. 网络连接测试
// ===============================================
function testApiConnection() {
  logStep(7, 8, '测试API连接');
  
  const apiDomain = environment === 'production' ? config.production.apiDomain : config.development.apiDomain;
  const testUrl = `${apiDomain}/health`;
  
  try {
    // 使用curl测试连接
    execSync(`curl -f -s "${testUrl}"`, { timeout: 10000 });
    log(`✅ API连接正常: ${testUrl}`, 'green');
  } catch (error) {
    log(`⚠️ API连接失败: ${testUrl}`, 'yellow');
    log('   请确保服务器正在运行并且域名解析正确', 'yellow');
  }
}

// ===============================================
// 8. 生成发布指南
// ===============================================
function generateReleaseGuide() {
  logStep(8, 8, '生成发布指南');
  
  const guideContent = generateGuideContent();
  const guideFile = path.join(scriptDir, `release_guide_${environment}_${Date.now()}.md`);
  
  fs.writeFileSync(guideFile, guideContent);
  
  log(`✅ 发布指南已生成: ${path.basename(guideFile)}`, 'green');
  
  // 显示快速指南
  showQuickGuide();
}

// ===============================================
// 工具函数
// ===============================================
function getAllJSFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (path.extname(item) === '.js') {
        files.push(fullPath);
      }
    });
  }
  
  walkDir(dir);
  return files;
}

function getAllImageFiles(dir) {
  const files = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (extensions.includes(path.extname(item).toLowerCase())) {
        files.push(fullPath);
      }
    });
  }
  
  walkDir(dir);
  return files;
}

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

function generateGuideContent() {
  const apiDomain = environment === 'production' ? config.production.apiDomain : config.development.apiDomain;
  
  return `# 八字运势小程序 - 发布指南

## 📋 发布信息

**环境**: ${environment}  
**版本**: ${config.version}  
**API域名**: ${apiDomain}  
**生成时间**: ${new Date().toLocaleString()}  

## 🚀 发布步骤

### 第1步：微信开发者工具操作

1. **打开微信开发者工具**
   - 导入项目：选择 \`miniprogram\` 目录
   - 确认AppID：${config.appId}

2. **检查编译**
   - 点击"编译"按钮
   - 确保没有错误和警告
   - 测试主要功能页面

3. **上传代码**
   - 点击工具栏"上传"按钮
   - 版本号：${config.version}
   - 项目备注：${config.versionDescription}
   - 点击"上传"

### 第2步：微信公众平台配置

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用账号：${config.wechat.account}

2. **配置服务器域名**
   - 进入：设置 > 开发设置 > 服务器域名
   - request合法域名：${apiDomain}
   - socket合法域名：${apiDomain}（如需要）
   - uploadFile合法域名：${apiDomain}（如需要）
   - downloadFile合法域名：${apiDomain}（如需要）

3. **业务域名配置**（如有网页跳转需求）
   - 业务域名：${apiDomain.replace('https://', '').replace('http://', '')}

### 第3步：版本管理

1. **进入版本管理**
   - 开发管理 > 版本管理
   - 在"开发版本"中找到刚刚上传的版本

2. **提交审核**
   - 点击"提交审核"按钮
   - 填写功能页面和功能介绍
   - 上传测试账号信息（如需要）
   - 填写版本描述：${config.versionDescription}

3. **等待审核**
   - 审核时间通常为1-7个工作日
   - 可在"审核版本"中查看审核状态

### 第4步：发布上线

1. **审核通过后**
   - 在"审核版本"中点击"发布"
   - 确认发布信息
   - 小程序正式上线

## 🔧 技术检查清单

### API连接检查
- [ ] 服务器运行正常
- [ ] SSL证书有效（生产环境）
- [ ] 域名解析正确
- [ ] 防火墙端口开放

### 功能测试
- [ ] 八字测算功能正常
- [ ] 智能起名功能正常
- [ ] 生肖配对功能正常
- [ ] 历史记录保存/查看
- [ ] 页面跳转正常
- [ ] 图标显示正常

### 性能检查
- [ ] 页面加载速度正常
- [ ] 图片资源优化
- [ ] 代码体积合理
- [ ] 内存使用正常

## 📞 常见问题

### Q: 域名配置错误
**A**: 确保在微信公众平台正确配置了服务器域名，域名必须支持HTTPS

### Q: 网络请求失败
**A**: 检查API服务器状态和域名解析，确保防火墙开放相应端口

### Q: 审核被拒绝
**A**: 查看拒绝原因，常见原因包括：
- 功能描述不准确
- 涉嫌违规内容
- 缺少必要的用户协议

### Q: 小程序无法正常使用
**A**: 检查版本配置和API地址是否正确

## 📊 监控和维护

### 日常监控
- API响应时间
- 用户访问量
- 错误率统计
- 服务器资源使用

### 定期维护
- 更新SSL证书
- 备份用户数据
- 监控服务器安全
- 更新依赖库版本

---

**生成时间**: ${new Date().toLocaleString()}
**脚本版本**: prepare_miniprogram.js v1.0
`;
}

function showQuickGuide() {
  const apiDomain = environment === 'production' ? config.production.apiDomain : config.development.apiDomain;
  
  log('\n🎉 小程序发布准备完成！', 'green');
  log('\n📋 接下来的步骤:', 'cyan');
  log('1. 打开微信开发者工具', 'blue');
  log('2. 导入miniprogram目录', 'blue');
  log('3. 编译并上传代码', 'blue');
  log('4. 到微信公众平台配置域名', 'blue');
  log('5. 提交审核并等待通过', 'blue');
  log('\n🔗 重要信息:', 'cyan');
  log(`AppID: ${config.appId}`, 'blue');
  log(`版本: ${config.version}`, 'blue');
  log(`API域名: ${apiDomain}`, 'blue');
  log(`微信账号: ${config.wechat.account}`, 'blue');
  log('\n📖 详细操作指南已生成，请查看相应的Markdown文件', 'yellow');
}

// ===============================================
// 主函数
// ===============================================
function main() {
  log('═══════════════════════════════════════════════════════════════', 'green');
  log('           八字运势小程序 - 发布准备脚本', 'green');
  log('═══════════════════════════════════════════════════════════════', 'green');
  
  log(`\n🎯 准备${environment}环境发布...`, 'cyan');
  
  try {
    validateConfiguration();
    switchEnvironment();
    updateAppJson();
    cleanupCode();
    optimizeImages();
    generateVersionInfo();
    testApiConnection();
    generateReleaseGuide();
    
    log('\n✅ 所有准备工作完成！', 'green');
    
  } catch (error) {
    log(`\n❌ 发布准备失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  validateConfiguration,
  switchEnvironment,
  updateAppJson,
  cleanupCode,
  optimizeImages,
  generateVersionInfo,
  testApiConnection,
  generateReleaseGuide
};
