# 颜色系统

## 介绍

RuoYi-Plus-UI 提供了完整的颜色处理系统，包括颜色工具函数库和主题管理 Composable。颜色系统负责颜色格式转换、颜色变体生成、主题色动态应用等核心功能，是实现动态主题切换的技术基础。

**核心特性：**

- **颜色格式转换** - 支持 HEX、RGB、RGBA 等格式的相互转换
- **颜色验证** - 提供完善的颜色格式验证函数
- **颜色变体生成** - 自动生成亮色和暗色变体，支持 9 个等级
- **颜色混合** - 支持按比例混合两种颜色
- **主题管理** - 提供 `useTheme` Composable 统一管理主题色
- **边界处理** - 所有函数都包含完善的边界情况处理

## 颜色工具函数

颜色工具函数定义在 `src/utils/colors.ts` 文件中，提供了丰富的颜色处理能力。

### 默认颜色常量

```typescript
// 系统当前默认主题色
const DEFAULT_COLOR = '#5d87ff'

// 对应的 RGB 值
const DEFAULT_RGB = [93, 135, 255]
```

### 颜色验证函数

#### isValidHex - 验证 HEX 颜色格式

验证字符串是否为有效的十六进制颜色值。

```typescript
/**
 * 验证 hex 颜色格式
 * @param hex - hex 颜色值
 * @returns 是否为有效的 hex 颜色
 */
export const isValidHex = (hex: string): boolean => {
  if (!hex) return false
  const cleanHex = hex.trim().replace(/^#/, '')
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)
}
```

**使用示例：**

```typescript
import { isValidHex } from '@/utils/colors'

isValidHex('#409eff')   // true
isValidHex('#fff')      // true
isValidHex('409eff')    // true (不带 # 也有效)
isValidHex('#gggggg')   // false
isValidHex('')          // false
isValidHex(null)        // false
```

#### isValidRgb - 验证 RGB 颜色值

验证 RGB 值是否在有效范围内（0-255）。

```typescript
/**
 * 验证 RGB 颜色值
 * @param r - 红色值
 * @param g - 绿色值
 * @param b - 蓝色值
 * @returns 是否为有效的 RGB 值
 */
export const isValidRgb = (r: number, g: number, b: number): boolean => {
  const isValid = (value: number) =>
    Number.isInteger(value) && value >= 0 && value <= 255
  return isValid(r) && isValid(g) && isValid(b)
}
```

**使用示例：**

```typescript
import { isValidRgb } from '@/utils/colors'

isValidRgb(64, 158, 255)   // true
isValidRgb(0, 0, 0)        // true
isValidRgb(255, 255, 255)  // true
isValidRgb(256, 0, 0)      // false (超出范围)
isValidRgb(-1, 0, 0)       // false (负数)
isValidRgb(1.5, 0, 0)      // false (非整数)
```

### 颜色转换函数

#### hexToRgb - HEX 转 RGB

将十六进制颜色转换为 RGB 数组。

```typescript
/**
 * 将 hex 颜色转换为 RGB 数组
 * @param hex - hex 颜色值
 * @returns RGB 数组 [r, g, b]
 */
export const hexToRgb = (hex: string): number[] => {
  // 边界处理：如果传入无效值，使用默认颜色
  if (!hex || typeof hex !== 'string' || !isValidHex(hex)) {
    console.warn(`Invalid hex color "${hex}", using default color "${DEFAULT_COLOR}"`)
    return [...DEFAULT_RGB]
  }

  let cleanHex = hex.trim().replace(/^#/, '').toUpperCase()

  // 处理缩写形式 (#FFF -> #FFFFFF)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char.repeat(2))
      .join('')
  }

  const hexPairs = cleanHex.match(/\w\w/g)
  if (!hexPairs) {
    console.warn(`Failed to parse hex color "${hex}", using default color "${DEFAULT_COLOR}"`)
    return [...DEFAULT_RGB]
  }

  return hexPairs.map((pair) => parseInt(pair, 16))
}
```

