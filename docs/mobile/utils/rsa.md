# rsa 加密工具

## 介绍

`rsa` 是 RSA 非对称加密工具，基于 jsencrypt 库实现。提供数据加密、解密、签名和验签功能，适用于敏感数据传输、登录密码加密等安全场景。

**核心特性:**

- **非对称加密** - 使用公钥加密、私钥解密的 RSA 算法
- **数字签名** - 支持 RSA 签名和验签功能
- **密钥验证** - 验证私钥是否能解密对应公钥加密的数据
- **安全传输** - 保护敏感数据在网络传输中的安全性

## 基本用法

### 数据加密

使用公钥加密数据：

```typescript
import { rsaEncrypt } from '@/utils/rsa'

// 获取服务端公钥
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
-----END PUBLIC KEY-----`

// 加密密码
const password = '123456'
const encryptedPassword = rsaEncrypt(password, publicKey)
console.log('加密结果:', encryptedPassword)

// 发送加密后的密码到服务端
await login({
  username: 'admin',
  password: encryptedPassword
})
```

### 数据解密

使用私钥解密数据：

```typescript
import { rsaDecrypt } from '@/utils/rsa'

// 私钥（通常只在服务端使用，前端仅用于测试）
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy...
-----END RSA PRIVATE KEY-----`

// 解密数据
const encryptedData = 'xKj8HU2lk9...'
const decryptedData = rsaDecrypt(encryptedData, privateKey)
console.log('解密结果:', decryptedData)
```

### 验证密钥对

验证私钥是否能解密公钥加密的数据：

```typescript
import { rsaCanDecrypt } from '@/utils/rsa'

// 验证密钥对是否匹配
const isValid = rsaCanDecrypt(publicKey, privateKey)
if (isValid) {
  console.log('密钥对有效')
} else {
  console.log('密钥对不匹配')
}
```

### 数字签名

使用私钥对数据进行签名：

```typescript
import { rsaSign } from '@/utils/rsa'

// 待签名数据
const data = JSON.stringify({
  orderId: '202312010001',
  amount: 100.00,
  timestamp: Date.now()
})

// 生成签名
const signature = rsaSign(data, privateKey)
console.log('签名:', signature)

// 将数据和签名一起发送
await submitOrder({
  data,
  signature
})
```

### 验证签名

使用公钥验证签名：

```typescript
import { rsaVerify } from '@/utils/rsa'

// 接收到的数据和签名
const receivedData = '{"orderId":"202312010001",...}'
const receivedSignature = 'base64EncodedSignature...'

// 验证签名
const isValid = rsaVerify(receivedData, receivedSignature, publicKey)
if (isValid) {
  console.log('签名验证通过，数据未被篡改')
} else {
  console.log('签名验证失败，数据可能被篡改')
}
```

## 实际应用场景

### 登录密码加密

```typescript
import { rsaEncrypt } from '@/utils/rsa'
import { getPublicKey } from '@/api/auth'

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

// 获取公钥
const publicKey = ref('')
onMounted(async () => {
  const res = await getPublicKey()
  publicKey.value = res.data
})

// 登录处理
const handleLogin = async () => {
  // 加密密码
  const encryptedPassword = rsaEncrypt(
    loginForm.password,
    publicKey.value
  )

  if (!encryptedPassword) {
    uni.showToast({ title: '加密失败', icon: 'none' })
    return
  }

  // 提交登录
  const result = await login({
    username: loginForm.username,
    password: encryptedPassword,
    captcha: loginForm.captcha
  })

  if (result.code === 200) {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
```

### 敏感信息加密传输

```typescript
import { rsaEncrypt } from '@/utils/rsa'

// 加密敏感信息
const encryptSensitiveData = (data: SensitiveData, publicKey: string) => {
  // 将敏感数据转为 JSON
  const jsonData = JSON.stringify(data)

  // RSA 加密
  const encrypted = rsaEncrypt(jsonData, publicKey)

  return encrypted
}

// 提交实名认证
const submitRealName = async (info: RealNameInfo) => {
  const publicKey = await getPublicKey()

  // 加密身份证号和姓名
  const encryptedIdCard = rsaEncrypt(info.idCard, publicKey)
  const encryptedName = rsaEncrypt(info.realName, publicKey)

  await api.submitRealName({
    idCard: encryptedIdCard,
    realName: encryptedName,
    // 其他非敏感字段正常传输
    phone: info.phone
  })
}
```

### 支付签名验证

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'

// 生成支付请求签名
const createPaymentSignature = (orderInfo: OrderInfo, privateKey: string) => {
  // 按规则排序参数
  const sortedParams = Object.keys(orderInfo)
    .sort()
    .map(key => `${key}=${orderInfo[key]}`)
    .join('&')

  // 生成签名
  const signature = rsaSign(sortedParams, privateKey)

  return {
    ...orderInfo,
    sign: signature
  }
}

// 验证回调签名
const verifyCallbackSignature = (
  callbackData: Record<string, any>,
  publicKey: string
) => {
  const { sign, ...data } = callbackData

  // 按规则排序参数
  const sortedParams = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&')

  // 验证签名
  return rsaVerify(sortedParams, sign, publicKey)
}
```

### 密钥管理

```typescript
import { rsaCanDecrypt } from '@/utils/rsa'

// 密钥配置
const keyConfig = {
  publicKey: import.meta.env.VITE_RSA_PUBLIC_KEY,
  privateKey: import.meta.env.VITE_RSA_PRIVATE_KEY // 仅开发环境
}

