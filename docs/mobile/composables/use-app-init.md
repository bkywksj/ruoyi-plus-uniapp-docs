# useAppInit 应用初始化

## 介绍

`useAppInit` 是应用级别的初始化组合式函数，负责在应用启动时根据不同平台执行相应的初始化流程。它是整个应用的启动入口，处理租户ID获取、用户自动登录、WebSocket连接等核心初始化逻辑。

该组合函数采用单例模式设计，确保初始化流程在整个应用生命周期中只执行一次。同时提供 Promise 缓存机制，避免并发调用导致的重复初始化问题。初始化过程中会根据当前运行平台自动选择合适的策略，实现多平台的统一入口和差异化处理。

**核心特性:**

- **多平台适配** - 根据运行平台自动选择初始化策略（APP、H5、小程序）
- **租户ID管理** - 小程序和公众号H5自动通过 appid 获取租户ID
- **自动登录** - 支持小程序静默登录和微信H5授权登录
- **WebSocket初始化** - 用户登录后自动建立WebSocket实时连接
- **单例模式** - 确保初始化流程只执行一次，避免重复调用
- **Promise缓存** - 并发调用时复用同一个初始化Promise
- **错误容错** - 登录失败不影响应用启动，租户ID失败为致命错误
- **状态追踪** - 提供 isInitialized 和 isInitializing 状态

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           应用启动层                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                      App.vue (onLaunch)                                  │
│                             │                                            │
│                    featureStore.initFeatures()                          │
│                             │                                            │
│                        initializeApp()                                   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         初始化控制层                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                        useAppInit Composable                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │ 单例检查     │  │ 平台判断     │  │ Promise缓存 │  │ 状态管理     │   │
│   │(singleton)  │  │(platform)   │  │(initPromise)│  │ (states)    │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   APP/普通H5     │ │  小程序平台      │ │  公众号H5        │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • 跳过租户ID     │ │ • 获取租户ID     │ │ • 获取租户ID     │
│ • 检查Token     │ │ • 静默登录       │ │ • 授权登录       │
│ • 获取用户信息   │ │ • 获取用户信息   │ │ • 获取用户信息   │
│ • WebSocket    │ │ • WebSocket     │ │ • WebSocket     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          依赖服务层                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ userStore│  │   cache  │  │  webSocket│  │homeApi   │  │ platform │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 初始化流程状态机

