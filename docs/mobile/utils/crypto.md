# 加密工具

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的加密解密解决方案,基于 crypto-js 和 jsencrypt 库实现了 AES 对称加密、RSA 非对称加密、哈希计算等功能。该工具集与后端 API 加密系统无缝集成,支持请求/响应自动加密,保障敏感数据传输安全。

### 核心特性

- **AES 加密** - 高效的对称加密算法,适用于大数据量加密
- **RSA 加密** - 非对称加密算法,用于密钥交换和数字签名
- **混合加密** - AES + RSA 混合加密模式,兼顾安全性和性能
- **哈希计算** - 支持 SHA-256、MD5 等哈希算法
- **API 加密集成** - 与 HTTP 请求模块深度集成,支持自动加解密
- **环境配置** - 通过环境变量管理密钥,支持多环境配置
- **TypeScript 支持** - 完整的类型定义,提供开发时类型检查

### 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| crypto-js | 4.2.0 | JavaScript 加密库 |
| jsencrypt | 3.3.2 | RSA 加密解密库 |
| UniApp | 3.0.0+ | 跨平台框架 |
| TypeScript | 5.7.2 | 类型支持 |

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       应用层 (业务代码)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    useHttp 集成层                     │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │   encryptRequestData / decryptResponseData     │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    加密工具层                         │  │
│   │  ┌───────────────────┬───────────────────────────┐  │  │
│   │  │     crypto.ts     │         rsa.ts            │  │  │
│   │  │  ┌─────────────┐  │  ┌─────────────────────┐  │  │  │
│   │  │  │ AES 加密    │  │  │ RSA 公钥加密       │  │  │  │
│   │  │  │ AES 解密    │  │  │ RSA 私钥解密       │  │  │  │
│   │  │  │ Base64 编码 │  │  │ RSA 签名           │  │  │  │
│   │  │  │ 哈希计算    │  │  │ RSA 验签           │  │  │  │
│   │  │  └─────────────┘  │  └─────────────────────┘  │  │  │
│   │  └───────────────────┴───────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    配置层                             │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │           systemConfig.ts (安全配置)             │  │  │
│   │  │    apiEncrypt / rsaPublicKey / rsaPrivateKey   │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心文件结构

```
plus-uniapp/src/
├── utils/
│   ├── crypto.ts          # AES 加密、Base64 编码、哈希计算
│   └── rsa.ts             # RSA 加密解密、签名验签
├── composables/
│   └── useHttp.ts         # HTTP 请求加密集成
├── systemConfig.ts        # 系统配置(密钥管理)
└── env/
    ├── .env               # 基础环境变量
    ├── .env.development   # 开发环境变量
    └── .env.production    # 生产环境变量
```

## AES 加密

### 基础概念

AES (Advanced Encryption Standard) 是一种对称加密算法,使用相同的密钥进行加密和解密。项目采用 AES-ECB 模式配合 PKCS7 填充。

### 生成随机字符串

```typescript
import { generateRandomString } from '@/utils/crypto'

// 生成 32 位随机字符串
const randomStr = generateRandomString()
console.log('随机字符串:', randomStr)
// 输出示例: "aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV"

// 多次调用生成不同的字符串
const str1 = generateRandomString()
const str2 = generateRandomString()
console.log('str1:', str1)
console.log('str2:', str2)
console.log('是否相同:', str1 === str2)  // false
```

**函数说明:**
- 生成由大小写字母和数字组成的 32 位随机字符串
- 每次调用都会生成不同的字符串
- 常用于生成 AES 密钥原始字符串

### 生成 AES 密钥

```typescript
import { generateAesKey } from '@/utils/crypto'

// 生成 AES 密钥(WordArray 格式)
const aesKey = generateAesKey()
console.log('AES 密钥:', aesKey)

// 密钥可用于后续加密解密操作
```

**函数说明:**
- 基于 `generateRandomString` 生成的随机字符串创建密钥
- 返回 `CryptoJS.lib.WordArray` 类型,可直接用于加密操作
- 密钥长度为 256 位(32 字符 × 8 位)

### AES 加密数据

```typescript
import { encryptWithAes, generateAesKey } from '@/utils/crypto'

// 生成密钥
const aesKey = generateAesKey()

// 加密字符串
const plainText = '这是需要加密的敏感数据'
const encrypted = encryptWithAes(plainText, aesKey)
console.log('加密结果:', encrypted)
// 输出示例: "U2FsdGVkX1+abc123..."

// 加密 JSON 数据
const jsonData = JSON.stringify({
  username: 'admin',
  password: '123456'
})
const encryptedJson = encryptWithAes(jsonData, aesKey)
console.log('加密 JSON:', encryptedJson)
```

**函数说明:**
- 使用 AES-ECB 模式加密
- 采用 PKCS7 填充方式
- 返回 Base64 编码的加密字符串

### AES 解密数据

```typescript
import { encryptWithAes, decryptWithAes, generateAesKey } from '@/utils/crypto'

// 加密
const aesKey = generateAesKey()
const plainText = '敏感数据内容'
const encrypted = encryptWithAes(plainText, aesKey)

// 解密
const decrypted = decryptWithAes(encrypted, aesKey)
console.log('解密结果:', decrypted)  // "敏感数据内容"
console.log('是否一致:', plainText === decrypted)  // true

// 解密 JSON 数据
const jsonStr = JSON.stringify({ name: '张三', age: 25 })
const encryptedJson = encryptWithAes(jsonStr, aesKey)
const decryptedJson = decryptWithAes(encryptedJson, aesKey)
const parsedData = JSON.parse(decryptedJson)
console.log('解密后的对象:', parsedData)  // { name: '张三', age: 25 }
```

