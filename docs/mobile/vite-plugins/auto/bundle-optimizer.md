# 分包优化插件

## 介绍

分包优化插件（@uni-ku/bundle-optimizer）用于优化 UniApp 项目的分包策略，支持模块异步跨包调用、组件异步跨包引用等高级特性。该插件智能分析依赖关系，自动优化代码分割策略，有效减少主包体积，提升应用首屏加载性能。

**核心特性：**

- **分包优化** - 自动分析和优化代码分割策略，避免重复打包相同模块
- **异步导入** - 支持不同包之间的异步模块调用，使用动态 `import()` 语法
- **异步组件** - 支持跨包异步加载组件，提升首屏加载性能
- **依赖分析** - 智能分析模块依赖关系，优化打包策略
- **TypeScript 支持** - 自动处理跨包类型引用，提供完整类型支持

## 基本用法

### 插件配置

在 `vite/plugins/optimization.ts` 中配置：

```typescript
import Optimization from '@uni-ku/bundle-optimizer'

/**
 * 分包优化、模块异步跨包调用、组件异步跨包引用插件
 *
 * 主要功能：
 * 1. 自动优化代码分割，避免重复打包相同模块
 * 2. 支持不同包之间的异步模块调用
 * 3. 支持跨包异步加载组件，提升首屏加载性能
 * 4. 智能分析依赖关系，优化打包策略
 */
export default () => {
  return Optimization({
    // 功能开关配置
    enable: {
      optimization: true,       // 启用分包优化
      'async-import': true,     // 启用异步导入优化
      'async-component': true,  // 启用异步组件优化
    },

    // TypeScript 类型定义配置
    dts: {
      base: 'src/types',  // 类型定义文件的基础路径
    },

    // 调试配置
    logger: false,  // 关闭构建日志输出
  })
}
```

### 在插件入口中注册

```typescript
// vite/plugins/index.ts
import createOptimization from './optimization'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件...

  // 分包优化插件（需要在 UniPages 之后）
  vitePlugins.push(createOptimization())

  return vitePlugins
}
```

## 配置选项

### enable

功能开关配置对象：

```typescript
enable: {
  /** 启用分包优化 - 自动分析和优化代码分割策略 */
  optimization: true,
  /** 启用异步导入优化 - 支持动态 import() 的跨包调用 */
  'async-import': true,
  /** 启用异步组件优化 - 支持组件的懒加载和跨包引用 */
  'async-component': true,
}
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| optimization | `boolean` | `true` | 启用分包优化 |
| async-import | `boolean` | `true` | 启用异步导入 |
| async-component | `boolean` | `true` | 启用异步组件 |

### dts

TypeScript 类型定义配置：

```typescript
dts: {
  /** 类型定义文件的基础路径，用于处理跨包类型引用 */
  base: 'src/types',
}
```

### logger

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否输出构建日志

```typescript
Optimization({
  logger: true,  // 开启日志，调试时使用
})
```

## 分包优化原理

### 为什么需要分包

微信小程序对主包大小有严格限制：

| 限制项 | 大小限制 |
|--------|----------|
| 主包 | ≤ 2MB |
| 单个分包 | ≤ 2MB |
| 整包（所有包） | ≤ 20MB |

当项目规模增大时，必须使用分包来规避主包大小限制。

### 常见问题

**问题1：公共模块重复打包**

```text
主包
├── utils/request.js (50KB)
├── pages/index/index.js

分包A
├── utils/request.js (50KB)  ← 重复！
├── pages/a/index.js

分包B
├── utils/request.js (50KB)  ← 重复！
├── pages/b/index.js
```

**问题2：跨包调用限制**

小程序原生不支持直接跨包调用模块，需要特殊处理。

### 插件解决方案

```text
优化后的结构
├── 主包
│   ├── common/              ← 公共模块提取到主包
│   │   └── request.js
│   └── pages/index/
│
├── 分包A
│   └── pages/a/
│       └── index.js         ← 异步引用公共模块
│
└── 分包B
    └── pages/b/
        └── index.js         ← 异步引用公共模块
