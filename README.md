# 医学年会2024 - 完整应用指南

## 🎯 快速导航

| 需求 | 文档 |
|------|------|
| **我遇到"Cannot read properties"初始化错误** | 👉 [FIX_INITIALIZATION_ERROR.md](./FIX_INITIALIZATION_ERROR.md) |
| **我遇到 401 Unauthorized 错误** | 👉 [FIX_401_ERROR.md](./FIX_401_ERROR.md) |
| **我要快速开始配置** | 👉 [QUICK_START.md](./QUICK_START.md) |
| **我需要详细说明** | 👉 [SETUP.md](./SETUP.md) |
| **我需要排查问题** | 👉 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| **我想了解代码审查** | 👉 [CODE_REVIEW.md](./CODE_REVIEW.md) |

---

## 📋 项目概述

医学年会2024 是一个现代化的医学会议管理平台，具有以下核心功能：

### ✨ 主要功能
- 👥 **用户认证** - 注册、登录、密码重置
- 👨‍⚕️ **专家库** - 浏览和管理会议专家信息
- 📅 **会议日程** - 查看详细的会议时间安排
- 💬 **学术论坛** - 参与学术讨论和提问
- 🎫 **会议内容** - 查看学术海报和资料
- 🤝 **赞助商展示** - 浏览会议赞助商信息
- 🎴 **个人名片** - 创建和分享专家名片

### 🏗️ 技术栈
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **数据库**：Supabase (Postgres)
- **认证**：Supabase Auth
- **UI 框架**：FontAwesome 图标库
- **HTTP 客户端**：Axios

---

## 🚀 快速开始（仅需3步）

