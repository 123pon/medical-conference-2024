# 医学年会2024 - 应用配置指南

## 🚀 快速开始

### 1. Supabase 配置 (必需)

#### 步骤 1：获取 Supabase 项目信息
1. 访问 [Supabase](https://supabase.io)
2. 创建新项目或使用现有项目
3. 在项目设置中获取：
   - **项目 URL** (Project URL)
   - **匿名密钥** (Anon Key / Public Key)

#### 步骤 2：配置应用
编辑 `index.html` 文件，找到配置部分并替换：

```html
<script>
    // 设置 Supabase 配置（请替换为您的实际配置）
    window.SUPABASE_URL = 'https://your-project.supabase.co';
    window.SUPABASE_ANON_KEY = 'your-anonymous-key-here';
</script>
```

### 2. 创建数据库表结构

在 Supabase 的 SQL 编辑器中运行以下 SQL 语句：

#### profiles 表（用户资料）
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    title VARCHAR(255),
    department VARCHAR(255),
    hospital VARCHAR(255),
    avatar VARCHAR(10),
    bio TEXT,
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 添加行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

#### experts 表（专家库）
```sql
CREATE TABLE experts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    department VARCHAR(255),
    hospital VARCHAR(255),
    avatar VARCHAR(10),
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read experts" ON experts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own expert profile" ON experts
    FOR INSERT WITH CHECK (user_id = auth.uid());
```

#### topics 表（论坛话题）
```sql
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255),
    replies INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read topics" ON topics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert topics" ON topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics" ON topics
    FOR UPDATE USING (auth.uid() = user_id);
```

#### sponsors 表（赞助商）
```sql
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255),
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read sponsors" ON sponsors
    FOR SELECT USING (true);
```

### 3. 配置认证

1. 在 Supabase 项目中，进入 Authentication > Providers
2. 启用 Email 认证
3. 配置邮件模板（可选）

### 4. 启动应用

#### 本地开发

```bash
# 使用 Python 简单 HTTP 服务器
python3 -m http.server 8000

# 或使用其他服务器
# npm install -g http-server
# http-server -p 8000
```

然后在浏览器中打开：`http://localhost:8000`

## 📋 功能概览

### 已实现功能
- ✅ 用户注册和登录（基于 Supabase Auth）
- ✅ 密码重置和恢复
- ✅ 个人资料编辑和查看
- ✅ 专家库浏览和管理
- ✅ 学术论坛和讨论
- ✅ 会议日程查看
- ✅ 赞助商展示
- ✅ 响应式设计（移动端兼容）

### 首次登录流程
1. 网页打开后显示登录/注册界面
2. 新用户点击"注册"，填写邮箱、用户名和密码
3. 注册成功后，系统发送验证邮件
4. 用户验证邮件后可以登录
5. 登录成功后，应用加载用户数据并显示首页

## 🔒 安全最佳实践

1. **不要在代码中提交真实的 Supabase 密钥**
2. **使用环境变量或配置文件（.env）** 在生产环境中管理密钥
3. **启用 Row Level Security (RLS)** 保护数据安全
4. **定期审计用户权限** 和数据访问权限
5. **使用 HTTPS** 在生产环境中传输数据

## 🐛 常见问题排查

### Q: 注册时收不到验证邮件
**A:** 检查 Supabase 邮件配置是否正确，可能需要配置 SMTP 服务器

### Q: 登录失败，显示"Supabase 未配置"
**A:** 确保 `index.html` 中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 正确设置

### Q: 数据保存不了
**A:** 检查：
1. Supabase 表是否创建
2. Row Level Security 策略是否正确
3. 浏览器控制台是否有错误信息

### Q: 应用显示登录界面但无法手动调用登录
**A:** 检查浏览器控制台的错误信息，可能是网络连接问题

## 📝 数据备份和导出

应用支持：
- ✅ 本地 localStorage 缓存（在无 Supabase 连接时使用）
- ✅ Supabase 自动备份
- ✅ 手动导出数据为 JSON 格式

### 导出数据
在开发环境中（localhost），右侧栏会显示"数据管理"按钮，可以：
- 导出所有数据为 JSON 文件
- 导入先前导出的数据
- 查看数据统计信息
- 重置所有数据

## 📱 响应式设计说明

- **桌面版** (≥1024px): 完整的双侧栏布局
- **平板版** (768px - 1023px): 自适应布局
- **手机版** (< 768px): 单列布局，侧栏收缩为菜单按钮

## 🚀 部署建议

### GitHub Pages 部署
```bash
# 1. 创建 gh-pages 分支
git checkout -b gh-pages

# 2. 将配置好的文件推送到该分支
git push -u origin gh-pages

# 3. 在 GitHub 项目设置中启用 Pages
```

### 服务器部署
1. 上传文件到服务器
2. 配置 HTTPS
3. 设置 Supabase 环境变量
4. 配置 CORS（如需要）

## 📚 相关文档

- [Supabase 官方文档](https://supabase.io/docs)
- [Supabase 认证指南](https://supabase.io/docs/guides/auth)
- [行级安全策略 (RLS)](https://supabase.io/docs/guides/auth/row-level-security)

## 💬 获取帮助

- 查看浏览器控制台错误信息
- 检查 Supabase 项目的日志
- 提交 GitHub Issue

---

**最后更新**: 2026年2月
**应用版本**: 1.0
