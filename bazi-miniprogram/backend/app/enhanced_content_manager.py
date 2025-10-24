#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
增强版内容管理器 - 整合个性化分析和运势模板库
支持多维度模板选择和内容组合生成
"""

import json
import os
import hashlib
import random
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import logging

class EnhancedContentManager:
    """增强版内容管理器"""
    
    def __init__(self, data_dir: str = None):
        """初始化内容管理器"""
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        
        self.data_dir = data_dir
        self.personality_templates = {}
        self.fortune_templates = {}
        self.cache = {}
        self.logger = logging.getLogger(__name__)
        
        # 加载模板数据
        self._load_templates()
    
    def _load_templates(self):
        """加载所有模板数据"""
        try:
            # 加载个性化分析模板
            personality_file = os.path.join(self.data_dir, 'enhanced_personality_templates.json')
            if os.path.exists(personality_file):
                with open(personality_file, 'r', encoding='utf-8') as f:
                    self.personality_templates = json.load(f)
                self.logger.info(f"已加载个性化模板库，版本: {self.personality_templates.get('version', 'unknown')}")
            
            # 加载运势分析模板
            fortune_file = os.path.join(self.data_dir, 'enhanced_fortune_templates.json')
            if os.path.exists(fortune_file):
                with open(fortune_file, 'r', encoding='utf-8') as f:
                    self.fortune_templates = json.load(f)
                self.logger.info(f"已加载运势模板库，版本: {self.fortune_templates.get('version', 'unknown')}")
                
        except Exception as e:
            self.logger.error(f"加载模板数据失败: {e}")
            self._load_fallback_templates()
    
    def _load_fallback_templates(self):
        """加载后备模板数据"""
        self.logger.info("使用后备模板数据")
        
        # 基础个性化模板
        self.personality_templates = {
            "personality_matrix": {
                "甲": {
                    "正官格": {
                        "身旺": {
                            "base_description": "您具有甲木正官格身旺的特质，天生具备强烈的领导欲望和组织能力...",
                            "strengths": ["领导能力强", "执行力佳", "责任心重"],
                            "weaknesses": ["容易专断", "过于严厉"],
                            "life_advice": "建议在管理中多倾听下属意见，适当授权..."
                        }
                    }
                }
            }
        }
        
        # 基础运势模板
        self.fortune_templates = {
            "fortune_analysis_matrix": {
                "十神关系运势": {
                    "比肩": {
                        "正面影响": {
                            "基础描述": "今日比肩当值，代表同类相助的能量较强..."
                        }
                    }
                }
            }
        }
    
    def get_enhanced_personality_analysis(self, day_gan: str, pattern: str, strength: str, 
                                        age: int = None, gender: str = None) -> Dict[str, Any]:
        """获取增强版个性化分析"""
        try:
            # 生成缓存键
            cache_key = self._generate_cache_key("personality", day_gan, pattern, strength, age, gender)
            
            # 检查缓存
            if cache_key in self.cache:
                return self.cache[cache_key]
            
            # 获取基础模板
            base_template = self._get_personality_template(day_gan, pattern, strength)
            
            # 个性化调整
            enhanced_content = self._enhance_personality_content(base_template, age, gender)
            
            # 缓存结果
            self.cache[cache_key] = enhanced_content
            
            return enhanced_content
            
        except Exception as e:
            self.logger.error(f"获取个性化分析失败: {e}")
            return self._get_fallback_personality_analysis(day_gan)
    
    def get_enhanced_fortune_analysis(self, ten_god: str, seasonal_info: Dict[str, Any],
                                    wuxing_strength: Dict[str, int], age: int = None, 
                                    gender: str = None) -> Dict[str, Any]:
        """获取增强版运势分析"""
        try:
            # 生成缓存键
            cache_key = self._generate_cache_key("fortune", ten_god, seasonal_info.get('current_term', ''),
                                               str(wuxing_strength), age, gender)
            
            # 检查缓存
            if cache_key in self.cache:
                return self.cache[cache_key]
            
            # 获取十神运势模板
            ten_god_fortune = self._get_ten_god_fortune_template(ten_god)
            
            # 获取节气运势模板
            seasonal_fortune = self._get_seasonal_fortune_template(seasonal_info)
            
            # 获取五行调和建议
            wuxing_advice = self._get_wuxing_balance_advice(wuxing_strength)
            
            # 组合运势内容
            enhanced_content = self._combine_fortune_content(
                ten_god_fortune, seasonal_fortune, wuxing_advice, age, gender
            )
            
            # 缓存结果
            self.cache[cache_key] = enhanced_content
            
            return enhanced_content
            
        except Exception as e:
            self.logger.error(f"获取运势分析失败: {e}")
            return self._get_fallback_fortune_analysis(ten_god)
    
    def _get_personality_template(self, day_gan: str, pattern: str, strength: str) -> Dict[str, Any]:
        """获取个性化分析模板"""
        personality_matrix = self.personality_templates.get("personality_matrix", {})
        
        # 查找对应的模板
        gan_templates = personality_matrix.get(day_gan, {})
        pattern_templates = gan_templates.get(pattern, {})
        
        if isinstance(pattern_templates, dict) and strength in pattern_templates:
            return pattern_templates[strength]
        elif isinstance(pattern_templates, dict) and "特征" in pattern_templates:
            # 处理特殊格局（如从财格、魁罡格等）
            return pattern_templates["特征"]
        else:
            # 使用默认模板
            return self._get_default_personality_template(day_gan)
    
    def _get_ten_god_fortune_template(self, ten_god: str) -> Dict[str, Any]:
        """获取十神运势模板"""
        ten_god_matrix = self.fortune_templates.get("fortune_analysis_matrix", {}).get("十神关系运势", {})
        return ten_god_matrix.get(ten_god, {})
    
    def _get_seasonal_fortune_template(self, seasonal_info: Dict[str, Any]) -> Dict[str, Any]:
        """获取节气运势模板"""
        seasonal_matrix = self.fortune_templates.get("fortune_analysis_matrix", {}).get("节气运势", {})
        current_term = seasonal_info.get('current_term', '')
        return seasonal_matrix.get(current_term, {})
    
    def _get_wuxing_balance_advice(self, wuxing_strength: Dict[str, int]) -> Dict[str, Any]:
        """获取五行调和建议"""
        wuxing_matrix = self.fortune_templates.get("fortune_analysis_matrix", {}).get("五行调和建议", {})
        
        # 找出最强的五行
        strongest_wuxing = max(wuxing_strength.keys(), key=lambda x: wuxing_strength[x])
        
        return wuxing_matrix.get(f"{strongest_wuxing}旺", {})
    
    def _enhance_personality_content(self, base_template: Dict[str, Any], 
                                   age: int = None, gender: str = None) -> Dict[str, Any]:
        """增强个性化内容"""
        enhanced = base_template.copy()
        
        # 根据年龄调整建议
        if age:
            age_specific_advice = self._get_age_specific_advice(base_template, age)
            if age_specific_advice:
                enhanced["age_specific_advice"] = age_specific_advice
        
        # 根据性别调整内容
        if gender:
            gender_specific_content = self._get_gender_specific_content(base_template, gender)
            if gender_specific_content:
                enhanced["gender_specific_content"] = gender_specific_content
        
        # 添加生成时间
        enhanced["generated_at"] = datetime.now().isoformat()
        
        return enhanced
    
    def _combine_fortune_content(self, ten_god_fortune: Dict[str, Any], 
                               seasonal_fortune: Dict[str, Any],
                               wuxing_advice: Dict[str, Any],
                               age: int = None, gender: str = None) -> Dict[str, Any]:
        """组合运势内容"""
        combined = {
            "ten_god_analysis": ten_god_fortune,
            "seasonal_guidance": seasonal_fortune,
            "wuxing_balance": wuxing_advice,
            "generated_at": datetime.now().isoformat()
        }
        
        # 生成综合建议
        comprehensive_advice = self._generate_comprehensive_advice(
            ten_god_fortune, seasonal_fortune, wuxing_advice, age, gender
        )
        combined["comprehensive_advice"] = comprehensive_advice
        
        return combined
    
    def _generate_comprehensive_advice(self, ten_god_fortune: Dict[str, Any],
                                     seasonal_fortune: Dict[str, Any],
                                     wuxing_advice: Dict[str, Any],
                                     age: int = None, gender: str = None) -> List[str]:
        """生成综合建议"""
        advice_list = []
        
        # 从十神运势中提取建议
        if "正面影响" in ten_god_fortune:
            advice_list.append(ten_god_fortune["正面影响"].get("基础描述", ""))
        elif "负面影响" in ten_god_fortune:
            advice_list.append(ten_god_fortune["负面影响"].get("基础描述", ""))
        
        # 从节气运势中提取建议
        if seasonal_fortune.get("career_guidance"):
            advice_list.append(seasonal_fortune["career_guidance"])
        
        # 从五行调和中提取建议
        if wuxing_advice.get("生活建议"):
            advice_list.append(wuxing_advice["生活建议"])
        
        # 根据年龄和性别调整建议
        if age and age < 25:
            advice_list.append("年轻人要注重学习和成长，为未来打好基础。")
        elif age and age > 40:
            advice_list.append("要注重经验传承和健康保养，平衡工作与生活。")
        
        return [advice for advice in advice_list if advice]
    
    def _get_age_specific_advice(self, template: Dict[str, Any], age: int) -> str:
        """获取年龄特定建议"""
        if age < 25:
            return "年轻时期是学习和积累的重要阶段，要多接受新事物，建立良好的基础。"
        elif age < 40:
            return "正值事业发展的黄金期，要抓住机会，勇于承担责任和挑战。"
        else:
            return "人生阅历丰富，要注重传承和分享，同时关注健康和家庭。"
    
    def _get_gender_specific_content(self, template: Dict[str, Any], gender: str) -> str:
        """获取性别特定内容"""
        if gender == "male":
            return "作为男性，要在承担责任的同时保持理性思考，在事业上展现担当。"
        elif gender == "female":
            return "作为女性，要在追求事业的同时保持内心的柔韧，发挥独特的魅力和智慧。"
        return ""
    
    def _get_default_personality_template(self, day_gan: str) -> Dict[str, Any]:
        """获取默认个性化模板"""
        gan_traits = {
            "甲": {"base_description": "您具有甲木的特质，性格直爽坚韧，具备领导潜质..."},
            "乙": {"base_description": "您具有乙木的特质，性格温和细腻，善于协调..."},
            "丙": {"base_description": "您具有丙火的特质，性格热情开朗，富有活力..."},
            "丁": {"base_description": "您具有丁火的特质，性格温和细致，具有艺术天赋..."},
            "戊": {"base_description": "您具有戊土的特质，性格稳重踏实，值得信赖..."},
            "己": {"base_description": "您具有己土的特质，性格温和包容，善于照顾他人..."},
            "庚": {"base_description": "您具有庚金的特质，性格坚毅果断，具有正义感..."},
            "辛": {"base_description": "您具有辛金的特质，性格细腻敏感，有艺术品味..."},
            "壬": {"base_description": "您具有壬水的特质，性格灵活机智，适应能力强..."},
            "癸": {"base_description": "您具有癸水的特质，性格温柔体贴，富有同情心..."}
        }
        
        return gan_traits.get(day_gan, {"base_description": "您的性格独特，具有自己的特色和优势..."})
    
    def _get_fallback_personality_analysis(self, day_gan: str) -> Dict[str, Any]:
        """获取后备个性化分析"""
        return {
            "base_description": f"您具有{day_gan}的特质，性格独特，具有自己的优势和特点。",
            "strengths": ["独特个性", "适应能力"],
            "weaknesses": ["需要更多发展"],
            "life_advice": "要充分发挥自己的特长，在实践中不断成长和完善。",
            "generated_at": datetime.now().isoformat()
        }
    
    def _get_fallback_fortune_analysis(self, ten_god: str) -> Dict[str, Any]:
        """获取后备运势分析"""
        return {
            "ten_god_analysis": {
                "基础描述": f"今日{ten_god}当值，要注意把握机会，保持积极心态。"
            },
            "comprehensive_advice": [
                "保持积极乐观的心态，面对挑战时要冷静应对。",
                "注意身体健康，保持规律的作息和饮食习惯。",
                "在人际关系中要真诚待人，建立良好的合作关系。"
            ],
            "generated_at": datetime.now().isoformat()
        }
    
    def _generate_cache_key(self, analysis_type: str, *args) -> str:
        """生成缓存键"""
        key_string = f"{analysis_type}_{'-'.join(str(arg) for arg in args if arg is not None)}"
        return hashlib.md5(key_string.encode('utf-8')).hexdigest()
    
    def clear_cache(self):
        """清空缓存"""
        self.cache.clear()
        self.logger.info("缓存已清空")
    
    def get_template_info(self) -> Dict[str, Any]:
        """获取模板库信息"""
        return {
            "personality_templates": {
                "version": self.personality_templates.get("version", "unknown"),
                "template_count": self.personality_templates.get("template_count", 0),
                "dimensions": self.personality_templates.get("dimensions", [])
            },
            "fortune_templates": {
                "version": self.fortune_templates.get("version", "unknown"),
                "template_count": self.fortune_templates.get("template_count", 0),
                "dimensions": self.fortune_templates.get("dimensions", [])
            },
            "cache_size": len(self.cache),
            "last_updated": datetime.now().isoformat()
        }
    
    def validate_templates(self) -> Dict[str, Any]:
        """验证模板库完整性"""
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "statistics": {}
        }
        
        try:
            # 验证个性化模板
            personality_matrix = self.personality_templates.get("personality_matrix", {})
            if not personality_matrix:
                validation_result["errors"].append("个性化模板库为空")
                validation_result["is_valid"] = False
            
            # 统计个性化模板数量
            total_personality_templates = 0
            for gan in personality_matrix:
                for pattern in personality_matrix[gan]:
                    if isinstance(personality_matrix[gan][pattern], dict):
                        total_personality_templates += len(personality_matrix[gan][pattern])
            
            validation_result["statistics"]["personality_templates"] = total_personality_templates
            
            # 验证运势模板
            fortune_matrix = self.fortune_templates.get("fortune_analysis_matrix", {})
            if not fortune_matrix:
                validation_result["errors"].append("运势模板库为空")
                validation_result["is_valid"] = False
            
            # 统计运势模板数量
            total_fortune_templates = 0
            for category in fortune_matrix:
                if isinstance(fortune_matrix[category], dict):
                    total_fortune_templates += len(fortune_matrix[category])
            
            validation_result["statistics"]["fortune_templates"] = total_fortune_templates
            
            if total_personality_templates < 50:
                validation_result["warnings"].append(f"个性化模板数量较少: {total_personality_templates}")
            
            if total_fortune_templates < 10:
                validation_result["warnings"].append(f"运势模板数量较少: {total_fortune_templates}")
                
        except Exception as e:
            validation_result["errors"].append(f"验证过程中出现错误: {e}")
            validation_result["is_valid"] = False
        
        return validation_result

# 全局内容管理器实例
content_manager = None

def get_content_manager() -> EnhancedContentManager:
    """获取全局内容管理器实例"""
    global content_manager
    if content_manager is None:
        content_manager = EnhancedContentManager()
    return content_manager

def reload_templates():
    """重新加载模板数据"""
    global content_manager
    if content_manager is not None:
        content_manager._load_templates()
        content_manager.clear_cache()
        content_manager.logger.info("模板数据已重新加载")

if __name__ == "__main__":
    # 测试代码
    import sys
    import logging
    
    # 配置日志
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # 创建内容管理器
    manager = EnhancedContentManager()
    
    # 验证模板
    validation = manager.validate_templates()
    print("模板验证结果:", validation)
    
    # 获取模板信息
    info = manager.get_template_info()
    print("模板信息:", info)
    
    # 测试个性化分析
    try:
        personality_analysis = manager.get_enhanced_personality_analysis(
            day_gan="甲", pattern="正官格", strength="身旺", age=30, gender="male"
        )
        print("个性化分析测试:", personality_analysis.get("base_description", "无描述"))
    except Exception as e:
        print(f"个性化分析测试失败: {e}")
    
    # 测试运势分析
    try:
        fortune_analysis = manager.get_enhanced_fortune_analysis(
            ten_god="比肩",
            seasonal_info={"current_term": "立春"},
            wuxing_strength={"木": 3, "火": 2, "土": 1, "金": 1, "水": 1},
            age=30,
            gender="male"
        )
        print("运势分析测试:", len(fortune_analysis.get("comprehensive_advice", [])), "条建议")
    except Exception as e:
        print(f"运势分析测试失败: {e}")
