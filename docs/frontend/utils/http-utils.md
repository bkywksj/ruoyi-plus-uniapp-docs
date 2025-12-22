# HTTP工具

前端HTTP请求工具是整个应用的网络通信核心，基于Axios封装，提供了完整的请求/响应拦截、错误处理、加密传输、认证管理等功能。

## 概述

HTTP工具模块采用Composable模式设计，通过 `useHttp` 组合式函数提供链式调用API，支持灵活的请求配置和统一的错误处理机制。

**核心特性：**

- **链式API设计** - 支持 `http.noAuth().encrypt().post()` 等链式调用方式
- **Result元组模式** - 采用 `[Error | null, T | null]` 格式统一处理成功和错误
- **请求加密** - 集成AES/RSA混合加密，保护敏感数据传输
- **认证管理** - 自动处理Token、租户ID等认证信息
- **防重复提交** - 内置请求去重机制，防止重复提交
- **拦截器体系** - 完整的请求/响应拦截器链
- **错误处理** - 统一的错误码处理和消息提示

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (API层)                          │
│   getUserList() → http.get('/system/user/list')            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    useHttp Composable                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   noAuth    │  │   encrypt   │  │ noRepeatSubmit│        │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  noTenant   │  │  noMsgError │  │   timeout   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Axios Instance                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Request Interceptors                     │   │
│  │  • Token注入  • 租户ID  • 加密处理  • 重复检测      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Response Interceptors                    │   │
│  │  • 数据解密  • 状态码处理  • 错误消息  • 登录跳转   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      to() 工具函数                           │
│  Promise<T> → [Error | null, T | null]                      │
└─────────────────────────────────────────────────────────────┘
```

### 模块组成

| 模块 | 文件路径 | 功能说明 |
|------|---------|---------|
| HTTP服务 | `composables/useHttp.ts` | 核心HTTP请求封装 |
| 错误处理 | `utils/to.ts` | Result元组转换工具 |
| 加密工具 | `utils/crypto.ts` | AES/RSA加密解密 |
| 类型定义 | `types/http.d.ts` | 请求头类型定义 |

## useHttp Composable

### 基础用法

`useHttp` 是HTTP请求的核心组合式函数，提供了完整的请求方法和链式配置API。

```typescript
import { useHttp, http } from '@/composables/useHttp'

// 使用默认实例
const [error, data] = await http.get('/api/users')
if (error) {
  console.error('请求失败:', error.message)
} else {
  console.log('用户数据:', data)
}

// 创建自定义实例
const customHttp = useHttp({
  baseURL: 'https://api.example.com',
  timeout: 60000
})
```

### 请求方法

useHttp提供了四种基本请求方法，每种方法都返回Result元组格式。

#### GET请求

```typescript
// 基本GET请求
const [error, users] = await http.get<UserInfo[]>('/system/user/list')

// 带查询参数
const [error, users] = await http.get<UserInfo[]>('/system/user/list', {
  pageNum: 1,
  pageSize: 10,
  status: '0'
})

// 带配置项
const [error, data] = await http.get<any>('/api/data', params, {
  timeout: 60000,
  headers: { 'X-Custom-Header': 'value' }
})
```

#### POST请求

```typescript
// 基本POST请求
const [error, result] = await http.post<void>('/system/user', {
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com'
})

