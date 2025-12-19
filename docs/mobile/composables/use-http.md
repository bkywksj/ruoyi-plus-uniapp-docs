# useHttp HTTP 请求管理

## 介绍

`useHttp` 是 RuoYi-Plus-UniApp 提供的 HTTP 请求管理组合式函数，封装了 UniApp 的网络请求 API，提供统一的请求拦截、响应处理、错误处理等功能。

**核心特性:**

- **统一错误处理** - 自动处理网络错误、超时、未授权等常见错误
- **自动认证管理** - 自动在请求头中添加 Token 认证信息
- **多租户支持** - 自动添加租户 ID，支持 SaaS 多租户架构
- **防重复提交** - POST/PUT 请求自动防重复提交
- **请求加密** - 支持 RSA + AES 混合加密
- **链式调用** - 支持链式配置，代码简洁优雅
- **TypeScript 支持** - 完整的类型定义
- **国际化支持** - 自动添加语言请求头
- **请求追踪** - 自动生成唯一请求 ID

## 架构设计

### 请求处理流程

```
请求发起 → 初始化等待 → 构建请求选项 → 发送请求 → 处理响应 → 返回结果
    │           │              │              │           │           │
    │           ↓              ↓              ↓           ↓           ↓
    │     等待租户ID       URL处理        uni.request    解密处理    [error, data]
    │     加载完成        请求头构建                    业务逻辑处理
    │                    参数序列化                    错误处理
    │                    加密处理
    │                    防重复检查
    ↓
  链式配置
  noAuth/encrypt/timeout...
```

### 核心模块

```
useHttp/
├── 请求方法
│   ├── get<T>()       # GET 请求
│   ├── post<T>()      # POST 请求
│   ├── put<T>()       # PUT 请求
│   ├── del<T>()       # DELETE 请求
│   ├── upload<T>()    # 文件上传
│   └── download()     # 文件下载
│
├── 链式方法
│   ├── noAuth()       # 禁用认证
│   ├── encrypt()      # 启用加密
│   ├── noRepeatSubmit() # 禁用防重复
│   ├── noTenant()     # 禁用租户
│   ├── skipWait()     # 跳过初始化等待
│   ├── noMsgError()   # 禁用错误提示
│   ├── timeout(ms)    # 设置超时
│   └── config(cfg)    # 通用配置
│
└── 内部处理
    ├── buildRequestOptions()  # 构建请求选项
    ├── handleResponse()       # 处理响应
    ├── handleError()          # 处理错误
    ├── encryptRequestData()   # 加密请求
    ├── decryptResponseData()  # 解密响应
    └── checkRepeatSubmit()    # 防重复检查
```

### 请求头自动添加

每次请求自动添加以下请求头:

| 请求头 | 说明 | 示例 |
|-------|------|------|
| `Content-Type` | 内容类型 | `application/json;charset=utf-8` |
| `Content-Language` | 当前语言 | `zh-CN` / `en-US` |
| `X-Request-Id` | 唯一请求 ID | `20250925142636001` |
| `Authorization` | 认证 Token | `Bearer eyJhbGci...` |
| `X-Tenant-Id` | 租户 ID | `000000` |

## 基本用法

### GET 请求

```typescript
import { http } from '@/composables/useHttp'

interface User {
  id: string
  userName: string
}

const loadUsers = async () => {
  const [err, data] = await http.get<User[]>('/system/user/list')

  if (err) {
    console.error(err.message)
    return
  }

  console.log(data) // User[]
}

// 带查询参数
const [err, users] = await http.get<User[]>('/system/user/list', {
  page: 1,
  size: 10
})
```

**返回值说明:**
- `[error, data]` 元组格式
- 成功: `error` 为 `null`，`data` 包含响应数据
- 失败: `error` 包含错误对象，`data` 为 `null`

**GET 请求参数处理:**

```typescript
// 参数会自动拼接到 URL
http.get('/api/users', { page: 1, size: 10 })
// 实际请求: /api/users?page=1&size=10

// 嵌套对象会被序列化
http.get('/api/users', { filter: { status: 1, type: 'admin' } })
// 实际请求: /api/users?filter[status]=1&filter[type]=admin
```

### POST 请求

