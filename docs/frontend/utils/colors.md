# 颜色处理工具 (colors.ts)

颜色处理相关工具函数，提供颜色验证、转换、混合和主题设置等功能，是前端主题系统和动态样式的核心支撑模块。

## 📖 概述

颜色工具模块提供了一套完整的颜色处理解决方案，涵盖颜色格式验证、颜色空间转换、颜色混合调节等功能。该模块在Element Plus主题定制、动态主题切换、颜色选择器等场景中发挥关键作用。

### 核心功能

| 功能分类 | 函数名 | 说明 |
|---------|--------|------|
| **颜色验证** | `isValidHex` | 验证hex颜色格式是否有效 |
| **颜色验证** | `isValidRgb` | 验证RGB值是否在有效范围 |
| **颜色转换** | `hexToRgb` | hex颜色转RGB数组 |
| **颜色转换** | `rgbToHex` | RGB值转hex颜色 |
| **颜色转换** | `hexToRgba` | hex颜色转RGBA格式 |
| **颜色混合** | `blendColor` | 按比例混合两种颜色 |
| **颜色调节** | `lightenColor` | 调亮颜色 |
| **颜色调节** | `darkenColor` | 调暗颜色 |
| **CSS变量** | `getCssVar` | 获取CSS变量值 |

### 设计特点

- **边界处理完善**：所有函数都有完善的参数验证和默认值处理
- **类型安全**：完整的TypeScript类型定义
- **自动修复**：对于超出范围的值自动修复并给出警告
- **暗色主题支持**：颜色调节函数支持暗色主题模式
- **性能优化**：纯函数设计，易于缓存和优化

## 🎨 颜色理论基础

### RGB颜色模型

RGB（Red、Green、Blue）是加色模型，通过三种基色光的叠加来表示颜色：

```text
┌─────────────────────────────────────────────────────────────┐
│                    RGB 颜色空间                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    红色 (R)        绿色 (G)        蓝色 (B)                  │
│    ┌─────┐         ┌─────┐         ┌─────┐                 │
│    │ 0   │         │ 0   │         │ 0   │    黑色         │
│    │ 255 │         │ 0   │         │ 0   │    纯红         │
│    │ 0   │         │ 255 │         │ 0   │    纯绿         │
│    │ 0   │         │ 0   │         │ 255 │    纯蓝         │
│    │ 255 │         │ 255 │         │ 0   │    黄色         │
│    │ 255 │         │ 0   │         │ 255 │    洋红         │
│    │ 0   │         │ 255 │         │ 255 │    青色         │
│    │ 255 │         │ 255 │         │ 255 │    白色         │
│    └─────┘         └─────┘         └─────┘                 │
│                                                             │
│    每个通道取值范围: 0 - 255 (8位)                           │
│    总共可表示: 256 × 256 × 256 = 16,777,216 种颜色          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hex颜色表示法

Hex（十六进制）是RGB颜色的另一种表示形式：

| 格式 | 示例 | 说明 |
|------|------|------|
| 6位完整格式 | `#5d87ff` | R=5d(93), G=87(135), B=ff(255) |
| 3位缩写格式 | `#FFF` | 等同于#FFFFFF，每位重复一次 |
| 无#前缀 | `5d87ff` | 部分场景可省略#号 |

### 颜色混合原理

颜色混合是通过对RGB通道分别进行线性插值实现的：

```typescript
// 混合公式
resultR = R1 × (1 - ratio) + R2 × ratio
resultG = G1 × (1 - ratio) + G2 × ratio
resultB = B1 × (1 - ratio) + B2 × ratio

// 示例：50% 混合 #5d87ff 和 #ff5d87
// R: 93 × 0.5 + 255 × 0.5 = 174
// G: 135 × 0.5 + 93 × 0.5 = 114
// B: 255 × 0.5 + 135 × 0.5 = 195
// 结果: #ae72c3
```

### 颜色调亮调暗原理

```typescript
// 调亮公式：向白色(255)靠近
lightenedValue = originalValue + (255 - originalValue) × level

// 调暗公式：向黑色(0)靠近
darkenedValue = originalValue × (1 - level)

// 示例：调亮 #5d87ff 20%
// R: 93 + (255 - 93) × 0.2 = 125
// G: 135 + (255 - 135) × 0.2 = 159
// B: 255 + (255 - 255) × 0.2 = 255
// 结果: #7d9fff
```

## 🔧 安装与导入

### 导入使用

```typescript
import {
  getCssVar,
  isValidHex,
  isValidRgb,
  hexToRgb,
  rgbToHex,
  hexToRgba,
  blendColor,
  lightenColor,
  darkenColor
} from '@/utils/colors'
```

### 按需导入

```typescript
// 仅导入需要的函数
import { isValidHex, hexToRgb } from '@/utils/colors'

// 验证颜色格式
if (isValidHex(userInput)) {
  const rgb = hexToRgb(userInput)
  console.log('RGB:', rgb)
}
```

## 🔍 颜色验证

### isValidHex

验证hex颜色格式是否有效。

```typescript
isValidHex(hex: string): boolean
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `hex` | `string` | 是 | 待验证的hex颜色值 |

**返回值：**
- `boolean` - 是否为有效的hex颜色格式

**实现原理：**
```typescript
export const isValidHex = (hex: string): boolean => {
  if (!hex) return false
  const cleanHex = hex.trim().replace(/^#/, '')
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)
}
```

**使用示例：**

```typescript
import { isValidHex } from '@/utils/colors'