**函数说明:**
- 使用与加密相同的密钥进行解密
- 返回原始明文字符串
- 解密失败时返回空字符串

### 一步加密(自动生成密钥)

```typescript
import { encryptWithAutoKey } from '@/utils/crypto'

// 加密字符串,自动生成密钥
const result = encryptWithAutoKey('敏感数据')
console.log('加密数据:', result.encryptedData)
console.log('使用的密钥:', result.key)

// 加密对象,自动序列化为 JSON
const userData = {
  userId: 1001,
  userName: 'admin',
  token: 'abc123'
}
const { encryptedData, key } = encryptWithAutoKey(userData)
console.log('加密后:', encryptedData)

// 保存密钥用于后续解密
```

**函数说明:**
- 自动生成随机 AES 密钥
- 支持字符串和对象类型数据
- 对象会自动序列化为 JSON 字符串
- 返回加密数据和密钥,密钥需要保存用于解密

### 带解析的解密

```typescript
import { encryptWithAutoKey, decryptWithParsing } from '@/utils/crypto'

// 加密对象
const userData = { name: '李四', role: 'admin' }
const { encryptedData, key } = encryptWithAutoKey(userData)

// 解密为字符串
const decryptedStr = decryptWithParsing(encryptedData, key, false)
console.log('字符串结果:', decryptedStr)  // '{"name":"李四","role":"admin"}'

// 解密并自动解析为对象
const decryptedObj = decryptWithParsing(encryptedData, key, true)
console.log('对象结果:', decryptedObj)  // { name: '李四', role: 'admin' }

// 类型安全的使用方式
interface UserData {
  name: string
  role: string
}
const user = decryptWithParsing(encryptedData, key, true) as UserData
console.log('用户名:', user.name)
console.log('角色:', user.role)
```

**函数说明:**
- `parseJson` 参数为 `true` 时自动解析 JSON
- JSON 解析失败时返回原始字符串
- 适合解密 API 响应数据

## RSA 加密

### 基础概念

RSA 是一种非对称加密算法,使用一对密钥:公钥用于加密,私钥用于解密。项目集成了 jsencrypt 库,支持加密、解密、签名、验签等操作。

### 密钥配置

RSA 密钥通过环境变量配置:

```properties
# .env 文件
# 接口加密功能开关
VITE_APP_API_ENCRYPT = 'true'

# RSA 公钥(用于加密)
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mTr...'

# RSA 私钥(用于解密)
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOQIBAAJBAKoR8mTr7AGTcYLqm...'
```

在 `systemConfig.ts` 中读取:

```typescript
// systemConfig.ts
export const SystemConfig = {
  security: {
    apiEncrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    rsaPublicKey: import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '',
    rsaPrivateKey: import.meta.env.VITE_APP_RSA_PRIVATE_KEY || ''
  }
}
```

### RSA 公钥加密

```typescript
import { rsaEncrypt } from '@/utils/rsa'

// 使用默认公钥加密
const plainText = '需要加密的敏感数据'
const encrypted = rsaEncrypt(plainText)
console.log('加密结果:', encrypted)

// 使用自定义公钥加密
const customPublicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK...
-----END PUBLIC KEY-----`
const encryptedCustom = rsaEncrypt(plainText, customPublicKey)
console.log('自定义公钥加密:', encryptedCustom)

// 加密失败返回 null
const invalidEncrypt = rsaEncrypt('')
console.log('空字符串加密:', invalidEncrypt)  // null
```

**函数说明:**
- 不传公钥时使用环境变量配置的默认公钥
- RSA 加密有长度限制,通常用于加密短数据(如 AES 密钥)
- 加密失败返回 `null`

### RSA 私钥解密

```typescript
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

// 加密
const plainText = '机密信息'
const encrypted = rsaEncrypt(plainText)

// 使用默认私钥解密
const decrypted = rsaDecrypt(encrypted!)
console.log('解密结果:', decrypted)  // "机密信息"

// 使用自定义私钥解密
const customPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAAS...
-----END PRIVATE KEY-----`
const decryptedCustom = rsaDecrypt(encrypted!, customPrivateKey)

// 解密失败返回 null
const invalidDecrypt = rsaDecrypt('invalid_data')
console.log('无效数据解密:', invalidDecrypt)  // null
```

**函数说明:**
- 使用与加密配对的私钥进行解密
- 不传私钥时使用环境变量配置的默认私钥
- 解密失败返回 `null`

### 检查是否可解密

```typescript
import { rsaEncrypt, rsaCanDecrypt } from '@/utils/rsa'

// 加密数据
const encrypted = rsaEncrypt('测试数据')

// 检查是否可以用当前私钥解密
const canDecrypt = rsaCanDecrypt(encrypted!)
console.log('是否可解密:', canDecrypt)  // true

// 检查无效数据
const canDecryptInvalid = rsaCanDecrypt('invalid_encrypted_data')
console.log('无效数据是否可解密:', canDecryptInvalid)  // false

// 使用场景:验证密钥匹配
const isKeyMatch = (encryptedText: string): boolean => {
  return rsaCanDecrypt(encryptedText)
}
```

**函数说明:**
- 用于验证加密数据是否可以被当前私钥解密
- 内部调用 `rsaDecrypt` 并判断返回值
- 常用于密钥匹配验证

### RSA 签名

