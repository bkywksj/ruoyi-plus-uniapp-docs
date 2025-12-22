# useSSE

Server-Sent Events (SSE) 实时消息推送 Composable,提供智能退避策略的实时消息推送功能。

## 介绍

`useSSE` 是一个基于 VueUse `useEventSource` 封装的 SSE 连接管理 Composable,为应用提供稳定可靠的实时消息推送能力。通过智能的指数退避重连策略,确保在网络不稳定时也能保持消息推送的连续性。

**核心特性:**

- **自动连接** - 基于 VueUse `useEventSource` 建立与服务器的 SSE 连接
- **智能退避重连** - 连接断开后按指数退避策略自动重连(3→6→12→24→...秒)
- **消息通知** - 收到消息后通过 Element Plus 通知组件自动提醒用户
- **未读数量同步** - 与 NoticeStore 集成,自动更新全局未读消息数量
- **认证集成** - 自动附加 Token 认证信息到 SSE 连接
- **功能开关** - 与 FeatureStore 集成,支持系统级 SSE 功能开关
- **连接管理** - 提供手动关闭和重连的方法
- **状态监控** - 实时监控连接状态变化
- **资源清理** - 组件卸载时自动清理连接和定时器

## 架构设计

### SSE 通信架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        前端应用层                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │   Layout    │    │ HomeLayout  │    │    业务组件             │ │
│  │   .vue      │    │   .vue      │    │    (可选使用)           │ │
│  └──────┬──────┘    └──────┬──────┘    └────────────┬────────────┘ │
│         │                  │                        │              │
│         └──────────────────┼────────────────────────┘              │
│                            │                                        │
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      useSSE Composable                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │   │
│  │  │   连接管理    │  │   消息处理    │  │    重连策略      │   │   │
│  │  │   close()    │  │   watch(data)│  │  attemptReconnect│   │   │
│  │  │   reconnect()│  │              │  │  getRetryDelay() │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              VueUse useEventSource                    │   │   │
│  │  │  - status    - data    - error    - eventSource      │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                        │
├────────────────────────────┼────────────────────────────────────────┤
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Pinia Stores                            │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │    FeatureStore     │  │       NoticeStore           │   │   │
│  │  │  - sseEnabled       │  │  - unreadCount              │   │   │
│  │  │  - 功能开关检查      │  │  - refreshUnreadCount()    │   │   │
│  │  └─────────────────────┘  └─────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ SSE Connection
                                 │ (Authorization Token)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          后端服务                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    /resource/sse                             │   │
│  │                    SSE 消息推送端点                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 重连策略流程

```
连接成功 ──────────────────────────────────────────────────────────────┐
    │                                                                  │
    ▼                                                                  │
┌────────────┐                                                         │
│  正常通信   │◄──────────────────────────────────────────────────────┐│
└─────┬──────┘                                                        ││
      │                                                                ││
      │ 连接断开/错误                                                  ││
      ▼                                                                ││
┌────────────┐     ┌────────────┐     ┌────────────┐                  ││
│ 重试计数+1  │────►│ 检查次数   │────►│ 达到上限   │───► 停止重试     ││
└─────┬──────┘     └─────┬──────┘     └────────────┘                  ││
      │                  │ 未达上限                                    ││
      │                  ▼                                             ││
      │            ┌────────────┐                                      ││
      │            │ 计算延迟    │                                      ││
      │            │ 3×2^n 秒   │                                      ││
      │            └─────┬──────┘                                      ││
      │                  ▼                                             ││
      │            ┌────────────┐                                      ││
      │            │ 等待延迟    │                                      ││
      │            └─────┬──────┘                                      ││
      │                  ▼                                             ││
      │            ┌────────────┐     成功                             ││
      └───────────►│ 尝试重连    │─────────────────────────────────────┘│
                   └─────┬──────┘                                       │
                         │ 失败                                         │
                         └──────────────────────────────────────────────┘
```

## SSE 协议基础

### 什么是 SSE?

Server-Sent Events (SSE) 是一种服务器向客户端推送数据的技术,基于 HTTP 协议。与 WebSocket 不同,SSE 是单向通信(服务器 → 客户端),更适合消息通知、实时数据更新等场景。

**SSE vs WebSocket 对比:**

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向(服务器→客户端) | 双向 |
| 协议 | HTTP | WebSocket |
| 连接复杂度 | 简单 | 较复杂 |
| 浏览器支持 | 广泛 | 广泛 |
| 自动重连 | 内置支持 | 需手动实现 |
| 适用场景 | 消息通知、数据流 | 实时聊天、游戏 |

