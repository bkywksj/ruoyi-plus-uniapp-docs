# uni-pages 页面路由插件

## 介绍

uni-pages 插件（`@uni-helper/vite-plugin-uni-pages`）是 uni-helper 生态提供的页面路由自动生成插件。它能够自动扫描页面目录，生成 `pages.json` 配置，支持分包管理、布局系统、路由元信息等功能，大大简化了 UniApp 项目的路由配置工作。

**核心特性：**

- **自动路由生成** - 基于文件系统自动生成页面路由配置
- **分包管理** - 支持配置多个分包目录，自动处理分包路由
- **布局系统** - 与 uni-layouts 配合，支持页面布局配置
- **类型安全** - 自动生成 TypeScript 类型声明文件
- **路由块支持** - 支持在 Vue 文件中使用 `<route>` 块定义路由元信息
- **全局样式** - 集中配置全局页面样式和平台特定配置
- **easycom** - 配置组件自动导入规则

## 基本用法

### 插件配置

在 `vite/plugins/uni-pages.ts` 中配置插件：

```typescript
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  return UniPages({
    // 设置首页
    homePage: 'pages/index/index',

    // 扫描的文件后缀：vue + nvue（nvue 仅 APP 端生效，weex 原生渲染）
    extensions: ['vue', 'nvue'],

    // 排除的组件路径
    exclude: ['**/components/**/**.*'],

    // 路由块语言
    routeBlockLang: 'json5',

    // 分包配置
    subPackages: [
      'src/pages-sub/admin',
    ],

    // 类型声明文件输出路径
    dts: 'src/types/uni-pages.d.ts',
  })
}
```

### 全局配置文件

在项目根目录创建 `pages.config.ts`：

```typescript
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  // 全局页面样式配置
  globalStyle: {
    navigationBarTitleText: 'My App',
    navigationStyle: 'custom',
    // 平台特定配置
    'app-plus': {
      bounce: 'none',
    },
    'h5': {
      titleNView: false,
    },
  },

  // 组件自动导入配置
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})
```

### 目录结构

```text
src/
├── pages/                    # 主包页面目录
│   ├── index/
│   │   └── index.vue        # 首页
│   ├── user/
│   │   └── profile.vue      # 用户资料页
│   └── goods/
│       ├── list.vue         # 商品列表
│       └── detail.vue       # 商品详情
│
├── pages-sub/                # 分包目录
│   └── admin/               # admin 分包
│       ├── dashboard.vue
│       └── settings.vue
│
└── types/
    └── uni-pages.d.ts       # 自动生成的类型文件
```

## 配置选项

### 完整配置接口

```typescript
interface UniPagesOptions {
  /** 首页路径 */
  homePage?: string

  /** 扫描的页面文件后缀（默认 ['vue']，加入 'nvue' 后 .nvue 页面也会被扫描并生成路由） */
  extensions?: string[]

  /** 排除的文件模式 */
  exclude?: string[]

  /** 路由块语言 */
  routeBlockLang?: 'json5' | 'json' | 'yaml'

  /** 分包目录列表 */
  subPackages?: string[]

  /** 类型声明文件输出路径 */
  dts?: string | boolean

  /** 页面元数据合并后的回调 */
  onAfterMergePageMetaData?: (ctx: PageMetaDataContext) => void

  /** 扫描页面后的回调 */
  onAfterScanPages?: (ctx: ScanPagesContext) => void
}
```

### homePage

- **类型**: `string`
- **说明**: 设置应用首页路径

```typescript
UniPages({
  homePage: 'pages/index/index',
})
```

### exclude

- **类型**: `string[]`
- **默认值**: `['**/components/**/**.*']`
- **说明**: 排除不需要作为页面的文件

```typescript
UniPages({
  exclude: [
    '**/components/**/**.*',  // 排除组件
    '**/utils/**',            // 排除工具目录
    '**/*.test.vue',          // 排除测试文件
  ],
})
```

### routeBlockLang

- **类型**: `'json5' | 'json' | 'yaml'`
- **默认值**: `'json5'`
- **说明**: Vue 文件中 `<route>` 块使用的语言

