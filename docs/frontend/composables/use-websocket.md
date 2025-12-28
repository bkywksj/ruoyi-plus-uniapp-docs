# useWebSocket

WebSocket 通信钩子函数，提供完整的 WebSocket 连接管理和消息处理功能，支持动态退避重连策略。

## 📋 功能特性

- **自动连接**: 创建与服务器的 WebSocket 连接 (基于 VueUse 实现)
- **动态退避重连**: 连接断开后按指数退避策略自动重连
- **心跳检测**: 定时发送心跳消息保持连接活跃
- **消息接收**: 监听并处理服务器推送的消息
- **消息发送**: 提供发送消息的方法
- **连接管理**: 提供手动连接、断开和重连的方法
- **状态监控**: 实时监控连接状态变化
- **资源清理**: 组件卸载时自动清理连接
- **认证支持**: 自动附加令牌进行身份验证

## 🎯 基础用法

### 简单连接

```vue
<template>
  <div>
    <div>连接状态: {{ status }}</div>
    <div>是否已连接: {{ isConnected }}</div>
    <button @click="connect">连接</button>
    <button @click="disconnect">断开</button>
    <button @click="sendMessage">发送消息</button>
  </div>
</template>

<script setup>
import { useWS } from '@/composables/useWS'

const { connect, disconnect, send, status, isConnected } = useWS('ws://localhost:8080/websocket')

const sendMessage = () => {
  const success = send({ type: 'chat', message: 'Hello WebSocket!' })
  if (!success) {
    console.log('发送失败，连接未建立')
  }
}
</script>
```

### 完整配置

```vue
<script setup>
import { useWS } from '@/composables/useWS'

const { connect, disconnect, reconnect, send, status, isConnected } = useWS('ws://localhost:8080/websocket', {
  // 最大重试次数
  maxRetries: 8,
  // 基础延迟秒数
  baseDelay: 3,
  // 心跳间隔毫秒数
  heartbeatInterval: 30000,
  // 自定义心跳消息
  heartbeatMessage: JSON.stringify({ type: 'ping' }),
  
  // 消息接收回调
  onMessage: (data) => {
    console.log('收到消息:', data)
    // 处理接收到的消息
  },
  
  // 连接成功回调
  onConnected: () => {
    console.log('WebSocket 连接成功')
  },
  
  // 连接断开回调
  onDisconnected: (code, reason) => {
    console.log('WebSocket 连接断开:', { code, reason })
  },
  
  // 连接错误回调
  onError: (error) => {
    console.error('WebSocket 连接错误:', error)
  }
})
</script>
```

## 🎛️ API 参考

### 参数

#### url
- **类型**: `string`
- **必填**: 是
- **描述**: WebSocket 服务器地址

#### options
- **类型**: `object`
- **必填**: 否
- **描述**: 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `maxRetries` | `number` | `8` | 最大重试次数 |
| `baseDelay` | `number` | `3` | 基础延迟秒数 |
| `heartbeatInterval` | `number` | `30000` | 心跳间隔毫秒数 |
| `heartbeatMessage` | `string` | `'{"type":"ping"}'` | 心跳消息内容 |
| `onMessage` | `Function` | - | 消息接收回调 |
| `onConnected` | `Function` | - | 连接成功回调 |
| `onDisconnected` | `Function` | - | 连接断开回调 |
| `onError` | `Function` | - | 连接错误回调 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `connect` | `Function` | 建立 WebSocket 连接 |
| `disconnect` | `Function` | 断开 WebSocket 连接 |
| `reconnect` | `Function` | 手动重新连接 |
| `send` | `Function` | 发送消息，返回是否发送成功 |
| `status` | `Ref<string>` | 连接状态 ('CONNECTING', 'OPEN', 'CLOSED') |
| `isConnected` | `Ref<boolean>` | 是否已连接 |
| `data` | `Ref<any>` | 接收到的消息数据 |

## 🔄 重连机制

### 动态退避策略

使用指数退避算法，重连延迟时间按以下规律增长：

```
第1次重连: 3秒 (baseDelay * 2^0)
第2次重连: 6秒 (baseDelay * 2^1)
第3次重连: 12秒 (baseDelay * 2^2)
第4次重连: 24秒 (baseDelay * 2^3)
第5次重连: 48秒 (baseDelay * 2^4)
...
第8次重连: 384秒 (baseDelay * 2^7)
```

### 重连触发条件

- 连接异常断开 (非正常关闭状态码)
- 连接错误
- 非手动关闭的连接中断

### 重连停止条件

- 达到最大重试次数
- 手动调用 `disconnect()`
- 连接成功

## 💓 心跳机制

### 自动心跳

- 默认每30秒发送一次心跳消息
- 心跳消息格式: `{"type":"ping","timestamp":1234567890}`
- 支持自定义心跳间隔和消息内容

### 心跳配置

```javascript
const { connect } = useWS('ws://localhost:8080/websocket', {
  heartbeatInterval: 15000, // 15秒发送一次心跳
  heartbeatMessage: JSON.stringify({
    type: 'heartbeat',
    clientId: 'client-001'
  })
})
```

