/**
 * 起名功能测试
 * 测试起名算法的正确性和API接口的可用性
 */

const TEST_CONFIG = {
  apiBaseUrl: 'http://localhost:8000',
  testCases: [
    {
      name: '男孩起名测试',
      data: {
        surname: '王',
        gender: 'male',
        year: 1990,
        month: 8,
        day: 15,
        hour: 10,
        calendar_type: 'solar',
        name_length: 2,
        count: 5
      }
    },
    {
      name: '女孩起名测试',
      data: {
        surname: '李',
        gender: 'female',
        year: 1995,
        month: 3,
        day: 20,
        hour: 14,
        calendar_type: 'solar',
        name_length: 2,
        count: 5
      }
    },
    {
      name: '单名测试',
      data: {
        surname: '张',
        gender: 'male',
        year: 2000,
        month: 10,
        day: 1,
        hour: 12,
        calendar_type: 'solar',
        name_length: 1,
        count: 3
      }
    },
    {
      name: '农历日期测试',
      data: {
        surname: '刘',
        gender: 'female',
        year: 1988,
        month: 12,
        day: 8,
        hour: 16,
        calendar_type: 'lunar',
        name_length: 2,
        count: 5
      }
    }
  ]
};

/**
 * 测试起名生成接口
 */
async function testNamingGeneration() {
  console.log('🚀 开始测试起名生成接口...\n');
  
  let passedTests = 0;
  let totalTests = TEST_CONFIG.testCases.length;
  
  for (let i = 0; i < TEST_CONFIG.testCases.length; i++) {
    const testCase = TEST_CONFIG.testCases[i];
    console.log(`📝 测试案例 ${i + 1}: ${testCase.name}`);
    
    try {
      const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/api/v1/naming/generate-names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${testCase.name} - 成功`);
        console.log(`   生成名字数量: ${result.data.recommendations.length}`);
        console.log(`   八字分析: ${result.data.analysis_summary.substring(0, 50)}...`);
        console.log(`   推荐名字: ${result.data.recommendations.slice(0, 3).map(n => n.full_name).join(', ')}`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name} - 失败: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.name} - 异常: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
  return passedTests === totalTests;
}

/**
 * 测试名字评估接口
 */
async function testNameEvaluation() {
  console.log('🔍 开始测试名字评估接口...\n');
  
  const evaluationTests = [
    {
      name: '评估测试1',
      data: {
        surname: '王',
        given_name: '明轩',
        gender: 'male',
        year: 1990,
        month: 8,
        day: 15,
        hour: 10,
        calendar_type: 'solar'
      }
    },
    {
      name: '评估测试2',
      data: {
        surname: '李',
        given_name: '雅涵',
        gender: 'female',
        year: 1995,
        month: 3,
        day: 20,
        hour: 14,
        calendar_type: 'solar'
      }
    }
  ];
  
  let passedTests = 0;
  
  for (const testCase of evaluationTests) {
    console.log(`📝 ${testCase.name}`);
    
    try {
      const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/api/v1/naming/evaluate-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${testCase.name} - 成功`);
        console.log(`   完整姓名: ${result.data.evaluation.full_name}`);
        console.log(`   综合评分: ${result.data.evaluation.overall_score}分`);
        console.log(`   吉凶等级: ${result.data.evaluation.luck_level}`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name} - 失败: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.name} - 异常: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`📊 评估测试结果: ${passedTests}/${evaluationTests.length} 通过`);
  return passedTests === evaluationTests.length;
}

/**
 * 测试五行汉字接口
 */
