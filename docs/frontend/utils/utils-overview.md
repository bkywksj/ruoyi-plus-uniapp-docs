# 工具函数概览

Vue3 + TypeScript 项目的完整工具函数库，提供了丰富的实用工具函数，涵盖了前端开发中的各种常见需求。本文档详细介绍所有工具函数的功能、参数和使用方法。

## 工具函数库架构

工具函数库采用模块化设计，按功能分类组织代码，每个模块专注于特定领域的功能实现：

```text
src/utils/
├── string.ts          # 字符串处理工具
├── object.ts          # 对象操作工具
├── date.ts            # 日期时间工具
├── format.ts          # 数据格式化工具
├── function.ts        # 函数增强工具
├── validators.ts      # 数据验证工具
├── boolean.ts         # 布尔值处理工具
├── crypto.ts          # 加密工具
├── rsa.ts             # RSA 加密工具
├── cache.ts           # 浏览器缓存工具
├── class.ts           # CSS 类名操作工具
├── scroll.ts          # 滚动控制工具
├── tree.ts            # 树形数据工具
├── modal.ts           # UI 弹窗工具
├── tab.ts             # 标签页管理工具
└── to.ts              # 异步错误处理工具
```

---

## 字符串处理 string.ts

提供全面的字符串处理功能，包括基本操作、格式化、URL 处理、验证和转换。

### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `parseStrEmpty` | 空值转换 | `str: string \| null \| undefined` | `string` |
| `isEmpty` | 判断字符串是否为空 | `str: any` | `boolean` |
| `isNotEmpty` | 判断字符串是否非空 | `str: any` | `boolean` |
| `capitalize` | 首字母大写 | `str: string` | `string` |
| `truncate` | 字符串截断 | `str: string, length: number, suffix?: string` | `string` |
| `byteLength` | 计算字节长度 | `str: string` | `number` |
| `createUniqueString` | 生成唯一字符串 | - | `string` |
| `sprintf` | 格式化字符串 | `str: string, ...args: any[]` | `string` |
| `html2Text` | HTML 转纯文本 | `html: string` | `string` |
| `getTextExcerpt` | 获取文本摘要 | `text: string, maxLength: number` | `string` |
| `escapeHtml` | 转义 HTML 特殊字符 | `text: string` | `string` |
| `isExternal` | 判断是否为外部链接 | `path: string` | `boolean` |
| `isHttp` | 判断是否为 HTTP URL | `url: string` | `boolean` |
| `getQueryObject` | 解析 URL 查询参数 | `url: string` | `object` |
| `objectToQuery` | 对象转查询字符串 | `obj: object` | `string` |
| `normalizePath` | 路径标准化 | `path: string` | `string` |
| `isPathMatch` | 路径匹配检查 | `path: string, pattern: string` | `boolean` |
| `camelToKebab` | 驼峰转短横线 | `str: string` | `string` |
| `kebabToCamel` | 短横线转驼峰 | `str: string` | `string` |
| `isValidJSON` | JSON 格式验证 | `str: string` | `boolean` |

### 使用示例

```typescript
import {
  parseStrEmpty,
  capitalize,
  truncate,
  isExternal,
  camelToKebab,
  sprintf,
  html2Text,
  getQueryObject,
  isValidJSON,
  byteLength
} from '@/utils/string'

// 空值转换 - 将 null/undefined 转为空字符串
const value1 = parseStrEmpty(null)       // ''
const value2 = parseStrEmpty(undefined)  // ''
const value3 = parseStrEmpty('hello')    // 'hello'

// 首字母大写
const title = capitalize('hello world')   // 'Hello world'
const name = capitalize('vue framework')  // 'Vue framework'

// 字符串截断 - 超出长度添加省略号
const short = truncate('这是一个很长的文本内容', 10)      // '这是一个很长...'
const custom = truncate('Hello World', 8, '***')          // 'Hello***'

// 判断外部链接
const isExt1 = isExternal('https://example.com')   // true
const isExt2 = isExternal('http://localhost:8080') // true
const isExt3 = isExternal('/dashboard')            // false
const isExt4 = isExternal('mailto:test@test.com')  // true

// 命名格式转换
const kebab = camelToKebab('backgroundColor')  // 'background-color'
const camel = kebabToCamel('font-size')        // 'fontSize'

// 格式化字符串（类似 C 语言 sprintf）
const msg = sprintf('用户 %s 已登录，ID: %d', '张三', 12345)
// '用户 张三 已登录，ID: 12345'

// HTML 转纯文本
const text = html2Text('<p>Hello <strong>World</strong></p>')
// 'Hello World'

// 解析 URL 查询参数
const params = getQueryObject('https://example.com?name=test&id=123')
// { name: 'test', id: '123' }

// JSON 格式验证
const valid1 = isValidJSON('{"name":"test"}')  // true
const valid2 = isValidJSON('{invalid}')         // false

// 计算字节长度（中文占 3 字节）
const len1 = byteLength('Hello')    // 5
const len2 = byteLength('你好')     // 6
const len3 = byteLength('Hello你好') // 11
```

### 技术实现细节

**parseStrEmpty 实现原理**：
```typescript
export const parseStrEmpty = (str: string | null | undefined): string => {
  if (!str || str === 'undefined' || str === 'null') {
    return ''
  }
  return str
}
```

**isExternal 正则匹配**：
```typescript
export const isExternal = (path: string): boolean => {
  return /^(https?:|mailto:|tel:|\/\/)/.test(path)
}
```

**byteLength 实现**：
```typescript
export const byteLength = (str: string): number => {
  let len = 0
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
      len += 3  // 中文等宽字符占 3 字节
    } else {
      len += 1  // ASCII 字符占 1 字节
    }
  }
  return len
}
```

---

## 对象操作 object.ts

提供强大的对象和数组处理工具，包括深度操作、属性访问、数据清理和格式转换。

### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `isEmptyObject` | 判断是否为空对象 | `obj: object` | `boolean` |
| `shallowEqual` | 浅比较两个对象 | `obj1: object, obj2: object` | `boolean` |
| `objectMerge` | 深度合并对象 | `target: object, source: object` | `object` |
| `deepClone` | 深拷贝对象 | `source: any` | `any` |
| `getPropertyByPath` | 按路径获取属性值 | `obj: object, path: string` | `any` |
| `get` | 安全获取嵌套属性 | `obj: object, path: string, defaultValue?: any` | `any` |
| `set` | 设置嵌套属性值 | `obj: object, path: string, value: any` | `void` |
| `pick` | 选取指定属性 | `obj: object, keys: string[]` | `object` |
| `omit` | 排除指定属性 | `obj: object, keys: string[]` | `object` |
| `removeEmpty` | 移除空值属性 | `obj: object` | `object` |
| `cleanArray` | 清理数组空值 | `arr: any[]` | `any[]` |
| `uniqueArr` | 数组去重 | `arr: any[]` | `any[]` |
| `groupBy` | 数组分组 | `arr: any[], key: string` | `object` |
| `queryToObject` | 查询字符串转对象 | `query: string` | `object` |
| `objectToQuery` | 对象转查询字符串 | `obj: object` | `string` |
| `camelizeKeys` | 键名转驼峰 | `obj: object` | `object` |
| `snakeizeKeys` | 键名转下划线 | `obj: object` | `object` |

