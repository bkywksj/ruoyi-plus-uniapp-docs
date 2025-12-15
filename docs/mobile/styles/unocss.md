# UnoCSS 配置

## 概述

RuoYi-Plus-UniApp 移动端项目集成了 UnoCSS 作为原子化 CSS 框架,提供即时生成、按需加载的样式解决方案。项目基于 `@uni-helper/unocss-preset-uni` 预设进行了深度定制,完美适配 UniApp 多端编译需求。

### 核心特性

- **即时生成** - 基于源码按需生成 CSS,无冗余样式
- **UniApp 适配** - 使用 uni-helper 预设,完美支持小程序和 H5
- **属性化模式** - 支持 class 和属性两种书写方式
- **图标集成** - 内置 Iconify 图标库,海量图标开箱即用
- **CSS 指令** - 支持 `@apply`、`@screen`、`theme()` 等指令
- **分组语法** - 支持 `hover:(bg-gray-400 font-medium)` 分组写法
- **主题联动** - 与 WD UI 主题系统深度集成
- **自定义规则** - 内置安全区域适配等实用规则

### 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| unocss | 65.4.2 | UnoCSS 核心包 |
| @uni-helper/unocss-preset-uni | 0.2.11 | UniApp 专用预设 |
| @unocss/eslint-plugin | 66.2.3 | ESLint 插件 |

## 配置文件

### 基础配置

项目的 UnoCSS 配置位于 `uno.config.ts` 文件:

```typescript
// uno.config.ts
import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // 预设配置
  presets: [
    // UniApp 框架预设
    presetUni({
      attributify: {
        prefixedOnly: true,  // 属性化模式需要前缀
      },
    }),

    // Iconify 图标预设
    presetIcons({
      scale: 1.2,           // 图标缩放比例
      warn: true,           // 启用警告提示
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),

    // CSS class 属性化支持
    presetAttributify(),
  ],

  // 转换器配置
  transformers: [
    // 启用 @apply、@screen、theme() 等 CSS 指令
    transformerDirectives(),

    // 启用分组语法 hover:(bg-gray-400 font-medium)
    transformerVariantGroup(),
  ],

  // 快捷方式
  shortcuts: [
    {
      center: 'flex justify-center items-center',
    },
  ],

  // 自定义规则
  rules: [
    // 安全区域适配
    [
      'p-safe',
      {
        padding:
          'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
    ],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],

  // 主题扩展
  theme: {
    colors: {
      // 引用 CSS 变量,与 WD UI 主题联动
      primary: 'var(--wot-color-theme, #0957DE)',
    },
    fontSize: {
      // 自定义超小字体尺寸
      '2xs': ['20rpx', '28rpx'],
      '3xs': ['18rpx', '26rpx'],
    },
  },
})
```

### Vite 插件配置

UnoCSS 通过 Vite 插件集成到项目构建流程中:

```typescript
// vite/plugins/index.ts
export async function createVitePlugins() {
  const vitePlugins: PluginOption[] = []

  // ... 其他插件配置

  // UnoCSS 原子化 CSS 引擎
  const UnoCSS = (await import('unocss/vite')).default
  vitePlugins.push(UnoCSS())

  return vitePlugins
}
```

### 样式导入

在项目入口文件中导入 UnoCSS 生成的样式:

```typescript
// src/main.ts
import '@/static/style/index.scss'
import 'uno.css'  // 导入 UnoCSS 生成的样式
```

## 预设说明

### presetUni

`@uni-helper/unocss-preset-uni` 是专为 UniApp 设计的 UnoCSS 预设,提供了以下适配:

**rpx 单位支持:**

```vue
<template>
  <!-- 自动转换为 rpx 单位 -->
  <view class="w-200 h-100">内容</view>
  <!-- 等同于 width: 200rpx; height: 100rpx; -->
</template>
```

**百分比支持:**

```vue
<template>
  <view class="w-100% h-50%">全宽半高</view>
  <view class="w-full h-screen">全屏</view>
</template>
```

**属性化模式:**

```vue
<template>
  <!-- 需要 un- 前缀 -->
  <view un-flex un-items-center un-justify-center>
    居中内容
  </view>
</template>
```

### presetIcons

图标预设集成了 Iconify 图标库,支持超过 100,000 个图标:

