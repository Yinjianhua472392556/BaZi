"""
八字计算缓存管理器
确保相同八字输入产生相同输出
实现确定性算法和结果缓存
"""

import hashlib
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class BaziCacheManager:
    """八字计算结果缓存管理器"""
    
    def __init__(self, cache_dir="cache"):
        self.cache_dir = cache_dir
        self.ensure_cache_directory()
        
    def ensure_cache_directory(self):
        """确保缓存目录存在"""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
    
    def generate_bazi_hash(self, year, month, day, hour, gender, calendar_type):
        """生成八字输入的哈希值，确保唯一性"""
        # 标准化输入参数
        normalized_input = {
            "year": int(year),
            "month": int(month), 
            "day": int(day),
            "hour": int(hour),
            "gender": str(gender).lower(),
            "calendar_type": str(calendar_type).lower()
        }
        
        # 生成哈希
        input_string = json.dumps(normalized_input, sort_keys=True)
        hash_obj = hashlib.md5(input_string.encode('utf-8'))
        return hash_obj.hexdigest()
    
    def get_cache_key(self, year, month, day, hour, gender, calendar_type):
        """获取缓存键"""
        hash_value = self.generate_bazi_hash(year, month, day, hour, gender, calendar_type)
        return f"bazi_{hash_value}"
    
    def get_cache_file_path(self, cache_key):
        """获取缓存文件路径"""
        return os.path.join(self.cache_dir, f"{cache_key}.json")
    
    def save_to_cache(self, year, month, day, hour, gender, calendar_type, result):
        """保存计算结果到缓存"""
        try:
            cache_key = self.get_cache_key(year, month, day, hour, gender, calendar_type)
            cache_file = self.get_cache_file_path(cache_key)
            
            # 准备缓存数据
            cache_data = {
                "input": {
                    "year": year,
                    "month": month,
                    "day": day,
                    "hour": hour,
                    "gender": gender,
                    "calendar_type": calendar_type
                },
                "result": result,
                "timestamp": datetime.now().isoformat(),
                "cache_key": cache_key
            }
            
            # 写入缓存文件
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 八字结果已缓存: {cache_key}")
            return True
            
        except Exception as e:
            print(f"❌ 缓存保存失败: {e}")
            return False
    
    def load_from_cache(self, year, month, day, hour, gender, calendar_type):
        """从缓存加载计算结果"""
        try:
            cache_key = self.get_cache_key(year, month, day, hour, gender, calendar_type)
            cache_file = self.get_cache_file_path(cache_key)
            
            # 检查缓存文件是否存在
            if not os.path.exists(cache_file):
                return None
            
            # 读取缓存数据
            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # 验证缓存有效性
            if self.is_cache_valid(cache_data):
                print(f"✅ 从缓存加载八字结果: {cache_key}")
                return cache_data["result"]
            else:
                # 删除无效缓存
                os.remove(cache_file)
                print(f"🗑️ 删除无效缓存: {cache_key}")
                return None
                
        except Exception as e:
            print(f"❌ 缓存加载失败: {e}")
            return None
    
    def is_cache_valid(self, cache_data, max_age_days=365):
        """检查缓存是否有效"""
        try:
            # 检查时间戳
            cache_time = datetime.fromisoformat(cache_data["timestamp"])
            max_age = timedelta(days=max_age_days)
            
            if datetime.now() - cache_time > max_age:
                return False
            
            # 检查数据完整性
            required_keys = ["input", "result", "timestamp", "cache_key"]
            if not all(key in cache_data for key in required_keys):
                return False
            
            return True
            
        except Exception:
            return False
    
    def clear_expired_cache(self, max_age_days=30):
        """清理过期缓存"""
        try:
            cleared_count = 0
            cutoff_time = datetime.now() - timedelta(days=max_age_days)
            
            for filename in os.listdir(self.cache_dir):
                if filename.endswith('.json') and filename.startswith('bazi_'):
                    file_path = os.path.join(self.cache_dir, filename)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            cache_data = json.load(f)
                        
                        cache_time = datetime.fromisoformat(cache_data["timestamp"])
                        if cache_time < cutoff_time:
                            os.remove(file_path)
                            cleared_count += 1
                            
                    except Exception:
                        # 删除损坏的缓存文件
                        os.remove(file_path)
                        cleared_count += 1
            
            print(f"🧹 清理了 {cleared_count} 个过期缓存文件")
            return cleared_count
            
        except Exception as e:
            print(f"❌ 清理缓存失败: {e}")
            return 0
    
    def get_cache_stats(self):
        """获取缓存统计信息"""
        try:
            cache_files = [f for f in os.listdir(self.cache_dir) 
                          if f.endswith('.json') and f.startswith('bazi_')]
            
            total_size = 0
            valid_count = 0
            expired_count = 0
            
            for filename in cache_files:
                file_path = os.path.join(self.cache_dir, filename)
                total_size += os.path.getsize(file_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        cache_data = json.load(f)
                    
                    if self.is_cache_valid(cache_data):
                        valid_count += 1
                    else:
                        expired_count += 1
                        
                except Exception:
                    expired_count += 1
            
            return {
                "total_files": len(cache_files),
                "valid_count": valid_count,
                "expired_count": expired_count,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "cache_directory": self.cache_dir
            }
            
        except Exception as e:
            print(f"❌ 获取缓存统计失败: {e}")
            return None


class DeterministicBaziCalculator:
    """确定性八字计算器，确保相同输入产生相同输出"""
    
    def __init__(self):
        self.cache_manager = BaziCacheManager()
        
    def normalize_input(self, year, month, day, hour, gender, calendar_type):
        """标准化输入参数"""
        return {
            "year": int(year),
            "month": int(month),
            "day": int(day), 
            "hour": int(hour),
            "gender": str(gender).lower().strip(),
            "calendar_type": str(calendar_type).lower().strip()
        }
    
    def validate_input(self, year, month, day, hour, gender, calendar_type):
        """验证输入参数"""
        errors = []
        
        # 年份验证
        if not (1900 <= year <= 2100):
            errors.append("年份应在1900-2100之间")
        
        # 月份验证
        if not (1 <= month <= 12):
            errors.append("月份应在1-12之间")
        
        # 日期验证
        if not (1 <= day <= 31):
            errors.append("日期应在1-31之间")
        
        # 小时验证
        if not (0 <= hour <= 23):
            errors.append("小时应在0-23之间")
        
        # 性别验证
        if gender not in ['male', 'female', 'unknown']:
            errors.append("性别应为male、female或unknown")
        
        # 日历类型验证
        if calendar_type not in ['solar', 'lunar']:
            errors.append("日历类型应为solar或lunar")
        
        return errors
    
    def calculate_with_cache(self, year, month, day, hour, gender="male", calendar_type="solar"):
        """带缓存的八字计算"""
        try:
            # 标准化输入
            normalized = self.normalize_input(year, month, day, hour, gender, calendar_type)
            
            # 验证输入
            errors = self.validate_input(**normalized)
            if errors:
                raise ValueError(f"输入参数错误: {', '.join(errors)}")
            
            # 尝试从缓存加载
            cached_result = self.cache_manager.load_from_cache(**normalized)
            if cached_result:
                return cached_result
            
            # 缓存未命中，进行计算
            from .bazi_calculator import BaziCalculator
            calculator = BaziCalculator()
            
            result = calculator.calculate_bazi(**normalized)
            
            # 添加确定性标记
            result["is_deterministic"] = True
            result["calculation_timestamp"] = datetime.now().isoformat()
            result["input_hash"] = self.cache_manager.generate_bazi_hash(**normalized)
            
            # 保存到缓存
            self.cache_manager.save_to_cache(**normalized, result=result)
            
            return result
            
        except Exception as e:
            print(f"❌ 八字计算失败: {e}")
            raise e
    
    def verify_consistency(self, year, month, day, hour, gender="male", calendar_type="solar", iterations=3):
        """验证计算结果的一致性"""
        results = []
        
        for i in range(iterations):
            try:
                # 清除缓存，强制重新计算
                cache_key = self.cache_manager.get_cache_key(year, month, day, hour, gender, calendar_type)
                cache_file = self.cache_manager.get_cache_file_path(cache_key)
                if os.path.exists(cache_file):
                    os.remove(cache_file)
                
                # 重新计算
                result = self.calculate_with_cache(year, month, day, hour, gender, calendar_type)
                results.append(result)
                
            except Exception as e:
                print(f"第{i+1}次计算失败: {e}")
                return False
        
        # 比较结果一致性
        if len(results) < 2:
            return True
        
        # 比较关键字段
        first_result = results[0]
        key_fields = ["bazi", "wuxing", "analysis"]
        
        for result in results[1:]:
            for field in key_fields:
                if result.get(field) != first_result.get(field):
                    print(f"❌ 字段 {field} 结果不一致")
                    return False
        
        print("✅ 多次计算结果完全一致")
        return True


# 全局实例
deterministic_calculator = DeterministicBaziCalculator()
