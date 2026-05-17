# 包体积优化

## 介绍

包体积优化是 UniApp 应用性能提升的关键环节,直接影响应用下载速度、安装时间和首屏加载性能。RuoYi-Plus-UniApp 项目通过系统化的体积优化策略,包括代码压缩、Tree Shaking、资源优化、条件编译等多种技术手段,成功将主包体积控制在 2MB 以内,总包大小优化至 4MB 左右,相比优化前减小了 60% 以上,显著提升了用户体验。

**优化目标:**

- **主包体积** - < 2MB (满足小程序主包限制)
- **总包体积** - < 5MB (H5)、< 20MB (微信小程序)
- **首屏资源** - < 500KB (首次加载的 JS + CSS)
- **图片资源** - 使用 CDN,本地图片 < 100KB
- **字体文件** - 按需加载,单个字体 < 200KB
- **第三方库** - 仅引入必要模块,避免全量导入

## 体积优化架构

```text
┌─────────────────────────────────────────────────┐
│            包体积优化策略                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      1. 代码优化 (40-50% 优化)          │   │
│  │  - 代码压缩 (ESBuild/Terser)            │   │
│  │  - Tree Shaking                         │   │
│  │  - 死代码消除                           │   │
│  │  - 按需导入                             │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      2. 资源优化 (30-40% 优化)          │   │
│  │  - 图片压缩和 CDN                       │   │
│  │  - 字体裁剪                             │   │
│  │  - SVG 优化                             │   │
│  │  - 静态资源去重                         │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      3. 依赖优化 (15-20% 优化)          │   │
│  │  - 第三方库按需引入                     │   │
│  │  - 替换轻量级库                         │   │
│  │  - 移除未使用依赖                       │   │
│  │  - 版本优化                             │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      4. 构建优化 (5-10% 优化)           │   │
│  │  - 分包策略                             │   │
│  │  - 条件编译                             │   │
│  │  - Polyfill 按需引入                    │   │
│  │  - 生产环境优化                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 1. 代码压缩优化

### 1.1 ESBuild 压缩

项目使用 ESBuild 进行代码压缩:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 使用 esbuild 压缩 (比 Terser 快 20-40 倍)
    minify: 'esbuild',

    // 目标环境
    target: 'es6',

    // 移除 console 和 debugger
    esbuild: {
      drop: mode === 'production'
        ? ['console', 'debugger']
        : ['debugger'],
    },
  },
})
```

**压缩效果:**

- 代码体积减小 30-40%
- 构建速度比 Terser 快 20-40 倍
- 保持代码可读性 (可选)

### 1.2 移除 Console

生产环境自动移除 console:

```typescript
// ✅ 开发环境:保留 console
console.log('调试信息')
console.error('错误信息')

// ✅ 生产环境:自动移除
// (构建时被 esbuild 移除)
```

**配置:**

```typescript
esbuild: {
  drop: VITE_DELETE_CONSOLE === 'true'
    ? ['console', 'debugger']  // 移除所有 console
    : ['debugger'],             // 仅移除 debugger
}
```

### 1.3 代码拆分

合理的代码拆分策略:

```typescript
build: {
  rollupOptions: {
    output: {
      // 手动分包
      manualChunks(id) {
        // 第三方库单独打包
        if (id.includes('node_modules')) {
          // 大型库独立打包
          if (id.includes('pinia')) {
            return 'vendor-pinia'
          }
          // 其他第三方库
          return 'vendor'
        }

        // 分包代码独立打包
        if (id.includes('pages-sub/admin')) {
          return 'admin'
        }
      },
    },
  },
}
```

## 2. Tree Shaking

### 2.1 ES Module 导入

使用 ES Module 支持 Tree Shaking:

```typescript
// ❌ 避免:CommonJS 导入 (无法 Tree Shaking)
const utils = require('@/utils')

// ✅ 推荐:ES Module 导入
import { formatDate, formatMoney } from '@/utils/format'
```

### 2.2 按需导入

**工具函数按需导入:**

```typescript
// utils/index.ts
export { formatDate } from './date'
export { formatMoney } from './money'
export { validateEmail } from './validate'

// 使用时
import { formatDate } from '@/utils'  // ✅ 只打包 formatDate
```

**第三方库按需导入:**

```typescript
// ❌ 避免:全量导入
import * as _ from 'lodash'

// ✅ 推荐:按需导入
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

// ✅ 更好:使用 lodash-es (支持 Tree Shaking)
import { debounce, throttle } from 'lodash-es'
```

### 2.3 移除未使用代码

```typescript
// ❌ 避免:导入但未使用
import { unusedFunc } from '@/utils'  // Tree Shaking 会移除

// ✅ 推荐:只导入使用的
import { formatDate } from '@/utils'
console.log(formatDate(new Date()))
```

## 3. 图片资源优化

### 3.1 图片使用策略