**使用示例：**

```typescript
import { hexToRgb } from '@/utils/colors'

hexToRgb('#409eff')     // [64, 158, 255]
hexToRgb('#fff')        // [255, 255, 255] (支持缩写)
hexToRgb('409eff')      // [64, 158, 255] (不带 # 也可以)
hexToRgb('#000')        // [0, 0, 0]
hexToRgb('invalid')     // [93, 135, 255] (返回默认值并警告)
```

#### rgbToHex - RGB 转 HEX

将 RGB 颜色转换为十六进制格式。

```typescript
/**
 * 将 RGB 颜色转换为 hex
 * @param r - 红色值 (0-255)
 * @param g - 绿色值 (0-255)
 * @param b - 蓝色值 (0-255)
 * @returns hex 颜色值
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  // 边界处理：修复无效的RGB值
  const fixRgbValue = (value: number): number => {
    if (typeof value !== 'number' || isNaN(value)) return 0
    return Math.max(0, Math.min(255, Math.round(value)))
  }

  const fixedR = fixRgbValue(r)
  const fixedG = fixRgbValue(g)
  const fixedB = fixRgbValue(b)

  // 如果原始值有问题，给出警告
  if (fixedR !== r || fixedG !== g || fixedB !== b) {
    console.warn(`Invalid RGB values (${r}, ${g}, ${b}), fixed to (${fixedR}, ${fixedG}, ${fixedB})`)
  }

  const toHex = (value: number) => {
    const hex = value.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(fixedR)}${toHex(fixedG)}${toHex(fixedB)}`
}
```

**使用示例：**

```typescript
import { rgbToHex } from '@/utils/colors'

rgbToHex(64, 158, 255)    // '#409eff'
rgbToHex(255, 255, 255)   // '#ffffff'
rgbToHex(0, 0, 0)         // '#000000'
rgbToHex(300, -10, 1.5)   // '#ff0002' (自动修正无效值)
```

#### hexToRgba - HEX 转 RGBA

将十六进制颜色转换为带透明度的 RGBA 格式。

```typescript
/**
 * 颜色转换结果接口
 */
interface RgbaResult {
  red: number
  green: number
  blue: number
  rgba: string
}

/**
 * 将 hex 颜色转换为 RGBA
 * @param hex - hex 颜色值 (支持 #FFF 或 #FFFFFF 格式)
 * @param opacity - 透明度 (0-1)
 * @returns 包含 RGB 值和 RGBA 字符串的对象
 */
export const hexToRgba = (hex: string, opacity: number): RgbaResult => {
  // 边界处理：确保有效的透明度值
  const validOpacity = typeof opacity === 'number' && !isNaN(opacity)
    ? Math.max(0, Math.min(1, opacity))
    : 1

  const [red, green, blue] = hexToRgb(hex)
  const rgba = `rgba(${red}, ${green}, ${blue}, ${validOpacity.toFixed(2)})`

  return { red, green, blue, rgba }
}
```

**使用示例：**

```typescript
import { hexToRgba } from '@/utils/colors'

hexToRgba('#409eff', 0.5)
// { red: 64, green: 158, blue: 255, rgba: 'rgba(64, 158, 255, 0.50)' }

hexToRgba('#fff', 0.8)
// { red: 255, green: 255, blue: 255, rgba: 'rgba(255, 255, 255, 0.80)' }

hexToRgba('#000', 0)
// { red: 0, green: 0, blue: 0, rgba: 'rgba(0, 0, 0, 0.00)' }
```

### 颜色混合函数

#### blendColor - 混合两种颜色

按指定比例混合两种颜色。

```typescript
/**
 * 混合两种颜色
 * @param color1 - 第一个颜色
 * @param color2 - 第二个颜色
 * @param ratio - 混合比例 (0-1)，0 表示完全是 color1，1 表示完全是 color2
 * @returns 混合后的颜色
 */
