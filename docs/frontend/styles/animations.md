# 动画系统

## 介绍

RuoYi-Plus-UniApp 前端项目建立了完善的动画系统，通过 CSS 过渡（Transition）、关键帧动画（Keyframes）和 Vue 过渡组件的有机结合，为用户界面提供流畅自然的视觉反馈和交互体验。动画系统不仅注重视觉美感，更强调性能优化和用户体验，所有动画都经过精心调校，确保在各种设备上都能流畅运行。

项目采用标准化的动画时长变量体系，通过 CSS 自定义属性（CSS Variables）集中管理动画时长，便于全局统一调整。同时提供了丰富的预设动画效果，包括淡入淡出、缩放、旋转、位移等常见动画类型，开发者可以直接使用这些预设动画，也可以基于标准时长变量自定义动画效果。

**核心特性:**

- **统一时长体系** - 通过 `--duration-normal` 和 `--duration-slow` 两个 CSS 变量统一管理动画时长，确保全局动画风格一致
- **丰富的预设动画** - 提供 10+ 种常用关键帧动画，包括淡入淡出、缩放、旋转、位移、呼吸等效果
- **Vue 过渡集成** - 深度集成 Vue Transition 组件，提供 fade、fade-transform、breadcrumb 等过渡类
- **现代 API 支持** - 使用 View Transition API 实现主题切换的圆形扩散动画，提供惊艳的视觉效果
- **性能优化** - 优先使用 transform 和 opacity 属性实现动画，避免触发重排（reflow），确保 60fps 流畅运行
- **动画工具类** - 提供丰富的动画工具类，如 `icon-hover-shake`、`icon-hover-rotate180` 等，即用即走

项目的动画系统遵循"自然流畅、性能优先"的设计原则，所有动画效果都经过真机测试，确保在低端设备上也能保持良好的性能。同时，动画系统支持暗黑模式，所有动画在亮色和暗色主题下都能完美呈现，提供一致的用户体验。

## 动画时长变量

项目使用 CSS 自定义属性定义了标准化的动画时长，确保全局动画风格统一：

```scss
:root {
  // 动画时长统一
  --duration-normal: 0.3s;  // 标准动画时长，用于大多数过渡效果
  --duration-slow: 0.6s;    // 慢速动画时长，用于强调或复杂的动画
}
```

### 时长使用场景

**--duration-normal (0.3s) - 标准时长**

适用于大多数交互反馈和快速过渡效果：

- 按钮悬停状态变化
- 输入框焦点效果
- 下拉菜单展开/收起
- 模态框的淡入淡出
- 工具提示（Tooltip）显示/隐藏
- 标签页切换
- 导航栏背景色变化

**--duration-slow (0.6s) - 慢速时长**

适用于需要强调或包含复杂变换的动画：

- 页面路由切换
- 侧边栏展开/收起
- 复杂的多属性过渡（位移+缩放+透明度）
- 面包屑导航的进入/离开动画
- 大型组件的显示/隐藏
- 主题切换动画

### 在样式中使用

```scss
// 在 SCSS 中使用
.my-element {
  // 单个属性过渡
  transition: opacity var(--duration-normal);

  // 多个属性过渡
  transition: all var(--duration-slow);

  // 指定多个属性
  transition:
    opacity var(--duration-normal),
    transform var(--duration-normal) cubic-bezier(0.4, 0, 0.6, 1);
}

// 在关键帧动画中使用
.animated-element {
  animation: fadeIn var(--duration-normal) ease-out;
}
```

### 自定义时长

如果需要特殊的动画时长，可以在组件内覆盖：

```vue
<template>
  <div class="custom-animation">
    自定义动画时长
  </div>
</template>

<style scoped>
.custom-animation {
  --duration-normal: 0.2s;  // 局部覆盖，更快的动画
  transition: all var(--duration-normal);

  &:hover {
    transform: scale(1.05);
  }
}
</style>
```

## CSS 过渡动画

CSS 过渡（Transition）是最常用的动画实现方式，通过 `transition` 属性实现元素状态变化时的平滑过渡。

### 基础用法

```scss
// 单个属性过渡
.button {
  background-color: #409eff;
  transition: background-color var(--duration-normal);

  &:hover {
    background-color: #66b1ff;
  }
}

// 多个属性过渡
.card {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--duration-normal),
    transform var(--duration-normal);

  &:hover {
    opacity: 0.8;
    transform: translateY(-5px);
  }
}

// 所有属性过渡（不推荐用于生产环境）
.element {
  transition: all var(--duration-slow);
}
```

### 过渡时间函数（Easing）

项目常用的缓动函数：

```scss
// 线性（匀速）
transition: opacity 0.3s linear;

// 缓入缓出（默认，最常用）
transition: transform 0.3s ease;

// 缓入
transition: opacity 0.3s ease-in;

// 缓出
transition: opacity 0.3s ease-out;

// 缓入缓出（更明显）
transition: transform 0.3s ease-in-out;

// 自定义贝塞尔曲线
transition: transform 0.3s cubic-bezier(0.4, 0, 0.6, 1);
```

### 常用过渡效果示例

#### 1. 按钮悬停效果

```vue
<template>
  <button class="btn-primary">
    主要按钮
  </button>
</template>

<style scoped lang="scss">
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: var(--el-color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  // 过渡效果
  transition:
    background-color var(--duration-normal),
    transform var(--duration-normal),
    box-shadow var(--duration-normal);

  &:hover {
    background: var(--el-color-primary-dark-2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
```

#### 2. 卡片悬停效果

```vue
<template>
  <div class="card">
    <img src="/image.jpg" alt="Card Image" class="card-image" />
    <div class="card-content">
      <h3>卡片标题</h3>
      <p>卡片内容描述</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  background: var(--bg-base);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;

  // 过渡效果
  transition:
    transform var(--duration-normal) cubic-bezier(0.4, 0, 0.6, 1),
    box-shadow var(--duration-normal);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);

    .card-image {
      transform: scale(1.1);
    }
  }
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform var(--duration-slow);
}

.card-content {
  padding: 20px;
}
</style>
```

#### 3. 输入框焦点效果

```vue
<template>
  <div class="input-wrapper">
    <input
      type="text"
      class="input-field"
      placeholder="请输入内容"
    />
    <div class="input-border"></div>
  </div>
</template>

<style scoped lang="scss">
.input-wrapper {
  position: relative;
  display: inline-block;
}

.input-field {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  // 过渡效果
  transition:
    border-color var(--duration-normal),
    box-shadow var(--duration-normal);

  &:focus {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  }
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--el-color-primary);

  // 过渡效果
  transition: width var(--duration-normal) cubic-bezier(0.4, 0, 0.6, 1);
}

.input-field:focus ~ .input-border {
  width: 100%;
}
</style>
```

## 关键帧动画

关键帧动画（@keyframes）用于定义复杂的、多阶段的动画效果。项目预定义了多种常用的关键帧动画。

### 对话框动画

现代化的对话框打开/关闭动画，使用缩放效果：

```scss
// 对话框打开动画
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

// 对话框关闭动画
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

// 遮罩层淡出动画
@keyframes fade-out {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
```

**使用方式:**

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
```

### 图标动画

项目提供了 6 种常用的图标动画效果：

#### 1. 抖动动画（Shake）

```scss
@keyframes shake {
  0% {
    transform: rotate(0);
  }

  25% {
    transform: rotate(-5deg);
  }

  50% {
    transform: rotate(5deg);
  }

  75% {
    transform: rotate(-5deg);
  }

  100% {
    transform: rotate(0);
  }
}
```

#### 2. 旋转动画（Rotate 180°）

```scss
@keyframes rotate180 {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(180deg);
  }
}
```

#### 3. 上下移动动画（Move Up）

```scss
@keyframes moveUp {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }

  100% {
    transform: translateY(0);
  }
}
```

#### 4. 放大动画（Expand）

```scss
@keyframes expand {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
```

#### 5. 缩小动画（Shrink）

```scss
@keyframes shrink {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}
```

#### 6. 呼吸动画（Breathing）

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
```

### 徽章呼吸动画

用于通知徽章的呼吸效果：

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

**使用示例:**

```vue
<template>
  <div class="notification-badge">
    99+
  </div>
</template>

<style scoped>
.notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  font-size: 12px;

  // 应用呼吸动画
  animation: breathe 2s ease-in-out infinite;
}
</style>
```

## Vue 过渡动画

项目集成了 Vue 的 Transition 组件，提供了多种预设的过渡类。

### 淡入淡出效果（Fade）

最基础的透明度过渡效果：

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

**使用示例:**

```vue
<template>
  <div>
    <button @click="show = !show">切换显示</button>

    <Transition name="fade">
      <div v-if="show" class="content-box">
        淡入淡出的内容
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(true)
</script>
```

### 淡入淡出+位移效果（Fade Transform）

结合透明度和位移的复合过渡效果：

```scss
.fade-transform-enter-active,
.fade-transform-leave-active {
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

**使用示例:**

```vue
<template>
  <div>
    <button @click="currentTab = 'tab1'">Tab 1</button>
    <button @click="currentTab = 'tab2'">Tab 2</button>

    <Transition name="fade-transform" mode="out-in">
      <div v-if="currentTab === 'tab1'" key="tab1" class="tab-content">
        Tab 1 内容
      </div>
      <div v-else key="tab2" class="tab-content">
        Tab 2 内容
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const currentTab = ref('tab1')
</script>
```

### 面包屑过渡效果（Breadcrumb）

专门为面包屑导航设计的过渡效果，包含列表项移动动画：

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

**使用示例:**

```vue
<template>
  <nav class="breadcrumb">
    <TransitionGroup name="breadcrumb" tag="ul">
      <li v-for="item in breadcrumbs" :key="item.path" class="breadcrumb-item">
        <a :href="item.path">{{ item.title }}</a>
      </li>
    </TransitionGroup>
  </nav>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const breadcrumbs = ref([
  { path: '/', title: '首页' },
  { path: '/products', title: '产品' },
  { path: '/products/detail', title: '产品详情' }
])
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item {
  position: relative;
  display: inline-flex;
  align-items: center;

  &:not(:last-child)::after {
    content: '/';
    margin: 0 8px;
    color: var(--text-color-secondary);
  }
}
</style>
```

## 主题切换动画

项目使用现代的 View Transition API 实现主题切换时的圆形扩散动画效果，提供惊艳的视觉体验。

### View Transition API

```scss
// 定义动画时长
$theme-animation-duration: 0.5s;

html {
  // View Transition 样式
  &::view-transition-old(root),
  &::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  // 亮色模式 -> 暗黑模式: 新层从圆心扩散
  &::view-transition-new(root) {
    animation: theme-clip-in $theme-animation-duration ease-in both;
    z-index: 9999;
  }

  &::view-transition-old(root) {
    z-index: 1;
  }

  // 暗黑模式 -> 亮色模式: 旧层从外向圆心收缩
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

// 圆形扩散动画（从小到大）
@keyframes theme-clip-in {
  from {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }

  to {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
}

// 圆形收缩动画（从大到小）
@keyframes theme-clip-out {
  from {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }

  to {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }
}
```

### 在组件中使用

```vue
<template>
  <button
    class="theme-toggle-btn"
    @click="toggleTheme"
  >
    <Icon :code="isDark ? 'sun' : 'moon'" />
  </button>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const isDark = computed(() => appStore.theme === 'dark')

const toggleTheme = async (event: MouseEvent) => {
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 设置圆心位置和半径
  document.documentElement.style.setProperty('--theme-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-y', `${y}px`)
  document.documentElement.style.setProperty('--theme-r', `${endRadius}px`)

  // 检查浏览器是否支持 View Transition API
  if (!document.startViewTransition) {
    // 不支持则直接切换
    appStore.toggleTheme()
    return
  }

  // 使用 View Transition API
  const transition = document.startViewTransition(() => {
    appStore.toggleTheme()
  })

  await transition.ready
}
</script>

<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color var(--duration-normal);

  &:hover {
    background: var(--bg-level-3);
  }
}
</style>
```

## 动画工具类

项目提供了一系列即用即走的动画工具类，特别是图标动画类：

### 图标悬停动画类

```scss
// 抖动效果
.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}

// 180度旋转
.icon-hover-rotate180 {
  transform-origin: 50% 50% !important;

  &:hover {
    animation: rotate180 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  }
}

// 上下移动
.icon-hover-moveUp {
  &:hover {
    animation: moveUp 0.4s ease-in-out;
  }
}

// 放大
.icon-hover-expand {
  &:hover {
    animation: expand 0.6s ease-in-out;
  }
}

// 缩小
.icon-hover-shrink {
  &:hover {
    animation: shrink 0.6s ease-in-out;
  }
}

// 持续呼吸（无需悬停）
.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

### 使用示例

```vue
<template>
  <div class="icon-showcase">
    <div class="icon-item">
      <Icon code="bell" class="icon-hover-shake" />
      <span>抖动效果</span>
    </div>

    <div class="icon-item">
      <Icon code="refresh" class="icon-hover-rotate180" />
      <span>旋转效果</span>
    </div>

    <div class="icon-item">
      <Icon code="arrow-up" class="icon-hover-moveUp" />
      <span>上下移动</span>
    </div>

    <div class="icon-item">
      <Icon code="heart" class="icon-hover-expand" />
      <span>放大效果</span>
    </div>

    <div class="icon-item">
      <Icon code="star" class="icon-hover-shrink" />
      <span>缩小效果</span>
    </div>

    <div class="icon-item">
      <Icon code="wifi" class="icon-hover-breathing" />
      <span>呼吸效果</span>
    </div>
  </div>
</template>

<style scoped>
.icon-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 24px;
  padding: 24px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-base);
  border-radius: 8px;
  cursor: pointer;

  :deep(.icon) {
    font-size: 32px;
    color: var(--el-color-primary);
  }

  span {
    font-size: 12px;
    color: var(--text-color-secondary);
  }
}
</style>
```

### 自定义动画工具类

你也可以创建自己的动画工具类：

```vue
<template>
  <div class="my-animated-element">
    自定义动画元素
  </div>
</template>

<style scoped>
// 定义关键帧
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

// 创建工具类
.slide-in-animation {
  animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.6, 1);
}

.my-animated-element {
  // 应用动画
  @extend .slide-in-animation;

  // 或直接使用
  animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.6, 1);
}
</style>
```

## 最佳实践

### 1. 优先使用 transform 和 opacity

这两个属性可以被 GPU 加速，不会触发重排（reflow）：

```scss
// ✅ 推荐：使用 transform
.element {
  transform: translateX(0);
  transition: transform var(--duration-normal);

  &:hover {
    transform: translateX(10px);
  }
}

// ❌ 不推荐：使用 left（会触发重排）
.element {
  position: relative;
  left: 0;
  transition: left var(--duration-normal);

  &:hover {
    left: 10px;
  }
}
```

### 2. 合理使用 will-change

对于频繁动画的元素，可以使用 `will-change` 提示浏览器优化：

```scss
.frequently-animated {
  // 提示浏览器优化这些属性
  will-change: transform, opacity;

  // 动画结束后移除 will-change
  &:not(:hover) {
    will-change: auto;
  }
}
```

**注意:** 不要滥用 `will-change`，它会消耗额外的内存。

### 3. 使用统一的时长变量

```scss
// ✅ 推荐：使用统一的时长变量
.button {
  transition: background-color var(--duration-normal);
}

// ❌ 不推荐：硬编码时长
.button {
  transition: background-color 0.3s;
}
```

### 4. 避免动画过多属性

```scss
// ❌ 不推荐：过渡所有属性（性能差）
.element {
  transition: all 0.3s;
}

// ✅ 推荐：只过渡需要的属性
.element {
  transition:
    transform var(--duration-normal),
    opacity var(--duration-normal);
}
```

### 5. 使用适当的缓动函数

```scss
// 入场动画：使用 ease-out（快进慢出）
.enter {
  animation: slideIn 0.3s ease-out;
}

// 出场动画：使用 ease-in（慢进快出）
.leave {
  animation: slideOut 0.3s ease-in;
}

// 循环动画：使用 ease-in-out
.loop {
  animation: pulse 1s ease-in-out infinite;
}
```

### 6. 为长动画提供中断机制

```vue
<template>
  <div
    class="animated-box"
    :class="{ 'is-animating': isAnimating }"
    @click="stopAnimation"
  >
    点击停止动画
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isAnimating = ref(true)

const stopAnimation = () => {
  isAnimating.value = false
}
</script>

<style scoped>
.animated-box {
  &.is-animating {
    animation: rotate 2s linear infinite;
  }

  // 点击后停止动画
  &:not(.is-animating) {
    animation: none;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### 7. 减少动画复杂度

在低端设备或移动设备上，简化动画效果：

```scss
.fancy-animation {
  // 默认：复杂动画
  animation:
    fadeIn 0.3s ease-out,
    slideUp 0.3s ease-out,
    scaleIn 0.3s ease-out;

  // 降低动画复杂度
  @media (prefers-reduced-motion: reduce) {
    animation: fadeIn 0.3s ease-out;
  }

  // 移动设备：简化动画
  @media (max-width: 768px) {
    animation: fadeIn 0.2s ease-out;
  }
}
```

## 性能优化

### 1. 使用 CSS Containment

```scss
.animated-container {
  // 包含布局和绘制，防止影响外部元素
  contain: layout paint;
}
```

### 2. 使用 requestAnimationFrame

对于 JavaScript 驱动的动画：

```typescript
function animate() {
  // 动画逻辑
  const element = document.querySelector('.animated')

  let start: number
  const duration = 300

  function step(timestamp: number) {
    if (!start) start = timestamp
    const progress = (timestamp - start) / duration

    if (progress < 1) {
      element.style.transform = `translateX(${progress * 100}px)`
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}
```

### 3. 避免布局抖动

```typescript
// ❌ 不推荐：读写交错导致布局抖动
elements.forEach(el => {
  const height = el.offsetHeight  // 读取
  el.style.height = height + 10 + 'px'  // 写入
})

// ✅ 推荐：批量读取，批量写入
const heights = elements.map(el => el.offsetHeight)
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'
})
```

### 4. 使用 CSS 硬件加速

```scss
.hardware-accelerated {
  // 强制 GPU 加速
  transform: translateZ(0);
  // 或
  transform: translate3d(0, 0, 0);
}
```

## 常见问题

### 1. 动画卡顿或不流畅

**问题原因:**

- 动画了非合成属性（如 width、height、left、top）
- 同时动画了过多元素
- 使用了 `transition: all`
- 未启用硬件加速

**解决方案:**

```scss
// ❌ 问题代码
.element {
  transition: all 0.3s;

  &:hover {
    width: 200px;  // 触发重排
    height: 200px;  // 触发重排
  }
}

// ✅ 优化后
.element {
  transition: transform 0.3s, opacity 0.3s;
  transform: translateZ(0);  // 启用硬件加速

  &:hover {
    transform: scale(1.2);  // 使用 transform
    opacity: 0.8;  // 使用 opacity
  }
}
```

### 2. Vue 过渡动画不生效

**问题原因:**

- 忘记添加 `name` 属性
- CSS 类名不匹配
- 使用了 `v-show` 但期望路由级过渡
- 没有定义过渡类

**解决方案:**

```vue
<!-- ❌ 问题代码 -->
<Transition>
  <div v-if="show">内容</div>
</Transition>

<!-- ✅ 正确代码 -->
<Transition name="fade">
  <div v-if="show">内容</div>
</Transition>

<style>
/* 定义对应的过渡类 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 3. 主题切换动画在某些浏览器不生效

**问题原因:**

View Transition API 是较新的 API，部分浏览器不支持。

**解决方案:**

```typescript
const toggleTheme = async (event: MouseEvent) => {
  // 检查浏览器支持
  if (!document.startViewTransition) {
    // 降级方案：直接切换
    appStore.toggleTheme()
    return
  }

  // 设置动画参数
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  document.documentElement.style.setProperty('--theme-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-y', `${y}px`)
  document.documentElement.style.setProperty('--theme-r', `${endRadius}px`)

  // 使用 View Transition API
  const transition = document.startViewTransition(() => {
    appStore.toggleTheme()
  })

  await transition.ready
}
```

### 4. 动画在移动设备上性能差

**问题原因:**

- 移动设备性能较弱
- 动画过于复杂
- 未考虑用户的动画偏好设置

**解决方案:**

```scss
.complex-animation {
  // 默认：完整动画
  animation:
    fadeIn 0.3s ease-out,
    slideUp 0.3s ease-out,
    rotate 0.3s ease-out;

  // 尊重用户的减少动画偏好
  @media (prefers-reduced-motion: reduce) {
    animation: fadeIn 0.2s ease-out;
  }

  // 移动设备：简化动画
  @media (max-width: 768px) {
    animation: fadeIn 0.2s ease-out;
  }
}
```

### 5. 动画结束后元素闪烁

**问题原因:**

- 动画结束后状态与最终状态不一致
- 缺少 `animation-fill-mode`

**解决方案:**

```scss
// ❌ 问题代码
.element {
  animation: fadeIn 0.3s;
  // 动画结束后恢复到初始状态，导致闪烁
}

// ✅ 正确代码
.element {
  animation: fadeIn 0.3s ease-out forwards;
  // forwards: 保持动画结束时的状态

  // 或者确保初始状态与动画结束状态一致
  opacity: 1;  // 与动画结束时的 opacity 一致
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```

---

通过合理使用动画系统，可以为用户界面增添生动的视觉效果，提升用户体验。记住始终将性能放在首位，优先使用高性能的动画属性（transform 和 opacity），并在必要时为用户提供禁用动画的选项。
