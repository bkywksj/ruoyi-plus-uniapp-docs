# 样式系统概览

## 介绍

RuoYi-Plus-UniApp 采用现代化的样式系统架构,结合 UnoCSS 原子化 CSS 框架、SCSS 预处理器和 WD UI 组件库的主题变量系统,为开发者提供了高效、灵活、可维护的样式解决方案。

样式系统的设计目标是:在保持样式一致性和可维护性的同时,为开发者提供最大的灵活性和开发效率。通过原子化 CSS 处理常见布局和工具样式,通过 CSS 变量实现主题定制,通过 SCSS 变量实现组件级样式复用。

**核心特性:**

- **原子化 CSS** - 基于 UnoCSS,提供即写即用的原子类,无需编写 CSS 文件
- **响应式单位** - 统一使用 rpx 单位,自动适配不同屏幕尺寸
- **主题定制** - 支持 CSS 变量和 SCSS 变量双轨制,轻松实现主题切换
- **暗黑模式** - 内置暗黑模式变量,支持跟随系统或手动切换
- **BEM 规范** - 组件样式采用 BEM 命名规范,结构清晰易维护
- **安全区适配** - 内置安全区 CSS 规则,适配刘海屏、底部 Home 指示器
- **平台兼容** - 样式系统兼容 App、H5、微信小程序、支付宝小程序等平台

## 样式架构

### 整体架构

```
样式系统
├── UnoCSS (原子化 CSS)
│   ├── presetUni (UniApp 预设)
│   ├── presetIcons (图标预设)
│   ├── presetAttributify (属性化预设)
│   ├── transformerDirectives (@apply 指令)
│   └── transformerVariantGroup (分组语法)
│
├── SCSS (预处理器)
│   ├── uni.scss (全局变量)
│   ├── variable.scss (组件变量)
│   ├── mixin.scss (混合宏)
│   └── function.scss (工具函数)
│
├── CSS 变量 (运行时主题)
│   ├── --wot-color-* (颜色变量)
│   ├── --wot-fs-* (字体变量)
│   └── --wot-*-* (组件变量)
│
└── 组件样式 (BEM 规范)
    ├── wd-button
    ├── wd-cell
    └── ...
```

### 文件结构

```
src/
├── uni.scss                              # 全局 SCSS 变量(UniApp 内置)
├── static/
│   └── style/
│       └── index.scss                    # 全局样式入口
├── wd/
│   └── components/
│       └── common/
│           └── abstracts/
│               ├── _config.scss          # BEM 配置
│               ├── _function.scss        # 工具函数
│               ├── _mixin.scss           # 混合宏
│               └── variable.scss         # 组件 CSS 变量
└── uno.config.ts                         # UnoCSS 配置
```

## UnoCSS 配置

### 基础配置

