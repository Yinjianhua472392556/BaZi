# 八字小程序技术实现指南

## 开发环境准备

### 必需工具
1. **微信开发者工具** - 小程序前端开发
2. **Python 3.8+** - 后端开发
3. **VS Code** - 代码编辑器
4. **Git** - 版本控制

### 环境搭建步骤
```bash
# 1. 创建项目目录
mkdir bazi-miniprogram
cd bazi-miniprogram

# 2. 创建后端目录
mkdir backend
cd backend

# 3. 创建Python虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate     # Windows

# 4. 安装依赖
pip install fastapi uvicorn python-multipart requests
```

## 详细第三方依赖配置

### Python后端依赖清单

#### 核心框架依赖
```txt
# requirements.txt - 生产环境依赖
fastapi==0.104.1              # Web框架
uvicorn[standard]==0.24.0      # ASGI服务器
python-multipart==0.0.6       # 文件上传支持
requests==2.31.0              # HTTP客户端
pydantic==2.5.0               # 数据验证
python-dateutil==2.8.2        # 日期处理
pytz==2023.3                  # 时区处理
sqlalchemy==2.0.23            # ORM框架
alembic==1.13.1               # 数据库迁移
python-jose[cryptography]==3.3.0  # JWT处理
passlib[bcrypt]==1.7.4         # 密码加密
aiofiles==23.2.1               # 异步文件操作
redis==5.0.1                   # 缓存支持
```

#### 开发和测试依赖
```txt
# requirements-dev.txt - 开发环境依赖
pytest==7.4.3                 # 测试框架
pytest-asyncio==0.21.1        # 异步测试支持
httpx==0.25.2                 # 异步HTTP客户端
black==23.11.0                # 代码格式化
flake8==6.1.0                 # 代码检查
mypy==1.7.1                   # 类型检查
coverage==7.3.2               # 测试覆盖率
```

#### 八字计算专用开源库
```txt
# 中国传统历法计算库
zhdate==0.1                   # 农历转换（开源）
chinese-calendar==1.8.0       # 中国日历处理
lunardate==0.2.0              # 农历日期处理
sxtwl==1.1.3                  # 寿星天文历（高精度农历）
```

### 微信小程序前端依赖

#### 组件库依赖
```json
// package.json - 小程序依赖管理（通过npm方式）
{
  "dependencies": {
    "@vant/weapp": "^1.11.4",        // UI组件库
    "miniprogram-api-promise": "^1.0.4",  // API Promise化
    "weapp-cookie": "^1.1.3",        // Cookie支持
    "dayjs": "^1.11.10"              // 日期处理库
  },
  "devDependencies": {
    "miniprogram-ci": "^1.8.34",     // 小程序CI工具
    "eslint": "^8.55.0",             // 代码检查
    "prettier": "^3.1.0"             // 代码格式化
  }
}
```

#### 工具库配置
```javascript
// utils/libs.js - 工具库引入配置
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// 配置dayjs插件
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('zh-cn');
```

## 项目结构

```
bazi-miniprogram/
├── backend/                 # Python后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI主程序
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   │   ├── bazi_calculator.py  # 八字计算
│   │   │   ├── ai_service.py       # AI服务
│   │   │   └── fortune_service.py  # 运势服务
│   │   ├── utils/          # 工具函数
│   │   └── config.py       # 配置文件
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile         # Docker配置
├── miniprogram/            # 微信小程序前端
│   ├── pages/             # 页面
│   │   ├── index/         # 首页
│   │   ├── bazi/          # 八字测算
│   │   ├── yuanfen/       # 缘分测试
│   │   └── result/        # 结果展示
│   ├── components/        # 组件
│   ├── utils/            # 工具函数
│   ├── app.js
│   ├── app.json
│   └── app.wxss
└── docs/                  # 文档
    ├── bazi-requirements-document.md
    └── technical-implementation-guide.md
```

## 核心算法实现

### 1. 八字计算核心算法

