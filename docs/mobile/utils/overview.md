# 工具函数概览

## 介绍

RuoYi-Plus-UniApp 移动端提供了一套完整且强大的工具函数库,涵盖字符串处理、日期时间、缓存管理、数据验证、加密解密、平台判断、函数式编程等多个领域。这些工具函数经过精心设计和优化,为移动端开发提供了类型安全、性能高效、使用便捷的基础设施。

**核心特性:**

- **类型安全** - 全部使用 TypeScript 编写,提供完整的类型定义和智能提示
- **功能全面** - 涵盖 11 个大类、120+ 个实用工具函数
- **性能优化** - 针对移动端环境进行优化,确保高性能和低内存占用
- **平台兼容** - 支持 UniApp 所有平台(H5、小程序、APP),使用条件编译处理平台差异
- **开箱即用** - 提供统一的导入和使用方式,无需额外配置
- **详细文档** - 每个函数都包含完整的 JSDoc 注释和使用示例
- **测试完备** - 所有核心函数都经过充分测试,保证稳定可靠
- **按需引入** - 支持 Tree-shaking,只打包使用到的函数

## 工具函数分类

### 1. 函数工具 (Function Utils)

**文件**: `utils/function.ts` (738 行, 20+ 个函数)

提供函数式编程常用工具,包括防抖节流、函数执行控制、函数转换组合、异步处理等。

#### 1.1 剪贴板操作

**copy(text, message?)** - 复制文本到剪贴板
- 支持 H5、小程序、APP 所有平台
- H5 优先使用 Clipboard API,降级到 execCommand
- 小程序和 APP 使用 `uni.setClipboardData`
- 自动显示成功提示(可自定义)

```typescript
import { copy } from '@/utils/function'

// 基本用法
await copy('要复制的文本')

// 自定义提示
await copy(userInfo.phone, '手机号已复制')

// 复制对象(自动转JSON)
await copy(JSON.stringify(data))
```

**paste()** - 获取剪贴板内容
- H5 需要用户授权
- 小程序和 APP 直接获取

```typescript
import { paste } from '@/utils/function'

const text = await paste()
if (text) {
  console.log('剪贴板内容:', text)
}
```

#### 1.2 HTTP 请求配置

**withHeaders(header, config?)** - 快速创建带 headers 的请求配置

```typescript
import { withHeaders } from '@/utils/function'

// 添加认证头
const config = withHeaders({
  'Authorization': `Bearer ${token}`
})

// 合并现有配置
const config = withHeaders(
  { 'Custom-Header': 'value' },
  { timeout: 5000 }
)
```

#### 1.3 防抖与节流

**debounce(func, wait, immediate?)** - 函数防抖
- 在指定时间内多次调用,只执行最后一次(或第一次)
- 支持立即执行模式
- 返回的函数包含 `cancel()` 方法用于取消

```typescript
import { debounce } from '@/utils/function'

// 搜索输入防抖(300ms)
const handleSearch = debounce((keyword: string) => {
  searchApi(keyword)
}, 300)

// 立即执行模式:第一次调用立即执行,之后300ms内的调用被忽略
const handleClick = debounce(handleAction, 300, true)

// 取消防抖
handleSearch.cancel()
```

**throttle(func, wait, options?)** - 函数节流
- 在指定时间内,函数最多执行一次
- 支持配置开始和结束时是否执行
- 返回的函数包含 `cancel()` 方法

```typescript
import { throttle } from '@/utils/function'

// 滚动事件节流(200ms)
const handleScroll = throttle((event) => {
  console.log('滚动位置:', event.scrollTop)
}, 200)

// 自定义选项
const handleScroll = throttle(handler, 200, {
  leading: true,   // 开始时立即执行
  trailing: false  // 结束时不再执行
})

// 取消节流
handleScroll.cancel()
```

**技术实现:**
- 使用闭包保存定时器和状态
- leading 和 trailing 配置控制边界执行
- cancel 方法清理定时器和状态

#### 1.4 函数执行控制

**once(func)** - 确保函数只执行一次

```typescript
import { once } from '@/utils/function'

// 初始化操作只执行一次
const initialize = once(() => {
  console.log('初始化...')
  setupApp()
})

// 多次调用,实际只执行一次
initialize()  // 输出: 初始化...
initialize()  // 不执行
initialize()  // 不执行
```

**delay(func, wait, ...args)** - 延迟执行函数

```typescript
import { delay } from '@/utils/function'

// 延迟1秒后输出
await delay(console.log, 1000, 'Hello')

// 延迟处理用户操作
await delay(saveUserData, 500, userData)

// 链式使用
await delay(async () => {
  await fetchData()
  await processData()
}, 2000)
```

**retry(func, options?)** - 重试执行直到成功

```typescript
import { retry } from '@/utils/function'

// 基本用法:最多尝试3次,间隔1秒
await retry(unstableApiCall, {
  maxAttempts: 3,
  delay: 1000
})

// 指数退避:每次失败后等待时间翻倍
await retry(fetchData, {
  maxAttempts: 5,
  delay: 1000,
  backoff: 2  // 1s, 2s, 4s, 8s, 16s
})

// 实际应用
const [error, data] = await to(
  retry(
    () => uni.request({ url: '/api/user' }),
    { maxAttempts: 3, delay: 2000 }
  )
)
```

**withTimeout(func, ms)** - 为异步函数添加超时控制

```typescript
import { withTimeout } from '@/utils/function'

// 创建5秒超时的API调用
const fetchWithTimeout = withTimeout(fetchData, 5000)

try {
  const data = await fetchWithTimeout()
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('请求超时')
  }
}

// 应用到具体场景
const getUserInfo = withTimeout(
  () => uni.request({ url: '/api/user/info' }),
  3000
)
```

**技术实现:**
- 使用 `Promise.race` 实现超时竞争
- 超时后抛出特殊的 TimeoutError
- 清理定时器避免内存泄漏

#### 1.5 函数转换与组合

**curry(func)** - 柯里化函数

```typescript
import { curry } from '@/utils/function'

// 定义多参数函数
const add = (a: number, b: number, c: number) => a + b + c

// 柯里化
const curriedAdd = curry(add)

// 多种调用方式
curriedAdd(1)(2)(3)    // 6
curriedAdd(1, 2)(3)    // 6
curriedAdd(1)(2, 3)    // 6
curriedAdd(1, 2, 3)    // 6

// 实际应用:创建专用函数
const multiply = (a: number, b: number, c: number) => a * b * c
const curriedMultiply = curry(multiply)
const double = curriedMultiply(2)
const quadruple = double(2)
console.log(quadruple(5))  // 20
```

**partial(func, ...partialArgs)** - 偏函数应用

```typescript
import { partial } from '@/utils/function'

// 固定部分参数
const multiply = (a: number, b: number) => a * b
const double = partial(multiply, 2)
const triple = partial(multiply, 3)

console.log(double(5))   // 10
console.log(triple(5))   // 15

// API请求的实际应用
const fetchFromApi = (endpoint: string, params: any) => {
  return uni.request({
    url: `/api/${endpoint}`,
    data: params
  })
}

const fetchUsers = partial(fetchFromApi, 'users')
const fetchOrders = partial(fetchFromApi, 'orders')

// 使用
await fetchUsers({ page: 1 })
await fetchOrders({ status: 'pending' })
```

**memoize(func, resolver?)** - 记忆化函数,缓存计算结果

```typescript
import { memoize } from '@/utils/function'

// 斐波那契数列(递归优化)
const fib = memoize((n: number): number => {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
})

console.log(fib(40))  // 快速计算,不会重复计算子问题

// 自定义键解析器
const getUser = memoize(
  (id: number, force: boolean) => api.fetchUser(id, force),
  (id, force) => force ? `user:${id}:force` : `user:${id}`
)

// 复杂计算缓存
const expensiveCalculation = memoize((data: any[]) => {
  // 耗时计算
  return data.reduce((sum, item) => sum + item.value, 0)
})
```

