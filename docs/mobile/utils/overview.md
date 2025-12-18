# 工具函数概览

## 介绍

RuoYi-Plus-UniApp 移动端提供了一套完整且强大的工具函数库,涵盖字符串处理、日期时间、缓存管理、数据验证、加密解密、平台判断、函数式编程等多个领域。

**核心特性:**

- **类型安全** - 全部使用 TypeScript 编写,提供完整的类型定义和智能提示
- **功能全面** - 涵盖 11 个大类、120+ 个实用工具函数
- **性能优化** - 针对移动端环境进行优化,确保高性能和低内存占用
- **平台兼容** - 支持 UniApp 所有平台(H5、小程序、APP)
- **开箱即用** - 提供统一的导入和使用方式,支持 Tree-shaking

## 工具函数分类

### 1. 函数工具 (Function Utils)

**文件**: `utils/function.ts` (738 行, 20+ 个函数)

#### 1.1 剪贴板操作

```typescript
import { copy, paste } from '@/utils/function'

// 复制文本
await copy('要复制的文本')
await copy(userInfo.phone, '手机号已复制')

// 获取剪贴板内容
const text = await paste()
```

#### 1.2 防抖与节流

```typescript
import { debounce, throttle } from '@/utils/function'

// 防抖:输入停止300ms后执行
const handleSearch = debounce((keyword: string) => {
  searchApi(keyword)
}, 300)

// 节流:每200ms最多执行一次
const handleScroll = throttle((event) => {
  console.log('滚动位置:', event.scrollTop)
}, 200)

// 取消
handleSearch.cancel()
handleScroll.cancel()
```

#### 1.3 函数执行控制

```typescript
import { once, delay, retry, withTimeout } from '@/utils/function'

// 确保只执行一次
const initialize = once(() => setupApp())
initialize()  // 执行
initialize()  // 不执行

// 延迟执行
await delay(console.log, 1000, 'Hello')

// 重试执行
await retry(unstableApiCall, {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2  // 指数退避
})

// 超时控制
const fetchWithTimeout = withTimeout(fetchData, 5000)
try {
  await fetchWithTimeout()
} catch (error) {
  if (error.name === 'TimeoutError') console.log('请求超时')
}
```

#### 1.4 函数转换与组合

```typescript
import { curry, partial, memoize } from '@/utils/function'

// 柯里化
const add = curry((a: number, b: number, c: number) => a + b + c)
add(1)(2)(3)  // 6
add(1, 2)(3)  // 6

// 偏函数
const multiply = (a: number, b: number) => a * b
const double = partial(multiply, 2)
double(5)  // 10

// 记忆化(缓存计算结果)
const fib = memoize((n: number): number => {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
})
```

#### 1.5 异步函数工具

```typescript
import { serial, parallel, withRetry, rateLimit } from '@/utils/function'

// 串行执行
await serial([
  () => fetchUsers(),
  (users) => filterActiveUsers(users),
  (activeUsers) => sortUsersByName(activeUsers)
])

// 并行执行(限制并发数)
const results = await parallel(
  files.map(file => () => processFile(file)),
  3  // 最多同时3个
)

// 重试包装
const fetchWithRetry = withRetry(fetchData, {
  retries: 3,
  retryDelay: 1000,
  shouldRetry: (err) => err.status === 429
})

// 限流:每分钟最多100次
const limitedFetch = rateLimit(fetchData, 100, 60000)
```

### 2. 字符串工具 (String Utils)

**文件**: `utils/string.ts` (493 行, 21 个函数)

#### 2.1 基本字符串操作

```typescript
import { parseStrEmpty, isEmpty, capitalize, truncate, byteLength, createUniqueString } from '@/utils/string'

parseStrEmpty(null)     // ''
isEmpty('   ')          // true
capitalize('hello')     // 'Hello'
truncate('这是一段很长的文本内容', 10)  // '这是一段很长的文...'
byteLength('Hello你好') // 9
createUniqueString()    // 'uw8f9x_1678886400123'
```

#### 2.2 字符串格式化

```typescript
import { sprintf, html2Text, escapeHtml } from '@/utils/string'

sprintf('用户 %s 有 %d 条新消息', '张三', 5)
// '用户 张三 有 5 条新消息'

html2Text('<div><p>Hello <b>World</b></p></div>')  // 'Hello World'

escapeHtml('<script>alert("XSS")</script>')
// '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
```

#### 2.3 URL 和路径处理