```typescript
interface UserForm {
  userName: string
  email: string
}

const createUser = async (form: UserForm) => {
  const [err, data] = await http.post('/system/user', form)

  if (err) return

  uni.showToast({ title: '创建成功', icon: 'success' })
}
```

**特性:**
- 自动添加防重复提交保护(500ms 内相同请求只允许一次)
- 自动设置 `Content-Type: application/json`
- 请求体自动 JSON 序列化

### PUT 请求

```typescript
const updateUser = async (id: string, data: Partial<User>) => {
  const [err] = await http.put('/system/user', { id, ...data })

  if (err) return

  uni.showToast({ title: '更新成功', icon: 'success' })
}
```

### DELETE 请求

```typescript
const deleteUser = async (userId: string) => {
  const [err] = await http.del(`/system/user/${userId}`)

  if (err) return

  uni.showToast({ title: '删除成功', icon: 'success' })
}

// 批量删除
const [err] = await http.del('/system/user', { ids: '1,2,3' })
```

### 文件上传

```typescript
interface UploadResult {
  url: string
  fileName: string
}

const uploadImage = async (filePath: string) => {
  const [err, data] = await http.upload<UploadResult>({
    url: '/system/oss/upload',
    filePath,
    name: 'file',
    formData: {
      type: 'avatar'
    }
  })

  if (err) return

  console.log('文件URL:', data.url)
}

// 上传多个附加信息
const [err, result] = await http.upload({
  url: '/system/oss/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: {
    type: 'document',
    category: 'contract',
    description: '合同文件'
  },
  timeout: 120000  // 大文件设置更长超时
})
```

### 文件下载

```typescript
const downloadFile = async () => {
  const [err, res] = await http.download({
    url: '/system/oss/download/file.pdf'
  })

  if (err) return

  console.log('临时文件路径:', res.tempFilePath)

  // 保存到本地
  uni.saveFile({
    tempFilePath: res.tempFilePath,
    success: (saveRes) => {
      console.log('保存路径:', saveRes.savedFilePath)
    }
  })
}

// 下载到指定路径
const [err, res] = await http.download({
  url: '/api/export/report.xlsx',
  filePath: `${uni.env.USER_DATA_PATH}/report.xlsx`,
  timeout: 60000
})
```

## 链式调用

### 禁用认证

```typescript
// 公开接口不需要 Token
const [err, data] = await http.noAuth().get('/auth/imgCode')
```

### 启用加密

```typescript
// RSA + AES 混合加密
const [err, token] = await http
  .noAuth()
  .encrypt()
  .post('/auth/login', loginForm)
```

### 禁用防重复提交

```typescript
// 聊天消息等需要快速重复请求
const [err] = await http.noRepeatSubmit().post('/chat/message', { content })
```

### 设置超时时间

```typescript
// 长时间操作设置更长超时
const [err, data] = await http.timeout(60000).post('/system/export', data)
```

### 禁用错误提示

```typescript
// 自定义错误处理
const [err] = await http.noMsgError().get('/system/user/check', { username })

if (err) {
  errorMsg.value = '该用户名已存在'
}
```

### 跳过初始化等待

```typescript
// 登录等不需要等待租户信息的请求
const [err, token] = await http
  .skipWait()
  .noAuth()
  .encrypt()
  .post('/auth/login', form)
```

### 禁用租户信息

```typescript
// 非租户接口
const [err, data] = await http.noTenant().get('/system/config')
```

### 组合多个配置

```typescript
const [err, data] = await http
  .noAuth()           // 禁用认证
  .encrypt()          // 启用加密
  .noRepeatSubmit()   // 禁用防重复提交
  .skipWait()         // 跳过初始化等待
  .timeout(30000)     // 30秒超时
  .post('/auth/register', form)
```

### 通用配置方法

```typescript
const [err] = await http.config({
  header: {
    auth: false,
    repeatSubmit: false
  },
  timeout: 20000
}).post('/sms/send', { phone })
```

## 创建自定义实例