```typescript
import { rsaSign } from '@/utils/rsa'

// 对数据进行签名(使用 SHA-256 哈希)
const originalData = '需要签名的原始数据'
const signature = rsaSign(originalData)
console.log('签名结果:', signature)

// 对 JSON 数据签名
const jsonData = JSON.stringify({
  orderId: 'ORD123456',
  amount: 100.00,
  timestamp: Date.now()
})
const jsonSignature = rsaSign(jsonData)

// 使用自定义私钥签名
const customPrivateKey = '...'
const customSignature = rsaSign(originalData, customPrivateKey)
```

**函数说明:**
- 使用 SHA-256 作为哈希算法
- 签名用私钥,验签用公钥
- 常用于数据完整性验证和身份认证

### RSA 验签

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'

// 生成签名
const originalData = '原始数据内容'
const signature = rsaSign(originalData)

// 验证签名
const isValid = rsaVerify(originalData, signature!, undefined)
console.log('签名验证结果:', isValid)  // true

// 篡改数据后验证
const tamperedData = '被篡改的数据'
const isTamperedValid = rsaVerify(tamperedData, signature!, undefined)
console.log('篡改数据验证:', isTamperedValid)  // false

// 使用自定义公钥验签
const customPublicKey = '...'
const customValid = rsaVerify(originalData, signature!, customPublicKey)
```

**函数说明:**
- 验证数据是否被篡改
- 签名匹配返回 `true`,不匹配返回 `false`
- 常用于 API 请求签名验证

## Base64 编码

### 编码数据

```typescript
import CryptoJS from 'crypto-js'
import { encodeBase64 } from '@/utils/crypto'

// 将 WordArray 编码为 Base64
const wordArray = CryptoJS.enc.Utf8.parse('Hello, World!')
const base64Str = encodeBase64(wordArray)
console.log('Base64 编码:', base64Str)  // "SGVsbG8sIFdvcmxkIQ=="

// 编码 AES 密钥
import { generateAesKey } from '@/utils/crypto'
const aesKey = generateAesKey()
const keyBase64 = encodeBase64(aesKey)
console.log('密钥 Base64:', keyBase64)
```

### 解码数据

```typescript
import CryptoJS from 'crypto-js'
import { decodeBase64 } from '@/utils/crypto'

// 将 Base64 字符串解码为 WordArray
const base64Str = 'SGVsbG8sIFdvcmxkIQ=='
const wordArray = decodeBase64(base64Str)

// 转换为字符串
const originalStr = wordArray.toString(CryptoJS.enc.Utf8)
console.log('解码结果:', originalStr)  // "Hello, World!"

// 解码用于 AES 解密
import { decryptWithAes } from '@/utils/crypto'
const encryptedKeyBase64 = '...'  // 从服务器获取的加密密钥
const aesKeyArray = decodeBase64(encryptedKeyBase64)
```

### 实际应用场景

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import CryptoJS from 'crypto-js'
import { encodeBase64, decodeBase64 } from '@/utils/crypto'

// 图片转 Base64
const imageToBase64 = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        resolve(res.data as string)
      },
      fail: reject
    })
  })
}

// Base64 图片上传
const uploadBase64Image = async (base64Data: string) => {
  const wordArray = CryptoJS.enc.Base64.parse(base64Data)
  const encoded = encodeBase64(wordArray)

  // 发送到服务器
  const [err, result] = await http.post('/api/upload/base64', {
    imageData: encoded,
    filename: 'image.png'
  })

  return result
}
</script>
```

## 哈希计算

### SHA-256 哈希

```typescript
import { computeSha256Hash } from '@/utils/crypto'

// 计算字符串的 SHA-256 哈希
const data = '需要计算哈希的数据'
const hash = computeSha256Hash(data)
console.log('SHA-256 哈希:', hash)
// 输出: 64位十六进制字符串

// 计算 JSON 数据哈希
const jsonData = JSON.stringify({
  userId: 1001,
  action: 'login',
  timestamp: Date.now()
})
const jsonHash = computeSha256Hash(jsonData)
console.log('JSON 哈希:', jsonHash)

// 用于数据完整性校验
const originalHash = computeSha256Hash(data)
const receivedHash = computeSha256Hash(data)
const isValid = originalHash === receivedHash
console.log('数据完整性:', isValid)  // true
```

**函数说明:**
- SHA-256 生成 256 位(64 字符十六进制)哈希值
- 单向函数,不可逆
- 常用于数据完整性验证、密码存储

### MD5 哈希

```typescript
import { computeMd5Hash } from '@/utils/crypto'

// 计算 MD5 哈希
const data = '需要计算哈希的数据'
const hash = computeMd5Hash(data)
console.log('MD5 哈希:', hash)
// 输出: 32位十六进制字符串

// 生成文件校验码
const fileContent = '文件内容...'
const checksum = computeMd5Hash(fileContent)
console.log('文件校验码:', checksum)

// 注意: MD5 安全性较低,不建议用于安全敏感场景
```

**函数说明:**
- MD5 生成 128 位(32 字符十六进制)哈希值
- 计算速度比 SHA-256 快
- 安全性较低,建议仅用于非安全场景(如文件校验)

### 图片哈希

```typescript
import { generateImageHash } from '@/utils/crypto'

// 生成图片的唯一哈希标识
const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
const imageHash = generateImageHash(imageBase64)
console.log('图片哈希:', imageHash)

// 用于图片去重
const checkDuplicate = (newImageBase64: string, existingHashes: string[]): boolean => {
  const newHash = generateImageHash(newImageBase64)
  return existingHashes.includes(newHash)
}

// 图片缓存键生成
const generateCacheKey = (imageBase64: string): string => {
  return `img_${generateImageHash(imageBase64)}`
}
```

