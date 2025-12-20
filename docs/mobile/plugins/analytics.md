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

### 4. 数据量过大导致性能问题

**问题原因：**
- 高频事件未节流
- 同步上报阻塞主线程
- 数据包过大

**解决方案：**

```typescript
// 批量上报策略
class AnalyticsBatcher {
  private queue: any[] = []
  private timer: number | null = null
  private readonly batchSize = 10
  private readonly flushInterval = 5000

  add(event: any) {
    this.queue.push(event)

    // 达到批量大小立即发送
    if (this.queue.length >= this.batchSize) {
      this.flush()
      return
    }

    // 设置定时发送
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush()
      }, this.flushInterval)
    }
  }

  flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    // 批量发送
    this.sendBatch(events)
  }

  private async sendBatch(events: any[]) {
    try {
      await uni.request({
        url: '/api/analytics/batch',
        method: 'POST',
        data: { events }
      })
    } catch (error) {
      // 发送失败，重新加入队列
      this.queue.unshift(...events)
    }
  }
}

const batcher = new AnalyticsBatcher()

export const trackEventBatched = (data: TrackEvent) => {
  batcher.add({
    ...data,
    timestamp: Date.now()
  })
}
```

### 5. 跨端数据统一问题

**问题原因：**
- 各平台用户标识不同
- 数据格式不一致
- 时区处理差异

**解决方案：**

```typescript
// 统一用户标识
const getUnifiedUserId = (): string => {
  // 已登录用户使用后端用户 ID
  const userStore = useUserStore()
  if (userStore.isLoggedIn) {
    return `user_${userStore.userId}`
  }

  // 未登录用户使用设备标识
  let deviceId = uni.getStorageSync('device_id')
  if (!deviceId) {
    deviceId = generateUUID()
    uni.setStorageSync('device_id', deviceId)
  }

  return `device_${deviceId}`
}

// 统一数据格式
interface UnifiedEvent {
  eventId: string
  eventName: string
  userId: string
  platform: string
  appVersion: string
  timestamp: number
  timezone: string
  properties: Record<string, any>
}

const normalizeEvent = (event: TrackEvent): UnifiedEvent => {
  return {
    eventId: generateUUID(),
    eventName: event.event,
    userId: getUnifiedUserId(),
    platform: getPlatform(),
    appVersion: getAppVersion(),
    timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    properties: event.params || {}
  }
}

const getPlatform = (): string => {
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  // #ifdef MP-ALIPAY
  return 'mp-alipay'
  // #endif
  // #ifdef H5
  return 'h5'
  // #endif
  // #ifdef APP-PLUS
  return 'app'
  // #endif
  return 'unknown'
}
```

## 高级功能

### 用户行为路径分析

追踪用户在应用中的完整行为路径：

```typescript
// composables/useUserPath.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface PathNode {
  page: string
  action?: string
  timestamp: number
  duration?: number
}

class UserPathTracker {
  private path: PathNode[] = []
  private currentNode: PathNode | null = null
  private readonly maxLength = 50

  enterPage(page: string) {
    // 记录上一个节点的停留时长
    if (this.currentNode) {
      this.currentNode.duration = Date.now() - this.currentNode.timestamp
    }

    // 创建新节点
    this.currentNode = {
      page,
      timestamp: Date.now()
    }

    this.path.push(this.currentNode)

    // 限制路径长度
    if (this.path.length > this.maxLength) {
      this.path.shift()
    }
  }

  recordAction(action: string) {
    if (this.currentNode) {
      this.currentNode.action = action
    }
  }

  getPath(): PathNode[] {
    return [...this.path]
  }

  getSessionSummary() {
    const pages = new Set(this.path.map(n => n.page))
    const totalDuration = this.path.reduce((sum, n) => sum + (n.duration || 0), 0)

    return {
      pageCount: pages.size,
      pathLength: this.path.length,
      totalDuration,
      entryPage: this.path[0]?.page,
      exitPage: this.path[this.path.length - 1]?.page
    }
  }

  clear() {
    this.path = []
    this.currentNode = null
  }
}

const pathTracker = new UserPathTracker()

export const useUserPath = () => {
  onMounted(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    pathTracker.enterPage('/' + currentPage.route)
  })

  return {
    recordAction: (action: string) => pathTracker.recordAction(action),
    getPath: () => pathTracker.getPath(),
    getSummary: () => pathTracker.getSessionSummary()
  }
}
```

### 会话管理

