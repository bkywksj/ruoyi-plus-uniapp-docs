# 组件样式

## 概述

RuoYi-Plus-UniApp 移动端项目的 WD UI 组件库采用完整的 SCSS 样式体系，基于 BEM 命名规范和 CSS 变量实现。通过组件样式系统，可以确保组件的一致性、可维护性和主题定制能力。

**组件样式体系特点:**

- **BEM 命名规范** - 采用 Block-Element-Modifier 命名模式，结构清晰
- **SCSS 混合宏** - 提供完整的 BEM 混合宏，简化样式编写
- **CSS 变量驱动** - 所有样式通过 CSS 变量控制，支持运行时主题切换
- **暗黑模式支持** - 内置完整的暗黑模式适配方案
- **样式隔离** - 组件样式隔离，避免样式冲突
- **跨平台兼容** - 支持 H5、小程序、App 等多端适配

## 样式架构

### 样式文件结构

WD UI 组件库的样式文件组织结构：

```text
src/wd/components/
├── common/
│   └── abstracts/
│       ├── _config.scss         # SCSS 配置项（命名空间、BEM分隔符）
│       ├── _function.scss       # SCSS 辅助函数（主题色计算等）
│       ├── _mixin.scss          # BEM 混合宏和通用混合宏
│       └── variable.scss        # CSS 变量定义
├── wd-button/
│   └── wd-button.vue           # 组件文件（包含样式）
├── wd-icon/
│   └── wd-icon.vue
└── [其他组件]/
```

### 核心配置文件

#### _config.scss 命名空间配置

定义 BEM 命名规范的核心配置：

```scss
/**
 * SCSS 配置项：命名空间以及BEM
 */
$namespace: 'wd';              // 组件命名空间前缀
$elementSeparator: '__';       // 元素分隔符
$modifierSeparator: '--';      // 修饰符分隔符
$state-prefix: 'is-';          // 状态类前缀
```

**命名规则说明:**

| 配置项 | 值 | 说明 | 示例 |
|--------|-----|------|------|
| `$namespace` | `wd` | 组件前缀 | `.wd-button` |
| `$elementSeparator` | `__` | 元素分隔符 | `.wd-button__text` |
| `$modifierSeparator` | `--` | 修饰符分隔符 | `.wd-button--primary` |
| `$state-prefix` | `is-` | 状态类前缀 | `.is-disabled` |

#### _function.scss 辅助函数

提供主题色计算和样式处理的辅助函数：

```scss
/**
 * 辅助函数
 */
@import 'config';

$default-theme: #4d80f0 !default; // 默认主题色

/**
 * 转换成字符串
 * @param $selector 选择器
 * @returns 字符串格式的选择器
 */
@function selectorToString($selector) {
  $selector: inspect($selector);
  $selector: str-slice($selector, 2, -2);
  @return $selector;
}

/**
 * 判断是否存在 Modifier
 * @param $selector 选择器
 * @returns 是否包含修饰符
 */
@function containsModifier($selector) {
  $selector: selectorToString($selector);
  @if str-index($selector, $modifierSeparator) {
    @return true;
  } @else {
    @return false;
  }
}

/**
 * 判断是否存在伪类
 * @param $selector 选择器
 * @returns 是否包含伪类
 */
@function containsPseudo($selector) {
  $selector: selectorToString($selector);
  @if str-index($selector, ':') {
    @return true;
  } @else {
    @return false;
  }
}

/**
 * 主题色切换
 * @param $theme-color 主题色
 * @param $type 变暗'dark' 或 变亮 'light'
 * @param $mix-color 自定义混合色
 * @returns 处理后的颜色
 */
@function themeColor($theme-color, $type: "", $mix-color: "") {
  @if $default-theme != #4d80f0 {
    @if $type == "dark" {
      @return darken($theme-color, 10%);
    } @else if $type == "light" {
      @return lighten($theme-color, 10%);
    } @else {
      @return $theme-color;
    }
  } @else {
    @return $mix-color;
  }
}

/**
 * 颜色结果切换
 * 如果开启线性渐变色使用渐变色，否则使用主题色
 * @param $deg 渐变角度
 * @param $theme-color 主题色
 * @param $set 明暗设置数组
 * @param $color-list 渐变色列表
 * @param $per-list 渐变比例列表
 * @returns 线性渐变或纯色
 */
@function resultColor($deg, $theme-color, $set, $color-list, $per-list) {
  $len: length($color-list);
  $arg: $deg;

  @for $i from 1 through $len {
    $arg: $arg + "," + themeColor($theme-color, nth($set, $i), nth($color-list, $i)) + " " + nth($per-list, $i);
  }

  @return linear-gradient(unquote($arg));
}
```

