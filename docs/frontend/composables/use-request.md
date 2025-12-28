# useRequest 请求管理

HTTP请求管理组合函数，提供数据获取、缓存、重试、轮询等完整的请求处理功能。

## 📋 基础用法

### 简单请求

```vue
<template>
  <div>
    <el-button
      :loading="loading"
      @click="run"
    >
      获取用户信息
    </el-button>

    <div v-if="error" class="error">
      错误: {{ error.message }}
      <el-button @click="run">重试</el-button>
    </div>

    <div v-if="data">
      <h3>用户信息</h3>
      <p>姓名: {{ data.name }}</p>
      <p>邮箱: {{ data.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRequest } from '@/composables/use-request'
import { getUserInfo } from '@/api/system/user'

const {
  data,
  loading,
  error,
  run
} = useRequest(getUserInfo, {
  defaultParams: [1], // 默认参数
  immediate: false // 不立即执行
})
</script>
```

### 带参数的请求

```vue
<template>
  <div>
    <el-form inline>
      <el-form-item label="用户ID">
        <el-input-number v-model="userId" :min="1" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="fetchUser"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="data ? [data] : []"
      empty-text="暂无数据"
    >
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
const userId = ref(1)

const {
  data,
  loading,
  error,
  run: fetchUser
} = useRequest(
  (id: number) => getUserInfo(id),
  {
    manual: true, // 手动触发
    onSuccess: (result) => {
      ElMessage.success('获取成功')
    },
    onError: (err) => {
      ElMessage.error(`获取失败: ${err.message}`)
    }
  }
)

const handleQuery = () => {
  fetchUser(userId.value)
}
</script>
```

## 🎯 核心功能

### useRequest 实现

