#!/bin/bash
# ===============================================
# 八字运势小程序 - 一键部署脚本
# ===============================================
# 
# 这个脚本将引导你完成完整的部署流程：
# 1. 服务器部署
# 2. 小程序配置
# 3. 生成操作指南
#
# 使用方法：bash one_click_deploy.sh
#
# ===============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ===============================================
# 输出函数
# ===============================================
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

show_header() {
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "              八字运势小程序 - 一键部署向导"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    echo ""
    echo "🚀 本脚本将帮助你完成："
    echo "   1. 服务器环境部署和配置"
    echo "   2. 小程序发布准备"
    echo "   3. 详细操作指南生成"
    echo ""
    echo "⏱️  预计总时间：30-45分钟"
    echo "💰 预计成本：~100元/月"
    echo ""
}

# ===============================================
# 检查前置条件
# ===============================================
check_prerequisites() {
    log "🔍 检查前置条件..."
    
    local missing_tools=()
    
    # 检查必要工具
    for tool in git curl ssh node npm; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=($tool)
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少必要工具: ${missing_tools[*]}"
        log_error "请先安装这些工具后重试"
        return 1
    fi
    
    # 检查文件
    if [[ ! -f "$SCRIPT_DIR/deploy_config.sh" ]]; then
        log_error "找不到配置文件: deploy_config.sh"
        return 1
    fi
    
    if [[ ! -f "$SCRIPT_DIR/auto_deploy.sh" ]]; then
        log_error "找不到部署脚本: auto_deploy.sh"
        return 1
    fi
    
    if [[ ! -f "$SCRIPT_DIR/miniprogram_config.js" ]]; then
        log_error "找不到小程序配置: miniprogram_config.js"
        return 1
    fi
    
    log "✅ 前置条件检查通过"
    return 0
}

# ===============================================
# 引导用户配置
# ===============================================
guide_configuration() {
    log "📝 配置向导..."
    
    echo ""
    echo -e "${YELLOW}📋 请准备以下信息：${NC}"
    echo "   1. 阿里云服务器IP地址"
    echo "   2. 域名（如：example.com）"
    echo "   3. 邮箱地址（用于SSL证书）"
    echo "   4. 微信小程序AppID"
    echo "   5. 微信账号邮箱"
    echo ""
    
    read -p "是否已经准备好这些信息？(y/n): " ready
    if [[ ! "$ready" =~ ^[Yy]$ ]]; then
        echo ""
        log_warn "请准备好必要信息后再运行此脚本"
        echo ""
        echo "📖 详细准备清单请查看: DEPLOYMENT_COMPLETE_GUIDE.md"
        exit 0
    fi
    
    echo ""
    log "请选择部署模式："
    echo "   1. 完整部署（服务器 + 小程序）"
    echo "   2. 仅服务器部署"
    echo "   3. 仅小程序配置"
    echo ""
    
    read -p "请选择 (1-3): " deploy_mode
    
    case $deploy_mode in
        1) DEPLOY_MODE="full" ;;
        2) DEPLOY_MODE="server_only" ;;
        3) DEPLOY_MODE="miniprogram_only" ;;
        *) 
            log_error "无效选择，默认使用完整部署模式"
            DEPLOY_MODE="full"
            ;;
    esac
    
    log "✅ 已选择部署模式: $DEPLOY_MODE"
}

# ===============================================
# 配置验证和引导
# ===============================================
validate_and_guide_config() {
    log "🔧 验证配置文件..."
    
    # 检查服务器配置
    if [[ "$DEPLOY_MODE" == "full" || "$DEPLOY_MODE" == "server_only" ]]; then
        echo ""
        log_info "检查服务器部署配置..."
        
        if bash "$SCRIPT_DIR/deploy_config.sh"; then
            log "✅ 服务器配置验证通过"
        else
            log_error "服务器配置验证失败"
            echo ""
            log_warn "请编辑 deploy_config.sh 文件，填入正确的配置："
            echo "   vim $SCRIPT_DIR/deploy_config.sh"
            echo ""
            echo "主要配置项："
            echo "   - SERVER_IP: 你的服务器IP地址"
            echo "   - DOMAIN_NAME: 你的域名"
            echo "   - API_SUBDOMAIN: API子域名"
            echo "   - SSL_EMAIL: 你的邮箱地址"
            echo ""
            return 1
        fi
    fi
    
    # 检查小程序配置
    if [[ "$DEPLOY_MODE" == "full" || "$DEPLOY_MODE" == "miniprogram_only" ]]; then
        echo ""
        log_info "检查小程序配置..."
        
        if node "$SCRIPT_DIR/miniprogram_config.js"; then
            log "✅ 小程序配置验证通过"
        else
            log_error "小程序配置验证失败"
            echo ""
            log_warn "请编辑 miniprogram_config.js 文件，填入正确的配置："
            echo "   vim $SCRIPT_DIR/miniprogram_config.js"
            echo ""
            echo "主要配置项："
            echo "   - appId: 小程序AppID"
            echo "   - production.apiDomain: API域名"
            echo "   - wechat.account: 微信账号邮箱"
            echo ""
            return 1
        fi
    fi
    
    return 0
}

