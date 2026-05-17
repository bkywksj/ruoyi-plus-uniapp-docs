# 性能分析

前端项目的性能分析和优化指南。

## 🎯 性能指标

### 核心Web指标 (Core Web Vitals)

| 指标 | 含义 | 目标值 |
|------|------|--------|
| **LCP** | 最大内容绘制 | < 2.5s |
| **FID** | 首次输入延迟 | < 100ms |
| **CLS** | 累积布局偏移 | < 0.1 |

### 其他关键指标

| 指标 | 含义 | 目标值 |
|------|------|--------|
| **FCP** | 首次内容绘制 | < 1.8s |
| **TTI** | 可交互时间 | < 3.8s |
| **TTFB** | 首字节时间 | < 600ms |
| **Bundle Size** | 打包体积 | < 500KB |

## 🔍 性能分析工具

### 浏览器 DevTools

#### Lighthouse

**使用步骤**：
1. 打开 Chrome DevTools (F12)
2. 切换到 **Lighthouse** 面板
3. 选择 **Performance** 和 **Best Practices**
4. 点击 **Analyze page load**

**报告内容**：
- **Performance**: 性能评分 (0-100)
- **Accessibility**: 可访问性
- **Best Practices**: 最佳实践
- **SEO**: 搜索引擎优化

**关键指标**：
```text
First Contentful Paint: 1.2s
Largest Contentful Paint: 2.3s
Total Blocking Time: 150ms
Cumulative Layout Shift: 0.05
Speed Index: 2.1s
```

**优化建议**：
- Opportunities: 可优化项
- Diagnostics: 诊断信息
- Passed audits: 已通过项

#### Performance 面板

**录制性能**：
1. 打开 Performance 面板
2. 点击 Record 按钮
3. 执行要分析的操作
4. 点击 Stop 按钮

**分析内容**：
- **FPS**: 帧率（60fps 最佳）
- **CPU**: CPU 使用率
- **Network**: 网络请求
- **Frames**: 帧截图
- **Timings**: 时间标记

**关键时间点**：
```text
DCL (DOMContentLoaded): 蓝线
L (Load): 红线
FP (First Paint): 绿线
FCP (First Contentful Paint): 绿线
LCP (Largest Contentful Paint): 蓝点
```

#### Network 面板

**关键指标**：
- **DOMContentLoaded**: HTML 解析完成
- **Load**: 所有资源加载完成
- **Requests**: 请求总数
- **Transferred**: 传输大小
- **Resources**: 资源大小
- **Finish**: 完成时间

**资源类型分析**：
```text
JS: 350KB (45%)
CSS: 120KB (15%)
Images: 200KB (25%)
Fonts: 80KB (10%)
Others: 50KB (5%)
```

### Vite 构建分析

#### rollup-plugin-visualizer

**安装**：
```bash
pnpm add -D rollup-plugin-visualizer
```

**配置**：
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    })
  ]
})
```

**分析报告**：
- 模块体积占比
- 依赖关系图
- Gzip 后体积
- 各模块详细信息

#### vite-bundle-visualizer

```bash
pnpm add -D vite-bundle-visualizer
```

```typescript
// vite.config.ts
import { visualizer as bundleVisualizer } from 'vite-bundle-visualizer'

export default defineConfig({
  plugins: [
    bundleVisualizer()
  ]
})
```

### Vue DevTools

#### Performance 面板

**功能**：
- 组件渲染时间
- 组件更新频率
- 性能火焰图
- 组件树分析

**使用**：
1. 打开 Vue DevTools
2. 切换到 **Performance** 面板
3. 点击 **Start Recording**
4. 执行操作
5. 点击 **Stop Recording**

**分析内容**：
```text
Component: UserList
Render: 15.3ms
Update: 8.2ms
Count: 12 times
```

## 📊 构建性能优化

### 减少打包体积

#### 代码分割

```typescript
// 路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('@/views/system/user/UserList.vue')
  }
]

// 动态导入
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
```

#### Tree Shaking

```typescript
// ✅ 按需导入
import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'

// ❌ 导入整个库
import _ from 'lodash'
import * as Vue from 'vue'
```

#### 手动分包

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vue-vendor': ['vue', 'vue-router', 'pinia'],
        'element-plus': ['element-plus'],
        'echarts': ['echarts']
      }
    }
  }
}
```

#### 移除未使用代码

```bash
# ESLint 检查未使用变量
pnpm lint:eslint

# 分析 Source Map
npx source-map-explorer dist/assets/*.js
```

### 资源优化

#### 图片优化

```typescript
// 小图标使用 SVG
import Logo from '@/assets/logo.svg'

// 大图片懒加载
<img v-lazy="imageUrl" />

// 图片压缩
// vite.config.ts
import imagemin from 'vite-plugin-imagemin'

plugins: [
  imagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9] },
    svgo: {
      plugins: [
        { name: 'removeViewBox', active: false }
      ]
    }
  })
]
```

#### 字体优化

```css
/* 字体子集 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  unicode-range: U+4E00-9FA5; /* 常用汉字 */
  font-display: swap; /* 字体加载期间显示后备字体 */
}
```

#### Gzip 压缩

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

plugins: [
  viteCompression({
    algorithm: 'gzip',
    ext: '.gz',
    threshold: 10240, // 10KB 以上才压缩
    deleteOriginFile: false
  })
]
```

### 依赖优化

#### 预构建配置

```typescript
// vite.config.ts
optimizeDeps: {
  include: [
    'vue',
    'vue-router',
    'pinia',
    'axios',
    'element-plus/es'
  ],
  exclude: [
    '@iconify/vue' // 排除不需要预构建的包
  ]
}
```

#### 外部化大型依赖

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    external: ['echarts'], // 不打包到 bundle
    output: {
      globals: {
        echarts: 'echarts' // 使用 CDN
      }
    }
  }
}
```

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
```

## ⚡ 运行时性能优化

### 组件优化

#### 避免不必要的渲染

```vue
<script lang="ts" setup>
// ✅ 使用 computed 缓存计算结果
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// ❌ 避免在模板中直接计算
<div v-for="item in list.filter(i => i.status === 'active')">
```

#### 使用 v-show 代替 v-if

```vue
<!-- ✅ 频繁切换使用 v-show -->
<div v-show="isVisible">内容</div>

<!-- ❌ 频繁切换避免使用 v-if -->
<div v-if="isVisible">内容</div>
```

#### 列表优化

```vue
<script lang="ts" setup>
// ✅ 使用唯一 key
<div v-for="item in list" :key="item.id">