```vue
<template>
  <!-- 使用图标 -->
  <view class="i-carbon-sun" />
  <view class="i-mdi-home" />
  <view class="i-ph-user-bold" />

  <!-- 设置大小和颜色 -->
  <view class="i-carbon-sun w-8 h-8 text-primary" />
</template>
```

**图标配置:**

```typescript
presetIcons({
  scale: 1.2,           // 默认缩放 1.2 倍
  warn: true,           // 图标不存在时显示警告
  extraProperties: {
    display: 'inline-block',
    'vertical-align': 'middle',
  },
})
```

### presetAttributify

属性化预设允许将样式作为 HTML 属性书写:

```vue
<template>
  <!-- 属性化写法 -->
  <view
    flex
    items-center
    justify-between
    p-4
    bg-white
    rounded-lg
  >
    内容
  </view>

  <!-- 等同于 class 写法 -->
  <view class="flex items-center justify-between p-4 bg-white rounded-lg">
    内容
  </view>
</template>
```

## 转换器

### transformerDirectives

启用 CSS 指令支持:

**@apply 指令:**

```scss
.custom-button {
  @apply bg-primary text-white px-4 py-2 rounded-lg;
  @apply hover:bg-primary/80 active:scale-95;
}
```

**@screen 指令:**

```scss
.responsive-text {
  font-size: 14px;

  @screen sm {
    font-size: 16px;
  }

  @screen md {
    font-size: 18px;
  }
}
```

**theme() 函数:**

```scss
.themed-element {
  color: theme('colors.primary');
  font-size: theme('fontSize.lg');
  padding: theme('spacing.4');
}
```

### transformerVariantGroup

启用分组语法,简化重复前缀:

```vue
<template>
  <!-- 分组写法 -->
  <view class="hover:(bg-gray-100 text-primary scale-105)">
    悬停效果
  </view>

  <!-- 等同于 -->
  <view class="hover:bg-gray-100 hover:text-primary hover:scale-105">
    悬停效果
  </view>

  <!-- 多状态分组 -->
  <view class="dark:(bg-gray-800 text-white) hover:(bg-gray-700)">
    深色模式
  </view>
</template>
```

## 快捷方式

### 内置快捷方式

项目内置了常用的快捷方式:

```typescript
shortcuts: [
  {
    center: 'flex justify-center items-center',
  },
]
```

**使用示例:**

```vue
<template>
  <!-- 使用 center 快捷方式 -->
  <view class="center h-100">
    <text>居中内容</text>
  </view>
</template>
```

### 自定义快捷方式

可以根据项目需求添加更多快捷方式:

```typescript
shortcuts: [
  // 对象形式
  {
    center: 'flex justify-center items-center',
    'flex-center': 'flex justify-center items-center',
    'flex-between': 'flex justify-between items-center',
    'flex-around': 'flex justify-around items-center',
    'flex-col-center': 'flex flex-col justify-center items-center',
  },

  // 正则匹配形式
  [/^btn-(.*)$/, ([, c]) => `bg-${c} text-white px-4 py-2 rounded-lg`],

  // 数组形式(带变体)
  ['card', 'bg-white rounded-lg shadow-sm p-4'],
  ['page-container', 'min-h-screen bg-gray-50 p-4'],
]
```

**使用示例:**

```vue
<template>
  <!-- 使用自定义快捷方式 -->
  <view class="page-container">
    <view class="card mb-4">
      <view class="flex-between">
        <text>标题</text>
        <text>更多</text>
      </view>
    </view>
  </view>
</template>
```

## 自定义规则

### 安全区域适配

项目内置了 iOS 安全区域适配规则:

```typescript
rules: [
  // 全方向安全区域内边距
  [
    'p-safe',
    {
      padding:
        'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    },
  ],
  // 顶部安全区域
  ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
  // 底部安全区域
  ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
]
```

**使用示例:**

```vue
<template>
  <!-- 顶部导航栏适配刘海屏 -->
  <view class="pt-safe bg-white">
    <wd-navbar title="标题" />
  </view>

  <!-- 底部按钮适配安全区域 -->
  <view class="fixed bottom-0 left-0 right-0 pb-safe bg-white">
    <wd-button block>确认</wd-button>
  </view>
</template>
```

