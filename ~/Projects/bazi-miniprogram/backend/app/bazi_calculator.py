"""
八字计算模块 - 简化算法实现
使用传统八字理论进行计算
"""
from datetime import datetime

class BaziCalculator:
    """八字计算器"""
    
    def __init__(self):
        # 天干地支
        self.tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
        self.dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        
        # 五行对应关系
        self.wuxing_tiangan = {
            '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
            '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
        }
        
        self.wuxing_dizhi = {
            '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
            '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
        }
        
        # 时辰对应关系 (24小时制到地支的映射)
        self.hour_to_dizhi = {
            23: '子', 0: '子', 1: '丑', 2: '丑', 3: '寅', 4: '寅',
            5: '卯', 6: '卯', 7: '辰', 8: '辰', 9: '巳', 10: '巳',
            11: '午', 12: '午', 13: '未', 14: '未', 15: '申', 16: '申',
            17: '酉', 18: '酉', 19: '戌', 20: '戌', 21: '亥', 22: '亥'
        }
        
        # 简化版本，不使用外部万年历库
    
    def calculate_bazi(self, year, month, day, hour, gender="male"):
        """
        计算八字 - 简化版实现
        """
        try:
            # 简化版八字计算，不依赖复杂的库
            # 计算年柱 (使用简化算法)
            year_gan_index = (year - 4) % 10
            year_zhi_index = (year - 4) % 12
            year_gan = self.tiangan[year_gan_index]
            year_zhi = self.dizhi[year_zhi_index]
            year_zhu = year_gan + year_zhi
            
            # 计算月柱 (简化算法)
            month_gan_index = (year_gan_index % 5 * 2 + month - 1) % 10
            month_zhi_index = (month + 1) % 12  # 简化的月支计算
            month_gan = self.tiangan[month_gan_index]
            month_zhi = self.dizhi[month_zhi_index]
            month_zhu = month_gan + month_zhi
            
            # 计算日柱 (使用日期作为基础)
            day_offset = (year - 1900) * 365 + month * 30 + day
            day_gan_index = day_offset % 10
            day_zhi_index = day_offset % 12
            day_gan = self.tiangan[day_gan_index]
            day_zhi = self.dizhi[day_zhi_index]
            day_zhu = day_gan + day_zhi
            
            # 计算时柱
            hour_zhi = self.hour_to_dizhi.get(hour, '午')
            hour_zhi_index = self.dizhi.index(hour_zhi)
            hour_gan_index = (day_gan_index % 5 * 2 + hour_zhi_index) % 10
            hour_gan = self.tiangan[hour_gan_index]
            hour_zhu = hour_gan + hour_zhi
            
            # 组成八字
            bazi = {
                "year": year_zhu,
                "month": month_zhu,
                "day": day_zhu,
                "hour": hour_zhu
            }
            
            # 计算五行分布
            wuxing_count = self.calculate_wuxing(bazi)
            
            # 生成八字分析
            analysis = self.generate_analysis(bazi, wuxing_count, gender)
            
            # 计算大运流年
            dayun = self.calculate_dayun(bazi, year, gender)
            
            # 今日运势
            today_fortune = self.calculate_today_fortune(bazi)
            
            return {
                "bazi": bazi,
                "wuxing": wuxing_count,
                "analysis": analysis,
                "dayun": dayun,
                "today_fortune": today_fortune,
                "lunar_info": {
                    "year": year,
                    "month": month,
                    "day": day,
                    "leap": False
                }
            }
            
        except Exception as e:
            print(f"八字计算详细错误: {str(e)}")
            raise Exception(f"八字计算出错: {str(e)}")
    
    def get_month_gan(self, lunar_year, lunar_month):
        """根据年干和月份计算月干"""
        year_gan_index = (lunar_year - 4) % 10
        month_gan_index = (year_gan_index % 5 * 2 + lunar_month - 1) % 10
        return self.tiangan[month_gan_index]
    
    def get_month_zhi(self, lunar_month):
        """获取月支"""
        month_zhi_map = {
            1: '寅', 2: '卯', 3: '辰', 4: '巳', 5: '午', 6: '未',
            7: '申', 8: '酉', 9: '戌', 10: '亥', 11: '子', 12: '丑'
        }
        return month_zhi_map.get(lunar_month, '寅')
    
    def get_hour_gan(self, day_gan_index, hour):
        """根据日干和时辰计算时干"""
        hour_zhi_index = self.get_hour_zhi_index(hour)
        hour_gan_index = (day_gan_index % 5 * 2 + hour_zhi_index) % 10
        return self.tiangan[hour_gan_index]
    
    def get_hour_zhi_index(self, hour):
        """获取时支索引"""
        hour_zhi = self.hour_to_dizhi.get(hour, '午')
        return self.dizhi.index(hour_zhi)
    
    def calculate_wuxing(self, bazi):
        """计算五行分布"""
        wuxing_count = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
        
        for zhu in bazi.values():
            gan = zhu[0]
            zhi = zhu[1]
            
            # 天干五行
            wuxing_count[self.wuxing_tiangan[gan]] += 1
            # 地支五行
            wuxing_count[self.wuxing_dizhi[zhi]] += 1
        
        return wuxing_count
    
    def generate_analysis(self, bazi, wuxing_count, gender):
        """生成八字分析"""
        day_gan = bazi["day"][0]
        
        # 基础性格分析
        personality = self.get_personality_by_day_gan(day_gan)
        
        # 五行平衡分析
        wuxing_analysis = self.analyze_wuxing_balance(wuxing_count)
        
        # 事业运势
        career = self.analyze_career(day_gan, wuxing_count)
        
        # 感情运势
        love = self.analyze_love(day_gan, gender, wuxing_count)
        
        return {
            "personality": personality,
            "wuxing_analysis": wuxing_analysis,
            "career": career,
            "love": love,
            "summary": f"您的日主为{day_gan}，{personality[:20]}...{wuxing_analysis[:20]}..."
        }
    
    def get_personality_by_day_gan(self, day_gan):
        """根据日干分析性格"""
        personalities = {
            '甲': "性格直爽，有领导能力，积极向上，但有时过于固执。适合开创性工作。",
            '乙': "性格温和，善于协调，富有同情心，但有时缺乏决断力。适合服务性工作。",
            '丙': "性格热情，富有创造力，乐观开朗，但有时过于冲动。适合表现性工作。",
            '丁': "性格细腻，重视细节，有艺术天赋，但有时过于敏感。适合精细化工作。",
            '戊': "性格稳重，踏实可靠，有包容心，但有时过于保守。适合管理性工作。",
            '己': "性格温和，善于沟通，有亲和力，但有时缺乏主见。适合协调性工作。",
            '庚': "性格坚毅，执行力强，有正义感，但有时过于严厉。适合执法性工作。",
            '辛': "性格精明，善于变通，有商业头脑，但有时过于计较。适合商业性工作。",
            '壬': "性格智慧，适应性强，有远见，但有时过于理想化。适合智力性工作。",
            '癸': "性格内敛，善于思考，有洞察力，但有时过于消极。适合研究性工作。"
        }
        return personalities.get(day_gan, "性格独特，具有自己的特色。")
    
    def analyze_wuxing_balance(self, wuxing_count):
        """分析五行平衡"""
        max_element = max(wuxing_count.items(), key=lambda x: x[1])
        min_element = min(wuxing_count.items(), key=lambda x: x[1])
        
        if max_element[1] - min_element[1] > 3:
            return f"五行分布不够均衡，{max_element[0]}过旺，{min_element[0]}偏弱。建议在生活中多接触{min_element[0]}元素相关的事物。"
        else:
            return "五行分布相对均衡，整体运势平稳，各方面发展较为协调。"
    
    def analyze_career(self, day_gan, wuxing_count):
        """事业运势分析"""
        career_mapping = {
            '甲': "适合创业、管理、林业、教育等行业。", '乙': "适合艺术、花卉、纺织、中介等行业。",
            '丙': "适合能源、电子、娱乐、广告等行业。", '丁': "适合文化、出版、照明、美容等行业。",
            '戊': "适合建筑、房地产、农业、陶瓷等行业。", '己': "适合服务、食品、咨询、秘书等行业。",
            '庚': "适合金属、机械、汽车、军警等行业。", '辛': "适合金融、珠宝、医疗、法律等行业。",
            '壬': "适合贸易、运输、旅游、水利等行业。", '癸': "适合研究、化工、医药、信息等行业。"
        }
        base_career = career_mapping.get(day_gan, "")
        
        # 根据五行分布调整建议
        dominant_element = max(wuxing_count.items(), key=lambda x: x[1])[0]
        if dominant_element == '金':
            return base_career + " 金旺适合从事金融、科技相关工作。"
        elif dominant_element == '木':
            return base_career + " 木旺适合从事教育、环保相关工作。"
        elif dominant_element == '水':
            return base_career + " 水旺适合从事贸易、物流相关工作。"
        elif dominant_element == '火':
            return base_career + " 火旺适合从事媒体、能源相关工作。"
        else:
            return base_career + " 土旺适合从事房地产、建筑相关工作。"
    
    def analyze_love(self, day_gan, gender, wuxing_count):
        """感情运势分析"""
        if gender == 'male':
            return "感情方面较为主动，容易获得异性青睐。建议在感情中保持真诚，避免过于强势。"
        else:
            return "感情方面较为细腻，重视精神层面的交流。建议在感情中保持独立，寻找志同道合的伴侣。"
    
    def calculate_dayun(self, bazi, birth_year, gender):
        """计算大运"""
        current_year = datetime.now().year
        age = current_year - birth_year
        
        # 简化的大运计算
        dayun_period = (age // 10) + 1
        
        return {
            "current_age": age,
            "dayun_period": dayun_period,
            "description": f"当前处于第{dayun_period}个大运期，建议把握机遇，稳步发展。"
        }
    
    def calculate_today_fortune(self, bazi):
        """计算今日运势"""
        today = datetime.now()
        day_gan = bazi["day"][0]
        
        # 根据今日和日主的关系给出运势
        fortune_score = (today.day + today.month) % 5 + 6  # 6-10分
        
        fortune_text = {
            6: "今日运势一般，宜静不宜动。",
            7: "今日运势尚可，适合处理日常事务。",
            8: "今日运势不错，适合推进重要计划。",
            9: "今日运势很好，适合开展新项目。",
            10: "今日运势极佳，万事亨通。"
        }
        
        return {
            "score": fortune_score,
            "description": fortune_text[fortune_score],
            "suggestion": "保持积极心态，顺应自然规律。"
        }
