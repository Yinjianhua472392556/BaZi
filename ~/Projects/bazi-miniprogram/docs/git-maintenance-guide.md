# Git版本管理维护指南

## 🎯 概述
本文档提供了完整的Git版本管理维护指南，帮助团队成员正确使用Git，避免常见问题，并保持仓库健康。

## 📋 目录
- [快速开始](#快速开始)
- [预防措施](#预防措施)
- [维护工具](#维护工具)
- [最佳实践](#最佳实践)
- [问题排查](#问题排查)

## 🚀 快速开始

### 1. 环境设置
```bash
# 确保.gitignore文件存在且正确配置
git status
git check-ignore venv/
git check-ignore __pycache__/
```

### 2. 定期清理
```bash
# 运行清理脚本
./scripts/git-cleanup.sh

# 或手动清理
find . -name "__pycache__" -type d -exec rm -rf {} +
find . -name "*.pyc" -delete
```

## 🛡️ 预防措施

### Git预提交钩子
项目已配置预提交钩子，自动阻止提交以下文件：
- Python缓存文件 (*.pyc, *.pyo, __pycache__/)
- 虚拟环境 (venv/, .venv/, env/, .env/)
- 系统文件 (.DS_Store, Thumbs.db)
- 临时文件 (*.log, *.tmp, *.swp)
- 大文件 (>10MB)

### .gitignore配置
确保以下内容在.gitignore中：
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
.venv/
env/
.env/
ENV/
env.bak/
venv.bak/

# System Files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
*.log
logs/

# Temporary files
*.tmp
*.swp
*~
```

## 🔧 维护工具

### 1. Git清理脚本 (`scripts/git-cleanup.sh`)
定期运行以保持仓库清洁：
```bash
./scripts/git-cleanup.sh
```

功能：
- 清理Python缓存文件
- 清理系统文件
- 检查大文件
- 验证.gitignore规则
- 显示仓库状态统计

### 2. 预提交钩子 (`.git/hooks/pre-commit`)
自动在每次提交前运行，防止误提交不必要的文件。

如需绕过检查（仅在特殊情况下）：
```bash
git commit --no-verify -m "特殊提交消息"
```

## 📚 最佳实践

### 提交规范
1. **提交前检查**
   ```bash
   git status
   git diff --cached
   ```

2. **有意义的提交消息**
   ```bash
   git commit -m "功能: 添加生肖配对算法"
   git commit -m "修复: 解决农历转换bug"
   git commit -m "优化: 提升八字计算性能"
   ```

3. **分批提交**
   - 一次提交只做一件事
   - 避免混合功能修改和bug修复

### 分支管理
1. **主分支保护**
   - main分支保持稳定
   - 通过Pull Request合并代码

2. **功能分支**
   ```bash
   git checkout -b feature/新功能名称
   git checkout -b bugfix/bug描述
   ```

### 文件管理
1. **虚拟环境**
   - 使用`python -m venv venv`创建
   - 绝不提交venv目录
   - 提交requirements.txt

2. **配置文件**
   - 提交示例配置文件
   - 使用环境变量存储敏感信息

## 🔍 问题排查

### 常见问题

#### 1. 误提交了缓存文件
```bash
# 从暂存区移除
git reset HEAD __pycache__/
git reset HEAD *.pyc

# 从版本历史中彻底删除
git filter-branch --tree-filter 'rm -rf __pycache__' HEAD
```

#### 2. 误提交了虚拟环境
```bash
# 从Git跟踪中移除但保留本地文件
git rm -r --cached venv/
echo "venv/" >> .gitignore
git add .gitignore
git commit -m "移除venv目录跟踪"
```

#### 3. 仓库体积过大
```bash
# 查看大文件
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -10

# 清理历史
git gc --aggressive --prune=now
```

### 检查命令

#### 仓库健康检查
```bash
# 检查仓库完整性
git fsck --full

# 查看仓库大小
du -sh .git/

# 统计文件类型
find . -name "*.py" | wc -l
find . -name "*.js" | wc -l
find . -name "*.json" | wc -l
```

#### 提交历史分析
```bash
# 查看最近提交
git log --oneline -10

# 查看文件修改历史
git log --follow filename

# 查看提交统计
git shortlog -sn
```

## ⚠️ 紧急情况处理

### 1. 重置到上一个提交
```bash
git reset --hard HEAD~1
```

### 2. 撤销已推送的提交
```bash
git revert HEAD
git push origin main
```

### 3. 强制清理（谨慎使用）
```bash
# 警告：这会删除所有未提交的更改
git clean -fd
git reset --hard HEAD
```

## 📞 支持

如遇到Git相关问题：
1. 首先运行 `./scripts/git-cleanup.sh` 检查状态
2. 查看本文档的问题排查部分
3. 联系项目维护者

---

**记住：预防胜于治疗。定期维护和正确的工作流程能避免大部分Git问题。**
