# Feature 功能状态

## 介绍

`useFeatureStore` 是 RuoYi-Plus-UniApp 移动端的系统功能开关管理模块，用于从服务器获取并管理系统功能的启用状态。通过功能开关可以动态控制应用中的高级功能模块，如 AI 对话、WebSocket 实时通信、SSE 服务端推送等。

功能开关模式是现代应用架构中的重要设计模式，它允许在不修改代码、不重新部署的情况下，通过配置动态控制功能的可用性。这种模式特别适合以下场景：灰度发布新功能、A/B 测试、应急关闭问题功能、按租户定制功能等。

**核心特性:**

- **远程配置** - 从服务器动态获取功能开关状态，支持实时更新
- **按需启用** - 根据后端配置决定功能模块是否可用，减少不必要的资源加载
- **优雅降级** - 接口失败时使用默认值（全部禁用），确保应用正常运行
- **一次初始化** - 应用启动时加载配置，避免重复请求，提升性能
- **类型安全** - 完整的 TypeScript 类型支持，编译时检查功能名称
- **无需认证** - 功能配置接口不需要登录，应用启动时即可获取

## 架构设计

### Store 结构图

```text
┌─────────────────────────────────────────────────────────────────┐
│                      useFeatureStore                             │
├─────────────────────────────────────────────────────────────────┤
│  State (响应式状态)                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  features: Ref<SystemFeature>                               ││
│  │  ├── langchain4jEnabled: boolean (AI功能)                   ││
│  │  ├── websocketEnabled: boolean (WebSocket功能)              ││
│  │  └── sseEnabled: boolean (SSE功能)                          ││
│  │                                                              ││
│  │  initialized: Ref<boolean> (初始化标记)                      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Methods (方法)                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  initFeatures(): Promise<void>                              ││
│  │  ├── 检查是否已初始化（幂等性保护）                          ││
│  │  ├── 调用 API 获取功能配置                                  ││
│  │  ├── 更新 features 状态                                     ││
│  │  └── 标记初始化完成                                         ││
│  │                                                              ││
│  │  isFeatureEnabled(name: keyof SystemFeature): boolean       ││
│  │  └── 检查指定功能是否启用                                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 初始化流程图

```text
┌─────────────────┐
│   App.vue       │
│   onLaunch      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ featureStore.   │
│ initFeatures()  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     已初始化
│ initialized?    │────────────────────┐
└────────┬────────┘                    │
         │ 否                          │
         ▼                             │
┌─────────────────┐                    │
│ getSystemFeatures()                  │
│ GET /common/system/features          │
└────────┬────────┘                    │
         │                             │
    ┌────┴────┐                        │
    │         │                        │
    ▼         ▼                        │
┌──────┐  ┌──────────┐                 │
│ 成功 │  │ 失败     │                 │
└───┬──┘  └────┬─────┘                 │
    │          │                       │
    ▼          ▼                       │
┌────────┐ ┌────────────┐              │
│更新    │ │使用默认值  │              │
│features│ │(全部禁用)  │              │
└───┬────┘ └─────┬──────┘              │
    │            │                     │
    └─────┬──────┘                     │
          ▼                            │
   ┌──────────────┐                    │
   │ initialized  │◄───────────────────┘
   │ = true       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ initializeApp│
   │ (继续初始化) │
   └──────────────┘
```

### 后端配置架构

```text
┌─────────────────────────────────────────────────────────────────┐
│                 SystemFeatureController                          │
│                 /common/system/features                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  @Autowired LangChain4jProperties ──► langchain4jEnabled        │
│  @Autowired WebSocketProperties   ──► websocketEnabled          │
│  @Autowired SseProperties         ──► sseEnabled                │
│  @Autowired OpenApiProperties     ──► openApiEnabled (扩展)     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      配置文件 (application.yml)                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  langchain4j:                                               ││
│  │    enabled: true                                            ││
│  │                                                              ││
│  │  websocket:                                                  ││
│  │    enabled: true                                            ││
│  │                                                              ││
│  │  sse:                                                        ││
│  │    enabled: true                                            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 基本用法

### 引入与初始化

```typescript
import { useFeatureStore } from '@/stores/modules/feature'

// 获取 Store 实例
const featureStore = useFeatureStore()

// 初始化功能配置（通常在 App.vue 中调用）
await featureStore.initFeatures()
```

### 在 App.vue 中初始化

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

