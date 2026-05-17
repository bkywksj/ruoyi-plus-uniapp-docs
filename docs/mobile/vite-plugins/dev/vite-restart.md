# 配置热重启插件

## 介绍

配置热重启插件（vite-plugin-restart）是一个专门用于监听 Vite 配置文件变化并自动重启开发服务器的插件。该插件解决了修改 `vite.config.ts`、环境变量文件或其他配置文件后需要手动重启服务器的问题，大幅提升开发效率和开发体验。

在 UniApp 项目中，由于涉及多个配置文件（`vite.config.ts`、`manifest.config.ts`、`pages.config.ts` 等），配置热重启功能显得尤为重要。传统方式下，开发者需要手动停止服务器再重新启动，这个过程不仅繁琐，还容易因为忘记重启而导致配置不生效，造成困惑。

**核心特性：**

- **自动重启** - 监听配置文件变化，自动重启开发服务器
- **即时生效** - 配置修改后立即应用，无需任何手动操作
- **多文件监听** - 支持同时监听多个配置文件和目录
- **Glob 模式** - 支持通配符匹配，灵活配置监听范围
- **页面刷新** - 支持文件变化时仅刷新页面而不重启服务器
- **开发友好** - 减少手动重启次数，专注于代码编写
- **零配置** - 开箱即用，默认配置满足大多数场景
- **低开销** - 基于 chokidar 的高效文件监听，资源消耗低

## 架构设计

### 插件系统架构

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        vite-plugin-restart 架构                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                        │
│  │  Vite 服务器  │                                                       │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       vite-plugin-restart                         │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │  ┌─────────────────┐   ┌─────────────────┐   ┌────────────────┐  │   │
│  │  │  配置解析器      │   │  文件监听器       │   │  事件处理器     │  │   │
│  │  │                 │   │                 │   │                │  │   │
│  │  │ • restart 配置  │──▶│ • chokidar      │──▶│ • 重启逻辑     │  │   │
│  │  │ • reload 配置   │   │ • Glob 匹配     │   │ • 刷新逻辑     │  │   │
│  │  │ • 路径解析      │   │ • 变化检测      │   │ • WebSocket    │  │   │
│  │  └─────────────────┘   └─────────────────┘   └────────────────┘  │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│         │                         │                         │            │
│         ▼                         ▼                         ▼            │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐     │
│  │ vite.config  │         │    .env      │         │   public/    │     │
│  │ manifest     │         │ .env.dev     │         │   static/    │     │
│  │ pages.config │         │ .env.prod    │         │   assets/    │     │
│  └──────────────┘         └──────────────┘         └──────────────┘     │
│     restart 触发            restart 触发            reload 触发          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 事件处理流程

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          事件处理流程                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐                                                         │
│  │ 开发服务器   │──────────────────────────────────────────────────┐    │
│  │ 启动       │                                                    │    │
│  └──────┬──────┘                                                   │    │
│         │                                                          │    │
│         ▼                                                          │    │
│  ┌─────────────┐                                                   │    │
│  │ 插件初始化   │                                                  │    │
│  │ configResolved                                                  │    │
│  └──────┬──────┘                                                   │    │
│         │                                                          │    │
│         ▼                                                          │    │
│  ┌─────────────┐                                                   │    │
│  │ 注册监听器   │                                                  │    │
│  │ configureServer                                                 │    │
│  └──────┬──────┘                                                   │    │
│         │                                                          │    │
│         ▼                                                          ▼    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    文件变化检测循环                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  文件变化事件 (add/change/unlink)                                │   │
│  │       │                                                          │   │
│  │       ▼                                                          │   │
│  │  ┌─────────────┐                                                 │   │
│  │  │ 匹配 restart │──是──▶ 触发服务器重启 ──▶ 回到开发服务器启动    │   │
│  │  │ 模式?       │                                                 │   │
│  │  └──────┬──────┘                                                 │   │
│  │         │                                                        │   │
│  │        否                                                        │   │
│  │         │                                                        │   │
│  │         ▼                                                        │   │
│  │  ┌─────────────┐                                                 │   │
│  │  │ 匹配 reload  │──是──▶ 发送 full-reload 信号 ──▶ 页面刷新      │   │
│  │  │ 模式?       │                                                 │   │
│  │  └──────┬──────┘                                                 │   │
│  │         │                                                        │   │
│  │        否                                                        │   │
│  │         │                                                        │   │
│  │         ▼                                                        │   │
│  │  继续监听（不处理该文件）                                         │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 与 Vite HMR 的关系

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    Vite 文件变化处理机制对比                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        文件变化检测                                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                              │                                          │
│           ┌──────────────────┼──────────────────┐                       │
│           ▼                  ▼                  ▼                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ 源代码文件   │    │ 配置文件     │    │ 静态资源     │                │
│  │ (.vue/.ts)  │    │ (vite.conf) │    │ (public/)   │                │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  Vite HMR   │    │vite-plugin  │    │vite-plugin  │                 │
│  │  热模块替换  │    │  -restart   │    │  -restart   │                 │
│  │             │    │  (restart)  │    │  (reload)   │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ 模块热替换   │    │ 服务器重启   │    │ 页面刷新     │                │
│  │ 保留状态    │    │ 全新加载     │    │ 保留服务器   │                │
│  │ 快速更新    │    │ 完全重置     │    │ 刷新页面     │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                          │
│  性能: 最快          性能: 最慢          性能: 中等                        │
│  状态: 保留          状态: 丢失          状态: 丢失                        │
│  场景: 业务代码      场景: 配置变更      场景: 静态资源                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 基本用法

