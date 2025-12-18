# platform 平台检测

## 介绍

`platform` 是 UniApp 多端平台检测工具，提供运行环境判断和平台特性检测功能。该工具利用 UniApp 的条件编译机制，在编译时确定运行平台，同时提供运行时的环境检测能力。

**核心特性:**

- **平台常量** - 编译时确定的平台标识常量
- **环境检测** - 运行时检测微信、支付宝等特定环境
- **开发工具识别** - 判断是否在开发者工具中运行
- **支付环境检测** - 检测支付相关的 URL 和 JSBridge
- **类型安全** - 完整的 TypeScript 类型支持

## 平台常量

### 平台标识

```typescript
import {
  platform,
  isApp,
  isMp,
  isMpWeixin,
  isMpAlipay,
  isMpToutiao,
  isH5
} from '@/utils/platform'

// platform: 当前平台标识字符串
console.log(platform) // 'app' | 'mp-weixin' | 'mp-alipay' | 'h5' | ...

// 各平台布尔值常量
console.log(isApp)       // true - App 平台
console.log(isMp)        // true - 小程序平台（任意）
console.log(isMpWeixin)  // true - 微信小程序
console.log(isMpAlipay)  // true - 支付宝小程序
console.log(isMpToutiao) // true - 头条/抖音小程序
console.log(isH5)        // true - H5 网页端
```

### 条件编译原理

平台常量基于 UniApp 条件编译，在编译时确定值：

```typescript
// 内部实现原理
let platform = ''

// #ifdef APP-PLUS
platform = 'app'
// #endif

// #ifdef MP-WEIXIN
platform = 'mp-weixin'
// #endif

// #ifdef MP-ALIPAY
platform = 'mp-alipay'
// #endif

// #ifdef H5
platform = 'h5'
// #endif

export const isApp = platform === 'app'
export const isMpWeixin = platform === 'mp-weixin'
// ...
```

## 环境检测

### 微信环境检测

检测当前是否运行在微信内置浏览器中：

```typescript
import { isWechatEnvironment } from '@/utils/platform'

// 检测微信环境
if (isWechatEnvironment()) {
  console.log('当前在微信浏览器中')
  // 可以使用微信 JSSDK
} else {
  console.log('非微信环境')
}
```

**检测原理：**
- 检查 `navigator.userAgent` 是否包含 `MicroMessenger`
- 同时检查是否在浏览器环境中

### 支付宝环境检测

检测当前是否运行在支付宝内置浏览器中：

```typescript
import { isAlipayEnvironment } from '@/utils/platform'

// 检测支付宝环境
if (isAlipayEnvironment()) {
  console.log('当前在支付宝浏览器中')
  // 可以使用支付宝 JSSDK
}
```

**检测原理：**
- 检查 `navigator.userAgent` 是否包含 `AlipayClient`

### H5 内嵌环境判断

判断 H5 是否运行在微信公众号或支付宝生活号中：

```typescript
import { isWechatOfficialH5, isAlipayOfficialH5 } from '@/utils/platform'

// 微信公众号 H5
if (isWechatOfficialH5) {
  console.log('微信公众号网页')
  // 使用微信网页授权
}

// 支付宝生活号 H5
if (isAlipayOfficialH5) {
  console.log('支付宝生活号网页')
  // 使用支付宝网页授权
}
```

## 开发工具检测

### 判断开发者工具

检测是否在小程序开发者工具中运行：

```typescript
import { isInDevTools } from '@/utils/platform'

// 检测开发者工具
if (isInDevTools()) {
  console.log('当前在开发者工具中运行')
  // 可以显示调试信息
} else {
  console.log('当前在真机或生产环境中')
}
```

**使用场景：**
- 在开发工具中显示额外调试信息
- 开发工具中跳过某些真机专属功能
- 模拟数据替代真实 API 调用

### 实现原理

```typescript
// 通过 uni.getSystemInfoSync 获取平台信息
export const isInDevTools = (): boolean => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    // 检查 platform 是否为 devtools
    return systemInfo.platform === 'devtools'
  } catch {
    return false
  }
}
```

## 支付环境检测

### 检测支付 URL

判断当前 URL 是否为支付相关页面：

```typescript
import { checkPaymentUrl } from '@/utils/platform'

// 检测支付 URL
const result = checkPaymentUrl()
console.log(result.isPaymentUrl)  // 是否是支付 URL
console.log(result.paymentType)   // 支付类型: 'wechat' | 'alipay' | null
```

