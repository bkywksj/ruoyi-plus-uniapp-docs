# 自定义插件开发

## 介绍

自定义插件开发是 RuoYi-Plus-UniApp 框架的重要扩展能力,允许开发者根据业务需求创建个性化的功能模块。通过遵循框架的开发规范和最佳实践,开发者可以快速构建高质量、可维护的插件,实现与框架的无缝集成。

**核心特性:**

- **Composable 模式** - 基于 Vue 3 Composition API,采用组合式函数模式封装业务逻辑
- **TypeScript 支持** - 完整的类型定义,提供良好的开发体验和类型安全
- **平台适配** - 通过条件编译实现跨平台兼容,支持 App、H5、小程序等多端
- **状态管理** - 集成 Pinia 状态管理,实现数据持久化和响应式更新
- **模块化设计** - 遵循单一职责原则,每个插件专注于特定功能域
- **可配置性** - 通过配置项实现插件行为的灵活定制
- **生命周期管理** - 完善的初始化、销毁和资源回收机制

## 开发环境

### 技术栈要求

| 技术 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18.0.0 | JavaScript 运行环境 |
| pnpm | >= 8.0.0 | 包管理器 |
| Vue | 3.4.21 | 前端框架 |
| TypeScript | 5.7.2 | 类型支持 |
| Vite | 6.3.5 | 构建工具 |
| UniApp | 3.0.0 | 跨平台框架 |

### 项目结构

```text
plus-uniapp/
├── src/
│   ├── composables/          # 组合式函数目录
│   │   ├── useAuth.ts        # 认证相关
│   │   ├── useRequest.ts     # 请求封装
│   │   └── useCustom.ts      # 自定义插件
│   ├── stores/               # Pinia 状态管理
│   │   ├── modules/          # 状态模块
│   │   │   └── custom.ts     # 自定义状态
│   │   └── index.ts          # 状态导出
│   ├── utils/                # 工具函数
│   │   └── custom/           # 自定义工具
│   ├── types/                # 类型定义
│   │   └── custom.d.ts       # 自定义类型
│   └── plugins/              # 插件目录
│       └── custom/           # 自定义插件
│           ├── index.ts      # 插件入口
│           └── config.ts     # 插件配置
```

## 基础开发

### Composable 基础结构

创建自定义 Composable 的基础模板:

```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 类型定义
interface UseCustomOptions {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 初始化回调 */
  onInit?: () => void
  /** 销毁回调 */
  onDestroy?: () => void
}

interface UseCustomReturn {
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | null>
  /** 数据 */
  data: Ref<any>
  /** 初始化方法 */
  init: () => Promise<void>
  /** 销毁方法 */
  destroy: () => void
}

/**
 * 自定义 Composable
 * @param options 配置选项
 */
export const useCustom = (options: UseCustomOptions = {}): UseCustomReturn => {
  const {
    autoInit = true,
    onInit,
    onDestroy
  } = options

  // 响应式状态
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)

  // 计算属性
  const hasData = computed(() => data.value !== null)
  const hasError = computed(() => error.value !== null)

  // 初始化方法
  const init = async (): Promise<void> => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      // 执行初始化逻辑
      await doInit()

      // 触发初始化回调
      onInit?.()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '初始化失败'
      console.error('[useCustom] 初始化失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 内部初始化逻辑
  const doInit = async (): Promise<void> => {
    // 具体初始化实现
  }

  // 销毁方法
  const destroy = (): void => {
    // 清理资源
    data.value = null
    error.value = null

    // 触发销毁回调
    onDestroy?.()
  }

  // 生命周期钩子
  onMounted(() => {
    if (autoInit) {
      init()
    }
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    loading,
    error,
    data,
    hasData,
    hasError,
    init,
    destroy
  }
}
```

### 带状态管理的 Composable