实现用户会话跟踪和管理：

```typescript
// utils/session.ts
interface Session {
  id: string
  startTime: number
  lastActiveTime: number
  pageViews: number
  events: number
}

class SessionManager {
  private session: Session | null = null
  private readonly sessionTimeout = 30 * 60 * 1000 // 30分钟超时

  getSession(): Session {
    const now = Date.now()

    // 检查现有会话是否过期
    if (this.session) {
      if (now - this.session.lastActiveTime > this.sessionTimeout) {
        // 会话过期，结束旧会话，创建新会话
        this.endSession()
        this.session = null
      }
    }

    // 创建新会话
    if (!this.session) {
      this.session = {
        id: this.generateSessionId(),
        startTime: now,
        lastActiveTime: now,
        pageViews: 0,
        events: 0
      }

      this.onSessionStart()
    }

    return this.session
  }

  updateActivity() {
    if (this.session) {
      this.session.lastActiveTime = Date.now()
    }
  }

  recordPageView() {
    const session = this.getSession()
    session.pageViews++
    this.updateActivity()
  }

  recordEvent() {
    const session = this.getSession()
    session.events++
    this.updateActivity()
  }

  endSession() {
    if (this.session) {
      const duration = Date.now() - this.session.startTime

      trackEvent({
        event: 'session_end',
        params: {
          sessionId: this.session.id,
          duration,
          pageViews: this.session.pageViews,
          events: this.session.events
        },
        category: 'session'
      })
    }
  }

  private onSessionStart() {
    if (this.session) {
      trackEvent({
        event: 'session_start',
        params: {
          sessionId: this.session.id
        },
        category: 'session'
      })
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const sessionManager = new SessionManager()
```

### A/B 测试集成

支持 A/B 测试的数据统计：

```typescript
// utils/abtest.ts
interface ABTestConfig {
  testId: string
  variants: string[]
  weights?: number[]
}

interface ABTestResult {
  testId: string
  variant: string
  assignedAt: number
}

class ABTestManager {
  private assignments: Map<string, ABTestResult> = new Map()
  private readonly storageKey = 'ab_test_assignments'

  constructor() {
    this.loadAssignments()
  }

  /**
   * 获取用户的测试分组
   */
  getVariant(config: ABTestConfig): string {
    const { testId, variants, weights } = config

    // 检查是否已分配
    const existing = this.assignments.get(testId)
    if (existing) {
      return existing.variant
    }

    // 分配新分组
    const variant = this.assignVariant(variants, weights)
    const result: ABTestResult = {
      testId,
      variant,
      assignedAt: Date.now()
    }

    this.assignments.set(testId, result)
    this.saveAssignments()

    // 上报分组信息
    trackEvent({
      event: 'ab_test_assign',
      params: {
        testId,
        variant
      },
      category: 'abtest'
    })

    return variant
  }

  /**
   * 上报测试转化
   */
  trackConversion(testId: string, conversionName: string, value?: number) {
    const assignment = this.assignments.get(testId)
    if (!assignment) return

    trackEvent({
      event: 'ab_test_conversion',
      params: {
        testId,
        variant: assignment.variant,
        conversionName,
        value
      },
      category: 'abtest'
    })
  }

  private assignVariant(variants: string[], weights?: number[]): string {
    if (!weights || weights.length !== variants.length) {
      // 均匀分配
      const index = Math.floor(Math.random() * variants.length)
      return variants[index]
    }

    // 按权重分配
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < variants.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return variants[i]
      }
    }

    return variants[variants.length - 1]
  }

  private loadAssignments() {
    try {
      const data = uni.getStorageSync(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.assignments = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.warn('加载 A/B 测试分配失败:', error)
    }
  }

  private saveAssignments() {
    try {
      const data = Object.fromEntries(this.assignments)
      uni.setStorageSync(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('保存 A/B 测试分配失败:', error)
    }
  }
}

export const abTestManager = new ABTestManager()

// 使用示例
export const useABTest = () => {
  return {
    /**
     * 获取测试分组
     */
    getVariant: (testId: string, variants: string[], weights?: number[]) => {
      return abTestManager.getVariant({ testId, variants, weights })
    },

    /**
     * 上报转化
     */
    trackConversion: (testId: string, conversionName: string, value?: number) => {
      abTestManager.trackConversion(testId, conversionName, value)
    }
  }
}
```

**A/B 测试使用示例：**

