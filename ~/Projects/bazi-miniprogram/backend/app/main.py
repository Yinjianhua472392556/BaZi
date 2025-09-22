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

# 创建八字计算器实例
bazi_calculator = BaziCalculator()

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
