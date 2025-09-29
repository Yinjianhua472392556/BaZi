// 传统节日准确性验证测试 - 确保清明节、中秋节等重要节日计算准确
const DynamicFestivalCalculator = require('../miniprogram/utils/dynamic-festival-calculator.js');
const LunarConversionEngine = require('../miniprogram/utils/lunar-conversion-engine.js');
const AstronomicalCalculator = require('../miniprogram/utils/astronomical-calculator.js');

console.log('🎋 传统节日准确性全面验证');
console.log('='.repeat(60));

// 权威的传统节日日期参考数据（来源：中国科学院紫金山天文台）
const REFERENCE_DATES = {
  // 春节（农历正月初一）
  spring_festival: {
    2020: '2020-01-25',
    2021: '2021-02-12', 
    2022: '2022-02-01',
    2023: '2023-01-22',
    2024: '2024-02-10',
    2025: '2025-01-29',
    2026: '2026-02-17',
    2027: '2027-02-06',
    2028: '2028-01-26',
    2029: '2029-02-13',
    2030: '2030-02-03'
  },
  
  // 清明节（节气，太阳黄经15度）
  qingming: {
    2020: '2020-04-04',
    2021: '2021-04-04',
    2022: '2022-04-05',
    2023: '2023-04-05',
    2024: '2024-04-04',
    2025: '2025-04-05',
    2026: '2026-04-05',
    2027: '2027-04-04',
    2028: '2028-04-04',
    2029: '2029-04-05',
    2030: '2030-04-05'
  },
  
  // 端午节（农历五月初五）
  dragon_boat: {
    2020: '2020-06-25',
    2021: '2021-06-14',
    2022: '2022-06-03',
    2023: '2023-06-22',
    2024: '2024-06-10',
    2025: '2025-05-31',
    2026: '2026-06-19',
    2027: '2027-06-09',
    2028: '2028-05-28',
    2029: '2029-06-16',
    2030: '2030-06-05'
  },
  
  // 中秋节（农历八月十五）
  mid_autumn: {
    2020: '2020-10-01',
    2021: '2021-09-21',
    2022: '2022-09-10',
    2023: '2023-09-29',
    2024: '2024-09-17',
    2025: '2025-10-06',
    2026: '2026-09-25',
    2027: '2027-09-15',
    2028: '2028-10-03',
    2029: '2029-09-22',
    2030: '2030-09-12'
  },
  
  // 元宵节（农历正月十五）
  lantern_festival: {
    2020: '2020-02-08',
    2021: '2021-02-26',
    2022: '2022-02-15',
    2023: '2023-02-05',
    2024: '2024-02-24',
    2025: '2025-02-12',
    2026: '2026-03-03',
    2027: '2027-02-20',
    2028: '2028-02-09',
    2029: '2029-02-27',
    2030: '2030-02-17'
  }
};

