# 通知状态管理 (useNoticeStore)

## 功能概述

通知状态管理模块是系统消息中心的核心状态管理单元，基于 Pinia Composition API 构建，提供系统通知和公告的集中存储、实时推送和状态管理能力。该模块支持多种通知类型（系统通知、公告）的统一管理，提供未读数量统计、批量已读标记、实时推送接收等企业级功能。

**核心特性：**

- **集中式状态管理** - 基于 Pinia Composition API，提供响应式通知列表和未读计数
- **实时数据同步** - 与后端 API 深度集成，支持未读数量的实时刷新
- **多类型支持** - 支持系统通知（type=1）和公告（type=2）两种消息类型
- **精准推送** - 支持全员推送、部门推送、角色推送、指定用户推送四种模式
- **WebSocket 集成** - 支持实时消息推送，无需轮询即可接收新通知
- **批量操作** - 提供全部已读、清空通知等批量处理能力
- **持久化支持** - 可配合本地缓存实现通知的离线存储

## 架构设计

### 模块架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                       通知状态管理架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   UI 组件层      │    │   WebSocket     │    │  定时轮询    │ │
│  │  NoticeCenter   │    │   实时推送       │    │  (可选)      │ │
│  └────────┬────────┘    └────────┬────────┘    └──────┬───────┘ │
│           │                      │                     │         │
│           ▼                      ▼                     ▼         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    useNoticeStore                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │   State     │  │   Actions   │  │    Getters      │    │  │
│  │  │  notices    │  │  addNotice  │  │  unreadCount    │    │  │
│  │  │  unreadCnt  │  │  removeNote │  │  (computed)     │    │  │
│  │  │             │  │  readAll    │  │                 │    │  │
│  │  │             │  │  clearNote  │  │                 │    │  │
│  │  │             │  │  refresh    │  │                 │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Notice API Layer                       │  │
│  │  pageNotices | getNotice | addNotice | updateNotice       │  │
│  │  deleteNotices | pageUserNotices | getNoticeUnreadCount   │  │
│  │  getUserNoticeDetail | markNoticeAsRead | markAllAsRead   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Backend Service                        │  │
│  │                  /system/notice/**                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流向

```
用户操作 → UI组件 → Store Action → API调用 → 后端服务
                         ↓
                    状态更新 ← 响应处理
                         ↓
                    UI自动更新（响应式）
```

## Store 定义

### 核心状态

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNoticeUnreadCount } from '@/api/system/config/notice/noticeApi'

/**
 * 应用模块名称
 * 用于 Pinia Store 的唯一标识
 */
const NOTICE_MODULE = 'notice'

/**
 * 通知项接口定义
 * @description 定义单条通知的数据结构
 */
interface NoticeItem {
  /** 通知唯一标识 */
  id?: string
  /** 通知标题 */
  title?: string
  /** 是否已读 */
  read: boolean
  /** 通知内容（支持富文本） */
  message: any
  /** 通知时间（ISO 格式字符串） */
  time: string
}

/**
 * 通知状态管理 Store
 * @description 基于 Pinia Composition API 的通知状态管理
 */
export const useNoticeStore = defineStore(NOTICE_MODULE, () => {
  /**
   * 通知列表
   * @description 存储所有本地通知项
   */
  const notices = ref<NoticeItem[]>([])

  /**
   * 未读通知数量
   * @description 从后端 API 获取的准确未读数
   */
  const unreadCount = ref(0)

  // ... actions 定义

  return {
    notices,
    unreadCount,
    refreshUnreadCount,
    addNotice,
    removeNotice,
    readAll,
    clearNotice
  }
})
```

### 状态说明

| 状态属性 | 类型 | 说明 | 默认值 |
|---------|------|------|--------|
| `notices` | `Ref<NoticeItem[]>` | 本地通知列表 | `[]` |
| `unreadCount` | `Ref<number>` | 服务端未读数量 | `0` |

## Actions 详解

### refreshUnreadCount - 刷新未读数量

从后端 API 获取最新的未读通知数量，确保未读计数的准确性。

```typescript
/**
 * 刷新未读数量
 * @description 从后端 API 获取最新的未读通知数量
 * @returns Promise<void>
 */
const refreshUnreadCount = async (): Promise<void> => {
  const [err, data] = await getNoticeUnreadCount()
  if (!err) {
    unreadCount.value = data || 0
  } else {
    console.error('获取未读数量失败:', err)
  }
}
```

**使用示例：**

```typescript
import { useNoticeStore } from '@/stores'

const noticeStore = useNoticeStore()

// 页面加载时刷新未读数量
onMounted(async () => {
  await noticeStore.refreshUnreadCount()
})

// 定时刷新（可选）
const refreshInterval = setInterval(() => {
  noticeStore.refreshUnreadCount()
}, 60000) // 每分钟刷新一次

onUnmounted(() => {
  clearInterval(refreshInterval)
})
```

**技术要点：**

- 使用 `[err, data]` 解构模式处理 API 响应
- 错误时保持原有计数，避免界面闪烁
- 返回 Promise 支持异步等待

### addNotice - 添加通知

向本地通知列表添加新通知，并自动刷新未读数量。

```typescript
/**
 * 添加通知
 * @description 添加新的通知项到列表末尾，并刷新未读数量
 * @param notice 要添加的通知项
 */
