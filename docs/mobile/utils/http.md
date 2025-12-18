# HTTP 请求工具

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的 HTTP 请求解决方案，基于 `uni.request` 进行深度封装。

### 核心特性

- **统一请求入口** - 基于 `useHttp` Composable 封装，提供 GET/POST/PUT/DELETE 等标准方法
- **链式调用 API** - 支持 `.noAuth().encrypt().post()` 链式调用
- **Token 认证** - 自动携带 Authorization 头部，支持 Token 过期自动跳转登录
- **多租户支持** - 自动携带租户 ID，支持租户隔离
- **请求加密** - 支持 RSA + AES 混合加密
- **防重复提交** - 内置防抖机制
- **文件传输** - 支持文件上传和下载，带进度回调
- **TypeScript 支持** - 完整的类型定义

## 基础用法

### 快速开始

```typescript
import { http } from '@/composables/useHttp'

// GET 请求
const [err, users] = await http.get<UserList>('/system/user/list')

// POST 请求
const [err, result] = await http.post<User>('/system/user', userData)

// PUT 请求
const [err] = await http.put('/system/user', updateData)

// DELETE 请求
const [err] = await http.del('/system/user/123')
```

**响应格式说明：**
- 所有请求方法都返回 `[Error | null, T | null]` 元组格式
- 第一个元素是错误对象，成功时为 `null`
- 第二个元素是响应数据，失败时为 `null`

### GET 请求

```vue
<template>
  <view class="user-list">
    <wd-cell
      v-for="user in users"
      :key="user.userId"
      :title="user.userName"
      :label="user.phonenumber"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  userId: number
  userName: string
  nickName: string
  phonenumber: string
}

const users = ref<User[]>([])

const fetchUsers = async () => {
  const [err, data] = await http.get<{ records: User[] }>('/system/user/list', {
    pageNum: 1,
    pageSize: 10
  })

  if (err) {
    console.error('获取用户列表失败:', err)
    return
  }

  users.value = data?.records || []
}

onMounted(() => fetchUsers())
</script>
```

### POST 请求

```vue
<template>
  <view class="login-form">
    <wd-input v-model="form.username" label="用户名" />
    <wd-input v-model="form.password" label="密码" type="password" />
    <wd-button type="primary" block :loading="loading" @click="handleLogin">
      登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { http } from '@/composables/useHttp'

const form = reactive({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  loading.value = true
  const [err, data] = await http.post<{ accessToken: string }>('/auth/login', form)
  loading.value = false

  if (err) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
    return
  }

  if (data?.accessToken) {
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/index/index' })
  }
}
</script>
```

### PUT 请求

```typescript
import { http } from '@/composables/useHttp'

const updateUser = async (form: UserUpdateForm) => {
  const [err] = await http.put('/system/user', form)

  if (err) {
    uni.showToast({ title: '更新失败', icon: 'none' })
    return false
  }

  uni.showToast({ title: '更新成功', icon: 'success' })
  return true
}
```

### DELETE 请求

```typescript
import { http } from '@/composables/useHttp'

// 删除单个
const deleteUser = async (userId: number) => {
  const [err] = await http.del(`/system/user/${userId}`)
  return !err
}

// 批量删除
const batchDeleteUsers = async (userIds: number[]) => {
  const [err] = await http.del('/system/user/' + userIds.join(','))
  return !err
}
```

## 链式调用

### 基础链式调用

```typescript
import { http } from '@/composables/useHttp'

// 无需认证的请求
const [err, data] = await http.noAuth().get('/public/config')

// 加密请求
const [err, result] = await http.encrypt().post('/auth/login', loginData)

// 组合使用
const [err, token] = await http
  .noAuth()
  .encrypt()
  .skipWait()
  .post('/auth/login', { username: 'admin', password: '123456' })

// 自定义超时
const [err, data] = await http.timeout(30000).get('/api/slow-endpoint')

// 禁用错误消息提示
const [err, data] = await http.noMsgError().get('/api/endpoint')
```

### 链式方法说明

