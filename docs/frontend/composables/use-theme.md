# useTheme

主题管理组合函数，提供对应用主题的响应式管理功能。useTheme 是整个前端主题系统的核心入口，负责主题色的设置、切换、持久化以及 CSS 变量的动态应用。它与 useLayout 组合函数紧密协作，实现了完整的主题定制能力。

## 功能特性

useTheme 组合函数提供了完整的主题管理能力：

- **主题色设置** - 设置主色调并自动生成完整的色彩体系
- **主题重置** - 一键恢复默认主题色
- **颜色变体生成** - 自动生成 9 级亮色和 9 级暗色变体
- **CSS 变量应用** - 实时更新 Element Plus 主题色 CSS 变量
- **透明度支持** - 支持为颜色添加透明度通道
- **自动持久化** - 主题配置自动保存到本地存储
- **深色模式适配** - 与深色模式切换无缝集成

## 架构设计

### 依赖关系

useTheme 基于 useLayout 进行状态管理，形成清晰的依赖关系：

```text
┌─────────────────────────────────────────────────────────┐
│                    useTheme                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │  - currentTheme (响应式主题色)                   │    │
│  │  - setTheme() (设置主题色)                       │    │
│  │  - resetTheme() (重置主题)                       │    │
│  │  - generateThemeColors() (生成色彩体系)          │    │
│  │  - getLightColor() (生成亮色)                    │    │
│  │  - getDarkColor() (生成暗色)                     │    │
│  │  - addAlphaToHex() (添加透明度)                  │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓ 依赖                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  useLayout                        │    │
│  │  - theme: Ref<string> (主题色状态)               │    │
│  │  - dark: Ref<boolean> (深色模式状态)             │    │
│  │  - 自动持久化到 localStorage                      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         ↓ 依赖
┌─────────────────────────────────────────────────────────┐
│                    colors.ts                             │
│  - hexToRgb() (十六进制转 RGB)                          │
│  - rgbToHex() (RGB 转十六进制)                          │
│  - lightenColor() (计算亮色)                            │
│  - darkenColor() (计算暗色)                             │
│  - blendColor() (颜色混合)                              │
└─────────────────────────────────────────────────────────┘
```

### 状态管理机制

useTheme 采用单例模式，通过 useLayout 统一管理主题状态：

```typescript
// useLayout 内部的主题状态管理
const createLayoutState = () => {
  // 从本地缓存获取配置
  const cachedConfig = localCache.get<Record<string, any>>(CACHE_KEY) || {}

  // 主题色状态，默认使用系统预设主题色
  const theme = ref<string>(cachedConfig.theme ?? PREDEFINED_THEME_COLORS[0])

  // 深色模式状态
  const dark = useDark({
    selector: 'html',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'dark-mode',
    initialValue: cachedConfig.dark ?? 'auto'
  })

  return { theme, dark, /* ... */ }
}
```

### 持久化机制

主题配置通过 watchEffect 自动同步到本地存储：

```typescript
// 自动保存配置到本地存储
watchEffect(() => {
  localCache.set(CACHE_KEY, {
    theme: theme.value,
    dark: dark.value,
    // 其他布局配置...
  })
})
```

## 基础用法

### 基本主题切换

最简单的使用方式是直接获取和设置主题色：

```vue
<template>
  <div class="theme-demo">
    <div class="current-theme">
      <span>当前主题色：</span>
      <span
        class="color-block"
        :style="{ backgroundColor: currentTheme }"
      />
      <code>{{ currentTheme }}</code>
    </div>

    <div class="theme-actions">
      <el-color-picker
        v-model="selectedColor"
        @change="handleColorChange"
        :predefine="predefineColors"
      />
      <el-button @click="handleResetTheme" type="info">
        重置为默认主题
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme, resetTheme } = useTheme()

// 初始化选择器颜色为当前主题
const selectedColor = ref(currentTheme.value)

// 预定义的颜色选项
const predefineColors = [
  '#5D87FF',  // 默认蓝色
  '#B48DF3',  // 紫色
  '#1D84FF',  // 深蓝
  '#60C041',  // 绿色
  '#38C0FC',  // 青色
  '#FF6B6B',  // 珊瑚红
  '#FFB946',  // 橙色
  '#4ECDC4',  // 青绿色
]

// 颜色变化时应用主题
const handleColorChange = (color: string | null) => {
  if (color) {
    setTheme(color)
  }
}

// 重置主题
const handleResetTheme = () => {
  resetTheme()
  selectedColor.value = currentTheme.value
}

// 同步当前主题到选择器
watch(currentTheme, (newTheme) => {
  selectedColor.value = newTheme
})
</script>

<style scoped lang="scss">
.theme-demo {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.current-theme {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  .color-block {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color);
  }

  code {
    font-family: monospace;
    padding: 2px 8px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}

.theme-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
```

### 使用预设主题色

系统提供了一组预定义的主题色，可以快速切换：