export const blendColor = (color1: string, color2: string, ratio: number): string => {
  // 边界处理：确保有效的混合比例
  const validRatio = typeof ratio === 'number' && !isNaN(ratio)
    ? Math.max(0, Math.min(1, ratio))
    : 0.5

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const blendedRgb = rgb1.map((value1, index) => {
    const value2 = rgb2[index]
    return Math.round(value1 * (1 - validRatio) + value2 * validRatio)
  })

  return rgbToHex(blendedRgb[0], blendedRgb[1], blendedRgb[2])
}
```

**使用示例：**

```typescript
import { blendColor } from '@/utils/colors'

// 混合红色和蓝色，比例各 50%
blendColor('#ff0000', '#0000ff', 0.5)  // '#800080' (紫色)

// 更偏向第一个颜色
blendColor('#ff0000', '#0000ff', 0.2)  // '#cc0033'

// 更偏向第二个颜色
blendColor('#ff0000', '#0000ff', 0.8)  // '#3300cc'

// 混合黑白
blendColor('#000000', '#ffffff', 0.5)  // '#808080' (灰色)
```

### 颜色调节函数

#### lightenColor - 调亮颜色

将颜色调亮指定程度。

```typescript
/**
 * 调亮颜色
 * @param color - 原始颜色
 * @param level - 调亮程度 (0-1)，值越大越亮
 * @param isDark - 是否为暗色主题
 * @returns 调亮后的颜色
 */
export const lightenColor = (color: string, level: number, isDark: boolean = false): string => {
  // 边界处理：确保有效的调亮级别
  const validLevel = typeof level === 'number' && !isNaN(level)
    ? Math.max(0, Math.min(1, level))
    : 0.1

  // 如果是暗色主题，使用 darkenColor 处理
  if (isDark) {
    return darkenColor(color, validLevel)
  }

  const rgb = hexToRgb(color)
  const lightRgb = rgb.map((value) =>
    Math.floor((255 - value) * validLevel + value)
  )

  return rgbToHex(lightRgb[0], lightRgb[1], lightRgb[2])
}
```

**使用示例：**

```typescript
import { lightenColor } from '@/utils/colors'

// 调亮主色
lightenColor('#409eff', 0.1)  // '#53a8ff' (轻微调亮)
lightenColor('#409eff', 0.3)  // '#79bbff' (中度调亮)
lightenColor('#409eff', 0.5)  // '#9fcfff' (明显调亮)
lightenColor('#409eff', 0.9)  // '#ebf5ff' (接近白色)

// 暗色主题下会调暗
lightenColor('#409eff', 0.3, true)  // 实际调用 darkenColor
```

#### darkenColor - 调暗颜色

将颜色调暗指定程度。

```typescript
/**
 * 调暗颜色
 * @param color - 原始颜色
 * @param level - 调暗程度 (0-1)，值越大越暗
 * @returns 调暗后的颜色
 */
export const darkenColor = (color: string, level: number): string => {
  // 边界处理：确保有效的调暗级别
  const validLevel = typeof level === 'number' && !isNaN(level)
    ? Math.max(0, Math.min(1, level))
    : 0.1

  const rgb = hexToRgb(color)
  const darkRgb = rgb.map((value) =>
    Math.floor(value * (1 - validLevel))
  )

  return rgbToHex(darkRgb[0], darkRgb[1], darkRgb[2])
}
```

**使用示例：**

```typescript
import { darkenColor } from '@/utils/colors'

// 调暗主色
darkenColor('#409eff', 0.1)  // '#3a8ee6' (轻微调暗)
darkenColor('#409eff', 0.3)  // '#2d6fb3' (中度调暗)
darkenColor('#409eff', 0.5)  // '#204f80' (明显调暗)
darkenColor('#409eff', 0.9)  // '#061019' (接近黑色)
```

### CSS 变量工具函数

#### getCssVar - 获取 CSS 变量值

从 DOM 中获取 CSS 变量的计算值。

```typescript
/**
 * 获取 CSS 变量值
 * @param name - CSS 变量名
 * @returns CSS 变量值
 */
