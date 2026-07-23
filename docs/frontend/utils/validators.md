# 验证器 (validators.ts)

通用验证工具函数集合，提供全面的数据验证功能，包含文件、URL、字符串、类型、数值、日期、中国特定格式、表单、网络标识等各种验证功能。

## 概述

验证器工具库包含以下功能类别：
- **文件验证**：验证文件类型和数据格式
- **URL验证**：验证URL和路径格式
- **字符串验证**：验证字符串格式和内容
- **类型检查**：验证数据类型
- **数值验证**：验证数值的有效性
- **日期验证**：验证日期格式和有效性
- **中国特定验证**：验证中国特定格式
- **表单验证**：常用表单验证
- **网络标识验证**：验证网络地址和标识
- **金融验证**：验证金融相关格式
- **社交媒体验证**：验证社交媒体标识格式

## 文件验证

### isBlob

验证是否为blob格式。

```typescript
isBlob(data: { type: string }): boolean
```

**参数：**
- `data` - 包含type属性的对象

**返回值：**
- `boolean` - 是否为非JSON的blob数据

**示例：**
```typescript
// 检查接口返回的数据是否为blob
if (isBlob(res.data)) {
  // 处理blob数据，例如下载文件
  const blob = new Blob([res.data])
  FileSaver.saveAs(blob, fileName)
} else {
  // 处理JSON数据
  console.log(res.data)
}
```

### isAllowedFileType

验证文件类型是否在允许列表中。

```typescript
isAllowedFileType(file: File, allowedTypes: string[]): boolean
```

**参数：**
- `file` - 要验证的文件对象
- `allowedTypes` - 允许的文件类型扩展名数组

**返回值：**
- `boolean` - 文件类型是否在允许列表中

**示例：**
```typescript
// 图片上传验证
const file = event.target.files[0]
if (isAllowedFileType(file, ['jpg', 'png', 'gif', 'webp'])) {
  // 处理有效的图片文件
  uploadImage(file)
} else {
  alert('只允许上传 JPG、PNG、GIF、WebP 格式的图片')
}

// 文档上传验证
if (isAllowedFileType(file, ['pdf', 'doc', 'docx', 'txt'])) {
  uploadDocument(file)
}
```

### isImageFile

验证是否为图片文件。

```typescript
isImageFile(file: File): boolean
```

**参数：**
- `file` - 要验证的文件对象

**返回值：**
- `boolean` - 是否为图片文件

**示例：**
```typescript
// 文件选择时验证
input.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (isImageFile(file)) {
    // 显示图片预览
    previewImage(file)
  } else {
    alert('请选择图片文件')
  }
})
```

### isWithinFileSize

验证文件大小是否在限制范围内。

```typescript
isWithinFileSize(file: File, maxSizeInMB: number): boolean
```

**参数：**
- `file` - 要验证的文件对象
- `maxSizeInMB` - 最大允许大小，单位MB

**返回值：**
- `boolean` - 文件大小是否在限制范围内

**示例：**
```typescript
// 上传文件大小验证
const file = event.target.files[0]
if (!isWithinFileSize(file, 10)) {
  alert('文件大小不能超过 10MB')
  return
}

// 头像上传大小限制
if (isImageFile(file) && isWithinFileSize(file, 2)) {
  uploadAvatar(file)
} else {
  alert('头像文件大小不能超过 2MB')
}
```

## URL验证

### isExternal

判断路径是否为外部链接。

```typescript
isExternal(path: string): boolean
```

**参数：**
- `path` - 要验证的路径

**返回值：**
- `boolean` - 是否是外部链接

**示例：**
```typescript
// 链接处理
const handleLink = (url) => {
  if (isExternal(url)) {
    // 在新窗口打开外部链接
    window.open(url, '_blank')
  } else {
    // 内部路由跳转
    router.push(url)
  }
}

handleLink('https://example.com')  // 外部链接
handleLink('/dashboard')           // 内部链接
handleLink('mailto:test@test.com') // 外部链接
```

### isHttp