```typescript
// composables/use-request.ts
import { ref, computed, unref, onUnmounted } from 'vue'

export interface RequestOptions<T = any, P extends any[] = any[]> {
  // 基础配置
  immediate?: boolean // 是否立即执行
  manual?: boolean // 是否手动执行
  defaultParams?: P // 默认参数

  // 缓存配置
  cacheKey?: string // 缓存键
  cacheTime?: number // 缓存时间(ms)
  staleTime?: number // 数据过期时间(ms)
  getCacheKey?: (...params: P) => string // 动态缓存键

  // 重试配置
  retryCount?: number // 重试次数
  retryDelay?: number // 重试延迟(ms)
  retryCondition?: (error: any) => boolean // 重试条件

  // 轮询配置
  pollingInterval?: number // 轮询间隔(ms)
  pollingWhenHidden?: boolean // 隐藏时是否轮询
  pollingWhenOffline?: boolean // 离线时是否轮询

  // 节流防抖
  debounceWait?: number // 防抖延迟(ms)
  throttleWait?: number // 节流延迟(ms)

  // 回调函数
  onBefore?: (params: P) => void
  onSuccess?: (data: T, params: P) => void
  onError?: (error: any, params: P) => void
  onFinally?: (data?: T, error?: any, params?: P) => void

  // 数据处理
  transform?: (data: any) => T // 数据转换
  errorTransform?: (error: any) => any // 错误转换

  // 其他配置
  loadingDelay?: number // 加载状态延迟显示(ms)
  refreshOnWindowFocus?: boolean // 窗口聚焦时刷新
  refreshOnReconnect?: boolean // 网络重连时刷新
}

interface RequestState<T> {
  data: T | undefined
  loading: boolean
  error: any
  params: any[]
}

export function useRequest<T = any, P extends any[] = any[]>(
  service: (...args: P) => Promise<T>,
  options: RequestOptions<T, P> = {}
) {
  const {
    immediate = true,
    manual = false,
    defaultParams = [] as unknown as P,
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    staleTime = 0,
    retryCount = 0,
    retryDelay = 1000,
    retryCondition = () => true,
    pollingInterval,
    pollingWhenHidden = false,
    pollingWhenOffline = false,
    debounceWait,
    throttleWait,
    loadingDelay = 0,
    refreshOnWindowFocus = false,
    refreshOnReconnect = false,
    onBefore,
    onSuccess,
    onError,
    onFinally,
    transform,
    errorTransform,
    getCacheKey
  } = options

  // 状态管理
  const state = reactive<RequestState<T>>({
    data: undefined,
    loading: false,
    error: undefined,
    params: []
  })

  // 计算属性
  const data = computed(() => state.data)
  const loading = computed(() => state.loading)
  const error = computed(() => state.error)

  // 请求控制
  let requestId = 0
  let pollingTimer: number | null = null
  let loadingTimer: number | null = null
  let retryTimer: number | null = null

  // 缓存管理
  const cache = new Map<string, { data: T; timestamp: number }>()

  /**
   * 获取缓存键
   */
  const getRequestCacheKey = (params: P): string => {
    if (getCacheKey) {
      return getCacheKey(...params)
    }
    if (cacheKey) {
      return `${cacheKey}_${JSON.stringify(params)}`
    }
    return ''
  }

  /**
   * 获取缓存数据
   */
  const getCacheData = (key: string) => {
    const cached = cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > cacheTime
    if (isExpired) {
      cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * 设置缓存数据
   */
  const setCacheData = (key: string, data: T) => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清除加载状态定时器
   */
  const clearLoadingTimer = () => {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
  }

  /**
   * 设置加载状态
   */
  const setLoading = (loading: boolean) => {
    if (loading) {
      if (loadingDelay > 0) {
        loadingTimer = setTimeout(() => {
          state.loading = true
          loadingTimer = null
        }, loadingDelay)
      } else {
        state.loading = true
      }
    } else {
      clearLoadingTimer()
      state.loading = false
    }
  }

  /**
   * 执行请求
   */
  const runAsync = async (...params: P): Promise<T> => {
    const currentRequestId = ++requestId
    state.params = params
    state.error = undefined

    // 检查缓存
    const cacheKeyStr = getRequestCacheKey(params)
    if (cacheKeyStr) {
      const cachedData = getCacheData(cacheKeyStr)
      if (cachedData && Date.now() - cache.get(cacheKeyStr)!.timestamp < staleTime) {
        state.data = cachedData
        return cachedData
      }
    }

    // 前置回调
    onBefore?.(params)

    setLoading(true)

    try {
      let result = await service(...params)

      // 检查请求是否已被取消
      if (currentRequestId !== requestId) {
        throw new Error('Request cancelled')
      }

      // 数据转换
      if (transform) {
        result = transform(result)
      }

      state.data = result
      state.error = undefined

      // 设置缓存
      if (cacheKeyStr) {
        setCacheData(cacheKeyStr, result)
      }

      // 成功回调
      onSuccess?.(result, params)

      return result
    } catch (error) {
      // 检查请求是否已被取消
      if (currentRequestId !== requestId) {
        throw error
      }

      let processedError = error
      if (errorTransform) {
        processedError = errorTransform(error)
      }

      state.error = processedError

      // 错误回调
      onError?.(processedError, params)

      throw processedError
    } finally {
      if (currentRequestId === requestId) {
        setLoading(false)
        onFinally?.(state.data, state.error, params)
      }
    }
  }

  /**
   * 执行请求（带重试）
   */
  const runWithRetry = async (...params: P): Promise<T> => {
    let lastError: any
    let attempts = 0

    while (attempts <= retryCount) {
      try {
        const result = await runAsync(...params)
        return result
      } catch (error) {
        lastError = error
        attempts++

        if (attempts <= retryCount && retryCondition(error)) {
          await new Promise(resolve => {
            retryTimer = setTimeout(resolve, retryDelay * attempts)
          })
        } else {
          throw error
        }
      }
    }

    throw lastError
  }

  /**
   * 防抖执行
   */
  const debouncedRun = debounceWait
    ? debounce(runWithRetry, debounceWait)
    : runWithRetry

  /**
   * 节流执行
   */
  const throttledRun = throttleWait
    ? throttle(debouncedRun, throttleWait)
    : debouncedRun

  /**
   * 最终执行函数
   */
  const run = (...params: P) => {
    return throttledRun(...params).catch(() => {
      // 错误已在 runAsync 中处理，这里不需要再次处理
    })
  }

  /**
   * 刷新（使用上次参数）
   */
  const refresh = () => {
    return run(...(state.params as P))
  }

  /**
   * 取消请求
   */
  const cancel = () => {
    requestId++
    setLoading(false)
    clearPolling()
    clearTimers()
  }

  /**
   * 变更数据
   */
  const mutate = (data: T | ((oldData?: T) => T)) => {
    if (typeof data === 'function') {
      state.data = (data as Function)(state.data)
    } else {
      state.data = data
    }
  }

  /**
   * 开始轮询
   */
  const startPolling = () => {
    if (!pollingInterval) return

    clearPolling()

    const poll = () => {
      // 检查轮询条件
      if (!pollingWhenHidden && document.hidden) {
        return
      }

      if (!pollingWhenOffline && !navigator.onLine) {
        return
      }

      refresh()
    }

    pollingTimer = setInterval(poll, pollingInterval)
  }

  /**
   * 停止轮询
   */
  const clearPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  /**
   * 清除所有定时器
   */
  const clearTimers = () => {
    clearLoadingTimer()
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  }

  // 窗口聚焦时刷新
  if (refreshOnWindowFocus) {
    const handleFocus = () => {
      if (!state.loading && state.data !== undefined) {
        refresh()
      }
    }
    window.addEventListener('focus', handleFocus)
    onUnmounted(() => {
      window.removeEventListener('focus', handleFocus)
    })
  }

  // 网络重连时刷新
  if (refreshOnReconnect) {
    const handleOnline = () => {
      if (!state.loading && state.data !== undefined) {
        refresh()
      }
    }
    window.addEventListener('online', handleOnline)
    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
    })
  }

  // 自动执行
  if (!manual && immediate) {
    run(...defaultParams)
  }

  // 自动轮询
  if (pollingInterval) {
    startPolling()
  }

  // 清理
  onUnmounted(() => {
    cancel()
  })

  return {
    // 状态
    data,
    loading,
    error,
    params: computed(() => state.params),

    // 方法
    run,
    runAsync,
    refresh,
    cancel,
    mutate,

    // 轮询控制
    startPolling,
    clearPolling
  }
}

// 工具函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: number | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(async () => {
        try {
          const result = await func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, wait)
    })
  }
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let lastTime = 0

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      return func(...args)
    }
  }) as T
}
```

