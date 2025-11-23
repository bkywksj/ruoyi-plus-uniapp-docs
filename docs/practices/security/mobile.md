# 移动端安全

本文档详细介绍 RuoYi-Plus-UniApp 移动端应用的安全防护策略和实践。移动端安全是应用安全的重要组成部分,需要在数据加密、本地存储、网络通信、权限控制等多个层面进行综合防护。

## 概述

移动端安全面临的挑战与传统Web应用有所不同,主要包括设备丢失风险、不可信的运行环境、网络窃听、逆向工程等。本框架在以下方面提供了完善的安全机制:

**核心安全能力**:

- **数据加密** - AES + RSA 混合加密,保护敏感数据传输
- **安全存储** - 统一的缓存管理,支持数据过期和自动清理
- **Token管理** - 安全的令牌存储和自动续期机制
- **请求安全** - 防重复提交、请求签名、超时控制
- **WebSocket安全** - 安全的实时通信通道
- **XSS防护** - HTML转义和输入过滤
- **多平台适配** - 针对不同小程序平台的安全处理

**技术栈**:

- 加密库: CryptoJS (AES) + JSEncrypt (RSA)
- 存储: UniApp Storage API
- HTTP: uni.request 封装
- WebSocket: uni.connectSocket 封装

## 数据加密

### AES对称加密

移动端使用 AES (Advanced Encryption Standard) 对称加密算法对数据进行加密。AES 加密具有高性能的特点,适合移动端大量数据的加密场景。

```typescript
import CryptoJS from 'crypto-js'

/**
 * 随机生成32位的字符串
 */
export const generateRandomString = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * 随机生成AES密钥
 */
export const generateAesKey = (): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf8.parse(generateRandomString())
}

/**
 * 使用AES密钥加密数据
 */
export const encryptWithAes = (
  message: string,
  aesKey: CryptoJS.lib.WordArray
): string => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

/**
 * 使用AES密钥解密数据
 */
export const decryptWithAes = (
  message: string,
  aesKey: CryptoJS.lib.WordArray
): string => {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

**加密配置说明**:

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 算法 | AES | 高级加密标准 |
| 模式 | ECB | 电子密码本模式 |
| 填充 | PKCS7 | 标准填充方式 |
| 密钥长度 | 256位 | 32字符生成 |

### RSA非对称加密

RSA 非对称加密用于加密 AES 密钥,实现安全的密钥交换。公钥加密、私钥解密的机制确保只有合法的接收方能解密数据。

```typescript
import JSEncrypt from 'jsencrypt/bin/jsencrypt.min.js'
import { SystemConfig } from '@/systemConfig'

// 从配置获取默认密钥
const defaultPublicKey = SystemConfig.security.rsaPublicKey
const defaultPrivateKey = SystemConfig.security.rsaPrivateKey

/**
 * 创建加密器实例
 */
const createEncryptor = (): JSEncrypt => {
  return new JSEncrypt()
}

/**
 * 使用RSA公钥加密文本
 */
export const rsaEncrypt = (
  txt: string,
  pubKey?: string
): string | null => {
  try {
    if (!txt) return null

    const encryptor = createEncryptor()
    const keyToUse = pubKey || defaultPublicKey

    encryptor.setPublicKey(keyToUse)
    return encryptor.encrypt(txt)
  } catch (err) {
    console.error('RSA加密失败:', err)
    return null
  }
}

/**
 * 使用RSA私钥解密文本
 */
export const rsaDecrypt = (
  txt: string,
  privKey?: string
): string | null => {
  try {
    if (!txt) return null

    const encryptor = createEncryptor()
    const keyToUse = privKey || defaultPrivateKey

    encryptor.setPrivateKey(keyToUse)
    return encryptor.decrypt(txt)
  } catch (err) {
    console.error('RSA解密失败:', err)
    return null
  }
}

/**
 * 使用RSA私钥签名文本
 */
export const rsaSign = (
  txt: string,
  privKey?: string
): string | null => {
  try {
    const encryptor = createEncryptor()
    const keyToUse = privKey || defaultPrivateKey

    encryptor.setPrivateKey(keyToUse)
    return encryptor.sign(txt, CryptoJS.SHA256, 'sha256')
  } catch (err) {
    console.error('RSA签名失败:', err)
    return null
  }
}

/**
 * 验证RSA签名
 */