### 添加自定义规则

可以根据需求添加更多自定义规则:

```typescript
rules: [
  // 文本截断
  ['text-truncate', { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],

  // 多行截断
  [/^line-clamp-(\d+)$/, ([, d]) => ({
    display: '-webkit-box',
    '-webkit-line-clamp': d,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  })],

  // 安全区域变量
  ['pl-safe', { 'padding-left': 'env(safe-area-inset-left)' }],
  ['pr-safe', { 'padding-right': 'env(safe-area-inset-right)' }],
  ['ml-safe', { 'margin-left': 'env(safe-area-inset-left)' }],
  ['mr-safe', { 'margin-right': 'env(safe-area-inset-right)' }],
  ['mt-safe', { 'margin-top': 'env(safe-area-inset-top)' }],
  ['mb-safe', { 'margin-bottom': 'env(safe-area-inset-bottom)' }],

  // 动态规则
  [/^size-(\d+)$/, ([, d]) => ({ width: `${d}rpx`, height: `${d}rpx` })],
]
```

## 主题配置

### 颜色扩展

```typescript
theme: {
  colors: {
    // 主题色 - 与 WD UI 联动
    primary: 'var(--wot-color-theme, #0957DE)',
    success: 'var(--wot-color-success, #34d19d)',
    warning: 'var(--wot-color-warning, #f0883a)',
    danger: 'var(--wot-color-danger, #fa4350)',

    // 文字颜色
    title: 'var(--wot-color-title, #000000)',
    content: 'var(--wot-color-content, #262626)',
    secondary: 'var(--wot-color-secondary, #595959)',
    tip: 'var(--wot-color-tip, #bfbfbf)',

    // 背景颜色
    page: 'var(--wot-color-bg, #f5f5f5)',
    card: '#ffffff',

    // 边框颜色
    border: 'var(--wot-color-border, #d9d9d9)',
    'border-light': 'var(--wot-color-border-light, #e8e8e8)',
  },
}
```

**使用示例:**

```vue
<template>
  <view class="bg-page min-h-screen">
    <view class="bg-card m-4 p-4 rounded-lg border border-border-light">
      <text class="text-title text-lg">标题</text>
      <text class="text-content">内容文字</text>
      <text class="text-tip text-sm">提示文字</text>
    </view>

    <wd-button custom-class="bg-primary text-white">
      主题按钮
    </wd-button>
  </view>
</template>
```

### 字体尺寸扩展

```typescript
theme: {
  fontSize: {
    // 默认字体尺寸 (UnoCSS 内置)
    // xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 20px...

    // 自定义超小字体 (rpx 单位)
    '2xs': ['20rpx', '28rpx'],  // [font-size, line-height]
    '3xs': ['18rpx', '26rpx'],

    // 适配 rpx 的字体尺寸
    'rpx-24': ['24rpx', '32rpx'],
    'rpx-28': ['28rpx', '40rpx'],
    'rpx-32': ['32rpx', '44rpx'],
    'rpx-36': ['36rpx', '48rpx'],
    'rpx-40': ['40rpx', '52rpx'],
  },
}
```

**使用示例:**

```vue
<template>
  <view>
    <text class="text-3xs text-tip">超小提示文字</text>
    <text class="text-2xs">小号文字</text>
    <text class="text-rpx-28">正文内容</text>
    <text class="text-rpx-32 font-medium">标题文字</text>
  </view>
</template>
```

### 间距扩展

```typescript
theme: {
  spacing: {
    // 默认间距 (UnoCSS 内置)
    // 0: 0, 1: 0.25rem, 2: 0.5rem...

    // 自定义 rpx 间距
    'rpx-8': '8rpx',
    'rpx-12': '12rpx',
    'rpx-16': '16rpx',
    'rpx-20': '20rpx',
    'rpx-24': '24rpx',
    'rpx-32': '32rpx',
    'rpx-40': '40rpx',
    'rpx-48': '48rpx',

    // 页面边距
    'page': '30rpx',
  },
}
```

## 常用原子类

### 布局类