```vue
<template>
  <div class="preset-themes">
    <h4>预设主题</h4>
    <div class="theme-grid">
      <div
        v-for="(theme, index) in PREDEFINED_THEME_COLORS"
        :key="index"
        class="theme-item"
        :class="{ active: currentTheme === theme }"
        :style="{ backgroundColor: theme }"
        @click="setTheme(theme)"
      >
        <el-icon v-if="currentTheme === theme">
          <Check />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Check } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'
import { PREDEFINED_THEME_COLORS } from '@/systemConfig'

const { currentTheme, setTheme } = useTheme()

// PREDEFINED_THEME_COLORS 的值：
// ['#5D87FF', '#B48DF3', '#1D84FF', '#60C041', '#38C0FC']
</script>

<style scoped lang="scss">
.preset-themes {
  h4 {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.theme-item {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.active {
    border-color: #fff;
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }

  .el-icon {
    color: #fff;
    font-size: 20px;
  }
}
</style>
```

### 获取主题色系

使用 generateThemeColors 可以获取完整的主题色系：

```vue
<template>
  <div class="color-palette-demo">
    <h4>主题色系预览</h4>

    <!-- 亮色系列 -->
    <div class="color-row">
      <span class="label">亮色系：</span>
      <div class="colors">
        <div
          v-for="(color, index) in themeColors.lightColors"
          :key="`light-${index}`"
          class="color-swatch"
          :style="{ backgroundColor: color }"
        >
          <span class="level">{{ index + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- 主色 -->
    <div class="color-row primary-row">
      <span class="label">主色：</span>
      <div class="colors">
        <div
          class="color-swatch primary"
          :style="{ backgroundColor: themeColors.primary }"
        >
          <span class="value">{{ themeColors.primary }}</span>
        </div>
      </div>
    </div>

    <!-- 暗色系列 -->
    <div class="color-row">
      <span class="label">暗色系：</span>
      <div class="colors">
        <div
          v-for="(color, index) in themeColors.darkColors"
          :key="`dark-${index}`"
          class="color-swatch"
          :style="{ backgroundColor: color }"
        >
          <span class="level">{{ index + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, generateThemeColors } = useTheme()

// 计算当前主题的完整色系
const themeColors = computed(() => generateThemeColors(currentTheme.value))

// themeColors 的结构：
// {
//   primary: '#5D87FF',
//   lightColors: ['#e8eeff', '#d1ddff', ...], // 9个亮色
//   darkColors: ['#4a6ccc', '#3851a6', ...]   // 9个暗色
// }
</script>

<style scoped lang="scss">
.color-palette-demo {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;

  h4 {
    margin-bottom: 20px;
  }
}

.color-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .label {
    width: 80px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .colors {
    display: flex;
    gap: 4px;
  }
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  .level {
    color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
    font-weight: 500;
  }

  &.primary {
    width: 120px;

    .value {
      color: #fff;
      font-size: 12px;
      font-family: monospace;
    }
  }
}

.primary-row .colors {
  margin-left: -40px;
}
</style>
```

## API 参考

### useTheme 返回值

```typescript
interface UseThemeReturn {
  /** 当前主题色（响应式） */
  currentTheme: Ref<string>

  /** 设置主题色并应用 CSS 变量 */
  setTheme: (color: string) => void

  /** 重置为默认主题色 */
  resetTheme: () => void

  /** 生成亮色变体 */
  getLightColor: (color: string, level: number) => string

  /** 生成暗色变体 */
  getDarkColor: (color: string, level: number) => string

  /** 生成完整的主题色系 */
  generateThemeColors: (color: string) => ThemeColors

  /** 为颜色添加透明度 */
  addAlphaToHex: (hex: string, alpha?: number) => string
}
```

### 状态属性

#### currentTheme

当前激活的主题色，这是一个响应式引用，与 useLayout 中的 theme 状态同步。

```typescript
const { currentTheme } = useTheme()

// 读取当前主题色
console.log(currentTheme.value) // '#5D87FF'

// 监听主题变化
watch(currentTheme, (newColor, oldColor) => {
  console.log(`主题从 ${oldColor} 切换到 ${newColor}`)
})
```

**类型定义：**

```typescript
currentTheme: Ref<string>
```

**特性：**
- 响应式数据，变化时视图自动更新
- 自动从本地存储恢复上次保存的值
- 默认值为 `PREDEFINED_THEME_COLORS[0]`（系统默认蓝色 `#5D87FF`）

### 主题操作方法

#### setTheme

设置新的主题色，并将其应用到整个应用程序。

```typescript
setTheme(color: string): void
```

**参数：**
- `color` - 新的主题色，格式为十六进制颜色值（如 `#5D87FF`）

**行为说明：**
1. 更新 currentTheme 响应式状态
2. 调用 generateThemeColors 生成完整色系
3. 调用 applyThemeColors 将颜色应用到 CSS 变量
4. 自动触发 useLayout 的持久化机制保存到本地存储

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 设置为紫色主题
setTheme('#B48DF3')