onLaunch(async () => {
  // 初始化系统功能配置
  await featureStore.initFeatures()

  console.log('功能配置已加载:', featureStore.features)
})
</script>
```

### 条件渲染功能模块

```vue
<template>
  <view class="feature-modules">
    <!-- AI 对话功能 -->
    <view v-if="isAIEnabled" class="ai-chat">
      <wd-button @click="openAIChat">
        <wd-icon name="chat" />
        AI 助手
      </wd-button>
    </view>

    <!-- 实时消息功能 -->
    <view v-if="isWebSocketEnabled" class="realtime-message">
      <wd-badge :value="unreadCount">
        <wd-button @click="openMessages">
          <wd-icon name="bell" />
          消息
        </wd-button>
      </wd-badge>
    </view>

    <!-- 功能未启用时的提示 -->
    <view v-if="!isAIEnabled" class="feature-disabled">
      <text>AI 功能未启用</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

// 检查 AI 功能是否启用
const isAIEnabled = computed(() => {
  return featureStore.isFeatureEnabled('langchain4jEnabled')
})

// 检查 WebSocket 功能是否启用
const isWebSocketEnabled = computed(() => {
  return featureStore.isFeatureEnabled('websocketEnabled')
})

const openAIChat = () => {
  uni.navigateTo({ url: '/pages/ai/chat' })
}

const openMessages = () => {
  uni.navigateTo({ url: '/pages/message/list' })
}
</script>
```

### 按功能加载模块

```typescript
import { useFeatureStore } from '@/stores/modules/feature'
import { webSocket } from '@/composables/useWebSocket'

const featureStore = useFeatureStore()

// 根据功能开关决定是否初始化 WebSocket
const initRealtimeFeatures = async () => {
  // 确保功能配置已加载
  if (!featureStore.initialized) {
    await featureStore.initFeatures()
  }

  // WebSocket 功能
  if (featureStore.isFeatureEnabled('websocketEnabled')) {
    console.log('初始化 WebSocket 连接...')
    webSocket.initialize()
    webSocket.connect()
  }

  // SSE 功能
  if (featureStore.isFeatureEnabled('sseEnabled')) {
    console.log('初始化 SSE 连接...')
    // initSSE()
  }
}
```

## API 详解

### 状态

#### features

系统功能配置对象。

```typescript
const features: Ref<SystemFeature>

interface SystemFeature {
  /** LangChain4j AI 功能是否启用 */
  langchain4jEnabled: boolean
  /** WebSocket 功能是否启用 */
  websocketEnabled: boolean
  /** SSE 功能是否启用 */
  sseEnabled: boolean
}
```

**默认值:**

```typescript
{
  langchain4jEnabled: false,
  websocketEnabled: false,
  sseEnabled: false
}
```

#### initialized

是否已初始化标记。

```typescript
const initialized: Ref<boolean>
```

### 方法

#### initFeatures

初始化功能配置，从服务器获取功能开关状态。

```typescript
const initFeatures: () => Promise<void>
```

**功能说明:**
1. 检查是否已初始化，避免重复请求
2. 调用 API 获取功能配置
3. 更新 features 状态
4. 接口失败时使用默认值
5. 标记初始化完成

**使用示例:**

```typescript
const featureStore = useFeatureStore()

// 初始化
await featureStore.initFeatures()

// 检查初始化状态
if (featureStore.initialized) {
  console.log('功能配置:', featureStore.features)
}
```

#### isFeatureEnabled

判断指定功能是否启用。

```typescript
const isFeatureEnabled: (featureName: keyof SystemFeature) => boolean
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `featureName` | `keyof SystemFeature` | 是 | 功能名称 |

**可用的功能名称:**

| 功能名称 | 说明 |
|----------|------|
| `langchain4jEnabled` | LangChain4j AI 功能 |
| `websocketEnabled` | WebSocket 实时通信功能 |
| `sseEnabled` | SSE 服务端推送功能 |

**使用示例:**

```typescript
// 检查 AI 功能
if (featureStore.isFeatureEnabled('langchain4jEnabled')) {
  // 显示 AI 相关功能
}

// 检查 WebSocket 功能
if (featureStore.isFeatureEnabled('websocketEnabled')) {
  // 初始化 WebSocket
}

// 检查 SSE 功能
if (featureStore.isFeatureEnabled('sseEnabled')) {
  // 初始化 SSE
}
```

## 功能模块说明

### LangChain4j AI 功能

当 `langchain4jEnabled` 为 `true` 时，应用支持 AI 对话功能：

```typescript
// 检查并使用 AI 功能
const useAIChat = () => {
  const featureStore = useFeatureStore()

  if (!featureStore.isFeatureEnabled('langchain4jEnabled')) {
    uni.showToast({
      title: 'AI 功能未启用',
      icon: 'none'
    })
    return
  }

  // 打开 AI 对话页面
  uni.navigateTo({ url: '/pages/ai/chat' })
}
```

### WebSocket 实时通信

当 `websocketEnabled` 为 `true` 时，应用支持 WebSocket 实时通信：