| 方法 | 说明 | 示例 |
|------|------|------|
| `noAuth()` | 不携带 Authorization 头部 | 登录、注册等公开接口 |
| `encrypt()` | 启用请求/响应加密 | 敏感数据传输 |
| `noRepeatSubmit()` | 允许重复提交（默认禁止） | 特殊场景 |
| `noTenant()` | 不携带租户 ID | 跨租户请求 |
| `skipWait()` | 跳过应用初始化等待 | 初始化阶段的请求 |
| `noMsgError()` | 不显示错误消息提示 | 静默请求 |
| `timeout(ms)` | 设置请求超时时间 | 长耗时请求 |
| `config(cfg)` | 自定义完整配置 | 复杂配置场景 |

### 创建自定义实例

```typescript
import { useHttp } from '@/composables/useHttp'

// 创建带默认配置的实例
const customHttp = useHttp({
  timeout: 30000,
  header: { auth: false }
})

const [err, data] = await customHttp.get('/public/api')
```

## 文件上传

### 基础上传

```vue
<template>
  <view class="upload-demo">
    <wd-button @click="chooseAndUpload">选择并上传图片</wd-button>
    <image v-if="imageUrl" :src="imageUrl" mode="aspectFit" class="preview" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface UploadResult {
  url: string
  fileName: string
  ossId: string
}

const imageUrl = ref('')

const chooseAndUpload = async () => {
  const [chooseErr, chooseRes] = await uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  })

  if (chooseErr || !chooseRes) return

  uni.showLoading({ title: '上传中...' })

  const [err, data] = await http.upload<UploadResult>({
    url: '/resource/oss/upload',
    filePath: chooseRes.tempFilePaths[0],
    name: 'file'
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: '上传失败', icon: 'none' })
    return
  }

  imageUrl.value = data?.url || ''
  uni.showToast({ title: '上传成功', icon: 'success' })
}
</script>
```

### 带进度的上传

```vue
<template>
  <view class="upload-progress">
    <wd-button @click="uploadWithProgress">上传文件</wd-button>
    <wd-progress v-if="uploading" :percentage="progress" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

const uploading = ref(false)
const progress = ref(0)

const uploadWithProgress = async () => {
  const [chooseErr, chooseRes] = await uni.chooseImage({ count: 1 })
  if (chooseErr || !chooseRes) return

  uploading.value = true
  progress.value = 0

  const [err, data] = await http.upload({
    url: '/resource/oss/upload',
    filePath: chooseRes.tempFilePaths[0],
    name: 'file',
    onProgressUpdate: (res) => {
      progress.value = res.progress
    }
  })

  uploading.value = false

  if (err) {
    uni.showToast({ title: '上传失败', icon: 'none' })
    return
  }

  uni.showToast({ title: '上传成功', icon: 'success' })
}
</script>
```

## 文件下载

### 基础下载

```typescript
import { http } from '@/composables/useHttp'

const downloadFile = async () => {
  uni.showLoading({ title: '下载中...' })

  const [err, result] = await http.download({
    url: '/resource/oss/download/123'
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: '下载失败', icon: 'none' })
    return
  }

  uni.openDocument({
    filePath: result.tempFilePath,
    success: () => console.log('文件打开成功')
  })
}
```

### 带进度的下载

```typescript
const downloadWithProgress = async () => {
  const [err, result] = await http.download({
    url: '/resource/oss/download/123',
    onProgressUpdate: (res) => {
      console.log('下载进度:', res.progress + '%')
    }
  })

  if (!err && result?.tempFilePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
    uni.saveImageToPhotosAlbum({
      filePath: result.tempFilePath,
      success: () => uni.showToast({ title: '已保存到相册', icon: 'success' })
    })
  }
}
```

## Token 管理

### useToken Composable

```typescript
import { useToken } from '@/composables/useToken'

const {
  token,           // 响应式 Token
  getToken,        // 获取 Token
  setToken,        // 设置 Token
  removeToken,     // 删除 Token
  getAuthHeaders,  // 获取认证头部
  getAuthQuery     // 获取认证查询参数
} = useToken()
```

### 基础用法

```typescript
import { useToken } from '@/composables/useToken'

const { token, setToken, removeToken, getToken } = useToken()

// 登录成功后保存 Token
const handleLoginSuccess = (accessToken: string) => {
  setToken(accessToken)
}

// 退出登录时清除 Token
const handleLogout = () => {
  removeToken()
  uni.reLaunch({ url: '/pages/login/index' })
}

// 检查登录状态
const checkLogin = () => {
  return !!getToken()
}
```

### 获取认证头部

