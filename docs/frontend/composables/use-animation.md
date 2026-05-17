# useAnimation

动画工具组合函数，基于 Animate.css 提供了丰富的动画效果和管理功能，用于实现页面切换动画、组件过渡效果和 DOM 元素动画控制。

## 介绍

`useAnimation` 是一个功能强大的动画管理 Composable，封装了 Animate.css 动画库的完整能力，为 Vue 组件提供统一的动画控制接口。该组合函数在整个前端框架中被广泛使用，包括页面路由切换动画、侧边栏菜单动画、Logo 过渡效果和搜索表单动画等场景。

**核心特性：**

- **动画效果库** - 提供 17 种预定义的 Animate.css 动画效果常量，涵盖进入、离开、强调等类型
- **动画配置系统** - 支持创建和管理进入/离开动画配置对象，实现 Vue Transition 集成
- **预设配置** - 内置 `searchAnimate`、`menuSearchAnimate`、`logoAnimate` 三种常用场景预设
- **随机动画模式** - 支持随机选择动画效果，为用户提供多样化的视觉体验
- **DOM 动画控制** - 提供 `applyAnimation` 方法直接为 DOM 元素应用动画，支持回调函数
- **状态管理** - 响应式跟踪当前动画状态，支持动态切换动画效果

## 架构设计

### 整体架构

```text
useAnimation
├── 常量导出 (模块级别)
│   ├── ANIMATE_PREFIX          # 动画类名前缀
│   ├── animationEffects        # 动画效果枚举对象
│   ├── animateList             # 随机动画列表
│   ├── defaultAnimate          # 默认动画效果
│   ├── createAnimationConfig   # 配置工厂函数
│   ├── searchAnimate           # 搜索动画预设
│   ├── menuSearchAnimate       # 菜单搜索动画预设
│   └── logoAnimate             # Logo 动画预设
│
└── Composable 返回值
    ├── 响应式状态
    │   ├── currentAnimation    # 当前动画
    │   ├── isRandomAnimation   # 随机模式开关
    │   ├── currentConfig       # 当前配置
    │   └── nextAnimation       # 下一个动画（计算属性）
    │
    └── 方法
        ├── getRandomAnimation  # 获取随机动画
        ├── setAnimation        # 设置当前动画
        ├── toggleRandomAnimation # 切换随机模式
        ├── setAnimationConfig  # 设置动画配置
        └── applyAnimation      # 应用 DOM 动画
```

### 设计原则

1. **模块级常量导出** - `animationEffects`、预设配置等常量在模块级别导出，支持直接导入使用，无需调用 Composable
2. **Composable 实例化** - 状态管理相关功能通过 `useAnimation()` 实例化，每个组件获得独立的状态
3. **Animate.css 集成** - 动画类名遵循 Animate.css 规范，使用 `animate__animated` 前缀
4. **Vue Transition 兼容** - `AnimationConfig` 接口设计与 Vue Transition 的 `enter-active-class` 和 `leave-active-class` 完美配合

### 依赖关系

```typescript
// main.scss 中引入 Animate.css
@use 'animate.css';

// 组件中使用
import { useAnimation, logoAnimate, menuSearchAnimate } from '@/composables/useAnimation'
```

## 动画效果库

### 动画效果常量

`animationEffects` 对象包含所有预定义的动画效果，每个效果都是一个完整的 CSS 类名字符串：

```typescript
// 动画库的公共前缀
const ANIMATE_PREFIX = 'animate__animated '

export const animationEffects = {
  // 无动画
  EMPTY: '',

  // 强调动画
  PULSE: `${ANIMATE_PREFIX}animate__pulse`,
  RUBBER_BAND: `${ANIMATE_PREFIX}animate__rubberBand`,

  // 弹跳进入动画
  BOUNCE_IN: `${ANIMATE_PREFIX}animate__bounceIn`,
  BOUNCE_IN_LEFT: `${ANIMATE_PREFIX}animate__bounceInLeft`,

  // 渐入动画
  FADE_IN: `${ANIMATE_PREFIX}animate__fadeIn`,
  FADE_IN_LEFT: `${ANIMATE_PREFIX}animate__fadeInLeft`,
  FADE_IN_DOWN: `${ANIMATE_PREFIX}animate__fadeInDown`,
  FADE_IN_UP: `${ANIMATE_PREFIX}animate__fadeInUp`,

  // 翻转动画
  FLIP_IN_X: `${ANIMATE_PREFIX}animate__flipInX`,

  // 光速动画
  LIGHT_SPEED_IN_LEFT: `${ANIMATE_PREFIX}animate__lightSpeedInLeft`,
  LIGHT_SPEED_IN: `${ANIMATE_PREFIX}animate__lightSpeedIn`,

  // 旋转动画
  ROTATE_IN_DOWN_LEFT: `${ANIMATE_PREFIX}animate__rotateInDownLeft`,

  // 滚动动画
  ROLL_IN: `${ANIMATE_PREFIX}animate__rollIn`,

  // 缩放动画
  ZOOM_IN: `${ANIMATE_PREFIX}animate__zoomIn`,
  ZOOM_IN_DOWN: `${ANIMATE_PREFIX}animate__zoomInDown`,

  // 滑入动画
  SLIDE_IN_LEFT: `${ANIMATE_PREFIX}animate__slideInLeft`,

  // 渐出动画
  FADE_OUT: `${ANIMATE_PREFIX}animate__fadeOut`
}
```

### 动画效果分类

#### 强调动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 脉冲 | `PULSE` | `animate__pulse` | 元素轻微缩放和颤动，用于吸引注意力 |
| 橡皮筋 | `RUBBER_BAND` | `animate__rubberBand` | 元素弹性拉伸效果，模拟橡皮筋弹跳 |

#### 弹跳进入动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 弹跳进入 | `BOUNCE_IN` | `animate__bounceIn` | 从小变大带弹跳效果进入 |
| 左侧弹跳进入 | `BOUNCE_IN_LEFT` | `animate__bounceInLeft` | 从左侧弹跳滑入 |

#### 渐变动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 渐入 | `FADE_IN` | `animate__fadeIn` | 从透明到不透明的渐变效果 |
| 左侧渐入 | `FADE_IN_LEFT` | `animate__fadeInLeft` | 从左侧滑入同时渐入 |
| 上方渐入 | `FADE_IN_DOWN` | `animate__fadeInDown` | 从上方滑入同时渐入 |
| 下方渐入 | `FADE_IN_UP` | `animate__fadeInUp` | 从下方滑入同时渐入 |
| 渐出 | `FADE_OUT` | `animate__fadeOut` | 从不透明到透明的渐变效果 |

#### 翻转动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| X轴翻转进入 | `FLIP_IN_X` | `animate__flipInX` | 沿 X 轴翻转进入，3D 效果 |

#### 光速动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 左侧光速进入 | `LIGHT_SPEED_IN_LEFT` | `animate__lightSpeedInLeft` | 从左侧光速滑入，带倾斜效果 |
| 光速进入 | `LIGHT_SPEED_IN` | `animate__lightSpeedIn` | 从右侧光速滑入，带倾斜效果 |

#### 旋转动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 左下旋转进入 | `ROTATE_IN_DOWN_LEFT` | `animate__rotateInDownLeft` | 从左下方旋转进入 |

#### 滚动动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 滚动进入 | `ROLL_IN` | `animate__rollIn` | 从左侧滚动进入，带旋转效果 |

#### 缩放动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 缩放进入 | `ZOOM_IN` | `animate__zoomIn` | 从小到大缩放进入 |
| 上方缩放进入 | `ZOOM_IN_DOWN` | `animate__zoomInDown` | 从上方缩放滑入 |

#### 滑入动画

| 效果名称 | 常量名 | CSS 类名 | 效果描述 |
|---------|--------|----------|----------|
| 左侧滑入 | `SLIDE_IN_LEFT` | `animate__slideInLeft` | 从左侧平滑滑入 |

### 随机动画列表

`animateList` 数组包含所有可用于随机选择的动画效果：

```typescript
// 过滤掉空动画，生成随机动画列表
export const animateList: string[] = Object.values(animationEffects)
  .filter((effect) => effect !== animationEffects.EMPTY)

// 包含 16 个动画效果
console.log(animateList.length) // 16
```

## 动画配置系统

### AnimationConfig 接口

```typescript
/**
 * 动画配置接口
 * 定义进入和离开动画的结构
 */
export interface AnimationConfig {
  /** 进入时的动画类名 */
  enter: string
  /** 离开时的动画类名 */
  leave: string
}
```

### 创建动画配置

使用 `createAnimationConfig` 工厂函数创建自定义动画配置：

```typescript
import { createAnimationConfig, animationEffects } from '@/composables/useAnimation'

// 创建自定义配置
const myConfig = createAnimationConfig(
  animationEffects.BOUNCE_IN,  // 进入动画
  animationEffects.FADE_OUT    // 离开动画
)

// 结果
console.log(myConfig)
// {
//   enter: 'animate__animated animate__bounceIn',
//   leave: 'animate__animated animate__fadeOut'
// }
```

### 预定义配置

框架内置三种常用场景的动画预设：

```typescript
// 搜索动画配置 - 无动画效果
export const searchAnimate = createAnimationConfig(
  animationEffects.EMPTY,  // 无进入动画
  animationEffects.EMPTY   // 无离开动画
)

// 菜单搜索动画配置 - 渐入渐出
export const menuSearchAnimate = createAnimationConfig(
  animationEffects.FADE_IN,   // 渐入
  animationEffects.FADE_OUT   // 渐出
)

// Logo 动画配置 - 渐入渐出
export const logoAnimate = createAnimationConfig(
  animationEffects.FADE_IN,   // 渐入
  animationEffects.FADE_OUT   // 渐出
)
```

### 与 Vue Transition 集成

动画配置可直接用于 Vue Transition 组件：

```vue
<template>
  <!-- 使用预定义配置 -->
  <transition
    :enter-active-class="logoAnimate.enter"
    :leave-active-class="logoAnimate.leave"
    mode="out-in"
  >
    <component :is="currentComponent" :key="componentKey" />
  </transition>
</template>

<script setup lang="ts">
import { logoAnimate } from '@/composables/useAnimation'
</script>
```

## 基础用法

### 基本使用

```vue
<template>
  <div ref="elementRef" class="animate-target">
    动画元素
  </div>
  <el-button @click="triggerAnimation">播放动画</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const elementRef = ref<HTMLElement | null>(null)
const { applyAnimation, animationEffects } = useAnimation()

const triggerAnimation = () => {
  if (elementRef.value) {
    applyAnimation(elementRef.value, animationEffects.BOUNCE_IN)
  }
}
</script>
```

### 带回调的动画

```vue
<template>
  <div ref="boxRef" class="animated-box">
    点击按钮播放动画
  </div>
  <el-button @click="playAnimationWithCallback">播放带回调的动画</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const boxRef = ref<HTMLElement | null>(null)
const { applyAnimation, animationEffects } = useAnimation()

const playAnimationWithCallback = () => {
  if (!boxRef.value) return

  applyAnimation(
    boxRef.value,
    animationEffects.BOUNCE_IN,
    () => {
      console.log('动画播放完成！')
      // 可以在这里执行动画结束后的逻辑
      // 例如：显示下一步内容、触发其他事件等
    }
  )
}
</script>
```

### 随机动画模式

```vue
<template>
  <div ref="elementRef" class="random-animate-box">
    随机动画元素
  </div>
  <div class="controls">
    <el-button @click="toggleRandom">
      {{ isRandomAnimation ? '关闭' : '开启' }}随机动画
    </el-button>
    <el-button @click="playRandomAnimation" type="primary">
      播放随机动画
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const elementRef = ref<HTMLElement | null>(null)

const {
  isRandomAnimation,
  toggleRandomAnimation,
  nextAnimation,
  applyAnimation,
  getRandomAnimation
} = useAnimation()

const toggleRandom = () => {
  toggleRandomAnimation()
}

const playRandomAnimation = () => {
  if (!elementRef.value) return

  // 方式一：使用 nextAnimation（会根据 isRandomAnimation 状态决定）
  applyAnimation(elementRef.value, nextAnimation.value)

  // 方式二：直接获取随机动画
  // applyAnimation(elementRef.value, getRandomAnimation())
}
</script>
```

### 状态管理

```vue
<template>
  <div class="animation-status">
    <p>当前动画: {{ currentAnimation }}</p>
    <p>随机模式: {{ isRandomAnimation ? '开启' : '关闭' }}</p>
    <p>下一个动画: {{ nextAnimation }}</p>

    <el-space>
      <el-button @click="setAnimation(animationEffects.BOUNCE_IN)">
        设置弹跳动画
      </el-button>
      <el-button @click="setAnimation(animationEffects.FADE_IN)">
        设置渐入动画
      </el-button>
      <el-button @click="toggleRandomAnimation()">
        切换随机模式
      </el-button>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { useAnimation } from '@/composables/useAnimation'

const {
  currentAnimation,
  isRandomAnimation,
  nextAnimation,
  setAnimation,
  toggleRandomAnimation,
  animationEffects
} = useAnimation()
</script>
```

## 实际应用场景

### 页面路由切换动画

在 `AppMain.vue` 中实现页面切换动画：

```vue
<template>
  <section class="app-main">
    <el-scrollbar class="p-4">
      <!-- 路由视图部分 -->
      <router-view v-slot="{ Component, route }">
        <transition :enter-active-class="animate" mode="out-in">
          <keep-alive :include="layout.cachedViews.value">
            <component :is="Component" v-if="!route.meta.link" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </el-scrollbar>
  </section>
</template>

<script setup lang="ts" name="AppMain">
const layout = useLayout()

// 初始化动画实例
const animation = useAnimation()

// 过渡动画类名
const animate = ref<string>('')
const animationEnable = ref(layout.animationEnable.value)

/**
 * 监听动画启用状态变化
 * - 如果启用，使用随机动画效果
 * - 如果禁用，使用默认动画或无动画
 */
watch(
  () => layout.animationEnable.value,
  (val: boolean) => {
    animationEnable.value = val
    animate.value = val ? animation.getRandomAnimation() : animation.defaultAnimate
  },
  { immediate: true }
)
</script>
```

**实现说明：**

1. 使用 Vue Router 的 `router-view` 插槽获取当前路由组件
2. 通过 `transition` 组件包裹实现页面切换动画
3. 动态绑定 `enter-active-class` 到计算出的动画类名
4. 根据 `layout.animationEnable` 设置决定是否启用随机动画
5. 配合 `keep-alive` 实现页面缓存

### 侧边栏菜单动画

在 `Sidebar.vue` 中实现菜单过渡动画：

```vue
<template>
  <div class="sidebar-container">
    <!-- 菜单滚动容器 -->
    <el-scrollbar :class="currentSideTheme" class="scrollbar-wrapper">
      <transition :enter-active-class="menuSearchAnimate.enter" mode="out-in">
        <el-menu
          :default-active="currentActiveMenu"
          :collapse="isSidebarCollapsed"
          mode="vertical"
        >
          <SidebarItem
            v-for="(route, index) in authorizedSidebarRoutes"
            :key="route.path + index"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </transition>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts" name="Sidebar">
// 直接导入预设配置，无需调用 useAnimation()
import { menuSearchAnimate } from '@/composables/useAnimation'
</script>
```

**实现说明：**

1. 使用 `menuSearchAnimate` 预设配置（渐入渐出效果）
2. 仅在菜单内容变化时触发动画
3. 使用 `mode="out-in"` 确保旧内容先离开再进入新内容

### Logo 折叠/展开动画

在 `Logo.vue` 中实现 Logo 切换动画：

```vue
<template>
  <div class="sidebar-logo-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Logo 切换动画 -->
    <transition :enter-active-class="logoTransition.enter" mode="out-in">
      <!-- 折叠状态：仅显示 Logo 图标 -->
      <router-link v-if="isCollapsed" key="collapsed" class="sidebar-logo-link" to="/">
        <img v-if="hasLogo" :src="logoImageSrc" class="sidebar-logo" />
        <h1 v-else class="sidebar-title collapsed-title">
          {{ appTitleFirstChar }}
        </h1>
      </router-link>

      <!-- 展开状态：显示 Logo 图标 + 标题 -->
      <router-link v-else key="expanded" class="sidebar-logo-link" to="/">
        <img v-if="hasLogo" :src="logoImageSrc" class="sidebar-logo" />
        <h1 class="sidebar-title expanded-title">
          {{ appTitle }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts" name="Logo">
import { logoAnimate } from '@/composables/useAnimation'

// Logo 动画配置
const logoTransition = computed(() => logoAnimate)
</script>
```

**实现说明：**

1. 使用 `v-if/v-else` 配合不同的 `key` 触发过渡动画
2. 折叠时显示首字母或小图标，展开时显示完整标题
3. 使用 `logoAnimate` 预设配置实现平滑过渡

### 搜索表单动画

在 `ASearchForm.vue` 中实现表单显示/隐藏动画：

```vue
<template>
  <transition
    :enter-active-class="searchAnimate.enter"
    :leave-active-class="searchAnimate.leave"
  >
    <div v-show="visible" class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="formRef" :model="formModel" :inline="inline">
          <slot></slot>
        </el-form>
      </el-card>
    </div>
  </transition>
</template>

<script setup lang="ts" name="ASearchForm">
import { searchAnimate } from '@/composables/useAnimation'

interface Props {
  modelValue: Record<string, any>
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})
</script>
```

**实现说明：**

1. `searchAnimate` 默认配置为无动画（`EMPTY`）
2. 可根据需要替换为其他动画配置
3. 使用 `v-show` 控制显示/隐藏，配合 transition 实现动画

## 高级用法

### 链式动画

实现多个动画按顺序播放：

```vue
<template>
  <div ref="elementRef" class="chain-animate">
    链式动画演示
  </div>
  <el-button @click="playChainAnimation">播放链式动画</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const elementRef = ref<HTMLElement | null>(null)
const { applyAnimation, animationEffects } = useAnimation()

const playChainAnimation = () => {
  if (!elementRef.value) return

  // 第一个动画：渐入
  applyAnimation(
    elementRef.value,
    animationEffects.FADE_IN,
    () => {
      // 第一个动画结束后播放第二个动画：脉冲
      applyAnimation(
        elementRef.value!,
        animationEffects.PULSE,
        () => {
          // 第二个动画结束后播放第三个动画：弹跳
          applyAnimation(
            elementRef.value!,
            animationEffects.BOUNCE_IN,
            () => {
              console.log('链式动画完成！')
            }
          )
        }
      )
    }
  )
}
</script>
```

### Promise 封装

将回调式 API 封装为 Promise：

```typescript
import { useAnimation } from '@/composables/useAnimation'

const { applyAnimation, animationEffects } = useAnimation()

/**
 * Promise 化的动画播放函数
 */
function playAnimationAsync(
  element: HTMLElement,
  animation: string
): Promise<void> {
  return new Promise((resolve) => {
    applyAnimation(element, animation, resolve)
  })
}

// 使用 async/await 实现链式动画
async function playSequentialAnimations(element: HTMLElement) {
  await playAnimationAsync(element, animationEffects.FADE_IN)
  await playAnimationAsync(element, animationEffects.PULSE)
  await playAnimationAsync(element, animationEffects.BOUNCE_IN)
  console.log('所有动画播放完成')
}
```

### 条件动画

根据条件选择不同的动画效果：

```vue
<template>
  <div ref="conditionRef" class="condition-animate">
    条件动画元素
  </div>
  <el-radio-group v-model="animationType">
    <el-radio value="bounce">弹跳</el-radio>
    <el-radio value="fade">渐入</el-radio>
    <el-radio value="zoom">缩放</el-radio>
    <el-radio value="random">随机</el-radio>
  </el-radio-group>
  <el-button @click="playConditionalAnimation">播放动画</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const conditionRef = ref<HTMLElement | null>(null)
const animationType = ref<string>('bounce')

const { applyAnimation, animationEffects, getRandomAnimation } = useAnimation()

const animationMap: Record<string, string> = {
  bounce: animationEffects.BOUNCE_IN,
  fade: animationEffects.FADE_IN,
  zoom: animationEffects.ZOOM_IN
}

const playConditionalAnimation = () => {
  if (!conditionRef.value) return

  const animation = animationType.value === 'random'
    ? getRandomAnimation()
    : animationMap[animationType.value]

  applyAnimation(conditionRef.value, animation)
}
</script>
```

### 动画配置切换

动态切换进入/离开动画配置：

```vue
<template>
  <div class="config-demo">
    <transition
      :enter-active-class="currentConfig.enter"
      :leave-active-class="currentConfig.leave"
      mode="out-in"
    >
      <div :key="contentKey" class="animated-content">
        {{ content }}
      </div>
    </transition>

    <el-space class="mt-4">
      <el-button @click="switchToFade">渐变效果</el-button>
      <el-button @click="switchToBounce">弹跳效果</el-button>
      <el-button @click="switchToZoom">缩放效果</el-button>
      <el-button @click="changeContent" type="primary">切换内容</el-button>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation, createAnimationConfig, animationEffects } from '@/composables/useAnimation'

const { currentConfig, setAnimationConfig } = useAnimation()

const content = ref('内容 A')
const contentKey = ref(0)

const switchToFade = () => {
  setAnimationConfig(createAnimationConfig(
    animationEffects.FADE_IN,
    animationEffects.FADE_OUT
  ))
}

const switchToBounce = () => {
  setAnimationConfig(createAnimationConfig(
    animationEffects.BOUNCE_IN,
    animationEffects.FADE_OUT
  ))
}

const switchToZoom = () => {
  setAnimationConfig(createAnimationConfig(
    animationEffects.ZOOM_IN,
    animationEffects.FADE_OUT
  ))
}

const changeContent = () => {
  content.value = content.value === '内容 A' ? '内容 B' : '内容 A'
  contentKey.value++
}
</script>
```

### 批量动画控制

为多个元素应用动画：

```vue
<template>
  <div class="batch-demo">
    <div
      v-for="(item, index) in items"
      :key="index"
      :ref="el => { if (el) itemRefs[index] = el as HTMLElement }"
      class="animated-item"
    >
      {{ item }}
    </div>
    <el-button @click="playStaggeredAnimation">播放交错动画</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const items = ref(['项目 1', '项目 2', '项目 3', '项目 4', '项目 5'])
const itemRefs = ref<HTMLElement[]>([])

const { applyAnimation, animationEffects } = useAnimation()

/**
 * 播放交错动画
 * 每个元素间隔 200ms 播放动画
 */
const playStaggeredAnimation = () => {
  itemRefs.value.forEach((el, index) => {
    setTimeout(() => {
      applyAnimation(el, animationEffects.FADE_IN_UP)
    }, index * 200)
  })
}
</script>

<style scoped>
.animated-item {
  padding: 16px;
  margin: 8px 0;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
</style>
```

### 动画速度控制

通过 CSS 变量控制动画速度：

```vue
<template>
  <div ref="speedRef" class="speed-demo" :style="animationStyle">
    动画速度控制
  </div>
  <el-slider
    v-model="duration"
    :min="200"
    :max="2000"
    :step="100"
    :format-tooltip="val => `${val}ms`"
  />
  <el-button @click="playAnimation">播放动画</el-button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const speedRef = ref<HTMLElement | null>(null)
const duration = ref(1000)

const { applyAnimation, animationEffects } = useAnimation()

const animationStyle = computed(() => ({
  '--animate-duration': `${duration.value}ms`
}))

const playAnimation = () => {
  if (speedRef.value) {
    applyAnimation(speedRef.value, animationEffects.BOUNCE_IN)
  }
}
</script>

<style scoped>
.speed-demo {
  animation-duration: var(--animate-duration, 1s);
}
</style>
```

## applyAnimation 实现原理

`applyAnimation` 方法的核心实现逻辑：

```typescript
/**
 * 为元素应用动画
 * @param element DOM 元素
 * @param animation 动画类名
 * @param callback 动画结束后的回调
 */
const applyAnimation = (
  element: HTMLElement,
  animation: string = nextAnimation.value,
  callback?: () => void
): void => {
  // 1. 移除可能存在的动画类
  element.classList.forEach((cls) => {
    if (cls.startsWith('animate__')) {
      element.classList.remove(cls)
    }
  })

  // 2. 添加新动画类
  animation.split(' ').forEach((cls) => {
    if (cls) element.classList.add(cls)
  })

  // 3. 动画结束后执行回调
  if (callback) {
    const handleAnimationEnd = () => {
      callback()
      element.removeEventListener('animationend', handleAnimationEnd)
    }
    element.addEventListener('animationend', handleAnimationEnd)
  }
}
```

**实现说明：**

1. **清理旧动画** - 遍历元素的所有类名，移除以 `animate__` 开头的类
2. **添加新动画** - 将动画类名按空格分割后逐个添加到元素
3. **回调处理** - 监听 `animationend` 事件，动画结束后执行回调并移除监听器

## API 参考

### 模块级导出

| 导出项 | 类型 | 描述 |
|--------|------|------|
| `animationEffects` | `object` | 动画效果常量对象，包含所有预定义动画 |
| `animateList` | `string[]` | 随机动画列表，包含 16 个动画效果 |
| `defaultAnimate` | `string` | 默认动画效果，值为 `FADE_IN` |
| `createAnimationConfig` | `function` | 创建动画配置的工厂函数 |
| `searchAnimate` | `AnimationConfig` | 搜索动画预设（无动画） |
| `menuSearchAnimate` | `AnimationConfig` | 菜单搜索动画预设（渐入渐出） |
| `logoAnimate` | `AnimationConfig` | Logo 动画预设（渐入渐出） |
| `AnimationConfig` | `interface` | 动画配置接口类型 |

### useAnimation 返回值

#### 响应式状态

| 属性 | 类型 | 描述 |
|------|------|------|
| `currentAnimation` | `Ref<string>` | 当前启用的动画类名 |
| `isRandomAnimation` | `Ref<boolean>` | 是否启用随机动画模式 |
| `currentConfig` | `Ref<AnimationConfig>` | 当前动画配置对象 |
| `nextAnimation` | `ComputedRef<string>` | 获取下一个动画（随机模式下返回随机动画） |

#### 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `getRandomAnimation` | 无 | `string` | 从动画列表中随机获取一个动画效果 |
| `setAnimation` | `animation: string` | `void` | 设置当前动画效果 |
| `toggleRandomAnimation` | `value?: boolean` | `void` | 切换随机动画模式，可选参数指定开关状态 |
| `setAnimationConfig` | `config: AnimationConfig` | `void` | 设置当前动画配置 |
| `applyAnimation` | `element: HTMLElement, animation?: string, callback?: () => void` | `void` | 为 DOM 元素应用动画效果 |

#### 预定义配置（同模块级导出）

| 属性 | 类型 | 描述 |
|------|------|------|
| `searchAnimate` | `AnimationConfig` | 搜索动画预设 |
| `menuSearchAnimate` | `AnimationConfig` | 菜单搜索动画预设 |
| `logoAnimate` | `AnimationConfig` | Logo 动画预设 |

#### 常量（同模块级导出）

| 属性 | 类型 | 描述 |
|------|------|------|
| `animationEffects` | `object` | 动画效果常量对象 |
| `animateList` | `string[]` | 随机动画列表 |
| `defaultAnimate` | `string` | 默认动画效果 |

### createAnimationConfig 函数

```typescript
/**
 * 创建动画配置
 * @param enterAnimation 进入动画，默认 FADE_IN
 * @param leaveAnimation 离开动画，默认 FADE_OUT
 * @returns 动画配置对象
 */
function createAnimationConfig(
  enterAnimation?: string,
  leaveAnimation?: string
): AnimationConfig
```

## 类型定义

### 完整类型定义

```typescript
/**
 * 动画效果常量类型
 */
export type AnimationEffect = typeof animationEffects[keyof typeof animationEffects]

/**
 * 动画效果名称类型
 */
export type AnimationEffectName = keyof typeof animationEffects

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 进入时的动画类名 */
  enter: string
  /** 离开时的动画类名 */
  leave: string
}

/**
 * useAnimation 返回值类型
 */
export interface UseAnimationReturn {
  // 响应式状态
  currentAnimation: Ref<string>
  isRandomAnimation: Ref<boolean>
  currentConfig: Ref<AnimationConfig>
  nextAnimation: ComputedRef<string>

  // 方法
  getRandomAnimation: () => string
  setAnimation: (animation: string) => void
  toggleRandomAnimation: (value?: boolean) => void
  createAnimationConfig: (enter?: string, leave?: string) => AnimationConfig
  setAnimationConfig: (config: AnimationConfig) => void
  applyAnimation: (
    element: HTMLElement,
    animation?: string,
    callback?: () => void
  ) => void

  // 预定义配置
  searchAnimate: AnimationConfig
  menuSearchAnimate: AnimationConfig
  logoAnimate: AnimationConfig

  // 常量
  animationEffects: typeof animationEffects
  animateList: string[]
  defaultAnimate: string
}
```

### 动画效果对象类型

```typescript
/**
 * 动画效果常量对象
 */
export const animationEffects: {
  readonly EMPTY: ''
  readonly PULSE: string
  readonly RUBBER_BAND: string
  readonly BOUNCE_IN: string
  readonly BOUNCE_IN_LEFT: string
  readonly FADE_IN: string
  readonly FADE_IN_LEFT: string
  readonly FADE_IN_DOWN: string
  readonly FADE_IN_UP: string
  readonly FLIP_IN_X: string
  readonly LIGHT_SPEED_IN_LEFT: string
  readonly ROTATE_IN_DOWN_LEFT: string
  readonly ROLL_IN: string
  readonly ZOOM_IN: string
  readonly ZOOM_IN_DOWN: string
  readonly SLIDE_IN_LEFT: string
  readonly LIGHT_SPEED_IN: string
  readonly FADE_OUT: string
}
```

## 主题定制

### Animate.css 变量

Animate.css 支持通过 CSS 变量定制动画：

```scss
// 全局动画时长
:root {
  --animate-duration: 1s;
  --animate-delay: 0s;
  --animate-repeat: 1;
}

// 针对特定元素
.fast-animation {
  --animate-duration: 0.3s;
}

.slow-animation {
  --animate-duration: 2s;
}
```

### 自定义动画效果

扩展新的动画效果：

```typescript
// customAnimations.ts
import { animationEffects } from '@/composables/useAnimation'

const ANIMATE_PREFIX = 'animate__animated '

// 扩展自定义动画
export const customAnimationEffects = {
  ...animationEffects,

  // 自定义动画（需在 CSS 中定义对应的 @keyframes）
  SHAKE: `${ANIMATE_PREFIX}animate__shakeX`,
  HEART_BEAT: `${ANIMATE_PREFIX}animate__heartBeat`,
  SWING: `${ANIMATE_PREFIX}animate__swing`,
  TADA: `${ANIMATE_PREFIX}animate__tada`,
  WOBBLE: `${ANIMATE_PREFIX}animate__wobble`,
  JELLO: `${ANIMATE_PREFIX}animate__jello`,
  FLIP: `${ANIMATE_PREFIX}animate__flip`,
  HEAD_SHAKE: `${ANIMATE_PREFIX}animate__headShake`,
}
```

### 暗黑模式适配

动画效果在暗黑模式下无需特殊处理，但可以根据主题调整动画强度：

```scss
// 暗黑模式下减弱动画效果
html.dark {
  --animate-duration: 0.8s;
}

// 减少动画对用户的干扰
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 最佳实践

### 1. 合理使用预设配置

```typescript
// ✅ 推荐：使用预设配置
import { menuSearchAnimate, logoAnimate } from '@/composables/useAnimation'

// ❌ 不推荐：重复创建相同配置
const myConfig = createAnimationConfig(
  animationEffects.FADE_IN,
  animationEffects.FADE_OUT
)
```

### 2. 避免过度使用动画

```vue
<template>
  <!-- ✅ 推荐：关键交互使用动画 -->
  <transition :enter-active-class="animate">
    <div v-if="showImportantContent">重要内容</div>
  </transition>

  <!-- ❌ 不推荐：所有元素都加动画 -->
  <transition v-for="item in items" :enter-active-class="animate">
    <div>{{ item }}</div>
  </transition>
</template>
```

### 3. 提供动画开关

```vue
<template>
  <transition :enter-active-class="animationEnabled ? animate : ''">
    <component :is="currentComponent" />
  </transition>
</template>

<script setup lang="ts">
// 允许用户关闭动画
const layout = useLayout()
const animationEnabled = computed(() => layout.animationEnable.value)
</script>
```

### 4. 使用 mode="out-in"

```vue
<template>
  <!-- ✅ 推荐：使用 out-in 模式避免布局跳动 -->
  <transition :enter-active-class="animate" mode="out-in">
    <component :is="currentComponent" :key="componentKey" />
  </transition>

  <!-- ❌ 不推荐：默认模式可能导致两个元素同时存在 -->
  <transition :enter-active-class="animate">
    <component :is="currentComponent" :key="componentKey" />
  </transition>
</template>
```

### 5. 正确使用 key 触发动画

```vue
<template>
  <!-- ✅ 推荐：使用唯一 key 触发动画 -->
  <transition :enter-active-class="animate" mode="out-in">
    <div :key="uniqueKey">{{ content }}</div>
  </transition>

  <!-- ❌ 不推荐：缺少 key 可能不触发动画 -->
  <transition :enter-active-class="animate">
    <div>{{ content }}</div>
  </transition>
</template>
```

### 6. 处理动画结束

```typescript
// ✅ 推荐：使用回调处理后续逻辑
applyAnimation(element, animationEffects.FADE_OUT, () => {
  element.style.display = 'none'
})

// ❌ 不推荐：使用固定延时（不可靠）
applyAnimation(element, animationEffects.FADE_OUT)
setTimeout(() => {
  element.style.display = 'none'
}, 1000) // 时间可能不准确
```

### 7. 考虑无障碍访问

```scss
// 尊重用户的动画偏好设置
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none !important;
    transition: none !important;
  }
}
```

### 8. 模块级导入优化

```typescript
// ✅ 推荐：直接导入需要的预设（无需调用 Composable）
import { logoAnimate, menuSearchAnimate } from '@/composables/useAnimation'

// ✅ 推荐：需要状态管理时调用 Composable
const { currentAnimation, setAnimation } = useAnimation()

// ❌ 不推荐：不需要状态管理却调用 Composable
const { logoAnimate } = useAnimation() // 直接导入即可
```

## 常见问题

### 1. 动画不生效

**问题原因：**
- 未引入 Animate.css 样式文件
- 动画类名拼写错误
- 元素未正确渲染

**解决方案：**

```scss
// 确保在 main.scss 中引入 Animate.css
@use 'animate.css';
```

```typescript
// 使用预定义常量而非手写类名
applyAnimation(element, animationEffects.BOUNCE_IN) // ✅
applyAnimation(element, 'animate__bounceIn')        // ❌ 缺少前缀
```

### 2. 动画回调不触发

**问题原因：**
- 动画被 CSS 覆盖取消
- 元素在动画完成前被移除
- 动画时长为 0

**解决方案：**

```typescript
// 确保动画正常播放
const playAnimation = () => {
  if (!element || !document.body.contains(element)) {
    console.warn('元素不存在或已被移除')
    return
  }

  // 确保动画时长大于 0
  element.style.animationDuration = '1s'

  applyAnimation(element, animationEffects.FADE_IN, () => {
    console.log('动画完成')
  })
}
```

### 3. 页面切换动画卡顿

**问题原因：**
- 动画效果过于复杂
- 同时存在多个动画
- 页面渲染压力大

**解决方案：**

```vue
<script setup lang="ts">
// 使用简单的动画效果
const animation = useAnimation()

watch(
  () => layout.animationEnable.value,
  (val) => {
    // 使用简单的渐变动画而非复杂动画
    animate.value = val
      ? animationEffects.FADE_IN
      : animationEffects.EMPTY
  }
)
</script>
```

### 4. Transition 动画不触发

**问题原因：**
- 缺少 key 属性
- v-if/v-show 使用不当
- mode 属性设置错误

**解决方案：**

```vue
<template>
  <!-- 确保 key 变化时触发动画 -->
  <transition :enter-active-class="animate" mode="out-in">
    <component :is="Component" :key="route.path" />
  </transition>
</template>
```

### 5. 随机动画重复

**问题原因：**
- 随机算法概率问题
- 动画列表较短

**解决方案：**

```typescript
// 实现不重复的随机动画
let lastAnimation = ''

const getUniqueRandomAnimation = (): string => {
  const { getRandomAnimation, animateList } = useAnimation()

  if (animateList.length <= 1) {
    return animateList[0] || ''
  }

  let newAnimation = getRandomAnimation()
  while (newAnimation === lastAnimation) {
    newAnimation = getRandomAnimation()
  }

  lastAnimation = newAnimation
  return newAnimation
}
```

### 6. 动画在移动端卡顿

**问题原因：**
- 3D 变换动画性能开销大
- 未启用硬件加速

**解决方案：**

```scss
// 启用硬件加速
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

// 移动端使用简单动画
@media (max-width: 768px) {
  .animated-element {
    --animate-duration: 0.3s;
  }
}
```

### 7. 多个动画同时播放冲突

**问题原因：**
- 新动画覆盖旧动画
- 未等待前一个动画完成

**解决方案：**

```typescript
// 使用队列管理动画
class AnimationQueue {
  private queue: Array<() => Promise<void>> = []
  private isPlaying = false

  async add(playFn: () => Promise<void>) {
    this.queue.push(playFn)
    if (!this.isPlaying) {
      await this.play()
    }
  }

  private async play() {
    this.isPlaying = true
    while (this.queue.length > 0) {
      const fn = this.queue.shift()!
      await fn()
    }
    this.isPlaying = false
  }
}
```

### 8. 动画在 SSR 中报错

**问题原因：**
- 服务端没有 DOM API
- `animationend` 事件不可用

**解决方案：**

```typescript
// 客户端检查
const applyAnimationSafe = (
  element: HTMLElement | null,
  animation: string,
  callback?: () => void
) => {
  if (typeof window === 'undefined' || !element) {
    callback?.()
    return
  }

  applyAnimation(element, animation, callback)
}
```

## 性能优化

### 1. 减少重排重绘

```typescript
// 批量操作 DOM
const playMultipleAnimations = (elements: HTMLElement[]) => {
  // 使用 requestAnimationFrame 批量处理
  requestAnimationFrame(() => {
    elements.forEach((el, index) => {
      setTimeout(() => {
        applyAnimation(el, animationEffects.FADE_IN)
      }, index * 50)
    })
  })
}
```

### 2. 使用 transform 和 opacity

```scss
// 优先使用 GPU 加速的属性
.optimized-animation {
  // ✅ 推荐
  transform: translateX(100%);
  opacity: 0;

  // ❌ 避免
  // left: 100%;
  // visibility: hidden;
}
```

### 3. 禁用不必要的动画

```typescript
// 根据设备性能禁用动画
const shouldEnableAnimation = () => {
  // 检测是否为低端设备
  const isLowEndDevice = navigator.hardwareConcurrency <= 2

  // 检测用户偏好
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  return !isLowEndDevice && !prefersReducedMotion
}
```

### 4. 懒加载动画资源

```typescript
// 按需加载 Animate.css
const loadAnimateCSS = async () => {
  if (!document.querySelector('link[href*="animate.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
    document.head.appendChild(link)

    return new Promise((resolve) => {
      link.onload = resolve
    })
  }
}
```
