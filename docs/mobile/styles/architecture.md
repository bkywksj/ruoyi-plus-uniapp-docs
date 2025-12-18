# 样式架构

## 介绍

RuoYi-Plus-UniApp 移动端采用 SCSS 预处理器构建样式系统，结合 BEM 命名规范和 CSS 变量实现主题定制。样式架构分为全局样式、组件样式和工具样式三个层次，支持多端适配和暗黑模式。

**核心特性:**

- **SCSS 预处理** - 使用 SCSS 实现变量、混合宏、函数等高级特性
- **BEM 命名规范** - 采用 Block-Element-Modifier 命名约定
- **CSS 变量** - 支持运行时主题切换和动态样式
- **多端适配** - 统一的 rpx 单位系统适配不同屏幕
- **暗黑模式** - 内置完整的暗黑主题变量

## 目录结构

```
src/
├── uni.scss                          # 全局 SCSS 变量(自动注入)
├── static/style/
│   └── index.scss                    # 全局样式入口
└── wd/components/common/abstracts/
    ├── _config.scss                  # BEM 配置
    ├── _function.scss                # SCSS 函数
    ├── _mixin.scss                   # SCSS 混合宏
    └── variable.scss                 # 组件变量定义
```

## BEM 命名规范

### 配置定义

```scss
// _config.scss
$namespace: 'wd';              // 命名空间前缀
$elementSeparator: '__';       // 元素分隔符
$modifierSeparator: '--';      // 修饰符分隔符
$state-prefix: 'is-';          // 状态前缀
```

### 命名示例

```scss
// Block: wd-button
// Element: wd-button__text
// Modifier: wd-button--primary
// State: wd-button.is-disabled

.wd-button {
  // Block 样式

  &__text {
    // Element 样式
  }

  &--primary {
    // Modifier 样式
  }

  &.is-disabled {
    // State 样式
  }
}
```

### BEM 混合宏

```scss
// 定义 Block
@mixin b($block) {
  $B: $namespace + "-" + $block !global;
  .#{$B} {
    @content;
  }
}

// 定义 Element
@mixin e($element...) {
  $selector: &;
  $selectors: "";

  @each $item in $element {
    $selectors: #{$selectors + $selector + $elementSeparator + $item + ","};
  }

  @at-root {
    #{$selectors} {
      @content;
    }
  }
}

// 定义 Modifier
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

// 定义状态
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

### 使用示例

```scss
@include b(button) {
  display: inline-flex;
  align-items: center;

  @include e(text) {
    font-size: 28rpx;
  }

  @include e(icon) {
    margin-right: 8rpx;
  }

  @include m(primary) {
    background: $-color-theme;
    color: #fff;
  }

  @include m(large) {
    height: 88rpx;
    padding: 0 32rpx;
  }

  @include when(disabled) {
    opacity: 0.6;
    pointer-events: none;
  }

  @include when(loading) {
    pointer-events: none;
  }
}
```

## 全局变量

### uni.scss 变量

UniApp 内置的全局样式变量，无需导入即可使用：

```scss
// 行为颜色
$uni-color-primary: #007aff;
$uni-color-success: #4cd964;
$uni-color-warning: #f0ad4e;
$uni-color-error: #dd524d;

// 文字颜色
$uni-text-color: #333;
$uni-text-color-inverse: #fff;
$uni-text-color-grey: #999;
$uni-text-color-placeholder: #808080;
$uni-text-color-disable: #c0c0c0;

// 背景颜色
$uni-bg-color: #fff;
$uni-bg-color-grey: #f8f8f8;
$uni-bg-color-hover: #f1f1f1;
$uni-bg-color-mask: rgb(0 0 0 / 40%);

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

