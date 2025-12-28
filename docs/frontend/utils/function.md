# 函数工具 (function.ts)

函数工具类，提供复制文本、HTTP配置、防抖节流、函数执行控制、函数转换组合、异步函数工具等实用功能。

## 📖 概述

函数工具库包含以下功能类别：
- **复制文本到剪贴板**：复制文本并显示提示
- **快速创建带headers的配置**：HTTP请求配置工具
- **防抖与节流**：控制函数触发频率
- **函数执行控制**：控制函数执行方式
- **函数转换与组合**：转换函数调用方式
- **异步函数工具**：处理异步函数执行

## 📋 复制和HTTP工具

### copy

复制文本到剪贴板并显示提示。

```typescript
copy(text: string, message?: string): Promise<boolean>
```

**参数：**
- `text` - 要复制的文本
- `message` - 可选的提示消息，不传则使用默认提示

**返回值：**
- `Promise<boolean>` - 是否复制成功

**特性：**
- 优先使用现代 Clipboard API
- 自动降级到传统 `execCommand` 方法
- 智能提示消息（长文本显示"复制成功"，短文本显示具体内容）
- 自动显示成功/失败提示

**示例：**
```typescript
// 基本用法
await copy('Hello World')  // 显示："复制成功: Hello World"

// 自定义提示消息
await copy('很长的文本内容...', '代码复制成功')  // 显示："代码复制成功"

// 检查复制结果
const success = await copy('text to copy')
if (success) {
  console.log('复制成功')
} else {
  console.log('复制失败')
}

// 复制长文本
const longText = '这是一段很长的文本...'  // 超过200字符
await copy(longText)  // 显示："复制成功"（不显示具体内容）
```

### withHeaders

快速创建带headers的HTTP配置。

```typescript
withHeaders(headers: CustomHeaders, config?: AxiosRequestConfig): AxiosRequestConfig
```

**参数：**
- `headers` - 自定义请求头
- `config` - 可选的Axios配置对象

**返回值：**
- `AxiosRequestConfig` - 包含headers的配置对象

**示例：**
```typescript
// 添加认证头
const config = withHeaders({ 
  'Authorization': 'Bearer token123',
  'Content-Type': 'application/json'
})

// 合并现有配置
const config2 = withHeaders(
  { 'X-API-Key': 'key123' },
  { timeout: 5000, method: 'POST' }
)

// 在API调用中使用
axios.get('/api/data', withHeaders({ 'Authorization': `Bearer ${token}` }))
```

## ⏱️ 防抖与节流

### debounce

函数防抖，在指定时间内多次调用，只执行最后一次（或第一次）。

```typescript
debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): ((...args: Parameters<T>) => void)
```

**参数：**
- `func` - 要防抖的函数
- `wait` - 等待时间（毫秒），默认300ms
- `immediate` - 是否立即执行，默认false

**返回值：**
- `Function` - 防抖处理后的函数，包含 `cancel` 方法用于取消

**使用场景：**
- 搜索框输入防抖
- 窗口resize事件
- 按钮点击防重复
- 表单提交防抖

**示例：**
```typescript
// 搜索框防抖
const searchDebounced = debounce((keyword: string) => {
  console.log('搜索:', keyword)
}, 500)

// 用户输入时调用
input.addEventListener('input', (e) => {
  searchDebounced(e.target.value)
})

// 窗口调整大小防抖
const handleResize = debounce(() => {
  console.log('窗口大小改变')
}, 200)
window.addEventListener('resize', handleResize)

// 立即执行模式（第一次点击立即响应，后续300ms内忽略）
const handleClick = debounce(() => {
  console.log('按钮被点击')
}, 300, true)
button.addEventListener('click', handleClick)

// 取消防抖
const debouncedFn = debounce(someFunction, 1000)
debouncedFn.cancel()  // 取消待执行的函数
```

### throttle

函数节流，在指定时间内，函数最多执行一次。

```typescript
throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  options: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => ReturnType<T>)
```

**参数：**
- `func` - 要节流的函数
- `wait` - 等待时间（毫秒），默认300ms
- `options` - 配置选项
    - `leading` - 是否在开始时执行一次，默认true
    - `trailing` - 是否在结束时再执行一次，默认true

**返回值：**
- `Function` - 节流处理后的函数，包含 `cancel` 方法

**使用场景：**
- 滚动事件优化
- 鼠标移动事件
- API请求限频
- 按钮连击限制

