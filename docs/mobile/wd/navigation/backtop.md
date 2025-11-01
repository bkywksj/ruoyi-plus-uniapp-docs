# Backtop 回到顶部

## 介绍

Backtop 回到顶部组件用于返回页面顶部的操作按钮。当页面滚动到一定距离后自动显示,点击后平滑滚动回到页面顶部,提升长页面的浏览体验。组件支持圆形和方形两种样式,可自定义位置、图标和动画效果。

**核心特性:**

- **智能显示** - 根据页面滚动距离自动显示或隐藏,无需手动控制显示状态
- **平滑滚动** - 使用 `uni.pageScrollTo` 实现平滑回到顶部,可自定义滚动时间
- **双形状支持** - 提供圆形(circle)和方形(square)两种按钮形状
- **位置定制** - 可自定义距离屏幕底部和右侧的距离,适应不同布局需求
- **淡入淡出动画** - 集成 wd-transition 组件,按钮显示和隐藏时有平滑的淡入淡出效果
- **自定义图标** - 支持通过 slot 自定义按钮内容,默认使用 backtop 图标
- **层级控制** - 可设置 z-index,确保按钮始终在最上层
- **轻量简洁** - 组件实现简洁,代码量少,性能优秀

参考: src/wd/components/wd-backtop/wd-backtop.vue:1-96

## 基本用法

### 基础用法

在页面中添加回到顶部按钮,需要传入当前页面的滚动距离。

```vue
<template>
  <view class="page">
    <!-- 长列表内容 -->
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <!-- 回到顶部按钮 -->
    <wd-backtop :scroll-top="scrollTop" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

// 监听页面滚动
onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  text-align: center;
}
</style>
```

**使用说明:**
- 使用 `onPageScroll` 生命周期监听页面滚动
- 将滚动距离传递给 `scroll-top` 属性
- 默认滚动超过 600rpx 时显示按钮
- 点击按钮平滑滚动回到顶部

参考: src/wd/components/wd-backtop/wd-backtop.vue:49-50, 84-95

### 自定义显示时机

自定义滚动到多少距离时显示按钮。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <!-- 滚动超过 300rpx 时显示 -->
    <wd-backtop :scroll-top="scrollTop" :top="300" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- `top` 属性设置显示阈值,单位为 rpx
- 组件通过计算属性判断: `scrollTop > top` 时显示
- 默认值为 600rpx,可根据页面高度调整

参考: src/wd/components/wd-backtop/wd-backtop.vue:51-52, 71, 84

### 方形按钮

使用方形按钮样式。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <wd-backtop
      :scroll-top="scrollTop"
      shape="square"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- `shape` 属性支持两个值: `'circle'`(圆形) 和 `'square'`(方形)
- 圆形: `border-radius: 50%`
- 方形: `border-radius: 8rpx`
- 默认为圆形

参考: src/wd/components/wd-backtop/wd-backtop.vue:59-60, 75, 119-127

### 自定义位置

自定义按钮距离屏幕底部和右侧的距离。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="100"
      :right="80"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- `bottom` 设置距离屏幕底部的距离,单位 rpx,默认 200rpx
- `right` 设置距离屏幕右侧的距离,单位 rpx,默认 40rpx
- 组件使用 `position: fixed` 定位,通过 `bottom` 和 `right` 样式控制位置

参考: src/wd/components/wd-backtop/wd-backtop.vue:61-64, 76-77

### 自定义滚动时间

自定义回到顶部的滚动动画时间。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <!-- 滚动时间 500ms -->
    <wd-backtop
      :scroll-top="scrollTop"
      :duration="500"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- `duration` 设置滚动到顶部的动画时间,单位 ms
- 默认值为 100ms,较快的滚动速度
- 可设置为 300-500ms 获得更平滑的效果
- 使用 `uni.pageScrollTo` 的 `duration` 参数实现

参考: src/wd/components/wd-backtop/wd-backtop.vue:53-54, 72, 90-95

### 自定义图标样式

自定义图标的样式。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <wd-backtop
      :scroll-top="scrollTop"
      icon-style="font-size: 48rpx; color: #4d80f0;"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- `icon-style` 属性设置图标的自定义样式
- 可以修改图标大小、颜色等
- 样式会传递给内部的 `wd-icon` 组件

参考: src/wd/components/wd-backtop/wd-backtop.vue:57-58, 74, 10-15

### 自定义按钮内容