**技术实现:**
- 使用 Map 存储缓存结果
- 默认使用 JSON.stringify 作为键
- 支持自定义键解析器提升性能

#### 1.6 异步函数工具

**serial(funcs, initial?)** - 串行执行异步函数

```typescript
import { serial } from '@/utils/function'

// 依次执行多个异步操作
await serial([
  () => fetchUsers(),
  (users) => filterActiveUsers(users),
  (activeUsers) => sortUsersByName(activeUsers)
])

// 数据处理管道
const result = await serial([
  () => loadData(),
  (data) => validateData(data),
  (validData) => transformData(validData),
  (transformed) => saveData(transformed)
], initialData)
```

**parallel(tasks, concurrency?)** - 并行执行异步函数并限制并发数

```typescript
import { parallel } from '@/utils/function'

// 同时处理所有任务
const results = await parallel([
  () => fetchUsers(),
  () => fetchOrders(),
  () => fetchProducts()
])

// 限制并发数(最多同时3个)
const results = await parallel(
  files.map(file => () => processFile(file)),
  3
)

// 批量上传文件
const uploadResults = await parallel(
  images.map(img => () => uploadImage(img)),
  5  // 最多同时上传5张
)
```

**技术实现:**
- 维护任务队列和执行计数
- 任务完成后自动执行下一个
- 所有任务完成后 resolve 结果数组

**withRetry(asyncFn, options?)** - 为异步函数添加重试功能

```typescript
import { withRetry } from '@/utils/function'

// 基本用法
const fetchWithRetry = withRetry(fetchData, {
  retries: 3,
  retryDelay: 1000
})

await fetchWithRetry(url)

// 条件重试:只在特定错误时重试
const smartFetch = withRetry(fetchData, {
  retries: 3,
  retryDelay: 1000,
  shouldRetry: (err) => {
    // 只在网络错误或429限流时重试
    return err.status === 429 || err.code === 'NETWORK_ERROR'
  }
})

// 应用示例
const uploadWithRetry = withRetry(uploadFile, {
  retries: 5,
  retryDelay: 2000,
  shouldRetry: (err) => err.type !== 'FILE_TOO_LARGE'
})
```

**rateLimit(fn, limit, interval)** - 限制函数执行频率

```typescript
import { rateLimit } from '@/utils/function'

// 限制API调用:每分钟最多100次
const limitedFetch = rateLimit(fetchData, 100, 60000)

// 使用
for (let i = 0; i < 200; i++) {
  // 自动排队,确保不超过限制
  await limitedFetch(i)
}

// 实际应用:批量操作
const batchProcess = rateLimit(
  (item) => processItem(item),
  50,    // 每30秒最多50次
  30000
)

await Promise.all(
  items.map(item => batchProcess(item))
)
```

**技术实现:**
- 维护执行队列和计数器
- 超过限制时自动等待
- 时间窗口滑动重置计数

### 2. 字符串工具 (String Utils)

**文件**: `utils/string.ts` (493 行, 21 个函数)

提供全面的字符串处理功能,包含基本操作、格式化、HTML 处理、URL 处理、路径处理、命名转换等。

#### 2.1 基本字符串操作

**parseStrEmpty(str)** - 转换空值为空字符串

```typescript
import { parseStrEmpty } from '@/utils/string'

parseStrEmpty(null)        // ''
parseStrEmpty(undefined)   // ''
parseStrEmpty('')          // ''
parseStrEmpty('hello')     // 'hello'
```

**isEmpty(str)** - 检查字符串是否为空

```typescript
import { isEmpty } from '@/utils/string'

isEmpty('')            // true
isEmpty('   ')         // true (trim后为空)
isEmpty(null)          // true
isEmpty(undefined)     // true
isEmpty('hello')       // false
```

**capitalize(str)** - 首字母大写

```typescript
import { capitalize } from '@/utils/string'

capitalize('hello')      // 'Hello'
capitalize('WORLD')      // 'WORLD'
capitalize('hello world') // 'Hello world'
```

**truncate(str, maxLength, suffix?)** - 截断字符串

```typescript
import { truncate } from '@/utils/string'

truncate('这是一段很长的文本内容', 10)
// '这是一段很长的文...'

truncate('Short', 10)
// 'Short'

// 自定义省略符
truncate('Long text here', 10, '…')
// 'Long text…'
```

**byteLength(str)** - 计算字符串字节长度(中文2字节)

```typescript
import { byteLength } from '@/utils/string'

byteLength('Hello')      // 5
byteLength('你好')       // 4
byteLength('Hello你好')  // 9
```

**createUniqueString()** - 生成唯一标识符

```typescript
import { createUniqueString } from '@/utils/string'

const id1 = createUniqueString()  // 'uw8f9x_1678886400123'
const id2 = createUniqueString()  // 'uw8f9y_1678886400124'

// 用于生成唯一 key
const key = `item_${createUniqueString()}`
```

#### 2.2 字符串格式化

**sprintf(str, ...args)** - 格式化字符串(类似 C 语言)

```typescript
import { sprintf } from '@/utils/string'

sprintf('Hello %s', 'World')
// 'Hello World'

sprintf('用户 %s 在 %s 完成了操作', 'Admin', '2024-01-01')
// '用户 Admin 在 2024-01-01 完成了操作'

sprintf('%s 有 %d 条新消息', '张三', 5)
// '张三 有 5 条新消息'
```

#### 2.3 HTML 处理

**html2Text(html)** - HTML 转纯文本

```typescript
import { html2Text } from '@/utils/string'

const html = '<div><p>Hello <b>World</b></p></div>'
html2Text(html)  // 'Hello World'

const rich = '<h1>标题</h1><p>段落内容</p>'
html2Text(rich)  // '标题 段落内容'
```

**escapeHtml(html)** - 转义 HTML 特殊字符

```typescript
import { escapeHtml } from '@/utils/string'

escapeHtml('<script>alert("XSS")</script>')
// '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

escapeHtml('Tom & Jerry')
// 'Tom &amp; Jerry'
```

#### 2.4 URL 和路径处理

**isExternal(path)** - 判断是否外部链接

```typescript
import { isExternal } from '@/utils/string'

isExternal('https://example.com')     // true
isExternal('http://example.com')      // true
isExternal('/dashboard')              // false
isExternal('./relative')              // false
```

**getQueryObject(url)** - 解析 URL 查询参数

```typescript
import { getQueryObject } from '@/utils/string'

const params = getQueryObject('https://example.com?id=1&name=test')
// { id: '1', name: 'test' }

const params = getQueryObject(window.location.href)
console.log(params.page, params.sort)
```

**objectToQuery(params)** - 对象转查询字符串

```typescript
import { objectToQuery } from '@/utils/string'

objectToQuery({ page: 1, size: 20, keyword: '搜索' })
// 'page=1&size=20&keyword=%E6%90%9C%E7%B4%A2'

// 用于构建URL
const url = `/api/users?${objectToQuery(filters)}`
```

**normalizePath(path)** - 标准化路径格式

```typescript
import { normalizePath } from '@/utils/string'

normalizePath('/path//to///file')    // '/path/to/file'
normalizePath('path/to/file/')       // 'path/to/file'
normalizePath('../parent/./child')   // 'parent/child'
```

**isPathMatch(pattern, path)** - 路径模式匹配

```typescript
import { isPathMatch } from '@/utils/string'

isPathMatch('/user/*', '/user/123')           // true
isPathMatch('/user/:id', '/user/456')         // true
isPathMatch('/api/*/detail', '/api/user/detail')  // true
isPathMatch('/admin/*', '/user/list')         // false
```

#### 2.5 命名转换

