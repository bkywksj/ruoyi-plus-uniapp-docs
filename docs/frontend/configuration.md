# RyPlus-Uni 前端配置文件说明文档

## 介绍

RyPlus-Uni 前端项目采用 Vue 3 + TypeScript + Vite 构建，配置文件体系完善，涵盖环境变量、构建配置、样式系统、代码规范等多个层面。本文档详细说明项目中所有配置文件的作用、配置项含义及最佳实践。

**配置文件层次结构:**

```text
┌─────────────────────────────────────────────────────────────────┐
│                      项目配置体系                                │
├─────────────────────────────────────────────────────────────────┤
│  环境层  │  env/.env、.env.development、.env.production          │
├─────────────────────────────────────────────────────────────────┤
│  构建层  │  vite.config.ts、vite/plugins/*                       │
├─────────────────────────────────────────────────────────────────┤
│  类型层  │  tsconfig.json                                        │
├─────────────────────────────────────────────────────────────────┤
│  样式层  │  uno.config.ts                                        │
├─────────────────────────────────────────────────────────────────┤
│  规范层  │  eslint.config.ts、prettier.config.js                 │
├─────────────────────────────────────────────────────────────────┤
│  依赖层  │  package.json                                         │
└─────────────────────────────────────────────────────────────────┘
```

**核心特性:**

- **环境隔离** - 开发/生产环境配置完全分离，支持多环境部署
- **插件化架构** - Vite 插件系统实现功能模块化，易于扩展
- **类型安全** - TypeScript 严格模式配置，提供完整的类型检查
- **原子化样式** - UnoCSS 配置实现高性能原子化 CSS
- **代码规范** - ESLint + Prettier 统一代码风格

---

## 技术栈概述

本项目基于 Vue 3 + TypeScript + Vite 构建，采用现代化前端开发技术栈：

| 技术 | 版本 | 说明 |
|------|------|------|
| **Vue** | 3.5.13 | 渐进式 JavaScript 框架 |
| **Vite** | 6.3.2 | 新一代前端构建工具 |
| **TypeScript** | 5.8.3 | JavaScript 超集，提供类型系统 |
| **Element Plus** | 2.9.8 | Vue 3 UI 组件库 |
| **UnoCSS** | 66.5.2 | 原子化 CSS 引擎 |
| **Pinia** | 3.0.2 | Vue 3 状态管理库 |
| **Vue Router** | 4.5.0 | Vue 3 路由管理 |
| **Axios** | 1.8.4 | HTTP 客户端 |
| **@vueuse/core** | 13.1.0 | Vue 组合式 API 工具集 |
| **ECharts** | 5.6.0 | 数据可视化图表库 |
| **vue-i18n** | 11.1.3 | Vue 国际化插件 |

---

## 环境变量配置

### 配置文件结构

环境变量文件位于 `env/` 目录下，按环境分为三个文件：

```text
env/
├── .env                    # 基础配置（所有环境共享）
├── .env.development        # 开发环境配置
└── .env.production         # 生产环境配置
```

### 基础环境配置 (.env)

基础配置定义所有环境共享的配置项：

```bash
# ===== 应用基础配置 =====
# 应用ID (每个项目唯一，避免不同项目本地存储键冲突)
VITE_APP_ID = ryplus_uni_workflow

# 页面标题（浏览器标签页显示的标题）
VITE_APP_TITLE = ryplus_uni_workflow后台管理

# 应用访问路径前缀
# 例如使用 /admin/ 则访问地址为 https://domain.com/admin/
VITE_APP_CONTEXT_PATH = '/'

# 是否允许前台首页
# 设置为 true 时，访问域名会直接访问前台首页而非后台首页
VITE_ENABLE_FRONTEND = 'false'

# ===== 安全配置 =====
# 接口加密功能开关
# 如需关闭，后端也必须对应关闭
VITE_APP_API_ENCRYPT = 'true'

# 接口加密传输 RSA 公钥
# 与后端解密私钥对应，如更换需前后端一同更换
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK9s1Pbnn5W+...'

# 接口响应解密 RSA 私钥
# 与后端加密公钥对应，如更换需前后端一同更换
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJm7BJpXIHWGU3sHJYgRi...'

# ===== 功能开关 =====
# WebSocket 功能开关
# 默认使用 SSE 推送，WebSocket 和 SSE 二选一
VITE_APP_WEBSOCKET = 'true'

# Server-Sent Events 开关
VITE_APP_SSE = 'false'

# ===== 外部服务地址 =====
# 仓库地址（可选）
VITE_APP_GIT_URL = ''

# 文档地址
VITE_APP_DOC_URL = 'https://ruoyi.plus'
```

### 开发环境配置 (.env.development)

开发环境特有配置：