```

## 功能详解

### 1. 分包优化 (optimization)

自动分析依赖关系，优化代码分割：

```typescript
enable: {
  optimization: true,
}
```

**优化策略：**

- 识别多个分包共用的模块
- 将共用模块提取到主包
- 避免同一模块在多个分包中重复打包
- 智能分析依赖树，确定最优分割点

### 2. 异步导入 (async-import)

支持分包中异步导入主包模块：

```typescript
enable: {
  'async-import': true,
}
```

**使用示例：**

```typescript
// 分包中的页面
// pages/order/detail.vue

// 异步导入主包的工具函数
const { formatPrice } = await import('@/utils/format')

// 异步导入主包的 API
const { getOrderDetail } = await import('@/api/order')

// 使用导入的函数
const order = await getOrderDetail(orderId)
const priceText = formatPrice(order.price)
```

**工作原理：**

```text
┌────────────────────────────────────────────────────────────┐
│                    异步导入流程                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  分包页面                      主包模块                      │
│     │                            │                         │
│     │ 1. 动态 import()           │                         │
│     ├─────────────────────────>  │                         │
│     │                            │                         │
│     │ 2. 异步加载模块             │                         │
│     │ <─────────────────────────┤                         │
│     │                            │                         │
│     │ 3. 返回模块导出             │                         │
│     │ <─────────────────────────┤                         │
│     │                            │                         │
│     │ 4. 使用模块功能             │                         │
│     ▼                            │                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3. 异步组件 (async-component)

支持分包中异步加载主包组件：

```typescript
enable: {
  'async-component': true,
}
```

**使用示例：**

```vue
<!-- 分包页面 -->
<template>
  <view class="page">
    <!-- 异步加载的组件 -->
    <AsyncChart v-if="showChart" :data="chartData" />

    <!-- 条件渲染的重组件 -->
    <AsyncEditor v-if="showEditor" v-model="content" />
  </view>
</template>

<script lang="ts" setup>
// 定义异步组件
const AsyncChart = defineAsyncComponent(() =>
  import('@/components/chart/LineChart.vue')
)

const AsyncEditor = defineAsyncComponent(() =>
  import('@/components/editor/RichEditor.vue')
)

const showChart = ref(false)
const showEditor = ref(false)
const chartData = ref([])
const content = ref('')
</script>
```

**带加载状态的异步组件：**

```typescript
const AsyncComponent = defineAsyncComponent({
  // 异步加载组件
  loader: () => import('@/components/HeavyComponent.vue'),
  // 加载中显示的组件
  loadingComponent: LoadingSpinner,
  // 加载失败显示的组件
  errorComponent: ErrorFallback,
  // 延迟显示加载组件的时间
  delay: 200,
  // 超时时间
  timeout: 10000,
})
```

## 分包配置

