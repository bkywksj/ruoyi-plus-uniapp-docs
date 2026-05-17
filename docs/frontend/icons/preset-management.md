# 图标预设管理

图标预设管理用于配置和优化 UnoCSS 图标系统的加载策略,确保常用图标快速可用,提升应用性能。本文档详细介绍图标预设的配置方法、优化策略和最佳实践。

## 🎯 预设概念

### 什么是图标预设

图标预设 (Safelist) 是 UnoCSS 配置中预先加载的图标列表。这些图标会在构建时被打包,无需运行时动态加载。预设机制是 UnoCSS 按需生成 CSS 的补充,确保动态使用的图标类名能够正确生成样式。

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    'i-ep-home',      // ✅ 预加载 - 构建时生成
    'i-ep-setting',   // ✅ 预加载 - 构建时生成
    'i-ep-user',      // ✅ 预加载 - 构建时生成
  ]
})
```

### 预设的工作原理

UnoCSS 默认只会扫描源代码中静态出现的类名来生成 CSS。当图标类名是动态生成时(如通过变量、模板字符串、后端配置),UnoCSS 无法在构建时识别这些类名。预设(Safelist)解决了这个问题,它告诉 UnoCSS 无论是否在源码中发现,都要生成这些类名对应的样式。

**静态类名 - 自动识别**:

```vue
<template>
  <!-- ✅ UnoCSS 能在构建时扫描到 -->
  <div class="i-ep-home"></div>
</template>
```

**动态类名 - 需要预设**:

```vue
<template>
  <!-- ❌ UnoCSS 无法在构建时识别 -->
  <div :class="iconClass"></div>
</template>

<script lang="ts" setup>
const iconClass = computed(() => `i-ep-${props.name}`)
</script>
```

### 预设的作用

1. **保证可用性**: 动态生成的图标类名在运行时能正确显示
2. **提升性能**: 预加载常用图标,减少运行时开销
3. **避免闪烁**: 防止图标延迟加载导致的视觉跳动
4. **优化构建**: 减少动态导入的复杂度

### 预设与按需加载的对比

| 特性 | 预设加载 | 按需加载 |
|------|---------|---------|
| 构建时机 | 构建时打包 | 运行时加载 |
| 首屏速度 | 快(已打包) | 慢(需请求) |
| 包体积 | 增加 | 最小 |
| 动态图标 | 支持 | 不支持 |
| 适用场景 | 常用图标 | 罕用图标 |

## 📋 项目实际配置

### 当前项目配置分析

本项目采用全量预设 Iconify 图标的策略:

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  // 安全列表 - 确保所有图标类名都被包含
  safelist: [
    // 添加所有预设图标的类名到安全列表
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ],

  presets: [
    // 图标预设：支持各种图标集成
    presetIcons({}),
    // ... 其他预设
  ]
})
```

**配置解析**:

1. **数据来源**: 从 `icons.d.ts` 导入 `ICONIFY_ICONS` 数组
2. **映射方式**: 使用 `icon.value` 提取 CSS 类名(如 `i-ep-home`)
3. **预设数量**: 173 个 Iconify 图标(全部预设)
4. **图标格式**: 使用 UnoCSS 标准格式 `i-{collection}-{name}`

### 图标数据结构

```typescript
// src/types/icons.d.ts 中的图标定义
interface IconifyIconItem {
  code: string   // 图标代码,如 'home'
  name: string   // 中文名称,如 '首页'
  value: string  // CSS 类名,如 'i-ep-home'
}

// 示例数据
export const ICONIFY_ICONS: IconifyIconItem[] = [
  { code: 'admin', name: '管理员', value: 'i-clarity:administrator-line' },
  { code: 'alipay', name: '支付宝支付', value: 'i-ri-alipay-fill' },
  { code: 'api', name: 'API', value: 'i-material-symbols-light:api-rounded' },
  // ... 173 个图标
]
```

### 图标集合分布

项目使用的 Iconify 图标来自多个图标集:

| 图标集 | 前缀 | 数量 | 风格 |
|--------|------|------|------|
| Element Plus | `i-ep-*` | ~50 | 线性/填充 |
| Material Symbols | `i-material-symbols-*` | ~30 | 圆角/填充 |
| Phosphor | `i-ph-*` | ~25 | 线性/填充 |
| Heroicons | `i-heroicons-*` | ~15 | 线性/填充 |
| RemixIcon | `i-ri-*` | ~20 | 线性/填充 |
| MDI | `i-mdi-*` | ~15 | 通用 |
| 其他 | 多种 | ~18 | 混合 |

## 📋 配置方式

### 1. 手动配置

适用于小型项目或需要精确控制的场景:

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

**优点**:
- 精确控制,无冗余
- 包体积最小
- 易于审计

**缺点**:
- 维护成本高
- 容易遗漏
- 动态图标需手动添加

### 2. 从类型文件导入

适用于中大型项目,利用自动生成的图标类型文件:

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  safelist: [
    // 加载所有 Iconify 图标
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ]
})
```

**优点**:
- 自动同步,无需维护
- 与类型系统统一
- 支持所有动态图标

**缺点**:
- 可能包含未使用图标
- 包体积较大

### 3. 分类配置

按功能模块组织,便于管理和维护:

```typescript
// config/icons/navigation.ts
export const navigationIcons = [
  'i-ep-home',
  'i-ep-menu',
  'i-ep-user',
  'i-ep-setting',
  'i-ep-back',
]

// config/icons/actions.ts
export const actionIcons = [
  'i-ep-edit',
  'i-ep-delete',
  'i-ep-view',
  'i-ep-plus',
  'i-ep-download',
]

// config/icons/status.ts
export const statusIcons = [
  'i-ep-success-filled',
  'i-ep-warning-filled',
  'i-ep-error-filled',
  'i-ep-info-filled',
]

// config/icons/index.ts
export * from './navigation'
export * from './actions'
export * from './status'

// uno.config.ts
import { navigationIcons, actionIcons, statusIcons } from './config/icons'