# ===============================================
# 执行服务器部署
# ===============================================
deploy_server() {
    if [[ "$DEPLOY_MODE" != "full" && "$DEPLOY_MODE" != "server_only" ]]; then
        return 0
    fi
    
    echo ""
    log "🚀 开始服务器部署..."
    echo ""
    
    # 显示部署概要
    source "$SCRIPT_DIR/deploy_config.sh"
    echo -e "${CYAN}📋 部署概要：${NC}"
    echo "   服务器IP: $SERVER_IP"
    echo "   API域名: $API_SUBDOMAIN"
    echo "   SSL邮箱: $SSL_EMAIL"
    echo ""
    
    read -p "确认开始服务器部署？(y/n): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_warn "跳过服务器部署"
        return 0
    fi
    
    # 执行部署
    if bash "$SCRIPT_DIR/auto_deploy.sh"; then
        log "✅ 服务器部署成功完成！"
        
        echo ""
        echo -e "${GREEN}🎉 服务器部署完成！${NC}"
        echo "   API地址: https://$API_SUBDOMAIN"
        echo "   健康检查: https://$API_SUBDOMAIN/health"
        echo ""
        
        # 快速验证
        log_info "正在验证API服务..."
        if curl -f -s "https://$API_SUBDOMAIN/health" >/dev/null; then
            log "✅ API服务验证成功"
        else
            log_warn "⚠️ API服务验证失败，请稍后手动检查"
        fi
        
        return 0
    else
        log_error "服务器部署失败"
        echo ""
        log_info "请检查部署日志："
        echo "   cat $SCRIPT_DIR/deploy_*.log"
        return 1
    fi
}

# ===============================================
# 配置小程序
# ===============================================
configure_miniprogram() {
    if [[ "$DEPLOY_MODE" != "full" && "$DEPLOY_MODE" != "miniprogram_only" ]]; then
        return 0
    fi
    
    echo ""
    log "📱 开始小程序配置..."
    
    # 运行小程序准备脚本
    if node "$SCRIPT_DIR/prepare_miniprogram.js" production; then
        log "✅ 小程序配置完成！"
        
        echo ""
        echo -e "${GREEN}🎉 小程序准备完成！${NC}"
        echo ""
        echo "📋 接下来的步骤："
        echo "   1. 打开微信开发者工具"
        echo "   2. 导入 miniprogram 目录"
        echo "   3. 编译并上传代码"
        echo "   4. 在微信公众平台配置域名"
        echo "   5. 提交审核"
        echo ""
        
        return 0
    else
        log_error "小程序配置失败"
        return 1
    fi
}

