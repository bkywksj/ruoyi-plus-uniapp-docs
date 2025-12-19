# platform 平台检测

## 介绍

`platform` 是 UniApp 多端平台检测工具，提供运行环境判断和平台特性检测功能。该工具利用 UniApp 的条件编译机制，在编译时确定运行平台，同时提供运行时的环境检测能力。

**核心特性:**

- **平台常量** - 编译时确定的平台标识常量，零运行时开销
- **环境检测** - 运行时检测微信、支付宝等特定环境
- **开发工具识别** - 判断是否在开发者工具中运行
- **支付环境检测** - 检测支付相关的 URL 和 JSBridge
- **安全访问** - 兼容所有平台的安全访问工具函数
- **类型安全** - 完整的 TypeScript 类型支持

## 架构概览

### 平台检测体系架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Platform 平台检测体系                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    编译时常量层 (Compile-Time)                    │   │
│  │                                                                   │   │
│  │   __UNI_PLATFORM__ ──┬── 'app'        → isApp = true             │   │
│  │                      ├── 'mp-weixin'  → isMpWeixin = true        │   │
│  │                      ├── 'mp-alipay'  → isMpAlipay = true        │   │
│  │                      ├── 'mp-toutiao' → isMpToutiao = true       │   │
│  │                      └── 'h5'         → (需要运行时判断)          │   │
│  │                                                                   │   │
│  │   特点: 编译时确定，Tree-shaking，零运行时开销                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    运行时检测层 (Runtime Detection)              │   │
│  │                                                                   │   │
│  │   H5 平台细分:                                                    │   │
│  │   ┌─────────────────────────────────────────────────────────┐   │   │
│  │   │  navigator.userAgent 检测                                │   │   │
│  │   │                                                          │   │   │
│  │   │  'micromessenger' + !'miniprogram'                       │   │   │
│  │   │           → isWechatOfficialH5 = true                    │   │   │
│  │   │                                                          │   │   │
│  │   │  'alipayclient'                                          │   │   │
│  │   │           → isAlipayOfficialH5 = true                    │   │   │
│  │   │                                                          │   │   │
│  │   │  其他情况                                                 │   │   │
│  │   │           → isH5 = true (普通浏览器)                      │   │   │
│  │   └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  │   功能检测:                                                       │   │
│  │   ┌─────────────────────────────────────────────────────────┐   │   │
│  │   │  isWechatEnvironment()  - 是否在微信环境                 │   │   │
│  │   │  isAlipayEnvironment()  - 是否在支付宝环境               │   │   │
│  │   │  isInDevTools()         - 是否在开发者工具               │   │   │
│  │   │  hasWeixinJSBridge()    - 微信 JSBridge 是否可用         │   │   │
│  │   └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    安全访问层 (Safe Access)                       │   │
│  │                                                                   │   │
│  │   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐   │   │
│  │   │safeGetUserAgent│    │safeGetLocation│    │safeGetUrlParams│   │   │
│  │   │               │    │               │    │               │   │   │
│  │   │ 小程序: ''    │    │ 小程序: {}    │    │ 小程序: null  │   │   │
│  │   │ App: ''       │    │ App: {}       │    │ App: null     │   │   │
│  │   │ H5: UA字符串  │    │ H5: location  │    │ H5: 参数值    │   │   │
│  │   └───────────────┘    └───────────────┘    └───────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 平台判断决策流程

```
                              ┌──────────────────┐
                              │  应用启动/请求   │
                              └────────┬─────────┘
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │  __UNI_PLATFORM__ 判断  │
                         └─────────────┬───────────┘
                                       │
           ┌───────────┬───────────────┼───────────────┬───────────┐
           │           │               │               │           │
           ▼           ▼               ▼               ▼           ▼
      ┌────────┐ ┌──────────┐   ┌──────────┐   ┌──────────┐ ┌────────┐
      │  app   │ │mp-weixin │   │mp-alipay │   │mp-toutiao│ │   h5   │
      └────┬───┘ └────┬─────┘   └────┬─────┘   └────┬─────┘ └────┬───┘
           │          │              │              │            │
           ▼          ▼              ▼              ▼            ▼
      isApp=true  isMpWeixin   isMpAlipay     isMpToutiao   进入H5判断
      isMp=false   =true        =true          =true           │
                  isMp=true    isMp=true      isMp=true        │
                                                               ▼
                                              ┌─────────────────────────┐
                                              │   获取 User Agent       │
                                              │   safeGetUserAgent()    │
                                              └────────────┬────────────┘
                                                           │
                                     ┌─────────────────────┼─────────────────────┐
                                     │                     │                     │
                                     ▼                     ▼                     ▼
                            ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
                            │ micromessenger │   │  alipayclient  │   │    其他情况    │
                            │ + !miniprogram │   │                │   │                │
                            └───────┬────────┘   └───────┬────────┘   └───────┬────────┘
                                    │                    │                    │
                                    ▼                    ▼                    ▼
                           isWechatOfficialH5   isAlipayOfficialH5       isH5=true
                              =true                =true              (普通浏览器)
```

### 环境检测函数调用流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    isWechatEnvironment() 调用流程                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  调用 isWechatEnvironment()                                             │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                │
│  │ isMpWeixin === true │──── Yes ────→ return true                      │
│  └─────────┬───────────┘              (微信小程序)                      │
│            │                                                             │
│           No                                                             │
│            │                                                             │
│            ▼                                                             │
│  ┌─────────────────────────────┐                                        │
│  │ __UNI_PLATFORM__ === 'h5' │──── No ────→ return false               │
│  └─────────┬───────────────────┘            (App环境)                   │
│            │                                                             │
│           Yes                                                            │
│            │                                                             │
│            ▼                                                             │
│  ┌─────────────────────────────┐                                        │
│  │ safeGetUserAgent()          │                                        │
│  │ .includes('micromessenger') │                                        │
│  └─────────┬───────────────────┘                                        │
│            │                                                             │
│     ┌──────┴──────┐                                                     │
│     │             │                                                     │
│    Yes           No                                                     │
│     │             │                                                     │
│     ▼             ▼                                                     │
│ return true  return false                                               │
│ (微信浏览器)  (普通浏览器)                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

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
  isH5,
  isWechatOfficialH5,
  isAlipayOfficialH5
} from '@/utils/platform'

// platform: 当前平台标识字符串
console.log(platform) // 'app' | 'mp-weixin' | 'mp-alipay' | 'h5' | ...