// 透明度
$uni-opacity-disabled: 0.3;
```

### 主题色变量

WD UI 组件库的主题色变量：

```scss
// 主题颜色
$-color-theme: var(--wot-color-theme, #4d80f0);
$-color-white: var(--wot-color-white, rgb(255, 255, 255));
$-color-black: var(--wot-color-black, rgb(0, 0, 0));

// 辅助色
$-color-success: var(--wot-color-success, #34d19d);
$-color-warning: var(--wot-color-warning, #f0883a);
$-color-danger: var(--wot-color-danger, #fa4350);
$-color-purple: var(--wot-color-purple, #8268de);
$-color-yellow: var(--wot-color-yellow, #f0cd1d);
$-color-blue: var(--wot-color-blue, #2bb3ed);
$-color-info: var(--wot-color-info, #909399);

// 灰度色阶
$-color-gray-1: var(--wot-color-gray-1, #f9f9f9);
$-color-gray-2: var(--wot-color-gray-2, #f2f3f5);
$-color-gray-3: var(--wot-color-gray-3, #ebedf0);
$-color-gray-4: var(--wot-color-gray-4, #dcdee0);
$-color-gray-5: var(--wot-color-gray-5, #c8c9cc);
$-color-gray-6: var(--wot-color-gray-6, #969799);
$-color-gray-7: var(--wot-color-gray-7, #646566);
$-color-gray-8: var(--wot-color-gray-8, #323233);
```

### 文字颜色变量

```scss
// 浅色背景下的文字颜色
$-color-title: var(--wot-color-title, $-color-black);      // 标题
$-color-content: var(--wot-color-content, #262626);        // 正文
$-color-secondary: var(--wot-color-secondary, #595959);    // 次要信息
$-color-aid: var(--wot-color-aid, #8c8c8c);               // 辅助文字
$-color-tip: var(--wot-color-tip, #bfbfbf);               // 提示文字
$-color-border: var(--wot-color-border, #d9d9d9);         // 边框
$-color-border-light: var(--wot-color-border-light, #e8e8e8); // 分割线
$-color-bg: var(--wot-color-bg, #f5f5f5);                 // 背景色
```

### 字号变量

```scss
$-fs-big: var(--wot-fs-big, 48rpx);           // 大型标题
$-fs-important: var(--wot-fs-important, 38rpx); // 重要数据
$-fs-title: var(--wot-fs-title, 32rpx);        // 标题字号
$-fs-content: var(--wot-fs-content, 28rpx);    // 正文字号
$-fs-secondary: var(--wot-fs-secondary, 24rpx); // 次要信息
$-fs-aid: var(--wot-fs-aid, 20rpx);            // 辅助文字
```

## 暗黑模式

### 暗黑模式变量

```scss
$-dark-background: var(--wot-dark-background, #131313);
$-dark-background2: var(--wot-dark-background2, #1b1b1b);
$-dark-background3: var(--wot-dark-background3, #141414);
$-dark-background4: var(--wot-dark-background4, #323233);
$-dark-background5: var(--wot-dark-background5, #646566);
$-dark-background6: var(--wot-dark-background6, #380e08);
$-dark-background7: var(--wot-dark-background7, #707070);
$-dark-color: var(--wot-dark-color, $-color-white);
$-dark-color2: var(--wot-dark-color2, #f2270c);
$-dark-color3: var(--wot-dark-color3, rgba(232, 230, 227, 0.8));
$-dark-color-gray: var(--wot-dark-color-gray, $-color-secondary);
$-dark-border-color: var(--wot-dark-border-color, #3a3a3c);
```

### 暗黑模式切换

```typescript
// useTheme.ts
import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  const setTheme = (dark: boolean) => {
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
  }

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}
```

## 常用混合宏

### 文本省略

```scss
// 单行省略
@mixin lineEllipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行省略
@mixin multiEllipsis($lineNumber: 3) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $lineNumber;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}
```

### 0.5px 边框

```scss
// 单方向 0.5px 边框
@mixin halfPixelBorder($direction: "bottom", $left: 0, $color: $-color-border-light) {
  position: relative;

  &::after {
    position: absolute;
    display: block;
    content: "";
    width: if($left == 0, 100%, calc(100% - #{$left}));
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

// 环绕 0.5px 边框
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

### 清除按钮样式

```scss
@mixin buttonClear {
  outline: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  background: transparent;
}
```

### 清除浮动

```scss
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

## 组件样式覆盖

### 使用 CSS 变量

```vue
<template>
  <wd-button custom-class="my-button">按钮</wd-button>
</template>

<style lang="scss">
.my-button {
  --wot-button-primary-bg-color: #ff6600;
  --wot-button-primary-color: #fff;
}
</style>
```

### 使用 custom-class

```vue
<template>
  <wd-cell custom-class="my-cell" title="标题" />
</template>

<style lang="scss">
.my-cell {
  background: #f5f5f5;

  :deep(.wd-cell__title) {
    color: #333;
    font-weight: bold;
  }
}
</style>
```

### 使用 custom-style

```vue
<template>
  <wd-button
    custom-style="background: linear-gradient(90deg, #ff6600, #ff9900);"
  >
    渐变按钮
  </wd-button>
</template>
```

## 最佳实践

### 1. 变量优先

优先使用已定义的变量，保持样式一致性：

```scss
// 推荐
.my-component {
  color: $-color-content;
  font-size: $-fs-content;
  padding: $-size-side-padding;
}

// 不推荐
.my-component {
  color: #262626;
  font-size: 28rpx;
  padding: 30rpx;
}
```

### 2. 使用 BEM 混合宏

```scss
// 推荐
@include b(my-component) {
  @include e(header) {
    // ...
  }

  @include m(large) {
    // ...
  }
}

// 不推荐
.wd-my-component {
  .wd-my-component__header {
    // ...
  }
}
```

### 3. 响应式设计

使用 rpx 单位实现自动适配：

```scss
.my-component {
  width: 100%;
  padding: 32rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
}
```

### 4. 主题兼容

同时考虑亮色和暗黑模式：

```scss
.my-component {
  background: $-color-white;
  color: $-color-content;

  :global(.dark) & {
    background: $-dark-background;
    color: $-dark-color;
  }
}
```

## 常见问题

### 1. 样式不生效？

检查以下几点：
- 组件是否支持 `custom-class` 属性
- 是否正确使用 `:deep()` 穿透选择器
- 样式优先级是否足够

### 2. 暗黑模式下样式异常？

确保使用了 CSS 变量而非固定颜色值，CSS 变量会在主题切换时自动更新。

### 3. rpx 单位在 H5 端不生效？

UniApp 会自动将 rpx 转换为对应的 px 值，确保在 `uni.scss` 中正确配置了设计稿宽度。
