# 启动性能优化

## 介绍

启动性能是用户体验的第一印象,直接影响用户对应用的感知。一个快速启动的应用能够显著提升用户满意度和留存率。在 UniApp 应用中,启动过程包括多个阶段:应用初始化、首页渲染、数据加载等,每个阶段都有优化空间。

本文档详细介绍 RuoYi-Plus-UniApp 项目中的启动性能优化策略,涵盖应用生命周期管理、初始化流程优化、代码分包加载、预加载策略、启动监控等核心内容。通过合理应用这些优化技术,可以将应用启动时间缩短 30%-50%。

**核心优化策略:**

- **应用生命周期优化** - 合理利用 `onLaunch`、`onShow`、`onHide` 等生命周期,避免重复初始化
- **异步初始化流程** - 租户 ID 获取、自动登录、WebSocket 连接等按需异步加载
- **按需加载策略** - 使用 `lazyCodeLoading` 按需注入,减少首屏加载代码量
- **分包异步化** - 启用 `bigPackageSizeSupport` 支持分包异步化加载
- **预加载优化** - 合理使用页面预加载,提升页面切换体验
- **启动监控** - 使用性能监控 API 追踪启动各阶段耗时,发现性能瓶颈

---

## 应用生命周期管理

### 生命周期概述

UniApp 提供了完整的应用生命周期钩子,合理使用这些钩子是启动性能优化的基础。

**生命周期执行顺序:**

```text
1. onLaunch (应用初始化,仅执行一次)
2. onShow (应用显示,首次启动和从后台进入前台都会触发)
3. onHide (应用隐藏,进入后台时触发)
4. onError (应用错误捕获)
5. onPageNotFound (页面未找到)
```

### onLaunch - 应用启动优化

`onLaunch` 是应用启动时执行的第一个生命周期,应该只包含必要的初始化逻辑。

**App.vue 中的启动流程:**

```vue
<script setup lang="ts">
import { initializeApp } from '@/composables/useAppInit'
import { webSocket } from '@/composables/useWebSocket'
import { useMessage, useToast } from '@/wd'
import { isMp, isApp } from '@/utils/platform'
import { useFeatureStore } from '@/stores/modules/feature'

// 标识是否是首次启动(避免onShow重复处理)
let isFirstLaunch = true

const message = useMessage()
const toast = useToast()
const featureStore = useFeatureStore()

/**
 * 应用启动生命周期
 *
 * 执行流程:
 * 1. 根据平台判断是否需要租户ID初始化
 * 2. 根据平台判断是否需要自动登录(小程序静默登录、微信H5授权登录等)
 * 3. 初始化完成后,所有后续的HTTP请求都能正确携带租户ID
 * 4. 如果租户ID初始化失败,会阻止应用正常启动
 * 5. 如果自动登录失败,应用仍可正常启动,用户可手动登录
 * 6. 用户登录成功后会自动初始化WebSocket连接
 */
onLaunch(async () => {
  // 先初始化系统功能配置(WebSocket需要依赖此配置)
  await featureStore.initFeatures()
  // 开始应用初始化(主要是获取租户ID、自动登录、初始化WebSocket)
  await initializeApp()
  // 初始化完成后检查更新
  checkUpdate()
})

/**
 * 应用显示生命周期
 *
 * 当应用从后台进入前台时触发
 * 处理WebSocket重连和其他恢复逻辑
 */
onShow(() => {
  console.log('👁️  应用显示 - App Show')
  // 如果是首次启动,跳过处理(因为onLaunch已经处理过了)
  if (isFirstLaunch) {
    console.log('ℹ️  首次启动,跳过onShow中的WebSocket处理')
    isFirstLaunch = false
    return
  }
  // 重新初始化并连接WebSocket
  if (webSocket.initialize()) {
    webSocket.connect()
  }
})

/**
 * 应用隐藏生命周期
 *
 * 当应用从前台进入后台时触发
 * 处理WebSocket断开和其他清理逻辑
 */
onHide(() => {
  console.log('🙈 应用隐藏 - App Hide')
  // 可以在此添加其他后台逻辑
  // 例如:保存状态、清理定时器、暂停不必要的任务等
})

/**
 * 应用错误处理
 *
 * 捕获应用级别的错误
 */
onError((error) => {
  console.error('💥 应用发生错误:', error)
  // 可以在此进行错误上报或其他错误处理
})

/**
 * 页面未找到处理
 *
 * 当页面路由不存在时触发
 */
onPageNotFound((res) => {
  console.warn('🔍 页面未找到:', res)
  // 重定向到首页或错误页面
  uni.navigateTo({
    url: '/pages/index/index',
  })
})
</script>
```

**优化要点:**

1. **避免阻塞操作** - 不要在 `onLaunch` 中执行耗时同步操作
2. **异步并发加载** - 使用 `async/await` 和 `Promise.all` 并发执行独立的异步任务
3. **首次启动标识** - 使用 `isFirstLaunch` 标识避免 `onShow` 重复处理
4. **错误处理** - 区分致命错误(如租户ID获取失败)和非致命错误(如登录失败)

### onShow 和 onHide - 前后台切换优化

**合理使用 onShow:**

