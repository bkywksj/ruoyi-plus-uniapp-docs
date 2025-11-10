# 样式架构

## 介绍

RuoYi-Plus-UniApp 前端项目采用了模块化、分层的 SCSS 架构设计,构建了一个可维护、可扩展的样式系统。整个样式架构遵循 ITCSS(倒三角CSS)方法论,将样式按照特异性从低到高进行分层组织,确保了样式的可预测性和可维护性。

**核心特性:**

- **八层架构设计** - 从外部库、抽象层、主题层、基础层、布局层、组件层、供应商层到动画层,形成清晰的层级结构
- **SCSS 模块化** - 使用 SCSS 预处理器,支持变量、混合宏、嵌套、继承等高级特性
- **主题系统集成** - 与 CSS 变量主题系统无缝集成,支持亮色/暗色模式动态切换
- **组件库定制** - 深度定制 Element Plus 组件库样式,提供现代化的视觉体验
- **响应式设计** - 内置响应式断点系统,支持多种设备屏幕适配
- **可复用混合宏** - 提供丰富的 SCSS 混合宏库,简化常见样式模式的编写
- **渐进增强** - 采用移动优先策略,逐步增强大屏幕体验

## 架构概览

### 目录结构

整个样式系统位于 `src/assets/styles/` 目录下,按照功能和特异性进行分层组织:

```
src/assets/styles/
├── abstracts/              # 抽象层 - 变量和混合宏
│   ├── _variables.scss     # SCSS 变量定义
│   └── _mixins.scss        # 可复用混合宏
├── base/                   # 基础层 - 基础样式
│   ├── _reset.scss         # 浏览器样式重置
│   └── _typography.scss    # 排版系统
├── themes/                 # 主题层 - 主题变量
│   ├── _light.scss         # 亮色主题
│   └── _dark.scss          # 暗色主题
├── layout/                 # 布局层 - 布局结构
│   └── _layout.scss        # 应用布局样式
├── components/             # 组件层 - 组件样式
│   ├── _buttons.scss       # 按钮组件
│   └── _animations.scss    # 动画效果
├── vendors/                # 供应商层 - 第三方库覆盖
│   └── _element-plus.scss  # Element Plus 定制
├── main.scss               # 主入口文件
└── theme-animation.scss    # 主题切换动画
```

### 八层架构

样式系统采用八层架构,每一层都有明确的职责和作用范围:

#### 1. 外部库层 (External Libraries)

导入第三方 CSS 库和框架,如 normalize.css、Element Plus 等。这些样式不受项目直接控制,但为整个样式系统提供基础。

**特点:**
- 最低特异性
- 提供浏览器一致性
- 不应被修改,只能通过覆盖层调整

#### 2. 抽象层 (Abstracts)

定义 SCSS 变量、函数和混合宏,不产生任何 CSS 输出。这一层是整个样式系统的"工具箱"。

**包含内容:**
- SCSS 变量 (`$primary-color`, `$font-size-base` 等)
- 混合宏 (mixins)
- 函数 (functions)
- 占位符选择器 (placeholders)

**设计原则:**
- 只定义,不输出
- 可在任何层级引用
- 保持语义化命名

#### 3. 主题层 (Themes)

定义 CSS 自定义属性(CSS Variables),实现动态主题切换功能。与抽象层不同,主题层会输出 CSS。

**核心功能:**
- 定义亮色/暗色主题变量
- 支持运行时动态切换
- 与 CSS 变量系统集成

#### 4. 基础层 (Base)

提供最基本的 HTML 元素样式,包括浏览器重置和排版系统。

**包含内容:**
- 浏览器样式重置
- HTML 元素默认样式
- 排版规则(标题、段落、链接等)
- 全局盒模型设置

**特点:**
- 使用元素选择器
- 无 class 选择器
- 建立视觉基线

#### 5. 布局层 (Layout)

定义页面整体布局结构,如网格系统、容器、侧边栏、头部等主要布局组件。

**核心布局:**
- 应用容器 (App Container)
- 侧边栏系统 (Sidebar)
- 头部导航 (Header/TopNav)
- 主内容区域 (Main Content)
- 响应式布局

#### 6. 组件层 (Components)

定义具体的 UI 组件样式,如按钮、卡片、表单等。

**特点:**
- 使用 class 选择器
- 可复用的 UI 模块
- 遵循 BEM 命名规范
- 支持修饰符和状态

#### 7. 供应商层 (Vendors)

覆盖和定制第三方组件库样式,主要是 Element Plus 组件库的深度定制。

**定制范围:**
- Element Plus 所有组件
- 响应式优化
- 主题变量映射
- 视觉风格统一

#### 8. 动画层 (Animations)

定义全局动画效果,如主题切换动画、过渡效果等。

