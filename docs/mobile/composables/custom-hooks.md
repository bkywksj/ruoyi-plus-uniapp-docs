# 自定义Hook开发

## 介绍

自定义 Hook(Composables)是 Vue 3 Composition API 的核心概念之一,用于封装和复用有状态的逻辑。在 RuoYi-Plus-UniApp 项目中,自定义 Hook 被广泛应用于业务逻辑封装、跨组件状态共享、副作用管理和工具函数抽象等场景。本文档详细介绍如何设计、开发和使用自定义 Hook,涵盖从基础到高级的各种模式。

**核心特性:**

- **逻辑复用** - 将可复用的有状态逻辑抽取为独立的 Composable 函数,避免代码重复
- **组合灵活** - 多个 Hook 可以自由组合使用,构建复杂的业务逻辑
- **响应式集成** - 完全集成 Vue 3 响应式系统,自动追踪依赖和触发更新
- **生命周期管理** - 支持生命周期钩子,实现资源的自动清理和管理
- **TypeScript 支持** - 完整的类型定义,提供类型安全和智能提示
- **全局状态共享** - 通过单例模式实现跨组件的状态共享
- **副作用封装** - 封装定时器、事件监听、网络请求等副作用逻辑
- **约定命名** - 遵循 `use` 前缀命名约定,统一代码风格
- **模块化设计** - 每个 Hook 职责单一,易于测试和维护
- **平台兼容** - 兼容 UniApp 多端环境,H5、小程序、App 统一使用

## 基本用法

### 1. 简单状态管理 Hook

最基础的 Hook 模式:封装响应式状态和操作方法。

```vue
<template>
  <view class="dialog-demo">
    <wd-button @click="openDialog">打开对话框</wd-button>
    <wd-button @click="closeDialog">关闭对话框</wd-button>
    <view>对话框状态: {{ visible ? '显示' : '隐藏' }}</view>
    <view>对话框标题: {{ title }}</view>
  </view>
</template>

<script lang="ts" setup>
import { useDialog } from '@/composables/useDialog'

// 使用对话框 Hook
const { visible, title, openDialog, closeDialog } = useDialog({
  title: '我的对话框'
})
</script>
```

**useDialog Hook 实现**:

```typescript
// composables/useDialog.ts
import { ref } from 'vue'
import type { Ref } from 'vue'

interface Options {
  title?: string
}

interface Return {
  title: Ref<string>
  visible: Ref<boolean>
  openDialog: () => void
  closeDialog: () => void
}

export const useDialog = (ops?: Options): Return => {
  const visible = ref(false)
  const title = ref(ops?.title || '')

  const openDialog = (): void => {
    visible.value = true
  }

  const closeDialog = (): void => {
    visible.value = false
  }

  return {
    title,
    visible,
    openDialog,
    closeDialog
  }
}
```

**使用说明:**
- 每次调用 `useDialog()` 创建独立的对话框实例
- 返回响应式状态(`visible`, `title`)和操作方法
- 接收配置参数,支持自定义初始化选项
- 适用于组件内部状态管理,不跨组件共享

### 2. 全局单例 Hook

使用单例模式实现跨组件状态共享。

```vue
<template>
  <view class="event-bus-demo">
    <wd-button @click="sendMessage">发送消息</wd-button>
    <wd-button @click="listenMessage">监听消息</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'

const { on, emit, EventNames } = useEventBus()

// 监听刷新事件
on(EventNames.PAGE_REFRESH, () => {
  console.log('页面刷新事件触发')
  loadData()
})

// 发送用户登录事件
const sendMessage = () => {
  emit(EventNames.USER_LOGIN, {
    userId: '123',
    userName: 'admin'
  })
}

// 监听用户登录事件
const listenMessage = () => {
  on(EventNames.USER_LOGIN, (userData) => {
    console.log('用户登录:', userData)
  })
}

const loadData = () => {
  console.log('加载数据...')
}
</script>
```

**useEventBus Hook 实现**:

```typescript
// composables/useEventBus.ts
import { onUnmounted } from 'vue'

interface EventCallback {
  (...args: any[]): void
}

interface EventMap {
  [key: string]: EventCallback[]
}

class EventBus {
  private events: EventMap = {}

  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    return () => this.off(event, callback)
  }

  off(event: string, callback?: EventCallback): void {
    if (!this.events[event]) return

    if (callback) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
        this.events[event].splice(index, 1)
        if (this.events[event].length === 0) {
          delete this.events[event]
        }
      }
    } else {
      delete this.events[event]
    }
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event] || this.events[event].length === 0) {
      return false
    }

    const callbacks = [...this.events[event]]
    let hasError = false

    callbacks.forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`事件 ${event} 的回调执行出错:`, error)
        hasError = true
      }
    })

    return !hasError
  }

  once(event: string, callback: EventCallback): () => void {
    const onceWrapper = (...args: any[]) => {
      callback(...args)
      this.off(event, onceWrapper)
    }
    return this.on(event, onceWrapper)
  }
}

// 全局事件总线实例(单例)
const eventBus = new EventBus()

export const EventNames = {
  PAGE_REFRESH: 'pageRefresh',
  USER_LOGIN: 'userLogin',
  USER_LOGOUT: 'userLogout',
} as const

export function useEventBus() {
  const unsubscribers: (() => void)[] = []

  const on = (event: string, callback: EventCallback) => {
    const unsubscribe = eventBus.on(event, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  const once = (event: string, callback: EventCallback) => {
    const unsubscribe = eventBus.once(event, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  // 组件卸载时自动清理所有监听器
  onUnmounted(() => {
    unsubscribers.forEach((fn) => fn())
    unsubscribers.length = 0
  })

  return {
    EventNames,
    on,
    once,
    off: eventBus.off.bind(eventBus),
    emit: eventBus.emit.bind(eventBus),
  }
}
```

**使用说明:**
- `eventBus` 是全局单例,所有组件共享同一个实例
- 自动清理:组件卸载时自动移除事件监听器,防止内存泄漏
- 类型安全:`EventNames` 常量提供事件名称的代码提示
- 支持一次性监听(`once`)和手动移除(`off`)

### 3. 异步数据加载 Hook

封装异步数据加载逻辑,包括加载状态、错误处理和数据缓存。

```vue
<template>
  <view class="app-init-demo">
    <view v-if="isInitializing">应用初始化中...</view>
    <view v-else-if="isInitialized">应用已初始化</view>
    <wd-button @click="initialize">手动初始化</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useAppInit } from '@/composables/useAppInit'
import { onMounted } from 'vue'

const { initializeApp, waitForInit } = useAppInit()

// 页面加载时初始化
onMounted(async () => {
  await initializeApp()
})

// 或等待初始化完成
const initialize = async () => {
  try {
    await waitForInit(10000) // 最多等待10秒
    console.log('初始化完成')
  } catch (error) {
    console.error('初始化超时或失败:', error)
  }
}
</script>
```

**useAppInit Hook 实现**:

```typescript
// composables/useAppInit.ts
import { ref } from 'vue'
import { webSocket } from '@/composables/useWebSocket'
import { useUserStore } from '@/stores/user'

const isInitialized = ref(false)
const isInitializing = ref(false)
let initPromise: Promise<void> | null = null

const initializeWebSocket = () => {
  const wsInstance = webSocket.initialize(undefined, {
    onConnected: () => {
      console.log('WebSocket连接建立成功')
    },
    onDisconnected: (code, reason) => {
      console.log('WebSocket连接断开', { code, reason })
    },
    onError: (error) => {
      console.error('WebSocket连接错误', error)
    },
  })

  if (wsInstance) {
    webSocket.connect()
  }
}

export const useAppInit = () => {
  const initializeApp = async (): Promise<void> => {
    // 已初始化,直接返回
    if (isInitialized.value) {
      console.log('APP环境已完成,跳过重复初始化')
      return Promise.resolve()
    }

    // 正在初始化,返回现有Promise
    if (initPromise) {
      console.log('APP环境正在初始化中,等待完成...')
      return initPromise
    }

    console.log('APP环境开始初始化...')
    isInitializing.value = true

    initPromise = (async () => {
      try {
        const userStore = useUserStore()

        // 检查是否有token,有则获取用户信息
        if (userStore.token) {
          console.log('检测到token,获取用户信息')
          try {
            await userStore.fetchUserInfo()
            console.log('用户信息获取成功')
            // 用户信息获取成功后初始化WebSocket
            initializeWebSocket()
          } catch (err) {
            console.warn('获取用户信息失败:', err.message)
          }
        } else {
          console.log('无token,跳过用户信息获取')
        }

        isInitialized.value = true
        console.log('APP环境初始化完成')
      } catch (error) {
        console.error('APP环境初始化失败:', error)
        // 错误不阻止应用启动
        isInitialized.value = true
      } finally {
        isInitializing.value = false
        initPromise = null
      }
    })()

    return initPromise
  }

  const waitForInit = async (timeout: number = 10000): Promise<void> => {
    if (isInitialized.value) return Promise.resolve()

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

**使用说明:**
- Promise 缓存:确保同一时间只有一个初始化过程
- 状态管理:`isInitialized` 和 `isInitializing` 跟踪初始化状态
- 超时处理:`waitForInit` 支持超时配置,防止无限等待
- 全局导出:除了 Hook 函数,还导出全局实例方便直接使用

### 4. 计算属性和侦听器 Hook

封装复杂的计算逻辑和数据侦听。

```vue
<template>
  <view class="animation-demo">
    <view :class="nextAnimation">动画元素</view>
    <wd-button @click="toggleRandom">切换随机模式</wd-button>
    <wd-button @click="applyToElement">应用动画</wd-button>
    <view>当前动画: {{ currentAnimation }}</view>
    <view>随机模式: {{ isRandomAnimation ? '开启' : '关闭' }}</view>
  </view>
