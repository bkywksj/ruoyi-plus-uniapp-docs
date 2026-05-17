# function 函数工具

## 介绍

`function` 是函数工具集，提供剪贴板操作、HTTP配置辅助、函数防抖节流、执行控制、函数变换和异步处理等功能。该工具集封装了常用的函数式编程模式，提升代码的可复用性和可维护性。工具集采用跨平台设计，针对 H5、小程序、APP 等不同运行环境提供了统一的 API 接口，内部自动处理平台差异。

**核心特性:**

- **剪贴板操作** - 跨平台的复制粘贴功能，支持 H5 Clipboard API 和 UniApp 原生 API
- **HTTP配置辅助** - 快速创建带自定义请求头的配置对象
- **防抖节流** - 带取消功能的 debounce 和 throttle 实现，支持 leading/trailing 模式
- **执行控制** - once 单次执行、delay 延迟执行、retry 失败重试、withTimeout 超时控制
- **函数变换** - curry 柯里化、partial 偏函数、memoize 记忆化缓存
- **异步处理** - serial 串行执行、parallel 并行限流、withRetry 重试包装、rateLimit 速率限制

## 架构设计

### 模块功能分层

```text
┌─────────────────────────────────────────────────────────────────┐
│                       应用层 (业务代码)                           │
├─────────────────────────────────────────────────────────────────┤
│  剪贴板操作  │  HTTP辅助  │  防抖节流  │  执行控制  │  异步处理  │
│   copy       │ withHeaders│  debounce  │   once     │  serial    │
│   paste      │            │  throttle  │   delay    │  parallel  │
│              │            │            │   retry    │  withRetry │
│              │            │            │ withTimeout│  rateLimit │
├─────────────────────────────────────────────────────────────────┤
│                      函数变换 (高阶函数)                          │
│           curry (柯里化)  │  partial (偏函数)  │  memoize (记忆化) │
├─────────────────────────────────────────────────────────────────┤
│                      平台适配层                                   │
│   H5: Clipboard API / execCommand                                │
│   APP/MP: uni.setClipboardData / uni.getClipboardData           │
└─────────────────────────────────────────────────────────────────┘
```

### 设计模式

```text
┌─────────────────────────────────────────────────────────────────┐
│                       设计模式应用                               │
├─────────────────┬───────────────────────────────────────────────┤
│   装饰器模式    │  debounce, throttle, withTimeout, withRetry   │
│                 │  - 不修改原函数，增强其行为                     │
├─────────────────┼───────────────────────────────────────────────┤
│   单例模式      │  once                                         │
│                 │  - 确保函数只执行一次                          │
├─────────────────┼───────────────────────────────────────────────┤
│   记忆化模式    │  memoize                                      │
│                 │  - 缓存计算结果，避免重复计算                   │
├─────────────────┼───────────────────────────────────────────────┤
│   策略模式      │  平台适配                                      │
│                 │  - 根据运行环境选择不同实现                     │
├─────────────────┼───────────────────────────────────────────────┤
│   队列模式      │  rateLimit, parallel                          │
│                 │  - 任务排队，控制并发                          │
└─────────────────┴───────────────────────────────────────────────┘
```

### 函数执行流程

```text
┌──────────────────────────────────────────────────────────────────┐
│                    防抖函数执行流程                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  调用 ──► 清除定时器 ──► 设置新定时器 ──► 等待延迟 ──► 执行函数   │
│    │                         │                                   │
│    │     (immediate=true)    │                                   │
│    └────► 立即执行 ──────────┘                                   │
│                                                                  │
│  cancel() ──► 清除定时器 ──► 停止执行                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    节流函数执行流程                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  调用 ──► 检查时间间隔 ──┬─► 间隔已过 ──► 立即执行 (leading)     │
│                         │                                        │
│                         └─► 间隔未过 ──► 设置定时器 (trailing)   │
│                                                                  │
│  cancel() ──► 清除定时器 ──► 重置状态                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 剪贴板操作

### copy

复制文本到剪贴板，支持跨平台，自动处理 H5 和原生环境的差异：

```typescript
import { copy } from '@/utils/function'

// 基本用法
const handleCopy = async () => {
  const success = await copy('要复制的文本')
  if (success) {
    console.log('复制成功')
  } else {
    console.log('复制失败')
  }
}

// 自定义提示消息
const copyWithMessage = async () => {
  await copy('订单号: ORD20241201001', '订单号已复制到剪贴板')
}

// 复制链接
const copyLink = async (url: string) => {
  await copy(url, '链接已复制，快去分享吧')
}

// 复制邀请码
const copyInviteCode = async () => {
  const code = 'ABC123XYZ'
  await copy(code) // 使用默认提示 "复制成功"
}

// 复制用户信息
const copyUserInfo = async (user: { name: string; phone: string }) => {
  const info = `姓名: ${user.name}\n电话: ${user.phone}`
  await copy(info, '用户信息已复制')
}
```

**平台适配说明:**

| 平台 | 实现方式 | 兼容性 |
|------|---------|--------|
| H5 (现代浏览器) | `navigator.clipboard.writeText()` | Chrome 66+, Firefox 63+ |
| H5 (旧浏览器) | `document.execCommand('copy')` | IE 10+, 已废弃但兼容性好 |
| 微信小程序 | `uni.setClipboardData()` | 全版本支持 |
| APP (iOS/Android) | `uni.setClipboardData()` | 全版本支持 |
| 支付宝/百度/头条等 | `uni.setClipboardData()` | 全版本支持 |

**H5 降级处理流程:**

```text
优先: navigator.clipboard.writeText()
  ↓ 失败或不支持
降级: document.execCommand('copy')
  ↓ 不支持
返回: false (复制失败)
```

### paste

从剪贴板粘贴文本，H5 环境需要用户授权：

```typescript
import { paste } from '@/utils/function'

// 基本用法
const handlePaste = async () => {
  const text = await paste()
  if (text) {
    console.log('粘贴内容:', text)
    inputValue.value = text
  } else {
    console.log('剪贴板为空或获取失败')
  }
}

// 粘贴到输入框
const pasteToInput = async () => {
  const content = await paste()
  if (content) {
    form.content = content
  }
}