结合 Pinia 实现带持久化的状态管理:

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 定义 Store
export const useCustomStore = defineStore('custom', () => {
  // 状态
  const items = ref<CustomItem[]>([])
  const selectedId = ref<string | null>(null)
  const config = ref<CustomConfig>({
    theme: 'light',
    language: 'zh-CN'
  })

  // Getters
  const selectedItem = computed(() => {
    if (!selectedId.value) return null
    return items.value.find(item => item.id === selectedId.value)
  })

  const itemCount = computed(() => items.value.length)

  // Actions
  const addItem = (item: CustomItem): void => {
    items.value.push(item)
  }

  const removeItem = (id: string): void => {
    const index = items.value.findIndex(item => item.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const selectItem = (id: string): void => {
    selectedId.value = id
  }

  const updateConfig = (newConfig: Partial<CustomConfig>): void => {
    config.value = { ...config.value, ...newConfig }
  }

  const reset = (): void => {
    items.value = []
    selectedId.value = null
  }

  return {
    // 状态
    items,
    selectedId,
    config,
    // Getters
    selectedItem,
    itemCount,
    // Actions
    addItem,
    removeItem,
    selectItem,
    updateConfig,
    reset
  }
}, {
  // 持久化配置
  persist: {
    key: 'custom-store',
    storage: {
      getItem: (key) => uni.getStorageSync(key),
      setItem: (key, value) => uni.setStorageSync(key, value)
    },
    paths: ['items', 'config']
  }
})

// Composable 封装
export const useCustom = () => {
  const store = useCustomStore()

  // 业务方法
  const createItem = async (data: Partial<CustomItem>): Promise<CustomItem> => {
    const item: CustomItem = {
      id: generateId(),
      createdAt: Date.now(),
      ...data
    }

    store.addItem(item)
    return item
  }

  const deleteItem = async (id: string): Promise<void> => {
    store.removeItem(id)
  }

  return {
    // Store 状态
    items: computed(() => store.items),
    selectedItem: computed(() => store.selectedItem),
    config: computed(() => store.config),
    // 业务方法
    createItem,
    deleteItem,
    selectItem: store.selectItem,
    updateConfig: store.updateConfig
  }
}

// 辅助函数
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 类型定义
interface CustomItem {
  id: string
  title?: string
  content?: string
  createdAt: number
}

interface CustomConfig {
  theme: 'light' | 'dark'
  language: string
}
```

### 请求封装 Composable

封装 API 请求的 Composable 模式:

```typescript
import { ref, computed } from 'vue'
import { useRequest } from '@/composables/useRequest'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

interface PageResult<T> {
  total: number
  rows: T[]
}

interface UseApiOptions<T> {
  /** 是否立即请求 */
  immediate?: boolean
  /** 初始数据 */
  initialData?: T
  /** 请求成功回调 */
  onSuccess?: (data: T) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
}

/**
 * API 请求 Composable
 */
export const useApi = <T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) => {
  const {
    immediate = false,
    initialData,
    onSuccess,
    onError
  } = options

  const data = ref<T | undefined>(initialData)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (): Promise<T | undefined> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetcher()

      if (response.code === 200) {
        data.value = response.data
        onSuccess?.(response.data)
        return response.data
      } else {
        throw new Error(response.msg || '请求失败')
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('未知错误')
      error.value = err
      onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = (): void => {
    data.value = initialData
    error.value = null
    loading.value = false
  }

  // 立即执行
  if (immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

/**
 * 分页请求 Composable
 */
export const usePageApi = <T>(
  fetcher: (params: PageParams) => Promise<ApiResponse<PageResult<T>>>,
  options: UsePageApiOptions<T> = {}
) => {
  const {
    pageSize = 10,
    immediate = false
  } = options

  const list = ref<T[]>([])
  const total = ref(0)
  const pageNum = ref(1)
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)

  // 计算属性
  const isEmpty = computed(() => list.value.length === 0 && !loading.value)
  const hasMore = computed(() => list.value.length < total.value)

  // 获取数据
  const fetch = async (isRefresh = false): Promise<void> => {
    if (loading.value) return

    loading.value = true

    try {
      if (isRefresh) {
        pageNum.value = 1
        refreshing.value = true
      }

      const response = await fetcher({
        pageNum: pageNum.value,
        pageSize
      })

      if (response.code === 200) {
        const { rows, total: totalCount } = response.data

        if (isRefresh) {
          list.value = rows
        } else {
          list.value = [...list.value, ...rows]
        }

        total.value = totalCount
        finished.value = list.value.length >= totalCount
      }
    } catch (e) {
      console.error('[usePageApi] 请求失败:', e)
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  // 刷新
  const refresh = async (): Promise<void> => {
    await fetch(true)
  }

  // 加载更多
  const loadMore = async (): Promise<void> => {
    if (finished.value || loading.value) return
    pageNum.value++
    await fetch()
  }

  // 重置
  const reset = (): void => {
    list.value = []
    total.value = 0
    pageNum.value = 1
    finished.value = false
  }

  // 立即执行
  if (immediate) {
    fetch()
  }

  return {
    list,
    total,
    pageNum,
    loading,
    finished,
    refreshing,
    isEmpty,
    hasMore,
    fetch,
    refresh,
    loadMore,
    reset
  }
}

// 类型定义
interface PageParams {
  pageNum: number
  pageSize: number
}

interface UsePageApiOptions<T> {
  pageSize?: number
  immediate?: boolean
}
```

## 平台适配开发

### 条件编译

使用条件编译实现平台特定代码:

```typescript
/**
 * 平台适配 Composable
 */
export const usePlatform = () => {
  // 获取平台信息
  const getPlatform = (): string => {
    // #ifdef APP-PLUS
    return 'app'
    // #endif

    // #ifdef H5
    return 'h5'
    // #endif

    // #ifdef MP-WEIXIN
    return 'weixin'
    // #endif

    // #ifdef MP-ALIPAY
    return 'alipay'
    // #endif

    // #ifdef MP-BAIDU
    return 'baidu'
    // #endif

    // #ifdef MP-TOUTIAO
    return 'toutiao'
    // #endif

    return 'unknown'
  }

  // 平台特定功能
  const doNativeAction = async (): Promise<void> => {
    // #ifdef APP-PLUS
    // App 端原生功能
    const result = await new Promise((resolve) => {
      plus.nativeUI.actionSheet({
        title: '选择操作',
        cancel: '取消',
        buttons: [
          { title: '拍照' },
          { title: '相册' }
        ]
      }, (e) => {
        resolve(e.index)
      })
    })
    console.log('选择结果:', result)
    // #endif

    // #ifdef H5
    // H5 端实现
    const result = await new Promise((resolve) => {
      // 使用 H5 原生对话框或自定义实现
      const choice = confirm('是否继续?')
      resolve(choice ? 1 : 0)
    })
    console.log('选择结果:', result)
    // #endif

    // #ifdef MP-WEIXIN
    // 微信小程序实现
    const { tapIndex } = await uni.showActionSheet({
      itemList: ['拍照', '相册']
    })
    console.log('选择结果:', tapIndex)
    // #endif
  }

  // 判断平台
  const isApp = (): boolean => {
    // #ifdef APP-PLUS
    return true
    // #endif
    return false
  }

  const isH5 = (): boolean => {
    // #ifdef H5
    return true
    // #endif
    return false
  }

  const isWeixin = (): boolean => {
    // #ifdef MP-WEIXIN
    return true
    // #endif
    return false
  }

  const isMiniProgram = (): boolean => {
    // #ifdef MP
    return true
    // #endif
    return false
  }

  return {
    getPlatform,
    doNativeAction,
    isApp,
    isH5,
    isWeixin,
    isMiniProgram
  }
}
```

### 平台 API 封装

统一封装不同平台的 API:

```typescript
/**
 * 剪贴板操作
 */
export const useClipboard = () => {
  const copy = async (text: string): Promise<boolean> => {
    try {
      // #ifdef APP-PLUS
      // App 端使用原生剪贴板
      plus.runtime.setBadgeNumber(0)
      const os = plus.os.name?.toLowerCase()

      if (os === 'android') {
        const Context = plus.android.importClass('android.content.Context')
        const main = plus.android.runtimeMainActivity()
        const clip = main.getSystemService(Context.CLIPBOARD_SERVICE)
        plus.android.invoke(clip, 'setText', text)
      } else {
        const pasteboard = plus.ios.invoke('UIPasteboard', 'generalPasteboard')
        plus.ios.invoke(pasteboard, 'setString:', text)
      }
      return true
      // #endif

      // #ifdef H5
      // H5 使用 Clipboard API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      }

      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
      // #endif

      // #ifdef MP
      // 小程序使用 setClipboardData
      await uni.setClipboardData({ data: text })
      return true
      // #endif

      return false
    } catch (e) {
      console.error('[useClipboard] 复制失败:', e)
      return false
    }
  }

  const paste = async (): Promise<string> => {
    try {
      // #ifdef APP-PLUS
      const os = plus.os.name?.toLowerCase()

      if (os === 'android') {
        const Context = plus.android.importClass('android.content.Context')
        const main = plus.android.runtimeMainActivity()
        const clip = main.getSystemService(Context.CLIPBOARD_SERVICE)
        const primaryClip = plus.android.invoke(clip, 'getPrimaryClip')

        if (primaryClip) {
          const item = plus.android.invoke(primaryClip, 'getItemAt', 0)
          const text = plus.android.invoke(item, 'getText')
          return text?.toString() || ''
        }
      } else {
        const pasteboard = plus.ios.invoke('UIPasteboard', 'generalPasteboard')
        return plus.ios.invoke(pasteboard, 'string') || ''
      }
      // #endif

      // #ifdef H5
      if (navigator.clipboard) {
        return await navigator.clipboard.readText()
      }
      // #endif

      // #ifdef MP
      const { data } = await uni.getClipboardData()
      return data
      // #endif

      return ''
    } catch (e) {
      console.error('[useClipboard] 粘贴失败:', e)
      return ''
    }
  }

  return { copy, paste }
}

/**
 * 震动反馈
 */
export const useVibrate = () => {
  const vibrate = (duration: number = 15): void => {
    // #ifdef APP-PLUS
    plus.device.vibrate(duration)
    // #endif

    // #ifdef H5
    if (navigator.vibrate) {
      navigator.vibrate(duration)
    }
    // #endif

    // #ifdef MP
    uni.vibrateShort({
      type: 'medium'
    })
    // #endif
  }

  const vibrateShort = (): void => {
    // #ifdef MP
    uni.vibrateShort({ type: 'light' })
    // #endif

    // #ifndef MP
    vibrate(15)
    // #endif
  }

  const vibrateLong = (): void => {
    // #ifdef MP
    uni.vibrateLong()
    // #endif

    // #ifndef MP
    vibrate(400)
    // #endif
  }

  return { vibrate, vibrateShort, vibrateLong }
}
```

### 原生能力扩展

扩展 App 端原生能力:

```typescript
/**
 * 原生模块调用
 */
export const useNative = () => {
  // 调用原生模块
  const invoke = async <T>(
    moduleName: string,
    methodName: string,
    params?: Record<string, any>
  ): Promise<T> => {
    // #ifdef APP-PLUS
    return new Promise((resolve, reject) => {
      const module = uni.requireNativePlugin(moduleName)

      if (!module) {
        reject(new Error(`模块 ${moduleName} 不存在`))
        return
      }

      if (typeof module[methodName] !== 'function') {
        reject(new Error(`方法 ${methodName} 不存在`))
        return
      }

      module[methodName](params, (result: T) => {
        resolve(result)
      }, (error: Error) => {
        reject(error)
      })
    })
    // #endif

    // #ifndef APP-PLUS
    throw new Error('仅 App 端支持原生模块调用')
    // #endif
  }

  // 监听原生事件
  const on = (eventName: string, callback: (data: any) => void): void => {
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener(eventName, callback)
    // #endif
  }

  // 移除原生事件
  const off = (eventName: string, callback: (data: any) => void): void => {
    // #ifdef APP-PLUS
    plus.globalEvent.removeEventListener(eventName, callback)
    // #endif
  }

  // 发送原生事件
  const emit = (eventName: string, data?: any): void => {
    // #ifdef APP-PLUS
    const webview = plus.webview.currentWebview()
    webview.evalJS(`
      uni.$emit('${eventName}', ${JSON.stringify(data)})
    `)
    // #endif
  }

  return {
    invoke,
    on,
    off,
    emit
  }
}

/**
 * App 全局监听
 */
export const useAppListener = () => {
  const onResume = (callback: () => void): void => {
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener('resume', callback)
    // #endif
  }

  const onPause = (callback: () => void): void => {
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener('pause', callback)
    // #endif
  }

  const onNetworkChange = (callback: (type: string) => void): void => {
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener('netchange', () => {
      const types = {}
      types[plus.networkinfo.CONNECTION_UNKNOW] = 'unknown'
      types[plus.networkinfo.CONNECTION_NONE] = 'none'
      types[plus.networkinfo.CONNECTION_ETHERNET] = 'ethernet'
      types[plus.networkinfo.CONNECTION_WIFI] = 'wifi'
      types[plus.networkinfo.CONNECTION_CELL2G] = '2g'
      types[plus.networkinfo.CONNECTION_CELL3G] = '3g'
      types[plus.networkinfo.CONNECTION_CELL4G] = '4g'
      types[plus.networkinfo.CONNECTION_CELL5G] = '5g'

      const type = plus.networkinfo.getCurrentType()
      callback(types[type] || 'unknown')
    })
    // #endif
  }

  return {
    onResume,
    onPause,
    onNetworkChange
  }
}
```

## 高级开发模式

### 插件系统架构

创建可扩展的插件系统:

```typescript
// 插件接口定义
interface Plugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 安装方法 */
  install: (app: App, options?: PluginOptions) => void
  /** 卸载方法 */
  uninstall?: () => void
}

interface PluginOptions {
  [key: string]: any
}

// 插件管理器
class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private app: App | null = null

  // 设置 App 实例
  setApp(app: App): void {
    this.app = app
  }

  // 注册插件
  register(plugin: Plugin, options?: PluginOptions): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已注册`)
      return
    }

    this.plugins.set(plugin.name, plugin)

    if (this.app) {
      plugin.install(this.app, options)
    }

    console.log(`插件 ${plugin.name}@${plugin.version} 注册成功`)
  }

  // 卸载插件
  unregister(name: string): void {
    const plugin = this.plugins.get(name)

    if (!plugin) {
      console.warn(`插件 ${name} 未注册`)
      return
    }

    plugin.uninstall?.()
    this.plugins.delete(name)

    console.log(`插件 ${name} 已卸载`)
  }

  // 获取插件
  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  // 获取所有插件
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  // 检查插件是否存在
  has(name: string): boolean {
    return this.plugins.has(name)
  }
}

// 导出单例
export const pluginManager = new PluginManager()

// 创建插件的辅助函数
export const definePlugin = (config: Plugin): Plugin => {
  return config
}

// 示例插件
export const loggerPlugin = definePlugin({
  name: 'logger',
  version: '1.0.0',

  install(app, options = {}) {
    const { prefix = '[App]' } = options

    // 添加全局方法
    app.config.globalProperties.$log = {
      info: (msg: string, ...args: any[]) => {
        console.log(`${prefix} [INFO]`, msg, ...args)
      },
      warn: (msg: string, ...args: any[]) => {
        console.warn(`${prefix} [WARN]`, msg, ...args)
      },
      error: (msg: string, ...args: any[]) => {
        console.error(`${prefix} [ERROR]`, msg, ...args)
      }
    }

    // 添加全局 Composable
    app.provide('logger', {
      prefix,
      log: app.config.globalProperties.$log
    })
  },

  uninstall() {
    // 清理资源
  }
})
```

### 事件总线

实现应用级事件通信:

```typescript
type EventHandler = (...args: any[]) => void

interface EventBus {
  on: (event: string, handler: EventHandler) => void
  once: (event: string, handler: EventHandler) => void
  off: (event: string, handler?: EventHandler) => void
  emit: (event: string, ...args: any[]) => void
  clear: () => void
}

/**
 * 创建事件总线
 */
export const createEventBus = (): EventBus => {
  const events = new Map<string, Set<EventHandler>>()

  const on = (event: string, handler: EventHandler): void => {
    if (!events.has(event)) {
      events.set(event, new Set())
    }
    events.get(event)!.add(handler)
  }

  const once = (event: string, handler: EventHandler): void => {
    const onceHandler: EventHandler = (...args) => {
      handler(...args)
      off(event, onceHandler)
    }
    on(event, onceHandler)
  }

  const off = (event: string, handler?: EventHandler): void => {
    if (!handler) {
      events.delete(event)
      return
    }

    const handlers = events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        events.delete(event)
      }
    }
  }

  const emit = (event: string, ...args: any[]): void => {
    const handlers = events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (e) {
          console.error(`[EventBus] 事件处理错误 (${event}):`, e)
        }
      })
    }
  }

  const clear = (): void => {
    events.clear()
  }

  return { on, once, off, emit, clear }
}

// 全局事件总线
export const eventBus = createEventBus()

// Composable 封装
export const useEventBus = () => {
  const handlers: Array<{ event: string; handler: EventHandler }> = []

  const on = (event: string, handler: EventHandler): void => {
    eventBus.on(event, handler)
    handlers.push({ event, handler })
  }

  const once = (event: string, handler: EventHandler): void => {
    eventBus.once(event, handler)
  }

  const emit = (event: string, ...args: any[]): void => {
    eventBus.emit(event, ...args)
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    handlers.forEach(({ event, handler }) => {
      eventBus.off(event, handler)
    })
  })

  return { on, once, emit, off: eventBus.off }
}
```

### 依赖注入

使用 Vue 依赖注入实现模块解耦:

```typescript
import { inject, provide, type InjectionKey } from 'vue'

// 定义注入键
interface ConfigService {
  get: <T>(key: string, defaultValue?: T) => T
  set: (key: string, value: any) => void
  has: (key: string) => boolean
}

export const ConfigServiceKey: InjectionKey<ConfigService> = Symbol('ConfigService')

// 提供服务
export const provideConfigService = (): void => {
  const config = new Map<string, any>()

  const service: ConfigService = {
    get: <T>(key: string, defaultValue?: T): T => {
      return config.has(key) ? config.get(key) : defaultValue
    },
    set: (key: string, value: any): void => {
      config.set(key, value)
    },
    has: (key: string): boolean => {
      return config.has(key)
    }
  }

  provide(ConfigServiceKey, service)
}

// 使用服务
export const useConfigService = (): ConfigService => {
  const service = inject(ConfigServiceKey)

  if (!service) {
    throw new Error('ConfigService 未提供,请先调用 provideConfigService')
  }

  return service
}

// 创建可注入的 Composable
export const createInjectable = <T>(
  key: InjectionKey<T>,
  factory: () => T
) => {
  return {
    provide: () => {
      const instance = factory()
      provide(key, instance)
      return instance
    },
    inject: () => {
      const instance = inject(key)
      if (!instance) {
        throw new Error(`服务未提供: ${String(key)}`)
      }
      return instance
    }
  }
}

// 使用示例
interface UserService {
  user: Ref<User | null>
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
}

export const UserServiceKey: InjectionKey<UserService> = Symbol('UserService')

export const userService = createInjectable(UserServiceKey, () => {
  const user = ref<User | null>(null)

  const login = async (credentials: Credentials): Promise<void> => {
    // 登录逻辑
  }

  const logout = async (): Promise<void> => {
    user.value = null
  }

  return { user, login, logout }
})
```

### 中间件模式

实现请求/响应中间件:

```typescript
type Middleware<T> = (context: T, next: () => Promise<void>) => Promise<void>

/**
 * 中间件管道
 */
export const createPipeline = <T>() => {
  const middlewares: Middleware<T>[] = []

  const use = (middleware: Middleware<T>): void => {
    middlewares.push(middleware)
  }

  const execute = async (context: T): Promise<void> => {
    let index = -1

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() 被多次调用')
      }

      index = i

      if (i < middlewares.length) {
        await middlewares[i](context, () => dispatch(i + 1))
      }
    }

    await dispatch(0)
  }

  return { use, execute }
}

// 请求中间件示例
interface RequestContext {
  url: string
  method: string
  data?: any
  headers: Record<string, string>
  response?: any
  error?: Error
}

export const useRequestPipeline = () => {
  const pipeline = createPipeline<RequestContext>()

  // 日志中间件
  pipeline.use(async (ctx, next) => {
    console.log(`[Request] ${ctx.method} ${ctx.url}`)
    const start = Date.now()

    await next()

    const duration = Date.now() - start
    console.log(`[Response] ${ctx.method} ${ctx.url} - ${duration}ms`)
  })

  // 认证中间件
  pipeline.use(async (ctx, next) => {
    const token = uni.getStorageSync('token')

    if (token) {
      ctx.headers['Authorization'] = `Bearer ${token}`
    }

    await next()
  })

  // 错误处理中间件
  pipeline.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      ctx.error = e as Error

      // 处理特定错误
      if (e.statusCode === 401) {
        // 跳转登录页
        uni.navigateTo({ url: '/pages/login/index' })
      }

      throw e
    }
  })

  // 实际请求中间件
  pipeline.use(async (ctx, next) => {
    const response = await uni.request({
      url: ctx.url,
      method: ctx.method as any,
      data: ctx.data,
      header: ctx.headers
    })

    ctx.response = response.data

    await next()
  })

  const request = async (config: Partial<RequestContext>): Promise<any> => {
    const context: RequestContext = {
      url: config.url || '',
      method: config.method || 'GET',
      data: config.data,
      headers: config.headers || {}
    }

    await pipeline.execute(context)

    return context.response
  }

  return { request, use: pipeline.use }
}
```

## API 参考

### Composable 规范

#### 命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Composable 函数 | `use` + 功能名称 | `useAuth`, `useRequest`, `useUpload` |
| Props 接口 | `Use` + 功能名称 + `Options` | `UseAuthOptions`, `UseRequestOptions` |
| 返回值接口 | `Use` + 功能名称 + `Return` | `UseAuthReturn`, `UseRequestReturn` |
| Store | `use` + 模块名称 + `Store` | `useUserStore`, `useCartStore` |

#### 返回值规范

标准 Composable 返回值结构:

```typescript
interface StandardReturn {
  // 状态
  loading: Ref<boolean>          // 加载状态
  error: Ref<Error | null>       // 错误信息
  data: Ref<T | null>            // 数据

  // 计算属性
  isEmpty: ComputedRef<boolean>  // 数据是否为空
  isReady: ComputedRef<boolean>  // 是否就绪

  // 方法
  execute: () => Promise<void>   // 执行主操作
  refresh: () => Promise<void>   // 刷新数据
  reset: () => void              // 重置状态
}
```

### 类型定义

#### 基础类型

```typescript
// 响应式类型
import type { Ref, ComputedRef, UnwrapRef } from 'vue'

// 通用响应
interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 分页参数
interface PageParams {
  pageNum: number
  pageSize: number
}

// 分页结果
interface PageResult<T> {
  total: number
  rows: T[]
}

// 树形结构
interface TreeNode<T = any> {
  id: string | number
  parentId?: string | number
  children?: TreeNode<T>[]
  [key: string]: any
}

// 键值对
interface KeyValue<K = string, V = any> {
  key: K
  value: V
  label?: string
}
```

#### Composable 类型

```typescript
// Composable 选项基类
interface BaseOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

// 可取消的操作
interface Cancelable {
  cancel: () => void
  isCanceled: Ref<boolean>
}

// 可重试的操作
interface Retryable {
  retry: () => Promise<void>
  retryCount: Ref<number>
  maxRetries: number
}

// 带缓存的操作
interface Cacheable<T> {
  cached: Ref<T | null>
  cacheKey: string
  clearCache: () => void
  isCacheValid: () => boolean
}
```

### 生命周期钩子

```typescript
// 初始化钩子
const useInit = (callback: () => void | Promise<void>) => {
  onMounted(async () => {
    await callback()
  })
}

// 清理钩子
const useCleanup = (callback: () => void) => {
  onUnmounted(() => {
    callback()
  })
}

// 激活/失活钩子 (配合 keep-alive)
const useActivation = (options: {
  onActivate?: () => void
  onDeactivate?: () => void
}) => {
  onActivated(() => {
    options.onActivate?.()
  })

  onDeactivated(() => {
    options.onDeactivate?.()
  })
}

// 页面生命周期钩子
const usePageLifecycle = (options: {
  onLoad?: (query: Record<string, string>) => void
  onShow?: () => void
  onHide?: () => void
  onUnload?: () => void
  onPullDownRefresh?: () => void
  onReachBottom?: () => void
}) => {
  // UniApp 页面生命周期
  onLoad((query) => {
    options.onLoad?.(query)
  })

  onShow(() => {
    options.onShow?.()
  })

  onHide(() => {
    options.onHide?.()
  })

  onUnload(() => {
    options.onUnload?.()
  })

  onPullDownRefresh(() => {
    options.onPullDownRefresh?.()
  })

  onReachBottom(() => {
    options.onReachBottom?.()
  })
}
```

## 最佳实践

### 1. 遵循单一职责原则

每个 Composable 应该只负责一个功能域:

```typescript
// 正确: 单一职责
export const useAuth = () => {
  // 只处理认证相关逻辑
  const login = async () => { /* ... */ }
  const logout = async () => { /* ... */ }
  const refresh = async () => { /* ... */ }

  return { login, logout, refresh }
}

export const useUser = () => {
  // 只处理用户信息相关逻辑
  const profile = ref<User | null>(null)
  const updateProfile = async () => { /* ... */ }

  return { profile, updateProfile }
}

// 错误: 职责混乱
export const useAuthAndUser = () => {
  // 混合了认证和用户管理
  const login = async () => { /* ... */ }
  const profile = ref<User | null>(null)
  const updateProfile = async () => { /* ... */ }

  return { login, profile, updateProfile }
}
```

### 2. 提供完整的类型定义

```typescript
// 完整的类型定义示例
interface UseFormOptions<T> {
  /** 初始值 */
  initialValues: T
  /** 验证规则 */
  rules?: FormRules<T>
  /** 提交处理函数 */
  onSubmit: (values: T) => Promise<void>
  /** 提交成功回调 */
  onSuccess?: () => void
  /** 提交失败回调 */
  onError?: (error: Error) => void
}

interface UseFormReturn<T> {
  /** 表单值 */
  values: Ref<T>
  /** 错误信息 */
  errors: Ref<Partial<Record<keyof T, string>>>
  /** 是否正在提交 */
  submitting: Ref<boolean>
  /** 是否已修改 */
  isDirty: ComputedRef<boolean>
  /** 是否有效 */
  isValid: ComputedRef<boolean>
  /** 设置字段值 */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  /** 设置错误信息 */
  setFieldError: <K extends keyof T>(field: K, error: string) => void
  /** 重置表单 */
  reset: () => void
  /** 提交表单 */
  submit: () => Promise<void>
  /** 验证表单 */
  validate: () => Promise<boolean>
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> => {
  // 实现
}
```

### 3. 合理使用计算属性

```typescript
export const useCart = () => {
  const items = ref<CartItem[]>([])

  // 使用计算属性派生状态
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  const hasDiscount = computed(() => {
    return items.value.some(item => item.discount > 0)
  })

  return {
    items,
    totalCount,
    totalPrice,
    isEmpty,
    hasDiscount
  }
}
```

### 4. 正确处理异步操作

```typescript
export const useAsync = <T>(
  asyncFn: () => Promise<T>,
  options: { immediate?: boolean } = {}
) => {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await asyncFn()
      data.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      return null
    } finally {
      loading.value = false
    }
  }

  // 防止组件卸载后更新状态
  let isMounted = true

  onMounted(() => {
    isMounted = true
    if (options.immediate) {
      execute()
    }
  })

  onUnmounted(() => {
    isMounted = false
  })

  const safeExecute = async (): Promise<T | null> => {
    const result = await execute()

    if (!isMounted) {
      return null
    }

    return result
  }

  return {
    data,
    loading,
    error,
    execute: safeExecute
  }
}
```

### 5. 实现资源清理

```typescript
export const useTimer = () => {
  const timers: number[] = []
  const intervals: number[] = []

  const setTimeout = (callback: () => void, delay: number): number => {
    const id = window.setTimeout(callback, delay)
    timers.push(id)
    return id
  }

  const setInterval = (callback: () => void, delay: number): number => {
    const id = window.setInterval(callback, delay)
    intervals.push(id)
    return id
  }

  const clearTimeout = (id: number): void => {
    window.clearTimeout(id)
    const index = timers.indexOf(id)
    if (index > -1) {
      timers.splice(index, 1)
    }
  }

  const clearInterval = (id: number): void => {
    window.clearInterval(id)
    const index = intervals.indexOf(id)
    if (index > -1) {
      intervals.splice(index, 1)
    }
  }

  // 组件卸载时清理所有定时器
  onUnmounted(() => {
    timers.forEach(id => window.clearTimeout(id))
    intervals.forEach(id => window.clearInterval(id))
  })

  return {
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval
  }
}
```

## 常见问题

### 1. 响应式丢失问题

**问题描述:**

从 Composable 解构返回值后,响应式丢失。

**问题原因:**

- 直接解构 reactive 对象
- 在返回值中使用原始值而非 ref

**解决方案:**

```typescript
// 错误: 响应式丢失
export const useCounter = () => {
  const state = reactive({ count: 0 })

  return {
    count: state.count,  // 响应式丢失
    increment: () => state.count++
  }
}

// 正确: 保持响应式
export const useCounter = () => {
  const count = ref(0)

  return {
    count,  // 保持响应式
    increment: () => count.value++
  }
}

// 或者使用 toRefs
export const useCounter = () => {
  const state = reactive({ count: 0 })

  return {
    ...toRefs(state),  // 保持响应式
    increment: () => state.count++
  }
}
```

### 2. 内存泄漏问题

**问题描述:**

组件卸载后,事件监听器或定时器未清理,导致内存泄漏。

**解决方案:**

```typescript
export const useEventListener = (
  target: EventTarget,
  event: string,
  handler: EventListener
) => {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  // 确保在卸载时移除监听器
  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}

export const useWebSocket = (url: string) => {
  let ws: WebSocket | null = null

  const connect = (): void => {
    ws = new WebSocket(url)
    ws.onmessage = (event) => {
      // 处理消息
    }
  }

  const disconnect = (): void => {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  onMounted(() => {
    connect()
  })

  // 确保断开连接
  onUnmounted(() => {
    disconnect()
  })

  return { connect, disconnect }
}
```

### 3. 循环依赖问题

**问题描述:**

多个 Composable 相互依赖,导致循环引用错误。

**解决方案:**

```typescript
// 错误: 循环依赖
// useA.ts
import { useB } from './useB'
export const useA = () => {
  const { data } = useB()
  // ...
}

// useB.ts
import { useA } from './useA'
export const useB = () => {
  const { data } = useA()  // 循环依赖!
  // ...
}

// 正确: 提取共享逻辑
// useShared.ts
export const useShared = () => {
  const sharedData = ref(null)
  return { sharedData }
}

// useA.ts
import { useShared } from './useShared'
export const useA = () => {
  const { sharedData } = useShared()
  // ...
}

// useB.ts
import { useShared } from './useShared'
export const useB = () => {
  const { sharedData } = useShared()
  // ...
}
```

### 4. 条件编译代码未生效

**问题描述:**

条件编译代码在某些平台上未按预期执行。

**解决方案:**

```typescript
// 错误: 条件编译语法错误
// #ifdef APP-PLUS || H5  // 错误语法
console.log('App 或 H5')
// #endif

// 正确: 使用正确的条件编译语法
// #ifdef APP-PLUS
console.log('App')
// #endif

// #ifdef H5
console.log('H5')
// #endif

// 或者使用 ifndef
// #ifndef MP
console.log('非小程序平台')
// #endif

// 注意: 条件编译必须独占一行
const doSomething = () => {
  // #ifdef APP-PLUS
  // App 端代码
  plus.nativeUI.toast('Hello')
  // #endif

  // #ifdef H5
  // H5 端代码
  alert('Hello')
  // #endif

  // #ifdef MP-WEIXIN
  // 微信小程序代码
  wx.showToast({ title: 'Hello' })
  // #endif
}
```

### 5. 异步初始化顺序问题

**问题描述:**

多个异步初始化操作顺序不确定,导致依赖数据未就绪。

**解决方案:**

```typescript
export const useApp = () => {
  const isReady = ref(false)
  const error = ref<Error | null>(null)

  // 使用 Promise.all 并行初始化
  const init = async (): Promise<void> => {
    try {
      await Promise.all([
        initAuth(),
        initConfig(),
        initCache()
      ])

      isReady.value = true
    } catch (e) {
      error.value = e as Error
      console.error('应用初始化失败:', e)
    }
  }

  // 使用串行初始化处理依赖关系
  const initWithDependencies = async (): Promise<void> => {
    try {
      // 先初始化配置
      await initConfig()

      // 再初始化认证(依赖配置)
      await initAuth()

      // 最后初始化缓存(依赖认证)
      await initCache()

      isReady.value = true
    } catch (e) {
      error.value = e as Error
    }
  }

  return { isReady, error, init, initWithDependencies }
}

// 在应用入口使用
const { isReady, init } = useApp()

onMounted(async () => {
  await init()

  // 初始化完成后再渲染页面
  if (isReady.value) {
    // 渲染应用
  }
})
```

### 6. Store 状态持久化失败

**问题描述:**

Pinia Store 的状态持久化配置未生效。

**解决方案:**

```typescript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<User | null>(null)

  return {
    token,
    userInfo
  }
}, {
  persist: {
    // 使用 UniApp 存储
    storage: {
      getItem: (key: string) => {
        try {
          return uni.getStorageSync(key)
        } catch (e) {
          console.error('读取存储失败:', e)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          uni.setStorageSync(key, value)
        } catch (e) {
          console.error('写入存储失败:', e)
        }
      }
    },
    // 指定需要持久化的字段
    paths: ['token', 'userInfo'],
    // 自定义序列化
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  }
})
```

### 7. TypeScript 类型推断问题

**问题描述:**

复杂泛型场景下 TypeScript 类型推断失败。

**解决方案:**

```typescript
// 使用显式类型注解
const useGeneric = <T>() => {
  // 显式指定 ref 的泛型类型
  const data = ref<T | null>(null) as Ref<T | null>

  return { data }
}

// 使用类型断言
const useApi = <T>(url: string) => {
  const data = ref<T>() as Ref<T | undefined>

  const fetch = async (): Promise<T> => {
    const response = await uni.request({ url })
    data.value = response.data as T
    return data.value
  }

  return { data, fetch }
}

// 使用 typeof 推断
const initialState = {
  count: 0,
  name: ''
}

const useState = () => {
  const state = ref({ ...initialState })

  type State = typeof initialState

  const update = (newState: Partial<State>): void => {
    state.value = { ...state.value, ...newState }
  }

  return { state, update }
}
```
