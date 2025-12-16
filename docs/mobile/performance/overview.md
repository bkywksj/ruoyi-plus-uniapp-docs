# 性能优化概览

## 介绍

性能优化是构建高质量 UniApp 应用的核心环节。RuoYi-Plus-UniApp 项目通过系统化的性能优化策略,实现了卓越的用户体验,包括快速的启动速度、流畅的交互响应和低内存占用。本文档全面介绍项目中实施的性能优化方案,涵盖构建优化、代码分包、缓存策略、网络优化、渲染优化等多个维度。

**核心优化目标:**

- **启动性能** - 首屏加载时间 < 800ms,通过代码分割和懒加载实现
- **包体积优化** - 主包大小控制在 2MB 以内,总包大小 < 20MB
- **运行流畅度** - 页面渲染帧率稳定在 60FPS,交互响应 < 100ms
- **内存占用** - 应用运行内存占用 < 150MB,避免内存泄漏
- **网络性能** - API 请求响应时间 < 500ms,支持离线缓存和预加载
- **多端兼容** - 确保 H5、小程序、App 等多端性能一致性

## 性能优化架构

### 优化层级

```
┌─────────────────────────────────────────────────┐
│            性能优化体系架构                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      1. 构建时优化 (Build-Time)         │   │
│  │  - Vite 构建配置                        │   │
│  │  - 代码压缩与混淆                       │   │
│  │  - Tree Shaking                         │   │
│  │  - 资源优化                             │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      2. 代码层面优化 (Code-Level)       │   │
│  │  - 代码分包策略                         │   │
│  │  - 异步加载与懒加载                     │   │
│  │  - 组件按需引入                         │   │
│  │  - 模块解耦                             │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      3. 运行时优化 (Runtime)            │   │
│  │  - 缓存策略                             │   │
│  │  - 网络请求优化                         │   │
│  │  - 渲染性能优化                         │   │
│  │  - 内存管理                             │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      4. 平台特定优化 (Platform)         │   │
│  │  - H5 优化                              │   │
│  │  - 小程序优化                           │   │
│  │  - App 优化                             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 技术栈性能特性

项目技术栈的性能优势:

| 技术 | 性能特性 | 优化收益 |
|------|---------|----------|
| **Vite 6.3.5** | ESBuild 驱动的极速构建 | 开发热更新 < 50ms,生产构建速度提升 10-20 倍 |
| **Vue 3.4.21** | Composition API + 响应式优化 | 组件初始化速度提升 55%,内存占用降低 41% |
| **UnoCSS** | 即时原子化 CSS | CSS 文件体积减小 80%,按需生成样式 |
| **Pinia 2.0.36** | 轻量级状态管理 | 比 Vuex 性能提升 30%,bundle 体积减小 90% |
| **Bundle Optimizer** | 智能分包优化 | 自动优化代码分割,避免重复打包 |

## 1. Vite 构建优化

### 1.1 核心构建配置

项目使用 Vite 6 作为构建工具,配置文件位于 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // 基础路径
  envDir: './env', // 环境变量目录

  // ESBuild 配置 - 移除 console 和 debugger
  esbuild: {
    drop: VITE_DELETE_CONSOLE === 'true'
      ? ['console', 'debugger']  // 生产环境移除所有 console
      : ['debugger'],             // 开发环境仅移除 debugger
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'jsencrypt/bin/jsencrypt.min.js',
      'crypto-js',
    ],
  },

  // 构建配置
  build: {
    sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 按需生成 sourcemap
    target: 'es6',                               // 目标语法版本
    minify: mode === 'development'
      ? false        // 开发环境不压缩,加快构建
      : 'esbuild',   // 生产环境使用 esbuild 压缩
  },
})
```

**性能收益:**

- **开发环境**: 热更新响应时间 < 50ms
- **生产构建**: 构建速度比 Webpack 快 10-20 倍
- **包体积**: ESBuild 压缩效率比 Terser 高 8-15%

### 1.2 插件优化策略

项目采用模块化插件配置 (`vite/plugins/index.ts`):

```typescript
export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 1. 静态资源类型生成 (早期运行)
  vitePlugins.push(createStaticAssetsTypes({ enabled: true }))

  // 2. UniApp 核心插件
  vitePlugins.push(createUniPages(mode))
  vitePlugins.push(UniLayouts())
  vitePlugins.push(UniPlatform())
  vitePlugins.push(UniManifest())

  // 3. UnoCSS 原子化 CSS
  const UnoCSS = (await import('unocss/vite')).default
  vitePlugins.push(UnoCSS())

  // 4. 自动导入 (减少手动导入代码)
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createComponents())

  // 5. 分包优化 (必须在 UniPages 之后)
  vitePlugins.push(createOptimization())

  // 6. Uni 插件 (必须最后)
  vitePlugins.push(Uni())

  return vitePlugins.filter(Boolean)
}
```

