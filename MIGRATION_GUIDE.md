# 完全迁移到 Supabase 数据的步骤

## 📋 步骤总览

当前应用已改为**优先从 Supabase 加载所有数据**。本指南帮助你完成迁移。

---

## 第一步：诊断现有数据

打开诊断工具查看当前数据来源：

```
http://localhost:8000/check-data-source.html
```

这个工具会显示：
- ✓ Supabase 连接状态
- ✓ 本地存储中的数据
- ✓ Supabase 中各表的数据量

---

## 第二步：在 Supabase 中创建数据库表

### 方法一：使用 Supabase 控制台（推荐）

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目：**yuppkmtscafzvfxgsjci**
3. 进入 **SQL Editor** 标签页
4. 在 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 中复制 SQL 语句
5. 逐一执行创建表

### 方法二：通过表编辑器手动创建

1. 进入 **Tables** 标签页
2. 点击 **New Table**
3. 根据 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 的表结构创建

### 需要创建的表：

- `experts` - 专家库
- `forum_topics` - 论坛话题
- `replies` - 论坛回复
- `sponsors` - 赞助商
- `schedule_items` - 会议日程
- `profiles` - 用户资料（可选，用于用户注册）

---

## 第三步：插入初始数据

### 快速插入示例数据

在 Supabase SQL Editor 中执行：

```sql
-- 插入专家数据
INSERT INTO experts (name, title, department, hospital, avatar, bio) VALUES
('张医生', '主任医师', '心内科', '协和医院', '张', '专注心血管疾病研究20余年'),
('李医生', '副主任医师', '神经外科', '北医三院', '李', '神经外科微创手术专家'),
('王医生', '主治医师', '呼吸科', '同仁医院', '王', '呼吸系统疾病诊治专家'),
('刘医生', '教授', '肿瘤科', '肿瘤医院', '刘', '肿瘤免疫治疗研究者');

-- 插入赞助商数据
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

---

## 第四步：清空本地存储

在诊断工具中点击 **清空所有本地存储** 按钮，或手动执行：

```javascript
// 在浏览器控制台执行此代码
localStorage.removeItem('conference_experts');
localStorage.removeItem('conference_topics');
localStorage.removeItem('conference_sponsors');
localStorage.removeItem('conference_profile');
console.log('本地存储已清空');
```

---

## 第五步：验证数据加载

1. 打开应用首页：`http://localhost:8000`
2. 按 `Ctrl+Shift+R`（Mac: `Cmd+Shift+R`）硬刷新
3. 打开浏览器控制台（F12 → Console 标签页）
4. 查看日志：
   - ✓ `"从Supabase加载专家数据: X 条"` → 数据成功加载
   - ⚠️ `"Supabase未初始化，使用本地数据"` → 需要检查 Supabase 连接

---

## 常见问题

### Q: 我在首页看不到数据，如何排查？

**A:** 按照以下步骤排查：

1. **检查表是否存在**
   ```
   打开诊断工具 → 点击 "加载 Supabase 数据"
   ```
   如果看到 ❌，说明表不存在

2. **检查表中是否有数据**
   ```
   打开诊断工具 → 如果显示"0 条记录"，需要插入数据
   ```

3. **检查 Supabase 连接**
   ```
   诊断工具 → 点击 "检查 Supabase 连接"
   如果显示红色的 ❌，检查 index.html 中的配置
   ```

4. **清除缓存重新加载**
   ```
   清空浏览器本地存储 → 硬刷新页面 (Ctrl+Shift+R)
   ```

### Q: 本地存储里还有旧数据怎么办？

**A:** 使用诊断工具清空所有本地存储：

```
check-data-source.html → 点击 "清空所有本地存储" → 刷新页面
```

### Q: 如何添加更多的专家或赞助商？

**A:** 在 Supabase 中：

**方法 1：使用 Table Editor（最简单）**
1. Supabase 控制台 → Tables → 选择表
2. 点击 Insert 按钮
3. 填写数据

**方法 2：使用 SQL**
```sql
INSERT INTO experts (name, title, department, hospital, avatar, bio) VALUES
('你的名字', '职位', '科室', '医院', '字', '简介');
```

### Q: 修改了 Supabase 数据后，应用不更新怎么办？

**A:** 应用是实时加载的，但需要刷新页面：
1. 在 Supabase 中修改或添加数据
2. 返回应用页面，按 `F5` 或 `Ctrl+R` 刷新
3. 数据应该立即更新

---

## 验证检查清单

- [ ] Supabase 项目已创建
- [ ] 诊断工具显示 ✓ 连接成功
- [ ] 所有必需的表已创建（experts, forum_topics, sponsors 等）
- [ ] 至少一张表有测试数据
- [ ] 本地存储已清空
- [ ] 刷新首页后能看到 Supabase 数据
- [ ] 浏览器控制台显示 ✓ 的加载日志

---

## 开发调试

### 启用详细日志

在应用初始化时，会自动输出加载日志。查看方式：

```
打开浏览器 → F12 → Console 标签页 → 查看输出
```

关键日志：
- `✓ Supabase 客户端初始化成功`
- `✓ 从Supabase加载专家数据: X 条`
- `✓ 从Supabase加载论坛数据: X 条`
- `✓ 从Supabase加载赞助商数据: X 条`

### 测试数据流

1. 诊断工具：`check-data-source.html`
2. 浏览器Console（F12）
3. Supabase 控制台的 Logs 标签页，查看 API 请求

---

## 下一步

一旦数据完全从 Supabase 加载成功，你可以：

1. **启用行级安全 (RLS)** - 保护用户数据
2. **配置权限策略** - 限制数据访问规则
3. **添加实时数据同步** - 使用 Supabase Realtime
4. **设置数据备份** - 自动备份策略

详见 [Supabase 官方文档](https://supabase.com/docs)