**camelToKebab(str)** - 驼峰转短横线

```typescript
import { camelToKebab } from '@/utils/string'

camelToKebab('userName')       // 'user-name'
camelToKebab('getUserInfo')    // 'get-user-info'
camelToKebab('XMLHttpRequest') // 'xml-http-request'
```

**kebabToCamel(str)** - 短横线转驼峰

```typescript
import { kebabToCamel } from '@/utils/string'

kebabToCamel('user-name')      // 'userName'
kebabToCamel('get-user-info')  // 'getUserInfo'
kebabToCamel('my-component')   // 'myComponent'
```

#### 2.6 验证工具

**isValidJSON(str)** - 验证 JSON 格式

```typescript
import { isValidJSON } from '@/utils/string'

isValidJSON('{"name":"test"}')     // true
isValidJSON('[1,2,3]')             // true
isValidJSON('not json')            // false
isValidJSON('{"invalid}')          // false
```

### 3. 日期时间工具 (Date Utils)

**文件**: `utils/date.ts` (403 行, 18 个函数)

提供强大的日期时间处理功能,支持多种格式、相对时间、日期计算等。

#### 3.1 日期格式化

**formatDate(time, pattern?)** - 日期格式化

```typescript
import { formatDate } from '@/utils/date'

const date = new Date()

// 默认格式 yyyy-MM-dd HH:mm:ss
formatDate(date)
// '2024-01-15 14:30:00'

// 自定义格式
formatDate(date, 'yyyy-MM-dd')         // '2024-01-15'
formatDate(date, 'yyyy/MM/dd')         // '2024/01/15'
formatDate(date, 'HH:mm:ss')           // '14:30:00'
formatDate(date, 'yyyy年MM月dd日')    // '2024年01月15日'

// 时间戳(自动识别10位或13位)
formatDate(1678886400, 'yyyy-MM-dd')       // 2023-03-15
formatDate(1678886400000, 'yyyy-MM-dd')    // 2023-03-15

// 星期显示
formatDate(date, 'yyyy-MM-dd 星期W')
// '2024-01-15 星期一'
```

**格式化语法:**
- `yyyy/YYYY` - 四位年份
- `MM` - 月份(01-12)
- `dd` - 日期(01-31)
- `HH` - 小时(00-23)
- `mm` - 分钟(00-59)
- `ss` - 秒(00-59)
- `W` - 星期(一~日)

**formatRelativeTime(time)** - 相对时间(人性化显示)

```typescript
import { formatRelativeTime } from '@/utils/date'

const now = Date.now()

formatRelativeTime(now)                    // '刚刚'
formatRelativeTime(now - 30 * 1000)        // '30秒前'
formatRelativeTime(now - 5 * 60 * 1000)    // '5分钟前'
formatRelativeTime(now - 2 * 3600 * 1000)  // '2小时前'
formatRelativeTime(now - 24 * 3600 * 1000) // '1天前'
formatRelativeTime(now - 30 * 24 * 3600 * 1000) // '30天前'

// 超过30天显示完整日期
formatRelativeTime(new Date('2023-01-01'))
// '2023-01-01'
```

#### 3.2 获取当前时间

**getCurrentTime()** - 获取当前时间(HH:mm:ss)

```typescript
import { getCurrentTime } from '@/utils/date'

getCurrentTime()  // '14:30:25'
```

**getCurrentDate()** - 获取当前日期(yyyy-MM-dd)

```typescript
import { getCurrentDate } from '@/utils/date'

getCurrentDate()  // '2024-01-15'
```

**getCurrentDateTime()** - 获取当前完整日期时间

```typescript
import { getCurrentDateTime } from '@/utils/date'

getCurrentDateTime()  // '2024-01-15 14:30:25'
```

**getTimeStamp(type?)** - 获取时间戳

```typescript
import { getTimeStamp } from '@/utils/date'

getTimeStamp()      // 1678886400000 (13位毫秒)
getTimeStamp('s')   // 1678886400 (10位秒)
getTimeStamp('ms')  // 1678886400000 (13位毫秒)
```

#### 3.3 日期范围

**getDateRange(days)** - 获取日期范围

```typescript
import { getDateRange } from '@/utils/date'

// 最近7天
const [start, end] = getDateRange(7)
// ['2024-01-08', '2024-01-15']

// 最近30天
const [start, end] = getDateRange(30)
// ['2023-12-16', '2024-01-15']
```

**getCurrentWeekRange()** - 获取本周日期范围

```typescript
import { getCurrentWeekRange } from '@/utils/date'

const [monday, sunday] = getCurrentWeekRange()
// ['2024-01-08', '2024-01-14']
```

**getCurrentMonthRange()** - 获取本月日期范围

```typescript
import { getCurrentMonthRange } from '@/utils/date'

const [firstDay, lastDay] = getCurrentMonthRange()
// ['2024-01-01', '2024-01-31']
```

#### 3.4 日期计算

**getDaysBetween(start, end)** - 计算两日期间天数

```typescript
import { getDaysBetween } from '@/utils/date'

getDaysBetween('2024-01-01', '2024-01-15')  // 14
getDaysBetween(new Date('2024-01-01'), new Date('2024-12-31'))  // 365
```

**isSameDay(date1, date2)** - 判断是否同一天

```typescript
import { isSameDay } from '@/utils/date'

isSameDay('2024-01-15', '2024-01-15')  // true
isSameDay('2024-01-15 10:00', '2024-01-15 18:00')  // true
isSameDay('2024-01-15', '2024-01-16')  // false
```

**dateAdd(date, type, value)** - 日期加减

```typescript
import { dateAdd } from '@/utils/date'

const date = new Date('2024-01-15')

// 加3天
dateAdd(date, 'day', 3)     // Date('2024-01-18')

// 减2个月
dateAdd(date, 'month', -2)  // Date('2023-11-15')

// 加1年
dateAdd(date, 'year', 1)    // Date('2025-01-15')

// 支持类型: year, month, day, hour, minute, second
```

### 4. 缓存管理工具 (Cache Utils)

**文件**: `utils/cache.ts` (288 行)

基于 UniApp 存储 API 的优化缓存封装,提供类型安全、自动过期、前缀隔离等特性。

#### 4.1 核心 API

**cache.set<T>(key, value, expireSeconds?)** - 设置缓存

```typescript
import { cache } from '@/utils/cache'

// 基本用法
cache.set('userName', 'Admin')

// 设置过期时间(秒)
cache.set('token', 'abc123', 7 * 24 * 3600)  // 7天后过期

// 存储对象
cache.set('userInfo', {
  id: 1,
  name: 'Admin',
  role: 'admin'
})

// 存储数组
cache.set('tags', ['Vue', 'React', 'Angular'])
```

**cache.get<T>(key)** - 获取缓存

```typescript
import { cache } from '@/utils/cache'

// 基本用法
const userName = cache.get<string>('userName')

// 获取对象(自动解析)
const userInfo = cache.get<UserInfo>('userInfo')
console.log(userInfo?.name)

// 获取数组
const tags = cache.get<string[]>('tags')
tags?.forEach(tag => console.log(tag))

// 不存在或已过期返回 null
const expired = cache.get('expiredKey')  // null
```

**cache.remove(key)** - 移除缓存项

```typescript
import { cache } from '@/utils/cache'

cache.remove('token')
cache.remove('userInfo')
```

**cache.has(key)** - 检查缓存是否存在

```typescript
import { cache } from '@/utils/cache'

if (cache.has('token')) {
  console.log('用户已登录')
} else {
  console.log('用户未登录')
}
```

**cache.clearAll()** - 清除所有应用缓存

```typescript
import { cache } from '@/utils/cache'

// 用户登出时清除所有缓存
const logout = () => {
  cache.clearAll()
  uni.reLaunch({ url: '/pages/login/index' })
}
```