使用 slot 自定义按钮内容。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <wd-backtop :scroll-top="scrollTop">
      <view class="custom-button">
        <wd-icon name="arrow-up" size="32rpx" />
        <text class="button-text">TOP</text>
      </view>
    </wd-backtop>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.custom-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.button-text {
  font-size: 20rpx;
  margin-top: 4rpx;
}
</style>
```

**技术实现:**
- 使用默认插槽自定义按钮内容
- 如果提供了插槽内容,默认的 `wd-icon` 不会显示
- 可以自定义任意内容,如文字、图标组合等

参考: src/wd/components/wd-backtop/wd-backtop.vue:9-16

## 高级用法

### 结合滚动容器

在使用 scroll-view 等滚动容器时的用法。

```vue
<template>
  <view class="page">
    <scroll-view
      scroll-y
      class="scroll-container"
      :scroll-top="scrollTopValue"
      @scroll="handleScroll"
    >
      <view class="content">
        <view
          v-for="item in 100"
          :key="item"
          class="item"
        >
          列表项 {{ item }}
        </view>
      </view>
    </scroll-view>

    <wd-backtop
      :scroll-top="scrollTop"
      @click="handleBacktopClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)
const scrollTopValue = ref(0)

// 监听 scroll-view 滚动
const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

// 处理回到顶部点击
const handleBacktopClick = () => {
  // 使用 scroll-view 的 scroll-top 属性回到顶部
  // 需要先设置为一个临时值,再设置为0,否则可能不生效
  scrollTopValue.value = -1

  setTimeout(() => {
    scrollTopValue.value = 0
  }, 100)
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  position: relative;
}

