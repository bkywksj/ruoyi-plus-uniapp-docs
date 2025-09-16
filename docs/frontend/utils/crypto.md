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

## 🎲 随机生成

### generateRandomString

随机生成32位的字符串，包含大小写字母和数字。

```typescript
generateRandomString(): string
```

**返回值：**
- `string` - 32位随机字符串

**示例：**
```typescript
// 生成随机字符串
const randomStr = generateRandomString()
console.log(randomStr)  // 输出类似：'aB3dE9fH2jK7mN1pQ5rS8tU4vW6xY0zC'

// 用于生成临时密码
const tempPassword = generateRandomString()
```

### generateAesKey

随机生成AES密钥，用于AES加密操作。

```typescript
generateAesKey(): CryptoJS.lib.WordArray
```

**返回值：**
- `CryptoJS.lib.WordArray` - AES密钥对象

**示例：**
```typescript
// 生成AES密钥
const aesKey = generateAesKey()

// 使用密钥进行加密
const encrypted = encryptWithAes('Hello World', aesKey)
```

## 📄 Base64处理

### encodeBase64

将 WordArray 数据编码为Base64字符串。

```typescript
encodeBase64(data: CryptoJS.lib.WordArray): string
```

**参数：**
- `data` - 要编码的WordArray数据

**返回值：**
- `string` - Base64编码后的字符串

**示例：**
```typescript
import CryptoJS from 'crypto-js'

// 将字符串转为WordArray并编码
const message = CryptoJS.enc.Utf8.parse('Hello World')
const encoded = encodeBase64(message)
console.log(encoded)  // 输出：'SGVsbG8gV29ybGQ='
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

**示例：**
```typescript
// 解码Base64字符串
const decoded = decodeBase64('SGVsbG8gV29ybGQ=')
const text = CryptoJS.enc.Utf8.stringify(decoded)
console.log(text)  // 输出：'Hello World'
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
- `string` - 加密后的字符串

**示例：**
```typescript
// 生成密钥并加密
const key = generateAesKey()
const encrypted = encryptWithAes('敏感数据', key)
console.log(encrypted)  // 输出加密后的字符串
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

**示例：**
```typescript
// 解密数据
const key = generateAesKey()
const encrypted = encryptWithAes('敏感数据', key)
const decrypted = decryptWithAes(encrypted, key)
console.log(decrypted)  // 输出：'敏感数据'
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

**示例：**
```typescript
// 加密字符串
const result1 = encryptWithAutoKey('Hello World')
console.log(result1.encryptedData)  // 加密后的数据
console.log(result1.key)           // 生成的密钥

// 加密对象
const userInfo = { name: 'John', age: 30, email: 'john@example.com' }
const result2 = encryptWithAutoKey(userInfo)
// 对象会自动转为JSON字符串后加密
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
```

## 🔍 哈希计算

### computeSha256Hash

计算字符串的SHA-256哈希值。

```typescript
computeSha256Hash(data: string): string
```

**参数：**
- `data` - 要计算哈希的数据

**返回值：**
- `string` - 哈希值（十六进制表示）

**示例：**
```typescript
// 计算SHA-256哈希
const hash = computeSha256Hash('Hello World')
console.log(hash)  // 输出：'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// 用于密码哈希（简单示例，实际应用建议加盐）
const passwordHash = computeSha256Hash('user_password')
```

### computeMd5Hash

计算字符串的MD5哈希值。

```typescript
computeMd5Hash(data: string): string
```

**参数：**
- `data` - 要计算哈希的数据

**返回值：**
- `string` - 哈希值（十六进制表示）

**示例：**
```typescript
// 计算MD5哈希
const md5Hash = computeMd5Hash('Hello World')
console.log(md5Hash)  // 输出：'b10a8db164e0754105b7a99be72e3fe5'

// 用于文件完整性校验
const fileContent = 'file content here'
const checksum = computeMd5Hash(fileContent)
```

### generateImageHash

生成图片的唯一哈希标识，基于图片的Base64数据。

```typescript
generateImageHash(base64Data: string): string
```

**参数：**
- `base64Data` - 图片的Base64编码数据

**返回值：**
- `string` - 图片的唯一哈希值

**示例：**
```typescript
// 生成图片哈希
const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
const imageHash = generateImageHash(imageBase64)
console.log(imageHash)

// 用于图片去重
const uploadedImages = new Set()
if (uploadedImages.has(imageHash)) {
  console.log('图片已存在')
} else {
  uploadedImages.add(imageHash)
  console.log('新图片')
}
```

### generateFileHash

异步生成文件的哈希标识，支持多种文件类型。

