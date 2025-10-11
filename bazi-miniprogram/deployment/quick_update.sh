#!/bin/bash
# ===============================================
# 八字运势小程序 - 快速更新脚本
# ===============================================
# 
# 功能：快速更新线上部署版本
# 使用方法：bash quick_update.sh
#
# ===============================================

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SERVER_IP="119.91.146.128"
SERVICE_NAME="bazi-api"
DEPLOY_PATH="/opt/bazi-app/bazi-miniprogram"

echo -e "${GREEN}🚀 八字运势小程序 - 快速更新${NC}"
echo "=========================================="
echo "服务器: $SERVER_IP"
echo "服务名: $SERVICE_NAME"
echo "部署路径: $DEPLOY_PATH"
echo "=========================================="

# 检查是否在本地运行
if [[ -f "/etc/systemd/system/$SERVICE_NAME.service" ]]; then
    echo -e "${BLUE}✅ 检测到服务器环境，开始本地更新...${NC}"
    LOCAL_MODE=true
else
    echo -e "${YELLOW}⚠️ 检测到本地环境，需要远程连接到服务器${NC}"
    LOCAL_MODE=false
fi

# 本地更新函数
update_local() {
    echo -e "${BLUE}🔄 开始本地更新...${NC}"
    
    # 1. 停止服务
    echo "1. 停止API服务..."
    systemctl stop $SERVICE_NAME
    
    # 2. 备份当前版本
    echo "2. 备份当前版本..."
    cd $(dirname $DEPLOY_PATH)
    if [[ -d "$DEPLOY_PATH" ]]; then
        cp -r $DEPLOY_PATH ${DEPLOY_PATH}.backup.$(date +%Y%m%d_%H%M%S)
        echo "   备份完成"
    fi
    
    # 3. 拉取最新代码
    echo "3. 拉取最新代码..."
    cd $DEPLOY_PATH
    git pull origin main
    
    # 4. 更新依赖（如果需要）
    echo "4. 检查Python依赖..."
    source venv/bin/activate
    pip install -r requirements.txt --quiet
    
    # 5. 重启服务
    echo "5. 重启API服务..."
    systemctl start $SERVICE_NAME
    
    # 6. 等待服务启动
    echo "6. 等待服务启动..."
    sleep 5
    
    # 7. 验证服务状态
    echo "7. 验证服务状态..."
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo -e "${GREEN}✅ 更新成功！服务运行正常${NC}"
        echo ""
        echo "服务状态："
        systemctl status $SERVICE_NAME --no-pager | head -5
        
        echo ""
        echo "快速测试："
        curl -s http://localhost:8001/health | head -1 || echo "API健康检查失败"
        
    else
        echo -e "${RED}❌ 服务启动失败，请检查日志${NC}"
        echo ""
        echo "最近的错误日志："
        journalctl -u $SERVICE_NAME --no-pager -n 5
        return 1
    fi
}

# 远程更新函数
update_remote() {
    echo -e "${BLUE}🔄 开始远程更新...${NC}"
    
    # 创建远程执行脚本
    REMOTE_SCRIPT="
    echo '🔄 开始更新八字运势小程序...'
    
    # 停止服务
    systemctl stop $SERVICE_NAME
    
    # 进入项目目录
    cd $DEPLOY_PATH
    
    # 拉取最新代码
    echo '📥 拉取最新代码...'
    git pull origin main
    
    # 更新依赖
    echo '📦 更新Python依赖...'
    source venv/bin/activate
    pip install -r requirements.txt --quiet
    
    # 重启服务
    echo '🔄 重启服务...'
    systemctl start $SERVICE_NAME
    
    # 等待启动
    sleep 5
    
    # 检查服务状态
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo '✅ 更新成功，服务运行正常'
        systemctl status $SERVICE_NAME --no-pager | head -3
        curl -s http://localhost:8001/health | head -1 || echo 'API测试失败'
    else
        echo '❌ 服务启动失败'
        journalctl -u $SERVICE_NAME --no-pager -n 5
        exit 1
    fi
    "
    
    echo "连接到服务器执行更新..."
    ssh root@$SERVER_IP "$REMOTE_SCRIPT"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ 远程更新成功！${NC}"
    else
        echo -e "${RED}❌ 远程更新失败${NC}"
        return 1
    fi
}

# 主执行流程
main() {
    echo "开始执行更新..."
    echo ""
    
    if [[ "$LOCAL_MODE" == "true" ]]; then
        # 检查是否有root权限
        if [[ $EUID -ne 0 ]]; then
            echo -e "${RED}❌ 此脚本需要root权限运行${NC}"
            echo "请使用: sudo bash quick_update.sh"
            exit 1
        fi
        update_local
    else
        update_remote
    fi
    
    if [[ $? -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}🎉 更新完成！${NC}"
        echo ""
        echo "验证命令："
        echo "  curl http://api.bazi365.top/health"
        echo "  curl -X POST http://api.bazi365.top/api/v1/naming/personalized-generate -H 'Content-Type: application/json' -d '{\"surname\":\"李\",\"gender\":\"male\",\"birth_year\":1990,\"birth_month\":3,\"birth_day\":15,\"birth_hour\":10,\"calendar_type\":\"solar\",\"name_length\":2,\"count\":3,\"cultural_level\":\"modern\",\"popularity\":\"high\",\"era\":\"contemporary\"}'"
        echo ""
        echo "本次更新内容："
        echo "  ✅ 修复智能起名个性化偏好功能"
        echo "  ✅ 修复API参数映射问题"
        echo "  ✅ 修复数据格式一致性问题"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ 更新失败，请查看错误信息${NC}"
        exit 1
    fi
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