// 带配置项
const [error, result] = await http.post<CreateResult>('/api/create', data, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
```

#### PUT请求

```typescript
// 更新数据
const [error, result] = await http.put<void>('/system/user', {
  userId: 1,
  nickname: '新昵称',
  email: 'new@example.com'
})
```

#### DELETE请求

```typescript
// 单个删除
const [error, result] = await http.del<void>('/system/user/1')

// 批量删除
const [error, result] = await http.del<void>('/system/user/1,2,3')
```

### 链式配置API

useHttp采用Builder模式，支持链式调用配置请求行为。每个链式方法返回同一个实例，可以自由组合。

#### noAuth - 跳过认证

某些接口不需要携带Token，如登录、注册、验证码等公开接口。

```typescript
// 登录接口不需要Token
const [error, token] = await http.noAuth().post<LoginResult>('/auth/login', {
  username: 'admin',
  password: '123456'
})

// 获取验证码
const [error, captcha] = await http.noAuth().get<CaptchaResult>('/captcha/image')

// 公开数据查询
const [error, data] = await http.noAuth().get('/public/config')
```

**实现原理：**

```typescript
const noAuth = () => {
  chainConfig.headers = {
    ...chainConfig.headers,
    auth: false  // 标记不需要认证
  }
  return chainMethods
}
```

#### encrypt - 加密传输

对敏感数据进行AES加密传输，保护数据安全。

```typescript
// 加密登录请求
const [error, result] = await http.noAuth().encrypt().post<LoginResult>('/auth/login', {
  username: 'admin',
  password: '123456'
})

// 加密敏感操作
const [error, result] = await http.encrypt().post('/user/changePassword', {
  oldPassword: '123456',
  newPassword: '654321'
})

// 组合使用
const [error, result] = await http
  .noAuth()
  .encrypt()
  .noRepeatSubmit()
  .post('/auth/register', userData)
```

**实现原理：**

```typescript
const encrypt = () => {
  chainConfig.headers = {
    ...chainConfig.headers,
    isEncrypt: true  // 标记需要加密
  }
  return chainMethods
}
```

#### noRepeatSubmit - 防重复提交

防止用户快速多次点击导致重复提交。

```typescript
// 表单提交防重
const [error, result] = await http.noRepeatSubmit().post('/order/create', orderData)

// 组合使用
const [error, result] = await http
  .encrypt()
  .noRepeatSubmit()
  .post('/payment/pay', paymentData)
```

**实现原理：**

```typescript
const noRepeatSubmit = () => {
  chainConfig.headers = {
    ...chainConfig.headers,
    repeatSubmit: false  // 标记禁止重复提交
  }
  return chainMethods
}
```

#### noTenant - 跳过租户

某些接口是全局接口，不需要租户隔离。

```typescript
// 获取全局配置
const [error, config] = await http.noTenant().get('/system/global/config')

// 系统级操作
const [error, result] = await http.noTenant().post('/system/cache/clear')
```

**实现原理：**

```typescript
const noTenant = () => {
  chainConfig.headers = {
    ...chainConfig.headers,
    tenant: false  // 标记不需要租户
  }
  return chainMethods
}
```

#### noMsgError - 禁用错误提示

某些场景下不需要自动弹出错误消息，由调用方自行处理。

```typescript
// 静默检查，不提示错误
const [error, valid] = await http.noMsgError().get('/auth/check')
if (error) {
  // 自行处理错误，不会弹出消息
  router.push('/login')
}

// 批量操作，统一处理错误
const results = await Promise.all(
  ids.map(id => http.noMsgError().del(`/item/${id}`))
)
const failCount = results.filter(([err]) => err).length
if (failCount > 0) {
  ElMessage.error(`${failCount}项删除失败`)
}
```

#### timeout - 自定义超时

针对特定请求设置超时时间。

```typescript
// 文件上传设置更长超时
const [error, url] = await http.timeout(120000).post('/upload', formData)

// 快速检测设置短超时
const [error, status] = await http.timeout(5000).get('/health')

// 组合使用
const [error, result] = await http
  .noAuth()
  .timeout(60000)
  .post('/batch/import', largeData)
```

### 链式组合示例

```typescript
// 登录：无认证 + 加密 + 防重复
const [error, result] = await http
  .noAuth()
  .encrypt()
  .noRepeatSubmit()
  .post('/auth/login', credentials)

// 敏感操作：加密 + 防重复 + 长超时
const [error, result] = await http
  .encrypt()
  .noRepeatSubmit()
  .timeout(60000)
  .post('/trade/confirm', tradeData)

// 静默请求：无错误提示 + 短超时
const [error, data] = await http
  .noMsgError()
  .timeout(3000)
  .get('/status/check')

// 全局操作：无租户 + 无认证
const [error, config] = await http
  .noTenant()
  .noAuth()
  .get('/public/settings')
```

## Result元组模式

### to工具函数

`to` 函数是核心的错误处理工具，将Promise转换为 `[Error | null, T | null]` 元组格式，避免try-catch嵌套。

```typescript
import { to } from '@/utils/to'

// 基本用法
const [error, data] = await to(fetchUserData())
if (error) {
  console.error('获取用户数据失败:', error.message)
  return
}
console.log('用户数据:', data)
```

**实现原理：**

```typescript
export const to = async <T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> => {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
```

### 扩展to函数

项目提供了一系列扩展的to函数，满足不同场景需求。

#### toValidate - 带验证的转换

在获取数据后进行验证，验证失败视为错误。

```typescript
import { toValidate } from '@/utils/to'

// 验证用户数据
const [error, user] = await toValidate(
  fetchUser(userId),
  (user) => user.status === 'active',
  '用户已被禁用'
)

// 验证列表不为空
const [error, items] = await toValidate(
  fetchItems(),
  (items) => items.length > 0,
  '没有可用数据'
)
```

**实现原理：**

```typescript
export const toValidate = async <T>(
  promise: Promise<T>,
  validator: (data: T) => boolean,
  errorMessage?: string
): Promise<[Error | null, T | null]> => {
  const [error, data] = await to(promise)
  if (error) return [error, null]
  if (data !== null && !validator(data)) {
    return [new Error(errorMessage || 'Validation failed'), null]
  }
  return [null, data]
}
```

#### toAll - 并行请求处理

同时发起多个请求，全部成功才返回成功。

```typescript
import { toAll } from '@/utils/to'

// 并行获取多个数据
const [error, [users, roles, depts]] = await toAll([
  fetchUsers(),
  fetchRoles(),
  fetchDepts()
])

if (error) {
  console.error('部分数据获取失败:', error.message)
  return
}

console.log('用户:', users)
console.log('角色:', roles)
console.log('部门:', depts)
```

**实现原理：**

```typescript
export const toAll = async <T extends readonly unknown[] | []>(
  promises: { [K in keyof T]: Promise<T[K]> }
): Promise<[Error | null, T | null]> => {
  try {
    const results = await Promise.all(promises)
    return [null, results as T]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
```

#### toWithTimeout - 带超时的转换

为请求添加超时限制。

```typescript
import { toWithTimeout } from '@/utils/to'

// 3秒超时
const [error, data] = await toWithTimeout(
  slowApiCall(),
  3000,
  '请求超时，请稍后重试'
)

// 健康检查，快速超时
const [error, status] = await toWithTimeout(
  healthCheck(),
  1000
)
```

**实现原理：**

```typescript
export const toWithTimeout = async <T>(
  promise: Promise<T>,
  timeout: number,
  timeoutMessage?: string
): Promise<[Error | null, T | null]> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage || `Timeout after ${timeout}ms`))
    }, timeout)
  })

  return to(Promise.race([promise, timeoutPromise]))
}
```

#### toWithRetry - 带重试的转换

请求失败时自动重试。

```typescript
import { toWithRetry } from '@/utils/to'

