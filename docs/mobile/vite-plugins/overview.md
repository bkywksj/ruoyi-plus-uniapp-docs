# Vite 插件概览

## 介绍

本项目使用 Vite 作为构建工具，集成了丰富的 Vite 插件来增强开发体验、优化构建流程、实现自动化代码生成。插件系统是项目构建的核心基础设施，通过精心设计的插件组合，实现了从开发到部署的完整自动化工作流。

**核心特性:**

- **UniApp 生态集成** - 完整支持 UniApp 多端开发，包括页面路由、布局系统、组件自动导入、平台条件编译等
- **智能自动导入** - 自动导入 Vue、Pinia、UniApp API 及项目内 Composables，无需手动 import
- **OpenAPI 代码生成** - 从后端 Swagger 文档自动生成类型安全的 API 接口代码
- **静态资源类型化** - 自动扫描静态资源并生成 TypeScript 类型声明
- **分包优化** - 智能代码分割和分包优化，提升应用加载性能
- **原子化 CSS** - UnoCSS 原子化样式引擎，按需生成最小化样式
- **热重载增强** - 配置文件变更自动重启，优化开发体验

## 架构设计

### 插件系统架构图

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Vite 插件系统架构                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         前置生成阶段 (buildStart)                    │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────────────────┐   │   │
│  │  │ static-assets-types │  │          openapi-generator          │   │   │
│  │  │   静态资源类型生成    │  │     OpenAPI API/类型代码生成        │   │   │
│  │  │                     │  │                                     │   │   │
│  │  │ • 扫描 static 目录   │  │ • 解析 Swagger 文档                 │   │   │
│  │  │ • 生成类型声明文件   │  │ • 生成 *Api.ts / *Types.ts         │   │   │
│  │  │ • 自动热更新        │  │ • 支持增量更新                      │   │   │
│  │  └─────────────────────┘  └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         UniApp 核心插件层                            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │  uni-pages  │ │ uni-layouts │ │uni-platform │ │uni-manifest │   │   │
│  │  │  页面路由   │ │  布局系统   │ │ 平台编译   │ │ 配置类型   │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         自动导入插件层                               │   │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │     auto-import        │  │      uni-components             │   │   │
│  │  │   API 自动导入         │  │      组件自动导入                │   │   │
│  │  │                        │  │                                 │   │   │
│  │  │ • vue/pinia/uni-app    │  │ • 扫描 components 目录          │   │   │
│  │  │ • composables          │  │ • 自动注册组件                  │   │   │
│  │  │ • stores/modules       │  │ • 生成类型声明                  │   │   │
│  │  └────────────────────────┘  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         优化插件层                                   │   │
│  │  ┌────────────────────────┐  ┌────────────────────────────────────┐ │   │
│  │  │   bundle-optimizer     │  │             UnoCSS                 │ │   │
│  │  │     分包优化           │  │          原子化CSS引擎             │ │   │
│  │  │                        │  │                                    │ │   │
│  │  │ • 代码分割优化         │  │ • 按需生成样式                     │ │   │
│  │  │ • 异步组件跨包引用     │  │ • 预设规则支持                     │ │   │
│  │  │ • 异步模块跨包调用     │  │ • 最小化产物                       │ │   │
│  │  └────────────────────────┘  └────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         开发工具插件层                               │   │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │     vite-restart       │  │      fix-vite-plugin-vue       │   │   │
│  │  │     配置热重启         │  │      Vue 插件修复               │   │   │
│  │  │                        │  │                                 │   │   │
│  │  │ • vite.config.js 变更  │  │ • 修复 devTools 相关问题        │   │   │
│  │  │ • 自动重启开发服务器   │  │                                 │   │   │
│  │  └────────────────────────┘  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    平台特定插件 (按需加载)                           │   │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │     html-transform     │  │       copyNativeRes             │   │   │
│  │  │    H5 构建时间注入      │  │      App 原生资源复制           │   │   │
│  │  │    (仅 H5 平台)         │  │      (仅 App 平台)              │   │   │
│  │  └────────────────────────┘  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              @dcloudio/vite-plugin-uni (必须最后加载)                │   │
│  │                        UniApp 核心构建插件                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 插件加载顺序流程图

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          插件加载顺序                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 1. static-assets-types                               │
         │    • 最先运行，生成静态资源类型声明                    │
         │    • 确保其他插件可以使用类型安全的资源引用            │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 2. openapi-generator                                 │
         │    • 生成 API 接口代码和类型定义                      │
         │    • 按需触发（手动/启动时）                          │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 3. UniApp 核心插件                                   │
         │    • uni-pages: 页面路由自动生成                     │
         │    • uni-layouts: 页面布局系统                       │
         │    • uni-platform: 平台条件编译                      │
         │    • uni-manifest: manifest.json 类型支持            │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 4. fix-vite-plugin-vue                               │
         │    • 临时修复 Vue 插件的 devTools 问题               │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 5. UnoCSS                                            │
         │    • 原子化 CSS 引擎                                 │
         │    • 异步导入，确保兼容性                            │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 6. 自动导入插件                                      │
         │    • auto-import: Vue/Pinia/UniApp API               │
         │    • uni-components: 组件自动导入                    │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 7. bundle-optimizer                                  │
         │    • 分包优化（需要在 uni-pages 之后）               │
         │    • 异步模块/组件跨包调用优化                       │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 8. vite-restart                                      │
         │    • 配置文件变更热重启                              │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 9. 平台特定插件                                      │
         │    • H5: html-transform（构建时间注入）              │
         │    • App: copyNativeRes（原生资源复制）              │
         └─────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────┐
         │ 10. @dcloudio/vite-plugin-uni                        │
         │     ⚠️ 必须最后加载                                   │
         │     UniApp 核心构建插件，处理最终编译                 │
         └─────────────────────────────────────────────────────┘
