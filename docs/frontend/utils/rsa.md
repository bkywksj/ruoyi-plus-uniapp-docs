# RSA加密工具 (rsa.ts)

基于 JSEncrypt 库的 RSA 加密解密工具，提供完整的 RSA 加密、解密、签名和验证功能，是前端安全通信的核心组件。

## 📖 概述

RSA加密工具是一个封装了 JSEncrypt 库的安全工具模块，为前端应用提供非对称加密能力。该工具在用户登录、敏感数据传输、数字签名等场景中发挥关键作用，确保数据在传输过程中的机密性和完整性。

### 核心功能

| 功能分类 | 函数名 | 说明 |
|---------|--------|------|
| **加密解密** | `rsaEncrypt` | 使用RSA公钥加密文本 |
| **加密解密** | `rsaDecrypt` | 使用RSA私钥解密文本 |
| **数据验证** | `rsaCanDecrypt` | 检查文本是否可以使用指定密钥解密 |
| **数字签名** | `rsaSign` | 使用RSA私钥签名文本 |
| **数字签名** | `rsaVerify` | 验证RSA签名 |
| **实例管理** | `createEncryptor` | 创建JSEncrypt加密器实例 |

### 设计特点

- **默认密钥配置**：从 `SystemConfig` 自动获取默认密钥对
- **灵活密钥切换**：支持运行时传入自定义密钥
- **错误处理**：所有操作都有完善的异常捕获机制
- **空值安全**：自动处理空值输入，返回 null 而非抛出异常
- **签名算法**：使用 SHA256 哈希算法进行数字签名

## 🔐 RSA算法基础

### 非对称加密原理

RSA（Rivest-Shamir-Adleman）是一种非对称加密算法，使用一对密钥进行加密和解密：

```
┌─────────────────────────────────────────────────────────────┐
│                    RSA 加密流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  发送方                                     接收方           │
│  ┌─────────┐                              ┌─────────┐      │
│  │ 明文数据 │                              │ 密钥对  │      │
│  └────┬────┘                              │ ┌─────┐ │      │
│       │                                   │ │公钥 │◄┼─分发──┐
│       ▼                                   │ ├─────┤ │      │
│  ┌─────────┐      ┌────────────┐         │ │私钥 │ │      │
│  │ 公钥加密 │─────►│ 密文传输   │         │ └─────┘ │      │
│  └─────────┘      └─────┬──────┘         └────┬────┘      │
│                         │                      │           │
│                         ▼                      ▼           │
│                    ┌─────────┐           ┌─────────┐      │
│                    │ 接收密文 │──────────►│ 私钥解密 │      │
│                    └─────────┘           └────┬────┘      │
│                                               │            │
│                                               ▼            │
│                                          ┌─────────┐      │
│                                          │ 明文数据 │      │
│                                          └─────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 密钥对特性

| 密钥类型 | 用途 | 保管方式 | 分发策略 |
|---------|------|---------|---------|
| **公钥** | 加密数据、验证签名 | 可公开 | 分发给所有通信方 |
| **私钥** | 解密数据、创建签名 | 严格保密 | 仅持有者可访问 |

### 与对称加密对比

| 特性 | RSA（非对称） | AES（对称） |
|-----|--------------|------------|
| 密钥数量 | 公钥+私钥 | 单一密钥 |
| 加密速度 | 较慢 | 较快 |
| 密钥分发 | 安全（公钥可公开） | 困难（需安全通道） |
| 数据长度限制 | 有限制 | 无限制 |
| 典型用途 | 密钥交换、签名 | 大数据加密 |

## 🔧 安装依赖

使用前需要安装 JSEncrypt 库：

```bash
# 使用 npm
npm install jsencrypt

# 使用 yarn
yarn add jsencrypt

# 使用 pnpm
pnpm add jsencrypt
```

### TypeScript 类型支持

JSEncrypt 已包含 TypeScript 类型定义，无需额外安装 `@types` 包：

```typescript
// 类型自动可用
import JSEncrypt from 'jsencrypt'

const encryptor = new JSEncrypt()
// 完整的类型提示支持
```

## ⚙️ 配置说明

### 系统配置

工具从系统配置中获取默认的RSA密钥：

```typescript
import { SystemConfig } from '@/systemConfig'

// 默认密钥配置
const defaultPublicKey = SystemConfig.security.rsaPublicKey
const defaultPrivateKey = SystemConfig.security.rsaPrivateKey
```

### systemConfig.ts 配置示例

```typescript
// systemConfig.ts
export const SystemConfig = {
  // 应用配置
  app: {
    id: 'ruoyi-plus',
    name: 'RuoYi Plus',
    version: '5.0.0'
  },

  // 安全配置
  security: {
    // RSA公钥（用于加密敏感数据）
    rsaPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4f5wg5l2hKsTeNem/V41
fGnJm6gOdrj8ym3rFkEjWT2btNjcIpML4E4VlDx9oN9h2jbNVgU0pVXeJpZhqTny
...
-----END PUBLIC KEY-----`,

    // RSA私钥（通常不在前端配置，此处仅用于演示）
    rsaPrivateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDh/nCDmXaEqxN4
16b9XjV8acmbqA52uPzKbesWQSNZPZu02NwikwvgThWUPH2g32HaNs1WBTSlVd4m
...
-----END PRIVATE KEY-----`,

    // 加密相关配置
    encryptEnabled: true,        // 是否启用加密
    encryptHeader: 'X-Encrypted' // 加密标识请求头
  }
}
```

### 环境变量配置

推荐使用环境变量管理密钥：

```bash
# .env.development
VITE_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq..."
VITE_RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADAN..."

# .env.production
# 生产环境密钥应该与开发环境不同
VITE_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nPRODUCTION_KEY..."
```

```typescript
// systemConfig.ts 使用环境变量
export const SystemConfig = {
  security: {
    rsaPublicKey: import.meta.env.VITE_RSA_PUBLIC_KEY,
    rsaPrivateKey: import.meta.env.VITE_RSA_PRIVATE_KEY
  }
}
```

## 🔐 核心功能

### rsaEncrypt

使用RSA公钥加密文本。

```typescript
rsaEncrypt(txt: string, pubKey?: string): string | null
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `txt` | `string` | 是 | 要加密的文本 |
| `pubKey` | `string` | 否 | 自定义公钥，不提供则使用默认公钥 |

**返回值：**
- `string | null` - 加密后的Base64编码文本，失败返回null

