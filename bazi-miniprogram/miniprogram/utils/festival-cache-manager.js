// 节日缓存管理器 - 优化计算性能和减少重复计算
const LunarConversionEngine = require('./lunar-conversion-engine-fixed.js');

class FestivalCacheManager {
  // 内存缓存
  static cache = new Map();
  static lunarYearCache = new Map();
  static solarTermsCache = new Map();
  
  // 缓存配置
  static CACHE_YEARS = 50; // 预计算50年
  static MAX_CACHE_SIZE = 1000; // 最大缓存项数
  static CACHE_VERSION = '1.0.0'; // 缓存版本号
  
  // 性能统计
  static statistics = {
    hits: 0,
    misses: 0,
    computationTime: 0,
    precomputeCount: 0
  };

  /**
   * 获取农历年数据（带缓存）
   * @param {number} year - 农历年份
   * @returns {Object|null} 农历年数据
   */
  static getLunarYearData(year) {
    const cacheKey = `lunar_year_${year}`;
    
    // 检查缓存
    if (this.lunarYearCache.has(cacheKey)) {
      this.statistics.hits++;
      return this.lunarYearCache.get(cacheKey);
    }
    
    // 缓存未命中，计算数据
    this.statistics.misses++;
    const startTime = Date.now();
    
    try {
      const yearData = LunarConversionEngine.calculateLunarYear(year);
      
      if (yearData) {
        // 存入缓存
        this.lunarYearCache.set(cacheKey, yearData);
        
        // 预计算相邻年份（异步）
        this.precomputeAdjacentYears(year);
        
        // 清理过期缓存
        this.cleanupCache();
      }
      
      this.statistics.computationTime += Date.now() - startTime;
      return yearData;
    } catch (error) {
      console.error(`获取农历${year}年数据失败:`, error);
      return null;
    }
  }

  /**
   * 获取节气数据（带缓存）
   * @param {number} year - 公历年份
   * @returns {Array<Object>} 节气数据数组
   */
  static getSolarTermsData(year) {
    const cacheKey = `solar_terms_${year}`;
    
    if (this.solarTermsCache.has(cacheKey)) {
      this.statistics.hits++;
      return this.solarTermsCache.get(cacheKey);
    }
    
    this.statistics.misses++;
    const startTime = Date.now();
    
    try {
      const termsData = LunarConversionEngine.calculateSolarTerms(year);
      
      if (termsData) {
        this.solarTermsCache.set(cacheKey, termsData);
        this.cleanupCache();
      }
      
      this.statistics.computationTime += Date.now() - startTime;
      return termsData;
    } catch (error) {
      console.error(`获取${year}年节气数据失败:`, error);
      return null;
    }
  }

  /**
   * 批量预计算多年数据
   * @param {number} startYear - 起始年份
   * @param {number} yearCount - 计算年数
   * @returns {Promise<void>}
   */
  static async precomputeYears(startYear, yearCount = this.CACHE_YEARS) {
    const tasks = [];
    
    for (let i = 0; i < yearCount; i++) {
      const year = startYear + i;
      tasks.push(this.precomputeYear(year));
    }
    
    try {
      await Promise.all(tasks);
      console.log(`预计算完成: ${startYear}-${startYear + yearCount - 1}年`);
    } catch (error) {
      console.error('批量预计算失败:', error);
    }
  }

  /**
   * 预计算单年数据
   * @param {number} year - 年份
   * @returns {Promise<void>}
   */
  static async precomputeYear(year) {
    return new Promise((resolve) => {
      // 使用 setTimeout 避免阻塞主线程
      setTimeout(() => {
        try {
          // 预计算农历年数据
          this.getLunarYearData(year);
          
          // 预计算节气数据
          this.getSolarTermsData(year);
          
          this.statistics.precomputeCount++;
          resolve();
        } catch (error) {
          console.warn(`预计算${year}年失败:`, error);
          resolve();
        }
      }, 0);
    });
  }

  /**
   * 预计算相邻年份（异步）
   * @param {number} centerYear - 中心年份
   */
  static precomputeAdjacentYears(centerYear) {
    // 异步预计算前后各2年
    setTimeout(() => {
      const years = [
        centerYear - 2, centerYear - 1, 
        centerYear + 1, centerYear + 2
      ];
      
      years.forEach(year => {
        if (!this.lunarYearCache.has(`lunar_year_${year}`)) {
          this.precomputeYear(year);
        }
      });
    }, 100);
  }

  /**
   * 农历转公历（带缓存）
   * @param {number} lunarYear - 农历年
   * @param {number} lunarMonth - 农历月
   * @param {number} lunarDay - 农历日
   * @param {boolean} isLeapMonth - 是否闰月
   * @returns {Date|null} 公历日期
   */
  static lunarToSolarCached(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
    const cacheKey = `lunar_to_solar_${lunarYear}_${lunarMonth}_${lunarDay}_${isLeapMonth}`;
    
    if (this.cache.has(cacheKey)) {
      this.statistics.hits++;
      return this.cache.get(cacheKey);
    }
    
    this.statistics.misses++;
    const result = LunarConversionEngine.lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth);
    
    if (result) {
      this.cache.set(cacheKey, result);
      this.cleanupCache();
    }
    