```

## 插件分类

### 插件版本信息

| 插件名称 | 版本 | 说明 |
|---------|------|------|
| `@dcloudio/vite-plugin-uni` | 3.0.0-4060620250520001 | UniApp 核心构建插件 |
| `@uni-helper/vite-plugin-uni-pages` | 0.2.28 | 页面路由自动生成 |
| `@uni-helper/vite-plugin-uni-layouts` | ^0.1.10 | 页面布局系统 |
| `@uni-helper/vite-plugin-uni-components` | ^0.2.0 | 组件自动导入 |
| `@uni-helper/vite-plugin-uni-manifest` | ^0.2.8 | manifest.json 类型支持 |
| `@uni-helper/vite-plugin-uni-platform` | ^0.0.4 | 平台条件编译 |
| `unplugin-auto-import` | 19.1.2 | Vue/Pinia/UniApp API 自动导入 |
| `@uni-ku/bundle-optimizer` | ^1.3.6 | 分包优化插件 |
| `unocss` | 65.4.2 | 原子化 CSS 引擎 |
| `vite-plugin-restart` | ^0.4.2 | 配置文件变更热重启 |

### UniApp 系列插件

基于 `@uni-helper` 生态的 UniApp 增强插件，提供完整的多端开发支持：

| 插件名称 | 功能说明 | 配置文件 |
|---------|---------|---------|
| `@dcloudio/vite-plugin-uni` | UniApp 核心构建插件，处理多端编译 | - |
| `@uni-helper/vite-plugin-uni-pages` | 自动扫描页面目录生成路由配置 | `uni-pages.ts` |
| `@uni-helper/vite-plugin-uni-layouts` | 页面布局系统，支持多种布局模板 | - |
| `@uni-helper/vite-plugin-uni-components` | 组件自动扫描和导入 | `components.ts` |
| `@uni-helper/vite-plugin-uni-manifest` | manifest.json TypeScript 类型支持 | - |
| `@uni-helper/vite-plugin-uni-platform` | 平台条件编译增强 | - |

### 自动导入插件

| 插件名称 | 功能说明 | 配置文件 |
|---------|---------|---------|
| `unplugin-auto-import` | 自动导入 Vue、Pinia、UniApp 等常用 API | `auto-imports.ts` |
| `@uni-ku/bundle-optimizer` | 分包优化、模块异步跨包调用 | `optimization.ts` |

### 自定义插件

项目自研的 Vite 插件，满足特定业务需求：

| 插件名称 | 功能说明 | 配置文件 |
|---------|---------|---------|
| `openapi` | 从 OpenAPI 文档自动生成 API 接口代码 | `openapi/index.ts` |
| `static-assets-types` | 扫描静态资源目录生成 TypeScript 类型 | `static-assets-types.ts` |
| `copyNativeRes` | App 平台原生资源复制 | `copyNativeRes.ts` |

### 样式和开发工具插件

| 插件名称 | 功能说明 | 配置文件 |
|---------|---------|---------|
| `UnoCSS` | 原子化 CSS 引擎 | `unocss.ts` |
| `vite-plugin-restart` | 配置文件变更时自动重启开发服务器 | `vite-restart.ts` |

## 插件配置入口

所有插件的配置都集中在 `vite/plugins/` 目录下：

```text
vite/plugins/
├── index.ts                # 插件聚合入口（核心文件）
├── uni-pages.ts            # uni-pages 页面路由配置
├── auto-imports.ts         # API 自动导入配置
├── components.ts           # 组件自动导入配置
├── optimization.ts         # 分包优化配置
├── vite-restart.ts         # 热重启配置
├── unocss.ts               # UnoCSS 配置
├── static-assets-types.ts  # 静态资源类型生成
├── copyNativeRes.ts        # 原生资源复制（App 平台）
└── openapi/                # OpenAPI 代码生成
    ├── index.ts            # 插件入口
    ├── parser.ts           # OpenAPI 文档解析器
    ├── typeGenerator.ts    # 类型定义生成器
    ├── apiGenerator.ts     # API 函数生成器
    └── utils.ts            # 工具函数
```

## 快速开始

### 基本用法

在 `vite.config.ts` 中引入插件：

```typescript
import process from 'node:process'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd())

  return defineConfig({
    // 加载所有 Vite 插件
    plugins: await createVitePlugins({ command, mode, env }),

    // 其他配置...
  })
}
```

### 插件入口配置详解

```typescript
// vite/plugins/index.ts
import process from 'node:process'
// 有配置的插件单独抽离
import createUniPages from './uni-pages'
import createAutoImport from './auto-imports'
import createComponents from './components'
import createOptimization from './optimization'
import createViteRestart from './vite-restart'
import createStaticAssetsTypes from './static-assets-types'
import createOpenApiPlugin from './openapi'
// 无配置或简单配置的插件直接导入
import Uni from '@dcloudio/vite-plugin-uni'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'
import { getCurrentTime } from '../../src/utils/date'

