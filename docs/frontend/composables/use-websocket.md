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