### SSE 消息格式

```
event: notification
data: {"title": "新消息", "content": "您有一条新的系统通知"}

event: notification
data: {"title": "审批提醒", "content": "您有待审批的工作流任务"}
```

## 基础用法

### 布局组件中使用

在应用的主布局组件中初始化 SSE 连接,这是最常见的使用方式:

```vue
<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主内容区 -->
    <div class="main-container">
      <Navbar />
      <AppMain />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SystemConfig } from '@/systemConfig'

// 组件挂载时初始化 SSE 连接
onMounted(() => {
  // 建立 SSE 实时消息推送连接
  useSSE(SystemConfig.api.baseUrl + '/resource/sse')
})
</script>
```

**使用说明:**
- SSE 连接在布局组件挂载时建立,覆盖整个应用生命周期
- 使用 `SystemConfig.api.baseUrl` 确保 API 地址的统一管理
- SSE 端点路径 `/resource/sse` 由后端提供

### 获取连接状态和控制方法

```vue
<template>
  <div class="notification-panel">
    <div class="status-bar">
      <span class="status-dot" :class="statusClass"></span>
      <span>{{ statusText }}</span>
    </div>

    <el-badge :value="unreadCount" :hidden="unreadCount === 0">
      <el-icon size="20"><Bell /></el-icon>
    </el-badge>

    <div class="controls">
      <el-button @click="handleReconnect" :disabled="status === 'OPEN'">
        重新连接
      </el-button>
      <el-button @click="handleClose" :disabled="status === 'CLOSED'">
        关闭连接
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSSE } from '@/composables/useSSE'

const { status, unreadCount, reconnect, close } = useSSE('/api/sse/notifications')

// 连接状态样式
const statusClass = computed(() => ({
  'status-connected': status.value === 'OPEN',
  'status-connecting': status.value === 'CONNECTING',
  'status-disconnected': status.value === 'CLOSED',
  'status-disabled': status.value === 'disabled'
}))

// 连接状态文本
const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    CONNECTING: '连接中...',
    OPEN: '已连接',
    CLOSED: '已断开',
    disabled: '未启用'
  }
  return statusMap[status.value] || '未知状态'
})

// 手动重新连接
const handleReconnect = () => {
  reconnect()
}

// 手动关闭连接
const handleClose = () => {
  close()
}
</script>

<style lang="scss" scoped>
.notification-panel {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.status-connected {
    background-color: #67c23a;
    box-shadow: 0 0 8px rgba(103, 194, 58, 0.5);
  }

  &.status-connecting {
    background-color: #e6a23c;
    animation: pulse 1s infinite;
  }

  &.status-disconnected {
    background-color: #f56c6c;
  }

  &.status-disabled {
    background-color: #909399;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

**使用说明:**
- `status` 是响应式的连接状态,可用于 UI 展示
- `unreadCount` 是全局未读消息数量,与 NoticeStore 同步
- `reconnect()` 用于手动重连,会重置重试计数
- `close()` 用于手动关闭连接,会阻止自动重连

### 自定义重连配置

```vue
<script lang="ts" setup>
import { useSSE } from '@/composables/useSSE'

// 场景1: 减少重试次数(网络不稳定环境)
const { status } = useSSE('/api/sse/notifications', {
  maxRetries: 5,     // 最多重试5次
  baseDelay: 2       // 基础延迟2秒
})

// 场景2: 增加重试次数(关键业务)
const { status: criticalStatus } = useSSE('/api/sse/critical', {
  maxRetries: 15,    // 最多重试15次
  baseDelay: 1       // 基础延迟1秒,快速重连
})

// 场景3: 长间隔重连(低优先级)
const { status: lowPriorityStatus } = useSSE('/api/sse/logs', {
  maxRetries: 3,     // 最多重试3次
  baseDelay: 10      // 基础延迟10秒
})
</script>
```

**配置说明:**
- `maxRetries`: 最大重试次数,默认为 8 次
- `baseDelay`: 基础延迟秒数,默认为 3 秒
- 实际延迟计算公式: `delay = baseDelay × 2^retryIndex`

## 退避重连策略

### 指数退避算法

useSSE 使用指数退避算法进行重连,避免在服务器恢复时产生瞬时高负载:

```typescript
/**
 * 动态计算退避延迟时间
 * 规律: 3 → 6 → 12 → 24 → 48 → 96 → 192 → 384...
 * 公式: delay = baseDelay × (2^retryIndex)
 */
