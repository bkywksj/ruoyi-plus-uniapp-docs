# validators 验证工具

## 介绍

`validators` 是 RuoYi-Plus-UniApp 移动端框架提供的综合验证工具集，包含 40+ 个验证函数，覆盖文件验证、URL 验证、字符串验证、类型检查、数值验证、日期验证、中国特定格式验证、表单验证、网络标识验证、金融验证等多个领域。该工具集基于实际业务场景设计，提供了移动端开发中最常用的数据验证能力。

**核心特性:**

- **文件验证** - Blob 检测、文件类型验证、图片文件识别、文件大小限制
- **URL 验证** - URL 格式、HTTP 协议、外部链接、域名、路径匹配
- **字符串验证** - 邮箱、大小写字母、字母数字、用户名、子串包含
- **类型检查** - 字符串、数组、对象、空对象、JSON 格式验证
- **数值验证** - 数字、整数、正数、范围验证
- **日期验证** - 日期有效性、日期格式、日期比较
- **中国特定** - 身份证号（含校验位算法）、手机号、邮政编码
- **表单验证** - 密码强度、必填验证、长度验证、姓名格式
- **网络验证** - IPv4 地址、MAC 地址、端口号、UUID
- **金融验证** - 银行卡号、信用卡号（Luhn 算法）

**技术实现:**

- 基于正则表达式的高效验证
- 支持 TypeScript 类型推断
- 纯函数设计，无副作用
- 轻量级实现，无外部依赖

## 文件验证

### isBlob

判断数据是否为 Blob 格式（非 JSON 响应）：

```typescript
import { isBlob } from '@/utils/validators'

// 检查接口返回数据类型
const response = await fetch('/api/download')
const data = await response.blob()

if (isBlob({ type: data.type })) {
  // 处理 Blob 数据，如文件下载
  const url = URL.createObjectURL(data)
  // 下载文件...
}

// 常见用法：区分 JSON 和 Blob 响应
const handleResponse = (res: { type: string; data: any }) => {
  if (isBlob(res)) {
    // 文件下载响应
    return downloadFile(res.data)
  } else {
    // JSON 数据响应
    return parseJSON(res.data)
  }
}
```

**实现原理:**

该函数通过检查响应的 `type` 属性是否为 `application/json` 来判断。非 JSON 类型的响应通常是文件下载等二进制数据。

### isAllowedFileType

验证文件类型是否在允许列表中：

```typescript
import { isAllowedFileType } from '@/utils/validators'

// 基于文件扩展名验证
const imageFile = { name: 'photo.jpg' } as File
const allowedTypes = ['jpg', 'png', 'gif', 'webp']

console.log(isAllowedFileType(imageFile, allowedTypes)) // true

// 文档上传验证
const docFile = { name: 'report.pdf' } as File
const docTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx']
console.log(isAllowedFileType(docFile, docTypes)) // true

// 完整的文件上传验证示例
const validateUpload = (file: File) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const videoTypes = ['mp4', 'mov', 'avi', 'wmv']
  const docTypes = ['pdf', 'doc', 'docx']

  if (isAllowedFileType(file, imageTypes)) {
    return { type: 'image', valid: true }
  }
  if (isAllowedFileType(file, videoTypes)) {
    return { type: 'video', valid: true }
  }
  if (isAllowedFileType(file, docTypes)) {
    return { type: 'document', valid: true }
  }

  return { type: 'unknown', valid: false, message: '不支持的文件类型' }
}
```

**注意事项:**

- 验证基于文件扩展名，不检查实际文件内容
- 扩展名比较不区分大小写
- 建议配合 MIME 类型验证使用

### isImageFile

验证是否为图片文件：

```typescript
import { isImageFile } from '@/utils/validators'

// 检查文件是否为图片
const file = event.target.files[0]

if (isImageFile(file)) {
  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.src = e.target.result
  }
  reader.readAsDataURL(file)
} else {
  uni.showToast({ title: '请选择图片文件', icon: 'none' })
}

// 头像上传验证
const validateAvatar = (file: File) => {
  if (!isImageFile(file)) {
    return { valid: false, message: '请上传图片格式的头像' }
  }
  if (!isWithinFileSize(file, 2)) {
    return { valid: false, message: '头像大小不能超过 2MB' }
  }
  return { valid: true }
}
```

**实现原理:**

通过检查文件的 MIME 类型是否以 `image/` 开头来判断。支持 JPEG、PNG、GIF、WebP、SVG 等常见图片格式。

### isWithinFileSize

验证文件大小是否在限制范围内：

```typescript
import { isWithinFileSize } from '@/utils/validators'

// 检查文件大小（单位：MB）
const file = event.target.files[0]
const maxSize = 5 // 5MB

if (isWithinFileSize(file, maxSize)) {
  uploadFile(file)
} else {
  uni.showToast({
    title: `文件大小不能超过 ${maxSize}MB`,
    icon: 'none'
  })
}

// 不同场景的大小限制
const FILE_SIZE_LIMITS = {
  avatar: 2,      // 头像：2MB
  image: 5,       // 普通图片：5MB
  video: 50,      // 视频：50MB
  document: 10,   // 文档：10MB
}

const validateFileSize = (file: File, type: keyof typeof FILE_SIZE_LIMITS) => {
  const limit = FILE_SIZE_LIMITS[type]
  if (!isWithinFileSize(file, limit)) {
    return `${type} 文件大小不能超过 ${limit}MB`
  }
  return ''
}
```

## URL 和路径验证

### isValidURL

验证 URL 是否符合标准格式：

```typescript
import { isValidURL } from '@/utils/validators'

// 基本用法
console.log(isValidURL('https://example.com'))           // true
console.log(isValidURL('http://localhost:3000'))         // true
console.log(isValidURL('ftp://files.example.com'))       // true
console.log(isValidURL('https://api.example.com/v1/users')) // true

// 无效 URL
console.log(isValidURL('not a url'))                     // false
console.log(isValidURL(''))                              // false
console.log(isValidURL('example.com'))                   // false (缺少协议)

// 表单验证
const validateWebsite = (url: string) => {
  if (!url) return ''
  if (!isValidURL(url)) {
    return '请输入有效的网址，需包含 http:// 或 https://'
  }
  return ''
}
```