判断URL是否是HTTP或HTTPS协议。

```typescript
isHttp(url: string): boolean
```

**参数：**
- `url` - 要验证的URL

**返回值：**
- `boolean` - 是否是HTTP或HTTPS URL

**示例：**
```typescript
// URL协议验证
if (isHttp('https://api.example.com')) {
  console.log('这是HTTP/HTTPS链接')
}

// 安全检查
const url = userInput
if (isHttp(url)) {
  // 允许HTTP/HTTPS链接
  fetch(url)
} else {
  console.warn('只允许HTTP/HTTPS协议的链接')
}
```

### isValidURL

验证URL是否符合标准格式。

```typescript
isValidURL(url: string): boolean
```

**参数：**
- `url` - 要验证的URL

**返回值：**
- `boolean` - URL是否有效

**示例：**
```typescript
// 表单URL验证
const validateUrlField = (url) => {
  if (!isValidURL(url)) {
    return '请输入有效的URL地址'
  }
  return null
}

// 配置验证
const config = {
  apiUrl: 'https://api.example.com',
  webhookUrl: 'invalid-url'
}

Object.keys(config).forEach(key => {
  if (!isValidURL(config[key])) {
    console.error(`配置项 ${key} 的URL格式无效: ${config[key]}`)
  }
})
```

### isDomain

验证域名是否有效。

```typescript
isDomain(domain: string): boolean
```

**参数：**
- `domain` - 要验证的域名

**返回值：**
- `boolean` - 域名是否有效

**示例：**
```typescript
// 域名配置验证
if (isDomain('example.com')) {
  console.log('有效的域名')
}

// 邮箱域名验证
const email = 'user@example.com'
const domain = email.split('@')[1]
if (isDomain(domain)) {
  console.log('邮箱域名有效')
}
```

## 字符串验证

### isEmail

验证字符串是否是合法的电子邮件地址。

```typescript
isEmail(email: string): boolean
```

**参数：**
- `email` - 要验证的电子邮件地址

**返回值：**
- `boolean` - 是否是有效的电子邮件

**示例：**
```typescript
// 表单邮箱验证
const emailInput = document.getElementById('email')
emailInput.addEventListener('blur', (e) => {
  const email = e.target.value
  if (email && !isEmail(email)) {
    showError('请输入有效的邮箱地址')
  }
})

// 批量邮箱验证
const emailList = ['user@example.com', 'invalid-email', 'test@test.org']
const validEmails = emailList.filter(isEmail)
console.log('有效邮箱:', validEmails)
```

### isLowerCase

验证字符串是否全为小写字母。

```typescript
isLowerCase(str: string): boolean
```

**示例：**
```typescript
isLowerCase('abcdef')    // true
isLowerCase('abcDef')    // false
isLowerCase('abc123')    // false
```

### isUpperCase

验证字符串是否全为大写字母。

```typescript
isUpperCase(str: string): boolean
```

**示例：**
```typescript
isUpperCase('ABCDEF')    // true
isUpperCase('ABCdef')    // false
isUpperCase('ABC123')    // false
```

### isAlphabets

验证字符串是否全为字母（不包含数字和其他字符）。

```typescript
isAlphabets(str: string): boolean
```

**示例：**
```typescript
isAlphabets('ABCdef')    // true
isAlphabets('ABC123')    // false
isAlphabets('ABC-def')   // false
```

## 数值验证

### isNumber

验证值是否为有效数字。

```typescript
isNumber(value: any): boolean
```

**参数：**
- `value` - 要验证的值

**返回值：**
- `boolean` - 是否为有效数字

**示例：**
```typescript
// 数字输入验证
const validateNumberInput = (input) => {
  if (!isNumber(parseFloat(input))) {
    return '请输入有效的数字'
  }
  return null
}

// 类型检查
isNumber(123)        // true
isNumber('123')      // false
isNumber(123.45)     // true
isNumber(NaN)        // false
isNumber(Infinity)   // false
```

### isInteger

验证值是否为整数。

