# 移动端样式系统概览

## 介绍

RuoYi-Plus-UniApp 移动端采用了完善的样式系统架构,结合 UniApp 内置样式变量、WD UI 组件库样式体系和 SCSS 预处理器,为开发者提供了灵活、可定制、高度统一的样式解决方案。样式系统基于 BEM 命名规范,支持主题定制、CSS 变量、暗黑模式,并提供了丰富的混合宏和工具函数,大大提升了样式开发效率和代码可维护性。

**核心特性:**

- **双层变量体系** - UniApp 内置变量 + WD UI 自定义变量,提供 200+ 可配置样式变量
- **BEM 命名规范** - 采用 Block__Element--Modifier 命名方式,样式结构清晰易维护
- **CSS Variables 主题** - 基于 CSS 自定义属性实现主题切换,支持亮色/暗黑模式
- **SCSS 工具集** - 提供完整的混合宏和函数库,包括文本省略、边框、箭头等常用样式
- **响应式设计** - 使用 rpx 单位自适应不同屏幕尺寸
- **组件化样式** - 每个组件独立样式文件,支持按需加载和主题定制

样式系统为移动端提供了统一的视觉语言和开发规范,确保应用在不同平台(H5、小程序、App)上呈现一致的用户体验。通过 CSS 变量和 SCSS 预处理器的结合,开发者可以轻松实现主题切换、品牌定制和样式扩展。

## 样式架构

### 目录结构

```
plus-app/
├── style/
│   └── index.scss                    # 全局样式入口(主题定制)
├── uni.scss                          # UniApp 内置样式变量
└── wd/
    └── components/
        └── common/
            └── abstracts/
                ├── _config.scss      # BEM 命名配置
                ├── _function.scss    # SCSS 工具函数
                ├── _mixin.scss       # SCSS 混合宏
                └── variable.scss     # WD UI 样式变量(200+ 变量)
```

### 样式加载顺序

样式系统采用分层架构,按照以下顺序加载:

1. **UniApp 内置变量** (`uni.scss`) - 提供跨平台基础样式变量
2. **WD UI 配置** (`_config.scss`) - BEM 命名空间和分隔符配置
3. **WD UI 函数** (`_function.scss`) - 样式工具函数
4. **WD UI 混合宏** (`_mixin.scss`) - 可复用样式片段
5. **WD UI 变量** (`variable.scss`) - 组件样式变量定义
6. **全局样式** (`style/index.scss`) - 应用级样式定制
7. **组件样式** - 各组件独立样式文件

这种分层架构确保了样式的可维护性和可扩展性,同时避免了样式冲突和重复定义。

### 样式继承关系

```
uni.scss (UniApp 基础)
    ↓
_config.scss (BEM 配置)
    ↓
_function.scss (工具函数)
    ↓
_mixin.scss (混合宏,依赖 config 和 function)
    ↓
variable.scss (样式变量,依赖 function)
    ↓
组件样式 (使用 mixin 和 variable)
    ↓
应用样式 (style/index.scss,可覆盖变量)
```

## UniApp 内置样式变量

### 变量分类

UniApp 提供了一套完整的内置样式变量,位于 `uni.scss` 文件中,这些变量在整个项目中全局可用,无需导入即可使用。

#### 颜色变量

```scss
/* 行为相关颜色 */
$uni-color-primary: #007aff;      // 主题色
$uni-color-success: #4cd964;      // 成功色
$uni-color-warning: #f0ad4e;      // 警告色
$uni-color-error: #dd524d;        // 错误色

/* 文字基本颜色 */
$uni-text-color:#333;             // 基本色
$uni-text-color-inverse:#fff;     // 反色
$uni-text-color-grey:#999;        // 辅助灰色
$uni-text-color-placeholder: #808080;  // 占位文字
$uni-text-color-disable:#c0c0c0;  // 禁用文字

/* 背景颜色 */
$uni-bg-color:#ffffff;            // 主背景
$uni-bg-color-grey:#f8f8f8;       // 灰色背景
$uni-bg-color-hover:#f1f1f1;      // 点击状态
$uni-bg-color-mask:rgba(0, 0, 0, 0.4);  // 遮罩

/* 边框颜色 */
$uni-border-color:#c8c7cc;        // 边框色
```

**使用说明:**
- 这些变量在所有 SCSS 文件中自动可用
- 建议优先使用 UniApp 变量保持跨平台一致性
- 可以在 `uni.scss` 中修改变量值实现全局主题定制

#### 尺寸变量

```scss
/* 文字尺寸 */
$uni-font-size-sm: 12px;          // 小号字体
$uni-font-size-base: 14px;        // 基础字体
$uni-font-size-lg: 16px;          // 大号字体

/* 图片尺寸 */
$uni-img-size-sm: 20px;           // 小图标
$uni-img-size-base: 26px;         // 基础图标
$uni-img-size-lg: 40px;           // 大图标

/* 圆角尺寸 */
$uni-border-radius-sm: 2px;       // 小圆角
$uni-border-radius-base: 3px;     // 基础圆角
$uni-border-radius-lg: 6px;       // 大圆角
$uni-border-radius-circle: 50%;   // 圆形

/* 间距尺寸 */
$uni-spacing-row-sm: 5px;         // 水平小间距
$uni-spacing-row-base: 10px;      // 水平基础间距
$uni-spacing-row-lg: 15px;        // 水平大间距

$uni-spacing-col-sm: 4px;         // 垂直小间距
$uni-spacing-col-base: 8px;       // 垂直基础间距
$uni-spacing-col-lg: 12px;        // 垂直大间距

/* 透明度 */
$uni-opacity-disabled: 0.3;       // 禁用态透明度
```

**使用示例:**

```vue
<template>
  <view class="container">
    <text class="title">标题文字</text>
    <view class="button">按钮</view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: $uni-spacing-row-base $uni-spacing-col-base;
  background-color: $uni-bg-color;
}

.title {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-sm;
}

.button {
  padding: $uni-spacing-row-base $uni-spacing-col-lg;
  background-color: $uni-color-primary;
  color: $uni-text-color-inverse;
  border-radius: $uni-border-radius-base;

  &:hover {
    background-color: $uni-bg-color-hover;
  }
}
</style>
```

