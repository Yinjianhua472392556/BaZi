"""
智能起名算法实现
基于传统五行理论和姓名学原理
"""
import json
import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from bazi_calculator import BaziCalculator

@dataclass
class NameRecommendation:
    """名字推荐结果"""
    full_name: str
    given_name: str
    overall_score: float
    wuxing_analysis: Dict
    sancai_wuge: Dict
    meaning_explanation: str
    pronunciation: str
    luck_level: str

class WuxingAnalyzer:
    """五行分析器"""
    
    def __init__(self):
        self.wuxing_elements = ['金', '木', '水', '火', '土']
        self.wuxing_relations = {
            '相生': {
                '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
            },
            '相克': {
                '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
            }
        }
    
    def analyze_bazi_wuxing(self, bazi_info: Dict) -> Dict:
        """分析八字五行强弱"""
        try:
            # 统计八字中各五行的数量
            wuxing_counts = {'金': 0, '木': 0, '水': 0, '火': 0, '土': 0}
            
            # 分析天干地支的五行属性
            tiangan_wuxing = {
                '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
                '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
            }
            
            dizhi_wuxing = {
                '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
                '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
            }
            
            # 统计四柱八字的五行
            if 'paipan' in bazi_info:
                paipan = bazi_info['paipan']
                
                # 统计天干
                for zhu in ['年柱', '月柱', '日柱', '时柱']:
                    if zhu in paipan:
                        tiangan = paipan[zhu]['天干']
                        dizhi = paipan[zhu]['地支']
                        
                        if tiangan in tiangan_wuxing:
                            wuxing_counts[tiangan_wuxing[tiangan]] += 1
                        if dizhi in dizhi_wuxing:
                            wuxing_counts[dizhi_wuxing[dizhi]] += 1
            
            # 计算五行强弱程度
            total_count = sum(wuxing_counts.values())
            wuxing_strength = {}
            for element, count in wuxing_counts.items():
                strength = count / total_count if total_count > 0 else 0
                if strength >= 0.3:
                    wuxing_strength[element] = '旺'
                elif strength >= 0.15:
                    wuxing_strength[element] = '平'
                else:
                    wuxing_strength[element] = '弱'
            
            # 确定喜用神和忌神
            xiyongshen = self.calculate_xiyongshen(wuxing_counts)
            
            return {
                'wuxing_counts': wuxing_counts,
                'wuxing_strength': wuxing_strength,
                'xiyongshen': xiyongshen['喜用神'],
                'jishen': xiyongshen['忌神'],
                'analysis_summary': self._generate_wuxing_summary(wuxing_counts, xiyongshen)
            }
            
        except Exception as e:
            print(f"五行分析错误: {str(e)}")
            return self._get_default_wuxing_analysis()
    
    def calculate_xiyongshen(self, wuxing_counts: Dict) -> Dict:
        """计算喜用神"""
        try:
            total = sum(wuxing_counts.values())
            if total == 0:
                return {'喜用神': ['木', '火'], '忌神': ['金']}
            
            # 找出最弱和最强的五行
            weak_elements = []
            strong_elements = []
            
            for element, count in wuxing_counts.items():
                ratio = count / total
                if ratio < 0.1:  # 弱
                    weak_elements.append(element)
                elif ratio > 0.25:  # 强
                    strong_elements.append(element)
            
            # 确定喜用神（需要补充的五行）
            xiyongshen = weak_elements if weak_elements else ['木', '火']  # 默认喜木火
            
            # 确定忌神（过旺的五行）
            jishen = strong_elements if strong_elements else ['金']  # 默认忌金
            
            return {
                '喜用神': xiyongshen,
                '忌神': jishen
            }
            
        except Exception as e:
            print(f"喜用神计算错误: {str(e)}")
            return {'喜用神': ['木', '火'], '忌神': ['金']}
    
    def _generate_wuxing_summary(self, wuxing_counts: Dict, xiyongshen: Dict) -> str:
        """生成五行分析总结"""
        summary = "根据您的八字分析："
        
        # 五行状况
        weak_elements = []
        strong_elements = []
        total = sum(wuxing_counts.values())
        
        for element, count in wuxing_counts.items():
            if total > 0:
                ratio = count / total
                if ratio < 0.1:
                    weak_elements.append(element)
                elif ratio > 0.25:
                    strong_elements.append(element)
        
        if weak_elements:
            summary += f"五行中{','.join(weak_elements)}较弱，"
        if strong_elements:
            summary += f"{','.join(strong_elements)}较旺，"
        
        summary += f"建议起名时多用{','.join(xiyongshen['喜用神'])}属性的字，"
        summary += f"避免使用{','.join(xiyongshen['忌神'])}属性的字。"
        
        return summary
    
    def _get_default_wuxing_analysis(self) -> Dict:
        """获取默认五行分析结果"""
        return {
            'wuxing_counts': {'金': 1, '木': 2, '水': 1, '火': 2, '土': 2},
            'wuxing_strength': {'金': '弱', '木': '平', '水': '弱', '火': '平', '土': '平'},
            'xiyongshen': ['木', '火'],
            'jishen': ['金'],
            'analysis_summary': '五行分析：建议起名时多用木、火属性的字，有助于平衡五行。'
        }