```typescript
// ✅ 推荐:只在必要时重新连接资源
onShow(() => {
  // 跳过首次启动(onLaunch已处理)
  if (isFirstLaunch) {
    isFirstLaunch = false
    return
  }

  // 重新连接WebSocket
  if (webSocket.initialize()) {
    webSocket.connect()
  }

  // 刷新页面数据(如果需要)
  // refreshPageData()
})

// ❌ 不推荐:每次都执行完整初始化
onShow(() => {
  initializeApp() // 不必要的重复初始化
  webSocket.connect() // 可能导致重复连接
})
```

**合理使用 onHide:**

```typescript
// ✅ 推荐:清理不必要的资源
onHide(() => {
  // 保存应用状态
  saveAppState()

  // 清理定时器
  clearAllTimers()

  // 暂停音视频播放
  pauseMedia()

  // 注意:WebSocket 不需要在这里断开,UniApp会自动处理
})

// ❌ 不推荐:过度清理
onHide(() => {
  webSocket.disconnect() // 不必要,UniApp会自动管理
  clearAllCache() // 过度清理,影响恢复速度
})
```

---

## 应用初始化流程优化

### 初始化状态管理

使用 `useAppInit` Composable 管理应用初始化状态,确保初始化只执行一次。

**useAppInit.ts 核心实现:**

```typescript
import { ref } from 'vue'
import { getTenantIdByAppid } from '@/api/app/home/homeApi'
import { cache } from '@/utils/cache'
import { TENANT_STORAGE_KEY } from '@/utils/tenant'
import { isApp, isMp, isWechatOfficialH5, isAlipayOfficialH5, platform } from '@/utils/platform'
import { webSocket } from '@/composables/useWebSocket'

/**
 * 应用初始化状态管理
 *
 * 根据平台自动判断是否需要获取租户ID和执行自动登录:
 * - APP、普通H5: 跳过初始化
 * - 微信公众号H5、支付宝H5、小程序: 执行租户ID初始化 + 自动登录 + WebSocket连接
 */

// 是否已完成初始化
const isInitialized = ref(false)

// 是否正在初始化中
const isInitializing = ref(false)

// 初始化Promise缓存 - 确保同一时间只有一个初始化过程
let initPromise: Promise<void> | null = null

/**
 * 判断当前平台是否需要执行初始化
 */
const shouldInitialize = (): boolean => {
  if (isApp) return false
  if (isWechatOfficialH5 || isAlipayOfficialH5) return true
  if (isMp) return true
  return false
}

/**
 * 获取当前平台名称
 */
const getCurrentPlatformName = (): string => {
  if (isApp) return 'APP'
  if (isWechatOfficialH5) return '微信公众号H5'
  if (isAlipayOfficialH5) return '支付宝H5'
  if (isMp) {
    switch (platform) {
      case 'mp-weixin':
        return '微信小程序'
      case 'mp-alipay':
        return '支付宝小程序'
      case 'mp-baidu':
        return '百度小程序'
      case 'mp-toutiao':
        return '字节跳动小程序'
      case 'mp-qq':
        return 'QQ小程序'
      default:
        return '小程序'
    }
  }
  return platform === 'h5' ? '普通H5' : '未知平台'
}

export const useAppInit = () => {
  /**
   * 执行应用初始化
   * 包括租户ID获取、用户自动登录和WebSocket连接
   */
  const initializeApp = async (): Promise<void> => {
    const platformName = getCurrentPlatformName()

    // 已初始化,直接返回
    if (isInitialized.value) {
      console.log(`[应用初始化] ${platformName}环境已完成,跳过重复初始化`)
      return Promise.resolve()
    }

    // 正在初始化,等待完成
    if (initPromise) {
      console.log(`[应用初始化] ${platformName}环境正在初始化中,等待完成...`)
      return initPromise
    }

    // 不需要租户ID初始化的平台,但仍需检查用户状态
    if (!shouldInitialize()) {
      console.log(`[应用初始化] ${platformName}环境无需租户ID初始化`)

      const userStore = useUserStore()

      // 检查是否有token,有则获取用户信息
      if (userStore.token) {
        console.log(`[应用初始化] ${platformName}检测到token,获取用户信息`)
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
        console.log(`[应用初始化] ${platformName}无token,跳过用户信息获取`)
      }

      isInitialized.value = true
      return Promise.resolve()
    }

    // 需要初始化的平台执行租户ID获取和自动登录
    console.log(`[应用初始化] ${platformName}环境开始初始化...`)
    isInitializing.value = true

    initPromise = (async () => {
      try {
        const userStore = useUserStore()

        // 第一步:获取租户ID
        console.log(`[应用初始化] ${platformName}开始获取租户ID...`)
        const appid = userStore.getCurrentPlatformAppid()
        const [err, data] = await getTenantIdByAppid(appid)

        if (!err && data) {
          cache.set(TENANT_STORAGE_KEY, data)
          console.log(`[应用初始化] ${platformName}租户ID获取成功: ${data}`)
        } else {
          const error = err || new Error('获取租户ID失败:返回数据为空')
          console.error(`[应用初始化] ${platformName}获取租户ID失败:`, error.message)
          throw error
        }

        // 第二步:检查是否需要自动登录
        if (userStore.token) {
          // 已有token,获取用户信息
          console.log(`[应用初始化] ${platformName}已有token,跳过自动登录`)
          userStore
            .fetchUserInfo()
            .then(() => {
              console.log(`[应用初始化] ${platformName}用户信息获取成功`)
              initializeWebSocket()
            })
            .catch((err) => {
              console.warn(`[应用初始化] ${platformName}获取用户信息失败:`, err.message)
            })
        } else if (isMp) {
          // 小程序静默登录
          console.log(`[应用初始化] ${platformName}开始静默登录...`)
          const [loginErr] = await userStore.loginWithMiniapp()
          if (!loginErr) {
            console.log(`[应用初始化] ${platformName}静默登录成功`)
            userStore
              .fetchUserInfo()
              .then(() => {
                console.log(`[应用初始化] ${platformName}用户信息获取成功`)
                initializeWebSocket()
              })
              .catch((err) => {
                console.warn(`[应用初始化] ${platformName}获取用户信息失败:`, err.message)
              })
          } else {
            console.warn(`[应用初始化] ${platformName}静默登录失败:`, loginErr.message)
            // 小程序静默登录失败不抛出错误,让用户手动登录
          }
        } else if (isWechatOfficialH5) {
          // 微信公众号H5授权登录
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          const state = urlParams.get('state')

          if (code && state) {
            console.log(`[应用初始化] ${platformName}检测到授权回调,开始登录...`)
            const [loginErr] = await userStore.loginWithMp({ code, state })
            if (!loginErr) {
              console.log(`[应用初始化] ${platformName}授权登录成功`)
              // 清除URL中的授权参数
              const newUrl = window.location.pathname + window.location.hash
              window.history.replaceState({}, document.title, newUrl)
              userStore
                .fetchUserInfo()
                .then(() => {
                  console.log(`[应用初始化] ${platformName}用户信息获取成功`)
                  initializeWebSocket()
                })
                .catch((err) => {
                  console.warn(`[应用初始化] ${platformName}获取用户信息失败:`, err.message)
                })
            } else {
              console.error(`[应用初始化] ${platformName}授权登录失败:`, loginErr.message)
              throw loginErr
            }
          } else {
            console.log(`[应用初始化] ${platformName}无授权回调参数,跳过自动登录`)
          }
        }

        isInitialized.value = true
        console.log(`[应用初始化] ${platformName}环境初始化完成`)
      } catch (error) {
        console.error(`[应用初始化] ${platformName}环境初始化失败:`, error)
        // 根据错误类型决定是否抛出异常
        if (error instanceof Error && error.message.includes('租户ID')) {
          // 租户ID获取失败是致命错误,抛出异常
          throw error
        } else {
          // 登录失败不是致命错误,只记录日志,允许应用继续启动
          console.warn(`[应用初始化] ${platformName}登录失败,但允许应用继续启动`)
          isInitialized.value = true
        }
      } finally {
        isInitializing.value = false
        initPromise = null
      }
    })()

    return initPromise
  }

  /**
   * 等待应用初始化完成
   */
  const waitForInit = async (timeout: number = 10000): Promise<void> => {
    if (isInitialized.value) return Promise.resolve()

    if (!shouldInitialize()) {
      isInitialized.value = true
      return Promise.resolve()
    }

    if (initPromise) {
      await Promise.race([
        initPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('等待初始化超时')), timeout)
        ),
      ])
      return
    }

    await initializeApp()
  }

  return {
    initializeApp,
    waitForInit,
  }
}

// 创建全局实例
const globalAppInit = useAppInit()
export const { initializeApp, waitForInit } = globalAppInit
export default globalAppInit
```

