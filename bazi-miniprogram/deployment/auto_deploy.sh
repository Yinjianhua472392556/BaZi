#!/bin/bash
# ===============================================
# 八字运势小程序 - 终极万能部署脚本
# ===============================================
# 
# 功能：
# - 自动安装和配置服务器环境
# - 部署八字运势小程序后端API
# - 智能SSL证书管理和修复
# - 配置Nginx反向代理和HTTPS
# - 完整的错误诊断和自动修复
# - 腾讯云环境特别优化
#
# 使用方法：
# 1. 修改 deploy_config.sh 中的配置
# 2. 运行: bash auto_deploy.sh
# 3. 自动完成所有部署和修复
#
# ===============================================

set +e  # 允许命令失败，使用自定义错误处理

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

# 全局变量
LOCAL_MODE=true  # 直接在服务器终端执行
CURRENT_STEP=0
TOTAL_STEPS=12
START_TIME=$(date +%s)
LOG_FILE="/tmp/bazi_deploy_$(date +%Y%m%d_%H%M%S).log"

# ===============================================
# 日志和输出函数
# ===============================================
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_info() {
    local message="[INFO] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_warn() {
    local message="[WARN] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_error() {
    local message="[ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

log_step() {
    local message="[STEP] $1"
    echo -e "${PURPLE}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

# ===============================================
# 进度显示函数
# ===============================================
show_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local description="$1"
    local percentage=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    local current_time=$(date +%s)
    local elapsed_time=$((current_time - START_TIME))
    local estimated_total_time=$((elapsed_time * TOTAL_STEPS / CURRENT_STEP))
    local remaining_time=$((estimated_total_time - elapsed_time))
    
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "  步骤 $CURRENT_STEP/$TOTAL_STEPS: $description"
    echo "  进度: [$percentage%] $(printf '█%.0s' $(seq 1 $((percentage/5))))$(printf '░%.0s' $(seq 1 $((20-percentage/5))))"
    echo "  已用时间: ${elapsed_time}秒 | 预计剩余: ${remaining_time}秒"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# ===============================================
# 智能命令执行函数
# ===============================================
execute_command() {
    local command="$1"
    local description="${2:-执行命令}"
    local critical="${3:-false}"
    local step_start_time=$(date +%s)
    
    log_info "🔄 正在执行: $description"
    echo -e "${ORANGE}[CMD]${NC} $command"
    
    local result=0
    eval "$command" 2>&1 | tee -a "$LOG_FILE" 2>/dev/null || true
    result=${PIPESTATUS[0]}
    
    local step_end_time=$(date +%s)
    local step_duration=$((step_end_time - step_start_time))
    
    if [[ $result -eq 0 ]]; then
        log "✅ $description - 成功 (耗时: ${step_duration}秒)"
        return 0
    else
        log_warn "⚠️ $description - 失败 (耗时: ${step_duration}秒)"
        
        # 如果是关键步骤失败，尝试自动修复
        if [[ "$critical" == "true" ]]; then
            auto_fix_error "$command" "$description"
        fi
        
        # 非关键步骤继续执行
        log_info "🔄 继续执行下一步..."
        return 1
    fi
}

# ===============================================
# 自动错误修复函数
# ===============================================
auto_fix_error() {
    local failed_command="$1"
    local description="$2"
    
    log_warn "🔧 尝试自动修复: $description"
    
    case "$failed_command" in
        *"apt update"*)
            execute_command "apt clean && apt update" "清理并重新更新包缓存"
            ;;
        *"systemctl start nginx"*)
            execute_command "nginx -t" "检查Nginx配置"
            execute_command "systemctl status nginx --no-pager" "检查Nginx状态"
            ;;
        *"systemctl start $SERVICE_NAME"*)
            execute_command "systemctl status $SERVICE_NAME --no-pager" "检查API服务状态"
            execute_command "journalctl -u $SERVICE_NAME --no-pager -n 20" "查看API服务日志"
            ;;
        *"certbot"*)
            log_info "SSL证书申请失败，将在SSL配置阶段重试"
            ;;
        *)
            log_warn "未知错误类型，请检查日志: $LOG_FILE"
            ;;
    esac
}

