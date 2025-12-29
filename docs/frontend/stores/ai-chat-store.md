# useAiChatStore AI 对话状态管理

## 介绍

`useAiChatStore` 是基于 Pinia 的 AI 聊天数据管理模块，提供统一的会话管理和消息处理功能。该模块封装了与后端 AI 服务进行实时通信的完整逻辑，支持多会话管理、流式响应处理和消息状态追踪。

**核心特性：**

- **会话管理** - 支持创建、切换、删除会话，会话数据持久化存储
- **消息管理** - 完整的消息发送、接收、状态追踪功能
- **流式响应** - 支持 WebSocket 流式响应，实时显示 AI 生成内容
- **多会话支持** - 使用 Map 结构存储多个独立会话，支持快速切换
- **状态追踪** - 消息状态（发送中、生成中、完成、错误）全程追踪
- **Token 统计** - 自动记录每次对话的 Token 使用情况

## 基础用法

### 初始化和创建会话

```vue
<template>
  <div class="ai-chat">
    <!-- 会话列表 -->
    <div class="session-list">
      <div
        v-for="session in sessionList"
        :key="session.id"
        :class="['session-item', { active: session.id === currentSessionId }]"
        @click="switchSession(session.id)"
      >
        {{ session.title }}
      </div>
      <el-button @click="handleCreateSession">新建会话</el-button>
    </div>

    <!-- 消息区域 -->
    <div class="message-area">
      <div v-for="msg in currentMessages" :key="msg.id" :class="['message', msg.role]">
        <div class="content">{{ msg.content }}</div>
        <div v-if="msg.status === 'streaming'" class="typing-indicator">...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()

// 计算属性
const sessionList = computed(() => aiChatStore.sessionList)
const currentSessionId = computed(() => aiChatStore.currentSessionId)
const currentMessages = computed(() => aiChatStore.currentMessages)

// 创建新会话
const handleCreateSession = () => {
  aiChatStore.createSession({
    title: '新对话',
    provider: 'deepseek',
    modelName: 'deepseek-chat'
  })
}

// 切换会话
const switchSession = (sessionId: string) => {
  aiChatStore.switchSession(sessionId)
}
</script>
```

### 发送消息

```vue
<template>
  <div class="chat-input">
    <el-input
      v-model="inputMessage"
      type="textarea"
      :rows="3"
      placeholder="输入消息..."
      :disabled="isGenerating"
      @keydown.enter.ctrl="handleSend"
    />
    <el-button
      type="primary"
      :loading="isGenerating"
      :disabled="!inputMessage.trim()"
      @click="handleSend"
    >
      {{ isGenerating ? '生成中...' : '发送' }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()
const inputMessage = ref('')

const isGenerating = computed(() => aiChatStore.isGenerating)

const handleSend = () => {
  if (!inputMessage.value.trim() || isGenerating.value) return

  const success = aiChatStore.sendMessage(inputMessage.value, {
    temperature: 0.7,
    systemPrompt: '你是一个专业的 AI 助手'
  })

  if (success) {
    inputMessage.value = ''
  }
}
</script>
```

### 处理 WebSocket 回调

AI 对话通过 WebSocket 实现流式响应，需要处理以下回调：

```typescript
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()

// WebSocket 消息处理器
const handleWebSocketMessage = (data: any) => {
  const { type, sessionId, messageId, content, tokenUsage, error } = data

  switch (type) {
    case 'chat_start':
      // 聊天开始
      aiChatStore.onChatStart(sessionId, messageId)
      break

    case 'chat_chunk':
      // 接收流式内容片段
      aiChatStore.appendStreamContent(sessionId, messageId, content)
      break

    case 'chat_complete':
      // 聊天完成
      aiChatStore.onChatComplete(sessionId, messageId, tokenUsage)
      break

    case 'chat_error':
      // 聊天错误
      aiChatStore.onChatError(sessionId, error)
      break
  }
}
```

## 会话管理

### 创建会话

