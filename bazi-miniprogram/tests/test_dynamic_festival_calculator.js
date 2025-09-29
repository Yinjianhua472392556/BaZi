// 动态节日计算器测试 - 验证天文算法的准确性和性能
const DynamicFestivalCalculator = require('../miniprogram/utils/dynamic-festival-calculator.js');
const FestivalCacheManager = require('../miniprogram/utils/festival-cache-manager.js');
const LunarConversionEngine = require('../miniprogram/utils/lunar-conversion-engine.js');
const AstronomicalCalculator = require('../miniprogram/utils/astronomical-calculator.js');

class DynamicFestivalCalculatorTest {
  static async runAllTests() {
    console.log('🚀 开始动态节日计算器全面测试...\n');
    
    const testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };

    // 测试列表
    const tests = [
      { name: '基础功能测试', method: this.testBasicFunctionality },
      { name: '天文算法精度测试', method: this.testAstronomicalAccuracy },
      { name: '农历转换测试', method: this.testLunarConversion },
      { name: '长期准确性测试', method: this.testLongTermAccuracy },
      { name: '性能基准测试', method: this.testPerformance },
      { name: '边界条件测试', method: this.testEdgeCases },
      { name: '缓存机制测试', method: this.testCacheMechanism },
      { name: '数据验证测试', method: this.testDataValidation }
    ];