```vue
<template>
  <!-- Flexbox -->
  <view class="flex">Flex 容器</view>
  <view class="flex-col">纵向排列</view>
  <view class="flex-row">横向排列</view>
  <view class="flex-wrap">允许换行</view>
  <view class="flex-nowrap">不换行</view>
  <view class="flex-1">占据剩余空间</view>
  <view class="flex-none">不伸缩</view>
  <view class="flex-shrink-0">禁止收缩</view>
  <view class="flex-grow">允许增长</view>

  <!-- 对齐方式 -->
  <view class="justify-start">起始对齐</view>
  <view class="justify-center">水平居中</view>
  <view class="justify-end">末尾对齐</view>
  <view class="justify-between">两端对齐</view>
  <view class="justify-around">均匀分布</view>

  <view class="items-start">顶部对齐</view>
  <view class="items-center">垂直居中</view>
  <view class="items-end">底部对齐</view>
  <view class="items-stretch">拉伸填充</view>

  <!-- 定位 -->
  <view class="relative">相对定位</view>
  <view class="absolute">绝对定位</view>
  <view class="fixed">固定定位</view>
  <view class="sticky">粘性定位</view>

  <view class="top-0">顶部 0</view>
  <view class="bottom-0">底部 0</view>
  <view class="left-0">左侧 0</view>
  <view class="right-0">右侧 0</view>
  <view class="inset-0">全方向 0</view>

  <!-- 层级 -->
  <view class="z-10">z-index: 10</view>
  <view class="z-50">z-index: 50</view>
  <view class="z-100">z-index: 100</view>
</template>
```

### 尺寸类

```vue
<template>
  <!-- 宽度 -->
  <view class="w-100">100rpx 宽</view>
  <view class="w-200">200rpx 宽</view>
  <view class="w-100%">100% 宽</view>
  <view class="w-50%">50% 宽</view>
  <view class="w-full">全宽</view>
  <view class="w-screen">屏幕宽</view>
  <view class="w-auto">自动宽度</view>
  <view class="min-w-0">最小宽度 0</view>
  <view class="max-w-100%">最大宽度 100%</view>

  <!-- 高度 -->
  <view class="h-100">100rpx 高</view>
  <view class="h-200">200rpx 高</view>
  <view class="h-100%">100% 高</view>
  <view class="h-50%">50% 高</view>
  <view class="h-full">全高</view>
  <view class="h-screen">屏幕高</view>
  <view class="h-100vh">100vh 高</view>
  <view class="min-h-0">最小高度 0</view>
  <view class="min-h-screen">最小屏幕高</view>
</template>
```

### 间距类

```vue
<template>
  <!-- 外边距 -->
  <view class="m-4">四周边距</view>
  <view class="mx-4">水平边距</view>
  <view class="my-4">垂直边距</view>
  <view class="mt-4">顶部边距</view>
  <view class="mr-4">右侧边距</view>
  <view class="mb-4">底部边距</view>
  <view class="ml-4">左侧边距</view>
  <view class="m-auto">自动居中</view>

  <!-- 内边距 -->
  <view class="p-4">四周内边距</view>
  <view class="px-4">水平内边距</view>
  <view class="py-4">垂直内边距</view>
  <view class="pt-4">顶部内边距</view>
  <view class="pr-4">右侧内边距</view>
  <view class="pb-4">底部内边距</view>
  <view class="pl-4">左侧内边距</view>

  <!-- rpx 单位间距 -->
  <view class="p-10">10rpx 内边距</view>
  <view class="m-20">20rpx 外边距</view>
</template>
```

### 文字类

```vue
<template>
  <!-- 字体大小 -->
  <text class="text-xs">12px</text>
  <text class="text-sm">14px</text>
  <text class="text-base">16px</text>
  <text class="text-lg">18px</text>
  <text class="text-xl">20px</text>
  <text class="text-2xl">24px</text>
  <text class="text-2xs">20rpx (自定义)</text>
  <text class="text-3xs">18rpx (自定义)</text>

  <!-- 字体粗细 -->
  <text class="font-normal">正常</text>
  <text class="font-medium">中等</text>
  <text class="font-semibold">半粗</text>
  <text class="font-bold">粗体</text>

  <!-- 文本颜色 -->
  <text class="text-black">黑色</text>
  <text class="text-white">白色</text>
  <text class="text-gray-500">灰色</text>
  <text class="text-primary">主题色</text>
  <text class="text-success">成功色</text>
  <text class="text-warning">警告色</text>
  <text class="text-danger">危险色</text>

  <!-- 文本对齐 -->
  <text class="text-left">左对齐</text>
  <text class="text-center">居中</text>
  <text class="text-right">右对齐</text>

  <!-- 文本装饰 -->
  <text class="underline">下划线</text>
  <text class="line-through">删除线</text>
  <text class="no-underline">无装饰</text>

  <!-- 文本换行 -->
  <text class="whitespace-nowrap">不换行</text>
  <text class="whitespace-pre-wrap">保留空白</text>
  <text class="truncate">文本截断...</text>
</template>
```