**图片分类处理:**

| 图片类型 | 大小 | 处理方式 | 示例 |
|---------|------|---------|------|
| **图标** | < 5KB | Base64 内联 | 小图标、Logo |
| **小图** | 5-50KB | 本地存储 + 压缩 | 占位图、默认头像 |
| **中图** | 50-200KB | CDN 加载 | Banner、商品图 |
| **大图** | > 200KB | CDN + 懒加载 | 详情大图、背景图 |

**实现示例:**

```vue
<template>
  <!-- 小图标:Base64 内联 -->
  <image
    src="data:image/png;base64,iVBORw0KG..."
    style="width: 40rpx; height: 40rpx;"
  />

  <!-- 本地小图:压缩后存储 -->
  <image
    src="@/static/images/avatar-default.png"
    style="width: 80rpx; height: 80rpx;"
  />

  <!-- CDN 图片:懒加载 -->
  <image
    :src="cdnUrl + '/banner.jpg'"
    lazy-load
    mode="aspectFill"
  />
</template>

<script lang="ts" setup>
const cdnUrl = 'https://cdn.example.com'
</script>
```

### 3.2 图片压缩

**压缩工具:**

- **TinyPNG** - 在线压缩,无损压缩率 60-70%
- **ImageOptim** - Mac 本地压缩工具
- **squoosh.app** - Google 在线压缩工具

**压缩配置:**

```json
{
  "compilerOptions": {
    "imagemin": {
      "png": {
        "quality": [0.7, 0.9]
      },
      "jpg": {
        "quality": 80
      }
    }
  }
}
```

### 3.3 WebP 格式

使用 WebP 格式减小体积:

```vue
<template>
  <image
    :src="imageUrl"
    mode="aspectFill"
  />
</template>

<script lang="ts" setup>
// 根据平台返回不同格式
const imageUrl = computed(() => {
  const base = 'https://cdn.example.com/banner'

  // #ifdef H5
  return `${base}.webp`  // H5 支持 WebP
  // #endif

  // #ifdef MP-WEIXIN
  return `${base}.jpg`   // 小程序使用 JPG
  // #endif
})
</script>
```

**WebP 优势:**

- 体积比 JPG 小 25-35%
- 体积比 PNG 小 45-50%
- 支持透明度和动画

### 3.4 图片懒加载

```vue
<template>
  <view class="image-list">
    <image
      v-for="img in images"
      :key="img.id"
      :src="img.url"
      lazy-load
      mode="aspectFill"
      @load="onImageLoad"
      @error="onImageError"
    />
  </view>
</template>

<script lang="ts" setup>
const onImageLoad = () => {
  console.log('图片加载完成')
}

const onImageError = () => {
  console.error('图片加载失败')
  // 显示占位图
}
</script>
```

## 4. 第三方库优化

### 4.1 依赖分析

分析依赖大小:

```bash
# 分析依赖
pnpm list --depth=0

# 查看依赖大小
npm list --depth=0 --json | jq '.dependencies | to_entries | map({key: .key, size: .value}) | sort_by(.size)'
```

### 4.2 轻量级替代

使用轻量级库替代大型库:

| 原库 | 大小 | 替代库 | 大小 | 优化 |
|------|------|--------|------|------|
| **moment.js** | 232KB | day.js | 7KB | -96% |
| **lodash** | 531KB | lodash-es | 按需 | -80% |
| **axios** | 13KB | ky | 9KB | -30% |
| **validator** | 86KB | 自实现 | 2KB | -97% |

**替换示例:**

```typescript
// ❌ 使用 moment.js
import moment from 'moment'
moment().format('YYYY-MM-DD')

// ✅ 使用 day.js
import dayjs from 'dayjs'
dayjs().format('YYYY-MM-DD')
```

### 4.3 移除未使用依赖

检查并移除未使用的依赖:

```bash
# 检查未使用依赖
npx depcheck

# 移除未使用依赖
pnpm remove unused-package
```

### 4.4 Polyfill 按需引入

```typescript
// ❌ 避免:引入所有 Polyfill
import 'core-js'

// ✅ 推荐:按需引入
import 'core-js/es/promise'
import 'core-js/es/array/find'
```

## 5. 字体优化

### 5.1 字体裁剪

只保留需要的字符:

```bash
# 使用 fontmin 裁剪字体
npx fontmin input.ttf --text="常用汉字列表" --output=output.ttf
```

**裁剪效果:**

- 完整字体: 5-10MB
- 裁剪后: 50-200KB
- 优化率: 95-98%

### 5.2 字体格式

使用现代字体格式:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2'),  /* 最小,首选 */
       url('font.woff') format('woff'),    /* 次选 */
       url('font.ttf') format('truetype'); /* 降级 */
}
```

**格式对比:**

- **WOFF2**: 最小,压缩率最高
- **WOFF**: 兼容性好
- **TTF**: 体积大,降级使用

### 5.3 图标字体优化

```typescript
// 使用 Iconify 按需加载图标
import { Icon } from '@iconify/vue'