// ❌ 避免使用 index 作为 key
<div v-for="(item, index) in list" :key="index">

// ✅ 虚拟滚动（大列表）
import { useVirtualList } from '@vueuse/core'

const { list: virtualList, containerProps, wrapperProps } = useVirtualList(
  largeList,
  { itemHeight: 50 }
)
</script>

<template>
  <div v-bind="containerProps" style="height: 400px">
    <div v-bind="wrapperProps">
      <div v-for="item in virtualList" :key="item.index">
        {{ item.data }}
      </div>
    </div>
  </div>
</template>
```

#### 组件懒加载

```typescript
// ✅ 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)

// ✅ 带加载状态
const AsyncComponent = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000
})
```

### 数据优化

#### 防抖节流

```typescript
import { debounce, throttle } from 'lodash-es'

// 防抖：延迟执行
const handleSearch = debounce((keyword: string) => {
  search(keyword)
}, 500)

// 节流：限制频率
const handleScroll = throttle(() => {
  loadMore()
}, 200)
```

#### 缓存请求

```typescript
// 使用 Pinia 缓存数据
export const useUserStore = defineStore('user', {
  state: () => ({
    userList: [],
    cacheTime: 0
  }),
  actions: {
    async getUserList(force = false) {
      const now = Date.now()
      // 5 分钟内不重复请求
      if (!force && this.userList.length && now - this.cacheTime < 5 * 60 * 1000) {
        return this.userList
      }

      const [err, data] = await getUserListApi()
      if (!err) {
        this.userList = data
        this.cacheTime = now
      }
      return data
    }
  }
})
```

#### 分页加载

```typescript
// ✅ 分页加载
const pageQuery = reactive({
  pageNum: 1,
  pageSize: 20
})

async function loadMore() {
  pageQuery.pageNum++
  const [err, data] = await getList(pageQuery)
  if (!err) {
    list.value.push(...data.records)
  }
}

// ❌ 避免一次性加载全部数据
async function loadAll() {
  const [err, data] = await getAllData() // 可能数据量很大
}
```

### 路由优化

#### 路由懒加载

```typescript
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/user',
    component: () => import('@/views/system/user/UserList.vue')
  }
]
```

#### 路由预加载

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 鼠标悬停时预加载
function prefetchRoute(routeName: string) {
  const route = router.resolve({ name: routeName })
  const component = route.matched[0]?.components?.default
  if (component && typeof component === 'function') {
    component() // 预加载组件
  }
}
```

#### Keep-Alive 缓存

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts" setup>
// 缓存列表页，不缓存详情页
const cachedViews = ['UserList', 'RoleList']
</script>
```

## 🌐 网络优化

### HTTP 缓存

```typescript
// 配置 Axios 缓存
import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const instance = axios.create()
const cachedInstance = setupCache(instance, {
  ttl: 5 * 60 * 1000 // 5 分钟
})
```

### 请求合并

```typescript
// 使用 Promise.all 并行请求
async function loadPageData() {
  const [user, roles, permissions] = await Promise.all([
    getUserInfo(),
    getRoles(),
    getPermissions()
  ])
}
```

### 接口预加载

```typescript
// 路由进入前预加载数据
router.beforeEach(async (to, from, next) => {
  if (to.meta.preload) {
    await loadPageData(to.name)
  }
  next()
})
```

## 📱 渲染优化

### 减少 DOM 操作

```vue
<!-- ✅ 使用 Vue 响应式 -->
<div>{{ message }}</div>

<!-- ❌ 避免直接操作 DOM -->
<script>
document.getElementById('msg').innerHTML = message
</script>
```

### CSS 优化

```css
/* ✅ 使用 transform 和 opacity（GPU 加速） */
.fade-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* ❌ 避免触发重排的属性 */
.fade-enter-active {
  transition: width 0.3s, height 0.3s; /* 触发重排 */
}
```

### 避免长任务

```typescript
// ✅ 使用 requestIdleCallback 分片执行
function processLargeData(data: any[]) {
  let index = 0

  function processChunk() {
    const chunk = data.slice(index, index + 100)
    chunk.forEach(item => process(item))

    index += 100
    if (index < data.length) {
      requestIdleCallback(processChunk)
    }
  }

  requestIdleCallback(processChunk)
}

// ❌ 避免阻塞主线程
function processLargeData(data: any[]) {
  data.forEach(item => process(item)) // 可能阻塞几秒
}
```

## 🔧 性能监控

### Performance API

```typescript
// 监控页面加载性能
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  console.log('DNS 查询:', perfData.domainLookupEnd - perfData.domainLookupStart)
  console.log('TCP 连接:', perfData.connectEnd - perfData.connectStart)
  console.log('请求响应:', perfData.responseEnd - perfData.requestStart)
  console.log('DOM 解析:', perfData.domInteractive - perfData.domLoading)
  console.log('资源加载:', perfData.loadEventEnd - perfData.domContentLoadedEventEnd)
})

// 监控资源加载
const resources = performance.getEntriesByType('resource')
resources.forEach(resource => {
  console.log(resource.name, resource.duration)
})
```

### 自定义性能标记

```typescript
// 标记开始
performance.mark('api-start')

await fetchData()

// 标记结束
performance.mark('api-end')

// 计算耗时
performance.measure('api-duration', 'api-start', 'api-end')

const measure = performance.getEntriesByName('api-duration')[0]
console.log('API 耗时:', measure.duration)
```

### 错误监控

```typescript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
  // 上报错误
})

// Vue 错误捕获
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 错误:', err, info)
  // 上报错误
}
```

## 📋 性能检查清单

### 开发阶段
- [ ] 路由懒加载
- [ ] 组件按需导入
- [ ] 图片懒加载
- [ ] 列表虚拟滚动
- [ ] 防抖节流

### 构建优化
- [ ] 代码分割
- [ ] Tree Shaking
- [ ] Gzip 压缩
- [ ] 资源压缩
- [ ] 分析构建报告

### 运行时优化
- [ ] Keep-Alive 缓存
- [ ] 接口缓存
- [ ] 减少重渲染
- [ ] 避免内存泄漏
- [ ] 减少 DOM 操作

### 网络优化
- [ ] HTTP 缓存
- [ ] 请求合并
- [ ] 资源预加载
- [ ] CDN 加速
- [ ] 服务端渲染 (SSR)

## ❓ 常见问题

### 1. 首屏加载时间过长导致白屏

**问题描述**

用户打开应用后出现长时间白屏，首屏加载时间超过 3 秒，严重影响用户体验和留存率。

**问题原因**

- 入口文件过大，包含过多同步加载的依赖
- 未使用路由懒加载，所有路由组件打包到一个文件
- 第三方库未做 Tree Shaking，引入了大量未使用代码
- 未启用代码压缩或压缩配置不当
- 静态资源未使用 CDN 加速
- 服务器响应慢或网络延迟高

**解决方案**

```typescript
// vite.config.ts - 完整的首屏优化配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    // 构建分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240
    }),
    // Brotli 压缩（更小）
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240
    })
  ],
  build: {
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vue 核心库
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia')) {
            return 'vue-vendor'
          }
          // Element Plus 单独分包
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }
          // ECharts 单独分包（体积大）
          if (id.includes('node_modules/echarts')) {
            return 'echarts'
          }
          // 工具库
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/axios')) {
            return 'utils'
          }
        }
      }
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

