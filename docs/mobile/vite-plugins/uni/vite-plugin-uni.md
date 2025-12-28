# 核心构建插件

## 介绍

核心构建插件（@dcloudio/vite-plugin-uni）是 UniApp 官方提供的 Vite 构建插件，负责将 Vue 3 项目编译为各平台可运行的代码。该插件是 UniApp 项目的核心依赖，提供了跨平台编译、条件编译、平台适配等关键能力。

**核心特性：**

- **跨平台编译** - 一套代码编译为 H5、小程序、App 等多个平台
- **条件编译** - 支持 `#ifdef`、`#ifndef` 等条件编译语法
- **Vue 3 支持** - 完整支持 Vue 3 Composition API 和 `<script setup>` 语法
- **平台适配** - 自动处理各平台 API 差异，提供统一的开发体验
- **热更新** - 开发模式下支持 HMR 热模块替换
- **生态集成** - 与 uni-helper 系列插件无缝配合

## 基本用法

### 插件配置

在 `vite/plugins/index.ts` 中配置：

```typescript
import Uni from '@dcloudio/vite-plugin-uni'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件配置...

  // Uni 插件必须放在最后
  vitePlugins.push(Uni())

  return vitePlugins
}
```

**重要说明：**

- `@dcloudio/vite-plugin-uni` 必须放在所有插件的最后位置
- 该插件会处理 `.vue` 文件的跨平台编译
- 自动集成 Vue 3 相关的 Vite 插件

### Vite 配置

```typescript
// vite.config.ts
import type { ConfigEnv, UserConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 获取当前编译平台
  const { UNI_PLATFORM } = process.env
  console.log('UNI_PLATFORM -> ', UNI_PLATFORM) // h5, mp-weixin, app 等

  // 加载环境变量
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return defineConfig({
    // 基础路径配置
    base: env.VITE_APP_PUBLIC_PATH || '/',

    // 环境变量目录
    envDir: './env',

    // 使用抽离后的插件配置
    plugins: await createVitePlugins({ command, mode, env }),

    // 平台标识注入
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
    },

    // 路径别名
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      hmr: true,
      strictPort: false,
      open: true,
    },

    // 构建配置
    build: {
      sourcemap: env.VITE_SHOW_SOURCEMAP === 'true',
      target: 'es6',
      minify: mode === 'development' ? false : 'esbuild',
    },
  })
}
```

## 平台编译

### 编译命令

```bash
# H5 平台
pnpm dev:h5      # 开发模式
pnpm build:h5    # 生产构建

# 微信小程序
pnpm dev:mp-weixin    # 开发模式
pnpm build:mp-weixin  # 生产构建

# App 平台
pnpm dev:app     # 开发模式
pnpm build:app   # 生产构建

# 支付宝小程序
pnpm dev:mp-alipay    # 开发模式
pnpm build:mp-alipay  # 生产构建

# 百度小程序
pnpm dev:mp-baidu     # 开发模式
pnpm build:mp-baidu   # 生产构建

# 字节跳动小程序
pnpm dev:mp-toutiao   # 开发模式
pnpm build:mp-toutiao # 生产构建

# QQ小程序
pnpm dev:mp-qq        # 开发模式
pnpm build:mp-qq      # 生产构建
```

### 平台标识

不同命令对应不同的环境变量：

| 命令 | command | mode | UNI_PLATFORM |
|------|---------|------|--------------|
| `pnpm dev:h5` | serve | development | h5 |
| `pnpm build:h5` | build | production | h5 |
| `pnpm dev:mp-weixin` | build | development | mp-weixin |
| `pnpm build:mp-weixin` | build | production | mp-weixin |
| `pnpm dev:app` | build | development | app |
| `pnpm build:app` | build | production | app |

**注意：** 小程序和 App 的开发模式下 `command` 为 `build`，而非 `serve`。

### 平台类型定义

```typescript
// src/types/env.d.ts
type UniPlatform =
  | 'h5'
  | 'app'
  | 'mp-weixin'
  | 'mp-alipay'
  | 'mp-baidu'
  | 'mp-toutiao'
  | 'mp-qq'
  | 'mp-kuaishou'
  | 'mp-lark'
  | 'mp-jd'
  | 'mp-360'

// 全局变量声明
declare const __UNI_PLATFORM__: UniPlatform
```

## 条件编译

### 基本语法

