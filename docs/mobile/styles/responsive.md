# 响应式设计

## 概述

RuoYi-Plus-UniApp 移动端项目采用完整的响应式设计体系，基于 UniApp 的 rpx 单位系统和 CSS 变量实现多端适配。响应式设计确保应用在不同尺寸的设备上都能保持良好的视觉效果和用户体验，包括各种尺寸的手机、平板以及不同刘海屏、全面屏设备的安全区域适配。

**响应式设计体系特点:**

- **rpx 自适应单位** - 以 750rpx 为基准宽度，自动适配不同屏幕尺寸
- **安全区域适配** - 完整支持 iPhone X 及以上设备的刘海屏和底部安全区域
- **多端一致性** - H5、小程序、App 多端显示效果统一
- **CSS 变量驱动** - 所有尺寸通过 CSS 变量控制，支持动态调整
- **工具函数支持** - 提供 rpx/px 互转等实用工具函数
- **UnoCSS 集成** - 原子化 CSS 支持响应式类名和安全区域规则

## rpx 响应式单位系统

### rpx 单位原理

rpx（responsive pixel）是 UniApp 提供的响应式单位，以 750rpx 为屏幕基准宽度，可以根据屏幕宽度进行自适应。

**换算公式:**

```text
实际像素 = rpx值 × (屏幕宽度 / 750)
```

**常见设备换算示例:**

| 设备 | 屏幕宽度 | 1rpx 对应像素 | 100rpx 对应像素 |
|------|---------|--------------|----------------|
| iPhone 5/SE | 320px | 0.427px | 42.7px |
| iPhone 6/7/8 | 375px | 0.5px | 50px |
| iPhone 6/7/8 Plus | 414px | 0.552px | 55.2px |
| iPhone X/XS/11 Pro | 375px | 0.5px | 50px |
| iPhone XR/11 | 414px | 0.552px | 55.2px |
| iPhone 12/13 | 390px | 0.52px | 52px |
| iPhone 12/13 Pro Max | 428px | 0.571px | 57.1px |
| Android 360px | 360px | 0.48px | 48px |
| Android 412px | 412px | 0.549px | 54.9px |
| iPad Mini | 768px | 1.024px | 102.4px |
| iPad Pro 11 | 834px | 1.112px | 111.2px |

**设计稿对应关系:**

- 以 iPhone 6/7/8（375px）为基准的设计稿：设计稿 1px = 2rpx
- 以 750px 宽度为基准的设计稿：设计稿 1px = 1rpx

### rpx 单位使用规范

```vue
<template>
  <view class="responsive-demo">
    <!-- 使用 rpx 单位进行布局 -->
    <view class="card">
      <view class="card-header">
        <text class="title">卡片标题</text>
        <text class="subtitle">副标题</text>
      </view>
      <view class="card-body">
        <text class="content">卡片内容文字</text>
      </view>
      <view class="card-footer">
        <wd-button size="small">操作按钮</wd-button>
      </view>
    </view>
  </view>
</template>

```

**rpx 使用建议:**

| 场景 | 建议单位 | 说明 |
|------|---------|------|
| 布局宽高 | rpx | 自动适配不同屏幕 |
| 内外边距 | rpx | 保持视觉比例一致 |
| 字体大小 | rpx | 跟随屏幕缩放 |
| 边框宽度 | rpx 或 px | 1rpx 可能过细，可用 1px |
| 圆角 | rpx | 保持比例一致 |
| 阴影 | rpx | 保持比例一致 |
| 图标尺寸 | rpx | 图标跟随屏幕缩放 |
| 固定尺寸图片 | px | 图片本身不缩放 |

### 单位转换工具函数

WD UI 组件库提供了完整的单位转换工具函数：

```typescript
/**
 * 将 rpx 转换为 px
 * @param rpx rpx 数值
 * @returns px 数值
 */
export const rpxToPx = (rpx: number): number => {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth || 375
  return (rpx / 750) * screenWidth
}

/**
 * 将 px 转换为 rpx
 * @param px px 数值
 * @returns rpx 数值
 */
export const pxToRpx = (px: number): number => {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth || 375
  return (px / screenWidth) * 750
}

/**
 * 添加单位
 * @param num 数值
 * @param unit 单位，默认 rpx
 * @returns 带单位的字符串
 */
export const addUnit = (num: number | string, unit: string = 'rpx'): string => {
  if (Number.isNaN(Number(num))) {
    return `${num}`
  }
  if (Number(num) === 0) {
    return '0'
  }
  return `${num}${unit}`
}
```

**工具函数使用示例:**

