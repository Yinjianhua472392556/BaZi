"""
书籍联盟营销服务 - 终极简化版
一体化解决方案，代码内置配置，零手动配置部署
"""

import asyncio
import aiohttp
import json
import time
import hashlib
import hmac
import base64
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import quote, urlencode


class BookAffiliateService:
    """书籍联盟营销服务 - 一体化解决方案"""
    
    def __init__(self):
        """初始化服务，所有配置内置在代码中"""
        # 平台配置 - 直接内置密钥
        self.config = {
            "platforms": {
                "taobao": {
                    "enabled": True,
                    "app_key": "33474519",  # 示例密钥，实际使用时替换
                    "app_secret": "b5b7956b9b9b5f5e9c7b8f8e8c8d8e8f",  # 示例密钥
                    "api_endpoint": "https://eco.taobao.com/router/rest",
                    "miniprogram_appid": "wxbc8f7bc25e6b9798",  # 淘宝小程序
                    "pid": "mm_123456789_123456789_123456789"  # 推广位ID
                },
                "jd": {
                    "enabled": True,
                    "app_key": "6b8f8e8c8d8e8f5e9c7b8f8e8c8d8e8f",  # 示例密钥
                    "app_secret": "7c9e9f9d9f9e9g9f9d9f9e9g9f9d9f9e",  # 示例密钥
                    "api_endpoint": "https://api.jd.com/routerjson",
                    "miniprogram_appid": "wx91d27dbf599dff74",  # 京东小程序
                    "site_id": "654321"  # 网站ID
                },
                "pdd": {
                    "enabled": True,
                    "client_id": "8d9f9e9g9f9d9f9e9g9f9d9f9e9g9f9d",  # 示例密钥
                    "client_secret": "9e9g9f9d9f9e9g9f9d9f9e9g9f9d9f9e9g",  # 示例密钥
                    "api_endpoint": "https://gw-api.pinduoduo.com/api/router",
                    "miniprogram_appid": "wx32540bd863b27570",  # 拼多多小程序
                    "pid": "12345678_123456789"  # 推广位ID
                }
            }
        }
        
        # 推荐规则内置
        self.recommendation_rules = {
            "wuxing_keywords": {
                "缺金": ["金系养生", "理财投资", "西方文化", "金属工艺", "呼吸调息", "肺部养护"],
                "缺木": ["木系调理", "植物花卉", "东方文化", "绿色生活", "肝胆养护", "眼部保健"],
                "缺水": ["水系平衡", "流水风水", "北方智慧", "黑色食疗", "肾脏养护", "智慧开发"],
                "缺火": ["火系能量", "阳光心态", "南方文化", "红色养生", "心脏养护", "血液循环"],
                "缺土": ["土系稳定", "大地智慧", "中央调和", "黄色养生", "脾胃养护", "消化系统"]
            },
            "function_keywords": {
                "八字测算": ["八字命理", "四柱详解", "天干地支", "命运分析", "紫微斗数", "周易入门"],
                "起名服务": ["姓名学", "起名大全", "取名指南", "诗经楚辞", "五格数理", "字义解析"],
                "生肖配对": ["十二生肖", "属相运势", "生肖配对", "生肖文化", "动物图腾", "生肖风水"],
                "节日查询": ["传统节日", "二十四节气", "民俗文化", "节庆习俗", "农历文化", "时令养生"]
            },
            "general_keywords": ["传统文化", "国学经典", "易经风水", "命理学", "中医养生", "道家文化"]
        }
        
        # 模拟书籍数据库 - 内置热门书籍
        self.book_database = [
            {
                "book_id": "book_001",
                "title": "八字命理学实用教程",
                "author": "李居明",
                "price": 39.8,
                "cover_url": "https://via.placeholder.com/100x130/4CAF50/white?text=八字",
                "keywords": ["八字命理", "四柱详解", "天干地支"],
                "platform": "taobao"
            },
            {
                "book_id": "book_002", 
                "title": "金系养生调理全书",
                "author": "张景岳",
                "price": 45.0,
                "cover_url": "https://via.placeholder.com/100x130/FFB74D/white?text=金系",
                "keywords": ["金系养生", "理财投资", "呼吸调息"],
                "platform": "jd"
            },
            {
                "book_id": "book_003",
                "title": "诗经楚辞起名宝典", 
                "author": "王力",
                "price": 32.5,
                "cover_url": "https://via.placeholder.com/100x130/E91E63/white?text=起名",
                "keywords": ["姓名学", "起名大全", "诗经楚辞"],
                "platform": "pdd"
            },
            {
                "book_id": "book_004",
                "title": "木系调理与肝胆养护",
                "author": "孙思邈",
                "price": 42.8,
                "cover_url": "https://via.placeholder.com/100x130/4CAF50/white?text=木系",
                "keywords": ["木系调理", "植物花卉", "肝胆养护"],
                "platform": "taobao"
            },
            {
                "book_id": "book_005",
                "title": "水系智慧与肾脏养护",
                "author": "华佗",
                "price": 38.9,
                "cover_url": "https://via.placeholder.com/100x130/2196F3/white?text=水系",
                "keywords": ["水系平衡", "流水风水", "肾脏养护"],
                "platform": "jd"
            },
            {
                "book_id": "book_006",
                "title": "火系能量与心脏调理",
                "author": "扁鹊",
                "price": 41.6,
                "cover_url": "https://via.placeholder.com/100x130/F44336/white?text=火系",
                "keywords": ["火系能量", "阳光心态", "心脏养护"],
                "platform": "pdd"
            },
            {
                "book_id": "book_007",
                "title": "土系稳定与脾胃养护",
                "author": "李时珍",
                "price": 37.2,
                "cover_url": "https://via.placeholder.com/100x130/8BC34A/white?text=土系",
                "keywords": ["土系稳定", "大地智慧", "脾胃养护"],
                "platform": "taobao"
            },
            {
                "book_id": "book_008",
                "title": "十二生肖运势解析",
                "author": "袁天罡",
                "price": 33.3,
                "cover_url": "https://via.placeholder.com/100x130/9C27B0/white?text=生肖",
                "keywords": ["十二生肖", "属相运势", "生肖文化"],
                "platform": "jd"
            },
            {
                "book_id": "book_009",
                "title": "二十四节气养生指南",
                "author": "邹学熹",
                "price": 44.5,
                "cover_url": "https://via.placeholder.com/100x130/607D8B/white?text=节气",
                "keywords": ["二十四节气", "民俗文化", "时令养生"],
                "platform": "pdd"
            },
            {
                "book_id": "book_010",
                "title": "易经风水学入门",
                "author": "刘大钧",
                "price": 48.8,
                "cover_url": "https://via.placeholder.com/100x130/795548/white?text=易经",
                "keywords": ["易经风水", "传统文化", "国学经典"],
                "platform": "taobao"
            }
        ]
        
        print("✅ 书籍联盟营销服务初始化完成")
        print(f"📚 支持平台: {', '.join(self.config['platforms'].keys())}")
        print(f"📖 内置书籍: {len(self.book_database)}本")
    
    async def get_recommendations(self, context: Dict) -> Dict:
        """获取书籍推荐"""
        try:
            # 提取关键词
            keywords = self._extract_keywords(context)
            print(f"🔍 提取到关键词: {keywords}")
            
            # 基于关键词匹配书籍
            recommendations = self._match_books_by_keywords(keywords)
            
            # 限制返回数量
            count = context.get('count', 5)
            recommendations = recommendations[:count]
            
            # 添加推荐理由
            for rec in recommendations:
                rec['reason'] = self._generate_recommendation_reason(rec, context)
            
            return {
                "success": True,
                "data": {
                    "recommendations": recommendations,
                    "total": len(recommendations),
                    "keywords_used": keywords
                },
                "timestamp": time.time()
            }
            
        except Exception as e:
            print(f"❌ 获取推荐失败: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data": {"recommendations": []},
                "timestamp": time.time()
            }
    
    def _extract_keywords(self, context: Dict) -> List[str]:
        """从上下文中提取关键词"""
        keywords = []
        
        # 从五行缺失中提取关键词
        wuxing_lack = context.get('wuxing_lack', [])
        for element in wuxing_lack:
            if element in self.recommendation_rules['wuxing_keywords']:
                keywords.extend(self.recommendation_rules['wuxing_keywords'][element])
        
        # 从功能类型中提取关键词
        function_type = context.get('function_type', '')
        function_mapping = {
            'bazi_calculation': '八字测算',
            'naming_service': '起名服务', 
            'zodiac_matching': '生肖配对',
            'festival_query': '节日查询'
        }
        
        if function_type in function_mapping:
            func_name = function_mapping[function_type]
            if func_name in self.recommendation_rules['function_keywords']:
                keywords.extend(self.recommendation_rules['function_keywords'][func_name])
        
        # 添加通用关键词
        keywords.extend(self.recommendation_rules['general_keywords'])
        
        # 去重并返回前10个关键词
        return list(set(keywords))[:10]
    
    def _match_books_by_keywords(self, keywords: List[str]) -> List[Dict]:
        """基于关键词匹配书籍"""
        book_scores = []
        
        for book in self.book_database:
            score = 0
            book_keywords = book.get('keywords', [])
            
            # 计算关键词匹配分数
            for keyword in keywords:
                for book_keyword in book_keywords:
                    if keyword in book_keyword or book_keyword in keyword:
                        score += 1
            
            if score > 0:
                book_copy = book.copy()
                book_copy['match_score'] = score
                book_scores.append(book_copy)
        
        # 按匹配分数排序
        book_scores.sort(key=lambda x: x['match_score'], reverse=True)
        
        # 如果没有匹配的书籍，返回热门推荐
        if not book_scores:
            book_scores = self.book_database[:5]
            for book in book_scores:
                book['match_score'] = 0.5  # 热门推荐基础分数
        
        return book_scores
    
    def _generate_recommendation_reason(self, book: Dict, context: Dict) -> str:
        """生成推荐理由"""
        wuxing_lack = context.get('wuxing_lack', [])
        function_type = context.get('function_type', '')
        
        # 基于五行缺失生成理由
        if wuxing_lack:
            element = wuxing_lack[0]  # 取第一个缺失元素
            element_reasons = {
                '缺金': f"适合五行缺金的调理，有助于改善{element}相关问题",
                '缺木': f"有助于补充木系能量，改善{element}不足",
                '缺水': f"能够平衡水系能量，调节{element}状态", 
                '缺火': f"提升火系能量，改善{element}相关运势",
                '缺土': f"稳固土系根基，调和{element}平衡"
            }
            if element in element_reasons:
                return element_reasons[element]
        
        # 基于功能类型生成理由
        function_reasons = {
            'bazi_calculation': "深入了解八字命理，提升个人运势认知",
            'naming_service': "掌握起名技巧，为家人取个好名字",
            'zodiac_matching': "了解生肖奥秘，改善人际关系",
            'festival_query': "传承传统文化，丰富节日内涵"
        }
        
        if function_type in function_reasons:
            return function_reasons[function_type]
        
        # 默认推荐理由
        return "传统文化精品推荐，提升个人文化素养"
    
    async def generate_affiliate_link(self, book_id: str, platform: str, user_id: str) -> Dict:
        """生成联盟推广链接"""
        try:
            # 验证平台
            if platform not in self.config['platforms']:
                return {"success": False, "error": f"不支持的平台: {platform}"}
            
            config = self.config['platforms'][platform]
            if not config['enabled']:
                return {"success": False, "error": f"平台{platform}暂不可用"}
            
            # 查找书籍信息
            book_info = self._find_book_by_id(book_id)
            if not book_info:
                return {"success": False, "error": "书籍不存在"}
            
            # 生成追踪ID
            tracking_id = self._generate_tracking_id(user_id, book_id)
            
            # 根据平台生成链接
            if platform == 'taobao':
                affiliate_link = self._generate_taobao_link(book_info, tracking_id, config)
            elif platform == 'jd':
                affiliate_link = self._generate_jd_link(book_info, tracking_id, config)
            elif platform == 'pdd':
                affiliate_link = self._generate_pdd_link(book_info, tracking_id, config)
            else:
                return {"success": False, "error": "平台暂未实现"}
            
            return {
                "success": True,
                "affiliate_link": affiliate_link,
                "miniprogram_config": {
                    "appId": config["miniprogram_appid"],
                    "path": f"pages/detail/detail?id={book_id}&tracking={tracking_id}"
                },
                "tracking_id": tracking_id,
                "book_info": {
                    "title": book_info['title'],
                    "price": book_info['price'],
                    "platform": platform
                }
            }
            
        except Exception as e:
            print(f"❌ 生成联盟链接失败: {str(e)}")
            return {"success": False, "error": f"链接生成失败: {str(e)}"}
    
    def _find_book_by_id(self, book_id: str) -> Optional[Dict]:
        """根据ID查找书籍"""
        for book in self.book_database:
            if book['book_id'] == book_id:
                return book
        return None
    
    def _generate_tracking_id(self, user_id: str, book_id: str) -> str:
        """生成追踪ID"""
        timestamp = str(int(time.time()))
        raw_data = f"{user_id}_{book_id}_{timestamp}"
        return hashlib.md5(raw_data.encode()).hexdigest()[:16]
    
    def _generate_taobao_link(self, book_info: Dict, tracking_id: str, config: Dict) -> str:
        """生成淘宝联盟链接"""
        # 简化版链接生成（实际应用中需要调用淘宝API）
        search_keyword = quote(book_info['title'])
        pid = config['pid']
        
        # 构造淘宝联盟链接
        base_url = "https://s.click.taobao.com"
        params = {
            'pid': pid,
            'keyword': search_keyword,
            'tracking': tracking_id
        }
        
        query_string = urlencode(params)
        return f"{base_url}?{query_string}"
    
    def _generate_jd_link(self, book_info: Dict, tracking_id: str, config: Dict) -> str:
        """生成京东联盟链接"""
        # 简化版链接生成（实际应用中需要调用京东API）
        search_keyword = quote(book_info['title'])
        site_id = config['site_id']
        
        base_url = "https://union-click.jd.com"
        params = {
            'siteid': site_id,
            'keyword': search_keyword,
            'tracking': tracking_id
        }
        
        query_string = urlencode(params)
        return f"{base_url}?{query_string}"
    
    def _generate_pdd_link(self, book_info: Dict, tracking_id: str, config: Dict) -> str:
        """生成拼多多联盟链接"""
        # 简化版链接生成（实际应用中需要调用拼多多API）
        search_keyword = quote(book_info['title'])
        pid = config['pid']
        
        base_url = "https://mobile.yangkeduo.com/duo_coupon_landing.html"
        params = {
            'pid': pid,
            'keyword': search_keyword,
            'tracking': tracking_id
        }
        
        query_string = urlencode(params)
        return f"{base_url}?{query_string}"
    
    async def search_books(self, query: str, limit: int = 10) -> Dict:
        """搜索书籍"""
        try:
            query_lower = query.lower()
            results = []
            
            for book in self.book_database:
                # 在标题、作者、关键词中搜索
                if (query_lower in book['title'].lower() or 
                    query_lower in book['author'].lower() or
                    any(query_lower in kw.lower() for kw in book['keywords'])):
                    results.append(book)
            
            # 限制结果数量
            results = results[:limit]
            
            return {
                "success": True,
                "data": {
                    "books": results,
                    "total": len(results),
                    "query": query
                }
            }
            
        except Exception as e:
            print(f"❌ 搜索书籍失败: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data": {"books": []}
            }
    
    def get_platform_status(self) -> Dict:
        """获取平台状态"""
        status = {}
        for platform, config in self.config['platforms'].items():
            status[platform] = {
                "enabled": config['enabled'],
                "name": platform.upper(),
                "miniprogram_appid": config.get('miniprogram_appid', ''),
                "status": "正常" if config['enabled'] else "禁用"
            }
        
        return {
            "success": True,
            "data": {
                "platforms": status,
                "total_platforms": len(status),
                "enabled_platforms": sum(1 for p in status.values() if p['enabled'])
            }
        }
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        platform_distribution = {}
        price_distribution = {"低价": 0, "中价": 0, "高价": 0}
        
        for book in self.book_database:
            # 平台分布
            platform = book['platform']
            platform_distribution[platform] = platform_distribution.get(platform, 0) + 1
            
            # 价格分布
            price = book['price']
            if price < 35:
                price_distribution["低价"] += 1
            elif price < 45:
                price_distribution["中价"] += 1
            else:
                price_distribution["高价"] += 1
        
        return {
            "success": True,
            "data": {
                "total_books": len(self.book_database),
                "platform_distribution": platform_distribution,
                "price_distribution": price_distribution,
                "average_price": sum(book['price'] for book in self.book_database) / len(self.book_database),
                "supported_platforms": list(self.config['platforms'].keys())
            }
        }