const addNotice = (notice: NoticeItem): void => {
  notices.value.push(notice)
  // 添加通知时自动刷新未读数量
  refreshUnreadCount()
}
```

**使用示例：**

```typescript
// 接收 WebSocket 推送的新通知
ws.on('notification', (data) => {
  noticeStore.addNotice({
    id: data.noticeId,
    title: data.noticeTitle,
    read: false,
    message: data.noticeContent,
    time: data.createTime
  })
})

// 手动添加系统通知
noticeStore.addNotice({
  title: '系统维护通知',
  read: false,
  message: '系统将于今晚 22:00 进行维护升级',
  time: new Date().toISOString()
})
```

**技术要点：**

- 通知添加到列表末尾（最新通知在最后）
- 自动触发 `refreshUnreadCount` 同步服务端数据
- 支持可选的 `id` 字段用于去重

### removeNotice - 移除通知

从本地通知列表中移除指定的通知项。

```typescript
/**
 * 移除通知
 * @description 从列表中移除指定的通知项
 * @param notice 要移除的通知项
 */
const removeNotice = (notice: NoticeItem): void => {
  const index = notices.value.indexOf(notice)
  if (index !== -1) {
    notices.value.splice(index, 1)
  }
}
```

**使用示例：**

```typescript
// 用户手动删除通知
const handleDelete = (notice: NoticeItem) => {
  noticeStore.removeNotice(notice)
}

// 根据 ID 删除通知
const removeById = (noticeId: string) => {
  const notice = noticeStore.notices.find(n => n.id === noticeId)
  if (notice) {
    noticeStore.removeNotice(notice)
  }
}

// 删除所有已读通知
const removeReadNotices = () => {
  const readNotices = noticeStore.notices.filter(n => n.read)
  readNotices.forEach(notice => {
    noticeStore.removeNotice(notice)
  })
}
```

**技术要点：**

- 使用 `indexOf` 查找通知在列表中的位置
- 使用 `splice` 原地修改数组，保持响应性
- 未找到时静默处理，不抛出异常

### readAll - 全部已读

将本地所有通知标记为已读状态。

```typescript
/**
 * 将所有通知标记为已读
 * @description 遍历通知列表，将所有项的 read 属性设为 true
 */
const readAll = () => {
  notices.value.forEach((item: NoticeItem) => {
    item.read = true
  })
}
```

**使用示例：**

```typescript
// 一键全部已读
const handleReadAll = async () => {
  // 先调用后端 API 标记已读
  const [err] = await markAllNoticesAsRead()
  if (!err) {
    // 成功后更新本地状态
    noticeStore.readAll()
    // 刷新未读数量
    await noticeStore.refreshUnreadCount()
    ElMessage.success('已全部标记为已读')
  }
}
```

**技术要点：**

- 仅修改本地状态，需配合 API 调用同步服务端
- 遍历修改保持数组引用不变
- 响应式系统自动触发 UI 更新

### clearNotice - 清空通知

清空本地所有通知记录。

```typescript
/**
 * 清空所有通知
 * @description 重置通知列表为空数组
 */
const clearNotice = (): void => {
  notices.value = []
}
```

**使用示例：**

```typescript
// 用户登出时清空通知
const handleLogout = () => {
  noticeStore.clearNotice()
  // 其他清理操作...
}

// 清空通知并重新加载
const handleRefresh = async () => {
  noticeStore.clearNotice()
  await loadNotices()
}
```

## 类型定义

### NoticeItem - 本地通知项

```typescript
/**
 * 通知项接口
 * @description 用于本地状态管理的通知数据结构
 */
interface NoticeItem {
  /**
   * 通知唯一标识
   * @optional 可选，用于与服务端数据关联
   */
  id?: string

  /**
   * 通知标题
   * @optional 可选，某些通知可能只有内容
   */
  title?: string

  /**
   * 是否已读
   * @required 必须，用于区分已读/未读状态
   */
  read: boolean

  /**
   * 通知内容
   * @description 支持富文本 HTML 内容
   */
  message: any

  /**
   * 通知时间
   * @description ISO 8601 格式的时间字符串
   */
  time: string
}
```

### SysNoticeQuery - 查询参数

```typescript
/**
 * 通知查询参数接口
 * @description 用于分页查询通知列表
 */
interface SysNoticeQuery extends PageQuery {
  /** 通知标题（模糊查询） */
  noticeTitle?: string

  /** 创建者名称（模糊查询） */
  createByName?: string

  /** 通知状态：0-正常，1-关闭 */
  status?: string

  /**
   * 通知类型
   * @description 1-通知，2-公告
   */
  noticeType?: string
}
```

### SysNoticeBo - 表单数据

```typescript
/**
 * 通知表单数据接口
 * @description 用于新增和编辑通知
 */
interface SysNoticeBo {
  /** 通知ID（编辑时必填） */
  noticeId?: string | number

  /**
   * 通知类型
   * @description 1-通知，2-公告
   */
  noticeType?: string

  /** 目标配置（JSON 字符串） */
  targetConfig?: string

  /** 通知标题 */
  noticeTitle?: string

  /**
   * 通知内容
   * @required 必填，支持富文本
   */
  noticeContent: string

  /**
   * 状态
   * @required 必填，0-正常，1-关闭
   */
  status: string

  /**
   * 推送类型
   * @description all-全员推送，dept-部门推送，role-角色推送，user-指定用户
   */
  pushType?: string

  /**
   * 部门ID列表
   * @description pushType 为 dept 时使用
   */
  deptIds?: (string | number)[]