**优化要点:**

1. **单例模式** - 使用 `initPromise` 缓存确保初始化只执行一次
2. **平台判断** - 根据平台类型决定是否需要初始化,避免不必要的操作
3. **错误分级** - 区分致命错误和非致命错误,灵活处理失败情况
4. **状态管理** - 使用 `isInitialized` 和 `isInitializing` 追踪初始化状态
5. **超时保护** - `waitForInit` 提供超时机制,防止无限等待

### 应用入口优化

**main.ts 精简入口:**

```typescript
import '@/static/style/index.scss'
import 'uno.css'
import { createSSRApp } from 'vue'

import App from './App.vue'
// Pinia状态管理
import store from '@/stores/store'
// 开发环境日志收集器
import { logger } from '@/utils/logger'

export const createApp = () => {
  const app = createSSRApp(App)
  app.use(store)

  // 初始化日志收集器(自动判断开发环境)
  logger.init()

  return {
    app,
  }
}
```

**优化要点:**

1. **最小化导入** - 只导入必要的模块,减少启动时解析的代码量
2. **延迟加载** - 非关键模块在使用时再动态导入
3. **条件初始化** - 开发工具(如 logger)根据环境条件初始化

### 延迟初始化非关键功能

**示例:延迟加载WebSocket**

```typescript
// ✅ 推荐:用户登录成功后再初始化WebSocket
const initializeWebSocket = () => {
  const wsInstance = webSocket.initialize(undefined, {
    onConnected: () => {
      console.log('[应用初始化] WebSocket连接建立成功')
    },
    onError: (error) => {
      console.error('[应用初始化] WebSocket连接错误', error)
    },
  })

  if (wsInstance) {
    webSocket.connect()
  }
}

// 登录成功后初始化
userStore.fetchUserInfo().then(() => {
  initializeWebSocket() // 延迟到登录后
})

// ❌ 不推荐:启动时立即初始化所有功能
onLaunch(async () => {
  await initDatabase()      // 数据库
  await initWebSocket()     // WebSocket
  await initPush()          // 推送
  await initAnalytics()     // 统计
  await initAd()            // 广告
  // 启动时间过长
})
```