### 背景和边框类

```vue
<template>
  <!-- 背景颜色 -->
  <view class="bg-white">白色背景</view>
  <view class="bg-gray-100">浅灰背景</view>
  <view class="bg-primary">主题色背景</view>
  <view class="bg-transparent">透明背景</view>

  <!-- 背景透明度 -->
  <view class="bg-black/50">50% 透明黑</view>
  <view class="bg-primary/80">80% 主题色</view>

  <!-- 边框 -->
  <view class="border">默认边框</view>
  <view class="border-2">2px 边框</view>
  <view class="border-t">顶部边框</view>
  <view class="border-b">底部边框</view>
  <view class="border-l">左侧边框</view>
  <view class="border-r">右侧边框</view>

  <!-- 边框颜色 -->
  <view class="border border-gray-200">灰色边框</view>
  <view class="border border-primary">主题色边框</view>

  <!-- 边框样式 -->
  <view class="border border-solid">实线边框</view>
  <view class="border border-dashed">虚线边框</view>
  <view class="border border-dotted">点线边框</view>

  <!-- 圆角 -->
  <view class="rounded">默认圆角</view>
  <view class="rounded-lg">大圆角</view>
  <view class="rounded-xl">超大圆角</view>
  <view class="rounded-full">圆形</view>
  <view class="rounded-6">6rpx 圆角</view>
  <view class="rounded-12">12rpx 圆角</view>
</template>
```

### 阴影类

```vue
<template>
  <view class="shadow-sm">小阴影</view>
  <view class="shadow">默认阴影</view>
  <view class="shadow-md">中等阴影</view>
  <view class="shadow-lg">大阴影</view>
  <view class="shadow-xl">超大阴影</view>
  <view class="shadow-none">无阴影</view>
</template>
```

### 显示和溢出类

```vue
<template>
  <!-- 显示类型 -->
  <view class="block">块级元素</view>
  <view class="inline-block">行内块</view>
  <view class="inline">行内元素</view>
  <view class="hidden">隐藏</view>

  <!-- 溢出处理 -->
  <view class="overflow-hidden">隐藏溢出</view>
  <view class="overflow-auto">自动滚动</view>
  <view class="overflow-scroll">始终滚动</view>
  <view class="overflow-x-auto">水平滚动</view>
  <view class="overflow-y-auto">垂直滚动</view>
</template>
```

## 实际应用示例

### 页面布局

```vue
<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航 -->
    <view class="pt-safe bg-white">
      <wd-navbar title="页面标题" />
    </view>

    <!-- 主内容区 -->
    <view class="flex-1 p-4 overflow-y-auto">
      <!-- 卡片列表 -->
      <view
        v-for="item in list"
        :key="item.id"
        class="bg-white rounded-lg p-4 mb-4 shadow-sm"
      >
        <view class="flex items-center mb-3">
          <image :src="item.avatar" class="w-80 h-80 rounded-full mr-3" />
          <view class="flex-1">
            <text class="text-lg font-medium text-title">{{ item.name }}</text>
            <text class="text-sm text-secondary block mt-1">{{ item.desc }}</text>
          </view>
        </view>
        <text class="text-content">{{ item.content }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="pb-safe bg-white border-t border-gray-100">
      <view class="flex p-4">
        <wd-button class="flex-1 mr-2" plain>取消</wd-button>
        <wd-button class="flex-1" type="primary">确认</wd-button>
      </view>
    </view>
  </view>
</template>
```

### 登录表单