</template>

<script lang="ts" setup>
import { useAnimation } from '@/composables/useAnimation'
import { ref } from 'vue'

const {
  currentAnimation,
  isRandomAnimation,
  nextAnimation,
  toggleRandomAnimation,
  setAnimation,
  applyAnimation,
  animationEffects
} = useAnimation()

const elementRef = ref<HTMLElement>()

// 切换随机模式
const toggleRandom = () => {
  toggleRandomAnimation()
}

// 为DOM元素应用动画
const applyToElement = () => {
  if (elementRef.value) {
    applyAnimation(elementRef.value, animationEffects.BOUNCE_IN)
  }
}

// 设置固定动画
setAnimation(animationEffects.FADE_IN)
</script>
```

**useAnimation Hook 实现**:

```typescript
// composables/useAnimation.ts
import { ref, computed } from 'vue'

const ANIMATE_PREFIX = 'animate__animated '

export const animationEffects = {
  EMPTY: '',
  PULSE: `${ANIMATE_PREFIX}animate__pulse`,
  BOUNCE_IN: `${ANIMATE_PREFIX}animate__bounceIn`,
  FADE_IN: `${ANIMATE_PREFIX}animate__fadeIn`,
  FADE_OUT: `${ANIMATE_PREFIX}animate__fadeOut`,
  ZOOM_IN: `${ANIMATE_PREFIX}animate__zoomIn`,
}

export interface AnimationConfig {
  enter: string
  leave: string
}

const animateList: string[] = Object.values(animationEffects)
  .filter((effect) => effect !== animationEffects.EMPTY)

const defaultAnimate = animationEffects.FADE_IN

export const useAnimation = () => {
  const currentAnimation = ref<string>(defaultAnimate)
  const isRandomAnimation = ref<boolean>(false)
  const currentConfig = ref<AnimationConfig>({
    enter: animationEffects.FADE_IN,
    leave: animationEffects.FADE_OUT
  })

  const getRandomAnimation = (): string => {
    const index = Math.floor(Math.random() * animateList.length)
    return animateList[index]
  }

  const setAnimation = (animation: string): void => {
    currentAnimation.value = animation
  }

  const toggleRandomAnimation = (value?: boolean): void => {
    isRandomAnimation.value = value !== undefined ? value : !isRandomAnimation.value
  }

  // 计算属性:根据随机模式返回不同的动画
  const nextAnimation = computed(() => {
    if (isRandomAnimation.value) {
      return getRandomAnimation()
    }
    return currentAnimation.value
  })

  const applyAnimation = (
    element: HTMLElement,
    animation: string = nextAnimation.value,
    callback?: () => void
  ): void => {
    // 移除可能存在的动画类
    element.classList.forEach((cls) => {
      if (cls.startsWith('animate__')) {
        element.classList.remove(cls)
      }
    })

    // 添加新动画类
    animation.split(' ').forEach((cls) => {
      if (cls) element.classList.add(cls)
    })

    // 动画结束后执行回调
    if (callback) {
      const handleAnimationEnd = () => {
        callback()
        element.removeEventListener('animationend', handleAnimationEnd)
      }
      element.addEventListener('animationend', handleAnimationEnd)
    }
  }

  return {
    currentAnimation,
    isRandomAnimation,
    currentConfig,
    nextAnimation,
    getRandomAnimation,
    setAnimation,
    toggleRandomAnimation,
    applyAnimation,
    animationEffects,
    animateList,
    defaultAnimate
  }
}
```

**使用说明:**
- `nextAnimation` 是计算属性,自动根据 `isRandomAnimation` 返回对应动画
- DOM 操作:提供 `applyAnimation` 方法直接操作元素
- 事件监听:支持动画结束回调,自动清理事件监听器
- 配置管理:支持进入/离开动画配置

### 5. 国际化 Hook

封装多语言翻译逻辑,支持复杂的翻译场景。

```vue
<template>
  <view class="i18n-demo">
    <!-- 简单翻译 -->
    <view>{{ t('userName', '用户名') }}</view>
    <!-- 英文环境: "userName", 中文环境: "用户名" -->

    <!-- 使用字段信息 -->
    <view>{{ t('', { field: 'UserName', comment: '用户名' }) }}</view>
    <!-- 英文环境: "UserName", 中文环境: "用户名" -->

    <!-- 使用语言映射 -->
    <view>{{ t('', {
      [LanguageCode.zh_CN]: '用户名',
      [LanguageCode.en_US]: 'User Name'
    }) }}</view>

    <!-- 路由标题翻译 -->
    <view>{{ translateRouteTitle('dashboard') }}</view>

    <!-- 语言状态 -->
    <view>当前语言: {{ currentLanguageName }}</view>
    <view>是否中文: {{ isChinese }}</view>

    <!-- 切换语言 -->
    <wd-button @click="switchLanguage">切换语言</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const {
  t,
  currentLanguage,
  currentLanguageName,
  isChinese,
  isEnglish,
  setLanguage,
  translateRouteTitle,
} = useI18n()

const switchLanguage = () => {
  const newLang = isChinese.value ? LanguageCode.en_US : LanguageCode.zh_CN
  setLanguage(newLang)
}
</script>
```

**useI18n Hook 实现**:

```typescript
// composables/useI18n.ts
import type { ComputedRef } from 'vue'
import { getPropByPath, isDef, isFunction } from '@/wd/components/common/util'
import { getCurrentMessages, getLanguage, setLanguage, languageState } from '@/locales/i18n'
import type { LanguageType } from '@/locales/i18n'
import { LanguageCode } from '@/systemConfig'

interface UseI18nReturn {
  t: (key: string, fieldInfoOrValue?: any) => string
  currentLanguage: ComputedRef<LanguageCode>
  currentLanguageName: ComputedRef<string>
  languageOptions: ComputedRef<Array<{
    value: LanguageCode
    label: string
    name: string
  }>>
  isChinese: ComputedRef<boolean>
  isEnglish: ComputedRef<boolean>
  setLanguage: (lang: LanguageCode) => boolean
  translateRouteTitle: (title: string) => string
  translate: (key: string, ...args: unknown[]) => string
}

export const translateRouteTitle = (title: string): string => {
  if (!title) return ''

  const routeKey = `route.${title}`
  const currentMessages = getCurrentMessages()
  const message = getPropByPath(currentMessages, routeKey)

  if (isDef(message)) {
    return isFunction(message) ? message() : message
  }

  return title
}

export const useI18n = (): UseI18nReturn => {
  const t = (key: string, fieldInfoOrValue?: any): string => {
    const currentLang = getLanguage()
    const currentMessages = getCurrentMessages()

    // 简单用法: t('userId', '用户名')
    if (typeof fieldInfoOrValue === 'string') {
      if (currentLang === LanguageCode.zh_CN) {
        return fieldInfoOrValue
      } else {
        return key
      }
    }

    // 字段信息处理
    if (fieldInfoOrValue) {
      const fieldInfo = fieldInfoOrValue

      // 优先级1: 使用当前语言的映射
      if (fieldInfo[currentLang]) {
        return fieldInfo[currentLang]
      }

      // 优先级2: 根据当前语言使用 field 或 comment
      if (currentLang === LanguageCode.zh_CN) {
        if ('comment' in fieldInfo && fieldInfo.comment) {
          return fieldInfo.comment
        }
      } else {
        if ('field' in fieldInfo && fieldInfo.field) {
          return fieldInfo.field
        }
      }

      // 优先级3: 降级策略
      if (currentLang === LanguageCode.zh_CN) {
        if ('field' in fieldInfo && fieldInfo.field) {
          return fieldInfo.field
        }
        if (fieldInfo[LanguageCode.en_US]) {
          return fieldInfo[LanguageCode.en_US]
        }
      } else {
        if ('comment' in fieldInfo && fieldInfo.comment) {
          return fieldInfo.comment
        }
        if (fieldInfo[LanguageCode.zh_CN]) {
          return fieldInfo[LanguageCode.zh_CN]
        }
      }
    }

    // 使用常规国际化处理
    const message = getPropByPath(currentMessages, key)
    if (isDef(message)) {
      return isFunction(message) ? message() : message
    }

    return key
  }

  const translate = (key: string, ...args: unknown[]) => {
    const currentMessages = getCurrentMessages()
    const message = getPropByPath(currentMessages, key)

    return isFunction(message)
      ? message(...args)
      : isDef(message)
        ? message
        : key
  }

  return {
    t,
    currentLanguage: languageState.current,
    currentLanguageName: languageState.currentName,
    languageOptions: languageState.options,
    isChinese: languageState.isChinese,
    isEnglish: languageState.isEnglish,
    setLanguage,
    translateRouteTitle,
    translate,
  }
}
```

**使用说明:**
- 多种翻译方式:简单键值、字段信息、语言映射
- 降级策略:找不到翻译时自动降级到其他语言或字段名
- 响应式状态:`currentLanguage`、`isChinese` 等计算属性自动更新
- 路由翻译:专门的 `translateRouteTitle` 方法处理路由标题

### 6. 依赖注入 Hook

使用 Vue 的 provide/inject 实现跨层级组件通信。

```vue
<!-- 父组件 -->
<template>
  <view class="parent">
    <child-component />
  </view>