---

## 按需加载优化

### lazyCodeLoading - 按需注入

启用按需注入可以显著减少小程序启动时加载的代码量。

**manifest.config.ts 配置:**

```typescript
export default defineManifestConfig({
  // 微信小程序配置
  'mp-weixin': {
    appid: VITE_WECHAT_MINI_APP_ID,
    setting: {
      urlCheck: false,
      es6: true,
      enhance: true,
      postcss: true,
      minified: true,
      bigPackageSizeSupport: true, // 支持分包异步化
    },
    // 按需注入 - 只注入当前页面需要的组件和API
    lazyCodeLoading: 'requiredComponents',
  },
})
```

**lazyCodeLoading 选项:**

| 值 | 说明 | 适用场景 |
|----|------|---------|
| `'requiredComponents'` | 按需注入,只加载当前页面使用的组件 | ✅ 推荐,适用于大部分场景 |
| `''` 或不设置 | 全量注入,启动时加载所有代码 | 小程序代码量很少时 |

**优化效果:**

- **启动时间** - 减少 20%-30% 启动加载时间
- **首屏渲染** - 首屏代码量减少 40%-50%
- **内存占用** - 初始内存占用减少 30%

**使用注意事项:**

1. **插件兼容性** - 部分第三方插件可能不支持按需注入
2. **动态组件** - 使用动态组件时需确保组件已注入
3. **自定义组件** - 自定义组件需正确配置 `usingComponents`

### bigPackageSizeSupport - 分包异步化

启用分包异步化支持,允许分包按需加载。

**manifest.config.ts 配置:**

```typescript
export default defineManifestConfig({
  'mp-weixin': {
    setting: {
      bigPackageSizeSupport: true, // 启用分包异步化
    },
  },
})
```

**分包异步化优势:**

1. **主包体积控制** - 主包只包含核心功能,控制在 2MB 以内
2. **首屏加载优化** - 启动时只加载主包,分包在使用时再加载
3. **总包大小扩展** - 支持单个分包最大 20MB,总包最大 24MB

**分包加载策略:**

```typescript
// pages.config.ts 或 uni-pages 插件配置
export default {
  pages: [
    // 主包页面 - 启动时加载
    {
      path: 'pages/index/index',
      style: { navigationBarTitleText: '首页' },
    },
  ],
  subPackages: [
    // 分包 - 访问时才加载
    {
      root: 'pages/user',
      pages: [
        {
          path: 'profile/index',
          style: { navigationBarTitleText: '个人中心' },
        },
      ],
    },
    {
      root: 'pages/order',
      pages: [
        {
          path: 'list/index',
          style: { navigationBarTitleText: '订单列表' },
        },
      ],
    },
  ],
}
```

### preloadRule - 分包预加载

合理配置分包预下载规则,在用户可能访问前提前加载分包。

**预加载配置示例:**

```typescript
export default {
  pages: [...],
  subPackages: [...],
  preloadRule: {
    // 进入首页后预加载用户分包
    'pages/index/index': {
      network: 'all', // 在所有网络下预加载
      packages: ['pages/user'], // 预加载的分包root
    },
    // 进入商品列表后预加载订单分包
    'pages/goods/list': {
      network: 'wifi', // 仅在WiFi下预加载
      packages: ['pages/order'],
    },
  },
}
```

**preloadRule 配置项:**

| 字段 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| `packages` | `string[]` | 进入页面后预下载的分包 root | 分包 root 路径 |
| `network` | `string` | 预下载的网络条件 | `'all'`(所有网络) / `'wifi'`(仅WiFi) |

**优化建议:**

1. **首页预加载** - 首页加载完成后预加载高频分包(如用户中心)
2. **网络条件** - 大分包仅在 WiFi 下预加载,避免消耗移动流量
3. **适度预加载** - 不要一次性预加载太多分包,影响当前页面性能
4. **用户行为** - 根据用户行为数据,预加载最可能访问的分包

**预加载时机:**

```text
1. 页面 onReady 后
2. 网络空闲时
3. 在后台线程执行,不阻塞主线程
```

---

## 启动画面优化

### splashscreen 配置

合理配置启动画面,平衡视觉效果和启动速度。

**App-Plus 启动画面配置:**

```typescript
export default defineManifestConfig({
  'app-plus': {
    splashscreen: {
      alwaysShowBeforeRender: true, // 首页渲染前显示启动界面
      waiting: true, // 是否等待首页渲染完毕后再关闭启动界面
      autoclose: true, // 是否自动关闭启动界面
      delay: 0, // 启动界面最少显示时间(ms),0表示不延迟
    },
  },
})
```

**配置项说明:**

| 字段 | 类型 | 说明 | 建议值 |
|------|------|------|--------|
| `alwaysShowBeforeRender` | `boolean` | 首页渲染前是否显示启动界面 | `true` |
| `waiting` | `boolean` | 是否等待首页渲染完毕 | `true` |
| `autoclose` | `boolean` | 是否自动关闭 | `true` |
| `delay` | `number` | 最少显示时间(ms) | `0`(快速启动) 或 `500`(平滑过渡) |

**优化策略:**