**cache.cleanup()** - 手动清理过期缓存

```typescript
import { cache } from '@/utils/cache'

// 应用启动时清理
onLaunch(() => {
  cache.cleanup()
})
```

**cache.getStats()** - 获取缓存统计信息

```typescript
import { cache } from '@/utils/cache'

const stats = cache.getStats()
console.log('总缓存数:', stats.totalCount)
console.log('有效缓存:', stats.validCount)
console.log('过期缓存:', stats.expiredCount)
console.log('占用空间:', stats.totalSize)
```

#### 4.2 使用示例

**用户信息缓存:**

```typescript
import { cache } from '@/utils/cache'

// 登录成功后缓存用户信息
const login = async (username: string, password: string) => {
  const [error, res] = await to(loginApi({ username, password }))

  if (!error && res) {
    // Token缓存7天
    cache.set('token', res.token, 7 * 24 * 3600)
    // 用户信息缓存1天
    cache.set('userInfo', res.userInfo, 24 * 3600)
    return res
  }
}

// 获取当前用户
const getCurrentUser = () => {
  return cache.get<UserInfo>('userInfo')
}

// 登出清除缓存
const logout = () => {
  cache.remove('token')
  cache.remove('userInfo')
}
```

**应用配置缓存:**

```typescript
import { cache } from '@/utils/cache'

// 缓存应用配置(30分钟)
const saveAppConfig = (config: AppConfig) => {
  cache.set('appConfig', config, 30 * 60)
}

// 获取配置(带默认值)
const getAppConfig = (): AppConfig => {
  return cache.get<AppConfig>('appConfig') || {
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  }
}
```

**搜索历史缓存:**

```typescript
import { cache } from '@/utils/cache'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

// 添加搜索历史
const addSearchHistory = (keyword: string) => {
  const history = cache.get<string[]>(HISTORY_KEY) || []

  // 去重并添加到开头
  const newHistory = [
    keyword,
    ...history.filter(item => item !== keyword)
  ].slice(0, MAX_HISTORY)

  cache.set(HISTORY_KEY, newHistory, 30 * 24 * 3600)  // 30天
}

// 获取搜索历史
const getSearchHistory = (): string[] => {
  return cache.get<string[]>(HISTORY_KEY) || []
}

// 清除搜索历史
const clearSearchHistory = () => {
  cache.remove(HISTORY_KEY)
}
```

#### 4.3 技术实现

**过期机制:**
- 缓存值存储格式: `{ value: T, expire: number | null }`
- `expire` 为 null 表示永不过期
- `expire` 为时间戳,读取时检查是否过期

**前缀隔离:**
- 所有键自动添加应用前缀: `app_${key}`
- 避免与系统或其他应用冲突

**类型安全:**
- 使用 TypeScript 泛型保证类型安全
- 自动序列化和反序列化对象

**自动清理:**
- `cleanup()` 遍历所有缓存,删除过期项
- 建议在应用启动时调用

### 5. 数据验证工具 (Validators)

**文件**: `utils/validators.ts` (1046 行, 60+ 个函数)

提供超过 60 个验证函数,涵盖文件、URL、字符串、类型、数值、日期、中国特定等多个领域。

#### 5.1 基础类型验证

**isString(value)** - 验证是否为字符串

```typescript
import { isString } from '@/utils/validators'

isString('hello')      // true
isString(123)          // false
isString(new String('hello'))  // true
```

**isNumber(value)** - 验证是否为有效数字

```typescript
import { isNumber } from '@/utils/validators'

isNumber(123)          // true
isNumber('123')        // true
isNumber(3.14)         // true
isNumber('3.14')       // true
isNumber(NaN)          // false
isNumber('abc')        // false
```

**isInteger(value)** - 验证是否为整数

```typescript
import { isInteger } from '@/utils/validators'

isInteger(123)         // true
isInteger('123')       // true
isInteger(3.14)        // false
isInteger('3.14')      // false
```

**isBoolean(value)** - 验证是否为布尔值

```typescript
import { isBoolean } from '@/utils/validators'

isBoolean(true)        // true
isBoolean(false)       // true
isBoolean('true')      // false
isBoolean(1)           // false
```

**isArray(value)** - 验证是否为数组

```typescript
import { isArray } from '@/utils/validators'

isArray([1, 2, 3])     // true
isArray([])            // true
isArray('array')       // false
isArray({ length: 0 }) // false
```

**isObject(value)** - 验证是否为纯对象

```typescript
import { isObject } from '@/utils/validators'

isObject({})           // true
isObject({ a: 1 })     // true
isObject([])           // false
isObject(null)         // false
```

#### 5.2 电子邮件和URL验证

**isEmail(email)** - 验证电子邮件地址

```typescript
import { isEmail } from '@/utils/validators'

isEmail('user@example.com')        // true
isEmail('user.name@example.co.uk') // true
isEmail('invalid.email')           // false
isEmail('@example.com')            // false
```

**isValidURL(url)** - 验证 URL 格式

```typescript
import { isValidURL } from '@/utils/validators'

isValidURL('https://example.com')         // true
isValidURL('http://sub.example.com/path') // true
isValidURL('ftp://files.example.com')     // true
isValidURL('not a url')                   // false
```

**isDomainName(domain)** - 验证域名

```typescript
import { isDomainName } from '@/utils/validators'

isDomainName('example.com')        // true
isDomainName('sub.example.com')    // true
isDomainName('invalid domain')     // false
```

#### 5.3 中国特定验证

**isChinesePhoneNumber(phone)** - 验证中国手机号

```typescript
import { isChinesePhoneNumber } from '@/utils/validators'

isChinesePhoneNumber('13800138000')  // true
isChinesePhoneNumber('15912345678')  // true
isChinesePhoneNumber('1234567890')   // false
isChinesePhoneNumber('+8613800138000') // false (不含国际前缀)
```

**isChineseIdCard(id)** - 验证中国身份证号(含校验位)

```typescript
import { isChineseIdCard } from '@/utils/validators'

// 18位身份证(含校验位验证)
isChineseIdCard('110101199003071234')  // false (校验位错误)
isChineseIdCard('11010119900307123X')  // 根据实际校验

// 15位身份证
isChineseIdCard('110101900307123')     // true
```

**isChineseName(name)** - 验证中文姓名

```typescript
import { isChineseName } from '@/utils/validators'

isChineseName('张三')         // true
isChineseName('欧阳娜娜')     // true
isChineseName('John')         // false
isChineseName('张三123')      // false
```

**isChinesePostalCode(code)** - 验证中国邮政编码

```typescript
import { isChinesePostalCode } from '@/utils/validators'

isChinesePostalCode('100000')   // true
isChinesePostalCode('518000')   // true
isChinesePostalCode('12345')    // false
```

**isChinese(str)** - 验证是否为中文字符

```typescript
import { isChinese } from '@/utils/validators'

isChinese('你好')            // true
isChinese('Hello')           // false
isChinese('你好World')       // false (包含非中文)
```

#### 5.4 密码和安全验证

**isPassword(password, options?)** - 验证密码强度

```typescript
import { isPassword } from '@/utils/validators'

// 默认配置(严格)
isPassword('Abc123!@#')  // true
isPassword('abc123')     // false (缺少大写和特殊字符)

// 自定义配置
isPassword('abc123', {
  minLength: 6,
  requireUppercase: false,
  requireNumbers: true,
  requireSpecialChars: false
})  // true

// 完整选项
const options = {
  minLength: 8,              // 最小长度
  maxLength: 20,             // 最大长度
  requireLowercase: true,    // 需要小写字母
  requireUppercase: true,    // 需要大写字母
  requireNumbers: true,      // 需要数字
  requireSpecialChars: true  // 需要特殊字符
}
```

**isCreditCardNumber(cardNumber)** - 验证信用卡号(Luhn算法)