  /**
   * 角色ID列表
   * @description pushType 为 role 时使用
   */
  roleIds?: (string | number)[]

  /**
   * 用户ID列表
   * @description pushType 为 user 时使用
   */
  userIds?: (string | number)[]
}
```

### SysNoticeVo - 视图数据

```typescript
/**
 * 通知视图数据接口
 * @description 管理端通知列表展示用
 */
interface SysNoticeVo {
  /** 通知ID */
  noticeId: number

  /** 通知标题 */
  noticeTitle: string

  /** 通知类型：1-通知，2-公告 */
  noticeType: string

  /** 通知内容（富文本 HTML） */
  noticeContent: string

  /** 状态：0-正常，1-关闭 */
  status: string

  /** 目标配置 */
  targetConfig?: string

  /** 创建者ID */
  createBy?: number

  /** 创建者名称 */
  createByName?: string

  /** 创建时间 */
  createTime: string

  /** 更新者ID */
  updateBy?: number

  /** 更新时间 */
  updateTime?: string

  /** 备注 */
  remark?: string
}
```

### UserNoticeVo - 用户通知视图

```typescript
/**
 * 用户通知视图接口
 * @description 普通用户查看通知使用
 */
interface UserNoticeVo {
  /** 通知ID */
  noticeId: number

  /** 通知标题 */
  noticeTitle: string

  /** 通知类型：1-通知，2-公告 */
  noticeType: string

  /** 通知内容 */
  noticeContent: string

  /** 状态 */
  status: string

  /** 创建时间 */
  createTime: string

  /** 创建者名称 */
  createByName?: string

  /** 是否已读 */
  isRead: boolean
}
```

## API 集成

### API 函数一览

| 函数名 | 说明 | 返回类型 |
|--------|------|----------|
| `pageNotices` | 分页查询通知列表（管理端） | `Result<PageResult<SysNoticeVo>>` |
| `getNotice` | 获取通知详情 | `Result<SysNoticeVo>` |
| `addNotice` | 新增通知 | `Result<string \| number>` |
| `updateNotice` | 更新通知 | `Result<void>` |
| `deleteNotices` | 删除通知 | `Result<void>` |
| `pageUserNotices` | 分页查询用户通知 | `Result<PageResult<UserNoticeVo>>` |
| `getNoticeUnreadCount` | 获取未读数量 | `Result<number>` |
| `getUserNoticeDetail` | 获取用户通知详情 | `Result<UserNoticeVo>` |
| `markNoticeAsRead` | 标记单条已读 | `Result<void>` |
| `markAllNoticesAsRead` | 标记全部已读 | `Result<void>` |

### API 使用示例

#### 分页查询通知列表

```typescript
import { pageNotices } from '@/api/system/config/notice/noticeApi'
import type { SysNoticeQuery, SysNoticeVo } from '@/api/system/config/notice/noticeTypes'

// 查询参数
const queryParams = reactive<SysNoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  noticeType: '',
  status: ''
})

// 通知列表
const noticeList = ref<SysNoticeVo[]>([])
const total = ref(0)

// 加载通知列表
const loadNotices = async () => {
  const [err, data] = await pageNotices(queryParams)
  if (!err && data) {
    noticeList.value = data.rows || []
    total.value = data.total || 0
  }
}
```

#### 获取通知详情

```typescript
import { getNotice } from '@/api/system/config/notice/noticeApi'

const noticeDetail = ref<SysNoticeVo | null>(null)

const loadNoticeDetail = async (noticeId: number) => {
  const [err, data] = await getNotice(noticeId)
  if (!err && data) {
    noticeDetail.value = data
  }
}
```

#### 新增通知

```typescript
import { addNotice } from '@/api/system/config/notice/noticeApi'
import type { SysNoticeBo } from '@/api/system/config/notice/noticeTypes'

const createNotice = async () => {
  const formData: SysNoticeBo = {
    noticeTitle: '系统升级通知',
    noticeContent: '<p>系统将于今晚22:00进行升级维护...</p>',
    noticeType: '1', // 通知
    status: '0', // 正常
    pushType: 'all' // 全员推送
  }

  const [err, noticeId] = await addNotice(formData)
  if (!err) {
    ElMessage.success('通知发布成功')
    console.log('新通知ID:', noticeId)
  }
}
```

#### 精准推送通知

```typescript
// 推送给指定部门
const pushToDepartments = async () => {
  const formData: SysNoticeBo = {
    noticeTitle: '部门会议通知',
    noticeContent: '请各部门负责人于明天上午9:00参加会议',
    noticeType: '1',
    status: '0',
    pushType: 'dept',
    deptIds: [100, 101, 102] // 部门ID列表
  }

  await addNotice(formData)
}

// 推送给指定角色
const pushToRoles = async () => {
  const formData: SysNoticeBo = {
    noticeTitle: '管理员培训通知',
    noticeContent: '请所有管理员参加系统培训',
    noticeType: '1',
    status: '0',
    pushType: 'role',
    roleIds: [1, 2] // 角色ID列表
  }

  await addNotice(formData)
}

// 推送给指定用户
const pushToUsers = async () => {
  const formData: SysNoticeBo = {
    noticeTitle: '个人任务提醒',
    noticeContent: '您有一个待处理的任务',
    noticeType: '1',
    status: '0',
    pushType: 'user',
    userIds: [1, 5, 10] // 用户ID列表
  }

  await addNotice(formData)
}
```

#### 用户通知操作

```typescript
import {
  pageUserNotices,
  getUserNoticeDetail,
  markNoticeAsRead,
  markAllNoticesAsRead,
  getNoticeUnreadCount
} from '@/api/system/config/notice/noticeApi'