```
┌──────────────────────────────────────────────────────────────────────┐
│                        初始化状态流转                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌──────────────────┐                                              │
│    │   初始状态        │ isInitialized = false                       │
│    │                  │ isInitializing = false                       │
│    │                  │ initPromise = null                           │
│    └────────┬─────────┘                                              │
│             │                                                        │
│        initializeApp()                                               │
│             │                                                        │
│             ▼                                                        │
│    ┌──────────────────┐                                              │
│    │ 已初始化?         │──── 是 ────→ 直接返回 Promise.resolve()      │
│    └────────┬─────────┘                                              │
│             │ 否                                                      │
│             ▼                                                        │
│    ┌──────────────────┐                                              │
│    │ 有缓存Promise?    │──── 是 ────→ 返回缓存的 Promise              │
│    └────────┬─────────┘                                              │
│             │ 否                                                      │
│             ▼                                                        │
│    ┌──────────────────┐                                              │
│    │   初始化中        │ isInitialized = false                       │
│    │                  │ isInitializing = true                        │
│    │                  │ initPromise = new Promise()                  │
│    └────────┬─────────┘                                              │
│             │                                                        │
│        执行初始化流程                                                  │
│             │                                                        │
│             ▼                                                        │
│    ┌──────────────────┐                                              │
│    │   初始化完成      │ isInitialized = true                        │
│    │                  │ isInitializing = false                       │
│    │                  │ initPromise = null                           │
│    └──────────────────┘                                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 核心模块结构

| 模块 | 说明 | 关键函数 |
|------|------|----------|
| **状态管理** | 管理初始化状态 | `isInitialized`, `isInitializing`, `initPromise` |
| **平台判断** | 判断当前运行平台 | `shouldInitialize()`, `getCurrentPlatformName()` |
| **租户管理** | 获取和存储租户ID | `getTenantIdByAppid()`, `cache.set()` |
| **登录管理** | 处理不同平台的登录 | `loginWithMiniapp()`, `loginWithMp()` |
| **WebSocket** | 初始化实时连接 | `initializeWebSocket()` |
| **错误处理** | 区分致命错误和非致命错误 | `try-catch` 错误分类 |

## 平台初始化策略

不同平台的初始化行为不同，组件内部通过 `shouldInitialize()` 方法判断是否需要执行完整初始化流程：

| 平台 | 租户ID初始化 | 自动登录 | WebSocket | 说明 |
|------|-------------|---------|-----------|------|
| APP | ❌ 跳过 | ❌ 手动登录 | ✅ 登录后连接 | 无需租户ID，用户手动登录 |
| 普通H5 | ❌ 跳过 | ❌ 手动登录 | ✅ 登录后连接 | 非公众号H5无需初始化 |
| 微信公众号H5 | ✅ 执行 | ✅ 授权登录 | ✅ 登录后连接 | 检测URL中的code和state |
| 支付宝H5 | ✅ 执行 | ❌ 手动登录 | ✅ 登录后连接 | 仅获取租户ID |
| 微信小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 | wx.login获取code登录 |
| 支付宝小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 | my.getAuthCode登录 |
| 百度小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 | swan.login登录 |
| 抖音小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 | tt.login登录 |
| QQ小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 | qq.login登录 |

### 平台判断逻辑

```typescript
// 内部实现的平台判断
const shouldInitialize = (): boolean => {
  // APP环境不需要初始化租户ID
  if (isApp) return false

  // 微信/支付宝公众号H5需要初始化
  if (isWechatOfficialH5 || isAlipayOfficialH5) return true

  // 小程序环境需要初始化
  if (isMp) return true

  // 普通H5不需要初始化
  return false
}
```

### 平台名称映射

组件内部会根据平台返回友好的平台名称用于日志输出：

```typescript
const getCurrentPlatformName = (): string => {
  if (isApp) return 'APP'
  if (isWechatOfficialH5) return '微信公众号H5'
  if (isAlipayOfficialH5) return '支付宝H5'
  if (isMp) {
    switch (platform) {
      case 'mp-weixin': return '微信小程序'
      case 'mp-alipay': return '支付宝小程序'
      case 'mp-baidu': return '百度小程序'
      case 'mp-toutiao': return '字节跳动小程序'
      case 'mp-qq': return 'QQ小程序'
      default: return '小程序'
    }
  }
  return platform === 'h5' ? '普通H5' : '未知平台'
}
```

## 基本用法

### 在 App.vue 中使用

应用初始化通常在 `App.vue` 的 `onLaunch` 生命周期中调用：

```vue
<script setup lang="ts">
import { initializeApp } from '@/composables/useAppInit'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

onLaunch(async () => {
  // 先初始化系统功能配置（WebSocket需要依赖此配置）
  await featureStore.initFeatures()
  // 开始应用初始化
  await initializeApp()
})

onShow(() => {
  console.log('应用显示')
})

onHide(() => {
  console.log('应用隐藏')
})
</script>
```

### 等待初始化完成

在需要确保初始化完成后再执行的场景中使用 `waitForInit`：

```typescript
import { waitForInit } from '@/composables/useAppInit'

// 在页面或组件中等待初始化完成
const loadData = async () => {
  // 等待应用初始化完成（最多等待10秒）
  await waitForInit(10000)

  // 初始化完成后执行业务逻辑
  const data = await fetchUserData()
}
```

### 使用组合函数形式

```typescript
import { useAppInit } from '@/composables/useAppInit'

const { initializeApp, waitForInit } = useAppInit()

// 手动触发初始化
await initializeApp()

// 或等待初始化完成
await waitForInit()
```

### 使用全局导出方法

除了组合函数形式，还可以直接导入全局方法：

```typescript
import { initializeApp, waitForInit } from '@/composables/useAppInit'
import globalAppInit from '@/composables/useAppInit'

// 方式1: 直接使用导出的方法
await initializeApp()

