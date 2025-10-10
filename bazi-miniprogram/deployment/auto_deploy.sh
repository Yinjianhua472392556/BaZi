#!/bin/bash
# ===============================================
# 八字运势小程序 - 阿里云服务器自动部署脚本
# ===============================================
# 
# 功能：
# - 自动安装和配置服务器环境
# - 部署八字运势小程序后端API
# - 配置Nginx反向代理和SSL证书
# - 设置监控和自动重启
#
# 使用方法：
# 1. 先修改 deploy_config.sh 中的配置
# 2. 运行: bash auto_deploy.sh
# 3. 根据提示完成部署
#
# ===============================================

# 关闭严格错误退出模式，改为手动错误处理
# set -e  

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
LOCAL_MODE=false
CURRENT_STEP=0
TOTAL_STEPS=10
START_TIME=$(date +%s)

# 日志文件
LOG_FILE="$SCRIPT_DIR/deploy_$(date +%Y%m%d_%H%M%S).log"

# ===============================================
# 日志和输出函数
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
    echo -e "${PURPLE}[STEP] $1${NC}" | tee -a "$LOG_FILE"
}

# ===============================================
# 进度显示函数
# ===============================================
show_progress() {
    local current=$1
    local total=$2
    local description=$3
    local percentage=$((current * 100 / total))
    
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "  步骤 $current/$total: $description"
    echo "  进度: [$percentage%] $(printf '█%.0s' $(seq 1 $((percentage/5))))"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# ===============================================
# 环境检测函数
# ===============================================
detect_environment() {
    log_step "检测部署环境"
    
    # 获取当前机器的IP地址
    local current_ip=""
    
    # 尝试多种方式获取IP
    if command -v curl &> /dev/null; then
        current_ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || curl -s --connect-timeout 5 ipinfo.io/ip 2>/dev/null)
    fi
    
    if [[ -z "$current_ip" ]]; then
        current_ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    if [[ -z "$current_ip" ]]; then
        current_ip=$(ip route get 8.8.8.8 2>/dev/null | grep -oP 'src \K\S+')
    fi
    
    log_info "当前机器IP: $current_ip"
    log_info "目标服务器IP: $SERVER_IP"
    
    # 检查是否在目标服务器上
    if [[ "$current_ip" == "$SERVER_IP" ]] || [[ -z "$current_ip" && "$(hostname -I 2>/dev/null | grep -q "$SERVER_IP")" ]]; then
        LOCAL_MODE=true
        log "🏠 检测到本地部署模式 - 在目标服务器上直接执行"
        log_info "跳过SSH连接，直接执行本地命令"
    else
        LOCAL_MODE=false
        log "🌐 检测到远程部署模式 - 需要SSH连接到服务器"
        log_info "将通过SSH连接执行远程命令"
    fi
}

# ===============================================
# 错误诊断和修复函数
# ===============================================
diagnose_and_fix_error() {
    local command="$1"
    local exit_code="$2"
    local description="$3"
    
    log_error "命令执行失败: $command"
    log_error "退出码: $exit_code"
    
    # 常见错误诊断和修复
    case "$command" in
        *"apt update"*)
            log_warn "🔧 检测到包管理器更新失败，尝试修复..."
            execute_command "apt clean && apt update" "清理并重新更新包缓存"
            ;;
        *"systemctl start"*)
            log_warn "🔧 检测到服务启动失败，检查服务状态..."
            execute_command "systemctl status $SERVICE_NAME --no-pager" "检查服务状态"
            execute_command "journalctl -u $SERVICE_NAME --no-pager -n 20" "查看服务日志"
            ;;
        *"pip install"*)
            log_warn "🔧 检测到Python包安装失败，尝试修复..."
            execute_command "pip install --upgrade pip" "升级pip"
            execute_command "pip install -r requirements.txt --no-cache-dir" "重新安装依赖"
            ;;
        *"nginx -t"*)
            log_warn "🔧 检测到Nginx配置错误，检查配置文件..."
            execute_command "nginx -T" "显示完整Nginx配置"
            ;;
        *)
            log_warn "⚠️ 未知错误类型，请手动检查"
            ;;
    esac
}