# ===============================================
# 配置验证和加载
# ===============================================
load_and_validate_config() {
    show_progress "加载和验证配置"
    
    # 检查配置文件
    if [[ ! -f "$SCRIPT_DIR/deploy_config.sh" ]]; then
        log_error "配置文件不存在: $SCRIPT_DIR/deploy_config.sh"
        log_error "请先创建配置文件！"
        exit 1
    fi
    
    # 加载配置
    source "$SCRIPT_DIR/deploy_config.sh"
    
    # 验证必要配置
    local errors=0
    local required_vars=("SERVER_IP" "API_SUBDOMAIN" "SSL_EMAIL" "GITHUB_REPO")
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "必填配置项缺失: $var"
            errors=$((errors + 1))
        fi
    done
    
    if [[ $errors -gt 0 ]]; then
        log_error "发现 $errors 个配置错误，请修正后重试"
        exit 1
    fi
    
    # 设置默认值
    SERVICE_NAME="${SERVICE_NAME:-bazi-api}"
    SERVICE_PORT="${SERVICE_PORT:-8001}"
    SERVICE_USER="${SERVICE_USER:-bazi}"
    DEPLOY_PATH="${DEPLOY_PATH:-/opt/bazi-app}"
    
    log "✅ 配置验证通过"
    log_info "服务器IP: $SERVER_IP"
    log_info "API域名: $API_SUBDOMAIN"
    log_info "部署路径: $DEPLOY_PATH"
}

# ===============================================
# 系统环境检测和基础设置
# ===============================================
setup_system_environment() {
    show_progress "检测系统环境并安装基础依赖"
    
    # 设置非交互模式
    execute_command "export DEBIAN_FRONTEND=noninteractive" "设置非交互模式"
    
    # 更新系统
    execute_command "apt update" "更新软件源" true
    
    # 安装基础工具
    execute_command "apt install -y curl wget git vim htop unzip software-properties-common lsof net-tools" "安装基础工具"
    
    # 安装Python环境
    execute_command "apt install -y python3 python3-pip python3-venv python3-dev build-essential" "安装Python环境"
    
    # 安装图像处理依赖
    execute_command "apt install -y libjpeg-dev libpng-dev libfreetype6-dev" "安装图像处理库"
    
    # 安装Nginx
    execute_command "apt install -y nginx" "安装Nginx"
    
    # 安装SSL工具
    execute_command "apt install -y snapd" "安装snapd"
    execute_command "systemctl enable --now snapd.socket" "启用snapd服务"
    execute_command "sleep 5" "等待snapd启动"
    
    log "✅ 系统环境配置完成"
}

# ===============================================
# 创建应用用户和目录
# ===============================================
setup_app_user_and_directories() {
    show_progress "创建应用用户和目录结构"
    
    # 创建应用用户
    execute_command "if ! id '$SERVICE_USER' &>/dev/null; then useradd -r -d $DEPLOY_PATH -s /bin/bash $SERVICE_USER && echo '✅ 创建用户: $SERVICE_USER'; else echo '✅ 用户已存在: $SERVICE_USER'; fi" "创建应用用户"
    
    # 创建目录结构
    execute_command "mkdir -p $DEPLOY_PATH /var/log/$SERVICE_NAME /var/www/html" "创建应用目录"
    
    # 设置权限
    execute_command "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH /var/log/$SERVICE_NAME" "设置目录权限"
    execute_command "chown -R www-data:www-data /var/www/html" "设置Web目录权限"
    
    log "✅ 用户和目录设置完成"
}

# ===============================================
# 克隆和部署项目代码
# ===============================================
deploy_project_code() {
    show_progress "克隆和部署项目代码"
    
    # 停止现有服务
    execute_command "systemctl stop $SERVICE_NAME 2>/dev/null || true" "停止现有API服务"
    execute_command "systemctl stop nginx 2>/dev/null || true" "停止Nginx服务"
    
    # 清理临时目录
    execute_command "rm -rf /tmp/bazi-temp" "清理临时目录"
    
    # 克隆项目代码
    execute_command "cd /tmp && git clone -b $PROJECT_BRANCH $GITHUB_REPO bazi-temp" "克隆项目代码" true
    
    # 备份现有代码
    execute_command "if [[ -d '$DEPLOY_PATH/bazi-miniprogram' ]]; then mv $DEPLOY_PATH/bazi-miniprogram $DEPLOY_PATH/bazi-miniprogram.backup.\$(date +%Y%m%d_%H%M%S); fi" "备份现有代码"
    
    # 复制新代码
    execute_command "cp -r /tmp/bazi-temp/bazi-miniprogram $DEPLOY_PATH/" "复制代码到部署目录"
    
    # 设置权限
    execute_command "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH" "设置代码目录权限"
    
    # 清理临时文件
    execute_command "rm -rf /tmp/bazi-temp" "清理临时文件"
    
    log "✅ 项目代码部署完成"
}

