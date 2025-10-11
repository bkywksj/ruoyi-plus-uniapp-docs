# Iconfont 配置

Iconfont 是项目的自定义字体图标系统,包含 644 个业务专属图标,通过字体文件的方式提供图标支持。

## 📦 资源文件

### 文件结构

```
src/assets/icons/system/
├── iconfont.css         # 字体样式定义
├── iconfont.json        # 图标元数据
├── iconfont.woff2       # 字体文件 (推荐)
├── iconfont.woff        # 字体文件
└── iconfont.ttf         # 字体文件
```

## 🎨 CSS 配置

### 字体定义

```css
/* src/assets/icons/system/iconfont.css */
@font-face {
  font-family: "iconfont";
  src: url('./iconfont.woff2?t=1731301296631') format('woff2'),
       url('./iconfont.woff?t=1731301296631') format('woff'),
       url('./iconfont.ttf?t=1731301296631') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;  /* 优化字体加载 */
}

/* 基础类 */
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 图标类定义

```css
/* 每个图标对应一个类 */
.icon-elevator3:before {
  content: "\e665";
}

.icon-equipment-setting2:before {
  content: "\e666";
}

.icon-equipment:before {
  content: "\e667";
}

/* ... 644 个图标类 */
```

## 📊 JSON 元数据

### iconfont.json 结构

```json
{
  "id": "12345",
  "name": "project-icons",
  "font_family": "iconfont",
  "css_prefix_text": "icon-",
  "description": "项目自定义图标库",
  "glyphs": [
    {
      "icon_id": "1001",
      "name": "elevator3",
      "font_class": "elevator3",
      "unicode": "e665",
      "unicode_decimal": 58981
    },
    {
      "icon_id": "1002",
      "name": "equipment-setting2",
      "font_class": "equipment-setting2",
      "unicode": "e666",
      "unicode_decimal": 58982
    }
    // ... 644 个图标定义
  ]
}
```

### 字段说明

- **icon_id**: 图标唯一标识
- **name**: 图标名称
- **font_class**: CSS 类名 (去除前缀)
- **unicode**: Unicode 编码
- **unicode_decimal**: Unicode 十进制值

## 🔧 引入配置

### 1. 全局引入

```typescript
// main.ts
import '@/assets/icons/system/iconfont.css'
```

### 2. 按需引入

```vue
<style scoped>
@import '@/assets/icons/system/iconfont.css';
</style>
```

### 3. Vite 配置

```typescript
// vite.config.ts
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/icons/system/iconfont.css";`
      }
    }
  }
}
```

## 🎯 使用方式

### 1. 基础用法

```vue
<template>
  <!-- 方式1: 使用 iconfont 基础类 + 图标类 -->
  <i class="iconfont icon-elevator3"></i>

  <!-- 方式2: 仅使用图标类 (需要在 CSS 中继承 iconfont 样式) -->
  <i class="icon-elevator3"></i>
</template>
```

### 2. 动态图标

```vue
<template>
  <i :class="['iconfont', iconClass]"></i>
</template>

<script setup lang="ts">
import type { IconCode } from '@/types/icons'

const iconName = ref<IconCode>('icon-elevator3')
const iconClass = computed(() => iconName.value)
</script>
```

### 3. 样式定制

```vue
<template>
  <!-- 调整大小 -->
  <i class="iconfont icon-elevator3" style="font-size: 24px"></i>

  <!-- 调整颜色 -->
  <i class="iconfont icon-elevator3" style="color: #409eff"></i>

  <!-- 使用 CSS 类 -->
  <i class="iconfont icon-elevator3 text-2xl text-primary"></i>
</template>

<style scoped>
.custom-icon {
  font-size: 32px;
  color: var(--el-color-primary);
  transition: color 0.3s;
}

.custom-icon:hover {
  color: var(--el-color-primary-light-3);
}
</style>
```

## 🔄 类型生成

### 自动转换流程

```typescript
// vite/plugins/iconfont-types.ts
function parseIconfontJson(jsonPath: string): IconItem[] {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  return data.glyphs.map((glyph: any) => ({
    label: glyph.name,                           // "elevator3"
    value: `${data.css_prefix_text}${glyph.font_class}`  // "icon-elevator3"
  }))
}
```

### 生成的类型

```typescript
// src/types/icons.d.ts (自动生成)
export interface IconItem {
  label: string
  value: string
}

