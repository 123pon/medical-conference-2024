# 🚀 快速开始指南

## 仅需3步配置

### 1️⃣ 获取 Supabase 配置

1. 访问 [supabase.io](https://supabase.io) 创建账户
2. 创建新项目
3. 在项目设置中复制：
   - **Project URL** (项目URL)
   - **Anon Key** (匿名密钥)

### 2️⃣ 配置应用

编辑 `index.html`，找到以下部分：

```html
<script>
    window.SUPABASE_URL = 'https://your-project.supabase.co';
    window.SUPABASE_ANON_KEY = 'your-anonymous-key-here';
</script>
```

将 URL 和密钥替换为您的实际值。

### 3️⃣ 创建数据库

在 Supabase SQL 编辑器中，运行 [SETUP.md](./SETUP.md) 中的 SQL 语句。

## ⚡ 启动应用

```bash
# 进入项目目录
cd /Users/cloud/Projects/python/medical-conference

# 启动本地服务器
python3 -m http.server 8000

# 打开浏览器访问
# http://localhost:8000
```

## ✅ 测试流程

1. 页面加载时会显示**登录/注册界面** ✅
2. 点击"注册"创建新账户
3. 验证邮件后登录
4. 成功登录后进入应用首页

## 📍 关键改进点

| 改进 | 说明 |
|------|------|
| 🔒 **安全登录** | 应用加载时优先显示认证界面，数据受保护 |
| 📱 **响应式设计** | 支持手机、平板、桌面设备 |
| 💾 **数据持久化** | 用户数据保存到 Supabase（云数据库） |
| 🔄 **离线支持** | 无 Supabase 连接时使用本地缓存 |
| 🎯 **清晰流程** | 注册 → 验证 → 登录 → 使用应用 |

## 🔧 常见问题

**Q: 显示"Supabase 未配置"?**  
A: 检查 index.html 中的配置是否正确。

**Q: 收不到验证邮件?**  
A: 检查 Supabase 邮件设置，或在项目中检查垃圾邮件。

**Q: 想看详细配置步骤?**  
A: 查看 [SETUP.md](./SETUP.md) 文件。

## 📚 更多信息

- 详细配置：[SETUP.md](./SETUP.md)
- 代码审查：[CODE_REVIEW.md](./CODE_REVIEW.md)
- Supabase 文档：https://supabase.io/docs

---

**祝您使用愉快！** 🎉
