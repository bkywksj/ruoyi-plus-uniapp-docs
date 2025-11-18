# useWebSocket WebSocket 通信

## 介绍

`useWebSocket` 是一个功能完整的 WebSocket 实时通信管理 Composable,基于 UniApp 的 WebSocket API 实现,提供了自动重连、心跳检测、消息处理管道等企业级特性。它专门为 UniApp 跨平台开发设计,支持 H5、小程序、App 等多个平台,确保实时通信的稳定性和可靠性。

在现代应用中,实时通信是非常重要的功能,如即时消息、系统通知、实时数据更新等。`useWebSocket` 提供了完整的 WebSocket 解决方案,不仅包含基础的连接管理,还提供了消息处理管道、全局单例管理器等高级特性,让开发者可以专注于业务逻辑,而无需关心底层的连接管理和错误处理。

**核心特性:**

- **自动连接管理** - 支持自动连接、断开、重连,无需手动管理连接状态
- **指数退避重连** - 采用动态退避策略(3s → 6s → 12s → 24s...),避免服务器压力
- **心跳检测** - 定时发送心跳消息保持连接活跃,自动检测连接状态
- **消息处理管道** - 责任链模式处理不同类型消息,支持自定义处理器
- **认证支持** - 自动附加 Token 进行身份验证,支持 Bearer 认证
- **全局单例管理** - 提供全局 WebSocket 管理器,确保应用级别只有一个连接实例
- **状态监控** - 实时监控连接状态变化,支持连接、断开、错误等事件回调
- **TypeScript 支持** - 完整的类型定义,提供优秀的开发体验
- **平台兼容** - 完美支持 UniApp 所有平台(H5、小程序、App)

## 基本用法

### 简单连接

最基础的 WebSocket 连接使用方式,连接服务器并接收消息。

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
      <wd-button type="primary" @click="handleConnect">连接</wd-button>
      <wd-button type="warning" @click="handleDisconnect">断开</wd-button>
      <wd-button type="success" @click="handleSend">发送消息</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

// 创建 WebSocket 连接
const { connect, disconnect, send, status, isConnected, data } = useWebSocket(
  'wss://example.com/ws',
  {
    onMessage: (message) => {
      console.log('收到消息:', message)
    },
    onConnected: () => {
      console.log('连接成功')
    },
    onDisconnected: (code, reason) => {
      console.log('连接断开:', code, reason)
    },
  },
)

// 最新消息
const lastMessage = computed(() => data.value)

// 连接
const handleConnect = () => {
  connect()
}

// 断开
const handleDisconnect = () => {
  disconnect()
}