**实现原理：**
```typescript
export const rsaEncrypt = (txt: string, pubKey?: string): string | null => {
  try {
    if (!txt) {
      return null
    }

    const encryptor = createEncryptor()
    const keyToUse = pubKey || defaultPublicKey

    encryptor.setPublicKey(keyToUse)
    return encryptor.encrypt(txt)
  } catch (err) {
    console.error('RSA加密失败:', err)
    return null
  }
}
```

**使用示例：**

```typescript
import { rsaEncrypt } from '@/utils/rsa'

// 1. 使用默认公钥加密
const encrypted = rsaEncrypt('Hello World')
if (encrypted) {
  console.log('加密成功:', encrypted)
  // 输出类似: "KxR7G2fhD3..."（Base64编码的密文）
} else {
  console.log('加密失败')
}

// 2. 使用自定义公钥加密
const customPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`

const encrypted2 = rsaEncrypt('Secret Message', customPublicKey)

// 3. 加密JSON数据
const userData = { userId: 123, token: 'abc123' }
const encryptedData = rsaEncrypt(JSON.stringify(userData))

// 4. 加密敏感表单字段
const formData = {
  username: 'admin',
  password: rsaEncrypt('mypassword123')
}
```

### rsaDecrypt

使用RSA私钥解密文本。

```typescript
rsaDecrypt(txt: string, privKey?: string): string | null
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `txt` | `string` | 是 | 要解密的Base64编码密文 |
| `privKey` | `string` | 否 | 自定义私钥，不提供则使用默认私钥 |

**返回值：**
- `string | null` - 解密后的明文，失败返回null

**实现原理：**
```typescript
export const rsaDecrypt = (txt: string, privKey?: string): string | null => {
  try {
    if (!txt) {
      return null
    }

    const encryptor = createEncryptor()
    const keyToUse = privKey || defaultPrivateKey

    encryptor.setPrivateKey(keyToUse)
    return encryptor.decrypt(txt)
  } catch (err) {
    console.error('RSA解密失败:', err)
    return null
  }
}
```

**使用示例：**

```typescript
import { rsaDecrypt } from '@/utils/rsa'

// 1. 使用默认私钥解密
const decrypted = rsaDecrypt(encryptedText)
if (decrypted) {
  console.log('解密成功:', decrypted)
} else {
  console.log('解密失败')
}

// 2. 使用自定义私钥解密
const customPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDh...
-----END PRIVATE KEY-----`

const decrypted2 = rsaDecrypt(encryptedText, customPrivateKey)

// 3. 解密JSON数据
const decryptedJson = rsaDecrypt(encryptedJsonData)
if (decryptedJson) {
  const data = JSON.parse(decryptedJson)
  console.log('用户ID:', data.userId)
}

// 4. 解密配置信息
const storedConfig = localStorage.getItem('encryptedConfig')
if (storedConfig) {
  const config = rsaDecrypt(storedConfig)
  if (config) {
    applyConfig(JSON.parse(config))
  }
}
```

### rsaCanDecrypt

检查文本是否可以使用指定的私钥解密。

```typescript
rsaCanDecrypt(txt: string, privKey?: string): boolean
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `txt` | `string` | 是 | 要检查的加密文本 |
| `privKey` | `string` | 否 | 用于检查的私钥 |

**返回值：**
- `boolean` - 是否可以成功解密

**实现原理：**
```typescript
export const rsaCanDecrypt = (txt: string, privKey?: string): boolean => {
  return rsaDecrypt(txt, privKey) !== null
}
```

**使用示例：**

```typescript
import { rsaCanDecrypt, rsaDecrypt } from '@/utils/rsa'

// 1. 验证加密文本是否有效
if (rsaCanDecrypt(encryptedData)) {
  console.log('数据可以解密')
  const result = rsaDecrypt(encryptedData)
  processData(result)
} else {
  console.log('数据无法解密，可能已损坏或密钥不匹配')
  handleDecryptionError()
}

// 2. 验证特定私钥是否匹配
const userPrivateKey = getUserPrivateKey()
const isValidKey = rsaCanDecrypt(encryptedData, userPrivateKey)
if (!isValidKey) {
  throw new Error('私钥不匹配，无法解密数据')
}

// 3. 批量验证数据
const encryptedItems = ['data1', 'data2', 'data3']
const validItems = encryptedItems.filter(item => rsaCanDecrypt(item))
console.log(`有效数据: ${validItems.length}/${encryptedItems.length}`)

// 4. 多密钥尝试解密
const tryDecryptWithKeys = (data: string, keys: string[]): string | null => {
  for (const key of keys) {
    if (rsaCanDecrypt(data, key)) {
      return rsaDecrypt(data, key)
    }
  }
  return null
}
```

### rsaSign

使用RSA私钥签名文本。

```typescript
rsaSign(txt: string, privKey?: string): string | null
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `txt` | `string` | 是 | 要签名的文本 |
| `privKey` | `string` | 否 | 用于签名的私钥 |

**返回值：**
- `string | null` - 签名结果（Base64编码），失败返回null

**实现原理：**
```typescript
export const rsaSign = (txt: string, privKey?: string): string | null => {
  try {
    const encryptor = createEncryptor()
    const keyToUse = privKey || defaultPrivateKey

    encryptor.setPrivateKey(keyToUse)
    // 使用SHA256哈希算法
    return encryptor.sign(txt, CryptoJS.SHA256, 'sha256')
  } catch (err) {
    console.error('RSA签名失败:', err)
    return null
  }
}
```

**数字签名流程：**
```
┌─────────────────────────────────────────────────────────────┐
│                    数字签名流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  签名方                                                     │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │ 原始数据  │────►│ SHA256   │────►│ 私钥加密 │           │
│  └──────────┘     │ 哈希计算 │     └────┬─────┘           │
│                   └──────────┘          │                  │
│                                         ▼                  │
│                                    ┌──────────┐           │
│                                    │ 数字签名 │           │
│                                    └────┬─────┘           │
│                                         │                  │
│  验证方                                  │                  │
│  ┌──────────┐     ┌──────────┐         │                  │
│  │ 原始数据  │────►│ SHA256   │         │                  │
│  └──────────┘     │ 哈希计算 │         │                  │
│                   └────┬─────┘         │                  │
│                        │               │                  │
│                        ▼               ▼                  │
│                   ┌──────────┐    ┌──────────┐           │
│                   │ 哈希值A  │    │ 公钥解密 │           │
│                   └────┬─────┘    └────┬─────┘           │
│                        │               │                  │
│                        ▼               ▼                  │
│                   ┌──────────────────────────┐           │
│                   │     比较哈希值是否相等     │           │
│                   │   相等=验证通过 不等=篡改  │           │
│                   └──────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

