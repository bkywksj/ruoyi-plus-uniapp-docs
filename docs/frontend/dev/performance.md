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
```
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
```
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
```
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
```
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
<script setup>
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
<script setup>
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

<script setup>
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