```typescript
import { isCreditCardNumber } from '@/utils/validators'

isCreditCardNumber('4111111111111111')  // true (Visa测试卡号)
isCreditCardNumber('5500000000000004')  // true (Mastercard测试卡号)
isCreditCardNumber('1234567890123456')  // false (校验失败)
```

#### 5.5 数值验证

**isInRange(value, min, max)** - 验证数值范围

```typescript
import { isInRange } from '@/utils/validators'

isInRange(5, 1, 10)    // true
isInRange(15, 1, 10)   // false
isInRange(1, 1, 10)    // true (包含边界)
```

**isPositive(value)** - 验证是否为正数

```typescript
import { isPositive } from '@/utils/validators'

isPositive(5)          // true
isPositive(0)          // false
isPositive(-5)         // false
```

**isNegative(value)** - 验证是否为负数

```typescript
import { isNegative } from '@/utils/validators'

isNegative(-5)         // true
isNegative(0)          // false
isNegative(5)          // false
```

**isEven(value)** - 验证是否为偶数

```typescript
import { isEven } from '@/utils/validators'

isEven(2)              // true
isEven(4)              // true
isEven(3)              // false
```

**isOdd(value)** - 验证是否为奇数

```typescript
import { isOdd } from '@/utils/validators'

isOdd(1)               // true
isOdd(3)               // true
isOdd(2)               // false
```

#### 5.6 日期验证

**isValidDate(date)** - 验证日期对象有效性

```typescript
import { isValidDate } from '@/utils/validators'

isValidDate(new Date())              // true
isValidDate(new Date('2024-01-15'))  // true
isValidDate(new Date('invalid'))     // false
isValidDate('2024-01-15')            // false (不是Date对象)
```

**isDateString(str)** - 验证日期字符串格式

```typescript
import { isDateString } from '@/utils/validators'

isDateString('2024-01-15')          // true
isDateString('2024/01/15')          // true
isDateString('2024-13-01')          // false (月份无效)
isDateString('not a date')          // false
```

**isISODate(str)** - 验证 ISO 8601 日期格式

```typescript
import { isISODate } from '@/utils/validators'

isISODate('2024-01-15T10:30:00Z')          // true
isISODate('2024-01-15T10:30:00.000Z')      // true
isISODate('2024-01-15')                     // false
```

#### 5.7 文件验证

**isImage(filename)** - 验证是否为图片文件

```typescript
import { isImage } from '@/utils/validators'

isImage('photo.jpg')       // true
isImage('image.png')       // true
isImage('picture.gif')     // true
isImage('document.pdf')    // false
```

**isVideo(filename)** - 验证是否为视频文件

```typescript
import { isVideo } from '@/utils/validators'

isVideo('movie.mp4')       // true
isVideo('video.avi')       // true
isVideo('clip.mkv')        // true
isVideo('photo.jpg')       // false
```

**isAudio(filename)** - 验证是否为音频文件

```typescript
import { isAudio } from '@/utils/validators'

isAudio('song.mp3')        // true
isAudio('music.wav')       // true
isAudio('audio.aac')       // true
isAudio('video.mp4')       // false
```

#### 5.8 表单验证实例

**用户注册表单验证:**

```typescript
import {
  isEmail,
  isChinesePhoneNumber,
  isPassword,
  isChineseName
} from '@/utils/validators'

interface RegisterForm {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  realName: string
}

const validateRegisterForm = (form: RegisterForm): string[] => {
  const errors: string[] = []

  // 用户名验证
  if (!form.username || form.username.length < 3) {
    errors.push('用户名至少3个字符')
  }

  // 邮箱验证
  if (!isEmail(form.email)) {
    errors.push('请输入有效的邮箱地址')
  }

  // 手机号验证
  if (!isChinesePhoneNumber(form.phone)) {
    errors.push('请输入有效的手机号码')
  }

  // 密码强度验证
  if (!isPassword(form.password, {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  })) {
    errors.push('密码必须包含大小写字母、数字和特殊字符,且不少于8位')
  }

  // 确认密码
  if (form.password !== form.confirmPassword) {
    errors.push('两次密码输入不一致')
  }

  // 真实姓名验证
  if (!isChineseName(form.realName)) {
    errors.push('请输入有效的中文姓名')
  }

  return errors
}

// 使用
const errors = validateRegisterForm(formData)
if (errors.length > 0) {
  uni.showToast({
    title: errors[0],
    icon: 'none'
  })
  return
}
```

### 6. 异步处理工具 (To Utils)

**文件**: `utils/to.ts` (264 行)

提供优雅的异步错误处理,避免 try-catch 嵌套。

#### 6.1 核心函数

**to(promise)** - 转换 Promise 为 `[error, data]` 格式

```typescript
import { to } from '@/utils/to'

// 基本用法
const [error, data] = await to(
  uni.request({ url: '/api/user' })
)

if (error) {
  console.error('请求失败:', error)
  return
}

console.log('用户数据:', data)

// 替代 try-catch
// ❌ 传统方式
try {
  const res = await uni.request({ url: '/api/user' })
  console.log(res.data)
} catch (error) {
  console.error(error)
}

// ✅ 使用 to
const [error, res] = await to(
  uni.request({ url: '/api/user' })
)
if (!error) {
  console.log(res.data)
}
```

**toAsync(fn, ...args)** - 包装异步函数

```typescript
import { toAsync } from '@/utils/to'

const fetchUser = async (id: number) => {
  return await uni.request({ url: `/api/user/${id}` })
}

// 包装后使用
const [error, user] = await toAsync(fetchUser, 123)
if (!error) {
  console.log(user)
}
```

**parallel(promises)** - 并行执行多个 Promise

```typescript
import { parallel } from '@/utils/to'

const [error, results] = await parallel([
  uni.request({ url: '/api/users' }),
  uni.request({ url: '/api/orders' }),
  uni.request({ url: '/api/products' })
])

if (!error) {
  const [users, orders, products] = results
  console.log(users, orders, products)
}
```

**series(promises)** - 串行执行多个 Promise

```typescript
import { series } from '@/utils/to'

const [error, results] = await series([
  () => step1(),
  () => step2(),
  () => step3()
])

if (!error) {
  console.log('所有步骤完成', results)
}
```

**timeout(promise, ms)** - Promise 超时控制

```typescript
import { timeout } from '@/utils/to'

const [error, data] = await timeout(
  uni.request({ url: '/api/slow' }),
  5000  // 5秒超时
)

if (error && error.name === 'TimeoutError') {
  console.log('请求超时')
}
```

#### 6.2 实际应用

**用户登录:**

```typescript
import { to } from '@/utils/to'

const login = async (username: string, password: string) => {
  const [error, res] = await to(
    uni.request({
      url: '/api/login',
      method: 'POST',
      data: { username, password }
    })
  )

  if (error) {
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
    return null
  }

  return res.data
}
```

**批量操作:**

```typescript
import { to, parallel } from '@/utils/to'

const batchDelete = async (ids: number[]) => {
  const [error, results] = await parallel(
    ids.map(id =>
      uni.request({
        url: `/api/item/${id}`,
        method: 'DELETE'
      })
    )
  )

  if (error) {
    console.error('部分删除失败:', error)
    return false
  }

  uni.showToast({ title: '删除成功' })
  return true
}
```

### 7. 平台判断工具 (Platform Utils)

**文件**: `utils/platform.ts` (187 行)

提供 UniApp 多平台环境判断功能。

#### 7.1 平台判断

**isH5()** - 判断是否 H5 环境

```typescript
import { isH5 } from '@/utils/platform'

if (isH5()) {
  // H5 特定代码
  window.localStorage.setItem('key', 'value')
}
```

**isMp()** - 判断是否小程序环境

```typescript
import { isMp } from '@/utils/platform'

if (isMp()) {
  // 小程序特定代码
  uni.getStorageSync('key')
}
```