.scroll-container {
  height: 100%;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- scroll-view 的滚动不会触发 `onPageScroll`
- 需要监听 `@scroll` 事件获取滚动距离
- 回到顶部需要设置 scroll-view 的 `scroll-top` 属性
- 先设置为 -1,再设置为 0,确保属性变化能被检测到

参考: src/wd/components/wd-backtop/wd-backtop.vue:90-95

### 多个回到顶部按钮

在一个页面中使用多个回到顶部按钮。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <!-- 默认按钮 -->
    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="100"
      :right="40"
    />

    <!-- 自定义按钮 -->
    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="200"
      :right="40"
      shape="square"
    >
      <view class="quick-menu">
        <wd-icon name="menu" size="32rpx" />
      </view>
    </wd-backtop>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.quick-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
```

**技术实现:**
- 可以在同一页面放置多个回到顶部按钮
- 通过设置不同的 `bottom` 值避免重叠
- 可以为不同按钮设置不同的功能(回到顶部、快捷菜单等)

参考: src/wd/components/wd-backtop/wd-backtop.vue:61-64

### 响应式位置调整

根据不同屏幕尺寸调整按钮位置。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="buttonBottom"
      :right="buttonRight"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const scrollTop = ref(0)
const screenWidth = ref(375)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  screenWidth.value = systemInfo.screenWidth
})

// 根据屏幕宽度调整位置
const buttonBottom = computed(() => {
  // 小屏幕: 底部80rpx, 大屏幕: 底部200rpx
  return screenWidth.value < 375 ? 80 : 200
})

const buttonRight = computed(() => {
  // 小屏幕: 右侧20rpx, 大屏幕: 右侧40rpx
  return screenWidth.value < 375 ? 20 : 40
})

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- 使用 `uni.getSystemInfoSync()` 获取屏幕宽度
- 通过 computed 属性动态计算按钮位置
- 小屏幕设备使用较小的边距,避免遮挡内容

参考: src/wd/components/wd-backtop/wd-backtop.vue:61-64, 76-77

### 带进度指示

显示当前滚动进度。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <wd-backtop :scroll-top="scrollTop">
      <view class="progress-button">
        <view class="progress-ring">
          <text class="progress-text">{{ scrollProgress }}%</text>
        </view>
        <view
          class="progress-fill"
          :style="{ height: scrollProgress + '%' }"
        />
      </view>
    </wd-backtop>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const scrollTop = ref(0)
const maxScrollTop = ref(0)

onMounted(() => {
  // 获取页面最大滚动距离
  uni.createSelectorQuery()
    .select('.page')
    .boundingClientRect((rect: any) => {
      const systemInfo = uni.getSystemInfoSync()
      maxScrollTop.value = Math.max(0, rect.height - systemInfo.windowHeight)
    })
    .exec()
})

// 计算滚动进度
const scrollProgress = computed(() => {
  if (maxScrollTop.value === 0) return 0
  return Math.min(100, Math.round((scrollTop.value / maxScrollTop.value) * 100))
})

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.progress-button {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.progress-ring {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.progress-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(77, 128, 240, 0.3);
  z-index: 1;
  transition: height 0.3s ease;
}
</style>
```

**技术实现:**
- 使用 `uni.createSelectorQuery()` 获取页面总高度
- 计算当前滚动进度百分比
- 在按钮中显示进度数字
- 使用渐变背景显示进度条

参考: src/wd/components/wd-backtop/wd-backtop.vue:9-16

### 条件显示

根据不同条件显示回到顶部按钮。

```vue
<template>
  <view class="page">
    <!-- 页眉 -->
    <view class="header">
      <wd-button size="small" @click="toggleBacktop">
        {{ showBacktop ? '隐藏' : '显示' }}回到顶部
      </wd-button>
    </view>

    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <!-- 条件显示 -->
    <wd-backtop
      v-if="showBacktop && hasPermission"
      :scroll-top="scrollTop"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const scrollTop = ref(0)
const showBacktop = ref(true)
const userRole = ref('admin')

// 根据用户角色判断是否有权限
const hasPermission = computed(() => {
  return userRole.value === 'admin' || userRole.value === 'vip'
})

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})

const toggleBacktop = () => {
  showBacktop.value = !showBacktop.value
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 16rpx;
  background-color: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}
</style>
```

**技术实现:**
- 使用 `v-if` 控制组件是否渲染
- 可以根据用户权限、设置选项等条件显示
- 组件内部已经通过 `scrollTop > top` 控制按钮显示,外层的 `v-if` 是组件级别的控制

参考: src/wd/components/wd-backtop/wd-backtop.vue:84

### 自定义主题样式

自定义按钮的主题样式。

```vue
<template>
  <view class="page">
    <view class="content">
      <view
        v-for="item in 100"
        :key="item"
        class="item"
      >
        列表项 {{ item }}
      </view>
    </view>

    <!-- 主题1: 渐变蓝色 -->
    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="100"
      custom-class="theme-blue"
    />

    <!-- 主题2: 渐变紫色 -->
    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="200"
      :right="40"
      custom-class="theme-purple"
    />

    <!-- 主题3: 渐变橙色 -->
    <wd-backtop
      :scroll-top="scrollTop"
      :bottom="300"
      :right="40"
      custom-class="theme-orange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
}

.content {
  padding: 32rpx;
}

.item {
  padding: 32rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

// 主题1: 渐变蓝色
.theme-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

// 主题2: 渐变紫色
.theme-purple {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4rpx 12rpx rgba(240, 147, 251, 0.4);
}

// 主题3: 渐变橙色
.theme-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  box-shadow: 0 4rpx 12rpx rgba(250, 112, 154, 0.4);
}
</style>
```

**技术实现:**
- 使用 `custom-class` 属性添加自定义样式类
- 通过 CSS 渐变背景创建主题效果
- 添加阴影增强视觉效果

参考: src/wd/components/wd-backtop/wd-backtop.vue:46-47, 70

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| scroll-top | **必填** 页面滚动距离,通过 `onPageScroll` 获取 | `number` | - |
| top | 距离顶部多少距离时显示,单位 rpx | `number` | `600` |
| duration | 返回顶部滚动时间,单位 ms | `number` | `100` |
| z-index | 层级 | `number` | `99` |
| icon-style | 图标自定义样式 | `string` | `''` |
| shape | 形状,可选值: `'circle'` / `'square'` | `BacktopShape` | `'circle'` |
| bottom | 距离屏幕底部距离,单位 rpx | `number` | `200` |
| right | 距离屏幕右边距离,单位 rpx | `number` | `40` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-backtop/wd-backtop.vue:43-65, 68-78

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义按钮内容,默认为 backtop 图标 |

参考: src/wd/components/wd-backtop/wd-backtop.vue:9-16

### 类型定义

```typescript
/**
 * 形状类型
 */
export type BacktopShape = 'circle' | 'square'

/**
 * 回到顶部组件属性接口
 */
interface WdBacktopProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 页面滚动距离 */
  scrollTop: number
  /** 距离顶部多少距离时显示,单位rpx */
  top?: number
  /** 返回顶部滚动时间,单位ms */
  duration?: number
  /** 层级 */
  zIndex?: number
  /** icon自定义样式 */
  iconStyle?: string
  /** 形状,可选值:'circle' / 'square' */
  shape?: BacktopShape
  /** 距离屏幕底部距离,单位rpx */
  bottom?: number
  /** 距离屏幕右边距离,单位rpx */
  right?: number
}
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:35-65

## 主题定制

### CSS 变量

组件提供以下 CSS 变量用于主题定制:

```scss
// 回到顶部组件主题变量
$-backtop-bg: rgba(0, 0, 0, 0.6) !default;      // 背景颜色
$-backtop-icon-size: 40rpx !default;             // 图标大小
$-color-gray-8: #eeeeee !default;                // 图标颜色
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:98-129

### 自定义样式

通过 `custom-class` 和 `custom-style` 自定义组件样式:

```vue
<template>
  <!-- 自定义背景和大小 -->
  <wd-backtop
    :scroll-top="scrollTop"
    custom-class="my-backtop"
    custom-style="width: 100rpx; height: 100rpx;"
  />
</template>

<style lang="scss">
.my-backtop {
  // 自定义背景
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  // 自定义阴影
  box-shadow: 0 8rpx 24rpx rgba(77, 128, 240, 0.4);

  // 悬停效果(小程序不支持)
  &:active {
    transform: scale(0.95);
  }
}
</style>
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:44-47, 69-70

## 最佳实践

### 1. 合理设置显示阈值

根据页面高度和内容密度设置合适的显示阈值:

```vue
<!-- ✅ 推荐: 短页面(2-3屏)使用较小的阈值 -->
<wd-backtop :scroll-top="scrollTop" :top="300" />

<!-- ✅ 推荐: 长页面(5屏以上)使用默认或较大的阈值 -->
<wd-backtop :scroll-top="scrollTop" :top="800" />

<!-- ✅ 推荐: 根据屏幕高度动态设置 -->
<wd-backtop :scroll-top="scrollTop" :top="screenHeight * 2" />

<!-- ❌ 不推荐: 阈值太小,按钮出现太早 -->
<wd-backtop :scroll-top="scrollTop" :top="50" />

<!-- ❌ 不推荐: 阈值太大,用户需要滚动很久才能看到按钮 -->
<wd-backtop :scroll-top="scrollTop" :top="5000" />
```

**说明:**
- 阈值应该是用户明确需要快速回到顶部的时机
- 通常设置为 1-2 个屏幕高度
- 太小会造成视觉干扰,太大则失去意义

参考: src/wd/components/wd-backtop/wd-backtop.vue:51-52, 71, 84

### 2. 选择合适的滚动时间

根据页面滚动距离选择合适的动画时间:

```vue
<!-- ✅ 推荐: 短距离(1-2屏)使用较短时间 -->
<wd-backtop :scroll-top="scrollTop" :duration="100" />

<!-- ✅ 推荐: 中等距离(3-5屏)使用中等时间 -->
<wd-backtop :scroll-top="scrollTop" :duration="300" />

<!-- ✅ 推荐: 长距离(5屏以上)使用较长时间 -->
<wd-backtop :scroll-top="scrollTop" :duration="500" />

<!-- ❌ 不推荐: 滚动时间太长,用户等待时间长 -->
<wd-backtop :scroll-top="scrollTop" :duration="2000" />

<!-- ❌ 不推荐: 滚动时间为0,没有动画效果 -->
<wd-backtop :scroll-top="scrollTop" :duration="0" />
```

**说明:**
- 滚动时间应该和滚动距离成正比
- 100-500ms 是比较合适的范围
- 太短感觉突兀,太长用户等待时间长

参考: src/wd/components/wd-backtop/wd-backtop.vue:53-54, 72, 90-95

### 3. 避免遮挡重要内容

合理设置按钮位置,避免遮挡页面重要内容:

```vue
<!-- ✅ 推荐: 避开底部操作栏 -->
<view class="page">
  <view class="content">...</view>

  <!-- 底部操作栏高度120rpx,按钮距离底部至少140rpx -->
  <view class="bottom-bar">...</view>

  <wd-backtop :scroll-top="scrollTop" :bottom="140" />
</view>

<!-- ✅ 推荐: 如果有底部TabBar,增加bottom值 -->
<!-- TabBar高度通常为100rpx左右 -->
<wd-backtop :scroll-top="scrollTop" :bottom="120" />

<!-- ✅ 推荐: 如果有浮动操作按钮,调整位置错开 -->
<wd-backtop :scroll-top="scrollTop" :bottom="100" :right="40" />
<view class="fab" :style="{ bottom: '220rpx', right: '40rpx' }">...</view>

<!-- ❌ 不推荐: 按钮位置过低,遮挡底部内容 -->
<wd-backtop :scroll-top="scrollTop" :bottom="20" />

<!-- ❌ 不推荐: 按钮位置过高,不在用户拇指易触区域 -->
<wd-backtop :scroll-top="scrollTop" :bottom="600" />
```

**说明:**
- 考虑页面中其他固定定位的元素
- 留出足够的安全距离
- 确保按钮在拇指易触区域(屏幕下半部分)

参考: src/wd/components/wd-backtop/wd-backtop.vue:61-64, 76-77

### 4. 使用合适的形状

根据设计风格选择合适的按钮形状:

```vue
<!-- ✅ 推荐: 现代简约风格使用圆形 -->
<wd-backtop :scroll-top="scrollTop" shape="circle" />

<!-- ✅ 推荐: 商务正式风格使用方形 -->
<wd-backtop :scroll-top="scrollTop" shape="square" />

<!-- ✅ 推荐: 与页面其他浮动按钮保持一致 -->
<!-- 如果页面中的浮动操作按钮是圆形,回到顶部按钮也用圆形 -->
<wd-backtop :scroll-top="scrollTop" shape="circle" />
```

**说明:**
- 圆形更加柔和、现代
- 方形更加正式、稳重
- 保持与页面整体设计风格的一致性

参考: src/wd/components/wd-backtop/wd-backtop.vue:59-60, 75, 119-127

### 5. 正确监听页面滚动

确保正确监听页面滚动事件:

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

// ✅ 推荐: 使用 onPageScroll 生命周期
onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
})

// ✅ 推荐: 在 scroll-view 中使用 @scroll 事件
const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

// ❌ 不推荐: 不监听滚动事件,scrollTop始终为0
// const scrollTop = ref(0)
// 这样组件无法正常工作

// ❌ 不推荐: 监听错误的事件
// onMounted(() => {
//   window.addEventListener('scroll', ...) // UniApp中不适用
// })
</script>
```

**说明:**
- 页面滚动使用 `onPageScroll` 生命周期
- scroll-view 滚动使用 `@scroll` 事件
- 必须将滚动距离传递给组件的 `scroll-top` 属性

参考: src/wd/components/wd-backtop/wd-backtop.vue:49-50, 84

## 常见问题

### 1. 按钮不显示怎么办?

**问题原因:**
- 没有正确传递 `scroll-top` 属性
- 没有监听页面滚动事件
- 滚动距离未达到显示阈值

**解决方案:**

```vue
<template>
  <view class="page">
    <view class="content">...</view>

    <!-- ✅ 确保传递了 scroll-top -->
    <wd-backtop :scroll-top="scrollTop" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

// ✅ 确保监听了页面滚动
onPageScroll((e: any) => {
  scrollTop.value = e.scrollTop
  console.log('当前滚动距离:', scrollTop.value) // 调试用
})

// ✅ 检查是否达到显示阈值
// 默认阈值是600rpx,可以调小测试
// <wd-backtop :scroll-top="scrollTop" :top="100" />
</script>
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:49-52, 84

### 2. scroll-view 中如何使用?

**问题原因:**
- scroll-view 的滚动不会触发 `onPageScroll`
- 不知道如何获取 scroll-view 的滚动距离

**解决方案:**

```vue
<template>
  <view class="page">
    <scroll-view
      scroll-y
      class="scroll-container"
      @scroll="handleScroll"
    >
      <view class="content">...</view>
    </scroll-view>

    <wd-backtop :scroll-top="scrollTop" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

// ✅ 监听 scroll-view 的 scroll 事件
const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
}