**使用示例：**

```typescript
import { rsaSign } from '@/utils/rsa'

// 1. 基本签名
const message = 'Important document content'
const signature = rsaSign(message)
if (signature) {
  console.log('签名生成成功:', signature)
}

// 2. 创建带签名的数据包
const createSignedPacket = (data: any) => {
  const message = JSON.stringify(data)
  const signature = rsaSign(message)

  if (!signature) {
    throw new Error('签名创建失败')
  }

  return {
    data: message,
    signature: signature,
    timestamp: Date.now(),
    algorithm: 'RSA-SHA256'
  }
}

// 3. API请求签名
const signedRequest = {
  method: 'POST',
  url: '/api/transfer',
  body: { from: 'A', to: 'B', amount: 1000 },
  signature: rsaSign(JSON.stringify({ from: 'A', to: 'B', amount: 1000 })),
  timestamp: Date.now()
}

// 4. 交易签名
interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: number
}

const signTransaction = (tx: Transaction): string | null => {
  const txString = `${tx.id}|${tx.from}|${tx.to}|${tx.amount}|${tx.timestamp}`
  return rsaSign(txString)
}
```

### rsaVerify

验证RSA签名。

```typescript
rsaVerify(txt: string, signature: string, pubKey?: string): boolean
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `txt` | `string` | 是 | 原始文本 |
| `signature` | `string` | 是 | 签名值 |
| `pubKey` | `string` | 否 | 用于验证的公钥 |

**返回值：**
- `boolean` - 验证结果，true表示签名有效

**实现原理：**
```typescript
export const rsaVerify = (txt: string, signature: string, pubKey?: string): boolean => {
  try {
    const encryptor = createEncryptor()
    const keyToUse = pubKey || defaultPublicKey

    encryptor.setPublicKey(keyToUse)
    return encryptor.verify(txt, signature, CryptoJS.SHA256)
  } catch (err) {
    console.error('RSA签名验证失败:', err)
    return false
  }
}
```

**使用示例：**

```typescript
import { rsaVerify } from '@/utils/rsa'

// 1. 基本验证
const isValid = rsaVerify(originalMessage, signature)
if (isValid) {
  console.log('签名验证成功，数据可信')
} else {
  console.log('签名验证失败，数据可能被篡改')
}

// 2. 验证接收到的数据包
const verifyPacket = (packet: any): boolean => {
  // 验证签名
  const isValid = rsaVerify(packet.data, packet.signature)
  if (!isValid) {
    console.error('数据包签名验证失败')
    return false
  }

  // 检查时间戳（防重放攻击）
  const age = Date.now() - packet.timestamp
  if (age > 5 * 60 * 1000) { // 5分钟过期
    console.error('数据包已过期')
    return false
  }

  return true
}

// 3. 验证API响应
const verifyApiResponse = (response: any) => {
  const { data, signature, serverPublicKey } = response

  // 使用服务器公钥验证
  if (!rsaVerify(JSON.stringify(data), signature, serverPublicKey)) {
    throw new Error('API响应签名验证失败')
  }

  return data
}

// 4. 验证交易
const verifyTransaction = (tx: Transaction, signature: string, senderPublicKey: string): boolean => {
  const txString = `${tx.id}|${tx.from}|${tx.to}|${tx.amount}|${tx.timestamp}`
  return rsaVerify(txString, signature, senderPublicKey)
}
```

### createEncryptor

创建JSEncrypt加密器实例，这是一个内部工具函数。

```typescript
const createEncryptor = (): JSEncrypt
```

**返回值：**
- `JSEncrypt` - JSEncrypt实例

**实现原理：**
```typescript
const createEncryptor = (): JSEncrypt => {
  return new JSEncrypt()
}
```

**使用示例：**

```typescript
// 内部使用，创建新的加密器实例
const encryptor = createEncryptor()

// 设置密钥
encryptor.setPublicKey(publicKey)
encryptor.setPrivateKey(privateKey)

// 执行加密/解密操作
const encrypted = encryptor.encrypt(plainText)
const decrypted = encryptor.decrypt(cipherText)
```

## 🏗️ 实际应用场景

### 1. 用户登录加密

在用户登录时加密密码，防止明文传输：

```typescript
import { rsaEncrypt } from '@/utils/rsa'

// 登录表单数据
interface LoginForm {
  username: string
  password: string
  captcha?: string
  rememberMe?: boolean
}

// 加密登录数据
const encryptLoginData = (form: LoginForm) => {
  const encryptedPassword = rsaEncrypt(form.password)
  if (!encryptedPassword) {
    throw new Error('密码加密失败')
  }

  return {
    username: form.username,
    password: encryptedPassword,
    captcha: form.captcha,
    rememberMe: form.rememberMe
  }
}

// 登录请求
const login = async (form: LoginForm) => {
  try {
    const encryptedData = encryptLoginData(form)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Encrypted': 'RSA'
      },
      body: JSON.stringify(encryptedData)
    })

    if (!response.ok) {
      throw new Error('登录失败')
    }

    return await response.json()
  } catch (error) {
    console.error('登录请求失败:', error)
    throw error
  }
}

// 使用示例
const handleLogin = async () => {
  const form: LoginForm = {
    username: 'admin',
    password: 'mypassword123',
    captcha: '1234',
    rememberMe: true
  }

  const result = await login(form)
  console.log('登录成功:', result)
}
```

### 2. 敏感配置加密存储

加密存储API密钥等敏感配置：

```typescript
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

// 敏感配置接口
interface SensitiveConfig {
  apiKey: string
  secretToken: string
  databaseUrl: string
  thirdPartyCredentials: {
    key: string
    secret: string
  }
}

// 加密配置
const encryptConfig = (config: SensitiveConfig): Record<string, string | null> => {
  return {
    apiKey: rsaEncrypt(config.apiKey),
    secretToken: rsaEncrypt(config.secretToken),
    databaseUrl: rsaEncrypt(config.databaseUrl),
    thirdPartyCredentials: rsaEncrypt(JSON.stringify(config.thirdPartyCredentials))
  }
}

