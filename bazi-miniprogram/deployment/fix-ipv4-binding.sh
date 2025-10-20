#!/bin/bash

# =============================================================================
# 腾讯云FRP IPv4绑定修复脚本
# 解决FRP只绑定IPv6导致的连接问题
# =============================================================================

echo "🔧 FRP IPv4绑定修复脚本"
echo "========================="
echo "修复时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "开始修复FRP IPv4绑定问题..."

# 1. 停止FRP服务
log_info "步骤1: 停止FRP服务"
systemctl stop frps-reverse
sleep 2

# 2. 备份原配置
log_info "步骤2: 备份原配置文件"
if [ -f "/opt/frp-reverse/frps.toml" ]; then
    cp /opt/frp-reverse/frps.toml /opt/frp-reverse/frps.toml.backup.$(date +%s)
    log_info "原配置已备份"
fi

# 3. 创建新的IPv4兼容配置
log_info "步骤3: 创建IPv4兼容配置"
cat > /opt/frp-reverse/frps.toml << 'EOF'
# FRP反向代理服务器配置 - IPv4兼容版本
# 修复IPv6绑定问题，确保IPv4连接正常

bindAddr = "0.0.0.0"
bindPort = 7000
auth.method = "token"
auth.token = "mac-proxy-secure-token-2024"

# 日志配置
log.to = "/var/log/frps-reverse.log"
log.level = "info"
log.maxDays = 7

# 允许的端口范围
allowPorts = [
  { start = 8300, end = 8500 },
  { start = 9000, end = 9200 }
]

# 限制配置
transport.maxPoolCount = 10
EOF

log_info "新配置文件已创建"

# 4. 重启服务
log_info "步骤4: 启动FRP服务"
systemctl start frps-reverse
sleep 3

# 5. 验证服务状态
log_info "步骤5: 验证服务状态"
echo ""
echo "=== 服务状态 ==="
systemctl status frps-reverse --no-pager -l

echo ""
echo "=== 端口绑定检查 ==="
log_info "检查端口绑定情况:"
netstat -tuln | grep 7000

echo ""
echo "=== 进程状态 ==="
ps aux | grep frps | grep -v grep

echo ""
echo "=== IPv4连接测试 ==="
log_info "测试本地IPv4连接..."
if nc -z 127.0.0.1 7000; then
    log_info "✅ IPv4本地连接测试成功"
else
    log_error "❌ IPv4本地连接测试失败"
fi

echo ""
echo "=== 配置文件内容 ==="
log_info "当前配置文件内容:"
cat /opt/frp-reverse/frps.toml

echo ""
log_info "修复完成！"
echo ""
echo "预期结果:"
echo "- 应该看到 0.0.0.0:7000 监听 (IPv4)"
echo "- 服务状态应该是 active (running)"
echo "- 本地IPv4连接测试应该成功"
echo ""
echo "如果看到以上结果，说明修复成功！"
echo "现在可以在Mac端测试连接了。"