```vue
<template>
  <view class="page">
    <!-- 根据分组显示不同按钮 -->
    <wd-button
      v-if="buttonVariant === 'A'"
      type="primary"
      @click="handleClick"
    >
      立即购买
    </wd-button>

    <wd-button
      v-else
      type="success"
      size="large"
      @click="handleClick"
    >
      马上抢购
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useABTest } from '@/utils/abtest'

const { getVariant, trackConversion } = useABTest()

// 获取按钮文案测试分组
const buttonVariant = getVariant('button_text_test', ['A', 'B'])

const handleClick = () => {
  // 上报点击转化
  trackConversion('button_text_test', 'click')

  // 执行购买逻辑
}

// 购买成功后上报
const onPurchaseSuccess = (amount: number) => {
  trackConversion('button_text_test', 'purchase', amount)
}
</script>
```

### 热力图数据采集

采集用户点击和滚动数据，用于生成热力图：

```typescript
// utils/heatmap.ts
interface ClickPoint {
  x: number
  y: number
  target: string
  timestamp: number
}

interface ScrollData {
  maxScrollY: number
  viewportHeight: number
  pageHeight: number
  scrollDepth: number
}

class HeatmapCollector {
  private clicks: ClickPoint[] = []
  private scrollData: ScrollData | null = null
  private page: string = ''

  init(page: string) {
    this.page = page
    this.clicks = []
    this.scrollData = null

    // #ifdef H5
    this.bindEvents()
    // #endif
  }

  private bindEvents() {
    // #ifdef H5
    document.addEventListener('click', this.handleClick.bind(this))
    window.addEventListener('scroll', this.handleScroll.bind(this))
    // #endif
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement

    this.clicks.push({
      x: event.pageX,
      y: event.pageY,
      target: this.getSelector(target),
      timestamp: Date.now()
    })
  }

  private handleScroll = throttle(() => {
    // #ifdef H5
    const viewportHeight = window.innerHeight
    const pageHeight = document.documentElement.scrollHeight
    const scrollY = window.scrollY

    const maxScrollY = Math.max(this.scrollData?.maxScrollY || 0, scrollY)
    const scrollDepth = Math.round((maxScrollY + viewportHeight) / pageHeight * 100)

    this.scrollData = {
      maxScrollY,
      viewportHeight,
      pageHeight,
      scrollDepth: Math.min(scrollDepth, 100)
    }
    // #endif
  }, 500)

  private getSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      return `.${element.className.split(' ').join('.')}`
    }

    return element.tagName.toLowerCase()
  }

  report() {
    if (this.clicks.length === 0 && !this.scrollData) return

    trackEvent({
      event: 'heatmap_data',
      params: {
        page: this.page,
        clicks: this.clicks,
        scroll: this.scrollData
      },
      category: 'heatmap'
    })
  }

  destroy() {
    this.report()

    // #ifdef H5
    document.removeEventListener('click', this.handleClick.bind(this))
    window.removeEventListener('scroll', this.handleScroll)
    // #endif
  }
}

export const heatmapCollector = new HeatmapCollector()
```

### 实时用户监控（RUM）

实现实时用户监控和体验度量：

```typescript
// utils/rum.ts
interface RUMMetrics {
  // 核心 Web 指标
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte

  // 自定义指标
  pageLoadTime?: number
  domReadyTime?: number
  resourceLoadTime?: number
}

class RUMCollector {
  private metrics: RUMMetrics = {}

  init() {
    // #ifdef H5
    this.collectWebVitals()
    this.collectNavigationTiming()
    // #endif
  }

  private collectWebVitals() {
    // #ifdef H5
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.metrics.FCP = fcpEntry.startTime
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.metrics.LCP = lastEntry.startTime
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const firstEntry = entries[0] as PerformanceEventTiming
      if (firstEntry) {
        this.metrics.FID = firstEntry.processingStart - firstEntry.startTime
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      this.metrics.CLS = clsValue
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    // #endif
  }

  private collectNavigationTiming() {
    // #ifdef H5
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing

        this.metrics.TTFB = timing.responseStart - timing.navigationStart
        this.metrics.domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart
        this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart

        // 资源加载时间
        const resources = performance.getEntriesByType('resource')
        this.metrics.resourceLoadTime = resources.reduce((max, r) => {
          return Math.max(max, r.responseEnd)
        }, 0)

        this.report()
      }, 0)
    })
    // #endif
  }

  report() {
    trackEvent({
      event: 'rum_metrics',
      params: {
        ...this.metrics,
        page: window.location.pathname,
        userAgent: navigator.userAgent
      },
      category: 'performance'
    })
  }

  getMetrics(): RUMMetrics {
    return { ...this.metrics }
  }
}

export const rumCollector = new RUMCollector()
```