```vue
<template>
  <view class="h-100vh flex flex-col items-center bg-white">
    <!-- Logo -->
    <view class="mt-80 mb-40">
      <wd-img width="150" height="150" src="/static/logo.png" />
    </view>

    <!-- 表单 -->
    <view class="w-100% px-40">
      <wd-input
        v-model="form.username"
        no-border
        custom-input-class="border border-solid border-gray-200 rounded-8 px-4 py-3"
        placeholder="请输入用户名"
        clearable
      />

      <wd-input
        v-model="form.password"
        no-border
        type="password"
        custom-input-class="border border-solid border-gray-200 rounded-8 px-4 py-3 mt-4"
        placeholder="请输入密码"
        clearable
        show-password
      />

      <wd-button
        type="primary"
        block
        custom-class="mt-8 rounded-8"
        @click="handleLogin"
      >
        登录
      </wd-button>

      <view class="flex justify-between mt-4">
        <text class="text-sm text-primary" @click="toRegister">注册账号</text>
        <text class="text-sm text-secondary" @click="toForget">忘记密码?</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

const handleLogin = () => {
  // 登录逻辑
}

const toRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}

const toForget = () => {
  uni.navigateTo({ url: '/pages/forget/index' })
}
</script>
```

### 商品卡片

```vue
<template>
  <view class="grid grid-cols-2 gap-3 p-4">
    <view
      v-for="item in products"
      :key="item.id"
      class="bg-white rounded-lg overflow-hidden shadow-sm"
      @click="toDetail(item.id)"
    >
      <!-- 商品图片 -->
      <view class="relative">
        <image
          :src="item.image"
          mode="aspectFill"
          class="w-100% h-300"
        />
        <view
          v-if="item.tag"
          class="absolute top-2 left-2 bg-danger text-white text-2xs px-2 py-1 rounded"
        >
          {{ item.tag }}
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="p-3">
        <text class="text-sm text-title line-clamp-2">{{ item.name }}</text>
        <view class="flex items-baseline mt-2">
          <text class="text-danger text-lg font-bold">¥{{ item.price }}</text>
          <text class="text-tip text-xs line-through ml-2">¥{{ item.originalPrice }}</text>
        </view>
        <view class="flex items-center justify-between mt-2">
          <text class="text-tip text-xs">已售 {{ item.sales }}</text>
          <view class="i-carbon-shopping-cart text-primary w-5 h-5" />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
```

### 用户信息卡片

```vue
<template>
  <view class="bg-primary pt-safe">
    <view class="px-4 py-6">
      <!-- 用户基本信息 -->
      <view class="flex items-center">
        <image
          :src="userInfo.avatar"
          class="w-120 h-120 rounded-full border-4 border-white/30"
        />
        <view class="ml-4 flex-1">
          <view class="flex items-center">
            <text class="text-xl text-white font-bold">{{ userInfo.nickname }}</text>
            <view class="ml-2 bg-white/20 px-2 py-0.5 rounded-full">
              <text class="text-white text-xs">{{ userInfo.level }}</text>
            </view>
          </view>
          <text class="text-white/70 text-sm mt-1 block">
            {{ userInfo.phone }}
          </text>
        </view>
        <view class="i-carbon-chevron-right text-white/70 w-5 h-5" />
      </view>

      <!-- 统计数据 -->
      <view class="flex justify-around mt-6 bg-white/10 rounded-lg py-4">
        <view class="text-center" v-for="stat in stats" :key="stat.label">
          <text class="text-white text-xl font-bold block">{{ stat.value }}</text>
          <text class="text-white/70 text-xs mt-1">{{ stat.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const userInfo = {
  avatar: '/static/avatar.png',
  nickname: '张三',
  phone: '138****8888',
  level: 'VIP会员',
}

const stats = [
  { label: '订单', value: 12 },
  { label: '收藏', value: 36 },
  { label: '关注', value: 8 },
  { label: '积分', value: 1280 },
]
</script>
```

## 与 WD UI 集成

### 主题色联动

UnoCSS 配置中的主题色引用了 WD UI 的 CSS 变量,实现主题联动:

```typescript
// uno.config.ts
theme: {
  colors: {
    primary: 'var(--wot-color-theme, #0957DE)',
    success: 'var(--wot-color-success, #34d19d)',
    warning: 'var(--wot-color-warning, #f0883a)',
    danger: 'var(--wot-color-danger, #fa4350)',
  },
}
```