// ✅ 按需加载
<Icon icon="mdi:home" />

// 替代全量图标字体
// ❌ Font Awesome 完整包: 700KB+
```

## 6. CSS 优化

### 6.1 UnoCSS 原子化

项目使用 UnoCSS 实现极致的 CSS 优化:

```vue
<template>
  <!-- 原子化类名 -->
  <view class="flex items-center justify-between p-4 bg-white">
    <text class="text-lg font-bold text-gray-900">标题</text>
  </view>
</template>
```

**优化效果:**

- CSS 体积减小 80-90%
- 按需生成,零冗余
- 构建时静态分析

### 6.2 移除未使用 CSS

```typescript
// vite.config.ts
import { PurgeCSS } from 'purgecss'

export default defineConfig({
  build: {
    // 移除未使用的 CSS
    cssCodeSplit: true,
  },
})
```

### 6.3 CSS 压缩

```typescript
build: {
  // CSS 压缩
  cssMinify: 'esbuild',
}
```

## 7. 条件编译

### 7.1 平台差异化

根据平台编译不同代码:

```vue
<script lang="ts" setup>
// 微信小程序专用代码
// #ifdef MP-WEIXIN
import { wxPay } from '@/utils/wx-pay'
const handlePay = () => wxPay()
// #endif

// H5 专用代码
// #ifdef H5
import { h5Pay } from '@/utils/h5-pay'
const handlePay = () => h5Pay()
// #endif

// App 专用代码
// #ifdef APP-PLUS
import { appPay } from '@/utils/app-pay'
const handlePay = () => appPay()
// #endif
</script>
```

### 7.2 环境差异化

```typescript
// 生产环境移除调试代码
// #ifdef DEV
console.log('开发环境调试信息')
// #endif

// 仅生产环境执行
// #ifdef PROD
initPerformanceMonitor()
// #endif
```

### 7.3 功能开关

```typescript
// 可选功能按需编译
// #ifdef ENABLE_ANALYTICS
import Analytics from '@/plugins/analytics'
app.use(Analytics)
// #endif
```

## 8. 分包策略

### 8.1 主包最小化

主包仅保留核心功能:

```text
主包内容 (< 2MB):
✅ 首页、登录等核心页面
✅ UI 组件库 (WD UI)
✅ 公共工具函数
✅ 状态管理
✅ 路由配置

分包内容:
📦 管理功能 → pages-sub/admin/
📦 业务功能 → pages-sub/business/
```

### 8.2 按需加载

```vue
<script lang="ts" setup>
// 分包组件异步加载
const AdminPanel = defineAsyncComponent(
  () => import('@/pages-sub/admin/components/Panel.vue')
)

// 分包功能异步加载
const loadAdminUtils = async () => {
  const { validate } = await import('@/pages-sub/admin/utils')
  return validate()
}
</script>
```

### 8.3 分包预下载

```typescript
// pages.json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "wifi",  // 仅 WiFi 下预下载
      "packages": ["pages-sub/admin"]
    }
  }
}
```

## 9. 构建优化

### 9.1 生产环境配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 生产环境优化
    minify: 'esbuild',
    target: 'es6',

    // 移除 console
    esbuild: {
      drop: ['console', 'debugger'],
    },

    // CSS 代码分割
    cssCodeSplit: true,

    // 不生成 source map
    sourcemap: false,

    // chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
})
```

### 9.2 依赖预构建

```typescript
optimizeDeps: {
  include: [
    'vue',
    'pinia',
    '@vueuse/core',
  ],
  exclude: [
    'large-unused-package',
  ],
}
```

### 9.3 打包分析

```bash
# 生成打包分析报告
pnpm build:analyze

# 查看报告
# dist/stats.html
```

## 10. 性能监控

### 10.1 体积分析

```typescript
// 统计各模块大小
const getModuleSizes = () => {
  return {
    main: '1.8MB',
    vendor: '0.5MB',
    admin: '0.8MB',
    styles: '0.2MB',
    total: '3.3MB',
  }
}
```

