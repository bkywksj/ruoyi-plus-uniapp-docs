# 组件样式

## 介绍

组件样式系统是 RuoYi-Plus 前端项目的核心样式架构之一，负责定义和管理所有组件的外观和交互效果。本系统采用 SCSS 预处理器，结合现代 CSS 特性，提供了高度可复用、易于维护的样式解决方案。

**核心特性：**

- **模块化设计** - 采用 7-1 架构模式，样式代码清晰分层
- **高度复用** - 通过 SCSS 混合器和 CSS 变量实现样式复用
- **主题支持** - 完整的亮色/暗色主题切换能力
- **动画丰富** - 内置多种过渡动画和交互效果
- **响应式** - 完善的断点系统支持多设备适配
- **Element Plus 集成** - 深度定制 Element Plus 组件样式

## 样式系统架构

### 目录结构

项目样式文件位于 `src/assets/styles/` 目录下，采用分层架构：

```
src/assets/styles/
├── abstracts/              # 抽象层
│   ├── _variables.scss     # SCSS 变量定义
│   ├── _mixins.scss        # 混合器函数集
│   └── exports.module.scss # 导出模块
├── base/                   # 基础层
│   ├── _reset.scss         # CSS 重置样式
│   └── _typography.scss    # 排版样式
├── components/             # 组件层
│   ├── _buttons.scss       # 按钮样式
│   └── _animations.scss    # 动画样式
├── layout/                 # 布局层
│   └── _layout.scss        # 布局样式
├── themes/                 # 主题层
│   ├── _light.scss         # 亮色主题
│   └── _dark.scss          # 暗色主题
├── vendors/                # 第三方层
│   └── _element-plus.scss  # Element Plus 覆盖
├── main.scss               # 主样式入口
└── theme-animation.scss    # 主题切换动画
```

### 样式导入顺序

主样式文件 `main.scss` 按照特定顺序导入各个模块，确保样式优先级正确：

```scss
/* 1. 外部库 */
@use 'animate.css';
@use 'element-plus/dist/index.css';

/* 2. 抽象层 */
@use './abstracts/variables' as *;
@use './abstracts/mixins' as *;

/* 3. 主题系统 */
@use './themes/light';
@use './themes/dark';

/* 4. 基础样式 */
@use './base/reset';
@use './base/typography';

/* 5. 布局层 */
@use './layout/layout';

/* 6. 组件样式 */
@use './components/buttons';
@use './components/animations';

/* 7. 第三方库样式覆盖 */
@use './vendors/element-plus';

/* 8. 主题切换动画 */
@use './theme-animation';
```

**导入顺序说明：**

1. **外部库优先** - 确保第三方样式先加载
2. **抽象层次之** - 变量和混合器供后续模块使用
3. **主题定义在前** - CSS 变量需要在使用前定义
4. **基础到复杂** - 从基础样式逐步到组件样式
5. **覆盖样式最后** - 确保自定义样式优先级最高

## 按钮样式系统

### 颜色按钮

项目提供了多种主题色按钮，通过混合器统一管理样式：

```scss
/**
 * 颜色按钮混合器
 * @param {Color} $color - 按钮的主题颜色
 */
@mixin colorBtn($color) {
  background: $color;

  &:hover {
    color: $color;

    &:before,
    &:after {
      background: $color;
    }
  }
}
```

**可用颜色按钮类：**

```scss
.blue-btn {
  @include colorBtn($blue);        // 蓝色 #324157
}

.light-blue-btn {
  @include colorBtn($light-blue);  // 浅蓝色 #3a71a8
}

.red-btn {
  @include colorBtn($red);         // 红色 #c03639
}

.pink-btn {
  @include colorBtn($pink);        // 粉色 #e65d6e
}

.green-btn {
  @include colorBtn($green);       // 绿色 #30b08f
}

.tiffany-btn {
  @include colorBtn($tiffany);     // 蒂芙尼蓝 #4ab7bd
}

.yellow-btn {
  @include colorBtn($yellow);      // 黄色 #fec171
}
```

