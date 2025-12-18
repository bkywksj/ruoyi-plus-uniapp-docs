# useWebSocket WebSocket 通信

## 介绍

`useWebSocket` 是一个功能完整的 WebSocket 实时通信管理 Composable，基于 UniApp 的 WebSocket API 实现，提供了自动重连、心跳检测、消息处理管道等企业级特性。

**核心特性:**

- **自动连接管理** - 支持自动连接、断开、重连，无需手动管理连接状态
- **指数退避重连** - 采用动态退避策略（3s → 6s → 12s → 24s...），避免服务器压力
- **心跳检测** - 定时发送心跳消息保持连接活跃，自动检测连接状态
- **消息处理管道** - 责任链模式处理不同类型消息，支持自定义处理器
- **认证支持** - 自动附加 Token 进行身份验证
- **全局单例管理** - 提供全局 WebSocket 管理器，确保应用级别只有一个连接实例
- **TypeScript 支持** - 完整的类型定义
- **平台兼容** - 支持 UniApp 所有平台（H5、小程序、App）

## 基本用法

### 简单连接

```vue
<template>
  <view class="page">
    <view class="status">
      <text>连接状态: {{ status }}</text>
      <text>是否已连接: {{ isConnected ? '是' : '否' }}</text>
    </view>
    <view v-if="lastMessage" class="message">
      <text>最新消息: {{ lastMessage }}</text>
    </view>
    <view class="actions">
      <wd-button type="primary" @click="connect">连接</wd-button>
      <wd-button type="warning" @click="disconnect">断开</wd-button>
      <wd-button type="success" @click="handleSend">发送消息</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, disconnect, send, status, isConnected, data } = useWebSocket(
  'wss://example.com/ws',
  {
    onMessage: (message) => console.log('收到消息:', message),
    onConnected: () => console.log('连接成功'),
    onDisconnected: (code, reason) => console.log('连接断开:', code, reason),
  },
)

const lastMessage = computed(() => data.value)

const handleSend = () => {
  const success = send({
    type: 'message',
    content: 'Hello WebSocket!',
    timestamp: Date.now(),
  })
  if (success) {
    uni.showToast({ title: '发送成功', icon: 'success' })
  }
}
</script>
```

**使用说明:**
- `status` 是只读连接状态：`CONNECTING` | `OPEN` | `CLOSING` | `CLOSED`
- `isConnected` 是计算属性，表示是否已连接
- `data` 包含最后接收到的消息
- `send()` 返回 boolean，表示是否发送成功

### 自动重连配置

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, status } = useWebSocket('wss://example.com/ws', {
  maxRetries: 8,     // 最大重试 8 次
  baseDelay: 3,      // 基础延迟 3 秒
  onConnected: () => uni.showToast({ title: '连接成功', icon: 'success' }),
  onError: (error) => console.error('连接错误:', error),
})
</script>
```

**重连策略:**
- 指数退避算法：延迟 = 基础延迟 × 2^重试次数
- 第1次: 3秒，第2次: 6秒，第3次: 12秒...
- 手动关闭连接不会触发自动重连

### 心跳检测

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, isConnected } = useWebSocket('wss://example.com/ws', {
  heartbeatInterval: 30000, // 30 秒发送一次心跳
  heartbeatMessage: JSON.stringify({
    type: 'ping',
    timestamp: Date.now(),
  }),
  onMessage: (message) => {
    const data = typeof message === 'string' ? JSON.parse(message) : message
    if (data.type === 'pong') {
      console.log('💓 收到心跳响应')
    }
  },
})

onMounted(() => connect())
</script>
```

**心跳机制:**
- 默认每 30 秒发送一次心跳消息
- 服务端应响应 `{"type":"pong"}` 确认连接活跃
- 心跳在连接建立后自动启动，断开时自动停止

### 全局 WebSocket 管理

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { webSocket } from '@/composables/useWebSocket'

const status = computed(() => webSocket.status)
const isConnected = computed(() => webSocket.isConnected)

// 初始化
const handleInit = () => {
  webSocket.initialize('wss://example.com/ws', {
    onConnected: () => uni.showToast({ title: '连接成功', icon: 'success' }),
    onMessage: (data) => console.log('收到消息:', data),
  })
}

// 连接
const handleConnect = () => webSocket.connect()