// 验证单个节日的准确性
function validateFestival(festivalKey, festivalName, calculator) {
  console.log(`\n🏮 验证${festivalName}准确性：`);
  console.log('-'.repeat(40));
  
  const referenceData = REFERENCE_DATES[festivalKey];
  let totalTests = 0;
  let passedTests = 0;
  let maxError = 0;
  let errorDetails = [];
  
  for (const [year, expectedDate] of Object.entries(referenceData)) {
    totalTests++;
    const yearNum = parseInt(year);
    
    try {
      let calculatedDate;
      
      if (calculator === 'calculateQingming') {
        // 特殊处理清明节
        calculatedDate = DynamicFestivalCalculator.calculateQingming(yearNum);
      } else {
        // 其他节日通过年度节日列表获取
        const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(yearNum);
        const festival = yearFestivals.find(f => f.name === festivalName);
        calculatedDate = festival ? festival.date : null;
      }
      
      if (!calculatedDate) {
        errorDetails.push(`${year}年: 计算失败`);
        console.log(`  ${year}年: ❌ 计算失败`);
        continue;
      }
      
      // 格式化计算结果
      const calculated = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
      
      // 计算误差天数
      const expectedTime = new Date(expectedDate).getTime();
      const calculatedTime = calculatedDate.getTime();
      const errorDays = Math.abs(calculatedTime - expectedTime) / (1000 * 60 * 60 * 24);
      
      maxError = Math.max(maxError, errorDays);
      
      if (errorDays <= 1) {
        passedTests++;
        console.log(`  ${year}年: ✅ ${calculated} (误差${errorDays.toFixed(1)}天)`);
      } else {
        errorDetails.push(`${year}年: 期望${expectedDate}, 计算${calculated}, 误差${errorDays.toFixed(1)}天`);
        console.log(`  ${year}年: ❌ ${calculated} (误差${errorDays.toFixed(1)}天, 期望${expectedDate})`);
      }
      
    } catch (error) {
      errorDetails.push(`${year}年: 计算异常 - ${error.message}`);
      console.log(`  ${year}年: 💥 计算异常 - ${error.message}`);
    }
  }
  
  const accuracy = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
  console.log(`\n📊 ${festivalName}验证结果:`);
  console.log(`  准确率: ${passedTests}/${totalTests} (${accuracy}%)`);
  console.log(`  最大误差: ${maxError.toFixed(1)}天`);
  
  if (errorDetails.length > 0) {
    console.log(`  错误详情: ${errorDetails.slice(0, 3).join('; ')}${errorDetails.length > 3 ? '...' : ''}`);
  }
  
  return {
    festival: festivalName,
    accuracy: parseFloat(accuracy),
    maxError: maxError,
    passed: passedTests,
    total: totalTests,
    errors: errorDetails
  };
}

// 验证农历年份计算的准确性
function validateLunarYearCalculation() {
  console.log(`\n🌙 验证农历年份计算准确性：`);
  console.log('-'.repeat(40));
  
  const testCases = [
    { year: 2025, isLeap: true, leapMonth: 6 },  // 2025年闰六月
    { year: 2028, isLeap: true, leapMonth: 5 },  // 2028年闰五月
    { year: 2031, isLeap: true, leapMonth: 3 },  // 2031年闰三月
    { year: 2026, isLeap: false, leapMonth: null },
    { year: 2027, isLeap: false, leapMonth: null }
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    try {
      const isLeap = DynamicFestivalCalculator.isLunarLeapYear(testCase.year);
      const leapMonth = DynamicFestivalCalculator.getLeapMonth(testCase.year);
      
      const isLeapCorrect = isLeap === testCase.isLeap;
      const leapMonthCorrect = leapMonth === testCase.leapMonth;
      
      if (isLeapCorrect && leapMonthCorrect) {
        passed++;
        console.log(`  ${testCase.year}年: ✅ ${isLeap ? `闰${leapMonth}月` : '平年'}`);
      } else {
        console.log(`  ${testCase.year}年: ❌ 计算${isLeap ? `闰${leapMonth}月` : '平年'}, 期望${testCase.isLeap ? `闰${testCase.leapMonth}月` : '平年'}`);
      }
    } catch (error) {
      console.log(`  ${testCase.year}年: 💥 计算异常 - ${error.message}`);
    }
  }
  
  console.log(`\n📊 农历年份计算准确率: ${passed}/${total} (${(passed/total*100).toFixed(1)}%)`);
  return { passed, total, accuracy: passed/total*100 };
}

