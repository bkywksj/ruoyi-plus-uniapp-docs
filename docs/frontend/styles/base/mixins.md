# Mixins 工具

Mixins 是 SCSS 的核心功能之一，提供了可复用的样式片段，帮助开发者编写 DRY（Don't Repeat Yourself）的代码，提高开发效率和代码维护性。

## 🧰 工具概览

本项目提供了丰富的 Mixins 工具集，涵盖：
- 布局工具
- 响应式设计
- 视觉效果
- 组件基础样式
- 浏览器兼容性

## 🧹 清除浮动工具

### clearfix Mixin
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

**使用方法**：
```scss
.container {
  @include clearfix;
  
  .float-left {
    float: left;
  }
  
  .float-right {
    float: right;
  }
}
```

**应用场景**：
- 包含浮动子元素的容器
- 传统布局中的多列布局
- 需要清除浮动影响的元素

## 📱 响应式断点工具

### respond-to Mixin
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

**使用方法**：
```scss
.sidebar {
  width: 240px;
  
  @include respond-to('md') {
    width: 200px;
  }
  
  @include respond-to('sm') {
    width: 100%;
  }
}
```

**断点说明**：
- `sm`: ≤768px (移动设备)
- `md`: ≤992px (平板设备)
- `lg`: ≤1200px (小桌面)
- `xl`: ≤1920px (大桌面)

### 扩展响应式工具
```scss
// 最小宽度断点
@mixin respond-from($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: #{$sm + 1px}) {
      @content;
    }
  }
  // ... 其他断点
}

// 范围断点
@mixin respond-between($min, $max) {
  @media (min-width: #{$min}) and (max-width: #{$max}) {
    @content;
  }
}
```

## 🎨 滚动条美化工具

### scrollbar Mixin
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

**使用方法**：
```scss
.scrollable-element {
  @include scrollbar;
  overflow-y: auto;
  height: 300px;
}
```

**自定义滚动条参数**：
```scss
@mixin scrollbar-custom($width: 6px, $track-color: #f1f1f1, $thumb-color: #c1c1c1) {
  &::-webkit-scrollbar {
    width: $width;
  }
  
  &::-webkit-scrollbar-track {
    background: $track-color;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $thumb-color;
    border-radius: calc($width / 2);
  }
}
```

## 📐 布局工具

### 百分比宽度居中 Mixin
```scss
/**
 * 百分比宽度居中混合器
 * 设置元素宽度为指定百分比并水平居中
 * @param {Number} $pct - 宽度百分比值(不带%)
 */
@mixin pct($pct) {
  width: $pct * 1%;
  position: relative;
  margin: 0 auto;
}
```

**使用方法**：
```scss
.centered-element {
  @include pct(80);  // 宽度80%并居中
}

.narrow-content {
  @include pct(60);  // 宽度60%并居中
}
```

### 绝对定位居中
```scss
/**
 * 绝对定位居中混合器
 */
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/**
 * 弹性布局居中
 */
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## 🔺 CSS三角形生成器

### triangle Mixin
```scss
/**
 * CSS三角形生成混合器
 * @param {Number} $width - 三角形基础宽度
 * @param {Number} $height - 三角形高度
 * @param {Color} $color - 三角形颜色
 * @param {String} $direction - 三角形方向(up|right|down|left)
 */
@mixin triangle($width, $height, $color, $direction) {
  $width: $width/2; // 计算边框宽度
  $color-border-style: $height solid $color;
  $transparent-border-style: $width solid transparent;
  height: 0;
  width: 0;

  @if $direction == up {
    border-bottom: $color-border-style;
    border-left: $transparent-border-style;
    border-right: $transparent-border-style;
  } @else if $direction == right {
    border-left: $color-border-style;
    border-top: $transparent-border-style;
    border-bottom: $transparent-border-style;
  } @else if $direction == down {
    border-top: $color-border-style;
    border-left: $transparent-border-style;
    border-right: $transparent-border-style;
  } @else if $direction == left {
    border-right: $color-border-style;
    border-top: $transparent-border-style;
    border-bottom: $transparent-border-style;
  }
}
```

**使用示例**：
```scss
.up-triangle {
  @include triangle(10px, 5px, #f00, up);
}

.dropdown-arrow {
  @include triangle(8px, 4px, #333, down);
}

.tooltip-arrow {
  @include triangle(12px, 6px, rgba(0, 0, 0, 0.8), left);
}
```

## 🎴 卡片样式工具

### card-style Mixin
```scss
/**
 * 卡片样式混合器
 * 提供统一的卡片视觉效果
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

**使用方法**：
```scss
.panel {
  @include card-style;
  padding: 20px;
}

.product-card {
  @include card-style;
  padding: 16px;
  cursor: pointer;
}
```

**扩展卡片样式**：
```scss
@mixin card-elevated {
  @include card-style;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}
```

## 🔘 按钮基础样式

### button-base Mixin
```scss
/**
 * 按钮基础样式混合器
 * 提供所有按钮的共同样式基础
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

**按钮变体扩展**：
```scss
@mixin button-variant($bg-color, $text-color, $hover-bg: null) {
  @include button-base;
  background-color: $bg-color;
  color: $text-color;
  
  @if $hover-bg {
    &:hover:not(:disabled) {
      background-color: $hover-bg;
    }
  } @else {
    &:hover:not(:disabled) {
      background-color: darken($bg-color, 5%);
    }
  }
}

// 使用示例
.btn-primary {
  @include button-variant(var(--el-color-primary), white);
}

.btn-danger {
  @include button-variant(var(--el-color-danger), white);
}
```

## 🔧 工具类生成器

### 自动生成工具类
```scss
/**
 * 间距工具类生成器
 */
@mixin generate-spacing-utilities($prefix: 'm', $property: 'margin') {
  @for $i from 0 through 10 {
    .#{$prefix}-#{$i} {
      #{$property}: #{$i * 4px};
    }
  }
}

// 生成 margin 工具类
@include generate-spacing-utilities('m', 'margin');
@include generate-spacing-utilities('p', 'padding');

/**
 * 颜色工具类生成器
 */
@mixin generate-color-utilities($colors) {
  @each $name, $color in $colors {
    .text-#{$name} {
      color: $color;
    }
    
    .bg-#{$name} {
      background-color: $color;
    }
    
    .border-#{$name} {
      border-color: $color;
    }
  }
}