export default defineConfig({
  safelist: [
    ...navigationIcons,
    ...actionIcons,
    ...statusIcons,
  ]
})
```

**优点**:
- 结构清晰
- 便于团队协作
- 可选择性加载

### 4. 基于路由配置

从路由元信息提取图标,确保菜单图标可用:

```typescript
// router/routes.ts
const routes = [
  {
    path: '/dashboard',
    meta: { icon: 'i-ep-home', title: '首页' }
  },
  {
    path: '/user',
    meta: { icon: 'i-ep-user', title: '用户管理' },
    children: [
      {
        path: 'list',
        meta: { icon: 'i-ep-list', title: '用户列表' }
      }
    ]
  }
]

// uno.config.ts
import { routes } from './src/router/routes'

// 递归提取所有路由图标
const extractRouteIcons = (routes: RouteConfig[]): string[] => {
  const icons: string[] = []

  const traverse = (routeList: RouteConfig[]) => {
    for (const route of routeList) {
      if (route.meta?.icon) {
        icons.push(route.meta.icon)
      }
      if (route.children) {
        traverse(route.children)
      }
    }
  }

  traverse(routes)
  return [...new Set(icons)] // 去重
}

export default defineConfig({
  safelist: extractRouteIcons(routes)
})
```

### 5. 基于后端配置

适用于菜单图标由后端动态配置的场景:

```typescript
// scripts/fetch-menu-icons.ts
// 构建前获取后端菜单配置,提取图标列表

import fs from 'fs'

async function fetchMenuIcons() {
  // 从后端 API 获取菜单配置
  const response = await fetch('http://api.example.com/menu/icons')
  const icons = await response.json()

  // 生成配置文件
  const content = `export const menuIcons = ${JSON.stringify(icons, null, 2)}`
  fs.writeFileSync('./config/menu-icons.ts', content)
}

fetchMenuIcons()

// uno.config.ts
import { menuIcons } from './config/menu-icons'

export default defineConfig({
  safelist: menuIcons
})
```

```json
// package.json
{
  "scripts": {
    "prebuild": "tsx scripts/fetch-menu-icons.ts",
    "build": "vite build"
  }
}
```

## 🔧 高级配置

### 1. presetIcons 配置选项

UnoCSS 的 `presetIcons` 提供丰富的配置选项:

```typescript
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      // 图标缩放比例 (默认 1)
      scale: 1.2,

      // 警告级别: 'warn' | 'error' | false
      warn: true,

      // 图标前缀 (默认 'i-')
      prefix: 'i-',

      // 额外的 CSS 属性
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },

      // 自定义图标集合
      collections: {
        // 本地 SVG 图标集
        'custom': {
          'logo': '<svg>...</svg>',
          'loading': '<svg>...</svg>',
        },

        // 异步加载图标集
        'remote': async (name) => {
          const svg = await fetchRemoteIcon(name)
          return svg
        }
      },

      // 图标自定义器
      customizations: {
        // 统一图标属性
        iconCustomizer(collection, icon, props) {
          // 所有图标设置默认宽高
          props.width = '1em'
          props.height = '1em'
        },

        // 集合级自定义
        customize(info) {
          // 可修改 SVG 内容
          if (info.collection === 'custom') {
            return info.svg.replace('currentColor', '#333')
          }
          return info.svg
        }
      },

      // CDN 配置 (可选)
      // cdn: 'https://esm.sh/',
    }),
  ]
})
```

### 2. 条件加载

根据环境变量或构建模式加载不同图标:

```typescript
// uno.config.ts
const isDev = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// 核心图标 - 始终加载
const coreIcons = [
  'i-ep-home',
  'i-ep-menu',
  'i-ep-user',
  'i-ep-setting',
]

// 开发图标 - 仅开发环境
const devIcons = [
  'i-ep-bug-report',
  'i-ep-terminal',
  'i-ep-code',
]

// 完整图标 - 开发环境加载全部
import { ICONIFY_ICONS } from './src/types/icons.d'
const allIcons = ICONIFY_ICONS.map(i => i.value)

export default defineConfig({
  safelist: [
    ...coreIcons,
    ...(isDev ? devIcons : []),
    ...(isDev ? allIcons : []),
  ]
})
```

**环境策略对比**:

| 环境 | 加载策略 | 图标数量 | 包体积 |
|------|---------|---------|--------|
| 开发 | 全量加载 | 173+ | 较大 |
| 生产 | 核心加载 | ~20 | 最小 |
| 预发布 | 路由加载 | ~50 | 适中 |

### 3. 动态生成

使用函数动态生成图标列表:

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons.d'

// 按关键词过滤图标
const filterIconsByKeywords = (keywords: string[]): string[] => {
  return ICONIFY_ICONS
    .filter(icon =>
      keywords.some(keyword =>
        icon.code.includes(keyword) ||
        icon.name.includes(keyword)
      )
    )
    .map(icon => icon.value)
}

// 按图标集过滤
const filterIconsByCollection = (collections: string[]): string[] => {
  return ICONIFY_ICONS
    .filter(icon =>
      collections.some(col => icon.value.includes(`i-${col}-`))
    )
    .map(icon => icon.value)
}

// 生成变体图标
const generateVariants = (base: string[], variants: string[]): string[] => {
  const result: string[] = []
  for (const icon of base) {
    result.push(icon)
    for (const variant of variants) {
      result.push(`${icon}-${variant}`)
    }
  }
  return result
}

export default defineConfig({
  safelist: [
    // 导航相关图标
    ...filterIconsByKeywords(['home', 'menu', 'user', 'setting']),

    // Element Plus 图标集
    ...filterIconsByCollection(['ep']),

    // 带变体的图标
    ...generateVariants(
      ['i-ep-check', 'i-ep-close'],
      ['circle', 'filled']
    ),
  ]
})
```

### 4. 正则匹配

使用正则表达式批量匹配图标:

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 匹配 Element Plus 所有填充图标
    /^i-ep-.*-filled$/,

    // 匹配特定图标名称
    /^i-ep-(home|menu|user|setting)$/,

    // 匹配 MDI 箭头图标
    /^i-mdi-(arrow|chevron)-(up|down|left|right)$/,

    // 匹配自定义图标前缀
    /^icon-(elevator|equipment|building).*$/,
  ]
})
```

**注意事项**:
- 正则匹配会影响构建性能
- 需要配合图标集合的完整列表使用
- 建议限制正则复杂度

### 5. 动态图标模式匹配

处理运行时动态生成的图标类名:

```typescript
// uno.config.ts
// 预生成所有可能的动态组合

