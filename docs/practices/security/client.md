# 客户端安全

## 介绍

客户端安全涵盖Web前端和移动端应用的安全防护，包括XSS防护、敏感数据处理、Token管理、请求加密、安全存储等多个方面。

**核心特性：**

- **XSS防护** - 输入过滤、输出编码、CSP策略
- **Token安全** - 安全存储、自动刷新、过期处理
- **请求加密** - AES+RSA混合加密传输
- **安全存储** - 敏感数据加密存储
- **输入验证** - 前端表单验证和过滤

---

## XSS防护

### 输入过滤

```typescript
/**
 * XSS字符过滤
 */
export function filterXss(input: string): string {
  if (!input) return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 富文本XSS过滤(白名单模式)
 */
export function sanitizeHtml(html: string): string {
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'span']
  const allowedAttrs = ['class', 'style']
  // 使用DOMPurify或类似库进行过滤
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs
  })
}
```

### Vue模板安全

```vue
<template>
  <!-- ✅ 安全：自动转义 -->
  <div>{{ userInput }}</div>

  <!-- ❌ 危险：原始HTML -->
  <div v-html="userInput"></div>

  <!-- ✅ 安全：过滤后的HTML -->
  <div v-html="sanitizedHtml"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { sanitizeHtml } from '@/utils/xss'

const props = defineProps<{ userInput: string }>()

const sanitizedHtml = computed(() => sanitizeHtml(props.userInput))
</script>
```

### CSP策略配置

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
">
```

---

## Token管理

### 安全存储

```typescript
// Web端：使用httpOnly Cookie或加密存储
class TokenManager {
  private static readonly TOKEN_KEY = 'access_token'
  private static readonly REFRESH_KEY = 'refresh_token'

  // 存储Token
  static setToken(token: string, refreshToken?: string) {
    // 优先使用sessionStorage(关闭浏览器自动清除)
    sessionStorage.setItem(this.TOKEN_KEY, token)
    if (refreshToken) {
      sessionStorage.setItem(this.REFRESH_KEY, refreshToken)
    }
  }

  // 获取Token
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY)
  }

  // 清除Token
  static clearToken() {
    sessionStorage.removeItem(this.TOKEN_KEY)
    sessionStorage.removeItem(this.REFRESH_KEY)
  }
}
```

### UniApp存储

```typescript
// UniApp端：加密存储
import { encrypt, decrypt } from '@/utils/crypto'

class UniTokenManager {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly SECRET = 'your-secret-key'

  // 加密存储Token
  static setToken(token: string) {
    const encrypted = encrypt(token, this.SECRET)
    uni.setStorageSync(this.TOKEN_KEY, encrypted)
  }

  // 解密获取Token
  static getToken(): string | null {
    const encrypted = uni.getStorageSync(this.TOKEN_KEY)
    if (!encrypted) return null
    return decrypt(encrypted, this.SECRET)
  }

  // 清除Token
  static clearToken() {
    uni.removeStorageSync(this.TOKEN_KEY)
  }
}
```

### 自动刷新Token

```typescript
// 请求拦截器
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Token过期，尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = TokenManager.getRefreshToken()
        const { data } = await axios.post('/auth/refresh', { refreshToken })
        TokenManager.setToken(data.accessToken, data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        TokenManager.clearToken()
        router.push('/login')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 请求加密

### 前端加密实现

```typescript
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

const RSA_PUBLIC_KEY = 'MIIBIjANBgkqhki...'

/**
 * 生成随机AES密钥
 */
function generateAesKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}

/**
 * AES加密
 */
function encryptByAes(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString()
}

/**
 * RSA加密AES密钥
 */
function encryptByRsa(data: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(RSA_PUBLIC_KEY)
  return encrypt.encrypt(data) || ''
}

/**
 * 发送加密请求
 */
export async function sendEncryptedRequest(url: string, data: any) {
  // 1. 生成AES密钥
  const aesKey = generateAesKey()
  // 2. AES加密数据
  const encryptedData = encryptByAes(JSON.stringify(data), aesKey)
  // 3. RSA加密AES密钥
  const encryptedKey = encryptByRsa(aesKey)

  // 4. 发送请求
  return axios.post(url, encryptedData, {
    headers: {
      'Content-Type': 'text/plain',
      'encrypt-key': encryptedKey
    }
  })
}
```

### 响应解密

```typescript
/**
 * AES解密
 */
function decryptByAes(data: string, key: string): string {
  const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// 响应拦截器处理解密
axios.interceptors.response.use(response => {
  const encryptKey = response.headers['encrypt-key']
  if (encryptKey && typeof response.data === 'string') {
    // 解密响应数据
    const aesKey = decryptByRsa(encryptKey, RSA_PRIVATE_KEY)
    response.data = JSON.parse(decryptByAes(response.data, aesKey))
  }
  return response
})
```

---

## 输入验证

### 表单验证规则

```typescript
// 验证规则定义
export const validationRules = {
  // 用户名：4-20位字母数字下划线
  username: /^[a-zA-Z0-9_]{4,20}$/,
  // 密码：8-20位，包含大小写字母和数字
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/,
  // 手机号
  phone: /^1[3-9]\d{9}$/,
  // 邮箱
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // 身份证
  idCard: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
}

/**
 * 验证输入
 */
export function validate(value: string, type: keyof typeof validationRules): boolean {
  return validationRules[type].test(value)
}
```

### Element Plus表单验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '4-20位字母数字下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度8-20位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          callback(new Error('密码需包含大小写字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
</script>
```

### UniApp表单验证

```vue
<template>
  <wd-form :model="form" :rules="rules" ref="formRef">
    <wd-cell-group>
      <wd-input
        label="手机号"
        v-model="form.phone"
        prop="phone"
        placeholder="请输入手机号"
      />
      <wd-input
        label="验证码"
        v-model="form.code"
        prop="code"
        placeholder="请输入验证码"
      />
    </wd-cell-group>
  </wd-form>
</template>

<script lang="ts" setup>
const rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字' }
  ]
}
</script>
```

---

## 安全存储

### Web端安全存储

```typescript
import CryptoJS from 'crypto-js'