### Pan 按钮

Pan 按钮是一种带有动画边框效果的按钮样式：

```scss
.pan-btn {
  font-size: 14px;
  color: #fff;
  padding: 14px 36px;
  border-radius: 8px;
  border: none;
  outline: none;
  transition: 600ms ease all;
  position: relative;
  display: inline-block;

  &:hover {
    background: #fff;

    &:before,
    &:after {
      width: 100%;
      transition: 600ms ease all;
    }
  }

  // 上边框线
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 2px;
    width: 0;
    transition: 400ms ease all;
  }

  // 下边框线
  &::after {
    right: inherit;
    top: inherit;
    left: 0;
    bottom: 0;
  }
}
```

**使用示例：**

```vue
<template>
  <div class="button-demo">
    <!-- 颜色按钮 -->
    <button class="blue-btn pan-btn">蓝色按钮</button>
    <button class="green-btn pan-btn">绿色按钮</button>
    <button class="red-btn pan-btn">红色按钮</button>

    <!-- 自定义按钮 -->
    <button class="custom-button">自定义按钮</button>
  </div>
</template>

<style lang="scss" scoped>
.button-demo {
  display: flex;
  gap: 12px;
  padding: 20px;
}
</style>
```

**动画效果说明：**

1. **初始状态** - 按钮显示背景色，边框线宽度为 0
2. **悬停触发** - 背景变为白色，文字变为主题色
3. **边框展开** - 上下边框线从 0 宽度扩展到 100%
4. **过渡平滑** - 600ms 的缓动过渡效果

### 自定义按钮

简单的无动画按钮样式：

```scss
.custom-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  color: #fff;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 4px;
}
```

## 动画样式系统

### 全局过渡动画

#### 淡入淡出

最基础的淡入淡出效果，适用于简单的显示/隐藏场景：

```scss
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal);
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
```

**使用示例：**

```vue
<template>
  <transition name="fade">
    <div v-if="visible" class="content">
      淡入淡出内容
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(true)

const toggle = () => {
  visible.value = !visible.value
}
</script>
```

#### 淡入淡出 + 位移

结合透明度和位移变换的过渡效果：

```scss
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all var(--duration-slow);
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
```

**使用场景：**
- 侧边栏展开/收起
- 内容区域切换
- 导航菜单过渡

#### 面包屑导航过渡

专门为面包屑导航设计的过渡效果：

```scss
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all var(--duration-slow);
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all var(--duration-slow);
}

.breadcrumb-leave-active {
  position: absolute;
}
```

**特点：**
- 支持列表项位置变化动画
- 离开时使用绝对定位避免布局抖动
- 较小的位移距离（20px）更加细腻

### 对话框动画

现代化的对话框缩放动画效果：

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);
  }
}

.dialog-fade-leave-active {
  animation: fade-out 0.2s linear;

  .el-dialog:not(.is-draggable) {
    animation: dialog-close 0.5s;
  }
}

@keyframes dialog-open {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dialog-close {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.2);
  }
}
```

**动画特点：**
- **打开动画** - 从 20% 缩放到 100%，配合淡入
- **关闭动画** - 从 100% 缩放到 20%，配合淡出
- **缓动函数** - 使用三次贝塞尔曲线实现弹性效果
- **时长控制** - 打开 0.2s，关闭 0.5s

### 图标动画

#### 抖动动画

```scss
@keyframes shake {
  0% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0); }
}

.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}
```

#### 旋转动画

```scss
@keyframes rotate180 {
  0% { transform: rotate(0); }
  100% { transform: rotate(180deg); }
}

.icon-hover-rotate180 {
  transform-origin: 50% 50% !important;

  &:hover {
    animation: rotate180 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  }
}
```

#### 上下移动动画

```scss
@keyframes moveUp {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}

