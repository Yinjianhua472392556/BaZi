// 太阳黄经计算调试测试
const AstronomicalCalculator = require('../miniprogram/utils/astronomical-calculator.js');
const LunarConversionEngine = require('../miniprogram/utils/lunar-conversion-engine.js');

console.log('🔍 太阳黄经计算调试测试');
console.log('='.repeat(50));

// 测试2026年立春（应该在2月4日左右）
console.log('\n📅 测试2026年立春计算：');

try {
  // 计算立春时刻（太阳黄经315度）
  const lichunJD = AstronomicalCalculator.findSolarLongitudeTime(2026, 315);
  const lichunDate = AstronomicalCalculator.julianDayToGregorian(lichunJD);
  
  console.log(`计算结果: ${lichunDate.toDateString()} ${lichunDate.toTimeString()}`);
  console.log(`儒略日: ${lichunJD.toFixed(6)}`);
  
  // 验证该时刻的太阳黄经
  const longitude = AstronomicalCalculator.solarLongitude(lichunJD);
  const longitudeDeg = longitude * 180 / Math.PI;
  console.log(`验证黄经: ${longitudeDeg.toFixed(4)}度`);
  
  // 期望结果应该是2026年2月4日左右
  const expectedDate = new Date(2026, 1, 4); // 2月4日
  const daysDiff = Math.abs((lichunDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`与期望日期差异: ${daysDiff.toFixed(1)}天`);
  
  if (daysDiff > 10) {
    console.log('❌ 错误：计算结果与预期相差太大！');
  } else {
    console.log('✅ 计算结果在合理范围内');
  }
  
} catch (error) {
  console.log('❌ 计算失败:', error.message);
}

// 测试多个关键时刻的太阳黄经
console.log('\n🌞 测试关键时刻的太阳黄经：');

const testDates = [
  { date: new Date(2026, 0, 1), name: '2026年1月1日', expected: 280 },
  { date: new Date(2026, 1, 4), name: '2026年2月4日(立春)', expected: 315 },
  { date: new Date(2026, 2, 20), name: '2026年3月20日(春分)', expected: 0 },
  { date: new Date(2026, 5, 21), name: '2026年6月21日(夏至)', expected: 90 },
  { date: new Date(2026, 8, 23), name: '2026年9月23日(秋分)', expected: 180 },
  { date: new Date(2026, 11, 22), name: '2026年12月22日(冬至)', expected: 270 }
];

testDates.forEach(test => {
  try {
    const jd = AstronomicalCalculator.gregorianToJulianDay(
      test.date.getFullYear(),
      test.date.getMonth() + 1,
      test.date.getDate()
    );
    
    const longitude = AstronomicalCalculator.solarLongitude(jd);
    const longitudeDeg = longitude * 180 / Math.PI;
    
    // 处理角度跨越问题
    let normalizedLongitude = longitudeDeg;
    if (test.expected === 0 && longitudeDeg > 300) {
      normalizedLongitude = longitudeDeg - 360;
    }
    
    const diff = Math.abs(normalizedLongitude - test.expected);
    
    console.log(`${test.name}: ${longitudeDeg.toFixed(2)}度 (期望${test.expected}度, 差异${diff.toFixed(2)}度)`);
    
    if (diff > 30) {
      console.log(`  ❌ 错误：差异过大！`);
    } else if (diff > 10) {
      console.log(`  ⚠️ 警告：差异较大`);
    } else {
      console.log(`  ✅ 正常范围`);
    }
    
  } catch (error) {
    console.log(`${test.name}: ❌ 计算失败 - ${error.message}`);
  }
});

// 测试完整的24节气计算
console.log('\n🗓️ 测试2026年24节气计算：');

try {
  const solarTerms = LunarConversionEngine.calculateSolarTerms(2026);
  
  solarTerms.forEach(term => {
    const month = term.date.getMonth() + 1;
    const day = term.date.getDate();
    console.log(`${term.name}: ${month}月${day}日 (黄经${term.longitude}度)`);
  });
  
  // 检查立春和雨水
  const lichun = solarTerms.find(t => t.name === '立春');
  const yushui = solarTerms.find(t => t.name === '雨水');
  
  if (lichun) {
    const lichunMonth = lichun.date.getMonth() + 1;
    const lichunDay = lichun.date.getDate();
    if (lichunMonth === 5 && lichunDay === 12) {
      console.log('❌ 确认错误：立春计算为5月12日！');
    } else if (lichunMonth === 2 && lichunDay >= 3 && lichunDay <= 6) {
      console.log('✅ 立春日期正确');
    } else {
      console.log(`⚠️ 立春日期异常：${lichunMonth}月${lichunDay}日`);
    }
  }
  
} catch (error) {
  console.log('❌ 24节气计算失败:', error.message);
}

console.log('\n📋 调试结论：');
console.log('如果立春显示为5月12日，说明太阳黄经计算算法存在严重错误');
console.log('需要修复VSOP87算法实现');
