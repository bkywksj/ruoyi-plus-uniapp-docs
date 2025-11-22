# 数据统计插件

## 介绍

数据统计插件提供了统一的数据埋点和统计分析能力，帮助开发者收集用户行为数据、分析应用使用情况。本文档介绍如何在 RuoYi-Plus-UniApp 框架中集成和使用数据统计功能。

**核心特性：**

- **多平台支持** - 支持微信小程序、支付宝小程序、H5、App 等多端统计
- **事件埋点** - 自定义事件上报，支持事件参数
- **页面统计** - 自动统计页面访问量和停留时长
- **用户行为** - 记录用户点击、滚动、分享等行为
- **性能监控** - 页面加载时间、接口响应时间等性能指标
- **错误上报** - JavaScript 错误和接口错误自动上报

## 统计平台

### 微信小程序数据分析

微信小程序自带数据分析功能，可在微信公众平台查看。

```typescript
// 自定义事件上报
// #ifdef MP-WEIXIN
wx.reportAnalytics('purchase', {
  price: 120,
  quantity: 2,
  productId: 'goods_001'
})
// #endif
```

**统计维度：**

- 用户分析：新增用户、活跃用户、留存率
- 访问分析：页面访问量、访问来源
- 实时统计：实时在线用户数
- 自定义分析：自定义事件和转化漏斗

### 友盟统计

友盟是常用的第三方统计平台，支持多端统计。

**安装配置：**

```typescript
// manifest.json 配置
{
  "mp-weixin": {
    "usingComponents": true
  },
  "app-plus": {
    "modules": {
      "Statistic": {}
    },
    "distribute": {
      "sdkConfigs": {
        "statistic": {
          "umeng": {
            "appkey_ios": "your_ios_appkey",
            "appkey_android": "your_android_appkey"
          }
        }
      }
    }
  }
}
```

**使用方式：**

```typescript
// App 端友盟统计
// #ifdef APP-PLUS
plus.statistic.eventTrig('purchase', {
  price: '120',
  product: 'goods_001'
})
// #endif
```

### 百度统计

H5 端可使用百度统计进行网站分析。

```html
<!-- index.html 引入统计代码 -->
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?your_site_id";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

**事件跟踪：**

```typescript
// H5 端百度统计
// #ifdef H5
if (window._hmt) {
  window._hmt.push(['_trackEvent', 'button', 'click', 'purchase', 1])
}
// #endif
```

## 基本用法

### 创建统计工具

封装统一的统计接口，适配多平台：

```typescript
// utils/analytics.ts
interface TrackEvent {
  /** 事件名称 */
  event: string
  /** 事件参数 */
  params?: Record<string, any>
  /** 事件分类 */
  category?: string
}

interface PageView {
  /** 页面路径 */
  path: string
  /** 页面标题 */
  title?: string
  /** 页面参数 */
  query?: Record<string, any>
}

/**
 * 统计事件上报
 */
export const trackEvent = (data: TrackEvent) => {
  const { event, params = {}, category = 'default' } = data

  // 微信小程序
  // #ifdef MP-WEIXIN
  wx.reportAnalytics(event, params)
  // #endif

  // App 端友盟
  // #ifdef APP-PLUS
  plus.statistic.eventTrig(event, params)
  // #endif

  // H5 百度统计
  // #ifdef H5
  if (window._hmt) {
    window._hmt.push(['_trackEvent', category, event, JSON.stringify(params)])
  }
  // #endif

  // 自定义服务端上报
  reportToServer({
    type: 'event',
    event,
    params,
    category,
    timestamp: Date.now()
  })
}

/**
 * 页面访问上报
 */
export const trackPageView = (data: PageView) => {
  const { path, title, query } = data

  // 微信小程序自动统计，无需手动上报

  // H5 百度统计
  // #ifdef H5
  if (window._hmt) {
    window._hmt.push(['_trackPageview', path])
  }
  // #endif

  // 自定义服务端上报
  reportToServer({
    type: 'pageview',
    path,
    title,
    query,
    timestamp: Date.now()
  })
}

