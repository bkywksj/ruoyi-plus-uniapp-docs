# 条件编译

## 概述

条件编译是 uni-app 的核心特性之一，用于在不同平台编译不同的代码。通过条件编译，可以实现一套代码多端运行，同时针对各平台特性进行优化。

## 基本语法

### 注释语法

条件编译使用特殊注释语法，在编译时会根据平台自动包含或移除代码块。

```typescript
// #ifdef PLATFORM
平台特定代码
// #endif

// #ifndef PLATFORM
非该平台代码
// #endif
```

**语法说明**：

- `#ifdef`：仅在指定平台编译
- `#ifndef`：除指定平台外编译
- `#endif`：结束条件编译块

### 支持的文件类型

条件编译可用于以下文件类型：

- `.vue` 文件
- `.ts` / `.js` 文件
- `.css` / `.scss` 文件
- `.json` 文件（pages.json、manifest.json等）

## 平台标识

### 基础平台

| 平台标识 | 说明 |
|---------|------|
| `H5` | H5 网页 |
| `APP` | App（iOS + Android） |
| `APP-PLUS` | App（同 APP） |
| `MP` | 所有小程序 |
| `MP-WEIXIN` | 微信小程序 |
| `MP-ALIPAY` | 支付宝小程序 |
| `MP-BAIDU` | 百度小程序 |
| `MP-TOUTIAO` | 字节跳动小程序 |
| `MP-QQ` | QQ小程序 |
| `MP-KUAISHOU` | 快手小程序 |

### 组合平台

```typescript
// #ifdef H5 || MP-WEIXIN
H5 或微信小程序
// #endif

// #ifdef APP || H5
App 或 H5
// #endif
```

## TypeScript 中的条件编译

### 基本示例

```typescript
// src/utils/platform.ts:129
private listenErrors() {
  // #ifdef H5
  // 监听未捕获的错误
  window.addEventListener('error', (event) => {
    this.collect('error', [
      `未捕获的错误: ${event.message}`,
      `文件: ${event.filename}:${event.lineno}:${event.colno}`,
    ])
  })

  // 监听Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    this.collect('error', ['未处理的Promise错误:', event.reason])
  })
  // #endif

  // #ifndef H5
  // 小程序/App环境使用 uni.onError 和 uni.onUnhandledRejection
  uni.onError((error) => {
    this.collect('error', [`未捕获的错误: ${error}`])
  })

  uni.onUnhandledRejection((event) => {
    this.collect('error', ['未处理的Promise错误:', event.reason])
  })
  // #endif
}
```

### 类型声明

```typescript
// src/composables/usePayment.ts:24
// 全局类型声明 - 仅在 H5 环境下有效
// #ifdef H5
declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (method: string, params: any, callback: (result: any) => void) => void
    }
  }

  interface Document {
    attachEvent?: (event: string, listener: () => void) => void
  }
}
// #endif
```

### 平台特定逻辑

```typescript
// src/composables/usePayment.ts:73
const invokeWechatPay = (
  payInfo: Record<string, string>,
  callback: (success: boolean) => void,
): void => {
  // #ifdef H5
  console.log('调用WeixinJSBridge支付，参数:', payInfo)

  if (!PLATFORM.hasWeixinJSBridge()) {
    console.error('WeixinJSBridge不可用')
    toast.error('支付环境异常，请在微信中重试')
    callback(false)
    return
  }

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
      // 处理支付结果
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        toast.success('支付成功')
        callback(true)
      } else {
        toast.error('支付失败')
        callback(false)
      }
    },
  )
  // #endif

  // #ifndef H5
  console.error('微信JSBridge支付仅支持H5环境')
  callback(false)
  // #endif
}
```

## Vue 文件中的条件编译

### 模板中使用

```vue
<template>
  <view class="container">
    <!-- #ifdef H5 -->
    <view class="h5-only">仅H5显示</view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <view class="weixin-only">仅微信小程序显示</view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="not-h5">非H5平台显示</view>
    <!-- #endif -->
  </view>
</template>
```

### Script 中使用

```vue
<script setup lang="ts">
// #ifdef H5
const platform = 'H5'
// #endif

// #ifdef MP-WEIXIN
const platform = '微信小程序'
// #endif

// #ifdef APP
const platform = 'App'
// #endif

onMounted(() => {
  // #ifdef H5
  console.log('H5环境初始化')
  // #endif

  // #ifdef MP-WEIXIN
  console.log('微信小程序环境初始化')
  // #endif
})
</script>
```

### Style 中使用

```vue
```

## 项目实践

### 平台判断工具

项目提供了统一的平台判断工具：

