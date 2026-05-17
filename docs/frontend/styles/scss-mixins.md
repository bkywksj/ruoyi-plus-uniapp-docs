# SCSS Mixins 混合器

## 介绍

RuoYi-Plus-UI 提供了一套实用的 SCSS 混合器（Mixins）函数集，封装了常用的样式模式和复杂的 CSS 技巧。Mixins 可以大幅减少重复代码，提高样式开发效率，并确保整个应用的样式一致性。

**核心特性：**

- **清除浮动** - 使用现代的伪元素方法清除浮动
- **响应式断点** - 提供预设断点的媒体查询混合器
- **自定义滚动条** - 美化 WebKit 浏览器滚动条样式
- **CSS 三角形** - 使用纯 CSS 生成各个方向的三角形
- **卡片样式** - 统一的卡片基础样式
- **按钮基础** - 通用的按钮样式模式

## 文件位置

Mixins 定义在 `src/assets/styles/abstracts/_mixins.scss` 文件中：

```text
src/assets/styles/
├── abstracts/
│   ├── _variables.scss    # 变量定义
│   └── _mixins.scss       # Mixins 定义 ← 本文档内容
└── main.scss              # 主入口文件
```

## 引入方式

### 在 SCSS 文件中引入

```scss
@use '@/assets/styles/abstracts/mixins' as *;

// 使用 mixin
.element {
  @include clearfix;
}
```

### 在 Vue 组件中使用

由于 `main.scss` 已在全局引入，可以直接使用预定义的工具类：

```vue
<template>
  <div class="clearfix">
    <div class="scrollable-element">
      滚动内容
    </div>
  </div>
</template>
```

## 清除浮动 Mixin

### clearfix

使用伪元素方法清除包含浮动元素的容器浮动问题。

```scss
/**
 * 清除浮动混合器
 * 使用伪元素方法清除包含浮动元素的容器浮动问题
 */
@mixin clearfix {
  &:after {
    content: '';
    display: table;
    clear: both;
  }
}
```

**使用方法：**

```scss
.container {
  @include clearfix;

  .left-column {
    float: left;
    width: 200px;
  }

  .right-column {
    float: right;
    width: 300px;
  }
}
```

**编译结果：**

```css
.container::after {
  content: '';
  display: table;
  clear: both;
}

.container .left-column {
  float: left;
  width: 200px;
}

.container .right-column {
  float: right;
  width: 300px;
}
```

**预定义工具类：**

```scss
.clearfix {
  @include clearfix;
}
```

**HTML 使用：**

```html
<div class="clearfix">
  <div style="float: left;">左浮动</div>
  <div style="float: right;">右浮动</div>
</div>
<!-- 容器高度会正确包含浮动元素 -->
```

## 响应式断点 Mixin

### respond-to

提供预设断点的响应式媒体查询混合器，简化响应式样式编写。

```scss
/**
 * 响应式断点混合器
 * 直接使用断点值，避免映射查找问题
 */
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: #{$sm}) {
      @content;
    }
  } @else if $breakpoint == 'md' {
    @media (max-width: #{$md}) {
      @content;
    }
  } @else if $breakpoint == 'lg' {
    @media (max-width: #{$lg}) {
      @content;
    }
  } @else if $breakpoint == 'xl' {
    @media (max-width: #{$xl}) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}
```

**预设断点值：**

| 断点名 | 变量 | 值 | 适用设备 |
|--------|------|------|----------|
| `sm` | `$sm` | `768px` | 小型平板/大手机 |
| `md` | `$md` | `992px` | 平板 |
| `lg` | `$lg` | `1200px` | 小型桌面显示器 |
| `xl` | `$xl` | `1920px` | 大型桌面显示器 |

**使用方法：**

```scss
.sidebar {
  width: 240px;

  // 在小于 992px 时隐藏侧边栏
  @include respond-to('md') {
    display: none;
  }
}

.container {
  padding: 32px;

  // 小于 768px 时减小内边距
  @include respond-to('sm') {
    padding: 16px;
  }
}
```

**编译结果：**

```css
.sidebar {
  width: 240px;
}

@media (max-width: 992px) {
  .sidebar {
    display: none;
  }
}

.container {
  padding: 32px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}
```

**多断点示例：**