// 有效的hex颜色
isValidHex('#5d87ff')   // true - 标准6位格式
isValidHex('#FFF')      // true - 3位缩写格式
isValidHex('5d87ff')    // true - 无#前缀
isValidHex('#fff')      // true - 小写
isValidHex('#ABC123')   // true - 大写

// 无效的hex颜色
isValidHex('#12345')    // false - 长度错误(5位)
isValidHex('')          // false - 空字符串
isValidHex('invalid')   // false - 非法字符
isValidHex('#GGGGGG')   // false - 非法十六进制字符
isValidHex(null as any) // false - null值

// 表单验证应用
const colorValidator = (rule: any, value: string, callback: Function) => {
  if (value && !isValidHex(value)) {
    callback(new Error('请输入有效的颜色值 (如 #5d87ff)'))
  } else {
    callback()
  }
}
```

### isValidRgb

验证RGB颜色值是否在有效范围内。

```typescript
isValidRgb(r: number, g: number, b: number): boolean
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `r` | `number` | 是 | 红色值 (0-255) |
| `g` | `number` | 是 | 绿色值 (0-255) |
| `b` | `number` | 是 | 蓝色值 (0-255) |

**返回值：**
- `boolean` - 是否为有效的RGB值

**实现原理：**
```typescript
export const isValidRgb = (r: number, g: number, b: number): boolean => {
  const isValid = (value: number) => Number.isInteger(value) && value >= 0 && value <= 255
  return isValid(r) && isValid(g) && isValid(b)
}
```

**使用示例：**

```typescript
import { isValidRgb } from '@/utils/colors'

// 有效的RGB值
isValidRgb(93, 135, 255)  // true - 正常值
isValidRgb(0, 0, 0)       // true - 黑色
isValidRgb(255, 255, 255) // true - 白色
isValidRgb(128, 128, 128) // true - 灰色

// 无效的RGB值
isValidRgb(256, 100, 100)   // false - 超出最大值
isValidRgb(-1, 100, 100)    // false - 负数
isValidRgb(100.5, 100, 100) // false - 非整数
isValidRgb(NaN, 100, 100)   // false - NaN

// 颜色选择器验证
const validateRgbInput = (r: number, g: number, b: number): boolean => {
  if (!isValidRgb(r, g, b)) {
    ElMessage.error('RGB 值必须在 0-255 范围内的整数')
    return false
  }
  return true
}

// 使用示例
const handleColorChange = (r: number, g: number, b: number) => {
  if (validateRgbInput(r, g, b)) {
    applyColor(r, g, b)
  }
}
```

## 🔄 颜色转换

### hexToRgb

将hex颜色转换为RGB数组。

```typescript
hexToRgb(hex: string): number[]
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `hex` | `string` | 是 | hex颜色值 |

**返回值：**
- `number[]` - RGB数组 [r, g, b]

**实现原理：**
```typescript
export const hexToRgb = (hex: string): number[] => {
  // 边界处理：如果传入无效值，使用默认颜色
  if (!hex || typeof hex !== 'string' || !isValidHex(hex)) {
    console.warn(`Invalid hex color "${hex}", using default color "#5d87ff"`)
    return [93, 135, 255] // 默认颜色的RGB值
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
    return [93, 135, 255]
  }

  return hexPairs.map((pair) => parseInt(pair, 16))
}
```

**使用示例：**

```typescript
import { hexToRgb } from '@/utils/colors'

// 基本转换
const rgb1 = hexToRgb('#5d87ff')
// 返回: [93, 135, 255]

const rgb2 = hexToRgb('#FFF')
// 返回: [255, 255, 255] (自动展开缩写)

const rgb3 = hexToRgb('ff0000')
// 返回: [255, 0, 0] (自动处理无#前缀)

// 处理无效输入时返回默认颜色
const rgb4 = hexToRgb('invalid')
// 返回: [93, 135, 255] 并打印警告

// 实际应用：设置 Canvas 颜色
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
const [r, g, b] = hexToRgb('#5d87ff')
ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
ctx.fillRect(0, 0, 100, 100)

// 实际应用：颜色分析
const analyzeColor = (hex: string) => {
  const [r, g, b] = hexToRgb(hex)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return {
    rgb: [r, g, b],
    brightness,
    isLight: brightness > 128,
    isDark: brightness <= 128
  }
}

const analysis = analyzeColor('#5d87ff')
console.log(analysis)
// { rgb: [93, 135, 255], brightness: 141.7, isLight: true, isDark: false }
```

### rgbToHex

将RGB值转换为hex颜色。

```typescript
rgbToHex(r: number, g: number, b: number): string
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `r` | `number` | 是 | 红色值 (0-255) |
| `g` | `number` | 是 | 绿色值 (0-255) |
| `b` | `number` | 是 | 蓝色值 (0-255) |

**返回值：**
- `string` - hex颜色值（带#前缀）