const getRetryDelay = (retryIndex: number): number => {
  const delaySeconds = baseDelay * Math.pow(2, retryIndex)
  return delaySeconds * 1000 // 返回毫秒
}
```

### 重连时间表

默认配置下的重连时间表:

| 重试次数 | 延迟时间 | 累计等待时间 |
|---------|---------|-------------|
| 第1次 | 3秒 | 3秒 |
| 第2次 | 6秒 | 9秒 |
| 第3次 | 12秒 | 21秒 |
| 第4次 | 24秒 | 45秒 |
| 第5次 | 48秒 | 1分33秒 |
| 第6次 | 96秒 | 3分9秒 |
| 第7次 | 192秒 | 6分21秒 |
| 第8次 | 384秒 | 12分45秒 |

### 重连状态管理

```typescript
// 重连核心逻辑
const attemptReconnect = () => {
  // 防止重复重连
  if (isReconnecting) {
    return
  }

  // 检查是否达到最大重试次数
  if (currentRetryCount >= maxRetries) {
    console.log(`🛑 SSE重试${maxRetries}次后连接失败，停止重试`)
    isReconnecting = false
    return
  }

  isReconnecting = true
  const delay = getRetryDelay(currentRetryCount)

  console.log(`🔄 SSE将在${delay/1000}秒后进行第${currentRetryCount + 1}次重连...`)

  retryTimeoutId = window.setTimeout(() => {
    console.log(`🚀 开始第${currentRetryCount + 1}次重连尝试...`)
    currentRetryCount++

    // 先关闭再打开,确保状态正确
    close()
    setTimeout(() => {
      isReconnecting = false
      open()
    }, 100)
  }, delay)
}
```

**技术要点:**
- `isReconnecting` 防止重复重连
- 连接成功后重置 `currentRetryCount` 为 0
- 使用 `setTimeout` 实现延迟重连
- 先 `close()` 再 `open()` 确保连接状态正确

## 功能开关集成

### FeatureStore 集成

useSSE 与系统功能配置 Store 集成,支持服务端控制 SSE 功能开关:

```typescript
export const useSSE = (url: string, options = {}) => {
  const featureStore = useFeatureStore()

  // 检查 SSE 功能是否启用
  if (!featureStore.features.sseEnabled) {
    return {
      close: () => {},
      reconnect: () => {},
      status: ref('disabled'),
      unreadCount: computed(() => noticeStore.unreadCount)
    }
  }

  // SSE 功能启用,继续正常初始化...
}
```

**功能开关状态:**

```typescript
interface SystemFeature {
  langchain4jEnabled: boolean    // AI 功能开关
  websocketEnabled: boolean      // WebSocket 开关
  sseEnabled: boolean            // SSE 开关
  openApiEnabled: boolean        // OpenAPI 开关
  openApiAccessMode: string      // API 访问模式
  openApiAllowedRoles: string[]  // 允许的角色
}
```

### 禁用状态处理

```vue
<template>
  <div class="sse-status">
    <template v-if="status === 'disabled'">
      <el-alert
        title="实时消息推送功能未启用"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          请联系管理员在系统配置中启用 SSE 功能
        </template>
      </el-alert>
    </template>

    <template v-else>
      <!-- 正常状态展示 -->
      <div class="connection-info">
        <span>连接状态: {{ status }}</span>
        <span>未读消息: {{ unreadCount }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const { status, unreadCount } = useSSE('/api/sse/notifications')
</script>
```

## 消息处理

### 消息接收流程

```typescript
// 监听数据变化
watch(data, async (newData) => {
  if (!newData) return

  console.log('📨 SSE收到消息:', newData)

  // 1. 显示通知(延迟执行避免重叠)
  setTimeout(() => {
    showNotifySuccess({
      title: '新通知',
      message: newData,
      duration: 3000,
      position: 'top-right',
      offset: 50
    })
  }, 100)

  // 2. 更新未读数量
  await noticeStore.refreshUnreadCount()

  // 3. 清空数据,准备接收下一条
  data.value = null
})
```

### 自定义消息处理

```vue
<script lang="ts" setup>
import { useSSE } from '@/composables/useSSE'

// 获取底层 eventSource 进行自定义处理
const { eventSource, status } = useSSE('/api/sse/notifications')

// 监听自定义事件类型
watch(eventSource, (es) => {
  if (!es) return

  // 监听 notification 事件
  es.addEventListener('notification', (event) => {
    const data = JSON.parse(event.data)
    handleNotification(data)
  })

  // 监听 alert 事件
  es.addEventListener('alert', (event) => {
    const data = JSON.parse(event.data)
    handleAlert(data)
  })

  // 监听 update 事件
  es.addEventListener('update', (event) => {
    const data = JSON.parse(event.data)
    handleUpdate(data)
  })
})

// 自定义处理函数
const handleNotification = (data: any) => {
  console.log('收到通知:', data)
  // 自定义通知处理逻辑
}

const handleAlert = (data: any) => {
  console.log('收到警报:', data)
  // 紧急警报处理逻辑
  ElMessageBox.alert(data.message, data.title, {
    type: 'warning',
    confirmButtonText: '我知道了'
  })
}

const handleUpdate = (data: any) => {
  console.log('收到更新:', data)
  // 数据更新处理逻辑
}
</script>
```

### 消息类型处理

```typescript
interface SSEMessage {
  type: 'notification' | 'alert' | 'update' | 'heartbeat'
  title?: string
  content: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  timestamp: number
  data?: Record<string, any>
}

// 根据消息类型分发处理
const handleMessage = (message: SSEMessage) => {
  switch (message.type) {
    case 'notification':
      showNotifySuccess({
        title: message.title || '新通知',
        message: message.content,
        duration: 3000
      })
      break

    case 'alert':
      showNotifyWarning({
        title: message.title || '警告',
        message: message.content,
        duration: 0 // 不自动关闭
      })
      break

    case 'update':
      // 触发数据刷新
      emitter.emit('data-update', message.data)
      break

    case 'heartbeat':
      // 心跳消息,仅用于保持连接
      console.log('💓 SSE心跳:', message.timestamp)
      break
  }
}
```

## 认证处理

### Token 附加

useSSE 自动将认证 Token 附加到 SSE 连接 URL:

```typescript
const token = useToken()

// 构造带认证信息的 URL
const finalUrl = `${url}?${token.getAuthQuery()}`

// 实际 URL 示例:
// /api/sse/notifications?Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### useToken 集成

```typescript
// Token 管理 Composable
export const useToken = () => {
  const TOKEN_KEY = 'token'

  const getToken = (): string | null => {
    return localCache.get(TOKEN_KEY)
  }

  const getAuthHeaders = (): Record<string, string> => {
    const tokenValue = getToken()
    if (!tokenValue) return {}
    return { Authorization: `Bearer ${tokenValue}` }
  }

  const getAuthQuery = (): string => {
    const headers = getAuthHeaders()
    return objectToQuery(headers)
  }

  return { getToken, getAuthHeaders, getAuthQuery }
}
```

### 认证失败处理

```vue
<script lang="ts" setup>
const { status, error } = useSSE('/api/sse/notifications')

// 监听认证错误
watch(error, (newError) => {
  if (!newError) return

  // 检查是否为认证错误
  if (newError.message?.includes('401') ||
      newError.message?.includes('Unauthorized')) {
    console.error('SSE认证失败,需要重新登录')

    // 跳转到登录页
    router.push('/login')
  }
})
</script>
```

## 通知集成

### NoticeStore 集成

useSSE 与通知 Store 集成,自动管理未读消息数量:

```typescript
const noticeStore = useNoticeStore()

// 收到新消息后更新未读数量
watch(data, async (newData) => {
  if (!newData) return

  // 更新未读数量
  await noticeStore.refreshUnreadCount()
})

// 返回未读数量计算属性
return {
  unreadCount: computed(() => noticeStore.unreadCount)
}
```

### NoticeStore API

```typescript
interface NoticeItem {
  id?: string
  title?: string
  read: boolean
  message: any
  time: string
}

export const useNoticeStore = defineStore('notice', () => {
  const notices = ref<NoticeItem[]>([])
  const unreadCount = ref(0)

  // 从后端刷新未读数量
  const refreshUnreadCount = async () => {
    const [err, data] = await getNoticeUnreadCount()
    if (!err) {
      unreadCount.value = data || 0
    }
  }

  // 添加通知
  const addNotice = (notice: NoticeItem) => {
    notices.value.push(notice)
    refreshUnreadCount()
  }

  // 标记全部已读
  const readAll = () => {
    notices.value.forEach(item => item.read = true)
  }

  // 清空通知
  const clearNotice = () => {
    notices.value = []
  }

  return {
    notices,
    unreadCount,
    refreshUnreadCount,
    addNotice,
    readAll,
    clearNotice
  }
})
```

### 通知中心组件

```vue
<template>
  <el-popover
    placement="bottom"
    :width="360"
    trigger="click"
  >
    <template #reference>
      <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
        <el-button :icon="Bell" circle />
      </el-badge>
    </template>

    <div class="notice-panel">
      <div class="notice-header">
        <span>通知中心</span>
        <el-button text type="primary" @click="handleReadAll">
          全部已读
        </el-button>
      </div>

      <el-scrollbar max-height="400px">
        <div v-if="notices.length === 0" class="notice-empty">
          <el-empty description="暂无通知" />
        </div>

        <div
          v-for="notice in notices"
          :key="notice.id"
          class="notice-item"
          :class="{ 'is-read': notice.read }"
        >
          <div class="notice-title">{{ notice.title }}</div>
          <div class="notice-content">{{ notice.message }}</div>
          <div class="notice-time">{{ notice.time }}</div>
        </div>
      </el-scrollbar>

      <div class="notice-footer">
        <el-button text @click="handleClear">清空通知</el-button>
        <el-button text type="primary" @click="handleViewAll">
          查看全部
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { Bell } from '@element-plus/icons-vue'

const noticeStore = useNoticeStore()
const { unreadCount } = useSSE('/api/sse/notifications')

const notices = computed(() => noticeStore.notices)

const handleReadAll = () => {
  noticeStore.readAll()
}

const handleClear = () => {
  noticeStore.clearNotice()
}

const handleViewAll = () => {
  router.push('/system/notice')
}
</script>

<style lang="scss" scoped>
.notice-panel {
  .notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    font-weight: 600;
  }

  .notice-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-read {
      opacity: 0.6;
    }

    .notice-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .notice-content {
      font-size: 13px;
      color: var(--el-text-color-regular);
      margin-bottom: 4px;
    }

    .notice-time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .notice-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style>
```

## 状态监控

### 连接状态类型

```typescript
type SSEStatus = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'disabled'
```

| 状态值 | 说明 | 触发条件 |
|--------|------|---------|
| `CONNECTING` | 正在连接 | 初始化连接或重连中 |
| `OPEN` | 连接已建立 | 成功建立 SSE 连接 |
| `CLOSED` | 连接已关闭 | 连接断开或手动关闭 |
| `disabled` | 功能未启用 | `sseEnabled` 为 false |

### 状态变化监听

```typescript
// 监听连接状态变化
watch(
  status,
  (newStatus, oldStatus) => {
    if (newStatus === 'OPEN' && oldStatus !== 'OPEN') {
      // 连接成功
      console.log('✅ SSE连接已建立')
      currentRetryCount = 0 // 重置重试计数

      // 连接成功后立即更新未读数量
      noticeStore.refreshUnreadCount()
    } else if (newStatus === 'CLOSED' && oldStatus !== 'CLOSED') {
      // 连接断开
      console.log('❌ SSE连接已断开')

      // 如果不是手动关闭,则尝试重连
      if (!isManuallyClose) {
        attemptReconnect()
      }
    }
  },
  { immediate: true }
)
```

### 错误监听

```typescript
// 监听错误变化
watch(error, (newError) => {
  if (newError) {
    console.error('❌ SSE连接错误:', newError)

    // 错误后也尝试重连
    if (!isManuallyClose && !isReconnecting) {
      attemptReconnect()
    }
  }
})
```

### 状态指示器组件

```vue
<template>
  <div class="sse-indicator">
    <div class="indicator-dot" :class="statusClass">
      <span class="pulse" v-if="status === 'CONNECTING'"></span>
    </div>
    <span class="indicator-text">{{ statusText }}</span>

    <el-tooltip
      v-if="status === 'CLOSED'"
      content="点击重新连接"
      placement="top"
    >
      <el-icon class="reconnect-icon" @click="reconnect">
        <Refresh />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { Refresh } from '@element-plus/icons-vue'

const { status, reconnect } = useSSE('/api/sse/notifications')

const statusClass = computed(() => `status-${status.value.toLowerCase()}`)

const statusText = computed(() => ({
  CONNECTING: '连接中',
  OPEN: '已连接',
  CLOSED: '已断开',
  disabled: '未启用'
}[status.value] || '未知'))
</script>

<style lang="scss" scoped>
.sse-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.indicator-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.status-open {
    background-color: var(--el-color-success);
  }

  &.status-connecting {
    background-color: var(--el-color-warning);

    .pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: inherit;
      animation: pulse 1.5s ease-out infinite;
    }
  }

  &.status-closed {
    background-color: var(--el-color-danger);
  }

  &.status-disabled {
    background-color: var(--el-color-info);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.reconnect-icon {
  cursor: pointer;
  color: var(--el-color-primary);

  &:hover {
    color: var(--el-color-primary-light-3);
  }
}
</style>
```

## API 参考

### useSSE 函数签名

```typescript
function useSSE(
  url: string,
  options?: SSEOptions
): SSEReturn
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | `string` | 是 | SSE 连接地址 |
| options | `SSEOptions` | 否 | 配置选项 |

### SSEOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxRetries | `number` | 8 | 最大重试次数 |
| baseDelay | `number` | 3 | 基础延迟秒数 |

### 返回值 SSEReturn

| 属性 | 类型 | 说明 |
|------|------|------|
| close | `() => void` | 关闭 SSE 连接 |
| reconnect | `() => void` | 手动重新连接 |
| status | `Readonly<Ref<string>>` | 连接状态 |
| unreadCount | `ComputedRef<number>` | 未读消息数量 |
| eventSource | `Readonly<Ref<EventSource \| null>>` | 原始 EventSource 对象 |

### 类型定义

```typescript
/**
 * SSE 配置选项
 */
interface SSEOptions {
  /** 最大重试次数,默认 8 次 */
  maxRetries?: number
  /** 基础延迟秒数,默认 3 秒 */
  baseDelay?: number
}

/**
 * SSE 返回值接口
 */
interface SSEReturn {
  /** 关闭连接 */
  close: () => void
  /** 重新连接 */
  reconnect: () => void
  /** 连接状态 */
  status: Readonly<Ref<string>>
  /** 未读消息数量 */
  unreadCount: ComputedRef<number>
  /** 原始 EventSource 对象 */
  eventSource: Readonly<Ref<EventSource | null>>
}

/**
 * 连接状态类型
 */
type SSEConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'disabled'

/**
 * SSE 消息接口
 */
interface SSEMessage {
  /** 消息类型 */
  type: string
  /** 消息标题 */
  title?: string
  /** 消息内容 */
  content: string
  /** 优先级 */
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  /** 时间戳 */
  timestamp: number
  /** 附加数据 */
  data?: Record<string, any>
}
```

## 最佳实践

### 1. 在布局组件中初始化

SSE 连接应在应用的顶层布局组件中初始化,确保覆盖整个应用生命周期:

```vue
<!-- Layout.vue -->
<script lang="ts" setup>
onMounted(() => {
  // 在布局组件挂载时建立 SSE 连接
  useSSE(SystemConfig.api.baseUrl + '/resource/sse')
})
</script>
```

### 2. 合理配置重连参数

根据业务场景调整重连参数:

```typescript
// 关键业务: 快速重连,多次重试
useSSE('/api/sse/critical', {
  maxRetries: 15,
  baseDelay: 1
})

// 普通通知: 默认配置
useSSE('/api/sse/notifications')

// 低优先级: 少量重试,长间隔
useSSE('/api/sse/logs', {
  maxRetries: 3,
  baseDelay: 10
})
```

### 3. 处理页面可见性

页面隐藏时断开连接,显示时重连,节省资源:

```vue
<script lang="ts" setup>
import { useDocumentVisibility } from '@vueuse/core'

const { reconnect, close } = useSSE('/api/sse/notifications')
const visibility = useDocumentVisibility()

watch(visibility, (current) => {
  if (current === 'visible') {
    reconnect()
  } else if (current === 'hidden') {
    close()
  }
})
</script>
```

### 4. 避免重复连接

确保同一页面不会创建多个 SSE 连接:

```typescript
// 使用单例模式
let sseInstance: SSEReturn | null = null

export const useSSESingleton = (url: string, options?: SSEOptions) => {
  if (!sseInstance) {
    sseInstance = useSSE(url, options)
  }
  return sseInstance
}
```

### 5. 状态展示最佳实践

向用户清晰展示连接状态:

```vue
<template>
  <div class="connection-status">
    <!-- 连接正常时不打扰用户 -->
    <template v-if="status === 'OPEN'">
      <span class="status-dot green"></span>
    </template>

    <!-- 连接中显示加载状态 -->
    <template v-else-if="status === 'CONNECTING'">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>连接中...</span>
    </template>

    <!-- 断开时提供重连按钮 -->
    <template v-else-if="status === 'CLOSED'">
      <span class="status-dot red"></span>
      <span>连接断开</span>
      <el-button text size="small" @click="reconnect">重连</el-button>
    </template>

    <!-- 禁用时提供说明 -->
    <template v-else-if="status === 'disabled'">
      <el-tooltip content="实时通知功能未启用">
        <el-icon><InfoFilled /></el-icon>
      </el-tooltip>
    </template>
  </div>
</template>
```

### 6. 错误日志记录

记录详细的错误信息便于排查:

```typescript
watch(error, (newError) => {
  if (!newError) return

  // 记录错误日志
  console.error('SSE Error:', {
    message: newError.message,
    url: url,
    status: status.value,
    retryCount: currentRetryCount,
    timestamp: new Date().toISOString()
  })

  // 可选: 上报到监控系统
  reportError('SSE_CONNECTION_ERROR', newError)
})
```

### 7. 优雅降级

SSE 不可用时提供降级方案:

```vue
<script lang="ts" setup>
const { status } = useSSE('/api/sse/notifications')

// SSE 不可用时降级为轮询
watch(status, (newStatus) => {
  if (newStatus === 'disabled' ||
      (newStatus === 'CLOSED' && currentRetryCount >= maxRetries)) {
    // 启动轮询作为降级方案
    startPolling()
  } else if (newStatus === 'OPEN') {
    // SSE 恢复,停止轮询
    stopPolling()
  }
})

const pollingInterval = ref<number | null>(null)

const startPolling = () => {
  if (pollingInterval.value) return

  pollingInterval.value = window.setInterval(async () => {
    await noticeStore.refreshUnreadCount()
  }, 30000) // 30秒轮询一次
}

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}
</script>
```

### 8. 内存泄漏防护

确保组件卸载时清理资源:

```typescript
// useSSE 内部已自动处理
onUnmounted(() => {
  enhancedClose() // 关闭连接和清理定时器
})

