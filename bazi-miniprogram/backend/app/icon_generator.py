"""
图标生成模块 - 动态生成Tab图标
"""
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime

class IconGenerator:
    """图标生成器类"""
    
    def __init__(self):
        self.icon_size = (40, 40)  # 微信小程序Tab图标尺寸
        self.default_colors = {
            'normal': '#666666',
            'selected': '#C8860D'
        }
        
        # 图标配置
        self.icon_configs = {
            'bazi': {
                'name': '八字测算',
                'type': 'taiji',
                'description': '太极八卦图标'
            },
            'naming': {
                'name': '智能起名',
                'type': 'baby_star',
                'description': '婴儿+星星图标'
            },
            'festival': {
                'name': '节日列表',
                'type': 'calendar',
                'description': '日历图标'
            },
            'zodiac': {
                'name': '生肖配对',
                'type': 'heart',
                'description': '心形图标'
            },
            'profile': {
                'name': '个人中心',
                'type': 'user',
                'description': '用户图标'
            }
        }
    
    def create_taiji_icon(self, color: str, selected: bool = False) -> Image.Image:
        """创建太极图标"""
        img = Image.new('RGBA', self.icon_size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        # 外圆
        draw.ellipse([2, 2, 38, 38], outline=color, width=2)
        
        # 太极图案
        if selected:
            # 选中状态 - 填充效果
            draw.pieslice([2, 2, 38, 38], 90, 270, fill=color)
            draw.ellipse([12, 10, 28, 26], fill='white')
            draw.ellipse([12, 24, 28, 40], fill=color)
            draw.ellipse([16, 14, 24, 22], fill=color)
            draw.ellipse([16, 28, 24, 36], fill='white')
        else:
            # 普通状态 - 线条效果
            draw.arc([8, 8, 32, 32], 0, 180, fill=color, width=2)
            draw.ellipse([18, 12, 22, 16], fill=color)
            draw.ellipse([18, 24, 22, 28], fill=color)
        
        # 八卦装饰线
        draw.line([6, 6, 10, 6], fill=color, width=1)
        draw.line([6, 8, 10, 8], fill=color, width=1)
        draw.line([30, 32, 34, 32], fill=color, width=1)
        draw.line([30, 34, 34, 34], fill=color, width=1)
        
        return img
    
    def create_calendar_icon(self, color: str, selected: bool = False) -> Image.Image:
        """创建日历图标"""
        img = Image.new('RGBA', self.icon_size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        # 日历框架
        draw.rectangle([8, 12, 32, 36], outline=color, width=2)
        
        # 日历头部
        if selected:
            draw.rectangle([8, 12, 32, 18], fill=color)
        else:
            draw.rectangle([8, 12, 32, 18], outline=color, width=2)
        
        # 日历装订孔
        draw.line([14, 8, 14, 16], fill=color, width=2)
        draw.line([26, 8, 26, 16], fill=color, width=2)
        
        # 日期点
        date_color = '#FFD700' if selected else color
        draw.ellipse([12, 22, 16, 26], fill=color)
        draw.ellipse([18, 22, 22, 26], fill=color)
        draw.ellipse([24, 22, 28, 26], fill=color)
        draw.ellipse([12, 28, 16, 32], fill=color)
        draw.ellipse([18, 28, 22, 32], fill=date_color)  # 突出显示今天
        draw.ellipse([24, 28, 28, 32], fill=color)
        
        return img
    
    def create_heart_icon(self, color: str, selected: bool = False) -> Image.Image:
        """创建心形图标"""
        img = Image.new('RGBA', self.icon_size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        if selected:
            # 选中状态 - 填充心形
            # 左半心
            draw.ellipse([8, 12, 18, 22], fill=color)
            # 右半心
            draw.ellipse([22, 12, 32, 22], fill=color)
            # 心形底部
            draw.polygon([(20, 18), (8, 30), (20, 34), (32, 30)], fill=color)
            
            # 装饰点
            draw.ellipse([15, 18, 17, 20], fill='#FFD700')
            draw.ellipse([23, 18, 25, 20], fill='#FFD700')
            draw.ellipse([19, 22, 21, 24], fill='#FFD700')
        else:
            # 普通状态 - 线条心形
            draw.ellipse([8, 12, 18, 22], outline=color, width=2)
            draw.ellipse([22, 12, 32, 22], outline=color, width=2)
            draw.polygon([(20, 18), (8, 30), (20, 34), (32, 30)], outline=color, width=2)
            
            # 装饰点
            draw.ellipse([15, 18, 17, 20], fill=color)
            draw.ellipse([23, 18, 25, 20], fill=color)
            draw.ellipse([19, 22, 21, 24], fill=color)
        
        return img
    
    def create_user_icon(self, color: str, selected: bool = False) -> Image.Image:
        """创建用户图标"""
        img = Image.new('RGBA', self.icon_size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        if selected:
            # 选中状态 - 填充效果
            draw.ellipse([14, 8, 26, 20], fill=color)
            draw.pieslice([8, 20, 32, 36], 0, 180, fill=color)
        else:
            # 普通状态 - 线条效果
            draw.ellipse([14, 8, 26, 20], outline=color, width=2)
            draw.arc([8, 20, 32, 36], 0, 180, fill=color, width=2)
        
        return img
    
    def create_brush_icon(self, color: str, selected: bool = False) -> Image.Image:
        """创建婴儿+星星图标 - 用于智能起名"""
        img = Image.new('RGBA', self.icon_size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        
        # 温馨的配色方案
        baby_color = '#FFB6C1' if selected else color  # 选中时使用粉色
        star_color = '#FFD700'  # 金色星星
        
        if selected:
            # 选中状态 - 填充效果
            # 婴儿头部 - 圆形
            draw.ellipse([14, 10, 26, 22], fill=baby_color, outline='#FF69B4', width=1)
            
            # 婴儿身体 - 小椭圆
            draw.ellipse([16, 20, 24, 28], fill=baby_color, outline='#FF69B4', width=1)
            
            # 婴儿眼睛 - 小点
            draw.ellipse([17, 14, 19, 16], fill='#4169E1')  # 蓝色眼睛
            draw.ellipse([21, 14, 23, 16], fill='#4169E1')
            
            # 婴儿嘴巴 - 小弧线
            draw.arc([18, 17, 22, 19], 0, 180, fill='#FF69B4', width=1)
            
            # 星星装饰 - 五角星形状（简化为菱形+小点）
            # 左上星星
            draw.polygon([(8, 8), (10, 12), (6, 12)], fill=star_color)
            draw.ellipse([7, 9, 9, 11], fill=star_color)
            
            # 右上星星
            draw.polygon([(32, 8), (34, 12), (30, 12)], fill=star_color)
            draw.ellipse([31, 9, 33, 11], fill=star_color)
            
            # 左下星星
            draw.polygon([(6, 30), (8, 34), (4, 34)], fill=star_color)
            draw.ellipse([5, 31, 7, 33], fill=star_color)
            
            # 右下星星
            draw.polygon([(34, 30), (36, 34), (32, 34)], fill=star_color)
            draw.ellipse([33, 31, 35, 33], fill=star_color)
            
            # 中心闪光效果
            draw.ellipse([19, 12, 21, 14], fill='#FFFFFF')  # 小亮点
            
        else:
            # 普通状态 - 线条效果
            # 婴儿头部 - 圆形轮廓
            draw.ellipse([14, 10, 26, 22], outline=color, width=2)
            
            # 婴儿身体 - 小椭圆轮廓
            draw.ellipse([16, 20, 24, 28], outline=color, width=2)
            
            # 婴儿眼睛 - 小点
            draw.ellipse([17, 14, 19, 16], fill=color)
            draw.ellipse([21, 14, 23, 16], fill=color)
            
            # 婴儿嘴巴 - 小弧线
            draw.arc([18, 17, 22, 19], 0, 180, fill=color, width=1)
            
            # 星星装饰 - 简化星形
            # 左上星星
            draw.polygon([(8, 8), (10, 12), (6, 12)], outline=color, width=1)
            draw.ellipse([7, 9, 9, 11], fill=color)
            
            # 右上星星
            draw.polygon([(32, 8), (34, 12), (30, 12)], outline=color, width=1)
            draw.ellipse([31, 9, 33, 11], fill=color)
            
            # 左下星星
            draw.polygon([(6, 30), (8, 34), (4, 34)], outline=color, width=1)
            draw.ellipse([5, 31, 7, 33], fill=color)
            
            # 右下星星
            draw.polygon([(34, 30), (36, 34), (32, 34)], outline=color, width=1)
            draw.ellipse([33, 31, 35, 33], fill=color)
        
        return img
    
    def generate_icon(self, icon_type: str, style: str = 'normal', 
                     theme_color: Optional[str] = None) -> bytes:
        """
        生成指定类型的图标
        
        Args:
            icon_type: 图标类型 (bazi, festival, zodiac, profile)
            style: 样式 (normal, selected)
            theme_color: 主题色，如果为None则使用默认色
        
        Returns:
            PNG格式的图标字节数据
        """
        color = theme_color or self.default_colors.get(style, self.default_colors['normal'])
        selected = (style == 'selected')
        
        # 根据图标类型创建对应图标
        if icon_type == 'bazi':
            img = self.create_taiji_icon(color, selected)
        elif icon_type == 'naming':
            img = self.create_brush_icon(color, selected)
        elif icon_type == 'festival':
            img = self.create_calendar_icon(color, selected)
        elif icon_type == 'zodiac':
            img = self.create_heart_icon(color, selected)
        elif icon_type == 'profile':
            img = self.create_user_icon(color, selected)
        else:
            # 默认图标 - 简单圆形
            img = Image.new('RGBA', self.icon_size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(img)
            draw.ellipse([8, 8, 32, 32], outline=color, width=2)
            if selected:
                draw.ellipse([8, 8, 32, 32], fill=color)
        
        # 转换为PNG字节数据
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        return buffer.getvalue()
    
    def get_icon_config(self) -> Dict:
        """获取所有图标配置信息"""
        return {
            'version': '1.0.0',
            'last_updated': datetime.now().isoformat(),
            'icon_size': self.icon_size,
            'default_colors': self.default_colors,
            'icons': self.icon_configs,
            'styles': ['normal', 'selected'],
            'supported_formats': ['PNG']
        }
    
    def generate_all_icons(self, theme_colors: Optional[Dict] = None) -> Dict[str, bytes]:
        """
        批量生成所有图标
        
        Args:
            theme_colors: 主题色配置，格式: {'normal': '#color1', 'selected': '#color2'}
        
        Returns:
            所有图标的字节数据字典
        """
        colors = theme_colors or self.default_colors
        icons = {}
        
        for icon_type in self.icon_configs.keys():
            for style in ['normal', 'selected']:
                icon_name = f"{icon_type}_{style}"
                icons[icon_name] = self.generate_icon(
                    icon_type=icon_type,
                    style=style,
                    theme_color=colors.get(style)
                )
        
        return icons
    
    def create_base64_icon(self, icon_type: str, style: str = 'normal') -> str:
        """
        生成Base64编码的图标（用于API返回）
        
        Args:
            icon_type: 图标类型
            style: 样式
            
        Returns:
            Base64编码的图标数据
        """
        icon_bytes = self.generate_icon(icon_type, style)
        return base64.b64encode(icon_bytes).decode('utf-8')

# 创建全局图标生成器实例
icon_generator = IconGenerator()