// 最多重试3次，每次间隔1秒
const [error, data] = await toWithRetry(
  unstableApiCall,
  3,
  1000
)

// 网络请求重试
const [error, result] = await toWithRetry(
  () => http.get('/api/data'),
  5,
  2000
)
```

**实现原理：**

```typescript
export const toWithRetry = async <T>(
  promiseFactory: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<[Error | null, T | null]> => {
  let lastError: Error | null = null

  for (let i = 0; i <= retries; i++) {
    const [error, data] = await to(promiseFactory())
    if (!error) return [null, data]

    lastError = error
    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return [lastError, null]
}
```

#### toWithDefault - 带默认值的转换

请求失败时返回默认值而不是错误。

```typescript
import { toWithDefault } from '@/utils/to'

// 失败时返回空数组
const [, users] = await toWithDefault(
  fetchUsers(),
  []
)
console.log('用户数量:', users.length)  // 保证不为null

// 失败时返回默认配置
const [, config] = await toWithDefault(
  fetchConfig(),
  { theme: 'light', language: 'zh-CN' }
)
```

**实现原理：**

```typescript
export const toWithDefault = async <T>(
  promise: Promise<T>,
  defaultValue: T
): Promise<[null, T]> => {
  const [error, data] = await to(promise)
  if (error || data === null) {
    return [null, defaultValue]
  }
  return [null, data]
}
```

#### toWithLog - 带日志的转换

自动记录请求结果日志。

```typescript
import { toWithLog } from '@/utils/to'

// 开发环境调试
const [error, data] = await toWithLog(
  fetchUserData(userId),
  'fetchUserData'
)
// 控制台输出: [fetchUserData] Success: {...}
// 或: [fetchUserData] Error: User not found
```

**实现原理：**

```typescript
export const toWithLog = async <T>(
  promise: Promise<T>,
  label: string
): Promise<[Error | null, T | null]> => {
  const [error, data] = await to(promise)

  if (error) {
    console.error(`[${label}] Error:`, error.message)
  } else {
    console.log(`[${label}] Success:`, data)
  }

  return [error, data]
}
```

#### toSequence - 顺序执行

按顺序执行多个异步操作。

```typescript
import { toSequence } from '@/utils/to'

// 按顺序执行，前一个的结果作为后一个的输入
const [error, finalResult] = await toSequence([
  () => fetchUser(userId),
  (user) => fetchUserOrders(user.id),
  (orders) => calculateTotal(orders)
])

// 步骤式操作
const [error, result] = await toSequence([
  () => validateData(formData),
  () => saveToDatabase(formData),
  (saved) => sendNotification(saved.id)
])
```

#### toIf - 条件执行

根据条件决定是否执行请求。

```typescript
import { toIf } from '@/utils/to'

// 只在条件满足时执行
const [error, data] = await toIf(
  shouldFetch,
  () => fetchData(),
  defaultData
)

// 根据权限决定是否请求
const [error, adminData] = await toIf(
  user.role === 'admin',
  () => fetchAdminData(),
  null
)
```

#### toSync - 同步转换

将同步操作包装为Result格式。

```typescript
import { toSync } from '@/utils/to'

// 同步操作的错误处理
const [error, parsed] = toSync(() => JSON.parse(jsonString))
if (error) {
  console.error('JSON解析失败:', error.message)
}

// 复杂计算的错误处理
const [error, result] = toSync(() => complexCalculation(data))
```

**实现原理：**

```typescript
export const toSync = <T>(
  fn: () => T
): [Error | null, T | null] => {
  try {
    const data = fn()
    return [null, data]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
```

## 请求拦截器

### 请求拦截器架构

请求拦截器在发送请求前对配置进行处理，包括添加认证信息、加密数据等。

```typescript
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. 添加Token
    if (config.headers?.auth !== false) {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // 2. 添加租户ID
    if (config.headers?.tenant !== false) {
      const tenantId = getTenantId()
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId
      }
    }

    // 3. 添加客户端ID
    config.headers['clientid'] = import.meta.env.VITE_CLIENT_ID

    // 4. 处理加密
    if (config.headers?.isEncrypt) {
      config.data = encryptData(config.data)
    }

    // 5. 检查重复提交
    if (config.headers?.repeatSubmit !== false) {
      checkRepeatSubmit(config)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### Token注入

自动为需要认证的请求添加Token。

```typescript
// Token存储和获取
const TOKEN_KEY = 'access_token'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// 请求拦截器中的Token处理
const token = getToken()
if (token && config.headers?.auth !== false) {
  config.headers.Authorization = `Bearer ${token}`
}
```

### 租户ID处理

多租户系统中自动添加租户标识。

```typescript
// 租户ID存储和获取
const TENANT_KEY = 'tenant_id'

export const getTenantId = (): string | null => {
  return localStorage.getItem(TENANT_KEY)
}

export const setTenantId = (tenantId: string): void => {
  localStorage.setItem(TENANT_KEY, tenantId)
}

// 请求拦截器中的租户处理
const tenantId = getTenantId()
if (tenantId && config.headers?.tenant !== false) {
  config.headers['X-Tenant-Id'] = tenantId
}
```

### 重复提交检测

防止用户快速多次点击导致重复请求。

```typescript
// 请求记录Map
const pendingRequests = new Map<string, number>()

// 生成请求唯一标识
const generateRequestKey = (config: AxiosRequestConfig): string => {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

// 检查重复提交
const checkRepeatSubmit = (config: AxiosRequestConfig): void => {
  const key = generateRequestKey(config)
  const now = Date.now()
  const lastTime = pendingRequests.get(key)

  // 1秒内的相同请求视为重复
  if (lastTime && now - lastTime < 1000) {
    throw new Error('请勿重复提交')
  }

  pendingRequests.set(key, now)

  // 清理过期记录
  setTimeout(() => {
    pendingRequests.delete(key)
  }, 1000)
}
```

## 响应拦截器

### 响应拦截器架构

响应拦截器处理服务端返回的数据，包括状态码判断、数据解密、错误处理等。

```typescript
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    const code = res.code || 200
    const message = res.msg || res.message || '系统未知错误'

    // 处理二进制数据
    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      return res
    }

    // 处理加密响应
    if (res.encrypt) {
      res.data = decryptData(res.data)
    }

    // 状态码处理
    switch (code) {
      case 200:
        return res.data
      case 401:
        handleUnauthorized()
        return Promise.reject(new Error(message))
      case 500:
        showError(message)
        return Promise.reject(new Error(message))
      case 601:
        showWarning(message)
        return Promise.reject(new Error(message))
      default:
        showError(message)
        return Promise.reject(new Error(message))
    }
  },
  (error) => {
    return handleNetworkError(error)
  }
)
```

### 状态码处理

系统定义了标准的状态码体系。

| 状态码 | 含义 | 处理方式 |
|-------|------|---------|
| 200 | 成功 | 返回数据 |
| 401 | 未授权/Token过期 | 跳转登录页 |
| 403 | 无权限 | 提示无权限 |
| 404 | 资源不存在 | 提示资源不存在 |
| 500 | 服务器错误 | 显示错误消息 |
| 601 | 警告信息 | 显示警告消息 |

```typescript
// 状态码处理示例
const handleResponseCode = (code: number, message: string) => {
  switch (code) {
    case 200:
      // 成功，不做处理
      break

    case 401:
      // Token失效，清除登录状态并跳转
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
      break

    case 403:
      ElMessage.error('没有权限访问该资源')
      break

    case 500:
      ElMessage.error(message || '服务器内部错误')
      break

    case 601:
      ElMessage.warning(message)
      break

    default:
      ElMessage.error(message || '请求失败')
  }
}
```

### 网络错误处理

处理网络层面的错误，如超时、断网等。

```typescript
const handleNetworkError = (error: AxiosError) => {
  let message = '网络异常，请检查网络连接'

  if (error.code === 'ECONNABORTED') {
    message = '请求超时，请稍后重试'
  } else if (error.code === 'ERR_NETWORK') {
    message = '网络连接失败，请检查网络'
  } else if (error.response) {
    const status = error.response.status
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      500: '服务器内部错误',
      501: '服务未实现',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
      505: 'HTTP版本不支持'
    }
    message = statusMessages[status] || `请求失败(${status})`
  }

  // 显示错误消息（除非禁用）
  if (error.config?.headers?.noMsgError !== true) {
    ElMessage.error(message)
  }

  return Promise.reject(error)
}
```

## 加密传输

### 加密架构

系统采用AES+RSA混合加密方案，兼顾安全性和性能。

```
┌─────────────────────────────────────────────────────────────┐
│                        加密流程                              │
├─────────────────────────────────────────────────────────────┤
│  1. 生成随机AES密钥                                          │
│  2. 使用AES密钥加密请求数据                                   │
│  3. 使用RSA公钥加密AES密钥                                    │
│  4. 将加密数据和加密密钥一起发送                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        解密流程                              │
├─────────────────────────────────────────────────────────────┤
│  1. 服务端用RSA私钥解密获取AES密钥                            │
│  2. 使用AES密钥解密请求数据                                   │
│  3. 处理业务逻辑                                             │
│  4. 使用相同AES密钥加密响应数据返回                           │
└─────────────────────────────────────────────────────────────┘
```

### AES加密

使用AES-CBC模式进行数据加密。

```typescript
import CryptoJS from 'crypto-js'

/**
 * 生成随机AES密钥
 * @param length 密钥长度，默认16字节（128位）
 */
export const generateAesKey = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * AES加密
 * @param data 待加密数据
 * @param key AES密钥
 */
export const encryptWithAes = (data: string, key: string): string => {
  const keyBytes = CryptoJS.enc.Utf8.parse(key)
  const ivBytes = CryptoJS.enc.Utf8.parse(key.substring(0, 16))

  const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
    iv: ivBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  return encrypted.toString()
}

/**
 * AES解密
 * @param encryptedData 加密数据
 * @param key AES密钥
 */
export const decryptWithAes = (encryptedData: string, key: string): string => {
  const keyBytes = CryptoJS.enc.Utf8.parse(key)
  const ivBytes = CryptoJS.enc.Utf8.parse(key.substring(0, 16))

  const decrypted = CryptoJS.AES.decrypt(encryptedData, keyBytes, {
    iv: ivBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

### RSA加密

使用RSA加密AES密钥。

```typescript
import JSEncrypt from 'jsencrypt'

// RSA公钥（从环境变量获取）
const RSA_PUBLIC_KEY = import.meta.env.VITE_RSA_PUBLIC_KEY

/**
 * RSA加密
 * @param data 待加密数据
 */
export const encryptWithRsa = (data: string): string => {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(RSA_PUBLIC_KEY)
  return encrypt.encrypt(data) || ''
}
```

### 加密请求处理

在请求拦截器中处理加密。

```typescript
// 加密请求数据
const encryptRequestData = (data: any): EncryptedData => {
  // 1. 生成随机AES密钥
  const aesKey = generateAesKey()

  // 2. 使用AES加密数据
  const encryptedData = encryptWithAes(JSON.stringify(data), aesKey)

  // 3. 使用RSA加密AES密钥
  const encryptedKey = encryptWithRsa(aesKey)

  return {
    encryptedData,
    encryptedKey
  }
}

// 在请求拦截器中使用
if (config.headers?.isEncrypt && config.data) {
  const { encryptedData, encryptedKey } = encryptRequestData(config.data)
  config.data = { data: encryptedData }
  config.headers['encrypt-key'] = encryptedKey
}
```

### 哈希计算

提供常用的哈希计算函数。

```typescript
/**
 * 计算SHA256哈希
 * @param data 待计算数据
 */
export const computeSha256Hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString()
}

/**
 * 计算MD5哈希
 * @param data 待计算数据
 */
export const computeMd5Hash = (data: string): string => {
  return CryptoJS.MD5(data).toString()
}

// 使用示例
const fileHash = computeSha256Hash(fileContent)
const passwordHash = computeMd5Hash(password)
```

## API类型定义

### 基础类型

```typescript
// types/api.ts

/**
 * API响应结构
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 消息 */
  msg: string
  /** 数据 */
  data: T
  /** 时间戳 */
  timestamp?: number
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  /** 数据列表 */
  rows: T[]
  /** 总记录数 */
  total: number
  /** 每页大小 */
  pageSize: number
  /** 当前页码 */
  pageNum: number
  /** 总页数 */
  pages?: number
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  /** 页码 */
  pageNum?: number
  /** 每页大小 */
  pageSize?: number
  /** 排序字段 */
  orderByColumn?: string
  /** 排序方向 */
  isAsc?: 'asc' | 'desc'
}
```

### 自定义请求头类型

```typescript
// types/http.d.ts

/**
 * 自定义请求头
 */
export interface CustomHeaders {
  /** 是否需要认证，默认true */
  auth?: boolean
  /** 是否需要租户ID，默认true */
  tenant?: boolean
  /** 是否允许重复提交，默认true */
  repeatSubmit?: boolean
  /** 是否加密传输 */
  isEncrypt?: boolean
  /** 是否禁用错误消息 */
  noMsgError?: boolean
  /** 其他自定义头 */
  [key: string]: any
}
```

### Result类型

```typescript
// types/result.ts

/**
 * Result元组类型
 * 第一个元素是错误（如果有），第二个是数据（如果成功）
 */
export type Result<T> = Promise<[Error | null, T | null]>

/**
 * 同步Result类型
 */
export type SyncResult<T> = [Error | null, T | null]
```

## 请求封装

### 基础请求函数

```typescript
// utils/request.ts
import { http } from '@/composables/useHttp'
import type { PageResult, PageQuery } from '@/types/api'

/**
 * GET请求
 * @param url 请求地址
 * @param params 查询参数
 */
export const get = <T = any>(
  url: string,
  params?: Record<string, any>
): Promise<[Error | null, T | null]> => {
  return http.get<T>(url, params)
}

/**
 * POST请求
 * @param url 请求地址
 * @param data 请求体
 */
export const post = <T = any>(
  url: string,
  data?: Record<string, any>
): Promise<[Error | null, T | null]> => {
  return http.post<T>(url, data)
}

/**
 * PUT请求
 * @param url 请求地址
 * @param data 请求体
 */
export const put = <T = any>(
  url: string,
  data?: Record<string, any>
): Promise<[Error | null, T | null]> => {
  return http.put<T>(url, data)
}

/**
 * DELETE请求
 * @param url 请求地址
 */
export const del = <T = any>(
  url: string
): Promise<[Error | null, T | null]> => {
  return http.del<T>(url)
}

/**
 * 分页请求
 * @param url 请求地址
 * @param params 查询参数
 */
export const getPage = <T = any>(
  url: string,
  params?: PageQuery & Record<string, any>
): Promise<[Error | null, PageResult<T> | null]> => {
  return http.get<PageResult<T>>(url, params)
}
```

### 文件操作

```typescript
/**
 * 文件上传
 * @param url 上传地址
 * @param file 文件对象
 * @param onProgress 进度回调
 */
export const upload = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<[Error | null, string | null]> => {
  const formData = new FormData()
  formData.append('file', file)

  return http.post<string>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        const progress = Math.round((event.loaded * 100) / event.total)
        onProgress(progress)
      }
    }
  })
}

