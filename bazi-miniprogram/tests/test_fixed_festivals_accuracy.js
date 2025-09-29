// 修复版节日计算准确性验证测试
const DynamicFestivalCalculator = require('../miniprogram/utils/dynamic-festival-calculator.js');
const LunarConversionEngineFixed = require('../miniprogram/utils/lunar-conversion-engine-fixed.js');

class FixedFestivalsAccuracyTest {
  
  // 权威节日参考数据（2020-2035年）
  static REFERENCE_FESTIVALS = {
    2020: {
      spring_festival: new Date(2020, 0, 25), // 1月25日
      lantern_festival: new Date(2020, 1, 8), // 2月8日
      qingming: new Date(2020, 3, 4), // 4月4日
      dragon_boat: new Date(2020, 5, 25), // 6月25日
      mid_autumn: new Date(2020, 9, 1), // 10月1日
    },
    2021: {
      spring_festival: new Date(2021, 1, 12), // 2月12日
      lantern_festival: new Date(2021, 1, 26), // 2月26日
      qingming: new Date(2021, 3, 4), // 4月4日
      dragon_boat: new Date(2021, 5, 14), // 6月14日
      mid_autumn: new Date(2021, 8, 21), // 9月21日
    },
    2022: {
      spring_festival: new Date(2022, 1, 1), // 2月1日
      lantern_festival: new Date(2022, 1, 15), // 2月15日
      qingming: new Date(2022, 3, 5), // 4月5日
      dragon_boat: new Date(2022, 5, 3), // 6月3日
      mid_autumn: new Date(2022, 8, 10), // 9月10日
    },
    2023: {
      spring_festival: new Date(2023, 0, 22), // 1月22日
      lantern_festival: new Date(2023, 1, 5), // 2月5日
      qingming: new Date(2023, 3, 5), // 4月5日
      dragon_boat: new Date(2023, 5, 22), // 6月22日
      mid_autumn: new Date(2023, 8, 29), // 9月29日
    },
    2024: {
      spring_festival: new Date(2024, 1, 10), // 2月10日
      lantern_festival: new Date(2024, 1, 24), // 2月24日
      qingming: new Date(2024, 3, 4), // 4月4日
      dragon_boat: new Date(2024, 5, 10), // 6月10日
      mid_autumn: new Date(2024, 8, 17), // 9月17日
    },
    2025: {
      spring_festival: new Date(2025, 0, 29), // 1月29日
      lantern_festival: new Date(2025, 1, 12), // 2月12日
      qingming: new Date(2025, 3, 4), // 4月4日
      dragon_boat: new Date(2025, 4, 31), // 5月31日
      mid_autumn: new Date(2025, 9, 6), // 10月6日
    },
    2030: {
      spring_festival: new Date(2030, 1, 3), // 2月3日
      lantern_festival: new Date(2030, 1, 17), // 2月17日
      qingming: new Date(2030, 3, 4), // 4月4日
      dragon_boat: new Date(2030, 5, 5), // 6月5日
      mid_autumn: new Date(2030, 8, 11), // 9月11日
    }
  };

  /**
   * 运行完整的修复验证测试
   */
  static runComprehensiveTest() {
    console.log('🔧 修复版节日计算准确性验证');
    console.log('============================================================');
    console.log('🚀 开始验证修复后的节日计算准确性...\n');

    const results = {
      springFestival: this.testSpringFestivalAccuracy(),
      lanternFestival: this.testLanternFestivalAccuracy(),
      qingming: this.testQingmingAccuracy(),
      dragonBoat: this.testDragonBoatAccuracy(),
      midAutumn: this.testMidAutumnAccuracy(),
      lunarSystem: this.testLunarSystemStability(),
      longTerm: this.testLongTermAccuracy()
    };

    this.generateComprehensiveReport(results);
    return results;
  }

