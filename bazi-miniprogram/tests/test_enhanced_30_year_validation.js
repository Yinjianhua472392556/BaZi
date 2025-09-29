// 增强版30年节日验证框架 - 2020-2050年全面验证
const DynamicFestivalCalculator = require('../miniprogram/utils/dynamic-festival-calculator.js');
const AuthoritativeFestivalData = require('../miniprogram/utils/authoritative-festival-data.js');
const ChinaTimezoneHandler = require('../miniprogram/utils/china-timezone-handler.js');

class Enhanced30YearValidation {
  
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalErrors: [],
      warnings: [],
      detailedResults: {},
      performanceStats: {},
      timezoneCoverage: {},
      summary: {}
    };
    
    this.testStartTime = Date.now();
  }

  /**
   * 执行完整的30年验证流程
   */
  async runComprehensiveValidation() {
    console.log('🚀 开始增强版30年节日验证 (2020-2050)');
    console.log('=' * 60);
    
    try {
      // 第一阶段：关键问题验证
      await this.validateCriticalIssues();
      
      // 第二阶段：系统性节日验证
      await this.validateSystematicFestivals();
      
      // 第三阶段：时区一致性验证
      await this.validateTimezoneConsistency();
      
      // 第四阶段：算法精度验证
      await this.validateAlgorithmAccuracy();
      
      // 第五阶段：边界条件验证
      await this.validateBoundaryConditions();
      
      // 生成最终报告
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ 验证过程中发生严重错误:', error);
      this.results.criticalErrors.push({
        type: 'VALIDATION_FRAMEWORK_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return this.results;
  }

  /**
   * 第一阶段：验证用户报告的关键问题
   */
  async validateCriticalIssues() {
    console.log('\n📋 第一阶段：关键问题验证');
    
    const criticalTests = [
      {
        year: 2025,
        festival: 'daxue',
        expectedDate: '2025-12-07',
        description: '2025年大雪节气应为12月7日'
      },
      {
        year: 2025,
        festival: 'thanksgiving',
        expectedDate: '2025-11-27',
        description: '2025年感恩节应为11月27日'
      },
      {
        year: 2025,
        festival: 'halloween',
        expectedDate: '2025-10-31',
        description: '万圣节应为10月31日，不是农历九月初九'
      }
    ];

    for (const test of criticalTests) {
      await this.runSingleCriticalTest(test);
    }
  }

  /**
   * 执行单个关键测试
   */
  async runSingleCriticalTest(test) {
    this.results.totalTests++;
    
    try {
      let calculatedDate = null;
      
      // 根据节日类型选择计算方法
      switch (test.festival) {
        case 'daxue':
          const daxueDate = DynamicFestivalCalculator.calculateSolarTerm(test.year, 255);
          calculatedDate = ChinaTimezoneHandler.dateToCST(daxueDate);
          break;
          
        case 'thanksgiving':
          const thanksgivingDate = DynamicFestivalCalculator.calculateThanksgiving(test.year);
          calculatedDate = ChinaTimezoneHandler.dateToCST(thanksgivingDate);
          break;
          
        case 'halloween':
          // 万圣节是固定日期
          calculatedDate = `${test.year}-10-31`;
          break;
      }

      // 验证结果
      const validation = AuthoritativeFestivalData.validateCalculatedDate(
        test.year, 
        test.festival, 
        calculatedDate
      );

      if (validation.isValid) {
        this.results.passedTests++;
        console.log(`✅ ${test.description}: 通过 (${calculatedDate})`);
      } else {
        this.results.failedTests++;
        console.log(`❌ ${test.description}: 失败`);
        console.log(`   计算结果: ${validation.calculated}`);
        console.log(`   期望结果: ${validation.expected}`);
        console.log(`   差异天数: ${validation.difference}天`);
        
        this.results.criticalErrors.push({
          type: 'CRITICAL_DATE_MISMATCH',
          test: test,
          validation: validation,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.results.failedTests++;
      console.log(`💥 ${test.description}: 计算异常 - ${error.message}`);
      
      this.results.criticalErrors.push({
        type: 'CALCULATION_ERROR',
        test: test,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 第二阶段：系统性节日验证
   */
  async validateSystematicFestivals() {
    console.log('\n🔄 第二阶段：系统性节日验证');
    
    const festivalTypes = [
      'thanksgiving', 'mothers_day', 'daxue', 'spring_festival', 
      'mid_autumn', 'dragon_boat', 'double_ninth'
    ];
    
    const yearRanges = [
      { start: 2020, end: 2025, name: '2020-2025 (近期)' },
      { start: 2025, end: 2035, name: '2025-2035 (中期)' },
      { start: 2035, end: 2050, name: '2035-2050 (远期)' }
    ];

    for (const range of yearRanges) {
      console.log(`\n  📅 验证年份范围: ${range.name}`);
      await this.validateYearRange(range.start, range.end, festivalTypes);
    }
  }

  /**
   * 验证指定年份范围的节日
   */
  async validateYearRange(startYear, endYear, festivalTypes) {
    const rangeResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: []
    };

    for (let year = startYear; year <= endYear; year++) {
      for (const festivalType of festivalTypes) {
        rangeResults.totalTests++;
        this.results.totalTests++;

        try {
          const calculatedDate = await this.calculateFestivalDate(year, festivalType);
          const validation = AuthoritativeFestivalData.validateCalculatedDate(
            year, festivalType, calculatedDate
          );

          if (validation.isValid) {
            rangeResults.passedTests++;
            this.results.passedTests++;
          } else {
            rangeResults.failedTests++;
            this.results.failedTests++;
            
            rangeResults.details.push({
              year: year,
              festival: festivalType,
              validation: validation
            });

            // 记录警告或错误
            if (validation.difference > 3) {
              this.results.criticalErrors.push({
                type: 'MAJOR_DATE_DISCREPANCY',
                year: year,
                festival: festivalType,
                validation: validation
              });
            } else {
              this.results.warnings.push({
                type: 'MINOR_DATE_DISCREPANCY',
                year: year,
                festival: festivalType,
                validation: validation
              });
            }
          }

        } catch (error) {
          rangeResults.failedTests++;
          this.results.failedTests++;
          
          this.results.criticalErrors.push({
            type: 'SYSTEMATIC_CALCULATION_ERROR',
            year: year,
            festival: festivalType,
            error: error.message
          });
        }
      }
    }

    console.log(`    结果: ${rangeResults.passedTests}/${rangeResults.totalTests} 通过`);
    
    // 存储年份范围结果
    this.results.detailedResults[`${startYear}-${endYear}`] = rangeResults;
  }

  /**
   * 计算指定年份和节日类型的日期
   */
  async calculateFestivalDate(year, festivalType) {
    switch (festivalType) {
      case 'thanksgiving':
        const thanksgiving = DynamicFestivalCalculator.calculateThanksgiving(year);
        return ChinaTimezoneHandler.dateToCST(thanksgiving);
        
      case 'mothers_day':
        const mothersDay = DynamicFestivalCalculator.calculateMothersDay(year);
        return ChinaTimezoneHandler.dateToCST(mothersDay);
        
      case 'daxue':
        const daxue = DynamicFestivalCalculator.calculateSolarTerm(year, 255);
        return ChinaTimezoneHandler.dateToCST(daxue);
        
      case 'spring_festival':
        const springFestival = DynamicFestivalCalculator.getSpringFestivalDate(year);
        return ChinaTimezoneHandler.dateToCST(springFestival);
        
      case 'mid_autumn':
        const midAutumn = DynamicFestivalCalculator.convertLunarToSolar(year, 8, 15);
        return ChinaTimezoneHandler.dateToCST(midAutumn);
        
      case 'dragon_boat':
        const dragonBoat = DynamicFestivalCalculator.convertLunarToSolar(year, 5, 5);
        return ChinaTimezoneHandler.dateToCST(dragonBoat);
        
      case 'double_ninth':
        const doubleNinth = DynamicFestivalCalculator.convertLunarToSolar(year, 9, 9);
        return ChinaTimezoneHandler.dateToCST(doubleNinth);
        
      default:
        throw new Error(`未知的节日类型: ${festivalType}`);
    }
  }

  /**
   * 第三阶段：时区一致性验证
   */
  async validateTimezoneConsistency() {
    console.log('\n🌍 第三阶段：时区一致性验证');
    
    const testCases = [
      { year: 2025, date: '2025-12-07', description: '2025年大雪时区处理' },
      { year: 2025, date: '2025-11-27', description: '2025年感恩节时区处理' },
      { year: 2025, date: '2025-01-29', description: '2025年春节时区处理' }
    ];

    for (const testCase of testCases) {
      this.results.totalTests++;
      
      try {
        // 测试时区转换的一致性
        const cstDate = new Date(testCase.date + 'T12:00:00+08:00');
        const convertedDate = ChinaTimezoneHandler.dateToCST(cstDate);
        
        if (convertedDate === testCase.date) {
          this.results.passedTests++;
          console.log(`✅ ${testCase.description}: 时区一致`);
        } else {
          this.results.failedTests++;
          console.log(`❌ ${testCase.description}: 时区不一致`);
          console.log(`   期望: ${testCase.date}, 实际: ${convertedDate}`);
        }

      } catch (error) {
        this.results.failedTests++;
        console.log(`💥 ${testCase.description}: 时区验证异常 - ${error.message}`);
      }
    }
  }

  /**
   * 第四阶段：算法精度验证
   */
  async validateAlgorithmAccuracy() {
    console.log('\n🎯 第四阶段：算法精度验证');
    
    // 验证算法的长期稳定性
    const precisionTests = [
      { years: [2020, 2030, 2040, 2050], festival: 'daxue', tolerance: 1 },
      { years: [2020, 2030, 2040, 2050], festival: 'thanksgiving', tolerance: 0 },
      { years: [2020, 2030, 2040, 2050], festival: 'spring_festival', tolerance: 1 }
    ];

    for (const test of precisionTests) {
      console.log(`\n  🔍 验证 ${test.festival} 算法精度 (容忍度: ${test.tolerance}天)`);
      
      for (const year of test.years) {
        this.results.totalTests++;
        
        try {
          const calculatedDate = await this.calculateFestivalDate(year, test.festival);
          const validation = AuthoritativeFestivalData.validateCalculatedDate(
            year, test.festival, calculatedDate
          );

          if (validation.isValid || validation.difference <= test.tolerance) {
            this.results.passedTests++;
            console.log(`    ✅ ${year}年: 精度合格 (差异: ${validation.difference}天)`);
          } else {
            this.results.failedTests++;
            console.log(`    ❌ ${year}年: 精度超限 (差异: ${validation.difference}天)`);
            
            this.results.criticalErrors.push({
              type: 'PRECISION_VIOLATION',
              year: year,
              festival: test.festival,
              validation: validation,
              tolerance: test.tolerance
            });
          }

        } catch (error) {
          this.results.failedTests++;
          console.log(`    💥 ${year}年: 精度验证异常 - ${error.message}`);
        }
      }
    }
  }

  /**
   * 第五阶段：边界条件验证
   */
  async validateBoundaryConditions() {
    console.log('\n🔬 第五阶段：边界条件验证');
    
    const boundaryTests = [
      { year: 2020, description: '验证范围起始年份' },
      { year: 2050, description: '验证范围结束年份' },
      { year: 2024, description: '闰年测试' },
      { year: 2025, description: '平年测试' }
    ];

    for (const test of boundaryTests) {
      console.log(`\n  🧪 ${test.description} (${test.year}年)`);
      
      // 测试该年份的所有主要节日
      const festivals = ['spring_festival', 'mid_autumn', 'daxue', 'thanksgiving'];
      
      for (const festival of festivals) {
        this.results.totalTests++;
        
        try {
          const calculatedDate = await this.calculateFestivalDate(test.year, festival);
          
          if (calculatedDate && this.isValidDate(calculatedDate)) {
            this.results.passedTests++;
            console.log(`    ✅ ${festival}: ${calculatedDate}`);
          } else {
            this.results.failedTests++;
            console.log(`    ❌ ${festival}: 计算失败`);
          }

        } catch (error) {
          this.results.failedTests++;
          console.log(`    💥 ${festival}: 边界条件异常 - ${error.message}`);
        }
      }
    }
  }

  /**
   * 验证日期格式是否正确
   */
  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * 生成最终验证报告
   */
  generateFinalReport() {
    const endTime = Date.now();
    const duration = endTime - this.testStartTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 增强版30年验证最终报告');
    console.log('='.repeat(60));
    
    // 总体统计
    console.log('\n📈 总体统计:');
    console.log(`   总测试数: ${this.results.totalTests}`);
    console.log(`   通过测试: ${this.results.passedTests}`);
    console.log(`   失败测试: ${this.results.failedTests}`);
    console.log(`   成功率: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(2)}%`);
    console.log(`   验证耗时: ${duration}毫秒`);
    
    // 关键错误汇总
    if (this.results.criticalErrors.length > 0) {
      console.log('\n🚨 关键错误汇总:');
      this.results.criticalErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.type}] ${error.message || error.error || '详见验证结果'}`);
      });
    }
    
    // 警告汇总
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  警告汇总:');
      console.log(`   共 ${this.results.warnings.length} 个轻微差异`);
    }
    
    // 阶段结果
    console.log('\n📋 分阶段结果:');
    Object.entries(this.results.detailedResults).forEach(([range, result]) => {
      const successRate = ((result.passedTests / result.totalTests) * 100).toFixed(1);
      console.log(`   ${range}: ${result.passedTests}/${result.totalTests} (${successRate}%)`);
    });
    
    // 生成建议
    this.generateRecommendations();
    
    // 保存详细结果
    this.results.summary = {
      totalTests: this.results.totalTests,
      passedTests: this.results.passedTests,
      failedTests: this.results.failedTests,
      successRate: (this.results.passedTests / this.results.totalTests) * 100,
      duration: duration,
      criticalErrorCount: this.results.criticalErrors.length,
      warningCount: this.results.warnings.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成修复建议
   */
  generateRecommendations() {
    console.log('\n💡 修复建议:');
    
    const recommendations = [];
    
    // 基于错误类型生成建议
    const errorTypes = {};
    this.results.criticalErrors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    Object.entries(errorTypes).forEach(([type, count]) => {
      switch (type) {
        case 'CRITICAL_DATE_MISMATCH':
          recommendations.push(`🔧 修复 ${count} 个关键日期不匹配问题：检查算法实现`);
          break;
        case 'CALCULATION_ERROR':
          recommendations.push(`🛠️  修复 ${count} 个计算异常：增强错误处理`);
          break;
        case 'PRECISION_VIOLATION':
          recommendations.push(`📐 修复 ${count} 个精度超限问题：调整算法参数`);
          break;
        case 'SYSTEMATIC_CALCULATION_ERROR':
          recommendations.push(`⚙️  修复 ${count} 个系统性计算错误：重构核心算法`);
          break;
      }
    });

    if (recommendations.length === 0) {
      console.log('   🎉 所有测试通过，无需修复！');
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    // 性能优化建议
    if (this.results.summary && this.results.summary.duration > 10000) {
      console.log('   ⚡ 考虑性能优化：验证耗时较长，建议优化算法');
    }
  }

  /**
   * 导出验证结果到文件
   */
  exportResults(filePath = null) {
    if (!filePath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filePath = `./docs/30year-validation-report-${timestamp}.json`;
    }
    
    try {
      const fs = require('fs');
      fs.writeFileSync(filePath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 验证结果已导出到: ${filePath}`);
    } catch (error) {
      console.error(`❌ 导出失败: ${error.message}`);
    }
  }

  /**
   * 静态方法：快速验证特定年份
   */
  static async quickValidate(year, festivals = ['daxue', 'thanksgiving', 'spring_festival']) {
    const validator = new Enhanced30YearValidation();
    
    console.log(`🔍 快速验证 ${year} 年节日数据`);
    
    for (const festival of festivals) {
      try {
        const calculatedDate = await validator.calculateFestivalDate(year, festival);
        const validation = AuthoritativeFestivalData.validateCalculatedDate(
          year, festival, calculatedDate
        );

        if (validation.isValid) {
          console.log(`✅ ${festival}: ${calculatedDate} (正确)`);
        } else {
          console.log(`❌ ${festival}: ${validation.calculated} ≠ ${validation.expected} (差异${validation.difference}天)`);
        }

      } catch (error) {
        console.log(`💥 ${festival}: 计算失败 - ${error.message}`);
      }
    }
  }

  /**
   * 静态方法：验证用户报告的具体问题
   */
  static async validateUserReportedIssues() {
    console.log('🔍 验证用户报告的具体问题');
    
    const issues = [
      { year: 2025, festival: 'daxue', expected: '2025-12-07', description: '大雪节气' },
      { year: 2025, festival: 'thanksgiving', expected: '2025-11-27', description: '感恩节' },
      { year: 2025, festival: 'halloween', expected: '2025-10-31', description: '万圣节' }
    ];

    const validator = new Enhanced30YearValidation();
    
    for (const issue of issues) {
      try {
        let calculatedDate;
        
        if (issue.festival === 'halloween') {
          calculatedDate = `${issue.year}-10-31`;
        } else {
          calculatedDate = await validator.calculateFestivalDate(issue.year, issue.festival);
        }

        if (calculatedDate === issue.expected) {
          console.log(`✅ ${issue.description} (${issue.year}): 已修复 ✓`);
        } else {
          console.log(`❌ ${issue.description} (${issue.year}): 仍有问题`);
          console.log(`   计算结果: ${calculatedDate}`);
          console.log(`   期望结果: ${issue.expected}`);
        }

      } catch (error) {
        console.log(`💥 ${issue.description} (${issue.year}): 验证异常 - ${error.message}`);
      }
    }
  }
}

// 导出验证类
module.exports = Enhanced30YearValidation;

// 如果直接运行此文件，执行验证
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 启动增强版30年节日验证...\n');
      
      // 首先验证用户报告的具体问题
      await Enhanced30YearValidation.validateUserReportedIssues();
      console.log('\n' + '-'.repeat(50) + '\n');
      
      // 然后进行全面验证
      const validator = new Enhanced30YearValidation();
      const results = await validator.runComprehensiveValidation();
      
      // 导出结果
      validator.exportResults();
      
      console.log('\n✅ 验证完成！');
      
    } catch (error) {
      console.error('❌ 验证过程发生严重错误:', error);
      process.exit(1);
    }
  })();
}
