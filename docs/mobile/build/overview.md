# 打包配置概览

## 介绍

RuoYi-Plus-UniApp 移动端采用 Vite 6.3.5 作为构建工具,支持多平台打包部署,包括 H5、微信小程序、支付宝小程序、APP 等。项目采用模块化的 Vite 插件配置,提供了灵活的环境变量管理、自动化构建流程和完善的优化策略,确保各平台打包产物的性能和稳定性。

**核心特性:**

- **多平台支持** - 一套代码打包为 H5、小程序、APP 多个平台
- **环境隔离** - 开发环境和生产环境配置分离,支持自定义环境变量
- **模块化插件** - Vite 插件模块化组织,易于维护和扩展
- **自动化构建** - 自动导入、组件注册、页面路由等自动化处理
- **性能优化** - Tree-shaking、代码压缩、SourceMap 控制等优化策略
- **安全保障** - API 加密传输、RSA 密钥对配置、生产环境 console 移除
- **版本管理** - 完整的版本号管理和更新机制
- **部署便捷** - 支持多种部署方式,提供详细的部署文档

## 构建工具链

### 核心技术栈

**构建工具:**
- **Vite** - 6.3.5 版本,现代化前端构建工具
- **TypeScript** - 5.7.2 版本,类型安全支持
- **Node.js** - ≥18.0.0 版本要求
- **pnpm** - ≥7.30 版本,快速的包管理器

**UniApp 工具:**
- **@dcloudio/vite-plugin-uni** - 3.0.0-4060620250520001 版本
- **@dcloudio/uni-cli-shared** - UniApp CLI 共享工具
- **@dcloudio/uni-automator** - 自动化测试支持

**Vite 插件生态:**
- **@uni-helper/vite-plugin-uni-pages** - 自动化页面路由
- **@uni-helper/vite-plugin-uni-layouts** - 布局系统
- **@uni-helper/vite-plugin-uni-manifest** - manifest.json 配置管理
- **@uni-helper/vite-plugin-uni-components** - 组件自动注册
- **@uni-helper/vite-plugin-uni-platform** - 平台识别插件
- **unplugin-auto-import** - API 自动导入
- **UnoCSS** - 65.4.2 版本,原子化 CSS 引擎

### 构建命令

#### 开发模式

```bash
# H5 开发服务器(支持热更新)
pnpm dev:h5

# 微信小程序开发模式
pnpm dev:mp-weixin

# 支付宝小程序开发模式
pnpm dev:mp-alipay

# APP 开发模式
pnpm dev:app
```

**开发模式特点:**
- 启用热模块替换(HMR)
- 保留 console 和 debugger
- 生成 SourceMap 便于调试
- 不进行代码压缩
- 使用开发环境 API 地址

#### 生产构建

```bash
# H5 生产构建
pnpm build:h5

# 微信小程序生产构建
pnpm build:mp-weixin

# 支付宝小程序生产构建
pnpm build:mp-alipay

# APP 生产构建
pnpm build:app
```

**生产模式特点:**
- 移除 console 和 debugger
- 代码压缩和混淆
- 关闭 SourceMap
- 使用生产环境 API 地址
- Tree-shaking 优化

## Vite 配置架构

### 配置文件结构

```text
plus-app/
├── vite.config.ts           # Vite 主配置文件
├── env/                     # 环境变量目录
│   ├── .env                # 公共环境变量
│   ├── .env.development    # 开发环境变量
│   └── .env.production     # 生产环境变量
├── vite/
│   └── plugins/            # Vite 插件目录
│       ├── index.ts        # 插件集成入口
│       ├── auto-imports.ts # 自动导入配置
│       ├── components.ts   # 组件自动注册
│       ├── uni-pages.ts    # 页面路由配置
│       ├── unocss.ts       # UnoCSS 配置
│       └── static-assets-types.ts # 静态资源类型
├── uno.config.ts           # UnoCSS 配置文件
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖配置
```