</template>

<script lang="ts" setup>
import { provide, ref } from 'vue'

// 提供主题配置
const theme = ref({
  primaryColor: '#1890ff',
  fontSize: 14,
})

provide('theme', theme)

// 提供方法
const updateTheme = (newTheme: any) => {
  theme.value = { ...theme.value, ...newTheme }
}

provide('updateTheme', updateTheme)
</script>

<!-- 子组件(任意层级) -->
<template>
  <view class="child">
    <view :style="{ color: theme.primaryColor }">主题色文本</view>
    <wd-button @click="changeTheme">更改主题</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { inject } from 'vue'

// 注入主题配置
const theme = inject('theme', { primaryColor: '#000', fontSize: 12 })
const updateTheme = inject<(theme: any) => void>('updateTheme')

const changeTheme = () => {
  updateTheme?.({
    primaryColor: '#ff4d4f',
  })
}
</script>
```

**useThemeProvider Hook(提供者)**:

```typescript
// composables/useThemeProvider.ts
import { provide, ref, readonly } from 'vue'
import type { Ref } from 'vue'

export interface ThemeConfig {
  primaryColor: string
  fontSize: number
  isDark: boolean
}

export const THEME_INJECTION_KEY = Symbol('theme')

export const useThemeProvider = (initialTheme?: Partial<ThemeConfig>) => {
  const theme = ref<ThemeConfig>({
    primaryColor: '#1890ff',
    fontSize: 14,
    isDark: false,
    ...initialTheme,
  })

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    theme.value = { ...theme.value, ...newTheme }
  }

  const toggleDark = () => {
    theme.value.isDark = !theme.value.isDark
  }

  // 提供给子组件
  provide(THEME_INJECTION_KEY, {
    theme: readonly(theme), // 只读,防止子组件直接修改
    updateTheme,
    toggleDark,
  })

  return {
    theme,
    updateTheme,
    toggleDark,
  }
}
```

**useThemeInject Hook(注入者)**:

```typescript
// composables/useThemeInject.ts
import { inject } from 'vue'
import { THEME_INJECTION_KEY } from './useThemeProvider'
import type { ThemeConfig } from './useThemeProvider'

export const useThemeInject = () => {
  const injected = inject(THEME_INJECTION_KEY)

  if (!injected) {
    throw new Error('useThemeInject 必须在 useThemeProvider 的子组件中使用')
  }

  return injected
}
```

**使用说明:**
- Symbol Key:使用 Symbol 作为注入键,避免命名冲突
- 只读数据:provide 只读版本的 theme,防止子组件直接修改
- 错误处理:注入时检查是否存在,提供友好的错误提示
- 类型安全:完整的 TypeScript 类型定义

### 7. 组合多个 Hook

多个 Hook 可以自由组合使用,构建复杂功能。

```vue
<template>
  <view class="combined-demo">
    <view :class="nextAnimation">
      <view>{{ t('welcome', '欢迎') }}</view>
      <view>当前语言: {{ currentLanguageName }}</view>
    </view>

    <wd-button @click="handleClick">点击触发事件</wd-button>
    <wd-button @click="openModal">打开对话框</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useAnimation } from '@/composables/useAnimation'
import { useI18n } from '@/composables/useI18n'
import { useEventBus } from '@/composables/useEventBus'
import { useDialog } from '@/composables/useDialog'

// 组合使用多个 Hook
const { nextAnimation, setAnimation, animationEffects } = useAnimation()
const { t, currentLanguageName, setLanguage } = useI18n()
const { on, emit, EventNames } = useEventBus()
const { visible, openDialog, closeDialog } = useDialog({ title: '提示' })

// 设置动画
setAnimation(animationEffects.FADE_IN)

// 监听事件
on(EventNames.USER_LOGIN, (userData) => {
  console.log('用户登录:', userData)
  openDialog()
})

// 触发事件
const handleClick = () => {
  emit(EventNames.PAGE_REFRESH)
}
</script>
```

**使用说明:**
- 自由组合:多个 Hook 可以在同一个组件中使用
- 独立职责:每个 Hook 负责单一功能,保持简洁
- 类型推导:TypeScript 自动推导所有返回值类型
- 无冲突:不同 Hook 之间互不影响,可安全组合

## 高级用法

### 1. 带清理逻辑的 Hook

自动清理副作用,防止内存泄漏。

```vue
<template>
  <view class="timer-demo">
    <view>倒计时: {{ count }}</view>
    <wd-button @click="start">开始</wd-button>
    <wd-button @click="stop">停止</wd-button>
    <wd-button @click="reset">重置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useCountdown } from '@/composables/useCountdown'

const { count, isActive, start, stop, reset } = useCountdown(60, {
  onFinish: () => {
    console.log('倒计时结束')
    uni.showToast({ title: '时间到!', icon: 'none' })
  }
})
</script>
```

**useCountdown Hook 实现**:

```typescript
// composables/useCountdown.ts
import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface CountdownOptions {
  interval?: number // 间隔时间(ms)
  onFinish?: () => void // 倒计时结束回调
  onTick?: (count: number) => void // 每次tick回调
}

interface CountdownReturn {
  count: Ref<number>
  isActive: Ref<boolean>
  start: () => void
  stop: () => void
  reset: () => void
}

export const useCountdown = (
  initialCount: number = 60,
  options: CountdownOptions = {}
): CountdownReturn => {
  const { interval = 1000, onFinish, onTick } = options

  const count = ref(initialCount)
  const isActive = ref(false)
  let timerId: number | null = null

  const stop = () => {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
    isActive.value = false
  }

  const start = () => {
    if (isActive.value) return // 已经在运行中

    isActive.value = true
    timerId = setInterval(() => {
      count.value--

      // 每次tick回调
      onTick?.(count.value)

      if (count.value <= 0) {
        stop()
        onFinish?.()
      }
    }, interval) as unknown as number
  }

  const reset = () => {
    stop()
    count.value = initialCount
  }

  // 组件卸载时自动清理定时器
  onUnmounted(() => {
    stop()
  })

  return {
    count,
    isActive,
    start,
    stop,
    reset,
  }
}
```

**使用说明:**
- 自动清理:`onUnmounted` 钩子确保组件卸载时清理定时器
- 状态管理:`isActive` 跟踪倒计时状态,防止重复启动
- 回调支持:`onFinish` 和 `onTick` 提供灵活的事件处理
- 资源安全:即使忘记手动调用 `stop`,也不会造成内存泄漏

### 2. 可配置的 Hook 工厂

使用工厂函数创建可配置的 Hook。

```vue
<template>
  <view class="storage-demo">
    <view>用户名: {{ username }}</view>
    <view>主题设置: {{ theme }}</view>
    <wd-input v-model="username" placeholder="输入用户名" />
    <wd-button @click="saveUsername">保存用户名</wd-button>
    <wd-button @click="clearUsername">清除用户名</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useStorage } from '@/composables/useStorage'

// 使用localStorage存储用户名
const { value: username, save: saveUsername, remove: clearUsername } = useStorage('username', '', {
  storage: 'local',
  serializer: {
    read: (v) => v,
    write: (v) => v,
  }
})

// 使用sessionStorage存储主题设置
const { value: theme } = useStorage('theme', { mode: 'light' }, {
  storage: 'session',
  serializer: {
    read: (v) => JSON.parse(v),
    write: (v) => JSON.stringify(v),
  }
})
</script>
```

**useStorage Hook 实现**:

```typescript
// composables/useStorage.ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

type StorageType = 'local' | 'session'

interface Serializer<T> {
  read: (raw: string) => T
  write: (value: T) => string
}

interface StorageOptions<T> {
  storage?: StorageType
  serializer?: Serializer<T>
  onError?: (error: Error) => void
}

interface StorageReturn<T> {
  value: Ref<T>
  save: () => void
  remove: () => void
}

const defaultSerializer: Serializer<any> = {
  read: (v: string) => {
    try {
      return JSON.parse(v)
    } catch {
      return v
    }
  },
  write: (v: any) => JSON.stringify(v),
}