export const getCssVar = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}
```

**使用示例：**

```typescript
import { getCssVar } from '@/utils/colors'

// 获取主色
const primaryColor = getCssVar('--el-color-primary')
console.log(primaryColor)  // ' #409eff' (注意：可能包含前导空格)

// 去除空格
const cleanColor = getCssVar('--el-color-primary').trim()

// 获取其他变量
const bgColor = getCssVar('--app-bg')
const borderColor = getCssVar('--app-border')
```

## useTheme Composable

`useTheme` 是一个 Vue 3 Composable，提供对应用主题的响应式管理功能。

### 基本用法

```typescript
import { useTheme } from '@/composables/useTheme'

export default defineComponent({
  setup() {
    const {
      currentTheme,
      setTheme,
      resetTheme,
      getLightColor,
      getDarkColor,
      generateThemeColors,
      addAlphaToHex
    } = useTheme()

    // 获取当前主题色
    console.log(currentTheme.value)  // '#409eff'

    // 设置新的主题色
    const changeTheme = () => {
      setTheme('#1890ff')
    }

    // 重置为默认主题
    const reset = () => {
      resetTheme()
    }

    return {
      currentTheme,
      changeTheme,
      reset
    }
  }
})
```

### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `currentTheme` | `Ref<string>` | 当前主题色（响应式） |
| `setTheme` | `(color: string) => void` | 设置新的主题色 |
| `resetTheme` | `() => void` | 重置为默认主题 |
| `getLightColor` | `(color: string, level: number) => string` | 生成亮色变体 |
| `getDarkColor` | `(color: string, level: number) => string` | 生成暗色变体 |
| `generateThemeColors` | `(color: string) => ThemeColors` | 生成完整主题色系 |
| `addAlphaToHex` | `(hex: string, alpha: number) => string` | 添加透明度 |

### 类型定义

```typescript
/**
 * 主题颜色接口
 */
export interface ThemeColors {
  /** 主题主色调 */
  primary: string
  /** 亮色变体(9个等级) */
  lightColors: string[]
  /** 暗色变体(9个等级) */
  darkColors: string[]
}
```

### 生成主题色变体

`generateThemeColors` 方法可以基于一个主色生成完整的颜色变体：

```typescript
import { useTheme } from '@/composables/useTheme'

const { generateThemeColors } = useTheme()

const colors = generateThemeColors('#409eff')
console.log(colors)
/*
{
  primary: '#409eff',
  lightColors: [
    '#53a8ff',  // level 1 (10%)
    '#66b1ff',  // level 2 (20%)
    '#79bbff',  // level 3 (30%)
    '#8cc5ff',  // level 4 (40%)
    '#9fcfff',  // level 5 (50%)
    '#b3d8ff',  // level 6 (60%)
    '#c6e2ff',  // level 7 (70%)
    '#d9ebff',  // level 8 (80%)
    '#ecf5ff'   // level 9 (90%)
  ],
  darkColors: [
    '#3a8ee6',  // level 1 (10%)
    '#337ecc',  // level 2 (20%)
    '#2d6eb3',  // level 3 (30%)
    '#265e99',  // level 4 (40%)
    '#204f80',  // level 5 (50%)
    '#1a3f66',  // level 6 (60%)
    '#132f4d',  // level 7 (70%)
    '#0d1f33',  // level 8 (80%)
    '#06101a'   // level 9 (90%)
  ]
}
*/
```

### 应用主题颜色

`setTheme` 方法会自动将主题色应用到 CSS 变量：

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 设置新主题色
setTheme('#1890ff')

// 这会自动设置以下 CSS 变量：
// --el-color-primary: #1890ff
// --el-color-primary-light-1: #2e9bff
// --el-color-primary-light-2: #45a6ff
// ...
// --el-color-primary-dark-1: #1682e6
// --el-color-primary-dark-2: #1373cc
// ...
```