**包含内容:**
- 关键帧动画 (@keyframes)
- 过渡效果 (transitions)
- 特殊视觉效果

## 抽象层详解

### 混合宏库

抽象层提供了丰富的混合宏,简化常见样式模式的编写。

#### clearfix 混合宏

清除浮动,解决父元素高度塌陷问题:

```scss
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 使用示例
.container {
  @include clearfix;
}
```

**应用场景:**
- 浮动布局的容器元素
- 需要撑开父元素高度的场景

#### 响应式断点混合宏

提供移动优先的响应式断点系统:

```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: 576px) { @content; }
  } @else if $breakpoint == 'md' {
    @media (min-width: 768px) { @content; }
  } @else if $breakpoint == 'lg' {
    @media (min-width: 992px) { @content; }
  } @else if $breakpoint == 'xl' {
    @media (min-width: 1200px) { @content; }
  }
}

// 使用示例
.sidebar {
  width: 100%;

  @include respond-to('md') {
    width: 200px;
  }

  @include respond-to('lg') {
    width: 250px;
  }
}
```

**断点定义:**
- `sm`: 576px - 小型设备(横屏手机)
- `md`: 768px - 中型设备(平板)
- `lg`: 992px - 大型设备(桌面显示器)
- `xl`: 1200px - 超大型设备(大屏显示器)

**使用原则:**
- 采用移动优先策略
- 基础样式适配小屏幕
- 通过断点逐步增强大屏幕体验

#### 自定义滚动条混合宏

美化浏览器滚动条样式:

```scss
@mixin scrollbar($width: 8px, $thumb-bg: rgba(144, 147, 153, 0.3), $track-bg: transparent) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }

  &::-webkit-scrollbar-thumb {
    background: $thumb-bg;
    border-radius: 4px;

    &:hover {
      background: rgba(144, 147, 153, 0.5);
    }
  }

  &::-webkit-scrollbar-track {
    background: $track-bg;
  }
}

// 使用示例
.scrollable-content {
  overflow-y: auto;
  @include scrollbar(6px, rgba(0, 0, 0, 0.2));
}
```

**参数说明:**
- `$width`: 滚动条宽度,默认 8px
- `$thumb-bg`: 滑块背景色,默认半透明灰色
- `$track-bg`: 轨道背景色,默认透明

**主题集成:**
滚动条样式与主题系统集成,在暗色模式下自动调整颜色:

```scss
.dark .scrollable-content {
  @include scrollbar(6px, rgba(255, 255, 255, 0.2));
}
```

#### 百分比居中混合宏

使用百分比宽度实现水平居中:

```scss
@mixin pct($pct) {
  width: $pct;
  margin-left: (100% - $pct) / 2;
  margin-right: (100% - $pct) / 2;
}

// 使用示例
.centered-box {
  @include pct(80%);
}
```

**应用场景:**
- 固定宽度比例的容器
- 响应式居中布局

#### CSS 三角形混合宏

使用 border 属性生成纯 CSS 三角形:

```scss
@mixin triangle($width, $height, $color, $direction) {
  width: 0;
  height: 0;
  border-style: solid;

  @if $direction == 'up' {
    border-width: 0 ($width / 2) $height ($width / 2);
    border-color: transparent transparent $color transparent;
  } @else if $direction == 'down' {
    border-width: $height ($width / 2) 0 ($width / 2);
    border-color: $color transparent transparent transparent;
  } @else if $direction == 'left' {
    border-width: ($height / 2) $width ($height / 2) 0;
    border-color: transparent $color transparent transparent;
  } @else if $direction == 'right' {
    border-width: ($height / 2) 0 ($height / 2) $width;
    border-color: transparent transparent transparent $color;
  }
}

// 使用示例
.dropdown-arrow {
  @include triangle(10px, 6px, #333, 'down');
}
```

**参数说明:**
- `$width`: 三角形宽度
- `$height`: 三角形高度
- `$color`: 三角形颜色
- `$direction`: 方向('up', 'down', 'left', 'right')

**应用场景:**
- 下拉菜单箭头
- 工具提示指示器
- 排序指示器

#### 卡片样式混合宏

提供统一的卡片容器样式:

```scss
@mixin card-style {
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

// 使用示例
.info-card {
  @include card-style;
  padding: 20px;
}
```

**主题集成:**
卡片样式使用 CSS 变量,自动适配亮色/暗色主题:

- `var(--bg-level-1)`: 一级背景色
- `var(--border-color)`: 边框颜色
- 阴影颜色在暗色模式下自动调整

#### 按钮基础混合宏

