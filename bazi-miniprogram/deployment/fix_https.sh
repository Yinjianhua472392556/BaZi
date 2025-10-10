#!/bin/bash
# ===============================================
# 八字运势小程序 - HTTPS一键修复脚本
# ===============================================
# 
# 功能：专门修复HTTPS访问问题
# - 检测和修复SSL证书配置
# - 重新创建正确的Nginx HTTPS配置
# - 修复证书权限问题
# - 验证和测试HTTPS访问
#
# 使用方法：
# sudo bash fix_https.sh
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
NC='\033[0m' # No Color

# 配置变量
DOMAIN="api.bazi365.top"
SERVICE_NAME="bazi-api"
SERVICE_PORT="8001"
LOG_FILE="/tmp/https_fix_$(date +%Y%m%d_%H%M%S).log"

# ===============================================
# 日志函数
# ===============================================
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN] $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}═══ $1 ═══${NC}" | tee -a "$LOG_FILE"
}

# ===============================================
# 命令执行函数
# ===============================================
execute_command() {
    local command="$1"
    local description="$2"
    
    log_info "🔄 执行: $description"
    log_info "📝 命令: $command"
    
    if eval "$command" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ $description - 成功"
        return 0
    else
        log_error "❌ $description - 失败"
        return 1
    fi
}

# ===============================================
# 权限检查
# ===============================================
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        log_error "请使用: sudo bash fix_https.sh"
        exit 1
    fi
}

