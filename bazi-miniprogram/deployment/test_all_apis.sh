#!/bin/bash
# ===============================================
# 八字运势小程序 - 完整API测试脚本
# ===============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# API基础地址
API_BASE="https://api.bazi365.top"
TEST_RESULTS_FILE="api_test_results_$(date +%Y%m%d_%H%M%S).log"

echo "🧪 开始测试八字运势小程序所有API接口"
echo "📍 API地址: $API_BASE"
echo "📝 测试日志: $TEST_RESULTS_FILE"
echo "================================================="

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_key="$5"
    
    echo -e "\n${BLUE}🔍 测试: $name${NC}"
    echo "   方法: $method"
    echo "   端点: $endpoint"
    
    local cmd
    if [[ "$method" == "GET" ]]; then
        cmd="curl -s -w 'HTTP_CODE:%{http_code}' '$API_BASE$endpoint'"
    else
        cmd="curl -s -w 'HTTP_CODE:%{http_code}' -X $method -H 'Content-Type: application/json' -d '$data' '$API_BASE$endpoint'"
    fi
    
    echo "   命令: $cmd" >> "$TEST_RESULTS_FILE"
    
    local response=$(eval "$cmd")
    local http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
    local body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    echo "   HTTP状态码: $http_code" >> "$TEST_RESULTS_FILE"
    echo "   响应体: $body" >> "$TEST_RESULTS_FILE"
    
    if [[ "$http_code" == "200" ]]; then
        if [[ -n "$expected_key" ]] && echo "$body" | grep -q "$expected_key"; then
            echo -e "   ${GREEN}✅ 成功 - 找到预期字段: $expected_key${NC}"
        elif [[ -z "$expected_key" ]]; then
            echo -e "   ${GREEN}✅ 成功${NC}"
        else
            echo -e "   ${YELLOW}⚠️  成功但未找到预期字段: $expected_key${NC}"
        fi
        return 0
    else
        echo -e "   ${RED}❌ 失败 - HTTP $http_code${NC}"
        echo "   响应: $body"
        return 1
    fi
}

# 开始测试
echo -e "\n📋 1. 基础健康检查接口测试"
test_api "健康检查" "GET" "/health" "" "healthy"
test_api "根路径" "GET" "/" "" "八字运势"

echo -e "\n📋 2. 八字计算相关接口测试"
bazi_data='{
  "year": 1990,
  "month": 5,
  "day": 15,
  "hour": 14,
  "gender": "male",
  "name": "测试用户",
  "calendarType": "solar"
}'
test_api "八字计算" "POST" "/api/v1/calculate-bazi" "$bazi_data" "success"

lunar_to_solar_data='{
  "year": 1990,
  "month": 4,
  "day": 15,
  "leap": false
}'
test_api "农历转公历" "POST" "/api/v1/lunar-to-solar" "$lunar_to_solar_data" "solar_date"

solar_to_lunar_data='{
  "year": 1990,
  "month": 5,
  "day": 15
}'
test_api "公历转农历" "POST" "/api/v1/solar-to-lunar" "$solar_to_lunar_data" "lunar_date"

echo -e "\n📋 3. 起名相关接口测试"
naming_data='{
  "surname": "张",
  "gender": "male",
  "birth_year": 1990,
  "birth_month": 5,
  "birth_day": 15,
  "birth_hour": 14,
  "calendar_type": "solar",
  "name_length": 2,
  "count": 5
}'
test_api "生成起名建议" "POST" "/api/v1/naming/generate-names" "$naming_data" "recommendations"

search_char_data='{
  "keyword": "智慧",
  "wuxing": "火",
  "gender": "male",
  "count": 10
}'
test_api "字义搜索" "POST" "/api/v1/naming/search-characters" "$search_char_data" "recommendations"

echo -e "\n📋 4. 生肖配对接口测试"
zodiac_data='{
  "zodiac1": "龙",
  "zodiac2": "凤"
}'
test_api "生肖配对" "POST" "/api/v1/zodiac-matching" "$zodiac_data" "compatibility_score"

echo -e "\n📋 5. 图标系统接口测试"
test_api "图标配置" "GET" "/api/v1/tab-icons/config" "" "available_icons"
test_api "获取图标" "GET" "/api/v1/tab-icons/bazi?style=normal" "" "icon_type"

echo -e "\n📋 6. 其他功能接口测试"
test_api "节日查询" "GET" "/api/v1/festivals" "" "festivals"
test_api "网络测试" "GET" "/api/v1/network-test" "" "network"

echo -e "\n================================================="
echo -e "${GREEN}🎉 API测试完成！${NC}"
echo "📊 详细测试结果已保存到: $TEST_RESULTS_FILE"
echo ""
echo "📋 测试总结："
echo "   ✅ 成功的接口将显示绿色勾号"
echo "   ❌ 失败的接口将显示红色叉号" 
echo "   ⚠️  部分成功的接口将显示黄色警告"
echo ""
echo "🔧 如果有接口失败，请检查："
echo "   1. 服务器是否正常运行"
echo "   2. 域名解析是否正确"
echo "   3. SSL证书是否配置"
echo "   4. 网络连接是否正常"