// 各平台布尔值常量
console.log(isApp)             // true - App 平台
console.log(isMp)              // true - 小程序平台（任意）
console.log(isMpWeixin)        // true - 微信小程序
console.log(isMpAlipay)        // true - 支付宝小程序
console.log(isMpToutiao)       // true - 头条/抖音小程序
console.log(isH5)              // true - H5 网页端（普通浏览器）
console.log(isWechatOfficialH5) // true - 微信公众号H5
console.log(isAlipayOfficialH5) // true - 支付宝生活号H5
```

### 平台常量说明

| 常量 | 类型 | 说明 | 判断条件 |
|------|------|------|----------|
| `platform` | `string` | 当前平台标识字符串 | `__UNI_PLATFORM__` |
| `isApp` | `boolean` | 是否 App 平台 | `platform === 'app'` |
| `isMp` | `boolean` | 是否小程序平台（任意） | `platform.startsWith('mp-')` |
| `isMpWeixin` | `boolean` | 是否微信小程序 | `platform.startsWith('mp-weixin')` |
| `isMpAlipay` | `boolean` | 是否支付宝小程序 | `platform.startsWith('mp-alipay')` |
| `isMpToutiao` | `boolean` | 是否头条/抖音小程序 | `platform.startsWith('mp-toutiao')` |
| `isH5` | `boolean` | 是否普通 H5 浏览器 | H5平台且非微信/支付宝容器 |
| `isWechatOfficialH5` | `boolean` | 是否微信公众号 H5 | H5平台且UA含micromessenger |
| `isAlipayOfficialH5` | `boolean` | 是否支付宝生活号 H5 | H5平台且UA含alipayclient |

### H5 平台细分说明

```
                      H5 平台 (__UNI_PLATFORM__ === 'h5')
                                    │
                                    ▼
                    ┌───────────────────────────────────┐
                    │      检查 navigator.userAgent     │
                    └───────────────┬───────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│  micromessenger   │     │   alipayclient    │     │     其他情况       │
│ + !miniprogram    │     │                   │     │                   │
└────────┬──────────┘     └────────┬──────────┘     └────────┬──────────┘
         │                         │                         │
         ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│isWechatOfficialH5 │     │isAlipayOfficialH5 │     │      isH5         │
│     = true        │     │     = true        │     │     = true        │
│                   │     │                   │     │                   │
│ 微信公众号内打开  │     │ 支付宝生活号打开   │     │  普通浏览器打开   │
│ 可使用微信JSSDK   │     │ 可使用支付宝JSSDK │     │  无特殊能力       │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

### 条件编译原理

平台常量基于 UniApp 的 `__UNI_PLATFORM__` 全局变量，在编译时确定值：

```typescript
// 源码实现
export const platform = __UNI_PLATFORM__
export const isApp = __UNI_PLATFORM__ === 'app'
export const isMp = __UNI_PLATFORM__.startsWith('mp-')
export const isMpWeixin = __UNI_PLATFORM__.startsWith('mp-weixin')
export const isMpAlipay = __UNI_PLATFORM__.startsWith('mp-alipay')
export const isMpToutiao = __UNI_PLATFORM__.startsWith('mp-toutiao')
```

**编译时替换示例：**

```typescript
// 源代码
if (isApp) {
  console.log('App 平台')
}

// 编译为微信小程序后
if (false) {  // 被直接替换为 false
  console.log('App 平台')
}
// 由于是 false，这段代码会被 Tree-shaking 移除

// 编译为 App 后
if (true) {  // 被直接替换为 true
  console.log('App 平台')
}
```

## 安全访问工具

### safeGetUserAgent

安全获取 User Agent 字符串，兼容所有平台：

```typescript
/**
 * 安全的 User Agent 检测 - 兼容所有平台
 */
const safeGetUserAgent = (): string => {
  // 小程序环境没有 navigator，返回空字符串
  if (isMp || isApp) {
    return ''
  }

  // H5 环境才获取 navigator.userAgent
  try {
    return typeof navigator !== 'undefined' && navigator.userAgent
      ? navigator.userAgent.toLowerCase()
      : ''
  } catch (error) {
    console.warn('获取 userAgent 失败:', error)
    return ''
  }
}
```

**使用场景：**

```typescript
// 检测特定浏览器
const ua = safeGetUserAgent()

// 检测 iOS Safari
const isIOSSafari = ua.includes('iphone') && ua.includes('safari') && !ua.includes('crios')

// 检测 Chrome
const isChrome = ua.includes('chrome') && !ua.includes('edg')

// 检测移动端
const isMobileUA = /mobile|android|iphone|ipad|ipod/.test(ua)
```

### safeGetLocation

安全获取浏览器 location 对象，兼容所有平台：

```typescript
/**
 * 安全的 location 检测 - 兼容所有平台
 */
const safeGetLocation = () => {
  // 小程序和 APP 环境没有 window.location
  if (isMp || isApp) {
    return {
      hostname: '',
      protocol: '',
      href: '',
      search: '',
      pathname: '',
    }
  }

  // H5 环境才获取 window.location
  try {
    if (typeof window !== 'undefined' && window.location) {
      return window.location
    }
  } catch (error) {
    console.warn('获取 location 失败:', error)
  }

  return {
    hostname: '',
    protocol: '',
    href: '',
    search: '',
    pathname: '',
  }
}
```

**使用场景：**

```typescript
// 获取当前 URL 信息
const location = safeGetLocation()

console.log(location.hostname)  // 'example.com'
console.log(location.pathname)  // '/pages/home'
console.log(location.search)    // '?id=123&type=1'
console.log(location.protocol)  // 'https:'
console.log(location.href)      // 完整 URL
```

### safeGetUrlParams

安全获取 URL 参数，兼容所有平台：

```typescript
/**
 * 安全的 URL 参数获取 - 兼容所有平台
 */
export const safeGetUrlParams = (key: string): string | null => {
  // 小程序和 APP 环境没有 URL 参数概念
  if (isMp || isApp) {
    return null
  }

  // H5 环境才获取 URL 参数
  try {
    const location = safeGetLocation()
    if (location.search) {
      const urlParams = new URLSearchParams(location.search)
      return urlParams.get(key)
    }
  } catch (error) {
    console.warn('获取 URL 参数失败:', error)
  }

  return null
}
```

**使用场景：**

```typescript
// 获取授权回调参数
const code = safeGetUrlParams('code')    // OAuth 授权码
const state = safeGetUrlParams('state')  // 状态参数
const from = safeGetUrlParams('from')    // 来源标识

if (code && state) {
  // 处理授权回调
  handleOAuthCallback(code, state)
}
```

## 环境检测