### 使用示例

```typescript
import {
  deepClone,
  get,
  set,
  pick,
  omit,
  removeEmpty,
  groupBy,
  objectMerge,
  shallowEqual,
  uniqueArr,
  camelizeKeys,
  snakeizeKeys
} from '@/utils/object'

// 深拷贝对象 - 创建完全独立的副本
const original = {
  user: { name: '张三', age: 25 },
  tags: ['开发', '设计']
}
const copy = deepClone(original)
copy.user.name = '李四'  // 不影响 original

// 安全获取嵌套属性 - 避免 undefined 错误
const user = {
  profile: {
    name: '张三',
    address: { city: '北京' }
  }
}
const name = get(user, 'profile.name', '匿名')           // '张三'
const city = get(user, 'profile.address.city', '未知')  // '北京'
const country = get(user, 'profile.address.country', '中国')  // '中国'（使用默认值）
const phone = get(user, 'contact.phone', '')  // ''（路径不存在使用默认值）

// 设置嵌套属性值
const data = {}
set(data, 'user.profile.name', '张三')
// data = { user: { profile: { name: '张三' } } }

// 选取指定属性
const fullUser = { id: 1, name: '张三', email: 'test@test.com', password: '123456' }
const safeUser = pick(fullUser, ['id', 'name', 'email'])
// { id: 1, name: '张三', email: 'test@test.com' }

// 排除指定属性
const publicUser = omit(fullUser, ['password'])
// { id: 1, name: '张三', email: 'test@test.com' }

// 移除空值属性
const formData = { name: '张三', age: null, email: '', phone: undefined }
const cleanData = removeEmpty(formData)
// { name: '张三' }

// 数组分组
const users = [
  { name: '张三', dept: '研发部' },
  { name: '李四', dept: '销售部' },
  { name: '王五', dept: '研发部' }
]
const grouped = groupBy(users, 'dept')
// { '研发部': [{...}, {...}], '销售部': [{...}] }

// 深度合并对象
const defaults = { theme: 'light', fontSize: 14, sidebar: { collapsed: false } }
const userConfig = { theme: 'dark', sidebar: { width: 200 } }
const merged = objectMerge(defaults, userConfig)
// { theme: 'dark', fontSize: 14, sidebar: { collapsed: false, width: 200 } }

// 浅比较
const obj1 = { a: 1, b: 2 }
const obj2 = { a: 1, b: 2 }
const obj3 = { a: 1, b: 3 }
shallowEqual(obj1, obj2)  // true
shallowEqual(obj1, obj3)  // false

// 数组去重
const arr = [1, 2, 2, 3, 3, 3]
const unique = uniqueArr(arr)  // [1, 2, 3]

// 键名格式转换
const snakeObj = { user_name: '张三', user_age: 25 }
const camelObj = camelizeKeys(snakeObj)  // { userName: '张三', userAge: 25 }

const camelData = { userName: '张三', userAge: 25 }
const snakeData = snakeizeKeys(camelData)  // { user_name: '张三', user_age: 25 }
```

### 技术实现细节

**get 函数实现**：
```typescript
export const get = (obj: any, path: string, defaultValue: any = undefined): any => {
  if (!obj || !path) return defaultValue

  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}
```

**deepClone 实现**：
```typescript
export const deepClone = <T>(source: T): T => {
  if (source === null || typeof source !== 'object') {
    return source
  }

  if (source instanceof Date) {
    return new Date(source.getTime()) as any
  }

  if (source instanceof Array) {
    return source.map(item => deepClone(item)) as any
  }

  if (source instanceof Object) {
    const copy = {} as T
    Object.keys(source).forEach(key => {
      copy[key as keyof T] = deepClone((source as any)[key])
    })
    return copy
  }

  return source
}
```

---

## 日期时间 date.ts

提供完整的日期时间处理方案，包括格式化、解析、计算和范围获取。自动兼容 `yyyy-MM-dd` 和 `YYYY-MM-DD` 两种格式语法。

### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `formatDate` | 日期格式化 | `time: Date \| string \| number, pattern?: string` | `string` |
| `formatTableDate` | 表格时间格式化 | `cellValue: string, pattern?: string` | `string` |
| `formatDay` | 日期格式化（仅年月日） | `time: Date \| string \| number` | `string` |
| `formatRelativeTime` | 相对时间格式化 | `time: string \| number, option?: string` | `string` |
| `formatDateRange` | 日期范围格式化 | `dateRange: [Date, Date], separator?: string, format?: string` | `string` |
| `parseDate` | 解析日期字符串 | `dateStr: string` | `Date \| null` |
| `getCurrentTime` | 获取当前时间 | `pattern?: string` | `string` |
| `getCurrentDate` | 获取当前日期 | - | `string` |
| `getCurrentDateTime` | 获取当前日期时间 | - | `string` |
| `getTimeStamp` | 获取时间戳 | `type?: 'ms' \| 's'` | `number` |
| `getDateRange` | 获取日期范围 | `days: number` | `[Date, Date]` |
| `getCurrentWeekRange` | 获取本周范围 | - | `[Date, Date]` |
| `getCurrentMonthRange` | 获取本月范围 | - | `[Date, Date]` |
| `addDateRange` | 添加日期范围参数 | `params: any, dateRange: any[], propName?: string` | `any` |
| `getDateRangeByType` | 按类型获取日期范围 | `dateType: string` | `[string, string] \| null` |
| `initDateRangeFromQuery` | 从路由初始化日期范围 | `query: object, dateParamName?: string` | `[string, string]` |
| `getDaysBetween` | 计算日期间隔天数 | `start: Date, end: Date` | `number` |
| `isSameDay` | 判断是否同一天 | `date1: Date, date2: Date` | `boolean` |
| `getWeekOfYear` | 获取年内周数 | `date: Date` | `number` |
| `dateAdd` | 日期加减 | `date: Date, type: string, value: number` | `Date` |

### 使用示例

