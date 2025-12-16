# 全局样式

## 概述

RuoYi-Plus-UniApp 移动端项目采用完整的全局样式体系,基于 SCSS 预处理器和 CSS 变量实现,提供了统一的颜色、字体、间距、组件样式等设计规范。通过全局样式系统,可以确保整个应用的视觉一致性,同时支持灵活的主题定制。

**全局样式体系特点:**

- **CSS 变量驱动** - 所有样式通过 CSS 变量控制,支持运行时动态修改
- **SCSS 变量系统** - 提供完整的 SCSS 变量映射,支持编译时主题定制
- **多层级颜色系统** - 主题色、功能色、灰度色、文字颜色等完整体系
- **响应式设计** - 基于 rpx 单位,自动适配不同屏幕尺寸
- **暗黑模式支持** - 内置完整的暗黑模式颜色变量
- **组件级定制** - 每个组件都提供专属的样式变量

## 全局样式入口

### 样式文件结构

项目的全局样式主要由以下文件组成:

```text
src/
├── uni.scss                    # UniApp 全局 SCSS 变量(自动注入)
├── static/
│   └── style/
│       └── index.scss          # 自定义全局样式入口
└── wd/
    └── components/
        └── common/
            └── abstracts/
                ├── variable.scss    # WD UI 组件变量定义
                └── function.scss    # SCSS 工具函数
```

### uni.scss 全局变量

`uni.scss` 是 UniApp 内置的全局样式变量文件,在编译时会自动注入到所有组件中,无需手动导入:

```scss
// src/uni.scss

/**
 * uni-app 内置的常用样式变量
 * 这些变量会自动注入到所有组件中,可直接使用
 */

/* 颜色变量 */

/* 行为相关颜色 */
$uni-color-primary: #007aff;
$uni-color-success: #4cd964;
$uni-color-warning: #f0ad4e;
$uni-color-error: #dd524d;

/* 文字基本颜色 */
$uni-text-color: #333;           // 基本色
$uni-text-color-inverse: #fff;   // 反色
$uni-text-color-grey: #999;      // 辅助灰色
$uni-text-color-placeholder: #808080;
$uni-text-color-disable: #c0c0c0;

/* 背景颜色 */
$uni-bg-color: #fff;
$uni-bg-color-grey: #f8f8f8;
$uni-bg-color-hover: #f1f1f1;    // 点击状态颜色
$uni-bg-color-mask: rgb(0 0 0 / 40%); // 遮罩颜色

/* 边框颜色 */
$uni-border-color: #c8c7cc;

/* 文字尺寸 */
$uni-font-size-sm: 12px;
$uni-font-size-base: 14px;
$uni-font-size-lg: 16px;

/* 图片尺寸 */
$uni-img-size-sm: 20px;
$uni-img-size-base: 26px;
$uni-img-size-lg: 40px;

/* 圆角大小 */
$uni-border-radius-sm: 2px;
$uni-border-radius-base: 3px;
$uni-border-radius-lg: 6px;
$uni-border-radius-circle: 50%;

/* 水平间距 */
$uni-spacing-row-sm: 5px;
$uni-spacing-row-base: 10px;
$uni-spacing-row-lg: 15px;

/* 垂直间距 */
$uni-spacing-col-sm: 4px;
$uni-spacing-col-base: 8px;
$uni-spacing-col-lg: 12px;

/* 透明度 */
$uni-opacity-disabled: 0.3;      // 组件禁用态透明度

/* 文章场景相关 */
$uni-color-title: #2c405a;       // 文章标题颜色
$uni-font-size-title: 20px;
$uni-color-subtitle: #555;       // 二级标题颜色
$uni-font-size-subtitle: 18px;
$uni-color-paragraph: #3f536e;   // 文章段落颜色
$uni-font-size-paragraph: 15px;
```

**使用说明:**

- 这些变量在任何 Vue 组件的 `<style lang="scss">` 中可直接使用
- 无需 `@import` 导入,UniApp 编译时会自动注入
- 可通过修改此文件来全局调整基础样式

### 自定义全局样式入口

`src/static/style/index.scss` 是项目的自定义全局样式入口,用于覆盖默认主题或添加自定义样式:

```scss
// src/static/style/index.scss

// 主题色修改
:root,
page {
  // 修改主题色
  --wot-color-theme: #1890ff;

  // 修改成功色
  --wot-color-success: #52c41a;

  // 修改按钮背景色
  --wot-button-primary-bg-color: #1890ff;

  // 修改输入框样式
  --wot-input-border-color: #d9d9d9;
  --wot-input-placeholder-color: #bfbfbf;
}
```

**使用说明:**

- 在 `:root` 或 `page` 选择器中设置 CSS 变量可全局生效
- 此文件需要在 `App.vue` 或 `main.ts` 中手动导入
- 建议只在此文件中做主题定制,避免分散配置

## 颜色系统

### 主题色

WD UI 组件库使用 `--wot-color-theme` 作为主题色,默认值为 `#4d80f0`:

```scss
// 主题色定义
$-color-theme: var(--wot-color-theme, #4d80f0) !default;

// 白色和黑色(用于颜色计算)
$-color-white: var(--wot-color-white, rgb(255, 255, 255)) !default;
$-color-black: var(--wot-color-black, rgb(0, 0, 0)) !default;
```

**全局修改主题色:**

```scss
// 在 index.scss 中
:root,
page {
  --wot-color-theme: #1890ff;  // 蓝色主题
  // 或
  --wot-color-theme: #722ed1;  // 紫色主题
  // 或
  --wot-color-theme: #fa541c;  // 橙色主题
}
```

### 功能色

功能色用于表示不同的状态和含义:

```scss
/* 功能色 */
$-color-success: var(--wot-color-success, #34d19d) !default;  // 成功色
$-color-warning: var(--wot-color-warning, #f0883a) !default;  // 警告色
$-color-danger: var(--wot-color-danger, #fa4350) !default;    // 危险色
$-color-purple: var(--wot-color-purple, #8268de) !default;    // 紫色
$-color-yellow: var(--wot-color-yellow, #f0cd1d) !default;    // 黄色
$-color-blue: var(--wot-color-blue, #2bb3ed) !default;        // 蓝色
$-color-info: var(--wot-color-info, #909399) !default;        // 信息色
```

**使用场景:**

| 颜色 | 变量 | 使用场景 |
|------|------|---------|
| 成功色 | `--wot-color-success` | 成功提示、完成状态、正向操作 |
| 警告色 | `--wot-color-warning` | 警告提示、需要关注的信息 |
| 危险色 | `--wot-color-danger` | 错误提示、删除操作、危险操作 |
| 信息色 | `--wot-color-info` | 一般性信息提示、辅助说明 |

### 灰度色阶

系统提供了 8 级灰度色阶,用于不同层级的背景和边框:

```scss
/* 灰度色阶 */
$-color-gray-1: var(--wot-color-gray-1, #f9f9f9) !default;  // 最浅
$-color-gray-2: var(--wot-color-gray-2, #f2f3f5) !default;
$-color-gray-3: var(--wot-color-gray-3, #ebedf0) !default;
$-color-gray-4: var(--wot-color-gray-4, #dcdee0) !default;
$-color-gray-5: var(--wot-color-gray-5, #c8c9cc) !default;
$-color-gray-6: var(--wot-color-gray-6, #969799) !default;
$-color-gray-7: var(--wot-color-gray-7, #646566) !default;
$-color-gray-8: var(--wot-color-gray-8, #323233) !default;  // 最深
```

**灰度色使用建议:**

| 色阶 | 推荐用途 |
|------|---------|
| gray-1 | 页面背景、卡片悬浮背景 |
| gray-2 | 分割区域、禁用背景 |
| gray-3 | 边框、分割线 |
| gray-4 | 边框高亮 |
| gray-5 | 占位符、禁用文字 |
| gray-6 | 辅助文字 |
| gray-7 | 次要文字 |
| gray-8 | 主要文字 |

### 文字颜色

系统提供了多层级的文字颜色,适用于不同的信息层级:

```scss
/* 深色背景下的文字颜色(带透明度) */
$-font-gray-1: var(--wot-font-gray-1, rgba(0, 0, 0, 0.9));   // 主要文字
$-font-gray-2: var(--wot-font-gray-2, rgba(0, 0, 0, 0.6));   // 次要文字
$-font-gray-3: var(--wot-font-gray-3, rgba(0, 0, 0, 0.4));   // 辅助文字
$-font-gray-4: var(--wot-font-gray-4, rgba(0, 0, 0, 0.26));  // 禁用文字

/* 浅色背景下的文字颜色(带透明度) */
$-font-white-1: var(--wot-font-white-1, rgba(255, 255, 255, 1));    // 主要文字
$-font-white-2: var(--wot-font-white-2, rgba(255, 255, 255, 0.55)); // 次要文字
$-font-white-3: var(--wot-font-white-3, rgba(255, 255, 255, 0.35)); // 辅助文字
$-font-white-4: var(--wot-font-white-4, rgba(255, 255, 255, 0.22)); // 禁用文字

/* 语义化文字颜色 */
$-color-title: var(--wot-color-title, #000) !default;       // 标题/重要文字
$-color-content: var(--wot-color-content, #262626) !default; // 正文内容
$-color-secondary: var(--wot-color-secondary, #595959) !default; // 次要信息
$-color-aid: var(--wot-color-aid, #8c8c8c) !default;        // 辅助文字
$-color-tip: var(--wot-color-tip, #bfbfbf) !default;        // 提示文字
```

**文字颜色使用示例:**

```vue
<template>
  <view class="text-demo">
    <text class="title">标题文字</text>
    <text class="content">正文内容</text>
    <text class="secondary">次要信息</text>
    <text class="aid">辅助说明</text>
    <text class="tip">提示文字</text>
  </view>
</template>

```

### 边框和背景颜色

```scss
/* 边框颜色 */
$-color-border: var(--wot-color-border, #d9d9d9) !default;       // 控件边框
$-color-border-light: var(--wot-color-border-light, #e8e8e8) !default; // 分割线

/* 背景颜色 */
$-color-bg: var(--wot-color-bg, #f5f5f5) !default;  // 页面背景、禁用填充
```

### 图标颜色

```scss
/* 图标颜色 */
$-color-icon: var(--wot-color-icon, #d9d9d9) !default;           // 默认图标色
$-color-icon-active: var(--wot-color-icon-active, #eee) !default; // 图标激活色
$-color-icon-disabled: var(--wot-color-icon-disabled, #a7a7a7) !default; // 图标禁用色
```

## 字体系统

### 字体大小

系统定义了统一的字体大小规范,使用 rpx 单位确保响应式适配:

```scss
/* 字体大小层级 */
$-fs-big: var(--wot-fs-big, 48rpx) !default;        // 大型标题
$-fs-important: var(--wot-fs-important, 38rpx) !default; // 重要数据
$-fs-title: var(--wot-fs-title, 32rpx) !default;    // 标题/重要正文
$-fs-content: var(--wot-fs-content, 28rpx) !default; // 普通正文
$-fs-secondary: var(--wot-fs-secondary, 24rpx) !default; // 次要信息
$-fs-aid: var(--wot-fs-aid, 20rpx) !default;        // 辅助文字
```

**字体大小使用规范:**

| 变量 | 尺寸 | 使用场景 |
|------|------|---------|
| `$-fs-big` | 48rpx | 数据大屏、营销页面大标题 |
| `$-fs-important` | 38rpx | 金额、重要数据展示 |
| `$-fs-title` | 32rpx | 页面标题、模块标题、按钮文字 |
| `$-fs-content` | 28rpx | 正文内容、列表项、输入框 |
| `$-fs-secondary` | 24rpx | 次要说明、标签、提示信息 |
| `$-fs-aid` | 20rpx | 版权信息、辅助性说明 |

### 字重

```scss
/* 字重定义 */
$-fw-medium: var(--wot-fw-medium, 500) !default;     // 中等粗细
$-fw-semibold: var(--wot-fw-semibold, 600) !default; // 半粗体
```

**字重使用示例:**

```vue
```

## 间距系统

### 屏幕边距

```scss
/* 屏幕两侧留白 */
$-size-side-padding: var(--wot-size-side-padding, 30rpx) !default;       // 标准边距
$-size-side-padding-small: var(--wot-size-side-padding-small, 12rpx) !default; // 紧凑边距
```

**使用示例:**

```vue
<template>
  <view class="page">
    <view class="section">内容区域</view>
  </view>
</template>

```

### 通用间距规范

基于 4px 基准的间距系统:

```scss
// 建议的间距规范(可在 uni.scss 中自定义)
$spacing-xs: 8rpx;    // 超小间距
$spacing-sm: 16rpx;   // 小间距
$spacing-md: 24rpx;   // 中等间距
$spacing-lg: 32rpx;   // 大间距
$spacing-xl: 48rpx;   // 超大间距
$spacing-xxl: 64rpx;  // 特大间距
```

## 暗黑模式

### 暗黑模式颜色变量

WD UI 提供了完整的暗黑模式颜色变量:

```scss
/* 暗黑模式背景色 */
$-dark-background: var(--wot-dark-background, #131313) !default;   // 主背景
$-dark-background2: var(--wot-dark-background2, #1b1b1b) !default; // 次级背景
$-dark-background3: var(--wot-dark-background3, #141414) !default; // 卡片背景
$-dark-background4: var(--wot-dark-background4, #323233) !default; // 悬浮背景
$-dark-background5: var(--wot-dark-background5, #646566) !default; // 高亮背景
$-dark-background6: var(--wot-dark-background6, #380e08) !default; // 特殊背景
$-dark-background7: var(--wot-dark-background7, #707070) !default; // 强调背景

/* 暗黑模式文字颜色 */
$-dark-color: var(--wot-dark-color, #ffffff) !default;             // 主要文字
$-dark-color2: var(--wot-dark-color2, #f2270c) !default;           // 强调文字
$-dark-color3: var(--wot-dark-color3, rgba(232, 230, 227, 0.8)) !default; // 次要文字
$-dark-color-gray: var(--wot-dark-color-gray, #595959) !default;   // 辅助文字

/* 暗黑模式边框颜色 */
$-dark-border-color: var(--wot-dark-border-color, #3a3a3c) !default;
```

### 暗黑模式实现

在组件中实现暗黑模式适配:

```vue
<template>
  <view class="card" :class="{ 'dark-mode': isDark }">
    <text class="title">卡片标题</text>
    <text class="content">卡片内容</text>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
</script>

```

### 使用 CSS 变量实现自动切换

```scss
// 在全局样式中定义
:root,
page {
  // 亮色模式变量
  --card-bg: #ffffff;
  --card-text: #262626;
  --card-border: #e8e8e8;
}

// 暗黑模式类
.dark-mode {
  --card-bg: #1b1b1b;
  --card-text: rgba(255, 255, 255, 0.85);
  --card-border: #3a3a3c;
}

// 或使用媒体查询自动检测系统主题
@media (prefers-color-scheme: dark) {
  :root,
  page {
    --card-bg: #1b1b1b;
    --card-text: rgba(255, 255, 255, 0.85);
    --card-border: #3a3a3c;
  }
}
```

## 组件样式变量

### 按钮组件变量

按钮组件提供了丰富的样式定制变量:

```scss
/* 按钮通用变量 */
$-button-disabled-opacity: var(--wot-button-disabled-opacity, 0.6) !default;
$-button-icon-fs: var(--wot-button-icon-fs, 1.18em) !default;

/* 小型按钮 */
$-button-small-height: var(--wot-button-small-height, 48rpx) !default;
$-button-small-padding: var(--wot-button-small-padding, 0 24rpx) !default;
$-button-small-fs: var(--wot-button-small-fs, 24rpx) !default;
$-button-small-radius: var(--wot-button-small-radius, 4rpx) !default;

/* 中型按钮 */
$-button-medium-height: var(--wot-button-medium-height, 72rpx) !default;
$-button-medium-padding: var(--wot-button-medium-padding, 0 32rpx) !default;
$-button-medium-fs: var(--wot-button-medium-fs, 28rpx) !default;
$-button-medium-radius: var(--wot-button-medium-radius, 8rpx) !default;

/* 大型按钮 */
$-button-large-height: var(--wot-button-large-height, 88rpx) !default;
$-button-large-padding: var(--wot-button-large-padding, 0 72rpx) !default;
$-button-large-fs: var(--wot-button-large-fs, 32rpx) !default;
$-button-large-radius: var(--wot-button-large-radius, 16rpx) !default;

/* 按钮颜色 */
$-button-primary-color: var(--wot-button-primary-color, #ffffff) !default;
$-button-primary-bg-color: var(--wot-button-primary-bg-color, #4d80f0) !default;
$-button-success-bg-color: var(--wot-button-success-bg-color, #34d19d) !default;
$-button-warning-bg-color: var(--wot-button-warning-bg-color, #f0883a) !default;
$-button-error-bg-color: var(--wot-button-error-bg-color, #fa4350) !default;
```