# 服务实例（用于导入时自动初始化）
if __name__ == "__main__":
    # 测试用例
    import asyncio
    
    async def test_service():
        service = BookAffiliateService()
        
        # 测试获取推荐
        print("\n=== 测试获取推荐 ===")
        context = {
            "wuxing_lack": ["金", "水"],
            "function_type": "bazi_calculation",
            "count": 3
        }
        
        recommendations = await service.get_recommendations(context)
        print(f"推荐结果: {json.dumps(recommendations, ensure_ascii=False, indent=2)}")
        
        # 测试生成链接
        print("\n=== 测试生成联盟链接 ===")
        if recommendations['data']['recommendations']:
            book_id = recommendations['data']['recommendations'][0]['book_id']
            platform = recommendations['data']['recommendations'][0]['platform']
            
            link_result = await service.generate_affiliate_link(book_id, platform, "test_user")
            print(f"链接生成结果: {json.dumps(link_result, ensure_ascii=False, indent=2)}")
        
        # 测试搜索
        print("\n=== 测试书籍搜索 ===")
        search_result = await service.search_books("八字", 3)
        print(f"搜索结果: {json.dumps(search_result, ensure_ascii=False, indent=2)}")
        
        # 测试平台状态
        print("\n=== 测试平台状态 ===")
        status = service.get_platform_status()
        print(f"平台状态: {json.dumps(status, ensure_ascii=False, indent=2)}")
        
        # 测试统计信息
        print("\n=== 测试统计信息 ===")
        stats = service.get_statistics()
        print(f"统计信息: {json.dumps(stats, ensure_ascii=False, indent=2)}")
    
    # 运行测试
    asyncio.run(test_service())
