# 工具函数概览

## 介绍

RuoYi-Plus-UniApp 移动端提供了一套完整且强大的工具函数库,涵盖字符串处理、日期时间、缓存管理、数据验证、加密解密、平台判断等多个领域。这些工具函数经过精心设计和优化,提供了类型安全、性能高效、使用便捷的特性。

**核心特性:**

- **类型安全** - 全部使用 TypeScript 编写,提供完整的类型定义和智能提示
- **功能全面** - 涵盖 13 个大类、100+ 个实用工具函数
- **性能优化** - 针对移动端环境进行优化,确保高性能和低内存占用
- **平台兼容** - 支持 UniApp 所有平台(H5、小程序、APP)
- **开箱即用** - 提供统一的导入和使用方式,无需额外配置
- **详细文档** - 每个函数都包含完整的 JSDoc 注释和使用示例
- **测试完备** - 所有核心函数都经过充分测试,保证稳定可靠
- **按需引入** - 支持 Tree-shaking,只打包使用到的函数

参考: src/utils/

## 工具函数分类

### 1. 字符串工具 (String Utils)

**文件**: `src/utils/string.ts` (493 行, 21 个函数)

提供全面的字符串处理功能,包含基本操作、格式化、HTML 处理、URL 处理等。

**核心函数**:
- `parseStrEmpty(str)` - 转换空值为空字符串
- `isEmpty(str)` - 检查字符串是否为空
- `capitalize(str)` - 首字母大写
- `truncate(str, maxLength)` - 截断字符串
- `byteLength(str)` - 计算字节长度
- `createUniqueString()` - 生成唯一标识符
- `sprintf(str, ...args)` - 格式化字符串
- `html2Text(html)` - HTML 转纯文本
- `escapeHtml(html)` - 转义 HTML 特殊字符
- `isExternal(path)` - 判断是否外部链接
- `getQueryObject(url)` - 解析 URL 查询参数
- `objectToQuery(params)` - 对象转查询字符串
- `normalizePath(path)` - 标准化路径格式
- `isPathMatch(pattern, path)` - 路径模式匹配
- `camelToKebab(str)` - 驼峰转短横线
- `kebabToCamel(str)` - 短横线转驼峰
- `isValidJSON(str)` - 验证 JSON 格式

参考: src/utils/string.ts:1-493

### 2. 日期时间工具 (Date Utils)

**文件**: `src/utils/date.ts` (403 行, 18 个函数)

提供强大的日期时间处理功能,支持多种格式语法。

**核心函数**:
- `formatDate(time, pattern)` - 日期格式化(支持 yyyy/YYYY 双格式)
- `formatRelativeTime(time)` - 相对时间(刚刚、5分钟前等)
- `getCurrentTime()` - 获取当前时间
- `getCurrentDate()` - 获取当前日期
- `getCurrentDateTime()` - 获取当前完整日期时间
- `getTimeStamp(type)` - 获取时间戳
- `getDateRange(days)` - 获取日期范围
- `getCurrentWeekRange()` - 获取本周范围
- `getCurrentMonthRange()` - 获取本月范围
- `getDaysBetween(start, end)` - 计算两日期间天数
- `isSameDay(date1, date2)` - 判断是否同一天
- `dateAdd(date, type, value)` - 日期加减

参考: src/utils/date.ts:1-403

### 3. 缓存管理工具 (Cache Utils)

**文件**: `src/utils/cache.ts` (288 行)

基于 UniApp 存储 API 的优化缓存封装,提供类型安全、自动过期、前缀隔离等特性。

**核心 API**:
- `cache.set<T>(key, value, expireSeconds)` - 设置缓存
- `cache.get<T>(key)` - 获取缓存
- `cache.remove(key)` - 移除缓存项
- `cache.has(key)` - 检查缓存是否存在
- `cache.clearAll()` - 清除所有应用缓存
- `cache.cleanup()` - 手动清理过期缓存
- `cache.getStats()` - 获取缓存统计信息