### 10.2 构建日志

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 输出详细构建信息
    reportCompressedSize: true,

    rollupOptions: {
      output: {
        // 输出文件信息
        assetFileNames: (assetInfo) => {
          console.log(`Asset: ${assetInfo.name}, Size: ${assetInfo.source.length}`)
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
```

### 10.3 体积目标

设置体积预算:

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2mb",
      "maximumError": "3mb"
    },
    {
      "type": "allScript",
      "maximumWarning": "1.5mb",
      "maximumError": "2mb"
    }
  ]
}
```

## 11. 最佳实践

### 11.1 代码优化

```typescript
// ✅ 好的实践
import { formatDate } from '@/utils/date'

// ❌ 避免全量导入
import * as utils from '@/utils'

// ✅ 使用轻量级库
import dayjs from 'dayjs'

// ❌ 使用大型库
import moment from 'moment'
```

### 11.2 资源优化

```vue
<template>
  <!-- ✅ CDN 图片 -->
  <image :src="cdnUrl + '/banner.jpg'" />

  <!-- ❌ 本地大图 -->
  <!-- <image src="@/static/large-banner.jpg" /> -->

  <!-- ✅ 懒加载 -->
  <image :src="imageUrl" lazy-load />
</template>
```

### 11.3 依赖管理

```bash
# ✅ 定期检查依赖
pnpm outdated

# ✅ 移除未使用依赖
npx depcheck

# ✅ 使用轻量级替代
pnpm remove moment
pnpm add dayjs
```

## 12. 常见问题

### 12.1 打包体积过大

**问题原因:**

- 引入了大型第三方库
- 本地存储了大量图片
- 未启用代码压缩

**解决方案:**

```typescript
// 1. 分析打包产物
pnpm build:analyze

// 2. 替换大型库
pnpm remove lodash
pnpm add lodash-es

// 3. 图片使用 CDN
const imageUrl = 'https://cdn.example.com/image.jpg'

// 4. 启用压缩
build: {
  minify: 'esbuild',
}
```

### 12.2 Tree Shaking 不生效

**问题原因:**

- 使用 CommonJS 导入
- 库不支持 Tree Shaking
- 有副作用的模块

**解决方案:**

```typescript
// ✅ 使用 ES Module
import { func } from 'library'

// ❌ 避免 CommonJS
const { func } = require('library')

// 标记无副作用
// package.json
{
  "sideEffects": false
}
```

### 12.3 首屏资源过多

**问题原因:**

- 首屏加载了所有资源
- 未使用代码分割
- 未配置懒加载

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 组件懒加载
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)

// ✅ 数据懒加载
onMounted(() => {
  setTimeout(() => {
    loadNonCriticalData()
  }, 1000)
})
</script>
```

## 13. 优化清单

### 代码优化

- [ ] 启用 ESBuild 压缩
- [ ] 移除生产环境 console
- [ ] 使用 Tree Shaking
- [ ] 按需导入第三方库

### 资源优化

- [ ] 图片压缩和 CDN
- [ ] 字体裁剪
- [ ] WebP 格式图片
- [ ] 图片懒加载

### 依赖优化

- [ ] 使用轻量级库
- [ ] 移除未使用依赖
- [ ] Polyfill 按需引入
- [ ] 定期更新依赖

### 构建优化

- [ ] 配置代码分割
- [ ] 条件编译
- [ ] 分包策略
- [ ] 生产环境配置

### 监控优化

- [ ] 打包分析
- [ ] 体积预算
- [ ] 性能监控
- [ ] 定期优化

## 总结

包体积优化是一个持续迭代的过程,需要从代码、资源、依赖、构建等多个维度综合优化。RuoYi-Plus-UniApp 通过 ESBuild 压缩、Tree Shaking、图片 CDN、轻量级库替换、分包策略等手段,成功将包体积优化至极致,实现了快速下载和流畅加载。开发者应建立体积预算机制,定期分析打包产物,持续优化代码和资源,为用户提供轻量、高效的应用体验。

**关键要点:**

1. **代码压缩优先** - ESBuild 提供极速压缩,效果显著
2. **资源外置化** - 图片、字体使用 CDN,不打入包内
3. **按需导入** - Tree Shaking + ES Module,消除冗余代码
4. **轻量级替代** - 使用轻量级库,减小依赖体积
5. **持续监控** - 建立体积预算,定期分析优化

## 14. 高级优化技术

### 14.1 动态导入策略

使用动态导入实现按需加载：

```typescript
// utils/dynamicImport.ts
type ModuleLoader<T> = () => Promise<{ default: T }>

interface DynamicImportOptions {
  timeout?: number
  onError?: (error: Error) => void
}

/**
 * 带超时和错误处理的动态导入
 */
export const dynamicImport = async <T>(
  loader: ModuleLoader<T>,
  options: DynamicImportOptions = {}
): Promise<T> => {
  const { timeout = 10000, onError } = options

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('模块加载超时')), timeout)
  })

  try {
    const module = await Promise.race([loader(), timeoutPromise])
    return module.default
  } catch (error) {
    onError?.(error as Error)
    throw error
  }
}

// 使用示例
const loadChartModule = async () => {
  const Chart = await dynamicImport(
    () => import('@/components/Chart.vue'),
    {
      timeout: 5000,
      onError: (err) => console.error('图表模块加载失败:', err)
    }
  )
  return Chart
}
```

### 14.2 模块预加载

预加载即将使用的模块：

```typescript
// utils/preload.ts
const preloadedModules = new Map<string, Promise<any>>()

