# 样式架构

## 介绍

RuoYi-Plus-UniApp 移动端采用 SCSS 预处理器构建样式系统，结合 BEM 命名规范和 CSS 变量实现主题定制。样式架构分为全局样式、组件样式和工具样式三个层次，支持多端适配和暗黑模式。

**核心特性:**

- **SCSS 预处理** - 使用 SCSS 实现变量、混合宏、函数等高级特性
- **BEM 命名规范** - 采用 Block-Element-Modifier 命名约定
- **CSS 变量** - 支持运行时主题切换和动态样式
- **多端适配** - 统一的 rpx 单位系统适配不同屏幕
- **暗黑模式** - 内置完整的暗黑主题变量
- **分层架构** - 清晰的样式层次结构，便于维护和扩展
- **按需加载** - 组件样式按需引入，减少包体积

## 架构图解

### 样式层次结构

```text
┌─────────────────────────────────────────────────────────────────┐
│                        应用层 (Application)                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     页面样式 (Pages)                          │ │
│  │  pages/index/index.scss, pages/user/profile.scss ...        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              ↓ 继承                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   组件样式 (Components)                       │ │
│  │  wd-button.scss, wd-cell.scss, wd-input.scss ...            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              ↓ 继承                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   工具样式 (Utilities)                        │ │
│  │  _mixin.scss, _function.scss, helpers.scss                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              ↓ 继承                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   变量层 (Variables)                          │ │
│  │  variable.scss, _config.scss, uni.scss                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 样式编译流程

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   uni.scss   │────▶│  Vite/SCSS   │────▶│   编译产物    │
│  (全局变量)   │     │   编译器      │     │  (CSS/wxss)  │
└──────────────┘     └──────────────┘     └──────────────┘
       ↑                    ↑                    │
       │                    │                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ variable.scss│     │ 组件 SCSS    │     │   H5: CSS    │
│  (组件变量)   │────▶│  文件        │     │ 小程序: wxss │
└──────────────┘     └──────────────┘     │  App: nvue   │
       ↑                    ↑              └──────────────┘
       │                    │
┌──────────────┐     ┌──────────────┐
│ _mixin.scss  │────▶│ 页面 SCSS    │
│  (混合宏)    │     │  文件        │
└──────────────┘     └──────────────┘
```

### BEM 命名体系

```text
┌─────────────────────────────────────────────────────────────────┐
│                        BEM 命名规范                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Block (块)          Element (元素)        Modifier (修饰符)     │
│  ├── wd-button       ├── __text           ├── --primary        │
│  ├── wd-cell         ├── __icon           ├── --success        │
│  ├── wd-input        ├── __label          ├── --large          │
│  └── wd-form         ├── __content        └── --disabled       │
│                      └── __wrapper                              │
│                                                                 │
│  State (状态)                                                   │
│  ├── is-disabled                                                │
│  ├── is-loading                                                 │
│  ├── is-active                                                  │
│  └── is-checked                                                 │
│                                                                 │
│  完整示例: .wd-button--primary.is-loading .wd-button__icon      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 目录结构

### 完整目录树

```text
src/
├── uni.scss                              # 全局 SCSS 变量(自动注入到所有组件)
├── App.vue                               # 根组件，可定义全局样式
├── static/
│   └── style/
│       ├── index.scss                    # 全局样式入口
│       ├── reset.scss                    # 样式重置
│       ├── helpers.scss                  # 辅助类
│       └── transition.scss               # 过渡动画
├── wd/
│   └── components/
│       ├── common/
│       │   └── abstracts/
│       │       ├── _config.scss          # BEM 配置(命名空间、分隔符)
│       │       ├── _function.scss        # SCSS 函数(颜色、尺寸计算)
│       │       ├── _mixin.scss           # SCSS 混合宏(BEM、边框、省略)
│       │       └── variable.scss         # 组件变量定义(颜色、尺寸、间距)
│       ├── wd-button/
│       │   └── wd-button.scss            # 按钮组件样式
│       ├── wd-cell/
│       │   └── wd-cell.scss              # 单元格组件样式
│       └── ...                           # 其他组件样式
└── pages/
    ├── index/
    │   └── index.scss                    # 首页样式
    └── user/
        └── profile.scss                  # 用户页样式
```

### 文件职责说明

| 文件 | 职责 | 作用域 |
|------|------|--------|
| `uni.scss` | 定义全局 SCSS 变量 | 自动注入所有组件 |
| `variable.scss` | 定义 WD UI 组件变量 | 需手动导入 |
| `_config.scss` | BEM 命名配置 | 被 _mixin.scss 引用 |
| `_mixin.scss` | SCSS 混合宏 | 需手动导入 |
| `_function.scss` | SCSS 函数 | 需手动导入 |
| `index.scss` | 全局样式入口 | 在 App.vue 中导入 |

## BEM 命名规范

### 配置定义

```scss
// _config.scss
// BEM 命名规范核心配置

// 命名空间前缀 - 所有组件类名以此开头
$namespace: 'wd';

// 元素分隔符 - 连接 Block 和 Element
$elementSeparator: '__';

// 修饰符分隔符 - 连接 Block/Element 和 Modifier
$modifierSeparator: '--';

