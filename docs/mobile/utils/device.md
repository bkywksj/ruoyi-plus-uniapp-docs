# 设备信息工具

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的设备信息获取和平台检测解决方案,基于 UniApp 的系统 API 进行深度封装,实现了跨平台的设备信息获取、平台判断、环境检测等功能。

### 核心特性

- **系统信息获取** - 基于 `uni.getSystemInfoSync()` 获取完整的设备和系统信息
- **平台检测** - 提供 `isApp`、`isMp`、`isMpWeixin` 等平台判断常量
- **环境检测** - 检测微信环境、支付宝环境、开发者工具等运行环境
- **屏幕适配** - 提供 `rpxToPx`、`pxToRpx` 等单位转换工具
- **安全区域** - 获取状态栏高度、安全区域等适配信息
- **新旧 API 兼容** - 自动兼容微信小程序新旧 API
- **TypeScript 支持** - 完整的类型定义,提供开发时类型检查

### 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0+ | 跨平台框架 |
| Vue 3 | 3.4.21 | 组合式 API |
| TypeScript | 5.7.2 | 类型支持 |

## 系统信息获取

### uni.getSystemInfoSync()

这是 UniApp 提供的核心 API,用于同步获取系统信息:

```typescript
// 获取系统信息
const systemInfo = uni.getSystemInfoSync()

console.log('设备品牌:', systemInfo.brand)
console.log('设备型号:', systemInfo.model)
console.log('操作系统:', systemInfo.system)
console.log('平台:', systemInfo.platform)
console.log('屏幕宽度:', systemInfo.screenWidth)
console.log('屏幕高度:', systemInfo.screenHeight)
console.log('窗口宽度:', systemInfo.windowWidth)
console.log('窗口高度:', systemInfo.windowHeight)
console.log('状态栏高度:', systemInfo.statusBarHeight)
console.log('设备像素比:', systemInfo.pixelRatio)
console.log('系统语言:', systemInfo.language)
```

### 返回值说明

| 属性 | 类型 | 说明 |
|------|------|------|
| brand | string | 设备品牌,如 "Apple"、"Huawei" |
| model | string | 设备型号,如 "iPhone 14 Pro" |
| system | string | 操作系统及版本,如 "iOS 17.0" |
| platform | string | 客户端平台,如 "ios"、"android"、"devtools" |
| screenWidth | number | 屏幕宽度(px) |
| screenHeight | number | 屏幕高度(px) |
| windowWidth | number | 可使用窗口宽度(px) |
| windowHeight | number | 可使用窗口高度(px) |
| windowTop | number | 可使用窗口顶部位置(px) |
| windowBottom | number | 可使用窗口底部位置(px) |
| statusBarHeight | number | 状态栏高度(px) |
| pixelRatio | number | 设备像素比 |
| language | string | 系统语言,如 "zh_CN" |
| version | string | 引擎版本号 |
| SDKVersion | string | 客户端基础库版本 |
| safeArea | object | 安全区域信息 |
| safeAreaInsets | object | 安全区域边距 |

### 安全区域信息

```typescript
interface SafeArea {
  left: number      // 安全区域左上角横坐标
  right: number     // 安全区域右下角横坐标
  top: number       // 安全区域左上角纵坐标
  bottom: number    // 安全区域右下角纵坐标
  width: number     // 安全区域宽度
  height: number    // 安全区域高度
}

interface SafeAreaInsets {
  left: number      // 左边安全边距
  right: number     // 右边安全边距
  top: number       // 上边安全边距
  bottom: number    // 下边安全边距
}

// 使用示例
const { safeArea, safeAreaInsets } = uni.getSystemInfoSync()

// 适配刘海屏
const contentStyle = {
  paddingTop: `${safeAreaInsets.top}px`,
  paddingBottom: `${safeAreaInsets.bottom}px`,
}
```

## 平台检测工具

### 平台常量

项目在 `utils/platform.ts` 中提供了平台判断常量:

```typescript
// utils/platform.ts

/**
 * 当前运行平台
 */
export const platform = uni.getSystemInfoSync().platform

/**
 * 是否为 App 环境
 */
// #ifdef APP-PLUS
export const isApp = true
// #endif
// #ifndef APP-PLUS
export const isApp = false
// #endif

/**
 * 是否为小程序环境
 */
// #ifdef MP
export const isMp = true
// #endif
// #ifndef MP
export const isMp = false
// #endif

/**
 * 是否为微信小程序
 */
// #ifdef MP-WEIXIN
export const isMpWeixin = true
// #endif
// #ifndef MP-WEIXIN
export const isMpWeixin = false
// #endif

/**
 * 是否为支付宝小程序
 */
// #ifdef MP-ALIPAY
export const isMpAlipay = true
// #endif
// #ifndef MP-ALIPAY
export const isMpAlipay = false
// #endif

/**
 * 是否为头条小程序
 */
// #ifdef MP-TOUTIAO
export const isMpToutiao = true
// #endif
// #ifndef MP-TOUTIAO
export const isMpToutiao = false
// #endif

/**
 * 是否为 H5 环境
 */
// #ifdef H5
export const isH5 = true
// #endif
// #ifndef H5
export const isH5 = false
// #endif
```

