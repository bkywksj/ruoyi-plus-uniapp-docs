# 移动端性能优化最佳实践

## 概述

移动端性能优化是提升用户体验的关键因素。RuoYi-Plus-UniApp 项目实现了全方位的性能优化策略,涵盖数据缓存、请求优化、渲染优化、内存管理、包体积优化等多个维度,确保应用在各种设备和网络环境下都能流畅运行。

**核心价值:**

- **快速启动** - 应用启动时间控制在2秒以内
- **流畅交互** - 页面切换和滚动保持60FPS
- **低内存占用** - 内存使用优化,防止内存泄漏
- **小包体积** - 代码分割和按需加载,减少首屏加载时间
- **离线可用** - 智能缓存策略,支持离线访问
- **跨平台优化** - 针对iOS、Android、微信小程序等平台的专项优化

**性能指标:**

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首屏加载时间 | < 2s | 从打开到内容可见 |
| 页面切换时间 | < 300ms | Tab切换响应时间 |
| 列表滚动FPS | ≥ 55 | 保持流畅滚动 |
| 内存占用 | < 150MB | iOS/Android双平台 |
| 包体积 | < 5MB | 主包大小 |
| API响应时间 | < 1s | 90%请求响应时间 |

**优化架构:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      移动端性能优化架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  应用层优化:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  组件懒加载 → Tab按需渲染 → 虚拟滚动 → 图片懒加载          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  请求层优化:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  请求防抖 → 并发控制 → 重复请求拦截 → 请求重试机制         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  数据层优化:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  自动过期缓存 → 数据预加载 → 增量更新 → 离线存储           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  构建层优化:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  代码分割 → Tree Shaking → 压缩混淆 → 按需加载             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  平台层优化:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  iOS优化 → Android优化 → 小程序优化 → H5优化              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 数据缓存优化

### 1. 智能缓存系统

系统实现了一套完整的缓存管理机制,支持自动过期、类型安全和统计分析。

#### 缓存接口设计

```typescript
interface CacheWrapper<T> {
  value: T
  expireTime?: number  // 过期时间戳
}

// 核心缓存API
cache.set(key, value, expireSeconds?)  // 设置缓存,可选过期时间
cache.get<T>(key)                      // 类型安全的获取
cache.has(key)                         // 检查是否存在
cache.remove(key)                      // 删除指定缓存
cache.clearAll()                       // 清空所有缓存
cache.cleanup()                        // 清理过期缓存
cache.getStats()                       // 获取缓存统计信息
```

#### 使用示例

**基础用法:**

```typescript
// 设置永久缓存
cache.set('user_id', '123456')

// 设置7天过期的缓存
cache.set('token', 'eyJhbGc...', 7 * 24 * 60 * 60)

// 获取缓存(类型安全)
const token = cache.get<string>('token')
const userId = cache.get<string>('user_id')

// 检查缓存是否存在
if (cache.has('token')) {
  console.log('Token exists')
}
```

**应用场景:**

```typescript
// Token管理
const TOKEN_KEY = 'app_token'
const TOKEN_EXPIRE = 7 * 24 * 60 * 60  // 7天

export function setToken(token: string) {
  cache.set(TOKEN_KEY, token, TOKEN_EXPIRE)
}

export function getToken(): string | null {
  return cache.get<string>(TOKEN_KEY)
}

export function removeToken() {
  cache.remove(TOKEN_KEY)
}

// 租户ID缓存
const TENANT_ID_KEY = 'tenant_id'

export function setTenantId(tenantId: string) {
  cache.set(TENANT_ID_KEY, tenantId)  // 永久缓存
}

export function getTenantId(): string | null {
  return cache.get<string>(TENANT_ID_KEY)
}

// 模板配置缓存(5分钟过期)
const TEMPLATE_CONFIG_KEY = 'template_config'
const TEMPLATE_EXPIRE = 5 * 60

export function setTemplateConfig(config: TemplateConfig) {
  cache.set(TEMPLATE_CONFIG_KEY, config, TEMPLATE_EXPIRE)
}

export function getTemplateConfig(): TemplateConfig | null {
  return cache.get<TemplateConfig>(TEMPLATE_CONFIG_KEY)
}
```

### 2. 自动清理机制

系统实现了自动清理过期缓存的机制,无需手动管理。

#### 清理策略