### 微信环境检测

检测当前是否运行在微信环境中（包含微信小程序和微信浏览器）：

```typescript
import { isWechatEnvironment } from '@/utils/platform'

// 检测微信环境
if (isWechatEnvironment()) {
  console.log('当前在微信环境中')
  // 可以使用微信相关能力
} else {
  console.log('非微信环境')
}
```

**源码实现：**

```typescript
/**
 * 检查是否在微信环境中
 */
export const isWechatEnvironment = (): boolean => {
  // 微信小程序
  if (isMpWeixin) {
    return true
  }

  // H5 环境检查 User Agent
  if (__UNI_PLATFORM__ === 'h5') {
    const ua = safeGetUserAgent()
    return ua.includes('micromessenger')
  }

  // APP 环境暂时返回 false
  return false
}
```

**检测原理说明：**

| 环境 | 检测方法 | 返回值 |
|------|----------|--------|
| 微信小程序 | `isMpWeixin === true` | `true` |
| 微信公众号H5 | UA 含 `micromessenger` | `true` |
| 微信内置浏览器 | UA 含 `micromessenger` | `true` |
| App 内嵌微信 | 需要额外配置 | `false` |
| 其他环境 | - | `false` |

### 支付宝环境检测

检测当前是否运行在支付宝环境中：

```typescript
import { isAlipayEnvironment } from '@/utils/platform'

// 检测支付宝环境
if (isAlipayEnvironment()) {
  console.log('当前在支付宝环境中')
  // 可以使用支付宝相关能力
}
```

**源码实现：**

```typescript
/**
 * 检查是否在支付宝环境中 - 兼容所有平台
 */
export const isAlipayEnvironment = (): boolean => {
  // 支付宝小程序
  if (isMpAlipay) {
    return true
  }

  // H5 环境检查 User Agent
  if (__UNI_PLATFORM__ === 'h5') {
    const ua = safeGetUserAgent()
    return ua.includes('alipayclient')
  }

  return false
}
```

### H5 内嵌环境判断

判断 H5 是否运行在微信公众号或支付宝生活号中：

```typescript
import { isWechatOfficialH5, isAlipayOfficialH5, isH5 } from '@/utils/platform'

// 微信公众号 H5
if (isWechatOfficialH5) {
  console.log('微信公众号网页')
  // 使用微信网页授权
  // 可调用微信 JSSDK
}

// 支付宝生活号 H5
if (isAlipayOfficialH5) {
  console.log('支付宝生活号网页')
  // 使用支付宝网页授权
  // 可调用支付宝 JSSDK
}

// 普通 H5 浏览器
if (isH5) {
  console.log('普通浏览器')
  // 无特殊能力
}
```

**源码实现：**

```typescript
// 判断是否在微信公众号内的H5
export const isWechatOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false

  const ua = safeGetUserAgent()
  // 包含 micromessenger 但不包含 miniprogram（排除小程序 webview）
  return ua.includes('micromessenger') && !ua.includes('miniprogram')
})()

// 判断是否在支付宝内的H5
export const isAlipayOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false

  const ua = safeGetUserAgent()
  return ua.includes('alipayclient')
})()

// 普通H5 (排除在微信、支付宝等容器内的H5)
export const isH5 = __UNI_PLATFORM__ === 'h5' && !isWechatOfficialH5 && !isAlipayOfficialH5
```

**三种 H5 环境对比：**

| 环境 | 常量 | User Agent 特征 | 可用能力 |
|------|------|-----------------|----------|
| 微信公众号H5 | `isWechatOfficialH5` | `micromessenger` + `!miniprogram` | 微信JSSDK、网页授权 |
| 支付宝生活号H5 | `isAlipayOfficialH5` | `alipayclient` | 支付宝JSSDK、网页授权 |
| 普通浏览器H5 | `isH5` | 其他 | 标准Web API |

## 开发工具检测

### 判断开发者工具

检测是否在小程序开发者工具或浏览器开发者工具中运行：

```typescript
import { isInDevTools } from '@/utils/platform'

// 检测开发者工具
if (isInDevTools()) {
  console.log('当前在开发者工具中运行')
  // 可以显示调试信息
  // 某些功能可能受限
} else {
  console.log('当前在真机或生产环境中')
}
```

**源码实现：**

```typescript
/**
 * 检查是否在开发环境或微信开发者工具中
 */
export const isInDevTools = (): boolean => {
  // 小程序环境的开发者工具判断
  if (isMp) {
    try {
      // #ifdef MP
      const accountInfo = uni.getAccountInfoSync()
      return accountInfo.miniProgram.envVersion === 'develop'
      // #endif
    } catch (error) {
      console.warn('获取小程序环境信息失败:', error)
    }
    return false
  }

  // APP 环境通常没有开发者工具的概念
  if (isApp) {
    return false
  }

  // H5 环境的开发者工具判断 - 主要检测微信开发者工具
  if (__UNI_PLATFORM__ === 'h5') {
    const ua = safeGetUserAgent()

    // 检查是否在微信开发者工具中
    if (ua.includes('wechatdevtools')) {
      return true
    }

    // 检查是否在支付宝开发者工具中
    if (ua.includes('alipaydevtools')) {
      return true
    }
  }

  return false
}
```

**检测方式说明：**

| 平台 | 检测方法 | 说明 |
|------|----------|------|
| 小程序 | `uni.getAccountInfoSync().miniProgram.envVersion` | `develop`/`trial`/`release` |
| H5 | UA 含 `wechatdevtools` | 微信开发者工具 |
| H5 | UA 含 `alipaydevtools` | 支付宝开发者工具 |
| App | - | 无开发者工具概念，返回 `false` |

**使用场景：**

```typescript
import { isInDevTools, platform } from '@/utils/platform'

// 场景1: 开发环境显示调试面板
const showDebugPanel = ref(false)

onMounted(() => {
  if (isInDevTools()) {
    showDebugPanel.value = true
    console.log('当前平台:', platform)
    console.log('开发环境已启用调试面板')
  }
})

// 场景2: 开发环境跳过某些验证
const validatePayment = () => {
  if (isInDevTools()) {
    console.warn('开发环境跳过支付验证')
    return true
  }
  // 真实环境执行完整验证
  return performFullValidation()
}

// 场景3: 开发环境使用模拟数据
const fetchData = async () => {
  if (isInDevTools()) {
    return mockData
  }
  return await api.getData()
}
```

## 支付环境检测

### 检测支付授权目录

判断当前 URL 是否符合支付授权目录配置要求：