```bash
# 开发环境标识
VITE_APP_ENV='development'

# Vite 应用端口
VITE_APP_PORT='80'

# ===== API 配置 =====
# 开发环境 API 基础路径
# 用于请求代理匹配
VITE_APP_BASE_API='/dev-api'

# 开发环境后端端口
VITE_APP_BASE_API_PORT='5503'

# ===== 外部服务地址 =====
# Spring Boot Admin 监控地址
VITE_APP_MONITOR_ADMIN='http://127.0.0.1:9090/admin/applications'

# SnailJob 任务调度控制台地址
VITE_APP_SNAILJOB_ADMIN='http://127.0.0.1:8800/snail-job'
```

### 生产环境配置 (.env.production)

生产环境特有配置：

```bash
# 生产环境标识
VITE_APP_ENV='production'

# ===== API 配置 =====
# 生产环境 API 基础路径
# 通常与 Nginx 的反向代理路径一致
VITE_APP_BASE_API='/ryplus_uni_workflow'

# ===== 外部服务地址 =====
# 监控地址（最好修改为内网地址访问）
VITE_APP_MONITOR_ADMIN='/admin/applications'

# SnailJob 控制台地址
VITE_APP_SNAILJOB_ADMIN='/snail-job'

# ===== 构建配置 =====
# 打包时的压缩方式
# 支持 gzip、brotli 或同时启用 gzip,brotli
VITE_BUILD_COMPRESS='gzip'
```

### 环境变量命名规范

```typescript
// ✅ 正确：以 VITE_ 开头，使用大写下划线命名
VITE_APP_TITLE = 'RyPlus-Uni'
VITE_APP_BASE_API = '/dev-api'
VITE_BUILD_COMPRESS = 'gzip'

// ❌ 错误：不以 VITE_ 开头的变量无法在前端代码中访问
APP_TITLE = 'RyPlus-Uni'
BASE_API = '/dev-api'
```

### 在代码中访问环境变量

```typescript
// 方式一：直接使用 import.meta.env
const appTitle = import.meta.env.VITE_APP_TITLE
const baseApi = import.meta.env.VITE_APP_BASE_API

// 方式二：通过 systemConfig 统一管理（推荐）
import { SystemConfig } from '@/systemConfig'

const appTitle = SystemConfig.app.title
const baseUrl = SystemConfig.api.baseUrl
const timeout = SystemConfig.api.timeout
```

---

## Vite 构建配置

### 主配置文件 (vite.config.ts)

```typescript
import process from 'node:process'
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite'
import createPlugins from './vite/plugins'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 加载环境变量
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  console.log('命令, 模式 -> ', command, mode)
  console.log('环境变量 env -> ', env)

  return defineConfig({
    // 自定义环境变量目录
    envDir: './env',

    // 部署基础路径
    // 默认 '/' 表示部署在域名根路径
    // 如果部署在子路径，如 https://domain.com/admin/
    // 需设置为 '/admin/'
    base: env.VITE_APP_CONTEXT_PATH,

    // 解析配置
    resolve: {
      // 路径别名配置
      alias: {
        '@': path.join(process.cwd(), './src')
      },
      // 导入时可省略的扩展名
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // 插件配置
    plugins: createPlugins(env, command === 'build'),

    // 开发服务器配置
    server: {
      // 监听所有地址，包括局域网和公网地址
      host: '0.0.0.0',
      // 允许访问的域名列表
      allowedHosts: ['.ruoyikj.top'],
      // 从环境变量获取端口号
      port: Number(env.VITE_APP_PORT),
      // 端口被占用时自动递增
      strictPort: false,
      // 自动打开浏览器
      open: true,
      // 代理配置
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://127.0.0.1:' + env.VITE_APP_BASE_API_PORT,
          changeOrigin: true,
          ws: true,  // 支持 WebSocket
          rewrite: (path) => path.replace(
            new RegExp('^' + env.VITE_APP_BASE_API),
            ''
          )
        }
      }
    },

    // CSS 相关配置
    css: {
      preprocessorOptions: {
        scss: {
          // 使用 SCSS 现代编译器 API
          api: 'modern-compiler'
        }
      },
      postcss: {
        plugins: [
          // 自动添加浏览器兼容性前缀
          autoprefixer(),
          // 移除多余的 charset 声明
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                atRule.remove()
              }
            }
          }
        ]
      }
    },

    // 依赖优化选项
    optimizeDeps: {
      // 预构建的依赖项，提高首次加载速度
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'echarts',
        'vue-i18n',
        '@vueup/vue-quill',
        'image-conversion',
        'element-plus/es/components/**/css',
        'vue-json-pretty',
        'file-saver',
        '@wangeditor/editor-for-vue',
        'qrcode',
        'vue-draggable-plus',
        'highlight.js'
      ]
    }
  })
}
```

### 配置项详解

#### 1. 路径别名 (resolve.alias)

```typescript
resolve: {
  alias: {
    '@': path.join(process.cwd(), './src')
  }
}
```

**使用示例:**

```typescript
// 使用别名导入
import { useAuth } from '@/composables/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'
import type { UserInfo } from '@/types/user'

// 等价于相对路径
import { useAuth } from '../../composables/useAuth'
```