**检测规则：**
- 微信支付 URL 包含 `wx.tenpay.com` 或 `pay.weixin.qq.com`
- 支付宝支付 URL 包含 `alipay.com`

### 检测微信 JSBridge

判断微信 JSBridge 是否可用：

```typescript
import { hasWeixinJSBridge } from '@/utils/platform'

// 检测微信 JSBridge
if (hasWeixinJSBridge()) {
  console.log('微信 JSBridge 可用')
  // 可以调用 wx.chooseWXPay 等
} else {
  console.log('微信 JSBridge 不可用')
}
```

### 安全获取 URL 参数

从 URL 中安全提取参数：

```typescript
import { safeGetUrlParams } from '@/utils/platform'

// 获取 URL 参数
const params = safeGetUrlParams()
console.log(params.code)   // 授权 code
console.log(params.state)  // 状态参数
```

## 实际应用场景

### 平台差异化处理

```typescript
import { isApp, isMpWeixin, isH5 } from '@/utils/platform'

// 根据平台选择不同实现
const scanQRCode = () => {
  if (isApp) {
    // App 使用原生扫码
    uni.scanCode({
      success: (res) => {
        console.log('扫码结果:', res.result)
      }
    })
  } else if (isMpWeixin) {
    // 微信小程序扫码
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res.result)
      }
    })
  } else if (isH5) {
    // H5 使用第三方库或提示不支持
    uni.showToast({
      title: 'H5 暂不支持扫码',
      icon: 'none'
    })
  }
}
```

### 登录方式选择

```typescript
import { isMpWeixin, isMpAlipay, isH5, isWechatOfficialH5 } from '@/utils/platform'

// 获取可用的登录方式
const getLoginMethods = () => {
  const methods = []

  if (isMpWeixin) {
    methods.push({ type: 'wechat', name: '微信登录' })
  }

  if (isMpAlipay) {
    methods.push({ type: 'alipay', name: '支付宝登录' })
  }

  if (isH5) {
    if (isWechatOfficialH5) {
      methods.push({ type: 'wechat-h5', name: '微信授权登录' })
    }
    methods.push({ type: 'phone', name: '手机号登录' })
    methods.push({ type: 'account', name: '账号密码登录' })
  }

  return methods
}
```

### 支付方式适配

```typescript
import {
  isMpWeixin,
  isMpAlipay,
  isH5,
  isWechatEnvironment,
  isAlipayEnvironment
} from '@/utils/platform'

// 获取支付方式
const getPaymentMethods = () => {
  // 微信小程序只能微信支付
  if (isMpWeixin) {
    return ['wechat']
  }

  // 支付宝小程序只能支付宝支付
  if (isMpAlipay) {
    return ['alipay']
  }

  // H5 根据环境判断
  if (isH5) {
    const methods = []

    if (isWechatEnvironment()) {
      methods.push('wechat-jsapi')
    }

    if (isAlipayEnvironment()) {
      methods.push('alipay-jsapi')
    }

    // 都支持 H5 支付
    methods.push('wechat-h5', 'alipay-h5')

    return methods
  }

  // App 支持所有支付方式
  return ['wechat', 'alipay', 'unionpay']
}
```

### 分享功能适配

```typescript
import { isMpWeixin, isMpAlipay, isH5, isApp } from '@/utils/platform'

// 分享到好友
const shareToFriend = (data: ShareData) => {
  if (isMpWeixin) {
    // 微信小程序使用页面生命周期 onShareAppMessage
    return { usePageShare: true }
  }

  if (isMpAlipay) {
    // 支付宝小程序
    my.showSharePanel()
    return { handled: true }
  }

  if (isH5) {
    // H5 复制链接
    uni.setClipboardData({
      data: data.url,
      success: () => {
        uni.showToast({ title: '链接已复制' })
      }
    })
    return { handled: true }
  }

  if (isApp) {
    // App 使用原生分享
    uni.share({
      provider: 'weixin',
      scene: 'WXSceneSession',
      type: 0,
      title: data.title,
      summary: data.desc,
      href: data.url,
      imageUrl: data.image
    })
    return { handled: true }
  }
}
```

### 调试信息显示

