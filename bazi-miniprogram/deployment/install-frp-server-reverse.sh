#!/bin/bash

# =============================================================================
# 腾讯云服务器 FRP 反向代理一键安装脚本（修复版本）
# 功能: 让外网电脑通过腾讯云服务器连接到本地Mac的代理服务
# 架构: 外网电脑 → 腾讯云(119.91.146.128) → 本地Mac代理
# =============================================================================

set -e

echo "🚀 腾讯云FRP反向代理服务器安装脚本（双栈版本）"
echo "============================================"
echo "功能: 外网访问本地Mac代理服务"
echo "服务器IP: 119.91.146.128"
echo "开始时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 sudo 权限运行此脚本"
        exit 1
    fi
}

# 检测并清理现有服务
cleanup_existing_service() {
    log_info "检测现有FRP服务..."
    
    # 检查是否存在现有服务
    if systemctl is-active --quiet frps-reverse 2>/dev/null; then
        log_warn "检测到现有的frps-reverse服务正在运行"
        echo "当前服务状态:"
        systemctl status frps-reverse --no-pager -l | head -10
        echo ""
        
        read -p "是否停止并重新配置现有服务? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "停止现有服务..."
            systemctl stop frps-reverse
            systemctl disable frps-reverse 2>/dev/null || true
            
            # 备份现有配置
            if [ -d "/opt/frp-reverse" ]; then
                BACKUP_DIR="/opt/frp-reverse-backup-$(date +%s)"
                log_info "备份现有配置到: $BACKUP_DIR"
                cp -r /opt/frp-reverse $BACKUP_DIR
            fi
            
            log_info "清理完成"
        else
            log_error "已取消安装，现有服务保持不变"
            exit 0
        fi
    elif systemctl list-unit-files | grep -q frps-reverse; then
        log_warn "检测到frps-reverse服务配置文件，但服务未运行"
        systemctl disable frps-reverse 2>/dev/null || true
        log_info "已清理服务配置"
    fi
    
    # 检查其他FRP进程
    if pgrep -f "frps" > /dev/null; then
        log_warn "检测到其他FRP服务器进程："
        ps aux | grep frps | grep -v grep
        echo ""
        read -p "是否强制终止所有FRP服务器进程? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pkill -f "frps" || true
            log_info "FRP进程已清理"
        fi
    fi
    
    # 检查端口占用
    if ss -tuln | grep -q ":7000 "; then
        log_warn "端口7000被占用："
        ss -tuln | grep ":7000 "
        log_warn "如果是其他FRP服务，建议先停止"
    fi
}

# 检测端口是否被占用
check_port() {
    local port=$1
    if ss -tuln | grep -q ":$port "; then
        return 1  # 端口被占用
    else
        return 0  # 端口可用
    fi
}

# 智能选择可用端口
select_available_ports() {
    log_info "检测可用端口..."
    
    # FRP控制端口 (默认7000)
    FRP_BIND_PORT=7000
    if ! check_port $FRP_BIND_PORT; then
        log_warn "端口 $FRP_BIND_PORT 被占用，尝试其他端口..."
        for port in 7001 7002 7003 7010 7020; do
            if check_port $port; then
                FRP_BIND_PORT=$port
                break
            fi
        done
    fi
    
    # 外网访问端口 (默认8388，供外网电脑连接)
    PUBLIC_PROXY_PORT=8388
    if ! check_port $PUBLIC_PROXY_PORT; then
        log_warn "端口 $PUBLIC_PROXY_PORT 被占用，尝试其他端口..."
        for port in 8389 8390 8391 8488 8588; do
            if check_port $port; then
                PUBLIC_PROXY_PORT=$port
                break
            fi
        done
    fi
    
    log_info "选定端口: FRP控制=$FRP_BIND_PORT, 外网访问=$PUBLIC_PROXY_PORT"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt update -qq
    apt install -y wget curl net-tools unzip
}