## 📝 消息处理

### 发送消息

```javascript
// 发送字符串消息
const success1 = send('Hello WebSocket!')

// 发送对象消息 (自动序列化为 JSON)
const success2 = send({
  type: 'chat',
  message: 'Hello World',
  timestamp: Date.now()
})

// 检查发送结果
if (!success1) {
  console.log('发送失败，可能连接未建立')
}
```

### 接收消息

```javascript
const { connect } = useWS('ws://localhost:8080/websocket', {
  onMessage: (data) => {
    try {
      // 尝试解析 JSON 消息
      const message = JSON.parse(data)
      
      switch (message.type) {
        case 'chat':
          handleChatMessage(message)
          break
        case 'notification':
          handleNotification(message)
          break
        default:
          console.log('未知消息类型:', message)
      }
    } catch (error) {
      // 处理非 JSON 消息
      console.log('收到文本消息:', data)
    }
  }
})
```

## 🔐 认证处理

### 自动令牌附加

WebSocket 连接会自动附加当前用户的认证令牌：

```javascript
// 自动构建的连接URL
// 原始: ws://localhost:8080/websocket
// 实际: ws://localhost:8080/websocket?Authorization=Bearer%20your-token
```

### 认证失败处理

```javascript
const { connect } = useWS('ws://localhost:8080/websocket', {
  onError: (error) => {
    // 处理认证错误
    if (error.code === 401) {
      console.log('认证失败，请重新登录')
      // 跳转到登录页面
    }
  }
})
```

## 🎪 全局WebSocket管理

### 全局实例

```javascript
import { webSocket } from '@/composables/useWS'

// 初始化全局WebSocket连接
webSocket.initialize()

// 连接WebSocket
webSocket.connect()

// 发送消息
webSocket.send({ type: 'global', message: 'Hello' })

// 断开连接
webSocket.disconnect()
```

### 消息处理管道

```javascript
import { webSocket, MessageHandler, WSMessageType } from '@/composables/useWS'

// 自定义消息处理器
class CustomMessageHandler implements MessageHandler {
  handle(message) {
    if (message.type === WSMessageType.CHAT_MESSAGE) {
      console.log('处理聊天消息:', message.data)
      return false // 阻止继续传播
    }
    return true // 继续传播到下一个处理器
  }
}

// 添加自定义处理器
webSocket.addMessageHandler(new CustomMessageHandler())
```

## 🔧 消息处理管道

### 消息类型枚举

系统预定义了以下消息类型：

```typescript
export enum WSMessageType {
  // 系统级消息
  SYSTEM_NOTICE = 'system_notice',      // 系统通知

  // AI 聊天消息
  AI_CHAT_START = 'ai_chat_start',      // 开始生成
  AI_CHAT_STREAM = 'ai_chat_stream',    // 流式响应
  AI_CHAT_COMPLETE = 'ai_chat_complete',// 生成完成
  AI_CHAT_ERROR = 'ai_chat_error',      // 生成错误

  // 业务消息
  CHAT_MESSAGE = 'chat_message',        // 聊天消息

  // 技术消息
  HEARTBEAT = 'heartbeat',              // 心跳
  DEV_LOG = 'devLog'                    // 开发日志
}
```

### 标准消息结构

```typescript
export interface WSMessage {
  type: WSMessageType  // 消息类型
  data: any           // 消息数据
  timestamp: number   // 时间戳
  id?: string        // 消息ID（可选）
}
```

### 自定义消息处理器

#### 实现 MessageHandler 接口

```typescript
import { MessageHandler, WSMessage, WSMessageType } from '@/composables/useWS'

// 自定义聊天消息处理器
export class ChatMessageHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.CHAT_MESSAGE) {
      const chatData = message.data

      // 更新聊天数据
      console.log('收到聊天消息:', chatData)

      // 显示通知
      ElNotification({
        title: `来自 ${chatData.fromUsername}`,
        message: chatData.content,
        type: 'info'
      })

      // 阻止继续传播
      return false
    }

    // 不是聊天消息，继续传播
    return true
  }
}
```

#### 异步消息处理器

```typescript
export class AsyncMessageHandler implements MessageHandler {
  async handle(message: WSMessage): Promise<boolean> {
    if (message.type === WSMessageType.AI_CHAT_STREAM) {
      // 异步处理AI流式消息
      await this.processAiStream(message.data)
      return false
    }
    return true
  }

  private async processAiStream(data: any) {
    // 异步处理逻辑
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('AI流式消息处理完成:', data)
  }
}
```

### 消息处理管道

```typescript
import { MessagePipeline } from '@/composables/useWS'

// 创建消息处理管道
const pipeline = new MessagePipeline()

// 添加处理器（按优先级顺序）
pipeline.addHandler(new HeartbeatHandler())      // 1. 心跳处理
pipeline.addHandler(new AiChatStreamHandler())   // 2. AI消息处理
pipeline.addHandler(new SystemNoticeHandler())   // 3. 系统通知
pipeline.addHandler(new ChatMessageHandler())    // 4. 聊天消息

// 处理接收到的消息
await pipeline.process(rawMessage)

// 获取当前处理器列表
const handlers = pipeline.getHandlers()
console.log('当前处理器:', handlers)

// 移除特定处理器
pipeline.removeHandler(ChatMessageHandler)
```