**示例：**
```typescript
// 滚动事件节流
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
}, 200)
window.addEventListener('scroll', handleScroll)

// API请求节流
const saveData = throttle(async (data) => {
  await api.saveData(data)
}, 1000)

// 不在开始和结束时执行
const throttledFn = throttle(someFunction, 200, { 
  leading: false, 
  trailing: false 
})

// 取消节流
const throttledFn2 = throttle(someFunction, 1000)
throttledFn2.cancel()  // 取消定时器
```

## 🎮 函数执行控制

### once

确保函数只执行一次。

```typescript
once<T extends (...args: any[]) => any>(func: T): ((...args: Parameters<T>) => ReturnType<T>)
```

**参数：**
- `func` - 要控制的函数

**返回值：**
- `Function` - 包装后的函数，只会执行一次

**使用场景：**
- 初始化函数
- 事件监听器
- 资源加载
- 单例模式

**示例：**
```typescript
// 初始化操作，只执行一次
const initialize = once(() => {
  console.log('系统初始化...')
  // 初始化代码
})

// 多次调用，实际只执行一次
initialize()  // 输出："系统初始化..."
initialize()  // 不执行
initialize()  // 不执行

// 带返回值的函数
const getConfig = once(() => {
  console.log('加载配置...')
  return { theme: 'dark', lang: 'zh-CN' }
})

const config1 = getConfig()  // 执行并返回配置
const config2 = getConfig()  // 直接返回之前的结果
console.log(config1 === config2)  // true
```

### delay

延迟执行函数。

```typescript
delay<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 0,
  ...args: Parameters<T>
): Promise<ReturnType<T>>
```

**参数：**
- `func` - 要延迟执行的函数
- `wait` - 延迟时间（毫秒），默认0
- `...args` - 传递给函数的参数

**返回值：**
- `Promise<ReturnType<T>>` - Promise，函数执行后resolve

**示例：**
```typescript
// 延迟1秒后执行
await delay(() => {
  console.log('延迟执行')
}, 1000)

// 延迟执行带参数的函数
await delay(console.log, 500, 'Hello', 'World')

// 延迟处理用户操作
button.addEventListener('click', async () => {
  showLoading()
  await delay(processData, 300, userData)
  hideLoading()
})

// 模拟网络延迟
const mockApiCall = async (data) => {
  await delay(() => {}, 1000)  // 模拟1秒延迟
  return { success: true, data }
}
```

### retry

尝试多次执行函数，直到成功或达到最大尝试次数。

```typescript
retry<T>(
  func: () => Promise<T> | T,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: number
  } = {}
): Promise<T>
```

**参数：**
- `func` - 要执行的函数，应返回promise或值
- `options` - 配置选项
    - `maxAttempts` - 最大尝试次数，默认3
    - `delay` - 尝试间隔（毫秒），默认1000
    - `backoff` - 间隔增长系数，默认2（指数退避）

**返回值：**
- `Promise<T>` - 成功执行后resolve，或者尝试次数用完后reject

**使用场景：**
- 网络请求重试
- 文件操作重试
- 数据库连接重试
- 外部服务调用

**示例：**
```typescript
// 网络请求重试
const fetchData = async () => {
  const response = await fetch('/api/data')
  if (!response.ok) {
    throw new Error('请求失败')
  }
  return response.json()
}

try {
  const data = await retry(fetchData, {
    maxAttempts: 5,
    delay: 2000,
    backoff: 2
  })
  console.log('数据获取成功:', data)
} catch (error) {
  console.error('重试5次后仍然失败:', error.message)
}

// 文件读取重试
const readFile = async () => {
  // 可能失败的文件读取操作
  return fs.readFile('config.json', 'utf8')
}

const config = await retry(readFile, { maxAttempts: 3, delay: 500 })
```

### withTimeout

为函数添加超时控制。

```typescript
withTimeout<T, A extends any[]>(
  func: (...args: A) => Promise<T>,
  ms: number
): ((...args: A) => Promise<T>)
```

**参数：**
- `func` - 异步函数
- `ms` - 超时时间（毫秒）

**返回值：**
- `Function` - 带超时控制的函数

**示例：**
```typescript
// 为API请求添加5秒超时
const fetchWithTimeout = withTimeout(fetch, 5000)

try {
  const response = await fetchWithTimeout('/api/slow-endpoint')
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('请求超时')
  }
}

// 为数据处理添加超时
const processDataWithTimeout = withTimeout(processLargeData, 10000)

try {
  const result = await processDataWithTimeout(largeDataset)
} catch (error) {
  console.log('数据处理超时或出错:', error.message)
}
```

## 🔧 函数转换与组合

### curry

柯里化函数，将接受多个参数的函数转换为一系列接受单个参数的函数。

```typescript
curry<T extends (...args: any[]) => any>(func: T): any
```

**参数：**
- `func` - 要柯里化的函数