// 状态图标模板
const statusTypes = ['success', 'warning', 'error', 'info']
const statusVariants = ['', '-filled', '-outline']
const statusIcons = statusTypes.flatMap(type =>
  statusVariants.map(variant => `i-ep-${type}${variant}`)
)

// 方向图标模板
const directions = ['up', 'down', 'left', 'right']
const arrowIcons = directions.map(dir => `i-ep-arrow-${dir}`)
const caretIcons = directions.map(dir => `i-ep-caret-${dir}`)
const chevronIcons = directions.map(dir => `i-mdi-chevron-${dir}`)

// 尺寸变体
const sizes = ['12', '16', '20', '24', '32', '48']
const sizeClasses = sizes.map(size => `text-${size}`)

export default defineConfig({
  safelist: [
    ...statusIcons,
    ...arrowIcons,
    ...caretIcons,
    ...chevronIcons,
    ...sizeClasses,
  ]
})
```

## 📊 预设策略

### 1. 核心图标策略

仅预加载最常用的核心图标,适用于追求最小包体积的场景:

```typescript
// config/icons/core.ts
export const coreIcons = {
  // 布局导航 (7个)
  navigation: [
    'i-ep-home',        // 首页
    'i-ep-menu',        // 菜单
    'i-ep-expand',      // 展开
    'i-ep-fold',        // 折叠
    'i-ep-close',       // 关闭
    'i-ep-back',        // 返回
    'i-ep-full-screen', // 全屏
  ],

  // 用户相关 (4个)
  user: [
    'i-ep-user',        // 用户
    'i-ep-user-filled', // 用户(填充)
    'i-ep-avatar',      // 头像
    'i-ep-lock',        // 锁定
  ],

  // 基础操作 (10个)
  action: [
    'i-ep-search',      // 搜索
    'i-ep-edit',        // 编辑
    'i-ep-delete',      // 删除
    'i-ep-plus',        // 添加
    'i-ep-refresh',     // 刷新
    'i-ep-download',    // 下载
    'i-ep-upload',      // 上传
    'i-ep-view',        // 查看
    'i-ep-more',        // 更多
    'i-ep-filter',      // 筛选
  ],

  // 状态提示 (4个)
  status: [
    'i-ep-success-filled',  // 成功
    'i-ep-warning-filled',  // 警告
    'i-ep-error-filled',    // 错误
    'i-ep-info-filled',     // 信息
  ],

  // 方向箭头 (4个)
  direction: [
    'i-ep-arrow-up',    // 向上
    'i-ep-arrow-down',  // 向下
    'i-ep-arrow-left',  // 向左
    'i-ep-arrow-right', // 向右
  ]
}

// 合并所有核心图标
export const allCoreIcons = [
  ...coreIcons.navigation,
  ...coreIcons.user,
  ...coreIcons.action,
  ...coreIcons.status,
  ...coreIcons.direction,
]
// 总计: 29 个核心图标

// uno.config.ts
import { allCoreIcons } from './config/icons/core'

export default defineConfig({
  safelist: allCoreIcons
})
```

### 2. 模块化策略

按业务模块分组加载,适用于大型项目:

```typescript
// config/icons/modules/system.ts
// 系统管理模块图标
export const systemIcons = [
  'i-ep-setting',
  'i-ep-user',
  'i-ep-key',
  'i-ep-menu',
  'i-ep-tickets',
  'i-ep-operation',
]

// config/icons/modules/monitor.ts
// 监控模块图标
export const monitorIcons = [
  'i-ep-monitor',
  'i-ep-data-line',
  'i-ep-data-analysis',
  'i-ep-histogram',
  'i-ep-pie-chart',
]

// config/icons/modules/tool.ts
// 工具模块图标
export const toolIcons = [
  'i-ep-tools',
  'i-ep-code',
  'i-ep-document',
  'i-ep-folder',
  'i-ep-files',
]

// config/icons/modules/workflow.ts
// 工作流模块图标
export const workflowIcons = [
  'i-ep-connection',
  'i-ep-sort',
  'i-ep-timer',
  'i-ep-clock',
  'i-ep-finished',
]

// config/icons/modules/index.ts
import { systemIcons } from './system'
import { monitorIcons } from './monitor'
import { toolIcons } from './tool'
import { workflowIcons } from './workflow'

// 根据需要导出
export const moduleIcons = {
  system: systemIcons,
  monitor: monitorIcons,
  tool: toolIcons,
  workflow: workflowIcons,
}

// 全部导出
export const allModuleIcons = [
  ...systemIcons,
  ...monitorIcons,
  ...toolIcons,
  ...workflowIcons,
]

// uno.config.ts
import { allCoreIcons } from './config/icons/core'
import { allModuleIcons } from './config/icons/modules'

export default defineConfig({
  safelist: [
    ...allCoreIcons,
    ...allModuleIcons,
  ]
})
```

### 3. 按需加载策略

基于使用分析,只加载实际使用的图标:

```typescript
// scripts/analyze-icon-usage.ts
import { globSync } from 'glob'
import fs from 'fs'

// 扫描源码中使用的图标
function analyzeIconUsage(): string[] {
  const files = globSync('src/**/*.{vue,ts,tsx}')
  const usedIcons = new Set<string>()

  // 匹配图标类名的正则
  const iconPatterns = [
    /class="[^"]*?(i-[a-z-]+)[^"]*"/g,      // class="i-ep-home"
    /:class="[^"]*?(i-[a-z-]+)[^"]*"/g,     // :class="i-ep-home"
    /icon:\s*['"]?(i-[a-z-]+)['"]?/g,       // icon: 'i-ep-home'
    /code:\s*['"]?([a-z-]+)['"]?/g,         // code: 'home'
  ]

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    for (const pattern of iconPatterns) {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        usedIcons.add(match[1])
      }
    }
  }

  return [...usedIcons]
}

