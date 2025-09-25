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

set -e  # 遇到错误立即退出

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
NC='\033[0m' # No Color

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
# 检查前置条件
# ===============================================
check_prerequisites() {
    log_step "检查部署前置条件"
    
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
    
    # 检查必要工具
    local required_tools=("ssh" "scp" "git" "curl")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "缺少必要工具: $tool"
            log_error "请安装后重试"
            exit 1
        fi
    done
    
    log "✅ 前置条件检查通过"
}

# ===============================================
# SSH连接测试
# ===============================================
test_ssh_connection() {
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
    show_progress 1 10 "更新系统并安装基础依赖"
    
    local install_script='
        export DEBIAN_FRONTEND=noninteractive
        
        # 更新软件源
        apt update
        
        # 安装基础工具
        apt install -y curl wget git vim htop unzip software-properties-common
        
        # 安装Python和相关工具
        apt install -y python3 python3-pip python3-venv python3-dev
        
        # 安装图像处理库依赖
        apt install -y libjpeg-dev libpng-dev libfreetype6-dev
        
        # 安装Nginx
        apt install -y nginx
        
        # 安装Let'\''s Encrypt客户端
        apt install -y certbot python3-certbot-nginx
        
        # 安装监控工具
        apt install -y htop iotop nethogs
        
        echo "✅ 系统依赖安装完成"
    '
    
    remote_exec "$install_script" "安装系统依赖"
}

# ===============================================
# 创建应用用户和目录
# ===============================================
setup_app_user() {
    show_progress 2 10 "创建应用用户和目录"
    
    local setup_script="
        # 创建应用用户
        if ! id '$SERVICE_USER' &>/dev/null; then
            useradd -r -d $DEPLOY_PATH -s /bin/bash $SERVICE_USER
            echo '✅ 创建用户: $SERVICE_USER'
        else
            echo '✅ 用户已存在: $SERVICE_USER'
        fi
        
        # 创建应用目录
        mkdir -p $DEPLOY_PATH
        mkdir -p $BACKUP_PATH
        mkdir -p /var/log/$SERVICE_NAME
        
        # 设置目录权限
        chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH
        chown -R $SERVICE_USER:$SERVICE_USER /var/log/$SERVICE_NAME
        
        echo '✅ 目录创建完成'
    "
    
    remote_exec "$setup_script" "设置应用用户和目录"
}

# ===============================================
# 克隆项目代码
# ===============================================
clone_project() {
    show_progress 3 10 "克隆项目代码"
    
    local clone_script="
        cd /tmp
        
        # 删除旧的代码(如果存在)
        rm -rf bazi-temp
        
        # 克隆最新代码
        git clone -b $PROJECT_BRANCH $GITHUB_REPO bazi-temp
        
        # 复制到部署目录
        if [[ -d '$DEPLOY_PATH/bazi-miniprogram' ]]; then
            # 备份现有代码
            mv $DEPLOY_PATH/bazi-miniprogram $DEPLOY_PATH/bazi-miniprogram.backup.\$(date +%Y%m%d_%H%M%S)
        fi
        
        cp -r bazi-temp/bazi-miniprogram $DEPLOY_PATH/
        
        # 设置权限
        chown -R $SERVICE_USER:$SERVICE_USER $DEPLOY_PATH
        
        echo '✅ 项目代码克隆完成'
    "
    
    remote_exec "$clone_script" "克隆项目代码"
}