/** 导出 Vite 插件配置函数 */
export default async ({
  command,
  mode,
  env,
}: {
  command: string
  mode: string
  env: Record<string, string>
}) => {
  // 存储所有 Vite 插件的数组
  const vitePlugins: any[] = []

  const { UNI_PLATFORM } = process.env
  const { VITE_APP_BASE_API, VITE_APP_BASE_API_PORT } = env

  // 1. 静态资源类型生成插件（需要在早期运行）
  vitePlugins.push(
    createStaticAssetsTypes({
      enabled: true,
    }),
  )

  // 2. OpenAPI 代码生成插件
  const apiPort = VITE_APP_BASE_API_PORT || '5500'
  vitePlugins.push(
    createOpenApiPlugin({
      input: `http://127.0.0.1:${apiPort}/v3/api-docs/business`,
      output: 'src/api',
      mode: 'manual', // 'manual' | 'once'
      enabled: true,
      ignore: {
        modules: ['chat'],
        files: ['system*', 'tableDictTypes*'],
        functions: ['template*', 'import*', 'export*'],
      },
    }),
  )

  // 3. UniApp 相关插件
  vitePlugins.push(createUniPages(mode))
  vitePlugins.push(UniLayouts())
  vitePlugins.push(UniPlatform())
  vitePlugins.push(UniManifest())

  // 4. 临时修复 Vue 插件的 BUG
  vitePlugins.push({
    name: 'fix-vite-plugin-vue',
    configResolved(config: any) {
      const plugin = config.plugins.find((p: any) => p.name === 'vite:vue')
      if (plugin && plugin.api && plugin.api.options) {
        plugin.api.options.devToolsEnabled = false
      }
    },
  })

  // 5. UnoCSS 原子化 CSS 引擎
  const UnoCSS = (await import('unocss/vite')).default
  vitePlugins.push(UnoCSS())

  // 6. 自动导入相关插件
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createComponents())

  // 7. 分包优化插件（需要在 UniPages 之后）
  vitePlugins.push(createOptimization())

  // 8. 开发工具插件
  vitePlugins.push(createViteRestart())

  // 9. 平台特定插件
  if (UNI_PLATFORM === 'h5') {
    vitePlugins.push({
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace('%BUILD_TIME%', getCurrentTime)
      },
    })
  }

  // 10. Uni 插件必须放在最后
  vitePlugins.push(Uni())

  // 过滤掉空值
  return vitePlugins.filter(Boolean)
}
```

## UniApp 核心插件

### uni-pages 页面路由插件

自动扫描页面目录并生成路由配置，支持分包管理和布局系统集成：

```typescript
// vite/plugins/uni-pages.ts
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  return UniPages({
    // 直接设置主页
    homePage: 'pages/index/index',

    // 排除的组件路径
    exclude: ['**/components/**/**.*'],

    // 页面可以使用 route 块配置路由
    routeBlockLang: 'json5',

    // 分包配置
    subPackages: [
      'src/pages-sub/admin',
      // 根据环境条件加载分包
      // ...(mode === 'production' ? [] : ['src/pages-sub/demo']),
    ],

    // 类型声明文件路径
    dts: 'src/types/uni-pages.d.ts',

    // 页面元数据合并后的钩子
    onAfterMergePageMetaData(ctx) {
      // 处理主包页面
      ctx.pageMetaData.forEach((page) => {
        page.layout = 'default'
      })

      // 处理分包页面
      if (ctx.subPageMetaData) {
        ctx.subPageMetaData.forEach((subPackage) => {
          subPackage.pages.forEach((page) => {
            page.layout = 'default'
            // 根据分包根目录设置不同的 layout
            if (subPackage.root === 'pages-sub/admin') {
              page.layout = 'default'
            }
          })
        })
      }
    },
  })
}
```

**主要功能:**

1. **自动页面扫描** - 自动扫描 `src/pages` 目录下的页面文件
2. **分包管理** - 支持配置分包目录，自动处理分包路由
3. **布局系统** - 通过 `onAfterMergePageMetaData` 钩子设置页面布局
4. **类型生成** - 自动生成 `uni-pages.d.ts` 类型声明文件

### uni-layouts 布局系统插件

为页面提供统一的布局模板：

```typescript
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

// 在插件数组中添加
vitePlugins.push(UniLayouts())
```

**布局文件位置:** `src/layouts/`

```text
src/layouts/
├── default.vue    # 默认布局
├── blank.vue      # 空白布局
└── admin.vue      # 管理后台布局
```

**使用示例:**

```vue
<!-- 页面中指定布局 -->
<route lang="json5">
{
  layout: 'admin'
}
</route>

<template>
  <view>页面内容</view>
</template>
```

### uni-platform 平台条件编译插件

增强平台条件编译能力：

```typescript
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'

// 在插件数组中添加
vitePlugins.push(UniPlatform())
```

**使用场景:**

```vue
<template>
  <!-- 仅在微信小程序显示 -->
  <view v-if="$mp.weixin">微信小程序内容</view>

  <!-- 仅在 H5 显示 -->
  <view v-if="$mp.h5">H5 内容</view>
</template>
```

### uni-manifest 配置类型插件

为 `manifest.json` 提供 TypeScript 类型支持：

```typescript
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'

// 在插件数组中添加
vitePlugins.push(UniManifest())
```

**作用:**

- 在编辑 `manifest.json` 时提供类型提示
- 自动验证配置项的正确性
- 减少配置错误

### uni-components 组件自动导入插件

自动扫描和导入组件，无需手动注册：

```typescript
// vite/plugins/components.ts
import Components from '@uni-helper/vite-plugin-uni-components'