// 验证节气与农历节日的一致性
function validateSolarTermsConsistency() {
  console.log(`\n☀️ 验证节气计算一致性：`);
  console.log('-'.repeat(40));
  
  const testYears = [2025, 2030, 2035, 2040, 2050];
  let allConsistent = true;
  
  for (const year of testYears) {
    try {
      // 通过两种方式计算清明节
      const qingmingDirect = DynamicFestivalCalculator.calculateQingming(year);
      
      const solarTerms = LunarConversionEngine.calculateSolarTerms(year);
      const qingmingFromTerms = solarTerms.find(term => term.name === '清明');
      
      if (!qingmingDirect || !qingmingFromTerms) {
        console.log(`  ${year}年: ❌ 计算失败`);
        allConsistent = false;
        continue;
      }
      
      const diffMs = Math.abs(qingmingDirect.getTime() - qingmingFromTerms.date.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours <= 24) {
        console.log(`  ${year}年清明: ✅ 一致性良好 (误差${diffHours.toFixed(1)}小时)`);
      } else {
        console.log(`  ${year}年清明: ❌ 一致性差 (误差${diffHours.toFixed(1)}小时)`);
        allConsistent = false;
      }
      
    } catch (error) {
      console.log(`  ${year}年: 💥 一致性检查异常 - ${error.message}`);
      allConsistent = false;
    }
  }
  
  return allConsistent;
}

// 测试长期计算稳定性
function testLongTermStability() {
  console.log(`\n🔮 测试长期计算稳定性（2025-2080年）：`);
  console.log('-'.repeat(40));
  
  const testResults = {
    springFestival: { valid: 0, total: 0 },
    qingming: { valid: 0, total: 0 },
    midAutumn: { valid: 0, total: 0 }
  };
  
  for (let year = 2025; year <= 2080; year += 5) {
    try {
      // 测试春节（应在1月15日-2月20日）
      const springFestival = DynamicFestivalCalculator.getSpringFestivalDate(year);
      testResults.springFestival.total++;
      if (springFestival) {
        const month = springFestival.getMonth() + 1;
        const day = springFestival.getDate();
        if ((month === 1 && day >= 15) || (month === 2 && day <= 20)) {
          testResults.springFestival.valid++;
        }
      }
      
      // 测试清明节（应在4月3-7日）
      const qingming = DynamicFestivalCalculator.calculateQingming(year);
      testResults.qingming.total++;
      if (qingming) {
        const month = qingming.getMonth() + 1;
        const day = qingming.getDate();
        if (month === 4 && day >= 3 && day <= 7) {
          testResults.qingming.valid++;
        }
      }
      
      // 测试中秋节（应在9月初-10月初）
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
      const midAutumn = yearFestivals.find(f => f.name === '中秋节');
      testResults.midAutumn.total++;
      if (midAutumn) {
        const month = midAutumn.month;
        if (month >= 9 && month <= 10) {
          testResults.midAutumn.valid++;
        }
      }
      
    } catch (error) {
      console.log(`  ${year}年: 计算异常 - ${error.message}`);
    }
  }
  
  console.log(`  春节合理性: ${testResults.springFestival.valid}/${testResults.springFestival.total} (${(testResults.springFestival.valid/testResults.springFestival.total*100).toFixed(1)}%)`);
  console.log(`  清明合理性: ${testResults.qingming.valid}/${testResults.qingming.total} (${(testResults.qingming.valid/testResults.qingming.total*100).toFixed(1)}%)`);
  console.log(`  中秋合理性: ${testResults.midAutumn.valid}/${testResults.midAutumn.total} (${(testResults.midAutumn.valid/testResults.midAutumn.total*100).toFixed(1)}%)`);
  
  return testResults;
}

