# 加密工具 (crypto.ts)

加密工具类，提供全面的加密、解密、哈希计算等安全功能，基于 CryptoJS 库实现。

## 📖 概述

加密工具库包含以下功能类别：
- **随机生成**：生成随机字符串和AES密钥
- **Base64处理**：Base64编码与解码
- **AES加密/解密**：使用AES密钥加密和解密数据
- **高级加解密**：自动密钥生成的加密和支持JSON解析的解密
- **哈希计算**：计算数据的哈希值，用于唯一标识

## 🔧 依赖说明

本工具基于 `crypto-js` 库，使用前请确保已安装：

```bash
npm install crypto-js
npm install @types/crypto-js  # TypeScript类型定义
```

## 密码学基础

### 对称加密与非对称加密

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        加密算法分类                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────┐                                   │
│   │        对称加密 (AES)            │                                   │
│   │                                  │                                   │
│   │   明文 ──[密钥]──► 密文          │                                   │
│   │   密文 ──[密钥]──► 明文          │                                   │
│   │                                  │                                   │
│   │   特点: 加解密使用同一密钥        │                                   │
│   │   优点: 速度快、效率高           │                                   │
│   │   缺点: 密钥分发困难              │                                   │
│   └─────────────────────────────────┘                                   │
│                                                                          │
│   ┌─────────────────────────────────┐                                   │
│   │       非对称加密 (RSA)           │                                   │
│   │                                  │                                   │
│   │   明文 ──[公钥]──► 密文          │                                   │
│   │   密文 ──[私钥]──► 明文          │                                   │
│   │                                  │                                   │
│   │   特点: 公钥加密、私钥解密        │                                   │
│   │   优点: 密钥分发安全              │                                   │
│   │   缺点: 速度慢、数据长度限制      │                                   │
│   └─────────────────────────────────┘                                   │
│                                                                          │
│   ┌─────────────────────────────────┐                                   │
│   │        哈希函数 (SHA/MD5)        │                                   │
│   │                                  │                                   │
│   │   任意数据 ──► 固定长度摘要       │                                   │
│   │                                  │                                   │
│   │   特点: 单向、不可逆              │                                   │
│   │   用途: 完整性校验、密码存储      │                                   │
│   └─────────────────────────────────┘                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### AES加密算法原理

AES (Advanced Encryption Standard) 是目前最广泛使用的对称加密算法：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AES 加密过程                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────────────────────────────┐    ┌──────────┐  │
│   │   明文   │───►│           AES 算法               │───►│   密文   │  │
│   │ 16字节块 │    │                                  │    │ 16字节块 │  │
│   └──────────┘    │  ┌─────────────────────────────┐ │    └──────────┘  │
│        ▲          │  │ 1. 字节替换 (SubBytes)      │ │         │        │
│        │          │  │ 2. 行移位 (ShiftRows)       │ │         │        │
│   ┌────┴─────┐    │  │ 3. 列混淆 (MixColumns)      │ │    ┌────▼─────┐  │
│   │ PKCS7    │    │  │ 4. 轮密钥加 (AddRoundKey)   │ │    │  Base64  │  │
│   │  填充    │    │  └─────────────────────────────┘ │    │   编码   │  │
│   └──────────┘    │                                  │    └──────────┘  │
│                   │  重复 10/12/14 轮 (取决于密钥长度) │                   │
│                   └──────────────────────────────────┘                   │
│                               ▲                                          │
│                               │                                          │
│                        ┌──────┴───────┐                                  │
│                        │   AES 密钥   │                                  │
│                        │ 128/192/256位│                                  │
│                        └──────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### AES工作模式

本工具使用ECB模式，不同模式对比：

| 模式 | 全称 | 特点 | 安全性 |
|------|------|------|--------|
| ECB | Electronic Codebook | 相同明文产生相同密文 | 较低 |
| CBC | Cipher Block Chaining | 需要IV，前后块关联 | 较高 |
| CTR | Counter | 可并行处理，需要计数器 | 高 |
| GCM | Galois/Counter Mode | 提供认证，推荐使用 | 最高 |

```typescript
// ECB模式（当前实现）
const encrypted = CryptoJS.AES.encrypt(message, key, {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
})

// CBC模式（更安全，需要IV）
const iv = CryptoJS.lib.WordArray.random(16)
const encrypted = CryptoJS.AES.encrypt(message, key, {
  mode: CryptoJS.mode.CBC,
  iv: iv,
  padding: CryptoJS.pad.Pkcs7
})
```

## 🎲 随机生成

### generateRandomString

随机生成32位的字符串，包含大小写字母和数字。

```typescript
generateRandomString(): string
```

**返回值：**
- `string` - 32位随机字符串

**实现原理：**

```typescript
export const generateRandomString = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
```

**示例：**

```typescript
// 生成随机字符串
const randomStr = generateRandomString()
console.log(randomStr)  // 输出类似：'aB3dE9fH2jK7mN1pQ5rS8tU4vW6xY0zC'

// 用于生成临时密码
const tempPassword = generateRandomString()

// 用于生成会话ID
const sessionId = generateRandomString()

// 用于生成Token
const token = `${generateRandomString()}-${Date.now()}`
```

**字符集分析：**
- 大写字母：A-Z (26个)
- 小写字母：a-z (26个)
- 数字：0-9 (10个)
- 总计：62个字符
- 组合数：62^32 ≈ 2.27 × 10^57（极大的随机空间）

### generateAesKey

随机生成AES密钥，用于AES加密操作。

```typescript
generateAesKey(): CryptoJS.lib.WordArray
```

**返回值：**
- `CryptoJS.lib.WordArray` - AES密钥对象

**实现原理：**

```typescript
export const generateAesKey = (): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf8.parse(generateRandomString())
}
```

**示例：**

```typescript
// 生成AES密钥
const aesKey = generateAesKey()

// 使用密钥进行加密
const encrypted = encryptWithAes('Hello World', aesKey)

// 密钥信息
console.log('密钥长度:', aesKey.sigBytes * 8, 'bits')  // 256 bits
console.log('密钥字数:', aesKey.words.length)
```

