#!/bin/bash

# 八字运势小程序 - 一键启动脚本
# 使用方法: ./start.sh [选项]
# 选项: --check (仅检查状态), --stop (停止服务), --restart (重启服务)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="八字运势小程序"
PROJECT_DIR="/Users/yinjianhua/Desktop/Demo/Bazi/bazi-miniprogram"
VENV_PATH="$PROJECT_DIR/venv"
MAIN_SCRIPT="$PROJECT_DIR/main.py"
API_PORT=8001
API_HOST="10.60.20.222"
API_URL="http://$API_HOST:$API_PORT"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 打印标题
print_title() {
    echo -e "\n${PURPLE}========================================${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}========================================${NC}\n"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_message $RED "❌ $1 命令未找到，请先安装"
        return 1
    fi
    return 0
}

# 检查虚拟环境
check_venv() {
    if [ ! -d "$VENV_PATH" ]; then
        print_message $RED "❌ 虚拟环境不存在: $VENV_PATH"
        return 1
    fi
    
    if [ ! -f "$VENV_PATH/bin/activate" ]; then
        print_message $RED "❌ 虚拟环境激活脚本不存在"
        return 1
    fi
    
    print_message $GREEN "✅ 虚拟环境正常"
    return 0
}

# 检查Python依赖
check_dependencies() {
    source "$VENV_PATH/bin/activate"
    
    # 核心依赖包列表（包含书籍联盟营销所需的aiohttp）
    local deps=("fastapi" "uvicorn" "sxtwl" "zhdate" "aiohttp")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! pip list | grep -q "^$dep "; then
            missing_deps+=($dep)
        fi
    done
    
    if [ ${#missing_deps[@]} -eq 0 ]; then
        print_message $GREEN "✅ 所有依赖包已安装"
        return 0
    else
        print_message $YELLOW "❌ 缺少依赖包: ${missing_deps[*]}"
        print_message $YELLOW "🔄 正在自动安装缺失依赖..."
        
        # 自动安装缺失的依赖
        if pip install -r "$PROJECT_DIR/requirements.txt"; then
            print_message $GREEN "✅ 依赖包安装完成"
            return 0
        else
            print_message $RED "❌ 依赖包安装失败"
            return 1
        fi
    fi
}

# 检查端口状态
check_port() {
    if lsof -i:$API_PORT &> /dev/null; then
        local pid=$(lsof -ti:$API_PORT)
        print_message $YELLOW "⚠️  端口 $API_PORT 已被进程 $pid 占用"
        return 1
    else
        print_message $GREEN "✅ 端口 $API_PORT 可用"
        return 0
    fi
}

# 检查API服务状态
check_api_service() {
    if curl -s "$API_URL/health" &> /dev/null; then
        print_message $GREEN "✅ API服务正常运行"
        return 0
    else
        print_message $RED "❌ API服务未运行或无法访问"
        return 1
    fi
}

# 停止服务
stop_service() {
    print_title "停止服务"
    
    if lsof -i:$API_PORT &> /dev/null; then
        local pid=$(lsof -ti:$API_PORT)
        print_message $YELLOW "正在停止端口 $API_PORT 上的服务 (PID: $pid)..."
        kill -9 $pid
        sleep 2
        
        if ! lsof -i:$API_PORT &> /dev/null; then
            print_message $GREEN "✅ 服务已停止"
        else
            print_message $RED "❌ 服务停止失败"
            return 1
        fi
    else
        print_message $YELLOW "服务未运行"
    fi
}

# 启动服务
start_service() {
    print_title "启动 $PROJECT_NAME 后端服务"
    
    # 检查基础环境
    if ! check_venv; then
        print_message $RED "虚拟环境检查失败，请运行 'python -m venv venv' 创建虚拟环境"
        exit 1
    fi
    
    if ! check_dependencies; then
        print_message $YELLOW "正在安装缺失的依赖包..."
        source "$VENV_PATH/bin/activate"
        pip install -r "$PROJECT_DIR/requirements.txt"
    fi
    
    # 检查端口
    if ! check_port; then
        print_message $YELLOW "正在清理端口..."
        stop_service
    fi
    
    # 切换到项目目录并启动服务
    cd "$PROJECT_DIR"
    source "$VENV_PATH/bin/activate"
    
    print_message $CYAN "🚀 正在启动服务..."
    print_message $BLUE "项目目录: $PROJECT_DIR"
    print_message $BLUE "Python版本: $(python --version)"
    print_message $BLUE "服务地址: $API_URL"
    print_message $BLUE "API文档: $API_URL/docs"
    
    echo -e "\n${CYAN}服务启动日志:${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}\n"
    
    # 启动主服务
    python "$MAIN_SCRIPT"
}

# 检查完整状态
check_status() {
    print_title "系统状态检查"
    
    # 基础环境检查
    print_message $BLUE "📋 基础环境检查"
    check_command "curl" || exit 1
    check_venv || exit 1
    
    # Python环境检查
    print_message $BLUE "\n🐍 Python环境检查"
    source "$VENV_PATH/bin/activate"
    print_message $GREEN "Python版本: $(python --version)"
    check_dependencies
    
    # 服务状态检查
    print_message $BLUE "\n🌐 服务状态检查"
    check_port
    check_api_service
    
    # 项目文件检查
    print_message $BLUE "\n📁 项目文件检查"
    if [ -f "$MAIN_SCRIPT" ]; then
        print_message $GREEN "✅ 主程序文件存在"
    else
        print_message $RED "❌ 主程序文件不存在: $MAIN_SCRIPT"
    fi
    
    if [ -d "$PROJECT_DIR/miniprogram" ]; then
        print_message $GREEN "✅ 小程序目录存在"
    else
        print_message $RED "❌ 小程序目录不存在"
    fi
    
    # 快速访问信息
    print_message $BLUE "\n🔗 快速访问链接"
    echo -e "  ${CYAN}API文档:${NC} $API_URL/docs"
    echo -e "  ${CYAN}健康检查:${NC} $API_URL/health"
    echo -e "  ${CYAN}后端首页:${NC} $API_URL/"
    echo -e "  ${CYAN}小程序目录:${NC} $PROJECT_DIR/miniprogram"
}

# 重启服务
restart_service() {
    print_title "重启服务"
    stop_service
    sleep 2
    start_service
}

# 显示帮助信息
show_help() {
    print_title "$PROJECT_NAME 启动脚本帮助"
    
    echo -e "${CYAN}使用方法:${NC}"
    echo -e "  ./start.sh [选项]"
    echo ""
    echo -e "${CYAN}选项:${NC}"
    echo -e "  ${GREEN}(无参数)${NC}     启动后端服务"
    echo -e "  ${GREEN}--check${NC}      检查系统状态"
    echo -e "  ${GREEN}--stop${NC}       停止后端服务"
    echo -e "  ${GREEN}--restart${NC}    重启后端服务"
    echo -e "  ${GREEN}--help${NC}       显示此帮助信息"
    echo ""
    echo -e "${CYAN}示例:${NC}"
    echo -e "  ./start.sh           # 启动服务"
    echo -e "  ./start.sh --check   # 检查状态"
    echo -e "  ./start.sh --stop    # 停止服务"
    echo ""
    echo -e "${CYAN}微信小程序配置:${NC}"
    echo -e "  1. 打开微信开发者工具"
    echo -e "  2. 导入项目: $PROJECT_DIR/miniprogram"
    echo -e "  3. 设置测试号，关闭域名校验"
    echo -e "  4. 编译运行"
    echo ""
    echo -e "${CYAN}相关文档:${NC}"
    echo -e "  ${YELLOW}QUICK_START.md${NC}              - 快速启动指南"
    echo -e "  ${YELLOW}MINIPROGRAM_QUICK_START.md${NC}  - 小程序配置指南"
    echo -e "  ${YELLOW}TROUBLESHOOTING.md${NC}          - 故障排除指南"
}

# 主函数
main() {
    # 检查脚本执行权限
    if [ ! -x "$0" ]; then
        chmod +x "$0"
    fi
    
    # 解析命令行参数
    case "$1" in
        "--check"|"-c")
            check_status
            ;;
        "--stop"|"-s")
            stop_service
            ;;
        "--restart"|"-r")
            restart_service
            ;;
        "--help"|"-h")
            show_help
            ;;
        "")
            start_service
            ;;
        *)
            print_message $RED "❌ 未知参数: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
main "$@"