// 加载用户通知列表
const loadUserNotices = async () => {
  const [err, data] = await pageUserNotices({
    pageNum: 1,
    pageSize: 20
  })
  if (!err && data) {
    // 处理用户通知列表
    console.log('用户通知:', data.rows)
  }
}

// 查看通知详情并标记已读
const viewNotice = async (noticeId: number) => {
  // 获取详情
  const [err, detail] = await getUserNoticeDetail(noticeId)
  if (!err && detail) {
    // 标记为已读
    if (!detail.isRead) {
      await markNoticeAsRead(noticeId)
      // 刷新未读数量
      await noticeStore.refreshUnreadCount()
    }
    // 显示详情
    showNoticeDetail(detail)
  }
}

// 一键全部已读
const readAllNotices = async () => {
  const [err] = await markAllNoticesAsRead()
  if (!err) {
    noticeStore.readAll()
    await noticeStore.refreshUnreadCount()
    ElMessage.success('已全部标记为已读')
  }
}
```

## 组件集成

### 通知中心组件

```vue
<template>
  <el-popover
    placement="bottom"
    :width="360"
    trigger="click"
    popper-class="notice-popover"
  >
    <template #reference>
      <el-badge
        :value="noticeStore.unreadCount"
        :max="99"
        :hidden="noticeStore.unreadCount === 0"
        class="notice-badge"
      >
        <el-button :icon="Bell" circle />
      </el-badge>
    </template>

    <div class="notice-panel">
      <!-- 头部 -->
      <div class="notice-header">
        <span class="title">通知中心</span>
        <el-button
          v-if="noticeStore.unreadCount > 0"
          type="primary"
          link
          @click="handleReadAll"
        >
          全部已读
        </el-button>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="notice-tabs">
        <el-tab-pane label="通知" name="notice">
          <NoticeList :type="1" />
        </el-tab-pane>
        <el-tab-pane label="公告" name="announcement">
          <NoticeList :type="2" />
        </el-tab-pane>
      </el-tabs>

      <!-- 底部 -->
      <div class="notice-footer">
        <el-button type="primary" link @click="goToNoticeCenter">
          查看全部
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useNoticeStore } from '@/stores'
import { markAllNoticesAsRead } from '@/api/system/config/notice/noticeApi'
import NoticeList from './NoticeList.vue'

const router = useRouter()
const noticeStore = useNoticeStore()

const activeTab = ref('notice')

// 页面加载时刷新未读数量
onMounted(() => {
  noticeStore.refreshUnreadCount()
})

// 全部已读
const handleReadAll = async () => {
  const [err] = await markAllNoticesAsRead()
  if (!err) {
    noticeStore.readAll()
    await noticeStore.refreshUnreadCount()
    ElMessage.success('已全部标记为已读')
  }
}

// 跳转到通知中心
const goToNoticeCenter = () => {
  router.push('/notice/center')
}
</script>

<style lang="scss" scoped>
.notice-badge {
  cursor: pointer;
}