**密钥安全说明：**
- 生成的密钥为256位（32字节 × 8）
- 基于 `generateRandomString()` 生成的随机字符串
- 每次调用都会生成不同的密钥
- 密钥应该妥善保管，不可泄露

## 📄 Base64处理

### Base64编码原理

Base64将二进制数据转换为可打印的ASCII字符：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Base64 编码过程                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   原始数据 (3字节):     01001000 01100101 01101100                       │
│                         H        e        l                              │
│                                                                          │
│   重新分组 (6位一组):   010010 000110 010101 101100                      │
│                                                                          │
│   映射到Base64字符:     S      G      V      s                           │
│                                                                          │
│   Base64字符表:                                                          │
│   A-Z: 0-25   a-z: 26-51   0-9: 52-61   +: 62   /: 63                   │
│                                                                          │
│   "Hello" → "SGVsbG8="                                                   │
│   (= 为填充字符，确保输出长度是4的倍数)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### encodeBase64

将 WordArray 数据编码为Base64字符串。

```typescript
encodeBase64(data: CryptoJS.lib.WordArray): string
```

**参数：**
- `data` - 要编码的WordArray数据

**返回值：**
- `string` - Base64编码后的字符串

**实现原理：**

```typescript
export const encodeBase64 = (data: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Base64.stringify(data)
}
```

**示例：**

```typescript
import CryptoJS from 'crypto-js'

// 将字符串转为WordArray并编码
const message = CryptoJS.enc.Utf8.parse('Hello World')
const encoded = encodeBase64(message)
console.log(encoded)  // 输出：'SGVsbG8gV29ybGQ='

// 编码中文
const chinese = CryptoJS.enc.Utf8.parse('你好世界')
const encodedChinese = encodeBase64(chinese)
console.log(encodedChinese)  // 输出：'5L2g5aW95LiW55WM'

// 编码AES密钥用于传输
const aesKey = generateAesKey()
const keyString = encodeBase64(aesKey)
console.log('密钥Base64:', keyString)
```

### decodeBase64

将Base64字符串解码为 WordArray 数据。

```typescript
decodeBase64(str: string): CryptoJS.lib.WordArray
```

**参数：**
- `str` - Base64编码的字符串

**返回值：**
- `CryptoJS.lib.WordArray` - 解码后的数据

**实现原理：**

```typescript
export const decodeBase64 = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Base64.parse(str)
}
```

**示例：**

```typescript
// 解码Base64字符串
const decoded = decodeBase64('SGVsbG8gV29ybGQ=')
const text = CryptoJS.enc.Utf8.stringify(decoded)
console.log(text)  // 输出：'Hello World'

// 解码中文
const decodedChinese = decodeBase64('5L2g5aW95LiW55WM')
const chineseText = CryptoJS.enc.Utf8.stringify(decodedChinese)
console.log(chineseText)  // 输出：'你好世界'

// 恢复AES密钥
const savedKeyString = localStorage.getItem('aes_key')
const restoredKey = decodeBase64(savedKeyString)
```

### Base64与URL安全

标准Base64包含 `+` 和 `/` 字符，在URL中需要特殊处理：

```typescript
// URL安全的Base64编码
const urlSafeEncode = (data: CryptoJS.lib.WordArray): string => {
  return encodeBase64(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// URL安全的Base64解码
const urlSafeDecode = (str: string): CryptoJS.lib.WordArray => {
  let base64 = str
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  // 补充填充字符
  while (base64.length % 4) {
    base64 += '='
  }

  return decodeBase64(base64)
}
```

## 🔐 AES加密/解密

### encryptWithAes

使用AES密钥加密数据，采用ECB模式和PKCS7填充。

```typescript
encryptWithAes(message: string, aesKey: CryptoJS.lib.WordArray): string
```

**参数：**
- `message` - 要加密的消息
- `aesKey` - AES密钥

**返回值：**
- `string` - 加密后的字符串（Base64格式）

**实现原理：**

```typescript
export const encryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray): string => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}
```

**示例：**

```typescript
// 生成密钥并加密
const key = generateAesKey()
const encrypted = encryptWithAes('敏感数据', key)
console.log(encrypted)  // 输出加密后的Base64字符串

// 加密JSON数据
const userData = JSON.stringify({ name: 'John', age: 30 })
const encryptedUser = encryptWithAes(userData, key)

// 加密多个字段
const sensitiveFields = {
  idCard: encryptWithAes('123456789012345678', key),
  phone: encryptWithAes('13812345678', key),
  address: encryptWithAes('北京市朝阳区xxx路', key)
}
```

### decryptWithAes

使用AES密钥解密数据。

```typescript
decryptWithAes(message: string, aesKey: CryptoJS.lib.WordArray): string
```

**参数：**
- `message` - 加密的消息
- `aesKey` - AES密钥

**返回值：**
- `string` - 解密后的字符串

**实现原理：**

```typescript
export const decryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray): string => {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

**示例：**

```typescript
// 解密数据
const key = generateAesKey()
const encrypted = encryptWithAes('敏感数据', key)
const decrypted = decryptWithAes(encrypted, key)
console.log(decrypted)  // 输出：'敏感数据'

