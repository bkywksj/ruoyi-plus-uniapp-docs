# 平台差异说明

## 介绍

UniApp 支持编译到多个平台,但不同平台之间存在功能差异、API 差异和渲染差异。RuoYi-Plus-UniApp 框架针对这些差异进行了封装和适配,本文档详细说明各平台之间的差异及处理方案。

**核心内容:**

- **平台标识** - 各平台的条件编译标识
- **API 差异** - 不同平台 API 的参数和行为差异
- **渲染差异** - 组件渲染和样式的平台差异
- **功能限制** - 各平台的功能限制和替代方案
- **统一封装** - 项目中的跨平台封装方案

## 平台标识

### 条件编译标识

UniApp 支持的条件编译平台标识:

| 平台 | 标识 | 说明 |
|------|------|------|
| H5 | `H5` | 浏览器端 |
| App | `APP-PLUS` | iOS/Android 原生应用 |
| 微信小程序 | `MP-WEIXIN` | 微信小程序 |
| 支付宝小程序 | `MP-ALIPAY` | 支付宝/钉钉小程序 |
| 百度小程序 | `MP-BAIDU` | 百度智能小程序 |
| 抖音小程序 | `MP-TOUTIAO` | 抖音/今日头条小程序 |
| QQ小程序 | `MP-QQ` | QQ小程序 |
| 快手小程序 | `MP-KUAISHOU` | 快手小程序 |
| 京东小程序 | `MP-JD` | 京东小程序 |
| 所有小程序 | `MP` | 所有小程序平台 |

### 平台检测工具

```typescript
// src/utils/platform.ts

export const platform = __UNI_PLATFORM__
export const isApp = __UNI_PLATFORM__ === 'app'
export const isMp = __UNI_PLATFORM__.startsWith('mp-')
export const isMpWeixin = __UNI_PLATFORM__.startsWith('mp-weixin')
export const isMpAlipay = __UNI_PLATFORM__.startsWith('mp-alipay')
export const isMpToutiao = __UNI_PLATFORM__.startsWith('mp-toutiao')

// 判断是否在微信公众号内的 H5
export const isWechatOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false
  const ua = safeGetUserAgent()
  return ua.includes('micromessenger') && !ua.includes('miniprogram')
})()

// 判断是否在支付宝内的 H5
export const isAlipayOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false
  const ua = safeGetUserAgent()
  return ua.includes('alipayclient')
})()

// 普通 H5 (排除在微信、支付宝等容器内的 H5)
export const isH5 = __UNI_PLATFORM__ === 'h5' && !isWechatOfficialH5 && !isAlipayOfficialH5
```

## API 差异对比

### 提示框 API

不同平台的提示框 API 存在参数差异:

```typescript
// 微信/uni 标准 API
uni.showToast({
  title: '提示内容',
  icon: 'success',
  duration: 2000,
})

// 支付宝小程序 API
// #ifdef MP-ALIPAY
// @ts-expect-error
my.showToast({
  content: '提示内容', // 注意是 content 不是 title
  type: 'success',
  duration: 2000,
})
// #endif
```

**统一封装:**

```typescript
// utils/toast.ts
export const showToast = (message: string, type: 'success' | 'error' | 'none' = 'none') => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error
  my.showToast({
    content: message,
    type: type === 'none' ? 'none' : type,
  })
  // #endif

  // #ifndef MP-ALIPAY
  uni.showToast({
    title: message,
    icon: type,
  })
  // #endif
}
```

### 存储 API

```typescript
// uni 标准 API
uni.setStorageSync('key', data)
const value = uni.getStorageSync('key')

// 支付宝小程序 API
// #ifdef MP-ALIPAY
// @ts-expect-error
my.setStorageSync({
  key: 'key',
  data: data,
})
// @ts-expect-error
const res = my.getStorageSync({ key: 'key' })
const value = res.data
// #endif
```

**统一封装:**

```typescript
// utils/storage.ts
export const setStorage = (key: string, data: any) => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error
  my.setStorageSync({ key, data })
  // #endif

  // #ifndef MP-ALIPAY
  uni.setStorageSync(key, data)
  // #endif
}

export const getStorage = (key: string) => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error
  const res = my.getStorageSync({ key })
  return res.data
  // #endif

  // #ifndef MP-ALIPAY
  return uni.getStorageSync(key)
  // #endif
}
```