```typescript
// 每10分钟自动清理一次过期缓存
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000)

// 应用启动时清理
onLaunch(() => {
  cache.cleanup()
})

// 应用进入后台时清理
onHide(() => {
  cache.cleanup()
})
```

#### 手动清理

```typescript
// 清理过期缓存
cache.cleanup()

// 清空所有应用缓存(保留其他应用数据)
cache.clearAll()

// 获取缓存统计
const stats = cache.getStats()
console.log(`总大小: ${stats.size} bytes`)
console.log(`使用率: ${stats.percentage}%`)
console.log(`缓存项: ${stats.count}`)
```

### 3. 缓存统计分析

```typescript
interface CacheStats {
  size: number        // 总大小(bytes)
  maxSize: number     // 最大容量
  percentage: number  // 使用率(%)
  count: number       // 缓存项数量
}

// 监控缓存使用情况
function monitorCache() {
  const stats = cache.getStats()

  if (stats.percentage > 80) {
    console.warn('缓存使用率超过80%,建议清理')
    cache.cleanup()
  }

  if (stats.size > 5 * 1024 * 1024) {  // 5MB
    console.warn('缓存总大小超过5MB')
  }
}

// 定期监控
setInterval(monitorCache, 60 * 1000)  // 每分钟检查一次
```

---

## 请求优化

### 1. 防抖与节流

系统提供了完整的防抖和节流实现,用于优化高频事件处理。

#### 防抖(Debounce)

防抖确保函数在停止触发后的指定时间后执行一次。

```typescript
// 基础用法
const debouncedSearch = debounce((keyword: string) => {
  searchApi(keyword)
}, 500)

// 支持立即执行
const debouncedSubmit = debounce((data) => {
  submitForm(data)
}, 300, { immediate: true })  // 首次立即执行

// 可取消的防抖
const debouncedFn = debounce(() => {
  console.log('Executed')
}, 1000)

// 取消待执行的函数
debouncedFn.cancel()
```

**应用场景:**

```vue
<template>
  <view>
    <!-- 搜索输入防抖 -->
    <input
      v-model="searchKeyword"
      @input="handleSearch"
      placeholder="搜索..."
    />

    <!-- 表单验证防抖 -->
    <input
      v-model="form.email"
      @input="validateEmail"
      placeholder="邮箱"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { debounce } from '@/utils/function'

const searchKeyword = ref('')

// 搜索防抖(500ms)
const handleSearch = debounce((event: any) => {
  const keyword = event.detail.value
  if (keyword) {
    searchApi(keyword)
  }
}, 500)

// 邮箱验证防抖(300ms)
const validateEmail = debounce((event: any) => {
  const email = event.detail.value
  if (email) {
    checkEmailExists(email)
  }
}, 300)
</script>
```

#### 节流(Throttle)

节流确保函数在指定时间间隔内最多执行一次。

```typescript
// 基础用法
const throttledScroll = throttle((event) => {
  handleScroll(event)
}, 100)

// 配置leading和trailing
const throttledFn = throttle(
  () => console.log('Throttled'),
  1000,
  {
    leading: true,   // 首次触发立即执行
    trailing: false  // 最后一次触发不执行
  }
)

// 可取消的节流
const throttledApi = throttle(() => {
  fetchData()
}, 2000)

throttledApi.cancel()  // 取消节流
```

**应用场景:**

```vue
<template>
  <scroll-view
    class="scroll-container"
    @scroll="handleScroll"
    scroll-y
  >
    <!-- 内容 -->
  </scroll-view>
</template>

<script lang="ts" setup>
import { throttle } from '@/utils/function'

// 滚动事件节流(100ms)
const handleScroll = throttle((event: any) => {
  const scrollTop = event.detail.scrollTop

  // 更新滚动位置
  updateScrollPosition(scrollTop)

  // 显示/隐藏回到顶部按钮
  showBackTop.value = scrollTop > 300
}, 100)

// 轮询API节流(3秒)
const pollData = throttle(() => {
  fetchLatestData()
}, 3000, { leading: true })

// 开始轮询
setInterval(pollData, 1000)  // 实际每3秒执行一次
</script>
```

### 2. 请求并发控制

#### 重复请求拦截

系统自动拦截500ms内的重复提交请求。

```typescript
// 自动实现的防重复提交
const { post } = useHttp()

// 连续点击只会发送一次
const handleSubmit = async () => {
  await post('/api/user/save', formData)
  // 500ms内再次点击会被自动忽略
}
```