### isHttp

判断 URL 是否使用 HTTP 或 HTTPS 协议：

```typescript
import { isHttp } from '@/utils/validators'

console.log(isHttp('https://example.com'))    // true
console.log(isHttp('http://example.com'))     // true
console.log(isHttp('ftp://example.com'))      // false
console.log(isHttp('/api/users'))             // false

// 图片 URL 处理
const getImageUrl = (url: string) => {
  if (isHttp(url)) {
    return url // 已是完整 URL
  }
  // 拼接基础 URL
  return `${BASE_URL}${url}`
}
```

### isExternal

判断路径是否为外部链接：

```typescript
import { isExternal } from '@/utils/validators'

// 检测外部链接
console.log(isExternal('https://external-site.com'))  // true
console.log(isExternal('http://other-domain.com'))    // true
console.log(isExternal('mailto:user@example.com'))    // true
console.log(isExternal('tel:+8613812345678'))         // true

// 内部路径
console.log(isExternal('/pages/index'))               // false
console.log(isExternal('./components/Button'))        // false

// 导航处理
const handleNavigation = (path: string) => {
  if (isExternal(path)) {
    // 外部链接：使用浏览器打开
    // #ifdef H5
    window.open(path, '_blank')
    // #endif
    // #ifdef APP-PLUS
    plus.runtime.openURL(path)
    // #endif
  } else {
    // 内部路径：使用路由跳转
    uni.navigateTo({ url: path })
  }
}
```

### isDomain

验证域名是否有效：

```typescript
import { isDomain } from '@/utils/validators'

console.log(isDomain('example.com'))          // true
console.log(isDomain('sub.example.com'))      // true
console.log(isDomain('my-site.co.uk'))        // true

console.log(isDomain('example'))              // false (缺少顶级域名)
console.log(isDomain('http://example.com'))   // false (包含协议)
console.log(isDomain('example.'))             // false

// API 域名配置验证
const validateApiDomain = (domain: string) => {
  if (!isDomain(domain)) {
    return '请输入有效的域名，如 api.example.com'
  }
  return ''
}
```

### isPathMatch

判断路径是否匹配特定模式（支持通配符）：

```typescript
import { isPathMatch } from '@/utils/validators'

// 单级通配符 *
console.log(isPathMatch('/api/*', '/api/users'))       // true
console.log(isPathMatch('/api/*', '/api/users/1'))     // false

// 多级通配符 **
console.log(isPathMatch('/api/**', '/api/users'))      // true
console.log(isPathMatch('/api/**', '/api/users/1'))    // true
console.log(isPathMatch('/api/**', '/api/a/b/c'))      // true

// 权限路径匹配
const checkPermission = (userPaths: string[], targetPath: string) => {
  return userPaths.some(pattern => isPathMatch(pattern, targetPath))
}

const userPermissions = ['/admin/**', '/api/users/*']
console.log(checkPermission(userPermissions, '/admin/settings')) // true
console.log(checkPermission(userPermissions, '/api/users/123'))  // true
console.log(checkPermission(userPermissions, '/api/orders/1'))   // false
```

## 字符串验证

### isEmail

验证邮箱格式：

```typescript
import { isEmail } from '@/utils/validators'

// 有效邮箱
console.log(isEmail('user@example.com'))          // true
console.log(isEmail('user.name@domain.co.uk'))    // true
console.log(isEmail('user+tag@example.com'))      // true

// 无效邮箱
console.log(isEmail('invalid-email'))             // false
console.log(isEmail('user@'))                     // false
console.log(isEmail('@example.com'))              // false

// 注册表单验证
const validateRegistration = (form: { email: string; password: string }) => {
  const errors: Record<string, string> = {}

  if (!isEmail(form.email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  if (!isPassword(form.password)) {
    errors.password = '密码格式不正确'
  }

  return errors
}
```

### isLowerCase / isUpperCase

验证字符串是否全为小写/大写字母：

```typescript
import { isLowerCase, isUpperCase } from '@/utils/validators'

// 小写验证
console.log(isLowerCase('abcdef'))     // true
console.log(isLowerCase('abcDef'))     // false
console.log(isLowerCase('abc123'))     // false

// 大写验证
console.log(isUpperCase('ABCDEF'))     // true
console.log(isUpperCase('ABCdef'))     // false
console.log(isUpperCase('ABC123'))     // false

// 变量命名规范检查
const validateVariableName = (name: string) => {
  // 检查是否为 SCREAMING_SNAKE_CASE (常量命名)
  if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
    return 'constant'
  }
  // 检查是否为 camelCase
  if (/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    return 'variable'
  }
  return 'invalid'
}
```

### isAlphabets

验证字符串是否仅包含字母：

```typescript
import { isAlphabets } from '@/utils/validators'

console.log(isAlphabets('ABCdef'))     // true
console.log(isAlphabets('Hello'))      // true
console.log(isAlphabets('Hello123'))   // false
console.log(isAlphabets('Hello World')) // false (包含空格)

// 姓名验证（仅字母）
const validateEnglishName = (name: string) => {
  const parts = name.split(' ')
  return parts.every(part => isAlphabets(part))
}
```

### containsSubstring

验证字符串是否包含特定子串：

```typescript
import { containsSubstring } from '@/utils/validators'

// 区分大小写（默认）
console.log(containsSubstring('Hello World', 'World'))     // true
console.log(containsSubstring('Hello World', 'world'))     // false

// 不区分大小写
console.log(containsSubstring('Hello World', 'world', false)) // true

// 敏感词检测
const sensitiveWords = ['spam', 'ad', 'promo']

const hasSensitiveContent = (content: string) => {
  return sensitiveWords.some(word =>
    containsSubstring(content, word, false)
  )
}

console.log(hasSensitiveContent('This is a SPAM message')) // true
console.log(hasSensitiveContent('Normal content'))         // false
```