### 剪贴板 API

```typescript
// src/utils/function.ts

/**
 * 跨平台复制文本到剪贴板
 */
export const copyToClipboard = async (content: string): Promise<boolean> => {
  // #ifdef H5
  // H5 端使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(content)
      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }
  // #endif

  // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  // APP 端和小程序端使用 uni.setClipboardData
  return new Promise((resolve) => {
    uni.setClipboardData({
      data: content,
      showToast: false,
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })
  // #endif
}

/**
 * 跨平台读取剪贴板
 */
export const readFromClipboard = async (): Promise<string | null> => {
  // #ifdef H5
  if (navigator.clipboard && window.isSecureContext) {
    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error('读取失败:', error)
      return null
    }
  }
  // #endif

  // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  return new Promise((resolve) => {
    uni.getClipboardData({
      success: (res) => resolve(res.data),
      fail: () => resolve(null),
    })
  })
  // #endif
}
```

### 位置 API

```typescript
// 获取当前位置
const getLocation = async () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error
    my.getLocation({
      type: 1, // 1:获取经纬度 2:获取街道地址
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
        })
      },
      fail: reject,
    })
  })
  // #endif

  // #ifndef MP-ALIPAY
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject,
    })
  })
  // #endif
}
```

### 扫码 API

```typescript
// 扫描二维码
const scanCode = async () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error
    my.scan({
      type: 'qr',
      success: (res) => resolve(res.code),
      fail: reject,
    })
  })
  // #endif

  // #ifndef MP-ALIPAY
  return new Promise((resolve, reject) => {
    uni.scanCode({
      scanType: ['qrCode'],
      success: (res) => resolve(res.result),
      fail: reject,
    })
  })
  // #endif
}
```

## 支付差异

### 支付能力对比

| 平台 | 微信支付 | 支付宝支付 | 余额支付 |
|------|----------|------------|----------|
| 微信小程序 | 是 | 否 | 是 |
| 支付宝小程序 | 否 | 是 | 是 |
| H5(微信内) | 是 | 是 | 是 |
| H5(支付宝内) | 否 | 是 | 是 |
| H5(浏览器) | 否 | 是 | 是 |
| App | 是 | 是 | 是 |

### 支付平台检测

```typescript
// src/composables/usePayment.ts

/**
 * 检查当前平台是否支持微信支付
 */
const isWechatPaySupported = (): boolean => {
  return PLATFORM.isMpWeixin || PLATFORM.isWechatOfficialH5 || PLATFORM.isApp
}

/**
 * 检查当前平台是否支持支付宝支付
 */
const isAlipayPaySupported = (): boolean => {
  return PLATFORM.isMpAlipay || PLATFORM.isAlipayOfficialH5 || PLATFORM.isH5 || PLATFORM.isApp
}

/**
 * 检查当前平台是否支持余额支付
 */
const isBalancePaySupported = (): boolean => {
  return true // 所有平台都支持余额支付
}
```

### 支付调用方式

**微信小程序支付:**

```typescript
// #ifdef MP-WEIXIN
uni.requestPayment({
  provider: 'wxpay',
  timeStamp: payInfo.timeStamp,
  nonceStr: payInfo.nonceStr,
  package: payInfo.package,
  signType: payInfo.signType,
  paySign: payInfo.paySign,
  success: (res) => console.log('支付成功'),
  fail: (err) => console.error('支付失败'),
})
// #endif
```

**支付宝小程序支付:**

```typescript
// #ifdef MP-ALIPAY
uni.requestPayment({
  provider: 'alipay',
  orderInfo: paymentResponse.payForm || paymentResponse.payUrl!,
  success: (res) => console.log('支付成功'),
  fail: (err) => console.error('支付失败'),
})
// #endif
```

**H5 微信公众号支付:**

```typescript
// #ifdef H5
window.WeixinJSBridge!.invoke(
  'getBrandWCPayRequest',
  {
    appId: payInfo.appId,
    timeStamp: payInfo.timeStamp,
    nonceStr: payInfo.nonceStr,
    package: payInfo.package,
    signType: payInfo.signType,
    paySign: payInfo.paySign,
  },
  (res) => {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      console.log('支付成功')
    }
  },
)
// #endif
```

### 交易类型选择