// 粘贴验证码
const pasteVerifyCode = async () => {
  const code = await paste()
  if (code && /^\d{6}$/.test(code)) {
    verifyCode.value = code
    // 自动提交验证
    await submitVerifyCode()
  }
}

// 粘贴并解析 JSON
const pasteAndParseJson = async () => {
  const text = await paste()
  if (text) {
    try {
      const data = JSON.parse(text)
      console.log('解析成功:', data)
      return data
    } catch {
      console.error('JSON 解析失败')
      return null
    }
  }
  return null
}
```

**注意事项:**

- H5 环境读取剪贴板需要用户授权，首次调用会弹出授权提示
- H5 环境必须在 HTTPS 或 localhost 下使用 Clipboard API
- 小程序和 APP 环境无需授权，直接读取
- 返回空字符串表示剪贴板为空或获取失败

## HTTP 配置辅助

### withHeaders

快速创建带自定义请求头的配置对象，简化 HTTP 请求配置：

```typescript
import { withHeaders } from '@/utils/function'

// 基本用法 - 添加 Token
const config = withHeaders({
  Authorization: 'Bearer xxx-token-xxx'
})
// 结果: { header: { Authorization: 'Bearer xxx-token-xxx' } }

// 添加多个请求头
const multiHeaderConfig = withHeaders({
  'Authorization': 'Bearer xxx-token-xxx',
  'X-Request-Id': 'req-123456',
  'X-Client-Version': '1.0.0'
})

// 与现有配置合并
const baseConfig = {
  timeout: 10000,
  header: {
    'Content-Type': 'application/json'
  }
}

const mergedConfig = withHeaders(
  { Authorization: 'Bearer token' },
  baseConfig
)
// 结果: {
//   timeout: 10000,
//   header: {
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer token'
//   }
// }

// 实际使用场景
import { useHttp } from '@/composables/use-http'

const http = useHttp()

// 需要特殊认证的请求
const fetchWithAuth = async () => {
  const result = await http.get('/api/protected', withHeaders({
    'X-Special-Token': 'special-auth-token'
  }))
  return result
}

// 文件上传配置
const uploadConfig = withHeaders({
  'Content-Type': 'multipart/form-data'
}, {
  timeout: 60000 // 上传超时时间更长
})
```

**类型定义:**

```typescript
import type { CustomHeaders, CustomRequestOptions } from '@/types/http'

export const withHeaders = (
  header: CustomHeaders,
  config?: CustomRequestOptions,
): CustomRequestOptions => {
  return {
    ...config,
    header: {
      ...config?.header,
      ...header,
    },
  }
}
```

## 防抖与节流

### debounce

防抖函数，在指定时间内多次调用，只执行最后一次（或第一次）。适用于搜索输入、窗口调整等场景：

```typescript
import { debounce } from '@/utils/function'

// 基本用法 - 搜索防抖 (默认 300ms)
const handleSearch = debounce((keyword: string) => {
  api.search(keyword).then(res => {
    searchResults.value = res.data
  })
})

// 自定义延迟时间
const handleInput = debounce((value: string) => {
  console.log('输入值:', value)
}, 500) // 500ms 延迟

// 立即执行模式 - 第一次调用立即执行
const handleClick = debounce(() => {
  console.log('点击处理')
  submitForm()
}, 300, true) // immediate = true

// 取消防抖
const debouncedFn = debounce(handleResize, 200)

// 组件销毁时取消
onUnmounted(() => {
  debouncedFn.cancel()
})

// 窗口调整防抖
const handleResize = debounce(() => {
  recalculateLayout()
}, 200)

// 表单验证防抖
const validateField = debounce(async (fieldName: string, value: any) => {
  const result = await validateRule(fieldName, value)
  errors.value[fieldName] = result.error
}, 300)

// 自动保存防抖
const autoSave = debounce(async () => {
  await saveDraft(formData.value)
  showToast('草稿已保存')
}, 2000)
```

**执行时序图 (immediate = false):**

```text
调用时间线:  ───●────●────●────────────────────────►
            0ms 100ms 200ms
                              │
                              ▼ 300ms 后执行
实际执行:   ───────────────────●───────────────────►
                              只执行最后一次
```

**执行时序图 (immediate = true):**

```text
调用时间线:  ───●────●────●────────────────────────►
            0ms 100ms 200ms
               │
               ▼ 立即执行
实际执行:   ───●───────────────────────────────────►
               第一次调用立即执行，后续被忽略
```

### throttle

节流函数，在指定时间内，函数最多执行一次。适用于滚动监听、鼠标移动等高频事件：

```typescript
import { throttle } from '@/utils/function'

// 基本用法 - 滚动节流 (默认 300ms)
const handleScroll = throttle(() => {
  checkLoadMore()
})

// 自定义间隔时间
const handleMouseMove = throttle((e: MouseEvent) => {
  updateTooltipPosition(e.clientX, e.clientY)
}, 50) // 每 50ms 最多执行一次

// 配置 leading 和 trailing
const handleResize = throttle(
  () => recalculateLayout(),
  200,
  {
    leading: true,   // 第一次调用立即执行 (默认 true)
    trailing: true   // 最后一次调用在等待后执行 (默认 true)
  }
)

// 只在开始时执行 (trailing: false)
const handleDragStart = throttle(
  () => showDragIndicator(),
  100,
  { leading: true, trailing: false }
)

// 只在结束时执行 (leading: false)
const handleDragEnd = throttle(
  () => updatePosition(),
  100,
  { leading: false, trailing: true }
)

// 取消节流
const throttledFn = throttle(handleScroll, 100)

onUnmounted(() => {
  throttledFn.cancel()
})

// 按钮点击节流 (防止重复提交)
const handleSubmit = throttle(async () => {
  loading.value = true
  try {
    await submitForm()
    showToast('提交成功')
  } finally {
    loading.value = false
  }
}, 2000)

// 实时搜索节流
const searchThrottled = throttle(async (keyword: string) => {
  if (!keyword.trim()) return
  const result = await api.search(keyword)
  suggestions.value = result.data
}, 300)
```

**执行时序图 (leading: true, trailing: true):**

```text
调用时间线:  ───●──●──●──●──●──●──────────────────►
            0  50 100 150 200 250ms
               │           │        │
               ▼           ▼        ▼