## 🔄 高级功能

### 分页请求

```typescript
// composables/use-pagination.ts
export interface PaginationConfig {
  defaultCurrent?: number
  defaultPageSize?: number
  total?: number
  showSizeChanger?: boolean
  pageSizeOptions?: number[]
}

export function usePagination<T>(
  service: (params: { current: number; pageSize: number; [key: string]: any }) => Promise<{
    data: T[]
    total: number
  }>,
  config: PaginationConfig = {}
) {
  const {
    defaultCurrent = 1,
    defaultPageSize = 10,
    showSizeChanger = true,
    pageSizeOptions = [10, 20, 50, 100]
  } = config

  const pagination = reactive({
    current: defaultCurrent,
    pageSize: defaultPageSize,
    total: 0
  })

  const {
    data: rawData,
    loading,
    error,
    run,
    refresh
  } = useRequest(
    async (params: any = {}) => {
      const result = await service({
        current: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      })

      pagination.total = result.total
      return result.data
    },
    {
      immediate: true
    }
  )

  const data = computed(() => rawData.value || [])

  // 切换页码
  const changeCurrent = (current: number) => {
    pagination.current = current
    run()
  }

  // 切换每页条数
  const changePageSize = (pageSize: number) => {
    pagination.current = 1
    pagination.pageSize = pageSize
    run()
  }

  // 重置分页
  const resetPagination = () => {
    pagination.current = defaultCurrent
    pagination.pageSize = defaultPageSize
    pagination.total = 0
  }

  return {
    data,
    loading,
    error,
    pagination: readonly(pagination),
    run,
    refresh,
    changeCurrent,
    changePageSize,
    resetPagination,
    pageSizeOptions
  }
}
```

### 无限滚动