    return result;
  }

  /**
   * 公历转农历（带缓存）
   * @param {Date} solarDate - 公历日期
   * @returns {Object|null} 农历日期信息
   */
  static solarToLunarCached(solarDate) {
    const dateStr = `${solarDate.getFullYear()}-${solarDate.getMonth() + 1}-${solarDate.getDate()}`;
    const cacheKey = `solar_to_lunar_${dateStr}`;
    
    if (this.cache.has(cacheKey)) {
      this.statistics.hits++;
      return this.cache.get(cacheKey);
    }
    
    this.statistics.misses++;
    const result = LunarConversionEngine.solarToLunar(solarDate);
    
    if (result) {
      this.cache.set(cacheKey, result);
      this.cleanupCache();
    }
    
    return result;
  }

  /**
   * 清理过期缓存
   */
  static cleanupCache() {
    // 如果缓存大小超过限制，清理最老的条目
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
      keysToDelete.forEach(key => this.cache.delete(key));
    }
    
    if (this.lunarYearCache.size > 100) {
      const keysToDelete = Array.from(this.lunarYearCache.keys()).slice(0, 20);
      keysToDelete.forEach(key => this.lunarYearCache.delete(key));
    }
    
    if (this.solarTermsCache.size > 100) {
      const keysToDelete = Array.from(this.solarTermsCache.keys()).slice(0, 20);
      keysToDelete.forEach(key => this.solarTermsCache.delete(key));
    }
  }

  /**
   * 清空所有缓存
   */
  static clearAllCache() {
    this.cache.clear();
    this.lunarYearCache.clear();
    this.solarTermsCache.clear();
    
    // 重置统计信息
    this.statistics = {
      hits: 0,
      misses: 0,
      computationTime: 0,
      precomputeCount: 0
    };
    
    console.log('所有缓存已清空');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  static getCacheStatistics() {
    const totalRequests = this.statistics.hits + this.statistics.misses;
    const hitRate = totalRequests > 0 ? (this.statistics.hits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      ...this.statistics,
      totalRequests,
      hitRate: `${hitRate}%`,
      cacheSize: {
        general: this.cache.size,
        lunarYear: this.lunarYearCache.size,
        solarTerms: this.solarTermsCache.size,
        total: this.cache.size + this.lunarYearCache.size + this.solarTermsCache.size
      },
      averageComputationTime: totalRequests > 0 ? 
        (this.statistics.computationTime / this.statistics.misses).toFixed(2) + 'ms' : '0ms'
    };
  }

  /**
   * 导出缓存数据（用于持久化）
   * @returns {Object} 缓存数据
   */
  static exportCache() {
    try {
      return {
        version: this.CACHE_VERSION,
        timestamp: Date.now(),
        data: {
          general: Array.from(this.cache.entries()),
          lunarYear: Array.from(this.lunarYearCache.entries()),
          solarTerms: Array.from(this.solarTermsCache.entries())
        },
        statistics: this.statistics
      };
    } catch (error) {
      console.error('导出缓存失败:', error);
      return null;
    }
  }

  /**
   * 导入缓存数据（用于恢复）
   * @param {Object} cacheData - 缓存数据
   * @returns {boolean} 是否成功
   */
  static importCache(cacheData) {
    try {
      if (!cacheData || cacheData.version !== this.CACHE_VERSION) {
        console.warn('缓存数据版本不匹配或无效');
        return false;
      }
      
      // 检查数据新鲜度（7天内的数据才导入）
      const dataAge = Date.now() - cacheData.timestamp;
      if (dataAge > 7 * 24 * 60 * 60 * 1000) {
        console.warn('缓存数据过期，跳过导入');
        return false;
      }
      
      // 清空现有缓存
      this.clearAllCache();
      
      // 导入数据
      if (cacheData.data.general) {
        this.cache = new Map(cacheData.data.general);
      }
      if (cacheData.data.lunarYear) {
        this.lunarYearCache = new Map(cacheData.data.lunarYear);
      }
      if (cacheData.data.solarTerms) {
        this.solarTermsCache = new Map(cacheData.data.solarTerms);
      }
      
      // 恢复统计信息
      if (cacheData.statistics) {
        this.statistics = { ...cacheData.statistics };
      }
      
      console.log('缓存数据导入成功');
      return true;
    } catch (error) {
      console.error('导入缓存失败:', error);
      return false;
    }
  }

  /**
   * 初始化缓存管理器
   * @param {number} currentYear - 当前年份
   */
  static async initialize(currentYear = new Date().getFullYear()) {
    console.log('初始化节日缓存管理器...');
    
    try {
      // 预计算当前年份前后各10年的数据
      const startYear = currentYear - 10;
      const yearCount = 20;
      
      console.log(`开始预计算 ${startYear}-${startYear + yearCount - 1} 年数据...`);
      await this.precomputeYears(startYear, yearCount);
      
      const stats = this.getCacheStatistics();
      console.log('缓存初始化完成:', stats);
    } catch (error) {
      console.error('缓存初始化失败:', error);
    }
  }

  /**
   * 获取缓存键的信息
   * @param {string} key - 缓存键
   * @returns {Object|null} 键信息
   */
  static getCacheKeyInfo(key) {
    if (this.cache.has(key)) {
      return { type: 'general', exists: true, value: this.cache.get(key) };
    }
    if (this.lunarYearCache.has(key)) {
      return { type: 'lunarYear', exists: true, value: this.lunarYearCache.get(key) };
    }
    if (this.solarTermsCache.has(key)) {
      return { type: 'solarTerms', exists: true, value: this.solarTermsCache.get(key) };
    }
    return { type: 'unknown', exists: false, value: null };
  }

  /**
   * 手动删除指定缓存项
   * @param {string} key - 缓存键
   * @returns {boolean} 是否成功删除
   */
  static deleteCacheItem(key) {
    let deleted = false;
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
      deleted = true;
    }
    if (this.lunarYearCache.has(key)) {
      this.lunarYearCache.delete(key);
      deleted = true;
    }
    if (this.solarTermsCache.has(key)) {
      this.solarTermsCache.delete(key);
      deleted = true;
    }
    
    return deleted;
  }
}

module.exports = FestivalCacheManager;