### 插件配置

在 `vite/plugins/vite-restart.ts` 中配置插件：

```typescript
import ViteRestart from 'vite-plugin-restart'

/**
 * Vite 重启插件
 * 修改配置文件时自动重启
 */
export default () => {
  return ViteRestart({
    // 通过这个插件，在修改 vite.config.js 文件则不需要重新运行也生效配置
    restart: ['vite.config.js'],
  })
}
```

**使用说明：**

- 插件导出一个工厂函数，便于统一管理
- 默认只监听 `vite.config.js` 文件
- 可根据项目需求扩展监听范围

### 在插件入口中使用

```typescript
// vite/plugins/index.ts
import createViteRestart from './vite-restart'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件配置...

  // 开发工具插件（推荐放在靠后位置）
  vitePlugins.push(createViteRestart())

  // Uni 插件必须放在最后
  vitePlugins.push(Uni())

  return vitePlugins.filter(Boolean)
}
```

**插件顺序说明：**

- `vite-plugin-restart` 对插件顺序没有严格要求
- 推荐放在开发工具类插件位置
- 必须在 `@dcloudio/vite-plugin-uni` 之前

### 完整的 Vite 配置示例

```typescript
// vite.config.ts
import type { ConfigEnv, UserConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  console.log('command, mode -> ', command, mode)
  // pnpm dev:h5 时得到 => serve development
  // pnpm build:h5 时得到 => build production
  // pnpm dev:mp-weixin 时得到 => build development
  // pnpm build:mp-weixin 时得到 => build production

  const { UNI_PLATFORM } = process.env
  console.log('UNI_PLATFORM -> ', UNI_PLATFORM)

  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  console.log('环境变量 env -> ', env)

  return defineConfig({
    base: env.VITE_APP_PUBLIC_PATH || '/',
    envDir: './env',

    // 使用抽离后的插件配置（包含 vite-restart）
    plugins: await createVitePlugins({ command, mode, env }),

    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },

    server: {
      host: '0.0.0.0',
      hmr: true,
      strictPort: false,
      open: true,
    },
  })
}
```

## 配置选项

### restart

- **类型**: `string | string[]`
- **默认值**: `[]`
- **说明**: 需要监听的文件列表，文件变化时触发服务器重启

```typescript
ViteRestart({
  restart: [
    'vite.config.js',
    'vite.config.ts',
    '.env',
    '.env.development',
    '.env.production',
  ],
})
```

**支持的文件模式：**

| 模式 | 说明 | 示例 |
|------|------|------|
| 单个文件 | 精确匹配文件 | `'vite.config.js'` |
| 通配符 | 匹配任意文件名 | `'*.config.js'` |
| 目录递归 | 匹配任意层级 | `'vite/**/*'` |
| 扩展名组 | 匹配多个扩展名 | `'*.{js,ts}'` |
| 否定模式 | 排除特定文件 | `'!node_modules/**'` |

### reload

- **类型**: `string | string[]`
- **默认值**: `[]`
- **说明**: 需要监听的文件列表，文件变化时触发页面刷新（不重启服务器）

```typescript
ViteRestart({
  restart: ['vite.config.js'],
  reload: [
    'public/**/*',      // public 目录变化时刷新页面
    'src/static/**/*',  // 静态资源变化时刷新页面
  ],
})
```

**restart vs reload 对比：**