class SecureStorage {
  private static readonly SECRET = 'your-encryption-key'

  // 加密存储
  static setItem(key: string, value: any) {
    const data = JSON.stringify(value)
    const encrypted = CryptoJS.AES.encrypt(data, this.SECRET).toString()
    localStorage.setItem(key, encrypted)
  }

  // 解密读取
  static getItem<T>(key: string): T | null {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET)
      const data = bytes.toString(CryptoJS.enc.Utf8)
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  // 删除
  static removeItem(key: string) {
    localStorage.removeItem(key)
  }
}
```

### UniApp安全存储

```typescript
class UniSecureStorage {
  private static readonly SECRET = 'your-encryption-key'

  // 加密存储
  static set(key: string, value: any) {
    const data = JSON.stringify(value)
    const encrypted = encrypt(data, this.SECRET)
    uni.setStorageSync(key, encrypted)
  }

  // 解密读取
  static get<T>(key: string): T | null {
    const encrypted = uni.getStorageSync(key)
    if (!encrypted) return null
    try {
      const data = decrypt(encrypted, this.SECRET)
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  // 清除敏感数据
  static clearSensitive() {
    const sensitiveKeys = ['token', 'userInfo', 'payInfo']
    sensitiveKeys.forEach(key => uni.removeStorageSync(key))
  }
}
```

---

## 移动端特有安全

### 页面权限控制

```typescript
// 路由守卫
const whiteList = ['/pages/login/index', '/pages/register/index']

export function setupRouterGuard() {
  const list = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']

  list.forEach(item => {
    uni.addInterceptor(item, {
      invoke(args) {
        const token = uni.getStorageSync('token')
        const url = args.url.split('?')[0]

        if (!token && !whiteList.includes(url)) {
          uni.redirectTo({ url: '/pages/login/index' })
          return false
        }
        return true
      }
    })
  })
}
```

### 防截屏/录屏

```typescript
// App端防截屏
// #ifdef APP-PLUS
plus.navigator.setSecureScreen(true)
// #endif
```

### 安全键盘

```vue
<!-- 密码输入使用安全键盘 -->
<wd-input
  v-model="password"
  type="password"
  :adjust-position="false"
  placeholder="请输入密码"
/>
```

### 生物认证

```typescript
// 指纹/面容认证
async function bioAuth(): Promise<boolean> {
  // #ifdef APP-PLUS
  const supported = await uni.checkIsSupportSoterAuthentication()
  if (supported.supportMode.includes('fingerPrint')) {
    try {
      await uni.startSoterAuthentication({
        requestAuthModes: ['fingerPrint'],
        challenge: 'login-challenge'
      })
      return true
    } catch {
      return false
    }
  }
  // #endif
  return false
}
```

---

## 安全检查清单

### XSS防护

- [ ] 用户输入进行XSS过滤
- [ ] 避免使用 `v-html` 或进行过滤
- [ ] 配置CSP策略
- [ ] 第三方脚本进行审查

### Token安全

- [ ] Token存储在sessionStorage或加密存储
- [ ] 实现Token自动刷新
- [ ] 退出登录时清除所有Token
- [ ] 敏感操作验证Token有效性

### 数据传输

- [ ] 敏感接口使用HTTPS
- [ ] 敏感数据加密传输
- [ ] 请求参数签名验证

### 移动端

- [ ] 敏感页面防截屏
- [ ] 支付等操作使用安全键盘
- [ ] 实现生物认证
- [ ] 页面级权限控制

---

## 常见问题

### 1. XSS攻击防护

**问题场景：** 用户评论中包含恶意脚本

**解决方案：**
```typescript
// 输入时过滤
const safeInput = filterXss(userInput)

// 输出时使用文本插值
// ✅ {{ userInput }} 自动转义
// ❌ v-html="userInput" 危险
```

### 2. Token泄露风险

**问题场景：** localStorage中的Token被XSS窃取

**解决方案：**
```typescript
// 使用sessionStorage替代localStorage
sessionStorage.setItem('token', token)

// 或使用httpOnly Cookie
// 由后端设置，前端无法通过JS访问
```

### 3. 敏感数据缓存

**问题场景：** 支付信息等敏感数据被缓存

**解决方案：**
```typescript
// 敏感数据不缓存，使用后立即清除
function handlePayment(cardInfo: CardInfo) {
  try {
    await pay(cardInfo)
  } finally {
    // 清除敏感数据
    cardInfo = null
  }
}

// 退出时清除所有敏感缓存
function logout() {
  SecureStorage.clearSensitive()
  TokenManager.clearToken()
}
```

### 4. 移动端页面劫持

**问题场景：** 恶意应用截取敏感页面

**解决方案：**
```typescript
// 敏感页面启用防截屏
onShow(() => {
  // #ifdef APP-PLUS
  plus.navigator.setSecureScreen(true)
  // #endif
})

onHide(() => {
  // #ifdef APP-PLUS
  plus.navigator.setSecureScreen(false)
  // #endif
})
```