/**
 * 文件下载
 * @param url 下载地址
 * @param filename 文件名
 * @param params 查询参数
 */
export const download = async (
  url: string,
  filename?: string,
  params?: Record<string, any>
): Promise<[Error | null, void | null]> => {
  const [error, blob] = await http.get<Blob>(url, params, {
    responseType: 'blob'
  })

  if (error) return [error, null]

  // 创建下载链接
  const link = document.createElement('a')
  const href = window.URL.createObjectURL(blob!)

  link.href = href
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(href)

  return [null, null]
}

/**
 * 导出Excel
 * @param url 导出地址
 * @param params 查询参数
 * @param filename 文件名
 */
export const exportExcel = async (
  url: string,
  params?: Record<string, any>,
  filename?: string
): Promise<[Error | null, void | null]> => {
  const defaultFilename = `export_${Date.now()}.xlsx`
  return download(url, filename || defaultFilename, params)
}
```

## 使用示例

### API模块定义

```typescript
// api/system/user.ts
import { http } from '@/composables/useHttp'
import type { PageResult, PageQuery } from '@/types/api'

/** 用户信息 */
export interface UserInfo {
  userId: number
  username: string
  nickname: string
  email: string
  mobile: string
  avatar: string
  status: string
  deptId: number
  deptName: string
  roleIds: number[]
  postIds: number[]
  createTime: string
}