// 发送消息
const handleSend = () => {
  const success = send({
    type: 'message',
    content: 'Hello WebSocket!',
    timestamp: Date.now(),
  })

  if (success) {
    uni.showToast({ title: '发送成功', icon: 'success' })
  } else {
    uni.showToast({ title: '发送失败', icon: 'error' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 32rpx;
}

.status {
  padding: 32rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 32rpx;

  text {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.message {
  padding: 32rpx;
  background: #e6f7ff;
  border-radius: 8rpx;
  margin-bottom: 32rpx;

  text {
    font-size: 28rpx;
    word-break: break-all;
  }
}

.actions {
  display: flex;
  gap: 20rpx;
}
</style>
```

**使用说明:**
- `status` 是只读的连接状态: `CONNECTING` | `OPEN` | `CLOSING` | `CLOSED`
- `isConnected` 是计算属性,表示是否已连接
- `data` 包含最后接收到的消息
- `send()` 方法返回 boolean,表示是否发送成功

### 自动重连配置

配置自动重连策略,连接断开后自动重试。

```vue
<template>
  <view class="page">
    <view class="status-card">
      <text class="label">连接状态:</text>
      <text :class="['status', status.toLowerCase()]">{{ statusText }}</text>
    </view>

    <view class="config">
      <text class="title">重连配置</text>
      <view class="item">
        <text>最大重试次数: 8 次</text>
      </view>
      <view class="item">
        <text>基础延迟: 3 秒</text>
      </view>
      <view class="item">
        <text>延迟策略: 指数退避</text>
      </view>
      <view class="item">
        <text>延迟序列: 3s → 6s → 12s → 24s → 48s → 96s → 192s → 384s</text>
      </view>
    </view>

    <view class="actions">
      <wd-button type="primary" block @click="testConnect">
        测试连接
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

// 创建带重连配置的 WebSocket
const { connect, status } = useWebSocket('wss://example.com/ws', {
  maxRetries: 8, // 最大重试 8 次
  baseDelay: 3, // 基础延迟 3 秒
  onConnected: () => {
    uni.showToast({ title: '连接成功', icon: 'success' })
  },
  onDisconnected: (code, reason) => {
    console.log('连接断开:', code, reason)
  },
  onError: (error) => {
    console.error('连接错误:', error)
  },
})

// 状态文字
const statusText = computed(() => {
  const map = {
    CONNECTING: '连接中',
    OPEN: '已连接',
    CLOSING: '关闭中',
    CLOSED: '已关闭',
  }
  return map[status.value] || '未知'
})

// 测试连接
const testConnect = () => {
  connect()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.status-card {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .label {
    font-size: 32rpx;
    color: #333;
  }

  .status {
    font-size: 28rpx;
    font-weight: bold;
    padding: 8rpx 24rpx;
    border-radius: 32rpx;

    &.connecting {
      color: #1989fa;
      background: #e6f7ff;
    }

    &.open {
      color: #07c160;
      background: #e7f9f0;
    }

    &.closing {
      color: #ff976a;
      background: #fff3e6;
    }

    &.closed {
      color: #999;
      background: #f5f5f5;
    }
  }
}

.config {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .item {
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.actions {
  margin-top: 32rpx;
}
</style>
```

**重连策略说明:**
- 采用指数退避算法: 延迟时间 = 基础延迟 × 2^重试次数
- 第1次: 3秒后重连
- 第2次: 6秒后重连
- 第3次: 12秒后重连
- 第4次: 24秒后重连
- 以此类推,最多重试 8 次
- 手动关闭连接不会触发自动重连

### 心跳检测

配置心跳检测,保持连接活跃并及时发现连接断开。

```vue
<template>
  <view class="page">
    <view class="heartbeat-status">
      <view class="icon" :class="{ active: isConnected }">
        <text>💓</text>
      </view>
      <view class="info">
        <text class="title">心跳检测</text>
        <text class="desc">每 30 秒发送一次心跳</text>
        <text class="status">
          状态: {{ isConnected ? '活跃' : '未连接' }}
        </text>
      </view>
    </view>

    <view class="heartbeat-log">
      <view class="log-header">
        <text>心跳日志</text>
        <wd-button size="small" @click="clearLog">清空</wd-button>
      </view>
      <view class="log-list">
        <view v-for="(item, index) in heartbeatLog" :key="index" class="log-item">
          <text class="time">{{ item.time }}</text>
          <text class="msg">{{ item.message }}</text>
        </view>
        <view v-if="heartbeatLog.length === 0" class="empty">
          暂无日志
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

// 心跳日志
const heartbeatLog = ref<Array<{ time: string; message: string }>>([])

// 添加日志
const addLog = (message: string) => {
  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  heartbeatLog.value.unshift({ time, message })
  // 只保留最近 20 条
  if (heartbeatLog.value.length > 20) {
    heartbeatLog.value = heartbeatLog.value.slice(0, 20)
  }
}

// 清空日志
const clearLog = () => {
  heartbeatLog.value = []
}

// 创建 WebSocket 连接
const { connect, isConnected } = useWebSocket('wss://example.com/ws', {
  heartbeatInterval: 30000, // 30 秒发送一次心跳
  heartbeatMessage: JSON.stringify({
    type: 'ping',
    timestamp: Date.now(),
  }),
  onConnected: () => {
    addLog('✅ 连接建立成功')
  },
  onMessage: (message) => {
    // 检查是否是心跳响应
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message
      if (data.type === 'pong') {
        addLog('💓 收到心跳响应')
      } else {
        addLog(`📨 收到消息: ${JSON.stringify(data)}`)
      }
    } catch {
      addLog(`📨 收到消息: ${message}`)
    }
  },
  onDisconnected: (code, reason) => {
    addLog(`❌ 连接断开: ${code} ${reason}`)
  },
})

// 自动连接
onMounted(() => {
  connect()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.heartbeat-status {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;

  .icon {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    opacity: 0.5;
    transition: all 0.3s ease;

    &.active {
      opacity: 1;
      background: #e7f9f0;
      animation: heartbeat 1.5s ease-in-out infinite;
    }
  }

  .info {
    flex: 1;

    text {
      display: block;
    }

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .desc {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;
    }

    .status {
      font-size: 24rpx;
      color: #666;
    }
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.heartbeat-log {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;

  .log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
    margin-bottom: 24rpx;

    text {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .log-list {
    max-height: 600rpx;
    overflow-y: auto;

    .log-item {
      padding: 16rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .time {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
      }

      .msg {
        display: block;
        font-size: 28rpx;
        color: #333;
        word-break: break-all;
      }
    }

    .empty {
      padding: 60rpx;
      text-align: center;
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
```

**心跳机制说明:**
- 默认每 30 秒发送一次心跳消息
- 心跳消息格式: `{"type":"ping","timestamp":1234567890}`
- 服务端应响应 `{"type":"pong"}` 确认连接活跃
- 如果长时间未收到响应,连接会自动断开并重连
- 心跳检测在连接建立后自动启动,断开时自动停止

### 消息处理管道

使用消息处理管道,按照责任链模式处理不同类型的消息。

```vue
<template>
  <view class="page">
    <view class="pipeline-status">
      <text class="title">消息处理管道</text>
      <view class="handlers">
        <view v-for="handler in handlers" :key="handler" class="handler-item">
          <text>{{ handler }}</text>
        </view>
      </view>
    </view>

    <view class="message-list">
      <text class="title">接收到的消息</text>
      <view class="list">
        <view v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.type">
          <view class="header">
            <text class="type">{{ msg.type }}</text>
            <text class="time">{{ msg.time }}</text>
          </view>
          <text class="content">{{ msg.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  webSocket,
  WSMessageType,
  type WSMessage,
  type MessageHandler,
} from '@/composables/useWebSocket'

// 注册的处理器列表
const handlers = ref<string[]>([])

// 消息列表
const messages = ref<
  Array<{
    type: string
    time: string
    content: string
  }>
>([])

// 自定义业务消息处理器
class BusinessMessageHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'business_message') {
      // 处理业务消息
      const now = new Date()
      const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`

      messages.value.unshift({
        type: 'business',
        time,
        content: JSON.stringify(message.data),
      })

      console.log('📊 处理业务消息:', message.data)
      return false // 阻止继续传播
    }

    return true // 继续传播给下一个处理器
  }
}

// 初始化
onMounted(() => {
  // 初始化全局 WebSocket
  webSocket.initialize()

  // 添加自定义处理器
  webSocket.addMessageHandler(new BusinessMessageHandler())

  // 获取处理器列表
  handlers.value = webSocket.getMessageHandlers()

  // 连接
  webSocket.connect()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.pipeline-status {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .handlers {
    .handler-item {
      padding: 16rpx 24rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      text {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

.message-list {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .list {
    .message-item {
      padding: 24rpx;
      border-radius: 8rpx;
      margin-bottom: 16rpx;

      &.business {
        background: #e6f7ff;
      }

      &.system {
        background: #fff3e6;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16rpx;

        .type {
          font-size: 24rpx;
          font-weight: bold;
          color: #333;
        }

        .time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .content {
        display: block;
        font-size: 28rpx;
        color: #666;
        word-break: break-all;
      }
    }
  }
}
</style>
```

**消息处理管道说明:**
- 采用责任链模式,消息依次经过各个处理器
- 处理器可以选择处理并阻止传播,或跳过让下一个处理器处理
- 内置处理器: `HeartbeatHandler`(心跳)、`SystemNoticeHandler`(系统通知)
- 可以通过 `addMessageHandler()` 添加自定义处理器
- 处理器按添加顺序执行,优先级高的应先添加

### 全局 WebSocket 管理

使用全局 WebSocket 管理器,实现应用级别的单例管理。

```vue
<template>
  <view class="page">
    <view class="global-status">
      <text class="title">全局 WebSocket</text>
      <view class="status-row">
        <text>连接状态:</text>
        <text :class="['status', status.toLowerCase()]">{{ status }}</text>
      </view>
      <view class="status-row">
        <text>是否已连接:</text>
        <text>{{ isConnected ? '是' : '否' }}</text>
      </view>
    </view>

    <view class="actions">
      <wd-button type="primary" block @click="handleInit">初始化</wd-button>
      <wd-button type="success" block @click="handleConnect">连接</wd-button>
      <wd-button type="warning" block @click="handleDisconnect">断开</wd-button>
      <wd-button type="info" block @click="handleSend">发送测试消息</wd-button>
      <wd-button type="error" block @click="handleDestroy">销毁</wd-button>
    </view>

    <view v-if="lastMessage" class="last-message">
      <text class="title">最新消息</text>
      <text class="content">{{ lastMessage }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { webSocket } from '@/composables/useWebSocket'

// 连接状态
const status = computed(() => webSocket.status)
const isConnected = computed(() => webSocket.isConnected)
const lastMessage = computed(() => {
  const msg = webSocket.lastMessage
  return msg ? JSON.stringify(msg) : null
})

// 初始化
const handleInit = () => {
  webSocket.initialize('wss://example.com/ws', {
    onConnected: () => {
      uni.showToast({ title: '连接成功', icon: 'success' })
    },
    onMessage: (data) => {
      console.log('收到消息:', data)
    },
    onDisconnected: (code, reason) => {
      console.log('连接断开:', code, reason)
    },
  })
}

// 连接
const handleConnect = () => {
  const success = webSocket.connect()
  if (!success) {
    uni.showToast({ title: '请先初始化', icon: 'error' })
  }
}

// 断开
const handleDisconnect = () => {
  webSocket.disconnect()
}

// 发送消息
const handleSend = () => {
  const success = webSocket.send({
    type: 'test',
    content: 'Hello from global WebSocket',
    timestamp: Date.now(),
  })

  if (success) {
    uni.showToast({ title: '发送成功', icon: 'success' })
  } else {
    uni.showToast({ title: '发送失败', icon: 'error' })
  }
}

// 销毁
const handleDestroy = () => {
  webSocket.destroy()
  uni.showToast({ title: '已销毁', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.global-status {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    text {
      font-size: 28rpx;

      &:first-child {
        color: #666;
      }

      &:last-child {
        color: #333;
        font-weight: bold;
      }
    }

    .status {
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;

      &.connecting {
        color: #1989fa;
        background: #e6f7ff;
      }

      &.open {
        color: #07c160;
        background: #e7f9f0;
      }

      &.closed {
        color: #999;
        background: #f5f5f5;
      }
    }
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.last-message {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .content {
    display: block;
    font-size: 28rpx;
    color: #666;
    word-break: break-all;
    line-height: 1.6;
  }
}
</style>
```

**全局管理器说明:**
- `webSocket` 是全局单例实例,整个应用共享
- 必须先调用 `initialize()` 初始化
- 自动检查系统配置和用户登录状态
- 自动构建 WebSocket URL 并附加认证信息
- 支持销毁并重新初始化

### 聊天室应用

使用 WebSocket 实现简单的聊天室功能。

```vue
<template>
  <view class="chat-page">
    <view class="chat-header">
      <text>聊天室</text>
      <text :class="['status', isConnected ? 'online' : 'offline']">
        {{ isConnected ? '在线' : '离线' }}
      </text>
    </view>

    <scroll-view class="chat-messages" scroll-y :scroll-into-view="scrollToView">
      <view
        v-for="(msg, index) in messages"
        :key="index"
        :id="`msg-${index}`"
        class="message"
        :class="{ self: msg.isSelf }"
      >
        <view class="avatar">
          <text>{{ msg.username.charAt(0).toUpperCase() }}</text>
        </view>
        <view class="content">
          <text class="username">{{ msg.username }}</text>
          <view class="bubble">
            <text>{{ msg.content }}</text>
          </view>
          <text class="time">{{ msg.time }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="chat-input">
      <input
        v-model="inputText"
        type="text"
        placeholder="输入消息..."
        @confirm="handleSend"
      />
      <wd-button type="primary" size="small" @click="handleSend">
        发送
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

// 当前用户
const currentUser = ref('User001')

// 消息列表
const messages = ref<
  Array<{
    username: string
    content: string
    time: string
    isSelf: boolean
  }>
>([])

// 输入框内容
const inputText = ref('')

// 滚动位置
const scrollToView = ref('')

// WebSocket 连接
const { connect, send, isConnected } = useWebSocket('wss://example.com/chat', {
  onConnected: () => {
    uni.showToast({ title: '加入聊天室', icon: 'success' })
  },
  onMessage: (data) => {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data

      if (message.type === 'chat_message') {
        // 添加消息
        const now = new Date()
        const time = `${now.getHours()}:${now.getMinutes()}`

        messages.value.push({
          username: message.username || 'Anonymous',
          content: message.content,
          time,
          isSelf: message.username === currentUser.value,
        })

        // 滚动到最新消息
        nextTick(() => {
          scrollToView.value = `msg-${messages.value.length - 1}`
        })
      }
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  },
})

// 发送消息
const handleSend = () => {
  if (!inputText.value.trim()) {
    return
  }

  if (!isConnected.value) {
    uni.showToast({ title: '未连接到服务器', icon: 'error' })
    return
  }

  const success = send({
    type: 'chat_message',
    username: currentUser.value,
    content: inputText.value,
    timestamp: Date.now(),
  })

  if (success) {
    inputText.value = ''
  }
}

// 自动连接
onMounted(() => {
  connect()
})
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;

  text:first-child {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .status {
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 16rpx;

    &.online {
      color: #07c160;
      background: #e7f9f0;
    }

    &.offline {
      color: #999;
      background: #f5f5f5;
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;

  .message {
    display: flex;
    margin-bottom: 32rpx;

    &.self {
      flex-direction: row-reverse;

      .content {
        align-items: flex-end;

        .bubble {
          background: #1989fa;
          color: #fff;
        }
      }
    }

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: #1989fa;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      text {
        font-size: 32rpx;
        color: #fff;
        font-weight: bold;
      }
    }

    .content {
      flex: 1;
      padding: 0 16rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .username {
        font-size: 24rpx;
        color: #999;
      }

      .bubble {
        padding: 16rpx 24rpx;
        background: #fff;
        border-radius: 16rpx;
        max-width: 500rpx;
        align-self: flex-start;

        text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.5;
          word-break: break-all;
        }
      }

      .time {
        font-size: 20rpx;
        color: #ccc;
      }
    }
  }
}

.chat-input {
  padding: 16rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  gap: 16rpx;

  input {
    flex: 1;
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 32rpx;
    font-size: 28rpx;
  }
}
</style>
```

**聊天室实现说明:**
- 使用 WebSocket 实现实时消息推送
- 区分自己和他人的消息显示样式
- 自动滚动到最新消息
- 未连接时禁止发送
- 按 Enter 键或点击按钮发送消息

## 消息处理管道

### 管道架构

消息处理管道采用责任链模式,提供灵活的消息处理机制。

**架构图:**

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
1. 接收原始消息(字符串/对象)
2. 解析并标准化为 `WSMessage` 格式
3. 依次通过各个处理器
4. 处理器返回 `true` 继续传播,`false` 停止传播
5. 所有处理器执行完毕或被停止

### 内置处理器

系统提供三个内置处理器:

**1. HeartbeatHandler (心跳处理器)**

```typescript
export class HeartbeatHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.HEARTBEAT) {
      // 只做简单的日志记录,不做其他处理
      console.log('💓 心跳消息:', message.data)
      return false // 阻止继续传播
    }

    return true // 不是心跳消息,继续传播
  }
}
```

**职责:**
- 处理心跳消息(ping/pong)
- 记录日志
- 阻止心跳消息继续传播

**2. SystemNoticeHandler (系统通知处理器)**

```typescript
export class SystemNoticeHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.SYSTEM_NOTICE) {
      const notificationData = message.data as NotificationData

      // 显示系统通知
      toast.show(notificationData.content || notificationData.title || '系统通知')

      console.log('📢 处理系统通知:', notificationData.content)
      return false // 阻止继续传播
    }

    return true // 不是系统通知类型,继续传播
  }
}
```

**职责:**
- 处理系统通知消息
- 使用 Toast 显示通知
- 阻止系统通知继续传播

**3. ChatMessageHandler (聊天消息处理器)**

注释掉的实现,可根据需求启用:

```typescript
export class ChatMessageHandler implements MessageHandler {
  private chatStore: any = null

  private getChatStore() {
    if (!this.chatStore) {
      this.chatStore = useChatStore()
    }
    return this.chatStore
  }

  private showChatNotification(chatData: ChatMessageData) {
    const { path } = getCurrentRoute()
    const isInChatPage = path.includes('/chat')

    if (!isInChatPage) {
      toast.show(`来自 ${chatData.fromUsername}`)
    }
  }

  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.CHAT_MESSAGE) {
      const chatData = message.data as ChatMessageData

      // 更新聊天数据存储
      this.getChatStore().addMessage({
        id: message.id || Date.now().toString(),
        fromUserId: chatData.fromUserId,
        fromUsername: chatData.fromUsername,
        content: chatData.content,
        timestamp: message.timestamp,
        chatRoomId: chatData.chatRoomId,
        messageType: chatData.messageType || 'text',
      })

      // 显示聊天通知
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo?.userId
      if (chatData.fromUserId !== currentUserId) {
        this.showChatNotification(chatData)
      }

      console.log('💬 处理聊天消息:', `${chatData.fromUsername}: ${chatData.content}`)
      return false // 阻止继续传播
    }

    return true // 不是聊天消息,继续传播
  }
}
```

**职责:**
- 处理聊天消息
- 更新聊天数据存储
- 显示聊天通知(非当前页面)
- 过滤自己发送的消息

### 自定义处理器

创建自定义消息处理器:

```vue
<script lang="ts" setup>
import {
  webSocket,
  type WSMessage,
  type MessageHandler,
} from '@/composables/useWebSocket'

// 自定义订单消息处理器
class OrderMessageHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'order_update') {
      const orderData = message.data

      // 更新订单状态
      const orderStore = useOrderStore()
      orderStore.updateOrder(orderData)

      // 显示通知
      uni.showToast({
        title: `订单 ${orderData.orderNo} 已更新`,
        icon: 'success',
      })

      console.log('📦 处理订单消息:', orderData)
      return false // 阻止继续传播
    }

    return true // 不是订单消息,继续传播
  }
}

// 自定义支付消息处理器
class PaymentMessageHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'payment_success') {
      const paymentData = message.data

      // 跳转到支付成功页面
      uni.navigateTo({
        url: `/pages/payment/success?orderNo=${paymentData.orderNo}`,
      })

      console.log('💰 处理支付消息:', paymentData)
      return false // 阻止继续传播
    }

    return true // 不是支付消息,继续传播
  }
}

// 初始化并添加处理器
onMounted(() => {
  webSocket.initialize()

  // 添加自定义处理器
  webSocket.addMessageHandler(new OrderMessageHandler())
  webSocket.addMessageHandler(new PaymentMessageHandler())

  // 连接
  webSocket.connect()
})
</script>
```

**处理器开发规范:**
1. 实现 `MessageHandler` 接口
2. 在 `handle()` 方法中判断消息类型
3. 处理完成返回 `false` 停止传播
4. 不处理返回 `true` 继续传播
5. 使用 `try-catch` 捕获异常,避免影响其他处理器

### 管道管理

```typescript
// 获取当前处理器列表
const handlers = webSocket.getMessageHandlers()
console.log('处理器列表:', handlers)
// ['HeartbeatHandler', 'SystemNoticeHandler', 'OrderMessageHandler', 'PaymentMessageHandler']

// 移除处理器
webSocket.removeMessageHandler(OrderMessageHandler)

// 再次添加
webSocket.addMessageHandler(new OrderMessageHandler())
```

**管理要点:**
- 处理器按添加顺序执行
- 优先级高的处理器应先添加
- 可以动态添加和移除处理器
- 移除时使用处理器的类(不是实例)

## API 文档

### useWebSocket()

`useWebSocket` 是主要的 Composable 函数,用于创建和管理 WebSocket 连接。

**函数签名:**

```typescript
export const useWebSocket = (
  url: string,
  options?: {
    maxRetries?: number
    baseDelay?: number
    heartbeatInterval?: number
    heartbeatMessage?: string
    onMessage?: (data: any) => void
    onConnected?: () => void
    onDisconnected?: (code: number, reason: string) => void
    onError?: (error: any) => void
  },
) => {
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  send: (message: string | object) => boolean
  status: Readonly<Ref<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>>
  isConnected: Readonly<ComputedRef<boolean>>
  data: Readonly<Ref<any>>
}
```

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | `string` | 是 | WebSocket 服务器地址,如 `wss://example.com/ws` |
| options | `object` | 否 | 配置选项对象 |

**options 配置项:**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxRetries | `number` | `8` | 最大重试次数,超过后停止重连 |
| baseDelay | `number` | `3` | 基础延迟秒数,用于计算指数退避延迟 |
| heartbeatInterval | `number` | `30000` | 心跳间隔(毫秒),0 表示禁用心跳 |
| heartbeatMessage | `string` | `{"type":"ping","timestamp":...}` | 心跳消息内容 |
| onMessage | `(data: any) => void` | - | 接收到消息的回调函数 |
| onConnected | `() => void` | - | 连接成功的回调函数 |
| onDisconnected | `(code: number, reason: string) => void` | - | 连接断开的回调函数 |
| onError | `(error: any) => void` | - | 连接错误的回调函数 |

#### 返回值

返回一个对象,包含以下属性和方法:

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| connect | `() => void` | 建立 WebSocket 连接 |
| disconnect | `() => void` | 断开 WebSocket 连接 |
| reconnect | `() => void` | 重新连接(重置重试计数) |
| send | `(message: string \| object) => boolean` | 发送消息,返回是否成功 |
| status | `Readonly<Ref<'CONNECTING' \| 'OPEN' \| 'CLOSING' \| 'CLOSED'>>` | 连接状态 |
| isConnected | `Readonly<ComputedRef<boolean>>` | 是否已连接(status === 'OPEN') |
| data | `Readonly<Ref<any>>` | 最后接收到的消息数据 |

#### 方法详解

**1. connect()**

建立 WebSocket 连接。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect } = useWebSocket('wss://example.com/ws')

// 建立连接
const handleConnect = () => {
  connect()
}
</script>
```

**特性:**
- 如果已有连接,会先关闭旧连接
- 自动构建包含 Token 的完整 URL
- 连接成功后重置重试计数
- 连接成功后自动启动心跳检测

**2. disconnect()**

断开 WebSocket 连接,不会触发自动重连。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { disconnect } = useWebSocket('wss://example.com/ws')

// 断开连接
const handleDisconnect = () => {
  disconnect()
}
</script>
```

**特性:**
- 设置手动关闭标志,阻止自动重连
- 清除重试定时器
- 重置重试计数
- 停止心跳检测
- 发送关闭码 1000(正常关闭)

**3. reconnect()**

手动重新连接,重置重试计数和状态。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { reconnect } = useWebSocket('wss://example.com/ws')

// 重新连接
const handleReconnect = () => {
  reconnect()
}
</script>
```

**特性:**
- 清除现有的重试定时器
- 重置重试计数为 0
- 先调用 disconnect() 断开连接
- 延迟 100ms 后重新调用 connect()
- 允许自动重连

**4. send(message)**

发送消息到服务器。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { send, isConnected } = useWebSocket('wss://example.com/ws')

// 发送字符串消息
const sendText = () => {
  if (!isConnected.value) {
    uni.showToast({ title: '未连接', icon: 'error' })
    return
  }

  const success = send('Hello Server')
  if (success) {
    console.log('发送成功')
  }
}

// 发送对象消息
const sendObject = () => {
  const success = send({
    type: 'message',
    content: 'Hello',
    timestamp: Date.now(),
  })

  if (success) {
    console.log('发送成功')
  } else {
    console.log('发送失败')
  }
}
</script>
```

**参数:**
- `message`: `string | object` - 要发送的消息,对象会自动序列化为 JSON

**返回值:**
- `boolean` - `true` 表示发送成功,`false` 表示发送失败

**特性:**
- 自动检查连接状态
- 对象自动转换为 JSON 字符串
- 心跳消息不打印日志(减少噪音)
- 发送失败返回 false 并打印错误

#### 状态和数据

**1. status**

连接状态,只读的 Ref。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { status } = useWebSocket('wss://example.com/ws')

// 监听状态变化
watch(status, (newStatus) => {
  console.log('连接状态变化:', newStatus)
})
</script>
```

**可能的值:**
- `'CONNECTING'` - 正在连接
- `'OPEN'` - 已连接
- `'CLOSING'` - 正在关闭
- `'CLOSED'` - 已关闭

**2. isConnected**

是否已连接,只读的计算属性。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { isConnected } = useWebSocket('wss://example.com/ws')

// 监听连接状态
watch(isConnected, (connected) => {
  if (connected) {
    console.log('已连接')
  } else {
    console.log('未连接')
  }
})
</script>
```

**类型:** `Readonly<ComputedRef<boolean>>`

**计算逻辑:** `status.value === 'OPEN'`

**3. data**

最后接收到的消息数据,只读的 Ref。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { data } = useWebSocket('wss://example.com/ws')

// 监听消息数据
watch(data, (newData) => {
  console.log('收到新消息:', newData)
})
</script>
```

**类型:** `Readonly<Ref<any>>`

**说明:**
- 每次收到消息时更新
- 可以是字符串或对象
- 配合 `onMessage` 回调使用

#### 事件回调

**1. onMessage(data)**

接收到消息时触发。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect } = useWebSocket('wss://example.com/ws', {
  onMessage: (data) => {
    console.log('收到消息:', data)

    // 解析消息
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data
      console.log('消息类型:', message.type)
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  },
})
</script>
```

**参数:**
- `data: any` - 接收到的消息,可能是字符串或对象

**2. onConnected()**

连接成功时触发。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect } = useWebSocket('wss://example.com/ws', {
  onConnected: () => {
    console.log('连接成功')
    uni.showToast({ title: '连接成功', icon: 'success' })
  },
})
</script>
```

**3. onDisconnected(code, reason)**

连接断开时触发。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect } = useWebSocket('wss://example.com/ws', {
  onDisconnected: (code, reason) => {
    console.log('连接断开:', { code, reason })

    if (code === 1000) {
      console.log('正常关闭')
    } else {
      console.log('异常断开,将自动重连')
    }
  },
})
</script>
```

**参数:**
- `code: number` - 关闭码
  - `1000` - 正常关闭
  - 其他 - 异常关闭
- `reason: string` - 关闭原因

**4. onError(error)**

连接错误时触发。

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { connect } = useWebSocket('wss://example.com/ws', {
  onError: (error) => {
    console.error('连接错误:', error)
    uni.showToast({ title: '连接失败', icon: 'error' })
  },
})
</script>
```

**参数:**
- `error: any` - 错误对象

### GlobalWebSocketManager

全局 WebSocket 管理器,单例模式,确保应用级别只有一个 WebSocket 连接。

#### 使用方式

```typescript
import { webSocket } from '@/composables/useWebSocket'

// 初始化
webSocket.initialize()

// 连接
webSocket.connect()

// 发送消息
webSocket.send({ type: 'message', content: 'Hello' })

// 断开
webSocket.disconnect()
```

#### 方法

**1. initialize(url?, options?)**

初始化全局 WebSocket 实例。

```typescript
// 使用默认 URL(自动构建)
webSocket.initialize()

// 使用自定义 URL
webSocket.initialize('wss://custom.com/ws')

// 使用自定义配置
webSocket.initialize('wss://custom.com/ws', {
  maxRetries: 5,
  heartbeatInterval: 15000,
  onMessage: (data) => {
    console.log('全局消息:', data)
  },
})
```

**参数:**
- `url?: string` - WebSocket 服务器地址(可选,默认自动构建)
- `options?: object` - 配置选项,同 `useWebSocket` 的 options

**返回值:**
- `ReturnType<typeof useWebSocket> | null` - WebSocket 实例或 null

**特性:**
- 检查是否已初始化,避免重复初始化
- 检查系统配置和用户登录状态
- 自动构建 WebSocket URL(基于 SystemConfig.api.baseUrl)
- 自动处理 http/https 到 ws/wss 的转换
- 初始化消息处理管道
- 防止并发初始化

**2. connect()**

连接 WebSocket。

```typescript
const success = webSocket.connect()
if (success) {
  console.log('连接请求已发送')
} else {
  console.log('未初始化或已连接')
}
```

**返回值:**
- `boolean` - 是否成功发送连接请求

**特性:**
- 检查是否已初始化
- 检查当前状态,避免重复连接
- `OPEN` 或 `CONNECTING` 状态下不重复连接

**3. disconnect()**

断开 WebSocket 连接。

```typescript
webSocket.disconnect()
```

**特性:**
- 调用底层实例的 disconnect() 方法
- 停止心跳检测
- 不触发自动重连

**4. reconnect()**

重新连接。

```typescript
const success = webSocket.reconnect()
if (success) {
  console.log('重连请求已发送')
} else {
  console.log('未初始化')
}
```

**返回值:**
- `boolean` - 是否成功发送重连请求

**5. send(message)**

发送消息。

```typescript
const success = webSocket.send({
  type: 'chat',
  content: 'Hello World',
})

if (success) {
  console.log('发送成功')
} else {
  console.log('发送失败或未初始化')
}
```

**参数:**
- `message: string | object` - 要发送的消息

**返回值:**
- `boolean` - 是否发送成功

**6. addMessageHandler(handler)**

添加自定义消息处理器到管道。

```typescript
import { type MessageHandler, type WSMessage } from '@/composables/useWebSocket'

class CustomHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'custom') {
      console.log('处理自定义消息:', message.data)
      return false // 停止传播
    }
    return true // 继续传播
  }
}

webSocket.addMessageHandler(new CustomHandler())
```

**参数:**
- `handler: MessageHandler` - 消息处理器实例

**7. removeMessageHandler(handlerClass)**

移除消息处理器。

```typescript
webSocket.removeMessageHandler(CustomHandler)
```

**参数:**
- `handlerClass: new () => MessageHandler` - 处理器类(不是实例)

**8. getMessageHandlers()**

获取当前消息处理器列表。

```typescript
const handlers = webSocket.getMessageHandlers()
console.log('处理器列表:', handlers)
// ['HeartbeatHandler', 'SystemNoticeHandler', 'CustomHandler']
```

**返回值:**
- `string[]` - 处理器类名列表

**9. destroy()**

销毁全局 WebSocket 实例。

```typescript
webSocket.destroy()
```

**特性:**
- 断开连接
- 清空实例引用
- 重置初始化标志
- 可重新调用 `initialize()` 初始化

#### 属性

**1. status**

连接状态,只读。

```typescript
const currentStatus = webSocket.status
console.log('当前状态:', currentStatus)
// 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
```

**类型:** `'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'`

**2. isConnected**

是否已连接,只读。

```typescript
if (webSocket.isConnected) {
  console.log('已连接')
} else {
  console.log('未连接')
}
```

**类型:** `boolean`

**3. lastMessage**

最后接收到的消息,只读。

```typescript
const lastMsg = webSocket.lastMessage
console.log('最后消息:', lastMsg)
```

**类型:** `any`

### MessagePipeline

消息处理管道类,实现责任链模式。

#### 使用方式

```typescript
import { MessagePipeline } from '@/composables/useWebSocket'

const pipeline = new MessagePipeline()

// 添加处理器
pipeline.addHandler(new HeartbeatHandler())
pipeline.addHandler(new SystemNoticeHandler())

// 处理消息
pipeline.process(rawMessage)

// 获取处理器列表
const handlers = pipeline.getHandlers()
```

#### 方法

**1. addHandler(handler)**

添加消息处理器。

```typescript
pipeline.addHandler(new CustomHandler())
```

**参数:**
- `handler: MessageHandler` - 处理器实例

**2. removeHandler(handlerClass)**

移除消息处理器。

```typescript
pipeline.removeHandler(CustomHandler)
```

**参数:**
- `handlerClass: new () => MessageHandler` - 处理器类

**3. process(rawMessage)**

处理原始消息。

```typescript
pipeline.process('{"type":"system_notice","data":{"content":"系统通知"}}')
pipeline.process({ type: 'chat_message', data: { content: 'Hello' } })
```

**参数:**
- `rawMessage: any` - 原始消息,可以是字符串、对象等

**处理流程:**
1. 解析并标准化消息为 `WSMessage` 格式
2. 依次通过各个处理器
3. 处理器返回 `true` 继续,`false` 停止
4. 捕获并处理异常,不影响其他处理器

**4. getHandlers()**

获取当前处理器列表。

```typescript
const handlers = pipeline.getHandlers()
console.log(handlers)
// ['HeartbeatHandler', 'SystemNoticeHandler']
```

**返回值:**
- `string[]` - 处理器类名列表

## 类型定义

### WSMessageType

WebSocket 消息类型枚举。

```typescript
export enum WSMessageType {
  /** 系统通知 - 需要显示通知和存储 */
  SYSTEM_NOTICE = 'system_notice',

  /** 聊天消息 - 由聊天组件处理 */
  CHAT_MESSAGE = 'chat_message',

  /** 心跳消息 - 系统内部使用 */
  HEARTBEAT = 'heartbeat',
}
```

**说明:**
- `SYSTEM_NOTICE` - 系统通知消息,包括通知和公告,会显示在右上角
- `CHAT_MESSAGE` - 聊天消息,由聊天组件专门处理
- `HEARTBEAT` - 心跳消息,用于保持连接活跃,内部处理

**使用示例:**

```typescript
import { WSMessageType } from '@/composables/useWebSocket'

// 发送系统通知
send({
  type: WSMessageType.SYSTEM_NOTICE,
  data: {
    content: '您有新的系统通知',
  },
  timestamp: Date.now(),
})

// 发送聊天消息
send({
  type: WSMessageType.CHAT_MESSAGE,
  data: {
    fromUserId: '123',
    fromUsername: 'Alice',
    content: 'Hello',
  },
  timestamp: Date.now(),
})
```

### WSMessage

WebSocket 消息结构接口。

```typescript
export interface WSMessage {
  /** 消息类型 */
  type: WSMessageType

  /** 消息数据 */
  data: any

  /** 时间戳 */
  timestamp: number

  /** 消息ID(可选) */
  id?: string
}
```

**说明:**
- `type` - 消息类型,必须是 `WSMessageType` 枚举值之一
- `data` - 消息数据,具体结构取决于消息类型
- `timestamp` - 消息时间戳,毫秒数
- `id` - 消息唯一标识,可选

**使用示例:**

```typescript
import { type WSMessage, WSMessageType } from '@/composables/useWebSocket'

// 创建消息对象
const message: WSMessage = {
  type: WSMessageType.SYSTEM_NOTICE,
  data: {
    title: '系统通知',
    content: '您的账户余额不足',
    type: 'warning',
  },
  timestamp: Date.now(),
  id: 'msg-001',
}
```

### NotificationData

通知消息数据结构。

```typescript
export interface NotificationData {
  /** 通知标题(可选) */
  title?: string

  /** 通知内容 */
  content: string

  /** 显示时长(可选,毫秒) */
  duration?: number

  /** 通知类型(可选) */
  type?: 'success' | 'info' | 'warning' | 'error'
}
```

**说明:**
- `title` - 通知标题,可选
- `content` - 通知内容,必填
- `duration` - 显示时长(毫秒),可选,默认由 Toast 组件决定
- `type` - 通知类型,可选,影响显示样式

**使用示例:**

```typescript
import { type NotificationData, WSMessageType } from '@/composables/useWebSocket'

// 创建系统通知
const notification: NotificationData = {
  title: '重要提醒',
  content: '您的会员即将到期',
  type: 'warning',
  duration: 3000,
}

// 发送通知消息
send({
  type: WSMessageType.SYSTEM_NOTICE,
  data: notification,
  timestamp: Date.now(),
})
```

### ChatMessageData

聊天消息数据结构。

```typescript
export interface ChatMessageData {
  /** 发送者ID */
  fromUserId: string

  /** 发送者用户名 */
  fromUsername: string

  /** 消息内容 */
  content: string

  /** 聊天室ID(群聊,可选) */
  chatRoomId?: string

  /** 消息类型(可选,默认 text) */
  messageType?: 'text' | 'image' | 'file'
}
```

**说明:**
- `fromUserId` - 发送者用户ID,必填
- `fromUsername` - 发送者用户名,必填
- `content` - 消息内容,必填
- `chatRoomId` - 聊天室ID,群聊时使用,可选
- `messageType` - 消息类型,可选,默认为 `'text'`

**使用示例:**

```typescript
import { type ChatMessageData, WSMessageType } from '@/composables/useWebSocket'

// 创建文本消息
const textMessage: ChatMessageData = {
  fromUserId: '123',
  fromUsername: 'Alice',
  content: 'Hello, how are you?',
  messageType: 'text',
}

// 创建群聊消息
const groupMessage: ChatMessageData = {
  fromUserId: '123',
  fromUsername: 'Alice',
  content: 'Hello everyone!',
  chatRoomId: 'room-001',
  messageType: 'text',
}

// 发送聊天消息
send({
  type: WSMessageType.CHAT_MESSAGE,
  data: textMessage,
  timestamp: Date.now(),
})
```

### MessageHandler

消息处理器接口。

```typescript
export interface MessageHandler {
  /**
   * 处理消息
   * @param message 标准化的消息对象
   * @returns 是否继续传播消息到下一个处理器
   */
  handle: (message: WSMessage) => boolean
}
```

**说明:**
- `handle` 方法接收一个 `WSMessage` 对象
- 返回 `true` 表示继续传播给下一个处理器
- 返回 `false` 表示停止传播,不再执行后续处理器

**使用示例:**

```typescript
import {
  type MessageHandler,
  type WSMessage,
  WSMessageType,
} from '@/composables/useWebSocket'

// 实现自定义处理器
class NotificationHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    // 只处理通知消息
    if (message.type === WSMessageType.SYSTEM_NOTICE) {
      const data = message.data
      console.log('收到通知:', data.content)

      // 显示通知
      uni.showToast({
        title: data.content,
        icon: data.type === 'error' ? 'error' : 'success',
      })

      // 停止传播
      return false
    }

    // 不是通知消息,继续传播
    return true
  }
}

// 使用处理器
const handler = new NotificationHandler()
webSocket.addMessageHandler(handler)
```

### UseWebSocketOptions

`useWebSocket` 配置选项类型。

```typescript
interface UseWebSocketOptions {
  /** 最大重试次数,默认 8 */
  maxRetries?: number

  /** 基础延迟秒数,默认 3 */
  baseDelay?: number

  /** 心跳间隔(毫秒),默认 30000 */
  heartbeatInterval?: number

  /** 心跳消息内容,默认 {"type":"ping","timestamp":...} */
  heartbeatMessage?: string

  /** 接收到消息的回调函数 */
  onMessage?: (data: any) => void

  /** 连接成功的回调函数 */
  onConnected?: () => void

  /** 连接断开的回调函数 */
  onDisconnected?: (code: number, reason: string) => void

  /** 连接错误的回调函数 */
  onError?: (error: any) => void
}
```

**使用示例:**

```typescript
import { useWebSocket, type UseWebSocketOptions } from '@/composables/useWebSocket'

const options: UseWebSocketOptions = {
  maxRetries: 5,
  baseDelay: 2,
  heartbeatInterval: 15000,
  onMessage: (data) => {
    console.log('收到消息:', data)
  },
  onConnected: () => {
    console.log('连接成功')
  },
  onDisconnected: (code, reason) => {
    console.log('连接断开:', code, reason)
  },
  onError: (error) => {
    console.error('连接错误:', error)
  },
}

const ws = useWebSocket('wss://example.com/ws', options)
```

### UseWebSocketReturn

`useWebSocket` 返回值类型。

```typescript
interface UseWebSocketReturn {
  /** 建立 WebSocket 连接 */
  connect: () => void

  /** 断开 WebSocket 连接 */
  disconnect: () => void

  /** 重新连接(重置重试计数) */
  reconnect: () => void

  /** 发送消息,返回是否成功 */
  send: (message: string | object) => boolean

  /** 连接状态 */
  status: Readonly<Ref<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>>

  /** 是否已连接 */
  isConnected: Readonly<ComputedRef<boolean>>

  /** 最后接收到的消息数据 */
  data: Readonly<Ref<any>>
}
```

**使用示例:**

```typescript
import { useWebSocket } from '@/composables/useWebSocket'

// 解构返回值
const {
  connect,
  disconnect,
  reconnect,
  send,
  status,
  isConnected,
  data,
} = useWebSocket('wss://example.com/ws')

// 类型推断
const statusValue: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' = status.value
const connected: boolean = isConnected.value
const lastMessage: any = data.value
```

### 完整类型导入示例

```typescript
import {
  // 主要函数
  useWebSocket,
  webSocket,

  // 枚举
  WSMessageType,

  // 接口
  type WSMessage,
  type NotificationData,
  type ChatMessageData,
  type MessageHandler,

  // 处理器类
  HeartbeatHandler,
  SystemNoticeHandler,
  MessagePipeline,
} from '@/composables/useWebSocket'

// 使用类型
const message: WSMessage = {
  type: WSMessageType.SYSTEM_NOTICE,
  data: {
    content: '系统通知',
  } as NotificationData,
  timestamp: Date.now(),
}

// 实现处理器
class CustomHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    console.log('处理消息:', message)
    return true
  }
}

// 使用全局管理器
webSocket.initialize()
webSocket.addMessageHandler(new CustomHandler())
webSocket.connect()
```

## 最佳实践

### 1. 统一使用全局 WebSocket 管理器

在应用中应该优先使用全局 WebSocket 管理器,而不是在多个组件中创建独立的 WebSocket 连接。

**为什么:**
- 避免资源浪费,减少服务器压力
- 统一管理连接状态
- 全局消息处理管道
- 避免消息重复处理

**推荐做法 ✅:**

```vue
<script lang="ts" setup>
import { webSocket } from '@/composables/useWebSocket'

onMounted(() => {
  // 初始化全局 WebSocket(如果未初始化)
  webSocket.initialize()

  // 连接
  webSocket.connect()

  // 发送消息
  webSocket.send({
    type: 'join_room',
    roomId: 'chat-001',
  })
})

onUnmounted(() => {
  // 不要断开连接,让其他组件继续使用
  // webSocket.disconnect() ❌
})
</script>
```

**不推荐做法 ❌:**

```vue
<script lang="ts" setup>
import { useWebSocket } from '@/composables/useWebSocket'

// 每个组件创建独立连接,浪费资源
const { connect, disconnect } = useWebSocket('wss://example.com/ws')

onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect() // 影响其他组件
})
</script>
```

**在应用入口初始化:**

```typescript
// App.vue 或 main.ts
import { webSocket } from '@/composables/useWebSocket'

onMounted(() => {
  // 在应用启动时初始化
  webSocket.initialize()
  webSocket.connect()
})
```

### 2. 使用消息处理器实现业务逻辑隔离

将不同类型的消息处理逻辑封装到独立的处理器类中,实现业务隔离和代码复用。

**为什么:**
- 职责单一,易于维护
- 可复用,可测试
- 支持动态添加/移除
- 错误隔离,不影响其他处理器

**推荐做法 ✅:**

```typescript
// handlers/OrderHandler.ts
import { type MessageHandler, type WSMessage } from '@/composables/useWebSocket'

export class OrderHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === 'order_update') {
      this.handleOrderUpdate(message.data)
      return false
    }

    if (message.type === 'order_cancel') {
      this.handleOrderCancel(message.data)
      return false
    }

    return true
  }

  private handleOrderUpdate(data: any) {
    const orderStore = useOrderStore()
    orderStore.updateOrder(data)

    // 显示通知
    uni.showToast({
      title: `订单 ${data.orderNo} 已更新`,
      icon: 'success',
    })
  }

  private handleOrderCancel(data: any) {
    const orderStore = useOrderStore()
    orderStore.cancelOrder(data.orderId)

    // 显示通知
    uni.showToast({
      title: `订单 ${data.orderNo} 已取消`,
      icon: 'none',
    })
  }
}

// App.vue
import { webSocket } from '@/composables/useWebSocket'
import { OrderHandler } from '@/handlers/OrderHandler'

onMounted(() => {
  webSocket.initialize()
  webSocket.addMessageHandler(new OrderHandler())
  webSocket.connect()
})
```

**不推荐做法 ❌:**

```typescript
// 在 onMessage 回调中处理所有业务逻辑
webSocket.initialize('wss://example.com/ws', {
  onMessage: (data) => {
    const message = JSON.parse(data)

    // 所有逻辑混在一起,难以维护
    if (message.type === 'order_update') {
      // 订单更新逻辑
      const orderStore = useOrderStore()
      orderStore.updateOrder(message.data)
      uni.showToast({ title: '订单已更新' })
    } else if (message.type === 'order_cancel') {
      // 订单取消逻辑
      const orderStore = useOrderStore()
      orderStore.cancelOrder(message.data.orderId)
      uni.showToast({ title: '订单已取消' })
    } else if (message.type === 'payment_success') {
      // 支付成功逻辑
      // ...
    }
    // 更多 if-else...
  },
})
```

### 3. 合理配置重连策略

根据应用场景合理配置重连参数,避免过度重试或重试不足。

**为什么:**
- 避免服务器压力过大
- 提高用户体验
- 减少无效重试
- 节省客户端资源

**推荐配置:**

**高频实时应用(聊天、直播):**

```typescript
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 10, // 更多重试次数
  baseDelay: 2, // 更短的基础延迟
  heartbeatInterval: 15000, // 更频繁的心跳(15秒)
})

