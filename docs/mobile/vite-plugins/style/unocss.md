# UnoCSS 原子化样式插件

## 介绍

UnoCSS 是一个即时按需的原子化 CSS 引擎，为 UniApp 项目提供快速、灵活的样式解决方案。通过 `@uni-helper/unocss-preset-uni` 预设，UnoCSS 完美适配 UniApp 的多端开发需求，支持 rpx 单位转换、属性化模式、图标系统等特性。

**核心特性：**

- **即时按需生成** - 仅生成实际使用的 CSS，极致优化包体积
- **原子化类名** - 使用简短的类名快速构建 UI，如 `flex`、`mt-4`、`text-primary`
- **UniApp 适配** - 支持 rpx 单位、多端兼容、条件编译
- **属性化模式** - 支持 `text="red"` 这样的属性写法
- **图标系统** - 集成 Iconify 图标库，按需加载
- **自定义指令** - 支持 `@apply`、`@screen` 等 CSS 指令
- **分组语法** - 支持 `hover:(bg-gray text-white)` 分组写法

## 基本用法

### 插件配置

在 `vite/plugins/unocss.ts` 中配置：

```typescript
/**
 * UnoCSS 插件配置
 * 原子化 CSS 引擎，提供快速、灵活的样式解决方案
 */
export default async () => {
  const UnoCSS = (await import('unocss/vite')).default
  return UnoCSS()
}
```

### UnoCSS 配置文件

在项目根目录创建 `uno.config.ts`：

```typescript
import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    // UniApp 预设
    presetUni({
      attributify: {
        prefixedOnly: true,
      },
    }),
    // 图标预设
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    // 属性化预设
    presetAttributify(),
  ],
  transformers: [
    // 指令转换器
    transformerDirectives(),
    // 分组转换器
    transformerVariantGroup(),
  ],
  shortcuts: [
    {
      center: 'flex justify-center items-center',
    },
  ],
  safelist: [],
  rules: [
    ['p-safe', {
      padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],
  theme: {
    colors: {
      primary: 'var(--wot-color-theme,#0957DE)',
    },
    fontSize: {
      '2xs': ['20rpx', '28rpx'],
      '3xs': ['18rpx', '26rpx'],
    },
  },
})
```

## 预设配置

### presetUni

UniApp 专用预设，提供 rpx 单位支持和多端兼容：

```typescript
presetUni({
  attributify: {
    prefixedOnly: true,  // 仅使用带前缀的属性
  },
})
```

**功能说明：**

| 功能 | 说明 |
|------|------|
| rpx 支持 | 自动将数值转换为 rpx 单位 |
| 多端兼容 | 适配 H5、小程序、App 等平台 |
| 响应式 | 支持 UniApp 的响应式断点 |

### presetIcons

图标预设，集成 Iconify 图标库：

```typescript
presetIcons({
  scale: 1.2,        // 图标缩放比例
  warn: true,        // 未找到图标时警告
  extraProperties: {
    display: 'inline-block',
    'vertical-align': 'middle',
  },
})
```

**使用图标：**

```vue
<template>
  <!-- Carbon 图标集 -->
  <view class="i-carbon-sun" />
  <view class="i-carbon-moon" />

  <!-- Material Design 图标集 -->
  <view class="i-mdi-home" />
  <view class="i-mdi-account" />

  <!-- 带颜色和尺寸 -->
  <view class="i-carbon-settings text-24 text-primary" />
</template>
```

### presetAttributify

属性化模式预设，支持属性写法：

```typescript
presetAttributify()
```

**使用示例：**

```vue
<template>
  <!-- 传统类名写法 -->
  <view class="flex items-center justify-between p-4 bg-white">
    内容
  </view>

  <!-- 属性化写法 -->
  <view flex items-center justify-between p-4 bg-white>
    内容
  </view>

  <!-- 混合写法 -->
  <view class="container" flex items-center>
    内容
  </view>
</template>
```

## 转换器配置

### transformerDirectives

支持 CSS 指令，如 `@apply`、`@screen`、`theme()`：

```typescript
transformerDirectives()
```

**使用示例：**

```vue
<style lang="scss" scoped>
.button {
  @apply flex items-center justify-center;
  @apply px-4 py-2 rounded-lg;
  @apply bg-primary text-white;

  &:hover {
    @apply bg-primary/80;
  }
}

.container {
  padding: theme('spacing.4');
  color: theme('colors.primary');
}
</style>
```

### transformerVariantGroup

支持分组语法，减少重复前缀：

```typescript
transformerVariantGroup()
```

**使用示例：**