| 特性 | restart | reload |
|------|---------|--------|
| 服务器状态 | 完全重启 | 保持运行 |
| 执行速度 | 较慢（秒级） | 快速（毫秒级） |
| 配置生效 | 重新加载配置 | 不重新加载 |
| 使用场景 | 配置文件 | 静态资源 |
| 模块缓存 | 完全清除 | 保留 |

## UniApp 项目推荐配置

### 基础配置

针对 UniApp 项目的基础推荐配置：

```typescript
export default () => {
  return ViteRestart({
    restart: [
      // Vite 主配置文件
      'vite.config.js',
      'vite.config.ts',
    ],
  })
}
```

### 完整配置

针对复杂 UniApp 项目的完整配置：

```typescript
export default () => {
  return ViteRestart({
    restart: [
      // ==================== Vite 配置 ====================
      'vite.config.js',
      'vite.config.ts',

      // ==================== 环境变量 ====================
      '.env',
      '.env.*',                    // 匹配所有环境文件
      'env/.env',
      'env/.env.*',                // env 目录下的环境文件

      // ==================== UniApp 配置 ====================
      'manifest.config.ts',        // 应用配置
      'pages.config.ts',           // 页面路由配置

      // ==================== 插件配置目录 ====================
      'vite/plugins/**/*.ts',      // 所有插件配置

      // ==================== TypeScript 配置 ====================
      'tsconfig.json',
      'tsconfig.*.json',

      // ==================== UnoCSS 配置 ====================
      'uno.config.ts',
      'unocss.config.ts',

      // ==================== 代码规范配置 ====================
      '.eslintrc.js',
      '.eslintrc.cjs',
      'eslint.config.js',
      '.prettierrc',
      '.prettierrc.js',
    ],
    reload: [
      // ==================== 静态资源 ====================
      'public/**/*',
      'src/static/**/*',

      // ==================== 全局样式 ====================
      'src/App.vue',               // 全局样式变化刷新
    ],
  })
}
```

### 分环境配置

根据开发模式动态配置：

```typescript
import type { ConfigEnv } from 'vite'

export default (mode: string) => {
  // 基础监听文件
  const restartFiles = [
    'vite.config.ts',
    '.env',
    `.env.${mode}`,
  ]

  // 开发环境额外监听
  if (mode === 'development') {
    restartFiles.push(
      'vite/plugins/**/*',
      'manifest.config.ts',
      'pages.config.ts',
      'uno.config.ts',
    )
  }

  return ViteRestart({
    restart: restartFiles,
  })
}
```

### 平台特定配置

针对不同 UniApp 平台的配置：

```typescript
import process from 'node:process'

export default () => {
  const { UNI_PLATFORM } = process.env

  // 基础监听文件
  const restartFiles = ['vite.config.ts']
  const reloadFiles: string[] = []

  // H5 平台特殊配置
  if (UNI_PLATFORM === 'h5') {
    restartFiles.push('index.html')
    reloadFiles.push('public/**/*')
  }

  // 小程序平台特殊配置
  if (UNI_PLATFORM === 'mp-weixin') {
    restartFiles.push(
      'manifest.config.ts',  // 小程序配置更改需重启
      'pages.config.ts',     // 页面配置更改需重启
    )
  }

  // App 平台特殊配置
  if (UNI_PLATFORM === 'app') {
    restartFiles.push(
      'manifest.config.ts',
      'src/hybrid/**/*',     // 原生插件配置
    )
  }

  return ViteRestart({
    restart: restartFiles,
    reload: reloadFiles,
  })
}
```

## 工作原理