```typescript
// router/index.ts - 路由懒加载配置
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 布局组件可同步加载（必须）
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        // 路由懒加载 + webpackChunkName 分组
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
        meta: { title: '首页' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    children: [
      {
        path: 'user',
        name: 'User',
        // 系统管理模块分组
        component: () => import(/* webpackChunkName: "system" */ '@/views/system/user/UserList.vue')
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import(/* webpackChunkName: "system" */ '@/views/system/role/RoleList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```vue
<!-- App.vue - 骨架屏优化 -->
<template>
  <div id="app">
    <Suspense>
      <template #default>
        <router-view />
      </template>
      <template #fallback>
        <AppSkeleton />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import AppSkeleton from '@/components/AppSkeleton.vue'
</script>
```

```vue
<!-- components/AppSkeleton.vue - 首屏骨架屏 -->
<template>
  <div class="app-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-logo"></div>
      <div class="skeleton-nav">
        <div class="skeleton-item" v-for="i in 5" :key="i"></div>
      </div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-sidebar">
        <div class="skeleton-menu" v-for="i in 8" :key="i"></div>
      </div>
      <div class="skeleton-main">
        <div class="skeleton-card" v-for="i in 4" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-skeleton {
  width: 100vw;
  height: 100vh;
  background: var(--el-bg-color);
}