**返回值：**
- `Function` - 柯里化后的函数

**使用场景：**
- 函数复用
- 参数预设
- 函数组合
- 配置工厂

**示例：**
```typescript
// 基本柯里化
const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)

// 多种调用方式
curriedAdd(1)(2)(3)    // 6
curriedAdd(1, 2)(3)    // 6
curriedAdd(1)(2, 3)    // 6
curriedAdd(1, 2, 3)    // 6

// 创建专用函数
const add10 = curriedAdd(10)
const add10And5 = add10(5)

console.log(add10And5(3))  // 18

// 实际应用：格式化函数
const formatMessage = curry((level, module, message) => {
  return `[${level}] ${module}: ${message}`
})

const logError = formatMessage('ERROR')
const logUserError = logError('USER')

console.log(logUserError('登录失败'))  // "[ERROR] USER: 登录失败"
```

### partial

偏函数应用，固定函数的部分参数。

```typescript
partial<T extends (...args: any[]) => any>(
  func: T,
  ...partialArgs: any[]
): ((...args: any[]) => ReturnType<T>)
```

**参数：**
- `func` - 原始函数
- `...partialArgs` - 要固定的参数

**返回值：**
- `Function` - 新函数，接受剩余参数

**示例：**
```typescript
// 基本用法
const multiply = (a, b) => a * b
const double = partial(multiply, 2)
console.log(double(4))  // 8

// API调用封装
const fetchFromApi = (endpoint, params, options) => {
  return fetch(`/api/${endpoint}`, { ...options, params })
}

// 创建专用的API调用函数
const fetchUsers = partial(fetchFromApi, 'users')
const fetchUsersPaginated = partial(fetchUsers, { page: 1, size: 10 })

// 使用
fetchUsersPaginated({ sort: 'name' })
// 等同于 fetchFromApi('users', { page: 1, size: 10 }, { sort: 'name' })

// 事件处理
const handleEvent = (eventType, element, callback, event) => {
  console.log(`${eventType} on ${element.tagName}`)
  callback(event)
}

const handleClick = partial(handleEvent, 'click')
const handleButtonClick = partial(handleClick, document.getElementById('btn'))

// 绑定事件
button.addEventListener('click', handleButtonClick(e => console.log('clicked')))
```

### memoize

记忆化函数，缓存函数的计算结果。

```typescript
memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): ((...args: Parameters<T>) => ReturnType<T>)
```

**参数：**
- `func` - 要记忆化的函数
- `resolver` - 可选的键解析器函数，用于生成缓存键

**返回值：**
- `Function` - 记忆化后的函数

**使用场景：**
- 递归算法优化
- 昂贵的计算缓存
- API请求缓存
- 纯函数优化

**示例：**
```typescript
// 斐波那契数列优化
const fibonacci = memoize((n) => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

console.time('fib40')
console.log(fibonacci(40))  // 快速计算，不会重复计算子问题
console.timeEnd('fib40')

// API请求缓存
const fetchUser = memoize(async (userId) => {
  console.log(`正在获取用户 ${userId} 的信息`)
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
})

// 多次调用相同参数，只会发送一次请求
const user1 = await fetchUser('123')  // 发送请求
const user2 = await fetchUser('123')  // 使用缓存
console.log(user1 === user2)  // true

// 自定义键解析器
const getUser = memoize(
  async (id, options) => {
    return api.fetchUser(id, options)
  },
  (id, options) => `user:${id}:${JSON.stringify(options)}`
)

// 计算密集型函数
const expensiveCalculation = memoize((data) => {
  console.log('执行复杂计算...')
  // 复杂的计算逻辑
  return data.reduce((sum, item) => sum + Math.sqrt(item), 0)
})
```

## ⚡ 异步函数工具

### serial

串行执行异步函数。

```typescript
serial<T>(funcs: ((arg?: any) => Promise<any>)[], initial?: any): Promise<T>
```

**参数：**
- `funcs` - 异步函数数组
- `initial` - 初始值

**返回值：**
- `Promise<T>` - 最终结果

**示例：**
```typescript
// 数据处理流水线
const processData = await serial([
  () => fetchRawData(),
  (data) => validateData(data),
  (validData) => transformData(validData),
  (transformedData) => saveData(transformedData)
])

// 初始化步骤
await serial([
  () => connectDatabase(),
  () => loadConfiguration(),
  () => startServices(),
  () => scheduleJobs()
])
```

### parallel

并行执行异步函数并限制并发数。

```typescript
parallel<T>(tasks: (() => Promise<T>)[], concurrency: number = Infinity): Promise<T[]>
```

