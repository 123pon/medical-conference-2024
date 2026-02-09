// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 从环境变量获取配置（用于生产环境）
// 对于开发环境，在 HTML 中设置 window.SUPABASE_URL 和 window.SUPABASE_ANON_KEY
const supabaseUrl = window.SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL || localStorage.getItem('supabase_url')
const supabaseAnonKey = window.SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key')

// 检查配置是否完整
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase 配置不完整，请在 HTML 中设置 window.SUPABASE_URL 和 window.SUPABASE_ANON_KEY，或在浏览器 localStorage 中设置 supabase_url 和 supabase_key');
}

// 创建 Supabase 客户端
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export default supabase