/**
 * 预加载模块
 */
export const preloadModule = (path: string, loader: () => Promise<any>) => {
  if (!preloadedModules.has(path)) {
    preloadedModules.set(path, loader())
  }
  return preloadedModules.get(path)!
}

/**
 * 获取预加载的模块
 */
export const getPreloadedModule = <T>(path: string): Promise<T> | null => {
  return preloadedModules.get(path) || null
}

// 使用示例:在用户浏览列表时预加载详情页模块
const onProductListVisible = () => {
  // 预加载商品详情页组件
  preloadModule('ProductDetail', () => import('@/pages/product/detail.vue'))

  // 预加载评论组件
  preloadModule('Comments', () => import('@/components/Comments.vue'))
}
```

### 14.3 代码分割边界

精细控制代码分割边界：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 精细控制 chunk 分割
        manualChunks(id) {
          // Vue 核心单独打包
          if (id.includes('node_modules/vue')) {
            return 'vue-core'
          }

          // Pinia 状态管理
          if (id.includes('pinia')) {
            return 'state-management'
          }

          // 工具函数库
          if (id.includes('lodash') || id.includes('dayjs')) {
            return 'utils-vendor'
          }

          // UI 组件库
          if (id.includes('wd-ui') || id.includes('wot-design')) {
            return 'ui-components'
          }

          // 业务分包
          if (id.includes('pages-sub/admin')) {
            return 'sub-admin'
          }

          if (id.includes('pages-sub/mall')) {
            return 'sub-mall'
          }

          // 其他 node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },

        // chunk 命名规则
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId || ''
          if (facadeModuleId.includes('pages-sub')) {
            return 'sub-packages/[name]-[hash].js'
          }
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
```

### 14.4 作用域提升

启用 Rollup 作用域提升优化：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      // 启用作用域提升
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
})
```

## 15. 平台专项优化

### 15.1 微信小程序优化

```typescript
// 微信小程序专属优化配置
// manifest.json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    },
    "usingComponents": true,
    "lazyCodeLoading": "requiredComponents",
    "setting": {
      "minified": true,
      "es6": true,
      "enhance": true
    }
  }
}
```

**小程序体积限制：**

| 类型 | 限制 | 优化策略 |
|------|------|---------|
| 主包 | 2MB | 核心页面 + 公共资源 |
| 单个分包 | 2MB | 业务功能独立分包 |
| 总包 | 20MB | 资源 CDN 化 |
| 插件 | 1MB | 精简插件功能 |

### 15.2 H5 优化

```typescript
// H5 专属优化
export default defineConfig({
  build: {
    // H5 使用更激进的压缩
    target: 'esnext',

    rollupOptions: {
      output: {
        // 启用 gzip 友好的分割
        experimentalMinChunkSize: 10000,
      },
    },
  },

  // H5 启用 HTTP/2 推送
  server: {
    headers: {
      'Link': '</assets/main.js>; rel=preload; as=script',
    },
  },
})
```

### 15.3 App 优化

```typescript
// App 专属优化配置
// manifest.json
{
  "app-plus": {
    "optimization": {
      "subPackages": true
    },
    "runmode": "liberate",
    "usingComponents": true,
    "compilerVersion": 3,
    "nvueCompiler": "uni-app",
    "nvueStyleCompiler": "uni-app"
  }
}
```

## 16. 资源压缩工具链

### 16.1 自动化图片压缩

```typescript
// scripts/compress-images.ts
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminWebp from 'imagemin-webp'
import { glob } from 'glob'
import path from 'path'

interface CompressionResult {
  original: number
  compressed: number
  savings: number
  path: string
}

const compressImages = async (
  inputDir: string,
  outputDir: string
): Promise<CompressionResult[]> => {
  const results: CompressionResult[] = []

  // PNG 压缩
  const pngFiles = await imagemin([`${inputDir}/**/*.png`], {
    destination: outputDir,
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 1,
      }),
    ],
  })

  // JPG 压缩
  const jpgFiles = await imagemin([`${inputDir}/**/*.{jpg,jpeg}`], {
    destination: outputDir,
    plugins: [
      imageminMozjpeg({
        quality: 75,
      }),
    ],
  })

  // 生成 WebP
  await imagemin([`${inputDir}/**/*.{jpg,jpeg,png}`], {
    destination: path.join(outputDir, 'webp'),
    plugins: [
      imageminWebp({
        quality: 75,
      }),
    ],
  })

  return results
}

// 运行压缩
compressImages('./src/static/images', './dist/images')
```

### 16.2 SVG 优化

```typescript
// scripts/optimize-svg.ts
import { optimize } from 'svgo'
import fs from 'fs'
import path from 'path'