### 使用示例

```vue
<template>
  <view class="platform-demo">
    <view class="info-item">
      <text class="label">当前平台:</text>
      <text class="value">{{ platformName }}</text>
    </view>
    <view class="info-item">
      <text class="label">运行环境:</text>
      <text class="value">{{ envName }}</text>
    </view>

    <!-- 平台特定内容 -->
    <view v-if="isApp" class="app-only">
      <text>App 专属功能</text>
    </view>

    <view v-if="isMpWeixin" class="weixin-only">
      <text>微信小程序专属功能</text>
    </view>

    <view v-if="isH5" class="h5-only">
      <text>H5 专属功能</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { platform, isApp, isMp, isMpWeixin, isH5 } from '@/utils/platform'

const platformName = computed(() => {
  if (isApp) return 'App'
  if (isMpWeixin) return '微信小程序'
  if (isMp) return '小程序'
  if (isH5) return 'H5'
  return platform
})

const envName = computed(() => {
  const info = uni.getSystemInfoSync()
  return `${info.system} - ${info.model}`
})
</script>

<style lang="scss" scoped>
.platform-demo {
  padding: 32rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}
</style>
```

## 环境检测函数

### 安全获取 User Agent

```typescript
/**
 * 安全获取 User Agent
 * 兼容所有平台,避免在小程序等环境下报错
 */
export function safeGetUserAgent(): string {
  try {
    // #ifdef H5
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent.toLowerCase()
    }
    // #endif
    return ''
  } catch (error) {
    console.warn('[platform] 获取 UserAgent 失败:', error)
    return ''
  }
}

// 使用示例
const userAgent = safeGetUserAgent()
const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad')
const isAndroid = userAgent.includes('android')
```

### 安全获取 Location

```typescript
/**
 * 安全获取 window.location
 * 兼容所有平台
 */
export function safeGetLocation(): Location | null {
  try {
    // #ifdef H5
    if (typeof window !== 'undefined' && window.location) {
      return window.location
    }
    // #endif
    return null
  } catch (error) {
    console.warn('[platform] 获取 location 失败:', error)
    return null
  }
}

// 使用示例
const location = safeGetLocation()
if (location) {
  console.log('当前URL:', location.href)
  console.log('域名:', location.hostname)
  console.log('路径:', location.pathname)
  console.log('参数:', location.search)
}
```

### 检测微信环境

```typescript
/**
 * 检测是否在微信环境中
 * 包括微信内置浏览器和微信小程序
 */
export function isWechatEnvironment(): boolean {
  // 微信小程序环境
  // #ifdef MP-WEIXIN
  return true
  // #endif

  // H5 环境检测微信浏览器
  // #ifdef H5
  const ua = safeGetUserAgent()
  return ua.includes('micromessenger')
  // #endif

  return false
}

// 使用示例
if (isWechatEnvironment()) {
  // 微信环境特殊处理
  console.log('当前在微信环境中')
}
```

### 检测支付宝环境

```typescript
/**
 * 检测是否在支付宝环境中
 * 包括支付宝内置浏览器和支付宝小程序
 */
export function isAlipayEnvironment(): boolean {
  // 支付宝小程序环境
  // #ifdef MP-ALIPAY
  return true
  // #endif

  // H5 环境检测支付宝浏览器
  // #ifdef H5
  const ua = safeGetUserAgent()
  return ua.includes('alipay') || ua.includes('alipayclient')
  // #endif

  return false
}

// 使用示例
if (isAlipayEnvironment()) {
  // 支付宝环境特殊处理
  console.log('当前在支付宝环境中')
}
```

### 检测开发者工具

```typescript
/**
 * 检测是否在开发者工具中运行
 */
export function isInDevTools(): boolean {
  try {
    const systemInfo = uni.getSystemInfoSync()

    // 微信开发者工具
    if (systemInfo.platform === 'devtools') {
      return true
    }

    // 支付宝开发者工具
    // #ifdef MP-ALIPAY
    if (my.canIUse('getSystemInfoSync.return.platform')) {
      return systemInfo.platform === 'devtools'
    }
    // #endif

    // H5 开发环境
    // #ifdef H5
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    // #endif

    return false
  } catch (error) {
    console.warn('[platform] 检测开发工具失败:', error)
    return false
  }
}

// 使用示例
if (isInDevTools()) {
  console.log('当前在开发者工具中运行')
  // 开发环境下的特殊处理
}
```

### 检测微信 JS Bridge

