# 颜色处理工具 (colors)

颜色处理相关工具函数，提供颜色验证、转换、混合和主题设置等功能。

## 📋 功能特性

- **颜色验证**: 验证 hex 和 RGB 颜色格式
- **颜色转换**: hex ↔ RGB 相互转换，支持 RGBA
- **颜色混合**: 按比例混合两种颜色
- **颜色调节**: 调亮调暗颜色
- **主题设置**: Element Plus 主题颜色设置
- **CSS 变量**: 获取 CSS 变量值
- **边界处理**: 完善的参数验证和默认值处理

## 🎯 基础用法

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

## 🔍 颜色验证

### 验证 hex 颜色格式

```typescript
// 验证 hex 颜色是否有效
isValidHex('#5d87ff') // true
isValidHex('#FFF')    // true (支持缩写)
isValidHex('5d87ff')  // true (可以省略#)
isValidHex('#12345')  // false (长度错误)
isValidHex('')        // false (空字符串)
isValidHex('invalid') // false (非法格式)

// 在表单验证中使用
const colorValidator = (rule: any, value: string, callback: Function) => {
  if (value && !isValidHex(value)) {
    callback(new Error('请输入有效的颜色值 (如 #5d87ff)'))
  } else {
    callback()
  }
}
```

### 验证 RGB 颜色值

```typescript
// 验证 RGB 值是否有效 (0-255范围的整数)
isValidRgb(93, 135, 255)  // true
isValidRgb(0, 0, 0)       // true (黑色)
isValidRgb(255, 255, 255) // true (白色)
isValidRgb(256, 100, 100) // false (超出范围)
isValidRgb(100.5, 100, 100) // false (非整数)
isValidRgb(-1, 100, 100)  // false (负数)

// 在自定义颜色选择器中使用
const validateRgbInput = (r: number, g: number, b: number) => {
  if (!isValidRgb(r, g, b)) {
    ElMessage.error('RGB 值必须在 0-255 范围内的整数')
    return false
  }
  return true
}
```

## 🔄 颜色转换

### hex 转 RGB

```typescript
// 将 hex 颜色转换为 RGB 数组
const rgb1 = hexToRgb('#5d87ff')
// 返回: [93, 135, 255]

const rgb2 = hexToRgb('#FFF')
// 返回: [255, 255, 255] (自动展开缩写)

// 处理无效输入时返回默认颜色
const rgb3 = hexToRgb('invalid')
// 返回: [93, 135, 255] (默认值) 并打印警告

// 实际应用：设置 canvas 颜色
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
const [r, g, b] = hexToRgb('#5d87ff')
ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
```

### RGB 转 hex

```typescript
// 将 RGB 值转换为 hex 颜色
const hex1 = rgbToHex(93, 135, 255)
// 返回: '#5d87ff'

const hex2 = rgbToHex(255, 255, 255)
// 返回: '#ffffff'

// 自动修复无效的 RGB 值
const hex3 = rgbToHex(300, -10, 100.7)
// 返回: '#ff0065' (修复为: 255, 0, 101) 并打印警告

// 实际应用：从 RGB 滑块生成 hex 值
const rSlider = ref(93)
const gSlider = ref(135)
const bSlider = ref(255)

const hexColor = computed(() => {
  return rgbToHex(rSlider.value, gSlider.value, bSlider.value)
})
```

### hex 转 RGBA

```typescript
// 将 hex 颜色转换为 RGBA 格式
const rgba1 = hexToRgba('#5d87ff', 0.5)
// 返回: { red: 93, green: 135, blue: 255, rgba: 'rgba(93, 135, 255, 0.50)' }

const rgba2 = hexToRgba('#FFF', 0.8)
// 返回: { red: 255, green: 255, blue: 255, rgba: 'rgba(255, 255, 255, 0.80)' }

// 透明度自动限制在 0-1 范围
const rgba3 = hexToRgba('#5d87ff', 1.5)
// 透明度会被修正为 1.0

// 实际应用：半透明遮罩层
const overlayStyle = computed(() => {
  const { rgba } = hexToRgba(themeColor.value, 0.3)
  return {
    backgroundColor: rgba
  }
})
```