// 使用示例
$theme-colors: (
  primary: var(--el-color-primary),
  success: var(--el-color-success),
  danger: var(--el-color-danger)
);

@include generate-color-utilities($theme-colors);
```

## 🎭 视觉效果工具

### 文本省略
```scss
/**
 * 单行文本省略
 */
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/**
 * 多行文本省略
 * @param {Number} $lines - 显示行数
 */
@mixin text-ellipsis-multiline($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 阴影效果
```scss
/**
 * 阴影效果预设
 */
@mixin shadow($level: 1) {
  @if $level == 1 {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  } @else if $level == 2 {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  } @else if $level == 3 {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  } @else if $level == 4 {
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
  }
}
```

### 渐变背景
```scss
/**
 * 线性渐变工具
 */
@mixin linear-gradient($direction, $start-color, $end-color) {
  background: linear-gradient($direction, $start-color, $end-color);
}

/**
 * 径向渐变工具
 */
@mixin radial-gradient($position, $start-color, $end-color) {
  background: radial-gradient(circle at $position, $start-color, $end-color);
}
```

## 🖥️ 浏览器兼容性工具

### CSS 属性前缀
```scss
/**
 * 自动添加浏览器前缀
 */
@mixin transform($transforms) {
  -webkit-transform: $transforms;
  -moz-transform: $transforms;
  -ms-transform: $transforms;
  transform: $transforms;
}

@mixin transition($transitions...) {
  -webkit-transition: $transitions;
  -moz-transition: $transitions;
  transition: $transitions;
}

@mixin border-radius($radius) {
  -webkit-border-radius: $radius;
  -moz-border-radius: $radius;
  border-radius: $radius;
}
```

### 现代CSS特性检测
```scss
/**
 * Grid 布局支持检测
 */
@mixin supports-grid {
  @supports (display: grid) {
    @content;
  }
}

/**
 * Flexbox 支持检测
 */
@mixin supports-flex {
  @supports (display: flex) {
    @content;
  }
}

// 使用示例
.layout {
  // 基础布局（兼容性）
  display: table;
  
  @include supports-flex {
    // Flexbox 增强
    display: flex;
  }
  
  @include supports-grid {
    // Grid 最优体验
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

## 🔍 调试工具

### 开发辅助 Mixins
```scss
/**
 * 边框调试工具
 */
@mixin debug-outline($color: red) {
  @if $environment == 'development' {
    outline: 2px solid $color;
  }
}

/**
 * 网格调试工具
 */
@mixin debug-grid($size: 20px, $color: rgba(255, 0, 0, 0.1)) {
  @if $debug-mode {
    background-image: 
      linear-gradient($color 1px, transparent 1px),
      linear-gradient(90deg, $color 1px, transparent 1px);
    background-size: $size $size;
  }
}
```

## 📋 最佳实践

### 1. Mixin 设计原则
- **单一职责**：每个 Mixin 只负责一个功能
- **参数化**：提供合理的参数和默认值
- **文档化**：添加清晰的注释说明

### 2. 性能考虑
```scss
// ✅ 高效的 Mixin
@mixin button-size($size: medium) {
  @if $size == small {
    padding: 4px 8px;
    font-size: 12px;
  } @else if $size == large {
    padding: 12px 24px;
    font-size: 16px;
  } @else {
    padding: 8px 16px;
    font-size: 14px;
  }
}

// ❌ 避免过度复杂的 Mixin
@mixin complex-layout($type, $columns, $gap, $responsive: true, $breakpoints: null) {
  // 过于复杂，难以维护
}
```

### 3. 命名规范
```scss
// ✅ 清晰的命名
@mixin card-elevated { }
@mixin text-ellipsis { }
@mixin respond-to($breakpoint) { }

// ❌ 模糊的命名
@mixin util { }
@mixin helper { }
@mixin misc($param) { }
```

通过这些 Mixins 工具，开发者可以快速构建一致、可维护的样式代码，大大提高开发效率和代码质量。
