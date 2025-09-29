// 前端高精度集成测试
const FestivalData = require('../miniprogram/utils/festival-data.js');

console.log('='.repeat(60));
console.log('🧪 前端高精度算法集成测试');
console.log('='.repeat(60));

async function testFrontendIntegration() {
  try {
    console.log('\n📱 测试小程序节日页面数据获取...');
    
    // 模拟小程序调用 - 获取更多节日进行验证
    const festivals = FestivalData.getUpcomingFestivals(100, true);
    
    console.log(`✅ 成功获取 ${festivals.length} 个节日数据`);
    
    if (festivals.length === 0) {
      console.log('❌ 错误：未获取到任何节日数据');
      return false;
    }
    
    // 检查关键节日的准确性
    console.log('\n🎯 验证关键节日数据准确性...');
    
    const testCases = [
      { name: '大雪', year: 2025, expectedDate: '2025-12-07' },
      { name: '感恩节', year: 2025, expectedDate: '2025-11-27' },
      { name: '万圣节', year: 2025, expectedDate: '2025-10-31' }
    ];
    
    let validationsPassed = 0;
    
    // 首先显示所有找到的相关节日
    console.log('\n📋 找到的相关节日:');
    testCases.forEach(testCase => {
      const allMatches = festivals.filter(f => f.name.includes(testCase.name));
      if (allMatches.length > 0) {
        allMatches.forEach(match => {
          console.log(`   ${match.name}: ${match.date} (${match.year}年)`);
        });
      } else {
        console.log(`   ${testCase.name}: 未找到`);
      }
    });
    
    console.log('\n验证结果:');
    testCases.forEach(testCase => {
      const found = festivals.find(f => 
        f.name.includes(testCase.name) && 
        f.year === testCase.year
      );
      
      if (found) {
        const actualDate = found.date.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
        if (actualDate === testCase.expectedDate) {
          console.log(`✅ ${testCase.name} ${testCase.year}: ${actualDate} ✓`);
          validationsPassed++;
        } else {
          console.log(`⚠️ ${testCase.name} ${testCase.year}: ${actualDate} (期望: ${testCase.expectedDate})`);
        }
        
        // 检查高精度标识
        if (found.isHighPrecision) {
          console.log(`   📊 精度等级: ${found.precisionDisplay} - ${found.precisionDescription}`);
          console.log(`   🏛️ 数据来源: ${found.dataSource.source}`);
        }
      } else {
        console.log(`❌ ${testCase.name} ${testCase.year}: 未找到`);
      }
    });
    
    console.log(`\n📊 关键节日验证结果: ${validationsPassed}/${testCases.length} 通过`);
    
    // 检查高精度标识的分布
    console.log('\n🔍 检查高精度数据标识分布...');
    const highPrecisionCount = festivals.filter(f => f.isHighPrecision).length;
    const authoritativeCount = festivals.filter(f => f.precisionLevel === 'authoritative').length;
    const highCount = festivals.filter(f => f.precisionLevel === 'high').length;
    
    console.log(`📊 高精度数据: ${highPrecisionCount}/${festivals.length} (${(highPrecisionCount/festivals.length*100).toFixed(1)}%)`);
    console.log(`✨ 权威级数据: ${authoritativeCount} 个`);
    console.log(`⭐ 高精度数据: ${highCount} 个`);
    
    // 显示前5个节日的详细信息
    console.log('\n📋 前5个节日详细信息:');
    festivals.slice(0, 5).forEach((festival, index) => {
      console.log(`${index + 1}. ${festival.name}`);
      console.log(`   📅 日期: ${festival.date}`);
      console.log(`   🕒 倒计时: ${festival.countdownText}`);
      console.log(`   📊 精度: ${festival.precisionDisplay || '未知'}`);
      console.log(`   🏛️ 来源: ${festival.dataSource?.source || '未知'}`);
      console.log(`   🎯 类型: ${festival.typeDisplay || '未知'}`);
      console.log('');
    });
    
    // 性能测试
    console.log('⚡ 性能测试...');
    const startTime = Date.now();
    FestivalData.getUpcomingFestivals(50, true);
    const endTime = Date.now();
    console.log(`✅ 加载50个节日耗时: ${endTime - startTime}ms`);
    
    const allPassed = validationsPassed === testCases.length && festivals.length > 0;
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 前端集成测试结果: ${allPassed ? '✅ 通过' : '❌ 失败'}`);
    console.log('='.repeat(60));
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ 前端集成测试失败:', error);
    return false;
  }
}

// 运行测试
testFrontendIntegration().then(success => {
  process.exit(success ? 0 : 1);
});