// 断开
const handleDisconnect = () => webSocket.disconnect()

// 发送消息
const handleSend = () => {
  webSocket.send({
    type: 'test',
    content: 'Hello from global WebSocket',
  })
}

// 销毁
const handleDestroy = () => webSocket.destroy()
</script>
```

**全局管理器说明:**
- `webSocket` 是全局单例实例，整个应用共享
- 必须先调用 `initialize()` 初始化
- 自动检查系统配置和用户登录状态
- 支持销毁并重新初始化

## 消息处理管道

### 管道架构

消息处理管道采用责任链模式：

```
接收消息 → 解析消息 → 标准化
                ↓
         消息处理管道
                ↓
    ┌───────────┴───────────┐
    ↓           ↓           ↓
心跳处理器  系统通知处理器  自定义处理器
    ↓           ↓           ↓
  (停止)    (停止/继续)   (停止/继续)
```

**处理流程:**
1. 接收原始消息（字符串/对象）
2. 解析并标准化为 `WSMessage` 格式
3. 依次通过各个处理器
4. 处理器返回 `true` 继续传播，`false` 停止传播

### 内置处理器

**HeartbeatHandler** - 处理心跳消息：

```typescript
export class HeartbeatHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.HEARTBEAT) {
      console.log('💓 心跳消息:', message.data)
      return false // 阻止继续传播
    }
    return true
  }
}
```

**SystemNoticeHandler** - 处理系统通知：

```typescript
export class SystemNoticeHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.SYSTEM_NOTICE) {
      const data = message.data as NotificationData
      toast.show(data.content || data.title || '系统通知')
      return false
    }
    return true
  }
}
```

### 自定义处理器

```typescript
import { webSocket, type WSMessage, type MessageHandler } from '@/composables/useWebSocket'

// 自定义订单消息处理器
class OrderMessageHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'order_update') {
      const orderStore = useOrderStore()
      orderStore.updateOrder(message.data)
      uni.showToast({ title: `订单已更新`, icon: 'success' })
      return false // 阻止继续传播
    }
    return true // 继续传播
  }
}

// 初始化并添加处理器
onMounted(() => {
  webSocket.initialize()
  webSocket.addMessageHandler(new OrderMessageHandler())
  webSocket.connect()
})
```

**处理器开发规范:**
1. 实现 `MessageHandler` 接口
2. 在 `handle()` 方法中判断消息类型
3. 处理完成返回 `false` 停止传播
4. 不处理返回 `true` 继续传播
5. 使用 `try-catch` 捕获异常

### 管道管理

```typescript
// 获取当前处理器列表
const handlers = webSocket.getMessageHandlers()
// ['HeartbeatHandler', 'SystemNoticeHandler', 'OrderMessageHandler']