/**
 * 上报到自己的服务端
 */
const reportToServer = async (data: any) => {
  try {
    await uni.request({
      url: '/api/analytics/report',
      method: 'POST',
      data,
      // 使用 beacon 方式发送，不阻塞页面
      header: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.warn('统计上报失败:', error)
  }
}
```

### 创建 useAnalytics 组合函数

```typescript
// composables/useAnalytics.ts
import { onMounted, onUnmounted } from 'vue'
import { trackEvent, trackPageView } from '@/utils/analytics'

interface AnalyticsOptions {
  /** 是否自动统计页面访问 */
  autoTrackPageView?: boolean
  /** 是否统计页面停留时长 */
  trackDuration?: boolean
}

export const useAnalytics = (options: AnalyticsOptions = {}) => {
  const {
    autoTrackPageView = true,
    trackDuration = true
  } = options

  let enterTime = 0

  // 页面进入时间
  onMounted(() => {
    enterTime = Date.now()

    if (autoTrackPageView) {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]

      trackPageView({
        path: '/' + currentPage.route,
        query: currentPage.options
      })
    }
  })

  // 页面离开时上报停留时长
  onUnmounted(() => {
    if (trackDuration && enterTime) {
      const duration = Date.now() - enterTime
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]

      trackEvent({
        event: 'page_duration',
        params: {
          path: '/' + currentPage?.route,
          duration
        }
      })
    }
  })

  return {
    /**
     * 上报自定义事件
     */
    track: trackEvent,

    /**
     * 上报页面访问
     */
    trackPage: trackPageView,

    /**
     * 上报用户行为
     */
    trackAction: (action: string, params?: Record<string, any>) => {
      trackEvent({
        event: action,
        params,
        category: 'user_action'
      })
    },

    /**
     * 上报业务转化
     */
    trackConversion: (conversion: string, params?: Record<string, any>) => {
      trackEvent({
        event: conversion,
        params,
        category: 'conversion'
      })
    }
  }
}
```

## 使用场景

### 1. 按钮点击统计

```vue
<template>
  <view class="page">
    <button @tap="handlePurchase">立即购买</button>
    <button @tap="handleAddCart">加入购物车</button>
  </view>
</template>

<script lang="ts" setup>
import { useAnalytics } from '@/composables/useAnalytics'

const { trackAction, trackConversion } = useAnalytics()

const handlePurchase = () => {
  // 统计购买按钮点击
  trackConversion('purchase_click', {
    goodsId: '123',
    price: 99.00
  })

  // 执行购买逻辑
}

const handleAddCart = () => {
  // 统计加购行为
  trackAction('add_cart', {
    goodsId: '123',
    quantity: 1
  })

  // 执行加购逻辑
}
</script>
```

### 2. 搜索行为统计

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'

const { track } = useAnalytics()

const keyword = ref('')
const searchResults = ref([])

const handleSearch = async () => {
  // 统计搜索行为
  track({
    event: 'search',
    params: {
      keyword: keyword.value,
      timestamp: Date.now()
    },
    category: 'search'
  })

  // 执行搜索
  const results = await searchGoods(keyword.value)
  searchResults.value = results

  // 统计搜索结果
  track({
    event: 'search_result',
    params: {
      keyword: keyword.value,
      resultCount: results.length
    },
    category: 'search'
  })
}
</script>
```

### 3. 分享统计

```vue
<script lang="ts" setup>
import { useAnalytics } from '@/composables/useAnalytics'
import { useShare } from '@/composables/useShare'

const { track } = useAnalytics()
const { setShareData } = useShare()

// 设置分享数据
setShareData({
  title: '精选商品',
  imageUrl: '/static/share.png'
})

// 监听分享成功
onShareAppMessage(() => {
  track({
    event: 'share_success',
    params: {
      type: 'friend',
      page: getCurrentPages().pop()?.route
    },
    category: 'share'
  })

  return {
    title: '精选商品',
    path: '/pages/index/index'
  }
})
</script>
```