### 内置消息处理器

#### 1. SystemNoticeHandler

处理系统通知消息，自动显示通知弹窗并存储到通知中心。

```typescript
// 自动处理系统通知
// 消息格式:
{
  type: 'system_notice',
  data: {
    title: '系统通知',
    content: '您有新的消息',
    duration: 4000,
    type: 'success'
  }
}
```

#### 2. AiChatStreamHandler

处理AI聊天相关消息，支持流式响应。

```typescript
// AI聊天开始
{
  type: 'ai_chat_start',
  data: {
    sessionId: 'session-001',
    messageId: 'msg-001'
  }
}

// AI流式内容
{
  type: 'ai_chat_stream',
  data: {
    sessionId: 'session-001',
    messageId: 'msg-001',
    content: '这是AI回复的内容...',
    finished: false
  }
}

// AI生成完成
{
  type: 'ai_chat_complete',
  data: {
    sessionId: 'session-001',
    messageId: 'msg-001',
    finished: true,
    tokenUsage: {
      promptTokens: 10,
      completionTokens: 50,
      totalTokens: 60
    }
  }
}
```

#### 3. HeartbeatHandler

处理心跳消息，静默处理不显示给用户。

```typescript
// 心跳消息会被自动过滤
{
  type: 'heartbeat',
  data: 'pong'
}
```

## 🌐 全局 WebSocket 管理器

### GlobalWebSocketManager

提供应用级别的 WebSocket 连接管理，确保单例模式，避免重复连接。

#### 初始化

```typescript
import { webSocket } from '@/composables/useWS'

// 基本初始化（使用默认URL）
webSocket.initialize()

// 自定义URL初始化
webSocket.initialize('wss://custom-server.com/ws')

// 带配置选项初始化
webSocket.initialize(undefined, {
  maxRetries: 10,
  baseDelay: 5,
  heartbeatInterval: 20000
})
```

#### 连接管理

```typescript
// 建立连接
webSocket.connect()

// 断开连接
webSocket.disconnect()

// 重新连接
webSocket.reconnect()

// 检查连接状态
console.log('连接状态:', webSocket.status)        // 'OPEN' | 'CONNECTING' | 'CLOSED'
console.log('是否已连接:', webSocket.isConnected) // true | false
```

#### 发送消息

```typescript
// 发送文本消息
const success1 = webSocket.send('Hello')

// 发送对象消息（自动JSON序列化）
const success2 = webSocket.send({
  type: 'chat',
  message: 'Hello World'
})

// 检查发送结果
if (!success1) {
  console.log('发送失败，连接未建立')
}
```

#### 自定义消息处理器

```typescript
import { webSocket, MessageHandler, WSMessage } from '@/composables/useWS'

// 定义自定义处理器
class OrderNotificationHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'order_notification') {
      // 处理订单通知
      ElNotification({
        title: '订单通知',
        message: message.data.content,
        type: 'warning'
      })
      return false // 阻止继续传播
    }
    return true
  }
}

// 添加到全局管理器
webSocket.addMessageHandler(new OrderNotificationHandler())

// 移除处理器
webSocket.removeMessageHandler(OrderNotificationHandler)

// 查看当前处理器列表
const handlers = webSocket.getMessageHandlers()
console.log('当前处理器:', handlers)
```

#### 销毁和重置

```typescript
// 完全销毁全局实例
webSocket.destroy()

// 销毁后可重新初始化
webSocket.initialize()
```

### 全局管理器高级特性

#### 1. 自动认证

```typescript
// 自动根据当前协议构建正确的WebSocket地址
// HTTP  -> ws://
// HTTPS -> wss://

// 自动附加认证令牌
// 原始: wss://api.example.com/ws
// 实际: wss://api.example.com/ws?Authorization=Bearer%20your-token
```

#### 2. 状态检查

```typescript
// 检查系统配置
const featureStore = useFeatureStore()
if (!featureStore.features.websocketEnabled) {
  console.log('系统未启用WebSocket功能')
}

// 检查用户登录状态
if (!getAuthQuery()) {
  console.log('用户未登录，跳过初始化')
}
```

#### 3. 防重复初始化

```typescript
// 第一次调用：初始化
webSocket.initialize()

// 第二次调用：返回现有实例
webSocket.initialize() // 直接返回，不会重复初始化

// 正在初始化时：跳过
// 确保多次调用不会造成问题
```

### 在应用中使用全局管理器

#### App.vue 中初始化

```vue
<script setup>
import { webSocket } from '@/composables/useWS'

onMounted(() => {
  // 应用启动时初始化全局WebSocket
  webSocket.initialize()
})

onUnmounted(() => {
  // 应用卸载时清理
  webSocket.destroy()
})
</script>
```

#### 在任意组件中使用

```vue
<template>
  <div>
    <div>全局连接状态: {{ webSocket.status }}</div>
    <el-button @click="sendGlobalMessage">发送消息</el-button>
  </div>
</template>

<script setup>
import { webSocket } from '@/composables/useWS'

const sendGlobalMessage = () => {
  webSocket.send({
    type: 'chat',
    message: '来自组件的消息'
  })
}
</script>
```