**自定义按钮样式:**

```scss
:root,
page {
  // 修改主按钮颜色
  --wot-button-primary-bg-color: #1890ff;

  // 修改按钮圆角
  --wot-button-medium-radius: 40rpx;  // 圆角按钮

  // 修改按钮高度
  --wot-button-large-height: 96rpx;
}
```

### 输入框组件变量

```scss
/* 输入框变量 */
$-input-padding: var(--wot-input-padding, 30rpx) !default;
$-input-border-color: var(--wot-input-border-color, #dadada) !default;
$-input-fs: var(--wot-input-fs, 28rpx) !default;
$-input-color: var(--wot-input-color, #262626) !default;
$-input-placeholder-color: var(--wot-input-placeholder-color, #bfbfbf) !default;
$-input-disabled-color: var(--wot-input-disabled-color, #d9d9d9) !default;
$-input-error-color: var(--wot-input-error-color, #fa4350) !default;
$-input-bg: var(--wot-input-bg, #ffffff) !default;
```

### 单元格组件变量

```scss
/* 单元格变量 */
$-cell-padding: var(--wot-cell-padding, 30rpx) !default;
$-cell-line-height: var(--wot-cell-line-height, 48rpx) !default;
$-cell-title-fs: var(--wot-cell-title-fs, 28rpx) !default;
$-cell-title-color: var(--wot-cell-title-color, rgba(0, 0, 0, 0.85)) !default;
$-cell-value-fs: var(--wot-cell-value-fs, 28rpx) !default;
$-cell-value-color: var(--wot-cell-value-color, rgba(0, 0, 0, 0.85)) !default;
$-cell-arrow-size: var(--wot-cell-arrow-size, 36rpx) !default;
$-cell-arrow-color: var(--wot-cell-arrow-color, rgba(0, 0, 0, 0.25)) !default;
$-cell-tap-bg: var(--wot-cell-tap-bg, #f9f9f9) !default;
```

### 标签页组件变量

```scss
/* 标签页变量 */
$-tabs-nav-width: var(--wot-tabs-nav-width, 100vw) !default;
$-tabs-nav-height: var(--wot-tabs-nav-height, 84rpx) !default;
$-tabs-nav-fs: var(--wot-tabs-nav-fs, 28rpx) !default;
$-tabs-nav-color: var(--wot-tabs-nav-color, rgba(0, 0, 0, 0.85)) !default;
$-tabs-nav-bg: var(--wot-tabs-nav-bg, #ffffff) !default;
$-tabs-nav-active-color: var(--wot-tabs-nav-active-color, #4d80f0) !default;
$-tabs-nav-disabled-color: var(--wot-tabs-nav-disabled-color, rgba(0, 0, 0, 0.25)) !default;
$-tabs-nav-line-height: var(--wot-tabs-nav-line-height, 6rpx) !default;
$-tabs-nav-line-width: var(--wot-tabs-nav-line-width, 38rpx) !default;
$-tabs-nav-line-bg-color: var(--wot-tabs-nav-line-bg-color, #4d80f0) !default;
```

### 导航栏组件变量

```scss
/* 导航栏变量 */
$-navbar-height: var(--wot-navbar-height, 88rpx) !default;
$-navbar-color: var(--wot-navbar-color, rgba(0, 0, 0, 0.9)) !default;
$-navbar-background: var(--wot-navbar-background, #ffffff) !default;
$-navbar-arrow-size: var(--wot-navbar-arrow-size, 48rpx) !default;
$-navbar-title-font-size: var(--wot-navbar-title-font-size, 36rpx) !default;
$-navbar-title-font-weight: var(--wot-navbar-title-font-weight, 600) !default;
```

### Toast 轻提示变量