#### 文章场景变量

```scss
/* 文章相关颜色和尺寸 */
$uni-color-title: #2C405A;        // 文章标题颜色
$uni-font-size-title: 20px;       // 标题字号

$uni-color-subtitle: #555555;     // 二级标题颜色
$uni-font-size-subtitle: 26px;    // 二级标题字号

$uni-color-paragraph: #3F536E;    // 段落颜色
$uni-font-size-paragraph: 15px;   // 段落字号
```

**应用场景:**

这些变量专门为富文本、文章详情等内容型页面设计,提供了清晰的视觉层次:

```vue
<template>
  <view class="article">
    <text class="article-title">文章标题</text>
    <text class="article-subtitle">副标题</text>
    <text class="article-paragraph">
      文章内容段落文字...
    </text>
  </view>
</template>

<style lang="scss" scoped>
.article {
  padding: 32rpx;

  &-title {
    font-size: $uni-font-size-title;
    color: $uni-color-title;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  &-subtitle {
    font-size: $uni-font-size-subtitle;
    color: $uni-color-subtitle;
    margin-bottom: 24rpx;
  }

  &-paragraph {
    font-size: $uni-font-size-paragraph;
    color: $uni-color-paragraph;
    line-height: 1.6;
  }
}
</style>
```

### 变量定制

#### 全局定制

在 `uni.scss` 文件中修改变量值可实现全局主题定制:

```scss
/* 自定义主题色 */
$uni-color-primary: #1890ff;      // 改为蓝色主题
$uni-color-success: #52c41a;      // 改为绿色成功
$uni-color-warning: #faad14;      // 改为橙色警告
$uni-color-error: #f5222d;        // 改为红色错误

/* 自定义文字大小 */
$uni-font-size-base: 16px;        // 放大基础字号

/* 自定义圆角 */
$uni-border-radius-base: 8px;     // 增大圆角
```

#### 组件级定制

在具体组件中可以覆盖或组合使用这些变量:

```vue
<style lang="scss" scoped>
.custom-button {
  // 使用 UniApp 变量
  background-color: $uni-color-primary;
  color: $uni-text-color-inverse;

  // 组合使用
  padding: $uni-spacing-row-lg $uni-spacing-col-lg;
  border-radius: $uni-border-radius-lg;
  font-size: $uni-font-size-lg;

  // 覆盖定制
  &.large {
    padding: calc($uni-spacing-row-lg * 1.5) calc($uni-spacing-col-lg * 2);
    font-size: calc($uni-font-size-lg * 1.2);
  }
}
</style>
```

## WD UI 样式系统

### BEM 命名规范

WD UI 组件库采用 BEM(Block Element Modifier)命名规范,提供清晰的样式结构和良好的可维护性。

#### 配置定义

在 `_config.scss` 中定义了 BEM 命名规则:

```scss
$namespace: 'wd';                 // 命名空间
$elementSeparator: '__';          // 元素分隔符
$modifierSeparator: '--';         // 修饰符分隔符
$state-prefix: 'is-';             // 状态前缀
```

#### 命名结构

```
.wd-{block}                       // 块
.wd-{block}__{element}           // 元素
.wd-{block}--{modifier}          // 修饰符
.wd-{block}.is-{state}           // 状态
```

**实际示例:**

```scss
// 按钮组件
.wd-button { }                    // 块: 按钮
.wd-button__icon { }              // 元素: 按钮内的图标
.wd-button--primary { }           // 修饰符: 主要按钮类型
.wd-button.is-disabled { }        // 状态: 禁用状态
.wd-button.is-loading { }         // 状态: 加载状态

// 单元格组件
.wd-cell { }                      // 块: 单元格
.wd-cell__title { }               // 元素: 标题
.wd-cell__value { }               // 元素: 值
.wd-cell__label { }               // 元素: 描述
.wd-cell--large { }               // 修饰符: 大尺寸
.wd-cell.is-link { }              // 状态: 可点击链接
```

#### 混合宏使用

WD UI 提供了一套完整的 BEM 混合宏,简化样式编写:

```scss
// 定义块
@include b(button) {
  display: inline-flex;

  // 定义元素
  @include e(icon) {
    margin-right: 8rpx;
  }

  // 定义修饰符
  @include m(primary) {
    background-color: $-color-theme;
    color: $-color-white;
  }

  @include m(large) {
    height: $-button-large-height;
    font-size: $-button-large-fs;
  }

  // 定义状态
  @include when(disabled) {
    opacity: $-button-disabled-opacity;
    cursor: not-allowed;
  }

  @include when(loading) {
    pointer-events: none;
  }
}
```

**生成的 CSS:**

```css
.wd-button {
  display: inline-flex;
}

.wd-button__icon {
  margin-right: 8rpx;
}

.wd-button--primary {
  background-color: var(--wot-color-theme, #4d80f0);
  color: var(--wot-color-white, rgb(255, 255, 255));
}

.wd-button--large {
  height: var(--wot-button-large-height, 88rpx);
  font-size: var(--wot-button-large-fs, 32rpx);
}

.wd-button.is-disabled {
  opacity: var(--wot-button-disabled-opacity, 0.6);
  cursor: not-allowed;
}

.wd-button.is-loading {
  pointer-events: none;
}
```

#### 深度样式穿透

对于需要穿透 scoped 样式的场景,提供了 `edeep` 和 `mdeep` 混合宏:

```scss
@include b(popup) {
  // 普通元素定义
  @include e(container) {
    position: relative;
  }

  // 穿透样式定义
  @include edeep(content) {
    // 这里的样式会穿透 scoped
    padding: 32rpx;
  }

  // 穿透修饰符
  @include mdeep(center) {
    display: flex;
    justify-content: center;
  }
}
```

**生成的 CSS:**

```css
.wd-popup__container {
  position: relative;
}

:deep() .wd-popup__content {
  padding: 32rpx;
}

:deep() .wd-popup--center {
  display: flex;
  justify-content: center;
}
```

### 样式变量体系