export default () => {
  return Components({
    // 支持的文件扩展名
    extensions: ['vue'],

    // 是否递归扫描子目录
    deep: true,

    // 是否把目录名作为命名空间前缀
    // true 时组件名为: 目录名 + 组件名
    directoryAsNamespace: false,

    // 自动生成的组件类型声明文件路径
    dts: 'src/types/components.d.ts',
  })
}
```

**自动扫描目录:**

```text
src/
├── components/         # 通用组件目录
│   ├── WdButton.vue   # 自动注册为 <WdButton>
│   ├── auth/
│   │   └── AuthModal.vue  # 自动注册为 <AuthModal>
│   └── business/
│       └── UserCard.vue   # 自动注册为 <UserCard>
└── wd/                 # WD UI 组件库
    └── components/
        └── wd-icon/
            └── wd-icon.vue  # 自动注册为 <wd-icon>
```

## 自动导入插件

### auto-import API 自动导入

自动导入 Vue、Pinia、UniApp 等常用 API，无需手动 import：

```typescript
// vite/plugins/auto-imports.ts
import AutoImport from 'unplugin-auto-import/vite'

export default () => {
  return AutoImport({
    // 预设导入
    imports: ['vue', 'uni-app', 'pinia'],

    // 自动导入项目目录
    dirs: [
      'src/composables',      // 组合式函数
      'src/stores/modules',   // 状态管理模块
    ],

    // ESLint 自动导入配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },

    // 是否在 vue 模板中自动导入
    vueTemplate: true,

    // 类型声明文件路径
    dts: 'src/types/auto-imports.d.ts',
  })
}
```

**自动导入的 API:**

| 来源 | 自动导入的 API |
|------|---------------|
| Vue | `ref`, `reactive`, `computed`, `watch`, `onMounted`, `nextTick`... |
| Pinia | `defineStore`, `storeToRefs` |
| UniApp | `uni.*` 所有 API |
| 项目 Composables | `useUserStore`, `useToast`, `useModal`, `useHttp`... |
| 项目 Stores | `useUserStore`, `useDictStore`, `useTabbarStore`... |

**使用示例:**

```vue
<script setup lang="ts">
// 无需 import，直接使用
const count = ref(0)
const userStore = useUserStore()

onMounted(() => {
  uni.showToast({ title: '页面加载完成' })
})
</script>
```

### bundle-optimizer 分包优化

智能优化代码分割和分包策略：

```typescript
// vite/plugins/optimization.ts
import Optimization from '@uni-ku/bundle-optimizer'

export default () => {
  return Optimization({
    // 功能开关配置
    enable: {
      // 启用分包优化 - 自动分析和优化代码分割策略
      optimization: true,

      // 启用异步导入优化 - 支持动态 import() 的跨包调用
      'async-import': true,

      // 启用异步组件优化 - 支持组件的懒加载和跨包引用
      'async-component': true,
    },

    // TypeScript 类型定义配置
    dts: {
      // 类型定义文件的基础路径
      base: 'src/types',
    },

    // 调试配置
    logger: false, // 关闭构建过程中的日志输出
  })
}
```

**优化效果:**

1. **代码分割优化** - 避免重复打包相同模块
2. **异步模块跨包调用** - 支持在分包间动态导入模块
3. **异步组件跨包引用** - 支持在分包间懒加载组件
4. **智能依赖分析** - 优化依赖关系和打包策略

## 自定义插件详解

### static-assets-types 静态资源类型生成

自动扫描静态资源目录并生成 TypeScript 类型文件：

```typescript
// vite/plugins/static-assets-types.ts
interface StaticAssetsTypesOptions {
  /** 静态资源目录，相对于项目根目录 */
  staticDir?: string
  /** 类型文件输出路径 */
  outputPath?: string
  /** 支持的图片扩展名 */
  extensions?: string[]
  /** 路径前缀 */
  pathPrefix?: string
  /** 是否启用 */
  enabled?: boolean
  /** 排除的目录列表 */
  excludeDirs?: string[]
}

export default (options: StaticAssetsTypesOptions = {}) => {
  const {
    staticDir = 'src/static',
    outputPath = 'src/types/static-assets.d.ts',
    extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp'],
    pathPrefix = '/static',
    enabled = true,
    excludeDirs = ['app', 'styles'],
  } = options

  return {
    name: 'static-assets-types',

    // 构建开始时生成类型文件
    buildStart() {
      // 扫描并生成类型
    },

    // 热更新处理
    handleHotUpdate({ file }) {
      // 静态资源变化时重新生成类型
    },
  }
}
```

**生成的类型文件示例:**

```typescript
// src/types/static-assets.d.ts
/**
 * 静态资源类型声明文件
 * 此文件由 static-assets-types 插件自动生成
 */

declare global {
  /** 静态资源相关的全局类型 */
  interface StaticAssets {
    images: StaticImagePath
  }

  /** 全局图片源类型 */
  type ImageSrc = StaticImagePath | string

  /** 静态图片资源路径类型 */
  type StaticImagePath =
    | '/static/logo.png'
    | '/static/icons/home.svg'
    | '/static/banners/banner1.jpg'
}

/** 静态图片资源路径常量对象 */
export const STATIC_IMAGES = {
  LOGO: '/static/logo.png' as const,
  HOME: '/static/icons/home.svg' as const,
  BANNER1: '/static/banners/banner1.jpg' as const,
} as const

/** 获取静态图片资源路径 */
export const getStaticImage = (key: StaticImageKey): StaticImagePath => {
  return STATIC_IMAGES[key]
}
```

**使用示例:**

```vue
<template>
  <!-- 类型安全的图片路径 -->
  <image :src="STATIC_IMAGES.LOGO" />
  <image :src="getStaticImage('HOME')" />
</template>