```vue
<template>
  <view class="unit-demo">
    <!-- 动态计算尺寸 -->
    <view
      class="dynamic-box"
      :style="{
        width: boxWidth + 'px',
        height: boxHeight + 'px',
      }"
    >
      动态尺寸盒子
    </view>

    <!-- Canvas 绑定实际像素 -->
    <canvas
      canvas-id="myCanvas"
      :style="{
        width: canvasWidth + 'px',
        height: canvasHeight + 'px',
      }"
    />

    <!-- 动态间距 -->
    <view :style="{ marginTop: addUnit(spacing) }">
      动态间距内容
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { rpxToPx, addUnit } from '@/wd/components/common/util'

// 将 rpx 设计值转换为实际 px
const boxWidth = computed(() => rpxToPx(300))
const boxHeight = computed(() => rpxToPx(200))

// Canvas 尺寸（Canvas 需要 px 单位）
const canvasWidth = computed(() => rpxToPx(600))
const canvasHeight = computed(() => rpxToPx(400))

// 动态间距
const spacing = ref(32)
</script>
```

### 获取屏幕和窗口信息

```typescript
/**
 * 获取设备和窗口信息
 */
const getSystemInfo = () => {
  const info = uni.getSystemInfoSync()

  return {
    // 屏幕尺寸（物理屏幕）
    screenWidth: info.screenWidth,      // 屏幕宽度，单位 px
    screenHeight: info.screenHeight,    // 屏幕高度，单位 px

    // 窗口尺寸（可用区域）
    windowWidth: info.windowWidth,      // 可用窗口宽度，单位 px
    windowHeight: info.windowHeight,    // 可用窗口高度，单位 px

    // 状态栏
    statusBarHeight: info.statusBarHeight,  // 状态栏高度，单位 px

    // 安全区域
    safeArea: info.safeArea,            // 安全区域信息
    safeAreaInsets: info.safeAreaInsets, // 安全区域边距

    // 设备像素比
    pixelRatio: info.pixelRatio,        // 设备像素比

    // 平台信息
    platform: info.platform,            // 客户端平台
    system: info.system,                // 操作系统及版本
    brand: info.brand,                  // 设备品牌
    model: info.model,                  // 设备型号
  }
}

// 使用示例
const systemInfo = getSystemInfo()
console.log('屏幕宽度:', systemInfo.screenWidth)
console.log('窗口高度:', systemInfo.windowHeight)
console.log('状态栏高度:', systemInfo.statusBarHeight)
console.log('安全区域:', systemInfo.safeArea)
```

## 安全区域适配

### 安全区域概念

安全区域（Safe Area）是指设备屏幕中不被刘海、圆角、Home 指示条等遮挡的可用区域。不同设备的安全区域边距不同：

**iPhone 安全区域示例:**

| 设备 | 顶部安全距离 | 底部安全距离 | 说明 |
|------|------------|------------|------|
| iPhone 8 及更早 | 20px（状态栏） | 0px | 无刘海无 Home 指示条 |
| iPhone X/XS/11 Pro | 44px | 34px | 刘海屏 + Home 指示条 |
| iPhone XR/11 | 48px | 34px | 刘海屏 + Home 指示条 |
| iPhone 12/13 | 47px | 34px | 灵动岛 + Home 指示条 |
| iPhone 14 Pro | 59px | 34px | 灵动岛 + Home 指示条 |

### CSS 环境变量

iOS 11+ 和现代 Android 设备支持 CSS 环境变量获取安全区域边距：

```scss
// 安全区域 CSS 环境变量
.safe-area-demo {
  // iOS 11.0-11.2 使用 constant()
  padding-top: constant(safe-area-inset-top);
  padding-right: constant(safe-area-inset-right);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-left: constant(safe-area-inset-left);

  // iOS 11.2+ 使用 env()
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

// 兼容写法（先写 constant，再写 env）
.safe-area-compatible {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);

  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

// 与其他值结合使用 calc()
.fixed-bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  // 按钮本身高度 + 底部安全距离
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
```

### 顶部安全区域适配

导航栏组件需要适配状态栏和刘海区域：

```vue
<template>
  <view class="custom-navbar" :style="navbarStyle">
    <view class="navbar-content">
      <view class="navbar-left" @click="goBack">
        <wd-icon name="arrow-left" size="40" />
      </view>
      <view class="navbar-title">
        <text>页面标题</text>
      </view>
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  /** 是否适配顶部安全区域 */
  safeAreaInsetTop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  safeAreaInsetTop: true,
})

// 获取状态栏高度
const { statusBarHeight = 0 } = uni.getSystemInfoSync()

// 计算导航栏样式
const navbarStyle = computed(() => {
  const styles: Record<string, string> = {}

  if (props.safeAreaInsetTop) {
    // 顶部内边距 = 状态栏高度
    styles.paddingTop = `${statusBarHeight}px`
  }

  return styles
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

```