### 核心实现机制

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          核心实现原理                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. 插件初始化阶段 (configureServer)                                     │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │  • 获取 ViteDevServer 实例                                       │ │
│     │  • 解析 restart/reload 配置的 Glob 模式                          │ │
│     │  • 使用 chokidar 创建文件监听器                                   │ │
│     │  • 注册监听回调函数                                              │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  2. 文件监听阶段 (chokidar)                                              │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │  • 监听 add/change/unlink 事件                                   │ │
│     │  • 使用 picomatch 匹配 Glob 模式                                 │ │
│     │  • 判断变化文件属于 restart 还是 reload                           │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  3. 重启处理阶段 (restart)                                               │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │  • 调用 server.restart() 方法                                    │ │
│     │  • 关闭当前服务器连接                                             │ │
│     │  • 重新加载配置文件                                               │ │
│     │  • 重新初始化所有插件                                             │ │
│     │  • 重新启动开发服务器                                             │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  4. 刷新处理阶段 (reload)                                                │
│     ┌─────────────────────────────────────────────────────────────────┐ │
│     │  • 调用 server.ws.send({ type: 'full-reload' })                  │ │
│     │  • 通过 WebSocket 发送刷新信号                                    │ │
│     │  • 客户端接收信号后刷新页面                                       │ │
│     └─────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 底层依赖关系

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          依赖关系图                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                     ┌───────────────────────┐                           │
│                     │   vite-plugin-restart │                           │
│                     │       v0.4.2          │                           │
│                     └───────────┬───────────┘                           │
│                                 │                                        │
│              ┌──────────────────┼──────────────────┐                    │
│              │                  │                  │                    │
│              ▼                  ▼                  ▼                    │
│     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │
│     │   chokidar     │ │   picomatch    │ │   vite (peer)  │           │
│     │  文件监听       │ │  Glob 匹配     │ │  开发服务器     │           │
│     │                │ │                │ │                │           │
│     │ • FSWatcher    │ │ • parse        │ │ • DevServer    │           │
│     │ • watch()      │ │ • isMatch      │ │ • restart()    │           │
│     │ • add/change   │ │ • makeRe       │ │ • ws.send()    │           │
│     └────────────────┘ └────────────────┘ └────────────────┘           │
│                                                                          │
│     跨平台文件监听       高性能模式匹配        Vite 开发服务器 API        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 插件生命周期

```typescript
// vite-plugin-restart 的简化实现原理
import type { Plugin, ViteDevServer } from 'vite'
import chokidar from 'chokidar'
import picomatch from 'picomatch'

interface Options {
  restart?: string | string[]
  reload?: string | string[]
}

export default function ViteRestart(options: Options = {}): Plugin {
  let server: ViteDevServer

  const restart = toArray(options.restart)
  const reload = toArray(options.reload)

  return {
    name: 'vite-plugin-restart',

    // 1. 插件配置阶段
    apply: 'serve', // 仅在开发模式生效

    // 2. 服务器配置阶段
    configureServer(_server) {
      server = _server

      // 创建文件监听器
      if (restart.length > 0) {
        const restartMatcher = picomatch(restart)
        const watcher = chokidar.watch('.', {
          ignoreInitial: true,
          ignored: ['**/node_modules/**', '**/.git/**'],
        })

        watcher.on('all', (event, path) => {
          if (restartMatcher(path)) {
            console.log(`[vite-plugin-restart] ${path} changed, restarting...`)
            server.restart()
          }
        })
      }

      if (reload.length > 0) {
        const reloadMatcher = picomatch(reload)
        const watcher = chokidar.watch('.', {
          ignoreInitial: true,
          ignored: ['**/node_modules/**', '**/.git/**'],
        })

        watcher.on('all', (event, path) => {
          if (reloadMatcher(path)) {
            console.log(`[vite-plugin-restart] ${path} changed, reloading...`)
            server.ws.send({ type: 'full-reload' })
          }
        })
      }
    },
  }
}

function toArray(value?: string | string[]): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}
```

## 使用场景

### 1. 修改 Vite 配置

修改 `vite.config.ts` 中的配置项时，服务器自动重启：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,        // 修改端口
    host: '0.0.0.0',   // 修改 host
    proxy: {           // 修改代理配置
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // 修改构建配置
  build: {
    target: 'es2020',
    sourcemap: true,
  },

  // 修改别名配置
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',  // 新增别名
    },
  },
})
```

**自动重启后的效果：**
- 新端口立即生效
- 代理配置立即可用
- 别名配置立即生效

### 2. 修改环境变量

修改 `.env` 文件时，服务器自动重启以加载新的环境变量：

```bash
# env/.env.development

# 修改 API 地址
VITE_APP_BASE_API=http://localhost:5500

# 修改应用标题
VITE_APP_TITLE=RuoYi Plus UniApp

# 修改调试开关
VITE_DELETE_CONSOLE=false
VITE_SHOW_SOURCEMAP=true

# 修改基础路径
VITE_APP_PUBLIC_PATH=/app/
```

**环境变量类型说明：**

| 变量前缀 | 可访问范围 | 示例 |
|---------|-----------|------|
| `VITE_` | 客户端可见 | `VITE_APP_TITLE` |
| 无前缀 | 仅服务端 | `API_SECRET` |

### 3. 添加新插件

在 `vite/plugins/` 目录下添加或修改插件配置时，自动重启：

```typescript
// vite/plugins/new-feature.ts
import type { Plugin } from 'vite'