```typescript
import { isExternal, getQueryObject, objectToQuery, normalizePath, isPathMatch } from '@/utils/string'

isExternal('https://example.com')  // true
isExternal('/dashboard')           // false

getQueryObject('https://example.com?id=1&name=test')  // { id: '1', name: 'test' }

objectToQuery({ page: 1, size: 20 })  // 'page=1&size=20'

normalizePath('/path//to///file')  // '/path/to/file'

isPathMatch('/user/*', '/user/123')  // true
```

#### 2.4 命名转换

```typescript
import { camelToKebab, kebabToCamel, isValidJSON } from '@/utils/string'

camelToKebab('getUserInfo')  // 'get-user-info'
kebabToCamel('get-user-info')  // 'getUserInfo'
isValidJSON('{"name":"test"}')  // true
```

### 3. 日期时间工具 (Date Utils)

**文件**: `utils/date.ts` (403 行, 18 个函数)

#### 3.1 日期格式化

```typescript
import { formatDate, formatRelativeTime } from '@/utils/date'

const date = new Date()

// 自定义格式
formatDate(date, 'yyyy-MM-dd')         // '2024-01-15'
formatDate(date, 'yyyy年MM月dd日')    // '2024年01月15日'
formatDate(date, 'yyyy-MM-dd 星期W')   // '2024-01-15 星期一'

// 时间戳(自动识别10位或13位)
formatDate(1678886400, 'yyyy-MM-dd')      // 秒级
formatDate(1678886400000, 'yyyy-MM-dd')   // 毫秒级

// 相对时间
formatRelativeTime(Date.now() - 30 * 1000)        // '30秒前'
formatRelativeTime(Date.now() - 5 * 60 * 1000)    // '5分钟前'
formatRelativeTime(Date.now() - 2 * 3600 * 1000)  // '2小时前'
```

#### 3.2 获取当前时间

```typescript
import { getCurrentTime, getCurrentDate, getCurrentDateTime, getTimeStamp } from '@/utils/date'

getCurrentTime()      // '14:30:25'
getCurrentDate()      // '2024-01-15'
getCurrentDateTime()  // '2024-01-15 14:30:25'
getTimeStamp()        // 1678886400000
getTimeStamp('s')     // 1678886400
```

#### 3.3 日期范围与计算

```typescript
import { getDateRange, getCurrentWeekRange, getCurrentMonthRange, getDaysBetween, isSameDay, dateAdd } from '@/utils/date'

getDateRange(7)           // ['2024-01-08', '2024-01-15']
getCurrentWeekRange()     // ['2024-01-08', '2024-01-14']
getCurrentMonthRange()    // ['2024-01-01', '2024-01-31']
getDaysBetween('2024-01-01', '2024-01-15')  // 14
isSameDay('2024-01-15 10:00', '2024-01-15 18:00')  // true

// 日期加减
const date = new Date('2024-01-15')
dateAdd(date, 'day', 3)     // Date('2024-01-18')
dateAdd(date, 'month', -2)  // Date('2023-11-15')
dateAdd(date, 'year', 1)    // Date('2025-01-15')
```

### 4. 缓存管理工具 (Cache Utils)

**文件**: `utils/cache.ts` (288 行)

基于 UniApp 存储 API 的优化缓存封装,提供类型安全、自动过期、前缀隔离等特性。

```typescript
import { cache } from '@/utils/cache'

// 设置缓存(可指定过期时间)
cache.set('userName', 'Admin')
cache.set('token', 'abc123', 7 * 24 * 3600)  // 7天后过期
cache.set('userInfo', { id: 1, name: 'Admin' })

// 获取缓存(泛型支持)
const userName = cache.get<string>('userName')
const userInfo = cache.get<UserInfo>('userInfo')

// 检查和移除
cache.has('token')     // true/false
cache.remove('token')

// 清除所有缓存
cache.clearAll()

// 手动清理过期缓存
cache.cleanup()

// 获取缓存统计
const stats = cache.getStats()
console.log('总缓存数:', stats.totalCount)
console.log('有效缓存:', stats.validCount)
console.log('占用空间:', stats.totalSize)
```

**使用示例:**

```typescript
// 登录缓存
const login = async (username: string, password: string) => {
  const [error, res] = await to(loginApi({ username, password }))
  if (!error && res) {
    cache.set('token', res.token, 7 * 24 * 3600)     // 7天
    cache.set('userInfo', res.userInfo, 24 * 3600)  // 1天
  }
}

// 搜索历史
const addSearchHistory = (keyword: string) => {
  const history = cache.get<string[]>('searchHistory') || []
  const newHistory = [keyword, ...history.filter(item => item !== keyword)].slice(0, 10)
  cache.set('searchHistory', newHistory, 30 * 24 * 3600)
}
```