```scss
/* Toast 变量 */
$-toast-color: var(--wot-toast-color, #ffffff) !default;
$-toast-padding: var(--wot-toast-padding, 20rpx 48rpx) !default;
$-toast-max-width: var(--wot-toast-max-width, 600rpx) !default;
$-toast-radius: var(--wot-toast-radius, 16rpx) !default;
$-toast-bg: var(--wot-toast-bg, rgba(0, 0, 0, 0.65)) !default;
$-toast-fs: var(--wot-toast-fs, 28rpx) !default;
$-toast-icon-size: var(--wot-toast-icon-size, 50rpx) !default;
```

## 全局样式混入

### 常用混入定义

在全局样式中可以定义常用的样式混入:

```scss
// src/static/style/mixins.scss

// Flex 居中
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Flex 两端对齐
@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 文本溢出省略
@mixin ellipsis($lines: 1) {
  overflow: hidden;
  @if $lines == 1 {
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}

// 安全区域底部
@mixin safe-area-bottom($padding: 0) {
  padding-bottom: calc(#{$padding} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$padding} + env(safe-area-inset-bottom));
}

// 1px 边框(解决 Retina 屏幕 1px 问题)
@mixin hairline-border($color: #e8e8e8, $position: bottom) {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    pointer-events: none;
    box-sizing: border-box;

    @if $position == bottom {
      left: 0;
      bottom: 0;
      right: 0;
      height: 1px;
      transform: scaleY(0.5);
      background-color: $color;
    }

    @if $position == top {
      left: 0;
      top: 0;
      right: 0;
      height: 1px;
      transform: scaleY(0.5);
      background-color: $color;
    }

    @if $position == left {
      left: 0;
      top: 0;
      bottom: 0;
      width: 1px;
      transform: scaleX(0.5);
      background-color: $color;
    }

    @if $position == right {
      right: 0;
      top: 0;
      bottom: 0;
      width: 1px;
      transform: scaleX(0.5);
      background-color: $color;
    }
  }
}

// 卡片样式
@mixin card-style {
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

// 渐变背景
@mixin gradient-bg($start: #4d80f0, $end: #6a9cf0) {
  background: linear-gradient(135deg, $start 0%, $end 100%);
}
```

### 使用混入

```vue
<template>
  <view class="card">
    <view class="header">
      <text class="title">卡片标题</text>
      <text class="more">查看更多</text>
    </view>
    <view class="content">
      <text class="text">这是一段很长的文本内容,需要显示省略号...</text>
    </view>
  </view>
</template>

```

## 工具类样式

### 基础工具类

在项目中可以定义一些常用的工具类样式:

```scss
// src/static/style/utilities.scss

/* 文本对齐 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* 文本颜色 */
.text-primary { color: var(--wot-color-theme); }
.text-success { color: var(--wot-color-success); }
.text-warning { color: var(--wot-color-warning); }
.text-danger { color: var(--wot-color-danger); }
.text-gray { color: var(--wot-color-secondary); }

/* 背景颜色 */
.bg-white { background-color: #ffffff; }
.bg-gray { background-color: var(--wot-color-bg); }
.bg-primary { background-color: var(--wot-color-theme); }

/* Flex 布局 */
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-around { display: flex; align-items: center; justify-content: space-around; }
.flex-col { display: flex; flex-direction: column; }
.flex-wrap { display: flex; flex-wrap: wrap; }
.flex-1 { flex: 1; }

/* 间距 */
.m-0 { margin: 0; }
.m-8 { margin: 8rpx; }
.m-16 { margin: 16rpx; }
.m-24 { margin: 24rpx; }
.m-32 { margin: 32rpx; }

.mt-8 { margin-top: 8rpx; }
.mt-16 { margin-top: 16rpx; }
.mt-24 { margin-top: 24rpx; }
.mt-32 { margin-top: 32rpx; }

.mb-8 { margin-bottom: 8rpx; }
.mb-16 { margin-bottom: 16rpx; }
.mb-24 { margin-bottom: 24rpx; }
.mb-32 { margin-bottom: 32rpx; }

.p-0 { padding: 0; }
.p-8 { padding: 8rpx; }
.p-16 { padding: 16rpx; }
.p-24 { padding: 24rpx; }
.p-32 { padding: 32rpx; }

/* 圆角 */
.rounded-0 { border-radius: 0; }
.rounded-8 { border-radius: 8rpx; }
.rounded-16 { border-radius: 16rpx; }
.rounded-full { border-radius: 50%; }

/* 字体大小 */
.text-xs { font-size: 20rpx; }
.text-sm { font-size: 24rpx; }
.text-base { font-size: 28rpx; }
.text-lg { font-size: 32rpx; }
.text-xl { font-size: 36rpx; }

/* 字重 */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

/* 溢出处理 */
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
.truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 定位 */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }

/* 尺寸 */
.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }
```