```typescript
isInteger(value: any): boolean
```

**示例：**
```typescript
// 页码验证
const validatePageNumber = (page) => {
  if (!isInteger(page) || page < 1) {
    return '页码必须是正整数'
  }
  return null
}

isInteger(123)     // true
isInteger(123.45)  // false
isInteger(-123)    // true
```

### isPositiveNumber

验证值是否为正数。

```typescript
isPositiveNumber(value: any): boolean
```

**示例：**
```typescript
// 价格验证
const validatePrice = (price) => {
  if (!isPositiveNumber(price)) {
    return '价格必须是正数'
  }
  return null
}

isPositiveNumber(123)    // true
isPositiveNumber(0)      // false
isPositiveNumber(-123)   // false
```

### isInRange

验证数值是否在指定范围内。

```typescript
isInRange(value: number, min: number, max: number): boolean
```

**参数：**
- `value` - 要验证的数值
- `min` - 最小值
- `max` - 最大值

**返回值：**
- `boolean` - 数值是否在范围内

**示例：**
```typescript
// 年龄范围验证
const validateAge = (age) => {
  if (!isInRange(age, 0, 150)) {
    return '年龄必须在0-150之间'
  }
  return null
}

// 评分验证
const validateRating = (rating) => {
  if (!isInRange(rating, 1, 5)) {
    return '评分必须在1-5星之间'
  }
  return null
}

isInRange(25, 18, 60)   // true
isInRange(15, 18, 60)   // false
isInRange(65, 18, 60)   // false
```

## 日期验证

### isValidDate

验证日期对象是否有效。

```typescript
isValidDate(date: Date): boolean
```

**参数：**
- `date` - 要验证的日期对象

**返回值：**
- `boolean` - 日期是否有效

**示例：**
```typescript
// 日期输入验证
const validateDate = (dateString) => {
  const date = new Date(dateString)
  if (!isValidDate(date)) {
    return '请输入有效的日期'
  }
  return null
}

isValidDate(new Date())           // true
isValidDate(new Date('2023-01-01')) // true
isValidDate(new Date('invalid'))  // false
```

### isDateFormat

验证字符串是否符合指定的日期格式。

```typescript
isDateFormat(dateStr: string, format: string): boolean
```

**参数：**
- `dateStr` - 要验证的日期字符串
- `format` - 日期格式（'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'）

**返回值：**
- `boolean` - 日期字符串是否符合格式

**示例：**
```typescript
// 日期格式验证
isDateFormat('2023-01-15', 'YYYY-MM-DD')     // true
isDateFormat('01/15/2023', 'MM/DD/YYYY')     // true
isDateFormat('15/01/2023', 'DD/MM/YYYY')     // true
isDateFormat('2023/01/15', 'YYYY-MM-DD')     // false

// 表单日期验证
const validateDateInput = (input, format) => {
  if (!isDateFormat(input, format)) {
    return `请输入${format}格式的日期`
  }
  return null
}
```

### isBeforeDate

验证日期是否在某个日期之前。

```typescript
isBeforeDate(date: Date, beforeDate: Date): boolean
```

**示例：**
```typescript
// 出生日期验证（必须在今天之前）
const validateBirthDate = (birthDate) => {
  if (!isBeforeDate(birthDate, new Date())) {
    return '出生日期必须在今天之前'
  }
  return null
}

// 预约时间验证
const validateAppointment = (appointmentDate, deadline) => {
  if (!isBeforeDate(appointmentDate, deadline)) {
    return '预约时间必须在截止日期之前'
  }
  return null
}
```

### isAfterDate

验证日期是否在某个日期之后。

```typescript
isAfterDate(date: Date, afterDate: Date): boolean
```

**示例：**
```typescript
// 活动结束时间验证（必须在开始时间之后）
const validateEndDate = (startDate, endDate) => {
  if (!isAfterDate(endDate, startDate)) {
    return '结束时间必须在开始时间之后'
  }
  return null
}
```

## 🇨🇳 中国特定验证