.notice-panel {
  .notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .notice-tabs {
    margin-top: 8px;
  }

  .notice-footer {
    padding-top: 12px;
    text-align: center;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
```

### 通知列表组件

```vue
<template>
  <div class="notice-list">
    <el-scrollbar max-height="300px">
      <div v-if="loading" class="notice-loading">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="notices.length === 0" class="notice-empty">
        <el-empty description="暂无通知" :image-size="80" />
      </div>

      <div v-else class="notice-items">
        <div
          v-for="notice in notices"
          :key="notice.noticeId"
          class="notice-item"
          :class="{ 'is-unread': !notice.isRead }"
          @click="handleClick(notice)"
        >
          <div class="notice-icon">
            <el-icon :size="20">
              <component :is="getNoticeIcon(notice.noticeType)" />
            </el-icon>
          </div>
          <div class="notice-content">
            <div class="notice-title">{{ notice.noticeTitle }}</div>
            <div class="notice-time">{{ formatTime(notice.createTime) }}</div>
          </div>
          <div v-if="!notice.isRead" class="notice-dot" />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { Notification, ChatDotSquare } from '@element-plus/icons-vue'
import { pageUserNotices, markNoticeAsRead } from '@/api/system/config/notice/noticeApi'
import { useNoticeStore } from '@/stores'
import type { UserNoticeVo } from '@/api/system/config/notice/noticeTypes'
import { formatRelativeTime } from '@/utils/date'

const props = defineProps<{
  type: 1 | 2 // 1-通知, 2-公告
}>()

const noticeStore = useNoticeStore()
const loading = ref(false)
const notices = ref<UserNoticeVo[]>([])

// 加载通知列表
const loadNotices = async () => {
  loading.value = true
  try {
    const [err, data] = await pageUserNotices({
      pageNum: 1,
      pageSize: 10,
      noticeType: String(props.type)
    })
    if (!err && data) {
      notices.value = data.rows || []
    }
  } finally {
    loading.value = false
  }
}

// 获取通知图标
const getNoticeIcon = (type: string) => {
  return type === '1' ? Notification : ChatDotSquare
}

// 格式化时间
const formatTime = (time: string) => {
  return formatRelativeTime(time)
}

// 点击通知
const handleClick = async (notice: UserNoticeVo) => {
  if (!notice.isRead) {
    const [err] = await markNoticeAsRead(notice.noticeId)
    if (!err) {
      notice.isRead = true
      await noticeStore.refreshUnreadCount()
    }
  }
  // 显示通知详情弹窗
  showNoticeDetail(notice)
}

// 显示通知详情
const showNoticeDetail = (notice: UserNoticeVo) => {
  ElMessageBox.alert(notice.noticeContent, notice.noticeTitle, {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了'
  })
}

// 监听类型变化重新加载
watch(() => props.type, () => {
  loadNotices()
})

onMounted(() => {
  loadNotices()
})
</script>

<style lang="scss" scoped>
.notice-list {
  .notice-loading,
  .notice-empty {
    padding: 20px 0;
  }

  .notice-item {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-unread {
      .notice-title {
        font-weight: 600;
      }
    }

    .notice-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--el-color-primary-light-9);
      border-radius: 50%;
      color: var(--el-color-primary);
    }

    .notice-content {
      flex: 1;
      margin-left: 12px;
      min-width: 0;

      .notice-title {
        font-size: 14px;
        color: var(--el-text-color-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .notice-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }

    .notice-dot {
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      background-color: var(--el-color-danger);
      border-radius: 50%;
      margin-left: 8px;
      margin-top: 6px;
    }
  }
}
</style>
```

### 顶栏集成

```vue
<template>
  <div class="navbar">
    <div class="navbar-left">
      <!-- 其他内容 -->
    </div>

    <div class="navbar-right">
      <!-- 通知中心 -->
      <NoticeCenter />

      <!-- 用户头像 -->
      <UserAvatar />
    </div>
  </div>
</template>

<script lang="ts" setup>
import NoticeCenter from '@/components/NoticeCenter/index.vue'
import UserAvatar from '@/components/UserAvatar/index.vue'
</script>
```

## WebSocket 集成

### 实时通知推送

```typescript
import { useNoticeStore } from '@/stores'
import { useWebSocket } from '@/composables/useWebSocket'

export function useNoticeWebSocket() {
  const noticeStore = useNoticeStore()
  const { connect, on, disconnect } = useWebSocket()

  // 连接 WebSocket
  const initWebSocket = () => {
    connect('/ws/notice')

    // 监听新通知
    on('notice:new', (data: any) => {
      // 添加到本地通知列表
      noticeStore.addNotice({
        id: data.noticeId,
        title: data.noticeTitle,
        read: false,
        message: data.noticeContent,
        time: data.createTime
      })

      // 显示桌面通知
      showDesktopNotification(data)

      // 播放提示音
      playNotificationSound()
    })

    // 监听通知撤回
    on('notice:revoke', (data: { noticeId: string }) => {
      const notice = noticeStore.notices.find(n => n.id === data.noticeId)
      if (notice) {
        noticeStore.removeNotice(notice)
      }
    })

    // 监听未读数量更新
    on('notice:unread', (count: number) => {
      noticeStore.unreadCount = count
    })
  }

  // 显示桌面通知
  const showDesktopNotification = (data: any) => {
    if (Notification.permission === 'granted') {
      new Notification(data.noticeTitle, {
        body: stripHtml(data.noticeContent).slice(0, 100),
        icon: '/logo.png',
        tag: `notice-${data.noticeId}`
      })
    }
  }

  // 播放提示音
  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // 用户未交互时无法播放
    })
  }

  // 去除 HTML 标签
  const stripHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || ''
  }

  return {
    initWebSocket,
    disconnect
  }
}
```

### 在 App 中初始化

```typescript
// App.vue 或 main.ts
import { useNoticeWebSocket } from '@/composables/useNoticeWebSocket'

const { initWebSocket, disconnect } = useNoticeWebSocket()

// 用户登录后初始化
watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    initWebSocket()
  } else {
    disconnect()
  }
})

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})
```

### 请求桌面通知权限

```typescript
// 请求通知权限
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持桌面通知')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 在用户登录后请求权限
onMounted(async () => {
  await requestNotificationPermission()
})
```

## 持久化存储

### 使用 Pinia 持久化插件

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNoticeStore = defineStore(
  'notice',
  () => {
    const notices = ref<NoticeItem[]>([])
    const unreadCount = ref(0)

    // ... actions

    return {
      notices,
      unreadCount,
      // ...
    }
  },
  {
    // 持久化配置
    persist: {
      key: 'notice-store',
      storage: localStorage,
      paths: ['notices'], // 只持久化通知列表
    }
  }
)
```

### 手动持久化

```typescript
import { localCache } from '@/utils/cache'

// 保存未读通知到本地
const saveUnreadNotices = () => {
  const unreadNotices = noticeStore.notices.filter(n => !n.read)
  localCache.setJSON('unread_notices', unreadNotices)
}

// 恢复未读通知
const restoreUnreadNotices = () => {
  const cached = localCache.getJSON<NoticeItem[]>('unread_notices')
  if (cached && cached.length > 0) {
    cached.forEach(notice => {
      // 检查是否已存在
      const exists = noticeStore.notices.some(n => n.id === notice.id)
      if (!exists) {
        noticeStore.notices.push(notice)
      }
    })
  }
}

// 监听通知变化自动保存
watch(
  () => noticeStore.notices,
  () => {
    saveUnreadNotices()
  },
  { deep: true }
)

// 页面加载时恢复
onMounted(() => {
  restoreUnreadNotices()
})
```

