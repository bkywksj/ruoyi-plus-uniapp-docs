# 图标组件使用

项目提供了 `Icon` 和 `IconSelect` 两个核心组件，支持 Iconfont 和 Iconify 双图标系统，提供灵活的尺寸、颜色和动画配置。

## 组件架构

### 整体设计

图标组件采用智能识别机制，自动区分 Iconfont 和 Iconify 两种图标类型，并根据类型选择合适的渲染方式：

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Icon 组件架构                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐         ┌─────────────────────────────────┐   │
│  │   Props     │ ──────► │      智能图标识别系统            │   │
│  │ value/code  │         │                                 │   │
│  └─────────────┘         │  1. value 以 i- 开头 → Iconify  │   │
│                          │  2. value 其他格式 → Iconfont    │   │
│                          │  3. code 在 iconfont → Iconfont │   │
│                          │  4. code 在 iconify → Iconify   │   │
│                          │  5. 其他 → 尝试 Iconify         │   │
│                          └─────────────────────────────────┘   │
│                                         │                       │
│                    ┌────────────────────┴────────────────────┐  │
│                    ▼                                         ▼  │
│  ┌─────────────────────────────┐   ┌─────────────────────────┐  │
│  │     Iconfont 渲染器          │   │    Iconify 渲染器       │  │
│  │ ─────────────────────────── │   │ ──────────────────────  │  │
│  │ • 使用 i 标签               │   │ • 使用 div 标签         │  │
│  │ • font-size 控制大小         │   │ • width/height 控制大小 │  │
│  │ • iconfont 字体族            │   │ • UnoCSS 图标类         │  │
│  └─────────────────────────────┘   └─────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     样式处理层                               ││
│  │  • 尺寸：预设(xs-2xl) / 数字(px) / 字符串(em/rem)           ││
│  │  • 颜色：CSS 颜色值 / CSS 变量                              ││
│  │  • 动画：6 种悬停动画效果                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心模块

| 模块 | 文件 | 功能 |
|------|------|------|
| Icon 组件 | `src/components/Icon/Icon.vue` | 图标展示组件 |
| IconSelect 组件 | `src/components/Icon/IconSelect.vue` | 图标选择器组件 |
| 类型定义 | `src/types/icons.d.ts` | 图标类型和辅助函数 |
| 动画样式 | `src/assets/styles/components/_animations.scss` | 图标动画效果 |

### 技术特性

- **双图标系统**：同时支持 Iconfont (644 个) 和 Iconify (173 个) 图标
- **智能识别**：自动识别图标类型，无需手动指定
- **TypeScript 类型安全**：完整的 `IconCode` 类型定义，支持 817 个图标代码
- **响应式尺寸**：支持预设尺寸、数字像素、自定义单位
- **CSS 变量集成**：支持 Element Plus 主题色
- **6 种动画效果**：震动、旋转、上移、放大、缩小、呼吸

## Icon 组件

### 组件特性

- <Ok/> 支持 iconfont 和 iconify 双图标系统
- <Ok/> 自动图标类型识别（优先 iconfont，其次 iconify）
- <Ok/> 灵活的尺寸设置（预设尺寸、数字或字符串）
- <Ok/> 自定义颜色支持
- <Ok/> 内置 6 种动画效果
- <Ok/> 自动处理 iconfont 和 iconify 样式差异
- <Ok/> 完整的 TypeScript 类型支持

### 基础用法

#### 使用 code 属性（推荐）

`code` 属性接受图标代码，组件会自动识别并渲染正确的图标类型：

```vue
<template>
  <div class="icon-demo">
    <!-- Iconfont 图标 -->
    <Icon code="elevator3" />
    <Icon code="user" />
    <Icon code="search" />

    <!-- Iconify 图标 -->
    <Icon code="home" />
    <Icon code="setting" />
    <Icon code="edit" />
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**工作原理：**

1. 组件接收 `code` 属性
2. 调用 `isIconfontIcon(code)` 检查是否在 Iconfont 图标库中
3. 如果是，添加 `iconfont icon-{code}` 类名
4. 如果不是，调用 `isIconifyIcon(code)` 检查是否在 Iconify 预设中
5. 如果是预设 Iconify，调用 `getIconifyValue(code)` 获取完整图标类
6. 否则尝试作为 Iconify 图标处理，添加 `i-{code}` 前缀

#### 使用 value 属性

`value` 属性用于直接指定完整的图标类名：

```vue
<template>
  <div class="icon-demo">
    <!-- Iconify 格式（以 i- 开头） -->
    <Icon value="i-ep-home" />
    <Icon value="i-carbon-user" />
    <Icon value="i-mdi-account" />

    <!-- Iconfont 格式（完整类名） -->
    <Icon value="icon-elevator3" />
    <Icon value="iconfont icon-user" />
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**识别逻辑：**

```typescript
// value 以 i- 开头 → Iconify 图标
if (props.value?.startsWith('i-')) {
  return props.value  // 直接作为 Iconify 类名
}

// value 其他格式 → Iconfont 图标
return props.value  // 作为自定义 CSS 类
```

### Props 属性