**实现原理：**
```typescript
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

// 基本转换
const hex1 = rgbToHex(93, 135, 255)
// 返回: '#5d87ff'

const hex2 = rgbToHex(255, 255, 255)
// 返回: '#ffffff'

const hex3 = rgbToHex(0, 0, 0)
// 返回: '#000000'

// 自动修复无效的 RGB 值
const hex4 = rgbToHex(300, -10, 100.7)
// 返回: '#ff0065' (修复为: 255, 0, 101) 并打印警告

// 实际应用：从 RGB 滑块生成 hex 值
const rSlider = ref(93)
const gSlider = ref(135)
const bSlider = ref(255)

const hexColor = computed(() => {
  return rgbToHex(rSlider.value, gSlider.value, bSlider.value)
})

// 实际应用：颜色选择器
const colorPickerComponent = {
  setup() {
    const red = ref(0)
    const green = ref(0)
    const blue = ref(0)

    const hexValue = computed(() => rgbToHex(red.value, green.value, blue.value))

    const updateFromHex = (hex: string) => {
      const [r, g, b] = hexToRgb(hex)
      red.value = r
      green.value = g
      blue.value = b
    }

    return { red, green, blue, hexValue, updateFromHex }
  }
}
```

### hexToRgba

将hex颜色转换为RGBA格式。

```typescript
hexToRgba(hex: string, opacity: number): RgbaResult
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `hex` | `string` | 是 | hex颜色值 |
| `opacity` | `number` | 是 | 透明度 (0-1) |

**返回值：**
- `RgbaResult` - 包含RGB值和RGBA字符串的对象

**类型定义：**
```typescript
interface RgbaResult {
  red: number      // 红色值 (0-255)
  green: number    // 绿色值 (0-255)
  blue: number     // 蓝色值 (0-255)
  rgba: string     // RGBA 字符串 'rgba(r, g, b, a)'
}
```

**实现原理：**
```typescript
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

// 基本用法
const rgba1 = hexToRgba('#5d87ff', 0.5)
// 返回: { red: 93, green: 135, blue: 255, rgba: 'rgba(93, 135, 255, 0.50)' }

const rgba2 = hexToRgba('#FFF', 0.8)
// 返回: { red: 255, green: 255, blue: 255, rgba: 'rgba(255, 255, 255, 0.80)' }

// 透明度自动限制在 0-1 范围
const rgba3 = hexToRgba('#5d87ff', 1.5)
// 透明度会被修正为 1.0

const rgba4 = hexToRgba('#5d87ff', -0.5)
// 透明度会被修正为 0.0

// 实际应用：半透明遮罩层
const overlayStyle = computed(() => {
  const { rgba } = hexToRgba(themeColor.value, 0.3)
  return {
    backgroundColor: rgba
  }
})

// 实际应用：渐变透明效果
const createGradientOverlay = (color: string) => {
  const colors = [
    hexToRgba(color, 0.0).rgba,
    hexToRgba(color, 0.5).rgba,
    hexToRgba(color, 1.0).rgba
  ]
  return `linear-gradient(to bottom, ${colors.join(', ')})`
}

// 实际应用：阴影效果
const shadowStyle = computed(() => {
  const { rgba } = hexToRgba(primaryColor.value, 0.25)
  return {
    boxShadow: `0 4px 12px ${rgba}`
  }
})
```

## 🎨 颜色混合与调节

### blendColor

按指定比例混合两种颜色。

```typescript
blendColor(color1: string, color2: string, ratio: number): string
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `color1` | `string` | 是 | 第一个颜色 |
| `color2` | `string` | 是 | 第二个颜色 |
| `ratio` | `number` | 是 | 混合比例 (0-1)，0表示纯color1，1表示纯color2 |

**返回值：**
- `string` - 混合后的hex颜色

**实现原理：**
```typescript
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

const color1 = '#5d87ff' // 蓝色
const color2 = '#ff5d87' // 粉色

// 不同比例混合
const blend0 = blendColor(color1, color2, 0)   // 纯color1: '#5d87ff'
const blend25 = blendColor(color1, color2, 0.25) // 75% color1 + 25% color2
const blend50 = blendColor(color1, color2, 0.5)  // 50-50 混合
const blend75 = blendColor(color1, color2, 0.75) // 25% color1 + 75% color2
const blend100 = blendColor(color1, color2, 1)   // 纯color2: '#ff5d87'

// 实际应用：渐变色生成
const generateGradientColors = (startColor: string, endColor: string, steps: number) => {
  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    colors.push(blendColor(startColor, endColor, ratio))
  }
  return colors
}

// 生成 5 级渐变
const gradientColors = generateGradientColors('#5d87ff', '#ff5d87', 5)
// 返回: ['#5d87ff', '#8e72d3', '#ae72c3', '#d7519f', '#ff5d87']

// 实际应用：悬停状态颜色
const createHoverColor = (baseColor: string) => {
  return blendColor(baseColor, '#ffffff', 0.1) // 与白色混合10%
}

// 实际应用：多色渐变
const createMultiColorGradient = (colors: string[], steps: number) => {
  if (colors.length < 2) return colors

  const result: string[] = []
  const segmentSteps = Math.ceil(steps / (colors.length - 1))

  for (let i = 0; i < colors.length - 1; i++) {
    const segment = generateGradientColors(colors[i], colors[i + 1], segmentSteps)
    if (i > 0) segment.shift() // 避免重复
    result.push(...segment)
  }

  return result.slice(0, steps)
}
```

### lightenColor

调亮颜色。