// 手动使用时也要注意清理
const { close } = useSSE('/api/sse/notifications')

onUnmounted(() => {
  close()
})
```

## 常见问题

### 1. SSE 连接一直处于 CONNECTING 状态

**问题原因:**
- 后端 SSE 端点未正确实现
- 网络防火墙阻止了长连接
- 代理服务器(如 Nginx)配置不当

**解决方案:**

```nginx
# Nginx 配置 SSE 支持
location /api/sse/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Cache-Control no-cache;
    proxy_set_header X-Accel-Buffering no;
    proxy_buffering off;
    proxy_read_timeout 86400s;
}
```

### 2. 收不到消息通知

**问题原因:**
- SSE 功能未启用(`sseEnabled: false`)
- Token 认证失败
- 后端未正确推送消息

**解决方案:**

```typescript
// 检查功能是否启用
const featureStore = useFeatureStore()
console.log('SSE Enabled:', featureStore.features.sseEnabled)

// 检查 Token
const token = useToken()
console.log('Token:', token.getToken())

// 检查连接状态
const { status, eventSource } = useSSE('/api/sse/notifications')
console.log('Status:', status.value)
console.log('EventSource:', eventSource.value)
```

### 3. 频繁断开重连

**问题原因:**
- 网络不稳定
- 服务端超时配置过短
- 浏览器休眠导致连接断开

**解决方案:**

```typescript
// 增加重试次数和间隔
const { status } = useSSE('/api/sse/notifications', {
  maxRetries: 15,
  baseDelay: 5
})