### 4. 转化漏斗统计

```typescript
// 统计购买流程转化漏斗
const trackPurchaseFunnel = {
  // 浏览商品
  viewProduct: (goodsId: string) => {
    trackEvent({
      event: 'funnel_view_product',
      params: { goodsId }
    })
  },

  // 加入购物车
  addToCart: (goodsId: string, quantity: number) => {
    trackEvent({
      event: 'funnel_add_cart',
      params: { goodsId, quantity }
    })
  },

  // 开始结算
  beginCheckout: (orderAmount: number) => {
    trackEvent({
      event: 'funnel_begin_checkout',
      params: { orderAmount }
    })
  },

  // 提交订单
  submitOrder: (orderNo: string, amount: number) => {
    trackEvent({
      event: 'funnel_submit_order',
      params: { orderNo, amount }
    })
  },

  // 支付成功
  paymentSuccess: (orderNo: string, amount: number, method: string) => {
    trackEvent({
      event: 'funnel_payment_success',
      params: { orderNo, amount, method }
    })
  }
}
```

## 性能监控

### 页面加载性能

```typescript
// utils/performance.ts
export const trackPagePerformance = () => {
  // #ifdef H5
  if (window.performance) {
    const timing = window.performance.timing
    const metrics = {
      // DNS 解析时间
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP 连接时间
      tcp: timing.connectEnd - timing.connectStart,
      // 请求响应时间
      request: timing.responseEnd - timing.requestStart,
      // DOM 解析时间
      domParse: timing.domComplete - timing.domInteractive,
      // 页面完全加载时间
      loadComplete: timing.loadEventEnd - timing.navigationStart
    }

    trackEvent({
      event: 'page_performance',
      params: metrics,
      category: 'performance'
    })
  }
  // #endif
}
```

### 接口性能监控

```typescript
// 在 useHttp 中添加性能监控
const requestWithMetrics = async (url: string, options: any) => {
  const startTime = Date.now()

  try {
    const response = await request(url, options)
    const duration = Date.now() - startTime

    // 上报接口性能
    trackEvent({
      event: 'api_performance',
      params: {
        url,
        method: options.method,
        duration,
        status: 'success'
      },
      category: 'performance'
    })

    return response
  } catch (error) {
    const duration = Date.now() - startTime

    // 上报接口错误
    trackEvent({
      event: 'api_error',
      params: {
        url,
        method: options.method,
        duration,
        error: error.message
      },
      category: 'error'
    })

    throw error
  }
}
```

## 错误监控

### 全局错误捕获

```typescript
// main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // Vue 错误处理
  app.config.errorHandler = (err, vm, info) => {
    trackEvent({
      event: 'vue_error',
      params: {
        message: err.message,
        stack: err.stack,
        info,
        page: getCurrentPages().pop()?.route
      },
      category: 'error'
    })
  }

  return { app }
}

// 全局 JS 错误
// #ifdef H5
window.onerror = (message, source, lineno, colno, error) => {
  trackEvent({
    event: 'js_error',
    params: {
      message,
      source,
      lineno,
      colno,
      stack: error?.stack
    },
    category: 'error'
  })
}

// Promise 未处理错误
window.onunhandledrejection = (event) => {
  trackEvent({
    event: 'promise_error',
    params: {
      reason: event.reason?.message || String(event.reason)
    },
    category: 'error'
  })
}
// #endif
```

## 最佳实践

### 1. 统一事件命名

```typescript
// 事件命名规范
const EVENT_NAMES = {
  // 用户行为
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',

  // 商品相关
  PRODUCT_VIEW: 'product_view',
  PRODUCT_SHARE: 'product_share',
  ADD_TO_CART: 'add_to_cart',

  // 订单相关
  ORDER_CREATE: 'order_create',
  ORDER_PAY: 'order_pay',
  ORDER_CANCEL: 'order_cancel',

  // 搜索相关
  SEARCH: 'search',
  SEARCH_RESULT: 'search_result',

  // 页面相关
  PAGE_VIEW: 'page_view',
  PAGE_LEAVE: 'page_leave'
}
```

