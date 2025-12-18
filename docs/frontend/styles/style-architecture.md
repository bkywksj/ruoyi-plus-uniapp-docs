# 样式架构

## 介绍

RuoYi-Plus-UniApp 前端项目采用完整的 SCSS 模块化样式架构，基于 ITCSS (Inverted Triangle CSS) 方法论设计。

**核心特性:**

- **SCSS 模块化** - 样式按功能分层组织,便于维护和扩展
- **八层架构** - 从低特异性到高特异性逐层组织,避免样式冲突
- **主题系统** - 基于 CSS 变量实现亮色/暗色主题动态切换
- **混合宏库** - 提供响应式断点、滚动条美化、三角形生成等通用工具
- **Element Plus 深度定制** - 提供现代化、一致的 UI 组件视觉体验
- **View Transition 动画** - 使用浏览器原生 API 实现主题切换圆形扩散效果

## 八层架构设计

样式架构按照特异性从低到高分为八层:

| 层级 | 名称 | 说明 | 特异性 |
|------|------|------|--------|
| 1 | External Libraries | 外部库样式(Element Plus) | 最低 |
| 2 | Abstracts | 变量、混合宏、函数(不产生输出) | 无 |
| 3 | Themes | 主题定义(CSS 变量) | 低 |
| 4 | Base | 全局重置、排版基础 | 低 |
| 5 | Layout | 页面布局、侧边栏、头部 | 中 |
| 6 | Components | 按钮、卡片等 UI 组件 | 中 |
| 7 | Vendors | Element Plus 组件覆盖样式 | 高 |
| 8 | Animations | 过渡动画、主题切换动画 | 最高 |

**架构优势:**
- 低层样式被高层覆盖,符合 CSS 级联原则
- 抽象层集中管理变量和工具,避免重复
- 供应商层最后导入,确保能覆盖第三方组件

## 目录结构

```
src/assets/styles/
├── main.scss                # 主入口文件
├── abstracts/               # 抽象层
│   ├── _variables.scss      # SCSS 变量
│   └── _mixins.scss         # 混合宏
├── themes/                  # 主题层
│   ├── _light.scss          # 亮色主题 CSS 变量
│   └── _dark.scss           # 暗色主题 CSS 变量
├── base/                    # 基础层
│   ├── _reset.scss          # 样式重置
│   └── _typography.scss     # 排版基础
├── layout/                  # 布局层
│   └── _layout.scss         # 页面布局
├── components/              # 组件层
│   ├── _buttons.scss        # 按钮样式
│   └── _animations.scss     # 动画效果
├── vendors/                 # 供应商层
│   └── _element-plus.scss   # Element Plus 覆盖
└── _theme-animation.scss    # 主题切换动画
```

## 抽象层详解

### 响应式断点混合宏

```scss
$breakpoints: (
  'sm': 576px,   // 手机横屏
  'md': 768px,   // 平板
  'lg': 992px,   // 桌面
  'xl': 1200px   // 大屏
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 使用示例
.sidebar {
  width: 100%;
  @include respond-to('md') { width: 200px; }
  @include respond-to('lg') { width: 250px; }
}
```

### 清除浮动

```scss
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}
```

### 滚动条美化

```scss
@mixin scrollbar($width: 6px, $track-color: transparent, $thumb-color: rgba(144, 147, 153, 0.3)) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }
  &::-webkit-scrollbar-track {
    background: $track-color;
  }
  &::-webkit-scrollbar-thumb {
    background: $thumb-color;
    border-radius: $width / 2;
    &:hover {
      background: darken($thumb-color, 10%);
    }
  }
}
```

### 绝对居中

```scss
@mixin pct($property, $values...) {
  #{$property}: $values;
  position: absolute;
  @if $property == 'width' {
    left: 50%;
    transform: translateX(-50%);
  } @else if $property == 'height' {
    top: 50%;
    transform: translateY(-50%);
  } @else {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
```