**参数：**
- `tasks` - 异步任务数组
- `concurrency` - 并发限制数，默认无限制

**返回值：**
- `Promise<T[]>` - 所有任务的结果数组

**示例：**
```typescript
// 并行处理文件，最多同时处理3个
const files = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt']
const tasks = files.map(filename => () => processFile(filename))

const results = await parallel(tasks, 3)
console.log('所有文件处理完成:', results)

// 批量API请求
const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const fetchTasks = userIds.map(id => () => fetchUser(id))

// 限制并发为5，避免服务器压力过大
const users = await parallel(fetchTasks, 5)
```

### withRetry

为异步函数添加错误重试功能。

```typescript
withRetry<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: {
    retries?: number
    retryDelay?: number
    shouldRetry?: (error: any) => boolean
  } = {}
): ((...args: Parameters<T>) => Promise<ReturnType<T>>)
```

**参数：**
- `asyncFn` - 异步函数
- `options` - 重试选项
    - `retries` - 重试次数，默认3
    - `retryDelay` - 重试延迟，默认300ms
    - `shouldRetry` - 是否应该重试的判断函数

**返回值：**
- `Function` - 增强后的异步函数

**示例：**
```typescript
// 网络请求重试
const fetchWithRetry = withRetry(fetchData, {
  retries: 3,
  retryDelay: 1000,
  shouldRetry: (err) => err.status === 500 || err.status === 502
})

// 只在特定错误时重试
const apiCall = withRetry(callExternalAPI, {
  retries: 5,
  retryDelay: 2000,
  shouldRetry: (error) => {
    // 只在网络错误或服务器错误时重试
    return error.code === 'NETWORK_ERROR' || error.status >= 500
  }
})

const result = await apiCall(requestData)
```

### rateLimit

限制函数执行频率。

```typescript
rateLimit<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  interval: number
): ((...args: Parameters<T>) => Promise<ReturnType<T>>)
```

**参数：**
- `fn` - 要限制的函数
- `limit` - 限制次数
- `interval` - 时间间隔（毫秒）

**返回值：**
- `Function` - 限制后的函数

**示例：**
```typescript
// 限制API调用每分钟最多100次
const limitedFetch = rateLimit(fetch, 100, 60000)

// 限制发送邮件每小时最多10次
const sendEmailLimited = rateLimit(sendEmail, 10, 3600000)

// 使用
for (let i = 0; i < 200; i++) {
  // 自动排队，遵守频率限制
  limitedFetch(`/api/data/${i}`)
}
```

## 💡 使用技巧

### 1. 搜索框优化
结合防抖和节流优化用户体验：

```typescript
// 搜索防抖 + 请求节流
const searchInput = document.getElementById('search')
const searchResults = document.getElementById('results')

const performSearch = throttle(async (keyword) => {
  if (!keyword.trim()) return
  
  const results = await fetchSearchResults(keyword)
  renderResults(results)
}, 500)

const debouncedSearch = debounce((keyword) => {
  performSearch(keyword)
}, 300)

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

### 2. 配置化API调用
使用柯里化和偏函数创建配置化的API调用：

```typescript
// 基础API函数
const apiCall = curry((method, endpoint, headers, data) => {
  return fetch(`/api/${endpoint}`, {
    method,
    headers,
    body: JSON.stringify(data)
  })
})

// 创建专用函数
const get = apiCall('GET')
const post = apiCall('POST')
const authGet = get(null, { 'Authorization': `Bearer ${token}` })

// 使用
const userData = await authGet('user/profile')
const createUser = await post('users', { 'Content-Type': 'application/json' })
```

### 3. 错误处理和重试策略
构建健壮的异步操作：

```typescript
// 带重试和超时的网络请求
const robustFetch = withRetry(
  withTimeout(fetch, 10000), // 10秒超时
  {
    retries: 3,
    retryDelay: 1000,
    shouldRetry: (error) => {
      return error.name === 'TimeoutError' || 
             error.status >= 500 ||
             error.code === 'NETWORK_ERROR'
    }
  }
)

// 使用
try {
  const data = await robustFetch('/api/important-data')
} catch (error) {
  console.error('经过重试后仍然失败:', error)
}
```

### 4. 批处理优化
处理大量数据时的性能优化：

```typescript
// 大量数据的批处理
const processLargeDataset = async (items) => {
  // 将数据分组，每组100个
  const chunks = []
  for (let i = 0; i < items.length; i += 100) {
    chunks.push(items.slice(i, i + 100))
  }
  
  // 并行处理，限制并发为5
  const processTasks = chunks.map(chunk => () => processChunk(chunk))
  const results = await parallel(processTasks, 5)
  
  return results.flat()
}

