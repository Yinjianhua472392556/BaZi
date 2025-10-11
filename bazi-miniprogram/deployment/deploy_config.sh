#!/bin/bash
# ===============================================
# 八字运势小程序 - 腾讯云服务器自动部署配置
# ===============================================
# 
# 使用说明：
# 1. 根据你的实际情况修改下面的配置
# 2. 运行: bash auto_deploy.sh
# 3. 等待部署完成（约15-25分钟）
#
# ===============================================

# 🔧 【必填】服务器基本信息
# ===============================================
export SERVER_IP="119.91.146.128"                    # 腾讯云轻量服务器公网IP
export DOMAIN_NAME="bazi365.top"                      # 八字运势域名
export API_SUBDOMAIN="api.bazi365.top"                # API子域名

# 🔐 【可选】SSH连接信息（直接在服务器终端执行时不需要）
# ===============================================
export SSH_USER="root"                                # SSH用户名（根据您的实际情况调整）
export SSH_PORT="22"                                  # SSH端口（默认22）
export SSH_KEY_PATH=""                                # SSH私钥路径（可选，不填则使用密码）

# 📁 【必填】GitHub项目信息
# ===============================================
export GITHUB_REPO="https://github.com/Yinjianhua472392556/BaZi.git"
export PROJECT_BRANCH="main"                          # 分支名（建议保持main）

# 🌐 【必填】SSL证书配置
# ===============================================
export ENABLE_SSL="yes"                               # 是否启用SSL证书（强烈建议yes）
export SSL_EMAIL="18620526218@163.com"                # SSL证书申请邮箱

# ⚙️ 【可选】部署路径配置（通常不需要修改）
# ===============================================
export DEPLOY_PATH="/opt/bazi-app"                    # 项目部署路径
export SERVICE_NAME="bazi-api"                        # 系统服务名称
export SERVICE_PORT="8001"                            # API服务端口
export SERVICE_USER="bazi"                            # 服务运行用户（将自动创建）

# 🐍 【可选】Python环境配置
# ===============================================
export PYTHON_VERSION="3.9"                          # Python版本
export VENV_PATH="${DEPLOY_PATH}/venv"                # 虚拟环境路径
export REQUIREMENTS_FILE="requirements.txt"           # 依赖文件名

# 🔒 【可选】安全配置
# ===============================================
export ENABLE_FIREWALL="yes"                          # 是否配置防火墙
export ALLOWED_PORTS="22,80,443,8001"                 # 开放的端口
export FAIL2BAN_ENABLED="yes"                         # 是否启用Fail2ban防护

# 📊 【可选】监控配置
# ===============================================
export ENABLE_MONITORING="yes"                        # 是否启用健康监控
export HEALTH_CHECK_INTERVAL="5"                      # 健康检查间隔（分钟）
export LOG_RETENTION_DAYS="30"                        # 日志保留天数

# 🔄 【可选】备份配置
# ===============================================
export ENABLE_BACKUP="yes"                            # 是否启用自动备份
export BACKUP_PATH="/opt/backup/bazi"                 # 备份存储路径
export BACKUP_RETENTION="7"                           # 备份保留天数

# 📧 【可选】通知配置
# ===============================================
export NOTIFICATION_EMAIL=""                          # 部署完成通知邮箱（可选）
export SLACK_WEBHOOK=""                               # Slack通知Webhook（可选）
export DINGTALK_WEBHOOK=""                            # 钉钉通知Webhook（可选）

# 🏷️ 【可选】版本和标签
# ===============================================
export VERSION_TAG="v1.0.0"                          # 版本标签
export ENVIRONMENT="production"                       # 部署环境标识
export MAINTAINER="八字运势开发团队"                    # 维护者信息