// 重连序列: 2s → 4s → 8s → 16s → 32s → 64s → 128s → 256s → 512s → 1024s
```

**普通应用(通知、消息推送):**

```typescript
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 8, // 默认重试次数
  baseDelay: 3, // 默认基础延迟
  heartbeatInterval: 30000, // 默认心跳(30秒)
})

// 重连序列: 3s → 6s → 12s → 24s → 48s → 96s → 192s → 384s
```

**低频应用(后台同步、状态监控):**

```typescript
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 5, // 较少重试次数
  baseDelay: 5, // 较长的基础延迟
  heartbeatInterval: 60000, // 较长的心跳(60秒)
})

// 重连序列: 5s → 10s → 20s → 40s → 80s
```

**不推荐 ❌:**

```typescript
// 过于激进,可能导致服务器压力
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 999,
  baseDelay: 0.5, // 太短
  heartbeatInterval: 1000, // 太频繁
})

// 过于保守,用户体验差
webSocket.initialize('wss://example.com/ws', {
  maxRetries: 1,
  baseDelay: 60, // 太长
  heartbeatInterval: 300000, // 5分钟才心跳一次
})
```

### 4. 优雅处理连接状态变化

监听连接状态变化,提供友好的用户反馈和错误处理。

**为什么:**
- 提升用户体验
- 及时发现网络问题
- 引导用户操作
- 减少用户疑惑

**推荐做法 ✅:**

```vue
<template>
  <view class="page">
    <!-- 连接状态指示器 -->
    <view v-if="!isConnected" class="connection-banner">
      <text v-if="isConnecting">正在连接...</text>
      <text v-else-if="isDisconnected">
        连接已断开,{{ retryInfo }}
      </text>
      <wd-button v-if="isDisconnected" size="small" @click="handleReconnect">
        重新连接
      </wd-button>
    </view>

    <!-- 页面内容 -->
    <view class="content">
      <!-- ... -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { webSocket } from '@/composables/useWebSocket'

