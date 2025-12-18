# validators 验证工具

## 介绍

`validators` 是综合验证工具集，提供文件、URL、字符串、类型、数字、日期、中国特定格式、表单、网络和金融等多种验证功能。该工具集覆盖了移动端开发中常见的数据验证场景。

**核心特性:**

- **文件验证** - 文件类型、大小、格式验证
- **URL 验证** - 各类 URL 和链接格式验证
- **字符串验证** - 邮箱、手机号、密码强度等
- **中国特定** - 身份证、手机号、银行卡等
- **金融验证** - 信用卡号（含 Luhn 算法）、金额格式

## 文件验证

### isBlob

判断是否为 Blob 对象：

```typescript
import { isBlob } from '@/utils/validators'

const file = new Blob(['content'], { type: 'text/plain' })
console.log(isBlob(file)) // true
console.log(isBlob('string')) // false
console.log(isBlob(null)) // false
```

### isAllowedFileType

验证文件类型是否允许：

```typescript
import { isAllowedFileType } from '@/utils/validators'

// 检查图片类型
const imageTypes = ['image/jpeg', 'image/png', 'image/gif']
console.log(isAllowedFileType('image/jpeg', imageTypes)) // true
console.log(isAllowedFileType('image/webp', imageTypes)) // false

// 检查文档类型
const docTypes = ['application/pdf', 'application/msword']
console.log(isAllowedFileType('application/pdf', docTypes)) // true

// 文件上传验证
const validateUpload = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!isAllowedFileType(file.type, allowedTypes)) {
    uni.showToast({ title: '仅支持 JPG/PNG 格式', icon: 'none' })
    return false
  }
  return true
}
```

### isValidFileSize

验证文件大小：

```typescript
import { isValidFileSize } from '@/utils/validators'

// 检查文件大小（字节）
const maxSize = 5 * 1024 * 1024 // 5MB
console.log(isValidFileSize(1024, maxSize))     // true (1KB)
console.log(isValidFileSize(10485760, maxSize)) // false (10MB)

// 上传验证
const validateFileSize = (file: File, maxMB: number) => {
  const maxBytes = maxMB * 1024 * 1024
  if (!isValidFileSize(file.size, maxBytes)) {
    uni.showToast({ title: `文件不能超过${maxMB}MB`, icon: 'none' })
    return false
  }
  return true
}
```

## URL 验证

### isUrl

验证是否为有效 URL：

```typescript
import { isUrl } from '@/utils/validators'

console.log(isUrl('https://example.com'))      // true
console.log(isUrl('http://localhost:3000'))    // true
console.log(isUrl('ftp://files.example.com'))  // true
console.log(isUrl('not a url'))                // false
console.log(isUrl(''))                         // false
```

### isHttpUrl

验证是否为 HTTP/HTTPS URL：

```typescript
import { isHttpUrl } from '@/utils/validators'

console.log(isHttpUrl('https://example.com'))  // true
console.log(isHttpUrl('http://example.com'))   // true
console.log(isHttpUrl('ftp://example.com'))    // false
console.log(isHttpUrl('/path/to/page'))        // false
```

### isAbsolutePath

验证是否为绝对路径：

```typescript
import { isAbsolutePath } from '@/utils/validators'

console.log(isAbsolutePath('/pages/index'))    // true
console.log(isAbsolutePath('./pages/index'))   // false
console.log(isAbsolutePath('pages/index'))     // false
```

## 字符串验证

### isEmail

验证邮箱格式：

```typescript
import { isEmail } from '@/utils/validators'

console.log(isEmail('user@example.com'))       // true
console.log(isEmail('user.name@domain.co.uk')) // true
console.log(isEmail('invalid-email'))          // false
console.log(isEmail('user@'))                  // false

// 表单验证
const validateEmail = (email: string) => {
  if (!isEmail(email)) {
    return '请输入有效的邮箱地址'
  }
  return ''
}
```

### isChinesePhoneNumber

验证中国手机号：

```typescript
import { isChinesePhoneNumber } from '@/utils/validators'

console.log(isChinesePhoneNumber('13812345678')) // true
console.log(isChinesePhoneNumber('15012345678')) // true
console.log(isChinesePhoneNumber('12345678901')) // false
console.log(isChinesePhoneNumber('1381234567'))  // false (位数不对)

// 手机号验证
const validatePhone = (phone: string) => {
  if (!isChinesePhoneNumber(phone)) {
    return '请输入正确的手机号'
  }
  return ''
}
```

### isPassword

验证密码强度：

```typescript
import { isPassword } from '@/utils/validators'

// 默认规则：8-20位，包含字母和数字
console.log(isPassword('abc12345'))    // true
console.log(isPassword('12345678'))    // false (缺少字母)
console.log(isPassword('abcdefgh'))    // false (缺少数字)
console.log(isPassword('abc123'))      // false (长度不足)

// 自定义规则
console.log(isPassword('Abc123!@', {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
})) // true
```