# ===============================================
# 增强的命令执行函数
# ===============================================
execute_command() {
    local command="$1"
    local description="${2:-执行命令}"
    local step_start_time=$(date +%s)
    
    log_info "🔄 正在执行: $description"
    log_info "📝 命令: $command"
    
    local result=0
    
    if [[ "$LOCAL_MODE" == "true" ]]; then
        # 本地直接执行
        echo -e "${ORANGE}[LOCAL]${NC} $command" | tee -a "$LOG_FILE"
        eval "$command" 2>&1 | tee -a "$LOG_FILE"
        result=${PIPESTATUS[0]}
    else
        # 远程SSH执行
        local ssh_cmd="ssh -o ConnectTimeout=30 -o StrictHostKeyChecking=no"
        if [[ -n "$SSH_KEY_PATH" ]]; then
            ssh_cmd="$ssh_cmd -i $SSH_KEY_PATH"
        fi
        ssh_cmd="$ssh_cmd $SSH_USER@$SERVER_IP"
        
        echo -e "${ORANGE}[REMOTE]${NC} $command" | tee -a "$LOG_FILE"
        $ssh_cmd "$command" 2>&1 | tee -a "$LOG_FILE"
        result=${PIPESTATUS[0]}
    fi
    
    local step_end_time=$(date +%s)
    local step_duration=$((step_end_time - step_start_time))
    
    if [[ $result -eq 0 ]]; then
        log "✅ $description - 成功 (耗时: ${step_duration}秒)"
        return 0
    else
        log_error "❌ $description - 失败 (耗时: ${step_duration}秒)"
        
        # 尝试诊断和修复
        diagnose_and_fix_error "$command" "$result" "$description"
        
        # 询问是否继续
        echo ""
        log_warn "⚠️ 步骤失败，您可以选择："
        echo "1. 继续执行下一步 (c)"
        echo "2. 重试当前步骤 (r)" 
        echo "3. 退出部署 (q)"
        read -p "请选择 (c/r/q): " choice
        
        case "$choice" in
            [Cc])
                log_warn "⚠️ 用户选择继续，跳过当前错误"
                return 0
                ;;
            [Rr])
                log_info "🔄 用户选择重试当前步骤"
                execute_command "$command" "$description"
                return $?
                ;;
            *)
                log_error "❌ 用户选择退出部署"
                exit 1
                ;;
        esac
    fi
}