## BEM 混合宏系统

### 核心 BEM 混合宏

WD UI 组件库使用 BEM（Block-Element-Modifier）命名规范，通过 SCSS 混合宏简化样式编写。

#### b 混合宏 - 定义块

```scss
/**
 * BEM，定义块（Block）
 * @param $block 块名称
 */
@mixin b($block) {
  $B: $namespace + "-" + $block !global;

  .#{$B} {
    @content;
  }
}
```

**使用示例:**

```scss
// 输入
@include b(button) {
  display: inline-block;
  padding: 0 32rpx;
}

// 输出
.wd-button {
  display: inline-block;
  padding: 0 32rpx;
}
```

#### e 混合宏 - 定义元素

```scss
/**
 * 定义元素（Element）
 * 对于伪类，会自动将元素嵌套在伪类底下
 * @param $element 元素名称（支持多个）
 */
@mixin e($element...) {
  $selector: &;
  $selectors: "";

  @if containsPseudo($selector) {
    @each $item in $element {
      $selectors: #{$selectors + "." + $B + $elementSeparator + $item + ","};
    }

    @at-root {
      #{$selector} {
        #{$selectors} {
          @content;
        }
      }
    }
  } @else {
    @each $item in $element {
      $selectors: #{$selectors + $selector + $elementSeparator + $item + ","};
    }

    @at-root {
      #{$selectors} {
        @content;
      }
    }
  }
}
```

**使用示例:**

```scss
// 输入
@include b(button) {
  @include e(text) {
    font-size: 28rpx;
  }

  @include e(icon) {
    margin-right: 12rpx;
  }
}

// 输出
.wd-button__text {
  font-size: 28rpx;
}
.wd-button__icon {
  margin-right: 12rpx;
}
```

#### m 混合宏 - 定义修饰符

```scss
/**
 * 定义修饰符（Modifier）
 * @param $modifier 修饰符名称（支持多个）
 */
@mixin m($modifier...) {
  $selectors: "";

  @each $item in $modifier {
    $selectors: #{$selectors + & + $modifierSeparator + $item + ","};
  }

  @at-root {
    #{$selectors} {
      @content;
    }
  }
}
```

**使用示例:**

```scss
// 输入
@include b(button) {
  @include m(primary) {
    background-color: #4d80f0;
  }

  @include m(success) {
    background-color: #34d19d;
  }
}

// 输出
.wd-button--primary {
  background-color: #4d80f0;
}
.wd-button--success {
  background-color: #34d19d;
}
```

#### when 混合宏 - 定义状态

```scss
/**
 * 状态混合宏，生成 is-$state 类名
 * @param $states 状态名称（支持多个）
 */
@mixin when($states...) {
  @at-root {
    @each $state in $states {
      &.#{$state-prefix + $state} {
        @content;
      }
    }
  }
}
```

**使用示例:**

```scss
// 输入
@include b(button) {
  @include when(disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @include when(loading) {
    pointer-events: none;
  }
}

// 输出
.wd-button.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.wd-button.is-loading {
  pointer-events: none;
}
```

#### me 混合宏 - 嵌套元素

用于在修饰符内部定义元素样式：

```scss
/**
 * 嵌套在修饰符底下的元素
 * 用于整体切换组件状态时的元素样式
 * @param $element 元素名称（支持多个）
 */
@mixin me($element...) {
  $selector: &;
  $selectors: "";

  @if containsModifier($selector) {
    @each $item in $element {
      $selectors: #{$selectors + "." + $B + $elementSeparator + $item + ","};
    }

    @at-root {
      #{$selector} {
        #{$selectors} {
          @content;
        }
      }
    }
  } @else {
    @each $item in $element {
      $selectors: #{$selectors + $selector + $elementSeparator + $item + ","};
    }

    @at-root {
      #{$selectors} {
        @content;
      }
    }
  }
}
```

**使用示例:**