# ===============================================
# 配置Python环境
# ===============================================
setup_python_environment() {
    show_progress 4 10 "配置Python环境"
    
    local python_script="
        cd $DEPLOY_PATH/bazi-miniprogram
        
        # 创建虚拟环境
        python3 -m venv venv
        
        # 激活虚拟环境并安装依赖
        source venv/bin/activate
        
        # 升级pip
        pip install --upgrade pip
        
        # 安装项目依赖
        pip install -r requirements.txt
        
        # 验证关键模块
        python -c 'import fastapi, uvicorn; print(\"✅ FastAPI模块正常\")'
        
        # 测试算法模块
        python -c '
import sys
sys.path.append(\"backend/app\")
try:
    from bazi_calculator import BaziCalculator
    print(\"✅ 八字算法模块正常\")
except Exception as e:
    print(f\"⚠️ 八字算法模块警告: {e}\")
        '
        
        echo '✅ Python环境配置完成'
    "
    
    remote_exec "$python_script" "配置Python环境"
}

# ===============================================
# 创建生产环境配置
# ===============================================
create_production_config() {
    show_progress 5 10 "创建生产环境配置"
    
    # 创建生产环境服务器文件
    local production_server="
#!/usr/bin/env python3
\"\"\"
八字运势小程序 - 生产环境FastAPI服务器
\"\"\"

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend/app'))

from real_algorithm_server import app
import uvicorn

if __name__ == \"__main__\":
    uvicorn.run(
        \"production_server:app\",
        host=\"127.0.0.1\",  # 只监听本地，通过Nginx代理
        port=$SERVICE_PORT,
        workers=2,          # 生产环境使用多进程
        log_level=\"info\",
        access_log=True,
        reload=False        # 生产环境关闭自动重载
    )
"
    
    local config_script="
        cd $DEPLOY_PATH/bazi-miniprogram
        
        # 创建生产环境启动脚本
        cat > production_server.py << 'EOF'
$production_server
EOF
        
        # 设置权限
        chown $SERVICE_USER:$SERVICE_USER production_server.py
        chmod +x production_server.py
        
        echo '✅ 生产环境配置创建完成'
    "
    
    remote_exec "$config_script" "创建生产环境配置"
}

# ===============================================
# 创建系统服务
# ===============================================
create_systemd_service() {
    show_progress 6 10 "创建系统服务"
    
    local service_file="
[Unit]
Description=八字运势小程序 API服务
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$DEPLOY_PATH/bazi-miniprogram
Environment=PATH=$DEPLOY_PATH/bazi-miniprogram/venv/bin:\$PATH
Environment=PYTHONPATH=$DEPLOY_PATH/bazi-miniprogram
ExecStart=$DEPLOY_PATH/bazi-miniprogram/venv/bin/python production_server.py
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
"
    
    local service_script="
        # 创建systemd服务文件
        cat > /etc/systemd/system/$SERVICE_NAME.service << 'EOF'
$service_file
EOF
        
        # 重载systemd配置
        systemctl daemon-reload
        
        # 启用服务
        systemctl enable $SERVICE_NAME
        
        echo '✅ 系统服务创建完成'
    "
    
    remote_exec "$service_script" "创建系统服务"
}

# ===============================================
# 配置Nginx
# ===============================================
configure_nginx() {
    show_progress 7 10 "配置Nginx反向代理"
    
    local nginx_config="
server {
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
}
"
    
    local nginx_script="
        # 删除默认配置
        rm -f /etc/nginx/sites-enabled/default
        
        # 创建API站点配置
        cat > /etc/nginx/sites-available/$SERVICE_NAME << 'EOF'
$nginx_config
EOF
        
        # 启用站点
        ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
        
        # 测试Nginx配置
        nginx -t
        
        # 重载Nginx
        systemctl reload nginx
        
        echo '✅ Nginx配置完成'
    "
    
    remote_exec "$nginx_script" "配置Nginx"
}

# ===============================================
# 配置SSL证书
# ===============================================
configure_ssl() {
    show_progress 8 10 "配置SSL证书"
    
    if [[ "$ENABLE_SSL" == "yes" ]]; then
        local ssl_script="
            # 申请SSL证书
            certbot --nginx -d $API_SUBDOMAIN --email $SSL_EMAIL --agree-tos --non-interactive
            
            # 设置自动续期
            echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -
            
            echo '✅ SSL证书配置完成'
        "
        
        remote_exec "$ssl_script" "配置SSL证书"
    else
        log_warn "跳过SSL配置 (ENABLE_SSL=no)"
    fi
}

# ===============================================
# 启动服务
# ===============================================
start_services() {
    show_progress 9 10 "启动应用服务"
    
    local start_script="
        # 启动API服务
        systemctl start $SERVICE_NAME
        
        # 启动Nginx
        systemctl start nginx
        
        # 检查服务状态
        sleep 5
        
        if systemctl is-active --quiet $SERVICE_NAME; then
            echo '✅ API服务启动成功'
        else
            echo '❌ API服务启动失败'
            systemctl status $SERVICE_NAME
            exit 1
        fi
        
        if systemctl is-active --quiet nginx; then
            echo '✅ Nginx服务启动成功'
        else
            echo '❌ Nginx服务启动失败'
            systemctl status nginx
            exit 1
        fi
    "
    
    remote_exec "$start_script" "启动服务"
}

# ===============================================
# 验证部署
# ===============================================
verify_deployment() {
    show_progress 10 10 "验证部署结果"
    
    log "🔍 验证API服务..."
    
    # 测试HTTP访问
    if curl -f "http://$SERVER_IP:$SERVICE_PORT/health" >/dev/null 2>&1; then
        log "✅ 直接API访问正常"
    else
        log_warn "⚠️ 直接API访问失败"
    fi
    
    # 测试通过域名访问
    local test_url="http://$API_SUBDOMAIN/health"
    if [[ "$ENABLE_SSL" == "yes" ]]; then
        test_url="https://$API_SUBDOMAIN/health"
    fi
    
    if curl -f "$test_url" >/dev/null 2>&1; then
        log "✅ 域名访问正常: $test_url"
    else
        log_warn "⚠️ 域名访问失败，可能需要配置DNS解析"
    fi
    
    # 验证服务状态
    local verify_script="
        echo '📊 服务状态检查:'
        echo '===================='
        
        # API服务状态
        if systemctl is-active --quiet $SERVICE_NAME; then
            echo '✅ $SERVICE_NAME 服务运行正常'
            echo '📊 服务详情:'
            systemctl status $SERVICE_NAME --no-pager -l
        else
            echo '❌ $SERVICE_NAME 服务异常'
        fi
        
        # Nginx状态
        if systemctl is-active --quiet nginx; then
            echo '✅ Nginx 服务运行正常'
        else
            echo '❌ Nginx 服务异常'
        fi
        
        # 端口监听检查
        echo '📊 端口监听状态:'
        netstat -tlnp | grep ':$SERVICE_PORT '
        netstat -tlnp | grep ':80 '
        netstat -tlnp | grep ':443 '
        
        echo '✅ 验证完成'
    "
    
    remote_exec "$verify_script" "验证服务状态"
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
    echo ""
    
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