<script setup lang="ts">
import { STATIC_IMAGES, getStaticImage } from '@/types/static-assets'
</script>
```

### openapi OpenAPI 代码生成

从后端 Swagger 文档自动生成类型安全的 API 接口代码：

```typescript
// vite/plugins/openapi/index.ts
interface OpenApiPluginOptions {
  /** OpenAPI 文档 URL */
  input: string
  /** 输出目录 */
  output: string
  /** 生成模式：manual-手动触发，once-启动时生成一次 */
  mode?: 'manual' | 'once'
  /** 是否启用插件 */
  enabled?: boolean
  /** 生成前钩子 */
  beforeGenerate?: () => void | Promise<void>
  /** 生成后钩子 */
  afterGenerate?: () => void | Promise<void>
  /** 忽略配置 */
  ignore?: {
    /** 忽略的 API 路径（支持通配符） */
    paths?: string[]
    /** 忽略的模块名（精确匹配） */
    modules?: string[]
    /** 忽略的文件名（支持通配符） */
    files?: string[]
    /** 忽略的接口函数名（支持通配符） */
    functions?: string[]
    /** 自定义过滤函数 */
    filter?: (moduleKey: string, apis: any[]) => boolean
  }
}

// 使用示例
createOpenApiPlugin({
  input: 'http://127.0.0.1:5500/v3/api-docs/business',
  output: 'src/api',
  mode: 'manual',
  enabled: true,
  ignore: {
    modules: ['chat'],
    files: ['system*', 'tableDictTypes*'],
    functions: ['template*', 'import*', 'export*'],
  },
})
```

**生成模式:**

| 模式 | 说明 | 触发方式 |
|------|------|---------|
| `manual` | 手动触发生成 | 访问 `http://localhost:端口/__openapi_generate` |
| `once` | 启动时生成一次 | 开发服务器启动时自动执行 |

**生成的文件结构:**

```text
src/api/
├── app/
│   ├── home/
│   │   ├── homeApi.ts       # API 函数
│   │   └── homeTypes.ts     # 类型定义
│   └── user/
│       ├── userApi.ts
│       └── userTypes.ts
├── common/
│   └── mall/
│       ├── orderApi.ts
│       └── orderTypes.ts
└── business/
    └── product/
        ├── productApi.ts
        └── productTypes.ts
```

**生成的 API 函数示例:**

```typescript
// src/api/app/home/homeApi.ts
import type { HomeBannerVo, HomeRecommendVo } from './homeTypes'
import { useRequest } from '@/composables'

/**
 * 获取首页轮播图
 */
export const getHomeBanners = () => {
  return useRequest<HomeBannerVo[]>({
    url: '/app/home/banners',
    method: 'GET',
  })
}

/**
 * 获取首页推荐商品
 */
export const getHomeRecommends = (params: HomeRecommendQuery) => {
  return useRequest<HomeBannerVo[]>({
    url: '/app/home/recommends',
    method: 'GET',
    params,
  })
}
```

**生成的类型定义示例:**

```typescript
// src/api/app/home/homeTypes.ts
/**
 * 首页轮播图 VO
 */
export interface HomeBannerVo {
  /** 轮播图ID */
  id: number
  /** 图片URL */
  imageUrl: string
  /** 跳转链接 */
  linkUrl?: string
  /** 排序 */
  sort: number
}

/**
 * 首页推荐查询参数
 */
export interface HomeRecommendQuery {
  /** 页码 */
  pageNum?: number
  /** 每页数量 */
  pageSize?: number
}
```

### copyNativeRes App 原生资源复制

在 App 平台构建完成后复制原生资源文件：

```typescript
// vite/plugins/copyNativeRes.ts
import path from 'node:path'
import fs from 'fs-extra'
import process from 'node:process'

export default () => {
  // 源目录：项目根目录下的 src/nativeResources
  const waitPath = path.resolve(__dirname, '../src/nativeResources')

  // 目标目录：根据环境和平台动态构建路径
  const buildPath = path.resolve(
    __dirname,
    '../dist',
    process.env.VITE_APP_ENV === 'production' ? 'build' : 'dev',
    process.env.UNI_PLATFORM!,
    'nativeResources',
  )

  return {
    enforce: 'post' as const,

    async writeBundle() {
      try {
        const sourceExists = await fs.pathExists(waitPath)
        if (!sourceExists) {
          console.warn(`[copyNativeRes] 源目录不存在，跳过复制`)
          return
        }

        await fs.ensureDir(buildPath)
        await fs.copy(waitPath, buildPath)

        console.log(`[copyNativeRes] 成功复制原生资源`)
      } catch (error) {
        console.error(`[copyNativeRes] 复制资源失败:`, error)
      }
    },
  }
}
```

**使用场景:**

- 复制原生插件资源文件
- 复制平台特定配置文件
- 确保原生代码在构建后正确放置

**目录结构:**

```text
src/nativeResources/
├── android/           # Android 原生资源
│   ├── libs/
│   └── res/
└── ios/               # iOS 原生资源
    └── Resources/
```

## 样式插件

### UnoCSS 原子化 CSS

项目使用 UnoCSS 作为原子化 CSS 引擎：

```typescript
// vite/plugins/unocss.ts
export default async () => {
  const UnoCSS = (await import('unocss/vite')).default
  return UnoCSS()
}
```

**配置文件:** `uno.config.ts`

```typescript
// uno.config.ts
import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetUni(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['wh-full', 'w-full h-full'],
  ],
  rules: [
    // 自定义规则
  ],
  theme: {
    colors: {
      primary: 'var(--primary-color)',
      success: 'var(--success-color)',
    },
  },
})
```

