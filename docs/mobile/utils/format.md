# 格式化工具

## 概述

移动端格式化工具集，涵盖日期格式化、字符串处理、布尔值转换、数据验证等常用功能。

**核心特性:**

- **日期格式化** - 多种日期格式、相对时间、日期范围
- **字符串处理** - 截断、转义、大小写转换、字节长度计算
- **布尔值转换** - 多格式识别（'1'/'0'、'true'/'false'、'yes'/'no'）
- **URL 处理** - 查询参数解析、路径规范化、通配符匹配
- **数据验证** - 手机号、身份证、邮箱、银行卡等验证

## 日期格式化

### 基础格式化

```typescript
import { formatDate, formatDay, formatTableDate } from '@/utils/date'

// 格式化当前时间
formatDate(new Date())                    // "2025-12-14 15:30:45"
formatDate(new Date(), 'yyyy-MM-dd')      // "2025-12-14"
formatDate(new Date(), 'yyyy年MM月dd日')   // "2025年12月14日"

// 支持时间戳和字符串
formatDate(1734159045000, 'MM/dd/yyyy')   // "12/14/2025"
formatDate('2025-12-14T15:30:45.000Z')    // "2025-12-14 15:30:45"

// 仅日期部分
formatDay(new Date())                     // "2025-12-14"

// 表格日期（自动处理空值）
formatTableDate('2025-12-14T15:30:45.000Z')  // "2025-12-14 15:30:45"
formatTableDate('')                          // ""
```

### 格式模式

| 模式 | 说明 | 示例 |
|------|------|------|
| `yyyy` | 四位年份 | 2025 |
| `MM` | 两位月份 | 01-12 |
| `dd` | 两位日期 | 01-31 |
| `HH` | 24小时制 | 00-23 |
| `mm` | 分钟 | 00-59 |
| `ss` | 秒 | 00-59 |

### 相对时间

```typescript
import { formatRelativeTime } from '@/utils/date'

formatRelativeTime(Date.now() - 10000)              // "刚刚"
formatRelativeTime(Date.now() - 5 * 60 * 1000)      // "5分钟前"
formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000) // "3小时前"
formatRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000) // "2天前"
```

**时间阈值:** 30秒内→"刚刚"，30分钟内→"X分钟前"，1天内→"X小时前"，31天内→"X天前"，365天内→"X个月前"，超过→"X年前"

### 日期范围与计算

```typescript
import {
  formatDateRange, getDateRange, getCurrentWeekRange,
  getDaysBetween, dateAdd
} from '@/utils/date'

// 日期范围格式化
formatDateRange([startDate, endDate])           // "2025-12-01~2025-12-31"
formatDateRange([startDate, endDate], ' 至 ')   // "2025-12-01 至 2025-12-31"

// 获取日期范围
getDateRange(7)           // 最近7天 [Date, Date]
getCurrentWeekRange()     // 本周范围
getCurrentMonthRange()    // 本月范围

// 日期计算
getDaysBetween(start, end)        // 相隔天数
dateAdd(baseDate, 'day', 7)       // 7天后
dateAdd(baseDate, 'month', -3)    // 3个月前
```

### 当前时间与解析

```typescript
import { getCurrentTime, getCurrentDate, parseDate, getTimeStamp } from '@/utils/date'

getCurrentTime()        // "15:30:45"
getCurrentDate()        // "2025-12-14"
getCurrentDateTime()    // "2025-12-14 15:30:45"

parseDate('2025-12-14')             // Date 对象
parseDate('invalid-date')           // null

getTimeStamp()          // 毫秒时间戳
getTimeStamp('s')       // 秒时间戳
```

## 字符串处理

### 空值与截断

```typescript
import { parseStrEmpty, isEmpty, truncate } from '@/utils/string'

// 空值处理
parseStrEmpty(null)       // ''
parseStrEmpty(undefined)  // ''
parseStrEmpty('hello')    // 'hello'

isEmpty(null)             // true
isEmpty('')               // true
isEmpty('  ')             // true (纯空白)
isEmpty('hello')          // false

// 字符串截断
truncate('这是一段很长的文本内容', 10)        // "这是一段很长的文..."
truncate('短文本', 20)                        // "短文本"
truncate('长文本内容', 5, '……')               // "长文本……"
```

### 字符串工具

