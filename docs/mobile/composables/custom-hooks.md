# 自定义Hook开发

## 介绍

自定义 Hook(Composables)是 Vue 3 Composition API 的核心概念之一,用于封装和复用有状态的逻辑。在 RuoYi-Plus-UniApp 项目中,自定义 Hook 被广泛应用于业务逻辑封装、跨组件状态共享、副作用管理和工具函数抽象等场景。

**核心特性:**

- **逻辑复用** - 将可复用的有状态逻辑抽取为独立的 Composable 函数
- **组合灵活** - 多个 Hook 可以自由组合使用,构建复杂的业务逻辑
- **响应式集成** - 完全集成 Vue 3 响应式系统
- **生命周期管理** - 支持生命周期钩子,实现资源的自动清理
- **TypeScript 支持** - 完整的类型定义,提供类型安全和智能提示
- **平台兼容** - 兼容 UniApp 多端环境

## 基本用法

### 1. 简单状态管理 Hook

最基础的 Hook 模式:封装响应式状态和操作方法。

```vue
<template>
  <view class="dialog-demo">
    <wd-button @click="openDialog">打开对话框</wd-button>
    <view>对话框状态: {{ visible ? '显示' : '隐藏' }}</view>
  </view>
</template>

<script lang="ts" setup>
import { useDialog } from '@/composables/useDialog'

const { visible, openDialog, closeDialog } = useDialog({ title: '我的对话框' })
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

export const useDialog = (ops?: Options) => {
  const visible = ref(false)
  const title = ref(ops?.title || '')

  const openDialog = () => { visible.value = true }
  const closeDialog = () => { visible.value = false }

  return { title, visible, openDialog, closeDialog }
}
```

### 2. 全局单例 Hook

使用单例模式实现跨组件状态共享。

```typescript
// composables/useEventBus.ts
import { onUnmounted } from 'vue'

interface EventCallback {
  (...args: any[]): void
}

class EventBus {
  private events: Record<string, EventCallback[]> = {}

  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(callback)
    return () => this.off(event, callback)
  }

  off(event: string, callback?: EventCallback): void {
    if (!this.events[event]) return
    if (callback) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) this.events[event].splice(index, 1)
    } else {
      delete this.events[event]
    }
  }

  emit(event: string, ...args: any[]): void {
    this.events[event]?.forEach((cb) => cb(...args))
  }
}

// 全局单例
const eventBus = new EventBus()

export const EventNames = {
  PAGE_REFRESH: 'pageRefresh',
  USER_LOGIN: 'userLogin',
} as const

export function useEventBus() {
  const unsubscribers: (() => void)[] = []

  const on = (event: string, callback: EventCallback) => {
    const unsubscribe = eventBus.on(event, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    unsubscribers.forEach((fn) => fn())
  })

  return { EventNames, on, off: eventBus.off.bind(eventBus), emit: eventBus.emit.bind(eventBus) }
}
```

### 3. 异步数据加载 Hook

封装异步数据加载逻辑,包括加载状态和错误处理。

```typescript
// composables/useAppInit.ts
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const isInitialized = ref(false)
const isInitializing = ref(false)
let initPromise: Promise<void> | null = null

export const useAppInit = () => {
  const initializeApp = async (): Promise<void> => {
    if (isInitialized.value) return Promise.resolve()
    if (initPromise) return initPromise

    isInitializing.value = true
    initPromise = (async () => {
      try {
        const userStore = useUserStore()
        if (userStore.token) {
          await userStore.fetchUserInfo()
        }
        isInitialized.value = true
      } catch (error) {
        console.error('初始化失败:', error)
        isInitialized.value = true
      } finally {
        isInitializing.value = false
        initPromise = null
      }
    })()
    return initPromise
  }

  const waitForInit = async (timeout = 10000): Promise<void> => {
    if (isInitialized.value) return
    if (initPromise) {
      await Promise.race([
        initPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('超时')), timeout)),
      ])
      return
    }
    await initializeApp()
  }

  return { initializeApp, waitForInit }
}
```

### 4. 国际化 Hook

封装多语言翻译逻辑。