```typescript
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()

// 创建默认会话
const sessionId = aiChatStore.createSession()

// 创建自定义配置的会话
const customSessionId = aiChatStore.createSession({
  title: 'GPT-4 对话',
  provider: 'openai',
  modelName: 'gpt-4'
})

console.log('新会话 ID:', sessionId)
```

### 切换会话

```typescript
// 切换到指定会话
const success = aiChatStore.switchSession('session_123456')

if (success) {
  console.log('切换成功')
} else {
  console.log('会话不存在')
}
```

### 删除会话

```typescript
// 删除指定会话
const deleted = aiChatStore.deleteSession('session_123456')

if (deleted) {
  console.log('删除成功')
  // 如果删除的是当前会话，会自动切换到下一个会话
}
```

### 清空所有会话

```typescript
// 清空所有会话数据
aiChatStore.clearAllSessions()
```

### 更新会话标题

```typescript
// 更新会话标题
aiChatStore.updateSessionTitle('session_123456', '关于 Vue 3 的讨论')
```

## 消息管理

### 发送消息选项

```typescript
aiChatStore.sendMessage('你好，请介绍一下自己', {
  // 指定会话 ID（可选，默认使用当前会话）
  sessionId: 'session_123456',

  // 模型提供商
  provider: 'deepseek',

  // 模型名称
  modelName: 'deepseek-chat',

  // 系统提示词
  systemPrompt: '你是一个专业的技术顾问',

  // 温度参数
  temperature: 0.7,

  // 最大 Token 数
  maxTokens: 2000
})
```

### 重新生成

```typescript
// 重新生成最后一条 AI 回复
const success = aiChatStore.regenerateLastMessage()

if (!success) {
  console.log('重新生成失败：没有可重新生成的消息')
}
```

### 消息状态

消息有以下几种状态：

| 状态 | 说明 |
|------|------|
| `sending` | 消息发送中，等待服务器响应 |
| `streaming` | AI 正在生成回复，流式接收中 |
| `complete` | 消息生成完成 |
| `error` | 发生错误 |

```vue
<template>
  <div class="message" :class="message.status">
    <div class="content">{{ message.content }}</div>

    <!-- 发送中状态 -->
    <div v-if="message.status === 'sending'" class="status">
      <el-icon class="is-loading"><Loading /></el-icon>
      发送中...
    </div>

    <!-- 生成中状态 -->
    <div v-if="message.status === 'streaming'" class="status">
      <span class="typing-cursor">|</span>
    </div>

    <!-- 错误状态 -->
    <div v-if="message.status === 'error'" class="status error">
      <el-icon><Warning /></el-icon>
      {{ message.error }}
    </div>

    <!-- 完成状态显示 Token 信息 -->
    <div v-if="message.status === 'complete' && message.tokenUsage" class="token-info">
      Token: {{ message.tokenUsage.totalTokens }}
    </div>
  </div>
</template>
```

## API

### State

| 状态 | 类型 | 说明 |
|------|------|------|
| sessions | `Ref<Map<string, AiChatSession>>` | 所有会话的 Map 集合 |
| currentSessionId | `Ref<string \| null>` | 当前活跃会话 ID |
| streamingMessageId | `Ref<string \| null>` | 当前正在流式生成的消息 ID |

### Getters

| 计算属性 | 类型 | 说明 |
|----------|------|------|
| currentSession | `ComputedRef<AiChatSession \| null>` | 当前会话对象 |
| currentMessages | `ComputedRef<AiChatMessage[]>` | 当前会话的消息列表 |
| isGenerating | `ComputedRef<boolean>` | 是否正在生成中 |
| sessionList | `ComputedRef<AiChatSession[]>` | 所有会话列表（按更新时间倒序） |

### Actions

#### createSession

创建新会话。

```typescript
function createSession(options?: {
  title?: string
  provider?: string
  modelName?: string
}): string
```

| 参数 | 类型 | 说明 |
|------|------|------|
| options.title | `string` | 会话标题，默认为 "新对话 + 时间" |
| options.provider | `string` | 模型提供商，默认 `'deepseek'` |
| options.modelName | `string` | 模型名称，默认 `'deepseek-chat'` |