// 解密配置
const decryptConfig = (encryptedConfig: Record<string, string>): SensitiveConfig | null => {
  try {
    const apiKey = rsaDecrypt(encryptedConfig.apiKey)
    const secretToken = rsaDecrypt(encryptedConfig.secretToken)
    const databaseUrl = rsaDecrypt(encryptedConfig.databaseUrl)
    const thirdPartyCredentials = rsaDecrypt(encryptedConfig.thirdPartyCredentials)

    if (!apiKey || !secretToken || !databaseUrl || !thirdPartyCredentials) {
      return null
    }

    return {
      apiKey,
      secretToken,
      databaseUrl,
      thirdPartyCredentials: JSON.parse(thirdPartyCredentials)
    }
  } catch (error) {
    console.error('配置解密失败:', error)
    return null
  }
}

// 存储加密配置
const saveConfig = (config: SensitiveConfig) => {
  const encryptedConfig = encryptConfig(config)
  localStorage.setItem('appConfig', JSON.stringify(encryptedConfig))
}

// 加载解密配置
const loadConfig = (): SensitiveConfig | null => {
  const stored = localStorage.getItem('appConfig')
  if (!stored) return null

  try {
    const encryptedConfig = JSON.parse(stored)
    return decryptConfig(encryptedConfig)
  } catch {
    return null
  }
}
```

### 3. 数据完整性验证

使用数字签名确保数据完整性：

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'

// 数据包接口
interface SignedPacket<T> {
  data: T
  signature: string
  timestamp: number
  nonce: string
}

// 生成随机 nonce
const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

// 创建签名数据包
const createSignedPacket = <T>(data: T): SignedPacket<T> | null => {
  const timestamp = Date.now()
  const nonce = generateNonce()

  // 构建待签名的字符串
  const signaturePayload = JSON.stringify({
    data,
    timestamp,
    nonce
  })

  const signature = rsaSign(signaturePayload)
  if (!signature) {
    console.error('创建签名失败')
    return null
  }

  return {
    data,
    signature,
    timestamp,
    nonce
  }
}

// 验证签名数据包
const verifySignedPacket = <T>(
  packet: SignedPacket<T>,
  options: {
    maxAge?: number  // 最大有效期（毫秒）
    publicKey?: string
  } = {}
): { valid: boolean; error?: string } => {
  const { maxAge = 5 * 60 * 1000, publicKey } = options

  // 检查时间戳
  const age = Date.now() - packet.timestamp
  if (age > maxAge) {
    return { valid: false, error: '数据包已过期' }
  }

  // 重建签名载荷
  const signaturePayload = JSON.stringify({
    data: packet.data,
    timestamp: packet.timestamp,
    nonce: packet.nonce
  })

  // 验证签名
  const isValid = rsaVerify(signaturePayload, packet.signature, publicKey)
  if (!isValid) {
    return { valid: false, error: '签名验证失败' }
  }

  return { valid: true }
}

// 使用示例
const sendSecureData = async () => {
  const data = { userId: 123, action: 'transfer', amount: 1000 }
  const packet = createSignedPacket(data)

  if (!packet) {
    throw new Error('创建数据包失败')
  }

  const response = await fetch('/api/secure/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet)
  })

  return response.json()
}

// 接收并验证数据
const receiveSecureData = (packet: SignedPacket<any>) => {
  const result = verifySignedPacket(packet, { maxAge: 60000 })

  if (!result.valid) {
    throw new Error(`数据验证失败: ${result.error}`)
  }

  return packet.data
}
```

### 4. 文件加密传输

对小型文件内容进行加密传输：

```typescript
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

// 文件加密结果
interface EncryptedFile {
  filename: string
  mimeType: string
  encryptedContent: string
  size: number
  checksum: string
}

// 计算简单校验和
const calculateChecksum = (content: string): string => {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// 加密文件内容
const encryptFileContent = async (file: File): Promise<EncryptedFile | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string

      // RSA有长度限制，只适合小文件（约190字节）
      // 对于大文件，应使用混合加密（RSA+AES）
      if (content.length > 190) {
        console.error('文件过大，请使用混合加密方案')
        resolve(null)
        return
      }

      const encrypted = rsaEncrypt(content)
      if (!encrypted) {
        resolve(null)
        return
      }

      resolve({
        filename: file.name,
        mimeType: file.type,
        encryptedContent: encrypted,
        size: file.size,
        checksum: calculateChecksum(content)
      })
    }

    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}

// 解密文件内容
const decryptFileContent = (encryptedFile: EncryptedFile): string | null => {
  const decrypted = rsaDecrypt(encryptedFile.encryptedContent)
  if (!decrypted) {
    return null
  }

  // 验证校验和
  const checksum = calculateChecksum(decrypted)
  if (checksum !== encryptedFile.checksum) {
    console.error('文件校验和不匹配，数据可能已损坏')
    return null
  }

  return decrypted
}

// 使用示例
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const encryptedFile = await encryptFileContent(file)
  if (!encryptedFile) {
    console.error('文件加密失败')
    return
  }

  // 上传加密后的文件数据
  await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encryptedFile)
  })
}
```

### 5. API接口安全

为API请求添加加密和签名：

```typescript
import { rsaEncrypt, rsaSign, rsaVerify } from '@/utils/rsa'

// 安全请求配置
interface SecureRequestConfig {
  encryptFields?: string[]  // 需要加密的字段
  signRequest?: boolean     // 是否签名请求
  verifyResponse?: boolean  // 是否验证响应签名
}

// 安全API客户端
class SecureApiClient {
  private baseUrl: string
  private defaultConfig: SecureRequestConfig

  constructor(baseUrl: string, config: SecureRequestConfig = {}) {
    this.baseUrl = baseUrl
    this.defaultConfig = {
      encryptFields: ['password', 'token', 'apiKey', 'secret'],
      signRequest: true,
      verifyResponse: true,
      ...config
    }
  }

  // 加密请求数据
  private encryptRequestData(data: Record<string, any>): Record<string, any> {
    const encryptedData = { ...data }
    const fields = this.defaultConfig.encryptFields || []

    for (const field of fields) {
      if (encryptedData[field]) {
        const encrypted = rsaEncrypt(String(encryptedData[field]))
        if (encrypted) {
          encryptedData[field] = encrypted
        }
      }
    }

    return encryptedData
  }

  // 签名请求
  private signRequest(method: string, url: string, body: any): string | null {
    const signaturePayload = JSON.stringify({
      method,
      url,
      body,
      timestamp: Date.now()
    })
    return rsaSign(signaturePayload)
  }

  // 发送安全请求
  async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, any>,
    config?: SecureRequestConfig
  ): Promise<T> {
    const mergedConfig = { ...this.defaultConfig, ...config }
    const url = `${this.baseUrl}${endpoint}`

    // 加密数据
    let processedData = data
    if (data && mergedConfig.encryptFields?.length) {
      processedData = this.encryptRequestData(data)
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // 添加签名
    if (mergedConfig.signRequest && processedData) {
      const signature = this.signRequest(method, endpoint, processedData)
      if (signature) {
        headers['X-Request-Signature'] = signature
        headers['X-Request-Timestamp'] = String(Date.now())
      }
    }

    // 发送请求
    const response = await fetch(url, {
      method,
      headers,
      body: processedData ? JSON.stringify(processedData) : undefined
    })

    const responseData = await response.json()

    // 验证响应签名
    if (mergedConfig.verifyResponse && responseData.signature) {
      const isValid = rsaVerify(
        JSON.stringify(responseData.data),
        responseData.signature
      )
      if (!isValid) {
        throw new Error('响应签名验证失败')
      }
    }

    return responseData.data || responseData
  }

  // 便捷方法
  get<T>(endpoint: string): Promise<T> {
    return this.request('GET', endpoint)
  }

  post<T>(endpoint: string, data: Record<string, any>): Promise<T> {
    return this.request('POST', endpoint, data)
  }

  put<T>(endpoint: string, data: Record<string, any>): Promise<T> {
    return this.request('PUT', endpoint, data)
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request('DELETE', endpoint)
  }
}

// 使用示例
const api = new SecureApiClient('/api', {
  encryptFields: ['password', 'creditCard', 'ssn'],
  signRequest: true
})

// 安全的用户注册
const registerUser = async (userData: {
  username: string
  password: string
  email: string
}) => {
  return api.post('/users/register', userData)
  // password 会被自动加密
}
```