// 连接状态
const status = computed(() => webSocket.status)
const isConnected = computed(() => webSocket.isConnected)
const isConnecting = computed(() => status.value === 'CONNECTING')
const isDisconnected = computed(() => status.value === 'CLOSED')

// 重试信息
const retryCount = ref(0)
const maxRetries = 8

const retryInfo = computed(() => {
  if (retryCount.value >= maxRetries) {
    return '连接失败,请检查网络'
  }
  return `${retryCount.value}/${maxRetries} 次重试`
})

// 监听状态变化
watch(status, (newStatus, oldStatus) => {
  console.log('连接状态变化:', oldStatus, '→', newStatus)

  if (newStatus === 'OPEN') {
    retryCount.value = 0
    uni.showToast({ title: '连接成功', icon: 'success' })
  } else if (newStatus === 'CLOSED' && oldStatus === 'OPEN') {
    retryCount.value++
    uni.showToast({ title: '连接断开', icon: 'error' })
  }
})

// 重新连接
const handleReconnect = () => {
  retryCount.value = 0
  webSocket.reconnect()
}

// 初始化
onMounted(() => {
  webSocket.initialize()
  webSocket.connect()
})
</script>

<style lang="scss" scoped>
.connection-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16rpx 32rpx;
  background: #ff9800;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 9999;

  text {
    font-size: 28rpx;
  }
}