## ⚠️ 注意事项

### 系统配置检查

WebSocket 功能需要在系统配置中启用：

```javascript
// systemConfig.js
export const SystemConfig = {
  features: {
    websocket: true // 确保启用 WebSocket 功能
  }
}
```

### 组件卸载清理

组合函数会自动在组件卸载时清理 WebSocket 连接，无需手动处理。

### 连接状态检查

发送消息前建议检查连接状态：

```javascript
const sendSafeMessage = (message) => {
  if (isConnected.value) {
    send(message)
  } else {
    console.warn('WebSocket 未连接，无法发送消息')
    // 可以选择缓存消息，等连接建立后再发送
  }
}
```

### 错误恢复

```javascript
const { reconnect, status } = useWS('ws://localhost:8080/websocket', {
  onError: (error) => {
    console.error('WebSocket 错误:', error)

    // 5秒后尝试手动重连
    setTimeout(() => {
      if (status.value === 'CLOSED') {
        reconnect()
      }
    }, 5000)
  }
})
```

### 消息处理器顺序

消息处理器按添加顺序依次执行，建议按以下优先级添加：

1. **技术消息处理器**（如心跳）- 最高优先级
2. **业务消息处理器**（如AI、聊天）
3. **系统消息处理器**（如通知）
4. **通用处理器**（兜底处理）

### 处理器错误隔离

单个处理器出错不会影响其他处理器：

```typescript
// 即使某个处理器抛出异常，消息管道会捕获并继续执行下一个处理器
try {
  const shouldContinue = await handler.handle(message)
  if (!shouldContinue) break
} catch (handlerError) {
  console.error('处理器异常:', handlerError)
  // 继续执行下一个处理器
}
```

## 🎯 最佳实践

### 1. 使用全局管理器

对于应用级别的 WebSocket 连接，推荐使用全局管理器：

```typescript
// ✅ 推荐：使用全局管理器
import { webSocket } from '@/composables/useWS'
webSocket.initialize()

// ❌ 不推荐：在多个组件中创建独立连接
const ws1 = useWS('ws://localhost:8080/ws') // 组件1
const ws2 = useWS('ws://localhost:8080/ws') // 组件2（重复连接）
```

### 2. 自定义消息处理

对于特定业务逻辑，创建专门的消息处理器：

```typescript
// ✅ 推荐：创建专门的处理器
class OrderHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'order') {
      this.processOrder(message.data)
      return false
    }
    return true
  }
}

// ❌ 不推荐：在onMessage回调中处理所有逻辑
onMessage: (data) => {
  // 大量的if-else判断
  if (data.type === 'order') { ... }
  else if (data.type === 'chat') { ... }
  // ...
}
```

### 3. 合理配置重连参数

根据业务场景调整重连策略：

```typescript
// 实时性要求高的场景（如聊天）
useWS(url, {
  maxRetries: 10,
  baseDelay: 2  // 快速重连
})

// 普通场景
useWS(url, {
  maxRetries: 8,
  baseDelay: 3  // 平衡的策略
})

// 后台服务
useWS(url, {
  maxRetries: 5,
  baseDelay: 10 // 减少服务器压力
})
```

### 4. 页面可见性优化

```vue
<script setup>
import { useDocumentVisibility } from '@vueuse/core'
import { webSocket } from '@/composables/useWS'

const visibility = useDocumentVisibility()

watch(visibility, (current) => {
  if (current === 'visible') {
    // 页面可见时确保连接
    webSocket.connect()
  } else if (current === 'hidden') {
    // 页面隐藏时可选择断开连接节省资源
    // webSocket.disconnect()
  }
})
</script>
```

useWebSocket 为应用提供了强大而灵活的 WebSocket 通信能力，通过消息处理管道和全局管理器，轻松实现复杂的实时通信需求。

## ❓ 常见问题

### 1. WebSocket 连接频繁断开重连

**问题描述:**

WebSocket 连接建立后很快就断开，然后自动重连，周而复始，无法保持稳定连接。

**问题原因:**

- 心跳消息格式与后端期望不一致
- 后端超时设置过短
- 网络环境不稳定
- 认证令牌过期

**解决方案:**

```typescript
import { useWS } from '@/composables/useWS'

// ❌ 错误：心跳消息格式与后端不匹配
const { connect } = useWS('ws://localhost:8080/ws', {
  heartbeatMessage: JSON.stringify({ type: 'ping' })  // 后端可能不识别
})

// ✅ 正确：使用与后端约定的心跳格式
const { connect, status } = useWS('ws://localhost:8080/ws', {
  // 确认后端期望的心跳格式
  heartbeatMessage: JSON.stringify({
    type: 'heartbeat',
    timestamp: Date.now()
  }),
  // 心跳间隔要小于后端的超时时间
  heartbeatInterval: 25000,  // 后端超时30秒，这里设置25秒

  onConnected: () => {
    console.log('连接成功，开始心跳检测')
  },

  onDisconnected: (code, reason) => {
    console.log('连接断开:', { code, reason })

    // 根据断开原因判断是否需要重新登录
    if (code === 1008) {
      console.log('认证失败，请重新登录')
      // 跳转到登录页面
    }
  }
})

// ✅ 监控连接状态变化
watch(status, (newStatus) => {
  console.log('连接状态变化:', newStatus)
  if (newStatus === 'CLOSED') {
    // 可以在这里添加自定义的重连逻辑或通知用户
  }
})
```

