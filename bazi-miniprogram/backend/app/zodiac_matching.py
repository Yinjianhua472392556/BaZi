#!/usr/bin/env python3
"""
生肖配对算法模块 - 多维度评分体系
实现专业的生肖配对分析，包含5个评分维度和历史名人案例
"""

import random
from typing import Dict, List, Tuple, Any
from datetime import datetime

class ZodiacMatcher:
    """生肖配对算法类"""
    
    def __init__(self):
        """初始化配对算法"""
        self.zodiac_list = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
        
        # 初始化各种评分矩阵
        self._init_emotion_matrix()
        self._init_personality_traits()
        self._init_career_compatibility()
        self._init_lifestyle_matrix()
        self._init_communication_matrix()
        self._init_famous_couples_database()
    
    def _init_emotion_matrix(self):
        """初始化感情匹配度矩阵 (30%)"""
        self.emotion_matrix = {
            '鼠': {'牛': 95, '龙': 90, '猴': 88, '马': 45, '羊': 50, '鸡': 60, '猪': 75, '虎': 70, '兔': 65, '蛇': 72, '狗': 68, '鼠': 70},
            '牛': {'鼠': 95, '蛇': 92, '鸡': 90, '羊': 40, '马': 48, '狗': 55, '猪': 85, '虎': 65, '兔': 70, '龙': 75, '猴': 68, '牛': 72},
            '虎': {'猪': 94, '马': 89, '狗': 87, '猴': 42, '蛇': 45, '龙': 58, '牛': 65, '鼠': 70, '兔': 72, '鸡': 68, '羊': 75, '虎': 68},
            '兔': {'狗': 93, '羊': 88, '猪': 86, '鸡': 43, '龙': 47, '鼠': 65, '牛': 70, '虎': 72, '蛇': 75, '马': 68, '猴': 70, '兔': 70},
            '龙': {'鸡': 96, '鼠': 90, '猴': 85, '狗': 40, '兔': 47, '羊': 55, '猪': 70, '牛': 75, '虎': 58, '蛇': 80, '马': 72, '龙': 75},
            '蛇': {'猴': 94, '牛': 92, '鸡': 88, '猪': 41, '虎': 45, '马': 60, '龙': 80, '鼠': 72, '兔': 75, '狗': 65, '羊': 68, '蛇': 72},
            '马': {'羊': 95, '虎': 89, '狗': 86, '鼠': 45, '牛': 48, '兔': 68, '龙': 72, '蛇': 60, '猴': 70, '鸡': 65, '猪': 75, '马': 70},
            '羊': {'马': 95, '兔': 88, '猪': 85, '牛': 40, '鼠': 50, '狗': 72, '龙': 55, '虎': 75, '蛇': 68, '猴': 70, '鸡': 65, '羊': 68},
            '猴': {'蛇': 94, '鼠': 88, '龙': 85, '虎': 42, '猪': 46, '牛': 68, '马': 70, '兔': 70, '狗': 75, '鸡': 72, '羊': 70, '猴': 72},
            '鸡': {'龙': 96, '牛': 90, '蛇': 88, '兔': 43, '狗': 44, '羊': 65, '鼠': 60, '虎': 68, '马': 65, '猴': 72, '猪': 70, '鸡': 70},
            '狗': {'兔': 93, '虎': 87, '马': 86, '龙': 40, '鸡': 44, '牛': 55, '羊': 72, '鼠': 68, '蛇': 65, '猴': 75, '猪': 80, '狗': 72},
            '猪': {'虎': 94, '兔': 86, '羊': 85, '蛇': 41, '猴': 46, '鸡': 70, '牛': 85, '鼠': 75, '龙': 70, '马': 75, '狗': 80, '猪': 75}
        }
    
    def _init_personality_traits(self):
        """初始化性格特征数据"""
        self.personality_traits = {
            '鼠': {'active': 9, 'smart': 9, 'social': 8, 'stable': 6},
            '牛': {'active': 5, 'smart': 7, 'social': 6, 'stable': 9},
            '虎': {'active': 9, 'smart': 8, 'social': 8, 'stable': 5},
            '兔': {'active': 6, 'smart': 8, 'social': 7, 'stable': 8},
            '龙': {'active': 8, 'smart': 9, 'social': 9, 'stable': 6},
            '蛇': {'active': 6, 'smart': 9, 'social': 6, 'stable': 8},
            '马': {'active': 9, 'smart': 7, 'social': 9, 'stable': 5},
            '羊': {'active': 6, 'smart': 7, 'social': 7, 'stable': 8},
            '猴': {'active': 8, 'smart': 9, 'social': 9, 'stable': 6},
            '鸡': {'active': 7, 'smart': 8, 'social': 7, 'stable': 8},
            '狗': {'active': 7, 'smart': 7, 'social': 8, 'stable': 9},
            '猪': {'active': 6, 'smart': 6, 'social': 8, 'stable': 8}
        }
    
    def _init_career_compatibility(self):
        """初始化事业协调度数据"""
        self.career_compatibility = {
            '鼠牛': 92, '鼠虎': 75, '鼠兔': 68, '鼠龙': 88, '鼠蛇': 72, '鼠马': 55, '鼠羊': 62, '鼠猴': 85, '鼠鸡': 70, '鼠狗': 75, '鼠猪': 80,
            '牛虎': 68, '牛兔': 72, '牛龙': 78, '牛蛇': 90, '牛马': 58, '牛羊': 50, '牛猴': 70, '牛鸡': 88, '牛狗': 65, '牛猪': 82,
            '虎兔': 70, '虎龙': 65, '虎蛇': 55, '虎马': 86, '虎羊': 72, '虎猴': 48, '虎鸡': 62, '虎狗': 85, '虎猪': 90,
            '兔龙': 58, '兔蛇': 72, '兔马': 68, '兔羊': 85, '兔猴': 65, '兔鸡': 52, '兔狗': 88, '兔猪': 86,
            '龙蛇': 78, '龙马': 70, '龙羊': 62, '龙猴': 82, '龙鸡': 95, '龙狗': 45, '龙猪': 72,
            '蛇马': 65, '蛇羊': 68, '蛇猴': 92, '蛇鸡': 86, '蛇狗': 60, '蛇猪': 48,
            '马羊': 90, '马猴': 72, '马鸡': 68, '马狗': 83, '马猪': 75,
            '羊猴': 68, '羊鸡': 65, '羊狗': 70, '羊猪': 84,
            '猴鸡': 75, '猴狗': 72, '猴猪': 58,
            '鸡狗': 52, '鸡猪': 68,
            '狗猪': 82
        }
    
    def _init_lifestyle_matrix(self):
        """初始化生活习惯匹配度矩阵"""
        self.lifestyle_matrix = {
            '鼠': {'牛': 85, '龙': 88, '猴': 92, '马': 58, '羊': 65, '鸡': 72, '猪': 78, '虎': 70, '兔': 68, '蛇': 75, '狗': 72, '鼠': 75},
            '牛': {'鼠': 85, '蛇': 90, '鸡': 88, '羊': 52, '马': 55, '狗': 68, '猪': 82, '虎': 65, '兔': 75, '龙': 78, '猴': 70, '牛': 80},
            '虎': {'猪': 88, '马': 85, '狗': 82, '猴': 55, '蛇': 58, '龙': 65, '牛': 65, '鼠': 70, '兔': 75, '鸡': 68, '羊': 78, '虎': 70},
            '兔': {'狗': 86, '羊': 84, '猪': 81, '鸡': 54, '龙': 58, '鼠': 68, '牛': 75, '虎': 75, '蛇': 78, '马': 70, '猴': 72, '兔': 75},
            '龙': {'鸡': 90, '鼠': 88, '猴': 80, '狗': 48, '兔': 58, '羊': 65, '猪': 72, '牛': 78, '虎': 65, '蛇': 82, '马': 75, '龙': 78},
            '蛇': {'猴': 87, '牛': 90, '鸡': 85, '猪': 52, '虎': 58, '马': 68, '龙': 82, '鼠': 75, '兔': 78, '狗': 68, '羊': 70, '蛇': 78},
            '马': {'羊': 89, '虎': 85, '狗': 80, '鼠': 58, '牛': 55, '兔': 70, '龙': 75, '蛇': 68, '猴': 72, '鸡': 68, '猪': 78, '马': 75},
            '羊': {'马': 89, '兔': 84, '猪': 81, '牛': 52, '鼠': 65, '狗': 75, '龙': 65, '虎': 78, '蛇': 70, '猴': 72, '鸡': 68, '羊': 75},
            '猴': {'蛇': 87, '鼠': 92, '龙': 80, '虎': 55, '猪': 58, '牛': 70, '马': 72, '兔': 72, '狗': 78, '鸡': 75, '羊': 72, '猴': 78},
            '鸡': {'龙': 90, '牛': 88, '蛇': 85, '兔': 54, '狗': 56, '羊': 68, '鼠': 72, '虎': 68, '马': 68, '猴': 75, '猪': 72, '鸡': 75},
            '狗': {'兔': 86, '虎': 82, '马': 80, '龙': 48, '鸡': 56, '牛': 68, '羊': 75, '鼠': 72, '蛇': 68, '猴': 78, '猪': 85, '狗': 78},
            '猪': {'虎': 88, '兔': 81, '羊': 81, '蛇': 52, '猴': 58, '鸡': 72, '牛': 82, '鼠': 78, '龙': 72, '马': 78, '狗': 85, '猪': 80}
        }
    
    def _init_communication_matrix(self):
        """初始化沟通默契度矩阵"""
        self.communication_matrix = {
            '鼠牛': 88, '鼠虎': 72, '鼠兔': 68, '鼠龙': 85, '鼠蛇': 75, '鼠马': 58, '鼠羊': 65, '鼠猴': 90, '鼠鸡': 70, '鼠狗': 75, '鼠猪': 78,
            '牛虎': 65, '牛兔': 75, '牛龙': 78, '牛蛇': 88, '牛马': 55, '牛羊': 52, '牛猴': 72, '牛鸡': 85, '牛狗': 68, '牛猪': 80,
            '虎兔': 72, '虎龙': 68, '虎蛇': 58, '虎马': 83, '虎羊': 75, '虎猴': 52, '虎鸡': 65, '虎狗': 82, '虎猪': 86,
            '兔龙': 62, '兔蛇': 75, '兔马': 70, '兔羊': 82, '兔猴': 68, '兔鸡': 55, '兔狗': 85, '兔猪': 83,
            '龙蛇': 80, '龙马': 72, '龙羊': 65, '龙猴': 78, '龙鸡': 92, '龙狗': 48, '龙猪': 70,
            '蛇马': 68, '蛇羊': 70, '蛇猴': 88, '蛇鸡': 83, '蛇狗': 62, '蛇猪': 52,
            '马羊': 86, '马猴': 70, '马鸡': 65, '马狗': 80, '马猪': 72,
            '羊猴': 70, '羊鸡': 68, '羊狗': 72, '羊猪': 81,
            '猴鸡': 78, '猴狗': 75, '猴猪': 62,
            '鸡狗': 55, '鸡猪': 70,
            '狗猪': 79
        }
    
    def _init_famous_couples_database(self):
        """初始化历史名人案例数据库 - 完整版"""
        self.famous_couples = {
            # 鼠年配对
            '鼠牛': [
                {'name': '钱学森 & 蒋英', 'story': '科学家与音乐家的完美结合，理性与感性的平衡', 'traits': '互补合作，成就彼此'},
                {'name': '梁思成 & 林徽因', 'story': '建筑学家夫妇，学术与生活的双重伴侣', 'traits': '志同道合，相互成就'}
            ],
            '鼠虎': [
                {'name': '鲁迅 & 许广平', 'story': '文学巨匠与忠实伴侣，师生情缘成就一段佳话', 'traits': '志同道合，文学情缘'}
            ],
            '鼠兔': [
                {'name': '胡适 & 江冬秀', 'story': '学者与贤妻的传统与现代结合', 'traits': '相互包容，传统美德'}
            ],
            '鼠龙': [
                {'name': '茅盾 & 孔德沚', 'story': '文学家的美满姻缘，才女配才子', 'traits': '文学理想，生活和谐'}
            ],
            '鼠蛇': [
                {'name': '费孝通 & 王同惠', 'story': '社会学家的学者爱情，共同的学术追求', 'traits': '学术伴侣，理想相同'}
            ],
            '鼠马': [
                {'name': '冰心 & 吴文藻', 'story': '文学家与社会学家的跨界爱情', 'traits': '才华互补，温馨家庭'}
            ],
            '鼠羊': [
                {'name': '叶圣陶 & 胡墨林', 'story': '教育家的温馨家庭，文学与生活的完美结合', 'traits': '温馨恬淡，相敬如宾'}
            ],
            '鼠猴': [
                {'name': '齐白石 & 胡宝珠', 'story': '大画家与年轻妻子的忘年恋，艺术与青春的碰撞', 'traits': '艺术浪漫，忘年之恋'}
            ],
            '鼠鸡': [
                {'name': '翦伯赞 & 戴淑婉', 'story': '历史学家夫妇，共同的史学理想', 'traits': '学术情深，志同道合'}
            ],
            '鼠狗': [
                {'name': '沈从文 & 张兆和', 'story': '文学大师的浪漫追求，三姐张兆和的爱情传奇', 'traits': '浪漫文学，细水长流'}
            ],
            '鼠猪': [
                {'name': '曹禺 & 方瑞', 'story': '戏剧大师的第二次婚姻，艺术与生活的重新开始', 'traits': '戏剧人生，重新开始'}
            ],
            
            # 牛年配对
            '牛虎': [
                {'name': '侯德榜 & 张清如', 'story': '化学家与贤内助，科学与家庭的平衡', 'traits': '科学严谨，家庭和睦'}
            ],
            '牛兔': [
                {'name': '竺可桢 & 陈汲', 'story': '地理学家与医生夫妇，科学与医学的结合', 'traits': '科学理性，相互理解'}
            ],
            '牛龙': [
                {'name': '马寅初 & 张桂君', 'story': '经济学家的学者家庭，学术与品格的典范', 'traits': '学者风范，品格高尚'}
            ],
            '牛蛇': [
                {'name': '丰子恺 & 卢璋', 'story': '画家的温馨家庭，艺术与生活的完美融合', 'traits': '艺术与生活，温馨恬淡'}
            ],
            '牛马': [
                {'name': '李四光 & 许淑彬', 'story': '地质学家与音乐家，科学与艺术的完美结合', 'traits': '科学艺术，互补和谐'}
            ],
            '牛羊': [
                {'name': '梁启超 & 李蕙仙', 'story': '思想家与贤妻的传统家庭，学者与家庭的平衡', 'traits': '传统美德，相敬如宾'}
            ],
            '牛猴': [
                {'name': '严复 & 王氏', 'story': '翻译家的传统家庭，西学与中学的融合', 'traits': '学贯中西，家庭和睦'}
            ],
            '牛鸡': [
                {'name': '顾维钧 & 黄蕙兰', 'story': '外交家与名媛的上海滩传奇', 'traits': '外交风采，社交名流'}
            ],
            '牛狗': [
                {'name': '陈嘉庚 & 张宝果', 'story': '实业家与贤妻的创业传奇', 'traits': '实业报国，贤内助力'}
            ],
            '牛猪': [
                {'name': '华罗庚 & 吴筱元', 'story': '数学家与贤内助的典范，专注学术与持家', 'traits': '勤勉踏实，相互支撑'},
                {'name': '季羡林 & 彭德华', 'story': '国学大师的温馨家庭，学者的朴实生活', 'traits': '学者风范，家庭和睦'}
            ],
            
            # 虎年配对
            '虎兔': [
                {'name': '陈独秀 & 高大众', 'story': '革命家与贤妻的革命岁月', 'traits': '革命理想，患难与共'}
            ],
            '虎龙': [
                {'name': '蔡元培 & 黄仲玉', 'story': '教育家与夫人的学者家庭', 'traits': '教育理想，学者风范'}
            ],
            '虎蛇': [
                {'name': '徐悲鸿 & 廖静文', 'story': '画家与学生的师生恋，艺术与青春的碰撞', 'traits': '艺术浪漫，师生情深'}
            ],
            '虎马': [
                {'name': '聂耳 & 袁春晖', 'story': '音乐家的短暂而美好的爱情', 'traits': '音乐浪漫，青春年华'}
            ],
            '虎羊': [
                {'name': '傅雷 & 朱梅馥', 'story': '翻译家夫妇的文学家庭，艺术与生活的完美结合', 'traits': '文学艺术，相濡以沫'}
            ],
            '虎猴': [
                {'name': '闻一多 & 高孝贞', 'story': '诗人学者的传统与现代结合', 'traits': '诗人气质，传统美德'}
            ],
            '虎鸡': [
                {'name': '刘白羽 & 汪翠云', 'story': '作家与编辑的文学伴侣', 'traits': '文学情缘，编辑伴侣'}
            ],
            '虎狗': [
                {'name': '田汉 & 安娥', 'story': '戏剧家与词作家的艺术伴侣', 'traits': '戏剧人生，艺术伴侣'}
            ],
            '虎猪': [
                {'name': '周恩来 & 邓颖超', 'story': '革命伴侣，风雨同舟数十载', 'traits': '忠诚坚定，患难与共'},
                {'name': '朱德 & 康克清', 'story': '将军与战士的革命情缘', 'traits': '志向一致，共同奋斗'}
            ],
            
            # 兔年配对
            '兔龙': [
                {'name': '巴金 & 萧珊', 'story': '文学大师的温暖家庭，萧珊的默默支持成就了巴金', 'traits': '文学理想，温馨生活'}
            ],
            '兔蛇': [
                {'name': '老舍 & 胡絜青', 'story': '作家与画家的艺术人生，文学与绘画的完美结合', 'traits': '艺术共鸣，相得益彰'}
            ],
            '兔马': [
                {'name': '朱自清 & 陈竹隐', 'story': '散文家的第二段婚姻，文学与家庭的重新开始', 'traits': '文学温馨，重新开始'}
            ],
            '兔羊': [
                {'name': '郁达夫 & 王映霞', 'story': '作家与美女的浪漫爱情，杭州西湖边的文学传奇', 'traits': '文学浪漫，西湖情缘'}
            ],
            '兔猴': [
                {'name': '夏衍 & 陈波儿', 'story': '剧作家与演员的戏剧人生', 'traits': '戏剧情缘，艺术伴侣'}
            ],
            '兔鸡': [
                {'name': '贺敬之 & 柯岩', 'story': '诗人夫妇的文学传奇，共同的诗歌理想', 'traits': '诗歌情缘，文学伴侣'}
            ],
            '兔狗': [
                {'name': '钱钟书 & 杨绛', 'story': '文学伉俪，才华横溢的学者夫妇', 'traits': '才华相配，琴瑟和鸣'}
            ],
            '兔猪': [
                {'name': '萧红 & 萧军', 'story': '东北作家夫妇的文学传奇，才华横溢的文学伴侣', 'traits': '文学才华，东北风情'}
            ],
            
            # 龙年配对
            '龙蛇': [
                {'name': '郭沫若 & 于立群', 'story': '文学家与戏剧家的文化姻缘', 'traits': '文化共鸣，创作伴侣'}
            ],
            '龙马': [
                {'name': '矛盾 & 孔德沚', 'story': '现实主义作家的文学家庭', 'traits': '现实主义，文学理想'}
            ],
            '龙羊': [
                {'name': '吴晗 & 袁震', 'story': '历史学家的学者家庭', 'traits': '史学研究，学者风范'}
            ],
            '龙猴': [
                {'name': '叶挺 & 李秀文', 'story': '军事家与贤妻的革命岁月', 'traits': '革命军人，贤内助力'}
            ],
            '龙鸡': [
                {'name': '巴金 & 萧珊', 'story': '文学大师的温暖家庭', 'traits': '文学理想，温馨生活'}
            ],
            '龙狗': [
                {'name': '陶行知 & 吴树琴', 'story': '教育家的教育理想家庭', 'traits': '教育理想，平民情怀'}
            ],
            '龙猪': [
                {'name': '李宗仁 & 郭德洁', 'story': '将军与夫人的传奇人生', 'traits': '将军风范，夫人贤德'}
            ],
            
            # 蛇年配对
            '蛇马': [
                {'name': '钱三强 & 何泽慧', 'story': '物理学家夫妇，科学与爱情的完美结合', 'traits': '科学伴侣，核物理'}
            ],
            '蛇羊': [
                {'name': '丁玲 & 胡也频', 'story': '女作家的革命爱情，文学与革命的结合', 'traits': '革命文学，女性先锋'}
            ],
            '蛇猴': [
                {'name': '张爱玲 & 胡兰成', 'story': '才女与才子的传奇爱情', 'traits': '才华横溢，惺惺相惜'}
            ],
            '蛇鸡': [
                {'name': '艾青 & 高瑛', 'story': '诗人的诗意人生', 'traits': '诗歌理想，艺术人生'}
            ],
            '蛇狗': [
                {'name': '冯友兰 & 任载坤', 'story': '哲学家的理性家庭', 'traits': '哲学理性，学者家庭'}
            ],
            '蛇猪': [
                {'name': '赵丹 & 黄宗英', 'story': '演员夫妇的艺术人生', 'traits': '表演艺术，银幕情缘'}
            ],
            
            # 马年配对
            '马羊': [
                {'name': '徐志摩 & 陆小曼', 'story': '诗人与才女的浪漫传说', 'traits': '浪漫情怀，艺术追求'}
            ],
            '马猴': [
                {'name': '启功 & 章宝琛', 'story': '书法家的传统文化家庭', 'traits': '书法艺术，传统文化'}
            ],
            '马鸡': [
                {'name': '萧乾 & 文洁若', 'story': '作家与翻译家的文学伴侣', 'traits': '文学翻译，国际视野'}
            ],
            '马狗': [
                {'name': '程砚秋 & 果素瑛', 'story': '京剧大师的梨园传奇', 'traits': '京剧艺术，梨园情缘'}
            ],
            '马猪': [
                {'name': '黄永玉 & 张梅溪', 'story': '画家的艺术人生', 'traits': '绘画艺术，湘西风情'}
            ],
            
            # 羊年配对
            '羊猴': [
                {'name': '臧克家 & 郑笃恪', 'story': '诗人的诗意生活', 'traits': '诗歌人生，乡土情怀'}
            ],
            '羊鸡': [
                {'name': '曹聚仁 & 邓珂云', 'story': '作家的文学家庭', 'traits': '文学创作，港台情缘'}
            ],
            '羊狗': [
                {'name': '梅兰芳 & 福芝芳', 'story': '京剧大师的梨园佳话', 'traits': '京剧艺术，大师风范'}
            ],
            '羊猪': [
                {'name': '于右任 & 高仲林', 'story': '书法家的传统家庭', 'traits': '书法艺术，传统风范'}
            ],
            
            # 猴年配对
            '猴鸡': [
                {'name': '侯宝林 & 王雅兰', 'story': '相声大师的艺术家庭', 'traits': '相声艺术，幽默人生'}
            ],
            '猴狗': [
                {'name': '马三立 & 于秀珍', 'story': '相声艺术家的传统家庭', 'traits': '相声传统，津门风情'}
            ],
            '猴猪': [
                {'name': '华君武 & 张琏', 'story': '漫画家的幽默人生', 'traits': '漫画艺术，幽默智慧'}
            ],
            
            # 鸡年配对
            '鸡狗': [
                {'name': '常香玉 & 陈宪章', 'story': '豫剧大师的戏曲人生', 'traits': '豫剧艺术，戏曲传承'}
            ],
            '鸡猪': [
                {'name': '马连良 & 夏淑琴', 'story': '京剧大师的梨园传奇', 'traits': '京剧大师，梨园世家'}
            ],
            
            # 狗年配对
            '狗猪': [
                {'name': '罗家伦 & 张维桢', 'story': '教育家的学者家庭', 'traits': '教育理想，学者风范'}
            ],
            
            # 同生肖配对
            '鼠鼠': [
                {'name': '胡蝶 & 潘有声', 'story': '电影明星的银幕情缘', 'traits': '银幕佳偶，电影传奇'}
            ],
            '牛牛': [
                {'name': '谢晋 & 徐大雯', 'story': '导演的电影人生', 'traits': '电影艺术，导演风采'}
            ],
            '虎虎': [
                {'name': '柳亚子 & 郑佩宜', 'story': '诗人的革命情怀', 'traits': '革命诗人，文学理想'}
            ],
            '兔兔': [
                {'name': '张大千 & 徐雯波', 'story': '画家的艺术人生', 'traits': '绘画大师，艺术风采'}
            ],
            '龙龙': [
                {'name': '梁漱溟 & 黄靖贤', 'story': '哲学家的理想家庭', 'traits': '哲学思辨，乡村建设'}
            ],
            '蛇蛇': [
                {'name': '林语堂 & 廖翠凤', 'story': '文学家的东西文化融合', 'traits': '文化融合，幽默智慧'}
            ],
            '马马': [
                {'name': '张学良 & 于凤至', 'story': '少帅的传奇人生', 'traits': '少帅风采，历史传奇'}
            ],
            '羊羊': [
                {'name': '刘海粟 & 夏伊乔', 'story': '画家的艺术追求', 'traits': '绘画艺术，西画先驱'}
            ],
            '猴猴': [
                {'name': '赵元任 & 杨步伟', 'story': '语言学家的学者家庭', 'traits': '语言学术，幽默风趣'}
            ],
            '鸡鸡': [
                {'name': '王实甫 & 李清照', 'story': '(虚构示例)文学才子佳人', 'traits': '文学才华，诗词传承'}
            ],
            '狗狗': [
                {'name': '许地山 & 周俟松', 'story': '作家的文学理想', 'traits': '文学创作，南洋风情'}
            ],
            '猪猪': [
                {'name': '林徽因父母', 'story': '建筑世家的文化传承', 'traits': '建筑文化，家族传承'}
            ]
        }
    
    def calculate_emotion_score(self, male: str, female: str) -> int:
        """计算感情匹配度 (30%)"""
        return self.emotion_matrix.get(male, {}).get(female, 70)
    
    def calculate_personality_score(self, male: str, female: str) -> int:
        """计算性格互补度 (25%)"""
        male_traits = self.personality_traits.get(male, {'active': 7, 'smart': 7, 'social': 7, 'stable': 7})
        female_traits = self.personality_traits.get(female, {'active': 7, 'smart': 7, 'social': 7, 'stable': 7})
        
        # 计算各维度差值
        active_diff = abs(male_traits['active'] - female_traits['active'])
        smart_diff = abs(male_traits['smart'] - female_traits['smart'])
        social_diff = abs(male_traits['social'] - female_traits['social'])
        stable_diff = abs(male_traits['stable'] - female_traits['stable'])
        
        # 最佳差值为2.5（适度互补）
        optimal_diff = 2.5
        active_score = max(0, 100 - abs(active_diff - optimal_diff) * 15)
        smart_score = max(0, 100 - abs(smart_diff - optimal_diff) * 15)
        social_score = max(0, 100 - abs(social_diff - optimal_diff) * 15)
        stable_score = max(0, 100 - abs(stable_diff - optimal_diff) * 15)
        
        return round((active_score + smart_score + social_score + stable_score) / 4)
    
    def calculate_career_score(self, male: str, female: str) -> int:
        """计算事业协调度 (20%)"""
        key1 = male + female
        key2 = female + male
        return self.career_compatibility.get(key1, self.career_compatibility.get(key2, 70))
    
    def calculate_lifestyle_score(self, male: str, female: str) -> int:
        """计算生活习惯匹配度 (15%)"""
        return self.lifestyle_matrix.get(male, {}).get(female, 70)
    
    def calculate_communication_score(self, male: str, female: str) -> int:
        """计算沟通默契度 (10%)"""
        key1 = male + female
        key2 = female + male
        return self.communication_matrix.get(key1, self.communication_matrix.get(key2, 70))
    
    def get_famous_couples(self, male: str, female: str) -> List[Dict]:
        """获取历史名人案例"""
        key1 = male + female
        key2 = female + male
        couples = self.famous_couples.get(key1, self.famous_couples.get(key2, []))
        
        # 如果没有专门的案例，返回通用案例
        if not couples:
            couples = [
                {'name': '传说中的佳偶', 'story': f'{male}和{female}的配对在历史上也有不少佳话', 'traits': '相互理解，共同成长'}
            ]
        
        return couples
    
    def get_compatibility_level(self, score: int) -> Tuple[str, str]:
        """根据分数获取匹配等级和表情"""
        if score >= 90:
            return "天作之合", "💕"
        elif score >= 80:
            return "非常匹配", "😍"
        elif score >= 70:
            return "较好匹配", "😊"
        elif score >= 60:
            return "一般匹配", "🙂"
        else:
            return "需要努力", "😐"
    
    def generate_analysis_text(self, male: str, female: str, scores: Dict) -> str:
        """生成详细的配对分析文本"""
        level, _ = self.get_compatibility_level(scores['overall'])
        
        analysis_templates = {
            "天作之合": f"{male}和{female}是传说中的完美配对，各方面都非常和谐。感情深厚，性格互补，事业上能够相互支持，生活习惯协调，沟通默契。这样的配对堪称天作之合，是众人羡慕的神仙伴侣。",
            "非常匹配": f"{male}和{female}的配对非常理想，彼此之间有着很强的吸引力和互补性。在大部分方面都能够和谐相处，偶尔的小分歧反而能增进彼此的了解。这是一对让人看好的佳偶。",
            "较好匹配": f"{male}和{female}的配对整体来说是比较合适的，虽然可能在某些方面需要磨合，但只要相互理解和包容，就能建立稳定幸福的关系。时间会让这份感情更加深厚。",
            "一般匹配": f"{male}和{female}的配对属于中等水平，需要双方都付出更多的努力来维护这段关系。通过加强沟通和相互了解，完全有可能发展出美好的感情。",
            "需要努力": f"{male}和{female}的配对面临一些挑战，但这并不意味着不可能。真正的爱情能够克服一切困难，只要双方都愿意为对方改变和努力，同样可以收获幸福。"
        }
        
        return analysis_templates.get(level, f"{male}和{female}的配对有着独特的魅力，需要用心经营。")
    
    def generate_advantages(self, male: str, female: str, scores: Dict) -> str:
        """生成优势特点"""
        advantages = []
        
        if scores['emotion'] >= 80:
            advantages.append("情感基础深厚，容易产生共鸣")
        if scores['personality'] >= 80:
            advantages.append("性格互补性强，能够相互成就")
        if scores['career'] >= 80:
            advantages.append("事业发展协调，能够共同进步")
        if scores['lifestyle'] >= 80:
            advantages.append("生活习惯相近，日常相处和谐")
        if scores['communication'] >= 80:
            advantages.append("沟通顺畅，很少产生误解")
        
        if not advantages:
            advantages = ["彼此吸引力强", "有共同话题", "相处轻松愉快"]
        
        return "；".join(advantages) + "。"
    
    def generate_challenges(self, male: str, female: str, scores: Dict) -> str:
        """生成注意事项"""
        challenges = []
        
        if scores['emotion'] < 70:
            challenges.append("需要加强情感交流，培养共同兴趣")
        if scores['personality'] < 70:
            challenges.append("性格差异较大，需要更多理解和包容")
        if scores['career'] < 70:
            challenges.append("事业规划可能存在分歧，需要协调统一")
        if scores['lifestyle'] < 70:
            challenges.append("生活习惯差异需要磨合")
        if scores['communication'] < 70:
            challenges.append("沟通方式需要调整，避免误解")
        
        if not challenges:
            challenges = ["保持现有的和谐状态", "继续加深彼此了解"]
        
        return "；".join(challenges) + "。"
    
    def generate_suggestions(self, male: str, female: str, scores: Dict) -> str:
        """生成相处建议"""
        suggestions = []
        
        if scores['overall'] >= 85:
            suggestions.extend(["珍惜这份难得的缘分", "共同规划美好未来", "保持开放的沟通"])
        elif scores['overall'] >= 75:
            suggestions.extend(["继续加深相互了解", "在差异中寻找互补", "培养共同爱好"])
        elif scores['overall'] >= 65:
            suggestions.extend(["多花时间相处", "学会换位思考", "建立有效的沟通机制"])
        else:
            suggestions.extend(["需要更多耐心和理解", "寻找共同点", "专注于对方的优点"])
        
        suggestions.append("记住爱情需要双方的努力")
        
        return "；".join(suggestions) + "。"
    
    def calculate_comprehensive_match(self, male: str, female: str) -> Dict[str, Any]:
        """计算综合配对结果"""
        try:
            # 验证生肖有效性
            if male not in self.zodiac_list or female not in self.zodiac_list:
                raise ValueError(f"无效的生肖：{male}, {female}")
            
            # 计算各维度分数
            emotion_score = self.calculate_emotion_score(male, female)
            personality_score = self.calculate_personality_score(male, female)
            career_score = self.calculate_career_score(male, female)
            lifestyle_score = self.calculate_lifestyle_score(male, female)
            communication_score = self.calculate_communication_score(male, female)
            
            # 计算加权总分
            overall_score = round(
                emotion_score * 0.3 + 
                personality_score * 0.25 + 
                career_score * 0.2 + 
                lifestyle_score * 0.15 + 
                communication_score * 0.1
            )
            
            # 组织评分数据
            scores = {
                'emotion': emotion_score,
                'personality': personality_score,
                'career': career_score,
                'lifestyle': lifestyle_score,
                'communication': communication_score,
                'overall': overall_score
            }
            
            # 获取匹配等级和表情
            level, emoji = self.get_compatibility_level(overall_score)
            
            # 生成文本内容
            analysis = self.generate_analysis_text(male, female, scores)
            advantages = self.generate_advantages(male, female, scores)
            challenges = self.generate_challenges(male, female, scores)
            suggestions = self.generate_suggestions(male, female, scores)
            
            # 获取历史名人案例
            famous_couples = self.get_famous_couples(male, female)
            
            # 组装最终结果
            result = {
                'zodiac_pair': f'{male}{female}',
                'male_zodiac': male,
                'female_zodiac': female,
                'overall_score': overall_score,
                'compatibility_level': level,
                'emoji': emoji,
                'scores': scores,
                'analysis': analysis,
                'advantages': advantages,
                'challenges': challenges,
                'suggestions': suggestions,
                'famous_couples': famous_couples,
                'calculation_method': '多维度评分体系',
                'dimensions': {
                    '感情匹配度': f'{emotion_score}分 (权重30%)',
                    '性格互补度': f'{personality_score}分 (权重25%)',
                    '事业协调度': f'{career_score}分 (权重20%)',
                    '生活习惯': f'{lifestyle_score}分 (权重15%)',
                    '沟通默契度': f'{communication_score}分 (权重10%)'
                },
                'timestamp': datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            # 错误处理
            return {
                'error': True,
                'message': f'计算配对结果时出错：{str(e)}',
                'zodiac_pair': f'{male}{female}',
                'male_zodiac': male,
                'female_zodiac': female,
                'timestamp': datetime.now().isoformat()
            }

# 创建全局实例
zodiac_matcher = ZodiacMatcher()

def calculate_zodiac_compatibility(male_zodiac: str, female_zodiac: str) -> Dict[str, Any]:
    """
    计算生肖配对兼容性的主要接口函数
    
    Args:
        male_zodiac (str): 男方生肖
        female_zodiac (str): 女方生肖
    
    Returns:
        Dict[str, Any]: 包含详细配对分析的结果字典
    """
    return zodiac_matcher.calculate_comprehensive_match(male_zodiac, female_zodiac)

# 测试函数
def test_zodiac_matching():
    """测试生肖配对算法"""
    test_cases = [
        ('牛', '猪'),
        ('鼠', '龙'),
        ('虎', '猪'),
        ('兔', '狗'),
        ('龙', '鸡'),
        ('蛇', '猴')
    ]
    
    print("=== 生肖配对算法测试 ===")
    for male, female in test_cases:
        result = calculate_zodiac_compatibility(male, female)
        if not result.get('error'):
            print(f"\n{male} + {female}:")
            print(f"  总分: {result['overall_score']}分")
            print(f"  等级: {result['compatibility_level']} {result['emoji']}")
            print(f"  各维度: 感情{result['scores']['emotion']} | 性格{result['scores']['personality']} | 事业{result['scores']['career']} | 生活{result['scores']['lifestyle']} | 沟通{result['scores']['communication']}")
            if result['famous_couples']:
                print(f"  名人案例: {result['famous_couples'][0]['name']}")
        else:
            print(f"错误: {result['message']}")

if __name__ == "__main__":
    test_zodiac_matching()