/** 用户查询参数 */
export interface UserQuery extends PageQuery {
  username?: string
  nickname?: string
  mobile?: string
  status?: string
  deptId?: number
  beginTime?: string
  endTime?: string
}

/** 用户表单 */
export interface UserForm {
  userId?: number
  username: string
  nickname: string
  password?: string
  email?: string
  mobile?: string
  sex?: string
  status?: string
  deptId?: number
  roleIds?: number[]
  postIds?: number[]
  remark?: string
}

/**
 * 获取用户列表
 */
export const getUserList = (params: UserQuery) => {
  return http.get<PageResult<UserInfo>>('/system/user/list', params)
}

/**
 * 获取用户详情
 */
export const getUserInfo = (userId: number) => {
  return http.get<UserInfo>(`/system/user/${userId}`)
}

/**
 * 新增用户
 */
export const addUser = (data: UserForm) => {
  return http.post<void>('/system/user', data)
}

/**
 * 修改用户
 */
export const updateUser = (data: UserForm) => {
  return http.put<void>('/system/user', data)
}

/**
 * 删除用户
 */
export const deleteUser = (userIds: number | number[]) => {
  const ids = Array.isArray(userIds) ? userIds.join(',') : userIds
  return http.del<void>(`/system/user/${ids}`)
}