# ===============================================
# 生成最终报告
# ===============================================
generate_final_report() {
    log "📝 生成部署报告..."
    
    local report_file="$SCRIPT_DIR/deployment_summary_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# 八字运势小程序 - 部署完成报告

## 📊 部署摘要

**部署时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**部署模式**: $DEPLOY_MODE  
**操作系统**: $(uname -s)  

## 🎯 完成状态

EOF
    
    if [[ "$DEPLOY_MODE" == "full" || "$DEPLOY_MODE" == "server_only" ]]; then
        source "$SCRIPT_DIR/deploy_config.sh" 2>/dev/null || true
        cat >> "$report_file" << EOF
### 服务器部署 ✅

- **服务器IP**: $SERVER_IP
- **API域名**: $API_SUBDOMAIN  
- **SSL证书**: 已配置
- **服务状态**: 运行中

**快速测试**:
\`\`\`bash
curl https://$API_SUBDOMAIN/health
\`\`\`

EOF
    fi
    
    if [[ "$DEPLOY_MODE" == "full" || "$DEPLOY_MODE" == "miniprogram_only" ]]; then
        cat >> "$report_file" << EOF
### 小程序配置 ✅

- **配置文件**: 已更新
- **环境**: 生产环境
- **版本信息**: 已生成

**下一步操作**:
1. 微信开发者工具上传代码
2. 微信公众平台配置域名
3. 提交审核

EOF
    fi
    
    cat >> "$report_file" << EOF
## 📋 重要文件

- **完整指南**: [DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md)
- **服务器配置**: [deploy_config.sh](./deploy_config.sh)
- **小程序配置**: [miniprogram_config.js](./miniprogram_config.js)

## 🔧 管理命令

### 服务器管理
\`\`\`bash
# 查看服务状态
systemctl status bazi-api

# 重启API服务
systemctl restart bazi-api

# 查看日志
journalctl -u bazi-api -f
\`\`\`

### 小程序更新
\`\`\`bash
# 准备新版本
node prepare_miniprogram.js production

# 切换开发环境
node prepare_miniprogram.js development
\`\`\`

## 📞 支持

如遇问题，请查看：
1. 完整部署指南
2. 项目文档
3. GitHub Issues

---
**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
EOF
    
    log "✅ 部署报告已生成: $(basename $report_file)"
    echo ""
    echo -e "${CYAN}📖 详细报告: $report_file${NC}"
}

# ===============================================
# 显示最终总结
# ===============================================
show_final_summary() {
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                    🎉 部署完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    if [[ "$DEPLOY_MODE" == "full" || "$DEPLOY_MODE" == "server_only" ]]; then
        source "$SCRIPT_DIR/deploy_config.sh" 2>/dev/null || true
        echo ""
        echo -e "${CYAN}🌐 服务器信息：${NC}"
        echo "   API地址: https://$API_SUBDOMAIN"
        echo "   健康检查: https://$API_SUBDOMAIN/health"
        echo "   API文档: https://$API_SUBDOMAIN/docs"
    fi
    
    if [[ "$DEPLOY_MODE" == "full" || "$DEPLOY_MODE" == "miniprogram_only" ]]; then
        echo ""
        echo -e "${CYAN}📱 小程序信息：${NC}"
        echo "   配置已更新为生产环境"
        echo "   版本信息已生成"
        echo "   发布指南已创建"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 重要提醒：${NC}"
    echo "   1. 请及时配置域名DNS解析"
    echo "   2. 确保防火墙端口已开放"
    echo "   3. 定期检查SSL证书有效期"
    echo "   4. 关注微信小程序审核状态"
    echo ""
    
    echo -e "${BLUE}📖 详细文档：${NC}"
    echo "   - 完整部署指南: deployment/DEPLOYMENT_COMPLETE_GUIDE.md"
    echo "   - 问题排查指南: 查看生成的部署报告"
    echo ""
    
    log "🎉 部署流程全部完成！"
}

# ===============================================
# 主函数
# ===============================================
main() {
    # 显示欢迎界面
    show_header
    
    # 检查前置条件
    if ! check_prerequisites; then
        exit 1
    fi
    
    # 配置向导
    guide_configuration
    
    # 配置验证
    if ! validate_and_guide_config; then
        echo ""
        log_error "配置验证失败，请修正配置后重新运行"
        echo ""
        echo "💡 快速配置："
        echo "   1. 编辑服务器配置: vim $SCRIPT_DIR/deploy_config.sh"
        echo "   2. 编辑小程序配置: vim $SCRIPT_DIR/miniprogram_config.js"
        echo "   3. 重新运行: bash $0"
        exit 1
    fi
    
    echo ""
    log "🎯 开始执行部署..."
    
    # 执行部署步骤
    deploy_server
    configure_miniprogram
    generate_final_report
    show_final_summary
    
    echo ""
    log "✨ 所有操作已完成！"
}

# ===============================================
# 错误处理
# ===============================================
trap 'log_error "脚本执行中断，请检查错误信息"; exit 1' ERR

# ===============================================
# 脚本入口
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