.skeleton-header {
  height: 60px;
  background: var(--el-bg-color-overlay);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.skeleton-logo {
  width: 120px;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-nav {
  display: flex;
  gap: 20px;
  margin-left: 40px;
}

.skeleton-item {
  width: 60px;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-content {
  display: flex;
  height: calc(100vh - 60px);
}

.skeleton-sidebar {
  width: 200px;
  background: var(--el-bg-color-overlay);
  padding: 20px;
}

.skeleton-menu {
  height: 40px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-main {
  flex: 1;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
```

```html
<!-- index.html - 预加载关键资源 -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- DNS 预解析 -->
    <link rel="dns-prefetch" href="//api.example.com" />
    <link rel="dns-prefetch" href="//cdn.example.com" />
    <!-- 预连接 -->
    <link rel="preconnect" href="https://api.example.com" crossorigin />
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/logo.svg" as="image" />
    <!-- 预获取下一页资源 -->
    <link rel="prefetch" href="/assets/dashboard-bg.jpg" />
    <title>RuoYi Plus</title>
  </head>
  <body>
    <div id="app">
      <!-- 内联骨架屏样式（避免闪烁） -->
      <style>
        #app-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f7fa;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e0e0e0;
          border-top-color: #409eff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div id="app-loading">
        <div class="loading-spinner"></div>
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**优化效果验证**

```typescript
// utils/performance.ts - 性能监控工具
export function measureFirstScreen() {
  if (typeof window === 'undefined') return

  // 首次内容绘制
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`)
    }
  })

  observer.observe({
    type: 'paint',
    buffered: true
  })

  // 最大内容绘制
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`)
  })

  lcpObserver.observe({
    type: 'largest-contentful-paint',
    buffered: true
  })

  // 页面完全加载
  window.addEventListener('load', () => {
    const timing = performance.timing
    const loadTime = timing.loadEventEnd - timing.navigationStart
    console.log(`页面完全加载: ${loadTime}ms`)
  })
}
```

### 2. 列表页面滚动卡顿

**问题描述**

表格或列表页面在数据量较大时（超过 100 条），滚动时出现明显卡顿，帧率下降到 30fps 以下。

**问题原因**

- DOM 节点过多，渲染压力大
- 列表项组件过于复杂，包含多层嵌套
- 使用 index 作为 key 导致不必要的 DOM 更新
- 图片未懒加载，大量图片同时加载
- 滚动事件未节流，频繁触发重计算

**解决方案**

```vue
<!-- components/VirtualTable.vue - 虚拟滚动表格 -->
<template>
  <div
    ref="containerRef"
    class="virtual-table"
    :style="{ height: `${containerHeight}px` }"
    @scroll="handleScroll"
  >
    <!-- 滚动占位高度 -->
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <!-- 表头 -->
      <div class="table-header" :style="{ top: `${scrollTop}px` }">
        <div
          v-for="col in columns"
          :key="col.prop"
          class="table-cell header-cell"
          :style="{ width: col.width ? `${col.width}px` : 'auto' }"
        >
          {{ col.label }}
        </div>
      </div>

      <!-- 可视区域内容 -->
      <div
        class="table-body"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleData"
          :key="item.id"
          class="table-row"
          :class="{ 'table-row--selected': selectedIds.includes(item.id) }"
          @click="handleRowClick(item)"
        >
          <div
            v-for="col in columns"
            :key="col.prop"
            class="table-cell"
            :style="{ width: col.width ? `${col.width}px` : 'auto' }"
          >
            <slot :name="col.prop" :row="item" :index="item._index">
              {{ item[col.prop] }}
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Column {
  prop: string
  label: string
  width?: number
}

interface Props {
  data: any[]
  columns: Column[]
  rowHeight?: number
  containerHeight?: number
  bufferSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 48,
  containerHeight: 600,
  bufferSize: 5
})

const emit = defineEmits<{
  rowClick: [row: any]
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const selectedIds = ref<(string | number)[]>([])

// 计算总高度
const totalHeight = computed(() => props.data.length * props.rowHeight)

// 计算可视区域起始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.rowHeight)
  return Math.max(0, index - props.bufferSize)
})

// 计算可视区域结束索引
const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.rowHeight)
  return Math.min(
    props.data.length,
    startIndex.value + visibleCount + props.bufferSize * 2
  )
})

// 计算偏移量
const offsetY = computed(() => startIndex.value * props.rowHeight)

// 可视区域数据
const visibleData = computed(() => {
  return props.data
    .slice(startIndex.value, endIndex.value)
    .map((item, index) => ({
      ...item,
      _index: startIndex.value + index
    }))
})

// 滚动处理（使用 requestAnimationFrame 优化）
let ticking = false
function handleScroll(event: Event) {
  if (!ticking) {
    requestAnimationFrame(() => {
      scrollTop.value = (event.target as HTMLElement).scrollTop
      ticking = false
    })
    ticking = true
  }
}

function handleRowClick(row: any) {
  emit('rowClick', row)
}

// 清理
onUnmounted(() => {
  ticking = false
})
</script>

<style lang="scss" scoped>
.virtual-table {
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.table-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.table-body {
  position: absolute;
  left: 0;
  right: 0;
}

.table-row {
  display: flex;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &--selected {
    background: var(--el-color-primary-light-9);
  }
}

.table-cell {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-cell {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
```

```vue
<!-- 使用 Element Plus 虚拟表格 -->
<template>
  <el-table-v2
    :columns="columns"
    :data="tableData"
    :width="800"
    :height="600"
    :row-height="48"
    fixed
  />
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ElTableV2 } from 'element-plus'
import type { Column } from 'element-plus'

const tableData = ref([...Array(10000).keys()].map(i => ({
  id: i,
  name: `用户${i}`,
  email: `user${i}@example.com`,
  status: i % 2 === 0 ? '启用' : '禁用'
})))

const columns: Column[] = [
  { key: 'id', dataKey: 'id', title: 'ID', width: 80 },
  { key: 'name', dataKey: 'name', title: '用户名', width: 150 },
  { key: 'email', dataKey: 'email', title: '邮箱', width: 200 },
  {
    key: 'status',
    dataKey: 'status',
    title: '状态',
    width: 100,
    cellRenderer: ({ cellData }) => h('span', {
      class: cellData === '启用' ? 'text-success' : 'text-danger'
    }, cellData)
  }
]
</script>
```

```vue
<!-- 使用 VueUse 的 useVirtualList -->
<template>
  <div class="list-container">
    <div v-bind="containerProps" class="list-scroll">
      <div v-bind="wrapperProps">
        <div
          v-for="{ data, index } in virtualList"
          :key="data.id"
          class="list-item"
        >
          <img
            v-lazy="data.avatar"
            class="avatar"
            loading="lazy"
          />
          <div class="info">
            <div class="name">{{ data.name }}</div>
            <div class="desc">{{ data.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVirtualList } from '@vueuse/core'

interface ListItem {
  id: number
  name: string
  description: string
  avatar: string
}

const allItems = ref<ListItem[]>(
  [...Array(5000).keys()].map(i => ({
    id: i,
    name: `项目${i}`,
    description: `这是第${i}个项目的描述信息`,
    avatar: `/api/avatar/${i}`
  }))
)

const { list: virtualList, containerProps, wrapperProps } = useVirtualList(
  allItems,
  {
    itemHeight: 72,
    overscan: 5 // 预渲染数量
  }
)
</script>

<style lang="scss" scoped>
.list-container {
  height: 500px;
}

.list-scroll {
  height: 100%;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  background: var(--el-fill-color);
}

.info {
  flex: 1;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
```

### 3. 组件频繁重渲染导致性能下降

**问题描述**

页面中某些组件在父组件状态更新时频繁重渲染，即使该组件的 props 没有变化，导致页面整体性能下降。

**问题原因**

- 父组件状态变化触发所有子组件重新渲染
- 传递了新的引用类型 props（对象、数组、函数）
- 计算属性依赖了频繁变化的响应式数据
- 使用了内联函数作为事件处理器
- 未使用 `v-memo` 缓存静态内容

**解决方案**

```vue
<!-- 使用 v-memo 缓存静态内容 -->
<template>
  <div class="user-list">
    <!-- v-memo 会在依赖项不变时跳过渲染 -->
    <div
      v-for="user in users"
      :key="user.id"
      v-memo="[user.name, user.status, selectedId === user.id]"
      class="user-item"
      :class="{ selected: selectedId === user.id }"
      @click="handleSelect(user.id)"
    >
      <img :src="user.avatar" class="avatar" />
      <div class="info">
        <div class="name">{{ user.name }}</div>
        <div class="status">{{ user.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  status: string
  avatar: string
}

const users = ref<User[]>([])
const selectedId = ref<number | null>(null)

function handleSelect(id: number) {
  selectedId.value = id
}
</script>
```

```vue
<!-- 使用 shallowRef 处理大型数据 -->
<script setup lang="ts">
import { shallowRef, triggerRef } from 'vue'

interface DataItem {
  id: number
  value: string
  nested: {
    deep: string
  }
}

// 使用 shallowRef 避免深层响应式
const largeData = shallowRef<DataItem[]>([])

// 加载数据
async function loadData() {
  const response = await fetch('/api/large-data')
  largeData.value = await response.json()
}

// 更新数据时需要手动触发更新
function updateItem(index: number, newValue: string) {
  largeData.value[index].value = newValue
  triggerRef(largeData) // 手动触发更新
}

// 或者替换整个数组
function updateItems(newItems: DataItem[]) {
  largeData.value = [...newItems]
}
</script>
```

```vue
<!-- 使用稳定引用避免不必要的重渲染 -->
<template>
  <ChildComponent
    :items="items"
    :config="stableConfig"
    :formatter="stableFormatter"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { ref, computed, useMemoize } from 'vue'

const items = ref([])

// ❌ 每次渲染都创建新对象
// const config = { pageSize: 10, sortBy: 'name' }

// ✅ 使用 computed 保持引用稳定
const stableConfig = computed(() => ({
  pageSize: 10,
  sortBy: 'name'
}))

// ❌ 内联函数每次都是新引用
// @update="(val) => handleUpdate(val)"

// ✅ 定义稳定的函数引用
function handleUpdate(val: any) {
  console.log('Updated:', val)
}

// ✅ 使用 useMemoize 缓存函数结果
const stableFormatter = useMemoize((value: string) => {
  return value.toUpperCase()
})
</script>
```

```typescript
// composables/useStableCallback.ts - 稳定回调 Hook
import { ref, watchEffect, type Ref } from 'vue'

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): Ref<T> {
  const callbackRef = ref(callback) as Ref<T>

  watchEffect(() => {
    callbackRef.value = callback
  })

  return callbackRef
}

// 使用示例
const stableHandler = useStableCallback((event: Event) => {
  // 处理逻辑可以访问最新的响应式数据
  console.log(someReactiveValue.value)
})
```

```vue
<!-- 使用 markRaw 标记非响应式数据 -->
<script setup lang="ts">
import { ref, markRaw } from 'vue'
import * as echarts from 'echarts'

// ❌ ECharts 实例不需要响应式
// const chart = ref(null)

// ✅ 使用 markRaw 标记
const chartInstance = ref<echarts.ECharts | null>(null)

function initChart(el: HTMLElement) {
  // markRaw 防止 Vue 将其转换为响应式
  chartInstance.value = markRaw(echarts.init(el))
}

// 同样适用于大型静态配置
const chartOptions = markRaw({
  title: { text: '图表标题' },
  xAxis: { type: 'category' },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [1, 2, 3, 4, 5] }]
})
</script>
```

### 4. 内存泄漏导致页面越来越卡

**问题描述**

页面使用时间越长越卡顿，打开任务管理器发现浏览器内存占用持续增长，刷新页面后恢复正常。

**问题原因**

- 定时器未清理（setInterval、setTimeout）
- 事件监听器未移除（window、document 事件）
- 闭包引用导致对象无法被垃圾回收
- WebSocket 连接未关闭
- 第三方库实例未销毁（ECharts、编辑器等）
- 大型数据缓存未清理

**解决方案**

```vue
<!-- 正确清理定时器和事件监听 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const count = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 方法1：使用变量保存定时器 ID
onMounted(() => {
  timer = setInterval(() => {
    count.value++
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// 方法2：使用 VueUse 的 useIntervalFn（自动清理）
import { useIntervalFn } from '@vueuse/core'

const { pause, resume } = useIntervalFn(() => {
  count.value++
}, 1000)

// 组件卸载时自动停止

// 事件监听清理
function handleResize() {
  console.log('Window resized')
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 或使用 VueUse
import { useEventListener } from '@vueuse/core'

useEventListener(window, 'resize', handleResize)
// 自动清理
</script>
```

```vue
<!-- 正确清理 HTTP 请求 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const data = ref(null)
const controller = new AbortController()

async function fetchData() {
  try {
    const response = await axios.get('/api/data', {
      signal: controller.signal
    })
    data.value = response.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('请求已取消')
    } else {
      console.error('请求失败:', error)
    }
  }
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  // 组件卸载时取消未完成的请求
  controller.abort()
})

// 使用 VueUse 的 useFetch（自动取消）
import { useFetch } from '@vueuse/core'

const { data, abort } = useFetch('/api/data', {
  immediate: true
}).json()

// 手动取消
// abort()

// 组件卸载时自动取消
</script>
```

```vue
<!-- 正确清理第三方库实例 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    title: { text: '销售统计' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }]
  })
}

// 监听窗口大小变化
function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 必须销毁 ECharts 实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})

// 如果需要切换图表数据
watch(() => props.data, (newData) => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{ data: newData }]
    })
  }
})
</script>

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>
```

```typescript
// composables/useCleanup.ts - 统一清理工具
import { onUnmounted } from 'vue'

type CleanupFn = () => void

export function useCleanup() {
  const cleanupFns: CleanupFn[] = []

  function addCleanup(fn: CleanupFn) {
    cleanupFns.push(fn)
  }

  onUnmounted(() => {
    cleanupFns.forEach(fn => fn())
    cleanupFns.length = 0
  })

  return { addCleanup }
}

// 使用示例
import { useCleanup } from '@/composables/useCleanup'

const { addCleanup } = useCleanup()

// 定时器
const timer = setInterval(() => {}, 1000)
addCleanup(() => clearInterval(timer))

// 事件监听
window.addEventListener('scroll', handleScroll)
addCleanup(() => window.removeEventListener('scroll', handleScroll))

// WebSocket
const ws = new WebSocket('wss://...')
addCleanup(() => ws.close())

// 第三方库
const editor = new SomeEditor()
addCleanup(() => editor.destroy())
```

```typescript
// 使用 WeakMap/WeakSet 避免内存泄漏
const cache = new WeakMap<object, any>()

function getExpensiveData(key: object) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const data = computeExpensiveData(key)
  cache.set(key, data)
  return data
}

// 当 key 对象被垃圾回收时，缓存会自动清理
```

### 5. 打包体积过大影响加载速度

**问题描述**

构建后的产物体积超过 2MB，导致首次加载需要下载大量资源，特别是在移动端或弱网环境下加载缓慢。

**问题原因**

- 引入了大型第三方库未做优化（如完整的 Lodash、Moment.js）
- 图标库未按需加载，引入了全部图标
- 未启用代码压缩或压缩效果不佳
- 未配置合理的分包策略
- 未使用 CDN 加速大型依赖

**解决方案**

```typescript
// vite.config.ts - 完整的体积优化配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),

    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({ prefix: 'Icon' })
      ],
      dts: 'src/auto-imports.d.ts'
    }),

    // 自动导入组件
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({ enabledCollections: ['ep'] })
      ],
      dts: 'src/components.d.ts'
    }),

    // 图标按需加载
    Icons({
      autoInstall: true,
      compiler: 'vue3'
    }),

    // 构建分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    }),

    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),

    // Brotli 压缩（压缩率更高）
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    })
  ],

  build: {
    // 启用源码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },

    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Vue 生态
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            // Element Plus
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // ECharts（体积大，单独分包）
            if (id.includes('echarts') || id.includes('zrender')) {
              return 'echarts'
            }
            // 工具库
            if (id.includes('lodash') || id.includes('dayjs') || id.includes('axios')) {
              return 'utils'
            }
            // 其他第三方库
            return 'vendor'
          }
        },
        // 静态资源分类
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || ''
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(info)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(info)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (/\.css$/.test(info)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      },
      // 外部化大型依赖（使用 CDN）
      external: ['echarts'],
      plugins: []
    },

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 资源内联阈值
    assetsInlineLimit: 4096, // 4KB

    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'element-plus/es',
      '@vueuse/core'
    ],
    exclude: ['echarts']
  }
})
```

```html
<!-- index.html - CDN 加载大型依赖 -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RuoYi Plus</title>
    <!-- 预加载关键 CSS -->
    <link rel="preload" href="/assets/css/index.css" as="style" />
  </head>
  <body>
    <div id="app"></div>

    <!-- CDN 加载 ECharts -->
    <script
      src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"
      async
    ></script>

    <!-- 主应用脚本 -->
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```typescript
// 替换大型依赖为轻量替代品

// ❌ Moment.js (~300KB)
import moment from 'moment'
moment().format('YYYY-MM-DD')

// ✅ Day.js (~2KB)
import dayjs from 'dayjs'
dayjs().format('YYYY-MM-DD')

// ❌ 完整 Lodash (~600KB)
import _ from 'lodash'
_.debounce(fn, 300)

// ✅ 按需导入 lodash-es (~10KB per function)
import { debounce } from 'lodash-es'
debounce(fn, 300)

// ❌ 完整图标库
import * as Icons from '@element-plus/icons-vue'

// ✅ 按需导入图标
import { Search, Edit, Delete } from '@element-plus/icons-vue'
```

```bash
# 分析构建产物
pnpm build

# 查看分析报告
open dist/stats.html

# 典型的优化目标
# - 初始加载 bundle: < 200KB (gzip)
# - 最大单个 chunk: < 500KB (gzip)
# - 总体积: < 2MB (gzip)
```

### 6. 接口请求过多导致页面加载慢

**问题描述**

页面初始化时发起大量 API 请求（10+），导致请求队列阻塞，页面数据加载缓慢，甚至出现部分请求超时。

**问题原因**

- 页面组件各自独立请求数据，未做请求合并
- 相同数据在多个组件中重复请求
- 未使用请求缓存，每次进入页面都重新请求
- 请求未做优先级管理，关键数据与非关键数据同时加载
- 未使用 HTTP/2 多路复用能力

**解决方案**

```typescript
// utils/request-manager.ts - 请求管理器
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

interface RequestCache {
  data: any
  timestamp: number
  ttl: number
}

interface PendingRequest {
  promise: Promise<any>
  config: AxiosRequestConfig
}

class RequestManager {
  private cache = new Map<string, RequestCache>()
  private pending = new Map<string, PendingRequest>()
  private queue: Array<{ key: string; config: AxiosRequestConfig; priority: number }> = []
  private maxConcurrent = 6
  private runningCount = 0

  // 生成请求唯一键
  private getKey(config: AxiosRequestConfig): string {
    const { url, method = 'get', params, data } = config
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
  }

  // 带缓存的请求
  async requestWithCache<T>(
    config: AxiosRequestConfig,
    ttl = 5 * 60 * 1000 // 默认缓存 5 分钟
  ): Promise<T> {
    const key = this.getKey(config)

    // 检查缓存
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    // 检查是否有相同的请求正在进行
    const pending = this.pending.get(key)
    if (pending) {
      return pending.promise
    }

    // 发起新请求
    const promise = axios.request<T>(config)
      .then(response => {
        // 缓存响应
        this.cache.set(key, {
          data: response.data,
          timestamp: Date.now(),
          ttl
        })
        this.pending.delete(key)
        return response.data
      })
      .catch(error => {
        this.pending.delete(key)
        throw error
      })

    this.pending.set(key, { promise, config })
    return promise
  }

  // 批量请求（自动去重）
  async batchRequest<T>(
    configs: AxiosRequestConfig[]
  ): Promise<T[]> {
    // 去重
    const uniqueConfigs = configs.filter((config, index) => {
      const key = this.getKey(config)
      return configs.findIndex(c => this.getKey(c) === key) === index
    })

    return Promise.all(
      uniqueConfigs.map(config => this.requestWithCache(config))
    )
  }

  // 带优先级的请求队列
  async requestWithPriority<T>(
    config: AxiosRequestConfig,
    priority = 0 // 数字越大优先级越高
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const key = this.getKey(config)

      this.queue.push({ key, config, priority })
      this.queue.sort((a, b) => b.priority - a.priority)

      this.processQueue()
        .then(() => this.requestWithCache<T>(config))
        .then(resolve)
        .catch(reject)
    })
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.runningCount < this.maxConcurrent) {
      const item = this.queue.shift()
      if (!item) continue

      this.runningCount++

      try {
        await axios.request(item.config)
      } finally {
        this.runningCount--
      }
    }
  }

  // 清除缓存
  clearCache(pattern?: RegExp): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // 取消所有待处理请求
  cancelAll(): void {
    this.pending.clear()
    this.queue.length = 0
  }
}

