# rsa 加密工具

## 介绍

`rsa` 是 RSA 非对称加密工具模块，基于 jsencrypt 和 CryptoJS 库实现。提供数据加密、解密、签名和验签功能，适用于敏感数据传输、登录密码加密、API 请求签名等安全场景。该模块与系统配置 SystemConfig 深度集成，支持默认密钥配置和自定义密钥两种使用方式。

**核心特性:**

- **非对称加密** - 使用公钥加密、私钥解密的 RSA 算法，确保数据传输安全
- **数字签名** - 支持基于 SHA256 算法的 RSA 签名和验签功能
- **默认密钥** - 自动从 SystemConfig 读取默认密钥，简化使用
- **灵活配置** - 支持传入自定义密钥覆盖默认配置
- **错误处理** - 完善的错误捕获和日志输出机制
- **安全传输** - 保护敏感数据在网络传输中的安全性

## 架构设计

### 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                       rsa.ts 加密模块                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │  JSEncrypt  │    │  CryptoJS   │    │  SystemConfig   │ │
│  │  RSA 实现    │    │  SHA256     │    │  默认密钥       │ │
│  └──────┬──────┘    └──────┬──────┘    └────────┬────────┘ │
│         │                  │                    │          │
│         └──────────────────┼────────────────────┘          │
│                            │                               │
│  ┌─────────────────────────┴─────────────────────────────┐ │
│  │                    核心函数                            │ │
│  │                                                       │ │
│  │  rsaEncrypt   rsaDecrypt   rsaCanDecrypt             │ │
│  │  rsaSign      rsaVerify    createEncryptor           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       应用层使用                             │
├─────────────────────────────────────────────────────────────┤
│  登录密码加密 │ 敏感数据传输 │ API签名 │ 数据完整性验证    │
└─────────────────────────────────────────────────────────────┘
```

### 数据流向

```
加密流程:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 明文数据  │ -> │ rsaEncrypt│ -> │ JSEncrypt │ -> │ 密文输出  │
│ "123456" │    │ + 公钥    │    │ .encrypt()│    │ "xKj8..." │
└──────────┘    └──────────┘    └──────────┘    └──────────┘

解密流程:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 密文数据  │ -> │ rsaDecrypt│ -> │ JSEncrypt │ -> │ 明文输出  │
│ "xKj8..."│    │ + 私钥    │    │ .decrypt()│    │ "123456" │
└──────────┘    └──────────┘    └──────────┘    └──────────┘

签名流程:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 原始数据  │ -> │ CryptoJS  │ -> │ JSEncrypt │ -> │ 签名输出  │
│ "data"   │    │ SHA256    │    │ .sign()   │    │ "sig..." │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 与 SystemConfig 的集成

RSA 工具模块与系统配置 SystemConfig 紧密集成，自动读取安全配置中的默认密钥：

```typescript
// systemConfig.ts 中的安全配置
interface SecurityConfig {
  /** 接口加密功能开关 */
  apiEncrypt: boolean
  /** RSA公钥 - 用于加密传输 */
  rsaPublicKey: string
  /** RSA私钥 - 用于解密响应 */
  rsaPrivateKey: string
}

// rsa.ts 中自动读取默认密钥
const defaultPublicKey = SystemConfig.security.rsaPublicKey
const defaultPrivateKey = SystemConfig.security.rsaPrivateKey
```

环境变量配置：

```bash
# .env 文件
VITE_APP_API_ENCRYPT = 'true'
VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK9s1Pbnn5W+...'
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOwIBAAJBAIrZxEhzVAHKJm7BJpXIHWGU3sHJYg...'
```

## 基本用法

### 数据加密

使用公钥加密数据。如果不传入公钥参数，将自动使用 SystemConfig 中配置的默认公钥：

```vue
<template>
  <view class="encryption-demo">
    <wd-input
      v-model="plainText"
      label="明文"
      placeholder="请输入要加密的内容"
    />
    <wd-button type="primary" @click="handleEncrypt">
      加密
    </wd-button>
    <view v-if="encryptedText" class="result">
      <text class="label">加密结果:</text>
      <text class="value">{{ encryptedText }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { rsaEncrypt } from '@/utils/rsa'

const plainText = ref('')
const encryptedText = ref('')

// 使用默认公钥加密
const handleEncrypt = () => {
  if (!plainText.value) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  // 不传入公钥参数，使用 SystemConfig 中的默认公钥
  const result = rsaEncrypt(plainText.value)

  if (result) {
    encryptedText.value = result
    uni.showToast({ title: '加密成功', icon: 'success' })
  } else {
    uni.showToast({ title: '加密失败', icon: 'none' })
  }
}
</script>
```

使用自定义公钥加密：

```typescript
import { rsaEncrypt } from '@/utils/rsa'

// 自定义公钥（从服务端获取）
const customPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
-----END PUBLIC KEY-----`

// 加密密码
const password = '123456'
const encryptedPassword = rsaEncrypt(password, customPublicKey)

if (encryptedPassword) {
  console.log('加密结果:', encryptedPassword)
  // 发送加密后的密码到服务端
  await login({
    username: 'admin',
    password: encryptedPassword
  })
} else {
  console.error('加密失败')
}
```

### 数据解密

使用私钥解密数据。同样支持默认私钥和自定义私钥：

```typescript
import { rsaDecrypt } from '@/utils/rsa'