```typescript
import { checkPaymentUrl } from '@/utils/platform'

// 检测支付 URL 配置
const result = checkPaymentUrl()
console.log(result.isValid)     // 是否有效
console.log(result.currentUrl)  // 当前 URL
console.log(result.suggestion)  // 配置建议
```

**源码实现：**

```typescript
/**
 * 检查当前页面URL是否符合支付授权目录格式 - 仅 H5 环境有效
 */
export const checkPaymentUrl = (): { isValid: boolean; currentUrl: string; suggestion: string } => {
  // 非 H5 环境直接返回有效
  if (__UNI_PLATFORM__ !== 'h5') {
    return {
      isValid: true,
      currentUrl: '',
      suggestion: '当前为非H5环境，无需配置支付授权目录'
    }
  }

  const location = safeGetLocation()
  const currentUrl = location.href
  const { protocol, hostname, pathname } = location

  // 获取当前页面的目录（不包括文件名）
  const directory = pathname.substring(0, pathname.lastIndexOf('/') + 1) || '/'
  const baseUrl = `${protocol}//${hostname}`
  const fullDirectoryUrl = `${baseUrl}${directory}`

  let suggestion = ''

  if (isInDevTools()) {
    suggestion = `当前在开发者工具中 (${currentUrl})，请配置线上环境的支付授权目录`
  } else {
    suggestion = `请在微信商户平台配置以下任意一种授权目录：
1. 顶级域名（推荐）: ${baseUrl}/
2. 具体目录: ${fullDirectoryUrl}

配置路径：微信支付商户平台 → 产品中心 → 开发配置 → 支付配置 → JSAPI支付授权目录`
  }

  return {
    isValid: !isInDevTools(),
    currentUrl,
    suggestion,
  }
}
```

**返回值说明：**

```typescript
interface PaymentUrlResult {
  /** 是否有效（开发者工具中总是无效） */
  isValid: boolean
  /** 当前完整 URL */
  currentUrl: string
  /** 配置建议文本 */
  suggestion: string
}
```

### 检测微信 JSBridge

判断微信 JSBridge 是否可用：

```typescript
import { hasWeixinJSBridge } from '@/utils/platform'

// 检测微信 JSBridge
if (hasWeixinJSBridge()) {
  console.log('微信 JSBridge 可用')
  // 可以调用 wx.chooseWXPay 等
  invokeWeixinPay()
} else {
  console.log('微信 JSBridge 不可用')
  // 等待 JSBridge 注入
  document.addEventListener('WeixinJSBridgeReady', () => {
    invokeWeixinPay()
  })
}
```

**源码实现：**

```typescript
/**
 * 安全的 WeixinJSBridge 检测 - 仅 H5 环境有效
 */
export const hasWeixinJSBridge = (): boolean => {
  // 非 H5 环境直接返回 false
  if (__UNI_PLATFORM__ !== 'h5') {
    return false
  }

  try {
    return typeof window !== 'undefined' &&
           typeof window.WeixinJSBridge !== 'undefined'
  } catch (error) {
    return false
  }
}
```

**微信支付调用示例：**

```typescript
import { hasWeixinJSBridge, isWechatOfficialH5 } from '@/utils/platform'

/**
 * 微信 JSAPI 支付
 */
const weixinJSAPIPay = (payParams: WeixinPayParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 非微信环境
    if (!isWechatOfficialH5) {
      reject(new Error('非微信公众号环境，无法使用 JSAPI 支付'))
      return
    }

    const invokePayment = () => {
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: payParams.appId,
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType,
          paySign: payParams.paySign,
        },
        (res: { err_msg: string }) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            resolve()
          } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
            reject(new Error('用户取消支付'))
          } else {
            reject(new Error('支付失败: ' + res.err_msg))
          }
        }
      )
    }

    // 检查 JSBridge 是否就绪
    if (hasWeixinJSBridge()) {
      invokePayment()
    } else {
      // 等待 JSBridge 注入
      document.addEventListener('WeixinJSBridgeReady', invokePayment, false)
    }
  })
}
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
import {
  isMpWeixin,
  isMpAlipay,
  isH5,
  isApp,
  isWechatOfficialH5,
  isAlipayOfficialH5
} from '@/utils/platform'

interface LoginMethod {
  type: string
  name: string
  icon: string
  available: boolean
}