### 5. 数据验证工具 (Validators)

**文件**: `utils/validators.ts` (1046 行, 60+ 个函数)

#### 5.1 基础类型验证

```typescript
import { isString, isNumber, isInteger, isBoolean, isArray, isObject } from '@/utils/validators'

isString('hello')      // true
isNumber('123')        // true
isNumber(NaN)          // false
isInteger(3.14)        // false
isBoolean(true)        // true
isArray([1, 2, 3])     // true
isObject({ a: 1 })     // true
```

#### 5.2 电子邮件和URL验证

```typescript
import { isEmail, isValidURL, isDomainName } from '@/utils/validators'

isEmail('user@example.com')              // true
isValidURL('https://example.com/path')   // true
isDomainName('sub.example.com')          // true
```

#### 5.3 中国特定验证

```typescript
import { isChinesePhoneNumber, isChineseIdCard, isChineseName, isChinesePostalCode, isChinese } from '@/utils/validators'

isChinesePhoneNumber('13800138000')  // true
isChineseIdCard('110101199003071234')  // 含校验位验证
isChineseName('张三')         // true
isChinesePostalCode('100000') // true
isChinese('你好')             // true
```

#### 5.4 密码和安全验证

```typescript
import { isPassword, isCreditCardNumber } from '@/utils/validators'

// 默认配置(严格)
isPassword('Abc123!@#')  // true

// 自定义配置
isPassword('abc123', {
  minLength: 6,
  requireUppercase: false,
  requireNumbers: true,
  requireSpecialChars: false
})  // true

// 信用卡号(Luhn算法)
isCreditCardNumber('4111111111111111')  // true
```

#### 5.5 数值验证

```typescript
import { isInRange, isPositive, isNegative, isEven, isOdd } from '@/utils/validators'

isInRange(5, 1, 10)  // true
isPositive(5)        // true
isNegative(-5)       // true
isEven(4)            // true
isOdd(3)             // true
```

#### 5.6 日期和文件验证

```typescript
import { isValidDate, isDateString, isISODate, isImage, isVideo, isAudio } from '@/utils/validators'

isValidDate(new Date())              // true
isDateString('2024-01-15')           // true
isISODate('2024-01-15T10:30:00Z')    // true

isImage('photo.jpg')     // true
isVideo('movie.mp4')     // true
isAudio('song.mp3')      // true
```

#### 5.7 表单验证实例

```typescript
const validateRegisterForm = (form: RegisterForm): string[] => {
  const errors: string[] = []

  if (!isEmail(form.email)) {
    errors.push('请输入有效的邮箱地址')
  }
  if (!isChinesePhoneNumber(form.phone)) {
    errors.push('请输入有效的手机号码')
  }
  if (!isPassword(form.password, { minLength: 8, requireUppercase: true, requireNumbers: true })) {
    errors.push('密码必须包含大小写字母和数字,且不少于8位')
  }
  if (form.password !== form.confirmPassword) {
    errors.push('两次密码输入不一致')
  }

  return errors
}
```

### 6. 异步处理工具 (To Utils)

**文件**: `utils/to.ts` (264 行)

提供优雅的异步错误处理,避免 try-catch 嵌套。

```typescript
import { to, toAsync, parallel, series, timeout } from '@/utils/to'

// 转换 Promise 为 [error, data] 格式
const [error, data] = await to(uni.request({ url: '/api/user' }))
if (error) {
  console.error('请求失败:', error)
  return
}
console.log('用户数据:', data)

// 包装异步函数
const [error, user] = await toAsync(fetchUser, 123)

// 并行执行
const [error, results] = await parallel([
  uni.request({ url: '/api/users' }),
  uni.request({ url: '/api/orders' }),
  uni.request({ url: '/api/products' })
])
if (!error) {
  const [users, orders, products] = results
}

// 串行执行
const [error, results] = await series([
  () => step1(),
  () => step2(),
  () => step3()
])

// 超时控制
const [error, data] = await timeout(
  uni.request({ url: '/api/slow' }),
  5000
)
if (error?.name === 'TimeoutError') {
  console.log('请求超时')
}
```

### 7. 平台判断工具 (Platform Utils)

**文件**: `utils/platform.ts` (187 行)

