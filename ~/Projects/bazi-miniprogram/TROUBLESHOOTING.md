# 微信小程序故障排除指南

## ✅ Tab栏图标问题已解决

**问题描述：**
```
app.json 文件内容错误：
["tabBar"]["list"][0]["iconPath"]: "images/tab_calculate.png" 未找到
```

**解决方案：**
已修改 `app.json` 配置，移除了Tab栏的图标配置，改为使用纯文字导航。现在的Tab栏配置为：

```json
"tabBar": {
  "color": "#666666",
  "selectedColor": "#C8860D", 
  "backgroundColor": "#FAFAFA",
  "borderStyle": "black",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "八字测算"
    },
    {
      "pagePath": "pages/history/history", 
      "text": "历史记录"
    },
    {
      "pagePath": "pages/profile/profile",
      "text": "个人中心"
    }
  ]
}
```

## 📱 现在可以正常使用

### 导入项目步骤
1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目目录：`~/Projects/bazi-miniprogram/miniprogram`
4. AppID：选择"测试号"
5. 项目名称：八字运势小程序

### 环境配置
1. **关闭域名校验**：
   - 工具栏 → 设置 → 项目设置 → 本地设置
   - 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

2. **启动后端服务**：
   ```bash
   cd ~/Projects/bazi-miniprogram
   source venv/bin/activate
   cd backend/app && python main.py
   ```

### 功能验证
1. ✅ 首页显示正常
2. ✅ Tab栏导航正常
3. ✅ API连接测试（点击"测试连接"按钮）
4. ✅ 八字测算功能
5. ✅ 历史记录功能
6. ✅ 个人中心功能

## 🔧 其他常见问题

### 网络请求失败
- 确保后端服务运行在 http://localhost:8000
- 确保已关闭域名校验
- 查看控制台错误信息

### 页面显示异常
- 工具栏 → 清缓存 → 清除所有数据
- Ctrl+Shift+R 强制刷新

### 样式显示问题
- 确保使用rpx而不是px
- 重新编译项目
- 检查CSS选择器

现在小程序应该可以正常启动和使用了！
