# RSA加密工具 (rsa.ts)

基于 JSEncrypt 库的 RSA 加密解密工具，提供完整的 RSA 加密、解密、签名和验证功能。

## 📖 概述

RSA加密工具提供以下核心功能：
- **加密解密**：使用RSA公钥加密和私钥解密文本
- **数据验证**：检查文本是否可以使用指定密钥解密
- **数字签名**：使用RSA私钥签名和公钥验证
- **实例管理**：创建和管理JSEncrypt加密器实例

## 🔧 安装依赖

使用前需要安装 JSEncrypt 库：

```bash
npm install jsencrypt
# 或
yarn add jsencrypt
```

## ⚙️ 配置说明

工具从系统配置中获取默认的RSA密钥：

```typescript
import { SystemConfig } from '@/systemConfig'

const defaultPublicKey = SystemConfig.security.rsaPublicKey
const defaultPrivateKey = SystemConfig.security.rsaPrivateKey
```

确保在 `systemConfig` 中配置了正确的RSA密钥对。

## 🔐 核心功能

### rsaEncrypt

使用RSA公钥加密文本。

```typescript
rsaEncrypt(txt: string, pubKey?: string): string | null
```

**参数：**
- `txt` - 要加密的文本
- `pubKey` - 可选的自定义公钥，不提供则使用环境变量中的默认公钥

**返回值：**
- `string | null` - 加密后的文本，失败返回null

**示例：**
```typescript
// 使用默认公钥加密
const encrypted = rsaEncrypt('Hello World')
if (encrypted) {
  console.log('加密成功:', encrypted)
} else {
  console.log('加密失败')
}

// 使用自定义公钥
const customPublicKey = '-----BEGIN PUBLIC KEY-----...'
const encrypted2 = rsaEncrypt('Secret Message', customPublicKey)
```

### rsaDecrypt

使用RSA私钥解密文本。

```typescript
rsaDecrypt(txt: string, privKey?: string): string | null
```

**参数：**
- `txt` - 要解密的文本
- `privKey` - 可选的自定义私钥，不提供则使用环境变量中的默认私钥

**返回值：**
- `string | null` - 解密后的文本，失败返回null

**示例：**
```typescript
// 使用默认私钥解密
const decrypted = rsaDecrypt(encryptedText)
if (decrypted) {
  console.log('解密成功:', decrypted)
} else {
  console.log('解密失败')
}

// 使用自定义私钥
const customPrivateKey = '-----BEGIN PRIVATE KEY-----...'
const decrypted2 = rsaDecrypt(encryptedText, customPrivateKey)
```

### rsaCanDecrypt

检查文本是否可以使用指定的私钥解密。

```typescript
rsaCanDecrypt(txt: string, privKey?: string): boolean
```

**参数：**
- `txt` - 要检查的加密文本
- `privKey` - 可选的私钥

**返回值：**
- `boolean` - 是否可以解密

**示例：**
```typescript
// 验证加密文本是否有效
if (rsaCanDecrypt(encryptedData)) {
  console.log('数据可以解密')
  const result = rsaDecrypt(encryptedData)
} else {
  console.log('数据无法解密，可能已损坏')
}

// 验证特定私钥是否匹配
const isValidKey = rsaCanDecrypt(encryptedData, userPrivateKey)
if (!isValidKey) {
  throw new Error('私钥不匹配')
}
```

### rsaSign

使用RSA私钥签名文本。

```typescript
rsaSign(txt: string, privKey?: string): string | null
```

**参数：**
- `txt` - 要签名的文本
- `privKey` - 可选的私钥

**返回值：**
- `string | null` - 签名结果，失败返回null

**示例：**
```typescript
const message = 'Important document content'

// 生成数字签名
const signature = rsaSign(message)
if (signature) {
  console.log('签名生成成功')
  
  // 将消息和签名一起发送
  const packet = {
    message: message,
    signature: signature,
    timestamp: Date.now()
  }
} else {
  console.log('签名生成失败')
}
```

### rsaVerify

验证RSA签名。