```typescript
/**
 * 检测是否存在微信 JS Bridge
 * 用于判断微信 JSSDK 是否可用
 */
export function hasWeixinJSBridge(): boolean {
  // #ifdef H5
  try {
    return typeof WeixinJSBridge !== 'undefined'
  } catch (error) {
    return false
  }
  // #endif

  return false
}

// 使用示例
if (hasWeixinJSBridge()) {
  // 可以使用微信 JSSDK
  WeixinJSBridge.invoke('getBrandWCPayRequest', payParams, (res) => {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      console.log('支付成功')
    }
  })
}
```

### 安全获取 URL 参数

```typescript
/**
 * 安全获取当前页面 URL 参数
 */
export function safeGetUrlParams(): Record<string, string> {
  const params: Record<string, string> = {}

  try {
    // #ifdef H5
    const location = safeGetLocation()
    if (location && location.search) {
      const searchParams = new URLSearchParams(location.search)
      searchParams.forEach((value, key) => {
        params[key] = value
      })
    }
    // #endif

    // 小程序环境获取页面参数
    // #ifdef MP
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      Object.assign(params, currentPage.options || {})
    }
    // #endif
  } catch (error) {
    console.warn('[platform] 获取URL参数失败:', error)
  }

  return params
}

// 使用示例
const urlParams = safeGetUrlParams()
console.log('页面参数:', urlParams)
// { id: '123', type: 'detail' }
```

### 检查支付授权目录

```typescript
/**
 * 检查当前页面是否在微信支付授权目录内
 */
export function checkPaymentUrl(): boolean {
  // #ifdef H5
  try {
    const location = safeGetLocation()
    if (!location) return false

    // 获取配置的支付授权目录
    const authorizedDomains = [
      'https://your-domain.com/pay/',
      'https://your-domain.com/order/',
    ]

    const currentUrl = location.href
    return authorizedDomains.some(domain => currentUrl.startsWith(domain))
  } catch (error) {
    console.warn('[platform] 检查支付授权目录失败:', error)
    return false
  }
  // #endif

  // 小程序环境默认支持支付
  return true
}

// 使用示例
if (!checkPaymentUrl()) {
  console.warn('当前页面不在支付授权目录内')
}
```

## 单位转换工具

### rpx 与 px 互转

```typescript
/**
 * rpx 转 px
 * @param rpx - rpx 值
 * @returns px 值
 */
export function rpxToPx(rpx: number): number {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth || 375
  return (rpx / 750) * screenWidth
}

/**
 * px 转 rpx
 * @param px - px 值
 * @returns rpx 值
 */
export function pxToRpx(px: number): number {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth || 375
  return (px / screenWidth) * 750
}

// 使用示例
const pxValue = rpxToPx(100)  // 100rpx 转为 px
const rpxValue = pxToRpx(50)  // 50px 转为 rpx

console.log(`100rpx = ${pxValue}px`)
console.log(`50px = ${rpxValue}rpx`)
```

### 使用场景

```vue
<template>
  <view class="canvas-demo">
    <canvas
      canvas-id="myCanvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { rpxToPx } from '@/utils/device'

// Canvas 需要使用 px 单位
const canvasWidth = ref(rpxToPx(600))   // 600rpx 转 px
const canvasHeight = ref(rpxToPx(400))  // 400rpx 转 px

onMounted(() => {
  const ctx = uni.createCanvasContext('myCanvas')

  // 绑制内容时也需要转换单位
  ctx.setFillStyle('#409EFF')
  ctx.fillRect(0, 0, rpxToPx(200), rpxToPx(100))

  ctx.draw()
})
</script>
```

### 高清屏适配

```typescript
/**
 * 获取 Canvas 绑制所需的实际尺寸
 * 考虑设备像素比,用于高清屏适配
 */
export function getCanvasSize(rpxWidth: number, rpxHeight: number) {
  const systemInfo = uni.getSystemInfoSync()
  const pixelRatio = systemInfo.pixelRatio || 1

  const width = rpxToPx(rpxWidth)
  const height = rpxToPx(rpxHeight)

  return {
    // CSS 尺寸
    cssWidth: width,
    cssHeight: height,
    // Canvas 实际尺寸(乘以像素比)
    canvasWidth: width * pixelRatio,
    canvasHeight: height * pixelRatio,
    // 像素比
    pixelRatio,
  }
}

// 使用示例
const { cssWidth, cssHeight, canvasWidth, canvasHeight, pixelRatio } = getCanvasSize(600, 400)

// Canvas 样式使用 CSS 尺寸
// <canvas :style="{ width: cssWidth + 'px', height: cssHeight + 'px' }">

// Canvas 绑制时使用实际尺寸
const ctx = uni.createCanvasContext('canvas')
ctx.scale(pixelRatio, pixelRatio)  // 缩放以适配高清屏
```

## 组件中的设备信息应用

### 导航栏状态栏适配

```vue
<template>
  <view class="navbar" :style="navbarStyle">
    <view class="navbar-content">
      <slot />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const navbarStyle = computed(() => {
  const { statusBarHeight } = uni.getSystemInfoSync()
  return {
    paddingTop: `${statusBarHeight}px`,
  }
})
</script>

<style lang="scss" scoped>
.navbar {
  background-color: #fff;
}

.navbar-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
}
</style>
```

