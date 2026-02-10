// 添加全局美化样式到 HTML <head> 中
// 将此代码添加到 index.html 的 <style> 部分或新的 <style> 标签中

<style>
/* ===== 表单样式美化 ===== */
.form-control {
    padding: 12px 14px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: #fafafa;
}

.form-control:focus {
    background: white;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    outline: none;
}

.form-group label {
    color: #333;
    font-weight: 600;
    margin-bottom: 8px;
    display: block;
    font-size: 0.95rem;
}

/* ===== 按钮美化 ===== */
.btn {
    transition: all 0.3s ease;
    font-weight: 600;
    border-radius: 8px;
    padding: 12px 20px;
    border: none;
    cursor: pointer;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-primary {
    background: linear-gradient(135deg, #0066cc, #0099cc);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #0052a3, #0088bb);
}

.btn-secondary {
    background: #f0f8ff;
    border: 2px solid #0066cc;
    color: #0066cc;
}

.btn-secondary:hover {
    background: #e6f2ff;
}

/* ===== 页面卡片美化 ===== */
.page-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    padding: 40px;
}

.page-title {
    color: #0066cc;
    font-size: 2rem;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 3px solid #0066cc;
    font-weight: 700;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
    .page-card {
        padding: 20px;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    /* 形成单列布局 */
    [style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr;
    }
}
</style>
