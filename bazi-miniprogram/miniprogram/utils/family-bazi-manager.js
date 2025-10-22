// 家庭成员八字管理器
// 提升用户活跃度：支持管理家庭成员的八字和运势

const BaziDataAdapter = require('./bazi-data-adapter.js');
const BaziDisplayManager = require('./bazi-display-manager.js');

class FamilyBaziManager {
  
  static STORAGE_KEY = 'family_bazi_members';
  static MAX_MEMBERS = 8; // 最多支持8个家庭成员
  
  /**
   * 保存新的家庭成员
   * @param {Object} birthInfo - 出生信息
   * @param {Object} backendResponse - 后端八字计算响应
   * @param {String} customName - 自定义名称（可选）
   * @returns {Object} 保存的成员数据
   */
  static saveFamilyMember(birthInfo, backendResponse, customName = null) {
    try {
      // 1. 数据标准化
      const normalizedData = BaziDataAdapter.normalizeBaziData(backendResponse);
      
      // 2. 生成成员信息
      const memberId = BaziDataAdapter.generatePersonId(birthInfo);
      const displayName = BaziDataAdapter.generateDisplayName(birthInfo, customName);
      
      // 3. 构建完整的成员数据
      const memberData = {
        id: memberId,
        name: displayName,
        customName: customName,
        birthInfo: birthInfo,
        baziData: normalizedData,
        createTime: Date.now(),
        lastUsed: Date.now(),
        
        // 添加用户活跃度相关字段
        viewCount: 0,              // 查看次数
        fortuneCheckCount: 0,      // 运势查看次数
        lastFortuneCheck: null,    // 最后一次查看运势时间
        favoriteColors: [],        // 收藏的幸运色彩
        fortuneHistory: []         // 运势历史记录（最近30天）
      };
      
      // 4. 同步到 BaziDisplayManager（如果有自定义名称）
      if (customName && normalizedData.bazi_result) {
        try {
          const fingerprint = BaziDisplayManager.generateBaziFingerprint(normalizedData.bazi_result);
          BaziDisplayManager.setCustomNote(fingerprint, customName);
          console.log('✅ 新成员备注已同步到 BaziDisplayManager:', customName);
        } catch (syncError) {
          console.error('❌ 新成员备注同步失败:', syncError);
          // 不影响主流程，继续保存
        }
      }

      // 5. 保存到本地存储
      const members = this.getAllMembers();
      
      // 检查是否已存在
      const existingIndex = members.findIndex(m => m.id === memberId);
      if (existingIndex >= 0) {
        // 更新现有成员
        members[existingIndex] = {
          ...members[existingIndex],
          ...memberData,
          viewCount: members[existingIndex].viewCount + 1,
          lastUsed: Date.now()
        };
      } else {
        // 添加新成员
        if (members.length >= this.MAX_MEMBERS) {
          throw new Error(`最多只能添加${this.MAX_MEMBERS}个家庭成员`);
        }
        members.push(memberData);
      }
      
      this.saveToStorage(members);
      
      console.log('💾 家庭成员保存成功:', displayName);
      return memberData;
      
    } catch (error) {
      console.error('❌ 保存家庭成员失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取所有家庭成员
   * @returns {Array} 家庭成员列表
   */
  static getAllMembers() {
    try {
      const data = wx.getStorageSync(this.STORAGE_KEY);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ 获取家庭成员失败:', error);
      return [];
    }
  }
  
  /**
   * 根据ID获取特定成员
   * @param {String} memberId - 成员ID
   * @returns {Object|null} 成员数据
   */
  static getMemberById(memberId) {
    const members = this.getAllMembers();
    return members.find(m => m.id === memberId) || null;
  }
  
  /**
   * 获取所有成员的基本信息（不包含运势计算）
   * @param {Date} targetDate - 目标日期，默认今天
   * @returns {Array} 包含成员信息的列表
   */
  static getAllMembersFortuneToday(targetDate = new Date()) {
    const members = this.getAllMembers();
    
    return members.map(member => ({
      ...member,
      needsFortuneCalculation: true,  // 标记需要通过后端计算运势
      targetDate: this.formatDate(targetDate)
    }));
  }
  
  /**
   * 获取特定成员的运势
   * 注意：此方法不再进行运势计算，只返回成员信息
   * 运势计算应通过 EnhancedFortuneCalculator 在上层进行
   * @param {String} memberId - 成员ID
   * @param {Date} targetDate - 目标日期
   * @returns {Object} 成员运势数据
   */
  static getMemberFortune(memberId, targetDate = new Date()) {
    const member = this.getMemberById(memberId);
    if (!member) {
      throw new Error('成员不存在');
    }
    
    // 更新使用统计
    this.updateMemberUsageStats(memberId);
    this.updateFortuneCheckStats(memberId);
    
    return {
      member: member,
      fortune: null,  // 不再计算运势
      needsFortuneCalculation: true,
      date: this.formatDate(targetDate)
    };
  }
  
  /**
   * 更新成员使用统计（提升活跃度追踪）
   * @param {String} memberId - 成员ID
   */
  static updateMemberUsageStats(memberId) {
    const members = this.getAllMembers();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex >= 0) {
      members[memberIndex].viewCount = (members[memberIndex].viewCount || 0) + 1;
      members[memberIndex].lastUsed = Date.now();
      this.saveToStorage(members);
    }
  }
  
  /**
   * 更新运势查看统计
   * @param {String} memberId - 成员ID
   */
  static updateFortuneCheckStats(memberId) {
    const members = this.getAllMembers();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex >= 0) {
      members[memberIndex].fortuneCheckCount = (members[memberIndex].fortuneCheckCount || 0) + 1;
      members[memberIndex].lastFortuneCheck = Date.now();
      this.saveToStorage(members);
    }
  }
  
  /**
   * 添加运势历史记录
   * @param {String} memberId - 成员ID
   * @param {Object} fortuneData - 运势数据
   */
  static addFortuneHistory(memberId, fortuneData) {
    const members = this.getAllMembers();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex >= 0) {
      const history = members[memberIndex].fortuneHistory || [];
      
      // 添加新记录
      history.unshift({
        date: this.formatDate(new Date()),
        timestamp: Date.now(),
        overall_score: fortuneData.data?.overall_score || 0,
        lucky_color: fortuneData.data?.lucky_elements?.lucky_color || '',
        summary: fortuneData.data?.suggestions?.suitable?.slice(0, 3) || []
      });
      
      // 保持最近30天的记录
      members[memberIndex].fortuneHistory = history.slice(0, 30);
      this.saveToStorage(members);
    }
  }
  