```typescript
import { useToken } from '@/composables/useToken'

const { getAuthHeaders, getAuthQuery } = useToken()

// 获取认证头部对象
const headers = getAuthHeaders()
// 返回: { Authorization: 'Bearer xxx...' }

// WebSocket 连接时使用
uni.connectSocket({
  url: `wss://api.example.com/ws?${getAuthQuery()}`
})
```

## 请求配置

### 全局配置

```typescript
// systemConfig.ts
export const SystemConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'
  },
  security: {
    apiEncrypt: false,
    rsaPublicKey: '...',
    rsaPrivateKey: '...'
  },
  tenant: {
    enabled: true,
    defaultTenantId: '1'
  }
}
```

### 配置选项

```typescript
interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  query?: Record<string, any>
  params?: Record<string, any>
  header?: CustomHeaders
  skipWait?: boolean
  initTimeout?: number
}

interface CustomHeaders {
  auth?: boolean           // 是否需要认证，默认 true
  tenant?: boolean         // 是否需要租户 ID，默认 true
  repeatSubmit?: boolean   // 是否防止重复提交，默认 true
  isEncrypt?: boolean      // 是否加密请求数据
  noMsgError?: boolean     // 是否静默错误
  [key: string]: any
}
```

### 配置示例

```typescript
import { http } from '@/composables/useHttp'
import { withHeaders } from '@/utils/function'

// 使用 withHeaders 辅助函数
const [err, data] = await http.post(
  '/api/endpoint',
  payload,
  withHeaders(
    { auth: false, isEncrypt: true },
    { timeout: 30000 }
  )
)

// 登录请求配置示例
const loginConfig = withHeaders(
  { auth: false, isEncrypt: true, repeatSubmit: false },
  { skipWait: true, timeout: 20000 }
)

const [err, token] = await http.post('/auth/login', loginData, loginConfig)
```

## 错误处理

### 统一错误处理

HTTP 模块内置统一的错误处理：

- **网络错误** - 提示"网络连接失败，请检查网络设置"
- **超时错误** - 提示"请求超时，请稍后重试"
- **401** - 清除 Token，跳转登录页
- **403** - 提示"没有操作权限"
- **404** - 提示"请求的资源不存在"
- **500** - 提示"服务器错误"

### 自定义错误处理

```typescript
import { http } from '@/composables/useHttp'

// 直接处理错误
const fetchData = async () => {
  const [err, data] = await http.get('/api/data')

  if (err) {
    if (err.message === 'NETWORK_ERROR') {
      retryFetch()
    } else {
      console.error('请求失败:', err)
    }
    return
  }

  console.log('数据:', data)
}

// 静默请求（不显示错误提示）
const silentFetch = async () => {
  const [err, data] = await http.noMsgError().get('/api/data')

  if (err) {
    handleCustomError(err)
    return
  }

  return data
}
```

## 防重复提交

### 自动防重复

默认情况下，所有 POST/PUT/DELETE 请求都启用防重复提交（500ms 内）。

### 禁用防重复

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const [err, data] = await http.noRepeatSubmit().post('/api/action', payload)

// 方式2: 配置选项
const [err, data] = await http.post('/api/action', payload, {
  header: { repeatSubmit: false }
})

// 场景示例: 点赞/取消点赞
const toggleLike = async (postId: number, liked: boolean) => {
  const [err] = await http
    .noRepeatSubmit()
    .post('/post/like', { postId, action: liked ? 'like' : 'unlike' })
  return !err
}
```

## 请求加密

### 启用加密

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const [err, data] = await http.encrypt().post('/auth/login', {
  username: 'admin',
  password: '123456'
})

// 方式2: 配置选项
const [err, data] = await http.post('/auth/login', loginData, {
  header: { isEncrypt: true }
})
```

加密流程：RSA + AES 混合加密，AES 加密请求数据，RSA 加密 AES 密钥。

## 多租户支持

### 自动租户处理

HTTP 模块自动在请求头中携带租户 ID（`X-Tenant-Id`）。

### 禁用租户

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const [err, data] = await http.noTenant().get('/public/config')

// 方式2: 配置选项
const [err, data] = await http.get('/public/config', null, {
  header: { tenant: false }
})
```

## 类型定义

### 核心类型

