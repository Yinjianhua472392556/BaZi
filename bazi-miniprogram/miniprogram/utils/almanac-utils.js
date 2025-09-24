// 黄历宜忌计算工具
class AlmanacUtils {
  // 宜事活动列表
  static SUITABLE_ACTIVITIES = [
    '祭祀', '祈福', '出行', '嫁娶', '安葬', '修造', '动土', '开市', '立券', '交易',
    '纳财', '栽种', '牧养', '破土', '启攒', '安香', '挂匾', '求嗣', '入学', '理发',
    '伐木', '架马', '安床', '拆卸', '修墙', '补垣', '栽种', '治病', '会亲友', '移徙',
    '入宅', '安门', '作灶', '放水', '出货财', '开渠', '穿井', '筑堤', '开生坟',
    '合帐', '冠笄', '订盟', '纳采', '问名', '纳吉', '纳征', '请期', '亲迎', '安机械',
    '纺织', '酝酿', '造船', '割蜜', '捕捉', '畋猎', '教牛马', '整手足甲', '求医疗病'
  ];

  // 忌事活动列表  
  static UNSUITABLE_ACTIVITIES = [
    '诸事不宜', '破土', '安门', '作灶', '治病', '安葬', '移徙', '入宅', '嫁娶', '开市',
    '立券', '交易', '纳财', '出行', '祭祀', '祈福', '动土', '修造', '栽种', '牧养',
    '伐木', '架马', '安床', '拆卸', '修墙', '补垣', '会亲友', '冠笄', '纳采', '问名',
    '订盟', '纳吉', '纳征', '请期', '亲迎', '求嗣', '入学', '理发', '造船', '开渠',
    '穿井', '筑堤', '放水', '出货财', '安香', '挂匾', '安机械', '纺织', '酝酿',
    '割蜜', '捕捉', '畋猎', '教牛马', '整手足甲', '求医疗病', '启攒', '开生坟'
  ];

  // 根据天干地支计算宜忌的权重表
  static GANZI_WEIGHTS = {
    // 天干权重
    gan: {
      '甲': { suitable: [1, 3, 5, 7, 9], unsuitable: [0, 2, 4, 6, 8] },
      '乙': { suitable: [2, 4, 6, 8, 10], unsuitable: [1, 3, 5, 7, 9] },
      '丙': { suitable: [0, 3, 6, 9, 12], unsuitable: [1, 4, 7, 10, 13] },
      '丁': { suitable: [1, 4, 7, 10, 13], unsuitable: [0, 3, 6, 9, 12] },
      '戊': { suitable: [2, 5, 8, 11, 14], unsuitable: [1, 4, 7, 10, 13] },
      '己': { suitable: [0, 5, 10, 15, 20], unsuitable: [2, 7, 12, 17, 22] },
      '庚': { suitable: [1, 6, 11, 16, 21], unsuitable: [3, 8, 13, 18, 23] },
      '辛': { suitable: [2, 7, 12, 17, 22], unsuitable: [0, 5, 10, 15, 20] },
      '壬': { suitable: [3, 8, 13, 18, 23], unsuitable: [1, 6, 11, 16, 21] },
      '癸': { suitable: [4, 9, 14, 19, 24], unsuitable: [2, 7, 12, 17, 22] }
    },
    // 地支权重
    zhi: {
      '子': { suitable: [0, 12, 24, 36, 48], unsuitable: [6, 18, 30, 42] },
      '丑': { suitable: [1, 13, 25, 37, 49], unsuitable: [7, 19, 31, 43] },
      '寅': { suitable: [2, 14, 26, 38, 50], unsuitable: [8, 20, 32, 44] },
      '卯': { suitable: [3, 15, 27, 39, 51], unsuitable: [9, 21, 33, 45] },
      '辰': { suitable: [4, 16, 28, 40, 52], unsuitable: [10, 22, 34, 46] },
      '巳': { suitable: [5, 17, 29, 41, 53], unsuitable: [11, 23, 35, 47] },
      '午': { suitable: [6, 18, 30, 42], unsuitable: [0, 12, 24, 36, 48] },
      '未': { suitable: [7, 19, 31, 43], unsuitable: [1, 13, 25, 37, 49] },
      '申': { suitable: [8, 20, 32, 44], unsuitable: [2, 14, 26, 38, 50] },
      '酉': { suitable: [9, 21, 33, 45], unsuitable: [3, 15, 27, 39, 51] },
      '戌': { suitable: [10, 22, 34, 46], unsuitable: [4, 16, 28, 40, 52] },
      '亥': { suitable: [11, 23, 35, 47], unsuitable: [5, 17, 29, 41, 53] }
    }
  };