// 解密JSON数据
const encryptedUser = encryptWithAes('{"name":"John","age":30}', key)
const decryptedStr = decryptWithAes(encryptedUser, key)
const user = JSON.parse(decryptedStr)
console.log(user.name)  // 输出：'John'
```

### 加密流程图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AES 加解密流程                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   加密流程:                                                              │
│   ┌──────────┐   ┌──────────────┐   ┌───────────┐   ┌──────────────┐   │
│   │  明文    │──►│ PKCS7 填充  │──►│ AES 加密  │──►│ Base64 编码  │   │
│   │ "Hello"  │   │              │   │   (ECB)   │   │              │   │
│   └──────────┘   └──────────────┘   └───────────┘   └──────────────┘   │
│                                           │                 │           │
│                                      ┌────┴────┐            ▼           │
│                                      │ AES Key │      "U2FsdGVk..."    │
│                                      └─────────┘                        │
│                                                                          │
│   解密流程:                                                              │
│   ┌──────────────┐   ┌───────────┐   ┌──────────────┐   ┌──────────┐   │
│   │ Base64 解码  │──►│ AES 解密  │──►│ PKCS7 去除  │──►│  明文    │   │
│   │              │   │   (ECB)   │   │              │   │ "Hello"  │   │
│   └──────────────┘   └───────────┘   └──────────────┘   └──────────┘   │
│         │                 │                                             │
│         │            ┌────┴────┐                                        │
│   "U2FsdGVk..."      │ AES Key │                                        │
│                      └─────────┘                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## ⚡ 高级加解密

### encryptWithAutoKey

一步完成加密过程：自动生成密钥、加密数据并返回结果。

```typescript
encryptWithAutoKey(data: string | object): {
  encryptedData: string
  key: CryptoJS.lib.WordArray
}
```

**参数：**
- `data` - 要加密的数据（字符串或对象）

**返回值：**
- `object` - 包含加密数据和密钥的对象
    - `encryptedData` - 加密后的数据
    - `key` - 使用的AES密钥

**实现原理：**

```typescript
export const encryptWithAutoKey = (data: string | object): {
  encryptedData: string
  key: CryptoJS.lib.WordArray
} => {
  const key = generateAesKey()
  const message = typeof data === 'object' ? JSON.stringify(data) : data
  const encryptedData = encryptWithAes(message, key)

  return {
    encryptedData,
    key
  }
}
```

**示例：**

```typescript
// 加密字符串
const result1 = encryptWithAutoKey('Hello World')
console.log(result1.encryptedData)  // 加密后的数据
console.log(result1.key)           // 生成的密钥

// 加密对象
const userInfo = {
  name: 'John',
  age: 30,
  email: 'john@example.com'
}
const result2 = encryptWithAutoKey(userInfo)
// 对象会自动转为JSON字符串后加密

// 存储加密数据和密钥
localStorage.setItem('encrypted_data', result2.encryptedData)
localStorage.setItem('encryption_key', encodeBase64(result2.key))

// 加密复杂嵌套对象
const complexData = {
  user: { id: 1, name: 'John' },
  orders: [
    { id: 101, amount: 100 },
    { id: 102, amount: 200 }
  ],
  settings: {
    theme: 'dark',
    notifications: true
  }
}
const encryptedComplex = encryptWithAutoKey(complexData)
```

### decryptWithParsing

使用提供的密钥解密数据，支持JSON解析。

```typescript
decryptWithParsing(
  encryptedData: string,
  key: CryptoJS.lib.WordArray,
  parseJson?: boolean
): string | object
```

**参数：**
- `encryptedData` - 加密的数据
- `key` - 解密密钥
- `parseJson` - 是否将结果解析为JSON对象，默认为false

**返回值：**
- `string | object` - 解密后的数据

**实现原理：**

```typescript
export const decryptWithParsing = (
  encryptedData: string,
  key: CryptoJS.lib.WordArray,
  parseJson: boolean = false
): string | object => {
  const decryptedStr = decryptWithAes(encryptedData, key)

  if (parseJson) {
    try {
      return JSON.parse(decryptedStr)
    } catch (e) {
      console.error('Failed to parse decrypted data as JSON:', e)
      return decryptedStr
    }
  }

  return decryptedStr
}
```

**示例：**

```typescript
// 解密字符串
const { encryptedData, key } = encryptWithAutoKey('Hello World')
const decrypted1 = decryptWithParsing(encryptedData, key)
console.log(decrypted1)  // 输出：'Hello World'

// 解密并解析为JSON
const userInfo = { name: 'John', age: 30 }
const result = encryptWithAutoKey(userInfo)
const decrypted2 = decryptWithParsing(result.encryptedData, result.key, true)
console.log(decrypted2)  // 输出：{ name: 'John', age: 30 }

// 类型安全的解密
interface User {
  name: string
  age: number
}

const decryptedUser = decryptWithParsing(result.encryptedData, result.key, true) as User
console.log(decryptedUser.name)  // 类型安全访问
```

## 🔍 哈希计算

### 哈希算法对比

| 算法 | 输出长度 | 安全性 | 速度 | 推荐用途 |
|------|---------|--------|------|---------|
| MD5 | 128位 | 不安全 | 最快 | 文件校验（非安全场景） |
| SHA-1 | 160位 | 不安全 | 快 | 已废弃 |
| SHA-256 | 256位 | 安全 | 中等 | 数据完整性、密码存储 |
| SHA-512 | 512位 | 最安全 | 较慢 | 高安全需求场景 |

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        哈希函数特性                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. 确定性: 相同输入总是产生相同输出                                     │
│      "Hello" → "185f8db32271..."                                        │
│      "Hello" → "185f8db32271..." (总是相同)                             │
│                                                                          │
│   2. 单向性: 无法从哈希值还原原始数据                                     │
│      "185f8db32271..." → ??? (不可能)                                   │
│                                                                          │
│   3. 雪崩效应: 输入微小变化导致输出巨大变化                              │
│      "Hello" → "185f8db32271..."                                        │
│      "hello" → "2cf24dba5fb0..." (完全不同)                             │
│                                                                          │
│   4. 抗碰撞: 极难找到两个不同输入产生相同输出                             │
│      P(碰撞) ≈ 1 / 2^128 (SHA-256)                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### computeSha256Hash

计算字符串的SHA-256哈希值。

```typescript
computeSha256Hash(data: string): string
```

**参数：**
- `data` - 要计算哈希的数据

**返回值：**
- `string` - 哈希值（十六进制表示，64个字符）

**实现原理：**

```typescript
export const computeSha256Hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
}
```

**示例：**

```typescript
// 计算SHA-256哈希
const hash = computeSha256Hash('Hello World')
console.log(hash)
// 输出：'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// 哈希值长度验证
console.log(hash.length)  // 64 (256位 / 4 = 64个十六进制字符)

// 密码哈希存储（建议加盐）
const salt = generateRandomString()
const passwordHash = computeSha256Hash(salt + 'user_password')
// 存储: { salt, passwordHash }