### 下拉菜单窗口高度

```vue
<template>
  <view class="dropdown-menu">
    <view
      v-if="showOverlay"
      class="dropdown-overlay"
      :style="{ height: windowHeight + 'px' }"
      @click="closeMenu"
    />
    <view class="dropdown-content">
      <slot />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const showOverlay = ref(false)
const windowHeight = ref(0)

onMounted(() => {
  // 获取窗口高度用于遮罩层
  windowHeight.value = uni.getSystemInfoSync().windowHeight
})

const closeMenu = () => {
  showOverlay.value = false
}
</script>
```

### 图片裁剪器定位

```vue
<template>
  <view class="img-cropper">
    <view
      class="cropper-image"
      :style="{
        left: imgLeft + 'rpx',
        top: imgTop + 'rpx',
      }"
    >
      <image :src="imgSrc" mode="aspectFit" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { pxToRpx } from '@/utils/device'

const props = defineProps<{
  imgSrc: string
}>()

const imgLeft = ref(0)
const imgTop = ref(0)

const TOP_PERCENT = 0.45  // 图片居中偏上

onMounted(() => {
  const { windowWidth, windowHeight } = uni.getSystemInfoSync()

  // 将 px 转为 rpx 用于定位
  imgLeft.value = pxToRpx(windowWidth / 2)
  imgTop.value = pxToRpx((windowHeight / 2) * TOP_PERCENT)
})
</script>
```

### 水印组件高清适配

```vue
<template>
  <view class="watermark-container">
    <canvas
      canvas-id="watermarkCanvas"
      :style="{
        width: canvasWidth / pixelRatio + 'px',
        height: canvasHeight / pixelRatio + 'px',
      }"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { rpxToPx } from '@/utils/device'

const props = withDefaults(defineProps<{
  width?: number
  height?: number
  gutterX?: number
  gutterY?: number
  content?: string
}>(), {
  width: 200,
  height: 200,
  gutterX: 0,
  gutterY: 0,
  content: '水印',
})

const pixelRatio = ref(1)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

onMounted(() => {
  // 获取设备像素比
  pixelRatio.value = uni.getSystemInfoSync().pixelRatio

  // 计算 Canvas 实际尺寸(考虑像素比)
  canvasWidth.value = rpxToPx(props.width + props.gutterX) * pixelRatio.value
  canvasHeight.value = rpxToPx(props.height + props.gutterY) * pixelRatio.value

  drawWatermark()
})

const drawWatermark = () => {
  const ctx = uni.createCanvasContext('watermarkCanvas')

  // 缩放以适配高清屏
  ctx.scale(pixelRatio.value, pixelRatio.value)

  // 绑制水印文字
  ctx.setFontSize(14)
  ctx.setFillStyle('rgba(0, 0, 0, 0.1)')
  ctx.rotate(-20 * Math.PI / 180)
  ctx.fillText(props.content, 10, 50)

  ctx.draw()
}
</script>
```

### 浮动按钮边界计算

```vue
<template>
  <view
    class="fab"
    :style="{
      right: fabRight + 'px',
      bottom: fabBottom + 'px',
    }"
    @click="handleClick"
  >
    <slot>
      <text class="fab-icon">+</text>
    </slot>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { isH5 } from '@/utils/platform'

const props = withDefaults(defineProps<{
  right?: number
  bottom?: number
}>(), {
  right: 20,
  bottom: 100,
})

const emit = defineEmits<{
  click: []
}>()

const fabRight = ref(props.right)
const fabBottom = ref(props.bottom)

const screen = {
  width: 0,
  height: 0,
}

onMounted(() => {
  getBounding()
})

const getBounding = () => {
  const sysInfo = uni.getSystemInfoSync()

  const statusBarHeight = sysInfo.statusBarHeight || 0
  const navBarHeight = 44

  screen.width = sysInfo.windowWidth
  // H5 需要加上 windowTop
  screen.height = isH5
    ? sysInfo.windowTop + sysInfo.windowHeight
    : sysInfo.windowHeight

  // 确保不超出边界
  fabRight.value = Math.min(props.right, screen.width - 60)
  fabBottom.value = Math.min(props.bottom, screen.height - 60)
}

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.fab {
  position: fixed;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.fab-icon {
  color: #fff;
  font-size: 48rpx;
}
</style>
```

## 新旧 API 兼容

### 微信小程序 API 兼容

微信小程序在基础库 2.20.1 版本后拆分了 `getSystemInfo` API:

```typescript
/**
 * 兼容获取窗口信息
 * 优先使用新 API,降级使用旧 API
 */
export function getWindowInfo() {
  // #ifdef MP-WEIXIN
  if (uni.canIUse('getWindowInfo')) {
    return uni.getWindowInfo()
  }
  // #endif

  const systemInfo = uni.getSystemInfoSync()
  return {
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    windowTop: systemInfo.windowTop || 0,
    windowBottom: systemInfo.windowBottom || 0,
    statusBarHeight: systemInfo.statusBarHeight,
    safeArea: systemInfo.safeArea,
  }
}

/**
 * 兼容获取设备信息
 */
export function getDeviceInfo() {
  // #ifdef MP-WEIXIN
  if (uni.canIUse('getDeviceInfo')) {
    return uni.getDeviceInfo()
  }
  // #endif

  const systemInfo = uni.getSystemInfoSync()
  return {
    brand: systemInfo.brand,
    model: systemInfo.model,
    system: systemInfo.system,
    platform: systemInfo.platform,
    devicePixelRatio: systemInfo.pixelRatio,
  }
}

/**
 * 兼容获取 App 基础信息
 */
export function getAppBaseInfo() {
  // #ifdef MP-WEIXIN
  if (uni.canIUse('getAppBaseInfo')) {
    return uni.getAppBaseInfo()
  }
  // #endif

  const systemInfo = uni.getSystemInfoSync()
  return {
    SDKVersion: systemInfo.SDKVersion,
    enableDebug: systemInfo.enableDebug,
    language: systemInfo.language,
    version: systemInfo.version,
    theme: systemInfo.theme,
  }
}

// 使用示例
const windowInfo = getWindowInfo()
const deviceInfo = getDeviceInfo()
const appInfo = getAppBaseInfo()

console.log('窗口宽度:', windowInfo.windowWidth)
console.log('设备系统:', deviceInfo.system)
console.log('SDK版本:', appInfo.SDKVersion)
```

### 完整的系统信息封装

```typescript
// utils/device.ts

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  // 设备信息
  brand: string
  model: string
  system: string
  platform: string

  // 屏幕信息
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  windowTop: number
  windowBottom: number
  statusBarHeight: number
  pixelRatio: number

  // 安全区域
  safeArea: {
    left: number
    right: number
    top: number
    bottom: number
    width: number
    height: number
  }
  safeAreaInsets: {
    left: number
    right: number
    top: number
    bottom: number
  }

  // 系统信息
  language: string
  version: string
  SDKVersion: string
  theme: 'light' | 'dark'

  // 环境信息
  isApp: boolean
  isMp: boolean
  isMpWeixin: boolean
  isH5: boolean
  isDevTools: boolean
}

/**
 * 获取完整的设备信息
 */
export function getFullDeviceInfo(): DeviceInfo {
  const systemInfo = uni.getSystemInfoSync()

  // 获取安全区域边距
  const safeAreaInsets = {
    left: systemInfo.safeArea?.left || 0,
    right: systemInfo.screenWidth - (systemInfo.safeArea?.right || systemInfo.screenWidth),
    top: systemInfo.safeArea?.top || 0,
    bottom: systemInfo.screenHeight - (systemInfo.safeArea?.bottom || systemInfo.screenHeight),
  }

  return {
    // 设备信息
    brand: systemInfo.brand || '',
    model: systemInfo.model || '',
    system: systemInfo.system || '',
    platform: systemInfo.platform || '',

    // 屏幕信息
    screenWidth: systemInfo.screenWidth,
    screenHeight: systemInfo.screenHeight,
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    windowTop: systemInfo.windowTop || 0,
    windowBottom: systemInfo.windowBottom || 0,
    statusBarHeight: systemInfo.statusBarHeight || 0,
    pixelRatio: systemInfo.pixelRatio || 1,

    // 安全区域
    safeArea: systemInfo.safeArea || {
      left: 0,
      right: systemInfo.screenWidth,
      top: 0,
      bottom: systemInfo.screenHeight,
      width: systemInfo.screenWidth,
      height: systemInfo.screenHeight,
    },
    safeAreaInsets,

    // 系统信息
    language: systemInfo.language || 'zh_CN',
    version: systemInfo.version || '',
    SDKVersion: systemInfo.SDKVersion || '',
    theme: (systemInfo.theme as 'light' | 'dark') || 'light',

    // 环境信息
    isApp,
    isMp,
    isMpWeixin,
    isH5,
    isDevTools: isInDevTools(),
  }
}
```

## useDevice Composable

### 封装响应式设备信息