### 主配置文件解析

`vite.config.ts` 文件是 Vite 构建的核心配置,负责环境变量加载、插件注册、构建选项等。

#### 配置结构

```typescript
import type { ConfigEnv, UserConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 获取构建命令和模式
  // command: 'serve' | 'build'
  // mode: 'development' | 'production'

  const { UNI_PLATFORM } = process.env
  // UNI_PLATFORM: 'h5' | 'mp-weixin' | 'mp-alipay' | 'app'

  // 加载环境变量
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return defineConfig({
    // 配置项...
  })
}
```

#### 关键配置项

**1. 基础路径配置**

```typescript
{
  // 应用的基础路径
  base: VITE_APP_PUBLIC_BASE || '/',

  // 自定义环境变量目录
  envDir: './env',
}
```

**使用场景:**
- 部署到子目录: 设置 `base: '/demo/'`
- Nginx 配置需对应配置静态资源映射
- H5 部署时特别重要

**2. 插件配置**

```typescript
{
  // 使用模块化插件配置
  plugins: await createVitePlugins({ command, mode, env }),
}
```

插件加载顺序(重要):
1. 静态资源类型生成
2. UniApp 页面路由
3. UniApp 布局系统
4. UniApp 平台识别
5. Vue 插件修复
6. UnoCSS 原子化 CSS
7. 自动导入 API
8. 组件自动注册
9. **Uni 插件(必须最后)**

**3. 路径别名**

```typescript
{
  resolve: {
    alias: {
      '@': path.join(process.cwd(), '.'),
    },
  },
}
```

`@` 指向项目根目录,支持:
- `@/api/` - API 接口
- `@/composables/` - 组合式函数
- `@/utils/` - 工具函数
- `@/components/` - 组件

**4. 开发服务器**

```typescript
{
  server: {
    host: '0.0.0.0',
    // 允许的域名访问列表
    allowedHosts: ['.ruoyikj.top'],
    // 热模块替换
    hmr: true,
    // 端口被占用时自动递增
    strictPort: false,
    // 自动打开浏览器
    open: true,
  },
}
```

**5. 代码优化**

```typescript
{
  // 移除 console 和 debugger
  esbuild: {
    drop: VITE_DELETE_CONSOLE === 'true'
      ? ['console', 'debugger']
      : ['debugger'],
  },

  // 依赖预构建
  optimizeDeps: {
    include: ['jsencrypt/bin/jsencrypt.min.js', 'crypto-js'],
  },

  // 构建选项
  build: {
    sourcemap: VITE_SHOW_SOURCEMAP === 'true',
    target: 'es6',
    minify: mode === 'development' ? false : 'esbuild',
  },
}
```

## 环境变量系统

### 环境文件说明

项目使用三层环境变量配置:

| 文件 | 用途 | 优先级 |
|------|------|--------|
| `.env` | 公共配置,所有环境共享 | 最低 |
| `.env.development` | 开发环境专用配置 | 中 |
| `.env.production` | 生产环境专用配置 | 最高 |

### 公共环境变量 (.env)

```bash
# 应用ID(每个项目唯一,避免键冲突)
VITE_APP_ID = 'ryplus_uni_workflow'

# 应用标题
VITE_APP_TITLE = 'ryplus-uni'

# ===== 安全配置 =====
# 接口加密功能开关
VITE_APP_API_ENCRYPT = 'true'

# 接口加密传输 RSA 公钥
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQAD...'

# 接口响应解密 RSA 私钥
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHK...'

# ===== 功能开关 =====
# WebSocket 开关
VITE_APP_WEBSOCKET = 'false'
```

**重要说明:**

1. **应用ID**: 用于区分不同项目的缓存和数据,防止多项目冲突
2. **RSA 密钥对**: 前后端必须配套使用,更换时需前后端同步
3. **API 加密**: 关闭加密时后端也必须关闭,否则通信失败