class NameologyCalculator:
    """姓名学计算器"""
    
    def __init__(self):
        self.load_mathematics_data()
    
    def load_mathematics_data(self):
        """加载81数理数据"""
        # 81数理吉凶数据（简化版）
        self.mathematics_luck = {
            1: {'luck': '大吉', 'desc': '太极之数，万物开泰'},
            2: {'luck': '凶', 'desc': '两仪之数，混沌未开'},
            3: {'luck': '大吉', 'desc': '三才之数，天地人和'},
            4: {'luck': '凶', 'desc': '四象之数，待于生发'},
            5: {'luck': '大吉', 'desc': '五行之数，循环相生'},
            6: {'luck': '大吉', 'desc': '六爻之数，发展变化'},
            7: {'luck': '吉', 'desc': '七政之数，精悍严谨'},
            8: {'luck': '吉', 'desc': '八卦之数，乾坤震巽'},
            9: {'luck': '凶', 'desc': '大成之数，蕴涵凶险'},
            10: {'luck': '凶', 'desc': '终数之数，雪暗飘零'},
            11: {'luck': '大吉', 'desc': '旱苗逢雨，万物更新'},
            12: {'luck': '凶', 'desc': '无理之数，发展薄弱'},
            13: {'luck': '大吉', 'desc': '天才，多才多艺'},
            14: {'luck': '凶', 'desc': '破兆，家庭缘薄'},
            15: {'luck': '大吉', 'desc': '福寿，完成学识'},
            16: {'luck': '大吉', 'desc': '厚重，载德载物'},
            17: {'luck': '半吉', 'desc': '刚强，突破万难'},
            18: {'luck': '大吉', 'desc': '有志，有目的志'},
            19: {'luck': '凶', 'desc': '多难，风云蔽日'},
            20: {'luck': '凶', 'desc': '非业，非运之空'},
            21: {'luck': '大吉', 'desc': '明月中天，独立权威'},
            23: {'luck': '大吉', 'desc': '壮丽，旭日东升'},
            24: {'luck': '大吉', 'desc': '掘藏得金，家门余庆'},
            25: {'luck': '半吉', 'desc': '荣俊，资性英敏'},
            29: {'luck': '半吉', 'desc': '智谋，智谋优秀'},
            31: {'luck': '大吉', 'desc': '春日花开，智勇得志'},
            32: {'luck': '大吉', 'desc': '侥幸，龙池跃龙'},
            33: {'luck': '大吉', 'desc': '升天，家门昌隆'},
            35: {'luck': '大吉', 'desc': '高楼望月，温和平静'},
            37: {'luck': '大吉', 'desc': '猛虎出林，权威显达'},
            39: {'luck': '半吉', 'desc': '富贵，财源进宝'},
            41: {'luck': '大吉', 'desc': '有德，纯阳独秀'},
            45: {'luck': '大吉', 'desc': '顺风，新生泰和'},
            47: {'luck': '大吉', 'desc': '点石成金，花开之象'},
            48: {'luck': '大吉', 'desc': '古松立鹤，德智兼备'},
            52: {'luck': '半吉', 'desc': '达眼，卓识达眼'},
            57: {'luck': '半吉', 'desc': '日照春松，寒雪青松'},
            63: {'luck': '大吉', 'desc': '舟归平海，富贵繁荣'},
            65: {'luck': '大吉', 'desc': '巨流归海，富贵长寿'},
            67: {'luck': '大吉', 'desc': '通达，天赋幸运'},
            68: {'luck': '大吉', 'desc': '顺风，思虑周密'},
            81: {'luck': '大吉', 'desc': '万物回春，恒久富贵'}
        }
        
        # 为未定义的数字设置默认值
        for i in range(1, 82):
            if i not in self.mathematics_luck:
                if i % 2 == 1 and i < 40:
                    self.mathematics_luck[i] = {'luck': '吉', 'desc': '运势平稳，有所发展'}
                else:
                    self.mathematics_luck[i] = {'luck': '平', 'desc': '运势一般，平稳发展'}
    
    def calculate_stroke_count(self, char: str) -> int:
        """计算汉字笔画数（简化实现）"""
        # 这里应该连接真实的汉字笔画数据库
        # 目前使用简化的笔画估算
        stroke_map = {
            # 常见字的笔画数
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 2,
            '子': 3, '丑': 4, '寅': 11, '卯': 5, '辰': 7, '巳': 3, '午': 4, '未': 5, '申': 5, '酉': 7, '戌': 6, '亥': 6,
            '甲': 5, '乙': 1, '丙': 5, '丁': 2, '戊': 5, '己': 3, '庚': 8, '辛': 7, '壬': 4, '癸': 9,
            '王': 4, '李': 7, '张': 7, '刘': 6, '陈': 7, '杨': 7, '赵': 9, '黄': 11, '周': 8, '吴': 7,
            '文': 4, '武': 8, '明': 8, '华': 6, '强': 12, '军': 6, '伟': 6, '国': 8, '建': 8, '民': 5,
            '安': 6, '康': 11, '福': 13, '贵': 9, '富': 12, '吉': 6, '祥': 10, '瑞': 13, '慧': 15, '智': 12,
            '美': 9, '丽': 7, '花': 7, '月': 4, '星': 9, '雨': 8, '雪': 11, '云': 4, '山': 3, '水': 4,
            '春': 9, '夏': 10, '秋': 9, '冬': 5, '东': 5, '西': 6, '南': 9, '北': 5, '中': 4, '天': 4,
            '地': 6,
            '人': 2, '大': 3, '小': 3, '日': 4, '月': 4, '年': 6, '时': 7, '分': 4, '秒': 9,
            '好': 6, '坏': 7, '新': 13, '旧': 5, '长': 4, '短': 4, '高': 10, '低': 7, '快': 7, '慢': 14,
            '红': 9, '绿': 11, '蓝': 13, '黄': 11, '白': 5, '黑': 12, '灰': 6, '紫': 11, '粉': 10, '棕': 12
        }
        
        if char in stroke_map:
            return stroke_map[char]
        else:
            # 简单估算：根据字符的复杂度估算笔画数
            return min(len(char.encode('utf-8')) * 3, 20)
    
    def calculate_sancai_wuge(self, surname: str, given_name: str) -> Dict:
        """计算三才五格"""
        try:
            # 计算笔画数
            surname_strokes = sum(self.calculate_stroke_count(char) for char in surname)
            given_strokes = [self.calculate_stroke_count(char) for char in given_name]
            
            # 计算五格
            tiange = surname_strokes + 1 if len(surname) == 1 else sum(self.calculate_stroke_count(char) for char in surname)
            renge = surname_strokes + (given_strokes[0] if given_strokes else 1)
            dige = sum(given_strokes) if given_strokes else 1
            waige = tiange + dige - renge
            zongge = surname_strokes + sum(given_strokes)
            
            # 计算三才（天人地三格的五行属性）
            tiange_wuxing = self._get_wuxing_by_number(tiange)
            renge_wuxing = self._get_wuxing_by_number(renge)
            dige_wuxing = self._get_wuxing_by_number(dige)
            
            # 评估各格的吉凶
            wuge_analysis = {
                '天格': {
                    'value': tiange,
                    'wuxing': tiange_wuxing,
                    'luck': self.evaluate_81_mathematics(tiange)
                },
                '人格': {
                    'value': renge,
                    'wuxing': renge_wuxing,
                    'luck': self.evaluate_81_mathematics(renge)
                },
                '地格': {
                    'value': dige,
                    'wuxing': dige_wuxing,
                    'luck': self.evaluate_81_mathematics(dige)
                },
                '外格': {
                    'value': waige,
                    'wuxing': self._get_wuxing_by_number(waige),
                    'luck': self.evaluate_81_mathematics(waige)
                },
                '总格': {
                    'value': zongge,
                    'wuxing': self._get_wuxing_by_number(zongge),
                    'luck': self.evaluate_81_mathematics(zongge)
                }
            }
            
            # 计算三才配置
            sancai_config = f"{tiange_wuxing}{renge_wuxing}{dige_wuxing}"
            sancai_evaluation = self._evaluate_sancai(tiange_wuxing, renge_wuxing, dige_wuxing)
            
            return {
                'wuge_analysis': wuge_analysis,
                'sancai_config': sancai_config,
                'sancai_evaluation': sancai_evaluation,
                'overall_evaluation': self._calculate_overall_wuge_score(wuge_analysis)
            }
            
        except Exception as e:
            print(f"三才五格计算错误: {str(e)}")
            return self._get_default_sancai_wuge()
    
    def evaluate_81_mathematics(self, number: int) -> Dict:
        """81数理吉凶判断"""
        # 确保数字在1-81范围内
        number = ((number - 1) % 81) + 1
        
        if number in self.mathematics_luck:
            return self.mathematics_luck[number]
        else:
            return {'luck': '平', 'desc': '运势平稳'}
    
    def _get_wuxing_by_number(self, number: int) -> str:
        """根据数字尾数确定五行属性"""
        last_digit = number % 10
        if last_digit in [1, 2]:
            return '木'
        elif last_digit in [3, 4]:
            return '火'
        elif last_digit in [5, 6]:
            return '土'
        elif last_digit in [7, 8]:
            return '金'
        else:  # 9, 0
            return '水'
    
    def _evaluate_sancai(self, tiange_wuxing: str, renge_wuxing: str, dige_wuxing: str) -> Dict:
        """评估三才配置"""
        # 简化的三才评估逻辑
        sancai_combinations = {
            '木木木': {'luck': '大吉', 'desc': '同心协力，成功发达'},
            '木木火': {'luck': '大吉', 'desc': '木火通明，前程似锦'},
            '木火土': {'luck': '大吉', 'desc': '顺序相生，大获成功'},
            '火土金': {'luck': '大吉', 'desc': '三才相生，富贵双全'},
            '土金水': {'luck': '大吉', 'desc': '金水相生，智慧过人'},
            '金水木': {'luck': '大吉', 'desc': '水木清华，文采斐然'},
            '水木火': {'luck': '大吉', 'desc': '木火通明，事业有成'},
            '木金土': {'luck': '凶', 'desc': '金克木，多有挫折'},
            '火水金': {'luck': '凶', 'desc': '水火不容，冲突不断'},
            '土木水': {'luck': '凶', 'desc': '木土相克，发展受阻'}
        }
        
        combination = tiange_wuxing + renge_wuxing + dige_wuxing
        
        if combination in sancai_combinations:
            return sancai_combinations[combination]
        else:
            # 默认评估逻辑
            if self._is_wuxing_harmonious(tiange_wuxing, renge_wuxing, dige_wuxing):
                return {'luck': '吉', 'desc': '三才配置和谐，运势良好'}
            else:
                return {'luck': '平', 'desc': '三才配置一般，需要努力'}
    
    def _is_wuxing_harmonious(self, w1: str, w2: str, w3: str) -> bool:
        """判断三个五行是否和谐"""
        # 检查是否有相生关系
        wuxing_sheng = {'木': '火', '火': '土', '土': '金', '金': '水', '水': '木'}
        
        if wuxing_sheng.get(w1) == w2 or wuxing_sheng.get(w2) == w3:
            return True
        
        # 检查是否有相克关系
        wuxing_ke = {'木': '土', '土': '水', '水': '火', '火': '金', '金': '木'}
        
        if wuxing_ke.get(w1) == w2 or wuxing_ke.get(w2) == w3:
            return False
        
        return True  # 其他情况认为和谐
    
    def _calculate_overall_wuge_score(self, wuge_analysis: Dict) -> Dict:
        """计算五格综合评分"""
        score_map = {'大吉': 95, '吉': 80, '半吉': 70, '平': 60, '凶': 40, '大凶': 20}
        
        total_score = 0
        count = 0
        
        for ge_name, ge_info in wuge_analysis.items():
            luck = ge_info['luck']['luck']
            score = score_map.get(luck, 60)
            total_score += score
            count += 1
        
        average_score = total_score / count if count > 0 else 60
        
        if average_score >= 85:
            level = '优秀'
        elif average_score >= 70:
            level = '良好'
        elif average_score >= 60:
            level = '一般'
        else:
            level = '需改善'
        
        return {
            'score': round(average_score, 1),
            'level': level,
            'description': f'五格综合评分{average_score:.1f}分，等级：{level}'
        }
    
    def _get_default_sancai_wuge(self) -> Dict:
        """获取默认的三才五格结果"""
        return {
            'wuge_analysis': {
                '天格': {'value': 8, 'wuxing': '金', 'luck': {'luck': '吉', 'desc': '八卦之数，乾坤震巽'}},
                '人格': {'value': 15, 'wuxing': '土', 'luck': {'luck': '大吉', 'desc': '福寿，完成学识'}},
                '地格': {'value': 12, 'wuxing': '木', 'luck': {'luck': '凶', 'desc': '无理之数，发展薄弱'}},
                '外格': {'value': 5, 'wuxing': '土', 'luck': {'luck': '大吉', 'desc': '五行之数，循环相生'}},
                '总格': {'value': 19, 'wuxing': '水', 'luck': {'luck': '凶', 'desc': '多难，风云蔽日'}}
            },
            'sancai_config': '金土木',
            'sancai_evaluation': {'luck': '平', 'desc': '三才配置一般，需要努力'},
            'overall_evaluation': {'score': 65.0, 'level': '一般', 'description': '五格综合评分65.0分，等级：一般'}
        }

