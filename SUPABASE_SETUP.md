# Supabase 数据库初始化指南

本文档列出需要在 Supabase 中创建的表和字段。

## 1. 专家表 (experts)

```sql
CREATE TABLE IF NOT EXISTS experts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hospital VARCHAR(100) NOT NULL,
    avatar VARCHAR(50) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    is_featured BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 2. 论坛话题表 (forum_topics)

```sql
CREATE TABLE IF NOT EXISTS forum_topics (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES auth.users(id) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 3. 论坛回复表 (replies)

```sql
CREATE TABLE IF NOT EXISTS replies (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    topic_id BIGINT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES auth.users(id) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. 赞助商表 (sponsors)

```sql
CREATE TABLE IF NOT EXISTS sponsors (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    logo_text VARCHAR(50) DEFAULT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'silver',
    is_active BOOLEAN DEFAULT true,
    website_url VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 5. 会议日程表 (schedule_items)

```sql
CREATE TABLE IF NOT EXISTS schedule_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    day INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    type VARCHAR(50) DEFAULT 'session',
    speakers TEXT [] DEFAULT NULL,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 6. 用户资料表 (profiles)

```sql
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE DEFAULT NULL,
    full_name VARCHAR(255) DEFAULT NULL,
    title VARCHAR(100) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    hospital VARCHAR(100) DEFAULT NULL,
    avatar VARCHAR(50) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    contact VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 操作步骤

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "SQL Editor" 标签页
4. 按顺序执行上述 SQL 语句
5. 或者在表编辑器中手动创建表

## 插入示例数据

### 插入专家数据

```sql
INSERT INTO experts (name, title, department, hospital, avatar, bio, is_featured) VALUES
('张医生', '主任医师', '心内科', '协和医院', '张', '专注心血管疾病研究20余年', true),
('李医生', '副主任医师', '神经外科', '北医三院', '李', '神经外科微创手术专家', true),
('王医生', '主治医师', '呼吸科', '同仁医院', '王', '呼吸系统疾病诊治专家', true),
('刘医生', '教授', '肿瘤科', '肿瘤医院', '刘', '肿瘤免疫治疗研究者', true);
```

### 插入赞助商数据

```sql
INSERT INTO sponsors (name, logo_text, category, level, is_active) VALUES
('辉瑞制药', '辉瑞', '药品', 'platinum', true),
('罗氏诊断', '罗氏', '诊断', 'gold', true),
('强生医疗', '强生', '器械', 'gold', true),
('美敦力', '美敦力', '器械', 'silver', true),
('西门子医疗', '西门子', '设备', 'silver', true),
('GE医疗', 'GE', '设备', 'silver', true),
('飞利浦医疗', '飞利浦', '设备', 'bronze', true),
('迈瑞医疗', '迈瑞', '设备', 'bronze', true);
```

## 注意事项

- 所有表都启用了 RLS（Row Level Security），需要根据你的需求配置权限
- 建议在表级别设置合适的 RLS 策略以保护数据
- 时间戳字段会自动记录创建和更新时间