```vue
<template>
  <!-- 不使用分组 -->
  <view class="hover:bg-gray-400 hover:font-medium hover:text-white">
    悬停效果
  </view>

  <!-- 使用分组 -->
  <view class="hover:(bg-gray-400 font-medium text-white)">
    悬停效果
  </view>

  <!-- 复杂分组 -->
  <view class="font-(light mono) text-(center lg)">
    组合样式
  </view>
</template>
```

## 快捷方式

### 内置快捷方式

```typescript
shortcuts: [
  {
    center: 'flex justify-center items-center',
  },
],
```

**使用示例：**

```vue
<template>
  <!-- 使用快捷方式 -->
  <view class="center h-100">
    居中内容
  </view>

  <!-- 等同于 -->
  <view class="flex justify-center items-center h-100">
    居中内容
  </view>
</template>
```

### 自定义快捷方式

```typescript
shortcuts: [
  // 对象形式
  {
    center: 'flex justify-center items-center',
    btn: 'px-4 py-2 rounded-lg cursor-pointer',
    'btn-primary': 'btn bg-primary text-white',
    'btn-outline': 'btn border border-primary text-primary',
  },
  // 动态快捷方式
  [/^btn-(.*)$/, ([, c]) => `bg-${c} text-white px-4 py-2 rounded-lg`],
],
```

## 自定义规则

### 安全区域规则

项目预置了安全区域相关的规则：

```typescript
rules: [
  // 全方向安全区域内边距
  ['p-safe', {
    padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
  }],
  // 顶部安全区域
  ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
  // 底部安全区域
  ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
],
```

**使用示例：**

```vue
<template>
  <!-- 适配刘海屏顶部 -->
  <view class="pt-safe bg-primary">
    <text class="text-white">导航栏</text>
  </view>

  <!-- 适配底部安全区域 -->
  <view class="pb-safe bg-white">
    <button>提交</button>
  </view>
</template>
```

### 自定义规则示例

```typescript
rules: [
  // 静态规则
  ['custom-shadow', { 'box-shadow': '0 4rpx 12rpx rgba(0, 0, 0, 0.1)' }],

  // 动态规则
  [/^text-(\d+)$/, ([, d]) => ({ 'font-size': `${d}rpx` })],
  [/^w-(\d+)$/, ([, d]) => ({ width: `${d}rpx` })],
  [/^h-(\d+)$/, ([, d]) => ({ height: `${d}rpx` })],

  // 带正则的复杂规则
  [/^m-(\d+)-(\d+)$/, ([, x, y]) => ({
    'margin-left': `${x}rpx`,
    'margin-right': `${x}rpx`,
    'margin-top': `${y}rpx`,
    'margin-bottom': `${y}rpx`,
  })],
],
```

## 主题配置

### 颜色主题

```typescript
theme: {
  colors: {
    // 主题色（使用 CSS 变量支持动态切换）
    primary: 'var(--wot-color-theme,#0957DE)',

    // 自定义颜色
    success: '#07c160',
    warning: '#ff976a',
    danger: '#ee0a24',
    info: '#909399',

    // 灰度色阶
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
},
```

**使用示例：**

```vue
<template>
  <view class="text-primary">主题色文字</view>
  <view class="bg-success text-white">成功背景</view>
  <view class="border-danger">危险边框</view>
  <view class="text-gray-500">灰色文字</view>
</template>
```

### 字体尺寸

```typescript
theme: {
  fontSize: {
    // 超小号字体
    '2xs': ['20rpx', '28rpx'],  // [字号, 行高]
    '3xs': ['18rpx', '26rpx'],

    // 标准字体
    xs: ['24rpx', '32rpx'],
    sm: ['28rpx', '36rpx'],
    base: ['32rpx', '44rpx'],
    lg: ['36rpx', '48rpx'],
    xl: ['40rpx', '52rpx'],
    '2xl': ['48rpx', '60rpx'],
  },
},
```

**使用示例：**

```vue
<template>
  <text class="text-3xs">超小号文字</text>
  <text class="text-base">正常文字</text>
  <text class="text-2xl font-bold">大标题</text>
</template>
```

## 常用类名速查

### 布局

| 类名 | CSS 属性 |
|------|----------|
| `flex` | `display: flex` |
| `inline-flex` | `display: inline-flex` |
| `block` | `display: block` |
| `hidden` | `display: none` |
| `flex-row` | `flex-direction: row` |
| `flex-col` | `flex-direction: column` |
| `flex-wrap` | `flex-wrap: wrap` |
| `flex-1` | `flex: 1 1 0%` |
| `items-center` | `align-items: center` |
| `items-start` | `align-items: flex-start` |
| `items-end` | `align-items: flex-end` |
| `justify-center` | `justify-content: center` |
| `justify-between` | `justify-content: space-between` |
| `justify-around` | `justify-content: space-around` |