```typescript
// ✅ 快速启动模式
splashscreen: {
  alwaysShowBeforeRender: true,
  waiting: true,
  autoclose: true,
  delay: 0, // 首页就绪后立即关闭
}

// ✅ 平滑体验模式
splashscreen: {
  alwaysShowBeforeRender: true,
  waiting: true,
  autoclose: true,
  delay: 500, // 至少显示500ms,避免闪烁
}

// ❌ 过度延迟
splashscreen: {
  delay: 2000, // 不必要的延迟,影响启动体验
}
```

### 小程序更新检查优化

**优化的更新检查实现:**

```typescript
/**
 * 小程序更新检查 - uni-app 统一 API
 */
const checkMiniProgramUpdate = () => {
  if (!uni.canIUse('getUpdateManager')) {
    console.warn('当前小程序版本过低,不支持自动更新功能')
    return
  }

  const updateManager = uni.getUpdateManager()

  // 检查更新
  updateManager.onCheckForUpdate((res) => {
    console.log('小程序检查更新->', res)

    if (res.hasUpdate) {
      console.log('发现新版本')
      toast.info('检测到新版本,正在下载...')

      // 新版本下载完成
      updateManager.onUpdateReady(() => {
        message
          .confirm({
            title: '更新提示',
            msg: '新版本已经准备好,是否立即重启应用以获得更好的体验?',
            confirmButtonText: '立即重启',
            cancelButtonText: '稍后再说',
          })
          .then((result) => {
            if (result.action === 'confirm') {
              toast.loading('正在重启应用...')
              setTimeout(() => {
                updateManager.applyUpdate()
              }, 500)
            } else {
              toast.warning('建议及时更新以获得最佳体验')
            }
          })
      })

      // 新版本下载失败
      updateManager.onUpdateFailed(() => {
        console.error('新版本下载失败')
        message.alert({
          title: '更新失败',
          msg: '新版本下载失败,请检查网络连接后重试。或删除当前小程序,重新搜索打开获取最新版本。',
          confirmButtonText: '知道了',
        })
      })
    } else {
      console.log('当前已是最新版本')
    }
  })
}

/**
 * 检查应用更新
 */
const checkUpdate = () => {
  if (isMp) {
    checkMiniProgramUpdate()
  } else if (isApp) {
    checkAppUpdate()
  } else {
    console.log('当前平台不支持自动更新检查')
  }
}

// 在 onLaunch 最后调用,不阻塞启动
onLaunch(async () => {
  await featureStore.initFeatures()
  await initializeApp()
  checkUpdate() // 非阻塞,后台执行
})
```

**优化要点:**

1. **非阻塞** - 更新检查在后台执行,不阻塞应用启动
2. **友好提示** - 下载过程中显示提示,下载完成后询问用户
3. **错误处理** - 下载失败时提供明确的解决方案
4. **版本检测** - 使用 `uni.canIUse` 检测 API 兼容性

---

## 启动性能监控

### 性能指标收集

使用 UniApp Performance API 收集启动性能数据。

**性能监控实现:**

```typescript
/**
 * 启动性能监控
 */
export const useStartupPerformance = () => {
  // 启动时间戳
  const startTime = Date.now()

  /**
   * 记录启动阶段
   */
  const recordPhase = (phaseName: string) => {
    const duration = Date.now() - startTime
    console.log(`[启动性能] ${phaseName}: ${duration}ms`)

    // 上报到分析平台
    if (import.meta.env.PROD) {
      uni.reportAnalytics('startup_phase', {
        phase: phaseName,
        duration,
      })
    }
  }

  /**
   * 获取启动性能数据
   */
  const getPerformanceData = () => {
    // #ifdef H5
    if (window.performance) {
      const perfData = window.performance.timing
      const metrics = {
        // DNS 查询时间
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        // TCP 连接时间
        tcp: perfData.connectEnd - perfData.connectStart,
        // 请求时间
        request: perfData.responseEnd - perfData.requestStart,
        // 解析 DOM 树时间
        domParse: perfData.domInteractive - perfData.domLoading,
        // DOM Ready 时间
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        // 页面完全加载时间
        loadComplete: perfData.loadEventEnd - perfData.navigationStart,
      }

      console.log('[启动性能] H5性能指标:', metrics)
      return metrics
    }
    // #endif

    // #ifdef APP-PLUS
    // App 性能数据
    const appMetrics = {
      launchTime: Date.now() - startTime,
    }
    console.log('[启动性能] App性能指标:', appMetrics)
    return appMetrics
    // #endif

    // #ifdef MP
    // 小程序性能数据
    const mpMetrics = {
      launchTime: Date.now() - startTime,
    }
    console.log('[启动性能] 小程序性能指标:', mpMetrics)
    return mpMetrics
    // #endif
  }

  /**
   * 首屏渲染完成
   */
  const onFirstScreenReady = () => {
    recordPhase('首屏渲染完成')

    // 延迟获取完整性能数据
    setTimeout(() => {
      const perfData = getPerformanceData()

      // 上报性能数据
      if (import.meta.env.PROD) {
        uni.reportAnalytics('startup_performance', perfData)
      }
    }, 100)
  }

  return {
    recordPhase,
    getPerformanceData,
    onFirstScreenReady,
  }
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { useStartupPerformance } from '@/composables/useStartupPerformance'

const { recordPhase, onFirstScreenReady } = useStartupPerformance()

onLaunch(async () => {
  recordPhase('应用启动')

  await featureStore.initFeatures()
  recordPhase('功能配置加载完成')

  await initializeApp()
  recordPhase('应用初始化完成')

  checkUpdate()
})

onMounted(() => {
  // 首屏渲染完成
  onFirstScreenReady()
})
</script>
```