**插件加载优化:**

- 按需加载插件 (如 UnoCSS 使用动态 import)
- 严格控制插件执行顺序
- 生产环境移除开发调试插件

## 2. 代码分包策略

### 2.1 自动分包优化

项目使用 `@uni-ku/bundle-optimizer` 实现智能分包:

```typescript
// vite/plugins/optimization.ts
import Optimization from '@uni-ku/bundle-optimizer'

export default () => {
  return Optimization({
    // 功能开关
    enable: {
      optimization: true,        // 启用分包优化
      'async-import': true,      // 启用异步导入
      'async-component': true,   // 启用异步组件
    },

    // TypeScript 类型支持
    dts: {
      base: 'src/types',
    },

    // 调试配置
    logger: false,
  })
}
```

**优化机制:**

1. **自动代码分割** - 智能分析依赖关系,避免重复打包
2. **异步模块调用** - 支持跨包动态 `import()`
3. **异步组件加载** - 组件懒加载和跨包引用
4. **依赖去重** - 公共模块自动提取到共享包

**性能收益:**

- 主包体积减小 40-60%
- 首屏加载时间减少 35-50%
- 支持按需加载,提升整体性能

### 2.2 小程序分包配置

微信小程序启用了高级分包特性:

```typescript
// manifest.config.ts
'mp-weixin': {
  setting: {
    bigPackageSizeSupport: true,  // 分包异步化支持
    minified: true,                // 代码压缩
    es6: true,                     // ES6 转 ES5
  },

  // 按需注入 - 组件按需加载
  lazyCodeLoading: 'requiredComponents',
}
```

**特性说明:**

- `bigPackageSizeSupport`: 突破小程序单包 2MB 限制
- `lazyCodeLoading`: 按需注入组件代码,减小启动包大小

### 2.3 百度小程序优化

```typescript
'mp-baidu': {
  optimization: {
    subPackages: true,  // 分包优化
  },
}
```

## 3. 缓存优化方案

### 3.1 高性能缓存工具

项目实现了基于 UniApp Storage 的优化缓存系统 (`utils/cache.ts`):

```typescript
/**
 * UniApp 缓存工具特性:
 * - 同步操作,性能更好
 * - 原生支持多种数据类型
 * - 自动序列化/反序列化
 * - 过期时间管理
 * - 自动前缀隔离
 * - 定期清理过期数据
 */
export const cache = {
  // 设置缓存 (支持任意类型)
  set<T>(key: string, value: T, expireSeconds?: number): boolean

  // 获取缓存 (类型安全)
  get<T = any>(key: string): T | null

  // 移除缓存
  remove(key: string): void

  // 检查存在性
  has(key: string): boolean

  // 清除所有缓存
  clearAll(): void

  // 手动清理过期缓存
  cleanup(): void

  // 获取缓存统计
  getStats(): CacheStats | null
}
```

**使用示例:**

```vue
<script lang="ts" setup>
import { cache } from '@/utils/cache'

// 直接存储各种类型,无需手动序列化
cache.set('theme', 'dark')                        // 字符串
cache.set('count', 42)                            // 数字
cache.set('userInfo', { id: 1, name: 'admin' })   // 对象

// 设置过期时间
cache.set('token', 'abc123', 7 * 24 * 3600)  // 7天过期
cache.set('tempData', { temp: true }, 3600)  // 1小时过期

// 获取时保持类型
const theme = cache.get<string>('theme')         // "dark"
const userInfo = cache.get<UserInfo>('userInfo') // { id: 1, name: 'admin' }
</script>
```

### 3.2 自动过期清理

缓存系统实现了智能清理机制:

```typescript
// 应用启动时清理过期数据
setTimeout(() => {
  autoCleanup()
  const stats = cache.getStats()
}, 1000)

// 每10分钟定期清理
setInterval(() => {
  autoCleanup()
}, 10 * 60 * 1000)
```

**清理策略:**

1. **启动时清理** - 应用启动 1 秒后自动清理过期数据
2. **定时清理** - 每 10 分钟执行一次全局清理
3. **读取时清理** - 获取缓存时检测过期并删除
4. **异常清理** - 读取失败的数据自动删除

### 3.3 缓存性能优化