**WD UI Navbar 组件的安全区域适配:**

```vue
<template>
  <!-- 使用 safeAreaInsetTop 属性启用顶部安全区域适配 -->
  <wd-navbar
    title="页面标题"
    :safe-area-inset-top="true"
    :fixed="true"
    @click-left="goBack"
  />
</template>

<script lang="ts" setup>
const goBack = () => {
  uni.navigateBack()
}
</script>
```

### 底部安全区域适配

底部固定元素需要适配 Home 指示条区域：

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
    <view class="content">
      <view v-for="i in 20" :key="i" class="item">
        列表项 {{ i }}
      </view>
    </view>

    <!-- 底部固定按钮 -->
    <view class="fixed-bottom">
      <wd-button type="primary" block>提交</wd-button>
    </view>
  </view>
</template>

```

### TabBar 安全区域适配

自定义 TabBar 需要适配底部安全区域：

```vue
<template>
  <view class="custom-tabbar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tabbar-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <view class="tabbar-icon">
        <wd-icon
          :name="currentIndex === index ? item.selectedIcon : item.icon"
          :size="48"
          :color="currentIndex === index ? '#4d80f0' : '#999999'"
        />
      </view>
      <text class="tabbar-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface TabItem {
  icon: string
  selectedIcon: string
  text: string
  pagePath: string
}

const tabList: TabItem[] = [
  { icon: 'home', selectedIcon: 'home-fill', text: '首页', pagePath: '/pages/index/index' },
  { icon: 'goods', selectedIcon: 'goods-fill', text: '分类', pagePath: '/pages/category/index' },
  { icon: 'cart', selectedIcon: 'cart-fill', text: '购物车', pagePath: '/pages/cart/index' },
  { icon: 'user', selectedIcon: 'user-fill', text: '我的', pagePath: '/pages/mine/index' },
]

const currentIndex = ref(0)

const switchTab = (index: number) => {
  if (currentIndex.value === index) return

  currentIndex.value = index
  uni.switchTab({
    url: tabList[index].pagePath,
  })
}
</script>

```

### UnoCSS 安全区域规则

项目中配置了 UnoCSS 安全区域快捷规则：

```typescript
// uno.config.ts
export default defineConfig({
  rules: [
    // 四边安全区域
    ['p-safe', {
      padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
    }],

    // 顶部安全区域
    ['pt-safe', {
      'padding-top': 'env(safe-area-inset-top)'
    }],

    // 底部安全区域
    ['pb-safe', {
      'padding-bottom': 'env(safe-area-inset-bottom)'
    }],

    // 左侧安全区域（横屏）
    ['pl-safe', {
      'padding-left': 'env(safe-area-inset-left)'
    }],

    // 右侧安全区域（横屏）
    ['pr-safe', {
      'padding-right': 'env(safe-area-inset-right)'
    }],
  ],
})
```

**使用 UnoCSS 安全区域规则:**

```vue
<template>
  <!-- 顶部安全区域 -->
  <view class="pt-safe bg-white">
    顶部导航区域
  </view>

  <!-- 底部安全区域 -->
  <view class="pb-safe bg-white fixed bottom-0 left-0 right-0">
    底部操作区域
  </view>

  <!-- 四边安全区域（全屏弹窗） -->
  <view class="p-safe fixed inset-0 bg-white">
    全屏内容区域
  </view>
</template>
```

## 字体响应式设计

### 字体大小层级

项目定义了统一的字体大小层级，使用 rpx 单位确保响应式：

```scss
// src/wd/components/common/abstracts/variable.scss

/* 字体大小层级 */
$-fs-big: var(--wot-fs-big, 48rpx) !default;          // 大型标题
$-fs-important: var(--wot-fs-important, 38rpx) !default; // 重要数据
$-fs-title: var(--wot-fs-title, 32rpx) !default;      // 标题/重要正文
$-fs-content: var(--wot-fs-content, 28rpx) !default;  // 普通正文
$-fs-secondary: var(--wot-fs-secondary, 24rpx) !default; // 次要信息
$-fs-aid: var(--wot-fs-aid, 20rpx) !default;          // 辅助文字
```

**字体大小使用规范:**

| 变量 | 尺寸 | 使用场景 |
|------|------|---------|
| `$-fs-big` | 48rpx | 数据大屏、营销页面大标题 |
| `$-fs-important` | 38rpx | 金额、重要数据展示 |
| `$-fs-title` | 32rpx | 页面标题、模块标题、按钮文字 |
| `$-fs-content` | 28rpx | 正文内容、列表项、输入框 |
| `$-fs-secondary` | 24rpx | 次要说明、标签、提示信息 |
| `$-fs-aid` | 20rpx | 版权信息、辅助性说明 |

### 字体响应式使用示例

```vue
<template>
  <view class="typography-demo">
    <!-- 使用 CSS 变量 -->
    <view class="amount">¥ 1,234.56</view>
    <view class="title">页面主标题</view>
    <view class="content">这是正文内容，使用标准字号</view>
    <view class="secondary">次要信息，字号稍小</view>
    <view class="tip">提示文字，最小字号</view>
  </view>
