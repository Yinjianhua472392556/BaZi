#!/usr/bin/env python3
"""
测试八字计算器
"""
import sys
import os
sys.path.append('.')

from backend.app.bazi_calculator import BaziCalculator

def test_bazi_calculator():
    """测试八字计算器"""
    calculator = BaziCalculator()
    
    print("测试八字计算器...")
    try:
        result = calculator.calculate_bazi(
            year=1990,
            month=5,
            day=15,
            hour=14,
            gender="male"
        )
        
        print("计算成功！")
        print(f"八字: {result['bazi']}")
        print(f"五行: {result['wuxing']}")
        print(f"分析: {result['analysis']['summary']}")
        
        return True
    except Exception as e:
        print(f"计算失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_bazi_calculator()