// 验证密码
const verifyPassword = (inputPassword: string, savedSalt: string, savedHash: string): boolean => {
  return computeSha256Hash(savedSalt + inputPassword) === savedHash
}
```

### computeMd5Hash

计算字符串的MD5哈希值。

```typescript
computeMd5Hash(data: string): string
```

**参数：**
- `data` - 要计算哈希的数据

**返回值：**
- `string` - 哈希值（十六进制表示，32个字符）

**实现原理：**

```typescript
export const computeMd5Hash = (data: string): string => {
  return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex)
}
```

**示例：**

```typescript
// 计算MD5哈希
const md5Hash = computeMd5Hash('Hello World')
console.log(md5Hash)  // 输出：'b10a8db164e0754105b7a99be72e3fe5'

// 哈希值长度验证
console.log(md5Hash.length)  // 32 (128位 / 4 = 32个十六进制字符)

// 用于文件完整性校验
const fileContent = 'file content here'
const checksum = computeMd5Hash(fileContent)

// 验证下载文件完整性
const verifyDownload = (content: string, expectedChecksum: string): boolean => {
  return computeMd5Hash(content) === expectedChecksum
}
```

### generateImageHash

生成图片的唯一哈希标识，基于图片的Base64数据。

```typescript
generateImageHash(base64Data: string): string
```

**参数：**
- `base64Data` - 图片的Base64编码数据

**返回值：**
- `string` - 图片的唯一哈希值（SHA-256）

**实现原理：**

```typescript
export const generateImageHash = (base64Data: string): string => {
  return computeSha256Hash(base64Data)
}
```

**示例：**

```typescript
// 生成图片哈希
const imageBase64 = 'data:image/png;base64,iVBORw0KGgo...'
const imageHash = generateImageHash(imageBase64)
console.log(imageHash)

// 用于图片去重
const uploadedImages = new Set<string>()

const checkDuplicate = (imageData: string): boolean => {
  const hash = generateImageHash(imageData)
  if (uploadedImages.has(hash)) {
    console.log('图片已存在')
    return true
  }
  uploadedImages.add(hash)
  console.log('新图片')
  return false
}

// 从canvas获取图片数据并计算哈希
const canvas = document.querySelector('canvas')
const imageData = canvas.toDataURL('image/png')
const canvasHash = generateImageHash(imageData)
```

### generateFileHash

异步生成文件的哈希标识，支持多种文件类型。

```typescript
generateFileHash(file: Blob | File | ArrayBuffer): Promise<string>
```

**参数：**
- `file` - 文件或数据流（Blob、File或ArrayBuffer）

**返回值：**
- `Promise<string>` - 文件的哈希值（SHA-256）

**实现原理：**

```typescript
export const generateFileHash = async (file: Blob | File | ArrayBuffer): Promise<string> => {
  // 将文件转换为ArrayBuffer
  let arrayBuffer: ArrayBuffer

  if (file instanceof Blob || file instanceof File) {
    arrayBuffer = await file.arrayBuffer()
  } else {
    arrayBuffer = file
  }

  // 将ArrayBuffer转换为字符串
  const uint8Array = new Uint8Array(arrayBuffer)
  let binaryString = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i])
  }

  // 计算哈希值
  return computeSha256Hash(binaryString)
}
```

**示例：**

```typescript
// 处理用户上传的文件
const handleFileUpload = async (file: File) => {
  try {
    const fileHash = await generateFileHash(file)
    console.log('文件哈希:', fileHash)

    // 检查文件是否已存在
    const existingFiles = await checkFileExists(fileHash)
    if (existingFiles) {
      console.log('文件已存在，跳过上传')
      return
    }

    // 上传新文件
    await uploadFile(file, fileHash)
  } catch (error) {
    console.error('生成文件哈希失败:', error)
  }
}

// 处理ArrayBuffer
const buffer = new ArrayBuffer(1024)
const bufferHash = await generateFileHash(buffer)

// 批量处理文件
const processFiles = async (files: FileList) => {
  const hashPromises = Array.from(files).map(file => generateFileHash(file))
  const hashes = await Promise.all(hashPromises)
  console.log('所有文件哈希:', hashes)
}

// 结合秒传功能
const quickUpload = async (file: File) => {
  const hash = await generateFileHash(file)

  // 先检查服务器是否已有此文件
  const response = await fetch(`/api/files/check/${hash}`)
  const { exists, fileUrl } = await response.json()

  if (exists) {
    // 秒传：直接返回已有文件的URL
    return { success: true, url: fileUrl, quickUpload: true }
  }

  // 正常上传
  const formData = new FormData()
  formData.append('file', file)
  formData.append('hash', hash)
  return await uploadFile(formData)
}
```

## 💡 实际应用场景

### 1. 用户敏感信息加密

```vue
<template>
  <div class="sensitive-form">
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item label="银行卡号" prop="bankCard">
        <el-input v-model="formData.bankCard" placeholder="请输入银行卡号" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { encryptWithAutoKey, encodeBase64 } from '@/utils/crypto'

const formData = reactive({
  idCard: '',
  bankCard: '',
  phone: ''
})

const handleSubmit = async () => {
  // 加密敏感信息
  const sensitiveInfo = {
    idCard: formData.idCard,
    bankCard: formData.bankCard,
    phone: formData.phone
  }

  const { encryptedData, key } = encryptWithAutoKey(sensitiveInfo)

  // 发送加密数据到服务器
  const response = await fetch('/api/user/sensitive-info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Encryption-Key': encodeBase64(key)  // 密钥通过请求头传递
    },
    body: JSON.stringify({
      data: encryptedData
    })
  })

  if (response.ok) {
    console.log('敏感信息已安全提交')
  }
}
</script>
```

### 2. API接口参数加密

```typescript
import { encryptWithAutoKey, encodeBase64 } from '@/utils/crypto'

// 创建加密请求拦截器
const createEncryptedRequest = async <T>(
  url: string,
  params: T,
  options: RequestInit = {}
): Promise<Response> => {
  // 加密请求参数
  const { encryptedData, key } = encryptWithAutoKey(params)

  return fetch(url, {
    ...options,
    method: options.method || 'POST',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-Encrypted': 'true',
      'X-Encryption-Key': encodeBase64(key)
    },
    body: JSON.stringify({
      data: encryptedData,
      timestamp: Date.now()
    })
  })
}

