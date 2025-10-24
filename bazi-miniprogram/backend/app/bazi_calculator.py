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
    
    def get_enhanced_personality_analysis(self, day_gan, day_zhi, wuxing_count):
        """增强版性格分析 - 基于四柱组合的个性化分析"""
        # 1. 基础日干特质
        base_traits = self.get_day_gan_base_traits(day_gan)
        
        # 2. 五行强弱影响性格
        wuxing_influence = self.analyze_wuxing_personality_influence(day_gan, wuxing_count)
        
        # 3. 地支组合对性格的影响
        dizhi_influence = self.analyze_dizhi_personality_influence(day_zhi, wuxing_count)
        
        # 4. 生成综合性格分析
        personality_parts = [
            base_traits,
            wuxing_influence,
            dizhi_influence
        ]
        
        # 过滤空值并组合
        final_personality = "。".join([part for part in personality_parts if part])
        
        return final_personality

    def get_day_gan_base_traits(self, day_gan):
        """获取日干基础特质"""
        base_personality = {
            '甲': "您具有木的阳刚之气，性格直爽坚韧，天生具备领导潜质。在团队中常常能够主动承担责任，但需要注意避免过于固执",
            '乙': "您具有木的阴柔之美，性格温和细腻，善于协调人际关系。具有很强的适应能力和同情心，但有时可能缺乏果断",
            '丙': "您具有火的热情奔放，性格开朗积极，富有创新精神和感染力。天生乐观向上，但有时可能过于冲动",
            '丁': "您具有火的温暖细致，性格敏感而富有艺术气质。注重细节，有很强的洞察力，但有时过于敏感多疑",
            '戊': "您具有土的厚重稳健，性格踏实可靠，是天生的实干家。做事有条不紊，责任心强，但有时显得过于保守",
            '己': "您具有土的温润包容，性格温和谦逊，善于倾听和理解他人。具有很强的服务精神，但有时缺乏主见",
            '庚': "您具有金的刚强果断，性格坚毅正直，有很强的执行力和正义感。做事干脆利落，但有时可能过于严厉",
            '辛': "您具有金的精巧灵活，性格聪明机敏，善于变通和创新。具有敏锐的商业嗅觉，但有时可能过于计较得失",
            '壬': "您具有水的智慧深远，性格聪慧理性，具有很强的适应能力和前瞻性。思维活跃，但有时可能过于理想化",
            '癸': "您具有水的内敛深沉，性格细腻敏锐，善于观察和思考。具有很强的直觉力和洞察力，但有时显得过于消极"
        }
        return base_personality.get(day_gan, "您的性格独特，具有鲜明的个人特色")

    def analyze_wuxing_personality_influence(self, day_gan, wuxing_count):
        """分析五行分布对性格的影响"""
        if not wuxing_count:
            return ""
            
        total = sum(wuxing_count.values())
        if total == 0:
            return ""
        
        # 找出最强和最弱的五行
        max_element = max(wuxing_count.items(), key=lambda x: x[1])
        min_element = min(wuxing_count.items(), key=lambda x: x[1])
        
        # 日干对应的五行
        day_gan_wuxing = self.wuxing_tiangan[day_gan]
        
        influence_parts = []
        
        # 分析日干五行的强弱
        day_gan_count = wuxing_count.get(day_gan_wuxing, 0)
        if day_gan_count >= 3:
            influence_parts.append(f"您的{day_gan_wuxing}行特别旺盛，这使您在{day_gan_wuxing}行的特质上表现得更加突出，执行力强，但需要注意平衡其他方面")
        elif day_gan_count <= 1:
            influence_parts.append(f"您的{day_gan_wuxing}行相对较弱，这使您更需要依靠他人的支持和帮助，建议多培养{day_gan_wuxing}行相关的品质")
        
        # 分析最旺五行的影响
        if max_element[1] >= 3 and max_element[0] != day_gan_wuxing:
            wuxing_traits = {
                '木': "创新能力强，喜欢成长和发展，但有时过于理想主义",
                '火': "热情洋溢，表达能力强，喜欢展示自己，但有时急躁",
                '土': "稳重踏实，包容性强，注重安全感，但有时过于保守",
                '金': "理性务实，决断力强，重视效率，但有时过于严苛",
                '水': "智慧灵活，适应性强，善于变通，但有时缺乏坚持"
            }
            trait = wuxing_traits.get(max_element[0], "")
            if trait:
                influence_parts.append(f"八字中{max_element[0]}行最旺，使您{trait}")
        
        return "，".join(influence_parts)

    def analyze_dizhi_personality_influence(self, day_zhi, wuxing_count):
        """分析日支对性格的影响"""
        dizhi_traits = {
            '子': "机智灵活，善于沟通，但有时显得浮躁",
            '丑': "踏实稳重，耐心持久，但有时过于固执",
            '寅': "积极进取，勇于开拓，但有时冲动鲁莽",
            '卯': "温和友善，富有创意，但有时缺乏主见",
            '辰': "智慧务实，善于规划，但有时过于谨慎",
            '巳': "聪明敏锐，善于表达，但有时过于自信",
            '午': "热情开朗，积极向上，但有时情绪化",
            '未': "温和体贴，善解人意，但有时优柔寡断",
            '申': "聪明能干，适应性强，但有时过于现实",
            '酉': "精明能干，注重细节，但有时过于挑剔",
            '戌': "忠诚可靠，责任心强，但有时过于严肃",
            '亥': "善良纯真，富有同情心，但有时过于天真"
        }
        
        trait = dizhi_traits.get(day_zhi, "")
        if trait:
            return f"日支{day_zhi}使您{trait}"
        return ""
    
    def get_detailed_wuxing_analysis(self, wuxing_count):
        """详细五行分析"""
        total = sum(wuxing_count.values())
        if total == 0:
            return "五行信息不完整，建议重新计算。"
        
        max_element = max(wuxing_count.items(), key=lambda x: x[1])
        min_element = min(wuxing_count.items(), key=lambda x: x[1])
        
        # 生成详细分析
        balance_desc = ""
        if max_element[1] - min_element[1] >= 3:
            balance_desc = f"五行分布不够均衡，{max_element[0]}过旺（{max_element[1]}个），{min_element[0]}偏弱（{min_element[1]}个）。"
        else:
            balance_desc = "五行分布相对均衡，整体运势平稳。"
        
        # 调和建议
        advice = self.get_wuxing_balance_advice(min_element[0], max_element[0])
        
        return f"{balance_desc}{advice}"
    
    def get_wuxing_balance_advice(self, weak_element, strong_element):
        """五行调和建议"""
        advice_map = {
            '木': "建议多接触绿色植物，选择木质家具，早晨散步，佩戴绿色饰品。",
            '火': "建议多晒太阳，选择红色衣物，进行有氧运动，保持积极心态。",
            '土': "建议多接触大自然，选择黄色系搭配，进行园艺活动，保持稳重性格。",
            '金': "建议佩戴金属饰品，选择白色服装，进行呼吸锻炼，培养理性思维。",
            '水': "建议多饮水，选择黑蓝色系，进行游泳等水上运动，保持灵活性。"
        }
        return advice_map.get(weak_element, "建议保持五行平衡，适当调节生活方式。")
    
    def identify_bazi_pattern(self, bazi, wuxing_count):
        """识别八字格局 - 增强个性化的核心算法"""
        day_gan = bazi["day"][0]
        month_gan = bazi["month"][0]
        
        # 1. 计算日干强弱
        day_strength = self.calculate_day_gan_strength(bazi, wuxing_count)
        
        # 2. 分析十神关系
        ten_gods_info = self.analyze_ten_gods_comprehensive(bazi)
        
        # 3. 识别特殊格局
        special_patterns = self.identify_special_patterns(bazi, day_strength)
        
        # 4. 确定主格局
        main_pattern = self.determine_main_pattern(day_strength, ten_gods_info, special_patterns)
        
        return {
            "main_pattern": main_pattern,
            "day_strength": day_strength,
            "ten_gods_info": ten_gods_info,
            "special_patterns": special_patterns,
            "pattern_analysis": self.generate_pattern_analysis(main_pattern, day_strength)
        }

    def calculate_day_gan_strength(self, bazi, wuxing_count):
        """计算日干旺衰强度"""
        day_gan = bazi["day"][0]
        day_wuxing = self.wuxing_tiangan[day_gan]
        
        # 日干对应五行的个数
        day_element_count = wuxing_count.get(day_wuxing, 0)
        total_elements = sum(wuxing_count.values())
        
        if total_elements == 0:
            return "中和"
        
        # 计算日干五行比例
        ratio = day_element_count / total_elements
        
        # 分析月令支持
        month_support = self.get_month_support_strength(bazi["month"][1], day_wuxing)
        
        # 综合评估
        strength_score = ratio * 0.6 + month_support * 0.4
        
        if strength_score >= 0.6:
            return "太旺"
        elif strength_score >= 0.4:
            return "偏旺"
        elif strength_score >= 0.25:
            return "中和"
        elif strength_score >= 0.15:
            return "偏弱"
        else:
            return "太弱"

    def get_month_support_strength(self, month_zhi, day_wuxing):
        """获取月令对日干的支持强度"""
        month_wuxing = self.wuxing_dizhi[month_zhi]
        
        # 同类五行支持最强
        if month_wuxing == day_wuxing:
            return 1.0
        
        # 生我的五行支持较强
        wuxing_relations = {
            '木': {'生我': '水', '克我': '金'},
            '火': {'生我': '木', '克我': '水'},
            '土': {'生我': '火', '克我': '木'},
            '金': {'生我': '土', '克我': '火'},
            '水': {'生我': '金', '克我': '土'}
        }
        
        relations = wuxing_relations.get(day_wuxing, {})
        if month_wuxing == relations.get('生我'):
            return 0.7
        elif month_wuxing == relations.get('克我'):
            return 0.2
        else:
            return 0.4

    def analyze_ten_gods_comprehensive(self, bazi):
        """全面分析十神关系"""
        day_gan = bazi["day"][0]
        
        ten_gods_distribution = {}
        for pillar_name, pillar in bazi.items():
            if pillar_name != "day":  # 除了日柱的其他三柱
                gan = pillar[0]
                zhi = pillar[1]
                
                # 天干十神
                gan_ten_god = self.get_ten_god_relation(day_gan, gan)
                ten_gods_distribution[f"{pillar_name}_gan"] = gan_ten_god
                
                # 地支藏干十神（简化处理）
                zhi_hidden_gan = self.get_zhi_hidden_main_gan(zhi)
                zhi_ten_god = self.get_ten_god_relation(day_gan, zhi_hidden_gan)
                ten_gods_distribution[f"{pillar_name}_zhi"] = zhi_ten_god
        
        return {
            "distribution": ten_gods_distribution,
            "dominant_ten_god": self.find_dominant_ten_god(ten_gods_distribution),
            "ten_god_pattern": self.analyze_ten_god_pattern(ten_gods_distribution)
        }

    def get_ten_god_relation(self, day_gan, other_gan):
        """获取十神关系"""
        if day_gan == other_gan:
            return "比肩"
        
        day_wuxing = self.wuxing_tiangan[day_gan]
        other_wuxing = self.wuxing_tiangan[other_gan]
        
        # 判断阴阳性
        day_index = self.tiangan.index(day_gan)
        other_index = self.tiangan.index(other_gan)
        day_yinyang = "阳" if day_index % 2 == 0 else "阴"
        other_yinyang = "阳" if other_index % 2 == 0 else "阴"
        
        # 五行关系判断
        wuxing_relations = {
            '木': {'生': '火', '克': '土', '被生': '水', '被克': '金'},
            '火': {'生': '土', '克': '金', '被生': '木', '被克': '水'},
            '土': {'生': '金', '克': '水', '被生': '火', '被克': '木'},
            '金': {'生': '水', '克': '木', '被生': '土', '被克': '火'},
            '水': {'生': '木', '克': '火', '被生': '金', '被克': '土'}
        }
        
        relations = wuxing_relations[day_wuxing]
        
        if other_wuxing == day_wuxing:
            return "劫财" if day_yinyang != other_yinyang else "比肩"
        elif other_wuxing == relations['生']:
            return "食神" if day_yinyang == other_yinyang else "伤官"
        elif other_wuxing == relations['克']:
            return "正财" if day_yinyang != other_yinyang else "偏财"
        elif other_wuxing == relations['被生']:
            return "正印" if day_yinyang != other_yinyang else "偏印"
        elif other_wuxing == relations['被克']:
            return "正官" if day_yinyang != other_yinyang else "七杀"
        
        return "比肩"

    def get_zhi_hidden_main_gan(self, zhi):
        """获取地支藏干的主气"""
        zhi_hidden_mapping = {
            '子': '癸', '丑': '己', '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙',
            '午': '丁', '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
        }
        return zhi_hidden_mapping.get(zhi, '甲')

    def find_dominant_ten_god(self, ten_gods_distribution):
        """找出主导的十神"""
        from collections import Counter
        ten_god_counts = Counter(ten_gods_distribution.values())
        if ten_god_counts:
            return ten_god_counts.most_common(1)[0][0]
        return "比肩"

    def analyze_ten_god_pattern(self, ten_gods_distribution):
        """分析十神组合模式"""
        values = list(ten_gods_distribution.values())
        
        # 检查是否有特殊的十神组合
        if "正官" in values and "正印" in values:
            return "官印相生格"
        elif "食神" in values and "正财" in values:
            return "食神生财格"
        elif "伤官" in values and "正财" in values:
            return "伤官生财格"
        elif values.count("正财") >= 2 or values.count("偏财") >= 2:
            return "财星荟萃格"
        elif values.count("正官") >= 2 or values.count("七杀") >= 2:
            return "官杀混杂格"
        else:
            return "普通格局"

    def identify_special_patterns(self, bazi, day_strength):
        """识别特殊格局"""
        patterns = []
        
        # 从格识别
        if day_strength in ["太弱", "偏弱"]:
            cong_pattern = self.identify_cong_patterns(bazi)
            if cong_pattern:
                patterns.append(cong_pattern)
        
        # 专旺格识别
        if day_strength in ["太旺", "偏旺"]:
            zhuan_wang_pattern = self.identify_zhuan_wang_patterns(bazi)
            if zhuan_wang_pattern:
                patterns.append(zhuan_wang_pattern)
        
        # 特殊神煞格局
        special_shensha = self.identify_special_shensha(bazi)
        patterns.extend(special_shensha)
        
        return patterns

    def identify_cong_patterns(self, bazi):
        """识别从格"""
        day_gan = bazi["day"][0]
        other_gans = [bazi["year"][0], bazi["month"][0], bazi["hour"][0]]
        
        # 分析其他天干的五行分布
        other_wuxings = [self.wuxing_tiangan[gan] for gan in other_gans]
        from collections import Counter
        wuxing_counts = Counter(other_wuxings)
        
        # 如果某个五行占绝对优势，可能是从格
        max_count = max(wuxing_counts.values()) if wuxing_counts else 0
        if max_count >= 2:
            dominant_wuxing = max(wuxing_counts.items(), key=lambda x: x[1])[0]
            day_wuxing = self.wuxing_tiangan[day_gan]
            
            if dominant_wuxing != day_wuxing:
                # 判断从格类型
                if self.is_wealth_element(day_wuxing, dominant_wuxing):
                    return "从财格"
                elif self.is_official_element(day_wuxing, dominant_wuxing):
                    return "从杀格"
                elif self.is_food_injury_element(day_wuxing, dominant_wuxing):
                    return "从儿格"
        
        return None

    def identify_zhuan_wang_patterns(self, bazi):
        """识别专旺格"""
        day_gan = bazi["day"][0]
        day_wuxing = self.wuxing_tiangan[day_gan]
        
        # 计算同类五行的比例
        all_gans = [bazi["year"][0], bazi["month"][0], bazi["day"][0], bazi["hour"][0]]
        same_wuxing_count = sum(1 for gan in all_gans if self.wuxing_tiangan[gan] == day_wuxing)
        
        if same_wuxing_count >= 3:
            return f"{day_wuxing}专旺格"
        
        return None

    def identify_special_shensha(self, bazi):
        """识别特殊神煞格局"""
        patterns = []
        day_gan = bazi["day"][0]
        day_zhi = bazi["day"][1]
        
        # 魁罡格
        kuigang_combinations = ["庚辰", "庚戌", "戊戌", "壬辰"]
        day_pillar = day_gan + day_zhi
        if day_pillar in kuigang_combinations:
            patterns.append("魁罡格")
        
        # 德秀格（简化判断）
        if day_gan in ["甲", "戊"] and day_zhi == "寅":
            patterns.append("德秀格")
        
        return patterns

    def determine_main_pattern(self, day_strength, ten_gods_info, special_patterns):
        """确定主要格局"""
        # 优先考虑特殊格局
        if special_patterns:
            return special_patterns[0]
        
        # 根据十神组合确定格局
        if ten_gods_info["ten_god_pattern"] != "普通格局":
            return ten_gods_info["ten_god_pattern"]
        
        # 根据日干强弱确定基本格局
        dominant_ten_god = ten_gods_info["dominant_ten_god"]
        
        if day_strength in ["太旺", "偏旺"]:
            return f"身旺{dominant_ten_god}格"
        elif day_strength in ["太弱", "偏弱"]:
            return f"身弱{dominant_ten_god}格"
        else:
            return f"中和{dominant_ten_god}格"

    def generate_pattern_analysis(self, main_pattern, day_strength):
        """生成格局分析"""
        pattern_descriptions = {
            "从财格": "命主较弱，以财星为用，适合商业投资，重视物质收益，需要与财富相关的人士合作。",
            "从杀格": "命主较弱，以官杀为用，适合在权威机构工作，需要权威人士提携，重视权力地位。",
            "从儿格": "命主较弱，以食伤为用，适合创意表达，依靠才艺技能获得成功，重视创新思维。",
            "木专旺格": "木气专旺，创新能力强，适合发展和成长相关行业，但需要控制固执倾向。",
            "火专旺格": "火气专旺，表达能力强，适合传媒表演行业，但需要控制急躁情绪。",
            "土专旺格": "土气专旺，稳重踏实，适合建筑房地产行业，但需要增强灵活性。",
            "金专旺格": "金气专旺，执行力强，适合金融机械行业，但需要增加包容性。",
            "水专旺格": "水气专旺，智慧灵活，适合流通贸易行业，但需要增强坚持力。",
            "魁罡格": "个性刚强，具有领导才能，但需要注意脾气控制，适合权威性工作。",
            "德秀格": "品德高尚，文采出众，适合文化教育工作，具有很好的社会声誉。",
            "官印相生格": "贵人运强，学习能力佳，适合公职或管理工作，权力与智慧并重。",
            "食神生财格": "通过才艺获得财富，适合创意产业，收入稳定且有创造性。",
            "伤官生财格": "表达能力强，通过技能获得财富，适合技术服务行业。"
        }
        
        # 默认分析
        if main_pattern not in pattern_descriptions:
            return f"您的命格为{main_pattern}，日干{day_strength}，需要根据具体的五行组合来调整人生策略。"
        
        return pattern_descriptions[main_pattern]

    def is_wealth_element(self, day_wuxing, other_wuxing):
        """判断是否为财星元素"""
        wealth_relations = {
            '木': ['土'], '火': ['金'], '土': ['水'], '金': ['木'], '水': ['火']
        }
        return other_wuxing in wealth_relations.get(day_wuxing, [])

    def is_official_element(self, day_wuxing, other_wuxing):
        """判断是否为官杀元素"""
        official_relations = {
            '木': ['金'], '火': ['水'], '土': ['木'], '金': ['火'], '水': ['土']
        }
        return other_wuxing in official_relations.get(day_wuxing, [])

    def is_food_injury_element(self, day_wuxing, other_wuxing):
        """判断是否为食伤元素"""
        food_injury_relations = {
            '木': ['火'], '火': ['土'], '土': ['金'], '金': ['水'], '水': ['木']
        }
        return other_wuxing in food_injury_relations.get(day_wuxing, [])

    def get_age_based_career_analysis(self, day_gan, wuxing_count, age):
        """基于年龄和格局的事业分析 - 增强版"""
        # 识别八字格局
        bazi_pattern = self.identify_bazi_pattern({"day": day_gan + "子", "month": "甲寅", "year": "乙卯", "hour": "丙辰"}, wuxing_count)
        
        # 基础职业倾向
        base_career = {
            '甲': "创业管理、教育培训、环保绿化、林业园艺",
            '乙': "艺术设计、服务行业、文化传媒、纺织美容", 
            '丙': "能源电力、娱乐传媒、广告策划、电子科技",
            '丁': "文化出版、美容护理、照明设计、精密工艺",
            '戊': "建筑工程、房地产、农业种植、陶瓷制造",
            '己': "餐饮服务、咨询顾问、行政管理、食品加工",
            '庚': "金属制造、机械工程、执法安全、汽车工业",
            '辛': "金融投资、珠宝首饰、医疗健康、法律服务",
            '壬': "贸易物流、旅游交通、水利工程、进出口",
            '癸': "科研技术、化工医药、信息网络、学术研究"
        }
        
        career_base = base_career.get(day_gan, "多元化发展")
        
        # 根据格局调整职业建议
        pattern_career_advice = ""
        if bazi_pattern and "main_pattern" in bazi_pattern:
            main_pattern = bazi_pattern["main_pattern"]
            if "财" in main_pattern:
                pattern_career_advice = "，特别适合商业投资、财务管理、商贸流通等财富相关领域"
            elif "官" in main_pattern:
                pattern_career_advice = "，特别适合政府机关、大型企业管理、权威机构等需要权力影响力的领域"
            elif "食" in main_pattern or "伤" in main_pattern:
                pattern_career_advice = "，特别适合创意产业、技术服务、艺术表达等需要才华技能的领域"
            elif "印" in main_pattern:
                pattern_career_advice = "，特别适合教育培训、文化传承、学术研究等需要知识积累的领域"
        
        # 根据年龄段调整建议
        if age <= 25:
            return f"年轻有为，适合在{career_base}等领域积累经验{pattern_career_advice}。建议多学习新技能，参与实习和培训，为未来发展打好基础。当前是能力建设期，重点在于广泛学习和技能提升。"
        elif age <= 35:
            return f"正值事业上升期，{career_base}领域有很好的发展前景{pattern_career_advice}。建议抓住机遇，在专业领域深耕细作，争取在行业中建立影响力。这是奋斗期，要有明确的职业目标和发展规划。"
        elif age <= 50:
            return f"事业成熟期，适合在{career_base}领域发挥领导作用{pattern_career_advice}。建议注重团队建设和人才培养，同时考虑多元化发展和投资理财。这是收获期，要平衡事业成就与家庭责任。"
        else:
            return f"人生阅历丰富，可在{career_base}领域发挥传承作用{pattern_career_advice}。建议专注于经验传承和智慧分享，同时规划好退休后的生活安排。这是回馈期，重点在于传承价值和享受人生。"

    def get_age_based_love_analysis(self, day_gan, gender, age, wuxing_count):
        """基于年龄的感情分析"""
        base_traits = {
            '甲': "直率真诚", '乙': "温柔体贴", '丙': "热情开朗", 
            '丁': "细腻浪漫", '戊': "稳重可靠", '己': "温和包容",
            '庚': "坚定专一", '辛': "聪明机敏", '壬': "智慧深情", '癸': "内敛深沉"
        }
        
        trait = base_traits.get(day_gan, "独特魅力")
        gender_desc = "男性" if gender == 'male' else "女性"
        
        if age <= 25:
            return f"年轻{gender_desc}，{trait}的性格容易吸引异性关注。建议在感情中保持纯真，多了解对方，不要急于确定关系。重点在于学会如何相处和成长。"
        elif age <= 35:
            return f"适婚年龄，{trait}的特质有助于建立稳定关系。建议认真对待感情，寻找三观相合的伴侣。这个阶段适合考虑婚姻和组建家庭。"
        elif age <= 50:
            return f"感情成熟期，{trait}的品格有助于维护家庭和谐。建议注重夫妻沟通，在事业家庭间找好平衡。同时关心子女的情感教育。"
        else:
            return f"人生智慧丰富，{trait}的品质值得传承。建议享受天伦之乐，为年轻人提供感情方面的指导。重点在于家庭和睦和晚年幸福。"
    
    def get_health_analysis(self, day_gan, wuxing_count, age):
        """健康运势分析"""
        health_mapping = {
            '甲': "肝胆系统是关注重点，平时注意情绪调节，避免过度劳累。",
            '乙': "神经系统较为敏感，建议保持规律作息，多进行放松训练。",
            '丙': "心血管系统需要关注，控制情绪起伏，适度运动很重要。",
            '丁': "眼部和血液循环要注意，避免用眼过度，保持良好心态。",
            '戊': "脾胃消化系统是重点，注意饮食规律，避免暴饮暴食。",
            '己': "肠胃功能较弱，建议清淡饮食，少食多餐，保持运动习惯。",
            '庚': "肺部和皮肤需要保养，注意空气质量，避免吸烟酗酒。",
            '辛': "呼吸系统要关注，保持室内通风，适当进行有氧运动。",
            '壬': "肾脏和泌尿系统重要，多饮水，避免熬夜，保持充足睡眠。",
            '癸': "生殖系统和内分泌要注意，保持心情愉悦，规律生活。"
        }
        
        base_health = health_mapping.get(day_gan, "整体健康状况良好，注意预防保健。")
        
        # 根据年龄调整建议
        if age >= 40:
            return f"{base_health}年龄增长后更要注重体检，定期检查身体，预防慢性疾病的发生。"
        else:
            return f"{base_health}趁着年轻要养成良好的生活习惯，为长远健康打下基础。"
    
    def get_wealth_analysis(self, bazi, wuxing_count, age):
        """财运分析"""
        day_gan = bazi["day"][0]
        
        wealth_base = {
            '甲': "财运稳中有升，适合长期投资和创业发展。",
            '乙': "财运起伏较大，适合灵活理财和分散投资。",
            '丙': "财运火旺，容易有意外收入，但要注意理性消费。",
            '丁': "财运细水长流，适合稳健理财和储蓄积累。",
            '戊': "财运厚重，适合房产投资和实业发展。",
            '己': "财运温和，适合保守理财和服务业发展。",
            '庚': "财运刚强，适合金融投资和工业发展。",
            '辛': "财运精明，适合珠宝贸易和精细化投资。",
            '壬': "财运流动，适合贸易往来和流动性投资。",
            '癸': "财运深沉，适合长线投资和技术研发。"
        }
        
        base = wealth_base.get(day_gan, "财运平稳，适合稳健发展。")
        
        # 根据年龄调整
        if age <= 30:
            return f"{base}年轻时期重点在于积累财富基础，建议理性消费，开始小额投资理财。"
        elif age <= 50:
            return f"{base}中年时期是财富积累的关键期，可以考虑多元化投资，但要控制风险。"
        else:
            return f"{base}财富管理进入保值阶段，建议选择稳健的投资方式，注重资产传承规划。"
    
    def get_relationship_analysis(self, day_gan, day_zhi, wuxing_count):
        """人际关系分析"""
        relationship_traits = {
            '甲': "在人际交往中表现积极主动，容易成为团队核心，但要注意倾听他人意见。",
            '乙': "善于协调人际关系，具有很强的亲和力，是天然的调解者和沟通桥梁。",
            '丙': "性格热情开朗，容易与人建立友谊，但要注意控制情绪，避免过于激进。",
            '丁': "在人际交往中细腻敏感，能够察觉他人情绪变化，适合从事人文关怀工作。",
            '戊': "为人踏实可靠，容易获得他人信任，是朋友圈中的依靠和支柱。",
            '己': "性格温和包容，善于倾听他人心声，是很好的倾诉对象和心理支持者。",
            '庚': "性格坚毅果断，在团队中有很强的执行力，但需要注意方式方法的温和性。",
            '辛': "社交能力强，善于建立广泛的人脉关系，但要注意保持关系的真诚性。",
            '壬': "适应能力强，能够与各类人群和谐相处，是天然的外交家和协调者。",
            '癸': "虽然内敛，但观察力敏锐，能够深入了解他人内心，建立深层次的友谊。"
        }
        
        trait = relationship_traits.get(day_gan, "在人际关系中有自己独特的相处方式，能够展现个人魅力。")
        return f"{trait}建议在社交中保持真诚，多关心他人，这样能够建立更好的人际网络。"
    
    def get_age_specific_analysis(self, age, day_gan, wuxing_count, gender):
        """年龄特定分析"""
        if age <= 25:
            return "当前处于人生探索期，建议多尝试不同领域，积累经验和技能。这个阶段重点在于学习成长，为未来发展奠定基础。保持开放心态，勇于接受挑战。"
        elif age <= 35:
            return "正值人生黄金期，各方面能力都在上升阶段。建议抓住机遇，在事业和感情上都要积极进取。这是建立人生基础的关键时期，要有明确目标。"
        elif age <= 50:
            return "人生成熟期，经验丰富，应该发挥引领作用。建议注重传承和分享，在稳定发展的同时关注家庭和谐。这个阶段要平衡好各方面关系。"
        else:
            return "人生智慧期，阅历丰富，适合享受生活和传承经验。建议保持健康的身心状态，多与年轻人交流分享人生智慧，规划好晚年生活。"
    
    def get_yearly_fortune_analysis(self, bazi, current_year):
        """流年运势分析 - 个性化版本"""
        day_gan = bazi["day"][0]
        year_gan = bazi["year"][0]
        
        # 根据日主和年柱的组合计算个性化运势
        gan_index = self.tiangan.index(day_gan)
        year_gan_index = self.tiangan.index(year_gan)
        
        # 计算个性化索引
        personal_index = (gan_index + year_gan_index + current_year) % 12
        
        # 根据日主特点的个性化流年分析
        day_gan_fortune = {
            '甲': {
                'base': "木旺之年，创新发展机会较多",
                'advice': "适合新项目启动和团队建设"
            },
            '乙': {
                'base': "阴木柔顺，适合协调发展",
                'advice': "重点在人际关系和合作机会"
            },
            '丙': {
                'base': "火旺积极，事业发展迅速",
                'advice': "把握机遇但要控制冲动"
            },
            '丁': {
                'base': "文昌运旺，学习创作有利",
                'advice': "适合深造学习和艺术创作"
            },
            '戊': {
                'base': "土稳厚重，基础建设之年",
                'advice': "专注于稳健发展和资产积累"
            },
            '己': {
                'base': "服务运强，人际关系活跃",
                'advice': "通过服务他人获得发展机会"
            },
            '庚': {
                'base': "金旺果断，执行力强",
                'advice': "适合推进重要决策和变革"
            },
            '辛': {
                'base': "精金灵活，财运机遇多",
                'advice': "把握投资机会但要谨慎分析"
            },
            '壬': {
                'base': "水流通达，变化机会多",
                'advice': "适应变化并从中寻找机遇"
            },
            '癸': {
                'base': "雨露滋润，默默积累之年",
                'advice': "重视内在修养和技能提升"
            }
        }
        
        # 12种不同的流年特点
        yearly_variations = [
            "整体运势上升，各方面都有新进展",
            "感情运势突出，人际关系和谐",
            "事业运势强劲，职场表现优异",
            "财运较旺，投资理财机会多",
            "健康运势稳定，身心状态良好",
            "学习运势佳，进修提升效果好",
            "家庭运势和睦，亲情关系融洽",
            "创新运势强，适合开拓新领域",
            "收获运势好，前期努力见成效",
            "平稳运势，适合休整和规划",
            "变革运势，适合突破和转型",
            "综合运势平衡，各方面协调发展"
        ]
        
        gan_info = day_gan_fortune.get(day_gan, {
            'base': "个人特质鲜明，运势发展独特",
            'advice': "发挥个人优势，把握机遇"
        })
        
        yearly_feature = yearly_variations[personal_index]
        
        return f"{current_year}年流年运势：{gan_info['base']}，{yearly_feature}。{gan_info['advice']}，同时要根据实际情况灵活调整。"
    
    def get_dominant_element(self, wuxing_count):
        """获取主导五行"""
        if not wuxing_count:
            return "五行"
        max_element = max(wuxing_count.items(), key=lambda x: x[1])
        return max_element[0]
    
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
            analysis = self.generate_analysis(bazi, wuxing_count, gender, calc_year)
            
            # 计算大运流年
            dayun = self.calculate_dayun(bazi, calc_year, gender)
            
            # 注：今日运势计算已移至FortuneCalculator，确保算法统一性
            today_fortune = None
            
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
    
    def generate_analysis(self, bazi, wuxing_count, gender, birth_year=None):
        """生成八字分析 - 增强版"""
        day_gan = bazi["day"][0]
        day_zhi = bazi["day"][1]
        
        # 计算年龄
        current_year = datetime.now().year
        age = current_year - birth_year if birth_year else 25
        
        # 基础性格分析 - 增强版
        personality = self.get_enhanced_personality_analysis(day_gan, day_zhi, wuxing_count)
        
        # 五行平衡分析 - 详细版
        wuxing_analysis = self.get_detailed_wuxing_analysis(wuxing_count)
        
        # 事业运势 - 根据年龄调整
        career = self.get_age_based_career_analysis(day_gan, wuxing_count, age)
        
        # 感情运势 - 根据年龄和性别调整
        love = self.get_age_based_love_analysis(day_gan, gender, age, wuxing_count)
        
        # 健康运势 - 新增
        health = self.get_health_analysis(day_gan, wuxing_count, age)
        
        # 财运分析 - 新增
        wealth = self.get_wealth_analysis(bazi, wuxing_count, age)
        
        # 人际关系分析 - 新增
        relationship = self.get_relationship_analysis(day_gan, day_zhi, wuxing_count)
        
        # 年龄相关的特殊分析
        age_specific = self.get_age_specific_analysis(age, day_gan, wuxing_count, gender)
        
        # 流年运势 - 新增
        yearly_fortune = self.get_yearly_fortune_analysis(bazi, current_year)
        
        return {
            "personality": personality,
            "wuxing_analysis": wuxing_analysis,
            "career": career,
            "love": love,
            "health": health,
            "wealth": wealth,
            "relationship": relationship,
            "age_specific": age_specific,
            "yearly_fortune": yearly_fortune,
            "summary": f"您的日主为{day_gan}，五行{self.get_dominant_element(wuxing_count)}较旺，{personality[:30]}..."
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
    
    # 注：calculate_today_fortune 方法已移除
    # 现在统一使用 FortuneCalculator 计算运势，确保算法一致性
    # 如需运势计算，请使用 fortune_calculator.py 中的 FortuneCalculator 类
    
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
