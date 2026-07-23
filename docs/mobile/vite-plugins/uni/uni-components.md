# 组件导入插件

## 介绍

组件导入系统是 UniApp 的核心特性之一，通过 easycom 规范实现组件的自动扫描和注册。结合 `@uni-helper/vite-plugin-uni-components` 插件，可以获得更强大的组件自动导入能力，包括第三方组件库支持、TypeScript 类型生成等功能。

**核心特性：**

- **easycom 规范** - UniApp 原生的组件自动导入机制，零配置开箱即用
- **自动扫描** - 自动扫描 components 目录下的组件，支持嵌套目录
- **正则匹配** - 通过正则表达式自定义组件匹配规则，灵活配置组件路径
- **第三方组件** - 支持 WD UI、uView、uni-ui 等第三方组件库
- **Vite 集成** - 与 Vite 构建系统深度集成，支持 HMR 热更新
- **类型支持** - 自动生成 TypeScript 类型声明文件，提供完整 IDE 智能提示
- **按需导入** - 只打包使用的组件，减小构建产物体积
- **多平台兼容** - 支持 H5、小程序、App 等全平台

## 架构设计

### 系统架构图

```text
┌──────────────────────────────────────────────────────────────────────┐
│                       组件自动导入系统架构                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  pages.config.ts│    │   vite.config.ts│    │  tsconfig.json  │  │
│  │  (easycom 配置) │    │   (插件配置)    │    │  (类型配置)     │  │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘  │
│           │                      │                      │            │
│           ▼                      ▼                      ▼            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     构建时组件解析层                             │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │ │
│  │  │ easycom解析器│  │ Vite插件解析 │  │ TypeScript类型生成器 │ │ │
│  │  │ (UniApp内置) │  │ (uni-helper) │  │ (components.d.ts)    │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │ │
│  │         │                 │                     │              │ │
│  │         └────────────┬────┴─────────────────────┘              │ │
│  │                      ▼                                         │ │
│  │           ┌──────────────────────┐                             │ │
│  │           │    组件注册中心      │                             │ │
│  │           │  - 路径映射表        │                             │ │
│  │           │  - 组件名称缓存      │                             │ │
│  │           │  - 依赖关系图        │                             │ │
│  │           └──────────┬───────────┘                             │ │
│  └──────────────────────┼─────────────────────────────────────────┘ │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     运行时组件注入                               │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  ┌──────────────────┐    ┌──────────────────┐                  │ │
│  │  │   模板解析       │ ──▶│   组件实例化     │                  │ │
│  │  │ <wd-button>      │    │ import + register│                  │ │
│  │  └──────────────────┘    └──────────────────┘                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 组件解析流程

```text
┌─────────────────────────────────────────────────────────────────┐
│                    组件解析完整流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 编译启动                                                     │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  2. 加载配置                                         │        │
│  │     ├─ pages.config.ts → easycom 配置               │        │
│  │     └─ vite.config.ts → 插件配置                    │        │
│  └──────────────────────┬──────────────────────────────┘        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  3. 扫描组件目录                                     │        │
│  │     ├─ src/components/**/*.vue                       │        │
│  │     ├─ src/wd/components/**/*.vue                   │        │
│  │     └─ node_modules 中的组件库                       │        │
│  └──────────────────────┬──────────────────────────────┘        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  4. 构建组件映射表                                   │        │
│  │     {                                                │        │
│  │       'wd-button': '@/wd/components/wd-button',     │        │
│  │       'AuthModal': '@/components/auth/AuthModal',   │        │
│  │       ...                                           │        │
│  │     }                                               │        │
│  └──────────────────────┬──────────────────────────────┘        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  5. 生成类型声明 (components.d.ts)                   │        │
│  │     declare module 'vue' {                          │        │
│  │       export interface GlobalComponents {           │        │
│  │         'wd-button': typeof import(...)             │        │
│  │       }                                             │        │
│  │     }                                               │        │
│  └──────────────────────┬──────────────────────────────┘        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  6. 模板编译时注入                                   │        │
│  │     ├─ 解析 <template> 中的组件标签                  │        │
│  │     ├─ 匹配组件映射表                               │        │
│  │     └─ 注入 import 语句和组件注册                   │        │
│  └──────────────────────┬──────────────────────────────┘        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  7. 运行时渲染                                       │        │
│  │     └─ 组件正常渲染和交互                           │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## easycom 配置