### 间距

| 类名 | CSS 属性 |
|------|----------|
| `p-4` | `padding: 16rpx` |
| `px-4` | `padding-left: 16rpx; padding-right: 16rpx` |
| `py-4` | `padding-top: 16rpx; padding-bottom: 16rpx` |
| `pt-4` | `padding-top: 16rpx` |
| `m-4` | `margin: 16rpx` |
| `mx-auto` | `margin-left: auto; margin-right: auto` |
| `mt-4` | `margin-top: 16rpx` |
| `gap-4` | `gap: 16rpx` |

### 尺寸

| 类名 | CSS 属性 |
|------|----------|
| `w-full` | `width: 100%` |
| `w-screen` | `width: 100vw` |
| `w-100` | `width: 100rpx` |
| `h-full` | `height: 100%` |
| `h-screen` | `height: 100vh` |
| `h-100` | `height: 100rpx` |
| `min-h-screen` | `min-height: 100vh` |
| `max-w-full` | `max-width: 100%` |

### 文字

| 类名 | CSS 属性 |
|------|----------|
| `text-center` | `text-align: center` |
| `text-left` | `text-align: left` |
| `text-right` | `text-align: right` |
| `font-bold` | `font-weight: bold` |
| `font-medium` | `font-weight: 500` |
| `text-sm` | `font-size: 28rpx` |
| `text-base` | `font-size: 32rpx` |
| `text-lg` | `font-size: 36rpx` |
| `text-primary` | `color: var(--wot-color-theme)` |
| `text-white` | `color: white` |
| `text-gray-500` | `color: #9e9e9e` |

### 背景

| 类名 | CSS 属性 |
|------|----------|
| `bg-white` | `background-color: white` |
| `bg-primary` | `background-color: var(--wot-color-theme)` |
| `bg-gray-100` | `background-color: #f5f5f5` |
| `bg-transparent` | `background-color: transparent` |
| `bg-cover` | `background-size: cover` |
| `bg-center` | `background-position: center` |

### 边框

| 类名 | CSS 属性 |
|------|----------|
| `border` | `border-width: 1px` |
| `border-2` | `border-width: 2px` |
| `border-t` | `border-top-width: 1px` |
| `border-b` | `border-bottom-width: 1px` |
| `border-primary` | `border-color: var(--wot-color-theme)` |
| `border-gray-200` | `border-color: #eeeeee` |
| `rounded` | `border-radius: 8rpx` |
| `rounded-lg` | `border-radius: 16rpx` |
| `rounded-full` | `border-radius: 9999px` |

### 定位

| 类名 | CSS 属性 |
|------|----------|
| `relative` | `position: relative` |
| `absolute` | `position: absolute` |
| `fixed` | `position: fixed` |
| `sticky` | `position: sticky` |
| `top-0` | `top: 0` |
| `right-0` | `right: 0` |
| `bottom-0` | `bottom: 0` |
| `left-0` | `left: 0` |
| `inset-0` | `top: 0; right: 0; bottom: 0; left: 0` |
| `z-10` | `z-index: 10` |

### 其他

| 类名 | CSS 属性 |
|------|----------|
| `overflow-hidden` | `overflow: hidden` |
| `overflow-auto` | `overflow: auto` |
| `opacity-50` | `opacity: 0.5` |
| `cursor-pointer` | `cursor: pointer` |
| `select-none` | `user-select: none` |
| `transition` | `transition: all 0.3s` |

## 使用示例

### 卡片组件

```vue
<template>
  <view class="bg-white rounded-lg p-4 shadow-sm">
    <view class="flex items-center gap-3">
      <image class="w-80 h-80 rounded-full" :src="avatar" />
      <view class="flex-1">
        <text class="text-lg font-medium">用户名</text>
        <text class="text-sm text-gray-500 mt-1">这是一段描述文字</text>
      </view>
      <view class="i-carbon-chevron-right text-gray-400" />
    </view>
  </view>
</template>
```

### 按钮样式

```vue
<template>
  <view class="flex gap-3 p-4">
    <!-- 主要按钮 -->
    <button class="flex-1 center h-88 bg-primary text-white rounded-lg">
      主要按钮
    </button>

    <!-- 次要按钮 -->
    <button class="flex-1 center h-88 bg-gray-100 text-gray-700 rounded-lg">
      次要按钮
    </button>

    <!-- 边框按钮 -->
    <button class="flex-1 center h-88 border border-primary text-primary rounded-lg bg-transparent">
      边框按钮
    </button>
  </view>
</template>
```