// 移除处理器
webSocket.removeMessageHandler(OrderMessageHandler)
```

## API 文档

### useWebSocket()

**函数签名:**

```typescript
export const useWebSocket = (
  url: string,
  options?: UseWebSocketOptions,
) => UseWebSocketReturn
```

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | `string` | 是 | WebSocket 服务器地址 |
| options | `UseWebSocketOptions` | 否 | 配置选项 |

**options 配置项:**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxRetries | `number` | `8` | 最大重试次数 |
| baseDelay | `number` | `3` | 基础延迟秒数 |
| heartbeatInterval | `number` | `30000` | 心跳间隔（毫秒），0 禁用 |
| heartbeatMessage | `string` | `{"type":"ping",...}` | 心跳消息内容 |
| onMessage | `(data: any) => void` | - | 收到消息回调 |
| onConnected | `() => void` | - | 连接成功回调 |
| onDisconnected | `(code, reason) => void` | - | 连接断开回调 |
| onError | `(error: any) => void` | - | 连接错误回调 |

**返回值:**

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| connect | `() => void` | 建立连接 |
| disconnect | `() => void` | 断开连接（不触发自动重连） |
| reconnect | `() => void` | 重新连接（重置重试计数） |
| send | `(message: string \| object) => boolean` | 发送消息 |
| status | `Ref<'CONNECTING' \| 'OPEN' \| 'CLOSING' \| 'CLOSED'>` | 连接状态 |
| isConnected | `ComputedRef<boolean>` | 是否已连接 |
| data | `Ref<any>` | 最后接收到的消息 |

### GlobalWebSocketManager

全局 WebSocket 管理器单例。

**方法:**

| 方法 | 说明 |
|------|------|
| `initialize(url?, options?)` | 初始化，自动检查登录状态 |
| `connect()` | 连接，返回是否成功 |
| `disconnect()` | 断开连接 |
| `reconnect()` | 重新连接 |
| `send(message)` | 发送消息，返回是否成功 |
| `addMessageHandler(handler)` | 添加消息处理器 |
| `removeMessageHandler(handlerClass)` | 移除消息处理器 |
| `getMessageHandlers()` | 获取处理器列表 |
| `destroy()` | 销毁实例，可重新初始化 |

**属性:**

| 属性 | 类型 | 说明 |
|------|------|------|
| status | `string` | 连接状态 |
| isConnected | `boolean` | 是否已连接 |
| lastMessage | `any` | 最后接收的消息 |

### MessagePipeline

消息处理管道类。

```typescript
const pipeline = new MessagePipeline()
pipeline.addHandler(new HeartbeatHandler())
pipeline.process(rawMessage)
const handlers = pipeline.getHandlers()
```

## 类型定义

### WSMessageType

```typescript
export enum WSMessageType {
  SYSTEM_NOTICE = 'system_notice',  // 系统通知
  CHAT_MESSAGE = 'chat_message',    // 聊天消息
  HEARTBEAT = 'heartbeat',          // 心跳消息
}
```

### WSMessage

```typescript
export interface WSMessage {
  type: WSMessageType  // 消息类型
  data: any            // 消息数据
  timestamp: number    // 时间戳
  id?: string          // 消息ID（可选）
}
```

### NotificationData

```typescript
export interface NotificationData {
  title?: string                              // 标题
  content: string                             // 内容
  duration?: number                           // 显示时长（毫秒）
  type?: 'success' | 'info' | 'warning' | 'error'
}
```

### ChatMessageData

```typescript
export interface ChatMessageData {
  fromUserId: string                      // 发送者ID
  fromUsername: string                    // 发送者用户名
  content: string                         // 消息内容
  chatRoomId?: string                     // 聊天室ID（群聊）
  messageType?: 'text' | 'image' | 'file' // 消息类型
}
```

### MessageHandler

```typescript
export interface MessageHandler {
  handle: (message: WSMessage) => boolean
  // 返回 true 继续传播，false 停止传播
}
```

### 完整类型导入

```typescript
import {
  useWebSocket,
  webSocket,
  WSMessageType,
  type WSMessage,
  type NotificationData,
  type ChatMessageData,
  type MessageHandler,
  HeartbeatHandler,
  SystemNoticeHandler,
  MessagePipeline,
} from '@/composables/useWebSocket'
```

## 最佳实践

### 1. 统一使用全局 WebSocket 管理器

避免在多个组件中创建独立连接，统一使用全局管理器。

**推荐 ✅:**

```typescript
// App.vue - 只初始化一次
onMounted(() => {
  webSocket.initialize()
  webSocket.connect()
})

// 组件中直接使用
webSocket.send({ type: 'chat', content: '你好' })
```

**不推荐 ❌:**

```typescript
// 每个组件创建独立连接，浪费资源
const { connect } = useWebSocket('wss://example.com/ws')
```

### 2. 使用消息处理器实现业务隔离

将不同类型的消息处理封装到独立的处理器类中。

```typescript
// handlers/OrderHandler.ts
export class OrderHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'order_update') {
      const orderStore = useOrderStore()
      orderStore.updateOrder(message.data)
      return false
    }
    return true
  }
}

// App.vue
webSocket.addMessageHandler(new OrderHandler())
```

### 3. 合理配置重连策略

根据应用场景配置：

**高频应用（聊天、直播）:**
```typescript
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 10,
  baseDelay: 2,
  heartbeatInterval: 15000,
})
```

**普通应用（通知）:**
```typescript
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 8,
  baseDelay: 3,
  heartbeatInterval: 30000,
})
```

### 4. 优雅处理连接状态变化

```vue
<template>
  <view v-if="!isConnected" class="connection-banner">
    <text v-if="isConnecting">正在连接...</text>
    <text v-else>连接已断开</text>
    <wd-button size="small" @click="webSocket.reconnect()">重新连接</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { webSocket } from '@/composables/useWebSocket'

