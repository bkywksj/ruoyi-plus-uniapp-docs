# 主题状态管理 (theme)

## 介绍

主题状态管理模块负责应用的主题色、暗黑模式、布局配置和用户界面偏好设置。通过 `useTheme` 和 `useLayout` 两个 Composable 协同工作，实现主题色设置、颜色变体生成到 CSS 变量应用的完整链路。

**核心特性:**

- **主题色管理** - 自定义主题色，自动生成 9 级亮色和 9 级暗色变体
- **暗黑模式** - 集成 VueUse 暗黑模式，自动应用暗黑主题 CSS 变量
- **颜色工具** - Hex ↔ RGB 转换、颜色混合、亮度调节等
- **CSS 变量管理** - 动态设置 Element Plus 主题变量
- **配置持久化** - 自动保存用户偏好到 localStorage

## 架构设计

### 模块协作

| 模块 | 职责 |
|------|------|
| useTheme | 主题色设置、颜色变体生成、CSS 变量应用 |
| useLayout | 布局状态、配置持久化、暗黑模式同步 |

### 数据流向

```
用户操作 → useTheme.setTheme(color)
         → useLayout.theme.value = color
         → applyThemeColors(color)
         → document.documentElement.style.setProperty()
         → 组件样式更新
         → localStorage 持久化
```

### 暗黑模式流向

```
用户切换 → useLayout.toggleDark(value)
         → dark.value = value
         → VueUse isDark 同步
         → html 元素添加 .dark 类
         → CSS 暗黑变量生效
```

## 状态定义

### 主题配置接口

```typescript
interface LayoutSetting {
  // 主题外观
  theme: string           // 主题色 (如 '#5d87ff')
  sideTheme: SideTheme    // 侧边栏主题 ('theme-dark' | 'theme-light')
  dark: boolean           // 暗黑模式开关

  // 布局结构
  topNav: boolean         // 顶部导航
  tagsView: boolean       // 标签视图
  fixedHeader: boolean    // 固定头部
  sidebarLogo: boolean    // 侧边栏Logo
  menuLayout: MenuLayoutMode  // 菜单布局模式

  // 其他配置
  title: string           // 系统标题
  size: ElSize            // 组件尺寸
  language: LanguageCode  // 界面语言
  watermark: boolean      // 显示水印
}
```

### 颜色对象接口

```typescript
interface ThemeColors {
  primary: string      // 主题主色调
  lightColors: string[] // 9个亮色变体
  darkColors: string[]  // 9个暗色变体
}
```

### 默认配置

```typescript
const DEFAULT_CONFIG: LayoutSetting = {
  theme: '#5d87ff',        // 默认主题色
  sideTheme: 'theme-dark', // 默认暗色侧边栏
  dark: false,             // 默认亮色模式
  topNav: false,
  tagsView: true,
  fixedHeader: true,
  sidebarLogo: true,
  menuLayout: 'vertical',
  size: 'default',
  language: 'zh_CN',
  watermark: false
}
```

## 核心方法

### setTheme - 设置主题色

```typescript
const setTheme = (color: string): void => {
  layout.theme.value = color
  applyThemeColors(color)
}
```

**使用示例:**

```typescript
const { setTheme } = useTheme()
setTheme('#1890ff')  // 设置为蓝色主题
```

### resetTheme - 重置主题

```typescript
const resetTheme = (): void => {
  const defaultTheme = layout.theme.value
  applyThemeColors(defaultTheme)
}
```

### generateThemeColors - 生成主题色系

根据主色自动生成 9 级亮色和 9 级暗色变体:

```typescript
const generateThemeColors = (color: string): ThemeColors => {
  const lightColors = Array.from({ length: 9 }, (_, i) =>
    getLightColor(color, (i + 1) / 10)
  )
  const darkColors = Array.from({ length: 9 }, (_, i) =>
    getDarkColor(color, (i + 1) / 10)
  )
  return { primary: color, lightColors, darkColors }
}
```