**使用示例:**

```vue
<template>
  <!-- 原子化样式 -->
  <view class="flex-center p-4 bg-primary text-white rounded-lg">
    <text class="text-lg font-bold">Hello UnoCSS</text>
  </view>

  <!-- 属性化模式 -->
  <view
    flex="~ center"
    p="4"
    bg="primary"
    text="white lg"
    rounded="lg"
  >
    <text font="bold">Attributify Mode</text>
  </view>
</template>
```

## 开发工具插件

### vite-restart 配置热重启

修改配置文件时自动重启开发服务器：

```typescript
// vite/plugins/vite-restart.ts
import ViteRestart from 'vite-plugin-restart'

export default () => {
  return ViteRestart({
    // 监听这些文件的变化，触发重启
    restart: [
      'vite.config.js',
      'vite.config.ts',
    ],
  })
}
```

**扩展配置示例:**

```typescript
ViteRestart({
  restart: [
    'vite.config.ts',
    'uno.config.ts',
    '.env',
    '.env.*',
  ],
})
```

### fix-vite-plugin-vue Vue 插件修复

临时修复 Vue 插件的 devTools 相关问题：

```typescript
// 内联插件，在 vite/plugins/index.ts 中定义
vitePlugins.push({
  name: 'fix-vite-plugin-vue',
  configResolved(config: any) {
    const plugin = config.plugins.find((p: any) => p.name === 'vite:vue')
    if (plugin && plugin.api && plugin.api.options) {
      plugin.api.options.devToolsEnabled = false
    }
  },
})
```

## 平台特定插件

### H5 构建时间注入

在 H5 平台注入构建时间戳：

```typescript
// 仅在 H5 平台启用
if (UNI_PLATFORM === 'h5') {
  vitePlugins.push({
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace('%BUILD_TIME%', getCurrentTime)
    },
  })
}
```

**HTML 模板配置:**

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="build-time" content="%BUILD_TIME%">
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

### App 原生资源复制

在 App 平台构建后复制原生资源（按需启用）：

```typescript
// 仅在 App 平台启用
// if (UNI_PLATFORM === 'app') {
//   vitePlugins.push(copyNativeRes())
// }
```

## 环境变量配置

### 支持的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `UNI_PLATFORM` | 当前构建平台 | `h5`, `mp-weixin`, `app` |
| `VITE_APP_BASE_API` | 后端 API 地址 | `http://localhost:5500` |
| `VITE_APP_BASE_API_PORT` | API 端口 | `5500` |
| `VITE_DELETE_CONSOLE` | 是否删除 console | `true`, `false` |
| `VITE_SHOW_SOURCEMAP` | 是否生成 sourcemap | `true`, `false` |
| `VITE_APP_ENV` | 应用环境 | `development`, `production` |

### 环境文件配置

```bash
# .env.development
VITE_APP_BASE_API=http://localhost:5500
VITE_APP_BASE_API_PORT=5500
VITE_DELETE_CONSOLE=false
VITE_SHOW_SOURCEMAP=true

# .env.production
VITE_APP_BASE_API=https://api.example.com
VITE_APP_BASE_API_PORT=443
VITE_DELETE_CONSOLE=true
VITE_SHOW_SOURCEMAP=false
```

## 类型声明文件

插件系统会自动生成多个类型声明文件：

| 文件路径 | 生成插件 | 说明 |
|---------|---------|------|
| `src/types/auto-imports.d.ts` | `unplugin-auto-import` | 自动导入的 API 类型 |
| `src/types/components.d.ts` | `uni-components` | 自动导入的组件类型 |
| `src/types/uni-pages.d.ts` | `uni-pages` | 页面路由类型 |
| `src/types/static-assets.d.ts` | `static-assets-types` | 静态资源类型 |

**类型文件示例:**

```typescript
// src/types/auto-imports.d.ts
export {}

declare global {
  // Vue
  const ref: typeof import('vue')['ref']
  const reactive: typeof import('vue')['reactive']
  const computed: typeof import('vue')['computed']
  // ...

  // Pinia
  const defineStore: typeof import('pinia')['defineStore']
  const storeToRefs: typeof import('pinia')['storeToRefs']

  // UniApp
  const uni: typeof import('@dcloudio/types')['uni']

  // Composables
  const useUserStore: typeof import('../stores/modules/user')['useUserStore']
  const useToast: typeof import('../composables/use-toast')['useToast']
}
```

## 最佳实践

### 1. 插件顺序规范

```typescript
// ✅ 正确的插件顺序
const vitePlugins = [
  // 1. 代码生成类插件（最先执行）
  createStaticAssetsTypes(),
  createOpenApiPlugin(),

  // 2. UniApp 核心插件
  createUniPages(mode),
  UniLayouts(),
  UniPlatform(),
  UniManifest(),

  // 3. 样式插件
  UnoCSS(),

  // 4. 自动导入插件
  createAutoImport(),
  createComponents(),

  // 5. 优化插件
  createOptimization(),

  // 6. 开发工具插件
  createViteRestart(),

  // 7. 平台特定插件
  // ...

  // 8. Uni 主插件（必须最后）
  Uni(),
]
```

### 2. 条件加载插件

```typescript
// ✅ 根据环境条件加载插件
if (command === 'serve') {
  // 仅开发环境
  vitePlugins.push(createDevOnlyPlugin())
}

if (UNI_PLATFORM === 'h5') {
  // 仅 H5 平台
  vitePlugins.push(createH5Plugin())
}

if (mode === 'production') {
  // 仅生产环境
  vitePlugins.push(createProdPlugin())
}
```