## 🔄 混合加密方案

RSA有数据长度限制，对于大数据应使用RSA+AES混合加密：

```typescript
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

// AES密钥生成（简化示例）
const generateAESKey = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// 混合加密结果
interface HybridEncryptResult {
  encryptedKey: string    // RSA加密的AES密钥
  encryptedData: string   // AES加密的数据
  iv: string              // 初始化向量
}

// 混合加密
const hybridEncrypt = async (data: string): Promise<HybridEncryptResult | null> => {
  try {
    // 1. 生成随机AES密钥
    const aesKey = generateAESKey()

    // 2. 使用RSA加密AES密钥
    const encryptedKey = rsaEncrypt(aesKey)
    if (!encryptedKey) {
      throw new Error('RSA加密密钥失败')
    }

    // 3. 使用AES加密数据（这里使用Web Crypto API）
    const encoder = new TextEncoder()
    const keyBuffer = encoder.encode(aesKey).slice(0, 32)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoder.encode(data)
    )

    // 转换为Base64
    const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
    const ivString = btoa(String.fromCharCode(...iv))

    return {
      encryptedKey,
      encryptedData,
      iv: ivString
    }
  } catch (error) {
    console.error('混合加密失败:', error)
    return null
  }
}

// 混合解密
const hybridDecrypt = async (encrypted: HybridEncryptResult): Promise<string | null> => {
  try {
    // 1. 使用RSA解密AES密钥
    const aesKey = rsaDecrypt(encrypted.encryptedKey)
    if (!aesKey) {
      throw new Error('RSA解密密钥失败')
    }

    // 2. 解码数据和IV
    const encryptedData = Uint8Array.from(atob(encrypted.encryptedData), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0))

    // 3. 使用AES解密数据
    const encoder = new TextEncoder()
    const keyBuffer = encoder.encode(aesKey).slice(0, 32)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    )

    return new TextDecoder().decode(decryptedBuffer)
  } catch (error) {
    console.error('混合解密失败:', error)
    return null
  }
}

// 使用示例
const encryptLargeData = async () => {
  const largeData = JSON.stringify({
    users: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`
    }))
  })

  console.log('原始数据大小:', largeData.length, '字节')

  const encrypted = await hybridEncrypt(largeData)
  if (encrypted) {
    console.log('加密成功')

    const decrypted = await hybridDecrypt(encrypted)
    console.log('解密成功:', decrypted === largeData)
  }
}
```

## 🔑 密钥管理最佳实践

### 1. 密钥格式规范

```typescript
// PEM格式公钥
const publicKeyPEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4f5wg5l2hKsTeNem/V41
fGnJm6gOdrj8ym3rFkEjWT2btNjcIpML4E4VlDx9oN9h2jbNVgU0pVXeJpZhqTny
...（省略中间内容）...
wQIDAQAB
-----END PUBLIC KEY-----`

// PEM格式私钥
const privateKeyPEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDh/nCDmXaEqxN4
16b9XjV8acmbqA52uPzKbesWQSNZPZu02NwikwvgThWUPH2g32HaNs1WBTSlVd4m
...（省略中间内容）...
aUPbXl2G1
-----END PRIVATE KEY-----`

// 密钥验证
const validateKeyFormat = (key: string, type: 'public' | 'private'): boolean => {
  if (type === 'public') {
    return key.includes('-----BEGIN PUBLIC KEY-----') &&
           key.includes('-----END PUBLIC KEY-----')
  }
  return key.includes('-----BEGIN PRIVATE KEY-----') &&
         key.includes('-----END PRIVATE KEY-----')
}
```

### 2. 密钥轮换策略

```typescript
// 密钥版本管理
interface KeyVersion {
  version: string
  publicKey: string
  privateKey?: string
  createdAt: number
  expiresAt: number
  status: 'active' | 'deprecated' | 'expired'
}

class KeyManager {
  private keys: Map<string, KeyVersion> = new Map()
  private currentVersion: string = 'v1'

  // 添加密钥版本
  addKeyVersion(version: string, publicKey: string, privateKey?: string, validDays: number = 365) {
    const now = Date.now()
    this.keys.set(version, {
      version,
      publicKey,
      privateKey,
      createdAt: now,
      expiresAt: now + validDays * 24 * 60 * 60 * 1000,
      status: 'active'
    })
  }

  // 获取当前活跃的公钥
  getCurrentPublicKey(): string | null {
    const key = this.keys.get(this.currentVersion)
    return key?.publicKey || null
  }

  // 获取指定版本的密钥
  getKeyByVersion(version: string): KeyVersion | null {
    return this.keys.get(version) || null
  }

  // 轮换到新版本
  rotateToVersion(newVersion: string) {
    const oldVersion = this.currentVersion
    this.currentVersion = newVersion

    // 标记旧版本为废弃
    const oldKey = this.keys.get(oldVersion)
    if (oldKey) {
      oldKey.status = 'deprecated'
    }
  }