class ChineseCharDatabase:
    """汉字库管理器"""
    
    def __init__(self):
        self.load_char_database()
    
    def load_char_database(self):
        """加载汉字数据库"""
        # 这里应该连接真实的汉字数据库
        # 目前使用简化的汉字数据
        self.char_database = {
            # 木属性字
            '木': {'stroke': 4, 'wuxing': '木', 'meaning': '木材，生长', 'suitable_for_name': True, 'gender': 'neutral'},
            '林': {'stroke': 8, 'wuxing': '木', 'meaning': '森林，茂盛', 'suitable_for_name': True, 'gender': 'neutral'},
            '森': {'stroke': 12, 'wuxing': '木', 'meaning': '森林，众多', 'suitable_for_name': True, 'gender': 'male'},
            '松': {'stroke': 8, 'wuxing': '木', 'meaning': '松树，坚韧', 'suitable_for_name': True, 'gender': 'male'},
            '柏': {'stroke': 9, 'wuxing': '木', 'meaning': '柏树，长青', 'suitable_for_name': True, 'gender': 'neutral'},
            '桂': {'stroke': 10, 'wuxing': '木', 'meaning': '桂花，芳香', 'suitable_for_name': True, 'gender': 'female'},
            '梅': {'stroke': 11, 'wuxing': '木', 'meaning': '梅花，坚强', 'suitable_for_name': True, 'gender': 'female'},
            '竹': {'stroke': 6, 'wuxing': '木', 'meaning': '竹子，高洁', 'suitable_for_name': True, 'gender': 'neutral'},
            '荣': {'stroke': 14, 'wuxing': '木', 'meaning': '荣耀，兴盛', 'suitable_for_name': True, 'gender': 'neutral'},
            '华': {'stroke': 14, 'wuxing': '木', 'meaning': '花朵，华丽', 'suitable_for_name': True, 'gender': 'neutral'},
            
            # 火属性字
            '火': {'stroke': 4, 'wuxing': '火', 'meaning': '火焰，热情', 'suitable_for_name': False, 'gender': 'neutral'},
            '炎': {'stroke': 8, 'wuxing': '火', 'meaning': '炎热，热烈', 'suitable_for_name': True, 'gender': 'male'},
            '明': {'stroke': 8, 'wuxing': '火', 'meaning': '明亮，聪明', 'suitable_for_name': True, 'gender': 'neutral'},
            '亮': {'stroke': 9, 'wuxing': '火', 'meaning': '明亮，清楚', 'suitable_for_name': True, 'gender': 'neutral'},
            '晖': {'stroke': 13, 'wuxing': '火', 'meaning': '阳光，光辉', 'suitable_for_name': True, 'gender': 'neutral'},
            '辉': {'stroke': 15, 'wuxing': '火', 'meaning': '光辉，灿烂', 'suitable_for_name': True, 'gender': 'neutral'},
            '阳': {'stroke': 12, 'wuxing': '火', 'meaning': '太阳，积极', 'suitable_for_name': True, 'gender': 'male'},
            '晨': {'stroke': 11, 'wuxing': '火', 'meaning': '早晨，希望', 'suitable_for_name': True, 'gender': 'neutral'},
            '昊': {'stroke': 8, 'wuxing': '火', 'meaning': '天空，广大', 'suitable_for_name': True, 'gender': 'male'},
            '烨': {'stroke': 16, 'wuxing': '火', 'meaning': '火光，明亮', 'suitable_for_name': True, 'gender': 'neutral'},
            
            # 土属性字
            '土': {'stroke': 3, 'wuxing': '土', 'meaning': '土地，厚重', 'suitable_for_name': False, 'gender': 'neutral'},
            '山': {'stroke': 3, 'wuxing': '土', 'meaning': '山峰，高大', 'suitable_for_name': True, 'gender': 'neutral'},
            '岩': {'stroke': 8, 'wuxing': '土', 'meaning': '岩石，坚固', 'suitable_for_name': True, 'gender': 'male'},
            '峰': {'stroke': 10, 'wuxing': '土', 'meaning': '山峰，顶尖', 'suitable_for_name': True, 'gender': 'male'},
            '城': {'stroke': 10, 'wuxing': '土', 'meaning': '城池，稳固', 'suitable_for_name': True, 'gender': 'neutral'},
            '坤': {'stroke': 8, 'wuxing': '土', 'meaning': '大地，包容', 'suitable_for_name': True, 'gender': 'neutral'},
            '培': {'stroke': 11, 'wuxing': '土', 'meaning': '培养，教育', 'suitable_for_name': True, 'gender': 'neutral'},
            '垒': {'stroke': 9, 'wuxing': '土', 'meaning': '垒筑，建设', 'suitable_for_name': True, 'gender': 'male'},
            '壮': {'stroke': 7, 'wuxing': '土', 'meaning': '壮大，雄伟', 'suitable_for_name': True, 'gender': 'male'},
            '田': {'stroke': 5, 'wuxing': '土', 'meaning': '田地，丰收', 'suitable_for_name': True, 'gender': 'neutral'},
            
            # 金属性字
            '金': {'stroke': 8, 'wuxing': '金', 'meaning': '金属，珍贵', 'suitable_for_name': True, 'gender': 'neutral'},
            '银': {'stroke': 14, 'wuxing': '金', 'meaning': '银色，纯洁', 'suitable_for_name': True, 'gender': 'neutral'},
            '铁': {'stroke': 13, 'wuxing': '金', 'meaning': '钢铁，坚强', 'suitable_for_name': True, 'gender': 'male'},
            '钢': {'stroke': 16, 'wuxing': '金', 'meaning': '钢铁，坚韧', 'suitable_for_name': True, 'gender': 'male'},
            '锋': {'stroke': 15, 'wuxing': '金', 'meaning': '锋利，锐利', 'suitable_for_name': True, 'gender': 'male'},
            '锐': {'stroke': 15, 'wuxing': '金', 'meaning': '锐利，敏锐', 'suitable_for_name': True, 'gender': 'neutral'},
            '钊': {'stroke': 10, 'wuxing': '金', 'meaning': '劝勉，鼓励', 'suitable_for_name': True, 'gender': 'male'},
            '钦': {'stroke': 12, 'wuxing': '金', 'meaning': '钦佩，尊敬', 'suitable_for_name': True, 'gender': 'neutral'},
            '鑫': {'stroke': 24, 'wuxing': '金', 'meaning': '金多，兴盛', 'suitable_for_name': True, 'gender': 'neutral'},
            '铭': {'stroke': 14, 'wuxing': '金', 'meaning': '铭记，纪念', 'suitable_for_name': True, 'gender': 'neutral'},
            
            # 水属性字
            '水': {'stroke': 4, 'wuxing': '水', 'meaning': '水流，生命', 'suitable_for_name': False, 'gender': 'neutral'},
            '江': {'stroke': 7, 'wuxing': '水', 'meaning': '江河，宽阔', 'suitable_for_name': True, 'gender': 'neutral'},
            '河': {'stroke': 9, 'wuxing': '水', 'meaning': '河流，流动', 'suitable_for_name': True, 'gender': 'neutral'},
            '海': {'stroke': 11, 'wuxing': '水', 'meaning': '海洋，宽广', 'suitable_for_name': True, 'gender': 'neutral'},
            '湖': {'stroke': 13, 'wuxing': '水', 'meaning': '湖泊，宁静', 'suitable_for_name': True, 'gender': 'neutral'},
            '波': {'stroke': 9, 'wuxing': '水', 'meaning': '波浪，动感', 'suitable_for_name': True, 'gender': 'neutral'},
            '流': {'stroke': 11, 'wuxing': '水', 'meaning': '流动，顺畅', 'suitable_for_name': True, 'gender': 'neutral'},
            '溪': {'stroke': 14, 'wuxing': '水', 'meaning': '溪流，清澈', 'suitable_for_name': True, 'gender': 'female'},
            '雨': {'stroke': 8, 'wuxing': '水', 'meaning': '雨水，滋润', 'suitable_for_name': True, 'gender': 'neutral'},
            '雪': {'stroke': 11, 'wuxing': '水', 'meaning': '雪花，纯洁', 'suitable_for_name': True, 'gender': 'female'},
            
            # 常用名字字
            '文': {'stroke': 4, 'wuxing': '水', 'meaning': '文化，文雅', 'suitable_for_name': True, 'gender': 'neutral'},
            '武': {'stroke': 8, 'wuxing': '水', 'meaning': '武功，勇敢', 'suitable_for_name': True, 'gender': 'male'},
            '宇': {'stroke': 6, 'wuxing': '土', 'meaning': '宇宙，广大', 'suitable_for_name': True, 'gender': 'neutral'},
            '轩': {'stroke': 10, 'wuxing': '土', 'meaning': '轩昂，高雅', 'suitable_for_name': True, 'gender': 'male'},
            '博': {'stroke': 12, 'wuxing': '水', 'meaning': '博学，广博', 'suitable_for_name': True, 'gender': 'neutral'},
            '睿': {'stroke': 14, 'wuxing': '金', 'meaning': '睿智，聪慧', 'suitable_for_name': True, 'gender': 'neutral'},
            '涵': {'stroke': 12, 'wuxing': '水', 'meaning': '涵养，包容', 'suitable_for_name': True, 'gender': 'neutral'},
            '雅': {'stroke': 12, 'wuxing': '木', 'meaning': '雅致，优雅', 'suitable_for_name': True, 'gender': 'female'},
            '欣': {'stroke': 8, 'wuxing': '木', 'meaning': '欣喜，快乐', 'suitable_for_name': True, 'gender': 'female'},
            '怡': {'stroke': 9, 'wuxing': '土', 'meaning': '怡然，和谐', 'suitable_for_name': True, 'gender': 'female'}
        }
    
    def get_chars_by_wuxing(self, wuxing: str, stroke_range: Tuple[int, int] = None, gender: str = 'neutral') -> List[Dict]:
        """根据五行属性获取汉字"""
        chars = []
        
        for char, info in self.char_database.items():
            # 检查五行属性
            if info['wuxing'] != wuxing:
                continue
            
            # 检查是否适合起名
            if not info['suitable_for_name']:
                continue
            
            # 检查性别偏好
            if gender != 'neutral' and info['gender'] not in ['neutral', gender]:
                continue
            
            # 检查笔画范围
            if stroke_range:
                min_stroke, max_stroke = stroke_range
                if not (min_stroke <= info['stroke'] <= max_stroke):
                    continue
            
            chars.append({
                'char': char,
                'stroke': info['stroke'],
                'wuxing': info['wuxing'],
                'meaning': info['meaning'],
                'gender': info['gender']
            })
        
        return chars
    
    def get_char_properties(self, char: str) -> Dict:
        """获取汉字属性"""
        if char in self.char_database:
            return self.char_database[char]
        else:
            # 如果字库中没有，返回估算的属性
            return {
                'stroke': self._estimate_stroke_count(char),
                'wuxing': self._estimate_wuxing(char),
                'meaning': '含义丰富',
                'suitable_for_name': True,
                'gender': 'neutral'
            }
    
    def _estimate_stroke_count(self, char: str) -> int:
        """估算汉字笔画数"""
        # 简单估算，实际应该查询真实笔画数据库
        return min(len(char.encode('utf-8')) * 3, 20)
    
    def _estimate_wuxing(self, char: str) -> str:
        """估算汉字五行属性"""
        # 简单估算，实际应该查询真实五行数据库
        # 根据字的偏旁部首等估算
        if any(radical in char for radical in ['木', '林', '森', '树', '竹']):
            return '木'
        elif any(radical in char for radical in ['火', '炎', '明', '亮', '阳']):
            return '火'
        elif any(radical in char for radical in ['土', '山', '石', '田', '地']):
            return '土'
        elif any(radical in char for radical in ['金', '银', '铁', '钢', '锋']):
            return '金'
        elif any(radical in char for radical in ['水', '江', '河', '海', '雨']):
            return '水'
        else:
            return '土'  # 默认土属性