export const rsaVerify = (
  txt: string,
  signature: string,
  pubKey?: string
): boolean => {
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

### 混合加密方案

实际应用中采用 AES + RSA 混合加密方案,兼顾安全性和性能:

```typescript
/**
 * 一步完成加密过程 - 生成密钥、加密数据并返回结果
 */
export const encryptWithAutoKey = (
  data: string | object
): { encryptedData: string; key: CryptoJS.lib.WordArray } => {
  const key = generateAesKey()
  const message = typeof data === 'object' ? JSON.stringify(data) : data
  const encryptedData = encryptWithAes(message, key)

  return {
    encryptedData,
    key,
  }
}

/**
 * 使用提供的密钥解密数据
 */
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

**混合加密流程**:

```
1. 生成随机 AES 密钥
2. 使用 AES 密钥加密业务数据
3. 使用 RSA 公钥加密 AES 密钥
4. 将加密的数据和加密的密钥一起发送
5. 服务端用 RSA 私钥解密得到 AES 密钥
6. 服务端用 AES 密钥解密业务数据
```

### 哈希计算

哈希函数用于数据完整性校验和唯一标识生成:

```typescript
/**
 * 计算字符串的SHA-256哈希值
 */
export const computeSha256Hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
}

/**
 * 计算字符串的MD5哈希值
 */
export const computeMd5Hash = (data: string): string => {
  return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex)
}

/**
 * 生成图片的唯一哈希标识
 */
export const generateImageHash = (base64Data: string): string => {
  return computeSha256Hash(base64Data)
}

/**
 * 异步生成文件的哈希标识
 */
export const generateFileHash = async (
  file: Blob | File | ArrayBuffer
): Promise<string> => {
  let arrayBuffer: ArrayBuffer

  if (file instanceof Blob || file instanceof File) {
    arrayBuffer = await file.arrayBuffer()
  } else {
    arrayBuffer = file
  }

  const uint8Array = new Uint8Array(arrayBuffer)
  let binaryString = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i])
  }

  return computeSha256Hash(binaryString)
}
```

## 安全存储

### 统一缓存管理

移动端采用统一的缓存管理机制,提供数据隔离、过期控制和自动清理功能:

```typescript
import { SystemConfig } from '@/systemConfig'

// 缓存键前缀，防止多应用冲突
const KEY_PREFIX = `${SystemConfig.app.id}:`

/**
 * 为缓存键添加应用前缀
 */
const getPrefixedKey = (key: string): string => {
  return `${KEY_PREFIX}${key}`
}

/**
 * 数据包装器（用于添加过期时间）
 */
interface CacheWrapper<T = any> {
  data: T
  _expire?: number // 过期时间戳（毫秒）
}

/**
 * 缓存工具对象
 */
export const cache = {
  /**
   * 设置缓存（支持任意类型）
   */
  set<T>(key: string, value: T, expireSeconds?: number): boolean {
    if (key == null || value == null) {
      return false
    }

    try {
      const prefixedKey = getPrefixedKey(key)

      const wrapper: CacheWrapper<T> = {
        data: value,
        _expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined,
      }

      uni.setStorageSync(prefixedKey, wrapper)
      return true
    } catch (e) {
      console.error('缓存设置失败:', e)
      return false
    }
  },

  /**
   * 获取缓存
   */
  get<T = any>(key: string): T | null {
    if (key == null) {
      return null
    }

    try {
      const prefixedKey = getPrefixedKey(key)
      const wrapper: CacheWrapper<T> = uni.getStorageSync(prefixedKey)

      if (!wrapper || typeof wrapper !== 'object') {
        return null
      }

      // 检查过期时间
      if (wrapper._expire && wrapper._expire < Date.now()) {
        this.remove(key)
        return null
      }

      return wrapper.data as T
    } catch (e) {
      console.error(`缓存获取失败 [${key}]:`, e)
      this.remove(key)
      return null
    }
  },

  /**
   * 移除缓存项
   */
  remove(key: string): void {
    if (key == null) return

    try {
      const prefixedKey = getPrefixedKey(key)
      uni.removeStorageSync(prefixedKey)
    } catch (e) {
      console.error('缓存删除失败:', e)
    }
  },

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== null
  },

  /**
   * 清除所有应用缓存
   */
  clearAll(): void {
    try {
      const storageInfo = uni.getStorageInfoSync()
      const keysToRemove = storageInfo.keys.filter(
        key => key.startsWith(KEY_PREFIX)
      )

      keysToRemove.forEach((key) => {
        uni.removeStorageSync(key)
      })

      console.log(`清除了 ${keysToRemove.length} 个缓存项`)
    } catch (e) {
      console.error('清除缓存失败:', e)
    }
  },
}
```

**缓存安全特性**:

| 特性 | 说明 | 安全价值 |
|------|------|----------|
| 应用前缀隔离 | 使用 `appId:` 前缀 | 防止多应用数据冲突 |
| 过期时间控制 | 支持秒级过期设置 | 限制敏感数据留存时间 |
| 自动清理 | 定时清理过期数据 | 减少数据泄露风险 |
| 类型保持 | 自动序列化/反序列化 | 防止类型转换漏洞 |

### 自动过期清理

系统在启动时和运行期间自动清理过期的缓存数据:

```typescript
/**
 * 自动清理过期数据
 */