```typescript
import { isH5, isMp, isApp, isWechat, isAlipay, isIOS, isAndroid, getPlatformName } from '@/utils/platform'

// 平台判断
if (isH5()) {
  window.localStorage.setItem('key', 'value')
}
if (isMp()) {
  uni.getStorageSync('key')
}
if (isApp()) {
  plus.runtime.version
}
if (isWechat()) {
  wx.login()
}
if (isAlipay()) {
  my.getAuthCode()
}

// 系统判断
if (isIOS()) console.log('iPhone 或 iPad')
if (isAndroid()) console.log('Android 设备')

// 获取平台名称
const platform = getPlatformName()  // 'h5' | 'app-plus' | 'mp-weixin' | ...
```

**实际应用:**

```typescript
const share = () => {
  if (isWechat()) {
    wx.shareTimeline({ title: '分享标题' })
  } else if (isAlipay()) {
    my.share({ title: '分享标题' })
  } else if (isH5()) {
    navigator.share({ title: '分享标题' })
  }
}
```

### 8. 加密工具 (Crypto Utils)

**文件**: `utils/crypto.ts` (156 行)

```typescript
import { encodeBase64, decodeBase64, md5, sha256, aesEncrypt, aesDecrypt } from '@/utils/crypto'

// Base64
const encoded = encodeBase64('Hello World')  // 'SGVsbG8gV29ybGQ='
const decoded = decodeBase64('SGVsbG8gV29ybGQ=')  // 'Hello World'

// 哈希
const hash1 = md5('password123')
const hash2 = sha256('sensitive data')

// AES 加密解密
const encrypted = aesEncrypt('敏感数据', 'my-secret-key')
const decrypted = aesDecrypt(encrypted, 'my-secret-key')  // '敏感数据'
```

### 9. 路由工具 (Route Utils)

**文件**: `utils/route.ts` (134 行)

```typescript
import { navigateTo, redirectTo, reLaunch, switchTab, navigateBack } from '@/utils/route'

navigateTo('/pages/detail/index', { id: 123 })  // 保留当前页面跳转
redirectTo('/pages/result/index', { status: 'success' })  // 关闭当前页面跳转
reLaunch('/pages/index/index')  // 关闭所有页面跳转
switchTab('/pages/home/index')  // 切换到 tabBar 页面
navigateBack()      // 返回上一页
navigateBack(2)     // 返回上两页
```

### 10. 布尔值工具 (Boolean Utils)

**文件**: `utils/boolean.ts` (171 行)

```typescript
import { toBoolean, isTruthy, isFalsy } from '@/utils/boolean'

toBoolean('true')   // true
toBoolean('1')      // true
toBoolean('yes')    // true
toBoolean('false')  // false
toBoolean('0')      // false

isTruthy(true)      // true
isTruthy('yes')     // true

isFalsy(false)      // true
isFalsy('')         // true
isFalsy(null)       // true
```

### 11. 其他工具

**RSA 加密** (`utils/rsa.ts` - 112 行)
- RSA 公钥加密/私钥解密
- 数字签名和验证

**租户工具** (`utils/tenant.ts` - 102 行)
- 获取/设置当前租户ID
- 租户切换、多租户隔离

**日志工具** (`utils/logger.ts`)
- 统一日志记录、级别控制、格式化、持久化

## 使用方式

### 按需导入(推荐)

```typescript
import { formatDate, getDaysBetween } from '@/utils/date'
import { cache } from '@/utils/cache'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'
import { to } from '@/utils/to'
import { copy, debounce, throttle } from '@/utils/function'

const formatted = formatDate(new Date(), 'yyyy-MM-dd')
cache.set('userToken', token, 7 * 24 * 3600)
const isValid = isEmail('test@example.com')
const [error, data] = await to(api.getData())
```

### 类型安全

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

## 最佳实践

### 1. 统一错误处理

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
} catch (error) {
  uni.showToast({ title: '获取失败', icon: 'none' })
}
```

### 2. 合理设置缓存过期时间

```typescript
cache.set('userToken', token, 7 * 24 * 3600)     // Token - 7天
cache.set('userInfo', userInfo, 24 * 3600)       // 用户信息 - 1天
cache.set('appConfig', config, 30 * 60)          // 配置 - 30分钟
cache.set('tempData', data, 5 * 60)              // 临时数据 - 5分钟
```

### 3. 防抖节流优化性能

```typescript
// 搜索输入 - 使用防抖(300ms)
const handleSearch = debounce((keyword: string) => searchApi(keyword), 300)

// 滚动事件 - 使用节流(200ms)
const handleScroll = throttle((event) => updateScrollPosition(event), 200)

// 窗口resize - 使用防抖(500ms)
const handleResize = debounce(() => calculateLayout(), 500)
```

### 4. 平台判断

在使用平台特定功能前,务必先进行平台判断:

```typescript
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