.content {
  padding-top: 100rpx; /* 避免被 banner 遮挡 */
}
</style>
```

**不推荐做法 ❌:**

```vue
<script lang="ts" setup>
// 没有状态监听,用户不知道发生了什么
const { connect } = useWebSocket('wss://example.com/ws')

onMounted(() => {
  connect()
  // 没有任何反馈
})
</script>
```

### 5. 在发送消息前检查连接状态

发送消息前始终检查连接状态,避免消息丢失。

**为什么:**
- 避免消息丢失
- 提供用户反馈
- 优化用户体验
- 支持消息队列

**推荐做法 ✅:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { webSocket } from '@/composables/useWebSocket'

// 消息队列(可选)
const messageQueue = ref<any[]>([])

// 发送消息
const sendMessage = (message: any) => {
  if (!webSocket.isConnected) {
    // 提示用户
    uni.showToast({
      title: '连接已断开,消息将在重连后发送',
      icon: 'none',
    })

    // 加入队列
    messageQueue.value.push(message)
    return false
  }

  const success = webSocket.send(message)

  if (!success) {
    uni.showToast({ title: '发送失败', icon: 'error' })
    return false
  }

  return true
}

// 监听连接成功,发送队列中的消息
watch(
  () => webSocket.isConnected,
  (connected) => {
    if (connected && messageQueue.value.length > 0) {
      // 发送队列中的消息
      messageQueue.value.forEach((msg) => {
        webSocket.send(msg)
      })

      // 清空队列
      messageQueue.value = []

      uni.showToast({ title: '已发送待发消息', icon: 'success' })
    }
  },
)

// 发送聊天消息
const handleSendChat = () => {
  const message = {
    type: 'chat_message',
    content: '你好',
    timestamp: Date.now(),
  }

  sendMessage(message)
}
</script>
```