```typescript
/**
 * 尺寸预设类型定义
 */
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * 图标动画类型定义
 */
export type AnimateType = 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'

/**
 * Icon 组件属性接口
 */
interface IconProps {
  /** 图标值，可以是完整的图标类名（用于 iconify 或自定义类） */
  value?: string

  /** 图标代码，用于标识图标，优先从 iconfont 查找，然后从 iconify 查找 */
  code?: IconCode

  /** 图标大小，支持预设尺寸、数字(px)或字符串 */
  size?: SizePreset | string | number

  /** 图标颜色，支持任何CSS颜色值 */
  color?: string

  /** 图标动画效果类型 */
  animate?: AnimateType
}
```

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `value` | 图标完整类名，用于 iconify 或自定义类 | `string` | - |
| `code` | 图标代码，自动识别图标类型 | `IconCode` | - |
| `size` | 图标大小，支持预设/数字/字符串 | `SizePreset \| string \| number` | `'1.3em'` |
| `color` | 图标颜色，支持任何 CSS 颜色值 | `string` | - |
| `animate` | 动画效果类型 | `AnimateType` | - |

## 图标识别机制

### 自动类型识别

Icon 组件会按以下优先级自动识别图标类型：

```vue
<template>
  <!-- 1. value 以 i- 开头 → iconify -->
  <Icon value="i-ep-home" />  <!-- Iconify 图标 -->

  <!-- 2. value 不以 i- 开头 → iconfont -->
  <Icon value="icon-elevator3" />  <!-- Iconfont 图标 -->

  <!-- 3. code 在 iconfont 中存在 → iconfont -->
  <Icon code="elevator3" />  <!-- 自动识别为 icon-elevator3 -->

  <!-- 4. code 在 iconify 预设中存在 → iconify -->
  <Icon code="home" />  <!-- 自动识别为 i-ep-home -->

  <!-- 5. code 不在任何库中 → 尝试作为 iconify 处理 -->
  <Icon code="carbon-user" />  <!-- 转为 i-carbon-user -->
</template>
```

### 识别流程详解

```typescript
/**
 * 计算 iconfont 图标的 CSS 类名
 * 优先级：直接 value（非 iconify） > code（在 iconfont 中存在）
 */
const computedIconClass = computed(() => {
  // 如果有 value 且不是 iconify 格式，直接返回作为 CSS 类
  if (props.value && !props.value.startsWith('i-')) {
    return props.value
  }

  // 如果有 code，检查是否在 iconfont 图标库中
  if (props.code) {
    const isIconfont = isIconfontIcon(props.code)
    if (isIconfont) {
      return `iconfont icon-${props.code}`
    }
  }

  return undefined
})

/**
 * 计算最终使用的 iconify 图标值
 * 只有在非 iconfont 情况下才计算
 */
const computedValue = computed(() => {
  // 直接返回以 i- 开头的 value（iconify 格式）
  if (props.value?.startsWith('i-')) {
    return props.value
  }

  // 如果有 code，进行图标类型判断
  if (props.code) {
    // 检查是否为预设的 iconify 图标
    const isIconifyPreset = isIconifyIcon(props.code)
    if (isIconifyPreset) {
      return getIconifyValue(props.code)
    }

    // 如果不在 iconfont 中，尝试作为 iconify 图标处理
    if (!isIconfontIcon(props.code)) {
      return `i-${props.code}`
    }
  }

  return undefined
})
```

### 识别示例

```vue
<template>
  <!-- ✅ Iconfont 图标（644个） -->
  <Icon code="elevator3" />           <!-- 自动添加 icon- 前缀 -->
  <Icon code="equipment-setting2" />
  <Icon value="icon-elevator3" />     <!-- 直接使用完整类名 -->

  <!-- ✅ Iconify 图标（173个预设） -->
  <Icon code="home" />                <!-- 自动转为 i-ep-home -->
  <Icon value="i-ep-home" />          <!-- 直接使用完整类名 -->

  <!-- ✅ 其他 Iconify 图标集 -->
  <Icon value="i-carbon-user" />
  <Icon value="i-mdi-account" />
</template>
```

### 辅助函数

图标类型定义文件提供了一系列辅助函数：

```typescript
/** 图标项接口 */
export interface IconItem {
  code: string
  name: string
}

/** iconify 图标项接口 */
export interface IconifyIconItem extends IconItem {
  value: string
}

/** 检查是否为有效的图标代码 */
export const isValidIconCode = (code: string): code is IconCode => {
  return ALL_ICONS.some((icon) => icon.code === code)
}

/** 检查代码是否为 iconfont 图标 */
export const isIconfontIcon = (code: string): boolean => {
  return ICONFONT_ICONS.some((icon) => icon.code === code)
}

/** 检查代码是否为 iconify 图标 */
export const isIconifyIcon = (code: string): boolean => {
  return ICONIFY_ICONS.some((icon) => icon.code === code)
}

/** 获取 iconify 图标的 value */
export const getIconifyValue = (code: string): string | undefined => {
  return ICONIFY_ICONS.find((icon) => icon.code === code)?.value
}

/** 根据代码获取图标名称 */
export const getIconName = (code: IconCode): string => {
  return ALL_ICONS.find((icon) => icon.code === code)?.name || code
}

/** 搜索图标 */
export const searchIcons = (query: string): IconItem[] => {
  const searchTerm = query.toLowerCase()
  return ALL_ICONS.filter((icon) =>
    icon.code.toLowerCase().includes(searchTerm) ||
    icon.name.toLowerCase().includes(searchTerm)
  )
}

/** 获取所有图标代码 */
export const getAllIconCodes = (): IconCode[] => {
  return ALL_ICONS.map((icon) => icon.code as IconCode)
}
```