#### 2. 代理配置 (server.proxy)

代理配置用于解决开发环境的跨域问题：

```typescript
proxy: {
  '/dev-api': {
    target: 'http://127.0.0.1:5503',  // 后端服务地址
    changeOrigin: true,                // 修改请求头中的 Origin
    ws: true,                          // 代理 WebSocket
    rewrite: (path) => path.replace(/^\/dev-api/, '')
  }
}
```

**请求转换示例:**

| 前端请求 | 代理后地址 |
|---------|-----------|
| `/dev-api/user/list` | `http://127.0.0.1:5503/user/list` |
| `/dev-api/auth/login` | `http://127.0.0.1:5503/auth/login` |

#### 3. 依赖预构建 (optimizeDeps.include)

预构建常用依赖可以显著提升开发服务器首次启动和页面加载速度：

```typescript
optimizeDeps: {
  include: [
    'vue',           // Vue 核心库
    'vue-router',    // 路由
    'pinia',         // 状态管理
    'axios',         // HTTP 客户端
    '@vueuse/core',  // 组合式 API 工具集
    'echarts',       // 图表库
    // ... 更多依赖
  ]
}
```

---

## 插件系统

项目采用插件化架构管理 Vite 插件，所有插件配置位于 `vite/plugins/` 目录。

### 插件目录结构

```text
vite/plugins/
├── index.ts              # 插件入口，组合所有插件
├── auto-imports.ts       # 自动导入插件
├── components.ts         # 组件自动导入
├── compression.ts        # 构建压缩插件
├── icons.ts              # 图标自动导入
├── iconfont-types.ts     # Iconfont 类型生成
├── setup-extend.ts       # setup 语法扩展
├── unocss.ts            # UnoCSS 插件
├── hmrControl.ts        # HMR 控制插件
└── openapi/             # OpenAPI 代码生成
    ├── index.ts
    ├── parser.ts
    ├── typeGenerator.ts
    └── apiGenerator.ts
```

### 插件入口 (index.ts)

```typescript
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import createUnoCss from './unocss'
import createAutoImport from './auto-imports'
import createComponents from './components'
import createIcons from './icons'
import createIconfontTypes from './iconfont-types'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createOpenApiPlugin from './openapi'
import { createHmrControlPlugin } from './hmrControl'
import path from 'path'

export default (viteEnv: any, isBuild = false): [] => {
  const vitePlugins: any = []

  // Vue 官方插件
  vitePlugins.push(vue())

  // Vue 开发工具
  vitePlugins.push(vueDevTools())

  // UnoCSS 原子化 CSS 引擎
  vitePlugins.push(createUnoCss())

  // 自动导入插件
  vitePlugins.push(createAutoImport(path))

  // 组件自动导入
  vitePlugins.push(createComponents(path))

  // 文件压缩插件
  vitePlugins.push(createCompression(viteEnv))

  // 图标自动导入
  vitePlugins.push(createIcons())

  // Iconfont 类型生成
  vitePlugins.push(createIconfontTypes())

  // setup 语法扩展
  vitePlugins.push(createSetupExtend())

  // OpenAPI 代码生成
  const apiPort = viteEnv.VITE_APP_BASE_API_PORT || '5500'
  vitePlugins.push(
    createOpenApiPlugin({
      input: `http://127.0.0.1:${apiPort}/v3/api-docs/business`,
      output: 'src/api',
      mode: 'manual',
      enabled: true,
      ignore: {
        modules: ['chat', 'order', 'notify', 'ai'],
        files: ['system*', 'tableDictTypes*'],
        functions: ['template*', 'import*', 'export*']
      }
    })
  )

  // HMR 控制插件（仅开发模式）
  if (!isBuild) {
    vitePlugins.push(createHmrControlPlugin())
  }

  return vitePlugins
}
```

### 自动导入插件 (auto-imports.ts)

自动导入 Vue、VueUse、Pinia 等常用库的函数，无需手动 import：

```typescript
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (path: any) => {
  return AutoImport({
    // 自动导入的库和模块
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],

    // 自动导入项目内的模块
    dirs: ['src/composables', 'src/stores/modules'],

    // ESLint 配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true
    },

    // Element Plus 自动导入
    resolvers: [ElementPlusResolver()],

    // 在 Vue 模板中自动导入
    vueTemplate: true,

    // 类型声明文件路径
    dts: 'src/types/auto-imports.d.ts',

    defaultExportByFilename: false
  })
}
```

**使用效果:**

```vue
<script setup lang="ts">
// 无需手动导入，直接使用
const count = ref(0)
const route = useRoute()
const router = useRouter()
const { isFullscreen, toggle } = useFullscreen()

// 自动导入项目内的 composables
const { hasPermission } = useAuth()
</script>
```

### 组件自动导入 (components.ts)

自动导入 Element Plus 组件和图标：

```typescript
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