// 方式2: 使用默认导出的全局实例
await globalAppInit.initializeApp()
```

## 初始化流程详解

### 完整初始化流程

```
应用启动 (onLaunch)
    │
    ▼
判断平台类型 (shouldInitialize)
    │
    ├─── APP/普通H5 ──────────────────┐
    │                                  │
    │    检查是否有Token               │
    │         │                        │
    │    ├─ 有Token → 获取用户信息     │
    │    │              │              │
    │    │         初始化WebSocket     │
    │    │                             │
    │    └─ 无Token → 跳过登录         │
    │                                  │
    │    设置 isInitialized = true    │
    │                                  ▼
    │                            初始化完成
    │
    └─── 小程序/公众号H5 ─────────────┐
                                       │
         第一步: 获取租户ID            │
              │                        │
         ├─ 成功 → 存储到Cache         │
         │                             │
         └─ 失败 → 抛出致命错误        │
                                       │
         第二步: 检查Token/自动登录    │
              │                        │
         ├─ 已有Token → 获取用户信息   │
         │                             │
         ├─ 小程序 → 静默登录          │
         │              │              │
         │    ├─ 成功 → 获取用户信息   │
         │    └─ 失败 → 允许继续启动   │
         │                             │
         └─ 微信H5 + code → 授权登录   │
                    │                  │
              ├─ 成功 → 清除URL参数    │
              │         获取用户信息   │
              │                        │
              └─ 失败 → 抛出错误       │
                                       │
         登录成功后初始化WebSocket     │
         设置 isInitialized = true    │
                                       ▼
                                 初始化完成
```

### 错误处理流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           错误处理流程                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    初始化过程中发生错误                                                   │
│              │                                                          │
│              ▼                                                          │
│    ┌──────────────────┐                                                 │
│    │ 错误类型判断      │                                                 │
│    └────────┬─────────┘                                                 │
│             │                                                           │
│    ┌────────┴────────┐                                                  │
│    │                 │                                                  │
│    ▼                 ▼                                                  │
│ ┌────────────┐  ┌────────────┐                                          │
│ │ 租户ID错误  │  │ 其他错误    │                                          │
│ │ (致命错误)  │  │ (非致命)    │                                          │
│ └─────┬──────┘  └─────┬──────┘                                          │
│       │               │                                                 │
│       ▼               ▼                                                 │
│   抛出异常        记录警告日志                                            │
│   应用终止        isInitialized = true                                  │
│                  应用继续运行                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 租户ID获取流程

租户ID是多租户系统的核心标识，通过平台的 appid 获取：

```typescript
// 内部实现
console.log(`[应用初始化] ${platformName}开始获取租户ID...`)

// 获取当前平台的appid
const appid = userStore.getCurrentPlatformAppid()

// 调用API获取租户ID
const [err, data] = await getTenantIdByAppid(appid)