// 生成配置文件
const usedIcons = analyzeIconUsage()
const content = `// 自动生成 - 请勿手动修改
export const usedIcons = ${JSON.stringify(usedIcons, null, 2)}`

fs.writeFileSync('./config/used-icons.ts', content)
console.log(`发现 ${usedIcons.length} 个使用的图标`)
```

```json
// package.json
{
  "scripts": {
    "analyze:icons": "tsx scripts/analyze-icon-usage.ts",
    "prebuild": "npm run analyze:icons"
  }
}
```

### 4. 分层策略

按优先级分层加载:

```typescript
// config/icons/layers.ts

// 第一层: 关键图标 (必须预设)
// 这些图标在首屏或核心功能中使用
export const criticalIcons = [
  'i-ep-home',
  'i-ep-menu',
  'i-ep-user',
  'i-ep-loading',
]

// 第二层: 重要图标 (建议预设)
// 常用但非首屏图标
export const importantIcons = [
  'i-ep-edit',
  'i-ep-delete',
  'i-ep-search',
  'i-ep-refresh',
  'i-ep-setting',
]

// 第三层: 普通图标 (可选预设)
// 特定功能使用的图标
export const normalIcons = [
  'i-ep-upload',
  'i-ep-download',
  'i-ep-print',
  'i-ep-export',
]

// 第四层: 扩展图标 (按需加载)
// 罕用图标,建议 CDN 加载
export const extendedIcons = [
  // 不预设,使用 CDN
]

// uno.config.ts
import { criticalIcons, importantIcons, normalIcons } from './config/icons/layers'

const loadLevel = process.env.ICON_LOAD_LEVEL || 'normal'

const getIconsByLevel = (level: string): string[] => {
  switch (level) {
    case 'critical':
      return criticalIcons
    case 'important':
      return [...criticalIcons, ...importantIcons]
    case 'normal':
    default:
      return [...criticalIcons, ...importantIcons, ...normalIcons]
  }
}

export default defineConfig({
  safelist: getIconsByLevel(loadLevel)
})
```

## 🚀 性能优化

### 1. 预设数量控制

控制预设数量以平衡功能和性能:

```typescript
// uno.config.ts
import { ICONIFY_ICONS } from './src/types/icons.d'

// 分析构建产物大小
const ICON_CSS_SIZE_PER_ICON = 0.5 // KB

const calculateBuildSize = (count: number) => {
  return (count * ICON_CSS_SIZE_PER_ICON).toFixed(1)
}

export default defineConfig({
  safelist: [
    // ❌ 不推荐: 加载所有图标 (173 个, ~86.5KB)
    // ...ICONIFY_ICONS.map(i => i.value)

    // ⚠️ 中等: 加载前 50 个常用图标 (~25KB)
    // ...ICONIFY_ICONS.slice(0, 50).map(i => i.value)

    // ✅ 推荐: 仅加载核心图标 (~15KB)
    ...ICONIFY_ICONS.slice(0, 30).map(i => i.value)
  ]
})

// 构建时输出大小信息
console.log(`图标预设: ${30} 个`)
console.log(`预估大小: ${calculateBuildSize(30)} KB`)
```

**预设数量与包体积对照**:

| 预设数量 | 预估大小 | 适用场景 |
|---------|---------|---------|
| 10-20 | ~5-10KB | 极简项目 |
| 30-50 | ~15-25KB | 标准项目 |
| 50-100 | ~25-50KB | 大型项目 |
| 100+ | 50KB+ | 图标密集型 |

### 2. 分包策略

将图标相关代码单独打包:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 图标库单独打包
          'icons': [
            '@iconify/json',
            '@unocss/preset-icons'
          ],

          // 图标类型定义
          'icon-types': [
            './src/types/icons.d.ts'
          ],
        }
      }
    }
  }
})
```

**优化策略**:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 图标集按来源分包
          if (id.includes('@iconify-json/ep')) {
            return 'icons-element-plus'
          }
          if (id.includes('@iconify-json/mdi')) {
            return 'icons-mdi'
          }
          if (id.includes('@iconify-json')) {
            return 'icons-other'
          }
        }
      }
    }
  }
})
```

### 3. CDN 加载

使用 CDN 加载非关键图标:

```typescript
// uno.config.ts
export default defineConfig({
  presets: [
    presetIcons({
      // 使用 CDN 加载未预设的图标
      cdn: 'https://esm.sh/',

      // 或使用 jsDelivr
      // cdn: 'https://cdn.jsdelivr.net/npm/',

      // 或使用 unpkg
      // cdn: 'https://unpkg.com/',
    }),
  ],

  // 仅预设关键图标
  safelist: [
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',
  ]
})
```

**CDN 加载策略**:

```typescript
// composables/useIconCdn.ts
import { ref, onMounted } from 'vue'

export function useIconCdn() {
  const cdnLoaded = ref(false)
  const cdnError = ref<Error | null>(null)

  const preloadIcon = async (iconClass: string) => {
    try {
      // 通过 CDN 预加载图标
      const [, collection, name] = iconClass.match(/i-([^-]+)-(.+)/) || []
      if (collection && name) {
        const url = `https://api.iconify.design/${collection}/${name}.svg`
        await fetch(url, { mode: 'cors' })
      }
    } catch (error) {
      console.warn(`图标 ${iconClass} 预加载失败:`, error)
    }
  }

  // 批量预加载
  const preloadIcons = async (icons: string[]) => {
    await Promise.allSettled(icons.map(preloadIcon))
    cdnLoaded.value = true
  }

  return {
    cdnLoaded,
    cdnError,
    preloadIcon,
    preloadIcons,
  }
}
```

### 4. Tree-shaking 优化

确保未使用的图标被移除:

```typescript
// 错误: 导入整个图标集 (无法 tree-shake)
import icons from '@iconify-json/ep'

