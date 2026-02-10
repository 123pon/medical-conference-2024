// 美化后的renderProfile函数 - 请替换原函数
// 粘贴此代码到 AppState 对象中，替换原来的 renderProfile 方法

renderProfile() {
    const name = this.userProfile?.full_name || '未设置';
    const title = this.userProfile?.title || '职位';
    const dept = this.userProfile?.department || '科室';
    const hosp = this.userProfile?.hospital || '医院';
    const bio = this.userProfile?.bio || '暂无个人简介';
    const contact = this.userProfile?.contact || '暂无';
    
    return `
        <div class="page-card">
            <h1 class="page-title">
                <i class="fas fa-id-card"></i>专家名片
            </h1>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px;">
                <!-- 左侧：编辑表单 -->
                <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); padding: 30px; border-radius: 12px; border: 1px solid #e0e0e0;">
                    <h3 style="color: #333; margin-bottom: 25px; font-size: 1.2rem; font-weight: 700;">
                        <i class="fas fa-edit" style="color: #0066cc; margin-right: 8px;"></i>编辑名片信息
                    </h3>
                    
                    <form id="profile-form">
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.95rem;">
                                <i class="fas fa-user" style="color: #0066cc; margin-right: 6px;"></i>姓名
                            </label>
                            <input type="text" id="profile-name" value="${this.userProfile ? this.userProfile.full_name : ''}" placeholder="请输入姓名" required style="width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: all 0.3s;">
                        </div>
                        
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.95rem;">
                                <i class="fas fa-briefcase" style="color: #0066cc; margin-right: 6px;"></i>职位
                            </label>
                            <input type="text" id="profile-title" value="${this.userProfile ? this.userProfile.title : ''}" placeholder="如：主任医师" required style="width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.95rem;">
                                <i class="fas fa-stethoscope" style="color: #0066cc; margin-right: 6px;"></i>科室
                            </label>
                            <input type="text" id="profile-department" value="${this.userProfile ? this.userProfile.department : ''}" placeholder="如：心内科" required style="width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.95rem;">
                                <i class="fas fa-hospital" style="color: #0066cc; margin-right: 6px;"></i>医院
                            </label>
                            <input type="text" id="profile-hospital" value="${this.userProfile ? this.userProfile.hospital : ''}" placeholder="如：协和医院" required style="width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.95rem;">
                                <i class="fas fa-align-left" style="color: #0066cc; margin-right: 6px;"></i>个人简介
                            </label>
                            <textarea id="profile-bio" placeholder="请输入个人简介或研究方向" style="width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; height: 100px; resize: vertical; font-family: inherit;">${this.userProfile ? this.userProfile.bio : ''}</textarea>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.95rem;">
                                <i class="fas fa-phone" style="color: #0066cc; margin-right: 6px;"></i>联系方式
                            </label>
                            <input type="text" id="profile-contact" value="${this.userProfile ? this.userProfile.contact : ''}" placeholder="邮箱或电话" style="width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <button type="submit" style="width: 100%; padding: 14px; margin-top: 10px; background: linear-gradient(135deg, #0066cc, #0099cc); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0, 102, 204, 0.2);">
                            <i class="fas fa-save" style="margin-right: 8px;"></i>保存名片
                        </button>
                    </form>
                </div>
                
                <!-- 右侧：名片预览 -->
                <div>
                    <h3 style="color: #333; margin-bottom: 25px; font-size: 1.2rem; font-weight: 700;">
                        <i class="fas fa-eye" style="color: #0066cc; margin-right: 8px;"></i>名片预览
                    </h3>
                    
                    <!-- 名片卡片 -->
                    <div style="
                        background: linear-gradient(135deg, #0066cc 0%, #0099cc 100%);
                        border-radius: 16px;
                        padding: 40px 30px;
                        color: white;
                        text-align: center;
                        box-shadow: 0 20px 60px rgba(0, 102, 204, 0.3);
                        min-height: 420px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        position: relative;
                        overflow: hidden;
                    ">
                        <!-- 背景装饰 -->
                        <div style="position: absolute; top: -30px; right: -30px; width: 200px; height: 200px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -40px; left: -40px; width: 180px; height: 180px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                        
                        <!-- 内容 -->
                        <div style="position: relative; z-index: 2;">
                            <!-- 头像 -->
                            <div style="
                                width: 100px;
                                height: 100px;
                                margin: 0 auto 25px;
                                background: rgba(255,255,255,0.25);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 3.5rem;
                                font-weight: bold;
                                border: 3px solid rgba(255,255,255,0.4);
                                box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                            ">
                                ${name.charAt(0)}
                            </div>
                            
                            <!-- 名字 -->
                            <h2 style="font-size: 2.2rem; margin: 0 0 12px 0; font-weight: 900; letter-spacing: 1px;">
                                ${name}
                            </h2>
                            
                            <!-- 职位 -->
                            <p style="font-size: 1.15rem; margin: 0 0 8px 0; opacity: 0.95; font-weight: 600;">
                                ${title}
                            </p>
                            
                            <!-- 科室和医院 -->
                            <p style="font-size: 0.95rem; margin: 0 0 20px 0; opacity: 0.85;">
                                ${dept} | ${hosp}
                            </p>
                        </div>
                        
                        <!-- 分割线 -->
                        <div style="height: 1px; background: rgba(255,255,255,0.3); margin: 25px 0;"></div>
                        
                        <!-- 简介 -->
                        <div style="position: relative; z-index: 2; text-align: left;">
                            <p style="font-size: 0.9rem; line-height: 1.7; margin: 0 0 20px 0; opacity: 0.9; font-style: italic;">
                                <i class="fas fa-quote-left" style="margin-right: 10px; opacity: 0.6;"></i>${bio}
                            </p>
                            
                            ${contact !== '暂无' ? `
                                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem; opacity: 0.85;">
                                    <i class="fas fa-phone-alt"></i>
                                    <span>${contact}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- 底部 -->
                        <div style="position: relative; z-index: 2; margin-top: 20px;">
                            <p style="font-size: 0.75rem; opacity: 0.7; margin: 0;">
                                <i class="fas fa-heartbeat" style="margin-right: 6px;"></i>2024 医学年会
                            </p>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    ${this.userProfile ? `
                        <div style="margin-top: 20px;">
                            <button onclick="AppState.shareProfile()" style="
                                width: 100%;
                                padding: 14px;
                                background: linear-gradient(135deg, #f0f8ff, #e6f2ff);
                                color: #0066cc;
                                border: 2px solid #0066cc;
                                border-radius: 8px;
                                font-size: 1rem;
                                font-weight: 700;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">
                                <i class="fas fa-share-alt" style="margin-right: 8px;"></i>分享名片
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- 移动端样式 -->
            <style>
                @media (max-width: 1024px) {
                    @media (max-width: 1024px) {
                        [style*="grid-template-columns: 1fr 1fr"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                }
            </style>
        </div>
    `;
},