### 添加透明度

`addAlphaToHex` 方法可以为颜色添加透明度：

```typescript
import { useTheme } from '@/composables/useTheme'

const { addAlphaToHex } = useTheme()

// 添加 50% 透明度
addAlphaToHex('#409eff', 0.5)  // '#409eff80'

// 添加 30% 透明度
addAlphaToHex('#409eff', 0.3)  // '#409eff4d'

// 不透明
addAlphaToHex('#409eff', 1)    // '#409eff'
```

## Element Plus 主题色设置

### 手动设置主题色

```typescript
import { lightenColor, darkenColor } from '@/utils/colors'

/**
 * 设置 Element Plus 主题色
 */
const setElementPlusTheme = (color: string) => {
  const root = document.documentElement

  // 设置主色
  root.style.setProperty('--el-color-primary', color)

  // 设置亮色变体
  for (let i = 1; i <= 9; i++) {
    const lightColor = lightenColor(color, i / 10)
    root.style.setProperty(`--el-color-primary-light-${i}`, lightColor)
  }

  // 设置暗色变体
  for (let i = 1; i <= 9; i++) {
    const darkColor = darkenColor(color, i / 10)
    root.style.setProperty(`--el-color-primary-dark-${i}`, darkColor)
  }
}

// 使用
setElementPlusTheme('#1890ff')
```

### 使用 useTheme 设置

推荐使用 `useTheme` Composable，它会自动处理所有变体：

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 一行代码设置完整主题
setTheme('#1890ff')
```

## 颜色变体预览

以默认主色 `#409eff` 为例，展示所有变体：

### 亮色变体

| 变量名 | 级别 | 颜色值 | 预览 |
|--------|------|--------|------|
| `--el-color-primary` | 0% | `#409eff` | 主色 |
| `--el-color-primary-light-1` | 10% | `#53a8ff` | 轻微变亮 |
| `--el-color-primary-light-2` | 20% | `#66b1ff` | |
| `--el-color-primary-light-3` | 30% | `#79bbff` | 常用悬停色 |
| `--el-color-primary-light-4` | 40% | `#8cc5ff` | |
| `--el-color-primary-light-5` | 50% | `#9fcfff` | 中度变亮 |
| `--el-color-primary-light-6` | 60% | `#b3d8ff` | |
| `--el-color-primary-light-7` | 70% | `#c6e2ff` | 常用背景色 |
| `--el-color-primary-light-8` | 80% | `#d9ebff` | |
| `--el-color-primary-light-9` | 90% | `#ecf5ff` | 最浅背景色 |

### 暗色变体

| 变量名 | 级别 | 颜色值 | 预览 |
|--------|------|--------|------|
| `--el-color-primary` | 0% | `#409eff` | 主色 |
| `--el-color-primary-dark-1` | 10% | `#3a8ee6` | 轻微变暗 |
| `--el-color-primary-dark-2` | 20% | `#337ecc` | 常用点击色 |
| `--el-color-primary-dark-3` | 30% | `#2d6eb3` | |
| `--el-color-primary-dark-4` | 40% | `#265e99` | |
| `--el-color-primary-dark-5` | 50% | `#204f80` | 中度变暗 |
| `--el-color-primary-dark-6` | 60% | `#1a3f66` | 暗色主题常用 |
| `--el-color-primary-dark-7` | 70% | `#132f4d` | |
| `--el-color-primary-dark-8` | 80% | `#0d1f33` | |
| `--el-color-primary-dark-9` | 90% | `#06101a` | 最深色 |

## 实际应用示例

### 主题色选择器组件