export default (path: any) => {
  return Components({
    resolvers: [
      // 自动导入 Element Plus 组件
      ElementPlusResolver(),

      // 自动注册图标组件
      IconsResolver({
        enabledCollections: ['ep']  // Element Plus 图标集
      })
    ],

    // 类型声明文件路径
    dts: path.resolve(
      path.join(process.cwd(), './src'),
      'types',
      'components.d.ts'
    )
  })
}
```

**使用效果:**

```vue
<template>
  <!-- 无需导入，直接使用 Element Plus 组件 -->
  <el-button type="primary">按钮</el-button>
  <el-input v-model="value" placeholder="请输入" />
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名" />
  </el-table>

  <!-- 自动导入图标 -->
  <i-ep-search />
  <i-ep-delete />
</template>
```

### 压缩插件 (compression.ts)

生产构建时压缩静态文件：

```typescript
import compression from 'vite-plugin-compression'

export default (env: any) => {
  const { VITE_BUILD_COMPRESS } = env
  const plugin: any[] = []

  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',')

    // Gzip 压缩
    if (compressList.includes('gzip')) {
      plugin.push(
        compression({
          ext: '.gz',
          deleteOriginFile: false  // 保留原始文件
        })
      )
    }

    // Brotli 压缩（压缩率更高）
    if (compressList.includes('brotli')) {
      plugin.push(
        compression({
          ext: '.br',
          algorithm: 'brotliCompress',
          deleteOriginFile: false
        })
      )
    }
  }

  return plugin
}
```

**环境变量配置:**

```bash
# 仅 Gzip
VITE_BUILD_COMPRESS='gzip'

# 仅 Brotli
VITE_BUILD_COMPRESS='brotli'

# 同时启用
VITE_BUILD_COMPRESS='gzip,brotli'
```

### 图标插件 (icons.ts)

自动安装和导入 Iconify 图标：

```typescript
import Icons from 'unplugin-icons/vite'

export default () => {
  return Icons({
    // 自动安装图标库
    // 当使用未安装的图标集时，自动下载并安装
    autoInstall: true
  })
}
```

**使用方式:**

```vue
<template>
  <!-- 方式一：组件形式 -->
  <i-ep-user />
  <i-carbon-home />
  <i-mdi-github />

  <!-- 方式二：UnoCSS 类名 -->
  <div class="i-ep-user text-xl" />
  <div class="i-carbon-home text-2xl text-blue-500" />
</template>
```

### Iconfont 类型生成插件

自动扫描图标资源并生成 TypeScript 类型：

```typescript
export default (): Plugin => {
  const iconsDir = 'src/assets/icons'
  const outputPath = 'src/types/icons.d.ts'

  // 解析 iconfont JSON 文件
  const parseIconfontJson = (jsonPath: string): IconItem[] => {
    // 解析逻辑...
  }

  // 解析 iconify JSON 文件
  const parseIconifyJson = (jsonPath: string): IconifyIconItem[] => {
    // 解析逻辑...
  }

  return {
    name: 'iconfont-types',

    buildStart() {
      // 构建时自动生成类型文件
      writeTypeFile()
    },

    handleHotUpdate({ file }) {
      // 图标文件变化时自动重新生成
      if (file.endsWith('.json')) {
        writeTypeFile()
      }
    }
  }
}
```

**生成的类型文件示例:**

```typescript
// src/types/icons.d.ts

declare global {
  type IconCode =
    | 'icon-home'
    | 'icon-user'
    | 'icon-setting'
    // ... 更多图标
}

export const ICONFONT_ICONS: IconItem[] = [
  { code: 'icon-home', name: '首页' },
  { code: 'icon-user', name: '用户' },
  // ...
]

export const ICONIFY_ICONS: IconifyIconItem[] = [
  { code: 'ep-search', name: '搜索', value: 'i-ep-search' },
  // ...
]

export const isValidIconCode = (code: string): code is IconCode => {
  return ALL_ICONS.some((icon) => icon.code === code)
}
```

### OpenAPI 代码生成插件

从 OpenAPI 文档自动生成 TypeScript 类型和 API 函数：

```typescript
export interface OpenApiPluginOptions {
  /** OpenAPI 文档 URL */
  input: string
  /** 输出目录 */
  output: string
  /** 生成模式：manual-手动触发，once-启动时生成 */
  mode?: 'manual' | 'once'
  /** 是否启用插件 */
  enabled?: boolean
  /** 忽略配置 */
  ignore?: {
    /** 忽略的 API 路径 */
    paths?: string[]
    /** 忽略的模块名 */
    modules?: string[]
    /** 忽略的文件名 */
    files?: string[]
    /** 忽略的接口函数名 */
    functions?: string[]
  }
}
```

**使用方式:**

```bash
# 开发模式下访问以下地址触发生成
http://localhost:80/__openapi_generate
```

**生成的文件结构:**

```text
src/api/
├── business/
│   └── user/
│       ├── userApi.ts        # API 函数
│       └── userTypes.ts      # 类型定义
├── app/
│   └── home/
│       ├── homeApi.ts
│       └── homeTypes.ts
└── common/
    └── mall/
        ├── mallApi.ts
        └── mallTypes.ts