**原理:**

```typescript
// 内部实现
let lastSubmitTime = 0
const SUBMIT_INTERVAL = 500

function checkDuplicateSubmit(): boolean {
  const now = Date.now()
  if (now - lastSubmitTime < SUBMIT_INTERVAL) {
    return true  // 重复提交
  }
  lastSubmitTime = now
  return false
}
```

#### 请求ID追踪

每个请求自动分配唯一ID,便于追踪和调试。

```typescript
// 自动生成的请求ID格式: yyyyMMddHHmmssSSS
// 例如: 20250124143025123

// 请求头自动包含
headers: {
  'X-Request-Id': '20250124143025123'
}

// 用于日志追踪
console.log(`[${requestId}] 请求开始`)
console.log(`[${requestId}] 请求完成`)
```

### 3. 请求重试机制

系统提供了完善的请求重试功能,支持指数退避策略。

```typescript
import { retry } from '@/utils/function'

// 基础重试
const fetchData = retry(
  async () => {
    const response = await http.get('/api/data')
    return response.data
  },
  {
    times: 3,          // 重试3次
    delay: 1000        // 每次延迟1秒
  }
)

// 指数退避重试
const fetchWithBackoff = retry(
  async () => {
    return await http.get('/api/important')
  },
  {
    times: 5,
    delay: 1000,
    exponential: true  // 1s, 2s, 4s, 8s, 16s
  }
)

// 条件重试(仅特定错误重试)
const conditionalRetry = retry(
  async () => {
    return await http.post('/api/submit', data)
  },
  {
    times: 3,
    delay: 2000,
    shouldRetry: (error) => {
      // 仅网络错误重试,业务错误不重试
      return error.code === 'NETWORK_ERROR'
    }
  }
)
```

**应用场景:**

```typescript
// 关键数据获取
const loadUserProfile = retry(
  async () => {
    const res = await http.get('/api/user/profile')
    return res.data
  },
  { times: 3, delay: 1000 }
)

// 文件上传
const uploadFile = retry(
  async (file) => {
    return await http.upload('/api/file/upload', file)
  },
  {
    times: 3,
    delay: 2000,
    exponential: true,
    shouldRetry: (error) => {
      // 只重试网络错误和超时
      return ['NETWORK_ERROR', 'TIMEOUT'].includes(error.code)
    }
  }
)
```

### 4. 超时控制

```typescript
import { withTimeout } from '@/utils/function'

// 为异步函数添加超时控制
const fetchWithTimeout = withTimeout(
  async () => {
    return await http.get('/api/slow-endpoint')
  },
  5000  // 5秒超时
)

try {
  const data = await fetchWithTimeout()
  console.log('Success:', data)
} catch (error) {
  if (error.message === 'Timeout') {
    console.error('请求超时')
  }
}

// 结合重试使用
const robustFetch = retry(
  withTimeout(
    async () => await http.get('/api/data'),
    3000  // 每次尝试3秒超时
  ),
  { times: 3, delay: 1000 }
)
```

---

## 渲染优化

### 1. 组件懒加载

系统使用智能的Tab懒加载策略,只在需要时才加载组件。

#### 基础实现

```vue
<template>
  <view class="tabbar-container">
    <!-- 使用v-if实现懒加载 -->
    <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
    <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
    <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import Home from './components/Home.vue'
import Menu from './components/Menu.vue'
import My from './components/My.vue'

const currentTab = ref(0)

const tabs = reactive([
  { loaded: true },   // 首屏加载Home
  { loaded: false },  // Menu未加载
  { loaded: false }   // My未加载
])

// Tab切换时触发加载
const handleTabChange = (index: number) => {
  // 标记为已加载
  if (!tabs[index].loaded) {
    tabs[index].loaded = true
  }

  currentTab.value = index
}
</script>
```

**优化效果:**

- 首屏渲染时间减少 40%
- 内存占用减少 30%
- 页面切换流畅度提升

#### 平台适配

```vue
<template>
  <!-- Alipay: 使用v-if(平台限制) -->
  <template v-if="isAlipay">
    <Home v-if="currentTab === 0" />
    <Menu v-if="currentTab === 1" />
    <My v-if="currentTab === 2" />
  </template>

  <!-- 其他平台: 使用v-show(性能更好) -->
  <template v-else>
    <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
    <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
    <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
  </template>
</template>

<script lang="ts" setup>
import { isMpAlipay } from '@/utils/platform'

const isAlipay = isMpAlipay
</script>
```