### 开发环境变量 (.env.development)

```bash
# 环境标识
VITE_APP_ENV='development'

# API 基础路径(本地开发)
VITE_APP_BASE_API='http://127.0.0.1:5500'

# 保留 console 和 debugger
VITE_DELETE_CONSOLE=false

# 开启 SourceMap
VITE_SHOW_SOURCEMAP=true
```

**开发环境特点:**
- 使用本地 API 地址
- 保留调试信息
- 启用 SourceMap
- 不压缩代码

### 生产环境变量 (.env.production)

```bash
# 环境标识
VITE_APP_ENV='production'

# API 基础路径(生产服务器)
VITE_APP_BASE_API='https://ruoyi.plus/ryplus_uni_workflow'

# 移除 console 和 debugger
VITE_DELETE_CONSOLE=true

# 关闭 SourceMap
VITE_SHOW_SOURCEMAP=false
```

**生产环境特点:**
- 使用生产 API 地址
- 移除调试信息
- 关闭 SourceMap
- 代码压缩混淆

### 使用环境变量

**在 TypeScript/JavaScript 中:**

```typescript
// 获取环境变量
const apiUrl = import.meta.env.VITE_APP_BASE_API
const appId = import.meta.env.VITE_APP_ID
const isEncrypt = import.meta.env.VITE_APP_API_ENCRYPT === 'true'

// 判断环境
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE // 'development' | 'production'

// 示例:根据环境配置 API
if (isDev) {
  console.log('开发环境,API地址:', apiUrl)
} else {
  // 生产环境不输出(console 会被移除)
}
```

**在 Vite 配置中:**

```typescript
export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  const { VITE_APP_BASE_API, VITE_DELETE_CONSOLE } = env

  return defineConfig({
    esbuild: {
      drop: VITE_DELETE_CONSOLE === 'true'
        ? ['console', 'debugger']
        : ['debugger'],
    },
  })
}
```

## 插件系统

### 插件配置架构

`vite/plugins/index.ts` 是所有 Vite 插件的集成入口,负责根据环境动态加载和配置插件。

#### 插件加载流程

```typescript
export default async ({
  command,   // 'serve' | 'build'
  mode,      // 'development' | 'production'
  env,       // 环境变量对象
}: {
  command: string
  mode: string
  env: Record<string, string>
}) => {
  const vitePlugins: any[] = []

  const { UNI_PLATFORM } = process.env

  // 1. 静态资源类型生成(必须最早运行)
  vitePlugins.push(createStaticAssetsTypes({ enabled: true }))

  // 2. UniApp 核心插件
  vitePlugins.push(createUniPages(mode))
  vitePlugins.push(UniLayouts({ layoutDir: '../../layouts' }))
  vitePlugins.push(UniPlatform())

  // 3. Vue 插件修复
  vitePlugins.push({
    name: 'fix-vite-plugin-vue',
    configResolved(config: any) {
      const plugin = config.plugins.find((p: any) => p.name === 'vite:vue')
      if (plugin?.api?.options) {
        plugin.api.options.devToolsEnabled = false
      }
    },
  })

  // 4. UnoCSS 原子化 CSS
  const UnoCSS = (await import('unocss/vite')).default
  vitePlugins.push(UnoCSS())

  // 5. 自动化功能
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createComponents())

  // 6. Uni 插件(必须最后)
  vitePlugins.push(Uni())

  return vitePlugins.filter(Boolean)
}
```

### 核心插件详解

#### 1. 静态资源类型生成 (static-assets-types.ts)

自动为静态资源生成 TypeScript 类型定义,支持图片、字体、音视频等。

**功能:**
- 扫描 `static/` 目录
- 生成类型声明文件
- 支持图片、字体、音视频等格式
- 提供智能提示

**生成示例:**

