"""
八字运势小程序 - FastAPI 主应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
from datetime import datetime
from bazi_calculator import BaziCalculator
from icon_generator import icon_generator
from naming_calculator import NamingCalculator
from fastapi.responses import Response

# 创建 FastAPI 应用实例
app = FastAPI(
    title="八字运势小程序 API",
    description="基于传统文化的娱乐性八字测算 API",
    version="1.0.0",
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

# 健康检查接口
@app.get("/")
async def root():
    return {
        "message": "八字运势小程序 API 服务正常运行", 
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": "development",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# 测试接口
@app.get("/api/v1/test")
async def test_api():
    return {
        "message": "API 测试成功",
        "data": {
            "timestamp": datetime.now().isoformat(),
            "features": ["八字排盘", "缘分测试", "每日运势"],
            "status": "ready"
        }
    }

# 请求数据模型
class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int = 12
    gender: str = "male"
    name: str = "匿名用户"
    calendarType: str = "solar"  # "solar" 公历 或 "lunar" 农历

class LunarConvertData(BaseModel):
    year: int
    month: int
    day: int
    leap: bool = False

# 创建计算器实例
bazi_calculator = BaziCalculator()
naming_calculator = NamingCalculator()

# 八字计算接口（使用真实算法）
@app.post("/api/v1/calculate-bazi")
async def calculate_bazi(birth_data: BirthData):
    """
    八字计算接口 - 使用真实算法
    """
    try:
        # 数据验证
        if not all([birth_data.year, birth_data.month, birth_data.day]):
            return JSONResponse(
                status_code=400,
                content={"error": "缺少必要的出生信息"}
            )
        
        # 年份合理性检查
        current_year = datetime.now().year
        if birth_data.year < 1900 or birth_data.year > current_year:
            return JSONResponse(
                status_code=400,
                content={"error": "出生年份不在有效范围内(1900-当前年份)"}
            )
        
        # 月份和日期检查
        if birth_data.month < 1 or birth_data.month > 12:
            return JSONResponse(
                status_code=400,
                content={"error": "月份必须在1-12之间"}
            )
        
        if birth_data.day < 1 or birth_data.day > 31:
            return JSONResponse(
                status_code=400,
                content={"error": "日期必须在1-31之间"}
            )
        
        if birth_data.hour < 0 or birth_data.hour > 23:
            return JSONResponse(
                status_code=400,
                content={"error": "小时必须在0-23之间"}
            )
        
        # 调用真实的八字计算算法
        result = bazi_calculator.calculate_bazi(
            year=birth_data.year,
            month=birth_data.month,
            day=birth_data.day,
            hour=birth_data.hour,
            gender=birth_data.gender,
            calendar_type=birth_data.calendarType
        )
        
        # 添加用户信息
        result["user_info"] = {
            "name": birth_data.name,
            "birth_date": f"{birth_data.year}-{birth_data.month:02d}-{birth_data.day:02d}",
            "birth_time": f"{birth_data.hour:02d}:00",
            "gender": birth_data.gender
        }
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat(),
            "disclaimer": "本结果基于传统八字理论计算，仅供娱乐参考，不可作为人生决策依据"
        }
        
    except Exception as e:
        print(f"八字计算出错: {str(e)}")  # 服务器日志
        return JSONResponse(
            status_code=500,
            content={"error": f"计算出错: {str(e)}"}
        )

# 农历转公历接口
@app.post("/api/v1/lunar-to-solar")
async def lunar_to_solar(lunar_data: LunarConvertData):
    """
    农历转公历接口 - 用于前端实时转换显示
    """
    try:
        # 数据验证
        if not all([lunar_data.year, lunar_data.month, lunar_data.day]):
            return JSONResponse(
                status_code=400,
                content={"error": "缺少必要的农历日期信息"}
            )
        
        # 年份合理性检查
        current_year = datetime.now().year
        if lunar_data.year < 1900 or lunar_data.year > current_year + 1:
            return JSONResponse(
                status_code=400,
                content={"error": "农历年份不在有效范围内"}
            )
        
        # 月份检查
        if lunar_data.month < 1 or lunar_data.month > 12:
            return JSONResponse(
                status_code=400,
                content={"error": "农历月份必须在1-12之间"}
            )
        
        # 日期检查
        if lunar_data.day < 1 or lunar_data.day > 30:
            return JSONResponse(
                status_code=400,
                content={"error": "农历日期必须在1-30之间"}
            )
        
        # 调用农历转公历算法
        solar_result = bazi_calculator.lunar_to_solar(
            year=lunar_data.year,
            month=lunar_data.month,
            day=lunar_data.day,
            leap=lunar_data.leap
        )
        
        return {
            "success": True,
            "data": {
                "solar_date": solar_result,
                "lunar_date": {
                    "year": lunar_data.year,
                    "month": lunar_data.month,
                    "day": lunar_data.day,
                    "leap": lunar_data.leap
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"农历转公历出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"转换出错: {str(e)}"}
        )

# 公历转农历接口
@app.post("/api/v1/solar-to-lunar")
async def solar_to_lunar(birth_data: BirthData):
    """
    公历转农历接口 - 用于显示对应农历日期
    """
    try:
        # 数据验证
        if not all([birth_data.year, birth_data.month, birth_data.day]):
            return JSONResponse(
                status_code=400,
                content={"error": "缺少必要的公历日期信息"}
            )
        
        # 调用公历转农历算法
        lunar_result = bazi_calculator.solar_to_lunar(
            year=birth_data.year,
            month=birth_data.month,
            day=birth_data.day
        )
        
        return {
            "success": True,
            "data": {
                "lunar_date": lunar_result,
                "solar_date": {
                    "year": birth_data.year,
                    "month": birth_data.month,
                    "day": birth_data.day
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"公历转农历出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"转换出错: {str(e)}"}
        )

# ==================== 图标服务接口 ====================

# 图标主题配置模型
class IconThemeData(BaseModel):
    normal_color: str = "#666666"
    selected_color: str = "#C8860D"
    theme_name: str = "default"

@app.get("/api/v1/tab-icons/config")
async def get_tab_icons_config():
    """
    获取Tab图标配置信息
    
    Returns:
        图标配置信息，包括版本、颜色、支持的图标类型等
    """
    try:
        config = icon_generator.get_icon_config()
        return {
            "success": True,
            "data": config,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"获取图标配置出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"获取图标配置失败: {str(e)}"}
        )

@app.get("/api/v1/tab-icons/{icon_name}")
async def get_tab_icon(icon_name: str, style: str = "normal", theme_color: str = None):
    """
    获取指定的Tab图标文件
    
    Args:
        icon_name: 图标名称 (bazi, festival, zodiac, profile)
        style: 图标样式 (normal, selected)
        theme_color: 自定义主题色 (可选)
    
    Returns:
        PNG格式的图标文件
    """
    try:
        # 验证图标名称
        valid_icons = ['bazi', 'festival', 'zodiac', 'profile']
        if icon_name not in valid_icons:
            return JSONResponse(
                status_code=400,
                content={"error": f"不支持的图标类型，支持的类型: {valid_icons}"}
            )
        
        # 验证样式
        valid_styles = ['normal', 'selected']
        if style not in valid_styles:
            return JSONResponse(
                status_code=400,
                content={"error": f"不支持的样式，支持的样式: {valid_styles}"}
            )
        
        # 生成图标
        icon_bytes = icon_generator.generate_icon(
            icon_type=icon_name,
            style=style,
            theme_color=theme_color
        )
        
        # 返回PNG图片
        return Response(
            content=icon_bytes,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=3600",  # 缓存1小时
                "Content-Disposition": f'inline; filename="{icon_name}_{style}.png"'
            }
        )
        
    except Exception as e:
        print(f"生成图标出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"生成图标失败: {str(e)}"}
        )

@app.post("/api/v1/tab-icons/batch-download")
async def batch_download_icons(theme_data: IconThemeData = None):
    """
    批量获取所有Tab图标的下载链接
    
    Args:
        theme_data: 主题配置 (可选)
    
    Returns:
        所有图标的下载链接和配置信息
    """
    try:
        # 获取主题色配置
        theme_colors = {
            'normal': theme_data.normal_color if theme_data else "#666666",
            'selected': theme_data.selected_color if theme_data else "#C8860D"
        }
        
        # 生成所有图标的下载链接
        base_url = "/api/v1/tab-icons"
        icon_types = ['bazi', 'festival', 'zodiac', 'profile']
        styles = ['normal', 'selected']
        
        icons = {}
        for icon_type in icon_types:
            icons[icon_type] = {}
            for style in styles:
                # 构建下载URL
                url = f"{base_url}/{icon_type}?style={style}"
                if theme_data:
                    url += f"&theme_color={theme_colors[style]}"
                
                icons[icon_type][style] = {
                    "url": url,
                    "filename": f"{icon_type}_{style}.png",
                    "color": theme_colors[style]
                }
        
        return {
            "success": True,
            "data": {
                "icons": icons,
                "theme": {
                    "name": theme_data.theme_name if theme_data else "default",
                    "colors": theme_colors
                },
                "config": {
                    "icon_size": "40x40",
                    "format": "PNG",
                    "cache_duration": 3600
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"批量下载图标出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"批量下载失败: {str(e)}"}
        )

@app.get("/api/v1/tab-icons/themes/available")
async def get_available_themes():
    """
    获取可用的图标主题列表
    
    Returns:
        可用的主题配置列表
    """
    try:
        themes = [
            {
                "name": "default",
                "display_name": "默认主题",
                "colors": {
                    "normal": "#666666",
                    "selected": "#C8860D"
                },
                "description": "经典金色主题，适合传统文化应用"
            },
            {
                "name": "dark",
                "display_name": "深色主题", 
                "colors": {
                    "normal": "#888888",
                    "selected": "#FFD700"
                },
                "description": "深色模式适配主题"
            },
            {
                "name": "spring",
                "display_name": "春节主题",
                "colors": {
                    "normal": "#8B4513",
                    "selected": "#FF6B6B"
                },
                "description": "春节红色喜庆主题"
            },
            {
                "name": "autumn",
                "display_name": "秋季主题",
                "colors": {
                    "normal": "#A0522D",
                    "selected": "#FF8C00"
                },
                "description": "秋季橙色温暖主题"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "themes": themes,
                "default_theme": "default"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"获取主题列表出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"获取主题列表失败: {str(e)}"}
        )

# ==================== 起名服务接口 ====================

# 起名请求数据模型
class NamingRequest(BaseModel):
    surname: str
    gender: str = "male"
    year: int
    month: int
    day: int
    hour: int = 12
    calendar_type: str = "solar"
    name_length: int = 2
    count: int = 10

class EvaluateNameRequest(BaseModel):
    surname: str
    given_name: str
    gender: str = "male"
    year: int
    month: int
    day: int
    hour: int = 12
    calendar_type: str = "solar"

@app.post("/api/v1/naming/generate-names")
async def generate_names(naming_data: NamingRequest):
    """
    智能起名接口 - 根据八字五行生成推荐名字
    """
    try:
        # 数据验证
        if not naming_data.surname or len(naming_data.surname) > 3:
            return JSONResponse(
                status_code=400,
                content={"error": "姓氏不能为空且不能超过3个字"}
            )
        
        if naming_data.gender not in ["male", "female"]:
            return JSONResponse(
                status_code=400,
                content={"error": "性别必须为male或female"}
            )
        
        if naming_data.name_length not in [1, 2]:
            return JSONResponse(
                status_code=400,
                content={"error": "名字长度只支持1或2个字"}
            )
        
        if naming_data.count < 1 or naming_data.count > 20:
            return JSONResponse(
                status_code=400,
                content={"error": "生成数量必须在1-20之间"}
            )
        
        # 年份合理性检查
        current_year = datetime.now().year
        if naming_data.year < 1900 or naming_data.year > current_year:
            return JSONResponse(
                status_code=400,
                content={"error": "出生年份不在有效范围内(1900-当前年份)"}
            )
        
        # 构建出生信息
        birth_info = {
            'year': naming_data.year,
            'month': naming_data.month,
            'day': naming_data.day,
            'hour': naming_data.hour,
            'calendar_type': naming_data.calendar_type
        }
        
        # 调用起名算法
        result = naming_calculator.analyze_and_generate_names(
            surname=naming_data.surname,
            gender=naming_data.gender,
            birth_info=birth_info,
            name_length=naming_data.name_length,
            count=naming_data.count
        )
        
        if result['success']:
            return {
                "success": True,
                "data": {
                    "bazi_analysis": result['bazi_analysis'],
                    "recommendations": result['recommendations'],
                    "analysis_summary": result['analysis_summary'],
                    "naming_suggestions": result['naming_suggestions'],
                    "input_info": {
                        "surname": naming_data.surname,
                        "gender": naming_data.gender,
                        "birth_date": f"{naming_data.year}-{naming_data.month:02d}-{naming_data.day:02d}",
                        "name_length": naming_data.name_length
                    }
                },
                "timestamp": datetime.now().isoformat(),
                "disclaimer": "起名结果基于传统五行理论和姓名学计算，仅供娱乐参考"
            }
        else:
            return JSONResponse(
                status_code=500,
                content={"error": result.get('error', '起名生成失败')}
            )
        
    except Exception as e:
        print(f"起名生成出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"起名生成失败: {str(e)}"}
        )

@app.post("/api/v1/naming/evaluate-name")
async def evaluate_name(evaluate_data: EvaluateNameRequest):
    """
    名字评估接口 - 评估指定名字的吉凶
    """
    try:
        # 数据验证
        if not evaluate_data.surname or not evaluate_data.given_name:
            return JSONResponse(
                status_code=400,
                content={"error": "姓氏和名字不能为空"}
            )
        
        if len(evaluate_data.surname) > 3 or len(evaluate_data.given_name) > 2:
            return JSONResponse(
                status_code=400,
                content={"error": "姓氏不能超过3个字，名字不能超过2个字"}
            )
        
        # 构建出生信息
        birth_info = {
            'year': evaluate_data.year,
            'month': evaluate_data.month,
            'day': evaluate_data.day,
            'hour': evaluate_data.hour,
            'calendar_type': evaluate_data.calendar_type
        }
        
        # 调用名字评估算法
        result = naming_calculator.evaluate_specific_name(
            surname=evaluate_data.surname,
            given_name=evaluate_data.given_name,
            gender=evaluate_data.gender,
            birth_info=birth_info
        )
        
        if result['success']:
            return {
                "success": True,
                "data": {
                    "evaluation": result['evaluation'],
                    "bazi_analysis": result['bazi_analysis'],
                    "input_info": {
                        "full_name": evaluate_data.surname + evaluate_data.given_name,
                        "gender": evaluate_data.gender,
                        "birth_date": f"{evaluate_data.year}-{evaluate_data.month:02d}-{evaluate_data.day:02d}"
                    }
                },
                "timestamp": datetime.now().isoformat(),
                "disclaimer": "名字评估基于传统五行理论和姓名学计算，仅供娱乐参考"
            }
        else:
            return JSONResponse(
                status_code=500,
                content={"error": result.get('error', '名字评估失败')}
            )
        
    except Exception as e:
        print(f"名字评估出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"名字评估失败: {str(e)}"}
        )

@app.get("/api/v1/naming/wuxing-chars")
async def get_wuxing_chars(wuxing: str = "木", gender: str = "neutral"):
    """
    获取指定五行属性的汉字列表
    
    Args:
        wuxing: 五行属性 (金、木、水、火、土)
        gender: 性别偏好 (male、female、neutral)
    
    Returns:
        符合条件的汉字列表
    """
    try:
        # 验证五行属性
        valid_wuxing = ['金', '木', '水', '火', '土']
        if wuxing not in valid_wuxing:
            return JSONResponse(
                status_code=400,
                content={"error": f"五行属性必须是: {valid_wuxing}"}
            )
        
        # 验证性别参数
        valid_genders = ['male', 'female', 'neutral']
        if gender not in valid_genders:
            return JSONResponse(
                status_code=400,
                content={"error": f"性别参数必须是: {valid_genders}"}
            )
        
        # 获取汉字列表
        from naming_calculator import ChineseCharDatabase
        char_db = ChineseCharDatabase()
        chars = char_db.get_chars_by_wuxing(wuxing, gender=gender)
        
        return {
            "success": True,
            "data": {
                "wuxing": wuxing,
                "gender": gender,
                "chars": chars,
                "count": len(chars)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"获取五行汉字出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"获取汉字列表失败: {str(e)}"}
        )

@app.get("/api/v1/naming/char-info/{char}")
async def get_char_info(char: str):
    """
    获取指定汉字的详细信息
    
    Args:
        char: 汉字
    
    Returns:
        汉字的五行、笔画、寓意等信息
    """
    try:
        if not char or len(char) != 1:
            return JSONResponse(
                status_code=400,
                content={"error": "请提供一个有效的汉字"}
            )
        
        # 获取汉字信息
        from naming_calculator import ChineseCharDatabase
        char_db = ChineseCharDatabase()
        char_info = char_db.get_char_properties(char)
        
        return {
            "success": True,
            "data": {
                "char": char,
                "info": char_info
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"获取汉字信息出错: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"获取汉字信息失败: {str(e)}"}
        )

# 异常处理
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "接口不存在", "error": "Not Found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "服务器内部错误", "error": "Internal Server Error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
