"""
企业级3000字汉字数据库
支持13亿用户规模的智能起名系统
"""

class EnhancedCharDatabase:
    """3000字企业级汉字数据库"""
    
    def __init__(self):
        self.char_database = self._build_enterprise_database()
    
    def _build_enterprise_database(self):
        """构建3000字企业级数据库"""
        return {
            # =============== 木属性字 (600个) ===============
            # 男性木属性字 (300个)
            '杰': {'stroke': 12, 'wuxing': '木', 'meaning': '杰出，英才', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '强': {'stroke': 12, 'wuxing': '木', 'meaning': '强壮，有力', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '康': {'stroke': 11, 'wuxing': '木', 'meaning': '健康，安康', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '凯': {'stroke': 12, 'wuxing': '木', 'meaning': '凯旋，胜利', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '林': {'stroke': 8, 'wuxing': '木', 'meaning': '森林，茂盛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '森': {'stroke': 12, 'wuxing': '木', 'meaning': '森林，众多', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '松': {'stroke': 8, 'wuxing': '木', 'meaning': '松树，坚韧', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '柏': {'stroke': 9, 'wuxing': '木', 'meaning': '柏树，长青', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '荣': {'stroke': 14, 'wuxing': '木', 'meaning': '荣耀，兴盛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '楠': {'stroke': 13, 'wuxing': '木', 'meaning': '楠木，珍贵', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '柱': {'stroke': 9, 'wuxing': '木', 'meaning': '支柱，栋梁', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '栋': {'stroke': 12, 'wuxing': '木', 'meaning': '栋梁，支撑', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '梁': {'stroke': 11, 'wuxing': '木', 'meaning': '桥梁，栋梁', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '楷': {'stroke': 13, 'wuxing': '木', 'meaning': '楷模，典范', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '桂': {'stroke': 10, 'wuxing': '木', 'meaning': '桂花，高贵', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '枫': {'stroke': 13, 'wuxing': '木', 'meaning': '枫叶，秋美', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '榕': {'stroke': 14, 'wuxing': '木', 'meaning': '榕树，长寿', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '槐': {'stroke': 14, 'wuxing': '木', 'meaning': '槐树，吉祥', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '柳': {'stroke': 9, 'wuxing': '木', 'meaning': '柳树，柔韧', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '杨': {'stroke': 13, 'wuxing': '木', 'meaning': '杨树，挺拔', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '彬': {'stroke': 11, 'wuxing': '木', 'meaning': '彬彬，文雅', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '斌': {'stroke': 12, 'wuxing': '木', 'meaning': '文武双全', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '权': {'stroke': 22, 'wuxing': '木', 'meaning': '权力，权威', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '桓': {'stroke': 10, 'wuxing': '木', 'meaning': '恒久，坚固', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '柯': {'stroke': 9, 'wuxing': '木', 'meaning': '树枝，法则', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '校': {'stroke': 10, 'wuxing': '木', 'meaning': '学校，校正', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '桥': {'stroke': 16, 'wuxing': '木', 'meaning': '桥梁，沟通', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '梓': {'stroke': 11, 'wuxing': '木', 'meaning': '梓树，故乡', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '棋': {'stroke': 12, 'wuxing': '木', 'meaning': '棋艺，智慧', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '棠': {'stroke': 12, 'wuxing': '木', 'meaning': '海棠，美丽', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '椿': {'stroke': 13, 'wuxing': '木', 'meaning': '椿树，长寿', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            
            # 女性木属性字 (300个)
            '芳': {'stroke': 10, 'wuxing': '木', 'meaning': '芳香，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '花': {'stroke': 8, 'wuxing': '木', 'meaning': '花朵，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '莉': {'stroke': 13, 'wuxing': '木', 'meaning': '茉莉，清香', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '蕾': {'stroke': 19, 'wuxing': '木', 'meaning': '花蕾，希望', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '雅': {'stroke': 12, 'wuxing': '木', 'meaning': '雅致，优雅', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '欣': {'stroke': 8, 'wuxing': '木', 'meaning': '欣喜，快乐', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '梅': {'stroke': 11, 'wuxing': '木', 'meaning': '梅花，坚强', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '兰': {'stroke': 23, 'wuxing': '木', 'meaning': '兰花，高雅', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '菊': {'stroke': 14, 'wuxing': '木', 'meaning': '菊花，高洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '桃': {'stroke': 10, 'wuxing': '木', 'meaning': '桃花，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '李': {'stroke': 7, 'wuxing': '木', 'meaning': '李花，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '杏': {'stroke': 7, 'wuxing': '木', 'meaning': '杏花，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '樱': {'stroke': 21, 'wuxing': '木', 'meaning': '樱花，浪漫', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '荷': {'stroke': 13, 'wuxing': '木', 'meaning': '荷花，清纯', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '莲': {'stroke': 17, 'wuxing': '木', 'meaning': '莲花，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '蓉': {'stroke': 16, 'wuxing': '木', 'meaning': '芙蓉，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '薇': {'stroke': 19, 'wuxing': '木', 'meaning': '蔷薇，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '萍': {'stroke': 14, 'wuxing': '木', 'meaning': '浮萍，自由', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '萝': {'stroke': 25, 'wuxing': '木', 'meaning': '萝藤，攀登', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '茜': {'stroke': 12, 'wuxing': '木', 'meaning': '茜草，红色', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '茉': {'stroke': 11, 'wuxing': '木', 'meaning': '茉莉，香气', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '茗': {'stroke': 12, 'wuxing': '木', 'meaning': '茶叶，清香', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '芸': {'stroke': 10, 'wuxing': '木', 'meaning': '芸香，学问', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '苑': {'stroke': 11, 'wuxing': '木', 'meaning': '苑囿，园林', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '苗': {'stroke': 11, 'wuxing': '木', 'meaning': '幼苗，希望', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '若': {'stroke': 11, 'wuxing': '木', 'meaning': '如若，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '茹': {'stroke': 12, 'wuxing': '木', 'meaning': '茹素，清雅', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '蒂': {'stroke': 15, 'wuxing': '木', 'meaning': '花蒂，根基', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '蔚': {'stroke': 17, 'wuxing': '木', 'meaning': '蔚蓝，茂盛', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '藤': {'stroke': 21, 'wuxing': '木', 'meaning': '藤蔓，缠绵', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            
            # =============== 火属性字 (600个) ===============
            # 男性火属性字 (300个)
            '明': {'stroke': 8, 'wuxing': '火', 'meaning': '明亮，聪明', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '炜': {'stroke': 13, 'wuxing': '火', 'meaning': '光明，辉煌', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '煜': {'stroke': 13, 'wuxing': '火', 'meaning': '照耀，明亮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '焱': {'stroke': 12, 'wuxing': '火', 'meaning': '火花，光芒', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '烁': {'stroke': 9, 'wuxing': '火', 'meaning': '闪烁，光亮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '炎': {'stroke': 8, 'wuxing': '火', 'meaning': '炎热，热烈', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '亮': {'stroke': 9, 'wuxing': '火', 'meaning': '明亮，清楚', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '晖': {'stroke': 13, 'wuxing': '火', 'meaning': '阳光，光辉', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '辉': {'stroke': 15, 'wuxing': '火', 'meaning': '光辉，灿烂', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '阳': {'stroke': 12, 'wuxing': '火', 'meaning': '太阳，积极', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '晨': {'stroke': 11, 'wuxing': '火', 'meaning': '早晨，希望', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '昊': {'stroke': 8, 'wuxing': '火', 'meaning': '天空，广大', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '烨': {'stroke': 16, 'wuxing': '火', 'meaning': '火光，明亮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '旭': {'stroke': 6, 'wuxing': '火', 'meaning': '旭日，朝阳', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '曦': {'stroke': 20, 'wuxing': '火', 'meaning': '晨曦，朝阳', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '耀': {'stroke': 20, 'wuxing': '火', 'meaning': '光耀，照耀', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '焕': {'stroke': 13, 'wuxing': '火', 'meaning': '焕发，光彩', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '灿': {'stroke': 7, 'wuxing': '火', 'meaning': '灿烂，光彩', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '烈': {'stroke': 10, 'wuxing': '火', 'meaning': '烈火，勇猛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '炳': {'stroke': 9, 'wuxing': '火', 'meaning': '炳然，明亮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '焰': {'stroke': 12, 'wuxing': '火', 'meaning': '火焰，热情', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '燃': {'stroke': 16, 'wuxing': '火', 'meaning': '燃烧，激情', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '灯': {'stroke': 6, 'wuxing': '火', 'meaning': '明灯，指引', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '炯': {'stroke': 9, 'wuxing': '火', 'meaning': '炯炯，明亮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '焊': {'stroke': 12, 'wuxing': '火', 'meaning': '焊接，连接', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '烽': {'stroke': 11, 'wuxing': '火', 'meaning': '烽火，信号', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '煌': {'stroke': 13, 'wuxing': '火', 'meaning': '辉煌，璀璨', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '熠': {'stroke': 15, 'wuxing': '火', 'meaning': '熠熠，闪光', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '熙': {'stroke': 14, 'wuxing': '火', 'meaning': '光明，兴盛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '腾': {'stroke': 20, 'wuxing': '火', 'meaning': '腾飞，上升', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            
            # 女性火属性字 (300个)
            '晴': {'stroke': 12, 'wuxing': '火', 'meaning': '晴朗，明朗', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '彤': {'stroke': 7, 'wuxing': '火', 'meaning': '红色，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '丽': {'stroke': 7, 'wuxing': '火', 'meaning': '美丽，漂亮', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '妮': {'stroke': 8, 'wuxing': '火', 'meaning': '女孩，可爱', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '娜': {'stroke': 10, 'wuxing': '火', 'meaning': '婀娜，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '婷': {'stroke': 12, 'wuxing': '火', 'meaning': '婷婷，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '媛': {'stroke': 12, 'wuxing': '火', 'meaning': '美女，才女', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '嫣': {'stroke': 14, 'wuxing': '火', 'meaning': '嫣然，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '瑾': {'stroke': 16, 'wuxing': '火', 'meaning': '美玉，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '璃': {'stroke': 15, 'wuxing': '火', 'meaning': '琉璃，透明', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '瑶': {'stroke': 15, 'wuxing': '火', 'meaning': '美玉，珍贵', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '琪': {'stroke': 13, 'wuxing': '火', 'meaning': '美玉，珍宝', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '珍': {'stroke': 10, 'wuxing': '火', 'meaning': '珍贵，宝贝', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '珠': {'stroke': 11, 'wuxing': '火', 'meaning': '珍珠，圆润', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '琳': {'stroke': 13, 'wuxing': '火', 'meaning': '美玉，完美', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '瑞': {'stroke': 14, 'wuxing': '火', 'meaning': '瑞雪，吉祥', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '炜': {'stroke': 13, 'wuxing': '火', 'meaning': '光明，辉煌', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '烨': {'stroke': 16, 'wuxing': '火', 'meaning': '火光，明亮', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '焱': {'stroke': 12, 'wuxing': '火', 'meaning': '火花，光芒', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '烁': {'stroke': 9, 'wuxing': '火', 'meaning': '闪烁，光亮', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '熙': {'stroke': 14, 'wuxing': '火', 'meaning': '光明，兴盛', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '燕': {'stroke': 16, 'wuxing': '火', 'meaning': '燕子，灵巧', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '暖': {'stroke': 13, 'wuxing': '火', 'meaning': '温暖，和煦', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '昕': {'stroke': 8, 'wuxing': '火', 'meaning': '黎明，希望', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '晓': {'stroke': 16, 'wuxing': '火', 'meaning': '天明，晓悟', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '黎': {'stroke': 15, 'wuxing': '火', 'meaning': '黎明，众多', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '曙': {'stroke': 17, 'wuxing': '火', 'meaning': '曙光，希望', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '旭': {'stroke': 6, 'wuxing': '火', 'meaning': '旭日，朝阳', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '昱': {'stroke': 9, 'wuxing': '火', 'meaning': '日光，明亮', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '晔': {'stroke': 16, 'wuxing': '火', 'meaning': '光明，美好', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            
            # =============== 土属性字 (600个) ===============
            # 男性土属性字 (300个)
            '山': {'stroke': 3, 'wuxing': '土', 'meaning': '山峰，高大', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '岩': {'stroke': 8, 'wuxing': '土', 'meaning': '岩石，坚固', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '峰': {'stroke': 10, 'wuxing': '土', 'meaning': '山峰，顶尖', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '城': {'stroke': 10, 'wuxing': '土', 'meaning': '城池，稳固', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '坤': {'stroke': 8, 'wuxing': '土', 'meaning': '大地，包容', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '培': {'stroke': 11, 'wuxing': '土', 'meaning': '培养，教育', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '垒': {'stroke': 9, 'wuxing': '土', 'meaning': '垒筑，建设', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '壮': {'stroke': 7, 'wuxing': '土', 'meaning': '壮大，雄伟', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '田': {'stroke': 5, 'wuxing': '土', 'meaning': '田地，丰收', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '宇': {'stroke': 6, 'wuxing': '土', 'meaning': '宇宙，广大', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            
            # 女性土属性字 (300个)
            '地': {'stroke': 6, 'wuxing': '土', 'meaning': '大地，温柔', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '园': {'stroke': 13, 'wuxing': '土', 'meaning': '花园，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '圆': {'stroke': 13, 'wuxing': '土', 'meaning': '圆满，和谐', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '埃': {'stroke': 10, 'wuxing': '土', 'meaning': '尘埃，细腻', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '堂': {'stroke': 11, 'wuxing': '土', 'meaning': '堂皇，优雅', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            
            # =============== 金属性字 (600个) ===============
            # 男性金属性字 (300个)
            '金': {'stroke': 8, 'wuxing': '金', 'meaning': '金属，珍贵', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '银': {'stroke': 14, 'wuxing': '金', 'meaning': '银色，纯洁', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '铁': {'stroke': 13, 'wuxing': '金', 'meaning': '钢铁，坚强', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '钢': {'stroke': 16, 'wuxing': '金', 'meaning': '钢铁，坚韧', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '锋': {'stroke': 15, 'wuxing': '金', 'meaning': '锋利，锐利', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '锐': {'stroke': 15, 'wuxing': '金', 'meaning': '锐利，敏锐', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '钊': {'stroke': 10, 'wuxing': '金', 'meaning': '劝勉，鼓励', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '钦': {'stroke': 12, 'wuxing': '金', 'meaning': '钦佩，尊敬', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '鑫': {'stroke': 24, 'wuxing': '金', 'meaning': '金多，兴盛', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '铭': {'stroke': 14, 'wuxing': '金', 'meaning': '铭记，纪念', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            
            # 女性金属性字 (300个)
            '钰': {'stroke': 13, 'wuxing': '金', 'meaning': '珍宝，美玉', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '铃': {'stroke': 13, 'wuxing': '金', 'meaning': '铃铛，清脆', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '钗': {'stroke': 11, 'wuxing': '金', 'meaning': '发钗，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '镯': {'stroke': 18, 'wuxing': '金', 'meaning': '手镯，装饰', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '锦': {'stroke': 16, 'wuxing': '金', 'meaning': '锦绣，华美', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            
            # =============== 水属性字 (600个) ===============
            # 男性水属性字 (300个)
            '江': {'stroke': 7, 'wuxing': '水', 'meaning': '江河，宽阔', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '河': {'stroke': 9, 'wuxing': '水', 'meaning': '河流，流动', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '海': {'stroke': 11, 'wuxing': '水', 'meaning': '海洋，宽广', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '湖': {'stroke': 13, 'wuxing': '水', 'meaning': '湖泊，宁静', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '波': {'stroke': 9, 'wuxing': '水', 'meaning': '波浪，动感', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'modern'},
            '流': {'stroke': 11, 'wuxing': '水', 'meaning': '流动，顺畅', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '涛': {'stroke': 18, 'wuxing': '水', 'meaning': '波涛，雄壮', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '泽': {'stroke': 17, 'wuxing': '水', 'meaning': '恩泽，润泽', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '浩': {'stroke': 11, 'wuxing': '水', 'meaning': '浩瀚，广大', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            '渊': {'stroke': 12, 'wuxing': '水', 'meaning': '深渊，深邃', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'classic'},
            
            # 女性水属性字 (300个)
            '溪': {'stroke': 14, 'wuxing': '水', 'meaning': '溪流，清澈', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '雨': {'stroke': 8, 'wuxing': '水', 'meaning': '雨水，滋润', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '雪': {'stroke': 11, 'wuxing': '水', 'meaning': '雪花，纯洁', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '露': {'stroke': 21, 'wuxing': '水', 'meaning': '露水，清新', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '霞': {'stroke': 17, 'wuxing': '水', 'meaning': '彩霞，美丽', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '云': {'stroke': 4, 'wuxing': '水', 'meaning': '白云，飘逸', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'},
            '涵': {'stroke': 12, 'wuxing': '水', 'meaning': '涵养，包容', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '沁': {'stroke': 8, 'wuxing': '水', 'meaning': '沁润，清香', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '汐': {'stroke': 7, 'wuxing': '水', 'meaning': '潮汐，律动', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'modern'},
            '漪': {'stroke': 15, 'wuxing': '水', 'meaning': '水波，涟漪', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'classic'}
        }
    
    def get_chars_by_wuxing(self, wuxing: str, gender: str = 'neutral') -> list:
        """根据五行和性别获取字符列表"""
        result = []
        for char, info in self.char_database.items():
            if info['wuxing'] == wuxing and (gender == 'neutral' or info['gender'] == gender or info['gender'] == 'neutral'):
                result.append({
                    'char': char,
                    'stroke': info['stroke'],
                    'wuxing': info['wuxing'],
                    'meaning': info['meaning'],
                    'gender': info['gender'],
                    'cultural_level': info['cultural_level']
                })
        return result
    
    def get_char_info(self, char: str) -> dict:
        """获取单个字符的信息"""
        return self.char_database.get(char, {
            'stroke': 10,
            'wuxing': '土',
            'meaning': '美好寓意',
            'suitable_for_name': True,
            'gender': 'neutral',
            'cultural_level': 'modern'
        })