WD UI 定义了 200+ 个样式变量,涵盖主题色、组件样式、尺寸间距等各个方面。所有变量都基于 CSS Variables 实现,支持动态主题切换。

#### 主题色变量

```scss
/* 主色调 */
$-color-theme: var(--wot-color-theme, #4d80f0);        // 主题色
$-color-white: var(--wot-color-white, rgb(255, 255, 255));  // 白色
$-color-black: var(--wot-color-black, rgb(0, 0, 0));   // 黑色

/* 辅助色 */
$-color-success: var(--wot-color-success, #34d19d);   // 成功色
$-color-warning: var(--wot-color-warning, #f0883a);   // 警告色
$-color-danger: var(--wot-color-danger, #fa4350);     // 危险色
$-color-purple: var(--wot-color-purple, #8268de);     // 紫色
$-color-yellow: var(--wot-color-yellow, #f0cd1d);     // 黄色
$-color-blue: var(--wot-color-blue, #2bb3ed);         // 蓝色
$-color-info: var(--wot-color-info, #909399);         // 信息色

/* 灰度色 */
$-color-gray-1: var(--wot-color-gray-1, #f9f9f9);     // 最浅
$-color-gray-2: var(--wot-color-gray-2, #f2f3f5);
$-color-gray-3: var(--wot-color-gray-3, #ebedf0);
$-color-gray-4: var(--wot-color-gray-4, #dcdee0);
$-color-gray-5: var(--wot-color-gray-5, #c8c9cc);
$-color-gray-6: var(--wot-color-gray-6, #969799);
$-color-gray-7: var(--wot-color-gray-7, #646566);
$-color-gray-8: var(--wot-color-gray-8, #323233);     // 最深
```

**使用示例:**

```vue
<template>
  <view class="card">
    <view class="card-header">标题</view>
    <view class="card-body">内容</view>
    <view class="card-footer">
      <view class="btn btn-primary">确定</view>
      <view class="btn btn-default">取消</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card {
  background: $-color-white;
  border: 1px solid $-color-gray-3;
  border-radius: 16rpx;

  &-header {
    padding: 32rpx;
    border-bottom: 1px solid $-color-gray-2;
    font-weight: 500;
  }

  &-body {
    padding: 32rpx;
    color: $-color-gray-7;
  }

  &-footer {
    padding: 24rpx 32rpx;
    display: flex;
    gap: 16rpx;
  }
}

.btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;

  &-primary {
    background: $-color-theme;
    color: $-color-white;
  }

  &-default {
    background: $-color-gray-2;
    color: $-color-gray-7;
  }
}
</style>
```

#### 文字颜色变量

```scss
/* 浅色背景下的文字颜色 */
$-color-title: var(--wot-color-title, #000);          // 标题/重要正文
$-color-content: var(--wot-color-content, #262626);   // 普通正文
$-color-secondary: var(--wot-color-secondary, #595959);  // 次要信息
$-color-aid: var(--wot-color-aid, #8c8c8c);           // 辅助文字
$-color-tip: var(--wot-color-tip, #bfbfbf);           // 失效/默认提示
$-color-border: var(--wot-color-border, #d9d9d9);     // 边框线
$-color-border-light: var(--wot-color-border-light, #e8e8e8);  // 分割线
$-color-bg: var(--wot-color-bg, #f5f5f5);             // 背景色

/* 透明度文字颜色 */
$-font-gray-1: var(--wot-font-gray-1, rgba(0, 0, 0, 0.9));    // 主要文字
$-font-gray-2: var(--wot-font-gray-2, rgba(0, 0, 0, 0.6));    // 次要文字
$-font-gray-3: var(--wot-font-gray-3, rgba(0, 0, 0, 0.4));    // 辅助文字
$-font-gray-4: var(--wot-font-gray-4, rgba(0, 0, 0, 0.26));   // 禁用文字

$-font-white-1: var(--wot-font-white-1, rgba(255, 255, 255, 1));     // 白色主要
$-font-white-2: var(--wot-font-white-2, rgba(255, 255, 255, 0.55));  // 白色次要
$-font-white-3: var(--wot-font-white-3, rgba(255, 255, 255, 0.35));  // 白色辅助
$-font-white-4: var(--wot-font-white-4, rgba(255, 255, 255, 0.22));  // 白色禁用
```

**应用场景:**

```vue
<template>
  <view class="info-card">
    <text class="title">这是标题文字</text>
    <text class="content">这是普通正文内容</text>
    <text class="secondary">这是次要信息文字</text>
    <text class="aid">这是辅助引导文字</text>
    <text class="tip">这是失效提示文字</text>
  </view>
</template>

<style lang="scss" scoped>
.info-card {
  padding: 32rpx;
  background: $-color-white;

  text {
    display: block;
    margin-bottom: 16rpx;
  }

  .title {
    font-size: 32rpx;
    color: $-color-title;          // rgba(0, 0, 0, 1) 或 #000
    font-weight: 600;
  }

  .content {
    font-size: 28rpx;
    color: $-color-content;        // #262626
    line-height: 1.5;
  }

  .secondary {
    font-size: 28rpx;
    color: $-color-secondary;      // #595959
  }

  .aid {
    font-size: 24rpx;
    color: $-color-aid;            // #8c8c8c
  }

  .tip {
    font-size: 24rpx;
    color: $-color-tip;            // #bfbfbf
  }
}
</style>
```

#### 暗黑模式变量

```scss
/* 暗黑模式颜色 */
$-dark-background: var(--wot-dark-background, #131313);       // 主背景
$-dark-background2: var(--wot-dark-background2, #1b1b1b);     // 次背景
$-dark-background3: var(--wot-dark-background3, #141414);     // 三级背景
$-dark-background4: var(--wot-dark-background4, #323233);     // 四级背景
$-dark-background5: var(--wot-dark-background5, #646566);     // 五级背景
$-dark-background6: var(--wot-dark-background6, #380e08);     // 危险背景
$-dark-background7: var(--wot-dark-background7, #707070);     // 禁用背景

$-dark-color: var(--wot-dark-color, $-color-white);           // 主文字色
$-dark-color2: var(--wot-dark-color2, #f2270c);              // 强调色
$-dark-color3: var(--wot-dark-color3, rgba(232, 230, 227, 0.8));  // 次要文字
$-dark-color-gray: var(--wot-dark-color-gray, $-color-secondary);  // 灰色文字
$-dark-border-color: var(--wot-dark-border-color, #3a3a3c);  // 边框色
```