// 设置为自定义颜色
setTheme('#FF6B6B')
```

**应用的 CSS 变量：**

当调用 setTheme 时，会自动更新以下 CSS 变量：

```css
:root {
  /* 主色 */
  --el-color-primary: #5D87FF;

  /* 亮色变体 (1-9级) */
  --el-color-primary-light-1: #7d9fff;
  --el-color-primary-light-2: #9eb7ff;
  --el-color-primary-light-3: #becfff;
  --el-color-primary-light-4: #dee7ff;
  --el-color-primary-light-5: #eef3ff;
  --el-color-primary-light-6: #f3f7ff;
  --el-color-primary-light-7: #f7faff;
  --el-color-primary-light-8: #fbfcff;
  --el-color-primary-light-9: #fdfeff;

  /* 暗色变体 (1-2级) */
  --el-color-primary-dark-1: #4a6ccc;
  --el-color-primary-dark-2: #3851a6;
}
```

#### resetTheme

将主题色重置为系统默认值。

```typescript
resetTheme(): void
```

**行为说明：**
1. 将主题色重置为 `PREDEFINED_THEME_COLORS[0]`
2. 重新生成并应用默认色系的 CSS 变量
3. 更新本地存储中的配置

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { resetTheme } = useTheme()

// 重置为默认蓝色主题
resetTheme()
```

### 颜色工具方法

#### getLightColor

根据基础颜色和等级生成亮色变体。

```typescript
getLightColor(color: string, level: number): string
```

**参数：**
- `color` - 基础颜色，十六进制格式
- `level` - 亮度等级，范围 0-1，值越大颜色越浅

**返回值：**
- 生成的亮色变体，十六进制格式

**算法说明：**

亮色生成基于与白色的混合计算：

```typescript
// 内部实现原理
const getLightColor = (color: string, level: number): string => {
  const rgb = hexToRgb(color)
  // 与白色 [255, 255, 255] 进行混合
  const lightRgb = rgb.map(c => Math.round(c + (255 - c) * level))
  return rgbToHex(lightRgb[0], lightRgb[1], lightRgb[2])
}
```

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { getLightColor } = useTheme()

const baseColor = '#5D87FF'

// 生成不同等级的亮色
console.log(getLightColor(baseColor, 0.1)) // 轻微变亮
console.log(getLightColor(baseColor, 0.3)) // 中等变亮
console.log(getLightColor(baseColor, 0.5)) // 较大变亮
console.log(getLightColor(baseColor, 0.9)) // 接近白色
```

#### getDarkColor

根据基础颜色和等级生成暗色变体。

```typescript
getDarkColor(color: string, level: number): string
```

**参数：**
- `color` - 基础颜色，十六进制格式
- `level` - 暗度等级，范围 0-1，值越大颜色越深

**返回值：**
- 生成的暗色变体，十六进制格式

**算法说明：**

暗色生成基于与黑色的混合计算：

```typescript
// 内部实现原理
const getDarkColor = (color: string, level: number): string => {
  const rgb = hexToRgb(color)
  // 与黑色 [0, 0, 0] 进行混合
  const darkRgb = rgb.map(c => Math.round(c * (1 - level)))
  return rgbToHex(darkRgb[0], darkRgb[1], darkRgb[2])
}
```

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { getDarkColor } = useTheme()

const baseColor = '#5D87FF'

// 生成不同等级的暗色
console.log(getDarkColor(baseColor, 0.1)) // 轻微变暗
console.log(getDarkColor(baseColor, 0.2)) // 中等变暗（用于 hover 状态）
console.log(getDarkColor(baseColor, 0.5)) // 较大变暗
```

#### generateThemeColors

根据主色生成完整的主题色系，包含 9 个亮色变体和 9 个暗色变体。

```typescript
generateThemeColors(color: string): ThemeColors
```

**参数：**
- `color` - 主色调，十六进制格式

**返回值：**
- `ThemeColors` 对象，包含主色和所有变体

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { generateThemeColors } = useTheme()

const colors = generateThemeColors('#5D87FF')

console.log(colors)
// {
//   primary: '#5D87FF',
//   lightColors: [
//     '#7d9fff',  // light-1: 10% 混合白色
//     '#9eb7ff',  // light-2: 20% 混合白色
//     '#becfff',  // light-3: 30% 混合白色
//     '#dee7ff',  // light-4: 40% 混合白色
//     '#eef3ff',  // light-5: 50% 混合白色
//     '#f3f7ff',  // light-6: 60% 混合白色
//     '#f7faff',  // light-7: 70% 混合白色
//     '#fbfcff',  // light-8: 80% 混合白色
//     '#fdfeff',  // light-9: 90% 混合白色
//   ],
//   darkColors: [
//     '#4a6ccc',  // dark-1: 20% 混合黑色
//     '#3851a6',  // dark-2: 40% 混合黑色
//     '#253680',  // dark-3: 60% 混合黑色
//     '#131b59',  // dark-4: 80% 混合黑色
//     '#000033',  // dark-5: 更深
//     // ... 共 9 个暗色
//   ]
// }
```

#### addAlphaToHex

为十六进制颜色添加透明度通道。

```typescript
addAlphaToHex(hex: string, alpha?: number): string
```

**参数：**
- `hex` - 原始颜色，十六进制格式（如 `#5D87FF`）
- `alpha` - 透明度，范围 0-1，默认为 1（完全不透明）