  /**
   * 删除家庭成员
   * @param {String} memberId - 成员ID
   * @returns {Boolean} 删除成功
   */
  static deleteMember(memberId) {
    try {
      const members = this.getAllMembers();
      const filteredMembers = members.filter(m => m.id !== memberId);
      
      if (filteredMembers.length === members.length) {
        return false; // 没有找到要删除的成员
      }
      
      this.saveToStorage(filteredMembers);
      console.log('🗑️ 家庭成员删除成功:', memberId);
      return true;
      
    } catch (error) {
      console.error('❌ 删除家庭成员失败:', error);
      return false;
    }
  }
  
  /**
   * 更新成员数据
   * @param {String} memberId - 成员ID
   * @param {Object} updatedData - 更新的数据
   * @returns {Boolean} 更新成功
   */
  static updateMemberData(memberId, updatedData) {
    try {
      const members = this.getAllMembers();
      const memberIndex = members.findIndex(m => m.id === memberId);
      
      if (memberIndex >= 0) {
        // 合并更新数据
        members[memberIndex] = {
          ...members[memberIndex],
          ...updatedData,
          lastUsed: Date.now()
        };
        
        this.saveToStorage(members);
        
        console.log('✅ 成员数据更新成功:', {
          memberId,
          updatedFields: Object.keys(updatedData)
        });
        
        return true;
      }
      
      console.warn('⚠️ 未找到指定成员:', memberId);
      return false;
    } catch (error) {
      console.error('❌ 更新成员数据失败:', error);
      return false;
    }
  }

  /**
   * 更新成员自定义名称
   * @param {String} memberId - 成员ID
   * @param {String} newName - 新名称
   * @returns {Boolean} 更新成功
   */
  static updateMemberName(memberId, newName) {
    try {
      const members = this.getAllMembers();
      const memberIndex = members.findIndex(m => m.id === memberId);
      
      if (memberIndex >= 0) {
        const member = members[memberIndex];
        
        // 生成八字指纹，用于同步到 BaziDisplayManager
        let fingerprint = null;
        try {
          if (member.baziData && member.baziData.bazi_result) {
            fingerprint = BaziDisplayManager.generateBaziFingerprint(member.baziData.bazi_result);
            console.log('🔍 生成八字指纹用于同步备注:', fingerprint);
            
            // 同步更新到 BaziDisplayManager 的 baziCustomNotes
            BaziDisplayManager.setCustomNote(fingerprint, newName);
            console.log('✅ 备注已同步到 BaziDisplayManager');
          } else {
            console.warn('⚠️ 成员缺少八字数据，无法生成指纹');
          }
        } catch (fingerprintError) {
          console.error('❌ 生成指纹或同步备注失败:', fingerprintError);
          // 即使同步失败，也继续更新家庭成员数据
        }
        
        // 更新家庭成员数据
        members[memberIndex].customName = newName;
        members[memberIndex].name = newName;
        members[memberIndex].lastUsed = Date.now();
        
        this.saveToStorage(members);
        
        console.log('✅ 成员名称更新成功:', {
          memberId,
          newName,
          fingerprint,
          syncedToBaziDisplayManager: !!fingerprint
        });
        
        return true;
      }
      
      console.warn('⚠️ 未找到指定成员:', memberId);
      return false;
    } catch (error) {
      console.error('❌ 更新成员名称失败:', error);
      return false;
    }
  }
  