## 定时轮询

### 轮询刷新未读数量

```typescript
import { useIntervalFn } from '@vueuse/core'
import { useNoticeStore } from '@/stores'

export function useNoticePolling() {
  const noticeStore = useNoticeStore()

  // 每 30 秒刷新一次未读数量
  const { pause, resume, isActive } = useIntervalFn(
    () => {
      noticeStore.refreshUnreadCount()
    },
    30000,
    { immediate: true }
  )

  // 页面可见性变化时控制轮询
  const handleVisibilityChange = () => {
    if (document.hidden) {
      pause()
    } else {
      resume()
      // 页面重新可见时立即刷新
      noticeStore.refreshUnreadCount()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    pause()
  })

  return {
    pause,
    resume,
    isActive
  }
}
```

### 智能轮询策略

```typescript
export function useSmartNoticePolling() {
  const noticeStore = useNoticeStore()
  const pollInterval = ref(30000) // 初始 30 秒
  const maxInterval = 300000 // 最大 5 分钟
  const minInterval = 10000 // 最小 10 秒

  let timer: number | null = null
  let consecutiveNoChange = 0

  const poll = async () => {
    const prevCount = noticeStore.unreadCount
    await noticeStore.refreshUnreadCount()

    // 根据变化调整轮询间隔
    if (noticeStore.unreadCount !== prevCount) {
      // 有变化，加快轮询
      consecutiveNoChange = 0
      pollInterval.value = minInterval
    } else {
      // 无变化，逐渐放慢轮询
      consecutiveNoChange++
      if (consecutiveNoChange > 5) {
        pollInterval.value = Math.min(
          pollInterval.value * 1.5,
          maxInterval
        )
      }
    }

    scheduleNext()
  }

  const scheduleNext = () => {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(poll, pollInterval.value)
  }

  const start = () => {
    poll()
  }

  const stop = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { start, stop, pollInterval }
}
```

## 通知过滤与排序

### 计算属性扩展

```typescript
import { computed } from 'vue'
import { useNoticeStore } from '@/stores'

export function useNoticeFilters() {
  const noticeStore = useNoticeStore()

  // 未读通知
  const unreadNotices = computed(() =>
    noticeStore.notices.filter(n => !n.read)
  )

  // 已读通知
  const readNotices = computed(() =>
    noticeStore.notices.filter(n => n.read)
  )

  // 按时间倒序（最新在前）
  const sortedNotices = computed(() =>
    [...noticeStore.notices].sort((a, b) =>
      new Date(b.time).getTime() - new Date(a.time).getTime()
    )
  )

  // 最近的通知（最新 5 条）
  const recentNotices = computed(() =>
    sortedNotices.value.slice(0, 5)
  )

  // 今日通知
  const todayNotices = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return noticeStore.notices.filter(n =>
      new Date(n.time).getTime() >= today.getTime()
    )
  })

  // 按标题搜索
  const searchNotices = (keyword: string) => {
    if (!keyword.trim()) return noticeStore.notices
    const lowerKeyword = keyword.toLowerCase()
    return noticeStore.notices.filter(n =>
      n.title?.toLowerCase().includes(lowerKeyword) ||
      n.message?.toLowerCase?.().includes(lowerKeyword)
    )
  }

  return {
    unreadNotices,
    readNotices,
    sortedNotices,
    recentNotices,
    todayNotices,
    searchNotices
  }
}
```

### 通知分组

```typescript
export function useNoticeGroups() {
  const noticeStore = useNoticeStore()

  // 按日期分组
  const groupedByDate = computed(() => {
    const groups: Record<string, NoticeItem[]> = {}

    noticeStore.notices.forEach(notice => {
      const date = new Date(notice.time).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notice)
    })

    return groups
  })

  // 分组标签
  const getGroupLabel = (date: string) => {
    const today = new Date().toLocaleDateString()
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()

    if (date === today) return '今天'
    if (date === yesterday) return '昨天'
    return date
  }

  return { groupedByDate, getGroupLabel }
}
```

## 与其他模块协作

### 与 User Store 协作

```typescript
import { useUserStore } from '@/stores'
import { useNoticeStore } from '@/stores'

// 用户登录后初始化通知
watch(
  () => userStore.token,
  async (token) => {
    if (token) {
      // 用户登录，初始化通知
      await noticeStore.refreshUnreadCount()
      // 启动 WebSocket 或轮询
      startNoticePolling()
    } else {
      // 用户登出，清理通知
      noticeStore.clearNotice()
      stopNoticePolling()
    }
  },
  { immediate: true }
)
```

### 与 Router 协作

```typescript
import { useRouter } from 'vue-router'
import { useNoticeStore } from '@/stores'

// 路由守卫中刷新通知
router.afterEach((to, from) => {
  // 每次路由切换时刷新未读数量
  if (userStore.token) {
    noticeStore.refreshUnreadCount()
  }
})

// 通知点击跳转
const handleNoticeClick = (notice: NoticeItem) => {
  // 根据通知类型跳转到对应页面
  if (notice.type === 'task') {
    router.push(`/task/${notice.id}`)
  } else if (notice.type === 'order') {
    router.push(`/order/${notice.id}`)
  } else {
    router.push('/notice/center')
  }
}
```

### 与权限系统协作

