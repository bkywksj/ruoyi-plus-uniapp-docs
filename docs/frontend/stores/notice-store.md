# 通知状态管理 (notice)

## 功能概述

通知状态管理模块提供系统通知的集中存储和处理能力，用于管理应用内的消息提醒和通知公告。

## 核心职责

- **通知存储**：集中管理所有系统通知
- **状态管理**：控制通知的已读/未读状态
- **批量操作**：支持批量标记已读和清空
- **实时更新**：支持动态添加和移除通知

## 状态定义

```typescript
// 通知列表
notices: NoticeItem[]

// 通知项结构
interface NoticeItem {
  title?: string      // 通知标题
  read: boolean       // 是否已读
  message: any        // 通知内容
  time: string        // 通知时间
}
```

## 核心方法

### addNotice - 添加通知
```typescript
addNotice(notice: NoticeItem): void
```
添加新的通知到列表末尾。

### removeNotice - 移除通知
```typescript
removeNotice(notice: NoticeItem): void
```
从列表中移除指定的通知项。

### readAll - 全部已读
```typescript
readAll(): void
```
将所有通知标记为已读状态。

### clearNotice - 清空通知
```typescript
clearNotice(): void
```
清空所有通知记录。

## 使用示例

### 通知中心组件
```vue
<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-badge :value="unreadCount" :hidden="!unreadCount">
      <el-icon><Bell /></el-icon>
    </el-badge>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="notice in recentNotices"
          :key="notice.time"
          :class="{ 'is-unread': !notice.read }"
          @click="handleNoticeClick(notice)"
        >
          <div class="notice-item">
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-message">{{ notice.message }}</div>
            <div class="notice-time">{{ notice.time }}</div>
          </div>
        </el-dropdown-item>
        
        <el-dropdown-item divided command="readAll">
          全部标记已读
        </el-dropdown-item>
        <el-dropdown-item command="viewAll">
          查看全部
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
const noticeStore = useNoticeStore()

// 未读数量
const unreadCount = computed(() => 
  noticeStore.notices.filter(n => !n.read).length
)

// 最近通知（显示最新的5条）
const recentNotices = computed(() => 
  noticeStore.notices.slice(-5).reverse()
)

// 处理通知点击
const handleNoticeClick = (notice: NoticeItem) => {
  notice.read = true
  // 跳转到相关页面
}

// 处理命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'readAll':
      noticeStore.readAll()
      break
    case 'viewAll':
      router.push('/notice')
      break
  }
}
</script>
```

### 接收实时通知
```typescript
// WebSocket接收通知
ws.on('notification', (data) => {
  noticeStore.addNotice({
    title: data.title,
    read: false,
    message: data.content,
    time: formatDate(new Date())
  })
  
  // 显示桌面通知
  if (Notification.permission === 'granted') {
    new Notification(data.title, {
      body: data.content,
      icon: '/logo.png'
    })
  }
})
```

### 系统公告
```typescript
// 加载系统公告
const loadAnnouncements = async () => {
  const [err, data] = await getAnnouncements()
  if (!err) {
    data.forEach(announcement => {
      noticeStore.addNotice({
        title: '系统公告',
        read: false,
        message: announcement.content,
        time: announcement.publishTime
      })
    })
  }
}
```

### 通知分类管理
```typescript
// 扩展通知类型
interface ExtendedNoticeItem extends NoticeItem {
  type?: 'system' | 'message' | 'task' | 'warning'
  level?: 'info' | 'warning' | 'error' | 'success'
  action?: () => void
}

// 按类型筛选
const systemNotices = computed(() => 
  noticeStore.notices.filter(n => n.type === 'system')
)

const taskNotices = computed(() => 
  noticeStore.notices.filter(n => n.type === 'task')
)
```

## 高级功能

### 通知持久化
```typescript
// 持久化未读通知
watch(
  () => noticeStore.notices,
  (notices) => {
    const unreadNotices = notices.filter(n => !n.read)
    localCache.setJSON('unread_notices', unreadNotices)
  },
  { deep: true }
)

// 恢复通知
onMounted(() => {
  const cached = localCache.getJSON('unread_notices')
  if (cached) {
    cached.forEach(notice => noticeStore.addNotice(notice))
  }
})
```

### 通知优先级
```typescript
// 按优先级排序
const sortedNotices = computed(() => {
  const levelOrder = { error: 0, warning: 1, success: 2, info: 3 }
  return [...noticeStore.notices].sort((a, b) => {
    return levelOrder[a.level] - levelOrder[b.level]
  })
})
```

### 通知过期处理
```typescript
// 自动清理过期通知
const cleanExpiredNotices = () => {
  const now = Date.now()
  const expireTime = 7 * 24 * 60 * 60 * 1000 // 7天
  
  noticeStore.notices = noticeStore.notices.filter(notice => {
    const noticeTime = new Date(notice.time).getTime()
    return now - noticeTime < expireTime
  })
}

// 定时清理
setInterval(cleanExpiredNotices, 60 * 60 * 1000) // 每小时检查
```

## 与其他模块协作

### 与WebSocket
- 接收实时推送通知
- 处理连接状态变化

### 与User Store
- 用户登录后加载个人通知
- 注销时清理通知数据

### 与Router
- 通知跳转到相关页面
- 记录通知来源路由

## UI集成建议

### 通知图标
- 使用Badge显示未读数
- 响应式显示/隐藏

### 通知列表
- 分页或虚拟滚动
- 支持搜索和筛选
- 批量操作功能

### 通知详情
- 富文本内容展示
- 附件下载支持
- 操作按钮集成

## 性能优化

1. **数量限制**
    - 设置最大通知数量
    - 自动清理旧通知

2. **分页加载**
    - 大量通知时分页
    - 虚拟滚动优化

3. **防抖处理**
    - 批量通知合并显示
    - 避免频繁更新UI

## 最佳实践

1. **通知分类**：根据业务需求合理分类通知类型
2. **优先级管理**：重要通知优先展示
3. **交互设计**：提供清晰的已读/未读视觉区分
4. **声音提醒**：重要通知配置声音提醒
5. **权限控制**：根据用户权限过滤通知内容