**不推荐做法 ❌:**

```vue
<script lang="ts" setup>
import { webSocket } from '@/composables/useWebSocket'

// 直接发送,不检查状态
const handleSend = () => {
  webSocket.send({
    type: 'message',
    content: 'Hello',
  })
  // 没有检查是否成功
  // 没有错误处理
  // 消息可能丢失
}
</script>
```

**带重试机制的发送:**

```typescript
// 发送消息(带重试)
const sendWithRetry = async (message: any, maxRetries = 3): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    if (webSocket.isConnected) {
      const success = webSocket.send(message)
      if (success) {
        return true
      }
    }

    // 等待连接
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // 重试失败
  uni.showToast({
    title: '发送失败,请稍后重试',
    icon: 'error',
  })

  return false
}

// 使用
await sendWithRetry({
  type: 'message',
  content: 'Important message',
})
```

## 常见问题

### 1. WebSocket 连接失败怎么办?

**问题表现:**
- 控制台显示 "WebSocket连接错误"
- 连接状态一直是 `CLOSED`
- 自动重连也失败

**可能原因:**

1. **服务器地址错误**
   - URL 格式不正确
   - 协议错误(http → ws, https → wss)
   - 端口号错误

2. **网络问题**
   - 设备网络未连接
   - 防火墙阻止连接
   - 代理设置问题