```vue
<template>
  <!-- 仅在 H5 平台显示 -->
  <!-- #ifdef H5 -->
  <view>这是 H5 专属内容</view>
  <!-- #endif -->

  <!-- 仅在微信小程序显示 -->
  <!-- #ifdef MP-WEIXIN -->
  <view>这是微信小程序专属内容</view>
  <!-- #endif -->

  <!-- 在 H5 或 App 平台显示 -->
  <!-- #ifdef H5 || APP -->
  <view>这是 H5 和 App 通用内容</view>
  <!-- #endif -->

  <!-- 非小程序平台显示 -->
  <!-- #ifndef MP -->
  <view>这不是小程序</view>
  <!-- #endif -->
</template>

<script lang="ts" setup>
// 仅在 H5 平台执行
// #ifdef H5
console.log('当前是 H5 平台')
// #endif

// 仅在微信小程序执行
// #ifdef MP-WEIXIN
console.log('当前是微信小程序')
// #endif
</script>

<style lang="scss" scoped>
/* 仅在 H5 平台生效 */
/* #ifdef H5 */
.container {
  max-width: 750px;
  margin: 0 auto;
}
/* #endif */

/* 仅在小程序生效 */
/* #ifdef MP */
.container {
  width: 100%;
}
/* #endif */
</style>
```

### 平台标识

| 条件编译标识 | 适用平台 |
|-------------|---------|
| `H5` | H5 网页 |
| `APP` / `APP-PLUS` | App（包含 nvue） |
| `APP-NVUE` / `APP-PLUS-NVUE` | App nvue 页面 |
| `MP` | 所有小程序 |
| `MP-WEIXIN` | 微信小程序 |
| `MP-ALIPAY` | 支付宝小程序 |
| `MP-BAIDU` | 百度小程序 |
| `MP-TOUTIAO` | 字节跳动小程序 |
| `MP-QQ` | QQ小程序 |
| `MP-KUAISHOU` | 快手小程序 |
| `MP-LARK` | 飞书小程序 |
| `MP-JD` | 京东小程序 |

### 组合条件

```vue
<script lang="ts" setup>
// 多平台条件
// #ifdef H5 || MP-WEIXIN || APP
console.log('在 H5、微信小程序或 App 中执行')
// #endif

// 排除某平台
// #ifndef MP-WEIXIN
console.log('不在微信小程序中执行')
// #endif

// 嵌套条件
// #ifdef MP
  // #ifdef MP-WEIXIN
  console.log('微信小程序')
  // #endif
  // #ifdef MP-ALIPAY
  console.log('支付宝小程序')
  // #endif
// #endif
</script>
```

## 运行时平台判断

### 使用全局变量

```typescript
// 通过 Vite define 注入的全局变量
if (__UNI_PLATFORM__ === 'h5') {
  console.log('当前是 H5 平台')
}

if (__UNI_PLATFORM__ === 'mp-weixin') {
  console.log('当前是微信小程序')
}
```

### 使用 uni API

```typescript
// 获取系统信息
const systemInfo = uni.getSystemInfoSync()

// 判断平台
switch (systemInfo.platform) {
  case 'ios':
    console.log('iOS 设备')
    break
  case 'android':
    console.log('Android 设备')
    break
  case 'devtools':
    console.log('开发工具')
    break
}

// 判断宿主环境
if (systemInfo.uniPlatform === 'mp-weixin') {
  console.log('微信小程序环境')
}
```

### 封装平台判断工具

```typescript
// src/utils/platform.ts
export const platform = {
  /** 是否 H5 */
  isH5: __UNI_PLATFORM__ === 'h5',

  /** 是否 App */
  isApp: __UNI_PLATFORM__ === 'app',

  /** 是否微信小程序 */
  isMpWeixin: __UNI_PLATFORM__ === 'mp-weixin',

  /** 是否小程序（任意） */
  isMp: __UNI_PLATFORM__.startsWith('mp-'),

  /** 获取当前平台 */
  current: __UNI_PLATFORM__,
}

// 使用示例
import { platform } from '@/utils/platform'

if (platform.isH5) {
  // H5 专属逻辑
}

if (platform.isMp) {
  // 小程序通用逻辑
}
```

## 环境变量配置

### 环境文件

```
env/
├── .env                  # 所有环境通用
├── .env.development      # 开发环境
├── .env.production       # 生产环境
└── .env.local            # 本地覆盖（不提交 Git）
```