**返回值：** 新创建的会话 ID

#### switchSession

切换到指定会话。

```typescript
function switchSession(sessionId: string): boolean
```

**返回值：** 是否切换成功

#### deleteSession

删除指定会话。

```typescript
function deleteSession(sessionId: string): boolean
```

**返回值：** 是否删除成功

#### clearAllSessions

清空所有会话。

```typescript
function clearAllSessions(): void
```

#### updateSessionTitle

更新会话标题。

```typescript
function updateSessionTitle(sessionId: string, title: string): boolean
```

**返回值：** 是否更新成功

#### sendMessage

发送消息到 AI。

```typescript
function sendMessage(
  content: string,
  options?: {
    sessionId?: string
    provider?: string
    modelName?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }
): boolean
```

**返回值：** 是否发送成功

#### onChatStart

WebSocket 回调：聊天开始。

```typescript
function onChatStart(sessionId: string, messageId?: string): void
```

#### appendStreamContent

WebSocket 回调：追加流式内容。

```typescript
function appendStreamContent(sessionId: string, messageId: string, content: string): void
```

#### onChatComplete

WebSocket 回调：聊天完成。

```typescript
function onChatComplete(
  sessionId: string,
  messageId: string,
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
): void
```

#### onChatError

WebSocket 回调：聊天错误。

```typescript
function onChatError(sessionId: string, error: string): void
```

#### regenerateLastMessage

重新生成最后一条消息。

```typescript
function regenerateLastMessage(): boolean
```

**返回值：** 是否重新生成成功

### 类型定义

```typescript
/**
 * AI 聊天消息接口
 */
interface AiChatMessage {
  /** 消息唯一标识 */
  id: string
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system'
  /** 消息内容 */
  content: string
  /** 消息时间戳 */
  timestamp: number
  /** Token 使用情况 */
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  /** 引用的文档列表 */
  references?: any[]
  /** 消息状态 */
  status?: 'sending' | 'streaming' | 'complete' | 'error'
  /** 错误信息 */
  error?: string
}

/**
 * AI 聊天会话接口
 */
interface AiChatSession {
  /** 会话唯一标识 */
  id: string
  /** 会话标题 */
  title: string
  /** 消息列表 */
  messages: AiChatMessage[]
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 模型提供商 */
  provider?: string
  /** 模型名称 */
  modelName?: string
}
```

## 最佳实践

### 1. 初始化时创建默认会话

```typescript
import { onMounted } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()

onMounted(() => {
  // 如果没有会话，创建一个默认会话
  if (aiChatStore.sessionList.length === 0) {
    aiChatStore.createSession({
      title: '新对话',
      provider: 'deepseek'
    })
  }
})
```

### 2. 自动滚动到最新消息

```vue
<template>
  <div ref="messageContainer" class="message-container">
    <div v-for="msg in currentMessages" :key="msg.id" class="message">
      {{ msg.content }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()
const messageContainer = ref<HTMLElement>()

// 监听消息变化，自动滚动
watch(
  () => aiChatStore.currentMessages,
  async () => {
    await nextTick()
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  },
  { deep: true }
)
</script>
```

### 3. 处理网络断开

```typescript
import { watch } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'
import { useWebSocket } from '@/composables/useWebSocket'

const aiChatStore = useAiChatStore()
const { connected } = useWebSocket()

// 监听 WebSocket 连接状态
watch(connected, (isConnected) => {
  if (!isConnected && aiChatStore.isGenerating) {
    // 连接断开时，标记当前生成的消息为错误
    const session = aiChatStore.currentSession
    if (session) {
      aiChatStore.onChatError(session.id, '网络连接已断开')
    }
  }
})
```

### 4. 会话数据持久化