// 正确: 使用 presetIcons 自动按需加载
import { presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      // 自动按需加载,支持 tree-shaking
    })
  ]
})
```

### 5. 构建缓存

利用缓存加速构建:

```typescript
// vite.config.ts
export default defineConfig({
  // 开启构建缓存
  cacheDir: 'node_modules/.vite',

  build: {
    // 启用 esbuild 缓存
    minify: 'esbuild',
  },

  // UnoCSS 缓存配置
  plugins: [
    UnoCSS({
      // 配置文件变化时清除缓存
      configDeps: [
        './src/types/icons.d.ts'
      ]
    })
  ]
})
```

### 6. 懒加载图标

非关键图标采用懒加载:

```typescript
// composables/useLazyIcon.ts
import { ref, onMounted, defineAsyncComponent } from 'vue'

// 懒加载图标组件
export function useLazyIcon(iconName: string) {
  const IconComponent = defineAsyncComponent(() =>
    import(`@iconify/vue`).then(module => ({
      setup() {
        return () => h(module.Icon, { icon: iconName })
      }
    }))
  )

  return IconComponent
}

// 使用示例
<template>
  <Suspense>
    <component :is="LazyIcon" />
    <template #fallback>
      <div class="icon-placeholder" />
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
const LazyIcon = useLazyIcon('mdi:home')
</script>
```

## 📈 预设分析

### 1. 统计预设数量

```typescript
// scripts/analyze-icons.ts
import { ICONIFY_ICONS, ICONFONT_ICONS } from '../src/types/icons.d'
import config from '../uno.config'

interface AnalysisResult {
  safelist: {
    total: number
    iconify: number
    iconfont: number
    unknown: number
  }
  available: {
    iconify: number
    iconfont: number
    total: number
  }
  coverage: {
    iconify: string
    iconfont: string
    total: string
  }
}

function analyzeIconPresets(): AnalysisResult {
  const safelist = (config.safelist || []) as string[]

  // 统计预设分类
  let iconifyCount = 0
  let iconfontCount = 0
  let unknownCount = 0

  for (const icon of safelist) {
    if (icon.startsWith('i-')) {
      iconifyCount++
    } else if (icon.startsWith('icon-')) {
      iconfontCount++
    } else {
      unknownCount++
    }
  }

  return {
    safelist: {
      total: safelist.length,
      iconify: iconifyCount,
      iconfont: iconfontCount,
      unknown: unknownCount,
    },
    available: {
      iconify: ICONIFY_ICONS.length,
      iconfont: ICONFONT_ICONS.length,
      total: ICONIFY_ICONS.length + ICONFONT_ICONS.length,
    },
    coverage: {
      iconify: ((iconifyCount / ICONIFY_ICONS.length) * 100).toFixed(1) + '%',
      iconfont: ((iconfontCount / ICONFONT_ICONS.length) * 100).toFixed(1) + '%',
      total: ((safelist.length / (ICONIFY_ICONS.length + ICONFONT_ICONS.length)) * 100).toFixed(1) + '%',
    }
  }
}

const result = analyzeIconPresets()

console.log('\n📊 图标预设分析报告\n')
console.log('═══════════════════════════════════════')
console.log('\n📋 预设统计:')
console.log(`  总预设数量: ${result.safelist.total}`)
console.log(`  - Iconify: ${result.safelist.iconify}`)
console.log(`  - Iconfont: ${result.safelist.iconfont}`)
console.log(`  - 未知: ${result.safelist.unknown}`)

console.log('\n📦 可用图标:')
console.log(`  Iconify 总数: ${result.available.iconify}`)
console.log(`  Iconfont 总数: ${result.available.iconfont}`)
console.log(`  总计: ${result.available.total}`)

console.log('\n📈 覆盖率:')
console.log(`  Iconify 覆盖: ${result.coverage.iconify}`)
console.log(`  Iconfont 覆盖: ${result.coverage.iconfont}`)
console.log(`  总体覆盖: ${result.coverage.total}`)
console.log('\n═══════════════════════════════════════\n')
```

### 2. 检查未使用的预设

```typescript
// scripts/check-unused-icons.ts
import { globSync } from 'glob'
import fs from 'fs'
import config from '../uno.config'

interface UnusedReport {
  total: number
  used: number
  unused: number
  unusedList: string[]
  usageByFile: Map<string, string[]>
}

function checkUnusedIcons(): UnusedReport {
  const safelist = (config.safelist || []) as string[]
  const vueFiles = globSync('src/**/*.vue')
  const tsFiles = globSync('src/**/*.{ts,tsx}')
  const allFiles = [...vueFiles, ...tsFiles]

  const usedIcons = new Set<string>()
  const usageByFile = new Map<string, string[]>()

  // 扫描所有源文件
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const fileIcons: string[] = []

    for (const icon of safelist) {
      if (content.includes(icon)) {
        usedIcons.add(icon)
        fileIcons.push(icon)
      }
    }

    if (fileIcons.length > 0) {
      usageByFile.set(file, fileIcons)
    }
  }

  const unusedList = safelist.filter(icon => !usedIcons.has(icon))

  return {
    total: safelist.length,
    used: usedIcons.size,
    unused: unusedList.length,
    unusedList,
    usageByFile,
  }
}

const report = checkUnusedIcons()

console.log('\n🔍 未使用图标检查报告\n')
console.log('═══════════════════════════════════════')
console.log(`\n📊 使用统计:`)
console.log(`  预设总数: ${report.total}`)
console.log(`  已使用: ${report.used}`)
console.log(`  未使用: ${report.unused}`)
console.log(`  使用率: ${((report.used / report.total) * 100).toFixed(1)}%`)

if (report.unusedList.length > 0) {
  console.log('\n⚠️ 未使用的图标:')
  for (const icon of report.unusedList.slice(0, 20)) {
    console.log(`  - ${icon}`)
  }
  if (report.unusedList.length > 20) {
    console.log(`  ... 还有 ${report.unusedList.length - 20} 个`)
  }
}

console.log('\n═══════════════════════════════════════\n')

// 导出未使用列表供清理
fs.writeFileSync(
  './reports/unused-icons.json',
  JSON.stringify(report.unusedList, null, 2)
)
```

### 3. 使用频率分析

```typescript
// scripts/analyze-icon-frequency.ts
import { globSync } from 'glob'
import fs from 'fs'

interface FrequencyReport {
  icon: string
  count: number
  files: string[]
}

