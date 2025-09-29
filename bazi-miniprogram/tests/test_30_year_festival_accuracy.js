// 30年节日准确性全面验证测试 (2020-2050)
const DynamicFestivalCalculator = require('../miniprogram/utils/dynamic-festival-calculator.js');
const LunarConversionEngineFixed = require('../miniprogram/utils/lunar-conversion-engine-fixed.js');

class Festival30YearAccuracyTest {
  
  // 权威节日数据样本 - 用于验证算法准确性
  static AUTHORITY_FESTIVAL_DATES = {
    // 2025年关键节日验证数据
    2025: {
      'daxue': { month: 12, day: 7, name: '大雪' },      // 您提到的问题
      'double_ninth': { month: 10, day: 29, name: '重阳节' }, // 您提到的问题
      'spring_festival': { month: 1, day: 29, name: '春节' },
      'qingming': { month: 4, day: 5, name: '清明' },
      'mid_autumn': { month: 9, day: 6, name: '中秋节' },
      'dongzhi': { month: 12, day: 21, name: '冬至' }
    },
    
    // 2024年验证数据
    2024: {
      'daxue': { month: 12, day: 7, name: '大雪' },
      'double_ninth': { month: 10, day: 11, name: '重阳节' },
      'spring_festival': { month: 2, day: 10, name: '春节' },
      'qingming': { month: 4, day: 4, name: '清明' }
    },
    
    // 2026年验证数据
    2026: {
      'daxue': { month: 12, day: 7, name: '大雪' },
      'double_ninth': { month: 10, day: 18, name: '重阳节' },
      'spring_festival': { month: 2, day: 17, name: '春节' },
      'qingming': { month: 4, day: 5, name: '清明' }
    }
  };

  // 执行全面的30年验证测试
  static async runComprehensiveTest() {
    console.log('='.repeat(60));
    console.log('🎄 开始30年节日准确性全面验证测试 (2020-2050)');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    const results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errors: [],
      warnings: [],
      yearResults: {}
    };

    try {
      // 阶段1：验证权威数据样本
      console.log('\n📋 阶段1: 验证权威数据样本');
      await this.validateAuthoritySamples(results);

      // 阶段2：验证24节气完整性
      console.log('\n🌅 阶段2: 验证24节气计算（30年）');
      await this.validateSolarTerms(results);

      // 阶段3：验证农历节日完整性
      console.log('\n🏮 阶段3: 验证农历节日计算（30年）');
      await this.validateLunarFestivals(results);

      // 阶段4：验证现代节日完整性
      console.log('\n🎉 阶段4: 验证现代节日计算（30年）');
      await this.validateModernFestivals(results);

      // 阶段5：长期稳定性测试
      console.log('\n⚡ 阶段5: 长期稳定性和性能测试');
      await this.validateLongTermStability(results);

    } catch (error) {
      console.error('💥 测试执行过程中发生严重错误:', error);
      results.errors.push(`测试执行错误: ${error.message}`);
    }

    // 生成测试报告
    const duration = Date.now() - startTime;
    this.generateTestReport(results, duration);
    