// 记忆化昂贵的计算
const expensiveCalc = memoize((data) => {
  // 复杂计算
  return data.reduce((acc, item) => {
    // 昂贵的操作
    return acc + heavyCalculation(item)
  }, 0)
})
```

## ⚠️ 注意事项

1. **内存泄漏**：记忆化函数会保存缓存，长期运行的应用需要注意内存使用
2. **异步异常**：在异步函数工具中，确保正确处理Promise的reject
3. **上下文绑定**：使用防抖、节流时注意函数的this绑定问题
4. **取消机制**：及时取消不需要的防抖、节流函数，避免内存泄漏
5. **错误传播**：在函数组合中确保错误能正确向上传播

## ❓ 常见问题

### 1. 防抖函数在 Vue 组件中 this 指向错误

**问题描述:**

在 Vue 组件的方法中使用 `debounce`，防抖后的函数中 `this` 指向 `undefined` 或 `window`，无法访问组件实例。

**问题原因:**

- 防抖函数内部使用普通函数，丢失了原始 `this` 上下文
- 在 `setup` 中使用时未正确绑定组件实例
- 箭头函数与普通函数的 `this` 绑定规则不同

**解决方案:**

```typescript
// ❌ 错误：在 Options API 中直接使用
export default {
  methods: {
    // this 会丢失
    handleSearch: debounce(function(keyword) {
      console.log(this.searchResults)  // this 为 undefined
    }, 300)
  }
}

// ✅ 正确方案1：在 created 中创建防抖函数
export default {
  created() {
    this.handleSearch = debounce((keyword) => {
      // 使用箭头函数，自动绑定 this
      console.log(this.searchResults)  // 正确访问
    }, 300)
  },
  beforeUnmount() {
    // 组件销毁时取消防抖
    this.handleSearch?.cancel?.()
  }
}

// ✅ 正确方案2：Composition API 中使用
<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { debounce } from '@/utils/function'

const searchResults = ref([])

// 在 setup 中创建防抖函数
const handleSearch = debounce((keyword: string) => {
  // 直接访问响应式变量
  console.log('搜索:', keyword)
  fetchSearchResults(keyword).then(data => {
    searchResults.value = data
  })
}, 300)

// 组件卸载时取消
onUnmounted(() => {
  handleSearch.cancel?.()
})
</script>

// ✅ 正确方案3：使用 VueUse 的 useDebounceFn
import { useDebounceFn } from '@vueuse/core'

const handleSearch = useDebounceFn((keyword: string) => {
  // VueUse 自动处理组件卸载时的清理
  console.log('搜索:', keyword)
}, 300)
```

### 2. 节流函数导致最后一次调用丢失

**问题描述:**

使用节流函数处理滚动事件时，用户停止滚动后的最终位置没有被处理。

**问题原因:**

- 默认 `trailing` 选项为 `true`，但可能被错误配置为 `false`
- 组件卸载时节流函数被取消，导致待执行的调用丢失
- 节流周期结束前页面跳转，调用被丢弃

**解决方案:**

```typescript
// ❌ 错误：trailing 设置为 false，最后一次调用丢失
const handleScroll = throttle(() => {
  saveScrollPosition(window.scrollY)
}, 200, { trailing: false })

// ✅ 正确：确保 trailing 为 true（默认值）
const handleScroll = throttle(() => {
  saveScrollPosition(window.scrollY)
}, 200, { leading: true, trailing: true })

// ✅ 处理组件卸载时的未执行调用
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { throttle } from '@/utils/function'

let lastScrollY = 0

const handleScroll = throttle(() => {
  lastScrollY = window.scrollY
  saveScrollPosition(lastScrollY)
}, 200)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)

  // 确保最终状态被保存
  saveScrollPosition(lastScrollY)

  // 取消节流函数
  handleScroll.cancel?.()
})
</script>

// ✅ 页面离开时确保数据保存
import { onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave((to, from, next) => {
  // 立即执行待处理的调用
  handleScroll.flush?.()
  // 或者直接保存当前状态
  saveScrollPosition(window.scrollY)
  next()
})
```

### 3. memoize 缓存导致内存泄漏

**问题描述:**

使用 `memoize` 缓存函数结果，长时间运行后应用内存持续增长，最终导致性能问题或崩溃。

**问题原因:**

- 缓存没有过期机制，数据无限累积
- 缓存键使用对象引用，导致无法正确匹配
- 缓存了大量不再需要的数据

**解决方案:**

```typescript
// ❌ 错误：无限缓存，可能导致内存泄漏
const fetchUser = memoize(async (userId) => {
  return api.getUser(userId)
})

// ✅ 正确方案1：实现带过期时间的 memoize
const memoizeWithExpiry = <T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 60000,  // 默认60秒过期
  resolver?: (...args: Parameters<T>) => string
) => {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>()

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    const now = Date.now()
    const cached = cache.get(key)

    if (cached && cached.expiry > now) {
      return cached.value
    }

    const result = func(...args)
    cache.set(key, { value: result, expiry: now + ttl })
    return result
  }

  // 提供清理方法
  memoized.clear = () => cache.clear()
  memoized.delete = (key: string) => cache.delete(key)
  memoized.size = () => cache.size

  return memoized
}