```typescript
import { webSocket } from '@/composables/useWebSocket'

const initWebSocket = async () => {
  const featureStore = useFeatureStore()

  if (!featureStore.isFeatureEnabled('websocketEnabled')) {
    console.log('WebSocket 功能未启用')
    return
  }

  // 初始化 WebSocket
  webSocket.initialize(undefined, {
    onConnected: () => {
      console.log('WebSocket 已连接')
    },
    onMessage: (data) => {
      console.log('收到消息:', data)
    }
  })

  webSocket.connect()
}
```

### SSE 服务端推送

当 `sseEnabled` 为 `true` 时，应用支持 SSE 服务端推送：

```typescript
const initSSE = () => {
  const featureStore = useFeatureStore()

  if (!featureStore.isFeatureEnabled('sseEnabled')) {
    console.log('SSE 功能未启用')
    return
  }

  // 初始化 SSE 连接
  const eventSource = new EventSource('/api/sse/events')

  eventSource.onmessage = (event) => {
    console.log('收到 SSE 消息:', event.data)
  }

  eventSource.onerror = (error) => {
    console.error('SSE 连接错误:', error)
  }
}
```

## 类型定义

### SystemFeature

```typescript
/**
 * 系统功能配置
 */
interface SystemFeature {
  /**
   * LangChain4j AI 功能是否启用
   * 启用后支持 AI 对话、智能问答等功能
   */
  langchain4jEnabled: boolean

  /**
   * WebSocket 功能是否启用
   * 启用后支持实时消息推送、在线状态等功能
   */
  websocketEnabled: boolean

  /**
   * SSE (Server-Sent Events) 功能是否启用
   * 启用后支持服务端单向推送事件
   */
  sseEnabled: boolean
}
```

### FeatureStore 完整类型

```typescript
interface FeatureStore {
  /** 功能配置 */
  features: Ref<SystemFeature>
  /** 是否已初始化 */
  initialized: Ref<boolean>
  /** 初始化功能配置 */
  initFeatures: () => Promise<void>
  /** 判断功能是否启用 */
  isFeatureEnabled: (featureName: keyof SystemFeature) => boolean
}
```

### 后端 SystemFeatureVo

后端返回的完整功能配置对象，包含更多扩展字段：

```typescript
/**
 * 后端系统功能配置视图对象
 */
interface SystemFeatureVo {
  /** langchain4j 是否启用 */
  langchain4jEnabled: boolean
  /** WebSocket 是否启用 */
  websocketEnabled: boolean
  /** SSE 是否启用 */
  sseEnabled: boolean
  /** 开放API是否启用 */
  openApiEnabled?: boolean
  /** 开放API访问控制模式: ALL | ROLES | ADMIN | SUPER_ADMIN */
  openApiAccessMode?: string
  /** 开放API允许的角色列表 */
  openApiAllowedRoles?: string[]
}
```

## 后端配置说明

### 功能模块配置

后端通过 Spring Boot 配置文件控制各功能模块的启用状态：

```yaml
# application.yml

# LangChain4j AI 功能配置
langchain4j:
  enabled: true
  # 其他 AI 相关配置...
  openai:
    api-key: ${OPENAI_API_KEY}
    model: gpt-4

# WebSocket 实时通信配置
websocket:
  enabled: true
  # WebSocket 相关配置...
  path: /ws
  heartbeat-interval: 30000

# SSE 服务端推送配置
sse:
  enabled: true
  # SSE 相关配置...
  timeout: 60000
```

### 控制器实现

后端 `SystemFeatureController` 负责聚合各模块的启用状态：

```java
@SaIgnore  // 不需要认证
@RestController
@RequestMapping("/common/system")
public class SystemFeatureController {

    @Autowired(required = false)
    private LangChain4jProperties langChain4jProperties;

    @Autowired(required = false)
    private WebSocketProperties webSocketProperties;

    @Autowired(required = false)
    private SseProperties sseProperties;

    @GetMapping("/features")
    public R<SystemFeatureVo> getFeatures() {
        SystemFeatureVo features = new SystemFeatureVo();

        // 检查各模块是否启用
        features.setLangchain4jEnabled(
            ObjectUtils.getIfNotNull(langChain4jProperties,
                LangChain4jProperties::getEnabled));

        features.setWebsocketEnabled(
            ObjectUtils.getIfNotNull(webSocketProperties,
                WebSocketProperties::getEnabled));

        features.setSseEnabled(
            ObjectUtils.getIfNotNull(sseProperties,
                SseProperties::getEnabled));

        return R.ok(features);
    }
}
```

**关键设计:**

- 使用 `@SaIgnore` 注解跳过认证，允许未登录用户访问
- 使用 `@Autowired(required = false)` 处理可选依赖
- 使用 `ObjectUtils.getIfNotNull` 安全获取配置值，避免 NPE