**函数说明:**
- 基于图片 Base64 数据生成唯一标识
- 内部使用 SHA-256 算法
- 常用于图片去重、缓存键生成

### 文件哈希

```typescript
import { generateFileHash } from '@/utils/crypto'

// 生成文件的哈希标识
const generateHashFromFile = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath,
      success: async (res) => {
        const hash = await generateFileHash(res.data as ArrayBuffer)
        resolve(hash)
      },
      fail: reject
    })
  })
}

// 使用示例
const handleFileUpload = async () => {
  const [err, res] = await uni.chooseFile({
    count: 1,
    type: 'all'
  })

  if (err || !res) return

  const filePath = res.tempFiles[0].path
  const fileHash = await generateHashFromFile(filePath)
  console.log('文件哈希:', fileHash)

  // 检查文件是否已上传(秒传)
  const [checkErr, exists] = await http.get('/api/file/check', {
    hash: fileHash
  })

  if (exists) {
    console.log('文件已存在,秒传成功')
    return
  }

  // 文件不存在,执行上传
  await uploadFile(filePath, fileHash)
}
```

**函数说明:**
- 支持 `Blob`、`File` 和 `ArrayBuffer` 类型
- 内部将文件转换为二进制字符串后计算 SHA-256
- 常用于大文件去重、断点续传

## API 加密集成

### 混合加密原理

项目采用 AES + RSA 混合加密模式:

```
请求加密流程:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  原始请求数据  │───▶│  生成AES密钥  │───▶│ AES加密数据   │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │ RSA加密AES密钥│───▶│ 放入请求头    │
                    └──────────────┘    └──────────────┘


响应解密流程:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 加密的响应数据 │    │ 从响应头获取  │    │ RSA解密AES密钥│
└──────────────┘    │ 加密的AES密钥 │───▶│              │
       │            └──────────────┘    └──────────────┘
       │                                       │
       │            ┌──────────────┐            │
       └───────────▶│ AES解密数据   │◀───────────┘
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  原始响应数据  │
                    └──────────────┘
```

### 启用 API 加密

```properties
# .env 文件配置
VITE_APP_API_ENCRYPT = 'true'
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZ...'
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOQIBAAJBAKoR8...'
```

### 请求加密实现

```typescript
// useHttp.ts 中的请求加密逻辑
import { generateAesKey, encryptWithAes, encodeBase64 } from '@/utils/crypto'
import { rsaEncrypt } from '@/utils/rsa'
import { SystemConfig } from '@/systemConfig'

const ENCRYPT_HEADER = 'encrypt-key'

/**
 * 加密请求数据
 */
const encryptRequestData = (data: any, header: Record<string, any>) => {
  // 检查是否启用加密
  if (!SystemConfig.security?.apiEncrypt || !data) return data

  // 1. 生成随机 AES 密钥
  const aesKey = generateAesKey()

  // 2. 使用 AES 加密请求数据
  const encryptedData = encryptWithAes(JSON.stringify(data), aesKey)

  // 3. 使用 RSA 公钥加密 AES 密钥
  const encryptedKey = rsaEncrypt(encodeBase64(aesKey))

  // 4. 将加密的 AES 密钥放入请求头
  header[ENCRYPT_HEADER] = encryptedKey

  return encryptedData
}
```

### 响应解密实现

```typescript
// useHttp.ts 中的响应解密逻辑
import { decryptWithAes, decodeBase64 } from '@/utils/crypto'
import { rsaDecrypt } from '@/utils/rsa'

/**
 * 解密响应数据
 */
const decryptResponseData = (data: any, header: Record<string, any>): any => {
  if (!SystemConfig.security?.apiEncrypt) return data

  // 1. 从响应头获取加密的 AES 密钥
  const encryptKey = header[ENCRYPT_HEADER] || header[ENCRYPT_HEADER.toLowerCase()]
  if (!encryptKey) return data

  // 2. 使用 RSA 私钥解密 AES 密钥
  const aesKeyStr = rsaDecrypt(encryptKey)
  if (!aesKeyStr) {
    console.error('解密AES密钥失败')
    return data
  }

  // 3. 将 Base64 字符串转换为 AES 密钥
  const aesKey = decodeBase64(aesKeyStr)

  // 4. 使用 AES 密钥解密响应数据
  try {
    const decryptedStr = decryptWithAes(data, aesKey)
    return JSON.parse(decryptedStr)
  } catch (e) {
    console.error('解密响应数据失败:', e)
    return data
  }
}
```

### 使用加密请求

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 使用链式调用启用加密
const login = async (username: string, password: string) => {
  const [err, data] = await http.encrypt().post('/auth/login', {
    username,
    password
  })

  if (err) {
    uni.showToast({ title: '登录失败', icon: 'none' })
    return
  }

  console.log('登录成功:', data)
}

// 方式2: 使用配置选项
const [err, data] = await http.post('/auth/login', loginData, {
  header: {
    isEncrypt: true
  }
})

// 方式3: 组合多个配置
const [err, result] = await http
  .noAuth()        // 不需要 Token
  .encrypt()       // 启用加密
  .timeout(30000)  // 30秒超时
  .post('/auth/register', registerData)
```

### 敏感数据传输

```vue
<template>
  <view class="payment-form">
    <wd-input v-model="form.cardNumber" label="卡号" />
    <wd-input v-model="form.cvv" label="CVV" type="password" />
    <wd-input v-model="form.expiry" label="有效期" />
    <wd-button type="primary" @click="submitPayment">支付</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { http } from '@/composables/useHttp'

