// 医学会议应用 - 辅助功能与工具
class MedicalConferenceUtils {
    constructor(app) {
        this.app = app;
        this.init();
    }
    
    init() {
        this.setupKeyboardShortcuts();
        this.setupOfflineDetection();
        this.setupPrintButton();
        this.setupDataExport();
        this.setupBackToTop();
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+H 或 Cmd+H 返回首页
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.app.navigateTo('home');
            }
            
            // Esc 键关闭右侧边栏
            if (e.key === 'Escape' && !this.app.state.rightSidebarCollapsed) {
                this.app.toggleRightSidebar();
            }
            
            // Ctrl+B 或 Cmd+B 切换左侧边栏
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.app.toggleLeftSidebar();
            }
        });
    }
    
    // 设置离线检测
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.showNotification('网络连接已恢复', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('网络连接已断开，部分功能可能受限', 'warning');
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
        
        const profileNav = document.querySelector('.profile-nav-menu');
        if (profileNav) {
            profileNav.insertBefore(printBtn, profileNav.lastElementChild);
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
            
            const profileNav = document.querySelector('.profile-nav-menu');
            if (profileNav) {
                profileNav.insertBefore(dataBtn, profileNav.lastElementChild);
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
        const data = {
            experts: this.app.state.experts,
            topics: this.app.state.topics,
            sponsors: this.app.state.sponsors,
            userProfile: this.app.state.userProfile,
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
                        if (data.experts) this.app.state.experts = data.experts;
                        if (data.topics) this.app.state.topics = data.topics;
                        if (data.sponsors) this.app.state.sponsors = data.sponsors;
                        if (data.userProfile) this.app.state.userProfile = data.userProfile;
                        
                        // 保存到本地存储
                        this.app.saveExperts();
                        this.app.saveTopics();
                        this.app.saveSponsors();
                        this.app.saveProfile();
                        
                        // 更新界面
                        this.app.updateProfileSummary();
                        
                        // 重新加载当前页面
                        this.app.navigateTo(this.app.state.currentPage);
                        
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
        const stats = `
            数据统计：
            
            专家数量：${this.app.state.experts.length}
            论坛话题：${this.app.state.topics.length}
            赞助商数量：${this.app.state.sponsors.length}
            用户资料：${this.app.state.userProfile ? '已设置' : '未设置'}
            
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
        const homeHeader = document.querySelector('.home-header');
        if (homeHeader) {
            homeHeader.parentNode.insertBefore(searchBox, homeHeader.nextSibling);
            
            // 添加搜索功能
            const searchInput = document.getElementById('globalSearch');
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }
    
    // 执行搜索
    performSearch(query) {
        if (!query.trim()) return;
        
        // 搜索专家
        const expertResults = this.app.state.experts.filter(expert => 
            expert.name.includes(query) || 
            expert.department.includes(query) || 
            expert.hospital.includes(query)
        );
        
        // 搜索话题
        const topicResults = this.app.state.topics.filter(topic => 
            topic.title.includes(query) || 
            topic.content.includes(query) || 
            topic.author.includes(query)
        );
        
        // 搜索赞助商
        const sponsorResults = this.app.state.sponsors.filter(sponsor => 
            sponsor.name.includes(query) || 
            sponsor.category.includes(query)
        );
        
        // 显示搜索结果
        this.showSearchResults(expertResults, topicResults, sponsorResults, query);
    }
    
    // 显示搜索结果
    showSearchResults(expertResults, topicResults, sponsorResults, query) {
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
                                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #0066cc; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${expert.avatar}</div>
                                        <div>
                                            <div style="font-weight: 500; color: #333;">${expert.name}</div>
                                            <div style="font-size: 12px; color: #666;">${expert.department}</div>
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
                                <div style="font-weight: 500; color: #333; margin-bottom: 5px;">${topic.title}</div>
                                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                                    <span>作者：${topic.author}</span>
                                    <span>${topic.time}</span>
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
                                    <div style="font-weight: bold; color: #0066cc; margin-bottom: 5px;">${sponsor.logo}</div>
                                    <div style="font-size: 12px; color: #333;">${sponsor.name}</div>
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
        const modulesContainer = document.querySelector('.modules-container');
        if (modulesContainer) {
            modulesContainer.style.display = 'none';
            
            const searchResultsContainer = document.createElement('div');
            searchResultsContainer.id = 'searchResults';
            searchResultsContainer.innerHTML = resultsHTML;
            
            modulesContainer.parentNode.insertBefore(searchResultsContainer, modulesContainer.nextSibling);
            
            // 添加搜索结果点击事件
            searchResultsContainer.querySelectorAll('[data-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    const type = item.getAttribute('data-type');
                    
                    if (type === 'expert') {
                        this.app.showExpertDetail(parseInt(id));
                    } else if (type === 'topic') {
                        this.app.navigateTo('forum');
                    } else if (type === 'sponsor') {
                        this.app.showSponsorDetail(parseInt(id));
                    }
                });
            });
        }
    }
}

// 初始化工具类
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.appUtils = new MedicalConferenceUtils(window.app);
        
        // 延迟添加搜索功能
        setTimeout(() => {
            if (window.app.state.currentPage === 'home') {
                window.appUtils.addSearchFunctionality();
            }
        }, 1000);
    }
});