  // 检查并清理过期密钥
  cleanupExpiredKeys() {
    const now = Date.now()
    for (const [version, key] of this.keys) {
      if (key.expiresAt < now) {
        key.status = 'expired'
        // 可选：从内存中移除
        // this.keys.delete(version)
      }
    }
  }

  // 使用版本化加密
  encryptWithVersion(text: string): { data: string; version: string } | null {
    const key = this.keys.get(this.currentVersion)
    if (!key || key.status !== 'active') {
      return null
    }

    const encrypted = rsaEncrypt(text, key.publicKey)
    if (!encrypted) {
      return null
    }

    return {
      data: encrypted,
      version: this.currentVersion
    }
  }

  // 使用版本化解密
  decryptWithVersion(encrypted: { data: string; version: string }): string | null {
    const key = this.keys.get(encrypted.version)
    if (!key || !key.privateKey) {
      return null
    }

    return rsaDecrypt(encrypted.data, key.privateKey)
  }
}

// 使用示例
const keyManager = new KeyManager()

// 初始化密钥
keyManager.addKeyVersion('v1', publicKeyV1, privateKeyV1, 365)
keyManager.addKeyVersion('v2', publicKeyV2, privateKeyV2, 365)

// 轮换密钥
keyManager.rotateToVersion('v2')

// 加密（自动使用最新版本）
const encrypted = keyManager.encryptWithVersion('sensitive data')

// 解密（根据版本选择密钥）
const decrypted = keyManager.decryptWithVersion(encrypted!)
```

### 3. 安全存储建议

```typescript
// 密钥存储最佳实践
const securityGuidelines = {
  // 前端存储
  frontend: {
    publicKey: {
      where: '环境变量或配置文件',
      example: 'import.meta.env.VITE_RSA_PUBLIC_KEY',
      notes: '公钥可以安全地包含在前端代码中'
    },
    privateKey: {
      where: '绝不存储在前端',
      example: '通过后端API动态获取临时密钥',
      notes: '私钥泄露会导致严重安全问题'
    }
  },

  // 后端存储
  backend: {
    publicKey: {
      where: '配置文件或密钥管理服务',
      example: 'application.yml / AWS KMS / HashiCorp Vault'
    },
    privateKey: {
      where: 'HSM或密钥管理服务',
      example: 'AWS KMS / Azure Key Vault / HashiCorp Vault'
    }
  }
}

// 环境隔离配置示例
const getSecurityConfig = () => {
  const env = import.meta.env.MODE

  return {
    development: {
      publicKey: import.meta.env.VITE_RSA_PUBLIC_KEY_DEV,
      encryptEnabled: false // 开发环境可选择禁用加密
    },
    staging: {
      publicKey: import.meta.env.VITE_RSA_PUBLIC_KEY_STAGING,
      encryptEnabled: true
    },
    production: {
      publicKey: import.meta.env.VITE_RSA_PUBLIC_KEY_PROD,
      encryptEnabled: true
    }
  }[env] || { publicKey: '', encryptEnabled: false }
}
```

## ⚠️ 安全注意事项

### 1. 密钥安全

```typescript
// ❌ 错误做法：私钥硬编码在前端
const BAD_EXAMPLE = `
const privateKey = '-----BEGIN PRIVATE KEY-----
MIIEvgIBADAN...
-----END PRIVATE KEY-----'
`

// ✅ 正确做法：仅在需要时从安全源获取
const fetchPrivateKeyFromSecureSource = async (): Promise<string | null> => {
  // 例如：从用户的硬件密钥设备获取
  // 或者：使用用户密码派生密钥
  // 绝不从服务器明文传输私钥
  return null // 示例
}
```

### 2. 数据长度限制

RSA加密有严格的数据长度限制：

```typescript
// RSA密钥长度与最大可加密数据长度的关系
const RSA_KEY_SIZES = {
  1024: { maxDataLength: 117 },  // 1024/8 - 11 = 117 bytes
  2048: { maxDataLength: 245 },  // 2048/8 - 11 = 245 bytes
  4096: { maxDataLength: 501 }   // 4096/8 - 11 = 501 bytes
}

// 检查数据长度
const checkDataLength = (data: string, keySize: number = 2048): boolean => {
  const maxLength = Math.floor(keySize / 8) - 11 // PKCS#1 v1.5 padding
  const dataLength = new TextEncoder().encode(data).length

  if (dataLength > maxLength) {
    console.error(`数据长度超出限制: ${dataLength} > ${maxLength} bytes`)
    return false
  }

  return true
}

// 安全的加密函数（带长度检查）
const safeRsaEncrypt = (data: string, keySize: number = 2048): string | null => {
  if (!checkDataLength(data, keySize)) {
    console.error('数据过长，请使用混合加密方案')
    return null
  }

  return rsaEncrypt(data)
}
```

### 3. 错误处理

```typescript
// 加密操作结果类型
interface EncryptResult {
  success: boolean
  data?: string
  error?: string
  errorCode?: string
}

