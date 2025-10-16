// 运势缓存管理器 - 前端智能缓存
class FortuneCacheManager {
  constructor() {
    this.CACHE_KEY_PREFIX = 'fortune_cache_';
    this.BATCH_CACHE_KEY_PREFIX = 'batch_fortune_cache_';
    this.CACHE_EXPIRY_HOURS = 24; // 缓存24小时过期
    this.MAX_CACHE_SIZE = 50; // 最大缓存50个运势结果
  }

  /**
   * 生成缓存键
   * @param {Object} baziData - 八字数据
   * @param {string} targetDate - 目标日期
   * @returns {string} 缓存键
   */
  generateCacheKey(baziData, targetDate) {
    // 生成八字指纹
    const baziFingerprint = this.generateBaziFingerprint(baziData);
    return `${this.CACHE_KEY_PREFIX}${baziFingerprint}_${targetDate}`;
  }

  /**
   * 生成批量缓存键
   * @param {Array} membersData - 成员数据列表
   * @param {string} targetDate - 目标日期
   * @returns {string} 批量缓存键
   */
  generateBatchCacheKey(membersData, targetDate) {
    // 生成成员列表的指纹
    const membersFingerprint = this.generateMembersFingerprint(membersData);
    return `${this.BATCH_CACHE_KEY_PREFIX}${membersFingerprint}_${targetDate}`;
  }

  /**
   * 生成八字指纹
   * @param {Object} baziData - 八字数据
   * @returns {string} 八字指纹
   */
  generateBaziFingerprint(baziData) {
    if (!baziData) return 'unknown';
    
    // 尝试从不同的数据结构中提取八字信息
    let fingerprint = '';
    
    if (baziData.year_pillar && baziData.month_pillar && baziData.day_pillar && baziData.hour_pillar) {
      // 标准八字格式
      fingerprint = `${baziData.year_pillar}-${baziData.month_pillar}-${baziData.day_pillar}-${baziData.hour_pillar}`;
    } else if (baziData.bazi) {
      // 嵌套的八字格式
      const bazi = baziData.bazi;
      fingerprint = `${bazi.year || 'unknown'}-${bazi.month || 'unknown'}-${bazi.day || 'unknown'}-${bazi.hour || 'unknown'}`;
    } else if (baziData.user_info) {
      // 用户信息格式
      const userInfo = baziData.user_info;
      fingerprint = `${userInfo.birth_date || 'unknown'}_${userInfo.birth_time || 'unknown'}_${userInfo.gender || 'unknown'}`;
    } else {
      // 降级方案：使用对象的JSON字符串的hash
      fingerprint = this.simpleHash(JSON.stringify(baziData));
    }
    
    return fingerprint;
  }

  /**
   * 生成成员列表指纹
   * @param {Array} membersData - 成员数据
   * @returns {string} 成员指纹
   */
  generateMembersFingerprint(membersData) {
    if (!Array.isArray(membersData) || membersData.length === 0) {
      return 'empty';
    }
    
    const fingerprints = membersData.map(member => {
      const baziData = member.bazi_data || member;
      return this.generateBaziFingerprint(baziData);
    });
    
    return fingerprints.sort().join('|'); // 排序确保一致性
  }

  /**
   * 简单哈希函数
   * @param {string} str - 字符串
   * @returns {string} 哈希值
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 获取缓存的运势数据
   * @param {Object} baziData - 八字数据
   * @param {string} targetDate - 目标日期
   * @returns {Object|null} 缓存的运势数据
   */
  getCachedFortune(baziData, targetDate) {
    try {
      const cacheKey = this.generateCacheKey(baziData, targetDate);
      const cachedData = wx.getStorageSync(cacheKey);
      
      if (!cachedData) {
        console.log('🔍 运势缓存未命中:', cacheKey);
        return null;
      }
      
      // 检查缓存是否过期
      const now = new Date().getTime();
      const cacheTime = cachedData.timestamp || 0;
      const expiryTime = cacheTime + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      
      if (now > expiryTime) {
        console.log('🔍 运势缓存已过期:', cacheKey);
        this.removeCachedFortune(baziData, targetDate);
        return null;
      }
      
      console.log('✅ 运势缓存命中:', cacheKey);
      return cachedData.data;
      
    } catch (error) {
      console.error('❌ 获取运势缓存失败:', error);
      return null;
    }
  }

  /**
   * 缓存运势数据
   * @param {Object} baziData - 八字数据
   * @param {string} targetDate - 目标日期
   * @param {Object} fortuneData - 运势数据
   */
  setCachedFortune(baziData, targetDate, fortuneData) {
    try {
      const cacheKey = this.generateCacheKey(baziData, targetDate);
      
      const cacheData = {
        data: fortuneData,
        timestamp: new Date().getTime(),
        version: '2.0'
      };
      
      wx.setStorageSync(cacheKey, cacheData);
      console.log('💾 运势数据已缓存:', cacheKey);
      
      // 清理过期缓存
      this.cleanExpiredCache();
      
    } catch (error) {
      console.error('❌ 缓存运势数据失败:', error);
    }
  }

  /**
   * 获取批量缓存的运势数据
   * @param {Array} membersData - 成员数据
   * @param {string} targetDate - 目标日期
   * @returns {Object|null} 缓存的批量运势数据
   */
  getCachedBatchFortune(membersData, targetDate) {
    try {
      const cacheKey = this.generateBatchCacheKey(membersData, targetDate);
      const cachedData = wx.getStorageSync(cacheKey);
      
      if (!cachedData) {
        console.log('🔍 批量运势缓存未命中:', cacheKey);
        return null;
      }
      
      // 检查缓存是否过期
      const now = new Date().getTime();
      const cacheTime = cachedData.timestamp || 0;
      const expiryTime = cacheTime + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      
      if (now > expiryTime) {
        console.log('🔍 批量运势缓存已过期:', cacheKey);
        this.removeCachedBatchFortune(membersData, targetDate);
        return null;
      }
      
      console.log('✅ 批量运势缓存命中:', cacheKey);
      return cachedData.data;
      
    } catch (error) {
      console.error('❌ 获取批量运势缓存失败:', error);
      return null;
    }
  }