const autoCleanup = (): void => {
  try {
    const storageInfo = uni.getStorageInfoSync()
    const now = Date.now()
    const keysToRemove: string[] = []

    // 检查所有带前缀的 key
    for (const key of storageInfo.keys) {
      if (key.startsWith(KEY_PREFIX)) {
        try {
          const wrapper: CacheWrapper = uni.getStorageSync(key)
          if (wrapper && wrapper._expire && wrapper._expire < now) {
            keysToRemove.push(key)
          }
        } catch (e) {
          // 读取失败的数据也删除
          keysToRemove.push(key)
        }
      }
    }

    // 删除过期数据
    keysToRemove.forEach((key) => {
      uni.removeStorageSync(key)
    })

    if (keysToRemove.length > 0) {
      console.log(`清理了 ${keysToRemove.length} 个过期缓存项`)
    }
  } catch (e) {
    console.warn('自动清理失败:', e)
  }
}

// 应用启动时自动清理过期数据
if (typeof uni !== 'undefined') {
  setTimeout(() => {
    autoCleanup()
  }, 1000)

  // 每10分钟清理一次过期数据
  setInterval(() => {
    autoCleanup()
  }, 10 * 60 * 1000)
}
```

### 存储统计监控

提供存储使用情况的监控能力:

```typescript
/**
 * 获取缓存统计信息
 */
getStats(): {
  totalKeys: number
  appKeys: number
  currentSize: number
  limitSize: number
  usagePercent: number
} | null {
  try {
    const info = uni.getStorageInfoSync()
    const appKeys = info.keys.filter(key => key.startsWith(KEY_PREFIX))

    return {
      totalKeys: info.keys.length,
      appKeys: appKeys.length,
      currentSize: info.currentSize || 0,
      limitSize: info.limitSize || 10 * 1024 * 1024, // 默认10MB
      usagePercent: Math.round(
        ((info.currentSize || 0) / (info.limitSize || 10 * 1024 * 1024)) * 100
      ),
    }
  } catch (e) {
    console.error('获取存储统计失败:', e)
    return null
  }
}
```

## Token管理

### 安全的Token存储

Token 是用户身份认证的核心凭证,需要安全存储和管理:

```typescript
import { cache } from '@/utils/cache'

/**
 * Token 管理钩子 (useToken)
 */
export const useToken = () => {
  const TOKEN_KEY = 'token'

  /**
   * 获取 token
   */
  const getToken = (): string | null => {
    return cache.get(TOKEN_KEY)
  }

  /**
   * 设置 token
   */
  const setToken = (accessToken: string): void => {
    // 设置缓存，7天后过期（安全实践）
    const success = cache.set(TOKEN_KEY, accessToken, 7 * 24 * 3600)

    if (!success) {
      console.error('Token 设置失败')
    }
  }

  /**
   * 移除 token
   */
  const removeToken = (): void => {
    cache.remove(TOKEN_KEY)
  }

  /**
   * 获取认证头部
   */
  const getAuthHeaders = (): Record<string, string> => {
    const tokenValue = getToken()
    if (!tokenValue) {
      return {}
    }

    return {
      Authorization: `Bearer ${tokenValue}`,
    }
  }

  /**
   * 获取认证查询字符串
   */
  const getAuthQuery = (): string => {
    const headers = getAuthHeaders()
    return objectToQuery(headers)
  }

  /**
   * 计算属性，用于响应式获取 token
   */
  const token = computed({
    get: () => cache.get(TOKEN_KEY),
    set: (value: string | null) => {
      if (value) {
        setToken(value)
      } else {
        removeToken()
      }
    },
  })

  return {
    token,
    getToken,
    setToken,
    removeToken,
    getAuthHeaders,
    getAuthQuery,
  }
}
```

**Token安全策略**:

| 策略 | 实现方式 | 说明 |
|------|----------|------|
| 有限过期 | 7天自动过期 | 限制Token生命周期 |
| 安全存储 | 统一缓存层 | 应用隔离存储 |
| Bearer认证 | Authorization头 | 标准JWT认证方式 |
| 自动清理 | 退出时移除 | 防止Token泄露 |

## 请求安全

### HTTP请求封装

移动端 HTTP 请求封装了多层安全机制:

```typescript
import { SystemConfig } from '@/systemConfig'

/** 加密请求头名称 */
const ENCRYPT_HEADER = 'encrypt-key'

/** 请求ID请求头名称 */
const REQUEST_ID_HEADER = 'X-Request-Id'