```typescript
import {
  formatDate,
  formatDay,
  formatRelativeTime,
  getCurrentDateTime,
  getCurrentDate,
  getDaysBetween,
  getDateRangeByType,
  getCurrentWeekRange,
  getCurrentMonthRange,
  dateAdd,
  addDateRange
} from '@/utils/date'

// 日期格式化 - 支持多种输入类型
const now = new Date()
const dateStr1 = formatDate(now, 'yyyy-MM-dd HH:mm:ss')  // '2025-03-29 15:30:45'
const dateStr2 = formatDate(now, 'YYYY-MM-DD')            // '2025-03-29'
const dateStr3 = formatDate(now, 'yyyy年MM月dd日')        // '2025年03月29日'
const dateStr4 = formatDate(now, 'HH:mm')                 // '15:30'

// 从时间戳格式化
const timestamp = 1711698645000
const dateStr5 = formatDate(timestamp, 'yyyy-MM-dd')  // '2025-03-29'

// 从字符串格式化
const dateStr6 = formatDate('2025-03-29T15:30:45', 'yyyy年MM月dd日 HH时mm分')
// '2025年03月29日 15时30分'

// 仅格式化年月日
const day = formatDay(now)  // '2025-03-29'

// 相对时间格式化
const relTime1 = formatRelativeTime(Date.now() - 1000 * 30)    // '刚刚'
const relTime2 = formatRelativeTime(Date.now() - 1000 * 60 * 5)  // '5分钟前'
const relTime3 = formatRelativeTime(Date.now() - 1000 * 60 * 60 * 3)  // '3小时前'
const relTime4 = formatRelativeTime(Date.now() - 1000 * 60 * 60 * 25)  // '1天前'

// 获取当前时间
const currentTime = getCurrentDateTime()  // '2025-03-29 15:30:45'
const currentDate = getCurrentDate()      // '2025-03-29'

// 计算日期差
const startDate = new Date('2025-01-01')
const endDate = new Date('2025-03-29')
const days = getDaysBetween(startDate, endDate)  // 87

// 按类型获取日期范围
const todayRange = getDateRangeByType('today')      // ['2025-03-29 00:00:00', '2025-03-29 23:59:59']
const weekRange = getDateRangeByType('week')        // 本周一到今天
const monthRange = getDateRangeByType('month')      // 本月一号到今天
const yearRange = getDateRangeByType('year')        // 今年一月一号到今天

// 获取本周/本月范围
const [weekStart, weekEnd] = getCurrentWeekRange()   // [周一, 周日]
const [monthStart, monthEnd] = getCurrentMonthRange() // [本月一号, 本月最后一天]

// 日期加减
const tomorrow = dateAdd(now, 'day', 1)         // 明天
const lastWeek = dateAdd(now, 'day', -7)        // 7天前
const nextMonth = dateAdd(now, 'month', 1)      // 下个月
const lastYear = dateAdd(now, 'year', -1)       // 去年

// 添加日期范围到查询参数
const queryParams = { page: 1, limit: 10 }
const dateRange = ['2025-01-01', '2025-03-29']
const paramsWithDate = addDateRange(queryParams, dateRange)
// { page: 1, limit: 10, params: { beginTime: '2025-01-01', endTime: '2025-03-29' } }

// 自定义字段名
const customParams = addDateRange({ page: 1 }, dateRange, 'createTime')
// { page: 1, params: { beginCreateTime: '2025-01-01', endCreateTime: '2025-03-29' } }
```

### 格式化占位符说明

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `yyyy` / `YYYY` | 四位年份 | 2025 |
| `MM` | 两位月份 | 01-12 |
| `M` | 月份 | 1-12 |
| `dd` / `DD` | 两位日期 | 01-31 |
| `d` / `D` | 日期 | 1-31 |
| `HH` | 24小时制小时 | 00-23 |
| `H` | 小时 | 0-23 |
| `mm` | 两位分钟 | 00-59 |
| `m` | 分钟 | 0-59 |
| `ss` | 两位秒钟 | 00-59 |
| `s` | 秒钟 | 0-59 |
| `SSS` | 毫秒 | 000-999 |
| `w` | 星期 | 日/一/二/三/四/五/六 |

---

## 数据格式化 format.ts

提供专业的数据展示格式化功能，包括数值格式化、隐私保护、文本处理和状态显示。

### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `formatUnit` | 格式化 CSS 单位值 | `val: number \| string, defaultUnit?: string` | `string` |
| `formatNumber` | 数字格式化 | `value: number, decimals?: number, useThousandsSeparator?: boolean` | `string` |
| `formatPercent` | 百分比格式化 | `value: number, decimals?: number, withSymbol?: boolean` | `string` |
| `formatAmount` | 金额格式化 | `amount: number, decimals?: number, ...` | `string` |
| `formatCurrency` | 货币格式化 | `amount: number, currencyCode?: string, options?: CurrencyFormatOptions` | `string` |
| `formatFileSize` | 文件大小格式化 | `bytes: number, decimals?: number` | `string` |
| `formatDistance` | 距离格式化 | `meters: number, decimals?: number` | `string` |
| `formatDuration` | 时长格式化 | `seconds: number, showZeroHours?: boolean` | `string` |
| `formatPrivacy` | 隐私数据脱敏 | `data: string, options?: PrivacyOptions` | `string` |
| `formatIDCard` | 身份证脱敏 | `idNumber: string, options?: PrivacyOptions` | `string` |
| `formatPhone` | 手机号格式化 | `phone: string, format?: string, mask?: string, privacy?: boolean` | `string` |
| `formatBankCard` | 银行卡格式化 | `cardNumber: string, separator?: string, privacy?: boolean` | `string` |
| `formatIP` | IP 地址格式化 | `ip: string, options?: IPFormatOptions` | `string` |
| `formatStringLength` | 字符串长度格式化 | `str: string, options?: StringLengthOptions` | `string` |
| `formatFileName` | 文件名格式化 | `filename: string, maxLength?: number` | `string` |
| `formatURL` | URL 格式化 | `url: string, showParams?: boolean` | `string` |
| `formatList` | 列表格式化 | `list: any[], field?: string, options?: ListFormatOptions` | `string` |
| `formatEnum` | 枚举值格式化 | `value: any, enumMap: object, defaultText?: string` | `string` |
| `formatBoolean` | 布尔值格式化 | `value: any, trueText?: string, falseText?: string` | `string` |
| `formatStatusColor` | 状态颜色格式化 | `status: number \| string, customColorMap?: object` | `string` |
| `formatTableCell` | 表格单元格格式化 | `value: any, type: string, options?: object` | `string` |

### 使用示例

