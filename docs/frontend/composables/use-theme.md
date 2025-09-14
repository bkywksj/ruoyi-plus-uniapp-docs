# useTheme

主题管理组合函数，提供对应用主题的响应式管理功能，包括颜色变量设置、主题切换和自定义。

## 📋 功能特性

- **主题设置**: 设置新的主题色并应用到整个应用
- **主题重置**: 将主题重置为系统默认值
- **颜色转换**: 十六进制与RGB颜色转换
- **颜色变体**: 生成亮色和暗色变体
- **主题生成**: 基于主色生成完整主题色系
- **主题应用**: 将主题色应用到CSS变量

## 🎯 基础用法

### 基本使用

```vue
<template>
  <div>
    <p>当前主题色: {{ currentTheme }}</p>
    <el-color-picker 
      v-model="selectedColor" 
      @change="handleThemeChange"
    />
    <el-button @click="handleResetTheme">重置主题</el-button>
  </div>
</template>

<script setup>
import { useTheme } from '@/hooks/useTheme'

const { currentTheme, setTheme, resetTheme } = useTheme()
const selectedColor = ref('#1890ff')

const handleThemeChange = (color) => {
  setTheme(color)
}

const handleResetTheme = () => {
  resetTheme()
}
</script>
```

### 主题色预设

```vue
<template>
  <div class="theme-presets">
    <div 
      v-for="preset in themePresets" 
      :key="preset.name"
      class="theme-preset"
      :style="{ backgroundColor: preset.color }"
      @click="setTheme(preset.color)"
    >
      {{ preset.name }}
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/hooks/useTheme'

const { setTheme } = useTheme()

const themePresets = [
  { name: '默认蓝', color: '#1890ff' },
  { name: '成功绿', color: '#52c41a' },
  { name: '警告橙', color: '#faad14' },
  { name: '危险红', color: '#f5222d' },
  { name: '紫色', color: '#722ed1' },
  { name: '青色', color: '#13c2c2' }
]
</script>

<style scoped>
.theme-presets {
  display: flex;
  gap: 10px;
}

.theme-preset {
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-preset:hover {
  opacity: 0.8;
  transform: scale(1.05);
}
</style>
```

## 🔧 API 参考

### 返回值

#### 状态
- `currentTheme: Ref<string>` - 当前主题色

#### 主题操作方法
- `setTheme(color: string): void` - 设置主题色
- `resetTheme(): void` - 重置为默认主题

#### 颜色工具方法
- `hexToRgb(hex: string): string[]` - 将十六进制颜色转换为RGB数组
- `rgbToHex(r: string, g: string, b: string): string` - 将RGB颜色转换为十六进制颜色
- `getLightColor(color: string, level: number): string` - 生成亮色变体
- `getDarkColor(color: string, level: number): string` - 生成暗色变体
- `generateThemeColors(color: string): ThemeColors` - 为指定颜色生成所有变体

### 接口定义

```typescript
interface ThemeColors {
  /** 主题主色调 */
  primary: string
  /** 亮色变体(9个等级) */
  lightColors: string[]
  /** 暗色变体(9个等级) */
  darkColors: string[]
}
```

## 🎨 高级用法

### 动态主题切换

```vue
<template>
  <div class="theme-switcher">
    <el-select v-model="selectedTheme" @change="handleThemeChange">
      <el-option
        v-for="theme in themes"
        :key="theme.value"
        :label="theme.label"
        :value="theme.value"
      />
    </el-select>
    
    <!-- 预览主题色系 -->
    <div class="color-palette">
      <div 
        v-for="(color, index) in currentPalette.lightColors" 
        :key="`light-${index}`"
        class="color-item"
        :style="{ backgroundColor: color }"
      />
      <div 
        class="color-item primary"
        :style="{ backgroundColor: currentPalette.primary }"
      />
      <div 
        v-for="(color, index) in currentPalette.darkColors" 
        :key="`dark-${index}`"
        class="color-item"
        :style="{ backgroundColor: color }"
      />
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/hooks/useTheme'

const { setTheme, generateThemeColors } = useTheme()

const themes = [
  { label: '默认蓝色', value: '#1890ff' },
  { label: '成功绿色', value: '#52c41a' },
  { label: '警告橙色', value: '#faad14' },
  { label: '危险红色', value: '#f5222d' }
]

const selectedTheme = ref('#1890ff')
const currentPalette = computed(() => 
  generateThemeColors(selectedTheme.value)
)

const handleThemeChange = (color) => {
  setTheme(color)
}
</script>

<style scoped>
.color-palette {
  display: flex;
  gap: 2px;
  margin-top: 10px;
}

.color-item {
  width: 20px;
  height: 20px;
  border-radius: 2px;
}

.color-item.primary {
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #000;
}
</style>
```

### 颜色工具使用

```vue
<script setup>
import { useTheme } from '@/hooks/useTheme'

const { 
  hexToRgb, 
  rgbToHex, 
  getLightColor, 
  getDarkColor 
} = useTheme()

// 颜色转换示例
const baseColor = '#1890ff'
const rgbArray = hexToRgb(baseColor) // ['24', '144', '255']
const hexColor = rgbToHex('24', '144', '255') // '#1890ff'

// 生成变体颜色
const lightVariant = getLightColor(baseColor, 0.3) // 30% 亮度变体
const darkVariant = getDarkColor(baseColor, 0.3) // 30% 暗度变体

console.log('RGB:', rgbArray)
console.log('Hex:', hexColor)
console.log('Light:', lightVariant)
console.log('Dark:', darkVariant)
</script>
```

### 主题持久化

```vue
<script setup>
import { useTheme } from '@/hooks/useTheme'
import { useThemeStore } from '@/stores/theme'

const { setTheme, currentTheme } = useTheme()
const themeStore = useThemeStore()

// 监听主题变化，自动保存到存储
watch(currentTheme, (newTheme) => {
  themeStore.theme = newTheme
  localStorage.setItem('app-theme', newTheme)
}, { immediate: true })

// 应用启动时恢复主题
onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme && savedTheme !== currentTheme.value) {
    setTheme(savedTheme)
  }
})
</script>
```

## 🎯 使用场景

### 1. 系统设置页面
在系统设置中提供主题色选择功能：

```vue
<template>
  <el-form-item label="主题色">
    <el-color-picker 
      v-model="themeColor" 
      @change="handleThemeChange"
      show-alpha
      :predefine="predefineColors"
    />
  </el-form-item>
</template>

<script setup>
import { useTheme } from '@/hooks/useTheme'

const { setTheme, currentTheme } = useTheme()
const themeColor = ref(currentTheme.value)

const predefineColors = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d',
  '#722ed1', '#13c2c2', '#eb2f96', '#fa541c'
]

const handleThemeChange = (color) => {
  setTheme(color)
}
</script>
```

### 2. 品牌定制
为不同客户提供品牌色定制：

```vue
<script setup>
import { useTheme } from '@/hooks/useTheme'

const { setTheme } = useTheme()

// 根据品牌配置设置主题
const brandConfig = {
  'company-a': '#ff6b35',
  'company-b': '#4ecdc4',
  'company-c': '#45b7d1'
}

const currentBrand = inject('currentBrand', 'default')

onMounted(() => {
  const brandColor = brandConfig[currentBrand]
  if (brandColor) {
    setTheme(brandColor)
  }
})
</script>
```