# ===============================================
# 配置验证函数（请勿修改）
# ===============================================
validate_config() {
    local errors=0
    
    echo "🔍 验证部署配置..."
    
    # 检查必填项
    if [[ -z "$SERVER_IP" || "$SERVER_IP" == "your_server_ip" ]]; then
        echo "❌ 错误: 请设置 SERVER_IP（服务器IP地址）"
        errors=$((errors + 1))
    fi
    
    if [[ -z "$DOMAIN_NAME" || "$DOMAIN_NAME" == "yourdomain.com" ]]; then
        echo "❌ 错误: 请设置 DOMAIN_NAME（你的域名）"
        errors=$((errors + 1))
    fi
    
    if [[ -z "$API_SUBDOMAIN" || "$API_SUBDOMAIN" == "api.yourdomain.com" ]]; then
        echo "❌ 错误: 请设置 API_SUBDOMAIN（API子域名）"
        errors=$((errors + 1))
    fi
    
    if [[ -z "$SSL_EMAIL" || "$SSL_EMAIL" == "your-email@example.com" ]]; then
        echo "❌ 错误: 请设置 SSL_EMAIL（用于SSL证书申请的邮箱）"
        errors=$((errors + 1))
    fi
    
    # 检查IP格式
    if [[ ! "$SERVER_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        echo "❌ 错误: SERVER_IP 格式不正确，请输入有效的IP地址"
        errors=$((errors + 1))
    fi
    
    # 检查邮箱格式
    if [[ ! "$SSL_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo "❌ 错误: SSL_EMAIL 格式不正确，请输入有效的邮箱地址"
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        echo "✅ 配置验证通过！"
        echo ""
        echo "📋 部署配置摘要:"
        echo "   服务器IP: $SERVER_IP"
        echo "   主域名: $DOMAIN_NAME"
        echo "   API域名: $API_SUBDOMAIN"
        echo "   SSL邮箱: $SSL_EMAIL"
        echo "   部署路径: $DEPLOY_PATH"
        echo "   服务端口: $SERVICE_PORT"
        echo ""
        return 0
    else
        echo ""
        echo "❌ 发现 $errors 个配置错误，请修正后重试"
        echo ""
        echo "📖 配置帮助:"
        echo "   1. SERVER_IP: 在腾讯云控制台查看轻量服务器的公网IP"
        echo "   2. DOMAIN_NAME: 你购买的域名，如 example.com"
        echo "   3. API_SUBDOMAIN: API服务的子域名，如 api.example.com"
        echo "   4. SSL_EMAIL: 用于接收SSL证书相关邮件的邮箱"
        echo "   5. 注意: 确保腾讯云安全组已开放端口 80, 443, 8001"
        echo ""
        return 1
    fi
}

# ===============================================
# 网络连接测试函数（请勿修改）
# ===============================================
test_connectivity() {
    echo "🌐 测试网络连接..."
    
    # 测试服务器连接
    if timeout 10 ping -c 3 "$SERVER_IP" >/dev/null 2>&1; then
        echo "✅ 服务器IP连接正常"
    else
        echo "❌ 无法连接到服务器IP: $SERVER_IP"
        echo "   请检查: 1) IP地址是否正确 2) 服务器是否运行 3) 网络是否正常"
        return 1
    fi
    
    # 测试SSH连接
    if timeout 10 nc -z "$SERVER_IP" "$SSH_PORT" >/dev/null 2>&1; then
        echo "✅ SSH端口($SSH_PORT)可访问"
    else
        echo "❌ SSH端口($SSH_PORT)无法访问"
        echo "   请检查: 1) SSH服务是否启动 2) 防火墙是否开放SSH端口"
        return 1
    fi
    
    # 测试域名解析
    if nslookup "$DOMAIN_NAME" >/dev/null 2>&1; then
        echo "✅ 主域名解析正常"
    else
        echo "⚠️  主域名解析失败（可能尚未配置，部署后需要配置DNS）"
    fi
    
    if nslookup "$API_SUBDOMAIN" >/dev/null 2>&1; then
        echo "✅ API子域名解析正常"
    else
        echo "⚠️  API子域名解析失败（可能尚未配置，部署后需要配置DNS）"
    fi
    
    return 0
}

# ===============================================
# 显示配置摘要函数（请勿修改）
# ===============================================
show_summary() {
    echo ""
    echo "🎯 腾讯云服务器部署准备就绪！"
    echo ""
    echo "📋 即将执行的操作:"
    echo "   1. 检测和配置系统环境"
    echo "   2. 更新系统并安装依赖"
    echo "   3. 克隆项目代码: $GITHUB_REPO"
    echo "   4. 配置Python环境和依赖"
    echo "   5. 创建系统服务: $SERVICE_NAME"
    echo "   6. 智能SSL证书申请和配置"
    echo "   7. 配置Nginx反向代理和HTTPS"
    echo "   8. 启动服务并全面验证功能"
    echo ""
    echo "⏱️  预计部署时间: 15-25分钟"
    echo "🔧  特性: 智能SSL修复 | 腾讯云优化 | 自动错误修复"
    echo ""
    echo "▶️  运行 'sudo bash auto_deploy.sh' 开始部署"
    echo ""
}

# ===============================================
# 主函数调用（请勿修改）
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # 如果直接运行此脚本，则进行配置验证
    validate_config && test_connectivity && show_summary
fi