### pages.config.ts 分包配置

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [
    // 主包页面
    { path: 'pages/index/index' },
    { path: 'pages/login/index' },
  ],
  subPackages: [
    // 订单分包
    {
      root: 'pages/order',
      pages: [
        { path: 'list' },
        { path: 'detail' },
        { path: 'confirm' },
      ],
    },
    // 用户分包
    {
      root: 'pages/user',
      pages: [
        { path: 'profile' },
        { path: 'settings' },
        { path: 'address' },
      ],
    },
    // 商品分包
    {
      root: 'pages/product',
      pages: [
        { path: 'list' },
        { path: 'detail' },
        { path: 'search' },
      ],
    },
  ],
  // 分包预下载
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/order', 'pages/product'],
    },
  },
})
```

### 目录结构建议

```text
src/
├── pages/                    # 主包页面
│   ├── index/
│   │   └── index.vue
│   └── login/
│       └── index.vue
├── pages/order/              # 订单分包
│   ├── list.vue
│   ├── detail.vue
│   └── confirm.vue
├── pages/user/               # 用户分包
│   ├── profile.vue
│   ├── settings.vue
│   └── address.vue
├── pages/product/            # 商品分包
│   ├── list.vue
│   ├── detail.vue
│   └── search.vue
├── components/               # 公共组件（主包）
├── composables/              # 组合式函数（主包）
├── api/                      # API 接口（主包）
├── utils/                    # 工具函数（主包）
└── stores/                   # 状态管理（主包）
```

## 使用示例

### 分包页面异步导入

```vue
<!-- pages/order/detail.vue -->
<template>
  <view class="page">
    <view class="order-info">
      <text>订单号：{{ order.orderNo }}</text>
      <text>金额：{{ formatPrice(order.amount) }}</text>
    </view>

    <view class="goods-list">
      <view v-for="item in order.items" :key="item.id" class="goods-item">
        <text>{{ item.name }}</text>
        <text>{{ formatPrice(item.price) }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 响应式数据
const order = ref<any>({})
const formatPrice = ref<(price: number) => string>(() => '')

// 页面加载
onLoad(async (options) => {
  // 异步导入主包工具函数
  const { formatPrice: fp } = await import('@/utils/format')
  formatPrice.value = fp

  // 异步导入主包 API
  const { getOrderDetail } = await import('@/api/order')

  // 获取订单详情
  const res = await getOrderDetail(options.id)
  order.value = res.data
})
</script>
```

### 异步组件懒加载

```vue
<!-- pages/product/detail.vue -->
<template>
  <view class="page">
    <!-- 商品基本信息 -->
    <view class="product-info">
      <image :src="product.image" />
      <text class="title">{{ product.title }}</text>
      <text class="price">¥{{ product.price }}</text>
    </view>

    <!-- 异步加载的评论组件 -->
    <view class="section">
      <text class="section-title">商品评价</text>
      <AsyncComments
        v-if="showComments"
        :product-id="product.id"
      />
      <button v-else @click="showComments = true">
        查看评价
      </button>
    </view>

    <!-- 异步加载的推荐组件 -->
    <view class="section">
      <text class="section-title">相关推荐</text>
      <AsyncRecommend
        v-if="showRecommend"
        :category="product.category"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
const product = ref<any>({})
const showComments = ref(false)
const showRecommend = ref(false)

// 异步组件定义
const AsyncComments = defineAsyncComponent(() =>
  import('@/components/product/Comments.vue')
)

const AsyncRecommend = defineAsyncComponent(() =>
  import('@/components/product/Recommend.vue')
)

// 页面滚动到底部时加载推荐
onReachBottom(() => {
  showRecommend.value = true
})
</script>
```

### 按需加载重型模块

```vue
<script lang="ts" setup>
// 图表库按需加载
const loadChart = async () => {
  const { createChart } = await import('@/utils/chart')
  return createChart(chartRef.value, options)
}

// 编辑器按需加载
const loadEditor = async () => {
  const { createEditor } = await import('@/utils/editor')
  return createEditor(editorRef.value)
}

// 地图按需加载
const loadMap = async () => {
  const { initMap } = await import('@/utils/map')
  return initMap(mapRef.value, {
    latitude: location.lat,
    longitude: location.lng,
  })
}
</script>
```

## 工作原理

```text
┌─────────────────────────────────────────────────────────────┐
│                   分包优化工作流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 构建启动                                                 │
│       ↓                                                     │
│  2. 分析项目依赖                                             │
│       ├─ 扫描所有页面和组件                                   │
│       ├─ 构建依赖关系图                                       │
│       └─ 识别跨包引用                                         │
│       ↓                                                     │
│  3. 优化分割策略                                             │
│       ├─ 识别共用模块                                         │
│       ├─ 计算最优分割点                                       │
│       └─ 确定模块归属                                         │
│       ↓                                                     │
│  4. 代码转换                                                 │
│       ├─ 转换跨包同步导入为异步导入                            │
│       ├─ 处理异步组件注册                                      │
│       └─ 生成运行时代理代码                                    │
│       ↓                                                     │
│  5. 类型处理                                                 │
│       ├─ 分析类型依赖                                         │
│       └─ 生成类型声明文件                                      │
│       ↓                                                     │
│  6. 输出优化后的代码                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API

### 插件选项

```typescript
interface BundleOptimizerOptions {
  /** 功能开关配置 */
  enable?: {
    /** 启用分包优化 */
    optimization?: boolean
    /** 启用异步导入优化 */
    'async-import'?: boolean
    /** 启用异步组件优化 */
    'async-component'?: boolean
  }
  /** TypeScript 类型定义配置 */
  dts?: {
    /** 类型定义文件的基础路径 */
    base?: string
  }
  /** 是否输出构建日志 */
  logger?: boolean
}
```

### 选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enable.optimization | `boolean` | `true` | 分包代码优化 |
| enable.async-import | `boolean` | `true` | 异步模块导入 |
| enable.async-component | `boolean` | `true` | 异步组件加载 |
| dts.base | `string` | `'src/types'` | 类型文件路径 |
| logger | `boolean` | `false` | 日志输出 |

## 最佳实践

### 1. 合理规划分包

```typescript
// ✅ 推荐：按功能模块分包
subPackages: [
  { root: 'pages/order', pages: [...] },   // 订单模块
  { root: 'pages/user', pages: [...] },    // 用户模块
  { root: 'pages/product', pages: [...] }, // 商品模块
]

// ❌ 不推荐：分包粒度过细
subPackages: [
  { root: 'pages/order/list', pages: [...] },
  { root: 'pages/order/detail', pages: [...] },
]
```

### 2. 使用分包预下载

```typescript
preloadRule: {
  // 进入首页时预下载常用分包
  'pages/index/index': {
    network: 'all',
    packages: ['pages/order', 'pages/product'],
  },
  // 进入订单列表时预下载详情分包
  'pages/order/list': {
    network: 'wifi',
    packages: ['pages/order'],
  },
}
```

### 3. 异步导入的时机

```typescript
// ✅ 推荐：在需要时异步导入
onLoad(async () => {
  const { getList } = await import('@/api/order')
  const data = await getList()
})

// ❌ 不推荐：顶层同步导入
import { getList } from '@/api/order'  // 会被打包到分包中
```

### 4. 异步组件的使用场景

```typescript
// ✅ 推荐：大型组件或条件渲染的组件
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/Chart.vue')
)

// ❌ 不推荐：小型、常用的组件
const SmallButton = defineAsyncComponent(() =>
  import('@/components/Button.vue')  // 没必要异步加载
)
```

## 常见问题

### 1. 异步导入失败

**问题原因：**
- 模块路径错误
- 模块未正确导出

**解决方案：**

```typescript
// 确保模块正确导出
// src/utils/format.ts
export function formatPrice(price: number) {
  return `¥${price.toFixed(2)}`
}

// 使用正确的路径
const { formatPrice } = await import('@/utils/format')
```

### 2. 类型丢失

**问题原因：**
- 异步导入后类型推断失败

**解决方案：**

```typescript
// 显式声明类型
import type { FormatPrice } from '@/utils/format'

const formatPrice = ref<FormatPrice>()

onLoad(async () => {
  const module = await import('@/utils/format')
  formatPrice.value = module.formatPrice
})
```

### 3. 构建体积未减小

**问题原因：**
- 同步导入未被转换
- 分包配置不正确

**解决方案：**

1. 检查分包配置是否正确
2. 确保使用动态 `import()` 语法
3. 开启 `logger: true` 查看优化日志

### 4. 首屏加载变慢

**问题原因：**
- 异步加载增加了网络请求

**解决方案：**

```typescript
// 使用分包预下载
preloadRule: {
  'pages/index/index': {
    network: 'all',
    packages: ['pages/order'],
  },
}

// 关键路径保持同步加载
// 只对非关键模块使用异步加载
```

### 5. 开发环境与生产环境不一致

**问题原因：**
- 开发环境可能不完全模拟分包行为

**解决方案：**

定期在真机或模拟器上测试分包功能。