const status = computed(() => webSocket.status)
const isConnected = computed(() => webSocket.isConnected)
const isConnecting = computed(() => status.value === 'CONNECTING')

watch(status, (newStatus) => {
  if (newStatus === 'OPEN') {
    uni.showToast({ title: '连接成功', icon: 'success' })
  } else if (newStatus === 'CLOSED') {
    uni.showToast({ title: '连接断开', icon: 'error' })
  }
})
</script>
```

### 5. 发送消息前检查连接状态

```typescript
const sendMessage = (message: any) => {
  if (!webSocket.isConnected) {
    uni.showToast({ title: '未连接到服务器', icon: 'error' })
    return false
  }
  return webSocket.send(message)
}
```

## 常见问题

### 1. WebSocket 连接失败

**可能原因:**
- URL 格式不正确（http → ws，https → wss）
- 网络问题或防火墙阻止
- 服务器未启动或拒绝连接
- Token 过期或无效

**解决方案:**

```typescript
webSocket.initialize('wss://example.com/ws', {
  onError: (error) => {
    uni.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          uni.showToast({ title: '请检查网络连接', icon: 'error' })
        } else {
          uni.showToast({ title: '服务器连接失败', icon: 'error' })
        }
      },
    })
  },
  onDisconnected: (code, reason) => {
    // 1006: 异常关闭，1008: 策略违规（认证失败）
    console.log('断开连接:', code, reason)
  },
})
```

### 2. 消息发送后没有响应

**可能原因:**
- 连接已断开
- 消息格式错误
- 服务器未处理该类型消息

**解决方案:**

```typescript
const sendSafeMessage = (message: any) => {
  if (!webSocket.isConnected) {
    uni.showToast({ title: '未连接到服务器', icon: 'error' })
    return false
  }
  if (!message.type) {
    console.error('消息缺少 type 字段')
    return false
  }
  return webSocket.send(message)
}
```

### 3. 收到重复消息

**可能原因:**
- 多个 WebSocket 实例
- 消息处理器重复添加
- 服务器重复推送

**解决方案:**

```typescript
// 1. 使用全局管理器
// 2. 防止处理器重复添加
onMounted(() => {
  const handlers = webSocket.getMessageHandlers()
  if (!handlers.includes('ChatHandler')) {
    webSocket.addMessageHandler(new ChatHandler())
  }
})

// 3. 使用消息ID去重
const processedIds = new Set<string>()

class DeduplicateHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.id && processedIds.has(message.id)) {
      return false // 忽略重复消息
    }
    if (message.id) processedIds.add(message.id)
    return true
  }
}
```

### 4. 如何调试 WebSocket 通信

```typescript
const DEBUG = process.env.NODE_ENV === 'development'

class DebugHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (DEBUG) {
      console.group('📨 WebSocket 消息')
      console.log('类型:', message.type)
      console.log('数据:', message.data)
      console.groupEnd()
    }
    return true
  }
}

webSocket.addMessageHandler(new DebugHandler())
```

### 5. 小程序中使用 WebSocket

**注意事项:**
- 域名必须备案并在小程序后台配置
- 必须使用 `wss://` 协议
- 微信小程序最多 5 个并发连接

**配置步骤:**
1. 登录微信公众平台
2. 进入"开发" → "开发设置" → "服务器域名"
3. 在"socket合法域名"中添加 `wss://your-domain.com`

**网络状态监听:**

```typescript
uni.onNetworkStatusChange((res) => {
  if (res.isConnected && !webSocket.isConnected) {
    webSocket.reconnect()
  }
})

onShow(() => {
  if (!webSocket.isConnected) {
    webSocket.reconnect()
  }
})
```

## 总结

`useWebSocket` 提供了完整的 WebSocket 解决方案：

1. **useWebSocket** - 组件级别的 WebSocket 连接管理
2. **webSocket** - 全局单例管理器，推荐使用
3. **消息处理管道** - 责任链模式，支持自定义处理器
4. **自动重连** - 指数退避策略
5. **心跳检测** - 保持连接活跃

建议优先使用全局管理器 `webSocket`，在 App.vue 中初始化一次，其他组件直接使用。
