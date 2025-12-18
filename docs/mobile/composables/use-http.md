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
- 自动添加防重复提交保护(1秒内相同请求只允许一次)
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
```

### 文件下载

```typescript
const downloadFile = async () => {
  const [err, res] = await http.download({
    url: '/system/oss/download/file.pdf'
  })

  if (err) return

  console.log('临时文件路径:', res.tempFilePath)
  // 使用 uni.saveFile() 永久保存
}
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

// 使用
const [err, data] = await publicHttp.get('/public/info')
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

| 错误 | 说明 |
|-----|------|
| NETWORK | 网络连接失败 |
| TIMEOUT | 请求超时 |
| REPEAT_SUBMIT | 重复提交 |
| SESSION_EXPIRED | 未登录或登录已过期 |
| INIT_TIMEOUT | 应用初始化超时 |
| DECRYPT_FAILED | 响应解密失败 |

### 自定义错误处理

```typescript
const [err, data] = await http.noMsgError().get('/api/data')

if (err) {
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
}
```

### 未授权处理

401 状态码时系统自动:
1. 清除用户信息
2. 跳转到登录页(携带 redirect 参数)
3. 显示"未登录或登录已过期"提示

## 请求拦截

### 自动添加请求头

| 请求头 | 说明 |
|-------|------|
| Content-Type | `application/json;charset=utf-8` |
| Content-Language | 当前语言(zh-CN/en-US) |
| X-Request-Id | 唯一请求 ID |
| Authorization | Bearer Token(需要认证时) |
| X-Tenant-Id | 租户 ID(多租户模式) |

### URL 处理

```typescript
// 相对路径自动添加 baseUrl
'/api/users' → 'https://api.example.com/api/users'

// 查询参数自动拼接
http.get('/api/users', { page: 1 })
→ '/api/users?page=1'
```

## 加密机制

### 加密流程

```
客户端                           服务端
  |                               |
  | 1. 生成随机 AES 密钥           |
  | 2. AES 加密请求数据            |
  | 3. RSA 公钥加密 AES 密钥       |
  | 4. 发送加密数据和加密密钥       |
  |------------------------------>|
  |                               | 5. RSA 私钥解密 AES 密钥
  |                               | 6. AES 解密请求数据
  |                               | 7. AES 加密响应数据
  |<------------------------------|
  | 8. AES 解密响应数据            |
```

### 启用加密

```typescript
// 方式1: 链式调用
const [err, token] = await http.encrypt().post('/auth/login', form)

// 方式2: 配置参数
const [err, token] = await http.post('/auth/login', form, {
  header: { isEncrypt: true }
})
```

## 最佳实践

### 1. 定义类型

```typescript
// types/api.ts
export interface User {
  id: string
  userName: string
  email: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// 使用
const [err, result] = await http.get<PageResult<User>>('/api/users', {
  page: 1,
  size: 10
})
```

### 2. 封装 API 模块

```typescript
// api/user.ts
import { http } from '@/composables/useHttp'
import type { User, PageResult } from '@/types/api'

export const userApi = {
  list: (query: { page: number; size: number }) => {
    return http.get<PageResult<User>>('/system/user/list', query)
  },

  detail: (id: string) => {
    return http.get<User>(`/system/user/${id}`)
  },

  create: (data: Partial<User>) => {
    return http.post<User>('/system/user', data)
  },

  update: (data: User) => {
    return http.put<void>('/system/user', data)
  },

  delete: (id: string) => {
    return http.del<void>(`/system/user/${id}`)
  },
}

// 使用
import { userApi } from '@/api/user'

const [err, result] = await userApi.list({ page: 1, size: 10 })
```

### 3. 请求重试

```typescript
const requestWithRetry = async <T>(
  fn: () => Promise<[Error | null, T | null]>,
  maxRetries = 3
): Promise<[Error | null, T | null]> => {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    const [err, data] = await fn()
    if (!err) return [null, data]

    lastError = err
    if (!err.message.includes('网络') && !err.message.includes('超时')) break

    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
  }

  return [lastError, null]
}

// 使用
const [err, data] = await requestWithRetry(
  () => http.get<User[]>('/api/users')
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
console.log('Token:', useToken().getToken())
```

### 2. 防重复提交误拦截

**原因:** 两次请求间隔小于 1 秒

**解决:**
```typescript
// 禁用防重复提交
const [err] = await http.noRepeatSubmit().post('/api/message', data)
```

### 3. 请求超时

**原因:** 默认 50 秒超时不够

**解决:**
```typescript
// 增加超时时间
const [err, data] = await http.timeout(120000).post('/api/export', data)
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
console.log('加密配置:', SystemConfig.security?.apiEncrypt)

// 暂时禁用加密测试
const [err, token] = await http.noAuth().post('/auth/login', form)
```

### 6. 租户信息缺失

**原因:** 租户 ID 未设置

**解决:**
```typescript
import { getTenantId, setTenantId } from '@/utils/tenant'

console.log('当前租户ID:', getTenantId())

// 非租户接口显式禁用
const [err, config] = await http.noTenant().get('/system/config')
```

## 总结

useHttp 核心要点:

1. **返回值格式** - `[error, data]` 元组，优雅处理错误
2. **链式调用** - noAuth/encrypt/timeout 等灵活配置
3. **自动处理** - Token、租户ID、防重复提交
4. **类型安全** - 完整 TypeScript 类型定义
5. **错误处理** - 自动提示，支持自定义处理