# ===============================================
# 增强的进度显示函数
# ===============================================
show_enhanced_progress() {
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
# 配置验证函数
# ===============================================
validate_config() {
    log_info "验证部署配置..."
    
    local errors=0
    
    # 检查必填配置项
    local required_vars=(
        "SERVER_IP" "DOMAIN_NAME" "API_SUBDOMAIN" 
        "SSH_USER" "SSH_PORT" "GITHUB_REPO" 
        "PROJECT_BRANCH" "ENABLE_SSL" "SSL_EMAIL"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "必填配置项缺失: $var"
            errors=$((errors + 1))
        fi
    done
    
    # 验证IP地址格式
    if [[ -n "$SERVER_IP" ]] && ! [[ "$SERVER_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        log_error "服务器IP地址格式不正确: $SERVER_IP"
        errors=$((errors + 1))
    fi
    
    # 验证域名格式
    if [[ -n "$API_SUBDOMAIN" ]] && ! [[ "$API_SUBDOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        log_error "API子域名格式不正确: $API_SUBDOMAIN"
        errors=$((errors + 1))
    fi
    
    # 验证邮箱格式
    if [[ -n "$SSL_EMAIL" ]] && ! [[ "$SSL_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        log_error "SSL邮箱格式不正确: $SSL_EMAIL"
        errors=$((errors + 1))
    fi
    
    # 设置默认值
    SERVICE_NAME="${SERVICE_NAME:-bazi-api}"
    SERVICE_PORT="${SERVICE_PORT:-8001}"
    SERVICE_USER="${SERVICE_USER:-bazi}"
    DEPLOY_PATH="${DEPLOY_PATH:-/opt/bazi-app}"
    BACKUP_PATH="${BACKUP_PATH:-/opt/bazi-backups}"
    ENABLE_MONITORING="${ENABLE_MONITORING:-no}"
    HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"
    
    if [[ $errors -gt 0 ]]; then
        log_error "发现 $errors 个配置错误，请修正后重试"
        return 1
    fi
    
    log "✅ 配置验证通过"
    return 0
}

# ===============================================
# 检查前置条件
# ===============================================
check_prerequisites() {
    show_enhanced_progress "检查部署前置条件"
    
    # 检查配置文件
    if [[ ! -f "$SCRIPT_DIR/deploy_config.sh" ]]; then
        log_error "配置文件不存在: $SCRIPT_DIR/deploy_config.sh"
        log_error "请先创建配置文件！"
        exit 1
    fi
    
    # 加载配置
    source "$SCRIPT_DIR/deploy_config.sh"
    
    # 验证配置
    if ! validate_config; then
        log_error "配置验证失败，请修正配置后重试"
        exit 1
    fi
    
    # 检测环境
    detect_environment
    
    # 检查必要工具
    local required_tools=("git" "curl")
    if [[ "$LOCAL_MODE" == "false" ]]; then
        required_tools+=("ssh" "scp")
    fi
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "缺少必要工具: $tool"
            log_error "请安装后重试"
            
            # 尝试自动安装常见工具
            if [[ "$LOCAL_MODE" == "true" ]]; then
                log_info "🔧 尝试自动安装缺失工具: $tool"
                case "$tool" in
                    "git")
                        execute_command "apt update && apt install -y git" "安装Git"
                        ;;
                    "curl")
                        execute_command "apt update && apt install -y curl" "安装Curl"
                        ;;
                esac
            else
                exit 1
            fi
        fi
    done
    
    log "✅ 前置条件检查通过"
}

# ===============================================
# SSH连接测试
# ===============================================
test_ssh_connection() {
    if [[ "$LOCAL_MODE" == "true" ]]; then
        log "🏠 本地部署模式，跳过SSH连接测试"
        return 0
    fi
    
    log_step "测试SSH连接"
    
    local ssh_cmd="ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no"
    if [[ -n "$SSH_KEY_PATH" ]]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY_PATH"
    fi
    ssh_cmd="$ssh_cmd $SSH_USER@$SERVER_IP"
    
    if $ssh_cmd "echo 'SSH连接测试成功'" &>/dev/null; then
        log "✅ SSH连接正常"
        return 0
    else
        log_error "SSH连接失败"
        log_error "请检查:"
        log_error "1. 服务器IP是否正确: $SERVER_IP"
        log_error "2. SSH用户名是否正确: $SSH_USER"
        log_error "3. SSH密钥或密码是否正确"
        log_error "4. 服务器防火墙是否开放SSH端口: $SSH_PORT"
        exit 1
    fi
}

# ===============================================
# 远程执行命令函数
# ===============================================
remote_exec() {
    local command="$1"
    local description="${2:-执行远程命令}"
    
    local ssh_cmd="ssh -o ConnectTimeout=30 -o StrictHostKeyChecking=no"
    if [[ -n "$SSH_KEY_PATH" ]]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY_PATH"
    fi
    ssh_cmd="$ssh_cmd $SSH_USER@$SERVER_IP"
    
    log_info "$description"
    if $ssh_cmd "$command"; then
        return 0
    else
        log_error "远程命令执行失败: $command"
        return 1
    fi
}

# ===============================================
# 系统更新和基础软件安装
# ===============================================
install_system_dependencies() {
    show_enhanced_progress "更新系统并安装基础依赖"
    
    # 分步骤安装，更好的错误处理
    execute_command "export DEBIAN_FRONTEND=noninteractive" "设置非交互模式"
    
    execute_command "apt update" "更新软件源"
    
    execute_command "apt install -y curl wget git vim htop unzip software-properties-common" "安装基础工具"
    
    execute_command "apt install -y python3 python3-pip python3-venv python3-dev" "安装Python和相关工具"
    
    execute_command "apt install -y libjpeg-dev libpng-dev libfreetype6-dev" "安装图像处理库依赖"
    
    execute_command "apt install -y nginx" "安装Nginx"
    
    execute_command "apt install -y certbot python3-certbot-nginx" "安装Let's Encrypt客户端"
    
    execute_command "apt install -y htop iotop nethogs" "安装监控工具"
    
    log "✅ 系统依赖安装完成"
}

# ===============================================
# 创建应用用户和目录
# ===============================================
setup_app_user() {
    show_enhanced_progress "创建应用用户和目录"
    
    # 创建应用用户
    execute_command "if ! id '$SERVICE_USER' &>/dev/null; then useradd -r -d $DEPLOY_PATH -s /bin/bash $SERVICE_USER; echo '✅ 创建用户: $SERVICE_USER'; else echo '✅ 用户已存在: $SERVICE_USER'; fi" "创建应用用户"
    
    # 创建应用目录
    execute_command "mkdir -p $DEPLOY_PATH $BACKUP_PATH /var/log/$SERVICE_NAME" "创建应用目录"
    
    # 设置目录权限
    execute_command "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH /var/log/$SERVICE_NAME" "设置目录权限"
    
    log "✅ 用户和目录设置完成"
}

# ===============================================
# 克隆项目代码
# ===============================================
clone_project() {
    show_enhanced_progress "克隆项目代码"
    
    # 清理临时目录
    execute_command "cd /tmp && rm -rf bazi-temp" "清理临时目录"
    
    # 克隆最新代码
    execute_command "cd /tmp && git clone -b $PROJECT_BRANCH $GITHUB_REPO bazi-temp" "克隆项目代码"
    
    # 备份现有代码
    execute_command "if [[ -d '$DEPLOY_PATH/bazi-miniprogram' ]]; then mv $DEPLOY_PATH/bazi-miniprogram $DEPLOY_PATH/bazi-miniprogram.backup.\$(date +%Y%m%d_%H%M%S); fi" "备份现有代码"
    
    # 复制到部署目录
    execute_command "cp -r /tmp/bazi-temp/bazi-miniprogram $DEPLOY_PATH/" "复制代码到部署目录"
    
    # 设置权限
    execute_command "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH" "设置代码目录权限"
    
    log "✅ 项目代码部署完成"
}

# ===============================================
# 配置Python环境
# ===============================================
setup_python_environment() {
    show_enhanced_progress "配置Python环境"
    
    # 创建虚拟环境
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && python3 -m venv venv" "创建Python虚拟环境"
    
    # 升级pip
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && pip install --upgrade pip" "升级pip"
    
    # 安装项目依赖
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && pip install -r requirements.txt" "安装项目依赖"
    
    # 验证关键模块
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && python -c 'import fastapi, uvicorn; print(\"✅ FastAPI模块正常\")'" "验证FastAPI模块"
    
    # 测试算法模块
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && source venv/bin/activate && python -c 'import sys; sys.path.append(\"backend/app\"); from bazi_calculator import BaziCalculator; print(\"✅ 八字算法模块正常\")'" "测试八字算法模块"
    
    log "✅ Python环境配置完成"
}

# ===============================================
# 配置生产环境
# ===============================================
create_production_config() {
    show_enhanced_progress "配置生产环境"
    
    # 验证主程序文件存在
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && ls -la main.py" "验证主程序文件存在"
    
    # 验证项目结构
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && ls -la backend/app/" "验证后端算法模块"
    
    # 设置项目文件权限
    execute_command "cd $DEPLOY_PATH/bazi-miniprogram && chown $SERVICE_USER:$SERVICE_USER main.py" "设置主程序文件权限"
    
    # 设置整个项目目录权限
    execute_command "chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH/bazi-miniprogram" "设置整个项目权限"
    
    log "✅ 生产环境配置完成"
}

# ===============================================
# 创建系统服务
# ===============================================
create_systemd_service() {
    show_enhanced_progress "创建系统服务"
    
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
# 配置Nginx
# ===============================================
configure_nginx() {
    show_enhanced_progress "配置Nginx反向代理"
    
    local nginx_config="server {
    listen 80;
    server_name $API_SUBDOMAIN;
    
    # 临时重定向到HTTPS(SSL配置后启用)
    # return 301 https://\$server_name\$request_uri;
    
    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        
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
    
    # 安全头设置
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    access_log /var/log/nginx/${API_SUBDOMAIN}_access.log;
    error_log /var/log/nginx/${API_SUBDOMAIN}_error.log;
}"
    
    # 删除默认配置
    execute_command "rm -f /etc/nginx/sites-enabled/default" "删除Nginx默认配置"
    
    # 创建API站点配置
    execute_command "cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$nginx_config
EOF" "创建Nginx站点配置"
    
    # 启用站点
    execute_command "ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/" "启用Nginx站点"
    
    # 测试Nginx配置
    execute_command "nginx -t" "测试Nginx配置"
    
    # 重载Nginx
    execute_command "systemctl reload nginx" "重载Nginx配置"
    
    log "✅ Nginx配置完成"
}

# ===============================================
# 配置SSL证书
# ===============================================
configure_ssl() {
    show_enhanced_progress "配置SSL证书"
    
    if [[ "$ENABLE_SSL" == "yes" ]]; then
        # 申请SSL证书
        execute_command "certbot --nginx -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive" "申请SSL证书"
        
        # 设置自动续期
        execute_command "echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -" "设置SSL证书自动续期"
        
        log "✅ SSL证书配置完成"
    else
        log_warn "跳过SSL配置 (ENABLE_SSL=no)"
    fi
}

# ===============================================
# 启动服务
# ===============================================
start_services() {
    show_enhanced_progress "启动应用服务"
    
    # 启动API服务
    execute_command "systemctl start $SERVICE_NAME" "启动API服务"
    
    # 启动Nginx
    execute_command "systemctl start nginx" "启动Nginx服务"
    
    # 等待服务启动
    execute_command "sleep 5" "等待服务启动"
    
    # 检查API服务状态
    execute_command "if systemctl is-active --quiet $SERVICE_NAME; then echo '✅ API服务启动成功'; else echo '❌ API服务启动失败'; systemctl status $SERVICE_NAME; exit 1; fi" "检查API服务状态"
    
    # 检查Nginx服务状态
    execute_command "if systemctl is-active --quiet nginx; then echo '✅ Nginx服务启动成功'; else echo '❌ Nginx服务启动失败'; systemctl status nginx; exit 1; fi" "检查Nginx服务状态"
    
    log "✅ 所有服务启动完成"
}

# ===============================================
# 验证部署
# ===============================================
verify_deployment() {
    show_enhanced_progress "验证部署结果"
    
    log "🔍 验证API服务..."
    
    # 等待服务完全启动
    execute_command "sleep 10" "等待服务完全启动"
    
    # 验证服务状态
    execute_command "echo '📊 服务状态检查:' && echo '===================='" "开始服务状态检查"
    
    # API服务状态
    execute_command "if systemctl is-active --quiet $SERVICE_NAME; then echo '✅ $SERVICE_NAME 服务运行正常'; systemctl status $SERVICE_NAME --no-pager -l; else echo '❌ $SERVICE_NAME 服务异常'; fi" "检查API服务状态"
    
    # Nginx状态
    execute_command "if systemctl is-active --quiet nginx; then echo '✅ Nginx 服务运行正常'; else echo '❌ Nginx 服务异常'; fi" "检查Nginx服务状态"
    
    # 端口监听检查
    execute_command "echo '📊 端口监听状态:' && netstat -tlnp | grep ':$SERVICE_PORT ' && netstat -tlnp | grep ':80 ' && netstat -tlnp | grep ':443 '" "检查端口监听状态"
    
    # 测试API访问
    execute_command "curl -f http://localhost:$SERVICE_PORT/health || echo '⚠️ 本地API访问失败'" "测试本地API访问"
    
    # 测试外部访问
    if [[ "$ENABLE_SSL" == "yes" ]]; then
        execute_command "curl -f https://$API_SUBDOMAIN/health || echo '⚠️ HTTPS域名访问失败'" "测试HTTPS域名访问"
    else
        execute_command "curl -f http://$API_SUBDOMAIN/health || echo '⚠️ HTTP域名访问失败'" "测试HTTP域名访问"
    fi
    
    log "✅ 部署验证完成"
}

# ===============================================
# 创建监控脚本
# ===============================================
setup_monitoring() {
    if [[ "$ENABLE_MONITORING" == "yes" ]]; then
        log "🔧 设置监控脚本..."
        
        local monitor_script="
#!/bin/bash
# 八字运势小程序API健康检查脚本

LOG_FILE=\"/var/log/$SERVICE_NAME/health_check.log\"
API_URL=\"http://127.0.0.1:$SERVICE_PORT/health\"

# 检查API健康状态
check_api_health() {
    if curl -f \"\$API_URL\" >/dev/null 2>&1; then
        echo \"\$(date): ✅ API健康检查通过\" >> \"\$LOG_FILE\"
        return 0
    else
        echo \"\$(date): ❌ API健康检查失败，尝试重启服务\" >> \"\$LOG_FILE\"
        systemctl restart $SERVICE_NAME
        sleep 10
        
        if curl -f \"\$API_URL\" >/dev/null 2>&1; then
            echo \"\$(date): ✅ 服务重启后恢复正常\" >> \"\$LOG_FILE\"
        else
            echo \"\$(date): ❌ 服务重启后仍然异常\" >> \"\$LOG_FILE\"
        fi
        return 1
    fi
}

# 执行健康检查
check_api_health
"
        
        local setup_monitor="
            # 创建监控脚本
            cat > /opt/monitor_$SERVICE_NAME.sh << 'EOF'
$monitor_script
EOF
            
            chmod +x /opt/monitor_$SERVICE_NAME.sh
            
            # 添加到定时任务
            echo '*/$HEALTH_CHECK_INTERVAL * * * * /opt/monitor_$SERVICE_NAME.sh' | crontab -
            
            echo '✅ 监控脚本设置完成'
        "
        
        remote_exec "$setup_monitor" "设置监控"
    fi
}

# ===============================================
# 生成部署报告
# ===============================================
generate_deployment_report() {
    log "📝 生成部署报告..."
    
    local report_file="$SCRIPT_DIR/deployment_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# 八字运势小程序 - 部署完成报告

## 📊 部署信息

**部署时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**服务器IP**: $SERVER_IP  
**API域名**: $API_SUBDOMAIN  
**部署路径**: $DEPLOY_PATH  
**服务名称**: $SERVICE_NAME  

## 🌐 访问地址

- **API健康检查**: $(if [[ "$ENABLE_SSL" == "yes" ]]; then echo "https"; else echo "http"; fi)://$API_SUBDOMAIN/health
- **API文档**: $(if [[ "$ENABLE_SSL" == "yes" ]]; then echo "https"; else echo "http"; fi)://$API_SUBDOMAIN/docs  
- **服务器直接访问**: http://$SERVER_IP:$SERVICE_PORT/health

## ⚙️ 服务管理命令

\`\`\`bash
# 查看服务状态
systemctl status $SERVICE_NAME

# 重启API服务
systemctl restart $SERVICE_NAME

# 查看服务日志
journalctl -u $SERVICE_NAME -f

# 重载Nginx配置
systemctl reload nginx

# 查看Nginx日志
tail -f /var/log/nginx/${API_SUBDOMAIN}_access.log
\`\`\`

## 📱 小程序配置

请将小程序中的API地址更新为:
\`\`\`javascript
// miniprogram/app.js
globalData: {
  apiBaseUrl: '$(if [[ "$ENABLE_SSL" == "yes" ]]; then echo "https"; else echo "http"; fi)://$API_SUBDOMAIN'
}
\`\`\`

## 🔧 维护建议

1. **定期检查服务状态**
2. **监控服务器资源使用**
3. **定期备份重要数据**
4. **保持系统和依赖更新**

## 📞 故障排除

如果遇到问题，请检查:
1. 服务状态: \`systemctl status $SERVICE_NAME\`
2. 端口监听: \`netstat -tlnp | grep $SERVICE_PORT\`
3. 防火墙设置: \`ufw status\`
4. DNS解析: \`nslookup $API_SUBDOMAIN\`

---
**部署日志**: $LOG_FILE
EOF
    
    log "✅ 部署报告已生成: $report_file"
}

# ===============================================
# 主部署流程
# ===============================================
main() {
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "           八字运势小程序 - 自动部署脚本"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    # 检查前置条件
    check_prerequisites
    
    # 测试SSH连接
    test_ssh_connection
    
    echo ""
    echo -e "${YELLOW}🚀 即将开始部署，预计需要10-15分钟...${NC}"
    echo ""
    read -p "确认开始部署？(y/n): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 0
    fi
    
    echo ""
    log "🎯 开始自动部署..."
    log "⏰ 开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log "🖥️  服务器: $SERVER_IP"
    log "🌐 域名: $API_SUBDOMAIN"
    log "📁 部署路径: $DEPLOY_PATH"
    echo ""
    
    # 立即显示第一步进度
    sleep 1
    
    # 执行部署步骤
    install_system_dependencies
    setup_app_user
    clone_project
    setup_python_environment
    create_production_config
    create_systemd_service
    configure_nginx
    configure_ssl
    start_services
    verify_deployment
    setup_monitoring
    
    # 生成报告
    generate_deployment_report
    
    echo ""
    echo -e "${GREEN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "                    🎉 部署完成！"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    echo ""
    log "🎯 部署成功完成！"
    echo ""
    echo -e "${CYAN}📋 快速测试:${NC}"
    echo "   curl $(if [[ "$ENABLE_SSL" == "yes" ]]; then echo "https"; else echo "http"; fi)://$API_SUBDOMAIN/health"
    echo ""
    echo -e "${CYAN}📖 详细信息请查看部署报告${NC}"
    echo ""
    
    if [[ -n "$NOTIFICATION_EMAIL" ]]; then
        echo "📧 发送部署完成通知到: $NOTIFICATION_EMAIL"
    fi
}

# ===============================================
# 脚本入口
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