### 2. 避免过度埋点

```typescript
// ❌ 不推荐：过度埋点
const handleScroll = () => {
  // 每次滚动都上报，会产生大量数据
  track({ event: 'scroll', params: { position: scrollTop } })
}

// ✅ 推荐：节流上报
import { throttle } from 'lodash-es'

const handleScroll = throttle(() => {
  track({ event: 'scroll_milestone', params: { position: scrollTop } })
}, 5000) // 5秒最多上报一次
```

### 3. 用户隐私保护

```typescript
// 脱敏处理敏感信息
const trackUserAction = (action: string, userData: any) => {
  const sanitizedData = {
    ...userData,
    // 脱敏手机号
    phone: userData.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    // 不上报密码
    password: undefined,
    // 不上报身份证
    idCard: undefined
  }

  track({
    event: action,
    params: sanitizedData
  })
}
```

### 4. 离线数据缓存

```typescript
// 离线时缓存数据，在线后上报
const CACHE_KEY = 'analytics_cache'

const trackWithCache = async (data: any) => {
  try {
    // 尝试上报
    await reportToServer(data)
  } catch (error) {
    // 上报失败，缓存数据
    const cache = uni.getStorageSync(CACHE_KEY) || []
    cache.push(data)
    uni.setStorageSync(CACHE_KEY, cache)
  }
}

// 网络恢复时上报缓存数据
const flushCache = async () => {
  const cache = uni.getStorageSync(CACHE_KEY) || []
  if (cache.length === 0) return

  for (const data of cache) {
    try {
      await reportToServer(data)
    } catch (error) {
      // 上报失败，保留在缓存中
      break
    }
  }

  // 清除已上报的数据
  uni.removeStorageSync(CACHE_KEY)
}

// 监听网络状态
uni.onNetworkStatusChange((res) => {
  if (res.isConnected) {
    flushCache()
  }
})
```

## 常见问题

### 1. 统计数据不准确

**问题原因：**
- 事件重复上报
- 异步上报丢失

**解决方案：**

```typescript
// 使用防重机制
const reportedEvents = new Set()

const trackOnce = (eventKey: string, data: TrackEvent) => {
  if (reportedEvents.has(eventKey)) {
    return
  }
  reportedEvents.add(eventKey)
  trackEvent(data)
}

// 使用示例
trackOnce(`purchase_${orderId}`, {
  event: 'purchase',
  params: { orderId }
})
```

### 2. 页面停留时长统计不准

**问题原因：**
- 页面切换到后台未处理
- 页面被强制关闭

**解决方案：**

```typescript
// 监听应用状态
let lastActiveTime = Date.now()

uni.onAppHide(() => {
  // 应用切到后台，记录时间
  lastActiveTime = Date.now()
})

uni.onAppShow(() => {
  // 应用切回前台，计算后台时长
  const backgroundDuration = Date.now() - lastActiveTime

  // 如果后台时间过长，重新计算停留时长
  if (backgroundDuration > 30000) {
    enterTime = Date.now()
  }
})
```

### 3. 小程序审核被拒

**问题原因：**
- 收集了敏感用户信息
- 未声明数据使用目的

**解决方案：**

1. 在小程序后台配置数据收集声明
2. 提供隐私协议说明数据用途
3. 不收集敏感信息（位置、通讯录等）
4. 提供数据关闭选项

```typescript
// 检查用户是否同意数据收集
const checkAnalyticsConsent = () => {
  const consent = uni.getStorageSync('analytics_consent')
  return consent === true
}

// 只在用户同意后上报
const trackWithConsent = (data: TrackEvent) => {
  if (checkAnalyticsConsent()) {
    trackEvent(data)
  }
}
```