#### 天干地支基础数据
```python
# services/bazi_calculator.py
class BaziCalculator:
    # 天干
    TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    
    # 地支
    DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    
    # 五行属性
    WUXING = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
        '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
        '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
        '戌': '土', '亥': '水'
    }
    
    def calculate_bazi(self, year, month, day, hour):
        """计算八字"""
        # 年柱计算
        year_gan, year_zhi = self.get_year_ganzhi(year)
        
        # 月柱计算
        month_gan, month_zhi = self.get_month_ganzhi(year, month)
        
        # 日柱计算
        day_gan, day_zhi = self.get_day_ganzhi(year, month, day)
        
        # 时柱计算
        hour_gan, hour_zhi = self.get_hour_ganzhi(day_gan, hour)
        
        return {
            'year': f"{year_gan}{year_zhi}",
            'month': f"{month_gan}{month_zhi}",
            'day': f"{day_gan}{day_zhi}",
            'hour': f"{hour_gan}{hour_zhi}",
            'wuxing': self.analyze_wuxing(year_gan, year_zhi, month_gan, month_zhi, 
                                        day_gan, day_zhi, hour_gan, hour_zhi)
        }
    
    def get_year_ganzhi(self, year):
        """计算年柱天干地支"""
        # 以1984年甲子年为基准
        base_year = 1984
        offset = (year - base_year) % 60
        gan_index = offset % 10
        zhi_index = offset % 12
        return self.TIANGAN[gan_index], self.DIZHI[zhi_index]
    
    def analyze_wuxing(self, *args):
        """分析五行分布"""
        wuxing_count = {'木': 0, '火': 0, '土': 0, '金': 0, '水': 0}
        for char in args:
            if char in self.WUXING:
                wuxing_count[self.WUXING[char]] += 1
        return wuxing_count
```

### 2. 缘分指数计算

```python
# services/yuanfen_calculator.py
class YuanfenCalculator:
    def calculate_compatibility(self, bazi1, bazi2):
        """计算两人八字匹配度"""
        score = 0
        
        # 五行互补性分析（40分）
        score += self.analyze_wuxing_compatibility(bazi1['wuxing'], bazi2['wuxing'])
        
        # 天干地支合冲分析（30分）
        score += self.analyze_ganzhi_harmony(bazi1, bazi2)
        
        # 性格互补性（30分）
        score += self.analyze_personality_match(bazi1, bazi2)
        
        return min(100, max(0, score))
    
    def analyze_wuxing_compatibility(self, wuxing1, wuxing2):
        """五行互补性分析"""
        # 五行相生关系：木生火，火生土，土生金，金生水，水生木
        sheng_relations = {
            '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
        }
        
        score = 0
        for element1, count1 in wuxing1.items():
            for element2, count2 in wuxing2.items():
                if sheng_relations.get(element1) == element2:
                    score += min(count1, count2) * 5
                elif sheng_relations.get(element2) == element1:
                    score += min(count1, count2) * 5
        
        return min(40, score)
```

### 3. AI服务集成

```python
# services/ai_service.py
import requests
import json

class AIService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    
    def generate_bazi_analysis(self, bazi_data):
        """生成个性化八字分析"""
        prompt = self.create_bazi_prompt(bazi_data)
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            "model": "qwen-turbo",
            "input": {
                "messages": [
                    {
                        "role": "system",
                        "content": "你是一个专业的八字分析师，擅长用年轻化、幽默的语言解读八字，避免迷信色彩。"
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ]
            },
            "parameters": {
                "max_tokens": 500,
                "temperature": 0.8
            }
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=data)
            result = response.json()
            return result['output']['text']
        except Exception as e:
            return "暂时无法生成个性化分析，请稍后再试～"
    
    def create_bazi_prompt(self, bazi_data):
        """创建八字分析提示词"""
        return f"""
        请为以下八字生成一段有趣的个性化分析：
        
        八字：{bazi_data['year']} {bazi_data['month']} {bazi_data['day']} {bazi_data['hour']}
        五行分布：{bazi_data['wuxing']}
        
        要求：
        1. 语言风格年轻化、幽默风趣
        2. 长度控制在150字以内
        3. 重点分析性格特点和优势
        4. 避免负面预测，保持积极正面
        5. 添加"仅供娱乐参考"的提示
        """
```

## 微信小程序前端实现

### 1. 首页设计

```javascript
// pages/index/index.js
Page({
  data: {
    features: [
      { name: '八字排盘', icon: 'bazi', path: '/pages/bazi/bazi' },
      { name: '缘分测试', icon: 'heart', path: '/pages/yuanfen/yuanfen' },
      { name: '今日最旺', icon: 'star', path: '/pages/fortune/fortune' }
    ]
  },

  onLoad() {
    // 加载今日最旺星座
    this.loadTodayFortune();
  },

  navigateToFeature(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path
    });
  },

  loadTodayFortune() {
    wx.request({
      url: 'https://your-api.com/api/today-fortune',
      success: (res) => {
        this.setData({
          todayFortune: res.data
        });
      }
    });
  }
});
```

### 2. 八字测算页面

```javascript
// pages/bazi/bazi.js
Page({
  data: {
    birthDate: '',
    birthTime: '',
    gender: 1,
    result: null,
    loading: false
  },

  onDateChange(e) {
    this.setData({
      birthDate: e.detail.value
    });
  },

  onTimeChange(e) {
    this.setData({
      birthTime: e.detail.value
    });
  },

  calculateBazi() {
    if (!this.data.birthDate || !this.data.birthTime) {
      wx.showToast({
        title: '请选择完整的出生时间',