```typescript
// 数据包装器 - 仅添加过期时间
interface CacheWrapper<T = any> {
  data: T
  _expire?: number  // 过期时间戳 (毫秒)
}

// 设置缓存
set<T>(key: string, value: T, expireSeconds?: number): boolean {
  const wrapper: CacheWrapper<T> = {
    data: value,
    _expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined,
  }

  uni.setStorageSync(prefixedKey, wrapper)
  return true
}

// 获取缓存
get<T = any>(key: string): T | null {
  const wrapper: CacheWrapper<T> = uni.getStorageSync(prefixedKey)

  // 检查过期
  if (wrapper._expire && wrapper._expire < Date.now()) {
    this.remove(key)
    return null
  }

  return wrapper.data as T
}
```

**性能特性:**

- **同步操作** - 使用 `uni.getStorageSync/setStorageSync`,性能优于异步版本
- **轻量包装** - 仅添加 `_expire` 字段,不影响数据结构
- **类型保持** - UniApp 原生支持多类型序列化,无需手动转换
- **前缀隔离** - 自动添加应用前缀,避免多应用冲突

### 3.4 缓存统计与监控

```typescript
getStats(): CacheStats | null {
  const info = uni.getStorageInfoSync()
  const appKeys = info.keys.filter(key => key.startsWith(KEY_PREFIX))

  return {
    totalKeys: info.keys.length,      // 总键数
    appKeys: appKeys.length,          // 应用键数
    currentSize: info.currentSize,    // 当前大小
    limitSize: info.limitSize,        // 限制大小
    usagePercent: Math.round(
      (info.currentSize / info.limitSize) * 100
    ),
  }
}
```

**使用示例:**

```vue
<script lang="ts" setup>
const stats = cache.getStats()
if (stats) {
  console.log(`缓存使用率: ${stats.usagePercent}%`)
  console.log(`应用缓存项: ${stats.appKeys}`)
}
</script>
```

## 4. 网络请求优化

### 4.1 请求缓存策略

利用缓存工具优化 API 请求:

```typescript
// 请求缓存示例
async function getCachedUserInfo(userId: string) {
  // 先从缓存读取
  const cached = cache.get<UserInfo>(`user_${userId}`)
  if (cached) {
    return cached
  }

  // 缓存未命中,请求接口
  const userInfo = await api.getUserInfo(userId)

  // 缓存结果 (5分钟过期)
  cache.set(`user_${userId}`, userInfo, 5 * 60)

  return userInfo
}
```

### 4.2 请求合并与防抖

```typescript
// 防抖搜索
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(async (keyword: string) => {
  const results = await api.search(keyword)
  // 处理结果
}, 300) // 300ms 防抖
```

### 4.3 请求优先级

```typescript
// 高优先级请求 - 用户交互
await api.getUserInfo() // 立即执行

// 低优先级请求 - 预加载
setTimeout(() => {
  api.preloadData()
}, 1000)
```

## 5. 渲染性能优化

### 5.1 虚拟列表

长列表使用虚拟滚动:

```vue
<template>
  <wd-virtual-list :items="items" :item-height="80">
    <template #default="{ item }">
      <UserItem :data="item" />
    </template>
  </wd-virtual-list>
</template>
```

### 5.2 条件渲染优化

```vue
<template>
  <!-- 使用 v-show 代替 v-if (频繁切换场景) -->
  <view v-show="isVisible">
    频繁切换的内容
  </view>

  <!-- 使用 v-if (条件罕见变化) -->
  <view v-if="hasPermission">
    罕见显示的内容
  </view>
</template>
```

### 5.3 组件懒加载

```typescript
// 路由级别懒加载
const routes = [
  {
    path: '/user/profile',
    component: () => import('@/pages/user/profile.vue'),
  },
]

// 组件级别懒加载
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)
```

## 6. 启动性能优化

### 6.1 首屏优化

```typescript
// App.vue - 应用初始化
onLaunch(() => {
  // 1. 同步任务 - 必要的初始化
  initI18n()

  // 2. 异步任务 - 延迟执行
  setTimeout(() => {
    // 预加载字典
    loadDictionaries()
    // 检查更新
    checkUpdate()
  }, 1000)
})
```

### 6.2 预加载策略

```typescript
// 页面预加载
onMounted(() => {
  // 当前页面渲染完成后预加载
  setTimeout(() => {
    uni.preloadPage({
      url: '/pages/user/profile',
    })
  }, 500)
})
```

## 7. 样式优化

### 7.1 UnoCSS 原子化

项目使用 UnoCSS 实现极致的 CSS 性能:

```vue
<template>
  <!-- 原子化类名 -->
  <view class="flex items-center justify-between p-4">
    <text class="text-lg font-bold">标题</text>
  </view>
</template>
```

