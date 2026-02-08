// 医学会议应用 - 辅助功能与工具
class MedicalConferenceUtils {
    constructor(app) {
        this.app = app;
        console.log('MedicalConferenceUtils 初始化，app:', app);
        this.init();
    }
    
    init() {
        console.log('MedicalConferenceUtils.init()');
        
        // 确保 this.app 存在
        if (!this.app) {
            console.warn('MedicalConferenceUtils: app 对象未初始化');
            return;
        }
        
        this.setupKeyboardShortcuts();
        this.setupOfflineDetection();
        this.setupPrintButton();
        this.setupDataExport();
        this.setupBackToTop();
        
        // 延迟添加搜索功能（确保DOM完全加载）
        setTimeout(() => {
            if (this.app && typeof this.app.currentPage !== 'undefined' && this.app.currentPage === 'home') {
                this.addSearchFunctionality();
            }
        }, 1500);
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        if (!this.app) return;
        
        document.addEventListener('keydown', (e) => {
            if (!this.app) return; // 双重检查
            
            // Ctrl+H 或 Cmd+H 返回首页
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                if (this.app.loadPage) {
                    this.app.loadPage('home');
                }
            }
            
            // Esc 键关闭右侧边栏
            if (e.key === 'Escape' && typeof this.app.rightSidebarCollapsed !== 'undefined' && !this.app.rightSidebarCollapsed) {
                if (this.app.toggleRightSidebar) {
                    this.app.toggleRightSidebar();
                }
            }
            
            // Ctrl+B 或 Cmd+B 切换左侧边栏
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                if (this.app.toggleLeftSidebar) {
                    this.app.toggleLeftSidebar();
                }
            }
        });
    }
    
    // 设置离线检测
    setupOfflineDetection() {
        const self = this;
        
        window.addEventListener('online', () => {
            self.showNotification('网络连接已恢复', 'success');
        });
        
        window.addEventListener('offline', () => {
            self.showNotification('网络连接已断开，部分功能可能受限', 'warning');
        });
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 移除现有的通知
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
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
        
        // 添加动画样式
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
    
    // 设置打印按钮
    setupPrintButton() {
        // 在右侧边栏添加打印按钮
        const printBtn = document.createElement('a');
        printBtn.className = 'profile-nav-item';
        printBtn.innerHTML = '<i class="fas fa-print"></i><span>打印页面</span>';
        printBtn.href = '#';
        printBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.print();
        });
        
        const profileNav = document.querySelector('.right-sidebar-nav');
        if (profileNav) {
            profileNav.appendChild(printBtn);
        }
    }
    
    // 设置数据导出功能
    setupDataExport() {
        // 在右侧边栏添加数据管理按钮（开发模式下）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const dataBtn = document.createElement('a');
            dataBtn.className = 'profile-nav-item';
            dataBtn.innerHTML = '<i class="fas fa-database"></i><span>数据管理</span>';
            dataBtn.href = '#';
            dataBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDataManagement();
            });
            
            const profileNav = document.querySelector('.right-sidebar-nav');
            if (profileNav) {
                profileNav.appendChild(dataBtn);
            }
        }
    }
    
    // 显示数据管理界面
    showDataManagement() {
        const action = prompt('请输入操作：\n1. 导出数据\n2. 导入数据\n3. 重置数据\n4. 查看数据统计');
        
        switch(action) {
            case '1':
                this.exportData();
                break;
            case '2':
                this.importData();
                break;
            case '3':
                if (confirm('确定要重置所有数据吗？这将删除所有专家、话题和赞助商数据。')) {
                    localStorage.clear();
                    location.reload();
                }
                break;
            case '4':
                this.showDataStats();
                break;
        }
    }
    
    // 导出数据
    exportData() {
        if (!this.app) {
            alert('应用未初始化');
            return;
        }
        
        const data = {
            experts: this.app.experts || [],
            topics: this.app.topics || [],
            sponsors: this.app.sponsors || [],
            userProfile: this.app.userProfile || null,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-conference-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('数据导出成功！');
    }
    
    // 导入数据
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (confirm('导入数据将覆盖当前数据，确定要导入吗？')) {
                        if (data.experts && this.app) this.app.experts = data.experts;
                        if (data.topics && this.app) this.app.topics = data.topics;
                        if (data.sponsors && this.app) this.app.sponsors = data.sponsors;
                        if (data.userProfile && this.app) this.app.userProfile = data.userProfile;
                        
                        // 保存到本地存储
                        if (this.app.saveExperts) this.app.saveExperts();
                        if (this.app.saveTopics) this.app.saveTopics();
                        if (this.app.saveSponsors) this.app.saveSponsors();
                        if (this.app.saveProfile) this.app.saveProfile();
                        
                        // 更新界面
                        if (this.app.updateProfilePreview) this.app.updateProfilePreview();
                        
                        // 重新加载当前页面
                        if (this.app.loadPage) {
                            this.app.loadPage(this.app.currentPage || 'home');
                        }
                        
                        alert('数据导入成功！');
                    }
                } catch (error) {
                    alert('数据导入失败：文件格式不正确');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // 显示数据统计
    showDataStats() {
        if (!this.app) {
            alert('应用未初始化');
            return;
        }
        
        const stats = `
            数据统计：
            
            专家数量：${(this.app.experts || []).length}
            论坛话题：${(this.app.topics || []).length}
            赞助商数量：${(this.app.sponsors || []).length}
            用户资料：${this.app.userProfile ? '已设置' : '未设置'}
            
            本地存储使用：${this.calculateStorageSize()}
        `;
        
        alert(stats);
    }
    
    // 计算存储空间使用
    calculateStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // 每个字符2字节
            }
        }
        
        if (total < 1024) {
            return `${total} B`;
        } else if (total < 1024 * 1024) {
            return `${(total / 1024).toFixed(2)} KB`;
        } else {
            return `${(total / (1024 * 1024)).toFixed(2)} MB`;
        }
    }
    
    // 设置返回顶部按钮
    setupBackToTop() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 44px;
            height: 44px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
            z-index: 999;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            font-size: 18px;
        `;
        
        document.body.appendChild(backToTopBtn);
        
        // 显示/隐藏按钮
        let scrollTimeoutId;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.transform = 'translateY(0)';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.transform = 'translateY(20px)';
            }
        });
        
        // 点击返回顶部
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 添加搜索功能
    addSearchFunctionality() {
        if (!this.app) return;
        
        // 在首页添加搜索框
        const searchBox = document.createElement('div');
        searchBox.innerHTML = `
            <div style="margin: 20px 0; max-width: 500px; margin-left: auto; margin-right: auto;">
                <div style="position: relative;">
                    <input type="text" id="globalSearch" class="form-control" placeholder="搜索专家、话题、赞助商...">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #999;"></i>
                </div>
            </div>
        `;
        
        // 在首页标题后插入搜索框
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle && pageTitle.parentNode) {
            pageTitle.parentNode.insertBefore(searchBox, pageTitle.nextSibling);
            
            // 添加搜索功能
            const searchInput = document.getElementById('globalSearch');
            const self = this;
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    self.performSearch(e.target.value);
                });
            }
        }
    }
    
    // 执行搜索
    performSearch(query) {
        if (!query.trim() || !this.app) return;
        
        // 搜索专家
        const expertResults = (this.app.experts || []).filter(expert => 
            (expert.name && expert.name.includes(query)) || 
            (expert.department && expert.department.includes(query)) || 
            (expert.hospital && expert.hospital.includes(query))
        );
        
        // 搜索话题
        const topicResults = (this.app.topics || []).filter(topic => 
            (topic.title && topic.title.includes(query)) || 
            (topic.content && topic.content.includes(query)) || 
            (topic.author && topic.author.includes(query))
        );
        
        // 搜索赞助商
        const sponsorResults = (this.app.sponsors || []).filter(sponsor => 
            (sponsor.name && sponsor.name.includes(query)) || 
            (sponsor.category && sponsor.category.includes(query))
        );
        
        // 显示搜索结果
        this.showSearchResults(expertResults, topicResults, sponsorResults, query);
    }
    
    // 显示搜索结果
    showSearchResults(expertResults, topicResults, sponsorResults, query) {
        if (!query) return;
        
        const resultsHTML = `
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3 style="color: #333; margin-bottom: 20px;">搜索结果： "${query}"</h3>
                
                ${expertResults.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #0066cc; margin-bottom: 10px;">专家 (${expertResults.length})</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                            ${expertResults.map(expert => `
                                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee; cursor: pointer;" data-id="${expert.id}" data-type="expert">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #0066cc; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${expert.avatar || '专'}</div>
                                        <div>
                                            <div style="font-weight: 500; color: #333;">${expert.name || '未命名'}</div>
                                            <div style="font-size: 12px; color: #666;">${expert.department || ''}</div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${topicResults.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #0066cc; margin-bottom: 10px;">论坛话题 (${topicResults.length})</h4>
                        ${topicResults.map(topic => `
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 3px solid #0066cc; margin-bottom: 10px; cursor: pointer;" data-id="${topic.id}" data-type="topic">
                                <div style="font-weight: 500; color: #333; margin-bottom: 5px;">${topic.title || '无标题'}</div>
                                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                                    <span>作者：${topic.author || '匿名'}</span>
                                    <span>${topic.time || ''}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${sponsorResults.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #0066cc; margin-bottom: 10px;">赞助商 (${sponsorResults.length})</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px;">
                            ${sponsorResults.map(sponsor => `
                                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee; text-align: center; cursor: pointer;" data-id="${sponsor.id}" data-type="sponsor">
                                    <div style="font-weight: bold; color: #0066cc; margin-bottom: 5px;">${sponsor.logo || '企'}</div>
                                    <div style="font-size: 12px; color: #333;">${sponsor.name || '未命名'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${expertResults.length === 0 && topicResults.length === 0 && sponsorResults.length === 0 ? `
                    <div style="text-align: center; padding: 30px; color: #666;">
                        <i class="fas fa-search" style="font-size: 36px; margin-bottom: 15px; color: #ccc;"></i>
                        <div>没有找到与 "${query}" 相关的结果</div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // 替换首页内容显示搜索结果
        const modulesContainer = document.querySelector('.home-modules');
        if (modulesContainer) {
            const parent = modulesContainer.parentNode;
            const searchResultsContainer = document.createElement('div');
            searchResultsContainer.id = 'searchResults';
            searchResultsContainer.innerHTML = resultsHTML;
            
            // 隐藏原始模块
            modulesContainer.style.display = 'none';
            
            // 插入搜索结果
            parent.insertBefore(searchResultsContainer, modulesContainer.nextSibling);
            
            // 添加搜索结果点击事件
            searchResultsContainer.querySelectorAll('[data-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    const type = item.getAttribute('data-type');
                    
                    if (type === 'expert' && this.app && this.app.showExpertDetail) {
                        this.app.showExpertDetail(parseInt(id));
                    } else if (type === 'topic' && this.app && this.app.loadPage) {
                        this.app.loadPage('forum');
                    } else if (type === 'sponsor' && this.app && this.app.showSponsorDetail) {
                        this.app.showSponsorDetail(parseInt(id));
                    }
                });
            });
            
            // 添加搜索框清除功能
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                const originalOnInput = searchInput.oninput;
                searchInput.oninput = function(e) {
                    if (e.target.value.trim() === '') {
                        // 清空搜索，恢复原始内容
                        modulesContainer.style.display = 'grid';
                        if (searchResultsContainer.parentNode) {
                            searchResultsContainer.parentNode.removeChild(searchResultsContainer);
                        }
                    }
                    if (originalOnInput) {
                        originalOnInput.call(this, e);
                    }
                };
            }
        }
    }
}

// 初始化工具类
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - app.js开始初始化');
    
    // 等待app对象可用并完全初始化
    const initAppUtils = () => {
        if (window.app && window.app.currentPage && window.app.loadPage) {
            console.log('window.app 已完全定义，创建 MedicalConferenceUtils');
            try {
                window.appUtils = new MedicalConferenceUtils(window.app);
            } catch (error) {
                console.error('MedicalConferenceUtils 初始化失败:', error);
            }
        } else {
            console.log('window.app 未完全初始化，等待...');
            // 等待200ms再试
            if (window.appInitAttempts === undefined) {
                window.appInitAttempts = 0;
            }
            if (window.appInitAttempts < 20) { // 最多等待4秒
                window.appInitAttempts++;
                setTimeout(initAppUtils, 200);
            } else {
                console.error('window.app 初始化超时');
            }
        }
    };
    
    // 开始初始化
    initAppUtils();
});