```typescript
import { usePermissionStore } from '@/stores'

// 根据权限过滤通知
const filteredNotices = computed(() => {
  const permissionStore = usePermissionStore()

  return noticeStore.notices.filter(notice => {
    // 检查是否有查看该类型通知的权限
    if (notice.type === 'admin' && !permissionStore.hasPermission('notice:admin')) {
      return false
    }
    return true
  })
})
```

## 最佳实践

### 1. 合理使用未读计数

```typescript
// ✅ 好的实践：从服务端获取准确的未读数量
const unreadCount = computed(() => noticeStore.unreadCount)

// ❌ 避免：仅根据本地状态计算
const unreadCount = computed(() =>
  noticeStore.notices.filter(n => !n.read).length
)
```

未读数量应该从服务端 API 获取，因为：
- 用户可能在多个设备登录
- 本地缓存可能与服务端不同步
- 服务端可以进行精确的权限过滤

### 2. 及时刷新未读状态

```typescript
// 点击通知后刷新
const handleNoticeClick = async (notice: NoticeItem) => {
  await markNoticeAsRead(notice.id)
  await noticeStore.refreshUnreadCount() // 立即刷新
}

// 批量操作后刷新
const handleBatchRead = async (ids: string[]) => {
  await batchMarkAsRead(ids)
  await noticeStore.refreshUnreadCount()
}
```

### 3. 优化轮询策略

```typescript
// ✅ 好的实践：根据页面可见性控制轮询
const { pause, resume } = useIntervalFn(/* ... */)

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pause() // 页面不可见时暂停
  } else {
    resume() // 页面可见时恢复
    noticeStore.refreshUnreadCount() // 立即刷新
  }
})

// ❌ 避免：无条件持续轮询
setInterval(() => {
  noticeStore.refreshUnreadCount()
}, 5000) // 频繁轮询浪费资源
```

### 4. 通知去重处理

```typescript
const addNotice = (notice: NoticeItem) => {
  // 检查是否已存在
  const exists = notices.value.some(n => n.id === notice.id)
  if (exists) {
    // 更新已存在的通知
    const index = notices.value.findIndex(n => n.id === notice.id)
    notices.value[index] = notice
  } else {
    // 添加新通知
    notices.value.push(notice)
  }
  refreshUnreadCount()
}
```

### 5. 错误处理与降级

```typescript
const refreshUnreadCount = async (): Promise<void> => {
  try {
    const [err, data] = await getNoticeUnreadCount()
    if (!err) {
      unreadCount.value = data || 0
    } else {
      // 记录错误但不影响用户体验
      console.error('获取未读数量失败:', err)
      // 可选：使用本地计算作为降级方案
      // unreadCount.value = notices.value.filter(n => !n.read).length
    }
  } catch (error) {
    console.error('刷新未读数量异常:', error)
  }
}
```

### 6. 内存管理

```typescript
// 限制本地通知数量，避免内存溢出
const MAX_NOTICES = 100

const addNotice = (notice: NoticeItem) => {
  notices.value.push(notice)

  // 超出限制时移除最旧的通知
  if (notices.value.length > MAX_NOTICES) {
    notices.value = notices.value.slice(-MAX_NOTICES)
  }

  refreshUnreadCount()
}

// 定期清理过期通知
const cleanExpiredNotices = () => {
  const expireTime = 7 * 24 * 60 * 60 * 1000 // 7天
  const now = Date.now()

  notices.value = notices.value.filter(notice => {
    const noticeTime = new Date(notice.time).getTime()
    return now - noticeTime < expireTime
  })
}
```

## 常见问题

### 1. 未读数量不准确

**问题描述：** 界面显示的未读数量与实际不符，或者在多设备间不同步。

**原因分析：**
- 仅依赖本地状态计算未读数
- 未及时调用 `refreshUnreadCount` 同步服务端数据
- WebSocket 连接断开后未重连

**解决方案：**

```typescript
// 方案1：始终从服务端获取未读数量
const unreadCount = computed(() => noticeStore.unreadCount)

// 方案2：关键操作后刷新
const markAsRead = async (noticeId: string) => {
  await markNoticeAsRead(noticeId)
  await noticeStore.refreshUnreadCount() // 关键：刷新服务端数据
}

// 方案3：WebSocket 重连后刷新
ws.on('reconnect', () => {
  noticeStore.refreshUnreadCount()
})
```

### 2. 通知重复显示

**问题描述：** 同一条通知在列表中出现多次。

**原因分析：**
- WebSocket 重连时重复接收历史消息
- 多次调用 `addNotice` 添加相同通知
- 持久化恢复时未做去重处理

**解决方案：**

```typescript
const addNotice = (notice: NoticeItem) => {
  // 基于 ID 去重
  if (notice.id) {
    const existIndex = notices.value.findIndex(n => n.id === notice.id)
    if (existIndex !== -1) {
      // 更新已存在的通知
      notices.value[existIndex] = { ...notices.value[existIndex], ...notice }
      return
    }
  }

  // 基于内容和时间去重（无 ID 时的降级方案）
  const isDuplicate = notices.value.some(n =>
    n.title === notice.title &&
    n.time === notice.time &&
    n.message === notice.message
  )

  if (!isDuplicate) {
    notices.value.push(notice)
    refreshUnreadCount()
  }
}
```

### 3. 页面刷新后通知丢失

**问题描述：** 页面刷新后，之前收到的通知全部消失。