export const requestManager = new RequestManager()
```

```vue
<!-- 使用请求管理器 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { requestManager } from '@/utils/request-manager'

const userInfo = ref(null)
const permissions = ref([])
const menus = ref([])

onMounted(async () => {
  // 方法1：并行请求（自动去重和缓存）
  const [user, perms, menuList] = await requestManager.batchRequest([
    { url: '/api/user/info', method: 'get' },
    { url: '/api/user/permissions', method: 'get' },
    { url: '/api/menus', method: 'get' }
  ])

  userInfo.value = user
  permissions.value = perms
  menus.value = menuList
})

// 方法2：优先级请求
async function loadDashboard() {
  // 高优先级：关键数据
  const statsPromise = requestManager.requestWithPriority(
    { url: '/api/dashboard/stats', method: 'get' },
    10 // 最高优先级
  )

  // 中优先级：图表数据
  const chartPromise = requestManager.requestWithPriority(
    { url: '/api/dashboard/chart', method: 'get' },
    5
  )

  // 低优先级：通知消息
  const noticePromise = requestManager.requestWithPriority(
    { url: '/api/notices', method: 'get' },
    1
  )

  // 等待所有请求完成
  const [stats, chart, notices] = await Promise.all([
    statsPromise,
    chartPromise,
    noticePromise
  ])
}
</script>
```

```typescript
// stores/common.ts - 使用 Pinia 缓存公共数据
import { defineStore } from 'pinia'