```typescript
UniPages({
  routeBlockLang: 'json5',
})
```

### extensions

- **类型**: `string[]`
- **默认值**: `['vue']`
- **说明**: 指定页面扫描的文件后缀。默认仅扫描 `.vue` 页面；`plus-app` 在此基础上加入 `'nvue'`，使 `.nvue` 原生渲染页面也会被自动扫描并生成路由

```typescript
UniPages({
  // 同时扫描 vue 与 nvue 页面
  extensions: ['vue', 'nvue'],
})
```

`.nvue` 是 uni-app 的原生（Weex）渲染页面，仅在 APP 端生效，用于长列表、复杂动画、地图等对性能敏感的关键路径。加入 `'nvue'` 后，`pages/` 目录下的 `.vue` 与 `.nvue` 页面会被统一扫描进路由表，二者可通过 `uni.navigateTo` 互相跳转，平台自动衔接 WebView 与原生渲染层。NVUE 的 `manifest.json` 编译配置（`nvueCompiler`、`nvueLaunchMode` 等）独立于本插件，二者需配合使用。

### subPackages

- **类型**: `string[]`
- **说明**: 分包目录列表

```typescript
UniPages({
  subPackages: [
    'src/pages-sub/admin',
    'src/pages-sub/user',
    // 根据环境条件加载分包
    ...(mode === 'development' ? ['src/pages-sub/demo'] : []),
  ],
})
```

### dts

- **类型**: `string | boolean`
- **默认值**: `'src/types/uni-pages.d.ts'`
- **说明**: TypeScript 类型声明文件输出路径

```typescript
UniPages({
  dts: 'src/types/uni-pages.d.ts',
})
```

### onAfterMergePageMetaData

- **类型**: `(ctx: PageMetaDataContext) => void`
- **说明**: 页面元数据合并后的回调，可用于统一设置布局

```typescript
UniPages({
  onAfterMergePageMetaData(ctx) {
    // 处理主包页面
    ctx.pageMetaData.forEach((page) => {
      page.layout = 'default'
    })

    // 处理分包页面
    if (ctx.subPageMetaData) {
      ctx.subPageMetaData.forEach((subPackage) => {
        subPackage.pages.forEach((page) => {
          // 根据分包设置不同布局
          if (subPackage.root === 'pages-sub/admin') {
            page.layout = 'admin'
          } else {
            page.layout = 'default'
          }
        })
      })
    }
  },
})
```

## 全局配置详解

### globalStyle

全局页面样式配置，对应 `pages.json` 中的 `globalStyle`：

```typescript
defineUniPages({
  globalStyle: {
    // 导航栏标题
    navigationBarTitleText: 'My App',

    // 导航栏背景色
    navigationBarBackgroundColor: '#ffffff',

    // 导航栏标题颜色
    navigationBarTextStyle: 'black',

    // 导航栏样式：default（默认）| custom（自定义）
    navigationStyle: 'custom',

    // 背景颜色
    backgroundColor: '#f5f5f5',

    // 下拉刷新样式
    backgroundTextStyle: 'dark',

    // 是否开启下拉刷新
    enablePullDownRefresh: false,

    // 页面上拉触底距离
    onReachBottomDistance: 50,
  },
})
```

### 平台特定配置

在 `globalStyle` 中可以针对不同平台进行配置：

```typescript
defineUniPages({
  globalStyle: {
    navigationStyle: 'custom',

    // App 端配置
    'app-plus': {
      bounce: 'none',           // 禁用弹性效果
      scrollIndicator: 'none',  // 隐藏滚动条
      popGesture: 'close',      // 侧滑返回关闭页面
    },

    // H5 端配置
    'h5': {
      titleNView: false,        // 禁用原生导航
    },

    // 微信小程序配置
    'mp-weixin': {
      // 小程序特定配置
    },

    // 支付宝小程序配置
    'mp-alipay': {
      transparentTitle: 'always',
      titlePenetrate: 'YES',
    },
  },
})
```

### easycom

组件自动导入配置：

