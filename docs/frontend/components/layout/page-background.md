# AGeometricBackground 几何装饰背景组件

## 介绍

AGeometricBackground 是一个专业的几何装饰背景组件，用于为页面提供美观的视觉装饰效果。该组件采用纯 CSS 实现，包含多种几何形状元素和流畅的入场动画，常用于登录页、注册页、错误页面等需要视觉增强的场景。

**核心特性：**

- **丰富的几何元素** - 包含圆形轮廓、旋转方块、装饰点、背景气泡等多种几何形状
- **流畅入场动画** - 所有元素都配备精心设计的入场动画效果，包括淡入、缩放、弹跳等
- **主题自适应** - 自动适配亮色/暗色主题，暗色模式下会智能调整元素透明度
- **零依赖设计** - 纯 CSS 实现，无需额外的动画库或 JavaScript 逻辑
- **性能优化** - 使用 `pointer-events: none` 确保装饰元素不影响页面交互
- **响应式布局** - 装饰元素位置使用百分比定位，自动适应不同屏幕尺寸
- **插槽内容** - 通过默认插槽放置页面内容，内容自动置于装饰层之上

组件内部实现采用绝对定位布局，所有几何装饰元素都放置在 `.geometric-decorations` 容器内，通过 CSS 动画实现视觉效果。

## 基础用法

### 简单使用

作为页面根标签使用，包装页面内容：

```vue
<template>
  <AGeometricBackground>
    <div class="page-content">
      <!-- 页面内容 -->
      <h1>欢迎使用系统</h1>
      <p>这是一个带有几何装饰背景的页面</p>
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>

<style lang="scss" scoped>
.page-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}
</style>
```

**使用说明：**
- 组件占据容器的 100% 宽高
- 内容通过默认插槽传入
- 建议为内容区域设置较高的 `z-index` 确保显示在装饰层之上

### 全屏背景

创建占据整个视口的全屏背景：

```vue
<template>
  <AGeometricBackground class="fullscreen-bg">
    <div class="centered-content">
      <div class="content-card">
        <h1>全屏几何背景</h1>
        <p>装饰元素分布在整个视口范围内</p>
      </div>
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>

<style lang="scss" scoped>
.fullscreen-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.centered-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.content-card {
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}
</style>
```

## 登录页应用

### 标准登录页

项目中登录页的典型使用方式，结合品牌展示和登录表单：

```vue
<template>
  <AGeometricBackground class="login-page">
    <!-- Logo 区域 -->
    <a class="logo" href="/" target="_blank">
      <img src="@/assets/logo/logo.png" class="icon" alt="Logo" />
      <h1 class="title">RuoYi Plus</h1>
    </a>

    <!-- 中间插画 -->
    <div class="illustration">
      <img src="@/assets/images/login_icon.svg" alt="Login" />
    </div>

    <!-- 底部标语 -->
    <div class="slogan">
      <h1>欢迎使用企业级管理系统</h1>
      <p>高效、安全、稳定的后台管理解决方案</p>
    </div>

    <!-- 主题切换按钮 -->
    <div class="theme-toggle" @click="toggleTheme">
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const layout = useLayout()
const isDark = computed(() => layout.dark.value)

const toggleTheme = () => {
  layout.toggleDark()
}
</script>

<style lang="scss" scoped>
.login-page {
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
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: translateX(2px);
  }

  .icon {
    width: 46px;
    height: 46px;
    transition: transform 0.3s ease;
  }

  &:hover .icon {
    transform: scale(1.05);
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
  width: 40%;
  z-index: 10;
  transform: translate(-50%, -50%);
  animation: slideIn 0.6s ease-out forwards;
}

.slogan {
  position: absolute;
  bottom: 80px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.6s ease-out forwards;

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

.theme-toggle {
  position: absolute;
  top: 3%;
  right: 3%;
  z-index: 100;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  background: rgba(var(--el-color-primary-rgb), 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--el-color-primary-rgb), 0.2);
    transform: scale(1.1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

### 分屏登录布局

左侧品牌展示 + 右侧登录表单的经典布局：

```vue
<template>
  <div class="login-layout">
    <!-- 左侧品牌区域 -->
    <AGeometricBackground class="brand-section">
      <div class="brand-content">
        <img src="@/assets/logo/logo.png" class="logo" alt="Logo" />
        <h1 class="brand-title">企业管理系统</h1>
        <p class="brand-desc">专业的企业级解决方案</p>
      </div>
    </AGeometricBackground>

    <!-- 右侧登录表单 -->
    <div class="form-section">
      <div class="login-card">
        <h2>用户登录</h2>
        <el-form :model="form" class="login-form">
          <el-form-item>
            <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
          </el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  console.log('登录', form)
}
</script>

<style lang="scss" scoped>
.login-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
}

.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: var(--app-text);

  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }

  .brand-title {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }

  .brand-desc {
    font-size: 16px;
    opacity: 0.8;
    margin: 0;
  }
}

.form-section {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
}

.login-card {
  width: 360px;
  padding: 40px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 32px 0;
    text-align: center;
    color: var(--app-text);
  }

  .login-btn {
    width: 100%;
    height: 44px;
    margin-top: 16px;
  }
}
</style>
```

## 错误页面应用

### 404 页面

页面未找到错误页的实现：

```vue
<template>
  <AGeometricBackground class="error-page-404">
    <div class="error-container">
      <div class="error-card">
        <!-- 404 数字展示 -->
        <div class="error-number">
          <span class="number animate-slide-in" style="--delay: 0.2s">4</span>
          <span class="number zero animate-slide-in" style="--delay: 0.4s">0</span>
          <span class="number animate-slide-in" style="--delay: 0.6s">4</span>
        </div>

        <!-- 错误信息 -->
        <div class="error-content">
          <h1 class="error-title">页面走丢了！</h1>
          <p class="error-description">
            对不起，您正在寻找的页面不存在。<br />
            可能是链接错误或页面已被移动。
          </p>

          <!-- 操作按钮 -->
          <div class="error-actions">
            <router-link to="/index" class="btn-primary">
              <span>🏠</span> 返回首页
            </router-link>
            <button @click="goBack" class="btn-secondary">
              <span>↩️</span> 返回上页
            </button>
          </div>
        </div>
      </div>
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/index')
  }
}
</script>

<style lang="scss" scoped>
.error-page-404 {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.error-container {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-card {
  background: var(--bg-level-1);
  border-radius: 24px;
  padding: 60px 40px;
  width: 600px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--el-border-color-lighter);
  text-align: center;
}

.error-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;

  .number {
    font-size: 120px;
    font-weight: 800;
    color: var(--el-color-primary);
    opacity: 0;
    animation: slideInScale 0.8s ease-out forwards;
    animation-delay: var(--delay, 0s);

    &.zero {
      color: #cbd5e0;
    }
  }
}

.error-content {
  .error-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--app-text);
    margin-bottom: 16px;
    opacity: 0;
    animation: slideUp 0.6s ease-out 0.8s forwards;
  }

  .error-description {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin-bottom: 40px;
    opacity: 0;
    animation: slideUp 0.6s ease-out 1s forwards;
  }

  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    opacity: 0;
    animation: slideUp 0.6s ease-out 1.2s forwards;

    .btn-primary,
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--el-color-primary);
      color: white;
      box-shadow: 0 4px 15px rgba(var(--el-color-primary-rgb), 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--el-color-primary-rgb), 0.4);
      }
    }

    .btn-secondary {
      background: rgba(var(--el-color-primary-rgb), 0.08);
      color: var(--el-color-primary);
      border: 1px solid rgba(var(--el-color-primary-rgb), 0.2);

      &:hover {
        background: rgba(var(--el-color-primary-rgb), 0.12);
        transform: translateY(-2px);
      }
    }
  }
}

@keyframes slideInScale {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

### 401 权限错误页

无权限访问页面的实现：

```vue
<template>
  <AGeometricBackground class="error-page-401">
    <div class="error-container">
      <div class="error-card">
        <!-- 401 数字展示 -->
        <div class="error-number">
          <span class="number" style="--delay: 0.2s">4</span>
          <span class="number red" style="--delay: 0.4s">0</span>
          <span class="number" style="--delay: 0.6s">1</span>
        </div>

        <!-- 锁图标 -->
        <div class="lock-icon">
          <div class="lock-body">
            <div class="lock-shackle"></div>
            <div class="keyhole"></div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div class="error-content">
          <h1 class="error-title">访问被拒绝！</h1>
          <p class="error-description">
            对不起，您没有访问权限。<br />
            请联系管理员获取相关权限。
          </p>

          <div class="error-actions">
            <router-link to="/" class="btn-primary">
              <span>🏠</span> 返回首页
            </router-link>
            <button @click="goBack" class="btn-secondary">
              <span>↩️</span> 返回上页
            </button>
          </div>
        </div>
      </div>
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  if (route.query.noGoBack) {
    router.push({ path: '/' })
  } else if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ path: '/' })
  }
}
</script>

<style lang="scss" scoped>
.error-page-401 {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.error-container {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-card {
  background: var(--bg-level-1);
  border-radius: 24px;
  padding: 60px 40px;
  width: 600px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--el-border-color-lighter);
  text-align: center;
}

.error-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;

  .number {
    font-size: 120px;
    font-weight: 800;
    color: var(--el-color-primary);
    opacity: 0;
    animation: slideInScale 0.8s ease-out forwards;
    animation-delay: var(--delay, 0s);

    &.red {
      color: #e53e3e;
    }
  }
}

.lock-icon {
  margin-bottom: 40px;
  opacity: 0;
  animation: slideInScale 0.8s ease-out 0.8s forwards;

  .lock-body {
    display: inline-block;
    width: 60px;
    height: 45px;
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    border-radius: 8px;
    position: relative;
    box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);

    .lock-shackle {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      width: 35px;
      height: 25px;
      border: 5px solid #e53e3e;
      border-bottom: none;
      border-radius: 20px 20px 0 0;
    }

    .keyhole {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 12px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50% 50% 0 0;

      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 3px;
        height: 8px;
        background: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

.error-content {
  .error-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--app-text);
    margin-bottom: 16px;
    opacity: 0;
    animation: slideUp 0.6s ease-out 1s forwards;
  }

  .error-description {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin-bottom: 40px;
    opacity: 0;
    animation: slideUp 0.6s ease-out 1.2s forwards;
  }

  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    opacity: 0;
    animation: slideUp 0.6s ease-out 1.4s forwards;

    .btn-primary,
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--el-color-primary);
      color: white;
    }

    .btn-secondary {
      background: rgba(var(--el-color-primary-rgb), 0.08);
      color: var(--el-color-primary);
    }
  }
}

@keyframes slideInScale {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

## 几何元素详解

### 元素分布

组件内置的几何装饰元素及其位置：

| 元素名称 | CSS 类名 | 位置 | 尺寸 | 说明 |
|---------|---------|------|------|------|
| 圆形轮廓 | `.circle-outline` | top: 10%, left: 25% | 42px × 42px | 2px 边框的空心圆 |
| 旋转方块 | `.square-rotated` | top: 50%, left: 16% | 60px × 60px | -25° 旋转的方块 |
| 小圆点 | `.circle-small` | bottom: 26%, left: 30% | 18px × 18px | 实心小圆 |
| 右下方块 | `.square-bottom-right` | right: 10%, bottom: 10% | 50px × 50px | 45° 旋转的方块 |
| 背景气泡 | `.bg-bubble` | top: -120px, right: -120px | 360px × 360px | 大型圆形背景装饰 |
| 左上装饰点 | `.dot-top-left` | top: 140px, left: 100px | 14px × 14px | 装饰性小圆点 |
| 右上装饰点 | `.dot-top-right` | top: 140px, right: 120px | 14px × 14px | 装饰性小圆点 |
| 中右装饰点 | `.dot-center-right` | top: 46%, right: 22% | 14px × 14px | 装饰性小圆点 |
| 叠加方块组 | `.squares-group` | bottom: 18px, left: 20px | 140px × 140px | 三色叠加方块组合 |

### 叠加方块组结构

左下角的叠加方块组由三个不同颜色和大小的方块组成：

```
┌─────────────────────────────────┐
│                                 │
│     ┌──────┐                    │
│     │ Blue │  50×50, rotate(-10°)
│     │ 30%  │  z-index: 2
│     └──────┘                    │
│          ┌─────────┐            │
│          │  Pink   │  70×70, rotate(10°)
│          │  15%    │  z-index: 1
│          └─────────┘            │
│               ┌────┐            │
│               │Purp│  32×32, no rotation
│               │45% │  z-index: 3
│               └────┘            │
│                                 │
│   ─────────────  装饰线条        │
└─────────────────────────────────┘
```

**方块颜色配置：**

| 方块 | 类名 | 透明度 | 旋转角度 | 层级 |
|------|------|--------|----------|------|
| 蓝色方块 | `.square-blue` | 30% | -10° | 2 |
| 粉色方块 | `.square-pink` | 15% | 10° | 1 |
| 紫色方块 | `.square-purple` | 45% | 0° | 3 |

## 动画系统

### 内置动画

组件定义了多种入场动画效果：

| 动画名称 | 类名 | 效果 | 时长 | 应用元素 |
|---------|------|------|------|----------|
| fadeInUp | `.animate-fade-in-up` | 从下向上淡入 | 0.8s | circle-outline, circle-small |
| fadeInLeft | `.animate-fade-in-left` | 从左向右淡入 | 0.8s | square-rotated |
| fadeInRight | `.animate-fade-in-right` | 从右向左淡入 | 0.8s | square-bottom-right |
| scaleIn | `.animate-scale-in` | 缩放淡入 | 1.2s | bg-bubble |
| bounceIn | `.animate-bounce-in` | 弹跳淡入 | 0.6s | 所有 dot 元素 |

### 动画关键帧定义

```scss
// 从下向上淡入
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

// 从左向右淡入
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

// 从右向左淡入
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

// 缩放淡入
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

// 弹跳淡入
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

// 线条生长
@keyframes lineGrow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 动画参数

```scss
.geo-element {
  position: absolute;
  opacity: 0;
  animation-fill-mode: forwards;      // 动画结束后保持最终状态
  animation-duration: 0.8s;           // 默认动画时长
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); // 缓动函数
}
```

### 动画延迟配置

叠加方块组使用延迟创建错落效果：

```scss
.animate-fade-in-left-rotated {
  animation-name: fadeInLeft;
  animation-delay: 0.2s;  // 蓝色方块
}

.animate-fade-in-left-no-rotation {
  animation-name: fadeInLeft;
  animation-delay: 0.4s;  // 紫色方块
}
```

## 主题适配

### 亮色模式

亮色模式下的颜色配置：

```scss
// 背景渐变
background: linear-gradient(
  135deg,
  color-mix(in srgb, $primary-light-9 100%, var(--bg-base)) 0%,
  color-mix(in srgb, $primary-light-8 80%, var(--bg-base)) 100%
);

// 几何元素颜色
.circle-outline {
  border-color: var(--el-color-primary-light-8);
}

.square-rotated {
  background-color: color-mix(in srgb, $primary-light-8 80%, var(--bg-base));
}

.circle-small,
.square-bottom-right {
  background-color: var(--el-color-primary-light-8);
}

.dot {
  background-color: var(--el-color-primary-light-7);
}

// 方块组阴影
.squares-group .square {
  box-shadow: 0 8px 24px rgba(64, 87, 167, 0.12);
}
```

### 暗色模式

暗色模式下会自动调整元素样式：

```scss
.dark .geometric-background {
  // 暗色背景
  background: linear-gradient(135deg, #0a0a0a 0%, #141414 100%);

  .geometric-decorations {
    // 圆形轮廓 - 降低透明度
    .circle-outline {
      border-color: color-mix(in srgb, $primary-base 30%, transparent);
    }

    // 旋转方块 - 大幅降低透明度
    .square-rotated {
      background-color: color-mix(in srgb, $primary-base 8%, transparent);
    }

    // 隐藏右上角大气泡
    .bg-bubble {
      display: none !important;
    }

    // 小圆和方块 - 降低透明度
    .circle-small,
    .square-bottom-right {
      background-color: color-mix(in srgb, $primary-base 20%, transparent);
    }

    // 装饰点调整
    .dot {
      background-color: color-mix(in srgb, $primary-base 25%, transparent);

      // 隐藏右上角装饰点
      &.dot-top-right {
        display: none !important;
      }

      &.dot-center-right {
        background-color: color-mix(in srgb, $primary-base 15%, transparent);
      }
    }

    // 方块组调整
    .squares-group {
      .square {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

        &.square-blue {
          background-color: color-mix(in srgb, $primary-base 20%, transparent);
        }

        &.square-pink {
          background-color: color-mix(in srgb, $primary-base 10%, transparent);
        }

        &.square-purple {
          background-color: color-mix(in srgb, $primary-base 30%, transparent);
        }
      }

      // 装饰线条调整
      &::after {
        background: linear-gradient(
          90deg,
          color-mix(in srgb, $primary-base 30%, transparent),
          transparent
        );
      }
    }
  }
}
```

### 暗色模式变化总结

| 元素 | 亮色模式 | 暗色模式 |
|------|----------|----------|
| 背景 | 主题色渐变 | 深色渐变 (#0a0a0a → #141414) |
| 圆形轮廓 | primary-light-8 | 30% 透明度 |
| 旋转方块 | 80% 混合 | 8% 透明度 |
| 背景气泡 | 显示 | **隐藏** |
| 右上装饰点 | 显示 | **隐藏** |
| 方块组阴影 | rgba(64, 87, 167, 0.12) | rgba(0, 0, 0, 0.3) |

## API

### Slots

| 插槽名 | 说明 | 作用域 |
|--------|------|--------|
| default | 页面内容区域，内容会显示在几何装饰之上 | - |

### CSS 变量

组件使用的 CSS 变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--el-color-primary` | 主题主色 | #409eff |
| `--el-color-primary-light-7` | 主题色浅色7级 | - |
| `--el-color-primary-light-8` | 主题色浅色8级 | - |
| `--el-color-primary-light-9` | 主题色浅色9级 | - |
| `--bg-base` | 基础背景色 | #ffffff |
| `--radius-md` | 中等圆角 | 8px |

### 类型定义

```typescript
/**
 * AGeometricBackground 组件
 * 纯装饰性背景组件，无需传入任何 props
 */
interface AGeometricBackgroundProps {
  // 无 props，通过插槽传入内容
}

/**
 * 几何元素类型
 */
type GeoElementType =
  | 'circle-outline'     // 圆形轮廓
  | 'square-rotated'     // 旋转方块
  | 'circle-small'       // 小圆点
  | 'square-bottom-right' // 右下方块
  | 'bg-bubble'          // 背景气泡
  | 'dot'                // 装饰点
  | 'squares-group'      // 叠加方块组

/**
 * 动画类型
 */
type AnimationType =
  | 'fadeInUp'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'bounceIn'
  | 'lineGrow'
```

## 自定义扩展

### 修改元素颜色

通过覆盖 CSS 变量自定义配色：

```vue
<template>
  <AGeometricBackground class="custom-colors">
    <div class="content">自定义配色</div>
  </AGeometricBackground>
</template>

<style lang="scss" scoped>
.custom-colors {
  // 自定义主题色
  --el-color-primary: #10b981;
  --el-color-primary-light-7: #6ee7b7;
  --el-color-primary-light-8: #a7f3d0;
  --el-color-primary-light-9: #d1fae5;
}
</style>
```

### 添加自定义几何元素

扩展组件添加新的装饰元素：

```vue
<template>
  <div class="extended-background">
    <AGeometricBackground>
      <slot />
    </AGeometricBackground>

    <!-- 自定义装饰元素 -->
    <div class="custom-decorations">
      <div class="triangle animate-spin"></div>
      <div class="ring animate-pulse"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'
</script>

<style lang="scss" scoped>
.extended-background {
  position: relative;
  width: 100%;
  height: 100%;
}

.custom-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;

  .triangle {
    position: absolute;
    top: 20%;
    right: 15%;
    width: 0;
    height: 0;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
    border-bottom: 52px solid rgba(var(--el-color-primary-rgb), 0.2);
  }

  .ring {
    position: absolute;
    bottom: 30%;
    right: 25%;
    width: 80px;
    height: 80px;
    border: 3px solid rgba(var(--el-color-primary-rgb), 0.3);
    border-radius: 50%;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

.animate-spin {
  animation: spin 20s linear infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
```

### 响应式调整

为移动端优化装饰元素：

```scss
// 响应式断点
@media (max-width: 768px) {
  .geometric-background {
    .geometric-decorations {
      // 隐藏部分装饰元素
      .bg-bubble,
      .square-bottom-right {
        display: none;
      }

      // 缩小元素尺寸
      .circle-outline {
        width: 28px;
        height: 28px;
      }

      .square-rotated {
        width: 40px;
        height: 40px;
      }

      // 调整方块组位置
      .squares-group {
        transform: scale(0.7);
        bottom: 10px;
        left: 10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .geometric-background {
    .geometric-decorations {
      // 只保留最基础的装饰
      .circle-outline,
      .circle-small,
      .dot {
        display: none;
      }
    }
  }
}
```

## 最佳实践

### 1. 内容层级管理

确保内容显示在装饰层之上：

```vue
<template>
  <AGeometricBackground>
    <div class="content-wrapper">
      <!-- 内容 -->
    </div>
  </AGeometricBackground>
</template>

<style scoped>
.content-wrapper {
  position: relative;
  z-index: 10; /* 确保在装饰层之上 */
}
</style>
```

### 2. 使用半透明卡片

配合毛玻璃效果增强视觉层次：

```scss
.content-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

// 暗色模式
.dark .content-card {
  background: rgba(30, 30, 30, 0.9);
}
```

### 3. 避免内容溢出

组件使用 `overflow: hidden`，确保内容不会溢出：

```scss
.geometric-background {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden; // 防止装饰元素溢出
}
```

### 4. 性能优化

动画使用 GPU 加速属性：

```scss
.geo-element {
  will-change: transform, opacity;
  transform: translateZ(0); // 触发 GPU 加速
}
```

### 5. 暗色模式适配

确保内容在两种主题下都清晰可读：

```scss
.content-text {
  color: var(--app-text);
}

.dark .content-text {
  color: rgba(255, 255, 255, 0.85);
}
```

### 6. 响应式布局

移动端适当简化装饰效果：

```scss
@media (max-width: 768px) {
  .geometric-background {
    // 简化装饰，提升性能
    .bg-bubble,
    .squares-group {
      display: none;
    }
  }
}
```

### 7. 可访问性考虑

装饰元素不影响交互：

```scss
.geometric-decorations {
  pointer-events: none; // 不阻止鼠标事件
  user-select: none;    // 不可选中
}
```

## 常见问题

### 1. 装饰元素遮挡内容

**问题原因：**
- 内容区域未设置 `z-index`
- 内容区域未设置 `position: relative`

**解决方案：**
```scss
.content-area {
  position: relative;
  z-index: 10;
}
```

### 2. 动画不流畅

**问题原因：**
- 浏览器未启用 GPU 加速
- 动画属性未优化

**解决方案：**
```scss
.geo-element {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}
```

### 3. 暗色模式下颜色不正确

**问题原因：**
- CSS 变量未正确继承
- 暗色模式类名未正确添加

**解决方案：**
```scss
// 确保使用 .dark 类选择器
.dark .geometric-background {
  // 暗色模式样式
}

// 或使用媒体查询
@media (prefers-color-scheme: dark) {
  .geometric-background {
    // 暗色模式样式
  }
}
```

### 4. 背景渐变在某些浏览器显示异常

**问题原因：**
- `color-mix()` 函数兼容性问题

**解决方案：**
```scss
.geometric-background {
  // 回退方案
  background: linear-gradient(135deg, #e8f4fc 0%, #d6e8f5 100%);

  // 现代浏览器
  @supports (background: color-mix(in srgb, red 50%, blue)) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--el-color-primary-light-9) 100%, var(--bg-base)) 0%,
      color-mix(in srgb, var(--el-color-primary-light-8) 80%, var(--bg-base)) 100%
    );
  }
}
```

### 5. 移动端性能问题

**问题原因：**
- 动画元素过多
- 未针对移动端优化

**解决方案：**
```scss
@media (max-width: 768px) {
  .geometric-background {
    // 减少动画元素
    .bg-bubble,
    .squares-group,
    .dot-center-right {
      display: none;
    }

    // 简化动画
    .geo-element {
      animation-duration: 0.5s;
    }
  }
}
```

### 6. 组件高度不正确

**问题原因：**
- 父容器未设置高度
- 使用百分比高度但父级无高度

**解决方案：**
```scss
// 方案 1: 使用视口单位
.geometric-background {
  min-height: 100vh;
}

// 方案 2: 确保父级有高度
.parent-container {
  height: 100%;
}
```

### 7. 与其他组件样式冲突

**问题原因：**
- CSS 变量名冲突
- 全局样式覆盖

**解决方案：**
```scss
// 使用 scoped 样式
<style lang="scss" scoped>
.geometric-background {
  // 组件特定样式
}
</style>

// 或使用更具体的选择器
.my-page .geometric-background {
  // 页面特定样式
}
```

## 使用场景

### 适用场景

- **登录/注册页面** - 提供专业的视觉背景
- **错误页面 (404/401/500)** - 减少空白感
- **落地页/宣传页** - 增强品牌形象
- **欢迎引导页** - 吸引用户注意
- **空状态页面** - 装饰空白区域

### 不适用场景

- **数据密集型页面** - 会分散注意力
- **表单操作页面** - 影响用户专注
- **移动端小屏幕** - 装饰元素过多
- **打印页面** - 增加打印成本

## 完整示例

### 综合应用示例

```vue
<template>
  <AGeometricBackground class="welcome-page">
    <!-- Logo -->
    <header class="page-header">
      <img src="@/assets/logo/logo.png" class="logo" alt="Logo" />
      <nav class="nav-links">
        <a href="#features">功能</a>
        <a href="#about">关于</a>
        <a href="#contact">联系</a>
      </nav>
    </header>

    <!-- 主内容 -->
    <main class="page-main">
      <div class="hero-section">
        <h1 class="hero-title">
          企业级管理系统
          <span class="highlight">解决方案</span>
        </h1>
        <p class="hero-desc">
          高效、安全、稳定的后台管理框架，助力企业数字化转型
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goLogin">
            立即体验
          </el-button>
          <el-button size="large" @click="goDoc">
            查看文档
          </el-button>
        </div>
      </div>

      <!-- 特性展示 -->
      <div class="features-section">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>
      </div>
    </main>

    <!-- 主题切换 -->
    <div class="theme-switch" @click="toggleTheme">
      {{ isDark ? '🌙' : '☀️' }}
    </div>
  </AGeometricBackground>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AGeometricBackground from '@/components/ATheme/AGeometricBackground.vue'

const router = useRouter()
const layout = useLayout()
const isDark = computed(() => layout.dark.value)

const features = ref([
  { icon: '🚀', title: '高性能', desc: '基于 Vue 3 + Vite，极致开发体验' },
  { icon: '🔒', title: '安全可靠', desc: '完善的权限管理和数据加密' },
  { icon: '📦', title: '开箱即用', desc: '丰富的组件库和代码生成器' },
  { icon: '🎨', title: '主题定制', desc: '支持亮暗主题和自定义配色' },
])

const goLogin = () => router.push('/login')
const goDoc = () => window.open('https://docs.example.com', '_blank')
const toggleTheme = () => layout.toggleDark()
</script>

<style lang="scss" scoped>
.welcome-page {
  position: relative;
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);

  .logo {
    width: 40px;
    height: 40px;
  }

  .nav-links {
    display: flex;
    gap: 32px;

    a {
      color: var(--app-text);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.page-main {
  position: relative;
  z-index: 10;
  padding-top: 120px;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;

  .hero-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--app-text);
    margin-bottom: 24px;
    line-height: 1.2;

    .highlight {
      color: var(--el-color-primary);
    }
  }

  .hero-desc {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    margin-bottom: 40px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}

.features-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .feature-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text);
    margin: 0 0 12px;
  }

  .feature-desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
    line-height: 1.6;
  }
}

.theme-switch {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 100;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--bg-level-1);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

// 暗色模式
.dark {
  .page-header {
    background: rgba(20, 20, 20, 0.8);
  }

  .feature-card {
    background: rgba(30, 30, 30, 0.9);
  }
}

// 响应式
@media (max-width: 1024px) {
  .features-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px !important;
  }

  .features-section {
    grid-template-columns: 1fr;
  }

  .page-header .nav-links {
    display: none;
  }
}
</style>
```

这个示例展示了 AGeometricBackground 组件在实际项目中的完整应用，包括：
- 固定导航栏与毛玻璃效果
- 英雄区域文字和按钮
- 特性卡片网格布局
- 主题切换按钮
- 响应式布局适配
- 暗色模式支持