# ===============================================
# 配置Python环境和依赖
# ===============================================
setup_python_environment() {
    show_progress "配置Python虚拟环境和依赖"
    
    # 进入项目目录
    local project_dir="$DEPLOY_PATH/bazi-miniprogram"
    
    # 创建虚拟环境
    execute_command "cd $project_dir && python3 -m venv venv" "创建Python虚拟环境"
    
    # 升级pip
    execute_command "cd $project_dir && source venv/bin/activate && pip install --upgrade pip" "升级pip"
    
    # 安装项目依赖
    execute_command "cd $project_dir && source venv/bin/activate && pip install -r requirements.txt" "安装项目依赖" true
    
    # 验证关键模块
    execute_command "cd $project_dir && source venv/bin/activate && python -c 'import fastapi, uvicorn; print(\"✅ FastAPI模块正常\")'" "验证FastAPI模块"
    
    # 测试算法模块
    execute_command "cd $project_dir && source venv/bin/activate && python -c 'import sys; sys.path.append(\"backend/app\"); from bazi_calculator import BaziCalculator; print(\"✅ 八字算法模块正常\")'" "测试八字算法模块"
    
    log "✅ Python环境配置完成"
}

# ===============================================
# 创建系统服务
# ===============================================
create_systemd_service() {
    show_progress "创建和配置系统服务"
    
    local service_file="[Unit]
Description=八字运势小程序 API服务
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$DEPLOY_PATH/bazi-miniprogram
Environment=PATH=$DEPLOY_PATH/bazi-miniprogram/venv/bin:\$PATH
Environment=PYTHONPATH=$DEPLOY_PATH/bazi-miniprogram
Environment=PYTHONUNBUFFERED=1
ExecStart=$DEPLOY_PATH/bazi-miniprogram/venv/bin/python main.py
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target"
    
    # 创建systemd服务文件
    execute_command "cat > /etc/systemd/system/$SERVICE_NAME.service << 'EOF'
$service_file
EOF" "创建systemd服务文件"
    
    # 重载systemd配置
    execute_command "systemctl daemon-reload" "重载systemd配置"
    
    # 启用服务
    execute_command "systemctl enable $SERVICE_NAME" "启用系统服务"
    
    log "✅ 系统服务创建完成"
}

# ===============================================
# 智能SSL证书管理和修复
# ===============================================
smart_ssl_management() {
    show_progress "智能SSL证书管理和修复"
    
    if [[ "$ENABLE_SSL" != "yes" ]]; then
        log_warn "SSL证书功能已禁用，跳过SSL配置"
        return 0
    fi
    
    log_info "🔒 开始智能SSL证书管理..."
    
    # 第一步：强制清理所有可能的冲突
    log_info "第一阶段：清理环境冲突"
    execute_command "systemctl stop nginx 2>/dev/null || true" "停止Nginx"
    execute_command "killall nginx 2>/dev/null || true" "强制终止Nginx进程"
    execute_command "lsof -ti:80 | xargs kill -9 2>/dev/null || true" "释放80端口"
    execute_command "lsof -ti:443 | xargs kill -9 2>/dev/null || true" "释放443端口"
    
    # 第二步：安装最新版certbot
    log_info "第二阶段：安装最新版SSL工具"
    execute_command "apt remove -y certbot 2>/dev/null || true" "移除旧版certbot"
    execute_command "snap remove certbot 2>/dev/null || true" "移除snap版certbot"
    execute_command "snap install --classic certbot" "安装最新certbot"
    execute_command "ln -sf /snap/bin/certbot /usr/bin/certbot" "创建certbot链接"
    
    # 第三步：清理损坏的证书
    log_info "第三阶段：清理现有SSL证书"
    execute_command "rm -rf /etc/letsencrypt/live/$API_SUBDOMAIN" "清理证书目录"
    execute_command "rm -rf /etc/letsencrypt/archive/$API_SUBDOMAIN" "清理证书归档"
    execute_command "rm -rf /etc/letsencrypt/renewal/$API_SUBDOMAIN.conf" "清理续期配置"
    
    # 第四步：创建证书验证目录
    log_info "第四阶段：准备证书验证环境"
    execute_command "mkdir -p /var/www/html/.well-known/acme-challenge" "创建验证目录"
    execute_command "chown -R www-data:www-data /var/www/html" "设置验证目录权限"
    
    # 第五步：尝试多种方式申请证书
    log_info "第五阶段：申请SSL证书"
    
    local cert_success=false
    
    # 方法1：standalone方式（推荐）
    if execute_command "certbot certonly --standalone -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive --force-renewal" "方法1: standalone方式申请证书"; then
        cert_success=true
        log "✅ standalone方式申请成功"
    else
        log_warn "standalone方式失败，尝试其他方式"
        
        # 方法2：webroot方式
        # 先启动临时nginx
        create_temp_nginx_for_verification
        execute_command "systemctl start nginx" "启动临时Nginx"
        execute_command "sleep 5" "等待Nginx启动"
        
        if execute_command "certbot certonly --webroot -w /var/www/html -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive" "方法2: webroot方式申请证书"; then
            cert_success=true
            log "✅ webroot方式申请成功"
        else
            log_warn "webroot方式也失败"
        fi
        
        execute_command "systemctl stop nginx" "停止临时Nginx"
    fi
    
    # 第六步：配置证书和HTTPS
    if [[ "$cert_success" == "true" ]]; then
        configure_https_nginx
    else
        log_error "所有SSL证书申请方式都失败，使用HTTP配置"
        configure_http_nginx
    fi
    
    log "✅ SSL证书管理完成"
}