// 使用默认私钥解密（从 SystemConfig 读取）
const decryptWithDefault = (encryptedData: string) => {
  const result = rsaDecrypt(encryptedData)

  if (result) {
    console.log('解密结果:', result)
    return result
  } else {
    console.error('解密失败')
    return null
  }
}

// 使用自定义私钥解密
const decryptWithCustomKey = (encryptedData: string, privateKey: string) => {
  const result = rsaDecrypt(encryptedData, privateKey)

  if (result) {
    console.log('解密结果:', result)
    return result
  } else {
    console.error('解密失败')
    return null
  }
}
```

### 验证是否可解密

验证加密文本是否可以被正确解密：

```typescript
import { rsaCanDecrypt } from '@/utils/rsa'

// 验证加密数据是否可以被默认私钥解密
const encryptedData = 'xKj8HU2lk9...'
const canDecrypt = rsaCanDecrypt(encryptedData)

if (canDecrypt) {
  console.log('数据可以被解密')
} else {
  console.log('数据无法解密，可能密钥不匹配')
}

// 使用指定私钥验证
const customPrivateKey = '...'
const canDecryptWithCustom = rsaCanDecrypt(encryptedData, customPrivateKey)
```

### 数字签名

使用私钥对数据进行 SHA256 签名：

```vue
<template>
  <view class="sign-demo">
    <wd-textarea
      v-model="dataToSign"
      label="待签名数据"
      placeholder="请输入要签名的数据"
    />
    <wd-button type="primary" @click="handleSign">
      生成签名
    </wd-button>
    <view v-if="signature" class="result">
      <text class="label">签名结果:</text>
      <text class="value selectable">{{ signature }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { rsaSign } from '@/utils/rsa'

const dataToSign = ref('')
const signature = ref('')

const handleSign = () => {
  if (!dataToSign.value) {
    uni.showToast({ title: '请输入数据', icon: 'none' })
    return
  }

  // 使用默认私钥签名
  const result = rsaSign(dataToSign.value)

  if (result) {
    signature.value = result
    uni.showToast({ title: '签名成功', icon: 'success' })
  } else {
    uni.showToast({ title: '签名失败', icon: 'none' })
  }
}
</script>
```

使用自定义私钥签名：

```typescript
import { rsaSign } from '@/utils/rsa'

// 待签名数据
const orderData = JSON.stringify({
  orderId: '202312010001',
  amount: 100.00,
  timestamp: Date.now()
})

// 使用自定义私钥生成签名
const customPrivateKey = '...'
const signature = rsaSign(orderData, customPrivateKey)

if (signature) {
  console.log('签名:', signature)
  // 将数据和签名一起发送
  await submitOrder({
    data: orderData,
    signature
  })
}
```

### 验证签名

使用公钥验证签名的有效性：

```typescript
import { rsaVerify } from '@/utils/rsa'

// 接收到的数据和签名
const receivedData = '{"orderId":"202312010001","amount":100,"timestamp":1701388800000}'
const receivedSignature = 'base64EncodedSignature...'

// 使用默认公钥验证签名
const isValid = rsaVerify(receivedData, receivedSignature)

if (isValid) {
  console.log('签名验证通过，数据未被篡改')
  // 处理数据
} else {
  console.log('签名验证失败，数据可能被篡改')
  // 拒绝处理
}

// 使用自定义公钥验证
const customPublicKey = '...'
const isValidWithCustom = rsaVerify(receivedData, receivedSignature, customPublicKey)
```

## 实际应用场景

### 登录密码加密

完整的登录流程，自动使用系统配置的 RSA 公钥加密密码：

```vue
<template>
  <view class="login-page">
    <view class="form-container">
      <wd-input
        v-model="loginForm.username"
        label="用户名"
        placeholder="请输入用户名"
        clearable
      />
      <wd-input
        v-model="loginForm.password"
        label="密码"
        type="password"
        placeholder="请输入密码"
        show-password
        clearable
      />
      <wd-input
        v-model="loginForm.captcha"
        label="验证码"
        placeholder="请输入验证码"
        clearable
      >
        <template #suffix>
          <image
            :src="captchaUrl"
            class="captcha-image"
            @click="refreshCaptcha"
          />
        </template>
      </wd-input>

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
import { ref, reactive, onMounted } from 'vue'
import { rsaEncrypt } from '@/utils/rsa'
import { login, getCaptcha } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  uuid: ''
})

const loading = ref(false)
const captchaUrl = ref('')

// 获取验证码
const refreshCaptcha = async () => {
  const res = await getCaptcha()
  captchaUrl.value = res.data.img
  loginForm.uuid = res.data.uuid
}