if (!err && data) {
  // 存储租户ID到缓存
  cache.set(TENANT_STORAGE_KEY, data)
  console.log(`[应用初始化] ${platformName}租户ID获取成功: ${data}`)
} else {
  // 租户ID获取失败是致命错误
  const error = err || new Error('获取租户ID失败：返回数据为空')
  console.error(`[应用初始化] ${platformName}获取租户ID失败:`, error.message)
  throw error
}
```

### 小程序静默登录

小程序平台会自动执行静默登录，无需用户手动操作：

```typescript
// 内部实现逻辑
if (isMp) {
  console.log(`[应用初始化] ${platformName}开始静默登录...`)

  // 调用 userStore 的小程序登录方法
  const [loginErr] = await userStore.loginWithMiniapp()

  if (!loginErr) {
    console.log(`[应用初始化] ${platformName}静默登录成功`)

    // 获取用户信息
    userStore.fetchUserInfo()
      .then(() => {
        console.log(`[应用初始化] ${platformName}用户信息获取成功`)
        // 用户信息获取成功后初始化WebSocket
        initializeWebSocket()
      })
      .catch((err) => {
        console.warn(`[应用初始化] ${platformName}获取用户信息失败:`, err.message)
      })
  } else {
    // 静默登录失败不抛出错误，允许用户手动登录
    console.warn(`[应用初始化] ${platformName}静默登录失败:`, loginErr.message)
  }
}
```

### 微信公众号H5授权登录

微信公众号H5会检测URL中的授权回调参数：

```typescript
// 内部实现逻辑
if (isWechatOfficialH5) {
  // 解析URL参数
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  if (code && state) {
    console.log(`[应用初始化] ${platformName}检测到授权回调，开始登录...`)

    // 使用code和state进行登录
    const [loginErr] = await userStore.loginWithMp({ code, state })

    if (!loginErr) {
      console.log(`[应用初始化] ${platformName}授权登录成功`)

      // 清除URL中的授权参数，避免刷新页面重复登录
      const newUrl = window.location.pathname + window.location.hash
      window.history.replaceState({}, document.title, newUrl)

      // 获取用户信息
      userStore.fetchUserInfo()
        .then(() => {
          console.log(`[应用初始化] ${platformName}用户信息获取成功`)
          initializeWebSocket()
        })
        .catch((err) => {
          console.warn(`[应用初始化] ${platformName}获取用户信息失败:`, err.message)
        })
    } else {
      // 授权登录失败是致命错误
      console.error(`[应用初始化] ${platformName}授权登录失败:`, loginErr.message)
      throw loginErr
    }
  } else {
    console.log(`[应用初始化] ${platformName}无授权回调参数，跳过自动登录`)
  }
}
```

### WebSocket初始化

登录成功后会自动初始化WebSocket连接：

```typescript
// 内部实现
const initializeWebSocket = () => {
  // 所有检查逻辑都在 webSocket.initialize() 内部处理
  const wsInstance = webSocket.initialize(undefined, {
    onConnected: () => {
      // WebSocket连接建立成功
    },
    onDisconnected: (code, reason) => {
      // WebSocket连接断开
    },
    onError: (error) => {
      console.error('[应用初始化] WebSocket连接错误', error)
    },
    onMessage: (data) => {
      // 收到WebSocket消息
      // 可以在这里添加应用级别的消息处理逻辑
    },
  })

  // 如果初始化成功，建立连接
  if (wsInstance) {
    webSocket.connect()
  }
}
```

## 内部实现

### 单例模式与Promise缓存

```typescript
/** 是否已完成初始化 */
const isInitialized = ref(false)

/** 是否正在初始化中 */
const isInitializing = ref(false)

/** 初始化Promise缓存 - 确保同一时间只有一个初始化过程 */
let initPromise: Promise<void> | null = null