### applyThemeColors - 应用主题色

将主题色应用到 Element Plus CSS 变量:

```typescript
const applyThemeColors = (color: string): void => {
  // 设置主色
  document.documentElement.style.setProperty('--el-color-primary', color)

  // 设置亮色变体 (--el-color-primary-light-1 ~ light-9)
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(color, i / 10)
    )
  }

  // 设置暗色变体 (--el-color-primary-dark-1 ~ dark-9)
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(color, i / 10)
    )
  }
}
```

### toggleDark - 切换暗黑模式

```typescript
const toggleDark = (value: boolean): void => {
  dark.value = value
}
```

**暗黑模式流程:**

1. 更新 `dark.value`
2. watch 触发，同步到 VueUse 的 `isDark`
3. VueUse 添加 `.dark` 类到 `<html>` 元素
4. CSS 暗黑变量生效
5. 配置持久化到 localStorage

## 颜色工具函数

### getLightColor - 调亮颜色

```typescript
const getLightColor = (color: string, level: number): string => {
  return lightenColor(color, level)
}

// 算法: newValue = (255 - value) * level + value
```

### getDarkColor - 调暗颜色

```typescript
const getDarkColor = (color: string, level: number): string => {
  return darkenColor(color, level)
}

// 算法: newValue = value * (1 - level)
```

### addAlphaToHex - 添加透明度

```typescript
const addAlphaToHex = (hex: string, alpha: number = 1): string => {
  if (alpha >= 1) return hex
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return `${hex}${alphaHex}`
}
```

**示例:**

```typescript
addAlphaToHex('#1890ff', 0.5)  // '#1890ff80' (50% 透明度)
```

### hexToRgb / rgbToHex - 颜色转换

```typescript
hexToRgb('#1890ff')           // [24, 144, 255]
rgbToHex(24, 144, 255)        // '#1890ff'
```

## 使用示例

### 基础用法

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

const { currentTheme, setTheme, getLightColor, getDarkColor } = useTheme()
const layout = useLayout()

// 设置主题色
setTheme('#1890ff')

// 切换暗黑模式
layout.toggleDark(true)

// 生成颜色变体
const hoverColor = getLightColor('#1890ff', 0.2)  // 悬停色
const activeColor = getDarkColor('#1890ff', 0.1) // 按下色
</script>
```

### 主题色选择器

```vue
<template>
  <div class="theme-picker">
    <div
      v-for="color in presetColors"
      :key="color"
      :style="{ backgroundColor: color }"
      :class="{ active: color === currentTheme }"
      @click="setTheme(color)"
    />
    <el-color-picker v-model="customColor" @change="setTheme" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme } = useTheme()

const presetColors = [
  '#5d87ff', '#1890ff', '#13c2c2',
  '#52c41a', '#faad14', '#f5222d'
]
const customColor = ref(currentTheme.value)
</script>
```

### 暗黑模式切换

```vue
<template>
  <el-switch
    v-model="dark"
    :active-action-icon="Moon"
    :inactive-action-icon="Sunny"
    @change="toggleDark"
  />
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'

const { dark, toggleDark } = useLayout()
</script>
```

### 自定义组件适配主题

```vue
<template>
  <div class="custom-card" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, getLightColor, addAlphaToHex } = useTheme()

const cardStyle = computed(() => ({
  backgroundColor: getLightColor(currentTheme.value, 0.9),
  borderColor: addAlphaToHex(currentTheme.value, 0.3),
  boxShadow: `0 2px 12px ${addAlphaToHex(currentTheme.value, 0.1)}`
}))
</script>
```

## 最佳实践

### 1. 使用 CSS 变量

```scss
// ✅ 推荐: 使用 CSS 变量
.my-component {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-color: var(--el-color-primary);
}