const svgoConfig = {
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'cleanupIds',
    'removeUselessDefs',
    'cleanupNumericValues',
    'convertColors',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeViewBox',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortAttrs',
    'removeTitle',
    'removeDesc',
  ],
}

const optimizeSvg = (inputPath: string, outputPath: string) => {
  const svg = fs.readFileSync(inputPath, 'utf8')
  const result = optimize(svg, svgoConfig)
  fs.writeFileSync(outputPath, result.data)

  const originalSize = Buffer.byteLength(svg, 'utf8')
  const optimizedSize = Buffer.byteLength(result.data, 'utf8')
  const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2)

  console.log(`${path.basename(inputPath)}: ${originalSize}B -> ${optimizedSize}B (节省 ${savings}%)`)
}
```

### 16.3 字体子集化

```typescript
// scripts/subset-font.ts
import Fontmin from 'fontmin'
import path from 'path'

interface FontSubsetOptions {
  input: string
  output: string
  text?: string
  textFile?: string
}

const subsetFont = async (options: FontSubsetOptions) => {
  const { input, output, text, textFile } = options

  let subset = text || ''
  if (textFile) {
    subset = fs.readFileSync(textFile, 'utf8')
  }

  // 添加常用字符
  const commonChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const punctuation = ',.!?;:\'\"()[]{}@#$%^&*+-=<>/\\|`~'
  subset += commonChars + punctuation

  return new Promise((resolve, reject) => {
    const fontmin = new Fontmin()
      .src(input)
      .use(Fontmin.glyph({ text: subset }))
      .use(Fontmin.ttf2woff2())
      .use(Fontmin.ttf2woff())
      .dest(output)

    fontmin.run((err, files) => {
      if (err) {
        reject(err)
      } else {
        console.log('字体子集化完成:', files.map(f => f.path))
        resolve(files)
      }
    })
  })
}

// 使用示例
subsetFont({
  input: './fonts/SourceHanSansCN-Regular.ttf',
  output: './dist/fonts',
  textFile: './common-chars.txt',
})
```

## 17. 体积分析可视化

### 17.1 打包分析插件

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // 生成体积分析报告
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // sunburst, treemap, network
    }),
  ],
})
```

### 17.2 构建报告生成

```typescript
// scripts/build-report.ts
import fs from 'fs'
import path from 'path'
import { gzipSync, brotliCompressSync } from 'zlib'

interface FileStats {
  name: string
  size: number
  gzipSize: number
  brotliSize: number
}

interface BuildReport {
  timestamp: string
  totalSize: number
  totalGzipSize: number
  totalBrotliSize: number
  files: FileStats[]
}

const generateBuildReport = (distDir: string): BuildReport => {
  const files: FileStats[] = []
  let totalSize = 0
  let totalGzipSize = 0
  let totalBrotliSize = 0

  const processDir = (dir: string) => {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        processDir(fullPath)
      } else if (item.endsWith('.js') || item.endsWith('.css')) {
        const content = fs.readFileSync(fullPath)
        const size = content.length
        const gzipSize = gzipSync(content).length
        const brotliSize = brotliCompressSync(content).length

        files.push({
          name: path.relative(distDir, fullPath),
          size,
          gzipSize,
          brotliSize,
        })

        totalSize += size
        totalGzipSize += gzipSize
        totalBrotliSize += brotliSize
      }
    }
  }

  processDir(distDir)

  // 按大小排序
  files.sort((a, b) => b.size - a.size)

  return {
    timestamp: new Date().toISOString(),
    totalSize,
    totalGzipSize,
    totalBrotliSize,
    files,
  }
}

// 生成 HTML 报告
const generateHtmlReport = (report: BuildReport): string => {
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <title>构建报告 - ${report.timestamp}</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .size-bar { height: 20px; background: #4CAF50; }
  </style>
</head>
<body>
  <h1>构建报告</h1>
  <p>生成时间: ${report.timestamp}</p>

  <h2>总体统计</h2>
  <ul>
    <li>原始大小: ${formatBytes(report.totalSize)}</li>
    <li>Gzip 压缩: ${formatBytes(report.totalGzipSize)}</li>
    <li>Brotli 压缩: ${formatBytes(report.totalBrotliSize)}</li>
  </ul>

  <h2>文件详情</h2>
  <table>
    <tr>
      <th>文件</th>
      <th>原始</th>
      <th>Gzip</th>
      <th>Brotli</th>
      <th>占比</th>
    </tr>
    ${report.files.map(f => `
    <tr>
      <td>${f.name}</td>
      <td>${formatBytes(f.size)}</td>
      <td>${formatBytes(f.gzipSize)}</td>
      <td>${formatBytes(f.brotliSize)}</td>
      <td>
        <div class="size-bar" style="width: ${(f.size / report.totalSize * 100).toFixed(1)}%"></div>
      </td>
    </tr>
    `).join('')}
  </table>
</body>
</html>
  `
}

