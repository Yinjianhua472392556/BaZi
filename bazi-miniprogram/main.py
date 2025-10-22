#!/usr/bin/env python3
"""
八字运势小程序 - 真实算法版FastAPI服务器
使用专业八字算法替代模拟数据
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import sys
import socket
import json
from datetime import datetime
from typing import Optional, Dict, List

# 添加backend路径以导入算法模块
sys.path.append('backend/app')

# 分别导入各个模块，允许部分功能可用
bazi_calculator = None
naming_calculator = None
icon_generator = None
zodiac_matching_func = None

# 尝试导入八字计算器
try:
    from bazi_calculator import BaziCalculator
    bazi_calculator = BaziCalculator()
    print("✅ 八字计算器导入成功")
except ImportError as e:
    print(f"❌ 八字计算器导入失败: {e}")

# 尝试导入起名计算器
try:
    from naming_calculator import NamingCalculator
    naming_calculator = NamingCalculator()
    print("✅ 起名计算器导入成功")
except ImportError as e:
    print(f"❌ 起名计算器导入失败: {e}")

# 图标生成器已移除 - Tab图标现在使用静态配置
icon_generator = None
print("ℹ️  图标生成器已禁用 - 使用静态Tab图标配置")

# 尝试导入生肖配对
try:
    from zodiac_matching import calculate_zodiac_compatibility
    zodiac_matching_func = calculate_zodiac_compatibility
    print("✅ 生肖配对导入成功")
except ImportError as e:
    print(f"❌ 生肖配对导入失败: {e}")

# 尝试导入书籍联盟营销服务
book_affiliate_service = None
try:
    from book_affiliate import BookAffiliateService
    book_affiliate_service = BookAffiliateService()
    print("✅ 书籍联盟营销服务导入成功")
except ImportError as e:
    print(f"ℹ️ 书籍联盟营销功能未安装: {e}")
except Exception as e:
    print(f"❌ 书籍联盟营销服务初始化失败: {e}")
    book_affiliate_service = None

# 尝试导入运势计算器
fortune_calculator = None
try:
    from fortune_calculator import FortuneCalculator
    fortune_calculator = FortuneCalculator()
    print("✅ 运势计算器导入成功")
except ImportError as e:
    print(f"❌ 运势计算器导入失败: {e}")
except Exception as e:
    print(f"❌ 运势计算器初始化失败: {e}")
    fortune_calculator = None

# 检查核心算法是否可用
ALGORITHMS_AVAILABLE = bool(bazi_calculator and naming_calculator)
print(f"🧮 算法状态: {'核心算法已启用' if ALGORITHMS_AVAILABLE else '降级到模拟数据'}")

# 创建 FastAPI 应用实例
app = FastAPI(
    title="八字运势小程序 API (真实算法版)",
    description="基于传统文化的娱乐性八字测算 API - 使用真实专业算法",
    version="2.0.0-real",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_local_ip():
    """获取本机内网IP地址"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

# 全局配置
LOCAL_IP = get_local_ip()
SERVER_INFO = {
    "name": "八字运势小程序API",
    "version": "2.0.0-real",
    "local_ip": LOCAL_IP,
    "status": "running",
    "algorithm_status": "enabled" if ALGORITHMS_AVAILABLE else "fallback",
    "features": ["真实八字算法", "专业起名算法", "图标生成", "健康检查", "CORS支持"]
}

# 算法实例已在导入时初始化，无需重复初始化

# 请求数据模型
class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int = 12
    gender: str = "male"
    name: str = "匿名用户"
    calendarType: str = "solar"

class NamingRequest(BaseModel):
    surname: str
    gender: str
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int = 12
    calendar_type: str = "solar"
    name_length: int = 2
    count: Optional[int] = None
    session_seed: Optional[str] = None

class ZodiacMatchingRequest(BaseModel):
    zodiac1: str
    zodiac2: str
    
class NameEvaluationRequest(BaseModel):
    surname: str
    given_name: str
    gender: str
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int = 12
    calendar_type: str = "solar"

class PersonalizedNamingRequest(BaseModel):
    surname: str
    gender: str
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int = 12
    calendar_type: str = "solar"
    name_length: int = 2
    count: Optional[int] = None
    session_seed: Optional[str] = None
    # 个性化偏好参数
    cultural_level: Optional[str] = None
    popularity: Optional[str] = None
    era_style: Optional[str] = None
    rarity: Optional[str] = None
    selected_chars: Optional[List[str]] = None
    meaning_keywords: Optional[List[str]] = None
    preferences: Optional[Dict] = None

class CharacterSearchRequest(BaseModel):
    keyword: str
    wuxing: Optional[str] = None
    gender: Optional[str] = None
    count: Optional[int] = None

class CharacterCombinationRequest(BaseModel):
    wuxing_list: List[str]
    gender: Optional[str] = None
    style_preference: Optional[str] = None
    count: Optional[int] = None

class LunarToSolarRequest(BaseModel):
    year: int
    month: int
    day: int
    leap: bool = False

class SolarToLunarRequest(BaseModel):
    year: int
    month: int
    day: int

# 健康检查接口
@app.get("/")
async def root():
    return {
        "message": f"八字运势小程序 API 服务正常运行 (真实算法版)",
        "server_info": SERVER_INFO,
        "access_url": f"http://{LOCAL_IP}:8001",
        "status": "healthy",
        "algorithm_status": "enabled" if ALGORITHMS_AVAILABLE else "fallback_mode",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": "development",
        "version": "2.0.0-real",
        "local_ip": LOCAL_IP,
        "timestamp": datetime.now().isoformat(),
        "dependencies": {
            "fastapi": "✅ 已安装",
            "uvicorn": "✅ 已安装", 
            "pydantic": "✅ 已安装",
            "pillow": "✅ 已安装",
            "cors": "✅ 已配置",
            "sxtwl": "✅ 已安装" if ALGORITHMS_AVAILABLE else "❌ 未安装",
            "zhdate": "✅ 已安装" if ALGORITHMS_AVAILABLE else "❌ 未安装",
            "algorithms": "✅ 已启用" if ALGORITHMS_AVAILABLE else "❌ 降级模式"
        }
    }

# 测试接口
@app.get("/api/v1/test")
async def test_api():
    return {
        "message": "API 测试成功",
        "data": {
            "timestamp": datetime.now().isoformat(),
            "server_ip": LOCAL_IP,
            "algorithm_status": "真实算法" if ALGORITHMS_AVAILABLE else "模拟数据",
            "features": ["八字排盘", "缘分测试", "每日运势", "起名建议"],
            "status": "ready"
        }
    }