// 主测试函数
async function runTraditionalFestivalTests() {
  const startTime = Date.now();
  const results = [];
  
  // 1. 验证各个传统节日
  results.push(validateFestival('spring_festival', '春节'));
  results.push(validateFestival('qingming', '清明节', 'calculateQingming'));
  results.push(validateFestival('dragon_boat', '端午节'));
  results.push(validateFestival('mid_autumn', '中秋节'));
  results.push(validateFestival('lantern_festival', '元宵节'));
  
  // 2. 验证农历年份计算
  const lunarResult = validateLunarYearCalculation();
  
  // 3. 验证节气一致性
  const consistencyResult = validateSolarTermsConsistency();
  
  // 4. 测试长期稳定性
  const stabilityResult = testLongTermStability();
  
  // 计算总体结果
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const overallAccuracy = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;
  const maxError = Math.max(...results.map(r => r.maxError));
  
  const duration = Date.now() - startTime;
  
  // 输出总结
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 传统节日验证总结');
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 总体准确率: ${totalPassed}/${totalTests} (${overallAccuracy}%)`);
  console.log(`📏 最大误差: ${maxError.toFixed(1)}天`);
  console.log(`🌙 农历计算: ${lunarResult.passed}/${lunarResult.total} (${lunarResult.accuracy.toFixed(1)}%)`);
  console.log(`⚙️  节气一致性: ${consistencyResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`⏱️  测试用时: ${duration}ms`);
  
  // 详细分析
  console.log(`\n📋 各节日准确率详情:`);
  results.forEach(result => {
    const status = result.accuracy >= 90 ? '✅' : result.accuracy >= 80 ? '⚠️' : '❌';
    console.log(`  ${status} ${result.festival}: ${result.accuracy}% (误差≤${result.maxError.toFixed(1)}天)`);
  });
  
  // 问题分析
  const problemFestivals = results.filter(r => r.accuracy < 90);
  if (problemFestivals.length > 0) {
    console.log(`\n⚠️  需要关注的节日:`);
    problemFestivals.forEach(festival => {
      console.log(`  ${festival.festival}: 准确率${festival.accuracy}%`);
      if (festival.errors.length > 0) {
        console.log(`    错误示例: ${festival.errors[0]}`);
      }
    });
  }
  
  // 最终评估
  console.log(`\n🏆 最终评估:`);
  if (overallAccuracy >= 95 && maxError <= 1 && consistencyResult) {
    console.log('✅ 传统节日计算完全准确，可以放心使用！');
  } else if (overallAccuracy >= 90 && maxError <= 2) {
    console.log('⚠️  传统节日计算基本准确，存在轻微误差');
  } else {
    console.log('❌ 传统节日计算存在问题，需要进一步优化');
  }
  
  return {
    overallAccuracy: parseFloat(overallAccuracy),
    maxError,
    lunarAccuracy: lunarResult.accuracy,
    consistencyPassed: consistencyResult,
    stabilityResults: stabilityResult,
    detailResults: results,
    duration
  };
}

// 快速验证函数 - 验证指定年份的关键节日
function quickValidation(year) {
  console.log(`\n🔍 快速验证${year}年传统节日:`);
  console.log('-'.repeat(40));
  
  const festivals = DynamicFestivalCalculator.calculateYearFestivals(year);
  const keyFestivals = ['春节', '清明节', '端午节', '中秋节', '元宵节'];
  
  keyFestivals.forEach(festivalName => {
    const festival = festivals.find(f => f.name === festivalName);
    if (festival) {
      console.log(`  ${festivalName}: ${festival.year}年${festival.month}月${festival.day}日`);
    } else {
      console.log(`  ${festivalName}: ❌ 未找到`);
    }
  });
  
  // 特别验证清明节
  const qingming = DynamicFestivalCalculator.calculateQingming(year);
  if (qingming) {
    console.log(`  清明节(节气): ${qingming.getFullYear()}年${qingming.getMonth() + 1}月${qingming.getDate()}日`);
  }
}

// 导出模块
module.exports = {
  runTraditionalFestivalTests,
  validateFestival,
  validateLunarYearCalculation,
  validateSolarTermsConsistency,
  testLongTermStability,
  quickValidation
};

// 如果直接运行此文件，执行测试
if (require.main === module) {
  console.log('🚀 开始传统节日准确性验证...\n');
  
  runTraditionalFestivalTests()
    .then(result => {
      console.log('\n✨ 验证完成！');
      
      // 额外测试：验证未来几年的关键节日
      console.log('\n🔮 验证未来关键年份:');
      [2025, 2030, 2035, 2040].forEach(year => quickValidation(year));
      
      process.exit(result.overallAccuracy >= 90 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 验证过程发生异常:', error);
      process.exit(1);
    });
}