实际执行:   ───●───────────●────────●─────────────►
            0ms         200ms     450ms
            (leading)  (interval) (trailing)
```

### debounce vs throttle 对比

| 特性 | debounce | throttle |
|------|----------|----------|
| 执行时机 | 最后一次调用后等待指定时间 | 每隔指定时间执行一次 |
| 适用场景 | 搜索输入、表单验证、窗口调整 | 滚动监听、拖拽、实时更新 |
| 连续调用 | 重置等待时间 | 按固定频率执行 |
| immediate 参数 | 支持，立即执行模式 | 通过 leading 选项实现 |
| cancel 方法 | 支持 | 支持 |

## 执行控制

### once

确保函数只执行一次，后续调用返回首次执行的结果：

```typescript
import { once } from '@/utils/function'

// 初始化只执行一次
const initialize = once(() => {
  console.log('初始化配置')
  loadConfig()
  setupEventListeners()
  return '初始化完成'
})

// 多次调用只执行一次
const result1 = initialize() // 执行，返回 '初始化完成'
const result2 = initialize() // 不执行，返回 '初始化完成'
const result3 = initialize() // 不执行，返回 '初始化完成'

// 单例模式 - 创建 WebSocket 连接
const createConnection = once(() => {
  const ws = new WebSocket('ws://example.com/socket')
  ws.onopen = () => console.log('连接已建立')
  return ws
})

// 获取同一个连接实例
const ws1 = createConnection()
const ws2 = createConnection()
console.log(ws1 === ws2) // true

// 惰性初始化
const getDatabase = once(async () => {
  const db = await openDatabase('app.db')
  await db.migrate()
  return db
})

// 首次调用时初始化数据库
const db = await getDatabase()

// 页面级初始化
const initPage = once(() => {
  trackPageView()
  loadUserPreferences()
  setupHotkeys()
})

onShow(() => {
  initPage() // 只在第一次 onShow 时执行
})
```

### delay

延迟执行函数，返回 Promise：

```typescript
import { delay } from '@/utils/function'

// 基本用法 - 延迟执行
await delay(console.log, 1000, 'Hello') // 1秒后输出 'Hello'

// 等待动画完成
const showWithAnimation = async () => {
  visible.value = true
  await delay(() => {}, 300) // 等待 300ms 动画
  // 动画完成后的操作
  focusInput()
}

// 延迟后显示提示
const showTip = async () => {
  await delay(() => {
    tip.value = '操作成功'
  }, 500)

  await delay(() => {
    tip.value = ''
  }, 3000)
}

// 简单等待 (传入空函数)
const wait = (ms: number) => delay(() => {}, ms)

const processSteps = async () => {
  step.value = 1
  await wait(1000)
  step.value = 2
  await wait(1000)
  step.value = 3
}

// 带参数的延迟执行
const logWithDelay = async (message: string, level: string) => {
  await delay(
    (msg, lvl) => console.log(`[${lvl}] ${msg}`),
    1000,
    message,
    level
  )
}

await logWithDelay('操作完成', 'INFO')

// 轮询场景
const pollStatus = async () => {
  while (true) {
    const status = await checkStatus()
    if (status === 'completed') {
      showToast('任务完成')
      break
    }
    await delay(() => {}, 2000) // 每 2 秒检查一次
  }
}
```

### retry

失败重试，支持指数退避策略：

```typescript
import { retry } from '@/utils/function'

// 基本重试 (默认 3 次，间隔 1 秒)
const fetchData = async () => {
  const result = await retry(() => api.getData())
  return result
}

// 自定义重试次数和间隔
const fetchWithOptions = async () => {
  const result = await retry(
    () => api.getData(),
    {
      maxAttempts: 5,  // 最多尝试 5 次
      delay: 2000,     // 初始间隔 2 秒
      backoff: 2       // 指数退避系数 (2秒, 4秒, 8秒, 16秒)
    }
  )
  return result
}

// 文件上传重试
const uploadFile = async (file: File) => {
  const result = await retry(
    () => api.upload(file),
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: 1.5 // 1秒, 1.5秒, 2.25秒
    }
  )
  return result
}

// 网络请求重试
const fetchUser = async (userId: string) => {
  try {
    const user = await retry(
      async () => {
        const res = await api.getUser(userId)
        if (res.code !== 200) {
          throw new Error(`请求失败: ${res.message}`)
        }
        return res.data
      },
      { maxAttempts: 3, delay: 500 }
    )
    return user
  } catch (error) {
    console.error('多次重试后仍失败:', error)
    throw error
  }
}

// 数据库连接重试
const connectDatabase = async () => {
  const db = await retry(
    () => Database.connect({
      host: 'localhost',
      port: 3306,
      database: 'app'
    }),
    {
      maxAttempts: 10,
      delay: 1000,
      backoff: 2 // 1秒, 2秒, 4秒, 8秒...
    }
  )
  return db
}
```

**重试间隔计算 (指数退避):**

```text
尝试次数   间隔时间 (backoff = 2)
   1            无 (首次尝试)
   2         delay * 1 = 1000ms
   3         delay * 2 = 2000ms
   4         delay * 4 = 4000ms
   5         delay * 8 = 8000ms
```

### withTimeout

为异步函数添加超时限制：

```typescript
import { withTimeout } from '@/utils/function'

// 基本用法 - 5秒超时
const fetchWithTimeout = withTimeout(api.getData, 5000)

try {
  const result = await fetchWithTimeout()
  console.log('获取成功:', result)
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('请求超时')
    showToast('网络超时，请重试')
  } else {
    console.log('其他错误:', error.message)
  }
}

// 上传文件带超时 (30秒)
const uploadWithTimeout = withTimeout(
  (file: File) => api.upload(file),
  30000
)

const handleUpload = async (file: File) => {
  try {
    const result = await uploadWithTimeout(file)
    showToast('上传成功')
    return result
  } catch (error) {
    if (error.name === 'TimeoutError') {
      showToast('上传超时，请检查网络')
    }
    throw error
  }
}

// 结合重试使用
const reliableFetch = async () => {
  const fetchWithTimeout = withTimeout(api.getData, 5000)

  return retry(
    fetchWithTimeout,
    { maxAttempts: 3, delay: 1000 }
  )
}