```vue
<template>
  <!-- UnoCSS 类和 WD UI 组件使用相同的主题色 -->
  <view class="text-primary">文字使用主题色</view>
  <wd-button type="primary">按钮使用主题色</wd-button>
</template>
```

### 覆盖组件样式

使用 UnoCSS 的 `@apply` 指令覆盖组件样式:

```scss
// 全局样式覆盖
:deep(.wd-button) {
  @apply rounded-lg;
}

:deep(.wd-cell) {
  @apply px-4;
}

// 页面级覆盖
.custom-button {
  :deep(.wd-button__text) {
    @apply font-bold;
  }
}
```

## ESLint 集成

### 配置 ESLint 插件

```javascript
// eslint.config.js
import unocss from '@unocss/eslint-plugin'

export default [
  unocss.configs['flat/recommended'],
  // 其他配置...
]
```

### 排序规则

ESLint 插件可以自动排序 UnoCSS 类名:

```vue
<!-- 排序前 -->
<view class="mt-4 flex bg-white p-4 rounded-lg items-center">

<!-- 排序后(按功能分组) -->
<view class="flex items-center bg-white p-4 mt-4 rounded-lg">
```

## 性能优化

### 按需生成

UnoCSS 只生成实际使用的样式,无需配置:

```vue
<!-- 只有使用到的类才会被生成 -->
<view class="flex items-center p-4 bg-white">
  <!-- 只生成 flex, items-center, p-4, bg-white 四个样式 -->
</view>
```

### 样式提取

生产构建时,UnoCSS 会将样式提取到独立 CSS 文件:

```typescript
// vite.config.ts
export default {
  build: {
    cssCodeSplit: true,  // CSS 代码分割
  },
}
```

### 预生成常用样式

可以配置 safelist 预生成常用样式:

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 预生成所有灰色等级
    ...Array.from({ length: 9 }, (_, i) => `bg-gray-${(i + 1) * 100}`),
    // 预生成常用间距
    ...['1', '2', '3', '4', '5', '6', '8', '10'].flatMap((i) => [`p-${i}`, `m-${i}`]),
  ],
})
```

## 常见问题

### 1. 样式不生效

**问题**: UnoCSS 类名没有生效

**解决方案**:
- 检查 `uno.css` 是否正确导入
- 确认类名拼写正确
- 检查是否有 CSS 优先级冲突

```typescript
// 确保导入顺序正确
import '@/static/style/index.scss'
import 'uno.css'  // 必须在其他样式之后导入
```

### 2. rpx 单位转换

**问题**: 数值单位不是 rpx

**解决方案**:
使用数值类名时默认为 rpx:

```vue
<!-- ✓ 正确: 200rpx -->
<view class="w-200 h-100">

<!-- ✗ 错误: 需要明确单位 -->
<view class="w-200px h-100px">
```

### 3. 属性化模式需要前缀

**问题**: 属性化写法不生效

**解决方案**:
由于配置了 `prefixedOnly: true`,属性化需要 `un-` 前缀:

```vue
<!-- ✓ 正确 -->
<view un-flex un-items-center>

<!-- ✗ 错误: 缺少前缀 -->
<view flex items-center>
```

### 4. 图标不显示

**问题**: Iconify 图标不显示

**解决方案**:
- 确认图标集已安装
- 使用正确的图标名称格式

```bash
# 安装图标集
pnpm add -D @iconify-json/carbon @iconify-json/mdi
```

```vue
<!-- 格式: i-{collection}-{icon} -->
<view class="i-carbon-sun" />
<view class="i-mdi-home" />
```

### 5. 生产环境样式丢失

**问题**: 开发正常,生产环境样式丢失

**解决方案**:
将动态类名加入 safelist:

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 动态类名需要预生成
    'text-primary',
    'text-success',
    'text-warning',
    'text-danger',
  ],
})
```

或使用静态类名:

```vue
<!-- ✗ 动态类名可能被 tree-shake -->
<view :class="`text-${type}`">

<!-- ✓ 使用对象形式 -->
<view :class="{
  'text-primary': type === 'primary',
  'text-success': type === 'success',
}">
```
