#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复传统文化层次标签缺失问题

问题：
1. 前端提供了'traditional'文化层次选项，但字库中只有'classic'和'modern'
2. 导致选择"传统文化"偏好时找不到匹配字符
3. "传统文化+水系+女性字符"为0个

解决方案：
1. 为古风韵味深厚的字符添加'traditional'标签
2. 补充传统文化水系女性字符
3. 更新total_count
"""

import json
import os

def load_char_database():
    """加载字符数据库"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    chars_file = os.path.join(script_dir, '..', 'backend', 'data', 'chars', 'chars_main.json')
    
    with open(chars_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data, chars_file

def add_traditional_level():
    """为适合的字符添加traditional文化层次"""
    
    # 1. 加载当前数据
    data, chars_file = load_char_database()
    chars = data.get('chars', {})
    
    print(f"原始字符数量: {len(chars)}")
    
    # 2. 定义传统文化字符 - 主要是古典诗词中常见的字
    traditional_chars = {
        # 传统文化男性字
        '君': {'stroke': 7, 'wuxing': '木', 'meaning': '君子，高贵', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '賢': {'stroke': 15, 'wuxing': '木', 'meaning': '贤能，德才', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
        '德': {'stroke': 15, 'wuxing': '火', 'meaning': '品德，德行', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '仁': {'stroke': 4, 'wuxing': '金', 'meaning': '仁爱，仁慈', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '义': {'stroke': 13, 'wuxing': '木', 'meaning': '正义，义气', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '礼': {'stroke': 18, 'wuxing': '火', 'meaning': '礼仪，礼貌', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '士': {'stroke': 3, 'wuxing': '金', 'meaning': '士人，学者', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '文': {'stroke': 4, 'wuxing': '水', 'meaning': '文采，文雅', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '武': {'stroke': 8, 'wuxing': '水', 'meaning': '武艺，勇武', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '圣': {'stroke': 13, 'wuxing': '土', 'meaning': '圣贤，神圣', 'suitable_for_name': True, 'gender': 'male', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        
        # 传统文化女性字（重点补充水系）
        '淑': {'stroke': 12, 'wuxing': '水', 'meaning': '淑女，贤淑', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '慧': {'stroke': 15, 'wuxing': '水', 'meaning': '智慧，聪慧', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '瑶': {'stroke': 15, 'wuxing': '火', 'meaning': '美玉，瑶池', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '琴': {'stroke': 13, 'wuxing': '木', 'meaning': '古琴，音律', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '棋': {'stroke': 12, 'wuxing': '木', 'meaning': '琴棋书画', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '书': {'stroke': 10, 'wuxing': '金', 'meaning': '书香，学问', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '画': {'stroke': 12, 'wuxing': '土', 'meaning': '绘画，艺术', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '诗': {'stroke': 13, 'wuxing': '金', 'meaning': '诗歌，才华', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '词': {'stroke': 12, 'wuxing': '金', 'meaning': '诗词，文采', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '赋': {'stroke': 15, 'wuxing': '水', 'meaning': '赋诗，才情', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ze'},
        
        # 更多传统文化水系女性字
        '溪': {'stroke': 14, 'wuxing': '水', 'meaning': '溪水，清澈', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '潇': {'stroke': 20, 'wuxing': '水', 'meaning': '潇洒，自然', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '湘': {'stroke': 13, 'wuxing': '水', 'meaning': '湘水，湘妃', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '漪': {'stroke': 15, 'wuxing': '水', 'meaning': '水波，涟漪', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
        '沅': {'stroke': 8, 'wuxing': '水', 'meaning': '沅江，清流', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
        '汀': {'stroke': 5, 'wuxing': '水', 'meaning': '水边，汀洲', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
        '澜': {'stroke': 21, 'wuxing': '水', 'meaning': '波澜，壮阔', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
        '沛': {'stroke': 8, 'wuxing': '水', 'meaning': '充沛，丰盛', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '渊': {'stroke': 12, 'wuxing': '水', 'meaning': '深渊，深邃', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '滢': {'stroke': 19, 'wuxing': '水', 'meaning': '清澈，晶莹', 'suitable_for_name': True, 'gender': 'female', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'uncommon', 'era': 'ancient', 'tone_category': 'ping'},
        
        # 传统文化中性字
        '道': {'stroke': 16, 'wuxing': '火', 'meaning': '道德，道路', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '心': {'stroke': 4, 'wuxing': '金', 'meaning': '心性，内心', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
        '性': {'stroke': 8, 'wuxing': '金', 'meaning': '本性，天性', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'traditional', 'popularity': 'medium', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '善': {'stroke': 12, 'wuxing': '金', 'meaning': '善良，善行', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ze'},
        '真': {'stroke': 10, 'wuxing': '金', 'meaning': '真实，纯真', 'suitable_for_name': True, 'gender': 'neutral', 'cultural_level': 'traditional', 'popularity': 'high', 'rarity': 'common', 'era': 'ancient', 'tone_category': 'ping'},
    }
    
    # 3. 识别需要从classic升级为traditional的字符
    classic_to_traditional = {
        # 从现有classic字符中选择古风韵味最深的字符升级为traditional
        '君', '梅', '兰', '竹', '菊',  # 四君子
        '智', '德', '仁', '义', '礼',  # 传统德行
        '文', '武', '诗', '书', '画',  # 文武艺术
        '雅', '茗', '禅', '静', '悟',  # 修身养性
        '清', '雨', '雪', '露', '霜',  # 自然诗意
    }
    
    # 4. 合并新增字符到现有字库
    added_count = 0
    updated_count = 0
    traditional_water_female_count = 0
    
    # 添加新的traditional字符
    for char, info in traditional_chars.items():
        if char not in chars:
            chars[char] = info
            added_count += 1
            print(f"新增字符: {char} ({info['meaning']})")
            
            # 统计传统文化水系女性字符
            if (info['wuxing'] == '水' and 
                info['gender'] == 'female' and 
                info['cultural_level'] == 'traditional'):
                traditional_water_female_count += 1
        else:
            # 如果字符已存在，只更新cultural_level为traditional（如果更合适）
            if chars[char].get('cultural_level') == 'classic' and char in classic_to_traditional:
                chars[char]['cultural_level'] = 'traditional'
                updated_count += 1
                print(f"升级字符: {char} (classic -> traditional)")
    
    # 5. 将一些现有的classic字符升级为traditional
    for char in chars:
        if (char in classic_to_traditional and 
            chars[char].get('cultural_level') == 'classic'):
            chars[char]['cultural_level'] = 'traditional'
            updated_count += 1
            print(f"升级现有字符: {char} (classic -> traditional)")
            
            # 统计传统文化水系女性字符
            if (chars[char]['wuxing'] == '水' and 
                chars[char]['gender'] == 'female' and 
                chars[char]['cultural_level'] == 'traditional'):
                traditional_water_female_count += 1
    
    # 6. 更新total_count
    data['total_count'] = len(chars)
    
    # 7. 保存更新后的数据
    with open(chars_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"\n=== 修复完成 ===")
    print(f"新增字符数量: {added_count}")
    print(f"升级字符数量: {updated_count}")
    print(f"最终字符总数: {len(chars)}")
    print(f"传统文化+水系+女性字符: {traditional_water_female_count}")
    
    return data

def verify_fix():
    """验证修复效果"""
    print("\n=== 验证修复效果 ===")
    
    data, _ = load_char_database()
    chars = data.get('chars', {})
    
    # 统计文化层次分布
    cultural_levels = {}
    for char, info in chars.items():
        level = info.get('cultural_level', '未知')
        cultural_levels[level] = cultural_levels.get(level, 0) + 1
    
    print(f"文化层次分布:")
    for level, count in cultural_levels.items():
        print(f"  {level}: {count}个")
    
    # 统计传统文化+水系+女性组合
    traditional_water_female = 0
    traditional_water_female_chars = []
    for char, info in chars.items():
        if (info.get('wuxing') == '水' and 
            info.get('gender') == 'female' and 
            info.get('cultural_level') == 'traditional'):
            traditional_water_female += 1
            traditional_water_female_chars.append(char)
    
    print(f"\n传统文化+水系+女性字符: {traditional_water_female}个")
    if traditional_water_female_chars:
        print(f"字符列表: {', '.join(traditional_water_female_chars[:10])}{'...' if len(traditional_water_female_chars) > 10 else ''}")

def main():
    """主函数"""
    print("开始修复传统文化层次标签缺失问题...")
    
    # 执行修复
    add_traditional_level()
    
    # 验证修复效果
    verify_fix()
    
    print("\n修复完成！现在用户选择'传统文化'偏好时可以找到匹配的字符了。")

if __name__ == "__main__":
    main()