```scss
// 输入
@include b(button) {
  @include m(primary) {
    @include me(text) {
      color: #ffffff;
    }
  }
}

// 输出
.wd-button--primary .wd-button__text {
  color: #ffffff;
}
```

### 样式穿透混合宏

#### edeep 混合宏 - 深度元素选择

用于生成可穿透子组件的样式：

```scss
/**
 * 深度元素选择，用于穿透子组件样式
 * @param $element 元素名称（支持多个）
 */
@mixin edeep($element...) {
  $selector: &;
  $selectors: "";

  @if containsPseudo($selector) {
    @each $item in $element {
      $selectors: #{$selectors + "." + $B + $elementSeparator + $item + ","};
    }

    @at-root {
      #{$selector} {
        :deep() {
          #{$selectors} {
            @content;
          }
        }
      }
    }
  } @else {
    @each $item in $element {
      $selectors: #{$selectors + $selector + $elementSeparator + $item + ","};
    }

    @at-root {
      :deep() {
        #{$selectors} {
          @content;
        }
      }
    }
  }
}
```

**使用示例:**

```scss
// 输入
@include b(button) {
  @include edeep(icon) {
    display: block;
    margin-right: 12rpx;
  }
}

// 输出
:deep(.wd-button__icon) {
  display: block;
  margin-right: 12rpx;
}
```

#### mdeep 混合宏 - 深度修饰符选择

```scss
/**
 * 深度修饰符选择
 * @param $modifier 修饰符名称（支持多个）
 */
@mixin mdeep($modifier...) {
  $selectors: "";

  @each $item in $modifier {
    $selectors: #{$selectors + & + $modifierSeparator + $item + ","};
  }

  @at-root {
    :deep() {
      #{$selectors} {
        @content;
      }
    }
  }
}
```

## 通用样式混合宏

### 文本溢出处理

#### 单行溢出省略

```scss
/**
 * 单行文本溢出省略
 */
@mixin lineEllipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**使用示例:**

```scss
.title {
  @include lineEllipsis;
  max-width: 300rpx;
}
```

#### 多行溢出省略

```scss
/**
 * 多行文本溢出省略
 * @param $lineNumber 显示行数，默认3行
 */
@mixin multiEllipsis($lineNumber: 3) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $lineNumber;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}
```

**使用示例:**

```scss
.description {
  @include multiEllipsis(2);  // 两行省略
}

.content {
  @include multiEllipsis(5);  // 五行省略
}
```

### 边框处理

#### 0.5px 细边框（单边）

解决移动端 1px 边框过粗的问题：

```scss
/**
 * 0.5px 边框（指定方向）
 * @param $direction 方向，'bottom' 或 'top'
 * @param $left 左侧偏移量
 * @param $color 边框颜色
 */