```

### HMR 控制插件

用于代码生成场景，暂停/恢复文件监听，避免页面多次刷新：

```typescript
export function createHmrControlPlugin(): Plugin {
  return {
    name: 'vite-plugin-hmr-control',

    configureServer(server) {
      // 暂停 HMR 端点
      // GET /__hmr_pause
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__hmr_pause') {
          // 暂停文件监听
          server.watcher.unwatch(srcPath)
          return
        }

        if (req.url === '/__hmr_resume') {
          // 恢复文件监听
          server.watcher.add(unwatchedPaths)
          // 触发全量刷新
          server.ws.send({ type: 'full-reload' })
          return
        }

        next()
      })
    }
  }
}
```

**使用场景:**

当后端代码生成器覆盖前端文件时，可以：

1. 调用 `GET /__hmr_pause` 暂停文件监听
2. 执行代码生成
3. 调用 `GET /__hmr_resume` 恢复监听并刷新页面

---

## TypeScript 配置

### tsconfig.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // 基础配置
    "baseUrl": ".",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],

    // 性能优化
    "skipLibCheck": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo",

    // 严格模式
    "strict": true,

    // 文件处理
    "allowJs": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "noEmit": true,

    // 路径别名
    "paths": {
      "@/*": ["./src/*"]
    },

    // 类型定义
    "types": ["node", "vite/client"],

    // 自定义配置
    "noImplicitAny": false,
    "removeComments": true,
    "experimentalDecorators": true,
    "strictFunctionTypes": false,
    "strictNullChecks": false,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "vite.config.ts",
    "vitest.config.ts",
    "eslint.config.ts",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "src/**/__tests__/*"
  ]
}
```

### 配置项详解

| 配置项 | 值 | 说明 |
|-------|-----|------|
| `target` | ES2020 | 编译目标版本，支持现代浏览器特性 |
| `module` | ESNext | 使用最新的 ES 模块语法 |
| `moduleResolution` | Bundler | 适用于 Vite 等打包工具的模块解析策略 |
| `strict` | true | 启用所有严格类型检查选项 |
| `noImplicitAny` | false | 允许隐式 any 类型 |
| `strictNullChecks` | false | 关闭严格 null 检查 |
| `skipLibCheck` | true | 跳过声明文件类型检查，提高编译速度 |
| `experimentalDecorators` | true | 启用装饰器语法支持 |

### 类型声明文件

```text
src/types/
├── auto-imports.d.ts      # 自动导入函数的类型声明（自动生成）
├── components.d.ts        # 自动导入组件的类型声明（自动生成）
├── icons.d.ts            # 图标类型声明（自动生成）
├── global.d.ts           # 全局类型声明
├── vue-shim.d.ts         # Vue 组件类型增强
└── env.d.ts              # 环境变量类型声明
```

---

## UnoCSS 配置

### uno.config.ts

```typescript
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  // 快捷方式
  shortcuts: {
    'panel-title': 'pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb] border-b border-b-solid border-[var(--el-border-color-light)] mb-5 mt-0',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'card': 'bg-white dark:bg-dark-800 rounded shadow p-4',
    'tag': 'inline-block px-2 py-1 text-xs rounded'
  },

  // 主题配置
  theme: {
    colors: {
      // 状态颜色
      'primary': 'var(--el-color-primary)',
      'primary_dark': 'var(--el-color-primary-light-5)',
      'success': 'var(--color-success)',
      'warning': 'var(--color-warning)',
      'danger': 'var(--color-danger)',
      'info': 'var(--color-info)',

      // 文本颜色
      'text-base': 'var(--text-color)',
      'text-secondary': 'var(--text-color-secondary)',
      'text-muted': 'var(--text-muted)',
      'heading': 'var(--heading-color)',

      // 边框颜色
      'border': 'var(--border-color)',
      'border-light': 'var(--border-color-light)',
      'border-lighter': 'var(--border-color-lighter)',

      // 背景颜色
      'bg-base': 'var(--bg-color)',
      'bg-page': 'var(--bg-color-page)',
      'bg-overlay': 'var(--bg-color-overlay)',

      // 菜单颜色
      'menu-bg': 'var(--menu-bg)',
      'menu-text': 'var(--menu-color)',
      'menu-active': 'var(--menu-active-text)',
      'menu-hover': 'var(--menu-hover)',

      // 子菜单颜色
      'submenu-bg': 'var(--submenu-bg)',
      'submenu-active': 'var(--submenu-active-text)',
      'submenu-hover': 'var(--submenu-hover)'
    },

    spacing: {
      'sidebar': 'var(--sidebar-width)',
      'header': 'var(--header-height)',
      'tags-view': 'var(--tags-view-height)'
    },

    fontFamily: {
      'base': 'var(--font-family-base)'
    },

    boxShadow: {
      'base': 'var(--shadow-base)',
      'light': 'var(--shadow-light)'
    },

    borderRadius: {
      'base': 'var(--border-radius-base)',
      'small': 'var(--border-radius-small)'
    }
  },

  // 安全列表
  safelist: [
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ],

  // 自定义规则
  rules: [
    ['sidebar-width', { 'width': 'var(--sidebar-width)' }],
    ['header-height', { 'height': 'var(--header-height)' }],
    ['scrollbar', { 'overflow': 'auto' }],
    ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
    ['scrollbar-x', { 'overflow-x': 'auto', 'overflow-y': 'hidden' }],
    ['text-ellipsis', {
      'white-space': 'nowrap',
      'overflow': 'hidden',
      'text-overflow': 'ellipsis'
    }],
    ['line-clamp-2', {
      'overflow': 'hidden',
      'display': '-webkit-box',
      '-webkit-line-clamp': '2',
      '-webkit-box-orient': 'vertical'
    }],
    ['relative-full', {
      'position': 'relative',
      'width': '100%',
      'height': '100%'
    }]
  ],

  // 预设
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({}),
    presetTypography(),
    presetWebFonts({})
  ],

  // 转换器
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
})
```