**使用示例**:
```typescript
// 存储各种类型
cache.set('userInfo', { id: 1, name: 'admin' })
cache.set('token', 'abc123', 7 * 24 * 3600)  // 7天过期

// 获取时保持原始类型
const userInfo = cache.get<UserInfo>('userInfo')
const token = cache.get<string>('token')
```

参考: src/utils/cache.ts:1-288

### 4. 数据验证工具 (Validators)

**文件**: `src/utils/validators.ts` (1046 行, 60+ 个函数)

提供超过 60 个验证函数,涵盖文件、URL、字符串、类型、数值、日期等多个领域。

**常用验证函数**:
- `isEmail(email)` - 验证电子邮件地址
- `isChinesePhoneNumber(phone)` - 验证中国手机号
- `isChineseIdCard(id)` - 验证中国身份证号(含校验位)
- `isPassword(password, options)` - 验证密码强度
- `isValidURL(url)` - 验证 URL 格式
- `isNumber(value)` - 验证是否为有效数字
- `isInteger(value)` - 验证是否为整数
- `isInRange(value, min, max)` - 验证数值范围
- `isValidDate(date)` - 验证日期对象有效性
- `isCreditCardNumber(cardNumber)` - 验证信用卡号(Luhn算法)

参考: src/utils/validators.ts:1-1046

### 5. 平台判断工具 (Platform Utils)

**文件**: `src/utils/platform.ts` (187 行)

提供 UniApp 多平台环境判断功能。

**核心函数**:
- `isH5()` - 判断是否 H5 环境
- `isMp()` - 判断是否小程序环境
- `isApp()` - 判断是否 APP 环境
- `isWechat()` - 判断是否微信小程序
- `isAlipay()` - 判断是否支付宝小程序
- `isIOS()` - 判断是否 iOS 系统
- `isAndroid()` - 判断是否 Android 系统
- `getPlatformName()` - 获取平台名称

参考: src/utils/platform.ts:1-187

### 6. 函数工具 (Function Utils)

**文件**: `src/utils/function.ts` (598 行)

提供函数式编程常用工具。

**核心函数**:
- `debounce(fn, delay)` - 防抖函数
- `throttle(fn, delay)` - 节流函数
- `once(fn)` - 只执行一次
- `memoize(fn)` - 记忆化函数
- `curry(fn)` - 柯里化
- `compose(...fns)` - 函数组合
- `retry(fn, times, interval)` - 重试函数

参考: src/utils/function.ts:1-598

### 7. 异步处理工具 (To Utils)

**文件**: `src/utils/to.ts` (264 行)

提供优雅的异步错误处理。

**核心函数**:
- `to(promise)` - 转换 Promise 为 `[error, data]` 格式
- `toAsync(fn, ...args)` - 包装异步函数
- `parallel(promises)` - 并行执行多个 Promise
- `series(promises)` - 串行执行多个 Promise
- `retry(fn, options)` - 异步函数重试
- `timeout(promise, ms)` - Promise 超时控制

**使用示例**:
```typescript
// 避免 try-catch 嵌套
const [error, data] = await to(
  uni.request({ url: '/api/user' })
)

if (error) {
  console.error('请求失败:', error)
  return
}

console.log('用户数据:', data)
```

参考: src/utils/to.ts:1-264

### 8. 其他工具函数

- **加密工具** (`crypto.ts`): Base64、AES、MD5、SHA256 等加密功能
- **布尔值工具** (`boolean.ts`): 布尔值转换和判断
- **日志工具** (`logger.ts`): 统一的日志记录功能
- **路由工具** (`route.ts`): UniApp 路由跳转的便捷封装
- **RSA 工具** (`rsa.ts`): RSA 非对称加密功能
- **租户工具** (`tenant.ts`): 多租户环境下的租户管理