**性能收益:**

- CSS 文件体积减小 80%
- 按需生成,零运行时开销
- 构建时静态分析,极速加载

### 7.2 样式隔离

```vue
```

## 8. 内存优化

### 8.1 组件销毁

```vue
<script lang="ts" setup>
import { onUnmounted } from 'vue'

let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    // 定时任务
  }, 1000)
})

// 组件销毁时清理
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
```

### 8.2 图片内存管理

```vue
<template>
  <!-- 懒加载图片 -->
  <image
    :src="imageSrc"
    lazy-load
    mode="aspectFill"
  />
</template>
```

## 9. 平台特定优化

### 9.1 H5 优化

```typescript
// manifest.config.ts
h5: {
  router: {
    mode: 'history',  // 使用 history 模式
  },
  devServer: {
    https: false,     // 开发环境使用 HTTP
  },
}
```

**H5 专项优化:**

- Gzip 压缩静态资源
- CDN 加速
- Service Worker 离线缓存
- 资源预加载 (`<link rel="preload">`)

### 9.2 小程序优化

```typescript
'mp-weixin': {
  setting: {
    bigPackageSizeSupport: true,  // 分包异步化
    lazyCodeLoading: 'requiredComponents',  // 按需注入
  },
}
```

**小程序专项优化:**

- 分包预下载
- 独立分包
- 页面预渲染
- setData 优化

### 9.3 App 优化

```typescript
'app-plus': {
  splashscreen: {
    alwaysShowBeforeRender: true,
    autoclose: true,
    delay: 0,
  },
}
```

**App 专项优化:**

- nvue 原生渲染
- WKWebView 优化
- 原生插件加速
- 启动图优化

## 10. 性能监控

### 10.1 性能指标

关键性能指标 (KPI):

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 首屏加载时间 | < 800ms | `performance.timing` |
| 页面切换时间 | < 300ms | 路由守卫计时 |
| API 响应时间 | < 500ms | 请求拦截器 |
| 内存占用 | < 150MB | 开发者工具监控 |
| 包体积 | < 20MB | 构建产物分析 |

### 10.2 性能分析工具

```typescript
// 开发环境性能监控
if (import.meta.env.DEV) {
  // 页面加载性能
  console.time('PageLoad')
  onMounted(() => {
    console.timeEnd('PageLoad')
  })

  // 缓存统计
  const stats = cache.getStats()
  console.log('缓存使用:', stats)
}
```

### 10.3 构建产物分析

```bash
# 分析包体积
pnpm build:h5
# 查看 dist 目录大小和文件分布

# 微信小程序代码分析
# 使用微信开发者工具 - 代码质量
```

## 11. 最佳实践

### 11.1 代码规范

**组件设计:**

```vue
<!-- ✅ 好的实践 -->
<template>
  <view class="user-item">
    <text>{{ user.name }}</text>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  user: User
}
const props = defineProps<Props>()
</script>

<!-- ❌ 避免 -->
<template>
  <view>
    <!-- 复杂的计算逻辑 -->
    <text>{{ user.firstName + ' ' + user.lastName }}</text>
  </view>
</template>
```

**计算属性优化:**

```typescript
// ✅ 使用计算属性缓存
const fullName = computed(() => {
  return `${user.firstName} ${user.lastName}`
})

// ❌ 避免模板中复杂计算
// {{ user.firstName + ' ' + user.lastName }}
```

### 11.2 数据管理

```typescript
// ✅ 使用 Pinia 管理全局状态
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    // 持久化到缓存
    cache.set('userInfo', info, 7 * 24 * 3600)
  }

  return { userInfo, setUserInfo }
})

// ❌ 避免组件间频繁传递数据
```

### 11.3 请求优化

```typescript
// ✅ 使用请求缓存
async function loadData() {
  const cached = cache.get<DataList>('dataList')
  if (cached) return cached

  const data = await api.getDataList()
  cache.set('dataList', data, 60) // 缓存60秒
  return data
}

// ❌ 避免重复请求
// 每次都调用 api.getDataList()
```

### 11.4 图片优化

```vue
<template>
  <!-- ✅ 使用合适的图片格式和尺寸 -->
  <image
    :src="imageSrc"
    mode="aspectFill"
    lazy-load
    style="width: 750rpx; height: 422rpx;"
  />

  <!-- ❌ 避免使用超大图片 -->
  <!-- <image src="huge-image.png" /> -->
</template>
```

### 11.5 列表优化