/** 防重复提交 - 只存储最后一次提交信息 */
let lastSubmit: { key: string; time: number } | null = null

/**
 * 生成请求ID
 */
const generateRequestId = (): string => {
  return formatDate(new Date(), 'yyyyMMddHHmmssSSS')
}

/**
 * 检查重复提交
 */
const checkRepeatSubmit = (url: string, data: any): boolean => {
  const key = `${url}-${JSON.stringify(data)}`
  const now = Date.now()

  // 检查是否是重复提交
  if (lastSubmit && lastSubmit.key === key && now - lastSubmit.time < 500) {
    return false
  }

  // 更新最后一次提交
  lastSubmit = { key, time: now }
  return true
}

/**
 * 加密请求数据
 */
const encryptRequestData = (data: any, header: Record<string, any>) => {
  if (!SystemConfig.security?.apiEncrypt || !data) return data

  const aesKey = generateAesKey()
  header[ENCRYPT_HEADER] = rsaEncrypt(encodeBase64(aesKey))

  return typeof data === 'object'
    ? encryptWithAes(JSON.stringify(data), aesKey)
    : encryptWithAes(data, aesKey)
}

/**
 * 解密响应数据
 */
const decryptResponseData = (data: any, header: Record<string, any>): any => {
  if (!SystemConfig.security?.apiEncrypt) return data

  const encryptKey = header[ENCRYPT_HEADER] || header[ENCRYPT_HEADER.toLowerCase()]
  if (!encryptKey) return data

  try {
    const base64Str = rsaDecrypt(encryptKey)
    const aesKey = decodeBase64(base64Str)
    const decryptedData = decryptWithAes(data, aesKey)
    return JSON.parse(decryptedData)
  } catch (error) {
    console.error('[响应解密失败]', error)
    throw new Error('响应数据解密失败')
  }
}
```

### 请求配置构建

安全的请求配置构建过程:

```typescript
/**
 * 构建请求选项
 */
const buildRequestOptions = (
  url: string,
  method: UniApp.RequestOptions['method'],
  data?: any,
  config?: CustomRequestOptions
): UniApp.RequestOptions => {
  // 1. 处理 URL
  if (!url.startsWith('http')) {
    url = SystemConfig.api.baseUrl + url
  }

  // 2. 处理查询参数
  const queryParams = config?.query || config?.params
  if (queryParams) {
    const queryStr = objectToQuery(queryParams)
    if (queryStr) {
      url += (url.includes('?') ? '&' : '?') + queryStr
    }
  }

  // 3. GET 请求参数处理
  if (method === 'GET' && data) {
    const queryStr = objectToQuery(data)
    if (queryStr) {
      url += (url.includes('?') ? '&' : '?') + queryStr
    }
    data = undefined
  }

  // 4. 构建请求头
  const header: Record<string, any> = {
    'Content-Type': 'application/json;charset=utf-8',
    'Content-Language': getLanguage(),
    [REQUEST_ID_HEADER]: generateRequestId(),
    ...config?.header,
  }

  // 5. 认证处理
  if (config?.header?.auth !== false) {
    Object.assign(header, useToken().getAuthHeaders())
  }

  // 6. 租户处理
  if (config?.header?.tenant !== false) {
    const tenantId = getTenantId()
    if (tenantId) {
      header['X-Tenant-Id'] = tenantId
    }
  }

  // 7. 防重复提交
  if (config?.header?.repeatSubmit !== false &&
      (method === 'POST' || method === 'PUT')) {
    if (!checkRepeatSubmit(url, data)) {
      throw new Error('数据正在处理，请勿重复提交')
    }
  }

  // 8. 加密处理
  if (SystemConfig.security?.apiEncrypt &&
      config?.header?.isEncrypt &&
      (method === 'POST' || method === 'PUT')) {
    data = encryptRequestData(data, header)
  }

  return {
    url,
    method,
    data,
    ...config,
    header,
    timeout: config?.timeout || 50000,
  }
}
```

### 链式调用安全配置

提供链式调用方式配置安全选项:

```typescript
/**
 * HTTP 请求服务
 */