const initializeApp = async (): Promise<void> => {
  const platformName = getCurrentPlatformName()

  // 单例检查：已初始化则直接返回
  if (isInitialized.value) {
    console.log(`[应用初始化] ${platformName}环境已完成，跳过重复初始化`)
    return Promise.resolve()
  }

  // Promise缓存：正在初始化则返回缓存的Promise
  if (initPromise) {
    console.log(`[应用初始化] ${platformName}环境正在初始化中，等待完成...`)
    return initPromise
  }

  // 创建新的初始化Promise并缓存
  isInitializing.value = true
  initPromise = (async () => {
    // ... 初始化逻辑
  })()

  return initPromise
}
```

### APP/普通H5平台处理

```typescript
// 不需要租户ID初始化的平台，但仍需检查用户状态
if (!shouldInitialize()) {
  console.log(`[应用初始化] ${platformName}环境无需租户ID初始化`)

  const userStore = useUserStore()

  // 检查是否有token，有则获取用户信息
  if (userStore.token) {
    console.log(`[应用初始化] ${platformName}检测到token，获取用户信息`)
    try {
      userStore.fetchUserInfo().then(() => {
        console.log(`[应用初始化] ${platformName}用户信息获取成功`)
        // 用户信息获取成功后初始化WebSocket
        initializeWebSocket()
      })
    } catch (err) {
      console.warn(`[应用初始化] ${platformName}获取用户信息失败:`, err.message)
    }
  } else {
    console.log(`[应用初始化] ${platformName}无token，跳过用户信息获取`)
  }

  isInitialized.value = true
  return Promise.resolve()
}
```

### waitForInit 实现

```typescript
const waitForInit = async (timeout: number = 10000): Promise<void> => {
  // 已初始化直接返回
  if (isInitialized.value) return Promise.resolve()

  // 不需要初始化的平台直接标记完成
  if (!shouldInitialize()) {
    isInitialized.value = true
    return Promise.resolve()
  }

  // 有缓存Promise则等待，带超时处理
  if (initPromise) {
    await Promise.race([
      initPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('等待初始化超时')), timeout)
      ),
    ])
    return
  }

  // 否则触发初始化
  await initializeApp()
}
```

### 错误分类处理

```typescript
catch (error) {
  console.error(`[应用初始化] ${platformName}环境初始化失败:`, error)

  // 根据错误类型决定是否抛出异常
  if (error instanceof Error && error.message.includes('租户ID')) {
    // 租户ID获取失败是致命错误，抛出异常
    throw error
  } else {
    // 登录失败不是致命错误，只记录日志，允许应用继续启动
    console.warn(`[应用初始化] ${platformName}登录失败，但允许应用继续启动`)
    isInitialized.value = true
  }
} finally {
  isInitializing.value = false
  initPromise = null
}
```

## API

### useAppInit 返回值

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| initializeApp | 执行应用初始化 | - | `Promise<void>` |
| waitForInit | 等待初始化完成 | `timeout?: number` | `Promise<void>` |

### 导出的全局方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| initializeApp | 全局初始化方法 | - | `Promise<void>` |
| waitForInit | 全局等待方法 | `timeout?: number` | `Promise<void>` |

### waitForInit 参数

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| timeout | 等待超时时间（毫秒） | `number` | `10000` |

## 类型定义

```typescript
/**
 * useAppInit 组合函数返回类型
 */
interface UseAppInitReturn {
  /** 执行应用初始化 */
  initializeApp: () => Promise<void>
  /** 等待初始化完成 */
  waitForInit: (timeout?: number) => Promise<void>
}

/**
 * useAppInit 组合函数
 */
declare function useAppInit(): UseAppInitReturn

/**
 * 全局初始化方法
 */
declare const initializeApp: () => Promise<void>

/**
 * 全局等待初始化方法
 */
declare const waitForInit: (timeout?: number) => Promise<void>

/**
 * 默认导出的全局实例
 */
declare const globalAppInit: UseAppInitReturn
export default globalAppInit
```

## 内部状态

组件内部维护以下状态，用于控制初始化流程：

| 状态 | 说明 | 类型 | 初始值 |
|------|------|------|--------|
| isInitialized | 是否已完成初始化 | `Ref<boolean>` | `false` |
| isInitializing | 是否正在初始化中 | `Ref<boolean>` | `false` |
| initPromise | 初始化Promise缓存 | `Promise<void> \| null` | `null` |

### 状态流转

```
初始状态:
  isInitialized = false
  isInitializing = false
  initPromise = null

调用 initializeApp():
  isInitialized = false
  isInitializing = true
  initPromise = Promise

初始化完成:
  isInitialized = true
  isInitializing = false
  initPromise = null
```

## 最佳实践

### 1. 配合功能配置使用

在初始化应用前，先加载系统功能配置：

```vue
<script setup lang="ts">
import { initializeApp } from '@/composables/useAppInit'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