export const ICONFONT_ICONS: IconItem[] = [
  { label: 'elevator3', value: 'icon-elevator3' },
  { label: 'equipment-setting2', value: 'icon-equipment-setting2' },
  // ... 644 个图标
]

export type IconCode =
  | 'icon-elevator3'
  | 'icon-equipment-setting2'
  // ... 644 个类型
```

## 🚀 性能优化

### 1. 字体格式优先级

```css
@font-face {
  font-family: "iconfont";
  /* woff2 体积最小,优先加载 */
  src: url('./iconfont.woff2') format('woff2'),
       url('./iconfont.woff') format('woff'),
       url('./iconfont.ttf') format('truetype');
}
```

### 2. 字体预加载

```html
<!-- index.html -->
<link rel="preload" href="/src/assets/icons/system/iconfont.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. 字体显示策略

```css
@font-face {
  font-family: "iconfont";
  /* ... */
  font-display: swap;  /* 使用后备字体,避免 FOIT */
}
```

## 🛠️ 更新图标库

### 1. 从 Iconfont 平台导出

1. 访问 [Iconfont](https://www.iconfont.cn/)
2. 选择项目
3. 点击 "下载至本地"
4. 解压文件

### 2. 替换项目文件

```bash
# 备份旧文件
cp -r src/assets/icons/system src/assets/icons/system.bak

# 复制新文件
cp iconfont.css src/assets/icons/system/
cp iconfont.json src/assets/icons/system/
cp iconfont.woff2 src/assets/icons/system/
cp iconfont.woff src/assets/icons/system/
cp iconfont.ttf src/assets/icons/system/
```

### 3. 重新生成类型

```bash
# 重启开发服务器,自动生成类型
pnpm dev
```

### 4. 验证更新

```typescript
import { ICONFONT_ICONS } from '@/types/icons'

console.log(`共 ${ICONFONT_ICONS.length} 个图标`)  // 验证数量
```

## 📋 图标管理

### 1. 搜索图标

```typescript
import { ICONFONT_ICONS } from '@/types/icons'

// 搜索包含 "elevator" 的图标
const searchIcons = (keyword: string) => {
  return ICONFONT_ICONS.filter(icon =>
    icon.label.includes(keyword) || icon.value.includes(keyword)
  )
}

searchIcons('elevator')
// [{ label: 'elevator3', value: 'icon-elevator3' }]
```

### 2. 图标验证

```typescript
import { isValidIconCode } from '@/types/icons'

isValidIconCode('icon-elevator3')      // true
isValidIconCode('icon-not-exist')      // false
```

### 3. 获取图标列表

```typescript
import { ICONFONT_ICONS } from '@/types/icons'

// 获取所有图标
const allIcons = ICONFONT_ICONS

// 按字母排序
const sortedIcons = [...ICONFONT_ICONS].sort((a, b) =>
  a.label.localeCompare(b.label)
)
```

## 🎨 高级用法

### 1. 多色图标

```css
/* 通过叠加实现多色效果 */
.icon-wrapper {
  position: relative;
}

.icon-base {
  color: #409eff;
}

.icon-overlay {
  position: absolute;
  color: #67c23a;
  transform: translate(2px, 2px);
}
```

### 2. 图标动画

```css
@keyframes icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-loading {
  animation: icon-spin 1s linear infinite;
}
```

### 3. 图标组合

```vue
<template>
  <span class="icon-group">
    <i class="iconfont icon-elevator3"></i>
    <i class="iconfont icon-equipment-setting2"></i>
  </span>
</template>

<style scoped>
.icon-group {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
</style>
```

## ⚠️ 注意事项

1. **版本管理**: 更新图标库时注意版本号(`?t=时间戳`)
2. **缓存问题**: 修改字体文件后清除浏览器缓存
3. **命名冲突**: 避免自定义类名与图标类名冲突
4. **字体加载**: 确保字体文件路径正确
5. **类型同步**: 更新图标后重新生成类型文件

## 🔗 相关资源

- [Iconfont 平台](https://www.iconfont.cn/)
- [字体图标最佳实践](./best-practices.md)
- [图标类型生成](./type-generation.md)

Iconfont 提供了稳定可靠的自定义图标解决方案,适合业务专属图标的管理和使用。