### 3. 插件配置分离

```typescript
// ✅ 将复杂配置抽离到单独文件
// vite/plugins/uni-pages.ts
export default (mode: string) => {
  return UniPages({
    // 详细配置
  })
}

// vite/plugins/index.ts
import createUniPages from './uni-pages'
vitePlugins.push(createUniPages(mode))
```

### 4. 类型声明管理

```typescript
// ✅ 统一管理类型声明输出路径
const DTS_BASE = 'src/types'

createAutoImport({
  dts: `${DTS_BASE}/auto-imports.d.ts`,
})

createComponents({
  dts: `${DTS_BASE}/components.d.ts`,
})

createUniPages({
  dts: `${DTS_BASE}/uni-pages.d.ts`,
})
```

### 5. OpenAPI 代码生成策略

```typescript
// ✅ 开发时使用手动模式，避免频繁生成
createOpenApiPlugin({
  mode: process.env.NODE_ENV === 'development' ? 'manual' : 'once',
  ignore: {
    // 忽略不需要的模块
    modules: ['chat', 'debug'],
    // 忽略不需要的文件
    files: ['system*', 'test*'],
  },
})
```

### 6. 分包优化配置

```typescript
// ✅ 启用所有优化功能
createOptimization({
  enable: {
    optimization: true,
    'async-import': true,
    'async-component': true,
  },
  logger: process.env.NODE_ENV === 'development',
})
```

## 常见问题

### 1. 插件加载顺序导致构建失败

**问题描述:**

构建时出现 `Error: Cannot find module 'xxx'` 或组件未定义错误。

**问题原因:**

- 插件加载顺序不正确
- 依赖的插件未先加载

**解决方案:**

```typescript
// ✅ 确保正确的加载顺序
// 1. 代码生成插件
// 2. UniApp 核心插件
// 3. 自动导入插件
// 4. 优化插件
// 5. Uni() 必须最后
```

### 2. OpenAPI 代码生成失败

**问题描述:**

访问 `/__openapi_generate` 无响应或报错。

**问题原因:**

- 后端服务未启动
- API 地址配置错误
- 网络连接问题

**解决方案:**

```typescript
// 1. 检查后端服务是否启动
// 2. 确认 API 地址正确
createOpenApiPlugin({
  input: 'http://127.0.0.1:5500/v3/api-docs/business',
  // ...
})

// 3. 检查控制台错误日志
// 4. 使用 once 模式调试
createOpenApiPlugin({
  mode: 'once', // 启动时自动生成，方便调试
})
```

### 3. 自动导入不生效

**问题描述:**

使用 `ref`、`useUserStore` 等 API 时提示未定义。

**问题原因:**

- 类型声明文件未生成
- ESLint 配置未更新
- 编辑器缓存问题

**解决方案:**

```bash
# 1. 删除生成的类型文件，重新生成
rm -rf src/types/auto-imports.d.ts
pnpm dev:h5

# 2. 重新生成 ESLint 配置
rm .eslintrc-auto-import.json
pnpm dev:h5

# 3. 重启编辑器/IDE
```

### 4. 静态资源类型未更新

**问题描述:**

新增静态资源后，类型提示不更新。

**问题原因:**

- 热更新未触发
- 文件扩展名不在支持列表中

**解决方案:**

```typescript
// 1. 检查扩展名是否支持
createStaticAssetsTypes({
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp'],
  // 添加其他扩展名
})

// 2. 手动重启开发服务器
// 3. 检查排除目录配置
createStaticAssetsTypes({
  excludeDirs: ['app', 'styles'],
  // 确保资源目录未被排除
})
```

### 5. 分包优化不生效

**问题描述:**

分包体积仍然很大，模块重复打包。

**问题原因:**

- 优化功能未启用
- 分包配置不正确
- 循环依赖问题

**解决方案:**

```typescript
// 1. 确保所有优化功能启用
createOptimization({
  enable: {
    optimization: true,
    'async-import': true,
    'async-component': true,
  },
  logger: true, // 启用日志查看优化效果
})

// 2. 检查分包配置
createUniPages({
  subPackages: [
    'src/pages-sub/admin',
    // 确保分包路径正确
  ],
})

// 3. 避免循环依赖
// 使用动态导入打破循环
const module = await import('./circular-module')
```

### 6. UnoCSS 样式不生效

**问题描述:**

原子化样式类不生效，元素无样式。

**问题原因:**

- UnoCSS 配置问题
- 样式未正确引入
- 预设未配置

**解决方案:**

```typescript
// 1. 检查 uno.config.ts 配置
import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  presets: [
    presetUni(), // 必须包含 uni 预设
    // ...
  ],
})

// 2. 确保入口文件引入 UnoCSS
// main.ts
import 'virtual:uno.css'

// 3. 检查样式是否被 tree-shake
// 确保使用的类名在模板中静态定义
```

### 7. 组件自动导入不工作

**问题描述:**

组件使用时提示 "Unknown custom element"。

**问题原因:**

- 组件目录结构不正确
- 组件命名不规范
- 扫描配置问题

**解决方案:**

```typescript
// 1. 确保组件在正确目录
// src/components/MyButton.vue ✅
// src/my-button.vue ❌

// 2. 组件命名使用 PascalCase
// MyButton.vue ✅
// my-button.vue ❌ (可以使用，但需要注意)

// 3. 检查扫描配置
createComponents({
  extensions: ['vue'],
  deep: true,
  dts: 'src/types/components.d.ts',
})
```

### 8. 热更新循环

**问题描述:**