```typescript
lightenColor(color: string, level: number, isDark?: boolean): string
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `color` | `string` | 是 | 原始颜色 |
| `level` | `number` | 是 | 调亮程度 (0-1) |
| `isDark` | `boolean` | 否 | 是否为暗色主题，默认false |

**返回值：**
- `string` - 调亮后的hex颜色

**实现原理：**
```typescript
export const lightenColor = (color: string, level: number, isDark: boolean = false): string => {
  // 边界处理：确保有效的调亮级别
  const validLevel = typeof level === 'number' && !isNaN(level)
    ? Math.max(0, Math.min(1, level))
    : 0.1

  // 如果是暗色主题，使用darkenColor处理
  if (isDark) {
    return darkenColor(color, validLevel)
  }

  const rgb = hexToRgb(color)
  const lightRgb = rgb.map((value) => Math.floor((255 - value) * validLevel + value))

  return rgbToHex(lightRgb[0], lightRgb[1], lightRgb[2])
}
```

**使用示例：**

```typescript
import { lightenColor } from '@/utils/colors'

const baseColor = '#5d87ff'

// 不同级别调亮
const lighter10 = lightenColor(baseColor, 0.1) // 调亮 10%
const lighter30 = lightenColor(baseColor, 0.3) // 调亮 30%
const lighter50 = lightenColor(baseColor, 0.5) // 调亮 50%
const lighter80 = lightenColor(baseColor, 0.8) // 调亮 80%

// 暗色主题下的调亮 (实际上会调暗)
const lighterDark = lightenColor(baseColor, 0.2, true)
// 相当于 darkenColor(baseColor, 0.2)

// 实际应用：悬停效果
const buttonStyle = computed(() => {
  return {
    backgroundColor: baseColor,
    '--hover-bg': lightenColor(baseColor, 0.1)
  }
})

// 实际应用：生成主题色阶
const generateLightPalette = (primaryColor: string) => {
  return {
    primary: primaryColor,
    'light-1': lightenColor(primaryColor, 0.1),
    'light-2': lightenColor(primaryColor, 0.2),
    'light-3': lightenColor(primaryColor, 0.3),
    'light-4': lightenColor(primaryColor, 0.4),
    'light-5': lightenColor(primaryColor, 0.5),
    'light-6': lightenColor(primaryColor, 0.6),
    'light-7': lightenColor(primaryColor, 0.7),
    'light-8': lightenColor(primaryColor, 0.8),
    'light-9': lightenColor(primaryColor, 0.9)
  }
}

// 实际应用：禁用状态颜色
const disabledColor = lightenColor(primaryColor.value, 0.5)
```

### darkenColor

调暗颜色。

```typescript
darkenColor(color: string, level: number): string
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `color` | `string` | 是 | 原始颜色 |
| `level` | `number` | 是 | 调暗程度 (0-1) |

**返回值：**
- `string` - 调暗后的hex颜色

**实现原理：**
```typescript
export const darkenColor = (color: string, level: number): string => {
  // 边界处理：确保有效的调暗级别
  const validLevel = typeof level === 'number' && !isNaN(level)
    ? Math.max(0, Math.min(1, level))
    : 0.1

  const rgb = hexToRgb(color)
  const darkRgb = rgb.map((value) => Math.floor(value * (1 - validLevel)))

  return rgbToHex(darkRgb[0], darkRgb[1], darkRgb[2])
}
```

**使用示例：**

```typescript
import { darkenColor } from '@/utils/colors'

const baseColor = '#5d87ff'

// 不同级别调暗
const darker10 = darkenColor(baseColor, 0.1) // 调暗 10%
const darker30 = darkenColor(baseColor, 0.3) // 调暗 30%
const darker50 = darkenColor(baseColor, 0.5) // 调暗 50%
const darker80 = darkenColor(baseColor, 0.8) // 调暗 80%

// 实际应用：按钮阴影
const buttonShadowStyle = computed(() => {
  const shadowColor = darkenColor(themeColor.value, 0.3)
  return {
    boxShadow: `0 4px 8px ${shadowColor}`
  }
})

// 实际应用：按下状态颜色
const pressedColor = darkenColor(primaryColor.value, 0.1)

// 实际应用：生成暗色色阶
const generateDarkPalette = (primaryColor: string) => {
  return {
    primary: primaryColor,
    'dark-1': darkenColor(primaryColor, 0.1),
    'dark-2': darkenColor(primaryColor, 0.2),
    'dark-3': darkenColor(primaryColor, 0.3),
    'dark-4': darkenColor(primaryColor, 0.4),
    'dark-5': darkenColor(primaryColor, 0.5)
  }
}

// 实际应用：边框颜色
const borderColor = darkenColor(backgroundColor.value, 0.1)
```

## 🌐 CSS变量

### getCssVar

获取CSS变量值。

```typescript
getCssVar(name: string): string
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `name` | `string` | 是 | CSS变量名（带--前缀） |

**返回值：**
- `string` - CSS变量的值

**实现原理：**
```typescript
export const getCssVar = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}
```

**使用示例：**

```typescript
import { getCssVar } from '@/utils/colors'

// 获取 Element Plus 主题色
const primaryColor = getCssVar('--el-color-primary')
const successColor = getCssVar('--el-color-success')
const warningColor = getCssVar('--el-color-warning')
const dangerColor = getCssVar('--el-color-danger')
const infoColor = getCssVar('--el-color-info')

// 获取其他 CSS 变量
const fontSize = getCssVar('--el-font-size-base')
const borderRadius = getCssVar('--el-border-radius-base')