### CSS 三角形

```scss
@mixin triangle($direction: down, $size: 6px, $color: currentColor) {
  width: 0;
  height: 0;
  border-style: solid;

  @if $direction == down {
    border-width: $size $size 0;
    border-color: $color transparent transparent;
  } @else if $direction == up {
    border-width: 0 $size $size;
    border-color: transparent transparent $color;
  } @else if $direction == left {
    border-width: $size $size $size 0;
    border-color: transparent $color transparent transparent;
  } @else if $direction == right {
    border-width: $size 0 $size $size;
    border-color: transparent transparent transparent $color;
  }
}
```

### 卡片样式

```scss
@mixin card-style($padding: 20px, $radius: 8px) {
  padding: $padding;
  background: var(--bg-level-1);
  border-radius: $radius;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

### 按钮基础样式

```scss
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

## 主题层详解

### CSS 变量体系

亮色主题定义 (`themes/_light.scss`):

```scss
:root {
  // 品牌色
  --primary-color: #409eff;
  --primary-color-light: rgba(64, 158, 255, 0.1);
  --primary-color-hover: #66b1ff;
  --primary-color-active: #3a8ee6;

  // 语义色
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;

  // 背景色层级(五层背景色体系)
  --bg-base: #f5f7fa;     // 最底层背景
  --bg-level-1: #ffffff;   // 卡片/面板背景
  --bg-level-2: #f5f7fa;   // hover 状态背景
  --bg-level-3: #e4e7ed;   // 二级 hover 背景
  --bg-level-4: #dcdfe6;   // 特殊状态背景

  // 文字色
  --text-color-primary: #303133;
  --text-color-regular: #606266;
  --text-color-secondary: #909399;
  --text-color-placeholder: #c0c4cc;
  --text-color-disabled: #c0c4cc;

  // 边框色
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
  --border-color-lighter: #ebeef5;
}
```

暗色主题定义 (`themes/_dark.scss`):

```scss
.dark {
  // 品牌色(暗色适配)
  --primary-color: #409eff;
  --primary-color-light: rgba(64, 158, 255, 0.15);
  --primary-color-hover: #66b1ff;

  // 背景色层级(暗色五层体系)
  --bg-base: #141414;
  --bg-level-1: #1d1d1d;
  --bg-level-2: #262626;
  --bg-level-3: #303030;
  --bg-level-4: #3a3a3a;

  // 文字色(暗色适配)
  --text-color-primary: #e5eaf3;
  --text-color-regular: #cfd3dc;
  --text-color-secondary: #a3a6ad;

  // 边框色
  --border-color: #414243;
  --border-color-light: #363637;
}
```

## 基础层详解

### 全局重置

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color-primary);
  background: var(--bg-base);
}

a {
  color: var(--primary-color);
  text-decoration: none;
  &:hover { text-decoration: underline; }
}
```

### 排版基础

```scss
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.35;
  color: var(--text-color-primary);
}

h1 { font-size: 2rem; margin-bottom: 1rem; }
h2 { font-size: 1.5rem; margin-bottom: 0.875rem; }
h3 { font-size: 1.25rem; margin-bottom: 0.75rem; }
h4 { font-size: 1.125rem; margin-bottom: 0.625rem; }
h5 { font-size: 1rem; margin-bottom: 0.5rem; }
h6 { font-size: 0.875rem; margin-bottom: 0.5rem; }

p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

code {
  padding: 2px 6px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 0.875em;
  background: var(--bg-level-2);
  border-radius: 3px;
}

pre {
  padding: 16px;
  overflow-x: auto;
  background: var(--bg-level-2);
  border-radius: 8px;
  code {
    padding: 0;
    background: transparent;
  }
}
```

## 布局层详解

### 应用容器

```scss
.app-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