```typescript
generateFileHash(file: Blob | File | ArrayBuffer): Promise<string>
```

**参数：**
- `file` - 文件或数据流（Blob、File或ArrayBuffer）

**返回值：**
- `Promise<string>` - 文件的哈希值

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
```

## 💡 实际应用场景

### 1. 用户敏感信息加密

```typescript
// 加密用户个人信息
const sensitiveInfo = {
  idCard: '123456789012345678',
  bankCard: '6222020111122220000',
  phone: '13812345678'
}

const { encryptedData, key } = encryptWithAutoKey(sensitiveInfo)

// 存储加密数据和密钥（实际应用中密钥需要安全保存）
localStorage.setItem('encrypted_info', encryptedData)
localStorage.setItem('info_key', encodeBase64(key))

// 解密使用
const storedData = localStorage.getItem('encrypted_info')
const storedKey = decodeBase64(localStorage.getItem('info_key'))
const decryptedInfo = decryptWithParsing(storedData, storedKey, true)
```

### 2. API接口参数加密

```typescript
// 加密API请求参数
const apiParams = {
  userId: 12345,
  action: 'transfer',
  amount: 1000,
  targetAccount: '6222020111122220000'
}

const encryptedParams = encryptWithAutoKey(apiParams)

// 发送加密请求
const response = await fetch('/api/secure-operation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Encryption-Key': encodeBase64(encryptedParams.key)
  },
  body: JSON.stringify({
    data: encryptedParams.encryptedData
  })
})
```

### 3. 文件上传去重

```typescript
// 文件上传前检查重复
const handleFileUpload = async (files: FileList) => {
  const uploadQueue = []
  
  for (const file of files) {
    const fileHash = await generateFileHash(file)
    
    // 检查服务器是否已有该文件
    const exists = await checkFileExists(fileHash)
    
    if (!exists) {
      uploadQueue.push({
        file,
        hash: fileHash
      })
    } else {
      console.log(`文件 ${file.name} 已存在，跳过上传`)
    }
  }
  
  // 批量上传不重复的文件
  if (uploadQueue.length > 0) {
    await uploadFiles(uploadQueue)
  }
}
```

### 4. 数据完整性校验

```typescript
// 下载文件时验证完整性
const downloadAndVerify = async (url: string, expectedHash: string) => {
  try {
    const response = await fetch(url)
    const fileData = await response.arrayBuffer()
    
    const actualHash = await generateFileHash(fileData)
    
    if (actualHash === expectedHash) {
      console.log('文件完整性验证通过')
      return fileData
    } else {
      throw new Error('文件完整性验证失败')
    }
  } catch (error) {
    console.error('下载或验证失败:', error)
    throw error
  }
}
```

### 5. 缓存键生成

```typescript
// 根据查询参数生成缓存键
const generateCacheKey = (queryParams: object): string => {
  const paramString = JSON.stringify(queryParams)
  return computeSha256Hash(paramString)
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

const cacheKey = generateCacheKey(query)
const cachedData = localStorage.getItem(cacheKey)

if (cachedData) {
  console.log('使用缓存数据')
} else {
  const data = await fetchData(query)
  localStorage.setItem(cacheKey, JSON.stringify(data))
}
```

## ⚠️ 安全注意事项

### 1. 密钥管理
- **不要将密钥存储在客户端**：密钥应该安全地存储在服务端
- **定期更换密钥**：建议定期更换加密密钥
- **密钥传输安全**：密钥传输时必须使用安全通道（HTTPS）

### 2. 加密强度
- **AES-256**：建议使用AES-256而不是AES-128
- **避免ECB模式**：生产环境建议使用CBC或GCM模式
- **使用随机IV**：每次加密使用不同的初始化向量

### 3. 哈希安全
- **密码哈希加盐**：密码哈希必须使用随机盐值
- **避免MD5**：MD5已不安全，推荐使用SHA-256或更强的算法
- **防止彩虹表攻击**：使用足够复杂的盐值

### 4. 前端加密限制
- **前端加密非绝对安全**：客户端代码可被逆向，仅用于基础保护
- **服务端验证必要**：重要数据必须在服务端进行二次验证
- **HTTPS传输**：始终使用HTTPS传输敏感数据

## 🛡️ 最佳实践

### 1. 分层加密策略
```typescript
// 多层加密保护敏感数据
const multiLayerEncrypt = (data: string) => {
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
const deriveKeyFromPassword = (password: string, salt: string): CryptoJS.lib.WordArray => {
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

const safeDecrypt = (encryptedData: string, key: CryptoJS.lib.WordArray): string | null => {
  try {
    return decryptWithAes(encryptedData, key)
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}
```