  /**
   * 测试春节计算准确性
   */
  static testSpringFestivalAccuracy() {
    console.log('🏮 验证春节计算准确性：');
    console.log('----------------------------------------');
    
    const results = [];
    let correctCount = 0;
    let totalCount = 0;
    let maxError = 0;

    Object.entries(this.REFERENCE_FESTIVALS).forEach(([year, festivals]) => {
      totalCount++;
      const yearNum = parseInt(year);
      
      try {
        // 使用修复版引擎计算春节
        const calculatedDate = LunarConversionEngineFixed.lunarToSolar(yearNum, 1, 1, false);
        const expectedDate = festivals.spring_festival;
        
        if (calculatedDate) {
          const errorDays = Math.abs((calculatedDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
          const isCorrect = errorDays <= 1; // 允许1天误差
          
          if (isCorrect) correctCount++;
          maxError = Math.max(maxError, errorDays);
          
          const status = isCorrect ? '✅' : '❌';
          const dateStr = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
          const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, '0')}-${String(expectedDate.getDate()).padStart(2, '0')}`;
          
          console.log(`  ${year}年: ${status} ${dateStr} (误差${errorDays.toFixed(1)}天${errorDays > 1 ? ', 期望' + expectedStr : ''})`);
          
          results.push({
            year: yearNum,
            calculated: calculatedDate,
            expected: expectedDate,
            error: errorDays,
            correct: isCorrect
          });
        } else {
          console.log(`  ${year}年: ❌ 计算失败`);
          results.push({
            year: yearNum,
            calculated: null,
            expected: expectedDate,
            error: Infinity,
            correct: false
          });
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算异常: ${error.message}`);
        results.push({
          year: yearNum,
          calculated: null,
          expected: festivals.spring_festival,
          error: Infinity,
          correct: false
        });
      }
    });

    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 春节验证结果:`);
    console.log(`  准确率: ${correctCount}/${totalCount} (${accuracy}%)`);
    console.log(`  最大误差: ${maxError.toFixed(1)}天\n`);

    return {
      festival: '春节',
      accuracy: parseFloat(accuracy),
      correct: correctCount,
      total: totalCount,
      maxError: maxError,
      results: results
    };
  }

  /**
   * 测试元宵节计算准确性
   */
  static testLanternFestivalAccuracy() {
    console.log('🏮 验证元宵节计算准确性：');
    console.log('----------------------------------------');
    
    const results = [];
    let correctCount = 0;
    let totalCount = 0;
    let maxError = 0;

    Object.entries(this.REFERENCE_FESTIVALS).forEach(([year, festivals]) => {
      totalCount++;
      const yearNum = parseInt(year);
      
      try {
        const calculatedDate = LunarConversionEngineFixed.lunarToSolar(yearNum, 1, 15, false);
        const expectedDate = festivals.lantern_festival;
        
        if (calculatedDate) {
          const errorDays = Math.abs((calculatedDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
          const isCorrect = errorDays <= 1;
          
          if (isCorrect) correctCount++;
          maxError = Math.max(maxError, errorDays);
          
          const status = isCorrect ? '✅' : '❌';
          const dateStr = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
          
          console.log(`  ${year}年: ${status} ${dateStr} (误差${errorDays.toFixed(1)}天)`);
          
          results.push({
            year: yearNum,
            calculated: calculatedDate,
            expected: expectedDate,
            error: errorDays,
            correct: isCorrect
          });
        } else {
          console.log(`  ${year}年: ❌ 计算失败`);
          results.push({
            year: yearNum,
            calculated: null,
            expected: expectedDate,
            error: Infinity,
            correct: false
          });
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算异常: ${error.message}`);
      }
    });

    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 元宵节验证结果:`);
    console.log(`  准确率: ${correctCount}/${totalCount} (${accuracy}%)`);
    console.log(`  最大误差: ${maxError.toFixed(1)}天\n`);

    return {
      festival: '元宵节',
      accuracy: parseFloat(accuracy),
      correct: correctCount,
      total: totalCount,
      maxError: maxError,
      results: results
    };
  }

  /**
   * 测试清明节计算准确性
   */
  static testQingmingAccuracy() {
    console.log('🏮 验证清明节计算准确性：');
    console.log('----------------------------------------');
    
    const results = [];
    let correctCount = 0;
    let totalCount = 0;
    let maxError = 0;

    Object.entries(this.REFERENCE_FESTIVALS).forEach(([year, festivals]) => {
      totalCount++;
      const yearNum = parseInt(year);
      
      try {
        const calculatedDate = DynamicFestivalCalculator.calculateQingming(yearNum);
        const expectedDate = festivals.qingming;
        
        if (calculatedDate) {
          const errorDays = Math.abs((calculatedDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
          const isCorrect = errorDays <= 1;
          
          if (isCorrect) correctCount++;
          maxError = Math.max(maxError, errorDays);
          
          const status = isCorrect ? '✅' : '❌';
          const dateStr = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
          
          console.log(`  ${year}年: ${status} ${dateStr} (误差${errorDays.toFixed(1)}天)`);
          
          results.push({
            year: yearNum,
            calculated: calculatedDate,
            expected: expectedDate,
            error: errorDays,
            correct: isCorrect
          });
        } else {
          console.log(`  ${year}年: ❌ 计算失败`);
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算异常: ${error.message}`);
      }
    });

    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 清明节验证结果:`);
    console.log(`  准确率: ${correctCount}/${totalCount} (${accuracy}%)`);
    console.log(`  最大误差: ${maxError.toFixed(1)}天\n`);

    return {
      festival: '清明节',
      accuracy: parseFloat(accuracy),
      correct: correctCount,
      total: totalCount,
      maxError: maxError,
      results: results
    };
  }

  /**
   * 测试端午节计算准确性
   */
  static testDragonBoatAccuracy() {
    console.log('🏮 验证端午节计算准确性：');
    console.log('----------------------------------------');
    
    const results = [];
    let correctCount = 0;
    let totalCount = 0;
    let maxError = 0;

    Object.entries(this.REFERENCE_FESTIVALS).forEach(([year, festivals]) => {
      totalCount++;
      const yearNum = parseInt(year);
      
      try {
        const calculatedDate = LunarConversionEngineFixed.lunarToSolar(yearNum, 5, 5, false);
        const expectedDate = festivals.dragon_boat;
        
        if (calculatedDate) {
          const errorDays = Math.abs((calculatedDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
          const isCorrect = errorDays <= 1;
          
          if (isCorrect) correctCount++;
          maxError = Math.max(maxError, errorDays);
          
          const status = isCorrect ? '✅' : '❌';
          const dateStr = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
          
          console.log(`  ${year}年: ${status} ${dateStr} (误差${errorDays.toFixed(1)}天)`);
          
          results.push({
            year: yearNum,
            calculated: calculatedDate,
            expected: expectedDate,
            error: errorDays,
            correct: isCorrect
          });
        } else {
          console.log(`  ${year}年: ❌ 计算失败`);
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算异常: ${error.message}`);
      }
    });

    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 端午节验证结果:`);
    console.log(`  准确率: ${correctCount}/${totalCount} (${accuracy}%)`);
    console.log(`  最大误差: ${maxError.toFixed(1)}天\n`);

    return {
      festival: '端午节',
      accuracy: parseFloat(accuracy),
      correct: correctCount,
      total: totalCount,
      maxError: maxError,
      results: results
    };
  }

  /**
   * 测试中秋节计算准确性
   */
  static testMidAutumnAccuracy() {
    console.log('🏮 验证中秋节计算准确性：');
    console.log('----------------------------------------');
    
    const results = [];
    let correctCount = 0;
    let totalCount = 0;
    let maxError = 0;

    Object.entries(this.REFERENCE_FESTIVALS).forEach(([year, festivals]) => {
      totalCount++;
      const yearNum = parseInt(year);
      
      try {
        const calculatedDate = LunarConversionEngineFixed.lunarToSolar(yearNum, 8, 15, false);
        const expectedDate = festivals.mid_autumn;
        
        if (calculatedDate) {
          const errorDays = Math.abs((calculatedDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
          const isCorrect = errorDays <= 1;
          
          if (isCorrect) correctCount++;
          maxError = Math.max(maxError, errorDays);
          
          const status = isCorrect ? '✅' : '❌';
          const dateStr = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
          
          console.log(`  ${year}年: ${status} ${dateStr} (误差${errorDays.toFixed(1)}天)`);
          
          results.push({
            year: yearNum,
            calculated: calculatedDate,
            expected: expectedDate,
            error: errorDays,
            correct: isCorrect
          });
        } else {
          console.log(`  ${year}年: ❌ 计算失败`);
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算异常: ${error.message}`);
      }
    });

    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 中秋节验证结果:`);
    console.log(`  准确率: ${correctCount}/${totalCount} (${accuracy}%)`);
    console.log(`  最大误差: ${maxError.toFixed(1)}天\n`);

    return {
      festival: '中秋节',
      accuracy: parseFloat(accuracy),
      correct: correctCount,
      total: totalCount,
      maxError: maxError,
      results: results
    };
  }

  /**
   * 测试农历系统稳定性
   */
  static testLunarSystemStability() {
    console.log('🌙 验证农历系统稳定性：');
    console.log('----------------------------------------');
    
    let successCount = 0;
    let totalCount = 0;
    const testYears = [2020, 2021, 2022, 2023, 2024, 2025, 2030, 2035];

    testYears.forEach(year => {
      totalCount++;
      try {
        const yearData = LunarConversionEngineFixed.calculateLunarYear(year);
        if (yearData && yearData.months && yearData.months.length >= 12) {
          console.log(`  ${year}年: ✅ ${yearData.isLeapYear ? '闰年' : '平年'} (${yearData.totalMonths}个月, ${yearData.calculationMethod})`);
          successCount++;
        } else {
          console.log(`  ${year}年: ❌ 数据不完整`);
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算失败: ${error.message}`);
      }
    });

    const stability = totalCount > 0 ? (successCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 农历系统稳定性: ${successCount}/${totalCount} (${stability}%)\n`);

    return {
      name: '农历系统稳定性',
      stability: parseFloat(stability),
      success: successCount,
      total: totalCount
    };
  }

  /**
   * 测试长期计算准确性
   */
  static testLongTermAccuracy() {
    console.log('🔮 验证长期计算准确性（2025-2050年）：');
    console.log('----------------------------------------');
    
    let reasonableCount = 0;
    let totalCount = 0;
    const testYears = Array.from({length: 26}, (_, i) => 2025 + i);

    testYears.forEach(year => {
      totalCount++;
      try {
        const springDate = LunarConversionEngineFixed.getSpringFestivalDate(year);
        const qingmingDate = DynamicFestivalCalculator.calculateQingming(year);
        
        if (springDate && qingmingDate) {
          const springMonth = springDate.getMonth() + 1;
          const springDay = springDate.getDate();
          const qingmingMonth = qingmingDate.getMonth() + 1;
          const qingmingDay = qingmingDate.getDate();
          
          // 检查春节是否在合理范围（1月20日-2月20日）
          const springReasonable = (springMonth === 1 && springDay >= 20) || (springMonth === 2 && springDay <= 20);
          
          // 检查清明是否在合理范围（4月3日-4月6日）
          const qingmingReasonable = qingmingMonth === 4 && qingmingDay >= 3 && qingmingDay <= 6;
          
          if (springReasonable && qingmingReasonable) {
            reasonableCount++;
            console.log(`  ${year}年: ✅ 春节${springMonth}月${springDay}日, 清明${qingmingMonth}月${qingmingDay}日`);
          } else {
            console.log(`  ${year}年: ⚠️ 春节${springMonth}月${springDay}日, 清明${qingmingMonth}月${qingmingDay}日 (可能异常)`);
          }
        } else {
          console.log(`  ${year}年: ❌ 计算失败`);
        }
      } catch (error) {
        console.log(`  ${year}年: ❌ 计算异常`);
      }
    });

    const reasonability = totalCount > 0 ? (reasonableCount / totalCount * 100).toFixed(1) : 0;
    console.log(`\n📊 长期计算合理性: ${reasonableCount}/${totalCount} (${reasonability}%)\n`);

    return {
      name: '长期计算准确性',
      reasonability: parseFloat(reasonability),
      reasonable: reasonableCount,
      total: totalCount
    };
  }

  /**
   * 生成综合报告
   */
  static generateComprehensiveReport(results) {
    console.log('============================================================');
    console.log('🎯 修复版节日计算综合报告');
    console.log('============================================================');

    const overallStats = this.calculateOverallStats(results);
    
    console.log('📊 总体表现:');
    console.log(`  平均准确率: ${overallStats.averageAccuracy.toFixed(1)}%`);
    console.log(`  最大误差: ${overallStats.maxError.toFixed(1)}天`);
    console.log(`  系统稳定性: ${results.lunarSystem.stability}%`);
    console.log(`  长期合理性: ${results.longTerm.reasonability}%\n`);

    console.log('📋 各节日表现详情:');
    const festivals = ['springFestival', 'lanternFestival', 'qingming', 'dragonBoat', 'midAutumn'];
    festivals.forEach(key => {
      const result = results[key];
      if (result) {
        const status = result.accuracy >= 95 ? '✅' : result.accuracy >= 80 ? '⚠️' : '❌';
        console.log(`  ${status} ${result.festival}: ${result.accuracy}% (误差≤${result.maxError.toFixed(1)}天)`);
      }
    });

    console.log('\n🏆 修复效果评估:');
    if (overallStats.averageAccuracy >= 95) {
      console.log('✅ 修复非常成功！节日计算准确性显著提升');
    } else if (overallStats.averageAccuracy >= 80) {
      console.log('⚠️ 修复基本成功，但仍有改进空间');
    } else {
      console.log('❌ 修复效果不佳，需要进一步优化');
    }

    console.log(`\n⏱️ 测试用时: ${Date.now() - this.startTime}ms`);
    console.log('✨ 验证完成！\n');

    return overallStats;
  }

  /**
   * 计算总体统计信息
   */
  static calculateOverallStats(results) {
    const festivals = ['springFestival', 'lanternFestival', 'qingming', 'dragonBoat', 'midAutumn'];
    const accuracies = festivals.map(key => results[key].accuracy).filter(acc => !isNaN(acc));
    const maxErrors = festivals.map(key => results[key].maxError).filter(err => !isNaN(err));

    return {
      averageAccuracy: accuracies.length > 0 ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length : 0,
      maxError: maxErrors.length > 0 ? Math.max(...maxErrors) : 0,
      totalTests: festivals.length,
      systemStability: results.lunarSystem.stability,
      longTermReasonability: results.longTerm.reasonability
    };
  }
}

// 设置开始时间
FixedFestivalsAccuracyTest.startTime = Date.now();

// 导出测试类
module.exports = FixedFestivalsAccuracyTest;

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  try {
    FixedFestivalsAccuracyTest.runComprehensiveTest();
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}