### 基本配置

在 `pages.config.ts` 中配置 easycom：

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  // 全局页面样式配置
  globalStyle: {
    navigationBarTitleText: 'ryplus-uni',
    navigationStyle: 'custom',
    'app-plus': {
      bounce: 'none',
    },
  },

  // 组件自动导入配置
  easycom: {
    autoscan: true, // 开启自动扫描 components 目录
    custom: {
      // 自定义组件匹配规则
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})
```

### 生成的 pages.json

编译时会自动生成 `pages.json`：

```json
{
  "globalStyle": {
    "navigationBarTitleText": "ryplus-uni",
    "navigationStyle": "custom",
    "app-plus": {
      "bounce": "none"
    }
  },
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

## 配置选项详解

### autoscan

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否开启自动扫描 components 目录

```typescript
easycom: {
  autoscan: true,  // 自动扫描 src/components 目录
}
```

**自动扫描规则：**

当 `autoscan: true` 时，框架会自动扫描 `src/components` 目录下符合以下规范的组件：

```text
src/components/
├── MyButton/
│   └── MyButton.vue        # ✅ 组件名与目录名一致，注册为 <MyButton>
├── user-card/
│   └── user-card.vue       # ✅ 组件名与目录名一致，注册为 <user-card>
├── auth/
│   └── AuthModal.vue       # ✅ 嵌套目录也支持，注册为 <AuthModal>
├── Header.vue              # ❌ 根目录文件不被扫描（需放入同名目录）
└── utils/
    └── helper.ts           # ❌ 非 .vue 文件不被扫描
```

### custom

- **类型**: `Record<string, string>`
- **说明**: 自定义组件匹配规则，使用正则表达式定义组件名到路径的映射

```typescript
easycom: {
  custom: {
    // 正则表达式 -> 组件路径映射
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue',
  },
}
```

**正则匹配规则说明：**

| 正则表达式 | 组件使用 | $1 捕获值 | 最终路径 |
|-----------|---------|----------|---------|
| `^wd-(.*)` | `<wd-button>` | `button` | `@/wd/components/wd-button/wd-button.vue` |
| `^wd-(.*)` | `<wd-toast>` | `toast` | `@/wd/components/wd-toast/wd-toast.vue` |
| `^wd-(.*)` | `<wd-action-sheet>` | `action-sheet` | `@/wd/components/wd-action-sheet/wd-action-sheet.vue` |
| `^uni-(.*)` | `<uni-icons>` | `icons` | `@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue` |

**正则表达式语法：**

```typescript
// ^ 表示匹配开头
// (.*) 表示捕获组，捕获任意字符
// $1 引用第一个捕获组

// 示例：多个捕获组
'^my-([a-z]+)-(.*)': '@/components/$1/$2/$2.vue'
// <my-form-input> -> @/components/form/input/input.vue
```

## 第三方组件库配置

### WD UI（Wot Design Uni）

项目内置的 WD UI 组件库配置：

```typescript
easycom: {
  autoscan: true,
  custom: {
    // 本地 WD UI 组件（从 src/wd 目录加载）
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
  },
}
```

**WD UI 目录结构：**

```text
src/wd/
├── components/
│   ├── wd-button/
│   │   ├── wd-button.vue       # 主组件
│   │   ├── types.ts            # 类型定义
│   │   └── index.scss          # 样式文件
│   ├── wd-toast/
│   │   └── wd-toast.vue
│   ├── wd-modal/
│   │   └── wd-modal.vue
│   └── ... (78+ 个组件)
├── index.ts                    # 统一导出
└── types.ts                    # 全局类型
```

### uni-ui 官方组件库

```typescript
// 安装: pnpm add @dcloudio/uni-ui

easycom: {
  autoscan: true,
  custom: {
    // uni-ui 组件
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',
  },
}
```

**使用示例：**

```vue
<template>
  <view>
    <!-- uni-ui 组件，无需 import -->
    <uni-icons type="home" size="24" color="#333" />
    <uni-badge text="99+" type="primary" />
    <uni-popup ref="popup" type="bottom">
      <view>弹出内容</view>
    </uni-popup>
  </view>
</template>
```

### uView UI

```typescript
// uView 2.x
// 安装: pnpm add uview-ui

easycom: {
  autoscan: true,
  custom: {
    '^u-(.*)': 'uview-ui/components/u-$1/u-$1.vue',
  },
}

// uView Plus (Vue 3 版本)
// 安装: pnpm add uview-plus

easycom: {
  autoscan: true,
  custom: {
    '^up-(.*)': 'uview-plus/components/u-$1/u-$1.vue',
  },
}
```

### uv-ui

```typescript
// 安装: pnpm add @climblee/uv-ui

easycom: {
  autoscan: true,
  custom: {
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue',
  },
}
```

### TuniaoUI

```typescript
// 安装: pnpm add @tuniao/tnui-vue3-uniapp

easycom: {
  autoscan: true,
  custom: {
    '^tn-(.*)': '@tuniao/tnui-vue3-uniapp/components/$1/src/$1.vue',
  },
}
```

### 多组件库共存

当项目需要使用多个组件库时，可以配置不同的前缀：

```typescript
easycom: {
  autoscan: true,
  custom: {
    // WD UI - wd- 前缀
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',

    // uni-ui - uni- 前缀
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',

    // uv-ui - uv- 前缀
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue',

    // 自定义业务组件 - biz- 前缀
    '^biz-(.*)': '@/components/business/$1/$1.vue',

    // 自定义通用组件 - app- 前缀
    '^app-(.*)': '@/components/common/$1/$1.vue',
  },
}
```

**使用多组件库：**

```vue
<template>
  <view class="page">
    <!-- WD UI 组件 -->
    <wd-button type="primary">WD 按钮</wd-button>

    <!-- uni-ui 组件 -->
    <uni-icons type="star" size="20" />

    <!-- uv-ui 组件 -->
    <uv-loading-icon />

    <!-- 业务组件 -->
    <biz-order-card :order="orderData" />

    <!-- 通用组件 -->
    <app-empty description="暂无数据" />
  </view>
</template>
```

## Vite 插件配置

### @uni-helper/vite-plugin-uni-components

项目使用 `@uni-helper/vite-plugin-uni-components` 插件增强组件自动导入能力：

```typescript
// vite/plugins/components.ts
import Components from '@uni-helper/vite-plugin-uni-components'

/**
 * 组件自动导入插件配置
 * 自动导入组件，无需手动注册
 */
export default () => {
  return Components({
    extensions: ['vue'],
    deep: true, // 是否递归扫描子目录
    directoryAsNamespace: false, // 是否把目录名作为命名空间前缀
    dts: 'src/types/components.d.ts', // 自动生成的组件类型声明文件路径
  })
}
```

### 插件配置选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `extensions` | `string[]` | `['vue']` | 要扫描的文件扩展名 |
| `deep` | `boolean` | `true` | 是否递归扫描子目录 |
| `directoryAsNamespace` | `boolean` | `false` | 是否使用目录名作为命名空间前缀 |
| `dts` | `string \| false` | `false` | 类型声明文件输出路径，false 禁用 |
| `dirs` | `string[]` | `['src/components']` | 要扫描的目录列表 |
| `include` | `RegExp[]` | `[/\.vue$/]` | 包含的文件模式 |
| `exclude` | `RegExp[]` | `[/node_modules/]` | 排除的文件模式 |
| `resolvers` | `Resolver[]` | `[]` | 自定义组件解析器 |

### 高级配置示例

```typescript
// vite/plugins/components.ts
import Components from '@uni-helper/vite-plugin-uni-components'

export default () => {
  return Components({
    // 扫描的文件扩展名
    extensions: ['vue'],

    // 递归扫描子目录
    deep: true,

    // 目录名不作为命名空间
    directoryAsNamespace: false,

    // 类型声明文件路径
    dts: 'src/types/components.d.ts',

    // 要扫描的目录
    dirs: [
      'src/components',
      'src/components/business',
      'src/components/common',
    ],

    // 包含模式
    include: [/\.vue$/, /\.vue\?vue/],

    // 排除模式
    exclude: [
      /[\\/]node_modules[\\/]/,
      /[\\/]\.git[\\/]/,
      /[\\/]\.nuxt[\\/]/,
    ],

    // 自定义解析器
    resolvers: [
      // 可以添加自定义解析器
    ],
  })
}
```

### 插件与 easycom 的区别

| 特性 | easycom | vite-plugin-uni-components |
|------|---------|---------------------------|
| 配置位置 | pages.json / pages.config.ts | vite.config.ts |
| 类型生成 | 否 不支持 | 是 自动生成 .d.ts |
| IDE 提示 | 有限支持 | 是 完整类型提示 |
| 编译时机 | 运行时解析 | 构建时预处理 |
| 自定义规则 | 正则匹配 | 正则 + 自定义解析器 |
| 按需导入 | 是 支持 | 是 支持 |
| HMR 支持 | 有限 | 是 完整支持 |
| Tree Shaking | 部分支持 | 是 完整支持 |
| 平台兼容性 | 是 全平台 | 是 全平台 |

### 推荐配置

同时使用两种方式获得最佳体验：

```typescript
// pages.config.ts - easycom 配置（运行时解析）
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})
```

```typescript
// vite/plugins/components.ts - Vite 插件配置（构建时处理）
import Components from '@uni-helper/vite-plugin-uni-components'

export default () => {
  return Components({
    extensions: ['vue'],
    deep: true,
    directoryAsNamespace: false,
    dts: 'src/types/components.d.ts',
  })
}
```

## 自动生成的类型声明

### components.d.ts 文件

Vite 插件会自动生成类型声明文件：

```typescript
// src/types/components.d.ts（由 vite-plugin-uni-components 自动生成）
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by vite-plugin-uni-components
// Read more: https://github.com/vuejs/core/pull/3399
export {}

declare module 'vue' {
  export interface GlobalComponents {
    // 自定义组件
    AuthModal: typeof import('./../components/auth/AuthModal.vue')['default']
    Home: typeof import('./../components/tabbar/Home.vue')['default']
    Menu: typeof import('./../components/tabbar/Menu.vue')['default']
    My: typeof import('./../components/tabbar/My.vue')['default']

    // WD UI 组件（如果配置了解析器）
    WdButton: typeof import('./../wd/components/wd-button/wd-button.vue')['default']
    WdCell: typeof import('./../wd/components/wd-cell/wd-cell.vue')['default']
    WdIcon: typeof import('./../wd/components/wd-icon/wd-icon.vue')['default']
  }
}
```

### 手动补充类型声明

如果自动生成不完整，可以手动补充：

```typescript
// src/types/wd-components.d.ts
export {}

declare module 'vue' {
  export interface GlobalComponents {
    // WD UI 组件类型声明
    'wd-button': typeof import('@/wd/components/wd-button/wd-button.vue')['default']
    'wd-toast': typeof import('@/wd/components/wd-toast/wd-toast.vue')['default']
    'wd-cell': typeof import('@/wd/components/wd-cell/wd-cell.vue')['default']
    'wd-modal': typeof import('@/wd/components/wd-modal/wd-modal.vue')['default']
    'wd-form': typeof import('@/wd/components/wd-form/wd-form.vue')['default']
    'wd-input': typeof import('@/wd/components/wd-input/wd-input.vue')['default']
    'wd-picker': typeof import('@/wd/components/wd-picker/wd-picker.vue')['default']
  }
}
```

### tsconfig.json 配置

确保 TypeScript 能够找到类型声明：

```json
{
  "compilerOptions": {
    "types": ["@dcloudio/types", "miniprogram-api-typings"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "src/types/*.d.ts"
  ]
}
```

## 组件目录结构

### 标准结构（推荐）

```text
src/components/
├── auth/                       # 认证相关组件
│   ├── AuthModal/
│   │   └── AuthModal.vue       # 自动注册为 <AuthModal>
│   └── LoginForm/
│       └── LoginForm.vue       # 自动注册为 <LoginForm>
├── common/                     # 通用组件
│   ├── Empty/
│   │   └── Empty.vue           # 自动注册为 <Empty>
│   ├── Loading/
│   │   └── Loading.vue         # 自动注册为 <Loading>
│   └── ErrorBoundary/
│       └── ErrorBoundary.vue   # 自动注册为 <ErrorBoundary>
├── business/                   # 业务组件
│   ├── OrderCard/
│   │   └── OrderCard.vue       # 自动注册为 <OrderCard>
│   └── ProductItem/
│       └── ProductItem.vue     # 自动注册为 <ProductItem>
└── tabbar/                     # TabBar 页面组件
    ├── Home/
    │   └── Home.vue            # 自动注册为 <Home>
    ├── Menu/
    │   └── Menu.vue            # 自动注册为 <Menu>
    └── My/
        └── My.vue              # 自动注册为 <My>
```

### 第三方组件库结构

```text
src/wd/
└── components/
    ├── wd-button/
    │   ├── wd-button.vue       # 主组件 <wd-button>
    │   ├── types.ts            # Props/Emits 类型定义
    │   └── index.scss          # 组件样式
    ├── wd-toast/
    │   ├── wd-toast.vue        # <wd-toast>
    │   └── types.ts
    ├── wd-icon/
    │   ├── wd-icon.vue         # <wd-icon>
    │   └── icons.ts            # 图标数据
    ├── wd-cell/
    │   └── wd-cell.vue         # <wd-cell>
    ├── wd-form/
    │   ├── wd-form.vue         # <wd-form>
    │   ├── wd-form-item.vue    # <wd-form-item>
    │   └── types.ts
    └── ... (更多组件)
```

## 使用示例

### 使用 WD UI 组件

```vue
<template>
  <view class="page">
    <!-- WD UI 组件，无需 import -->
    <wd-button type="primary" @click="handleClick">
      点击按钮
    </wd-button>

    <wd-cell title="标题" value="内容" is-link />

    <wd-icon name="check" size="48rpx" color="#0957DE" />

    <wd-toast ref="toastRef" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 无需 import 组件，easycom 自动导入

const toastRef = ref()

const handleClick = () => {
  toastRef.value?.show({
    type: 'success',
    msg: '操作成功',
  })
}
</script>
```

### 使用自定义组件

```vue
<template>
  <view class="page">
    <!-- 自定义组件，无需 import -->
    <AuthModal
      v-model:visible="showAuth"
      @success="handleAuthSuccess"
    />

    <Empty v-if="isEmpty" description="暂无数据" />

    <Loading v-if="loading" text="加载中..." />

    <OrderCard
      v-for="order in orders"
      :key="order.id"
      :order="order"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showAuth = ref(false)
const loading = ref(false)
const isEmpty = ref(false)
const orders = ref([])

const handleAuthSuccess = () => {
  showAuth.value = false
  // 刷新数据
}
</script>
```

### 混合使用多个组件库

```vue
<template>
  <view class="page">
    <!-- WD UI 导航栏 -->
    <wd-navbar title="用户中心" @click-left="goBack" />

    <!-- 自定义业务组件 -->
    <UserCard :user="userInfo" />

    <!-- uni-ui 组件 -->
    <uni-icons type="home" size="24" />

    <!-- WD UI 表单 -->
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-cell-group>
        <wd-input
          v-model="formData.name"
          label="姓名"
          placeholder="请输入姓名"
          required
        />
        <wd-input
          v-model="formData.phone"
          label="手机号"
          placeholder="请输入手机号"
          type="number"
          required
        />
      </wd-cell-group>

      <wd-button type="primary" block @click="submit">
        提交
      </wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const formRef = ref()
const userInfo = ref({ name: 'test', avatar: '' })

const formData = reactive({
  name: '',
  phone: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
}

const goBack = () => {
  uni.navigateBack()
}

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    // 提交表单
  }
}
</script>
```

## 组件导入优先级

当存在多个匹配规则时，按以下优先级选择：

```text
优先级从高到低:
1. custom 规则（按配置顺序，先配置的优先）
2. autoscan 扫描结果
3. 手动 import 的组件
```

### 优先级示例

```typescript
easycom: {
  autoscan: true,
  custom: {
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',      // 优先级 1
    '^custom-(.*)': '@/components/custom/$1/$1.vue',    // 优先级 2
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue', // 优先级 3
  },
}
```

**解析流程：**

```text
使用 <wd-button>:
  1. 匹配 custom 规则 ^wd-(.*) ✓
  2. 解析为 @/wd/components/wd-button/wd-button.vue
  3. 跳过后续规则

使用 <MyComponent>:
  1. 不匹配 ^wd-(.*) ✗
  2. 不匹配 ^custom-(.*) ✗
  3. 不匹配 ^uni-(.*) ✗
  4. autoscan 查找 src/components/MyComponent/MyComponent.vue ✓

使用 <uni-icons>:
  1. 不匹配 ^wd-(.*) ✗
  2. 不匹配 ^custom-(.*) ✗
  3. 匹配 ^uni-(.*) ✓
  4. 解析为 @dcloudio/uni-ui/lib/uni-icons/uni-icons.vue
```

## 工作原理

### easycom 编译流程

```text
┌─────────────────────────────────────────────────────────────┐
│                    easycom 工作流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 编译启动                                                  │
│       ↓                                                      │
│  2. 读取 easycom 配置                                         │
│       ├─ autoscan: true                                      │
│       └─ custom 规则                                         │
│       ↓                                                      │
│  3. 扫描组件目录                                              │
│       ├─ src/components/**                                   │
│       └─ 匹配 custom 规则的路径                               │
│       ↓                                                      │
│  4. 解析 Vue 模板                                             │
│       ├─ 识别使用的组件标签                                   │
│       └─ <wd-button>, <AuthModal> 等                         │
│       ↓                                                      │
│  5. 匹配组件                                                  │
│       ├─ 优先匹配 custom 规则                                 │
│       └─ 然后匹配 autoscan 扫描结果                           │
│       ↓                                                      │
│  6. 自动注入导入                                              │
│       ├─ 生成 import 语句                                    │
│       └─ 注册为局部组件                                       │
│       ↓                                                      │
│  7. 输出编译结果                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Vite 插件工作流程

```text
┌─────────────────────────────────────────────────────────────┐
│              vite-plugin-uni-components 工作流程              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. buildStart Hook                                    │   │
│  │    └─ 初始化插件，读取配置                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 2. 扫描阶段                                           │   │
│  │    ├─ 遍历 dirs 配置的目录                            │   │
│  │    ├─ 应用 include/exclude 过滤                       │   │
│  │    └─ 构建组件名 → 路径映射表                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 3. transform Hook                                     │   │
│  │    ├─ 解析 Vue SFC 文件                               │   │
│  │    ├─ 分析 <template> 使用的组件                      │   │
│  │    └─ 注入必要的 import 语句                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 4. 类型生成                                           │   │
│  │    ├─ 收集所有扫描到的组件                            │   │
│  │    └─ 生成 components.d.ts 文件                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 5. handleHotUpdate Hook (开发模式)                    │   │
│  │    ├─ 监听组件文件变化                                │   │
│  │    └─ 触发类型文件重新生成                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 性能优化

### 1. 减少扫描范围

```typescript
// 只扫描必要的目录
Components({
  dirs: [
    'src/components',
    // 不要扫描 node_modules
    // 不要扫描无关目录
  ],
  exclude: [
    /[\\/]node_modules[\\/]/,
    /[\\/]\.git[\\/]/,
    /[\\/]test[\\/]/,
    /[\\/]__tests__[\\/]/,
  ],
})
```

### 2. 禁用不需要的功能

```typescript
// 生产环境禁用类型生成
Components({
  dts: process.env.NODE_ENV === 'development'
    ? 'src/types/components.d.ts'
    : false,
})
```

### 3. 使用精确的正则匹配

```typescript
easycom: {
  custom: {
    // ✅ 精确匹配，性能更好
    '^wd-button$': '@/wd/components/wd-button/wd-button.vue',
    '^wd-icon$': '@/wd/components/wd-icon/wd-icon.vue',

    // ✅ 通用匹配，适合组件库
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
  },
}
```

### 4. 避免过度使用全局组件

```vue
<!-- ❌ 不推荐：全部使用全局组件 -->
<template>
  <wd-button />
  <wd-cell />
  <wd-icon />
  <!-- 每个页面都会加载这些组件的代码 -->
</template>

<!-- ✅ 推荐：按需使用，只在需要的地方使用 -->
<template>
  <wd-button v-if="showButton" />
</template>
```

## 调试技巧

### 1. 查看组件解析结果

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    Components({
      dts: 'src/types/components.d.ts',
      // 开启调试模式
      globalComponentsDeclaration: true,
    }),
  ],
})
```

### 2. 检查 pages.json 生成结果

```bash
# 查看生成的 pages.json
cat dist/dev/mp-weixin/pages.json | jq .easycom
```

### 3. 验证组件是否正确注册

```vue
<script lang="ts" setup>
import { getCurrentInstance } from 'vue'