function analyzeIconFrequency(): FrequencyReport[] {
  const files = globSync('src/**/*.{vue,ts,tsx}')
  const frequency = new Map<string, { count: number; files: Set<string> }>()

  // Iconify 图标正则
  const iconPattern = /i-[a-z]+-[a-z-]+/g

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const matches = content.match(iconPattern) || []

    for (const icon of matches) {
      if (!frequency.has(icon)) {
        frequency.set(icon, { count: 0, files: new Set() })
      }
      const data = frequency.get(icon)!
      data.count++
      data.files.add(file)
    }
  }

  // 转换并排序
  const result: FrequencyReport[] = []
  for (const [icon, data] of frequency) {
    result.push({
      icon,
      count: data.count,
      files: [...data.files]
    })
  }

  return result.sort((a, b) => b.count - a.count)
}

const report = analyzeIconFrequency()

console.log('\n📈 图标使用频率排行\n')
console.log('═══════════════════════════════════════')
console.log('\n🏆 Top 20 高频图标:')
console.log('排名 | 图标 | 使用次数 | 文件数')
console.log('-----|------|---------|-------')

for (let i = 0; i < Math.min(20, report.length); i++) {
  const { icon, count, files } = report[i]
  console.log(`${(i + 1).toString().padStart(3)} | ${icon.padEnd(30)} | ${count.toString().padStart(5)} | ${files.length}`)
}

console.log('\n📊 统计摘要:')
console.log(`  不同图标数: ${report.length}`)
console.log(`  总使用次数: ${report.reduce((sum, r) => sum + r.count, 0)}`)
console.log(`  平均使用次数: ${(report.reduce((sum, r) => sum + r.count, 0) / report.length).toFixed(1)}`)

// 导出完整报告
fs.writeFileSync(
  './reports/icon-frequency.json',
  JSON.stringify(report, null, 2)
)
```

### 4. 构建产物分析

```typescript
// scripts/analyze-build-icons.ts
import fs from 'fs'
import { gzipSync } from 'zlib'

interface BuildAnalysis {
  cssSize: number
  gzipSize: number
  iconCount: number
  avgSizePerIcon: number
}

function analyzeBuildIcons(): BuildAnalysis {
  // 读取构建后的 CSS
  const cssFile = 'dist/assets/index.css'
  const cssContent = fs.readFileSync(cssFile, 'utf-8')

  // 提取图标相关 CSS
  const iconCssPattern = /\[class\*="i-[^"]+"\][^}]+\}/g
  const iconMatches = cssContent.match(iconCssPattern) || []
  const iconCss = iconMatches.join('\n')

  // 计算大小
  const cssSize = Buffer.byteLength(iconCss, 'utf-8')
  const gzipSize = gzipSync(iconCss).length
  const iconCount = iconMatches.length

  return {
    cssSize,
    gzipSize,
    iconCount,
    avgSizePerIcon: cssSize / iconCount
  }
}

const analysis = analyzeBuildIcons()

console.log('\n📦 构建产物分析\n')
console.log('═══════════════════════════════════════')
console.log(`\n图标 CSS 大小: ${(analysis.cssSize / 1024).toFixed(2)} KB`)
console.log(`Gzip 压缩后: ${(analysis.gzipSize / 1024).toFixed(2)} KB`)
console.log(`图标数量: ${analysis.iconCount}`)
console.log(`平均每图标: ${analysis.avgSizePerIcon.toFixed(0)} bytes`)
console.log('\n═══════════════════════════════════════\n')
```

## 🛠️ 最佳实践

### 1. 定期审查

```json
// package.json
{
  "scripts": {
    "icons:analyze": "tsx scripts/analyze-icons.ts",
    "icons:unused": "tsx scripts/check-unused-icons.ts",
    "icons:frequency": "tsx scripts/analyze-icon-frequency.ts",
    "icons:build": "tsx scripts/analyze-build-icons.ts",
    "icons:all": "npm run icons:analyze && npm run icons:unused && npm run icons:frequency"
  }
}
```

**审查频率建议**:

| 项目阶段 | 审查频率 | 重点内容 |
|---------|---------|---------|
| 开发初期 | 每周 | 添加必要图标 |
| 功能迭代 | 每次发版 | 清理未使用 |
| 性能优化 | 每月 | 分析包体积 |
| 重大升级 | 按需 | 全面审计 |

### 2. 文档化预设

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    /**
     * 🏠 导航图标 (5个)
     * 用于侧边栏菜单和面包屑导航
     */
    'i-ep-home',        // 首页
    'i-ep-menu',        // 菜单
    'i-ep-setting',     // 设置
    'i-ep-user',        // 用户
    'i-ep-search',      // 搜索

    /**
     * ✏️ 操作图标 (5个)
     * 用于表格操作栏和按钮
     */
    'i-ep-edit',        // 编辑
    'i-ep-delete',      // 删除
    'i-ep-plus',        // 添加
    'i-ep-view',        // 查看
    'i-ep-download',    // 下载

    /**
     * ✅ 状态图标 (4个)
     * 用于消息提示和状态标签
     */
    'i-ep-success-filled',  // 成功
    'i-ep-warning-filled',  // 警告
    'i-ep-error-filled',    // 错误
    'i-ep-info-filled',     // 信息
  ]
})
```

### 3. 版本管理

```typescript
// config/icon-preset.ts

/**
 * 图标预设配置
 * @version 2.0.0
 * @updated 2024-01-15
 */
export const ICON_PRESET_VERSION = '2.0.0'

/**
 * 预设变更日志
 */
export const CHANGELOG = `
## v2.0.0 (2024-01-15)
- 新增: 工作流图标组
- 移除: 废弃的旧版图标
- 优化: 合并重复图标

## v1.0.0 (2024-01-01)
- 初始版本
`

export interface IconPresetConfig {
  version: string
  updatedAt: string
  groups: Record<string, string[]>
}

export const iconPreset: IconPresetConfig = {
  version: ICON_PRESET_VERSION,
  updatedAt: '2024-01-15',
  groups: {
    navigation: ['i-ep-home', 'i-ep-menu'],
    action: ['i-ep-edit', 'i-ep-delete'],
    status: ['i-ep-success-filled', 'i-ep-warning-filled'],
    workflow: ['i-ep-connection', 'i-ep-timer'],
  }
}

// 合并所有图标
export const allPresetIcons = Object.values(iconPreset.groups).flat()

// uno.config.ts
import { iconPreset, allPresetIcons, ICON_PRESET_VERSION } from './config/icon-preset'

console.log(`📌 图标预设版本: ${ICON_PRESET_VERSION}`)

export default defineConfig({
  safelist: allPresetIcons
})
```