**使用示例：**

```typescript
import {
  isValidIconCode,
  isIconfontIcon,
  getIconName,
  searchIcons
} from '@/types/icons.d'

// 验证图标代码
if (isValidIconCode('home')) {
  console.log('有效的图标代码')
}

// 检查图标类型
const isIconfont = isIconfontIcon('elevator3')  // true
const isIconify = isIconfontIcon('home')        // false (在 iconify 中)

// 获取图标名称
const name = getIconName('home')  // '首页'

// 搜索图标
const results = searchIcons('user')  // 返回包含 'user' 的所有图标
```

## 尺寸设置

### 预设尺寸

组件提供 6 种预设尺寸，自动转换为对应像素值：

```vue
<template>
  <div class="size-demo">
    <Icon code="search" size="xs" />    <!-- 12px -->
    <Icon code="search" size="sm" />    <!-- 16px -->
    <Icon code="search" size="md" />    <!-- 20px (默认) -->
    <Icon code="search" size="lg" />    <!-- 24px -->
    <Icon code="search" size="xl" />    <!-- 32px -->
    <Icon code="search" size="2xl" />   <!-- 40px -->
  </div>
</template>
```

**尺寸映射表：**

| 预设 | Iconfont (font-size) | Iconify (width/height) |
|------|---------------------|------------------------|
| `xs` | 12px | w-3 h-3 (12px) |
| `sm` | 16px | w-4 h-4 (16px) |
| `md` | 20px | w-5 h-5 (20px) |
| `lg` | 24px | w-6 h-6 (24px) |
| `xl` | 32px | w-8 h-8 (32px) |
| `2xl` | 40px | w-10 h-10 (40px) |

### 数字尺寸（像素）

传入数字时，自动转换为像素值：

```vue
<template>
  <div class="size-demo">
    <Icon code="user" :size="16" />  <!-- 16px -->
    <Icon code="user" :size="20" />  <!-- 20px -->
    <Icon code="user" :size="24" />  <!-- 24px -->
    <Icon code="user" :size="32" />  <!-- 32px -->
    <Icon code="user" :size="48" />  <!-- 48px -->
  </div>
</template>
```

**实现原理：**

```typescript
// 处理数字类型的尺寸
if (typeof props.size === 'number') {
  const sizeValue = `${props.size}px`
  // iconfont 图标需要设置 font-size
  if (computedIconClass.value) {
    styles.fontSize = sizeValue
  } else {
    // iconify 图标需要设置 width/height
    styles.width = sizeValue
    styles.height = sizeValue
  }
}
```

### 字符串尺寸

支持任意 CSS 尺寸单位：

```vue
<template>
  <div class="size-demo">
    <!-- em 单位（相对父元素字体大小） -->
    <Icon code="setting" size="1.5em" />
    <Icon code="setting" size="2em" />

    <!-- rem 单位（相对根元素字体大小） -->
    <Icon code="setting" size="1rem" />
    <Icon code="setting" size="2rem" />

    <!-- px 单位 -->
    <Icon code="setting" size="24px" />
    <Icon code="setting" size="32px" />

    <!-- 默认值 -->
    <Icon code="setting" size="1.3em" />
  </div>
</template>
```

### 尺寸响应式处理

组件内部根据图标类型自动选择合适的样式属性：

```typescript
/**
 * 处理内联样式（颜色和自定义尺寸）
 */
const inlineStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 预设尺寸到像素值的映射
  const presetSizeMap: Record<SizePreset, string> = {
    'xs': '12px',
    'sm': '16px',
    'md': '20px',
    'lg': '24px',
    'xl': '32px',
    '2xl': '40px'
  }

  // 处理预设尺寸
  if (typeof props.size === 'string' && presetSizeMap[props.size as SizePreset]) {
    const sizeValue = presetSizeMap[props.size as SizePreset]
    if (computedIconClass.value) {
      // iconfont 图标使用 font-size
      styles.fontSize = sizeValue
    }
    // iconify 图标使用 CSS 类，不需要内联样式
  }
  // 处理字符串类型的自定义尺寸
  else if (typeof props.size === 'string' && !sizeClass.value) {
    if (computedIconClass.value) {
      styles.fontSize = props.size  // iconfont
    } else {
      styles.width = props.size     // iconify
      styles.height = props.size
    }
  }

  return styles
})
```

## 颜色设置

### CSS 颜色值

支持所有标准 CSS 颜色格式：