interface PaymentForm {
  cardNumber: string
  cvv: string
  expiry: string
}

const form = reactive<PaymentForm>({
  cardNumber: '',
  cvv: '',
  expiry: ''
})

// 提交支付(强制加密)
const submitPayment = async () => {
  // 敏感数据必须加密传输
  const [err, result] = await http.encrypt().post('/payment/submit', {
    cardNumber: form.cardNumber,
    cvv: form.cvv,
    expiry: form.expiry,
    amount: 100.00
  })

  if (err) {
    uni.showToast({ title: '支付失败', icon: 'none' })
    return
  }

  uni.showToast({ title: '支付成功', icon: 'success' })
}
</script>
```

## 实际应用示例

### 用户登录加密

```vue
<template>
  <view class="login-page">
    <view class="login-form">
      <wd-input
        v-model="form.username"
        label="用户名"
        placeholder="请输入用户名"
        clearable
      />
      <wd-input
        v-model="form.password"
        label="密码"
        type="password"
        placeholder="请输入密码"
        show-password
        clearable
      />
      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleLogin"
      >
        登录
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { http } from '@/composables/useHttp'
import { useToken } from '@/composables/useToken'

interface LoginForm {
  username: string
  password: string
}

interface LoginResult {
  accessToken: string
  expiresIn: number
}

const form = reactive<LoginForm>({
  username: '',
  password: ''
})
const loading = ref(false)
const { setToken } = useToken()

const handleLogin = async () => {
  if (!form.username || !form.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  loading.value = true

  // 使用加密传输登录信息
  const [err, data] = await http
    .noAuth()      // 登录不需要 Token
    .encrypt()     // 加密敏感数据
    .post<LoginResult>('/auth/login', {
      username: form.username,
      password: form.password,
      authType: 'password'
    })

  loading.value = false

  if (err) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
    return
  }

  if (data?.accessToken) {
    setToken(data.accessToken)
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/index/index' })
  }
}
</script>