### isChineseIdCard

验证是否为有效的中国身份证号码。

```typescript
isChineseIdCard(id: string): boolean
```

**参数：**
- `id` - 要验证的身份证号码

**返回值：**
- `boolean` - 是否为有效的身份证号码

**特性：**
- 支持15位和18位身份证号码
- 包含校验位验证（18位）
- 格式和长度验证

**示例：**
```typescript
// 身份证输入验证
const validateIdCard = (idCard) => {
  if (!isChineseIdCard(idCard)) {
    return '请输入有效的身份证号码'
  }
  return null
}

// 实名认证验证
const verifyIdentity = (idCard) => {
  if (isChineseIdCard(idCard)) {
    // 发送到后端验证
    return verifyWithBackend(idCard)
  } else {
    return Promise.reject('身份证号码格式错误')
  }
}
```

### isChinesePhoneNumber

验证是否为有效的中国手机号码。

```typescript
isChinesePhoneNumber(phone: string): boolean
```

**参数：**
- `phone` - 要验证的手机号码

**返回值：**
- `boolean` - 是否为有效的手机号码

**特性：**
- 支持中国大陆11位手机号码
- 验证号段规则（1开头，第二位3-9）

**示例：**
```typescript
// 手机号验证
const validatePhone = (phone) => {
  if (!isChinesePhoneNumber(phone)) {
    return '请输入有效的手机号码'
  }
  return null
}

// 短信发送前验证
const sendSMS = (phone, message) => {
  if (isChinesePhoneNumber(phone)) {
    return smsService.send(phone, message)
  } else {
    throw new Error('无效的手机号码')
  }
}

isChinesePhoneNumber('13812345678')  // true
isChinesePhoneNumber('12812345678')  // false
isChinesePhoneNumber('1381234567')   // false
```

### isPostalCode

验证是否为有效的中国邮政编码。

```typescript
isPostalCode(code: string): boolean
```

**参数：**
- `code` - 要验证的邮政编码

**返回值：**
- `boolean` - 是否为有效的邮政编码

**示例：**
```typescript
// 地址信息验证
const validateAddress = (address) => {
  if (address.postalCode && !isPostalCode(address.postalCode)) {
    return '请输入有效的邮政编码'
  }
  return null
}

isPostalCode('100000')  // true
isPostalCode('012345')  // false (不能以0开头)
isPostalCode('12345')   // false (必须6位)
```

## 表单验证

### isPassword

验证密码强度。

```typescript
isPassword(
  password: string,
  options: {
    minLength?: number
    requireLowercase?: boolean
    requireUppercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {}
): boolean
```

**参数：**
- `password` - 要验证的密码
- `options` - 配置选项

**默认选项：**
- `minLength: 8` - 最小长度
- `requireLowercase: true` - 需要小写字母
- `requireUppercase: true` - 需要大写字母
- `requireNumbers: true` - 需要数字
- `requireSpecialChars: true` - 需要特殊字符

**示例：**
```typescript
// 强密码验证
const validatePassword = (password) => {
  if (!isPassword(password)) {
    return '密码必须包含大小写字母、数字和特殊字符，长度至少8位'
  }
  return null
}

// 自定义密码规则
const validateSimplePassword = (password) => {
  if (!isPassword(password, {
    minLength: 6,
    requireLowercase: true,
    requireUppercase: false,
    requireNumbers: true,
    requireSpecialChars: false
  })) {
    return '密码必须包含小写字母和数字，长度至少6位'
  }
  return null
}

isPassword('Aa123456!')  // true
isPassword('password')   // false
isPassword('PASSWORD')   // false
isPassword('12345678')   // false
```

### isRequired

验证值是否非空。

```typescript
isRequired(value: any): boolean
```

**参数：**
- `value` - 要验证的值

**返回值：**
- `boolean` - 值是否非空