// 实际应用：获取完整主题配置
const getThemeColors = () => {
  return {
    primary: getCssVar('--el-color-primary'),
    success: getCssVar('--el-color-success'),
    warning: getCssVar('--el-color-warning'),
    danger: getCssVar('--el-color-danger'),
    info: getCssVar('--el-color-info')
  }
}

// 实际应用：动态读取主题并生成派生色
const generateDerivedColors = () => {
  const primary = getCssVar('--el-color-primary').trim()

  return {
    primary,
    primaryLight: lightenColor(primary, 0.3),
    primaryDark: darkenColor(primary, 0.2),
    primaryAlpha: hexToRgba(primary, 0.1).rgba
  }
}

// 实际应用：主题同步
const syncThemeColors = () => {
  const colors = getThemeColors()

  Object.entries(colors).forEach(([key, value]) => {
    console.log(`${key}: ${value}`)
  })

  return colors
}
```

## 🏗️ 实际应用场景

### 1. 完整主题色系生成

```typescript
import { lightenColor, darkenColor } from '@/utils/colors'

// 基于主色生成完整的主题色系（参考 Element Plus）
const generateThemePalette = (primaryColor: string) => {
  return {
    // 主色
    primary: primaryColor,

    // 亮色系列（用于背景、悬停等）
    'primary-light-1': lightenColor(primaryColor, 0.1),
    'primary-light-2': lightenColor(primaryColor, 0.2),
    'primary-light-3': lightenColor(primaryColor, 0.3),
    'primary-light-4': lightenColor(primaryColor, 0.4),
    'primary-light-5': lightenColor(primaryColor, 0.5),
    'primary-light-6': lightenColor(primaryColor, 0.6),
    'primary-light-7': lightenColor(primaryColor, 0.7),
    'primary-light-8': lightenColor(primaryColor, 0.8),
    'primary-light-9': lightenColor(primaryColor, 0.9),

    // 暗色系列（用于按下状态、边框等）
    'primary-dark-1': darkenColor(primaryColor, 0.1),
    'primary-dark-2': darkenColor(primaryColor, 0.2)
  }
}

// 使用示例
const themePalette = generateThemePalette('#5d87ff')

// 应用到 CSS 变量
const applyThemePalette = (palette: Record<string, string>) => {
  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--el-color-${key}`, value)
  })
}
```

### 2. 动态主题切换

```vue
<template>
  <div class="theme-picker">
    <el-color-picker
      v-model="themeColor"
      :predefine="predefineColors"
      @change="handleThemeChange"
    />
    <div class="color-preview">
      <div
        v-for="(color, key) in currentPalette"
        :key="key"
        class="color-item"
        :style="{ backgroundColor: color }"
      >
        <span>{{ key }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { lightenColor, darkenColor } from '@/utils/colors'

const themeColor = ref('#5d87ff')

const predefineColors = [
  '#5d87ff',
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399'
]

const currentPalette = computed(() => {
  const color = themeColor.value
  return {
    primary: color,
    'light-3': lightenColor(color, 0.3),
    'light-5': lightenColor(color, 0.5),
    'light-7': lightenColor(color, 0.7),
    'light-9': lightenColor(color, 0.9),
    'dark-2': darkenColor(color, 0.2)
  }
})

const handleThemeChange = (color: string | null) => {
  if (!color) return

  // 生成主题色系
  const palette = generateThemePalette(color)

  // 应用到 Element Plus CSS 变量
  document.documentElement.style.setProperty('--el-color-primary', color)

  Object.entries(palette).forEach(([key, value]) => {
    if (key.startsWith('primary-light-')) {
      const level = key.replace('primary-light-', '')
      document.documentElement.style.setProperty(
        `--el-color-primary-light-${level}`,
        value
      )
    } else if (key.startsWith('primary-dark-')) {
      const level = key.replace('primary-dark-', '')
      document.documentElement.style.setProperty(
        `--el-color-primary-dark-${level}`,
        value
      )
    }
  })
}

const generateThemePalette = (color: string) => {
  return {
    primary: color,
    'primary-light-3': lightenColor(color, 0.3),
    'primary-light-5': lightenColor(color, 0.5),
    'primary-light-7': lightenColor(color, 0.7),
    'primary-light-8': lightenColor(color, 0.8),
    'primary-light-9': lightenColor(color, 0.9),
    'primary-dark-2': darkenColor(color, 0.2)
  }
}
</script>

<style scoped>
.theme-picker {
  padding: 20px;
}

.color-preview {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.color-item {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-item span {
  font-size: 12px;
  color: #333;
  mix-blend-mode: difference;
}
</style>
```

### 3. 颜色渐变动画

```vue
<template>
  <div
    class="animated-box"
    :style="{ backgroundColor: currentColor }"
  >
    <span>动画盒子</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { blendColor } from '@/utils/colors'

const startColor = ref('#5d87ff')
const endColor = ref('#ff5d87')
const currentColor = ref(startColor.value)

let animationId: number
let progress = 0
let direction = 1

const animate = () => {
  progress += 0.005 * direction

  if (progress >= 1) {
    progress = 1
    direction = -1
  } else if (progress <= 0) {
    progress = 0
    direction = 1
  }

  currentColor.value = blendColor(startColor.value, endColor.value, progress)
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.animated-box {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
```

### 4. 表单颜色验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="主题颜色" prop="themeColor">
      <el-input
        v-model="form.themeColor"
        placeholder="请输入颜色值 (如 #5d87ff)"
      >
        <template #prefix>
          <div
            class="color-dot"
            :style="{ backgroundColor: validColor }"
          />
        </template>
        <template #append>
          <el-color-picker v-model="form.themeColor" size="small" />
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="RGB值" prop="rgbValues">
      <el-input-number v-model="form.red" :min="0" :max="255" />
      <el-input-number v-model="form.green" :min="0" :max="255" />
      <el-input-number v-model="form.blue" :min="0" :max="255" />
      <span class="rgb-preview">{{ rgbHexValue }}</span>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { isValidHex, isValidRgb, rgbToHex } from '@/utils/colors'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  themeColor: '#5d87ff',
  red: 93,
  green: 135,
  blue: 255
})