export default (): Plugin => {
  return {
    name: 'vite-plugin-new-feature',

    configResolved(config) {
      console.log('新插件已加载')
    },

    transform(code, id) {
      // 转换逻辑
      return code
    },
  }
}
```

```typescript
// vite/plugins/index.ts
import createNewFeature from './new-feature'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // ... 其他插件

  // 新增插件（保存后自动重启生效）
  vitePlugins.push(createNewFeature())

  return vitePlugins
}
```

### 4. 修改 UniApp 配置

修改 UniApp 特有配置文件：

```typescript
// manifest.config.ts
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  name: 'RuoYi Plus App',
  appid: '__UNI__XXXXXX',
  versionName: '1.0.1',    // 修改版本号
  versionCode: 101,

  'mp-weixin': {
    appid: 'wx123456789',  // 修改小程序 appid
    setting: {
      urlCheck: false,
    },
  },
})
```

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationBarTitleText: 'RuoYi',      // 修改标题
    navigationBarBackgroundColor: '#fff',  // 修改颜色
  },

  pages: [
    // 添加新页面配置
    {
      path: 'pages/new-page/index',
      style: { navigationBarTitleText: '新页面' },
    },
  ],
})
```

### 5. 修改 UnoCSS 配置

修改原子化 CSS 配置：

```typescript
// uno.config.ts
import { defineConfig, presetUni } from 'unocss'

export default defineConfig({
  presets: [presetUni()],

  // 添加自定义规则（保存后自动重启）
  rules: [
    ['custom-shadow', { 'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)' }],
  ],

  // 添加自定义快捷方式
  shortcuts: {
    'btn-primary': 'bg-blue-500 text-white px-4 py-2 rounded',
  },

  // 添加主题配置
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
    },
  },
})
```

### 6. 修改 TypeScript 配置

修改 TypeScript 编译配置：

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "strictNullChecks": true,  // 新增严格空检查
    "paths": {
      "@/*": ["./src/*"],
      "@api/*": ["./src/api/*"]  // 新增路径别名
    }
  }
}
```

## Glob 模式详解

### 基础语法

| 模式 | 说明 | 示例匹配 |
|------|------|---------|
| `*` | 匹配任意文件名（不含路径分隔符） | `*.ts` 匹配 `index.ts` |
| `**` | 匹配任意目录层级 | `src/**/*` 匹配 `src/a/b/c.ts` |
| `?` | 匹配单个字符 | `vite.config.?s` 匹配 `vite.config.ts` |
| `{a,b}` | 匹配 a 或 b | `*.{js,ts}` 匹配 `index.js` 和 `index.ts` |
| `[abc]` | 匹配方括号内任意字符 | `[abc].ts` 匹配 `a.ts`、`b.ts`、`c.ts` |
| `[a-z]` | 匹配字符范围 | `[a-z].ts` 匹配 `a.ts` 到 `z.ts` |
| `!pattern` | 否定匹配（排除） | `!*.test.ts` 排除测试文件 |

### 常用模式示例

```typescript
ViteRestart({
  restart: [
    // 精确匹配
    'vite.config.ts',

    // 匹配所有 .ts 配置文件
    '*.config.ts',

    // 匹配 env 目录下所有环境文件
    'env/.env*',

    // 匹配插件目录所有 TypeScript 文件
    'vite/plugins/**/*.ts',

    // 匹配多个扩展名
    'vite.config.{js,ts,mjs,cjs}',

    // 匹配 JSON 和 JSON5 配置
    '*.config.{json,json5}',
  ],
})
```

### 排除模式

```typescript
ViteRestart({
  restart: [
    // 监听插件目录，但排除测试文件
    'vite/plugins/**/*.ts',
    '!vite/plugins/**/*.test.ts',
    '!vite/plugins/**/*.spec.ts',

    // 监听 src 目录配置，但排除组件
    'src/**/*.config.ts',
    '!src/components/**',
  ],
})
```

### Windows 路径兼容

```typescript
// 始终使用正斜杠，插件会自动处理 Windows 反斜杠
ViteRestart({
  restart: [
    'vite/plugins/**/*',      // ✅ 正确
    // 'vite\\plugins\\**\\*', // ❌ 避免使用反斜杠
  ],
})
```

## API

### 插件接口

```typescript
import type { Plugin } from 'vite'

interface ViteRestartOptions {
  /**
   * 文件变化时重启服务器的 Glob 模式
   * @default []
   */
  restart?: string | string[]

  /**
   * 文件变化时刷新页面的 Glob 模式
   * @default []
   */
  reload?: string | string[]
}

/**
 * 创建 vite-plugin-restart 插件实例
 * @param options 插件配置选项
 * @returns Vite 插件实例
 */
declare function ViteRestart(options?: ViteRestartOptions): Plugin