3. **服务器问题**
   - 服务器未启动
   - 服务器拒绝连接
   - 超过最大连接数

4. **认证问题**
   - Token 过期或无效
   - 未登录
   - 权限不足

**解决方案:**

```typescript
// 1. 检查 URL 格式
const url = 'wss://example.com/ws' // ✅ 正确
// const url = 'ws://example.com:80/ws' // ❌ HTTPS 下不能使用 WS

// 2. 添加错误处理
webSocket.initialize('wss://example.com/ws', {
  onError: (error) => {
    console.error('连接错误:', error)

    // 检查网络连接
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
    console.log('断开连接:', code, reason)

    // 根据关闭码判断原因
    if (code === 1006) {
      console.log('连接异常关闭,可能是网络问题')
    } else if (code === 1008) {
      console.log('策略违规,可能是认证失败')
    } else if (code === 1011) {
      console.log('服务器错误')
    }
  },
})

// 3. 检查 Token
const { getToken } = useToken()
const token = getToken()

if (!token) {
  console.error('未找到 Token,请先登录')
  uni.reLaunch({ url: '/pages/login/index' })
}

// 4. 测试服务器连接
uni.request({
  url: 'https://example.com/api/health',
  success: (res) => {
    console.log('服务器正常:', res.data)
    // 服务器正常,尝试连接 WebSocket
    webSocket.connect()
  },
  fail: (err) => {
    console.error('服务器无法访问:', err)
    uni.showToast({ title: '服务器无法访问', icon: 'error' })
  },
})
```

### 2. 消息发送后没有响应怎么办?

**问题表现:**
- 调用 `send()` 返回 `true`,但服务器没有响应
- 其他用户收不到消息
- 没有错误提示

**可能原因:**

1. **连接已断开**
   - 网络波动导致连接断开
   - 心跳超时
   - 服务器主动断开

2. **消息格式错误**
   - JSON 格式不正确
   - 缺少必要字段
   - 字段类型不匹配

3. **服务器处理失败**
   - 服务器业务逻辑错误
   - 服务器未处理该类型消息
   - 权限验证失败

4. **消息丢失**
   - 网络拥堵
   - 缓冲区满
   - 消息过大

**解决方案:**

```typescript
// 1. 发送前检查连接状态
const sendSafeMessage = (message: any) => {
  // 检查连接
  if (!webSocket.isConnected) {
    console.error('连接未建立')
    uni.showToast({ title: '未连接到服务器', icon: 'error' })
    return false
  }

  // 验证消息格式
  if (!message.type) {
    console.error('消息缺少 type 字段')
    return false
  }

  // 发送消息
  const success = webSocket.send(message)

  if (success) {
    console.log('消息已发送:', message)
  } else {
    console.error('消息发送失败')
  }

  return success
}

// 2. 添加消息确认机制
const pendingMessages = new Map<string, any>()

const sendWithConfirmation = (message: any, timeout = 5000) => {
  // 生成消息 ID
  const messageId = `msg-${Date.now()}-${Math.random()}`
  message.id = messageId

  // 发送消息
  const success = webSocket.send(message)

  if (!success) {
    return Promise.reject(new Error('发送失败'))
  }

  // 等待确认
  return new Promise((resolve, reject) => {
    // 保存待确认消息
    pendingMessages.set(messageId, {
      message,
      resolve,
      reject,
    })

    // 超时处理
    setTimeout(() => {
      if (pendingMessages.has(messageId)) {
        pendingMessages.delete(messageId)
        reject(new Error('消息确认超时'))
      }
    }, timeout)
  })
}

// 处理服务器确认消息
webSocket.initialize('wss://example.com/ws', {
  onMessage: (data) => {
    const message = JSON.parse(data)

    // 检查是否是确认消息
    if (message.type === 'ack' && message.messageId) {
      const pending = pendingMessages.get(message.messageId)

      if (pending) {
        pending.resolve(message)
        pendingMessages.delete(message.messageId)
      }
    }
  },
})

// 使用
try {
  await sendWithConfirmation({
    type: 'chat_message',
    content: 'Hello',
  })
  console.log('消息已确认')
} catch (error) {
  console.error('消息未确认:', error)
  uni.showToast({ title: '消息发送失败', icon: 'error' })
}

// 3. 检查消息大小
const MAX_MESSAGE_SIZE = 64 * 1024 // 64KB

const sendLargeMessage = (message: any) => {
  const data = JSON.stringify(message)

  if (data.length > MAX_MESSAGE_SIZE) {
    console.error('消息过大:', data.length, 'bytes')
    uni.showToast({ title: '消息过大,请分割发送', icon: 'error' })
    return false
  }

  return webSocket.send(message)
}
```