## 使用方式

### 按需导入(推荐)

```typescript
// 导入需要的函数
import { formatDate, getDaysBetween } from '@/utils/date'
import { cache } from '@/utils/cache'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'
import { to } from '@/utils/to'

// 使用
const formatted = formatDate(new Date(), 'yyyy-MM-dd')
cache.set('userToken', token, 7 * 24 * 3600)
const isValid = isEmail('test@example.com')
const [error, data] = await to(api.getData())
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
```

## 最佳实践

### 1. 统一错误处理

使用 `to` 工具统一处理异步错误:

```typescript
// ✅ 推荐
const [error, data] = await to(api.getUserInfo())
if (error) {
  uni.showToast({ title: '获取失败', icon: 'none' })
  return
}

// ❌ 不推荐
try {
  const data = await api.getUserInfo()
} catch (error) {
  uni.showToast({ title: '获取失败', icon: 'none' })
}
```

### 2. 缓存过期时间

根据数据特性设置不同过期时间:

```typescript
cache.set('userToken', token, 7 * 24 * 3600)        // 7天
cache.set('userInfo', userInfo, 24 * 3600)         // 1天
cache.set('appConfig', config, 30 * 60)             // 30分钟
```

### 3. 表单验证组合

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

  return errors
}
```

### 4. 平台判断

在使用平台特定功能前,务必先进行平台判断:

```typescript
if (isWechat()) {
  // 微信小程序专用功能
  wx.login()
}

if (isH5()) {
  // H5 特定代码
  window.localStorage.setItem('key', 'value')
}
```

## 注意事项

### 1. 缓存容量限制

UniApp 各平台的存储容量有限制:
- 小程序: 单个key最大1MB,总容量10MB
- H5: 受浏览器限制,通常5-10MB
- APP: 相对较大,但也要避免过度使用

参考: src/utils/cache.ts:231-256

### 2. 时间戳单位

`formatDate` 会自动识别10位(秒)和13位(毫秒)时间戳:

```typescript
formatDate(1678886400, 'yyyy-MM-dd')      // 10位秒时间戳,自动转换
formatDate(1678886400000, 'yyyy-MM-dd')  // 13位毫秒时间戳
```

参考: src/utils/date.ts:60-64

### 3. 验证函数性能

复杂的正则表达式验证可能影响性能,对于大量数据验证应考虑性能优化。

参考: src/utils/validators.ts:573-594

### 4. 密码验证规则

`isPassword` 函数默认要求较高的密码强度,可根据业务需求调整:

```typescript
// 默认配置(较严格)
isPassword(pwd, {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
})

// 宽松配置
isPassword(pwd, {
  minLength: 6,
  requireUppercase: false,
  requireSpecialChars: false
})
```

参考: src/utils/validators.ts:653-679

### 5. 异步重试策略

使用 `retry` 函数时应设置合理的重试次数和间隔:

```typescript
// ✅ 推荐
await retry(unstableApi, {
  times: 3,
  interval: 1000
})

// ❌ 不推荐
await retry(unstableApi, {
  times: Infinity  // 可能导致死循环
})
```

参考: src/utils/function.ts:400-450

## 扩展阅读

### 相关源码文件

- 字符串工具: `src/utils/string.ts` (493 行, 21 个函数)
- 日期工具: `src/utils/date.ts` (403 行, 18 个函数)
- 缓存工具: `src/utils/cache.ts` (288 行, 8 个 API)
- 验证工具: `src/utils/validators.ts` (1046 行, 60+ 个函数)
- 加密工具: `src/utils/crypto.ts` (156 行)
- 平台工具: `src/utils/platform.ts` (187 行)
- 函数工具: `src/utils/function.ts` (598 行)
- 异步工具: `src/utils/to.ts` (264 行)

---

通过合理使用这些工具函数,可以大幅提升开发效率、代码质量和应用性能。
