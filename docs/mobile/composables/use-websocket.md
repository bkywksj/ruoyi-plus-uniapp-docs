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

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          应用层 (Application Layer)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  App.vue    │   页面组件    │   业务组件    │   自定义处理器              │
│  (初始化)    │   (使用状态)   │   (发送消息)   │   (处理消息)               │
└──────┬──────┴───────┬───────┴───────┬───────┴───────────┬───────────────┘
       │              │               │                   │
       ▼              ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    全局管理层 (Global Manager Layer)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                     GlobalWebSocketManager (单例)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  initialize │  │   connect   │  │    send     │  │ MessagePipeline │ │
│  │   (初始化)   │  │   (连接)    │  │   (发送)    │  │   (消息管道)     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      核心层 (Core Layer)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                        useWebSocket Composable                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 状态管理  │  │ 连接管理  │  │ 重连机制  │  │ 心跳检测  │  │ 消息收发  │  │
│  │ (status) │  │(connect) │  │(backoff) │  │(heartbt) │  │  (send)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     平台层 (Platform Layer)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                      UniApp WebSocket API                                │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│  │ connectSocket │  │  SocketTask   │  │   onOpen/onMessage/...    │   │
│  └───────────────┘  └───────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 连接状态机

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
             ┌──────────┐                                 │
    ┌───────→│  CLOSED  │←────────────────────────┐      │
    │        └────┬─────┘                         │      │
    │             │                               │      │
    │        connect()                     disconnect()  │
    │             │                        (手动/错误)    │
    │             ▼                               │      │
    │     ┌──────────────┐                        │      │
    │     │  CONNECTING  │────────────────────────┤      │
    │     └──────┬───────┘                        │      │
    │            │                                │      │
    │       onOpen()                              │      │
    │            │                                │      │
    │            ▼                                │      │
    │       ┌────────┐                            │      │
    │       │  OPEN  │────────────────────────────┤      │
    │       └───┬────┘                            │      │
    │           │                                 │      │
    │      close()/onError()                      │      │
    │           │                                 │      │
    │           ▼                                 │      │
    │     ┌──────────┐                            │      │
    │     │ CLOSING  │────────────────────────────┘      │
    │     └────┬─────┘                                   │
    │          │                                         │
    │      onClose()                                     │
    │          │                                         │
    │          ▼                                         │
    │     ┌──────────┐                                   │
    │     │  CLOSED  │                                   │
    │     └────┬─────┘                                   │
    │          │                                         │
    │   自动重连? (非手动关闭)                             │
    │          │                                         │
    │          ├─── 是 ──→ 指数退避等待 ─────────────────┘
    │          │
    └─── 否 ───┘
