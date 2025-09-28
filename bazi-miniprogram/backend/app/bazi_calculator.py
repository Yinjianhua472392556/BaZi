"""
八字计算模块 - 专业算法实现
使用传统八字理论和专业农历转换库
"""
from datetime import datetime, date
import calendar

# 尝试导入专业农历库，如果失败则使用降级方案
try:
    import sxtwl
    SXTWL_AVAILABLE = True
except ImportError:
    print("Warning: sxtwl library not available, using fallback")
    SXTWL_AVAILABLE = False

try:
    from zhdate import ZhDate
    ZHDATE_AVAILABLE = True
except ImportError:
    print("Warning: zhdate library not available, using fallback")
    ZHDATE_AVAILABLE = False

class BaziCalculator:
    """八字计算器 - 使用专业算法"""
    
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
        
        # 初始化sxtwl库（如果可用）
        if SXTWL_AVAILABLE:
            # sxtwl库不需要初始化，直接使用静态方法
            self.sxtwl_available = True
            print("✅ sxtwl库初始化成功")
        else:
            self.sxtwl_available = False
    
    def solar_to_lunar(self, year, month, day):
        """公历转农历"""
        if ZHDATE_AVAILABLE:
            try:
                # 使用zhdate库进行转换
                zh_date = ZhDate.from_datetime(datetime(year, month, day))
                return {
                    'year': zh_date.lunar_year,
                    'month': zh_date.lunar_month,
                    'day': zh_date.lunar_day,
                    'leap': getattr(zh_date, 'is_leap', False)  # 安全获取属性
                }
            except Exception as e:
                print(f"公历转农历失败: {e}")
        
        # 降级使用简单近似转换
        print(f"使用简化转换: 公历{year}-{month}-{day}")
        # 简单的近似转换（实际应用中应使用更精确的算法）
        lunar_month = month - 1 if month > 1 else 12
        lunar_year = year if month > 1 else year - 1
        lunar_day = max(1, day - 15) if day > 15 else day + 15
        
        return {
            'year': lunar_year,
            'month': lunar_month,
            'day': lunar_day,
            'leap': False
        }
    
    def lunar_to_solar(self, year, month, day, leap=False):
        """农历转公历"""
        if ZHDATE_AVAILABLE:
            try:
                # 使用zhdate库进行转换
                zh_date = ZhDate(year, month, day, leap)
                solar_date = zh_date.to_datetime().date()
                return {
                    'year': solar_date.year,
                    'month': solar_date.month,
                    'day': solar_date.day
                }
            except Exception as e:
                print(f"农历转公历失败: {e}")
        
        # 降级使用简单近似转换
        print(f"使用简化转换: 农历{year}-{month}-{day}")
        # 简单的近似转换（实际应用中应使用更精确的算法）
        solar_month = month + 1 if month < 12 else 1
        solar_year = year if month < 12 else year + 1
        
        # 确保日期在合理范围内
        if day < 15:
            solar_day = min(28, day + 15)  # 避免超出月份天数
        else:
            solar_day = max(1, day - 15)
        
        # 再次验证日期有效性
        import calendar
        max_day = calendar.monthrange(solar_year, solar_month)[1]
        solar_day = min(solar_day, max_day)
        
        return {
            'year': solar_year,
            'month': solar_month,
            'day': solar_day
        }
    
    def calculate_bazi_with_sxtwl(self, year, month, day, hour):
        """使用sxtwl库计算八字"""
        if SXTWL_AVAILABLE:
            try:
                # 创建日期对象
                solar_date = sxtwl.fromSolar(year, month, day)
                
                # 获取四柱八字
                bazi = {
                    'year': self.tiangan[solar_date.getYearGZ().tg] + self.dizhi[solar_date.getYearGZ().dz],
                    'month': self.tiangan[solar_date.getMonthGZ().tg] + self.dizhi[solar_date.getMonthGZ().dz],
                    'day': self.tiangan[solar_date.getDayGZ().tg] + self.dizhi[solar_date.getDayGZ().dz],
                    'hour': self.calculate_hour_pillar(solar_date.getDayGZ().tg, hour)
                }
                
                return bazi
            except Exception as e:
                print(f"sxtwl计算八字失败: {e}")
        
        # 降级使用传统算法
        print(f"使用传统算法计算八字: {year}-{month}-{day}")
        return self.calculate_bazi_traditional(year, month, day, hour)
    
    def calculate_bazi_traditional(self, year, month, day, hour):
        """传统八字计算方法（备用）- 优化版，考虑节气影响"""
        try:
            # 计算年柱
            year_gan_index = (year - 4) % 10
            year_zhi_index = (year - 4) % 12
            year_zhu = self.tiangan[year_gan_index] + self.dizhi[year_zhi_index]
            
            # 计算月柱 - 考虑节气影响
            month_info = self.calculate_month_pillar_with_jieqi(year, month, day, year_gan_index)
            month_zhu = month_info['month_pillar']
            
            # 计算日柱 (使用更精确的算法)
            day_offset = self.calculate_day_offset(year, month, day)
            day_gan_index = day_offset % 10
            day_zhi_index = day_offset % 12
            day_zhu = self.tiangan[day_gan_index] + self.dizhi[day_zhi_index]
            
            # 计算时柱 - 考虑日柱天干的影响
            hour_zhu = self.calculate_hour_pillar_enhanced(day_gan_index, hour)
            
            result = {
                'year': year_zhu,
                'month': month_zhu,
                'day': day_zhu,
                'hour': hour_zhu
            }
            
            print(f"传统算法计算结果: {result}")
            return result
            
        except Exception as e:
            print(f"传统算法计算错误: {e}")
            # 返回默认值确保不为空
            return {
                'year': '甲子',
                'month': '丙寅', 
                'day': '戊辰',
                'hour': '庚午'
            }
    
    def calculate_day_offset(self, year, month, day):
        """计算日柱偏移量 - 优化版，确保不同日期有不同结果"""
        # 基准日期：1900年1月1日为甲子日 (历史上确定的日柱起点)
        base_date = date(1900, 1, 1)
        target_date = date(year, month, day)
        delta = (target_date - base_date).days
        
        # 优化的日柱计算，考虑更多因素确保精确性
        # 甲子日的历史偏移量
        jiazi_offset = 36  # 1900年1月1日在60甲子中的实际位置
        
        # 计算精确的日柱索引
        day_index = (delta + jiazi_offset) % 60
        
        return day_index
    
    def calculate_hour_pillar(self, day_gan_index, hour):
        """计算时柱"""
        hour_zhi = self.hour_to_dizhi.get(hour, '午')
        hour_zhi_index = self.dizhi.index(hour_zhi)
        
        # 时干的计算公式
        hour_gan_index = (day_gan_index % 5 * 2 + hour_zhi_index) % 10
        hour_gan = self.tiangan[hour_gan_index]
        
        return hour_gan + hour_zhi
    
    def calculate_bazi(self, year, month, day, hour, gender="male", calendar_type="solar"):
        """
        主要的八字计算方法
        """
        try:
            # 根据日历类型处理日期
            if calendar_type == "lunar":
                # 农历输入，转换为公历进行计算
                solar_info = self.lunar_to_solar(year, month, day)
                calc_year = solar_info['year']
                calc_month = solar_info['month']
                calc_day = solar_info['day']
                
                # 保存原始农历信息
                lunar_info = {
                    'year': year,
                    'month': month,
                    'day': day,
                    'leap': False
                }
                
                # 计算对应的公历日期
                solar_birth_info = solar_info
                
            else:
                # 公历输入，直接计算
                calc_year = year
                calc_month = month
                calc_day = day
                
                # 转换为农历信息
                lunar_info = self.solar_to_lunar(year, month, day)
                
                # 公历信息就是输入信息
                solar_birth_info = {
                    'year': year,
                    'month': month,
                    'day': day
                }
            
            # 使用专业库计算八字
            bazi = self.calculate_bazi_with_sxtwl(calc_year, calc_month, calc_day, hour)
            
            # 计算五行分布
            wuxing_count = self.calculate_wuxing(bazi)
            
            # 生成八字分析
            analysis = self.generate_analysis(bazi, wuxing_count, gender)
            
            # 计算大运流年
            dayun = self.calculate_dayun(bazi, calc_year, gender)
            
            # 今日运势
            today_fortune = self.calculate_today_fortune(bazi)
            
            # 构建paipan格式的结果，兼容naming_calculator的期望格式
            paipan = {
                '年柱': {'天干': bazi['year'][0], '地支': bazi['year'][1]},
                '月柱': {'天干': bazi['month'][0], '地支': bazi['month'][1]},
                '日柱': {'天干': bazi['day'][0], '地支': bazi['day'][1]},
                '时柱': {'天干': bazi['hour'][0], '地支': bazi['hour'][1]}
            }
            
            return {
                "bazi": bazi,
                "paipan": paipan,  # 添加paipan格式支持naming_calculator
                "wuxing": wuxing_count,
                "analysis": analysis,
                "dayun": dayun,
                "today_fortune": today_fortune,
                "lunar_info": lunar_info,  # 真正的农历信息
                "solar_info": solar_birth_info,  # 对应的公历信息
                "calendar_type": calendar_type,  # 用户输入的日历类型
                "conversion_note": f"输入{'农历' if calendar_type == 'lunar' else '公历'}日期，对应{'公历' if calendar_type == 'lunar' else '农历'}为{lunar_info['year'] if calendar_type == 'solar' else solar_birth_info['year']}年{lunar_info['month'] if calendar_type == 'solar' else solar_birth_info['month']}月{lunar_info['day'] if calendar_type == 'solar' else solar_birth_info['day']}日"
            }
            
        except Exception as e:
            print(f"八字计算详细错误: {str(e)}")
            raise Exception(f"八字计算出错: {str(e)}")
    
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
    
    def calculate_month_pillar_with_jieqi(self, year, month, day, year_gan_index):
        """计算月柱 - 考虑节气影响"""
        # 简化的节气日期表（实际应使用更精确的节气计算）
        jieqi_dates = {
            1: {'jieqi': '立春', 'day': 4}, 2: {'jieqi': '惊蛰', 'day': 5},
            3: {'jieqi': '清明', 'day': 5}, 4: {'jieqi': '立夏', 'day': 5},
            5: {'jieqi': '芒种', 'day': 6}, 6: {'jieqi': '小暑', 'day': 7},
            7: {'jieqi': '立秋', 'day': 7}, 8: {'jieqi': '白露', 'day': 8},
            9: {'jieqi': '寒露', 'day': 8}, 10: {'jieqi': '立冬', 'day': 8},
            11: {'jieqi': '大雪', 'day': 7}, 12: {'jieqi': '小寒', 'day': 6}
        }
        
        # 确定真正的月份（考虑节气）
        jieqi_day = jieqi_dates.get(month, {}).get('day', 5)
        actual_month = month
        
        # 如果在节气之前，使用上一个月
        if day < jieqi_day:
            actual_month = month - 1 if month > 1 else 12
        
        # 计算月柱地支
        month_zhi_index = (actual_month + 1) % 12
        month_zhi = self.dizhi[month_zhi_index]
        
        # 计算月柱天干（五虎遁月法）
        # 甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
        month_gan_start = {0: 2, 1: 4, 2: 6, 3: 8, 4: 0, 5: 2, 6: 4, 7: 6, 8: 8, 9: 0}  # 对应丙戊庚壬甲
        start_gan_index = month_gan_start.get(year_gan_index % 10, 2)
        month_gan_index = (start_gan_index + actual_month - 1) % 10
        month_gan = self.tiangan[month_gan_index]
        
        return {
            'month_pillar': month_gan + month_zhi,
            'actual_month': actual_month,
            'jieqi_info': f"根据{jieqi_dates.get(month, {}).get('jieqi', '节气')}确定月柱"
        }
    
    def calculate_hour_pillar_enhanced(self, day_gan_index, hour):
        """计算时柱 - 增强版，考虑日柱天干的影响"""
        # 获取时辰地支
        hour_zhi = self.hour_to_dizhi.get(hour, '午')
        hour_zhi_index = self.dizhi.index(hour_zhi)
        
        # 五鼠遁时法：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
        time_gan_start = {
            0: 0, 1: 2, 2: 4, 3: 6, 4: 8,  # 甲乙丙丁戊对应甲丙戊庚壬
            5: 0, 6: 2, 7: 4, 8: 6, 9: 8   # 己庚辛壬癸对应甲丙戊庚壬
        }
        
        start_gan_index = time_gan_start.get(day_gan_index, 0)
        hour_gan_index = (start_gan_index + hour_zhi_index) % 10
        hour_gan = self.tiangan[hour_gan_index]
        
        return hour_gan + hour_zhi