// 使用带过期的 memoize
const fetchUser = memoizeWithExpiry(
  async (userId: string) => api.getUser(userId),
  5 * 60 * 1000  // 5分钟过期
)

// ✅ 正确方案2：限制缓存大小
const memoizeWithLimit = <T extends (...args: any[]) => any>(
  func: T,
  maxSize: number = 100,
  resolver?: (...args: Parameters<T>) => string
) => {
  const cache = new Map<string, ReturnType<T>>()

  return (...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    // 超过限制时删除最早的缓存
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }
}

// ✅ 正确方案3：在适当时机清理缓存
const cachedFetch = memoize(fetchData)

// 用户登出时清理
const logout = () => {
  cachedFetch.clear?.()
  // 其他登出逻辑
}

// 定期清理
setInterval(() => {
  cachedFetch.clear?.()
}, 30 * 60 * 1000)  // 每30分钟清理
```

### 4. retry 重试次数用完后错误处理不当

**问题描述:**

使用 `retry` 函数重试失败的操作，当达到最大重试次数后，错误没有被正确捕获或处理，导致 Unhandled Promise Rejection。

**问题原因:**

- 没有在外层使用 try-catch 捕获错误
- Promise 链中缺少 .catch() 处理
- 在 async 函数中未 await retry 的结果

**解决方案:**

```typescript
// ❌ 错误：未处理 retry 可能抛出的异常
const loadData = async () => {
  const data = await retry(fetchData, { maxAttempts: 3 })  // 可能抛出异常
  setData(data)
}

// 调用时也未处理
loadData()  // Unhandled Promise Rejection

// ✅ 正确方案1：使用 try-catch
const loadData = async () => {
  try {
    const data = await retry(fetchData, { maxAttempts: 3 })
    setData(data)
  } catch (error) {
    console.error('重试失败:', error)

    // 显示用户友好的错误提示
    ElMessage.error('数据加载失败，请稍后重试')

    // 设置默认值或空状态
    setData([])
    setError(error)
  }
}

// ✅ 正确方案2：提供 fallback 值
const loadDataWithFallback = async () => {
  try {
    return await retry(fetchData, { maxAttempts: 3 })
  } catch (error) {
    console.warn('使用缓存数据:', error)
    // 返回缓存或默认数据
    return getCachedData() || getDefaultData()
  }
}

// ✅ 正确方案3：封装通用的重试处理函数
const safeRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions & {
    fallback?: T | (() => T)
    onError?: (error: Error, attempts: number) => void
  }
): Promise<T> => {
  const { fallback, onError, ...retryOptions } = options

  try {
    return await retry(fn, retryOptions)
  } catch (error) {
    const attempts = retryOptions.maxAttempts || 3
    onError?.(error as Error, attempts)

    if (fallback !== undefined) {
      return typeof fallback === 'function' ? fallback() : fallback
    }

    throw error
  }
}

// 使用封装后的函数
const data = await safeRetry(fetchData, {
  maxAttempts: 3,
  delay: 1000,
  fallback: [],
  onError: (error, attempts) => {
    console.error(`${attempts}次重试后失败:`, error)
    ElMessage.warning('网络不稳定，已使用缓存数据')
  }
})
```

### 5. 柯里化函数类型推断失败

**问题描述:**

使用 `curry` 函数后，TypeScript 无法正确推断参数类型和返回值类型，导致类型检查错误或丢失类型提示。

**问题原因:**

- `curry` 函数的类型定义过于宽泛（`any`）
- TypeScript 难以推断可变参数的柯里化类型
- 嵌套函数调用导致类型丢失

**解决方案:**

```typescript
// ❌ 错误：类型丢失
const add = (a: number, b: number, c: number) => a + b + c
const curriedAdd = curry(add)  // 类型为 any

curriedAdd('1')('2')('3')  // 没有类型错误提示，但运行时会出问题

// ✅ 正确方案1：使用类型安全的柯里化实现
type Curry<F extends (...args: any[]) => any> =
  Parameters<F>['length'] extends 0 | 1
    ? F
    : F extends (a: infer A, ...rest: infer R) => infer Return
      ? (a: A) => Curry<(...args: R) => Return>
      : never