**暗黑模式适配示例:**

```vue
<template>
  <view class="theme-card" :class="{ 'is-dark': isDark }">
    <view class="card-bg">背景层</view>
    <text class="card-text">文字内容</text>
    <view class="card-border">边框</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
</script>

<style lang="scss" scoped>
.theme-card {
  padding: 32rpx;
  background: $-color-white;
  color: $-color-title;
  border: 1px solid $-color-border;

  // 暗黑模式样式
  &.is-dark {
    background: $-dark-background;
    color: $-dark-color;
    border-color: $-dark-border-color;

    .card-bg {
      background: $-dark-background2;
    }

    .card-text {
      color: $-dark-color3;
    }
  }
}

.card-bg {
  padding: 24rpx;
  background: $-color-bg;
  margin-bottom: 16rpx;
}

.card-text {
  font-size: 28rpx;
  color: $-color-content;
  margin-bottom: 16rpx;
}

.card-border {
  padding: 16rpx;
  border: 1px solid $-color-border;
}
</style>
```

#### 字体变量

```scss
/* 文字字号 */
$-fs-big: var(--wot-fs-big, 48rpx);               // 大型标题
$-fs-important: var(--wot-fs-important, 38rpx);   // 重要数据
$-fs-title: var(--wot-fs-title, 32rpx);           // 标题/重要正文
$-fs-content: var(--wot-fs-content, 28rpx);       // 普通正文
$-fs-secondary: var(--wot-fs-secondary, 24rpx);   // 次要信息
$-fs-aid: var(--wot-fs-aid, 20rpx);               // 辅助文字

/* 文字字重 */
$-fw-medium: var(--wot-fw-medium, 500);           // PingFangSC-Medium
$-fw-semibold: var(--wot-fw-semibold, 600);       // PingFangSC-Semibold
```

**字体使用示例:**

```vue
<template>
  <view class="typography">
    <text class="big-title">大型标题 48rpx</text>
    <text class="important">重要数据 38rpx</text>
    <text class="title">标题文字 32rpx</text>
    <text class="content">正文内容 28rpx</text>
    <text class="secondary">次要信息 24rpx</text>
    <text class="aid">辅助文字 20rpx</text>
  </view>
</template>

<style lang="scss" scoped>
.typography {
  padding: 32rpx;

  text {
    display: block;
    margin-bottom: 24rpx;
  }

  .big-title {
    font-size: $-fs-big;
    font-weight: $-fw-semibold;
    color: $-color-title;
  }

  .important {
    font-size: $-fs-important;
    font-weight: $-fw-medium;
    color: $-color-theme;
  }

  .title {
    font-size: $-fs-title;
    font-weight: $-fw-medium;
    color: $-color-title;
  }

  .content {
    font-size: $-fs-content;
    color: $-color-content;
    line-height: 1.5;
  }

  .secondary {
    font-size: $-fs-secondary;
    color: $-color-secondary;
  }

  .aid {
    font-size: $-fs-aid;
    color: $-color-aid;
  }
}
</style>
```

#### 尺寸变量

```scss
/* 通用尺寸 */
$-size-side-padding: var(--wot-size-side-padding, 30rpx);              // 屏幕两边留白
$-size-side-padding-small: var(--wot-size-side-padding-small, 12rpx);  // 小留白
```

这些尺寸变量用于保持应用的整体一致性:

```vue
<template>
  <view class="page">
    <view class="section">
      <text class="section-title">标准间距示例</text>
      <view class="content">
        内容区域使用标准边距
      </view>
    </view>

    <view class="compact-section">
      <text class="section-title">紧凑间距示例</text>
      <view class="content">
        内容区域使用紧凑边距
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $-color-bg;
}

.section {
  // 使用标准边距
  padding: 32rpx $-size-side-padding;
  background: $-color-white;
  margin-bottom: 20rpx;

  .section-title {
    font-size: $-fs-title;
    font-weight: $-fw-medium;
    color: $-color-title;
    margin-bottom: 16rpx;
  }

  .content {
    font-size: $-fs-content;
    color: $-color-content;
    line-height: 1.5;
  }
}

.compact-section {
  // 使用紧凑边距
  padding: 24rpx $-size-side-padding-small;
  background: $-color-white;

  .section-title {
    font-size: $-fs-content;
    color: $-color-title;
    margin-bottom: 12rpx;
  }

  .content {
    font-size: $-fs-secondary;
    color: $-color-secondary;
    line-height: 1.4;
  }
}
</style>
```

#### 组件变量

WD UI 为每个组件都定义了专属的样式变量,以 Button 按钮组件为例:

```scss
/* Button 按钮变量 */
$-button-disabled-opacity: var(--wot-button-disabled-opacity, 0.6);
$-button-small-height: var(--wot-button-small-height, 48rpx);
$-button-small-padding: var(--wot-button-small-padding, 0 24rpx);
$-button-small-fs: var(--wot-button-small-fs, $-fs-secondary);
$-button-small-radius: var(--wot-button-small-radius, 4rpx);
$-button-small-loading: var(--wot-button-small-loading, 28rpx);

$-button-medium-height: var(--wot-button-medium-height, 72rpx);
$-button-medium-padding: var(--wot-button-medium-padding, 0 32rpx);
$-button-medium-fs: var(--wot-button-medium-fs, $-fs-content);
$-button-medium-radius: var(--wot-button-medium-radius, 8rpx);
$-button-medium-loading: var(--wot-button-medium-loading, 36rpx);

$-button-large-height: var(--wot-button-large-height, 88rpx);
$-button-large-padding: var(--wot-button-large-padding, 0 72rpx);
$-button-large-fs: var(--wot-button-large-fs, $-fs-title);
$-button-large-radius: var(--wot-button-large-radius, 16rpx);
$-button-large-loading: var(--wot-button-large-loading, 48rpx);

$-button-primary-color: var(--wot-button-primary-color, $-color-white);
$-button-primary-bg-color: var(--wot-button-primary-bg-color, $-color-theme);
$-button-success-color: var(--wot-button-success-color, $-color-white);
$-button-success-bg-color: var(--wot-button-success-bg-color, $-color-success);
$-button-warning-color: var(--wot-button-warning-color, $-color-white);
$-button-warning-bg-color: var(--wot-button-warning-bg-color, $-color-warning);
$-button-error-color: var(--wot-button-error-color, $-color-white);
$-button-error-bg-color: var(--wot-button-error-bg-color, $-color-danger);
```