// 获取可用的登录方式
const getLoginMethods = (): LoginMethod[] => {
  const methods: LoginMethod[] = []

  // 微信小程序
  if (isMpWeixin) {
    methods.push({
      type: 'wechat-miniapp',
      name: '微信快捷登录',
      icon: 'wechat',
      available: true
    })
  }

  // 支付宝小程序
  if (isMpAlipay) {
    methods.push({
      type: 'alipay-miniapp',
      name: '支付宝快捷登录',
      icon: 'alipay',
      available: true
    })
  }

  // App 平台
  if (isApp) {
    methods.push(
      {
        type: 'wechat-app',
        name: '微信登录',
        icon: 'wechat',
        available: true
      },
      {
        type: 'alipay-app',
        name: '支付宝登录',
        icon: 'alipay',
        available: true
      },
      {
        type: 'apple',
        name: 'Apple 登录',
        icon: 'apple',
        available: uni.getSystemInfoSync().platform === 'ios'
      }
    )
  }

  // H5 平台
  if (isH5 || isWechatOfficialH5 || isAlipayOfficialH5) {
    // 微信公众号
    if (isWechatOfficialH5) {
      methods.push({
        type: 'wechat-h5',
        name: '微信授权登录',
        icon: 'wechat',
        available: true
      })
    }

    // 支付宝生活号
    if (isAlipayOfficialH5) {
      methods.push({
        type: 'alipay-h5',
        name: '支付宝授权登录',
        icon: 'alipay',
        available: true
      })
    }

    // 通用登录方式
    methods.push(
      {
        type: 'phone',
        name: '手机号登录',
        icon: 'phone',
        available: true
      },
      {
        type: 'account',
        name: '账号密码登录',
        icon: 'user',
        available: true
      }
    )
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
  isApp,
  isWechatEnvironment,
  isAlipayEnvironment,
  isWechatOfficialH5,
  isAlipayOfficialH5
} from '@/utils/platform'

interface PaymentMethod {
  type: string
  name: string
  icon: string
}

// 获取支付方式
const getPaymentMethods = (): PaymentMethod[] => {
  const methods: PaymentMethod[] = []

  // 微信小程序只能微信支付
  if (isMpWeixin) {
    return [{
      type: 'wechat-miniapp',
      name: '微信支付',
      icon: 'wechat-pay'
    }]
  }

  // 支付宝小程序只能支付宝支付
  if (isMpAlipay) {
    return [{
      type: 'alipay-miniapp',
      name: '支付宝支付',
      icon: 'alipay'
    }]
  }

  // App 支持所有支付方式
  if (isApp) {
    return [
      { type: 'wechat-app', name: '微信支付', icon: 'wechat-pay' },
      { type: 'alipay-app', name: '支付宝支付', icon: 'alipay' },
      { type: 'unionpay', name: '银联支付', icon: 'unionpay' }
    ]
  }

  // H5 根据环境判断
  if (isWechatOfficialH5) {
    // 微信公众号优先使用 JSAPI 支付
    methods.push({ type: 'wechat-jsapi', name: '微信支付', icon: 'wechat-pay' })
  } else if (isAlipayOfficialH5) {
    // 支付宝生活号优先使用 JSAPI 支付
    methods.push({ type: 'alipay-jsapi', name: '支付宝支付', icon: 'alipay' })
  } else {
    // 普通 H5 使用 H5 支付
    methods.push(
      { type: 'wechat-h5', name: '微信支付', icon: 'wechat-pay' },
      { type: 'alipay-h5', name: '支付宝支付', icon: 'alipay' }
    )
  }

  return methods
}

// 执行支付
const executePay = async (orderInfo: OrderInfo, paymentType: string) => {
  switch (paymentType) {
    case 'wechat-miniapp':
      // 微信小程序支付
      return await wxMiniappPay(orderInfo)

    case 'wechat-jsapi':
      // 微信公众号 JSAPI 支付
      return await wxJSAPIPay(orderInfo)

    case 'wechat-h5':
      // 微信 H5 支付
      return await wxH5Pay(orderInfo)

    case 'wechat-app':
      // 微信 App 支付
      return await wxAppPay(orderInfo)

    case 'alipay-miniapp':
    case 'alipay-jsapi':
    case 'alipay-h5':
    case 'alipay-app':
      // 支付宝支付
      return await alipayPay(orderInfo, paymentType)

    default:
      throw new Error('不支持的支付方式')
  }
}
```

### 分享功能适配

```typescript
import {
  isMpWeixin,
  isMpAlipay,
  isH5,
  isApp,
  isWechatOfficialH5
} from '@/utils/platform'

interface ShareData {
  title: string
  desc: string
  url: string
  image: string
}

interface ShareResult {
  success: boolean
  handled: boolean
  usePageShare?: boolean
  message?: string
}

// 分享到好友
const shareToFriend = async (data: ShareData): Promise<ShareResult> => {
  // 微信小程序使用页面生命周期
  if (isMpWeixin) {
    return {
      success: true,
      handled: false,
      usePageShare: true,
      message: '请使用页面右上角分享按钮'
    }
  }

  // 支付宝小程序
  if (isMpAlipay) {
    // @ts-ignore
    my.showSharePanel()
    return { success: true, handled: true }
  }

  // App 使用原生分享
  if (isApp) {
    return new Promise((resolve) => {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        title: data.title,
        summary: data.desc,
        href: data.url,
        imageUrl: data.image,
        success: () => resolve({ success: true, handled: true }),
        fail: (err) => resolve({
          success: false,
          handled: true,
          message: err.errMsg
        })
      })
    })
  }

  // 微信公众号 H5 使用 JSSDK
  if (isWechatOfficialH5) {
    // 需要先配置 wx.config
    // @ts-ignore
    wx.updateAppMessageShareData({
      title: data.title,
      desc: data.desc,
      link: data.url,
      imgUrl: data.image,
      success: () => {
        uni.showToast({ title: '分享设置成功' })
      }
    })
    return {
      success: true,
      handled: true,
      message: '请点击右上角分享'
    }
  }

  // 普通 H5 复制链接
  if (isH5) {
    uni.setClipboardData({
      data: data.url,
      success: () => {
        uni.showToast({ title: '链接已复制' })
      }
    })
    return { success: true, handled: true }
  }

  return {
    success: false,
    handled: false,
    message: '当前环境不支持分享'
  }
}

// 分享到朋友圈
const shareToTimeline = async (data: ShareData): Promise<ShareResult> => {
  // 微信小程序使用页面生命周期 onShareTimeline
  if (isMpWeixin) {
    return {
      success: true,
      handled: false,
      usePageShare: true,
      message: '请使用页面右上角分享到朋友圈'
    }
  }

  // App
  if (isApp) {
    return new Promise((resolve) => {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneTimeline',
        type: 0,
        title: data.title,
        href: data.url,
        imageUrl: data.image,
        success: () => resolve({ success: true, handled: true }),
        fail: (err) => resolve({
          success: false,
          handled: true,
          message: err.errMsg
        })
      })
    })
  }

  // 微信公众号 H5
  if (isWechatOfficialH5) {
    // @ts-ignore
    wx.updateTimelineShareData({
      title: data.title,
      link: data.url,
      imgUrl: data.image,
      success: () => {
        uni.showToast({ title: '朋友圈分享设置成功' })
      }
    })
    return {
      success: true,
      handled: true,
      message: '请点击右上角分享到朋友圈'
    }
  }

  return {
    success: false,
    handled: false,
    message: '当前环境不支持分享到朋友圈'
  }
}
```

### 调试信息显示

```typescript
import { isInDevTools, platform, isH5, isMp, isApp } from '@/utils/platform'
import { ref, onMounted } from 'vue'

// 开发环境显示调试面板
const showDebugPanel = ref(false)
const debugInfo = ref<Record<string, any>>({})

onMounted(() => {
  // 仅在开发者工具中显示调试面板
  if (isInDevTools()) {
    showDebugPanel.value = true

    // 收集调试信息
    debugInfo.value = {
      platform,
      isH5,
      isMp,
      isApp,
      systemInfo: uni.getSystemInfoSync(),
      networkType: '加载中...',
      storage: {
        token: uni.getStorageSync('token') ? '已存储' : '未存储',
        userInfo: uni.getStorageSync('userInfo') ? '已存储' : '未存储',
      }
    }

    // 获取网络类型
    uni.getNetworkType({
      success: (res) => {
        debugInfo.value.networkType = res.networkType
      }
    })

    console.log('调试信息:', debugInfo.value)
  }
})