const typedCurry = <F extends (...args: any[]) => any>(fn: F): Curry<F> => {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn(...args)
    }
    return (...moreArgs: any[]) => curried(...args, ...moreArgs)
  } as Curry<F>
}

// 使用类型安全的版本
const add = (a: number, b: number, c: number) => a + b + c
const curriedAdd = typedCurry(add)

curriedAdd(1)(2)(3)      // ✅ 正确，类型推断为 number
// curriedAdd('1')       // ❌ 类型错误：Argument of type 'string' is not assignable

// ✅ 正确方案2：手动定义柯里化函数类型
interface CurriedAdd {
  (a: number): (b: number) => (c: number) => number
  (a: number, b: number): (c: number) => number
  (a: number, b: number, c: number): number
}

const curriedAddTyped: CurriedAdd = curry(add)

// ✅ 正确方案3：使用泛型约束
const createFormatter = <T extends Record<string, any>>(
  template: string
) => {
  return (data: T): string => {
    return template.replace(/\{(\w+)\}/g, (_, key) =>
      String(data[key as keyof T] ?? '')
    )
  }
}

// 类型安全的使用
interface User { name: string; age: number }
const formatUser = createFormatter<User>('Name: {name}, Age: {age}')
formatUser({ name: 'John', age: 30 })  // 类型检查通过
// formatUser({ invalid: 'key' })      // ❌ 类型错误
```

### 6. parallel 并发控制不生效

**问题描述:**

使用 `parallel` 函数限制并发数，但实际执行时所有任务同时开始，并发控制没有生效。

**问题原因:**

- 传入的是已经开始执行的 Promise，而不是返回 Promise 的函数
- 任务函数在传入 `parallel` 前就已被调用
- 对 `parallel` 函数的参数理解错误

**解决方案:**

```typescript
// ❌ 错误：传入已执行的 Promise
const tasks = userIds.map(id => fetchUser(id))  // 已经开始执行了！
const results = await parallel(tasks, 3)  // 并发控制无效

// ✅ 正确：传入返回 Promise 的函数
const tasks = userIds.map(id => () => fetchUser(id))  // 函数，未执行
const results = await parallel(tasks, 3)  // 并发控制生效

// ✅ 完整示例
const processUsersWithConcurrency = async (userIds: string[]) => {
  // 创建任务函数数组（注意是函数，不是 Promise）
  const tasks = userIds.map(id => {
    // 返回一个函数，该函数返回 Promise
    return async () => {
      console.log(`开始处理用户 ${id}`)
      const user = await fetchUser(id)
      console.log(`完成处理用户 ${id}`)
      return user
    }
  })

  // 限制并发为 5
  const results = await parallel(tasks, 5)
  return results
}

// ✅ 带进度跟踪的并发控制
const parallelWithProgress = async <T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  onProgress?: (completed: number, total: number) => void
): Promise<T[]> => {
  const results: T[] = []
  let completed = 0
  let running = 0
  let index = 0

  return new Promise((resolve, reject) => {
    const runNext = async () => {
      if (index >= tasks.length && running === 0) {
        resolve(results)
        return
      }

      while (running < concurrency && index < tasks.length) {
        const currentIndex = index++
        running++

        tasks[currentIndex]()
          .then(result => {
            results[currentIndex] = result
            completed++
            running--
            onProgress?.(completed, tasks.length)
            runNext()
          })
          .catch(reject)
      }
    }

    runNext()
  })
}

// 使用带进度的版本
await parallelWithProgress(tasks, 5, (completed, total) => {
  console.log(`进度: ${completed}/${total} (${Math.round(completed / total * 100)}%)`)
})
```

### 7. withTimeout 超时后原函数仍在执行

**问题描述:**

使用 `withTimeout` 给异步函数添加超时控制，超时后抛出了 TimeoutError，但原始的异步操作仍在后台继续执行。

**问题原因:**

- `withTimeout` 只是在超时时 reject Promise，并不能真正取消正在执行的操作
- JavaScript 中没有原生的方式取消 Promise
- 需要使用 AbortController 或类似机制配合

**解决方案:**

```typescript
// ❌ 问题：超时后原函数仍在执行
const fetchWithTimeout = withTimeout(fetch, 5000)
try {
  await fetchWithTimeout('/api/slow')
} catch (error) {
  console.log('超时了，但请求可能还在进行中...')
}

// ✅ 正确方案1：配合 AbortController 使用
const fetchWithAbort = async (url: string, timeout: number) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw error
  }
}