**返回值：**
- 带透明度的颜色，格式为 `rgba(r, g, b, a)`

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { addAlphaToHex } = useTheme()

// 添加 50% 透明度
const semiTransparent = addAlphaToHex('#5D87FF', 0.5)
console.log(semiTransparent) // 'rgba(93, 135, 255, 0.5)'

// 添加 10% 透明度（用于背景）
const lightBg = addAlphaToHex('#5D87FF', 0.1)
console.log(lightBg) // 'rgba(93, 135, 255, 0.1)'

// 默认完全不透明
const opaque = addAlphaToHex('#5D87FF')
console.log(opaque) // 'rgba(93, 135, 255, 1)'
```

**应用场景：**

```vue
<template>
  <div
    class="highlight-box"
    :style="{
      backgroundColor: addAlphaToHex(currentTheme, 0.1),
      borderColor: currentTheme
    }"
  >
    使用主题色的透明背景
  </div>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { currentTheme, addAlphaToHex } = useTheme()
</script>

<style scoped>
.highlight-box {
  padding: 16px;
  border: 1px solid;
  border-radius: 8px;
}
</style>
```

### 类型定义

#### ThemeColors

主题色系接口定义：

```typescript
/**
 * 主题色系
 * 包含主色及其亮色和暗色变体
 */
export interface ThemeColors {
  /** 主题主色调 */
  primary: string

  /** 亮色变体数组（9个等级，从浅到深） */
  lightColors: string[]

  /** 暗色变体数组（9个等级，从浅到深） */
  darkColors: string[]
}
```

**变体等级说明：**

| 等级 | 亮色混合比例 | 暗色混合比例 | 用途 |
|------|-------------|-------------|------|
| 1 | 10% | 10% | 悬停状态 |
| 2 | 20% | 20% | 激活状态 |
| 3 | 30% | 30% | 次要文本 |
| 4 | 40% | 40% | 边框颜色 |
| 5 | 50% | 50% | 浅色背景 |
| 6 | 60% | 60% | 更浅背景 |
| 7 | 70% | 70% | 超浅背景 |
| 8 | 80% | 80% | 极浅背景 |
| 9 | 90% | 90% | 接近白色/黑色 |

## CSS 变量应用

### Element Plus 主题变量

当调用 setTheme 时，useTheme 会自动更新 Element Plus 的主题相关 CSS 变量：

```typescript
// applyThemeColors 内部实现
const applyThemeColors = (color: string): void => {
  const colors = generateThemeColors(color)
  const el = document.documentElement

  // 设置主色
  el.style.setProperty('--el-color-primary', colors.primary)

  // 设置亮色变体
  colors.lightColors.forEach((lightColor, index) => {
    el.style.setProperty(`--el-color-primary-light-${index + 1}`, lightColor)
  })

  // 设置暗色变体（Element Plus 默认只用到 dark-1 和 dark-2）
  el.style.setProperty('--el-color-primary-dark-1', colors.darkColors[0])
  el.style.setProperty('--el-color-primary-dark-2', colors.darkColors[1])
}
```

### 使用主题 CSS 变量

在自定义组件中使用主题色 CSS 变量：

```vue
<template>
  <div class="custom-card">
    <div class="card-header">
      <h3>卡片标题</h3>
    </div>
    <div class="card-content">
      <p>卡片内容</p>
    </div>
    <div class="card-footer">
      <button class="primary-btn">主要按钮</button>
      <button class="secondary-btn">次要按钮</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.custom-card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}

.card-header {
  // 使用主题色作为标题背景
  background: var(--el-color-primary);
  color: #fff;
  padding: 12px 16px;

  h3 {
    margin: 0;
  }
}

.card-content {
  padding: 16px;
  // 使用最浅的亮色变体作为背景
  background: var(--el-color-primary-light-9);
}

.card-footer {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  // 使用较浅的亮色变体
  background: var(--el-color-primary-light-8);
}

.primary-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: var(--el-color-primary);
  color: #fff;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    // 悬停时使用暗色变体
    background: var(--el-color-primary-dark-1);
  }

  &:active {
    background: var(--el-color-primary-dark-2);
  }
}

.secondary-btn {
  padding: 8px 16px;
  border: 1px solid var(--el-color-primary);
  border-radius: 4px;
  background: #fff;
  color: var(--el-color-primary);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--el-color-primary-light-9);
  }
}
</style>
```

### 动态生成主题样式

结合 JavaScript 动态生成主题相关样式：

```vue
<template>
  <div class="dynamic-theme-demo">
    <div
      class="gradient-banner"
      :style="gradientStyle"
    >
      <h2>渐变横幅</h2>
    </div>

    <div class="color-steps">
      <div
        v-for="(color, index) in allColors"
        :key="index"
        class="step"
        :style="{ backgroundColor: color }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, generateThemeColors, addAlphaToHex } = useTheme()