class NameGenerator:
    """名字生成器"""
    
    def __init__(self):
        self.wuxing_analyzer = WuxingAnalyzer()
        self.nameology_calculator = NameologyCalculator()
        self.char_database = ChineseCharDatabase()
        self.bazi_calculator = BaziCalculator()
    
    def generate_names(self, surname: str, gender: str, birth_info: Dict, 
                      name_length: int = 2, count: int = 10) -> List[NameRecommendation]:
        """智能生成推荐名字"""
        try:
            # 1. 分析八字五行
            bazi_result = self.bazi_calculator.calculate_bazi(
                birth_info['year'], birth_info['month'], birth_info['day'], 
                birth_info['hour'], gender, birth_info.get('calendar_type', 'solar')
            )
            
            wuxing_analysis = self.wuxing_analyzer.analyze_bazi_wuxing(bazi_result)
            
            # 2. 根据喜用神筛选汉字
            suitable_chars = self._filter_chars_by_xiyongshen(
                wuxing_analysis['xiyongshen'], gender
            )
            
            # 3. 生成候选名字组合
            candidate_names = self._generate_name_combinations(
                surname, suitable_chars, name_length, count * 3  # 生成更多候选
            )
            
            # 4. 评估每个名字
            evaluated_names = []
            for name in candidate_names:
                evaluation = self._evaluate_name(surname, name, wuxing_analysis, bazi_result)
                if evaluation:
                    evaluated_names.append(evaluation)
            
            # 5. 排序并返回top N
            evaluated_names.sort(key=lambda x: x.overall_score, reverse=True)
            
            return evaluated_names[:count]
            
        except Exception as e:
            print(f"生成名字错误: {str(e)}")
            return self._generate_default_names(surname, gender, name_length, count)
    
    def _filter_chars_by_xiyongshen(self, xiyongshen: List[str], gender: str) -> List[Dict]:
        """根据喜用神筛选汉字"""
        suitable_chars = []
        
        for wuxing in xiyongshen:
            chars = self.char_database.get_chars_by_wuxing(
                wuxing, stroke_range=(3, 20), gender=gender
            )
            suitable_chars.extend(chars)
        
        # 去重并按笔画数排序
        unique_chars = {}
        for char_info in suitable_chars:
            char = char_info['char']
            if char not in unique_chars:
                unique_chars[char] = char_info
        
        return list(unique_chars.values())
    
    def _generate_name_combinations(self, surname: str, chars: List[Dict], 
                                   name_length: int, count: int) -> List[str]:
        """生成名字组合"""
        combinations = []
        
        if name_length == 1:
            # 单名
            for char_info in chars[:count]:
                combinations.append(char_info['char'])
        else:
            # 双名
            import itertools
            char_list = [c['char'] for c in chars]
            
            # 生成两字组合
            for combo in itertools.combinations_with_replacement(char_list, 2):
                if len(combinations) >= count:
                    break
                # 避免重复字
                if combo[0] != combo[1]:
                    combinations.append(''.join(combo))
        
        return combinations[:count]
    
    def _evaluate_name(self, surname: str, given_name: str, 
                      wuxing_analysis: Dict, bazi_result: Dict) -> Optional[NameRecommendation]:
        """评估单个名字"""
        try:
            full_name = surname + given_name
            
            # 计算三才五格
            sancai_wuge = self.nameology_calculator.calculate_sancai_wuge(surname, given_name)
            
            # 分析名字五行
            name_wuxing_analysis = self._analyze_name_wuxing(given_name)
            
            # 计算综合评分
            overall_score = self._calculate_overall_score(
                sancai_wuge, wuxing_analysis, name_wuxing_analysis
            )
            
            # 生成寓意解释
            meaning_explanation = self._generate_meaning_explanation(given_name)
            
            # 生成拼音
            pronunciation = self._generate_pronunciation(given_name)
            
            # 确定吉凶等级
            luck_level = self._determine_luck_level(overall_score)
            
            return NameRecommendation(
                full_name=full_name,
                given_name=given_name,
                overall_score=overall_score,
                wuxing_analysis=name_wuxing_analysis,
                sancai_wuge=sancai_wuge,
                meaning_explanation=meaning_explanation,
                pronunciation=pronunciation,
                luck_level=luck_level
            )
            
        except Exception as e:
            print(f"评估名字错误: {str(e)}")
            return None
    
    def _analyze_name_wuxing(self, given_name: str) -> Dict:
        """分析名字的五行属性"""
        name_wuxing = []
        for char in given_name:
            char_info = self.char_database.get_char_properties(char)
            name_wuxing.append({
                'char': char,
                'wuxing': char_info['wuxing'],
                'meaning': char_info['meaning']
            })
        
        # 统计五行分布
        wuxing_distribution = {'金': 0, '木': 0, '水': 0, '火': 0, '土': 0}
        for char_info in name_wuxing:
            wuxing_distribution[char_info['wuxing']] += 1
        
        return {
            'chars_wuxing': name_wuxing,
            'wuxing_distribution': wuxing_distribution,
            'dominant_wuxing': max(wuxing_distribution.items(), key=lambda x: x[1])[0]
        }
    
    def _calculate_overall_score(self, sancai_wuge: Dict, bazi_wuxing: Dict, name_wuxing: Dict) -> float:
        """计算综合评分"""
        # 五格得分 (40%)
        wuge_score = sancai_wuge['overall_evaluation']['score']
        
        # 五行匹配得分 (35%)
        wuxing_match_score = self._calculate_wuxing_match_score(bazi_wuxing, name_wuxing)
        
        # 三才配置得分 (25%)
        sancai_score = self._calculate_sancai_score(sancai_wuge['sancai_evaluation'])
        
        # 加权计算总分
        total_score = (wuge_score * 0.4) + (wuxing_match_score * 0.35) + (sancai_score * 0.25)
        
        return round(total_score, 1)
    
    def _calculate_wuxing_match_score(self, bazi_wuxing: Dict, name_wuxing: Dict) -> float:
        """计算五行匹配度得分"""
        score = 60  # 基础分
        
        xiyongshen = bazi_wuxing['xiyongshen']
        jishen = bazi_wuxing['jishen']
        
        # 检查名字中是否包含喜用神
        for char_info in name_wuxing['chars_wuxing']:
            if char_info['wuxing'] in xiyongshen:
                score += 15  # 每个喜用神字加15分
            elif char_info['wuxing'] in jishen:
                score -= 10  # 每个忌神字减10分
        
        return min(100, max(0, score))
    
    def _calculate_sancai_score(self, sancai_evaluation: Dict) -> float:
        """计算三才配置得分"""
        luck_scores = {
            '大吉': 95,
            '吉': 80,
            '半吉': 70,
            '平': 60,
            '凶': 40,
            '大凶': 20
        }
        
        return luck_scores.get(sancai_evaluation['luck'], 60)
    
    def _generate_meaning_explanation(self, given_name: str) -> str:
        """生成名字寓意解释"""
        explanations = []
        
        for char in given_name:
            char_info = self.char_database.get_char_properties(char)
            explanations.append(f"'{char}'字{char_info['meaning']}")
        
        return "，".join(explanations) + "。整体寓意美好，富有文化内涵。"
    
    def _generate_pronunciation(self, given_name: str) -> str:
        """生成拼音（简化实现）"""
        # 这里应该连接真实的拼音数据库
        # 目前使用简化的拼音映射
        pinyin_map = {
            '明': 'míng', '华': 'huá', '文': 'wén', '武': 'wǔ', '宇': 'yǔ',
            '轩': 'xuān', '博': 'bó', '睿': 'ruì', '涵': 'hán', '雅': 'yǎ',
            '欣': 'xīn', '怡': 'yí', '林': 'lín', '森': 'sēn', '松': 'sōng',
            '柏': 'bǎi', '桂': 'guì', '梅': 'méi', '竹': 'zhú', '荣': 'róng',
            '炎': 'yán', '亮': 'liàng', '晖': 'huī', '辉': 'huī', '阳': 'yáng',
            '晨': 'chén', '昊': 'hào', '烨': 'yè', '山': 'shān', '岩': 'yán',
            '峰': 'fēng', '城': 'chéng', '坤': 'kūn', '培': 'péi', '垒': 'lěi',
            '壮': 'zhuàng', '田': 'tián', '金': 'jīn', '银': 'yín', '铁': 'tiě',
            '钢': 'gāng', '锋': 'fēng', '锐': 'ruì', '钊': 'zhāo', '钦': 'qīn',
            '鑫': 'xīn', '铭': 'míng', '江': 'jiāng', '河': 'hé', '海': 'hǎi',
            '湖': 'hú', '波': 'bō', '流': 'liú', '溪': 'xī', '雨': 'yǔ', '雪': 'xuě'
        }
        
        pinyin_parts = []
        for char in given_name:
            if char in pinyin_map:
                pinyin_parts.append(pinyin_map[char])
            else:
                pinyin_parts.append(char)  # 如果找不到拼音，使用原字
        
        return " ".join(pinyin_parts)
    
    def _determine_luck_level(self, score: float) -> str:
        """确定吉凶等级"""
        if score >= 90:
            return '大吉'
        elif score >= 80:
            return '吉'
        elif score >= 70:
            return '半吉'
        elif score >= 60:
            return '平'
        elif score >= 40:
            return '凶'
        else:
            return '大凶'
    
    def _generate_default_names(self, surname: str, gender: str, name_length: int, count: int) -> List[NameRecommendation]:
        """生成默认推荐名字"""
        default_names = []
        
        # 根据性别提供默认名字
        if gender == 'male':
            male_names = ['明轩', '文博', '宇轩', '志强', '建华', '伟杰', '俊豪', '鸿飞']
        else:
            male_names = ['雅涵', '欣怡', '美琳', '思雨', '梦洁', '诗涵', '若汐', '语嫣']
        
        neutral_names = ['智慧', '文雅', '明亮', '和谐', '安康', '吉祥', '瑞雪', '春花']
        
        candidate_names = (male_names if gender == 'male' else male_names) + neutral_names
        
        for i, name in enumerate(candidate_names[:count]):
            if name_length == 1:
                given_name = name[0]
            else:
                given_name = name[:name_length]
            
            default_names.append(NameRecommendation(
                full_name=surname + given_name,
                given_name=given_name,
                overall_score=75.0 + (i * 2),  # 递减评分
                wuxing_analysis={
                    'chars_wuxing': [{'char': c, 'wuxing': '木', 'meaning': '美好寓意'} for c in given_name],
                    'wuxing_distribution': {'金': 0, '木': len(given_name), '水': 0, '火': 0, '土': 0},
                    'dominant_wuxing': '木'
                },
                sancai_wuge={
                    'overall_evaluation': {'score': 75.0, 'level': '良好', 'description': '五格配置良好'}
                },
                meaning_explanation=f"'{given_name}'寓意美好，适合起名使用。",
                pronunciation=self._generate_pronunciation(given_name),
                luck_level='吉'
            ))
        
        return default_names