export const useHttp = (defaultConfig?: CustomRequestOptions) => {
  let chainConfig: CustomRequestOptions = {}

  /**
   * 链式调用：禁用认证
   */
  const noAuth = () => {
    chainConfig.header = { ...chainConfig.header, auth: false }
    return httpInstance
  }

  /**
   * 链式调用：启用加密
   */
  const encrypt = () => {
    chainConfig.header = { ...chainConfig.header, isEncrypt: true }
    return httpInstance
  }

  /**
   * 链式调用：禁用防重复提交
   */
  const noRepeatSubmit = () => {
    chainConfig.header = { ...chainConfig.header, repeatSubmit: false }
    return httpInstance
  }

  /**
   * 链式调用：禁用租户信息
   */
  const noTenant = () => {
    chainConfig.header = { ...chainConfig.header, tenant: false }
    return httpInstance
  }

  /**
   * 链式调用：跳过初始化等待
   */
  const skipWait = () => {
    chainConfig.skipWait = true
    return httpInstance
  }

  /**
   * 链式调用：禁用错误提示
   */
  const noMsgError = () => {
    ;(chainConfig as any).noMsgError = true
    return httpInstance
  }

  /**
   * 链式调用：设置超时时间
   */
  const timeout = (ms: number) => {
    chainConfig.timeout = ms
    return httpInstance
  }

  // ... 返回实例
}

// 使用示例
const [err, token] = await http.noAuth().encrypt().skipWait()
  .post<LoginResult>('/api/login', data)
```

### 未授权处理

自动处理401未授权响应:

```typescript
/** 是否显示重新登录 */
const isReLogin = { show: false }

/**
 * 处理未授权
 */
const handleUnauthorized = async () => {
  if (isReLogin.show) return

  isReLogin.show = true

  try {
    const userStore = useUserStore()
    await userStore.logoutUser()

    const currentPath = `/${getCurrentPage()?.route}`
    uni.navigateTo({
      url: `/pages/auth/login?redirect=${currentPath}`,
    })
  } finally {
    isReLogin.show = false
  }
}

/**
 * 处理响应
 */
const handleResponse = <T>(
  response: UniApp.RequestSuccessCallbackResult,
  config?: CustomRequestOptions
): T => {
  // ... 解密处理

  const code = apiResponse?.code || 200
  const msg = apiResponse?.msg || ''

  if (code === 401) {
    handleUnauthorized()
    toast.error('未登录或登陆已过期~')
    throw new Error('未登录或登陆已过期~')
  }

  // ... 其他处理
}
```

## WebSocket安全

### 安全连接建立

WebSocket连接需要附带认证信息:

```typescript
/**
 * 构造WebSocket连接URL
 */