// 导出调试日志
const exportDebugLog = () => {
  const log = JSON.stringify(debugInfo.value, null, 2)

  if (isH5) {
    // H5 下载文件
    const blob = new Blob([log], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-log-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    // 其他平台复制到剪贴板
    uni.setClipboardData({
      data: log,
      success: () => {
        uni.showToast({ title: '调试日志已复制' })
      }
    })
  }
}
```

### 图片选择适配

```typescript
import { isApp, isMpWeixin, isMpAlipay, isH5 } from '@/utils/platform'

interface ImagePickerOptions {
  count?: number
  sizeType?: ('original' | 'compressed')[]
  sourceType?: ('album' | 'camera')[]
}

interface ImagePickerResult {
  tempFilePaths: string[]
  tempFiles: Array<{
    path: string
    size: number
    type?: string
  }>
}

/**
 * 选择图片 - 适配各平台
 */
const chooseImage = (options: ImagePickerOptions = {}): Promise<ImagePickerResult> => {
  const {
    count = 9,
    sizeType = ['original', 'compressed'],
    sourceType = ['album', 'camera']
  } = options

  return new Promise((resolve, reject) => {
    // App 和小程序使用 uni.chooseImage
    if (isApp || isMpWeixin || isMpAlipay) {
      uni.chooseImage({
        count,
        sizeType,
        sourceType,
        success: (res) => {
          resolve({
            tempFilePaths: res.tempFilePaths,
            tempFiles: res.tempFiles.map(file => ({
              path: file.path,
              size: file.size,
              type: file.type
            }))
          })
        },
        fail: (err) => {
          reject(new Error(err.errMsg))
        }
      })
      return
    }

    // H5 使用 input[type=file]
    if (isH5) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = count > 1

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (!files || files.length === 0) {
          reject(new Error('未选择文件'))
          return
        }

        const result: ImagePickerResult = {
          tempFilePaths: [],
          tempFiles: []
        }

        Array.from(files).slice(0, count).forEach(file => {
          const url = URL.createObjectURL(file)
          result.tempFilePaths.push(url)
          result.tempFiles.push({
            path: url,
            size: file.size,
            type: file.type
          })
        })

        resolve(result)
      }

      input.click()
    }
  })
}
```

### 地理位置获取适配

```typescript
import { isApp, isMp, isH5, isWechatOfficialH5 } from '@/utils/platform'

interface LocationResult {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
}

/**
 * 获取地理位置 - 适配各平台
 */
const getLocation = (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    // App 和小程序使用 uni.getLocation
    if (isApp || isMp) {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: (err) => {
          reject(new Error(err.errMsg))
        }
      })
      return
    }

    // 微信公众号 H5 使用 JSSDK
    if (isWechatOfficialH5) {
      // @ts-ignore
      wx.getLocation({
        type: 'gcj02',
        success: (res: any) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: (err: any) => {
          reject(new Error(err.errMsg))
        }
      })
      return
    }

    // 普通 H5 使用 Geolocation API
    if (isH5) {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          let message = '获取位置失败'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '用户拒绝了位置请求'
              break
            case error.POSITION_UNAVAILABLE:
              message = '位置信息不可用'
              break
            case error.TIMEOUT:
              message = '获取位置超时'
              break
          }
          reject(new Error(message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }
  })
}
```

## API

### 平台常量

| 常量 | 说明 | 类型 |
|------|------|------|
| `platform` | 当前平台标识字符串 | `string` |
| `isApp` | 是否 App 平台 | `boolean` |
| `isMp` | 是否小程序平台 | `boolean` |
| `isMpWeixin` | 是否微信小程序 | `boolean` |
| `isMpAlipay` | 是否支付宝小程序 | `boolean` |
| `isMpToutiao` | 是否头条/抖音小程序 | `boolean` |
| `isH5` | 是否 H5 网页端（普通浏览器） | `boolean` |
| `isWechatOfficialH5` | 是否微信公众号 H5 | `boolean` |
| `isAlipayOfficialH5` | 是否支付宝生活号 H5 | `boolean` |

### 检测函数

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `isWechatEnvironment()` | 检测微信浏览器环境 | `boolean` |
| `isAlipayEnvironment()` | 检测支付宝浏览器环境 | `boolean` |
| `isInDevTools()` | 检测开发者工具环境 | `boolean` |
| `hasWeixinJSBridge()` | 检测微信 JSBridge | `boolean` |
| `checkPaymentUrl()` | 检测支付 URL 配置 | `PaymentUrlResult` |
| `safeGetUrlParams(key)` | 安全获取 URL 参数 | `string \| null` |

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
  /** 是否有效（开发者工具中总是无效） */
  isValid: boolean
  /** 当前完整 URL */
  currentUrl: string
  /** 配置建议文本 */
  suggestion: string
}

/**
 * URL 参数对象
 */
type UrlParams = Record<string, string>

/**
 * 平台工具导出对象
 */
interface PlatformUtils {
  platform: string
  isH5: boolean
  isApp: boolean
  isMp: boolean
  isMpWeixin: boolean
  isMpAlipay: boolean
  isMpToutiao: boolean
  isWechatOfficialH5: boolean
  isAlipayOfficialH5: boolean
  isWechatEnvironment: () => boolean
  isAlipayEnvironment: () => boolean
  isInDevTools: () => boolean
  checkPaymentUrl: () => PaymentUrlResult
  safeGetUrlParams: (key: string) => string | null
  hasWeixinJSBridge: () => boolean
}
```

### 默认导出

```typescript
// 默认导出包含所有平台工具
import PLATFORM from '@/utils/platform'

// 使用
console.log(PLATFORM.platform)
console.log(PLATFORM.isH5)
console.log(PLATFORM.isWechatEnvironment())
```

## 最佳实践

### 1. 使用常量而非运行时检测

```typescript
// ✅ 推荐：使用编译时常量
import { isMpWeixin } from '@/utils/platform'

if (isMpWeixin) {
  // 微信小程序逻辑
  // 编译时会被优化，非微信平台会被 Tree-shaking 移除
}

// ❌ 不推荐：运行时字符串判断
import { platform } from '@/utils/platform'

if (platform === 'mp-weixin') {
  // 效率较低，无法被 Tree-shaking
}
```

### 2. 封装平台差异化逻辑