/**
 * 重置密码
 */
export const resetPassword = (userId: number, password: string) => {
  return http.encrypt().put<void>('/system/user/resetPwd', {
    userId,
    password
  })
}

/**
 * 修改状态
 */
export const changeUserStatus = (userId: number, status: string) => {
  return http.put<void>('/system/user/changeStatus', {
    userId,
    status
  })
}

/**
 * 导出用户
 */
export const exportUser = (params: UserQuery) => {
  return http.get<Blob>('/system/user/export', params, {
    responseType: 'blob'
  })
}
```

### 页面中使用

```vue
<template>
  <div class="user-list">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline>
      <el-form-item label="用户名">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
      <el-button @click="handleExport">导出</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="userId" label="用户ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="deptName" label="部门" />
      <el-table-column prop="mobile" label="手机号" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getList"
      @current-change="getList"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUserList,
  deleteUser,
  changeUserStatus,
  resetPassword,
  exportUser,
  type UserInfo,
  type UserQuery
} from '@/api/system/user'
import { download } from '@/utils/request'

// 查询参数
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  status: ''
})

// 状态
const loading = ref(false)
const userList = ref<UserInfo[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

// 获取用户列表
const getList = async () => {
  loading.value = true
  const [error, data] = await getUserList(queryParams)
  loading.value = false

  if (error) {
    console.error('获取用户列表失败:', error.message)
    return
  }

  userList.value = data!.rows
  total.value = data!.total
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.username = ''
  queryParams.status = ''
  handleQuery()
}

// 选择变化
const handleSelectionChange = (selection: UserInfo[]) => {
  selectedIds.value = selection.map(item => item.userId)
}

// 新增用户
const handleAdd = () => {
  // 打开新增对话框
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  // 打开编辑对话框
}

// 删除用户
const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(`确认删除用户"${row.username}"吗?`, '提示', {
      type: 'warning'
    })

    const [error] = await deleteUser(row.userId)
    if (error) return

    ElMessage.success('删除成功')
    getList()
  } catch {
    // 取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的${selectedIds.value.length}个用户吗?`, '提示', {
      type: 'warning'
    })

    const [error] = await deleteUser(selectedIds.value)
    if (error) return

    ElMessage.success('删除成功')
    getList()
  } catch {
    // 取消删除
  }
}

// 状态变更
const handleStatusChange = async (row: UserInfo) => {
  const text = row.status === '0' ? '启用' : '停用'

  try {
    await ElMessageBox.confirm(`确认${text}用户"${row.username}"吗?`, '提示', {
      type: 'warning'
    })

    const [error] = await changeUserStatus(row.userId, row.status)
    if (error) {
      // 恢复原状态
      row.status = row.status === '0' ? '1' : '0'
      return
    }

    ElMessage.success(`${text}成功`)
  } catch {
    // 取消操作，恢复原状态
    row.status = row.status === '0' ? '1' : '0'
  }
}

// 重置密码
const handleResetPwd = async (row: UserInfo) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度6-20位'
    })

    const [error] = await resetPassword(row.userId, value)
    if (error) return

    ElMessage.success('重置密码成功')
  } catch {
    // 取消重置
  }
}