export default ViteRestart
```

### 类型定义

```typescript
// types/vite-plugin-restart.d.ts
declare module 'vite-plugin-restart' {
  import type { Plugin } from 'vite'

  interface Options {
    /** 触发服务器重启的文件 Glob 模式 */
    restart?: string | string[]
    /** 触发页面刷新的文件 Glob 模式 */
    reload?: string | string[]
  }

  function ViteRestart(options?: Options): Plugin

  export default ViteRestart
  export { Options }
}
```

### Vite DevServer 相关 API

```typescript
// Vite 开发服务器重启相关 API
interface ViteDevServer {
  /**
   * 重启开发服务器
   * 会重新加载配置并重新初始化所有插件
   */
  restart(): Promise<void>

  /**
   * WebSocket 服务
   * 用于向客户端发送消息
   */
  ws: {
    /**
     * 发送消息到所有连接的客户端
     */
    send(payload: {
      type: 'full-reload' | 'custom' | string
      event?: string
      data?: any
    }): void
  }
}
```

## 性能优化

### 监听范围优化

```typescript
// ❌ 不推荐：监听范围过大
ViteRestart({
  restart: ['**/*'],  // 监听所有文件，性能差
})

// ❌ 不推荐：监听 src 目录
ViteRestart({
  restart: ['src/**/*'],  // 源码应该用 HMR，不是重启
})

// ✅ 推荐：精确监听配置文件
ViteRestart({
  restart: [
    'vite.config.ts',
    'manifest.config.ts',
    'pages.config.ts',
    'uno.config.ts',
  ],
})
```

### 避免监听大型目录

```typescript
// ❌ 不推荐
ViteRestart({
  restart: ['node_modules/**/*'],  // 永远不要监听 node_modules
})

// ❌ 不推荐
ViteRestart({
  reload: ['dist/**/*'],  // 构建产物不需要监听
})

// ✅ 推荐
ViteRestart({
  restart: ['vite/plugins/**/*.ts'],  // 只监听必要的目录
  reload: ['public/**/*'],             // 静态资源用 reload
})
```

### 合理使用 reload

```typescript
// 静态资源变化只需刷新页面，不需要重启服务器
ViteRestart({
  // 需要重启的（影响构建）
  restart: [
    'vite.config.ts',
    '.env*',
  ],
  // 只需刷新的（不影响构建）
  reload: [
    'public/**/*',        // 公共资源
    'src/static/**/*',    // 静态资源
    'src/assets/**/*.svg', // SVG 图标
  ],
})
```

### 排除不必要的文件

```typescript
ViteRestart({
  restart: [
    'vite/plugins/**/*.ts',
    // 排除临时文件和编辑器文件
    '!**/*.swp',
    '!**/*~',
    '!**/.DS_Store',
    '!**/Thumbs.db',
  ],
})
```

## 调试技巧

### 启用详细日志

```typescript
// 自定义包装插件，添加详细日志
import ViteRestart from 'vite-plugin-restart'

export default () => {
  const plugin = ViteRestart({
    restart: ['vite.config.ts'],
  })

  // 包装原始插件，添加调试日志
  return {
    ...plugin,
    name: 'vite-plugin-restart-debug',
    configureServer(server) {
      console.log('[vite-restart] 插件已初始化')
      console.log('[vite-restart] 监听文件:', ['vite.config.ts'])

      // 调用原始配置
      if (typeof plugin.configureServer === 'function') {
        plugin.configureServer(server)
      }
    },
  }
}
```

### 手动测试文件监听

```bash
# 在终端监控配置文件变化
# macOS/Linux
watch -n 1 'stat vite.config.ts | grep Modify'