const buildWebSocketUrl = (): string => {
  const token = getToken()
  if (!token) {
    console.warn('[WebSocket] 未找到有效token，可能影响连接认证')
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}Authorization=${encodeURIComponent(`Bearer ${token}`)}`
}

/**
 * 建立WebSocket连接
 */
const connect = () => {
  const finalUrl = buildWebSocketUrl()
  console.log(`🔗 正在连接WebSocket: ${url}`)

  status.value = 'CONNECTING'

  try {
    socketTask = uni.connectSocket({
      url: finalUrl,
      complete: () => {},
    })

    // 连接打开事件
    socketTask.onOpen(() => {
      console.log('✅ WebSocket连接已建立')
      status.value = 'OPEN'
      currentRetryCount = 0
      isManuallyClose = false

      startHeartbeat()
      options.onConnected?.()
    })

    // ... 其他事件处理
  } catch (error) {
    console.error('❌ WebSocket连接创建失败:', error)
    status.value = 'CLOSED'
    options.onError?.(error)
  }
}
```

### 心跳保活机制

定时发送心跳消息保持连接活跃:

```typescript
// 心跳定时器
let heartbeatTimer: number | null = null

/**
 * 启动心跳检测
 */
const startHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
  }

  heartbeatTimer = setInterval(() => {
    if (isConnected.value && socketTask) {
      send(JSON.stringify({
        type: 'ping',
        timestamp: Date.now(),
      }))
    }
  }, 30000) as unknown as number
}

/**
 * 停止心跳检测
 */
const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}
```

### 断线重连策略

使用指数退避算法进行断线重连:

```typescript
// 退避策略配置
const maxRetries = 8
const baseDelay = 3 // 秒

/**
 * 动态计算退避延迟时间
 * 规律：3 -> 6 -> 12 -> 24 -> 48 -> 96 -> 192 -> 384 秒
 */
const calculateRetryDelay = (retryIndex: number): number => {
  const delaySeconds = baseDelay * 2 ** retryIndex
  return delaySeconds * 1000
}

/**
 * 自定义退避重连逻辑
 */
const attemptReconnect = () => {
  if (isManuallyClose) {
    console.log('🛑 手动关闭连接，停止重连')
    return
  }

  if (currentRetryCount >= maxRetries) {
    console.log(`🛑 WebSocket重试${maxRetries}次后连接失败，停止重试`)
    return
  }

  const delay = calculateRetryDelay(currentRetryCount)
  const delaySeconds = delay / 1000

  console.log(`🔄 WebSocket将在${delaySeconds}秒后进行第${currentRetryCount + 1}次重连...`)

  retryTimeoutId = setTimeout(() => {
    console.log(`🚀 开始第${currentRetryCount + 1}次重连尝试...`)
    currentRetryCount++
    connect()
  }, delay) as unknown as number
}
```

### 消息处理管道

使用责任链模式处理WebSocket消息:

```typescript
/**
 * 消息处理器接口
 */
export interface MessageHandler {
  handle: (message: WSMessage) => boolean
}

/**
 * 心跳消息处理器
 */
export class HeartbeatHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.HEARTBEAT) {
      console.log('💓 心跳消息:', message.data)
      return false // 阻止继续传播
    }
    return true
  }
}

/**
 * 系统通知处理器
 */
export class SystemNoticeHandler implements MessageHandler {
  handle(message: WSMessage): boolean {
    if (message.type === WSMessageType.SYSTEM_NOTICE) {
      const notificationData = message.data as NotificationData
      toast.show(notificationData.content || '系统通知')
      console.log('📢 处理系统通知:', notificationData.content)
      return false
    }
    return true
  }
}

/**
 * 消息处理管道
 */
export class MessagePipeline {
  private handlers: MessageHandler[] = []

  addHandler(handler: MessageHandler): void {
    this.handlers.push(handler)
  }

  process(rawMessage: any): void {
    try {
      const message = this.parseMessage(rawMessage)
      if (!message) return

      for (const handler of this.handlers) {
        try {
          const shouldContinue = handler.handle(message)
          if (!shouldContinue) break
        } catch (handlerError) {
          console.error(`❌ 处理器处理消息时出错:`, handlerError)
        }
      }
    } catch (error) {
      console.error('❌ 消息处理管道出错:', error)
    }
  }
}
```

## 多平台登录安全

### 平台适配配置

针对不同小程序平台的安全配置:

```typescript
/**
 * 认证配置
 */
const AUTH_CONFIG = {
  // 平台对应的 appid
  appids: {
    'mp-weixin': SystemConfig.platforms.wechatMiniAppId,
    'mp-official-account': SystemConfig.platforms.wechatOfficialAppId,
    'mp-toutiao': SystemConfig.platforms.toutiaoMiniAppId,
    'mp-alipay': SystemConfig.platforms.alipayMiniAppId,
  },

  // 平台支持的登录方式
  supportedMethods: {
    'mp-weixin': ['miniapp', 'password', 'sms'] as AuthType[],
    'mp-official-account': ['mp', 'password'] as AuthType[],
    'mp-toutiao': ['miniapp', 'password'] as AuthType[],
    'mp-alipay': ['miniapp', 'password'] as AuthType[],
    h5: ['password', 'sms'] as AuthType[],
    app: ['password'] as AuthType[],
  },
}

/**
 * 获取当前平台类型
 */
const getCurrentPlatform = (): PlatformType => {
  if (isMpWeixin) return 'mp-weixin'
  if (isWechatOfficialH5) return 'mp-official-account'
  if (isMpToutiao) return 'mp-toutiao'
  if (isMpAlipay) return 'mp-alipay'
  if (isH5) return 'h5'
  if (isApp) return 'app'
  return 'h5'
}

/**
 * 检查当前平台是否支持指定登录方式
 */
const isSupportedLoginMethod = (method: AuthType): boolean => {
  const platform = getCurrentPlatform()
  const supportedMethods = AUTH_CONFIG.supportedMethods[platform] || ['password']
  return supportedMethods.includes(method)
}
```

### 小程序登录安全

小程序登录的安全实现:

```typescript
/**
 * 获取小程序登录 code
 */
const getMiniappCode = async (): Promise<string> => {
  if (!isMp) {
    throw new Error('当前环境不支持小程序登录')
  }

  try {
    const res = await uni.login()
    if (!res.code) {
      throw new Error('获取小程序授权码失败')
    }
    return res.code
  } catch (error) {
    console.error('小程序登录失败:', error)
    throw new Error('小程序登录失败，请重试')
  }
}

/**
 * 小程序一键登录
 */
const loginWithMiniapp = async (userInfoAuth?: {
  encryptedData: string
  iv: string
  rawData: string
  signature: string
}): Result<AuthTokenVo> => {
  if (!isSupportedLoginMethod('miniapp')) {
    return [new Error('当前平台不支持小程序登录'), null]
  }

  const miniappCode = await getMiniappCode()

  return await login('miniapp', {
    platformCode: miniappCode,
    platform: getCurrentPlatform(),
    appid: getCurrentPlatformAppid(),
    ...userInfoAuth,
  })
}
```

### 微信H5授权登录

微信公众号H5页面的OAuth授权:

```typescript
/**
 * 获取微信 H5 授权链接
 */
const getWechatH5AuthUrl = (
  redirectUri: string,
  state?: 'login' | 'snsapi_userinfo'
): string => {
  const appid = AUTH_CONFIG.appids['mp-official-account']
  const scope = 'snsapi_userinfo'
  const encodedRedirectUri = encodeURIComponent(redirectUri)

  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state || 'STATE'}#wechat_redirect`
}

