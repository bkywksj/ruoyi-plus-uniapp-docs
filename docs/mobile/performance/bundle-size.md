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

```
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

```
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