```typescript
import {
  formatCurrency,
  formatFileSize,
  formatPrivacy,
  formatPhone,
  formatIDCard,
  formatBankCard,
  formatNumber,
  formatPercent,
  formatDuration,
  formatDistance,
  formatList,
  formatEnum,
  formatBoolean,
  formatStatusColor,
  formatStringLength,
  formatFileName
} from '@/utils/format'

// 货币格式化
const price1 = formatCurrency(1234.56)               // '¥1,234.56'
const price2 = formatCurrency(1234.56, 'USD')        // '$1,234.56'
const price3 = formatCurrency(1234.56, 'EUR')        // '€1,234.56'
const price4 = formatCurrency(1234.56, 'CNY', { decimals: 0 })  // '¥1,235'

// 数字格式化
const num1 = formatNumber(1234567, 0, true)          // '1,234,567'
const num2 = formatNumber(1234.5678, 2)              // '1234.57'
const num3 = formatNumber(1234567.89, 2, true)       // '1,234,567.89'

// 百分比格式化
const percent1 = formatPercent(0.1234)               // '12.34%'
const percent2 = formatPercent(0.1234, 1)            // '12.3%'
const percent3 = formatPercent(0.1234, 2, false)     // '12.34'

// 文件大小格式化
const size1 = formatFileSize(1024)                   // '1.00 KB'
const size2 = formatFileSize(1234567)                // '1.18 MB'
const size3 = formatFileSize(1234567890)             // '1.15 GB'
const size4 = formatFileSize(0)                      // '0 Bytes'

// 距离格式化
const dist1 = formatDistance(500)                    // '500米'
const dist2 = formatDistance(1500)                   // '1.5公里'
const dist3 = formatDistance(12345, 2)               // '12.35公里'

// 时长格式化
const duration1 = formatDuration(3661)               // '1小时1分1秒'
const duration2 = formatDuration(61)                 // '1分1秒'
const duration3 = formatDuration(30)                 // '0分30秒'

// 隐私数据脱敏
const masked1 = formatPrivacy('13812345678', { showStart: 3, showEnd: 4 })
// '138****5678'

const masked2 = formatPrivacy('张三丰', { showStart: 1, maskLength: 2 })
// '张**'

// 手机号格式化
const phone1 = formatPhone('13812345678')                        // '138-1234-5678'
const phone2 = formatPhone('13812345678', 'xxx xxxx xxxx')       // '138 1234 5678'
const phone3 = formatPhone('13812345678', undefined, '*', true)  // '138****5678'

// 身份证脱敏
const idCard = formatIDCard('110101199001011234')    // '1101**********1234'
const idCard2 = formatIDCard('110101199001011234', { showStart: 6, showEnd: 4 })
// '110101********1234'

// 银行卡格式化
const bankCard1 = formatBankCard('6225365271562822')              // '6225 3652 7156 2822'
const bankCard2 = formatBankCard('6225365271562822', '-')         // '6225-3652-7156-2822'
const bankCard3 = formatBankCard('6225365271562822', ' ', true)   // '**** **** **** 2822'

// 字符串长度格式化
const str1 = formatStringLength('这是一个很长的字符串', { maxLength: 10 })
// '这是一个很长...'

const str2 = formatStringLength('这是一个很长的字符串', { maxLength: 10, position: 'middle' })
// '这是一个...字符串'

// 文件名格式化（保留扩展名）
const file1 = formatFileName('very_long_filename_example.txt', 20)
// 'very_long_f...ple.txt'

// 列表格式化
const list1 = formatList([1, 2, 3])                              // '1,2,3'
const list2 = formatList([{id: 1, name: 'A'}, {id: 2, name: 'B'}], 'name')
// 'A,B'
const list3 = formatList([1, 2, 3, 4, 5], null, { maxItems: 3, ellipsis: '等' })
// '1,2,3等'

// 枚举值格式化
const status = formatEnum(1, { 0: '禁用', 1: '启用' })          // '启用'
const level = formatEnum('VIP', { VIP: '会员', NORMAL: '普通' }) // '会员'

// 布尔值格式化
const bool1 = formatBoolean(true)                    // '是'
const bool2 = formatBoolean(false, '启用', '禁用')   // '禁用'
const bool3 = formatBoolean('true')                  // '是'

// 状态颜色格式化
const color1 = formatStatusColor(1)                  // 'success'
const color2 = formatStatusColor(0)                  // 'info'
const color3 = formatStatusColor('error', { error: 'danger' })  // 'danger'
```

---

## 函数增强 function.ts

提供函数式编程工具集，包括性能优化、执行控制、函数转换和异步处理。

### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `copy` | 复制到剪贴板 | `text: string, message?: string` | `Promise<void>` |
| `withHeaders` | 为请求添加自定义头 | `headers: object` | `object` |
| `debounce` | 防抖函数 | `fn: Function, delay?: number` | `Function` |
| `throttle` | 节流函数 | `fn: Function, interval?: number` | `Function` |
| `once` | 仅执行一次 | `fn: Function` | `Function` |
| `delay` | 延迟执行 | `ms: number` | `Promise<void>` |
| `retry` | 重试执行 | `fn: Function, times?: number, delayMs?: number` | `Promise<any>` |
| `withTimeout` | 超时控制 | `promise: Promise, timeout: number` | `Promise<any>` |
| `curry` | 函数柯里化 | `fn: Function` | `Function` |
| `partial` | 偏函数应用 | `fn: Function, ...args: any[]` | `Function` |
| `memoize` | 记忆化缓存 | `fn: Function` | `Function` |
| `serial` | 串行执行 | `tasks: Function[]` | `Promise<any[]>` |
| `parallel` | 并行执行 | `tasks: Function[], limit?: number` | `Promise<any[]>` |
| `withRetry` | 带重试的异步执行 | `fn: Function, options?: object` | `Promise<any>` |
| `rateLimit` | 频率限制 | `fn: Function, limit: number, interval: number` | `Function` |
| `isPresignedUrl` | 判断预签名 URL | `url: string` | `boolean` |
| `addCacheBuster` | 添加缓存破坏参数 | `url: string` | `string` |
| `triggerChartResize` | 触发图表重绘 | - | `void` |

### 使用示例