## 主题定制示例

### 蓝色科技主题

```scss
// src/static/style/themes/tech-blue.scss
:root,
page {
  // 主题色
  --wot-color-theme: #1890ff;
  --wot-color-success: #52c41a;
  --wot-color-warning: #faad14;
  --wot-color-danger: #ff4d4f;

  // 按钮
  --wot-button-primary-bg-color: #1890ff;
  --wot-button-medium-radius: 8rpx;

  // 输入框
  --wot-input-border-color: #d9d9d9;

  // 标签页
  --wot-tabs-nav-active-color: #1890ff;
  --wot-tabs-nav-line-bg-color: #1890ff;

  // 导航栏
  --wot-navbar-background: #1890ff;
  --wot-navbar-color: #ffffff;
}
```

### 橙色活力主题

```scss
// src/static/style/themes/orange-energy.scss
:root,
page {
  // 主题色
  --wot-color-theme: #fa541c;
  --wot-color-success: #389e0d;
  --wot-color-warning: #d48806;
  --wot-color-danger: #cf1322;

  // 按钮
  --wot-button-primary-bg-color: #fa541c;
  --wot-button-medium-radius: 40rpx;  // 圆角按钮

  // 标签页
  --wot-tabs-nav-active-color: #fa541c;
  --wot-tabs-nav-line-bg-color: #fa541c;
}
```

### 紫色优雅主题

```scss
// src/static/style/themes/purple-elegant.scss
:root,
page {
  // 主题色
  --wot-color-theme: #722ed1;
  --wot-color-success: #237804;
  --wot-color-warning: #d48806;
  --wot-color-danger: #a8071a;

  // 按钮
  --wot-button-primary-bg-color: #722ed1;

  // 标签页
  --wot-tabs-nav-active-color: #722ed1;
  --wot-tabs-nav-line-bg-color: #722ed1;
}
```

### 动态主题切换

```vue
<template>
  <view class="theme-demo">
    <wd-config-provider :theme-vars="themeVars">
      <view class="content">
        <wd-button type="primary">主题按钮</wd-button>
        <wd-tabs v-model="activeTab">
          <wd-tab title="标签1" />
          <wd-tab title="标签2" />
        </wd-tabs>
      </view>
    </wd-config-provider>

    <view class="theme-selector">
      <view
        v-for="theme in themes"
        :key="theme.name"
        class="theme-item"
        :style="{ backgroundColor: theme.color }"
        @click="selectTheme(theme)"
      >
        {{ theme.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { ConfigProviderThemeVars } from '@/wd'

interface ThemeConfig {
  name: string
  color: string
  vars: ConfigProviderThemeVars
}

const themes: ThemeConfig[] = [
  {
    name: '默认蓝',
    color: '#4d80f0',
    vars: {
      colorTheme: '#4d80f0',
      buttonPrimaryBgColor: '#4d80f0',
      tabsNavActiveColor: '#4d80f0',
      tabsNavLineBgColor: '#4d80f0',
    },
  },
  {
    name: '科技蓝',
    color: '#1890ff',
    vars: {
      colorTheme: '#1890ff',
      buttonPrimaryBgColor: '#1890ff',
      tabsNavActiveColor: '#1890ff',
      tabsNavLineBgColor: '#1890ff',
    },
  },
  {
    name: '活力橙',
    color: '#fa541c',
    vars: {
      colorTheme: '#fa541c',
      buttonPrimaryBgColor: '#fa541c',
      tabsNavActiveColor: '#fa541c',
      tabsNavLineBgColor: '#fa541c',
    },
  },
  {
    name: '优雅紫',
    color: '#722ed1',
    vars: {
      colorTheme: '#722ed1',
      buttonPrimaryBgColor: '#722ed1',
      tabsNavActiveColor: '#722ed1',
      tabsNavLineBgColor: '#722ed1',
    },
  },
]

const activeTab = ref(0)
const currentTheme = ref(0)

const themeVars = computed(() => themes[currentTheme.value].vars)

const selectTheme = (theme: ThemeConfig) => {
  currentTheme.value = themes.indexOf(theme)
  // 可选: 持久化主题选择
  uni.setStorageSync('selected-theme', currentTheme.value)
}
</script>

```