```typescript
// composables/use-infinite-scroll.ts
export function useInfiniteScroll<T>(
  service: (params: { page: number; pageSize: number; [key: string]: any }) => Promise<{
    data: T[]
    hasMore: boolean
  }>,
  options: {
    pageSize?: number
    threshold?: number
    immediate?: boolean
  } = {}
) {
  const { pageSize = 20, threshold = 100, immediate = true } = options

  const page = ref(1)
  const hasMore = ref(true)
  const allData = ref<T[]>([])

  const {
    loading,
    error,
    run: loadMore
  } = useRequest(
    async (params: any = {}) => {
      const result = await service({
        page: page.value,
        pageSize,
        ...params
      })

      if (page.value === 1) {
        allData.value = result.data
      } else {
        allData.value.push(...result.data)
      }

      hasMore.value = result.hasMore
      if (result.hasMore) {
        page.value++
      }

      return result
    },
    {
      immediate
    }
  )

  // 重置数据
  const reset = () => {
    page.value = 1
    hasMore.value = true
    allData.value = []
  }

  // 刷新数据
  const refresh = () => {
    reset()
    loadMore()
  }

  // 滚动监听
  const setupScrollListener = (container?: HTMLElement) => {
    const element = container || window

    const handleScroll = () => {
      if (loading.value || !hasMore.value) return

      const scrollTop = element === window
        ? document.documentElement.scrollTop || document.body.scrollTop
        : (element as HTMLElement).scrollTop

      const scrollHeight = element === window
        ? document.documentElement.scrollHeight || document.body.scrollHeight
        : (element as HTMLElement).scrollHeight

      const clientHeight = element === window
        ? window.innerHeight
        : (element as HTMLElement).clientHeight

      if (scrollHeight - scrollTop - clientHeight <= threshold) {
        loadMore()
      }
    }

    element.addEventListener('scroll', handleScroll)

    onUnmounted(() => {
      element.removeEventListener('scroll', handleScroll)
    })
  }

  return {
    data: computed(() => allData.value),
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refresh,
    setupScrollListener
  }
}
```

### 乐观更新

```typescript
// composables/use-optimistic.ts
export function useOptimistic<T>(
  queryKey: string,
  mutationFn: (variables: any) => Promise<T>
) {
  const queryCache = new Map<string, T>()

  const {
    data,
    loading,
    error,
    run: mutate
  } = useRequest(mutationFn, {
    manual: true,
    onBefore: (variables) => {
      // 保存当前数据作为回滚点
      const currentData = queryCache.get(queryKey)
      if (currentData) {
        queryCache.set(`${queryKey}_rollback`, currentData)
      }
    },
    onError: () => {
      // 出错时回滚数据
      const rollbackData = queryCache.get(`${queryKey}_rollback`)
      if (rollbackData) {
        queryCache.set(queryKey, rollbackData)
        queryCache.delete(`${queryKey}_rollback`)
      }
    },
    onSuccess: (result) => {
      // 成功时更新缓存
      queryCache.set(queryKey, result)
      queryCache.delete(`${queryKey}_rollback`)
    }
  })

  // 乐观更新
  const optimisticUpdate = (updater: (oldData?: T) => T, variables: any) => {
    const oldData = queryCache.get(queryKey)
    const optimisticData = updater(oldData)

    // 立即更新 UI
    queryCache.set(queryKey, optimisticData)

    // 执行实际请求
    mutate(variables)
  }

  return {
    data,
    loading,
    error,
    mutate,
    optimisticUpdate
  }
}
```

## 📊 请求状态管理

### 全局请求状态

```typescript
// composables/use-global-loading.ts
export function useGlobalLoading() {
  const loadingRequests = ref(new Set<string>())

  const loading = computed(() => loadingRequests.value.size > 0)

  const addLoading = (key: string) => {
    loadingRequests.value.add(key)
  }

  const removeLoading = (key: string) => {
    loadingRequests.value.delete(key)
  }

  const clearLoading = () => {
    loadingRequests.value.clear()
  }

  return {
    loading,
    addLoading,
    removeLoading,
    clearLoading
  }
}

// 带全局加载状态的请求
export function useRequestWithGlobalLoading<T, P extends any[]>(
  service: (...args: P) => Promise<T>,
  options: RequestOptions<T, P> & { loadingKey?: string } = {}
) {
  const { loadingKey = 'default', ...requestOptions } = options
  const { addLoading, removeLoading } = useGlobalLoading()

  return useRequest(service, {
    ...requestOptions,
    onBefore: (params) => {
      addLoading(loadingKey)
      options.onBefore?.(params)
    },
    onFinally: (data, error, params) => {
      removeLoading(loadingKey)
      options.onFinally?.(data, error, params)
    }
  })
}
```

### 请求队列管理