    return results;
  }

  // 验证权威数据样本
  static async validateAuthoritySamples(results) {
    console.log('  正在验证权威节日数据样本...');
    
    for (const [year, festivals] of Object.entries(this.AUTHORITY_FESTIVAL_DATES)) {
      const yearNum = parseInt(year);
      console.log(`  📅 验证${year}年权威数据...`);
      
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(yearNum);
      
      for (const [festivalId, expectedData] of Object.entries(festivals)) {
        results.totalTests++;
        
        // 查找对应的节日
        const calculatedFestival = yearFestivals.find(f => 
          f.id.startsWith(festivalId) || f.name === expectedData.name
        );
        
        if (!calculatedFestival) {
          results.failedTests++;
          results.errors.push(`${year}年 ${expectedData.name}: 未找到计算结果`);
          continue;
        }
        
        // 验证日期准确性
        const dateDiff = Math.abs(
          calculatedFestival.month - expectedData.month + 
          (calculatedFestival.day - expectedData.day) / 100
        );
        
        if (dateDiff <= 0.01) { // 允许1天误差
          results.passedTests++;
          console.log(`    ✅ ${expectedData.name}: ${calculatedFestival.month}月${calculatedFestival.day}日 ✓`);
        } else {
          results.failedTests++;
          const errorMsg = `${year}年 ${expectedData.name}: 期望${expectedData.month}月${expectedData.day}日，实际${calculatedFestival.month}月${calculatedFestival.day}日`;
          results.errors.push(errorMsg);
          console.log(`    ❌ ${errorMsg}`);
        }
      }
    }
  }

  // 验证24节气（重点验证大雪节气）
  static async validateSolarTerms(results) {
    console.log('  正在验证24节气计算...');
    
    const solarTermNames = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', 
                           '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
                           '立秋', '处暑', '白露', '秋分', '寒露', '霜降', 
                           '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'];
    
    let termErrorCount = 0;
    let termSuccessCount = 0;
    
    for (let year = 2020; year <= 2050; year++) {
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
      const solarTerms = yearFestivals.filter(f => f.calendar === 'solar_term');
      
      results.totalTests++;
      
      // 检查是否有24个节气
      if (solarTerms.length !== 24) {
        results.failedTests++;
        results.errors.push(`${year}年节气数量错误: 期望24个，实际${solarTerms.length}个`);
        termErrorCount++;
        continue;
      }
      
      // 特别验证大雪节气
      const daxue = solarTerms.find(t => t.name === '大雪');
      if (daxue) {
        // 大雪一般在12月6-8日之间
        if (daxue.month === 12 && daxue.day >= 6 && daxue.day <= 8) {
          console.log(`    ✅ ${year}年大雪: ${daxue.month}月${daxue.day}日 ✓`);
        } else {
          results.warnings.push(`${year}年大雪日期异常: ${daxue.month}月${daxue.day}日`);
          console.log(`    ⚠️  ${year}年大雪: ${daxue.month}月${daxue.day}日 (异常)`);
        }
      }
      
      // 验证节气时间顺序
      const termsByDate = solarTerms.sort((a, b) => a.date.getTime() - b.date.getTime());
      let orderValid = true;
      for (let i = 0; i < termsByDate.length - 1; i++) {
        const daysDiff = (termsByDate[i + 1].date - termsByDate[i].date) / (1000 * 60 * 60 * 24);
        if (daysDiff < 10 || daysDiff > 20) { // 节气间隔约15天
          orderValid = false;
          break;
        }
      }
      
      if (orderValid) {
        results.passedTests++;
        termSuccessCount++;
      } else {
        results.failedTests++;
        results.errors.push(`${year}年节气时间顺序异常`);
        termErrorCount++;
      }
    }
    
    console.log(`    24节气验证: ${termSuccessCount}年成功, ${termErrorCount}年失败`);
  }

  // 验证农历节日（重点验证重阳节）
  static async validateLunarFestivals(results) {
    console.log('  正在验证农历节日计算...');
    
    const lunarFestivalNames = ['春节', '元宵节', '端午节', '七夕节', '中秋节', '重阳节'];
    
    let lunarErrorCount = 0;
    let lunarSuccessCount = 0;
    
    for (let year = 2020; year <= 2050; year++) {
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
      const lunarFestivals = yearFestivals.filter(f => f.calendar === 'lunar');
      
      results.totalTests++;
      
      // 特别验证重阳节
      const chongyang = lunarFestivals.find(f => f.name === '重阳节');
      if (chongyang) {
        // 重阳节一般在公历10月份
        if (chongyang.month >= 9 && chongyang.month <= 11) {
          console.log(`    ✅ ${year}年重阳节: ${chongyang.month}月${chongyang.day}日 ✓`);
        } else {
          results.warnings.push(`${year}年重阳节日期异常: ${chongyang.month}月${chongyang.day}日`);
          console.log(`    ⚠️  ${year}年重阳节: ${chongyang.month}月${chongyang.day}日 (异常)`);
        }
      }
      
      // 验证农历节日完整性
      const foundFestivals = lunarFestivals.map(f => f.name);
      const missingFestivals = lunarFestivalNames.filter(name => !foundFestivals.includes(name));
      
      if (missingFestivals.length === 0) {
        results.passedTests++;
        lunarSuccessCount++;
      } else {
        results.failedTests++;
        results.errors.push(`${year}年缺少农历节日: ${missingFestivals.join(', ')}`);
        lunarErrorCount++;
      }
    }
    
    console.log(`    农历节日验证: ${lunarSuccessCount}年成功, ${lunarErrorCount}年失败`);
  }

  // 验证现代节日
  static async validateModernFestivals(results) {
    console.log('  正在验证现代节日计算...');
    
    const modernFestivalNames = ['元旦', '劳动节', '国庆节', '儿童节'];
    
    let modernErrorCount = 0;
    let modernSuccessCount = 0;
    
    for (let year = 2020; year <= 2050; year++) {
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
      const modernFestivals = yearFestivals.filter(f => f.calendar === 'solar' && f.type === 'modern');
      
      results.totalTests++;
      
      // 验证现代节日完整性
      const foundFestivals = modernFestivals.map(f => f.name);
      const missingFestivals = modernFestivalNames.filter(name => !foundFestivals.includes(name));
      
      if (missingFestivals.length === 0) {
        results.passedTests++;
        modernSuccessCount++;
      } else {
        results.failedTests++;
        results.errors.push(`${year}年缺少现代节日: ${missingFestivals.join(', ')}`);
        modernErrorCount++;
      }
    }
    
    console.log(`    现代节日验证: ${modernSuccessCount}年成功, ${modernErrorCount}年失败`);
  }

  // 长期稳定性测试
  static async validateLongTermStability(results) {
    console.log('  正在进行长期稳定性测试...');
    
    const performanceResults = [];
    let stabilityErrors = 0;
    
    for (let year = 2020; year <= 2050; year++) {
      const startTime = Date.now();
      
      try {
        const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
        const duration = Date.now() - startTime;
        
        performanceResults.push({ year, duration, festivalCount: yearFestivals.length });
        
        // 检查节日数量是否合理 (约45-50个节日)
        if (yearFestivals.length < 40 || yearFestivals.length > 60) {
          results.warnings.push(`${year}年节日数量异常: ${yearFestivals.length}个`);
          stabilityErrors++;
        }
        
        results.totalTests++;
        results.passedTests++;
        
      } catch (error) {
        results.totalTests++;
        results.failedTests++;
        results.errors.push(`${year}年计算失败: ${error.message}`);
        stabilityErrors++;
      }
    }
    
    // 性能统计
    const avgDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
    const maxDuration = Math.max(...performanceResults.map(r => r.duration));
    const avgFestivalCount = performanceResults.reduce((sum, r) => sum + r.festivalCount, 0) / performanceResults.length;
    
    console.log(`    性能统计: 平均${avgDuration.toFixed(1)}ms/年, 最大${maxDuration}ms, 平均节日数${avgFestivalCount.toFixed(1)}个`);
    console.log(`    稳定性: ${31 - stabilityErrors}/31年成功, ${stabilityErrors}年异常`);
  }

  // 生成测试报告
  static generateTestReport(results, duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 30年节日准确性验证测试报告');
    console.log('='.repeat(60));
    
    const successRate = (results.passedTests / results.totalTests * 100).toFixed(1);
    
    console.log(`🕐 测试时长: ${duration}ms`);
    console.log(`📈 总测试数: ${results.totalTests}`);
    console.log(`✅ 通过测试: ${results.passedTests} (${successRate}%)`);
    console.log(`❌ 失败测试: ${results.failedTests}`);
    console.log(`⚠️  警告数量: ${results.warnings.length}`);
    
    // 详细错误信息
    if (results.errors.length > 0) {
      console.log('\n🚨 详细错误信息:');
      results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      if (results.errors.length > 10) {
        console.log(`  ... 还有${results.errors.length - 10}个错误`);
      }
    }
    
    // 详细警告信息
    if (results.warnings.length > 0) {
      console.log('\n⚠️  详细警告信息:');
      results.warnings.slice(0, 5).forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
      if (results.warnings.length > 5) {
        console.log(`  ... 还有${results.warnings.length - 5}个警告`);
      }
    }
    
    // 总结评估
    console.log('\n🎯 总结评估:');
    if (successRate >= 95) {
      console.log('🎉 优秀! 节日计算算法准确性和稳定性都很高');
    } else if (successRate >= 85) {
      console.log('👍 良好! 节日计算基本准确，有少量问题需要优化');
    } else if (successRate >= 70) {
      console.log('⚠️  一般! 节日计算存在一些问题，需要重点优化');
    } else {
      console.log('❌ 较差! 节日计算存在严重问题，需要全面修复');
    }
    
    console.log('='.repeat(60));
  }

  // 快速验证特定节日
  static quickValidateSpecificFestival(festivalName, year) {
    console.log(`🔍 快速验证 ${year}年 ${festivalName}`);
    
    try {
      const yearFestivals = DynamicFestivalCalculator.calculateYearFestivals(year);
      const festival = yearFestivals.find(f => f.name === festivalName);
      
      if (festival) {
        console.log(`✅ ${festivalName}: ${festival.month}月${festival.day}日`);
        console.log(`   类型: ${festival.type}, 历法: ${festival.calendar}`);
        if (festival.longitude) {
          console.log(`   太阳黄经: ${festival.longitude}度`);
        }
        if (festival.lunarMonth) {
          console.log(`   农历: ${festival.lunarMonth}月${festival.lunarDay}日`);
        }
        return festival;
      } else {
        console.log(`❌ 未找到 ${festivalName}`);
        return null;
      }
    } catch (error) {
      console.error(`💥 验证失败: ${error.message}`);
      return null;
    }
  }

  // 对比验证多年份的相同节日
  static compareMultiYearFestival(festivalName, years) {
    console.log(`📊 对比验证 ${festivalName} (${years.join(', ')})`);
    
    const results = [];
    
    for (const year of years) {
      const festival = this.quickValidateSpecificFestival(festivalName, year);
      if (festival) {
        results.push({
          year: year,
          month: festival.month,
          day: festival.day,
          date: festival.date
        });
      }
    }
    
    // 分析规律
    if (results.length > 1) {
      console.log('\n📈 变化规律分析:');
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const curr = results[i];
        const daysDiff = Math.round((curr.date - prev.date) / (1000 * 60 * 60 * 24));
        console.log(`  ${prev.year} → ${curr.year}: ${prev.month}/${prev.day} → ${curr.month}/${curr.day} (相差${daysDiff}天)`);
      }
    }
    
    return results;
  }
}

// 模块导出
module.exports = Festival30YearAccuracyTest;

// 如果直接运行此文件，执行测试
if (require.main === module) {
  Festival30YearAccuracyTest.runComprehensiveTest()
    .then(results => {
      console.log('\n🎯 测试完成，退出程序');
      process.exit(results.failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 测试执行失败:', error);
      process.exit(1);
    });
}