// 安全的加密操作包装
const safeEncrypt = (data: string, publicKey?: string): EncryptResult => {
  try {
    // 空值检查
    if (!data || data.trim() === '') {
      return {
        success: false,
        error: '加密数据不能为空',
        errorCode: 'EMPTY_DATA'
      }
    }

    // 长度检查
    if (!checkDataLength(data)) {
      return {
        success: false,
        error: '数据长度超出RSA加密限制',
        errorCode: 'DATA_TOO_LONG'
      }
    }

    // 执行加密
    const result = rsaEncrypt(data, publicKey)
    if (!result) {
      return {
        success: false,
        error: 'RSA加密失败',
        errorCode: 'ENCRYPT_FAILED'
      }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('加密操作异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: 'EXCEPTION'
    }
  }
}

// 使用示例
const handleEncryption = (sensitiveData: string) => {
  const result = safeEncrypt(sensitiveData)

  if (result.success) {
    sendEncryptedData(result.data!)
  } else {
    switch (result.errorCode) {
      case 'EMPTY_DATA':
        showError('请输入需要加密的数据')
        break
      case 'DATA_TOO_LONG':
        showError('数据过长，请分段加密或使用混合加密')
        break
      case 'ENCRYPT_FAILED':
        showError('加密失败，请检查密钥配置')
        break
      default:
        showError(`加密失败: ${result.error}`)
    }
  }
}
```

### 4. 防重放攻击

```typescript
// 带时间戳和nonce的安全请求
interface SecureRequest {
  data: string
  timestamp: number
  nonce: string
  signature: string
}

// Nonce存储（用于检测重复请求）
const usedNonces = new Set<string>()
const NONCE_EXPIRY = 5 * 60 * 1000 // 5分钟

// 创建安全请求
const createSecureRequest = (data: any): SecureRequest | null => {
  const timestamp = Date.now()
  const nonce = crypto.randomUUID()
  const dataString = JSON.stringify(data)

  const signPayload = `${dataString}|${timestamp}|${nonce}`
  const signature = rsaSign(signPayload)

  if (!signature) {
    return null
  }

  return {
    data: dataString,
    timestamp,
    nonce,
    signature
  }
}

// 验证安全请求
const verifySecureRequest = (request: SecureRequest): boolean => {
  // 1. 检查时间戳
  const age = Date.now() - request.timestamp
  if (age > NONCE_EXPIRY) {
    console.error('请求已过期')
    return false
  }

  // 2. 检查nonce是否已使用
  if (usedNonces.has(request.nonce)) {
    console.error('检测到重放攻击')
    return false
  }

  // 3. 验证签名
  const signPayload = `${request.data}|${request.timestamp}|${request.nonce}`
  if (!rsaVerify(signPayload, request.signature)) {
    console.error('签名验证失败')
    return false
  }

  // 4. 记录nonce
  usedNonces.add(request.nonce)

  // 5. 定期清理过期nonce
  setTimeout(() => usedNonces.delete(request.nonce), NONCE_EXPIRY)

  return true
}
```

## 🧪 测试与调试

### 单元测试

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { rsaEncrypt, rsaDecrypt, rsaCanDecrypt, rsaSign, rsaVerify } from '@/utils/rsa'

describe('RSA工具函数测试', () => {
  const testData = 'Hello, RSA!'
  let encryptedData: string | null

  describe('rsaEncrypt', () => {
    it('应该成功加密有效文本', () => {
      encryptedData = rsaEncrypt(testData)
      expect(encryptedData).not.toBeNull()
      expect(encryptedData).not.toBe(testData)
    })

    it('应该对空字符串返回null', () => {
      expect(rsaEncrypt('')).toBeNull()
    })

    it('每次加密应该产生不同的密文', () => {
      const encrypted1 = rsaEncrypt(testData)
      const encrypted2 = rsaEncrypt(testData)
      // 由于RSA填充的随机性，每次结果应不同
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('rsaDecrypt', () => {
    it('应该成功解密有效密文', () => {
      const encrypted = rsaEncrypt(testData)
      const decrypted = rsaDecrypt(encrypted!)
      expect(decrypted).toBe(testData)
    })

    it('应该对无效密文返回null', () => {
      expect(rsaDecrypt('invalid-ciphertext')).toBeNull()
    })
  })

  describe('rsaCanDecrypt', () => {
    it('应该对有效密文返回true', () => {
      const encrypted = rsaEncrypt(testData)
      expect(rsaCanDecrypt(encrypted!)).toBe(true)
    })

    it('应该对无效密文返回false', () => {
      expect(rsaCanDecrypt('invalid')).toBe(false)
    })
  })

  describe('rsaSign 和 rsaVerify', () => {
    it('应该成功签名和验证', () => {
      const signature = rsaSign(testData)
      expect(signature).not.toBeNull()

      const isValid = rsaVerify(testData, signature!)
      expect(isValid).toBe(true)
    })

    it('应该检测到数据篡改', () => {
      const signature = rsaSign(testData)
      const isValid = rsaVerify('tampered data', signature!)
      expect(isValid).toBe(false)
    })
  })
})
```

### 调试技巧

```typescript
// 调试模式加密
const debugEncrypt = (data: string, publicKey?: string) => {
  console.group('RSA加密调试')
  console.log('输入数据:', data)
  console.log('数据长度:', data.length, 'bytes')
  console.log('使用密钥:', publicKey ? '自定义' : '默认')

  const startTime = performance.now()
  const result = rsaEncrypt(data, publicKey)
  const endTime = performance.now()

  console.log('加密结果:', result ? '成功' : '失败')
  console.log('密文长度:', result?.length || 0, 'bytes')
  console.log('耗时:', (endTime - startTime).toFixed(2), 'ms')
  console.groupEnd()

  return result
}

// 密钥诊断
const diagnoseKey = (key: string, type: 'public' | 'private') => {
  console.group(`${type === 'public' ? '公钥' : '私钥'}诊断`)

  // 格式检查
  const hasHeader = key.includes(`-----BEGIN ${type.toUpperCase()} KEY-----`)
  const hasFooter = key.includes(`-----END ${type.toUpperCase()} KEY-----`)
  console.log('格式正确:', hasHeader && hasFooter)

  // 长度估算
  const base64Content = key
    .replace(/-----BEGIN.*?-----/, '')
    .replace(/-----END.*?-----/, '')
    .replace(/\s/g, '')
  const estimatedBits = Math.round(base64Content.length * 6 / 8) * 8
  console.log('估算密钥长度:', estimatedBits, 'bits')

  // 测试加密/解密
  if (type === 'public') {
    const testResult = rsaEncrypt('test', key)
    console.log('加密测试:', testResult ? '通过' : '失败')
  }

  console.groupEnd()
}
```

## 🔗 与后端联动

### Java后端解密

```java
// Java后端解密RSA数据
import javax.crypto.Cipher;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

public class RsaDecryptor {

    private static final String ALGORITHM = "RSA";
    private static final String TRANSFORMATION = "RSA/ECB/PKCS1Padding";

    /**
     * 解密前端RSA加密的数据
     */
    public String decrypt(String encryptedData, String privateKeyPem) throws Exception {
        // 移除PEM头尾
        String privateKeyContent = privateKeyPem
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replaceAll("\\s", "");

        // 解码Base64
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyContent);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);

        // 生成私钥对象
        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

        // 解密
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, privateKey);

        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes, "UTF-8");
    }
}
```

### Spring Boot集成

```java
// Spring Boot RSA服务
@Service
public class RsaService {

    @Value("${rsa.private-key}")
    private String privateKey;

    @Value("${rsa.public-key}")
    private String publicKey;

    /**
     * 解密前端加密的密码
     */
    public String decryptPassword(String encryptedPassword) {
        try {
            return decrypt(encryptedPassword, privateKey);
        } catch (Exception e) {
            throw new RuntimeException("密码解密失败", e);
        }
    }

    /**
     * 验证前端签名
     */
    public boolean verifySignature(String data, String signature) {
        try {
            // 使用公钥验证签名
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(getPublicKey());
            sig.update(data.getBytes("UTF-8"));
            return sig.verify(Base64.getDecoder().decode(signature));
        } catch (Exception e) {
            return false;
        }
    }
}
```

## 📊 性能优化

### 加密器实例复用

```typescript
// 密钥缓存的加密器
class CachedEncryptor {
  private static publicKeyEncryptor: JSEncrypt | null = null
  private static privateKeyDecryptor: JSEncrypt | null = null
  private static cachedPublicKey: string = ''
  private static cachedPrivateKey: string = ''

  // 获取或创建公钥加密器
  static getPublicKeyEncryptor(publicKey: string): JSEncrypt {
    if (this.cachedPublicKey !== publicKey || !this.publicKeyEncryptor) {
      this.publicKeyEncryptor = new JSEncrypt()
      this.publicKeyEncryptor.setPublicKey(publicKey)
      this.cachedPublicKey = publicKey
    }
    return this.publicKeyEncryptor
  }

  // 获取或创建私钥解密器
  static getPrivateKeyDecryptor(privateKey: string): JSEncrypt {
    if (this.cachedPrivateKey !== privateKey || !this.privateKeyDecryptor) {
      this.privateKeyDecryptor = new JSEncrypt()
      this.privateKeyDecryptor.setPrivateKey(privateKey)
      this.cachedPrivateKey = privateKey
    }
    return this.privateKeyDecryptor
  }

  // 清除缓存
  static clearCache(): void {
    this.publicKeyEncryptor = null
    this.privateKeyDecryptor = null
    this.cachedPublicKey = ''
    this.cachedPrivateKey = ''
  }
}

// 优化后的加密函数
const optimizedEncrypt = (text: string, publicKey?: string): string | null => {
  const key = publicKey || SystemConfig.security.rsaPublicKey
  const encryptor = CachedEncryptor.getPublicKeyEncryptor(key)
  return encryptor.encrypt(text)
}
```

### 批量加密优化

```typescript
// 批量加密多个字段
const batchEncrypt = (
  data: Record<string, any>,
  fieldsToEncrypt: string[]
): Record<string, any> => {
  const encryptor = CachedEncryptor.getPublicKeyEncryptor(
    SystemConfig.security.rsaPublicKey
  )

  const result = { ...data }

  for (const field of fieldsToEncrypt) {
    if (result[field] && typeof result[field] === 'string') {
      const encrypted = encryptor.encrypt(result[field])
      if (encrypted) {
        result[field] = encrypted
      }
    }
  }

  return result
}

// 使用示例
const userData = {
  username: 'admin',
  password: 'secret123',
  email: 'admin@example.com',
  apiKey: 'sk-123456'
}

const encryptedData = batchEncrypt(userData, ['password', 'apiKey'])
```

## 📝 常见问题

### 1. 加密失败返回null

**问题原因：**
- 公钥格式不正确
- 数据长度超出限制
- JSEncrypt库未正确加载

**解决方案：**
```typescript
// 诊断加密问题
const diagnoseEncryptIssue = (data: string, publicKey: string) => {
  // 1. 检查数据
  if (!data) {
    console.error('错误：数据为空')
    return
  }

  // 2. 检查数据长度
  const dataBytes = new TextEncoder().encode(data).length
  if (dataBytes > 245) { // 2048位密钥限制
    console.error(`错误：数据过长 (${dataBytes} bytes > 245 bytes)`)
    return
  }

  // 3. 检查密钥格式
  if (!publicKey.includes('-----BEGIN')) {
    console.error('错误：密钥格式不正确，缺少PEM头')
    return
  }

  // 4. 尝试创建加密器
  try {
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey)
    console.log('加密器创建成功')
  } catch (e) {
    console.error('错误：无法创建加密器', e)
  }
}
```

### 2. 前后端加解密不一致

**问题原因：**
- 填充方式不一致
- 编码方式不一致
- 密钥格式不匹配

**解决方案：**
```typescript
// 确保使用正确的格式
// 前端：JSEncrypt 默认使用 PKCS#1 v1.5 填充
// 后端：确保使用相同的填充方式

// Java后端配置
// Cipher.getInstance("RSA/ECB/PKCS1Padding")

// 确保Base64编码一致
const ensureBase64Compatibility = (encrypted: string): string => {
  // JSEncrypt输出标准Base64
  // 某些后端可能需要URL安全的Base64
  return encrypted
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
```

### 3. 性能问题

**问题原因：**
- 每次加密都创建新实例
- 大量数据使用RSA直接加密

**解决方案：**
- 使用加密器实例缓存
- 对大数据使用混合加密（RSA+AES）
- 批量处理多个加密操作

### 4. 密钥泄露风险

**问题原因：**
- 私钥存储在前端代码中
- 密钥通过不安全通道传输

**解决方案：**
- 前端只使用公钥
- 私钥仅在后端使用
- 使用密钥管理服务（KMS）
- 定期轮换密钥

## 📋 API速查表

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `rsaEncrypt` | `txt: string, pubKey?: string` | `string \| null` | RSA公钥加密 |
| `rsaDecrypt` | `txt: string, privKey?: string` | `string \| null` | RSA私钥解密 |
| `rsaCanDecrypt` | `txt: string, privKey?: string` | `boolean` | 检查是否可解密 |
| `rsaSign` | `txt: string, privKey?: string` | `string \| null` | RSA私钥签名 |
| `rsaVerify` | `txt: string, signature: string, pubKey?: string` | `boolean` | RSA公钥验签 |
| `createEncryptor` | 无 | `JSEncrypt` | 创建加密器实例 |

## 🔍 类型定义

```typescript
// RSA工具类型定义

/** 加密结果 */
interface EncryptResult {
  success: boolean
  data?: string
  error?: string
  errorCode?: 'EMPTY_DATA' | 'DATA_TOO_LONG' | 'ENCRYPT_FAILED' | 'EXCEPTION'
}

/** 签名数据包 */
interface SignedPacket<T = any> {
  data: T
  signature: string
  timestamp: number
  nonce: string
}

/** 混合加密结果 */
interface HybridEncryptResult {
  encryptedKey: string
  encryptedData: string
  iv: string
}

/** 密钥版本 */
interface KeyVersion {
  version: string
  publicKey: string
  privateKey?: string
  createdAt: number
  expiresAt: number
  status: 'active' | 'deprecated' | 'expired'
}

/** 安全请求配置 */
interface SecureRequestConfig {
  encryptFields?: string[]
  signRequest?: boolean
  verifyResponse?: boolean
}
```