```vue
<template>
  <div class="theme-picker">
    <div class="color-options">
      <div
        v-for="color in presetColors"
        :key="color"
        class="color-option"
        :style="{ backgroundColor: color }"
        :class="{ active: currentTheme === color }"
        @click="handleColorChange(color)"
      />
    </div>
    <el-color-picker
      v-model="currentTheme"
      @change="handleColorChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme } = useTheme()

const presetColors = [
  '#409eff', // 默认蓝
  '#1890ff', // 天蓝
  '#67c23a', // 成功绿
  '#e6a23c', // 警告橙
  '#f56c6c', // 危险红
  '#909399', // 信息灰
  '#8b5cf6', // 紫色
  '#06b6d4'  // 青色
]

const handleColorChange = (color: string) => {
  setTheme(color)
}
</script>

<style lang="scss" scoped>
.theme-picker {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
  }
}
</style>
```

### 动态背景色组件

```vue
<template>
  <div
    class="dynamic-bg"
    :style="backgroundStyle"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { hexToRgba } from '@/utils/colors'

const props = withDefaults(defineProps<{
  color?: string
  opacity?: number
}>(), {
  color: '#409eff',
  opacity: 0.1
})

const backgroundStyle = computed(() => {
  const { rgba } = hexToRgba(props.color, props.opacity)
  return {
    backgroundColor: rgba
  }
})
</script>
```

### 渐变色生成

```typescript
import { lightenColor, darkenColor } from '@/utils/colors'

/**
 * 生成渐变色
 */
const generateGradient = (color: string, type: 'linear' | 'radial' = 'linear') => {
  const lightColor = lightenColor(color, 0.3)
  const darkColor = darkenColor(color, 0.3)

  if (type === 'linear') {
    return `linear-gradient(135deg, ${lightColor} 0%, ${color} 50%, ${darkColor} 100%)`
  } else {
    return `radial-gradient(circle, ${lightColor} 0%, ${color} 50%, ${darkColor} 100%)`
  }
}

// 使用
const gradient = generateGradient('#409eff')
// 'linear-gradient(135deg, #79bbff 0%, #409eff 50%, #2d6eb3 100%)'
```

### 对比色计算

```typescript
import { hexToRgb } from '@/utils/colors'

/**
 * 计算颜色亮度
 */
const getLuminance = (color: string): number => {
  const [r, g, b] = hexToRgb(color)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/**
 * 获取对比色（黑或白）
 */
const getContrastColor = (bgColor: string): string => {
  const luminance = getLuminance(bgColor)
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// 使用
getContrastColor('#409eff')  // '#ffffff' (浅色背景用白字)
getContrastColor('#ffeb3b')  // '#000000' (深色背景用黑字)
```

## 最佳实践

### 1. 使用 Composable 而非直接操作

```typescript
// ✅ 推荐：使用 useTheme
import { useTheme } from '@/composables/useTheme'
const { setTheme } = useTheme()
setTheme('#1890ff')

// ❌ 不推荐：直接操作 DOM
document.documentElement.style.setProperty('--el-color-primary', '#1890ff')
```

### 2. 处理边界情况

```typescript
import { isValidHex, hexToRgb } from '@/utils/colors'

// ✅ 推荐：先验证再使用
const processColor = (color: string) => {
  if (!isValidHex(color)) {
    console.warn('Invalid color:', color)
    return
  }
  const rgb = hexToRgb(color)
  // ...
}

// 工具函数已内置边界处理，传入无效值会返回默认值
hexToRgb('invalid')  // [93, 135, 255] + 警告日志
```

### 3. 缓存计算结果

```typescript
import { computed } from 'vue'
import { generateThemeColors } from '@/composables/useTheme'

// ✅ 推荐：使用 computed 缓存
const themeColors = computed(() => {
  return generateThemeColors(currentTheme.value)
})

// ❌ 不推荐：每次访问都重新计算
const getColors = () => {
  return generateThemeColors(currentTheme.value)
}
```

### 4. 统一颜色格式

```typescript
// ✅ 推荐：统一使用完整格式
const color = '#409eff'

// ❌ 不推荐：混用不同格式
const color1 = '#409eff'
const color2 = '#fff'      // 缩写
const color3 = '409eff'    // 无 #
const color4 = 'rgb(64, 158, 255)'  // RGB 格式
```