### onlyContains

验证字符串是否只包含允许的字符：

```typescript
import { onlyContains } from '@/utils/validators'

// 只允许数字
const digits = '0123456789'
console.log(onlyContains('12345', digits))     // true
console.log(onlyContains('123abc', digits))    // false

// 只允许字母和数字
const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
console.log(onlyContains('User123', alphanumeric))  // true
console.log(onlyContains('User@123', alphanumeric)) // false

// 用户名验证
const validateUsername = (username: string) => {
  const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
  if (!onlyContains(username, allowed)) {
    return '用户名只能包含字母、数字和下划线'
  }
  return ''
}
```

### isHexColor

验证十六进制颜色代码：

```typescript
import { isHexColor } from '@/utils/validators'

// 6位颜色代码
console.log(isHexColor('#FF5733'))    // true
console.log(isHexColor('#ffffff'))    // true

// 3位简写
console.log(isHexColor('#FFF'))       // true
console.log(isHexColor('#abc'))       // true

// 无效格式
console.log(isHexColor('FF5733'))     // false (缺少 #)
console.log(isHexColor('#GGGGGG'))    // false (无效字符)

// 主题颜色配置验证
const validateThemeColor = (color: string) => {
  if (!isHexColor(color)) {
    return '请输入有效的颜色代码，如 #FF5733'
  }
  return ''
}
```

### isValidFilename

验证文件名是否有效（不含系统禁止字符）：

```typescript
import { isValidFilename } from '@/utils/validators'

console.log(isValidFilename('my-document.pdf'))    // true
console.log(isValidFilename('report_2024.xlsx'))   // true

// 无效文件名（包含禁止字符）
console.log(isValidFilename('file/name.txt'))      // false
console.log(isValidFilename('file:name.txt'))      // false
console.log(isValidFilename('file*name.txt'))      // false
console.log(isValidFilename('file?name.txt'))      // false

// 文件保存验证
const validateSaveFilename = (filename: string) => {
  if (!filename.trim()) {
    return '请输入文件名'
  }
  if (!isValidFilename(filename)) {
    return '文件名不能包含 / : * ? " < > | 等特殊字符'
  }
  return ''
}
```

## 类型检查

### isString

验证是否为字符串类型：

```typescript
import { isString } from '@/utils/validators'

console.log(isString('hello'))        // true
console.log(isString(''))             // true
console.log(isString(123))            // false
console.log(isString(null))           // false
console.log(isString(undefined))      // false

// 安全的字符串处理
const safeToUpperCase = (value: any): string => {
  if (isString(value)) {
    return value.toUpperCase()
  }
  return String(value).toUpperCase()
}
```

### isArray

验证是否为数组：

```typescript
import { isArray } from '@/utils/validators'

console.log(isArray([1, 2, 3]))       // true
console.log(isArray([]))              // true
console.log(isArray('array'))         // false
console.log(isArray({ length: 0 }))   // false

// 安全的数组操作
const safeMap = <T, R>(value: any, fn: (item: T) => R): R[] => {
  if (!isArray(value)) {
    return []
  }
  return value.map(fn)
}
```

### isObject

验证是否为纯对象（不包括数组、null 等）：

```typescript
import { isObject } from '@/utils/validators'

console.log(isObject({}))             // true
console.log(isObject({ a: 1 }))       // true
console.log(isObject(null))           // false
console.log(isObject([]))             // false
console.log(isObject(new Date()))     // false

// 深度合并对象
const deepMerge = (target: any, source: any) => {
  if (!isObject(target) || !isObject(source)) {
    return source
  }

  const result = { ...target }
  Object.keys(source).forEach(key => {
    result[key] = deepMerge(target[key], source[key])
  })
  return result
}
```

### isEmptyObject

验证对象是否为空：

```typescript
import { isEmptyObject } from '@/utils/validators'

console.log(isEmptyObject({}))           // true
console.log(isEmptyObject({ a: 1 }))     // false

// 表单数据检查
const hasFormData = (formData: object) => {
  return !isEmptyObject(formData)
}

// 条件渲染
const renderContent = (data: object) => {
  if (isEmptyObject(data)) {
    return '暂无数据'
  }
  return JSON.stringify(data)
}
```

### isValidJSON

验证字符串是否为有效的 JSON 格式：

```typescript
import { isValidJSON } from '@/utils/validators'

console.log(isValidJSON('{"name":"John"}'))      // true
console.log(isValidJSON('[1, 2, 3]'))            // true
console.log(isValidJSON('null'))                 // true

console.log(isValidJSON('{name: "John"}'))       // false (无效 JSON)
console.log(isValidJSON('undefined'))            // false

// 安全解析 JSON
const safeParseJSON = <T>(str: string, defaultValue: T): T => {
  if (!isValidJSON(str)) {
    return defaultValue
  }
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

// 使用示例
const config = safeParseJSON('{"theme":"dark"}', { theme: 'light' })
```

## 数值验证

### isNumber

验证是否为有效数字（排除 NaN 和 Infinity）：

```typescript
import { isNumber } from '@/utils/validators'

console.log(isNumber(123))            // true
console.log(isNumber(12.34))          // true
console.log(isNumber(-100))           // true

console.log(isNumber('123'))          // false
console.log(isNumber(NaN))            // false
console.log(isNumber(Infinity))       // false

// 数值计算安全检查
const safeCalculate = (a: any, b: any, operation: 'add' | 'subtract') => {
  if (!isNumber(a) || !isNumber(b)) {
    return { error: '请输入有效的数字' }
  }

  const result = operation === 'add' ? a + b : a - b
  return { result }
}
```

### isInteger

验证是否为整数：

```typescript
import { isInteger } from '@/utils/validators'

console.log(isInteger(123))           // true
console.log(isInteger(-100))          // true
console.log(isInteger(0))             // true

console.log(isInteger(12.34))         // false
console.log(isInteger('123'))         // false

// 数量验证
const validateQuantity = (quantity: any) => {
  if (!isInteger(quantity)) {
    return '数量必须是整数'
  }
  if (quantity <= 0) {
    return '数量必须大于 0'
  }
  return ''
}
```