```typescript
// composables/useDevice.ts
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import type { DeviceInfo } from '@/utils/device'
import { getFullDeviceInfo, rpxToPx, pxToRpx } from '@/utils/device'

export function useDevice() {
  const deviceInfo = reactive<DeviceInfo>(getFullDeviceInfo())
  const isReady = ref(false)

  // 更新设备信息
  const updateDeviceInfo = () => {
    Object.assign(deviceInfo, getFullDeviceInfo())
  }

  // 监听屏幕旋转(仅 App 和 H5)
  let resizeHandler: (() => void) | null = null

  onMounted(() => {
    isReady.value = true

    // #ifdef H5
    resizeHandler = () => {
      updateDeviceInfo()
    }
    window.addEventListener('resize', resizeHandler)
    // #endif
  })

  onUnmounted(() => {
    // #ifdef H5
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
    // #endif
  })

  return {
    // 设备信息(响应式)
    deviceInfo,
    isReady,

    // 方法
    updateDeviceInfo,
    rpxToPx,
    pxToRpx,

    // 便捷属性
    get screenWidth() {
      return deviceInfo.screenWidth
    },
    get screenHeight() {
      return deviceInfo.screenHeight
    },
    get windowWidth() {
      return deviceInfo.windowWidth
    },
    get windowHeight() {
      return deviceInfo.windowHeight
    },
    get statusBarHeight() {
      return deviceInfo.statusBarHeight
    },
    get pixelRatio() {
      return deviceInfo.pixelRatio
    },
    get safeAreaInsets() {
      return deviceInfo.safeAreaInsets
    },
    get isIOS() {
      return deviceInfo.platform === 'ios'
    },
    get isAndroid() {
      return deviceInfo.platform === 'android'
    },
    get isDarkMode() {
      return deviceInfo.theme === 'dark'
    },
  }
}
```

### 使用示例

```vue
<template>
  <view class="device-demo">
    <view class="info-card">
      <view class="card-title">设备信息</view>
      <view class="info-list">
        <view class="info-row">
          <text class="label">品牌型号:</text>
          <text class="value">{{ deviceInfo.brand }} {{ deviceInfo.model }}</text>
        </view>
        <view class="info-row">
          <text class="label">操作系统:</text>
          <text class="value">{{ deviceInfo.system }}</text>
        </view>
        <view class="info-row">
          <text class="label">屏幕尺寸:</text>
          <text class="value">{{ screenWidth }} x {{ screenHeight }}</text>
        </view>
        <view class="info-row">
          <text class="label">窗口尺寸:</text>
          <text class="value">{{ windowWidth }} x {{ windowHeight }}</text>
        </view>
        <view class="info-row">
          <text class="label">状态栏高度:</text>
          <text class="value">{{ statusBarHeight }}px</text>
        </view>
        <view class="info-row">
          <text class="label">像素比:</text>
          <text class="value">{{ pixelRatio }}</text>
        </view>
        <view class="info-row">
          <text class="label">安全区域:</text>
          <text class="value">
            上{{ safeAreaInsets.top }} 下{{ safeAreaInsets.bottom }}
          </text>
        </view>
      </view>
    </view>

    <view class="info-card">
      <view class="card-title">平台信息</view>
      <view class="info-list">
        <view class="info-row">
          <text class="label">当前平台:</text>
          <text class="value">{{ deviceInfo.platform }}</text>
        </view>
        <view class="info-row">
          <text class="label">是否 iOS:</text>
          <text class="value">{{ isIOS ? '是' : '否' }}</text>
        </view>
        <view class="info-row">
          <text class="label">是否 Android:</text>
          <text class="value">{{ isAndroid ? '是' : '否' }}</text>
        </view>
        <view class="info-row">
          <text class="label">深色模式:</text>
          <text class="value">{{ isDarkMode ? '是' : '否' }}</text>
        </view>
        <view class="info-row">
          <text class="label">开发工具:</text>
          <text class="value">{{ deviceInfo.isDevTools ? '是' : '否' }}</text>
        </view>
      </view>
    </view>

    <view class="info-card">
      <view class="card-title">单位转换测试</view>
      <view class="convert-demo">
        <text>100rpx = {{ rpxToPx(100).toFixed(2) }}px</text>
        <text>50px = {{ pxToRpx(50).toFixed(2) }}rpx</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useDevice } from '@/composables/useDevice'

const {
  deviceInfo,
  screenWidth,
  screenHeight,
  windowWidth,
  windowHeight,
  statusBarHeight,
  pixelRatio,
  safeAreaInsets,
  isIOS,
  isAndroid,
  isDarkMode,
  rpxToPx,
  pxToRpx,
} = useDevice()
</script>

<style lang="scss" scoped>
.device-demo {
  padding: 32rpx;
}

.info-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.info-list {
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .label {
    color: #666;
    font-size: 28rpx;
  }

  .value {
    color: #333;
    font-size: 28rpx;
  }
}

.convert-demo {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  text {
    font-size: 28rpx;
    color: #409EFF;
  }
}
</style>
```

## 系统语言检测

### 获取系统语言