// 状态前缀 - 表示组件状态的类名前缀
$state-prefix: 'is-';
```

### 命名规则详解

#### Block（块）

Block 是独立的、可复用的组件单元。

```scss
// Block 命名规则:
// 1. 使用 $namespace 前缀
// 2. 使用小写字母
// 3. 多个单词用连字符连接

// 正确示例
.wd-button { }
.wd-cell { }
.wd-input-number { }
.wd-date-picker { }

// 错误示例
.button { }          // ❌ 缺少命名空间
.wdButton { }        // ❌ 不应使用驼峰
.wd_button { }       // ❌ 不应使用下划线
```

#### Element（元素）

Element 是 Block 的组成部分，不能独立存在。

```scss
// Element 命名规则:
// 1. 使用双下划线连接 Block 和 Element
// 2. Element 只能作为 Block 的后代

// 正确示例
.wd-button__text { }
.wd-button__icon { }
.wd-cell__title { }
.wd-cell__value { }
.wd-cell__label { }

// 错误示例
.wd-button-text { }      // ❌ 应使用双下划线
.wd-button__icon__svg { } // ❌ 不应嵌套 Element
.__text { }               // ❌ Element 不能独立存在
```

#### Modifier（修饰符）

Modifier 用于改变 Block 或 Element 的外观或行为。

```scss
// Modifier 命名规则:
// 1. 使用双连字符连接
// 2. 可以附加在 Block 或 Element 上

// Block Modifier
.wd-button--primary { }
.wd-button--success { }
.wd-button--large { }
.wd-button--round { }

// Element Modifier
.wd-cell__title--bold { }
.wd-input__icon--clear { }

// 组合使用
.wd-button--primary.wd-button--large { }
```

#### State（状态）

State 表示组件的临时状态。

```scss
// State 命名规则:
// 1. 使用 is- 前缀
// 2. 与 Block 或 Element 组合使用

// 常用状态
.wd-button.is-disabled { }
.wd-button.is-loading { }
.wd-checkbox.is-checked { }
.wd-input.is-focus { }
.wd-collapse-item.is-expanded { }

// 状态优先级较高
.wd-button.is-disabled {
  pointer-events: none;
  opacity: 0.5;
}
```

### BEM 混合宏

#### Block 混合宏

```scss
// 定义 Block
// 参数: $block - 块名称(不含命名空间前缀)
@mixin b($block) {
  // 设置全局变量 $B，供 Element 和 Modifier 使用
  $B: $namespace + "-" + $block !global;

  .#{$B} {
    @content;
  }
}

// 使用示例
@include b(button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // 输出: .wd-button { ... }
}
```

#### Element 混合宏

```scss
// 定义 Element
// 参数: $element... - 元素名称(支持多个)
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

// 使用示例
@include b(button) {
  @include e(text) {
    font-size: 28rpx;
    // 输出: .wd-button__text { ... }
  }

  @include e(icon) {
    margin-right: 8rpx;
    // 输出: .wd-button__icon { ... }
  }

  // 同时定义多个 Element
  @include e(prefix, suffix) {
    display: flex;
    // 输出: .wd-button__prefix, .wd-button__suffix { ... }
  }
}
```

#### Modifier 混合宏

```scss
// 定义 Modifier
// 参数: $modifier... - 修饰符名称(支持多个)
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

// 使用示例
@include b(button) {
  @include m(primary) {
    background: $-color-theme;
    color: #fff;
    // 输出: .wd-button--primary { ... }
  }

  @include m(success) {
    background: $-color-success;
    color: #fff;
    // 输出: .wd-button--success { ... }
  }

  // 同时定义多个 Modifier
  @include m(round, circle) {
    border-radius: 50%;
    // 输出: .wd-button--round, .wd-button--circle { ... }
  }
}
```

#### State 混合宏

```scss
// 定义状态
// 参数: $states... - 状态名称(支持多个)
@mixin when($states...) {
  @at-root {
    @each $state in $states {
      &.#{$state-prefix + $state} {
        @content;
      }
    }
  }
}

// 使用示例
@include b(button) {
  @include when(disabled) {
    opacity: 0.6;
    pointer-events: none;
    // 输出: .wd-button.is-disabled { ... }
  }

  @include when(loading) {
    pointer-events: none;
    // 输出: .wd-button.is-loading { ... }
  }

  // 同时定义多个状态
  @include when(focus, hover) {
    box-shadow: 0 0 0 2rpx rgba($-color-theme, 0.3);
    // 输出: .wd-button.is-focus, .wd-button.is-hover { ... }
  }
}
```

### 完整组件示例

```scss
// 完整的 Button 组件样式示例
@include b(button) {
  // Block 基础样式
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  border-radius: 8rpx;
  transition: all 0.3s;

  // Element 定义
  @include e(text) {
    display: flex;
    align-items: center;
  }

  @include e(icon) {
    font-size: 32rpx;

    &:not(:last-child) {
      margin-right: 8rpx;
    }
  }

  @include e(loading) {
    margin-right: 8rpx;
  }

  // Modifier 定义 - 类型
  @include m(primary) {
    background: $-color-theme;
    color: $-color-white;

    &:active {
      background: darken($-color-theme, 10%);
    }
  }

  @include m(success) {
    background: $-color-success;
    color: $-color-white;
  }

  @include m(warning) {
    background: $-color-warning;
    color: $-color-white;
  }

  @include m(danger) {
    background: $-color-danger;
    color: $-color-white;
  }

  // Modifier 定义 - 尺寸
  @include m(small) {
    height: 56rpx;
    padding: 0 20rpx;
    font-size: 24rpx;
  }

  @include m(large) {
    height: 96rpx;
    padding: 0 40rpx;
    font-size: 32rpx;
  }

  // Modifier 定义 - 形状
  @include m(round) {
    border-radius: 40rpx;
  }

  @include m(square) {
    border-radius: 0;
  }

  @include m(plain) {
    background: transparent;
    border: 2rpx solid $-color-theme;
    color: $-color-theme;
  }

  // Modifier 定义 - 块级
  @include m(block) {
    display: flex;
    width: 100%;
  }

  // State 定义
  @include when(disabled) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  @include when(loading) {
    pointer-events: none;

    @include e(text) {
      opacity: 0.6;
    }
  }

  @include when(active) {
    transform: scale(0.95);
  }
}
```

## 全局变量

### uni.scss 变量

UniApp 内置的全局样式变量，无需导入即可在所有组件中使用：

```scss
// ============================================================
// 行为颜色 - 用于表示交互状态和反馈
// ============================================================
$uni-color-primary: #007aff;     // 主要操作、链接
$uni-color-success: #4cd964;     // 成功、确认
$uni-color-warning: #f0ad4e;     // 警告、提醒
$uni-color-error: #dd524d;       // 错误、危险