@mixin halfPixelBorder($direction: "bottom", $left: 0, $color: $-color-border-light) {
  position: relative;

  &::after {
    position: absolute;
    display: block;
    content: "";

    @if ($left == 0) {
      width: 100%;
    } @else {
      width: calc(100% - #{$left});
    }

    height: 1px;
    left: $left;

    @if ($direction == "bottom") {
      bottom: 0;
    } @else {
      top: 0;
    }

    transform: scaleY(0.5);
    background: $color;
  }
}
```

**使用示例:**

```scss
// 底部细边框
.list-item {
  @include halfPixelBorder(bottom, 32rpx, #e8e8e8);
}

// 顶部细边框
.section-title {
  @include halfPixelBorder(top, 0, #dcdee0);
}
```

#### 0.5px 细边框（环绕）

```scss
/**
 * 0.5px 边框（环绕四周）
 * @param $color 边框颜色
 */
@mixin halfPixelBorderSurround($color: $-color-border-light) {
  position: relative;

  &::after {
    position: absolute;
    display: block;
    content: ' ';
    pointer-events: none;
    width: 200%;
    height: 200%;
    left: 0;
    top: 0;
    border: 1px solid $color;
    transform: scale(0.5);
    box-sizing: border-box;
    transform-origin: left top;
  }
}
```

**使用示例:**

```scss
.card {
  @include halfPixelBorderSurround(#e8e8e8);
  border-radius: 16rpx;

  &::after {
    border-radius: 32rpx;  // 需要放大2倍
  }
}
```

### 清除默认样式

#### 按钮样式清除

```scss
/**
 * 清除按钮默认样式
 */
@mixin buttonClear {
  outline: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  background: transparent;
}
```

#### 清除浮动

```scss
/**
 * 清除浮动
 */
@mixin clearFloat {
  &::after {
    display: block;
    content: "";
    height: 0;
    clear: both;
    overflow: hidden;
    visibility: hidden;
  }
}
```

### 箭头图标

#### 三角形箭头

适用于背景透明的情况：

```scss
/**
 * 三角形实现尖角样式
 * @param $size 三角形高度，底边为 $size * 2
 * @param $bg 三角形背景颜色
 */
@mixin triangleArrow($size, $bg) {
  @include e(arrow) {
    position: absolute;
    width: 0;
    height: 0;
  }

  @include e(arrow-down) {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-top: $size solid $bg;
    transform: translateX(-50%);
    bottom: calc(-1 * $size);
  }

  @include e(arrow-up) {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-bottom: $size solid $bg;
    transform: translateX(-50%);
    top: calc(-1 * $size);
  }

  @include e(arrow-left) {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-right: $size solid $bg;
    transform: translateY(-50%);
    left: calc(-1 * $size);
  }

  @include e(arrow-right) {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-left: $size solid $bg;
    transform: translateY(-50%);
    right: calc(-1 * $size);
  }
}
```

#### 正方形箭头

适用于背景不透明、需要阴影的情况：

```scss
/**
 * 正方形实现尖角样式
 * @param $size 正方形边长
 * @param $bg 正方形背景颜色
 * @param $z-index z-index属性值
 * @param $box-shadow 阴影
 */
@mixin squareArrow($size, $bg, $z-index, $box-shadow) {
  @include e(arrow) {
    position: absolute;
    width: $size;
    height: $size;
    z-index: $z-index;
  }

  @include e(arrow-down) {
    transform: translateX(-50%);
    bottom: 0;

    &:after {
      content: "";
      width: $size;
      height: $size;
      background-color: $bg;
      position: absolute;
      left: 0;
      bottom: calc(-1 * $size / 2);
      transform: rotateZ(45deg);
      box-shadow: $box-shadow;
    }
  }

  // ... 其他方向类似
}
```

## 组件样式配置

### Vue 组件样式选项

WD UI 组件采用统一的样式配置选项：

```typescript
defineOptions({
  name: 'WdButton',
  options: {
    // 允许组件使用全局 CSS 类名，不受样式隔离限制
    addGlobalClass: true,
    // 启用虚拟主机节点，组件不会在 DOM 中创建额外的包装元素
    virtualHost: true,
    // 样式隔离模式
    styleIsolation: 'shared',
  },
})
```

**样式选项说明:**

| 选项 | 值 | 说明 |
|------|-----|------|
| `addGlobalClass` | `true` | 允许使用全局样式类 |
| `virtualHost` | `true` | 启用虚拟节点，优化性能 |
| `styleIsolation` | `'shared'` | 样式共享模式 |

**styleIsolation 模式:**

| 模式 | 说明 |
|------|------|
| `'isolated'` | 完全隔离，组件样式不会影响外部 |
| `'apply-shared'` | 应用共享样式，外部样式可以影响组件 |
| `'shared'` | 共享模式，组件和外部样式互相影响 |

### 组件样式导入

组件样式中统一导入混合宏和变量文件：

```scss
<style lang="scss">
// 引入混合宏
@import './../common/abstracts/_mixin.scss';
// 引入变量
@import './../common/abstracts/variable.scss';

// 组件样式
@include b(button) {
  // ...
}
</style>
```

**注意事项:**

- 不使用 `scoped` 属性，通过 BEM 命名实现样式隔离
- 导入路径使用相对路径
- 先导入混合宏再导入变量（因为混合宏依赖配置）

## 按钮组件样式示例

以下是 Button 组件的完整样式实现，展示 WD UI 组件样式的典型结构：

### 基础样式

```scss
@include b(button) {
  // 重置默认样式
  margin-left: initial;
  margin-right: initial;
  position: relative;
  display: inline-block;
  outline: none;
  -webkit-appearance: none;
  background: transparent;
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  color: $-button-normal-color;
  transition: opacity 0.2s;
  user-select: none;
  font-weight: normal;

  // 按钮按下效果
  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: $-color-black;
    border: inherit;
    border-color: $-color-black;
    border-radius: inherit;
    transform: translate(-50%, -50%);
    opacity: 0;
    content: ' ';
  }

  &::after {
    border: none;
    border-radius: 0;
  }
}
```

### 元素样式

```scss
@include b(button) {
  // 内容区域
  @include e(content) {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  // 加载图标
  @include e(loading) {
    margin-right: 10rpx;
    animation: wd-rotate 0.8s linear infinite;
    animation-duration: 2s;
  }

  @include e(loading-svg) {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
  }

  // 文字样式
  @include e(text) {
    user-select: none;
    white-space: nowrap;
  }

  // 图标样式（深度选择）
  @include edeep(icon) {
    display: block;
    margin-right: 12rpx;
    font-size: $-button-icon-fs;
    vertical-align: middle;
  }
}
```

### 修饰符样式

```scss
@include b(button) {
  // 激活状态
  @include m(active) {
    &:active::before {
      opacity: 0.15;
    }
  }
}
```

### 状态样式

```scss
@include b(button) {
  // 禁用状态
  @include when(disabled) {
    opacity: $-button-disabled-opacity;
  }

  // 隐形按钮
  @include when(invisible) {
    width: 100%;
    height: 100%;
    background-color: transparent !important;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9999;
    padding: 0;
    margin: 0;
    border: none;
    opacity: 1 !important;
    box-shadow: none !important;

    &::before,
    &::after {
      display: none !important;
    }

    &:hover,
    &:active,
    &:focus {
      background-color: transparent !important;
      opacity: 1 !important;
    }
  }
}
```

### 类型样式

```scss
@include b(button) {
  // 主要按钮
  @include when(primary) {
    background: $-button-primary-bg-color;
    color: $-button-primary-color;
  }

  // 成功按钮
  @include when(success) {
    background: $-button-success-bg-color;
    color: $-button-success-color;
  }

  // 信息按钮
  @include when(info) {
    background: $-button-info-bg-color;
    color: $-button-info-color;
  }

  // 警告按钮
  @include when(warning) {
    background: $-button-warning-bg-color;
    color: $-button-warning-color;
  }

  // 错误按钮
  @include when(error) {
    background: $-button-error-bg-color;
    color: $-button-error-color;
  }
}
```

### 尺寸样式

```scss
@include b(button) {
  // 小型按钮
  @include when(small) {
    height: $-button-small-height;
    padding: $-button-small-padding;
    border-radius: $-button-small-radius;
    font-size: $-button-small-fs;
    font-weight: normal;

    .wd-button__loading {
      width: $-button-small-loading;
      height: $-button-small-loading;
    }
  }

  // 中型按钮
  @include when(medium) {
    height: $-button-medium-height;
    padding: $-button-medium-padding;
    border-radius: $-button-medium-radius;
    font-size: $-button-medium-fs;
    min-width: 240rpx;

    @include when(round) {
      @include when(icon) {
        min-width: 0;
        border-radius: 50%;
      }

      @include when(text) {
        border-radius: 0;
        min-width: 0;
      }
    }

    .wd-button__loading {
      width: $-button-medium-loading;
      height: $-button-medium-loading;
    }
  }

  // 大型按钮
  @include when(large) {
    height: $-button-large-height;
    padding: $-button-large-padding;
    border-radius: $-button-large-radius;
    font-size: $-button-large-fs;

    &::after {
      border-radius: $-button-large-radius;
    }

    .wd-button__loading {
      width: $-button-large-loading;
      height: $-button-large-loading;
    }
  }
}
```

### 特殊样式

```scss
@include b(button) {
  // 圆角按钮
  @include when(round) {
    border-radius: 999rpx;
  }

  // 块级按钮
  @include when(block) {
    display: block;
  }

  // 文字按钮
  @include when(text) {
    color: $-button-primary-bg-color;
    min-width: 0;
    padding: 8rpx 0;

    &::after {
      display: none;
    }

    &.wd-button--active {
      opacity: $-button-text-hover-opacity;

      &:active::before {
        display: none;
      }
    }

    @include when(disabled) {
      color: $-button-normal-disabled-color;
      background: transparent;
    }
  }

  // 幽灵按钮
  @include when(plain) {
    background: $-button-plain-bg-color;
    border: 1rpx solid currentColor;

    @include when(primary) {
      color: $-button-primary-bg-color;
    }

    @include when(success) {
      color: $-button-success-bg-color;
    }

    @include when(info) {
      color: $-button-info-plain-normal-color;
      border-color: $-button-info-plain-border-color;
    }

    @include when(warning) {
      color: $-button-warning-bg-color;
    }

    @include when(error) {
      color: $-button-error-bg-color;
    }
  }

  // 细边框
  @include when(hairline) {
    border-width: 0;

    &.is-plain {
      @include halfPixelBorderSurround();

      &::before {
        border-radius: inherit;
      }

      &::after {
        border-color: inherit;
      }

      &.is-round {
        &::after {
          border-radius: inherit !important;
        }
      }
    }
  }

  // 图标按钮
  @include when(icon) {
    width: $-button-icon-size;
    height: $-button-icon-size;
    padding: 0;
    border-radius: 50%;
    color: $-button-icon-color;

    &::after {
      display: none;
    }

    :deep(.wd-button__icon) {
      margin-right: 0;
    }

    @include when(disabled) {
      color: $-button-icon-disabled-color;
      background: transparent;
    }
  }
}
```

### 动画定义

```scss
// 旋转动画
@keyframes wd-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
```

## 暗黑模式样式

### 暗黑主题类名

WD UI 使用 `.wot-theme-dark` 类名标识暗黑模式：

```scss
// 暗色主题样式
.wot-theme-dark {
  @include b(button) {
    @include when(info) {
      background: $-dark-background4;
      color: $-dark-color3;
    }

    @include when(plain) {
      background: transparent;

      @include when(info) {
        color: $-dark-color;

        &::after {
          border-color: $-dark-background5;
        }
      }
    }

    @include when(text) {
      @include when(disabled) {
        color: $-dark-color-gray;
        background: transparent;
      }
    }

    @include when(icon) {
      color: $-dark-color;

      @include when(disabled) {
        color: $-dark-color-gray;
        background: transparent;
      }
    }
  }
}
```

### 暗黑模式变量

暗黑模式使用专门的变量集：

```scss
/* 暗黑模式背景色 */
$-dark-background: var(--wot-dark-background, #131313);
$-dark-background2: var(--wot-dark-background2, #1b1b1b);
$-dark-background3: var(--wot-dark-background3, #141414);
$-dark-background4: var(--wot-dark-background4, #323233);
$-dark-background5: var(--wot-dark-background5, #646566);

/* 暗黑模式文字颜色 */
$-dark-color: var(--wot-dark-color, #ffffff);
$-dark-color2: var(--wot-dark-color2, #f2270c);
$-dark-color3: var(--wot-dark-color3, rgba(232, 230, 227, 0.8));
$-dark-color-gray: var(--wot-dark-color-gray, #595959);

/* 暗黑模式边框颜色 */
$-dark-border-color: var(--wot-dark-border-color, #3a3a3c);
```

## 外部样式类

### customClass 属性

WD UI 组件支持通过 `customClass` 属性传入自定义类名：

```vue
<template>
  <wd-button custom-class="my-button" type="primary">
    自定义按钮
  </wd-button>
</template>

```

### customStyle 属性

支持通过 `customStyle` 属性传入内联样式：

```vue
<template>
  <wd-button
    type="primary"
    custom-style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
  >
    渐变按钮
  </wd-button>
</template>
```

## 样式覆盖

### 使用 :deep() 穿透样式

在 Vue 3 中使用 `:deep()` 穿透组件样式：

```vue
<template>
  <view class="container">
    <wd-button type="primary">按钮</wd-button>
  </view>
</template>

```

### 全局样式覆盖

在全局样式文件中覆盖组件默认样式：

```scss
// src/static/style/index.scss

// 覆盖按钮默认圆角
.wd-button {
  &.is-medium {
    border-radius: 8rpx;
  }

  &.is-large {
    border-radius: 16rpx;
  }
}

// 覆盖主题色按钮
.wd-button.is-primary {
  background: #1890ff;
}
```

### CSS 变量覆盖

通过修改 CSS 变量实现全局样式定制：

```scss
:root,
page {
  // 修改按钮主题色
  --wot-button-primary-bg-color: #1890ff;
  --wot-button-success-bg-color: #52c41a;
  --wot-button-warning-bg-color: #faad14;
  --wot-button-error-bg-color: #ff4d4f;

  // 修改按钮尺寸
  --wot-button-medium-height: 88rpx;
  --wot-button-medium-radius: 8rpx;

  // 修改按钮字体
  --wot-button-medium-fs: 32rpx;
}
```

## 组件样式变量参考

### 按钮组件变量

```scss
/* 按钮通用变量 */
$-button-disabled-opacity: var(--wot-button-disabled-opacity, 0.6);
$-button-icon-fs: var(--wot-button-icon-fs, 1.18em);
$-button-normal-color: var(--wot-button-normal-color, $-color-content);

/* 小型按钮 */
$-button-small-height: var(--wot-button-small-height, 48rpx);
$-button-small-padding: var(--wot-button-small-padding, 0 24rpx);
$-button-small-fs: var(--wot-button-small-fs, 24rpx);
$-button-small-radius: var(--wot-button-small-radius, 4rpx);
$-button-small-loading: var(--wot-button-small-loading, 24rpx);

/* 中型按钮 */
$-button-medium-height: var(--wot-button-medium-height, 72rpx);
$-button-medium-padding: var(--wot-button-medium-padding, 0 32rpx);
$-button-medium-fs: var(--wot-button-medium-fs, 28rpx);
$-button-medium-radius: var(--wot-button-medium-radius, 8rpx);
$-button-medium-loading: var(--wot-button-medium-loading, 32rpx);

/* 大型按钮 */
$-button-large-height: var(--wot-button-large-height, 88rpx);
$-button-large-padding: var(--wot-button-large-padding, 0 72rpx);
$-button-large-fs: var(--wot-button-large-fs, 32rpx);
$-button-large-radius: var(--wot-button-large-radius, 16rpx);
$-button-large-loading: var(--wot-button-large-loading, 40rpx);

/* 按钮颜色 */
$-button-primary-color: var(--wot-button-primary-color, #ffffff);
$-button-primary-bg-color: var(--wot-button-primary-bg-color, #4d80f0);
$-button-success-color: var(--wot-button-success-color, #ffffff);
$-button-success-bg-color: var(--wot-button-success-bg-color, #34d19d);
$-button-info-color: var(--wot-button-info-color, #333);
$-button-info-bg-color: var(--wot-button-info-bg-color, #f5f5f5);
$-button-warning-color: var(--wot-button-warning-color, #ffffff);
$-button-warning-bg-color: var(--wot-button-warning-bg-color, #f0883a);
$-button-error-color: var(--wot-button-error-color, #ffffff);
$-button-error-bg-color: var(--wot-button-error-bg-color, #fa4350);

/* 幽灵按钮 */
$-button-plain-bg-color: var(--wot-button-plain-bg-color, transparent);
$-button-info-plain-normal-color: var(--wot-button-info-plain-normal-color, $-color-content);
$-button-info-plain-border-color: var(--wot-button-info-plain-border-color, #c5c5c5);

/* 文字按钮 */
$-button-text-hover-opacity: var(--wot-button-text-hover-opacity, 0.7);
$-button-normal-disabled-color: var(--wot-button-normal-disabled-color, $-color-tip);

/* 图标按钮 */
$-button-icon-size: var(--wot-button-icon-size, 64rpx);
$-button-icon-color: var(--wot-button-icon-color, $-color-content);
$-button-icon-disabled-color: var(--wot-button-icon-disabled-color, $-color-tip);
```

### 输入框组件变量

```scss
/* 输入框变量 */
$-input-padding: var(--wot-input-padding, 30rpx);
$-input-border-color: var(--wot-input-border-color, #dadada);
$-input-fs: var(--wot-input-fs, 28rpx);
$-input-color: var(--wot-input-color, #262626);
$-input-placeholder-color: var(--wot-input-placeholder-color, #bfbfbf);
$-input-disabled-color: var(--wot-input-disabled-color, #d9d9d9);
$-input-error-color: var(--wot-input-error-color, #fa4350);
$-input-bg: var(--wot-input-bg, #ffffff);
```

### 单元格组件变量

```scss
/* 单元格变量 */
$-cell-padding: var(--wot-cell-padding, 30rpx);
$-cell-line-height: var(--wot-cell-line-height, 48rpx);
$-cell-title-fs: var(--wot-cell-title-fs, 28rpx);
$-cell-title-color: var(--wot-cell-title-color, rgba(0, 0, 0, 0.85));
$-cell-value-fs: var(--wot-cell-value-fs, 28rpx);
$-cell-value-color: var(--wot-cell-value-color, rgba(0, 0, 0, 0.85));
$-cell-arrow-size: var(--wot-cell-arrow-size, 36rpx);
$-cell-arrow-color: var(--wot-cell-arrow-color, rgba(0, 0, 0, 0.25));
$-cell-tap-bg: var(--wot-cell-tap-bg, #f9f9f9);
```

## 最佳实践

### 1. 遵循 BEM 命名规范

```scss
// ✅ 正确
@include b(card) {
  @include e(header) { ... }
  @include e(body) { ... }
  @include e(footer) { ... }

  @include m(bordered) { ... }
  @include when(active) { ... }
}

// ❌ 避免
.card {
  .card-header { ... }  // 不使用 BEM 混合宏
  &__body { ... }       // 手动拼接类名
}
```

### 2. 使用 CSS 变量实现主题定制

```scss
// ✅ 正确 - 使用 CSS 变量
.custom-button {
  background-color: var(--wot-color-theme);
  color: var(--wot-button-primary-color);
}

// ❌ 避免 - 硬编码颜色
.custom-button {
  background-color: #4d80f0;
  color: #ffffff;
}
```

### 3. 优先使用混合宏

```scss
// ✅ 正确 - 使用混合宏
.description {
  @include multiEllipsis(2);
}

.list-item {
  @include halfPixelBorder(bottom, 32rpx);
}

// ❌ 避免 - 重复编写样式
.description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
```

### 4. 暗黑模式适配

```scss
// ✅ 正确 - 统一在 .wot-theme-dark 中适配
.wot-theme-dark {
  @include b(card) {
    background-color: $-dark-background3;
    color: $-dark-color;
    border-color: $-dark-border-color;
  }
}

// ❌ 避免 - 分散适配
@include b(card) {
  @media (prefers-color-scheme: dark) {
    background-color: #1b1b1b;
  }
}
```

### 5. 组件样式隔离

```scss
// ✅ 正确 - 使用 BEM 命名自然隔离
@include b(my-component) {
  @include e(title) {
    font-size: 32rpx;
  }
}

// ❌ 避免 - 使用通用类名
.title {
  font-size: 32rpx;  // 可能与其他组件冲突
}
```

## 常见问题

### 1. 样式优先级问题

**问题**: 自定义样式无法覆盖组件默认样式

**解决方案:**

```scss
// 方案1: 提高选择器优先级
.container .wd-button.is-primary {
  background-color: #1890ff;
}

// 方案2: 使用 !important（谨慎使用）
.wd-button.is-primary {
  background-color: #1890ff !important;
}

// 方案3: 使用 CSS 变量（推荐）
:root {
  --wot-button-primary-bg-color: #1890ff;
}
```

### 2. 细边框在部分设备显示问题

**问题**: 0.5px 边框在某些设备上不显示或显示异常

**解决方案:**

```scss
// 使用 transform: scale 实现
@mixin hairline-border {
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 200%;
    height: 200%;
    border: 1px solid #e8e8e8;
    transform: scale(0.5);
    transform-origin: left top;
    box-sizing: border-box;
    pointer-events: none;
  }
}
```

### 3. 暗黑模式切换闪烁

**问题**: 切换暗黑模式时页面闪烁

**解决方案:**

```scss
// 添加过渡动画
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

// 或针对特定元素
.wd-button {
  transition: all 0.3s ease;
}
```

### 4. 样式穿透不生效

**问题**: `:deep()` 穿透样式不生效

**解决方案:**

```vue
<style lang="scss">
// 方案1: 使用无 scoped 的样式块
.my-container .wd-button {
  background-color: #1890ff;
}
</style>

```

### 5. rpx 单位在 H5 端适配问题

**问题**: rpx 单位在 H5 端显示异常

**解决方案:**

```scss
// 使用 CSS 变量定义，便于按平台适配
:root {
  --base-font-size: 28rpx;
}

// 或使用条件编译
/* #ifdef H5 */
.text {
  font-size: 14px;
}
/* #endif */

/* #ifndef H5 */
.text {
  font-size: 28rpx;
}
/* #endif */
```

本文档详细介绍了 WD UI 组件库的样式架构和编写规范。通过合理使用 BEM 混合宏、CSS 变量和样式配置，可以高效地开发和定制组件样式，确保组件库的一致性和可维护性。