// 侧边栏布局
.sidebar-layout {
  .sidebar-container {
    flex-shrink: 0;
    width: 200px;
    transition: width 0.3s ease;
  }
  .main-container {
    flex: 1;
    overflow: hidden;
  }
}

// 顶部导航布局
.top-nav-layout {
  flex-direction: column;
  .top-nav-container {
    height: 60px;
    background: var(--bg-level-1);
  }
  .main-container {
    flex: 1;
    overflow: auto;
  }
}
```

### 侧边栏系统

```scss
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--bg-level-1);
  z-index: 1001;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  transition: width 0.3s ease;

  // 展开状态
  &.is-expand { width: 200px; }

  // 收起状态
  &.is-collapse {
    width: 64px;
    .menu-text { display: none; }
    .el-sub-menu__icon-arrow { display: none; }
  }
}

// 主内容区
.main-container {
  margin-left: 200px;
  transition: margin-left 0.3s ease;

  .sidebar-container.is-collapse + & {
    margin-left: 64px;
  }
}

// 菜单样式
.sidebar-menu {
  border-right: none;
  background: transparent;

  .el-menu-item {
    height: 48px;
    line-height: 48px;
    padding-left: 16px !important;
    color: var(--text-color-regular);
    transition: all 0.3s ease;

    &:hover { background: var(--bg-level-2); }
    &.is-active {
      background: var(--primary-color-light);
      color: var(--primary-color);
    }
  }
}
```

### 头部导航

```scss
.navbar {
  height: 50px;
  position: sticky;
  top: 0;
  background: var(--bg-level-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 16px;

  .hamburger-container {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      background: var(--bg-level-2);
      border-radius: 4px;
    }
  }

  .breadcrumb-container {
    flex: 1;
    margin-left: 16px;
  }

  .right-menu {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }
    }
  }
}
```

### 响应式布局

```scss
// 移动端适配
@media (max-width: 768px) {
  .sidebar-container {
    transform: translateX(-100%);
    width: 200px;
    &.is-open { transform: translateX(0); }
  }

  .main-container { margin-left: 0; }

  .sidebar-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: none;
    &.is-visible { display: block; }
  }
}

// 平板适配
@media (min-width: 768px) and (max-width: 992px) {
  .sidebar-container {
    width: 64px;
    &:hover {
      width: 200px;
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
    }
  }
  .main-container { margin-left: 64px; }
}
```

## 组件层详解

### 彩色按钮混合宏

```scss
@mixin colorBtn($color) {
  background: $color;
  color: white;
  border-color: $color;

  &:hover {
    background: lighten($color, 5%);
    border-color: lighten($color, 5%);
  }
  &:active {
    background: darken($color, 5%);
    border-color: darken($color, 5%);
  }
  &:focus {
    box-shadow: 0 0 0 3px rgba($color, 0.3);
  }
}