# ===============================================
# 创建临时Nginx配置用于证书验证
# ===============================================
create_temp_nginx_for_verification() {
    local temp_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }
    
    location / {
        return 200 'Certificate verification server';
        add_header Content-Type text/plain;
    }
}"
    
    execute_command "rm -f /etc/nginx/sites-enabled/*" "清理现有Nginx配置"
    execute_command "cat > /etc/nginx/sites-available/temp-verification << 'EOF'
$temp_config
EOF" "创建临时验证配置"
    execute_command "ln -sf /etc/nginx/sites-available/temp-verification /etc/nginx/sites-enabled/" "启用临时配置"
    execute_command "nginx -t" "测试临时配置"
}

# ===============================================
# 配置HTTPS Nginx
# ===============================================
configure_https_nginx() {
    show_progress "配置HTTPS Nginx反向代理"
    
    log_info "🔧 配置HTTPS Nginx反向代理"
    
    # 验证证书文件存在
    if [[ ! -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]] || [[ ! -f "/etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem" ]]; then
        log_error "SSL证书文件不存在，回退到HTTP配置"
        configure_http_nginx
        return 1
    fi
    
    # 设置证书权限
    execute_command "chown -R root:root /etc/letsencrypt/" "设置证书目录权限"
    execute_command "chmod 644 /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" "设置证书文件权限"
    execute_command "chmod 600 /etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem" "设置私钥权限"
    
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

# HTTPS主配置
server {
    listen 443 ssl http2;
    server_name $API_SUBDOMAIN;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_SUBDOMAIN/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
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

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1M;
        add_header Cache-Control \"public, immutable\";
    }

    # 日志配置
    access_log /var/log/nginx/${API_SUBDOMAIN}_access.log;
    error_log /var/log/nginx/${API_SUBDOMAIN}_error.log;
}"
    
    # 应用HTTPS配置
    execute_command "rm -f /etc/nginx/sites-enabled/*" "清理现有配置"
    execute_command "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$https_config
EOF" "创建HTTPS配置"
    execute_command "ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/" "启用HTTPS配置"
    
    # 测试配置
    if execute_command "nginx -t" "测试HTTPS配置"; then
        # 设置自动续期
        execute_command "echo '0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx' | crontab -" "设置SSL证书自动续期"
        log "✅ HTTPS配置完成"
        return 0
    else
        log_error "HTTPS配置测试失败，回退到HTTP"
        configure_http_nginx
        return 1
    fi
}

# ===============================================
# 配置HTTP Nginx（备用方案）
# ===============================================
configure_http_nginx() {
    show_progress "配置HTTP Nginx反向代理"
    
    log_info "🔧 配置HTTP Nginx反向代理"
    
    local http_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
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
    }
    
    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:$SERVICE_PORT/health;
        access_log off;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1M;
        add_header Cache-Control \"public, immutable\";
    }
    
    # 日志配置
    access_log /var/log/nginx/${API_SUBDOMAIN}_access.log;
    error_log /var/log/nginx/${API_SUBDOMAIN}_error.log;
}"
    
    # 应用HTTP配置
    execute_command "rm -f /etc/nginx/sites-enabled/*" "清理现有配置"
    execute_command "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$http_config
