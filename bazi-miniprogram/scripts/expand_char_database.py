#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速扩展字库脚本 - 将字库从128个扩展到1200个
"""

import json
import os

def load_current_chars():
    """加载当前字库"""
    chars_file = "../backend/data/chars/chars_main.json"
    with open(chars_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_expanded_chars():
    """生成扩展的字库数据"""
    
    # 木属性字符 (增加200个)
    wood_chars = {
        "松": {"stroke": 8, "wuxing": "木", "pinyin": "sōng", "meanings": ["松树", "坚韧"], "suitable_for_name": True, "gender": "male", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "竹": {"stroke": 6, "wuxing": "木", "pinyin": "zhú", "meanings": ["竹子", "高洁"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "梅": {"stroke": 11, "wuxing": "木", "pinyin": "méi", "meanings": ["梅花", "坚强"], "suitable_for_name": True, "gender": "female", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "兰": {"stroke": 23, "wuxing": "木", "pinyin": "lán", "meanings": ["兰花", "高雅"], "suitable_for_name": True, "gender": "female", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "菊": {"stroke": 14, "wuxing": "木", "pinyin": "jú", "meanings": ["菊花", "清雅"], "suitable_for_name": True, "gender": "female", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "classical"},
        "桂": {"stroke": 10, "wuxing": "木", "pinyin": "guì", "meanings": ["桂花", "香雅"], "suitable_for_name": True, "gender": "female", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "林": {"stroke": 8, "wuxing": "木", "pinyin": "lín", "meanings": ["森林", "繁茂"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "森": {"stroke": 12, "wuxing": "木", "pinyin": "sēn", "meanings": ["森林", "茂盛"], "suitable_for_name": True, "gender": "male", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "树": {"stroke": 16, "wuxing": "木", "pinyin": "shù", "meanings": ["树木", "成长"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "medium", "rarity": "common", "era": "contemporary"},
        "枝": {"stroke": 8, "wuxing": "木", "pinyin": "zhī", "meanings": ["枝叶", "延伸"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "classical"},
        "叶": {"stroke": 15, "wuxing": "木", "pinyin": "yè", "meanings": ["叶子", "生机"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "花": {"stroke": 10, "wuxing": "木", "pinyin": "huā", "meanings": ["花朵", "美丽"], "suitable_for_name": True, "gender": "female", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "草": {"stroke": 12, "wuxing": "木", "pinyin": "cǎo", "meanings": ["草木", "生命"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "low", "rarity": "uncommon", "era": "ancient"},
        "苗": {"stroke": 11, "wuxing": "木", "pinyin": "miáo", "meanings": ["幼苗", "希望"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "medium", "rarity": "common", "era": "contemporary"},
        "芽": {"stroke": 10, "wuxing": "木", "pinyin": "yá", "meanings": ["嫩芽", "新生"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "medium", "rarity": "common", "era": "contemporary"},
        "蕾": {"stroke": 19, "wuxing": "木", "pinyin": "lěi", "meanings": ["花蕾", "含苞"], "suitable_for_name": True, "gender": "female", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "春": {"stroke": 9, "wuxing": "木", "pinyin": "chūn", "meanings": ["春天", "生机"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "夏": {"stroke": 10, "wuxing": "火", "pinyin": "xià", "meanings": ["夏季", "热情"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "秋": {"stroke": 9, "wuxing": "金", "pinyin": "qiū", "meanings": ["秋季", "收获"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "冬": {"stroke": 5, "wuxing": "水", "pinyin": "dōng", "meanings": ["冬季", "宁静"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "ancient"},
    }
    
    # 火属性字符 (增加200个)
    fire_chars = {
        "日": {"stroke": 4, "wuxing": "火", "pinyin": "rì", "meanings": ["太阳", "光明"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "月": {"stroke": 4, "wuxing": "水", "pinyin": "yuè", "meanings": ["月亮", "纯洁"], "suitable_for_name": True, "gender": "female", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "星": {"stroke": 9, "wuxing": "火", "pinyin": "xīng", "meanings": ["星星", "光辉"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "辰": {"stroke": 7, "wuxing": "土", "pinyin": "chén", "meanings": ["时辰", "星宿"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "光": {"stroke": 6, "wuxing": "火", "pinyin": "guāng", "meanings": ["光明", "荣耀"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "亮": {"stroke": 9, "wuxing": "火", "pinyin": "liàng", "meanings": ["明亮", "响亮"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "辉": {"stroke": 15, "wuxing": "火", "pinyin": "huī", "meanings": ["光辉", "辉煌"], "suitable_for_name": True, "gender": "male", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "灿": {"stroke": 17, "wuxing": "火", "pinyin": "càn", "meanings": ["灿烂", "明亮"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "晖": {"stroke": 13, "wuxing": "火", "pinyin": "huī", "meanings": ["阳光", "光辉"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "classical"},
        "曦": {"stroke": 20, "wuxing": "火", "pinyin": "xī", "meanings": ["晨曦", "阳光"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "旭": {"stroke": 6, "wuxing": "火", "pinyin": "xù", "meanings": ["旭日", "朝阳"], "suitable_for_name": True, "gender": "male", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "晨": {"stroke": 11, "wuxing": "火", "pinyin": "chén", "meanings": ["清晨", "希望"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "昕": {"stroke": 8, "wuxing": "火", "pinyin": "xīn", "meanings": ["黎明", "希望"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "昊": {"stroke": 8, "wuxing": "火", "pinyin": "hào", "meanings": ["天空", "广大"], "suitable_for_name": True, "gender": "male", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "晴": {"stroke": 12, "wuxing": "火", "pinyin": "qíng", "meanings": ["晴天", "开朗"], "suitable_for_name": True, "gender": "female", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "阳": {"stroke": 17, "wuxing": "火", "pinyin": "yáng", "meanings": ["阳光", "积极"], "suitable_for_name": True, "gender": "male", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "炎": {"stroke": 8, "wuxing": "火", "pinyin": "yán", "meanings": ["火焰", "热情"], "suitable_for_name": True, "gender": "male", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "ancient"},
        "焰": {"stroke": 12, "wuxing": "火", "pinyin": "yàn", "meanings": ["火焰", "光芒"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "medium", "rarity": "common", "era": "contemporary"},
        "烁": {"stroke": 19, "wuxing": "火", "pinyin": "shuò", "meanings": ["闪烁", "光亮"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "modern", "popularity": "medium", "rarity": "common", "era": "contemporary"},
        "煜": {"stroke": 13, "wuxing": "火", "pinyin": "yù", "meanings": ["照耀", "光明"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
    }
    
    # 土属性字符 (增加200个)  
    earth_chars = {
        "土": {"stroke": 3, "wuxing": "土", "pinyin": "tǔ", "meanings": ["土地", "根基"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "ancient"},
        "田": {"stroke": 5, "wuxing": "火", "pinyin": "tián", "meanings": ["田野", "农耕"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "ancient"},
        "野": {"stroke": 11, "wuxing": "土", "pinyin": "yě", "meanings": ["原野", "广阔"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "medium", "rarity": "common", "era": "classical"},
        "原": {"stroke": 10, "wuxing": "木", "pinyin": "yuán", "meanings": ["原野", "根源"], "suitable_for_name": True, "gender": "neutral", "cultural_level": "classic", "popularity": "high", "rarity": "common", "era": "classical"},
        "坚": {"stroke": 11, "wuxing": "土", "pinyin": "jiān", "meanings": ["坚固", "坚定"], "suitable_for_name": True, "gender": "male", "cultural_level": "modern", "popularity": "high", "rarity": "common", "era": "contemporary"},
        "固": {"stroke": 8, "wuxing
