# 页面背景 AGeometricBackground

## 介绍

`AGeometricBackground` 是一个专为页面背景设计的几何装饰组件，主要用于提升页面视觉效果和品牌展示。组件通过渐变背景色搭配多种几何装饰元素，创造出现代化、专业化的视觉体验。组件内置了丰富的动画效果，包括淡入、缩放、弹跳等多种过渡动画，使页面加载过程更加生动流畅。

组件位于 `@/components/ATheme/AGeometricBackground.vue`，主要应用于错误页面（401、404）和登录注册页面的背景装饰。通过默认插槽机制，可以在几何背景之上放置任意内容，实现内容与装饰的完美融合。

**核心特性：**

- **渐变背景** - 使用主题色生成优雅的渐变背景，支持亮色/暗色模式自动适配
- **几何装饰** - 提供 7 种几何元素类型，包括圆形、方块、点等多样化装饰
- **动画系统** - 内置 6 种动画效果（淡入、缩放、弹跳等），支持延迟播放和时序控制
- **暗黑模式** - 完整的暗黑模式适配，自动调整元素颜色和透明度
- **插槽支持** - 支持默认插槽，可在背景上放置任意内容而不阻碍交互
- **主题集成** - 深度集成 Element Plus 主题变量，自动跟随系统主题色变化

## 设计理念

### 视觉层次

组件通过多层几何元素的叠加，创造出丰富的视觉层次感。每个几何元素都有独立的定位、大小和动画效果，共同构成和谐统一的装饰画面。渐变背景作为最底层，为页面提供柔和的色彩基调；中间层的大型几何元素（如背景泡泡、旋转方块）提供主要装饰效果；最上层的小型装饰点则增加细节丰富度。

### 动画编排

组件采用时序化的动画编排策略，不同几何元素按照预设的延迟时间依次播放动画，形成流畅的视觉叙事。动画时长、缓动函数、延迟时间都经过精心调校，确保视觉效果既生动又不过于喧宾夺主。所有动画都使用 `animation-fill-mode: forwards` 保持最终状态，避免动画结束后的闪烁。

### 主题适配

组件使用 CSS `color-mix` 函数和主题变量实现动态主题适配。在亮色模式下，使用主题色的浅色变体（`--el-color-primary-light-7/8/9`）创造清新明亮的视觉效果；在暗黑模式下，使用主题色的半透明版本，并降低整体亮度，保持视觉舒适性。部分元素（如大气泡、装饰点）在暗黑模式下会被隐藏，避免过度装饰。

## 基本用法

### 基础使用

最简单的使用方式是直接将组件作为页面背景容器，在其中放置实际内容。组件会自动填充父容器，提供全屏背景效果。

```vue
<template>
  <AGeometricBackground>
    <div class="content">
      <h1>页面标题</h1>
      <p>页面内容</p>
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>

<style lang="scss" scoped>
.content {
  position: relative;
  z-index: 10;
  padding: 40px;
}
</style>
```

**使用说明：**
- 组件内部使用 `position: relative`，可以安全地容纳绝对定位的内容
- 几何装饰使用 `pointer-events: none`，不会阻碍鼠标事件
- 内容元素需要设置合适的 `z-index`（建议 ≥ 10）确保显示在装饰之上

### 错误页面背景

在 401、404 等错误页面中，组件提供全屏背景装饰，提升错误页面的视觉友好度。

```vue
<template>
  <AGeometricBackground class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <span class="number">404</span>
      </div>
      <h1 class="error-title">页面不存在</h1>
      <p class="error-description">抱歉，您访问的页面不存在或已被删除。</p>
      <div class="error-actions">
        <router-link to="/" class="btn-primary">返回首页</router-link>
        <button @click="$router.go(-1)" class="btn-secondary">返回上页</button>
      </div>
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const router = useRouter()
</script>

<style lang="scss" scoped>
.error-page {
  width: 100vw;
  height: 100vh;
}

.error-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.error-icon .number {
  font-size: 120px;
  font-weight: 800;
  color: var(--el-color-primary);
}

.error-title {
  margin-top: 24px;
  font-size: 32px;
  font-weight: 700;
  color: var(--app-text);
}

.error-description {
  margin-top: 16px;
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.error-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--el-color-primary);
  color: white;
  border: none;
  text-decoration: none;
}

.btn-secondary {
  background: rgba(var(--el-color-primary-rgb, 93, 135, 255), 0.08);
  color: var(--el-color-primary);
  border: 1px solid rgba(var(--el-color-primary-rgb, 93, 135, 255), 0.2);
}
</style>
```

**技术实现：**
- 使用 `100vw` 和 `100vh` 实现全屏背景
- 错误内容容器使用 `flex` 布局实现垂直水平居中
- 按钮样式使用主题变量，自动适配主题色
- 返回按钮使用 Vue Router 的导航功能

### 登录页面背景

在登录注册页面的左侧品牌展示区域，组件作为装饰背景提升品牌形象。

```vue
<template>
  <AGeometricBackground class="auth-left-view">
    <!-- Logo -->
    <a class="logo" href="https://ruoyi.plus" target="_blank">
      <img src="@/assets/logo/logo.png" class="icon" alt="Logo" />
      <h1 class="title">RuoYi Plus</h1>
    </a>

    <!-- 中间插画 -->
    <div class="illustration">
      <img src="@/assets/images/login_icon.svg" alt="Login" />
    </div>

    <!-- 底部标语 -->
    <div class="slogan">
      <h1>欢迎使用 RuoYi-Plus-UniApp</h1>
      <p>基于 Spring Boot 3 和 UniApp 的全栈框架</p>
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>

<style lang="scss" scoped>
.auth-left-view {
  position: relative;
  width: 65vw;
  height: 100vh;
  padding: 20px;
}

.logo {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
    transform: translateX(2px);
  }

  .icon {
    width: 46px;
    height: 46px;
  }

  .title {
    margin: 0 0 0 10px;
    font-size: 20px;
    font-weight: 400;
    color: var(--app-text);
  }
}

.illustration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  z-index: 10;

  img {
    width: 100%;
    height: auto;
  }
}

.slogan {
  position: absolute;
  bottom: 80px;
  width: 100%;
  text-align: center;

  h1 {
    font-size: 24px;
    font-weight: 400;
    color: var(--app-text);
    margin: 0 0 10px 0;
  }

  p {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}
</style>
```

**技术实现：**
- Logo 使用 `position: fixed` 固定在左上角，不受滚动影响
- 中间插画使用 `translate(-50%, -50%)` 实现完美居中
- 底部标语使用绝对定位固定在底部，保持一定间距
- 所有文本颜色使用主题变量，自动适配亮色/暗色模式

### 自定义类名样式

可以通过添加自定义类名来调整组件的尺寸和定位。

```vue
<template>
  <AGeometricBackground class="custom-background">
    <div class="content">
      自定义尺寸的背景
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>

<style lang="scss" scoped>
.custom-background {
  width: 800px;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
}

.content {
  position: relative;
  z-index: 10;
  padding: 40px;
}
</style>
```

**使用说明：**
- 可以通过外部类名自定义组件的宽高
- 添加 `border-radius` 可以创建圆角背景
- 必须设置 `overflow: hidden` 确保几何元素不会溢出圆角边界

### 嵌套复杂内容

组件支持嵌套任意复杂的内容结构，包括表单、卡片、列表等。

```vue
<template>
  <AGeometricBackground class="page-container">
    <div class="content-wrapper">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>系统信息</span>
          </div>
        </template>
        <el-form label-width="100px">
          <el-form-item label="系统名称">
            <el-input v-model="systemName" />
          </el-form-item>
          <el-form-item label="系统版本">
            <el-input v-model="systemVersion" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary">保存</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const systemName = ref('RuoYi Plus')
const systemVersion = ref('1.0.0')
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding: 40px;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  background: var(--bg-level-1);

  :deep(.el-card__header) {
    background: transparent;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}
</style>
```

**技术实现：**
- 内容容器使用 `max-width` 和 `margin: 0 auto` 实现居中布局
- Element Plus 组件使用深度选择器（`:deep()`）自定义样式
- 卡片背景使用主题变量，与几何背景形成层次对比

## 几何元素详解

### 圆形轮廓（Circle Outline）

圆形轮廓是一个空心圆形边框，位于页面左上区域，使用主题色的浅色变体作为边框颜色。

```scss
.circle-outline {
  top: 10%;
  left: 25%;
  width: 42px;
  height: 42px;
  border: 2px solid var(--el-color-primary-light-8);
  border-radius: 50%;
  animation-name: fadeInUp;
}
```

**特点：**
- 位置：左上角偏中（top: 10%, left: 25%）
- 尺寸：42x42 像素
- 动画：淡入上移（fadeInUp）
- 暗黑模式：边框改为半透明主题色

### 旋转方块（Square Rotated）

旋转方块是一个实心方块，旋转 -25 度放置在页面左侧中部，使用混合色作为背景。

```scss
.square-rotated {
  top: 50%;
  left: 16%;
  width: 60px;
  height: 60px;
  background-color: color-mix(in srgb, var(--el-color-primary-light-8) 80%, var(--bg-base));
  transform: rotate(-25deg);
  animation-name: fadeInLeft;
}
```

**特点：**
- 位置：左侧垂直居中（top: 50%, left: 16%）
- 尺寸：60x60 像素
- 旋转角度：-25 度
- 动画：从左淡入（fadeInLeft）
- 暗黑模式：背景改为更暗的半透明主题色

### 小圆点（Circle Small）

小圆点是一个实心小圆形，位于页面左下区域，作为装饰细节增加视觉丰富度。

```scss
.circle-small {
  bottom: 26%;
  left: 30%;
  width: 18px;
  height: 18px;
  background-color: var(--el-color-primary-light-8);
  border-radius: 50%;
  animation-name: fadeInUp;
}
```

**特点：**
- 位置：左下角偏上（bottom: 26%, left: 30%）
- 尺寸：18x18 像素
- 动画：淡入上移（fadeInUp）
- 暗黑模式：背景改为半透明主题色

### 右下方块（Square Bottom Right）

右下方块是一个实心方块，旋转 45 度放置在页面右下角，作为平衡左侧装饰的对称元素。

```scss
.square-bottom-right {
  right: 10%;
  bottom: 10%;
  width: 50px;
  height: 50px;
  background-color: var(--el-color-primary-light-8);
  transform: rotate(45deg);
  animation-name: fadeInRight;
}
```

**特点：**
- 位置：右下角（right: 10%, bottom: 10%）
- 尺寸：50x50 像素
- 旋转角度：45 度
- 动画：从右淡入（fadeInRight）
- 暗黑模式：背景改为半透明主题色

### 背景泡泡（Background Bubble）

背景泡泡是一个超大圆形，部分溢出视口右上角，创造出柔和的大面积装饰效果。

```scss
.bg-bubble {
  top: -120px;
  right: -120px;
  width: 360px;
  height: 360px;
  background-color: color-mix(in srgb, var(--el-color-primary-light-8) 80%, var(--bg-base));
  border-radius: 50%;
  animation-name: scaleIn;
  animation-duration: 1.2s;
}
```

**特点：**
- 位置：右上角溢出（top: -120px, right: -120px）
- 尺寸：360x360 像素（超大）
- 动画：缩放淡入（scaleIn），时长 1.2 秒
- 暗黑模式：完全隐藏（`display: none !important`）

### 装饰点（Decorative Dots）

装饰点是三个小圆点，分散放置在页面的不同位置，增加细节层次。

```scss
.dot {
  width: 14px;
  height: 14px;
  background-color: var(--el-color-primary-light-7);
  border-radius: 50%;
  animation-name: bounceIn;
  animation-duration: 0.6s;

  &.dot-top-left {
    top: 140px;
    left: 100px;
  }

  &.dot-top-right {
    top: 140px;
    right: 120px;
  }

  &.dot-center-right {
    top: 46%;
    right: 22%;
    background-color: var(--el-color-primary-light-8);
  }
}
```

**特点：**
- 尺寸：14x14 像素（统一）
- 动画：弹跳淡入（bounceIn），时长 0.6 秒
- 位置：三个点分别在左上、右上、右中
- 暗黑模式：右上角点隐藏，其他点改为半透明主题色

### 叠加方块组（Squares Group）

叠加方块组是三个带阴影的圆角方块，以不同角度叠加在一起，位于页面左下角，是组件中最复杂的装饰元素。

```scss
.squares-group {
  position: absolute;
  bottom: 18px;
  left: 20px;
  width: 140px;
  height: 140px;

  .square {
    position: absolute;
    display: block;
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px rgba(64, 87, 167, 0.12);

    &.square-blue {
      top: 12px;
      left: 30px;
      z-index: 2;
      width: 50px;
      height: 50px;
      background-color: color-mix(in srgb, var(--el-color-primary) 30%, transparent);
      transform: rotate(-10deg);
      animation-delay: 0.2s;
    }

    &.square-pink {
      top: 30px;
      left: 48px;
      z-index: 1;
      width: 70px;
      height: 70px;
      background-color: color-mix(in srgb, var(--el-color-primary) 15%, transparent);
      transform: rotate(10deg);
      animation-delay: 0.2s;
    }

    &.square-purple {
      top: 66px;
      left: 86px;
      z-index: 3;
      width: 32px;
      height: 32px;
      background-color: color-mix(in srgb, var(--el-color-primary) 45%, transparent);
      animation-delay: 0.4s;
    }
  }

  // 装饰线条
  &::after {
    content: '';
    position: absolute;
    top: 86px;
    left: 72px;
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, var(--el-color-primary-light-6), transparent);
    opacity: 0;
    transform: rotate(50deg);
    animation: lineGrow 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 1.2s;
  }
}
```

**特点：**
- 三个方块尺寸不同：50px（蓝）、70px（粉）、32px（紫）
- 使用 `z-index` 控制层叠顺序：紫(3) > 蓝(2) > 粉(1)
- 每个方块有独立的旋转角度和透明度
- 附带一条斜向装饰线，延迟 1.2 秒后渐显
- 所有方块使用 `box-shadow` 增加立体感
- 暗黑模式：调整透明度和阴影颜色

## 动画系统

### 动画类型

组件内置了 6 种基础动画效果，通过组合使用创造丰富的视觉体验。

#### 1. 淡入上移（Fade In Up）

元素从下方淡入并向上移动 30px。

```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation-name: fadeInUp;
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}
```

**应用元素：** 圆形轮廓、小圆点

#### 2. 从左淡入（Fade In Left）

元素从左侧淡入并向右移动 30px。

```scss
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in-left {
  animation-name: fadeInLeft;
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}
```

**应用元素：** 旋转方块、叠加方块组

#### 3. 从右淡入（Fade In Right）

元素从右侧淡入并向左移动 30px。

```scss
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in-right {
  animation-name: fadeInRight;
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}
```

**应用元素：** 右下方块

#### 4. 缩放淡入（Scale In）

元素从 80% 缩放至 100%，同时淡入。

```scss
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation-name: scaleIn;
  animation-duration: 1.2s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}
```

**应用元素：** 背景泡泡

#### 5. 弹跳淡入（Bounce In）

元素以弹跳效果从 30% 缩放至 100%，中间经过 105% 和 90% 的过渡。

```scss
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation-name: bounceIn;
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}
```

**应用元素：** 装饰点

#### 6. 线条生长（Line Grow）

装饰线条从透明渐变到可见。

```scss
@keyframes lineGrow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**应用元素：** 叠加方块组的装饰线

### 动画时序

所有动画都有精心设计的时序安排，创造流畅的视觉叙事：

| 元素 | 动画类型 | 延迟时间 | 时长 |
|------|---------|---------|------|
| 圆形轮廓 | fadeInUp | 0s | 0.8s |
| 旋转方块 | fadeInLeft | 0s | 0.8s |
| 小圆点 | fadeInUp | 0s | 0.8s |
| 右下方块 | fadeInRight | 0s | 0.8s |
| 背景泡泡 | scaleIn | 0s | 1.2s |
| 装饰点 | bounceIn | 0s | 0.6s |
| 方块组-蓝色 | fadeInLeft | 0.2s | 0.8s |
| 方块组-粉色 | fadeInLeft | 0.2s | 0.8s |
| 方块组-紫色 | fadeInLeft | 0.4s | 0.8s |
| 装饰线条 | lineGrow | 1.2s | 0.8s |

**时序策略：**
- 基础几何元素（圆形、方块）立即开始动画，奠定视觉基础
- 背景泡泡使用较长时长（1.2s），创造舒缓的过渡
- 叠加方块组采用阶梯式延迟（0.2s、0.2s、0.4s），形成序列动画
- 装饰线条最后出现（1.2s 延迟），作为动画的收尾

### 缓动函数

所有动画使用统一的缓动函数 `cubic-bezier(0.25, 0.46, 0.45, 0.94)`，这是一个自定义的贝塞尔曲线，提供以下特点：

- **起始加速**：动画开始时快速启动，抓住用户注意力
- **中段匀速**：动画中期保持稳定速度，确保平滑过渡
- **结束减速**：动画结束时缓慢停止，避免突兀感

这个缓动函数类似于 `ease-out`，但更加平滑自然。

## 主题定制

### 亮色模式

亮色模式使用主题色的浅色变体创建清新明亮的视觉效果。

```scss
.geometric-background {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--el-color-primary-light-9) 100%, var(--bg-base)) 0%,
    color-mix(in srgb, var(--el-color-primary-light-9) 80%, var(--bg-base)) 100%
  );
}
```

**颜色方案：**
- 背景渐变：主题色 light-9（最浅）到 light-8（较浅）
- 圆形轮廓：light-8
- 方块元素：light-8（80% 透明度混合）
- 装饰点：light-7 和 light-8
- 叠加方块组：主题色 30%、15%、45% 透明度

### 暗黑模式

暗黑模式降低整体亮度，使用半透明主题色，并隐藏部分装饰元素。

```scss
.dark .geometric-background {
  background: linear-gradient(135deg, #0a0a0a 0%, #141414 100%);

  .geometric-decorations {
    .circle-outline {
      border-color: color-mix(in srgb, var(--el-color-primary) 30%, transparent);
    }

    .square-rotated {
      background-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    }

    .bg-bubble {
      display: none !important;
    }

    .circle-small,
    .square-bottom-right {
      background-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    }

    .dot {
      background-color: color-mix(in srgb, var(--el-color-primary) 25%, transparent);

      &.dot-top-right {
        display: none !important;
      }

      &.dot-center-right {
        background-color: color-mix(in srgb, var(--el-color-primary) 15%, transparent);
      }
    }

    .squares-group {
      .square {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

        &.square-blue {
          background-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
        }

        &.square-pink {
          background-color: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
        }

        &.square-purple {
          background-color: color-mix(in srgb, var(--el-color-primary) 30%, transparent);
        }
      }

      &::after {
        background: linear-gradient(90deg, color-mix(in srgb, var(--el-color-primary) 30%, transparent), transparent);
      }
    }
  }
}
```

**暗黑模式调整：**
- 背景改为纯深色渐变（#0a0a0a → #141414）
- 圆形轮廓透明度降至 30%
- 旋转方块透明度降至 8%
- 背景泡泡完全隐藏
- 小圆点和右下方块透明度降至 20%
- 装饰点透明度降至 15%-25%
- 右上角装饰点隐藏
- 叠加方块组透明度调整为 10%-30%
- 阴影颜色改为黑色

### 自定义主题色

组件完全依赖 Element Plus 的主题变量，因此可以通过修改主题色来自定义几何背景的颜色。

```scss
// 在全局样式中修改主题色
:root {
  --el-color-primary: #ff6b6b;
  --el-color-primary-light-7: #ffa8a8;
  --el-color-primary-light-8: #ffc9c9;
  --el-color-primary-light-9: #ffe3e3;
}
```

组件会自动使用新的主题色生成几何装饰效果，无需修改组件代码。

## 最佳实践

### 1. 确保内容可读性

在几何背景上放置内容时，必须确保内容的可读性和可访问性。

**✅ 推荐做法：**

```vue
<template>
  <AGeometricBackground class="page">
    <div class="content-container">
      <el-card class="content-card">
        <h1>标题</h1>
        <p>内容文本</p>
      </el-card>
    </div>
  </AGeometricBackground>
</template>

<style lang="scss" scoped>
.content-container {
  position: relative;
  z-index: 10;
  padding: 40px;
}

.content-card {
  background: var(--bg-level-1);
  backdrop-filter: blur(10px);
}
</style>
```

**❌ 不推荐做法：**

```vue
<!-- 直接放置文本，可能被几何元素遮挡或难以阅读 -->
<template>
  <AGeometricBackground>
    <p>直接放置的文本</p>
  </AGeometricBackground>
</template>
```

**关键点：**
- 为内容容器设置合适的 `z-index`（建议 ≥ 10）
- 使用半透明背景或毛玻璃效果（`backdrop-filter`）增强可读性
- 使用卡片、面板等容器包裹内容
- 确保文本颜色与背景有足够的对比度

### 2. 响应式适配

在不同屏幕尺寸下，可能需要调整几何背景的显示效果。

**✅ 推荐做法：**

```vue
<template>
  <AGeometricBackground class="responsive-page">
    <div class="content">
      页面内容
    </div>
  </AGeometricBackground>
</template>

<style lang="scss" scoped>
.responsive-page {
  width: 100%;
  min-height: 100vh;
}

// 平板及以下
@media (max-width: 1024px) {
  .responsive-page {
    // 可以通过深度选择器隐藏部分装饰元素
    :deep(.squares-group) {
      display: none;
    }
  }
}

// 手机端
@media (max-width: 768px) {
  .responsive-page {
    // 简化装饰效果
    :deep(.bg-bubble),
    :deep(.dot) {
      display: none;
    }
  }
}
</style>
```

**关键点：**
- 小屏幕下可以隐藏部分装饰元素，保持简洁
- 使用 `:deep()` 深度选择器访问组件内部元素
- 保留核心装饰元素，只移除辅助装饰
- 确保内容在所有屏幕下都可正常显示

### 3. 性能优化

虽然组件已经过优化，但在某些场景下仍需注意性能。

**✅ 推荐做法：**

```vue
<template>
  <AGeometricBackground v-if="showBackground" class="page">
    <div class="content">
      页面内容
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showBackground = ref(false)

// 延迟渲染背景，优先加载主要内容
onMounted(() => {
  setTimeout(() => {
    showBackground.value = true
  }, 100)
})
</script>
```

**关键点：**
- 所有动画使用 CSS 而非 JavaScript，性能更好
- `pointer-events: none` 确保装饰不影响交互性能
- 如需优化首屏加载，可以延迟渲染背景组件
- 在低性能设备上可以考虑禁用部分动画

### 4. 暗黑模式切换

确保暗黑模式切换时，几何背景能够平滑过渡。

**✅ 推荐做法：**

```vue
<template>
  <AGeometricBackground class="app-background">
    <div class="content">
      <button @click="toggleDark">切换主题</button>
    </div>
  </AGeometricBackground>
</template>

<script setup lang="ts">
const layout = useLayout()

const toggleDark = () => {
  layout.dark.value = !layout.dark.value
}
</script>

<style lang="scss" scoped>
.app-background {
  transition: background 0.3s ease;

  // 所有几何元素也需要过渡
  :deep(.geo-element) {
    transition: all 0.3s ease;
  }
}
</style>
```

**关键点：**
- 为背景和几何元素添加 `transition` 实现平滑切换
- 使用全局主题管理器（如 `useLayout`）统一控制主题
- 避免在切换过程中出现闪烁或突变

## 常见问题

### 1. 内容被几何元素遮挡

**问题描述：**
放置在几何背景上的内容被装饰元素遮挡，无法正常点击或显示。

**解决方案：**

```vue
<template>
  <AGeometricBackground>
    <div class="content" style="position: relative; z-index: 10;">
      内容
    </div>
  </AGeometricBackground>
</template>
```

为内容容器添加 `position: relative` 和 `z-index: 10` 或更高的值，确保内容显示在几何元素之上。

### 2. 动画不流畅或卡顿

**问题原因：**
- 设备性能较低
- 页面同时运行多个动画
- 浏览器渲染压力过大

**解决方案：**

```scss
// 在低性能设备上禁用动画
@media (prefers-reduced-motion: reduce) {
  .geometric-background :deep(.geo-element) {
    animation: none !important;
    opacity: 1 !important;
  }
}
```

或者使用 JavaScript 检测性能：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const enableAnimations = ref(true)

onMounted(() => {
  // 检测设备性能
  if (navigator.hardwareConcurrency < 4) {
    enableAnimations.value = false
  }
})
</script>

<style lang="scss" scoped>
.no-animations :deep(.geo-element) {
  animation: none !important;
  opacity: 1 !important;
}
</style>
```

### 3. 暗黑模式下视觉效果不佳

**问题描述：**
在暗黑模式下，几何背景过于明亮或对比度不足。

**解决方案：**

可以通过深度选择器自定义暗黑模式下的样式：

```scss
.dark :deep(.geometric-background) {
  // 进一步降低背景亮度
  background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);

  // 调整几何元素透明度
  .geo-element {
    opacity: 0.6 !important;
  }
}
```

### 4. 组件尺寸无法自适应

**问题描述：**
组件无法撑满父容器，或者尺寸固定无法调整。

**解决方案：**

确保父容器有明确的尺寸定义：

```vue
<template>
  <div class="page-wrapper">
    <AGeometricBackground class="background">
      内容
    </AGeometricBackground>
  </div>
</template>

<style lang="scss" scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.background {
  width: 100%;
  height: 100%;
}
</style>
```

### 5. 在 SSR 环境下渲染异常

**问题描述：**
在服务端渲染（SSR）环境下，组件可能出现样式异常或动画不生效。

**解决方案：**

使用客户端渲染包裹组件：

```vue
<template>
  <ClientOnly>
    <AGeometricBackground>
      内容
    </AGeometricBackground>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ClientOnly } from 'vue'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>
```

或者在 Nuxt 3 中：

```vue
<template>
  <AGeometricBackground v-if="isMounted">
    内容
  </AGeometricBackground>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>
```

## 技术实现细节

### CSS color-mix 函数

组件大量使用 `color-mix()` 函数实现主题色的动态混合，这是一个现代 CSS 特性，用于混合两种颜色。

```scss
// 语法
color-mix(in <color-space>, <color1> <percentage>, <color2>)

// 示例
background-color: color-mix(in srgb, var(--el-color-primary-light-8) 80%, var(--bg-base));
```

**优势：**
- 动态计算，无需预定义所有颜色变体
- 自动适配主题色变化
- 支持透明度混合
- 浏览器原生支持，性能优秀

### animation-fill-mode: forwards

所有动画使用 `animation-fill-mode: forwards` 确保动画结束后保持最终状态。

```scss
.geo-element {
  opacity: 0; // 初始状态
  animation-fill-mode: forwards; // 保持最终状态
}
```

这样可以避免动画播放完成后元素突然消失或回到初始状态的问题。

### pointer-events: none

几何装饰容器使用 `pointer-events: none` 确保不阻碍鼠标事件。

```scss
.geometric-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none; // 鼠标事件穿透
}
```

这样用户可以正常点击几何背景上的内容，而不会被装饰元素拦截。

### 伪元素动画

叠加方块组使用 `::after` 伪元素创建装饰线条，独立控制动画时序。

```scss
.squares-group::after {
  content: '';
  animation: lineGrow 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: 1.2s; // 延迟播放
}
```

伪元素动画不会影响主元素，提供更灵活的动画编排能力。

## 总结

`AGeometricBackground` 是一个功能完善、视觉精美的页面背景组件，通过精心设计的几何元素和动画系统，为页面提供专业的装饰效果。组件完全基于 CSS 实现，性能优秀，支持主题定制和暗黑模式，是构建现代化 Web 应用的理想选择。

**核心优势：**
- 🎨 精美的几何装饰系统
- 🎬 流畅的动画体验
- 🌓 完整的暗黑模式支持
- 🎯 高度可定制化
- ⚡ 优秀的性能表现
- 📱 良好的响应式适配

组件已经在项目的错误页面和登录页面中得到广泛应用，经过充分验证，可以放心使用。