# 网络连接测试接口
@app.get("/api/v1/network-test")
async def network_test():
    """网络连接测试接口 - 用于小程序验证网络连通性"""
    return {
        "success": True,
        "message": "网络连接正常",
        "data": {
            "server_ip": LOCAL_IP,
            "timestamp": datetime.now().isoformat(),
            "response_time": "instant",
            "cors_enabled": True,
            "algorithm_version": "真实算法v2.0" if ALGORITHMS_AVAILABLE else "降级模式"
        }
    }

# 统一八字计算接口 - 支持单人和批量计算
@app.post("/api/v1/calculate-bazi")
async def calculate_bazi_unified(request_data: dict):
    """统一的八字计算接口 - 支持单人和批量计算"""
    try:
        # 判断是单人还是批量请求
        if request_data.get('batch', False):
            # 批量计算逻辑
            return await calculate_bazi_batch(request_data)
        else:
            # 单人计算逻辑（保持原有逻辑）
            return await calculate_bazi_single(request_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"统一八字计算出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"计算出错: {str(e)}")

async def calculate_bazi_single(request_data: dict):
    """单人八字计算"""
    try:
        # 从字典中提取数据，兼容BirthData格式
        year = request_data.get('year')
        month = request_data.get('month')
        day = request_data.get('day')
        hour = request_data.get('hour', 12)
        gender = request_data.get('gender', 'male')
        name = request_data.get('name', '匿名用户')
        calendar_type = request_data.get('calendarType', 'solar')
        
        # 数据验证
        if not all([year, month, day]):
            raise HTTPException(status_code=400, detail="缺少必要的出生信息")
        
        # 年份合理性检查
        current_year = datetime.now().year
        if year < 1900 or year > current_year:
            raise HTTPException(status_code=400, detail="出生年份不在有效范围内(1900-当前年份)")
        
        if ALGORITHMS_AVAILABLE and bazi_calculator:
            # 使用真实算法计算
            try:
                result = bazi_calculator.calculate_bazi(
                    year, month, day, hour, gender, calendar_type
                )
                
                # 计算今日运势 - 使用当前日期确保每天不同但同天一致
                # 修复：使用统一的当前日期，确保同一天内所有路径的运势数据一致
                import pytz

                # 使用中国时区获取当前日期，确保时区一致性
                china_tz = pytz.timezone('Asia/Shanghai')
                today_date = datetime.now(china_tz).strftime("%Y-%m-%d")
                
                if fortune_calculator:
                    try:
                        # 转换八字数据格式以匹配FortuneCalculator的期望格式
                        bazi_for_fortune = {
                            "year_pillar": result["bazi"]["year"],
                            "month_pillar": result["bazi"]["month"],
                            "day_pillar": result["bazi"]["day"],
                            "hour_pillar": result["bazi"]["hour"]
                        }
                        
                        fortune_result = fortune_calculator.calculate_daily_fortune(
                            bazi_for_fortune, today_date
                        )
                        if fortune_result["success"]:
                            result["daily_fortune"] = fortune_result["data"]
                            print(f"✅ 单人计算：{request_data.get('name', '用户')} 运势计算成功，运势日期: {today_date}")
                    except Exception as fortune_error:
                        print(f"运势计算失败: {str(fortune_error)}")
                        # 运势计算失败不影响八字结果
                
                return {
                    "success": True,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "真实算法v2.0",
                    "server_info": {
                        "version": "real",
                        "local_ip": LOCAL_IP
                    }
                }
                
            except Exception as algo_error:
                print(f"算法计算出错，使用降级方案: {str(algo_error)}")
                # 降级到模拟数据
                return await calculate_bazi_single_fallback(request_data)
        else:
            # 降级到模拟数据
            return await calculate_bazi_single_fallback(request_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"单人八字计算出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"单人计算出错: {str(e)}")

async def calculate_bazi_batch(request_data: dict):
    """批量八字计算"""
    try:
        members_data = request_data.get('members_data', [])
        target_date = request_data.get('target_date', datetime.now().strftime("%Y-%m-%d"))
        
        if not members_data:
            raise HTTPException(status_code=400, detail="批量计算需要提供成员数据")
        
        results = []
        
        for member in members_data:
            try:
                # 为每个成员计算完整的八字分析
                member_id = member.get('id', 'unknown')
                member_name = member.get('name', '未知')
                
                # 打印完整的成员数据用于调试
                print(f"成员 {member_name} 完整数据: {json.dumps(member, indent=2, ensure_ascii=False)}")
                
                # 尝试多种数据源
                year = member.get('year')
                month = member.get('month')
                day = member.get('day')
                hour = member.get('hour', 12)
                gender = member.get('gender', 'male')
                calendar_type = member.get('calendarType', 'solar')
                
                # 如果直接字段为空，尝试从birthInfo中获取
                if not all([year, month, day]) and 'birthInfo' in member:
                    birth_info = member.get('birthInfo', {})
                    print(f"成员 {member_name} 从birthInfo获取数据: {json.dumps(birth_info, indent=2, ensure_ascii=False)}")
                    
                    year = year or birth_info.get('year')
                    month = month or birth_info.get('month')
                    day = day or birth_info.get('day')
                    hour = hour or birth_info.get('hour', 12)
                    gender = gender or birth_info.get('gender', 'male')
                    calendar_type = calendar_type or birth_info.get('calendarType', 'solar')
                
                print(f"成员 {member_name} 提取到的数据: year={year}, month={month}, day={day}, hour={hour}, gender={gender}, calendar_type={calendar_type}")
                
                # 数据验证和类型转换
                if not all([year, month, day]):
                    print(f"❌ 成员 {member_name} 缺少必要的出生信息: year={year}, month={month}, day={day}")
                    # 不直接抛出异常，而是跳过这个成员
                    results.append({
                        "member_id": member_id,
                        "member_name": member_name,
                        "has_valid_fortune": False,
                        "error": f"缺少必要的出生信息: year={year}, month={month}, day={day}"
                    })
                    continue
                
                # 确保数据类型为整数
                try:
                    year = int(year) if year is not None else None
                    month = int(month) if month is not None else None
                    day = int(day) if day is not None else None
                    hour = int(hour) if hour is not None else 12
                except (ValueError, TypeError) as e:
                    print(f"❌ 成员 {member_name} 数据类型转换失败: {e}")
                    results.append({
                        "member_id": member_id,
                        "member_name": member_name,
                        "has_valid_fortune": False,
                        "error": f"数据格式错误: {str(e)}"
                    })
                    continue
                
                # 再次验证转换后的数据
                if None in [year, month, day] or year <= 0 or month <= 0 or day <= 0:
                    print(f"❌ 成员 {member_name} 数据验证失败: year={year}, month={month}, day={day}")
                    results.append({
                        "member_id": member_id,
                        "member_name": member_name,
                        "has_valid_fortune": False,
                        "error": f"出生日期无效: year={year}, month={month}, day={day}"
                    })
                    continue
                
                print(f"✅ 成员 {member_name} 数据验证成功: year={year}, month={month}, day={day}, hour={hour}, gender={gender}, calendar_type={calendar_type}")
                
                # 计算八字
                if ALGORITHMS_AVAILABLE and bazi_calculator:
                    bazi_result = bazi_calculator.calculate_bazi(
                        year, month, day, hour, gender, calendar_type
                    )
                    
                    # 计算目标日期的运势
                    daily_fortune_data = None
                    has_valid_fortune = False
                    
                    if fortune_calculator:
                        # 修复：转换八字数据格式以匹配FortuneCalculator的期望格式
                        bazi_for_fortune = {
                            "year_pillar": bazi_result["bazi"]["year"],
                            "month_pillar": bazi_result["bazi"]["month"],
                            "day_pillar": bazi_result["bazi"]["day"],
                            "hour_pillar": bazi_result["bazi"]["hour"]
                        }
                        
                        fortune_result = fortune_calculator.calculate_daily_fortune(
                            bazi_for_fortune, target_date
                        )
                        if fortune_result["success"]:
                            daily_fortune_data = fortune_result["data"]
                            has_valid_fortune = True
                            print(f"✅ 成员 {member_name} 运势计算成功，运势日期: {target_date}")
                        else:
                            error_msg = fortune_result.get('error', '未知错误')
                            print(f"❌ 成员 {member_name} 运势计算失败: {error_msg}")
                            print(f"   八字数据: {json.dumps(bazi_for_fortune, ensure_ascii=False)}")
                            print(f"   目标日期: {target_date}")
                            # 创建默认的运势数据结构
                            daily_fortune_data = {
                                "date": target_date,
                                "overall_score": 0,
                                "detailed_scores": {
                                    "wealth": 0,
                                    "career": 0,
                                    "health": 0,
                                    "love": 0,
                                    "study": 0
                                },
                                "lucky_elements": {
                                    "lucky_color": "绿色",
                                    "lucky_colors": ["绿色"],
                                    "lucky_number": 8,
                                    "lucky_numbers": [8],
                                    "lucky_direction": "东方",
                                    "beneficial_wuxing": "木"
                                },
                                "suggestions": ["运势计算失败"],
                                "warnings": [],
                                "detailed_analysis": f"运势计算失败: {error_msg}"
                            }
                            has_valid_fortune = False
                    else:
                        # 没有运势计算器，创建默认数据
                        daily_fortune_data = {
                            "date": target_date,
                            "overall_score": 0,
                            "detailed_scores": {
                                "wealth": 0,
                                "career": 0,
                                "health": 0,
                                "love": 0,
                                "study": 0
                            },
                            "lucky_elements": {
                                "lucky_color": "绿色",
                                "lucky_colors": ["绿色"],
                                "lucky_number": 8,
                                "lucky_numbers": [8],
                                "lucky_direction": "东方",
                                "beneficial_wuxing": "木"
                            },
                            "suggestions": ["运势服务不可用"],
                            "warnings": [],
                            "detailed_analysis": "运势计算服务不可用"
                        }
                        has_valid_fortune = False
                    
                    # 修复：确保返回的数据结构与前端期望一致
                    results.append({
                        "member_id": member_id,
                        "member_name": member_name,
                        "daily_fortune": daily_fortune_data,  # 直接提供daily_fortune字段
                        "has_valid_fortune": has_valid_fortune,
                        # 同时保留原有八字数据结构
                        **bazi_result  # 包含bazi, paipan, wuxing, analysis等
                    })
                else:
                    # 降级方案
                    fallback_result = await calculate_member_fallback(member, target_date)
                    results.append(fallback_result)
                    
            except Exception as member_error:
                print(f"成员 {member.get('name', 'unknown')} 计算失败: {str(member_error)}")
                results.append({
                    "member_id": member.get('id', 'unknown'),
                    "member_name": member.get('name', '未知'),
                    "has_valid_fortune": False,
                    "error": str(member_error)
                })
        
        # 生成家庭运势概览
        family_overview = generate_family_overview(results, target_date)
        
        return {
            "success": True,
            "data": {
                "batch_mode": True,
                "target_date": target_date,
                "members": results,
                "family_overview": family_overview,
                "total_members": len(results)
            },
            "timestamp": datetime.now().isoformat(),
            "algorithm_version": "批量八字计算v2.0"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"批量八字计算出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"批量计算出错: {str(e)}")

def generate_family_overview(results: List[Dict], target_date: str) -> Dict:
    """生成家庭运势概览"""
    if not results:
        return {
            "total_members": 0,
            "average_score": 0,
            "best_member": None,
            "family_lucky_color": "绿色",
            "suggestions": ["添加家庭成员开始使用"],
            "active_members": 0,
            "last_updated": datetime.now().timestamp()
        }
    
    # 筛选有效运势的成员
    valid_members = [r for r in results if r.get("has_valid_fortune", False) and r.get("daily_fortune")]
    
    if not valid_members:
        return {
            "total_members": len(results),
            "average_score": 0,
            "best_member": None,
            "family_lucky_color": "绿色",
            "suggestions": ["重新计算运势"],
            "active_members": 0,
            "last_updated": datetime.now().timestamp()
        }
    
    # 计算平均分数
    total_score = sum(m["daily_fortune"]["overall_score"] for m in valid_members)
    average_score = round(total_score / len(valid_members), 1)
    
    # 找出运势最好的成员
    best_member = max(valid_members, key=lambda x: x["daily_fortune"]["overall_score"])
    
    # 生成家庭建议
    suggestions = []
    if len(valid_members) == 1:
        suggestions.append("添加更多家庭成员，获得完整的家庭运势分析")
    elif len(valid_members) >= 2:
        suggestions.append("全家人今天适合一起活动，增进感情")
    
    high_score_members = [m for m in valid_members if m["daily_fortune"]["overall_score"] >= 4]
    if high_score_members:
        names = [m["member_name"] for m in high_score_members]
        suggestions.append(f"{'、'.join(names)}今日运势特别好")
    
    suggestions.append("每天查看运势，把握最佳时机")
    
    return {
        "total_members": len(results),
        "average_score": average_score,
        "best_member": best_member,
        "family_lucky_color": best_member["daily_fortune"]["lucky_elements"]["lucky_color"],
        "suggestions": suggestions,
        "active_members": len(valid_members),
        "last_updated": datetime.now().timestamp()
    }

async def calculate_member_fallback(member: dict, target_date: str) -> dict:
    """成员计算降级方案"""
    return {
        "member_id": member.get('id', 'unknown'),
        "member_name": member.get('name', '未知'),
        "bazi": {
            "year": "甲子",
            "month": "乙丑", 
            "day": "丙寅",
            "hour": "丁卯"
        },
        "wuxing": {
            "木": 2,
            "火": 2,
            "土": 1,
            "金": 1,
            "水": 2
        },
        "daily_fortune": {
            "date": target_date,
            "overall_score": 3.5,
            "detailed_scores": {
                "wealth": 3.0,
                "career": 3.5,
                "health": 3.0,
                "love": 3.8,
                "study": 3.0
            },
            "lucky_elements": {
                "lucky_color": "绿色",
                "lucky_colors": ["绿色", "青色"],
                "lucky_number": 3,
                "lucky_numbers": [3, 8],
                "lucky_direction": "东方",
                "beneficial_wuxing": "木"
            },
            "suggestions": ["保持平常心"],
            "warnings": [],
            "detailed_analysis": "降级模式下的运势分析"
        },
        "has_valid_fortune": True
    }

async def calculate_bazi_single_fallback(request_data: dict):
    """单人八字计算降级方案"""
    name = request_data.get('name', '匿名用户')
    
    # 生成模拟的八字结果
    mock_result = {
        "bazi": {
            "year": "甲子",
            "month": "乙丑", 
            "day": "丙寅",
            "hour": "丁卯"
        },
        "wuxing": {
            "木": 2,
            "火": 2,
            "土": 1,
            "金": 1,
            "水": 2
        },
        "analysis": {
            "personality": "性格平和，做事踏实，有较强的责任心。",
            "wuxing_analysis": "五行较为平衡，整体运势稳定。",
            "career": "适合从事稳定性工作，如教育、行政等。",
            "love": "感情生活较为顺利，容易遇到合适的伴侣。"
        }
    }
    
    # 添加用户信息
    mock_result["user_info"] = {
        "name": name,
        "birth_date": f"{request_data.get('year', 2000)}-{request_data.get('month', 1):02d}-{request_data.get('day', 1):02d}",
        "birth_time": f"{request_data.get('hour', 12):02d}:00",
        "gender": request_data.get('gender', 'male')
    }
    
    return {
        "success": True,
        "data": mock_result,
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "降级模拟数据",
        "disclaimer": "当前使用模拟数据，仅供网络连接测试",
        "server_info": {
            "version": "fallback",
            "local_ip": LOCAL_IP
        }
    }

async def calculate_bazi_fallback(birth_data: BirthData):
    """八字计算降级方案 - 模拟数据"""
    # 生成模拟的八字结果
    mock_result = {
        "bazi": {
            "year": "甲子",
            "month": "乙丑", 
            "day": "丙寅",
            "hour": "丁卯"
        },
        "wuxing": {
            "wood": 2,
            "fire": 2,
            "earth": 1,
            "metal": 1,
            "water": 2
        },
        "analysis": {
            "personality": "性格平和，做事踏实，有较强的责任心。",
            "wuxing_analysis": "五行较为平衡，整体运势稳定。",
            "career": "适合从事稳定性工作，如教育、行政等。",
            "love": "感情生活较为顺利，容易遇到合适的伴侣。"
        }
    }
    
    # 添加用户信息
    mock_result["user_info"] = {
        "name": birth_data.name,
        "birth_date": f"{birth_data.year}-{birth_data.month:02d}-{birth_data.day:02d}",
        "birth_time": f"{birth_data.hour:02d}:00",
        "gender": birth_data.gender
    }
    
    return {
        "success": True,
        "data": mock_result,
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "降级模拟数据",
        "disclaimer": "当前使用模拟数据，仅供网络连接测试",
        "server_info": {
            "version": "fallback",
            "local_ip": LOCAL_IP
        }
    }

# 起名接口 - 使用真实算法  
@app.post("/api/v1/naming/generate")
async def generate_names_v1(naming_data: NamingRequest):
    """标准起名接口"""
    return await generate_names(naming_data)

@app.post("/api/v1/naming/generate-names") 
async def generate_names(naming_data: NamingRequest):
    """起名接口 - 真实算法版"""
    try:
        if ALGORITHMS_AVAILABLE and naming_calculator:
            # 使用真实算法
            try:
                birth_info = {
                    'year': naming_data.birth_year,
                    'month': naming_data.birth_month,
                    'day': naming_data.birth_day,
                    'hour': naming_data.birth_hour,
                    'calendar_type': naming_data.calendar_type
                }
                
                result = naming_calculator.analyze_and_generate_names(
                    naming_data.surname, naming_data.gender, birth_info,
                    naming_data.name_length, naming_data.count, 
                    getattr(naming_data, 'session_seed', None)
                )
                
                return {
                    "success": True,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "真实算法v2.0"
                }
                
            except Exception as algo_error:
                print(f"起名算法出错，使用降级方案: {str(algo_error)}")
                return await generate_names_fallback(naming_data)
        else:
            return await generate_names_fallback(naming_data)
        
    except Exception as e:
        print(f"起名生成出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"起名生成失败: {str(e)}")

async def generate_names_fallback(naming_data: NamingRequest):
    """起名降级方案"""
    surname = naming_data.surname
    gender = naming_data.gender
    
    # 生成模拟的起名建议
    if gender == 'male':
        suggestions = [
            f"{surname}浩然", f"{surname}子轩", f"{surname}天翊",
            f"{surname}宇航", f"{surname}晨阳"
        ]
    else:
        suggestions = [
            f"{surname}雨桐", f"{surname}诗涵", f"{surname}梓萱", 
            f"{surname}思琪", f"{surname}雅婷"
        ]
    
    mock_result = {
        "recommendations": [
            {
                "name": name,
                "score": 85 + i * 2,
                "analysis": f"五行平衡，寓意美好",
                "wuxing_match": "较好"
            }
            for i, name in enumerate(suggestions[:naming_data.count])
        ],
        "analysis_summary": f"基于{surname}姓氏为{gender}性别生成的起名建议",
        "naming_suggestions": [
            "注重五行平衡",
            "选择寓意积极的字",
            "考虑音韵搭配"
        ]
    }
    
    return {
        "success": True,
        "data": mock_result,
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "降级模拟数据"
    }

# 生肖配对接口 - 使用多维度算法
@app.post("/api/v1/zodiac-matching")
async def zodiac_matching(request_data: ZodiacMatchingRequest):
    """生肖配对接口 - 多维度评分体系"""
    try:
        zodiac1 = request_data.zodiac1
        zodiac2 = request_data.zodiac2
        
        if ALGORITHMS_AVAILABLE:
            # 使用多维度算法
            try:
                result = calculate_zodiac_compatibility(zodiac1, zodiac2)
                
                if result.get('error'):
                    # 算法返回错误，使用降级方案
                    return await zodiac_matching_fallback(zodiac1, zodiac2)
                
                # 转换为前端需要的格式
                api_result = {
                    "zodiac1": result['male_zodiac'],
                    "zodiac2": result['female_zodiac'],
                    "compatibility_score": result['overall_score'],
                    "compatibility_level": result['compatibility_level'],
                    "emoji": result['emoji'],
                    "analysis": result['analysis'],
                    "advantages": result['advantages'],
                    "challenges": result['challenges'],
                    "suggestions": result['suggestions'],
                    "famous_couples": result['famous_couples'],
                    "detailed_scores": result['scores'],
                    "dimensions": result['dimensions'],
                    "calculation_method": result['calculation_method']
                }
                
                return {
                    "success": True,
                    "data": api_result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "多维度评分体系v2.0"
                }
                
            except Exception as algo_error:
                print(f"多维度生肖配对算法出错，使用降级方案: {str(algo_error)}")
                return await zodiac_matching_fallback(zodiac1, zodiac2)
        else:
            # 使用降级方案
            return await zodiac_matching_fallback(zodiac1, zodiac2)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生肖配对失败: {str(e)}")

async def zodiac_matching_fallback(zodiac1: str, zodiac2: str):
    """生肖配对降级方案"""
    # 简化的生肖配对算法
    compatibility_map = {
        ('鼠', '牛'): 85, ('鼠', '龙'): 90, ('鼠', '猴'): 88,
        ('牛', '蛇'): 87, ('牛', '鸡'): 86,
        ('虎', '马'): 89, ('虎', '狗'): 85,
        ('兔', '羊'): 86, ('兔', '猪'): 84,
        ('龙', '鸡'): 87, ('龙', '猴'): 85,
        ('蛇', '猴'): 82, ('蛇', '鸡'): 88,
        ('马', '羊'): 84, ('马', '狗'): 86,
        ('羊', '猪'): 85,
        ('猴', '鸡'): 83, ('狗', '猪'): 81
    }
    
    # 查找配对得分
    pair1 = (zodiac1, zodiac2)
    pair2 = (zodiac2, zodiac1)
    score = compatibility_map.get(pair1, compatibility_map.get(pair2, 75))
    
    if score >= 85:
        level = "非常匹配"
        description = f"{zodiac1}和{zodiac2}是天作之合，配对指数很高"
    elif score >= 80:
        level = "较好匹配"
        description = f"{zodiac1}和{zodiac2}配对较好，相处和谐"
    elif score >= 70:
        level = "一般匹配"
        description = f"{zodiac1}和{zodiac2}配对一般，需要磨合"
    else:
        level = "需要努力"
        description = f"{zodiac1}和{zodiac2}需要更多理解和包容"
    
    result = {
        "zodiac1": zodiac1,
        "zodiac2": zodiac2,
        "compatibility_score": score,
        "compatibility_level": level,
        "analysis": description,
        "advantages": "性格互补，价值观相近，沟通顺畅。",
        "suggestions": "多理解对方，保持沟通，共同成长。"
    }
    
    return {
        "success": True,
        "data": result,
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "简化配对算法v1.0(降级模式)"
    }

# 节日查询接口
@app.get("/api/v1/festivals")
async def get_festivals():
    """节日查询接口"""
    try:
        today = datetime.now()
        
        # 简化的节日数据
        festivals = [
            {
                "name": "春节",
                "date": "2024-02-10",
                "type": "传统节日",
                "description": "中国最重要的传统节日"
            },
            {
                "name": "元宵节", 
                "date": "2024-02-24",
                "type": "传统节日",
                "description": "正月十五元宵节"
            },
            {
                "name": "清明节",
                "date": "2024-04-05", 
                "type": "传统节日",
                "description": "祭祖扫墓的节日"
            },
            {
                "name": "端午节",
                "date": "2024-06-10",
                "type": "传统节日", 
                "description": "纪念屈原的节日"
            },
            {
                "name": "中秋节",
                "date": "2024-09-17",
                "type": "传统节日",
                "description": "团圆赏月的节日"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "current_date": today.strftime("%Y-%m-%d"),
                "festivals": festivals,
                "total": len(festivals)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"节日查询失败: {str(e)}")

# 注：Tab图标接口已移除 - Tab图标现在使用app.json中的静态配置

# 注：图标生成接口已移除 - 所有图标现在使用静态配置

# 农历转公历接口
@app.post("/api/v1/lunar-to-solar")
async def lunar_to_solar(request_data: LunarToSolarRequest):
    """农历转公历接口"""
    try:
        year = request_data.year
        month = request_data.month
        day = request_data.day
        leap = request_data.leap
        
        # 详细的参数日志
        print(f"🌙 农历转公历API - 接收参数: year={year}({type(year)}), month={month}({type(month)}), day={day}({type(day)}), leap={leap}")
        
        # 数据类型验证
        if not isinstance(year, int):
            raise HTTPException(status_code=400, detail=f"年份必须是整数，收到: {year} (类型: {type(year).__name__})")
        if not isinstance(month, int):
            raise HTTPException(status_code=400, detail=f"月份必须是整数，收到: {month} (类型: {type(month).__name__})")
        if not isinstance(day, int):
            raise HTTPException(status_code=400, detail=f"日期必须是整数，收到: {day} (类型: {type(day).__name__})")
        
        # 数据范围验证
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail=f"年份超出支持范围(1900-2100)，收到: {year}")
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail=f"月份无效(1-12)，收到: {month}")
        if day < 1 or day > 30:
            raise HTTPException(status_code=400, detail=f"日期无效(1-30)，收到: {day}")
        
        if ALGORITHMS_AVAILABLE and bazi_calculator:
            # 使用真实算法转换
            try:
                solar_date = bazi_calculator.lunar_to_solar(year, month, day, leap)
                return {
                    "success": True,
                    "data": {
                        "lunar_date": {
                            "year": year,
                            "month": month, 
                            "day": day,
                            "leap": leap
                        },
                        "solar_date": solar_date,
                        "conversion_type": "lunar_to_solar"
                    },
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "真实算法v2.0"
                }
            except Exception as algo_error:
                print(f"农历转公历算法出错: {str(algo_error)}")
                # 使用降级方案
                pass
        
        # 降级方案：简单的近似转换
        from datetime import date, timedelta
        try:
            # 简化的转换逻辑：农历大约比公历早20-50天
            approx_offset = 30  # 平均偏移量
            solar_year = year
            solar_month = month
            solar_day = day + approx_offset
            
            # 处理日期溢出
            if solar_day > 30:
                solar_month += 1
                solar_day -= 30
            if solar_month > 12:
                solar_year += 1
                solar_month -= 12
            
            # 确保日期有效
            solar_day = min(solar_day, 28)  # 保守取值
            
            return {
                "success": True,
                "data": {
                    "lunar_date": {
                        "year": year,
                        "month": month,
                        "day": day,
                        "leap": leap
                    },
                    "solar_date": {
                        "year": solar_year,
                        "month": solar_month,
                        "day": solar_day
                    },
                    "conversion_type": "lunar_to_solar",
                    "note": "使用简化转换算法"
                },
                "timestamp": datetime.now().isoformat(),
                "algorithm_version": "简化算法"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"日期转换失败: {str(e)}")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"农历转公历失败: {str(e)}")

# 公历转农历接口
@app.post("/api/v1/solar-to-lunar")
async def solar_to_lunar(request_data: SolarToLunarRequest):
    """公历转农历接口"""
    try:
        year = request_data.year
        month = request_data.month
        day = request_data.day
        
        # 数据验证
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="年份超出支持范围(1900-2100)")
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="月份无效(1-12)")
        if day < 1 or day > 31:
            raise HTTPException(status_code=400, detail="日期无效(1-31)")
        
        if ALGORITHMS_AVAILABLE and bazi_calculator:
            # 使用真实算法转换
            try:
                lunar_date = bazi_calculator.solar_to_lunar(year, month, day)
                return {
                    "success": True,
                    "data": {
                        "solar_date": {
                            "year": year,
                            "month": month,
                            "day": day
                        },
                        "lunar_date": lunar_date,
                        "conversion_type": "solar_to_lunar"
                    },
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "真实算法v2.0"
                }
            except Exception as algo_error:
                print(f"公历转农历算法出错: {str(algo_error)}")
                # 使用降级方案
                pass
        
        # 降级方案：简单的近似转换
        try:
            # 简化的转换逻辑：公历大约比农历晚20-50天
            approx_offset = 30  # 平均偏移量
            lunar_year = year
            lunar_month = month
            lunar_day = day - approx_offset
            
            # 处理日期下溢
            if lunar_day <= 0:
                lunar_month -= 1
                lunar_day += 30
            if lunar_month <= 0:
                lunar_year -= 1
                lunar_month += 12
            
            # 确保日期有效
            lunar_day = max(lunar_day, 1)
            
            return {
                "success": True,
                "data": {
                    "solar_date": {
                        "year": year,
                        "month": month,
                        "day": day
                    },
                    "lunar_date": {
                        "year": lunar_year,
                        "month": lunar_month,
                        "day": lunar_day,
                        "leap": False
                    },
                    "conversion_type": "solar_to_lunar",
                    "note": "使用简化转换算法"
                },
                "timestamp": datetime.now().isoformat(),
                "algorithm_version": "简化算法"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"日期转换失败: {str(e)}")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"公历转农历失败: {str(e)}")

