# SCSS 架构

本项目采用模块化的 SCSS 架构，基于 7-1 架构模式的简化版本，提供清晰的代码组织和高效的开发体验。

## 🏗️ 架构模式

### 7-1 架构简化版

```
src/styles/
├── abstracts/     # 抽象层：变量、函数、混合器
├── base/         # 基础层：重置、排版
├── themes/       # 主题层：亮色、暗色主题
├── layout/       # 布局层：页面布局
├── components/   # 组件层：可复用组件
├── vendors/      # 第三方库：框架覆盖
└── main.scss     # 主入口文件
```

## 📂 详细目录结构

### 抽象层 (abstracts/)
存放不会输出 CSS 的抽象内容：

```
abstracts/
├── _variables.scss      # 全局变量定义
├── _mixins.scss        # 混合器工具集
└── exports.module.scss # JavaScript导出变量
```

**_variables.scss** - 全局变量
```scss
// 基础颜色变量
$blue: #324157;
$green: #30b08f;
$red: #c03639;

// Element UI 主题色
$el-color-primary: #409eff;
$el-color-success: #67c23a;

// 响应式断点
$sm: 768px;
$md: 992px;
$lg: 1200px;
$xl: 1920px;

// CSS 变量系统
:root {
  --duration-normal: 0.3s;
  --radius-md: 8px;
  --main-color: var(--el-color-primary);
}
```

**_mixins.scss** - 混合器工具
```scss
// 清除浮动
@mixin clearfix {
  &:after {
    content: '';
    display: table;
    clear: both;
  }
}

// 响应式断点
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: #{$sm}) { @content; }
  }
}

// 自定义滚动条
@mixin scrollbar {
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { 
    background: #99a9bf;
    border-radius: var(--radius-round);
  }
}
```

### 基础层 (base/)
基础样式和重置：

```
base/
├── _reset.scss      # 浏览器重置样式
└── _typography.scss # 排版系统
```

**_reset.scss** - 样式重置
```scss
html, body { height: 100%; margin: 0; }
#app { height: 100%; }

*, *:before, *:after {
  box-sizing: inherit;
}

a, a:focus, a:hover {
  cursor: pointer;
  color: inherit;
  text-decoration: none;
}
```

**_typography.scss** - 排版系统
```scss
body {
  font-family: Helvetica Neue, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--app-text);
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  font-weight: 500;
  color: inherit;
}
```

### 主题层 (themes/)
主题相关的样式：

```
themes/
├── _light.scss  # 亮色主题
└── _dark.scss   # 暗色主题
```

**主题变量系统**：
```scss
// 亮色主题
:root {
  --bg-base: #fafbfc;
  --bg-level-1: #ffffff;
  --app-text: #303133;
  --menu-bg: #161618;
}

// 暗色主题
html.dark {
  --bg-base: #111113;
  --bg-level-1: #161618;
  --app-text: #f1f5f9;
  --menu-bg: var(--bg-level-1);
}
```

### 布局层 (layout/)
页面布局相关：

```
layout/
└── _layout.scss  # 主布局样式
```

**布局结构**：
```scss
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.sidebar-container {
  position: fixed;
  width: $base-sidebar-width;
  height: 100%;
  background-color: var(--menu-bg);
}

.main-container {
  height: 100%;
  margin-left: $base-sidebar-width;
  transition: margin-left var(--duration-normal);
}
```

### 组件层 (components/)
可复用组件样式：

```
components/
├── _buttons.scss    # 按钮组件
└── _animations.scss # 动画效果
```

**按钮组件**：
```scss
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) ease;
}

.pan-btn {
  @include button-base;
  font-size: 14px;
  color: #fff;
  padding: 14px 36px;
}
```

### 第三方库层 (vendors/)
第三方组件库的样式覆盖：

```
vendors/
└── _element-plus.scss  # Element Plus 覆盖
```

## 🔧 模块导入系统

### 使用 @use 规则
现代 SCSS 推荐使用 `@use` 替代 `@import`：

```scss
// main.scss - 主入口文件
@use './abstracts/variables' as *;
@use './abstracts/mixins' as *;

@use './base/reset';
@use './base/typography';

@use './themes/light';
@use './themes/dark';

@use './layout/layout';
@use './components/buttons';
@use './vendors/element-plus';
```

### 命名空间管理
```scss
// 带命名空间导入
@use './abstracts/variables' as vars;
@use './abstracts/mixins' as mix;

.component {
  color: vars.$primary-color;
  @include mix.clearfix;
}

// 全局导入（谨慎使用）
@use './abstracts/variables' as *;
@use './abstracts/mixins' as *;
```

## 📋 编码规范

### 1. 文件命名
- 所有 SCSS 文件以 `_` 开头
- 使用小写字母和连字符
- 语义化命名：`_variables.scss`, `_mixins.scss`

### 2. 变量命名
```scss
// 全局变量
$primary-color: #409eff;
$base-sidebar-width: 240px;

// 组件变量
$button-primary-bg: $primary-color;
$button-border-radius: 4px;

// CSS 变量
:root {
  --button-bg: #{$button-primary-bg};
  --button-radius: #{$button-border-radius};
}
```

### 3. 选择器组织
```scss
.component {
  // 1. 自身属性
  display: block;
  position: relative;
  
  // 2. 伪元素
  &:before,
  &:after {
    content: '';
  }
  
  // 3. 伪类
  &:hover {
    opacity: 0.8;
  }
  
  // 4. 修饰符
  &--large {
    font-size: 18px;
  }
  
  // 5. 子元素
  &__title {
    font-weight: bold;
  }
  
  // 6. 嵌套选择器
  .nested-component {
    margin-top: 10px;
  }
}
```

### 4. 混合器使用
```scss
// 定义混合器
@mixin card-style {
  background: var(--bg-level-1);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

// 使用混合器
.panel {
  @include card-style;
  padding: 20px;
}
```

## ⚡ 性能优化

### 1. 避免深层嵌套
```scss
// ❌ 避免超过3层嵌套
.nav {
  .menu {
    .item {
      .link {
        color: blue;
      }
    }
  }
}

// ✅ 使用 BEM 或扁平化结构
.nav-menu-link {
  color: blue;
}
```

### 2. 合理使用 @extend
```scss
// 基础样式
%button-base {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

// 扩展使用
.btn-primary {
  @extend %button-base;
  background: $primary-color;
}
```

### 3. 优化选择器
```scss
// ❌ 低效选择器
.sidebar .menu li a { }

// ✅ 高效选择器
.menu-link { }
```

## 🛠️ 调试技巧

### 1. 开发模式调试
```scss
@mixin debug-outline($color: red) {
  @if $environment == 'development' {
    outline: 2px solid $color;
  }
}

.debug-layout {
  @include debug-outline;
}
```

### 2. 样式检查
```scss
// 检查变量是否定义
@if variable-exists('primary-color') {
  .component { color: $primary-color; }
} @else {
  @warn 'Primary color not defined';
}
```

### 3. 条件编译
```scss
// 根据环境编译不同样式
@if $theme == 'dark' {
  $background: #333;
} @else {
  $background: #fff;
}
```

这种 SCSS 架构确保了代码的可维护性、可扩展性和团队协作的一致性，为项目的样式开发提供了坚实的基础。