### 2. 消息发送后没有收到响应

**问题描述:**

调用 `send()` 方法发送消息后，没有收到服务器的响应，或者响应丢失。

**问题原因:**

- 发送时连接尚未建立完成
- 消息格式错误
- 服务器处理异常但未返回错误
- `onMessage` 回调中消息解析失败

**解决方案:**

```typescript
const { send, isConnected, status } = useWS('ws://localhost:8080/ws', {
  onMessage: (data) => {
    console.log('原始消息:', data)  // 先打印原始消息便于调试

    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data
      console.log('解析后消息:', message)

      // 处理响应
      handleResponse(message)
    } catch (error) {
      console.error('消息解析失败:', error, '原始数据:', data)
    }
  }
})

// ✅ 发送消息前检查连接状态
const sendMessage = async (message: any) => {
  // 确保连接已建立
  if (!isConnected.value) {
    console.warn('连接未建立，等待连接...')

    // 等待连接建立
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('连接超时'))
      }, 10000)

      const unwatch = watch(isConnected, (connected) => {
        if (connected) {
          clearTimeout(timeout)
          unwatch()
          resolve()
        }
      })
    })
  }

  // 添加消息ID用于追踪响应
  const messageWithId = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }

  const success = send(messageWithId)
  if (!success) {
    console.error('消息发送失败')
    return null
  }

  console.log('消息已发送:', messageWithId)
  return messageWithId.id
}

// ✅ 实现请求-响应模式
const pendingRequests = new Map<string, { resolve: Function, reject: Function }>()

const sendRequest = (message: any, timeout = 30000): Promise<any> => {
  return new Promise((resolve, reject) => {
    const id = `req_${Date.now()}`
    const messageWithId = { ...message, requestId: id }

    // 设置超时
    const timer = setTimeout(() => {
      pendingRequests.delete(id)
      reject(new Error('请求超时'))
    }, timeout)

    // 保存回调
    pendingRequests.set(id, {
      resolve: (data: any) => {
        clearTimeout(timer)
        pendingRequests.delete(id)
        resolve(data)
      },
      reject: (error: any) => {
        clearTimeout(timer)
        pendingRequests.delete(id)
        reject(error)
      }
    })

    // 发送消息
    if (!send(messageWithId)) {
      pendingRequests.delete(id)
      clearTimeout(timer)
      reject(new Error('发送失败'))
    }
  })
}

// 在 onMessage 中处理响应
const { connect } = useWS('ws://localhost:8080/ws', {
  onMessage: (data) => {
    const message = JSON.parse(data)

    // 检查是否是请求的响应
    if (message.requestId && pendingRequests.has(message.requestId)) {
      const { resolve } = pendingRequests.get(message.requestId)!
      resolve(message)
    }
  }
})
```

### 3. 页面切换后消息丢失

**问题描述:**

用户在多个页面间切换时，WebSocket 消息丢失或者连接断开。

**问题原因:**

- 组件级 WebSocket 在组件卸载时被销毁
- 未使用全局 WebSocket 管理器
- 页面隐藏时浏览器暂停 WebSocket 活动

**解决方案:**

```typescript
// ❌ 错误：在每个组件中创建独立的 WebSocket 连接
// ComponentA.vue
const ws = useWS('ws://localhost:8080/ws')  // 组件卸载时连接断开

// ComponentB.vue
const ws = useWS('ws://localhost:8080/ws')  // 又创建一个新连接


// ✅ 正确：使用全局 WebSocket 管理器
// main.ts 或 App.vue 中初始化
import { webSocket } from '@/composables/useWS'

// 应用启动时初始化
webSocket.initialize()
webSocket.connect()

// 任意组件中使用
// ComponentA.vue
import { webSocket } from '@/composables/useWS'

const sendFromA = () => {
  webSocket.send({ type: 'from_a', data: 'Hello' })
}

// ComponentB.vue
import { webSocket } from '@/composables/useWS'

const sendFromB = () => {
  webSocket.send({ type: 'from_b', data: 'World' })
}


// ✅ 处理页面可见性变化
import { useDocumentVisibility, useWindowFocus } from '@vueuse/core'
import { webSocket } from '@/composables/useWS'

const visibility = useDocumentVisibility()
const focused = useWindowFocus()

// 页面重新可见时检查连接
watch(visibility, (current) => {
  if (current === 'visible') {
    // 检查并恢复连接
    if (!webSocket.isConnected) {
      console.log('页面可见，恢复连接')
      webSocket.connect()
    }
  }
})

// 消息缓存队列（页面不可见时缓存消息）
const messageQueue = ref<any[]>([])
const maxQueueSize = 100

const queueMessage = (message: any) => {
  if (messageQueue.value.length >= maxQueueSize) {
    messageQueue.value.shift()  // 移除最旧的消息
  }
  messageQueue.value.push({
    ...message,
    queuedAt: Date.now()
  })
}

// 页面可见时处理缓存的消息
watch(visibility, (current) => {
  if (current === 'visible' && messageQueue.value.length > 0) {
    console.log('处理缓存消息:', messageQueue.value.length, '条')
    messageQueue.value.forEach(msg => {
      // 处理缓存的消息
      handleMessage(msg)
    })
    messageQueue.value = []
  }
})
```