```typescript
/**
 * 根据平台自动选择交易类型
 */
const getTradeType = (paymentMethod: PaymentMethod): TradeType => {
  if (paymentMethod === PaymentMethod.WECHAT) {
    if (PLATFORM.isMpWeixin) {
      return TradeType.JSAPI
    } else if (PLATFORM.isApp) {
      return TradeType.APP
    } else if (PLATFORM.isWechatOfficialH5) {
      return TradeType.JSAPI
    } else if (PLATFORM.isH5) {
      return TradeType.H5
    } else {
      return TradeType.NATIVE
    }
  } else if (paymentMethod === PaymentMethod.ALIPAY) {
    if (PLATFORM.isMpAlipay || PLATFORM.isApp) {
      return TradeType.APP
    } else if (PLATFORM.isH5) {
      return TradeType.WAP
    } else {
      return TradeType.PAGE
    }
  }
  throw new Error(`不支持的支付方式: ${paymentMethod}`)
}
```

## 渲染差异

### v-show 差异

支付宝小程序对 `v-show` 的支持存在问题:

```vue
<template>
  <!-- 支付宝端：只保留 v-if，v-show 无效 -->
  <!-- #ifdef MP-ALIPAY -->
  <Home v-if="currentTab === 0 && tabs[0].loaded" />
  <Menu v-if="currentTab === 1 && tabs[1].loaded" />
  <My v-if="currentTab === 2 && tabs[2].loaded" />
  <!-- #endif -->

  <!-- 非支付宝端：用 v-show 提高性能 -->
  <!-- #ifndef MP-ALIPAY -->
  <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
  <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
  <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
  <!-- #endif -->
</template>
```

### Canvas 差异

支付宝小程序的 Canvas 需要特殊处理像素比:

```typescript
// src/wd/components/wd-circle/wd-circle.vue

const canvasSize = computed(() => {
  let size = rpxToPx(props.size)
  // #ifdef MP-ALIPAY
  size = size * pixelRatio.value
  // #endif
  return size
})

const sWidth = computed(() => {
  let sWidth = rpxToPx(props.strokeWidth)
  // #ifdef MP-ALIPAY
  sWidth = sWidth * pixelRatio.value
  // #endif
  return sWidth
})
```

### SelectorQuery 差异

支付宝小程序不支持 `.in()` 方法:

```typescript
const selector = uni
  .createSelectorQuery()
  // #ifndef MP-ALIPAY
  .in(this._in ? this._in.page : this)
  // #endif
  .select('#_root')
  .boundingClientRect()
```

### 文本节点差异

不同平台的文本节点处理方式不同:

```vue
<!-- 微信小程序 -->
<!-- #ifdef MP-WEIXIN -->
<text :user-select="opts[4]=='force'&&isiOS" decode>{{n.text}}</text>
<!-- #endif -->

<!-- 百度、支付宝、抖音小程序 -->
<!-- #ifndef MP-WEIXIN || MP-BAIDU || MP-ALIPAY || MP-TOUTIAO -->
<text :user-select="opts[4]" decode>{{n.text}}</text>
<!-- #endif -->
```

## 分享差异

### 分享 API 对比

| 平台 | API | 方法 |
|------|-----|------|
| 微信小程序 | `uni.showShareMenu` | 显示分享菜单 |
| 支付宝小程序 | `my.showSharePanel` | 显示分享面板 |
| 百度小程序 | `swan.openShare` | 打开分享 |
| QQ小程序 | `qq.showShareMenu` | 显示分享菜单 |

### 统一分享实现

```typescript
// src/composables/useShare.ts

const triggerShare = (): void => {
  try {
    // 微信小程序
    // #ifdef MP-WEIXIN
    const shareMenuOptions: any = {
      withShareTicket: true,
      menus: ['shareAppMessage'],
    }
    if (pageConfig.value.enableTimeline !== false) {
      shareMenuOptions.menus.push('shareTimeline')
    }
    uni.showShareMenu(shareMenuOptions)
    // #endif

    // 支付宝小程序
    // #ifdef MP-ALIPAY
    // @ts-expect-error
    my.showSharePanel({
      title: shareConfig.value.title,
      content: shareConfig.value.title,
      url: shareConfig.value.path,
    })
    // #endif

    // 百度小程序
    // #ifdef MP-BAIDU
    // @ts-expect-error
    swan.openShare({
      title: shareConfig.value.title,
      content: shareConfig.value.title,
      imageUrl: shareConfig.value.imageUrl,
      path: shareConfig.value.path,
    })
    // #endif

    // QQ小程序
    // #ifdef MP-QQ
    // @ts-expect-error
    qq.showShareMenu({
      showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment'],
    })
    // #endif
  } catch (error) {
    console.error('触发分享失败:', error)
    uni.showToast({
      title: '分享功能暂不可用',
      icon: 'none',
    })
  }
}
```

