#!/bin/bash
# ===============================================
# SSL/HTTPS问题修复专用脚本
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
fix_ssl_issues() {
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "              SSL/HTTPS问题修复脚本"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    # 加载配置
    if [[ ! -f "$SCRIPT_DIR/deploy_config.sh" ]]; then
        log_error "配置文件不存在: $SCRIPT_DIR/deploy_config.sh"
        exit 1
    fi
    
    source "$SCRIPT_DIR/deploy_config.sh"
    
    log "🔍 开始诊断SSL问题..."
    
    # 1. 检查当前状态
    log_info "第一步：检查当前状态"
    execute_command "systemctl status nginx --no-pager" "检查Nginx状态"
    execute_command "systemctl status ${SERVICE_NAME:-bazi-api} --no-pager" "检查API服务状态"
    
    # 2. 检查证书目录
    log_info "第二步：检查SSL证书"
    if [[ -d "/etc/letsencrypt/live/$API_SUBDOMAIN" ]]; then
        execute_command "ls -la /etc/letsencrypt/live/$API_SUBDOMAIN/" "检查证书文件"
        execute_command "openssl x509 -in /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem -text -noout | grep -E 'Subject:|Not After'" "检查证书有效期"
    else
        log_warn "证书目录不存在: /etc/letsencrypt/live/$API_SUBDOMAIN"
    fi
    
    # 3. 检查Nginx配置
    log_info "第三步：检查Nginx配置"
    if nginx -t; then
        log "✅ Nginx配置语法正确"
    else
        log_error "❌ Nginx配置有语法错误"
        
        # 创建临时HTTP配置
        log_info "创建临时HTTP配置"
        local temp_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
    location / {
        proxy_pass http://127.0.0.1:${SERVICE_PORT:-8001};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:${SERVICE_PORT:-8001}/health;
        access_log off;
    }
}"
        
        execute_command "cat > /etc/nginx/sites-available/${SERVICE_NAME:-bazi-api} << 'EOF'
$temp_config
EOF" "创建临时HTTP配置"
        
        execute_command "nginx -t" "测试临时配置"
    fi
    
    # 4. 停止服务准备重新配置
    log_info "第四步：准备重新配置SSL"
    execute_command "systemctl stop nginx" "停止Nginx"
    
    # 5. 清理问题证书
    log_info "第五步：清理问题证书"
    if [[ -d "/etc/letsencrypt/live/$API_SUBDOMAIN" ]]; then
        execute_command "certbot delete --cert-name $API_SUBDOMAIN --non-interactive" "删除问题证书" || true
    fi
    
    # 6. 重新启动HTTP服务
    log_info "第六步：启动HTTP服务"
    execute_command "systemctl start nginx" "启动Nginx HTTP服务"
    execute_command "sleep 3" "等待服务启动"
    
    # 验证HTTP访问
    execute_command "curl -I http://$API_SUBDOMAIN/health || curl -I http://localhost/health" "验证HTTP访问"
    
    # 7. 重新申请SSL证书
    log_info "第七步：重新申请SSL证书"
    
    # 创建验证目录
    execute_command "mkdir -p /var/www/html/.well-known/acme-challenge" "创建验证目录"
    execute_command "chown -R www-data:www-data /var/www/html" "设置目录权限"
    
    # 更新Nginx配置支持验证
    local verify_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
    # Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }
    
    location / {
        proxy_pass http://127.0.0.1:${SERVICE_PORT:-8001};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}"
    
    execute_command "cat > /etc/nginx/sites-available/${SERVICE_NAME:-bazi-api} << 'EOF'
$verify_config
EOF" "更新Nginx配置支持证书验证"
    
    execute_command "nginx -t && systemctl reload nginx" "重载Nginx配置"
    
    # 尝试多种方式申请证书
    local cert_success=false
    
    # 方法1：webroot方式
    if execute_command "certbot certonly --webroot -w /var/www/html -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive" "方法1：webroot方式申请证书"; then
        cert_success=true
    # 方法2：standalone方式
    elif execute_command "systemctl stop nginx && certbot certonly --standalone -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive && systemctl start nginx" "方法2：standalone方式申请证书"; then
        cert_success=true
    # 方法3：nginx插件方式
    elif execute_command "certbot --nginx -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive" "方法3：nginx插件方式申请证书"; then
        cert_success=true
    fi
    
    if [[ "$cert_success" == "true" ]]; then
        log "✅ SSL证书申请成功！"
        
        # 8. 配置HTTPS
        log_info "第八步：配置HTTPS"
        
        # 验证证书文件
        if [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]] && [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem" ]]; then
            
            # 设置权限
            execute_command "chown -R root:root /etc/letsencrypt/" "设置证书目录权限"
            execute_command "chmod 644 /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" "设置证书文件权限"
            execute_command "chmod 600 /etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem" "设置私钥文件权限"
            
            # 创建HTTPS配置
            local https_config="# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
    # Let's Encrypt验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }
    
    # 其他请求重定向到HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $API_SUBDOMAIN;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:${SERVICE_PORT:-8001};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:${SERVICE_PORT:-8001}/health;
        access_log off;
    }

    # 安全头
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
}"
            
            execute_command "cat > /etc/nginx/sites-available/${SERVICE_NAME:-bazi-api} << 'EOF'
$https_config
EOF" "创建HTTPS配置"
            
            # 测试并应用配置
            if execute_command "nginx -t" "测试HTTPS配置"; then
                execute_command "systemctl reload nginx" "应用HTTPS配置"
                
                # 设置自动续期
                execute_command "echo '0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx' | crontab -" "设置SSL证书自动续期"
                
                # 验证HTTPS访问
                execute_command "sleep 5" "等待服务启动"
                if execute_command "curl -I https://$API_SUBDOMAIN/health" "验证HTTPS访问"; then
                    log "🎉 HTTPS配置完成并验证成功！"
                else
                    log_warn "HTTPS访问验证失败，但配置已完成"
                fi
            else
                log_error "HTTPS配置测试失败"
            fi
        else
            log_error "证书文件不存在或不完整"
        fi
    else
        log_error "所有SSL证书申请方法都失败了"
        log_info "保持HTTP配置，稍后可手动重试"
    fi
    
    # 9. 最终状态检查
    log_info "第九步：最终状态检查"
    execute_command "systemctl status nginx --no-pager" "检查Nginx最终状态"
    execute_command "systemctl status ${SERVICE_NAME:-bazi-api} --no-pager" "检查API服务最终状态"
    execute_command "netstat -tlnp | grep -E ':(80|443|${SERVICE_PORT:-8001}) '" "检查端口监听状态"
    
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                 SSL修复完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    if [[ "$cert_success" == "true" ]]; then
        echo -e "${GREEN}✅ SSL证书申请成功，HTTPS已配置${NC}"
        echo -e "${BLUE}🔗 HTTPS访问: https://$API_SUBDOMAIN/health${NC}"
    else
        echo -e "${YELLOW}⚠️ SSL证书申请失败，当前使用HTTP${NC}"
        echo -e "${BLUE}🔗 HTTP访问: http://$API_SUBDOMAIN/health${NC}"
        echo -e "${YELLOW}💡 可稍后再次运行此脚本重试SSL配置${NC}"
    fi
    
    echo ""
}

# 主入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    fix_ssl_issues "$@"
fi
