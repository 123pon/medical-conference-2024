// js/auth.js - 用户认证管理模块
import supabase from './supabase.js'

class AuthManager {
    constructor() {
        this.currentUser = null
        this.userProfile = null
        this.init()
    }
    
    async init() {
        // 检查当前会话
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
            this.currentUser = session.user
            await this.loadUserProfile()
        }
        
        // 监听认证状态变化
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.currentUser = session.user
                await this.loadUserProfile()
                this.updateUI()
                this.showNotification('登录成功', 'success')
                
                // 更新应用状态
                if (window.app) {
                    window.app.userProfile = this.userProfile
                    window.app.updateProfilePreview()
                }
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null
                this.userProfile = null
                this.updateUI()
                this.showNotification('已退出登录', 'info')
                
                // 更新应用状态
                if (window.app) {
                    window.app.userProfile = null
                    window.app.updateProfilePreview()
                }
            }
        })
        
        this.updateUI()
        this.setupEventListeners()
    }
    
    async loadUserProfile() {
        if (!this.currentUser) return
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single()
            
            if (error) {
                // 如果没有找到用户资料，创建一个默认的
                if (error.code === 'PGRST116') {
                    await this.createUserProfile()
                    return
                }
                console.error('加载用户资料失败:', error)
                return
            }
            
            this.userProfile = data
        } catch (error) {
            console.error('加载用户资料异常:', error)
        }
    }
    
    async createUserProfile() {
        if (!this.currentUser) return
        
        const profileData = {
            id: this.currentUser.id,
            username: this.currentUser.email.split('@')[0],
            full_name: this.currentUser.email.split('@')[0],
            title: '参会医生',
            department: '未设置',
            hospital: '未设置',
            avatar: this.currentUser.email.charAt(0).toUpperCase(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert([profileData])
                .select()
                .single()
            
            if (error) {
                console.error('创建用户资料失败:', error)
                return
            }
            
            this.userProfile = data
        } catch (error) {
            console.error('创建用户资料异常:', error)
        }
    }
    
    async updateUserProfile(profileData) {
        if (!this.currentUser) return
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id)
                .select()
                .single()
            
            if (error) {
                console.error('更新用户资料失败:', error)
                return false
            }
            
            this.userProfile = data
            
            // 更新应用状态
            if (window.app) {
                window.app.userProfile = this.userProfile
                window.app.updateProfilePreview()
            }
            
            return true
        } catch (error) {
            console.error('更新用户资料异常:', error)
            return false
        }
    }
    
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            
            if (error) {
                this.showNotification(error.message, 'error')
                return false
            }
            
            return true
        } catch (error) {
            console.error('登录异常:', error)
            this.showNotification('登录失败，请重试', 'error')
            return false
        }
    }
    
    async register(email, password, username) {
        try {
            // 注册用户
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            })
            
            if (authError) {
                this.showNotification(authError.message, 'error')
                return false
            }
            
            // 创建用户资料
            if (authData.user) {
                const profileData = {
                    id: authData.user.id,
                    username: username,
                    full_name: username,
                    title: '参会医生',
                    department: '未设置',
                    hospital: '未设置',
                    avatar: username.charAt(0).toUpperCase(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([profileData])
                
                if (profileError) {
                    console.error('创建用户资料失败:', profileError)
                }
            }
            
            this.showNotification('注册成功！请检查邮箱验证邮件', 'success')
            return true
        } catch (error) {
            console.error('注册异常:', error)
            this.showNotification('注册失败，请重试', 'error')
            return false
        }
    }
    
    async logout() {
        try {
            const { error } = await supabase.auth.signOut()
            
            if (error) {
                console.error('退出登录失败:', error)
                return false
            }
            
            return true
        } catch (error) {
            console.error('退出登录异常:', error)
            return false
        }
    }
    
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            })
            
            if (error) {
                this.showNotification(error.message, 'error')
                return false
            }
            
            this.showNotification('密码重置邮件已发送，请检查邮箱', 'success')
            return true
        } catch (error) {
            console.error('重置密码异常:', error)
            this.showNotification('发送重置邮件失败', 'error')
            return false
        }
    }
    
    updateUI() {
        const authSection = document.getElementById('auth-section')
        const userSection = document.getElementById('user-section')
        
        if (this.currentUser) {
            // 用户已登录
            if (authSection) authSection.style.display = 'none'
            if (userSection) userSection.style.display = 'block'
            
            // 更新用户信息显示
            const userName = document.getElementById('user-name')
            const userTitle = document.getElementById('user-title')
            const userAvatar = document.getElementById('user-avatar')
            
            if (userName) {
                userName.textContent = this.userProfile?.full_name || this.currentUser.email
            }
            
            if (userTitle) {
                userTitle.textContent = this.userProfile?.title || '参会医生'
            }
            
            if (userAvatar) {
                userAvatar.textContent = this.userProfile?.avatar || 
                    (this.userProfile?.full_name?.charAt(0) || this.currentUser.email.charAt(0)).toUpperCase()
            }
            
            // 更新左侧用户信息
            const leftUserName = document.querySelector('.user-name')
            const leftUserAvatar = document.querySelector('.user-avatar')
            
            if (leftUserName) {
                leftUserName.textContent = this.userProfile?.full_name || '参会专家'
            }
            
            if (leftUserAvatar) {
                leftUserAvatar.textContent = this.userProfile?.avatar || 
                    (this.userProfile?.full_name?.charAt(0) || '医')
            }
        } else {
            // 用户未登录
            if (authSection) authSection.style.display = 'block'
            if (userSection) userSection.style.display = 'none'
            
            // 重置左侧用户信息
            const leftUserName = document.querySelector('.user-name')
            const leftUserAvatar = document.querySelector('.user-avatar')
            
            if (leftUserName) leftUserName.textContent = '参会专家'
            if (leftUserAvatar) leftUserAvatar.textContent = '医'
        }
    }
    
    setupEventListeners() {
        // 登录表单提交
        const loginForm = document.getElementById('login-form')
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault()
                const email = document.getElementById('login-email').value
                const password = document.getElementById('login-password').value
                
                await this.login(email, password)
            })
        }
        
        // 注册表单提交
        const registerForm = document.getElementById('register-form')
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault()
                const email = document.getElementById('register-email').value
                const password = document.getElementById('register-password').value
                const username = document.getElementById('register-username').value
                
                await this.register(email, password, username)
            })
        }
        
        // 退出登录按钮
        const logoutBtn = document.getElementById('logout-btn')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault()
                await this.logout()
            })
        }
        
        // 切换登录/注册标签页
        const authTabs = document.querySelectorAll('.auth-tab')
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab')
                
                // 更新激活状态
                authTabs.forEach(t => t.classList.remove('active'))
                tab.classList.add('active')
                
                // 显示对应表单
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active')
                })
                document.getElementById(`${tabName}-form`).classList.add('active')
            })
        })
    }
    
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div')
        notification.className = `auth-notification ${type}`
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `
        
        // 添加到页面
        document.body.appendChild(notification)
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show')
        }, 10)
        
        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show')
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                }
            }, 300)
        }, 3000)
    }
}

// 初始化认证管理器
let authManager = null

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager()
    window.authManager = authManager
})

export default AuthManager