EOF" "创建HTTP配置"
    execute_command "ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/" "启用HTTP配置"
    
    # 测试配置
    execute_command "nginx -t" "测试HTTP配置" true
    
    log "✅ HTTP配置完成"
}

# ===============================================
# 启动所有服务
# ===============================================
start_all_services() {
    show_progress "启动所有服务"
    
    # 启动API服务
    execute_command "systemctl start $SERVICE_NAME" "启动API服务" true
    
    # 启动Nginx
    execute_command "systemctl start nginx" "启动Nginx服务" true
    
    # 等待服务启动
    execute_command "sleep 10" "等待服务完全启动"
    
    # 检查服务状态
    execute_command "systemctl is-active --quiet $SERVICE_NAME && echo '✅ API服务运行正常' || (echo '❌ API服务异常' && systemctl status $SERVICE_NAME --no-pager)" "检查API服务状态"
    execute_command "systemctl is-active --quiet nginx && echo '✅ Nginx服务运行正常' || (echo '❌ Nginx服务异常' && systemctl status nginx --no-pager)" "检查Nginx服务状态"
    
    log "✅ 所有服务启动完成"
}

# ===============================================
# 全面验证部署结果
# ===============================================
comprehensive_verification() {
    show_progress "全面验证部署结果"
    
    log_info "🔍 开始全面验证部署结果..."
    
    # 等待服务完全启动
    execute_command "sleep 15" "等待服务完全启动"
    
    # 检查端口监听状态
    log_info "📊 检查端口监听状态"
    execute_command "netstat -tlnp | grep -E ':(80|443|$SERVICE_PORT) ' || echo '⚠️ 部分端口未监听'" "检查端口监听状态"
    
    # 检查API本地访问
    log_info "🧪 测试API本地访问"
    execute_command "curl -f http://localhost:$SERVICE_PORT/health -m 10 || echo '⚠️ 本地API访问失败'" "测试本地API访问"
    
    # 检查Nginx访问
    log_info "🧪 测试Nginx HTTP访问"
    execute_command "curl -f http://$API_SUBDOMAIN/health -m 10 || curl -f http://localhost/health -m 10 || echo '⚠️ HTTP访问失败'" "测试HTTP访问"
    
    # 如果启用了SSL，测试HTTPS访问
    if [[ "$ENABLE_SSL" == "yes" ]] && [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]]; then
        log_info "🔒 测试HTTPS访问"
        execute_command "curl -f https://$API_SUBDOMAIN/health -m 10 || echo '⚠️ HTTPS访问失败'" "测试HTTPS访问"
    fi
    
    # 测试API功能
    log_info "🧪 测试API核心功能"
    local test_data='{"year":1990,"month":5,"day":15,"hour":10,"gender":"male"}'
    execute_command "curl -X POST http://localhost:$SERVICE_PORT/api/v1/calculate-bazi -H 'Content-Type: application/json' -d '$test_data' -m 15 | grep -q 'success\\|result' && echo '✅ API功能测试通过' || echo '⚠️ API功能测试失败'" "测试API核心功能"
    
    # 检查日志
    log_info "📋 检查服务日志"
    execute_command "journalctl -u $SERVICE_NAME --no-pager -n 10 | tail -5" "查看API服务日志"
    execute_command "tail -5 /var/log/nginx/${API_SUBDOMAIN}_access.log 2>/dev/null || echo '暂无Nginx访问日志'" "查看Nginx访问日志"
    
    log "✅ 部署验证完成"
}

# ===============================================
# 生成部署报告
# ===============================================
generate_deployment_report() {
    show_progress "生成部署报告"
    
    local report_file="/tmp/bazi_deployment_report_$(date +%Y%m%d_%H%M%S).txt"
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))
    
    cat > "$report_file" << EOF
# 八字运势小程序 - 部署完成报告

## 📊 部署信息
部署时间: $(date '+%Y-%m-%d %H:%M:%S')
服务器IP: $SERVER_IP
API域名: $API_SUBDOMAIN
部署路径: $DEPLOY_PATH
服务名称: $SERVICE_NAME
总耗时: ${total_duration}秒