### 4. 认证令牌过期导致连接失败

**问题描述:**

WebSocket 连接建立后，由于令牌过期，服务器主动断开连接，且重连后依然失败。

**问题原因:**

- 令牌有效期短于 WebSocket 连接时间
- 令牌刷新后未更新 WebSocket 连接
- 令牌通过 URL 参数传递，刷新后 URL 未更新

**解决方案:**

```typescript
import { webSocket } from '@/composables/useWS'
import { getToken, isTokenExpiring } from '@/utils/auth'
import { refreshToken } from '@/api/auth'

// ✅ 定期检查令牌有效性
const tokenCheckInterval = 60000  // 每分钟检查一次

setInterval(async () => {
  if (webSocket.isConnected && isTokenExpiring()) {
    console.log('令牌即将过期，刷新令牌')

    try {
      // 刷新令牌
      await refreshToken()

      // 重新连接 WebSocket（使用新令牌）
      webSocket.disconnect()
      await nextTick()
      webSocket.connect()

      console.log('令牌刷新完成，WebSocket 已重连')
    } catch (error) {
      console.error('令牌刷新失败:', error)
    }
  }
}, tokenCheckInterval)

// ✅ 在认证失败时处理
const { connect } = useWS('ws://localhost:8080/ws', {
  onDisconnected: async (code, reason) => {
    // 1008 表示策略违规（通常是认证失败）
    // 1011 表示服务器遇到意外情况
    if (code === 1008 || (code === 1011 && reason?.includes('auth'))) {
      console.log('认证失败，尝试刷新令牌')

      try {
        await refreshToken()
        // 令牌刷新成功，自动重连机制会使用新令牌
      } catch (error) {
        console.error('令牌刷新失败，需要重新登录')
        // 跳转到登录页
        router.push('/login')
      }
    }
  }
})

// ✅ 封装带令牌验证的连接方法
const connectWithAuth = async () => {
  // 先确保令牌有效
  if (isTokenExpiring()) {
    try {
      await refreshToken()
    } catch (error) {
      console.error('无法获取有效令牌')
      return false
    }
  }

  // 使用有效令牌连接
  webSocket.connect()
  return true
}
```

### 5. 消息处理器执行顺序问题

**问题描述:**

添加了多个消息处理器，但执行顺序不符合预期，或者某些消息被错误拦截。

**问题原因:**

- 处理器添加顺序与预期不一致
- 处理器返回 `false` 阻止了消息传播
- 处理器中的条件判断过于宽泛

**解决方案:**

```typescript
import { webSocket, MessageHandler, WSMessage, WSMessageType } from '@/composables/useWS'

// ❌ 错误：处理器条件过于宽泛
class BadHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    // 所有消息都会被这个处理器拦截
    console.log('处理消息:', message)
    return false  // 阻止所有消息传播
  }
}

// ✅ 正确：精确匹配消息类型
class GoodHandler implements MessageHandler {
  private targetTypes: WSMessageType[]

  constructor(types: WSMessageType[]) {
    this.targetTypes = types
  }

  handle(message: WSMessage): boolean {
    // 只处理目标类型的消息
    if (this.targetTypes.includes(message.type as WSMessageType)) {
      console.log('处理目标消息:', message)
      return false  // 只阻止目标消息
    }
    return true  // 其他消息继续传播
  }
}


// ✅ 按优先级添加处理器
const initMessageHandlers = () => {
  // 1. 最高优先级：心跳处理器（静默处理）
  webSocket.addMessageHandler(new class implements MessageHandler {
    handle(message: WSMessage): boolean {
      if (message.type === WSMessageType.HEARTBEAT) {
        // 心跳消息静默处理，不传播
        return false
      }
      return true
    }
  }())

  // 2. 高优先级：错误处理器
  webSocket.addMessageHandler(new class implements MessageHandler {
    handle(message: WSMessage): boolean {
      if (message.type === WSMessageType.AI_CHAT_ERROR) {
        ElMessage.error('AI 服务异常: ' + message.data?.message)
        return false
      }
      return true
    }
  }())

  // 3. 中等优先级：业务消息处理器
  webSocket.addMessageHandler(new class implements MessageHandler {
    handle(message: WSMessage): boolean {
      if (message.type === WSMessageType.CHAT_MESSAGE) {
        // 处理聊天消息
        chatStore.addMessage(message.data)
        return false
      }
      return true
    }
  }())

  // 4. 低优先级：系统通知处理器
  webSocket.addMessageHandler(new class implements MessageHandler {
    handle(message: WSMessage): boolean {
      if (message.type === WSMessageType.SYSTEM_NOTICE) {
        ElNotification({
          title: message.data?.title || '系统通知',
          message: message.data?.content,
          type: message.data?.type || 'info'
        })
        return false
      }
      return true
    }
  }())

  // 5. 最低优先级：兜底处理器（记录未处理的消息）
  webSocket.addMessageHandler(new class implements MessageHandler {
    handle(message: WSMessage): boolean {
      console.warn('未处理的消息类型:', message.type, message)
      return true  // 始终返回 true，不阻止传播
    }
  }())
}
```