```typescript
// locales/i18n.ts

/**
 * 语言代码枚举
 */
export enum LanguageCode {
  zh_CN = 'zh-CN',
  en_US = 'en-US',
}

/**
 * 从系统获取默认语言
 */
export function getSystemLanguage(): LanguageCode {
  try {
    const systemInfo = uni.getSystemInfoSync()
    const systemLanguage = systemInfo.language

    // 匹配系统语言
    if (systemLanguage.includes('zh') || systemLanguage.includes('cn')) {
      return LanguageCode.zh_CN
    } else if (systemLanguage.includes('en')) {
      return LanguageCode.en_US
    }
  } catch (error) {
    console.warn('[i18n] 获取系统语言失败:', error)
  }

  // 默认返回中文
  return LanguageCode.zh_CN
}

/**
 * 从缓存获取语言设置,无缓存时使用系统语言
 */
export function getLanguageFromCache(): LanguageCode {
  try {
    // 优先从缓存获取
    const cachedLanguage = uni.getStorageSync('language') as LanguageCode
    if (cachedLanguage && Object.values(LanguageCode).includes(cachedLanguage)) {
      return cachedLanguage
    }

    // 缓存无效时使用系统语言
    return getSystemLanguage()
  } catch (error) {
    console.warn('[i18n] 获取语言设置失败:', error)
    return LanguageCode.zh_CN
  }
}

// 使用示例
const currentLanguage = getLanguageFromCache()
console.log('当前语言:', currentLanguage)
```

## 主题模式检测

### 检测系统主题

```typescript
/**
 * 获取系统主题模式
 */
export function getSystemTheme(): 'light' | 'dark' {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.theme || 'light'
  } catch (error) {
    console.warn('[theme] 获取系统主题失败:', error)
    return 'light'
  }
}

/**
 * 监听系统主题变化
 */
export function onSystemThemeChange(callback: (theme: 'light' | 'dark') => void) {
  // #ifdef MP-WEIXIN
  uni.onThemeChange((res) => {
    callback(res.theme)
  })
  // #endif

  // #ifdef H5
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      callback(e.matches ? 'dark' : 'light')
    })
  }
  // #endif
}

// 使用示例
const theme = getSystemTheme()
console.log('当前主题:', theme)

onSystemThemeChange((newTheme) => {
  console.log('主题变化:', newTheme)
  // 更新应用主题
})
```

## 类型定义

### 完整类型定义

```typescript
/**
 * 平台类型
 */
export type Platform = 'ios' | 'android' | 'devtools' | 'windows' | 'mac' | string

/**
 * 主题类型
 */
export type ThemeMode = 'light' | 'dark'

/**
 * 安全区域
 */
export interface SafeArea {
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
}

/**
 * 安全区域边距
 */
export interface SafeAreaInsets {
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  /** 设备品牌 */
  brand: string
  /** 设备型号 */
  model: string
  /** 操作系统及版本 */
  system: string
  /** 客户端平台 */
  platform: Platform
  /** 屏幕宽度(px) */
  screenWidth: number
  /** 屏幕高度(px) */
  screenHeight: number
  /** 可使用窗口宽度(px) */
  windowWidth: number
  /** 可使用窗口高度(px) */
  windowHeight: number
  /** 可使用窗口顶部位置(px) */
  windowTop: number
  /** 可使用窗口底部位置(px) */
  windowBottom: number
  /** 状态栏高度(px) */
  statusBarHeight: number
  /** 设备像素比 */
  pixelRatio: number
  /** 安全区域 */
  safeArea: SafeArea
  /** 安全区域边距 */
  safeAreaInsets: SafeAreaInsets
  /** 系统语言 */
  language: string
  /** 引擎版本号 */
  version: string
  /** 客户端基础库版本 */
  SDKVersion: string
  /** 系统主题 */
  theme: ThemeMode
  /** 是否 App 环境 */
  isApp: boolean
  /** 是否小程序环境 */
  isMp: boolean
  /** 是否微信小程序 */
  isMpWeixin: boolean
  /** 是否 H5 环境 */
  isH5: boolean
  /** 是否开发者工具 */
  isDevTools: boolean
}

/**
 * useDevice 返回类型
 */
export interface UseDeviceReturn {
  /** 设备信息(响应式) */
  deviceInfo: DeviceInfo
  /** 是否就绪 */
  isReady: Ref<boolean>
  /** 更新设备信息 */
  updateDeviceInfo: () => void
  /** rpx 转 px */
  rpxToPx: (rpx: number) => number
  /** px 转 rpx */
  pxToRpx: (px: number) => number
  /** 屏幕宽度 */
  screenWidth: number
  /** 屏幕高度 */
  screenHeight: number
  /** 窗口宽度 */
  windowWidth: number
  /** 窗口高度 */
  windowHeight: number
  /** 状态栏高度 */
  statusBarHeight: number
  /** 设备像素比 */
  pixelRatio: number
  /** 安全区域边距 */
  safeAreaInsets: SafeAreaInsets
  /** 是否 iOS */
  isIOS: boolean
  /** 是否 Android */
  isAndroid: boolean
  /** 是否深色模式 */
  isDarkMode: boolean
}
```

## 最佳实践

### 1. 缓存系统信息

```typescript
// 避免频繁调用 getSystemInfoSync
let cachedSystemInfo: UniApp.GetSystemInfoResult | null = null

export function getSystemInfo(): UniApp.GetSystemInfoResult {
  if (!cachedSystemInfo) {
    cachedSystemInfo = uni.getSystemInfoSync()
  }
  return cachedSystemInfo
}

// 需要更新时清除缓存
export function clearSystemInfoCache() {
  cachedSystemInfo = null
}
```