// 使用示例
.btn-primary { @include colorBtn(#409eff); }
.btn-success { @include colorBtn(#67c23a); }
.btn-danger { @include colorBtn(#f56c6c); }
```

### 边框动画按钮

```scss
.pan-btn {
  position: relative;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    transition: left 0.5s ease;
  }

  &:hover::before { left: 100%; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}
```

### 常用动画

```scss
// 淡入淡出
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-enter-active { animation: fade-in 0.3s ease; }
.fade-leave-active { animation: fade-in 0.3s ease reverse; }

// 滑动效果
@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

// 缩放效果
@keyframes scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

## 供应商层详解

供应商层专门用于定制 Element Plus 组件库样式。

### 分页组件定制

```scss
.el-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;

  .el-pager .number {
    min-width: 32px;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-level-2);
      color: var(--primary-color);
    }
    &.is-active {
      background: var(--primary-color);
      color: white;
      font-weight: 600;
    }
  }

  .btn-prev, .btn-next {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    &:hover:not(:disabled) {
      background: var(--bg-level-2);
      color: var(--primary-color);
    }
    &:disabled {
      color: var(--text-color-disabled);
      cursor: not-allowed;
    }
  }
}
```

### 按钮组件定制

```scss
.el-button {
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  // 波纹效果
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  &:active::after {
    width: 200px;
    height: 200px;
  }

  &--primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
    &:hover, &:focus {
      background: var(--primary-color-hover);
      border-color: var(--primary-color-hover);
    }
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    &::after { display: none; }
  }
}
```

### 对话框组件定制

```scss
.el-dialog {
  border-radius: 12px;
  background: var(--bg-level-1);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);

  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
    .el-dialog__headerbtn {
      top: 20px;
      right: 24px;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      &:hover { background: var(--bg-level-2); }
    }
  }

  .el-dialog__body {
    padding: 24px;
    line-height: 1.6;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.el-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

### 消息提示定制

```scss
.el-message {
  min-width: 300px;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--bg-level-1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  .el-message__icon {
    font-size: 20px;
    margin-right: 12px;
  }

  &--success {
    border-left: 4px solid var(--success-color);
    .el-message__icon { color: var(--success-color); }
  }
  &--warning {
    border-left: 4px solid var(--warning-color);
    .el-message__icon { color: var(--warning-color); }
  }
  &--error {
    border-left: 4px solid var(--danger-color);
    .el-message__icon { color: var(--danger-color); }
  }
  &--info {
    border-left: 4px solid var(--info-color);
    .el-message__icon { color: var(--info-color); }
  }
}
```

### 选择器定制

```scss
.el-select {
  .el-select__wrapper {
    background: var(--bg-level-1);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover { border-color: var(--primary-color-light); }
    &.is-focused {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
    }
  }

  .el-select__caret {
    color: var(--text-color-secondary);
    transition: transform 0.3s ease;
    &.is-reverse { transform: rotate(180deg); }
  }
}

.el-select-dropdown {
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  .el-select-dropdown__item {
    padding: 10px 16px;
    transition: all 0.3s ease;
    &:hover { background: var(--bg-level-2); }
    &.is-selected {
      color: var(--primary-color);
      font-weight: 600;
      background: var(--primary-color-light);
    }
  }
}
```

### 表格组件定制

```scss
.el-table {
  background: transparent;

  .el-table__header-wrapper th {
    background: var(--bg-level-2);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
    padding: 12px 0;
    &:first-child { border-top-left-radius: 8px; }
    &:last-child { border-top-right-radius: 8px; }
  }

  .el-table__body-wrapper tr {
    background: var(--bg-level-1);
    transition: background 0.3s ease;
    &:hover { background: var(--bg-level-2); }
    td {
      border-bottom: 1px solid var(--border-color);
      padding: 12px 0;
    }
  }

  .el-table__empty-block {
    background: var(--bg-level-1);
    .el-table__empty-text { color: var(--text-color-secondary); }
  }

  // 固定列阴影
  .el-table__fixed::after {
    right: 0;
    box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, 0.15);
  }
  .el-table__fixed-right::after {
    left: 0;
    box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.15);
  }
}
```

### 滚动条美化

```scss
// 全局滚动条
* {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(144, 147, 153, 0.3);
    border-radius: 4px;
    &:hover { background: rgba(144, 147, 153, 0.5); }
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

// 暗色模式滚动条
.dark * {
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    &:hover { background: rgba(255, 255, 255, 0.3); }
  }
}
```

### 移动端响应式

```scss
@media (max-width: 768px) {
  .el-dialog {
    width: 90% !important;
    margin: 0 auto;
    .el-dialog__header, .el-dialog__body, .el-dialog__footer {
      padding: 16px;
    }
  }

  .el-table {
    font-size: 12px;
    .el-table__header-wrapper th,
    .el-table__body-wrapper td {
      padding: 8px 0;
    }
  }

  .el-pagination {
    flex-wrap: wrap;
    justify-content: center;
    .el-pager .number {
      min-width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }

  .el-form .el-form-item {
    margin-bottom: 16px;
    .el-form-item__label {
      display: block;
      text-align: left;
      margin-bottom: 8px;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
```

## 主题动画层

### View Transition 主题切换动画

使用 View Transition API 实现从点击位置扩散的圆形切换效果:

```scss
$theme-animation-duration: 0.5s;

html {
  &::view-transition-old(root),
  &::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  // 亮色 → 暗黑: 新层从圆心扩散
  &::view-transition-new(root) {
    animation: theme-clip-in $theme-animation-duration ease-in both;
    z-index: 9999;
  }
  &::view-transition-old(root) { z-index: 1; }

  // 暗黑 → 亮色: 旧层向圆心收缩
  &.dark {
    &::view-transition-old(root) {
      animation: theme-clip-out $theme-animation-duration ease-in both;
      z-index: 9999;
    }
    &::view-transition-new(root) {
      animation: none;
      z-index: 1;
    }
  }
}

// 圆形扩散动画
@keyframes theme-clip-in {
  from { clip-path: circle(0% at var(--theme-x) var(--theme-y)); }
  to { clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y)); }
}

// 圆形收缩动画
@keyframes theme-clip-out {
  from { clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y)); }
  to { clip-path: circle(0% at var(--theme-x) var(--theme-y)); }
}
```

### TypeScript 集成

```typescript
const handleThemeToggle = (event: MouseEvent) => {
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 设置 CSS 变量
  document.documentElement.style.setProperty('--theme-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-y', `${y}px`)
  document.documentElement.style.setProperty('--theme-r', `${endRadius}px`)

  // 执行主题切换
  if (document.startViewTransition) {
    document.startViewTransition(() => toggleDarkMode())
  } else {
    toggleDarkMode()
  }
}
```

**动画效果:**
- 亮色 → 暗色: 暗色主题从点击位置以圆形向外扩散
- 暗色 → 亮色: 暗色主题从外向点击位置收缩消失
- 不支持 API 的浏览器: 无动画直接切换

## 样式组织最佳实践

### 导入顺序

在 `main.scss` 中按特异性从低到高导入:

```scss
// 1. 外部库(最低特异性)
@import 'element-plus/dist/index.css';

// 2. 抽象层(不产生输出)
@import './abstracts/variables';
@import './abstracts/mixins';

// 3. 主题层
@import './themes/light';
@import './themes/dark';

// 4. 基础层
@import './base/reset';
@import './base/typography';

// 5. 布局层
@import './layout/layout';

// 6. 组件层
@import './components/buttons';
@import './components/animations';

// 7. 供应商层(最高特异性)
@import './vendors/element-plus';

// 8. 动画层
@import './theme-animation';
```

### BEM 命名法

```scss
// Block: 块级元素
.card { }

// Element: 元素(双下划线)
.card__header { }
.card__body { }
.card__footer { }

// Modifier: 修饰符(双连字符)
.card--primary { }
.card--large { }
.card__header--sticky { }
```

### 状态类命名

使用 `is-` 前缀表示组件状态:

```scss
.button {
  &.is-disabled { }
  &.is-loading { }
  &.is-active { }
}

.sidebar {
  &.is-collapse { }
  &.is-open { }
}
```

### 变量使用策略

**CSS 变量(主题相关):**
```scss
.component {
  color: var(--text-color-primary);
  background: var(--bg-level-1);
}
```

**SCSS 变量(编译时常量):**
```scss
$border-radius-base: 4px;
$box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.08);

.card {
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
}
```

### 嵌套深度限制

避免过深嵌套(不超过 3 层):

```scss
// ❌ 不推荐 - 过深嵌套
.sidebar {
  .menu {
    .menu-item {
      .menu-link {
        .icon { }
      }
    }
  }
}

// ✅ 推荐 - BEM 扁平化
.sidebar { }
.sidebar__menu { }
.sidebar__menu-item { }
.sidebar__menu-link { }
.sidebar__menu-icon { }
```

### 移动优先策略

```scss
// ✅ 推荐 - 移动优先
.container {
  width: 100%;              // 基础样式(移动端)
  padding: 16px;

  @include respond-to('md') {
    width: 750px;           // 平板
    padding: 24px;
  }
  @include respond-to('lg') {
    width: 970px;           // 桌面
    padding: 32px;
  }
}
```

### 性能优化

```scss
// ✅ 使用 transform(GPU 加速)
.animated-box {
  transform: translateX(100px);
  transition: transform 0.3s;
}

// ❌ 避免 left/top(触发回流)
.animated-box {
  left: 100px;
  transition: left 0.3s;
}

// 使用占位符选择器复用样式
%button-base {
  display: inline-flex;
  padding: 8px 16px;
  border-radius: 4px;
}

.primary-button { @extend %button-base; background: var(--primary-color); }
.secondary-button { @extend %button-base; background: var(--secondary-color); }
```

## 维护指南

### 添加新组件样式

1. 确定组件层级(layout/components/vendors)
2. 创建样式文件: `touch src/assets/styles/components/_cards.scss`
3. 编写组件样式:

```scss
// components/_cards.scss
.card {
  @include card-style;

  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }
  &__body { padding: 20px; }
  &__footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-color);
  }

  &--bordered { border: 1px solid var(--border-color); }
  &--shadow { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
}
```

4. 在 main.scss 中导入: `@import './components/cards';`

### 添加新的混合宏

```scss
// abstracts/_mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

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
```

### 定制 Element Plus 组件

```scss
// vendors/_element-plus.scss
.el-custom-component {
  background: var(--bg-level-1);

  &.is-custom-state {
    border-color: var(--primary-color);
  }

  @include respond-to('md') {
    padding: 20px;
  }
}

// 使用深度选择器穿透组件样式隔离
.my-component {
  :deep(.el-input__inner) {
    border-radius: 8px;
  }
}
```

### 主题扩展

```scss
// themes/_light.scss
:root {
  --custom-color-1: #ff6b6b;
  --text-color-link: #1890ff;
}

// themes/_dark.scss
.dark {
  --custom-color-1: #ff8787;
  --text-color-link: #40a9ff;
}

// 在组件中使用
.custom-component {
  color: var(--custom-color-1);
  a { color: var(--text-color-link); }
}
```

### 样式调试技巧

```scss
// 调试边框
.debug * { outline: 1px solid red; }

// 响应式断点显示
body::before {
  content: 'xs';
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  z-index: 99999;
  border-radius: 4px;

  @include respond-to('sm') { content: 'sm'; }
  @include respond-to('md') { content: 'md'; }
  @include respond-to('lg') { content: 'lg'; }
  @include respond-to('xl') { content: 'xl'; }
}
```

## 总结

RuoYi-Plus-UniApp 的样式架构是一个完整、系统的解决方案:

**架构优势:**
- **清晰的分层结构** - 八层架构从低到高组织样式,避免样式冲突
- **强大的主题系统** - 基于 CSS 变量实现动态主题切换
- **丰富的混合宏库** - 提供常用样式模式的可复用解决方案
- **深度组件定制** - 全面定制 Element Plus 组件库
- **完善的响应式** - 移动优先策略,支持多种设备

**技术亮点:**
- SCSS 预处理器(变量、混合宏、嵌套、继承)
- CSS 变量集成(运行时动态修改)
- BEM 命名规范(语义化、可维护)
- View Transition API(现代浏览器原生主题切换动画)

**开发建议:**
1. 遵循八层架构规范组织样式
2. 善用混合宏复用通用样式模式
3. 颜色、字号等使用 CSS 变量支持动态主题
4. 采用移动优先开发策略
5. 避免昂贵的选择器,合理使用 GPU 加速
6. 使用 BEM 保持样式扁平化
