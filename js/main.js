// 扩展AppState的功能
Object.assign(AppState, {
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
        // 新话题表单
        const form = document.getElementById('new-topic-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewTopic();
            });
        }
        
        // 回复按钮
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topicId = e.target.getAttribute('data-id');
                this.addReply(topicId);
            });
        });
        
        // 回复输入框回车事件
        document.querySelectorAll('.reply-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const topicId = e.target.getAttribute('data-id');
                    this.addReply(topicId);
                }
            });
        });
    },
    
    createNewTopic() {
        const title = document.getElementById('topic-title').value;
        const content = document.getElementById('topic-content').value;
        const author = this.userProfile ? this.userProfile.name : '匿名用户';
        
        if (!title || !content) {
            alert('请填写完整的话题标题和内容');
            return;
        }
        
        const newTopic = {
            id: Date.now(),
            author: author,
            title: title,
            content: content,
            time: new Date().toLocaleString('zh-CN'),
            replies: []
        };
        
        this.topics.unshift(newTopic);
        this.saveTopics();
        
        // 清空表单
        document.getElementById('topic-title').value = '';
        document.getElementById('topic-content').value = '';
        
        // 重新加载论坛页面
        this.loadPage('forum');
    },
    
    addReply(topicId) {
        const input = document.querySelector(`.reply-input[data-id="${topicId}"]`);
        const content = input.value.trim();
        
        if (!content) return;
        
        const topic = this.topics.find(t => t.id == topicId);
        if (topic) {
            const author = this.userProfile ? this.userProfile.name : '匿名用户';
            topic.replies.push({
                author: author,
                content: content,
                time: new Date().toLocaleString('zh-CN')
            });
            
            this.saveTopics();
            input.value = '';
            
            // 重新加载论坛页面
            this.loadPage('forum');
        }
    },
    
    setupProfileEvents() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUserProfile();
            });
        }
    },
    
    saveUserProfile() {
        const profile = {
            name: document.getElementById('profile-name').value,
            title: document.getElementById('profile-title').value,
            department: document.getElementById('profile-department').value,
            hospital: document.getElementById('profile-hospital').value,
            bio: document.getElementById('profile-bio').value,
            contact: document.getElementById('profile-contact').value,
            avatar: document.getElementById('profile-name').value.charAt(0) || '专'
        };
        
        this.userProfile = profile;
        this.saveProfile();
        
        // 如果专家列表中还没有该专家，则添加
        if (!this.experts.some(e => e.name === profile.name)) {
            profile.id = Date.now();
            this.experts.push(profile);
            this.saveExperts();
        }
        
        alert('名片保存成功！');
        this.loadPage('profile');
    },
    
    shareProfile() {
        if (!this.userProfile) {
            alert('请先创建名片');
            return;
        }
        
        // 创建分享链接
        const profileData = encodeURIComponent(JSON.stringify(this.userProfile));
        const shareUrl = `${window.location.origin}${window.location.pathname}#profile-share-${profileData}`;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                alert('分享链接已复制到剪贴板！\n\n您可以将此链接发送给其他参会者。');
            })
            .catch(err => {
                // 如果复制失败，显示分享链接
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
    }
});