### API 接口定义

前端 API 调用定义：

```typescript
// api/common/system/feature/featureApi.ts

import { withHeaders } from '@/utils/function'

/**
 * 系统功能配置
 */
export interface SystemFeature {
  /** langchain4j 是否启用 */
  langchain4jEnabled: boolean
  /** WebSocket 是否启用 */
  websocketEnabled: boolean
  /** SSE 是否启用 */
  sseEnabled: boolean
}

/**
 * 获取系统功能配置
 */
export const getSystemFeatures = (): Result<SystemFeature> => {
  return http.get<SystemFeature>(
    '/common/system/features',
    {},
    withHeaders(
      { auth: false },           // 不需要认证
      { skipWait: true }         // 跳过等待租户初始化
    )
  )
}
```

**配置说明:**

| 配置项 | 说明 |
|--------|------|
| `auth: false` | 不需要认证 Token，应用启动时即可调用 |
| `skipWait: true` | 跳过租户初始化等待，因为此接口在初始化之前调用 |

## 最佳实践

### 1. 统一在应用启动时初始化

```typescript
// App.vue
<script lang="ts" setup>
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

onLaunch(async () => {
  // 1. 初始化功能配置
  await featureStore.initFeatures()

  // 2. 根据功能配置初始化相关服务
  if (userStore.isLoggedIn) {
    if (featureStore.isFeatureEnabled('websocketEnabled')) {
      // 初始化 WebSocket
    }
  }
})
</script>
```

### 2. 创建功能检查 Composable

```typescript
// composables/useFeature.ts
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

export function useFeature() {
  const featureStore = useFeatureStore()

  // AI 功能
  const isAIEnabled = computed(() =>
    featureStore.isFeatureEnabled('langchain4jEnabled')
  )

  // WebSocket 功能
  const isWebSocketEnabled = computed(() =>
    featureStore.isFeatureEnabled('websocketEnabled')
  )

  // SSE 功能
  const isSSEEnabled = computed(() =>
    featureStore.isFeatureEnabled('sseEnabled')
  )

  // 检查功能并执行
  const runIfEnabled = (
    featureName: keyof SystemFeature,
    callback: () => void,
    fallback?: () => void
  ) => {
    if (featureStore.isFeatureEnabled(featureName)) {
      callback()
    } else if (fallback) {
      fallback()
    } else {
      uni.showToast({
        title: '该功能未启用',
        icon: 'none'
      })
    }
  }

  return {
    isAIEnabled,
    isWebSocketEnabled,
    isSSEEnabled,
    runIfEnabled
  }
}
```

**使用:**

```vue
<script lang="ts" setup>
import { useFeature } from '@/composables/useFeature'

const { isAIEnabled, runIfEnabled } = useFeature()

const handleAIClick = () => {
  runIfEnabled(
    'langchain4jEnabled',
    () => {
      uni.navigateTo({ url: '/pages/ai/chat' })
    },
    () => {
      uni.showModal({
        title: '提示',
        content: 'AI 功能未启用，请联系管理员',
        showCancel: false
      })
    }
  )
}
</script>
```

### 3. 条件加载组件

```vue
<template>
  <view class="app-features">
    <!-- 动态加载 AI 组件 -->
    <component
      v-if="isAIEnabled"
      :is="AIChat"
    />

    <!-- 动态加载消息组件 -->
    <component
      v-if="isWebSocketEnabled"
      :is="MessageCenter"
    />
  </view>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { useFeature } from '@/composables/useFeature'

const { isAIEnabled, isWebSocketEnabled } = useFeature()

// 异步加载组件，减少初始包体积
const AIChat = defineAsyncComponent(() =>
  import('@/components/ai/AIChat.vue')
)

const MessageCenter = defineAsyncComponent(() =>
  import('@/components/message/MessageCenter.vue')
)
</script>
```

## 常见问题

### 1. 功能配置未生效

**问题原因：** 未等待初始化完成就使用

**解决方案：**

```typescript
// 确保初始化完成
const ensureInitialized = async () => {
  const featureStore = useFeatureStore()

  if (!featureStore.initialized) {
    await featureStore.initFeatures()
  }

  return featureStore.features
}

// 使用
const features = await ensureInitialized()
if (features.websocketEnabled) {
  // ...
}
```

### 2. 接口失败导致功能不可用

**问题原因：** 网络异常或服务器错误

**解决方案：** Store 已内置容错处理，接口失败时使用默认值：

```typescript
const initFeatures = async (): Promise<void> => {
  if (initialized.value) return

  const [err, data] = await getSystemFeatures()
  if (err) {
    // 接口失败时使用默认值
    features.value.langchain4jEnabled = false
    features.value.websocketEnabled = false
    features.value.sseEnabled = false
  } else {
    features.value = data
  }
  initialized.value = true
}
```

