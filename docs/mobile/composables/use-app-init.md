# useAppInit 应用初始化

## 介绍

`useAppInit` 是应用级别的初始化组合式函数，负责在应用启动时根据不同平台执行相应的初始化流程。它是整个应用的启动入口，处理租户ID获取、用户自动登录、WebSocket连接等核心初始化逻辑。

**核心特性:**

- **多平台适配** - 根据运行平台自动选择初始化策略
- **租户ID管理** - 小程序和公众号H5自动获取租户ID
- **自动登录** - 支持小程序静默登录和微信H5授权登录
- **WebSocket初始化** - 用户登录后自动建立WebSocket连接
- **单例模式** - 确保初始化流程只执行一次
- **错误容错** - 登录失败不影响应用启动

## 平台初始化策略

不同平台的初始化行为不同：

| 平台 | 租户ID初始化 | 自动登录 | WebSocket |
|------|-------------|---------|-----------|
| APP | ❌ 跳过 | ❌ 手动登录 | ✅ 登录后连接 |
| 普通H5 | ❌ 跳过 | ❌ 手动登录 | ✅ 登录后连接 |
| 微信公众号H5 | ✅ 执行 | ✅ 授权登录 | ✅ 登录后连接 |
| 支付宝H5 | ✅ 执行 | ❌ 手动登录 | ✅ 登录后连接 |
| 微信小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 |
| 支付宝小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 |
| 其他小程序 | ✅ 执行 | ✅ 静默登录 | ✅ 登录后连接 |

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

## 初始化流程详解

### 完整初始化流程

```
应用启动 (onLaunch)
    │
    ▼
判断平台类型
    │
    ├─── APP/普通H5 ──────────────────┐
    │                                  │
    │    检查是否有Token               │
    │         │                        │
    │    ├─ 有Token → 获取用户信息     │
    │    │              │              │
    │    │         初始化WebSocket     │
    │    │                             │
    │    └─ 无Token → 跳过             │
    │                                  │
    │                                  ▼
    │                            初始化完成
    │
    └─── 小程序/公众号H5 ─────────────┐
                                       │
         获取租户ID (通过appid)        │
              │                        │
         ├─ 成功 → 存储租户ID          │
         │              │              │
         │    检查Token/执行自动登录   │
         │              │              │
         │    ├─ 小程序 → 静默登录     │
         │    │                        │
         │    ├─ 微信H5 → 授权登录     │
         │    │                        │
         │    └─ 已有Token → 获取用户  │
         │                             │
         │    登录成功后初始化WebSocket │
         │                             │
         └─ 失败 → 抛出错误            │
                                       ▼
                                 初始化完成
```

### 小程序静默登录

小程序平台会自动执行静默登录：

```typescript
// 内部实现逻辑
if (isMp) {
  console.log('小程序开始静默登录...')
  const [loginErr] = await userStore.loginWithMiniapp()

  if (!loginErr) {
    console.log('静默登录成功')
    // 获取用户信息
    await userStore.fetchUserInfo()
    // 初始化WebSocket
    initializeWebSocket()
  } else {
    console.warn('静默登录失败:', loginErr.message)
    // 登录失败不阻止应用启动，用户可手动登录
  }
}
```

### 微信公众号H5授权登录

微信公众号H5会检测URL中的授权回调参数：

```typescript
// 内部实现逻辑
if (isWechatOfficialH5) {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  if (code && state) {
    console.log('检测到授权回调，开始登录...')
    const [loginErr] = await userStore.loginWithMp({ code, state })

    if (!loginErr) {
      // 清除URL中的授权参数
      const newUrl = window.location.pathname + window.location.hash
      window.history.replaceState({}, document.title, newUrl)

      // 获取用户信息并初始化WebSocket
      await userStore.fetchUserInfo()
      initializeWebSocket()
    }
  }
}
```

## API

### useAppInit 返回值

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| initializeApp | 执行应用初始化 | - | `Promise<void>` |
| waitForInit | 等待初始化完成 | `timeout?: number` | `Promise<void>` |

### 导出的全局方法

除了组合函数形式，还可以直接导入全局方法：

```typescript
import { initializeApp, waitForInit } from '@/composables/useAppInit'
```

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
```

## 内部状态

组件内部维护以下状态：

| 状态 | 说明 | 类型 |
|------|------|------|
| isInitialized | 是否已完成初始化 | `Ref<boolean>` |
| isInitializing | 是否正在初始化中 | `Ref<boolean>` |
| initPromise | 初始化Promise缓存 | `Promise<void> \| null` |

## 最佳实践

### 1. 配合功能配置使用

在初始化应用前，先加载系统功能配置：

```vue
<script setup lang="ts">
import { initializeApp } from '@/composables/useAppInit'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

onLaunch(async () => {
  // 先加载功能配置（WebSocket等功能依赖此配置）
  await featureStore.initFeatures()
  // 再执行应用初始化
  await initializeApp()
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
  }

  // 继续路由逻辑
  return true
}
```

### 3. 在请求拦截器中使用

确保请求发送前初始化完成：

```typescript
// 在 useHttp 中的实现
import { waitForInit } from '@/composables/useAppInit'

const request = async (config) => {
  // 等待应用初始化完成（确保租户ID已获取）
  await waitForInit()

  // 发送请求
  return http.request(config)
}
```

### 4. 处理初始化失败

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
        }
      })
    }
  }
})
```

## 常见问题

### 1. 初始化被重复调用怎么办？

`useAppInit` 内部实现了单例模式和Promise缓存机制，即使多次调用也只会执行一次初始化：

```typescript
// 内部实现
if (isInitialized.value) {
  console.log('已完成初始化，跳过重复初始化')
  return Promise.resolve()
}

if (initPromise) {
  console.log('正在初始化中，等待完成...')
  return initPromise
}
```

### 2. 如何判断当前平台？

可以使用 `@/utils/platform` 中的工具函数：

```typescript
import { isApp, isMp, isWechatOfficialH5, platform } from '@/utils/platform'

if (isApp) {
  // APP 环境
} else if (isMp) {
  // 小程序环境
  console.log('小程序平台:', platform) // mp-weixin, mp-alipay 等
} else if (isWechatOfficialH5) {
  // 微信公众号H5
}
```

### 3. 登录失败会阻止应用启动吗？

不会。登录失败被视为非致命错误，应用会继续启动，用户可以手动登录：

```typescript
// 内部实现
catch (error) {
  if (error.message.includes('租户ID')) {
    // 租户ID获取失败是致命错误，抛出异常
    throw error
  } else {
    // 登录失败不是致命错误，允许应用继续启动
    console.warn('登录失败，但允许应用继续启动')
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
  }
}
```

## 注意事项

1. **初始化顺序** - 确保在调用 `initializeApp` 前已完成必要的前置配置（如功能配置）
2. **错误处理** - 租户ID获取失败是致命错误，需要妥善处理
3. **平台差异** - 不同平台的初始化行为不同，注意测试各平台表现
4. **Token持久化** - 初始化时会检查本地存储的Token，确保Token存储逻辑正确
5. **WebSocket依赖** - WebSocket连接依赖功能配置和用户登录状态