### 自定义指标收集

支持业务自定义指标的收集和上报：

```typescript
// utils/customMetrics.ts
interface MetricValue {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  timestamp: number
}

class CustomMetricsCollector {
  private metrics: MetricValue[] = []
  private timers: Map<string, number> = new Map()

  /**
   * 记录数值指标
   */
  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      unit: 'gauge',
      tags,
      timestamp: Date.now()
    })
  }

  /**
   * 记录计数器
   */
  counter(name: string, increment: number = 1, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value: increment,
      unit: 'counter',
      tags,
      timestamp: Date.now()
    })
  }

  /**
   * 开始计时
   */
  startTimer(name: string) {
    this.timers.set(name, Date.now())
  }

  /**
   * 结束计时并记录
   */
  endTimer(name: string, tags?: Record<string, string>) {
    const startTime = this.timers.get(name)
    if (startTime) {
      const duration = Date.now() - startTime
      this.metrics.push({
        name,
        value: duration,
        unit: 'ms',
        tags,
        timestamp: Date.now()
      })
      this.timers.delete(name)
    }
  }

  /**
   * 上报所有指标
   */
  flush() {
    if (this.metrics.length === 0) return

    trackEvent({
      event: 'custom_metrics',
      params: {
        metrics: this.metrics
      },
      category: 'metrics'
    })

    this.metrics = []
  }
}

export const metricsCollector = new CustomMetricsCollector()

// 使用示例
export const useMetrics = () => {
  return {
    gauge: metricsCollector.gauge.bind(metricsCollector),
    counter: metricsCollector.counter.bind(metricsCollector),
    startTimer: metricsCollector.startTimer.bind(metricsCollector),
    endTimer: metricsCollector.endTimer.bind(metricsCollector),
    flush: metricsCollector.flush.bind(metricsCollector)
  }
}
```

**业务指标使用示例：**

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useMetrics } from '@/utils/customMetrics'

const { gauge, counter, startTimer, endTimer } = useMetrics()

// 记录商品浏览量
counter('product_view', 1, { productId: '123', category: 'electronics' })

// 记录库存数量
gauge('inventory_count', 150, { productId: '123' })

// 记录接口耗时
const loadProduct = async () => {
  startTimer('load_product_api')

  try {
    const product = await fetchProduct('123')
    endTimer('load_product_api', { status: 'success' })
    return product
  } catch (error) {
    endTimer('load_product_api', { status: 'error' })
    throw error
  }
}

onMounted(() => {
  loadProduct()
})
</script>
```

## 数据可视化

### 数据导出格式

```typescript
// utils/export.ts
interface AnalyticsExport {
  version: string
  exportedAt: string
  period: {
    start: string
    end: string
  }
  summary: {
    totalEvents: number
    totalPageViews: number
    uniqueUsers: number
    avgSessionDuration: number
  }
  events: Array<{
    name: string
    count: number
    uniqueUsers: number
  }>
  pages: Array<{
    path: string
    views: number
    avgDuration: number
    bounceRate: number
  }>
}

export const exportAnalyticsData = async (
  startDate: Date,
  endDate: Date
): Promise<AnalyticsExport> => {
  const response = await uni.request({
    url: '/api/analytics/export',
    method: 'GET',
    data: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  })

  return response.data as AnalyticsExport
}
```

### 实时数据推送

使用 WebSocket 实现实时数据推送：

```typescript
// utils/realtimeAnalytics.ts
import { useWebSocket } from '@/composables/useWebSocket'

interface RealtimeMetrics {
  activeUsers: number
  pageViews: number
  events: number
  errorRate: number
}

export const useRealtimeAnalytics = () => {
  const metrics = ref<RealtimeMetrics>({
    activeUsers: 0,
    pageViews: 0,
    events: 0,
    errorRate: 0
  })

  const { connect, onMessage, disconnect } = useWebSocket({
    url: 'wss://api.example.com/analytics/realtime',
    autoConnect: false
  })

  onMessage((data) => {
    if (data.type === 'metrics_update') {
      metrics.value = data.metrics
    }
  })

  const startMonitoring = () => {
    connect()
  }

  const stopMonitoring = () => {
    disconnect()
  }

  return {
    metrics: readonly(metrics),
    startMonitoring,
    stopMonitoring
  }
}
```

## 完整配置示例

### 统计服务初始化

```typescript
// plugins/analytics.ts
import { App } from 'vue'
import { trackEvent, trackPageView } from '@/utils/analytics'
import { sessionManager } from '@/utils/session'
import { rumCollector } from '@/utils/rum'
import { metricsCollector } from '@/utils/customMetrics'

