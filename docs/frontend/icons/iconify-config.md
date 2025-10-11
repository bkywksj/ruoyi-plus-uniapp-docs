# Iconify 配置

Iconify 是一个强大的图标框架,提供超过 150,000 个开源图标。项目通过 UnoCSS 集成 Iconify,实现按需加载的 SVG 图标系统。

## 🔧 配置文件

### UnoCSS 配置

```typescript
// uno.config.ts
import { defineConfig, presetIcons, presetUno } from 'unocss'
import { ICONIFY_ICONS } from './src/types/icons'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        // Element Plus 图标集
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  safelist: [
    // 预加载所有 Iconify 图标
    ...ICONIFY_ICONS.map((icon) => icon.value),
  ],
})
```

## 📦 安装依赖

### 1. 核心依赖

```bash
# UnoCSS 图标预设
pnpm add -D @unocss/preset-icons

# Iconify 核心
pnpm add -D @iconify/json
```

### 2. 图标集

```bash
# Element Plus 图标集
pnpm add -D @iconify-json/ep

# 其他可选图标集
pnpm add -D @iconify-json/mdi        # Material Design Icons
pnpm add -D @iconify-json/carbon     # Carbon Icons
pnpm add -D @iconify-json/heroicons  # Heroicons
```

## 🎨 图标集配置

### 1. 配置图标集

```typescript
// uno.config.ts
presetIcons({
  collections: {
    // Element Plus (ep)
    ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),

    // Material Design Icons (mdi)
    mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),

    // Carbon Icons (carbon)
    carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
  },
})
```

### 2. 图标命名规则

```
i-{collection}-{icon}

示例:
- i-ep-home          // Element Plus home 图标
- i-mdi-account      // Material Design account 图标
- i-carbon-user      // Carbon user 图标
```

## 📊 图标定义文件

### iconify.json 结构

```json
// src/assets/icons/system/iconify.json
{
  "icons": [
    {
      "name": "首页",
      "iconifyIcon": "ep:home"
    },
    {
      "name": "设置",
      "iconifyIcon": "ep:setting"
    },
    {
      "name": "用户",
      "iconifyIcon": "ep:user"
    }
  ]
}
```

### 自动转换为类型

```typescript
// 自动生成 (src/types/icons.d.ts)
export interface IconifyIconItem {
  label: string
  value: string  // 转换为 i-ep-home 格式
}

export const ICONIFY_ICONS: IconifyIconItem[] = [
  { label: '首页', value: 'i-ep-home' },
  { label: '设置', value: 'i-ep-setting' },
  { label: '用户', value: 'i-ep-user' },
]
```

## 🎯 使用方式

### 1. 基础用法

```vue
<template>
  <!-- 直接使用类名 -->
  <i class="i-ep-home" />
  <i class="i-ep-setting" />
  <i class="i-ep-user" />
</template>
```

### 2. 动态图标

```vue
<template>
  <i :class="iconClass" />
</template>

<script setup lang="ts">
import type { IconCode } from '@/types/icons'

const iconName = ref<IconCode>('i-ep-home')
const iconClass = computed(() => iconName.value)
</script>
```

### 3. 样式定制

```vue
<template>
  <!-- 调整大小 -->
  <i class="i-ep-home text-20px" />
  <i class="i-ep-home text-2xl" />

  <!-- 调整颜色 -->
  <i class="i-ep-home text-blue-500" />
  <i class="i-ep-home" style="color: #409eff" />

  <!-- 组合使用 -->
  <i class="i-ep-home text-24px text-primary hover:text-primary-light" />
</template>
```

## ⚙️ 高级配置

### 1. 自定义属性

```typescript
// uno.config.ts
presetIcons({
  extraProperties: {
    'display': 'inline-block',
    'vertical-align': 'middle',
    'width': '1em',
    'height': '1em',
  },
})
```

### 2. 图标缩放模式

```typescript
presetIcons({
  scale: 1.2,  // 全局缩放 1.2 倍
  unit: 'em',  // 单位: em | px | rem
})
```

### 3. CDN 配置

```typescript
presetIcons({
  cdn: 'https://esm.sh/',  // 使用 CDN 加载图标
})
```

## 🚀 性能优化

### 1. 按需加载

```typescript
// ✅ 仅加载使用的图标
<i class="i-ep-home" />    // 仅加载 home 图标的 SVG

// ❌ 避免加载整个图标集
import * as icons from '@iconify-json/ep'
```

### 2. 预加载策略

```typescript
// uno.config.ts
safelist: [
  // 预加载常用图标
  'i-ep-home',
  'i-ep-setting',
  'i-ep-user',
  'i-ep-search',

  // 或从类型文件批量加载
  ...ICONIFY_ICONS.slice(0, 50).map(icon => icon.value),
]
```

### 3. 构建优化

```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        // 图标单独打包
        manualChunks: {
          'iconify': ['@iconify/json'],
        }
      }
    }
  }
}
```

## 🔍 图标查找

### 1. 在线搜索

访问 [Icônes](https://icones.js.org/) 或 [Iconify](https://icon-sets.iconify.design/) 搜索图标。

### 2. 本地搜索

```typescript
import { ICONIFY_ICONS } from '@/types/icons'

// 搜索图标
const searchIcon = (keyword: string) => {
  return ICONIFY_ICONS.filter(icon =>
    icon.label.includes(keyword)
  )
}

searchIcon('设置')  // [{ label: '设置', value: 'i-ep-setting' }]
```

### 3. 类型提示

```typescript
import type { IconCode } from '@/types/icons'

// ✅ 完整的智能提示
const icon: IconCode = 'i-ep-'  // 自动提示所有可用图标
```

## 📋 支持的图标集

| 图标集 | 包名 | 图标数 | 说明 |
|--------|------|--------|------|
| Element Plus | @iconify-json/ep | 293 | Element Plus 官方图标 |
| Material Design | @iconify-json/mdi | 7000+ | Material Design 图标 |
| Carbon | @iconify-json/carbon | 2000+ | IBM Carbon 图标 |
| Heroicons | @iconify-json/heroicons | 460 | Tailwind 团队出品 |
| Ant Design | @iconify-json/ant-design | 789 | Ant Design 图标 |

## 🛠️ 添加新图标

### 1. 更新 JSON 文件

```json
// src/assets/icons/system/iconify.json
{
  "icons": [
    {
      "name": "新功能",
      "iconifyIcon": "ep:plus"  // 添加新图标
    }
  ]
}
```

### 2. 自动生成类型

```bash
# 运行开发服务器,自动生成类型
pnpm dev
```

### 3. 使用新图标

```vue
<template>
  <i class="i-ep-plus" />  <!-- ✅ 自动提示 -->
</template>
```

## ⚠️ 注意事项

1. **图标集版本**: 确保 `@iconify-json/ep` 版本与 Element Plus 版本匹配
2. **命名冲突**: 避免自定义类名与 Iconify 图标类名冲突
3. **按需加载**: 不要一次性导入整个图标集
4. **类型安全**: 使用 TypeScript 类型确保图标代码正确

## 🔗 相关资源

- [Iconify 官网](https://iconify.design/)
- [UnoCSS Icons 预设](https://unocss.dev/presets/icons)
- [图标在线搜索](https://icones.js.org/)
- [Element Plus 图标](https://element-plus.org/zh-CN/component/icon.html)

Iconify 提供了灵活、高效的图标解决方案,是现代 Web 应用的理想选择。