// API 请求统一超时包装
const createTimeoutApi = <T>(
  apiFn: () => Promise<T>,
  timeout: number = 10000
) => {
  return withTimeout(apiFn, timeout)
}

const getUserInfo = createTimeoutApi(() => api.getUser(userId), 5000)
const getOrderList = createTimeoutApi(() => api.getOrders(), 15000)
```

## 函数变换

### curry

函数柯里化，将接受多个参数的函数转换为一系列接受单个参数的函数：

```typescript
import { curry } from '@/utils/function'

// 基本用法
const add = (a: number, b: number, c: number) => a + b + c
const curriedAdd = curry(add)

// 多种调用方式
curriedAdd(1)(2)(3)     // 6
curriedAdd(1, 2)(3)     // 6
curriedAdd(1)(2, 3)     // 6
curriedAdd(1, 2, 3)     // 6

// 创建特定配置的函数
const formatDate = curry((format: string, locale: string, date: Date) => {
  // 日期格式化逻辑
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format === 'short' ? 'short' : 'long'
  }).format(date)
})

// 预设格式和语言
const formatChinese = formatDate('long', 'zh-CN')
const formatEnglish = formatDate('short', 'en-US')

formatChinese(new Date()) // '2024年12月1日'
formatEnglish(new Date()) // '12/1/2024'

// 创建验证函数
const validate = curry((rules: string[], fieldName: string, value: any) => {
  for (const rule of rules) {
    if (rule === 'required' && !value) {
      return `${fieldName}不能为空`
    }
    if (rule === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      return `${fieldName}格式不正确`
    }
  }
  return null
})

const validateEmail = validate(['required', 'email'], '邮箱')
const validateName = validate(['required'], '姓名')

validateEmail('test@example.com') // null (验证通过)
validateEmail('invalid')          // '邮箱格式不正确'
validateName('')                  // '姓名不能为空'

// 日志函数柯里化
const log = curry((level: string, module: string, message: string) => {
  console.log(`[${level}][${module}] ${message}`)
})

const logInfo = log('INFO')
const logUserModule = logInfo('User')
const logOrderModule = logInfo('Order')

logUserModule('用户登录成功')  // [INFO][User] 用户登录成功
logOrderModule('订单创建完成') // [INFO][Order] 订单创建完成
```

### partial

偏函数应用，固定函数的部分参数：

```typescript
import { partial } from '@/utils/function'

// 基本用法
const greet = (greeting: string, name: string) => `${greeting}, ${name}!`

const sayHello = partial(greet, 'Hello')
const sayHi = partial(greet, 'Hi')

sayHello('World') // 'Hello, World!'
sayHi('Tom')      // 'Hi, Tom!'

// 预设 API 配置
const request = (method: string, baseUrl: string, endpoint: string, data?: any) => {
  return fetch(`${baseUrl}${endpoint}`, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: { 'Content-Type': 'application/json' }
  })
}

// 创建特定 API 的请求函数
const apiRequest = partial(request, 'POST', 'https://api.example.com')
const get = partial(request, 'GET', 'https://api.example.com')
const post = partial(request, 'POST', 'https://api.example.com')

// 使用
await get('/users')
await post('/users', { name: 'Tom' })
await apiRequest('/orders', { items: [...] })

// 创建带默认选项的函数
const showToast = (type: string, duration: number, message: string) => {
  uni.showToast({
    title: message,
    icon: type === 'success' ? 'success' : 'none',
    duration
  })
}

const showSuccess = partial(showToast, 'success', 2000)
const showError = partial(showToast, 'error', 3000)
const showInfo = partial(showToast, 'info', 2000)

showSuccess('操作成功')
showError('操作失败，请重试')
showInfo('正在处理中...')

// 事件处理函数预设
const trackEvent = (category: string, action: string, label: string) => {
  analytics.track({ category, action, label })
}

const trackButton = partial(trackEvent, 'Button', 'Click')
const trackPage = partial(trackEvent, 'Page', 'View')

trackButton('登录按钮')
trackButton('提交订单')
trackPage('首页')
```

### memoize

函数结果缓存，避免重复计算：

```typescript
import { memoize } from '@/utils/function'

// 计算密集型函数记忆化
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

// 第一次计算
console.time('first')
fibonacci(40) // 计算并缓存
console.timeEnd('first') // ~500ms

// 后续调用直接返回缓存结果
console.time('cached')
fibonacci(40) // 直接返回缓存
console.timeEnd('cached') // ~0.01ms

// API 请求缓存
const fetchUserInfo = memoize(async (userId: string) => {
  console.log(`请求用户 ${userId} 的信息...`)
  const res = await api.getUser(userId)
  return res.data
})

// 相同参数只请求一次
await fetchUserInfo('123') // 发起请求
await fetchUserInfo('123') // 返回缓存
await fetchUserInfo('456') // 发起新请求

// 自定义缓存键解析器
const getUser = memoize(
  async (id: string, options?: { force?: boolean }) => {
    const res = await api.fetchUser(id, options)
    return res.data
  },
  // 自定义键生成逻辑
  (id, options) => {
    // force=true 时不使用缓存
    return options?.force ? `user:${id}:${Date.now()}` : `user:${id}`
  }
)

// 普通请求使用缓存
await getUser('123')
await getUser('123') // 缓存命中

// 强制刷新
await getUser('123', { force: true }) // 发起新请求

// 格式化函数缓存
const formatPrice = memoize((price: number, currency: string) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency
  }).format(price)
})

formatPrice(99.99, 'CNY')  // ¥99.99
formatPrice(99.99, 'CNY')  // 缓存命中
formatPrice(99.99, 'USD')  // $99.99

// 复杂计算缓存
const calculateDiscount = memoize(
  (items: CartItem[], coupon: Coupon) => {
    // 复杂的折扣计算逻辑
    let total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (coupon.type === 'percent') {
      total *= (1 - coupon.value / 100)
    } else if (coupon.type === 'fixed') {
      total -= coupon.value
    }

    return Math.max(0, total)
  },
  // 基于内容生成缓存键
  (items, coupon) => JSON.stringify({ items, coupon })
)
```

**缓存管理:**

```typescript
// memoize 返回的函数没有内置的缓存清理方法
// 如需清理缓存，可以自行封装

