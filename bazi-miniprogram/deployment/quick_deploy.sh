#!/bin/bash
# ===============================================
# 八字运势小程序 - 快速部署脚本
# ===============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 全局变量
CURRENT_STEP=0
TOTAL_STEPS=8
START_TIME=$(date +%s)

# 日志文件
LOG_FILE="deploy_$(date +%Y%m%d_%H%M%S).log"

# ===============================================
# 日志函数
# ===============================================
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

# ===============================================
# 进度显示函数
# ===============================================
show_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local description="$1"
    local percentage=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "  步骤 $CURRENT_STEP/$TOTAL_STEPS: $description"
    echo "  进度: [$percentage%] $(printf '█%.0s' $(seq 1 $((percentage/5))))$(printf '░%.0s' $(seq 1 $((20-percentage/5))))"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# ===============================================
# 执行命令函数
# ===============================================
execute_cmd() {
    local command="$1"
    local description="${2:-执行命令}"
    
    log_info "🔄 正在执行: $description"
    log_info "📝 命令: $command"
    
    if eval "$command" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ $description - 成功"
        return 0
    else
        log_error "❌ $description - 失败"
        read -p "是否继续？(y/n): " choice
        if [[ ! "$choice" =~ ^[Yy]$ ]]; then
            exit 1
        fi
        return 0
    fi
}

# ===============================================
# 加载配置
# ===============================================
load_config() {
    show_progress "加载配置文件"
    
    if [[ ! -f "deploy_config.sh" ]]; then
        log_error "配置文件不存在: deploy_config.sh"
        exit 1
    fi
    
    log "📋 加载配置文件..."
    source deploy_config.sh
    
    # 设置默认值
    SERVICE_NAME="${SERVICE_NAME:-bazi-api}"
    SERVICE_PORT="${SERVICE_PORT:-8001}"
    SERVICE_USER="${SERVICE_USER:-bazi}"
    DEPLOY_PATH="${DEPLOY_PATH:-/opt/bazi-app}"
    
    log "✅ 配置加载完成"
    log_info "服务器: $SERVER_IP"
    log_info "域名: $API_SUBDOMAIN"
    log_info "端口: $SERVICE_PORT"
}

# ===============================================
# 系统更新
# ===============================================
update_system() {
    show_progress "更新系统并安装依赖"
    
    execute_cmd "export DEBIAN_FRONTEND=noninteractive" "设置非交互模式"
    execute_cmd "apt update" "更新软件源"
    execute_cmd "apt install -y python3 python3-pip python3-venv python3-dev nginx curl git" "安装基础软件"
    execute_cmd "apt install -y certbot python3-certbot-nginx" "安装SSL工具"
}

# ===============================================
# 创建用户和目录
# ===============================================
setup_user() {
    show_progress "创建应用用户和目录"
    
    execute_cmd "if ! id '$SERVICE_USER' &>/dev/null; then useradd -r -d $DEPLOY_PATH -s /bin/bash $SERVICE_USER; fi" "创建应用用户"
    execute_cmd "mkdir -p $DEPLOY_PATH /var/log/$SERVICE_NAME" "创建目录"
    execute_cmd "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH /var/log/$SERVICE_NAME" "设置权限"
}

# ===============================================
# 部署代码
# ===============================================
deploy_code() {
    show_progress "部署项目代码"
    
    execute_cmd "cd /tmp && rm -rf bazi-temp" "清理临时目录"
    execute_cmd "cd /tmp && git clone -b $PROJECT_BRANCH $GITHUB_REPO bazi-temp" "克隆代码"
    execute_cmd "if [[ -d '$DEPLOY_PATH/bazi-miniprogram' ]]; then mv $DEPLOY_PATH/bazi-miniprogram $DEPLOY_PATH/bazi-miniprogram.backup.\$(date +%Y%m%d_%H%M%S); fi" "备份旧代码"
    execute_cmd "cp -r /tmp/bazi-temp/bazi-miniprogram $DEPLOY_PATH/" "复制新代码"
    execute_cmd "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH" "设置权限"
}

# ===============================================
# 配置Python环境
# ===============================================
setup_python() {
    show_progress "配置Python环境"
    
    execute_cmd "cd $DEPLOY_PATH/bazi-miniprogram && python3 -m venv venv" "创建虚拟环境"
    execute_cmd "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && pip install --upgrade pip" "升级pip"
    execute_cmd "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && pip install -r requirements.txt" "安装依赖"
    execute_cmd "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && python -c 'import fastapi; print(\"FastAPI installed\")'" "验证安装"
}

# ===============================================
# 创建系统服务
# ===============================================
create_service() {
    show_progress "创建系统服务"
    
    local service_content="[Unit]
Description=八字运势小程序 API服务
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$DEPLOY_PATH/bazi-miniprogram
Environment=PATH=$DEPLOY_PATH/bazi-miniprogram/venv/bin:\$PATH
ExecStart=$DEPLOY_PATH/bazi-miniprogram/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target"
    
    execute_cmd "cat > /etc/systemd/system/$SERVICE_NAME.service << 'EOF'
$service_content
EOF" "创建服务文件"
    
    execute_cmd "systemctl daemon-reload" "重载systemd"
    execute_cmd "systemctl enable $SERVICE_NAME" "启用服务"
}

# ===============================================
# 配置Nginx
# ===============================================
setup_nginx() {
    show_progress "配置Nginx"
    
    local nginx_config="server {
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
    
    execute_cmd "rm -f /etc/nginx/sites-enabled/default" "删除默认配置"
    execute_cmd "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$nginx_config
EOF" "创建Nginx配置"
    execute_cmd "ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/" "启用配置"
    execute_cmd "nginx -t" "测试配置"
}

# ===============================================
# 启动服务
# ===============================================
start_services() {
    show_progress "启动服务"
    
    execute_cmd "systemctl start $SERVICE_NAME" "启动API服务"
    execute_cmd "systemctl reload nginx" "重载Nginx"
    execute_cmd "sleep 5" "等待启动"
    
    # 检查服务状态
    if systemctl is-active --quiet $SERVICE_NAME; then
        log "✅ API服务运行正常"
    else
        log_error "API服务启动失败"
        execute_cmd "systemctl status $SERVICE_NAME" "查看服务状态"
    fi
    
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx服务运行正常"
    else
        log_error "Nginx服务异常"
    fi
}

# ===============================================
# 配置SSL (可选)
# ===============================================
setup_ssl() {
    show_progress "配置SSL证书"
    
    if [[ "$ENABLE_SSL" == "yes" ]]; then
        execute_cmd "certbot --nginx -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive" "申请SSL证书"
        log "✅ SSL证书配置完成"
    else
        log "⚠️ 跳过SSL配置"
    fi
}

# ===============================================
# 主函数
# ===============================================
main() {
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "           八字运势小程序 - 快速部署脚本"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    log "🚀 开始部署..."
    log "⏰ 开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 执行部署步骤
    load_config
    update_system
    setup_user
    deploy_code
    setup_python
    create_service
    setup_nginx
    start_services
    setup_ssl
    
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                    🎉 部署完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    log "🎯 部署完成！"
    echo ""
    echo "📋 测试命令:"
    echo "   curl http://$API_SUBDOMAIN/health"
    echo ""
    echo "📊 服务管理:"
    echo "   systemctl status $SERVICE_NAME"
    echo "   systemctl restart $SERVICE_NAME"
    echo ""
}

# 运行主函数
main "$@"