// 使用示例
const apiParams = {
  userId: 12345,
  action: 'transfer',
  amount: 1000,
  targetAccount: '6222020111122220000'
}

const response = await createEncryptedRequest('/api/secure-operation', apiParams)
```

### 3. 文件上传去重

```vue
<template>
  <div class="file-uploader">
    <el-upload
      :auto-upload="false"
      :on-change="handleFileChange"
      :file-list="fileList"
      multiple
    >
      <el-button type="primary">选择文件</el-button>
    </el-upload>

    <div class="upload-list">
      <div v-for="item in uploadStatus" :key="item.hash" class="upload-item">
        <span>{{ item.name }}</span>
        <el-tag :type="item.isDuplicate ? 'warning' : 'success'">
          {{ item.isDuplicate ? '重复文件' : '待上传' }}
        </el-tag>
      </div>
    </div>

    <el-button type="success" @click="startUpload" :loading="uploading">
      开始上传
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { generateFileHash } from '@/utils/crypto'

interface UploadItem {
  file: File
  name: string
  hash: string
  isDuplicate: boolean
}

const fileList = ref([])
const uploadStatus = ref<UploadItem[]>([])
const uploading = ref(false)
const uploadedHashes = new Set<string>()

const handleFileChange = async (file: any) => {
  const hash = await generateFileHash(file.raw)
  const isDuplicate = uploadedHashes.has(hash)

  uploadStatus.value.push({
    file: file.raw,
    name: file.name,
    hash,
    isDuplicate
  })

  if (!isDuplicate) {
    uploadedHashes.add(hash)
  }
}

const startUpload = async () => {
  uploading.value = true

  const uniqueFiles = uploadStatus.value.filter(item => !item.isDuplicate)

  for (const item of uniqueFiles) {
    try {
      const formData = new FormData()
      formData.append('file', item.file)
      formData.append('hash', item.hash)

      await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      console.error(`上传 ${item.name} 失败:`, error)
    }
  }

  uploading.value = false
}
</script>
```

### 4. 数据完整性校验

```typescript
import { generateFileHash, computeSha256Hash } from '@/utils/crypto'

// 下载文件时验证完整性
const downloadAndVerify = async (url: string, expectedHash: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(url)
    const fileData = await response.arrayBuffer()

    const actualHash = await generateFileHash(fileData)

    if (actualHash === expectedHash) {
      console.log('文件完整性验证通过')
      return fileData
    } else {
      console.error('文件完整性验证失败')
      console.error('期望哈希:', expectedHash)
      console.error('实际哈希:', actualHash)
      return null
    }
  } catch (error) {
    console.error('下载或验证失败:', error)
    return null
  }
}

// API响应完整性校验
interface ApiResponse<T> {
  data: T
  signature: string
  timestamp: number
}

const verifyApiResponse = <T>(response: ApiResponse<T>, secretKey: string): boolean => {
  const payload = JSON.stringify(response.data) + response.timestamp
  const expectedSignature = computeSha256Hash(payload + secretKey)
  return response.signature === expectedSignature
}
```

### 5. 缓存键生成

```typescript
import { computeSha256Hash } from '@/utils/crypto'

// 创建稳定的缓存键
const generateCacheKey = (params: object): string => {
  // 对键进行排序确保相同参数产生相同的键
  const sortedParams = JSON.stringify(params, Object.keys(params).sort())
  return computeSha256Hash(sortedParams)
}

// 带缓存的API请求
const cachedFetch = async <T>(
  url: string,
  params: object,
  options: {
    ttl?: number,  // 缓存时间(毫秒)
    useCache?: boolean
  } = {}
): Promise<T> => {
  const { ttl = 5 * 60 * 1000, useCache = true } = options
  const cacheKey = generateCacheKey({ url, params })

  if (useCache) {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, expiry } = JSON.parse(cached)
      if (Date.now() < expiry) {
        console.log('使用缓存数据')
        return data as T
      }
    }
  }

  // 发起请求
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  const data = await response.json()

  // 存入缓存
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    expiry: Date.now() + ttl
  }))

  return data as T
}

// 使用示例
const query = {
  page: 1,
  size: 20,
  filters: {
    status: 'active',
    category: 'electronics'
  }
}

const result = await cachedFetch('/api/products', query, { ttl: 60000 })
```

### 6. 本地数据加密存储

```typescript
import {
  encryptWithAutoKey,
  decryptWithParsing,
  encodeBase64,
  decodeBase64
} from '@/utils/crypto'

// 加密存储类
class SecureStorage {
  private prefix: string

  constructor(prefix: string = 'secure_') {
    this.prefix = prefix
  }

  setItem<T>(key: string, value: T): void {
    const { encryptedData, key: aesKey } = encryptWithAutoKey(value)

    localStorage.setItem(`${this.prefix}${key}`, encryptedData)
    localStorage.setItem(`${this.prefix}${key}_k`, encodeBase64(aesKey))
  }