提供按钮组件的基础样式:

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
  transition: all 0.3s ease;
  user-select: none;

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// 使用示例
.custom-button {
  @include button-base;
  background: var(--primary-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--primary-color-hover);
  }
}
```

**设计原则:**
- 使用 flexbox 布局
- 统一的内边距和圆角
- 禁用状态样式
- 过渡动画效果

## 基础层详解

### 浏览器样式重置

基础层提供了浏览器样式重置,消除不同浏览器之间的默认样式差异。

#### 全局盒模型

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**作用:**
- 统一盒模型为 `border-box`
- padding 和 border 不再增加元素总宽度
- 简化布局计算

#### HTML 和 body 基础样式

```scss
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--text-color-primary);
  background: var(--bg-base);
}
```

**主题变量集成:**
- `--font-family`: 字体族(包含中英文字体栈)
- `--font-size-base`: 基础字号(14px)
- `--text-color-primary`: 主要文本颜色
- `--bg-base`: 基础背景色

#### 链接样式重置

```scss
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-color-hover);
  }

  &:focus {
    outline: none;
  }
}
```

**交互设计:**
- 默认使用主题色
- hover 状态变为悬停色
- 移除焦点轮廓(通过其他方式提供可访问性反馈)

#### 列表样式重置

```scss
ul,
ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
```

**应用场景:**
- 导航菜单
- 数据列表
- 任何非语义化的列表结构

### 排版系统

排版系统定义了文本元素的视觉层次和阅读体验。

#### 标题层次

```scss
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 16px 0;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color-primary);
}

h1 {
  font-size: 32px;
}

h2 {
  font-size: 28px;
}

h3 {
  font-size: 24px;
}

h4 {
  font-size: 20px;
}

h5 {
  font-size: 16px;
}

h6 {
  font-size: 14px;
}
```

**设计规则:**
- 六级标题层次清晰
- 统一的下边距(16px)
- 使用中等字重(600)
- 行高优化阅读体验

**响应式调整:**

```scss
@media (max-width: 768px) {
  h1 { font-size: 28px; }
  h2 { font-size: 24px; }
  h3 { font-size: 20px; }
  h4 { font-size: 18px; }
}
```

#### 段落样式

```scss
p {
  margin: 0 0 16px 0;
  line-height: 1.8;
  color: var(--text-color-regular);
}
```

**阅读体验优化:**
- 较大的行高(1.8)提升可读性
- 使用常规文本颜色(略浅于标题)
- 统一的段落间距

#### 代码块样式

```scss
code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  padding: 2px 6px;
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  color: var(--text-color-danger);
}

pre {
  margin: 0 0 16px 0;
  padding: 16px;
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow-x: auto;

  code {
    padding: 0;
    background: none;
    border: none;
    color: inherit;
  }
}
```

**设计特点:**
- 使用等宽字体
- 内联代码和代码块样式区分
- 主题色适配
- 代码块支持横向滚动

## 布局层详解

### 应用容器结构

布局层定义了整个应用的基础布局架构。

#### 主容器

```scss
#app {
  height: 100vh;
  overflow: hidden;
}

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}
```

**设计原则:**
- 固定视口高度
- 防止整体页面滚动
- 提供相对定位上下文

#### 容器布局模式

项目支持两种主要布局模式:

**1. 侧边栏布局 (Sidebar Layout)**

```scss
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 200px;
  background: var(--bg-level-1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 1001;
  overflow-x: hidden;
  overflow-y: auto;
}

.main-container {
  min-height: 100vh;
  margin-left: 200px;
  transition: margin-left 0.3s ease;
  background: var(--bg-base);
}
```

**布局特点:**
- 侧边栏固定定位
- 主内容区域自适应
- 平滑过渡动画

**2. 顶部导航布局 (TopNav Layout)**

```scss
.top-nav-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: var(--bg-level-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1001;
}

