# 配置热重启插件

## 介绍

配置热重启插件（vite-plugin-restart）用于在修改 Vite 配置文件时自动重启开发服务器。该插件解决了修改 `vite.config.js` 等配置文件后需要手动重启服务器的问题，提升开发效率。

**核心特性：**

- **自动重启** - 监听配置文件变化，自动重启开发服务器
- **即时生效** - 配置修改后立即应用，无需手动操作
- **多文件监听** - 支持监听多个配置文件
- **开发友好** - 减少手动重启次数，提升开发体验

## 基本用法

### 插件配置

在 `vite/plugins/vite-restart.ts` 中配置：

```typescript
import ViteRestart from 'vite-plugin-restart'

export default () => {
  return ViteRestart({
    // 监听这些文件的变化，变化时自动重启
    restart: ['vite.config.js'],
  })
}
```

### 在插件入口中使用

```typescript
// vite/plugins/index.ts
import createViteRestart from './vite-restart'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件...

  // 开发工具插件
  vitePlugins.push(createViteRestart())

  return vitePlugins
}
```

## 配置选项

### restart

- **类型**: `string[]`
- **默认值**: `['vite.config.js']`
- **说明**: 需要监听的文件列表，文件变化时触发重启

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

### reload

- **类型**: `string[]`
- **说明**: 需要监听的文件列表，文件变化时触发页面刷新（不重启服务器）

```typescript
ViteRestart({
  restart: ['vite.config.js'],
  reload: ['public/**/*'],  // public 目录变化时刷新页面
})
```

## 推荐配置

### 监听所有配置文件

```typescript
export default () => {
  return ViteRestart({
    restart: [
      // Vite 配置
      'vite.config.js',
      'vite.config.ts',

      // 环境变量
      '.env',
      '.env.*',

      // 插件配置目录
      'vite/plugins/**/*',

      // TypeScript 配置
      'tsconfig.json',

      // UnoCSS 配置
      'uno.config.ts',

      // 页面配置
      'pages.config.ts',
    ],
  })
}
```

### 区分重启和刷新

```typescript
export default () => {
  return ViteRestart({
    // 需要重启服务器的文件
    restart: [
      'vite.config.*',
      '.env*',
      'vite/plugins/**/*',
    ],
    // 只需要刷新页面的文件
    reload: [
      'public/**/*',
      'src/static/**/*',
    ],
  })
}
```

## 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                   插件工作流程                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  开发服务器启动                                           │
│       ↓                                                 │
│  插件注册文件监听器                                       │
│       ↓                                                 │
│  监听 restart/reload 配置的文件                          │
│       ↓                                                 │
│  文件变化检测                                            │
│       ↓                                                 │
│  restart 文件？ ──是──> 重启开发服务器                    │
│       │                                                 │
│       否                                                │
│       ↓                                                 │
│  reload 文件？ ──是──> 发送页面刷新信号                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 使用场景

### 1. 修改 Vite 配置

修改 `vite.config.ts` 中的配置项时，服务器自动重启：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,  // 修改端口，自动重启生效
  },
})
```

### 2. 修改环境变量

修改 `.env` 文件时，服务器自动重启以加载新的环境变量：

```bash
# .env.development
VITE_APP_TITLE=My App  # 修改后自动重启
```

### 3. 添加新插件

在 `vite/plugins/` 目录下添加或修改插件配置时，自动重启：

```typescript
// vite/plugins/new-plugin.ts
export default () => {
  return {
    name: 'new-plugin',
    // ...
  }
}
```

## API

### 插件导出

```typescript
import ViteRestart from 'vite-plugin-restart'

interface Options {
  /** 文件变化时重启服务器 */
  restart?: string[]
  /** 文件变化时刷新页面 */
  reload?: string[]
}

const plugin = ViteRestart(options: Options): Plugin
```

### 选项说明

| 选项 | 类型 | 说明 |
|------|------|------|
| restart | `string[]` | 触发服务器重启的文件 glob 模式 |
| reload | `string[]` | 触发页面刷新的文件 glob 模式 |

### Glob 模式支持

| 模式 | 说明 | 示例 |
|------|------|------|
| `*` | 匹配任意文件名 | `*.config.js` |
| `**` | 匹配任意目录层级 | `vite/**/*` |
| `{a,b}` | 匹配 a 或 b | `*.{js,ts}` |
| `?` | 匹配单个字符 | `vite.config.?s` |

## 最佳实践

### 1. 合理划分监听范围

```typescript
ViteRestart({
  // 只监听真正影响构建的文件
  restart: [
    'vite.config.*',
    '.env*',
    'tsconfig.json',
  ],
  // 静态资源只需刷新
  reload: [
    'public/**/*',
  ],
})
```

### 2. 避免监听频繁变化的文件

```typescript
// ❌ 不推荐：监听 src 目录会导致频繁重启
ViteRestart({
  restart: ['src/**/*'],
})

// ✅ 推荐：只监听配置文件
ViteRestart({
  restart: ['vite.config.*', '.env*'],
})
```

### 3. 与其他工具配合

```typescript
// 配合 UnoCSS 使用
ViteRestart({
  restart: [
    'vite.config.*',
    'uno.config.*',  // UnoCSS 配置变化时重启
  ],
})
```

## 常见问题

### 1. 修改配置后未重启

**问题原因：**
- 文件未在监听列表中
- 文件路径不匹配 glob 模式

**解决方案：**

```typescript
ViteRestart({
  restart: [
    'vite.config.js',
    'vite.config.ts',  // 确保包含正确的文件扩展名
  ],
})
```

### 2. 重启过于频繁

**问题原因：**
- 监听范围过大
- 包含了频繁变化的文件

**解决方案：**

缩小监听范围，只监听配置文件：

```typescript
ViteRestart({
  restart: ['vite.config.*'],  // 不要监听整个目录
})
```

### 3. 与 HMR 冲突

**问题原因：**
- 某些文件变化应该使用 HMR 而非重启

**解决方案：**

确保只有需要重启的配置文件在 restart 列表中，业务代码依赖 Vite 的 HMR 机制。

### 4. Windows 路径问题

**问题原因：**
- Windows 使用反斜杠路径

**解决方案：**

使用正斜杠或通配符，插件会自动处理：

```typescript
ViteRestart({
  restart: [
    'vite/plugins/**/*',  // 使用正斜杠
  ],
})
```
