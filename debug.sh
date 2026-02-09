#!/usr/bin/env bash

# 🔍 Supabase 初始化诊断和修复脚本
# 使用方法：在项目目录运行 bash debug.sh

echo "🔍️ 医学年会2024 - Supabase 初始化诊断"
echo "=========================================="

# 检查 HTML 配置
echo ""
echo "1️⃣ 检查 index.html 中的配置..."
if grep -q "window.SUPABASE_URL" index.html; then
    echo "✓ 找到 SUPABASE_URL 配置"
    URL=$(grep "window.SUPABASE_URL" index.html | head -1 | grep -oP "https://[^'\"]+")
    echo "  URL: $URL"
else
    echo "✗ 未找到 SUPABASE_URL 配置"
fi

if grep -q "window.SUPABASE_ANON_KEY" index.html; then
    echo "✓ 找到 SUPABASE_ANON_KEY 配置"
    KEY_LENGTH=$(grep "window.SUPABASE_ANON_KEY" index.html | head -1 | grep -oP "'[^']+'" | wc -c)
    echo "  密钥长度: $KEY_LENGTH 字符"
else
    echo "✗ 未找到 SUPABASE_ANON_KEY 配置"
fi

# 检查 main.js
echo ""
echo "2️⃣ 检查 main.js 中的初始化逻辑..."
if grep -q "const { createClient } = await import" js/main.js; then
    echo "✓ 找到改进的 ESM 导入方式"
else
    echo "⚠ 未找到改进的导入方式，可能需要更新"
fi

if grep -q "document.readyState === 'loading'" js/main.js; then
    echo "✓ 找到改进的 DOM 加载检查"
else
    echo "⚠ 未找到 DOM 加载检查"
fi

# 检查 app.js
echo ""
echo "3️⃣ 检查 app.js..."
if [ -f "js/app.js" ]; then
    echo "✓ app.js 文件存在"
else
    echo "✗ app.js 文件不存在"
fi

# 检查诊断工具
echo ""
echo "4️⃣ 检查诊断工具..."
if [ -f "debug-supabase.js" ]; then
    echo "✓ debug-supabase.js 存在"
else
    echo "✗ debug-supabase.js 不存在"
fi

# 检查修复文档
echo ""
echo "5️⃣ 检查文档..."
for doc in README.md SETUP.md QUICK_START.md TROUBLESHOOTING.md FIX_401_ERROR.md FIX_INITIALIZATION_ERROR.md CODE_REVIEW.md; do
    if [ -f "$doc" ]; then
        echo "✓ $doc"
    else
        echo "⚠ $doc 缺失"
    fi
done

# 服务器建议
echo ""
echo "=========================================="
echo "✨ 后续步骤："
echo ""
echo "1. 在浏览器中打开应用："
echo "   http://localhost:8000"
echo ""
echo "2. 打开浏览器控制台 (F12)"
echo ""
echo "3. 复制粘贴以下代码到控制台运行诊断："
echo "   fetch('/debug-supabase.js').then(r => r.text()).then(eval)"
echo ""
echo "4. 查看诊断结果是否显示 ✓"
echo ""
echo "=========================================="