### isPositiveNumber

验证是否为正数：

```typescript
import { isPositiveNumber } from '@/utils/validators'

console.log(isPositiveNumber(123))    // true
console.log(isPositiveNumber(0.5))    // true

console.log(isPositiveNumber(0))      // false
console.log(isPositiveNumber(-1))     // false

// 价格验证
const validatePrice = (price: any) => {
  if (!isPositiveNumber(price)) {
    return '价格必须是正数'
  }
  return ''
}
```

### isInRange

验证数值是否在指定范围内：

```typescript
import { isInRange } from '@/utils/validators'

console.log(isInRange(50, 0, 100))    // true
console.log(isInRange(0, 0, 100))     // true (包含边界)
console.log(isInRange(100, 0, 100))   // true (包含边界)

console.log(isInRange(-1, 0, 100))    // false
console.log(isInRange(101, 0, 100))   // false

// 年龄验证
const validateAge = (age: number) => {
  if (!isInRange(age, 0, 150)) {
    return '请输入有效的年龄'
  }
  if (!isInRange(age, 18, 60)) {
    return '年龄必须在 18-60 岁之间'
  }
  return ''
}

// 评分验证
const validateRating = (rating: number) => {
  if (!isInRange(rating, 1, 5)) {
    return '评分必须在 1-5 之间'
  }
  return ''
}
```

## 日期验证

### isValidDate

验证日期对象是否有效：

```typescript
import { isValidDate } from '@/utils/validators'

const validDate = new Date('2024-01-15')
const invalidDate = new Date('invalid')

console.log(isValidDate(validDate))    // true
console.log(isValidDate(invalidDate))  // false

// 用户输入日期验证
const validateUserDate = (dateString: string) => {
  const date = new Date(dateString)
  if (!isValidDate(date)) {
    return '请输入有效的日期'
  }
  return ''
}
```

### isDateFormat

验证日期字符串是否符合指定格式：

```typescript
import { isDateFormat } from '@/utils/validators'

// YYYY-MM-DD 格式
console.log(isDateFormat('2024-01-15', 'YYYY-MM-DD'))  // true
console.log(isDateFormat('2024-13-01', 'YYYY-MM-DD'))  // false (月份无效)
console.log(isDateFormat('2024-02-30', 'YYYY-MM-DD'))  // false (日期无效)

// MM/DD/YYYY 格式
console.log(isDateFormat('01/15/2024', 'MM/DD/YYYY'))  // true

// DD/MM/YYYY 格式
console.log(isDateFormat('15/01/2024', 'DD/MM/YYYY'))  // true

// 出生日期验证
const validateBirthDate = (dateStr: string) => {
  if (!isDateFormat(dateStr, 'YYYY-MM-DD')) {
    return '请输入正确格式的日期 (YYYY-MM-DD)'
  }

  const birthDate = new Date(dateStr)
  const today = new Date()

  if (birthDate >= today) {
    return '出生日期不能晚于今天'
  }

  return ''
}
```

### isBeforeDate / isAfterDate

日期比较验证：

```typescript
import { isBeforeDate, isAfterDate } from '@/utils/validators'

const today = new Date()
const yesterday = new Date(Date.now() - 86400000)
const tomorrow = new Date(Date.now() + 86400000)

console.log(isBeforeDate(yesterday, today))  // true
console.log(isAfterDate(tomorrow, today))    // true

// 日期范围验证
const validateDateRange = (startDate: Date, endDate: Date) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return '请选择有效的日期'
  }

  if (!isBeforeDate(startDate, endDate)) {
    return '开始日期必须早于结束日期'
  }

  return ''
}

// 预约日期验证
const validateBookingDate = (bookingDate: Date) => {
  const now = new Date()
  const maxDate = new Date(Date.now() + 30 * 86400000) // 30 天后

  if (!isAfterDate(bookingDate, now)) {
    return '预约日期必须晚于当前时间'
  }

  if (!isBeforeDate(bookingDate, maxDate)) {
    return '预约日期不能超过 30 天'
  }

  return ''
}
```

## 中国特定验证

### isChineseIdCard

验证中国身份证号（支持 15 位和 18 位，含校验位验证）：

```typescript
import { isChineseIdCard } from '@/utils/validators'

// 18 位身份证（含校验位算法）
console.log(isChineseIdCard('110101199003077777')) // 需要校验位正确
console.log(isChineseIdCard('11010119900307777X')) // X 结尾

// 15 位身份证
console.log(isChineseIdCard('110101900307777'))    // true

// 无效身份证
console.log(isChineseIdCard('123456789012345678')) // false (校验位错误)

// 身份证信息提取
const parseIdCard = (idCard: string) => {
  if (!isChineseIdCard(idCard)) {
    return { valid: false, message: '身份证号格式不正确' }
  }

  let birthYear: string, birthMonth: string, birthDay: string

  if (idCard.length === 18) {
    birthYear = idCard.substring(6, 10)
    birthMonth = idCard.substring(10, 12)
    birthDay = idCard.substring(12, 14)
  } else {
    // 15 位身份证
    birthYear = '19' + idCard.substring(6, 8)
    birthMonth = idCard.substring(8, 10)
    birthDay = idCard.substring(10, 12)
  }

  // 计算年龄
  const birth = new Date(`${birthYear}-${birthMonth}-${birthDay}`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age--
  }

  // 判断性别
  const genderCode = idCard.length === 18
    ? parseInt(idCard.charAt(16))
    : parseInt(idCard.charAt(14))
  const gender = genderCode % 2 === 0 ? '女' : '男'

  return {
    valid: true,
    birthday: `${birthYear}-${birthMonth}-${birthDay}`,
    age,
    gender
  }
}
```

**校验位算法说明:**