// 监控断开原因
watch(status, (newStatus, oldStatus) => {
  if (newStatus === 'CLOSED' && oldStatus === 'OPEN') {
    console.log('SSE 断开,将自动重连')
  }
})
```

### 4. 未读数量不更新

**问题原因:**
- NoticeStore 未正确初始化
- API 接口返回错误
- 计算属性未正确响应

**解决方案:**

```typescript
// 手动刷新未读数量
const noticeStore = useNoticeStore()

// 检查 API 调用结果
const refreshCount = async () => {
  const [err, data] = await getNoticeUnreadCount()
  if (err) {
    console.error('获取未读数量失败:', err)
  } else {
    console.log('未读数量:', data)
  }
}

// 强制刷新
const { unreadCount } = useSSE('/api/sse/notifications')
await noticeStore.refreshUnreadCount()
console.log('当前未读:', unreadCount.value)
```

### 5. 页面切换后连接丢失

**问题原因:**
- 组件卸载时连接被关闭
- 路由切换导致布局组件重新挂载

**解决方案:**

```vue
<!-- 使用 keep-alive 保持布局组件 -->
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['Layout']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 6. 移动端连接不稳定

**问题原因:**
- 移动网络切换(WiFi/4G)
- 浏览器后台策略限制
- 低电量模式限制