每个组件都有类似的变量定义,详细列表请参考 `variable.scss` 文件。

### SCSS 混合宏

WD UI 提供了一套完善的 SCSS 混合宏,简化常用样式的编写。

#### BEM 混合宏

```scss
/**
 * Block - 定义块
 */
@include b(card) {
  background: white;
}
// 生成: .wd-card { background: white; }

/**
 * Element - 定义元素
 */
@include b(card) {
  @include e(header) {
    padding: 16rpx;
  }
  @include e(body) {
    padding: 32rpx;
  }
}
// 生成:
// .wd-card__header { padding: 16rpx; }
// .wd-card__body { padding: 32rpx; }

/**
 * Modifier - 定义修饰符
 */
@include b(card) {
  @include m(shadow) {
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  }
  @include m(bordered) {
    border: 1px solid #eee;
  }
}
// 生成:
// .wd-card--shadow { box-shadow: ...; }
// .wd-card--bordered { border: ...; }

/**
 * When - 定义状态
 */
@include b(card) {
  @include when(disabled) {
    opacity: 0.6;
  }
  @include when(active) {
    transform: scale(0.98);
  }
}
// 生成:
// .wd-card.is-disabled { opacity: 0.6; }
// .wd-card.is-active { transform: scale(0.98); }
```

**组合使用示例:**

```scss
@include b(list-item) {
  display: flex;
  padding: 24rpx 32rpx;
  background: $-color-white;

  // 元素: 图标
  @include e(icon) {
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
  }

  // 元素: 内容
  @include e(content) {
    flex: 1;

    @include e(title) {
      font-size: $-fs-content;
      color: $-color-title;
    }

    @include e(desc) {
      font-size: $-fs-secondary;
      color: $-color-secondary;
      margin-top: 8rpx;
    }
  }

  // 元素: 箭头
  @include e(arrow) {
    width: 24rpx;
    height: 24rpx;
    color: $-color-border;
  }

  // 修饰符: 大尺寸
  @include m(large) {
    padding: 32rpx;

    @include me(icon) {
      width: 64rpx;
      height: 64rpx;
    }
  }

  // 状态: 禁用
  @include when(disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // 状态: 活动
  @include when(active) {
    background: $-color-gray-1;
  }
}
```

生成的 CSS 结构:

```css
.wd-list-item { display: flex; padding: 24rpx 32rpx; background: #fff; }
.wd-list-item__icon { width: 48rpx; height: 48rpx; margin-right: 16rpx; }
.wd-list-item__content { flex: 1; }
.wd-list-item__content__title { font-size: 28rpx; color: #000; }
.wd-list-item__content__desc { font-size: 24rpx; color: #595959; margin-top: 8rpx; }
.wd-list-item__arrow { width: 24rpx; height: 24rpx; color: #d9d9d9; }
.wd-list-item--large { padding: 32rpx; }
.wd-list-item--large .wd-list-item__icon { width: 64rpx; height: 64rpx; }
.wd-list-item.is-disabled { opacity: 0.5; cursor: not-allowed; }
.wd-list-item.is-active { background: #f9f9f9; }
```

#### 文本处理混合宏

```scss
/**
 * 单行文本省略
 */
@mixin lineEllipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 使用示例
.title {
  @include lineEllipsis;
  max-width: 200rpx;
}

/**
 * 多行文本省略
 * @param {number} $lineNumber - 显示行数,默认 3
 */
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
  @include multiEllipsis(2);  // 显示 2 行
}

.content {
  @include multiEllipsis(5);  // 显示 5 行
}
```

**实际应用:**

```vue
<template>
  <view class="card-list">
    <view class="card-item">
      <text class="card-title">这是一个很长的标题文字会被截断显示省略号</text>
      <text class="card-desc">
        这是一段很长的描述文字内容,
        超过两行会被截断并显示省略号,
        用户可以通过点击查看完整内容
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card-item {
  padding: 24rpx;
  background: $-color-white;
  margin-bottom: 16rpx;
}

.card-title {
  display: block;
  font-size: $-fs-title;
  color: $-color-title;
  margin-bottom: 12rpx;

  // 单行省略
  @include lineEllipsis;
}

.card-desc {
  display: block;
  font-size: $-fs-content;
  color: $-color-content;
  line-height: 1.5;

  // 两行省略
  @include multiEllipsis(2);
}
</style>
```

#### 边框混合宏

```scss
/**
 * 0.5px 边框 - 指定方向
 * @param {string} $direction - 方向: "top" | "bottom"
 * @param {size} $left - 左侧偏移量
 * @param {color} $color - 边框颜色
 */
@mixin halfPixelBorder($direction: "bottom", $left: 0, $color: $-color-border-light) {
  position: relative;

  &::after {
    position: absolute;
    display: block;
    content: "";
    width: calc(100% - #{$left});
    height: 1px;
    left: $left;
    background: $color;
    transform: scaleY(0.5);

    @if ($direction == "bottom") {
      bottom: 0;
    } @else {
      top: 0;
    }
  }
}

/**
 * 0.5px 边框 - 环绕
 * @param {color} $color - 边框颜色
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

```vue
<template>
  <view class="list">
    <view class="list-item">底部 0.5px 边框</view>
    <view class="list-item">底部 0.5px 边框</view>
    <view class="bordered-box">环绕 0.5px 边框</view>
  </view>
</template>

<style lang="scss" scoped>
.list-item {
  padding: 32rpx;
  background: $-color-white;

  // 底部边框,左侧偏移 32rpx
  @include halfPixelBorder("bottom", 32rpx, $-color-border-light);
}

