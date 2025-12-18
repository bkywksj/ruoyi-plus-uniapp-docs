# function 函数工具

## 介绍

`function` 是函数工具集，提供剪贴板操作、函数防抖节流、执行控制、函数变换和异步处理等功能。该工具集封装了常用的函数式编程模式，提升代码的可复用性和可维护性。

**核心特性:**

- **剪贴板操作** - 复制和粘贴功能封装
- **防抖节流** - debounce 和 throttle 实现
- **执行控制** - once、delay、retry 等控制函数
- **函数变换** - curry、partial、memoize 等高阶函数
- **异步处理** - 并行、串行、超时、重试等异步工具

## 剪贴板操作

### copy

复制文本到剪贴板：

```typescript
import { copy } from '@/utils/function'

// 基本用法
const handleCopy = async () => {
  const success = await copy('要复制的文本')
  if (success) {
    uni.showToast({ title: '复制成功' })
  } else {
    uni.showToast({ title: '复制失败', icon: 'none' })
  }
}

// 复制链接
const copyLink = async (url: string) => {
  await copy(url)
  uni.showToast({ title: '链接已复制' })
}

// 复制邀请码
const copyInviteCode = () => {
  copy(inviteCode.value)
}
```

### paste

从剪贴板粘贴文本：

```typescript
import { paste } from '@/utils/function'

// 基本用法
const handlePaste = async () => {
  const text = await paste()
  if (text) {
    inputValue.value = text
  }
}

// 粘贴到输入框
const pasteToInput = async () => {
  const content = await paste()
  if (content) {
    form.content = content
  }
}
```

## 防抖与节流

### debounce

防抖函数，延迟执行：

```typescript
import { debounce } from '@/utils/function'

// 搜索防抖
const handleSearch = debounce((keyword: string) => {
  api.search(keyword).then(res => {
    searchResults.value = res.data
  })
}, 300)

// 输入时调用
<input @input="e => handleSearch(e.target.value)" />

// 窗口调整防抖
const handleResize = debounce(() => {
  recalculateLayout()
}, 200)

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
```

### throttle

节流函数，限制执行频率：

```typescript
import { throttle } from '@/utils/function'

// 滚动节流
const handleScroll = throttle(() => {
  checkLoadMore()
}, 100)

// 按钮点击节流（防止重复提交）
const handleSubmit = throttle(async () => {
  await submitForm()
}, 1000)

// 鼠标移动节流
const handleMouseMove = throttle((e: MouseEvent) => {
  updateTooltipPosition(e.clientX, e.clientY)
}, 50)
```

## 执行控制

### once

确保函数只执行一次：

```typescript
import { once } from '@/utils/function'

// 初始化只执行一次
const initialize = once(() => {
  console.log('初始化配置')
  loadConfig()
})

// 多次调用只执行一次
initialize() // 执行
initialize() // 不执行
initialize() // 不执行

// 单例模式
const createConnection = once(() => {
  return new WebSocket('ws://example.com')
})
```

### delay

延迟执行：

```typescript
import { delay } from '@/utils/function'

// 延迟 1 秒
await delay(1000)
console.log('1秒后执行')

// 延迟后执行操作
const showTip = async () => {
  await delay(2000)
  tip.value = '操作成功'
  await delay(3000)
  tip.value = ''
}

// 轮询场景
const poll = async () => {
  while (true) {
    const status = await checkStatus()
    if (status === 'completed') break
    await delay(1000)
  }
}
```

### retry

失败重试：

```typescript
import { retry } from '@/utils/function'

// 基本重试
const fetchData = async () => {
  const result = await retry(
    () => api.getData(),
    3 // 重试 3 次
  )
  return result
}

// 带延迟的重试
const uploadFile = async (file: File) => {
  const result = await retry(
    () => api.upload(file),
    3,    // 重试次数
    1000  // 重试间隔 1 秒
  )
  return result
}

// 自定义重试条件
const fetchWithCondition = async () => {
  const result = await retry(
    async () => {
      const res = await api.getData()
      if (res.code !== 200) {
        throw new Error('请求失败')
      }
      return res
    },
    5
  )
  return result
}
```

## 函数变换

### curry