### 2. 虚拟滚动

系统实现了全局的滚动状态管理,优化长列表性能。

#### 滚动状态管理

```typescript
// 单例模式,全局共享滚动状态
const scrollState = {
  scrollTopValue: ref(0),        // 当前滚动位置
  scrollViewId: 'scroll-view-1'  // scroll-view唯一ID
}

// API方法
useScroll().getScrollTop()              // 获取当前位置
useScroll().updateScrollTop(value)      // 更新位置
useScroll().resetScrollTop()            // 重置到顶部
useScroll().isScrolled(threshold)       // 是否已滚动
useScroll().shouldShowBacktop(top)      // 是否显示回到顶部
useScroll().getScrollProgress(max)      // 获取滚动进度(0-100)
```

#### Scroll-View模式

```vue
<template>
  <scroll-view
    :id="scrollViewId"
    class="scroll-container"
    :scroll-top="scrollTopValue"
    scroll-y
    @scroll="handleScroll"
  >
    <view v-for="item in items" :key="item.id">
      {{ item.name }}
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

// 创建scroll-view处理器
const { scrollTopValue, scrollViewId, handleScroll } =
  useScroll().createScrollViewHandler()
</script>
```

#### 页面滚动模式

```vue
<template>
  <view class="page">
    <view v-for="item in items" :key="item.id">
      {{ item.name }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll } from '@dcloudio/uni-app'

// 创建页面滚动处理器
const { handlePageScroll } = useScroll().createPageScrollHandler()

// 自动注册页面滚动监听
onPageScroll(handlePageScroll)
</script>
```

#### 回到顶部

```vue
<template>
  <view class="page">
    <!-- 内容 -->
    <view v-for="item in items" :key="item.id">
      {{ item.name }}
    </view>

    <!-- 回到顶部按钮 -->
    <view
      v-show="showBackTop"
      class="back-top"
      @click="scrollToTop"
    >
      ↑
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useScroll } from '@/composables/useScroll'

const showBackTop = ref(false)

const { handlePageScroll } = useScroll().createPageScrollHandler()

// 监听滚动显示按钮
onPageScroll((event: any) => {
  handlePageScroll(event)
  showBackTop.value = useScroll().shouldShowBacktop(300)
})

// 点击回到顶部
const scrollToTop = () => {
  // 自动使用uni.pageScrollTo
  useScroll().resetScrollTop()
}
</script>
```

### 3. 列表优化

#### 分页加载

```vue
<template>
  <scroll-view
    class="list"
    scroll-y
    @scrolltolower="loadMore"
  >
    <view v-for="item in list" :key="item.id">
      {{ item.name }}
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">加载中...</view>
    <view class="no-more" v-if="noMore">没有更多了</view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list = ref<any[]>([])
const loading = ref(false)
const noMore = ref(false)
const pageNum = ref(1)
const pageSize = 20

// 加载更多
const loadMore = async () => {
  if (loading.value || noMore.value) return

  loading.value = true

  try {
    const res = await http.get('/api/list', {
      params: { pageNum: pageNum.value, pageSize }
    })

    if (res.data.rows.length < pageSize) {
      noMore.value = true
    }

    list.value.push(...res.data.rows)
    pageNum.value++
  } finally {
    loading.value = false
  }
}

// 初始加载
loadMore()
</script>
```

#### 图片懒加载

```vue
<template>
  <view class="image-list">
    <image
      v-for="item in images"
      :key="item.id"
      :src="item.url"
      :lazy-load="true"
      mode="aspectFill"
      class="image-item"
    />
  </view>
</template>

<script lang="ts" setup>
// lazy-load属性自动实现懒加载
// 图片进入可视区域时才开始加载
</script>
```

---

## 包体积优化

### 1. 代码分割

系统使用 Vite 的代码分割特性,自动优化包体积。

#### 基础配置

```typescript
// vite.config.ts
import Optimization from '@uni-ku/bundle-optimizer'

export default defineConfig({
  plugins: [
    Optimization({
      enable: {
        optimization: true,          // 自动代码分割
        'async-import': true,        // 跨包异步导入
        'async-component': true,     // 异步组件加载
      },
    })
  ]
})
```

