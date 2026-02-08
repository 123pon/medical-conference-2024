// 应用状态管理
const AppState = {
    currentPage: 'home',
    experts: [],
    topics: [],
    userProfile: null,
    sponsors: [],
    sidebarCollapsed: true,
    rightSidebarCollapsed: true,
    currentUser: null,
    supabase: null,
    
    async init() {
        console.log('AppState.init()');
        
        // 初始化 Supabase 客户端
        await this.initSupabase();
        
        // 检查认证状态
        await this.checkAuth();
        
        // 加载数据
        await Promise.all([
            this.loadExperts(),
            this.loadTopics(),
            this.loadSponsors()
        ]);
        
        this.setupEventListeners();
        this.loadPage('home');
        this.updateProfilePreview();
        
        // 应用默认收起状态
        this.applyDefaultCollapsedState();
        
        // 设置移动端按钮事件
        this.setupMobileMenuButtons();
    },
    
    async initSupabase() {
        try {
            // 动态导入 Supabase
            const supabaseModule = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const { createClient } = supabaseModule;
            
            // 从环境变量或默认值获取配置
            const supabaseUrl = window.SUPABASE_URL || 'https://your-project.supabase.co';
            const supabaseKey = window.SUPABASE_ANON_KEY || 'your-anon-key';
            
            this.supabase = createClient(supabaseUrl, supabaseKey);
            window.supabase = this.supabase; // 暴露到全局
            
            console.log('Supabase 客户端初始化成功');
        } catch (error) {
            console.error('初始化 Supabase 失败:', error);
            // 使用后备方案：创建虚拟 Supabase 客户端
            this.supabase = this.createMockSupabase();
        }
    },
    
    createMockSupabase() {
        // 创建虚拟 Supabase 客户端作为后备
        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                signInWithPassword: async () => ({ data: null, error: { message: 'Supabase 未配置' } }),
                signUp: async () => ({ data: null, error: { message: 'Supabase 未配置' } }),
                signOut: async () => ({ error: null })
            },
            from: () => ({
                select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
                insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
                update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
                delete: () => ({ eq: async () => ({ error: null }) })
            })
        };
    },
    
    async checkAuth() {
        if (!this.supabase) return;
        
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('获取会话失败:', error);
                return;
            }
            
            if (session?.user) {
                this.currentUser = session.user;
                await this.loadUserProfileFromSupabase();
            }
            
            // 监听认证状态变化
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    this.currentUser = session.user;
                    await this.loadUserProfileFromSupabase();
                    this.updateProfilePreview();
                    this.showNotification('登录成功', 'success');
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.userProfile = null;
                    this.updateProfilePreview();
                    this.showNotification('已退出登录', 'info');
                }
            });
        } catch (error) {
            console.error('检查认证状态异常:', error);
        }
    },
    
    async loadUserProfileFromSupabase() {
        if (!this.currentUser || !this.supabase) return;
        
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();
            
            if (error) {
                console.error('从 Supabase 加载用户资料失败:', error);
                
                // 如果没有找到用户资料，创建一个默认的
                if (error.code === 'PGRST116') {
                    await this.createUserProfileInSupabase();
                } else {
                    // 尝试从本地加载
                    this.loadProfileFromLocal();
                }
                return;
            }
            
            this.userProfile = data;
            
            // 同步到本地存储作为缓存
            localStorage.setItem('conference_profile', JSON.stringify(data));
        } catch (error) {
            console.error('加载用户资料异常:', error);
            this.loadProfileFromLocal();
        }
    },
    
    async createUserProfileInSupabase() {
        if (!this.currentUser || !this.supabase) return;
        
        const profileData = {
            id: this.currentUser.id,
            username: this.currentUser.email.split('@')[0],
            full_name: this.currentUser.email.split('@')[0],
            title: '参会医生',
            department: '未设置',
            hospital: '未设置',
            bio: '暂无个人简介',
            avatar: this.currentUser.email.charAt(0).toUpperCase(),
            contact: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .insert([profileData])
                .select()
                .single();
            
            if (error) {
                console.error('创建用户资料失败:', error);
                return;
            }
            
            this.userProfile = data;
            localStorage.setItem('conference_profile', JSON.stringify(data));
        } catch (error) {
            console.error('创建用户资料异常:', error);
        }
    },
    
    loadProfileFromLocal() {
        const savedProfile = localStorage.getItem('conference_profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        }
    },
    
    async saveProfileToSupabase(profileData) {
        if (!this.currentUser || !this.supabase) return false;
        
        try {
            const profileToSave = {
                ...profileData,
                id: this.currentUser.id,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('profiles')
                .upsert([profileToSave])
                .select()
                .single();
            
            if (error) {
                console.error('保存用户资料到 Supabase 失败:', error);
                return false;
            }
            
            this.userProfile = data;
            localStorage.setItem('conference_profile', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存用户资料异常:', error);
            return false;
        }
    },
    
    applyDefaultCollapsedState() {
        if (window.innerWidth > 1024) {
            const sidebar = document.querySelector('.sidebar');
            const rightSidebar = document.querySelector('.right-sidebar');
            
            if (this.sidebarCollapsed && sidebar) {
                sidebar.classList.add('collapsed');
                const toggleBtn = document.getElementById('sidebar-toggle');
                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
            
            if (this.rightSidebarCollapsed && rightSidebar) {
                rightSidebar.classList.add('collapsed');
                const toggleBtn = document.getElementById('right-sidebar-toggle');
                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                }
            }
        } else {
            const sidebar = document.querySelector('.sidebar');
            const rightSidebar = document.querySelector('.right-sidebar');
            
            if (sidebar) sidebar.classList.add('collapsed');
            if (rightSidebar) rightSidebar.classList.add('collapsed');
        }
    },
    
    setupMobileMenuButtons() {
        const leftMenuToggle = document.querySelector('.left-menu-toggle');
        const rightMenuToggle = document.querySelector('.right-menu-toggle');
        
        if (leftMenuToggle) {
            leftMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleSidebar();
            });
        }
        
        if (rightMenuToggle) {
            rightMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleRightSidebar();
            });
        }
        
        const overlays = document.querySelectorAll('.sidebar-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeAllSidebars();
            });
        });
    },
    
    setupEventListeners() {
        console.log('AppState.setupEventListeners()');
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.loadPage(page);
                
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                if (window.innerWidth <= 1024) {
                    this.closeAllSidebars();
                }
            });
        });
        
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        const rightSidebarToggle = document.getElementById('right-sidebar-toggle');
        if (rightSidebarToggle) {
            rightSidebarToggle.addEventListener('click', () => {
                this.toggleRightSidebar();
            });
        }
        
        document.getElementById('edit-profile-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPage('profile');
            if (window.innerWidth <= 1024) {
                this.closeAllSidebars();
            }
        });
        
        document.getElementById('my-card-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPage('profile');
            if (window.innerWidth <= 1024) {
                this.closeAllSidebars();
            }
        });
        
        document.getElementById('close-info')?.addEventListener('click', () => {
            document.querySelector('.info-bar').style.display = 'none';
        });
        
        document.querySelector('.profile-quick-view')?.addEventListener('click', () => {
            this.loadPage('profile');
            if (window.innerWidth <= 1024) {
                this.closeAllSidebars();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                const isSidebar = e.target.closest('.sidebar') || e.target.closest('.right-sidebar');
                const isMobileButton = e.target.closest('.mobile-menu-toggle');
                
                if (!isSidebar && !isMobileButton) {
                    this.closeAllSidebars();
                }
            }
        });
    },
    
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay.left');
        
        if (!sidebar) return;
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (window.innerWidth <= 1024) {
            if (this.sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                if (overlay) overlay.classList.remove('active');
            } else {
                sidebar.classList.remove('collapsed');
                if (overlay) overlay.classList.add('active');
                this.rightSidebarCollapsed = true;
                const rightSidebar = document.querySelector('.right-sidebar');
                const rightOverlay = document.querySelector('.sidebar-overlay.right');
                if (rightSidebar) rightSidebar.classList.add('collapsed');
                if (rightOverlay) rightOverlay.classList.remove('active');
            }
        } else {
            if (this.sidebarCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
        
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            if (window.innerWidth > 1024) {
                toggleBtn.innerHTML = this.sidebarCollapsed ? 
                    '<i class="fas fa-bars"></i>' : 
                    '<i class="fas fa-times"></i>';
            }
        }
    },
    
    toggleRightSidebar() {
        const rightSidebar = document.querySelector('.right-sidebar');
        const overlay = document.querySelector('.sidebar-overlay.right');
        
        if (!rightSidebar) return;
        
        this.rightSidebarCollapsed = !this.rightSidebarCollapsed;
        
        if (window.innerWidth <= 1024) {
            if (this.rightSidebarCollapsed) {
                rightSidebar.classList.add('collapsed');
                if (overlay) overlay.classList.remove('active');
            } else {
                rightSidebar.classList.remove('collapsed');
                if (overlay) overlay.classList.add('active');
                this.sidebarCollapsed = true;
                const sidebar = document.querySelector('.sidebar');
                const leftOverlay = document.querySelector('.sidebar-overlay.left');
                if (sidebar) sidebar.classList.add('collapsed');
                if (leftOverlay) leftOverlay.classList.remove('active');
            }
        } else {
            if (this.rightSidebarCollapsed) {
                rightSidebar.classList.add('collapsed');
            } else {
                rightSidebar.classList.remove('collapsed');
            }
        }
        
        const toggleBtn = document.getElementById('right-sidebar-toggle');
        if (toggleBtn) {
            if (window.innerWidth > 1024) {
                toggleBtn.innerHTML = this.rightSidebarCollapsed ? 
                    '<i class="fas fa-chevron-left"></i>' : 
                    '<i class="fas fa-chevron-right"></i>';
            }
        }
    },
    
    closeAllSidebars() {
        if (window.innerWidth <= 1024) {
            this.sidebarCollapsed = true;
            const sidebar = document.querySelector('.sidebar');
            const leftOverlay = document.querySelector('.sidebar-overlay.left');
            if (sidebar) sidebar.classList.add('collapsed');
            if (leftOverlay) leftOverlay.classList.remove('active');
            
            this.rightSidebarCollapsed = true;
            const rightSidebar = document.querySelector('.right-sidebar');
            const rightOverlay = document.querySelector('.sidebar-overlay.right');
            if (rightSidebar) rightSidebar.classList.add('collapsed');
            if (rightOverlay) rightOverlay.classList.remove('active');
        }
    },
    
    toggleLeftSidebar() {
        this.toggleSidebar();
    },
    
    async loadExperts() {
        try {
            if (this.supabase) {
                // 尝试从 Supabase 加载
                const { data, error } = await this.supabase
                    .from('experts')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    this.experts = data;
                    // 同步到本地存储作为缓存
                    localStorage.setItem('conference_experts', JSON.stringify(data));
                    return;
                }
            }
            
            // 如果 Supabase 加载失败，使用本地缓存
            this.loadExpertsFromLocal();
        } catch (error) {
            console.error('加载专家数据异常:', error);
            this.loadExpertsFromLocal();
        }
    },
    
    loadExpertsFromLocal() {
        const savedExperts = localStorage.getItem('conference_experts');
        if (savedExperts) {
            this.experts = JSON.parse(savedExperts);
        } else {
            this.experts = this.getDefaultExperts();
            this.saveExpertsToLocal();
        }
    },
    
    getDefaultExperts() {
        return [
            { 
                id: 1, 
                name: '张医生', 
                title: '主任医师', 
                department: '心内科', 
                hospital: '协和医院', 
                avatar: '张', 
                bio: '专注心血管疾病研究20余年',
                created_at: new Date().toISOString(),
                user_id: null
            },
            { 
                id: 2, 
                name: '李医生', 
                title: '副主任医师', 
                department: '神经外科', 
                hospital: '北医三院', 
                avatar: '李', 
                bio: '神经外科微创手术专家',
                created_at: new Date().toISOString(),
                user_id: null
            }
        ];
    },
    
    async saveExpert(expert) {
        try {
            if (this.supabase && this.currentUser) {
                // 保存到 Supabase
                const expertToSave = {
                    ...expert,
                    user_id: this.currentUser.id,
                    updated_at: new Date().toISOString()
                };
                
                if (expert.id) {
                    // 更新现有专家
                    const { data, error } = await this.supabase
                        .from('experts')
                        .update(expertToSave)
                        .eq('id', expert.id)
                        .eq('user_id', this.currentUser.id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    expert = data;
                } else {
                    // 创建新专家
                    expertToSave.created_at = new Date().toISOString();
                    const { data, error } = await this.supabase
                        .from('experts')
                        .insert([expertToSave])
                        .select()
                        .single();
                    
                    if (error) throw error;
                    expert = data;
                }
            }
            
            // 更新本地数组和存储
            this.updateLocalExpert(expert);
            return expert;
        } catch (error) {
            console.error('保存专家失败:', error);
            // 如果 Supabase 保存失败，只保存到本地
            this.updateLocalExpert(expert);
            return expert;
        }
    },
    
    updateLocalExpert(expert) {
        if (!expert.id) {
            expert.id = Date.now();
        }
        
        const existingIndex = this.experts.findIndex(e => e.id === expert.id);
        if (existingIndex >= 0) {
            this.experts[existingIndex] = expert;
        } else {
            this.experts.push(expert);
        }
        
        this.saveExpertsToLocal();
    },
    
    saveExpertsToLocal() {
        localStorage.setItem('conference_experts', JSON.stringify(this.experts));
    },
    
    async deleteExpert(id) {
        try {
            if (this.supabase && this.currentUser) {
                const { error } = await this.supabase
                    .from('experts')
                    .delete()
                    .eq('id', id)
                    .eq('user_id', this.currentUser.id);
                
                if (error) throw error;
            }
            
            // 从本地数组中移除
            this.experts = this.experts.filter(e => e.id !== id);
            this.saveExpertsToLocal();
            
            return true;
        } catch (error) {
            console.error('删除专家失败:', error);
            return false;
        }
    },
    
    async loadTopics() {
        try {
            if (this.supabase) {
                // 尝试从 Supabase 加载
                const { data, error } = await this.supabase
                    .from('topics')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    this.topics = data.map(topic => ({
                        ...topic,
                        replies: topic.replies || []
                    }));
                    localStorage.setItem('conference_topics', JSON.stringify(this.topics));
                    return;
                }
            }
            
            // 如果 Supabase 加载失败，使用本地缓存
            this.loadTopicsFromLocal();
        } catch (error) {
            console.error('加载话题数据异常:', error);
            this.loadTopicsFromLocal();
        }
    },
    
    loadTopicsFromLocal() {
        const savedTopics = localStorage.getItem('conference_topics');
        if (savedTopics) {
            this.topics = JSON.parse(savedTopics);
        } else {
            this.topics = [];
            this.saveTopicsToLocal();
        }
    },
    
    async saveTopic(topic) {
        try {
            if (this.supabase && this.currentUser) {
                const topicToSave = {
                    ...topic,
                    author_id: this.currentUser.id,
                    author_name: this.userProfile?.full_name || this.currentUser.email,
                    updated_at: new Date().toISOString()
                };
                
                if (topic.id) {
                    const { data, error } = await this.supabase
                        .from('topics')
                        .update(topicToSave)
                        .eq('id', topic.id)
                        .eq('author_id', this.currentUser.id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    topic = data;
                } else {
                    topicToSave.created_at = new Date().toISOString();
                    const { data, error } = await this.supabase
                        .from('topics')
                        .insert([topicToSave])
                        .select()
                        .single();
                    
                    if (error) throw error;
                    topic = data;
                }
            }
            
            this.updateLocalTopic(topic);
            return topic;
        } catch (error) {
            console.error('保存话题失败:', error);
            this.updateLocalTopic(topic);
            return topic;
        }
    },
    
    updateLocalTopic(topic) {
        if (!topic.id) {
            topic.id = Date.now();
        }
        
        const existingIndex = this.topics.findIndex(t => t.id === topic.id);
        if (existingIndex >= 0) {
            this.topics[existingIndex] = topic;
        } else {
            this.topics.unshift(topic);
        }
        
        this.saveTopicsToLocal();
    },
    
    saveTopicsToLocal() {
        localStorage.setItem('conference_topics', JSON.stringify(this.topics));
    },
    
    async addReplyToTopic(topicId, reply) {
        try {
            if (this.supabase && this.currentUser) {
                const replyToSave = {
                    topic_id: topicId,
                    content: reply.content,
                    author_id: this.currentUser.id,
                    author_name: this.userProfile?.full_name || this.currentUser.email,
                    created_at: new Date().toISOString()
                };
                
                const { data, error } = await this.supabase
                    .from('replies')
                    .insert([replyToSave])
                    .select()
                    .single();
                
                if (error) throw error;
                reply = data;
            }
            
            // 更新本地数据
            const topic = this.topics.find(t => t.id === topicId);
            if (topic) {
                if (!topic.replies) topic.replies = [];
                topic.replies.push({
                    ...reply,
                    id: reply.id || Date.now(),
                    time: new Date().toLocaleString('zh-CN')
                });
                this.saveTopicsToLocal();
            }
            
            return reply;
        } catch (error) {
            console.error('添加回复失败:', error);
            return null;
        }
    },
    
    loadSponsors() {
        const savedSponsors = localStorage.getItem('conference_sponsors');
        if (savedSponsors) {
            this.sponsors = JSON.parse(savedSponsors);
        } else {
            this.sponsors = this.getDefaultSponsors();
            this.saveSponsorsToLocal();
        }
    },
    
    getDefaultSponsors() {
        return [
            { id: 1, name: '辉瑞制药', logo: '辉瑞', category: '药品' },
            { id: 2, name: '罗氏诊断', logo: '罗氏', category: '诊断' },
            { id: 3, name: '强生医疗', logo: '强生', category: '器械' },
            { id: 4, name: '美敦力', logo: '美敦力', category: '器械' },
            { id: 5, name: '西门子医疗', logo: '西门子', category: '设备' },
            { id: 6, name: 'GE医疗', logo: 'GE', category: '设备' },
            { id: 7, name: '飞利浦医疗', logo: '飞利浦', category: '设备' },
            { id: 8, name: '迈瑞医疗', logo: '迈瑞', category: '设备' },
            { id: 9, name: '拜耳医药', logo: '拜耳', category: '药品' },
            { id: 10, name: '雅培诊断', logo: '雅培', category: '诊断' },
            { id: 11, name: '波士顿科学', logo: '波士顿', category: '器械' },
            { id: 12, name: '赛诺菲', logo: '赛诺菲', category: '药品' },
            { id: 13, name: '阿斯利康', logo: 'AZ', category: '药品' },
            { id: 14, name: '诺华制药', logo: '诺华', category: '药品' },
            { id: 15, name: '默沙东', logo: '默沙东', category: '药品' },
            { id: 16, name: '武田药品', logo: '武田', category: '药品' }
        ];
    },
    
    saveSponsorsToLocal() {
        localStorage.setItem('conference_sponsors', JSON.stringify(this.sponsors));
    },
    
    saveProfile() {
        if (this.userProfile) {
            localStorage.setItem('conference_profile', JSON.stringify(this.userProfile));
        }
    },
    
    updateProfilePreview() {
        if (this.userProfile) {
            const profileAvatar = document.querySelector('.profile-avatar');
            const profileName = document.querySelector('.profile-name');
            const profileTitle = document.querySelector('.profile-title');
            const userAvatar = document.querySelector('.user-avatar');
            const userName = document.querySelector('.user-name');
            
            if (profileAvatar) profileAvatar.textContent = this.userProfile.avatar || 
                (this.userProfile.full_name?.charAt(0) || '医');
            if (profileName) profileName.textContent = this.userProfile.full_name || '未设置';
            if (profileTitle) profileTitle.textContent = this.userProfile.title || '点击编辑个人信息';
            if (userAvatar) userAvatar.textContent = this.userProfile.avatar || 
                (this.userProfile.full_name?.charAt(0) || '医');
            if (userName) userName.textContent = this.userProfile.full_name || '参会专家';
        } else {
            const profileName = document.querySelector('.profile-name');
            const profileTitle = document.querySelector('.profile-title');
            const userName = document.querySelector('.user-name');
            
            if (profileName) profileName.textContent = '未登录';
            if (profileTitle) profileTitle.textContent = '点击登录';
            if (userName) userName.textContent = '参会专家';
        }
    },
    
    loadPage(page) {
        console.log('AppState.loadPage()', page);
        this.currentPage = page;
        const contentDiv = document.getElementById('page-content');
        if (!contentDiv) {
            console.warn('AppState.loadPage: #page-content not found in DOM');
            return;
        }
        
        const sponsorSection = document.getElementById('sponsor-section');
        if (sponsorSection) {
            sponsorSection.style.display = page === 'home' ? 'block' : 'none';
        }
        
        switch(page) {
            case 'home':
                contentDiv.innerHTML = this.renderHome();
                this.setupHomeEvents();
                break;
            case 'experts':
                contentDiv.innerHTML = this.renderExperts();
                this.setupExpertEvents();
                break;
            case 'schedule':
                contentDiv.innerHTML = this.renderSchedule();
                break;
            case 'gallery':
                contentDiv.innerHTML = this.renderGallery();
                break;
            case 'forum':
                contentDiv.innerHTML = this.renderForum();
                this.setupForumEvents();
                break;
            case 'sponsors':
                contentDiv.innerHTML = this.renderSponsors();
                break;
            case 'profile':
                contentDiv.innerHTML = this.renderProfile();
                this.setupProfileEvents();
                break;
            case 'share':
                contentDiv.innerHTML = this.renderShare();
                break;
            default:
                contentDiv.innerHTML = this.renderHome();
                this.setupHomeEvents();
        }
        
        if (page === 'home') {
            this.renderSponsorLogos();
        }
    },
    
    renderHome() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-heartbeat"></i>欢迎参加2024医学年会
                </h1>
                <p style="text-align: center; color: #666; max-width: 800px; margin: 0 auto 30px; font-size: 1.1rem;">
                    汇聚医学智慧，共创健康未来。本次会议汇集了国内外顶尖医学专家，共同探讨医学前沿技术和临床实践经验。
                </p>
                
                <div class="home-modules">
                    <div class="home-module" data-page="experts" onclick="AppState.loadPage('experts')">
                        <div class="home-module-icon">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <h3 class="home-module-title">专家库</h3>
                        <p class="home-module-desc">浏览参会专家信息，查看专家详情和研究方向</p>
                    </div>
                    
                    <div class="home-module" data-page="profile" onclick="AppState.loadPage('profile')">
                        <div class="home-module-icon">
                            <i class="fas fa-id-card"></i>
                        </div>
                        <h3 class="home-module-title">专家名片</h3>
                        <p class="home-module-desc">创建并分享您的专家名片，与其他专家建立联系</p>
                    </div>
                    
                    <div class="home-module" data-page="schedule" onclick="AppState.loadPage('schedule')">
                        <div class="home-module-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <h3 class="home-module-title">会议日程</h3>
                        <p class="home-module-desc">查看详细会议安排，了解各场次时间和地点</p>
                    </div>
                    
                    <div class="home-module" data-page="gallery" onclick="AppState.loadPage('gallery')">
                        <div class="home-module-icon">
                            <i class="fas fa-images"></i>
                        </div>
                        <h3 class="home-module-title">会议内容</h3>
                        <p class="home-module-desc">浏览学术海报、会议照片和资料下载</p>
                    </div>
                    
                    <div class="home-module" data-page="forum" onclick="AppState.loadPage('forum')">
                        <div class="home-module-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <h3 class="home-module-title">学术论坛</h3>
                        <p class="home-module-desc">参与专业学术讨论，分享您的见解和经验</p>
                    </div>
                    
                    <div class="home-module" data-page="sponsors" onclick="AppState.loadPage('sponsors')">
                        <div class="home-module-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <h3 class="home-module-title">赞助商</h3>
                        <p class="home-module-desc">了解会议赞助商信息，探索最新医疗技术和产品</p>
                    </div>
                    
                    <div class="home-module" data-page="share" onclick="AppState.loadPage('share')">
                        <div class="home-module-icon">
                            <i class="fas fa-share-alt"></i>
                        </div>
                        <h3 class="home-module-title">分享会议</h3>
                        <p class="home-module-desc">邀请同事参会，分享会议信息和精彩内容</p>
                    </div>
                    
                    <div class="home-module" data-page="my-schedule" onclick="AppState.showMySchedule()">
                        <div class="home-module-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <h3 class="home-module-title">我的日程</h3>
                        <p class="home-module-desc">管理个人会议日程，设置提醒和关注场次</p>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
                    <h3 class="section-title" style="text-align: center; color: #0066cc; margin-bottom: 25px;">
                        <i class="fas fa-handshake"></i> 战略合作伙伴
                    </h3>
                    
                    <div class="sponsors-grid">
                        ${this.sponsors.slice(0, 12).map(sponsor => `
                            <div class="sponsor-item" onclick="AppState.showSponsorDetail(${sponsor.id})">
                                <div class="sponsor-logo-placeholder" style="background: linear-gradient(135deg, #ffe6e6, #ffcccc); color: #cc0000;">
                                    ${sponsor.logo}
                                </div>
                                <div class="sponsor-name">${sponsor.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    setupHomeEvents() {
        const homeItems = Array.from(document.querySelectorAll('.home-module'));
        homeItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                if (!page) return;
                this.loadPage(page);

                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                    if (navItem.getAttribute('data-page') === page) {
                        navItem.classList.add('active');
                    }
                });
            });
        });
    },
    
    renderSponsorLogos() {
        const sponsorGrid = document.querySelector('.sponsor-grid') || document.querySelector('.sponsors-grid');
        if (!sponsorGrid) return;

        sponsorGrid.innerHTML = this.sponsors.map(sponsor => `
            <div class="sponsor-logo" data-id="${sponsor.id}">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #0066cc; margin-bottom: 10px;">${sponsor.logo}</div>
                    <div style="font-size: 0.9rem; color: #333;">${sponsor.name}</div>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">${sponsor.category}</div>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.sponsor-logo').forEach(logo => {
            logo.addEventListener('click', () => {
                const sponsorId = logo.getAttribute('data-id');
                const sponsor = this.sponsors.find(s => s.id == sponsorId);
                if (sponsor) {
                    alert(`点击了赞助商：${sponsor.name}\n类别：${sponsor.category}\n了解更多请访问：${sponsor.url}`);
                }
            });
        });
    },
    
    renderShare() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-share-alt"></i>分享会议
                </h1>
                
                <div style="text-align: center; max-width: 600px; margin: 0 auto 40px;">
                    <div style="font-size: 5rem; color: #0066cc; margin-bottom: 20px;">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <h2 style="color: #333; margin-bottom: 15px;">邀请同事参加医学年会</h2>
                    <p style="color: #666; line-height: 1.6;">
                        分享本次医学年会信息，邀请您的同事和朋友一起参与。您可以分享会议链接或生成邀请函。
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #0066cc; margin-bottom: 15px;">
                            <i class="fas fa-link"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">分享链接</h3>
                        <p style="color: #666; margin-bottom: 20px; font-size: 0.9rem;">复制会议链接发送给同事</p>
                        <button class="btn btn-primary" onclick="AppState.copyConferenceLink()">
                            <i class="fas fa-copy"></i>复制链接
                        </button>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #0066cc; margin-bottom: 15px;">
                            <i class="fas fa-qrcode"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">会议二维码</h3>
                        <p style="color: #666; margin-bottom: 20px; font-size: 0.9rem;">扫描二维码访问会议页面</p>
                        <div style="background: white; padding: 15px; border-radius: 8px; display: inline-block;">
                            <div style="width: 120px; height: 120px; background: #f0f0f0; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-qrcode" style="font-size: 3rem; color: #999;"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; color: #0066cc; margin-bottom: 15px;">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">邀请函</h3>
                        <p style="color: #666; margin-bottom: 20px; font-size: 0.9rem;">生成并发送电子邀请函</p>
                        <button class="btn btn-primary" onclick="AppState.generateInvitation()">
                            <i class="fas fa-file-pdf"></i>生成邀请函
                        </button>
                    </div>
                </div>
                
                <div style="background: #f0f8ff; padding: 25px; border-radius: 12px; margin-top: 30px;">
                    <h3 style="color: #0066cc; margin-bottom: 15px;">会议基本信息</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <strong>会议名称：</strong>2024医学年会
                        </div>
                        <div>
                            <strong>会议时间：</strong>2024年11月15-17日
                        </div>
                        <div>
                            <strong>会议地点：</strong>北京国际会议中心
                        </div>
                        <div>
                            <strong>会议主题：</strong>创新医学，健康未来
                        </div>
                        <div>
                            <strong>主办单位：</strong>医学年会组委会
                        </div>
                        <div>
                            <strong>联系方式：</strong>conference@medical.org
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderExperts() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-user-md"></i>专家库
                </h1>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${this.experts.map(expert => `
                        <div style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 15px;">
                                <div style="width: 80px; height: 80px; border-radius: 50%; background: #0066cc; color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto; margin-bottom: 10px;">${expert.avatar}</div>
                                <h3 style="color: #333; margin: 10px 0;">${expert.name}</h3>
                                <p style="color: #0066cc; margin: 5px 0;">${expert.title}</p>
                                <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">${expert.department}</p>
                            </div>
                            <button class="btn btn-primary view-expert" data-id="${expert.id}" style="width: 100%;">
                                <i class="fas fa-eye"></i>查看详情
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderSchedule() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-calendar-alt"></i>会议日程
                </h1>
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-calendar-alt" style="font-size: 4rem; color: #0066cc; margin-bottom: 20px;"></i>
                    <h2 style="color: #333; margin-bottom: 15px;">会议日程</h2>
                    <p style="color: #666;">会议日程信息即将更新...</p>
                </div>
            </div>
        `;
    },

    renderForum() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-comments"></i>学术论坛
                </h1>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px;">发布话题</h3>
                    <form id="new-topic-form">
                        <input type="text" id="topic-title" placeholder="话题标题" class="form-control" style="margin-bottom: 10px;" required>
                        <textarea id="topic-content" placeholder="话题内容" class="form-control" style="margin-bottom: 10px; height: 80px;" required></textarea>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i>发布话题
                        </button>
                    </form>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">论坛讨论</h3>
                    ${this.topics.length > 0 ? this.topics.map(topic => `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; border-left: 3px solid #0066cc;">
                            <h4 style="color: #333; margin-bottom: 10px;">${topic.title}</h4>
                            <p style="color: #555; margin-bottom: 10px;">${topic.content}</p>
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #666; margin-bottom: 15px;">
                                <span>作者：${topic.author_name || topic.author}</span>
                                <span>${new Date(topic.created_at).toLocaleString('zh-CN')}</span>
                            </div>
                            
                            ${topic.replies && topic.replies.length > 0 ? `
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                    <h5 style="color: #666; margin-bottom: 10px;">回复 (${topic.replies.length})</h5>
                                    ${topic.replies.map(reply => `
                                        <div style="border-bottom: 1px solid #eee; padding: 8px 0;">
                                            <div style="color: #666; font-size: 0.9rem;"><strong>${reply.author_name || reply.author}</strong> - ${reply.time || new Date(reply.created_at).toLocaleString('zh-CN')}</div>
                                            <div style="color: #333; margin-top: 5px;">${reply.content}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            <div style="display: flex; gap: 10px;">
                                <input type="text" class="reply-input" data-id="${topic.id}" placeholder="添加回复..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                                <button class="btn btn-sm btn-primary reply-btn" data-id="${topic.id}">
                                    <i class="fas fa-reply"></i>回复
                                </button>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #666;">暂无话题，发布一个吧！</p>'}
                </div>
            </div>
        `;
    },

    renderProfile() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-id-card"></i>专家名片
                </h1>
                
                <form id="profile-form" style="max-width: 600px; margin: 0 auto;">
                    <div class="form-group">
                        <label for="profile-name">姓名</label>
                        <input type="text" id="profile-name" class="form-control" value="${this.userProfile ? this.userProfile.full_name : ''}" placeholder="请输入姓名" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-title">职位</label>
                        <input type="text" id="profile-title" class="form-control" value="${this.userProfile ? this.userProfile.title : ''}" placeholder="请输入职位" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-department">科室</label>
                        <input type="text" id="profile-department" class="form-control" value="${this.userProfile ? this.userProfile.department : ''}" placeholder="请输入科室" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-hospital">医院</label>
                        <input type="text" id="profile-hospital" class="form-control" value="${this.userProfile ? this.userProfile.hospital : ''}" placeholder="请输入医院名称" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-bio">个人简介</label>
                        <textarea id="profile-bio" class="form-control" placeholder="请输入个人简介" style="height: 80px;">${this.userProfile ? this.userProfile.bio : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-contact">联系方式</label>
                        <input type="text" id="profile-contact" class="form-control" value="${this.userProfile ? this.userProfile.contact : ''}" placeholder="请输入联系方式">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-save"></i>保存名片
                    </button>
                </form>
                
                ${this.userProfile ? `
                    <button class="btn btn-secondary" onclick="AppState.shareProfile()" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
                        <i class="fas fa-share-alt"></i>分享名片
                    </button>
                ` : ''}
            </div>
        `;
    },

    showMySchedule() {
        this.currentPage = 'my-schedule';
        const contentDiv = document.getElementById('page-content');
        contentDiv.innerHTML = `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-calendar-check"></i>我的会议日程
                </h1>
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 4rem; color: #0066cc; margin-bottom: 20px;">
                        <i class="fas fa-calendar-plus"></i>
                    </div>
                    <h2 style="color: #333; margin-bottom: 15px;">个人日程管理</h2>
                    <p style="color: #666; line-height: 1.6; max-width: 600px; margin: 0 auto 30px;">
                        您可以在此处管理您关注的会议日程，设置提醒，并查看您已安排的活动。
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 30px;">
                        <h3 style="color: #333; margin-bottom: 15px;">功能即将上线</h3>
                        <p style="color: #666;">个人日程管理功能正在开发中，敬请期待！</p>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
    },

    showSponsorDetail(sponsorId) {
        const sponsor = this.sponsors.find(s => s.id === sponsorId);
        if (sponsor) {
            alert(`赞助商：${sponsor.name}\n类别：${sponsor.category}\n\n感谢赞助商对会议的支持！`);
        }
    },
    
    copyConferenceLink() {
        const conferenceLink = window.location.href;
        navigator.clipboard.writeText(conferenceLink)
            .then(() => {
                alert('会议链接已复制到剪贴板！');
            })
            .catch(err => {
                alert('复制失败，请手动复制：\n' + conferenceLink);
            });
    },
    
    generateInvitation() {
        alert('邀请函生成功能正在开发中...');
    },
    
    setupExpertEvents() {
        document.querySelectorAll('.view-expert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expertId = e.target.getAttribute('data-id');
                this.showExpertDetail(expertId);
            });
        });
    },
    
    showExpertDetail(id) {
        const expert = this.experts.find(e => e.id == id);
        if (!expert) return;
        
        const detailHTML = `
            <div class="page-card">
                <button class="btn btn-primary" onclick="AppState.loadPage('experts')" style="margin-bottom: 20px;">
                    <i class="fas fa-arrow-left"></i>返回专家列表
                </button>
                
                <div style="text-align: center;">
                    <div class="expert-avatar" style="width: 150px; height: 150px; font-size: 3rem;">${expert.avatar}</div>
                    <h1 style="color: #0066cc; margin: 20px 0 10px;">${expert.name}</h1>
                    <h2 style="color: #0099cc; margin-bottom: 15px;">${expert.title}</h2>
                    <h3 style="color: #666; margin-bottom: 20px;">${expert.department} | ${expert.hospital}</h3>
                </div>
                
                <div style="max-width: 800px; margin: 0 auto; padding: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">个人简介</h3>
                    <p style="line-height: 1.8; color: #555; font-size: 1.1rem;">${expert.bio}</p>
                    
                    <div style="margin-top: 40px;">
                        <h3 style="color: #333; margin-bottom: 15px;">联系方式</h3>
                        <p style="color: #555;">如需联系该专家，请联系会议组委会</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('page-content').innerHTML = detailHTML;
    },
    
    setupForumEvents() {
        const form = document.getElementById('new-topic-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewTopic();
            });
        }
        
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topicId = e.target.getAttribute('data-id');
                this.addReply(topicId);
            });
        });
        
        document.querySelectorAll('.reply-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const topicId = e.target.getAttribute('data-id');
                    this.addReply(topicId);
                }
            });
        });
    },
    
    async createNewTopic() {
        const title = document.getElementById('topic-title').value;
        const content = document.getElementById('topic-content').value;
        
        if (!title || !content) {
            alert('请填写完整的话题标题和内容');
            return;
        }
        
        const authorName = this.userProfile?.full_name || this.currentUser?.email || '匿名用户';
        
        const newTopic = {
            title: title,
            content: content,
            author_name: authorName,
            time: new Date().toLocaleString('zh-CN'),
            replies: []
        };
        
        const savedTopic = await this.saveTopic(newTopic);
        
        if (savedTopic) {
            document.getElementById('topic-title').value = '';
            document.getElementById('topic-content').value = '';
            this.loadPage('forum');
        }
    },
    
    async addReply(topicId) {
        const input = document.querySelector(`.reply-input[data-id="${topicId}"]`);
        const content = input.value.trim();
        
        if (!content) return;
        
        const authorName = this.userProfile?.full_name || this.currentUser?.email || '匿名用户';
        
        const reply = {
            content: content,
            author_name: authorName
        };
        
        const savedReply = await this.addReplyToTopic(topicId, reply);
        
        if (savedReply) {
            input.value = '';
            this.loadPage('forum');
        }
    },
    
    setupProfileEvents() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveUserProfile();
            });
        }
    },
    
    async saveUserProfile() {
        const profile = {
            full_name: document.getElementById('profile-name').value,
            title: document.getElementById('profile-title').value,
            department: document.getElementById('profile-department').value,
            hospital: document.getElementById('profile-hospital').value,
            bio: document.getElementById('profile-bio').value,
            contact: document.getElementById('profile-contact').value,
            avatar: document.getElementById('profile-name').value.charAt(0) || '专'
        };
        
        let success = false;
        
        if (this.currentUser && this.supabase) {
            success = await this.saveProfileToSupabase(profile);
        } else {
            this.userProfile = profile;
            this.saveProfile();
            success = true;
        }
        
        if (success) {
            alert('名片保存成功！');
            
            // 如果专家列表中还没有该专家，则添加
            if (!this.experts.some(e => e.name === profile.full_name)) {
                const expertToAdd = {
                    ...profile,
                    name: profile.full_name
                };
                await this.saveExpert(expertToAdd);
            }
            
            this.loadPage('profile');
        } else {
            alert('名片保存失败，请重试！');
        }
    },
    
    shareProfile() {
        if (!this.userProfile) {
            alert('请先创建名片');
            return;
        }
        
        const profileData = encodeURIComponent(JSON.stringify(this.userProfile));
        const shareUrl = `${window.location.origin}${window.location.pathname}#profile-share-${profileData}`;
        
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                alert('分享链接已复制到剪贴板！\n\n您可以将此链接发送给其他参会者。');
            })
            .catch(err => {
                alert(`请复制以下链接分享给其他参会者：\n\n${shareUrl}`);
            });
    },
    
    renderGallery() {
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-images"></i>会议内容
                </h1>
                
                <div style="margin-bottom: 40px;">
                    <h3 style="color: #333; margin-bottom: 20px;">学术海报</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                        ${this.renderPosterCards()}
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 20px;">会议照片</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                        ${this.renderPhotoCards()}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderPosterCards() {
        const posters = [
            { title: '心血管疾病研究', author: '张明', id: 1 },
            { title: '神经外科新技术', author: '李华', id: 2 },
            { title: '肿瘤治疗进展', author: '王芳', id: 3 },
            { title: '内分泌研究', author: '刘伟', id: 4 }
        ];
        
        return posters.map(poster => `
            <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                <div style="height: 200px; background: linear-gradient(135deg, #0066cc, #0099cc); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-file-pdf" style="font-size: 4rem; color: white;"></i>
                </div>
                <div style="padding: 20px;">
                    <h4 style="margin-bottom: 10px; color: #333;">${poster.title}</h4>
                    <p style="color: #666; font-size: 0.9rem;">作者：${poster.author}</p>
                    <button class="btn btn-primary" style="margin-top: 15px; width: 100%;">
                        <i class="fas fa-download"></i>下载海报
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    renderPhotoCards() {
        const photos = Array.from({length: 8}, (_, i) => i + 1);
        
        return photos.map(num => `
            <div style="height: 200px; background: linear-gradient(135deg, #f0f0f0, #e0e0e0); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <div style="text-align: center;">
                    <i class="fas fa-camera" style="font-size: 2rem; color: #999;"></i>
                    <div style="margin-top: 10px; color: #666;">会议照片 ${num}</div>
                </div>
            </div>
        `).join('');
    },
    
    renderSponsors() {
        const sponsors = [
            { name: '辉瑞制药', logo: 'Pfizer', url: '#' },
            { name: '罗氏诊断', logo: 'Roche', url: '#' },
            { name: '强生医疗', logo: 'J&J', url: '#' },
            { name: '美敦力', logo: 'Medtronic', url: '#' },
            { name: '西门子医疗', logo: 'Siemens', url: '#' },
            { name: 'GE医疗', logo: 'GE', url: '#' }
        ];
        
        return `
            <div class="page-card">
                <h1 class="page-title">
                    <i class="fas fa-handshake"></i>赞助商
                </h1>
                
                <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                    衷心感谢以下赞助商对本次医学年会的大力支持。他们的贡献对会议的顺利举办起到了重要作用。
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; margin-top: 40px;">
                    ${sponsors.map(sponsor => `
                        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); text-align: center; border: 2px solid #f0f0f0; transition: transform 0.3s;">
                            <div style="height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <div style="font-size: 2rem; font-weight: bold; color: #0066cc; background: #f0f8ff; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                                    ${sponsor.logo}
                                </div>
                            </div>
                            <h3 style="color: #333; margin-bottom: 15px;">${sponsor.name}</h3>
                            <a href="${sponsor.url}" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">
                                <i class="fas fa-external-link-alt"></i>了解更多
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    // 将AppState暴露到全局作用域
    window.app = AppState;
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        if (window.app && window.app.applyDefaultCollapsedState) {
            window.app.applyDefaultCollapsedState();
        }
    });
    
    await AppState.init();
});