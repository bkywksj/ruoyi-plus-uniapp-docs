# 图标预设管理

图标预设管理用于配置和优化 UnoCSS 图标系统的加载策略,确保常用图标快速可用,提升应用性能。

## 🎯 预设概念

### 什么是图标预设

图标预设 (Safelist) 是 UnoCSS 配置中预先加载的图标列表。这些图标会在构建时被打包,无需运行时动态加载。

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    'i-ep-home',      // ✅ 预加载
    'i-ep-setting',   // ✅ 预加载
    'i-ep-user',      // ✅ 预加载
  ]
})
```

### 预设的作用

1. **提升性能**: 预加载常用图标,减少运行时开销
2. **避免闪烁**: 防止图标延迟加载导致的视觉跳动
3. **保证可用**: 确保关键图标始终可用
4. **优化构建**: 减少动态导入的复杂度

## 📋 配置方式

### 1. 手动配置

```typescript
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  safelist: [
    // 导航图标
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',

    // 操作图标
    'i-ep-edit',
    'i-ep-delete',
    'i-ep-search',

    // 状态图标
    'i-ep-success-filled',
    'i-ep-warning-filled',
    'i-ep-error-filled',
  ]
})
```

### 2. 从类型文件导入

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons'

export default defineConfig({
  safelist: [
    // 加载所有 Iconify 图标
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ]
})
```

### 3. 分类配置

```typescript
// uno.config.ts
const navigationIcons = [
  'i-ep-home',
  'i-ep-menu',
  'i-ep-user',
]

const actionIcons = [
  'i-ep-edit',
  'i-ep-delete',
  'i-ep-view',
]

const statusIcons = [
  'i-ep-success-filled',
  'i-ep-warning-filled',
  'i-ep-error-filled',
]

export default defineConfig({
  safelist: [
    ...navigationIcons,
    ...actionIcons,
    ...statusIcons,
  ]
})
```

## 🔧 高级配置

### 1. 条件加载

```typescript
// uno.config.ts
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  safelist: [
    // 开发环境加载更多图标
    ...(isDev ? ICONIFY_ICONS.map(i => i.value) : []),

    // 生产环境仅加载核心图标
    ...(!isDev ? ['i-ep-home', 'i-ep-menu', 'i-ep-user'] : [])
  ]
})
```

### 2. 动态生成

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons'

// 生成图标前缀
const generateIconPrefixes = (prefix: string, count: number) => {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}`)
}

export default defineConfig({
  safelist: [
    // 常用图标集合
    ...ICONIFY_ICONS.filter(icon =>
      ['home', 'menu', 'user', 'setting'].some(keyword =>
        icon.label.includes(keyword)
      )
    ).map(icon => icon.value),

    // 动态生成的图标
    ...generateIconPrefixes('i-custom', 20)
  ]
})
```

### 3. 正则匹配

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 使用正则匹配
    /^i-ep-(home|menu|user|setting)$/,
    /^icon-(elevator|equipment).*$/,
  ]
})
```

## 📊 预设策略

### 1. 核心图标策略

仅预加载最常用的核心图标 (推荐)

```typescript
// uno.config.ts
const coreIcons = [
  // 布局导航 (5个)
  'i-ep-home',
  'i-ep-menu',
  'i-ep-expand',
  'i-ep-fold',
  'i-ep-close',

  // 用户相关 (3个)
  'i-ep-user',
  'i-ep-user-filled',
  'i-ep-avatar',

  // 基础操作 (5个)
  'i-ep-search',
  'i-ep-edit',
  'i-ep-delete',
  'i-ep-plus',
  'i-ep-refresh',

  // 状态提示 (3个)
  'i-ep-success-filled',
  'i-ep-warning-filled',
  'i-ep-error-filled',
]

export default defineConfig({
  safelist: coreIcons  // 总计 16 个核心图标
})
```

### 2. 模块化策略

按功能模块分组加载

```typescript
// config/icons/navigation.ts
export const navigationIcons = [
  'i-ep-home',
  'i-ep-menu',
  'i-ep-setting',
]

// config/icons/actions.ts
export const actionIcons = [
  'i-ep-edit',
  'i-ep-delete',
  'i-ep-view',
]

// uno.config.ts
import { navigationIcons } from './config/icons/navigation'
import { actionIcons } from './config/icons/actions'

export default defineConfig({
  safelist: [
    ...navigationIcons,
    ...actionIcons,
  ]
})
```

### 3. 按需加载策略

根据路由或功能动态加载

```typescript
// uno.config.ts
import { routes } from './src/router'

// 从路由配置提取图标
const routeIcons = routes
  .map(route => route.meta?.icon)
  .filter(Boolean) as string[]