### UnoCSS 使用示例

```vue
<template>
  <!-- 基础工具类 -->
  <div class="flex items-center justify-between p-4">
    <span class="text-lg font-bold text-primary">标题</span>
    <el-button type="primary">操作</el-button>
  </div>

  <!-- 使用快捷方式 -->
  <div class="panel-title">面板标题</div>
  <div class="flex-center h-100">居中内容</div>

  <!-- 使用自定义规则 -->
  <div class="scrollbar-y h-80">
    <p class="text-ellipsis">这是一段很长的文本...</p>
  </div>

  <!-- 使用主题颜色 -->
  <div class="bg-bg-page text-text-base border-border">
    主题感知的内容
  </div>

  <!-- 使用变体组 -->
  <button class="hover:(bg-primary text-white font-bold)">
    悬停效果
  </button>

  <!-- 属性化模式 -->
  <div text="lg blue-500" m="2" p="x-4 y-2">
    属性化样式
  </div>
</template>
```

---

## ESLint 配置

### eslint.config.ts

```typescript
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import prettier from 'eslint-plugin-prettier'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  // 检查的文件类型
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,cjs,ts,mts,tsx,vue}']
  },

  // 忽略的文件和目录
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/locales/**/*.ts'
    ]
  },

  // 语言选项
  {
    languageOptions: {
      globals: globals.browser
    }
  },

  // Vue 基本规则
  pluginVue.configs['flat/essential'],

  // TypeScript 推荐配置
  vueTsConfigs.recommended,

  // Prettier 配置
  skipFormatting,

  // 自定义规则
  {
    plugins: { prettier },
    rules: {
      // TypeScript 相关
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // Vue 相关
      'vue/multi-word-component-names': 'off',
      'vue/valid-define-props': 'off',
      'vue/no-v-model-argument': 'off',

      // 其他
      'prefer-rest-params': 'off',
      'prettier/prettier': 'error'
    }
  }
)
```

### 规则说明

| 规则 | 设置 | 说明 |
|------|------|------|
| `@typescript-eslint/no-explicit-any` | off | 允许使用 any 类型 |
| `@typescript-eslint/no-unused-vars` | off | 关闭未使用变量警告 |
| `vue/multi-word-component-names` | off | 允许单词组件名 |
| `prettier/prettier` | error | 强制 Prettier 格式化 |

---

## 依赖管理

### package.json

```json
{
  "$schema": "https://json.schemastore.org/package",
  "name": "ryplus_uni_workflow",
  "version": "5.5.0",
  "description": "ryplus_uni_workflow后台管理",
  "author": "抓蛙师",
  "license": "MIT",
  "type": "module",

  "scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vite build --mode production",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint:eslint": "eslint --max-warnings=0 --timeout=60000",
    "lint:eslint:fix": "eslint --fix --timeout=60000",
    "prettier": "prettier --write ."
  },

  "engines": {
    "node": ">=18.18.0",
    "npm": ">=8.9.0",
    "pnpm": ">=7.30"
  },

  "browserslist": [
    "Chrome >= 87",
    "Edge >= 88",
    "Safari >= 14",
    "Firefox >= 78"
  ]
}
```