```typescript
defineUniPages({
  easycom: {
    // 是否开启自动扫描
    autoscan: true,

    // 自定义组件映射规则
    custom: {
      // WD UI 组件
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',

      // 业务组件
      '^biz-(.*)': '@/components/biz-$1/index.vue',

      // 其他 UI 库
      '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',
    },
  },
})
```

## 路由块配置

### 基本用法

在 Vue 文件中使用 `<route>` 块定义路由元信息：

```vue
<route lang="json5">
{
  style: {
    navigationBarTitleText: '用户中心',
  },
  meta: {
    requiresAuth: true,
    title: '用户中心',
  },
}
</route>

<template>
  <view class="user-center">
    <!-- 页面内容 -->
  </view>
</template>

<script lang="ts" setup>
// 页面逻辑
</script>
```

### 完整路由块选项

```vue
<route lang="json5">
{
  // 页面样式
  style: {
    navigationBarTitleText: '页面标题',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f5f5',
    enablePullDownRefresh: true,
    // App 端配置
    'app-plus': {
      titleNView: {
        buttons: [
          {
            type: 'share',
          },
        ],
      },
    },
  },

  // 布局配置
  layout: 'default',

  // 中间件
  middlewares: ['auth'],

  // 自定义元信息
  meta: {
    requiresAuth: true,
    roles: ['admin', 'user'],
    title: '页面标题',
    icon: 'home',
    keepAlive: true,
  },
}
</route>
```

### 禁用路由块

如果不想使用路由块，可以完全通过 `onAfterMergePageMetaData` 回调统一配置：

```typescript
UniPages({
  onAfterMergePageMetaData(ctx) {
    ctx.pageMetaData.forEach((page) => {
      // 根据路径配置样式
      if (page.path.includes('user')) {
        page.style = {
          navigationBarTitleText: '用户中心',
        }
      }
    })
  },
})
```

## 分包配置

### 配置分包目录

```typescript
UniPages({
  subPackages: [
    'src/pages-sub/admin',     // 管理后台分包
    'src/pages-sub/user',      // 用户中心分包
    'src/pages-sub/shop',      // 商城分包
  ],
})
```

### 分包目录结构

```text
src/
├── pages/                    # 主包
│   └── index/
│       └── index.vue
│
└── pages-sub/                # 分包根目录
    ├── admin/               # admin 分包
    │   ├── dashboard.vue
    │   ├── users/
    │   │   └── list.vue
    │   └── settings.vue
    │
    ├── user/                # user 分包
    │   ├── profile.vue
    │   └── orders.vue
    │
    └── shop/                # shop 分包
        ├── cart.vue
        └── checkout.vue
```

### 条件分包

根据环境动态加载分包：

```typescript
UniPages({
  subPackages: [
    'src/pages-sub/admin',
    'src/pages-sub/user',
    // 仅开发环境加载 demo 分包
    ...(mode === 'development' ? ['src/pages-sub/demo'] : []),
    // 仅生产环境加载 analytics 分包
    ...(mode === 'production' ? ['src/pages-sub/analytics'] : []),
  ],
})
```

### 分包布局配置

为不同分包设置不同的布局：

```typescript
UniPages({
  onAfterMergePageMetaData(ctx) {
    if (ctx.subPageMetaData) {
      ctx.subPageMetaData.forEach((subPackage) => {
        subPackage.pages.forEach((page) => {
          switch (subPackage.root) {
            case 'pages-sub/admin':
              page.layout = 'admin'
              break
            case 'pages-sub/user':
              page.layout = 'user'
              break
            default:
              page.layout = 'default'
          }
        })
      })
    }
  },
})
```

## 类型声明

### 自动生成的类型

插件会自动生成 `uni-pages.d.ts` 类型声明文件：

```typescript
// src/types/uni-pages.d.ts (自动生成)

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    title?: string
    icon?: string
    keepAlive?: boolean
  }
}

declare global {
  interface UniPages {
    pages: [
      'pages/index/index',
      'pages/user/profile',
      'pages/goods/list',
      'pages/goods/detail',
    ]
    subPackages: {
      'pages-sub/admin': [
        'dashboard',
        'users/list',
        'settings',
      ]
    }
  }
}
```

