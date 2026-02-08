// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 从环境变量或直接配置获取（开发时可以直接写在这里）
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://yuppkmtscafzvfxgsjci.supabase.co'
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cHBrbXRzY2FmenZmeGdzamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjQ5MDAsImV4cCI6MjA4NjEwMDkwMH0.E_ICyXQsUfTSt2ZM7AvcCrjT7Or2ASxXQUoEAiBlkcU'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase