# useScroll 滚动管理

## 介绍

`useScroll` 是一个基于全局单例模式实现的滚动位置管理 Composable,提供跨组件的滚动状态共享和统一管理。它专门解决了 UniApp 在不同平台上滚动监听的差异问题,特别是微信小程序中 `onPageScroll` 只能在页面组件中生效的限制。

在 UniApp 开发中,`onPageScroll` 生命周期钩子只能在页面级组件中使用,而无法在普通组件中生效。这导致在组件中需要获取当前页面滚动位置时,必须通过父页面传递 props 或使用事件总线等复杂方式。`useScroll` 通过全局单例模式,让页面组件在 `onPageScroll` 中更新滚动状态,其他任何组件都可以通过调用 `useScroll()` 来获取同一个状态实例,实现滚动位置的跨组件共享。

**核心特性:**

- **全局单例模式** - 确保应用中所有地方调用 `useScroll()` 获取的是同一个状态实例
- **响应式状态** - 基于 Vue 3 响应式系统,滚动位置变化自动更新所有使用者
- **平台兼容** - 解决微信小程序 `onPageScroll` 只能在页面组件中使用的限制
- **智能更新** - 自动处理滚动到顶部时的状态重置,避免负值和异常情况
- **丰富工具方法** - 提供判断滚动状态、计算进度、返回顶部按钮显示等实用方法
- **只读保护** - 滚动位置状态为只读,防止外部直接修改,保证数据流向清晰
- **零配置使用** - 无需初始化配置,开箱即用

## 基本用法

### 页面组件中更新滚动位置

在页面组件中使用 `onPageScroll` 监听滚动事件并更新状态。这是滚动管理的数据源头。

```vue
<template>
  <view class="page">
    <view class="content">
      <!-- 页面内容 -->
      <view v-for="item in 50" :key="item" class="item">
        Item {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop } = useScroll()

// 页面显示时重置滚动位置
// 避免从其他页面返回时保留旧的滚动状态
onShow(() => {
  resetScrollTop()
})

// 监听页面滚动事件并更新状态
onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>

```

**使用说明:**
- 必须在页面组件的 `onPageScroll` 中调用 `updateScrollTop()`
- 推荐在 `onShow` 中调用 `resetScrollTop()`,避免页面切换时状态错乱
- `e.scrollTop` 的单位是 px,会自动处理负值情况

### 普通组件中读取滚动位置

在任何组件中都可以通过 `useScroll()` 获取当前页面的滚动位置,无需 props 传递。

```vue
<template>
  <view class="scroll-info">
    <text>当前滚动位置: {{ scrollTop }}px</text>
    <text v-if="isScrolled(100)">已滚动超过 100px</text>
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

// 获取全局滚动状态
const { scrollTop, isScrolled } = useScroll()
</script>

```

**使用说明:**
- `scrollTop` 是只读的响应式 Ref,会随页面滚动自动更新
- 任何组件都可以通过 `useScroll()` 访问同一个状态实例
- 支持在计算属性、侦听器中使用 `scrollTop`

### 返回顶部按钮

结合 WD UI 的 `wd-backtop` 组件,实现智能显示的返回顶部按钮。

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
    <view class="content">
      <view v-for="item in 100" :key="item" class="item">
        Item {{ item }}
      </view>
    </view>

    <!-- 返回顶部按钮 -->
    <!-- scrollTop 会自动传递给 backtop 组件 -->
    <wd-backtop :scroll-top="scrollTop" :top="600" />
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { scrollTop, updateScrollTop, resetScrollTop } = useScroll()

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>

```

**使用说明:**
- `wd-backtop` 组件需要传入 `scroll-top` 属性才能正常工作
- `top` 属性控制滚动多少 rpx 后显示按钮,默认 600
- `scrollTop` 的单位是 px,组件内部会自动转换为 rpx

### 自定义返回顶部按钮

使用 `shouldShowBacktop()` 方法手动控制返回顶部按钮的显示。

```vue
<template>
  <view class="page">
    <view class="content">
      <view v-for="item in 100" :key="item" class="item">
        Item {{ item }}
      </view>
    </view>

    <!-- 自定义返回顶部按钮 -->
    <view v-if="showBacktopBtn" class="backtop-btn" @click="handleBackTop">
      <wd-icon name="arrow-up" size="40" color="#fff" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { scrollTop, updateScrollTop, resetScrollTop, shouldShowBacktop } = useScroll()

// 判断是否显示返回顶部按钮
// 滚动超过 600rpx 时显示
const showBacktopBtn = computed(() => shouldShowBacktop(600))

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})

// 返回顶部
const handleBackTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}
</script>

```

**使用说明:**
- `shouldShowBacktop(600)` 判断滚动位置是否超过 600px
- `uni.pageScrollTo()` 用于滚动到指定位置
- 按钮使用 `v-if` 控制显示,避免不必要的渲染

### 滚动进度指示器

使用 `getScrollProgress()` 方法计算并显示当前页面的滚动进度。

```vue
<template>
  <view class="page">
    <!-- 滚动进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: `${progress}%` }" />
    </view>

    <!-- 滚动进度文字 -->
    <view class="progress-text">
      {{ progress.toFixed(0) }}%
    </view>

    <view class="content">
      <view v-for="item in 100" :key="item" class="item">
        Item {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow, onReady } from '@dcloudio/uni-app'

const { scrollTop, updateScrollTop, resetScrollTop, getScrollProgress } = useScroll()

// 页面最大滚动高度
const maxScrollTop = ref(0)

// 计算滚动进度
const progress = computed(() => getScrollProgress(maxScrollTop.value))

onShow(() => {
  resetScrollTop()
})

onReady(() => {
  // 计算页面可滚动的最大高度
  uni.createSelectorQuery()
    .select('.content')
    .boundingClientRect((rect) => {
      if (rect) {
        const windowHeight = uni.getSystemInfoSync().windowHeight
        maxScrollTop.value = Math.max(0, rect.height - windowHeight)
      }
    })
    .exec()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>

```

**使用说明:**
- `getScrollProgress()` 需要传入页面最大滚动高度
- 使用 `uni.createSelectorQuery()` 获取内容区域高度
- 最大滚动高度 = 内容高度 - 窗口高度
- 返回值范围是 0-100,表示滚动百分比

### 条件渲染优化

使用 `isScrolled()` 方法优化组件的条件渲染,提升性能。

```vue
<template>
  <view class="page">
    <!-- 滚动后显示的吸顶导航栏 -->
    <view v-if="isScrolled(100)" class="sticky-navbar">
      <text>吸顶导航栏</text>
    </view>

    <!-- 原生导航栏 -->
    <view class="navbar">
      <text>原生导航栏</text>
    </view>

    <view class="content">
      <view v-for="item in 100" :key="item" class="item">
        Item {{ item }}
      </view>
    </view>

    <!-- 滚动后改变样式的返回顶部按钮 -->
    <view
      v-if="isScrolled(50)"
      :class="['backtop', { 'backtop-active': isScrolled(300) }]"
      @click="handleBackTop"
    >
      <wd-icon name="arrow-up" size="40" :color="isScrolled(300) ? '#1989fa' : '#999'" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop, isScrolled } = useScroll()

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})

const handleBackTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}
</script>

```

**使用说明:**
- `isScrolled()` 可以传入不同的阈值,用于不同的条件判断
- 适用于吸顶导航、悬浮按钮、广告位等需要根据滚动显示的元素
- 配合 `v-if` 或 `:class` 实现动态显示和样式切换
- 合理使用阈值可以避免频繁的 DOM 操作,提升性能

## API

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| scrollTop | 当前滚动位置(只读) | `Readonly<Ref<number>>` | `0` |

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| getScrollTop | 获取当前滚动位置 | - | `number` |
| updateScrollTop | 更新滚动位置 | `value: number` | `void` |
| resetScrollTop | 重置滚动位置为 0 | - | `void` |
| isScrolled | 判断是否已滚动 | `threshold?: number` | `boolean` |
| shouldShowBacktop | 判断是否应显示返回顶部按钮 | `top?: number` | `boolean` |
| getScrollProgress | 计算滚动进度百分比 | `maxScrollTop: number` | `number` |

### getScrollTop()

获取当前页面的滚动位置。

**类型定义:**

```typescript
const getScrollTop = (): number => {
  return scrollTop.value
}
```

**返回值:**
- `number` - 当前滚动位置,单位 px

**使用示例:**

```typescript
const { getScrollTop } = useScroll()

// 获取当前滚动位置
const currentScroll = getScrollTop()
console.log('当前滚动位置:', currentScroll, 'px')
```

### updateScrollTop(value)

更新当前页面的滚动位置。智能处理滚动到顶部的情况,自动重置状态。

**类型定义:**

```typescript
const updateScrollTop = (value: number): void => {
  const newValue = Math.max(0, value)

  // 如果滚动到顶部,完全重置状态
  if (newValue === 0 && scrollTop.value !== 0) {
    scrollTop.value = 0
  } else {
    scrollTop.value = newValue
  }
}
```

**参数:**
- `value: number` - 新的滚动位置,单位 px,会自动处理负值

**使用示例:**

```typescript
const { updateScrollTop } = useScroll()

// 在 onPageScroll 中更新
onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})

// 手动设置滚动位置
updateScrollTop(500) // 设置为 500px
updateScrollTop(-10) // 会被处理为 0
```

### resetScrollTop()

重置滚动位置为 0,通常用于页面切换时清空旧状态。

**类型定义:**

```typescript
const resetScrollTop = (): void => {
  scrollTop.value = 0
}
```

**使用示例:**

```typescript
const { resetScrollTop } = useScroll()

// 页面显示时重置
onShow(() => {
  resetScrollTop()
})

// 页面卸载时重置
onUnmounted(() => {
  resetScrollTop()
})

// 手动重置
const handleReset = () => {
  resetScrollTop()
}
```

### isScrolled(threshold?)

判断页面是否已滚动超过指定阈值。

**类型定义:**

```typescript
const isScrolled = (threshold: number = 0): boolean => {
  return scrollTop.value > threshold
}
```

**参数:**
- `threshold?: number` - 判断滚动的阈值,单位 px,默认 `0`

**返回值:**
- `boolean` - 是否已滚动超过阈值

**使用示例:**

```typescript
const { isScrolled } = useScroll()

// 判断是否已滚动
const scrolled = isScrolled() // 滚动位置 > 0

// 判断是否滚动超过 100px
const scrolled100 = isScrolled(100)

// 在模板中使用
<text v-if="isScrolled(50)">已滚动超过 50px</text>
```

### shouldShowBacktop(top?)

判断是否应该显示返回顶部按钮。默认阈值与 `wd-backtop` 组件保持一致。

**类型定义:**

```typescript
const shouldShowBacktop = (top: number = 600): boolean => {
  return scrollTop.value > top
}
```

**参数:**
- `top?: number` - 显示按钮的滚动阈值,单位 px,默认 `600`

**返回值:**
- `boolean` - 是否应该显示返回顶部按钮

**使用示例:**

```typescript
const { shouldShowBacktop } = useScroll()

// 默认阈值 600px
const showBtn = shouldShowBacktop()

// 自定义阈值 300px
const showBtn300 = shouldShowBacktop(300)

// 配合 computed 使用
const showBacktopBtn = computed(() => shouldShowBacktop(400))
```

**技术实现:**
- 默认值 600 是 px 单位,对应 `wd-backtop` 组件的默认 `top="600"` (rpx)
- 在 iPhone 6 (375px 宽度) 下,600rpx ≈ 300px
- 在不同设备上会有差异,可根据实际需求调整阈值

### getScrollProgress(maxScrollTop)

计算当前页面的滚动进度百分比。

**类型定义:**

```typescript
const getScrollProgress = (maxScrollTop: number): number => {
  if (maxScrollTop <= 0) return 0
  return Math.min(100, (scrollTop.value / maxScrollTop) * 100)
}
```

**参数:**
- `maxScrollTop: number` - 页面最大滚动高度,单位 px

**返回值:**
- `number` - 滚动进度百分比,范围 0-100

**使用示例:**

```typescript
const { getScrollProgress } = useScroll()
const maxScrollTop = ref(0)

// 计算页面最大滚动高度
onReady(() => {
  uni.createSelectorQuery()
    .select('.content')
    .boundingClientRect((rect) => {
      if (rect) {
        const windowHeight = uni.getSystemInfoSync().windowHeight
        maxScrollTop.value = Math.max(0, rect.height - windowHeight)
      }
    })
    .exec()
})

// 获取滚动进度
const progress = computed(() => getScrollProgress(maxScrollTop.value))
// 当前滚动 500px,最大 1000px,返回 50
```

**计算公式:**

```text
进度 = (当前滚动位置 / 最大滚动高度) × 100
最大滚动高度 = 内容高度 - 窗口高度
```

**特殊情况处理:**
- `maxScrollTop <= 0` 时返回 `0`
- 超过 100% 时自动限制为 `100`
- 确保返回值始终在 0-100 范围内

## 类型定义

```typescript
/**
 * 滚动管理钩子返回类型
 */
interface UseScrollReturn {
  /**
   * 当前滚动位置(只读)
   * 单位: px
   */
  scrollTop: Readonly<Ref<number>>

  /**
   * 获取当前滚动位置
   * @returns 当前页面的滚动位置(像素)
   */
  getScrollTop: () => number

  /**
   * 更新滚动位置
   * 智能处理滚动状态,当滚动到顶部时自动重置
   * @param value 新的滚动位置(像素)
   */
  updateScrollTop: (value: number) => void

  /**
   * 重置滚动位置
   * 将滚动位置重置为0,通常用于页面切换时
   */
  resetScrollTop: () => void

  /**
   * 判断页面是否已滚动
   * @param threshold 判断滚动的阈值,默认为0
   * @returns 是否已滚动
   */
  isScrolled: (threshold?: number) => boolean

  /**
   * 判断是否应该显示返回顶部按钮
   * @param top 显示按钮的滚动阈值,默认为600(与wd-backtop组件默认值保持一致)
   * @returns 是否应该显示返回顶部按钮
   */
  shouldShowBacktop: (top?: number) => boolean

  /**
   * 计算滚动进度百分比
   * @param maxScrollTop 页面最大滚动高度
   * @returns 滚动进度百分比 (0-100)
   */
  getScrollProgress: (maxScrollTop: number) => number
}

/**
 * 滚动管理钩子
 */
export declare function useScroll(): UseScrollReturn

/**
 * UniApp 页面滚动事件类型
 */
interface PageScrollEvent {
  /**
   * 页面在垂直方向已滚动的距离(单位px)
   */
  scrollTop: number
}
```

## 全局单例模式

### 设计原理

`useScroll` 使用全局单例模式实现,确保应用中所有地方调用 `useScroll()` 获取的都是同一个状态实例。

**实现代码:**

```typescript
// 全局滚动状态实例
let globalScrollInstance: ReturnType<typeof createScrollInstance> | null = null

export const useScroll = () => {
  // 如果全局实例不存在,创建一个新实例
  if (!globalScrollInstance) {
    globalScrollInstance = createScrollInstance()
  }

  // 返回全局单例实例
  return globalScrollInstance
}
```

**单例模式优势:**

1. **状态共享** - 所有组件访问同一个滚动状态,无需 props 传递
2. **性能优化** - 只创建一次实例,避免重复创建开销
3. **数据一致** - 保证数据源唯一,避免状态不同步
4. **简化代码** - 使用方无需考虑实例管理,直接调用即可

### 使用场景示例

```vue
<!-- 页面组件 - 数据源 -->
<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll } from '@dcloudio/uni-app'

// 页面组件更新滚动位置
const { updateScrollTop } = useScroll()

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>

<!-- Layout 组件 - 数据消费者1 -->
<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

// 获取的是同一个实例
const { scrollTop } = useScroll()
</script>

<!-- Header 组件 - 数据消费者2 -->
<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

// 获取的还是同一个实例
const { isScrolled } = useScroll()
</script>

<!-- Backtop 组件 - 数据消费者3 -->
<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

// 仍然是同一个实例
const { shouldShowBacktop } = useScroll()
</script>
```

**关键点:**
- 4 个不同组件调用 `useScroll()`
- 返回的是同一个 `globalScrollInstance`
- `scrollTop` 状态在所有组件中同步更新
- 无需使用 provide/inject 或事件总线

## 平台差异处理

### 问题背景

在 UniApp 中,`onPageScroll` 生命周期钩子存在平台差异:

| 平台 | onPageScroll 支持情况 |
|------|---------------------|
| H5 | 是 页面组件和普通组件都支持 |
| 微信小程序 | 部分 仅页面组件支持 |
| App | 部分 仅页面组件支持 |
| 支付宝小程序 | 部分 仅页面组件支持 |

在微信小程序、App 等平台上,如果在普通组件中使用 `onPageScroll`,不会生效也不会报错,导致难以调试。

### 传统解决方案的问题

**方案 1: Props 传递**

```vue
<!-- 页面组件 -->
<template>
  <Layout :scroll-top="scrollTop" />
</template>

<script lang="ts" setup>
const scrollTop = ref(0)
onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})
</script>

<!-- Layout 组件 -->
<template>
  <Header :scroll-top="scrollTop" />
  <Backtop :scroll-top="scrollTop" />
</template>

<script lang="ts" setup>
defineProps<{
  scrollTop: number
}>()
</script>
```

**问题:**
- Props 层级传递繁琐,嵌套深度大时难以维护
- 每个需要滚动位置的组件都要声明 props
- 父组件需要知道哪些子组件需要滚动位置

**方案 2: 事件总线**

```typescript
// 页面组件
onPageScroll((e) => {
  uni.$emit('pageScroll', e.scrollTop)
})

// 普通组件
uni.$on('pageScroll', (scrollTop) => {
  // 处理滚动
})
```

**问题:**
- 需要手动管理事件监听和销毁
- 事件名称字符串容易拼写错误
- 难以追踪数据流向,调试困难
- 组件卸载时忘记销毁监听容易造成内存泄漏

### useScroll 解决方案

`useScroll` 通过全局单例模式完美解决了以上问题:

```typescript
// 页面组件 - 唯一的数据源
const { updateScrollTop } = useScroll()
onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})

// 任何组件 - 直接获取状态
const { scrollTop, isScrolled } = useScroll()
```

**优势:**
- <Ok/> 零配置,开箱即用
- <Ok/> 类型安全,TypeScript 完全支持
- <Ok/> 响应式,自动更新所有使用者
- <Ok/> 无需手动管理监听和销毁
- <Ok/> 代码简洁,易于理解和维护
- <Ok/> 性能优异,单例模式避免重复创建

## 最佳实践

### 1. 页面组件必须同时使用 onShow 和 onPageScroll

在页面组件中,推荐同时使用 `onShow` 和 `onPageScroll`,确保状态正确。

```typescript
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop } = useScroll()

// ✅ 推荐:页面显示时重置
onShow(() => {
  resetScrollTop()
})

// ✅ 推荐:页面滚动时更新
onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
```

**原因:**
- UniApp 的页面栈机制会保留页面状态
- 从 B 页面返回 A 页面时,A 页面的滚动位置可能保留
- 如果不在 `onShow` 中重置,`scrollTop` 状态可能不准确
- `onPageScroll` 只在滚动时触发,不滚动不会更新状态

**错误示例:**

```typescript
// ❌ 错误:只在 onPageScroll 中更新
onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})

// 问题:从其他页面返回后,如果不滚动,状态不会更新
```

### 2. 合理使用阈值优化性能

在使用 `isScrolled()` 等方法时,设置合理的阈值避免频繁触发。

```vue
<template>
  <view class="page">
    <!-- ✅ 推荐:使用阈值避免频繁渲染 -->
    <view v-if="isScrolled(100)" class="sticky-header">
      吸顶导航栏
    </view>

    <!-- ❌ 不推荐:阈值太小,频繁触发 -->
    <view v-if="isScrolled(1)" class="indicator">
      滚动指示器
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

const { isScrolled } = useScroll()
</script>
```

**性能优化建议:**
- 吸顶导航:建议阈值 80-150px
- 返回顶部按钮:建议阈值 300-600px
- 滚动进度指示器:建议阈值 50-100px
- 避免使用 0 或 1 等极小阈值

**原因:**
- 页面滚动时 `onPageScroll` 会频繁触发
- 阈值太小会导致条件频繁变化
- 频繁的 DOM 操作影响性能
- 合理的阈值可以减少不必要的渲染

### 3. 使用 computed 缓存计算结果

对于复杂的滚动相关计算,使用 `computed` 缓存结果。

```typescript
import { computed } from 'vue'
import { useScroll } from '@/composables/useScroll'

const { scrollTop, isScrolled, shouldShowBacktop } = useScroll()

// ✅ 推荐:使用 computed 缓存
const showStickyNav = computed(() => isScrolled(100))
const showBacktopBtn = computed(() => shouldShowBacktop(600))
const scrollProgress = computed(() => {
  // 复杂计算逻辑
  const progress = (scrollTop.value / maxHeight.value) * 100
  return Math.min(100, Math.max(0, progress))
})

// ❌ 不推荐:在模板中直接调用方法
<view v-if="isScrolled(100)">导航栏</view>
<view v-if="shouldShowBacktop(600)">返回顶部</view>
```

**优势:**
- `computed` 会缓存计算结果,避免重复计算
- 只有依赖的响应式数据变化时才重新计算
- 提升性能,特别是在复杂计算场景下

### 4. 避免在普通组件中使用 onPageScroll

只在页面组件中使用 `onPageScroll`,普通组件通过 `useScroll()` 获取状态。

```vue
<!-- ✅ 正确:页面组件 pages/index/index.vue -->
<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop } = useScroll()

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>

<!-- ✅ 正确:普通组件 components/Header.vue -->
<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'

// 直接获取状态,不使用 onPageScroll
const { scrollTop, isScrolled } = useScroll()
</script>

<!-- ❌ 错误:普通组件中使用 onPageScroll -->
<script lang="ts" setup>
import { onPageScroll } from '@dcloudio/uni-app'

// 在微信小程序等平台上不会生效!
onPageScroll((e) => {
  console.log(e.scrollTop) // 不会执行
})
</script>
```

**关键点:**
- 每个页面只在页面组件的 `onPageScroll` 中调用 `updateScrollTop()`
- 所有普通组件通过 `useScroll()` 获取共享状态
- 确保数据源唯一,避免状态混乱

### 5. 结合 WD UI 组件使用

与 WD UI 的 `wd-backtop` 等组件配合使用时,注意单位转换。

```vue
<template>
  <view class="page">
    <!-- ✅ 推荐:直接传递 scrollTop -->
    <wd-backtop :scroll-top="scrollTop" :top="600" />

    <!-- wd-backtop 组件会自动处理单位转换 -->
    <!-- scrollTop 是 px,top 是 rpx -->
  </view>
</template>

<script lang="ts" setup>
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { scrollTop, updateScrollTop, resetScrollTop } = useScroll()

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>
```

**单位说明:**
- `useScroll` 中的 `scrollTop` 单位是 **px**
- `wd-backtop` 的 `top` 属性单位是 **rpx**
- `shouldShowBacktop()` 的默认值 600 是 **px**
- 组件内部会自动进行单位转换

**常见组件配合:**
- `wd-backtop` - 返回顶部按钮
- `wd-sticky` - 粘性定位
- `wd-navbar` - 导航栏
- 自定义吸顶组件

## 常见问题

### 1. 为什么滚动状态不更新?

**问题原因:**
- 没有在页面组件的 `onPageScroll` 中调用 `updateScrollTop()`
- 在普通组件中使用了 `onPageScroll`,但微信小程序不支持
- 页面未实际滚动,`onPageScroll` 未触发

**解决方案:**

```typescript
// ✅ 确保在页面组件中正确使用
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop } = useScroll()

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
  console.log('滚动位置:', e.scrollTop) // 调试输出
})
```

**调试步骤:**
1. 检查是否在页面组件中使用(文件路径包含 `/pages/`)
2. 确认页面内容高度超过屏幕高度,可以滚动
3. 在 `onPageScroll` 中添加 `console.log` 确认是否触发
4. 检查是否在多个页面组件中都调用了 `updateScrollTop()`

### 2. 从其他页面返回后滚动位置不正确?

**问题原因:**
- UniApp 的页面栈会保留页面状态和滚动位置
- 没有在 `onShow` 中重置 `scrollTop` 状态
- 状态与实际滚动位置不同步

**解决方案:**

```typescript
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop } = useScroll()

// ✅ 必须在 onShow 中重置
onShow(() => {
  resetScrollTop()
  console.log('页面显示,已重置滚动状态')
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
```

**原理说明:**
- `uni.navigateTo()` 会将当前页面保留在页面栈中
- 从下级页面返回时,页面不会重新创建
- `onLoad`、`setup` 等只在首次创建时执行
- `onShow` 每次页面显示都会执行
- 需要在 `onShow` 中重置状态,确保与实际一致

### 3. 多个页面同时存在时状态混乱?

**问题原因:**
- `useScroll` 是全局单例,所有页面共享同一个状态
- 页面 A 和页面 B 同时存在页面栈时,都会更新同一个 `scrollTop`
- 后触发的页面会覆盖前一个页面的状态

**解决方案:**

```typescript
import { useScroll } from '@/composables/useScroll'
import { onPageScroll, onShow, onHide } from '@dcloudio/uni-app'

const { updateScrollTop, resetScrollTop } = useScroll()

// ✅ 页面显示时重置
onShow(() => {
  resetScrollTop()
})

// ✅ 页面隐藏时也重置
onHide(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
```

**最佳实践:**
- 在每个页面的 `onShow` 中重置滚动状态
- 可选:在 `onHide` 中也重置,避免影响下个页面
- 理解 `useScroll` 是全局共享的,不是页面独立的
- 如需页面独立状态,可以在页面组件内部使用局部 `ref`

**页面栈场景:**
```text
页面栈: [首页, 列表页, 详情页]
        ↑     ↑       ↑
       未激活 未激活   激活

当前只有详情页的 onPageScroll 会触发
但所有页面的组件都可以访问同一个 scrollTop
```

### 4. shouldShowBacktop() 的阈值如何设置?

**问题原因:**
- `shouldShowBacktop()` 的参数单位是 px
- `wd-backtop` 的 `top` 属性单位是 rpx
- 不同设备的 px 和 rpx 换算比例不同

**解决方案:**

```typescript
import { computed } from 'vue'
import { useScroll } from '@/composables/useScroll'

const { shouldShowBacktop } = useScroll()

// 方案1:使用默认值(推荐)
const showBtn1 = computed(() => shouldShowBacktop())
// 默认 600px,适配大部分场景

// 方案2:根据设备宽度动态计算
const showBtn2 = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth
  // 600rpx 转 px: 600 * (screenWidth / 750)
  const threshold = 600 * (screenWidth / 750)
  return shouldShowBacktop(threshold)
})

// 方案3:固定 px 值
const showBtn3 = computed(() => shouldShowBacktop(300))
// 在所有设备上都是 300px
```

**推荐配置:**

| 场景 | 推荐阈值(px) | 对应 rpx(iPhone 6) |
|------|-------------|-------------------|
| 返回顶部按钮 | 300-600 | 600-1200 |
| 吸顶导航栏 | 80-150 | 160-300 |
| 滚动指示器 | 50-100 | 100-200 |

**设备换算公式:**
```text
px = rpx * (设备宽度 / 750)
rpx = px * (750 / 设备宽度)

iPhone 6 (375px 宽度):
600rpx = 600 * (375 / 750) = 300px

iPad (768px 宽度):
600rpx = 600 * (768 / 750) = 614.4px
```

### 5. getScrollProgress() 返回值不准确?

**问题原因:**
- `maxScrollTop` 参数设置不正确
- 页面内容高度动态变化,但 `maxScrollTop` 未更新
- 计算 `maxScrollTop` 的时机不对

**解决方案:**

```vue
<template>
  <view class="page">
    <view class="progress-bar">
      <view class="progress" :style="{ width: `${progress}%` }" />
    </view>

    <view ref="contentRef" class="content">
      <!-- 动态内容 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { onReady, onPageScroll, onShow } from '@dcloudio/uni-app'

const { scrollTop, updateScrollTop, resetScrollTop, getScrollProgress } = useScroll()

const maxScrollTop = ref(0)

// ✅ 正确计算最大滚动高度
const calculateMaxScroll = () => {
  uni.createSelectorQuery()
    .select('.content')
    .boundingClientRect((rect) => {
      if (rect) {
        const systemInfo = uni.getSystemInfoSync()
        const windowHeight = systemInfo.windowHeight
        // 最大滚动高度 = 内容高度 - 窗口高度
        maxScrollTop.value = Math.max(0, rect.height - windowHeight)
        console.log('最大滚动高度:', maxScrollTop.value)
      }
    })
    .exec()
}

// 页面加载完成后计算
onReady(() => {
  calculateMaxScroll()
})

// 内容变化时重新计算
watch(contentData, () => {
  nextTick(() => {
    calculateMaxScroll()
  })
})

// 计算进度
const progress = computed(() => getScrollProgress(maxScrollTop.value))

onShow(() => {
  resetScrollTop()
})

onPageScroll((e) => {
  updateScrollTop(e.scrollTop)
})
</script>
```

**关键点:**
- 必须在 `onReady` 后计算,确保 DOM 已渲染
- 最大滚动高度 = 内容高度 - 窗口高度
- 内容动态变化时需要重新计算
- 使用 `Math.max(0, ...)` 避免负值

**调试技巧:**
```typescript
onReady(() => {
  uni.createSelectorQuery()
    .select('.content')
    .boundingClientRect((rect) => {
      console.log('内容高度:', rect.height)
      console.log('窗口高度:', uni.getSystemInfoSync().windowHeight)
      console.log('最大滚动高度:', rect.height - uni.getSystemInfoSync().windowHeight)
    })
    .exec()
})
```