```scss
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @include respond-to('lg') {
    grid-template-columns: repeat(3, 1fr);
  }

  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @include respond-to('sm') {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

## 自定义滚动条 Mixin

### scrollbar

为元素添加美化的 WebKit 滚动条样式。

```scss
/**
 * 自定义滚动条样式混合器
 * 为元素添加美化的webkit滚动条样式
 */
@mixin scrollbar {
  &::-webkit-scrollbar-track-piece {
    background: #d3dce6;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #99a9bf;
    border-radius: var(--radius-round);
  }
}
```

**使用方法：**

```scss
.scrollable-container {
  height: 400px;
  overflow-y: auto;
  @include scrollbar;
}
```

**编译结果：**

```css
.scrollable-container {
  height: 400px;
  overflow-y: auto;
}

.scrollable-container::-webkit-scrollbar-track-piece {
  background: #d3dce6;
}

.scrollable-container::-webkit-scrollbar {
  width: 6px;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: #99a9bf;
  border-radius: var(--radius-round);
}
```

**预定义工具类：**

```scss
.scrollable-element {
  @include scrollbar;
}
```

**HTML 使用：**

```html
<div class="scrollable-element" style="height: 300px; overflow-y: auto;">
  <!-- 长内容 -->
</div>
```

**自定义颜色变体：**

```scss
// 暗色主题滚动条
@mixin scrollbar-dark {
  &::-webkit-scrollbar-track-piece {
    background: var(--bg-level-2);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--bg-level-4);
    border-radius: var(--radius-round);

    &:hover {
      background: #666;
    }
  }
}
```

## 百分比宽度居中 Mixin

### pct

设置元素宽度为指定百分比并水平居中。

```scss
/**
 * 百分比宽度居中混合器
 * 设置元素宽度为指定百分比并水平居中
 *
 * @param {Number} $pct - 宽度百分比值(不带%)
 */
@mixin pct($pct) {
  width: $pct * 1%;
  position: relative;
  margin: 0 auto;
}
```

**使用方法：**

```scss
.content-wrapper {
  @include pct(80);  // 宽度 80% 并居中
}

.narrow-container {
  @include pct(60);  // 宽度 60% 并居中
}

.full-width {
  @include pct(100);  // 宽度 100%
}
```

**编译结果：**

```css
.content-wrapper {
  width: 80%;
  position: relative;
  margin: 0 auto;
}

.narrow-container {
  width: 60%;
  position: relative;
  margin: 0 auto;
}

.full-width {
  width: 100%;
  position: relative;
  margin: 0 auto;
}
```

**响应式变体：**

```scss
.responsive-container {
  @include pct(80);

  @include respond-to('md') {
    @include pct(90);
  }

  @include respond-to('sm') {
    @include pct(100);
  }
}
```

## CSS 三角形 Mixin

### triangle

使用 CSS 边框技巧创建各个方向的三角形。

```scss
/**
 * CSS三角形生成混合器
 * 使用CSS边框技巧创建各个方向的三角形
 *
 * @param {Number} $width - 三角形基础宽度
 * @param {Number} $height - 三角形高度
 * @param {Color} $color - 三角形颜色
 * @param {String} $direction - 三角形方向(up|right|down|left)
 */