```typescript
rsaVerify(txt: string, signature: string, pubKey?: string): boolean
```

**参数：**
- `txt` - 原始文本
- `signature` - 签名
- `pubKey` - 可选的公钥

**返回值：**
- `boolean` - 验证结果

**示例：**
```typescript
// 验证接收到的数据
const receivedData = {
  message: 'Important document content',
  signature: 'ABC123...',
  timestamp: 1640995200000
}

// 验证签名
const isValid = rsaVerify(
  receivedData.message, 
  receivedData.signature
)

if (isValid) {
  console.log('签名验证成功，数据可信')
  processMessage(receivedData.message)
} else {
  console.log('签名验证失败，数据可能被篡改')
  rejectMessage()
}
```

### createEncryptor

创建JSEncrypt加密器实例。这是一个内部工具函数。

```typescript
const createEncryptor = (): JSEncrypt
```

**返回值：**
- `JSEncrypt` - JSEncrypt实例

## 🏗️ 实际应用场景

### 1. 用户登录加密

```typescript
// 前端登录表单
const loginForm = {
  username: 'admin',
  password: 'mypassword123'
}

// 加密敏感信息
const encryptedPassword = rsaEncrypt(loginForm.password)
if (!encryptedPassword) {
  throw new Error('密码加密失败')
}

// 发送到后端
const loginData = {
  username: loginForm.username,
  password: encryptedPassword
}

fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
})
```

### 2. 敏感配置加密存储

```typescript
// 加密存储API密钥
const apiConfig = {
  endpoint: 'https://api.example.com',
  apiKey: 'sk-1234567890abcdef',
  secret: 'very-secret-token'
}

// 加密敏感字段
const encryptedConfig = {
  endpoint: apiConfig.endpoint,
  apiKey: rsaEncrypt(apiConfig.apiKey),
  secret: rsaEncrypt(apiConfig.secret)
}

// 存储到本地
localStorage.setItem('apiConfig', JSON.stringify(encryptedConfig))

// 使用时解密
const storedConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}')
const decryptedApiKey = rsaDecrypt(storedConfig.apiKey)
const decryptedSecret = rsaDecrypt(storedConfig.secret)
```

### 3. 数据完整性验证

```typescript
// 发送方：创建带签名的数据包
const createSignedPacket = (data: any) => {
  const message = JSON.stringify(data)
  const signature = rsaSign(message)
  
  if (!signature) {
    throw new Error('签名创建失败')
  }
  
  return {
    data: message,
    signature: signature,
    timestamp: Date.now()
  }
}

// 接收方：验证数据包
const verifyPacket = (packet: any) => {
  const isValid = rsaVerify(packet.data, packet.signature)
  
  if (!isValid) {
    throw new Error('数据包签名验证失败')
  }
  
  // 检查时间戳（防重放攻击）
  const age = Date.now() - packet.timestamp
  if (age > 5 * 60 * 1000) { // 5分钟过期
    throw new Error('数据包已过期')
  }
  
  return JSON.parse(packet.data)
}

// 使用示例
const originalData = { userId: 123, action: 'transfer', amount: 1000 }
const packet = createSignedPacket(originalData)

// 网络传输后...
const verifiedData = verifyPacket(packet)
console.log('验证通过的数据:', verifiedData)
```

### 4. 文件加密传输

```typescript
// 文件内容加密
const encryptFileContent = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      const encrypted = rsaEncrypt(content)
      resolve(encrypted)
    }
    
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}

// 使用示例
const fileInput = document.getElementById('file') as HTMLInputElement
const file = fileInput.files?.[0]

if (file) {
  const encryptedContent = await encryptFileContent(file)
  if (encryptedContent) {
    // 上传加密后的内容
    uploadEncryptedFile(encryptedContent)
  }
}
```

### 5. API接口安全