#### 手动代码分割

```typescript
// 动态导入
const UserProfile = () => import('@/components/UserProfile.vue')
const OrderHistory = () => import('@/components/OrderHistory.vue')

// 路由懒加载
const routes = [
  {
    path: '/profile',
    component: () => import('@/pages/profile/index.vue')
  },
  {
    path: '/orders',
    component: () => import('@/pages/orders/index.vue')
  }
]
```

### 2. Tree Shaking

```typescript
// 使用ES6模块导入(支持Tree Shaking)
import { debounce, throttle } from '@/utils/function'  // ✅ 只导入需要的

// 避免整体导入
import * as utils from '@/utils/function'  // ❌ 导入全部
```

### 3. 依赖预构建

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: [
      'jsencrypt/bin/jsencrypt.min.js',
      'crypto-js'
    ]
  }
})
```

### 4. 生产构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es6',
    minify: 'esbuild',           // 使用esbuild压缩
    sourcemap: false,            // 生产环境关闭sourcemap
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'utils': ['@/utils/index']
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger']  // 移除console和debugger
  }
})
```

---

## 内存管理

### 1. 生命周期清理

正确的资源清理是防止内存泄漏的关键。

```vue
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 定时器引用
let timer: number | null = null

onMounted(() => {
  // 创建定时器
  timer = setInterval(() => {
    fetchData()
  }, 5000)
})

onUnmounted(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
```

### 2. 事件监听清理

```vue
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'

const handleResize = () => {
  console.log('Window resized')
}

onMounted(() => {
  // 添加事件监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})
</script>
```

### 3. WebSocket连接管理

```typescript
// composables/useWebSocket.ts
export function useWebSocket() {
  let socket: WebSocket | null = null

  const connect = () => {
    socket = new WebSocket('wss://api.example.com')
    // ... 连接逻辑
  }

  const disconnect = () => {
    if (socket) {
      socket.close()
      socket = null
    }
  }

  // 应用隐藏时断开连接
  onHide(() => {
    disconnect()
  })

  // 应用显示时重新连接
  onShow(() => {
    if (!socket) {
      connect()
    }
  })

  return { connect, disconnect }
}
```

### 4. 大数据处理

```typescript
// 分批处理大数据
async function processBigData(data: any[]) {
  const chunkSize = 100
  const chunks = []

  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }

  for (const chunk of chunks) {
    await processChunk(chunk)

    // 让出主线程,避免阻塞
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

// 使用虚拟滚动处理大列表
const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = start + visibleCount
  return allItems.value.slice(start, end)
})
```

---

## 网络优化

### 1. HTTP缓存

#### 请求级缓存

```typescript
// 使用缓存的GET请求
const fetchUserInfo = async (userId: string) => {
  const cacheKey = `user_info_${userId}`

  // 先检查缓存
  const cached = cache.get<UserInfo>(cacheKey)
  if (cached) {
    return cached
  }

  // 缓存未命中,发起请求
  const res = await http.get(`/api/user/${userId}`)

  // 缓存结果(5分钟)
  cache.set(cacheKey, res.data, 5 * 60)

  return res.data
}
```

#### 数据预加载

```typescript
// 页面跳转前预加载数据
const navigateToDetail = async (id: string) => {
  // 先预加载数据
  const dataPromise = fetchDetailData(id)

  // 立即跳转
  uni.navigateTo({
    url: `/pages/detail/index?id=${id}`
  })

  // 数据到达后缓存
  const data = await dataPromise
  cache.set(`detail_${id}`, data, 60)
}
```

### 2. 请求合并

```typescript
// 批量请求合并
class RequestBatcher {
  private pending: Map<string, Promise<any>> = new Map()

  async fetch(key: string, fetcher: () => Promise<any>) {
    // 检查是否已有相同请求
    if (this.pending.has(key)) {
      return this.pending.get(key)
    }

    // 创建新请求
    const promise = fetcher().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, promise)
    return promise
  }
}

const batcher = new RequestBatcher()

// 使用
async function getUserInfo(userId: string) {
  return batcher.fetch(`user_${userId}`, () =>
    http.get(`/api/user/${userId}`)
  )
}

// 多个组件同时调用,只发送一次请求
Promise.all([
  getUserInfo('123'),
  getUserInfo('123'),
  getUserInfo('123')
])
```