interface DictItem {
  label: string
  value: string
}

export const useCommonStore = defineStore('common', {
  state: () => ({
    dicts: new Map<string, DictItem[]>(),
    dictLoading: new Map<string, Promise<DictItem[]>>()
  }),

  actions: {
    // 获取字典数据（带缓存和去重）
    async getDict(type: string): Promise<DictItem[]> {
      // 已缓存
      if (this.dicts.has(type)) {
        return this.dicts.get(type)!
      }

      // 正在加载（避免重复请求）
      if (this.dictLoading.has(type)) {
        return this.dictLoading.get(type)!
      }

      // 发起请求
      const promise = getDictApi(type)
        .then(data => {
          this.dicts.set(type, data)
          this.dictLoading.delete(type)
          return data
        })
        .catch(error => {
          this.dictLoading.delete(type)
          throw error
        })

      this.dictLoading.set(type, promise)
      return promise
    },

    // 批量预加载字典
    async preloadDicts(types: string[]): Promise<void> {
      await Promise.all(types.map(type => this.getDict(type)))
    }
  }
})
```

```vue
<!-- 合并相关请求 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// ❌ 分散请求
// onMounted(async () => {
//   userInfo.value = await getUserInfo()
//   userRoles.value = await getUserRoles()
//   userPerms.value = await getUserPermissions()
// })

