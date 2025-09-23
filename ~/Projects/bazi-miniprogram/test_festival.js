// 节日功能测试文件
const FestivalData = require('./miniprogram/utils/festival-data.js');
const LunarCalendar = require('./miniprogram/utils/lunar-calendar.js');
const AlmanacUtils = require('./miniprogram/utils/almanac-utils.js');

console.log('🎉 开始测试节日功能...\n');

// 测试1: 获取即将到来的节日
console.log('1. 测试获取即将到来的节日:');
try {
  const upcomingFestivals = FestivalData.getUpcomingFestivals(5);
  console.log(`✅ 成功获取到 ${upcomingFestivals.length} 个即将到来的节日:`);
  upcomingFestivals.forEach((festival, index) => {
    console.log(`   ${index + 1}. ${festival.name} - ${festival.year}/${festival.month}/${festival.day} (距离${festival.daysUntil}天)`);
  });
} catch (error) {
  console.log('❌ 获取节日失败:', error.message);
}

console.log('\n');

// 测试2: 农历计算功能
console.log('2. 测试农历计算功能:');
try {
  const testDate = new Date(2025, 9, 1); // 2025年10月1日国庆节
  const ganZhi = LunarCalendar.getGanZhi(testDate);
  const xingXiu = LunarCalendar.getXingXiu(testDate);
  const shierShen = LunarCalendar.getShierShen(testDate);
  
  console.log(`✅ 日期: ${LunarCalendar.formatDate(testDate)} (${LunarCalendar.getDayOfWeekCn(testDate)})`);
  console.log(`   天干地支: ${ganZhi.ganZhi}`);
  console.log(`   星宿: ${xingXiu.full} (${xingXiu.luck})`);
  console.log(`   十二神: ${shierShen.name} (${shierShen.luck})`);
} catch (error) {
  console.log('❌ 农历计算失败:', error.message);
}

console.log('\n');

// 测试3: 黄历宜忌计算
console.log('3. 测试黄历宜忌计算:');
try {
  const testDate = new Date(2025, 9, 1);
  const mockFestival = {
    lunarMonth: 8,
    lunarDay: 9,
    type: 'modern'
  };
  
  const lunarInfo = LunarCalendar.getLunarInfo(testDate, mockFestival);
  const activities = AlmanacUtils.getFullAlmanacInfo(testDate, mockFestival, lunarInfo);
  
  console.log(`✅ 农历: ${lunarInfo.lunarMonthCn}${lunarInfo.lunarDayCn}`);
  console.log(`   宜: ${activities.suitable.join(' ')}`);
  console.log(`   忌: ${activities.unsuitable.join(' ')}`);
} catch (error) {
  console.log('❌ 宜忌计算失败:', error.message);
}

console.log('\n');

// 测试4: 节日类型装饰
console.log('4. 测试节日类型装饰:');
try {
  const traditionalDecor = FestivalData.getFestivalDecoration('traditional');
  const modernDecor = FestivalData.getFestivalDecoration('modern');
  const westernDecor = FestivalData.getFestivalDecoration('western');
  
  console.log(`✅ 传统节日装饰: 边框 ${traditionalDecor.borderColor}, 背景 ${traditionalDecor.backgroundColor}`);
  console.log(`✅ 现代节日装饰: 边框 ${modernDecor.borderColor}, 背景 ${modernDecor.backgroundColor}`);
  console.log(`✅ 西方节日装饰: 边框 ${westernDecor.borderColor}, 背景 ${westernDecor.backgroundColor}`);
} catch (error) {
  console.log('❌ 装饰计算失败:', error.message);
}

console.log('\n');

// 测试5: 检查关键节日数据
console.log('5. 检查关键节日数据完整性:');
try {
  const keyFestivals = ['春节', '国庆节', '中秋节', '清明节', '端午节'];
  const allFestivals = FestivalData.CORE_FESTIVALS;
  
  keyFestivals.forEach(festivalName => {
    const found = allFestivals.filter(f => f.name === festivalName);
    if (found.length > 0) {
      console.log(`✅ ${festivalName}: 找到 ${found.length} 条记录`);
    } else {
      console.log(`❌ ${festivalName}: 未找到记录`);
    }
  });
  
  console.log(`✅ 总计节日数据: ${allFestivals.length} 条`);
} catch (error) {
  console.log('❌ 数据检查失败:', error.message);
}

console.log('\n🎊 节日功能测试完成!\n');

// 测试输出示例数据
console.log('6. 示例: 完整的节日信息处理流程');
try {
  const festivals = FestivalData.getUpcomingFestivals(3);
  
  festivals.forEach((festival, index) => {
    console.log(`\n--- 节日 ${index + 1}: ${festival.name} ---`);
    console.log(`日期: ${festival.year}/${festival.month}/${festival.day}`);
    console.log(`倒计时: ${festival.daysUntil}天`);
    console.log(`类型: ${festival.type}`);
    
    // 模拟处理流程
    const lunarInfo = LunarCalendar.getLunarInfo(festival.date, festival);
    const activities = AlmanacUtils.getFullAlmanacInfo(festival.date, festival, lunarInfo);
    const decoration = FestivalData.getFestivalDecoration(festival.type);
    
    console.log(`农历: ${lunarInfo.lunarMonthCn}${lunarInfo.lunarDayCn}`);
    console.log(`天干地支: ${lunarInfo.ganZhi} (${lunarInfo.ganZhiLuck})`);
    console.log(`装饰色彩: ${decoration.borderColor}`);
    console.log(`宜: ${activities.suitable.slice(0, 3).join(' ')}`);
    console.log(`忌: ${activities.unsuitable.slice(0, 2).join(' ')}`);
  });
} catch (error) {
  console.log('❌ 示例处理失败:', error.message);
}