### 列表布局

```vue
<template>
  <view class="bg-gray-50 min-h-screen">
    <view class="bg-white">
      <view
        v-for="item in list"
        :key="item.id"
        class="flex items-center px-4 py-3 border-b border-gray-100"
      >
        <image class="w-100 h-100 rounded-lg" :src="item.image" />
        <view class="flex-1 ml-3">
          <text class="text-base font-medium">{{ item.title }}</text>
          <text class="text-sm text-gray-500 mt-1">{{ item.desc }}</text>
        </view>
        <text class="text-primary text-lg font-bold">¥{{ item.price }}</text>
      </view>
    </view>
  </view>
</template>
```

### 响应式布局

```vue
<template>
  <view class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
    <view
      v-for="i in 8"
      :key="i"
      class="aspect-square bg-gray-100 rounded-lg center"
    >
      {{ i }}
    </view>
  </view>
</template>
```

## 工作原理

```text
┌─────────────────────────────────────────────────────────────┐
│                    UnoCSS 工作流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 读取配置文件 (uno.config.ts)                             │
│       ↓                                                     │
│  2. 加载预设和规则                                           │
│       ├─ presetUni (UniApp 适配)                            │
│       ├─ presetIcons (图标支持)                              │
│       └─ presetAttributify (属性化)                          │
│       ↓                                                     │
│  3. 扫描源文件                                               │
│       ├─ .vue 文件                                          │
│       ├─ .ts 文件                                           │
│       └─ .tsx 文件                                          │
│       ↓                                                     │
│  4. 提取类名和属性                                           │
│       ├─ class="flex items-center"                          │
│       ├─ flex items-center (属性化)                          │
│       └─ @apply flex (指令)                                  │
│       ↓                                                     │
│  5. 匹配规则生成 CSS                                         │
│       ├─ 内置规则                                            │
│       ├─ 自定义规则                                          │
│       └─ 快捷方式                                            │
│       ↓                                                     │
│  6. 输出优化后的 CSS                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 最佳实践

### 1. 合理使用快捷方式

```typescript
// ✅ 推荐：常用组合定义为快捷方式
shortcuts: {
  'card': 'bg-white rounded-lg p-4 shadow-sm',
  'btn': 'center px-4 py-2 rounded-lg',
  'input-base': 'w-full h-88 px-3 border rounded-lg',
}
```

### 2. 利用 CSS 变量

```typescript
theme: {
  colors: {
    // 使用 CSS 变量支持主题切换
    primary: 'var(--theme-primary, #0957DE)',
    secondary: 'var(--theme-secondary, #6c757d)',
  },
}
```

### 3. 避免过长的类名

```vue
<!-- ❌ 不推荐：类名过多 -->
<view class="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 rounded-lg shadow-sm">

<!-- ✅ 推荐：使用快捷方式或提取组件 -->
<view class="list-item">
```

### 4. 使用分组语法

```vue
<!-- ✅ 推荐：使用分组减少重复 -->
<view class="hover:(bg-gray-100 text-primary) active:(scale-95)">
  可交互元素
</view>
```

## 常见问题

### 1. 样式未生效

**问题原因：**
- 类名不在扫描范围内
- 动态类名未被识别

**解决方案：**

```typescript
// 将动态类名添加到 safelist
safelist: ['text-red', 'text-green', 'text-blue'],
```

或使用完整类名：

```vue
<!-- ❌ 动态类名可能不被识别 -->
<view :class="`text-${color}`" />

<!-- ✅ 使用对象语法 -->
<view :class="{ 'text-red': color === 'red', 'text-blue': color === 'blue' }" />
```

### 2. rpx 单位问题

**问题原因：**
- 部分平台不支持 rpx

**解决方案：**

使用 presetUni 预设，自动处理单位转换。

### 3. 图标不显示

**问题原因：**
- 图标集未安装
- 图标名称错误

**解决方案：**

```bash
# 安装图标集
pnpm add -D @iconify-json/carbon @iconify-json/mdi
```

### 4. 属性化模式冲突

**问题原因：**
- 与 HTML 原生属性冲突

**解决方案：**

```typescript
presetUni({
  attributify: {
    prefixedOnly: true,  // 仅使用带前缀的属性
    prefix: 'un-',       // 添加前缀
  },
})
```

```vue
<!-- 使用前缀 -->
<view un-flex un-items-center>
  内容
</view>
```