**isApp()** - 判断是否 APP 环境

```typescript
import { isApp } from '@/utils/platform'

if (isApp()) {
  // APP 特定代码
  plus.runtime.version
}
```

**isWechat()** - 判断是否微信小程序

```typescript
import { isWechat } from '@/utils/platform'

if (isWechat()) {
  // 微信小程序特定功能
  wx.login()
}
```

**isAlipay()** - 判断是否支付宝小程序

```typescript
import { isAlipay } from '@/utils/platform'

if (isAlipay()) {
  // 支付宝小程序特定功能
  my.getAuthCode()
}
```

#### 7.2 系统判断

**isIOS()** - 判断是否 iOS 系统

```typescript
import { isIOS } from '@/utils/platform'

if (isIOS()) {
  // iOS 特定处理
  console.log('iPhone 或 iPad')
}
```

**isAndroid()** - 判断是否 Android 系统

```typescript
import { isAndroid } from '@/utils/platform'

if (isAndroid()) {
  // Android 特定处理
  console.log('Android 设备')
}
```

**getPlatformName()** - 获取平台名称

```typescript
import { getPlatformName } from '@/utils/platform'

const platform = getPlatformName()
// 'h5' | 'app-plus' | 'mp-weixin' | 'mp-alipay' | 等
```

#### 7.3 实际应用

**条件渲染:**

```vue
<template>
  <view>
    <view v-if="isH5()">H5专用内容</view>
    <view v-if="isMp()">小程序专用内容</view>
    <view v-if="isApp()">APP专用内容</view>
  </view>
</template>

<script lang="ts" setup>
import { isH5, isMp, isApp } from '@/utils/platform'
</script>
```

**平台特定逻辑:**

```typescript
import { isWechat, isAlipay, isH5 } from '@/utils/platform'

const share = () => {
  if (isWechat()) {
    // 微信分享
    wx.share​Timeline({ title: '分享标题' })
  } else if (isAlipay()) {
    // 支付宝分享
    my.share({ title: '分享标题' })
  } else if (isH5()) {
    // H5分享
    navigator.share({ title: '分享标题' })
  }
}
```

### 8. 加密工具 (Crypto Utils)

**文件**: `utils/crypto.ts` (156 行)

提供 Base64、AES、MD5、SHA256 等加密功能。

#### 8.1 Base64 编码

**encodeBase64(str)** - Base64 编码

```typescript
import { encodeBase64 } from '@/utils/crypto'

const encoded = encodeBase64('Hello World')
// 'SGVsbG8gV29ybGQ='
```

**decodeBase64(str)** - Base64 解码

```typescript
import { decodeBase64 } from '@/utils/crypto'

const decoded = decodeBase64('SGVsbG8gV29ybGQ=')
// 'Hello World'
```

#### 8.2 MD5 哈希

**md5(str)** - MD5 哈希

```typescript
import { md5 } from '@/utils/crypto'

const hash = md5('password123')
// 生成32位MD5哈希
```

#### 8.3 SHA256 哈希

**sha256(str)** - SHA256 哈希

```typescript
import { sha256 } from '@/utils/crypto'

const hash = sha256('sensitive data')
// 生成SHA256哈希
```

#### 8.4 AES 加密

**aesEncrypt(text, key)** - AES 加密

```typescript
import { aesEncrypt } from '@/utils/crypto'

const encrypted = aesEncrypt('敏感数据', 'my-secret-key')
```

**aesDecrypt(ciphertext, key)** - AES 解密

```typescript
import { aesDecrypt } from '@/utils/crypto'

const decrypted = aesDecrypt(encrypted, 'my-secret-key')
// '敏感数据'
```

### 9. 路由工具 (Route Utils)

**文件**: `utils/route.ts` (134 行)

UniApp 路由跳转的便捷封装。

**navigateTo(url, params?)** - 保留当前页面跳转

```typescript
import { navigateTo } from '@/utils/route'

navigateTo('/pages/detail/index', { id: 123 })
```

**redirectTo(url, params?)** - 关闭当前页面跳转

```typescript
import { redirectTo } from '@/utils/route'

redirectTo('/pages/result/index', { status: 'success' })
```

**reLaunch(url, params?)** - 关闭所有页面跳转

```typescript
import { reLaunch } from '@/utils/route'

reLaunch('/pages/index/index')
```

**switchTab(url)** - 切换到 tabBar 页面

```typescript
import { switchTab } from '@/utils/route'

switchTab('/pages/home/index')
```

**navigateBack(delta?)** - 返回上一页

```typescript
import { navigateBack } from '@/utils/route'

navigateBack()      // 返回上一页
navigateBack(2)     // 返回上两页
```

### 10. 布尔值工具 (Boolean Utils)

**文件**: `utils/boolean.ts` (171 行)

布尔值转换和判断。

**toBoolean(value)** - 转换为布尔值

```typescript
import { toBoolean } from '@/utils/boolean'

toBoolean('true')      // true
toBoolean('1')         // true
toBoolean('yes')       // true
toBoolean('false')     // false
toBoolean('0')         // false
toBoolean('')          // false
```

**isTruthy(value)** - 判断是否为真值

```typescript
import { isTruthy } from '@/utils/boolean'

isTruthy(true)         // true
isTruthy('true')       // true
isTruthy(1)            // true
isTruthy('yes')        // true
```

**isFalsy(value)** - 判断是否为假值

```typescript
import { isFalsy } from '@/utils/boolean'

isFalsy(false)         // true
isFalsy('')            // true
isFalsy(0)             // true
isFalsy(null)          // true
isFalsy(undefined)     // true
```

### 11. 其他工具

**RSA 加密** (`utils/rsa.ts` - 112 行)
- RSA 公钥加密
- RSA 私钥解密
- 数字签名和验证

**租户工具** (`utils/tenant.ts` - 102 行)
- 获取当前租户ID
- 设置租户ID
- 租户切换
- 多租户隔离

**日志工具** (`utils/logger.ts`)
- 统一日志记录
- 日志级别控制
- 日志格式化
- 日志持久化

## 使用方式

### 按需导入(推荐)

```typescript
// 导入需要的函数
import { formatDate, getDaysBetween } from '@/utils/date'
import { cache } from '@/utils/cache'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'
import { to } from '@/utils/to'
import { copy, debounce, throttle } from '@/utils/function'

// 使用
const formatted = formatDate(new Date(), 'yyyy-MM-dd')
cache.set('userToken', token, 7 * 24 * 3600)
const isValid = isEmail('test@example.com')
const [error, data] = await to(api.getData())
await copy('复制内容')
```

### 类型安全

所有工具函数都提供完整的 TypeScript 类型定义:

```typescript
// 泛型支持
const userInfo = cache.get<UserInfo>('userInfo')
const tags = cache.get<string[]>('tags')

// 类型推断
const result = formatDate(new Date())  // string
const isValid = isEmail('test@example.com')  // boolean

// 函数类型
const debouncedFn = debounce<(keyword: string) => void>(handleSearch, 300)
```

### Tree-shaking 支持

工具函数支持按需引入,未使用的函数不会被打包:

```typescript
// 只打包 formatDate 和 cache
import { formatDate } from '@/utils/date'
import { cache } from '@/utils/cache'
```

## 最佳实践

### 1. 统一错误处理

使用 `to` 工具统一处理异步错误,避免 try-catch 嵌套:

```typescript
// ✅ 推荐
const [error, data] = await to(api.getUserInfo())
if (error) {
  uni.showToast({ title: '获取失败', icon: 'none' })
  return
}
console.log(data)

// ❌ 不推荐
try {
  const data = await api.getUserInfo()
  console.log(data)
} catch (error) {
  uni.showToast({ title: '获取失败', icon: 'none' })
}
```