</template>

```

### UnoCSS 字体大小配置

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    fontSize: {
      '2xs': ['20rpx', '28rpx'],   // 超小字体 + 行高
      '3xs': ['18rpx', '26rpx'],   // 最小字体 + 行高
      'xs': ['24rpx', '32rpx'],    // 小字体 + 行高
      'sm': ['28rpx', '36rpx'],    // 正文字体 + 行高
      'base': ['32rpx', '44rpx'],  // 标题字体 + 行高
      'lg': ['36rpx', '48rpx'],    // 大字体 + 行高
      'xl': ['40rpx', '52rpx'],    // 超大字体 + 行高
      '2xl': ['48rpx', '60rpx'],   // 特大字体 + 行高
    },
  },
})
```

**使用 UnoCSS 字体类:**

```vue
<template>
  <view class="text-demo">
    <text class="text-2xl font-bold">大标题</text>
    <text class="text-base font-semibold">小标题</text>
    <text class="text-sm">正文内容</text>
    <text class="text-xs text-gray-500">次要信息</text>
    <text class="text-2xs text-gray-400">辅助文字</text>
  </view>
</template>
```

## 间距响应式设计

### 间距变量定义

项目定义了统一的间距变量，确保布局一致性：

```scss
// src/wd/components/common/abstracts/variable.scss

/* 屏幕两侧留白 */
$-size-side-padding: var(--wot-size-side-padding, 30rpx) !default;       // 标准边距
$-size-side-padding-small: var(--wot-size-side-padding-small, 12rpx) !default; // 紧凑边距

/* 组件内边距 */
$-cell-padding: var(--wot-cell-padding, 30rpx) !default;  // 单元格内边距
$-card-padding: var(--wot-card-padding, 30rpx) !default;  // 卡片内边距
```

### 间距响应式规范

```scss
// 推荐的间距规范（基于 4px 基准）
$spacing-xs: 8rpx;     // 超小间距（元素内部）
$spacing-sm: 16rpx;    // 小间距（相关元素之间）
$spacing-md: 24rpx;    // 中等间距（模块内部）
$spacing-lg: 32rpx;    // 大间距（模块之间）
$spacing-xl: 48rpx;    // 超大间距（区块之间）
$spacing-xxl: 64rpx;   // 特大间距（页面级别）
```

**间距使用示例:**

```vue
<template>
  <view class="spacing-demo">
    <!-- 页面级间距 -->
    <view class="page-section">
      <view class="section-title">区块标题</view>
      <view class="section-content">
        <!-- 模块间距 -->
        <view class="module">
          <view class="module-header">模块标题</view>
          <view class="module-body">
            <!-- 元素间距 -->
            <view class="item">
              <text class="label">标签</text>
              <text class="value">值</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

```

## 多平台响应式适配

### 平台条件编译样式

使用条件编译为不同平台提供特定样式：

```scss
// H5 平台特定样式
/* #ifdef H5 */
.h5-only {
  // H5 支持 hover 效果
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
}

// H5 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
/* #endif */

// 微信小程序特定样式
/* #ifdef MP-WEIXIN */
.mp-weixin-only {
  // 移除小程序默认点击高亮
  -webkit-tap-highlight-color: transparent;
}

// 小程序 button 样式重置
button {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: none;
  border-radius: 0;

  &::after {
    display: none;
  }
}
/* #endif */

// App 平台特定样式
/* #ifdef APP-PLUS */
.app-only {
  // App 特定样式
}
/* #endif */

// 非 H5 平台
/* #ifndef H5 */
.not-h5 {
  // 小程序和 App 通用样式
}
/* #endif */
```

### 组件平台适配

```vue
<template>
  <view class="platform-demo">
    <!-- H5 平台显示 -->
    <!-- #ifdef H5 -->
    <view class="h5-tip">
      当前运行在 H5 平台
    </view>
    <!-- #endif -->

    <!-- 小程序平台显示 -->
    <!-- #ifdef MP -->
    <view class="mp-tip">
      当前运行在小程序平台
    </view>
    <!-- #endif -->

    <!-- App 平台显示 -->
    <!-- #ifdef APP-PLUS -->
    <view class="app-tip">
      当前运行在 App 平台
    </view>
    <!-- #endif -->

    <!-- 通用内容 -->
    <view class="common-content">
      所有平台通用内容
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const platformInfo = ref({
  platform: '',
  screenWidth: 0,
  screenHeight: 0,
})

onMounted(() => {
  const info = uni.getSystemInfoSync()
  platformInfo.value = {
    platform: info.platform,
    screenWidth: info.screenWidth,
    screenHeight: info.screenHeight,
  }
})
</script>

```