### 关键指标定义

**启动性能关键指标:**

| 指标名称 | 说明 | 目标值 | 计算方式 |
|---------|------|--------|---------|
| **应用启动时间** | 从点击图标到首屏可见 | < 2s | `firstScreenReady - appStart` |
| **onLaunch 耗时** | 应用启动生命周期执行时间 | < 500ms | `onLaunchEnd - onLaunchStart` |
| **首屏渲染时间** | 首屏内容渲染完成时间 | < 1.5s | `firstPaint - appStart` |
| **首屏可交互时间** | 首屏可以交互的时间 | < 3s | `firstInteractive - appStart` |
| **资源加载时间** | 首屏资源(图片、CSS等)加载时间 | < 2s | `resourceLoadComplete - appStart` |

**性能等级划分:**

```typescript
const getPerformanceLevel = (launchTime: number): string => {
  if (launchTime < 1000) return '优秀'
  if (launchTime < 2000) return '良好'
  if (launchTime < 3000) return '一般'
  return '较差'
}
```

---

## 代码分割优化

### 路由懒加载

使用动态导入实现路由级别的代码分割。

**懒加载组件示例:**

```typescript
// ✅ 推荐:路由懒加载
const routes = [
  {
    path: '/pages/user/profile',
    component: () => import('@/pages/user/profile/index.vue'),
  },
  {
    path: '/pages/order/list',
    component: () => import('@/pages/order/list/index.vue'),
  },
]

// ❌ 不推荐:全部静态导入
import UserProfile from '@/pages/user/profile/index.vue'
import OrderList from '@/pages/order/list/index.vue'

const routes = [
  { path: '/pages/user/profile', component: UserProfile },
  { path: '/pages/order/list', component: OrderList },
]
```

### 条件编译优化

使用条件编译去除不同平台的冗余代码。

**条件编译示例:**

```vue
<template>
  <view>
    <!-- 仅微信小程序显示 -->
    <!-- #ifdef MP-WEIXIN -->
    <button @tap="handleWeixinShare">微信分享</button>
    <!-- #endif -->

    <!-- 仅H5显示 -->
    <!-- #ifdef H5 -->
    <button @click="handleH5Share">H5分享</button>
    <!-- #endif -->

    <!-- 仅App显示 -->
    <!-- #ifdef APP-PLUS -->
    <button @tap="handleAppShare">App分享</button>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// 条件编译 - 不同平台加载不同的实现
// #ifdef MP-WEIXIN
const handleWeixinShare = () => {
  uni.shareToWeixin({ ... })
}
// #endif

// #ifdef H5
const handleH5Share = () => {
  if (navigator.share) {
    navigator.share({ ... })
  }
}
// #endif

// #ifdef APP-PLUS
const handleAppShare = () => {
  plus.share.sendWithSystem({ ... })
}
// #endif
</script>
```

**优化效果:**

- 每个平台只包含必要的代码
- 减少 30%-50% 的冗余代码
- 提升启动速度和运行性能

### 组件懒加载

使用 `defineAsyncComponent` 实现组件级别的懒加载。

**懒加载组件:**

```vue
<template>
  <view>
    <!-- 首屏不需要的组件使用懒加载 -->
    <AsyncHeavyComponent v-if="showHeavyComponent" />
  </view>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

// 懒加载重型组件
const AsyncHeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)

const showHeavyComponent = ref(false)

// 延迟加载
onMounted(() => {
  setTimeout(() => {
    showHeavyComponent.value = true
  }, 1000)
})
</script>
```

**适用场景:**

1. **首屏不可见** - 需要滚动或点击才能看到的组件
2. **低频使用** - 用户不一定会使用的功能组件
3. **重型组件** - 包含大量代码或依赖的组件

---

## 最佳实践

### 1. 最小化 onLaunch 逻辑

**优化前:**

```typescript
onLaunch(async () => {
  // 阻塞操作,启动慢
  await initDatabase()
  await loadUserData()
  await initWebSocket()
  await loadConfig()
  await initThirdPartySDK()
})
```

**优化后:**

```typescript
onLaunch(async () => {
  // 只执行必要的同步初始化
  await featureStore.initFeatures()

  // 并发执行独立任务
  Promise.all([
    initializeApp(), // 核心初始化
    checkUpdate(), // 更新检查(非阻塞)
  ])

  // 延迟加载非关键功能
  setTimeout(() => {
    initThirdPartySDK()
  }, 2000)
})
```

### 2. 使用 Promise.all 并发加载

**优化前:**

```typescript
// 串行加载,耗时累加
const data1 = await fetchData1()
const data2 = await fetchData2()
const data3 = await fetchData3()
// 总耗时 = time1 + time2 + time3
```

**优化后:**

```typescript
// 并发加载,耗时取最大值
const [data1, data2, data3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3(),
])
// 总耗时 = max(time1, time2, time3)
```

### 3. 延迟初始化第三方 SDK

**优化示例:**

```typescript
// ✅ 推荐:延迟初始化
onLaunch(async () => {
  // 核心初始化
  await initializeApp()

  // 延迟初始化统计SDK
  setTimeout(() => {
    initAnalytics()
  }, 2000)

  // 延迟初始化广告SDK
  setTimeout(() => {
    initAdSDK()
  }, 3000)
})

// ❌ 不推荐:启动时全部初始化
onLaunch(async () => {
  await initAnalytics() // 阻塞启动
  await initAdSDK() // 阻塞启动
  await initializeApp()
})
```

