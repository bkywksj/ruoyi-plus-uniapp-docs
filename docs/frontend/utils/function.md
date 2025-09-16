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