    // 执行所有测试
    for (const test of tests) {
      try {
        console.log(`📝 执行测试: ${test.name}`);
        const result = await test.method.call(this);
        
        if (result.success) {
          testResults.passed++;
          console.log(`✅ ${test.name} - 通过`);
        } else {
          testResults.failed++;
          testResults.errors.push(`❌ ${test.name} - 失败: ${result.message}`);
          console.log(`❌ ${test.name} - 失败: ${result.message}`);
        }
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`💥 ${test.name} - 异常: ${error.message}`);
        console.log(`💥 ${test.name} - 异常: ${error.message}`);
      }
      console.log('');
    }

    // 输出测试结果
    this.printTestResults(testResults);
    return testResults;
  }

  // 测试1: 基础功能测试
  static async testBasicFunctionality() {
    try {
      // 测试获取未来节日
      const futureFestivals = DynamicFestivalCalculator.getFutureThirteenMonthsFestivals();
      
      if (!Array.isArray(futureFestivals) || futureFestivals.length === 0) {
        return { success: false, message: '未能获取未来节日列表' };
      }

      // 验证节日数据结构
      const festival = futureFestivals[0];
      const requiredFields = ['id', 'name', 'date', 'type', 'level', 'daysUntil'];
      
      for (const field of requiredFields) {
        if (!(field in festival)) {
          return { success: false, message: `节日数据缺少必要字段: ${field}` };
        }
      }

      // 测试指定年份节日计算
      const currentYear = new Date().getFullYear();
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(currentYear);
      
      if (!Array.isArray(yearFestivals) || yearFestivals.length < 5) {
        return { success: false, message: '年度节日计算结果异常' };
      }

      return { success: true, message: `成功获取${futureFestivals.length}个未来节日，${yearFestivals.length}个${currentYear}年节日` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试2: 天文算法精度测试
  static async testAstronomicalAccuracy() {
    try {
      const testCases = [
        // 已知的准确春节日期
        { year: 2024, expectedDate: new Date(2024, 1, 10) }, // 2024年2月10日
        { year: 2025, expectedDate: new Date(2025, 0, 29) }, // 2025年1月29日
        { year: 2026, expectedDate: new Date(2026, 1, 17) }, // 2026年2月17日
      ];

      let accuracyErrors = [];

      for (const testCase of testCases) {
        const springFestival = DynamicFestivalCalculator.getSpringFestivalDate(testCase.year);
        
        if (!springFestival) {
          accuracyErrors.push(`${testCase.year}年春节计算失败`);
          continue;
        }

        // 计算日期差异（天数）
        const diffDays = Math.abs(springFestival.getTime() - testCase.expectedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 1) {
          accuracyErrors.push(`${testCase.year}年春节日期误差${diffDays.toFixed(1)}天`);
        }
      }

      if (accuracyErrors.length > 0) {
        return { success: false, message: `精度测试失败: ${accuracyErrors.join(', ')}` };
      }

      // 测试清明节计算精度
      const qingming2025 = DynamicFestivalCalculator.calculateQingming(2025);
      const expectedQingming = new Date(2025, 3, 5); // 预期2025年4月5日
      const qingmingDiff = Math.abs(qingming2025.getTime() - expectedQingming.getTime()) / (1000 * 60 * 60 * 24);

      if (qingmingDiff > 1) {
        return { success: false, message: `清明节计算误差过大: ${qingmingDiff.toFixed(1)}天` };
      }

      return { success: true, message: '天文算法精度测试通过，误差控制在1天内' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试3: 农历转换测试
  static async testLunarConversion() {
    try {
      const testCases = [
        // 农历转公历测试案例
        { lunar: { year: 2024, month: 1, day: 1 }, expectedSolar: new Date(2024, 1, 10) },
        { lunar: { year: 2025, month: 1, day: 1 }, expectedSolar: new Date(2025, 0, 29) },
        { lunar: { year: 2024, month: 8, day: 15 }, expectedSolar: new Date(2024, 8, 17) }, // 中秋节
      ];

      let conversionErrors = [];

      for (const testCase of testCases) {
        const { year, month, day } = testCase.lunar;
        const converted = DynamicFestivalCalculator.convertLunarToSolar(year, month, day);
        
        if (!converted) {
          conversionErrors.push(`农历${year}-${month}-${day}转换失败`);
          continue;
        }

        const diffDays = Math.abs(converted.getTime() - testCase.expectedSolar.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 1) {
          conversionErrors.push(`农历${year}-${month}-${day}转换误差${diffDays.toFixed(1)}天`);
        }
      }

      // 测试闰年判断
      const isLeap2025 = DynamicFestivalCalculator.isLunarLeapYear(2025);
      const leapMonth2025 = DynamicFestivalCalculator.getLeapMonth(2025);

      if (!isLeap2025 || leapMonth2025 !== 6) {
        conversionErrors.push('2025年闰年信息计算错误');
      }

      if (conversionErrors.length > 0) {
        return { success: false, message: `农历转换错误: ${conversionErrors.join(', ')}` };
      }

      return { success: true, message: '农历转换测试通过' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试4: 长期准确性测试
  static async testLongTermAccuracy() {
    try {
      const testYears = [2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100];
      let longTermErrors = [];

      for (const year of testYears) {
        // 测试能否计算该年度节日
        const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
        
        if (!yearFestivals || yearFestivals.length < 5) {
          longTermErrors.push(`${year}年节日计算失败`);
          continue;
        }

        // 验证春节日期合理性（应在1月15日-2月20日之间）
        const springFestival = DynamicFestivalCalculator.getSpringFestivalDate(year);
        if (springFestival) {
          const month = springFestival.getMonth() + 1;
          const day = springFestival.getDate();
          
          if (!((month === 1 && day >= 15) || (month === 2 && day <= 20))) {
            longTermErrors.push(`${year}年春节日期异常: ${month}月${day}日`);
          }
        }

        // 验证清明节日期合理性（应在4月4-6日）
        const qingming = DynamicFestivalCalculator.calculateQingming(year);
        if (qingming) {
          const month = qingming.getMonth() + 1;
          const day = qingming.getDate();
          
          if (month !== 4 || day < 3 || day > 7) {
            longTermErrors.push(`${year}年清明节日期异常: ${month}月${day}日`);
          }
        }
      }

      if (longTermErrors.length > 0) {
        return { success: false, message: `长期准确性测试失败: ${longTermErrors.join(', ')}` };
      }

      return { success: true, message: `长期准确性测试通过，成功计算${testYears.length}个未来年份` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试5: 性能基准测试
  static async testPerformance() {
    try {
      const iterations = 100;
      const testYear = 2030;
      
      // 测试计算性能
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        DynamicFestivalCalculator.calculateYearFestivals(testYear + (i % 10));
      }
      
      const endTime = Date.now();
      const averageTime = (endTime - startTime) / iterations;
      
      // 性能要求：单次计算应在100ms内完成
      if (averageTime > 100) {
        return { success: false, message: `性能不达标，平均用时${averageTime.toFixed(2)}ms` };
      }

      // 测试缓存效果
      const cacheStats = FestivalCacheManager.getCacheStatistics();
      const hitRate = parseFloat(cacheStats.hitRate);
      
      if (hitRate < 50) {
        console.warn(`缓存命中率较低: ${cacheStats.hitRate}`);
      }

      return { success: true, message: `性能测试通过，平均用时${averageTime.toFixed(2)}ms，缓存命中率${cacheStats.hitRate}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试6: 边界条件测试
  static async testEdgeCases() {
    try {
      const edgeCases = [];

      // 测试极端年份
      try {
        const veryEarlyYear = DynamicFestivalCalculator.calculateYearFestivals(1900);
        const veryLateYear = DynamicFestivalCalculator.calculateYearFestivals(2200);
        
        if (!veryEarlyYear || !veryLateYear) {
          edgeCases.push('极端年份计算失败');
        }
      } catch (error) {
        edgeCases.push(`极端年份测试异常: ${error.message}`);
      }

      // 测试无效输入
      try {
        const invalidYear = DynamicFestivalCalculator.calculateYearFestivals('invalid');
        // 应该返回空数组或抛出异常
      } catch (error) {
        // 期望的行为
      }

      // 测试农历边界日期
      const invalidLunar = DynamicFestivalCalculator.convertLunarToSolar(2025, 13, 1); // 无效月份
      if (invalidLunar !== null) {
        edgeCases.push('无效农历日期未被正确处理');
      }

      if (edgeCases.length > 0) {
        return { success: false, message: `边界条件测试失败: ${edgeCases.join(', ')}` };
      }

      return { success: true, message: '边界条件测试通过' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试7: 缓存机制测试
  static async testCacheMechanism() {
    try {
      // 清空缓存
      FestivalCacheManager.clearAllCache();
      
      // 首次计算（应该未命中缓存）
      const year = 2025;
      DynamicFestivalCalculator.calculateYearFestivals(year);
      
      let stats = FestivalCacheManager.getCacheStatistics();
      const initialMisses = stats.misses;
      
      // 再次计算相同年份（应该命中缓存）
      DynamicFestivalCalculator.calculateYearFestivals(year);
      
      stats = FestivalCacheManager.getCacheStatistics();
      const finalHits = stats.hits;
      
      if (finalHits === 0) {
        return { success: false, message: '缓存机制未生效' };
      }

      return { success: true, message: `缓存机制测试通过，命中率${stats.hitRate}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试8: 数据验证测试
  static async testDataValidation() {
    try {
      const currentYear = new Date().getFullYear();
      const festivals = DynamicFestivalCalculator.calculateYearFestivals(currentYear);
      
      // 验证数据格式
      const isValid = DynamicFestivalCalculator.validateFestivalData(festivals);
      
      if (!isValid) {
        return { success: false, message: '节日数据验证失败' };
      }

      // 检查重要节日是否存在
      const importantFestivals = ['春节', '清明节', '端午节', '中秋节', '元旦', '国庆节'];
      const festivalNames = festivals.map(f => f.name);
      const missingFestivals = importantFestivals.filter(name => !festivalNames.includes(name));
      
      if (missingFestivals.length > 0) {
        return { success: false, message: `缺少重要节日: ${missingFestivals.join(', ')}` };
      }

      return { success: true, message: `数据验证通过，包含${festivals.length}个节日` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 打印测试结果
  static printTestResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 测试结果汇总');
    console.log('='.repeat(60));
    
    const total = results.passed + results.failed;
    const successRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
    
    console.log(`✅ 通过测试: ${results.passed}/${total}`);
    console.log(`❌ 失败测试: ${results.failed}/${total}`);
    console.log(`📊 成功率: ${successRate}%`);
    
    if (results.errors.length > 0) {
      console.log('\n📋 详细错误信息:');
      results.errors.forEach(error => console.log(`  ${error}`));
    }
    
    // 输出性能统计
    const stats = FestivalCacheManager.getCacheStatistics();
    console.log('\n📈 性能统计信息:');
    console.log(`  缓存命中率: ${stats.hitRate}`);
    console.log(`  总请求数: ${stats.totalRequests}`);
    console.log(`  缓存大小: ${stats.cacheSize.total}项`);
    console.log(`  平均计算时间: ${stats.averageComputationTime}`);
    
    console.log('='.repeat(60));
    
    if (results.failed === 0) {
      console.log('🎉 所有测试通过！新的节日算法已经准备就绪。');
    } else {
      console.log('⚠️  存在测试失败，请检查相关问题。');
    }
  }

  // 运行特定的验证测试
  static async runValidationTest() {
    console.log('🔍 运行节日算法验证测试...\n');
    
    // 验证关键日期的准确性
    const validationCases = [
      { year: 2024, festival: '春节', expected: '2024-02-10' },
      { year: 2025, festival: '春节', expected: '2025-01-29' },
      { year: 2026, festival: '春节', expected: '2026-02-17' },
      { year: 2024, festival: '清明节', expected: '2024-04-04' },
      { year: 2025, festival: '清明节', expected: '2025-04-05' }
    ];
    
    console.log('验证关键节日日期:');
    for (const testCase of validationCases) {
      const festivals = DynamicFestivalCalculator.calculateYearFestivals(testCase.year);
      const festival = festivals.find(f => f.name === testCase.festival);
      
      if (festival) {
        const actualDate = `${festival.year}-${String(festival.month).padStart(2, '0')}-${String(festival.day).padStart(2, '0')}`;
        const isMatch = actualDate === testCase.expected;
        console.log(`  ${testCase.year}年${testCase.festival}: ${actualDate} ${isMatch ? '✅' : '❌'}`);
      } else {
        console.log(`  ${testCase.year}年${testCase.festival}: 未找到 ❌`);
      }
    }
    
    // 验证长期计算能力
    console.log('\n验证长期计算能力:');
    const futurYears = [2050, 2075, 2100];
    for (const year of futurYears) {
      try {
        const festivals = DynamicFestivalCalculator.calculateYearFestivals(year);
        const springFestival = festivals.find(f => f.name === '春节');
        console.log(`  ${year}年春节: ${springFestival ? `${springFestival.month}月${springFestival.day}日` : '计算失败'} ${springFestival ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`  ${year}年春节: 计算异常 ❌`);
      }
    }
    
    console.log('\n✨ 验证测试完成');
  }
}

// 导出测试类
module.exports = DynamicFestivalCalculatorTest;

// 如果直接运行此文件，执行所有测试
if (require.main === module) {
  DynamicFestivalCalculatorTest.runAllTests()
    .then(() => {
      console.log('\n🔄 运行验证测试...');
      return DynamicFestivalCalculatorTest.runValidationTest();
    })
    .then(() => {
      console.log('\n🏁 所有测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('测试执行异常:', error);
      process.exit(1);
    });
}