## 登录差异

### 登录方式对比

| 平台 | 登录方式 | 获取用户信息 |
|------|----------|--------------|
| 微信小程序 | `uni.login` + 服务端换取 openid | `getUserProfile` (已废弃) |
| 支付宝小程序 | `my.getAuthCode` | `my.getOpenUserInfo` |
| H5 | 手机号/账号密码/第三方OAuth | 接口获取 |
| App | 手机号/第三方SDK | 原生SDK |

### 微信小程序登录

```typescript
// #ifdef MP-WEIXIN
const login = async () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        // 将 code 发送到服务端换取 openid
        resolve(res.code)
      },
      fail: reject,
    })
  })
}
// #endif
```

### 支付宝小程序登录

```typescript
// #ifdef MP-ALIPAY
const login = async () => {
  return new Promise((resolve, reject) => {
    // @ts-expect-error
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        resolve(res.authCode)
      },
      fail: reject,
    })
  })
}
// #endif
```

## 功能限制对比

### H5 限制

| 功能 | 限制说明 | 替代方案 |
|------|----------|----------|
| 蓝牙 | 不支持 | 无 |
| NFC | 不支持 | 无 |
| 推送通知 | 需要 Service Worker | Web Push |
| 后台运行 | 受限 | Service Worker |
| 文件系统 | 受限 | IndexedDB |
| 相机 | 需要 HTTPS | WebRTC |

### 微信小程序限制

| 功能 | 限制说明 | 替代方案 |
|------|----------|----------|
| 包大小 | 主包 2MB,总包 20MB | 分包加载 |
| 本地存储 | 10MB | 云存储 |
| 并发请求 | 10个 | 请求队列 |
| WebSocket | 5个 | 复用连接 |

### 支付宝小程序限制

| 功能 | 限制说明 | 替代方案 |
|------|----------|----------|
| 包大小 | 主包 2MB,总包 8MB | 分包加载 |
| 本地存储 | 10MB | 云存储 |
| v-show | 可能不生效 | 使用 v-if |

### App 限制

| 功能 | 限制说明 | 替代方案 |
|------|----------|----------|
| 热更新 | iOS 审核限制 | wgt 更新 |
| 后台定位 | 需要权限 | 前台定位 |
| 通知 | 需要证书配置 | 本地通知 |

## 样式差异

### 单位差异

| 平台 | 推荐单位 | 转换关系 |
|------|----------|----------|
| H5 | rem/px | - |
| 小程序 | rpx | 750rpx = 屏幕宽度 |
| App | rpx/px | 750rpx = 屏幕宽度 |

### 样式隔离

```typescript
// manifest.config.ts

// 微信小程序
'mp-weixin': {
  // 组件样式隔离模式
  // isolated: 完全隔离
  // apply-shared: 页面影响组件
  // shared: 互相影响
}

// 支付宝小程序
'mp-alipay': {
  styleIsolation: 'shared',
}
```

### 安全区域

```scss
// 兼容不同平台的安全区域
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom); /* iOS >= 11.2 */
}

/* 针对特定平台 */
/* #ifdef MP-WEIXIN */
.weixin-safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
```

## 组件差异

### 图片组件

```vue
<template>
  <image
    :src="src"
    :mode="mode"
    :lazy-load="lazyLoad"
    @error="onError"
    @load="onLoad"
  />
</template>
```

**平台差异:**

- H5: 支持所有图片格式
- 小程序: 支持网络图片、本地图片、base64
- App: 支持本地绝对路径

### 视频组件

```vue
<template>
  <video
    :src="src"
    :controls="controls"
    :autoplay="autoplay"
    @play="onPlay"
    @pause="onPause"
  />
</template>
```

**平台差异:**

- H5: 自动播放受限
- 小程序: 同层渲染差异
- App: 原生播放器

### 地图组件