### 6. 多标签页 WebSocket 冲突

**问题描述:**

用户在多个浏览器标签页中打开同一应用，导致 WebSocket 消息重复接收或处理混乱。

**问题原因:**

- 每个标签页都建立了独立的 WebSocket 连接
- 服务器向所有连接推送相同消息
- 没有实现跨标签页协调机制

**解决方案:**

```typescript
import { webSocket } from '@/composables/useWS'

// ✅ 使用 BroadcastChannel 协调多标签页
const channel = new BroadcastChannel('websocket_coordination')
const tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`
let isLeader = false

// 选举主标签页
const electLeader = () => {
  channel.postMessage({ type: 'ELECTION', tabId, timestamp: Date.now() })

  // 等待一段时间，如果没有其他标签页响应，则自己成为 leader
  setTimeout(() => {
    if (!isLeader) {
      channel.postMessage({ type: 'LEADER_ELECTED', tabId })
      isLeader = true
      console.log('当前标签页成为 WebSocket 主连接')
      webSocket.connect()
    }
  }, 500)
}

// 监听其他标签页消息
channel.onmessage = (event) => {
  const { type, tabId: senderId, data } = event.data

  switch (type) {
    case 'ELECTION':
      // 如果当前是 leader，告知新标签页
      if (isLeader) {
        channel.postMessage({ type: 'LEADER_EXISTS', tabId })
      }
      break

    case 'LEADER_EXISTS':
      // 已有 leader，不再竞争
      console.log('已有主标签页，当前标签页为从属')
      break

    case 'LEADER_ELECTED':
      if (senderId !== tabId) {
        isLeader = false
        console.log('其他标签页成为主连接')
      }
      break

    case 'WS_MESSAGE':
      // 主标签页转发的 WebSocket 消息
      if (!isLeader) {
        handleMessage(data)
      }
      break
  }
}

// 主标签页转发消息给其他标签页
if (isLeader) {
  webSocket.addMessageHandler(new class implements MessageHandler {
    handle(message: WSMessage): boolean {
      // 转发消息给其他标签页
      channel.postMessage({ type: 'WS_MESSAGE', tabId, data: message })
      return true  // 继续处理
    }
  }())
}

// 页面关闭时处理
window.addEventListener('beforeunload', () => {
  if (isLeader) {
    // 通知其他标签页重新选举
    channel.postMessage({ type: 'LEADER_LEAVING', tabId })
  }
  channel.close()
})

// 初始化时进行选举
electLeader()


// ✅ 简化方案：使用 SharedWorker（需要浏览器支持）
// shared-worker.js
// const connections = []
// let ws = null
//
// onconnect = (e) => {
//   const port = e.ports[0]
//   connections.push(port)
//
//   if (!ws) {
//     ws = new WebSocket('ws://localhost:8080/ws')
//     ws.onmessage = (event) => {
//       connections.forEach(p => p.postMessage(event.data))
//     }
//   }
// }
```

### 7. 移动端应用进入后台连接中断

**问题描述:**

在移动端浏览器中，应用进入后台后 WebSocket 连接被系统中断，返回前台后无法恢复。

**问题原因:**

- 移动端浏览器为节省电量会暂停后台标签页
- iOS Safari 尤其严格，后台 30 秒后会暂停所有活动
- Android 的电池优化也会影响 WebSocket

**解决方案:**

```typescript
import { webSocket } from '@/composables/useWS'

// ✅ 监听页面可见性并处理重连
const setupMobileVisibilityHandler = () => {
  let wasConnected = false
  let reconnectAttempts = 0
  const maxReconnectAttempts = 3

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      // 记录当前连接状态
      wasConnected = webSocket.isConnected
      console.log('应用进入后台，当前连接状态:', wasConnected)
    } else if (document.visibilityState === 'visible') {
      console.log('应用恢复前台')

      // 等待一小段时间让网络恢复
      await new Promise(resolve => setTimeout(resolve, 500))

      // 检查连接状态
      if (wasConnected && !webSocket.isConnected) {
        console.log('连接已断开，尝试重连')

        while (reconnectAttempts < maxReconnectAttempts) {
          try {
            webSocket.reconnect()

            // 等待连接建立
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('连接超时')), 5000)

              const checkInterval = setInterval(() => {
                if (webSocket.isConnected) {
                  clearTimeout(timeout)
                  clearInterval(checkInterval)
                  resolve(true)
                }
              }, 100)
            })

            console.log('重连成功')
            reconnectAttempts = 0
            break
          } catch (error) {
            reconnectAttempts++
            console.log(`重连失败 (${reconnectAttempts}/${maxReconnectAttempts})`)

            if (reconnectAttempts >= maxReconnectAttempts) {
              ElMessage.warning('连接已断开，请刷新页面')
            }

            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }
    }
  })
}