### 5. 缓存策略

```typescript
const getDataWithCache = async (key: string, fetcher: () => Promise<any>, ttl: number) => {
  const cached = cache.get(key)
  if (cached) return cached

  const [error, data] = await to(fetcher())
  if (!error && data) {
    cache.set(key, data, ttl)
    return data
  }
  return null
}

// 使用
const users = await getDataWithCache('users_list', () => uni.request({ url: '/api/users' }), 5 * 60)
```

### 6. 异步函数增强

```typescript
import { withRetry, withTimeout, rateLimit } from '@/utils/function'

// 组合使用:超时 + 重试
const robustFetch = withTimeout(
  withRetry(fetchData, { retries: 3 }),
  10000
)
```

## 常见问题

### 1. 缓存容量超限

**问题**: 小程序提示存储空间已满。

**解决方案:**

```typescript
// 定期清理过期缓存
onLaunch(() => cache.cleanup())

// 检查缓存统计
const stats = cache.getStats()
if (stats.totalSize > 8 * 1024 * 1024) {
  cache.clearAll()
}
```

### 2. 防抖节流失效

**问题**: 函数仍然频繁执行。

**原因**: 每次渲染都创建新函数。

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 正确:在组件外层定义,保持函数引用
const handleInput = debounce((e) => {
  console.log(e.detail.value)
}, 300)
</script>
```

### 3. 时间戳格式错误

**问题**: `formatDate` 显示错误日期。

**原因**: 时间戳位数不一致。

**解决方案:**

```typescript
// formatDate 会自动识别时间戳位数
formatDate(1678886400, 'yyyy-MM-dd')      // 秒级
formatDate(1678886400000, 'yyyy-MM-dd')   // 毫秒级
```

### 4. 验证函数性能问题

**问题**: 大量数据验证时应用卡顿。

**解决方案:**

```typescript
// 使用 memoize 缓存验证结果
const cachedIsEmail = memoize(isEmail)
const filterUsers = (users: User[]) => {
  return users.filter(user => cachedIsEmail(user.email))
}
```

### 5. 缓存数据类型丢失

**问题**: Date 对象变成字符串。

**解决方案:**

```typescript
// 存储时间戳,读取时转换
cache.set('timestamp', Date.now())
const timestamp = cache.get<number>('timestamp')
const date = new Date(timestamp!)
```

## 工具函数总览表

| 分类 | 文件 | 函数数量 | 行数 | 主要功能 |
|------|------|---------|------|---------|
| 函数工具 | function.ts | 20+ | 738 | 防抖节流、函数控制、函数组合、异步处理 |
| 字符串工具 | string.ts | 21 | 493 | 字符串操作、格式化、URL处理、命名转换 |
| 日期工具 | date.ts | 18 | 403 | 日期格式化、相对时间、日期范围、日期计算 |
| 缓存工具 | cache.ts | 8 | 288 | 类型安全缓存、自动过期、前缀隔离 |
| 验证工具 | validators.ts | 60+ | 1046 | 邮箱、手机、身份证、URL、密码验证 |
| 异步工具 | to.ts | 6 | 264 | Promise错误处理、并行串行执行 |
| 平台工具 | platform.ts | 8 | 187 | H5/小程序/APP判断、iOS/Android判断 |
| 加密工具 | crypto.ts | 6 | 156 | Base64、MD5、SHA256、AES加密解密 |
| 路由工具 | route.ts | 5 | 134 | 路由跳转、返回、重定向封装 |
| 布尔工具 | boolean.ts | 3 | 171 | 布尔值转换、真假值判断 |
| RSA工具 | rsa.ts | 4 | 112 | RSA加密解密、数字签名 |
| 租户工具 | tenant.ts | 4 | 102 | 租户ID管理、多租户隔离 |
| **总计** | **12个文件** | **150+** | **4094** | **覆盖12大领域** |

## 总结

RuoYi-Plus-UniApp 移动端工具函数库提供了完整、强大、易用的基础设施:

**核心优势:**

1. **类型安全** - TypeScript 全覆盖,智能提示完整
2. **功能全面** - 12 大类 150+ 函数,满足各种需求
3. **性能优化** - 针对移动端优化,高效低耗
4. **平台兼容** - 支持 H5、小程序、APP 所有平台
5. **开箱即用** - 统一的 API 设计,简单易用

**使用建议:**

- 按需引入,减小包体积
- 使用 `to` 统一错误处理
- 合理配置缓存策略
- 注意平台差异,正确使用平台判断
- 组合工具函数创建业务工具