```typescript
import { capitalize, byteLength, createUniqueString, sprintf } from '@/utils/string'

// 首字母大写
capitalize('hello')       // 'Hello'
capitalize('hello world') // 'Hello world'

// 字节长度（UTF-8）
byteLength('hello')       // 5
byteLength('你好')        // 6

// 唯一字符串
createUniqueString()      // "6f7g8h9i0j1k2l3m"

// 格式化
sprintf('用户 %s 购买了 %s', '张三', '商品')  // "用户 张三 购买了 商品"
```

### HTML 处理

```typescript
import { html2Text, getTextExcerpt, escapeHtml } from '@/utils/string'

html2Text('<p>这是<strong>加粗</strong>文本</p>')  // "这是加粗文本"
getTextExcerpt(longHtml, 20)                       // "这是一段很长..."
escapeHtml('<script>alert("xss")</script>')        // 转义后的安全字符串
```

### 大小写转换

```typescript
import { camelToKebab, kebabToCamel } from '@/utils/string'

camelToKebab('userName')          // 'user-name'
camelToKebab('backgroundColor')   // 'background-color'

kebabToCamel('user-name')         // 'userName'
kebabToCamel('background-color')  // 'backgroundColor'
```

## URL 处理

### 链接检测

```typescript
import { isExternal, isHttp } from '@/utils/string'

isExternal('https://example.com')  // true
isExternal('mailto:test@test.com') // true
isExternal('/page/index')          // false

isHttp('https://example.com')      // true
isHttp('//example.com')            // false
```

### 参数解析

```typescript
import { getQueryObject, objectToQuery, normalizePath, isPathMatch } from '@/utils/string'

// 解析URL参数
getQueryObject('https://example.com?name=张三&age=25')
// { name: '张三', age: '25' }

// 对象转查询字符串
objectToQuery({ name: '张三', age: 25 })  // "name=张三&age=25"

// 路径规范化
normalizePath('/api//users/')  // '/api/users'

// 路径匹配（支持通配符）
isPathMatch('/api/*', '/api/users')        // true
isPathMatch('/api/**', '/api/users/123')   // true
```

## 布尔值转换

```typescript
import { isTrue, isFalse, toBool, toBoolString, toggleStatus } from '@/utils/boolean'

// 真值判断（支持多种格式）
isTrue(true)      // true
isTrue(1)         // true
isTrue('1')       // true
isTrue('true')    // true
isTrue('yes')     // true
isTrue('on')      // true

// 假值判断
isFalse(false)    // true
isFalse(0)        // true
isFalse('0')      // true
isFalse('false')  // true
isFalse(null)     // true

// 转换
toBool('1')           // true
toBool('false')       // false
toBoolString(true)    // '1'
toBoolString(false)   // '0'

// 状态切换
toggleStatus('1')     // '0'
toggleStatus('0')     // '1'
```

## 数据验证

### 文件验证

```typescript
import { isImage, isVideo, isAudio, isDocument, getFileExtension, isFileSizeValid } from '@/utils/validators'

isImage('photo.jpg')     // true
isVideo('movie.mp4')     // true
isAudio('song.mp3')      // true
isDocument('report.pdf') // true

getFileExtension('photo.jpg')            // 'jpg'
isFileSizeValid(1024 * 1024, 5 * 1024 * 1024)  // true (1MB < 5MB)
```

### 类型检查

```typescript
import { isString, isNumber, isArray, isObject, isNullOrUndefined } from '@/utils/validators'

isString('hello')       // true
isNumber(123)           // true
isNumber(NaN)           // false
isArray([1, 2, 3])      // true
isObject({ a: 1 })      // true
isObject([1, 2])        // false
isNullOrUndefined(null) // true
```

### 数值验证

```typescript
import { isPositiveNumber, isInteger, isInRange, hasMaxDecimalPlaces } from '@/utils/validators'

isPositiveNumber(10)      // true
isPositiveNumber(-5)      // false
isInteger(10)             // true
isInteger(10.5)           // false
isInRange(5, 1, 10)       // true
hasMaxDecimalPlaces(10.12, 2)   // true
hasMaxDecimalPlaces(10.123, 2)  // false
```

### 日期验证

```typescript
import { isValidDate, isValidDateString, isDateInFuture, isWeekend } from '@/utils/validators'

isValidDate(new Date())           // true
isValidDateString('2025-12-14')   // true
isValidDateString('2025-13-14')   // false
isDateInFuture(tomorrow)          // true
isWeekend(saturday)               // true
```