### 2. 条件编译优化

```typescript
// 使用条件编译避免无用代码
export function getPlatformFeatures() {
  const features: string[] = []

  // #ifdef APP-PLUS
  features.push('push', 'fingerprint', 'camera')
  // #endif

  // #ifdef MP-WEIXIN
  features.push('share', 'subscribe', 'miniprogram')
  // #endif

  // #ifdef H5
  features.push('clipboard', 'notification', 'webgl')
  // #endif

  return features
}
```

### 3. 安全区域适配

```vue
<template>
  <view class="safe-container" :style="safeStyle">
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDevice } from '@/composables/useDevice'

const { safeAreaInsets } = useDevice()

const safeStyle = computed(() => ({
  paddingTop: `${safeAreaInsets.top}px`,
  paddingBottom: `${safeAreaInsets.bottom}px`,
  paddingLeft: `${safeAreaInsets.left}px`,
  paddingRight: `${safeAreaInsets.right}px`,
}))
</script>
```

### 4. 响应式布局

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { useDevice } from '@/composables/useDevice'

const { windowWidth } = useDevice()

// 根据屏幕宽度计算列数
const columns = computed(() => {
  if (windowWidth < 375) return 2
  if (windowWidth < 750) return 3
  return 4
})
</script>
```

## 常见问题

### 1. getSystemInfoSync 返回值不完整

**问题原因:**
- 不同平台返回的字段不同
- 某些字段在特定平台下为 undefined

**解决方案:**

```typescript
// 使用默认值处理
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 20
const pixelRatio = systemInfo.pixelRatio || 1
const safeArea = systemInfo.safeArea || {
  left: 0,
  right: systemInfo.screenWidth,
  top: 0,
  bottom: systemInfo.screenHeight,
  width: systemInfo.screenWidth,
  height: systemInfo.screenHeight,
}
```

### 2. 屏幕旋转后信息不更新

**问题原因:**
- getSystemInfoSync 获取的是调用时的信息
- 屏幕旋转后需要重新获取

**解决方案:**

```typescript
// 监听屏幕旋转
// #ifdef APP-PLUS
plus.screen.onOrientationChange(() => {
  updateDeviceInfo()
})
// #endif

// #ifdef H5
window.addEventListener('resize', () => {
  updateDeviceInfo()
})
// #endif
```

### 3. 小程序和 H5 行为不一致

**问题原因:**
- 不同平台 API 实现差异
- 某些功能仅特定平台支持

**解决方案:**

```typescript
// 使用条件编译处理差异
export function getNavigatorInfo() {
  // #ifdef H5
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
  }
  // #endif

  // #ifndef H5
  const systemInfo = uni.getSystemInfoSync()
  return {
    userAgent: '',
    language: systemInfo.language,
    online: true,  // 小程序默认在线
  }
  // #endif
}
```

### 4. Canvas 绘制模糊

**问题原因:**
- 未考虑设备像素比
- Canvas 尺寸与显示尺寸不匹配

**解决方案:**

```typescript
const { pixelRatio, windowWidth } = uni.getSystemInfoSync()

// Canvas 实际尺寸 = 显示尺寸 * 像素比
const canvasWidth = 300 * pixelRatio
const canvasHeight = 200 * pixelRatio

// 绘制时缩放
const ctx = uni.createCanvasContext('canvas')
ctx.scale(pixelRatio, pixelRatio)

// 正常尺寸绑制(会自动放大)
ctx.fillRect(0, 0, 100, 100)
ctx.draw()
```

### 5. 状态栏高度获取为 0

**问题原因:**
- H5 环境没有状态栏概念
- 某些 Android 设备返回异常

**解决方案:**

```typescript
export function getStatusBarHeight(): number {
  const systemInfo = uni.getSystemInfoSync()

  // H5 环境返回 0
  // #ifdef H5
  return 0
  // #endif

  // 小程序和 App
  const height = systemInfo.statusBarHeight

  // 异常值处理
  if (!height || height < 0) {
    // iOS 默认 20px(非刘海屏)或 44px(刘海屏)
    if (systemInfo.platform === 'ios') {
      return systemInfo.safeArea?.top || 20
    }
    // Android 默认 24px
    return 24
  }

  return height
}
```

### 6. 安全区域计算错误

**问题原因:**
- safeArea 字段可能为 undefined
- 不同平台计算方式不同

**解决方案:**

```typescript
export function getSafeAreaInsets(): SafeAreaInsets {
  const systemInfo = uni.getSystemInfoSync()
  const { screenWidth, screenHeight, safeArea } = systemInfo

  if (!safeArea) {
    return { left: 0, right: 0, top: 0, bottom: 0 }
  }

  return {
    left: safeArea.left || 0,
    right: screenWidth - (safeArea.right || screenWidth),
    top: safeArea.top || 0,
    bottom: screenHeight - (safeArea.bottom || screenHeight),
  }
}
```