开发时页面不断刷新，陷入无限循环。

**问题原因:**

- 类型生成插件触发自身更新
- 文件写入触发热更新

**解决方案:**

```typescript
// static-assets-types 插件已内置防循环机制
// 对比现有文件内容，避免不必要的写入
if (existsSync(outputFilePath)) {
  const existingContent = readFileSync(outputFilePath, 'utf-8')
  if (existingContent === typeContent) {
    return // 内容相同，跳过写入
  }
}
```

## API 参考

### createVitePlugins 函数

```typescript
interface CreateVitePluginsOptions {
  /** Vite 命令：serve 或 build */
  command: string
  /** 构建模式 */
  mode: string
  /** 环境变量 */
  env: Record<string, string>
}

function createVitePlugins(options: CreateVitePluginsOptions): Promise<Plugin[]>
```

### StaticAssetsTypesOptions

```typescript
interface StaticAssetsTypesOptions {
  /** 静态资源目录，相对于项目根目录 */
  staticDir?: string
  /** 类型文件输出路径 */
  outputPath?: string
  /** 支持的图片扩展名 */
  extensions?: string[]
  /** 路径前缀 */
  pathPrefix?: string
  /** 是否启用 */
  enabled?: boolean
  /** 排除的目录列表 */
  excludeDirs?: string[]
}
```

### OpenApiPluginOptions

```typescript
interface OpenApiPluginOptions {
  /** OpenAPI 文档 URL */
  input: string
  /** 输出目录 */
  output: string
  /** 生成模式 */
  mode?: 'manual' | 'once'
  /** 是否启用 */
  enabled?: boolean
  /** 生成前钩子 */
  beforeGenerate?: () => void | Promise<void>
  /** 生成后钩子 */
  afterGenerate?: () => void | Promise<void>
  /** 忽略配置 */
  ignore?: {
    paths?: string[]
    modules?: string[]
    files?: string[]
    functions?: string[]
    filter?: (moduleKey: string, apis: any[]) => boolean
  }
}
```

### OptimizationOptions

```typescript
interface OptimizationOptions {
  /** 功能开关 */
  enable: {
    /** 启用分包优化 */
    optimization?: boolean
    /** 启用异步导入优化 */
    'async-import'?: boolean
    /** 启用异步组件优化 */
    'async-component'?: boolean
  }
  /** TypeScript 类型定义配置 */
  dts?: {
    /** 类型定义文件基础路径 */
    base?: string
  }
  /** 是否启用日志 */
  logger?: boolean
}
```

## 扩展开发

### 自定义 Vite 插件

```typescript
// vite/plugins/my-custom-plugin.ts
import type { Plugin } from 'vite'

interface MyPluginOptions {
  enabled?: boolean
  // 其他配置项
}

export default (options: MyPluginOptions = {}): Plugin => {
  const { enabled = true } = options

  if (!enabled) {
    return { name: 'my-custom-plugin' }
  }

  return {
    name: 'my-custom-plugin',

    // 配置解析后调用
    configResolved(config) {
      console.log('Config resolved:', config.root)
    },

    // 构建开始时调用
    buildStart() {
      console.log('Build started')
    },

    // 转换代码
    transform(code, id) {
      if (id.endsWith('.vue')) {
        // 处理 Vue 文件
        return code
      }
    },

    // 热更新处理
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.json')) {
        // 处理 JSON 文件变化
        server.ws.send({
          type: 'full-reload',
        })
      }
    },

    // 构建结束时调用
    closeBundle() {
      console.log('Build finished')
    },
  }
}
```

### 注册自定义插件

```typescript
// vite/plugins/index.ts
import createMyCustomPlugin from './my-custom-plugin'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // ... 其他插件

  // 添加自定义插件
  vitePlugins.push(createMyCustomPlugin({
    enabled: true,
  }))

  // Uni() 必须最后
  vitePlugins.push(Uni())

  return vitePlugins.filter(Boolean)
}
```

## 性能优化

### 1. 按需加载插件

```typescript
// ✅ 根据平台按需加载
const { UNI_PLATFORM } = process.env

if (UNI_PLATFORM === 'h5') {
  // H5 专用插件
}

if (UNI_PLATFORM?.startsWith('mp-')) {
  // 小程序专用插件
}
```

### 2. 禁用不必要的日志

```typescript
// ✅ 生产环境禁用日志
createOptimization({
  logger: process.env.NODE_ENV !== 'production',
})
```

### 3. 合理配置代码生成

```typescript
// ✅ 开发时使用手动模式
createOpenApiPlugin({
  mode: 'manual', // 避免每次启动都生成
})

// ✅ 配置忽略规则减少生成量
createOpenApiPlugin({
  ignore: {
    modules: ['debug', 'test'],
    functions: ['*Mock', '*Test'],
  },
})
```

### 4. 优化静态资源扫描

```typescript
// ✅ 排除不需要类型化的目录
createStaticAssetsTypes({
  excludeDirs: ['app', 'styles', 'fonts'],
})
```

## 总结

本项目的 Vite 插件系统经过精心设计，提供了完整的开发和构建支持：

1. **UniApp 生态完整支持** - 页面路由、布局系统、组件自动导入、平台条件编译
2. **智能代码生成** - OpenAPI 接口代码、静态资源类型声明自动生成
3. **开发体验优化** - API 自动导入、配置热重启、类型安全
4. **构建性能优化** - 分包优化、按需加载、原子化 CSS
5. **可扩展架构** - 易于添加自定义插件和配置

通过合理配置和使用这些插件，可以显著提升开发效率和应用性能。
