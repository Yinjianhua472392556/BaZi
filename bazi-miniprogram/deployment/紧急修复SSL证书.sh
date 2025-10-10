#!/bin/bash
# ===============================================
# 紧急修复SSL证书问题
# ===============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
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

# 执行命令函数
execute_command() {
    local command="$1"
    local description="${2:-执行命令}"
    
    log_info "🔄 $description"
    echo -e "${YELLOW}[CMD]${NC} $command"
    
    if eval "$command"; then
        log "✅ $description - 成功"
        return 0
    else
        log_error "❌ $description - 失败"
        return 1
    fi
}

# 主修复函数
emergency_fix_ssl() {
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "              🚨 紧急修复SSL证书问题"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    # 加载配置
    if [[ ! -f "$SCRIPT_DIR/deploy_config.sh" ]]; then
        log_error "配置文件不存在，使用默认配置"
        API_SUBDOMAIN="api.bazi365.top"
        SSL_EMAIL="yinjianhua472392556@gmail.com"
        SERVICE_NAME="bazi-api"
        SERVICE_PORT="8001"
    else
        source "$SCRIPT_DIR/deploy_config.sh"
    fi
    
    log "🔍 开始紧急SSL修复..."
    
    # 第一步：停止所有服务
    log_info "第一步：停止服务"
    execute_command "systemctl stop nginx" "停止Nginx"
    execute_command "systemctl stop $SERVICE_NAME" "停止API服务" || true
    
    # 第二步：检查当前证书状态
    log_info "第二步：检查证书状态"
    if [[ -d "/etc/letsencrypt/live/$API_SUBDOMAIN" ]]; then
        execute_command "ls -la /etc/letsencrypt/live/$API_SUBDOMAIN/" "检查证书目录"
        
        if [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]]; then
            log "证书文件存在，检查权限..."
            execute_command "file /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" "检查证书文件类型"
            execute_command "stat /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" "检查文件详细信息"
        else
            log_warn "证书文件不存在"
        fi
    else
        log_warn "证书目录不存在"
    fi
    
    # 第三步：完全清理并重新申请证书
    log_info "第三步：清理并重新申请SSL证书"
    
    # 删除可能损坏的证书
    execute_command "rm -rf /etc/letsencrypt/live/$API_SUBDOMAIN" "删除证书目录" || true
    execute_command "rm -rf /etc/letsencrypt/archive/$API_SUBDOMAIN" "删除证书归档" || true
    execute_command "rm -rf /etc/letsencrypt/renewal/$API_SUBDOMAIN.conf" "删除续期配置" || true
    
    # 第四步：创建简单的HTTP配置先启动服务
    log_info "第四步：创建HTTP配置"
    
    local http_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:$SERVICE_PORT/health;
        access_log off;
    }
}"
    
    execute_command "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$http_config
EOF" "创建HTTP配置"
    
    execute_command "rm -f /etc/nginx/sites-enabled/$SERVICE_NAME" "删除旧的符号链接" || true
    execute_command "ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/" "创建新的符号链接"
    
    # 第五步：测试并启动HTTP服务
    log_info "第五步：启动HTTP服务"
    execute_command "nginx -t" "测试Nginx配置"
    execute_command "systemctl start nginx" "启动Nginx"
    execute_command "systemctl start $SERVICE_NAME" "启动API服务"
    
    # 等待服务启动
    execute_command "sleep 5" "等待服务启动"
    
    # 测试HTTP访问
    execute_command "curl -I http://$API_SUBDOMAIN/health || curl -I http://127.0.0.1/health" "测试HTTP访问"
    
    # 第六步：重新申请SSL证书（使用standalone模式）
    log_info "第六步：重新申请SSL证书"
    
    # 停止nginx以释放80端口
    execute_command "systemctl stop nginx" "停止Nginx以释放80端口"
    
    # 使用standalone模式申请证书
    execute_command "certbot certonly --standalone -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive --force-renewal" "standalone方式申请证书"
    
    # 第七步：验证证书文件
    log_info "第七步：验证证书文件"
    if [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]] && [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem" ]]; then
        log "✅ 证书文件存在"
        
        execute_command "ls -la /etc/letsencrypt/live/$API_SUBDOMAIN/" "检查证书文件"
        execute_command "openssl x509 -in /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem -text -noout | head -20" "验证证书内容"
        
        # 设置正确的权限
        execute_command "chown -R root:root /etc/letsencrypt/" "设置证书目录权限"
        execute_command "chmod 755 /etc/letsencrypt/live/" "设置live目录权限"
        execute_command "chmod 755 /etc/letsencrypt/archive/" "设置archive目录权限"
        execute_command "chmod 644 /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" "设置证书权限"
        execute_command "chmod 600 /etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem" "设置私钥权限"
        
        # 第八步：创建HTTPS配置
        log_info "第八步：创建HTTPS配置"
        
        local https_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $API_SUBDOMAIN;

    ssl_certificate /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:$SERVICE_PORT/health;
        access_log off;
    }
}"
        
        execute_command "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$https_config
EOF" "创建HTTPS配置"
        
        # 第九步：测试并启动HTTPS服务
        log_info "第九步：启动HTTPS服务"
        execute_command "nginx -t" "测试HTTPS配置"
        
        if [[ $? -eq 0 ]]; then
            execute_command "systemctl start nginx" "启动Nginx HTTPS服务"
            execute_command "sleep 5" "等待服务启动"
            
            # 验证HTTPS访问
            execute_command "curl -I https://$API_SUBDOMAIN/health" "测试HTTPS访问"
            
            if [[ $? -eq 0 ]]; then
                log "🎉 HTTPS修复成功！"
                
                # 设置自动续期
                execute_command "echo '0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx' | crontab -" "设置自动续期"
                
            else
                log_warn "HTTPS访问失败，但证书已配置"
            fi
        else
            log_error "HTTPS配置测试失败"
        fi
        
    else
        log_error "证书申请失败，使用HTTP配置"
        
        # 启动HTTP服务
        execute_command "systemctl start nginx" "启动HTTP服务"
    fi
    
    # 第十步：最终状态检查
    log_info "第十步：最终状态检查"
    execute_command "systemctl status nginx --no-pager" "检查Nginx状态"
    execute_command "systemctl status $SERVICE_NAME --no-pager" "检查API服务状态"
    execute_command "netstat -tlnp | grep -E ':(80|443|$SERVICE_PORT) '" "检查端口监听"
    
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                 🚨 紧急修复完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    log "📋 修复总结："
    if [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]]; then
        echo -e "${GREEN}✅ SSL证书：已重新申请并配置${NC}"
        echo -e "${BLUE}🔗 HTTPS访问: https://$API_SUBDOMAIN/health${NC}"
    else
        echo -e "${YELLOW}⚠️ SSL证书：申请失败，当前使用HTTP${NC}"
        echo -e "${BLUE}🔗 HTTP访问: http://$API_SUBDOMAIN/health${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 提示：如果HTTPS仍有问题，可以多次运行此脚本进行修复${NC}"
    echo ""
}

# 主入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    emergency_fix_ssl "$@"
fi