### NPM 脚本说明

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build:prod` | 构建生产版本 |
| `pnpm build:dev` | 构建开发版本（用于调试） |
| `pnpm preview` | 预览构建产物 |
| `pnpm lint:eslint` | 运行 ESLint 检查 |
| `pnpm lint:eslint:fix` | 自动修复 ESLint 问题 |
| `pnpm prettier` | 格式化所有文件 |

### 主要依赖说明

**运行时依赖:**

| 依赖 | 版本 | 说明 |
|------|------|------|
| vue | 3.5.13 | Vue 3 核心库 |
| vue-router | 4.5.0 | Vue 路由 |
| pinia | 3.0.2 | 状态管理 |
| axios | 1.8.4 | HTTP 客户端 |
| element-plus | 2.9.8 | UI 组件库 |
| @vueuse/core | 13.1.0 | 组合式 API 工具集 |
| echarts | 5.6.0 | 图表库 |
| vue-i18n | 11.1.3 | 国际化 |
| crypto-js | 4.2.0 | 加密库 |
| file-saver | 2.0.5 | 文件保存 |

**开发依赖:**

| 依赖 | 版本 | 说明 |
|------|------|------|
| vite | 6.3.2 | 构建工具 |
| typescript | 5.8.3 | TypeScript |
| unocss | 66.5.2 | 原子化 CSS |
| eslint | 9.21.0 | 代码检查 |
| prettier | 3.5.2 | 代码格式化 |
| sass | 1.87.0 | SCSS 预处理器 |
| vitest | 3.1.2 | 单元测试 |

### 浏览器兼容性

```json
{
  "browserslist": [
    "Chrome >= 87",
    "Edge >= 88",
    "Safari >= 14",
    "Firefox >= 78"
  ]
}
```

支持的最低浏览器版本:

- Chrome 87+ (2020年11月)
- Edge 88+ (2021年1月)
- Safari 14+ (2020年9月)
- Firefox 78+ (2020年7月)

---

## 开发环境配置

### 环境要求

```bash
# Node.js 版本要求
node --version  # >= 18.18.0

# 包管理器要求
pnpm --version  # >= 7.30
# 或
npm --version   # >= 8.9.0
```

### 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 访问应用
# http://localhost:80
```

### 开发服务器特性

- **热模块替换 (HMR)** - 代码修改后即时更新，无需刷新页面
- **API 代理** - 自动转发 API 请求到后端服务，解决跨域问题
- **TypeScript 支持** - 实时类型检查和错误提示
- **Vue DevTools** - 支持 Vue 开发者工具调试
- **自动导入** - Vue、VueUse、Element Plus 函数自动导入
- **OpenAPI 代码生成** - 访问特定 URL 触发接口代码生成

### IDE 配置推荐

**VSCode 扩展:**

- Vue - Official (Vue 语言支持)
- TypeScript Vue Plugin (Volar)
- UnoCSS (原子化 CSS 智能提示)
- ESLint (代码检查)
- Prettier (代码格式化)
- Vue VSCode Snippets (代码片段)

**settings.json 推荐配置:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 构建与部署

### 生产构建

```bash
# 构建生产版本
pnpm build:prod

# 构建产物位于 dist/ 目录
```

### 构建产物结构

```text
dist/
├── index.html
├── assets/
│   ├── js/
│   │   ├── vendor.[hash].js      # 第三方库
│   │   ├── app.[hash].js         # 应用代码
│   │   └── [chunk].[hash].js     # 按需加载的模块
│   ├── css/
│   │   ├── app.[hash].css        # 应用样式
│   │   └── [chunk].[hash].css    # 按需加载的样式
│   └── images/
│       └── ...                   # 静态图片资源
└── favicon.ico
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    location / {
        root /var/www/ryplus-uni/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 反向代理
    location /ryplus_uni_workflow/ {
        proxy_pass http://127.0.0.1:5503/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # 预压缩文件支持
    gzip_static on;
    brotli_static on;
}
```

---

## 最佳实践

### 1. 环境变量管理

```bash
# ✅ 正确：敏感信息使用环境变量
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJ...'

# ❌ 错误：在代码中硬编码敏感信息
const publicKey = 'MFwwDQYJ...'
```

### 2. 路径别名使用

```typescript
// ✅ 正确：使用路径别名
import { useAuth } from '@/composables/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'

// ❌ 不推荐：使用相对路径
import { useAuth } from '../../../composables/useAuth'
```

### 3. 自动导入利用

```vue
<script setup lang="ts">
// ✅ 正确：利用自动导入
const count = ref(0)
const router = useRouter()
const { hasPermission } = useAuth()

// ❌ 不推荐：手动导入已配置的自动导入项
import { ref } from 'vue'
import { useRouter } from 'vue-router'
</script>
```

### 4. 类型声明管理

```typescript
// ✅ 正确：在 types 目录中集中管理类型
// src/types/user.d.ts
export interface UserInfo {
  id: number
  name: string
  avatar: string
}

// ❌ 不推荐：在组件中内联定义复杂类型
```

### 5. 样式编写规范

```vue
<template>
  <!-- ✅ 正确：优先使用 UnoCSS 工具类 -->
  <div class="flex items-center justify-between p-4 bg-white rounded shadow">
    <span class="text-lg font-bold text-primary">标题</span>
  </div>

  <!-- ✅ 正确：复杂样式使用快捷方式 -->
  <div class="panel-title">面板标题</div>
</template>

<style scoped>
/* ✅ 正确：组件特有样式使用 scoped */
.custom-component {
  /* 特殊样式 */
}
</style>
```

