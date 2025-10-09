"""
企业级汉字数据库 - 个性化起名系统
支持多维度个性化推荐的智能字库系统 - JSON外置数据版本
"""

import json
import os
from typing import Dict, List, Tuple, Optional, Any

class EnhancedCharDatabase:
    """增强汉字数据库 - 支持个性化推荐和JSON外置数据"""
    
    def __init__(self, data_dir: str = None):
        """
        初始化字库数据库
        
        Args:
            data_dir: 数据目录路径，默认为 backend/data
        """
        if data_dir is None:
            # 获取当前文件所在目录的上级目录中的data文件夹
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(os.path.dirname(current_dir), 'data')
        
        self.data_dir = data_dir
        self.chars_dir = os.path.join(data_dir, 'chars')
        
        # 数据缓存
        self.char_database = {}
        self.meaning_tags = {}
        self.meaning_index = {}
        
        # 个性化推荐系统
        self.user_preference_profiles = {}
        self.semantic_network = {}
        self.cultural_context_mapping = {}
        
        # 加载所有数据
        self._load_all_databases()
        self._initialize_recommendation_system()
    
    def _load_all_databases(self):
        """加载所有字库数据"""
        try:
            # 加载主字库
            self._load_main_chars()
            
            # 加载字义标签映射
            self._load_meaning_tags()
            
            # 构建字义搜索索引
            self._build_meaning_index()
            
            print(f"✅ 字库加载成功: {len(self.char_database)} 个字符")
            
        except Exception as e:
            print(f"❌ 字库加载失败: {e}")
            # 如果JSON加载失败，使用内置的基础字库
            self._load_fallback_database()
    
    def _load_main_chars(self):
        """加载主字库"""
        chars_file = os.path.join(self.chars_dir, 'chars_main.json')
        
        if os.path.exists(chars_file):
            with open(chars_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.char_database = data.get('chars', {})
                print(f"📚 主字库加载: {len(self.char_database)} 个字符")
        else:
            print(f"⚠️  主字库文件不存在: {chars_file}")
    
    def _load_meaning_tags(self):
        """加载字义标签映射"""
        tags_file = os.path.join(self.chars_dir, 'chars_meaning_tags.json')
        
        if os.path.exists(tags_file):
            with open(tags_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.meaning_tags = data.get('semantic_mapping', {})
                print(f"🏷️  字义标签加载: {len(self.meaning_tags)} 个类别")
        else:
            print(f"⚠️  字义标签文件不存在: {tags_file}")
    
    def _build_meaning_index(self):
        """构建字义搜索索引"""
        self.meaning_index = {}
        
        # 从字库中构建含义索引
        for char, info in self.char_database.items():
            meanings = info.get('meanings', [])
            semantic_tags = info.get('semantic_tags', [])
            
            # 为每个含义建立索引
            for meaning in meanings:
                if meaning not in self.meaning_index:
                    self.meaning_index[meaning] = []
                self.meaning_index[meaning].append((char, info))
            
            # 为每个语义标签建立索引
            for tag in semantic_tags:
                if tag not in self.meaning_index:
                    self.meaning_index[tag] = []
                self.meaning_index[tag].append((char, info))
        
        print(f"🔍 搜索索引构建: {len(self.meaning_index)} 个关键词")
    
    def _initialize_recommendation_system(self):
        """初始化个性化推荐系统"""
        print("🤖 初始化智能推荐系统...")
        
        # 构建语义网络
        self._build_semantic_network()
        
        # 构建文化背景映射
        self._build_cultural_context_mapping()
        
        # 初始化用户偏好模板
        self._initialize_preference_templates()
        
        print("✅ 智能推荐系统初始化完成")
    
    def _build_semantic_network(self):
        """构建字符语义网络"""
        self.semantic_network = {
            # 美好品德类
            '品德': {
                'core_chars': ['仁', '义', '礼', '智', '信', '德', '善', '良'],
                'related_chars': ['贤', '君', '圣', '正', '直', '诚', '真'],
                'semantic_weight': 0.9
            },
            
            # 智慧才学类
            '智慧': {
                'core_chars': ['智', '慧', '明', '睿', '博', '学', '文', '书'],
                'related_chars': ['哲', '思', '理', '颖', '敏', '聪', '才'],
                'semantic_weight': 0.85
            },
            
            # 自然美景类
            '自然': {
                'core_chars': ['山', '水', '云', '月', '星', '日', '风', '雨'],
                'related_chars': ['江', '海', '河', '溪', '岩', '石', '林', '森'],
                'semantic_weight': 0.8
            },
            
            # 花草植物类
            '花草': {
                'core_chars': ['花', '草', '莲', '梅', '兰', '竹', '菊', '荷'],
                'related_chars': ['芳', '香', '蕊', '叶', '枝', '根', '茎'],
                'semantic_weight': 0.75
            },
            
            # 珍宝美玉类
            '珍宝': {
                'core_chars': ['玉', '珠', '宝', '金', '银', '钻', '翡', '琼'],
                'related_chars': ['瑜', '琪', '璟', '璇', '瑶', '琦', '瓒', '琰'],
                'semantic_weight': 0.8
            },
            
            # 光明温暖类
            '光明': {
                'core_chars': ['光', '明', '亮', '辉', '耀', '焰', '炎', '阳'],
                'related_chars': ['晨', '曦', '晖', '煜', '烨', '灿', '晴'],
                'semantic_weight': 0.85
            },
            
            # 成功进取类
            '成功': {
                'core_chars': ['成', '功', '达', '胜', '凯', '赢', '进', '升'],
                'related_chars': ['立', '建', '创', '拓', '展', '越', '超'],
                'semantic_weight': 0.9
            },
            
            # 和谐安宁类
            '和谐': {
                'core_chars': ['和', '安', '宁', '平', '泰', '康', '健', '福'],
                'related_chars': ['稳', '顺', '吉', '祥', '乐', '喜', '悦'],
                'semantic_weight': 0.8
            }
        }
    
    def _build_cultural_context_mapping(self):
        """构建文化背景映射"""
        self.cultural_context_mapping = {
            # 诗经典故
            '诗经': {
                'chars': ['关', '雎', '窈', '窕', '君', '子', '好', '逑', '蒹', '葭', '白', '露', '所', '谓', '伊', '人'],
                'style': 'classical',
                'era': 'ancient',
                'cultural_weight': 1.0
            },
            
            # 论语经典
            '论语': {
                'chars': ['学', '而', '时', '习', '不', '亦', '说', '乎', '君', '子', '德', '风', '小', '人', '德', '草'],
                'style': 'philosophical',
                'era': 'ancient',
                'cultural_weight': 0.95
            },
            
            # 唐诗风韵
            '唐诗': {
                'chars': ['春', '眠', '不', '觉', '晓', '处', '处', '闻', '啼', '鸟', '夜', '来', '风', '雨', '声'],
                'style': 'poetic',
                'era': 'classical',
                'cultural_weight': 0.9
            },
            
            # 宋词婉约
            '宋词': {
                'chars': ['寻', '寻', '觅', '觅', '冷', '冷', '清', '清', '凄', '凄', '惨', '惨', '戚', '戚'],
                'style': 'lyrical',
                'era': 'classical',
                'cultural_weight': 0.85
            },
            
            # 现代时尚
            '现代': {
                'chars': ['梓', '浩', '然', '轩', '瑞', '欣', '宇', '语', '嫣', '若', '汐', '晗'],
                'style': 'contemporary',
                'era': 'modern',
                'cultural_weight': 0.8
            }
        }
    
    def _initialize_preference_templates(self):
        """初始化用户偏好模板"""
        self.user_preference_profiles = {
            # 古典雅致型
            'classical_elegant': {
                'cultural_preference': ['classical', 'ancient'],
                'era_weights': {'ancient': 0.4, 'classical': 0.4, 'modern': 0.2, 'contemporary': 0.1},
                'style_keywords': ['雅致', '清雅', '温润', '儒雅', '高洁'],
                'preferred_sources': ['诗经', '论语', '唐诗', '宋词'],
                'avoid_trends': ['热门', '流行'],
                'semantic_preferences': ['品德', '智慧', '自然', '珍宝']
            },
            
            # 现代时尚型
            'modern_trendy': {
                'cultural_preference': ['modern', 'contemporary'],
                'era_weights': {'contemporary': 0.5, 'modern': 0.3, 'classical': 0.2, 'ancient': 0.1},
                'style_keywords': ['时尚', '流行', '个性', '独特', '现代'],
                'preferred_sources': ['现代'],
                'embrace_trends': ['热门', '新兴', '流行'],
                'semantic_preferences': ['成功', '光明', '智慧', '和谐']
            },
            
            # 平衡中庸型
            'balanced_moderate': {
                'cultural_preference': ['classical', 'modern'],
                'era_weights': {'classical': 0.3, 'modern': 0.3, 'contemporary': 0.25, 'ancient': 0.15},
                'style_keywords': ['平和', '中庸', '适中', '稳重', '大方'],
                'preferred_sources': ['论语', '现代'],
                'balanced_approach': True,
                'semantic_preferences': ['品德', '和谐', '智慧', '成功']
            },
            
            # 文艺清新型
            'literary_fresh': {
                'cultural_preference': ['classical', 'contemporary'],
                'era_weights': {'classical': 0.4, 'contemporary': 0.3, 'modern': 0.2, 'ancient': 0.1},
                'style_keywords': ['清新', '文艺', '诗意', '浪漫', '唯美'],
                'preferred_sources': ['唐诗', '宋词', '现代'],
                'semantic_preferences': ['自然', '花草', '光明', '珍宝']
            },
            
            # 简约大气型
            'simple_grand': {
                'cultural_preference': ['modern', 'classical'],
                'era_weights': {'modern': 0.4, 'classical': 0.3, 'contemporary': 0.2, 'ancient': 0.1},
                'style_keywords': ['简约', '大气', '干净', '利落', '明朗'],
                'preferred_sources': ['论语', '现代'],
                'avoid_complexity': True,
                'semantic_preferences': ['成功', '光明', '智慧', '和谐']
            }
        }
    
    def create_user_preference_profile(self, user_inputs):
        """
        根据用户输入创建个性化偏好档案
        
        Args:
            user_inputs: 用户偏好输入字典，包含：
                - style_preference: 风格偏好 ('classical', 'modern', 'balanced', 'literary', 'simple')
                - cultural_background: 文化背景偏好
                - popularity_preference: 流行度偏好 ('popular', 'moderate', 'unique')
                - meaning_keywords: 期望含义关键词列表
                - avoid_keywords: 避免的关键词列表
                - gender: 性别偏好
                - era_preference: 时代偏好
        
        Returns:
            个性化用户档案字典
        """
        style = user_inputs.get('style_preference', 'balanced')
        
        # 选择基础模板
        template_mapping = {
            'classical': 'classical_elegant',
            'modern': 'modern_trendy', 
            'balanced': 'balanced_moderate',
            'literary': 'literary_fresh',
            'simple': 'simple_grand'
        }
        
        base_template = self.user_preference_profiles.get(
            template_mapping.get(style, 'balanced_moderate')
        ).copy()
        
        # 根据用户输入定制化
        user_profile = base_template.copy()
        
        # 更新文化背景偏好
        if 'cultural_background' in user_inputs:
            user_profile['cultural_preference'] = user_inputs['cultural_background']
        
        # 更新流行度偏好权重
        popularity_pref = user_inputs.get('popularity_preference', 'moderate')
        if popularity_pref == 'popular':
            user_profile['popularity_weights'] = {'high': 0.6, 'medium': 0.3, 'low': 0.1}
        elif popularity_pref == 'unique':
            user_profile['popularity_weights'] = {'low': 0.5, 'medium': 0.3, 'high': 0.2}
        else:  # moderate
            user_profile['popularity_weights'] = {'medium': 0.5, 'high': 0.3, 'low': 0.2}
        
        # 添加自定义语义偏好
        if 'meaning_keywords' in user_inputs:
            user_profile['custom_meanings'] = user_inputs['meaning_keywords']
        
        # 添加避免关键词
        if 'avoid_keywords' in user_inputs:
            user_profile['avoid_meanings'] = user_inputs['avoid_keywords']
        
        # 性别偏好
        if 'gender' in user_inputs:
            user_profile['gender_preference'] = user_inputs['gender']
        
        # 时代偏好微调
        if 'era_preference' in user_inputs:
            era_pref = user_inputs['era_preference']
            if era_pref in user_profile['era_weights']:
                # 增强偏好时代的权重
                user_profile['era_weights'][era_pref] += 0.2
                # 重新归一化
                total_weight = sum(user_profile['era_weights'].values())
                for era in user_profile['era_weights']:
                    user_profile['era_weights'][era] /= total_weight
        
        return user_profile
    
    def get_personalized_recommendations(self, wuxing, user_profile, count=20):
        """
        基于用户偏好档案的个性化推荐
        
        Args:
            wuxing: 需要的五行属性
            user_profile: 用户偏好档案
            count: 返回推荐数量
        
        Returns:
            个性化推荐字符列表，按匹配度排序
        """
        print(f"🎯 个性化推荐: 五行={wuxing}, 用户档案类型={user_profile.get('style_keywords', ['未知'])[0]}")
        
        candidates = []
        
        # 获取五行匹配的所有字符
        for char, info in self.char_database.items():
            if info.get('wuxing') == wuxing and info.get('suitable_for_name', True):
                # 性别筛选
                gender_pref = user_profile.get('gender_preference')
                if gender_pref and info.get('gender') not in [gender_pref, 'neutral']:
                    continue
                
                # 计算个性化匹配分数
                score = self._calculate_personalized_score(char, info, user_profile)
                candidates.append((char, info, score))
        
        # 按分数排序
        candidates.sort(key=lambda x: x[2], reverse=True)
        
        # 多样性调整：确保推荐结果的多样性
        diverse_recommendations = self._ensure_diversity(candidates, user_profile)
        
        result = [(char, info) for char, info, _ in diverse_recommendations[:count]]
        
        if result:
            top_chars = [char for char, _ in result[:5]]
            scores = [score for _, _, score in diverse_recommendations[:5]]
            print(f"🏆 个性化推荐前5: {', '.join(top_chars)} (分数: {[f'{s:.1f}' for s in scores]})")
        
        return result
    
    def _calculate_personalized_score(self, char, info, user_profile):
        """计算字符的个性化匹配分数"""
        score = 50  # 基础分数
        
        # 1. 时代偏好匹配 (权重30%)
        era_weights = user_profile.get('era_weights', {})
        char_era = info.get('era', 'classical')
        era_score = era_weights.get(char_era, 0.1) * 30
        score += era_score
        
        # 2. 流行度偏好匹配 (权重20%)
        popularity_weights = user_profile.get('popularity_weights', {'medium': 0.5, 'high': 0.3, 'low': 0.2})
        char_popularity = info.get('popularity', 'medium')
        popularity_score = popularity_weights.get(char_popularity, 0.3) * 20
        score += popularity_score
        
        # 3. 语义偏好匹配 (权重25%)
        semantic_preferences = user_profile.get('semantic_preferences', [])
        semantic_score = 0
        for semantic_category in semantic_preferences:
            if semantic_category in self.semantic_network:
                network = self.semantic_network[semantic_category]
                if char in network['core_chars']:
                    semantic_score += network['semantic_weight'] * 15
                elif char in network['related_chars']:
                    semantic_score += network['semantic_weight'] * 8
        score += min(semantic_score, 25)  # 最多25分
        
        # 4. 文化背景匹配 (权重15%)
        preferred_sources = user_profile.get('preferred_sources', [])
        cultural_score = 0
        char_source = info.get('source', '')
        if char_source in preferred_sources:
            cultural_score += 15
        elif any(source in preferred_sources for source in ['诗经', '论语', '唐诗', '宋词'] if char_source):
            cultural_score += 8
        score += cultural_score
        
        # 5. 自定义含义匹配 (权重10%)
        custom_meanings = user_profile.get('custom_meanings', [])
        meaning_score = 0
        char_meanings = info.get('meanings', [info.get('meaning', '')])
        for custom_meaning in custom_meanings:
            for char_meaning in char_meanings:
                if custom_meaning in char_meaning:
                    meaning_score += 5
        score += min(meaning_score, 10)
        
        # 6. 避免关键词惩罚
        avoid_meanings = user_profile.get('avoid_meanings', [])
        for avoid_meaning in avoid_meanings:
            for char_meaning in char_meanings:
                if avoid_meaning in char_meaning:
                    score -= 20
        
        # 7. 特殊偏好加分
        if user_profile.get('embrace_trends') and info.get('trend') == 'hot':
            score += 10
        elif user_profile.get('avoid_trends') and info.get('trend') == 'hot':
            score -= 15
        
        if user_profile.get('avoid_complexity') and info.get('stroke', 8) > 15:
            score -= 5
        
        return max(score, 0)  # 确保分数不为负
    
    def _ensure_diversity(self, candidates, user_profile):
        """确保推荐结果的多样性"""
        if len(candidates) <= 10:
            return candidates
        
        diverse_results = []
        era_counts = {}
        popularity_counts = {}
        stroke_ranges = {'simple': 0, 'medium': 0, 'complex': 0}
        
        for char, info, score in candidates:
            era = info.get('era', 'classical')
            popularity = info.get('popularity', 'medium')
            stroke = info.get('stroke', 8)
            
            # 笔画复杂度分类
            if stroke <= 8:
                stroke_range = 'simple'
            elif stroke <= 15:
                stroke_range = 'medium'
            else:
                stroke_range = 'complex'
            
            # 多样性检查
            era_limit = 8 if len(candidates) > 30 else 5
            popularity_limit = 10 if len(candidates) > 30 else 7
            stroke_limit = 8 if len(candidates) > 30 else 5
            
            if (era_counts.get(era, 0) < era_limit and 
                popularity_counts.get(popularity, 0) < popularity_limit and
                stroke_ranges.get(stroke_range, 0) < stroke_limit):
                
                diverse_results.append((char, info, score))
                era_counts[era] = era_counts.get(era, 0) + 1
                popularity_counts[popularity] = popularity_counts.get(popularity, 0) + 1
                stroke_ranges[stroke_range] = stroke_ranges.get(stroke_range, 0) + 1
        
        # 如果多样性筛选后结果太少，补充高分字符
        if len(diverse_results) < 15:
            remaining_candidates = [c for c in candidates if c not in diverse_results]
            diverse_results.extend(remaining_candidates[:15-len(diverse_results)])
        
        return diverse_results
    
    def _load_fallback_database(self):
        """当JSON文件加载失败时，使用内置的基础字库"""
        print("📦 加载内置基础字库...")
        
        self.char_database = {
            # =============== 木属性字 ===============
            # 男性木属性字
            '杰': {'stroke': 12, 'wuxing': '木', 'meaning': '杰出，英才', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '强': {'stroke': 12, 'wuxing': '木', 'meaning': '强壮，有力', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '康': {'stroke': 11, 'wuxing': '木', 'meaning': '健康，安康', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '凯': {'stroke': 12, 'wuxing': '木', 'meaning': '凯旋，胜利', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '林': {'stroke': 8, 'wuxing': '木', 'meaning': '森林，茂盛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '森': {'stroke': 12, 'wuxing': '木', 'meaning': '森林，众多', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '荣': {'stroke': 14, 'wuxing': '木', 'meaning': '荣耀，兴盛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '梁': {'stroke': 11, 'wuxing': '木', 'meaning': '桥梁，栋梁', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '彬': {'stroke': 11, 'wuxing': '木', 'meaning': '彬彬，文雅', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '梓': {'stroke': 11, 'wuxing': '木', 'meaning': '梓树，故乡', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '轩': {'stroke': 10, 'wuxing': '木', 'meaning': '轩昂，高举', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '毅': {'stroke': 15, 'wuxing': '木', 'meaning': '毅力，坚强', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '奇': {'stroke': 8, 'wuxing': '木', 'meaning': '奇特，独特', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '启': {'stroke': 11, 'wuxing': '木', 'meaning': '启发，开启', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '俊': {'stroke': 9, 'wuxing': '木', 'meaning': '俊秀，英俊', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '君': {'stroke': 7, 'wuxing': '木', 'meaning': '君子，高贵', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '景': {'stroke': 12, 'wuxing': '木', 'meaning': '景色，前景', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '建': {'stroke': 9, 'wuxing': '木', 'meaning': '建设，建立', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '健': {'stroke': 11, 'wuxing': '木', 'meaning': '健康，强壮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '凡': {'stroke': 3, 'wuxing': '木', 'meaning': '不凡，超越', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            
            # 女性木属性字
            '芳': {'stroke': 10, 'wuxing': '木', 'meaning': '芳香，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '花': {'stroke': 8, 'wuxing': '木', 'meaning': '花朵，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '莉': {'stroke': 13, 'wuxing': '木', 'meaning': '茉莉，清香', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '雅': {'stroke': 12, 'wuxing': '木', 'meaning': '雅致，优雅', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '欣': {'stroke': 8, 'wuxing': '木', 'meaning': '欣喜，快乐', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '梅': {'stroke': 11, 'wuxing': '木', 'meaning': '梅花，坚强', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '萱': {'stroke': 15, 'wuxing': '木', 'meaning': '萱草，忘忧', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '薇': {'stroke': 19, 'wuxing': '木', 'meaning': '蔷薇，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'wei'},
            '茜': {'stroke': 12, 'wuxing': '木', 'meaning': '茜草，红色', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '若': {'stroke': 11, 'wuxing': '木', 'meaning': '如若，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '菲': {'stroke': 14, 'wuxing': '木', 'meaning': '菲菲，芳香', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '蕊': {'stroke': 18, 'wuxing': '木', 'meaning': '花蕊，精华', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '苒': {'stroke': 11, 'wuxing': '木', 'meaning': '苒苒，柔美', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            '筱': {'stroke': 13, 'wuxing': '木', 'meaning': '细竹，秀气', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            '兰': {'stroke': 23, 'wuxing': '木', 'meaning': '兰花，高雅', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '茉': {'stroke': 11, 'wuxing': '木', 'meaning': '茉莉，香气', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '芸': {'stroke': 10, 'wuxing': '木', 'meaning': '芸香，学问', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '蕾': {'stroke': 19, 'wuxing': '木', 'meaning': '花蕾，希望', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '菊': {'stroke': 14, 'wuxing': '木', 'meaning': '菊花，高洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            
            # =============== 火属性字 ===============
            # 男性火属性字
            '炎': {'stroke': 8, 'wuxing': '火', 'meaning': '火焰，热情', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '明': {'stroke': 8, 'wuxing': '火', 'meaning': '明亮，聪明', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '辉': {'stroke': 15, 'wuxing': '火', 'meaning': '光辉，辉煌', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '阳': {'stroke': 17, 'wuxing': '火', 'meaning': '阳光，积极', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '旭': {'stroke': 6, 'wuxing': '火', 'meaning': '旭日，希望', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '炳': {'stroke': 9, 'wuxing': '火', 'meaning': '光明，显著', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '煜': {'stroke': 13, 'wuxing': '火', 'meaning': '照耀，光明', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            '晨': {'stroke': 11, 'wuxing': '火', 'meaning': '早晨，新生', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '智': {'stroke': 12, 'wuxing': '火', 'meaning': '智慧，聪明', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            '达': {'stroke': 16, 'wuxing': '火', 'meaning': '通达，成功', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '亮': {'stroke': 9, 'wuxing': '火', 'meaning': '明亮，光明', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '焱': {'stroke': 12, 'wuxing': '火', 'meaning': '火花，光芒', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'low', 'rarity': 'rare', 'era': 'ancient', 'tone_category': 'ze'},
            '晓': {'stroke': 16, 'wuxing': '火', 'meaning': '拂晓，明白', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '昊': {'stroke': 8, 'wuxing': '火', 'meaning': '广大，天空', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '烨': {'stroke': 16, 'wuxing': '火', 'meaning': '火光，光辉', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            
            # 女性火属性字
            '丹': {'stroke': 4, 'wuxing': '火', 'meaning': '丹红，真诚', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '晴': {'stroke': 12, 'wuxing': '火', 'meaning': '晴朗，开朗', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '暖': {'stroke': 13, 'wuxing': '火', 'meaning': '温暖，温和', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '灿': {'stroke': 17, 'wuxing': '火', 'meaning': '灿烂，光明', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '焰': {'stroke': 12, 'wuxing': '火', 'meaning': '火焰，热情', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'low', 'rarity': 'uncommon', 'era': 'contemporary', 'tone_category': 'ze'},
            '曦': {'stroke': 20, 'wuxing': '火', 'meaning': '晨光，希望', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ping'},
            '瑾': {'stroke': 16, 'wuxing': '火', 'meaning': '美玉，品德', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            '曼': {'stroke': 11, 'wuxing': '火', 'meaning': '曼妙，柔美', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '黛': {'stroke': 17, 'wuxing': '火', 'meaning': '黛色，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            '娜': {'stroke': 10, 'wuxing': '火', 'meaning': '娜娜，优美', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            
            # =============== 土属性字 ===============
            # 男性土属性字
            '磊': {'stroke': 15, 'wuxing': '土', 'meaning': '磊落，坦荡', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '坤': {'stroke': 8, 'wuxing': '土', 'meaning': '坤地，厚德', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '山': {'stroke': 3, 'wuxing': '土', 'meaning': '山岳，稳重', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '岩': {'stroke': 8, 'wuxing': '土', 'meaning': '岩石，坚强', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '城': {'stroke': 10, 'wuxing': '土', 'meaning': '城市，建设', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '垒': {'stroke': 18, 'wuxing': '土', 'meaning': '垒砌，稳固', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'low', 'rarity': 'uncommon', 'era': 'modern', 'tone_category': 'ze'},
            '培': {'stroke': 11, 'wuxing': '土', 'meaning': '培养，栽培', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '基': {'stroke': 11, 'wuxing': '土', 'meaning': '基础，根本', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '堂': {'stroke': 11, 'wuxing': '土', 'meaning': '堂正，大方', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '圣': {'stroke': 13, 'wuxing': '土', 'meaning': '圣贤，神圣', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            
            # 女性土属性字
            '艳': {'stroke': 24, 'wuxing': '土', 'meaning': '艳丽，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '婉': {'stroke': 11, 'wuxing': '土', 'meaning': '婉约，温柔', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '燕': {'stroke': 16, 'wuxing': '土', 'meaning': '燕子，轻盈', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            '韵': {'stroke': 19, 'wuxing': '土', 'meaning': '韵味，雅致', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '怡': {'stroke': 9, 'wuxing': '土', 'meaning': '怡然，愉悦', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '娅': {'stroke': 11, 'wuxing': '土', 'meaning': '娅姹，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '亚': {'stroke': 8, 'wuxing': '土', 'meaning': '亚洲，次序', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            
            # =============== 金属性字 ===============
            # 男性金属性字
            '鑫': {'stroke': 24, 'wuxing': '金', 'meaning': '兴盛，财富', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '钢': {'stroke': 16, 'wuxing': '金', 'meaning': '钢铁，坚强', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '锋': {'stroke': 15, 'wuxing': '金', 'meaning': '锋利，锐气', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '铭': {'stroke': 14, 'wuxing': '金', 'meaning': '铭记，深刻', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '钧': {'stroke': 12, 'wuxing': '金', 'meaning': '钧天，尊贵', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
            '锐': {'stroke': 15, 'wuxing': '金', 'meaning': '锐利，敏锐', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '钊': {'stroke': 10, 'wuxing': '金', 'meaning': '勉励，鼓舞', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ping'},
            '铸': {'stroke': 22, 'wuxing': '金', 'meaning': '铸造，塑造', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ze'},
            '钰': {'stroke': 13, 'wuxing': '金', 'meaning': '珍宝，宝物', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '铎': {'stroke': 21, 'wuxing': '金', 'meaning': '大铃，警示', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'low', 'rarity': 'rare', 'era': 'ancient', 'tone_category': 'ping'},
            
            # 女性金属性字
            '钰': {'stroke': 13, 'wuxing': '金', 'meaning': '珍宝，宝物', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '银': {'stroke': 14, 'wuxing': '金', 'meaning': '银色，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '钗': {'stroke': 11, 'wuxing': '金', 'meaning': '发钗，装饰', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'low', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
            '镯': {'stroke': 18, 'wuxing': '金', 'meaning': '手镯，装饰', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'low', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'},
            '琛': {'stroke': 13, 'wuxing': '金', 'meaning': '珍宝，宝石', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ping'},
            '瑞': {'stroke': 14, 'wuxing': '金', 'meaning': '祥瑞，吉祥', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '珊': {'stroke': 10, 'wuxing': '金', 'meaning': '珊瑚，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '珍': {'stroke': 10, 'wuxing': '金', 'meaning': '珍贵，宝贵', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '珠': {'stroke': 11, 'wuxing': '金', 'meaning': '珍珠，圆润', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '玉': {'stroke': 5, 'wuxing': '金', 'meaning': '美玉，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            
            # =============== 水属性字 ===============
            # 男性水属性字
            '海': {'stroke': 11, 'wuxing': '水', 'meaning': '大海，广阔', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            '波': {'stroke': 9, 'wuxing': '水', 'meaning': '波浪，起伏', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '涛': {'stroke': 18, 'wuxing': '水', 'meaning': '波涛，壮阔', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '江': {'stroke': 7, 'wuxing': '水', 'meaning': '江河，广大', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '河': {'stroke': 9, 'wuxing': '水', 'meaning': '河流，源远', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '洋': {'stroke': 10, 'wuxing': '水', 'meaning': '海洋，广阔', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'modern', 'tone_category': 'ping'},
            '泽': {'stroke': 17, 'wuxing': '水', 'meaning': '恩泽，润泽', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '浩': {'stroke': 11, 'wuxing': '水', 'meaning': '浩大，广阔', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ze'},
            '润': {'stroke': 16, 'wuxing': '水', 'meaning': '润泽，滋润', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '深': {'stroke': 12, 'wuxing': '水', 'meaning': '深邃，深刻', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            
            # 女性水属性字
            '雨': {'stroke': 8, 'wuxing': '水', 'meaning': '雨水，滋润', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            '雪': {'stroke': 11, 'wuxing': '水', 'meaning': '雪花，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
            '露': {'stroke': 21, 'wuxing': '水', 'meaning': '露珠，清新', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '霜': {'stroke': 17, 'wuxing': '水', 'meaning': '霜花，洁白', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '溪': {'stroke': 14, 'wuxing': '水', 'meaning': '小溪，清澈', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ping'},
            '清': {'stroke': 12, 'wuxing': '水', 'meaning': '清澈，纯净', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
            '洁': {'stroke': 16, 'wuxing': '水', 'meaning': '洁净，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '涵': {'stroke': 12, 'wuxing': '水', 'meaning': '涵养，包容', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'high', 'rarity': 'common', 'era': 'contemporary', 'tone_category': 'ping'},
            '沁': {'stroke': 8, 'wuxing': '水', 'meaning': '沁润，清香', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic', 'popularity': 'medium', 'rarity': 'common', 'era': 'classical', 'tone_category': 'ze'},
            '汐': {'stroke': 7, 'wuxing': '水', 'meaning': '晚潮，潮汐', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'contemporary', 'tone_category': 'ping'},
            '淼': {'stroke': 12, 'wuxing': '水', 'meaning': '水势浩大', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'classic', 'popularity': 'low', 'rarity': 'uncommon', 'era': 'classical', 'tone_category': 'ze'}
        }
    
    def get_char_info(self, char):
        """获取单个字的信息"""
        return self.char_database.get(char, None)
    
    def get_chars_by_wuxing(self, wuxing, gender=None, count=None):
        """根据五行属性获取字"""
        chars = []
        for char, info in self.char_database.items():
            if info['wuxing'] == wuxing and info['suitable_for_name']:
                if gender is None or info['gender'] == gender or info['gender'] == 'neutral':
                    chars.append((char, info))
        
        # 按流行度和时代特征排序
        def sort_key(item):
            char, info = item
            popularity_score = {'high': 3, 'medium': 2, 'low': 1}.get(info['popularity'], 1)
            era_score = {'contemporary': 4, 'modern': 3, 'classical': 2, 'ancient': 1}.get(info['era'], 1)
            return popularity_score + era_score
        
        chars.sort(key=sort_key, reverse=True)
        
        if count:
            chars = chars[:count]
        
        return chars
    
    def get_chars_by_preferences(self, wuxing, gender=None, cultural_level=None, 
                                popularity=None, rarity=None, era=None, count=None):
        """根据个性化偏好获取字"""
        chars = []
        for char, info in self.char_database.items():
            if info['wuxing'] == wuxing and info['suitable_for_name']:
                # 性别筛选
                if gender and info['gender'] != gender and info['gender'] != 'neutral':
                    continue
                
                # 文化层次筛选
                if cultural_level and info['cultural_level'] != cultural_level:
                    continue
                
                # 流行度筛选
                if popularity and info['popularity'] != popularity:
                    continue
                
                # 稀有度筛选  
                if rarity and info['rarity'] != rarity:
                    continue
                
                # 时代特征筛选
                if era and info['era'] != era:
                    continue
                
                chars.append((char, info))
        
        # 智能排序
        def smart_sort_key(item):
            char, info = item
            score = 0
            
            # 流行度权重
            popularity_weights = {'high': 5, 'medium': 3, 'low': 1}
            score += popularity_weights.get(info['popularity'], 1)
            
            # 时代特征权重
            era_weights = {'contemporary': 4, 'modern': 3, 'classical': 2, 'ancient': 1}
            score += era_weights.get(info['era'], 1)
            
            # 稀有度权重（稀有的字加分较少）
            rarity_weights = {'common': 3, 'uncommon': 2, 'rare': 1}
            score += rarity_weights.get(info['rarity'], 1)
            
            return score
        
        chars.sort(key=smart_sort_key, reverse=True)
        
        if count:
            chars = chars[:count]
        
        return chars
    
    def search_chars_by_meaning(self, keyword, wuxing=None, gender=None, count=None):
        """
        智能字义搜索 - 支持精确匹配、同义词和模糊搜索
        
        Args:
            keyword: 搜索关键词
            wuxing: 五行筛选
            gender: 性别筛选
            count: 返回结果数量限制
        
        Returns:
            按相关性排序的字符列表，并统一数据结构
        """
        print(f"🔍 智能搜索关键词: '{keyword}'")
        
        search_results = []
        
        # 1. 精确匹配 - 直接从meaning_index搜索
        exact_matches = self._exact_meaning_search(keyword)
        for char, info, relevance in exact_matches:
            if self._filter_char(info, wuxing, gender):
                # 统一数据结构
                normalized_info = self._normalize_char_info(char, info)
                search_results.append((char, normalized_info, relevance * 1.0))  # 最高权重
        
        # 2. 同义词搜索 - 使用字义标签映射
        synonym_matches = self._synonym_meaning_search(keyword)
        for char, info, relevance in synonym_matches:
            if self._filter_char(info, wuxing, gender):
                # 避免重复
                if not any(char == result[0] for result in search_results):
                    normalized_info = self._normalize_char_info(char, info)
                    search_results.append((char, normalized_info, relevance * 0.8))  # 次高权重
        
        # 3. 模糊搜索 - 包含关键词的含义
        fuzzy_matches = self._fuzzy_meaning_search(keyword)
        for char, info, relevance in fuzzy_matches:
            if self._filter_char(info, wuxing, gender):
                # 避免重复
                if not any(char == result[0] for result in search_results):
                    normalized_info = self._normalize_char_info(char, info)
                    search_results.append((char, normalized_info, relevance * 0.6))  # 较低权重
        
        # 4. 排序和返回
        search_results.sort(key=lambda x: x[2], reverse=True)
        
        result_chars = [(char, info) for char, info, _ in search_results]
        
        print(f"📊 搜索结果: {len(result_chars)} 个字符")
        if result_chars:
            top_chars = [char for char, _ in result_chars[:5]]
            print(f"🏆 前5个结果: {', '.join(top_chars)}")
            # 调试第一个结果的详细信息
            first_char, first_info = result_chars[0]
            print(f"🔍 第一个结果详情: 字={first_char}, 五行={first_info.get('wuxing')}, 含义={first_info.get('meaning')}")
        
        if count:
            result_chars = result_chars[:count]
        
        return result_chars
    
    def _exact_meaning_search(self, keyword):
        """精确含义搜索"""
        results = []
        matches = self.meaning_index.get(keyword, [])
        
        for char, info in matches:
            # 计算精确匹配得分
            relevance = 100
            
            # 流行度加分
            popularity_bonus = {'high': 20, 'medium': 10, 'low': 5}.get(info.get('popularity'), 0)
            relevance += popularity_bonus
            
            results.append((char, info, relevance))
        
        return results
    
    def _synonym_meaning_search(self, keyword):
        """同义词搜索"""
        results = []
        
        # 查找包含此关键词的语义映射
        for main_keyword, mapping in self.meaning_tags.items():
            synonyms = mapping.get('synonyms', [])
            primary_chars = mapping.get('primary_chars', [])
            secondary_chars = mapping.get('secondary_chars', [])
            
            # 如果关键词是同义词
            if keyword in synonyms or keyword == main_keyword:
                # 添加主要字符
                for char in primary_chars:
                    if char in self.char_database:
                        info = self.char_database[char]
                        relevance = 90 + {'high': 15, 'medium': 8, 'low': 3}.get(info.get('popularity'), 0)
                        results.append((char, info, relevance))
                
                # 添加次要字符
                for char in secondary_chars:
                    if char in self.char_database:
                        info = self.char_database[char]
                        relevance = 70 + {'high': 10, 'medium': 5, 'low': 2}.get(info.get('popularity'), 0)
                        results.append((char, info, relevance))
        
        return results
    
    def _fuzzy_meaning_search(self, keyword):
        """模糊搜索 - 在字符的meaning中查找包含关键词的"""
        results = []
        
        for char, info in self.char_database.items():
            if not info.get('suitable_for_name', True):
                continue
            
            # 处理单个meaning字段（字符串）
            meaning = info.get('meaning', '')
            meanings = info.get('meanings', [])  # 兼容复数形式
            semantic_tags = info.get('semantic_tags', [])
            
            # 构建搜索内容列表
            search_contents = []
            if meaning:
                search_contents.append(meaning)
            if meanings:
                search_contents.extend(meanings)
            
            # 在所有含义中搜索
            found_match = False
            for content in search_contents:
                if keyword in content:
                    # 计算位置相关性
                    pos = content.find(keyword)
                    relevance = max(50 - pos * 2, 10)  # 位置越靠前得分越高
                    
                    # 流行度加分
                    popularity_bonus = {'high': 15, 'medium': 8, 'low': 3}.get(info.get('popularity'), 0)
                    relevance += popularity_bonus
                    
                    results.append((char, info, relevance))
                    found_match = True
                    break  # 避免同一个字重复添加
            
            # 在semantic_tags中搜索（如果还没找到匹配）
            if not found_match and keyword in semantic_tags:
                relevance = 60 + {'high': 10, 'medium': 5, 'low': 2}.get(info.get('popularity'), 0)
                results.append((char, info, relevance))
        
        return results
    
    def _normalize_char_info(self, char, info):
        """统一字符信息数据结构，将JSON格式转换为API期望格式"""
        try:
            normalized_info = info.copy() if info else {}
            
            # 处理meanings字段：将数组转换为字符串
            meaning_value = '含义美好'  # 默认值
            
            # 尝试获取meaning值，处理多种数据格式
            if 'meaning' in info and info['meaning']:
                # 如果有meaning字段且不为空
                meaning_value = str(info['meaning'])
            elif 'meanings' in info and info['meanings']:
                # 如果有meanings数组字段
                meanings = info['meanings']
                if isinstance(meanings, list) and len(meanings) > 0:
                    # 取第一个有效含义
                    meaning_value = str(meanings[0]) if meanings[0] else '含义美好'
                    # 如果有多个含义，用逗号连接前3个
                    if len(meanings) > 1:
                        valid_meanings = [str(m) for m in meanings[:3] if m]
                        if valid_meanings:
                            meaning_value = '，'.join(valid_meanings)
                elif isinstance(meanings, str):
                    meaning_value = str(meanings)
            
            # 设置meaning字段
            normalized_info['meaning'] = meaning_value
            
            # 确保所有必需字段都存在，添加更多默认值处理
            required_fields = {
                'wuxing': '木',
                'stroke': 8,
                'gender': 'neutral',
                'cultural_level': 'classic',
                'popularity': 'high',
                'era': 'classical',
                'rarity': 'common',
                'suitable_for_name': True
            }
            
            for field, default_value in required_fields.items():
                if field not in normalized_info or normalized_info[field] is None or normalized_info[field] == '':
                    normalized_info[field] = default_value
            
            # 确保数字字段是数字类型
            if 'stroke' in normalized_info:
                try:
                    normalized_info['stroke'] = int(normalized_info['stroke'])
                except (ValueError, TypeError):
                    normalized_info['stroke'] = 8
            
            return normalized_info
            
        except Exception as e:
            print(f"⚠️  规范化字符信息时出错 '{char}': {str(e)}")
            # 返回最小化的默认信息
            return {
                'char': char,
                'wuxing': '木',
                'meaning': '含义美好',
                'stroke': 8,
                'gender': 'neutral',
                'cultural_level': 'classic',
                'popularity': 'high',
                'era': 'classical',
                'rarity': 'common',
                'suitable_for_name': True
            }
    
    def _filter_char(self, info, wuxing=None, gender=None):
        """字符筛选条件"""
        # 五行筛选
        if wuxing and info.get('wuxing') != wuxing:
            return False
        
        # 性别筛选
        if gender:
            char_gender = info.get('gender')
            if char_gender != gender and char_gender != 'neutral':
                return False
        
        return True
    
    def get_search_suggestions(self, partial_keyword):
        """获取搜索建议"""
        suggestions = []
        
        # 从字义标签中获取建议
        for keyword in self.meaning_tags.keys():
            if keyword.startswith(partial_keyword):
                suggestions.append(keyword)
        
        # 从搜索索引中获取建议
        for keyword in self.meaning_index.keys():
            if keyword.startswith(partial_keyword) and keyword not in suggestions:
                suggestions.append(keyword)
        
        # 按长度和流行度排序
        suggestions.sort(key=len)
        
        return suggestions[:10]  # 返回前10个建议
    
    def get_char_combinations(self, wuxing_list, gender=None, style_preference=None):
        """获取字的组合建议（用于双字名）"""
        if len(wuxing_list) != 2:
            return []
        
        first_chars = self.get_chars_by_wuxing(wuxing_list[0], gender, 20)
        second_chars = self.get_chars_by_wuxing(wuxing_list[1], gender, 20)
        
        combinations = []
        for first_char, first_info in first_chars:
            for second_char, second_info in second_chars:
                # 避免重复字
                if first_char == second_char:
                    continue
                
                # 计算组合得分
                score = self._calculate_combination_score(
                    first_char, first_info, second_char, second_info, style_preference
                )
                
                combinations.append({
                    'combination': first_char + second_char,
                    'first_char': first_char,
                    'second_char': second_char,
                    'first_info': first_info,
                    'second_info': second_info,
                    'score': score
                })
        
        # 按得分排序
        combinations.sort(key=lambda x: x['score'], reverse=True)
        
        return combinations[:50]  # 返回前50个组合
    
    def _calculate_combination_score(self, char1, info1, char2, info2, style_preference):
        """计算字组合的得分"""
        score = 0
        
        # 基础流行度得分
        popularity_scores = {'high': 10, 'medium': 7, 'low': 4}
        score += popularity_scores.get(info1['popularity'], 4)
        score += popularity_scores.get(info2['popularity'], 4)
        
        # 时代一致性加分
        if info1['era'] == info2['era']:
            score += 5
        
        # 文化层次一致性加分
        if info1['cultural_level'] == info2['cultural_level']:
            score += 3
        
        # 声调搭配加分（避免单调）
        if info1.get('tone_category') != info2.get('tone_category'):
            score += 3
        
        # 笔画数搭配（不要过于复杂）
        total_strokes = info1['stroke'] + info2['stroke']
        if 15 <= total_strokes <= 25:
            score += 5
        elif total_strokes > 30:
            score -= 3
        
        # 风格偏好加分
        if style_preference:
            if style_preference == 'modern' and info1['era'] in ['contemporary', 'modern']:
                score += 3
            if style_preference == 'classic' and info1['era'] in ['classical', 'ancient']:
                score += 3
        
        return score
    
    def get_database_stats(self):
        """获取数据库统计信息"""
        stats = {
            'total_chars': len(self.char_database),
            'by_wuxing': {},
            'by_gender': {},
            'by_era': {},
            'by_popularity': {}
        }
        
        for char, info in self.char_database.items():
            # 按五行统计
            wuxing = info['wuxing']
            if wuxing not in stats['by_wuxing']:
                stats['by_wuxing'][wuxing] = 0
            stats['by_wuxing'][wuxing] += 1
            
            # 按性别统计
            gender = info['gender']
            if gender not in stats['by_gender']:
                stats['by_gender'][gender] = 0
            stats['by_gender'][gender] += 1
            
            # 按时代统计
            era = info['era']
            if era not in stats['by_era']:
                stats['by_era'][era] = 0
            stats['by_era'][era] += 1
            
            # 按流行度统计
            popularity = info['popularity']
            if popularity not in stats['by_popularity']:
                stats['by_popularity'][popularity] = 0
            stats['by_popularity'][popularity] += 1
        
        return stats

# 创建全局实例
char_db = EnhancedCharDatabase()

def get_character_database():
    """获取字库实例"""
    return char_db