### 屏幕尺寸适配

```vue
<template>
  <view class="screen-adaptive" :class="screenClass">
    <view class="main-content">
      主要内容区域
    </view>
    <view v-if="isLargeScreen" class="side-panel">
      侧边栏（仅大屏显示）
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(375)
const windowHeight = ref(667)

// 屏幕尺寸分类
const screenClass = computed(() => {
  const width = windowWidth.value
  if (width >= 768) return 'screen-lg'    // 大屏（平板）
  if (width >= 414) return 'screen-md'    // 中屏（大手机）
  return 'screen-sm'                       // 小屏（普通手机）
})

// 是否大屏
const isLargeScreen = computed(() => windowWidth.value >= 768)

// 监听窗口变化
const updateSize = () => {
  const info = uni.getSystemInfoSync()
  windowWidth.value = info.windowWidth
  windowHeight.value = info.windowHeight
}

onMounted(() => {
  updateSize()

  // H5 平台监听窗口变化
  // #ifdef H5
  window.addEventListener('resize', updateSize)
  // #endif
})

onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('resize', updateSize)
  // #endif
})
</script>

```

## 布局响应式设计

### Flex 布局响应式

```vue
<template>
  <view class="flex-responsive">
    <!-- 自动换行的 Flex 布局 -->
    <view class="flex-wrap-container">
      <view v-for="i in 6" :key="i" class="flex-item">
        项目 {{ i }}
      </view>
    </view>

    <!-- 响应式列数 -->
    <view class="grid-container">
      <view v-for="i in 9" :key="i" class="grid-item">
        {{ i }}
      </view>
    </view>
  </view>
</template>

```

### 滚动容器响应式

```vue
<template>
  <view class="scroll-responsive">
    <!-- 横向滚动（自动适配屏幕宽度） -->
    <scroll-view scroll-x class="horizontal-scroll">
      <view class="scroll-content">
        <view v-for="i in 10" :key="i" class="scroll-item">
          <view class="item-image"></view>
          <text class="item-title">标题 {{ i }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 纵向滚动（自动计算高度） -->
    <scroll-view
      scroll-y
      class="vertical-scroll"
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="loadMore"
    >
      <view v-for="i in list" :key="i" class="list-item">
        列表项 {{ i }}
      </view>
      <view v-if="loading" class="loading-more">
        <wd-loading size="24" />
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const list = ref<number[]>([])
const loading = ref(false)
const scrollHeight = ref(400)

// 计算滚动区域高度
onMounted(() => {
  const info = uni.getSystemInfoSync()
  // 窗口高度 - 顶部区域高度 - 底部安全区域
  scrollHeight.value = info.windowHeight - 200 - (info.safeAreaInsets?.bottom || 0)

  // 初始化列表
  loadMore()
})

// 加载更多
const loadMore = async () => {
  if (loading.value) return

  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))

  const start = list.value.length
  for (let i = 1; i <= 10; i++) {
    list.value.push(start + i)
  }

  loading.value = false
}
</script>

```

## WD UI 组件响应式特性

### 组件尺寸响应式

WD UI 组件支持 rpx 单位进行尺寸设置：

```vue
<template>
  <view class="component-responsive">
    <!-- 按钮尺寸响应式 -->
    <view class="section">
      <text class="title">按钮尺寸</text>
      <view class="button-group">
        <wd-button size="small">小按钮</wd-button>
        <wd-button size="medium">中按钮</wd-button>
        <wd-button size="large">大按钮</wd-button>
      </view>
    </view>

    <!-- 图标尺寸响应式 -->
    <view class="section">
      <text class="title">图标尺寸</text>
      <view class="icon-group">
        <wd-icon name="home" size="32" />
        <wd-icon name="home" size="48" />
        <wd-icon name="home" size="64" />
        <wd-icon name="home" size="80" />
      </view>
    </view>

    <!-- 加载尺寸响应式 -->
    <view class="section">
      <text class="title">加载尺寸</text>
      <view class="loading-group">
        <wd-loading size="24" />
        <wd-loading size="32" />
        <wd-loading size="48" />
      </view>
    </view>

    <!-- 自定义尺寸 -->
    <view class="section">
      <text class="title">自定义尺寸</text>
      <wd-button custom-style="height: 100rpx; font-size: 36rpx; padding: 0 48rpx;">
        自定义按钮
      </wd-button>
    </view>
  </view>
</template>

```