### 4. 缓存应用状态

**缓存实现:**

```typescript
import { cache } from '@/utils/cache'

// 保存应用状态
const saveAppState = () => {
  const state = {
    user: userStore.user,
    settings: settingsStore.settings,
    timestamp: Date.now(),
  }
  cache.set('APP_STATE', state)
}

// 恢复应用状态
const restoreAppState = () => {
  const state = cache.get('APP_STATE')
  if (state && Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
    // 24小时内有效
    userStore.user = state.user
    settingsStore.settings = state.settings
    return true
  }
  return false
}

// 应用启动时尝试恢复
onLaunch(async () => {
  if (restoreAppState()) {
    console.log('从缓存恢复应用状态')
  } else {
    await initializeApp()
  }
})

// 应用隐藏时保存
onHide(() => {
  saveAppState()
})
```

### 5. 资源预加载策略

**图片预加载:**

```typescript
/**
 * 预加载关键图片
 */
const preloadImages = (urls: string[]) => {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        // #ifdef H5
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = reject
        img.src = url
        // #endif

        // #ifndef H5
        uni.getImageInfo({
          src: url,
          success: () => resolve(url),
          fail: reject,
        })
        // #endif
      })
    })
  )
}

// 首屏渲染后预加载
onMounted(() => {
  setTimeout(() => {
    preloadImages([
      '/static/images/banner1.jpg',
      '/static/images/banner2.jpg',
    ])
  }, 1000)
})
```

### 6. 合理使用分包和预加载

**分包策略:**

```typescript
// pages.config.ts
export default {
  // 主包:核心页面(首页、登录等)
  pages: [
    { path: 'pages/index/index' },
    { path: 'pages/login/index' },
  ],

  // 分包:按功能模块划分
  subPackages: [
    {
      root: 'pages/user',
      pages: [
        { path: 'profile/index' },
        { path: 'settings/index' },
      ],
    },
    {
      root: 'pages/order',
      pages: [
        { path: 'list/index' },
        { path: 'detail/index' },
      ],
    },
  ],

  // 预加载规则
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/user'], // 高频分包,启动后预加载
    },
    'pages/user/profile': {
      network: 'wifi',
      packages: ['pages/order'], // 低频分包,WiFi下预加载
    },
  },
}
```

---

## 常见问题

### 1. onLaunch 执行时间过长

**问题原因:**

- 在 `onLaunch` 中执行了大量同步操作
- 串行执行多个异步任务
- 初始化了不必要的第三方 SDK

**解决方案:**

```typescript
// ❌ 问题代码
onLaunch(async () => {
  await initDatabase() // 300ms
  await loadUserData() // 500ms
  await initWebSocket() // 200ms
  await loadConfig() // 400ms
  // 总耗时:1400ms
})

// ✅ 优化代码
onLaunch(async () => {
  // 只执行必要的初始化
  await featureStore.initFeatures() // 100ms

  // 并发执行
  await Promise.all([
    initializeApp(), // 500ms
    checkUpdate(), // 非阻塞
  ])
  // 总耗时:500ms

  // 延迟初始化
  setTimeout(() => {
    initDatabase()
    initThirdPartySDK()
  }, 2000)
})
```

### 2. 首屏渲染白屏时间长

**问题原因:**

- 首屏包含大量数据请求
- 首屏组件过于复杂
- 图片资源过大未压缩

**解决方案:**

```vue
<template>
  <view>
    <!-- 骨架屏:快速显示布局 -->
    <skeleton-screen v-if="loading" />

    <!-- 实际内容:数据加载后显示 -->
    <view v-else>
      <banner-swiper :list="bannerList" />
      <goods-list :list="goodsList" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const bannerList = ref([])
const goodsList = ref([])

onMounted(async () => {
  // 显示骨架屏
  loading.value = true

  // 并发加载数据
  const [banners, goods] = await Promise.all([
    fetchBanners(),
    fetchGoods(),
  ])

  bannerList.value = banners
  goodsList.value = goods
  loading.value = false
})
</script>
```

### 3. 小程序启动后卡顿

**问题原因:**

- 启用了全量注入,启动时加载所有代码
- 未启用分包异步化
- 主包代码量过大

**解决方案:**

```typescript
// manifest.config.ts
export default defineManifestConfig({
  'mp-weixin': {
    setting: {
      bigPackageSizeSupport: true, // 启用分包异步化
    },
    lazyCodeLoading: 'requiredComponents', // 启用按需注入
  },
})
```

```typescript
// 合理划分分包
subPackages: [
  {
    root: 'pages/user',
    pages: [...], // 用户相关页面
  },
  {
    root: 'pages/order',
    pages: [...], // 订单相关页面
  },
]
```

### 4. App 启动画面停留时间过长

**问题原因:**

- `delay` 设置过大
- 首页渲染时间过长
- `waiting: false` 但首页未渲染完成

**解决方案:**

```typescript
// manifest.config.ts
export default defineManifestConfig({
  'app-plus': {
    splashscreen: {
      alwaysShowBeforeRender: true,
      waiting: true, // 等待首页渲染完成
      autoclose: true,
      delay: 0, // 不设置最小延迟
    },
  },
})
```