const createMemoizedFn = <T extends (...args: any[]) => any>(fn: T) => {
  const cache = new Map()

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }

  // 添加缓存管理方法
  memoized.clear = () => cache.clear()
  memoized.delete = (key: string) => cache.delete(key)
  memoized.size = () => cache.size

  return memoized
}

const cachedFetch = createMemoizedFn(fetchUserInfo)
cachedFetch('123')
cachedFetch.clear() // 清除所有缓存
```

## 异步处理

### serial

串行执行多个异步任务，支持管道式数据传递：

```typescript
import { serial } from '@/utils/function'

// 基本用法 - 按顺序执行
const tasks = [
  () => api.step1(),
  () => api.step2(),
  () => api.step3()
]

const results = await serial(tasks)
// results = step3 的结果 (管道式传递)

// 管道模式 - 前一个函数的结果传递给下一个
const processData = await serial([
  () => api.fetchUsers(),                    // 获取用户列表
  (users) => filterActiveUsers(users),       // 过滤活跃用户
  (activeUsers) => sortUsersByName(activeUsers), // 排序
  (sortedUsers) => formatUsers(sortedUsers)  // 格式化
])

// 带初始值
const result = await serial(
  [
    (data) => transformStep1(data),
    (data) => transformStep2(data),
    (data) => transformStep3(data)
  ],
  initialData // 初始值
)

// 表单分步提交
const submitSteps = async () => {
  try {
    await serial([
      () => validateForm(),
      () => uploadFiles(),
      () => submitData(),
      () => sendNotification()
    ])
    uni.showToast({ title: '提交成功' })
  } catch (error) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}

// 订单处理流程
const processOrder = async (orderId: string) => {
  const result = await serial([
    () => validateOrder(orderId),
    (order) => calculateTotal(order),
    (order) => applyDiscount(order),
    (order) => createPayment(order),
    (payment) => notifyUser(payment)
  ])
  return result
}

// 数据迁移流程
const migrateData = async () => {
  await serial([
    () => backupDatabase(),
    () => runMigrations(),
    () => validateMigration(),
    () => cleanupOldData()
  ])
}
```

### parallel

并行执行多个异步任务，支持并发数限制：

```typescript
import { parallel } from '@/utils/function'

// 基本用法 - 并行执行
const tasks = [
  () => api.getUsers(),
  () => api.getOrders(),
  () => api.getMessages()
]

const [users, orders, messages] = await parallel(tasks)

// 带并发限制 - 最多同时执行 3 个任务
const uploadFiles = async (files: File[]) => {
  const tasks = files.map(file => () => api.upload(file))

  // 最多同时上传 3 个文件
  const results = await parallel(tasks, 3)
  return results
}

// 批量请求控制
const fetchAllUsers = async (userIds: string[]) => {
  const tasks = userIds.map(id => () => api.getUser(id))

  // 限制并发数为 5，避免服务器压力
  const users = await parallel(tasks, 5)
  return users
}

// 图片批量处理
const processImages = async (images: string[]) => {
  const tasks = images.map(url => async () => {
    const response = await fetch(url)
    const blob = await response.blob()
    return compressImage(blob)
  })

  // 限制同时处理 2 张图片，避免内存溢出
  const compressed = await parallel(tasks, 2)
  return compressed
}

// 页面数据加载
const loadPageData = async () => {
  loading.value = true

  try {
    const [userData, orderData, messageData] = await parallel([
      () => api.getUser(),
      () => api.getOrders({ limit: 10 }),
      () => api.getMessages({ unread: true })
    ])

    user.value = userData
    orders.value = orderData
    messages.value = messageData
  } finally {
    loading.value = false
  }
}

// 无限制并发 (默认)
const quickFetch = await parallel([
  () => fetch('/api/a'),
  () => fetch('/api/b'),
  () => fetch('/api/c'),
  () => fetch('/api/d'),
  () => fetch('/api/e')
]) // 5 个请求同时发出
```

**并发控制示意图:**

```text
并发限制 = 3，共 6 个任务

时间线:  ──────────────────────────────────────────►
         │
任务1:   ████████████████                            (完成)
任务2:   ████████████████████████                    (完成)
任务3:   ████████████                                (完成)
任务4:               ████████████████████            (任务3完成后开始)
任务5:                       ████████████████        (任务1完成后开始)
任务6:                               ████████████    (任务2完成后开始)
         │           │                   │
         同时最多 3 个任务在执行
```

### withRetry

为异步函数添加错误重试功能，支持条件判断：

```typescript
import { withRetry } from '@/utils/function'

// 基本用法
const fetchWithRetry = withRetry(api.getData, {
  retries: 3,      // 重试次数
  retryDelay: 1000 // 重试间隔
})

const data = await fetchWithRetry()

// 带条件的重试
const fetchWithCondition = withRetry(api.getData, {
  retries: 5,
  retryDelay: 500,
  // 只在特定错误时重试
  shouldRetry: (error) => {
    // 429 Too Many Requests - 应该重试
    if (error.status === 429) return true
    // 503 Service Unavailable - 应该重试
    if (error.status === 503) return true
    // 网络错误 - 应该重试
    if (error.message === 'Network Error') return true
    // 其他错误不重试
    return false
  }
})

// 带进度回调的重试
const reliableUpload = withRetry(
  (file: File) => api.upload(file),
  {
    retries: 3,
    retryDelay: 2000,
    shouldRetry: (error) => {
      console.log(`上传失败，准备重试: ${error.message}`)
      return true
    }
  }
)

// 创建可靠的 API 客户端
const createReliableApi = (apiFn: Function) => {
  return withRetry(apiFn, {
    retries: 3,
    retryDelay: 1000,
    shouldRetry: (error) => {
      // 4xx 客户端错误不重试
      if (error.status >= 400 && error.status < 500) {
        return false
      }
      return true
    }
  })
}

const reliableGetUser = createReliableApi(api.getUser)
const reliableGetOrders = createReliableApi(api.getOrders)

// 结合超时控制
const robustFetch = withRetry(
  withTimeout(api.getData, 5000),
  {
    retries: 3,
    retryDelay: 1000,
    shouldRetry: (error) => {
      // 超时也重试
      return error.name === 'TimeoutError' || error.message === 'Network Error'
    }
  }
)
```

### rateLimit

限制函数执行频率，防止请求过于频繁：

```typescript
import { rateLimit } from '@/utils/function'