### 中国特色验证

```typescript
import { isChineseIdCard, isChinesePhone, isChineseName, isPostalCode, isCarPlate } from '@/utils/validators'

// 身份证（18位，含校验位）
isChineseIdCard('110101199003076534')  // true

// 手机号
isChinesePhone('13812345678')          // true

// 中文姓名
isChineseName('张三')                  // true
isChineseName('阿凡提·艾买提')        // true

// 邮政编码
isPostalCode('100000')                 // true

// 车牌号
isCarPlate('京A12345')                 // true
isCarPlate('粤B12345D')                // true (新能源)
```

### 表单验证

```typescript
import { isEmail, isUrl, getPasswordStrength, isStrongPassword } from '@/utils/validators'

isEmail('test@example.com')      // true
isUrl('https://example.com')     // true

getPasswordStrength('123456')      // 'weak'
getPasswordStrength('Abc12345')    // 'medium'
getPasswordStrength('Abc123!@#')   // 'strong'

isStrongPassword('Abc123!@#')      // true (8位+大小写+数字+特殊字符)
```

### 网络与金融验证

```typescript
import { isIPv4, isPort, isDomain, isBankCard, isAmount } from '@/utils/validators'

// 网络
isIPv4('192.168.1.1')     // true
isPort(80)                // true
isPort(65536)             // false
isDomain('example.com')   // true

// 金融
isBankCard('6222021234567890123')  // true (Luhn算法)
isAmount('100.00')                 // true
isAmount('100.123')                // false (超过2位小数)
```

## API 参考

### 日期工具函数

| 函数 | 说明 | 类型 |
|------|------|------|
| formatDate | 格式化日期 | `(time: DateInput, pattern?: string) => string` |
| formatDay | 仅日期部分 | `(time: DateInput) => string` |
| formatTableDate | 表格日期格式化 | `(cellValue: string, pattern?: string) => string` |
| formatRelativeTime | 相对时间 | `(time: string \| number) => string` |
| formatDateRange | 日期范围格式化 | `(range: [Date, Date], separator?: string) => string` |
| getCurrentTime | 当前时间 | `(pattern?: string) => string` |
| getCurrentDate | 当前日期 | `() => string` |
| parseDate | 解析日期 | `(dateStr: string) => Date \| null` |
| getTimeStamp | 获取时间戳 | `(type?: 'ms' \| 's') => number` |
| getDateRange | 获取日期范围 | `(days: number) => [Date, Date]` |
| getDaysBetween | 日期间隔天数 | `(start: Date, end: Date) => number` |
| dateAdd | 日期加减 | `(date: Date, type: 'day' \| 'month' \| 'year', value: number) => Date` |

### 字符串工具函数

| 函数 | 说明 | 类型 |
|------|------|------|
| parseStrEmpty | 解析空字符串 | `(str: any) => string` |
| isEmpty | 判断是否为空 | `(str: any) => boolean` |
| truncate | 字符串截断 | `(str: string, maxLength: number, ellipsis?: string) => string` |
| capitalize | 首字母大写 | `(str: string) => string` |
| byteLength | 字节长度 | `(str: string) => number` |
| createUniqueString | 生成唯一字符串 | `() => string` |
| sprintf | 字符串格式化 | `(str: string, ...args: any[]) => string` |
| html2Text | HTML转纯文本 | `(html: string) => string` |
| escapeHtml | HTML转义 | `(html: string) => string` |
| isExternal | 是否外部链接 | `(path: string) => boolean` |
| getQueryObject | 解析URL参数 | `(url: string) => Record<string, string>` |
| objectToQuery | 对象转查询字符串 | `(params: Record<string, any>) => string` |
| camelToKebab | 驼峰转连字符 | `(str: string) => string` |
| kebabToCamel | 连字符转驼峰 | `(str: string) => string` |

### 布尔值工具函数

| 函数 | 说明 | 类型 |
|------|------|------|
| isTrue | 判断是否为真值 | `(value: any) => boolean` |
| isFalse | 判断是否为假值 | `(value: any) => boolean` |
| toBool | 转换为布尔值 | `(value: any) => boolean` |
| toBoolString | 转换为布尔字符串 | `(value: any) => '1' \| '0'` |
| toggleStatus | 切换状态 | `(value: any) => '1' \| '0'` |

### 验证工具函数