### 4. 自动化清理

```typescript
// scripts/cleanup-unused-icons.ts
import fs from 'fs'
import path from 'path'

interface CleanupOptions {
  dryRun?: boolean
  backup?: boolean
}

async function cleanupUnusedIcons(options: CleanupOptions = {}) {
  const { dryRun = true, backup = true } = options

  // 读取未使用图标列表
  const unusedFile = './reports/unused-icons.json'
  if (!fs.existsSync(unusedFile)) {
    console.log('请先运行 npm run icons:unused 生成报告')
    return
  }

  const unusedIcons: string[] = JSON.parse(fs.readFileSync(unusedFile, 'utf-8'))

  console.log(`\n🧹 准备清理 ${unusedIcons.length} 个未使用图标\n`)

  // 读取当前配置
  const configPath = './config/icon-preset.ts'
  let configContent = fs.readFileSync(configPath, 'utf-8')

  if (backup) {
    // 创建备份
    const backupPath = `./config/icon-preset.backup.${Date.now()}.ts`
    fs.writeFileSync(backupPath, configContent)
    console.log(`✅ 已创建备份: ${backupPath}`)
  }

  // 移除未使用图标
  let removedCount = 0
  for (const icon of unusedIcons) {
    const pattern = new RegExp(`\\s*'${icon}',?\\s*(//[^\\n]*)?\\n?`, 'g')
    if (pattern.test(configContent)) {
      if (!dryRun) {
        configContent = configContent.replace(pattern, '\n')
      }
      removedCount++
      console.log(`${dryRun ? '将移除' : '已移除'}: ${icon}`)
    }
  }

  if (!dryRun) {
    fs.writeFileSync(configPath, configContent)
  }

  console.log(`\n${dryRun ? '模拟' : '实际'}移除: ${removedCount} 个图标`)

  if (dryRun) {
    console.log('\n💡 添加 --no-dry-run 参数执行实际清理')
  }
}

// 执行
const isDryRun = !process.argv.includes('--no-dry-run')
cleanupUnusedIcons({ dryRun: isDryRun, backup: true })
```

```json
// package.json
{
  "scripts": {
    "icons:cleanup": "tsx scripts/cleanup-unused-icons.ts",
    "icons:cleanup:run": "tsx scripts/cleanup-unused-icons.ts --no-dry-run"
  }
}
```

### 5. CI/CD 集成

```yaml
# .github/workflows/icons-check.yml
name: Icons Check

on:
  pull_request:
    paths:
      - 'src/**/*.vue'
      - 'src/**/*.ts'
      - 'uno.config.ts'
      - 'src/types/icons.d.ts'

jobs:
  check-icons:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - name: Analyze Icons
        run: pnpm icons:analyze

      - name: Check Unused Icons
        run: |
          pnpm icons:unused
          UNUSED_COUNT=$(cat reports/unused-icons.json | jq length)
          if [ "$UNUSED_COUNT" -gt 10 ]; then
            echo "::warning::发现 $UNUSED_COUNT 个未使用图标,请考虑清理"
          fi

      - name: Upload Reports
        uses: actions/upload-artifact@v4
        with:
          name: icon-reports
          path: reports/
```

## 📋 配置模板

### 小型项目 (<20 图标)

```typescript
// uno.config.ts - 小型项目配置
export default defineConfig({
  safelist: [
    // 核心导航 (4个)
    'i-ep-home',
    'i-ep-menu',
    'i-ep-user',
    'i-ep-setting',

    // 基础操作 (4个)
    'i-ep-edit',
    'i-ep-delete',
    'i-ep-plus',
    'i-ep-search',

    // 状态图标 (3个)
    'i-ep-success-filled',
    'i-ep-warning-filled',
    'i-ep-error-filled',
  ]
  // 总计: 11 个图标, ~5.5KB
})
```

### 中型项目 (20-50 图标)

```typescript
// uno.config.ts - 中型项目配置
import { allCoreIcons } from './config/icons/core'
import { moduleIcons } from './config/icons/modules'

export default defineConfig({
  safelist: [
    // 核心图标 (~30个)
    ...allCoreIcons,

    // 系统模块图标 (~20个)
    ...moduleIcons.system,
    ...moduleIcons.monitor,
  ]
  // 总计: ~50 个图标, ~25KB
})
```

### 大型项目 (>50 图标)

```typescript
// uno.config.ts - 大型项目配置
import { ICONIFY_ICONS } from './src/types/icons.d'
import { allCoreIcons } from './config/icons/core'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  presets: [
    presetIcons({
      // 非预设图标使用 CDN 加载
      cdn: 'https://esm.sh/',
    }),
  ],

  safelist: [
    // 始终预设: 核心图标
    ...allCoreIcons,

    // 开发环境: 全量预设方便调试
    ...(isDev ? ICONIFY_ICONS.map(i => i.value) : []),
  ]
  // 生产: ~30 个图标, ~15KB
  // 开发: ~173 个图标, ~86.5KB
})
```

### 微前端项目

```typescript
// uno.config.ts - 微前端主应用配置
export default defineConfig({
  safelist: [
    // 主应用仅预设框架级图标
    'i-ep-home',
    'i-ep-menu',
    'i-ep-setting',
    // 子应用各自管理图标预设
  ]
})

// 子应用 uno.config.ts
export default defineConfig({
  safelist: [
    // 子应用特定图标
    ...subAppIcons
  ]
})
```

### Monorepo 项目

```typescript
// packages/shared/icons/preset.ts
// 共享图标预设

export const sharedIcons = [
  // 所有应用共享的图标
  'i-ep-home',
  'i-ep-user',
  'i-ep-setting',
]