### 使用类型

```typescript
import type { UniPages } from '@/types/uni-pages'

// 类型安全的页面路径
type PagePath = UniPages['pages'][number]

// 跳转函数示例
const navigateTo = (path: PagePath) => {
  uni.navigateTo({ url: `/${path}` })
}

navigateTo('pages/user/profile')  // ✅ 类型正确
navigateTo('pages/not-exist')     // ❌ 类型错误
```

## API

### 插件导出

```typescript
import UniPages from '@uni-helper/vite-plugin-uni-pages'

const plugin = UniPages(options: UniPagesOptions): Plugin
```

### defineUniPages

用于定义全局页面配置：

```typescript
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: { ... },
  easycom: { ... },
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| homePage | `string` | - | 首页路径 |
| exclude | `string[]` | `['**/components/**/**.*']` | 排除的文件模式 |
| routeBlockLang | `'json5' \| 'json' \| 'yaml'` | `'json5'` | 路由块语言 |
| subPackages | `string[]` | - | 分包目录列表 |
| dts | `string \| boolean` | `'src/types/uni-pages.d.ts'` | 类型声明文件路径 |
| onAfterMergePageMetaData | `Function` | - | 元数据合并回调 |
| onAfterScanPages | `Function` | - | 页面扫描回调 |

## 最佳实践

### 1. 统一布局配置

使用 `onAfterMergePageMetaData` 统一配置布局，而不是在每个页面单独配置：

```typescript
UniPages({
  onAfterMergePageMetaData(ctx) {
    // 所有页面默认使用 default 布局
    ctx.pageMetaData.forEach((page) => {
      page.layout = 'default'
    })
  },
})
```

### 2. 合理划分分包

```typescript
// 按业务模块划分分包
subPackages: [
  'src/pages-sub/user',     // 用户模块
  'src/pages-sub/order',    // 订单模块
  'src/pages-sub/goods',    // 商品模块
  'src/pages-sub/admin',    // 管理模块
]
```

### 3. 使用 JSON5 路由块

JSON5 支持注释和更宽松的语法：

```vue
<route lang="json5">
{
  // 页面标题
  style: {
    navigationBarTitleText: '用户中心',
  },
  // 自定义元信息
  meta: {
    requiresAuth: true,  // 需要登录
  },
}
</route>
```

### 4. 平台差异配置

在 `globalStyle` 中统一处理平台差异：

```typescript
defineUniPages({
  globalStyle: {
    navigationStyle: 'custom',
    'app-plus': { bounce: 'none' },
    'h5': { titleNView: false },
  },
})
```

## 常见问题

### 1. 页面未被识别

**问题原因：**
- 页面文件被 exclude 规则排除
- 文件不在 pages 或 subPackages 目录下

**解决方案：**

检查 exclude 配置和目录结构：

```typescript
UniPages({
  exclude: ['**/components/**/**.*'],  // 确保不会误排除页面
})
```

### 2. 分包路由错误

**问题原因：**
- 分包目录配置错误
- 分包目录放在了 pages 目录下

**解决方案：**

分包目录应该与 pages 目录平级：

```text
src/
├── pages/          # 主包
└── pages-sub/      # 分包（与 pages 平级）
```

### 3. 类型声明未生成

**问题原因：**
- dts 配置为 false
- 输出路径没有写入权限

**解决方案：**

```typescript
UniPages({
  dts: 'src/types/uni-pages.d.ts',  // 确保配置正确
})
```

### 4. 路由块语法错误

**问题原因：**
- 未指定正确的 lang 属性
- JSON 语法错误

**解决方案：**

```vue
<!-- 确保指定 lang="json5" -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '页面标题',
  },
}
</route>
```

### 5. 布局未生效

**问题原因：**
- 未安装 uni-layouts 插件
- layout 名称与布局文件不匹配

**解决方案：**

确保 uni-layouts 插件已正确配置，且布局文件存在：

```text
src/
└── layouts/
    ├── default.vue
    └── admin.vue
```
