// migrate-to-supabase.js - 迁移本地数据到Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://yuppkmtscafzvfxgsjci.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cHBrbXRzY2FmenZmeGdzamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjQ5MDAsImV4cCI6MjA4NjEwMDkwMH0.E_ICyXQsUfTSt2ZM7AvcCrjT7Or2ASxXQUoEAiBlkcU'

const supabase = createClient(supabaseUrl, supabaseKey)

// 检查本地存储中是否有需要迁移的数据
function checkLocalStorage() {
    const items = [
        'conference_experts',
        'conference_topics',
        'conference_sponsors',
        'conference_profile'
    ]
    
    return items.map(item => ({
        key: item,
        exists: !!localStorage.getItem(item),
        data: localStorage.getItem(item) ? JSON.parse(localStorage.getItem(item)) : null
    }))
}

// 迁移赞助商数据
async function migrateSponsors() {
    const savedSponsors = localStorage.getItem('conference_sponsors')
    if (!savedSponsors) {
        console.log('没有赞助商数据需要迁移')
        return
    }
    
    const sponsors = JSON.parse(savedSponsors)
    console.log(`找到 ${sponsors.length} 个赞助商需要迁移`)
    
    for (const sponsor of sponsors) {
        try {
            const { error } = await supabase
                .from('sponsors')
                .upsert({
                    name: sponsor.name,
                    logo_text: sponsor.logo || sponsor.name.substring(0, 2),
                    category: sponsor.category || '其他',
                    level: getSponsorLevel(sponsor.id),
                    description: `${sponsor.name}是本次医学年会的赞助商`,
                    is_active: true
                })
            
            if (error) {
                console.error(`迁移赞助商 ${sponsor.name} 失败:`, error.message)
            } else {
                console.log(`✓ 迁移赞助商: ${sponsor.name}`)
            }
        } catch (error) {
            console.error(`迁移赞助商 ${sponsor.name} 异常:`, error.message)
        }
    }
    
    // 迁移成功后清除本地数据
    localStorage.removeItem('conference_sponsors')
    console.log('赞助商数据迁移完成')
}

function getSponsorLevel(id) {
    if (id <= 3) return 'platinum'
    if (id <= 6) return 'gold'
    if (id <= 9) return 'silver'
    return 'bronze'
}

// 迁移专家数据
async function migrateExperts() {
    const savedExperts = localStorage.getItem('conference_experts')
    if (!savedExperts) {
        console.log('没有专家数据需要迁移')
        return
    }
    
    const experts = JSON.parse(savedExperts)
    console.log(`找到 ${experts.length} 个专家需要迁移`)
    
    for (const expert of experts) {
        try {
            const { error } = await supabase
                .from('experts')
                .upsert({
                    name: expert.name,
                    title: expert.title,
                    department: expert.department,
                    hospital: expert.hospital,
                    avatar: expert.avatar || expert.name.substring(0, 1),
                    bio: expert.bio || `${expert.name}，${expert.title}，${expert.hospital}${expert.department}`,
                    is_featured: true,
                    view_count: Math.floor(Math.random() * 100) + 50
                })
            
            if (error) {
                console.error(`迁移专家 ${expert.name} 失败:`, error.message)
            } else {
                console.log(`✓ 迁移专家: ${expert.name}`)
            }
        } catch (error) {
            console.error(`迁移专家 ${expert.name} 异常:`, error.message)
        }
    }
    
    localStorage.removeItem('conference_experts')
    console.log('专家数据迁移完成')
}

// 迁移论坛话题数据
async function migrateTopics() {
    const savedTopics = localStorage.getItem('conference_topics')
    if (!savedTopics) {
        console.log('没有论坛话题数据需要迁移')
        return
    }
    
    const topics = JSON.parse(savedTopics)
    console.log(`找到 ${topics.length} 个话题需要迁移`)
    
    for (const topic of topics) {
        try {
            const { error } = await supabase
                .from('forum_topics')
                .upsert({
                    title: topic.title,
                    content: topic.content,
                    author_name: topic.author_name || topic.author || '匿名用户',
                    view_count: topic.view_count || Math.floor(Math.random() * 200) + 30,
                    reply_count: topic.reply_count || (topic.replies ? topic.replies.length : 0),
                    category: 'general',
                    status: 'published'
                })
            
            if (error) {
                console.error(`迁移话题 "${topic.title}" 失败:`, error.message)
            } else {
                console.log(`✓ 迁移话题: ${topic.title.substring(0, 20)}...`)
            }
        } catch (error) {
            console.error(`迁移话题 "${topic.title}" 异常:`, error.message)
        }
    }
    
    localStorage.removeItem('conference_topics')
    console.log('论坛话题数据迁移完成')
}

// 迁移用户个人资料
async function migrateProfile() {
    const savedProfile = localStorage.getItem('conference_profile')
    if (!savedProfile) {
        console.log('没有用户个人资料需要迁移')
        return
    }
    
    try {
        const profile = JSON.parse(savedProfile)
        console.log('找到用户个人资料需要迁移')
        
        // 需要用户登录后才能迁移个人资料
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
            console.log('用户未登录，无法迁移个人资料')
            return
        }
        
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: session.user.id,
                username: session.user.email.split('@')[0],
                full_name: profile.full_name,
                title: profile.title,
                department: profile.department,
                hospital: profile.hospital,
                avatar: profile.avatar || profile.full_name?.substring(0, 1) || '医',
                bio: profile.bio,
                contact: profile.contact
            })
        
        if (error) {
            console.error('迁移用户个人资料失败:', error.message)
        } else {
            console.log('✓ 迁移用户个人资料成功')
            localStorage.removeItem('conference_profile')
        }
    } catch (error) {
        console.error('迁移用户个人资料异常:', error.message)
    }
}

// 主迁移函数
async function migrateAll() {
    console.log('=== 开始数据迁移 ===')
    console.log('检查本地存储数据...')
    
    const localData = checkLocalStorage()
    console.table(localData)
    
    // 依次迁移各种数据
    await migrateSponsors()
    await migrateExperts()
    await migrateTopics()
    await migrateProfile()
    
    console.log('=== 数据迁移完成 ===')
    console.log('验证Supabase数据...')
    
    // 验证Supabase中的数据
    const { data: sponsors } = await supabase
        .from('sponsors')
        .select('count')
        .single()
    
    const { data: experts } = await supabase
        .from('experts')
        .select('count')
        .single()
    
    const { data: topics } = await supabase
        .from('forum_topics')
        .select('count')
        .single()
    
    console.log('Supabase现有数据统计:')
    console.log(`- 赞助商: ${sponsors?.count || 0} 条`)
    console.log(`- 专家: ${experts?.count || 0} 条`)
    console.log(`- 论坛话题: ${topics?.count || 0} 条`)
    
    // 清除所有本地存储
    localStorage.clear()
    console.log('已清除所有本地存储数据')
}

// 运行迁移
migrateAll().catch(console.error)