  /**
   * 从后端获取家庭运势
   * @param {String} targetDate - 目标日期，格式："2025-10-21"
   * @returns {Promise} 家庭运势数据
   */
  static async getFamilyFortuneFromBackend(targetDate = null) {
    const app = getApp();
    const members = this.getAllMembers();
    
    if (members.length === 0) {
      return {
        success: true,
        data: {
          batch_mode: true,
          target_date: targetDate || this.formatDate(new Date()),
          members: [],
          family_overview: {
            total_members: 0,
            average_score: 0,
            best_member: null,
            family_lucky_color: '绿色',
            suggestions: ['暂无家庭成员，添加成员后查看运势'],
            active_members: 0,
            last_updated: Date.now() / 1000
          },
          total_members: 0
        }
      };
    }
    
        // 构建批量请求 - 修复数据结构问题
        const requestData = {
            batch: true,
            members_data: members.map(member => {
                // 尝试从多个位置获取出生信息
                const birthInfo = member.birthInfo || {};
                
                // 如果birthInfo中没有年月日，尝试从member本身获取
                const year = birthInfo.year || member.year;
                const month = birthInfo.month || member.month;
                const day = birthInfo.day || member.day;
                const hour = birthInfo.hour || member.hour || 12;
                const gender = birthInfo.gender || member.gender || 'male';
                const calendarType = birthInfo.calendarType || member.calendarType || 'solar';
                
                console.log(`🔍 成员 ${member.name} 数据构建:`, {
                    id: member.id,
                    name: member.name,
                    year, month, day, hour, gender, calendarType,
                    hasBirthInfo: !!member.birthInfo,
                    birthInfoKeys: member.birthInfo ? Object.keys(member.birthInfo) : [],
                    memberKeys: Object.keys(member)
                });
                
                return {
                    id: member.id,
                    name: member.name,
                    year: year,
                    month: month,
                    day: day,
                    hour: hour,
                    gender: gender,
                    calendarType: calendarType
                };
            }),
            target_date: targetDate || this.formatDate(new Date())
        };
        
        console.log('📤 最终批量请求数据:', JSON.stringify(requestData, null, 2));
    
    return new Promise((resolve, reject) => {
      app.request({
        url: '/api/v1/calculate-bazi',
        method: 'POST',
        data: requestData,
        success: (data) => {
          // 更新成员使用统计
          members.forEach(member => {
            this.updateMemberUsageStats(member.id);
            this.updateFortuneCheckStats(member.id);
          });
          
          console.log('✅ 家庭运势获取成功:', data);
          resolve(data);
        },
        fail: (error) => {
          console.error('❌ 家庭运势获取失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 获取家庭运势概览（降级方案 - 无运势数据时使用）
   * @returns {Object} 家庭运势概览
   */
  static getFamilyFortuneOverview() {
    const members = this.getAllMembers();
    const activeMembers = members.length;
    
    if (activeMembers === 0) {
      return {
        total_members: 0,
        average_score: 0,
        best_member: null,
        family_lucky_color: '绿色',
        suggestions: ['暂无家庭成员，添加成员后查看运势'],
        active_members: 0,
        last_updated: Date.now() / 1000
      };
    }
    
    // 简化的运势概览计算（降级方案）
    const averageScore = 3.5;
    const luckyColors = ['红色', '蓝色', '绿色', '黄色', '紫色'];
    const today = new Date();
    const colorIndex = (today.getDate() + activeMembers) % luckyColors.length;
    
    return {
      total_members: activeMembers,
      average_score: averageScore,
      best_member: null,
      family_lucky_color: luckyColors[colorIndex],
      suggestions: [
        `家庭共有${activeMembers}位成员`,
        '请重新获取运势数据',
        '建议检查网络连接'
      ],
      active_members: activeMembers,
      last_updated: Date.now() / 1000
    };
  }
  
  /**
   * 生成家庭建议
   * @param {Array} members - 家庭成员列表
   * @returns {Array} 建议列表
   */
  static generateFamilySuggestions(members) {
    const suggestions = [];
    
    if (members.length === 1) {
      suggestions.push('添加更多家庭成员，获得完整的家庭运势分析');
    }
    
    if (members.length >= 2) {
      suggestions.push('全家人今天适合一起活动，增进感情');
    }
    
    const highScoreMembers = members.filter(m => 
      (m.dailyFortune?.data?.overall_score || 0) >= 4);
    
    if (highScoreMembers.length > 0) {
      suggestions.push(`${highScoreMembers.map(m => m.name).join('、')}今日运势特别好`);
    }
    
    suggestions.push('每天查看运势，把握最佳时机');
    
    return suggestions;
  }
  
  /**
   * 保存数据到本地存储
   * @param {Array} members - 成员数据
   */
  static saveToStorage(members) {
    try {
      wx.setStorageSync(this.STORAGE_KEY, members);
    } catch (error) {
      console.error('❌ 保存到本地存储失败:', error);
      throw error;
    }
  }
  
  /**
   * 清空所有数据（仅用于测试）
   */
  static clearAllData() {
    try {
      wx.removeStorageSync(this.STORAGE_KEY);
      console.log('🧹 家庭成员数据已清空');
    } catch (error) {
      console.error('❌ 清空数据失败:', error);
    }
  }
  
  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {String} 格式化的日期字符串
   */
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

module.exports = FamilyBaziManager;