// 执行
const report = generateBuildReport('./dist')
const html = generateHtmlReport(report)
fs.writeFileSync('./dist/build-report.html', html)
console.log('构建报告已生成: dist/build-report.html')
```

### 17.3 体积趋势监控

```typescript
// scripts/size-tracker.ts
import fs from 'fs'

interface SizeRecord {
  date: string
  version: string
  mainBundle: number
  vendorBundle: number
  cssBundle: number
  totalAssets: number
}

const SIZE_HISTORY_FILE = './size-history.json'

const trackSize = (record: SizeRecord) => {
  let history: SizeRecord[] = []

  if (fs.existsSync(SIZE_HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(SIZE_HISTORY_FILE, 'utf8'))
  }

  history.push(record)

  // 保留最近 100 条记录
  if (history.length > 100) {
    history = history.slice(-100)
  }

  fs.writeFileSync(SIZE_HISTORY_FILE, JSON.stringify(history, null, 2))

  // 检查体积变化
  if (history.length >= 2) {
    const prev = history[history.length - 2]
    const current = history[history.length - 1]
    const diff = current.totalAssets - prev.totalAssets

    if (diff > 50 * 1024) {
      console.warn(`⚠️ 体积增长过大: +${(diff / 1024).toFixed(2)} KB`)
    } else if (diff < 0) {
      console.log(`✅ 体积减小: ${(Math.abs(diff) / 1024).toFixed(2)} KB`)
    }
  }
}

// 在 CI/CD 中调用
trackSize({
  date: new Date().toISOString().split('T')[0],
  version: process.env.VERSION || 'dev',
  mainBundle: 180 * 1024,
  vendorBundle: 120 * 1024,
  cssBundle: 45 * 1024,
  totalAssets: 345 * 1024,
})
```

## 18. 性能预算

### 18.1 预算配置

```typescript
// budgets.config.ts
interface Budget {
  type: 'bundle' | 'asset' | 'total'
  name: string
  maxSize: number // bytes
  warning: number // bytes
}

export const budgets: Budget[] = [
  // 主包预算
  {
    type: 'bundle',
    name: 'main',
    maxSize: 2 * 1024 * 1024, // 2MB
    warning: 1.5 * 1024 * 1024, // 1.5MB
  },

  // 第三方库预算
  {
    type: 'bundle',
    name: 'vendor',
    maxSize: 500 * 1024, // 500KB
    warning: 400 * 1024, // 400KB
  },

  // CSS 预算
  {
    type: 'asset',
    name: '*.css',
    maxSize: 100 * 1024, // 100KB
    warning: 80 * 1024, // 80KB
  },

  // 单个图片预算
  {
    type: 'asset',
    name: '*.{png,jpg,jpeg}',
    maxSize: 50 * 1024, // 50KB
    warning: 30 * 1024, // 30KB
  },

  // 总体积预算
  {
    type: 'total',
    name: 'all',
    maxSize: 5 * 1024 * 1024, // 5MB
    warning: 4 * 1024 * 1024, // 4MB
  },
]
```

### 18.2 预算检查

```typescript
// scripts/check-budget.ts
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { budgets } from './budgets.config'

interface BudgetResult {
  name: string
  budget: number
  actual: number
  status: 'pass' | 'warning' | 'fail'
}

const checkBudgets = async (distDir: string): Promise<BudgetResult[]> => {
  const results: BudgetResult[] = []

  for (const budget of budgets) {
    let actualSize = 0

    if (budget.type === 'total') {
      // 计算总体积
      const files = await glob(`${distDir}/**/*.{js,css,png,jpg,jpeg,woff2}`)
      for (const file of files) {
        actualSize += fs.statSync(file).size
      }
    } else {
      // 计算匹配文件体积
      const pattern = budget.name.includes('*')
        ? `${distDir}/**/${budget.name}`
        : `${distDir}/**/${budget.name}*`

      const files = await glob(pattern)
      for (const file of files) {
        actualSize += fs.statSync(file).size
      }
    }

    let status: 'pass' | 'warning' | 'fail' = 'pass'
    if (actualSize > budget.maxSize) {
      status = 'fail'
    } else if (actualSize > budget.warning) {
      status = 'warning'
    }

    results.push({
      name: budget.name,
      budget: budget.maxSize,
      actual: actualSize,
      status,
    })
  }

  return results
}

// 执行检查
const run = async () => {
  const results = await checkBudgets('./dist')

  console.log('\n📊 体积预算检查结果:\n')

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' :
                 result.status === 'warning' ? '⚠️' : '❌'
    const budget = (result.budget / 1024).toFixed(2)
    const actual = (result.actual / 1024).toFixed(2)

    console.log(`${icon} ${result.name}: ${actual}KB / ${budget}KB`)
  }

  const hasFailure = results.some(r => r.status === 'fail')
  if (hasFailure) {
    console.error('\n❌ 体积预算检查失败!')
    process.exit(1)
  }
}