```typescript
import {
  copy,
  debounce,
  throttle,
  retry,
  delay,
  once,
  memoize,
  withTimeout,
  serial,
  parallel,
  rateLimit
} from '@/utils/function'

// 复制到剪贴板
await copy('要复制的文本', '复制成功！')

// 防抖处理 - 输入停止 300ms 后执行
const debouncedSearch = debounce((keyword: string) => {
  console.log('搜索:', keyword)
  searchAPI(keyword)
}, 300)

// 在输入框事件中使用
inputRef.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})

// 节流处理 - 每 100ms 最多执行一次
const throttledScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
  updateScrollPosition()
}, 100)

window.addEventListener('scroll', throttledScroll)

// 仅执行一次
const initOnce = once(() => {
  console.log('初始化操作')
  loadResources()
})

initOnce()  // 执行
initOnce()  // 不再执行

// 延迟执行
const showLoadingThenHide = async () => {
  showLoading()
  await delay(2000)  // 延迟 2 秒
  hideLoading()
}

// 重试执行 - 网络请求失败时自动重试
const fetchWithRetry = async (url: string) => {
  return retry(
    () => fetch(url).then(res => res.json()),
    3,      // 最多重试 3 次
    1000    // 每次间隔 1 秒
  )
}

// 超时控制
const fetchWithTimeout = async (url: string) => {
  try {
    const data = await withTimeout(
      fetch(url).then(res => res.json()),
      5000  // 5 秒超时
    )
    return data
  } catch (e) {
    console.error('请求超时或失败:', e)
  }
}

// 记忆化缓存 - 相同参数只计算一次
const expensiveCalculation = memoize((n: number) => {
  console.log('执行计算...')
  let result = 0
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i)
  }
  return result
})

expensiveCalculation(10000)  // 执行计算
expensiveCalculation(10000)  // 直接返回缓存结果

// 串行执行 - 按顺序执行多个异步任务
const tasks = [
  () => fetchUser(1),
  () => fetchOrders(1),
  () => fetchSettings(1)
]
const results = await serial(tasks)
// 依次执行，返回 [userData, ordersData, settingsData]

// 并行执行 - 限制并发数
const uploadTasks = files.map(file => () => uploadFile(file))
const uploadResults = await parallel(uploadTasks, 3)  // 最多 3 个并发

// 频率限制 - 1 秒内最多执行 5 次
const limitedAPI = rateLimit(
  (id: number) => fetchData(id),
  5,     // 最多 5 次
  1000   // 1 秒内
)

for (let i = 0; i < 10; i++) {
  limitedAPI(i)  // 只有前 5 次会立即执行，其余排队
}
```

### 技术实现细节

**debounce 实现**：
```typescript
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function(this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
```

**throttle 实现**：
```typescript
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 100
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}
```

---

## 数据验证 validators.ts

提供全面的数据验证工具，包括类型验证、格式验证、业务验证和文件验证。

### 函数列表

| 函数名 | 说明 | 返回值 |
|--------|------|--------|
| `isString` | 是否为字符串 | `boolean` |
| `isNumber` | 是否为数字 | `boolean` |
| `isBoolean` | 是否为布尔值 | `boolean` |
| `isArray` | 是否为数组 | `boolean` |
| `isObject` | 是否为对象 | `boolean` |
| `isFunction` | 是否为函数 | `boolean` |
| `isDate` | 是否为日期对象 | `boolean` |
| `isNull` | 是否为 null | `boolean` |
| `isUndefined` | 是否为 undefined | `boolean` |
| `isEmpty` | 是否为空值 | `boolean` |
| `isEmail` | 是否为有效邮箱 | `boolean` |
| `isValidURL` | 是否为有效 URL | `boolean` |
| `isIPv4` | 是否为 IPv4 地址 | `boolean` |
| `isIPv6` | 是否为 IPv6 地址 | `boolean` |
| `isUUID` | 是否为 UUID | `boolean` |
| `isChinesePhoneNumber` | 是否为中国手机号 | `boolean` |
| `isChineseIDCard` | 是否为中国身份证号 | `boolean` |
| `isBankCardNumber` | 是否为银行卡号 | `boolean` |
| `isPostalCode` | 是否为邮政编码 | `boolean` |
| `isImageFile` | 是否为图片文件 | `boolean` |
| `isVideoFile` | 是否为视频文件 | `boolean` |
| `isAudioFile` | 是否为音频文件 | `boolean` |
| `isDocumentFile` | 是否为文档文件 | `boolean` |
| `validateFileSize` | 验证文件大小 | `boolean` |
| `validateFileType` | 验证文件类型 | `boolean` |

### 使用示例

```typescript
import {
  isEmail,
  isChinesePhoneNumber,
  isChineseIDCard,
  isValidURL,
  isIPv4,
  isUUID,
  isEmpty,
  isImageFile,
  validateFileSize,
  validateFileType
} from '@/utils/validators'

// 邮箱验证
isEmail('user@example.com')       // true
isEmail('invalid-email')          // false
isEmail('user@domain.cn')         // true

// 手机号验证（中国大陆）
isChinesePhoneNumber('13812345678')   // true
isChinesePhoneNumber('12812345678')   // false（12 开头无效）
isChinesePhoneNumber('1381234567')    // false（位数不对）

// 身份证验证（含校验码验证）
isChineseIDCard('110101199001011234')  // true（需要校验码正确）
isChineseIDCard('11010119900101123X')  // true（X 结尾）
isChineseIDCard('123456789012345678')  // false（校验码错误）

// URL 验证
isValidURL('https://example.com')          // true
isValidURL('http://localhost:8080')        // true
isValidURL('ftp://files.example.com')      // true
isValidURL('example.com')                  // false（缺少协议）

// IP 地址验证
isIPv4('192.168.1.1')      // true
isIPv4('256.1.1.1')        // false（超出范围）
isIPv4('192.168.1')        // false（格式不完整）

// UUID 验证
isUUID('550e8400-e29b-41d4-a716-446655440000')  // true
isUUID('invalid-uuid')                            // false

// 空值验证
isEmpty('')           // true
isEmpty(null)         // true
isEmpty(undefined)    // true
isEmpty([])           // true
isEmpty({})           // true
isEmpty('hello')      // false
isEmpty([1, 2])       // false

// 图片文件验证
isImageFile('photo.jpg')    // true
isImageFile('photo.png')    // true
isImageFile('photo.webp')   // true
isImageFile('doc.pdf')      // false

// 文件大小验证（字节）
validateFileSize(file, 5 * 1024 * 1024)  // 5MB 以内返回 true

// 文件类型验证
validateFileType(file, ['image/jpeg', 'image/png'])  // 验证 MIME 类型
```

---

## 缓存管理 cache.ts

提供浏览器存储封装，支持会话级和持久化的数据存储操作，自动添加应用 ID 前缀避免多应用冲突。

### 会话缓存 sessionCache

基于 `sessionStorage`，页面关闭后数据清除。

| 方法 | 说明 | 参数 |
|------|------|------|
| `set` | 设置缓存 | `key: string, value: string` |
| `get` | 获取缓存 | `key: string` |
| `getNumber` | 获取数字类型缓存 | `key: string` |
| `setJSON` | 设置 JSON 对象 | `key: string, jsonValue: T` |
| `getJSON` | 获取 JSON 对象 | `key: string` |
| `remove` | 移除缓存 | `key: string` |
| `has` | 检查是否存在 | `key: string` |
| `clearAll` | 清除所有 | - |

### 本地缓存 localCache

基于 `localStorage`，数据永久保存，支持过期时间管理。