.scroll-container {
  height: 100%;
}
</style>
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:49-50

### 3. 点击按钮后没有回到顶部?

**问题原因:**
- 在 scroll-view 中使用,需要特殊处理
- 组件默认使用 `uni.pageScrollTo`,在 scroll-view 中不生效

**解决方案:**

```vue
<template>
  <view class="page">
    <scroll-view
      scroll-y
      class="scroll-container"
      :scroll-top="scrollTopValue"
      @scroll="handleScroll"
    >
      <view class="content">...</view>
    </scroll-view>

    <!-- ✅ 不要使用组件的默认点击行为,自己处理 -->
    <view
      v-if="scrollTop > 600"
      class="custom-backtop"
      @click="handleBacktopClick"
    >
      <wd-icon name="backtop" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)
const scrollTopValue = ref(0)

const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

// ✅ 自定义回到顶部处理
const handleBacktopClick = () => {
  // 先设置为临时值
  scrollTopValue.value = -1

  // 再设置为0,触发滚动
  setTimeout(() => {
    scrollTopValue.value = 0
  }, 100)
}
</script>

<style lang="scss" scoped>
.custom-backtop {
  position: fixed;
  bottom: 200rpx;
  right: 40rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 99;
}
</style>
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:90-95

### 4. 如何自定义按钮样式?

**问题原因:**
- 不知道如何修改按钮的背景色、大小等样式
- CSS 优先级问题导致样式不生效

**解决方案:**

```vue
<template>
  <!-- ✅ 方案1: 使用 custom-class 和 custom-style -->
  <wd-backtop
    :scroll-top="scrollTop"
    custom-class="my-backtop"
    custom-style="width: 100rpx; height: 100rpx; background: linear-gradient(135deg, #667eea, #764ba2);"
  />

  <!-- ✅ 方案2: 使用 slot 完全自定义 -->
  <wd-backtop :scroll-top="scrollTop">
    <view class="custom-button">
      <wd-icon name="arrow-up" size="32rpx" />
      <text>TOP</text>
    </view>
  </wd-backtop>