### 3. 离线支持

```typescript
// 离线数据存储
const offlineStorage = {
  // 保存待同步数据
  save(key: string, data: any) {
    const queue = cache.get<any[]>('offline_queue') || []
    queue.push({ key, data, timestamp: Date.now() })
    cache.set('offline_queue', queue)
  },

  // 同步离线数据
  async sync() {
    const queue = cache.get<any[]>('offline_queue') || []

    for (const item of queue) {
      try {
        await http.post('/api/sync', item.data)
        // 同步成功,移除
        queue.splice(queue.indexOf(item), 1)
      } catch (error) {
        console.error('同步失败:', item.key)
      }
    }

    cache.set('offline_queue', queue)
  }
}

// 网络恢复时同步
uni.onNetworkStatusChange((res: any) => {
  if (res.isConnected) {
    offlineStorage.sync()
  }
})
```

---

## 平台优化

### 1. 平台检测

系统提供了完整的平台检测工具。

```typescript
// 平台类型检测
import {
  isApp,                // Native App
  isMp,                 // 任意小程序
  isMpWeixin,           // 微信小程序
  isMpAlipay,           // 支付宝小程序
  isH5,                 // 浏览器H5
  isWechatOfficialH5,   // 微信公众号H5
  isAlipayOfficialH5    // 支付宝H5
} from '@/utils/platform'

// 使用示例
if (isMpWeixin) {
  // 微信小程序特定逻辑
  wx.getSystemInfo()
} else if (isApp) {
  // Native App特定逻辑
  plus.runtime.getProperty()
}
```

### 2. iOS优化

```typescript
// manifest.config.ts
export default {
  'app-plus': {
    // 禁用页面弹性
    bounce: 'none',

    // 启用硬件加速
    hardwareAcceleration: true,

    // iOS特定配置
    ios: {
      // 禁用黑色背景
      backgroundMode: 'light',

      // 启用增量更新
      incrementalUpdate: true
    }
  }
}
```

**CSS优化:**

```scss
// 使用transform代替position
.animated-element {
  // ❌ 性能差
  left: 100px;
  top: 100px;

  // ✅ 性能好
  transform: translate(100px, 100px);
}

// 启用GPU加速
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

### 3. Android优化

```typescript
// manifest.config.ts
export default {
  'app-plus': {
    android: {
      // 启用X5内核
      useX5: true,

      // 优化WebView性能
      webView: {
        cacheMode: 'default',
        hardwareAccelerated: true
      }
    }
  }
}
```

**列表优化:**

```vue
<template>
  <!-- Android长列表优化 -->
  <recycle-list :list-data="items" :key-field="'id'">
    <template v-slot="{ item }">
      <view class="item">{{ item.name }}</view>
    </template>
  </recycle-list>