/**
 * H5 微信授权登录
 */
const loginWithMp = async (params: PlatformLoginParams): Result<AuthTokenVo> => {
  if (!isSupportedLoginMethod('mp')) {
    return [new Error('当前平台不支持微信登录'), null]
  }

  return await login('mp', {
    platform: getCurrentPlatform(),
    appid: getCurrentPlatformAppid(),
    state: params.state,
    platformCode: params.code,
  })
}
```

## XSS防护

### HTML转义

防止XSS攻击的HTML转义函数:

```typescript
/**
 * 转义特殊字符，防止XSS攻击
 */
export const escapeHtml = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

**转义字符对照表**:

| 原字符 | 转义后 | 说明 |
|--------|--------|------|
| `&` | `&amp;` | 和号 |
| `<` | `&lt;` | 小于号 |
| `>` | `&gt;` | 大于号 |
| `"` | `&quot;` | 双引号 |
| `'` | `&#039;` | 单引号 |

### 富文本处理

安全地处理富文本内容:

```typescript
/**
 * 将HTML内容转换为纯文本
 */
export const html2Text = (html: string): string => {
  if (!html) return ''

  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 从HTML字符串中获取纯文本摘要
 */
export const getTextExcerpt = (
  html: string,
  length: number,
  ellipsis: string = '...'
): string => {
  const text = html2Text(html)
  return truncate(text, length, ellipsis)
}
```

## 安全配置

### 系统安全配置

移动端的安全配置集中管理:

```typescript
/**
 * 安全配置接口
 */
interface SecurityConfig {
  /** 接口加密功能开关 */
  apiEncrypt: boolean
  /** RSA公钥 - 用于加密传输 */
  rsaPublicKey: string
  /** RSA私钥 - 用于解密响应 */
  rsaPrivateKey: string
}

/**
 * 移动端应用配置
 */
export const SystemConfig = deepFreeze({
  /**
   * 安全配置
   */
  security: {
    apiEncrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    rsaPublicKey: import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '',
    rsaPrivateKey: import.meta.env.VITE_APP_RSA_PRIVATE_KEY || '',
  },
})
```

### 配置冻结保护

使用深度冻结防止配置被篡改:

```typescript
/**
 * 深度冻结对象，防止修改
 */
const deepFreeze = <T extends Record<string, any>>(obj: T): DeepReadonly<T> => {
  Object.freeze(obj)
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (obj[prop] !== null && typeof obj[prop] === 'object') {
      deepFreeze(obj[prop])
    }
  })
  return obj as DeepReadonly<T>
}
```

## 最佳实践

### 1. 敏感数据处理

```typescript
// ✅ 正确：敏感数据加密存储
const storeUserToken = (token: string) => {
  cache.set('token', token, 7 * 24 * 3600) // 7天过期
}

// ✅ 正确：敏感数据传输加密
const [err, data] = await http.encrypt().post('/api/login', {
  username,
  password,
})

// ❌ 错误：明文存储敏感信息
uni.setStorageSync('password', password) // 永远不要这样做
```

### 2. Token安全管理

```typescript
// ✅ 正确：统一Token管理
const { getToken, setToken, removeToken } = useToken()

// ✅ 正确：退出时清理Token
const logout = async () => {
  await userStore.logoutUser()
  removeToken()
  cache.clearAll()
}

// ❌ 错误：Token永不过期
cache.set('token', token) // 没有设置过期时间
```

### 3. 请求安全

```typescript
// ✅ 正确：敏感操作加密
const login = async (data: LoginData) => {
  return await http.noAuth().encrypt().post('/auth/login', data)
}

// ✅ 正确：防重复提交
const submitOrder = async (orderData: OrderData) => {
  return await http.post('/order/submit', orderData) // 默认启用防重复
}

// ✅ 正确：请求超时控制
const fetchLargeData = async () => {
  return await http.timeout(60000).get('/api/large-data')
}
```

### 4. WebSocket安全

```typescript
// ✅ 正确：带认证的WebSocket连接
const wsInstance = webSocket.initialize(undefined, {
  onConnected: () => {
    console.log('WebSocket连接建立成功')
  },
  onError: (error) => {
    console.error('WebSocket连接错误', error)
  },
})

// ✅ 正确：退出时断开连接
const logout = async () => {
  webSocket.disconnect()
  await userStore.logoutUser()
}
```