</template>

<style lang="scss">
// ✅ 确保样式类不是 scoped 的,或使用 :deep()
.my-backtop {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8rpx 24rpx rgba(77, 128, 240, 0.4);
}

// 或使用深度选择器
:deep(.my-backtop) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
```

参考: src/wd/components/wd-backtop/wd-backtop.vue:9-16, 44-47, 69-70

### 5. 按钮层级太低,被其他元素遮挡?

**问题原因:**
- 页面中其他元素的 z-index 较高
- 没有设置组件的 z-index

**解决方案:**

```vue
<!-- ✅ 设置更高的 z-index -->
<wd-backtop :scroll-top="scrollTop" :z-index="999" />

<!-- ✅ 检查页面中其他元素的 z-index -->
<!-- 确保回到顶部按钮的 z-index 最高 -->

<!-- ❌ 错误: 其他元素 z-index 过高 -->
<view class="some-element" style="z-index: 9999;">...</view>
<wd-backtop :scroll-top="scrollTop" :z-index="99" /> <!-- 被遮挡 -->
```

**说明:**
- 组件默认 z-index 为 99
- 如果被遮挡,检查页面中其他元素的 z-index
- 将回到顶部按钮的 z-index 设置为最高值

参考: src/wd/components/wd-backtop/wd-backtop.vue:55-56, 73

## 注意事项

1. **scroll-top 必填** - `scroll-top` 是必填属性,必须通过 `onPageScroll` 或 `@scroll` 事件获取并传递

2. **单位说明** - `top`、`bottom`、`right` 的单位都是 rpx,`duration` 的单位是 ms

3. **页面滚动 vs scroll-view 滚动** - 页面滚动使用 `onPageScroll`,scroll-view 滚动使用 `@scroll` 事件

4. **scroll-view 回到顶部** - 在 scroll-view 中,组件的默认点击行为不生效,需要自行处理

5. **显示条件** - 组件通过 `wd-transition` 控制淡入淡出,只有当 `scrollTop > top` 时才显示

6. **固定定位** - 组件使用 `position: fixed` 定位,会相对于视口定位,不受滚动影响

7. **层级管理** - 组件默认 z-index 为 99,如果页面中有更高层级的元素,需要调整 `z-index`

8. **自定义内容** - 使用 slot 自定义按钮内容时,默认的 `wd-icon` 不会显示

9. **形状样式** - `shape` 属性只影响 `border-radius`,不影响大小和颜色

10. **滚动时间** - `duration` 为 0 时,滚动会瞬间完成,没有动画效果

11. **自定义样式优先级** - 使用 `custom-class` 时,确保样式类不是 scoped 的,或使用 `:deep()`

12. **多个按钮** - 可以在同一页面放置多个回到顶部按钮,但要注意避免位置重叠

参考: src/wd/components/wd-backtop/wd-backtop.vue:1-130