```vue
<template>
  <div class="color-demo">
    <!-- 十六进制 -->
    <Icon code="home" color="#409eff" />
    <Icon code="home" color="#67c23a" />
    <Icon code="home" color="#e6a23c" />
    <Icon code="home" color="#f56c6c" />

    <!-- RGB/RGBA -->
    <Icon code="user" color="rgb(64, 158, 255)" />
    <Icon code="user" color="rgba(64, 158, 255, 0.8)" />
    <Icon code="user" color="rgba(245, 108, 108, 0.6)" />

    <!-- 命名颜色 -->
    <Icon code="setting" color="red" />
    <Icon code="setting" color="blue" />
    <Icon code="setting" color="green" />
    <Icon code="setting" color="orange" />
  </div>
</template>
```

### CSS 变量

推荐使用 Element Plus 主题变量，保持与整体风格一致：

```vue
<template>
  <div class="color-demo">
    <!-- Element Plus 主题色 -->
    <Icon code="success" color="var(--el-color-success)" />
    <Icon code="warning" color="var(--el-color-warning)" />
    <Icon code="danger" color="var(--el-color-danger)" />
    <Icon code="primary" color="var(--el-color-primary)" />
    <Icon code="info" color="var(--el-color-info)" />

    <!-- 文本颜色变量 -->
    <Icon code="text" color="var(--el-text-color-primary)" />
    <Icon code="text" color="var(--el-text-color-regular)" />
    <Icon code="text" color="var(--el-text-color-secondary)" />
    <Icon code="text" color="var(--el-text-color-placeholder)" />

    <!-- 自定义变量 -->
    <Icon code="custom" color="var(--app-text)" />
    <Icon code="custom" color="var(--app-primary)" />
  </div>
</template>
```

### 继承颜色

不设置 `color` 属性时，图标继承父元素文本颜色：

```vue
<template>
  <div class="color-inherit">
    <!-- 继承按钮文字颜色 -->
    <el-button type="primary">
      <Icon code="plus" />
      添加
    </el-button>

    <!-- 继承链接颜色 -->
    <el-link type="primary">
      <Icon code="edit" />
      编辑
    </el-link>

    <!-- 继承自定义容器颜色 -->
    <div style="color: #67c23a;">
      <Icon code="success" />
      成功
    </div>
  </div>
</template>
```

## 动画效果

### 6 种内置动画

组件提供 6 种悬停动画效果：

```vue
<template>
  <div class="animate-demo">
    <!-- 震动效果 -->
    <Icon code="bell" animate="shake" />

    <!-- 旋转180度 -->
    <Icon code="refresh" animate="rotate180" />

    <!-- 向上移动 -->
    <Icon code="upload" animate="moveUp" />

    <!-- 放大效果 -->
    <Icon code="fullscreen" animate="expand" />

    <!-- 缩小效果 -->
    <Icon code="fullscreen-exit" animate="shrink" />

    <!-- 呼吸效果（持续动画） -->
    <Icon code="notification" animate="breathing" />
  </div>
</template>
```

### 动画实现原理

动画效果通过 CSS 关键帧动画实现：

```scss
/* 抖动动画 */
@keyframes shake {
  0% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0); }
}

/* 180度旋转动画 */
@keyframes rotate180 {
  0% { transform: rotate(0); }
  100% { transform: rotate(180deg); }
}

/* 上下移动动画 */
@keyframes moveUp {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}

/* 放大动画 */
@keyframes expand {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 缩小动画 */
@keyframes shrink {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

/* 呼吸动画 */
@keyframes breathing {
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(0.9); }
}
```

### 动画触发方式

```scss
/* 悬停触发动画 */
.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}

.icon-hover-rotate180 {
  transform-origin: 50% 50% !important;
  &:hover {
    animation: rotate180 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  }
}

.icon-hover-moveUp {
  &:hover {
    animation: moveUp 0.4s ease-in-out;
  }
}

.icon-hover-expand {
  &:hover {
    animation: expand 0.6s ease-in-out;
  }
}

.icon-hover-shrink {
  &:hover {
    animation: shrink 0.6s ease-in-out;
  }
}

/* 持续动画（不需要悬停） */
.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

### 动画使用场景

```vue
<template>
  <div class="animate-scenarios">
    <!-- 通知图标 - 呼吸效果表示有新消息 -->
    <div class="notification-badge">
      <Icon code="notification" animate="breathing" color="#f56c6c" />
      <span class="badge">3</span>
    </div>

    <!-- 刷新按钮 - 旋转效果 -->
    <el-button @click="handleRefresh">
      <Icon code="refresh" animate="rotate180" />
      刷新
    </el-button>

    <!-- 上传图标 - 向上移动效果 -->
    <div class="upload-trigger">
      <Icon code="upload" animate="moveUp" size="xl" />
      <span>点击上传</span>
    </div>

    <!-- 全屏切换 - 放大/缩小效果 -->
    <div class="fullscreen-toggle" @click="toggleFullscreen">
      <Icon
        :code="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
        :animate="isFullscreen ? 'shrink' : 'expand'"
      />
    </div>

    <!-- 提醒图标 - 震动效果 -->
    <div class="reminder">
      <Icon code="bell" animate="shake" color="var(--el-color-warning)" />
      <span>待处理任务</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isFullscreen = ref(false)

const handleRefresh = () => {
  // 刷新逻辑
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}
</script>