### 3. 功能状态需要刷新

**问题原因：** 后端配置变更后需要同步

**解决方案：**

```typescript
// 强制刷新功能配置
const refreshFeatures = async () => {
  const featureStore = useFeatureStore()

  // 重置初始化状态
  featureStore.initialized = false

  // 重新加载
  await featureStore.initFeatures()
}

// 在设置页面提供刷新按钮
const handleRefresh = async () => {
  uni.showLoading({ title: '刷新中...' })
  await refreshFeatures()
  uni.hideLoading()
  uni.showToast({ title: '刷新成功' })
}
```

### 4. 功能检查时机过早

**问题原因：** 在 Store 初始化之前就检查功能状态

**解决方案：**

```typescript
// 错误示例：在模块顶层检查
// const isAIEnabled = featureStore.isFeatureEnabled('langchain4jEnabled')

// 正确示例：在组件挂载后或方法中检查
const isAIEnabled = computed(() => {
  // 确保初始化完成
  if (!featureStore.initialized) {
    return false
  }
  return featureStore.isFeatureEnabled('langchain4jEnabled')
})

// 或使用 watchEffect 等待初始化
watchEffect(() => {
  if (featureStore.initialized) {
    // 安全地访问功能状态
    console.log('AI 功能:', featureStore.features.langchain4jEnabled)
  }
})
```

### 5. 并发初始化问题

**问题原因：** 多个组件同时调用 initFeatures

**问题分析：** 虽然 Store 内部有 `initialized` 标记防止重复初始化，但在首次调用未完成前，其他调用者可能获取到未初始化的状态。

**解决方案：**

```typescript
// composables/useFeatureGuard.ts

// 使用 Promise 缓存确保只有一次实际请求
let initPromise: Promise<void> | null = null

export function useFeatureGuard() {
  const featureStore = useFeatureStore()

  const ensureInitialized = async () => {
    // 已初始化直接返回
    if (featureStore.initialized) {
      return
    }

    // 正在初始化，等待同一个 Promise
    if (initPromise) {
      return initPromise
    }

    // 开始初始化
    initPromise = featureStore.initFeatures()
    try {
      await initPromise
    } finally {
      initPromise = null
    }
  }

  return {
    ensureInitialized,
    isFeatureEnabled: featureStore.isFeatureEnabled,
    features: featureStore.features
  }
}
```

### 6. 功能依赖关系问题

**问题原因：** 某些功能可能依赖其他功能

**解决方案：**

```typescript
// 定义功能依赖关系
const featureDependencies: Record<keyof SystemFeature, (keyof SystemFeature)[]> = {
  langchain4jEnabled: [],              // AI 功能无依赖
  websocketEnabled: [],                // WebSocket 无依赖
  sseEnabled: []                       // SSE 无依赖
}

// 检查功能及其依赖是否都启用
const isFeatureAvailable = (featureName: keyof SystemFeature): boolean => {
  const featureStore = useFeatureStore()

  // 检查主功能
  if (!featureStore.isFeatureEnabled(featureName)) {
    return false
  }

  // 检查依赖功能
  const dependencies = featureDependencies[featureName]
  return dependencies.every(dep => featureStore.isFeatureEnabled(dep))
}
```

## 性能优化

### 1. 初始化时机优化

功能配置应该在应用启动时尽早加载，但不应阻塞用户界面：

```typescript
// App.vue - 优化后的初始化流程
onLaunch(async () => {
  // 并行初始化，不阻塞关键路径
  const featurePromise = featureStore.initFeatures()

  // 其他不依赖功能配置的初始化可以并行进行
  // ...

  // 只有需要功能配置的操作才等待
  await featurePromise

  // 继续需要功能配置的初始化
  await initializeApp()
})
```

### 2. 条件加载优化

根据功能开关条件加载模块，减少不必要的代码：

```typescript
// 使用动态导入按需加载
const loadAIModule = async () => {
  if (!featureStore.isFeatureEnabled('langchain4jEnabled')) {
    return null
  }

  // 只在功能启用时加载 AI 模块
  const { AIChat } = await import('@/components/ai/AIChat.vue')
  return AIChat
}

// 在组件中使用
const AIChat = ref<Component | null>(null)

onMounted(async () => {
  if (featureStore.initialized && featureStore.isFeatureEnabled('langchain4jEnabled')) {
    AIChat.value = await loadAIModule()
  }
})
```

### 3. 缓存策略

虽然 Store 自带初始化保护，但可以添加额外的缓存策略：

