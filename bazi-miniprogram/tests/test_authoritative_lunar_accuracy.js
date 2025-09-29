// 权威农历对照表准确性测试
const AuthoritativeLunarSolarMapping = require('../miniprogram/utils/authoritative-lunar-solar-mapping.js');
const EnhancedLunarMatcher = require('../miniprogram/utils/enhanced-lunar-matcher.js');
const FestivalData = require('../miniprogram/utils/festival-data.js');

console.log('='.repeat(60));
console.log('🧪 权威农历对照表准确性测试');
console.log('='.repeat(60));

async function testAuthoritativeLunarAccuracy() {
  try {
    console.log('\n📊 测试权威数据表完整性...');
    
    // 测试权威数据表的完整性
    const integrityReport = AuthoritativeLunarSolarMapping.validateDataIntegrity();
    console.log(`✅ 权威数据覆盖年份: ${integrityReport.totalYears}年`);
    console.log(`✅ 权威数据节日总数: ${integrityReport.totalFestivals}个`);
    
    Object.entries(integrityReport.yearlyFestivalCounts).forEach(([year, count]) => {
      console.log(`   ${year}年: ${count}个节日`);
    });
    
    if (integrityReport.missingData.length > 0) {
      console.log(`⚠️ 发现缺失数据: ${integrityReport.missingData.length}条`);
      integrityReport.missingData.forEach(missing => {
        console.log(`   ${missing.year}年 ${missing.festival}: 缺失字段 ${Object.keys(missing.missing).join(', ')}`);
      });
    } else {
      console.log('✅ 所有权威数据完整性验证通过');
    }
    
    console.log('\n🎯 测试增强农历匹配系统...');
    
    // 测试关键节日的农历匹配准确性
    const testCases = [
      { name: '元旦', year: 2025, month: 1, day: 1, expectedLunar: '腊月初二' },
      { name: '情人节', year: 2025, month: 2, day: 14, expectedLunar: '正月十七' },
      { name: '妇女节', year: 2025, month: 3, day: 8, expectedLunar: '二月初九' },
      { name: '劳动节', year: 2025, month: 5, day: 1, expectedLunar: '四月初四' },
      { name: '儿童节', year: 2025, month: 6, day: 1, expectedLunar: '五月初六' },
      { name: '建党节', year: 2025, month: 7, day: 1, expectedLunar: '六月初六' },
      { name: '建军节', year: 2025, month: 8, day: 1, expectedLunar: '闰六月初七' },
      { name: '教师节', year: 2025, month: 9, day: 10, expectedLunar: '七月十八' },
      { name: '国庆节', year: 2025, month: 10, day: 1, expectedLunar: '九月初九' },
      { name: '万圣节', year: 2025, month: 10, day: 31, expectedLunar: '十月初九' },
      { name: '感恩节', year: 2025, month: 11, day: 27, expectedLunar: '冬月初七' },
      { name: '圣诞节', year: 2025, month: 12, day: 25, expectedLunar: '腊月初五' }
    ];
    
    let authoritativeMatches = 0;
    let totalMatches = 0;
    let accuracyPassed = 0;
    
    console.log('\n验证结果:');
    testCases.forEach(testCase => {
      const eventDate = new Date(testCase.year, testCase.month - 1, testCase.day);
      const lunarInfo = EnhancedLunarMatcher.getAccurateLunarDate(eventDate, testCase.name);
      
      if (lunarInfo) {
        totalMatches++;
        
        const isAuthoritative = lunarInfo.isAuthoritativeData;
        const actualLunar = lunarInfo.lunarDisplay;
        const isAccurate = actualLunar === testCase.expectedLunar;
        
        if (isAuthoritative) authoritativeMatches++;
        if (isAccurate) accuracyPassed++;
        
        const statusIcon = isAccurate ? '✅' : '⚠️';
        const authIcon = isAuthoritative ? '✨' : '📊';
        
        console.log(`${statusIcon} ${testCase.name} ${testCase.year}:`);
        console.log(`   期望农历: ${testCase.expectedLunar}`);
        console.log(`   实际农历: ${actualLunar} ${authIcon}`);
        console.log(`   数据来源: ${lunarInfo.accuracy} (置信度: ${lunarInfo.confidence}%)`);
        
        if (!isAccurate) {
          console.log(`   ❌ 农历对应不匹配！`);
        }
      } else {
        console.log(`❌ ${testCase.name} ${testCase.year}: 无法获取农历信息`);
      }
      console.log('');
    });
    
    console.log('\n📈 农历匹配质量统计:');
    console.log(`✨ 权威数据匹配: ${authoritativeMatches}/${testCases.length} (${(authoritativeMatches/testCases.length*100).toFixed(1)}%)`);
    console.log(`📊 总计算成功: ${totalMatches}/${testCases.length} (${(totalMatches/testCases.length*100).toFixed(1)}%)`);
    console.log(`🎯 准确率: ${accuracyPassed}/${testCases.length} (${(accuracyPassed/testCases.length*100).toFixed(1)}%)`);
    
    console.log('\n🚀 测试前端集成效果...');
    
    // 测试集成到节日数据系统的效果
    const festivals = FestivalData.getUpcomingFestivals(20, false);
    let enhancedCount = 0;
    let authoritativeLunarCount = 0;
    
    console.log('\n前5个节日的农历显示效果:');
    festivals.slice(0, 5).forEach((festival, index) => {
      console.log(`${index + 1}. ${festival.name} (${festival.year}年${festival.month}月${festival.day}日)`);
      
      if (festival.lunarDisplay) {
        console.log(`   📅 农历: ${festival.lunarDisplay}`);
      } else if (festival.lunarMonthCn && festival.lunarDayCn) {
        console.log(`   📅 农历: ${festival.lunarMonthCn}${festival.lunarDayCn}`);
      } else {
        console.log(`   📅 农历: 未知`);
      }
      
      if (festival.lunarAccuracy) {
        console.log(`   🔍 精度: ${festival.lunarAccuracy} (置信度: ${festival.lunarConfidence || 0}%)`);
      }
      
      if (festival.isAuthoritativeLunar) {
        console.log(`   ✨ 权威农历数据`);
        authoritativeLunarCount++;
      }
      
      if (festival.lunarConfidence && festival.lunarConfidence >= 95) {
        enhancedCount++;
      }
      
      console.log('');
    });
    
    console.log(`📊 高质量农历数据: ${enhancedCount}/5 (${(enhancedCount/5*100).toFixed(1)}%)`);
    console.log(`✨ 权威农历数据: ${authoritativeLunarCount}/5 (${(authoritativeLunarCount/5*100).toFixed(1)}%)`);
    
    console.log('\n🧪 测试闰月处理...');
    
    // 测试闰月情况
    const leapMonthCases = [
      { name: '建军节', year: 2025, month: 8, day: 1, expectedLunar: '闰六月初七' },
      { name: '儿童节', year: 2028, month: 6, day: 1, expectedLunar: '闰五月初七' }
    ];
    
    let leapMonthAccuracy = 0;
    
    leapMonthCases.forEach(testCase => {
      const eventDate = new Date(testCase.year, testCase.month - 1, testCase.day);
      const lunarInfo = EnhancedLunarMatcher.getAccurateLunarDate(eventDate, testCase.name);
      
      if (lunarInfo && lunarInfo.lunarDisplay === testCase.expectedLunar) {
        leapMonthAccuracy++;
        console.log(`✅ ${testCase.name} ${testCase.year}: ${lunarInfo.lunarDisplay} ✓`);
      } else {
        console.log(`❌ ${testCase.name} ${testCase.year}: 期望 ${testCase.expectedLunar}, 实际 ${lunarInfo ? lunarInfo.lunarDisplay : '无数据'}`);
      }
    });
    
    console.log(`🌙 闰月处理准确率: ${leapMonthAccuracy}/${leapMonthCases.length} (${(leapMonthAccuracy/leapMonthCases.length*100).toFixed(1)}%)`);
    
    // 综合评估
    const overallScore = (
      accuracyPassed / testCases.length * 40 +
      authoritativeMatches / testCases.length * 30 +
      enhancedCount / 5 * 20 +
      leapMonthAccuracy / leapMonthCases.length * 10
    ) * 100;
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 权威农历系统综合评分: ${overallScore.toFixed(1)}/100`);
    
    if (overallScore >= 90) {
      console.log('🌟 优秀：农历系统达到商业级标准');
    } else if (overallScore >= 80) {
      console.log('👍 良好：农历系统达到专业级标准');
    } else if (overallScore >= 70) {
      console.log('📊 及格：农历系统基本可用');
    } else {
      console.log('⚠️ 需要改进：农历系统存在问题');
    }
    
    console.log('='.repeat(60));
    
    return overallScore >= 80; // 80分以上认为通过
    
  } catch (error) {
    console.error('❌ 权威农历测试失败:', error);
    return false;
  }
}

// 运行测试
testAuthoritativeLunarAccuracy().then(success => {
  process.exit(success ? 0 : 1);
});