const validColor = computed(() => {
  return isValidHex(form.themeColor) ? form.themeColor : '#cccccc'
})

const rgbHexValue = computed(() => {
  if (isValidRgb(form.red, form.green, form.blue)) {
    return rgbToHex(form.red, form.green, form.blue)
  }
  return '#cccccc'
})

const rules: FormRules = {
  themeColor: [
    { required: true, message: '请输入主题颜色', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && !isValidHex(value)) {
          callback(new Error('请输入有效的颜色值 (如 #5d87ff 或 #FFF)'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
</script>

<style scoped>
.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
}

.rgb-preview {
  margin-left: 10px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
}

.el-input-number {
  margin-right: 8px;
  width: 100px;
}
</style>
```

### 5. 颜色对比度检查

```typescript
import { hexToRgb } from '@/utils/colors'

// 计算相对亮度（WCAG标准）
const getRelativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map(value => {
    const sRGB = value / 255
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// 计算对比度（WCAG标准）
const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

// WCAG等级判断
const getWCAGLevel = (ratio: number): {
  level: 'AAA' | 'AA' | 'Fail'
  largeText: 'AAA' | 'AA' | 'Fail'
  normalText: 'AAA' | 'AA' | 'Fail'
} => {
  return {
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
    largeText: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'Fail',
    normalText: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
  }
}

// 使用示例
const checkContrast = (foreground: string, background: string) => {
  const ratio = getContrastRatio(foreground, background)
  const wcag = getWCAGLevel(ratio)

  console.log(`对比度: ${ratio.toFixed(2)}:1`)
  console.log(`大文本: ${wcag.largeText}`)
  console.log(`正常文本: ${wcag.normalText}`)

  return { ratio, wcag }
}

// 检查白色文字在蓝色背景上的可读性
const result = checkContrast('#ffffff', '#5d87ff')
// 对比度: 3.45:1
// 大文本: AA
// 正常文本: Fail
```

### 6. 自动选择文字颜色

```typescript
import { hexToRgb } from '@/utils/colors'

// 根据背景色自动选择文字颜色
const getTextColorForBackground = (backgroundColor: string): '#000000' | '#ffffff' => {
  const [r, g, b] = hexToRgb(backgroundColor)

  // 使用 YIQ 公式计算亮度
  const yiq = (r * 299 + g * 587 + b * 114) / 1000

  return yiq >= 128 ? '#000000' : '#ffffff'
}

// 使用示例
const bgColor = '#5d87ff'
const textColor = getTextColorForBackground(bgColor)
console.log(textColor) // '#ffffff'

// 在组件中使用
const tagStyle = computed(() => {
  const bg = tagColor.value
  return {
    backgroundColor: bg,
    color: getTextColorForBackground(bg)
  }
})
```

## 🧪 测试

### 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import {
  isValidHex,
  isValidRgb,
  hexToRgb,
  rgbToHex,
  hexToRgba,
  blendColor,
  lightenColor,
  darkenColor
} from '@/utils/colors'

describe('颜色工具函数测试', () => {
  describe('isValidHex', () => {
    it('应该验证有效的6位hex颜色', () => {
      expect(isValidHex('#5d87ff')).toBe(true)
      expect(isValidHex('#FFFFFF')).toBe(true)
      expect(isValidHex('#000000')).toBe(true)
    })

    it('应该验证有效的3位hex颜色', () => {
      expect(isValidHex('#FFF')).toBe(true)
      expect(isValidHex('#abc')).toBe(true)
    })

    it('应该验证无#前缀的颜色', () => {
      expect(isValidHex('5d87ff')).toBe(true)
      expect(isValidHex('FFF')).toBe(true)
    })

    it('应该拒绝无效的hex颜色', () => {
      expect(isValidHex('')).toBe(false)
      expect(isValidHex('#12345')).toBe(false)
      expect(isValidHex('invalid')).toBe(false)
      expect(isValidHex('#GGGGGG')).toBe(false)
    })
  })

  describe('isValidRgb', () => {
    it('应该验证有效的RGB值', () => {
      expect(isValidRgb(0, 0, 0)).toBe(true)
      expect(isValidRgb(255, 255, 255)).toBe(true)
      expect(isValidRgb(93, 135, 255)).toBe(true)
    })

    it('应该拒绝超出范围的值', () => {
      expect(isValidRgb(256, 0, 0)).toBe(false)
      expect(isValidRgb(-1, 0, 0)).toBe(false)
    })

    it('应该拒绝非整数值', () => {
      expect(isValidRgb(100.5, 0, 0)).toBe(false)
    })
  })

  describe('hexToRgb', () => {
    it('应该正确转换6位hex颜色', () => {
      expect(hexToRgb('#5d87ff')).toEqual([93, 135, 255])
      expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
      expect(hexToRgb('#000000')).toEqual([0, 0, 0])
    })

    it('应该正确转换3位hex颜色', () => {
      expect(hexToRgb('#FFF')).toEqual([255, 255, 255])
      expect(hexToRgb('#000')).toEqual([0, 0, 0])
    })

    it('应该对无效输入返回默认值', () => {
      expect(hexToRgb('invalid')).toEqual([93, 135, 255])
      expect(hexToRgb('')).toEqual([93, 135, 255])
    })
  })

  describe('rgbToHex', () => {
    it('应该正确转换RGB值', () => {
      expect(rgbToHex(93, 135, 255)).toBe('#5d87ff')
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
    })

    it('应该自动修复超出范围的值', () => {
      expect(rgbToHex(300, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(-10, 0, 0)).toBe('#000000')
    })
  })

  describe('hexToRgba', () => {
    it('应该正确生成RGBA字符串', () => {
      const result = hexToRgba('#5d87ff', 0.5)
      expect(result.red).toBe(93)
      expect(result.green).toBe(135)
      expect(result.blue).toBe(255)
      expect(result.rgba).toBe('rgba(93, 135, 255, 0.50)')
    })

    it('应该限制透明度在0-1范围', () => {
      const result1 = hexToRgba('#5d87ff', 1.5)
      expect(result1.rgba).toContain('1.00')

      const result2 = hexToRgba('#5d87ff', -0.5)
      expect(result2.rgba).toContain('0.00')
    })
  })

  describe('blendColor', () => {
    it('应该正确混合两种颜色', () => {
      // 50-50 混合
      const blended = blendColor('#000000', '#ffffff', 0.5)
      expect(blended).toBe('#808080') // 灰色
    })

    it('ratio为0时应返回第一个颜色', () => {
      expect(blendColor('#ff0000', '#0000ff', 0)).toBe('#ff0000')
    })

    it('ratio为1时应返回第二个颜色', () => {
      expect(blendColor('#ff0000', '#0000ff', 1)).toBe('#0000ff')
    })
  })

  describe('lightenColor', () => {
    it('应该正确调亮颜色', () => {
      const lightened = lightenColor('#000000', 0.5)
      expect(lightened).toBe('#808080') // 50% 调亮后应该是灰色
    })

    it('level为0时应返回原色', () => {
      expect(lightenColor('#5d87ff', 0)).toBe('#5d87ff')
    })

    it('level为1时应返回白色', () => {
      expect(lightenColor('#5d87ff', 1)).toBe('#ffffff')
    })
  })

  describe('darkenColor', () => {
    it('应该正确调暗颜色', () => {
      const darkened = darkenColor('#ffffff', 0.5)
      expect(darkened).toBe('#808080') // 50% 调暗后应该是灰色
    })

    it('level为0时应返回原色', () => {
      expect(darkenColor('#5d87ff', 0)).toBe('#5d87ff')
    })

    it('level为1时应返回黑色', () => {
      expect(darkenColor('#5d87ff', 1)).toBe('#000000')
    })
  })
})
```

## 📊 性能优化

### 颜色计算缓存

```typescript
// 使用 Map 缓存颜色计算结果
const colorCache = new Map<string, any>()

const cachedHexToRgb = (hex: string): number[] => {
  const cacheKey = `hexToRgb:${hex}`

  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)
  }

  const result = hexToRgb(hex)
  colorCache.set(cacheKey, result)
  return result
}

const cachedLightenColor = (color: string, level: number): string => {
  const cacheKey = `lighten:${color}:${level}`

  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)
  }

  const result = lightenColor(color, level)
  colorCache.set(cacheKey, result)
  return result
}

// 清理缓存
const clearColorCache = () => {
  colorCache.clear()
}

// 限制缓存大小
const MAX_CACHE_SIZE = 1000
const maintainCacheSize = () => {
  if (colorCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(colorCache.keys()).slice(0, colorCache.size - MAX_CACHE_SIZE)
    keysToDelete.forEach(key => colorCache.delete(key))
  }
}
```

### 批量处理优化

```typescript
// 批量生成主题色板
const generatePaletteBatch = (colors: string[]) => {
  return colors.map(color => ({
    color,
    palette: {
      light3: lightenColor(color, 0.3),
      light5: lightenColor(color, 0.5),
      light7: lightenColor(color, 0.7),
      light9: lightenColor(color, 0.9),
      dark2: darkenColor(color, 0.2)
    }
  }))
}

// 使用 Web Worker 处理大量颜色计算
const colorWorker = new Worker('/workers/color-worker.js')

const processColorsAsync = (colors: string[]): Promise<any[]> => {
  return new Promise((resolve) => {
    colorWorker.postMessage({ type: 'generatePalettes', colors })
    colorWorker.onmessage = (e) => {
      resolve(e.data)
    }
  })
}
```

## 📚 API 参考

### 颜色验证

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `isValidHex` | `hex: string` | `boolean` | 验证 hex 颜色格式 |
| `isValidRgb` | `r: number, g: number, b: number` | `boolean` | 验证 RGB 值 (0-255) |

### 颜色转换

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `hexToRgb` | `hex: string` | `number[]` | hex 转 RGB 数组 [r, g, b] |
| `rgbToHex` | `r: number, g: number, b: number` | `string` | RGB 转 hex 字符串 |
| `hexToRgba` | `hex: string, opacity: number` | `RgbaResult` | hex 转 RGBA 对象 |

### 颜色处理

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `blendColor` | `color1: string, color2: string, ratio: number` | `string` | 混合两种颜色 |
| `lightenColor` | `color: string, level: number, isDark?: boolean` | `string` | 调亮颜色 |
| `darkenColor` | `color: string, level: number` | `string` | 调暗颜色 |

### CSS 变量

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getCssVar` | `name: string` | `string` | 获取 CSS 变量值 |

## 🔍 类型定义

```typescript
/**
 * RGBA 转换结果接口
 */
interface RgbaResult {
  /** 红色值 (0-255) */
  red: number
  /** 绿色值 (0-255) */
  green: number
  /** 蓝色值 (0-255) */
  blue: number
  /** RGBA 字符串 'rgba(r, g, b, a)' */
  rgba: string
}

/**
 * 主题色板接口
 */
interface ThemePalette {
  primary: string
  'primary-light-1': string
  'primary-light-2': string
  'primary-light-3': string
  'primary-light-4': string
  'primary-light-5': string
  'primary-light-6': string
  'primary-light-7': string
  'primary-light-8': string
  'primary-light-9': string
  'primary-dark-1': string
  'primary-dark-2': string
}

/**
 * 颜色分析结果接口
 */
interface ColorAnalysis {
  rgb: number[]
  brightness: number
  isLight: boolean
  isDark: boolean
}

/**
 * WCAG 对比度结果接口
 */
interface WCAGResult {
  level: 'AAA' | 'AA' | 'Fail'
  largeText: 'AAA' | 'AA' | 'Fail'
  normalText: 'AAA' | 'AA' | 'Fail'
}
```

## 🎯 最佳实践

### 1. 始终验证用户输入

```typescript
// ✅ 推荐：使用前验证
if (isValidHex(userInputColor)) {
  applyThemeColor(userInputColor)
} else {
  ElMessage.error('请输入有效的颜色值')
}

// ❌ 不推荐：直接使用未验证的输入
applyThemeColor(userInputColor) // 可能导致错误
```

### 2. 利用边界处理

```typescript
// ✅ 推荐：函数内置边界处理
const rgb = hexToRgb(userInput) // 无效输入返回默认值
const hex = rgbToHex(300, -10, 100) // 自动修复为有效范围

// ✅ 也可以结合验证使用
if (isValidHex(userInput)) {
  const rgb = hexToRgb(userInput) // 确保有效
}
```

### 3. 缓存计算结果

```typescript
// ✅ 推荐：缓存计算结果
const themePalette = computed(() => {
  return generateThemePalette(themeColor.value)
})

// ❌ 不推荐：在模板中重复计算
<div :style="{ color: lightenColor(theme, 0.1) }">
  <span :style="{ borderColor: lightenColor(theme, 0.1) }">
  </span>
</div>
```

### 4. 类型安全

```typescript
// ✅ 推荐：使用 TypeScript 类型
const rgba: RgbaResult = hexToRgba('#5d87ff', 0.5)
const rgb: number[] = hexToRgb('#5d87ff')

// ✅ 推荐：参数验证
const adjustColor = (color: string, level: number): string => {
  if (!isValidHex(color)) {
    throw new Error('Invalid hex color')
  }
  if (level < 0 || level > 1) {
    throw new Error('Level must be between 0 and 1')
  }
  return lightenColor(color, level)
}
```

## 📝 常见问题

### 1. 颜色转换后偏差

**问题原因：**
- RGB值取整导致的精度损失
- 多次转换累积误差

**解决方案：**
```typescript
// 避免多次往返转换
const original = '#5d87ff'
const rgb = hexToRgb(original)
// 直接使用 rgb 数组，而不是再转回 hex
ctx.fillStyle = `rgb(${rgb.join(', ')})`
```

### 2. 暗色主题颜色不正确

**问题原因：**
- 未使用 isDark 参数
- 调亮调暗方向相反

**解决方案：**
```typescript
// 使用 isDark 参数
const hoverColor = lightenColor(baseColor, 0.1, isDarkTheme.value)
```

### 3. CSS变量获取为空

**问题原因：**
- 变量未定义
- 时机问题（DOM未渲染）

**解决方案：**
```typescript
// 确保在 mounted 后获取
onMounted(() => {
  const primaryColor = getCssVar('--el-color-primary').trim()
  if (primaryColor) {
    // 使用颜色
  }
})
```

## ⚠️ 注意事项

1. **hex 格式**: 支持 3 位和 6 位格式，可以带或不带 `#` 前缀
2. **RGB 范围**: RGB 值必须在 0-255 范围内的整数
3. **透明度范围**: opacity 参数必须在 0-1 范围内
4. **默认值**: 无效输入会使用默认颜色 `#5d87ff` 并打印警告
5. **自动修复**: RGB 转换会自动修复超出范围的值
6. **暗色主题**: `lightenColor` 的 `isDark` 参数会反转调整方向
7. **性能**: 对于频繁的颜色计算，建议使用缓存
8. **浏览器兼容**: getCssVar 依赖 getComputedStyle，需注意兼容性