### 变量定义

```bash
# env/.env
# 应用标题
VITE_APP_TITLE=RuoYi Plus UniApp

# UniApp AppID
VITE_UNI_APPID=__UNI__XXXXXXX

# 公共路径
VITE_APP_PUBLIC_PATH=/

# 各平台小程序 AppID
VITE_WECHAT_MINI_APP_ID=wx1234567890abcdef
VITE_ALIPAY_MINI_APP_ID=
VITE_BYTEDANCE_MINI_APP_ID=
VITE_BAIDU_MINI_APP_ID=
VITE_QQ_MINI_APP_ID=
```

```bash
# env/.env.development
# API 地址
VITE_APP_BASE_API=http://localhost:8080

# 是否删除 console
VITE_DELETE_CONSOLE=false

# 是否显示 sourcemap
VITE_SHOW_SOURCEMAP=true
```

```bash
# env/.env.production
# API 地址
VITE_APP_BASE_API=https://api.example.com

# 是否删除 console
VITE_DELETE_CONSOLE=true

# 是否显示 sourcemap
VITE_SHOW_SOURCEMAP=false
```

### 使用环境变量

```typescript
// vite.config.ts 中使用
const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
const { VITE_APP_BASE_API, VITE_DELETE_CONSOLE } = env

// 应用代码中使用
const baseApi = import.meta.env.VITE_APP_BASE_API
```

## 插件顺序

### 推荐顺序

```typescript
export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 1. 类型生成插件（最早运行）
  vitePlugins.push(createStaticAssetsTypes())

  // 2. API 生成插件
  vitePlugins.push(createOpenApiPlugin())

  // 3. UniApp 相关插件
  vitePlugins.push(createUniPages(mode))    // 页面路由
  vitePlugins.push(UniLayouts())            // 页面布局
  vitePlugins.push(UniPlatform())           // 平台编译
  vitePlugins.push(UniManifest())           // 配置类型

  // 4. CSS 引擎
  const UnoCSS = (await import('unocss/vite')).default
  vitePlugins.push(UnoCSS())

  // 5. 自动导入插件
  vitePlugins.push(createAutoImport())      // API 自动导入
  vitePlugins.push(createComponents())      // 组件自动导入

  // 6. 优化插件
  vitePlugins.push(createOptimization())    // 分包优化

  // 7. 开发工具插件
  vitePlugins.push(createViteRestart())     // 配置热重启

  // 8. Uni 核心插件（必须最后）
  vitePlugins.push(Uni())

  return vitePlugins.filter(Boolean)
}
```

### 顺序说明

| 顺序 | 插件类型 | 说明 |
|------|---------|------|
| 1 | 类型生成 | 需要在构建早期运行，生成类型定义 |
| 2 | API 生成 | 生成 API 代码，供后续编译使用 |
| 3 | UniApp 生态 | uni-pages、uni-layouts 等 |
| 4 | CSS 引擎 | UnoCSS 需要在 Vue 处理之前 |
| 5 | 自动导入 | 处理组件和 API 的自动导入 |
| 6 | 优化 | 分包优化、异步加载等 |
| 7 | 开发工具 | 热重启等开发辅助 |
| 8 | Uni 核心 | 必须放在最后，负责最终编译 |

## 构建优化

### ESBuild 配置

```typescript
// vite.config.ts
export default defineConfig({
  // ESBuild 配置
  esbuild: {
    // 生产环境移除 console 和 debugger
    drop: env.VITE_DELETE_CONSOLE === 'true'
      ? ['console', 'debugger']
      : ['debugger'],
  },
})
```

### 依赖优化

```typescript
export default defineConfig({
  // 依赖预构建
  optimizeDeps: {
    include: [
      'jsencrypt/bin/jsencrypt.min.js',
      'crypto-js',
    ],
  },
})
```

### 构建配置