函数柯里化：

```typescript
import { curry } from '@/utils/function'

// 普通函数
const add = (a: number, b: number, c: number) => a + b + c

// 柯里化
const curriedAdd = curry(add)

// 多种调用方式
curriedAdd(1)(2)(3)     // 6
curriedAdd(1, 2)(3)     // 6
curriedAdd(1)(2, 3)     // 6
curriedAdd(1, 2, 3)     // 6

// 实际应用：创建特定配置的函数
const formatDate = curry((format: string, date: Date) => {
  // 格式化逻辑
})

const formatYMD = formatDate('YYYY-MM-DD')
const formatTime = formatDate('HH:mm:ss')

formatYMD(new Date()) // '2024-01-01'
formatTime(new Date()) // '12:30:00'
```

### partial

偏函数应用：

```typescript
import { partial } from '@/utils/function'

// 原函数
const greet = (greeting: string, name: string) => `${greeting}, ${name}!`

// 偏函数
const sayHello = partial(greet, 'Hello')
const sayHi = partial(greet, 'Hi')

sayHello('World') // 'Hello, World!'
sayHi('Tom')      // 'Hi, Tom!'

// 实际应用：预设 API 配置
const request = (method: string, url: string, data?: any) => {
  return fetch(url, { method, body: JSON.stringify(data) })
}

const get = partial(request, 'GET')
const post = partial(request, 'POST')

get('/api/users')
post('/api/users', { name: 'Tom' })
```

### memoize

函数结果缓存：

```typescript
import { memoize } from '@/utils/function'

// 计算密集型函数
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

// 第一次计算
fibonacci(40) // 计算并缓存

// 后续调用直接返回缓存结果
fibonacci(40) // 直接返回缓存

// API 请求缓存
const fetchUserInfo = memoize(async (userId: string) => {
  const res = await api.getUser(userId)
  return res.data
})

// 相同参数只请求一次
await fetchUserInfo('123') // 发起请求
await fetchUserInfo('123') // 返回缓存
await fetchUserInfo('456') // 发起新请求
```

## 异步处理

### withTimeout

添加超时限制：

```typescript
import { withTimeout } from '@/utils/function'

// 设置 5 秒超时
const fetchWithTimeout = withTimeout(api.getData, 5000)

try {
  const result = await fetchWithTimeout()
} catch (error) {
  if (error.message === 'Timeout') {
    console.log('请求超时')
  }
}

// 上传文件带超时
const uploadWithTimeout = async (file: File) => {
  const upload = withTimeout(() => api.upload(file), 30000)

  try {
    return await upload()
  } catch (error) {
    uni.showToast({ title: '上传超时', icon: 'none' })
    throw error
  }
}
```

### serial

串行执行多个异步任务：

```typescript
import { serial } from '@/utils/function'

// 按顺序执行
const tasks = [
  () => api.step1(),
  () => api.step2(),
  () => api.step3()
]

const results = await serial(tasks)
// results = [step1结果, step2结果, step3结果]

// 实际应用：表单分步提交
const submitSteps = async () => {
  const steps = [
    () => validateForm(),
    () => uploadFiles(),
    () => submitData(),
    () => sendNotification()
  ]

  try {
    await serial(steps)
    uni.showToast({ title: '提交成功' })
  } catch (error) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}
```

### parallel

并行执行多个异步任务：

```typescript
import { parallel } from '@/utils/function'

// 并行执行
const tasks = [
  () => api.getUsers(),
  () => api.getOrders(),
  () => api.getMessages()
]

const [users, orders, messages] = await parallel(tasks)

// 带并发限制
const uploadFiles = async (files: File[]) => {
  const tasks = files.map(file => () => api.upload(file))

  // 最多同时上传 3 个
  const results = await parallel(tasks, 3)
  return results
}
```

### withRetry

带重试的函数执行：

```typescript
import { withRetry } from '@/utils/function'

// 创建带重试的函数
const reliableFetch = withRetry(api.getData, {
  retries: 3,
  delay: 1000,
  onRetry: (error, attempt) => {
    console.log(`第 ${attempt} 次重试`, error.message)
  }
})

// 使用
const data = await reliableFetch()
```

