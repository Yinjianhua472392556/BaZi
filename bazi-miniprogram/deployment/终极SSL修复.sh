#!/bin/bash
# ===============================================
# 终极SSL修复脚本 - 解决所有SSL问题
# ===============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

echo -e "${GREEN}"
echo "═══════════════════════════════════════════════════════════════"
echo "              🚨 终极SSL修复脚本"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# 配置变量
DOMAIN="api.bazi365.top"
EMAIL="yinjianhua472392556@gmail.com"
SERVICE_NAME="bazi-api"

log "🔍 第一步：停止所有服务"
systemctl stop nginx
systemctl stop $SERVICE_NAME
killall nginx 2>/dev/null || true
killall python 2>/dev/null || true

log "📋 第二步：检查端口占用"
netstat -tlnp | grep -E ':(80|443|8001) '

log "🗑️ 第三步：完全清理SSL证书"
rm -rf /etc/letsencrypt/live/$DOMAIN
rm -rf /etc/letsencrypt/archive/$DOMAIN
rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf

log "🔧 第四步：使用snap安装最新certbot"
which snap >/dev/null 2>&1 || {
    log_warn "安装snap..."
    apt update && apt install -y snapd
    systemctl enable --now snapd.socket
    sleep 5
}

# 移除旧的certbot
apt remove -y certbot
snap remove certbot 2>/dev/null || true

# 安装最新certbot
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

log "🛑 第五步：确保80端口完全释放"
lsof -ti:80 | xargs kill -9 2>/dev/null || true
sleep 3

log "🔒 第六步：使用standalone方式申请证书"
certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --force-renewal \
    --preferred-challenges http

if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    log_error "证书申请失败，尝试使用HTTP-01验证"
    
    # 创建临时nginx配置
    cat > /etc/nginx/sites-available/temp-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF
    
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-enabled/$SERVICE_NAME
    ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/
    
    mkdir -p /var/www/html
    nginx -t && systemctl start nginx
    
    # 使用webroot方式申请
    certbot certonly --webroot \
        -w /var/www/html \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive \
        --force-renewal
    
    systemctl stop nginx
fi

log "✅ 第七步：验证证书文件"
if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]] && [[ -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]]; then
    log "证书文件存在，设置权限"
    
    # 设置权限
    chown -R root:root /etc/letsencrypt/
    chmod 755 /etc/letsencrypt/live/
    chmod 755 /etc/letsencrypt/archive/
    chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem
    
    # 验证证书
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | head -10
    
    log "🔧 第八步：创建最终HTTPS配置"
    cat > /etc/nginx/sites-available/$SERVICE_NAME << EOF
# HTTP重定向到HTTPS
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
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:8001/health;
        access_log off;
    }
}
EOF

    # 启用配置
    rm -f /etc/nginx/sites-enabled/*
    ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
    
    log "🚀 第九步：启动服务"
    nginx -t
    if [[ $? -eq 0 ]]; then
        systemctl start $SERVICE_NAME
        sleep 5
        systemctl start nginx
        
        log "🔍 第十步：验证服务"
        sleep 10
        
        # 检查服务状态
        systemctl status $SERVICE_NAME --no-pager
        systemctl status nginx --no-pager
        
        # 检查端口
        netstat -tlnp | grep -E ':(80|443|8001) '
        
        # 测试访问
        echo ""
        log "测试HTTP访问："
        curl -I http://$DOMAIN/health 2>/dev/null | head -1 || echo "HTTP访问失败"
        
        log "测试HTTPS访问："
        curl -I https://$DOMAIN/health 2>/dev/null | head -1 || echo "HTTPS访问失败"
        
        # 设置自动续期
        echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | crontab -
        
        echo ""
        echo -e "${GREEN}🎉 SSL配置完成！${NC}"
        echo -e "${BLUE}HTTP访问: http://$DOMAIN/health${NC}"
        echo -e "${BLUE}HTTPS访问: https://$DOMAIN/health${NC}"
        
    else
        log_error "Nginx配置测试失败"
        exit 1
    fi
    
else
    log_error "证书申请失败，保持HTTP服务"
    
    # 创建HTTP配置
    cat > /etc/nginx/sites-available/$SERVICE_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8001/health;
        access_log off;
    }
}
EOF
    
    rm -f /etc/nginx/sites-enabled/*
    ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
    
    nginx -t && systemctl start $SERVICE_NAME && systemctl start nginx
    
    echo ""
    echo -e "${YELLOW}⚠️ SSL申请失败，当前使用HTTP服务${NC}"
    echo -e "${BLUE}HTTP访问: http://$DOMAIN/health${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    🎊 修复完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