<style scoped>
.notification-badge {
  position: relative;
  display: inline-flex;
}

.notification-badge .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 24px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
}

.fullscreen-toggle {
  cursor: pointer;
  padding: 8px;
}

.reminder {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

## 组合使用

### 完整配置示例

```vue
<template>
  <div class="complete-demo">
    <!-- 带颜色、尺寸和动画 -->
    <Icon
      code="notification"
      size="24"
      color="#409eff"
      animate="breathing"
    />

    <!-- 预设尺寸 + 主题色 + 动画 -->
    <Icon
      code="refresh"
      size="lg"
      color="var(--el-color-primary)"
      animate="rotate180"
    />

    <!-- 自定义尺寸 + 成功色 -->
    <Icon
      code="success"
      size="2rem"
      color="var(--el-color-success)"
    />
  </div>
</template>
```

### 动态图标

根据条件动态切换图标和样式：

```vue
<template>
  <div class="dynamic-icon">
    <Icon
      :code="iconCode"
      :size="iconSize"
      :color="iconColor"
      :animate="iconAnimate"
    />

    <div class="controls">
      <el-button @click="changeIcon">切换图标</el-button>
      <el-button @click="changeSize">切换大小</el-button>
      <el-button @click="changeColor">切换颜色</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IconCode } from '@/types/icons.d'
import type { AnimateType } from '@/components/Icon/Icon.vue'

const icons: IconCode[] = ['home', 'user', 'setting', 'search', 'edit']
const sizes = ['sm', 'md', 'lg', 'xl']
const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c']

const iconIndex = ref(0)
const sizeIndex = ref(1)
const colorIndex = ref(0)

const iconCode = computed(() => icons[iconIndex.value])
const iconSize = computed(() => sizes[sizeIndex.value])
const iconColor = computed(() => colors[colorIndex.value])
const iconAnimate = ref<AnimateType>('shake')

const changeIcon = () => {
  iconIndex.value = (iconIndex.value + 1) % icons.length
}

const changeSize = () => {
  sizeIndex.value = (sizeIndex.value + 1) % sizes.length
}

const changeColor = () => {
  colorIndex.value = (colorIndex.value + 1) % colors.length
}
</script>
```

### 状态指示图标

根据业务状态显示不同图标：

```vue
<template>
  <div class="status-icons">
    <!-- 订单状态 -->
    <div v-for="order in orders" :key="order.id" class="order-item">
      <Icon
        :code="getStatusIcon(order.status)"
        :color="getStatusColor(order.status)"
        size="lg"
      />
      <span>{{ order.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconCode } from '@/types/icons.d'

interface Order {
  id: number
  name: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
}

const orders = ref<Order[]>([
  { id: 1, name: '订单 A', status: 'pending' },
  { id: 2, name: '订单 B', status: 'processing' },
  { id: 3, name: '订单 C', status: 'completed' },
  { id: 4, name: '订单 D', status: 'cancelled' },
])

const statusIconMap: Record<Order['status'], IconCode> = {
  pending: 'clock',
  processing: 'loading',
  completed: 'success',
  cancelled: 'close-circle'
}

const statusColorMap: Record<Order['status'], string> = {
  pending: 'var(--el-color-warning)',
  processing: 'var(--el-color-primary)',
  completed: 'var(--el-color-success)',
  cancelled: 'var(--el-color-danger)'
}

const getStatusIcon = (status: Order['status']): IconCode => {
  return statusIconMap[status]
}

const getStatusColor = (status: Order['status']): string => {
  return statusColorMap[status]
}
</script>
```

## IconSelect 组件

图标选择器组件，提供图标选择功能，支持搜索和实时预览。

### 组件特性

- <Ok/> v-model 双向绑定
- <Ok/> 图标搜索（支持代码和名称）
- <Ok/> 实时预览（悬停显示图标信息）
- <Ok/> 图标网格展示
- <Ok/> 选中状态高亮
- <Ok/> 支持 817 个图标（644 iconfont + 173 iconify）
- <Ok/> 清空功能
- <Ok/> 自定义宽度
- <Ok/> 空值占位符支持

### 基础用法

```vue
<template>
  <IconSelect v-model="selectedIcon" width="400px" />
</template>

<script setup lang="ts">
import IconSelect from '@/components/Icon/IconSelect.vue'

const selectedIcon = ref('elevator3')
</script>
```

### Props 属性

```typescript
/**
 * 图标选择器组件的属性接口
 */
interface IconSelectProps {
  /**
   * 当前选中的图标代码
   * @required
   */
  modelValue: string

  /**
   * 组件宽度
   * @default '400px'
   */
  width?: string

  /**
   * 清空时的默认值
   * 用于某些场景需要保留占位符，如菜单图标需要 '#'
   * @default ''
   */
  emptyValue?: string
}
```

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `modelValue` | 当前选中的图标代码 | `string` | - |
| `width` | 组件宽度 | `string` | `'400px'` |
| `emptyValue` | 清空时的默认值 | `string` | `''` |

### Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `update:modelValue` | 图标选择变化时触发 | `(value: string) => void` |

### 完整示例

```vue
<template>
  <el-form label-width="100px">
    <el-form-item label="选择图标">
      <IconSelect v-model="form.icon" width="100%" />
    </el-form-item>

    <el-form-item label="当前选中">
      <div class="flex items-center gap-2">
        <Icon v-if="form.icon" :code="form.icon" size="lg" />
        <span>{{ form.icon || '未选择' }}</span>
      </div>
    </el-form-item>

    <el-form-item label="图标预览">
      <div class="icon-preview-list">
        <div
          v-for="size in ['xs', 'sm', 'md', 'lg', 'xl', '2xl']"
          :key="size"
          class="preview-item"
        >
          <Icon v-if="form.icon" :code="form.icon" :size="size" />
          <span class="size-label">{{ size }}</span>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import Icon from '@/components/Icon/Icon.vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const form = reactive({
  icon: 'home'
})
</script>

<style scoped>
.icon-preview-list {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.size-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
```

### 菜单图标选择

用于菜单管理时的图标选择，使用 `emptyValue` 保持占位符：

```vue
<template>
  <el-form :model="menuForm" label-width="100px">
    <el-form-item label="菜单名称">
      <el-input v-model="menuForm.name" />
    </el-form-item>

    <el-form-item label="菜单图标">
      <IconSelect
        v-model="menuForm.icon"
        width="100%"
        empty-value="#"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const menuForm = reactive({
  name: '',
  icon: '#'  // 默认占位符
})
</script>
```

### 搜索功能

IconSelect 支持按代码或名称搜索图标：

```typescript
/**
 * 根据筛选条件过滤图标
 */
const filteredIcons = computed(() => {
  if (filterValue.value) {
    const keyword = filterValue.value.toLowerCase()
    return ALL_ICONS.filter((icon) =>
      icon.code.toLowerCase().includes(keyword) ||
      icon.name.toLowerCase().includes(keyword)
    )
  }
  return ALL_ICONS
})
```

**搜索示例：**

- 输入 `user` → 显示所有包含 "user" 的图标
- 输入 `用户` → 显示所有名称包含 "用户" 的图标
- 输入 `home` → 显示首页相关图标

## 常见使用场景

### 1. 导航菜单

```vue
<template>
  <el-menu>
    <el-menu-item index="1">
      <Icon code="home" size="lg" color="var(--el-menu-text-color)" />
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="2">
      <Icon code="user" size="lg" color="var(--el-menu-text-color)" />
      <span>用户管理</span>
    </el-menu-item>

    <el-menu-item index="3">
      <Icon code="setting" size="lg" color="var(--el-menu-text-color)" />
      <span>系统设置</span>
    </el-menu-item>
  </el-menu>
</template>
```

### 2. 按钮图标

```vue
<template>
  <div class="button-icons">
    <el-button type="primary">
      <Icon code="plus" size="sm" />
      <span>添加</span>
    </el-button>

    <el-button type="success">
      <Icon code="edit" size="sm" />
      <span>编辑</span>
    </el-button>

    <el-button type="danger">
      <Icon code="delete" size="sm" />
      <span>删除</span>
    </el-button>

    <el-button>
      <Icon code="download" size="sm" />
      <span>导出</span>
    </el-button>
  </div>
</template>
```

### 3. 状态图标

```vue
<template>
  <div class="status-list">
    <div class="status-item">
      <Icon code="success" size="lg" color="var(--el-color-success)" />
      <span>操作成功</span>
    </div>

    <div class="status-item">
      <Icon code="warning" size="lg" color="var(--el-color-warning)" />
      <span>警告提示</span>
    </div>

    <div class="status-item">
      <Icon code="error" size="lg" color="var(--el-color-danger)" />
      <span>操作失败</span>
    </div>

    <div class="status-item">
      <Icon code="info" size="lg" color="var(--el-color-info)" />
      <span>信息提示</span>
    </div>
  </div>
</template>

<style scoped>
.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

### 4. 操作按钮组

```vue
<template>
  <div class="action-buttons">
    <el-tooltip content="编辑">
      <Icon
        code="edit"
        size="18"
        color="#409eff"
        class="action-icon"
        @click="handleEdit"
      />
    </el-tooltip>

    <el-tooltip content="删除">
      <Icon
        code="delete"
        size="18"
        color="#f56c6c"
        class="action-icon"
        @click="handleDelete"
      />
    </el-tooltip>

    <el-tooltip content="查看">
      <Icon
        code="view"
        size="18"
        color="#67c23a"
        class="action-icon"
        @click="handleView"
      />
    </el-tooltip>

    <el-tooltip content="复制">
      <Icon
        code="copy"
        size="18"
        color="#909399"
        class="action-icon"
        @click="handleCopy"
      />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
const handleEdit = () => console.log('编辑')
const handleDelete = () => console.log('删除')
const handleView = () => console.log('查看')
const handleCopy = () => console.log('复制')
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-icon {
  cursor: pointer;
  transition: transform 0.2s;
}

.action-icon:hover {
  transform: scale(1.1);
}
</style>
```

### 5. 加载状态

```vue
<template>
  <div class="loading-container">
    <Icon
      code="loading"
      size="xl"
      color="#409eff"
      animate="rotate180"
    />
    <p>加载中...</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
}
</style>
```

### 6. 空状态

```vue
<template>
  <div class="empty-state">
    <Icon code="inbox" size="2xl" color="var(--el-text-color-placeholder)" />
    <p class="empty-text">暂无数据</p>
    <el-button type="primary" size="small">
      <Icon code="plus" size="sm" />
      添加数据
    </el-button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
}