interface AnalyticsPluginOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 是否启用 RUM */
  enableRUM?: boolean
  /** 是否启用会话管理 */
  enableSession?: boolean
  /** 自定义上报地址 */
  reportUrl?: string
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 是否开启调试模式 */
  debug?: boolean
}

const defaultOptions: AnalyticsPluginOptions = {
  enabled: true,
  enableRUM: true,
  enableSession: true,
  sampleRate: 1,
  debug: false
}

export const analyticsPlugin = {
  install(app: App, options: AnalyticsPluginOptions = {}) {
    const config = { ...defaultOptions, ...options }

    if (!config.enabled) return

    // 采样检查
    if (Math.random() > (config.sampleRate || 1)) {
      console.log('[Analytics] 采样跳过')
      return
    }

    // 初始化 RUM
    if (config.enableRUM) {
      rumCollector.init()
    }

    // 全局错误处理
    app.config.errorHandler = (err, vm, info) => {
      trackEvent({
        event: 'vue_error',
        params: {
          message: (err as Error).message,
          stack: (err as Error).stack,
          info
        },
        category: 'error'
      })

      if (config.debug) {
        console.error('[Analytics] Vue Error:', err)
      }
    }

    // 提供全局方法
    app.config.globalProperties.$track = trackEvent
    app.config.globalProperties.$trackPage = trackPageView

    // 页面离开时上报
    // #ifdef H5
    window.addEventListener('beforeunload', () => {
      if (config.enableSession) {
        sessionManager.endSession()
      }
      metricsCollector.flush()
    })
    // #endif

    if (config.debug) {
      console.log('[Analytics] 初始化完成', config)
    }
  }
}

// 在 main.ts 中使用
// app.use(analyticsPlugin, {
//   enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
//   enableRUM: true,
//   sampleRate: 0.5,
//   debug: import.meta.env.DEV
// })
```

### TypeScript 类型声明

```typescript
// types/analytics.d.ts
declare global {
  interface Window {
    _hmt?: Array<[string, ...any[]]>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $track: typeof import('@/utils/analytics').trackEvent
    $trackPage: typeof import('@/utils/analytics').trackPageView
  }
}

export interface TrackEventOptions {
  /** 事件名称 */
  event: string
  /** 事件参数 */
  params?: Record<string, any>
  /** 事件分类 */
  category?: string
}

export interface PageViewOptions {
  /** 页面路径 */
  path: string
  /** 页面标题 */
  title?: string
  /** 页面参数 */
  query?: Record<string, any>
}

export interface AnalyticsConfig {
  /** 是否启用统计 */
  enabled: boolean
  /** 上报地址 */
  reportUrl: string
  /** 采样率 */
  sampleRate: number
  /** 批量上报阈值 */
  batchSize: number
  /** 上报间隔（毫秒） */
  flushInterval: number
}
```

## 总结

数据统计插件提供了完整的数据采集和分析能力：

| 功能 | 说明 |
|------|------|
| 多平台支持 | 微信小程序、支付宝、H5、App 全端适配 |
| 事件埋点 | 自定义事件上报，支持事件参数和分类 |
| 页面统计 | 自动统计页面访问和停留时长 |
| 性能监控 | RUM 指标、接口性能、资源加载 |
| 错误上报 | JS 错误、Promise 错误、Vue 错误自动捕获 |
| 用户行为 | 行为路径、会话管理、热力图数据 |
| A/B 测试 | 分组分配、转化跟踪 |
| 数据缓存 | 离线缓存、断网重传 |
| 隐私保护 | 数据脱敏、用户授权 |

**使用建议：**

1. **统一封装** - 使用 `useAnalytics` 组合函数，统一管理统计逻辑
2. **规范命名** - 制定事件命名规范，便于后续分析
3. **适度埋点** - 避免过度埋点影响性能
4. **隐私合规** - 遵守隐私法规，获取用户授权
5. **批量上报** - 使用批量上报减少网络请求
6. **离线缓存** - 缓存离线数据，网络恢复后重传