@mixin triangle($width, $height, $color, $direction) {
  $width: $width/2; // 计算边框宽度(三角形宽度的一半)
  $color-border-style: $height solid $color; // 有颜色的边框样式
  $transparent-border-style: $width solid transparent; // 透明边框样式
  height: 0; // 元素高度为0
  width: 0; // 元素宽度为0

  // 根据方向设置不同的边框组合
  @if $direction == up {
    border-bottom: $color-border-style; // 底部边框有颜色，形成向上的三角形
    border-left: $transparent-border-style;
    border-right: $transparent-border-style;
  } @else if $direction == right {
    border-left: $color-border-style; // 左边框有颜色，形成向右的三角形
    border-top: $transparent-border-style;
    border-bottom: $transparent-border-style;
  } @else if $direction == down {
    border-top: $color-border-style; // 顶部边框有颜色，形成向下的三角形
    border-left: $transparent-border-style;
    border-right: $transparent-border-style;
  } @else if $direction == left {
    border-right: $color-border-style; // 右边框有颜色，形成向左的三角形
    border-top: $transparent-border-style;
    border-bottom: $transparent-border-style;
  }
}
```

**使用方法：**

```scss
// 向上的三角形
.arrow-up {
  @include triangle(10px, 6px, #409eff, up);
}

// 向右的三角形
.arrow-right {
  @include triangle(6px, 10px, #67c23a, right);
}

// 向下的三角形
.arrow-down {
  @include triangle(10px, 6px, #e6a23c, down);
}

// 向左的三角形
.arrow-left {
  @include triangle(6px, 10px, #f56c6c, left);
}
```

**编译结果（以向上为例）：**

```css
.arrow-up {
  height: 0;
  width: 0;
  border-bottom: 6px solid #409eff;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}
```

**实际应用 - 下拉菜单箭头：**

```scss
.dropdown {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    @include triangle(8px, 4px, #666, down);
    transition: transform 0.3s;
  }

  &.is-open::after {
    transform: translateY(-50%) rotate(180deg);
  }
}
```

**实际应用 - 气泡框箭头：**

```scss
.tooltip {
  position: relative;
  background: #303133;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;

  // 顶部箭头
  &.top::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    @include triangle(12px, 6px, #303133, up);
  }

  // 底部箭头
  &.bottom::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    @include triangle(12px, 6px, #303133, down);
  }
}
```

## 卡片样式 Mixin

### card-style

提供统一的卡片基础样式，包括背景、边框、圆角和悬停效果。

```scss
/**
 * 卡片样式混合器
 */
@mixin card-style {
  background-color: var(--bg-level-1);
  border: 1px solid var(--bg-level-2);
  border-radius: var(--radius-md) !important;
  transition: box-shadow var(--duration-normal) ease;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}
```

**使用方法：**

```scss
.custom-card {
  @include card-style;
  padding: 24px;
}

.info-panel {
  @include card-style;
  padding: 16px;
  margin-bottom: 16px;
}
```

**编译结果：**

```css
.custom-card {
  background-color: var(--bg-level-1);
  border: 1px solid var(--bg-level-2);
  border-radius: var(--radius-md) !important;
  transition: box-shadow var(--duration-normal) ease;
  padding: 24px;
}

.custom-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
```

**扩展卡片样式：**

```scss
// 可点击卡片
.clickable-card {
  @include card-style;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

// 选中状态卡片
.selectable-card {
  @include card-style;

  &.is-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}
```

## 按钮基础 Mixin

### button-base

提供通用的按钮样式模式，包括 Flex 布局、圆角、过渡效果和禁用状态。

```scss
/**
 * 按钮基础样式混合器
 */
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

**使用方法：**

```scss
.custom-button {
  @include button-base;
  padding: 8px 16px;
  background-color: var(--el-color-primary);
  color: #fff;

  &:hover:not(:disabled) {
    background-color: var(--el-color-primary-light-3);
  }
}
```

**编译结果：**

```css
.custom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) ease;
  padding: 8px 16px;
  background-color: var(--el-color-primary);
  color: #fff;
}

.custom-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-button:hover:not(:disabled) {
  background-color: var(--el-color-primary-light-3);
}
```

**按钮变体：**

```scss
// 主要按钮
.btn-primary {
  @include button-base;
  padding: 10px 20px;
  background-color: var(--el-color-primary);
  color: #fff;

  &:hover:not(:disabled) {
    background-color: var(--el-color-primary-light-3);
  }
}

// 成功按钮
.btn-success {
  @include button-base;
  padding: 10px 20px;
  background-color: var(--el-color-success);
  color: #fff;

  &:hover:not(:disabled) {
    background-color: #85ce61;
  }
}

// 危险按钮
.btn-danger {
  @include button-base;
  padding: 10px 20px;
  background-color: var(--el-color-danger);
  color: #fff;

  &:hover:not(:disabled) {
    background-color: #f78989;
  }
}

// 文字按钮
.btn-text {
  @include button-base;
  padding: 4px 8px;
  background-color: transparent;
  color: var(--el-color-primary);

  &:hover:not(:disabled) {
    background-color: var(--el-color-primary-light-9);
  }
}

// 图标按钮
.btn-icon {
  @include button-base;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background-color: var(--bg-level-2);

  &:hover:not(:disabled) {
    background-color: var(--bg-level-3);
  }
}
```

## 实际应用示例

### 创建响应式布局

```scss
.page-layout {
  display: flex;
  gap: 24px;

  .sidebar {
    width: 280px;
    flex-shrink: 0;
    @include card-style;
    padding: 24px;

    @include respond-to('lg') {
      width: 240px;
    }

    @include respond-to('md') {
      display: none;
    }
  }

  .main-content {
    flex: 1;
    min-width: 0;

    @include respond-to('md') {
      width: 100%;
    }
  }
}
```

### 创建可滚动列表

```scss
.scrollable-list {
  height: 400px;
  overflow-y: auto;
  @include scrollbar;
  @include card-style;
  padding: 0;

  .list-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--bg-level-2);
    transition: background-color var(--duration-normal);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--bg-level-2);
    }
  }
}
```

### 创建工具栏

```scss
.toolbar {
  @include clearfix;
  padding: 16px;
  background-color: var(--bg-level-1);
  border-bottom: 1px solid var(--app-border);

  .toolbar-left {
    float: left;
    display: flex;
    gap: 8px;
  }

  .toolbar-right {
    float: right;
    display: flex;
    gap: 8px;
  }

  .toolbar-button {
    @include button-base;
    padding: 8px 16px;
    background-color: var(--bg-level-2);
    color: var(--app-text);

    &:hover:not(:disabled) {
      background-color: var(--bg-level-3);
    }

    &.is-active {
      background-color: var(--el-color-primary);
      color: #fff;
    }
  }

  @include respond-to('sm') {
    .toolbar-left,
    .toolbar-right {
      float: none;
      width: 100%;
      margin-bottom: 8px;
    }

    .toolbar-right {
      margin-bottom: 0;
    }
  }
}
```

### 创建气泡提示

```scss
.popover {
  position: absolute;
  z-index: var(--z-modal);
  @include card-style;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  // 箭头容器
  &::before {
    content: '';
    position: absolute;
  }

  // 顶部箭头
  &.placement-top::before {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    @include triangle(16px, 8px, var(--bg-level-1), up);
  }

  // 底部箭头
  &.placement-bottom::before {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    @include triangle(16px, 8px, var(--bg-level-1), down);
  }

  // 左侧箭头
  &.placement-left::before {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    @include triangle(8px, 16px, var(--bg-level-1), left);
  }

  // 右侧箭头
  &.placement-right::before {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    @include triangle(8px, 16px, var(--bg-level-1), right);
  }
}
```

## 自定义 Mixins

### 创建自定义 Mixin

你可以在 `_mixins.scss` 中添加自定义 Mixin：

```scss
/**
 * 文本省略混合器
 * @param {Number} $lines - 显示行数
 */
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/**
 * 绝对居中混合器
 */
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/**
 * Flex 居中混合器
 */
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/**
 * 隐藏元素但保持可访问性
 */
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/**
 * 渐变背景混合器
 */
@mixin gradient-bg($start-color, $end-color, $direction: to right) {
  background: $start-color;
  background: linear-gradient($direction, $start-color, $end-color);
}

/**
 * 阴影层级混合器
 */
@mixin elevation($level: 1) {
  @if $level == 1 {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  } @else if $level == 2 {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
  } @else if $level == 3 {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10);
  } @else if $level == 4 {
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05);
  } @else if $level == 5 {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
}
```

### 使用自定义 Mixin

```scss
.title {
  @include text-ellipsis(1);
}

.description {
  @include text-ellipsis(3);
}

.modal {
  @include absolute-center;
  @include elevation(3);
  background: var(--bg-level-1);
  border-radius: var(--radius-lg);
}

.icon-container {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.screen-reader-only {
  @include visually-hidden;
}

.hero-section {
  @include gradient-bg(#667eea, #764ba2);
  color: #fff;
  padding: 80px 0;
}
```

## 最佳实践

### 1. 合理使用 Mixin

```scss
// ✅ 推荐：复杂或重复的样式模式
@mixin card-style { ... }

// ❌ 不推荐：简单的单行样式
@mixin red-text {
  color: red;
}
```

### 2. 参数化 Mixin

```scss
// ✅ 推荐：可配置的 Mixin
@mixin button-size($padding-y, $padding-x, $font-size) {
  padding: $padding-y $padding-x;
  font-size: $font-size;
}

.btn-sm { @include button-size(4px, 8px, 12px); }
.btn-md { @include button-size(8px, 16px, 14px); }
.btn-lg { @include button-size(12px, 24px, 16px); }

// ❌ 不推荐：硬编码的 Mixin
@mixin btn-small {
  padding: 4px 8px;
  font-size: 12px;
}
```

### 3. 使用默认参数

```scss
// ✅ 推荐：提供默认值
@mixin transition($property: all, $duration: 0.3s, $timing: ease) {
  transition: $property $duration $timing;
}

.element {
  @include transition;                    // 使用默认值
  @include transition(transform);         // 自定义属性
  @include transition(opacity, 0.5s);     // 自定义时长
}
```

### 4. 结合 CSS 变量

```scss
// ✅ 推荐：使用 CSS 变量保持主题一致性
@mixin card-style {
  background-color: var(--bg-level-1);
  border-radius: var(--radius-md);
  transition: box-shadow var(--duration-normal);
}

// ❌ 不推荐：硬编码颜色值
@mixin card-style {
  background-color: #ffffff;
  border-radius: 8px;
}
```

### 5. 组合 Mixin

```scss
// 基础 Mixin
@mixin flex-center { ... }
@mixin card-style { ... }
@mixin elevation($level) { ... }

// 组合使用
.modal-card {
  @include card-style;
  @include elevation(3);

  .modal-header {
    @include flex-center;
    padding: 16px;
  }
}
```

## 常见问题

### 1. Mixin 和 Extend 的区别

**问题：** 什么时候用 `@mixin`，什么时候用 `@extend`？

**解答：**

```scss
// Mixin：每次使用都会复制代码，适合带参数的样式
@mixin button($color) {
  background: $color;
  padding: 8px 16px;
}

.btn-primary { @include button(blue); }
.btn-danger { @include button(red); }

// 编译后：代码会复制
.btn-primary { background: blue; padding: 8px 16px; }
.btn-danger { background: red; padding: 8px 16px; }

// Extend：共享选择器，适合无参数的固定样式
%btn-base {
  padding: 8px 16px;
  border-radius: 4px;
}

.btn-primary { @extend %btn-base; background: blue; }
.btn-danger { @extend %btn-base; background: red; }

// 编译后：选择器合并
.btn-primary, .btn-danger { padding: 8px 16px; border-radius: 4px; }
.btn-primary { background: blue; }
.btn-danger { background: red; }
```

### 2. 响应式断点顺序

**问题：** 响应式样式的正确顺序是什么？

**解答：**

```scss
// ✅ 推荐：从大到小（移动优先）
.element {
  width: 100%;  // 移动端默认

  @include respond-to('sm') {
    width: 50%;  // 768px 以下
  }
  // 注意：当前 respond-to 是 max-width，所以要从大到小
}

// 或者使用 min-width 方式（桌面优先）
@mixin respond-up($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: #{$sm}) { @content; }
  }
  // ...
}

.element {
  width: 100%;  // 小屏默认

  @include respond-up('sm') {
    width: 50%;  // 768px 以上
  }

  @include respond-up('md') {
    width: 33.33%;  // 992px 以上
  }
}
```

### 3. Mixin 中使用 @content

**问题：** 如何在 Mixin 中接收内容块？

**解答：**

```scss
@mixin on-hover {
  &:hover,
  &:focus {
    @content;
  }
}

.button {
  background: blue;

  @include on-hover {
    background: darkblue;
    transform: scale(1.05);
  }
}

// 编译后
.button {
  background: blue;
}

.button:hover,
.button:focus {
  background: darkblue;
  transform: scale(1.05);
}
```

## Mixin 速查表

| Mixin | 参数 | 说明 |
|-------|------|------|
| `clearfix` | 无 | 清除浮动 |
| `respond-to` | `$breakpoint` | 响应式断点 |
| `scrollbar` | 无 | 自定义滚动条 |
| `pct` | `$pct` | 百分比宽度居中 |
| `triangle` | `$width, $height, $color, $direction` | CSS 三角形 |
| `card-style` | 无 | 卡片基础样式 |
| `button-base` | 无 | 按钮基础样式 |

### 断点值参考

| 断点 | 变量 | 值 | 设备 |
|------|------|------|------|
| `sm` | `$sm` | `768px` | 平板/大手机 |
| `md` | `$md` | `992px` | 小型笔记本 |
| `lg` | `$lg` | `1200px` | 桌面显示器 |
| `xl` | `$xl` | `1920px` | 大型显示器 |

### 设备断点参考

| 变量 | 值 | 设备 |
|------|------|------|
| `$device-notebook` | `1600px` | 笔记本 |
| `$device-ipad-pro` | `1180px` | iPad Pro |
| `$device-ipad` | `800px` | iPad |
| `$device-ipad-vertical` | `900px` | iPad 竖屏 |
| `$device-phone` | `500px` | 手机 |