```typescript
// composables/useI18n.ts
import { getPropByPath, isDef, isFunction } from '@/wd/components/common/util'
import { getCurrentMessages, getLanguage, setLanguage, languageState } from '@/locales/i18n'
import { LanguageCode } from '@/systemConfig'

export const useI18n = () => {
  const t = (key: string, fieldInfoOrValue?: any): string => {
    const currentLang = getLanguage()
    const currentMessages = getCurrentMessages()

    // 简单用法: t('userId', '用户名')
    if (typeof fieldInfoOrValue === 'string') {
      return currentLang === LanguageCode.zh_CN ? fieldInfoOrValue : key
    }

    // 字段信息处理
    if (fieldInfoOrValue) {
      if (fieldInfoOrValue[currentLang]) return fieldInfoOrValue[currentLang]
      if (currentLang === LanguageCode.zh_CN && fieldInfoOrValue.comment) {
        return fieldInfoOrValue.comment
      }
      if (fieldInfoOrValue.field) return fieldInfoOrValue.field
    }

    // 常规国际化处理
    const message = getPropByPath(currentMessages, key)
    return isDef(message) ? (isFunction(message) ? message() : message) : key
  }

  return {
    t,
    currentLanguage: languageState.current,
    isChinese: languageState.isChinese,
    setLanguage,
  }
}
```

### 5. 依赖注入 Hook

使用 Vue 的 provide/inject 实现跨层级组件通信。

```typescript
// composables/useThemeProvider.ts
import { provide, inject, ref, readonly } from 'vue'

export interface ThemeConfig {
  primaryColor: string
  isDark: boolean
}

export const THEME_INJECTION_KEY = Symbol('theme')

// 提供者
export const useThemeProvider = (initialTheme?: Partial<ThemeConfig>) => {
  const theme = ref<ThemeConfig>({
    primaryColor: '#1890ff',
    isDark: false,
    ...initialTheme,
  })

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    theme.value = { ...theme.value, ...newTheme }
  }

  provide(THEME_INJECTION_KEY, { theme: readonly(theme), updateTheme })
  return { theme, updateTheme }
}

// 注入者
export const useThemeInject = () => {
  const injected = inject(THEME_INJECTION_KEY)
  if (!injected) throw new Error('必须在 useThemeProvider 的子组件中使用')
  return injected
}
```

### 6. 组合多个 Hook

多个 Hook 可以自由组合使用。

```vue
<script lang="ts" setup>
import { useAnimation } from '@/composables/useAnimation'
import { useI18n } from '@/composables/useI18n'
import { useEventBus } from '@/composables/useEventBus'
import { useDialog } from '@/composables/useDialog'

// 组合使用
const { nextAnimation, setAnimation } = useAnimation()
const { t, currentLanguageName } = useI18n()
const { on, emit, EventNames } = useEventBus()
const { visible, openDialog } = useDialog({ title: '提示' })

on(EventNames.USER_LOGIN, () => openDialog())
</script>
```

## 高级用法

### 1. 带清理逻辑的 Hook

自动清理副作用,防止内存泄漏。

```typescript
// composables/useCountdown.ts
import { ref, onUnmounted } from 'vue'

interface CountdownOptions {
  interval?: number
  onFinish?: () => void
}

export const useCountdown = (initialCount = 60, options: CountdownOptions = {}) => {
  const { interval = 1000, onFinish } = options
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
    if (isActive.value) return
    isActive.value = true
    timerId = setInterval(() => {
      count.value--
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

  onUnmounted(() => stop())

  return { count, isActive, start, stop, reset }
}
```

### 2. 可配置的存储 Hook

```typescript
// composables/useStorage.ts
import { ref, watch } from 'vue'

type StorageType = 'local' | 'session'

interface StorageOptions<T> {
  storage?: StorageType
  serializer?: { read: (v: string) => T; write: (v: T) => string }
}

export const useStorage = <T>(key: string, defaultValue: T, options: StorageOptions<T> = {}) => {
  const { storage = 'local', serializer = { read: JSON.parse, write: JSON.stringify } } = options
  const storageObj = storage === 'local' ? localStorage : sessionStorage
  const value = ref<T>(defaultValue)

  // 初始化读取
  try {
    const rawValue = storageObj.getItem(key)
    if (rawValue !== null) value.value = serializer.read(rawValue)
  } catch (e) { console.error(e) }

  // 监听变化自动保存
  watch(value, (newValue) => {
    try { storageObj.setItem(key, serializer.write(newValue)) } catch (e) { console.error(e) }
  }, { deep: true })

  const remove = () => {
    storageObj.removeItem(key)
    value.value = defaultValue
  }

  return { value, remove }
}
```