// 基本用法 - 每秒最多执行 5 次
const limitedApi = rateLimit(api.request, 5, 1000)

// 批量请求时自动限速
const fetchAll = async (ids: string[]) => {
  const results = await Promise.all(
    ids.map(id => limitedApi(id))
  )
  return results
}

// 限制 API 调用频率 - 每分钟最多 100 次
const limitedFetch = rateLimit(fetchData, 100, 60000)

// 批量处理用户数据
const processUsers = async (userIds: string[]) => {
  console.log(`处理 ${userIds.length} 个用户...`)

  const results = []
  for (const id of userIds) {
    // 自动排队，控制请求频率
    const user = await limitedFetch(id)
    results.push(user)
  }

  return results
}

// 搜索建议限速 - 每秒最多 3 次
const limitedSearch = rateLimit(
  (keyword: string) => api.searchSuggestions(keyword),
  3,
  1000
)

const handleSearchInput = async (keyword: string) => {
  if (!keyword.trim()) return
  suggestions.value = await limitedSearch(keyword)
}

// 消息发送限速 - 每秒最多 1 条
const limitedSendMessage = rateLimit(
  (message: string) => api.sendMessage(message),
  1,
  1000
)

// 数据同步限速
const limitedSync = rateLimit(
  (data: any) => api.sync(data),
  10,
  60000 // 每分钟最多同步 10 次
)
```

**速率限制工作原理:**

```text
时间窗口: 1000ms, 限制: 3次/秒

请求时间:  0ms  200ms  400ms  600ms  800ms  1000ms  1200ms
           │     │      │      │      │       │       │
请求结果:  ✓     ✓      ✓      等待...  等待... ✓       ✓
           │     │      │              │       │       │
           └─────┴──────┴──────────────┘       └───────┘
           第一个时间窗口 (3次)              第二个时间窗口
```

## 实际应用场景

### 搜索组件完整示例

```typescript
import { debounce, memoize, withTimeout } from '@/utils/function'

// 搜索建议缓存
const fetchSuggestions = memoize(async (keyword: string) => {
  const res = await api.getSuggestions(keyword)
  return res.data
})

// 带超时的搜索
const searchWithTimeout = withTimeout(
  (keyword: string) => api.search(keyword),
  5000
)

// 防抖搜索
const search = debounce(async (keyword: string) => {
  if (!keyword.trim()) {
    suggestions.value = []
    return
  }

  loading.value = true

  try {
    // 先获取缓存的建议
    const cached = await fetchSuggestions(keyword)
    suggestions.value = cached

    // 如果用户选择搜索，执行完整搜索
    if (shouldSearch) {
      const results = await searchWithTimeout(keyword)
      searchResults.value = results.data
    }
  } catch (error) {
    if (error.name === 'TimeoutError') {
      showToast('搜索超时，请重试')
    }
  } finally {
    loading.value = false
  }
}, 300)

// 组件销毁时清理
onUnmounted(() => {
  search.cancel()
})
```

### 表单提交完整示例

```typescript
import { throttle, withTimeout, retry, serial } from '@/utils/function'