```typescript
// utils/platformAdapter.ts
import { isApp, isMpWeixin, isH5 } from '@/utils/platform'

/**
 * 封装存储适配
 */
export const storage = {
  set: (key: string, value: any) => {
    const data = JSON.stringify(value)
    if (isApp || isMpWeixin) {
      uni.setStorageSync(key, data)
    } else if (isH5) {
      localStorage.setItem(key, data)
    }
  },

  get: <T>(key: string): T | null => {
    let value: string | null = null

    if (isApp || isMpWeixin) {
      value = uni.getStorageSync(key)
    } else if (isH5) {
      value = localStorage.getItem(key)
    }

    if (value) {
      try {
        return JSON.parse(value) as T
      } catch {
        return value as unknown as T
      }
    }
    return null
  },

  remove: (key: string) => {
    if (isApp || isMpWeixin) {
      uni.removeStorageSync(key)
    } else if (isH5) {
      localStorage.removeItem(key)
    }
  },

  clear: () => {
    if (isApp || isMpWeixin) {
      uni.clearStorageSync()
    } else if (isH5) {
      localStorage.clear()
    }
  }
}
```

### 3. 条件渲染组件

```vue
<template>
  <view class="share-button">
    <!-- 微信小程序专属组件 -->
    <button
      v-if="isMpWeixin"
      open-type="share"
      class="share-btn"
    >
      <wd-icon name="share" />
      <text>分享</text>
    </button>

    <!-- 其他平台使用通用按钮 -->
    <wd-button
      v-else
      @click="handleShare"
      icon="share"
    >
      分享
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { isMpWeixin, isH5, isApp } from '@/utils/platform'

const handleShare = () => {
  if (isApp) {
    // App 分享
    uni.share({
      provider: 'weixin',
      scene: 'WXSceneSession',
      // ...
    })
  } else if (isH5) {
    // H5 复制链接
    uni.setClipboardData({
      data: window.location.href
    })
  }
}
</script>
```

### 4. 统一的平台适配层

```typescript
// composables/usePlatformAdapter.ts
import {
  isApp,
  isMp,
  isH5,
  isMpWeixin,
  isMpAlipay,
  isWechatOfficialH5,
  isAlipayOfficialH5
} from '@/utils/platform'

export const usePlatformAdapter = () => {
  /**
   * 获取当前平台名称（用于显示）
   */
  const getPlatformName = (): string => {
    if (isApp) return 'App'
    if (isMpWeixin) return '微信小程序'
    if (isMpAlipay) return '支付宝小程序'
    if (isWechatOfficialH5) return '微信公众号'
    if (isAlipayOfficialH5) return '支付宝生活号'
    if (isH5) return 'H5网页'
    return '未知平台'
  }

  /**
   * 是否支持某个功能
   */
  const isFeatureSupported = (feature: string): boolean => {
    const featureMap: Record<string, boolean> = {
      'scan': isApp || isMp,
      'share': isApp || isMpWeixin || isMpAlipay,
      'pay-wechat': isApp || isMpWeixin || isWechatOfficialH5,
      'pay-alipay': isApp || isMpAlipay || isAlipayOfficialH5,
      'location': isApp || isMp || isH5,
      'camera': isApp || isMp,
      'bluetooth': isApp || isMp,
      'nfc': isApp,
      'push': isApp,
    }
    return featureMap[feature] ?? false
  }

  /**
   * 获取功能不可用的提示
   */
  const getUnsupportedMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      'scan': '当前环境不支持扫码功能',
      'share': '当前环境不支持分享功能',
      'pay-wechat': '当前环境不支持微信支付',
      'pay-alipay': '当前环境不支持支付宝支付',
      'camera': '当前环境不支持相机功能',
    }
    return messages[feature] ?? '当前环境不支持此功能'
  }

  return {
    getPlatformName,
    isFeatureSupported,
    getUnsupportedMessage,
    // 直接暴露常量
    isApp,
    isMp,
    isH5,
    isMpWeixin,
    isMpAlipay,
    isWechatOfficialH5,
    isAlipayOfficialH5
  }
}
```

### 5. 平台特定的 API 调用封装

```typescript
// services/platformService.ts
import {
  isApp,
  isMp,
  isH5,
  isMpWeixin,
  isWechatOfficialH5,
  hasWeixinJSBridge
} from '@/utils/platform'

/**
 * 调用微信 API（自动适配不同环境）
 */
export const callWechatAPI = async <T>(
  apiName: string,
  params: Record<string, any> = {}
): Promise<T> => {
  // 微信小程序
  if (isMpWeixin) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      wx[apiName]({
        ...params,
        success: resolve,
        fail: reject
      })
    })
  }

  // 微信公众号 H5
  if (isWechatOfficialH5) {
    // 确保 JSBridge 就绪
    if (!hasWeixinJSBridge()) {
      await new Promise<void>((resolve) => {
        document.addEventListener('WeixinJSBridgeReady', () => resolve(), { once: true })
      })
    }

    return new Promise((resolve, reject) => {
      // @ts-ignore
      wx[apiName]({
        ...params,
        success: resolve,
        fail: reject
      })
    })
  }

  throw new Error(`当前环境不支持微信 API: ${apiName}`)
}

/**
 * 打开地图导航
 */
export const openMapNavigation = (
  latitude: number,
  longitude: number,
  name: string,
  address: string
) => {
  if (isApp || isMp) {
    uni.openLocation({
      latitude,
      longitude,
      name,
      address,
      scale: 18
    })
    return
  }

  if (isH5) {
    // H5 打开高德地图网页版
    const url = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(name)}&coordinate=gaode&callnative=1`
    window.open(url, '_blank')
  }
}
```

## 常见问题

### 1. 平台常量始终为 false？

**问题描述：** 在所有平台下，`isApp`、`isMpWeixin` 等常量都是 `false`。

**原因：** 未正确配置 UniApp 条件编译，或在非 UniApp 环境下运行。

**解决方案：**

```bash
# 确保在正确的平台下运行或构建项目

# 微信小程序
pnpm dev:mp-weixin

# H5
pnpm dev:h5

# App
pnpm dev:app

# 检查 vite.config.ts 是否正确配置
# 检查 __UNI_PLATFORM__ 是否被正确注入
```

### 2. isWechatEnvironment 返回 false？

**问题描述：** 在微信浏览器中，`isWechatEnvironment()` 返回 `false`。

**原因：**
- 不在微信浏览器中运行
- User Agent 检测失败

**解决方案：**

```typescript
// 1. 使用微信开发者工具的「公众号网页」模式测试
// 2. 在真实微信客户端中打开页面
// 3. 手动检查 User Agent

const ua = navigator.userAgent.toLowerCase()
console.log('User Agent:', ua)
console.log('包含 micromessenger:', ua.includes('micromessenger'))
```

### 3. isH5 和 isWechatOfficialH5 的区别？

**问题描述：** 不清楚何时使用 `isH5`，何时使用 `isWechatOfficialH5`。

**解答：**

```typescript
import { isH5, isWechatOfficialH5, isAlipayOfficialH5 } from '@/utils/platform'