### 3. 为什么会收到重复消息?

**问题表现:**
- 同一条消息收到多次
- 消息处理器被多次调用
- 重复的通知弹窗

**可能原因:**

1. **多个 WebSocket 实例**
   - 在多个组件中创建了独立连接
   - 未使用全局管理器
   - 重复初始化

2. **消息处理器重复添加**
   - 组件多次挂载时重复添加处理器
   - 未清理旧的处理器
   - 同一处理器被添加多次

3. **服务器重复推送**
   - 服务器端bug
   - 订阅了多次
   - 未正确去重

4. **消息ID未检查**
   - 未使用消息ID去重
   - 消息缓存未清理

**解决方案:**

```typescript
// 1. 使用全局管理器(推荐)
// App.vue - 只初始化一次
onMounted(() => {
  webSocket.initialize()
  webSocket.connect()
})

// 组件中直接使用
// pages/chat/index.vue
const handleMessage = () => {
  // 不要重新初始化
  // 直接使用全局实例
  webSocket.send({ type: 'chat', content: '你好' })
}

// 2. 防止处理器重复添加
class ChatHandler implements MessageHandler {
  private static instance: ChatHandler | null = null

  static getInstance(): ChatHandler {
    if (!ChatHandler.instance) {
      ChatHandler.instance = new ChatHandler()
    }
    return ChatHandler.instance
  }

  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.CHAT_MESSAGE) {
      console.log('处理聊天消息:', message)
      return false
    }
    return true
  }
}

// 只添加一次
onMounted(() => {
  // 检查是否已添加
  const handlers = webSocket.getMessageHandlers()
  if (!handlers.includes('ChatHandler')) {
    webSocket.addMessageHandler(ChatHandler.getInstance())
  }
})

// 3. 使用消息ID去重
const processedMessageIds = new Set<string>()
const MAX_CACHE_SIZE = 1000

class DeduplicateHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    // 检查消息ID
    if (message.id) {
      if (processedMessageIds.has(message.id)) {
        console.log('重复消息,已忽略:', message.id)
        return false // 阻止继续处理
      }

      // 记录消息ID
      processedMessageIds.add(message.id)

      // 限制缓存大小
      if (processedMessageIds.size > MAX_CACHE_SIZE) {
        const firstId = processedMessageIds.values().next().value
        processedMessageIds.delete(firstId)
      }
    }

    return true // 继续传播
  }
}

// 将去重处理器添加到管道最前面
webSocket.addMessageHandler(new DeduplicateHandler())

// 4. 组件卸载时移除处理器(可选)
onUnmounted(() => {
  // 如果处理器是组件级别的,卸载时移除
  webSocket.removeMessageHandler(ChatHandler)
})
```

### 4. 如何调试 WebSocket 通信?

**问题表现:**
- 不清楚消息发送和接收情况
- 不知道连接状态变化
- 难以排查问题

**解决方案:**

```typescript
// 1. 启用详细日志
const DEBUG = true // 开发环境设为 true

class DebugHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (DEBUG) {
      console.group('📨 WebSocket 消息')
      console.log('类型:', message.type)
      console.log('数据:', message.data)
      console.log('时间:', new Date(message.timestamp).toLocaleString())
      console.log('ID:', message.id)
      console.groupEnd()
    }

    return true // 继续传播
  }
}

// 添加到管道最前面
webSocket.addMessageHandler(new DebugHandler())

// 2. 监控连接状态
const statusHistory = ref<
  Array<{
    status: string
    timestamp: number
    reason?: string
  }>
>([])

watch(
  () => webSocket.status,
  (newStatus, oldStatus) => {
    const record = {
      status: `${oldStatus} → ${newStatus}`,
      timestamp: Date.now(),
    }

    statusHistory.value.push(record)

    if (DEBUG) {
      console.log('连接状态变化:', record)
    }
  },
)

// 3. 记录发送的消息
const sentMessages = ref<any[]>([])

const debugSend = (message: any) => {
  const record = {
    message,
    timestamp: Date.now(),
    success: false,
  }

  const success = webSocket.send(message)
  record.success = success

  sentMessages.value.push(record)

  if (DEBUG) {
    console.log('发送消息:', record)
  }

  return success
}

// 4. 使用 Chrome DevTools
// 在 H5 平台,可以使用浏览器开发者工具
// Network → WS → 查看 WebSocket 通信详情

// 5. 创建调试面板
const showDebugPanel = () => {
  const info = {
    状态: webSocket.status,
    是否连接: webSocket.isConnected,
    最后消息: webSocket.lastMessage,
    处理器列表: webSocket.getMessageHandlers(),
    发送消息数: sentMessages.value.length,
    接收消息数: processedMessageIds.size,
    状态历史: statusHistory.value,
  }

  console.table(info)
  uni.showModal({
    title: 'WebSocket 调试信息',
    content: JSON.stringify(info, null, 2),
    showCancel: false,
  })
}

// 在页面添加调试按钮
// <wd-button @click="showDebugPanel">调试信息</wd-button>
```

### 5. 如何在小程序中使用 WebSocket?

**问题表现:**
- 小程序中连接失败
- 报错 "不支持 WebSocket"
- 功能异常

**注意事项:**

1. **域名必须备案并配置**
   - 微信小程序:在小程序管理后台配置 WebSocket 域名
   - 必须使用 `wss://` 协议(HTTPS)
   - 域名必须通过 ICP 备案

2. **并发连接限制**
   - 微信小程序:同时最多 5 个 WebSocket 连接
   - 支付宝小程序:同时最多 2 个
   - 建议使用全局单例管理器

3. **权限配置**
   - 在 `manifest.json` 中配置网络权限
   - 添加 WebSocket 域名到白名单

**解决方案:**

```json
// manifest.json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    },
    "requiredBackgroundModes": ["audio"],
    "usingComponents": true,
    "permission": {
      "scope.userInfo": {
        "desc": "用于完善用户资料"
      }
    },
    "h5": {
      "devServer": {
        "https": false
      }
    }
  },
  "h5": {
    "sdkConfigs": {
      "maps": {}
    },
    "router": {
      "mode": "hash"
    },
    "devServer": {
      "https": false
    }
  }
}
```

```typescript
// 检测平台
const platform = ref('')

onMounted(() => {
  // #ifdef MP-WEIXIN
  platform.value = '微信小程序'
  // #endif

  // #ifdef H5
  platform.value = 'H5'
  // #endif

  // #ifdef APP-PLUS
  platform.value = 'App'
  // #endif

  console.log('当前平台:', platform.value)

  // 初始化 WebSocket
  webSocket.initialize()
  webSocket.connect()
})

// 处理小程序限制
const checkWebSocketLimit = () => {
  // 微信小程序最多5个连接
  // 确保使用全局管理器,只创建一个连接
  if (platform.value === '微信小程序') {
    console.log('使用全局 WebSocket 管理器')
    webSocket.initialize()
  }
}

// 后台切换处理
onHide(() => {
  // 小程序进入后台,保持连接
  console.log('应用进入后台')
  // 不断开连接,让心跳保持
})

onShow(() => {
  // 小程序回到前台,检查连接
  console.log('应用回到前台')

  if (!webSocket.isConnected) {
    console.log('连接已断开,重新连接')
    webSocket.reconnect()
  }
})

// 网络状态监听
uni.onNetworkStatusChange((res) => {
  console.log('网络状态变化:', res)

  if (res.isConnected) {
    // 网络恢复,重新连接
    if (!webSocket.isConnected) {
      webSocket.reconnect()
    }
  } else {
    // 网络断开
    uni.showToast({ title: '网络已断开', icon: 'error' })
  }
})
```

**微信小程序配置步骤:**

1. 登录微信公众平台
2. 进入"开发" → "开发设置"
3. 找到"服务器域名"
4. 在"socket合法域名"中添加 WebSocket 服务器域名
5. 域名格式: `wss://your-domain.com`
6. 保存后等待生效(可能需要几分钟)

**测试工具域名(仅开发):**

```typescript
// 开发环境不校验域名
// 在微信开发者工具中:详情 → 本地设置 → 不校验合法域名
// 仅用于开发测试,正式版本必须配置合法域名

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  console.log('开发模式,跳过域名校验')
}
```