.main-container {
  padding-top: 50px;
  min-height: 100vh;
}
```

### 侧边栏系统

侧边栏是左侧导航布局的核心组件,支持展开/收起、多级菜单、响应式等特性。

#### 展开状态

```scss
.sidebar-container {
  width: 200px;

  .sidebar-logo {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 16px;

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .logo-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color-primary);
    }
  }
}
```

**设计要素:**
- 固定宽度 200px
- Logo 区域高度 50px
- 品牌标识和名称显示

#### 收起状态

```scss
.sidebar-container.is-collapse {
  width: 64px;

  .sidebar-logo {
    padding: 0;
    justify-content: center;

    .logo-title {
      display: none;
    }
  }

  .el-menu {
    .el-menu-item,
    .el-sub-menu__title {
      padding: 0 !important;
      text-align: center;

      span {
        display: none;
      }
    }
  }
}
```

**收起状态特性:**
- 宽度缩小至 64px
- 只显示图标,隐藏文字
- Logo 居中显示
- 菜单项居中对齐

#### 菜单样式

```scss
.el-menu {
  border: none;
  background: transparent;

  .el-menu-item,
  .el-sub-menu__title {
    height: 48px;
    line-height: 48px;
    padding: 0 16px;
    color: var(--text-color-regular);
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-level-2);
      color: var(--primary-color);
    }

    &.is-active {
      background: var(--primary-color-light);
      color: var(--primary-color);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--primary-color);
      }
    }
  }

  .el-icon {
    margin-right: 8px;
    width: 20px;
    text-align: center;
  }
}
```

**交互设计:**
- 统一菜单项高度(48px)
- hover 状态背景变化
- 激活状态左侧高亮条
- 图标和文字对齐

#### 多级菜单

```scss
.el-sub-menu {
  .el-menu {
    background: var(--bg-level-2);

    .el-menu-item {
      padding-left: 48px !important;
      background: transparent;

      &:hover {
        background: var(--bg-level-3);
      }

      &.is-active {
        background: var(--primary-color-light);
      }
    }
  }

  // 三级菜单
  .el-sub-menu {
    .el-menu-item {
      padding-left: 64px !important;
    }
  }
}
```

**层级视觉:**
- 子菜单背景加深
- 逐级缩进(一级16px,二级48px,三级64px)
- 保持一致的交互状态

### 头部导航

#### 固定头部

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
}
```

**布局特性:**
- 粘性定位
- 固定高度 50px
- 底部阴影分隔
- flexbox 水平布局

#### 头部组件

```scss
.navbar {
  .hamburger-container {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s ease;

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

      .name {
        margin-left: 8px;
        font-size: 14px;
        color: var(--text-color-primary);
      }
    }
  }
}
```

**组件布局:**
- 左侧折叠按钮
- 中间面包屑导航(flex: 1 自动填充)
- 右侧用户信息和操作区

### 响应式布局

#### 移动端适配

```scss
@media (max-width: 768px) {
  .sidebar-container {
    transform: translateX(-100%);
    width: 200px;

    &.is-open {
      transform: translateX(0);
    }
  }

  .main-container {
    margin-left: 0;
  }

  // 遮罩层
  .sidebar-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: none;

    &.is-visible {
      display: block;
    }
  }
}
```

**移动端特性:**
- 侧边栏默认隐藏(向左移出视口)
- 点击按钮滑入侧边栏
- 显示半透明遮罩层
- 点击遮罩关闭侧边栏

#### 平板适配

```scss
@media (min-width: 768px) and (max-width: 992px) {
  .sidebar-container {
    width: 64px;

    &:hover {
      width: 200px;
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
    }
  }

  .main-container {
    margin-left: 64px;
  }
}
```

**平板特性:**
- 默认显示收起状态(64px)
- hover 时临时展开至 200px
- 增强阴影效果提示临时状态

## 组件层详解

### 按钮组件样式

组件层提供了丰富的按钮样式变体和交互效果。

