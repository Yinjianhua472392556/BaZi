#!/usr/bin/env python3
"""
生成默认tab图标脚本
用于在没有网络时提供备用图标
"""

import os
import sys
import json
from datetime import datetime

# 添加后端目录到路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))

from icon_generator import IconGenerator

class DefaultIconGenerator:
    """默认图标生成器"""
    
    def __init__(self):
        self.icon_generator = IconGenerator()
        self.output_dir = os.path.join(os.path.dirname(__file__), '..', 'miniprogram', 'images', 'tab-icons')
        
        # 默认主题色彩配置
        self.default_theme = {
            'normal': '#666666',
            'selected': '#C8860D'
        }
        
        # 图标配置
        self.icon_types = ['bazi', 'festival', 'zodiac', 'profile']
        self.styles = ['normal', 'selected']
    
    def ensure_output_directory(self):
        """确保输出目录存在"""
        os.makedirs(self.output_dir, exist_ok=True)
        print(f"📁 输出目录: {self.output_dir}")
    
    def generate_single_icon(self, icon_type: str, style: str) -> bool:
        """生成单个图标文件"""
        try:
            # 生成图标数据
            theme_color = self.default_theme[style]
            icon_data = self.icon_generator.generate_icon(
                icon_type=icon_type,
                style=style,
                theme_color=theme_color
            )
            
            # 保存文件
            filename = f"{icon_type}_{style}.png"
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(icon_data)
            
            print(f"✅ 生成成功: {filename}")
            return True
            
        except Exception as e:
            print(f"❌ 生成失败 {icon_type}_{style}: {e}")
            return False
    
    def generate_all_icons(self):
        """生成所有默认图标"""
        print("🎨 开始生成默认tab图标...")
        
        # 确保输出目录存在
        self.ensure_output_directory()
        
        success_count = 0
        total_count = len(self.icon_types) * len(self.styles)
        
        # 生成所有图标
        for icon_type in self.icon_types:
            for style in self.styles:
                if self.generate_single_icon(icon_type, style):
                    success_count += 1
        
        # 生成配置文件
        self.generate_config_file()
        
        print(f"\n📊 生成结果: {success_count}/{total_count} 成功")
        
        if success_count == total_count:
            print("🎉 所有默认图标生成完成！")
            return True
        else:
            print("⚠️  部分图标生成失败")
            return False
    
    def generate_config_file(self):
        """生成配置文件"""
        config = {
            'version': '1.0.0',
            'generated_at': datetime.now().isoformat(),
            'theme': self.default_theme,
            'description': 'Default tab icons for offline use',
            'icons': {}
        }
        
        # 添加图标信息
        for icon_type in self.icon_types:
            config['icons'][icon_type] = {
                'normal': f"{icon_type}_normal.png",
                'selected': f"{icon_type}_selected.png",
                'description': self.icon_generator.icon_configs[icon_type]['description']
            }
        
        # 保存配置文件
        config_path = os.path.join(self.output_dir, 'config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print(f"📋 配置文件已生成: config.json")
    
    def list_generated_files(self):
        """列出生成的文件"""
        if not os.path.exists(self.output_dir):
            print("❌ 输出目录不存在")
            return
        
        files = os.listdir(self.output_dir)
        png_files = [f for f in files if f.endswith('.png')]
        
        print(f"\n📋 已生成的图标文件 ({len(png_files)} 个):")
        for file in sorted(png_files):
            filepath = os.path.join(self.output_dir, file)
            size = os.path.getsize(filepath)
            print(f"  - {file} ({size} bytes)")
        
        # 检查配置文件
        config_file = os.path.join(self.output_dir, 'config.json')
        if os.path.exists(config_file):
            print(f"  - config.json ({os.path.getsize(config_file)} bytes)")

def main():
    """主函数"""
    generator = DefaultIconGenerator()
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        if sys.argv[1] == 'list':
            generator.list_generated_files()
            return
        elif sys.argv[1] == 'clean':
            import shutil
            if os.path.exists(generator.output_dir):
                shutil.rmtree(generator.output_dir)
                print("🗑️  清理完成")
            return
    
    # 生成图标
    success = generator.generate_all_icons()
    
    # 列出生成的文件
    generator.list_generated_files()
    
    if success:
        print("\n✨ 默认图标生成完成！可以在没有网络时使用这些图标作为备用方案。")
    else:
        print("\n⚠️  生成过程中遇到问题，请检查错误信息。")
        sys.exit(1)

if __name__ == '__main__':
    main()