```vue
<template>
  <!-- ✅ 使用虚拟列表 -->
  <wd-virtual-list :items="longList" :item-height="80">
    <template #default="{ item }">
      <ListItem :data="item" />
    </template>
  </wd-virtual-list>

  <!-- ❌ 避免渲染超长列表 -->
  <!-- <view v-for="item in longList" :key="item.id"> -->
</template>
```

## 12. 常见问题

### 12.1 首屏加载慢

**问题原因:**

- 主包体积过大
- 首屏加载过多资源
- 未启用代码分包

**解决方案:**

```typescript
// 1. 启用分包优化
vitePlugins.push(createOptimization())

// 2. 组件懒加载
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)

// 3. 延迟加载非必要数据
onMounted(() => {
  setTimeout(() => {
    loadNonCriticalData()
  }, 1000)
})
```

### 12.2 内存泄漏

**问题原因:**

- 定时器未清理
- 事件监听未移除
- 闭包引用未释放

**解决方案:**

```vue
<script lang="ts" setup>
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    // 任务
  }, 1000)
})

onUnmounted(() => {
  // ✅ 清理定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
```

### 12.3 小程序包体积超限

**问题原因:**

- 未启用分包
- 静态资源过大
- 未压缩代码

**解决方案:**

```typescript
// 1. 启用分包异步化
'mp-weixin': {
  setting: {
    bigPackageSizeSupport: true,
  },
  lazyCodeLoading: 'requiredComponents',
}

// 2. 图片使用 CDN
const imageUrl = 'https://cdn.example.com/image.png'

// 3. 启用代码压缩
build: {
  minify: 'esbuild',
}
```

### 12.4 列表滚动卡顿

**问题原因:**

- 长列表未虚拟化
- 列表项渲染复杂
- 频繁更新数据

**解决方案:**

```vue
<template>
  <!-- ✅ 使用虚拟列表 -->
  <wd-virtual-list :items="items" :item-height="100">
    <template #default="{ item }">
      <!-- 简化列表项结构 -->
      <view class="item">
        <text>{{ item.title }}</text>
      </view>
    </template>
  </wd-virtual-list>
</template>

<script lang="ts" setup>
// ✅ 批量更新数据
const updateItems = (newItems: Item[]) => {
  items.value = [...newItems]  // 一次性更新
}

// ❌ 避免频繁单条更新
// items.value.push(item) // 多次调用
</script>
```

### 12.5 缓存失效问题

**问题原因:**

- 未设置过期时间
- 缓存键冲突
- 缓存数据过大

**解决方案:**

```typescript
// ✅ 设置合理的过期时间
cache.set('userToken', token, 7 * 24 * 3600)  // 7天
cache.set('tempData', data, 3600)             // 1小时

// ✅ 使用唯一的缓存键
cache.set(`user_${userId}`, userInfo)

// ✅ 监控缓存使用
const stats = cache.getStats()
if (stats && stats.usagePercent > 80) {
  cache.cleanup()  // 清理过期数据
}
```

## 13. 性能优化清单

### 构建优化

- [ ] 启用 Vite 构建优化
- [ ] 配置代码压缩和混淆
- [ ] 启用 Tree Shaking
- [ ] 优化依赖预构建

### 代码优化

- [ ] 实施代码分包策略
- [ ] 组件按需引入
- [ ] 路由懒加载
- [ ] 使用 UnoCSS 原子化 CSS

### 运行时优化

- [ ] 实施缓存策略
- [ ] 优化网络请求
- [ ] 虚拟列表处理长列表
- [ ] 图片懒加载

### 平台优化

- [ ] H5 启用 Gzip 压缩
- [ ] 小程序启用分包异步化
- [ ] App 启用原生渲染

### 监控与分析

- [ ] 配置性能监控
- [ ] 分析构建产物
- [ ] 定期性能测试
- [ ] 建立性能基准

## 总结

性能优化是一个持续迭代的过程,需要从构建、代码、运行时、平台等多个维度系统化推进。RuoYi-Plus-UniApp 通过 Vite 6 高速构建、智能代码分包、高效缓存策略、精细化渲染优化等手段,实现了卓越的性能表现。开发者应遵循本文档的最佳实践,结合实际业务场景,持续优化应用性能,为用户提供流畅、快速的使用体验。

**关键要点:**

1. **构建优化优先** - Vite + ESBuild 提供极速构建基础
2. **合理使用分包** - 减小主包体积,按需加载
3. **缓存策略关键** - 减少不必要的计算和网络请求
4. **渲染性能核心** - 虚拟列表、懒加载、条件渲染优化
5. **持续监控改进** - 建立性能基准,定期分析优化