onMounted(() => {
  const instance = getCurrentInstance()
  // 查看已注册的组件
  console.log('Registered components:', Object.keys(instance?.appContext.components || {}))
})
</script>
```

### 4. 查看构建产物

```bash
# 分析构建后的组件引用
pnpm build:h5
# 查看 dist 目录下的文件，确认组件是否被正确打包
```

## 最佳实践

### 1. 组件命名规范

```text
# 自定义组件使用 PascalCase
src/components/
├── AuthModal/AuthModal.vue        # ✅ <AuthModal>
├── UserCard/UserCard.vue          # ✅ <UserCard>
├── OrderList/OrderList.vue        # ✅ <OrderList>
└── my-button/my-button.vue        # ❌ 不推荐

# 第三方组件库保持原有命名
src/wd/components/
├── wd-button/wd-button.vue        # ✅ <wd-button>
└── wd-toast/wd-toast.vue          # ✅ <wd-toast>
```

### 2. 分类组织组件

```typescript
easycom: {
  autoscan: true,
  custom: {
    // UI 组件库
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',

    // 业务组件（按模块分类）
    '^order-(.*)': '@/components/order/$1/$1.vue',
    '^user-(.*)': '@/components/user/$1/$1.vue',
    '^product-(.*)': '@/components/product/$1/$1.vue',

    // 通用组件
    '^app-(.*)': '@/components/common/$1/$1.vue',
  },
}
```

### 3. 避免命名冲突

```typescript
// 使用不同前缀区分来源
easycom: {
  custom: {
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',     // WD UI
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue', // uv-ui
    '^biz-(.*)': '@/components/business/$1/$1.vue',    // 业务组件
    '^app-(.*)': '@/components/common/$1/$1.vue',      // 通用组件
  },
}
```

### 4. 组件类型安全

```typescript
// src/types/components.d.ts
declare module 'vue' {
  export interface GlobalComponents {
    // 提供完整的类型定义
    'wd-button': typeof import('@/wd/components/wd-button/wd-button.vue')['default']
  }
}