// 登录处理
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!loginForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (!loginForm.captcha) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  loading.value = true

  try {
    // 使用 RSA 加密密码（自动使用 SystemConfig 中的公钥）
    const encryptedPassword = rsaEncrypt(loginForm.password)

    if (!encryptedPassword) {
      uni.showToast({ title: '密码加密失败', icon: 'none' })
      return
    }

    // 提交登录请求
    const result = await login({
      username: loginForm.username,
      password: encryptedPassword,
      code: loginForm.captcha,
      uuid: loginForm.uuid
    })

    if (result.code === 200) {
      // 保存 token
      await userStore.setToken(result.data.access_token)

      uni.showToast({ title: '登录成功', icon: 'success' })

      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } else {
      uni.showToast({ title: result.msg || '登录失败', icon: 'none' })
      refreshCaptcha()
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style lang="scss" scoped>
.login-page {
  padding: 40rpx;

  .form-container {
    margin-top: 60rpx;
  }

  .captcha-image {
    width: 200rpx;
    height: 64rpx;
  }
}
</style>
```

### 敏感信息加密传输

实名认证场景，加密身份证号和姓名等敏感信息：

```vue
<template>
  <view class="real-name-page">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-input
        v-model="formData.realName"
        label="真实姓名"
        placeholder="请输入真实姓名"
        prop="realName"
      />
      <wd-input
        v-model="formData.idCard"
        label="身份证号"
        placeholder="请输入身份证号"
        prop="idCard"
        maxlength="18"
      />
      <wd-input
        v-model="formData.phone"
        label="手机号"
        placeholder="请输入手机号"
        prop="phone"
        type="number"
        maxlength="11"
      />

      <view class="submit-btn">
        <wd-button
          type="primary"
          block
          :loading="submitting"
          @click="handleSubmit"
        >
          提交认证
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { rsaEncrypt } from '@/utils/rsa'
import { submitRealName } from '@/api/user'

interface FormData {
  realName: string
  idCard: string
  phone: string
}

const formRef = ref()
const submitting = ref(false)

const formData = reactive<FormData>({
  realName: '',
  idCard: '',
  phone: ''
})

const rules = {
  realName: [{ required: true, message: '请输入真实姓名' }],
  idCard: [
    { required: true, message: '请输入身份证号' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '身份证号格式不正确' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ]
}

const handleSubmit = async () => {
  // 表单验证
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true

  try {
    // 加密敏感信息
    const encryptedIdCard = rsaEncrypt(formData.idCard)
    const encryptedName = rsaEncrypt(formData.realName)

    if (!encryptedIdCard || !encryptedName) {
      uni.showToast({ title: '数据加密失败', icon: 'none' })
      return
    }

    // 提交加密后的数据
    const result = await submitRealName({
      idCard: encryptedIdCard,
      realName: encryptedName,
      // 手机号不加密（非敏感字段）
      phone: formData.phone
    })

    if (result.code === 200) {
      uni.showToast({ title: '认证提交成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: result.msg || '认证失败', icon: 'none' })
    }
  } catch (error) {
    console.error('提交失败:', error)
    uni.showToast({ title: '网络错误', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>
```

### API 请求签名

对重要的 API 请求进行签名，防止数据被篡改：

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'

/**
 * 生成请求签名
 * @param params 请求参数
 * @param privateKey 可选私钥
 * @returns 签名后的参数
 */
export const signRequest = <T extends Record<string, any>>(
  params: T,
  privateKey?: string
): T & { sign: string; timestamp: number } => {
  // 添加时间戳
  const timestamp = Date.now()

  // 构建待签名字符串
  // 按 key 排序，排除 sign 字段
  const sortedKeys = Object.keys(params).sort()
  const signString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + `&timestamp=${timestamp}`

  // 生成签名
  const sign = rsaSign(signString, privateKey)

  if (!sign) {
    throw new Error('签名生成失败')
  }

  return {
    ...params,
    timestamp,
    sign
  }
}

/**
 * 验证响应签名
 * @param data 响应数据
 * @param publicKey 可选公钥
 * @returns 签名是否有效
 */
export const verifyResponse = (
  data: Record<string, any>,
  publicKey?: string
): boolean => {
  const { sign, ...rest } = data

  if (!sign) {
    console.warn('响应数据缺少签名')
    return false
  }

  // 重建签名字符串
  const sortedKeys = Object.keys(rest).sort()
  const signString = sortedKeys
    .map(key => `${key}=${rest[key]}`)
    .join('&')

  // 验证签名
  return rsaVerify(signString, sign, publicKey)
}

// 使用示例
const createOrder = async (orderInfo: OrderInfo) => {
  // 签名请求参数
  const signedParams = signRequest({
    productId: orderInfo.productId,
    quantity: orderInfo.quantity,
    amount: orderInfo.amount
  })

  // 发送签名后的请求
  const response = await api.post('/order/create', signedParams)

  // 验证响应签名
  if (response.data.sign) {
    const isValid = verifyResponse(response.data)
    if (!isValid) {
      throw new Error('响应签名验证失败')
    }
  }

  return response.data
}
```

### 支付签名验证

完整的支付签名场景：

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'

interface PaymentParams {
  orderId: string
  amount: number
  currency: string
  productName: string
  notifyUrl: string
}

interface PaymentCallback {
  orderId: string
  transactionId: string
  amount: number
  status: string
  sign: string
  timestamp: number
}

/**
 * 生成支付签名
 */
export const createPaymentSignature = (
  params: PaymentParams,
  privateKey?: string
): string => {
  // 按规则排序参数
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key as keyof PaymentParams]}`)
    .join('&')

  // 生成签名
  const signature = rsaSign(sortedParams, privateKey)

  if (!signature) {
    throw new Error('支付签名生成失败')
  }

  return signature
}

/**
 * 验证支付回调签名
 */
export const verifyPaymentCallback = (
  callback: PaymentCallback,
  publicKey?: string
): boolean => {
  const { sign, ...data } = callback

  // 验证时间戳（5分钟内有效）
  const now = Date.now()
  if (Math.abs(now - data.timestamp) > 5 * 60 * 1000) {
    console.error('回调时间戳过期')
    return false
  }

  // 按规则排序参数
  const sortedParams = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key as keyof typeof data]}`)
    .join('&')

  // 验证签名
  return rsaVerify(sortedParams, sign, publicKey)
}

// 使用示例
const initiatePayment = async (order: Order) => {
  const paymentParams: PaymentParams = {
    orderId: order.id,
    amount: order.totalAmount,
    currency: 'CNY',
    productName: order.productName,
    notifyUrl: 'https://api.example.com/payment/notify'
  }

  // 生成签名
  const sign = createPaymentSignature(paymentParams)

  // 发起支付请求
  const result = await api.post('/payment/create', {
    ...paymentParams,
    sign,
    timestamp: Date.now()
  })

  return result.data
}

// 处理支付回调
const handlePaymentCallback = (callback: PaymentCallback) => {
  // 验证签名
  const isValid = verifyPaymentCallback(callback)

  if (!isValid) {
    console.error('支付回调签名验证失败')
    return { success: false, message: '签名验证失败' }
  }

  // 处理支付结果
  if (callback.status === 'SUCCESS') {
    // 更新订单状态
    updateOrderStatus(callback.orderId, 'paid')
    return { success: true, message: '支付成功' }
  } else {
    return { success: false, message: '支付失败' }
  }
}
```

### 数据完整性校验

使用签名确保数据传输完整性：

```typescript
import { rsaSign, rsaVerify } from '@/utils/rsa'
import CryptoJS from 'crypto-js'

/**
 * 带完整性校验的数据传输
 */
export const useSecureTransfer = () => {
  /**
   * 准备安全传输数据
   */
  const prepareSecureData = <T extends Record<string, any>>(
    data: T
  ): { payload: string; hash: string; signature: string } => {
    // 序列化数据
    const payload = JSON.stringify(data)

    // 计算数据哈希
    const hash = CryptoJS.SHA256(payload).toString()

    // 对哈希进行签名
    const signature = rsaSign(hash)

    if (!signature) {
      throw new Error('签名失败')
    }

    return {
      payload,
      hash,
      signature
    }
  }

  /**
   * 验证并解析安全数据
   */
  const verifySecureData = <T>(
    secureData: { payload: string; hash: string; signature: string }
  ): T | null => {
    const { payload, hash, signature } = secureData

    // 验证签名
    if (!rsaVerify(hash, signature)) {
      console.error('签名验证失败')
      return null
    }

    // 验证数据完整性
    const calculatedHash = CryptoJS.SHA256(payload).toString()
    if (calculatedHash !== hash) {
      console.error('数据完整性校验失败')
      return null
    }

    // 解析数据
    try {
      return JSON.parse(payload) as T
    } catch {
      console.error('数据解析失败')
      return null
    }
  }

  return {
    prepareSecureData,
    verifySecureData
  }
}

// 使用示例
const { prepareSecureData, verifySecureData } = useSecureTransfer()

// 发送安全数据
const sendSecureMessage = async (message: any) => {
  const secureData = prepareSecureData(message)
  await api.post('/secure/message', secureData)
}

// 接收并验证安全数据
const receiveSecureMessage = async () => {
  const response = await api.get('/secure/message')
  const message = verifySecureData(response.data)

  if (message) {
    console.log('验证通过，消息内容:', message)
  } else {
    console.error('数据验证失败')
  }
}
```

### 密钥管理服务

集中管理 RSA 密钥的服务模块：

```typescript
import { ref, computed } from 'vue'
import { rsaEncrypt, rsaDecrypt, rsaCanDecrypt } from '@/utils/rsa'
import { SystemConfig } from '@/systemConfig'

/**
 * RSA 密钥管理服务
 */
export const useRsaKeyService = () => {
  // 动态公钥（从服务端获取）
  const dynamicPublicKey = ref<string | null>(null)

  // 当前使用的公钥（优先使用动态获取的）
  const currentPublicKey = computed(() => {
    return dynamicPublicKey.value || SystemConfig.security.rsaPublicKey
  })

  // 密钥状态
  const keyStatus = ref<'unknown' | 'valid' | 'invalid'>('unknown')

  /**
   * 从服务端获取最新公钥
   */
  const fetchPublicKey = async () => {
    try {
      const response = await uni.request({
        url: `${SystemConfig.api.baseUrl}/auth/publicKey`,
        method: 'GET'
      })

      if (response.data.code === 200) {
        dynamicPublicKey.value = response.data.data
        keyStatus.value = 'valid'
        return true
      }

      return false
    } catch (error) {
      console.error('获取公钥失败:', error)
      return false
    }
  }

  /**
   * 验证密钥对是否匹配（仅开发环境）
   */
  const validateKeyPair = () => {
    if (!import.meta.env.DEV) {
      console.warn('密钥对验证仅在开发环境可用')
      return true
    }

    const publicKey = currentPublicKey.value
    const privateKey = SystemConfig.security.rsaPrivateKey

    if (!publicKey || !privateKey) {
      console.error('密钥未配置')
      keyStatus.value = 'invalid'
      return false
    }

    // 测试加解密
    const testData = 'validation_test_' + Date.now()
    const encrypted = rsaEncrypt(testData, publicKey)

    if (!encrypted) {
      console.error('测试加密失败')
      keyStatus.value = 'invalid'
      return false
    }

    const isValid = rsaCanDecrypt(encrypted, privateKey)
    keyStatus.value = isValid ? 'valid' : 'invalid'

    if (!isValid) {
      console.error('密钥对不匹配')
    }

    return isValid
  }

  /**
   * 使用当前公钥加密
   */
  const encrypt = (data: string): string | null => {
    return rsaEncrypt(data, currentPublicKey.value)
  }

  /**
   * 使用默认私钥解密
   */
  const decrypt = (data: string): string | null => {
    return rsaDecrypt(data)
  }

  /**
   * 检查加密功能是否启用
   */
  const isEncryptionEnabled = computed(() => {
    return SystemConfig.security.apiEncrypt
  })

  return {
    currentPublicKey,
    keyStatus,
    isEncryptionEnabled,
    fetchPublicKey,
    validateKeyPair,
    encrypt,
    decrypt
  }
}
```

## API

### 函数列表

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `rsaEncrypt` | RSA 公钥加密 | `(txt: string, pubKey?: string)` | `string \| null` |
| `rsaDecrypt` | RSA 私钥解密 | `(txt: string, privKey?: string)` | `string \| null` |
| `rsaCanDecrypt` | 验证是否可解密 | `(txt: string, privKey?: string)` | `boolean` |
| `rsaSign` | RSA 私钥签名 | `(txt: string, privKey?: string)` | `string \| null` |
| `rsaVerify` | 验证 RSA 签名 | `(txt: string, signature: string, pubKey?: string)` | `boolean` |

### 详细类型定义

```typescript
/**
 * RSA 公钥加密
 *
 * @param txt - 要加密的明文文本
 * @param pubKey - 可选的自定义公钥，不提供则使用 SystemConfig 中的默认公钥
 * @returns 加密后的 Base64 字符串，失败返回 null
 *
 * @example
 * // 使用默认公钥
 * const encrypted = rsaEncrypt('123456')
 *
 * // 使用自定义公钥
 * const encrypted = rsaEncrypt('123456', customPublicKey)
 */
function rsaEncrypt(txt: string, pubKey?: string): string | null

/**
 * RSA 私钥解密
 *
 * @param txt - 要解密的密文（Base64 格式）
 * @param privKey - 可选的自定义私钥，不提供则使用 SystemConfig 中的默认私钥
 * @returns 解密后的明文，失败返回 null
 *
 * @example
 * // 使用默认私钥
 * const decrypted = rsaDecrypt(encryptedData)
 *
 * // 使用自定义私钥
 * const decrypted = rsaDecrypt(encryptedData, customPrivateKey)
 */
function rsaDecrypt(txt: string, privKey?: string): string | null

/**
 * 检查加密文本是否可以被解密
 *
 * @param txt - 要检查的加密文本
 * @param privKey - 可选的私钥
 * @returns 如果可以解密返回 true，否则返回 false
 *
 * @example
 * const canDecrypt = rsaCanDecrypt(encryptedData)
 * if (canDecrypt) {
 *   const result = rsaDecrypt(encryptedData)
 * }
 */
function rsaCanDecrypt(txt: string, privKey?: string): boolean

/**
 * RSA 私钥签名
 * 使用 SHA256 哈希算法
 *
 * @param txt - 要签名的文本
 * @param privKey - 可选的私钥
 * @returns 签名字符串，失败返回 null
 *
 * @example
 * const signature = rsaSign(JSON.stringify(data))
 */
function rsaSign(txt: string, privKey?: string): string | null

/**
 * 验证 RSA 签名
 * 使用 SHA256 哈希算法
 *
 * @param txt - 原始文本
 * @param signature - 签名字符串
 * @param pubKey - 可选的公钥
 * @returns 签名有效返回 true，否则返回 false
 *
 * @example
 * const isValid = rsaVerify(originalData, signature)
 */
function rsaVerify(txt: string, signature: string, pubKey?: string): boolean
```

### 密钥格式说明

RSA 密钥支持两种格式：

```typescript
// 1. PEM 格式（带头尾标识）
const publicKeyPEM = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
-----END PUBLIC KEY-----`

const privateKeyPEM = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy...
-----END RSA PRIVATE KEY-----`

// 2. 纯 Base64 格式（不带头尾标识）
const publicKeyBase64 = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...'
const privateKeyBase64 = 'MIICXQIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy...'
```

**注意事项:**
- jsencrypt 库会自动处理两种格式，无需手动转换
- 环境变量中通常使用纯 Base64 格式，方便配置
- PEM 格式在多行时需要注意换行符的处理

### 依赖说明

```typescript
// rsa.ts 依赖的外部库

// 1. jsencrypt - RSA 加解密核心库
import JSEncrypt from 'jsencrypt/bin/jsencrypt.min.js'

// 2. crypto-js - 用于 SHA256 哈希计算
import CryptoJS from 'crypto-js'

// 3. SystemConfig - 系统配置，获取默认密钥
import { SystemConfig } from '@/systemConfig'
```

## 安全注意事项

### 1. 私钥保护

私钥是 RSA 加密体系中最敏感的部分，必须妥善保护：

```typescript
// ❌ 错误：在前端代码中硬编码私钥
const privateKey = 'MIICXQIBAAJBAKj34GkxFhD...' // 危险！

// ❌ 错误：将私钥存储在 localStorage
localStorage.setItem('privateKey', privateKey) // 危险！

// ✅ 正确：私钥仅在服务端使用
// 前端只使用公钥进行加密

// ✅ 正确：仅在开发环境使用私钥（用于测试）
if (import.meta.env.DEV) {
  // 开发环境可以使用配置的私钥进行测试
  const testPrivateKey = SystemConfig.security.rsaPrivateKey
}
```

### 2. 公钥获取方式

推荐从服务端动态获取公钥，而非硬编码：

```typescript
// ❌ 不推荐：硬编码公钥
const publicKey = 'MIGfMA0GCSqGSIb3DQEBA...'

// ✅ 推荐：从服务端获取
const fetchPublicKey = async () => {
  const response = await api.get('/auth/publicKey')
  return response.data.publicKey
}

// ✅ 或使用环境变量配置（适合公钥不常变更的场景）
const publicKey = SystemConfig.security.rsaPublicKey
```

### 3. 数据长度限制

RSA 加密有数据长度限制，与密钥长度相关：

```typescript
// RSA 加密数据长度限制
// 1024 位密钥: 最大加密 117 字节
// 2048 位密钥: 最大加密 245 字节

// 对于较长数据，使用 AES + RSA 混合加密
const hybridEncrypt = (data: string, publicKey: string) => {
  // 1. 生成随机 AES 密钥
  const aesKey = CryptoJS.lib.WordArray.random(32).toString()

  // 2. 使用 AES 加密数据
  const encryptedData = CryptoJS.AES.encrypt(data, aesKey).toString()

  // 3. 使用 RSA 加密 AES 密钥
  const encryptedKey = rsaEncrypt(aesKey, publicKey)

  if (!encryptedKey) {
    throw new Error('密钥加密失败')
  }

  return {
    key: encryptedKey,
    data: encryptedData
  }
}
```

### 4. 时间戳防重放

在签名中加入时间戳，防止重放攻击：

```typescript
const signWithTimestamp = (data: Record<string, any>) => {
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).substring(2)

  const signData = {
    ...data,
    timestamp,
    nonce
  }

  const signString = Object.keys(signData)
    .sort()
    .map(key => `${key}=${signData[key]}`)
    .join('&')

  return {
    ...signData,
    sign: rsaSign(signString)
  }
}

// 服务端验证时检查时间戳
const verifyTimestamp = (timestamp: number, maxAge = 5 * 60 * 1000) => {
  const now = Date.now()
  return Math.abs(now - timestamp) <= maxAge
}
```

### 5. 错误处理

妥善处理加解密错误，避免敏感信息泄露：

```typescript
// ❌ 错误：暴露详细错误信息
const handleEncrypt = (data: string) => {
  try {
    return rsaEncrypt(data)
  } catch (error) {
    // 危险：可能泄露密钥信息
    console.error('加密失败，密钥:', publicKey, error)
    throw error
  }
}

// ✅ 正确：统一错误处理
const handleEncrypt = (data: string) => {
  const result = rsaEncrypt(data)

  if (!result) {
    // 不暴露详细信息
    throw new Error('数据处理失败，请重试')
  }

  return result
}
```

## 最佳实践

### 1. 封装统一的加密服务

```typescript
// services/crypto.ts
import { rsaEncrypt, rsaDecrypt, rsaSign, rsaVerify } from '@/utils/rsa'
import { SystemConfig } from '@/systemConfig'

/**
 * 加密服务
 */
class CryptoService {
  private static instance: CryptoService

  static getInstance() {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService()
    }
    return CryptoService.instance
  }

  /**
   * 加密敏感数据
   */
  encryptSensitive(data: string): string {
    if (!SystemConfig.security.apiEncrypt) {
      return data // 未启用加密，返回原数据
    }

    const result = rsaEncrypt(data)
    if (!result) {
      throw new Error('加密失败')
    }
    return result
  }

  /**
   * 解密数据
   */
  decrypt(data: string): string {
    const result = rsaDecrypt(data)
    if (!result) {
      throw new Error('解密失败')
    }
    return result
  }

  /**
   * 签名数据
   */
  sign(data: string): string {
    const result = rsaSign(data)
    if (!result) {
      throw new Error('签名失败')
    }
    return result
  }

  /**
   * 验证签名
   */
  verify(data: string, signature: string): boolean {
    return rsaVerify(data, signature)
  }
}

export const cryptoService = CryptoService.getInstance()
```

### 2. 与请求拦截器集成

```typescript
// 请求拦截器中自动加密敏感字段
import { cryptoService } from '@/services/crypto'
import { SystemConfig } from '@/systemConfig'

// 需要加密的字段
const sensitiveFields = ['password', 'idCard', 'bankCard', 'cvv']

const encryptRequestData = (data: Record<string, any>) => {
  if (!SystemConfig.security.apiEncrypt) {
    return data
  }

  const result = { ...data }

  for (const field of sensitiveFields) {
    if (result[field]) {
      result[field] = cryptoService.encryptSensitive(result[field])
    }
  }

  return result
}

// 在请求拦截器中使用
uni.addInterceptor('request', {
  invoke(args) {
    if (args.data) {
      args.data = encryptRequestData(args.data)
    }
  }
})
```

### 3. 处理加密失败的降级策略

```typescript
/**
 * 带降级策略的加密函数
 */
const encryptWithFallback = async (
  data: string,
  options?: {
    retryCount?: number
    fallbackToPlain?: boolean
    onFallback?: () => void
  }
) => {
  const { retryCount = 3, fallbackToPlain = false, onFallback } = options || {}

  for (let i = 0; i < retryCount; i++) {
    const result = rsaEncrypt(data)
    if (result) {
      return { encrypted: result, isPlain: false }
    }

    // 重试前等待
    await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
  }

  // 所有重试都失败
  if (fallbackToPlain) {
    console.warn('加密失败，降级为明文传输')
    onFallback?.()
    return { encrypted: data, isPlain: true }
  }

  throw new Error('加密失败，请刷新页面重试')
}
```

### 4. 密钥轮换支持

```typescript
/**
 * 支持密钥轮换的加密服务
 */
const useKeyRotation = () => {
  const currentKeyVersion = ref(1)
  const keyCache = new Map<number, string>()

  // 获取指定版本的公钥
  const getPublicKey = async (version: number) => {
    if (keyCache.has(version)) {
      return keyCache.get(version)!
    }

    const response = await api.get(`/auth/publicKey?version=${version}`)
    const key = response.data.publicKey
    keyCache.set(version, key)

    return key
  }

  // 加密时带上密钥版本
  const encryptWithVersion = async (data: string) => {
    const publicKey = await getPublicKey(currentKeyVersion.value)
    const encrypted = rsaEncrypt(data, publicKey)

    return {
      data: encrypted,
      keyVersion: currentKeyVersion.value
    }
  }

  // 检查并更新密钥版本
  const checkKeyVersion = async () => {
    const response = await api.get('/auth/currentKeyVersion')
    const serverVersion = response.data.version

    if (serverVersion > currentKeyVersion.value) {
      currentKeyVersion.value = serverVersion
      await getPublicKey(serverVersion) // 预加载新密钥
    }
  }

  return {
    encryptWithVersion,
    checkKeyVersion,
    currentKeyVersion
  }
}
```

### 5. 批量数据加密优化

```typescript
/**
 * 批量加密优化
 * 对于多个字段需要加密的场景，减少重复创建加密器
 */
const batchEncrypt = (
  fields: Record<string, string>,
  publicKey?: string
): Record<string, string | null> => {
  const result: Record<string, string | null> = {}

  for (const [key, value] of Object.entries(fields)) {
    result[key] = rsaEncrypt(value, publicKey)
  }

  return result
}

// 使用示例
const encryptUserInfo = (userInfo: {
  idCard: string
  bankCard: string
  phone: string
}) => {
  const encrypted = batchEncrypt({
    idCard: userInfo.idCard,
    bankCard: userInfo.bankCard
  })

  // 检查是否都加密成功
  if (Object.values(encrypted).some(v => v === null)) {
    throw new Error('部分数据加密失败')
  }

  return {
    idCard: encrypted.idCard!,
    bankCard: encrypted.bankCard!,
    phone: userInfo.phone // 不加密
  }
}
```

## 常见问题

### 1. 加密返回 null？

**可能原因：**
- 公钥格式不正确或损坏
- 待加密数据为空
- 待加密数据过长超出 RSA 限制

**解决方案：**

```typescript
// 调试加密问题
const debugEncrypt = (data: string, publicKey?: string) => {
  // 检查数据
  if (!data) {
    console.error('待加密数据为空')
    return null
  }

  // 检查数据长度
  const maxLength = 245 // 2048 位密钥的限制
  if (data.length > maxLength) {
    console.error(`数据过长: ${data.length} > ${maxLength}`)
    return null
  }

  // 检查公钥
  const key = publicKey || SystemConfig.security.rsaPublicKey
  if (!key) {
    console.error('未配置公钥')
    return null
  }

  // 尝试加密
  const result = rsaEncrypt(data, key)
  if (!result) {
    console.error('加密失败，请检查公钥格式')
  }

  return result
}
```

### 2. 与服务端加解密结果不一致？

**可能原因：**
- 编码方式不同（UTF-8 vs GBK）
- 填充模式不同（PKCS1 vs OAEP）
- 密钥格式不匹配

**解决方案：**

```typescript
// 确保使用 UTF-8 编码
const encryptUtf8 = (data: string, publicKey: string) => {
  // jsencrypt 默认使用 UTF-8 和 PKCS1 填充
  return rsaEncrypt(data, publicKey)
}

// 如果服务端使用 OAEP 填充，需要使用其他库
// jsencrypt 仅支持 PKCS1v1.5 填充模式

// 验证配置一致性
const checkConfiguration = () => {
  console.log('前端配置:')
  console.log('- 库: jsencrypt')
  console.log('- 填充: PKCS1v1.5')
  console.log('- 编码: UTF-8')
  console.log('- 签名哈希: SHA256')

  // 建议服务端也使用相同配置
}
```

### 3. 小程序中使用报错？

**原因：** jsencrypt 库使用了浏览器特有的 API（如 `window`、`navigator`）

**解决方案：**

```typescript
// 方案 1: 使用 jsencrypt 的压缩版本
import JSEncrypt from 'jsencrypt/bin/jsencrypt.min.js'
// 已在源码中采用此方案

// 方案 2: 使用支持小程序的 RSA 库
// npm install miniprogram-sm-crypto
import { SM2 } from 'miniprogram-sm-crypto'

// 方案 3: 将加密操作放到服务端
const serverSideEncrypt = async (data: string) => {
  const response = await api.post('/crypto/encrypt', { data })
  return response.data.encrypted
}

// 方案 4: 使用云函数处理加密
const cloudEncrypt = async (data: string) => {
  const result = await uniCloud.callFunction({
    name: 'crypto',
    data: { action: 'encrypt', data }
  })
  return result.result.encrypted
}
```

### 4. 如何生成 RSA 密钥对？

**使用 OpenSSL 生成：**

```bash
# 生成 2048 位私钥
openssl genrsa -out private.pem 2048

# 从私钥提取公钥
openssl rsa -in private.pem -pubout -out public.pem

# 查看公钥内容（用于前端配置）
cat public.pem

# 转换为单行 Base64（去掉头尾）
openssl rsa -in private.pem -pubout | grep -v "^-" | tr -d '\n'
```

**使用 Node.js 生成：**

```javascript
const crypto = require('crypto')

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

console.log('公钥:', publicKey)
console.log('私钥:', privateKey)
```

### 5. 如何验证密钥对是否匹配？

```typescript
/**
 * 验证密钥对是否匹配
 */
const validateKeyPair = (publicKey: string, privateKey: string): boolean => {
  try {
    // 使用公钥加密测试数据
    const testData = 'key_pair_validation_' + Date.now()
    const encrypted = rsaEncrypt(testData, publicKey)

    if (!encrypted) {
      console.error('公钥加密失败')
      return false
    }

    // 使用私钥解密
    const decrypted = rsaDecrypt(encrypted, privateKey)

    // 验证解密结果
    const isValid = decrypted === testData

    if (!isValid) {
      console.error('密钥对不匹配：解密结果不一致')
    }

    return isValid
  } catch (error) {
    console.error('密钥对验证失败:', error)
    return false
  }
}

// 应用启动时验证
const initApp = () => {
  if (import.meta.env.DEV) {
    const isValid = validateKeyPair(
      SystemConfig.security.rsaPublicKey,
      SystemConfig.security.rsaPrivateKey
    )

    if (!isValid) {
      console.warn('⚠️ RSA 密钥对配置可能有问题，请检查环境变量')
    }
  }
}
```

### 6. 签名验证总是失败？

**可能原因：**
- 签名和验证使用的数据不一致
- 哈希算法不匹配
- 数据中有不可见字符

**解决方案：**

```typescript
/**
 * 调试签名问题
 */
const debugSign = (data: string) => {
  // 标准化数据（去除前后空白）
  const normalizedData = data.trim()

  // 生成签名
  const signature = rsaSign(normalizedData)
  console.log('原始数据:', JSON.stringify(normalizedData))
  console.log('数据长度:', normalizedData.length)
  console.log('签名结果:', signature)

  if (signature) {
    // 立即验证
    const isValid = rsaVerify(normalizedData, signature)
    console.log('自验证结果:', isValid)

    if (!isValid) {
      console.error('签名自验证失败，可能是密钥配置问题')
    }
  }

  return signature
}

// 确保签名和验证使用相同的数据处理逻辑
const prepareSignData = (params: Record<string, any>): string => {
  return Object.keys(params)
    .sort()
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${key}=${String(params[key]).trim()}`)
    .join('&')
}
```

### 7. 如何处理特殊字符？

```typescript
/**
 * 处理包含特殊字符的数据
 */
const encryptWithSpecialChars = (data: string): string | null => {
  // URL 编码处理特殊字符
  const encoded = encodeURIComponent(data)
  const encrypted = rsaEncrypt(encoded)

  return encrypted
}

const decryptWithSpecialChars = (encrypted: string): string | null => {
  const decrypted = rsaDecrypt(encrypted)

  if (decrypted) {
    // URL 解码恢复特殊字符
    return decodeURIComponent(decrypted)
  }

  return null
}

// 或使用 Base64 编码
const encryptBase64 = (data: string): string | null => {
  const base64 = btoa(unescape(encodeURIComponent(data)))
  return rsaEncrypt(base64)
}

const decryptBase64 = (encrypted: string): string | null => {
  const decrypted = rsaDecrypt(encrypted)

  if (decrypted) {
    return decodeURIComponent(escape(atob(decrypted)))
  }

  return null
}
```

### 8. 性能优化建议

```typescript
/**
 * RSA 加密性能优化
 */

// 1. 避免频繁创建加密器实例
let encryptorInstance: JSEncrypt | null = null

const getEncryptor = () => {
  if (!encryptorInstance) {
    encryptorInstance = new JSEncrypt()
  }
  return encryptorInstance
}

// 2. 对于批量操作，复用加密器
const batchEncryptOptimized = (
  dataList: string[],
  publicKey: string
): (string | null)[] => {
  const encryptor = getEncryptor()
  encryptor.setPublicKey(publicKey)

  return dataList.map(data => {
    try {
      return encryptor.encrypt(data)
    } catch {
      return null
    }
  })
}

// 3. 对于大量数据，使用 Web Worker
const encryptInWorker = (data: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const worker = new Worker('/workers/crypto.js')

    worker.postMessage({ action: 'encrypt', data })

    worker.onmessage = (e) => {
      resolve(e.data.result)
      worker.terminate()
    }

    worker.onerror = () => {
      resolve(null)
      worker.terminate()
    }
  })
}
```