## 类型验证

### isNumber

验证是否为数字：

```typescript
import { isNumber } from '@/utils/validators'

console.log(isNumber(123))        // true
console.log(isNumber(12.34))      // true
console.log(isNumber('123'))      // false
console.log(isNumber(NaN))        // false
console.log(isNumber(Infinity))   // false
```

### isString

验证是否为字符串：

```typescript
import { isString } from '@/utils/validators'

console.log(isString('hello'))    // true
console.log(isString(''))         // true
console.log(isString(123))        // false
console.log(isString(null))       // false
```

### isArray

验证是否为数组：

```typescript
import { isArray } from '@/utils/validators'

console.log(isArray([1, 2, 3]))   // true
console.log(isArray([]))          // true
console.log(isArray('array'))     // false
console.log(isArray({ length: 0 })) // false
```

### isObject

验证是否为对象：

```typescript
import { isObject } from '@/utils/validators'

console.log(isObject({}))         // true
console.log(isObject({ a: 1 }))   // true
console.log(isObject(null))       // false
console.log(isObject([]))         // false
```

### isFunction

验证是否为函数：

```typescript
import { isFunction } from '@/utils/validators'

console.log(isFunction(() => {}))     // true
console.log(isFunction(function(){})) // true
console.log(isFunction(async () => {})) // true
console.log(isFunction('function'))   // false
```

## 中国特定验证

### isChineseIdCard

验证中国身份证号：

```typescript
import { isChineseIdCard } from '@/utils/validators'

// 18位身份证
console.log(isChineseIdCard('110101199003077777')) // 需要有效校验位
console.log(isChineseIdCard('11010119900307777X')) // X 结尾

// 验证并提取信息
const validateIdCard = (idCard: string) => {
  if (!isChineseIdCard(idCard)) {
    return { valid: false, message: '身份证号格式不正确' }
  }

  // 提取出生日期
  const birth = idCard.substring(6, 14)
  const year = birth.substring(0, 4)
  const month = birth.substring(4, 6)
  const day = birth.substring(6, 8)

  return {
    valid: true,
    birthday: `${year}-${month}-${day}`
  }
}
```

### isChineseBankCard

验证中国银行卡号：

```typescript
import { isChineseBankCard } from '@/utils/validators'

console.log(isChineseBankCard('6222021234567890123')) // true (19位)
console.log(isChineseBankCard('6222021234567890'))    // true (16位)
console.log(isChineseBankCard('123456'))              // false

// 银行卡格式化显示
const formatBankCard = (cardNo: string) => {
  if (!isChineseBankCard(cardNo)) return cardNo
  return cardNo.replace(/(\d{4})/g, '$1 ').trim()
}
```

### isChinesePostalCode

验证中国邮政编码：

```typescript
import { isChinesePostalCode } from '@/utils/validators'

console.log(isChinesePostalCode('100000')) // true
console.log(isChinesePostalCode('518000')) // true
console.log(isChinesePostalCode('12345'))  // false (5位)
console.log(isChinesePostalCode('1234567')) // false (7位)
```

### isChineseLicensePlate

验证中国车牌号：

```typescript
import { isChineseLicensePlate } from '@/utils/validators'

// 普通车牌
console.log(isChineseLicensePlate('京A12345'))  // true
console.log(isChineseLicensePlate('粤B12345'))  // true

// 新能源车牌
console.log(isChineseLicensePlate('京AD12345')) // true (纯电动)
console.log(isChineseLicensePlate('京AF12345')) // true (混合动力)
```

## 日期验证

### isValidDate

验证日期字符串格式：

```typescript
import { isValidDate } from '@/utils/validators'

console.log(isValidDate('2024-01-15'))    // true
console.log(isValidDate('2024/01/15'))    // true
console.log(isValidDate('2024-13-01'))    // false (月份超出)
console.log(isValidDate('2024-02-30'))    // false (日期不存在)
```

### isDateBefore / isDateAfter

日期比较：

```typescript
import { isDateBefore, isDateAfter } from '@/utils/validators'

const today = new Date()
const yesterday = new Date(Date.now() - 86400000)
const tomorrow = new Date(Date.now() + 86400000)

console.log(isDateBefore(yesterday, today)) // true
console.log(isDateAfter(tomorrow, today))   // true

// 验证开始/结束日期
const validateDateRange = (startDate: Date, endDate: Date) => {
  if (!isDateBefore(startDate, endDate)) {
    return '开始日期必须早于结束日期'
  }
  return ''
}
```

## 金融验证

### isCreditCardNumber

验证信用卡号（使用 Luhn 算法）：