// 使用时获得完整的类型提示
<template>
  <wd-button
    type="primary"     // 有类型提示
    :loading="loading" // 有类型检查
    @click="handleClick" // 事件有类型
  />
</template>
```

### 5. 开发时组件预览

```typescript
// 创建组件预览页面用于开发调试
// pages/dev/components.vue
<template>
  <scroll-view class="component-preview">
    <view class="section">
      <text class="title">WD UI 按钮</text>
      <wd-button type="default">Default</wd-button>
      <wd-button type="primary">Primary</wd-button>
      <wd-button type="success">Success</wd-button>
      <wd-button type="warning">Warning</wd-button>
      <wd-button type="error">Error</wd-button>
    </view>

    <view class="section">
      <text class="title">WD UI 图标</text>
      <wd-icon name="check" />
      <wd-icon name="close" />
      <wd-icon name="setting" />
    </view>

    <view class="section">
      <text class="title">自定义组件</text>
      <AuthModal :visible="false" />
      <Empty description="预览" />
    </view>
  </scroll-view>
</template>
```

### 6. 条件编译组件

```vue
<template>
  <!-- 平台特定组件 -->
  <!-- #ifdef MP-WEIXIN -->
  <wx-open-launch-weapp
    username="gh_xxx"
    path="/pages/index/index"
  />
  <!-- #endif -->

  <!-- 通用组件 -->
  <wd-button type="primary">通用按钮</wd-button>