.empty-text {
  color: var(--el-text-color-secondary);
  margin: 0;
}
</style>
```

### 7. 面包屑图标

```vue
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">
      <Icon code="home" size="sm" />
      首页
    </el-breadcrumb-item>
    <el-breadcrumb-item :to="{ path: '/system' }">
      <Icon code="setting" size="sm" />
      系统管理
    </el-breadcrumb-item>
    <el-breadcrumb-item>
      <Icon code="user" size="sm" />
      用户管理
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
```

## 主题定制

### CSS 变量

IconSelect 组件支持通过 CSS 变量自定义样式：

```css
/* 自定义 IconSelect 样式 */
.icon-select-wrapper {
  /* 边框颜色 */
  --icon-item-border: #eee;
  --icon-item-border-active: var(--el-color-primary);

  /* 背景颜色 */
  --icon-item-bg-active: var(--el-color-primary-light-9);
  --icon-info-bg: #fafafa;
}

/* 暗黑模式 */
html.dark .icon-select-wrapper {
  --icon-item-border: #4c4d4f;
  --icon-info-bg: #262727;
}
```

### 样式覆盖

```vue
<template>
  <IconSelect v-model="icon" class="custom-icon-select" />
</template>

<style scoped>
.custom-icon-select :deep(.icon-list-class) {
  /* 网格布局 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
}

.custom-icon-select :deep(.icon-item-class) {
  /* 图标项样式 */
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 18px;
}