```typescript
// src/utils/platform.ts:5
export const platform = __UNI_PLATFORM__
export const isApp = __UNI_PLATFORM__ === 'app'
export const isMp = __UNI_PLATFORM__.startsWith('mp-')
export const isMpWeixin = __UNI_PLATFORM__.startsWith('mp-weixin')
export const isMpAlipay = __UNI_PLATFORM__.startsWith('mp-alipay')
export const isMpToutiao = __UNI_PLATFORM__.startsWith('mp-toutiao')
```

**使用示例**：

```typescript
import { isMpWeixin, isH5 } from '@/utils/platform'

if (isMpWeixin) {
  // 微信小程序特定逻辑
  console.log('当前是微信小程序')
}

if (isH5) {
  // H5特定逻辑
  console.log('当前是H5')
}
```

### H5 环境判断

```typescript
// src/utils/platform.ts:66
export const isWechatOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false

  const ua = safeGetUserAgent()
  return ua.includes('micromessenger') && !ua.includes('miniprogram')
})()

export const isAlipayOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false

  const ua = safeGetUserAgent()
  return ua.includes('alipayclient')
})()
```

### 支付平台判断

```typescript
// src/composables/usePayment.ts:38
const isWechatPaySupported = (): boolean => {
  return PLATFORM.isMpWeixin || PLATFORM.isWechatOfficialH5 || PLATFORM.isApp
}

const isAlipayPaySupported = (): boolean => {
  return PLATFORM.isMpAlipay || PLATFORM.isAlipayOfficialH5 || PLATFORM.isH5 || PLATFORM.isApp
}
```

## 常用场景

### 1. API 差异处理

不同平台的 API 可能有差异，需要条件编译：

```typescript
// 获取系统信息
const getSystemInfo = () => {
  // #ifdef H5
  return {
    platform: 'h5',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  }
  // #endif

  // #ifndef H5
  return uni.getSystemInfoSync()
  // #endif
}
```

### 2. 样式差异处理

```scss
.button {
  // 基础样式
  padding: 10px 20px;

  /* #ifdef H5 */
  // H5 使用 px
  font-size: 14px;
  border-radius: 4px;
  /* #endif */

  /* #ifndef H5 */
  // 小程序和 App 使用 rpx
  font-size: 28rpx;
  border-radius: 8rpx;
  /* #endif */
}
```

### 3. 组件差异处理

```vue
<template>
  <view class="container">
    <!-- #ifdef H5 -->
    <web-component />
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <miniapp-component />
    <!-- #endif -->

    <!-- #ifdef APP -->
    <app-component />
    <!-- #endif -->
  </view>
</template>
```

### 4. 功能特性处理

```typescript
// 分享功能
const handleShare = () => {
  // #ifdef MP-WEIXIN
  // 微信小程序分享
  uni.showShareMenu({
    withShareTicket: true
  })
  // #endif

  // #ifdef H5
  // H5 使用 Web Share API 或自定义分享
  if (navigator.share) {
    navigator.share({
      title: '分享标题',
      text: '分享内容',
      url: location.href
    })
  }
  // #endif

  // #ifdef APP
  // App 使用原生分享
  plus.share.sendWithSystem({
    content: '分享内容',
    href: 'https://example.com'
  })
  // #endif
}
```

### 5. 路由差异处理

```typescript
// 打开外部链接
const openUrl = (url: string) => {
  // #ifdef H5
  window.open(url)
  // #endif

  // #ifdef MP-WEIXIN
  // 微信小程序使用 web-view
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent(url)}`
  })
  // #endif

  // #ifdef APP
  plus.runtime.openURL(url)
  // #endif
}
```

## 配置文件中的条件编译

### pages.json

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        // #ifdef H5
        "navigationBarBackgroundColor": "#ffffff"
        // #endif
        // #ifdef MP-WEIXIN
        "navigationBarBackgroundColor": "#007aff"
        // #endif
      }
    }
  ]
}
```

### manifest.json

```json
{
  "name": "ryplus-uni",
  // #ifdef H5
  "h5": {
    "router": {
      "mode": "history"
    }
  },
  // #endif
  // #ifdef MP-WEIXIN
  "mp-weixin": {
    "appid": "wxd44a6eaefd42428c",
    "setting": {
      "urlCheck": false
    }
  }
  // #endif
}
```

## 编译变量

### 内置变量

uni-app 提供了一些内置的编译变量：

```typescript
// 当前平台
const platform = __UNI_PLATFORM__
// 'h5' | 'app' | 'mp-weixin' | 'mp-alipay' | ...

// 是否开发环境
const isDev = import.meta.env.DEV

// 是否生产环境
const isProd = import.meta.env.PROD

// 环境变量
const baseUrl = import.meta.env.VITE_APP_BASE_URL
```

### 使用示例