### rateLimit

速率限制：

```typescript
import { rateLimit } from '@/utils/function'

// 每秒最多执行 5 次
const limitedApi = rateLimit(api.request, 5, 1000)

// 批量请求时自动限速
const fetchAll = async (ids: string[]) => {
  const results = await Promise.all(
    ids.map(id => limitedApi(id))
  )
  return results
}
```

## 实际应用场景

### 搜索组件

```typescript
import { debounce, memoize } from '@/utils/function'

// 搜索建议缓存
const fetchSuggestions = memoize(async (keyword: string) => {
  const res = await api.getSuggestions(keyword)
  return res.data
})

// 防抖搜索
const search = debounce(async (keyword: string) => {
  if (!keyword.trim()) {
    suggestions.value = []
    return
  }

  loading.value = true
  suggestions.value = await fetchSuggestions(keyword)
  loading.value = false
}, 300)
```

### 表单提交

```typescript
import { throttle, withTimeout } from '@/utils/function'

// 防止重复提交 + 超时处理
const handleSubmit = throttle(async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const submitWithTimeout = withTimeout(
      () => api.submitForm(formData),
      10000
    )

    await submitWithTimeout()
    uni.showToast({ title: '提交成功' })
    uni.navigateBack()
  } catch (error) {
    uni.showToast({
      title: error.message === 'Timeout' ? '请求超时' : '提交失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}, 2000)
```

### 数据加载

```typescript
import { retry, parallel, memoize } from '@/utils/function'

// 页面数据加载
const loadPageData = async () => {
  loading.value = true

  // 并行加载多个数据
  const [userData, orderData, messageData] = await parallel([
    () => retry(() => api.getUser(), 2),
    () => retry(() => api.getOrders(), 2),
    () => retry(() => api.getMessages(), 2)
  ])

  user.value = userData
  orders.value = orderData
  messages.value = messageData

  loading.value = false
}
```

## API

### 剪贴板函数

| 函数 | 说明 | 返回值 |
|------|------|--------|
| copy | 复制文本 | `Promise<boolean>` |
| paste | 粘贴文本 | `Promise<string \| null>` |

### 控制函数

| 函数 | 说明 | 参数 |
|------|------|------|
| debounce | 防抖 | `(fn, delay)` |
| throttle | 节流 | `(fn, delay)` |
| once | 单次执行 | `(fn)` |
| delay | 延迟 | `(ms)` |
| retry | 重试 | `(fn, retries, delay)` |

### 变换函数

| 函数 | 说明 | 参数 |
|------|------|------|
| curry | 柯里化 | `(fn)` |
| partial | 偏函数 | `(fn, ...args)` |
| memoize | 记忆化 | `(fn)` |

### 异步函数

| 函数 | 说明 | 参数 |
|------|------|------|
| withTimeout | 超时包装 | `(fn, timeout)` |
| serial | 串行执行 | `(tasks)` |
| parallel | 并行执行 | `(tasks, concurrency)` |
| withRetry | 重试包装 | `(fn, options)` |
| rateLimit | 速率限制 | `(fn, limit, interval)` |

## 最佳实践

### 1. 搜索使用防抖

```typescript
// 搜索输入使用防抖
const debouncedSearch = debounce(search, 300)
```

### 2. 滚动使用节流

```typescript
// 滚动事件使用节流
const throttledScroll = throttle(handleScroll, 100)
```

### 3. 初始化使用 once

```typescript
// 确保只初始化一次
const init = once(initialize)
```

### 4. 计算结果使用 memoize

```typescript
// 缓存计算结果
const memoizedCalc = memoize(expensiveCalculation)
```

## 常见问题

### 1. debounce 和 throttle 的区别？

- `debounce`: 延迟执行，连续触发只执行最后一次
- `throttle`: 定期执行，限制执行频率

### 2. memoize 的缓存何时清除？

默认不会自动清除，可以通过函数返回的 `clear` 方法手动清除：

```typescript
const memoized = memoize(fn)
memoized.cache.clear() // 清除所有缓存
```

### 3. retry 会无限重试吗？

不会，需要指定最大重试次数，达到次数后会抛出最后一次的错误。