// 防止重复提交 + 超时处理 + 自动重试
const handleSubmit = throttle(async () => {
  if (!validateForm()) {
    showToast('请完善表单信息')
    return
  }

  loading.value = true

  try {
    // 分步提交流程
    await serial([
      // 步骤1: 上传附件 (带重试)
      async () => {
        if (attachments.value.length > 0) {
          return retry(
            () => uploadAttachments(attachments.value),
            { maxAttempts: 3, delay: 1000 }
          )
        }
      },

      // 步骤2: 提交表单 (带超时)
      async () => {
        const submitWithTimeout = withTimeout(
          () => api.submitForm(formData.value),
          10000
        )
        return submitWithTimeout()
      },

      // 步骤3: 发送通知
      () => notifySubmitSuccess()
    ])

    showToast('提交成功')
    navigateBack()

  } catch (error) {
    if (error.name === 'TimeoutError') {
      showToast('请求超时，请重试')
    } else if (error.message.includes('最大尝试次数')) {
      showToast('网络异常，请稍后重试')
    } else {
      showToast('提交失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}, 2000)
```

### 页面数据加载完整示例

```typescript
import { retry, parallel, memoize, once } from '@/utils/function'

// 初始化只执行一次
const initPage = once(async () => {
  // 设置页面配置
  await loadConfig()
  // 初始化统计
  trackPageView()
})

// 缓存用户信息
const getCachedUser = memoize(async () => {
  const res = await api.getUser()
  return res.data
})

// 页面数据加载
const loadPageData = async () => {
  loading.value = true
  error.value = null

  try {
    // 初始化
    await initPage()

    // 并行加载多个数据，每个带重试
    const [userData, orderData, messageData] = await parallel([
      () => retry(() => getCachedUser(), { maxAttempts: 2 }),
      () => retry(() => api.getOrders({ limit: 10 }), { maxAttempts: 2 }),
      () => retry(() => api.getMessages({ unread: true }), { maxAttempts: 2 })
    ])

    user.value = userData
    orders.value = orderData
    messages.value = messageData

  } catch (err) {
    error.value = '加载失败，请下拉刷新重试'
    console.error('页面加载失败:', err)
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadPageData()
  refreshing.value = false
}
```

### 无限滚动加载示例

```typescript
import { throttle, withTimeout, rateLimit } from '@/utils/function'

// 限速的数据加载
const loadMoreData = rateLimit(
  async (page: number) => {
    const res = await api.getList({ page, pageSize: 20 })
    return res.data
  },
  5, // 每秒最多 5 次
  1000
)

// 节流的滚动处理
const handleScroll = throttle(async () => {
  // 检查是否需要加载更多
  if (!shouldLoadMore()) return
  if (loadingMore.value) return
  if (noMoreData.value) return

  loadingMore.value = true

  try {
    const data = await withTimeout(
      () => loadMoreData(currentPage.value + 1),
      10000
    )()

    if (data.length === 0) {
      noMoreData.value = true
    } else {
      list.value.push(...data)
      currentPage.value++
    }
  } catch (error) {
    if (error.name === 'TimeoutError') {
      showToast('加载超时')
    }
  } finally {
    loadingMore.value = false
  }
}, 200)

// 组件销毁时取消
onUnmounted(() => {
  handleScroll.cancel()
})
```

## API

### 剪贴板函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `copy` | 复制文本到剪贴板 | `(text: string, message?: string)` | `Promise<boolean>` |
| `paste` | 从剪贴板粘贴文本 | 无 | `Promise<string>` |

### HTTP 辅助函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `withHeaders` | 创建带请求头的配置 | `(header: CustomHeaders, config?: CustomRequestOptions)` | `CustomRequestOptions` |

### 防抖节流函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `debounce` | 防抖函数 | `(fn, wait?: number, immediate?: boolean)` | 带 `cancel()` 方法的函数 |
| `throttle` | 节流函数 | `(fn, wait?: number, options?: { leading?: boolean, trailing?: boolean })` | 带 `cancel()` 方法的函数 |

### 执行控制函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `once` | 单次执行 | `(fn)` | 包装后的函数 |
| `delay` | 延迟执行 | `(fn, wait?: number, ...args)` | `Promise<ReturnType<fn>>` |
| `retry` | 失败重试 | `(fn, options?: { maxAttempts?, delay?, backoff? })` | `Promise<T>` |
| `withTimeout` | 超时控制 | `(fn, ms: number)` | 带超时的函数 |

### 函数变换

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `curry` | 柯里化 | `(fn)` | 柯里化函数 |
| `partial` | 偏函数 | `(fn, ...partialArgs)` | 新函数 |
| `memoize` | 记忆化 | `(fn, resolver?)` | 带缓存的函数 |

### 异步处理函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `serial` | 串行执行 | `(tasks, initial?)` | `Promise<T>` |
| `parallel` | 并行执行 | `(tasks, concurrency?)` | `Promise<T[]>` |
| `withRetry` | 重试包装 | `(fn, options?: { retries?, retryDelay?, shouldRetry? })` | 带重试的函数 |
| `rateLimit` | 速率限制 | `(fn, limit, interval)` | 限速函数 |

## 类型定义

```typescript
/**
 * 防抖函数选项
 */
interface DebounceOptions {
  /** 等待时间（毫秒），默认 300 */
  wait?: number
  /** 是否立即执行，默认 false */
  immediate?: boolean
}

/**
 * 节流函数选项
 */
interface ThrottleOptions {
  /** 是否在开始时执行，默认 true */
  leading?: boolean
  /** 是否在结束时执行，默认 true */
  trailing?: boolean
}

/**
 * 重试选项
 */
interface RetryOptions {
  /** 最大尝试次数，默认 3 */
  maxAttempts?: number
  /** 重试间隔（毫秒），默认 1000 */
  delay?: number
  /** 间隔增长系数（指数退避），默认 2 */
  backoff?: number
}

/**
 * withRetry 选项
 */
interface WithRetryOptions {
  /** 重试次数，默认 3 */
  retries?: number
  /** 重试间隔（毫秒），默认 300 */
  retryDelay?: number
  /** 是否应该重试的判断函数 */
  shouldRetry?: (error: any) => boolean
}

/**
 * 带取消方法的防抖/节流函数
 */
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>
  /** 取消等待中的执行 */
  cancel: () => void
}

/**
 * 自定义请求头
 */
type CustomHeaders = Record<string, string>

/**
 * 自定义请求配置
 */
interface CustomRequestOptions {
  header?: CustomHeaders
  timeout?: number
  [key: string]: any
}
```

## 平台兼容性

| 函数 | H5 | 微信小程序 | 支付宝小程序 | APP | 备注 |
|------|:---:|:---:|:---:|:---:|------|
| `copy` | ✅ | ✅ | ✅ | ✅ | H5 需 HTTPS 或 localhost |
| `paste` | ✅ | ✅ | ✅ | ✅ | H5 需用户授权 |
| `withHeaders` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `debounce` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `throttle` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `once` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `delay` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `retry` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `withTimeout` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `curry` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `partial` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `memoize` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `serial` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `parallel` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `withRetry` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |
| `rateLimit` | ✅ | ✅ | ✅ | ✅ | 纯 JS 实现 |

## 性能优化建议

### 1. 合理设置防抖/节流时间

```typescript
// 搜索输入 - 300ms 较为合适
const search = debounce(handleSearch, 300)

// 窗口调整 - 100-200ms
const resize = debounce(handleResize, 150)

// 滚动事件 - 50-100ms
const scroll = throttle(handleScroll, 100)

// 按钮防重复点击 - 1000-2000ms
const submit = throttle(handleSubmit, 2000)
```

### 2. 避免过度记忆化

```typescript
// ❌ 不适合记忆化 - 参数变化频繁
const badMemoize = memoize((timestamp: number) => {
  return new Date(timestamp).toLocaleString()
})

// ✅ 适合记忆化 - 参数稳定，计算昂贵
const goodMemoize = memoize((userId: string) => {
  return complexCalculation(userId)
})
```

### 3. 清理不再需要的定时器

```typescript
const debouncedFn = debounce(handler, 300)
const throttledFn = throttle(handler, 100)

onUnmounted(() => {
  debouncedFn.cancel()
  throttledFn.cancel()
})
```

### 4. 合理设置并发限制

```typescript
// 文件上传 - 限制 3 个并发
const uploadResults = await parallel(uploadTasks, 3)

// API 请求 - 限制 5 个并发
const apiResults = await parallel(apiTasks, 5)

// 图片处理 - 限制 2 个并发 (内存敏感)
const imageResults = await parallel(imageTasks, 2)
```

## 最佳实践

### 1. 搜索使用防抖

```typescript
// ✅ 推荐 - 搜索输入使用防抖
const debouncedSearch = debounce(search, 300)

// ❌ 不推荐 - 搜索使用节流 (会丢失最后一次输入)
const throttledSearch = throttle(search, 300)
```

### 2. 滚动使用节流

```typescript
// ✅ 推荐 - 滚动事件使用节流
const throttledScroll = throttle(handleScroll, 100)

// ❌ 不推荐 - 滚动使用防抖 (会有明显延迟)
const debouncedScroll = debounce(handleScroll, 100)
```

### 3. 初始化使用 once

```typescript
// ✅ 推荐 - 确保只初始化一次
const init = once(async () => {
  await loadConfig()
  await setupListeners()
})

// ❌ 不推荐 - 手动标记
let initialized = false
const init = async () => {
  if (initialized) return
  initialized = true
  // ...
}
```

### 4. 计算结果使用 memoize

```typescript
// ✅ 推荐 - 缓存计算结果
const memoizedCalc = memoize(expensiveCalculation)

// ✅ 推荐 - 缓存 API 结果
const cachedFetch = memoize(fetchUserInfo)

// ❌ 不推荐 - 缓存频繁变化的数据
const badCache = memoize(() => Date.now())
```

### 5. API 请求使用重试和超时

```typescript
// ✅ 推荐 - 结合超时和重试
const reliableFetch = withRetry(
  withTimeout(api.getData, 5000),
  { retries: 3, retryDelay: 1000 }
)

// ❌ 不推荐 - 无保护的直接调用
const data = await api.getData() // 可能永久等待
```

### 6. 批量操作使用并发控制

```typescript
// ✅ 推荐 - 限制并发数
const results = await parallel(tasks, 5)

// ❌ 不推荐 - 无限制并发
const results = await Promise.all(tasks.map(t => t()))
```

## 常见问题

### 1. debounce 和 throttle 的区别？

| 特性 | debounce (防抖) | throttle (节流) |
|------|----------------|-----------------|
| 执行时机 | 停止触发后等待指定时间 | 每隔指定时间执行一次 |
| 连续快速调用 | 只执行最后一次 | 按固定频率执行 |
| 适用场景 | 搜索框输入、表单验证 | 滚动监听、拖拽、resize |
| 响应性 | 有延迟 | 响应及时 |

```typescript
// debounce: 用户停止输入 300ms 后才搜索
const search = debounce(handleSearch, 300)

// throttle: 滚动时每 100ms 检查一次
const scroll = throttle(checkScroll, 100)
```

### 2. memoize 的缓存何时清除？

默认情况下，memoize 创建的缓存不会自动清除。可以通过以下方式管理：

```typescript
// 方案1: 重新创建函数
let cachedFetch = memoize(fetchUser)

const clearCache = () => {
  cachedFetch = memoize(fetchUser)
}

// 方案2: 自定义缓存管理
const createClearableMemoize = (fn) => {
  const cache = new Map()

  const memoized = (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }

  memoized.clear = () => cache.clear()
  return memoized
}

// 方案3: 使用自定义 resolver 加入时间戳
const timeBasedCache = memoize(
  fetchData,
  (...args) => `${JSON.stringify(args)}:${Math.floor(Date.now() / 60000)}`
  // 缓存 1 分钟自动失效
)
```

### 3. retry 会无限重试吗？

不会。`retry` 函数需要指定 `maxAttempts` 参数（默认为 3），达到最大尝试次数后会抛出错误：

```typescript
try {
  await retry(
    () => api.getData(),
    { maxAttempts: 5 }
  )
} catch (error) {
  // 5 次尝试全部失败后抛出
  console.error('最大尝试次数已达到:', error)
}
```

### 4. parallel 和 Promise.all 的区别？

| 特性 | parallel | Promise.all |
|------|----------|-------------|
| 并发控制 | 支持限制并发数 | 不支持 |
| 结果顺序 | 保持原始顺序 | 保持原始顺序 |
| 错误处理 | 遇到错误立即停止 | 遇到错误立即 reject |

```typescript
// parallel 可以限制并发
const results = await parallel(tasks, 3) // 最多同时 3 个

// Promise.all 无法限制
const results = await Promise.all(tasks.map(t => t())) // 全部同时执行
```

### 5. 如何在 Vue 组件中正确清理？

```typescript
import { debounce, throttle } from '@/utils/function'

const debouncedFn = debounce(handler, 300)
const throttledFn = throttle(handler, 100)

// ✅ 组件销毁时清理
onUnmounted(() => {
  debouncedFn.cancel()
  throttledFn.cancel()
})

// ✅ 或使用 onBeforeUnmount
onBeforeUnmount(() => {
  debouncedFn.cancel()
  throttledFn.cancel()
})
```

### 6. withTimeout 超时后原函数还会继续执行吗？

是的，`withTimeout` 只是在超时后 reject Promise，原函数仍会继续执行。如果需要真正取消，需要在原函数中实现取消逻辑：

```typescript
// withTimeout 无法取消原函数
const fetchWithTimeout = withTimeout(api.getData, 5000)

// 如需真正取消，使用 AbortController
const fetchWithAbort = async (signal: AbortSignal) => {
  const response = await fetch('/api/data', { signal })
  return response.json()
}

const controller = new AbortController()
setTimeout(() => controller.abort(), 5000)

try {
  const data = await fetchWithAbort(controller.signal)
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求已取消')
  }
}
```

### 7. curry 和 partial 有什么区别？

| 特性 | curry | partial |
|------|-------|---------|
| 参数固定方式 | 逐个接收 | 一次性固定部分参数 |
| 调用方式 | `fn(a)(b)(c)` 或 `fn(a, b)(c)` | `fn(c)` (a, b 已固定) |
| 灵活性 | 更灵活，可任意组合 | 简单直接 |

```typescript
const add = (a, b, c) => a + b + c

// curry - 可以各种方式调用
const curriedAdd = curry(add)
curriedAdd(1)(2)(3)   // 6
curriedAdd(1, 2)(3)   // 6

// partial - 固定前面的参数
const add1 = partial(add, 1)    // 固定 a=1
add1(2, 3)                      // 6

const add1and2 = partial(add, 1, 2)  // 固定 a=1, b=2
add1and2(3)                          // 6
```

### 8. rateLimit 队列满了会怎样？

`rateLimit` 会将超出限制的请求放入队列中等待执行，不会丢弃：

```typescript
const limited = rateLimit(api.request, 2, 1000) // 每秒最多 2 次

// 同时发起 10 个请求
const promises = Array(10).fill(0).map((_, i) => limited(i))

// 执行顺序:
// 0ms: 请求 0, 1 立即执行
// 500ms: 请求 2, 3 执行
// 1000ms: 请求 4, 5 执行
// ...
// 所有请求最终都会执行完成
const results = await Promise.all(promises)
```