**解决方案:**

```typescript
// 监听网络状态变化
import { useNetwork } from '@vueuse/core'

const { isOnline, offlineAt, onlineAt } = useNetwork()
const { reconnect } = useSSE('/api/sse/notifications')

// 网络恢复时重连
watch(isOnline, (online) => {
  if (online) {
    console.log('网络已恢复,重新连接 SSE')
    reconnect()
  }
})
```

### 7. 控制台大量错误日志

**问题原因:**
- 连接失败时重复报错
- 未正确处理错误状态

**解决方案:**

```typescript
// 节流错误日志
import { useDebounceFn } from '@vueuse/core'

const logError = useDebounceFn((error: Error) => {
  console.error('SSE Error:', error.message)
}, 5000)

watch(error, (newError) => {
  if (newError) {
    logError(newError)
  }
})
```

### 8. 多标签页连接冲突

**问题原因:**
- 同一用户打开多个标签页
- 每个标签页都建立 SSE 连接
- 服务端可能限制连接数

**解决方案:**

```typescript
// 使用 BroadcastChannel 协调多标签页
const channel = new BroadcastChannel('sse-coordinator')

let isLeader = false

channel.onmessage = (event) => {
  if (event.data.type === 'leader-elected' && event.data.id !== tabId) {
    // 其他标签页成为 leader,关闭本页连接
    close()
  }
}

// 尝试成为 leader
const tabId = Date.now().toString()
channel.postMessage({ type: 'leader-election', id: tabId })

setTimeout(() => {
  if (!isLeader) {
    isLeader = true
    channel.postMessage({ type: 'leader-elected', id: tabId })
    // 只有 leader 建立 SSE 连接
    useSSE('/api/sse/notifications')
  }
}, 100)
```