```typescript
import { isInDevTools, platform } from '@/utils/platform'

// 开发环境显示调试面板
const showDebugPanel = ref(false)

onMounted(() => {
  // 仅在开发者工具中显示调试面板
  if (isInDevTools()) {
    showDebugPanel.value = true
    console.log('当前平台:', platform)
  }
})
```

## API

### 平台常量

| 常量 | 说明 | 类型 |
|------|------|------|
| platform | 当前平台标识字符串 | `string` |
| isApp | 是否 App 平台 | `boolean` |
| isMp | 是否小程序平台 | `boolean` |
| isMpWeixin | 是否微信小程序 | `boolean` |
| isMpAlipay | 是否支付宝小程序 | `boolean` |
| isMpToutiao | 是否头条/抖音小程序 | `boolean` |
| isH5 | 是否 H5 网页端 | `boolean` |
| isWechatOfficialH5 | 是否微信公众号 H5 | `boolean` |
| isAlipayOfficialH5 | 是否支付宝生活号 H5 | `boolean` |

### 检测函数

| 函数 | 说明 | 返回值 |
|------|------|--------|
| isWechatEnvironment | 检测微信浏览器环境 | `boolean` |
| isAlipayEnvironment | 检测支付宝浏览器环境 | `boolean` |
| isInDevTools | 检测开发者工具环境 | `boolean` |
| hasWeixinJSBridge | 检测微信 JSBridge | `boolean` |
| checkPaymentUrl | 检测支付 URL | `{ isPaymentUrl: boolean, paymentType: string \| null }` |
| safeGetUrlParams | 安全获取 URL 参数 | `Record<string, string>` |

### 类型定义

```typescript
/**
 * 平台类型
 */
type PlatformType =
  | 'app'
  | 'mp-weixin'
  | 'mp-alipay'
  | 'mp-toutiao'
  | 'mp-baidu'
  | 'mp-qq'
  | 'h5'
  | 'quickapp-webview'
  | ''

/**
 * 支付 URL 检测结果
 */
interface PaymentUrlResult {
  /** 是否是支付 URL */
  isPaymentUrl: boolean
  /** 支付类型 */
  paymentType: 'wechat' | 'alipay' | null
}

/**
 * URL 参数对象
 */
type UrlParams = Record<string, string>
```

## 最佳实践

### 1. 使用常量而非运行时检测

```typescript
// 推荐：使用编译时常量
import { isMpWeixin } from '@/utils/platform'

if (isMpWeixin) {
  // 微信小程序逻辑
}

// 不推荐：运行时字符串判断
if (platform === 'mp-weixin') {
  // 效率较低
}
```

### 2. 封装平台差异化逻辑

```typescript
// utils/platformAdapter.ts
import { isApp, isMpWeixin, isH5 } from '@/utils/platform'

// 封装存储适配
export const storage = {
  set: (key: string, value: any) => {
    if (isApp || isMpWeixin) {
      uni.setStorageSync(key, value)
    } else if (isH5) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  get: (key: string) => {
    if (isApp || isMpWeixin) {
      return uni.getStorageSync(key)
    } else if (isH5) {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    }
  }
}
```

### 3. 条件渲染组件

```vue
<template>
  <view>
    <!-- 微信小程序专属组件 -->
    <wx-button v-if="isMpWeixin" open-type="share">
      分享
    </wx-button>

    <!-- 其他平台使用通用按钮 -->
    <wd-button v-else @click="handleShare">
      分享
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { isMpWeixin } from '@/utils/platform'
</script>
```

## 常见问题

### 1. 平台常量始终为 false？

**原因：** 未正确配置 UniApp 条件编译

**解决方案：** 确保在正确的平台下运行或构建项目

```bash
# 微信小程序
pnpm dev:mp-weixin

# H5
pnpm dev:h5

# App
pnpm dev:app
```

### 2. isWechatEnvironment 返回 false？

**原因：** 不在微信浏览器中运行

**解决方案：**
- 使用微信开发者工具的「公众号网页」模式
- 在真实微信客户端中打开页面

### 3. 如何判断 iOS 还是 Android？

```typescript
const getDeviceType = () => {
  const systemInfo = uni.getSystemInfoSync()
  return systemInfo.platform // 'ios' | 'android' | 'devtools'
}
```

### 4. H5 如何判断移动端还是 PC 端？

```typescript
const isMobile = () => {
  if (!isH5) return false
  const ua = navigator.userAgent.toLowerCase()
  return /mobile|android|iphone|ipad|ipod/.test(ua)
}
```