```typescript
// composables/use-request-queue.ts
export class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running: Set<Promise<any>> = new Set()
  private maxConcurrent: number

  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent
  }

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.running.size >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const requestFn = this.queue.shift()!
    const promise = requestFn()

    this.running.add(promise)

    try {
      await promise
    } finally {
      this.running.delete(promise)
      this.processQueue()
    }
  }

  clear() {
    this.queue.length = 0
  }

  get pending() {
    return this.queue.length
  }

  get active() {
    return this.running.size
  }
}

export function useRequestQueue(maxConcurrent = 6) {
  const queue = new RequestQueue(maxConcurrent)

  const addRequest = <T>(requestFn: () => Promise<T>): Promise<T> => {
    return queue.add(requestFn)
  }

  return {
    addRequest,
    pending: computed(() => queue.pending),
    active: computed(() => queue.active),
    clear: () => queue.clear()
  }
}
```

useRequest组合函数为Vue3应用提供了完整的HTTP请求管理解决方案，支持缓存、重试、轮询、分页、无限滚动等各种复杂场景。

## ❓ 常见问题

### 1. 组件卸载后请求仍在执行导致警告

**问题描述：** 组件卸载后，异步请求返回时尝试更新状态，控制台出现 "Cannot update a component that was unmounted" 警告。

**问题原因：**
- 请求发出后，用户快速切换页面导致组件卸载
- 请求完成时组件已不存在，但回调仍尝试更新响应式状态

**解决方案：**

```typescript
// ✅ useRequest 内部已处理：通过 requestId 机制取消过期请求
const { data, loading, run } = useRequest(fetchData, {
  // 组件卸载时自动取消请求
  // onUnmounted 中会调用 cancel() 方法
})

// ✅ 手动处理：在组件卸载前主动取消
const { cancel } = useRequest(fetchData)

onBeforeUnmount(() => {
  cancel() // 取消所有进行中的请求
})

// ✅ 使用 immediate: false 避免组件初始化时的竞态
const { run } = useRequest(fetchData, {
  immediate: false,
  manual: true
})

onMounted(() => {
  // 确保组件已挂载后再发起请求
  run()
})
```

### 2. 缓存数据不更新

**问题描述：** 设置了 `cacheKey` 后，即使数据已变化，页面仍显示旧的缓存数据。

**问题原因：**
- `staleTime` 设置过长，数据在过期时间内不会重新请求
- `cacheTime` 设置过长，缓存数据长时间有效
- 未正确配置动态缓存键，导致不同参数共用同一缓存

**解决方案：**

```typescript
// ✅ 合理配置缓存时间
const { data, refresh } = useRequest(fetchUserList, {
  cacheKey: 'userList',
  cacheTime: 5 * 60 * 1000,  // 缓存5分钟
  staleTime: 30 * 1000,      // 30秒后视为过期，会重新请求
})

// ✅ 使用动态缓存键区分不同参数
const { data } = useRequest(
  (id: number) => fetchUser(id),
  {
    getCacheKey: (id) => `user_${id}`, // 每个用户ID独立缓存
    cacheTime: 60 * 1000,
  }
)

// ✅ 手动刷新强制更新数据
const handleRefresh = () => {
  refresh() // 忽略缓存，强制重新请求
}

// ✅ 数据变更后清除相关缓存
const { mutate } = useRequest(fetchData, { cacheKey: 'myData' })
// 更新数据后手动设置新值
mutate(newData)
```

### 3. 轮询请求在页面隐藏时仍在执行

**问题描述：** 设置了 `pollingInterval` 后，即使用户切换到其他标签页，请求仍在持续发送，浪费资源。

**问题原因：**
- 默认情况下轮询不会检测页面可见性
- 未配置 `pollingWhenHidden: false`

**解决方案：**

```typescript
// ✅ 配置页面隐藏时停止轮询
const { data, startPolling, clearPolling } = useRequest(fetchStatus, {
  pollingInterval: 5000,       // 5秒轮询一次
  pollingWhenHidden: false,    // 页面隐藏时停止轮询
  pollingWhenOffline: false,   // 网络断开时停止轮询
})

// ✅ 手动控制轮询开关
const isPolling = ref(true)

watch(isPolling, (val) => {
  if (val) {
    startPolling()
  } else {
    clearPolling()
  }
})

// ✅ 结合页面生命周期控制
onActivated(() => {
  startPolling() // 页面激活时开始轮询
})

onDeactivated(() => {
  clearPolling() // 页面失活时停止轮询
})
```