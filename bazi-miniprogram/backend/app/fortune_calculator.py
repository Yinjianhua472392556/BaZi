#!/usr/bin/env python3
"""
运势计算器 - 后端版本
将前端JavaScript的运势算法迁移到Python后端
支持无状态的运势计算服务
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class FortuneCalculator:
    """运势计算器 - 基于传统八字理论的运势分析"""
    
    # 基础数据映射表（从前端迁移）
    DATA_MAPS = {
        # 天干地支
        "heavenly_stems": ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],
        "earthly_branches": ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"],
        
        # 五行映射
        "wuxing_map": {
            "甲":"木", "乙":"木", "丙":"火", "丁":"火", "戊":"土",
            "己":"土", "庚":"金", "辛":"金", "壬":"水", "癸":"水",
            "子":"水", "丑":"土", "寅":"木", "卯":"木", "辰":"土",
            "巳":"火", "午":"火", "未":"土", "申":"金", "酉":"金",
            "戌":"土", "亥":"水"
        },
        
        # 五行生克关系
        "wuxing_relations": {
            "木": {"生": "火", "克": "土", "被生": "水", "被克": "金"},
            "火": {"生": "土", "克": "金", "被生": "木", "被克": "水"},
            "土": {"生": "金", "克": "水", "被生": "火", "被克": "木"},
            "金": {"生": "水", "克": "木", "被生": "土", "被克": "火"},
            "水": {"生": "木", "克": "火", "被生": "金", "被克": "土"}
        },
        
        # 十神关系影响
        "ten_gods_effects": {
            "比肩": {"influence": 0.6, "description": "竞争激烈，需谨慎"},
            "劫财": {"influence": 0.4, "description": "破财之象，勿投资"},
            "食神": {"influence": 0.8, "description": "创造力强，宜表达"},
            "伤官": {"influence": 0.5, "description": "情绪波动，注意言行"},
            "偏财": {"influence": 0.9, "description": "偏财运佳，机会多"},
            "正财": {"influence": 0.7, "description": "正财稳定，积累为主"},
            "偏官": {"influence": 0.3, "description": "压力较大，谨慎行事"},
            "正官": {"influence": 0.8, "description": "贵人相助，事业顺利"},
            "偏印": {"influence": 0.4, "description": "思维敏捷，但易多疑"},
            "正印": {"influence": 0.9, "description": "学习运佳，贵人扶持"}
        },
        
        # 节气影响系数
        "solar_terms_effect": {
            "立春": 0.8, "雨水": 0.6, "惊蛰": 0.7, "春分": 0.9,
            "清明": 0.8, "谷雨": 0.6, "立夏": 0.9, "小满": 0.7,
            "芒种": 0.8, "夏至": 1.0, "小暑": 0.9, "大暑": 0.7,
            "立秋": 0.8, "处暑": 0.6, "白露": 0.7, "秋分": 0.9,
            "寒露": 0.8, "霜降": 0.6, "立冬": 0.7, "小雪": 0.5,
            "大雪": 0.6, "冬至": 0.4, "小寒": 0.3, "大寒": 0.2
        },
        
        # 幸运色彩映射
        "lucky_colors": {
            "木": ["绿色", "青色"],
            "火": ["红色", "紫色"],
            "土": ["黄色", "棕色"],
            "金": ["白色", "银色"],
            "水": ["黑色", "蓝色"]
        },
        
        # 时辰映射
        "hour_mapping": {
            23: "子时", 0: "子时", 1: "丑时", 2: "丑时",
            3: "寅时", 4: "寅时", 5: "卯时", 6: "卯时",
            7: "辰时", 8: "辰时", 9: "巳时", 10: "巳时",
            11: "午时", 12: "午时", 13: "未时", 14: "未时",
            15: "申时", 16: "申时", 17: "酉时", 18: "酉时",
            19: "戌时", 20: "戌时", 21: "亥时", 22: "亥时"
        }
    }
    
    @classmethod
    def calculate_daily_fortune(cls, personal_bazi: Dict, target_date: str, user_age: int = 30) -> Dict:
        """
        计算每日运势
        Args:
            personal_bazi: 个人八字数据，格式: {"year_pillar": "甲子", "month_pillar": ..., "day_pillar": ..., "hour_pillar": ...}
            target_date: 目标日期，格式: "2025-10-16"
            user_age: 用户年龄，用于个性化权重调整
        Returns:
            运势分析结果
        """
        try:
            # 1. 解析目标日期
            date_obj = datetime.strptime(target_date, "%Y-%m-%d")
            
            # 2. 计算当日干支
            daily_ganzhi = cls.calculate_daily_ganzhi(date_obj)
            
            # 3. 分析五行关系
            wuxing_analysis = cls.analyze_wuxing_relations(personal_bazi, daily_ganzhi)
            
            # 4. 计算十神关系
            ten_gods_analysis = cls.analyze_ten_gods(personal_bazi, daily_ganzhi)
            
            # 5. 获取节气影响
            solar_term_effect = cls.get_solar_term_effect(date_obj)
            
            # 6. 计算各项运势分数
            scores = cls.calculate_fortune_scores(
                wuxing_analysis, 
                ten_gods_analysis, 
                solar_term_effect,
                user_age
            )
            
            # 7. 生成建议和幸运元素
            suggestions = cls.generate_suggestions(wuxing_analysis, scores)
            lucky_elements = cls.calculate_lucky_elements(date_obj, wuxing_analysis)
            
            return {
                "success": True,
                "data": {
                    "date": target_date,
                    "daily_ganzhi": daily_ganzhi,
                    "overall_score": scores["overall"],
                    "detailed_scores": {
                        "wealth": scores["wealth"],
                        "career": scores["career"],
                        "health": scores["health"],
                        "love": scores["love"],
                        "study": scores["study"]
                    },
                    "lucky_elements": lucky_elements,
                    "wuxing_analysis": wuxing_analysis,
                    "suggestions": suggestions["suitable"],
                    "warnings": suggestions["warnings"],
                    "detailed_analysis": cls.generate_detailed_analysis(wuxing_analysis, ten_gods_analysis)
                }
            }
            
        except Exception as e:
            print(f"每日运势计算失败: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @classmethod
    def calculate_batch_fortune(cls, members_data: List[Dict], target_date: str) -> Dict:
        """
        批量计算多个成员的运势
        Args:
            members_data: 成员列表，每个成员包含八字数据
            target_date: 目标日期
        Returns:
            批量运势结果
        """
        try:
            results = []
            
            for member in members_data:
                # 提取八字数据
                bazi_data = member.get("bazi_data", {})
                member_info = member.get("member_info", {})
                
                # 计算个人运势
                fortune_result = cls.calculate_daily_fortune(bazi_data, target_date)
                
                if fortune_result["success"]:
                    results.append({
                        "member_id": member.get("id", "unknown"),
                        "member_name": member.get("name", "未知"),
                        "fortune": fortune_result["data"],
                        "has_valid_fortune": True
                    })
                else:
                    results.append({
                        "member_id": member.get("id", "unknown"), 
                        "member_name": member.get("name", "未知"),
                        "fortune": None,
                        "has_valid_fortune": False,
                        "error": fortune_result.get("error", "计算失败")
                    })
            
            # 生成家庭运势概览
            family_overview = cls.generate_family_overview(results)
            
            return {
                "success": True,
                "data": {
                    "date": target_date,
                    "members_fortune": results,
                    "family_overview": family_overview,
                    "total_members": len(results)
                }
            }
            
        except Exception as e:
            print(f"批量运势计算失败: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @classmethod
    def calculate_daily_ganzhi(cls, target_date: datetime) -> Dict:
        """计算当日干支（基于数学公式）"""
        # 以1900年1月31日（甲子日）为基准
        base_date = datetime(1900, 1, 31)
        
        # 计算天数差
        days_diff = (target_date - base_date).days
        
        # 干支循环计算
        stem_index = days_diff % 10
        branch_index = days_diff % 12
        
        heavenly_stem = cls.DATA_MAPS["heavenly_stems"][stem_index]
        earthly_branch = cls.DATA_MAPS["earthly_branches"][branch_index]
        
        return {
            "heavenly_stem": heavenly_stem,
            "earthly_branch": earthly_branch,
            "ganzhi": heavenly_stem + earthly_branch,
            "stem_index": stem_index,
            "branch_index": branch_index
        }
    
    @classmethod
    def analyze_wuxing_relations(cls, personal_bazi: Dict, daily_ganzhi: Dict) -> Dict:
        """五行关系分析"""
        # 提取个人日干，兼容两种格式
        if "day_pillar" in personal_bazi:
            personal_day_stem = personal_bazi["day_pillar"][0]
        elif "day" in personal_bazi:
            personal_day_stem = personal_bazi["day"][0]
        else:
            raise KeyError("Personal bazi data missing day information")
        
        personal_day_wuxing = cls.DATA_MAPS["wuxing_map"][personal_day_stem]
        
        # 当日五行
        daily_wuxing = cls.DATA_MAPS["wuxing_map"][daily_ganzhi["heavenly_stem"]]
        daily_branch_wuxing = cls.DATA_MAPS["wuxing_map"][daily_ganzhi["earthly_branch"]]
        
        # 分析关系
        stem_relation = cls.get_wuxing_relation(personal_day_wuxing, daily_wuxing)
        branch_relation = cls.get_wuxing_relation(personal_day_wuxing, daily_branch_wuxing)
        
        return {
            "personal_day_wuxing": personal_day_wuxing,
            "daily_stem_wuxing": daily_wuxing,
            "daily_branch_wuxing": daily_branch_wuxing,
            "stem_relation": stem_relation,
            "branch_relation": branch_relation,
            "overall_relation": cls.evaluate_overall_relation(stem_relation, branch_relation)
        }
    
    @classmethod
    def get_wuxing_relation(cls, personal: str, target: str) -> Dict:
        """五行关系判断"""
        if personal == target:
            return {"type": "同气", "strength": 0.8}
        
        relations = cls.DATA_MAPS["wuxing_relations"][personal]
        
        if relations["生"] == target:
            return {"type": "我生他", "strength": 0.6}
        if relations["克"] == target:
            return {"type": "我克他", "strength": 0.7}
        if relations["被生"] == target:
            return {"type": "他生我", "strength": 1.0}
        if relations["被克"] == target:
            return {"type": "他克我", "strength": 0.3}
        
        return {"type": "中性", "strength": 0.5}
    
    @classmethod
    def evaluate_overall_relation(cls, stem_relation: Dict, branch_relation: Dict) -> Dict:
        """评估综合关系"""
        avg_strength = (stem_relation["strength"] + branch_relation["strength"]) / 2
        harmony_score = avg_strength
        
        if harmony_score >= 0.8:
            description = "五行和谐，运势极佳"
        elif harmony_score >= 0.6:
            description = "五行相生，运势良好"
        elif harmony_score >= 0.4:
            description = "五行平衡，运势一般"
        else:
            description = "五行冲克，需要谨慎"
        
        return {
            "harmony_score": harmony_score,
            "description": description
        }
    
    @classmethod
    def analyze_ten_gods(cls, personal_bazi: Dict, daily_ganzhi: Dict) -> Dict:
        """十神关系分析"""
        # 提取个人日干，兼容两种格式
        if "day_pillar" in personal_bazi:
            personal_day_stem = personal_bazi["day_pillar"][0]
        elif "day" in personal_bazi:
            personal_day_stem = personal_bazi["day"][0]
        else:
            raise KeyError("Personal bazi data missing day information")
        
        daily_stem = daily_ganzhi["heavenly_stem"]
        
        # 简化的十神关系判断
        relation = cls.get_ten_gods_relation(personal_day_stem, daily_stem)
        
        return {
            "personal_day_stem": personal_day_stem,
            "daily_stem": daily_stem,
            "ten_gods_relation": relation,
            "effect": cls.DATA_MAPS["ten_gods_effects"].get(relation, {"influence": 0.5, "description": "影响一般"})
        }
    
    @classmethod
    def get_ten_gods_relation(cls, personal_stem: str, daily_stem: str) -> str:
        """获取十神关系"""
        personal_wuxing = cls.DATA_MAPS["wuxing_map"][personal_stem]
        daily_wuxing = cls.DATA_MAPS["wuxing_map"][daily_stem]
        
        if personal_stem == daily_stem:
            return "比肩"
        if personal_wuxing == daily_wuxing:
            return "劫财"
        
        relations = cls.DATA_MAPS["wuxing_relations"][personal_wuxing]
        
        if relations["生"] == daily_wuxing:
            # 我生他 - 食伤
            import random
            return "食神" if random.random() > 0.5 else "伤官"
        if relations["克"] == daily_wuxing:
            # 我克他 - 财星
            import random
            return "正财" if random.random() > 0.5 else "偏财"
        if relations["被生"] == daily_wuxing:
            # 他生我 - 印星
            import random
            return "正印" if random.random() > 0.5 else "偏印"
        if relations["被克"] == daily_wuxing:
            # 他克我 - 官杀
            import random
            return "正官" if random.random() > 0.5 else "偏官"
        
        return "比肩"
    
    @classmethod
    def get_age_weights(cls, age: int) -> Dict[str, float]:
        """根据年龄返回关注点权重"""
        if age <= 30:
            # 年轻人：重视发展和感情
            return {
                "wealth": 0.15,   # 财运不是重点
                "career": 0.30,   # 事业发展重要
                "health": 0.15,   # 身体还行
                "love": 0.25,     # 感情很重要  
                "study": 0.15     # 学习提升
            }
        elif age <= 50:
            # 中年人：重视财富和事业
            return {
                "wealth": 0.30,   # 财富积累重要
                "career": 0.30,   # 事业巅峰期
                "health": 0.20,   # 健康开始重要
                "love": 0.15,     # 感情相对稳定
                "study": 0.05     # 学习需求降低
            }
        else:
            # 中老年：重视健康和家庭
            return {
                "wealth": 0.20,   # 财富保值就行
                "career": 0.10,   # 事业不重要了
                "health": 0.40,   # 健康最重要
                "love": 0.25,     # 家庭和谐重要
                "study": 0.05     # 娱乐性学习
            }

    @classmethod
    def calculate_fortune_scores(cls, wuxing_analysis: Dict, ten_gods_analysis: Dict, solar_term_effect: float, user_age: int = 30) -> Dict:
        """年龄自适应的运势分数计算"""
        
        # 1. 各项分数保持原有算法不变
        wealth = cls.calculate_specific_score("wealth", wuxing_analysis, ten_gods_analysis)
        career = cls.calculate_specific_score("career", wuxing_analysis, ten_gods_analysis) 
        health = cls.calculate_specific_score("health", wuxing_analysis, ten_gods_analysis)
        love = cls.calculate_specific_score("love", wuxing_analysis, ten_gods_analysis)
        study = cls.calculate_specific_score("study", wuxing_analysis, ten_gods_analysis)
        
        # 2. 根据年龄获取权重
        weights = cls.get_age_weights(user_age)
        
        # 3. 加权计算overall
        overall = (
            wealth * weights["wealth"] + 
            career * weights["career"] + 
            health * weights["health"] + 
            love * weights["love"] + 
            study * weights["study"]
        )
        
        # 4. 微调和标准化
        season_adjustment = (solar_term_effect - 0.5) * 0.1  # 降低影响
        final_overall = cls.normalize_score(overall + season_adjustment)
        
        return {
            "overall": final_overall,
            "wealth": wealth,
            "career": career,
            "health": health,
            "love": love,
            "study": study
        }
    
    @classmethod
    def calculate_specific_score(cls, category: str, wuxing_analysis: Dict, ten_gods_analysis: Dict) -> float:
        """计算特定领域分数"""
        base_score = 3
        bonus = 0
        
        if category == "wealth":
            # 财运主要看我克的关系（财星）
            bonus = 1 if wuxing_analysis["stem_relation"]["type"] == "我克他" else 0
            if "财" in ten_gods_analysis["ten_gods_relation"]:
                bonus += 0.5
        elif category == "career":
            # 事业运看克我的关系（官星）
            bonus = 0.8 if wuxing_analysis["stem_relation"]["type"] == "他克我" else 0
            if "官" in ten_gods_analysis["ten_gods_relation"]:
                bonus += 0.5
        elif category == "health":
            # 健康运看同气和生我的关系
            if wuxing_analysis["stem_relation"]["type"] in ["同气", "他生我"]:
                bonus = 1
        elif category == "love":
            # 感情运综合看五行和谐度
            bonus = wuxing_analysis["overall_relation"]["harmony_score"]
        elif category == "study":
            # 学习运看生我的关系（印星）
            bonus = 1.2 if wuxing_analysis["stem_relation"]["type"] == "他生我" else 0
            if "印" in ten_gods_analysis["ten_gods_relation"]:
                bonus += 0.5
        
        return cls.normalize_score(base_score + bonus)
    
    @classmethod
    def normalize_score(cls, score: float) -> float:
        """分数标准化（1-5分）"""
        return max(1.0, min(5.0, round(score * 10) / 10))
    
    @classmethod
    def get_solar_term_effect(cls, date: datetime) -> float:
        """获取节气影响"""
        solar_term = cls.get_current_solar_term(date)
        return cls.DATA_MAPS["solar_terms_effect"].get(solar_term, 0.5)
    
    @classmethod
    def get_current_solar_term(cls, date: datetime) -> str:
        """计算当前节气"""
        month = date.month
        day = date.day
        
        # 基于平均日期的节气判断（简化版）
        solar_term_dates = {
            1: [[6, "小寒"], [20, "大寒"]],
            2: [[4, "立春"], [19, "雨水"]],
            3: [[6, "惊蛰"], [21, "春分"]],
            4: [[5, "清明"], [20, "谷雨"]],
            5: [[6, "立夏"], [21, "小满"]],
            6: [[6, "芒种"], [21, "夏至"]],
            7: [[7, "小暑"], [23, "大暑"]],
            8: [[8, "立秋"], [23, "处暑"]],
            9: [[8, "白露"], [23, "秋分"]],
            10: [[8, "寒露"], [23, "霜降"]],
            11: [[7, "立冬"], [22, "小雪"]],
            12: [[7, "大雪"], [22, "冬至"]]
        }
        
        month_terms = solar_term_dates[month]
        if day >= month_terms[1][0]:
            return month_terms[1][1]
        elif day >= month_terms[0][0]:
            return month_terms[0][1]
        else:
            # 返回上月第二个节气
            prev_month = 12 if month == 1 else month - 1
            return solar_term_dates[prev_month][1][1]
    
    @classmethod
    def calculate_lucky_elements(cls, date: datetime, wuxing_analysis: Dict) -> Dict:
        """计算幸运元素"""
        personal_wuxing = wuxing_analysis["personal_day_wuxing"]
        need_wuxing = cls.calculate_need_wuxing(personal_wuxing, wuxing_analysis)
        
        # 根据需要的五行确定幸运色彩
        lucky_colors = cls.DATA_MAPS["lucky_colors"].get(need_wuxing, ["绿色"])
        
        # 计算幸运数字（基于日期和五行）
        lucky_numbers = cls.calculate_lucky_numbers(date, need_wuxing)
        
        # 计算幸运方位
        lucky_direction = cls.calculate_lucky_direction(need_wuxing)
        
        return {
            "lucky_color": lucky_colors[0],
            "lucky_colors": lucky_colors,
            "lucky_number": lucky_numbers[0],
            "lucky_numbers": lucky_numbers,
            "lucky_direction": lucky_direction,
            "beneficial_wuxing": need_wuxing
        }
    
    @classmethod
    def calculate_need_wuxing(cls, personal_wuxing: str, wuxing_analysis: Dict) -> str:
        """计算需要的五行"""
        # 根据五行关系确定最需要的五行
        if wuxing_analysis["stem_relation"]["type"] == "他克我":
            # 被克时需要生我的五行
            return cls.DATA_MAPS["wuxing_relations"][personal_wuxing]["被生"]
        if wuxing_analysis["overall_relation"]["harmony_score"] < 0.5:
            # 和谐度低时需要生我的五行
            return cls.DATA_MAPS["wuxing_relations"][personal_wuxing]["被生"]
        # 其他情况返回同类五行
        return personal_wuxing
    
    @classmethod
    def calculate_lucky_numbers(cls, date: datetime, wuxing: str) -> List[int]:
        """计算幸运数字"""
        wuxing_numbers = {
            "木": [3, 8],
            "火": [2, 7],
            "土": [5, 0],
            "金": [4, 9],
            "水": [1, 6]
        }
        
        base_numbers = wuxing_numbers.get(wuxing, [8])
        date_number = date.day % 10
        
        return (base_numbers + [date_number])[:2]
    
    @classmethod
    def calculate_lucky_direction(cls, wuxing: str) -> str:
        """计算幸运方位"""
        directions = {
            "木": "东方",
            "火": "南方",
            "土": "中央",
            "金": "西方",
            "水": "北方"
        }
        
        return directions.get(wuxing, "东方")
    
    @classmethod
    def generate_suggestions(cls, wuxing_analysis: Dict, scores: Dict) -> Dict:
        """生成建议"""
        suitable = []
        warnings = []
        
        # 根据五行关系生成建议
        stem_relation_type = wuxing_analysis["stem_relation"]["type"]
        
        if stem_relation_type == "他生我":
            suitable.extend(["宜学习", "宜求助贵人", "宜接受帮助"])
        elif stem_relation_type == "我生他":
            suitable.extend(["宜付出", "宜帮助他人", "宜创作表达"])
        elif stem_relation_type == "我克他":
            suitable.extend(["宜投资", "宜开拓", "宜主动出击"])
        elif stem_relation_type == "他克我":
            warnings.extend(["忌冲动", "忌争执", "宜低调行事"])
        elif stem_relation_type == "同气":
            suitable.extend(["宜合作", "宜团队工作", "宜与同类人交往"])
        
        # 根据运势分数生成建议
        if scores["wealth"] >= 4:
            suitable.extend(["宜理财", "宜投资"])
        elif scores["wealth"] <= 2:
            warnings.extend(["忌大额消费", "忌投资风险项目"])
        
        if scores["health"] <= 2:
            warnings.extend(["注意身体健康", "宜多休息"])
        
        return {"suitable": suitable, "warnings": warnings}
    
    @classmethod
    def generate_detailed_analysis(cls, wuxing_analysis: Dict, ten_gods_analysis: Dict) -> str:
        """生成详细分析"""
        parts = []
        
        # 五行分析
        parts.append(f"今日干支为{wuxing_analysis['daily_stem_wuxing']}{wuxing_analysis['daily_branch_wuxing']}，"
                    f"与您的日干{wuxing_analysis['personal_day_wuxing']}形成{wuxing_analysis['stem_relation']['type']}的关系。")
        
        # 十神分析
        parts.append(f"十神关系为{ten_gods_analysis['ten_gods_relation']}，{ten_gods_analysis['effect']['description']}。")
        
        # 综合分析
        parts.append(wuxing_analysis["overall_relation"]["description"])
        
        return "".join(parts)
    
    @classmethod
    def generate_family_overview(cls, results: List[Dict]) -> Dict:
        """生成家庭运势概览"""
        if not results:
            return {
                "total_members": 0,
                "average_score": 0,
                "best_member": None,
                "family_lucky_color": "绿色",
                "suggestions": ["添加家庭成员开始使用"],
                "active_members": 0
            }
        
        # 筛选有效运势的成员
        valid_members = [r for r in results if r["has_valid_fortune"]]
        
        if not valid_members:
            return {
                "total_members": len(results),
                "average_score": 0,
                "best_member": None,
                "family_lucky_color": "绿色",
                "suggestions": ["重新计算运势"],
                "active_members": 0
            }
        
        # 计算平均分数
        total_score = sum(m["fortune"]["overall_score"] for m in valid_members)
        average_score = round(total_score / len(valid_members), 1)
        
        # 找出运势最好的成员
        best_member = max(valid_members, key=lambda x: x["fortune"]["overall_score"])
        
        # 生成家庭建议
        suggestions = cls.generate_family_suggestions(valid_members)
        
        return {
            "total_members": len(results),
            "average_score": average_score,
            "best_member": best_member,
            "family_lucky_color": best_member["fortune"]["lucky_elements"]["lucky_color"],
            "suggestions": suggestions,
            "active_members": len(valid_members),
            "last_updated": datetime.now().timestamp()
        }
    
    @classmethod
    def generate_family_suggestions(cls, members: List[Dict]) -> List[str]:
        """生成家庭建议"""
        suggestions = []
        
        if len(members) == 1:
            suggestions.append("添加更多家庭成员，获得完整的家庭运势分析")
        
        if len(members) >= 2:
            suggestions.append("全家人今天适合一起活动，增进感情")
        
        high_score_members = [m for m in members if m["fortune"]["overall_score"] >= 4]
        
        if high_score_members:
            names = [m["member_name"] for m in high_score_members]
            suggestions.append(f"{'、'.join(names)}今日运势特别好")
        
        suggestions.append("每天查看运势，把握最佳时机")
        
        return suggestions