```typescript
// 可选：本地存储缓存
const CACHE_KEY = 'app_features_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟

interface CachedFeatures {
  data: SystemFeature
  timestamp: number
}

const getCachedFeatures = (): SystemFeature | null => {
  try {
    const cached = uni.getStorageSync(CACHE_KEY) as CachedFeatures
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
  } catch (e) {
    console.warn('读取功能缓存失败', e)
  }
  return null
}

const setCachedFeatures = (features: SystemFeature) => {
  try {
    uni.setStorageSync(CACHE_KEY, {
      data: features,
      timestamp: Date.now()
    })
  } catch (e) {
    console.warn('缓存功能配置失败', e)
  }
}

// 增强版初始化
const initFeaturesWithCache = async () => {
  // 尝试使用缓存
  const cached = getCachedFeatures()
  if (cached) {
    featureStore.features = cached
    featureStore.initialized = true
    // 后台刷新
    featureStore.initFeatures().then(() => {
      setCachedFeatures(featureStore.features)
    })
    return
  }

  // 无缓存，正常初始化
  await featureStore.initFeatures()
  setCachedFeatures(featureStore.features)
}
```

### 4. 响应式优化

避免不必要的响应式计算：

```typescript
// 使用 shallowRef 优化（Store 内部）
const features = shallowRef<SystemFeature>({
  langchain4jEnabled: false,
  websocketEnabled: false,
  sseEnabled: false
})

// 组件中使用 computed 缓存结果
const isAIEnabled = computed(() => featureStore.features.langchain4jEnabled)

// 避免在模板中直接调用方法
// ❌ 不推荐：每次渲染都调用
// <view v-if="featureStore.isFeatureEnabled('langchain4jEnabled')">

// ✅ 推荐：使用计算属性
// <view v-if="isAIEnabled">
```

## 调试技巧

### 1. 查看功能配置状态

```typescript
// 在控制台查看当前功能配置
const debugFeatures = () => {
  const featureStore = useFeatureStore()

  console.group('功能配置调试')
  console.log('初始化状态:', featureStore.initialized)
  console.log('功能配置:', JSON.stringify(featureStore.features, null, 2))
  console.log('AI 功能:', featureStore.isFeatureEnabled('langchain4jEnabled'))
  console.log('WebSocket:', featureStore.isFeatureEnabled('websocketEnabled'))
  console.log('SSE:', featureStore.isFeatureEnabled('sseEnabled'))
  console.groupEnd()
}

// 在应用初始化后调用
onLaunch(async () => {
  await featureStore.initFeatures()
  debugFeatures()
})
```

### 2. 模拟功能开关

在开发环境中模拟不同的功能配置：

```typescript
// 开发环境功能模拟
const mockFeatures = (features: Partial<SystemFeature>) => {
  if (import.meta.env.DEV) {
    const featureStore = useFeatureStore()
    Object.assign(featureStore.features, features)
    console.log('模拟功能配置:', featureStore.features)
  }
}

// 使用示例
mockFeatures({
  langchain4jEnabled: true,
  websocketEnabled: false
})
```

### 3. 监控功能状态变化

```typescript
// 监控功能配置变化
watch(
  () => featureStore.features,
  (newFeatures, oldFeatures) => {
    console.log('功能配置变化:')
    console.log('  旧配置:', oldFeatures)
    console.log('  新配置:', newFeatures)

    // 检查具体变化
    if (newFeatures.langchain4jEnabled !== oldFeatures.langchain4jEnabled) {
      console.log(`  AI 功能: ${oldFeatures.langchain4jEnabled} → ${newFeatures.langchain4jEnabled}`)
    }
  },
  { deep: true }
)
```

### 4. 请求追踪

```typescript
// 添加请求日志
const getSystemFeaturesWithLog = async (): Result<SystemFeature> => {
  console.log('[Feature API] 开始获取功能配置...')
  const startTime = Date.now()

  const result = await getSystemFeatures()

  const duration = Date.now() - startTime
  console.log(`[Feature API] 请求完成，耗时 ${duration}ms`)

  if (result[0]) {
    console.error('[Feature API] 请求失败:', result[0])
  } else {
    console.log('[Feature API] 获取成功:', result[1])
  }

  return result
}
```

## 高级用法

### 1. 功能守卫 (Feature Guard)

创建路由级别的功能守卫，阻止访问未启用功能的页面：