```vue
<template>
  <map
    :latitude="latitude"
    :longitude="longitude"
    :markers="markers"
    @markertap="onMarkerTap"
  />
</template>
```

**平台差异:**

- H5: 需要配置 key
- 微信小程序: 腾讯地图
- 支付宝小程序: 高德地图

## 调试差异

### 开发者工具

| 平台 | 工具 | 功能 |
|------|------|------|
| H5 | Chrome DevTools | 完整调试能力 |
| 微信小程序 | 微信开发者工具 | 真机预览、远程调试 |
| 支付宝小程序 | 支付宝开发者工具 | 真机预览、性能分析 |
| App | HBuilderX | 真机调试、日志查看 |

### 日志输出

```typescript
// 统一日志封装
const logger = {
  log: (...args: any[]) => {
    console.log('[LOG]', ...args)

    // #ifdef MP-ALIPAY
    // 支付宝小程序额外处理
    // @ts-expect-error
    if (__DEV__) {
      my.showToast({ content: JSON.stringify(args) })
    }
    // #endif
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
}
```

## 网络请求差异

### 跨域处理

**H5 平台:**

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

**小程序平台:**

- 不存在跨域问题
- 需要配置服务器域名白名单

### 请求限制

| 平台 | 并发数 | 超时 | 大小限制 |
|------|--------|------|----------|
| H5 | 无限制 | 可配置 | 无限制 |
| 微信小程序 | 10个 | 60s | 无限制 |
| 支付宝小程序 | 10个 | 30s | 无限制 |

## 性能优化差异

### 分包策略

**微信小程序:**

```json
{
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": ["product/detail"]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub"]
    }
  }
}
```

**支付宝小程序:**

```json
{
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": ["product/detail"]
    }
  ]
}
```

### 懒加载

**微信小程序:**

```typescript
// manifest.config.ts
'mp-weixin': {
  lazyCodeLoading: 'requiredComponents',
}
```

**百度小程序:**

```typescript
'mp-baidu': {
  optimization: {
    subPackages: true,
  },
}
```

## 最佳实践

### 1. 统一平台工具

创建统一的平台检测和处理工具:

```typescript
// utils/platform.ts
export const PLATFORM = {
  platform,
  isH5,
  isApp,
  isMp,
  isMpWeixin,
  isMpAlipay,
  // ...其他平台

  // 环境检测
  isWechatEnvironment,
  isAlipayEnvironment,
  isInDevTools,
}

export default PLATFORM
```

### 2. API 适配层

为有差异的 API 创建适配层:

```typescript
// utils/api.ts
export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'none'),
}

export const storage = {
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  clear: clearStorage,
}
```

### 3. 条件编译规范

统一条件编译的使用规范:

```typescript
// ✅ 推荐: 使用工具函数封装
import PLATFORM from '@/utils/platform'

if (PLATFORM.isMpAlipay) {
  // 支付宝特有逻辑
}

// ✅ 推荐: 必要时使用条件编译
// #ifdef MP-ALIPAY
my.specificApi()
// #endif

// ❌ 避免: 过度使用条件编译
// #ifdef MP-WEIXIN
// 大段代码...
// #endif
// #ifdef MP-ALIPAY
// 重复的大段代码...
// #endif
```

### 4. 组件兼容处理

在组件内部处理平台差异:

```vue
<template>
  <view :class="rootClass">
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import PLATFORM from '@/utils/platform'

const rootClass = computed(() => ({
  'component': true,
  'component--alipay': PLATFORM.isMpAlipay,
  'component--weixin': PLATFORM.isMpWeixin,
  'component--h5': PLATFORM.isH5,
}))
</script>

```

### 5. 测试策略

针对不同平台进行测试:

- **单元测试** - 测试平台无关的业务逻辑
- **集成测试** - 测试 API 适配层
- **端到端测试** - 在各平台上进行真机测试
- **自动化测试** - 使用各平台提供的自动化测试工具

### 6. 文档记录

记录平台差异和解决方案:

```typescript
/**
 * 获取用户位置
 *
 * 平台差异:
 * - 支付宝小程序: 使用 my.getLocation, type 参数为数字
 * - 其他平台: 使用 uni.getLocation, type 参数为字符串
 *
 * @returns 位置信息
 */
export const getLocation = async () => {
  // 实现...
}
```
