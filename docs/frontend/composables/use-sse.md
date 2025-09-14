# useSSE

Server-Sent Events (SSE) 实时消息推送组合函数，提供动态退避策略的实时消息推送功能。

## 📋 功能特性

- **自动连接**: 建立与服务器的SSE连接 (基于VueUse useEventSource)
- **动态退避重连**: 连接断开后按指数退避策略自动重连 (自定义重连逻辑)
- **消息接收**: 监听并接收服务器推送的实时消息 (watch data)
- **消息通知**: 收到消息后通过Element Plus通知提醒 (showNotifySuccess)
- **未读数量更新**: 收到新消息后自动更新未读数量 (getNoticeUnreadCount)
- **连接管理**: 提供手动关闭和重连的方法 (close, reconnect)
- **状态监控**: 实时监控连接状态变化 (status reactive)
- **错误处理**: 监听并处理连接错误情况 (watch error)
- **资源清理**: 组件卸载时自动清理连接和定时器 (onUnmounted)

## 🎯 基础用法

### 基本使用

```vue
<template>
  <div>
    <div>连接状态: {{ status }}</div>
    <div>未读消息数量: {{ unreadCount }}</div>
    <el-button @click="handleReconnect">重新连接</el-button>
    <el-button @click="handleClose">关闭连接</el-button>
  </div>
</template>

<script setup>
import { useSSE } from '@/composables/useSSE'

const { status, unreadCount, reconnect, close } = useSSE('/api/sse/notifications')

const handleReconnect = () => {
  reconnect()
}

const handleClose = () => {
  close()
}
</script>
```

### 自定义配置

```vue
<script setup>
import { useSSE } from '@/composables/useSSE'

const { status, unreadCount, reconnect, close } = useSSE('/api/sse/notifications', {
  maxRetries: 10,        // 最大重试次数，默认8次
  baseDelay: 5           // 基础延迟秒数，默认3秒
})
</script>
```

## 📖 API 参考

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | string | - | SSE连接地址 |
| options | SSEOptions | {} | 配置选项 |

### SSEOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxRetries | number | 8 | 最大重试次数 |
| baseDelay | number | 3 | 基础延迟秒数 |

### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| close | Function | 关闭SSE连接 |
| reconnect | Function | 手动重新连接 |
| status | Ref\<string\> | 连接状态 |
| unreadCount | Ref\<number\> | 全局未读消息数量 |

### 连接状态

| 状态值 | 说明 |
|--------|------|
| CONNECTING | 正在连接 |
| OPEN | 连接已建立 |
| CLOSED | 连接已关闭 |
| disabled | 系统未启用SSE功能 |

## 💡 高级用法

### 动态退避重连策略

SSE使用指数退避算法进行重连：

- **重连间隔**: 3 → 6 → 12 → 24 → 48 → 96 → 192 → 384 秒...
- **计算公式**: `delay = baseDelay * (2^retryIndex)`
- **最大重试**: 默认8次，可配置
- **自动重置**: 连接成功后重试计数归零

```javascript
// 退避策略示例
const delays = [
  3,   // 第1次重试
  6,   // 第2次重试
  12,  // 第3次重试
  24,  // 第4次重试
  48,  // 第5次重试
  96,  // 第6次重试
  192, // 第7次重试
  384  // 第8次重试（最后一次）
]
```

### 全局未读数量管理

```vue
<template>
  <el-badge :value="unreadCount" :hidden="unreadCount === 0">
    <el-icon><Bell /></el-icon>
  </el-badge>
</template>

<script setup>
import { useSSE, globalUnreadCount, refreshUnreadCount } from '@/composables/useSSE'

// 使用全局未读数量
const unreadCount = globalUnreadCount

// 手动刷新未读数量
const handleRefresh = async () => {
  await refreshUnreadCount()
}
</script>
```

### 监听连接状态变化

```vue
<script setup>
import { useSSE } from '@/composables/useSSE'

const { status } = useSSE('/api/sse/notifications')

// 监听状态变化
watch(status, (newStatus, oldStatus) => {
  console.log(`SSE状态变化: ${oldStatus} → ${newStatus}`)
  
  if (newStatus === 'OPEN') {
    console.log('SSE连接已建立')
  } else if (newStatus === 'CLOSED') {
    console.log('SSE连接已断开')
  }
})
</script>
```

## 🔧 实现原理

### 消息处理流程

1. **接收消息**: 监听SSE的data变化
2. **显示通知**: 使用Element Plus的通知组件
3. **更新计数**: 调用API更新未读消息数量
4. **清空数据**: 处理完成后清空当前消息

```javascript
// 消息处理示例
watch(data, async (newData) => {
  if (!newData) return

  // 显示通知
  showNotifySuccess({
    title: '新通知',
    message: newData,
    duration: 3000,
    position: 'top-right',
    offset: 50
  })

  // 更新未读数量
  await updateUnreadCount()

  // 清空数据
  data.value = null
})
```

### 认证处理

SSE连接自动附加认证信息：

```javascript
// 构造认证URL
const finalUrl = `${url}?${token.getAuthQuery()}`
```

## ⚠️ 注意事项

### 系统配置检查

```javascript
// 检查SSE功能是否启用
if (!SystemConfig.features.sse) {
  return {
    close: () => {},
    reconnect: () => {},
    status: ref('disabled'),
    unreadCount: globalUnreadCount
  }
}
```

### 资源清理

组件卸载时自动清理：

```javascript
// 自动清理
onUnmounted(() => {
  enhancedClose() // 关闭连接和清理定时器
})
```

### 错误处理

连接错误不会阻止重连：

```javascript
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

## 🎨 最佳实践

### 1. 合理配置重连参数

```javascript
// 根据业务场景调整参数
const { status } = useSSE('/api/sse/notifications', {
  maxRetries: 5,      // 网络不稳定时减少重试次数
  baseDelay: 2        // 快速重连场景
})
```

### 2. 监控连接状态

```vue
<template>
  <div class="sse-status" :class="statusClass">
    {{ statusText }}
  </div>
</template>

<script setup>
const { status } = useSSE('/api/sse/notifications')

const statusClass = computed(() => ({
  'status-connected': status.value === 'OPEN',
  'status-connecting': status.value === 'CONNECTING',
  'status-disconnected': status.value === 'CLOSED'
}))

const statusText = computed(() => {
  const statusMap = {
    CONNECTING: '连接中...',
    OPEN: '已连接',
    CLOSED: '已断开',
    disabled: '未启用'
  }
  return statusMap[status.value] || '未知状态'
})
</script>
```

### 3. 处理页面可见性

```vue
<script setup>
import { useDocumentVisibility } from '@vueuse/core'

const { reconnect, close } = useSSE('/api/sse/notifications')
const visibility = useDocumentVisibility()

// 页面隐藏时关闭连接，显示时重连
watch(visibility, (current) => {
  if (current === 'visible') {
    reconnect()
  } else if (current === 'hidden') {
    close()
  }
})
</script>
```

useSSE 为应用提供了稳定可靠的实时消息推送能力，通过智能的重连策略确保消息不丢失。