```typescript
import { watch } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()
const STORAGE_KEY = 'ai_chat_sessions'

// 加载保存的会话
const loadSessions = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      // 恢复会话数据
      data.forEach((session: any) => {
        aiChatStore.sessions.set(session.id, session)
      })
      if (data.length > 0) {
        aiChatStore.switchSession(data[0].id)
      }
    } catch (e) {
      console.error('加载会话失败:', e)
    }
  }
}

// 保存会话
watch(
  () => aiChatStore.sessionList,
  (sessions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  },
  { deep: true }
)
```

### 5. 限制会话数量

```typescript
const MAX_SESSIONS = 20

const createSessionWithLimit = (options?: any) => {
  const aiChatStore = useAiChatStore()

  // 检查会话数量
  if (aiChatStore.sessionList.length >= MAX_SESSIONS) {
    // 删除最旧的会话
    const oldestSession = aiChatStore.sessionList[aiChatStore.sessionList.length - 1]
    aiChatStore.deleteSession(oldestSession.id)
  }

  return aiChatStore.createSession(options)
}
```

## 常见问题

### 1. 消息没有实时更新

**问题原因：**
- WebSocket 回调未正确处理
- 响应式更新未触发

**解决方案：**

```typescript
// 确保正确调用回调方法
const handleWebSocketMessage = (data: any) => {
  const aiChatStore = useAiChatStore()

  switch (data.type) {
    case 'chat_chunk':
      // 确保传入正确的参数
      aiChatStore.appendStreamContent(
        data.sessionId,
        data.messageId,
        data.content
      )
      break
  }
}

// Store 内部使用强制更新确保响应式
const appendStreamContent = (sessionId: string, messageId: string, content: string) => {
  const session = sessions.value.get(sessionId)
  if (!session) return

  // 找到消息并更新
  const message = session.messages.find(m => m.id === messageId)
  if (message) {
    message.content += content

    // 强制触发响应式更新
    sessions.value.set(sessionId, { ...session })
  }
}
```

### 2. 会话切换后消息丢失

**问题原因：**
- 会话 ID 不正确
- Map 存储问题

**解决方案：**

```typescript
// 确保会话存在后再切换
const safeSwitch = (sessionId: string) => {
  const aiChatStore = useAiChatStore()

  if (!aiChatStore.sessions.has(sessionId)) {
    console.error('会话不存在:', sessionId)
    return false
  }

  return aiChatStore.switchSession(sessionId)
}
```

### 3. 重复发送消息

**问题原因：**
- 用户快速多次点击发送按钮
- 未检查生成状态

**解决方案：**

```typescript
const handleSend = () => {
  const aiChatStore = useAiChatStore()

  // 检查是否正在生成
  if (aiChatStore.isGenerating) {
    ElMessage.warning('请等待当前回复完成')
    return
  }

  // 检查消息内容
  if (!inputMessage.value.trim()) {
    return
  }

  aiChatStore.sendMessage(inputMessage.value)
  inputMessage.value = ''
}
```

### 4. WebSocket 未连接

**问题原因：**
- WebSocket 连接断开
- 未初始化 WebSocket

**解决方案：**

```typescript
import { useWebSocket } from '@/composables/useWebSocket'

const { connected, connect } = useWebSocket()

const sendWithCheck = (message: string) => {
  const aiChatStore = useAiChatStore()

  if (!connected.value) {
    ElMessage.error('网络未连接，正在重连...')
    connect()
    return false
  }

  return aiChatStore.sendMessage(message)
}
```

### 5. Token 统计不准确

**问题原因：**
- 后端未返回 Token 信息
- 回调处理遗漏

**解决方案：**

```typescript
// 确保在完成回调中处理 tokenUsage
const onChatComplete = (sessionId: string, messageId: string, tokenUsage?: any) => {
  const session = sessions.value.get(sessionId)
  if (!session) return

  const message = session.messages.find(m => m.id === messageId)
  if (message) {
    message.status = 'complete'

    // 记录 Token 使用情况
    if (tokenUsage) {
      message.tokenUsage = {
        promptTokens: tokenUsage.promptTokens || 0,
        completionTokens: tokenUsage.completionTokens || 0,
        totalTokens: tokenUsage.totalTokens || 0
      }
    }
  }
}
```