.icon-hover-moveUp {
  &:hover {
    animation: moveUp 0.4s ease-in-out;
  }
}
```

#### 放大缩小动画

```scss
@keyframes expand {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.icon-hover-expand {
  &:hover {
    animation: expand 0.6s ease-in-out;
  }
}

@keyframes shrink {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.icon-hover-shrink {
  &:hover {
    animation: shrink 0.6s ease-in-out;
  }
}
```

#### 呼吸动画

```scss
@keyframes breathing {
  0% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
}

.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

**图标动画使用示例：**

```vue
<template>
  <div class="icon-demo">
    <!-- 抖动图标 -->
    <i class="icon-hover-shake">🔔</i>

    <!-- 旋转图标 -->
    <i class="icon-hover-rotate180">⚙️</i>

    <!-- 上下移动 -->
    <i class="icon-hover-moveUp">⬆️</i>

    <!-- 放大 -->
    <i class="icon-hover-expand">🔍</i>

    <!-- 缩小 -->
    <i class="icon-hover-shrink">📦</i>

    <!-- 呼吸动画（持续） -->
    <i class="icon-hover-breathing">💡</i>
  </div>
</template>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 24px;
  padding: 20px;
  font-size: 32px;

  i {
    cursor: pointer;
    user-select: none;
  }
}
</style>
```

### 徽章呼吸动画

用于消息提示等需要引起注意的场景：

```scss
@keyframes breathe {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}
```

**使用示例：**

```vue
<template>
  <div class="badge-demo">
    <el-badge :value="12" class="item">
      <el-button>消息</el-button>
    </el-badge>
  </div>
</template>

<style lang="scss" scoped>
.item {
  :deep(.el-badge__content) {
    animation: breathe 2s ease-in-out infinite;
  }
}
</style>
```

## 卡片样式系统

### 卡片混合器

提供统一的卡片样式，支持主题切换和悬停效果：

```scss
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

**使用示例：**

```vue
<template>
  <div class="card-container">
    <div class="custom-card">
      <h3>卡片标题</h3>
      <p>卡片内容...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/abstracts/mixins' as *;

.custom-card {
  @include card-style;
  padding: 20px;
  margin-bottom: 16px;
}
</style>
```

### 内置卡片样式类

```scss
/* 搜索面板样式 */
.panel,
.search {
  @include card-style;
  margin-bottom: 12px;
  padding: 12px;
}

/* 组件容器样式 */
.components-container {
  margin: 30px 50px;
  position: relative;
}
```

**使用场景：**
- `.panel` - 数据展示面板
- `.search` - 搜索条件面板
- `.components-container` - 页面组件容器

## 布局样式组件

### 侧边栏样式

```scss
aside {
  background: #eef1f6;
  padding: 8px 24px;
  margin-bottom: 20px;
  border-radius: var(--radius-sm);
  display: block;
  line-height: 32px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
               Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
               sans-serif;
  color: #2c3e50;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  a {
    color: #337ab7;
    cursor: pointer;

    &:hover {
      color: rgb(32, 160, 255);
    }
  }
}
```

### 子导航栏

```scss
.sub-navbar {
  height: 50px;
  line-height: 50px;
  position: relative;
  width: 100%;
  text-align: right;
  padding-right: 20px;
  transition: var(--duration-slow) ease position;
  background: linear-gradient(90deg,
    rgba(32, 182, 249, 1) 0%,
    rgba(33, 120, 241, 1) 100%
  );

  .subtitle {
    font-size: 20px;
    color: #fff;
  }

  &.draft {
    background: #d0d0d0;
  }

  &.deleted {
    background: #d0d0d0;
  }
}
```

### 筛选容器

```scss
.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}
```

**使用示例：**

```vue
<template>
  <div class="page-container">
    <!-- 子导航栏 -->
    <div class="sub-navbar">
      <span class="subtitle">页面标题</span>
    </div>

    <!-- 筛选容器 -->
    <div class="filter-container">
      <div class="filter-item">
        <el-input v-model="keyword" placeholder="搜索..." />
      </div>
      <div class="filter-item">
        <el-button type="primary">查询</el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="panel">
      内容区域
    </div>
  </div>
</template>
```

## 文本样式工具类

### 单行省略

```scss
.lines1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 多行省略

```scss
// 两行省略
.lines2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 三行省略
.lines3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
```