项目使用 `@uni-helper/unocss-preset-uni` 预设,专门针对 UniApp 进行了优化。

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
  presets: [
    presetUni({
      attributify: {
        prefixedOnly: true,
      },
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetAttributify(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  shortcuts: [
    {
      center: 'flex justify-center items-center',
    },
  ],
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

### 预设说明

| 预设 | 说明 | 用途 |
|------|------|------|
| `presetUni` | UniApp 专用预设 | 提供 rpx 单位支持、平台适配 |
| `presetIcons` | 图标预设 | 支持 Iconify 图标库 |
| `presetAttributify` | 属性化预设 | 支持属性化 class 写法 |

### 转换器说明

| 转换器 | 说明 | 示例 |
|--------|------|------|
| `transformerDirectives` | @apply 指令 | `@apply flex items-center;` |
| `transformerVariantGroup` | 分组语法 | `hover:(bg-gray-400 font-medium)` |

### 常用原子类

#### 布局类

```vue
<template>
  <!-- Flexbox 布局 -->
  <view class="flex">flex 容器</view>
  <view class="flex-col">纵向 flex</view>
  <view class="flex-row">横向 flex</view>
  <view class="flex-wrap">换行</view>
  <view class="flex-1">flex: 1</view>
  <view class="flex-auto">flex: auto</view>
  <view class="flex-none">flex: none</view>

  <!-- 对齐方式 -->
  <view class="justify-start">左对齐</view>
  <view class="justify-center">居中</view>
  <view class="justify-end">右对齐</view>
  <view class="justify-between">两端对齐</view>
  <view class="justify-around">均匀分布</view>

  <view class="items-start">顶部对齐</view>
  <view class="items-center">垂直居中</view>
  <view class="items-end">底部对齐</view>

  <!-- 快捷方式 -->
  <view class="center">水平垂直居中</view>
</template>
```

#### 间距类

```vue
<template>
  <!-- 外边距 -->
  <view class="m-4">margin: 16rpx</view>
  <view class="mt-4">margin-top: 16rpx</view>
  <view class="mr-4">margin-right: 16rpx</view>
  <view class="mb-4">margin-bottom: 16rpx</view>
  <view class="ml-4">margin-left: 16rpx</view>
  <view class="mx-4">margin-left/right: 16rpx</view>
  <view class="my-4">margin-top/bottom: 16rpx</view>

  <!-- 内边距 -->
  <view class="p-4">padding: 16rpx</view>
  <view class="pt-4">padding-top: 16rpx</view>
  <view class="pr-4">padding-right: 16rpx</view>
  <view class="pb-4">padding-bottom: 16rpx</view>
  <view class="pl-4">padding-left: 16rpx</view>
  <view class="px-4">padding-left/right: 16rpx</view>
  <view class="py-4">padding-top/bottom: 16rpx</view>

  <!-- 安全区适配 -->
  <view class="pt-safe">顶部安全区</view>
  <view class="pb-safe">底部安全区</view>
  <view class="p-safe">全部安全区</view>
</template>
```

#### 尺寸类

```vue
<template>
  <!-- 宽度 -->
  <view class="w-full">width: 100%</view>
  <view class="w-screen">width: 100vw</view>
  <view class="w-100">width: 100rpx</view>
  <view class="w-1/2">width: 50%</view>

  <!-- 高度 -->
  <view class="h-full">height: 100%</view>
  <view class="h-screen">height: 100vh</view>
  <view class="h-100">height: 100rpx</view>

  <!-- 最大/最小尺寸 -->
  <view class="max-w-full">max-width: 100%</view>
  <view class="min-h-screen">min-height: 100vh</view>
</template>
```

#### 文字类

```vue
<template>
  <!-- 字体大小 -->
  <view class="text-3xs">18rpx</view>
  <view class="text-2xs">20rpx</view>
  <view class="text-xs">24rpx</view>
  <view class="text-sm">28rpx</view>
  <view class="text-base">32rpx</view>
  <view class="text-lg">36rpx</view>
  <view class="text-xl">40rpx</view>
  <view class="text-2xl">48rpx</view>

  <!-- 字体粗细 -->
  <view class="font-normal">正常</view>
  <view class="font-medium">中等</view>
  <view class="font-semibold">半粗</view>
  <view class="font-bold">粗体</view>

  <!-- 文本对齐 -->
  <view class="text-left">左对齐</view>
  <view class="text-center">居中</view>
  <view class="text-right">右对齐</view>

  <!-- 文本颜色 -->
  <view class="text-primary">主题色</view>
  <view class="text-gray-500">灰色</view>
  <view class="text-red-500">红色</view>
</template>
```

#### 边框和圆角

```vue
<template>
  <!-- 边框 -->
  <view class="border">1px 边框</view>
  <view class="border-2">2px 边框</view>
  <view class="border-t">顶部边框</view>
  <view class="border-b">底部边框</view>
  <view class="border-gray-200">灰色边框</view>
  <view class="border-primary">主题色边框</view>

  <!-- 圆角 -->
  <view class="rounded">小圆角</view>
  <view class="rounded-lg">大圆角</view>
  <view class="rounded-full">圆形</view>
  <view class="rounded-t-lg">顶部圆角</view>
</template>
```

#### 背景类

```vue
<template>
  <!-- 背景颜色 -->
  <view class="bg-white">白色背景</view>
  <view class="bg-gray-100">浅灰背景</view>
  <view class="bg-primary">主题色背景</view>
  <view class="bg-transparent">透明背景</view>

  <!-- 背景图片 -->
  <view class="bg-cover">覆盖</view>
  <view class="bg-contain">包含</view>
  <view class="bg-center">居中</view>
</template>
```

### 分组语法

UnoCSS 支持分组语法,可以减少重复书写:

```vue
<template>
  <!-- 传统写法 -->
  <view class="hover:bg-gray-400 hover:font-medium hover:text-white">
    悬停效果
  </view>

  <!-- 分组写法 -->
  <view class="hover:(bg-gray-400 font-medium text-white)">
    悬停效果
  </view>

  <!-- 字体分组 -->
  <view class="font-(light mono)">
    轻量等宽字体
  </view>
</template>
```

### @apply 指令

在 SCSS 中使用 UnoCSS 原子类:

```vue
<style lang="scss" scoped>
.card {
  @apply flex flex-col p-4 bg-white rounded-lg;

  &__title {
    @apply text-lg font-bold text-gray-800;
  }

  &__content {
    @apply text-sm text-gray-600 mt-2;
  }
}
</style>
```

## SCSS 变量系统

### 全局变量 (uni.scss)

UniApp 内置的全局 SCSS 变量,无需导入即可在任何 SCSS 文件中使用。

```scss
// 行为相关颜色
$uni-color-primary: #007aff;
$uni-color-success: #4cd964;
$uni-color-warning: #f0ad4e;
$uni-color-error: #dd524d;

// 文字颜色
$uni-text-color: #333;           // 基本色
$uni-text-color-inverse: #fff;   // 反色
$uni-text-color-grey: #999;      // 辅助灰色
$uni-text-color-placeholder: #808080;
$uni-text-color-disable: #c0c0c0;

// 背景颜色
$uni-bg-color: #fff;
$uni-bg-color-grey: #f8f8f8;
$uni-bg-color-hover: #f1f1f1;
$uni-bg-color-mask: rgba(0, 0, 0, 0.4);

// 边框颜色
$uni-border-color: #c8c7cc;

// 文字尺寸
$uni-font-size-sm: 12px;
$uni-font-size-base: 14px;
$uni-font-size-lg: 16px;

// 圆角
$uni-border-radius-sm: 2px;
$uni-border-radius-base: 3px;
$uni-border-radius-lg: 6px;
$uni-border-radius-circle: 50%;

// 间距
$uni-spacing-row-sm: 5px;
$uni-spacing-row-base: 10px;
$uni-spacing-row-lg: 15px;
$uni-spacing-col-sm: 4px;
$uni-spacing-col-base: 8px;
$uni-spacing-col-lg: 12px;
```

**使用示例:**

```vue
<style lang="scss" scoped>
.my-component {
  color: $uni-text-color;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base $uni-spacing-row-base;
}
</style>
```

### WD UI 变量 (variable.scss)

WD UI 组件库使用 CSS 变量实现主题定制,同时提供 SCSS 变量作为默认值。

#### 基础颜色

```scss
// 主题颜色
$-color-theme: var(--wot-color-theme, #0957DE);
$-color-white: var(--wot-color-white, rgb(255, 255, 255));
$-color-black: var(--wot-color-black, rgb(0, 0, 0));

// 辅助颜色
$-color-success: var(--wot-color-success, #34d19d);
$-color-warning: var(--wot-color-warning, #f0883a);
$-color-danger: var(--wot-color-danger, #fa4350);
$-color-info: var(--wot-color-info, #909399);

// 灰色系列
$-color-gray-1: var(--wot-color-gray-1, #f9f9f9);
$-color-gray-2: var(--wot-color-gray-2, #f2f3f5);
$-color-gray-3: var(--wot-color-gray-3, #ebedf0);
$-color-gray-4: var(--wot-color-gray-4, #dcdee0);
$-color-gray-5: var(--wot-color-gray-5, #c8c9cc);
$-color-gray-6: var(--wot-color-gray-6, #969799);
$-color-gray-7: var(--wot-color-gray-7, #646566);
$-color-gray-8: var(--wot-color-gray-8, #323233);
```

#### 字体系统

```scss
// 字体大小
$-fs-big: var(--wot-fs-big, 48rpx);         // 大型标题
$-fs-important: var(--wot-fs-important, 38rpx); // 重要数据
$-fs-title: var(--wot-fs-title, 32rpx);     // 标题
$-fs-content: var(--wot-fs-content, 28rpx); // 正文
$-fs-secondary: var(--wot-fs-secondary, 24rpx); // 次要信息
$-fs-aid: var(--wot-fs-aid, 20rpx);         // 辅助文字

// 字体粗细
$-fw-medium: var(--wot-fw-medium, 500);
$-fw-semibold: var(--wot-fw-semibold, 600);
```

#### 暗黑模式

```scss
// 暗黑模式背景
$-dark-background: var(--wot-dark-background, #131313);
$-dark-background2: var(--wot-dark-background2, #1b1b1b);
$-dark-background3: var(--wot-dark-background3, #141414);
$-dark-background4: var(--wot-dark-background4, #323233);

// 暗黑模式文字
$-dark-color: var(--wot-dark-color, #fff);
$-dark-color-gray: var(--wot-dark-color-gray, #595959);
$-dark-border-color: var(--wot-dark-border-color, #3a3a3c);
```

## CSS 变量定制

### 全局主题定制

在全局样式文件中覆盖 CSS 变量:

```scss
// src/static/style/index.scss
:root,
page {
  // 主题色
  --wot-color-theme: #751937;

  // 按钮样式
  --wot-button-primary-bg-color: #751937;
  --wot-button-primary-color: #ffffff;

  // 成功色
  --wot-color-success: #52C41A;

  // 警告色
  --wot-color-warning: #FFBA00;

  // 危险色
  --wot-color-danger: #F56C6C;
}
```

### 组件级定制

在特定页面或组件中覆盖样式:

```vue
<template>
  <view class="custom-page">
    <wd-button type="primary">自定义按钮</wd-button>
  </view>
</template>

<style lang="scss" scoped>
.custom-page {
  // 只在当前页面生效
  --wot-button-primary-bg-color: #ff6600;
  --wot-button-primary-color: #ffffff;
  --wot-button-large-radius: 44rpx;
}
</style>
```

### 动态主题切换

通过 JavaScript 动态修改 CSS 变量:

```typescript
// 切换主题色
const setThemeColor = (color: string) => {
  const pages = document.querySelectorAll('page')
  pages.forEach(page => {
    page.style.setProperty('--wot-color-theme', color)
    page.style.setProperty('--wot-button-primary-bg-color', color)
  })
}

// 使用示例
setThemeColor('#751937') // 酒红色主题
setThemeColor('#409EFF') // 蓝色主题
setThemeColor('#52C41A') // 绿色主题
```

### 暗黑模式

```typescript
// 切换暗黑模式
const toggleDarkMode = (isDark: boolean) => {
  const root = document.documentElement

  if (isDark) {
    root.classList.add('dark')
    // 设置暗黑模式变量
    root.style.setProperty('--wot-color-bg', '#131313')
    root.style.setProperty('--wot-color-title', '#ffffff')
    root.style.setProperty('--wot-color-content', '#e8e8e8')
  } else {
    root.classList.remove('dark')
    // 恢复亮色模式变量
    root.style.setProperty('--wot-color-bg', '#f5f5f5')
    root.style.setProperty('--wot-color-title', '#000000')
    root.style.setProperty('--wot-color-content', '#262626')
  }
}
```

## BEM 规范

### 命名规则

WD UI 组件使用 BEM (Block-Element-Modifier) 命名规范:

- **Block**: 组件根类名,如 `wd-button`
- **Element**: 组件子元素,如 `wd-button__text`
- **Modifier**: 状态修饰符,如 `wd-button--primary`

```scss
// BEM 配置
$namespace: 'wd';              // 命名空间
$elementSeparator: '__';        // 元素分隔符
$modifierSeparator: '--';       // 修饰符分隔符
$state-prefix: 'is-';           // 状态前缀
```

### 混合宏使用

```scss
@import '@/wd/components/common/abstracts/mixin';

// 定义块
@include b(button) {
  display: inline-flex;
  align-items: center;

  // 定义元素
  @include e(text) {
    font-size: 28rpx;
  }

  @include e(icon) {
    margin-right: 8rpx;
  }

  // 定义修饰符
  @include m(primary) {
    background-color: $-color-theme;
    color: #fff;
  }

  @include m(large) {
    height: 88rpx;
    padding: 0 72rpx;
  }

  // 定义状态
  @include when(disabled) {
    opacity: 0.6;
    pointer-events: none;
  }

  @include when(loading) {
    opacity: 0.8;
  }
}
```

### 生成的 CSS

```css
.wd-button {
  display: inline-flex;
  align-items: center;
}

.wd-button__text {
  font-size: 28rpx;
}

.wd-button__icon {
  margin-right: 8rpx;
}

.wd-button--primary {
  background-color: var(--wot-color-theme, #0957DE);
  color: #fff;
}

.wd-button--large {
  height: 88rpx;
  padding: 0 72rpx;
}

.wd-button.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.wd-button.is-loading {
  opacity: 0.8;
}
```

## 常用混合宏

### 文本截断

```scss
@import '@/wd/components/common/abstracts/mixin';

// 单行截断
.title {
  @include lineEllipsis;
}

// 多行截断
.description {
  @include multiEllipsis(3); // 最多显示3行
}
```

### 0.5px 边框

```scss
// 底部边框
.cell {
  @include halfPixelBorder('bottom', 0, #e8e8e8);
}

// 顶部边框,左侧偏移
.cell-with-icon {
  @include halfPixelBorder('top', 48rpx, #e8e8e8);
}

// 环绕边框
.card {
  @include halfPixelBorderSurround(#e8e8e8);
}
```

### 清除按钮默认样式

```scss
.custom-button {
  @include buttonClear;
  // 自定义样式
  padding: 16rpx 32rpx;
  background-color: $-color-theme;
}
```

## 响应式设计

### rpx 单位

UniApp 使用 rpx (responsive pixel) 作为响应式单位,自动适配不同屏幕:

- 设计稿宽度: 750rpx
- 转换规则: 1rpx = (屏幕宽度 / 750) px

```vue
<style lang="scss" scoped>
.container {
  width: 750rpx;    // 满屏宽度
  padding: 32rpx;   // 两边留白
}

.card {
  width: 690rpx;    // 750 - 32*2 = 686 ≈ 690
  margin: 0 auto;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
}
</style>
```

### 安全区适配

```vue
<template>
  <view class="page">
    <!-- 顶部安全区 -->
    <view class="pt-safe">
      <wd-navbar title="标题" />
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- ... -->
    </view>

    <!-- 底部安全区 -->
    <view class="pb-safe">
      <wd-tabbar />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
}

// 或使用 CSS 变量
.bottom-bar {
  padding-bottom: constant(safe-area-inset-bottom); // iOS 11.0-11.2
  padding-bottom: env(safe-area-inset-bottom);      // iOS 11.2+
}
</style>
```

### 媒体查询

```scss
// 针对不同屏幕尺寸
@media screen and (min-width: 750rpx) {
  .container {
    max-width: 750rpx;
    margin: 0 auto;
  }
}

// 针对 H5 平台
/* #ifdef H5 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
/* #endif */

// 针对小程序平台
/* #ifdef MP */
.page {
  background-color: #f5f5f5;
}
/* #endif */
```

## 最佳实践

### 1. 优先使用原子类

对于简单的布局和样式,优先使用 UnoCSS 原子类:

```vue
<!-- ✅ 推荐: 使用原子类 -->
<view class="flex items-center justify-between p-4 bg-white rounded-lg">
  <text class="text-lg font-medium text-gray-800">标题</text>
  <text class="text-sm text-gray-500">副标题</text>
</view>

<!-- ❌ 不推荐: 写大量自定义样式 -->
<view class="header">
  <text class="title">标题</text>
  <text class="subtitle">副标题</text>
</view>

<style>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #1f2937;
}
.subtitle {
  font-size: 28rpx;
  color: #6b7280;
}
</style>
```

### 2. 组件样式使用 SCSS

对于复杂组件,使用 SCSS 编写结构化样式:

```vue
<style lang="scss" scoped>
.product-card {
  @apply bg-white rounded-lg overflow-hidden;

  &__image {
    width: 100%;
    height: 300rpx;
    object-fit: cover;
  }

  &__info {
    @apply p-3;
  }

  &__title {
    @apply text-base font-medium text-gray-800;
    @include lineEllipsis;
  }

  &__price {
    @apply text-lg font-bold text-red-500 mt-2;
  }

  &--soldout {
    opacity: 0.6;
  }
}
</style>
```

### 3. 使用 CSS 变量实现主题

```vue
<style lang="scss" scoped>
.theme-card {
  // 使用 CSS 变量,支持动态主题切换
  background-color: var(--wot-color-bg);
  color: var(--wot-color-content);
  border-color: var(--wot-color-border-light);

  &__title {
    color: var(--wot-color-title);
    font-size: var(--wot-fs-title);
  }
}
</style>
```

### 4. 统一使用 rpx 单位

```scss
// ✅ 推荐: 使用 rpx
.container {
  padding: 32rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
}

// ❌ 不推荐: 混用 px
.container {
  padding: 16px;
  font-size: 14px;
  border-radius: 8px;
}
```

### 5. 合理使用样式作用域

```vue
<!-- 组件样式使用 scoped -->
<style lang="scss" scoped>
.my-component {
  // 只影响当前组件
}
</style>

<!-- 需要穿透子组件时使用 :deep() -->
<style lang="scss" scoped>
.my-component {
  :deep(.wd-button) {
    // 穿透到子组件
    background-color: red;
  }
}
</style>

<!-- 全局样式放在 static/style/index.scss -->
```

## 常见问题

### 1. UnoCSS 类名不生效?

**问题原因:**

- 类名拼写错误
- UnoCSS 配置未正确加载
- 动态类名未加入 safelist

**解决方案:**

```typescript
// uno.config.ts
export default defineConfig({
  // 将动态类名加入 safelist
  safelist: [
    'text-red-500',
    'text-green-500',
    'bg-primary',
    // 或使用正则
    ...Array.from({ length: 10 }, (_, i) => `mt-${i}`),
  ],
})
```

### 2. 样式在小程序中不生效?

**问题原因:**

- 小程序不支持某些 CSS 属性
- 选择器不兼容

**解决方案:**

```scss
// 使用平台条件编译
/* #ifdef H5 */
.container {
  position: fixed; // H5 支持
}
/* #endif */

/* #ifdef MP */
.container {
  position: absolute; // 小程序使用
}
/* #endif */
```

### 3. 暗黑模式切换不生效?

**问题原因:**

- CSS 变量未正确设置
- 组件未使用 CSS 变量

**解决方案:**

```scss
// 确保使用 CSS 变量而非固定值
.card {
  // ✅ 推荐: 使用 CSS 变量
  background-color: var(--wot-color-bg);
  color: var(--wot-color-content);

  // ❌ 不推荐: 使用固定值
  // background-color: #ffffff;
  // color: #333333;
}
```

### 4. rpx 在 H5 中显示异常?

**问题原因:**

- H5 端 rpx 转换可能存在精度问题

**解决方案:**

```scss
// 使用 calc 处理精度
.container {
  width: calc(100vw - 64rpx);
  padding: 32rpx;
}

// 或使用百分比
.half-width {
  width: 50%;
}
```

### 5. 自定义组件样式无法覆盖?

**问题原因:**

- 组件内部样式优先级较高
- scoped 样式无法穿透

**解决方案:**

```vue
<style lang="scss" scoped>
// 方法1: 使用 :deep() 穿透
.my-page {
  :deep(.wd-button) {
    background-color: red !important;
  }
}

// 方法2: 使用 CSS 变量覆盖
.my-page {
  --wot-button-primary-bg-color: red;
}
</style>

<!-- 方法3: 使用 custom-class 属性 -->
<template>
  <wd-button custom-class="my-button">按钮</wd-button>
</template>

<style lang="scss">
/* 注意: 不使用 scoped */
.my-button {
  background-color: red !important;
}
</style>
```

## 总结

RuoYi-Plus-UniApp 的样式系统具有以下特点:

1. **原子化优先** - UnoCSS 提供高效的原子类开发体验
2. **响应式设计** - rpx 单位 + 安全区适配,完美适配各种屏幕
3. **主题灵活** - CSS 变量 + SCSS 变量双轨制,支持运行时主题切换
4. **规范统一** - BEM 命名规范 + 混合宏,保持代码一致性
5. **平台兼容** - 条件编译处理平台差异,一套代码多端运行

通过合理使用样式系统,可以显著提升开发效率,同时保持代码的可维护性和一致性。