```typescript
import { useHttp } from '@/composables/useHttp'

// 公开 API 实例
const publicHttp = useHttp({
  header: {
    auth: false,
    tenant: false
  }
})

// 管理员 API 实例
const adminHttp = useHttp({
  header: {
    'X-Admin-Token': 'admin-secret'
  },
  timeout: 60000
})

// 第三方 API 实例
const thirdPartyHttp = useHttp({
  header: {
    auth: false,
    tenant: false,
    'X-API-Key': 'your-api-key'
  }
})

// 使用
const [err, data] = await publicHttp.get('/public/info')
const [err2, adminData] = await adminHttp.get('/admin/stats')
```

## API

### 请求方法

| 方法 | 说明 | 参数 |
|-----|------|------|
| `get<T>(url, params?, config?)` | GET 请求 | url, 查询参数, 配置 |
| `post<T>(url, data?, config?)` | POST 请求 | url, 请求体, 配置 |
| `put<T>(url, data?, config?)` | PUT 请求 | url, 请求体, 配置 |
| `del<T>(url, params?, config?)` | DELETE 请求 | url, 查询参数, 配置 |
| `upload<T>(config)` | 文件上传 | 上传配置 |
| `download(config)` | 文件下载 | 下载配置 |
| `request<T>(config)` | 通用请求 | 完整配置 |

### 链式方法

| 方法 | 说明 |
|-----|------|
| `noAuth()` | 禁用认证 Token |
| `encrypt()` | 启用请求加密 |
| `noRepeatSubmit()` | 禁用防重复提交 |
| `noTenant()` | 禁用租户信息 |
| `skipWait()` | 跳过初始化等待 |
| `noMsgError()` | 禁用错误提示 |
| `timeout(ms)` | 设置超时时间 |
| `config(cfg)` | 通用配置 |

### 类型定义

```typescript
/** 请求配置 */
interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  /** 查询参数 */
  query?: Record<string, any>
  /** 查询参数(兼容) */
  params?: Record<string, any>
  /** 自定义请求头 */
  header?: CustomHeaders
  /** 跳过初始化等待 */
  skipWait?: boolean
  /** 初始化超时(ms)，默认 10000 */
  initTimeout?: number
  /** 请求超时(ms)，默认 50000 */
  timeout?: number
  /** 请求数据 */
  data?: any
}

/** 自定义请求头 */
interface CustomHeaders {
  /** 是否需要认证，默认 true */
  auth?: boolean
  /** 是否需要租户ID，默认 true */
  tenant?: boolean
  /** 是否防止重复提交，默认 true */
  repeatSubmit?: boolean
  /** 是否加密请求数据 */
  isEncrypt?: boolean
  /** 其他自定义头部 */
  [key: string]: any
}

/** 返回值类型 */
type Result<T> = Promise<[Error | null, T | null]>

/** 后端统一返回格式 */
interface R<T> {
  /** 状态码 */
  code: number
  /** 消息 */
  msg: string
  /** 业务数据 */
  data: T
}
```

### 响应数据结构

后端统一返回格式:

```typescript
interface R<T> {
  code: number    // 200 成功, 401 未授权, 其他为错误
  msg: string     // 消息
  data: T         // 业务数据
}
```

`useHttp` 会自动解包，直接返回 `data` 部分。

## 错误处理

### 错误类型

| 错误 | 说明 | 错误消息 |
|-----|------|---------|
| NETWORK | 网络连接失败 | `网络连接失败，请检查网络` |
| TIMEOUT | 请求超时 | `请求超时，请稍后重试` |
| REPEAT_SUBMIT | 重复提交 | `数据正在处理，请勿重复提交` |
| SESSION_EXPIRED | 登录过期 | `未登录或登录已过期~` |
| INIT_TIMEOUT | 初始化超时 | `应用初始化超时，请重试` |
| DECRYPT_FAILED | 解密失败 | `响应数据解密失败` |
| REQUEST_CANCELED | 请求取消 | `请求已取消` |

### 错误处理流程

```
错误发生
    │
    ├── 网络层错误 (fail 回调)
    │   ├── timeout → 请求超时
    │   ├── fail → 网络连接失败
    │   └── abort → 请求已取消
    │
    └── 业务层错误 (success 回调)
        ├── code === 200 → 返回 data
        ├── code === 401 → 未授权处理
        │   ├── 清除用户信息
        │   ├── 跳转登录页
        │   └── 显示提示
        └── code !== 200 → 显示后端错误消息
```

### 自定义错误处理