**示例：**
```typescript
// 必填字段验证
const validateRequired = (value, fieldName) => {
  if (!isRequired(value)) {
    return `${fieldName}不能为空`
  }
  return null
}

// 不同类型的验证
isRequired('text')        // true
isRequired('')            // false
isRequired('   ')         // false
isRequired([1, 2, 3])     // true
isRequired([])            // false
isRequired({a: 1})        // true
isRequired({})            // false
isRequired(null)          // false
isRequired(undefined)     // false
```

### hasMinLength

验证字符串是否满足最小长度要求。

```typescript
hasMinLength(str: string, length: number): boolean
```

**示例：**
```typescript
// 用户名长度验证
const validateUsername = (username) => {
  if (!hasMinLength(username, 3)) {
    return '用户名至少需要3个字符'
  }
  return null
}

hasMinLength('abc', 3)   // true
hasMinLength('ab', 3)    // false
```

### hasMaxLength

验证字符串是否不超过最大长度。

```typescript
hasMaxLength(str: string, length: number): boolean
```

**示例：**
```typescript
// 评论长度验证
const validateComment = (comment) => {
  if (!hasMaxLength(comment, 500)) {
    return '评论不能超过500个字符'
  }
  return null
}

hasMaxLength('短评论', 500)    // true
hasMaxLength('很长的评论...', 10)  // false
```

### isName

验证姓名格式是否有效（不含特殊字符）。

```typescript
isName(name: string): boolean
```

**示例：**
```typescript
// 姓名验证
const validateName = (name) => {
  if (!isName(name)) {
    return '姓名只能包含字母、中文和空格'
  }
  return null
}

isName('张三')        // true
isName('John Doe')    // true
isName('李小明')      // true
isName('张三@')       // false
isName('123')         // false
```

## 网络标识验证

### isIPAddress

验证是否为有效的IPv4地址。

```typescript
isIPAddress(ip: string): boolean
```

**示例：**
```typescript
// IP地址配置验证
const validateServerIP = (ip) => {
  if (!isIPAddress(ip)) {
    return '请输入有效的IP地址'
  }
  return null
}

isIPAddress('192.168.1.1')    // true
isIPAddress('10.0.0.1')       // true
isIPAddress('256.1.1.1')      // false
isIPAddress('192.168.1')      // false
```

### isMACAddress

验证是否为有效的MAC地址。

```typescript
isMACAddress(mac: string): boolean
```

**示例：**
```typescript
// 设备MAC地址验证
const validateMAC = (mac) => {
  if (!isMACAddress(mac)) {
    return '请输入有效的MAC地址'
  }
  return null
}

isMACAddress('00:1B:44:11:3A:B7')   // true
isMACAddress('00-1B-44-11-3A-B7')   // true
isMACAddress('001B44113AB7')        // false
```

### isPort

验证是否为有效的端口号。

```typescript
isPort(port: number): boolean
```

**示例：**
```typescript
// 端口配置验证
const validatePort = (port) => {
  if (!isPort(port)) {
    return '端口号必须在0-65535之间'
  }
  return null
}

isPort(80)     // true
isPort(8080)   // true
isPort(65535)  // true
isPort(65536)  // false
isPort(-1)     // false
```

### isUUID

验证是否为UUID格式。

```typescript
isUUID(uuid: string): boolean
```

**示例：**
```typescript
// UUID验证
const validateUUID = (uuid) => {
  if (!isUUID(uuid)) {
    return '请提供有效的UUID'
  }
  return null
}

isUUID('550e8400-e29b-41d4-a716-446655440000')  // true
isUUID('invalid-uuid')                          // false
```

## 金融验证

### isBankCardNumber

验证是否为银行卡号（简单验证，不包含校验位算法）。

```typescript
isBankCardNumber(cardNumber: string): boolean
```

**示例：**
```typescript
// 银行卡号验证
const validateBankCard = (cardNumber) => {
  if (!isBankCardNumber(cardNumber)) {
    return '请输入有效的银行卡号'
  }
  return null
}

isBankCardNumber('6222020111122220000')  // true
isBankCardNumber('123456')               // false
```

### isCreditCardNumber

验证是否为有效的信用卡号（使用Luhn算法）。