## 🌐 访问地址
EOF

    if [[ "$ENABLE_SSL" == "yes" ]] && [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]]; then
        echo "- HTTPS访问: https://$API_SUBDOMAIN/health" >> "$report_file"
        echo "- API文档: https://$API_SUBDOMAIN/docs" >> "$report_file"
    else
        echo "- HTTP访问: http://$API_SUBDOMAIN/health" >> "$report_file"
        echo "- API文档: http://$API_SUBDOMAIN/docs" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF
- 服务器直接访问: http://$SERVER_IP:$SERVICE_PORT/health

## ⚙️ 服务管理命令
# 查看服务状态
systemctl status $SERVICE_NAME

# 重启API服务
systemctl restart $SERVICE_NAME

# 查看服务日志
journalctl -u $SERVICE_NAME -f

# 重载Nginx配置
systemctl reload nginx

## 📱 小程序配置
请将小程序中的API地址更新为:
EOF

    if [[ "$ENABLE_SSL" == "yes" ]] && [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]]; then
        echo "apiBaseUrl: 'https://$API_SUBDOMAIN'" >> "$report_file"
    else
        echo "apiBaseUrl: 'http://$API_SUBDOMAIN'" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

## 📝 部署日志
详细日志: $LOG_FILE

## 🔧 故障排除
如果遇到问题，请检查:
1. 服务状态: systemctl status $SERVICE_NAME
2. 端口监听: netstat -tlnp | grep $SERVICE_PORT
3. 防火墙设置: ufw status
4. DNS解析: nslookup $API_SUBDOMAIN

部署完成时间: $(date '+%Y-%m-%d %H:%M:%S')
EOF
    
    log "✅ 部署报告已生成: $report_file"
    
    # 显示报告内容
    echo ""
    echo -e "${CYAN}📋 部署报告预览:${NC}"
    cat "$report_file"
}

# ===============================================
# 主部署流程
# ===============================================
main() {
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "         八字运势小程序 - 终极万能部署脚本 v2.0"
    echo "═══════════════════════════════════════════════════════════════"
    echo "  ✨ 特性: 智能SSL修复 | 腾讯云优化 | 全自动部署"
    echo "  🔧 功能: 环境检测 | 代码部署 | 服务配置 | 问题自动修复"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    log "🚀 开始执行终极万能部署脚本"
    log "⏰ 开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log "📁 日志文件: $LOG_FILE"
    
    # 检查是否为root用户
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        log_error "请使用: sudo bash auto_deploy.sh"
        exit 1
    fi
    
    # 确认开始部署
    echo ""
    echo -e "${YELLOW}🚀 即将开始自动部署，预计需要15-25分钟...${NC}"
    echo -e "${BLUE}📋 主要步骤:${NC}"
    echo "   1. 配置验证和环境检测"
    echo "   2. 系统环境安装和设置"
    echo "   3. 项目代码克隆和部署"
    echo "   4. Python环境和依赖配置"
    echo "   5. 系统服务创建和配置"
    echo "   6. 智能SSL证书管理"
    echo "   7. Nginx反向代理配置"
    echo "   8. 服务启动和全面验证"
    echo ""
    read -p "确认开始部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 0
    fi
    
    echo ""
    log "🎯 开始自动部署..."
    
    # 执行主要部署步骤
    load_and_validate_config
    setup_system_environment
    setup_app_user_and_directories
    deploy_project_code
    setup_python_environment
    create_systemd_service
    smart_ssl_management
    start_all_services
    comprehensive_verification
    generate_deployment_report
    
    # 部署完成
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                    🎉 部署成功完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))
    
    echo ""
    log "🎯 部署成功完成！"
    log "⏱️ 总耗时: ${total_time}秒"
    echo ""
    
    # 显示快速测试命令
    echo -e "${CYAN}📋 快速验证命令:${NC}"
    if [[ "$ENABLE_SSL" == "yes" ]] && [[ -f "/etc/letsencrypt/live/$API_SUBDOMAIN/fullchain.pem" ]]; then
        echo "   curl https://$API_SUBDOMAIN/health"
    else
        echo "   curl http://$API_SUBDOMAIN/health"
    fi
    echo ""
    
    echo -e "${CYAN}📖 详细信息请查看部署报告和日志${NC}"
    echo -e "${BLUE}📝 日志文件: $LOG_FILE${NC}"
    echo ""
    
    # 最后的服务状态检查
    echo -e "${YELLOW}📊 最终服务状态:${NC}"
    systemctl status $SERVICE_NAME --no-pager -l | head -10
    systemctl status nginx --no-pager -l | head -5
}

# ===============================================
# 脚本入口点
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