// ✅ 后端提供聚合接口
interface UserDetail {
  info: UserInfo
  roles: Role[]
  permissions: string[]
}

const userDetail = ref<UserDetail | null>(null)

onMounted(async () => {
  // 一次请求获取所有用户相关数据
  userDetail.value = await getUserDetail()
})

// ✅ 或者使用 GraphQL
const { data } = await graphqlClient.query({
  query: gql`
    query GetUserDetail {
      user {
        id
        name
        email
        roles {
          id
          name
        }
        permissions
      }
    }
  `
})
</script>
```

### 7. ECharts 图表渲染导致页面卡顿

**问题描述**

页面包含多个 ECharts 图表时，初始渲染卡顿明显，数据更新时也会出现短暂的界面无响应。

**问题原因**

- 同时初始化多个图表，阻塞主线程
- 图表数据量过大，渲染计算耗时
- 未使用 Canvas 渲染器优化
- 图表动画配置不当
- 窗口 resize 事件未节流
- 图表实例未正确销毁

**解决方案**

```vue
<!-- components/LazyChart.vue - 懒加载图表组件 -->
<template>
  <div ref="chartRef" class="chart-container" :style="{ height }">
    <div v-if="!isInView" class="chart-placeholder">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, markRaw } from 'vue'
import { useIntersectionObserver, useDebounceFn, useResizeObserver } from '@vueuse/core'
import type { EChartsOption, ECharts } from 'echarts'

interface Props {
  option: EChartsOption
  height?: string
  renderer?: 'canvas' | 'svg'
  theme?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  renderer: 'canvas'
})

const chartRef = ref<HTMLElement | null>(null)
const isInView = ref(false)
let chartInstance: ECharts | null = null

// 懒加载 ECharts
let echartsModule: typeof import('echarts') | null = null

async function loadEcharts() {
  if (!echartsModule) {
    echartsModule = await import('echarts')
  }
  return echartsModule
}

// 初始化图表
async function initChart() {
  if (!chartRef.value || chartInstance) return

  const echarts = await loadEcharts()

  chartInstance = markRaw(echarts.init(chartRef.value, props.theme, {
    renderer: props.renderer,
    useDirtyRect: true // 脏矩形渲染优化
  }))

  // 大数据量优化
  const optimizedOption: EChartsOption = {
    ...props.option,
    animation: true,
    animationDuration: 300,
    animationEasing: 'cubicOut',
    // 大数据量时关闭动画
    ...(isLargeData(props.option) && {
      animation: false,
      large: true,
      largeThreshold: 2000
    })
  }

  chartInstance.setOption(optimizedOption)
}

// 判断是否大数据量
function isLargeData(option: EChartsOption): boolean {
  const series = option.series
  if (!series) return false

  const dataCount = (Array.isArray(series) ? series : [series])
    .reduce((sum, s) => sum + (Array.isArray(s.data) ? s.data.length : 0), 0)

  return dataCount > 1000
}

// 视图进入监听
const { stop: stopObserver } = useIntersectionObserver(
  chartRef,
  ([entry]) => {
    isInView.value = entry.isIntersecting

    if (entry.isIntersecting && !chartInstance) {
      nextTick(initChart)
    }
  },
  { threshold: 0.1 }
)

// 防抖 resize
const debouncedResize = useDebounceFn(() => {
  chartInstance?.resize()
}, 200)

// 监听容器大小变化
useResizeObserver(chartRef, debouncedResize)

// 监听配置变化
watch(
  () => props.option,
  (newOption) => {
    if (chartInstance) {
      chartInstance.setOption(newOption, {
        notMerge: false,
        lazyUpdate: true
      })
    }
  },
  { deep: true }
)

// 清理
onUnmounted(() => {
  stopObserver()

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露方法
defineExpose({
  getChart: () => chartInstance,
  refresh: () => chartInstance?.resize()
})
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  position: relative;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
  border-radius: 4px;
}
</style>
```

```typescript
// composables/useEcharts.ts - ECharts 组合式函数
import { ref, watch, onUnmounted, shallowRef, markRaw } from 'vue'
import type { Ref } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import type { EChartsOption, ECharts } from 'echarts'

export function useEcharts(
  elRef: Ref<HTMLElement | null>,
  options: {
    option: Ref<EChartsOption>
    theme?: string | object
    renderer?: 'canvas' | 'svg'
  }
) {
  const chartInstance = shallowRef<ECharts | null>(null)
  const isLoading = ref(false)

  // 动态导入 ECharts
  async function init() {
    if (!elRef.value || chartInstance.value) return

    isLoading.value = true

    try {
      const echarts = await import('echarts')

      chartInstance.value = markRaw(
        echarts.init(elRef.value, options.theme, {
          renderer: options.renderer || 'canvas',
          useDirtyRect: true
        })
      )

      chartInstance.value.setOption(options.option.value)
    } finally {
      isLoading.value = false
    }
  }

  // 更新配置
  function setOption(option: EChartsOption, notMerge = false) {
    chartInstance.value?.setOption(option, {
      notMerge,
      lazyUpdate: true
    })
  }

  // 显示加载动画
  function showLoading() {
    chartInstance.value?.showLoading({
      text: '加载中...',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      textColor: '#409eff'
    })
  }

  function hideLoading() {
    chartInstance.value?.hideLoading()
  }

  // 防抖 resize
  const debouncedResize = useDebounceFn(() => {
    chartInstance.value?.resize()
  }, 200)

  // 监听窗口变化
  useEventListener(window, 'resize', debouncedResize)

  // 监听配置变化
  watch(
    options.option,
    (newOption) => {
      if (chartInstance.value) {
        setOption(newOption)
      }
    },
    { deep: true }
  )

  // 清理
  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  })

  return {
    chartInstance,
    isLoading,
    init,
    setOption,
    showLoading,
    hideLoading,
    resize: debouncedResize
  }
}
```

```vue
<!-- 大数据量图表优化 -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EChartsOption } from 'echarts'

// 原始数据（10万条）
const rawData = ref<number[]>([])

// 数据采样
function sampleData(data: number[], targetCount: number): number[] {
  if (data.length <= targetCount) return data

  const step = Math.ceil(data.length / targetCount)
  const sampled: number[] = []

  for (let i = 0; i < data.length; i += step) {
    // 取区间内的最大值和最小值
    const chunk = data.slice(i, i + step)
    sampled.push(Math.min(...chunk), Math.max(...chunk))
  }

  return sampled
}