  /**
   * 缓存批量运势数据
   * @param {Array} membersData - 成员数据
   * @param {string} targetDate - 目标日期
   * @param {Object} batchFortuneData - 批量运势数据
   */
  setCachedBatchFortune(membersData, targetDate, batchFortuneData) {
    try {
      const cacheKey = this.generateBatchCacheKey(membersData, targetDate);
      
      const cacheData = {
        data: batchFortuneData,
        timestamp: new Date().getTime(),
        version: '2.0',
        membersCount: membersData.length
      };
      
      wx.setStorageSync(cacheKey, cacheData);
      console.log('💾 批量运势数据已缓存:', cacheKey);
      
      // 清理过期缓存
      this.cleanExpiredCache();
      
    } catch (error) {
      console.error('❌ 缓存批量运势数据失败:', error);
    }
  }

  /**
   * 移除特定的运势缓存
   * @param {Object} baziData - 八字数据
   * @param {string} targetDate - 目标日期
   */
  removeCachedFortune(baziData, targetDate) {
    try {
      const cacheKey = this.generateCacheKey(baziData, targetDate);
      wx.removeStorageSync(cacheKey);
      console.log('🗑️ 已移除运势缓存:', cacheKey);
    } catch (error) {
      console.error('❌ 移除运势缓存失败:', error);
    }
  }

  /**
   * 移除特定的批量运势缓存
   * @param {Array} membersData - 成员数据
   * @param {string} targetDate - 目标日期
   */
  removeCachedBatchFortune(membersData, targetDate) {
    try {
      const cacheKey = this.generateBatchCacheKey(membersData, targetDate);
      wx.removeStorageSync(cacheKey);
      console.log('🗑️ 已移除批量运势缓存:', cacheKey);
    } catch (error) {
      console.error('❌ 移除批量运势缓存失败:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const now = new Date().getTime();
      
      const keysToRemove = [];
      
      storageInfo.keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.BATCH_CACHE_KEY_PREFIX)) {
          try {
            const cachedData = wx.getStorageSync(key);
            if (cachedData && cachedData.timestamp) {
              const expiryTime = cachedData.timestamp + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
              if (now > expiryTime) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // 如果读取失败，也删除这个键
            keysToRemove.push(key);
          }
        }
      });
      
      // 移除过期的缓存
      keysToRemove.forEach(key => {
        try {
          wx.removeStorageSync(key);
        } catch (error) {
          console.error('移除过期缓存失败:', key, error);
        }
      });
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 清理了 ${keysToRemove.length} 个过期的运势缓存`);
      }
      
    } catch (error) {
      console.error('❌ 清理过期缓存失败:', error);
    }
  }

  /**
   * 清理所有运势缓存
   */
  clearAllFortuneCache() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const keysToRemove = storageInfo.keys.filter(key => 
        key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.BATCH_CACHE_KEY_PREFIX)
      );
      
      keysToRemove.forEach(key => {
        try {
          wx.removeStorageSync(key);
        } catch (error) {
          console.error('移除运势缓存失败:', key, error);
        }
      });
      
      console.log(`🧹 清理了所有运势缓存，共 ${keysToRemove.length} 个`);
      
    } catch (error) {
      console.error('❌ 清理所有运势缓存失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const fortuneKeys = storageInfo.keys.filter(key => 
        key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.BATCH_CACHE_KEY_PREFIX)
      );
      
      let totalSize = 0;
      let validCount = 0;
      let expiredCount = 0;
      const now = new Date().getTime();
      
      fortuneKeys.forEach(key => {
        try {
          const cachedData = wx.getStorageSync(key);
          if (cachedData) {
            totalSize += JSON.stringify(cachedData).length;
            
            if (cachedData.timestamp) {
              const expiryTime = cachedData.timestamp + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
              if (now > expiryTime) {
                expiredCount++;
              } else {
                validCount++;
              }
            }
          }
        } catch (error) {
          expiredCount++; // 读取失败的也算过期
        }
      });
      
      return {
        totalCaches: fortuneKeys.length,
        validCaches: validCount,
        expiredCaches: expiredCount,
        totalSizeKB: Math.round(totalSize / 1024),
        cacheHitRate: 0 // 简化处理，可以后续扩展
      };
      
    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error);
      return {
        totalCaches: 0,
        validCaches: 0,
        expiredCaches: 0,
        totalSizeKB: 0,
        cacheHitRate: 0
      };
    }
  }

  /**
   * 预热缓存 - 为常用的八字预先计算运势
   * @param {Array} baziList - 常用八字列表
   * @param {string} targetDate - 目标日期
   */
  async preloadFortunes(baziList, targetDate) {
    console.log('🔥 开始预热运势缓存...');
    
    const preloadPromises = baziList.map(async (baziData) => {
      try {
        // 检查是否已有缓存
        const cached = this.getCachedFortune(baziData, targetDate);
        if (cached) {
          return; // 已有缓存，跳过
        }
        
        // 调用运势计算（需要从外部传入计算函数）
        // 这里只是标记需要预热，实际的API调用由调用方处理
        console.log('🔥 标记预热:', this.generateBaziFingerprint(baziData));
        
      } catch (error) {
        console.error('预热失败:', error);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('🔥 运势缓存预热完成');
  }
}

// 导出缓存管理器
module.exports = FortuneCacheManager;
