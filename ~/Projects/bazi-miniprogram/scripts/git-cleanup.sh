#!/bin/bash

# Git版本管理清理和规范化脚本
# 用于定期清理不必要文件并维护仓库健康

set -e

echo "🧹 开始Git仓库清理和规范化..."

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：当前目录不是git仓库"
    exit 1
fi

# 清理本地缓存文件
echo "📁 清理Python缓存文件..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true

# 清理系统文件
echo "🗂️ 清理系统文件..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

# 检查是否有误提交的大文件
echo "📊 检查大文件..."
large_files=$(find . -size +10M -not -path "./.git/*" -not -path "./venv/*" 2>/dev/null || true)
if [ ! -z "$large_files" ]; then
    echo "⚠️ 发现大文件:"
    echo "$large_files"
    echo "请考虑将大文件添加到.gitignore或使用Git LFS"
fi

# 检查.gitignore覆盖情况
echo "🔍 检查.gitignore规则..."
if [ -f .gitignore ]; then
    echo "✅ .gitignore文件存在"
    
    # 检查常见忽略项目
    missing_patterns=()
    
    if ! grep -q "__pycache__" .gitignore; then
        missing_patterns+=("__pycache__/")
    fi
    
    if ! grep -q "venv/" .gitignore; then
        missing_patterns+=("venv/")
    fi
    
    if ! grep -q ".DS_Store" .gitignore; then
        missing_patterns+=(".DS_Store")
    fi
    
    if [ ${#missing_patterns[@]} -gt 0 ]; then
        echo "⚠️ .gitignore缺少以下规则:"
        printf '%s\n' "${missing_patterns[@]}"
    fi
else
    echo "❌ 缺少.gitignore文件"
fi

# 显示仓库状态
echo "📈 仓库状态统计:"
echo "总文件数: $(git ls-files | wc -l)"
echo "未跟踪文件数: $(git status --porcelain | grep '^??' | wc -l)"
echo "已修改文件数: $(git status --porcelain | grep '^ M' | wc -l)"

# 检查未跟踪的缓存文件
untracked_cache=$(git status --porcelain | grep '^??' | grep -E "(__pycache__|\.pyc|\.pyo|venv/)" || true)
if [ ! -z "$untracked_cache" ]; then
    echo "⚠️ 发现未跟踪的缓存文件:"
    echo "$untracked_cache"
fi

echo "✅ Git仓库清理完成!"