## 性能优化

### 1. 消息批处理

```typescript
// 批量处理消息,避免频繁更新 UI
const messageQueue = ref<SSEMessage[]>([])
const flushMessages = useDebounceFn(() => {
  const messages = messageQueue.value
  messageQueue.value = []

  // 批量处理
  messages.forEach(handleMessage)
}, 100)

watch(data, (newData) => {
  if (newData) {
    messageQueue.value.push(JSON.parse(newData))
    flushMessages()
  }
})
```

### 2. 按需连接

```typescript
// 只在需要时建立连接
const shouldConnect = computed(() => {
  return isLoggedIn.value && hasNotificationPermission.value
})

watch(shouldConnect, (should) => {
  if (should) {
    const { reconnect } = useSSE('/api/sse/notifications')
    reconnect()
  } else {
    close()
  }
})
```

### 3. 心跳检测

```typescript
// 客户端心跳检测
let heartbeatTimer: number | null = null

watch(status, (newStatus) => {
  if (newStatus === 'OPEN') {
    // 每30秒检测一次
    heartbeatTimer = window.setInterval(() => {
      if (status.value !== 'OPEN') {
        reconnect()
      }
    }, 30000)
  } else {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }
})
```

## 安全考虑

### 1. Token 安全

SSE 连接通过 URL 参数传递 Token,需注意:

```typescript
// Token 仅通过 HTTPS 传输
if (location.protocol !== 'https:' && !isDev) {
  console.warn('SSE 连接应使用 HTTPS')
}

// 定期刷新 Token
const refreshTokenInterval = setInterval(async () => {
  await refreshToken()
  // Token 刷新后重连 SSE
  reconnect()
}, 1800000) // 30分钟
```

### 2. XSS 防护

```typescript
// 消息内容需要转义后显示
const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

watch(data, (newData) => {
  if (newData) {
    const safeMessage = escapeHtml(newData)
    showNotifySuccess({
      title: '新通知',
      message: safeMessage
    })
  }
})
```

### 3. 速率限制

```typescript
// 客户端速率限制
import { useThrottleFn } from '@vueuse/core'

const handleMessage = useThrottleFn((message: string) => {
  // 每秒最多处理5条消息
  processMessage(message)
}, 200)
```

---

useSSE 为应用提供了稳定可靠的实时消息推送能力,通过智能的重连策略确保消息不丢失。结合 FeatureStore 和 NoticeStore,实现了功能开关控制和未读消息管理的完整解决方案。