| 方法 | 说明 | 参数 |
|------|------|------|
| `set` | 设置缓存（支持过期时间） | `key: string, value: T, expireSeconds?: number` |
| `get` | 获取缓存 | `key: string` |
| `setJSON` | 设置 JSON 对象 | `key: string, jsonValue: T, expireSeconds?: number` |
| `getJSON` | 获取 JSON 对象 | `key: string` |
| `remove` | 移除缓存 | `key: string` |
| `has` | 检查是否存在 | `key: string` |
| `clearAll` | 清除所有 | - |
| `cleanup` | 手动清理过期缓存 | - |
| `getStats` | 获取存储统计信息 | - |

### 使用示例

```typescript
import { sessionCache, localCache } from '@/utils/cache'

// ========== 会话缓存 ==========

// 存储基本数据
sessionCache.set('userName', 'admin')
sessionCache.set('userId', '12345')

// 获取数据
const userName = sessionCache.get('userName')  // 'admin'
const userId = sessionCache.getNumber('userId')  // 12345

// 存储对象
sessionCache.setJSON('userInfo', {
  id: 1,
  name: '张三',
  role: 'administrator'
})

// 获取对象（支持泛型）
interface UserInfo {
  id: number
  name: string
  role: string
}
const userInfo = sessionCache.getJSON<UserInfo>('userInfo')
console.log(userInfo?.name)  // '张三'

// 检查是否存在
if (sessionCache.has('userToken')) {
  // 令牌存在
}

// 移除缓存
sessionCache.remove('userInfo')

// 清除所有会话缓存
sessionCache.clearAll()

// ========== 本地缓存 ==========

// 存储永久数据
localCache.set('theme', 'dark')
localCache.set('language', 'zh-CN')

// 存储带过期时间的数据（7天过期）
localCache.set('userToken', 'abc123xyz', 7 * 24 * 3600)

// 获取数据（自动处理过期）
const theme = localCache.get<string>('theme')  // 'dark'
const token = localCache.get<string>('userToken')  // 未过期返回值，过期返回 null

// 存储 JSON 对象（30分钟过期）
localCache.setJSON('sysConfig', {
  language: 'zh-CN',
  fontSize: 'medium',
  autoSave: true
}, 30 * 60)

// 获取 JSON 对象
interface SystemConfig {
  language: string
  fontSize: string
  autoSave: boolean
}
const config = localCache.getJSON<SystemConfig>('sysConfig')

// 检查是否存在（包含过期检查）
if (localCache.has('userToken')) {
  // Token 存在且未过期
}

// 手动清理过期缓存
localCache.cleanup()

// 获取存储统计信息
const stats = localCache.getStats()
if (stats) {
  console.log(`总缓存项: ${stats.totalKeys}`)
  console.log(`应用缓存项: ${stats.appKeys}`)
  console.log(`使用率: ${stats.usagePercent}%`)
}

// 清除所有本地缓存
localCache.clearAll()
```

### 自动清理机制

本地缓存会自动清理过期数据：
- 应用启动时执行一次清理
- 每小时自动清理一次过期缓存
- 获取数据时自动检测并清理过期项

---

## 树形数据 tree.ts

提供专业的树形数据结构处理工具，支持自定义字段名配置。

### 函数列表

| 函数名 | 说明 | 返回值 |
|--------|------|--------|
| `buildTree` | 平铺数组构建树结构 | `T[]` |
| `findTreeNode` | 查找树节点 | `T \| null` |
| `findTreeNodePath` | 查找节点路径 | `T[]` |
| `filterTree` | 过滤树节点 | `T[]` |
| `flattenTree` | 扁平化树结构 | `T[]` |
| `traverseTree` | 遍历树节点 | `void` |
| `insertNode` | 插入节点 | `boolean` |
| `removeNode` | 删除节点 | `boolean` |
| `updateNode` | 更新节点 | `boolean` |
| `getLeafNodes` | 获取叶子节点 | `T[]` |
| `getTreeDepth` | 计算树深度 | `number` |

### 配置选项

```typescript
interface TreeOptions {
  id?: string        // ID 字段名，默认 'id'
  parentId?: string  // 父 ID 字段名，默认 'parentId'
  children?: string  // 子节点字段名，默认 'children'
  deepCopy?: boolean // 是否深拷贝，默认 true
}
```

### 使用示例

```typescript
import {
  buildTree,
  findTreeNode,
  findTreeNodePath,
  flattenTree,
  filterTree,
  traverseTree,
  getLeafNodes,
  getTreeDepth,
  insertNode,
  removeNode,
  updateNode
} from '@/utils/tree'

// 构建树结构
const flatData = [
  { id: 1, name: '公司', parentId: 0 },
  { id: 2, name: '研发部', parentId: 1 },
  { id: 3, name: '销售部', parentId: 1 },
  { id: 4, name: '前端组', parentId: 2 },
  { id: 5, name: '后端组', parentId: 2 }
]

const tree = buildTree(flatData)
// [
//   {
//     id: 1, name: '公司', parentId: 0,
//     children: [
//       { id: 2, name: '研发部', parentId: 1, children: [...] },
//       { id: 3, name: '销售部', parentId: 1, children: [] }
//     ]
//   }
// ]

// 自定义字段名
const customData = [
  { itemId: 1, name: '节点1', pid: 0 },
  { itemId: 2, name: '节点2', pid: 1 }
]
const customTree = buildTree(customData, { id: 'itemId', parentId: 'pid' })

// 查找节点
const node = findTreeNode(tree, node => node.id === 4)
// { id: 4, name: '前端组', parentId: 2 }

const nodeByName = findTreeNode(tree, node => node.name === '销售部')
// { id: 3, name: '销售部', parentId: 1 }

// 查找节点路径
const path = findTreeNodePath(tree, node => node.id === 4)
// [
//   { id: 1, name: '公司', ... },
//   { id: 2, name: '研发部', ... },
//   { id: 4, name: '前端组', ... }
// ]

// 扁平化树结构
const flatArray = flattenTree(tree)
// 返回所有节点的一维数组

// 过滤树节点
const filtered = filterTree(tree, node => node.name.includes('研发'))
// 保留包含"研发"的节点及其父节点

// 遍历树节点
traverseTree(tree, (node, parent, level) => {
  console.log(`节点: ${node.name}, 父节点: ${parent?.name}, 层级: ${level}`)
  node.level = level  // 添加层级属性
})

// 获取叶子节点
const leaves = getLeafNodes(tree)
// [{ id: 4, ... }, { id: 5, ... }, { id: 3, ... }]

// 计算树深度
const depth = getTreeDepth(tree)  // 3

// 插入节点
const newNode = { id: 6, name: '测试组', parentId: 2 }
insertNode(tree, newNode, 2)  // 插入到 id=2 的节点下

// 删除节点
removeNode(tree, node => node.id === 5)  // 删除 id=5 的节点

// 更新节点
updateNode(
  tree,
  node => node.id === 4,
  node => ({ ...node, name: '大前端组', status: 'active' })
)
```