```typescript
const [err, data] = await http.noMsgError().get('/api/data')

if (err) {
  // 根据错误类型处理
  if (err.message.includes('超时')) {
    uni.showModal({
      title: '提示',
      content: '请求超时，是否重试?',
      success: (res) => {
        if (res.confirm) handleRequest()
      }
    })
    return
  }

  if (err.message.includes('网络')) {
    uni.showToast({ title: '网络异常', icon: 'none' })
    return
  }

  // 业务错误
  uni.showToast({ title: err.message, icon: 'none' })
}
```

### 未授权处理

401 状态码时系统自动:
1. 调用 `userStore.logoutUser()` 清除用户信息
2. 获取当前页面路径作为 redirect 参数
3. 跳转到登录页 `/pages/auth/login?redirect=当前路径`
4. 显示"未登录或登录已过期"提示

```typescript
// 内部实现
const handleUnauthorized = async () => {
  if (isReLogin.show) return  // 防止重复处理

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

## 请求拦截

### 自动添加请求头

| 请求头 | 说明 | 条件 |
|-------|------|------|
| `Content-Type` | `application/json;charset=utf-8` | 始终添加 |
| `Content-Language` | 当前语言(zh-CN/en-US) | 始终添加 |
| `X-Request-Id` | 唯一请求 ID | 始终添加 |
| `Authorization` | Bearer Token | `auth !== false` |
| `X-Tenant-Id` | 租户 ID | `tenant !== false` |
| `encrypt-key` | 加密密钥 | `isEncrypt === true` |

### 请求 ID 生成

```typescript
// 格式：yyyyMMddHHmmssSSS (年月日时分秒毫秒)
// 示例：20250925142636001
const generateRequestId = (): string => {
  return formatDate(new Date(), 'yyyyMMddHHmmssSSS')
}
```

### URL 处理

```typescript
// 相对路径自动添加 baseUrl
'/api/users' → 'https://api.example.com/api/users'

// 查询参数自动拼接
http.get('/api/users', { page: 1, size: 10 })
→ '/api/users?page=1&size=10'

// 支持 query 和 params 两种方式
http.get('/api/users', null, { query: { status: 1 } })
http.get('/api/users', null, { params: { status: 1 } })
```

### 防重复提交

```typescript
// 内部实现 - 500ms 内相同请求只允许一次
let lastSubmit: { key: string; time: number } | null = null

const checkRepeatSubmit = (url: string, data: any): boolean => {
  const key = `${url}-${JSON.stringify(data)}`
  const now = Date.now()

  if (lastSubmit && lastSubmit.key === key && now - lastSubmit.time < 500) {
    return false  // 重复提交
  }

  lastSubmit = { key, time: now }
  return true  // 允许提交
}
```

## 加密机制

### 加密流程

```
客户端                           服务端
  │                               │
  │ 1. 生成随机 AES 密钥           │
  │ 2. AES 加密请求数据            │
  │ 3. RSA 公钥加密 AES 密钥       │
  │ 4. 发送加密数据和加密密钥       │
  │------------------------------>│
  │                               │ 5. RSA 私钥解密 AES 密钥
  │                               │ 6. AES 解密请求数据
  │                               │ 7. 处理业务逻辑
  │                               │ 8. AES 加密响应数据
  │<------------------------------|
  │ 9. AES 解密响应数据            │
```

### 加密实现

```typescript
// 加密请求数据
const encryptRequestData = (data: any, header: Record<string, any>) => {
  if (!SystemConfig.security?.apiEncrypt || !data) return data

  // 1. 生成随机 AES 密钥
  const aesKey = generateAesKey()

  // 2. RSA 公钥加密 AES 密钥，放入请求头
  header['encrypt-key'] = rsaEncrypt(encodeBase64(aesKey))

  // 3. AES 加密请求数据
  return typeof data === 'object'
    ? encryptWithAes(JSON.stringify(data), aesKey)
    : encryptWithAes(data, aesKey)
}