# 下载并安装FRP
install_frp() {
    log_info "安装FRP服务器..."
    
    # 创建FRP目录
    mkdir -p /opt/frp-reverse
    cd /opt/frp-reverse
    
    # 下载FRP
    FRP_VERSION="0.52.3"
    wget -q https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz
    
    # 解压
    tar -xzf frp_${FRP_VERSION}_linux_amd64.tar.gz
    mv frp_${FRP_VERSION}_linux_amd64/* .
    chmod +x frps frpc
    
    # 清理下载文件
    rm -rf frp_${FRP_VERSION}_linux_amd64*
    
    log_info "FRP安装完成"
}

# 创建FRP服务器配置（双栈支持）
create_frp_config() {
    log_info "创建FRP反向代理配置（支持IPv4+IPv6双栈）..."
    
    # 使用固定token
    TOKEN="mac-proxy-secure-token-2024"
    
    cat > /opt/frp-reverse/frps.toml << EOF
# FRP反向代理服务器配置 - 腾讯云专用（双栈版本）
# 架构: 外网电脑 → 腾讯云 → 本地Mac代理
# 网络: 同时支持IPv4和IPv6连接
# 生成时间: $(date)

# 双栈绑定 - 同时监听IPv4和IPv6
bindAddr = "::"
bindPort = $FRP_BIND_PORT

# 身份验证
auth.method = "token"
auth.token = "$TOKEN"

# 日志配置
log.to = "/var/log/frps-reverse.log"
log.level = "info"
log.maxDays = 7


# 允许的端口范围
allowPorts = [
  { start = 8300, end = 8500 },
  { start = 9000, end = 9200 }
]

# 传输配置
transport.maxPoolCount = 10
transport.heartbeatInterval = 30
transport.heartbeatTimeout = 90

# 双栈优化配置
transport.tcpMux = true
EOF

    # 创建备用IPv4专用配置
    cat > /opt/frp-reverse/frps-ipv4.toml << EOF
# FRP反向代理服务器配置 - IPv4专用备用版本
# 如果双栈配置有问题，可切换使用此配置

bindAddr = "0.0.0.0"
bindPort = $FRP_BIND_PORT

auth.method = "token"
auth.token = "$TOKEN"

log.to = "/var/log/frps-reverse.log"
log.level = "info"
log.maxDays = 7

# 强制IPv4
transport.tcpMux = false

allowPorts = [
  { start = 8300, end = 8500 },
  { start = 9000, end = 9200 }
]

transport.maxPoolCount = 10
EOF

    # 保存配置信息
    cat > /opt/frp-reverse/server-info.txt << EOF
FRP反向代理服务器配置信息（双栈版本）
===========================================
服务器IP: 119.91.146.128
网络支持: IPv4 + IPv6 双栈
FRP控制端口: $FRP_BIND_PORT
外网访问端口: $PUBLIC_PROXY_PORT
认证Token: $TOKEN

架构说明:
外网电脑 → 119.91.146.128:$PUBLIC_PROXY_PORT → 本地Mac代理

网络特性:
• 同时支持IPv4和IPv6客户端连接
• 自动适配客户端网络协议
• 提供IPv4专用备用配置

配置文件:
• 主配置: /opt/frp-reverse/frps.toml (双栈)
• 备用配置: /opt/frp-reverse/frps-ipv4.toml (IPv4专用)

切换到IPv4专用配置方法:
systemctl stop frps-reverse
cp /opt/frp-reverse/frps-ipv4.toml /opt/frp-reverse/frps.toml
systemctl start frps-reverse

生成时间: $(date)
===========================================
EOF

    log_info "双栈配置文件已创建"
    log_info "认证Token: $TOKEN"
    log_info "支持协议: IPv4 + IPv6"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙规则..."
    
    # 检查ufw是否安装
    if command -v ufw > /dev/null; then
        # 开放必要端口
        ufw allow $FRP_BIND_PORT/tcp comment "FRP控制端口"
        ufw allow $PUBLIC_PROXY_PORT/tcp comment "外网访问代理端口"
        
        # 确保SSH端口开放
        ufw allow 22/tcp comment "SSH"
        
        # 如果ufw未启用，询问是否启用
        if ! ufw status | grep -q "Status: active"; then
            log_warn "防火墙未启用，为安全起见建议启用"
            read -p "是否启用防火墙? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ufw --force enable
                log_info "防火墙已启用"
            fi
        fi
    else
        log_warn "未检测到ufw防火墙，请手动配置防火墙规则"
        log_warn "需要开放端口: $FRP_BIND_PORT, $PUBLIC_PROXY_PORT"
    fi
}

# 创建系统服务
create_system_service() {
    log_info "创建系统服务..."
    
    cat > /etc/systemd/system/frps-reverse.service << EOF
[Unit]
Description=FRP Reverse Proxy Server (Dual Stack)
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
Restart=always
RestartSec=5
ExecStart=/opt/frp-reverse/frps -c /opt/frp-reverse/frps.toml
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=process
Delegate=yes
LimitNOFILE=1048576
LimitNPROC=1048576
LimitCORE=infinity
TasksMax=infinity

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载systemd
    systemctl daemon-reload
    systemctl enable frps-reverse
    
    log_info "系统服务已创建"
}

# 启动服务
start_service() {
    log_info "启动FRP反向代理服务..."
    
    systemctl start frps-reverse
    sleep 3
    
    if systemctl is-active --quiet frps-reverse; then
        log_info "✅ FRP反向代理服务启动成功"
    else
        log_error "❌ FRP反向代理服务启动失败"
        log_error "查看日志: journalctl -u frps-reverse -f"
        exit 1
    fi
}

# 显示配置信息和验证
show_result() {
    echo ""
    echo "🎉 FRP反向代理服务器安装完成！"
    echo "=================================================="
    cat /opt/frp-reverse/server-info.txt
    echo ""
    
    # 验证双栈绑定
    echo "🔍 验证双栈绑定状态："
    echo "--------------------------------"
    
    # 检查端口绑定
    log_info "检查端口绑定情况："
    if netstat -tuln | grep -q ":$FRP_BIND_PORT "; then
        echo "✅ FRP服务端口 $FRP_BIND_PORT 已绑定"
        
        # 检查IPv4绑定
        if netstat -4tuln | grep -q ":$FRP_BIND_PORT "; then
            echo "✅ IPv4 支持正常"
        else
            echo "⚠️  IPv4 绑定检测未通过"
        fi
        
        # 检查IPv6绑定
        if netstat -6tuln | grep -q ":$FRP_BIND_PORT "; then
            echo "✅ IPv6 支持正常"
        else
            echo "⚠️  IPv6 绑定检测未通过"
        fi
    else
        echo "❌ FRP服务端口绑定失败"
    fi
    
    echo ""
    echo "📱 使用说明："
    echo "1. 在您的Mac上运行代理服务 (Shadowsocks等)"
    echo "2. 在Mac上配置FRP客户端连接到此服务器"
    echo "3. 外网电脑连接 119.91.146.128:$PUBLIC_PROXY_PORT 即可使用代理"
    echo "4. 支持IPv4和IPv6客户端自动连接"
    echo ""
    echo "🔧 管理命令："
    echo "启动服务: systemctl start frps-reverse"
    echo "停止服务: systemctl stop frps-reverse"
    echo "重启服务: systemctl restart frps-reverse"
    echo "查看状态: systemctl status frps-reverse"
    echo "查看日志: tail -f /var/log/frps-reverse.log"
    echo ""
    echo "🌐 双栈管理："
    echo "检查绑定: netstat -tuln | grep $FRP_BIND_PORT"
    echo "切换IPv4: cp /opt/frp-reverse/frps-ipv4.toml /opt/frp-reverse/frps.toml && systemctl restart frps-reverse"
    echo "还原双栈: 重新运行此安装脚本"
    echo ""
    
    # 将配置信息保存到Mac配置文件
    cat > /tmp/mac-reverse-config.env << EOF
# Mac端反向代理配置信息（双栈版本）
SERVER_IP=119.91.146.128
FRP_PORT=$FRP_BIND_PORT
PUBLIC_PROXY_PORT=$PUBLIC_PROXY_PORT
AUTH_TOKEN=$TOKEN
DUAL_STACK=true
IPV4_FALLBACK_CONFIG=/opt/frp-reverse/frps-ipv4.toml
EOF
    
    log_info "Mac配置文件已生成: /tmp/mac-reverse-config.env"
    log_info "请将此文件内容复制到Mac电脑使用"
    
    # 最终提示
    echo ""
    echo "🎯 重要提示："
    echo "• 此服务器现在同时支持IPv4和IPv6客户端"
    echo "• 如果遇到连接问题，可切换到IPv4专用模式"
    echo "• Mac端将自动适配最佳网络协议连接"
    echo "• 简化配置，无Web管理界面，更安全高效"
}

# 主函数
main() {
    echo "⚠️  确认架构理解："
    echo "外网电脑 → 腾讯云服务器(119.91.146.128) → 您的Mac代理"
    echo "外网电脑将通过腾讯云连接到您Mac上的代理服务"
    echo ""
    read -p "确认这是您需要的架构吗? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消安装"
        exit 0
    fi
    
    check_root
    cleanup_existing_service
    select_available_ports
    update_system
    install_frp
    create_frp_config
    configure_firewall
    create_system_service
    start_service
    show_result
}

# 运行主函数
main "$@"