export const useStorage = <T>(
  key: string,
  defaultValue: T,
  options: StorageOptions<T> = {}
): StorageReturn<T> => {
  const {
    storage = 'local',
    serializer = defaultSerializer,
    onError = (e) => console.error(e),
  } = options

  const storageObj = storage === 'local' ? localStorage : sessionStorage

  const value = ref<T>(defaultValue) as Ref<T>

  // 初始化:从存储中读取
  try {
    const rawValue = storageObj.getItem(key)
    if (rawValue !== null) {
      value.value = serializer.read(rawValue)
    }
  } catch (error) {
    onError(error as Error)
  }

  // 监听变化,自动保存
  watch(
    value,
    (newValue) => {
      try {
        storageObj.setItem(key, serializer.write(newValue))
      } catch (error) {
        onError(error as Error)
      }
    },
    { deep: true }
  )

  const save = () => {
    try {
      storageObj.setItem(key, serializer.write(value.value))
    } catch (error) {
      onError(error as Error)
    }
  }

  const remove = () => {
    try {
      storageObj.removeItem(key)
      value.value = defaultValue
    } catch (error) {
      onError(error as Error)
    }
  }

  return {
    value,
    save,
    remove,
  }
}
```

**使用说明:**
- 类型泛型:`<T>` 泛型确保类型安全
- 自定义序列化:支持自定义序列化器处理复杂数据类型
- 自动持久化:`watch` 监听变化,自动保存到存储
- 错误处理:`onError` 回调处理存储错误

### 3. 异步状态管理 Hook

封装异步操作的加载、成功、失败状态。

```vue
<template>
  <view class="async-demo">
    <view v-if="loading">加载中...</view>
    <view v-else-if="error">错误: {{ error.message }}</view>
    <view v-else-if="data">
      <view v-for="item in data" :key="item.id">
        {{ item.name }}
      </view>
    </view>

    <wd-button @click="execute">重新加载</wd-button>
    <wd-button @click="reset">重置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useAsync } from '@/composables/useAsync'
import { fetchUserList } from '@/api/user'

const { data, loading, error, execute, reset } = useAsync(
  async () => {
    const response = await fetchUserList({ pageNum: 1, pageSize: 10 })
    return response.rows
  },
  {
    immediate: true, // 立即执行
    onSuccess: (data) => {
      console.log('数据加载成功:', data)
    },
    onError: (err) => {
      console.error('数据加载失败:', err)
    }
  }
)
</script>
```

**useAsync Hook 实现**:

```typescript
// composables/useAsync.ts
import { ref, shallowRef, onMounted } from 'vue'
import type { Ref, ShallowRef } from 'vue'