```

### 密码修改加密

```vue
<template>
  <view class="change-password">
    <wd-input
      v-model="form.oldPassword"
      label="原密码"
      type="password"
      placeholder="请输入原密码"
    />
    <wd-input
      v-model="form.newPassword"
      label="新密码"
      type="password"
      placeholder="请输入新密码"
    />
    <wd-input
      v-model="form.confirmPassword"
      label="确认密码"
      type="password"
      placeholder="请再次输入新密码"
    />
    <wd-button type="primary" block @click="handleSubmit">
      确认修改
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { http } from '@/composables/useHttp'

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const form = reactive<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  // 表单验证
  if (!form.oldPassword || !form.newPassword) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  if (form.newPassword.length < 6) {
    uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
    return
  }

  // 加密传输密码
  const [err] = await http.encrypt().put('/system/user/profile/updatePwd', {
    oldPassword: form.oldPassword,
    newPassword: form.newPassword
  })

  if (err) {
    uni.showToast({ title: '修改失败', icon: 'none' })
    return
  }

  uni.showToast({ title: '密码修改成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>
```

### 数据签名验证

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'
import { computeSha256Hash } from '@/utils/crypto'

interface OrderData {
  orderId: string
  amount: number
  timestamp: number
  userId: string
}

/**
 * 生成订单签名
 */
const signOrder = (order: OrderData): string => {
  // 按固定顺序拼接参数
  const signStr = `orderId=${order.orderId}&amount=${order.amount}&timestamp=${order.timestamp}&userId=${order.userId}`

  // 先计算哈希,再签名
  const hash = computeSha256Hash(signStr)
  const signature = rsaSign(hash)

  return signature || ''
}

/**
 * 验证订单签名
 */
const verifyOrderSignature = (order: OrderData, signature: string): boolean => {
  const signStr = `orderId=${order.orderId}&amount=${order.amount}&timestamp=${order.timestamp}&userId=${order.userId}`
  const hash = computeSha256Hash(signStr)

  return rsaVerify(hash, signature)
}

// 使用示例
const order: OrderData = {
  orderId: 'ORD202312010001',
  amount: 199.99,
  timestamp: Date.now(),
  userId: 'USER001'
}

// 生成签名
const signature = signOrder(order)
console.log('订单签名:', signature)

// 验证签名
const isValid = verifyOrderSignature(order, signature)
console.log('签名验证:', isValid)  // true

// 篡改数据后验证
order.amount = 99.99
const isValidAfterTamper = verifyOrderSignature(order, signature)
console.log('篡改后验证:', isValidAfterTamper)  // false
```

### 文件秒传实现

```vue
<template>
  <view class="file-upload">
    <wd-button @click="selectFile">选择文件</wd-button>
    <view v-if="uploadProgress > 0" class="progress">
      <wd-progress :percentage="uploadProgress" />
    </view>
    <view v-if="fileInfo" class="file-info">
      <text>文件名: {{ fileInfo.name }}</text>
      <text>文件大小: {{ formatSize(fileInfo.size) }}</text>
      <text>文件哈希: {{ fileHash }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { generateFileHash } from '@/utils/crypto'
import { http } from '@/composables/useHttp'

interface FileInfo {
  name: string
  size: number
  path: string
}

const fileInfo = ref<FileInfo | null>(null)
const fileHash = ref('')
const uploadProgress = ref(0)

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// 选择文件
const selectFile = async () => {
  const [err, res] = await uni.chooseFile({
    count: 1,
    type: 'all'
  })

  if (err || !res) return

  const file = res.tempFiles[0]
  fileInfo.value = {
    name: file.name,
    size: file.size,
    path: file.path
  }

  // 计算文件哈希
  await computeFileHash(file.path)

  // 检查是否可以秒传
  await checkAndUpload()
}

// 计算文件哈希
const computeFileHash = async (filePath: string) => {
  uni.showLoading({ title: '计算文件特征...' })

  return new Promise<void>((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath,
      success: async (res) => {
        fileHash.value = await generateFileHash(res.data as ArrayBuffer)
        uni.hideLoading()
        resolve()
      },
      fail: (err) => {
        uni.hideLoading()
        reject(err)
      }
    })
  })
}

// 检查并上传
const checkAndUpload = async () => {
  // 1. 检查文件是否已存在
  const [checkErr, checkResult] = await http.get<{ exists: boolean; url?: string }>(
    '/resource/oss/check',
    { hash: fileHash.value }
  )

  if (!checkErr && checkResult?.exists) {
    // 文件已存在,秒传成功
    uni.showToast({ title: '秒传成功', icon: 'success' })
    console.log('文件URL:', checkResult.url)
    return
  }

  // 2. 文件不存在,执行正常上传
  uploadProgress.value = 0

  const [uploadErr, uploadResult] = await http.upload({
    url: '/resource/oss/upload',
    filePath: fileInfo.value!.path,
    name: 'file',
    formData: {
      hash: fileHash.value
    },
    onProgressUpdate: (res) => {
      uploadProgress.value = res.progress
    }
  })

  if (uploadErr) {
    uni.showToast({ title: '上传失败', icon: 'none' })
    return
  }

  uni.showToast({ title: '上传成功', icon: 'success' })
}
</script>

```

### 本地数据加密存储

```typescript
import { encryptWithAutoKey, decryptWithParsing, encodeBase64, decodeBase64 } from '@/utils/crypto'
import CryptoJS from 'crypto-js'

/**
 * 加密存储工具
 */
class SecureStorage {
  private storageKey = 'secure_storage_key'

  /**
   * 获取或生成存储密钥
   */
  private getStorageKey(): CryptoJS.lib.WordArray {
    let keyStr = uni.getStorageSync(this.storageKey) as string

    if (!keyStr) {
      // 首次使用,生成新密钥
      const newKey = CryptoJS.lib.WordArray.random(32)
      keyStr = encodeBase64(newKey)
      uni.setStorageSync(this.storageKey, keyStr)
    }

    return decodeBase64(keyStr)
  }

  /**
   * 加密存储数据
   */
  set<T>(key: string, value: T): void {
    const storageKey = this.getStorageKey()
    const data = JSON.stringify(value)

    const encrypted = CryptoJS.AES.encrypt(data, storageKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString()

    uni.setStorageSync(`encrypted_${key}`, encrypted)
  }

  /**
   * 解密获取数据
   */
  get<T>(key: string): T | null {
    const encrypted = uni.getStorageSync(`encrypted_${key}`) as string
    if (!encrypted) return null

    try {
      const storageKey = this.getStorageKey()
      const decrypted = CryptoJS.AES.decrypt(encrypted, storageKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })

      const dataStr = decrypted.toString(CryptoJS.enc.Utf8)
      return JSON.parse(dataStr) as T
    } catch (e) {
      console.error('解密存储数据失败:', e)
      return null
    }
  }

  /**
   * 删除数据
   */
  remove(key: string): void {
    uni.removeStorageSync(`encrypted_${key}`)
  }

  /**
   * 清空所有加密数据
   */
  clear(): void {
    const keys = uni.getStorageInfoSync().keys
    keys.forEach(key => {
      if (key.startsWith('encrypted_')) {
        uni.removeStorageSync(key)
      }
    })
  }
}

export const secureStorage = new SecureStorage()

// 使用示例
interface UserCredentials {
  username: string
  password: string
}

// 存储敏感信息
secureStorage.set<UserCredentials>('credentials', {
  username: 'admin',
  password: '123456'
})

// 读取敏感信息
const credentials = secureStorage.get<UserCredentials>('credentials')
console.log('用户凭证:', credentials)

// 删除敏感信息
secureStorage.remove('credentials')
```

## 类型定义

### 完整类型定义

```typescript
import CryptoJS from 'crypto-js'

/**
 * AES 加密结果
 */
interface AesEncryptResult {
  /** 加密后的数据 */
  encryptedData: string
  /** 使用的 AES 密钥 */
  key: CryptoJS.lib.WordArray
}

/**
 * RSA 密钥配置
 */
interface RsaKeyConfig {
  /** RSA 公钥 */
  publicKey: string
  /** RSA 私钥 */
  privateKey: string
}

/**
 * 安全配置接口
 */
interface SecurityConfig {
  /** 接口加密功能开关 */
  apiEncrypt: boolean
  /** RSA 公钥 - 用于加密传输 */
  rsaPublicKey: string
  /** RSA 私钥 - 用于解密响应 */
  rsaPrivateKey: string
}

/**
 * 加密请求头
 */
interface EncryptedRequestHeader {
  /** 加密的 AES 密钥 */
  'encrypt-key': string
  [key: string]: string
}

/**
 * 哈希算法类型
 */
type HashAlgorithm = 'SHA256' | 'MD5' | 'SHA1' | 'SHA512'

/**
 * 加密模式类型
 */
type CipherMode = 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR'

/**
 * 填充方式类型
 */
type PaddingType = 'Pkcs7' | 'ZeroPadding' | 'NoPadding' | 'Iso97971' | 'Iso10126'

// ============== crypto.ts 函数类型 ==============

/**
 * 生成随机字符串
 * @returns 32位随机字符串
 */
declare function generateRandomString(): string

/**
 * 生成 AES 密钥
 * @returns AES 密钥 (WordArray 格式)
 */
declare function generateAesKey(): CryptoJS.lib.WordArray

/**
 * Base64 编码
 * @param data - 要编码的数据
 * @returns Base64 字符串
 */
declare function encodeBase64(data: CryptoJS.lib.WordArray): string

/**
 * Base64 解码
 * @param str - Base64 字符串
 * @returns 解码后的 WordArray
 */
declare function decodeBase64(str: string): CryptoJS.lib.WordArray

/**
 * AES 加密
 * @param message - 要加密的消息
 * @param aesKey - AES 密钥
 * @returns 加密后的字符串
 */
declare function encryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray
): string

/**
 * AES 解密
 * @param message - 加密的消息
 * @param aesKey - AES 密钥
 * @returns 解密后的字符串
 */
declare function decryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray
): string

/**
 * 自动生成密钥并加密
 * @param data - 要加密的数据
 * @returns 加密结果和密钥
 */
declare function encryptWithAutoKey(
  data: string | object
): AesEncryptResult

/**
 * 解密并可选解析 JSON
 * @param encryptedData - 加密的数据
 * @param key - 解密密钥
 * @param parseJson - 是否解析为 JSON
 * @returns 解密后的数据
 */
declare function decryptWithParsing(
  encryptedData: string,
  key: CryptoJS.lib.WordArray,
  parseJson?: boolean
): string | object

/**
 * 计算 SHA-256 哈希
 * @param data - 要计算哈希的数据
 * @returns 哈希值(十六进制)
 */
declare function computeSha256Hash(data: string): string

/**
 * 计算 MD5 哈希
 * @param data - 要计算哈希的数据
 * @returns 哈希值(十六进制)
 */
declare function computeMd5Hash(data: string): string

/**
 * 生成图片哈希
 * @param base64Data - 图片 Base64 数据
 * @returns 图片哈希值
 */
declare function generateImageHash(base64Data: string): string

/**
 * 生成文件哈希
 * @param file - 文件数据
 * @returns 文件哈希值
 */
declare function generateFileHash(
  file: Blob | File | ArrayBuffer
): Promise<string>

// ============== rsa.ts 函数类型 ==============

/**
 * RSA 公钥加密
 * @param txt - 要加密的文本
 * @param pubKey - 可选的自定义公钥
 * @returns 加密后的文本,失败返回 null
 */
declare function rsaEncrypt(txt: string, pubKey?: string): string | null

/**
 * RSA 私钥解密
 * @param txt - 要解密的文本
 * @param privKey - 可选的自定义私钥
 * @returns 解密后的文本,失败返回 null
 */
declare function rsaDecrypt(txt: string, privKey?: string): string | null

/**
 * 检查是否可以解密
 * @param txt - 加密的文本
 * @param privKey - 可选的私钥
 * @returns 是否可以解密
 */
declare function rsaCanDecrypt(txt: string, privKey?: string): boolean

/**
 * RSA 签名
 * @param txt - 要签名的文本
 * @param privKey - 可选的私钥
 * @returns 签名结果,失败返回 null
 */
declare function rsaSign(txt: string, privKey?: string): string | null

/**
 * RSA 验签
 * @param txt - 原始文本
 * @param signature - 签名
 * @param pubKey - 可选的公钥
 * @returns 验证结果
 */
declare function rsaVerify(
  txt: string,
  signature: string,
  pubKey?: string
): boolean
```

## 最佳实践

### 1. 密钥管理

```typescript
// ✅ 正确: 密钥通过环境变量管理
// .env.production
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK...'
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOQIBAAJBAKoR8mTr...'

// ❌ 错误: 密钥硬编码在代码中
const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK...'
```

### 2. 敏感数据必须加密

```typescript
// ✅ 正确: 敏感数据加密传输
const [err, data] = await http.encrypt().post('/auth/login', {
  username,
  password
})

// ❌ 错误: 明文传输密码
const [err, data] = await http.post('/auth/login', {
  username,
  password  // 密码明文传输,不安全!
})
```

### 3. 哈希用于完整性校验

```typescript
import { computeSha256Hash } from '@/utils/crypto'

// ✅ 正确: 使用哈希验证数据完整性
const sendData = async (data: object) => {
  const dataStr = JSON.stringify(data)
  const hash = computeSha256Hash(dataStr)

  return http.post('/api/data', {
    data: dataStr,
    hash  // 服务端可验证数据是否被篡改
  })
}

// ✅ 正确: 文件去重使用哈希
const uploadFile = async (filePath: string) => {
  const hash = await generateFileHash(file)

  // 先检查是否存在
  const [_, exists] = await http.get('/api/file/exists', { hash })
  if (exists) {
    return // 文件已存在,无需重复上传
  }

  // 执行上传
  await http.upload({ url: '/api/file/upload', filePath, name: 'file' })
}
```

### 4. 错误处理

```typescript
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

// ✅ 正确: 处理加解密失败
const encryptData = (data: string): string | null => {
  const encrypted = rsaEncrypt(data)

  if (!encrypted) {
    console.error('加密失败,请检查公钥配置')
    // 可以选择降级处理或提示用户
    return null
  }

  return encrypted
}

// ✅ 正确: 解密失败的容错处理
const decryptData = (encryptedData: string): string => {
  const decrypted = rsaDecrypt(encryptedData)

  if (!decrypted) {
    console.error('解密失败,可能是密钥不匹配')
    throw new Error('数据解密失败')
  }

  return decrypted
}
```

### 5. 避免在前端存储私钥

```typescript
// ⚠️ 注意: 前端存储私钥存在风险
// 仅在必要场景(如响应解密)使用

// 生产环境建议:
// 1. 敏感操作放在服务端
// 2. 使用 HTTPS 保护传输
// 3. 私钥定期轮换
// 4. 考虑使用 Web Crypto API(浏览器原生加密)
```

## 常见问题

### 1. 加密数据乱码或解密失败

**问题原因:**
- 密钥不匹配
- 编码格式错误
- 加密模式或填充方式不一致

**解决方案:**

```typescript
// 确保加解密使用相同的配置
const encryptConfig = {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
}

// 加密
const encrypted = CryptoJS.AES.encrypt(message, key, encryptConfig)

// 解密使用相同配置
const decrypted = CryptoJS.AES.decrypt(encrypted, key, encryptConfig)
```

### 2. RSA 加密长度限制

**问题原因:**
- RSA 加密有长度限制(密钥长度/8 - 11 字节)
- 1024 位密钥最多加密 117 字节

**解决方案:**

```typescript
// ✅ 使用混合加密
const encryptLargeData = (data: string) => {
  // 1. 生成随机 AES 密钥
  const aesKey = generateAesKey()

  // 2. 使用 AES 加密大数据
  const encryptedData = encryptWithAes(data, aesKey)

  // 3. 使用 RSA 加密 AES 密钥(密钥很短)
  const encryptedKey = rsaEncrypt(encodeBase64(aesKey))

  return {
    data: encryptedData,
    key: encryptedKey
  }
}
```

### 3. 环境变量未生效

**问题原因:**
- 环境变量格式错误
- 未正确读取环境变量
- 开发/生产环境配置不同

**解决方案:**

```typescript
// 检查环境变量
console.log('API 加密开关:', import.meta.env.VITE_APP_API_ENCRYPT)
console.log('公钥长度:', import.meta.env.VITE_APP_RSA_PUBLIC_KEY?.length)

// 确保布尔值正确判断
const apiEncrypt = import.meta.env.VITE_APP_API_ENCRYPT === 'true'

// 检查 systemConfig 配置
import { SystemConfig } from '@/systemConfig'
console.log('安全配置:', SystemConfig.security)
```

### 4. 小程序环境兼容

**问题原因:**
- 小程序不支持某些 Web API
- crypto-js 在小程序中的兼容性问题

**解决方案:**

```typescript
// 使用条件编译处理平台差异
// #ifdef MP-WEIXIN
// 微信小程序特殊处理
// #endif

// #ifdef H5
// H5 环境特殊处理
// #endif

// 确保依赖正确引入
import CryptoJS from 'crypto-js'
// 而不是 import { AES } from 'crypto-js'
```

### 5. 性能优化

**问题原因:**
- 大文件哈希计算耗时
- 频繁加解密影响性能

**解决方案:**

```typescript
// 1. 大文件分块计算哈希
const computeFileHashChunked = async (filePath: string): Promise<string> => {
  const CHUNK_SIZE = 1024 * 1024 // 1MB

  return new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager()
    const fileInfo = fs.getFileInfo({ filePath })

    // 使用增量哈希
    const hasher = CryptoJS.algo.SHA256.create()

    let offset = 0
    const readChunk = () => {
      fs.readFile({
        filePath,
        position: offset,
        length: CHUNK_SIZE,
        success: (res) => {
          const chunk = CryptoJS.lib.WordArray.create(res.data as ArrayBuffer)
          hasher.update(chunk)

          offset += CHUNK_SIZE
          if (offset < fileInfo.size) {
            readChunk()
          } else {
            resolve(hasher.finalize().toString())
          }
        },
        fail: reject
      })
    }

    readChunk()
  })
}

// 2. 缓存加密结果
const encryptCache = new Map<string, string>()

const cachedEncrypt = (data: string): string => {
  const cacheKey = computeMd5Hash(data)

  if (encryptCache.has(cacheKey)) {
    return encryptCache.get(cacheKey)!
  }

  const encrypted = encryptWithAes(data, getGlobalKey())
  encryptCache.set(cacheKey, encrypted)

  return encrypted
}
```

### 6. 调试加密问题

```typescript
// 调试工具函数
const debugEncryption = (originalData: string) => {
  console.group('加密调试信息')

  // 1. 生成密钥
  const aesKey = generateAesKey()
  console.log('AES 密钥 (Base64):', encodeBase64(aesKey))

  // 2. 加密
  const encrypted = encryptWithAes(originalData, aesKey)
  console.log('加密结果:', encrypted)
  console.log('加密结果长度:', encrypted.length)

  // 3. 解密验证
  const decrypted = decryptWithAes(encrypted, aesKey)
  console.log('解密结果:', decrypted)
  console.log('是否一致:', originalData === decrypted)

  // 4. RSA 加密密钥
  const rsaEncryptedKey = rsaEncrypt(encodeBase64(aesKey))
  console.log('RSA 加密密钥:', rsaEncryptedKey)

  // 5. RSA 解密密钥验证
  const rsaDecryptedKey = rsaDecrypt(rsaEncryptedKey!)
  console.log('RSA 解密密钥:', rsaDecryptedKey)

  console.groupEnd()
}

// 使用
debugEncryption('测试数据')
```