### 5. 输入安全

```typescript
// ✅ 正确：显示前转义HTML
const displayContent = computed(() => {
  return escapeHtml(userInput.value)
})

// ✅ 正确：富文本提取纯文本
const excerpt = getTextExcerpt(htmlContent, 100)

// ❌ 错误：直接渲染用户输入
<rich-text :nodes="userInput" /> // 可能存在XSS风险
```

## 常见问题

### 1. Token过期如何处理？

**问题描述**：用户Token过期后，请求返回401错误。

**解决方案**：

```typescript
// HTTP拦截器自动处理401
const handleUnauthorized = async () => {
  if (isReLogin.show) return
  isReLogin.show = true

  try {
    const userStore = useUserStore()
    await userStore.logoutUser()

    const currentPath = `/${getCurrentPage()?.route}`
    uni.navigateTo({
      url: `/pages/auth/login?redirect=${currentPath}`,
    })
  } finally {
    isReLogin.show = false
  }
}
```

### 2. 加密请求如何调试？

**问题描述**：加密后的请求数据无法在开发工具中查看。

**解决方案**：

```typescript
// 开发环境可临时关闭加密
const isDev = import.meta.env.DEV

const [err, data] = isDev
  ? await http.post('/api/data', payload)
  : await http.encrypt().post('/api/data', payload)

// 或者在环境变量中控制
// VITE_APP_API_ENCRYPT=false
```

### 3. WebSocket连接不稳定怎么办？

**问题描述**：WebSocket频繁断开重连。

**解决方案**：

```typescript
// 1. 检查网络状态
uni.getNetworkType({
  success: (res) => {
    if (res.networkType === 'none') {
      console.log('当前无网络，WebSocket将在网络恢复后重连')
    }
  },
})

// 2. 调整重连策略
const wsInstance = useWebSocket(url, {
  maxRetries: 10,      // 增加重试次数
  baseDelay: 5,        // 增加基础延迟
  heartbeatInterval: 20000, // 更频繁的心跳
})

// 3. 监听网络变化
uni.onNetworkStatusChange((res) => {
  if (res.isConnected && !webSocket.isConnected) {
    webSocket.reconnect()
  }
})
```

### 4. 缓存数据被清除如何处理？

**问题描述**：用户清除应用数据后，缓存丢失。

**解决方案**：

```typescript
// 1. 检测缓存是否有效
const checkAuthStatus = () => {
  const token = useToken().getToken()
  if (!token) {
    // Token丢失，引导用户重新登录
    uni.navigateTo({ url: '/pages/auth/login' })
    return false
  }
  return true
}

// 2. 应用启动时检查
onLaunch(() => {
  checkAuthStatus()
})

// 3. 页面进入时检查
onShow(() => {
  if (!checkAuthStatus()) return
  // 继续页面逻辑
})
```

### 5. 如何防止请求被篡改？

**问题描述**：担心请求在传输过程中被篡改。

**解决方案**：

```typescript
// 1. 使用HTTPS（必须）
// 配置 manifest.json 或服务端强制HTTPS

// 2. 启用请求加密
const secureRequest = async (data: any) => {
  return await http.encrypt().post('/api/secure', data)
}

// 3. 添加请求签名（可选，需后端配合）
const signRequest = (data: any) => {
  const timestamp = Date.now()
  const nonce = generateRandomString()
  const signData = `${JSON.stringify(data)}${timestamp}${nonce}`
  const signature = rsaSign(signData)

  return {
    ...data,
    _timestamp: timestamp,
    _nonce: nonce,
    _signature: signature,
  }
}
```

## 安全检查清单

### 开发阶段

- [ ] 敏感数据使用加密存储
- [ ] Token设置合理的过期时间
- [ ] 请求启用防重复提交
- [ ] 敏感操作启用加密传输
- [ ] 用户输入进行XSS过滤
- [ ] WebSocket连接带认证信息
- [ ] 错误信息不泄露敏感信息

### 测试阶段

- [ ] 测试Token过期处理
- [ ] 测试网络异常恢复
- [ ] 测试重复提交防护
- [ ] 测试加密解密正确性
- [ ] 测试XSS防护有效性
- [ ] 测试WebSocket断线重连

### 发布阶段

- [ ] 关闭调试日志输出
- [ ] 启用生产环境加密
- [ ] 配置HTTPS强制跳转
- [ ] 清理测试用密钥
- [ ] 验证配置冻结生效
- [ ] 检查敏感信息泄露

### 运维阶段

- [ ] 监控异常请求
- [ ] 定期更新密钥
- [ ] 检查Token使用情况
- [ ] 分析安全日志
- [ ] 更新安全补丁