### 2. 合理设置缓存过期时间

根据数据特性设置不同过期时间:

```typescript
// Token - 7天
cache.set('userToken', token, 7 * 24 * 3600)

// 用户信息 - 1天
cache.set('userInfo', userInfo, 24 * 3600)

// 应用配置 - 30分钟
cache.set('appConfig', config, 30 * 60)

// 临时数据 - 5分钟
cache.set('tempData', data, 5 * 60)
```

### 3. 防抖节流优化性能

合理使用防抖和节流优化性能:

```typescript
// 搜索输入 - 使用防抖(300ms)
const handleSearch = debounce((keyword: string) => {
  searchApi(keyword)
}, 300)

// 滚动事件 - 使用节流(200ms)
const handleScroll = throttle((event) => {
  updateScrollPosition(event)
}, 200)

// 窗口resize - 使用防抖(500ms)
const handleResize = debounce(() => {
  calculateLayout()
}, 500)
```

### 4. 表单验证组合

组合多个验证函数进行全面校验:

```typescript
const validateForm = (form: FormData): string[] => {
  const errors: string[] = []

  if (!isEmail(form.email)) {
    errors.push('请输入有效的邮箱地址')
  }

  if (!isChinesePhoneNumber(form.phone)) {
    errors.push('请输入有效的手机号码')
  }

  if (!isPassword(form.password, {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true
  })) {
    errors.push('密码必须包含大小写字母和数字,且不少于8位')
  }

  if (!isInRange(form.age, 18, 100)) {
    errors.push('年龄必须在18-100之间')
  }

  return errors
}
```

### 5. 平台判断

在使用平台特定功能前,务必先进行平台判断:

```typescript
import { isWechat, isAlipay, isH5, isApp } from '@/utils/platform'

const share = () => {
  if (isWechat()) {
    wx.shareTimeline({ title: '分享标题' })
  } else if (isAlipay()) {
    my.share({ title: '分享标题' })
  } else if (isH5()) {
    navigator.share({ title: '分享标题' })
  } else if (isApp()) {
    plus.share.sendWithSystem({ type: 'text', content: '分享内容' })
  }
}
```

### 6. 函数组合

使用函数组合创建复杂功能:

```typescript
import { curry, partial, memoize } from '@/utils/function'

// 创建专用函数
const multiply = curry((a: number, b: number, c: number) => a * b * c)
const double = multiply(2)
const quadruple = double(2)

// 固定参数
const fetchUsers = partial(fetchFromApi, 'users')
const fetchOrders = partial(fetchFromApi, 'orders')

// 缓存计算结果
const expensiveCalc = memoize((data: any[]) => {
  return data.reduce((sum, item) => sum + item.value, 0)
})
```

### 7. 异步函数增强

为异步函数添加重试、超时、限流等功能:

```typescript
import { withRetry, withTimeout, rateLimit } from '@/utils/function'

// 添加重试
const fetchWithRetry = withRetry(fetchData, {
  retries: 3,
  retryDelay: 1000
})

// 添加超时
const fetchWithTimeout = withTimeout(fetchData, 5000)

// 添加限流
const limitedFetch = rateLimit(fetchData, 100, 60000)

// 组合使用
const robustFetch = withTimeout(
  withRetry(fetchData, { retries: 3 }),
  10000
)
```

### 8. 日期格式统一

统一使用 formatDate 格式化日期:

```typescript
import { formatDate } from '@/utils/date'

// 列表显示
const displayDate = formatDate(item.createTime, 'yyyy-MM-dd')

// 详情显示
const detailDate = formatDate(item.createTime, 'yyyy-MM-dd HH:mm:ss')

// 相对时间
const relativeTime = formatRelativeTime(item.createTime)

// 时间戳
const timestamp = getTimeStamp('s')
```

### 9. 缓存策略

实现完整的缓存策略:

```typescript
import { cache } from '@/utils/cache'
import { to } from '@/utils/to'

const getDataWithCache = async (key: string, fetcher: () => Promise<any>, ttl: number) => {
  // 先从缓存获取
  const cached = cache.get(key)
  if (cached) {
    return cached
  }

  // 缓存miss,请求数据
  const [error, data] = await to(fetcher())
  if (!error && data) {
    // 存入缓存
    cache.set(key, data, ttl)
    return data
  }

  return null
}

// 使用
const users = await getDataWithCache(
  'users_list',
  () => uni.request({ url: '/api/users' }),
  5 * 60  // 5分钟
)
```

### 10. 工具函数封装

基于基础工具创建业务工具:

```typescript
import { debounce } from '@/utils/function'
import { cache } from '@/utils/cache'
import { to } from '@/utils/to'
import { isEmail } from '@/utils/validators'

// 封装搜索工具
export const useSearch = () => {
  const HISTORY_KEY = 'searchHistory'
  const MAX_HISTORY = 10

  // 防抖搜索
  const search = debounce(async (keyword: string) => {
    const [error, data] = await to(
      uni.request({
        url: '/api/search',
        data: { keyword }
      })
    )

    if (!error) {
      addHistory(keyword)
      return data
    }
  }, 300)

  // 添加历史
  const addHistory = (keyword: string) => {
    const history = cache.get<string[]>(HISTORY_KEY) || []
    const newHistory = [
      keyword,
      ...history.filter(item => item !== keyword)
    ].slice(0, MAX_HISTORY)
    cache.set(HISTORY_KEY, newHistory, 30 * 24 * 3600)
  }

  // 获取历史
  const getHistory = () => {
    return cache.get<string[]>(HISTORY_KEY) || []
  }

  // 清除历史
  const clearHistory = () => {
    cache.remove(HISTORY_KEY)
  }

  return {
    search,
    addHistory,
    getHistory,
    clearHistory
  }
}
```

## 常见问题

### 1. 缓存容量超限

**问题描述:**
小程序提示存储空间已满,无法继续缓存数据。

**问题原因:**
- 小程序单个 key 最大 1MB,总容量 10MB
- 缓存了大量或体积大的数据
- 过期缓存未及时清理

**解决方案:**

```typescript
import { cache } from '@/utils/cache'

// 1. 定期清理过期缓存
onLaunch(() => {
  cache.cleanup()
})

// 2. 检查缓存统计
const stats = cache.getStats()
console.log('缓存占用:', stats.totalSize)
if (stats.totalSize > 8 * 1024 * 1024) {  // 超过8MB
  console.warn('缓存空间不足')
  // 清理部分缓存
  cache.clearAll()
}

// 3. 对大数据分块缓存
const saveLargeData = (key: string, data: any[]) => {
  const chunkSize = 100
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    cache.set(`${key}_${i}`, chunk, 3600)
  }
}

// 4. 使用数据库替代缓存存储大量数据
// 使用 uni.setStorageSync 的替代方案
```

### 2. 防抖节流失效

**问题描述:**
使用 debounce 或 throttle 后,函数仍然频繁执行。

**问题原因:**
- 每次渲染都创建新的防抖/节流函数
- 在组件内直接使用,未保持引用

**解决方案:**

```vue
<template>
  <input @input="handleInput" />
</template>

<script lang="ts" setup>
import { debounce } from '@/utils/function'

// ❌ 错误:每次都创建新函数
const handleInput = (e) => {
  debounce(() => {
    console.log(e.detail.value)
  }, 300)()
}

// ✅ 正确:保持函数引用
const handleInput = debounce((e) => {
  console.log(e.detail.value)
}, 300)

// ✅ 或使用 ref
const handleInputRef = ref(
  debounce((e) => {
    console.log(e.detail.value)
  }, 300)
)
</script>
```

### 3. 时间戳格式错误

**问题描述:**
`formatDate` 格式化时间戳显示错误的日期。

**问题原因:**
- 后端返回的时间戳单位不一致
- 10位秒级时间戳误当作13位毫秒级