## 常见问题

### 1. 颜色转换结果不准确

**问题原因：**
- 输入颜色格式不正确
- 透明度值超出范围

**解决方案：**

```typescript
// 确保输入格式正确
const color = '#409eff'  // 6 位或 3 位 hex

// 透明度在 0-1 范围内
const opacity = Math.max(0, Math.min(1, userInput))
```

### 2. 主题色设置后部分组件未更新

**问题原因：**
- 组件使用了硬编码颜色
- CSS 变量未正确应用

**解决方案：**

```scss
// 确保组件使用 CSS 变量
.button {
  // ❌ 硬编码
  background-color: #409eff;

  // ✅ 使用变量
  background-color: var(--el-color-primary);
}
```

### 3. 暗色主题下颜色异常

**问题原因：**
- 亮色变体在暗色主题下可能过亮
- 未考虑主题切换

**解决方案：**

```typescript
import { lightenColor, darkenColor } from '@/utils/colors'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

const getVariantColor = (color: string, level: number) => {
  if (layout.isDark.value) {
    return darkenColor(color, level)
  }
  return lightenColor(color, level)
}
```

### 4. 颜色选择器与实际应用不一致

**问题原因：**
- 颜色选择器返回的格式与预期不同
- 未正确处理颜色更新

**解决方案：**

```typescript
import { isValidHex } from '@/utils/colors'

const handleColorPick = (color: string) => {
  // 验证颜色格式
  if (!isValidHex(color)) {
    console.warn('Invalid color from picker:', color)
    return
  }

  // 确保格式统一
  const normalizedColor = color.startsWith('#') ? color : `#${color}`
  setTheme(normalizedColor)
}
```

## API 速查表

### 验证函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `isValidHex` | `hex: string` | `boolean` | 验证 HEX 格式 |
| `isValidRgb` | `r, g, b: number` | `boolean` | 验证 RGB 值 |

### 转换函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `hexToRgb` | `hex: string` | `number[]` | HEX 转 RGB |
| `rgbToHex` | `r, g, b: number` | `string` | RGB 转 HEX |
| `hexToRgba` | `hex, opacity` | `RgbaResult` | HEX 转 RGBA |

### 调节函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `lightenColor` | `color, level, isDark?` | `string` | 调亮颜色 |
| `darkenColor` | `color, level` | `string` | 调暗颜色 |
| `blendColor` | `color1, color2, ratio` | `string` | 混合颜色 |

### useTheme 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setTheme` | `color: string` | `void` | 设置主题色 |
| `resetTheme` | - | `void` | 重置主题 |
| `generateThemeColors` | `color: string` | `ThemeColors` | 生成色系 |
| `addAlphaToHex` | `hex, alpha` | `string` | 添加透明度 |
| `getLightColor` | `color: string, level: number` | `string` | 生成亮色变体 |
| `getDarkColor` | `color: string, level: number` | `string` | 生成暗色变体 |

### useTheme 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `currentTheme` | `Ref<string>` | 当前主题色，响应式引用 |

### 默认颜色常量

| 常量名 | 值 | 说明 |
|--------|------|------|
| `DEFAULT_COLOR` | `#5d87ff` | 系统默认主题色 |
| `DEFAULT_RGB` | `[93, 135, 255]` | 默认主题色的 RGB 值 |

### 颜色变体级别参考

| 级别 | 比例 | 亮色效果 | 暗色效果 |
|------|------|----------|----------|
| 1 | 10% | 轻微变亮 | 轻微变暗 |
| 2 | 20% | 稍微变亮 | 稍微变暗 |
| 3 | 30% | 常用悬停色 | 常用点击色 |
| 5 | 50% | 中度变亮 | 中度变暗 |
| 7 | 70% | 常用背景色 | 常用暗色背景 |
| 9 | 90% | 最浅背景色 | 最深色 |