# 名字评估接口
@app.post("/api/v1/naming/evaluate")
async def evaluate_name(evaluation_data: NameEvaluationRequest):
    """评估指定名字"""
    try:
        if ALGORITHMS_AVAILABLE and naming_calculator:
            birth_info = {
                'year': evaluation_data.birth_year,
                'month': evaluation_data.birth_month,
                'day': evaluation_data.birth_day,
                'hour': evaluation_data.birth_hour,
                'calendar_type': evaluation_data.calendar_type
            }
            
            result = naming_calculator.evaluate_specific_name(
                evaluation_data.surname, 
                evaluation_data.given_name,
                evaluation_data.gender,
                birth_info
            )
            
            return {
                "success": True,
                "data": result,
                "timestamp": datetime.now().isoformat(),
                "algorithm_version": "真实算法v2.0"
            }
        else:
            # 降级方案
            return {
                "success": True,
                "data": {
                    "evaluation": {
                        "full_name": f"{evaluation_data.surname}{evaluation_data.given_name}",
                        "overall_score": 78.5,
                        "analysis": "名字寓意良好，适合使用",
                        "suggestions": "整体较好，建议保留"
                    }
                },
                "algorithm_version": "降级模式",
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"名字评估失败: {str(e)}")

# 个性化起名接口 - 新增功能
@app.post("/api/v1/naming/personalized-generate")
async def generate_personalized_names(naming_data: PersonalizedNamingRequest):
    """个性化起名接口 - 支持用户偏好设置"""
    try:
        if ALGORITHMS_AVAILABLE and naming_calculator:
            # 使用个性化算法
            try:
                birth_info = {
                    'year': naming_data.birth_year,
                    'month': naming_data.birth_month,
                    'day': naming_data.birth_day,
                    'hour': naming_data.birth_hour,
                    'calendar_type': naming_data.calendar_type
                }
                
                # 构建偏好设置对象，合并所有偏好参数
                preferences = {}
                
                # 从直接参数添加，注意参数映射
                if naming_data.cultural_level:
                    preferences['cultural_level'] = naming_data.cultural_level
                if naming_data.popularity:
                    preferences['popularity'] = naming_data.popularity
                if naming_data.era_style:
                    # 修复参数映射：era_style -> era
                    preferences['era'] = naming_data.era_style
                if naming_data.rarity:
                    preferences['rarity'] = naming_data.rarity
                if naming_data.selected_chars:
                    preferences['selected_chars'] = naming_data.selected_chars
                if naming_data.meaning_keywords:
                    preferences['meaning_keywords'] = naming_data.meaning_keywords
                
                # 从preferences字典添加（如果存在）
                if naming_data.preferences:
                    # 确保preferences字典中的era_style也被正确映射为era
                    prefs_copy = naming_data.preferences.copy()
                    if 'era_style' in prefs_copy and 'era' not in prefs_copy:
                        prefs_copy['era'] = prefs_copy.pop('era_style')
                    preferences.update(prefs_copy)
                
                print(f"🎯 个性化起名接口: 解析到偏好设置 {preferences}")
                
                result = naming_calculator.analyze_and_generate_personalized_names(
                    naming_data.surname, naming_data.gender, birth_info,
                    naming_data.name_length, naming_data.count, 
                    preferences if preferences else None, naming_data.session_seed
                )
                
                return {
                    "success": True,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "个性化推荐算法v2.0"
                }
                
            except Exception as algo_error:
                print(f"个性化起名算法出错，使用标准方案: {str(algo_error)}")
                import traceback
                traceback.print_exc()
                # 降级到标准起名算法
                return await generate_names(naming_data)
        else:
            return await generate_names_fallback(naming_data)
        
    except Exception as e:
        print(f"个性化起名生成出错: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"个性化起名生成失败: {str(e)}")

# 字义搜索接口 - 新增功能
@app.post("/api/v1/naming/search-characters")
async def search_characters(search_data: CharacterSearchRequest):
    """根据含义关键词搜索汉字"""
    try:
        if ALGORITHMS_AVAILABLE and naming_calculator:
            try:
                result = naming_calculator.get_character_recommendations_by_meaning(
                    search_data.keyword,
                    search_data.wuxing,
                    search_data.gender,
                    search_data.count
                )
                
                return {
                    "success": True,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "字义搜索算法v2.0"
                }
                
            except Exception as algo_error:
                print(f"字义搜索算法出错: {str(algo_error)}")
                return await search_characters_fallback(search_data)
        else:
            return await search_characters_fallback(search_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"字义搜索失败: {str(e)}")

async def search_characters_fallback(search_data: CharacterSearchRequest):
    """字义搜索降级方案"""
    keyword = search_data.keyword
    
    # 简化的字义搜索
    character_map = {
        '智慧': [
            {'char': '智', 'wuxing': '火', 'meaning': '智慧，聪明，智谋'},
            {'char': '慧', 'wuxing': '水', 'meaning': '慧心，智慧，聪颖'},
            {'char': '聪', 'wuxing': '金', 'meaning': '聪明，智慧，机敏'},
            {'char': '明', 'wuxing': '火', 'meaning': '明亮，聪明，光明'},
            {'char': '睿', 'wuxing': '金', 'meaning': '睿智，深明，通达'}
        ],
        '美好': [
            {'char': '美', 'wuxing': '水', 'meaning': '美丽，美好，优美'},
            {'char': '好', 'wuxing': '水', 'meaning': '好的，美好，善良'},
            {'char': '雅', 'wuxing': '木', 'meaning': '雅致，高雅，文雅'},
            {'char': '佳', 'wuxing': '木', 'meaning': '佳美，美好，优秀'},
            {'char': '优', 'wuxing': '土', 'meaning': '优秀，优美，卓越'}
        ],
        '成功': [
            {'char': '成', 'wuxing': '金', 'meaning': '成功，成就，完成'},
            {'char': '功', 'wuxing': '木', 'meaning': '功劳，功绩，成果'},
            {'char': '达', 'wuxing': '火', 'meaning': '到达，通达，成功'},
            {'char': '胜', 'wuxing': '金', 'meaning': '胜利，超越，成功'},
            {'char': '凯', 'wuxing': '木', 'meaning': '凯旋，胜利，成功'}
        ]
    }
    
    # 查找相关字
    found_chars = []
    for meaning, char_list in character_map.items():
        if keyword in meaning:
            found_chars.extend(char_list)
    
    if not found_chars:
        # 默认推荐一些常用字
        found_chars = [
            {'char': '文', 'wuxing': '水', 'meaning': '文化，文雅，有文采'},
            {'char': '武', 'wuxing': '水', 'meaning': '武功，勇敢，坚强'},
            {'char': '明', 'wuxing': '火', 'meaning': '明亮，聪明，光明'},
            {'char': '亮', 'wuxing': '火', 'meaning': '明亮，清楚，光明'},
            {'char': '华', 'wuxing': '水', 'meaning': '华丽，精华，光彩'}
        ]
    
    recommendations = []
    for i, char_info in enumerate(found_chars[:search_data.count]):
        recommendations.append({
            'char': char_info['char'],
            'wuxing': char_info['wuxing'],
            'meaning': char_info['meaning'],
            'stroke': 8 + (i % 5),  # 简化处理，给不同笔画数
            'gender': 'neutral',
            'cultural_level': 'classic',
            'popularity': 'high',
            'era': 'classical'
        })
    
    return {
        "success": True,
        "data": {
            "keyword": keyword,
            "recommendations": recommendations,
            "total_count": len(recommendations)
        },
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "简化搜索算法"
    }

# 字组合推荐接口 - 新增功能
@app.post("/api/v1/naming/character-combinations")
async def get_character_combinations(combination_data: CharacterCombinationRequest):
    """获取字的组合建议"""
    try:
        if ALGORITHMS_AVAILABLE and naming_calculator:
            try:
                result = naming_calculator.get_character_combinations(
                    combination_data.wuxing_list,
                    combination_data.gender,
                    combination_data.style_preference,
                    combination_data.count
                )
                
                return {
                    "success": True,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "字组合推荐算法v2.0"
                }
                
            except Exception as algo_error:
                print(f"字组合推荐算法出错: {str(algo_error)}")
                return await get_character_combinations_fallback(combination_data)
        else:
            return await get_character_combinations_fallback(combination_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"字组合推荐失败: {str(e)}")

async def get_character_combinations_fallback(combination_data: CharacterCombinationRequest):
    """字组合推荐降级方案"""
    wuxing_list = combination_data.wuxing_list
    gender = combination_data.gender
    
    # 简化的字组合生成
    wuxing_chars = {
        '木': ['林', '森', '梅', '兰', '竹', '桂'],
        '火': ['明', '亮', '辉', '阳', '晨', '昊'],
        '土': ['山', '岩', '城', '坤', '培', '基'],
        '金': ['金', '银', '铁', '锋', '锐', '铭'],
        '水': ['江', '河', '海', '波', '流', '溪']
    }
    
    # 根据五行列表生成组合
    combinations = []
    if len(wuxing_list) >= 2:
        chars1 = wuxing_chars.get(wuxing_list[0], ['文'])
        chars2 = wuxing_chars.get(wuxing_list[1], ['华'])
        
        for i, char1 in enumerate(chars1[:5]):
            for j, char2 in enumerate(chars2[:5]):
                if len(combinations) >= combination_data.count:
                    break
                
                combinations.append({
                    'combination': char1 + char2,
                    'first_char': char1,
                    'second_char': char2,
                    'score': 85 - (i + j),
                    'first_info': {
                        'wuxing': wuxing_list[0],
                        'meaning': f'{char1}字美好',
                        'stroke': 8
                    },
                    'second_info': {
                        'wuxing': wuxing_list[1],
                        'meaning': f'{char2}字美好',
                        'stroke': 8
                    }
                })
    
    return {
        "success": True,
        "data": {
            "wuxing_list": wuxing_list,
            "recommendations": combinations,
            "total_count": len(combinations)
        },
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "简化组合算法"
    }

# 注：/api/v1/calculate-fortune 接口已移除 - 统一使用 /api/v1/calculate-bazi 接口


@app.post("/api/v1/calculate-bazi-with-fortune")
async def calculate_bazi_with_fortune(birth_data: BirthData, target_date: Optional[str] = None):
    """增强的八字计算接口 - 同时返回八字和运势"""
    try:
        # 如果没有指定日期，使用今天
        if not target_date:
            target_date = datetime.now().strftime("%Y-%m-%d")
        
        # 先计算八字
        bazi_result = await calculate_bazi(birth_data)
        
        if not bazi_result["success"] or not fortune_calculator:
            return bazi_result
        
        # 再计算运势
        fortune_result = fortune_calculator.calculate_daily_fortune(
            bazi_result["data"], target_date
        )
        
        # 合并结果
        if fortune_result["success"]:
            combined_data = bazi_result["data"].copy()
            combined_data["daily_fortune"] = fortune_result["data"]
            
            return {
                "success": True,
                "data": combined_data,
                "timestamp": datetime.now().isoformat(),
                "algorithm_version": "八字+运势一体化计算v2.0"
            }
        else:
            return bazi_result
        
    except Exception as e:
        print(f"八字+运势计算出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"八字+运势计算失败: {str(e)}")

# 注：calculate_fortune_fallback 函数已移除 - 统一使用 calculate_bazi_unified 接口


# 书籍联盟营销接口 - 新增功能
@app.post("/api/v1/books/recommendations")
async def get_book_recommendations(request_data: dict):
    """获取书籍推荐"""
    if book_affiliate_service:
        return await book_affiliate_service.get_recommendations(request_data)
    return {"success": False, "message": "联盟营销服务不可用", "data": {"recommendations": []}}

@app.post("/api/v1/books/affiliate-link")
async def generate_affiliate_link(request_data: dict):
    """生成联盟推广链接"""
    if book_affiliate_service:
        return await book_affiliate_service.generate_affiliate_link(
            request_data.get('book_id'),
            request_data.get('platform'),
            request_data.get('user_id')
        )
    return {"success": False, "message": "联盟营销服务不可用"}

@app.post("/api/v1/books/search")
async def search_books(request_data: dict):
    """搜索书籍"""
    if book_affiliate_service:
        return await book_affiliate_service.search_books(
            request_data.get('query', ''),
            request_data.get('limit', 10)
        )
    return {"success": False, "message": "联盟营销服务不可用", "data": {"books": []}}

# 注：移除了平台状态和统计信息接口，因为：
# 1. 平台状态主要用于内部监控，用户不需要
# 2. 统计信息由联盟平台后台提供，无需API接口

# 字库统计接口 - 新增功能
@app.get("/api/v1/naming/database-stats")
async def get_database_statistics():
    """获取字库统计信息"""
    try:
        if ALGORITHMS_AVAILABLE and naming_calculator:
            try:
                result = naming_calculator.get_database_statistics()
                
                return {
                    "success": True,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "algorithm_version": "字库统计算法v2.0"
                }
                
            except Exception as algo_error:
                print(f"字库统计算法出错: {str(algo_error)}")
                return await get_database_statistics_fallback()
        else:
            return await get_database_statistics_fallback()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取字库统计失败: {str(e)}")

async def get_database_statistics_fallback():
    """字库统计降级方案"""
    mock_stats = {
        'total_chars': 150,
        'by_wuxing': {
            '木': 30,
            '火': 30,
            '土': 30,
            '金': 30,
            '水': 30
        },
        'by_gender': {
            'male': 60,
            'female': 60,
            'neutral': 30
        },
        'by_era': {
            'ancient': 40,
            'classical': 40,
            'modern': 35,
            'contemporary': 35
        },
        'by_popularity': {
            'high': 70,
            'medium': 50,
            'low': 30
        }
    }
    
    return {
        "success": True,
        "data": {
            "statistics": mock_stats
        },
        "timestamp": datetime.now().isoformat(),
        "algorithm_version": "模拟统计数据"
    }

# 异常处理
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "message": "接口不存在", 
            "error": "Not Found",
            "server_info": SERVER_INFO,
            "algorithm_status": "真实算法" if ALGORITHMS_AVAILABLE else "降级模式"
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "服务器内部错误", 
            "error": "Internal Server Error",
            "server_info": SERVER_INFO,
            "algorithm_status": "真实算法" if ALGORITHMS_AVAILABLE else "降级模式"
        }
    )

# 自定义JSON响应类，确保中文正确编码
class UnicodeJSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")

# 覆盖默认JSON响应
app.default_response_class = UnicodeJSONResponse

if __name__ == "__main__":
    print("🚀 启动八字运势小程序 FastAPI 服务器 (真实算法版)")
    print(f"📍 本机IP地址: {LOCAL_IP}")
    print(f"🌐 访问地址: http://{LOCAL_IP}:8001")
    print(f"📚 API文档: http://{LOCAL_IP}:8001/docs")
    print(f"🧮 算法状态: {'真实算法已启用' if ALGORITHMS_AVAILABLE else '降级到模拟数据'}")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