**解决方案:**

```typescript
import { formatDate } from '@/utils/date'

// formatDate 会自动识别时间戳位数
formatDate(1678886400, 'yyyy-MM-dd')      // 自动识别为秒级
formatDate(1678886400000, 'yyyy-MM-dd')   // 自动识别为毫秒级

// 如果不确定,手动转换
const timestamp = 1678886400
const normalizedTimestamp = timestamp.toString().length === 10
  ? timestamp * 1000
  : timestamp

formatDate(normalizedTimestamp, 'yyyy-MM-dd')
```

### 4. 验证函数性能问题

**问题描述:**
大量数据验证时应用卡顿。

**问题原因:**
- 复杂正则表达式计算量大
- 循环中频繁调用验证函数

**解决方案:**

```typescript
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'

// ❌ 不推荐:每次都验证
const filterUsers = (users: User[]) => {
  return users.filter(user => isEmail(user.email))
}

// ✅ 推荐:缓存验证结果
const filterUsers = (users: User[]) => {
  const validEmails = new Set<string>()
  const invalidEmails = new Set<string>()

  return users.filter(user => {
    if (validEmails.has(user.email)) return true
    if (invalidEmails.has(user.email)) return false

    const valid = isEmail(user.email)
    if (valid) {
      validEmails.add(user.email)
    } else {
      invalidEmails.add(user.email)
    }
    return valid
  })
}

// ✅ 或使用 memoize
import { memoize } from '@/utils/function'

const cachedIsEmail = memoize(isEmail)
const filterUsers = (users: User[]) => {
  return users.filter(user => cachedIsEmail(user.email))
}
```

### 5. 平台判断时机

**问题描述:**
在某些时机调用平台判断函数返回错误结果。

**问题原因:**
- 在编译时判断而非运行时
- 条件编译和运行时判断混用

**解决方案:**

```typescript
import { isH5, isMp } from '@/utils/platform'

// ❌ 错误:编译时判断
// #ifdef H5
const platform = 'h5'
// #endif

// ✅ 正确:运行时判断
const platform = isH5() ? 'h5' : isMp() ? 'mp' : 'app'

// 混合使用
// #ifdef H5
// H5编译时代码
if (isH5()) {
  // H5运行时代码
}
// #endif

// #ifdef MP-WEIXIN
// 微信编译时代码
if (isMp()) {
  // 小程序运行时代码
}
// #endif
```

### 6. 异步重试策略不当

**问题描述:**
使用 `retry` 函数导致应用无响应。

**问题原因:**
- 重试次数过多或间隔过长
- 没有设置合理的超时时间
- 对不应重试的错误也进行重试

**解决方案:**

```typescript
import { retry } from '@/utils/function'

// ❌ 不推荐:可能导致长时间阻塞
await retry(unstableApi, {
  maxAttempts: 10,
  delay: 5000
})

// ✅ 推荐:合理的重试配置
await retry(unstableApi, {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2  // 1s, 2s, 4s
})

// ✅ 更好:结合超时和条件重试
import { withTimeout, withRetry } from '@/utils/function'

const robustApi = withTimeout(
  withRetry(unstableApi, {
    retries: 3,
    retryDelay: 1000,
    shouldRetry: (error) => {
      // 只在网络错误时重试
      return error.code === 'NETWORK_ERROR'
    }
  }),
  10000  // 总超时10秒
)

await robustApi()
```

### 7. 密码验证规则过严

**问题描述:**
`isPassword` 函数验证失败,提示密码不符合要求。

**问题原因:**
- 默认配置要求较高的密码强度
- 业务需求与默认配置不匹配

**解决方案:**

```typescript
import { isPassword } from '@/utils/validators'

// 默认配置(较严格)
isPassword('abc123')  // false

// 自定义配置(宽松)
isPassword('abc123', {
  minLength: 6,
  requireUppercase: false,
  requireSpecialChars: false
})  // true

// 根据业务需求配置
const passwordOptions = {
  minLength: 8,
  maxLength: 20,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false  // 不强制特殊字符
}

if (!isPassword(password, passwordOptions)) {
  uni.showToast({
    title: '密码必须包含大小写字母和数字,长度8-20位',
    icon: 'none'
  })
}
```

### 8. 缓存数据类型丢失

**问题描述:**
从缓存读取的数据类型与存入时不一致。

**问题原因:**
- 序列化和反序列化导致类型转换
- Date 对象被转换为字符串
- Function 无法被序列化

**解决方案:**

```typescript
import { cache } from '@/utils/cache'

// ❌ 问题:Date 对象会变成字符串
cache.set('date', new Date())
const date = cache.get('date')  // string,不是 Date

// ✅ 解决:存储时间戳,读取时转换
cache.set('timestamp', Date.now())
const timestamp = cache.get<number>('timestamp')
const date = new Date(timestamp!)

// ❌ 问题:复杂对象丢失方法
class User {
  name: string
  getName() { return this.name }
}
cache.set('user', new User())
const user = cache.get<User>('user')
user.getName()  // Error: getName is not a function

// ✅ 解决:只缓存数据,不缓存方法
interface UserData {
  name: string
}
cache.set('userData', { name: 'Admin' })
const userData = cache.get<UserData>('userData')
const user = new User()
Object.assign(user, userData)
```

## 工具函数总览表

| 分类 | 文件 | 函数数量 | 行数 | 主要功能 |
|------|------|---------|------|---------|
| 函数工具 | function.ts | 20+ | 738 | 防抖节流、函数控制、函数组合、异步处理、剪贴板操作 |
| 字符串工具 | string.ts | 21 | 493 | 字符串操作、格式化、HTML处理、URL处理、命名转换 |
| 日期工具 | date.ts | 18 | 403 | 日期格式化、相对时间、日期范围、日期计算 |
| 缓存工具 | cache.ts | 8 | 288 | 类型安全缓存、自动过期、前缀隔离、统计信息 |
| 验证工具 | validators.ts | 60+ | 1046 | 邮箱、手机、身份证、URL、密码、文件、类型验证 |
| 异步工具 | to.ts | 6 | 264 | Promise错误处理、并行串行执行、超时控制 |
| 平台工具 | platform.ts | 8 | 187 | H5/小程序/APP判断、iOS/Android判断 |
| 加密工具 | crypto.ts | 6 | 156 | Base64、MD5、SHA256、AES加密解密 |
| 路由工具 | route.ts | 5 | 134 | 路由跳转、返回、重定向封装 |
| 布尔工具 | boolean.ts | 3 | 171 | 布尔值转换、真假值判断 |
| RSA工具 | rsa.ts | 4 | 112 | RSA加密解密、数字签名 |
| 租户工具 | tenant.ts | 4 | 102 | 租户ID管理、多租户隔离 |
| **总计** | **12个文件** | **150+** | **4094** | **覆盖12大领域** |

## 总结

RuoYi-Plus-UniApp 移动端工具函数库提供了完整、强大、易用的基础设施,涵盖了移动端开发的各个方面:

**核心优势:**

1. **类型安全** - TypeScript 全覆盖,智能提示完整
2. **功能全面** - 12 大类 150+ 函数,满足各种需求
3. **性能优化** - 针对移动端优化,高效低耗
4. **平台兼容** - 支持 H5、小程序、APP 所有平台
5. **开箱即用** - 统一的 API 设计,简单易用
6. **文档完善** - 每个函数都有详细说明和示例

**使用建议:**

- 按需引入,减小包体积
- 结合 TypeScript 类型,提升开发体验
- 使用 `to` 统一错误处理
- 合理配置缓存策略
- 注意平台差异,正确使用平台判断
- 组合工具函数创建业务工具
- 遵循最佳实践,提升代码质量

通过合理使用这些工具函数,可以大幅提升开发效率、代码质量和应用性能,为用户提供更好的移动端体验。