---

## 常见问题

### 1. 开发环境接口请求失败

**问题原因:**
- 后端服务未启动
- 代理配置错误
- 端口号不匹配

**解决方案:**

```bash
# 1. 确认后端服务已启动
# 2. 检查环境变量配置
cat env/.env.development

# 确认端口号一致
VITE_APP_BASE_API_PORT='5503'

# 3. 检查代理配置是否正确
# vite.config.ts 中的 proxy 配置

# 4. 重启开发服务器
pnpm dev
```

### 2. 环境变量无法访问

**问题原因:**
- 变量名未以 `VITE_` 开头
- 变量定义在错误的文件中
- 未重启开发服务器

**解决方案:**

```bash
# 1. 确保变量以 VITE_ 开头
VITE_APP_TITLE = 'RyPlus-Uni'  # ✅
APP_TITLE = 'RyPlus-Uni'       # ❌

# 2. 确保在正确的环境文件中定义
# .env - 所有环境
# .env.development - 仅开发环境
# .env.production - 仅生产环境

# 3. 重启开发服务器
pnpm dev
```

### 3. TypeScript 类型错误

**问题原因:**
- 缺少类型声明
- 类型定义不正确
- 自动导入未生效

**解决方案:**

```typescript
// 1. 检查类型声明文件是否生成
// src/types/auto-imports.d.ts
// src/types/components.d.ts

// 2. 手动生成类型声明
pnpm dev  // 启动开发服务器会自动生成

// 3. 重启 TypeScript 服务
// VSCode: Ctrl+Shift+P -> TypeScript: Restart TS Server
```

### 4. 构建产物过大

**问题原因:**
- 未启用压缩
- 依赖未按需加载
- 静态资源未优化

**解决方案:**

```bash
# 1. 启用构建压缩
# env/.env.production
VITE_BUILD_COMPRESS='gzip,brotli'

# 2. 检查依赖是否按需导入
# 使用 unplugin-vue-components 自动按需导入

# 3. 分析构建产物
npx vite-bundle-analyzer
```

### 5. 热更新失效

**问题原因:**
- 文件监听被暂停
- 文件路径大小写不一致
- 循环依赖

**解决方案:**

```bash
# 1. 检查 HMR 状态
# 访问 http://localhost:80/__hmr_resume

# 2. 确保文件路径大小写一致
# Windows 不区分大小写，但 Linux 区分

# 3. 检查循环依赖
# 重构代码消除循环依赖
```

### 6. 图标不显示

**问题原因:**
- 图标类型文件未生成
- 图标名称错误
- 图标库未安装

**解决方案:**

```bash
# 1. 重新生成图标类型
pnpm dev  # 启动开发服务器会自动生成

# 2. 检查图标名称
# 访问 https://icones.js.org/ 查找正确的图标名称

# 3. 确保图标库已安装
# unplugin-icons 会自动安装，但可能需要重启
```

### 7. 代码生成失败

**问题原因:**
- 后端 OpenAPI 接口未启动
- 网络连接问题
- 配置路径错误

**解决方案:**

```bash
# 1. 确认后端 OpenAPI 接口可访问
curl http://127.0.0.1:5503/v3/api-docs/business

# 2. 检查插件配置
# vite/plugins/index.ts 中的 createOpenApiPlugin 配置

# 3. 手动触发生成
# 访问 http://localhost:80/__openapi_generate
```

---

## 配置文件清单

| 文件 | 说明 |
|------|------|
| `vite.config.ts` | Vite 主配置文件 |
| `tsconfig.json` | TypeScript 编译配置 |
| `uno.config.ts` | UnoCSS 原子化 CSS 配置 |
| `eslint.config.ts` | ESLint 代码检查配置 |
| `package.json` | 项目依赖和脚本配置 |
| `env/.env` | 基础环境变量 |
| `env/.env.development` | 开发环境变量 |
| `env/.env.production` | 生产环境变量 |
| `vite/plugins/index.ts` | Vite 插件入口 |
| `vite/plugins/auto-imports.ts` | 自动导入插件配置 |
| `vite/plugins/components.ts` | 组件自动导入配置 |
| `vite/plugins/compression.ts` | 构建压缩配置 |
| `vite/plugins/icons.ts` | 图标插件配置 |
| `vite/plugins/iconfont-types.ts` | 图标类型生成配置 |
| `vite/plugins/unocss.ts` | UnoCSS Vite 插件配置 |
| `vite/plugins/setup-extend.ts` | setup 语法扩展配置 |
| `vite/plugins/hmrControl.ts` | HMR 控制插件配置 |
| `vite/plugins/openapi/index.ts` | OpenAPI 代码生成插件 |

---

> **提示:**
> - 开发前请确保所有环境变量配置正确
> - 生产部署时注意检查所有外部服务地址
> - 定期更新依赖包版本以获得最新功能和安全修复
> - 利用自动导入和类型生成功能提高开发效率