// isH5：普通浏览器（Chrome、Safari 等）
// 排除了微信和支付宝内置浏览器

// isWechatOfficialH5：微信公众号内的网页
// 可以使用微信 JSSDK

// isAlipayOfficialH5：支付宝生活号内的网页
// 可以使用支付宝 JSSDK

// 判断是否是任意 H5 环境
const isAnyH5 = isH5 || isWechatOfficialH5 || isAlipayOfficialH5

// 或者使用 __UNI_PLATFORM__
const isH5Platform = __UNI_PLATFORM__ === 'h5'
```

### 4. 如何判断 iOS 还是 Android？

**问题描述：** 需要区分 iOS 和 Android 设备。

**解决方案：**

```typescript
import { isApp, isH5 } from '@/utils/platform'

/**
 * 获取操作系统类型
 */
const getOSType = (): 'ios' | 'android' | 'other' => {
  // 小程序和 App 使用 uni API
  if (!isH5) {
    const systemInfo = uni.getSystemInfoSync()
    const platform = systemInfo.platform?.toLowerCase() || ''

    if (platform === 'ios' || platform.includes('iphone')) {
      return 'ios'
    }
    if (platform === 'android') {
      return 'android'
    }
    return 'other'
  }

  // H5 使用 User Agent
  const ua = navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod|ios/.test(ua)) {
    return 'ios'
  }
  if (/android/.test(ua)) {
    return 'android'
  }

  return 'other'
}

// 使用示例
const osType = getOSType()
if (osType === 'ios') {
  // iOS 特定处理
} else if (osType === 'android') {
  // Android 特定处理
}
```

### 5. H5 如何判断移动端还是 PC 端？

**问题描述：** 需要区分 H5 是在移动设备还是 PC 上访问。

**解决方案：**

```typescript
import { isH5 } from '@/utils/platform'

/**
 * 判断是否是移动设备
 */
const isMobileDevice = (): boolean => {
  if (!isH5) {
    // 非 H5 环境（App、小程序）都是移动端
    return true
  }

  // H5 环境通过 User Agent 判断
  const ua = navigator.userAgent.toLowerCase()
  return /mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(ua)
}

/**
 * 判断是否是平板设备
 */
const isTabletDevice = (): boolean => {
  if (!isH5) {
    const systemInfo = uni.getSystemInfoSync()
    // 根据屏幕尺寸判断
    return systemInfo.screenWidth >= 768
  }

  const ua = navigator.userAgent.toLowerCase()
  return /ipad|android(?!.*mobile)/.test(ua)
}

/**
 * 获取设备类型
 */
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isTabletDevice()) return 'tablet'
  if (isMobileDevice()) return 'mobile'
  return 'desktop'
}
```

### 6. 如何在组件中正确使用平台常量？

**问题描述：** 在 Vue 组件中使用平台常量时报错或不生效。

**解决方案：**

```vue
<template>
  <view>
    <!-- 方式1: 直接在模板中使用（需要暴露到模板） -->
    <view v-if="isMpWeixin">微信小程序专属内容</view>

    <!-- 方式2: 使用计算属性 -->
    <view v-if="showWechatButton">
      <button open-type="share">分享</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isMpWeixin, isH5, isApp } from '@/utils/platform'

// 直接暴露常量（响应式场景不推荐）
// 平台常量是编译时确定的，不会变化

// 使用计算属性（推荐）
const showWechatButton = computed(() => isMpWeixin)

// 在方法中使用
const handleAction = () => {
  if (isMpWeixin) {
    // 微信小程序逻辑
  } else if (isH5) {
    // H5 逻辑
  } else if (isApp) {
    // App 逻辑
  }
}
</script>
```

### 7. safeGetUrlParams 返回 null？

**问题描述：** 在 H5 环境下，`safeGetUrlParams` 无法获取 URL 参数。

**原因：**
- URL 中没有该参数
- 参数在 hash 部分而非 search 部分
- 使用了 history 模式但参数格式不正确

**解决方案：**

```typescript
import { safeGetUrlParams, isH5 } from '@/utils/platform'

// 标准 URL 参数获取
const code = safeGetUrlParams('code')

// 如果参数在 hash 中（如 Vue Router hash 模式）
const getHashParams = (key: string): string | null => {
  if (!isH5) return null

  try {
    const hash = window.location.hash
    const queryIndex = hash.indexOf('?')
    if (queryIndex === -1) return null

    const queryString = hash.substring(queryIndex + 1)
    const params = new URLSearchParams(queryString)
    return params.get(key)
  } catch {
    return null
  }
}

// 获取任意位置的参数
const getUrlParam = (key: string): string | null => {
  // 先从 search 获取
  let value = safeGetUrlParams(key)
  if (value) return value

  // 再从 hash 获取
  value = getHashParams(key)
  return value
}
```

### 8. 如何处理平台特定的样式？

**问题描述：** 不同平台需要不同的样式处理。

**解决方案：**

```vue
<template>
  <view :class="['container', platformClass]">
    <text>内容</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isApp, isMp, isH5, isMpWeixin, isMpAlipay } from '@/utils/platform'

const platformClass = computed(() => {
  if (isApp) return 'platform-app'
  if (isMpWeixin) return 'platform-mp-weixin'
  if (isMpAlipay) return 'platform-mp-alipay'
  if (isMp) return 'platform-mp'
  if (isH5) return 'platform-h5'
  return ''
})
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;

  // App 特定样式
  &.platform-app {
    padding-top: var(--status-bar-height);
  }

  // 微信小程序特定样式
  &.platform-mp-weixin {
    // 微信小程序样式
  }

  // H5 特定样式
  &.platform-h5 {
    // 需要考虑安全区域
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
```

## 总结

平台检测工具的核心要点：

1. **编译时常量** - `isApp`、`isMpWeixin` 等在编译时确定，可被 Tree-shaking 优化
2. **运行时检测** - `isWechatEnvironment()`、`isInDevTools()` 等在运行时动态判断
3. **H5 细分** - 区分普通浏览器、微信公众号、支付宝生活号三种 H5 环境
4. **安全访问** - `safeGetUserAgent`、`safeGetLocation` 等兼容所有平台
5. **封装差异** - 将平台差异封装在适配层，业务代码保持统一

核心使用原则：

- 优先使用编译时常量进行平台判断
- 将平台特定逻辑封装到独立的适配层
- 使用安全访问函数避免跨平台兼容问题
- 合理利用 Tree-shaking 减少最终包体积