**使用示例：**

```vue
<template>
  <div class="text-demo">
    <!-- 单行省略 -->
    <div class="lines1" style="width: 200px">
      这是一段很长的文本，超出部分会被省略号代替
    </div>

    <!-- 两行省略 -->
    <div class="lines2" style="width: 200px">
      这是一段很长的文本，超出两行的部分会被省略号代替，
      这样可以保持页面布局的整洁美观
    </div>

    <!-- 三行省略 -->
    <div class="lines3" style="width: 200px">
      这是一段更长的文本内容，可以显示三行文本，
      超出三行的部分会被省略号代替，
      适用于需要显示更多内容但又要控制高度的场景，
      比如文章摘要、商品描述等
    </div>
  </div>
</template>

<style lang="scss" scoped>
.text-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  > div {
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
  }
}
</style>
```

**注意事项：**
- 单行省略优先使用 UnoCSS 的 `text-ellipsis` 类
- 多行省略依赖 WebKit 内核，Firefox 和旧版浏览器可能不支持
- 必须设置固定宽度或最大宽度才能生效

## 链接样式

### 链接类型样式

```scss
.link-type,
.link-type:focus {
  color: #337ab7;
  cursor: pointer;

  &:hover {
    color: rgb(32, 160, 255);
  }
}
```

**使用示例：**

```vue
<template>
  <div class="link-demo">
    <span class="link-type" @click="handleClick">
      点击链接
    </span>
  </div>
</template>

<script lang="ts" setup>
const handleClick = () => {
  console.log('链接被点击')
}
</script>
```

## 主题适配

### CSS 变量系统

组件样式大量使用 CSS 变量，确保主题切换的平滑过渡：

```scss
:root {
  // 动画时长
  --duration-normal: 0.3s;
  --duration-slow: 0.6s;

  // Z-index层级
  --z-sidebar: 1001;
  --z-header: 9;
  --z-mask: 999;
  --z-modal: 1050;

  // 侧边栏尺寸
  --sidebar-collapsed-width: 54px;

  // 边框圆角
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-round: 20px;

  // 组件高度
  --el-component-custom-height: 32px !important;
  --el-component-size: var(--el-component-custom-height) !important;

  // 动态圆角
  --custom-radius: 12px;
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px) !important;
}
```

### 背景层级系统

使用 5 层背景色系统实现视觉层次：

- `--bg-base` - 基础背景色（最底层）
- `--bg-level-1` - 一级背景色（卡片、面板）
- `--bg-level-2` - 二级背景色（输入框、按钮）
- `--bg-level-3` - 三级背景色（悬停状态）
- `--bg-level-4` - 四级背景色（激活状态）

**使用示例：**

```vue
<template>
  <div class="themed-component">
    <div class="card">
      卡片内容
    </div>
  </div>
</template>

<style lang="scss" scoped>
.themed-component {
  background-color: var(--bg-base);
  padding: 20px;

  .card {
    background-color: var(--bg-level-1);
    border: 1px solid var(--bg-level-2);
    padding: 16px;
    border-radius: var(--radius-md);

    &:hover {
      background-color: var(--bg-level-3);
    }
  }
}
</style>
```

## SCSS 混合器复用

### 清除浮动

```scss
@mixin clearfix {
  &:after {
    content: '';
    display: table;
    clear: both;
  }
}

// 使用
.container {
  @include clearfix;
}
```

### 自定义滚动条

```scss
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

// 使用
.scrollable-element {
  @include scrollbar;
}
```

### 按钮基础样式

```scss
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

**综合使用示例：**

```vue
<template>
  <div class="custom-component">
    <div class="scrollable-content">
      <!-- 长内容 -->
    </div>
    <button class="custom-btn">提交</button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/abstracts/mixins' as *;