  // 根据日期计算宜忌活动
  static getDailyActivities(date, lunarInfo) {
    const ganZhi = lunarInfo.ganZhi;
    const gan = ganZhi[0];
    const zhi = ganZhi[1];
    
    // 获取天干地支对应的活动索引
    const ganWeights = this.GANZI_WEIGHTS.gan[gan] || this.GANZI_WEIGHTS.gan['甲'];
    const zhiWeights = this.GANZI_WEIGHTS.zhi[zhi] || this.GANZI_WEIGHTS.zhi['子'];
    
    // 计算宜事
    const suitableIndices = this.combineWeights(ganWeights.suitable, zhiWeights.suitable);
    const suitable = this.getActivitiesByIndices(suitableIndices, this.SUITABLE_ACTIVITIES, 6);
    
    // 计算忌事
    const unsuitableIndices = this.combineWeights(ganWeights.unsuitable, zhiWeights.unsuitable);
    const unsuitable = this.getActivitiesByIndices(unsuitableIndices, this.UNSUITABLE_ACTIVITIES, 2);
    
    return {
      suitable,
      unsuitable
    };
  }

  // 合并权重
  static combineWeights(ganWeights, zhiWeights) {
    const combined = [...ganWeights, ...zhiWeights];
    return [...new Set(combined)].sort((a, b) => a - b);
  }

  // 根据索引获取活动
  static getActivitiesByIndices(indices, activities, limit) {
    const selectedActivities = [];
    
    for (let i = 0; i < Math.min(indices.length, limit); i++) {
      const index = indices[i] % activities.length;
      const activity = activities[index];
      if (!selectedActivities.includes(activity)) {
        selectedActivities.push(activity);
      }
    }
    
    // 如果活动数量不够，随机补充
    while (selectedActivities.length < limit && selectedActivities.length < activities.length) {
      const randomIndex = Math.floor(Math.random() * activities.length);
      const activity = activities[randomIndex];
      if (!selectedActivities.includes(activity)) {
        selectedActivities.push(activity);
      }
    }
    
    return selectedActivities.slice(0, limit);
  }

  // 特殊日期的宜忌调整
  static getSpecialDateActivities(date, festivalType) {
    const specialActivities = {
      traditional: {
        suitable: ['祭祀', '祈福', '会亲友', '纳采', '嫁娶', '安香'],
        unsuitable: ['动土', '破土']
      },
      modern: {
        suitable: ['开市', '立券', '交易', '纳财', '出行', '会亲友'],
        unsuitable: ['安葬', '破土']
      },
      western: {
        suitable: ['会亲友', '出行', '纳财', '开市', '嫁娶', '祈福'],
        unsuitable: ['动土', '安葬']
      }
    };

    return specialActivities[festivalType] || null;
  }

  // 获取完整的日期宜忌信息
  static getFullAlmanacInfo(date, festival, lunarInfo) {
    // 先获取基础的宜忌
    let activities = this.getDailyActivities(date, lunarInfo);
    
    // 如果是特殊节日，调整宜忌
    if (festival) {
      const specialActivities = this.getSpecialDateActivities(date, festival.type);
      if (specialActivities) {
        activities = {
          suitable: specialActivities.suitable,
          unsuitable: specialActivities.unsuitable
        };
      }
    }
    
    return activities;
  }

  // 获取宜忌的颜色标记
  static getActivityColors() {
    return {
      suitable: {
        background: '#E8F5E8',
        text: '#2E7D2E',
        border: '#4CAF50'
      },
      unsuitable: {
        background: '#FFE8E8', 
        text: '#C62828',
        border: '#F44336'
      }
    };
  }

  // 格式化活动显示
  static formatActivities(activities) {
    return {
      suitable: activities.suitable.join(' '),
      unsuitable: activities.unsuitable.join(' ')
    };
  }
}

module.exports = AlmanacUtils;