## 跨平台兼容

### 条件编译样式

```scss
/* 仅在 H5 端生效 */
/* #ifdef H5 */
.h5-only {
  cursor: pointer;
  user-select: none;
}

// H5 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}
/* #endif */

/* 仅在微信小程序端生效 */
/* #ifdef MP-WEIXIN */
.mp-weixin-only {
  -webkit-tap-highlight-color: transparent;
}
/* #endif */

/* 仅在 App 端生效 */
/* #ifdef APP-PLUS */
.app-only {
  // App 特定样式
}
/* #endif */

/* 除 H5 外的平台 */
/* #ifndef H5 */
.not-h5 {
  // 非 H5 平台样式
}
/* #endif */
```

### 安全区域适配

```scss
// 底部安全区域
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);  // iOS 11.0-11.2
  padding-bottom: env(safe-area-inset-bottom);       // iOS 11.2+
}

// 固定底部按钮
.fixed-bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
}

// 顶部状态栏
.status-bar-placeholder {
  height: var(--status-bar-height, 44px);
  width: 100%;
}
```

## 最佳实践

### 1. 优先使用 CSS 变量

优先使用 CSS 变量而非硬编码颜色值,便于主题定制:

```scss
// ✅ 推荐
.button {
  background-color: var(--wot-color-theme);
  color: var(--wot-color-content);
}

// ❌ 避免
.button {
  background-color: #4d80f0;
  color: #262626;
}
```

### 2. 使用语义化变量名

选择具有语义的变量名,而非视觉描述:

```scss
// ✅ 推荐
.error-message {
  color: var(--wot-color-danger);
}

// ❌ 避免
.error-message {
  color: var(--red-color);
}
```

### 3. 遵循间距规范

使用统一的间距变量,保持视觉一致性:

```scss
// ✅ 推荐
.card {
  padding: var(--wot-size-side-padding);
  margin-bottom: 24rpx;
}

// ❌ 避免(间距不统一)
.card {
  padding: 33rpx;
  margin-bottom: 17rpx;
}
```

### 4. 避免深层嵌套

SCSS 嵌套不超过 3 层,提高可读性和性能:

```scss
// ✅ 推荐
.card {
  .header { ... }
  .title { ... }
}

// ❌ 避免
.page {
  .content {
    .card {
      .header {
        .title { ... }
      }
    }
  }
}
```

### 5. 组件样式隔离

使用 scoped 样式避免污染全局:

```vue
```

## 常见问题

### 1. CSS 变量在小程序中不生效

**问题原因:**
- 部分小程序基础库版本不支持 CSS 变量
- 变量定义位置不正确

**解决方案:**

```scss
// 确保在 :root 和 page 选择器中都定义
:root,
page {
  --wot-color-theme: #1890ff;
}
```

### 2. rpx 单位转换问题

**问题原因:**
- 在 JS 中动态设置样式时 rpx 不自动转换

**解决方案:**

```typescript
// 使用工具函数转换 rpx 到 px
const rpxToPx = (rpx: number) => {
  const info = uni.getSystemInfoSync()
  return (rpx / 750) * info.windowWidth
}

// 动态样式使用 px
const style = {
  width: `${rpxToPx(200)}px`,
  height: `${rpxToPx(200)}px`,
}
```

### 3. 样式穿透不生效

**问题原因:**
- scoped 样式无法影响子组件

**解决方案:**

```scss
// 使用 :deep() 穿透样式
:deep(.wd-button) {
  background-color: #1890ff;
}

// 或使用全局样式块
<style lang="scss">
.custom-button .wd-button {
  background-color: #1890ff;
}
</style>
```

### 4. 暗黑模式样式闪烁

**问题原因:**
- 主题切换时没有过渡效果

**解决方案:**

```scss
// 添加全局过渡
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

本文档详细介绍了 RuoYi-Plus-UniApp 移动端项目的全局样式体系。通过合理使用这些样式变量和规范,可以快速构建统一、美观、易维护的移动端应用界面。