```typescript
/** 自定义请求头部接口 */
export interface CustomHeaders {
  auth?: boolean
  tenant?: boolean
  repeatSubmit?: boolean
  isEncrypt?: boolean
  noMsgError?: boolean
  [key: string]: any
}

/** 自定义请求配置接口 */
export interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  query?: Record<string, any>
  params?: Record<string, any>
  header?: CustomHeaders
  skipWait?: boolean
  initTimeout?: number
}

/** 上传配置接口 */
export interface UploadOptions {
  url: string
  filePath: string
  name: string
  formData?: Record<string, any>
  header?: CustomHeaders
  timeout?: number
  onProgressUpdate?: (res: UniApp.OnProgressUpdateResult) => void
}

/** 下载配置接口 */
export interface DownloadOptions {
  url: string
  filePath?: string
  header?: CustomHeaders
  timeout?: number
  onProgressUpdate?: (res: UniApp.OnProgressDownloadResult) => void
}
```

### 响应类型

```typescript
/** Promise 结果元组类型 */
declare type Result<T = any> = Promise<[Error | null, T | null]>

/** 统一响应结构 */
declare interface R<T = any> {
  code: number
  msg: string
  data: T
}

/** 分页响应结构 */
declare interface PageResult<T = any> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
  last: boolean
}
```

### useHttp 返回类型

```typescript
interface UseHttpReturn {
  get: <T = any>(url: string, params?: Record<string, any>, config?: CustomRequestOptions) => Result<T>
  post: <T = any>(url: string, data?: any, config?: CustomRequestOptions) => Result<T>
  put: <T = any>(url: string, data?: any, config?: CustomRequestOptions) => Result<T>
  del: <T = any>(url: string, params?: Record<string, any>, config?: CustomRequestOptions) => Result<T>
  upload: <T = any>(options: UploadOptions) => Result<T>
  download: (options: DownloadOptions) => Result<UniApp.DownloadSuccessData>
  request: <T = any>(config: CustomRequestOptions) => Result<T>

  // 链式配置
  config: (cfg: CustomRequestOptions) => UseHttpReturn
  noAuth: () => UseHttpReturn
  encrypt: () => UseHttpReturn
  noRepeatSubmit: () => UseHttpReturn
  noTenant: () => UseHttpReturn
  skipWait: () => UseHttpReturn
  noMsgError: () => UseHttpReturn
  timeout: (ms: number) => UseHttpReturn
}
```

## API 调用示例

### 认证模块

```typescript
// api/system/auth/authApi.ts
import { http } from '@/composables/useHttp'
import { withHeaders } from '@/utils/function'

interface LoginRequest {
  username: string
  password: string
  code?: string
  uuid?: string
}

interface AuthTokenVo {
  accessToken: string
  expireIn: number
}

/** 用户登录 */
export const userLogin = (data: LoginRequest): Result<AuthTokenVo> => {
  return http.post<AuthTokenVo>(
    '/auth/userLogin',
    { ...data, authType: 'password' },
    withHeaders(
      { auth: false, isEncrypt: true, repeatSubmit: false },
      { skipWait: true }
    )
  )
}

/** 获取验证码 */
export const getImgCode = (): Result<CaptchaVo> => {
  return http.get<CaptchaVo>(
    '/auth/imgCode',
    {},
    withHeaders({ auth: false }, { timeout: 20000 })
  )
}

/** 退出登录 */
export const logout = (): Result<void> => {
  return http.post('/auth/logout')
}
```

### 用户模块

```typescript
// api/system/user/userApi.ts
import { http } from '@/composables/useHttp'

interface User {
  userId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  status: string
}

/** 获取用户列表 */
export const getUserList = (query: UserQuery): Result<PageResult<User>> => {
  return http.get<PageResult<User>>('/system/user/list', query)
}

/** 获取用户详情 */
export const getUserInfo = (userId: number): Result<User> => {
  return http.get<User>(`/system/user/${userId}`)
}

/** 新增用户 */
export const addUser = (data: Partial<User>): Result<void> => {
  return http.post('/system/user', data)
}

/** 修改用户 */
export const updateUser = (data: Partial<User>): Result<void> => {
  return http.put('/system/user', data)
}

/** 删除用户 */
export const deleteUser = (userIds: number[]): Result<void> => {
  return http.del(`/system/user/${userIds.join(',')}`)
}

/** 重置用户密码 */
export const resetUserPwd = (userId: number, password: string): Result<void> => {
  return http.encrypt().put('/system/user/resetPwd', { userId, password })
}

/** 上传用户头像 */
export const uploadAvatar = (filePath: string): Result<{ imgUrl: string }> => {
  return http.upload({
    url: '/system/user/profile/avatar',
    filePath,
    name: 'avatarfile'
  })
}
```