### 3. 异步状态管理 Hook

```typescript
// composables/useAsync.ts
import { ref, shallowRef, onMounted } from 'vue'

interface AsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export const useAsync = <T>(asyncFn: (...args: any[]) => Promise<T>, options: AsyncOptions<T> = {}) => {
  const { immediate = false, onSuccess, onError } = options
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (...args: any[]): Promise<T | null> => {
    loading.value = true
    error.value = null
    try {
      const result = await asyncFn(...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err) {
      error.value = err as Error
      onError?.(err as Error)
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

  if (immediate) onMounted(() => execute())

  return { data, loading, error, execute, reset }
}
```

### 4. 防抖和节流 Hook

```typescript
// composables/useDebounceThrottle.ts
import { onUnmounted } from 'vue'

export const useDebounce = <T extends (...args: any[]) => any>(fn: T, delay = 300) => {
  let timerId: number | null = null

  const debouncedFn = (...args: Parameters<T>) => {
    if (timerId !== null) clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay) as unknown as number
  }

  onUnmounted(() => { if (timerId !== null) clearTimeout(timerId) })
  return debouncedFn
}

export const useThrottle = <T extends (...args: any[]) => any>(fn: T, delay = 300) => {
  let lastTime = 0

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }

  return throttledFn
}
```

### 5. 可取消的异步 Hook

支持取消异步操作,避免竞态条件。

```typescript
// composables/useCancelableAsync.ts
import { ref, shallowRef, onUnmounted } from 'vue'

export const useCancelableAsync = <T>(
  asyncFn: (signal: AbortSignal, ...args: any[]) => Promise<T>
) => {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let abortController: AbortController | null = null

  const execute = async (...args: any[]): Promise<T | null> => {
    if (abortController) abortController.abort()
    abortController = new AbortController()
    const signal = abortController.signal

    loading.value = true
    error.value = null

    try {
      const result = await asyncFn(signal, ...args)
      if (!signal.aborted) data.value = result
      return result
    } catch (err) {
      if ((err as Error).name === 'AbortError') return null
      error.value = err as Error
      return null
    } finally {
      if (!signal.aborted) loading.value = false
    }
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      loading.value = false
    }
  }

  onUnmounted(() => cancel())

  return { data, loading, error, execute, cancel }
}
```

### 6. 响应式媒体查询 Hook

```typescript
// composables/useMediaQuery.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

type ScreenType = 'mobile' | 'tablet' | 'desktop'

export const useMediaQuery = () => {
  const windowWidth = ref(0)
  const windowHeight = ref(0)
  const breakpoints = { mobile: 768, tablet: 1024 }

  const updateWindowSize = () => {
    const systemInfo = uni.getSystemInfoSync()
    windowWidth.value = systemInfo.windowWidth
    windowHeight.value = systemInfo.windowHeight
  }

  const screenType = computed<ScreenType>(() => {
    if (windowWidth.value < breakpoints.mobile) return 'mobile'
    if (windowWidth.value < breakpoints.tablet) return 'tablet'
    return 'desktop'
  })

  const isMobile = computed(() => screenType.value === 'mobile')
  const isTablet = computed(() => screenType.value === 'tablet')
  const isDesktop = computed(() => screenType.value === 'desktop')

  // #ifdef H5
  let resizeHandler: (() => void) | null = null
  onMounted(() => {
    updateWindowSize()
    resizeHandler = updateWindowSize
    window.addEventListener('resize', resizeHandler)
  })
  onUnmounted(() => {
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  })
  // #endif

  // #ifndef H5
  onMounted(() => updateWindowSize())
  // #endif

  return { isMobile, isTablet, isDesktop, screenType, windowWidth, windowHeight }
}
```

### 7. 表单验证 Hook