---

## 异步错误处理 to.ts

将 Promise 和可能抛出异常的代码转换为 `[error, data]` 格式，避免 try-catch 的使用，让代码更加简洁和可读。

### 函数列表

| 函数名 | 说明 | 返回值 |
|--------|------|--------|
| `to` | 基础 Promise 异常处理 | `Promise<[Error \| null, T \| null]>` |
| `toValidate` | 表单验证专用 | `Promise<[Error \| null, boolean]>` |
| `toAll` | 批量处理 Promise | `Promise<Array<[Error \| null, T \| null]>>` |
| `toWithTimeout` | 带超时控制 | `Promise<[Error \| null, T \| null]>` |
| `toSync` | 同步版本 | `[Error \| null, T \| null]` |
| `toResult` | 类型安全透传 | `Promise<[Error \| null, T \| null]>` |
| `toWithRetry` | 自动重试机制 | `Promise<[Error \| null, T \| null]>` |
| `toWithDefault` | 带默认值 | `Promise<[Error \| null, T]>` |
| `toWithLog` | 带调试日志 | `Promise<[Error \| null, T \| null]>` |
| `toSequence` | 串行执行 | `Promise<[Error \| null, T[]]>` |
| `toIf` | 条件执行 | `Promise<[Error \| null, T \| null]>` |

### 使用示例

```typescript
import {
  to,
  toValidate,
  toAll,
  toWithTimeout,
  toWithRetry,
  toWithDefault,
  toSequence,
  toSync
} from '@/utils/to'

// 基础用法 - 替代 try-catch
const [err, user] = await to(fetchUser(userId))
if (err) {
  console.error('获取用户失败:', err.message)
  return
}
console.log('用户信息:', user)

// 表单验证
const handleSubmit = async () => {
  const [validErr, isValid] = await toValidate(formRef.value)
  if (validErr || !isValid) {
    ElMessage.error(validErr?.message || '表单验证失败')
    return
  }

  const [submitErr] = await to(submitForm(formData))
  if (submitErr) {
    ElMessage.error('提交失败: ' + submitErr.message)
    return
  }

  ElMessage.success('提交成功')
}

// 批量请求 - 并行执行多个接口
const results = await toAll([
  fetchUserInfo(userId),
  fetchUserOrders(userId),
  fetchUserPreferences(userId)
])

const [userErr, userInfo] = results[0]
const [ordersErr, orders] = results[1]
const [prefsErr, preferences] = results[2]

// 带超时控制
const [err, data] = await toWithTimeout(
  fetch('/api/heavy-computation'),
  5000,  // 5秒超时
  '计算超时，请稍后重试'
)

// 带重试机制
const [err, data] = await toWithRetry(
  () => fetch('/api/unstable-endpoint'),
  3,     // 重试 3 次
  2000   // 间隔 2 秒
)

// 带默认值
const [err, config] = await toWithDefault(
  getUserConfig(userId),
  { theme: 'light', language: 'zh-CN', pageSize: 10 }
)
// config 保证不为 null

// 串行执行
const initSteps = [
  () => connectToDatabase(),
  () => loadConfiguration(),
  () => startServices()
]
const [err, results] = await toSequence(initSteps)
if (err) {
  console.error('初始化失败:', err.message)
  return
}

// 同步版本 - 处理 JSON 解析
const [parseErr, data] = toSync(() => JSON.parse(jsonString))
if (parseErr) {
  console.error('JSON 解析失败:', parseErr.message)
  return
}
```

---

## UI 交互 modal.ts

封装 Element Plus 的弹窗消息功能，提供统一的 UI 交互接口。

### 函数列表

| 函数名 | 说明 | 返回值 |
|--------|------|--------|
| `showMsgSuccess` | 成功消息 | `void` |
| `showMsgError` | 错误消息 | `void` |
| `showMsgWarning` | 警告消息 | `void` |
| `showMsgInfo` | 信息消息 | `void` |
| `showConfirm` | 确认对话框 | `Promise<[Error \| null, boolean]>` |
| `showConfirmDanger` | 危险确认对话框 | `Promise<[Error \| null, boolean]>` |
| `showPrompt` | 输入对话框 | `Promise<[Error \| null, string]>` |
| `showAlert` | 警告对话框 | `Promise<void>` |
| `showNotifySuccess` | 成功通知 | `void` |
| `showNotifyError` | 错误通知 | `void` |
| `showNotifyWarning` | 警告通知 | `void` |
| `showNotifyInfo` | 信息通知 | `void` |
| `showLoading` | 显示加载遮罩 | `void` |
| `hideLoading` | 隐藏加载遮罩 | `void` |

### 使用示例

```typescript
import {
  showMsgSuccess,
  showMsgError,
  showConfirm,
  showConfirmDanger,
  showLoading,
  hideLoading,
  showNotifySuccess,
  showPrompt
} from '@/utils/modal'

// 消息提示
showMsgSuccess('操作成功！')
showMsgError('操作失败，请重试')
showMsgWarning('请注意数据安全')
showMsgInfo('这是一条提示信息')

// 确认对话框
const [err] = await showConfirm('确定要提交这条记录吗？')
if (!err) {
  // 用户点击了确认
  handleSubmit()
}

// 危险确认（红色按钮）
const [err] = await showConfirmDanger('确定要删除这条记录吗？此操作不可恢复！')
if (!err) {
  handleDelete()
}

// 输入对话框
const [err, inputValue] = await showPrompt('请输入备注信息', '备注')
if (!err && inputValue) {
  console.log('用户输入:', inputValue)
}

// 通知消息
showNotifySuccess('数据保存成功')
showNotifyError('服务器连接失败')

// 加载遮罩
showLoading('数据加载中...')
try {
  await fetchData()
} finally {
  hideLoading()
}
```

---

## 页面管理 tab.ts

提供标签页导航控制功能，管理多标签页的打开、关闭和刷新操作。

### 函数列表

| 函数名 | 说明 |
|--------|------|
| `refreshPage` | 刷新当前页面 |
| `closePage` | 关闭当前页面 |
| `closeOtherPage` | 关闭其他页面 |
| `closeAllPage` | 关闭所有页面 |
| `closeLeftPage` | 关闭左侧页面 |
| `closeRightPage` | 关闭右侧页面 |
| `openPage` | 打开新页面 |
| `updatePageTitle` | 更新页面标题 |

### 使用示例

```typescript
import {
  refreshPage,
  closePage,
  openPage,
  closeOtherPage,
  updatePageTitle
} from '@/utils/tab'

// 刷新当前页面
refreshPage()

// 打开新页面
openPage('/user/detail', '用户详情', { id: '123' })

// 关闭当前页面并返回列表
closePage('/user/list')

// 关闭其他页面
closeOtherPage()

// 更新页面标题
updatePageTitle('编辑用户 - 张三')
```