### Navbar 响应式适配

```vue
<template>
  <view class="navbar-responsive">
    <!-- 自适应状态栏的导航栏 -->
    <wd-navbar
      title="响应式导航栏"
      :safe-area-inset-top="true"
      :fixed="true"
      :placeholder="true"
      :border="false"
      custom-style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
      title-color="#ffffff"
      left-arrow-color="#ffffff"
    />

    <!-- 页面内容 -->
    <view class="content">
      <view class="info-card">
        <view class="info-item">
          <text class="label">状态栏高度</text>
          <text class="value">{{ statusBarHeight }}px</text>
        </view>
        <view class="info-item">
          <text class="label">导航栏总高度</text>
          <text class="value">{{ navbarTotalHeight }}px</text>
        </view>
        <view class="info-item">
          <text class="label">屏幕宽度</text>
          <text class="value">{{ screenWidth }}px</text>
        </view>
        <view class="info-item">
          <text class="label">屏幕高度</text>
          <text class="value">{{ screenHeight }}px</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { rpxToPx } from '@/wd/components/common/util'

const statusBarHeight = ref(0)
const screenWidth = ref(0)
const screenHeight = ref(0)

// 导航栏内容高度（88rpx 转 px）
const navbarContentHeight = computed(() => rpxToPx(88))

// 导航栏总高度 = 状态栏 + 内容区
const navbarTotalHeight = computed(() => {
  return statusBarHeight.value + navbarContentHeight.value
})

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 0
  screenWidth.value = info.screenWidth
  screenHeight.value = info.screenHeight
})
</script>

```

## 图片响应式处理

### 图片自适应

```vue
<template>
  <view class="image-responsive">
    <!-- 宽度自适应，高度按比例 -->
    <view class="image-container ratio-16-9">
      <image
        class="responsive-image"
        src="/static/images/banner.jpg"
        mode="aspectFill"
      />
    </view>

    <!-- 正方形图片 -->
    <view class="image-container ratio-1-1">
      <image
        class="responsive-image"
        src="/static/images/avatar.jpg"
        mode="aspectFill"
      />
    </view>

    <!-- 宽度固定，高度自适应 -->
    <view class="image-auto-height">
      <image
        class="auto-image"
        src="/static/images/content.jpg"
        mode="widthFix"
      />
    </view>

    <!-- 使用 wd-image 组件 -->
    <wd-image
      src="/static/images/product.jpg"
      width="100%"
      height="400rpx"
      fit="cover"
      round
      radius="16rpx"
    />
  </view>
</template>

```

### 图片列表响应式

```vue
<template>
  <view class="image-list">
    <!-- 九宫格图片 -->
    <view class="grid-images" :class="gridClass">
      <view
        v-for="(img, index) in images"
        :key="index"
        class="image-item"
        @click="previewImage(index)"
      >
        <image :src="img" mode="aspectFill" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  images: string[]
}

const props = defineProps<Props>()

// 根据图片数量决定布局
const gridClass = computed(() => {
  const count = props.images.length
  if (count === 1) return 'grid-1'
  if (count === 2) return 'grid-2'
  if (count === 4) return 'grid-4'
  return 'grid-9'
})

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: props.images,
    current: index,
  })
}
</script>

```

## CSS 变量响应式配置

### 全局响应式变量

```scss
// src/wd/components/common/abstracts/variable.scss

/* 响应式尺寸变量 */
$-navbar-height: var(--wot-navbar-height, 88rpx) !default;        // 导航栏高度
$-tabbar-height: var(--wot-tabbar-height, 100rpx) !default;       // 标签栏高度
$-size-side-padding: var(--wot-size-side-padding, 30rpx) !default; // 页面边距

/* 组件尺寸变量 */
$-button-small-height: var(--wot-button-small-height, 48rpx) !default;
$-button-medium-height: var(--wot-button-medium-height, 72rpx) !default;
$-button-large-height: var(--wot-button-large-height, 88rpx) !default;

$-input-height: var(--wot-input-height, 96rpx) !default;
$-cell-padding: var(--wot-cell-padding, 30rpx) !default;

/* 图标尺寸变量 */
$-icon-size-small: var(--wot-icon-size-small, 32rpx) !default;
$-icon-size-medium: var(--wot-icon-size-medium, 40rpx) !default;
$-icon-size-large: var(--wot-icon-size-large, 48rpx) !default;

/* 圆角变量 */
$-radius-small: var(--wot-radius-small, 4rpx) !default;
$-radius: var(--wot-radius, 8rpx) !default;
$-radius-large: var(--wot-radius-large, 16rpx) !default;
$-radius-round: var(--wot-radius-round, 999rpx) !default;
```