| 函数 | 说明 |
|------|------|
| isImage/isVideo/isAudio/isDocument | 文件类型验证 |
| isString/isNumber/isArray/isObject | 类型检查 |
| isPositiveNumber/isInteger/isInRange | 数值验证 |
| isValidDate/isDateInFuture/isWeekend | 日期验证 |
| isChineseIdCard/isChinesePhone/isChineseName | 中国特色验证 |
| isEmail/isUrl/getPasswordStrength | 表单验证 |
| isIPv4/isPort/isDomain | 网络验证 |
| isBankCard/isAmount | 金融验证 |

## 最佳实践

### 1. 日期处理

```typescript
// ✅ 使用工具函数安全处理
import { formatDate, parseDate, isValidDateString } from '@/utils/date'

const handleDateInput = (input: string) => {
  if (!isValidDateString(input)) return { error: '日期格式错误' }
  const date = parseDate(input)
  return date ? { date: formatDate(date, 'yyyy-MM-dd') } : { error: '解析失败' }
}

// ❌ 直接字符串操作，不安全
const [year, month, day] = input.split('-')
```

### 2. 字符串处理

```typescript
// ✅ 使用工具函数
import { isEmpty, truncate, escapeHtml } from '@/utils/string'

const displayContent = (content: any) => {
  if (isEmpty(content)) return '暂无内容'
  return truncate(escapeHtml(content), 200)
}

// ❌ 直接操作，可能报错
content.substring(0, 200)
```

### 3. 表单验证组合

```typescript
import { isNotEmptyString, isEmail, getPasswordStrength, isChinesePhone } from '@/utils/validators'

const validateForm = (form: { email: string; password: string; phone: string }) => {
  const errors: Record<string, string> = {}

  if (!isNotEmptyString(form.email)) errors.email = '邮箱不能为空'
  else if (!isEmail(form.email)) errors.email = '邮箱格式不正确'

  const strength = getPasswordStrength(form.password)
  if (strength === 'none' || strength === 'weak') errors.password = '密码强度不足'

  if (!isChinesePhone(form.phone)) errors.phone = '手机号格式不正确'

  return { valid: Object.keys(errors).length === 0, errors }
}
```

### 4. 布尔值统一处理

```typescript
import { isTrue, toBoolString } from '@/utils/boolean'

// API响应处理
const enabled = isTrue(response.enabled)  // 支持 '1', 'true', 'yes' 等

// 表单提交
const submitData = { isActive: toBoolString(form.isActive) }  // 转为 '1' 或 '0'
```

## 常见问题

### 1. 日期格式化时区问题

```typescript
// 处理UTC时间
const formatUTCDate = (utcStr: string) => {
  const date = new Date(utcStr)  // ISO格式自动处理时区
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

// 安全解析
const safeFormat = (dateStr: string) => {
  const date = parseDate(dateStr)
  return date ? formatDate(date) : ''
}
```

### 2. 验证函数输入预处理

```typescript
// 预处理输入
const validatePhone = (phone: any) => {
  const cleaned = String(phone || '').trim()
  return isChinesePhone(cleaned)
}
```

### 3. 字节长度截断

```typescript
// 按字节截断（适合中英文混合）
const truncateByBytes = (str: string, maxBytes: number) => {
  if (byteLength(str) <= maxBytes) return str

  let result = '', currentBytes = 0
  for (const char of str) {
    if (currentBytes + byteLength(char) + 3 > maxBytes) break
    result += char
    currentBytes += byteLength(char)
  }
  return result + '...'
}
```

### 4. URL参数处理

```typescript
// 安全构建URL
const buildSafeUrl = (baseUrl: string, params: Record<string, any>) => {
  const filtered: Record<string, any> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value
    }
  }
  const query = objectToQuery(filtered)
  return query ? `${baseUrl}?${query}` : baseUrl
}
```

## 总结

格式化工具集核心要点：

1. **日期格式化**: `formatDate`、`formatRelativeTime`、`parseDate` 处理各种日期场景
2. **字符串处理**: `truncate`、`escapeHtml`、`isEmpty` 安全处理字符串
3. **布尔值转换**: `isTrue`、`toBoolString` 统一处理多格式布尔值
4. **数据验证**: 完整的验证函数覆盖文件、类型、中国特色、金融等场景
5. **URL处理**: `getQueryObject`、`objectToQuery` 处理URL参数