interface AsyncOptions<T> {
  immediate?: boolean // 是否立即执行
  resetOnExecute?: boolean // 执行时是否重置状态
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface AsyncReturn<T> {
  data: ShallowRef<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export const useAsync = <T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: AsyncOptions<T> = {}
): AsyncReturn<T> => {
  const {
    immediate = false,
    resetOnExecute = true,
    onSuccess,
    onError,
  } = options

  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (...args: any[]): Promise<T | null> => {
    if (resetOnExecute) {
      data.value = null
      error.value = null
    }

    loading.value = true

    try {
      const result = await asyncFn(...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err) {
      const e = err as Error
      error.value = e
      onError?.(e)
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  if (immediate) {
    onMounted(() => {
      execute()
    })
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}
```

**使用说明:**
- `shallowRef` 用于大数据对象,避免深度响应式开销
- 状态管理:自动管理 `loading`、`error`、`data` 三种状态
- 生命周期选项:`immediate` 控制是否立即执行
- 回调钩子:`onSuccess` 和 `onError` 处理不同结果

### 4. 防抖和节流 Hook

封装防抖和节流逻辑,优化性能。

```vue
<template>
  <view class="debounce-demo">
    <!-- 搜索输入框(防抖) -->
    <wd-input
      v-model="searchText"
      @input="debouncedSearch"
      placeholder="输入搜索关键词"
    />

    <!-- 滚动事件(节流) -->
    <scroll-view
      @scroll="throttledScroll"
      style="height: 500rpx"
    >
      <view>滚动内容...</view>
    </scroll-view>

    <view>搜索调用次数: {{ searchCount }}</view>
    <view>滚动调用次数: {{ scrollCount }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDebounce, useThrottle } from '@/composables/useDebounceThrottle'

const searchText = ref('')
const searchCount = ref(0)
const scrollCount = ref(0)

// 防抖搜索(500ms)
const debouncedSearch = useDebounce((e: any) => {
  searchCount.value++
  console.log('执行搜索:', e.detail.value)
  // 调用搜索API
}, 500)

// 节流滚动(200ms)
const throttledScroll = useThrottle((e: any) => {
  scrollCount.value++
  console.log('处理滚动:', e.detail.scrollTop)
  // 更新UI状态
}, 200)
</script>
```

**useDebounce & useThrottle Hook 实现**:

```typescript
// composables/useDebounceThrottle.ts
import { ref, onUnmounted } from 'vue'

/**
 * 防抖 Hook
 * @param fn 要防抖的函数
 * @param delay 延迟时间(ms)
 * @returns 防抖后的函数
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timerId: number | null = null

  const debouncedFn = (...args: Parameters<T>) => {
    if (timerId !== null) {
      clearTimeout(timerId)
    }

    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay) as unknown as number
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (timerId !== null) {
      clearTimeout(timerId)
    }
  })

  return debouncedFn
}

/**
 * 节流 Hook
 * @param fn 要节流的函数
 * @param delay 延迟时间(ms)
 * @returns 节流后的函数
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  let timerId: number | null = null

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now()

    // 如果距离上次执行时间超过delay,立即执行
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    } else {
      // 否则,设置定时器在剩余时间后执行
      if (timerId !== null) {
        clearTimeout(timerId)
      }

      const remaining = delay - (now - lastTime)
      timerId = setTimeout(() => {
        fn(...args)
        lastTime = Date.now()
        timerId = null
      }, remaining) as unknown as number
    }
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (timerId !== null) {
      clearTimeout(timerId)
    }
  })

  return throttledFn
}
```

**使用说明:**
- 泛型函数:保留原函数的参数和返回值类型
- 自动清理:组件卸载时自动清理定时器
- 防抖策略:延迟执行,频繁触发时重置计时器
- 节流策略:固定时间间隔内只执行一次

### 5. 响应式 URL 参数 Hook

同步 URL 参数和组件状态。

```vue
<template>
  <view class="query-demo">
    <view>当前页码: {{ page }}</view>
    <view>每页数量: {{ pageSize }}</view>
    <view>搜索关键词: {{ keyword }}</view>

    <wd-button @click="page++">下一页</wd-button>
    <wd-button @click="page--">上一页</wd-button>
    <wd-input v-model="keyword" placeholder="搜索" />
  </view>
</template>

<script lang="ts" setup>
import { useUrlQuery } from '@/composables/useUrlQuery'

// 同步URL参数
const { page, pageSize, keyword } = useUrlQuery({
  page: 1,
  pageSize: 10,
  keyword: '',
})

// 参数变化时自动更新URL
// 例如: page++ 会自动更新URL为 ?page=2&pageSize=10
</script>
```

**useUrlQuery Hook 实现**:

```typescript
// composables/useUrlQuery.ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

type QueryValue = string | number | boolean
type QueryObject = Record<string, QueryValue>

export const useUrlQuery = <T extends QueryObject>(
  defaults: T
): { [K in keyof T]: Ref<T[K]> } => {
  // 解析当前URL参数
  const parseQuery = (): Partial<T> => {
    const pages = getCurrentPages()
    if (pages.length === 0) return {}

    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}

    const result: Partial<T> = {}
    Object.keys(defaults).forEach((key) => {
      if (key in options) {
        const value = options[key]
        const defaultValue = defaults[key]

        // 类型转换
        if (typeof defaultValue === 'number') {
          result[key as keyof T] = Number(value) as T[keyof T]
        } else if (typeof defaultValue === 'boolean') {
          result[key as keyof T] = (value === 'true') as T[keyof T]
        } else {
          result[key as keyof T] = value as T[keyof T]
        }
      }
    })

    return result
  }

  // 初始化参数
  const initialQuery = parseQuery()
  const query = {} as { [K in keyof T]: Ref<T[K]> }

  Object.keys(defaults).forEach((key) => {
    const k = key as keyof T
    query[k] = ref(initialQuery[k] ?? defaults[k]) as Ref<T[keyof T]>
  })

  // 更新URL参数
  const updateUrl = () => {
    const queryString = Object.keys(query)
      .map((key) => {
        const k = key as keyof T
        const value = query[k].value
        return `${key}=${encodeURIComponent(String(value))}`
      })
      .join('&')

    const pages = getCurrentPages()
    if (pages.length === 0) return

    const currentPage = pages[pages.length - 1]
    const route = currentPage.route

    // 使用 redirectTo 更新URL(保持页面栈)
    uni.redirectTo({
      url: `/${route}?${queryString}`,
      fail: (err) => {
        console.warn('更新URL失败:', err)
      }
    })
  }

  // 监听所有参数变化
  Object.keys(query).forEach((key) => {
    const k = key as keyof T
    watch(
      query[k],
      () => {
        updateUrl()
      },
      { deep: true }
    )
  })

  return query
}
```

**使用说明:**
- 双向同步:URL参数变化更新状态,状态变化更新URL
- 类型转换:自动根据默认值类型转换URL参数
- 响应式:返回的每个参数都是响应式 Ref
- UniApp 兼容:使用 `getCurrentPages()` 获取当前页面信息

### 6. 可取消的异步 Hook

支持取消异步操作,避免竞态条件。

```vue
<template>
  <view class="cancelable-demo">
    <view v-if="loading">加载中...</view>
    <view v-else-if="data">{{ data.name }}</view>

    <wd-button @click="loadData(1)">加载用户1</wd-button>
    <wd-button @click="loadData(2)">加载用户2</wd-button>
    <wd-button @click="cancel">取消请求</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useCancelableAsync } from '@/composables/useCancelableAsync'
import { fetchUserInfo } from '@/api/user'

const { data, loading, execute, cancel } = useCancelableAsync(
  async (userId: number, signal: AbortSignal) => {
    // 传递 AbortSignal 给请求
    const response = await fetchUserInfo(userId, { signal })
    return response.data
  }
)

const loadData = (userId: number) => {
  execute(userId)
}
</script>
```

**useCancelableAsync Hook 实现**:

```typescript
// composables/useCancelableAsync.ts
import { ref, shallowRef, onUnmounted } from 'vue'
import type { Ref, ShallowRef } from 'vue'

interface CancelableReturn<T> {
  data: ShallowRef<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (...args: any[]) => Promise<T | null>
  cancel: () => void
}

export const useCancelableAsync = <T>(
  asyncFn: (signal: AbortSignal, ...args: any[]) => Promise<T>
): CancelableReturn<T> => {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let abortController: AbortController | null = null

  const execute = async (...args: any[]): Promise<T | null> => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    // 创建新的 AbortController
    abortController = new AbortController()
    const signal = abortController.signal

    loading.value = true
    error.value = null

    try {
      const result = await asyncFn(signal, ...args)

      // 检查是否被取消
      if (!signal.aborted) {
        data.value = result
      }

      return result
    } catch (err) {
      // 区分取消错误和其他错误
      if ((err as Error).name === 'AbortError') {
        console.log('请求已取消')
        return null
      }

      error.value = err as Error
      return null
    } finally {
      if (!signal.aborted) {
        loading.value = false
      }
    }
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      loading.value = false
    }
  }

  // 组件卸载时自动取消
  onUnmounted(() => {
    cancel()
  })

  return {
    data,
    loading,
    error,
    execute,
    cancel,
  }
}
```

**使用说明:**
- AbortController:使用标准 Web API 取消请求
- 竞态处理:自动取消之前的请求,避免竞态条件
- 错误区分:区分取消错误和真正的错误
- 自动清理:组件卸载时自动取消所有未完成的请求

### 7. 响应式媒体查询 Hook

响应式监听屏幕尺寸变化。

```vue
<template>
  <view class="responsive-demo">
    <view>屏幕类型: {{ screenType }}</view>
    <view>是否移动端: {{ isMobile }}</view>
    <view>是否平板: {{ isTablet }}</view>
    <view>是否桌面端: {{ isDesktop }}</view>
    <view>屏幕宽度: {{ windowWidth }}px</view>

    <view :class="{ 'mobile-layout': isMobile, 'desktop-layout': isDesktop }">
      响应式布局内容
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useMediaQuery } from '@/composables/useMediaQuery'

const {
  isMobile,
  isTablet,
  isDesktop,
  screenType,
  windowWidth,
  windowHeight,
} = useMediaQuery()
</script>
```

**useMediaQuery Hook 实现**:

```typescript
// composables/useMediaQuery.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'

type ScreenType = 'mobile' | 'tablet' | 'desktop'

interface MediaQueryReturn {
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  screenType: ComputedRef<ScreenType>
  windowWidth: Ref<number>
  windowHeight: Ref<number>
}

export const useMediaQuery = (): MediaQueryReturn => {
  const windowWidth = ref(0)
  const windowHeight = ref(0)

  // 断点配置
  const breakpoints = {
    mobile: 768,
    tablet: 1024,
  }

  // 更新窗口尺寸
  const updateWindowSize = () => {
    const systemInfo = uni.getSystemInfoSync()
    windowWidth.value = systemInfo.windowWidth
    windowHeight.value = systemInfo.windowHeight
  }

  // 计算屏幕类型
  const screenType = computed<ScreenType>(() => {
    if (windowWidth.value < breakpoints.mobile) {
      return 'mobile'
    } else if (windowWidth.value < breakpoints.tablet) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  })

  const isMobile = computed(() => screenType.value === 'mobile')
  const isTablet = computed(() => screenType.value === 'tablet')
  const isDesktop = computed(() => screenType.value === 'desktop')

  // 监听窗口尺寸变化(仅H5支持)
  // #ifdef H5
  let resizeHandler: (() => void) | null = null

  onMounted(() => {
    updateWindowSize()

    resizeHandler = () => {
      updateWindowSize()
    }

    window.addEventListener('resize', resizeHandler)
  })

  onUnmounted(() => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
  })
  // #endif

  // #ifndef H5
  onMounted(() => {
    updateWindowSize()
  })
  // #endif

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenType,
    windowWidth,
    windowHeight,
  }
}
```

**使用说明:**
- 条件编译:使用 UniApp 条件编译适配不同平台
- 响应式断点:自动根据窗口宽度计算屏幕类型
- 实时更新:H5 环境监听 resize 事件,实时更新
- 计算属性:使用计算属性派生各种屏幕状态

### 8. 组合多个异步 Hook

并行或串行处理多个异步任务。

```vue
<template>
  <view class="multi-async-demo">
    <view v-if="loadingAny">加载中...</view>
    <view v-else-if="errorAll">全部失败</view>
    <view v-else>
      <view v-if="userData">用户: {{ userData.name }}</view>
      <view v-if="orderData">订单: {{ orderData.length }}条</view>
      <view v-if="statsData">统计: {{ statsData.total }}</view>
    </view>

    <wd-button @click="loadAll">加载全部</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMultiAsync } from '@/composables/useMultiAsync'
import { fetchUserInfo, fetchOrderList, fetchStats } from '@/api'

const {
  results: [userData, orderData, statsData],
  loadingAny,
  loadingAll,
  errorAny,
  errorAll,
  executeAll,
  executeSerial,
} = useMultiAsync([
  () => fetchUserInfo(1),
  () => fetchOrderList({ userId: 1 }),
  () => fetchStats({ userId: 1 }),
])

const loadAll = async () => {
  // 并行加载所有数据
  await executeAll()

  // 或串行加载
  // await executeSerial()
}
</script>
```

**useMultiAsync Hook 实现**:

```typescript
// composables/useMultiAsync.ts
import { ref, shallowRef, computed } from 'vue'
import type { Ref, ShallowRef, ComputedRef } from 'vue'

interface MultiAsyncReturn<T extends any[]> {
  results: { [K in keyof T]: ShallowRef<T[K] | null> }
  errors: { [K in keyof T]: Ref<Error | null> }
  loadings: { [K in keyof T]: Ref<boolean> }
  loadingAny: ComputedRef<boolean>
  loadingAll: ComputedRef<boolean>
  errorAny: ComputedRef<boolean>
  errorAll: ComputedRef<boolean>
  executeAll: () => Promise<T>
  executeSerial: () => Promise<T>
  reset: () => void
}

export const useMultiAsync = <T extends any[]>(
  asyncFns: { [K in keyof T]: () => Promise<T[K]> }
): MultiAsyncReturn<T> => {
  const results = asyncFns.map(() => shallowRef(null)) as {
    [K in keyof T]: ShallowRef<T[K] | null>
  }
  const errors = asyncFns.map(() => ref<Error | null>(null)) as {
    [K in keyof T]: Ref<Error | null>
  }
  const loadings = asyncFns.map(() => ref(false)) as {
    [K in keyof T]: Ref<boolean>
  }

  const loadingAny = computed(() => loadings.some((loading) => loading.value))
  const loadingAll = computed(() => loadings.every((loading) => loading.value))
  const errorAny = computed(() => errors.some((error) => error.value !== null))
  const errorAll = computed(() => errors.every((error) => error.value !== null))

  // 并行执行所有异步函数
  const executeAll = async (): Promise<T> => {
    const promises = asyncFns.map(async (fn, index) => {
      loadings[index].value = true
      errors[index].value = null

      try {
        const result = await fn()
        results[index].value = result
        return result
      } catch (error) {
        errors[index].value = error as Error
        throw error
      } finally {
        loadings[index].value = false
      }
    })

    return Promise.all(promises) as Promise<T>
  }

  // 串行执行所有异步函数
  const executeSerial = async (): Promise<T> => {
    const resultArray: any[] = []

    for (let index = 0; index < asyncFns.length; index++) {
      loadings[index].value = true
      errors[index].value = null

      try {
        const result = await asyncFns[index]()
        results[index].value = result
        resultArray.push(result)
      } catch (error) {
        errors[index].value = error as Error
        throw error
      } finally {
        loadings[index].value = false
      }
    }

    return resultArray as T
  }

  const reset = () => {
    results.forEach((result) => (result.value = null))
    errors.forEach((error) => (error.value = null))
    loadings.forEach((loading) => (loading.value = false))
  }

  return {
    results,
    errors,
    loadings,
    loadingAny,
    loadingAll,
    errorAny,
    errorAll,
    executeAll,
    executeSerial,
    reset,
  }
}
```

**使用说明:**
- 类型安全:完整的 TypeScript 泛型支持
- 并行/串行:支持并行(`executeAll`)和串行(`executeSerial`)两种模式
- 状态聚合:`loadingAny`、`errorAll` 等聚合状态方便使用
- 独立状态:每个异步任务都有独立的加载、错误、结果状态

### 9. 表单验证 Hook

封装表单验证逻辑,支持自定义验证规则。

```vue
<template>
  <view class="form-demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-form-item label="用户名" prop="username">
        <wd-input v-model="formData.username" />
        <view v-if="errors.username" class="error">{{ errors.username }}</view>
      </wd-form-item>

      <wd-form-item label="密码" prop="password">
        <wd-input v-model="formData.password" type="password" />
        <view v-if="errors.password" class="error">{{ errors.password }}</view>
      </wd-form-item>

      <wd-form-item label="邮箱" prop="email">
        <wd-input v-model="formData.email" />
        <view v-if="errors.email" class="error">{{ errors.email }}</view>
      </wd-form-item>
    </wd-form>

    <wd-button @click="handleSubmit" :disabled="!isValid">提交</wd-button>
    <wd-button @click="reset">重置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useFormValidation } from '@/composables/useFormValidation'

interface FormData {
  username: string
  password: string
  email: string
}

const { formData, errors, isValid, validate, validateField, reset } = useFormValidation<FormData>({
  username: '',
  password: '',
  email: '',
}, {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
    {
      validator: (value) => /^[a-zA-Z0-9_]+$/.test(value),
      message: '用户名只能包含字母、数字和下划线'
    }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: '请输入有效的邮箱地址'
    }
  ],
})

const handleSubmit = async () => {
  const valid = await validate()
  if (valid) {
    console.log('提交表单:', formData)
    // 调用API提交
  }
}
</script>
```

**useFormValidation Hook 实现**:

```typescript
// composables/useFormValidation.ts
import { reactive, ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean
  message: string
}

type FormRules<T> = {
  [K in keyof T]?: ValidationRule[]
}

type FormErrors<T> = {
  [K in keyof T]?: string
}

interface FormValidationReturn<T> {
  formData: T
  errors: FormErrors<T>
  isValid: Ref<boolean>
  validate: () => Promise<boolean>
  validateField: (field: keyof T) => boolean
  reset: () => void
  setErrors: (errors: FormErrors<T>) => void
}

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  rules: FormRules<T>
): FormValidationReturn<T> => {
  const formData = reactive<T>({ ...initialData })
  const errors = reactive<FormErrors<T>>({})

  // 验证单个字段
  const validateField = (field: keyof T): boolean => {
    const fieldRules = rules[field]
    if (!fieldRules) return true

    const value = formData[field]

    for (const rule of fieldRules) {
      // 必填验证
      if (rule.required && !value) {
        errors[field] = rule.message
        return false
      }

      // 跳过空值的非必填验证
      if (!value) continue

      // 最小长度验证
      if (rule.min !== undefined && String(value).length < rule.min) {
        errors[field] = rule.message
        return false
      }

      // 最大长度验证
      if (rule.max !== undefined && String(value).length > rule.max) {
        errors[field] = rule.message
        return false
      }

      // 正则验证
      if (rule.pattern && !rule.pattern.test(String(value))) {
        errors[field] = rule.message
        return false
      }

      // 自定义验证器
      if (rule.validator && !rule.validator(value)) {
        errors[field] = rule.message
        return false
      }
    }

    // 验证通过,清除错误
    delete errors[field]
    return true
  }

  // 验证整个表单
  const validate = async (): Promise<boolean> => {
    let isValid = true

    for (const field in rules) {
      const valid = validateField(field as keyof T)
      if (!valid) {
        isValid = false
      }
    }

    return isValid
  }

  // 表单是否有效(计算属性)
  const isValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  // 重置表单
  const reset = () => {
    Object.keys(initialData).forEach((key) => {
      formData[key as keyof T] = initialData[key as keyof T]
      delete errors[key as keyof T]
    })
  }

  // 设置错误(用于服务端验证)
  const setErrors = (newErrors: FormErrors<T>) => {
    Object.keys(newErrors).forEach((key) => {
      errors[key as keyof T] = newErrors[key as keyof T]
    })
  }

  // 监听表单数据变化,实时验证
  Object.keys(rules).forEach((field) => {
    watch(
      () => formData[field as keyof T],
      () => {
        // 如果已经有错误,则实时验证
        if (errors[field as keyof T]) {
          validateField(field as keyof T)
        }
      }
    )
  })

  return {
    formData,
    errors,
    isValid,
    validate,
    validateField,
    reset,
    setErrors,
  }
}
```

**使用说明:**
- 实时验证:字段有错误时,输入变化会实时验证
- 多种规则:支持必填、长度、正则、自定义验证器
- 类型安全:完整的 TypeScript 泛型支持
- 服务端验证:`setErrors` 方法支持设置服务端返回的验证错误

## API

### Hook 设计模式

#### 1. 基本 Hook 模式

```typescript
export const useExample = (options?: Options) => {
  const state = ref(initialValue)

  const method = () => {
    // 方法实现
  }

  return {
    state,
    method,
  }
}
```

#### 2. 单例 Hook 模式

```typescript
// 全局单例
const globalInstance = createInstance()

export const useExample = () => {
  // 返回全局实例的方法
  return {
    method: globalInstance.method.bind(globalInstance),
  }
}
```

#### 3. 工厂 Hook 模式

```typescript
export const useExample = <T>(config: Config<T>) => {
  // 根据配置创建实例
  const instance = createInstance(config)

  return instance
}
```

### 常用 Hook 列表

#### 状态管理类

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useDialog` | 对话框状态管理 | `{ visible, title, openDialog, closeDialog }` |
| `useStorage` | 本地存储管理 | `{ value, save, remove }` |
| `useUrlQuery` | URL参数管理 | `{ [key]: Ref<value> }` |

#### 事件通信类

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useEventBus` | 事件总线 | `{ on, once, off, emit, EventNames }` |
| `useMediaQuery` | 媒体查询 | `{ isMobile, isTablet, isDesktop, ... }` |

#### 异步处理类

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useAsync` | 异步状态管理 | `{ data, loading, error, execute, reset }` |
| `useCancelableAsync` | 可取消异步 | `{ data, loading, error, execute, cancel }` |
| `useMultiAsync` | 多异步任务 | `{ results, errors, loadings, ... }` |

#### 副作用管理类

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useCountdown` | 倒计时 | `{ count, isActive, start, stop, reset }` |
| `useDebounce` | 防抖函数 | `(fn, delay) => debouncedFn` |
| `useThrottle` | 节流函数 | `(fn, delay) => throttledFn` |

#### 工具类

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useAnimation` | 动画管理 | `{ currentAnimation, nextAnimation, ... }` |
| `useI18n` | 国际化 | `{ t, currentLanguage, setLanguage, ... }` |
| `useFormValidation` | 表单验证 | `{ formData, errors, validate, ... }` |

### Hook 命名约定

| 前缀 | 用途 | 示例 |
|------|------|------|
| `use` | 标准 Hook | `useDialog`, `useAsync` |
| `create` | 工厂函数 | `createAnimationConfig` |
| `on` | 事件监听 | `onFinish`, `onTick` |
| `is` | 布尔状态 | `isActive`, `isValid` |
| `has` | 布尔检查 | `hasError`, `hasData` |
| `get` | 获取值 | `getRandomAnimation` |
| `set` | 设置值 | `setAnimation` |
| `toggle` | 切换状态 | `toggleRandomAnimation` |

## 类型定义

### 核心类型

```typescript
/**
 * Hook 配置选项通用接口
 */
interface HookOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * Hook 返回值通用接口
 */
interface HookReturn<T> {
  /** 数据 */
  data: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
}

/**
 * 事件回调函数类型
 */
interface EventCallback {
  (...args: any[]): void
}

/**
 * 验证规则接口
 */
interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean
  message: string
}

/**
 * 异步函数类型
 */
type AsyncFunction<T> = (...args: any[]) => Promise<T>

/**
 * 可取消的异步函数类型
 */
type CancelableAsyncFunction<T> = (signal: AbortSignal, ...args: any[]) => Promise<T>
```

### 工具类型

```typescript
/**
 * 提取 Ref 的值类型
 */
type UnwrapRef<T> = T extends Ref<infer U> ? U : T

/**
 * 提取函数参数类型
 */
type Parameters<T> = T extends (...args: infer P) => any ? P : never

/**
 * 提取函数返回值类型
 */
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any

/**
 * 可选属性
 */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必选属性
 */
type Required<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 深度只读
 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}
```

### 响应式类型

```typescript
import type { Ref, ComputedRef, ShallowRef } from 'vue'

/**
 * 基本响应式类型
 */
type BasicRef<T> = Ref<T>

/**
 * 计算属性类型
 */
type Computed<T> = ComputedRef<T>

/**
 * 浅层响应式类型
 */
type Shallow<T> = ShallowRef<T>

/**
 * 响应式对象类型
 */
type Reactive<T extends object> = T

/**
 * 可能是 Ref 的类型
 */
type MaybeRef<T> = T | Ref<T>

/**
 * 可能是计算属性的类型
 */
type MaybeComputed<T> = T | ComputedRef<T>
```

## 最佳实践

### 1. 遵循命名约定

所有自定义 Hook 必须以 `use` 开头,遵循 Vue 3 Composition API 命名约定。

**✅ 推荐:**

```typescript
export const useDialog = () => { ... }
export const useEventBus = () => { ... }
export const useAsync = () => { ... }
```

**❌ 不推荐:**

```typescript
export const dialog = () => { ... }
export const eventBus = () => { ... }
export const asyncFn = () => { ... }
```

### 2. 单一职责原则

每个 Hook 只负责一个明确的功能,避免过度复杂。

**✅ 推荐:**

```typescript
// 专注于对话框状态管理
export const useDialog = () => {
  const visible = ref(false)
  const openDialog = () => visible.value = true
  const closeDialog = () => visible.value = false

  return { visible, openDialog, closeDialog }
}

// 专注于表单验证
export const useFormValidation = () => {
  // ... 验证逻辑
}
```

**❌ 不推荐:**

```typescript
// 混合了对话框、表单、网络请求等多种功能
export const useEverything = () => {
  const visible = ref(false)
  const formData = reactive({})
  const loading = ref(false)
  // ... 过多职责
}
```

### 3. 自动清理副作用

使用 `onUnmounted` 等生命周期钩子自动清理副作用,防止内存泄漏。

**✅ 推荐:**

```typescript
import { onUnmounted } from 'vue'

export const useInterval = (callback: () => void, delay: number) => {
  let timerId: number | null = null

  const start = () => {
    timerId = setInterval(callback, delay)
  }

  const stop = () => {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  // 自动清理
  onUnmounted(() => {
    stop()
  })

  return { start, stop }
}
```

**❌ 不推荐:**

```typescript
// 没有自动清理,容易造成内存泄漏
export const useInterval = (callback: () => void, delay: number) => {
  const timerId = setInterval(callback, delay)

  return {
    stop: () => clearInterval(timerId)
  }
}
```

### 4. 提供完整的 TypeScript 类型

为 Hook 提供完整的类型定义,包括参数、返回值、泛型等。

**✅ 推荐:**

```typescript
interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseAsyncReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (...args: any[]) => Promise<T | null>
}

export const useAsync = <T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options?: UseAsyncOptions<T>
): UseAsyncReturn<T> => {
  // ... 实现
}
```

**❌ 不推荐:**

```typescript
// 缺少类型定义
export const useAsync = (asyncFn: any, options?: any): any => {
  // ... 实现
}
```

### 5. 合理使用响应式API

根据数据特征选择合适的响应式API:

- `ref()`: 基本数据类型
- `reactive()`: 对象和数组
- `shallowRef()`: 大数据对象,避免深度响应式
- `computed()`: 派生数据
- `readonly()`: 只读数据

**✅ 推荐:**

```typescript
export const useUserStore = () => {
  // 基本类型使用 ref
  const userId = ref<number>(0)
  const loading = ref(false)

  // 对象使用 reactive
  const userInfo = reactive({
    name: '',
    email: '',
  })

  // 大数据使用 shallowRef
  const largeDataList = shallowRef([])

  // 派生数据使用 computed
  const displayName = computed(() => userInfo.name || '未命名')

  return { userId, loading, userInfo, largeDataList, displayName }
}
```

**❌ 不推荐:**

```typescript
// 所有数据都使用 ref,不合理
export const useUserStore = () => {
  const userId = ref(0)
  const userInfo = ref({ name: '', email: '' })
  const largeDataList = ref([]) // 大数据应使用 shallowRef

  return { userId, userInfo, largeDataList }
}
```

### 6. 返回只读状态

对于不应该被外部直接修改的状态,返回只读版本。

**✅ 推荐:**

```typescript
import { readonly } from 'vue'

export const useCounter = () => {
  const count = ref(0)

  const increment = () => count.value++
  const decrement = () => count.value--

  // 返回只读版本,防止外部直接修改
  return {
    count: readonly(count),
    increment,
    decrement,
  }
}
```

**❌ 不推荐:**

```typescript
// 直接返回可写的 ref,外部可以随意修改
export const useCounter = () => {
  const count = ref(0)

  const increment = () => count.value++
  const decrement = () => count.value--

  return { count, increment, decrement }
}

// 使用时可能出现问题:
const { count, increment } = useCounter()
count.value = 999 // 破坏了封装性
```

### 7. 提供默认值和配置选项

为 Hook 提供合理的默认值,同时支持自定义配置。

**✅ 推荐:**

```typescript
interface UsePaginationOptions {
  pageSize?: number
  initialPage?: number
  onPageChange?: (page: number) => void
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const {
    pageSize = 10,
    initialPage = 1,
    onPageChange,
  } = options

  const currentPage = ref(initialPage)
  const total = ref(0)

  const changePage = (page: number) => {
    currentPage.value = page
    onPageChange?.(page)
  }

  return { currentPage, pageSize, total, changePage }
}
```

**❌ 不推荐:**

```typescript
// 缺少默认值,使用不方便
export const usePagination = (pageSize: number, initialPage: number) => {
  const currentPage = ref(initialPage)
  const total = ref(0)

  return { currentPage, pageSize, total }
}
```

### 8. 组合优于继承

通过组合多个小 Hook 构建复杂功能,而不是创建大而全的 Hook。

**✅ 推荐:**

```typescript
// 小而专注的 Hook
export const useLoading = () => {
  const loading = ref(false)
  const setLoading = (value: boolean) => loading.value = value
  return { loading, setLoading }
}

export const useError = () => {
  const error = ref<Error | null>(null)
  const setError = (err: Error | null) => error.value = err
  return { error, setError }
}

// 组合使用
export const useDataFetch = (fetchFn: () => Promise<any>) => {
  const { loading, setLoading } = useLoading()
  const { error, setError } = useError()
  const data = ref(null)

  const execute = async () => {
    setLoading(true)
    setError(null)
    try {
      data.value = await fetchFn()
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, execute }
}
```

**❌ 不推荐:**

```typescript
// 大而全的 Hook,难以复用和维护
export const useMegaHook = () => {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const formData = reactive({})
  const visible = ref(false)
  // ... 更多状态

  // ... 几十个方法

  return { ... } // 返回一大堆东西
}
```

## 常见问题

### 1. Hook 可以在条件语句中使用吗?

**问题原因:**

Vue 3 的 Composition API 没有 React Hooks 的"Hooks 规则"限制,可以在条件语句、循环中使用。但为了保持代码的可读性和可维护性,建议遵循一致的使用模式。

**解决方案:**

```vue
<script lang="ts" setup>
import { useDialog } from '@/composables/useDialog'
import { useFeatureFlag } from '@/composables/useFeatureFlag'

// ✅ 可以在条件中使用
const { isEnabled } = useFeatureFlag('new-feature')

let dialog: ReturnType<typeof useDialog> | null = null

if (isEnabled) {
  dialog = useDialog({ title: '新功能' })
}

// 但更推荐这种方式:
const dialog = useDialog({ title: '新功能' })
const showDialog = isEnabled ? dialog.openDialog : () => {}
</script>
```

**最佳实践:**
- 总是在 `<script setup>` 顶层调用 Hook
- 使用计算属性或条件渲染控制功能,而不是条件调用 Hook
- 保持 Hook 调用的一致性

### 2. Hook 之间如何共享状态?

**问题原因:**

多个 Hook 需要访问同一份状态数据。

**解决方案:**

**方案1: 单例模式(推荐)**

```typescript
// stores/useUserStore.ts
import { ref } from 'vue'

// 全局单例状态
const userInfo = ref({ id: 0, name: '' })
const token = ref('')

export const useUserStore = () => {
  const setUserInfo = (info: any) => {
    userInfo.value = info
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  return {
    userInfo,
    token,
    setUserInfo,
    setToken,
  }
}
```

**方案2: Pinia 状态管理(大型应用推荐)**

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({ id: 0, name: '' })
  const token = ref('')

  const setUserInfo = (info: any) => {
    userInfo.value = info
  }

  return { userInfo, token, setUserInfo }
})
```

**方案3: Provide/Inject**

```vue
<!-- 父组件 -->
<script lang="ts" setup>
import { provide } from 'vue'
import { useSharedState } from '@/composables/useSharedState'

const sharedState = useSharedState()
provide('sharedState', sharedState)
</script>

<!-- 子组件 -->
<script lang="ts" setup>
import { inject } from 'vue'

const sharedState = inject('sharedState')
</script>
```

### 3. Hook 中的异步操作如何处理错误?

**问题原因:**

异步操作可能失败,需要统一的错误处理机制。

**解决方案:**

```typescript
// composables/useAsync.ts
export const useAsync = <T>(asyncFn: () => Promise<T>, options = {}) => {
  const { onError } = options
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await asyncFn()
    } catch (err) {
      error.value = err as Error

      // 1. 调用错误回调
      onError?.(err as Error)

      // 2. 全局错误处理
      if (err.response?.status === 401) {
        // 跳转登录页
        uni.navigateTo({ url: '/pages/login/index' })
      } else if (err.response?.status === 500) {
        // 显示错误提示
        uni.showToast({ title: '服务器错误', icon: 'none' })
      }

      // 3. 上报错误
      console.error('异步操作失败:', err)

      // 4. 重新抛出错误(可选)
      // throw err
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, execute }
}
```

**使用示例:**

```vue
<script lang="ts" setup>
import { useAsync } from '@/composables/useAsync'
import { fetchUserInfo } from '@/api/user'

const { data, error, loading, execute } = useAsync(
  () => fetchUserInfo(1),
  {
    onError: (err) => {
      console.error('加载用户信息失败:', err)
      uni.showToast({ title: err.message, icon: 'none' })
    }
  }
)
</script>
```

### 4. Hook 中如何处理组件卸载时的清理?

**问题原因:**

组件卸载时需要清理定时器、事件监听器、网络请求等资源。

**解决方案:**

```typescript
import { onUnmounted, onBeforeUnmount } from 'vue'

export const useResource = () => {
  let timerId: number | null = null
  let abortController: AbortController | null = null

  const startTimer = () => {
    timerId = setInterval(() => {
      console.log('定时任务')
    }, 1000)
  }

  const fetchData = async () => {
    abortController = new AbortController()
    const signal = abortController.signal

    try {
      const response = await fetch('/api/data', { signal })
      return response.json()
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('请求已取消')
      }
      throw err
    }
  }

  // 清理函数
  const cleanup = () => {
    // 清理定时器
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }

    // 取消网络请求
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  // 组件卸载前清理
  onBeforeUnmount(() => {
    cleanup()
  })

  // 或使用 onUnmounted
  onUnmounted(() => {
    cleanup()
  })

  return { startTimer, fetchData, cleanup }
}
```

### 5. Hook 中的响应式数据失去响应性怎么办?

**问题原因:**

解构响应式对象或传递 `.value` 会导致失去响应性。

**错误示例:**

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

// ❌ 解构会失去响应性
const { userName } = useUserStore()

// ❌ 传递 .value 会失去响应性
const name = userName.value
</script>
```

**解决方案:**

**方案1: 使用 storeToRefs**

```vue
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 使用 storeToRefs 保持响应性
const { userName, userEmail } = storeToRefs(userStore)

// 方法可以直接解构
const { updateUserInfo } = userStore
</script>
```

**方案2: 使用 toRefs**

```vue
<script lang="ts" setup>
import { toRefs } from 'vue'
import { useCounter } from '@/composables/useCounter'

const counter = useCounter()

// ✅ 使用 toRefs 保持响应性
const { count } = toRefs(counter)
</script>
```

**方案3: 不解构**

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

// ✅ 不解构,直接使用
const userStore = useUserStore()

// 使用时: userStore.userName
</script>
```

### 6. Hook 中如何实现依赖注入?

**问题原因:**

需要在多层嵌套的组件之间传递数据,使用 props 层层传递过于繁琐。

**解决方案:**

```typescript
// composables/useThemeProvider.ts
import { provide, inject, readonly } from 'vue'
import type { Ref } from 'vue'

// 定义注入键(使用 Symbol 避免冲突)
export const THEME_KEY = Symbol('theme')

export interface ThemeConfig {
  primaryColor: string
  isDark: boolean
}

// 提供者 Hook
export const useThemeProvider = () => {
  const theme = ref<ThemeConfig>({
    primaryColor: '#1890ff',
    isDark: false,
  })

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    theme.value = { ...theme.value, ...newTheme }
  }

  // 提供给子组件(只读)
  provide(THEME_KEY, {
    theme: readonly(theme),
    updateTheme,
  })

  return { theme, updateTheme }
}

// 注入者 Hook
export const useThemeInject = () => {
  const injected = inject(THEME_KEY)

  if (!injected) {
    throw new Error('useThemeInject 必须在 useThemeProvider 的子组件中使用')
  }

  return injected
}
```

**使用示例:**

```vue
<!-- 父组件 -->
<template>
  <view>
    <child-component />
  </view>
</template>

<script lang="ts" setup>
import { useThemeProvider } from '@/composables/useThemeProvider'

useThemeProvider()
</script>

<!-- 子组件(任意层级) -->
<template>
  <view :style="{ color: theme.primaryColor }">
    主题色文本
  </view>
</template>

<script lang="ts" setup>
import { useThemeInject } from '@/composables/useThemeProvider'

const { theme, updateTheme } = useThemeInject()
</script>
```

### 7. Hook 中如何处理竞态条件?

**问题原因:**

多次快速触发异步请求时,后发送的请求可能先返回,导致数据错乱。

**解决方案:**

```typescript
// composables/useCancelableAsync.ts
import { ref, shallowRef } from 'vue'

export const useCancelableAsync = <T>(
  asyncFn: (signal: AbortSignal, ...args: any[]) => Promise<T>
) => {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let abortController: AbortController | null = null
  let requestId = 0

  const execute = async (...args: any[]): Promise<T | null> => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    // 生成请求ID
    const currentRequestId = ++requestId

    // 创建新的 AbortController
    abortController = new AbortController()
    const signal = abortController.signal

    loading.value = true
    error.value = null

    try {
      const result = await asyncFn(signal, ...args)

      // 只有最新的请求才更新数据
      if (currentRequestId === requestId && !signal.aborted) {
        data.value = result
      }

      return result
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('请求已取消')
        return null
      }

      // 只有最新的请求才更新错误
      if (currentRequestId === requestId) {
        error.value = err as Error
      }

      return null
    } finally {
      if (currentRequestId === requestId && !signal.aborted) {
        loading.value = false
      }
    }
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      loading.value = false
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return { data, loading, error, execute, cancel }
}
```

**使用示例:**

```vue
<template>
  <view>
    <wd-input v-model="keyword" @input="search" placeholder="搜索" />
    <view v-if="loading">搜索中...</view>
    <view v-else-if="results">
      <view v-for="item in results" :key="item.id">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useCancelableAsync } from '@/composables/useCancelableAsync'
import { searchApi } from '@/api/search'

const keyword = ref('')

const { data: results, loading, execute } = useCancelableAsync(
  async (signal: AbortSignal, keyword: string) => {
    // 传递 signal 给 API
    const response = await searchApi(keyword, { signal })
    return response.data
  }
)

const search = () => {
  // 每次输入都会取消之前的请求
  execute(keyword.value)
}
</script>
```

### 8. Hook 中如何优化性能?

**问题原因:**

Hook 中的响应式数据或计算属性可能导致不必要的重新渲染。

**解决方案:**

**1. 使用 shallowRef 代替 ref(大数据)**

```typescript
import { ref, shallowRef } from 'vue'

export const useDataList = () => {
  // ❌ 大数据列表使用 ref,会深度响应式
  const list1 = ref([...largeArray])

  // ✅ 使用 shallowRef,只追踪引用变化
  const list2 = shallowRef([...largeArray])

  return { list2 }
}
```

**2. 使用 computed 缓存计算结果**

```typescript
import { ref, computed } from 'vue'

export const useExpensiveComputation = () => {
  const data = ref([1, 2, 3, 4, 5])

  // ❌ 每次访问都重新计算
  const sum1 = () => data.value.reduce((a, b) => a + b, 0)

  // ✅ 使用 computed 缓存结果
  const sum2 = computed(() => data.value.reduce((a, b) => a + b, 0))

  return { sum2 }
}
```

**3. 使用 watchEffect 代替 watch(简单场景)**

```typescript
import { ref, watch, watchEffect } from 'vue'

export const useAutoSave = () => {
  const formData = ref({ name: '', email: '' })

  // ❌ watch 需要明确指定依赖
  watch(
    () => formData.value,
    (newVal) => {
      saveToLocalStorage(newVal)
    },
    { deep: true }
  )

  // ✅ watchEffect 自动追踪依赖
  watchEffect(() => {
    saveToLocalStorage(formData.value)
  })
}
```

**4. 使用防抖/节流优化高频操作**

```typescript
import { useDebounce } from '@/composables/useDebounce'

export const useSearch = () => {
  const keyword = ref('')

  // ✅ 防抖搜索
  const debouncedSearch = useDebounce((value: string) => {
    console.log('执行搜索:', value)
    // 调用搜索API
  }, 500)

  watch(keyword, (newVal) => {
    debouncedSearch(newVal)
  })

  return { keyword }
}
```
