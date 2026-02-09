// 📋 医学年会 - Supabase 初始化诊断脚本
// 使用方法：在浏览器控制台中运行此代码

(function() {
    console.clear();
    console.log('%c🔍 Supabase 初始化诊断工具', 'font-size: 18px; font-weight: bold; color: #0066cc;');
    console.log('%c' + '='.repeat(60), 'color: #0066cc; font-size: 12px;');
    
    const checks = [];
    
    // 检查1：Supabase 配置
    console.log('\n1️⃣ 检查 Supabase 配置');
    const hasUrl = !!window.SUPABASE_URL;
    const hasKey = !!window.SUPABASE_ANON_KEY;
    
    if (hasUrl) {
        console.log('%c✓ SUPABASE_URL 已配置', 'color: green;');
        console.log(`   值: ${window.SUPABASE_URL}`);
        checks.push({ name: 'SUPABASE_URL', pass: true });
    } else {
        console.log('%c✗ SUPABASE_URL 未配置', 'color: red;');
        checks.push({ name: 'SUPABASE_URL', pass: false });
    }
    
    if (hasKey) {
        const keyLength = window.SUPABASE_ANON_KEY.length;
        const keyPreview = window.SUPABASE_ANON_KEY.substring(0, 30) + '...';
        if (keyLength > 100) {
            console.log('%c✓ SUPABASE_ANON_KEY 格式正确', 'color: green;');
            console.log(`   长度: ${keyLength} 字符`);
            console.log(`   预览: ${keyPreview}`);
            checks.push({ name: 'SUPABASE_ANON_KEY', pass: true });
        } else {
            console.log('%c⚠ SUPABASE_ANON_KEY 格式可能不正确', 'color: orange;');
            console.log(`   长度: ${keyLength} 字符 (应该 > 150)`);
            checks.push({ name: 'SUPABASE_ANON_KEY', pass: false });
        }
    } else {
        console.log('%c✗ SUPABASE_ANON_KEY 未配置', 'color: red;');
        checks.push({ name: 'SUPABASE_ANON_KEY', pass: false });
    }
    
    // 检查2：app 对象
    console.log('\n2️⃣ 检查应用对象');
    if (window.app) {
        console.log('%c✓ AppState 已初始化为 window.app', 'color: green;');
        checks.push({ name: '应用对象', pass: true });
    } else {
        console.log('%c✗ window.app 未定义', 'color: red;');
        console.log('   可能原因: 应用还在加载中，请稍候...');
        checks.push({ name: '应用对象', pass: false });
    }
    
    // 检查3：Supabase 客户端
    console.log('\n3️⃣ 检查 Supabase 客户端');
    if (window.app && window.app.supabase) {
        console.log('%c✓ app.supabase 已定义', 'color: green;');
        
        if (window.app.supabase.auth) {
            console.log('%c✓ auth 模块可用', 'color: green;');
            
            const authMethods = ['getSession', 'signInWithPassword', 'signUp', 'signOut', 'onAuthStateChange'];
            const availableMethods = authMethods.filter(m => typeof window.app.supabase.auth[m] === 'function');
            
            if (availableMethods.length > 0) {
                console.log(`   可用方法: ${availableMethods.join(', ')}`);
            }
        } else {
            console.log('%c✗ auth 模块不可用', 'color: red;');
        }
        
        if (window.app.supabase.from) {
            console.log('%c✓ from 方法可用 (数据库操作)', 'color: green;');
        }
        
        checks.push({ name: 'Supabase客户端', pass: true });
    } else if (window.app) {
        console.log('%c⚠ app.supabase 未定义', 'color: orange;');
        console.log('   可能使用了模拟客户端（演示模式）');
        checks.push({ name: 'Supabase客户端', pass: false });
    } else {
        console.log('%c✗ app 未定义', 'color: red;');
        checks.push({ name: 'Supabase客户端', pass: false });
    }
    
    // 检查4：当前用户状态
    console.log('\n4️⃣ 检查用户认证状态');
    if (window.app) {
        if (window.app.currentUser) {
            console.log('%c✓ 用户已登录', 'color: green;');
            console.log(`   邮箱: ${window.app.currentUser.email}`);
            console.log(`   用户ID: ${window.app.currentUser.id}`);
        } else {
            console.log('%cℹ 用户未登录（正常状态）', 'color: blue;');
            console.log('   这是正常的，应该显示登录/注册界面');
        }
        checks.push({ name: '用户认证', pass: true });
    } else {
        console.log('%c⚠ 无法检查用户状态', 'color: orange;');
        checks.push({ name: '用户认证', pass: false });
    }
    
    // 总结报告
    console.log('\n%c' + '='.repeat(60), 'color: #0066cc; font-size: 12px;');
    console.log('%c📊 诊断结果总结', 'font-size: 14px; font-weight: bold; color: #0066cc;');
    
    const passCount = checks.filter(c => c.pass).length;
    const totalCount = checks.length;
    const passRate = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(0) : 0;
    
    checks.forEach(check => {
        const icon = check.pass ? '✓' : '✗';
        const color = check.pass ? 'green' : 'red';
        console.log(`%c${icon} ${check.name}`, `color: ${color};`);
    });
    
    console.log(`\n总体状态: %c${passCount}/${totalCount} (${passRate}%)`, 
        passCount === totalCount ? 'color: green; font-weight: bold;' : 'color: orange; font-weight: bold;'
    );
    
    if (passRate >= 80) {
        console.log('%c✓ 配置正确，应该可以正常使用', 'color: green; font-size: 12px; font-weight: bold;');
    } else if (passRate >= 50) {
        console.log('%c⚠ 配置基本正确，但可能有问题', 'color: orange; font-size: 12px; font-weight: bold;');
    } else {
        console.log('%c✗ 配置有问题，请查看错误说明', 'color: red; font-size: 12px; font-weight: bold;');
    }
    
    // 建议
    console.log('\n💡 诊断建议：');
    if (!hasUrl || !hasKey) {
        console.log('1. 在 index.html 中检查 SUPABASE_URL 和 SUPABASE_ANON_KEY');
    }
    if (!window.app) {
        console.log('2. 应用还在加载中，请稍候5秒后重新运行诊断');
    }
    if (window.app && !window.app.supabase?.auth) {
        console.log('3. Supabase 认证未初始化，检查是否有网络错误');
        console.log('   在 Network 标签中搜索 "supabase" 查看加载状态');
    }
    if (passRate >= 80) {
        console.log('4. 尝试在网页中注册新账户');
        console.log('5. 如果还有错误，运行以下命令查看详细信息：');
        console.log('   window.app.supabase (查看客户端对象)');
    }
    
    console.log('%c' + '='.repeat(60), 'color: #0066cc; font-size: 12px;');
    console.log('\n💾 诊断信息导出：');
    console.log('以下是完整的诊断信息，可用于问题排查：');
    console.log({
        url: window.SUPABASE_URL,
        hasKey: !!window.SUPABASE_ANON_KEY,
        keyLength: window.SUPABASE_ANON_KEY?.length,
        appReady: !!window.app,
        supabaseReady: !!window.app?.supabase,
        authReady: !!window.app?.supabase?.auth,
        userLoggedIn: !!window.app?.currentUser,
        userEmail: window.app?.currentUser?.email || '未登录',
        timestamp: new Date().toISOString()
    });
})();