## 🎨 颜色混合与调节

### 混合两种颜色

```typescript
// 按指定比例混合两种颜色
const color1 = '#5d87ff' // 蓝色
const color2 = '#ff5d87' // 粉色

// 50-50 混合
const mixed1 = blendColor(color1, color2, 0.5)
// 返回混合后的颜色

// 70% color1 + 30% color2
const mixed2 = blendColor(color1, color2, 0.3)

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
// 返回: ['#5d87ff', '#8d71eb', ..., '#ff5d87']
```

### 调亮颜色

```typescript
// 调亮颜色 (level: 0-1)
const baseColor = '#5d87ff'

const lighter1 = lightenColor(baseColor, 0.1) // 调亮 10%
const lighter2 = lightenColor(baseColor, 0.3) // 调亮 30%
const lighter3 = lightenColor(baseColor, 0.5) // 调亮 50%

// 暗色主题下的调亮 (实际上会调暗)
const lighterDark = lightenColor(baseColor, 0.2, true)

// 实际应用：悬停效果
const buttonStyle = computed(() => {
  return {
    backgroundColor: baseColor,
    '--hover-bg': lightenColor(baseColor, 0.1)
  }
})
```

### 调暗颜色

```typescript
// 调暗颜色 (level: 0-1)
const baseColor = '#5d87ff'

const darker1 = darkenColor(baseColor, 0.1) // 调暗 10%
const darker2 = darkenColor(baseColor, 0.3) // 调暗 30%
const darker3 = darkenColor(baseColor, 0.5) // 调暗 50%

// 实际应用：按钮阴影
const buttonShadowStyle = computed(() => {
  const shadowColor = darkenColor(themeColor.value, 0.3)
  return {
    boxShadow: `0 4px 8px ${shadowColor}`
  }
})
```

## 🎨 实际应用场景

### 主题色系生成

```typescript
// 基于主色生成完整的主题色系
const generateThemePalette = (primaryColor: string) => {
  return {
    primary: primaryColor,
    'primary-light-1': lightenColor(primaryColor, 0.1),
    'primary-light-2': lightenColor(primaryColor, 0.2),
    'primary-light-3': lightenColor(primaryColor, 0.3),
    'primary-dark-1': darkenColor(primaryColor, 0.1),
    'primary-dark-2': darkenColor(primaryColor, 0.2),
    'primary-dark-3': darkenColor(primaryColor, 0.3)
  }
}

// 使用示例
const themePalette = generateThemePalette('#5d87ff')
// 返回完整的主题色板
```

### 动态主题切换

```vue
<template>
  <div class="theme-picker">
    <el-color-picker
      v-model="themeColor"
      @change="handleThemeChange"
    />
  </div>
</template>

<script setup>
import { lightenColor, darkenColor } from '@/utils/colors'

const themeColor = ref('#5d87ff')

const handleThemeChange = (color: string) => {
  if (!color) return

  // 生成主题色系
  const palette = generateThemePalette(color)

  // 应用到 CSS 变量
  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(
      `--color-${key}`,
      value
    )
  })
}

const generateThemePalette = (color: string) => {
  return {
    primary: color,
    'primary-light': lightenColor(color, 0.2),
    'primary-lighter': lightenColor(color, 0.4),
    'primary-dark': darkenColor(color, 0.2),
    'primary-darker': darkenColor(color, 0.4)
  }
}
</script>
```

### 颜色渐变动画

```vue
<template>
  <div
    class="animated-box"
    :style="{ backgroundColor: currentColor }"
  >
    动画盒子
  </div>
</template>

<script setup>
import { blendColor } from '@/utils/colors'

const startColor = '#5d87ff'
const endColor = '#ff5d87'
const currentColor = ref(startColor)

// 使用 requestAnimationFrame 实现平滑过渡
let animationId: number
let progress = 0

const animate = () => {
  progress += 0.01

  if (progress <= 1) {
    currentColor.value = blendColor(startColor, endColor, progress)
    animationId = requestAnimationFrame(animate)
  } else {
    progress = 0
    // 反向动画
    ;[startColor, endColor] = [endColor, startColor]
    animationId = requestAnimationFrame(animate)
  }
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>
```