</template>
```

### 7. 懒加载大型组件

```vue
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

// 懒加载大型业务组件
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/HeavyChart/HeavyChart.vue')
)
</script>

<template>
  <HeavyChart v-if="showChart" />
</template>
```

### 8. 组件版本管理

```typescript
// 使用别名管理组件版本
easycom: {
  custom: {
    // v2 版本组件
    '^wd2-(.*)': '@/wd-v2/components/wd-$1/wd-$1.vue',
    // v3 版本组件（新版本）
    '^wd-(.*)': '@/wd-v3/components/wd-$1/wd-$1.vue',
  },
}
```

## 常见问题

### 1. 组件未被识别

**问题现象：**
- 使用组件时报错 "Unknown component"
- IDE 无法识别组件

**问题原因：**
- easycom 规则配置错误
- 组件文件路径不正确
- 组件命名不符合规范

**解决方案：**

```typescript
// 检查 easycom 配置
easycom: {
  autoscan: true,
  custom: {
    // 确保正则表达式正确
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',  // ✅
    'wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',   // ❌ 缺少 ^
  },
}

// 确保文件结构正确
src/wd/components/
├── wd-button/
│   └── wd-button.vue     # ✅ 目录名和文件名一致
└── wd-toast/
    └── toast.vue         # ❌ 文件名不一致
