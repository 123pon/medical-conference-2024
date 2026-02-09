# 🔧 问题诊断与修复报告

## 问题1：401 Unauthorized Supabase 错误

### ❌ 根本原因
配置文件中的 **SUPABASE_ANON_KEY 被破坏了**：
```javascript
// 错误的配置
window.SUPABASE_ANON_KEY = 'your-anonymeyJhbGciOi...' // 混合了文本和JWT
```

### ✅ 已修复
密钥已恢复为正确的格式：
```javascript
// 正确的配置
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 🚀 改进的加载机制

**改进前**：
- `main.js` 通过动态 `import()` 加载 `supabase.js`
- 可能存在时序问题导致 `window.SUPABASE_*` 未定义

**改进后**：
1. HTML 中直接加载 Supabase 库脚本
2. `main.js` 作为 ES module 加载（`type="module"`）
3. 优先使用全局 `window.supabase`
4. 多层备选方案确保兼容性

### 修改的文件
```
index.html
  ✓ 修复了 SUPABASE_ANON_KEY
  ✓ 添加了直接的 Supabase 库加载
  ✓ 改为模块方式加载 main.js

js/main.js
  ✓ 改进 initSupabase() 方法
  ✓ 优先使用全局 window.supabase
  ✓ 添加多层备选方案
```

---

## 问题2：Permissions Policy Violation - unload

### 说明
```
[Violation] Permissions policy violation: unload is not allowed in this document.
```

### ✅ 解决方案

这个警告通常来自 Supabase 或其他库在页面卸载时运行的代码。有以下几种处理方式：

#### 方案1：忽略此警告（推荐）
这是浏览器的安全策略警告，通常不会影响应用功能。可以安全地忽略。

#### 方案2：禁用 unload 监听
在 `index.html` 中添加 Permissions-Policy 头注释：
```html
<!-- 
  如果需要禁用 unload 限制，请在服务器上配置：
  Permissions-Policy: unload=*
  或在 HTML 中：
-->
<meta http-equiv="Permissions-Policy" content="unload=*">
```

#### 方案3：在 main.js 中处理
如果需要在卸载时保存数据：
```javascript
// 使用 beforeunload 而不是 unload
window.addEventListener('beforeunload', (e) => {
    // 保存必要的数据
    localStorage.setItem('last_state', JSON.stringify(this.userProfile));
});
```

---

## 🧪 测试清单

### ✅ 在执行以下步骤后验证

1. **打开应用**
   - 访问 `http://localhost:8000`
   - 应该看到**登录/注册界面**

2. **验证 Supabase 连接**
   ```javascript
   // 在浏览器控制台运行
   console.log(window.SUPABASE_URL);
   console.log(window.SUPABASE_ANON_KEY);
   console.log(window.supabase);
   ```
   - 所有值都应该正确定义

3. **测试注册功能**
   - 点击"注册"标签
   - 输入邮箱、用户名、密码
   - 提交表单
   - 应该看到成功消息，而不是 **401 Unauthorized**

4. **查看浏览器日志**
   ```
   控制台应该显示：
   ✓ "使用全局 Supabase 客户端" 或
   ✓ "Supabase 客户端初始化成功" 或
   ✓ "手动创建 Supabase 客户端"
   ```

---

## 📋 文件修改总结

### `index.html`
```diff
- <link rel="stylesheet" href="css/style.css">
+ <!-- 加载 Supabase 库到全局作用域 -->
+ <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
+ <link rel="stylesheet" href="css/style.css">

- <script src="js/main.js"></script>
- <script src="js/app.js"></script>
+ <script type="module" src="js/main.js"></script>
+ <script defer src="js/app.js"></script>
```

### `js/main.js`
```diff
- async initSupabase() {
-     try {
-         const supabaseModule = await import('./supabase.js');
-         // ...
-     }
- }

+ async initSupabase() {
+     try {
+         // 优先使用全局 Supabase
+         if (window.supabase) {
+             this.supabase = window.supabase;
+             return;
+         }
+         // 备选方案...
+     }
+ }
```

---

## 🛠️ 如果仍有问题

### 1. 检查 Supabase 项目状态
```bash
# 验证项目 URL 是否有效
curl https://yuppkmtscafzvfxgsjci.supabase.co/rest/v1/

# 应该返回 200 或 401（认证失败），而不是 404
```

### 2. 检查浏览器控制台
```javascript
// 执行以下命令确诊问题
window.supabase.auth.getSession().then(console.log).catch(console.error);
```

### 3. 清除浏览器缓存
- 按 **F12** 打开开发者工具
- 在 Application 标签中清除 localStorage 和 sessionStorage
- 刷新页面

### 4. 验证网络连接
```javascript
// 在控制台运行
fetch('https://yuppkmtscafzvfxgsjci.supabase.co/rest/v1/')
  .then(r => r.status)
  .then(console.log)
```

---

## 📚 相关文档

- [修复前的问题列表](#问题1401-unauthorized-supabase-错误)
- [Supabase 配置指南](./SETUP.md)
- [快速开始](./QUICK_START.md)

---

**最后更新**：2026年2月8日  
**状态**：✅ 已修复主要问题
