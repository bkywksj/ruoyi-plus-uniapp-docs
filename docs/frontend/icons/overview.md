# 图标系统概述

项目采用双图标系统架构，结合 Iconify 和 Iconfont 两种图标方案，提供丰富的图标资源和灵活的使用方式。

## 🎯 系统架构

### 图标资源统计

```
总计: 817 个图标
├── Iconfont: 644 个 (自定义图标)
└── Iconify:  173 个 (第三方图标集)
```

### 技术栈

- **UnoCSS + Iconify**: 按需加载的 SVG 图标系统
- **Iconfont**: 自定义字体图标库
- **TypeScript**: 完整的类型支持和智能提示
- **Vite Plugin**: 自动生成图标类型定义

## 📁 目录结构

```
plus-ui/
├── src/
│   ├── assets/
│   │   └── icons/
│   │       └── system/
│   │           ├── iconfont.css          # Iconfont 样式
│   │           ├── iconfont.json         # Iconfont 图标定义
│   │           └── iconify.json          # Iconify 图标定义
│   └── types/
│       └── icons.d.ts                    # 自动生成的类型文件
├── vite/
│   └── plugins/
│       └── iconfont-types.ts             # 图标类型生成插件
└── uno.config.ts                         # UnoCSS 图标配置
```

## 🔧 工作原理

### 1. 图标扫描与类型生成

```typescript
// vite/plugins/iconfont-types.ts
export default function iconfontTypesPlugin(): Plugin {
  return {
    name: 'iconfont-types',
    buildStart() {
      // 扫描 JSON 文件
      const iconfontData = JSON.parse(fs.readFileSync('iconfont.json'))
      const iconifyData = JSON.parse(fs.readFileSync('iconify.json'))

      // 生成 TypeScript 类型
      generateIconTypes(iconfontData, iconifyData)
    }
  }
}
```

### 2. UnoCSS 集成

```typescript
// uno.config.ts
export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
      }
    })
  ],
  safelist: [
    ...ICONIFY_ICONS.map((icon) => icon.value)  // 预加载所有图标
  ]
})
```

### 3. 运行时使用

```vue
<template>
  <!-- Iconify 图标 -->
  <i class="i-ep-home" />

  <!-- Iconfont 图标 -->
  <i class="icon-elevator3" />
</template>
```

## 📊 双图标系统对比

| 特性 | Iconfont | Iconify |
|------|----------|---------|
| **图标数量** | 644 个 | 173 个 |
| **加载方式** | 字体文件 | SVG (按需) |
| **文件大小** | 较大 (包含所有图标) | 较小 (仅加载使用的) |
| **自定义** | 完全自定义 | 第三方图标集 |
| **颜色控制** | CSS color 属性 | currentColor |
| **性能** | 一次加载 | 按需加载 |
| **适用场景** | 项目专属图标 | 通用图标 |

## 🎨 使用场景

### Iconfont - 适用场景

```vue
<!-- 业务专属图标 -->
<i class="icon-elevator3" />        <!-- 电梯图标 -->
<i class="icon-custom-logo" />      <!-- 自定义 Logo -->
<i class="icon-business-feature" /> <!-- 业务功能图标 -->
```

**优势**:
- 项目定制设计
- 样式统一
- 品牌识别度高

### Iconify - 适用场景

```vue
<!-- 通用 UI 图标 -->
<i class="i-ep-home" />      <!-- 首页 -->
<i class="i-ep-setting" />   <!-- 设置 -->
<i class="i-ep-user" />      <!-- 用户 -->
```

**优势**:
- 图标资源丰富
- 社区维护
- 按需加载

## 🔄 自动化流程

### 1. 添加新图标

```json
// src/assets/icons/system/iconfont.json
{
  "glyphs": [
    {
      "icon_id": "12345",
      "name": "new-icon",
      "font_class": "new-icon",
      "unicode": "e001"
    }
  ]
}
```

### 2. 自动生成类型

```typescript
// 自动更新 src/types/icons.d.ts
export type IconCode =
  | 'icon-elevator3'
  | 'icon-new-icon'  // ✅ 新增
  | /* ... */

export const ICONFONT_ICONS: IconItem[] = [
  { label: '电梯', value: 'icon-elevator3' },
  { label: '新图标', value: 'icon-new-icon' },  // ✅ 新增
]
```

### 3. 智能提示

```vue
<script setup lang="ts">
import type { IconCode } from '@/types/icons'

// ✅ 完整的类型提示
const icon: IconCode = 'icon-new-icon'
</script>
```

## 🛠️ 核心功能

### 1. 类型安全

```typescript
// 编译时检查
const validIcon: IconCode = 'icon-elevator3'     // ✅
const invalidIcon: IconCode = 'icon-not-exist'   // ❌ 类型错误
```

### 2. 图标搜索

```typescript
import { searchIcons } from '@/types/icons'

// 搜索包含 "电梯" 的图标
const results = searchIcons('电梯')
// [{ label: '电梯', value: 'icon-elevator3' }]
```

### 3. 验证工具

```typescript
import { isValidIconCode } from '@/types/icons'

isValidIconCode('icon-elevator3')  // true
isValidIconCode('invalid-icon')    // false
```

## 📈 性能优化

### 1. Iconify 按需加载

```typescript
// 仅加载使用的图标
<i class="i-ep-home" />  // 仅加载 home 图标的 SVG
```

### 2. Iconfont 字体优化

```css
/* 字体预加载 */
@font-face {
  font-family: 'iconfont';
  src: url('./iconfont.woff2') format('woff2');
  font-display: swap;  /* 优化加载体验 */
}
```

### 3. 图标预设

```typescript
// uno.config.ts - 预加载关键图标
safelist: [
  'i-ep-home',
  'i-ep-setting',
  'i-ep-user',
  // ... 其他常用图标
]
```

## 🎯 最佳实践

1. **优先使用 Iconify**: 通用 UI 图标优先选择 Iconify
2. **类型安全**: 使用 TypeScript 类型确保图标代码正确
3. **按需加载**: 避免一次性加载所有图标
4. **语义化命名**: 图标名称应清晰表达含义
5. **定期维护**: 清理未使用的图标，保持代码库整洁

## 🔗 相关文档

- [Iconify 配置](./iconify-config.md) - Iconify 图标系统配置
- [Iconfont 配置](./iconfont-config.md) - Iconfont 字体图标配置
- [图标类型生成](./type-generation.md) - 自动类型生成机制
- [图标组件使用](./component-usage.md) - 组件中使用图标
- [图标预设管理](./preset-management.md) - 图标预设配置
- [图标最佳实践](./best-practices.md) - 使用建议和优化技巧

掌握图标系统能够高效管理和使用项目中的所有图标资源。
