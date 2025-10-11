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