```vue
<script setup lang="ts">
// 首页优化:快速渲染
onMounted(() => {
  // 首屏快速渲染
  renderFirstScreen()

  // 延迟加载非首屏内容
  nextTick(() => {
    loadMoreContent()
  })
})
</script>
```

### 5. 应用初始化失败导致白屏

**问题原因:**

- 租户 ID 获取失败但未正确处理
- 网络请求超时未设置超时处理
- 致命错误未捕获导致应用崩溃

**解决方案:**

```typescript
// useAppInit.ts
const initializeApp = async (): Promise<void> => {
  try {
    // 租户ID获取(致命错误)
    const [err, data] = await getTenantIdByAppid(appid)
    if (!err && data) {
      cache.set(TENANT_STORAGE_KEY, data)
    } else {
      throw new Error('租户ID获取失败:' + (err?.message || '返回数据为空'))
    }

    // 用户登录(非致命错误)
    if (isMp) {
      const [loginErr] = await userStore.loginWithMiniapp()
      if (loginErr) {
        console.warn('静默登录失败,允许继续启动', loginErr)
        // 不抛出错误,让用户手动登录
      }
    }

    isInitialized.value = true
  } catch (error) {
    console.error('应用初始化失败:', error)

    // 区分致命错误和非致命错误
    if (error.message.includes('租户ID')) {
      // 致命错误:阻止应用启动
      throw error
    } else {
      // 非致命错误:允许应用继续启动
      console.warn('非致命错误,允许应用继续启动')
      isInitialized.value = true
    }
  }
}
```

---

## 性能监控工具

### UniApp 自带性能监控

**使用 uni.getPerformance:**

```typescript
// #ifdef H5
const performance = uni.getPerformance()
const observer = performance.createObserver((entries) => {
  console.log('性能条目:', entries)
})

observer.observe({
  entryTypes: ['navigation', 'resource', 'measure'],
})
// #endif
```

### 第三方性能监控平台

**推荐平台:**

1. **微信小程序后台** - 微信小程序性能监控
   - 启动性能
   - 运行性能
   - 网络请求
   - 错误监控

2. **友盟统计** - 多平台统计分析
   - 启动分析
   - 页面访问
   - 自定义事件

3. **神策数据** - 精细化数据分析
   - 启动漏斗
   - 用户路径
   - 事件分析

**自定义性能上报:**

```typescript
/**
 * 上报启动性能数据
 */
const reportStartupPerformance = (data: {
  launchTime: number
  firstScreenTime: number
  platform: string
}) => {
  // 开发环境:只打印
  if (import.meta.env.DEV) {
    console.log('[性能上报]', data)
    return
  }

  // 生产环境:上报到服务器
  uni.request({
    url: 'https://api.example.com/performance',
    method: 'POST',
    data: {
      type: 'startup',
      ...data,
      timestamp: Date.now(),
    },
  })
}
```

---

## 性能优化检查清单

**启动优化检查清单:**

- [ ] **应用生命周期**
  - [ ] `onLaunch` 只包含必要的初始化
  - [ ] 使用 `isFirstLaunch` 避免 `onShow` 重复处理
  - [ ] `onHide` 中清理不必要的资源

- [ ] **初始化流程**
  - [ ] 使用单例模式确保初始化只执行一次
  - [ ] 区分致命错误和非致命错误
  - [ ] 并发执行独立的异步任务

- [ ] **按需加载**
  - [ ] 启用 `lazyCodeLoading: 'requiredComponents'`
  - [ ] 启用 `bigPackageSizeSupport: true`
  - [ ] 合理划分主包和分包

- [ ] **预加载策略**
  - [ ] 配置高频分包预加载
  - [ ] 根据网络条件选择预加载策略
  - [ ] 避免过度预加载

- [ ] **代码分割**
  - [ ] 使用路由懒加载
  - [ ] 使用组件懒加载
  - [ ] 使用条件编译去除冗余代码

- [ ] **资源优化**
  - [ ] 图片资源压缩和格式优化
  - [ ] 字体文件按需加载
  - [ ] CSS 代码压缩和分离

- [ ] **性能监控**
  - [ ] 收集启动性能数据
  - [ ] 设置性能指标阈值
  - [ ] 定期分析性能瓶颈

- [ ] **第三方 SDK**
  - [ ] 延迟初始化非关键 SDK
  - [ ] 按需加载 SDK
  - [ ] 避免 SDK 阻塞启动

---

## 总结

启动性能优化是一个系统工程,需要从应用架构、代码组织、资源加载等多个维度进行优化。

**关键优化策略:**

1. **精简 onLaunch** - 只执行必要的初始化,延迟加载非关键功能
2. **异步并发** - 使用 `Promise.all` 并发加载独立任务
3. **按需加载** - 启用 `lazyCodeLoading` 和 `bigPackageSizeSupport`
4. **代码分割** - 合理划分主包和分包,使用路由懒加载
5. **预加载优化** - 配置分包预加载规则,提升用户体验
6. **性能监控** - 持续监控启动性能,及时发现和解决问题

**优化效果:**

- **启动时间** - 缩短 30%-50%
- **首屏渲染** - 提升 40%-60%
- **用户体验** - 显著提升应用流畅度和用户满意度

通过持续优化和监控,可以确保应用始终保持最佳的启动性能,为用户提供极致的使用体验。