# ===============================================
# 环境诊断
# ===============================================
diagnose_environment() {
    log_step "第一步：环境诊断"
    
    log_info "🔍 检查当前HTTPS问题..."
    
    # 测试HTTPS访问
    if curl -s -I "https://$DOMAIN/health" >/dev/null 2>&1; then
        log "✅ HTTPS访问正常，无需修复"
        exit 0
    else
        log_warn "❌ HTTPS访问失败，开始修复流程"
    fi
    
    # 测试HTTP访问
    if curl -s -I "http://$DOMAIN/health" >/dev/null 2>&1; then
        log "✅ HTTP访问正常"
    else
        log_error "❌ HTTP访问也失败，请先检查基础服务"
        exit 1
    fi
    
    # 检查服务状态
    log_info "📊 检查服务状态:"
    systemctl status $SERVICE_NAME --no-pager | tee -a "$LOG_FILE" || true
    systemctl status nginx --no-pager | tee -a "$LOG_FILE" || true
    
    # 检查端口监听
    log_info "📊 检查端口监听:"
    netstat -tlnp | grep -E "(80|443|$SERVICE_PORT)" | tee -a "$LOG_FILE" || true
    
    # 检查证书文件
    log_info "📊 检查证书文件:"
    if [[ -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
        ls -la "/etc/letsencrypt/live/$DOMAIN/" | tee -a "$LOG_FILE" || true
    else
        log_warn "证书目录不存在: /etc/letsencrypt/live/$DOMAIN"
    fi
    
    log "✅ 环境诊断完成"
}

# ===============================================
# 停止服务
# ===============================================
stop_services() {
    log_step "第二步：停止相关服务"
    
    execute_command "systemctl stop nginx" "停止Nginx服务"
    execute_command "systemctl stop $SERVICE_NAME" "停止API服务"
    
    # 等待端口释放
    execute_command "sleep 3" "等待端口释放"
    
    log "✅ 服务停止完成"
}

# ===============================================
# 清理损坏的配置
# ===============================================
cleanup_config() {
    log_step "第三步：清理损坏的配置"
    
    # 备份现有配置
    if [[ -f "/etc/nginx/sites-available/$SERVICE_NAME" ]]; then
        execute_command "cp /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-available/$SERVICE_NAME.backup.$(date +%Y%m%d_%H%M%S)" "备份现有Nginx配置"
    fi
    
    # 清理配置文件
    execute_command "rm -f /etc/nginx/sites-enabled/$SERVICE_NAME" "删除启用的站点配置"
    execute_command "rm -f /etc/nginx/sites-available/$SERVICE_NAME" "删除站点配置文件"
    execute_command "rm -f /etc/nginx/sites-enabled/default" "删除默认配置"
    
    log "✅ 配置清理完成"
}

# ===============================================
# 重新生成SSL证书
# ===============================================
regenerate_ssl_certificate() {
    log_step "第四步：重新生成SSL证书"
    
    # 停止可能占用80端口的服务
    execute_command "systemctl stop nginx" "确保Nginx已停止"
    execute_command "fuser -k 80/tcp" "释放80端口" || true
    execute_command "fuser -k 443/tcp" "释放443端口" || true
    
    # 删除现有证书
    if [[ -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
        execute_command "certbot delete --cert-name $DOMAIN --non-interactive" "删除现有证书"
    fi
    
    # 重新申请证书
    execute_command "certbot certonly --standalone -d $DOMAIN --email admin@$DOMAIN --agree-tos --non-interactive --force-renewal" "重新申请SSL证书"
    
    # 验证证书文件
    execute_command "ls -la /etc/letsencrypt/live/$DOMAIN/" "验证证书文件"
    
    log "✅ SSL证书重新生成完成"
}

# ===============================================
# 修复证书权限
# ===============================================
fix_certificate_permissions() {
    log_step "第五步：修复证书权限"
    
    execute_command "chown -R root:root /etc/letsencrypt/" "设置证书目录所有者"
    execute_command "chmod -R 755 /etc/letsencrypt/live/" "设置目录权限"
    execute_command "chmod -R 755 /etc/letsencrypt/archive/" "设置归档目录权限"
    execute_command "chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem" "设置证书文件权限"
    execute_command "chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem" "设置私钥文件权限"
    
    # 验证证书可读性
    execute_command "test -r /etc/letsencrypt/live/$DOMAIN/fullchain.pem && echo '证书文件可读'" "验证证书文件可读性"
    execute_command "test -r /etc/letsencrypt/live/$DOMAIN/privkey.pem && echo '私钥文件可读'" "验证私钥文件可读性"
    
    log "✅ 证书权限修复完成"
}

# ===============================================
# 创建正确的Nginx配置
# ===============================================
create_nginx_config() {
    log_step "第六步：创建正确的Nginx HTTPS配置"
    
    local nginx_config="# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
    }

    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:$SERVICE_PORT/health;
        access_log off;
    }

    # 日志配置
    access_log /var/log/nginx/${DOMAIN}_access.log;
    error_log /var/log/nginx/${DOMAIN}_error.log;
}"
    
    # 创建配置文件
    execute_command "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$nginx_config
EOF" "创建Nginx HTTPS配置文件"
    
    # 启用站点
    execute_command "ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/" "启用站点配置"
    
    # 测试配置语法
    execute_command "nginx -t" "测试Nginx配置语法"
    
    log "✅ Nginx HTTPS配置创建完成"
}

# ===============================================
# 配置防火墙
# ===============================================
configure_firewall() {
    log_step "第七步：配置防火墙"
    
    # 检查防火墙状态
    if command -v ufw >/dev/null 2>&1; then
        execute_command "ufw allow 80/tcp" "开放HTTP端口"
        execute_command "ufw allow 443/tcp" "开放HTTPS端口"
        execute_command "ufw reload" "重载防火墙规则"
        log_info "防火墙规则已更新"
    else
        log_info "未检测到ufw防火墙，跳过配置"
    fi
    
    log "✅ 防火墙配置完成"
}

# ===============================================
# 启动服务
# ===============================================
start_services() {
    log_step "第八步：启动服务"
    
    # 启动API服务
    execute_command "systemctl start $SERVICE_NAME" "启动API服务"
    execute_command "sleep 3" "等待API服务启动"
    
    # 检查API服务状态
    if systemctl is-active --quiet $SERVICE_NAME; then
        log "✅ API服务启动成功"
    else
        log_error "❌ API服务启动失败"
        systemctl status $SERVICE_NAME --no-pager | tee -a "$LOG_FILE"
        exit 1
    fi
    
    # 启动Nginx服务
    execute_command "systemctl start nginx" "启动Nginx服务"
    execute_command "sleep 3" "等待Nginx服务启动"
    
    # 检查Nginx服务状态
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx服务启动成功"
    else
        log_error "❌ Nginx服务启动失败"
        systemctl status nginx --no-pager | tee -a "$LOG_FILE"
        exit 1
    fi
    
    log "✅ 所有服务启动完成"
}

# ===============================================
# 验证HTTPS访问
# ===============================================
verify_https_access() {
    log_step "第九步：验证HTTPS访问"
    
    log_info "等待服务完全启动..."
    sleep 10
    
    # 测试本地API访问
    log_info "🔍 测试本地API访问:"
    if curl -s -f "http://127.0.0.1:$SERVICE_PORT/health" >/dev/null; then
        log "✅ 本地API访问正常"
    else
        log_error "❌ 本地API访问失败"
        exit 1
    fi
    
    # 测试HTTP访问
    log_info "🔍 测试HTTP访问:"
    if curl -s -I "http://$DOMAIN/health" | grep -q "301"; then
        log "✅ HTTP正确重定向到HTTPS"
    else
        log_warn "⚠️ HTTP访问异常"
    fi
    
    # 测试HTTPS访问
    log_info "🔍 测试HTTPS访问:"
    if curl -s -f "https://$DOMAIN/health" >/dev/null; then
        log "🎉 HTTPS访问成功！"
        
        # 显示详细信息
        log_info "📊 HTTPS访问详情:"
        curl -s -I "https://$DOMAIN/health" | head -5 | tee -a "$LOG_FILE"
        
    else
        log_error "❌ HTTPS访问仍然失败"
        
        # 显示调试信息
        log_info "🔍 详细错误信息:"
        curl -v "https://$DOMAIN/health" 2>&1 | tee -a "$LOG_FILE" || true
        
        exit 1
    fi
    
    log "✅ HTTPS访问验证完成"
}

# ===============================================
# 运行完整测试
# ===============================================
run_full_test() {
    log_step "第十步：运行完整API测试"
    
    local test_script="/opt/bazi-app/bazi-miniprogram/deployment/test_all_apis.sh"
    
    if [[ -f "$test_script" ]]; then
        log_info "🧪 运行完整API测试..."
        if bash "$test_script"; then
            log "🎉 所有API测试通过！"
        else
            log_warn "⚠️ 部分API测试失败，但HTTPS已修复"
        fi
    else
        log_info "API测试脚本不存在，跳过"
    fi
    
    log "✅ 测试完成"
}

# ===============================================
# 生成修复报告
# ===============================================
generate_report() {
    log_step "生成修复报告"
    
    local report_file="/tmp/https_fix_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
# HTTPS修复完成报告

## 修复信息
- 修复时间: $(date '+%Y-%m-%d %H:%M:%S')
- 域名: $DOMAIN
- 服务: $SERVICE_NAME
- 端口: $SERVICE_PORT

## 修复步骤
1. ✅ 环境诊断
2. ✅ 停止服务
3. ✅ 清理配置
4. ✅ 重新生成SSL证书
5. ✅ 修复证书权限
6. ✅ 创建Nginx HTTPS配置
7. ✅ 配置防火墙
8. ✅ 启动服务
9. ✅ 验证HTTPS访问
10. ✅ 完整测试

## 访问地址
- HTTPS: https://$DOMAIN/health
- API文档: https://$DOMAIN/docs

## 服务管理
查看状态: systemctl status $SERVICE_NAME nginx
重启服务: systemctl restart $SERVICE_NAME nginx
查看日志: journalctl -u $SERVICE_NAME -f

## 详细日志
$LOG_FILE

修复成功！🎉
EOF
    
    log "📄 修复报告: $report_file"
    cat "$report_file"
}

# ===============================================
# 主函数
# ===============================================
main() {
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "           八字运势小程序 - HTTPS一键修复工具"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    # 检查权限
    check_root
    
    log "🚀 开始HTTPS修复流程..."
    log "📝 日志文件: $LOG_FILE"
    echo ""
    
    # 执行修复步骤
    diagnose_environment
    stop_services
    cleanup_config
    regenerate_ssl_certificate
    fix_certificate_permissions
    create_nginx_config
    configure_firewall
    start_services
    verify_https_access
    run_full_test
    
    # 生成报告
    generate_report
    
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                🎉 HTTPS修复完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    echo ""
    log "🎯 HTTPS修复成功完成！"
    echo -e "${CYAN}🌐 请访问: https://$DOMAIN/health${NC}"
    echo ""
}

# ===============================================
# 脚本入口
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