// packages/admin/uno.config.ts
import { sharedIcons } from '@shared/icons/preset'
import { adminIcons } from './icons'

export default defineConfig({
  safelist: [...sharedIcons, ...adminIcons]
})

// packages/portal/uno.config.ts
import { sharedIcons } from '@shared/icons/preset'
import { portalIcons } from './icons'

export default defineConfig({
  safelist: [...sharedIcons, ...portalIcons]
})
```

## ❓ 常见问题

### 1. 动态图标不显示

**问题描述**: 通过变量动态设置的图标类名没有样式

```vue
<template>
  <!-- 图标不显示 -->
  <div :class="iconClass"></div>
</template>

<script lang="ts" setup>
const iconClass = ref('i-ep-home')
</script>
```

**原因分析**:
- UnoCSS 在构建时扫描源码生成 CSS
- 动态拼接的类名无法被静态分析识别
- 未在 safelist 中预设的图标没有对应样式

**解决方案**:

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 预设所有可能的动态图标
    'i-ep-home',
    'i-ep-edit',
    'i-ep-delete',
  ]
})
```

或使用正则匹配:

```typescript
safelist: [
  /^i-ep-/  // 预设所有 Element Plus 图标
]
```

### 2. 构建后图标丢失

**问题描述**: 开发环境正常,生产环境图标不显示

**原因分析**:
- 开发环境可能启用了所有图标预设
- 生产环境使用了最小化预设
- 某些图标未被包含

**解决方案**:

```typescript
// uno.config.ts
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  safelist: [
    ...coreIcons, // 核心图标始终预设

    // 如果生产环境图标丢失,检查是否需要添加
    ...(isDev ? allIcons : productionIcons),
  ]
})
```

**调试方法**:

```typescript
// 构建时输出预设列表
console.log('预设图标:', config.safelist)
console.log('预设数量:', config.safelist.length)
```

### 3. 预设过多导致包体积大

**问题描述**: 预设了太多图标,CSS 文件过大

**优化方案**:

1. **分析使用情况**:
```bash
npm run icons:unused
npm run icons:frequency
```

2. **按需精简**:
```typescript
// 只保留高频使用的图标
safelist: highFrequencyIcons
```

3. **使用 CDN**:
```typescript
presets: [
  presetIcons({
    cdn: 'https://esm.sh/'
  })
]
```

4. **分层预设**:
```typescript
safelist: [
  ...criticalIcons,  // 首屏必须
  // 其他按需加载
]
```

### 4. 预设不生效

**问题描述**: 添加到 safelist 的图标仍然没有样式

**排查步骤**:

1. **检查类名格式**:
```typescript
// ✅ 正确格式
'i-ep-home'
'i-mdi-home'

// ❌ 错误格式
'ep-home'     // 缺少前缀
'i-ep:home'   // 分隔符错误
'I-EP-HOME'   // 大写错误
```

2. **检查图标集是否安装**:
```bash
pnpm list @iconify-json/ep
pnpm list @iconify-json/mdi
```

3. **检查 presetIcons 配置**:
```typescript
presets: [
  presetIcons({
    // 确保已启用
  })
]
```

4. **清除缓存重新构建**:
```bash
rm -rf node_modules/.vite
pnpm build
```

### 5. 正则预设性能问题

**问题描述**: 使用正则匹配导致构建变慢

**原因分析**:
- 正则需要遍历所有可能的图标名
- 复杂正则增加匹配开销
- 大量正则规则叠加

**优化方案**:

```typescript
// ❌ 避免复杂正则
safelist: [
  /^i-ep-.*/,           // 太宽泛
  /^i-(ep|mdi|ph)-.*/,  // 多选分支
]

// ✅ 使用显式列表
safelist: [
  ...ICONIFY_ICONS.filter(i =>
    i.value.startsWith('i-ep-')
  ).map(i => i.value)
]
```

### 6. 图标闪烁问题

**问题描述**: 页面加载时图标先显示为空白然后才出现

**原因分析**:
- 图标未预设,运行时从 CDN 加载
- 网络延迟导致加载慢
- CSS 优先级问题

**解决方案**:

1. **预设关键图标**:
```typescript
safelist: [
  // 首屏必须的图标
  'i-ep-home',
  'i-ep-menu',
]
```

2. **添加占位样式**:
```css
[class*="i-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
}
```

3. **预加载 CDN 资源**:
```html
<link rel="preconnect" href="https://esm.sh" />
```

## 🔧 调试技巧

### 1. 查看生成的 CSS

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    UnoCSS({
      // 输出生成的 CSS 到控制台
      inspector: true
    })
  ]
})
```

### 2. 验证预设是否生效

```typescript
// 在组件中验证
onMounted(() => {
  const testIcon = 'i-ep-home'
  const style = getComputedStyle(document.querySelector(`.${testIcon}`)!)
  console.log('图标样式:', {
    width: style.width,
    height: style.height,
    mask: style.mask,
  })
})
```

### 3. 构建时输出预设信息

```typescript
// uno.config.ts
const safelist = [...coreIcons, ...moduleIcons]

console.log('📌 UnoCSS 预设信息:')
console.log(`  - 预设数量: ${safelist.length}`)
console.log(`  - 预估大小: ${(safelist.length * 0.5).toFixed(1)}KB`)

export default defineConfig({ safelist })
```

## ⚠️ 注意事项

1. **性能权衡**: 预设过多会增加包体积,过少会影响加载速度,需要根据项目实际情况平衡

2. **构建时间**: 预设图标会增加构建时间,大量预设可能导致开发体验下降

3. **缓存策略**: 预设图标会被打包到 CSS 中,更新时注意清除浏览器缓存

4. **动态图标**: 动态生成的图标类名必须预设,否则运行时没有样式

5. **正则性能**: 正则匹配会遍历所有可能组合,复杂正则会显著影响构建性能

6. **类型同步**: 图标预设应与 `icons.d.ts` 类型定义保持同步

7. **团队协作**: 预设变更应通知团队,避免图标突然失效

8. **版本控制**: 重要的预设变更应记录在变更日志中

合理的图标预设管理能够显著提升应用性能和用户体验。建议定期审查预设列表,移除未使用的图标,确保最佳的性能表现。