```

### 消息处理管道

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         消息处理管道 (MessagePipeline)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    接收原始消息                                                          │
│         │                                                               │
│         ▼                                                               │
│    ┌──────────┐                                                         │
│    │ 消息解析  │ ───→ 字符串? ───→ 检查是否为心跳消息                      │
│    │ (parse)  │         │               │                               │
│    └──────────┘         │               ├── 是 ──→ 返回 HEARTBEAT 类型   │
│         │               │               │                               │
│         │               │               └── 否 ──→ 尝试 JSON.parse      │
│         │               │                             │                 │
│         │               │                             ├── 成功 → 标准化  │
│         │               │                             │                 │
│         │               │                             └── 失败 → 文本消息 │
│         │               │                                               │
│         │               └── 对象? ──→ 直接标准化                          │
│         │                                                               │
│         ▼                                                               │
│    ┌──────────────┐                                                     │
│    │ 消息标准化    │ ───→ { type, data, timestamp, id }                  │
│    │ (normalize)  │                                                     │
│    └──────────────┘                                                     │
│         │                                                               │
│         ▼                                                               │
│    ┌─────────────────────────────────────────────────────┐              │
│    │              处理器链 (Handler Chain)                 │              │
│    │                                                     │              │
│    │  ┌─────────────────┐    返回 false                  │              │
│    │  │ HeartbeatHandler│ ─────────────────→ 停止传播    │              │
│    │  └────────┬────────┘                                │              │
│    │           │ 返回 true                               │              │
│    │           ▼                                         │              │
│    │  ┌─────────────────┐    返回 false                  │              │
│    │  │  DevLogHandler  │ ─────────────────→ 停止传播    │              │
│    │  └────────┬────────┘                                │              │
│    │           │ 返回 true                               │              │
│    │           ▼                                         │              │
│    │  ┌─────────────────┐    返回 false                  │              │
│    │  │SystemNoticeHandler│ ───────────────→ 停止传播    │              │
│    │  └────────┬────────┘                                │              │
│    │           │ 返回 true                               │              │
│    │           ▼                                         │              │
│    │  ┌─────────────────┐                                │              │
│    │  │ CustomHandler   │ ───→ 自定义业务处理            │              │
│    │  └─────────────────┘                                │              │
│    └─────────────────────────────────────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 核心模块结构

| 模块 | 说明 | 关键函数 |
|------|------|----------|
| **状态管理** | 管理连接状态和消息数据 | `status`, `isConnected`, `data` |
| **连接管理** | WebSocket 连接的建立和关闭 | `connect()`, `disconnect()` |
| **重连机制** | 指数退避自动重连 | `attemptReconnect()`, `calculateRetryDelay()` |
| **心跳检测** | 保持连接活跃 | `startHeartbeat()`, `stopHeartbeat()` |
| **消息收发** | 消息的发送和接收处理 | `send()`, `onMessage()` |
| **认证管理** | Token 附加和 URL 构建 | `buildWebSocketUrl()` |
| **消息管道** | 责任链模式消息处理 | `MessagePipeline`, `MessageHandler` |

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

**DevLogHandler** - 过滤开发日志消息：

```typescript
export class DevLogHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.DEV_LOG) {
      // 静默过滤，不做任何操作
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
// ['HeartbeatHandler', 'DevLogHandler', 'SystemNoticeHandler', 'OrderMessageHandler']

// 移除处理器
webSocket.removeMessageHandler(OrderMessageHandler)
```

## 内部实现

### 指数退避算法

```typescript
/**
 * 动态计算退避延迟时间
 * 规律：3 -> 6 -> 12 -> 24 -> 48 -> 96 -> 192 -> 384...
 */
const calculateRetryDelay = (retryIndex: number): number => {
  const delaySeconds = baseDelay * 2 ** retryIndex
  return delaySeconds * 1000
}
```

**退避策略详解:**

| 重试次数 | 延迟时间 | 累计等待时间 |
|----------|----------|--------------|
| 1 | 3秒 | 3秒 |
| 2 | 6秒 | 9秒 |
| 3 | 12秒 | 21秒 |
| 4 | 24秒 | 45秒 |
| 5 | 48秒 | 93秒 |
| 6 | 96秒 | 189秒 |
| 7 | 192秒 | 381秒 |
| 8 | 384秒 | 765秒 |

### URL 构建与认证

```typescript
/**
 * 构造 WebSocket 连接 URL
 * 自动附加 Token 进行身份验证
 */
const buildWebSocketUrl = (): string => {
  const token = getToken()
  if (!token) {
    console.warn('[WebSocket] 未找到有效token，可能影响连接认证')
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}Authorization=${encodeURIComponent(`Bearer ${token}`)}`
}
```

**URL 构建规则:**

| 场景 | 原始 URL | 构建后 URL |
|------|----------|------------|
| 无查询参数 | `wss://api.com/ws` | `wss://api.com/ws?Authorization=Bearer%20xxx` |
| 有查询参数 | `wss://api.com/ws?room=1` | `wss://api.com/ws?room=1&Authorization=Bearer%20xxx` |

### 协议自动转换

全局管理器会根据当前环境自动选择正确的 WebSocket 协议：

```typescript
private getWebSocketUrl(): string {
  const baseUrl = SystemConfig.api.baseUrl

  // H5 环境：根据页面协议决定
  if (PLATFORM.isH5) {
    const currentProtocol = window.location.protocol
    if (currentProtocol === 'https:') {
      wsUrl = baseUrl.replace(/^https?:/, 'wss:')  // HTTPS → WSS
    } else {
      wsUrl = baseUrl.replace(/^https?:/, 'ws:')   // HTTP → WS
    }
    return `${wsUrl}/resource/websocket`
  }

  // 非 H5 环境（小程序等）：根据 baseUrl 协议决定
  const wsUrl = baseUrl.replace(/^https?:/,
    baseUrl.startsWith('https:') ? 'wss:' : 'ws:'
  )
  return `${wsUrl}/resource/websocket`
}
```

### 消息解析与标准化

```typescript
/**
 * 解析原始消息
 */
private parseMessage(rawMessage: any): WSMessage | null {
  // 1. 字符串消息
  if (typeof rawMessage === 'string') {
    // 快速检查心跳消息
    const lowerMessage = rawMessage.toLowerCase()
    if (lowerMessage.includes('ping') || lowerMessage.includes('pong')) {
      return { type: WSMessageType.HEARTBEAT, data: rawMessage, timestamp: Date.now() }
    }

    // 尝试 JSON 解析
    try {
      const parsed = JSON.parse(rawMessage)
      return this.normalizeMessage(parsed)
    } catch {
      // 解析失败，当作文本消息
      return { type: WSMessageType.SYSTEM_NOTICE, data: { content: rawMessage }, timestamp: Date.now() }
    }
  }

  // 2. 对象消息
  if (typeof rawMessage === 'object' && rawMessage !== null) {
    return this.normalizeMessage(rawMessage)
  }

  // 3. 其他类型
  return { type: WSMessageType.SYSTEM_NOTICE, data: { content: String(rawMessage) }, timestamp: Date.now() }
}

/**
 * 标准化消息格式
 */
private normalizeMessage(obj: any): WSMessage {
  // 确定消息类型
  let messageType: WSMessageType = WSMessageType.SYSTEM_NOTICE
  if (obj.type && Object.values(WSMessageType).includes(obj.type)) {
    messageType = obj.type
  } else if (obj.messageType && Object.values(WSMessageType).includes(obj.messageType)) {
    messageType = obj.messageType
  }

  // 提取消息数据
  let messageData = obj.data || obj.message || obj.content || obj

  // 如果数据是字符串且看起来像 JSON，尝试解析
  if (typeof messageData === 'string') {
    try {
      messageData = JSON.parse(messageData)
    } catch {
      messageData = { content: messageData }
    }
  }

  return {
    type: messageType,
    data: messageData,
    timestamp: obj.timestamp || Date.now(),
    id: obj.id || obj.messageId,
  }
}
```

### 功能启用检查

```typescript
// 检查系统配置
const featureStore = useFeatureStore()
if (!featureStore.features.websocketEnabled) {
  console.warn('[WebSocket] 系统未启用WebSocket功能')
  return {
    connect: () => {},
    disconnect: () => {},
    reconnect: () => {},
    send: () => false,
    status: ref('CLOSED'),
    isConnected: ref(false),
    data: ref(null),
  }
}
```

全局管理器的初始化检查更加完善：

```typescript
private shouldInitializeWebSocket(): { should: boolean; reason: string } {
  // 检查系统配置
  const featureStore = useFeatureStore()
  if (!featureStore.features.websocketEnabled) {
    return { should: false, reason: '系统未启用WebSocket功能' }
  }

  // 检查用户登录状态
  const { getToken } = useToken()
  const token = getToken()
  if (!token) {
    return { should: false, reason: '用户未登录' }
  }

  return { should: true, reason: '满足初始化条件' }
}
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
  SYSTEM_NOTICE = 'system_notice',  // 系统通知（通知和公告）
  CHAT_MESSAGE = 'chat_message',    // 聊天消息
  DEV_LOG = 'devLog',               // 开发日志（仅开发环境）
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
  DevLogHandler,
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

### 6. 处理器错误隔离

消息管道内置了错误隔离机制，单个处理器的错误不会影响其他处理器：

```typescript
// 管道内部实现
for (const handler of this.handlers) {
  try {
    const shouldContinue = handler.handle(message)
    if (!shouldContinue) break
  } catch (handlerError) {
    console.error(`❌ 处理器 ${handler.constructor.name} 处理消息时出错:`, handlerError)
    // 继续执行下一个处理器
  }
}
```

### 7. 网络状态监听与自动重连

```typescript
// 监听网络状态变化
uni.onNetworkStatusChange((res) => {
  if (res.isConnected && !webSocket.isConnected) {
    console.log('网络恢复，尝试重连 WebSocket')
    webSocket.reconnect()
  }
})

// 页面显示时检查连接
onShow(() => {
  if (!webSocket.isConnected) {
    webSocket.reconnect()
  }
})
```

### 8. 消息去重处理

```typescript
class DeduplicateHandler implements MessageHandler {
  private processedIds = new Set<string>()
  private maxCacheSize = 1000

  handle(message: WSMessage): boolean {
    if (message.id) {
      if (this.processedIds.has(message.id)) {
        console.log('跳过重复消息:', message.id)
        return false
      }

      this.processedIds.add(message.id)

      // 限制缓存大小
      if (this.processedIds.size > this.maxCacheSize) {
        const firstId = this.processedIds.values().next().value
        this.processedIds.delete(firstId)
      }
    }
    return true
  }
}

// 添加到管道最前面
webSocket.addMessageHandler(new DeduplicateHandler())
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
      console.log('时间:', new Date(message.timestamp).toLocaleString())
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

### 6. 系统未启用 WebSocket 功能

**问题现象:**
控制台输出 `[WebSocket] 系统未启用WebSocket功能`

**解决方案:**
1. 检查 FeatureStore 中的 `websocketEnabled` 配置
2. 确认后端已启用 WebSocket 功能
3. 检查系统配置接口返回值

```typescript
// 检查功能状态
const featureStore = useFeatureStore()
console.log('WebSocket 启用状态:', featureStore.features.websocketEnabled)
```

### 7. Token 过期导致认证失败

**问题现象:**
连接成功后立即断开，错误码 1008

**解决方案:**

```typescript
webSocket.initialize('wss://example.com/ws', {
  onDisconnected: (code, reason) => {
    if (code === 1008) {
      // 认证失败，可能是 Token 过期
      console.log('认证失败，尝试刷新 Token')
      refreshToken().then(() => {
        webSocket.reconnect()
      })
    }
  },
})
```

### 8. 心跳消息过于频繁

**问题现象:**
控制台大量心跳日志

**解决方案:**

心跳消息默认不会打印发送日志：

```typescript
// 源码实现
if (!data.startsWith(`{"type":"ping"`)) {
  console.log(`📤 WebSocket发送消息成功:`, data)
}
```

如需完全禁用心跳日志，可自定义心跳处理器：

```typescript
class SilentHeartbeatHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.HEARTBEAT) {
      return false // 静默处理，不打印
    }
    return true
  }
}
```

## 总结

`useWebSocket` 提供了完整的 WebSocket 解决方案：

1. **useWebSocket** - 组件级别的 WebSocket 连接管理
2. **webSocket** - 全局单例管理器，推荐使用
3. **消息处理管道** - 责任链模式，支持自定义处理器
4. **自动重连** - 指数退避策略（3s → 6s → 12s → 24s...）
5. **心跳检测** - 保持连接活跃（默认 30 秒）
6. **认证支持** - 自动附加 Bearer Token
7. **功能检查** - 自动检查系统配置和登录状态

建议优先使用全局管理器 `webSocket`，在 App.vue 中初始化一次，其他组件直接使用。