```typescript
isCreditCardNumber(cardNumber: string): boolean
```

**特性：**
- 使用Luhn算法验证校验位
- 支持各种信用卡格式

**示例：**
```typescript
// 信用卡号验证
const validateCreditCard = (cardNumber) => {
  if (!isCreditCardNumber(cardNumber)) {
    return '请输入有效的信用卡号'
  }
  return null
}

isCreditCardNumber('4111111111111111')  // true (Visa测试卡号)
isCreditCardNumber('4111111111111112')  // false
```

## 社交媒体验证

### isSocialMediaUserName

验证是否为有效的社交媒体用户名。

```typescript
isSocialMediaUserName(userName: string, platform: string): boolean
```

**参数：**
- `userName` - 要验证的用户名
- `platform` - 社交媒体平台（'twitter', 'instagram', 'facebook', 'linkedin'）

**示例：**
```typescript
// 社交媒体用户名验证
const validateSocialMedia = (username, platform) => {
  if (!isSocialMediaUserName(username, platform)) {
    return `请输入有效的${platform}用户名`
  }
  return null
}

isSocialMediaUserName('@example_user', 'twitter')     // true
isSocialMediaUserName('example.user', 'instagram')    // true
isSocialMediaUserName('user123', 'facebook')          // true
isSocialMediaUserName('user-name', 'linkedin')        // true
```

## 通用验证

### isEqual

验证两个值是否相等。

```typescript
isEqual(value1: any, value2: any): boolean
```

**示例：**
```typescript
// 密码确认验证
const validatePasswordConfirm = (password, confirmPassword) => {
  if (!isEqual(password, confirmPassword)) {
    return '两次输入的密码不匹配'
  }
  return null
}

// 对象比较
isEqual({a: 1}, {a: 1})     // true
isEqual([1, 2], [1, 2])     // true
isEqual('text', 'text')     // true
```

### containsSubstring

验证字符串是否包含特定子串。

```typescript
containsSubstring(
  str: string,
  substring: string,
  caseSensitive: boolean = true
): boolean
```

**示例：**
```typescript
// 敏感词检查
const checkSensitiveWords = (content, sensitiveWords) => {
  return sensitiveWords.some(word => 
    containsSubstring(content, word, false)
  )
}

containsSubstring('Hello World', 'world', false)  // true
containsSubstring('Hello World', 'WORLD', true)   // false
```

### isOneOf

验证值是否在允许的列表中。

```typescript
isOneOf(value: any, allowedValues: any[]): boolean
```

**示例：**
```typescript
// 状态值验证
const validateStatus = (status) => {
  if (!isOneOf(status, ['draft', 'published', 'archived'])) {
    return '无效的状态值'
  }
  return null
}

// 角色权限验证
const validateRole = (role) => {
  const allowedRoles = ['admin', 'editor', 'viewer']
  if (!isOneOf(role, allowedRoles)) {
    return '无效的角色'
  }
  return null
}

isOneOf('admin', ['admin', 'user'])     // true
isOneOf('guest', ['admin', 'user'])     // false
```

## 使用技巧

### 1. 表单验证组合
组合多个验证器创建完整的表单验证：