// ✅ 正确方案2：创建可取消的 Promise 包装器
const createCancellablePromise = <T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason?: any) => void,
    signal: AbortSignal
  ) => void | (() => void)
) => {
  const controller = new AbortController()
  let cleanup: (() => void) | void

  const promise = new Promise<T>((resolve, reject) => {
    cleanup = executor(resolve, reject, controller.signal)

    controller.signal.addEventListener('abort', () => {
      reject(new DOMException('Operation cancelled', 'AbortError'))
    })
  })

  return {
    promise,
    cancel: () => {
      controller.abort()
      cleanup?.()
    }
  }
}

// 使用可取消的 Promise
const { promise, cancel } = createCancellablePromise<Response>((resolve, reject, signal) => {
  fetch('/api/data', { signal })
    .then(resolve)
    .catch(reject)
})

// 超时取消
const timeoutId = setTimeout(cancel, 5000)
try {
  const response = await promise
  clearTimeout(timeoutId)
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求已取消')
  }
}

// ✅ 正确方案3：增强版 withTimeout
const withAbortableTimeout = <T, A extends any[]>(
  fn: (signal: AbortSignal, ...args: A) => Promise<T>,
  ms: number
) => {
  return async (...args: A): Promise<T> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ms)

    try {
      const result = await fn(controller.signal, ...args)
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error(`Operation timed out after ${ms}ms`)
      }
      throw error
    }
  }
}

// 使用
const fetchUserWithTimeout = withAbortableTimeout(
  async (signal, userId: string) => {
    const response = await fetch(`/api/users/${userId}`, { signal })
    return response.json()
  },
  5000
)
```

### 8. copy 函数在 Safari 浏览器中失败

**问题描述:**

`copy` 函数在 Chrome 和 Firefox 中正常工作，但在 Safari 浏览器（包括 iOS Safari）中失败，没有复制成功。

**问题原因:**

- Safari 对 Clipboard API 有更严格的安全限制
- 必须在用户交互的同步上下文中调用
- `navigator.clipboard.writeText` 在 Safari 中可能返回被拒绝的 Promise
- 降级方案 `execCommand` 也有兼容性问题

**解决方案:**

```typescript
// ✅ Safari 兼容的复制函数
const safeCopy = async (text: string, message?: string): Promise<boolean> => {
  // 方案1：优先使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      showSuccess(message || `复制成功: ${text.slice(0, 50)}`)
      return true
    } catch (error) {
      console.warn('Clipboard API 失败，尝试降级方案')
    }
  }

  // 方案2：使用临时 textarea 元素（Safari 兼容）
  try {
    const textArea = document.createElement('textarea')

    // 设置样式使其不可见但仍可被选中
    textArea.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 2em;
      height: 2em;
      padding: 0;
      border: none;
      outline: none;
      box-shadow: none;
      background: transparent;
      opacity: 0;
      z-index: -1;
    `

    textArea.value = text
    document.body.appendChild(textArea)

    // iOS Safari 需要特殊处理
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
      // iOS 需要使用 setSelectionRange
      textArea.contentEditable = 'true'
      textArea.readOnly = false

      const range = document.createRange()
      range.selectNodeContents(textArea)

      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)

      textArea.setSelectionRange(0, 999999)
    } else {
      textArea.focus()
      textArea.select()
    }

    const success = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (success) {
      showSuccess(message || `复制成功: ${text.slice(0, 50)}`)
      return true
    }

    throw new Error('execCommand 返回 false')
  } catch (error) {
    console.error('复制失败:', error)
    showError('复制失败，请手动复制')
    return false
  }
}

// ✅ 使用示例：确保在用户交互中调用
const CopyButton = () => {
  const handleClick = async (e: MouseEvent) => {
    // 必须在点击事件的同步上下文中开始复制操作
    const success = await safeCopy('要复制的文本')
    if (success) {
      // 可选：添加视觉反馈
      e.currentTarget.classList.add('copied')
      setTimeout(() => {
        e.currentTarget.classList.remove('copied')
      }, 2000)
    }
  }

  return (
    <button onClick={handleClick}>
      复制
    </button>
  )
}

// ❌ 错误：在异步回调中调用可能失败
const badExample = async () => {
  const data = await fetchData()  // 异步操作后
  await safeCopy(data.text)        // Safari 可能拒绝
}

// ✅ 正确：预先获取数据，在用户点击时立即复制
const goodExample = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData().then(setData)
  }, [])

  const handleCopy = () => {
    if (data) {
      safeCopy(data.text)  // 在用户点击的同步上下文中
    }
  }

  return <button onClick={handleCopy}>复制</button>
}