```

### 2. 类型提示不生效

**问题现象：**
- 组件可以使用但无 TypeScript 类型提示
- Props 没有自动补全

**问题原因：**
- 未配置 Vite 插件
- 类型声明文件未生成或未包含

**解决方案：**

```typescript
// 1. 确保配置了 Vite 插件
import Components from '@uni-helper/vite-plugin-uni-components'

Components({
  dts: 'src/types/components.d.ts',  // 启用类型生成
})

// 2. 确保 tsconfig.json 包含类型文件
{
  "include": [
    "src/**/*.vue",
    "src/**/*.ts",
    "src/types/*.d.ts"  // 确保包含
  ]
}

// 3. 重启 IDE 或 TypeScript 服务
```

### 3. 开发时组件热更新不生效

**问题现象：**
- 新增组件后需要重启才能使用
- 修改组件后页面不更新

**问题原因：**
- 新增组件后 easycom 缓存未更新

**解决方案：**

```bash
# 新增组件后重启开发服务器
pnpm dev:h5

# 或者使用 vite-restart 插件自动重启
```

```typescript
// vite/plugins/vite-restart.ts
import ViteRestart from 'vite-plugin-restart'

export default () => {
  return ViteRestart({
    restart: [
      'src/components/**/*/index.vue',
      'src/wd/components/**/*/wd-*.vue',
    ],
  })
}
```

### 4. 同名组件冲突

**问题现象：**
- 多个组件库有同名组件
- 加载了错误的组件

**问题原因：**
- 多个规则匹配同一组件名
- 优先级配置不当

**解决方案：**

```typescript
// 使用不同前缀避免冲突
easycom: {
  custom: {
    // WD UI 的 Button
    '^wd-button': '@/wd/components/wd-button/wd-button.vue',
    // 自定义 Button
    '^my-button': '@/components/MyButton/MyButton.vue',
    // uni-ui 的 Button
    '^uni-button': '@dcloudio/uni-ui/lib/uni-button/uni-button.vue',
  },
}
```

```vue
<!-- 使用时明确区分 -->
<wd-button>WD 按钮</wd-button>
<my-button>自定义按钮</my-button>
<uni-button>uni-ui 按钮</uni-button>
```

### 5. 按需导入失效

**问题现象：**
- 打包体积过大
- 未使用的组件也被打包

**问题原因：**
- 组件被全局注册
- 存在副作用导入

**解决方案：**

```typescript
// ❌ 不推荐：全局注册所有组件
import { WdButton, WdCell, WdIcon } from '@/wd'
app.component('wd-button', WdButton)
app.component('wd-cell', WdCell)
app.component('wd-icon', WdIcon)