```typescript
// types/static-assets.d.ts
declare module '@/static/images/logo.png' {
  const src: string
  export default src
}
```

**使用:**

```vue
<script lang="ts" setup>
import logo from '@/static/images/logo.png'
</script>

<template>
  <image :src="logo" />
</template>
```

#### 2. 自动导入 (auto-imports.ts)

自动导入 Vue API、组合式函数、工具函数等,无需手动 import。

**配置:**

```typescript
import AutoImport from 'unplugin-auto-import/vite'

export default () => {
  return AutoImport({
    imports: [
      'vue',
      'pinia',
      'uni-app',
      {
        '@/utils/': ['*'],
        '@/composables/': ['*'],
      },
    ],
    dts: 'types/auto-imports.d.ts',
    vueTemplate: true,
  })
}
```

**自动导入示例:**

```vue
<script lang="ts" setup>
// 无需导入,直接使用
const count = ref(0)
const userStore = useUserStore()
const { isLoggedIn } = useAuth()
</script>
```

#### 3. 组件自动注册 (components.ts)

自动注册项目组件和 WD UI 组件,无需手动注册。

**配置:**

```typescript
import Components from '@uni-helper/vite-plugin-uni-components'
import { WdResolver } from '@/wd'

export default () => {
  return Components({
    dts: 'types/components.d.ts',
    resolvers: [WdResolver()],
    directoryAsNamespace: true,
  })
}
```

**使用:**

```vue
<template>
  <!-- 自动注册,直接使用 -->
  <wd-button type="primary">按钮</wd-button>
  <custom-header />
</template>
```

#### 4. 页面路由 (uni-pages.ts)

基于文件系统自动生成 `pages.json` 路由配置。

**配置:**

```typescript
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  return UniPages({
    dts: 'types/uni-pages.d.ts',
    homePage: 'pages/index/index',
    subPackages: ['pages-sub'],
  })
}
```

**文件结构:**

```text
pages/
├── index/
│   └── index.vue       → pages/index/index
├── login/
│   └── index.vue       → pages/login/index
pages-sub/
└── user/
    └── profile.vue     → pages-sub/user/profile (分包)
```

#### 5. 布局系统 (UniLayouts)

提供默认布局和自定义布局支持。

**配置:**

```typescript
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

UniLayouts({
  layoutDir: path.resolve(__dirname, '../../layouts'),
  cwd: path.resolve(__dirname, '../../'),
  layout: 'default',
})
```

**使用:**

```vue
<!-- pages/index/index.vue -->
<route lang="yaml">
layout: default
</route>

<template>
  <!-- 页面内容会被插入到布局中 -->
</template>
```

#### 6. UnoCSS 集成

原子化 CSS 引擎,提供类似 TailwindCSS 的体验。

**配置:** `uno.config.ts`

```typescript
import { defineConfig, presetUni } from 'unocss'

export default defineConfig({
  presets: [
    presetUni(),
  ],
})
```

**使用:**

```vue
<template>
  <view class="flex justify-center items-center p-4 bg-primary">
    <text class="text-white font-bold">Hello</text>
  </view>
</template>
```

## 构建优化策略

### 代码分割

#### 分包加载

`pages.json` 配置分包:

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "首页" }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": [
        {
          "path": "user/profile",
          "style": { "navigationBarTitleText": "个人中心" }
        }
      ]
    }
  ]
}
```

**优势:**
- 主包体积更小
- 按需加载分包
- 提升首屏速度

#### 动态导入

```typescript
// 路由懒加载
const UserProfile = () => import('@/pages-sub/user/profile.vue')

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
```

### Tree-shaking

Vite 自动进行 Tree-shaking,移除未使用的代码。

**最佳实践:**

```typescript
// ✅ 推荐:按需导入
import { ref, computed } from 'vue'
import { formatDate } from '@/utils/date'