// 解密响应数据
const decryptResponseData = (data: any, header: Record<string, any>): any => {
  if (!SystemConfig.security?.apiEncrypt) return data

  const encryptKey = header['encrypt-key']
  if (!encryptKey) return data

  try {
    // 1. RSA 私钥解密 AES 密钥
    const base64Str = rsaDecrypt(encryptKey)
    const aesKey = decodeBase64(base64Str)

    // 2. AES 解密响应数据
    const decryptedData = decryptWithAes(data, aesKey)
    return JSON.parse(decryptedData)
  } catch (error) {
    throw new Error('响应数据解密失败')
  }
}
```

### 启用加密

```typescript
// 方式1: 链式调用
const [err, token] = await http.encrypt().post('/auth/login', form)

// 方式2: 配置参数
const [err, token] = await http.post('/auth/login', form, {
  header: { isEncrypt: true }
})

// 注意: 只有 POST/PUT 请求支持加密
// GET/DELETE 请求的 isEncrypt 配置会被忽略
```

## 最佳实践

### 1. 定义类型

```typescript
// types/api.ts
export interface User {
  id: string
  userName: string
  nickName: string
  email: string
  phone: string
  status: string
  createTime: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface PageQuery {
  page: number
  size: number
  [key: string]: any
}

// 使用
const [err, result] = await http.get<PageResult<User>>('/api/users', {
  page: 1,
  size: 10
})

if (!err && result) {
  console.log('总数:', result.total)
  console.log('列表:', result.list)
}
```

### 2. 封装 API 模块

```typescript
// api/user.ts
import { http } from '@/composables/useHttp'
import type { User, PageResult, PageQuery } from '@/types/api'

export interface UserQuery extends PageQuery {
  userName?: string
  status?: string
}

export const userApi = {
  /** 用户列表 */
  list: (query: UserQuery) => {
    return http.get<PageResult<User>>('/system/user/list', query)
  },

  /** 用户详情 */
  detail: (id: string) => {
    return http.get<User>(`/system/user/${id}`)
  },

  /** 创建用户 */
  create: (data: Partial<User>) => {
    return http.post<User>('/system/user', data)
  },

  /** 更新用户 */
  update: (data: User) => {
    return http.put<void>('/system/user', data)
  },

  /** 删除用户 */
  delete: (id: string) => {
    return http.del<void>(`/system/user/${id}`)
  },

  /** 批量删除 */
  batchDelete: (ids: string[]) => {
    return http.del<void>('/system/user', { ids: ids.join(',') })
  },

  /** 导出用户 */
  export: (query: UserQuery) => {
    return http.timeout(120000).get('/system/user/export', query)
  }
}

// 使用
import { userApi } from '@/api/user'

const [err, result] = await userApi.list({ page: 1, size: 10 })
```

### 3. 请求重试

```typescript
/**
 * 带重试的请求
 * @param fn 请求函数
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试延迟基数(ms)
 */
const requestWithRetry = async <T>(
  fn: () => Promise<[Error | null, T | null]>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<[Error | null, T | null]> => {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    const [err, data] = await fn()

    if (!err) return [null, data]

    lastError = err

    // 只对网络错误和超时进行重试
    if (!err.message.includes('网络') && !err.message.includes('超时')) {
      break
    }

    // 指数退避
    await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
  }

  return [lastError, null]
}

// 使用
const [err, data] = await requestWithRetry(
  () => http.get<User[]>('/api/users'),
  3,
  1000
)
```

### 4. 请求取消

```typescript
// 使用 AbortController 取消请求
const controller = new AbortController()

// 5秒后取消请求
setTimeout(() => controller.abort(), 5000)

try {
  const [err, data] = await http.get('/api/slow-api')
  // 处理数据
} catch (error) {
  if (error.message.includes('取消')) {
    console.log('请求已取消')
  }
}
```

### 5. 并发请求

```typescript
// 并行请求多个接口
const loadDashboardData = async () => {
  const [
    [userErr, userData],
    [orderErr, orderData],
    [statsErr, statsData]
  ] = await Promise.all([
    http.get<User>('/api/user/info'),
    http.get<Order[]>('/api/orders/recent'),
    http.get<Stats>('/api/stats/today')
  ])

  // 处理结果
  if (!userErr) user.value = userData
  if (!orderErr) orders.value = orderData
  if (!statsErr) stats.value = statsData
}
```

### 6. 请求缓存

```typescript
// 简单的请求缓存
const cache = new Map<string, { data: any; time: number }>()
const CACHE_TTL = 5 * 60 * 1000  // 5分钟

const cachedRequest = async <T>(
  key: string,
  fn: () => Promise<[Error | null, T | null]>
): Promise<[Error | null, T | null]> => {
  const cached = cache.get(key)

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return [null, cached.data as T]
  }