18 位身份证最后一位是校验位，计算方法：
1. 将前 17 位数字分别乘以加权因子 [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
2. 将乘积求和
3. 对 11 取模得到余数
4. 根据余数查表得到校验位 ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

### isChinesePhoneNumber

验证中国手机号码：

```typescript
import { isChinesePhoneNumber } from '@/utils/validators'

// 有效手机号
console.log(isChinesePhoneNumber('13812345678'))  // true
console.log(isChinesePhoneNumber('15012345678'))  // true
console.log(isChinesePhoneNumber('18812345678'))  // true
console.log(isChinesePhoneNumber('19912345678'))  // true

// 无效手机号
console.log(isChinesePhoneNumber('12345678901'))  // false (不以 1[3-9] 开头)
console.log(isChinesePhoneNumber('1381234567'))   // false (位数不对)
console.log(isChinesePhoneNumber('138-1234-5678')) // false (含分隔符)

// 登录表单验证
const validateLoginForm = (phone: string, code: string) => {
  const errors: Record<string, string> = {}

  if (!isChinesePhoneNumber(phone)) {
    errors.phone = '请输入正确的手机号'
  }

  if (!/^\d{6}$/.test(code)) {
    errors.code = '请输入 6 位验证码'
  }

  return errors
}
```

### isPostalCode

验证中国邮政编码：

```typescript
import { isPostalCode } from '@/utils/validators'

console.log(isPostalCode('100000'))   // true (北京)
console.log(isPostalCode('518000'))   // true (深圳)
console.log(isPostalCode('200000'))   // true (上海)

console.log(isPostalCode('12345'))    // false (5 位)
console.log(isPostalCode('1234567'))  // false (7 位)
console.log(isPostalCode('012345'))   // false (首位不能为 0)

// 收货地址验证
const validateAddress = (address: {
  province: string
  city: string
  detail: string
  postalCode: string
}) => {
  const errors: Record<string, string> = {}

  if (!address.province) errors.province = '请选择省份'
  if (!address.city) errors.city = '请选择城市'
  if (!address.detail) errors.detail = '请填写详细地址'
  if (!isPostalCode(address.postalCode)) {
    errors.postalCode = '请输入正确的邮政编码'
  }

  return errors
}
```

## 表单验证

### isPassword

验证密码强度：

```typescript
import { isPassword } from '@/utils/validators'

// 默认规则：8 位以上，含大小写字母、数字、特殊字符
console.log(isPassword('Abc123!@'))   // true
console.log(isPassword('abc12345'))   // false (缺少大写和特殊字符)

// 自定义规则
const options = {
  minLength: 6,
  requireLowercase: true,
  requireUppercase: false,
  requireNumbers: true,
  requireSpecialChars: false
}

console.log(isPassword('abc123', options))  // true

// 密码强度提示
const getPasswordStrength = (password: string) => {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++

  if (score <= 2) return { level: 'weak', text: '弱', color: '#f56c6c' }
  if (score <= 4) return { level: 'medium', text: '中', color: '#e6a23c' }
  return { level: 'strong', text: '强', color: '#67c23a' }
}
```

### isRequired

验证值是否非空：

```typescript
import { isRequired } from '@/utils/validators'

// 字符串
console.log(isRequired('hello'))      // true
console.log(isRequired(''))           // false
console.log(isRequired('   '))        // false (自动 trim)

// 数组
console.log(isRequired([1, 2, 3]))    // true
console.log(isRequired([]))           // false

// 对象
console.log(isRequired({ a: 1 }))     // true
console.log(isRequired({}))           // false

// null/undefined
console.log(isRequired(null))         // false
console.log(isRequired(undefined))    // false

// 通用必填验证
const validateRequired = (fields: Record<string, any>, requiredKeys: string[]) => {
  const errors: Record<string, string> = {}

  requiredKeys.forEach(key => {
    if (!isRequired(fields[key])) {
      errors[key] = `${key} 不能为空`
    }
  })

  return errors
}
```

### hasMinLength / hasMaxLength

长度验证：

```typescript
import { hasMinLength, hasMaxLength } from '@/utils/validators'

// 最小长度
console.log(hasMinLength('hello', 3))     // true
console.log(hasMinLength('hi', 3))        // false

// 最大长度
console.log(hasMaxLength('hello', 10))    // true
console.log(hasMaxLength('hello world', 5)) // false

// 用户名验证
const validateUsername = (username: string) => {
  if (!hasMinLength(username, 3)) {
    return '用户名至少 3 个字符'
  }
  if (!hasMaxLength(username, 20)) {
    return '用户名最多 20 个字符'
  }
  return ''
}

// 评论验证
const validateComment = (comment: string) => {
  if (!hasMinLength(comment, 10)) {
    return '评论内容至少 10 个字符'
  }
  if (!hasMaxLength(comment, 500)) {
    return '评论内容最多 500 个字符'
  }
  return ''
}
```

### isName

验证姓名格式（支持中英文）：

```typescript
import { isName } from '@/utils/validators'

// 中文姓名
console.log(isName('张三'))           // true
console.log(isName('欧阳明月'))       // true

// 英文姓名
console.log(isName('John'))          // true
console.log(isName('John Smith'))    // true

// 无效姓名
console.log(isName('张三123'))       // false (含数字)
console.log(isName('John@Smith'))    // false (含特殊字符)

// 收货人验证
const validateRecipient = (name: string) => {
  if (!isName(name)) {
    return '姓名只能包含中文、英文和空格'
  }
  if (!hasMinLength(name, 2)) {
    return '姓名至少 2 个字符'
  }
  return ''
}
```

### isEqual

验证两个值是否相等：

```typescript
import { isEqual } from '@/utils/validators'

// 基本类型
console.log(isEqual('hello', 'hello'))    // true
console.log(isEqual(123, 123))            // true
console.log(isEqual(123, '123'))          // false

// 对象比较（深度比较）
console.log(isEqual({ a: 1 }, { a: 1 }))  // true
console.log(isEqual({ a: 1 }, { a: 2 }))  // false

// 确认密码验证
const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!isEqual(password, confirmPassword)) {
    return '两次输入的密码不一致'
  }
  return ''
}
```

### isOneOf

验证值是否在允许列表中：

```typescript
import { isOneOf } from '@/utils/validators'

const allowedRoles = ['admin', 'editor', 'user']
console.log(isOneOf('admin', allowedRoles))    // true
console.log(isOneOf('guest', allowedRoles))    // false

// 状态验证
const allowedStatus = ['pending', 'approved', 'rejected']
const validateStatus = (status: string) => {
  if (!isOneOf(status, allowedStatus)) {
    return `状态必须是 ${allowedStatus.join(', ')} 之一`
  }
  return ''
}

// 支付方式验证
const paymentMethods = ['wechat', 'alipay', 'bank']
const validatePayment = (method: string) => {
  if (!isOneOf(method, paymentMethods)) {
    return '不支持的支付方式'
  }
  return ''
}
```

## 网络标识验证

### isIPAddress

验证 IPv4 地址：

```typescript
import { isIPAddress } from '@/utils/validators'

// 有效 IP
console.log(isIPAddress('192.168.1.1'))      // true
console.log(isIPAddress('255.255.255.0'))    // true
console.log(isIPAddress('0.0.0.0'))          // true

// 无效 IP
console.log(isIPAddress('256.1.1.1'))        // false (超出范围)
console.log(isIPAddress('192.168.1'))        // false (格式不完整)
console.log(isIPAddress('192.168.1.1.1'))    // false (太多段)

// 服务器配置验证
const validateServerConfig = (config: { ip: string; port: number }) => {
  const errors: Record<string, string> = {}

  if (!isIPAddress(config.ip)) {
    errors.ip = '请输入有效的 IP 地址'
  }
  if (!isPort(config.port)) {
    errors.port = '请输入有效的端口号 (0-65535)'
  }

  return errors
}
```

### isMACAddress

验证 MAC 地址：

```typescript
import { isMACAddress } from '@/utils/validators'

// 冒号分隔
console.log(isMACAddress('00:1A:2B:3C:4D:5E'))   // true

// 连字符分隔
console.log(isMACAddress('00-1A-2B-3C-4D-5E'))   // true

// 无效格式
console.log(isMACAddress('001A2B3C4D5E'))        // false (无分隔符)
console.log(isMACAddress('00:1A:2B:3C:4D'))      // false (不完整)

// 设备绑定验证
const validateDeviceBinding = (mac: string) => {
  if (!isMACAddress(mac)) {
    return '请输入有效的 MAC 地址，格式如 00:1A:2B:3C:4D:5E'
  }
  return ''
}
```

### isPort

验证端口号：

```typescript
import { isPort } from '@/utils/validators'

console.log(isPort(80))       // true
console.log(isPort(443))      // true
console.log(isPort(8080))     // true
console.log(isPort(65535))    // true

console.log(isPort(-1))       // false
console.log(isPort(65536))    // false
console.log(isPort(3.14))     // false (非整数)

// 常用端口提示
const getPortDescription = (port: number) => {
  if (!isPort(port)) return '无效端口'

  const commonPorts: Record<number, string> = {
    80: 'HTTP',
    443: 'HTTPS',
    21: 'FTP',
    22: 'SSH',
    3306: 'MySQL',
    6379: 'Redis',
    27017: 'MongoDB'
  }

  return commonPorts[port] || '自定义端口'
}
```

### isUUID

验证 UUID 格式：

```typescript
import { isUUID } from '@/utils/validators'

// 有效 UUID
console.log(isUUID('550e8400-e29b-41d4-a716-446655440000'))  // true
console.log(isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8'))  // true

// 无效 UUID
console.log(isUUID('550e8400-e29b-41d4-a716'))               // false
console.log(isUUID('not-a-uuid'))                             // false

// 资源 ID 验证
const validateResourceId = (id: string) => {
  if (!isUUID(id)) {
    return '无效的资源 ID'
  }
  return ''
}
```

## 金融验证

### isBankCardNumber

验证银行卡号格式（13-19 位数字）：

```typescript
import { isBankCardNumber } from '@/utils/validators'

console.log(isBankCardNumber('6222021234567890123'))  // true (19 位)
console.log(isBankCardNumber('6222021234567890'))     // true (16 位)

console.log(isBankCardNumber('123456'))               // false (太短)
console.log(isBankCardNumber('12345678901234567890')) // false (太长)

// 银行卡格式化显示
const formatBankCard = (cardNo: string) => {
  if (!isBankCardNumber(cardNo)) return cardNo
  return cardNo.replace(/(\d{4})/g, '$1 ').trim()
}

console.log(formatBankCard('6222021234567890123'))
// 输出: 6222 0212 3456 7890 123
```

### isCreditCardNumber

验证信用卡号（使用 Luhn 算法）：

```typescript
import { isCreditCardNumber } from '@/utils/validators'

// 测试卡号（Luhn 算法验证）
console.log(isCreditCardNumber('4111111111111111'))   // true (Visa 测试卡)
console.log(isCreditCardNumber('5500000000000004'))   // true (MasterCard 测试卡)
console.log(isCreditCardNumber('378282246310005'))    // true (Amex 测试卡)

console.log(isCreditCardNumber('1234567890123456'))   // false (Luhn 校验失败)

// 识别卡类型
const getCardType = (cardNo: string): string => {
  if (!isCreditCardNumber(cardNo)) return 'invalid'

  const patterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    jcb: /^35/,
    unionpay: /^62/
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNo)) return type
  }

  return 'unknown'
}

// 支付表单验证
const validatePaymentCard = (cardNo: string) => {
  if (!isCreditCardNumber(cardNo)) {
    return '请输入有效的信用卡号'
  }

  const cardType = getCardType(cardNo)
  if (cardType === 'unknown') {
    return '不支持的卡类型'
  }

  return ''
}
```

**Luhn 算法说明:**

1. 从右向左，将奇数位（第 1、3、5...位）数字直接相加
2. 从右向左，将偶数位（第 2、4、6...位）数字乘以 2，如果结果大于 9，减去 9
3. 将所有数字相加
4. 如果总和能被 10 整除，则卡号有效

## 社交媒体验证

### isSocialMediaUserName

验证社交媒体用户名格式：

```typescript
import { isSocialMediaUserName } from '@/utils/validators'

// Twitter 用户名 (1-15 字符，字母数字下划线)
console.log(isSocialMediaUserName('example_user', 'twitter'))    // true
console.log(isSocialMediaUserName('@example_user', 'twitter'))   // true

// Instagram 用户名 (1-30 字符，字母数字下划线和点)
console.log(isSocialMediaUserName('user.name', 'instagram'))     // true

// Facebook 用户名 (5-50 字符，字母数字和点)
console.log(isSocialMediaUserName('john.doe', 'facebook'))       // true

// LinkedIn 用户名 (3-100 字符，字母数字和连字符)
console.log(isSocialMediaUserName('john-doe', 'linkedin'))       // true

// 社交账号绑定验证
const validateSocialAccount = (platform: string, username: string) => {
  const supportedPlatforms = ['twitter', 'instagram', 'facebook', 'linkedin']

  if (!supportedPlatforms.includes(platform)) {
    return '不支持的社交平台'
  }

  if (!isSocialMediaUserName(username, platform)) {
    return `请输入有效的 ${platform} 用户名`
  }

  return ''
}
```

## 综合应用示例

### 注册表单完整验证

```typescript
import {
  isEmail,
  isChinesePhoneNumber,
  isPassword,
  isName,
  isEqual,
  hasMinLength,
  hasMaxLength
} from '@/utils/validators'

interface RegisterForm {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  realName: string
  agreeTerms: boolean
}

const validateRegisterForm = (form: RegisterForm) => {
  const errors: Partial<Record<keyof RegisterForm, string>> = {}

  // 用户名验证
  if (!hasMinLength(form.username, 3)) {
    errors.username = '用户名至少 3 个字符'
  } else if (!hasMaxLength(form.username, 20)) {
    errors.username = '用户名最多 20 个字符'
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(form.username)) {
    errors.username = '用户名必须以字母开头，只能包含字母、数字和下划线'
  }

  // 邮箱验证
  if (!isEmail(form.email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  // 手机号验证
  if (!isChinesePhoneNumber(form.phone)) {
    errors.phone = '请输入正确的手机号'
  }

  // 密码验证
  if (!isPassword(form.password, {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  })) {
    errors.password = '密码至少 8 位，包含大小写字母和数字'
  }

  // 确认密码
  if (!isEqual(form.password, form.confirmPassword)) {
    errors.confirmPassword = '两次输入的密码不一致'
  }

  // 真实姓名
  if (!isName(form.realName)) {
    errors.realName = '姓名只能包含中文、英文和空格'
  }

  // 协议同意
  if (!form.agreeTerms) {
    errors.agreeTerms = '请阅读并同意用户协议'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 文件上传完整验证

```typescript
import {
  isAllowedFileType,
  isImageFile,
  isWithinFileSize
} from '@/utils/validators'

interface UploadConfig {
  type: 'avatar' | 'image' | 'document' | 'video'
  maxSize: number // MB
  allowedTypes: string[]
}

const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  avatar: {
    type: 'avatar',
    maxSize: 2,
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif']
  },
  image: {
    type: 'image',
    maxSize: 5,
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  document: {
    type: 'document',
    maxSize: 10,
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
  },
  video: {
    type: 'video',
    maxSize: 100,
    allowedTypes: ['mp4', 'mov', 'avi', 'wmv']
  }
}

const validateUpload = (file: File, configType: keyof typeof UPLOAD_CONFIGS) => {
  const config = UPLOAD_CONFIGS[configType]
  const errors: string[] = []

  // 文件类型验证
  if (!isAllowedFileType(file, config.allowedTypes)) {
    errors.push(`仅支持 ${config.allowedTypes.join(', ')} 格式`)
  }

  // 文件大小验证
  if (!isWithinFileSize(file, config.maxSize)) {
    errors.push(`文件大小不能超过 ${config.maxSize}MB`)
  }

  // 图片额外验证
  if (configType === 'avatar' || configType === 'image') {
    if (!isImageFile(file)) {
      errors.push('请上传图片文件')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 使用示例
const handleFileSelect = async (files: File[], type: 'avatar') => {
  const results = files.map(file => ({
    file,
    ...validateUpload(file, type)
  }))

  const validFiles = results.filter(r => r.valid)
  const invalidFiles = results.filter(r => !r.valid)

  if (invalidFiles.length > 0) {
    uni.showToast({
      title: invalidFiles[0].errors[0],
      icon: 'none'
    })
  }

  return validFiles.map(r => r.file)
}
```

## API 参考

### 文件验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isBlob` | 验证是否为 Blob 数据 | `(data: { type: string })` | `boolean` |
| `isAllowedFileType` | 验证文件类型是否允许 | `(file: File, allowedTypes: string[])` | `boolean` |
| `isImageFile` | 验证是否为图片文件 | `(file: File)` | `boolean` |
| `isWithinFileSize` | 验证文件大小是否在限制内 | `(file: File, maxSizeInMB: number)` | `boolean` |

### URL 和路径验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isValidURL` | 验证 URL 格式 | `(url: string)` | `boolean` |
| `isHttp` | 验证是否为 HTTP/HTTPS | `(url: string)` | `boolean` |
| `isExternal` | 验证是否为外部链接 | `(path: string)` | `boolean` |
| `isDomain` | 验证域名格式 | `(domain: string)` | `boolean` |
| `isPathMatch` | 路径模式匹配 | `(pattern: string, path: string)` | `boolean` |

### 字符串验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isEmail` | 验证邮箱格式 | `(email: string)` | `boolean` |
| `isLowerCase` | 验证是否全小写 | `(str: string)` | `boolean` |
| `isUpperCase` | 验证是否全大写 | `(str: string)` | `boolean` |
| `isAlphabets` | 验证是否仅字母 | `(str: string)` | `boolean` |
| `containsSubstring` | 验证是否包含子串 | `(str: string, substring: string, caseSensitive?: boolean)` | `boolean` |
| `onlyContains` | 验证是否只包含指定字符 | `(str: string, allowedChars: string)` | `boolean` |
| `isHexColor` | 验证十六进制颜色 | `(color: string)` | `boolean` |
| `isValidFilename` | 验证文件名有效性 | `(filename: string)` | `boolean` |

### 类型检查

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isString` | 验证是否为字符串 | `(value: any)` | `boolean` |
| `isArray` | 验证是否为数组 | `(value: any)` | `boolean` |
| `isObject` | 验证是否为对象 | `(value: any)` | `boolean` |
| `isEmptyObject` | 验证是否为空对象 | `(obj: object)` | `boolean` |
| `isValidJSON` | 验证 JSON 格式 | `(str: string)` | `boolean` |

### 数值验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isNumber` | 验证是否为数字 | `(value: any)` | `boolean` |
| `isInteger` | 验证是否为整数 | `(value: any)` | `boolean` |
| `isPositiveNumber` | 验证是否为正数 | `(value: any)` | `boolean` |
| `isInRange` | 验证数值范围 | `(value: number, min: number, max: number)` | `boolean` |

### 日期验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isValidDate` | 验证日期有效性 | `(date: Date)` | `boolean` |
| `isDateFormat` | 验证日期格式 | `(dateStr: string, format: string)` | `boolean` |
| `isBeforeDate` | 验证日期在前 | `(date: Date, beforeDate: Date)` | `boolean` |
| `isAfterDate` | 验证日期在后 | `(date: Date, afterDate: Date)` | `boolean` |

### 中国特定验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isChineseIdCard` | 验证身份证号 | `(id: string)` | `boolean` |
| `isChinesePhoneNumber` | 验证手机号 | `(phone: string)` | `boolean` |
| `isPostalCode` | 验证邮政编码 | `(code: string)` | `boolean` |

### 表单验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isPassword` | 验证密码强度 | `(password: string, options?)` | `boolean` |
| `isRequired` | 验证非空 | `(value: any)` | `boolean` |
| `hasMinLength` | 验证最小长度 | `(str: string, length: number)` | `boolean` |
| `hasMaxLength` | 验证最大长度 | `(str: string, length: number)` | `boolean` |
| `isName` | 验证姓名格式 | `(name: string)` | `boolean` |
| `isEqual` | 验证值相等 | `(value1: any, value2: any)` | `boolean` |
| `isOneOf` | 验证值在列表中 | `(value: any, allowedValues: any[])` | `boolean` |

### 网络标识验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isIPAddress` | 验证 IPv4 地址 | `(ip: string)` | `boolean` |
| `isMACAddress` | 验证 MAC 地址 | `(mac: string)` | `boolean` |
| `isPort` | 验证端口号 | `(port: number)` | `boolean` |
| `isUUID` | 验证 UUID 格式 | `(uuid: string)` | `boolean` |

### 金融验证

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `isBankCardNumber` | 验证银行卡号 | `(cardNumber: string)` | `boolean` |
| `isCreditCardNumber` | 验证信用卡号（Luhn） | `(cardNumber: string)` | `boolean` |
| `isSocialMediaUserName` | 验证社交媒体用户名 | `(userName: string, platform: string)` | `boolean` |

## 常见问题

### 1. isChineseIdCard 如何验证校验位？

采用 GB 11643-1999 标准的加权求和算法：

```typescript
// 校验位计算示例
const calculateCheckDigit = (idCard17: string): string => {
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard17.charAt(i)) * factor[i]
  }

  return checkCodes[sum % 11]
}
```

### 2. isCreditCardNumber 使用的 Luhn 算法原理？

Luhn 算法（模 10 算法）是信用卡号的国际标准校验算法：

```typescript
// Luhn 算法验证
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0
  let shouldDouble = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
```

### 3. 如何组合多个验证器？

可以创建自定义验证链：

```typescript
const createValidator = (...validators: ((value: any) => string)[]) => {
  return (value: any): string => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) return error
    }
    return ''
  }
}

// 使用
const validatePhone = createValidator(
  (v) => !v ? '手机号不能为空' : '',
  (v) => !isChinesePhoneNumber(v) ? '请输入正确的手机号' : ''
)
```

### 4. isPassword 默认规则是什么？

默认要求：
- 最少 8 个字符
- 必须包含小写字母
- 必须包含大写字母
- 必须包含数字
- 必须包含特殊字符

可通过 options 参数自定义规则。

### 5. 如何验证自定义格式？

使用正则表达式创建自定义验证器：

```typescript
const createRegexValidator = (
  pattern: RegExp,
  errorMessage: string
) => {
  return (value: string): string => {
    if (!pattern.test(value)) {
      return errorMessage
    }
    return ''
  }
}

// 创建工号验证器
const isEmployeeId = createRegexValidator(
  /^EMP\d{6}$/,
  '工号格式为 EMP + 6 位数字'
)
```

### 6. 验证器性能优化建议？

- 简单验证优先：先执行简单验证（如 isRequired），再执行复杂验证
- 避免重复验证：同一字段多次验证时缓存结果
- 正则表达式复用：将正则表达式定义为常量，避免重复创建

```typescript
// 推荐：复用正则表达式
const PHONE_REGEX = /^1[3-9]\d{9}$/
const isChinesePhoneNumber = (phone: string) => PHONE_REGEX.test(phone)
```

### 7. 如何处理异步验证？

对于需要服务端验证的场景（如用户名查重），建议使用异步验证：

```typescript
const validateUsernameAsync = async (username: string): Promise<string> => {
  // 先进行本地验证
  if (!hasMinLength(username, 3)) {
    return '用户名至少 3 个字符'
  }

  // 再进行远程验证
  try {
    const { exists } = await checkUsernameExists(username)
    if (exists) {
      return '该用户名已被使用'
    }
  } catch {
    return '验证失败，请稍后重试'
  }

  return ''
}
```

### 8. 如何处理国际化验证消息？

结合 i18n 模块返回国际化错误消息：

```typescript
import { t } from '@/locale'

const validateEmail = (email: string): string => {
  if (!isEmail(email)) {
    return t('validation.invalidEmail')
  }
  return ''
}
```