```typescript
// composables/useFeatureGuard.ts

import { useFeatureStore } from '@/stores/modules/feature'

type FeatureName = keyof SystemFeature

interface FeatureGuardOptions {
  /** 功能名称 */
  feature: FeatureName
  /** 未启用时的提示消息 */
  message?: string
  /** 未启用时的重定向路径 */
  redirect?: string
}

export function useFeatureGuard(options: FeatureGuardOptions) {
  const featureStore = useFeatureStore()

  const checkFeature = (): boolean => {
    if (!featureStore.initialized) {
      console.warn('功能配置未初始化')
      return false
    }

    return featureStore.isFeatureEnabled(options.feature)
  }

  const guard = () => {
    if (!checkFeature()) {
      uni.showToast({
        title: options.message || '该功能未启用',
        icon: 'none'
      })

      if (options.redirect) {
        setTimeout(() => {
          uni.redirectTo({ url: options.redirect! })
        }, 1500)
      } else {
        uni.navigateBack()
      }

      return false
    }
    return true
  }

  return {
    checkFeature,
    guard
  }
}

// 在页面中使用
// pages/ai/chat.vue
<script lang="ts" setup>
import { useFeatureGuard } from '@/composables/useFeatureGuard'

const { guard } = useFeatureGuard({
  feature: 'langchain4jEnabled',
  message: 'AI 功能未启用，请联系管理员',
  redirect: '/pages/index/index'
})

onLoad(() => {
  // 页面加载时检查功能
  if (!guard()) {
    return
  }

  // 正常初始化页面...
})
</script>
```

### 2. 功能装饰器模式

使用装饰器模式包装需要功能检查的方法：

```typescript
// utils/featureDecorator.ts

type FeatureName = keyof SystemFeature

/**
 * 功能检查装饰器
 * 在执行方法前检查功能是否启用
 */
export function requireFeature<T extends (...args: any[]) => any>(
  feature: FeatureName,
  fn: T,
  options?: {
    fallback?: (...args: Parameters<T>) => ReturnType<T>
    message?: string
  }
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const featureStore = useFeatureStore()

    if (!featureStore.isFeatureEnabled(feature)) {
      if (options?.message) {
        uni.showToast({ title: options.message, icon: 'none' })
      }

      if (options?.fallback) {
        return options.fallback(...args)
      }

      return undefined as ReturnType<T>
    }

    return fn(...args)
  }) as T
}

// 使用示例
const openAIChat = requireFeature(
  'langchain4jEnabled',
  () => {
    uni.navigateTo({ url: '/pages/ai/chat' })
  },
  {
    message: 'AI 功能未启用',
    fallback: () => {
      console.log('AI 功能被禁用，执行备选方案')
    }
  }
)
```

### 3. 功能降级策略

为禁用的功能提供优雅的降级方案：

```typescript
// composables/useFeatureFallback.ts

interface FeatureFallbackConfig<T> {
  /** 功能名称 */
  feature: keyof SystemFeature
  /** 功能启用时的实现 */
  enabled: () => T
  /** 功能禁用时的降级实现 */
  disabled: () => T
}

export function useFeatureFallback<T>(config: FeatureFallbackConfig<T>): T {
  const featureStore = useFeatureStore()

  if (featureStore.isFeatureEnabled(config.feature)) {
    return config.enabled()
  }

  return config.disabled()
}

// 使用示例：消息推送降级策略
const messageService = useFeatureFallback({
  feature: 'websocketEnabled',
  enabled: () => ({
    // WebSocket 实时推送
    subscribe: (topic: string, callback: (msg: any) => void) => {
      webSocket.subscribe(topic, callback)
    },
    unsubscribe: (topic: string) => {
      webSocket.unsubscribe(topic)
    }
  }),
  disabled: () => ({
    // 降级为轮询
    subscribe: (topic: string, callback: (msg: any) => void) => {
      const timer = setInterval(async () => {
        const messages = await fetchMessages(topic)
        messages.forEach(callback)
      }, 30000) // 30秒轮询

      return timer
    },
    unsubscribe: (timerId: number) => {
      clearInterval(timerId)
    }
  })
})
```

### 4. 功能分析追踪

追踪功能使用情况，用于数据分析：

```typescript
// utils/featureAnalytics.ts

interface FeatureUsageEvent {
  feature: keyof SystemFeature
  action: 'check' | 'use' | 'blocked'
  timestamp: number
  context?: string
}

const usageEvents: FeatureUsageEvent[] = []

export function trackFeatureUsage(
  feature: keyof SystemFeature,
  action: 'check' | 'use' | 'blocked',
  context?: string
) {
  const event: FeatureUsageEvent = {
    feature,
    action,
    timestamp: Date.now(),
    context
  }

  usageEvents.push(event)

  // 可选：发送到服务器
  // sendAnalytics(event)

  if (import.meta.env.DEV) {
    console.log('[功能追踪]', event)
  }
}

// 增强版功能检查
export function checkFeatureWithTracking(
  feature: keyof SystemFeature,
  context?: string
): boolean {
  const featureStore = useFeatureStore()
  const enabled = featureStore.isFeatureEnabled(feature)

  trackFeatureUsage(feature, enabled ? 'check' : 'blocked', context)

  return enabled
}

// 获取使用统计
export function getFeatureUsageStats() {
  const stats: Record<string, { checks: number; uses: number; blocks: number }> = {}

  usageEvents.forEach(event => {
    if (!stats[event.feature]) {
      stats[event.feature] = { checks: 0, uses: 0, blocks: 0 }
    }

    if (event.action === 'check') stats[event.feature].checks++
    if (event.action === 'use') stats[event.feature].uses++
    if (event.action === 'blocked') stats[event.feature].blocks++
  })

  return stats
}
```