// ============================================================
// 文字颜色 - 用于不同层级的文本
// ============================================================
$uni-text-color: #333;                    // 主要文字
$uni-text-color-inverse: #fff;            // 反色文字(深色背景)
$uni-text-color-grey: #999;               // 辅助文字
$uni-text-color-placeholder: #808080;     // 占位符文字
$uni-text-color-disable: #c0c0c0;         // 禁用文字

// ============================================================
// 背景颜色 - 用于不同层级的背景
// ============================================================
$uni-bg-color: #fff;                      // 主背景
$uni-bg-color-grey: #f8f8f8;              // 灰色背景(卡片底)
$uni-bg-color-hover: #f1f1f1;             // 点击态背景
$uni-bg-color-mask: rgb(0 0 0 / 40%);     // 遮罩层背景

// ============================================================
// 边框颜色
// ============================================================
$uni-border-color: #c8c7cc;               // 边框颜色

// ============================================================
// 文字尺寸 - 遵循 4px 基准
// ============================================================
$uni-font-size-sm: 12px;                  // 辅助文字
$uni-font-size-base: 14px;                // 正文
$uni-font-size-lg: 16px;                  // 标题

// ============================================================
// 圆角尺寸
// ============================================================
$uni-border-radius-sm: 2px;               // 小圆角
$uni-border-radius-base: 3px;             // 基础圆角
$uni-border-radius-lg: 6px;               // 大圆角
$uni-border-radius-circle: 50%;           // 圆形

// ============================================================
// 间距尺寸 - 水平(row)和垂直(col)
// ============================================================
$uni-spacing-row-sm: 5px;                 // 水平小间距
$uni-spacing-row-base: 10px;              // 水平基础间距
$uni-spacing-row-lg: 15px;                // 水平大间距
$uni-spacing-col-sm: 4px;                 // 垂直小间距
$uni-spacing-col-base: 8px;               // 垂直基础间距
$uni-spacing-col-lg: 12px;                // 垂直大间距