```typescript
// API请求拦截器：加密敏感参数
const secureApiCall = async (endpoint: string, data: any) => {
  // 识别需要加密的字段
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret']
  const encryptedData = { ...data }
  
  for (const field of sensitiveFields) {
    if (encryptedData[field]) {
      const encrypted = rsaEncrypt(encryptedData[field])
      if (encrypted) {
        encryptedData[field] = encrypted
      }
    }
  }
  
  // 发送请求
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Encrypted': 'true'  // 标记包含加密数据
    },
    body: JSON.stringify(encryptedData)
  })
  
  return response.json()
}

// 使用示例
const result = await secureApiCall('/api/user/update', {
  id: 123,
  name: 'John Doe',
  password: 'newpassword123'  // 这个字段会被自动加密
})
```

## 🔑 密钥管理最佳实践

### 1. 密钥格式示例

```typescript
// 公钥格式
const publicKeyExample = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4f5wg5l2hKsTeNem/V41
fGnJm6gOdrj8ym3rFkEjWT2btNjcIpML4E4VlDx9oN9h2jbNVgU0pVXeJpZhqTny
...
-----END PUBLIC KEY-----
`

// 私钥格式
const privateKeyExample = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDh/nCDmXaEqxN4
16b9XjV8acmbqA52uPzKbesWQSNZPZu02NwikwvgThWUPH2g32HaNs1WBTSlVd4m
...
-----END PRIVATE KEY-----
`
```

### 2. 环境配置

```typescript
// systemConfig.ts 配置示例
export const SystemConfig = {
  security: {
    rsaPublicKey: process.env.RSA_PUBLIC_KEY || publicKeyExample,
    rsaPrivateKey: process.env.RSA_PRIVATE_KEY || privateKeyExample
  }
}
```

### 3. 密钥轮换策略

```typescript
// 支持多版本密钥的工具函数
const getKeyByVersion = (version: string = 'current') => {
  const keyMap = {
    'current': SystemConfig.security.rsaPublicKey,
    'v1': process.env.RSA_PUBLIC_KEY_V1,
    'v2': process.env.RSA_PUBLIC_KEY_V2
  }
  
  return keyMap[version] || keyMap['current']
}

// 带版本的加密
const encryptWithVersion = (text: string, version: string = 'current') => {
  const publicKey = getKeyByVersion(version)
  const encrypted = rsaEncrypt(text, publicKey)
  
  if (encrypted) {
    return {
      data: encrypted,
      version: version
    }
  }
  
  return null
}
```

## ⚠️ 安全注意事项

### 1. 密钥安全
- **私钥保护**：私钥绝不应在前端代码中硬编码
- **环境隔离**：不同环境使用不同的密钥对
- **访问控制**：严格控制私钥的访问权限

### 2. 数据长度限制
RSA加密有数据长度限制，通常为密钥长度减去填充长度：

```typescript
// 检查数据长度
const checkDataLength = (data: string, keySize: number = 2048) => {
  const maxLength = Math.floor(keySize / 8) - 11 // PKCS#1 padding
  const dataLength = new TextEncoder().encode(data).length
  
  if (dataLength > maxLength) {
    throw new Error(`数据长度超出限制：${dataLength} > ${maxLength}`)
  }
}

// 大数据分块加密（示例概念）
const encryptLargeData = (data: string) => {
  const chunks = splitIntoChunks(data, 190) // 2048位密钥的安全分块大小
  const encryptedChunks = chunks.map(chunk => rsaEncrypt(chunk))
  return encryptedChunks.filter(Boolean) // 过滤失败的加密结果
}
```

### 3. 错误处理

```typescript
// 安全的加密操作包装
const safeEncrypt = (data: string, publicKey?: string) => {
  try {
    if (!data || data.trim() === '') {
      throw new Error('加密数据不能为空')
    }
    
    const result = rsaEncrypt(data, publicKey)
    if (!result) {
      throw new Error('RSA加密失败')
    }
    
    return { success: true, data: result }
  } catch (error) {
    console.error('加密操作失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }
  }
}

// 使用示例
const { success, data, error } = safeEncrypt(sensitiveData)
if (success) {
  // 处理加密成功
  sendEncryptedData(data)
} else {
  // 处理加密失败
  showError(`加密失败: ${error}`)
}
```