// 优化后的图表配置
const chartOption = computed<EChartsOption>(() => {
  const displayData = sampleData(rawData.value, 500) // 采样到 500 点

  return {
    animation: false, // 大数据关闭动画
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        animation: false
      }
    },
    dataZoom: [
      {
        type: 'inside',
        throttle: 50 // 节流
      },
      {
        type: 'slider',
        throttle: 50
      }
    ],
    xAxis: {
      type: 'category',
      data: displayData.map((_, i) => i),
      // 优化大量标签
      axisLabel: {
        interval: 'auto'
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'line',
      data: displayData,
      // 性能优化
      sampling: 'lttb', // 使用 LTTB 算法采样
      smooth: false, // 关闭平滑曲线
      symbol: 'none', // 隐藏数据点
      lineStyle: {
        width: 1
      }
    }]
  }
})
</script>
```

### 8. 表单验证导致输入卡顿

**问题描述**

在包含大量字段或复杂验证规则的表单中，用户输入时出现明显延迟，每次按键后需要等待才能看到输入的字符。

**问题原因**

- 每次输入都触发完整的表单验证
- 验证规则包含复杂的正则表达式或异步校验
- 表单联动逻辑导致大量计算
- 未使用防抖处理验证触发
- 表单组件嵌套层级过深

**解决方案**

```vue
<!-- 优化表单验证 -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="formData.username"
        @input="debouncedValidateField('username')"
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        @input="debouncedValidateField('email')"
      />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input
        v-model="formData.phone"
        @blur="validateField('phone')"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  email: '',
  phone: ''
})

// 验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    // 异步验证使用 blur 触发，避免频繁请求
    {
      validator: async (rule, value, callback) => {
        if (!value) return callback()

        try {
          const isExist = await checkUsernameExists(value)
          if (isExist) {
            callback(new Error('用户名已存在'))
          } else {
            callback()
          }
        } catch {
          callback(new Error('验证失败，请重试'))
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 单字段验证
function validateField(field: string) {
  formRef.value?.validateField(field)
}

// 防抖验证（输入时触发）
const debouncedValidateField = useDebounceFn((field: string) => {
  validateField(field)
}, 300)
</script>
```

```typescript
// utils/validators.ts - 高效的验证工具
import { useDebounceFn } from '@vueuse/core'

// 缓存正则表达式
const regexCache = new Map<string, RegExp>()

function getRegex(pattern: string): RegExp {
  if (!regexCache.has(pattern)) {
    regexCache.set(pattern, new RegExp(pattern))
  }
  return regexCache.get(pattern)!
}

// 常用验证器
export const validators = {
  // 手机号（预编译正则）
  phone: (value: string): boolean => {
    return getRegex('^1[3-9]\\d{9}$').test(value)
  },

  // 邮箱（使用简单模式提高性能）
  email: (value: string): boolean => {
    // 避免复杂正则
    return value.includes('@') && value.includes('.')
  },

  // 身份证（分步验证，避免复杂正则）
  idCard: (value: string): boolean => {
    // 长度检查
    if (value.length !== 18) return false

    // 基本格式检查
    if (!/^\d{17}[\dXx]$/.test(value)) return false

    // 校验码验证
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = '10X98765432'

    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(value[i]) * weights[i]
    }

    const checkCode = checkCodes[sum % 11]
    return value[17].toUpperCase() === checkCode
  }
}

// 创建防抖验证器
export function createDebouncedValidator<T>(
  validator: (value: T) => boolean | Promise<boolean>,
  delay = 300
) {
  let lastValue: T
  let lastResult: boolean | null = null

  const debouncedFn = useDebounceFn(async (value: T, callback: (valid: boolean) => void) => {
    const result = await validator(value)
    lastValue = value
    lastResult = result
    callback(result)
  }, delay)

  return async (value: T): Promise<boolean> => {
    // 如果值没变，返回缓存结果
    if (value === lastValue && lastResult !== null) {
      return lastResult
    }

    return new Promise(resolve => {
      debouncedFn(value, resolve)
    })
  }
}
```

```vue
<!-- 使用 Web Worker 处理复杂验证 -->
<script setup lang="ts">
import { ref } from 'vue'

const validationResult = ref<string>('')

// 创建 Worker
const validationWorker = new Worker(
  new URL('../workers/validation.worker.ts', import.meta.url),
  { type: 'module' }
)

// 监听验证结果
validationWorker.onmessage = (event) => {
  const { field, isValid, message } = event.data
  validationResult.value = isValid ? '' : message
}

// 发送验证请求
function validateInWorker(field: string, value: string, rules: any[]) {
  validationWorker.postMessage({ field, value, rules })
}
</script>
```

```typescript
// workers/validation.worker.ts
interface ValidationMessage {
  field: string
  value: string
  rules: ValidationRule[]
}

interface ValidationRule {
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'custom'
  pattern?: string
  min?: number
  max?: number
  message: string
}

self.onmessage = (event: MessageEvent<ValidationMessage>) => {
  const { field, value, rules } = event.data

  for (const rule of rules) {
    let isValid = true

    switch (rule.type) {
      case 'required':
        isValid = value.trim().length > 0
        break
      case 'pattern':
        isValid = new RegExp(rule.pattern!).test(value)
        break
      case 'minLength':
        isValid = value.length >= rule.min!
        break
      case 'maxLength':
        isValid = value.length <= rule.max!
        break
    }

    if (!isValid) {
      self.postMessage({ field, isValid: false, message: rule.message })
      return
    }
  }

  self.postMessage({ field, isValid: true, message: '' })
}
```

```vue
<!-- 表单分片加载 -->
<template>
  <el-form :model="formData" label-width="120px">
    <!-- 基础信息（立即加载） -->
    <el-card header="基础信息" class="form-section">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="password" />
      </el-form-item>
    </el-card>

    <!-- 详细信息（懒加载） -->
    <el-card
      v-if="showDetailSection"
      header="详细信息"
      class="form-section"
    >
      <template v-if="detailLoaded">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <!-- 更多字段... -->
      </template>
      <el-skeleton v-else :rows="4" animated />
    </el-card>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'

const formData = reactive({
  username: '',
  password: '',
  email: '',
  phone: ''
})

const showDetailSection = ref(false)
const detailLoaded = ref(false)

onMounted(() => {
  // 延迟显示详细信息区域
  setTimeout(() => {
    showDetailSection.value = true

    // 下一帧后加载内容
    nextTick(() => {
      requestIdleCallback(() => {
        detailLoaded.value = true
      })
    })
  }, 100)
})
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 20px;
}
</style>
```