**原因分析：**
- Store 状态默认不持久化
- 未配置持久化插件
- 持久化配置错误

**解决方案：**

```typescript
// 方案1：使用 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 在 Store 中配置
export const useNoticeStore = defineStore('notice', () => {
  // ...
}, {
  persist: {
    key: 'notice-store',
    storage: localStorage,
    paths: ['notices']
  }
})

// 方案2：手动持久化
watch(
  () => noticeStore.notices,
  (notices) => {
    localStorage.setItem('notices', JSON.stringify(notices))
  },
  { deep: true }
)

// 恢复
onMounted(() => {
  const cached = localStorage.getItem('notices')
  if (cached) {
    noticeStore.notices = JSON.parse(cached)
  }
})
```

### 4. 桌面通知权限问题

**问题描述：** 无法显示桌面通知，或用户拒绝了权限请求。

**原因分析：**
- 用户未授权通知权限
- 浏览器不支持 Notification API
- HTTPS 限制（部分浏览器要求 HTTPS）

**解决方案：**

```typescript
const requestNotificationPermission = async () => {
  // 检查浏览器支持
  if (!('Notification' in window)) {
    console.warn('浏览器不支持桌面通知')
    return false
  }

  // 检查当前权限状态
  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    // 用户已拒绝，引导用户手动开启
    ElMessage.info('请在浏览器设置中开启通知权限')
    return false
  }

  // 请求权限（需要用户交互触发）
  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('请求通知权限失败:', error)
    return false
  }
}

// 在用户主动操作时请求权限（如点击开启通知按钮）
const enableNotification = async () => {
  const granted = await requestNotificationPermission()
  if (granted) {
    ElMessage.success('通知已开启')
  }
}
```

### 5. WebSocket 断连问题

**问题描述：** WebSocket 连接断开后，无法收到实时通知。

**原因分析：**
- 网络不稳定导致连接断开
- 服务端主动关闭连接
- 未实现重连机制

**解决方案：**

```typescript
class NoticeWebSocket {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  connect(url: string) {
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功')
      this.reconnectAttempts = 0
    }

    this.ws.onclose = () => {
      console.log('WebSocket 连接关闭')
      this.scheduleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data))
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket 重连次数超限')
      // 降级为轮询
      this.fallbackToPolling()
      return
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      console.log(`WebSocket 重连尝试 ${this.reconnectAttempts}`)
      this.connect(this.url)
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
  }

  private fallbackToPolling() {
    // 使用轮询作为降级方案
    setInterval(() => {
      noticeStore.refreshUnreadCount()
    }, 30000)
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    if (this.ws) {
      this.ws.close()
    }
  }
}
```

### 6. 内存泄漏问题

**问题描述：** 长时间使用后，页面内存占用持续增长。

**原因分析：**
- 通知列表无限增长
- 未清理过期通知
- 事件监听器未移除

**解决方案：**

```typescript
// 限制通知数量
const MAX_NOTICES = 100

const addNotice = (notice: NoticeItem) => {
  notices.value.push(notice)

  // 超出限制时移除最旧的
  while (notices.value.length > MAX_NOTICES) {
    notices.value.shift()
  }
}

// 定期清理
const cleanupInterval = setInterval(() => {
  const expireTime = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()

  notices.value = notices.value.filter(n =>
    now - new Date(n.time).getTime() < expireTime
  )
}, 3600000) // 每小时清理一次

// 组件卸载时清理
onUnmounted(() => {
  clearInterval(cleanupInterval)
  // 移除其他事件监听器
})
```

## API 总览

### Store State

| 属性 | 类型 | 说明 |
|------|------|------|
| `notices` | `Ref<NoticeItem[]>` | 本地通知列表 |
| `unreadCount` | `Ref<number>` | 服务端未读数量 |

### Store Actions

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `refreshUnreadCount` | - | `Promise<void>` | 刷新未读数量 |
| `addNotice` | `notice: NoticeItem` | `void` | 添加通知 |
| `removeNotice` | `notice: NoticeItem` | `void` | 移除通知 |
| `readAll` | - | `void` | 全部已读 |
| `clearNotice` | - | `void` | 清空通知 |

### API Functions

| 函数 | 说明 | 返回类型 |
|------|------|----------|
| `pageNotices` | 分页查询通知（管理端） | `Result<PageResult<SysNoticeVo>>` |
| `getNotice` | 获取通知详情 | `Result<SysNoticeVo>` |
| `addNotice` | 新增通知 | `Result<string \| number>` |
| `updateNotice` | 更新通知 | `Result<void>` |
| `deleteNotices` | 删除通知 | `Result<void>` |
| `pageUserNotices` | 分页查询用户通知 | `Result<PageResult<UserNoticeVo>>` |
| `getNoticeUnreadCount` | 获取未读数量 | `Result<number>` |
| `getUserNoticeDetail` | 获取用户通知详情 | `Result<UserNoticeVo>` |
| `markNoticeAsRead` | 标记单条已读 | `Result<void>` |
| `markAllNoticesAsRead` | 标记全部已读 | `Result<void>` |

### Type Definitions

| 类型 | 说明 |
|------|------|
| `NoticeItem` | 本地通知项接口 |
| `SysNoticeQuery` | 通知查询参数 |
| `SysNoticeBo` | 通知表单数据 |
| `SysNoticeVo` | 通知视图数据 |
| `UserNoticeVo` | 用户通知视图 |