```typescript
import { isCreditCardNumber } from '@/utils/validators'

// Luhn 算法校验
console.log(isCreditCardNumber('4111111111111111')) // true (Visa)
console.log(isCreditCardNumber('5500000000000004')) // true (MasterCard)
console.log(isCreditCardNumber('1234567890123456')) // false

// 识别卡类型
const getCardType = (cardNo: string) => {
  if (!isCreditCardNumber(cardNo)) return 'invalid'
  if (cardNo.startsWith('4')) return 'Visa'
  if (cardNo.startsWith('5')) return 'MasterCard'
  if (cardNo.startsWith('3')) return 'Amex'
  return 'unknown'
}
```

### isValidAmount

验证金额格式：

```typescript
import { isValidAmount } from '@/utils/validators'

console.log(isValidAmount('100'))      // true
console.log(isValidAmount('100.00'))   // true
console.log(isValidAmount('100.5'))    // true
console.log(isValidAmount('100.123'))  // false (超过2位小数)
console.log(isValidAmount('-100'))     // false (负数)
console.log(isValidAmount('abc'))      // false

// 支付金额验证
const validatePayAmount = (amount: string) => {
  if (!isValidAmount(amount)) {
    return '请输入正确的金额'
  }
  const num = parseFloat(amount)
  if (num <= 0) {
    return '金额必须大于0'
  }
  if (num > 100000) {
    return '单笔金额不能超过10万'
  }
  return ''
}
```

## 网络验证

### isIPAddress

验证 IP 地址：

```typescript
import { isIPAddress } from '@/utils/validators'

// IPv4
console.log(isIPAddress('192.168.1.1'))    // true
console.log(isIPAddress('255.255.255.0'))  // true
console.log(isIPAddress('256.1.1.1'))      // false

// IPv6
console.log(isIPAddress('::1'))            // true
console.log(isIPAddress('2001:db8::1'))    // true
```

### isMACAddress

验证 MAC 地址：

```typescript
import { isMACAddress } from '@/utils/validators'

console.log(isMACAddress('00:1A:2B:3C:4D:5E'))  // true
console.log(isMACAddress('00-1A-2B-3C-4D-5E'))  // true
console.log(isMACAddress('001A2B3C4D5E'))       // true
console.log(isMACAddress('invalid'))            // false
```

## 实际应用场景

### 表单验证

```typescript
import {
  isEmail,
  isChinesePhoneNumber,
  isPassword,
  isChineseIdCard
} from '@/utils/validators'

// 注册表单验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { validator: (val) => isChinesePhoneNumber(val), message: '手机号格式不正确' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: (val) => isEmail(val), message: '邮箱格式不正确' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { validator: (val) => isPassword(val), message: '密码需8-20位，包含字母和数字' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号' },
    { validator: (val) => isChineseIdCard(val), message: '身份证号格式不正确' }
  ]
}
```

### 文件上传验证

```typescript
import { isAllowedFileType, isValidFileSize, isBlob } from '@/utils/validators'

const validateUploadFile = (file: File) => {
  const errors: string[] = []

  // 类型验证
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!isAllowedFileType(file.type, allowedTypes)) {
    errors.push('仅支持 JPG、PNG、GIF 格式')
  }

  // 大小验证
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (!isValidFileSize(file.size, maxSize)) {
    errors.push('文件大小不能超过 5MB')
  }

  return errors
}
```

## API

### 文件验证

| 函数 | 说明 | 参数 |
|------|------|------|
| isBlob | 判断 Blob | `(value: any)` |
| isAllowedFileType | 验证文件类型 | `(type: string, allowed: string[])` |
| isValidFileSize | 验证文件大小 | `(size: number, max: number)` |

### 字符串验证

| 函数 | 说明 | 参数 |
|------|------|------|
| isEmail | 验证邮箱 | `(value: string)` |
| isPassword | 验证密码 | `(value: string, options?)` |
| isUrl | 验证 URL | `(value: string)` |
| isHttpUrl | 验证 HTTP URL | `(value: string)` |

### 中国特定验证

| 函数 | 说明 | 参数 |
|------|------|------|
| isChinesePhoneNumber | 验证手机号 | `(value: string)` |
| isChineseIdCard | 验证身份证 | `(value: string)` |
| isChineseBankCard | 验证银行卡 | `(value: string)` |
| isChinesePostalCode | 验证邮编 | `(value: string)` |
| isChineseLicensePlate | 验证车牌 | `(value: string)` |

### 金融验证

| 函数 | 说明 | 参数 |
|------|------|------|
| isCreditCardNumber | 验证信用卡（Luhn） | `(value: string)` |
| isValidAmount | 验证金额 | `(value: string)` |

## 常见问题

### 1. isChineseIdCard 校验规则？

采用 GB 11643-1999 标准，验证：
- 长度为 18 位
- 地区码有效
- 出生日期有效
- 校验位正确（加权求和取模）

### 2. isCreditCardNumber 使用什么算法？

使用 Luhn 算法（模 10 算法），这是信用卡号的国际标准校验算法。

### 3. 如何扩展验证规则？

可以组合现有验证函数创建自定义验证：

```typescript
const isValidUsername = (value: string) => {
  return /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/.test(value)
}
```