// ============================================================
// 透明度
// ============================================================
$uni-opacity-disabled: 0.3;               // 禁用状态透明度
```

### WD UI 主题变量

#### 品牌色变量

```scss
// ============================================================
// 主题颜色 - 品牌标识色
// ============================================================
$-color-theme: var(--wot-color-theme, #4d80f0);           // 主题色
$-color-white: var(--wot-color-white, rgb(255, 255, 255)); // 纯白
$-color-black: var(--wot-color-black, rgb(0, 0, 0));       // 纯黑

// ============================================================
// 功能色 - 用于不同场景的语义颜色
// ============================================================
$-color-success: var(--wot-color-success, #34d19d);       // 成功
$-color-warning: var(--wot-color-warning, #f0883a);       // 警告
$-color-danger: var(--wot-color-danger, #fa4350);         // 危险
$-color-info: var(--wot-color-info, #909399);             // 信息

// ============================================================
// 扩展色 - 用于数据可视化、标签等
// ============================================================
$-color-purple: var(--wot-color-purple, #8268de);         // 紫色
$-color-yellow: var(--wot-color-yellow, #f0cd1d);         // 黄色
$-color-blue: var(--wot-color-blue, #2bb3ed);             // 蓝色
$-color-cyan: var(--wot-color-cyan, #00bcd4);             // 青色
$-color-pink: var(--wot-color-pink, #e91e63);             // 粉色
```

#### 灰度色阶

```scss
// ============================================================
// 灰度色阶 - 8 级灰度用于不同场景
// ============================================================
$-color-gray-1: var(--wot-color-gray-1, #f9f9f9);   // 最浅 - 背景底色
$-color-gray-2: var(--wot-color-gray-2, #f2f3f5);   // 浅灰 - 卡片背景
$-color-gray-3: var(--wot-color-gray-3, #ebedf0);   // 分割线浅
$-color-gray-4: var(--wot-color-gray-4, #dcdee0);   // 分割线
$-color-gray-5: var(--wot-color-gray-5, #c8c9cc);   // 边框
$-color-gray-6: var(--wot-color-gray-6, #969799);   // 辅助文字
$-color-gray-7: var(--wot-color-gray-7, #646566);   // 次要文字
$-color-gray-8: var(--wot-color-gray-8, #323233);   // 主要文字
```

#### 文字颜色变量

```scss
// ============================================================
// 文字颜色 - 分层级定义
// ============================================================
$-color-title: var(--wot-color-title, $-color-black);       // 标题
$-color-content: var(--wot-color-content, #262626);         // 正文
$-color-secondary: var(--wot-color-secondary, #595959);     // 次要信息
$-color-aid: var(--wot-color-aid, #8c8c8c);                 // 辅助文字
$-color-tip: var(--wot-color-tip, #bfbfbf);                 // 提示文字

// ============================================================
// 边框和分割线
// ============================================================
$-color-border: var(--wot-color-border, #d9d9d9);           // 边框
$-color-border-light: var(--wot-color-border-light, #e8e8e8); // 分割线

// ============================================================
// 背景色
// ============================================================
$-color-bg: var(--wot-color-bg, #f5f5f5);                   // 页面背景
$-color-bg-hover: var(--wot-color-bg-hover, #f1f1f1);       // 点击态
```

#### 字号变量

```scss
// ============================================================
// 字号系统 - 基于 4px 基准的 rpx 单位
// ============================================================
$-fs-big: var(--wot-fs-big, 48rpx);             // 48rpx - 大标题、金额
$-fs-important: var(--wot-fs-important, 38rpx); // 38rpx - 重要数据
$-fs-title: var(--wot-fs-title, 32rpx);         // 32rpx - 页面标题
$-fs-content: var(--wot-fs-content, 28rpx);     // 28rpx - 正文内容
$-fs-secondary: var(--wot-fs-secondary, 24rpx); // 24rpx - 次要信息
$-fs-aid: var(--wot-fs-aid, 20rpx);             // 20rpx - 辅助说明

// 使用示例
.price {
  font-size: $-fs-big;           // 金额使用大字号
}
.title {
  font-size: $-fs-title;         // 标题
}
.content {
  font-size: $-fs-content;       // 正文
}
.tips {
  font-size: $-fs-aid;           // 提示文字
}
```

#### 尺寸变量

```scss
// ============================================================
// 间距和尺寸
// ============================================================
$-size-side-padding: var(--wot-size-side-padding, 30rpx);         // 页面边距
$-size-side-padding-small: var(--wot-size-side-padding-small, 12rpx); // 小边距

// ============================================================
// 组件尺寸
// ============================================================
$-cell-padding: var(--wot-cell-padding, 28rpx 30rpx);             // 单元格内边距
$-cell-icon-size: var(--wot-cell-icon-size, 48rpx);               // 单元格图标尺寸
$-button-height: var(--wot-button-height, 80rpx);                 // 按钮高度
$-input-height: var(--wot-input-height, 88rpx);                   // 输入框高度

// ============================================================
// 圆角尺寸
// ============================================================
$-radius-sm: var(--wot-radius-sm, 4rpx);                          // 小圆角
$-radius-base: var(--wot-radius-base, 8rpx);                      // 基础圆角
$-radius-lg: var(--wot-radius-lg, 16rpx);                         // 大圆角
$-radius-round: var(--wot-radius-round, 999rpx);                  // 圆形

// ============================================================
// 层级(z-index)
// ============================================================
$-z-index-popup: var(--wot-z-index-popup, 500);                   // 弹出层
$-z-index-mask: var(--wot-z-index-mask, 400);                     // 遮罩层
$-z-index-toast: var(--wot-z-index-toast, 1000);                  // 轻提示
$-z-index-loading: var(--wot-z-index-loading, 1100);              // 加载
```

## 暗黑模式

### 暗黑模式变量

```scss
// ============================================================
// 暗黑模式背景色 - 多层级背景
// ============================================================
$-dark-background: var(--wot-dark-background, #131313);           // 页面背景
$-dark-background2: var(--wot-dark-background2, #1b1b1b);         // 卡片背景
$-dark-background3: var(--wot-dark-background3, #141414);         // 弹出层背景
$-dark-background4: var(--wot-dark-background4, #323233);         // 输入框背景
$-dark-background5: var(--wot-dark-background5, #646566);         // 禁用背景
$-dark-background6: var(--wot-dark-background6, #380e08);         // 错误背景
$-dark-background7: var(--wot-dark-background7, #707070);         // 特殊背景

// ============================================================
// 暗黑模式文字色
// ============================================================
$-dark-color: var(--wot-dark-color, $-color-white);               // 主文字
$-dark-color2: var(--wot-dark-color2, #f2270c);                   // 强调文字
$-dark-color3: var(--wot-dark-color3, rgba(232, 230, 227, 0.8));  // 次要文字
$-dark-color-gray: var(--wot-dark-color-gray, $-color-secondary); // 灰色文字

// ============================================================
// 暗黑模式边框
// ============================================================
$-dark-border-color: var(--wot-dark-border-color, #3a3a3c);       // 边框颜色
```

### 暗黑模式实现机制

```text
┌─────────────────────────────────────────────────────────────────┐
│                      暗黑模式切换流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   用户操作              系统响应              样式更新           │
│   ────────          ────────────          ──────────           │
│                                                                 │
│   点击切换     ─────▶  toggleTheme()  ─────▶  添加 .dark 类     │
│      │                     │                      │             │
│      │                     │                      ▼             │
│      │                     │              CSS 变量自动更新       │
│      │                     │                      │             │
│      │                     ▼                      ▼             │
│      │              存储到本地             组件样式自动应用       │
│      │                     │                      │             │
│      ▼                     ▼                      ▼             │
│   系统主题     ─────▶  监听变化     ─────▶  自动切换主题         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 主题切换实现

```typescript
// composables/useTheme.ts
import { ref, watch } from 'vue'
import { cache } from '@/utils/cache'

const THEME_KEY = 'app_theme'

// 主题状态
const isDark = ref(false)
const themeMode = ref<'light' | 'dark' | 'system'>('system')

export function useTheme() {
  /**
   * 初始化主题
   * 1. 从缓存读取用户设置
   * 2. 如果是 system 模式，监听系统主题变化
   */
  const initTheme = () => {
    const cached = cache.get(THEME_KEY)
    if (cached) {
      themeMode.value = cached
    }

    if (themeMode.value === 'system') {
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      isDark.value = mediaQuery.matches

      mediaQuery.addEventListener('change', (e) => {
        if (themeMode.value === 'system') {
          setTheme(e.matches)
        }
      })
    } else {
      isDark.value = themeMode.value === 'dark'
    }

    applyTheme()
  }

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
    themeMode.value = isDark.value ? 'dark' : 'light'
    cache.set(THEME_KEY, themeMode.value)
    applyTheme()
  }

  /**
   * 设置主题
   */
  const setTheme = (dark: boolean) => {
    isDark.value = dark
    applyTheme()
  }

  /**
   * 设置主题模式
   */
  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    themeMode.value = mode
    cache.set(THEME_KEY, mode)

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      isDark.value = mediaQuery.matches
    } else {
      isDark.value = mode === 'dark'
    }

    applyTheme()
  }

  /**
   * 应用主题到 DOM
   */
  const applyTheme = () => {
    // H5 端
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark.value)
    }

    // 小程序端 - 使用页面类名
    // #ifdef MP
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
      currentPage.$vm?.setData?.({
        themeClass: isDark.value ? 'dark' : 'light'
      })
    }
    // #endif
  }

  return {
    isDark,
    themeMode,
    initTheme,
    toggleTheme,
    setTheme,
    setThemeMode
  }
}
```

### 组件暗黑模式适配

```scss
// 组件中适配暗黑模式的标准写法
@include b(cell) {
  background: $-color-white;
  color: $-color-content;

  @include e(title) {
    color: $-color-title;
  }

  @include e(value) {
    color: $-color-secondary;
  }

  @include e(label) {
    color: $-color-aid;
  }

  // 暗黑模式覆盖
  :global(.dark) & {
    background: $-dark-background2;
    color: $-dark-color;

    @include e(title) {
      color: $-dark-color;
    }

    @include e(value) {
      color: $-dark-color3;
    }

    @include e(label) {
      color: $-dark-color-gray;
    }
  }
}
```

### 暗黑模式最佳实践

```vue
<template>
  <view :class="['page', { dark: isDark }]">
    <wd-cell title="暗黑模式" :value="isDark ? '开启' : '关闭'">
      <template #right-icon>
        <wd-switch v-model="isDark" @change="toggleTheme" />
      </template>
    </wd-cell>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: $-color-bg;
  transition: background-color 0.3s;

  &.dark {
    background: $-dark-background;
  }
}

// 自定义暗黑模式变量
.custom-card {
  --card-bg: #{$-color-white};
  --card-text: #{$-color-content};
  --card-border: #{$-color-border-light};

  background: var(--card-bg);
  color: var(--card-text);
  border: 1rpx solid var(--card-border);

  :global(.dark) & {
    --card-bg: #{$-dark-background2};
    --card-text: #{$-dark-color};
    --card-border: #{$-dark-border-color};
  }
}
</style>
```

## 常用混合宏

### 文本省略

```scss
// ============================================================
// 单行文本省略
// ============================================================
@mixin lineEllipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 使用示例
.title {
  @include lineEllipsis;
  max-width: 400rpx;
}

// ============================================================
// 多行文本省略
// 参数: $lineNumber - 显示行数(默认 3 行)
// ============================================================
@mixin multiEllipsis($lineNumber: 3) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $lineNumber;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

// 使用示例
.description {
  @include multiEllipsis(2);  // 2 行省略
}

.article-preview {
  @include multiEllipsis(5);  // 5 行省略
}
```

### 0.5px 边框

```scss
// ============================================================
// 单方向 0.5px 边框
// 参数:
//   $direction - 边框方向("bottom" 或 "top")
//   $left - 左侧偏移距离
//   $color - 边框颜色
// ============================================================
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

// 使用示例
.cell {
  @include halfPixelBorder("bottom", 30rpx);  // 底部边框，左侧留 30rpx
}

.header {
  @include halfPixelBorder("bottom", 0, $-color-theme);  // 主题色底边框
}

// ============================================================
// 环绕 0.5px 边框
// 参数:
//   $color - 边框颜色
//   $radius - 圆角大小(可选)
// ============================================================
@mixin halfPixelBorderSurround($color: $-color-border-light, $radius: 0) {
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
    @if ($radius != 0) {
      border-radius: $radius * 2;
    }
  }
}

// 使用示例
.card {
  @include halfPixelBorderSurround($-color-border, 16rpx);
}

.tag {
  @include halfPixelBorderSurround($-color-theme, 8rpx);
}
```

### 清除默认样式

```scss
// ============================================================
// 清除按钮默认样式
// ============================================================
@mixin buttonClear {
  outline: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
}

// 使用示例
.custom-btn {
  @include buttonClear;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ============================================================
// 清除输入框默认样式
// ============================================================
@mixin inputClear {
  outline: none;
  -webkit-appearance: none;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;

  &::-webkit-input-placeholder {
    color: $-color-tip;
  }
}

// 使用示例
.custom-input {
  @include inputClear;
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
}

// ============================================================
// 清除浮动
// ============================================================
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

// 使用示例
.float-container {
  @include clearFloat;

  .left {
    float: left;
  }

  .right {
    float: right;
  }
}
```

### 布局混合宏

```scss
// ============================================================
// Flex 居中
// ============================================================
@mixin flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 使用示例
.icon-wrapper {
  @include flexCenter;
  width: 80rpx;
  height: 80rpx;
}

// ============================================================
// Flex 垂直居中
// ============================================================
@mixin flexVerticalCenter {
  display: flex;
  align-items: center;
}

// ============================================================
// Flex 两端对齐
// ============================================================
@mixin flexBetween {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 使用示例
.header {
  @include flexBetween;
  padding: 0 30rpx;
}

// ============================================================
// 绝对定位填充
// ============================================================
@mixin absoluteFill {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

// 使用示例
.overlay {
  @include absoluteFill;
  background: rgba(0, 0, 0, 0.5);
}

// ============================================================
// 固定定位填充
// ============================================================
@mixin fixedFill {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

// 使用示例
.modal-mask {
  @include fixedFill;
  background: $uni-bg-color-mask;
  z-index: $-z-index-mask;
}
```

### 安全区域适配

```scss
// ============================================================
// 安全区域 - 底部
// ============================================================
@mixin safeAreaBottom($property: "padding-bottom") {
  #{$property}: constant(safe-area-inset-bottom);
  #{$property}: env(safe-area-inset-bottom);
}

// 使用示例
.footer {
  @include safeAreaBottom;
}

// ============================================================
// 安全区域 - 顶部
// ============================================================
@mixin safeAreaTop($property: "padding-top") {
  #{$property}: constant(safe-area-inset-top);
  #{$property}: env(safe-area-inset-top);
}

// 使用示例
.header {
  @include safeAreaTop;
}

// ============================================================
// 安全区域 - 完整
// ============================================================
@mixin safeAreaInset {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-right: constant(safe-area-inset-right);
  padding-right: env(safe-area-inset-right);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: constant(safe-area-inset-left);
  padding-left: env(safe-area-inset-left);
}
```

## 组件样式覆盖

### 使用 CSS 变量

```vue
<template>
  <wd-button custom-class="my-button">自定义按钮</wd-button>
</template>

<style lang="scss">
// 通过 CSS 变量修改组件样式
.my-button {
  // 修改按钮背景色
  --wot-button-primary-bg-color: #ff6600;
  --wot-button-primary-color: #fff;

  // 修改按钮尺寸
  --wot-button-height: 96rpx;
  --wot-button-font-size: 32rpx;

  // 修改圆角
  --wot-button-border-radius: 48rpx;
}

// 作用于所有按钮
page {
  --wot-color-theme: #ff6600;
}
</style>
```

### 使用 custom-class

```vue
<template>
  <wd-cell custom-class="my-cell" title="标题" value="内容" />
</template>

<style lang="scss">
.my-cell {
  // 修改背景色
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  // 使用 :deep() 穿透选择器修改子元素
  :deep(.wd-cell__title) {
    color: #333;
    font-weight: bold;
    font-size: 32rpx;
  }

  :deep(.wd-cell__value) {
    color: $-color-theme;
  }

  :deep(.wd-cell__icon) {
    font-size: 40rpx;
    color: $-color-warning;
  }
}
</style>
```

### 使用 custom-style

```vue
<template>
  <!-- 动态样式 -->
  <wd-button :custom-style="buttonStyle">
    动态按钮
  </wd-button>

  <!-- 静态样式 -->
  <wd-button
    custom-style="background: linear-gradient(90deg, #ff6600, #ff9900); border: none;"
  >
    渐变按钮
  </wd-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const primaryColor = ref('#ff6600')

const buttonStyle = computed(() => ({
  background: primaryColor.value,
  borderRadius: '20rpx',
  boxShadow: `0 8rpx 16rpx ${primaryColor.value}40`
}))
</script>
```

### 组件样式覆盖优先级

```text
┌─────────────────────────────────────────────────────────────────┐
│                      样式优先级(从低到高)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 组件默认样式                                                 │
│     └── wd-button.scss 中定义的基础样式                          │
│                                                                 │
│  2. CSS 变量(组件级)                                             │
│     └── --wot-button-primary-bg-color                           │
│                                                                 │
│  3. custom-class                                                │
│     └── .my-button { ... }                                      │
│                                                                 │
│  4. custom-style                                                │
│     └── custom-style="background: red;"                         │
│                                                                 │
│  5. !important(不推荐)                                          │
│     └── background: red !important;                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 平台适配

### 平台样式差异

```scss
// ============================================================
// 条件编译 - 针对不同平台编写样式
// ============================================================

.page-header {
  height: 88rpx;

  /* #ifdef H5 */
  // H5 端特有样式
  height: 44px;
  position: sticky;
  top: 0;
  /* #endif */

  /* #ifdef MP-WEIXIN */
  // 微信小程序特有样式
  padding-top: var(--status-bar-height, 0);
  /* #endif */

  /* #ifdef APP-PLUS */
  // App 端特有样式
  padding-top: var(--status-bar-height);
  /* #endif */
}

// ============================================================
// 安全区域适配
// ============================================================

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;

  /* #ifdef H5 */
  // H5 端无需安全区域
  /* #endif */

  /* #ifndef H5 */
  // 小程序和 App 需要安全区域
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
}
```

### 平台字体适配

```scss
// ============================================================
// 跨平台字体栈
// ============================================================
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB',
              'Microsoft YaHei', sans-serif;

// 使用
body, page {
  font-family: $font-family;
  font-size: $-fs-content;
  line-height: 1.5;
  color: $-color-content;
}
```

## 最佳实践

### 1. 变量优先原则

优先使用已定义的变量，保持样式一致性：

```scss
// ✅ 推荐
.my-component {
  color: $-color-content;
  font-size: $-fs-content;
  padding: $-size-side-padding;
  border-radius: $-radius-base;
  background: $-color-white;
}

// ❌ 不推荐
.my-component {
  color: #262626;
  font-size: 28rpx;
  padding: 30rpx;
  border-radius: 8rpx;
  background: #ffffff;
}
```

### 2. 使用 BEM 混合宏

```scss
// ✅ 推荐 - 使用混合宏
@include b(my-component) {
  display: flex;

  @include e(header) {
    padding: 20rpx;
  }

  @include e(content) {
    flex: 1;
  }

  @include m(large) {
    min-height: 200rpx;
  }

  @include when(active) {
    border-color: $-color-theme;
  }
}

// ❌ 不推荐 - 手写类名
.wd-my-component {
  display: flex;

  .wd-my-component__header {
    padding: 20rpx;
  }

  .wd-my-component__content {
    flex: 1;
  }

  &.wd-my-component--large {
    min-height: 200rpx;
  }
}
```

### 3. 响应式设计

使用 rpx 单位实现自动适配：

```scss
// ✅ 推荐 - 使用 rpx
.card {
  width: 100%;
  padding: 32rpx;
  margin: 24rpx 30rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
}

// 避免固定 px 值(特殊情况除外)
.icon {
  width: 48rpx;
  height: 48rpx;
  // 1px 边框可以使用 px
  border: 1px solid $-color-border;
}
```

### 4. 主题兼容性

同时考虑亮色和暗黑模式：

```scss
.my-component {
  // 亮色模式样式
  background: $-color-white;
  color: $-color-content;
  border-color: $-color-border-light;

  // 暗黑模式覆盖
  :global(.dark) & {
    background: $-dark-background2;
    color: $-dark-color;
    border-color: $-dark-border-color;
  }
}
```

### 5. 避免深层嵌套

```scss
// ✅ 推荐 - 扁平结构
@include b(card) {
  @include e(header) { }
  @include e(title) { }
  @include e(content) { }
  @include e(footer) { }
}

// ❌ 不推荐 - 深层嵌套
.card {
  .header {
    .title {
      .icon {
        // 嵌套过深，影响性能和可维护性
      }
    }
  }
}
```

### 6. 合理使用 CSS 变量

```scss
// ✅ 推荐 - 组件级别定义 CSS 变量
.product-card {
  // 定义局部变量
  --card-bg: #{$-color-white};
  --card-radius: 16rpx;
  --card-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  background: var(--card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);

  // 暗黑模式
  :global(.dark) & {
    --card-bg: #{$-dark-background2};
    --card-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
  }

  // 可以在外部覆盖
  &.highlight {
    --card-bg: #{$-color-theme}10;
  }
}
```

### 7. 性能优化

```scss
// ✅ 推荐 - 使用 transform 代替位置属性
.animated {
  transform: translateX(100rpx);
  transition: transform 0.3s;
}

// ❌ 不推荐 - 触发重排
.animated {
  left: 100rpx;
  transition: left 0.3s;
}

// ✅ 推荐 - 使用 will-change 优化动画
.slide-enter-active {
  will-change: transform, opacity;
  transition: all 0.3s;
}

// ✅ 推荐 - 避免通配符选择器
@include b(list) {
  @include e(item) { }
}

// ❌ 不推荐
.list * {
  margin: 0;
}
```

### 8. 代码组织

```scss
// 组件样式文件结构
// ============================================================
// 1. 导入依赖
// ============================================================
@import '../common/abstracts/variable';
@import '../common/abstracts/_mixin';

// ============================================================
// 2. 局部变量定义
// ============================================================
$-button-height-small: 56rpx;
$-button-height-medium: 80rpx;
$-button-height-large: 96rpx;

// ============================================================
// 3. Block 定义
// ============================================================
@include b(button) {
  // 3.1 基础样式
  display: inline-flex;

  // 3.2 Element 定义
  @include e(text) { }
  @include e(icon) { }

  // 3.3 Modifier 定义
  @include m(primary) { }
  @include m(success) { }

  // 3.4 尺寸变体
  @include m(small) { }
  @include m(large) { }

  // 3.5 状态定义
  @include when(disabled) { }
  @include when(loading) { }

  // 3.6 暗黑模式
  :global(.dark) & { }
}
```

## 常见问题

### 1. 样式不生效？

**问题原因:**
- 组件不支持 `custom-class` 属性
- 未正确使用 `:deep()` 穿透选择器
- 样式优先级不够
- 样式作用域问题(`scoped`)

**解决方案:**

```vue
<template>
  <!-- 确保组件支持 custom-class -->
  <wd-button custom-class="my-button">按钮</wd-button>
</template>

<style lang="scss">
// 方案 1: 使用 :deep() 穿透
.my-button {
  :deep(.wd-button__text) {
    color: red;
  }
}

// 方案 2: 使用 :global() 全局
:global(.wd-button.my-button) {
  background: blue;
}

// 方案 3: 不使用 scoped
</style>

<style lang="scss">
// 不带 scoped 的样式会全局生效
.my-button {
  background: blue;
}
</style>
```

### 2. 暗黑模式下样式异常？

**问题原因:**
- 使用了固定颜色值而非 CSS 变量
- 未添加暗黑模式覆盖样式

**解决方案:**

```scss
// ✅ 正确方式 - 使用 CSS 变量
.card {
  background: $-color-white;  // 使用变量
  color: $-color-content;

  :global(.dark) & {
    background: $-dark-background2;
    color: $-dark-color;
  }
}

// ❌ 错误方式 - 硬编码颜色
.card {
  background: #ffffff;  // 固定值不会自动切换
  color: #333333;
}
```

### 3. rpx 单位在 H5 端显示异常？

**问题原因:**
- H5 端 rpx 转换依赖配置
- 设计稿宽度配置不正确

**解决方案:**

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        // 配置 postcss-rpx-transform
        require('postcss-rpx-transform')({
          designWidth: 750,  // 设计稿宽度
        })
      ]
    }
  }
})
```

```json
// pages.json
{
  "globalStyle": {
    "rpxCalcMaxDeviceWidth": 750,
    "rpxCalcBaseDeviceWidth": 375
  }
}
```

### 4. 0.5px 边框显示为 1px？

**问题原因:**
- 设备不支持 0.5px
- transform 方案未正确应用

**解决方案:**

```scss
// 使用 transform 缩放方案
.cell {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: $-color-border-light;
    transform: scaleY(0.5);
    transform-origin: bottom;
  }
}

// 或使用混合宏
.cell {
  @include halfPixelBorder("bottom");
}
```

### 5. CSS 变量在小程序端不生效？

**问题原因:**
- 部分小程序基础库不支持 CSS 变量
- 变量作用域问题

**解决方案:**

```scss
// 提供降级方案
.button {
  // 降级值
  background: #4d80f0;
  // CSS 变量
  background: var(--wot-color-theme, #4d80f0);
}

// 或使用 SCSS 变量作为编译时值
.button {
  background: $-color-theme;  // SCSS 变量会编译为实际值
}
```

### 6. 样式隔离导致外部样式无法覆盖？

**问题原因:**
- Vue 组件使用了 `scoped` 或 `styleIsolation: 'isolated'`
- 小程序组件样式隔离

**解决方案:**

```vue
<!-- 组件定义时允许外部样式 -->
<script lang="ts" setup>
defineOptions({
  options: {
    styleIsolation: 'shared',  // 允许样式共享
    addGlobalClass: true       // 允许使用全局类
  }
})
</script>
```

### 7. 过渡动画卡顿？

**问题原因:**
- 动画属性触发重排
- 未使用硬件加速

**解决方案:**

```scss
// ✅ 使用 transform 和 opacity
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
  will-change: opacity, transform;  // 提前告知浏览器
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20rpx);
}

// ❌ 避免动画 width/height/top/left
.bad-animation {
  transition: width 0.3s, height 0.3s;  // 会触发重排
}
```

### 8. 安全区域适配问题？

**问题原因:**
- 未正确使用 `env()` 函数
- 不同平台兼容性问题

**解决方案:**

```scss
// 完整的安全区域适配
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  // iOS 11.0-11.2
  padding-bottom: constant(safe-area-inset-bottom);
  // iOS 11.2+
  padding-bottom: env(safe-area-inset-bottom);

  // 使用混合宏
  @include safeAreaBottom;
}

// 或使用 calc 添加额外间距
.with-extra-padding {
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
}
```

## 总结

样式架构核心要点：

| 要点 | 说明 |
|------|------|
| **BEM 命名** | 使用 `wd-` 前缀，`__` 连接元素，`--` 连接修饰符，`is-` 表示状态 |
| **变量系统** | 优先使用 SCSS 变量和 CSS 变量，保持一致性 |
| **混合宏** | 使用 `@include b/e/m/when` 定义组件样式 |
| **暗黑模式** | 使用 `:global(.dark)` 选择器覆盖样式 |
| **响应式** | 统一使用 rpx 单位，自动适配不同屏幕 |
| **样式覆盖** | 通过 CSS 变量、custom-class、custom-style 自定义 |
| **平台适配** | 使用条件编译处理平台差异 |
| **性能优化** | 使用 transform、避免深层嵌套、合理使用 will-change |