// ❌ 不推荐:全量导入
import * as Vue from 'vue'
import * as utils from '@/utils'
```

### 代码压缩

生产环境自动启用 esbuild 压缩:

```typescript
{
  build: {
    minify: mode === 'development' ? false : 'esbuild',
  },
}
```

**压缩效果:**
- JavaScript 压缩率 ~60%
- CSS 压缩率 ~50%
- 移除空白和注释
- 变量名混淆

### 图片优化

#### 图片格式选择

| 格式 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| WebP | H5、新版小程序 | 体积小,质量高 | 兼容性 |
| PNG | 需要透明背景 | 无损压缩 | 体积大 |
| JPG | 照片、复杂图片 | 压缩率高 | 无透明 |
| SVG | 图标、Logo | 矢量,无损放大 | 不适合复杂图 |

#### 图片压缩

使用工具压缩静态图片:
- **TinyPNG** - 在线压缩工具
- **ImageOptim** - Mac 压缩工具
- **Squoosh** - Google 开源工具

### 依赖优化

#### 预构建依赖

```typescript
{
  optimizeDeps: {
    include: [
      'jsencrypt/bin/jsencrypt.min.js',
      'crypto-js',
    ],
  },
}
```

**作用:**
- 将 CommonJS 转为 ESM
- 合并多个模块
- 加速二次启动

#### 外部依赖

对于大型库,可考虑使用 CDN:

```typescript
{
  build: {
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}
```

## 平台差异处理

### 条件编译

使用条件编译处理平台差异:

```typescript
// #ifdef H5
console.log('H5 平台')
// #endif

// #ifdef MP-WEIXIN
console.log('微信小程序')
// #endif

// #ifdef MP-ALIPAY
console.log('支付宝小程序')
// #endif

// #ifdef APP-PLUS
console.log('APP 平台')
// #endif

// #ifndef H5
console.log('除 H5 外的所有平台')
// #endif
```

### 平台识别

```typescript
const { UNI_PLATFORM } = process.env

if (UNI_PLATFORM === 'h5') {
  // H5 平台配置
} else if (UNI_PLATFORM === 'mp-weixin') {
  // 微信小程序配置
} else if (UNI_PLATFORM === 'app') {
  // APP 配置
}
```

### API 适配

```typescript
// 使用平台工具函数
import { isH5, isMp, isApp } from '@/utils/platform'

if (isH5()) {
  // H5 特有逻辑
  window.location.href = '/login'
} else if (isMp()) {
  // 小程序特有逻辑
  uni.navigateTo({ url: '/pages/login/index' })
}
```

## 构建流程

### 完整构建流程

```text
1. 加载环境变量
   ↓
2. 识别构建平台(UNI_PLATFORM)
   ↓
3. 加载 Vite 配置
   ↓
4. 注册 Vite 插件
   ↓
5. 处理条件编译
   ↓
6. 编译 TypeScript
   ↓
7. 处理 Vue SFC
   ↓
8. UnoCSS 原子化 CSS
   ↓
9. 自动导入/注册
   ↓
10. 代码优化(Tree-shaking)
    ↓
11. 代码压缩(生产环境)
    ↓
12. 生成构建产物
```

### H5 构建产物

```text
dist/
└── build/
    └── h5/
        ├── index.html
        ├── static/
        │   ├── css/
        │   │   └── index.[hash].css
        │   └── js/
        │       ├── index.[hash].js
        │       └── vendor.[hash].js
        └── static/
            └── images/
```

### 小程序构建产物

```text
dist/
└── build/
    └── mp-weixin/
        ├── app.js
        ├── app.json
        ├── app.wxss
        ├── pages/
        │   └── index/
        │       ├── index.js
        │       ├── index.json
        │       ├── index.wxml
        │       └── index.wxss
        └── static/
```

### APP 构建产物

```text
dist/
└── build/
    └── app/
        ├── manifest.json
        ├── www/
        │   ├── index.html
        │   └── static/
        └── nativeplugins/
```

## 性能监控

### 构建时间分析

```bash
# 查看详细构建日志
pnpm build:h5 --debug

# 分析打包体积
pnpm build:h5 --report
```

### 体积分析

使用 Rollup 插件分析:

```typescript
import visualizer from 'rollup-plugin-visualizer'

{
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
}
```

### 性能指标

**目标指标:**

| 平台 | 包体积 | 首屏时间 | 备注 |
|------|--------|---------|------|
| H5 | < 2MB | < 2s | Gzip 后 |
| 小程序 | < 2MB | < 3s | 主包大小 |
| APP | < 10MB | < 3s | APK/IPA |

## 常见问题

### 1. 构建失败:找不到模块

**问题原因:**
- 依赖未安装
- 路径别名配置错误
- TypeScript 类型定义缺失

**解决方案:**

```bash
# 1. 清理依赖
rm -rf node_modules pnpm-lock.yaml

# 2. 重新安装
pnpm install

# 3. 生成类型定义
pnpm dev:h5  # 启动一次生成类型文件
```

### 2. 环境变量不生效

**问题原因:**
- 变量名未以 `VITE_` 开头
- 环境文件路径错误
- 未重启开发服务器

**解决方案:**

```bash
# 1. 检查变量名
# ✅ 正确
VITE_APP_API='http://localhost:5500'

# ❌ 错误(不会暴露)
APP_API='http://localhost:5500'

# 2. 检查文件位置
# 确保环境文件在 env/ 目录下

# 3. 重启服务器
pnpm dev:h5
```

### 3. 小程序分包失败

**问题原因:**
- `pages.json` 配置错误
- 分包路径不存在
- 主包超出大小限制

**解决方案:**

```json
// pages.json
{
  "subPackages": [
    {
      "root": "pages-sub",  // 确保目录存在
      "pages": [
        {
          "path": "user/profile",  // 确保文件存在
          "style": {}
        }
      ]
    }
  ]
}
```

### 4. H5 部署后路由 404

**问题原因:**
- Nginx 配置缺少 fallback
- base 路径配置错误

**解决方案:**

```nginx
# Nginx 配置
location / {
  root /www/sites/app;
  try_files $uri $uri/ /index.html;
}

# 子目录部署
location /demo/ {
  alias /www/sites/app/demo/;
  try_files $uri $uri/ /demo/index.html;
}
```

```typescript
// vite.config.ts
{
  base: '/demo/',  // 对应 Nginx 配置
}
```

### 5. 打包体积过大

**问题原因:**
- 未启用 Tree-shaking
- 全量导入大型库
- 图片未压缩
- SourceMap 未关闭

**解决方案:**

```typescript
// 1. 按需导入
import { ref } from 'vue'  // ✅
import * as Vue from 'vue'  // ❌

// 2. 动态导入
const HeavyComp = defineAsyncComponent(() =>
  import('./HeavyComp.vue')
)

// 3. 关闭 SourceMap
// .env.production
VITE_SHOW_SOURCEMAP=false

// 4. 压缩图片
// 使用 TinyPNG 等工具
```

### 6. 开发服务器启动慢

**问题原因:**
- 依赖预构建缓存问题
- 过多的自动导入配置

**解决方案:**

```bash
# 清理缓存
rm -rf node_modules/.vite

# 重启服务器
pnpm dev:h5
```

### 7. 生产环境 API 请求失败

**问题原因:**
- API 地址配置错误
- CORS 跨域问题
- 加密配置不一致

**解决方案:**

```bash
# 1. 检查环境变量
# .env.production
VITE_APP_BASE_API='https://api.example.com'

# 2. 检查加密开关
# 前后端必须一致
VITE_APP_API_ENCRYPT='true'

# 3. 检查密钥对
# 确保前后端 RSA 密钥对应
```

### 8. TypeScript 类型错误

**问题原因:**
- 自动生成的类型文件缺失
- tsconfig.json 配置问题

**解决方案:**

```bash
# 1. 重新生成类型文件
rm -rf types/
pnpm dev:h5

# 2. 检查 tsconfig.json
{
  "include": [
    "**/*.ts",
    "**/*.vue",
    "types/**/*.d.ts"  // 确保包含类型文件
  ]
}

# 3. 重启 TypeScript 服务器(VSCode)
# Cmd/Ctrl + Shift + P → "Restart TS Server"
```

## 最佳实践

### 1. 环境变量管理

**分离敏感信息:**

```bash
# .env(提交到 Git)
VITE_APP_TITLE='My App'

# .env.local(不提交,本地开发)
VITE_APP_RSA_PRIVATE_KEY='本地测试密钥'
```

**.gitignore 配置:**

```text
.env.local
.env.*.local
```

### 2. 构建脚本优化

**package.json 配置:**

```json
{
  "scripts": {
    "dev:h5": "uni",
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "vue-tsc --noEmit",

    "clean": "rm -rf dist node_modules/.vite",
    "prebuild": "pnpm type-check && pnpm lint"
  }
}
```

### 3. 多环境部署

创建多个环境文件:

```text
env/
├── .env                 # 公共配置
├── .env.development     # 开发环境
├── .env.test            # 测试环境
├── .env.staging         # 预发布环境
└── .env.production      # 生产环境
```

**自定义构建命令:**

```json
{
  "scripts": {
    "build:test": "uni build --mode test",
    "build:staging": "uni build --mode staging"
  }
}
```

### 4. 版本号管理

**package.json 版本规范:**

```json
{
  "version": "2.11.0",
  "update-time": "2025-05-28"
}
```

**自动化版本更新:**

```bash
# 自动递增版本号
pnpm version patch  # 2.11.0 → 2.11.1
pnpm version minor  # 2.11.0 → 2.12.0
pnpm version major  # 2.11.0 → 3.0.0
```

### 5. 构建产物检查

**构建后检查清单:**

- [ ] 包体积是否符合要求
- [ ] console 是否已移除
- [ ] SourceMap 是否已关闭
- [ ] API 地址是否正确
- [ ] 环境变量是否生效
- [ ] 静态资源路径是否正确
- [ ] 分包配置是否生效

### 6. CI/CD 集成

**GitHub Actions 示例:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

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
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build H5
        run: pnpm build:h5

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/build/h5
```

### 7. 性能优化检查

**构建前优化清单:**

- [ ] 图片已压缩
- [ ] 按需导入组件和 API
- [ ] 启用代码分割
- [ ] 配置依赖预构建
- [ ] 移除未使用的依赖
- [ ] 启用 Gzip 压缩

### 8. 错误监控

**集成 Sentry 等错误追踪:**

```typescript
// main.ts
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: import.meta.env.VITE_APP_ENV,
  })
}
```

## 总结

RuoYi-Plus-UniApp 的打包配置系统提供了:

**核心优势:**

1. **多平台支持** - 一套代码,多端部署
2. **模块化配置** - 插件化架构,易于维护
3. **自动化处理** - 自动导入、注册、路由生成
4. **环境隔离** - 开发、测试、生产环境独立配置
5. **性能优化** - Tree-shaking、代码分割、压缩混淆
6. **安全保障** - API 加密、密钥管理、console 移除
7. **开发体验** - 热更新、TypeScript、智能提示

**使用建议:**

1. 严格遵循环境变量命名规范(`VITE_` 前缀)
2. 生产环境务必关闭 SourceMap 和 console
3. 合理使用分包减小主包体积
4. 定期检查和优化打包体积
5. 配置 CI/CD 实现自动化部署
6. 使用条件编译处理平台差异
7. 集成错误监控保障线上稳定性

通过合理配置和优化,可以获得高性能、易维护、多平台的移动应用构建体系。