// 计算渐变样式
const gradientStyle = computed(() => {
  const colors = generateThemeColors(currentTheme.value)
  return {
    background: `linear-gradient(135deg,
      ${colors.lightColors[6]} 0%,
      ${colors.primary} 50%,
      ${colors.darkColors[1]} 100%
    )`,
    boxShadow: `0 8px 32px ${addAlphaToHex(currentTheme.value, 0.3)}`
  }
})

// 所有颜色（亮色 + 主色 + 暗色）
const allColors = computed(() => {
  const colors = generateThemeColors(currentTheme.value)
  return [
    ...colors.lightColors.slice().reverse(),
    colors.primary,
    ...colors.darkColors.slice(0, 4)
  ]
})
</script>

<style scoped lang="scss">
.gradient-banner {
  padding: 40px;
  border-radius: 12px;
  color: #fff;
  text-align: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.color-steps {
  display: flex;
  border-radius: 8px;
  overflow: hidden;

  .step {
    flex: 1;
    height: 48px;
    transition: transform 0.2s;

    &:hover {
      transform: scaleY(1.2);
    }
  }
}
</style>
```

## 深色模式集成

### 与 useLayout 的深色模式配合

useTheme 与 useLayout 中的深色模式管理紧密集成：

```vue
<template>
  <div class="theme-mode-demo">
    <div class="mode-switch">
      <span>当前模式：{{ isDark ? '深色' : '浅色' }}</span>
      <el-switch
        v-model="isDark"
        active-text="深色"
        inactive-text="浅色"
      />
    </div>

    <div class="theme-preview" :class="{ dark: isDark }">
      <div
        class="preview-box"
        :style="previewStyles"
      >
        主题色预览
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

const { currentTheme, generateThemeColors, addAlphaToHex } = useTheme()
const layout = useLayout()

// 深色模式状态
const isDark = computed({
  get: () => layout.dark,
  set: (value) => {
    if (value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

// 根据深色模式调整预览样式
const previewStyles = computed(() => {
  const colors = generateThemeColors(currentTheme.value)

  if (isDark.value) {
    // 深色模式下使用暗色变体作为背景
    return {
      backgroundColor: colors.darkColors[2],
      color: '#fff',
      boxShadow: `0 4px 16px ${addAlphaToHex('#000', 0.3)}`
    }
  }

  return {
    backgroundColor: colors.lightColors[8],
    color: colors.darkColors[1],
    boxShadow: `0 4px 16px ${addAlphaToHex(currentTheme.value, 0.15)}`
  }
})
</script>

<style scoped lang="scss">
.theme-mode-demo {
  padding: 20px;
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.theme-preview {
  padding: 20px;
  border-radius: 12px;
  background: var(--el-bg-color);
  transition: background 0.3s;

  &.dark {
    background: #1a1a2e;
  }
}

.preview-box {
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s;
}
</style>
```

### 深色模式下的颜色适配

针对深色模式调整主题色的显示：

```typescript
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

export function useAdaptiveTheme() {
  const { currentTheme, generateThemeColors, getLightColor, getDarkColor } = useTheme()
  const layout = useLayout()

  // 根据深浅模式返回适合的背景色
  const adaptiveBackground = computed(() => {
    const colors = generateThemeColors(currentTheme.value)
    return layout.dark
      ? colors.darkColors[3]  // 深色模式用暗色
      : colors.lightColors[8] // 浅色模式用亮色
  })

  // 根据深浅模式返回适合的文本色
  const adaptiveTextColor = computed(() => {
    const colors = generateThemeColors(currentTheme.value)
    return layout.dark
      ? colors.lightColors[2]  // 深色模式用亮色文本
      : colors.darkColors[1]   // 浅色模式用暗色文本
  })

  // 根据深浅模式返回适合的边框色
  const adaptiveBorderColor = computed(() => {
    const colors = generateThemeColors(currentTheme.value)
    return layout.dark
      ? colors.darkColors[1]
      : colors.lightColors[4]
  })

  return {
    adaptiveBackground,
    adaptiveTextColor,
    adaptiveBorderColor
  }
}
```

## 高级用法

### 主题设置面板

实现完整的主题设置面板，参考系统设置组件实现：

```vue
<template>
  <div class="theme-settings">
    <h3>主题设置</h3>

    <!-- 预设主题色 -->
    <div class="settings-section">
      <h4>预设颜色</h4>
      <div class="preset-colors">
        <div
          v-for="(color, index) in PREDEFINED_THEME_COLORS"
          :key="index"
          class="color-circle"
          :class="{ active: currentTheme === color }"
          :style="getColorCircleStyle(color)"
          @click="setTheme(color)"
        >
          <el-icon v-if="currentTheme === color" :size="16">
            <Check />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 自定义颜色 -->
    <div class="settings-section">
      <h4>自定义颜色</h4>
      <div class="custom-color">
        <el-color-picker
          v-model="customColor"
          @change="handleCustomColorChange"
          :predefine="recentColors"
          show-alpha
        />
        <span class="color-value">{{ currentTheme }}</span>
      </div>
    </div>

    <!-- 色系预览 -->
    <div class="settings-section">
      <h4>色系预览</h4>
      <div class="palette-preview">
        <div class="palette-row">
          <span class="row-label">亮色</span>
          <div class="palette-colors">
            <div
              v-for="(color, index) in themeColors.lightColors"
              :key="`light-${index}`"
              class="palette-item"
              :style="{ backgroundColor: color }"
              :title="`light-${index + 1}: ${color}`"
            />
          </div>
        </div>
        <div class="palette-row primary">
          <span class="row-label">主色</span>
          <div class="palette-colors">
            <div
              class="palette-item primary"
              :style="{ backgroundColor: themeColors.primary }"
              :title="`primary: ${themeColors.primary}`"
            />
          </div>
        </div>
        <div class="palette-row">
          <span class="row-label">暗色</span>
          <div class="palette-colors">
            <div
              v-for="(color, index) in themeColors.darkColors.slice(0, 4)"
              :key="`dark-${index}`"
              class="palette-item"
              :style="{ backgroundColor: color }"
              :title="`dark-${index + 1}: ${color}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <el-button @click="resetTheme">重置默认</el-button>
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'
import { PREDEFINED_THEME_COLORS } from '@/systemConfig'
import { ElMessage } from 'element-plus'

const {
  currentTheme,
  setTheme,
  resetTheme,
  generateThemeColors,
  addAlphaToHex
} = useTheme()

// 自定义颜色
const customColor = ref(currentTheme.value)

// 最近使用的颜色
const recentColors = ref<string[]>([])

// 当前主题色系
const themeColors = computed(() => generateThemeColors(currentTheme.value))

// 生成颜色圆圈样式
const getColorCircleStyle = (color: string) => ({
  backgroundColor: color,
  boxShadow: currentTheme.value === color
    ? `0 0 0 2px #fff, 0 0 0 4px ${color}`
    : 'none'
})

// 处理自定义颜色变化
const handleCustomColorChange = (color: string | null) => {
  if (color) {
    setTheme(color)

    // 添加到最近使用
    if (!recentColors.value.includes(color)) {
      recentColors.value = [color, ...recentColors.value.slice(0, 7)]
    }
  }
}

// 同步当前主题到自定义颜色选择器
watch(currentTheme, (newTheme) => {
  customColor.value = newTheme
})

// 保存设置
const saveSettings = () => {
  // useTheme 已经自动持久化，这里只是提示用户
  ElMessage.success('主题设置已保存')
}
</script>

<style scoped lang="scss">
.theme-settings {
  padding: 20px;

  h3 {
    margin: 0 0 24px;
    font-size: 18px;
    color: var(--el-text-color-primary);
  }
}

.settings-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}

.preset-colors {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
  }

  .el-icon {
    color: #fff;
  }
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 12px;

  .color-value {
    font-family: monospace;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.palette-preview {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
}

.palette-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .row-label {
    width: 40px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.palette-colors {
  display: flex;
  gap: 4px;
  flex: 1;
}

.palette-item {
  flex: 1;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scaleY(1.3);
  }

  &.primary {
    flex: 2;
  }
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
```

### 动态主题切换动画

实现平滑的主题切换过渡效果：

```vue
<template>
  <div class="animated-theme-switch">
    <div
      class="theme-display"
      :style="displayStyles"
      ref="displayRef"
    >
      <p>当前主题色：{{ currentTheme }}</p>
    </div>

    <div class="theme-buttons">
      <button
        v-for="color in themeColors"
        :key="color"
        class="theme-btn"
        :style="{ backgroundColor: color }"
        @click="animatedSetTheme(color, $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme, addAlphaToHex } = useTheme()

const displayRef = ref<HTMLElement>()
const isAnimating = ref(false)

const themeColors = ['#5D87FF', '#B48DF3', '#60C041', '#FF6B6B', '#FFB946']

const displayStyles = computed(() => ({
  backgroundColor: addAlphaToHex(currentTheme.value, 0.1),
  borderColor: currentTheme.value,
  color: currentTheme.value
}))

// 带动画的主题切换
const animatedSetTheme = async (color: string, event: MouseEvent) => {
  if (isAnimating.value || color === currentTheme.value) return

  isAnimating.value = true

  const display = displayRef.value
  if (!display) {
    setTheme(color)
    isAnimating.value = false
    return
  }

  // 获取点击位置
  const rect = display.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 计算需要的最大半径
  const maxRadius = Math.hypot(
    Math.max(x, rect.width - x),
    Math.max(y, rect.height - y)
  )

  // 创建遮罩元素
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: ${addAlphaToHex(color, 0.15)};
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
  `

  display.style.position = 'relative'
  display.style.overflow = 'hidden'
  display.appendChild(overlay)

  // 执行动画
  await overlay.animate([
    { width: '0', height: '0' },
    { width: `${maxRadius * 2}px`, height: `${maxRadius * 2}px` }
  ], {
    duration: 500,
    easing: 'ease-out'
  }).finished

  // 切换主题
  setTheme(color)

  // 移除遮罩
  overlay.remove()
  isAnimating.value = false
}
</script>

<style scoped lang="scss">
.animated-theme-switch {
  padding: 20px;
}

.theme-display {
  padding: 40px;
  border: 2px solid;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.5s ease;

  p {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }
}

.theme-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.theme-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(1.05);
  }
}
</style>
```

### 主题继承与覆盖

在特定区域使用不同的主题配色：

```vue
<template>
  <div class="theme-scope-demo">
    <!-- 使用全局主题 -->
    <div class="global-theme-area">
      <h4>全局主题区域</h4>
      <el-button type="primary">主要按钮</el-button>
      <el-button>默认按钮</el-button>
    </div>

    <!-- 自定义主题区域 -->
    <div
      class="custom-theme-area"
      :style="customThemeVars"
    >
      <h4>自定义主题区域</h4>
      <el-button type="primary">主要按钮</el-button>
      <el-button>默认按钮</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { generateThemeColors } = useTheme()

// 自定义区域使用不同的主题色
const customThemeColor = '#FF6B6B'
const customColors = generateThemeColors(customThemeColor)

// 生成局部 CSS 变量
const customThemeVars = computed(() => {
  const vars: Record<string, string> = {
    '--el-color-primary': customColors.primary
  }

  customColors.lightColors.forEach((color, index) => {
    vars[`--el-color-primary-light-${index + 1}`] = color
  })

  vars['--el-color-primary-dark-1'] = customColors.darkColors[0]
  vars['--el-color-primary-dark-2'] = customColors.darkColors[1]

  return vars
})
</script>

<style scoped lang="scss">
.theme-scope-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.global-theme-area,
.custom-theme-area {
  padding: 24px;
  border-radius: 12px;
  background: var(--el-bg-color);

  h4 {
    margin: 0 0 16px;
    color: var(--el-text-color-primary);
  }

  .el-button {
    margin-right: 12px;
  }
}

.global-theme-area {
  border: 1px solid var(--el-border-color);
}

.custom-theme-area {
  border: 1px solid var(--el-color-primary);
}
</style>
```

## 最佳实践

### 1. 统一通过 useTheme 管理主题

始终使用 useTheme 提供的方法来管理主题色，避免直接操作 CSS 变量或本地存储：

```typescript
// ✅ 推荐：使用 useTheme
import { useTheme } from '@/composables/useTheme'

const { setTheme, currentTheme } = useTheme()
setTheme('#5D87FF')

// ❌ 不推荐：直接操作 CSS 变量
document.documentElement.style.setProperty('--el-color-primary', '#5D87FF')

// ❌ 不推荐：直接操作本地存储
localStorage.setItem('theme', '#5D87FF')
```

### 2. 使用计算属性响应主题变化

当需要根据主题色生成衍生样式时，使用计算属性确保响应式更新：

```typescript
// ✅ 推荐：使用计算属性
const boxStyle = computed(() => ({
  backgroundColor: addAlphaToHex(currentTheme.value, 0.1),
  borderColor: currentTheme.value
}))

// ❌ 不推荐：在 setup 中直接计算（不会响应主题变化）
const boxStyle = {
  backgroundColor: addAlphaToHex(currentTheme.value, 0.1),
  borderColor: currentTheme.value
}
```

### 3. 优先使用 CSS 变量

在样式中优先使用 Element Plus 的 CSS 变量，而不是硬编码颜色值：

```scss
// ✅ 推荐：使用 CSS 变量
.custom-button {
  background: var(--el-color-primary);

  &:hover {
    background: var(--el-color-primary-dark-1);
  }
}

// ❌ 不推荐：硬编码颜色值
.custom-button {
  background: #5D87FF;

  &:hover {
    background: #4A6CCC;
  }
}
```

### 4. 合理使用透明度变体

使用 addAlphaToHex 为背景和装饰元素添加合适的透明度：

```typescript
const { addAlphaToHex, currentTheme } = useTheme()

// 背景色使用低透明度
const bgColor = addAlphaToHex(currentTheme.value, 0.05)  // 5%
const hoverBg = addAlphaToHex(currentTheme.value, 0.1)   // 10%

// 边框和装饰使用中等透明度
const borderColor = addAlphaToHex(currentTheme.value, 0.3) // 30%

// 阴影使用更低透明度
const shadowColor = addAlphaToHex(currentTheme.value, 0.15) // 15%
```

### 5. 考虑深色模式兼容

在自定义主题样式时，确保同时适配深色模式：

```scss
.themed-component {
  // 浅色模式
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary-dark-1);

  // 深色模式
  html.dark & {
    background: var(--el-color-primary-dark-2);
    color: var(--el-color-primary-light-3);
  }
}
```

## 常见问题

### 1. 主题色设置后没有生效

**问题描述：** 调用 setTheme 后，界面颜色没有变化。

**可能原因：**
- 组件使用了硬编码的颜色值而非 CSS 变量
- CSS 优先级问题导致变量被覆盖
- 浏览器缓存了旧的样式

**解决方案：**

```typescript
// 1. 确保使用 CSS 变量
// 检查组件样式是否使用了 var(--el-color-primary)

// 2. 强制刷新主题
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme } = useTheme()

// 先设置为其他颜色再切回来，强制触发更新
const forceRefreshTheme = () => {
  const current = currentTheme.value
  setTheme('#000000')
  nextTick(() => {
    setTheme(current)
  })
}

// 3. 检查是否有 !important 覆盖
// 避免在自定义样式中使用 !important 覆盖主题变量
```

### 2. 主题色在刷新后重置

**问题描述：** 设置的主题色在页面刷新后丢失。

**可能原因：**
- 本地存储被清除
- 主题初始化时机不对

**解决方案：**

```typescript
// useTheme 通过 useLayout 自动处理持久化
// 确保在应用启动时正确初始化

// 在 App.vue 或 main.ts 中
import { useTheme } from '@/composables/useTheme'

// 仅需调用一次即可初始化
const { currentTheme } = useTheme()

// 如果需要手动恢复，可以：
onMounted(() => {
  const savedConfig = localStorage.getItem('layout-config')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    if (config.theme) {
      setTheme(config.theme)
    }
  }
})
```

### 3. 自定义颜色格式错误

**问题描述：** 传入的颜色值导致显示异常。

**可能原因：**
- 颜色格式不正确（如缺少 # 号）
- 传入了 RGB 格式而非十六进制

**解决方案：**

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// ✅ 正确：完整的十六进制格式
setTheme('#5D87FF')
setTheme('#5d87ff')  // 大小写不敏感

// ❌ 错误：缺少 # 号
setTheme('5D87FF')

// ❌ 错误：RGB 格式
setTheme('rgb(93, 135, 255)')

// 如果需要从 RGB 转换，先使用 rgbToHex
import { rgbToHex } from '@/utils/colors'
const hex = rgbToHex(93, 135, 255)
setTheme(hex)
```

### 4. 深色模式下主题色对比度不够

**问题描述：** 在深色模式下，主题色与背景的对比度不足。

**解决方案：**

```typescript
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

const { currentTheme, generateThemeColors, getLightColor } = useTheme()
const layout = useLayout()

// 在深色模式下使用更亮的变体
const adaptiveThemeColor = computed(() => {
  if (layout.dark) {
    // 深色模式下提亮主题色
    return getLightColor(currentTheme.value, 0.2)
  }
  return currentTheme.value
})

// 或者使用色系中的亮色变体
const adaptiveColor = computed(() => {
  const colors = generateThemeColors(currentTheme.value)
  return layout.dark ? colors.lightColors[2] : colors.primary
})
```

### 5. 第三方组件不响应主题变化

**问题描述：** 某些第三方组件的颜色不随主题变化。

**解决方案：**

```vue
<template>
  <!-- 为第三方组件包装一层，传入动态颜色 -->
  <ThirdPartyChart
    :color="currentTheme"
    :colors="chartColors"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, generateThemeColors } = useTheme()

// 生成图表颜色序列
const chartColors = computed(() => {
  const colors = generateThemeColors(currentTheme.value)
  return [
    colors.primary,
    colors.lightColors[2],
    colors.lightColors[4],
    colors.darkColors[0],
    colors.darkColors[2]
  ]
})
</script>

<style>
/* 使用 CSS 变量覆盖第三方组件样式 */
.third-party-component {
  --component-primary-color: var(--el-color-primary) !important;
}
</style>
```

## 性能优化

### 避免频繁调用 setTheme

主题切换会触发大量 CSS 变量更新，应避免高频调用：

```typescript
import { debounce } from 'lodash-es'
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 使用防抖处理颜色选择器的实时预览
const debouncedSetTheme = debounce((color: string) => {
  setTheme(color)
}, 100)

// 在颜色选择器的 active-change 事件中使用
const handleActiveChange = (color: string) => {
  debouncedSetTheme(color)
}
```

### 缓存生成的颜色

如果需要频繁访问主题色系，可以缓存计算结果：

```typescript
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, generateThemeColors } = useTheme()

// 使用 computed 自动缓存
const cachedColors = computed(() => generateThemeColors(currentTheme.value))

// 在组件中直接使用缓存的颜色
const primaryColor = computed(() => cachedColors.value.primary)
const lightColors = computed(() => cachedColors.value.lightColors)
```