```typescript
// 根据平台和环境配置 API 地址
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // 开发环境
    return 'http://localhost:3000'
  }

  // 生产环境
  if (__UNI_PLATFORM__ === 'h5') {
    return 'https://api.example.com'
  } else {
    return 'https://api-app.example.com'
  }
}
```

## 最佳实践

### 1. 优先使用 TypeScript 判断

```typescript
// ✅ 推荐：使用 TypeScript 判断，有类型提示
import { isMpWeixin, isH5 } from '@/utils/platform'

if (isMpWeixin) {
  // 微信小程序逻辑
}

// ❌ 不推荐：使用条件编译，无类型提示
// #ifdef MP-WEIXIN
// 微信小程序逻辑
// #endif
```

### 2. 避免过度使用条件编译

```typescript
// ✅ 推荐：抽离平台差异到独立函数
const getPlatformConfig = () => {
  if (__UNI_PLATFORM__ === 'h5') {
    return { fontSize: '14px' }
  } else {
    return { fontSize: '28rpx' }
  }
}

// ❌ 不推荐：到处使用条件编译
// #ifdef H5
const fontSize = '14px'
// #endif
// #ifdef MP-WEIXIN
const fontSize = '28rpx'
// #endif
```

### 3. 统一管理平台差异

```typescript
// src/config/platform.ts
export const platformConfig = {
  h5: {
    fontSize: '14px',
    spacing: '10px'
  },
  mp: {
    fontSize: '28rpx',
    spacing: '20rpx'
  }
}

// 使用
import { platformConfig } from '@/config/platform'
import { isH5 } from '@/utils/platform'

const config = isH5 ? platformConfig.h5 : platformConfig.mp
```

### 4. 注释清晰

```typescript
// ✅ 推荐：添加注释说明
// #ifdef H5
// H5 环境使用 window API
window.addEventListener('resize', handleResize)
// #endif

// ❌ 不推荐：无注释
// #ifdef H5
window.addEventListener('resize', handleResize)
// #endif
```

### 5. 避免嵌套过深

```typescript
// ✅ 推荐：平铺条件编译
// #ifdef H5
const handleH5 = () => {
  // H5 逻辑
}
// #endif

// #ifdef MP-WEIXIN
const handleWeixin = () => {
  // 微信逻辑
}
// #endif

// ❌ 不推荐：嵌套条件编译
// #ifdef H5
// #ifdef MP-WEIXIN
// 嵌套逻辑
// #endif
// #endif
```

## 常见问题

### 1. 条件编译不生效？

**原因**：
- 注释符号错误
- 平台标识拼写错误
- 缺少 `#endif`

**解决方案**：

```typescript
// ✅ 正确
// #ifdef H5
console.log('H5')
// #endif

// ❌ 错误：单行注释符号错误
/* #ifdef H5 */
console.log('H5')
/* #endif */

// ❌ 错误：平台标识错误
// #ifdef h5  // 应该是大写 H5
console.log('H5')
// #endif
```

### 2. 如何在多个平台生效？

**解决方案**：

```typescript
// 使用 || 运算符
// #ifdef H5 || MP-WEIXIN
console.log('H5 或微信小程序')
// #endif

// 使用 #ifndef 排除平台
// #ifndef APP
console.log('除了 App 的所有平台')
// #endif
```

### 3. TypeScript 类型提示失效？

**解决方案**：

```typescript
// ✅ 推荐：使用类型守卫
if (__UNI_PLATFORM__ === 'h5') {
  // TypeScript 能正确推断类型
  window.addEventListener('resize', () => {})
}

// ❌ 不推荐：条件编译中 TypeScript 可能无法正确推断
// #ifdef H5
window.addEventListener('resize', () => {})
// #endif
```

### 4. 条件编译影响代码可读性？

**解决方案**：

```typescript
// ✅ 推荐：抽离到独立文件
// src/utils/platform/h5.ts
export const initH5 = () => {
  window.addEventListener('resize', handleResize)
}

// src/utils/platform/mp.ts
export const initMp = () => {
  uni.onWindowResize(handleResize)
}

// 主文件
import { initH5 } from '@/utils/platform/h5'
import { initMp } from '@/utils/platform/mp'
import { isH5 } from '@/utils/platform'

if (isH5) {
  initH5()
} else {
  initMp()
}
```

### 5. 如何调试条件编译？

**解决方案**：

```typescript
// 使用编译变量输出当前平台
console.log('当前平台:', __UNI_PLATFORM__)

// 使用环境变量
console.log('环境:', import.meta.env.MODE)

// 条件编译中添加日志
// #ifdef H5
console.log('H5 平台代码块')
// #endif

// #ifdef MP-WEIXIN
console.log('微信小程序代码块')
// #endif
```