.custom-icon-select :deep(.icon-info-bar) {
  /* 信息栏样式 */
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 8px;
}
</style>
```

## 最佳实践

### 1. 优先使用 code 属性

```vue
<!-- ✅ 推荐：使用 code（自动识别） -->
<Icon code="elevator3" />
<Icon code="home" />

<!-- ✅ 可用：使用 value（明确指定） -->
<Icon value="icon-elevator3" />
<Icon value="i-ep-home" />
```

**原因：**
- `code` 属性更简洁
- 自动识别图标类型
- 支持类型检查

### 2. 使用类型定义

```typescript
import type { IconCode } from '@/types/icons.d'

// ✅ 使用类型定义
const icon = ref<IconCode>('elevator3')

// ✅ 函数参数类型
const renderIcon = (code: IconCode) => {
  return h(Icon, { code })
}

// ❌ 避免字符串硬编码（无类型检查）
const icon = ref('elevator3')
```

### 3. 语义化图标使用

```vue
<!-- ✅ 语义化：根据功能选择图标 -->
<Icon code="success" color="var(--el-color-success)" />  <!-- 成功状态 -->
<Icon code="warning" color="var(--el-color-warning)" />  <!-- 警告状态 -->
<Icon code="delete" color="var(--el-color-danger)" />    <!-- 删除操作 -->

<!-- ❌ 避免：使用不相关的图标 -->
<Icon code="star" color="red" />  <!-- 用于表示错误？ -->
```

### 4. 合理使用动画

```vue
<!-- ✅ 有意义的动画 -->
<Icon code="notification" animate="breathing" />  <!-- 表示有新消息 -->
<Icon code="refresh" animate="rotate180" />       <!-- 刷新按钮 -->
<Icon code="loading" animate="rotate180" />       <!-- 加载状态 -->

<!-- ❌ 避免过度使用动画 -->
<div class="icon-list">
  <Icon code="home" animate="shake" />
  <Icon code="user" animate="breathing" />
  <Icon code="setting" animate="expand" />
  <!-- 太多动画会分散注意力 -->
</div>
```

### 5. 保持尺寸一致性

```vue
<template>
  <!-- ✅ 同一区域使用统一尺寸 -->
  <div class="toolbar">
    <Icon code="edit" size="lg" />
    <Icon code="delete" size="lg" />
    <Icon code="copy" size="lg" />
  </div>

  <!-- ❌ 避免尺寸不一致 -->
  <div class="toolbar">
    <Icon code="edit" size="sm" />
    <Icon code="delete" size="xl" />
    <Icon code="copy" :size="18" />
  </div>
</template>
```

## 常见问题

### 1. 图标不显示

**问题原因：**
- 图标代码不存在
- Iconfont 字体未加载
- Iconify 图标未配置

**解决方案：**

```vue
<script setup lang="ts">
import { isValidIconCode } from '@/types/icons.d'

// 检查图标代码是否有效
const iconCode = 'home'
if (!isValidIconCode(iconCode)) {
  console.warn(`图标代码 "${iconCode}" 不存在`)
}
</script>
```

确保 Iconfont 字体已正确引入：

```scss
// src/assets/styles/index.scss
@import './iconfont/iconfont.css';
```

### 2. 图标尺寸异常

**问题原因：**
- 父元素 font-size 影响
- Flex 布局影响

**解决方案：**

```vue
<template>
  <!-- 使用明确的像素尺寸 -->
  <Icon code="home" :size="24" />

  <!-- 或使用预设尺寸 -->
  <Icon code="home" size="lg" />