onLaunch(async () => {
  try {
    // 先加载功能配置（WebSocket等功能依赖此配置）
    await featureStore.initFeatures()
    // 再执行应用初始化
    await initializeApp()
    console.log('应用初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})
</script>
```

### 2. 在路由守卫中使用

确保页面加载前初始化完成：

```typescript
// router/guards.ts
import { waitForInit } from '@/composables/useAppInit'

export const beforeEach = async (to, from) => {
  // 等待应用初始化完成
  try {
    await waitForInit(5000)
  } catch (error) {
    console.error('应用初始化超时')
    // 可以选择跳转到错误页面
    return { name: 'error', query: { msg: '初始化超时' } }
  }

  // 继续路由逻辑
  return true
}
```

### 3. 在请求拦截器中使用

确保请求发送前初始化完成，保证租户ID已获取：

```typescript
// 在 useHttp 中的实现
import { waitForInit } from '@/composables/useAppInit'

const request = async (config) => {
  // 等待应用初始化完成（确保租户ID已获取）
  await waitForInit()

  // 获取租户ID并添加到请求头
  const tenantId = cache.get(TENANT_STORAGE_KEY)
  if (tenantId) {
    config.header['tenant-id'] = tenantId
  }

  // 发送请求
  return http.request(config)
}
```

### 4. 处理初始化失败

根据错误类型分别处理：

```typescript
onLaunch(async () => {
  try {
    await initializeApp()
  } catch (error) {
    // 租户ID获取失败是致命错误
    if (error.message.includes('租户ID')) {
      uni.showModal({
        title: '初始化失败',
        content: '无法获取应用配置，请检查网络后重试',
        showCancel: false,
        success: () => {
          // 可以选择退出应用或重试
          // #ifdef APP-PLUS
          plus.runtime.quit()
          // #endif
        }
      })
    } else {
      // 其他错误记录日志，应用继续运行
      console.error('初始化异常:', error)
    }
  }
})
```

### 5. 在页面中确保初始化完成

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { waitForInit } from '@/composables/useAppInit'

const loading = ref(true)
const userData = ref(null)

onMounted(async () => {
  try {
    // 确保初始化完成
    await waitForInit()

    // 加载页面数据
    userData.value = await fetchUserData()
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'error' })
  } finally {
    loading.value = false
  }
})
</script>
```

### 6. 调试初始化流程

通过控制台日志追踪初始化流程：

```typescript
// 初始化日志示例
// [应用初始化] 微信小程序环境开始初始化...
// [应用初始化] 微信小程序开始获取租户ID...
// [应用初始化] 微信小程序租户ID获取成功: 1
// [应用初始化] 微信小程序开始静默登录...
// [应用初始化] 微信小程序静默登录成功
// [应用初始化] 微信小程序用户信息获取成功
// [应用初始化] 微信小程序环境初始化完成
```

### 7. 分环境配置超时时间

```typescript
// 根据环境配置不同的超时时间
const getInitTimeout = () => {
  // #ifdef H5
  return 5000  // H5 网络较快，5秒超时
  // #endif

  // #ifdef MP
  return 10000  // 小程序网络可能较慢，10秒超时
  // #endif

  // #ifdef APP-PLUS
  return 8000  // APP 中等超时
  // #endif

  return 10000  // 默认10秒
}

await waitForInit(getInitTimeout())
```

### 8. 结合页面生命周期

```vue
<script setup lang="ts">
import { waitForInit } from '@/composables/useAppInit'

// 页面加载时等待初始化
onLoad(async () => {
  await waitForInit()
  // 初始化完成后执行页面逻辑
})

// 页面显示时检查状态
onShow(() => {
  // 可以在这里检查用户登录状态等
})
</script>
```

## 常见问题

### 1. 初始化被重复调用怎么办？

`useAppInit` 内部实现了单例模式和Promise缓存机制，即使多次调用也只会执行一次初始化：

```typescript
// 内部实现
if (isInitialized.value) {
  console.log(`[应用初始化] ${platformName}环境已完成，跳过重复初始化`)
  return Promise.resolve()
}

if (initPromise) {
  console.log(`[应用初始化] ${platformName}环境正在初始化中，等待完成...`)
  return initPromise
}
```

### 2. 如何判断当前平台？

可以使用 `@/utils/platform` 中的工具函数：

```typescript
import { isApp, isMp, isWechatOfficialH5, isAlipayOfficialH5, platform } from '@/utils/platform'

if (isApp) {
  // APP 环境
} else if (isMp) {
  // 小程序环境
  console.log('小程序平台:', platform) // mp-weixin, mp-alipay 等
} else if (isWechatOfficialH5) {
  // 微信公众号H5
} else if (isAlipayOfficialH5) {
  // 支付宝H5
}
```

### 3. 登录失败会阻止应用启动吗？

不会。登录失败被视为非致命错误，应用会继续启动，用户可以手动登录。但租户ID获取失败是致命错误，会抛出异常：

```typescript
// 内部实现
catch (error) {
  // 租户ID获取失败是致命错误
  if (error instanceof Error && error.message.includes('租户ID')) {
    throw error
  } else {
    // 登录失败不是致命错误，允许应用继续启动
    console.warn(`[应用初始化] ${platformName}登录失败，但允许应用继续启动`)
    isInitialized.value = true
  }
}
```

### 4. WebSocket 何时连接？

WebSocket 在用户登录成功并获取用户信息后自动连接：

```typescript
// 用户信息获取成功后初始化WebSocket
userStore.fetchUserInfo().then(() => {
  initializeWebSocket()
})
```

### 5. waitForInit 超时后会怎样？

超时后会抛出错误，需要在调用处捕获处理：

```typescript
try {
  await waitForInit(5000) // 5秒超时
} catch (error) {
  if (error.message === '等待初始化超时') {
    // 处理超时情况
    console.error('初始化超时，请检查网络')
    // 可以选择重试或显示错误页面
  }
}
```

### 6. 如何在初始化完成前显示加载状态？

可以使用 loading 状态配合初始化：

```vue
<template>
  <view v-if="appLoading" class="loading-page">
    <wd-loading size="64" />
    <text>应用加载中...</text>
  </view>
  <view v-else>
    <!-- 应用主体内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { initializeApp } from '@/composables/useAppInit'

const appLoading = ref(true)

onLaunch(async () => {
  try {
    await initializeApp()
  } finally {
    appLoading.value = false
  }
})
</script>
```

### 7. 如何手动重新初始化？

由于单例模式限制，不支持直接重新初始化。如需重新执行，可以刷新应用：

```typescript
// 小程序中可以使用 reLaunch
uni.reLaunch({ url: '/pages/index/index' })

// H5 中可以刷新页面
// #ifdef H5
window.location.reload()
// #endif
```

### 8. 微信H5授权参数会一直保留在URL中吗？

不会。登录成功后会自动清除URL中的授权参数：

```typescript
// 清除URL中的授权参数
const newUrl = window.location.pathname + window.location.hash
window.history.replaceState({}, document.title, newUrl)
```

### 9. 多个页面同时调用 waitForInit 会怎样？

由于使用 Promise 缓存机制，多个页面同时调用 `waitForInit` 会共享同一个 Promise，不会触发多次初始化：

```typescript
// 页面A
await waitForInit()  // 触发初始化

// 页面B（几乎同时）
await waitForInit()  // 等待页面A触发的初始化完成

// 页面C（稍后）
await waitForInit()  // 初始化已完成，直接返回
```

### 10. 初始化顺序有什么要求？

必须先调用 `featureStore.initFeatures()` 再调用 `initializeApp()`，因为 WebSocket 初始化依赖功能配置：

```typescript
// 正确顺序
await featureStore.initFeatures()  // 1. 先加载功能配置
await initializeApp()               // 2. 再执行应用初始化

// 错误顺序 - WebSocket可能无法正常初始化
await initializeApp()               // ❌ 此时功能配置还未加载
await featureStore.initFeatures()
```

## 注意事项

1. **初始化顺序** - 确保在调用 `initializeApp` 前已完成必要的前置配置（如功能配置 `featureStore.initFeatures()`）

2. **错误处理** - 租户ID获取失败是致命错误，需要妥善处理并给用户提示

3. **平台差异** - 不同平台的初始化行为不同，注意在各平台上充分测试

4. **Token持久化** - 初始化时会检查本地存储的Token，确保Token存储逻辑正确

5. **WebSocket依赖** - WebSocket连接依赖功能配置（featureStore）和用户登录状态

6. **异步操作** - 所有初始化方法都是异步的，需要使用 `await` 或 `.then()` 处理

7. **超时设置** - `waitForInit` 默认超时10秒，对于网络较慢的环境可适当增加

8. **日志级别** - 生产环境建议关闭或减少初始化日志输出

9. **单例限制** - 由于单例模式，无法在运行时重新初始化，需要重启应用

10. **并发安全** - Promise缓存机制确保并发调用安全，不会产生竞态条件