```typescript
// 用户注册表单验证
const validateRegistration = (formData) => {
  const errors = {}
  
  // 用户名验证
  if (!isRequired(formData.username)) {
    errors.username = '用户名不能为空'
  } else if (!hasMinLength(formData.username, 3)) {
    errors.username = '用户名至少3个字符'
  } else if (!hasMaxLength(formData.username, 20)) {
    errors.username = '用户名不能超过20个字符'
  }
  
  // 邮箱验证
  if (!isRequired(formData.email)) {
    errors.email = '邮箱不能为空'
  } else if (!isEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址'
  }
  
  // 密码验证
  if (!isRequired(formData.password)) {
    errors.password = '密码不能为空'
  } else if (!isPassword(formData.password)) {
    errors.password = '密码必须包含大小写字母、数字和特殊字符，长度至少8位'
  }
  
  // 确认密码验证
  if (!isEqual(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = '两次输入的密码不匹配'
  }
  
  // 手机号验证
  if (formData.phone && !isChinesePhoneNumber(formData.phone)) {
    errors.phone = '请输入有效的手机号码'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 2. 文件上传验证
综合文件验证功能：

```typescript
// 文件上传验证器
const validateFileUpload = (file, options = {}) => {
  const {
    allowedTypes = ['jpg', 'png', 'gif'],
    maxSize = 5, // MB
    requireImage = true
  } = options
  
  const errors = []
  
  if (!file) {
    errors.push('请选择文件')
    return { isValid: false, errors }
  }
  
  // 文件类型验证
  if (!isAllowedFileType(file, allowedTypes)) {
    errors.push(`只允许上传 ${allowedTypes.join(', ')} 格式的文件`)
  }
  
  // 图片类型验证
  if (requireImage && !isImageFile(file)) {
    errors.push('请选择图片文件')
  }
  
  // 文件大小验证
  if (!isWithinFileSize(file, maxSize)) {
    errors.push(`文件大小不能超过 ${maxSize}MB`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 使用示例
const handleFileUpload = (file) => {
  const validation = validateFileUpload(file, {
    allowedTypes: ['jpg', 'png', 'webp'],
    maxSize: 2,
    requireImage: true
  })
  
  if (!validation.isValid) {
    showErrors(validation.errors)
    return
  }
  
  uploadFile(file)
}
```

### 3. 配置验证
验证应用配置的完整性：

```typescript
// 应用配置验证
const validateAppConfig = (config) => {
  const errors = []
  
  // API URL验证
  if (!config.apiUrl) {
    errors.push('API URL不能为空')
  } else if (!isValidURL(config.apiUrl)) {
    errors.push('API URL格式无效')
  } else if (!isHttp(config.apiUrl)) {
    errors.push('API URL必须使用HTTP或HTTPS协议')
  }
  
  // 数据库配置验证
  if (config.database) {
    if (!isDomain(config.database.host) && !isIPAddress(config.database.host)) {
      errors.push('数据库主机地址无效')
    }
    
    if (!isPort(config.database.port)) {
      errors.push('数据库端口号无效')
    }
    
    if (!isRequired(config.database.username)) {
      errors.push('数据库用户名不能为空')
    }
  }
  
  // 邮件配置验证
  if (config.email) {
    if (!isEmail(config.email.from)) {
      errors.push('发件人邮箱格式无效')
    }
    
    if (!isDomain(config.email.smtp.host)) {
      errors.push('SMTP服务器地址无效')
    }
    
    if (!isPort(config.email.smtp.port)) {
      errors.push('SMTP端口号无效')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### 4. API参数验证
在API调用前验证参数：

```typescript
// API参数验证中间件
const validateApiParams = (params, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field]
    const value = params[field]
    
    // 必填验证
    if (rule.required && !isRequired(value)) {
      errors[field] = `${rule.name || field}不能为空`
      return
    }
    
    // 如果字段为空且非必填，跳过其他验证
    if (!isRequired(value)) return
    
    // 类型验证
    switch (rule.type) {
      case 'email':
        if (!isEmail(value)) {
          errors[field] = `${rule.name || field}格式无效`
        }
        break
      case 'number':
        if (!isNumber(value)) {
          errors[field] = `${rule.name || field}必须是数字`
        } else if (rule.min !== undefined && !isInRange(value, rule.min, Infinity)) {
          errors[field] = `${rule.name || field}不能小于${rule.min}`
        } else if (rule.max !== undefined && !isInRange(value, -Infinity, rule.max)) {
          errors[field] = `${rule.name || field}不能大于${rule.max}`
        }
        break
      case 'string':
        if (rule.minLength && !hasMinLength(value, rule.minLength)) {
          errors[field] = `${rule.name || field}至少需要${rule.minLength}个字符`
        }
        if (rule.maxLength && !hasMaxLength(value, rule.maxLength)) {
          errors[field] = `${rule.name || field}不能超过${rule.maxLength}个字符`
        }
        break
      case 'enum':
        if (!isOneOf(value, rule.values)) {
          errors[field] = `${rule.name || field}值无效`
        }
        break
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// 使用示例
const userApiRules = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 50, name: '姓名' },
  email: { required: true, type: 'email', name: '邮箱' },
  age: { type: 'number', min: 0, max: 150, name: '年龄' },
  role: { required: true, type: 'enum', values: ['admin', 'user', 'guest'], name: '角色' }
}

const createUser = (userData) => {
  const validation = validateApiParams(userData, userApiRules)
  
  if (!validation.isValid) {
    throw new Error(`参数验证失败: ${JSON.stringify(validation.errors)}`)
  }
  
  return api.post('/users', userData)
}
```

### 5. 实时验证
实现表单字段的实时验证：

```typescript
// 实时验证类
class RealTimeValidator {
  constructor(form, rules) {
    this.form = form
    this.rules = rules
    this.errors = {}
    this.bindEvents()
  }
  
  bindEvents() {
    Object.keys(this.rules).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`)
      if (field) {
        field.addEventListener('blur', () => this.validateField(fieldName))
        field.addEventListener('input', () => this.clearFieldError(fieldName))
      }
    })
  }
  
  validateField(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`)
    const value = field.value
    const rule = this.rules[fieldName]
    
    // 清除之前的错误
    delete this.errors[fieldName]
    
    // 必填验证
    if (rule.required && !isRequired(value)) {
      this.setFieldError(fieldName, `${rule.label}不能为空`)
      return false
    }
    
    // 如果字段为空且非必填，不进行其他验证
    if (!isRequired(value)) {
      this.clearFieldError(fieldName)
      return true
    }
    
    // 自定义验证
    for (const validator of rule.validators || []) {
      const result = validator.fn(value)
      if (!result) {
        this.setFieldError(fieldName, validator.message)
        return false
      }
    }
    
    this.clearFieldError(fieldName)
    return true
  }
  
  setFieldError(fieldName, message) {
    this.errors[fieldName] = message
    const field = this.form.querySelector(`[name="${fieldName}"]`)
    const errorElement = field.parentNode.querySelector('.error-message')
    
    if (errorElement) {
      errorElement.textContent = message
      errorElement.style.display = 'block'
    }
    
    field.classList.add('error')
  }
  
  clearFieldError(fieldName) {
    delete this.errors[fieldName]
    const field = this.form.querySelector(`[name="${fieldName}"]`)
    const errorElement = field.parentNode.querySelector('.error-message')
    
    if (errorElement) {
      errorElement.style.display = 'none'
    }
    
    field.classList.remove('error')
  }
  
  validateAll() {
    let isValid = true
    
    Object.keys(this.rules).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false
      }
    })
    
    return isValid
  }
}

// 使用示例
const formRules = {
  username: {
    required: true,
    label: '用户名',
    validators: [
      { fn: (value) => hasMinLength(value, 3), message: '用户名至少3个字符' },
      { fn: (value) => hasMaxLength(value, 20), message: '用户名不能超过20个字符' }
    ]
  },
  email: {
    required: true,
    label: '邮箱',
    validators: [
      { fn: isEmail, message: '邮箱格式无效' }
    ]
  },
  phone: {
    required: false,
    label: '手机号',
    validators: [
      { fn: isChinesePhoneNumber, message: '请输入有效的手机号' }
    ]
  }
}

const validator = new RealTimeValidator(document.getElementById('userForm'), formRules)
```

## 注意事项

1. **性能考虑**：复杂的验证（如身份证校验位）有一定计算开销
2. **国际化**：中国特定验证函数不适用于其他国家/地区
3. **安全性**：前端验证仅用于用户体验，后端必须进行安全验证
4. **更新维护**：手机号段、身份证规则可能随时间变化需要更新
5. **浏览器兼容**：某些正则表达式在不同浏览器中可能表现不同