### 5. 扩展新功能开关

当需要添加新的功能开关时：

```typescript
// 1. 扩展前端类型定义
// api/common/system/feature/featureApi.ts
export interface SystemFeature {
  langchain4jEnabled: boolean
  websocketEnabled: boolean
  sseEnabled: boolean
  // 新增功能开关
  newFeatureEnabled: boolean
}

// 2. 更新 Store 默认值
// stores/modules/feature.ts
const features = ref<SystemFeature>({
  langchain4jEnabled: false,
  websocketEnabled: false,
  sseEnabled: false,
  newFeatureEnabled: false  // 新增
})

// 3. 后端添加配置
// application.yml
newFeature:
  enabled: true

// 4. 后端控制器添加读取逻辑
@Autowired(required = false)
private NewFeatureProperties newFeatureProperties;

// 在 getFeatures 方法中添加
features.setNewFeatureEnabled(
    ObjectUtils.getIfNotNull(newFeatureProperties,
        NewFeatureProperties::getEnabled));
```

## 注意事项

### 1. 初始化顺序

功能配置的初始化应该在应用的最早阶段完成，因为其他模块可能依赖功能状态：

```typescript
// App.vue - 正确的初始化顺序
onLaunch(async () => {
  // 1. 首先初始化功能配置
  await featureStore.initFeatures()

  // 2. 然后初始化应用（可能依赖功能配置）
  await initializeApp()

  // 3. 最后进行其他操作
  checkUpdate()
})
```

### 2. 默认值策略

当 API 请求失败时，所有功能默认为禁用状态。这是一种保守策略，确保在网络异常时不会意外启用高级功能。如果业务需要，可以修改默认值：

```typescript
// 根据业务需求调整默认值
const initFeatures = async (): Promise<void> => {
  if (initialized.value) return

  const [err, data] = await getSystemFeatures()
  if (err) {
    // 保守策略：全部禁用
    features.value.langchain4jEnabled = false
    features.value.websocketEnabled = false
    features.value.sseEnabled = false

    // 或激进策略：使用上次缓存的值
    // const cached = getCachedFeatures()
    // if (cached) features.value = cached
  } else {
    features.value = data
  }
  initialized.value = true
}
```

### 3. 功能状态的响应性

功能状态是响应式的，当后台配置变化并重新初始化后，所有使用 `computed` 的地方会自动更新：

```vue
<template>
  <!-- 响应式：配置变化后自动更新 -->
  <view v-if="isAIEnabled">
    AI 功能可用
  </view>
</template>

<script setup>
const isAIEnabled = computed(() =>
  featureStore.isFeatureEnabled('langchain4jEnabled')
)
</script>
```

### 4. 安全考虑

功能开关不应作为安全控制的唯一手段。敏感功能应该在后端也进行权限校验：

```typescript
// 前端功能检查只是 UI 层面的控制
if (featureStore.isFeatureEnabled('langchain4jEnabled')) {
  // 调用 AI API
  const result = await aiApi.chat(message)
  // 后端仍需验证用户是否有权限使用 AI 功能
}
```

### 5. 多租户环境

在多租户环境下，不同租户可能有不同的功能配置。确保 API 正确处理租户上下文：

```typescript
// API 配置中跳过租户等待，但仍会携带租户信息
export const getSystemFeatures = (): Result<SystemFeature> => {
  return http.get<SystemFeature>(
    '/common/system/features',
    {},
    withHeaders(
      { auth: false },
      { skipWait: true }  // 跳过等待，但请求头中仍有租户ID
    )
  )
}
```

### 6. 测试建议

在测试中模拟不同的功能配置：

```typescript
// 单元测试中模拟功能状态
describe('Feature dependent component', () => {
  beforeEach(() => {
    // 重置 Store
    const featureStore = useFeatureStore()
    featureStore.$reset()
  })

  it('should show AI button when enabled', async () => {
    const featureStore = useFeatureStore()
    featureStore.features.langchain4jEnabled = true
    featureStore.initialized = true

    // 测试组件渲染...
  })

  it('should hide AI button when disabled', async () => {
    const featureStore = useFeatureStore()
    featureStore.features.langchain4jEnabled = false
    featureStore.initialized = true

    // 测试组件渲染...
  })
})
```