// 导出
const handleExport = async () => {
  const [error, blob] = await exportUser(queryParams)
  if (error) return

  // 下载文件
  const url = window.URL.createObjectURL(blob!)
  const link = document.createElement('a')
  link.href = url
  link.download = `用户数据_${Date.now()}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

// 初始化
onMounted(() => {
  getList()
})
</script>
```

### Composable封装

```typescript
// composables/useTableData.ts
import { ref, reactive, onMounted } from 'vue'
import type { PageQuery, PageResult } from '@/types/api'

interface UseTableDataOptions<T, Q extends PageQuery> {
  /** 获取列表的API函数 */
  fetchApi: (params: Q) => Promise<[Error | null, PageResult<T> | null]>
  /** 默认查询参数 */
  defaultQuery?: Partial<Q>
  /** 是否立即加载 */
  immediate?: boolean
  /** 加载完成回调 */
  onLoaded?: (data: PageResult<T>) => void
  /** 加载失败回调 */
  onError?: (error: Error) => void
}

export function useTableData<T, Q extends PageQuery = PageQuery>(
  options: UseTableDataOptions<T, Q>
) {
  const { fetchApi, defaultQuery = {}, immediate = true, onLoaded, onError } = options

  // 状态
  const loading = ref(false)
  const dataList = ref<T[]>([])
  const total = ref(0)
  const selectedRows = ref<T[]>([])

  // 查询参数
  const queryParams = reactive<Q>({
    pageNum: 1,
    pageSize: 10,
    ...defaultQuery
  } as Q)

  // 获取数据
  const getList = async () => {
    loading.value = true
    const [error, data] = await fetchApi(queryParams)
    loading.value = false

    if (error) {
      console.error('获取数据失败:', error.message)
      onError?.(error)
      return
    }

    dataList.value = data!.rows as any
    total.value = data!.total
    onLoaded?.(data!)
  }

  // 搜索
  const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
  }

  // 重置
  const resetQuery = () => {
    Object.keys(defaultQuery).forEach(key => {
      (queryParams as any)[key] = (defaultQuery as any)[key]
    })
    queryParams.pageNum = 1
    queryParams.pageSize = 10
    getList()
  }

  // 刷新
  const refresh = () => {
    getList()
  }

  // 选择变更
  const handleSelectionChange = (selection: T[]) => {
    selectedRows.value = selection as any
  }

  // 分页变更
  const handlePageChange = () => {
    getList()
  }

  // 初始化
  if (immediate) {
    onMounted(() => {
      getList()
    })
  }

  return {
    loading,
    dataList,
    total,
    selectedRows,
    queryParams,
    getList,
    handleQuery,
    resetQuery,
    refresh,
    handleSelectionChange,
    handlePageChange
  }
}

// 使用示例
const {
  loading,
  dataList,
  total,
  queryParams,
  handleQuery,
  resetQuery,
  handleSelectionChange
} = useTableData<UserInfo, UserQuery>({
  fetchApi: getUserList,
  defaultQuery: {
    username: '',
    status: ''
  },
  onLoaded: (data) => {
    console.log('加载完成，共', data.total, '条数据')
  }
})
```

## 错误处理

### useApi Composable

封装API调用的通用逻辑，提供加载状态、错误处理等功能。

```typescript
// composables/useApi.ts
import { ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'

interface UseApiOptions<T> {
  /** 是否立即执行 */
  immediate?: boolean
  /** 初始参数 */
  initialParams?: any
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 失败回调 */
  onError?: (error: Error) => void
  /** 完成回调（无论成功失败） */
  onFinally?: () => void
  /** 成功提示 */
  successMessage?: string
  /** 失败时是否显示错误消息 */
  showErrorMessage?: boolean
}

export function useApi<T, P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<[Error | null, T | null]>,
  options: UseApiOptions<T> = {}
) {
  const {
    immediate = false,
    initialParams,
    onSuccess,
    onError,
    onFinally,
    successMessage,
    showErrorMessage = true
  } = options

  const loading = ref(false)
  const error = shallowRef<Error | null>(null)
  const data = shallowRef<T | null>(null)

  const execute = async (...args: P) => {
    loading.value = true
    error.value = null

    try {
      const [err, result] = await apiFunction(...args)

      if (err) {
        error.value = err
        if (showErrorMessage) {
          ElMessage.error(err.message)
        }
        onError?.(err)
        return [err, null] as const
      }

      data.value = result
      if (successMessage) {
        ElMessage.success(successMessage)
      }
      onSuccess?.(result!)
      return [null, result] as const
    } finally {
      loading.value = false
      onFinally?.()
    }
  }

  // 立即执行
  if (immediate && initialParams) {
    execute(...initialParams)
  }

  return {
    loading,
    error,
    data,
    execute
  }
}

// 使用示例
const { loading, data, execute } = useApi(getUserInfo, {
  onSuccess: (user) => {
    console.log('获取用户成功:', user.nickname)
  },
  onError: (error) => {
    console.error('获取用户失败:', error.message)
  }
})

// 执行请求
await execute(userId)
```

### 全局错误处理

```typescript
// utils/errorHandler.ts
import { ElMessage, ElNotification } from 'element-plus'
import router from '@/router'

/**
 * HTTP错误码处理
 */
export const handleHttpError = (code: number, message: string) => {
  switch (code) {
    case 401:
      // 未授权，跳转登录
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
      break

    case 403:
      // 无权限
      ElNotification.error({
        title: '权限不足',
        message: message || '您没有权限执行此操作'
      })
      break

    case 404:
      // 资源不存在
      ElMessage.error(message || '请求的资源不存在')
      break

    case 500:
      // 服务器错误
      ElNotification.error({
        title: '服务器错误',
        message: message || '服务器内部错误，请稍后重试'
      })
      break

    case 601:
      // 业务警告
      ElMessage.warning(message)
      break

    default:
      ElMessage.error(message || '请求失败')
  }
}

/**
 * 网络错误处理
 */
export const handleNetworkError = (error: any) => {
  if (error.code === 'ECONNABORTED') {
    ElMessage.error('请求超时，请检查网络后重试')
  } else if (error.code === 'ERR_NETWORK') {
    ElNotification.error({
      title: '网络异常',
      message: '网络连接失败，请检查网络设置'
    })
  } else {
    ElMessage.error('网络错误，请稍后重试')
  }
}
```

## 最佳实践

### 1. 统一使用Result模式

始终使用Result元组模式处理请求，避免try-catch嵌套。

```typescript
// ✅ 推荐
const [error, data] = await http.get('/api/users')
if (error) {
  handleError(error)
  return
}
processData(data)

// ❌ 不推荐
try {
  const data = await fetch('/api/users')
  processData(data)
} catch (error) {
  handleError(error)
}
```

### 2. 合理使用链式API

根据业务需求选择合适的链式配置。

```typescript
// 登录请求：无认证 + 加密
await http.noAuth().encrypt().post('/auth/login', credentials)

// 敏感操作：加密 + 防重复
await http.encrypt().noRepeatSubmit().post('/payment/pay', data)

// 静默请求：禁用错误提示
await http.noMsgError().get('/status/check')

// 长耗时操作：延长超时
await http.timeout(120000).post('/batch/import', largeData)
```

### 3. API模块化组织

按业务模块组织API文件。

```
api/
├── system/
│   ├── user.ts      # 用户管理
│   ├── role.ts      # 角色管理
│   ├── dept.ts      # 部门管理
│   └── menu.ts      # 菜单管理
├── business/
│   ├── order.ts     # 订单管理
│   └── product.ts   # 商品管理
└── common/
    ├── upload.ts    # 文件上传
    └── dict.ts      # 字典数据
```

### 4. 类型安全

为API定义完整的类型。

```typescript
// 定义请求参数类型
interface CreateOrderParams {
  productId: number
  quantity: number
  address: string
}

// 定义响应数据类型
interface OrderResult {
  orderId: string
  status: 'pending' | 'paid' | 'shipped'
  createTime: string
}

// 使用泛型确保类型安全
export const createOrder = (data: CreateOrderParams) => {
  return http.post<OrderResult>('/order/create', data)
}

// 调用时自动推断类型
const [error, order] = await createOrder({
  productId: 1,
  quantity: 2,
  address: '北京市'
})
// order 的类型是 OrderResult | null
```

### 5. 错误处理策略

根据场景选择合适的错误处理方式。

```typescript
// 方式1：使用默认错误提示
const [error, data] = await http.get('/api/data')
if (error) return

// 方式2：自定义错误处理
const [error, data] = await http.noMsgError().get('/api/data')
if (error) {
  // 自定义处理逻辑
  if (error.message.includes('not found')) {
    showEmptyState()
  } else {
    showRetryButton()
  }
  return
}

// 方式3：使用默认值
const [, data] = await toWithDefault(http.get('/api/config'), defaultConfig)
// data 保证不为 null
```

## 常见问题

### 1. 请求携带Token失败

**问题原因：**
- Token未正确存储
- 请求被标记为noAuth
- Token过期未刷新

**解决方案：**

```typescript
// 确保Token正确存储
const userStore = useUserStore()
await userStore.login(credentials)  // 登录时存储Token

// 检查请求是否需要认证
const [error, data] = await http.get('/api/data')  // 默认携带Token
const [error, data] = await http.noAuth().get('/public/data')  // 不携带Token

// Token刷新机制
service.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      const refreshed = await userStore.refreshToken()
      if (refreshed) {
        // 重新发送原请求
        return service(error.config)
      }
    }
    return Promise.reject(error)
  }
)
```

### 2. 加密请求数据为空

**问题原因：**
- 加密配置未正确设置
- RSA公钥未配置
- 数据格式不正确

**解决方案：**

```typescript
// 确保环境变量配置正确
// .env.development
VITE_RSA_PUBLIC_KEY=your_public_key_here

// 确保数据是可序列化的
const data = {
  username: 'admin',
  password: '123456'
}
await http.encrypt().post('/auth/login', data)

// 检查加密结果
console.log('加密前:', data)
// 加密后数据格式: { data: 'encrypted_string', key: 'encrypted_key' }
```

### 3. 重复提交检测失效

**问题原因：**
- 请求参数变化
- 时间间隔超过阈值
- 使用了noRepeatSubmit

**解决方案：**

```typescript
// 确保请求参数一致
const orderData = { productId: 1, quantity: 2 }
await http.noRepeatSubmit().post('/order/create', orderData)

// 调整检测时间间隔（如需要）
const REPEAT_INTERVAL = 2000  // 2秒内的相同请求视为重复

// 手动防重（按钮层面）
const submitting = ref(false)
const handleSubmit = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    await http.post('/order/create', data)
  } finally {
    submitting.value = false
  }
}
```

### 4. 响应数据解析错误

**问题原因：**
- 响应格式不符合预期
- 二进制数据处理不当
- 加密响应解密失败

**解决方案：**

```typescript
// 处理非标准响应格式
service.interceptors.response.use(
  response => {
    // 处理二进制数据
    if (
      response.config.responseType === 'blob' ||
      response.config.responseType === 'arraybuffer'
    ) {
      return response.data
    }

    // 处理标准JSON响应
    const { code, data, msg } = response.data
    if (code === 200) {
      return data
    }
    return Promise.reject(new Error(msg))
  }
)

// 指定响应类型
const [error, blob] = await http.get('/file/download', params, {
  responseType: 'blob'
})
```

### 5. 跨域请求失败

**问题原因：**
- 后端未配置CORS
- 请求头不被允许
- 预检请求失败

**解决方案：**

```typescript
// 开发环境使用代理
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})

// 生产环境配置Nginx
// nginx.conf
location /api {
  proxy_pass http://backend:8080;
  add_header Access-Control-Allow-Origin *;
  add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
  add_header Access-Control-Allow-Headers 'Authorization, Content-Type, X-Tenant-Id';
}
```