.bordered-box {
  margin: 32rpx;
  padding: 32rpx;
  background: $-color-white;
  border-radius: 16rpx;

  // 四周环绕边框
  @include halfPixelBorderSurround($-color-border);
}
</style>
```

#### 其他实用混合宏

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

/**
 * 清除按钮默认样式
 */
@mixin buttonClear {
  outline: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  background: transparent;
}

// 使用示例
button {
  @include buttonClear;
  // 自定义按钮样式
  padding: 16rpx 32rpx;
  border: 1px solid $-color-theme;
  color: $-color-theme;
}
```

#### 箭头混合宏

```scss
/**
 * 三角形箭头(适用于透明背景)
 * @param {size} $size - 三角形高度,底边为 $size * 2
 * @param {color} $bg - 三角形背景颜色
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
    bottom: calc(-1 * #{$size});
  }

  @include e(arrow-up) {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-bottom: $size solid $bg;
    transform: translateX(-50%);
    top: calc(-1 * #{$size});
  }

  @include e(arrow-left) {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-right: $size solid $bg;
    transform: translateY(-50%);
    left: calc(-1 * #{$size});
  }

  @include e(arrow-right) {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-left: $size solid $bg;
    transform: translateY(-50%);
    right: calc(-1 * #{$size});
  }
}

/**
 * 正方形箭头(适用于不透明背景)
 * @param {size} $size - 正方形边长
 * @param {color} $bg - 正方形背景颜色
 * @param {number} $z-index - z-index 属性值
 * @param {shadow} $box-shadow - 阴影
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
      bottom: calc(-1 * #{$size} / 2);
      transform: rotateZ(45deg);
      box-shadow: $box-shadow;
    }
  }

  // arrow-up, arrow-left, arrow-right 类似...
}
```

**箭头使用示例:**

```vue
<template>
  <view class="tooltip">
    <view class="tooltip-content">提示内容</view>
    <view class="tooltip__arrow-down"></view>
  </view>
</template>

<style lang="scss" scoped>
@include b(tooltip) {
  position: relative;
  padding: 16rpx 24rpx;
  background: $-color-gray-8;
  color: $-color-white;
  border-radius: 8rpx;

  // 生成三角形箭头
  @include triangleArrow(12rpx, $-color-gray-8);
}

// 使用时只需添加对应类名
// <view class="tooltip__arrow-down"></view>  向下箭头
// <view class="tooltip__arrow-up"></view>    向上箭头
// <view class="tooltip__arrow-left"></view>  向左箭头
// <view class="tooltip__arrow-right"></view> 向右箭头
</style>
```

### SCSS 工具函数

WD UI 提供了一套工具函数用于样式计算和主题处理。

#### 字符串处理函数

```scss
/**
 * 将选择器转换为字符串
 */
@function selectorToString($selector) {
  $selector: inspect($selector);
  $selector: str-slice($selector, 2, -2);
  @return $selector;
}

/**
 * 判断选择器是否包含修饰符
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
 * 判断选择器是否包含伪类
 */
@function containsPseudo($selector) {
  $selector: selectorToString($selector);
  @if str-index($selector, ':') {
    @return true;
  } @else {
    @return false;
  }
}
```

这些函数主要用于 BEM 混合宏的内部实现,一般不需要直接使用。

#### 主题色函数

```scss
/**
 * 主题色变换
 * @param {color} $theme-color - 主题色
 * @param {string} $type - 变暗 'dark' 或变亮 'light'
 * @param {color} $mix-color - 自定义混色
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
 * 渐变色生成
 * @param {angle} $deg - 渐变角度
 * @param {color} $theme-color - 主题色
 * @param {list} $set - 明暗设置列表
 * @param {list} $color-list - 渐变色列表
 * @param {list} $per-list - 渐变位置列表
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

**主题色函数使用示例:**

```scss
// 定义主题色
$primary-color: #4d80f0;

.button {
  background: $primary-color;

  &:hover {
    // 变暗 10%
    background: themeColor($primary-color, "dark");
  }

  &.light {
    // 变亮 10%
    background: themeColor($primary-color, "light");
  }
}

// 渐变按钮
.gradient-button {
  background: resultColor(
    90deg,                           // 渐变角度
    $primary-color,                  // 主题色
    ("", "light"),                   // 明暗设置
    (#667eea, #764ba2),             // 渐变色
    (0%, 100%)                       // 位置
  );
}
```

## 主题定制

### CSS Variables 定制

WD UI 所有样式变量都基于 CSS Variables 实现,可以在运行时动态修改主题。

#### 全局主题定制

在 `style/index.scss` 中定义全局主题变量:

```scss
:root,
page {
  // 修改主题色
  --wot-color-theme: #1890ff;

  // 修改成功色
  --wot-color-success: #52c41a;

  // 修改警告色
  --wot-color-warning: #faad14;

  // 修改危险色
  --wot-color-danger: #f5222d;

  // 修改按钮相关
  --wot-button-primary-bg-color: #1890ff;
  --wot-button-large-height: 96rpx;
  --wot-button-large-radius: 48rpx;

  // 修改字体大小
  --wot-fs-title: 36rpx;
  --wot-fs-content: 30rpx;
}
```

#### 组件级定制

可以为特定组件实例定义自定义样式:

```vue
<template>
  <wd-button class="custom-button" type="primary">
    自定义按钮
  </wd-button>
</template>

<style lang="scss" scoped>
.custom-button {
  // 仅修改这个按钮的样式
  --wot-button-primary-bg-color: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  --wot-button-large-height: 100rpx;
  --wot-button-large-radius: 50rpx;
}
</style>
```

#### 动态主题切换

通过 JavaScript 动态修改 CSS Variables:

```vue
<template>
  <view class="theme-demo">
    <view class="theme-buttons">
      <button @click="setTheme('blue')">蓝色主题</button>
      <button @click="setTheme('green')">绿色主题</button>
      <button @click="setTheme('purple')">紫色主题</button>
    </view>

    <view class="demo-content">
      <wd-button type="primary">主题按钮</wd-button>
      <wd-badge :value="10">徽标</wd-badge>
    </view>
  </view>
</template>

<script lang="ts" setup>
const themes = {
  blue: {
    '--wot-color-theme': '#1890ff',
    '--wot-color-success': '#52c41a'
  },
  green: {
    '--wot-color-theme': '#52c41a',
    '--wot-color-success': '#1890ff'
  },
  purple: {
    '--wot-color-theme': '#722ed1',
    '--wot-color-success': '#eb2f96'
  }
}

const setTheme = (themeName: 'blue' | 'green' | 'purple') => {
  const theme = themes[themeName]
  const root = document.documentElement || document.querySelector('page')

  Object.keys(theme).forEach(key => {
    root.style.setProperty(key, theme[key])
  })
}
</script>
```

### 暗黑模式支持

WD UI 内置了暗黑模式支持,通过切换类名即可启用暗黑模式。

#### 暗黑模式配置

```vue
<template>
  <view :class="{ 'dark-mode': isDark }">
    <view class="page-content">
      <!-- 页面内容 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
}
</script>