export default defineConfig({
  safelist: [
    ...routeIcons,  // 仅加载路由使用的图标
  ]
})
```

## 🚀 性能优化

### 1. 预设数量控制

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons'

export default defineConfig({
  safelist: [
    // ❌ 不推荐: 加载所有图标 (173 个)
    // ...ICONIFY_ICONS.map(i => i.value)

    // ✅ 推荐: 仅加载前 30 个常用图标
    ...ICONIFY_ICONS.slice(0, 30).map(i => i.value)
  ]
})
```

### 2. 分包策略

```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 图标单独打包
          'icons': ['@iconify/json', '@unocss/preset-icons']
        }
      }
    }
  }
}
```

### 3. CDN 加载

```typescript
// uno.config.ts
export default defineConfig({
  presets: [
    presetIcons({
      cdn: 'https://esm.sh/',  // 使用 CDN
    }),
  ],
  safelist: [
    // CDN 模式下仅预设关键图标
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',
  ]
})
```

## 📈 预设分析

### 1. 统计预设数量

```typescript
// scripts/analyze-icons.ts
import { ICONIFY_ICONS, ICONFONT_ICONS } from '../src/types/icons'
import config from '../uno.config'

const safelist = config.safelist || []

console.log('图标预设分析:')
console.log(`- 预设数量: ${safelist.length}`)
console.log(`- Iconify 总数: ${ICONIFY_ICONS.length}`)
console.log(`- Iconfont 总数: ${ICONFONT_ICONS.length}`)
console.log(`- 预设比例: ${(safelist.length / ICONIFY_ICONS.length * 100).toFixed(2)}%`)
```

### 2. 检查未使用的预设

```typescript
// scripts/check-unused-icons.ts
import { globSync } from 'glob'
import fs from 'fs'

const safelist = ['i-ep-home', 'i-ep-menu', /* ... */]
const vueFiles = globSync('src/**/*.vue')

const usedIcons = new Set<string>()

vueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8')
  safelist.forEach(icon => {
    if (content.includes(icon)) {
      usedIcons.add(icon)
    }
  })
})

const unusedIcons = safelist.filter(icon => !usedIcons.has(icon))
console.log('未使用的预设图标:', unusedIcons)
```

## 🛠️ 最佳实践

### 1. 定期审查

```typescript
// package.json
{
  "scripts": {
    "analyze:icons": "tsx scripts/analyze-icons.ts",
    "check:unused-icons": "tsx scripts/check-unused-icons.ts"
  }
}
```

### 2. 文档化预设

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 🏠 导航图标 (5个)
    'i-ep-home',        // 首页
    'i-ep-menu',        // 菜单
    'i-ep-setting',     // 设置
    'i-ep-user',        // 用户
    'i-ep-search',      // 搜索

    // ✏️ 操作图标 (3个)
    'i-ep-edit',        // 编辑
    'i-ep-delete',      // 删除
    'i-ep-plus',        // 添加

    // ✅ 状态图标 (3个)
    'i-ep-success-filled',  // 成功
    'i-ep-warning-filled',  // 警告
    'i-ep-error-filled',    // 错误
  ]
})
```

### 3. 版本管理

```typescript
// config/icons-preset.ts
export const ICON_PRESET_VERSION = '1.0.0'

export const iconPreset = {
  version: ICON_PRESET_VERSION,
  navigation: ['i-ep-home', 'i-ep-menu'],
  actions: ['i-ep-edit', 'i-ep-delete'],
  status: ['i-ep-success-filled', 'i-ep-warning-filled'],
}

// uno.config.ts
import { iconPreset } from './config/icons-preset'

export default defineConfig({
  safelist: [
    ...iconPreset.navigation,
    ...iconPreset.actions,
    ...iconPreset.status,
  ]
})
```

## 📋 配置模板

### 小型项目 (<20 图标)

```typescript
export default defineConfig({
  safelist: [
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',
    'i-ep-setting',
    'i-ep-edit',
    'i-ep-delete',
  ]
})
```

### 中型项目 (20-50 图标)

```typescript
export default defineConfig({
  safelist: [
    // 从类型文件导入常用图标
    ...ICONIFY_ICONS.slice(0, 30).map(i => i.value)
  ]
})
```

### 大型项目 (>50 图标)

```typescript
export default defineConfig({
  presets: [
    presetIcons({
      cdn: 'https://esm.sh/',  // 使用 CDN
    }),
  ],
  safelist: [
    // 仅预设关键图标,其他按需加载
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',
  ]
})
```

## ⚠️ 注意事项

1. **性能权衡**: 预设过多会增加包体积,过少会影响加载速度
2. **构建时间**: 预设图标会增加构建时间
3. **缓存策略**: 预设图标会被缓存,更新时注意清除缓存
4. **动态图标**: 动态加载的图标不会被预设
5. **正则性能**: 正则匹配会影响构建性能,谨慎使用

## 🔗 相关文档

- [图标系统概述](./overview.md)
- [Iconify 配置](./iconify-config.md)
- [性能优化](../styles/best-practices/performance.md)

合理的图标预设管理能够显著提升应用性能和用户体验。