### 自定义响应式配置

```scss
// src/static/style/index.scss

:root,
page {
  // 自定义响应式变量

  // 页面布局
  --page-padding: 32rpx;
  --section-gap: 48rpx;

  // 卡片样式
  --card-padding: 32rpx;
  --card-radius: 16rpx;
  --card-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  // 列表样式
  --list-item-height: 100rpx;
  --list-item-padding: 32rpx;

  // 表单样式
  --form-item-height: 96rpx;
  --form-label-width: 180rpx;

  // 按钮样式
  --btn-height: 88rpx;
  --btn-radius: 44rpx;
  --btn-font-size: 32rpx;
}

// 使用自定义变量
.page-container {
  padding: var(--page-padding);
}

.card {
  padding: var(--card-padding);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  background-color: #ffffff;
}

.section {
  margin-bottom: var(--section-gap);
}

.list-item {
  height: var(--list-item-height);
  padding: 0 var(--list-item-padding);
  display: flex;
  align-items: center;
}

.form-item {
  height: var(--form-item-height);
  display: flex;
  align-items: center;

  .label {
    width: var(--form-label-width);
    flex-shrink: 0;
  }
}

.btn-primary {
  height: var(--btn-height);
  border-radius: var(--btn-radius);
  font-size: var(--btn-font-size);
}
```

## 最佳实践

### 1. 统一使用 rpx 单位

```scss
// ✅ 推荐：使用 rpx 单位
.card {
  padding: 32rpx;
  margin: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
}

// ❌ 避免：混用单位
.card {
  padding: 16px;      // px 不会自动适配
  margin: 24rpx;
  border-radius: 8px;
  font-size: 14px;
}
```

### 2. 安全区域兼容写法

```scss
// ✅ 推荐：兼容不同 iOS 版本
.fixed-bottom {
  padding-bottom: constant(safe-area-inset-bottom);  // iOS 11.0-11.2
  padding-bottom: env(safe-area-inset-bottom);       // iOS 11.2+
}

// ✅ 推荐：与其他值结合
.fixed-bottom {
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
```

### 3. 动态计算尺寸使用工具函数

```typescript
// ✅ 推荐：使用工具函数转换
import { rpxToPx, addUnit } from '@/wd/components/common/util'

// Canvas 绑定需要 px
const canvasWidth = rpxToPx(600)
const canvasHeight = rpxToPx(400)

// 动态样式添加单位
const style = {
  width: addUnit(200),        // '200rpx'
  height: addUnit(100, 'px'), // '100px'
}

// ❌ 避免：硬编码计算
const width = 200 * (375 / 750) // 不同设备不准确
```

### 4. 使用 CSS 变量实现主题响应

```scss
// ✅ 推荐：使用 CSS 变量
.button {
  height: var(--wot-button-medium-height);
  padding: 0 var(--wot-size-side-padding);
  font-size: var(--wot-fs-content);
}

// ❌ 避免：硬编码值
.button {
  height: 72rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}
```

### 5. 合理使用条件编译

```vue
<template>
  <view class="adaptive-container">
    <!-- 通用内容 -->
    <view class="common-content">
      所有平台显示
    </view>

    <!-- H5 专属功能 -->
    <!-- #ifdef H5 -->
    <view class="h5-feature">
      H5 专属功能
    </view>
    <!-- #endif -->

    <!-- 小程序专属功能 -->
    <!-- #ifdef MP -->
    <button open-type="share">分享</button>
    <!-- #endif -->
  </view>
</template>

```

## 常见问题

### 1. rpx 在部分 Android 设备显示异常

**问题原因:**
- 部分 Android 设备的 WebView 对 rpx 支持不完善
- 系统字体缩放可能影响显示

**解决方案:**

```typescript
// 检测设备是否支持正常渲染
const checkRpxSupport = () => {
  const info = uni.getSystemInfoSync()
  const ratio = info.screenWidth / 750

  // 检查是否在合理范围内
  if (ratio < 0.3 || ratio > 2) {
    console.warn('设备可能存在 rpx 渲染问题')
    return false
  }
  return true
}

// 对于有问题的设备使用 px 替代
const getAdaptiveUnit = (value: number) => {
  if (!checkRpxSupport()) {
    return `${value / 2}px` // 转换为 px
  }
  return `${value}rpx`
}
```

### 2. 安全区域在部分设备无效

**问题原因:**
- 旧设备不支持 `env()` 和 `constant()`
- 部分 WebView 未正确实现安全区域

**解决方案:**

```scss
// 使用 CSS 变量提供 fallback
:root {
  --safe-area-bottom: 0px;
  --safe-area-bottom: constant(safe-area-inset-bottom);
  --safe-area-bottom: env(safe-area-inset-bottom);
}

.fixed-bottom {
  // 使用变量，自动降级
  padding-bottom: var(--safe-area-bottom);
}
```