### 表单颜色验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <el-form-item label="主题颜色" prop="themeColor">
      <el-input
        v-model="form.themeColor"
        placeholder="请输入颜色值 (如 #5d87ff)"
      >
        <template #append>
          <div
            class="color-preview"
            :style="{ backgroundColor: form.themeColor }"
          />
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { isValidHex } from '@/utils/colors'

const form = reactive({
  themeColor: '#5d87ff'
})

const rules = {
  themeColor: [
    { required: true, message: '请输入主题颜色', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
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
.color-preview {
  width: 30px;
  height: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
```

## 🌐 获取 CSS 变量

### 基础用法

```typescript
// 获取 CSS 变量值
const primaryColor = getCssVar('--el-color-primary')
const fontSize = getCssVar('--el-font-size-base')

// 实际应用：动态获取主题色
const getThemeColors = () => {
  return {
    primary: getCssVar('--el-color-primary'),
    success: getCssVar('--el-color-success'),
    warning: getCssVar('--el-color-warning'),
    danger: getCssVar('--el-color-danger'),
    info: getCssVar('--el-color-info')
  }
}

// 在组件中使用
const themeColors = getThemeColors()
console.log('当前主题色:', themeColors.primary)
```

## 📚 API 参考

### 颜色验证

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| isValidHex | hex: string | boolean | 验证 hex 颜色格式 |
| isValidRgb | r: number, g: number, b: number | boolean | 验证 RGB 值 (0-255) |

### 颜色转换

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| hexToRgb | hex: string | number[] | hex 转 RGB 数组 [r, g, b] |
| rgbToHex | r: number, g: number, b: number | string | RGB 转 hex 字符串 |
| hexToRgba | hex: string, opacity: number | RgbaResult | hex 转 RGBA 对象 |

### 颜色处理

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| blendColor | color1: string, color2: string, ratio: number | string | 混合两种颜色 (ratio: 0-1) |
| lightenColor | color: string, level: number, isDark?: boolean | string | 调亮颜色 (level: 0-1) |
| darkenColor | color: string, level: number | string | 调暗颜色 (level: 0-1) |

### CSS 变量

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| getCssVar | name: string | string | 获取 CSS 变量值 |

### 类型定义

```typescript
interface RgbaResult {
  red: number      // 红色值 (0-255)
  green: number    // 绿色值 (0-255)
  blue: number     // 蓝色值 (0-255)
  rgba: string     // RGBA 字符串 'rgba(r, g, b, a)'
}
```

## 🎯 最佳实践

### 1. 颜色验证

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

### 2. 边界处理

```typescript
// ✅ 推荐：函数内置边界处理
const rgb = hexToRgb(userInput) // 无效输入返回默认值
const hex = rgbToHex(300, -10, 100) // 自动修复为有效范围

// ✅ 也可以结合验证使用
if (isValidHex(userInput)) {
  const rgb = hexToRgb(userInput) // 确保有效
}
```

### 3. 性能优化

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
const adjustColor = (color: string, level: number) => {
  if (!isValidHex(color)) {
    throw new Error('Invalid hex color')
  }
  if (level < 0 || level > 1) {
    throw new Error('Level must be between 0 and 1')
  }
  return lightenColor(color, level)
}
```

## ⚠️ 注意事项

1. **hex 格式**: 支持 3 位和 6 位格式，可以带或不带 `#` 前缀
2. **RGB 范围**: RGB 值必须在 0-255 范围内的整数
3. **透明度范围**: opacity 参数必须在 0-1 范围内
4. **默认值**: 无效输入会使用默认颜色 `#5d87ff` 并打印警告
5. **自动修复**: RGB 转换会自动修复超出范围的值
6. **暗色主题**: `lightenColor` 的 `isDark` 参数会反转调整方向

## 🔗 相关文档

- [主题系统](/frontend/styles/theme-system) - 主题配置和切换
- [样式架构](/frontend/styles/style-architecture) - 样式组织结构
- [UnoCSS 配置](/frontend/styles/unocss-config) - CSS 工具类配置
