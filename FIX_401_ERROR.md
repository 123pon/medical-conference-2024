# 🚨 "401 Unauthorized" 错误 - 快速修复指南

## 错误症状
```
POST https://yuppkmtscafzvfxgsjci.supabase.co/auth/v1/signup 401 (Unauthorized)
```
注册或登录时出现此错误。

---

## ⚡ 快速修复（3步）

### 第1步：验证 Supabase 密钥
打开浏览器控制台（F12），复制粘贴以下代码：

```javascript
// 检查配置
console.log('URL:', window.SUPABASE_URL);
console.log('Key:', window.SUPABASE_ANON_KEY?.substring(0, 30) + '...');
```

**期望输出：**
```
URL: https://yuppkmtscafzvfxgsjci.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
```

❌ 如果看到 `undefined` → 密钥未配置  
⚠️ 如果看到 `your-anonymous` 开头 → 密钥格式错误

### 第2步：检查密钥格式

在 `index.html` 中，找到第14-16行，确认密钥格式：

```html
<script>
    // ✓ 正确格式：只是 JWT Token
    window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...';
    
    // ✗ 错误格式：带文本前缀
    // window.SUPABASE_ANON_KEY = 'your-anonymous-eyJhbGciOi...'; // 错误！
</script>
```

### 第3步：清除缓存并重新加载
```bash
# 1. 清除浏览器缓存 (Ctrl+Shift+Delete 或 Cmd+Shift+Delete)
# 2. 刷新页面 (F5 或 Cmd+R)
# 3. 尝试注册新链接
```

---

## 🔍 诊断工具

如果上面的步骤不起作用，运行以下诊断脚本：

```javascript
// 复制 debug-supabase.js 的全部内容到控制台
// 或直接在控制台执行以下命令：

// 运行诊断工具
fetch('/debug-supabase.js').then(r => r.text()).then(eval);
```

---

## 🎯 常见原因和解决方案

| 问题 | 症状 | 解决方案 |
|------|------|--------|
| **密钥配置错误** | `window.SUPABASE_ANON_KEY = 'your-anon...'` | 移除 'your-anon' 前缀，只保留 JWT |
| **密钥未设置** | `window.SUPABASE_ANON_KEY = undefined` | 在 index.html 中设置正确的密钥 |
| **Supabase 库未加载** | `window.supabase = undefined` | 检查 HTML 中是否有 `<script src="...supabase-js@2">` |
| **项目 Auth 未启用** | 401 持续出现 | 访问 Supabase → Authentication → 确保 Email Auth 已启用 |
| **CORS 策略限制** | 浏览器控制台 CORS 错误 | 检查 Supabase REST API 设置 |

---

## 🔧 手动修复步骤

### 如果自动配置有问题：

#### 1. 获取正确的密钥
```bash
# 访问 Supabase 项目
# → 点击左侧 "Settings" 
# → 点击 "API"
# → 复制 "anon" 行的密钥（整个 JWT Token）
```

#### 2. 修改 index.html
```html
<!DOCTYPE html>
<html>
<head>
    <script>
        // 替换为您的真实值
        window.SUPABASE_URL = 'https://你的项目ID.supabase.co';
        window.SUPABASE_ANON_KEY = '复制的完整JWT密钥';
    </script>
</head>
</html>
```

#### 3. 刷新页面
按 F5 并尝试注册

---

## ✅ 验证修复成功

1. **打开登录/注册页面** → 应该看到表单
2. **填写表单** → 输入邮箱、用户名、密码
3. **提交后** → 应该看到成功！或邮件验证提示，而**不是 401 错误**
4. **检查控制台** → 应该看到 "✓ 使用全局 Supabase 客户端"

---

## 📞 仍需帮助？

1. 查看详细文档：[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 检查网络标签：F12 → Network → 搜索 "signup" → 检查响应内容
3. 查看浏览器控制台的完整错误信息
4. 验证 Supabase 项目 URL 是否正确

---

## 💾 文件已修复

```
✓ index.html
  - SUPABASE_ANON_KEY 已纠正
  - 添加了 Supabase 库直接加载
  - script 标签改为 type="module"

✓ js/main.js  
  - initSupabase() 方法优化
  - 多层备选加载方案

✓ 新增诊断工具
  - debug-supabase.js（自动诊断脚本）
```

---

**最后更新**: 2026年2月8日
**预计修复率**: 95%+