```typescript
// JavaScript 获取安全区域
const getSafeAreaInsets = () => {
  const info = uni.getSystemInfoSync()

  // 优先使用 safeAreaInsets
  if (info.safeAreaInsets) {
    return info.safeAreaInsets
  }

  // 降级：根据设备型号判断
  if (info.model && /iPhone X|iPhone 11|iPhone 12|iPhone 13|iPhone 14/.test(info.model)) {
    return {
      top: 44,
      bottom: 34,
      left: 0,
      right: 0,
    }
  }

  // 默认值
  return {
    top: info.statusBarHeight || 20,
    bottom: 0,
    left: 0,
    right: 0,
  }
}
```

### 3. 图片在不同设备显示模糊

**问题原因:**
- 图片分辨率不足
- 未考虑设备像素比

**解决方案:**

```vue
<template>
  <view class="image-sharp">
    <!-- 使用 2x/3x 图片 -->
    <image :src="getImageUrl(imagePath)" mode="aspectFill" />
  </view>
</template>

<script lang="ts" setup>
const getImageUrl = (basePath: string) => {
  const info = uni.getSystemInfoSync()
  const pixelRatio = info.pixelRatio || 2

  // 根据设备像素比选择图片
  if (pixelRatio >= 3) {
    return basePath.replace('.', '@3x.')
  } else if (pixelRatio >= 2) {
    return basePath.replace('.', '@2x.')
  }
  return basePath
}
</script>
```

### 4. 弹窗/遮罩层在全面屏设备显示不全

**问题原因:**
- 未考虑安全区域
- 固定定位元素未覆盖全屏

**解决方案:**

```scss
// 全屏遮罩层
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

// 弹窗内容
.modal-content {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  max-width: calc(100vw - 64rpx);
  max-height: calc(100vh - constant(safe-area-inset-top) - constant(safe-area-inset-bottom) - 64rpx);
  max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 64rpx);
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  z-index: 1001;
}
```

### 5. 横屏模式适配问题

**问题原因:**
- rpx 基于宽度计算，横屏时宽度变化大
- 未锁定屏幕方向

**解决方案:**

```json
// pages.json 锁定竖屏
{
  "globalStyle": {
    "pageOrientation": "portrait"
  }
}
```

```typescript
// 或在特定页面处理横屏
const handleOrientationChange = () => {
  const info = uni.getSystemInfoSync()

  if (info.windowWidth > info.windowHeight) {
    // 横屏状态
    // 可以提示用户切换为竖屏
    uni.showToast({
      title: '请将设备切换为竖屏使用',
      icon: 'none',
    })
  }
}

// 监听屏幕旋转
uni.onWindowResize(handleOrientationChange)
```

## API 参考

### 工具函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `rpxToPx` | rpx 转 px | `rpx: number` | `number` |
| `pxToRpx` | px 转 rpx | `px: number` | `number` |
| `addUnit` | 添加单位 | `num: number \| string, unit?: string` | `string` |

### CSS 环境变量

| 变量 | 说明 |
|------|------|
| `env(safe-area-inset-top)` | 顶部安全距离 |
| `env(safe-area-inset-right)` | 右侧安全距离 |
| `env(safe-area-inset-bottom)` | 底部安全距离 |
| `env(safe-area-inset-left)` | 左侧安全距离 |

### UnoCSS 安全区域规则

| 类名 | 说明 |
|------|------|
| `p-safe` | 四边安全区域内边距 |
| `pt-safe` | 顶部安全区域内边距 |
| `pb-safe` | 底部安全区域内边距 |
| `pl-safe` | 左侧安全区域内边距 |
| `pr-safe` | 右侧安全区域内边距 |

### 系统信息 API

```typescript
interface SystemInfo {
  screenWidth: number      // 屏幕宽度
  screenHeight: number     // 屏幕高度
  windowWidth: number      // 窗口宽度
  windowHeight: number     // 窗口高度
  statusBarHeight: number  // 状态栏高度
  pixelRatio: number       // 设备像素比
  platform: string         // 客户端平台
  safeArea: {              // 安全区域
    top: number
    left: number
    right: number
    bottom: number
    width: number
    height: number
  }
  safeAreaInsets: {        // 安全区域边距
    top: number
    right: number
    bottom: number
    left: number
  }
}
```

本文档详细介绍了 RuoYi-Plus-UniApp 移动端项目的响应式设计体系。通过合理使用 rpx 单位、安全区域适配、多平台条件编译等技术，可以确保应用在各种设备上都能提供良好的用户体验。建议开发者在实际项目中结合具体需求灵活运用这些方案。