// ✅ 使用 Page Lifecycle API（如果可用）
if ('onfreeze' in document) {
  document.addEventListener('freeze', () => {
    console.log('页面被冻结')
    // 保存必要状态
  })

  document.addEventListener('resume', () => {
    console.log('页面恢复')
    // 检查并恢复连接
    if (!webSocket.isConnected) {
      webSocket.reconnect()
    }
  })
}

// ✅ 使用心跳检测连接活跃性
let lastHeartbeatResponse = Date.now()
const heartbeatCheckInterval = 10000

const checkHeartbeat = () => {
  const now = Date.now()
  const timeSinceLastResponse = now - lastHeartbeatResponse

  // 如果超过 60 秒没有收到心跳响应，认为连接已断开
  if (timeSinceLastResponse > 60000 && webSocket.isConnected) {
    console.log('心跳超时，连接可能已断开')
    webSocket.reconnect()
  }
}

// 在 onMessage 中更新心跳时间
webSocket.addMessageHandler(new class implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.HEARTBEAT) {
      lastHeartbeatResponse = Date.now()
    }
    return true
  }
}())

setInterval(checkHeartbeat, heartbeatCheckInterval)
```

### 8. 大量消息导致界面卡顿

**问题描述:**

当服务器推送大量消息时，界面出现明显卡顿，影响用户体验。

**问题原因:**

- 每条消息都触发 Vue 响应式更新
- 消息处理逻辑复杂阻塞主线程
- 没有对消息进行节流或批处理

**解决方案:**

```typescript
import { webSocket, MessageHandler, WSMessage } from '@/composables/useWS'

// ✅ 消息批处理
class BatchedMessageHandler implements MessageHandler {
  private messageBuffer: WSMessage[] = []
  private flushTimer: number | null = null
  private flushInterval = 100  // 100ms 批量处理一次
  private maxBufferSize = 50   // 缓冲区最大消息数

  handle(message: WSMessage): boolean {
    this.messageBuffer.push(message)

    // 缓冲区满了立即处理
    if (this.messageBuffer.length >= this.maxBufferSize) {
      this.flush()
    } else if (!this.flushTimer) {
      // 启动定时器
      this.flushTimer = window.setTimeout(() => this.flush(), this.flushInterval)
    }

    return false  // 消息已被缓存，不继续传播
  }

  private flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    if (this.messageBuffer.length === 0) return

    // 批量处理消息
    const messages = [...this.messageBuffer]
    this.messageBuffer = []

    // 使用 requestIdleCallback 在空闲时处理（如果可用）
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.processMessages(messages)
      }, { timeout: 500 })
    } else {
      // 降级使用 requestAnimationFrame
      requestAnimationFrame(() => {
        this.processMessages(messages)
      })
    }
  }

  private processMessages(messages: WSMessage[]) {
    // 按类型分组处理
    const grouped = messages.reduce((acc, msg) => {
      const type = msg.type
      if (!acc[type]) acc[type] = []
      acc[type].push(msg)
      return acc
    }, {} as Record<string, WSMessage[]>)

    // 批量更新 Store
    Object.entries(grouped).forEach(([type, msgs]) => {
      switch (type) {
        case 'chat_message':
          // 批量添加聊天消息
          chatStore.addMessages(msgs.map(m => m.data))
          break
        case 'notification':
          // 批量显示通知（可能需要合并）
          this.showGroupedNotifications(msgs)
          break
        default:
          msgs.forEach(m => console.log('未处理:', m))
      }
    })
  }

  private showGroupedNotifications(messages: WSMessage[]) {
    if (messages.length === 1) {
      ElNotification(messages[0].data)
    } else {
      ElNotification({
        title: '新消息',
        message: `收到 ${messages.length} 条新通知`,
        type: 'info'
      })
    }
  }
}

// ✅ 使用 Web Worker 处理消息（复杂计算场景）
// message-worker.ts
// self.onmessage = (event) => {
//   const { messages } = event.data
//
//   // 在 Worker 中进行复杂处理
//   const processed = messages.map(msg => {
//     // 复杂的数据转换、验证等
//     return processMessage(msg)
//   })
//
//   self.postMessage({ processed })
// }

// 主线程
const worker = new Worker(new URL('./message-worker.ts', import.meta.url))

worker.onmessage = (event) => {
  const { processed } = event.data
  // 使用处理后的数据更新界面
  updateUI(processed)
}

webSocket.addMessageHandler(new class implements MessageHandler {
  handle(message: WSMessage): boolean {
    // 将消息发送到 Worker 处理
    worker.postMessage({ messages: [message] })
    return false
  }
}())


// ✅ 虚拟滚动显示消息列表
// 使用 @vueuse/core 的 useVirtualList 或 vue-virtual-scroller
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  messages,  // 消息列表
  { itemHeight: 60 }  // 每条消息的高度
)
```