```typescript
// composables/useFormValidation.ts
import { reactive, ref, computed, watch } from 'vue'

interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  validator?: (value: any) => boolean
  message: string
}

type FormRules<T> = { [K in keyof T]?: ValidationRule[] }
type FormErrors<T> = { [K in keyof T]?: string }

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  rules: FormRules<T>
) => {
  const formData = reactive<T>({ ...initialData })
  const errors = reactive<FormErrors<T>>({})

  const validateField = (field: keyof T): boolean => {
    const fieldRules = rules[field]
    if (!fieldRules) return true

    const value = formData[field]
    for (const rule of fieldRules) {
      if (rule.required && !value) { errors[field] = rule.message; return false }
      if (!value) continue
      if (rule.min !== undefined && String(value).length < rule.min) { errors[field] = rule.message; return false }
      if (rule.max !== undefined && String(value).length > rule.max) { errors[field] = rule.message; return false }
      if (rule.validator && !rule.validator(value)) { errors[field] = rule.message; return false }
    }
    delete errors[field]
    return true
  }

  const validate = async (): Promise<boolean> => {
    let isValid = true
    for (const field in rules) {
      if (!validateField(field as keyof T)) isValid = false
    }
    return isValid
  }

  const isValid = computed(() => Object.keys(errors).length === 0)

  const reset = () => {
    Object.keys(initialData).forEach((key) => {
      formData[key as keyof T] = initialData[key as keyof T]
      delete errors[key as keyof T]
    })
  }

  // 实时验证
  Object.keys(rules).forEach((field) => {
    watch(() => formData[field as keyof T], () => {
      if (errors[field as keyof T]) validateField(field as keyof T)
    })
  })

  return { formData, errors, isValid, validate, validateField, reset }
}
```

## API

### Hook 设计模式

| 模式 | 说明 | 示例 |
|------|------|------|
| 基本模式 | 封装状态和方法 | `useDialog` |
| 单例模式 | 全局共享状态 | `useEventBus` |
| 工厂模式 | 根据配置创建实例 | `useStorage<T>` |

### 常用 Hook 列表

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useDialog` | 对话框状态管理 | `{ visible, openDialog, closeDialog }` |
| `useEventBus` | 事件总线 | `{ on, off, emit }` |
| `useAsync` | 异步状态管理 | `{ data, loading, error, execute }` |
| `useCancelableAsync` | 可取消异步 | `{ data, loading, execute, cancel }` |
| `useCountdown` | 倒计时 | `{ count, start, stop, reset }` |
| `useDebounce` | 防抖函数 | `debouncedFn` |
| `useThrottle` | 节流函数 | `throttledFn` |
| `useStorage` | 本地存储 | `{ value, remove }` |
| `useMediaQuery` | 媒体查询 | `{ isMobile, isDesktop, ... }` |
| `useFormValidation` | 表单验证 | `{ formData, errors, validate }` |
| `useI18n` | 国际化 | `{ t, currentLanguage, setLanguage }` |

### 命名约定

| 前缀 | 用途 | 示例 |
|------|------|------|
| `use` | 标准 Hook | `useDialog`, `useAsync` |
| `is` | 布尔状态 | `isActive`, `isValid` |
| `has` | 布尔检查 | `hasError` |
| `set` | 设置值 | `setAnimation` |
| `toggle` | 切换状态 | `toggleDark` |

## 类型定义

### 核心类型

```typescript
// Hook 配置选项
interface HookOptions {
  immediate?: boolean
  onError?: (error: Error) => void
}

// Hook 返回值
interface HookReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
}

// 验证规则
interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  validator?: (value: any) => boolean
  message: string
}

// 异步函数类型
type AsyncFunction<T> = (...args: any[]) => Promise<T>
type CancelableAsyncFunction<T> = (signal: AbortSignal, ...args: any[]) => Promise<T>
```

## 最佳实践

### 1. 遵循命名约定

所有自定义 Hook 必须以 `use` 开头。

```typescript
// ✅ 推荐
export const useDialog = () => { ... }
export const useAsync = () => { ... }

// ❌ 不推荐
export const dialog = () => { ... }
```

### 2. 单一职责原则

每个 Hook 只负责一个明确的功能。

```typescript
// ✅ 推荐: 分离职责
export const useDialog = () => { /* 对话框逻辑 */ }
export const useFormValidation = () => { /* 验证逻辑 */ }