#### 彩色按钮混合宏

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
.btn-primary {
  @include colorBtn(#409eff);
}

.btn-success {
  @include colorBtn(#67c23a);
}

.btn-danger {
  @include colorBtn(#f56c6c);
}
```

**混合宏参数:**
- `$color`: 按钮主题色

**状态变化:**
- hover: 颜色变亮 5%
- active: 颜色变暗 5%
- focus: 显示主题色光晕

#### 边框动画按钮

```scss
.pan-btn {
  position: relative;
  display: inline-block;
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

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}
```

**视觉效果:**
- 渐变背景
- hover 时光效从左向右扫过
- 轻微上浮效果
- 增强阴影

#### 自定义按钮基类

```scss
.custom-button {
  @include button-base;
  position: relative;
  overflow: hidden;

  // 波纹效果容器
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

**交互效果:**
- Material Design 风格波纹效果
- 点击时从点击位置扩散
- 使用绝对定位和动画实现

### 动画效果

#### 淡入淡出

```scss
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-enter-active {
  animation: fade-in 0.3s ease;
}

.fade-leave-active {
  animation: fade-out 0.3s ease;
}
```

#### 滑动效果

```scss
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

#### 缩放效果

```scss
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scale-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
}
```

## 供应商层详解

供应商层专门用于定制 Element Plus 组件库样式,提供现代化、一致的视觉体验。

### 分页组件定制

```scss
.el-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;

  .el-pager {
    .number {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      padding: 0;
      margin: 0 4px;
      border-radius: 4px;
      font-size: 14px;
      color: var(--text-color-regular);
      background: transparent;
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
  }

  .btn-prev,
  .btn-next {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: transparent;
    color: var(--text-color-regular);
    transition: all 0.3s ease;

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

**现代化设计:**
- 圆角按钮(4px)
- 统一尺寸(32x32px)
- 激活状态使用主题色填充
- 平滑过渡动画
- 禁用状态视觉反馈

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

  // 主要按钮
  &--primary {
    background: var(--primary-color);
    border-color: var(--primary-color);

    &:hover,
    &:focus {
      background: var(--primary-color-hover);
      border-color: var(--primary-color-hover);
    }

    &:active {
      background: var(--primary-color-active);
      border-color: var(--primary-color-active);
    }
  }

  // 成功按钮
  &--success {
    background: var(--success-color);
    border-color: var(--success-color);

    &:hover,
    &:focus {
      background: var(--success-color-hover);
      border-color: var(--success-color-hover);
    }
  }

  // 危险按钮
  &--danger {
    background: var(--danger-color);
    border-color: var(--danger-color);

    &:hover,
    &:focus {
      background: var(--danger-color-hover);
      border-color: var(--danger-color-hover);
    }
  }

  // 禁用状态
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &::after {
      display: none;
    }
  }
}
```

**增强特性:**
- 点击波纹效果
- 主题色集成
- 多种状态样式
- 禁用状态优化

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
      color: var(--text-color-primary);
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 24px;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      transition: background 0.3s ease;

      &:hover {
        background: var(--bg-level-2);
      }

      .el-dialog__close {
        color: var(--text-color-secondary);
        font-size: 18px;
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
    color: var(--text-color-regular);
    font-size: 14px;
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

// 遮罩层
.el-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

**视觉优化:**
- 大圆角(12px)
- 深度阴影增强层次感
- 头部和底部分隔线
- 关闭按钮 hover 效果
- 遮罩层模糊效果

### 消息提示定制

```scss
.el-message {
  min-width: 300px;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--bg-level-1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border-color);

  .el-message__icon {
    font-size: 20px;
    margin-right: 12px;
  }

  .el-message__content {
    font-size: 14px;
    color: var(--text-color-primary);
    line-height: 1.5;
  }

  &--success {
    border-left: 4px solid var(--success-color);

    .el-message__icon {
      color: var(--success-color);
    }
  }

  &--warning {
    border-left: 4px solid var(--warning-color);

    .el-message__icon {
      color: var(--warning-color);
    }
  }

  &--error {
    border-left: 4px solid var(--danger-color);

    .el-message__icon {
      color: var(--danger-color);
    }
  }

  &--info {
    border-left: 4px solid var(--info-color);

    .el-message__icon {
      color: var(--info-color);
    }
  }
}
```

**设计特点:**
- 左侧彩色边框指示类型
- 增强阴影提升层级
- 图标和文字对齐
- 主题色集成

### 下拉菜单定制

```scss
.el-dropdown-menu {
  padding: 8px 0;
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  .el-dropdown-menu__item {
    padding: 10px 16px;
    font-size: 14px;
    color: var(--text-color-regular);
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-level-2);
      color: var(--primary-color);
    }

    &.is-disabled {
      color: var(--text-color-disabled);
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }

  .el-dropdown-menu__item--divided {
    margin-top: 8px;
    border-top: 1px solid var(--border-color);
  }
}
```

**现代化设计:**
- 圆角菜单(8px)
- 分组分隔线
- 图标和文字对齐
- hover 状态突出
- 禁用项视觉区分

### 选择器定制

```scss
.el-select {
  .el-select__wrapper {
    background: var(--bg-level-1);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color-light);
    }

    &.is-focused {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
    }
  }

  .el-select__placeholder {
    color: var(--text-color-placeholder);
  }

  .el-select__caret {
    color: var(--text-color-secondary);
    transition: transform 0.3s ease;

    &.is-reverse {
      transform: rotate(180deg);
    }
  }
}