// 验证密钥配置
const validateKeyConfig = () => {
  if (!keyConfig.publicKey) {
    console.error('未配置 RSA 公钥')
    return false
  }

  // 开发环境验证密钥对
  if (import.meta.env.DEV && keyConfig.privateKey) {
    const isValid = rsaCanDecrypt(keyConfig.publicKey, keyConfig.privateKey)
    if (!isValid) {
      console.error('RSA 密钥对不匹配')
      return false
    }
  }

  return true
}

// 应用启动时验证
onLaunch(() => {
  validateKeyConfig()
})
```

## API

### 函数列表

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| rsaEncrypt | RSA 加密 | `(data: string, publicKey: string)` | `string \| false` |
| rsaDecrypt | RSA 解密 | `(data: string, privateKey: string)` | `string \| false` |
| rsaCanDecrypt | 验证密钥对 | `(publicKey: string, privateKey: string)` | `boolean` |
| rsaSign | RSA 签名 | `(data: string, privateKey: string)` | `string \| false` |
| rsaVerify | 验证签名 | `(data: string, signature: string, publicKey: string)` | `boolean` |

### 类型定义

```typescript
/**
 * RSA 加密
 * @param data 待加密的明文数据
 * @param publicKey RSA 公钥（PEM 格式）
 * @returns 加密后的 Base64 字符串，失败返回 false
 */
function rsaEncrypt(data: string, publicKey: string): string | false

/**
 * RSA 解密
 * @param data 待解密的密文（Base64 格式）
 * @param privateKey RSA 私钥（PEM 格式）
 * @returns 解密后的明文，失败返回 false
 */
function rsaDecrypt(data: string, privateKey: string): string | false

/**
 * 验证密钥对是否匹配
 * @param publicKey RSA 公钥
 * @param privateKey RSA 私钥
 * @returns 密钥对有效返回 true
 */
function rsaCanDecrypt(publicKey: string, privateKey: string): boolean

/**
 * RSA 签名
 * @param data 待签名的数据
 * @param privateKey RSA 私钥
 * @returns 签名字符串，失败返回 false
 */
function rsaSign(data: string, privateKey: string): string | false

/**
 * 验证 RSA 签名
 * @param data 原始数据
 * @param signature 签名字符串
 * @param publicKey RSA 公钥
 * @returns 签名有效返回 true
 */
function rsaVerify(
  data: string,
  signature: string,
  publicKey: string
): boolean
```

### 密钥格式

RSA 密钥需要使用 PEM 格式：

```typescript
// 公钥格式
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
-----END PUBLIC KEY-----`

// 私钥格式
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy...
-----END RSA PRIVATE KEY-----`

// 也支持不带头尾的纯 Base64 格式
const publicKeyBase64 = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...'
```

## 最佳实践

### 1. 公钥动态获取

```typescript
// 不要硬编码公钥，从服务端获取
const useRsaKey = () => {
  const publicKey = ref('')

  const fetchPublicKey = async () => {
    const res = await api.getPublicKey()
    publicKey.value = res.data
  }

  onMounted(fetchPublicKey)

  return { publicKey, fetchPublicKey }
}
```

### 2. 加密失败处理

```typescript
// 处理加密失败的情况
const encryptPassword = (password: string, publicKey: string) => {
  const encrypted = rsaEncrypt(password, publicKey)

  if (encrypted === false) {
    throw new Error('密码加密失败，请刷新页面重试')
  }

  return encrypted
}
```

### 3. 私钥保护

```typescript
// 私钥只应该在服务端使用
// 前端只使用公钥进行加密

// 错误：前端存储私钥
const privateKey = '...' // ❌ 不安全

// 正确：仅在开发/测试环境使用
if (import.meta.env.DEV) {
  const testPrivateKey = import.meta.env.VITE_RSA_PRIVATE_KEY
  // 仅用于本地测试
}
```

### 4. 数据长度限制

RSA 加密有数据长度限制，对于较长数据应使用分段加密或混合加密：

```typescript
// 对于长数据，使用 AES + RSA 混合加密
const hybridEncrypt = async (data: string, publicKey: string) => {
  // 1. 生成随机 AES 密钥
  const aesKey = generateRandomKey()

  // 2. 使用 AES 加密数据
  const encryptedData = aesEncrypt(data, aesKey)

  // 3. 使用 RSA 加密 AES 密钥
  const encryptedKey = rsaEncrypt(aesKey, publicKey)

  return {
    key: encryptedKey,
    data: encryptedData
  }
}
```

## 常见问题

### 1. 加密返回 false？

**可能原因：**
- 公钥格式不正确
- 公钥内容损坏
- 待加密数据过长

**解决方案：**
```typescript
// 验证公钥格式
const validatePublicKey = (key: string) => {
  try {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(key)
    // 测试加密
    const test = encrypt.encrypt('test')
    return test !== false
  } catch {
    return false
  }
}
```

### 2. 与服务端加解密不一致？

**可能原因：**
- 编码方式不同（UTF-8、GBK）
- 填充模式不同（PKCS1、OAEP）
- 密钥格式不同

**解决方案：**
- 确保前后端使用相同的编码方式
- jsencrypt 默认使用 PKCS1 填充
- 确保服务端也使用 PKCS1

### 3. 小程序中报错？

**原因：** jsencrypt 使用了浏览器 API

**解决方案：**
- 使用支持小程序的 RSA 库
- 或将加密操作放到服务端

### 4. 如何生成密钥对？

使用 OpenSSL 生成：
```bash
# 生成私钥
openssl genrsa -out private.pem 2048

# 从私钥提取公钥
openssl rsa -in private.pem -pubout -out public.pem
```