### 文件模块

```typescript
// api/resource/ossApi.ts
import { http } from '@/composables/useHttp'

interface OssFile {
  ossId: string
  fileName: string
  originalName: string
  fileSuffix: string
  url: string
  size: number
}

/** 上传文件 */
export const uploadFile = (filePath: string): Result<OssFile> => {
  return http.upload<OssFile>({
    url: '/resource/oss/upload',
    filePath,
    name: 'file'
  })
}

/** 下载文件 */
export const downloadFile = (
  ossId: string,
  onProgress?: (progress: number) => void
): Result<UniApp.DownloadSuccessData> => {
  return http.download({
    url: `/resource/oss/download/${ossId}`,
    onProgressUpdate: (res) => onProgress?.(res.progress)
  })
}

/** 删除文件 */
export const deleteFile = (ossIds: string[]): Result<void> => {
  return http.del(`/resource/oss/${ossIds.join(',')}`)
}
```

## 最佳实践

### 1. 统一的 API 管理

```typescript
// api/index.ts
export * from './system/auth/authApi'
export * from './system/user/userApi'
export * from './resource/ossApi'

// 使用
import { userLogin, getUserList, uploadFile } from '@/api'
```

### 2. 请求状态管理

```typescript
// composables/useRequest.ts
import { ref, Ref } from 'vue'

export function useRequest<T, P extends any[]>(
  fn: (...args: P) => Result<T>
) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const execute = async (...args: P) => {
    loading.value = true
    error.value = null

    const [err, result] = await fn(...args)

    loading.value = false

    if (err) {
      error.value = err
      return [err, null] as const
    }

    data.value = result
    return [null, result] as const
  }

  return { data, error, loading, execute }
}

// 使用
const { data: users, loading, execute: fetchUsers } = useRequest(getUserList)

onMounted(() => fetchUsers({ pageNum: 1, pageSize: 10 }))
```

### 3. 请求缓存

```typescript
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TIME = 5 * 60 * 1000  // 5分钟

export function useCachedRequest<T>(key: string, fn: () => Result<T>) {
  const execute = async (): Result<T> => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
      return [null, cached.data as T]
    }

    const [err, data] = await fn()

    if (!err && data) {
      cache.set(key, { data, timestamp: Date.now() })
    }

    return [err, data]
  }

  return { execute, invalidate: () => cache.delete(key) }
}
```

## 常见问题

### 1. 请求超时

**解决方案：**

```typescript
// 增加超时时间
const [err, data] = await http.timeout(60000).post('/api/slow-endpoint', largeData)

// 全局配置
const customHttp = useHttp({ timeout: 30000 })
```

### 2. Token 过期处理

HTTP 模块会在收到 401 响应时自动清除 Token 并跳转登录页。

### 3. 并发请求

```typescript
// 使用 Promise.all
const [usersResult, deptResult] = await Promise.all([
  http.get('/system/user/list'),
  http.get('/system/dept/list')
])

const [usersErr, users] = usersResult
const [deptErr, depts] = deptResult
```

### 4. 文件上传失败

```typescript
const MAX_SIZE = 10 * 1024 * 1024  // 10MB

const uploadWithSizeCheck = async (filePath: string) => {
  const fileInfo = await uni.getFileInfo({ filePath })

  if (fileInfo.size > MAX_SIZE) {
    uni.showToast({ title: '文件大小不能超过10MB', icon: 'none' })
    return [new Error('FILE_TOO_LARGE'), null]
  }

  return http.upload({
    url: '/resource/oss/upload',
    filePath,
    name: 'file'
  })
}
```

### 5. 跨域问题（H5）

```typescript
// vite.config.ts 配置代理
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## 总结

HTTP 请求工具核心要点：

1. **返回格式** - `[Error | null, T | null]` 元组格式
2. **链式调用** - noAuth/encrypt/timeout 等灵活配置
3. **自动处理** - Token、租户ID、防重复提交
4. **文件传输** - 上传下载支持进度回调
5. **错误处理** - 统一错误处理，支持自定义
