# 起名功能详细设计文档

## 1. 项目概述

### 1.1 功能描述
在现有八字小程序中新增起名功能，基于用户的八字信息提供专业的起名建议。功能将集成传统五行理论、姓名学原理和现代UI设计。

### 1.2 技术架构
- **前端**：微信小程序页面
- **后端**：FastAPI + Python算法
- **数据**：汉字库 + 姓名学规则库
- **集成**：与现有八字计算系统无缝对接

## 2. UI界面设计

### 2.1 页面布局结构
```
起名页面 (pages/naming/naming)
├── 页面头部 (统一样式)
├── 基础信息区域
│   ├── 姓氏输入
│   ├── 性别选择  
│   ├── 出生信息 (继承八字页面)
│   └── 起名偏好设置
├── 生成名字按钮
├── 结果展示区域
│   ├── 推荐名字列表
│   ├── 详细分析
│   └── 五行评分
└── 免责声明
```

### 2.2 样式规范
- **主题色**：继承现有金色主题 (#C8860D)
- **背景**：渐变背景 (E8F5E8 → F0F8FF → FFF8DC)
- **卡片**：白色圆角卡片，阴影效果
- **按钮**：金色渐变，圆角设计
- **字体**：微信默认字体，层次化字号

### 2.3 交互设计
1. **输入流程**：姓氏 → 性别 → 偏好设置 → 生成
2. **结果展示**：列表式推荐 + 点击查看详情
3. **反馈机制**：加载状态 + 错误提示 + 成功反馈

## 3. 后端算法设计

### 3.1 核心算法模块

#### 3.1.1 五行分析引擎
```python
class WuxingAnalyzer:
    """五行分析器"""
    
    def analyze_bazi_wuxing(self, bazi_info):
        """分析八字五行强弱"""
        # 计算五行得分
        # 确定喜用神
        # 分析缺失五行
        return wuxing_analysis
    
    def calculate_xiyongshen(self, wuxing_scores):
        """计算喜用神"""
        # 算法逻辑
        pass
```

#### 3.1.2 姓名学计算引擎
```python
class NameologyCalculator:
    """姓名学计算器"""
    
    def calculate_sancai_wuge(self, surname, given_name):
        """三才五格计算"""
        # 天格、人格、地格、外格、总格
        return sancai_wuge_result
    
    def evaluate_81_mathematics(self, grid_number):
        """81数理吉凶判断"""
        return luck_evaluation
```

#### 3.1.3 汉字库管理器
```python
class ChineseCharDatabase:
    """汉字库管理"""
    
    def get_chars_by_wuxing(self, wuxing, stroke_range):
        """按五行获取汉字"""
        return filtered_chars
    
    def get_char_properties(self, char):
        """获取汉字属性"""
        return {
            'stroke': 笔画数,
            'wuxing': 五行属性,
            'pinyin': 拼音,
            'meaning': 寓意,
            'frequency': 使用频率
        }
```

#### 3.1.4 名字生成引擎
```python
class NameGenerator:
    """名字生成器"""
    
    def generate_names(self, surname, preferences, wuxing_analysis):
        """智能生成名字"""
        # 1. 根据喜用神筛选汉字
        # 2. 计算三才五格
        # 3. 评估音韵和谐
        # 4. 综合评分排序
        return recommended_names
```

### 3.2 算法流程
```
用户输入 → 八字分析 → 五行计算 → 喜用神确定 
    ↓
汉字筛选 → 组合生成 → 姓名学评估 → 综合评分 
    ↓
结果排序 → 返回推荐 → 详细解析
```

## 4. 数据库设计

### 4.1 汉字基础表 (chinese_chars)
```sql
CREATE TABLE chinese_chars (
    id INTEGER PRIMARY KEY,
    char VARCHAR(1) NOT NULL,
    traditional VARCHAR(1),
    pinyin VARCHAR(10),
    stroke_count INTEGER,
    wuxing ENUM('金','木','水','火','土'),
    meaning TEXT,
    frequency_score INTEGER,
    suitable_for_name BOOLEAN,
    gender_preference ENUM('male','female','neutral'),
    created_at TIMESTAMP
);
```

### 4.2 姓氏表 (surnames)
```sql
CREATE TABLE surnames (
    id INTEGER PRIMARY KEY,
    surname VARCHAR(5) NOT NULL,
    stroke_count INTEGER,
    wuxing VARCHAR(10),
    frequency INTEGER,
    pronunciation_notes TEXT
);
```

### 4.3 数理吉凶表 (mathematics_luck)
```sql
CREATE TABLE mathematics_luck (
    number INTEGER PRIMARY KEY,
    luck_level ENUM('大吉','吉','半吉','凶','大凶'),
    description TEXT,
    detailed_explanation TEXT
);
```

### 4.4 三才配置表 (sancai_combinations)
```sql
CREATE TABLE sancai_combinations (
    id INTEGER PRIMARY KEY,
    tiange_wuxing VARCHAR(2),
    renge_wuxing VARCHAR(2), 
    dige_wuxing VARCHAR(2),
    luck_evaluation VARCHAR(10),
    explanation TEXT
);
```

## 5. API接口设计

### 5.1 起名分析接口
```python
@app.post("/api/v1/naming/analyze-profile")
async def analyze_naming_profile(request: NamingRequest):
    """分析起名档案"""
    # 输入：姓氏、性别、出生信息、偏好
    # 输出：八字分析、五行分析、喜用神
```

### 5.2 生成名字接口
```python
@app.post("/api/v1/naming/generate-names")
async def generate_names(request: GenerateNamesRequest):
    """生成推荐名字"""
    # 输入：分析结果、生成数量
    # 输出：推荐名字列表（含评分）
```

### 5.3 名字评估接口
```python
@app.post("/api/v1/naming/evaluate-name")
async def evaluate_specific_name(request: EvaluateNameRequest):
    """评估指定名字"""
    # 输入：完整姓名、出生信息
    # 输出：详细分析报告
```

### 5.4 数据结构定义
```python
class NamingRequest(BaseModel):
    surname: str
    gender: str
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int = 12
    calendar_type: str = "solar"
    name_length: int = 2  # 单名或双名
    wuxing_preference: Optional[List[str]] = None

class NameRecommendation(BaseModel):
    full_name: str
    given_name: str
    overall_score: float
    wuxing_analysis: dict
    sancai_wuge: dict
    meaning_explanation: str
    pronunciation: str
```

## 6. 前端页面设计

### 6.1 页面文件结构
```
pages/naming/
├── naming.js      # 页面逻辑
├── naming.json    # 页面配置
├── naming.wxml    # 页面结构
└── naming.wxss    # 页面样式
```

### 6.2 页面状态管理
```javascript
data: {
  // 用户输入
  surname: '',
  gender: 'male',
  nameLength: 2,
  wuxingPreference: [],
  
  // 分析结果
  baziAnalysis: null,
  wuxingAnalysis: null,
  
  // 推荐结果
  recommendedNames: [],
  selectedName: null,
  
  // UI状态
  analyzing: false,
  generating: false,
  showResults: false
}
```

### 6.3 关键功能函数
```javascript
// 分析用户档案
analyzeProfile() {
  // 调用后端分析接口
  // 更新分析结果
}

// 生成推荐名字
generateNames() {
  // 基于分析结果生成名字
  // 展示推荐列表
}

// 查看名字详情
viewNameDetail(name) {
  // 显示详细分析
  // 包含五行、寓意、评分等
}
```

## 7. 系统集成方案

### 7.1 Tab导航集成
```json
// app.json 更新
"tabBar": {
  "list": [
    {"pagePath": "pages/index/index", "text": "八字测算"},
    {"pagePath": "pages/naming/naming", "text": "智能起名"},
    {"pagePath": "pages/festival/festival", "text": "节日列表"},
    {"pagePath": "pages/zodiac-matching/zodiac-matching", "text": "生肖配对"},
    {"pagePath": "pages/profile/profile", "text": "个人中心"}
  ]
}
```

### 7.2 数据共享机制
- 复用八字计算结果
- 共享出生信息
- 统一用户偏好设置

### 7.3 图标资源
- 生成naming_normal.png
- 生成naming_selected.png
- 保持与现有图标风格一致

## 8. 测试方案

### 8.1 单元测试
- 五行分析算法测试
- 姓名学计算测试
- 汉字库查询测试

### 8.2 集成测试
- API接口测试
- 前后端数据流测试
- 用户交互流程测试

### 8.3 性能测试
- 名字生成速度测试
- 大量请求并发测试
- 内存使用优化测试

## 9. 部署和维护

### 9.1 后端部署
- 更新FastAPI应用
- 导入汉字库数据
- 配置新增API路由

### 9.2 前端发布
- 小程序版本更新
- 新页面发布
- Tab导航更新

### 9.3 数据维护
- 汉字库定期更新
- 算法参数调优
- 用户反馈收集

## 10. 开发时间估算

- **设计文档完善**：已完成
- **后端算法开发**：3-4天
- **前端页面开发**：2-3天  
- **集成测试调试**：1-2天
- **总计**：6-9天

## 11. 风险评估和对策

### 11.1 技术风险
- **算法复杂度**：分阶段实现，先实现核心功能
- **性能问题**：优化数据库查询，添加缓存机制
- **兼容性**：充分测试不同设备和系统版本

### 11.2 业务风险
- **准确性要求**：添加免责声明，强调娱乐性质
- **用户体验**：提供清晰的操作指导和结果解释
- **数据安全**：不存储敏感个人信息

---

本文档将作为起名功能开发的完整技术指南，确保实施过程中的一致性和质量。