# Windows PowerShell
while ($true) {
  Get-Item vite.config.ts | Select-Object LastWriteTime
  Start-Sleep -Seconds 1
}
```

### 检查插件加载顺序

```typescript
// vite.config.ts
export default defineConfig({
  plugins: await createVitePlugins({ command, mode, env }),

  // 添加调试钩子
  configResolved(config) {
    console.log('已加载的插件:')
    config.plugins.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`)
    })
  },
})
```

### 验证重启是否生效

```typescript
// 在配置中添加时间戳，验证重启
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})

// 在应用中打印
console.log('构建时间:', __BUILD_TIME__)
// 修改配置后，如果时间更新，说明重启成功
```

## 最佳实践

### 1. 合理划分监听范围

```typescript
// ✅ 推荐：按文件类型分类
ViteRestart({
  // 配置文件变化 → 重启
  restart: [
    'vite.config.*',
    '*.config.{js,ts}',
    '.env*',
  ],
  // 静态资源变化 → 刷新
  reload: [
    'public/**/*',
    'src/static/**/*',
  ],
})
```

### 2. 避免监听频繁变化的文件

```typescript
// ❌ 错误：监听源码目录会导致频繁重启
ViteRestart({
  restart: ['src/**/*'],
})

// ✅ 正确：源码变化依赖 Vite 的 HMR
ViteRestart({
  restart: ['vite.config.*', '.env*'],
})
```

### 3. 与其他开发工具配合

```typescript
// 配合 UnoCSS 使用
ViteRestart({
  restart: [
    'vite.config.*',
    'uno.config.*',      // UnoCSS 配置变化时重启
  ],
})

// 配合 uni-pages 使用
ViteRestart({
  restart: [
    'vite.config.*',
    'pages.config.*',    // 页面配置变化时重启
    'manifest.config.*', // 应用配置变化时重启
  ],
})
```

### 4. 生产环境禁用

```typescript
// 插件默认只在开发模式生效（apply: 'serve'）
// 无需额外配置，生产构建时自动跳过
export default () => {
  return ViteRestart({
    restart: ['vite.config.*'],
  })
}
```

### 5. 统一配置管理

```typescript
// vite/plugins/vite-restart.ts
// 将配置集中管理，便于维护

const RESTART_FILES = [
  // Vite 核心配置
  'vite.config.{js,ts}',
  // 环境变量
  'env/.env*',
  '.env*',
  // UniApp 配置
  'manifest.config.ts',
  'pages.config.ts',
  // 样式配置
  'uno.config.ts',
  // TypeScript 配置
  'tsconfig.json',
] as const

const RELOAD_FILES = [
  'public/**/*',
  'src/static/**/*',
] as const

export default () => {
  return ViteRestart({
    restart: [...RESTART_FILES],
    reload: [...RELOAD_FILES],
  })
}
```

### 6. 文档化配置决策

```typescript
// vite/plugins/vite-restart.ts

/**
 * Vite 重启插件配置
 *
 * 设计决策：
 * 1. 只监听配置文件，不监听源码（源码依赖 HMR）
 * 2. 静态资源使用 reload 而非 restart（更快）
 * 3. 排除 node_modules 和构建产物
 *
 * 维护注意：
 * - 添加新的配置文件时，需要更新此列表
 * - 确保 Glob 模式正确（使用正斜杠）
 */
export default () => {
  return ViteRestart({
    restart: [
      'vite.config.ts',
      'manifest.config.ts',
      'pages.config.ts',
    ],
  })
}
```

## 常见问题

### 1. 修改配置后未重启

**问题原因：**
- 文件未在监听列表中
- 文件路径不匹配 Glob 模式
- 插件未正确加载

**解决方案：**

```typescript
// 1. 确保文件在监听列表中
ViteRestart({
  restart: [
    'vite.config.js',
    'vite.config.ts',  // 同时包含 js 和 ts
  ],
})

// 2. 使用通配符匹配所有扩展名
ViteRestart({
  restart: ['vite.config.*'],
})

// 3. 验证插件是否加载
// 在 vite.config.ts 中打印插件列表
configResolved(config) {
  const hasRestart = config.plugins.some(p =>
    p.name === 'vite-plugin-restart'
  )
  console.log('vite-plugin-restart 已加载:', hasRestart)
}
```

### 2. 重启过于频繁

**问题原因：**
- 监听范围过大
- 包含了频繁变化的文件
- 编辑器临时文件触发重启

**解决方案：**

```typescript
// 1. 缩小监听范围
ViteRestart({
  restart: [
    'vite.config.ts',  // 只监听必要的文件
  ],
})

// 2. 排除临时文件
ViteRestart({
  restart: [
    'vite/**/*.ts',
    '!**/*.swp',       // 排除 vim 临时文件
    '!**/*~',          // 排除备份文件
    '!**/.#*',         // 排除 emacs 锁文件
  ],
})
```

### 3. 与 HMR 冲突

**问题原因：**
- 源码文件被放入 restart 列表
- HMR 和重启同时触发

**解决方案：**

```typescript
// 源码变化应该使用 HMR，不是重启
ViteRestart({
  // ✅ 只监听配置文件
  restart: ['vite.config.ts'],
  // ❌ 不要监听源码
  // restart: ['src/**/*'],
})
```

### 4. Windows 路径问题

**问题原因：**
- Windows 使用反斜杠路径
- Glob 模式使用正斜杠

**解决方案：**

```typescript
// 始终使用正斜杠
ViteRestart({
  restart: [
    'vite/plugins/**/*',    // ✅ 正确
    // 'vite\\plugins\\**\\*', // ❌ 避免
  ],
})
```

### 5. 环境变量修改不生效

**问题原因：**
- `.env` 文件不在监听列表
- 环境变量目录不同

**解决方案：**

```typescript
ViteRestart({
  restart: [
    'vite.config.ts',
    // 监听根目录环境文件
    '.env',
    '.env.*',
    // 监听 env 目录环境文件
    'env/.env',
    'env/.env.*',
  ],
})
```

### 6. 小程序配置不生效

**问题原因：**
- UniApp 配置文件未监听
- 小程序需要重新编译

**解决方案：**

```typescript
ViteRestart({
  restart: [
    'vite.config.ts',
    'manifest.config.ts',  // 应用配置
    'pages.config.ts',     // 页面配置
  ],
})
```

### 7. 插件顺序问题

**问题原因：**
- 插件顺序影响功能
- 与其他插件冲突

**解决方案：**

```typescript
// vite/plugins/index.ts
export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 1. 静态资源类型插件（最早）
  vitePlugins.push(createStaticAssetsTypes())

  // 2. UniApp 相关插件
  vitePlugins.push(createUniPages(mode))
  vitePlugins.push(UniLayouts())

  // 3. 自动导入插件
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createComponents())

  // 4. 开发工具插件（包括 vite-restart）
  vitePlugins.push(createViteRestart())

  // 5. Uni 插件必须最后
  vitePlugins.push(Uni())

  return vitePlugins
}
```

### 8. 构建时出现警告

**问题原因：**
- 插件在生产构建时运行

**解决方案：**

```typescript
// 插件默认只在开发模式生效
// 检查 apply 配置
{
  name: 'vite-plugin-restart',
  apply: 'serve',  // 只在 serve 命令时生效
}
```

## 版本兼容性

### 依赖版本

| 依赖 | 版本要求 | 项目版本 |
|------|---------|---------|
| vite-plugin-restart | ^0.4.0 | 0.4.2 |
| vite | ^4.0.0 \| ^5.0.0 \| ^6.0.0 | 6.3.5 |
| Node.js | >=16.0.0 | >=18.0.0 |

### Vite 版本兼容

```typescript
// Vite 4.x
import ViteRestart from 'vite-plugin-restart'

// Vite 5.x / 6.x
import ViteRestart from 'vite-plugin-restart'

// API 保持一致，无需修改配置
```

### 与其他插件兼容性

| 插件 | 兼容性 | 说明 |
|------|--------|------|
| @dcloudio/vite-plugin-uni | ✅ | 完全兼容 |
| @uni-helper/vite-plugin-uni-pages | ✅ | 完全兼容 |
| unplugin-auto-import | ✅ | 完全兼容 |
| unocss | ✅ | 完全兼容 |
| vite-plugin-compression | ✅ | 完全兼容 |

## 扩展阅读

### chokidar 文件监听

chokidar 是 vite-plugin-restart 底层使用的文件监听库，提供跨平台的高效文件监听能力：

```typescript
// chokidar 基本用法
import chokidar from 'chokidar'

const watcher = chokidar.watch('.', {
  ignored: /(^|[\/\\])\../,  // 忽略隐藏文件
  persistent: true,           // 持续监听
  ignoreInitial: true,        // 忽略初始扫描
})

watcher
  .on('add', path => console.log(`文件添加: ${path}`))
  .on('change', path => console.log(`文件修改: ${path}`))
  .on('unlink', path => console.log(`文件删除: ${path}`))
```

### picomatch Glob 匹配

picomatch 是用于 Glob 模式匹配的高性能库：

```typescript
import picomatch from 'picomatch'

// 创建匹配函数
const isMatch = picomatch('**/*.ts')

console.log(isMatch('src/index.ts'))     // true
console.log(isMatch('src/utils/a.js'))   // false

// 多模式匹配
const isConfig = picomatch([
  '*.config.ts',
  '.env*',
])

console.log(isConfig('vite.config.ts'))  // true
console.log(isConfig('.env.development')) // true
```

### Vite 开发服务器 API

```typescript
// Vite DevServer 重要 API
interface ViteDevServer {
  // 配置信息
  config: ResolvedConfig

  // HTTP 服务器
  httpServer: http.Server

  // WebSocket 服务
  ws: WebSocketServer

  // 模块图
  moduleGraph: ModuleGraph

  // 重启服务器
  restart(): Promise<void>

  // 关闭服务器
  close(): Promise<void>
}
```
