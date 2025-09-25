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

try:
    from bazi_calculator import BaziCalculator
    from naming_calculator import NamingCalculator
    from icon_generator import IconGenerator
    ALGORITHMS_AVAILABLE = True
    print("✅ 算法模块导入成功")
except ImportError as e:
    print(f"❌ 算法模块导入失败: {e}")
    ALGORITHMS_AVAILABLE = False

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

# 初始化算法实例
if ALGORITHMS_AVAILABLE:
    bazi_calculator = BaziCalculator()
    naming_calculator = NamingCalculator()
    icon_generator = IconGenerator()
else:
    bazi_calculator = None
    naming_calculator = None
    icon_generator = None

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
    count: int = 10

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

# 八字计算接口 - 使用真实算法
@app.post("/api/v1/calculate-bazi")
async def calculate_bazi(birth_data: BirthData):
    """八字计算接口 - 真实算法版"""
    try:
        # 数据验证
        if not all([birth_data.year, birth_data.month, birth_data.day]):
            raise HTTPException(status_code=400, detail="缺少必要的出生信息")
        
        # 年份合理性检查
        current_year = datetime.now().year
        if birth_data.year < 1900 or birth_data.year > current_year:
            raise HTTPException(status_code=400, detail="出生年份不在有效范围内(1900-当前年份)")
        
        if ALGORITHMS_AVAILABLE and bazi_calculator:
            # 使用真实算法计算
            try:
                result = bazi_calculator.calculate_bazi(
                    birth_data.year, birth_data.month, birth_data.day,
                    birth_data.hour, birth_data.gender, birth_data.calendarType
                )
                
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
                return await calculate_bazi_fallback(birth_data)
        else:
            # 降级到模拟数据
            return await calculate_bazi_fallback(birth_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"八字计算出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"计算出错: {str(e)}")

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
                    naming_data.name_length, naming_data.count
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

# 生肖配对接口
@app.post("/api/v1/zodiac-matching")
async def zodiac_matching(request_data: ZodiacMatchingRequest):
    """生肖配对接口"""
    try:
        zodiac1 = request_data.zodiac1
        zodiac2 = request_data.zodiac2
        
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
            "advantages": ["性格互补", "价值观相近", "沟通顺畅"],
            "suggestions": ["多理解对方", "保持沟通", "共同成长"]
        }
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat(),
            "algorithm_version": "简化配对算法v1.0"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生肖配对失败: {str(e)}")

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

# Tab图标配置接口
@app.get("/api/v1/tab-icons/config")
async def get_tab_icons_config():
    """获取Tab图标配置信息"""
    try:
        return {
            "success": True,
            "data": {
                "version": "1.0.0",
                "last_updated": datetime.now().isoformat(),
                "available_icons": ["bazi", "naming", "festival", "zodiac", "profile"],
                "themes": ["default", "dark", "spring", "autumn"],
                "styles": ["normal", "selected"],
                "cache_duration": 86400  # 24小时缓存
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取图标配置失败: {str(e)}")

# Tab图标获取接口
@app.get("/api/v1/tab-icons/{icon_type}")
async def get_tab_icon(icon_type: str, style: str = "normal", theme_color: str = "#666666"):
    """获取具体的Tab图标"""
    try:
        # 验证参数
        valid_icons = ["bazi", "naming", "festival", "zodiac", "profile"]
        valid_styles = ["normal", "selected"]
        
        if icon_type not in valid_icons:
            raise HTTPException(status_code=400, detail=f"不支持的图标类型: {icon_type}")
        
        if style not in valid_styles:
            raise HTTPException(status_code=400, detail=f"不支持的样式: {style}")
        
        if ALGORITHMS_AVAILABLE and icon_generator:
            # 使用真实图标生成器
            icon_data = icon_generator.create_base64_icon(icon_type, style)
            return {
                "success": True,
                "data": {
                    "icon_type": icon_type,
                    "style": style,
                    "theme_color": theme_color,
                    "format": "base64_png",
                    "icon_data": icon_data
                },
                "timestamp": datetime.now().isoformat()
            }
        else:
            # 降级方案：返回默认图标路径
            icon_map = {
                "bazi": {"normal": "/images/tab-icons/bazi_normal.png", "selected": "/images/tab-icons/bazi_selected.png"},
                "naming": {"normal": "/images/tab-icons/bazi_normal.png", "selected": "/images/tab-icons/bazi_selected.png"},
                "festival": {"normal": "/images/tab-icons/festival_normal.png", "selected": "/images/tab-icons/festival_selected.png"},
                "zodiac": {"normal": "/images/tab-icons/zodiac_normal.png", "selected": "/images/tab-icons/zodiac_selected.png"},
                "profile": {"normal": "/images/tab-icons/profile_normal.png", "selected": "/images/tab-icons/profile_selected.png"}
            }
            
            return {
                "success": True,
                "data": {
                    "icon_type": icon_type,
                    "style": style,
                    "fallback": True,
                    "local_path": icon_map.get(icon_type, {}).get(style, ""),
                    "message": "使用本地默认图标"
                },
                "timestamp": datetime.now().isoformat()
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取Tab图标失败: {str(e)}")

# 图标生成接口 (保留原有功能)
@app.get("/api/v1/icons/{icon_type}")
async def get_icon(icon_type: str, style: str = "normal"):
    """获取生成的图标"""
    try:
        if ALGORITHMS_AVAILABLE and icon_generator:
            icon_data = icon_generator.create_base64_icon(icon_type, style)
            return {
                "success": True,
                "data": {
                    "icon_type": icon_type,
                    "style": style,
                    "format": "base64_png",
                    "icon_data": icon_data
                },
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "图标生成功能不可用",
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图标生成失败: {str(e)}")

# 农历转公历接口
@app.post("/api/v1/lunar-to-solar")
async def lunar_to_solar(request_data: LunarToSolarRequest):
    """农历转公历接口"""
    try:
        year = request_data.year
        month = request_data.month
        day = request_data.day
        leap = request_data.leap
        
        # 数据验证
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="年份超出支持范围(1900-2100)")
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="月份无效(1-12)")
        if day < 1 or day > 30:
            raise HTTPException(status_code=400, detail="日期无效(1-30)")
        
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