</template>
```

### 4. 小程序优化

#### 微信小程序

```typescript
// manifest.config.ts
export default {
  'mp-weixin': {
    // 启用分包
    optimization: {
      subPackages: true
    },

    // 懒加载必要组件
    lazyCodeLoading: 'requiredComponents',

    // 启用增强编译
    enhance: true
  }
}
```

**分包配置:**

```typescript
// pages.config.ts
export default {
  subPackages: [
    {
      root: 'pages-sub/user',
      pages: [
        { path: 'profile/index' },
        { path: 'settings/index' }
      ]
    },
    {
      root: 'pages-sub/shop',
      pages: [
        { path: 'list/index' },
        { path: 'detail/index' }
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      packages: ['pages-sub/user'],
      network: 'wifi'
    }
  }
}
```

#### 支付宝小程序

```typescript
// manifest.config.ts
export default {
  'mp-alipay': {
    // 按需注入
    lazyCodeLoading: 'requiredComponents',

    // 组件2编译
    component2: true
  }
}
```

### 5. H5优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks: {
          'vue': ['vue', 'vue-router', 'pinia'],
          'ui': ['wot-design-uni'],
          'vendor': ['axios', 'dayjs']
        }
      }
    }
  },

  // PWA支持
  plugins: [
    PWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60
              }
            }
          }
        ]
      }
    })
  ]
})
```

---

## 日志与监控

### 1. 性能监控

```typescript
// 监控页面加载时间
const logPageLoad = () => {
  const loadTime = Date.now() - startTime
  console.log(`页面加载耗时: ${loadTime}ms`)

  // 上报到监控系统
  logger.log('page_load', { duration: loadTime })
}

// 监控API请求时间
const logApiRequest = (url: string, duration: number) => {
  if (duration > 1000) {
    console.warn(`慢请求: ${url} 耗时 ${duration}ms`)
  }

  logger.log('api_request', { url, duration })
}

// 监控内存使用
const logMemory = () => {
  const memory = (performance as any).memory
  if (memory) {
    logger.log('memory_usage', {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    })
  }
}
```

### 2. 错误收集

```typescript
// 全局错误处理
onError((error: string) => {
  console.error('Global error:', error)
  logger.error('app_error', { message: error })
})

// 未处理的Promise拒绝
onUnhandledRejection((event: any) => {
  console.error('Unhandled rejection:', event.reason)
  logger.error('unhandled_rejection', {
    reason: event.reason
  })
})

// 网络错误
uni.onNetworkStatusChange((res: any) => {
  if (!res.isConnected) {
    logger.warn('network_offline')
  }
})
```

### 3. 日志批量上报

系统实现了高效的日志收集和上报机制。

```typescript
// 日志收集器
class LogCollector {
  private logs: any[] = []
  private timer: number | null = null
  private maxSize = 50         // 最大批次大小
  private maxQueue = 200       // 最大队列长度
  private interval = 2000      // 上报间隔(ms)

  // 添加日志
  add(log: any) {
    if (this.logs.length >= this.maxQueue) {
      this.logs.shift()  // 队列满,移除最旧日志
    }

    this.logs.push({
      ...log,
      timestamp: Date.now()
    })

    // 达到批次大小,立即上报
    if (this.logs.length >= this.maxSize) {
      this.flush()
    }
  }

  // 上报日志
  async flush() {
    if (this.logs.length === 0) return

    const batch = this.logs.splice(0, this.maxSize)

    try {
      await http.post('/api/logs/batch', batch)
    } catch (error) {
      console.error('日志上报失败:', error)
      // 失败的日志不重新入队,避免无限积压
    }
  }

  // 启动自动上报
  start() {
    if (this.timer) return

    this.timer = setInterval(() => {
      this.flush()
    }, this.interval) as any
  }

  // 停止自动上报
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    // 上报剩余日志
    this.flush()
  }
}

const logger = new LogCollector()

// 应用启动时开始收集
onLaunch(() => {
  logger.start()
})

// 应用隐藏时上报
onHide(() => {
  logger.flush()
})
```

---

## 最佳实践

### 1. 启动优化

```typescript
// 延迟非关键初始化
onLaunch(() => {
  // 立即执行关键初始化
  await initApp()

  // 延迟执行非关键任务
  setTimeout(() => {
    initAnalytics()
    initPush()
    checkUpdate()
  }, 2000)
})
```

### 2. 资源优化

```typescript
// 图片压缩和格式选择
const getOptimizedImageUrl = (url: string, width: number) => {
  return `${url}?imageView2/2/w/${width}/format/webp`
}

// 使用WebP格式(节省30-50%体积)
<image :src="getOptimizedImageUrl(imageUrl, 750)" />
```

### 3. 动画优化

```scss
// 使用CSS动画代替JS动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 使用transform代替position
.slide-enter-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}
```

### 4. 状态管理优化

```typescript
// 使用Pinia的细粒度响应式
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 基础信息(频繁访问)
  const basicInfo = ref({
    id: '',
    name: '',
    avatar: ''
  })

  // 详细信息(按需加载)
  const detailInfo = ref(null)

  const loadDetail = async () => {
    if (!detailInfo.value) {
      detailInfo.value = await fetchUserDetail()
    }
  }

  return { basicInfo, detailInfo, loadDetail }
})
```

### 5. 组件设计优化

```vue
<script lang="ts" setup>
// 使用props接口减少响应式开销
interface Props {
  id: string
  name: string
  // 避免传递大对象
}

const props = defineProps<Props>()

// 计算属性缓存
const displayName = computed(() => {
  return props.name.toUpperCase()
})

// 避免在模板中使用复杂表达式
const isActive = computed(() => {
  return props.id === currentId.value
})
</script>

<template>
  <view :class="{ active: isActive }">
    {{ displayName }}
  </view>
</template>
```

---

## 常见问题

### 1. 页面白屏时间过长

**问题原因:**
- 首屏数据请求过多
- 组件渲染复杂
- 资源加载阻塞

**解决方案:**

```typescript
// 1. 骨架屏占位
<template>
  <view v-if="loading" class="skeleton">
    <view class="skeleton-avatar"></view>
    <view class="skeleton-text"></view>
  </view>
  <view v-else>
    <!-- 实际内容 -->
  </view>
</template>

// 2. 数据预加载
const preloadData = async () => {
  const promises = [
    fetchUserInfo(),
    fetchMenuList(),
    fetchBanners()
  ]

  const [user, menu, banners] = await Promise.all(promises)

  // 缓存数据
  cache.set('preload_user', user, 60)
  cache.set('preload_menu', menu, 60)
  cache.set('preload_banners', banners, 60)
}

// 3. 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
```

### 2. 列表滚动卡顿

**问题原因:**
- 列表项过多
- 渲染计算复杂
- 频繁的DOM操作

**解决方案:**

```vue
<template>
  <!-- 1. 使用虚拟滚动 -->
  <virtual-list
    :items="items"
    :item-height="100"
    :visible-count="10"
  >
    <template #item="{ item }">
      <ListItem :data="item" />
    </template>
  </virtual-list>

  <!-- 2. 分批渲染 -->
  <view v-for="item in visibleItems" :key="item.id">
    <ListItem :data="item" />
  </view>
</template>

<script lang="ts" setup>
// 只渲染可见区域
const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = start + visibleCount
  return allItems.value.slice(start, end)
})
</script>
```

### 3. 内存占用过高

**问题原因:**
- 未清理定时器
- 事件监听未移除
- 大数组/对象未释放

**解决方案:**

```typescript
// 1. 及时清理资源
onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (observer) observer.disconnect()
  largeArray.value = []
})

// 2. 使用弱引用
const weakMap = new WeakMap()
weakMap.set(obj, data)  // obj被垃圾回收时,data也会被回收

// 3. 分批处理大数据
async function processBigData(data: any[]) {
  for (let i = 0; i < data.length; i += 100) {
    await processChunk(data.slice(i, i + 100))
    await nextTick()  // 让出主线程
  }
}
```

### 4. 包体积过大

**问题原因:**
- 未使用代码分割
- 引入了过多第三方库
- 图片资源未压缩

**解决方案:**

```typescript
// 1. 按需导入
import { debounce } from 'lodash-es'  // ✅ 只导入需要的
import _ from 'lodash'  // ❌ 导入整个库

// 2. 代码分割
const HeavyModule = () => import('@/modules/heavy')

// 3. 使用CDN
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        }
      }
    }
  }
}

// 4. 图片压缩
// 使用tinypng、webp格式
// 移除EXIF信息
```

### 5. 请求响应慢

**问题原因:**
- 未使用缓存
- 并发请求过多
- 接口性能差

**解决方案:**

```typescript
// 1. 请求缓存
const fetchWithCache = async (url: string) => {
  const cached = cache.get(url)
  if (cached) return cached

  const data = await http.get(url)
  cache.set(url, data, 60)
  return data
}

// 2. 请求合并
const batchFetch = async (ids: string[]) => {
  return await http.post('/api/batch', { ids })
}

// 3. 并发控制
import { parallel } from '@/utils/function'

const tasks = items.map(item => () => fetchItem(item.id))
await parallel(tasks, 3)  // 最多3个并发
```

---

## 总结

移动端性能优化是一个系统工程。通过本文档介绍的最佳实践:

1. **数据缓存** - 智能缓存系统,自动过期管理,减少网络请求
2. **请求优化** - 防抖节流、并发控制、重试机制,提升网络效率
3. **渲染优化** - 组件懒加载、虚拟滚动、分页加载,保持界面流畅
4. **包体积优化** - 代码分割、Tree Shaking、按需加载,快速启动
5. **内存管理** - 资源及时清理、防止内存泄漏,稳定运行
6. **平台优化** - iOS/Android/小程序专项优化,适配各平台特性

建议在实际使用中:
- 建立性能监控体系,持续跟踪关键指标
- 定期进行性能测试和优化
- 关注用户反馈,及时解决性能问题
- 使用专业工具(Chrome DevTools、小程序性能分析等)分析瓶颈
- 遵循"测量-优化-验证"的闭环流程
