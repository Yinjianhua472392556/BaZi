#!/bin/bash

# 腾讯云服务器FRP服务完全清理脚本
# 执行此脚本将彻底清除所有FRP相关服务和资源

echo "🧹 腾讯云服务器FRP服务完全清理脚本"
echo "======================================"
echo "警告：此脚本将彻底清除所有FRP相关服务和文件！"
echo ""

# 确认执行
read -p "确定要继续吗？(y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "🛑 第一步：停止所有FRP相关服务"
echo "======================================"

# 停止systemd服务
echo "停止systemd服务..."
systemctl stop frps-reverse 2>/dev/null || echo "frps-reverse服务未运行"
systemctl stop frps 2>/dev/null || echo "frps服务未运行"
systemctl stop frpc 2>/dev/null || echo "frpc服务未运行"

# 禁用自启动
echo "禁用自启动..."
systemctl disable frps-reverse 2>/dev/null || echo "frps-reverse未设置自启动"
systemctl disable frps 2>/dev/null || echo "frps未设置自启动"
systemctl disable frpc 2>/dev/null || echo "frpc未设置自启动"

echo ""
echo "🗑️ 第二步：删除systemd服务文件"
echo "======================================"

# 删除服务文件
service_files=(
    "/etc/systemd/system/frps-reverse.service"
    "/etc/systemd/system/frps.service"
    "/etc/systemd/system/frpc.service"
    "/lib/systemd/system/frps-reverse.service"
    "/lib/systemd/system/frps.service"
    "/lib/systemd/system/frpc.service"
)

for file in "${service_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "已删除: $file"
    fi
done

# 重新加载systemd
systemctl daemon-reload

echo ""
echo "🔫 第三步：强制杀死所有FRP进程"
echo "======================================"

# 查找并杀死所有frp相关进程
echo "查找FRP进程..."
pids=$(ps aux | grep -E "(frps|frpc)" | grep -v grep | awk '{print $2}')

if [ -n "$pids" ]; then
    echo "发现FRP进程: $pids"
    kill -9 $pids 2>/dev/null
    echo "已强制终止所有FRP进程"
else
    echo "未发现运行中的FRP进程"
fi

echo ""
echo "📁 第四步：删除FRP相关目录和文件"
echo "======================================"

# 删除可能的安装目录
directories=(
    "/opt/frp"
    "/opt/frp-reverse"
    "/usr/local/frp"
    "/root/frp"
    "/home/*/frp"
    "/var/lib/frp"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "已删除目录: $dir"
    fi
done

# 删除可能的配置文件
config_files=(
    "/etc/frp/frps.ini"
    "/etc/frp/frps.toml"
    "/etc/frp/frpc.ini"
    "/etc/frp/frpc.toml"
    "/root/frps.ini"
    "/root/frps.toml"
    "/root/frpc.ini"
    "/root/frpc.toml"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "已删除配置: $file"
    fi
done

# 删除配置目录
if [ -d "/etc/frp" ]; then
    rm -rf "/etc/frp"
    echo "已删除配置目录: /etc/frp"
fi

echo ""
echo "📋 第五步：清理日志文件"
echo "======================================"

# 删除日志文件
log_files=(
    "/var/log/frps.log"
    "/var/log/frpc.log"
    "/var/log/frps-reverse.log"
    "/tmp/frp*.log"
    "/root/frp*.log"
)

for file in "${log_files[@]}"; do
    rm -f $file 2>/dev/null && echo "已删除日志: $file"
done

echo ""
echo "🔍 第六步：检查端口占用"
echo "======================================"

# 检查7000和8388端口
echo "检查端口7000占用..."
port_7000=$(netstat -tuln | grep ":7000")
if [ -n "$port_7000" ]; then
    echo "⚠️ 端口7000仍被占用:"
    echo "$port_7000"
    # 尝试杀死占用进程
    lsof -ti:7000 | xargs kill -9 2>/dev/null && echo "已强制释放端口7000"
else
    echo "✅ 端口7000已释放"
fi

echo "检查端口8388占用..."
port_8388=$(netstat -tuln | grep ":8388")
if [ -n "$port_8388" ]; then
    echo "⚠️ 端口8388仍被占用:"
    echo "$port_8388"
    # 尝试杀死占用进程
    lsof -ti:8388 | xargs kill -9 2>/dev/null && echo "已强制释放端口8388"
else
    echo "✅ 端口8388已释放"
fi

echo ""
echo "🧽 第七步：清理安装脚本"
echo "======================================"

# 删除可能的安装脚本
install_scripts=(
    "/root/install-frp*.sh"
    "/root/frp-install.sh"
    "/tmp/install-frp*.sh"
)

for script in "${install_scripts[@]}"; do
    rm -f $script 2>/dev/null && echo "已删除脚本: $script"
done

echo ""
echo "✅ 第八步：验证清理结果"
echo "======================================"

echo "1. 检查服务状态:"
systemctl status frps-reverse --no-pager 2>/dev/null || echo "✅ frps-reverse服务已清理"

echo ""
echo "2. 检查进程:"
frp_processes=$(ps aux | grep -E "(frps|frpc)" | grep -v grep)
if [ -z "$frp_processes" ]; then
    echo "✅ 无FRP进程运行"
else
    echo "⚠️ 仍有FRP进程:"
    echo "$frp_processes"
fi

echo ""
echo "3. 检查端口:"
ports=$(netstat -tuln | grep -E "(7000|8388)")
if [ -z "$ports" ]; then
    echo "✅ 端口7000和8388已释放"
else
    echo "⚠️ 仍有端口占用:"
    echo "$ports"
fi

echo ""
echo "🎉 FRP服务清理完成！"
echo "======================================"
echo "所有FRP相关服务、文件和进程已清理完毕"
echo "现在服务器已恢复到FRP安装前的状态"
echo ""
echo "如需重新安装FRP，请运行新的安装脚本"
