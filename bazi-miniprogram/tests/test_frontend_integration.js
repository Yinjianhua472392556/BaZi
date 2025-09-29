// 前端集成测试 - 验证节日页面与新算法的集成效果
const FestivalData = require('../miniprogram/utils/festival-data.js');
const DynamicFestivalCalculator = require('../miniprogram/utils/dynamic-festival-calculator.js');
const LunarConversionEngine = require('../miniprogram/utils/lunar-conversion-engine.js');

class FrontendIntegrationTest {
  static async runAllTests() {
    console.log('🚀 开始前端集成测试...\n');
    
    const testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };

    // 测试列表
    const tests = [
      { name: '节日数据获取测试', method: this.testFestivalDataRetrieval },
      { name: '节气集成测试', method: this.testSolarTermsIntegration },
      { name: '农历信息精确性测试', method: this.testLunarAccuracy },
      { name: '装饰样式测试', method: this.testDecorationStyles },
      { name: '数据格式兼容性测试', method: this.testDataCompatibility },
      { name: '性能响应测试', method: this.testPerformanceResponse },
      { name: '错误处理测试', method: this.testErrorHandling },
      { name: '用户体验测试', method: this.testUserExperience }
    ];

    // 执行所有测试
    for (const test of tests) {
      try {
        console.log(`📝 执行测试: ${test.name}`);
        const result = await test.method.call(this);
        
        if (result.success) {
          testResults.passed++;
          console.log(`✅ ${test.name} - 通过: ${result.message}`);
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

  // 测试1: 节日数据获取测试
  static async testFestivalDataRetrieval() {
    try {
      const festivals = FestivalData.getUpcomingFestivals(10, true);
      
      if (!Array.isArray(festivals) || festivals.length === 0) {
        return { success: false, message: '无法获取节日数据' };
      }

      // 验证数据结构
      const festival = festivals[0];
      const requiredFields = ['id', 'name', 'type', 'daysUntil', 'date'];
      
      for (const field of requiredFields) {
        if (!(field in festival)) {
          return { success: false, message: `节日数据缺少字段: ${field}` };
        }
      }

      // 验证节气是否包含在内
      const hasSolarTerms = festivals.some(f => f.type === 'solar_term');
      
      return { 
        success: true, 
        message: `获取${festivals.length}个节日${hasSolarTerms ? '(含节气)' : ''}` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试2: 节气集成测试
  static async testSolarTermsIntegration() {
    try {
      const solarTerms = FestivalData.getUpcomingSolarTerms();
      
      if (!Array.isArray(solarTerms)) {
        return { success: false, message: '节气数据格式错误' };
      }

      if (solarTerms.length === 0) {
        return { success: false, message: '未找到节气数据' };
      }

      // 验证节气数据结构
      const term = solarTerms[0];
      const requiredFields = ['name', 'type', 'longitude', 'date'];
      
      for (const field of requiredFields) {
        if (!(field in term)) {
          return { success: false, message: `节气数据缺少字段: ${field}` };
        }
      }

      // 验证节气类型
      if (term.type !== 'solar_term') {
        return { success: false, message: '节气类型标识错误' };
      }

      return { 
        success: true, 
        message: `节气集成成功，获取${solarTerms.length}个节气` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试3: 农历信息精确性测试
  static async testLunarAccuracy() {
    try {
      const festivals = FestivalData.getUpcomingFestivals(5, false);
      const traditionalFestivals = festivals.filter(f => f.type === 'traditional');
      
      if (traditionalFestivals.length === 0) {
        return { success: false, message: '没有传统节日用于测试' };
      }

      // 验证农历信息
      for (const festival of traditionalFestivals) {
        const enrichedFestival = FestivalData.enrichFestivalData(festival);
        
        // 检查农历信息是否存在且合理
        if (enrichedFestival.lunarMonthCn === '未知' || 
            enrichedFestival.lunarDayCn === '未知') {
          return { 
            success: false, 
            message: `${festival.name}的农历信息计算失败` 
          };
        }

        // 验证农历月份格式
        const validMonths = ['正月', '二月', '三月', '四月', '五月', '六月',
                           '七月', '八月', '九月', '十月', '冬月', '腊月'];
        if (!validMonths.some(month => enrichedFestival.lunarMonthCn.includes(month.slice(0, 1)))) {
          return { 
            success: false, 
            message: `${festival.name}的农历月份格式异常: ${enrichedFestival.lunarMonthCn}` 
          };
        }
      }

      return { 
        success: true, 
        message: `农历信息精确性验证通过，测试${traditionalFestivals.length}个传统节日` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试4: 装饰样式测试
  static async testDecorationStyles() {
    try {
      const testTypes = ['traditional', 'modern', 'western', 'solar_term', 'lunar'];
      const decorationResults = {};

      for (const type of testTypes) {
        const decoration = FestivalData.getFestivalDecoration(type);
        
        if (!decoration || !decoration.borderColor || !decoration.backgroundColor || !decoration.icon) {
          return { 
            success: false, 
            message: `${type}类型装饰样式不完整` 
          };
        }

        decorationResults[type] = decoration;
      }

      // 测试显示信息
      const mockEvent = {
        name: '测试节日',
        type: 'traditional',
        level: 'major',
        daysUntil: 5,
        lunarMonthCn: '正月',
        lunarDayCn: '初一'
      };

      const displayInfo = FestivalData.getDisplayInfo(mockEvent);
      
      if (!displayInfo.displayName || !displayInfo.decoration || !displayInfo.importance) {
        return { success: false, message: '显示信息生成不完整' };
      }

      return { 
        success: true, 
        message: `装饰样式测试通过，支持${testTypes.length}种类型` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试5: 数据格式兼容性测试
  static async testDataCompatibility() {
    try {
      const festivals = FestivalData.getUpcomingFestivals(3, true);
      
      // 模拟前端页面的数据处理逻辑
      for (const festival of festivals) {
        const displayInfo = FestivalData.getDisplayInfo(festival);
        
        // 验证前端所需的字段
        const frontendFields = [
          'id', 'name', 'type', 'date', 'daysUntil',
          'displayName', 'typeDisplay', 'importance'
        ];
        
        for (const field of frontendFields) {
          if (!(field in festival) && !(field in displayInfo)) {
            return { 
              success: false, 
              message: `数据格式不兼容: 缺少${field}字段` 
            };
          }
        }

        // 验证日期格式
        if (festival.date && isNaN(new Date(festival.date).getTime())) {
          return { 
            success: false, 
            message: `日期格式错误: ${festival.date}` 
          };
        }
      }

      return { 
        success: true, 
        message: '数据格式兼容性验证通过' 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试6: 性能响应测试
  static async testPerformanceResponse() {
    try {
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        FestivalData.getUpcomingFestivals(15, true);
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      // 性能要求：平均响应时间应在500ms以内
      if (averageTime > 500) {
        return { 
          success: false, 
          message: `响应时间过长: 平均${averageTime.toFixed(2)}ms` 
        };
      }

      // 最大响应时间不应超过1秒
      if (maxTime > 1000) {
        return { 
          success: false, 
          message: `最大响应时间过长: ${maxTime}ms` 
        };
      }

      return { 
        success: true, 
        message: `性能测试通过，平均响应${averageTime.toFixed(2)}ms` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试7: 错误处理测试
  static async testErrorHandling() {
    try {
      // 测试异常输入处理
      const results = [];

      // 测试无效参数
      try {
        const result1 = FestivalData.getUpcomingFestivals(-1, true);
        if (Array.isArray(result1)) {
          results.push('负数限制处理正确');
        }
      } catch (error) {
        results.push('负数限制异常处理');
      }

      // 测试装饰样式的错误处理
      const unknownDecoration = FestivalData.getFestivalDecoration('unknown_type');
      if (unknownDecoration && unknownDecoration.borderColor) {
        results.push('未知类型装饰回退处理正确');
      }

      // 测试农历转换的错误处理
      const invalidEvent = {
        name: '测试',
        type: 'traditional',
        year: 'invalid',
        month: 'invalid',
        day: 'invalid'
      };
      
      const enrichedInvalid = FestivalData.enrichFestivalData(invalidEvent);
      if (enrichedInvalid.lunarMonthCn === '未知' || enrichedInvalid.lunarMonthCn === '未知') {
        results.push('无效数据容错处理正确');
      }

      if (results.length < 2) {
        return { success: false, message: '错误处理机制不完善' };
      }

      return { 
        success: true, 
        message: `错误处理测试通过，验证${results.length}个场景` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 测试8: 用户体验测试
  static async testUserExperience() {
    try {
      const festivals = FestivalData.getUpcomingFestivals(5, true);
      
      if (festivals.length === 0) {
        return { success: false, message: '没有节日数据' };
      }

      // 检查数据的多样性
      const types = [...new Set(festivals.map(f => f.type))];
      if (types.length < 2) {
        return { success: false, message: '节日类型多样性不足' };
      }

      // 检查排序是否正确（按时间）
      for (let i = 0; i < festivals.length - 1; i++) {
        if (festivals[i].daysUntil > festivals[i + 1].daysUntil) {
          return { success: false, message: '节日排序错误' };
        }
      }

      // 检查显示信息的完整性
      const festivalWithDisplay = festivals.map(f => FestivalData.getDisplayInfo(f));
      const hasIcons = festivalWithDisplay.every(f => f.displayName && f.displayName.includes('🌤️') || f.displayName.includes('🏮') || f.displayName.includes('🎉'));
      
      if (!hasIcons) {
        return { success: false, message: '显示图标不完整' };
      }

      // 检查时间状态标记
      const hasTimeFlags = festivalWithDisplay.some(f => f.isToday || f.isTomorrow || f.isThisWeek);
      
      return { 
        success: true, 
        message: `用户体验测试通过，包含${types.length}种类型，${hasTimeFlags ? '含' : '不含'}时间标记` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 打印测试结果
  static printTestResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 前端集成测试结果汇总');
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
    
    console.log('\n🚀 前端集成状态:');
    if (results.failed === 0) {
      console.log('✅ 前端完全集成新的节日算法，功能正常');
      console.log('✅ 节气支持已启用，农历信息精确');
      console.log('✅ 用户界面优化完成，体验提升');
    } else {
      console.log('⚠️  前端集成存在问题，需要进一步优化');
    }
    
    console.log('='.repeat(60));
  }

  // 运行快速验证测试
  static async runQuickTest() {
    console.log('🔍 运行前端快速验证测试...\n');
    
    try {
      // 快速检查核心功能
      const festivals = FestivalData.getUpcomingFestivals(3, true);
      console.log(`节日获取: ${festivals.length > 0 ? '✅' : '❌'} (${festivals.length}个)`);
      
      const solarTerms = FestivalData.getUpcomingSolarTerms();
      console.log(`节气集成: ${solarTerms.length > 0 ? '✅' : '❌'} (${solarTerms.length}个)`);
      
      if (festivals.length > 0) {
        const displayInfo = FestivalData.getDisplayInfo(festivals[0]);
        console.log(`显示增强: ${displayInfo.displayName ? '✅' : '❌'}`);
        
        const enriched = FestivalData.enrichFestivalData(festivals[0]);
        const hasLunar = enriched.lunarMonthCn && enriched.lunarMonthCn !== '未知';
        console.log(`农历信息: ${hasLunar ? '✅' : '❌'}`);
      }
      
      console.log('\n✨ 快速验证完成');
      
    } catch (error) {
      console.error('❌ 快速验证失败:', error.message);
    }
  }
}

// 导出测试类
module.exports = FrontendIntegrationTest;

// 如果直接运行此文件，执行所有测试
if (require.main === module) {
  FrontendIntegrationTest.runAllTests()
    .then(() => {
      console.log('\n🔄 运行快速验证...');
      return FrontendIntegrationTest.runQuickTest();
    })
    .then(() => {
      console.log('\n🏁 前端集成测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('前端集成测试执行异常:', error);
      process.exit(1);
    });
}