// ❌ 不推荐: 混合多种功能
export const useEverything = () => { /* 对话框+表单+请求... */ }
```

### 3. 自动清理副作用

使用 `onUnmounted` 自动清理定时器、事件监听等。

```typescript
// ✅ 推荐
export const useInterval = (callback: () => void, delay: number) => {
  let timerId: number | null = null

  const start = () => { timerId = setInterval(callback, delay) }
  const stop = () => { if (timerId) clearInterval(timerId) }

  onUnmounted(() => stop()) // 自动清理

  return { start, stop }
}
```

### 4. 提供完整的 TypeScript 类型

```typescript
// ✅ 推荐
interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
}

export const useAsync = <T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options?: UseAsyncOptions<T>
): { data: Ref<T | null>; loading: Ref<boolean> } => { ... }
```

### 5. 合理使用响应式 API

- `ref()`: 基本数据类型
- `reactive()`: 对象和数组
- `shallowRef()`: 大数据对象
- `computed()`: 派生数据
- `readonly()`: 只读数据

### 6. 返回只读状态

对于不应被外部修改的状态,返回只读版本。

```typescript
import { readonly } from 'vue'

export const useCounter = () => {
  const count = ref(0)
  const increment = () => count.value++

  return { count: readonly(count), increment } // 防止外部直接修改
}
```

### 7. 组合优于继承

通过组合多个小 Hook 构建复杂功能。

```typescript
// ✅ 推荐: 组合小 Hook
export const useDataFetch = (fetchFn: () => Promise<any>) => {
  const { loading, setLoading } = useLoading()
  const { error, setError } = useError()
  const data = ref(null)

  const execute = async () => {
    setLoading(true)
    try { data.value = await fetchFn() }
    catch (err) { setError(err as Error) }
    finally { setLoading(false) }
  }

  return { data, loading, error, execute }
}
```

## 常见问题

### 1. Hook 可以在条件语句中使用吗?

Vue 3 没有 React 的 Hooks 规则限制,可以在条件语句中使用。但推荐在顶层调用以保持一致性。

```vue
<script lang="ts" setup>
// ✅ 推荐: 顶层调用
const dialog = useDialog()
const showDialog = someCondition ? dialog.openDialog : () => {}
</script>
```

### 2. Hook 之间如何共享状态?

**方案1: 单例模式**

```typescript
// 全局单例状态
const userInfo = ref({ id: 0, name: '' })

export const useUserStore = () => {
  const setUserInfo = (info: any) => { userInfo.value = info }
  return { userInfo, setUserInfo }
}
```

**方案2: Pinia**

```typescript
export const useUserStore = defineStore('user', () => {
  const userInfo = ref({ id: 0, name: '' })
  return { userInfo }
})
```

### 3. 异步操作如何处理错误?

```typescript
export const useAsync = <T>(asyncFn: () => Promise<T>, options = {}) => {
  const { onError } = options
  const error = ref<Error | null>(null)

  const execute = async () => {
    try {
      return await asyncFn()
    } catch (err) {
      error.value = err as Error
      onError?.(err as Error)
      // 全局处理
      if (err.response?.status === 401) {
        uni.navigateTo({ url: '/pages/login/index' })
      }
    }
  }

  return { error, execute }
}
```

### 4. 响应式数据失去响应性怎么办?

```vue
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 使用 storeToRefs 保持响应性
const { userName } = storeToRefs(userStore)

// 方法可以直接解构
const { updateUserInfo } = userStore
</script>
```

### 5. 如何处理竞态条件?

使用 `AbortController` 取消之前的请求:

```typescript
export const useCancelableAsync = <T>(asyncFn: (signal: AbortSignal) => Promise<T>) => {
  let abortController: AbortController | null = null

  const execute = async () => {
    if (abortController) abortController.abort() // 取消之前的请求
    abortController = new AbortController()

    try {
      return await asyncFn(abortController.signal)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return null
      throw err
    }
  }

  return { execute }
}
```

### 6. 如何优化性能?

1. **使用 shallowRef**: 大数据列表使用 `shallowRef` 避免深度响应式
2. **使用 computed**: 缓存计算结果
3. **使用防抖/节流**: 优化高频操作

```typescript
// 大数据使用 shallowRef
const largeList = shallowRef([])

// 使用 computed 缓存
const total = computed(() => list.value.reduce((a, b) => a + b, 0))

// 防抖搜索
const debouncedSearch = useDebounce((keyword) => searchApi(keyword), 500)
```