```typescript
export default defineConfig({
  build: {
    // Source Map
    sourcemap: env.VITE_SHOW_SOURCEMAP === 'true',

    // 编译目标
    target: 'es6',

    // 压缩方式
    minify: mode === 'development' ? false : 'esbuild',
  },
})
```

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                    vite-plugin-uni 工作流程                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 接收 Vite 构建请求                                       │
│       ↓                                                     │
│  2. 读取 UNI_PLATFORM 环境变量                               │
│       ├─ h5                                                 │
│       ├─ mp-weixin                                          │
│       ├─ app                                                │
│       └─ ...                                                │
│       ↓                                                     │
│  3. 处理条件编译                                             │
│       ├─ 解析 #ifdef / #ifndef 指令                         │
│       └─ 移除不符合当前平台的代码                            │
│       ↓                                                     │
│  4. 转换 Vue SFC                                            │
│       ├─ 处理 <template>                                    │
│       ├─ 处理 <script>                                      │
│       ├─ 处理 <style>                                       │
│       └─ 处理 <route> 块                                    │
│       ↓                                                     │
│  5. 平台适配                                                 │
│       ├─ 转换 API 调用为平台特定实现                         │
│       ├─ 处理样式单位转换                                   │
│       └─ 处理组件差异                                       │
│       ↓                                                     │
│  6. 输出平台代码                                             │
│       ├─ H5: 标准 Web 应用                                  │
│       ├─ 小程序: WXML/WXSS/JS 等                            │
│       └─ App: nvue/vue 组件                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 与其他插件配合

### 配合 uni-pages

```typescript
// uni-pages 生成的路由由 Uni 插件处理
vitePlugins.push(createUniPages(mode))
vitePlugins.push(Uni())  // Uni 使用 uni-pages 生成的配置
```

### 配合 uni-layouts

```typescript
// uni-layouts 的布局包装由 Uni 插件处理
vitePlugins.push(UniLayouts())
vitePlugins.push(Uni())  // Uni 处理布局注入
```

### 配合 UnoCSS

```typescript
// UnoCSS 生成的样式由 Uni 插件进行平台转换
const UnoCSS = (await import('unocss/vite')).default
vitePlugins.push(UnoCSS())
vitePlugins.push(Uni())  // Uni 转换 CSS 为平台格式
```

## API

### 插件选项

```typescript
import Uni from '@dcloudio/vite-plugin-uni'

// 基本使用（无需配置）
Uni()

// 高级配置（一般不需要）
Uni({
  // 自定义配置项
})
```

### 全局变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `__UNI_PLATFORM__` | `string` | 当前编译平台标识 |

### 环境变量

| 变量 | 说明 |
|------|------|
| `UNI_PLATFORM` | 当前编译目标平台 |
| `NODE_ENV` | 当前环境（development/production） |

## 常见问题

### 1. 插件顺序错误

**问题原因：**
- Uni 插件未放在最后位置

**解决方案：**

```typescript
// ❌ 错误
vitePlugins.push(Uni())
vitePlugins.push(createAutoImport())

// ✅ 正确
vitePlugins.push(createAutoImport())
vitePlugins.push(Uni())  // 必须在最后
```

### 2. 条件编译不生效

**问题原因：**
- 条件编译语法错误
- 平台标识拼写错误

**解决方案：**

```vue
<!-- ❌ 错误 -->
<!-- #ifdef h5 -->  <!-- 应为大写 H5 -->
<!-- #ifdef WEIXIN -->  <!-- 应为 MP-WEIXIN -->

<!-- ✅ 正确 -->
<!-- #ifdef H5 -->
<!-- #ifdef MP-WEIXIN -->
```

### 3. 环境变量未生效

**问题原因：**
- 环境文件位置错误
- 变量名未以 VITE_ 开头

**解决方案：**

```typescript
// 确保指定正确的 envDir
export default defineConfig({
  envDir: './env',  // 环境文件目录
})
```

```bash
# 变量必须以 VITE_ 开头
VITE_APP_BASE_API=http://localhost:8080  # ✅
APP_BASE_API=http://localhost:8080        # ❌ 无法访问
```

### 4. 热更新不生效

**问题原因：**
- 修改了配置文件
- 添加了新页面

**解决方案：**

```bash
# 重启开发服务器
pnpm dev:h5  # 重新启动

# 或使用 vite-restart 插件自动重启
```

### 5. 平台 API 差异

**问题原因：**
- 某些 API 仅特定平台支持

**解决方案：**

```typescript
// 使用条件编译处理平台差异
// #ifdef H5
// H5 专属 API
window.addEventListener('resize', handleResize)
// #endif

// #ifdef MP-WEIXIN
// 微信小程序专属 API
wx.getPhoneNumber({
  success: (res) => {
    console.log(res.code)
  },
})
// #endif

// 或使用运行时判断
if (__UNI_PLATFORM__ === 'h5') {
  // H5 逻辑
}
```