// ❌ 避免: 硬编码颜色
.my-component {
  background-color: #ffffff;
  color: #303133;
}
```

### 2. 暗黑模式适配

```scss
.my-component {
  background-color: var(--el-bg-color);

  // 图片适配
  background-image: url('@/assets/images/bg-light.png');

  html.dark & {
    background-image: url('@/assets/images/bg-dark.png');
  }
}
```

### 3. 初始化时应用主题

```typescript
// main.ts
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
const { setTheme } = useTheme()

// 应用保存的主题配置
setTheme(layout.theme.value)
```

### 4. 响应式主题样式

```vue
<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, getLightColor } = useTheme()

// 使用 computed 确保响应式
const buttonStyle = computed(() => ({
  '--btn-bg': currentTheme.value,
  '--btn-hover': getLightColor(currentTheme.value, 0.1),
  '--btn-active': getLightColor(currentTheme.value, 0.2)
}))

// 或使用 watchEffect 动态更新
watchEffect(() => {
  document.documentElement.style.setProperty('--custom-primary', currentTheme.value)
})
</script>
```

## 常见问题

### 1. 主题色切换后页面闪烁

**原因:** CSS 变量异步应用导致

**解决:** 在应用挂载前同步应用主题

```typescript
// 在 createApp 之前同步应用
const theme = localStorage.getItem('layout-config')
if (theme) {
  const { theme: themeColor } = JSON.parse(theme)
  document.documentElement.style.setProperty('--el-color-primary', themeColor)
}
```

### 2. 暗黑模式样式不生效

**原因:** 未使用 CSS 变量或未定义暗黑模式样式

**解决:**

```scss
// 使用 Element Plus 变量
.component {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

// 或定义暗黑样式
html.dark .component {
  background: #1a1a1a;
}
```

### 3. Element Plus 组件未跟随主题

**原因:** 未正确设置 CSS 变量或使用了 `type` 属性

**解决:**

```vue
<!-- 使用 type="primary" 会自动跟随主题色 -->
<el-button type="primary">按钮</el-button>

<!-- 自定义颜色使用响应式变量 -->
<el-button :style="{ backgroundColor: currentTheme }">自定义</el-button>
```

### 4. 颜色变体计算不符预期

**原因:** level 参数理解错误

**说明:**

| level | getLightColor | getDarkColor |
|-------|---------------|--------------|
| 0.1 | 稍微调亮 | 稍微调暗 |
| 0.5 | 明显调亮 | 明显调暗 |
| 0.9 | 接近白色 | 接近黑色 |

## API 参考

### useTheme 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| currentTheme | `Ref<string>` | 当前主题色 |
| setTheme | `(color: string) => void` | 设置主题色 |
| resetTheme | `() => void` | 重置主题 |
| generateThemeColors | `(color: string) => ThemeColors` | 生成色系 |
| getLightColor | `(color: string, level: number) => string` | 调亮颜色 |
| getDarkColor | `(color: string, level: number) => string` | 调暗颜色 |
| addAlphaToHex | `(hex: string, alpha: number) => string` | 添加透明度 |

### useLayout 主题相关

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| theme | `Ref<string>` | 主题色配置 |
| dark | `Ref<boolean>` | 暗黑模式 |
| sideTheme | `Ref<SideTheme>` | 侧边栏主题 |
| toggleDark | `(value: boolean) => void` | 切换暗黑模式 |

## 总结

主题状态管理系统通过 `useTheme` 和 `useLayout` 协同工作，提供完整的主题定制能力：

1. **主题色系统**: 自动生成 18 个颜色变体，覆盖 Element Plus 全部主题需求
2. **暗黑模式**: 与 VueUse 深度集成，实现流畅的明暗切换
3. **持久化**: 自动保存用户偏好，跨会话保持配置
4. **类型安全**: 完整的 TypeScript 类型定义

使用建议：
- 优先使用 CSS 变量而非硬编码颜色
- 在应用初始化时同步应用主题配置
- 使用 computed 确保样式响应式更新