</template>

<style scoped>
/* 确保图标容器正确对齐 */
.icon-container {
  display: inline-flex;
  align-items: center;
}
</style>
```

### 3. 图标颜色不生效

**问题原因：**
- CSS 优先级问题
- 父元素颜色覆盖

**解决方案：**

```vue
<template>
  <!-- 使用 color 属性 -->
  <Icon code="home" color="#409eff" />

  <!-- 如果仍不生效，使用 style -->
  <Icon code="home" :style="{ color: '#409eff !important' }" />
</template>
```

### 4. 动画效果不流畅

**问题原因：**
- 浏览器性能问题
- 多个动画同时运行

**解决方案：**

```vue
<template>
  <!-- 减少同时运行的动画数量 -->
  <Icon v-if="showAnimation" code="notification" animate="breathing" />

  <!-- 使用 CSS will-change 优化 -->
  <Icon code="refresh" animate="rotate180" class="optimized-animation" />
</template>

<style scoped>
.optimized-animation {
  will-change: transform;
}
</style>
```

### 5. IconSelect 弹窗位置错误

**问题原因：**
- 父元素 overflow 设置
- 页面滚动影响

**解决方案：**

```vue
<template>
  <div class="icon-select-container">
    <IconSelect v-model="icon" />
  </div>
</template>

<style scoped>
.icon-select-container {
  /* 确保弹窗不被裁剪 */
  overflow: visible;
  position: relative;
}
</style>
```

### 6. TypeScript 类型错误

**问题描述：**
使用 `code` 属性时报类型错误

**解决方案：**

```typescript
import type { IconCode } from '@/types/icons.d'

// 确保变量类型正确
const icon = ref<IconCode>('home')

// 或使用类型断言
const dynamicIcon = computed(() => {
  return someCondition ? 'home' : 'user'
}) as ComputedRef<IconCode>
```

### 7. 图标在表格中对齐问题

**问题描述：**
表格操作列图标对齐不整齐

**解决方案：**

```vue
<template>
  <el-table-column label="操作" width="150">
    <template #default>
      <div class="table-actions">
        <Icon code="edit" :size="16" />
        <Icon code="delete" :size="16" />
        <Icon code="view" :size="16" />
      </div>
    </template>
  </el-table-column>
</template>

<style scoped>
.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.table-actions :deep(.inline-flex) {
  flex-shrink: 0;
}
</style>
```

### 8. 图标加载闪烁

**问题描述：**
页面加载时图标短暂显示为空白或方块

**解决方案：**

```vue
<template>
  <!-- 使用 v-cloak 或骨架屏 -->
  <div v-if="iconLoaded">
    <Icon code="home" />
  </div>
  <div v-else class="icon-skeleton" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const iconLoaded = ref(false)

onMounted(() => {
  // 确保字体加载完成
  document.fonts.ready.then(() => {
    iconLoaded.value = true
  })
})
</script>

<style scoped>
.icon-skeleton {
  width: 20px;
  height: 20px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
```

### 9. SSR 兼容性问题

**问题描述：**
服务端渲染时图标组件报错

**解决方案：**

```vue
<template>
  <ClientOnly>
    <Icon code="home" />
  </ClientOnly>
</template>
```

### 10. 图标无障碍访问

**问题描述：**
需要为图标添加无障碍支持

**解决方案：**

```vue
<template>
  <!-- 装饰性图标 -->
  <Icon code="home" aria-hidden="true" />

  <!-- 功能性图标需要添加说明 -->
  <button aria-label="编辑">
    <Icon code="edit" aria-hidden="true" />
  </button>

  <!-- 或使用 title -->
  <span title="删除" role="img" aria-label="删除">
    <Icon code="delete" />
  </span>
</template>
```

## 类型定义

### 完整类型

```typescript
/** 尺寸预设类型 */
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/** 动画类型 */
type AnimateType = 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'

/** Icon 组件 Props */
interface IconProps {
  value?: string
  code?: IconCode
  size?: SizePreset | string | number
  color?: string
  animate?: AnimateType
}

/** IconSelect 组件 Props */
interface IconSelectProps {
  modelValue: string
  width?: string
  emptyValue?: string
}

/** 图标项接口 */
interface IconItem {
  code: string
  name: string
}

/** Iconify 图标项接口 */
interface IconifyIconItem extends IconItem {
  value: string
}
```

### 导出常量

```typescript
/** Iconfont 图标列表 (644 个) */
export const ICONFONT_ICONS: IconItem[]

/** Iconify 图标列表 (173 个) */
export const ICONIFY_ICONS: IconifyIconItem[]

/** 所有图标列表 (817 个) */
export const ALL_ICONS: IconItem[]
```

Icon 组件提供了统一、灵活的图标使用方式，是项目中图标展示的标准解决方案。通过智能识别机制，开发者可以无缝使用 Iconfont 和 Iconify 两套图标系统，配合丰富的尺寸、颜色和动画配置，满足各种业务场景需求。