### 步骤1️⃣：获取 Supabase 配置
1. 访问 [supabase.io](https://supabase.io)
2. 创建新项目
3. 复制项目 URL 和 anon key

### 步骤2️⃣：配置应用
编辑 `index.html`，找到第14-16行：
```html
<script>
    window.SUPABASE_URL = 'https://你的项目ID.supabase.co';
    window.SUPABASE_ANON_KEY = '你的匿名密钥';
</script>
```

### 步骤3️⃣：启动服务器
```bash
python3 -m http.server 8000
# 然后打开 http://localhost:8000
```

---

## 📚 详细文档

### 🔧 问题排查
- **[FIX_401_ERROR.md](./FIX_401_ERROR.md)** - 解决 401 Unauthorized 错误
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 常见问题诊断工具

### 📖 配置和使用
- **[QUICK_START.md](./QUICK_START.md)** - 3步快速开始
- **[SETUP.md](./SETUP.md)** - 完整的配置和数据库设置指南
- **[CODE_REVIEW.md](./CODE_REVIEW.md)** - 代码改进总结

### 🛠️ 诊断工具
在浏览器控制台中运行以下命令诊断配置：
```javascript
// 方法1：查看原始配置
console.log(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// 方法2：运行完整诊断
// 复制 debug-supabase.js 的内容到控制台执行
```

---

## 📁 项目结构

```
medical-conference/
├── index.html              # 主 HTML 文件（包含 Supabase 配置）
├── css/
│   └── style.css          # 完整的样式表（含认证页面样式）
├── js/
│   ├── main.js            # 主应用逻辑（初始化、页面管理）
│   ├── app.js             # 辅助工具（搜索、导出等）
│   ├── auth.js            # 认证管理模块（可选）
│   └── supabase.js        # Supabase 客户端配置
├── assets/                # 资源文件夹
└── docs/
    ├── README.md          # 本文件
    ├── QUICK_START.md     # 快速开始指南
    ├── SETUP.md           # 详细配置指南
    ├── TROUBLESHOOTING.md # 问题排查指南
    ├── CODE_REVIEW.md     # 代码审查报告
    ├── FIX_401_ERROR.md   # 故障排除指南
    └── debug-supabase.js  # 诊断脚本
```

---

## 🧪 测试清单

在使用前，请验证以下功能：

- [ ] 网页加载时显示**登录/注册界面**
- [ ] 可以成功**注册新账户**（收到验证邮件）
- [ ] 可以成功**登录**（用邮箱和密码）
- [ ] 注册/登录时无 **401 错误**
- [ ] 登录后显示**首页内容**
- [ ] 用户信息在右侧栏**正确显示**
- [ ] 可以**编辑个人信息**
- [ ] 可以**浏览专家库**
- [ ] 可以**查看会议日程**
- [ ] 可以**登出**后返回登录界面
- [ ] **响应式设计** 在手机上正常工作

---

## 🎨 用户界面预览

### 登录/注册界面 (首页)
```
┌─────────────────────────────┐
│   💓 医学年会2024           │
│   专业医学交流平台          │
│                             │
│  [登录] [注册] ← 标签选择    │
│                             │
│  邮箱: [_____________]      │
│  密码: [_____________]      │
│                             │
│  [登录]                     │
│  [忘记密码?]               │
└─────────────────────────────┘
```

### 应用首页 (登录后)
```
┌──────────────────────────────────────┐
│ 左侧菜单 │        主内容区          │右侧用户信息
│          │  🎉 欢迎参加2024医学年会 │ │
│ 首页     │     专家库 日程 内容    │ │用户名
│ 专家库   │     论坛 赞助商 分享    │ │《编辑个人信息
│ 日程     │                        │ │《我的名片
│ 内容     │   赞助商Logo展示区      │ │《我的日程
│ 论坛     │                        │ │《我的发帖
└──────────────────────────────────────┘
```

---

## 🔒 安全特性

- ✅ **行级安全 (RLS)** - 用户只能访问和修改自己的数据
- ✅ **邮件验证** - 新注册账户需要邮件验证
- ✅ **JWT 认证** - 使用 JWT Token 进行统一认证
- ✅ **密码加密** - 密码在服务器端加密存储
- ✅ **会话管理** - 自动刷新和过期管理

---

## 📱 响应式设计

| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机 | < 768px | 单列，菜单隐藏为按钮 |
| 平板 | 768px - 1023px | 自适应双栏 |
| 桌面 | ≥ 1024px | 完整三栏（左侧栏+内容+右侧栏） |

---

## 💾 数据存储

### 优先级顺序
1. **Supabase 数据库** (主存储) - 用户数据持久化到云
2. **浏览器 localStorage** (缓存) - 离线使用和快速加载
3. **内存** (会话) - 当前用户对象和应用状态

### 同步机制
- 登录时从 Supabase 加载数据
- 编辑时实时保存到 Supabase
- 离线时使用本地缓存
- 网络恢复自动同步

---

## 🚀 部署建议

### 本地开发
```bash
# Python http 服务器
python3 -m http.server 8000

# 或 Node.js 服务器
npx http-server
```

### GitHub Pages 部署
```bash
git checkout -b gh-pages
git push origin gh-pages
# 在 GitHub Settings 中启用 Pages
```

### 服务器部署
1. 上传文件到服务器
2. 配置 HTTPS
3. 设置 Supabase 环境变量
4. 配置 CORS (如需要)

---

## 🛠️ 常见任务

### 修改应用标题
编辑 `index.html`：
```html
<title>医学年会2024</title>  ← 修改这里
```

### 修改会议信息
编辑 `js/main.js` 中的 `renderHome()` 方法

### 添加新页面
1. 在 `js/main.js` 中创建 `renderNewPage()` 方法
2. 在 `loadPage()` 中添加 case 分支
3. 在 HTML 中的左侧菜单添加新链接

### 更改颜色主题
编辑 `css/style.css`：
```css
:root {
    --primary-color: #0066cc;     /* 主色 */
    --secondary-color: #0099cc;   /* 副色 */
    --accent-color: #00cc99;      /* 强调色 */
    /* ... 更多变量 ... */
}
```

---

## 📊 代码统计

- **HTML**: ~230 行
- **CSS**: ~1100 行（含响应式设计）
- **JavaScript**: ~2000+ 行（4个文件）
- **总计**: ~3330+ 行代码

---

## 🤝 贡献指南

欢迎改进此项目！请：

1. 测试您的更改
2. 保持代码风格一致
3. 添加适当的注释
4. 更新相关文档

---

## 📞 获取帮助

1. 👉 查看 [FIX_401_ERROR.md](./FIX_401_ERROR.md) - 快速修复常见错误
2. 👉 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 详细诊断工具
3. 👉 查看浏览器控制台错误信息
4. 👉 运行 debug-supabase.js 诊断脚本

---

## 📜 许可证

本项目仅供学习和开发使用。

---

## 📅 最新更新

| 时间 | 改进 |
|------|------|
| 2026-02-08 | ✅ 修复 401 错误和权限策略问题<br>✅ 完善 Supabase 加载机制<br>✅ 添加诊断工具和文档 |
| 2026-02-08 | ✅ 完整代码审查和优化<br>✅ 初始化流程改进<br>✅ 认证功能完善 |

---

**版本**: 1.1  
**最后更新**: 2026年2月8日  
**状态**: ✅ 生产就绪（需配置 Supabase）