  getItem<T>(key: string): T | null {
    const encryptedData = localStorage.getItem(`${this.prefix}${key}`)
    const keyString = localStorage.getItem(`${this.prefix}${key}_k`)

    if (!encryptedData || !keyString) {
      return null
    }

    try {
      const aesKey = decodeBase64(keyString)
      return decryptWithParsing(encryptedData, aesKey, true) as T
    } catch (error) {
      console.error('解密失败:', error)
      return null
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`)
    localStorage.removeItem(`${this.prefix}${key}_k`)
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

// 使用示例
const secureStore = new SecureStorage('app_')

// 存储敏感信息
secureStore.setItem('userToken', {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...',
  expiry: Date.now() + 3600000
})

// 读取敏感信息
interface TokenData {
  accessToken: string
  refreshToken: string
  expiry: number
}

const tokenData = secureStore.getItem<TokenData>('userToken')
if (tokenData && tokenData.expiry > Date.now()) {
  console.log('Token有效')
}
```

## ⚠️ 安全注意事项

### 1. 密钥管理

**最佳实践：**
- 不要将密钥硬编码在源代码中
- 密钥应该通过安全通道传输
- 考虑使用密钥派生函数(PBKDF2)从密码生成密钥
- 定期轮换密钥

```typescript
// 密钥派生示例
const deriveKeyFromPassword = (
  password: string,
  salt: string
): CryptoJS.lib.WordArray => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,  // 256位密钥
    iterations: 10000  // 迭代次数（越高越安全，但更慢）
  })
}

// 使用示例
const salt = generateRandomString()
const derivedKey = deriveKeyFromPassword('user_password', salt)
const encrypted = encryptWithAes('sensitive data', derivedKey)

// 存储时只保存盐值，密钥每次从密码派生
```

### 2. 加密强度建议

**当前实现的限制：**

```typescript
// 当前使用ECB模式 - 存在安全隐患
const encrypted = CryptoJS.AES.encrypt(message, key, {
  mode: CryptoJS.mode.ECB,  // 相同明文产生相同密文
  padding: CryptoJS.pad.Pkcs7
})
```

**推荐的CBC模式：**

```typescript
// 更安全的CBC模式实现
const encryptWithCBC = (message: string, key: CryptoJS.lib.WordArray): {
  encrypted: string
  iv: string
} => {
  const iv = CryptoJS.lib.WordArray.random(16)
  const encrypted = CryptoJS.AES.encrypt(message, key, {
    mode: CryptoJS.mode.CBC,
    iv: iv,
    padding: CryptoJS.pad.Pkcs7
  })

  return {
    encrypted: encrypted.toString(),
    iv: encodeBase64(iv)
  }
}

const decryptWithCBC = (
  encryptedData: string,
  key: CryptoJS.lib.WordArray,
  ivString: string
): string => {
  const iv = decodeBase64(ivString)
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    mode: CryptoJS.mode.CBC,
    iv: iv,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

### 3. 哈希安全

**密码存储最佳实践：**

```typescript
// 使用加盐哈希
interface HashedPassword {
  hash: string
  salt: string
}

const hashPassword = (password: string): HashedPassword => {
  const salt = generateRandomString()
  const hash = computeSha256Hash(salt + password + salt)  // 双重加盐
  return { hash, salt }
}

const verifyPassword = (
  password: string,
  savedHash: string,
  savedSalt: string
): boolean => {
  const computedHash = computeSha256Hash(savedSalt + password + savedSalt)
  return computedHash === savedHash
}

// 注意：生产环境建议使用bcrypt或scrypt
```

### 4. 前端加密的局限性

**重要提醒：**

1. **前端代码可被逆向**：任何前端加密逻辑都可能被分析
2. **密钥暴露风险**：存储在前端的密钥不安全
3. **中间人攻击**：必须配合HTTPS使用
4. **服务端验证必要**：所有安全验证必须在服务端重复

```typescript
// 前端加密 + 服务端验证的完整流程
const secureSubmit = async (data: object) => {
  // 1. 前端加密（提供基础保护）
  const { encryptedData, key } = encryptWithAutoKey(data)

  // 2. 添加时间戳防重放
  const timestamp = Date.now()

  // 3. 生成请求签名
  const signature = computeSha256Hash(
    encryptedData + timestamp + 'client_secret'
  )

  // 4. 发送请求（必须使用HTTPS）
  const response = await fetch('https://api.example.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp.toString(),
      'X-Signature': signature,
      'X-Encryption-Key': encodeBase64(key)
    },
    body: JSON.stringify({ data: encryptedData })
  })

  // 5. 服务端会：
  //    - 验证时间戳（防重放）
  //    - 验证签名
  //    - 解密数据
  //    - 进行业务验证
  return response.json()
}
```

## 🧪 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import {
  generateRandomString,
  generateAesKey,
  encodeBase64,
  decodeBase64,
  encryptWithAes,
  decryptWithAes,
  encryptWithAutoKey,
  decryptWithParsing,
  computeSha256Hash,
  computeMd5Hash,
  generateImageHash,
  generateFileHash
} from '@/utils/crypto'
import CryptoJS from 'crypto-js'

describe('crypto 工具', () => {
  describe('generateRandomString', () => {
    it('应该生成32位字符串', () => {
      const result = generateRandomString()
      expect(result).toHaveLength(32)
    })

    it('应该只包含字母和数字', () => {
      const result = generateRandomString()
      expect(result).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('每次调用应该生成不同的字符串', () => {
      const results = new Set<string>()
      for (let i = 0; i < 100; i++) {
        results.add(generateRandomString())
      }
      expect(results.size).toBe(100)
    })
  })

  describe('generateAesKey', () => {
    it('应该生成256位密钥', () => {
      const key = generateAesKey()
      expect(key.sigBytes).toBe(32)  // 256 bits = 32 bytes
    })

    it('应该是有效的WordArray', () => {
      const key = generateAesKey()
      expect(key.words).toBeDefined()
      expect(Array.isArray(key.words)).toBe(true)
    })
  })

  describe('Base64 编解码', () => {
    it('应该正确编码和解码', () => {
      const original = 'Hello World'
      const wordArray = CryptoJS.enc.Utf8.parse(original)
      const encoded = encodeBase64(wordArray)
      const decoded = decodeBase64(encoded)
      const result = CryptoJS.enc.Utf8.stringify(decoded)
      expect(result).toBe(original)
    })

    it('应该正确处理中文', () => {
      const original = '你好世界'
      const wordArray = CryptoJS.enc.Utf8.parse(original)
      const encoded = encodeBase64(wordArray)
      const decoded = decodeBase64(encoded)
      const result = CryptoJS.enc.Utf8.stringify(decoded)
      expect(result).toBe(original)
    })
  })

  describe('AES 加解密', () => {
    it('应该正确加密和解密字符串', () => {
      const key = generateAesKey()
      const original = '敏感数据'
      const encrypted = encryptWithAes(original, key)
      const decrypted = decryptWithAes(encrypted, key)
      expect(decrypted).toBe(original)
    })

    it('相同明文使用相同密钥应该产生相同密文', () => {
      const key = generateAesKey()
      const message = 'test message'
      const encrypted1 = encryptWithAes(message, key)
      const encrypted2 = encryptWithAes(message, key)
      expect(encrypted1).toBe(encrypted2)  // ECB模式特性
    })

    it('不同密钥应该产生不同密文', () => {
      const key1 = generateAesKey()
      const key2 = generateAesKey()
      const message = 'test message'
      const encrypted1 = encryptWithAes(message, key1)
      const encrypted2 = encryptWithAes(message, key2)
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('高级加解密', () => {
    it('encryptWithAutoKey 应该返回加密数据和密钥', () => {
      const result = encryptWithAutoKey('test data')
      expect(result.encryptedData).toBeDefined()
      expect(result.key).toBeDefined()
    })

    it('应该正确加密和解密对象', () => {
      const original = { name: 'John', age: 30 }
      const { encryptedData, key } = encryptWithAutoKey(original)
      const decrypted = decryptWithParsing(encryptedData, key, true)
      expect(decrypted).toEqual(original)
    })

    it('parseJson=false 应该返回字符串', () => {
      const original = { name: 'John' }
      const { encryptedData, key } = encryptWithAutoKey(original)
      const decrypted = decryptWithParsing(encryptedData, key, false)
      expect(typeof decrypted).toBe('string')
      expect(decrypted).toBe(JSON.stringify(original))
    })
  })

  describe('哈希计算', () => {
    it('SHA-256 应该产生64字符的哈希', () => {
      const hash = computeSha256Hash('Hello World')
      expect(hash).toHaveLength(64)
    })

    it('MD5 应该产生32字符的哈希', () => {
      const hash = computeMd5Hash('Hello World')
      expect(hash).toHaveLength(32)
    })

    it('相同输入应该产生相同哈希', () => {
      const input = 'test input'
      expect(computeSha256Hash(input)).toBe(computeSha256Hash(input))
      expect(computeMd5Hash(input)).toBe(computeMd5Hash(input))
    })

    it('不同输入应该产生不同哈希', () => {
      const hash1 = computeSha256Hash('input1')
      const hash2 = computeSha256Hash('input2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('文件哈希', () => {
    it('generateImageHash 应该返回SHA-256哈希', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgo...'
      const hash = generateImageHash(base64)
      expect(hash).toHaveLength(64)
    })

    it('generateFileHash 应该异步返回哈希', async () => {
      const blob = new Blob(['test content'], { type: 'text/plain' })
      const hash = await generateFileHash(blob)
      expect(hash).toHaveLength(64)
    })

    it('相同内容的文件应该产生相同哈希', async () => {
      const content = 'same content'
      const blob1 = new Blob([content], { type: 'text/plain' })
      const blob2 = new Blob([content], { type: 'text/plain' })

      const hash1 = await generateFileHash(blob1)
      const hash2 = await generateFileHash(blob2)

      expect(hash1).toBe(hash2)
    })
  })
})
```

## 🚀 性能优化

### 1. 大数据分块处理

```typescript
// 大文件分块计算哈希
const generateLargeFileHash = async (
  file: File,
  chunkSize: number = 1024 * 1024  // 1MB
): Promise<string> => {
  const chunks: string[] = []
  let offset = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    const buffer = await chunk.arrayBuffer()
    const chunkHash = await generateFileHash(buffer)
    chunks.push(chunkHash)
    offset += chunkSize
  }

  // 合并所有块的哈希
  return computeSha256Hash(chunks.join(''))
}

// 带进度回调的版本
const generateFileHashWithProgress = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const chunkSize = 1024 * 1024
  const chunks: string[] = []
  let offset = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    const buffer = await chunk.arrayBuffer()
    const chunkHash = await generateFileHash(buffer)
    chunks.push(chunkHash)
    offset += chunkSize

    if (onProgress) {
      onProgress(Math.min(100, Math.round((offset / file.size) * 100)))
    }
  }

  return computeSha256Hash(chunks.join(''))
}
```

### 2. Web Worker处理

```typescript
// crypto.worker.ts
self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data

  switch (type) {
    case 'hash':
      const hash = await computeHashInWorker(data)
      self.postMessage({ type: 'hash', result: hash })
      break
    case 'encrypt':
      const encrypted = encryptInWorker(data.message, data.key)
      self.postMessage({ type: 'encrypt', result: encrypted })
      break
  }
}

// 主线程使用
const cryptoWorker = new Worker(new URL('./crypto.worker.ts', import.meta.url))

const computeHashAsync = (data: string): Promise<string> => {
  return new Promise((resolve) => {
    cryptoWorker.onmessage = (e) => {
      if (e.data.type === 'hash') {
        resolve(e.data.result)
      }
    }
    cryptoWorker.postMessage({ type: 'hash', data })
  })
}
```

### 3. 缓存优化

```typescript
// 哈希缓存
const hashCache = new Map<string, string>()
const MAX_CACHE_SIZE = 1000

const cachedHash = (data: string): string => {
  if (hashCache.has(data)) {
    return hashCache.get(data)!
  }

  const hash = computeSha256Hash(data)

  // 限制缓存大小
  if (hashCache.size >= MAX_CACHE_SIZE) {
    const firstKey = hashCache.keys().next().value
    hashCache.delete(firstKey)
  }

  hashCache.set(data, hash)
  return hash
}

// 使用WeakMap缓存对象的加密结果
const encryptionCache = new WeakMap<object, { encryptedData: string; key: CryptoJS.lib.WordArray }>()

const cachedEncrypt = (data: object): { encryptedData: string; key: CryptoJS.lib.WordArray } => {
  if (encryptionCache.has(data)) {
    return encryptionCache.get(data)!
  }

  const result = encryptWithAutoKey(data)
  encryptionCache.set(data, result)
  return result
}
```

## 📚 类型定义

```typescript
import CryptoJS from 'crypto-js'

/**
 * 加密结果接口
 */
export interface EncryptionResult {
  /** 加密后的数据 */
  encryptedData: string
  /** 使用的AES密钥 */
  key: CryptoJS.lib.WordArray
}

/**
 * 带IV的加密结果（CBC模式）
 */
export interface EncryptionResultWithIV extends EncryptionResult {
  /** 初始化向量 */
  iv: string
}

/**
 * 哈希密码结果
 */
export interface HashedPassword {
  /** 哈希值 */
  hash: string
  /** 盐值 */
  salt: string
}

/**
 * 文件哈希选项
 */
export interface FileHashOptions {
  /** 分块大小（字节） */
  chunkSize?: number
  /** 进度回调 */
  onProgress?: (progress: number) => void
}

/**
 * 安全存储接口
 */
export interface ISecureStorage {
  setItem<T>(key: string, value: T): void
  getItem<T>(key: string): T | null
  removeItem(key: string): void
  clear(): void
}

/**
 * 加密请求选项
 */
export interface EncryptedRequestOptions extends RequestInit {
  /** 是否加密请求体 */
  encrypt?: boolean
  /** 加密密钥（不提供则自动生成） */
  encryptionKey?: CryptoJS.lib.WordArray
}
```

## ❓ 常见问题

### 1. 解密后出现乱码

**问题原因：**
- 密钥不匹配
- 加密模式或填充方式不一致
- 编码问题

**解决方案：**

```typescript
// 确保加解密使用相同的配置
const encryptionConfig = {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
}

const encrypt = (message: string, key: CryptoJS.lib.WordArray) => {
  return CryptoJS.AES.encrypt(message, key, encryptionConfig).toString()
}

const decrypt = (encrypted: string, key: CryptoJS.lib.WordArray) => {
  return CryptoJS.AES.decrypt(encrypted, key, encryptionConfig)
    .toString(CryptoJS.enc.Utf8)  // 确保使用Utf8解码
}
```

### 2. 大文件哈希计算缓慢

**问题原因：**
- 文件完全加载到内存
- 同步计算阻塞主线程

**解决方案：**

```typescript
// 使用分块处理和Web Worker
const hashLargeFile = async (file: File): Promise<string> => {
  // 分块处理
  const chunkSize = 2 * 1024 * 1024  // 2MB
  const chunks: ArrayBuffer[] = []

  for (let offset = 0; offset < file.size; offset += chunkSize) {
    const chunk = file.slice(offset, offset + chunkSize)
    chunks.push(await chunk.arrayBuffer())
  }

  // 使用Web Worker处理
  return new Promise((resolve) => {
    const worker = new Worker('/hash-worker.js')
    worker.postMessage(chunks)
    worker.onmessage = (e) => {
      resolve(e.data)
      worker.terminate()
    }
  })
}
```

### 3. 密钥如何安全存储

**问题原因：**
- 前端存储不安全
- 密钥可能被窃取

**解决方案：**

```typescript
// 方案1: 会话级密钥（不持久化）
let sessionKey: CryptoJS.lib.WordArray | null = null

const getSessionKey = (): CryptoJS.lib.WordArray => {
  if (!sessionKey) {
    sessionKey = generateAesKey()
  }
  return sessionKey
}

// 方案2: 从服务器获取密钥
const fetchEncryptionKey = async (): Promise<CryptoJS.lib.WordArray> => {
  const response = await fetch('/api/encryption/key', {
    method: 'POST',
    credentials: 'include'  // 携带认证信息
  })
  const { key } = await response.json()
  return decodeBase64(key)
}

// 方案3: 使用密码派生密钥（需要用户输入）
const getKeyFromPassword = async (): Promise<CryptoJS.lib.WordArray> => {
  const password = await promptPassword()
  const salt = await fetchSalt()
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  })
}
```

### 4. 如何与后端Java加密互通

**后端Java实现：**

```java
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class AESUtils {
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";

    public static String encrypt(String data, String key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes("UTF-8"), ALGORITHM);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encrypted = cipher.doFinal(data.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    public static String decrypt(String encryptedData, String key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes("UTF-8"), ALGORITHM);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decrypted, "UTF-8");
    }
}
```

**注意事项：**
- Java使用PKCS5Padding，CryptoJS使用PKCS7Padding（实际相同）
- 确保密钥字符串编码一致（UTF-8）
- Base64编码/解码方式需一致

### 5. 如何处理加密失败

```typescript
// 健壮的加密封装
const safeEncrypt = (data: string | object): EncryptionResult | null => {
  try {
    if (!data) {
      console.warn('加密数据为空')
      return null
    }

    const result = encryptWithAutoKey(data)

    // 验证加密结果
    if (!result.encryptedData || !result.key) {
      console.error('加密结果异常')
      return null
    }

    return result
  } catch (error) {
    console.error('加密失败:', error)
    return null
  }
}

// 健壮的解密封装
const safeDecrypt = <T = string>(
  encryptedData: string,
  key: CryptoJS.lib.WordArray,
  parseJson: boolean = false
): T | null => {
  try {
    if (!encryptedData || !key) {
      console.warn('解密参数无效')
      return null
    }

    const result = decryptWithParsing(encryptedData, key, parseJson)

    // 验证解密结果
    if (result === '' || result === null || result === undefined) {
      console.warn('解密结果为空，可能密钥错误')
      return null
    }

    return result as T
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}
```

## 🛡️ 最佳实践

### 1. 分层加密策略

```typescript
// 多层加密保护敏感数据
const multiLayerEncrypt = (data: string): {
  data: string
  key: CryptoJS.lib.WordArray
} => {
  // 第一层：AES加密
  const firstLayer = encryptWithAutoKey(data)

  // 第二层：Base64编码
  const secondLayer = encodeBase64(
    CryptoJS.enc.Utf8.parse(firstLayer.encryptedData)
  )

  return {
    data: secondLayer,
    key: firstLayer.key
  }
}
```

### 2. 安全的密钥派生

```typescript
// 从密码派生密钥（示例）
const deriveKeyFromPassword = (
  password: string,
  salt: string
): CryptoJS.lib.WordArray => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,  // 256位密钥
    iterations: 10000  // 迭代次数
  })
}
```

### 3. 错误处理

```typescript
const safeEncrypt = (data: string): string | null => {
  try {
    const result = encryptWithAutoKey(data)
    return result.encryptedData
  } catch (error) {
    console.error('加密失败:', error)
    return null
  }
}

const safeDecrypt = (
  encryptedData: string,
  key: CryptoJS.lib.WordArray
): string | null => {
  try {
    return decryptWithAes(encryptedData, key)
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}
```