class NamingCalculator:
    """起名计算器主类"""
    
    def __init__(self):
        self.name_generator = NameGenerator()
    
    def analyze_and_generate_names(self, surname: str, gender: str, birth_info: Dict,
                                  name_length: int = 2, count: int = 10) -> Dict:
        """分析八字并生成推荐名字"""
        try:
            # 生成推荐名字
            recommendations = self.name_generator.generate_names(
                surname, gender, birth_info, name_length, count
            )
            
            # 分析八字五行（用于显示给用户）
            bazi_result = self.name_generator.bazi_calculator.calculate_bazi(
                birth_info['year'], birth_info['month'], birth_info['day'],
                birth_info['hour'], gender, birth_info.get('calendar_type', 'solar')
            )
            
            wuxing_analysis = self.name_generator.wuxing_analyzer.analyze_bazi_wuxing(bazi_result)
            
            return {
                'success': True,
                'bazi_analysis': {
                    'paipan': bazi_result.get('paipan', {}),
                    'wuxing_analysis': wuxing_analysis
                },
                'recommendations': [
                    {
                        'full_name': rec.full_name,
                        'given_name': rec.given_name,
                        'overall_score': rec.overall_score,
                        'wuxing_analysis': rec.wuxing_analysis,
                        'sancai_wuge': rec.sancai_wuge,
                        'meaning_explanation': rec.meaning_explanation,
                        'pronunciation': rec.pronunciation,
                        'luck_level': rec.luck_level
                    }
                    for rec in recommendations
                ],
                'analysis_summary': wuxing_analysis.get('analysis_summary', ''),
                'naming_suggestions': self._generate_naming_suggestions(wuxing_analysis)
            }
            
        except Exception as e:
            print(f"起名分析错误: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'recommendations': []
            }
    
    def evaluate_specific_name(self, surname: str, given_name: str, gender: str, birth_info: Dict) -> Dict:
        """评估指定名字"""
        try:
            # 分析八字五行
            bazi_result = self.name_generator.bazi_calculator.calculate_bazi(
                birth_info['year'], birth_info['month'], birth_info['day'],
                birth_info['hour'], gender, birth_info.get('calendar_type', 'solar')
            )
            
            wuxing_analysis = self.name_generator.wuxing_analyzer.analyze_bazi_wuxing(bazi_result)
            
            # 评估名字
            evaluation = self.name_generator._evaluate_name(surname, given_name, wuxing_analysis, bazi_result)
            
            if evaluation:
                return {
                    'success': True,
                    'evaluation': {
                        'full_name': evaluation.full_name,
                        'given_name': evaluation.given_name,
                        'overall_score': evaluation.overall_score,
                        'wuxing_analysis': evaluation.wuxing_analysis,
                        'sancai_wuge': evaluation.sancai_wuge,
                        'meaning_explanation': evaluation.meaning_explanation,
                        'pronunciation': evaluation.pronunciation,
                        'luck_level': evaluation.luck_level
                    },
                    'bazi_analysis': wuxing_analysis
                }
            else:
                return {
                    'success': False,
                    'error': '名字评估失败'
                }
                
        except Exception as e:
            print(f"名字评估错误: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_naming_suggestions(self, wuxing_analysis: Dict) -> str:
        """生成起名建议"""
        xiyongshen = wuxing_analysis.get('xiyongshen', [])
        jishen = wuxing_analysis.get('jishen', [])
        
        suggestions = []
        suggestions.append(f"建议选用{'/'.join(xiyongshen)}属性的字")
        suggestions.append(f"避免使用{'/'.join(jishen)}属性的字")
        suggestions.append("注重名字的音韵和谐")
        suggestions.append("考虑字的寓意和文化内涵")
        
        return "；".join(suggestions) + "。"