.custom-component {
  @include clearfix;

  .scrollable-content {
    @include scrollbar;
    max-height: 300px;
    overflow-y: auto;
  }

  .custom-btn {
    @include button-base;
    padding: 8px 16px;
    background-color: var(--el-color-primary);
    color: white;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
```

## Element Plus 样式覆盖

### 菜单动画优化

```scss
/* 菜单展开动画 */
.el-menu.el-menu--inline {
  transition: max-height 0.26s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 菜单项悬停优化 */
.el-sub-menu__title,
.el-menu-item {
  transition: background-color 0s !important;
}
```

### 对话框宽度修复

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    // 修复 el-dialog 动画后宽度不自适应问题
    .el-select__selected-item {
      display: inline-block;
    }
  }
}
```

## 常见问题

### 1. 样式不生效

**问题**：组件样式没有按预期显示

**可能原因**：
- 样式导入顺序不正确
- CSS 选择器优先级不够
- scoped 样式隔离导致无法覆盖子组件

**解决方案**：

```vue
<style lang="scss" scoped>
/* 使用 :deep() 穿透 scoped */
:deep(.el-button) {
  border-radius: var(--radius-md);
}

/* 或者使用全局样式 */
</style>

<style lang="scss">
/* 全局样式（不加 scoped） */
.el-button {
  border-radius: var(--radius-md);
}
</style>
```

### 2. 动画卡顿

**问题**：过渡动画不流畅，出现卡顿

**原因**：
- 动画属性触发了重排（reflow）
- 动画时长设置不合理
- 硬件加速未开启

**解决方案**：

```scss
.smooth-animation {
  /* 使用 transform 代替 left/top */
  transition: transform var(--duration-normal) ease;

  /* 开启硬件加速 */
  will-change: transform;

  /* 使用合理的缓动函数 */
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. 主题切换闪烁

**问题**：切换主题时页面出现闪烁

**原因**：
- CSS 变量过渡未设置
- 组件重新渲染导致

**解决方案**：

```scss
/* 为元素添加过渡 */
.themed-element {
  transition: background-color var(--duration-normal) ease,
              color var(--duration-normal) ease,
              border-color var(--duration-normal) ease;
}
```

### 4. 混合器找不到

**问题**：使用混合器时提示未定义

**原因**：
- 未导入 mixins 模块
- 导入路径不正确

**解决方案**：

```vue
<style lang="scss" scoped>
/* 方式1：使用 @use 导入 */
@use '@/assets/styles/abstracts/mixins' as *;

.my-component {
  @include card-style;
}

/* 方式2：使用别名 */
@use '@/assets/styles/abstracts/mixins' as m;

.my-component {
  @include m.card-style;
}
</style>
```

### 5. 文本省略无效

**问题**：多行文本省略不生效

**原因**：
- 未设置固定宽度
- 浏览器不支持 `-webkit-line-clamp`

**解决方案**：

```vue
<template>
  <div class="text-container">
    <div class="lines2" style="max-width: 300px">
      长文本内容...
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lines2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all; /* 确保长单词换行 */
}
</style>
```

### 6. 响应式布局问题

**问题**：在不同设备上显示效果不一致

**原因**：
- 未使用响应式断点
- 固定尺寸导致布局僵硬

**解决方案**：

```vue
<style lang="scss" scoped>
@use '@/assets/styles/abstracts/mixins' as *;
@use '@/assets/styles/abstracts/variables' as *;

.responsive-component {
  padding: 20px;

  /* 平板及以下 */
  @include respond-to('md') {
    padding: 12px;
  }

  /* 手机 */
  @include respond-to('sm') {
    padding: 8px;
  }
}
</style>
```

## 总结

RuoYi-Plus 的组件样式系统提供了完整的样式解决方案，通过模块化架构、SCSS 混合器和 CSS 变量，实现了高度可复用和可维护的样式代码。

**核心要点：**

1. **遵循导入顺序** - 确保样式优先级正确
2. **使用混合器复用** - 避免重复代码
3. **CSS 变量主题** - 支持动态主题切换
4. **性能优化** - 使用 transform 和硬件加速
5. **响应式设计** - 利用断点混合器适配多设备

掌握这些样式组件和技巧，可以大大提高开发效率，构建出美观且性能优秀的用户界面。