  const [err, data] = await fn()

  if (!err && data) {
    cache.set(key, { data, time: Date.now() })
  }

  return [err, data]
}

// 使用
const [err, config] = await cachedRequest(
  'system-config',
  () => http.get('/system/config')
)
```

## 常见问题

### 1. 请求未携带 Token

**原因:** 配置了 `auth: false` 或 Token 已过期

**解决:**
```typescript
// 确保不禁用认证
const [err, data] = await http.get('/api/protected')

// 检查 Token
import { useToken } from '@/composables/useToken'
const { getToken } = useToken()
console.log('Token:', getToken())

// 如果 Token 为空，引导登录
if (!getToken()) {
  uni.navigateTo({ url: '/pages/auth/login' })
}
```

### 2. 防重复提交误拦截

**原因:** 两次请求间隔小于 500ms

**解决:**
```typescript
// 禁用防重复提交
const [err] = await http.noRepeatSubmit().post('/api/message', data)

// 或在配置中禁用
const [err] = await http.post('/api/message', data, {
  header: { repeatSubmit: false }
})
```

### 3. 请求超时

**原因:** 默认 50 秒超时不够

**解决:**
```typescript
// 增加超时时间
const [err, data] = await http.timeout(120000).post('/api/export', data)

// 或创建长超时实例
const longTimeoutHttp = useHttp({ timeout: 120000 })
```

### 4. 应用初始化超时

**原因:** 租户 ID 加载耗时过长

**解决:**
```typescript
// 增加初始化超时
const [err, data] = await http.get('/api/data', null, {
  initTimeout: 20000
})

// 或跳过等待(登录等场景)
const [err, data] = await http.skipWait().get('/api/data')
```

### 5. 加密请求失败

**原因:** 后端未配置解密或密钥不匹配

**解决:**
```typescript
// 检查加密配置
import { SystemConfig } from '@/systemConfig'
console.log('加密启用:', SystemConfig.security?.apiEncrypt)

// 暂时禁用加密测试
const [err, token] = await http.noAuth().post('/auth/login', form)

// 检查 RSA 公钥配置
console.log('RSA 公钥:', SystemConfig.security?.rsaPublicKey)
```

### 6. 租户信息缺失

**原因:** 租户 ID 未设置

**解决:**
```typescript
import { getTenantId, setTenantId } from '@/utils/tenant'

console.log('当前租户ID:', getTenantId())

// 手动设置租户 ID
setTenantId('000000')

// 非租户接口显式禁用
const [err, config] = await http.noTenant().get('/system/config')
```

### 7. 响应数据类型错误

**原因:** 泛型类型与实际响应不匹配

**解决:**
```typescript
// 确保泛型类型正确
interface ApiResponse {
  list: User[]
  total: number
}

// 后端返回的是 { list: [], total: 0 }
const [err, data] = await http.get<ApiResponse>('/api/users')

// 如果不确定类型，先用 any 调试
const [err, data] = await http.get<any>('/api/users')
console.log('响应数据:', data)
```

### 8. 如何处理二进制响应?

```typescript
// 二进制数据会返回完整响应对象
const [err, res] = await http.get('/api/file/binary')

if (!err) {
  // res 包含完整响应信息
  console.log('Content-Type:', res.header['content-type'])
  console.log('Data:', res.data)
}

// 或使用 download 方法
const [err, res] = await http.download({
  url: '/api/file/download'
})
```

## 总结

useHttp 核心要点:

1. **返回值格式** - `[error, data]` 元组，优雅处理错误
2. **链式调用** - noAuth/encrypt/timeout 等灵活配置
3. **自动处理** - Token、租户ID、防重复提交、请求ID
4. **类型安全** - 完整 TypeScript 类型定义
5. **错误处理** - 自动提示，支持自定义处理
6. **加密支持** - RSA + AES 混合加密
7. **国际化** - 自动添加语言请求头
8. **可扩展** - 支持创建自定义实例
