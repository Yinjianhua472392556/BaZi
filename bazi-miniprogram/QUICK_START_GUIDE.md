# 八字起名小程序快速启动指南

## 系统状态
✅ **项目已成功部署并运行**
- 后端API服务：http://localhost:8001
- 核心功能：八字计算、智能起名、生肖配对、传统节日
- 数据库：102个字符的扩展字库，12个语义分类

## 快速启动步骤

### 1. 启动后端服务
```bash
cd bazi-miniprogram
python3 main.py
```

### 2. 访问应用
- 浏览器访问：http://localhost:8001
- 或直接在微信开发者工具中导入miniprogram目录

### 3. 主要功能测试

#### 起名功能测试
```bash
curl -X POST "http://localhost:8001/api/v1/naming/generate-names" \
  -H "Content-Type: application/json" \
  -d '{
    "surname": "李",
    "gender": "male",
    "birth_year": 2000,
    "birth_month": 6,
    "birth_day": 15,
    "birth_hour": 10,
    "calendar_type": "solar",
    "name_length": 2,
    "count": 5
  }'
```

#### 八字计算测试
```bash
curl -X POST "http://localhost:8001/api/v1/bazi/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2000,
    "month": 6,
    "day": 15,
    "hour": 10,
    "gender": "male",
    "calendar_type": "solar"
  }'
```

## 核心功能说明

### 🎯 智能起名系统
- **八字分析**：自动计算五行强弱、喜用神
- **字库筛选**：根据五行需求智能筛选汉字
- **评分体系**：五格数理30% + 五行匹配30% + 三才配置20% + 音韵10% + 寓意10%
- **去重优化**：确保推荐名字的唯一性和多样性

### 🔄 算法优化成果
1. **扩展字库**：从50个增加到102个字符
2. **去重机制**：优化组合算法，避免重复推荐
3. **评分保障**：确保40%的推荐名字达到90+分
4. **错误修复**：修复数据类型不一致问题

### 📊 系统性能
- **字库规模**：102个高质量汉字
- **语义分类**：12个专业标签体系
- **搜索索引**：193个关键词快速检索
- **推荐质量**：90+分名字占比≥40%

## 技术架构

### 后端服务 (FastAPI)
- **地址**：http://localhost:8001
- **文档**：http://localhost:8001/docs
- **主要模块**：
  - `/api/v1/bazi/` - 八字计算
  - `/api/v1/naming/` - 智能起名
  - `/api/v1/zodiac/` - 生肖配对
  - `/api/v1/festival/` - 传统节日

### 前端小程序
- **框架**：微信小程序原生开发
- **主要页面**：
  - `pages/index/` - 八字排盘
  - `pages/naming/` - 智能起名
  - `pages/zodiac-matching/` - 生肖配对
  - `pages/festival/` - 传统节日

### 数据库
- **字库**：`backend/data/chars/`
- **节日数据**：`miniprogram/utils/authoritative-festival-data.js`
- **配置文件**：`backend/data/chars/chars_meaning_tags.json`

## 故障排除

### 常见问题
1. **端口占用**：如果8001端口被占用，修改main.py中的端口号
2. **依赖缺失**：运行`pip install -r requirements.txt`安装依赖
3. **字库加载失败**：检查`backend/data/chars/`目录权限

### 日志监控
- 启动时会显示各模块加载状态
- API调用日志实时显示在终端
- 错误信息会包含具体模块和原因

## 部署说明

### 开发环境
- Python 3.7+
- FastAPI + Uvicorn
- 微信开发者工具

### 生产环境部署
详见：`deployment/DEPLOYMENT_COMPLETE_GUIDE.md`

## 项目特色

### 🎨 传统文化融合
- 基于正宗五行理论
- 融入81数理姓名学
- 三才五格科学配置

### 🔬 现代算法优化
- 智能去重机制
- 个性化推荐引擎
- 多维度评分体系

### 📱 用户体验优化
- 简洁直观的界面
- 快速响应的API
- 详细的寓意解释

---

**项目状态**：✅ 已完成优化部署，所有核心功能正常运行
**启动时间**：2025年10月9日 17:28
**版本**：v2.0 优化版