---

## 布尔值处理 boolean.ts

提供布尔值的判断、转换和切换操作。

### 函数列表

| 函数名 | 说明 | 返回值 |
|--------|------|--------|
| `isTrue` | 多格式真值判断 | `boolean` |
| `isFalse` | 多格式假值判断 | `boolean` |
| `toBool` | 转换为布尔值 | `boolean` |
| `toBoolString` | 转换为布尔字符串 | `'1' \| '0'` |
| `toggleStatus` | 切换状态 | `'1' \| '0'` |

### 使用示例

```typescript
import { isTrue, isFalse, toBoolString, toggleStatus, toBool } from '@/utils/boolean'

// 多格式布尔判断
isTrue('1')        // true
isTrue('true')     // true
isTrue('yes')      // true
isTrue(1)          // true
isTrue(true)       // true

isFalse('0')       // true
isFalse('false')   // true
isFalse('no')      // true
isFalse(null)      // true
isFalse(undefined) // true

// 转换为布尔值
toBool('true')     // true
toBool('1')        // true
toBool('false')    // false
toBool('0')        // false

// 转换为布尔字符串（常用于后端交互）
toBoolString('yes')     // '1'
toBoolString(true)      // '1'
toBoolString('no')      // '0'
toBoolString(false)     // '0'

// 状态切换
toggleStatus('1')  // '0'
toggleStatus('0')  // '1'
toggleStatus('true')  // '0'
```

---

## 使用方式

### 按需导入（推荐）

```typescript
// 从具体文件导入需要的函数
import { formatDate, getCurrentDateTime } from '@/utils/date'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'
import { deepClone, get, pick } from '@/utils/object'
import { to, toValidate } from '@/utils/to'

// 使用函数
const dateStr = formatDate(new Date(), 'yyyy-MM-dd')
const isValid = isEmail('user@example.com')
const copy = deepClone(originalData)
const [err, data] = await to(fetchData())
```

### 统一入口导入

```typescript
// 从统一入口导入（需要配置 index.ts）
import {
  formatDate,
  isEmail,
  deepClone,
  to
} from '@/utils'
```

### 全量导入（不推荐）

```typescript
// 不推荐：会增加打包体积
import * as utils from '@/utils'
import * as dateUtils from '@/utils/date'
```

---

## 工具函数统计

| 分类 | 文件名 | 函数数量 | 主要功能 |
|------|--------|----------|----------|
| 字符串处理 | string.ts | 20+ | 字符串操作、格式转换、URL 处理、验证 |
| 对象操作 | object.ts | 17+ | 对象处理、数组操作、数据转换、属性访问 |
| 日期时间 | date.ts | 18+ | 日期格式化、时间计算、范围获取 |
| 数据格式化 | format.ts | 21+ | 数值、文本、隐私数据、状态格式化 |
| 函数增强 | function.ts | 18+ | 防抖节流、异步控制、函数式编程 |
| 数据验证 | validators.ts | 25+ | 类型验证、格式验证、业务验证 |
| 布尔处理 | boolean.ts | 5+ | 布尔值判断、转换、切换 |
| 加密安全 | crypto.ts | 10+ | AES 加密、哈希计算 |
| RSA 加密 | rsa.ts | 5+ | RSA 加解密、数字签名 |
| 缓存管理 | cache.ts | 20+ | 浏览器存储封装、过期管理 |
| DOM 操作 | class.ts | 7+ | CSS 类名操作 |
| 滚动控制 | scroll.ts | 6+ | 页面滚动、元素可见性 |
| 树形数据 | tree.ts | 11+ | 树结构构建、操作、遍历 |
| UI 交互 | modal.ts | 14+ | 消息提示、弹窗对话 |
| 页面管理 | tab.ts | 8+ | 标签页操作、路由管理 |
| 错误处理 | to.ts | 11+ | 异步错误处理、Promise 包装 |

---

## 最佳实践

### 1. 按需导入，减少打包体积

```typescript
// ✅ 推荐：只导入需要的函数
import { formatDate } from '@/utils/date'
import { isEmail } from '@/utils/validators'

// ❌ 不推荐：导入整个模块
import * as dateUtils from '@/utils/date'
```

### 2. 使用 TypeScript 类型提示

```typescript
// 利用完整的类型提示
import { TreeNode, buildTree } from '@/utils/tree'

interface Department extends TreeNode {
  id: number
  name: string
  parentId: number
}

const departments: Department[] = [/* ... */]
const tree = buildTree<Department>(departments)
```

### 3. 组合使用提升效率

```typescript
import { to } from '@/utils/to'
import { formatCurrency } from '@/utils/format'
import { showMsgError, showMsgSuccess } from '@/utils/modal'

const handleSubmit = async () => {
  const [err, result] = await to(submitOrder())

  if (err) {
    showMsgError('提交失败：' + err.message)
    return
  }

  const amount = formatCurrency(result.totalAmount)
  showMsgSuccess(`订单提交成功，金额：${amount}`)
}
```

### 4. 统一错误处理模式

```typescript
import { to, toValidate } from '@/utils/to'

const handleFormSubmit = async () => {
  // 1. 表单验证
  const [validErr, isValid] = await toValidate(formRef.value)
  if (validErr || !isValid) {
    return
  }

  // 2. 数据提交
  const [submitErr, result] = await to(submitData())
  if (submitErr) {
    handleError(submitErr)
    return
  }

  // 3. 成功处理
  handleSuccess(result)
}
```

### 5. 缓存数据正确使用

```typescript
import { localCache, sessionCache } from '@/utils/cache'

// 敏感数据使用会话缓存
sessionCache.setJSON('userSession', { token: 'xxx', expireAt: Date.now() + 3600000 })

// 用户偏好使用本地缓存（带过期时间）
localCache.setJSON('userPreferences', { theme: 'dark' }, 30 * 24 * 3600)

// 获取时进行空值检查
const prefs = localCache.getJSON('userPreferences') ?? defaultPreferences
```

### 6. 树形数据高效处理

```typescript
import { buildTree, findTreeNode, flattenTree } from '@/utils/tree'

// 构建树时指定字段映射
const menuTree = buildTree(menuList, {
  id: 'menuId',
  parentId: 'parentMenuId',
  children: 'subMenus'
})

// 查找节点时使用精确条件
const targetNode = findTreeNode(menuTree, node => node.menuId === targetId)

// 批量操作时先扁平化
const allNodes = flattenTree(menuTree)
const activeNodes = allNodes.filter(node => node.status === 'active')
```

---

通过这些工具函数，可以大大提升开发效率，减少重复代码，让项目代码更加优雅和可维护。每个工具都经过精心设计，支持 TypeScript 类型提示，并提供了完整的使用示例和最佳实践。