run()
```

## 19. CI/CD 集成

### 19.1 GitHub Actions 配置

```yaml
# .github/workflows/build.yml
name: Build and Check Size

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Check bundle size
        run: pnpm size-check

      - name: Upload size report
        uses: actions/upload-artifact@v3
        with:
          name: size-report
          path: dist/build-report.html

      - name: Comment PR with size
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs')
            const report = JSON.parse(fs.readFileSync('./dist/size-report.json'))
            const totalKB = (report.totalSize / 1024).toFixed(2)

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `📦 构建体积: ${totalKB} KB`
            })
```

### 19.2 体积对比

```typescript
// scripts/size-compare.ts
interface SizeComparison {
  file: string
  before: number
  after: number
  diff: number
  percent: string
}

const compareSizes = (
  beforeDir: string,
  afterDir: string
): SizeComparison[] => {
  const comparisons: SizeComparison[] = []

  const afterFiles = fs.readdirSync(afterDir)
    .filter(f => f.endsWith('.js') || f.endsWith('.css'))

  for (const file of afterFiles) {
    const afterPath = path.join(afterDir, file)
    const afterSize = fs.statSync(afterPath).size

    // 尝试找到对应的 before 文件
    const beforeFile = fs.readdirSync(beforeDir)
      .find(f => f.startsWith(file.split('-')[0]))

    let beforeSize = 0
    if (beforeFile) {
      beforeSize = fs.statSync(path.join(beforeDir, beforeFile)).size
    }

    const diff = afterSize - beforeSize
    const percent = beforeSize > 0
      ? ((diff / beforeSize) * 100).toFixed(2) + '%'
      : 'new'

    comparisons.push({
      file,
      before: beforeSize,
      after: afterSize,
      diff,
      percent,
    })
  }

  return comparisons.sort((a, b) => b.diff - a.diff)
}
```

## 20. 更多常见问题

### 20.1 CSS 体积过大

**问题原因：**
- 未使用 UnoCSS 等原子化方案
- 引入了完整的 UI 库样式
- 存在大量未使用的 CSS

**解决方案：**

```typescript
// 1. 使用 UnoCSS 原子化
// uno.config.ts
export default defineConfig({
  presets: [presetUni()],
  transformers: [transformerDirectives()],
})

// 2. 按需引入组件样式
import 'wot-design-uni/components/wd-button/wd-button.scss'

// 3. PurgeCSS 移除未使用样式
build: {
  postcss: {
    plugins: [
      purgecss({
        content: ['./src/**/*.vue', './src/**/*.ts'],
      }),
    ],
  },
}
```

### 20.2 JSON 数据过大

**问题原因：**
- 静态 JSON 文件打包进代码
- 本地化语言包过大

**解决方案：**

```typescript
// 1. JSON 外置到 CDN
const loadConfig = async () => {
  const response = await fetch('https://cdn.example.com/config.json')
  return response.json()
}

// 2. 语言包按需加载
const loadLocale = async (locale: string) => {
  const messages = await import(`@/locales/${locale}.json`)
  return messages.default
}

// 3. 压缩 JSON
import jsonminify from 'jsonminify'
const compressed = jsonminify(JSON.stringify(data))
```

### 20.3 Source Map 泄露

**问题原因：**
- 生产环境启用了 Source Map
- Source Map 文件未删除

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 生产环境不生成 source map
    sourcemap: process.env.NODE_ENV !== 'production',
  },
})

// 或仅生成隐藏的 source map
build: {
  sourcemap: 'hidden', // 不在生成的 JS 中添加 sourceMappingURL
}
```

### 20.4 重复依赖

**问题原因：**
- 不同版本的相同依赖
- peerDependencies 冲突

**解决方案：**

```bash
# 检查重复依赖
pnpm why lodash

# 使用 pnpm 的 overrides 统一版本
# package.json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    }
  }
}

# 重新安装
pnpm install
```

## 总结

包体积优化是持续性工作，需要从多个维度进行优化：

| 优化维度 | 关键技术 | 预期收益 |
|---------|---------|---------|
| 代码压缩 | ESBuild、Terser | 30-40% |
| Tree Shaking | ES Module、按需导入 | 20-30% |
| 资源优化 | CDN、WebP、压缩 | 40-60% |
| 依赖优化 | 轻量替代、去重 | 15-25% |
| 分包加载 | 动态导入、预加载 | 首屏 50%+ |
| 条件编译 | 平台差异化 | 10-20% |

**优化流程：**

1. **分析** - 使用可视化工具分析体积分布
2. **识别** - 找出体积大的模块和资源
3. **优化** - 应用对应的优化策略
4. **验证** - 检查优化效果和功能正确性
5. **监控** - 建立体积预算和持续监控