// 下拉面板
.el-select-dropdown {
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-top: 8px;

  .el-select-dropdown__item {
    padding: 10px 16px;
    font-size: 14px;
    color: var(--text-color-regular);
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-level-2);
    }

    &.is-selected {
      color: var(--primary-color);
      font-weight: 600;
      background: var(--primary-color-light);
    }

    &.is-disabled {
      color: var(--text-color-disabled);
      cursor: not-allowed;
    }
  }
}
```

**交互优化:**
- 焦点状态光晕效果
- 箭头旋转动画
- 选中项高亮
- 下拉面板与输入框分离

### 表格组件定制

```scss
.el-table {
  background: transparent;
  color: var(--text-color-regular);

  // 表头
  .el-table__header-wrapper {
    .el-table__header {
      th {
        background: var(--bg-level-2);
        color: var(--text-color-primary);
        font-weight: 600;
        font-size: 14px;
        border-bottom: 2px solid var(--border-color);
        padding: 12px 0;

        &:first-child {
          border-top-left-radius: 8px;
        }

        &:last-child {
          border-top-right-radius: 8px;
        }
      }
    }
  }

  // 表体
  .el-table__body-wrapper {
    .el-table__body {
      tr {
        background: var(--bg-level-1);
        transition: background 0.3s ease;

        &:hover {
          background: var(--bg-level-2);
        }

        td {
          border-bottom: 1px solid var(--border-color);
          padding: 12px 0;
          font-size: 14px;
        }
      }

      // 斑马纹
      tr.el-table__row--striped {
        background: var(--bg-level-1);

        &:hover {
          background: var(--bg-level-2);
        }
      }
    }
  }

  // 空数据
  .el-table__empty-block {
    background: var(--bg-level-1);

    .el-table__empty-text {
      color: var(--text-color-secondary);
      font-size: 14px;
    }
  }

  // 固定列阴影
  .el-table__fixed,
  .el-table__fixed-right {
    &::before {
      background: transparent;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 10px;
      pointer-events: none;
    }
  }

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

**视觉增强:**
- 表头圆角和加粗
- hover 行高亮
- 固定列阴影效果
- 主题色集成
- 空数据状态优化

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
    transition: background 0.3s ease;

    &:hover {
      background: rgba(144, 147, 153, 0.5);
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

// 暗色模式滚动条
.dark {
  * {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// Element Plus 滚动条组件
.el-scrollbar {
  .el-scrollbar__bar {
    &.is-vertical {
      right: 2px;
      width: 6px;

      .el-scrollbar__thumb {
        background: rgba(144, 147, 153, 0.3);
        border-radius: 3px;

        &:hover {
          background: rgba(144, 147, 153, 0.5);
        }
      }
    }

    &.is-horizontal {
      bottom: 2px;
      height: 6px;

      .el-scrollbar__thumb {
        background: rgba(144, 147, 153, 0.3);
        border-radius: 3px;

        &:hover {
          background: rgba(144, 147, 153, 0.5);
        }
      }
    }
  }
}
```

**统一美化:**
- 细滚动条(8px/6px)
- 圆角设计
- hover 状态加深
- 暗色模式适配

### 移动端响应式

```scss
@media (max-width: 768px) {
  // 对话框
  .el-dialog {
    width: 90% !important;
    margin: 0 auto;

    .el-dialog__header {
      padding: 16px;
    }

    .el-dialog__body {
      padding: 16px;
    }

    .el-dialog__footer {
      padding: 12px 16px;
    }
  }

  // 表格
  .el-table {
    font-size: 12px;

    .el-table__header-wrapper th,
    .el-table__body-wrapper td {
      padding: 8px 0;
    }
  }

  // 分页
  .el-pagination {
    flex-wrap: wrap;
    justify-content: center;

    .el-pager .number {
      min-width: 28px;
      height: 28px;
      line-height: 28px;
      font-size: 12px;
    }
  }

  // 表单
  .el-form {
    .el-form-item {
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
}
```

**移动端适配:**
- 对话框宽度适配
- 表格字号缩小
- 分页组件换行
- 表单标签垂直布局

## 主题动画层

### 主题切换动画

主题切换动画使用 View Transition API 实现从点击位置扩散的圆形切换效果。

#### 动画样式定义

```scss
// 动画时长
$theme-animation-duration: 0.5s;

html {
  // View Transition 样式 - 禁用默认动画
  &::view-transition-old(root),
  &::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  // 亮色模式 -> 暗黑模式: 新层(暗黑)从圆心扩散
  &::view-transition-new(root) {
    animation: theme-clip-in $theme-animation-duration ease-in both;
    z-index: 9999;
  }

  &::view-transition-old(root) {
    z-index: 1;
  }

  // 暗黑模式 -> 亮色模式: 旧层(暗黑)从外向圆心收缩
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
```

#### 关键帧动画

```scss
// 圆形扩散动画 (从小到大)
@keyframes theme-clip-in {
  from {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }

  to {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
}

// 圆形收缩动画 (从大到小)
@keyframes theme-clip-out {
  from {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }

  to {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }
}
```

#### 动画变量

主题切换动画依赖三个 CSS 变量,由 TypeScript 工具函数在点击时动态设置:

- `--theme-x`: 点击位置 X 坐标
- `--theme-y`: 点击位置 Y 坐标
- `--theme-r`: 扩散圆半径(从点击位置到视窗最远角的距离)

**使用示例:**

```typescript
// 在主题切换按钮的点击事件中
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

  // 执行主题切换(使用 View Transition API)
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      toggleDarkMode()
    })
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

在 `main.scss` 中按照特异性从低到高的顺序导入样式模块:

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

// 8. 动画层(全局动画)
@import './theme-animation';
```

**导入原则:**
- 低特异性在前,高特异性在后
- 抽象层优先导入,供其他层使用
- 主题层在基础层之前,确保 CSS 变量可用
- 供应商层在最后,确保能覆盖其他样式

### 命名规范

#### BEM 命名法

组件样式采用 BEM (Block Element Modifier) 命名法:

```scss
// Block: 块级元素
.card { }

// Element: 元素(使用双下划线)
.card__header { }
.card__body { }
.card__footer { }

// Modifier: 修饰符(使用双连字符)
.card--primary { }
.card--large { }
.card__header--sticky { }
```

**BEM 优势:**
- 命名语义化,一目了然
- 避免样式冲突
- 提高可维护性
- 便于团队协作

#### 状态类命名

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

#### 工具类命名

使用简短的功能性命名:

```scss
// 间距
.mt-8 { margin-top: 8px; }
.mb-16 { margin-bottom: 16px; }
.p-20 { padding: 20px; }

// 文本
.text-center { text-align: center; }
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 布局
.flex { display: flex; }
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 变量使用策略

#### CSS 变量 vs SCSS 变量

**CSS 变量(推荐用于主题相关):**

```scss
// 优势: 运行时可修改,支持动态主题
.component {
  color: var(--text-color-primary);
  background: var(--bg-level-1);
}
```

**SCSS 变量(用于编译时常量):**

```scss
// 优势: 编译时计算,性能更好
$border-radius-base: 4px;
$box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.08);

.card {
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
}
```

**选择原则:**
- 主题相关(颜色、字号等): 使用 CSS 变量
- 布局常量(间距、圆角、阴影等): 使用 SCSS 变量
- 需要计算的值: 使用 SCSS 变量和函数

#### 变量作用域

```scss
// 全局变量
:root {
  --primary-color: #409eff;
  --text-color-primary: #303133;
}

// 组件作用域变量
.card {
  --card-padding: 20px;
  --card-border-radius: 8px;

  padding: var(--card-padding);
  border-radius: var(--card-border-radius);
}
```

### 嵌套规则

#### 嵌套深度限制

避免过深的嵌套(建议不超过 3 层):

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

// ✅ 推荐 - 扁平化
.sidebar { }
.sidebar__menu { }
.sidebar__menu-item { }
.sidebar__menu-link { }
.sidebar__menu-icon { }
```

#### 伪类和伪元素嵌套

```scss
.button {
  // 伪类
  &:hover { }
  &:focus { }
  &:active { }
  &:disabled { }

  // 伪元素
  &::before { }
  &::after { }

  // 修饰符
  &--primary { }
  &--large { }
}
```

### 响应式设计策略

#### 移动优先

```scss
// ✅ 推荐 - 移动优先
.container {
  width: 100%;              // 基础样式(移动端)
  padding: 16px;

  @include respond-to('md') {
    width: 750px;          // 平板
    padding: 24px;
  }

  @include respond-to('lg') {
    width: 970px;          // 桌面
    padding: 32px;
  }

  @include respond-to('xl') {
    width: 1170px;         // 大屏
  }
}

// ❌ 不推荐 - 桌面优先
.container {
  width: 1170px;

  @media (max-width: 992px) {
    width: 970px;
  }

  @media (max-width: 768px) {
    width: 750px;
  }

  @media (max-width: 576px) {
    width: 100%;
  }
}
```

#### 断点管理

使用混合宏统一管理断点,避免硬编码:

```scss
// ✅ 推荐
.sidebar {
  @include respond-to('md') {
    width: 200px;
  }
}

// ❌ 不推荐
.sidebar {
  @media (min-width: 768px) {
    width: 200px;
  }
}
```

### 性能优化

#### 避免昂贵的选择器

```scss
// ❌ 避免使用通配符和标签选择器
* {
  margin: 0;
}

div {
  box-sizing: border-box;
}

// ✅ 使用类选择器
.reset-margin {
  margin: 0;
}

.box-border {
  box-sizing: border-box;
}
```

#### 合理使用继承

```scss
// 使用占位符选择器避免输出未使用的样式
%button-base {
  display: inline-flex;
  padding: 8px 16px;
  border-radius: 4px;
}

.primary-button {
  @extend %button-base;
  background: var(--primary-color);
}

.secondary-button {
  @extend %button-base;
  background: var(--secondary-color);
}
```

#### 减少重绘和回流

```scss
// ✅ 使用 transform 而不是 left/top
.animated-box {
  transform: translateX(100px);  // GPU 加速
  transition: transform 0.3s;
}

// ❌ 避免
.animated-box {
  left: 100px;                   // 触发回流
  transition: left 0.3s;
}
```

## 维护指南

### 添加新组件样式

1. **确定组件层级**
   - 布局组件 → `layout/`
   - UI 组件 → `components/`
   - 第三方库覆盖 → `vendors/`

2. **创建样式文件**
   ```bash
   # 例如: 添加卡片组件
   touch src/assets/styles/components/_cards.scss
   ```

3. **编写组件样式**
   ```scss
   // components/_cards.scss
   .card {
     @include card-style;

     &__header {
       padding: 16px 20px;
       border-bottom: 1px solid var(--border-color);
     }

     &__body {
       padding: 20px;
     }

     &__footer {
       padding: 12px 20px;
       border-top: 1px solid var(--border-color);
     }

     // 修饰符
     &--bordered {
       border: 1px solid var(--border-color);
     }

     &--shadow {
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
     }
   }
   ```

4. **在 main.scss 中导入**
   ```scss
   // main.scss
   @import './components/cards';
   ```

### 添加新的混合宏

1. **在抽象层添加混合宏**
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

2. **在组件中使用**
   ```scss
   .component {
     @include flex-center;

     .title {
       @include text-ellipsis(2);
     }
   }
   ```

### 定制 Element Plus 组件

1. **在供应商层添加覆盖样式**
   ```scss
   // vendors/_element-plus.scss
   .el-custom-component {
     // 覆盖默认样式
     background: var(--bg-level-1);

     // 添加新状态
     &.is-custom-state {
       border-color: var(--primary-color);
     }

     // 响应式适配
     @include respond-to('md') {
       padding: 20px;
     }
   }
   ```

2. **使用深度选择器(必要时)**
   ```scss
   .my-component {
     // 使用 :deep() 穿透组件样式隔离
     :deep(.el-input__inner) {
       border-radius: 8px;
     }
   }
   ```

### 主题扩展

1. **添加新的主题变量**
   ```scss
   // themes/_light.scss
   :root {
     // 新增自定义颜色
     --custom-color-1: #ff6b6b;
     --custom-color-2: #4ecdc4;

     // 新增语义化颜色
     --text-color-link: #1890ff;
     --text-color-code: #ff4757;
   }

   // themes/_dark.scss
   .dark {
     --custom-color-1: #ff8787;
     --custom-color-2: #6ce5db;

     --text-color-link: #40a9ff;
     --text-color-code: #ff6b81;
   }
   ```

2. **在组件中使用新变量**
   ```scss
   .custom-component {
     color: var(--custom-color-1);

     a {
       color: var(--text-color-link);
     }

     code {
       color: var(--text-color-code);
     }
   }
   ```

### 样式调试技巧

#### 使用开发者工具

```scss
// 添加调试边框
.debug {
  * {
    outline: 1px solid red;
  }
}

// 添加网格背景
.debug-grid {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

#### 响应式调试

```scss
// 显示当前断点
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

  @include respond-to('sm') {
    content: 'sm';
  }

  @include respond-to('md') {
    content: 'md';
  }

  @include respond-to('lg') {
    content: 'lg';
  }

  @include respond-to('xl') {
    content: 'xl';
  }
}
```

## 总结

RuoYi-Plus-UniApp 的样式架构是一个完整、系统的解决方案,具有以下核心优势:

### 架构优势

1. **清晰的分层结构** - 八层架构从低到高组织样式,特异性逐级递增,避免样式冲突
2. **强大的主题系统** - 基于 CSS 变量实现动态主题切换,支持亮色/暗色模式无缝过渡
3. **丰富的混合宏库** - 提供常用样式模式的可复用解决方案,提升开发效率
4. **深度组件定制** - 全面定制 Element Plus 组件库,提供现代化、一致的视觉体验
5. **完善的响应式** - 移动优先策略,支持多种设备和屏幕尺寸
6. **优秀的可维护性** - 模块化组织、语义化命名、详细注释,便于团队协作

### 技术亮点

- **SCSS 预处理器** - 变量、混合宏、嵌套、继承等高级特性
- **CSS 变量集成** - 运行时动态修改,支持主题切换
- **BEM 命名规范** - 语义化、可维护的类名体系
- **View Transition API** - 现代浏览器原生主题切换动画
- **渐进增强** - 基础功能保障,高级特性增强

### 开发建议

1. **遵循架构规范** - 按照八层架构组织样式,确保可维护性
2. **善用混合宏** - 复用通用样式模式,减少重复代码
3. **主题变量优先** - 颜色、字号等使用 CSS 变量,支持动态主题
4. **移动优先开发** - 基础样式适配小屏,通过断点增强大屏体验
5. **性能意识** - 避免昂贵的选择器,合理使用 transform 和 GPU 加速
6. **保持简洁** - 避免过深嵌套,使用 BEM 保持扁平化

通过这套完整的样式架构,项目实现了高度的可维护性、可扩展性和一致性,为开发高质量的前端应用提供了坚实的基础。