// ✅ 推荐：使用 easycom 自动按需导入
easycom: {
  custom: {
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
  },
}
```

### 6. 小程序平台组件不生效

**问题现象：**
- H5 正常但小程序不显示组件
- 控制台报组件未注册

**问题原因：**
- 小程序需要在 pages.json 中声明 easycom
- 路径别名在小程序中解析不同

**解决方案：**

```typescript
// pages.config.ts - 确保正确配置
export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      // 使用 @ 别名，确保 vite 配置了别名解析
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})

// vite.config.ts - 确保配置了别名
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

### 7. 循环依赖问题

**问题现象：**
- 组件加载时报循环依赖错误
- 页面白屏或组件渲染异常

**问题原因：**
- 组件之间相互引用形成循环

**解决方案：**

```typescript
// ❌ 避免循环依赖
// ComponentA.vue 引用 ComponentB
// ComponentB.vue 引用 ComponentA

// ✅ 使用异步组件打破循环
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

const ComponentB = defineAsyncComponent(() =>
  import('./ComponentB.vue')
)
</script>
```

### 8. 组件样式丢失

**问题现象：**
- 组件渲染正常但样式不生效
- 部分平台样式丢失

**问题原因：**
- 样式文件未正确导入
- 样式隔离配置问题

**解决方案：**

```vue
<!-- 组件中正确配置样式选项 -->
<script lang="ts" setup>
defineOptions({
  name: 'WdButton',
  options: {
    addGlobalClass: true,      // 允许外部样式影响组件
    virtualHost: true,         // 启用虚拟节点
    styleIsolation: 'shared',  // 样式共享
  },
})
</script>

<style lang="scss" scoped>
// 或使用 :deep() 穿透
:deep(.wd-button) {
  // 自定义样式
}
</style>
```