async function testWuxingChars() {
  console.log('🌟 开始测试五行汉字接口...\n');
  
  const wuxingTests = ['金', '木', '水', '火', '土'];
  let passedTests = 0;
  
  for (const wuxing of wuxingTests) {
    console.log(`📝 测试${wuxing}属性汉字`);
    
    try {
      const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/api/v1/naming/wuxing-chars?wuxing=${wuxing}&gender=neutral`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data.chars.length > 0) {
        console.log(`✅ ${wuxing}属性汉字 - 成功`);
        console.log(`   汉字数量: ${result.data.count}`);
        console.log(`   示例汉字: ${result.data.chars.slice(0, 5).map(c => c.char).join(', ')}`);
        passedTests++;
      } else {
        console.log(`❌ ${wuxing}属性汉字 - 失败: 未获取到汉字`);
      }
      
    } catch (error) {
      console.log(`❌ ${wuxing}属性汉字 - 异常: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`📊 五行汉字测试结果: ${passedTests}/${wuxingTests.length} 通过`);
  return passedTests === wuxingTests.length;
}

/**
 * 测试汉字信息接口
 */
async function testCharInfo() {
  console.log('📚 开始测试汉字信息接口...\n');
  
  const testChars = ['明', '华', '文', '雅', '轩'];
  let passedTests = 0;
  
  for (const char of testChars) {
    console.log(`📝 测试'${char}'字信息`);
    
    try {
      const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/api/v1/naming/char-info/${char}`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ '${char}'字信息 - 成功`);
        console.log(`   五行属性: ${result.data.info.wuxing}`);
        console.log(`   笔画数: ${result.data.info.stroke}`);
        console.log(`   字意: ${result.data.info.meaning}`);
        passedTests++;
      } else {
        console.log(`❌ '${char}'字信息 - 失败`);
      }
      
    } catch (error) {
      console.log(`❌ '${char}'字信息 - 异常: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`📊 汉字信息测试结果: ${passedTests}/${testChars.length} 通过`);
  return passedTests === testChars.length;
}

/**
 * 测试API健康状态
 */
async function testApiHealth() {
  console.log('🏥 检查API服务状态...\n');
  
  try {
    const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'healthy') {
      console.log('✅ API服务状态正常');
      console.log(`   版本: ${result.version}`);
      console.log(`   环境: ${result.environment}`);
      return true;
    } else {
      console.log('❌ API服务状态异常');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 无法连接到API服务: ${error.message}`);
    console.log('💡 请确保后端服务已启动 (python -m uvicorn main:app --reload)');
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🧪 起名功能完整性测试\n');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  // 检查API健康状态
  const apiHealthy = await testApiHealth();
  console.log('');
  
  if (!apiHealthy) {
    console.log('❌ API服务不可用，无法继续测试');
    return;
  }
  
  // 运行各项测试
  const results = [];
  
  results.push(await testNamingGeneration());
  results.push(await testNameEvaluation());
  results.push(await testWuxingChars());
  results.push(await testCharInfo());
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // 统计结果
  const passedCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log('=' .repeat(50));
  console.log('📋 测试总结:');
  console.log(`   总测试项: ${totalCount}`);
  console.log(`   通过数量: ${passedCount}`);
  console.log(`   失败数量: ${totalCount - passedCount}`);
  console.log(`   成功率: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
  console.log(`   耗时: ${duration.toFixed(2)}秒`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 所有测试通过！起名功能运行正常！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关功能');
  }
}

/**
 * 测试入口
 */
if (typeof module !== 'undefined' && module.exports) {
  // Node.js环境
  module.exports = {
    runAllTests,
    testNamingGeneration,
    testNameEvaluation,
    testWuxingChars,
    testCharInfo,
    testApiHealth
  };
} else {
  // 浏览器环境
  window.NamingTests = {
    runAllTests,
    testNamingGeneration,
    testNameEvaluation,
    testWuxingChars,
    testCharInfo,
    testApiHealth
  };
}

// 如果是直接运行此文件
if (typeof require !== 'undefined' && require.main === module) {
  // 导入fetch支持 (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.log('❌ 需要Node.js 18+版本或安装node-fetch');
    process.exit(1);
  }
  
  runAllTests().catch(console.error);
}