<style lang="scss" scoped>
.page-content {
  background: $-color-white;
  color: $-color-title;

  // 暗黑模式样式
  .dark-mode & {
    background: $-dark-background;
    color: $-dark-color;
  }
}
</style>
```

#### 暗黑模式 CSS Variables

也可以通过 CSS Variables 实现暗黑模式:

```scss
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
  --border-color: #e8e8e8;
}

// 暗黑模式变量
.dark-mode {
  --bg-color: #131313;
  --text-color: #ffffff;
  --border-color: #3a3a3c;
}

// 使用变量
.container {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
```

## 响应式设计

### rpx 单位

RuoYi-Plus-UniApp 移动端统一使用 `rpx` 单位实现响应式布局。`rpx` 是 UniApp 提供的响应式单位,会根据屏幕宽度自动计算。

**rpx 计算规则:**
- 设计稿基准: 750rpx = 屏幕宽度
- iPhone6 (375px): 1rpx = 0.5px
- iPhone6 Plus (414px): 1rpx = 0.552px

**使用示例:**

```vue
<template>
  <view class="responsive-box">
    <view class="box-header">
      <text class="title">响应式标题</text>
    </view>
    <view class="box-body">
      <text class="content">响应式内容区域</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.responsive-box {
  width: 750rpx;                    // 满屏宽度
  padding: 32rpx;                   // 内边距
  background: $-color-white;
}

.box-header {
  height: 88rpx;                    // 固定高度
  padding: 0 32rpx;
  border-bottom: 1px solid $-color-border-light;

  .title {
    font-size: 32rpx;               // 字体大小
    line-height: 88rpx;
  }
}

.box-body {
  padding: 24rpx 32rpx;

  .content {
    font-size: 28rpx;
    line-height: 1.5;
  }
}
</style>
```

### 屏幕尺寸适配

对于不同尺寸的设备,可以使用条件编译或媒体查询:

```vue
<style lang="scss" scoped>
.container {
  padding: 32rpx;

  // 平板尺寸
  @media screen and (min-width: 768px) {
    padding: 64rpx;
    max-width: 1200rpx;
    margin: 0 auto;
  }

  // 大屏幕
  @media screen and (min-width: 1024px) {
    padding: 96rpx;
  }
}

// 使用条件编译
.platform-box {
  width: 750rpx;

  // #ifdef H5
  max-width: 750px;
  margin: 0 auto;
  // #endif

  // #ifdef MP-WEIXIN
  width: 100%;
  // #endif
}
</style>
```

### 安全区域适配

针对刘海屏、底部导航栏等特殊区域的适配:

```vue
<template>
  <view class="page">
    <view class="safe-area-top"></view>
    <view class="content">
      <!-- 页面内容 -->
    </view>
    <view class="safe-area-bottom"></view>
  </view>
</template>

<style lang="scss" scoped>
.safe-area-top {
  height: constant(safe-area-inset-top);    // iOS 11.2+
  height: env(safe-area-inset-top);         // iOS 11.2+
}

.safe-area-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}

// 或使用 padding
.page {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
```

## 最佳实践

### 1. 优先使用设计变量

始终优先使用预定义的设计变量,而不是硬编码数值:

**❌ 不推荐:**
```vue
<style lang="scss" scoped>
.text {
  font-size: 28rpx;
  color: #262626;
  margin-bottom: 16rpx;
}
</style>
```

**✅ 推荐:**
```vue
<style lang="scss" scoped>
.text {
  font-size: $-fs-content;
  color: $-color-content;
  margin-bottom: 16rpx;
}
</style>
```

### 2. 遵循 BEM 命名规范

保持样式结构清晰,使用 BEM 命名:

**❌ 不推荐:**
```vue
<template>
  <view class="card">
    <view class="header">
      <text class="title">标题</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card { }
.header { }      // 太通用,易冲突
.title { }       // 太通用,易冲突
</style>
```

**✅ 推荐:**
```vue
<template>
  <view class="product-card">
    <view class="product-card__header">
      <text class="product-card__title">标题</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@include b(product-card) {
  padding: 32rpx;

  @include e(header) {
    margin-bottom: 16rpx;
  }

  @include e(title) {
    font-size: $-fs-title;
    color: $-color-title;
  }
}
</style>
```

### 3. 合理使用混合宏

对于常用样式,使用混合宏避免重复代码:

**❌ 不推荐:**
```vue
<style lang="scss" scoped>
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

**✅ 推荐:**
```vue
<style lang="scss" scoped>
.title {
  @include lineEllipsis;
  font-size: $-fs-title;
}

.subtitle {
  @include lineEllipsis;
  font-size: $-fs-content;
}
</style>
```

### 4. 组件样式隔离

始终使用 `scoped` 避免样式污染:

```vue
<style lang="scss" scoped>
// 这些样式只在当前组件生效
.container {
  padding: 32rpx;
}
</style>
```

### 5. 性能优化

避免过深的选择器嵌套,保持样式简洁:

**❌ 不推荐:**
```vue
<style lang="scss" scoped>
.page {
  .container {
    .content {
      .item {
        .title {
          .text {
            color: red;  // 6 层嵌套
          }
        }
      }
    }
  }
}
</style>
```

**✅ 推荐:**
```vue
<style lang="scss" scoped>
.page-container { }

.content-item { }

.item-title {
  .text {
    color: red;  // 2 层嵌套
  }
}
</style>
```

### 6. 主题定制集中管理

将主题定制集中在 `style/index.scss` 中:

```scss
// style/index.scss
:root,
page {
  // 品牌色定制
  --wot-color-theme: #1890ff;
  --wot-color-success: #52c41a;
  --wot-color-warning: #faad14;
  --wot-color-danger: #f5222d;

  // 字体定制
  --wot-fs-big: 52rpx;
  --wot-fs-title: 36rpx;
  --wot-fs-content: 30rpx;

  // 圆角定制
  --wot-button-large-radius: 48rpx;
  --wot-button-medium-radius: 24rpx;
}
```

### 7. 响应式图片

使用 `mode` 属性正确处理图片显示:

```vue
<template>
  <view class="image-container">
    <!-- 保持比例,完整显示 -->
    <image src="..." mode="aspectFit" class="image-fit" />

    <!-- 保持比例,填充容器 -->
    <image src="..." mode="aspectFill" class="image-fill" />

    <!-- 裁剪居中 -->
    <image src="..." mode="scaleToFill" class="image-scale" />
  </view>
</template>

<style lang="scss" scoped>
.image-container {
  width: 750rpx;
  height: 400rpx;
}

.image-fit,
.image-fill,
.image-scale {
  width: 100%;
  height: 100%;
}
</style>
```

## 常见问题

### 1. 样式不生效

**问题原因:**
- 选择器权重不够
- 样式被覆盖
- `scoped` 作用域限制
- 变量未导入

**解决方案:**

```vue
<template>
  <view class="custom-button">
    <wd-button>按钮</wd-button>
  </view>
</template>

<style lang="scss" scoped>
// 方案 1: 提高选择器权重
.custom-button {
  :deep(.wd-button) {
    background: red;
  }
}

// 方案 2: 使用 !important (不推荐)
.custom-button :deep(.wd-button) {
  background: red !important;
}

// 方案 3: 使用 CSS Variables
.custom-button {
  --wot-button-primary-bg-color: red;
}
</style>
```

### 2. rpx 和 px 混用问题

**问题原因:**
- 混用导致不同设备显示不一致
- 边框使用 rpx 可能出现模糊

**解决方案:**

```vue
<style lang="scss" scoped>
.container {
  // ✅ 布局、间距、字体使用 rpx
  width: 750rpx;
  padding: 32rpx;
  font-size: 28rpx;

  // ✅ 边框使用 px 或 1px
  border: 1px solid $-color-border;

  // ❌ 避免边框使用 rpx
  // border: 2rpx solid $-color-border;  // 可能模糊
}
</style>
```

### 3. 暗黑模式适配不完整

**问题原因:**
- 部分颜色硬编码
- 未使用暗黑模式变量
- 图片未适配暗黑模式

**解决方案:**

```vue
<template>
  <view :class="{ 'dark-mode': isDark }">
    <view class="card">
      <image
        :src="isDark ? darkLogo : lightLogo"
        class="logo"
      />
      <text class="title">标题</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
const lightLogo = '/static/logo-light.png'
const darkLogo = '/static/logo-dark.png'
</script>

<style lang="scss" scoped>
.card {
  // ✅ 使用变量
  background: $-color-white;
  color: $-color-title;
  border: 1px solid $-color-border;

  // ❌ 避免硬编码
  // background: #ffffff;
  // color: #000000;

  // 暗黑模式
  .dark-mode & {
    background: $-dark-background;
    color: $-dark-color;
    border-color: $-dark-border-color;
  }
}
</style>
```

### 4. 样式变量修改不生效

**问题原因:**
- 修改了 SCSS 变量而不是 CSS 变量
- 变量作用域问题
- 缓存未清除

**解决方案:**

```vue
<style lang="scss" scoped>
// ❌ 错误: 修改 SCSS 变量(编译时固定)
// $-color-theme: red;

// ✅ 正确: 修改 CSS 变量(运行时可变)
.custom-component {
  --wot-color-theme: red;
  --wot-button-primary-bg-color: red;
}

// 或在全局修改
:root {
  --wot-color-theme: red;
}
</style>
```

### 5. 1px 边框在不同设备显示粗细不一

**问题原因:**
- 不同设备像素比不同
- 未使用 `hairline` 或 `transform: scaleY(0.5)`

**解决方案:**

```vue
<style lang="scss" scoped>
.border-box {
  // 方案 1: 使用混合宏
  @include halfPixelBorder("bottom", 0, $-color-border);
}

.border-box-2 {
  // 方案 2: 手动实现
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: $-color-border;
    transform: scaleY(0.5);
  }
}

.border-box-3 {
  // 方案 3: 使用 1px(在高清屏上可能较粗)
  border-bottom: 1px solid $-color-border;
}
</style>
```

### 6. 组件样式穿透不生效

**问题原因:**
- Vue 3 中 `/deep/` 和 `>>>` 已废弃
- 未正确使用 `:deep()`

**解决方案:**

```vue
<template>
  <view class="wrapper">
    <wd-button class="custom-btn">按钮</wd-button>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  // ✅ Vue 3 正确写法
  :deep(.wd-button) {
    background: red;
  }

  // ❌ Vue 2 写法(已废弃)
  // /deep/ .wd-button { }
  // >>> .wd-button { }
}

// 或使用 WD UI 的深度混合宏
@include b(wrapper) {
  @include edeep(button) {
    background: red;
  }
}
</style>
```

---

通过本文档,你应该已经全面了解了 RuoYi-Plus-UniApp 移动端的样式系统架构、使用方法和最佳实践。样式系统提供了完善的设计变量、BEM 命名规范、SCSS 工具集和主题定制能力,能够满足各种样式开发需求。在实际开发中,遵循最佳实践,合理使用样式变量和混合宏,可以大大提升开发效率和代码可维护性。
