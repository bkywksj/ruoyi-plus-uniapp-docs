# HTTP 请求工具

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的 HTTP 请求解决方案，基于 `uni.request` 进行深度封装，实现了统一的请求/响应处理、Token 认证、多租户支持、请求加密、防重复提交等企业级特性。

### 核心特性

- **统一请求入口** - 基于 `useHttp` Composable 封装，提供 GET/POST/PUT/DELETE 等标准方法
- **链式调用 API** - 支持 `.noAuth().encrypt().post()` 链式调用，灵活配置请求选项
- **Token 认证** - 自动携带 Authorization 头部，支持 Token 过期自动跳转登录
- **多租户支持** - 自动携带租户 ID，支持租户隔离的请求处理
- **请求加密** - 支持 RSA + AES 混合加密，保护敏感数据传输
- **防重复提交** - 内置防抖机制，避免用户重复点击导致的多次请求
- **错误处理** - 统一的错误处理和消息提示机制
- **文件传输** - 支持文件上传和下载，带进度回调
- **TypeScript 支持** - 完整的类型定义，提供开发时类型检查

### 技术栈

| 依赖 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0+ | 跨平台框架 |
| Vue 3 | 3.4.21 | 组合式 API |
| TypeScript | 5.7.2 | 类型支持 |

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       应用层 (API 调用)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    useHttp Composable                │  │
│   │  ┌─────────┬─────────┬─────────┬─────────────────┐  │  │
│   │  │   get   │  post   │   put   │      del        │  │  │
│   │  └─────────┴─────────┴─────────┴─────────────────┘  │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │           upload / download                     │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                   request 核心函数                    │  │
│   │  ┌─────────────────────────────────────────────────┐  │  │
│   │  │ buildRequestOptions → uni.request → handleRes  │  │  │
│   │  └─────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    中间件层                           │  │
│   │  ┌───────┬────────┬─────────┬──────────┬─────────┐  │  │
│   │  │ Token │ Tenant │ Encrypt │ Repeat   │ Error   │  │  │
│   │  │ 认证  │ 租户   │ 加密    │ 防重复   │ 处理    │  │  │
│   │  └───────┴────────┴─────────┴──────────┴─────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心文件结构

```
plus-uniapp/src/
├── composables/
│   ├── useHttp.ts          # HTTP 请求核心实现
│   ├── useToken.ts         # Token 管理
│   └── useAuth.ts          # 认证与授权
├── types/
│   ├── http.d.ts           # HTTP 类型定义
│   └── global.d.ts         # 全局类型定义
├── utils/
│   ├── to.ts               # Promise 异常处理
│   └── function.ts         # 工具函数
├── api/                    # API 接口定义
│   └── system/
│       └── auth/
│           └── authApi.ts  # 认证 API 示例
└── systemConfig.ts         # 系统配置
```

## 基础用法

### 快速开始

最简单的使用方式是直接导入 `http` 实例：

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
- 这种设计避免了 try-catch 嵌套，使代码更简洁

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

interface UserListResult {
  records: User[]
  total: number
}

const users = ref<User[]>([])

// 获取用户列表
const fetchUsers = async () => {
  const [err, data] = await http.get<UserListResult>('/system/user/list', {
    pageNum: 1,
    pageSize: 10
  })

  if (err) {
    console.error('获取用户列表失败:', err)
    return
  }

  users.value = data?.records || []
}

onMounted(() => {
  fetchUsers()
})
</script>
```

**使用说明：**
- GET 请求的第二个参数是查询参数对象
- 参数会自动序列化为 URL 查询字符串
- 支持嵌套对象和数组参数

### POST 请求

```vue
<template>
  <view class="login-form">
    <wd-input v-model="form.username" label="用户名" placeholder="请输入用户名" />
    <wd-input v-model="form.password" label="密码" type="password" placeholder="请输入密码" />
    <wd-button type="primary" block :loading="loading" @click="handleLogin">
      登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { http } from '@/composables/useHttp'

interface LoginForm {
  username: string
  password: string
}

interface LoginResult {
  accessToken: string
  expireIn: number
}

const form = reactive<LoginForm>({
  username: '',
  password: ''
})
const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  loading.value = true

  const [err, data] = await http.post<LoginResult>('/auth/login', form)

  loading.value = false

  if (err) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
    return
  }

  // 保存 Token
  if (data?.accessToken) {
    uni.showToast({ title: '登录成功', icon: 'success' })
    // 跳转首页
    uni.switchTab({ url: '/pages/index/index' })
  }
}
</script>
```

**使用说明：**
- POST 请求的第二个参数是请求体数据
- 默认 Content-Type 为 `application/json`
- 数据会自动序列化为 JSON 字符串

### PUT 请求

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface UserUpdateForm {
  userId: number
  nickName: string
  phonenumber: string
  email: string
}

// 更新用户信息
const updateUser = async (form: UserUpdateForm) => {
  const [err] = await http.put('/system/user', form)

  if (err) {
    uni.showToast({ title: '更新失败', icon: 'none' })
    return false
  }

  uni.showToast({ title: '更新成功', icon: 'success' })
  return true
}

// 部分更新
const updateUserStatus = async (userId: number, status: string) => {
  const [err] = await http.put('/system/user/changeStatus', {
    userId,
    status
  })

  if (err) {
    uni.showToast({ title: '状态更新失败', icon: 'none' })
    return false
  }

  return true
}
</script>
```

### DELETE 请求

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 删除单个用户
const deleteUser = async (userId: number) => {
  const [err] = await http.del(`/system/user/${userId}`)

  if (err) {
    uni.showToast({ title: '删除失败', icon: 'none' })
    return false
  }

  uni.showToast({ title: '删除成功', icon: 'success' })
  return true
}

// 批量删除用户
const batchDeleteUsers = async (userIds: number[]) => {
  const [err] = await http.del('/system/user/' + userIds.join(','))

  if (err) {
    uni.showToast({ title: '批量删除失败', icon: 'none' })
    return false
  }

  uni.showToast({ title: '批量删除成功', icon: 'success' })
  return true
}

// 带查询参数的删除
const deleteUserWithParams = async (userId: number, reason: string) => {
  const [err] = await http.del(`/system/user/${userId}`, {
    reason
  })

  return !err
}
</script>
```

## 链式调用

### 基础链式调用

`useHttp` 支持链式调用，可以灵活配置请求选项：

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
  .post('/auth/login', {
    username: 'admin',
    password: '123456'
  })

// 自定义超时
const [err, data] = await http
  .timeout(30000)
  .get('/api/slow-endpoint')

// 禁用错误消息提示
const [err, data] = await http
  .noMsgError()
  .get('/api/endpoint')
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

### 自定义配置

```typescript
import { http } from '@/composables/useHttp'

// 使用 config 方法进行完整配置
const [err, data] = await http
  .config({
    timeout: 60000,
    header: {
      'Custom-Header': 'value'
    }
  })
  .post('/api/endpoint', payload)

// 组合链式调用和配置
const [err, result] = await http
  .noAuth()
  .config({ timeout: 30000 })
  .encrypt()
  .post('/auth/login', loginData)
```

### 创建自定义实例

```typescript
import { useHttp } from '@/composables/useHttp'

// 创建带默认配置的实例
const customHttp = useHttp({
  timeout: 30000,
  header: {
    auth: false  // 默认不需要认证
  }
})

// 使用自定义实例
const [err, data] = await customHttp.get('/public/api')

// 创建专用于文件上传的实例
const uploadHttp = useHttp({
  timeout: 120000,  // 2分钟超时
  header: {
    'Content-Type': 'multipart/form-data'
  }
})
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
  // 选择图片
  const [chooseErr, chooseRes] = await uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  })

  if (chooseErr || !chooseRes) {
    return
  }

  uni.showLoading({ title: '上传中...' })

  // 上传图片
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

<style lang="scss" scoped>
.upload-demo {
  padding: 32rpx;
}
.preview {
  width: 200rpx;
  height: 200rpx;
  margin-top: 32rpx;
}
</style>
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
  const [chooseErr, chooseRes] = await uni.chooseImage({
    count: 1
  })

  if (chooseErr || !chooseRes) return

  uploading.value = true
  progress.value = 0

  const [err, data] = await http.upload({
    url: '/resource/oss/upload',
    filePath: chooseRes.tempFilePaths[0],
    name: 'file',
    // 进度回调
    onProgressUpdate: (res) => {
      progress.value = res.progress
      console.log('上传进度:', res.progress + '%')
      console.log('已上传:', res.totalBytesSent)
      console.log('总大小:', res.totalBytesExpectedToSend)
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

### 多文件上传

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface UploadResult {
  url: string
  fileName: string
}

// 多文件依次上传
const uploadMultipleFiles = async (filePaths: string[]) => {
  const results: UploadResult[] = []
  const errors: Error[] = []

  uni.showLoading({ title: '上传中 0/' + filePaths.length })

  for (let i = 0; i < filePaths.length; i++) {
    uni.showLoading({ title: `上传中 ${i + 1}/${filePaths.length}` })

    const [err, data] = await http.upload<UploadResult>({
      url: '/resource/oss/upload',
      filePath: filePaths[i],
      name: 'file'
    })

    if (err) {
      errors.push(err)
    } else if (data) {
      results.push(data)
    }
  }

  uni.hideLoading()

  return {
    success: results,
    failed: errors,
    total: filePaths.length
  }
}

// 并发上传（限制并发数）
const uploadConcurrent = async (filePaths: string[], concurrency = 3) => {
  const results: UploadResult[] = []
  const queue = [...filePaths]

  const uploadOne = async (): Promise<void> => {
    if (queue.length === 0) return

    const filePath = queue.shift()!
    const [err, data] = await http.upload<UploadResult>({
      url: '/resource/oss/upload',
      filePath,
      name: 'file'
    })

    if (!err && data) {
      results.push(data)
    }

    await uploadOne()
  }

  // 启动并发上传
  await Promise.all(
    Array(Math.min(concurrency, filePaths.length))
      .fill(null)
      .map(() => uploadOne())
  )

  return results
}
</script>
```

## 文件下载

### 基础下载

```vue
<template>
  <view class="download-demo">
    <wd-button @click="downloadFile">下载文件</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const downloadFile = async () => {
  uni.showLoading({ title: '下载中...' })

  const [err, result] = await http.download({
    url: '/resource/oss/download/123',
    filePath: `${uni.env.USER_DATA_PATH}/downloaded_file.pdf`
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: '下载失败', icon: 'none' })
    return
  }

  // 打开文件
  uni.openDocument({
    filePath: result.tempFilePath,
    success: () => {
      console.log('文件打开成功')
    }
  })
}
</script>
```

### 带进度的下载

```vue
<template>
  <view class="download-progress">
    <wd-button @click="downloadWithProgress">下载文件</wd-button>
    <wd-progress v-if="downloading" :percentage="progress" />
    <text v-if="downloading" class="progress-text">
      {{ downloadedSize }} / {{ totalSize }}
    </text>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

const downloading = ref(false)
const progress = ref(0)
const downloadedSize = ref('')
const totalSize = ref('')

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

const downloadWithProgress = async () => {
  downloading.value = true
  progress.value = 0

  const [err, result] = await http.download({
    url: '/resource/oss/download/123',
    onProgressUpdate: (res) => {
      progress.value = res.progress
      downloadedSize.value = formatSize(res.totalBytesWritten)
      totalSize.value = formatSize(res.totalBytesExpectedToWrite)
    }
  })

  downloading.value = false

  if (err) {
    uni.showToast({ title: '下载失败', icon: 'none' })
    return
  }

  uni.showToast({ title: '下载成功', icon: 'success' })

  // 保存到相册（如果是图片）
  if (result?.tempFilePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
    uni.saveImageToPhotosAlbum({
      filePath: result.tempFilePath,
      success: () => {
        uni.showToast({ title: '已保存到相册', icon: 'success' })
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.progress-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}
</style>
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

```vue
<script lang="ts" setup>
import { useToken } from '@/composables/useToken'

const { token, setToken, removeToken, getToken } = useToken()

// 登录成功后保存 Token
const handleLoginSuccess = (accessToken: string) => {
  setToken(accessToken)
  console.log('Token 已保存:', token.value)
}

// 退出登录时清除 Token
const handleLogout = () => {
  removeToken()
  uni.reLaunch({ url: '/pages/login/index' })
}

// 检查登录状态
const checkLogin = () => {
  const currentToken = getToken()
  if (!currentToken) {
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }
  return true
}
</script>
```

### 获取认证头部

```typescript
import { useToken } from '@/composables/useToken'

const { getAuthHeaders, getAuthQuery } = useToken()

// 获取认证头部对象
const headers = getAuthHeaders()
// 返回: { Authorization: 'Bearer xxx...' }

// 获取认证查询参数（用于 WebSocket 等场景）
const query = getAuthQuery()
// 返回: 'token=xxx...'

// 手动发起请求时使用
uni.request({
  url: 'https://api.example.com/data',
  header: {
    ...getAuthHeaders()
  }
})

// WebSocket 连接时使用
uni.connectSocket({
  url: `wss://api.example.com/ws?${getAuthQuery()}`
})
```

### Token 存储机制

Token 使用缓存工具存储，支持自动过期：

```typescript
// useToken.ts 内部实现
const TOKEN_KEY = 'token'
const TOKEN_EXPIRE = 7 * 24 * 3600  // 7天过期

const setToken = (accessToken: string) => {
  cache.set(TOKEN_KEY, accessToken, TOKEN_EXPIRE)
}

const getToken = (): string | null => {
  return cache.get<string>(TOKEN_KEY)
}

const removeToken = () => {
  cache.remove(TOKEN_KEY)
}
```

## 请求配置

### 全局配置

系统配置文件 `systemConfig.ts` 中定义了 HTTP 请求的全局配置：

```typescript
// systemConfig.ts
export const SystemConfig = {
  // API 配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'
  },

  // 安全配置
  security: {
    apiEncrypt: false,  // 是否启用 API 加密
    rsaPublicKey: '...',  // RSA 公钥
    rsaPrivateKey: '...'  // RSA 私钥
  },

  // 租户配置
  tenant: {
    enabled: true,       // 是否启用多租户
    defaultTenantId: '1' // 默认租户 ID
  }
}
```

### 请求配置选项

```typescript
interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  // 查询参数（GET 请求）
  query?: Record<string, any>
  params?: Record<string, any>

  // 自定义头部
  header?: CustomHeaders

  // 跳过应用初始化等待
  skipWait?: boolean

  // 初始化超时时间（毫秒）
  initTimeout?: number
}

interface CustomHeaders {
  // 是否需要认证，默认 true
  auth?: boolean

  // 是否需要租户 ID，默认 true
  tenant?: boolean

  // 是否防止重复提交，默认 true
  repeatSubmit?: boolean

  // 是否加密请求数据
  isEncrypt?: boolean

  // 其他自定义头部
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
    { auth: false, isEncrypt: true },  // 自定义头部
    { timeout: 30000 }                  // 其他配置
  )
)

// 等效于
const [err, data] = await http.post(
  '/api/endpoint',
  payload,
  {
    timeout: 30000,
    header: {
      auth: false,
      isEncrypt: true
    }
  }
)

// 登录请求配置示例
const loginConfig = withHeaders(
  {
    auth: false,         // 登录不需要 Token
    isEncrypt: true,     // 加密密码
    repeatSubmit: false  // 禁止重复提交
  },
  {
    skipWait: true,     // 跳过初始化等待
    timeout: 20000      // 20秒超时
  }
)

const [err, token] = await http.post('/auth/login', loginData, loginConfig)
```

## 错误处理

### 统一错误处理

HTTP 模块内置了统一的错误处理机制：

```typescript
// useHttp.ts 内部错误处理
const handleError = (error: any, config: CustomRequestOptions) => {
  // 1. 网络错误
  if (error.errMsg?.includes('request:fail')) {
    if (!config.header?.noMsgError) {
      uni.showToast({
        title: '网络连接失败，请检查网络设置',
        icon: 'none'
      })
    }
    return new Error('NETWORK_ERROR')
  }

  // 2. 超时错误
  if (error.errMsg?.includes('timeout')) {
    if (!config.header?.noMsgError) {
      uni.showToast({
        title: '请求超时，请稍后重试',
        icon: 'none'
      })
    }
    return new Error('TIMEOUT_ERROR')
  }

  // 3. 业务错误（根据响应码处理）
  const code = error.code || error.statusCode

  switch (code) {
    case 401:
      // Token 过期或无效
      handleUnauthorized()
      return new Error('UNAUTHORIZED')

    case 403:
      uni.showToast({ title: '没有操作权限', icon: 'none' })
      return new Error('FORBIDDEN')

    case 404:
      uni.showToast({ title: '请求的资源不存在', icon: 'none' })
      return new Error('NOT_FOUND')

    case 500:
      uni.showToast({ title: '服务器错误', icon: 'none' })
      return new Error('SERVER_ERROR')

    default:
      if (!config.header?.noMsgError) {
        uni.showToast({
          title: error.msg || error.message || '请求失败',
          icon: 'none'
        })
      }
      return new Error(error.msg || 'UNKNOWN_ERROR')
  }
}

// 处理未授权（Token 过期）
const handleUnauthorized = () => {
  // 清除 Token
  const { removeToken } = useToken()
  removeToken()

  // 跳转登录页
  uni.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    success: () => {
      uni.reLaunch({ url: '/pages/login/index' })
    }
  })
}
```

### 自定义错误处理

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 方式1: 直接处理错误
const fetchData = async () => {
  const [err, data] = await http.get('/api/data')

  if (err) {
    // 根据错误类型处理
    if (err.message === 'NETWORK_ERROR') {
      // 网络错误处理
      retryFetch()
    } else if (err.message === 'UNAUTHORIZED') {
      // 已自动处理，无需额外操作
    } else {
      // 其他错误
      console.error('请求失败:', err)
    }
    return
  }

  // 处理成功数据
  console.log('数据:', data)
}

// 方式2: 静默请求（不显示错误提示）
const silentFetch = async () => {
  const [err, data] = await http.noMsgError().get('/api/data')

  if (err) {
    // 自定义错误处理
    handleCustomError(err)
    return
  }

  return data
}

// 方式3: 使用 to 工具函数处理
import { to, toWithRetry } from '@/utils/to'

const fetchWithRetry = async () => {
  // 自动重试3次，每次间隔2秒
  const [err, data] = await toWithRetry(
    () => http.get('/api/data'),
    3,    // 重试次数
    2000  // 重试间隔
  )

  if (err) {
    console.error('重试后仍失败:', err)
    return
  }

  return data
}
</script>
```

## 防重复提交

### 自动防重复

默认情况下，所有 POST/PUT/DELETE 请求都启用防重复提交：

```typescript
// useHttp.ts 内部实现
const REPEAT_INTERVAL = 500  // 500ms 内视为重复提交
let lastRequest: {
  url: string
  dataHash: string
  timestamp: number
} | null = null

const checkRepeatSubmit = (url: string, data: any): boolean => {
  const now = Date.now()
  const dataHash = JSON.stringify(data)

  if (lastRequest &&
      lastRequest.url === url &&
      lastRequest.dataHash === dataHash &&
      now - lastRequest.timestamp < REPEAT_INTERVAL) {
    console.warn('重复提交被拦截:', url)
    return true  // 是重复提交
  }

  // 更新最后请求信息
  lastRequest = { url, dataHash, timestamp: now }
  return false
}
```

### 禁用防重复

某些场景需要允许快速连续请求：

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const [err, data] = await http.noRepeatSubmit().post('/api/action', payload)

// 方式2: 配置选项
const [err, data] = await http.post('/api/action', payload, {
  header: {
    repeatSubmit: false
  }
})

// 场景示例: 点赞/取消点赞
const toggleLike = async (postId: number, liked: boolean) => {
  // 允许快速切换
  const [err] = await http
    .noRepeatSubmit()
    .post('/post/like', { postId, action: liked ? 'like' : 'unlike' })

  return !err
}
```

## 请求加密

### 启用加密

对于敏感数据，可以启用 RSA + AES 混合加密：

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const [err, data] = await http.encrypt().post('/auth/login', {
  username: 'admin',
  password: '123456'
})

// 方式2: 配置选项
const [err, data] = await http.post('/auth/login', loginData, {
  header: {
    isEncrypt: true
  }
})
```

### 加密流程

```typescript
// 1. 生成随机 AES 密钥
const aesKey = generateRandomKey(16)

// 2. 使用 AES 加密请求数据
const encryptedData = aesEncrypt(JSON.stringify(data), aesKey)

// 3. 使用 RSA 公钥加密 AES 密钥
const encryptedKey = rsaEncrypt(aesKey, publicKey)

// 4. 发送请求
// 请求头: encrypt-key: {encryptedKey}
// 请求体: {encryptedData}

// 5. 服务端处理
// - 使用 RSA 私钥解密 AES 密钥
// - 使用 AES 密钥解密请求数据
// - 处理业务逻辑
// - 使用 AES 密钥加密响应数据

// 6. 客户端解密响应
const decryptedResponse = aesDecrypt(response.data, aesKey)
```

### 配置加密密钥

在 `systemConfig.ts` 中配置 RSA 密钥对：

```typescript
export const SystemConfig = {
  security: {
    apiEncrypt: true,  // 启用加密功能
    rsaPublicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
-----END PUBLIC KEY-----`,
    rsaPrivateKey: `-----BEGIN PRIVATE KEY-----
MIICdQIBADANBgkqhkiG9w0BAQEFAASCA...
-----END PRIVATE KEY-----`
  }
}
```

## 多租户支持

### 自动租户处理

HTTP 模块自动在请求头中携带租户 ID：

```typescript
// 请求头自动添加
// X-Tenant-Id: {tenantId}

// useHttp.ts 内部实现
const buildHeaders = (config: CustomRequestOptions) => {
  const headers: Record<string, string> = {}

  // 添加租户 ID
  if (config.header?.tenant !== false) {
    const tenantId = getTenantId()
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId
    }
  }

  return headers
}
```

### 禁用租户

某些接口需要跨租户访问：

```typescript
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const [err, data] = await http.noTenant().get('/public/config')

// 方式2: 配置选项
const [err, data] = await http.get('/public/config', null, {
  header: {
    tenant: false
  }
})
```

### 切换租户

```typescript
import { useTenant } from '@/composables/useTenant'

const { setTenantId, getTenantId } = useTenant()

// 切换到指定租户
const switchTenant = async (tenantId: string) => {
  setTenantId(tenantId)

  // 重新获取租户相关数据
  await refreshTenantData()
}

// 获取当前租户
const currentTenant = getTenantId()
```

## 类型定义

### 核心类型

```typescript
/**
 * 自定义请求头部接口
 */
export interface CustomHeaders {
  /** 是否需要认证，默认 true */
  auth?: boolean
  /** 是否需要租户 ID，默认 true */
  tenant?: boolean
  /** 是否防止重复提交，默认 true */
  repeatSubmit?: boolean
  /** 是否加密请求数据 */
  isEncrypt?: boolean
  /** 是否静默错误（不显示错误提示） */
  noMsgError?: boolean
  /** 其他自定义头部 */
  [key: string]: any
}

/**
 * 自定义请求配置接口
 */
export interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  /** 查询参数 */
  query?: Record<string, any>
  /** 查询参数（别名） */
  params?: Record<string, any>
  /** 自定义头部 */
  header?: CustomHeaders
  /** 是否跳过等待应用初始化 */
  skipWait?: boolean
  /** 初始化超时时间（毫秒），默认 10 秒 */
  initTimeout?: number
}

/**
 * 上传配置接口
 */
export interface UploadOptions {
  /** 上传地址 */
  url: string
  /** 文件路径 */
  filePath: string
  /** 文件对应的 key */
  name: string
  /** 额外的表单数据 */
  formData?: Record<string, any>
  /** 自定义头部 */
  header?: CustomHeaders
  /** 超时时间 */
  timeout?: number
  /** 进度回调 */
  onProgressUpdate?: (res: UniApp.OnProgressUpdateResult) => void
}

/**
 * 下载配置接口
 */
export interface DownloadOptions {
  /** 下载地址 */
  url: string
  /** 保存路径（可选） */
  filePath?: string
  /** 自定义头部 */
  header?: CustomHeaders
  /** 超时时间 */
  timeout?: number
  /** 进度回调 */
  onProgressUpdate?: (res: UniApp.OnProgressDownloadResult) => void
}
```

### 响应类型

```typescript
/**
 * Promise 结果元组类型
 */
declare type Result<T = any> = Promise<[Error | null, T | null]>

/**
 * 统一响应结构
 */
declare interface R<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}

/**
 * 分页响应结构
 */
declare interface PageResult<T = any> {
  /** 数据记录列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 是否为最后一页 */
  last: boolean
}
```

### useHttp 返回类型

```typescript
/**
 * useHttp 返回接口
 */
interface UseHttpReturn {
  /** GET 请求 */
  get: <T = any>(
    url: string,
    params?: Record<string, any>,
    config?: CustomRequestOptions
  ) => Result<T>

  /** POST 请求 */
  post: <T = any>(
    url: string,
    data?: any,
    config?: CustomRequestOptions
  ) => Result<T>

  /** PUT 请求 */
  put: <T = any>(
    url: string,
    data?: any,
    config?: CustomRequestOptions
  ) => Result<T>

  /** DELETE 请求 */
  del: <T = any>(
    url: string,
    params?: Record<string, any>,
    config?: CustomRequestOptions
  ) => Result<T>

  /** 文件上传 */
  upload: <T = any>(options: UploadOptions) => Result<T>

  /** 文件下载 */
  download: (options: DownloadOptions) => Result<UniApp.DownloadSuccessData>

  /** 通用请求 */
  request: <T = any>(config: CustomRequestOptions) => Result<T>

  /** 链式配置 */
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

## Promise 异常处理

### to 工具函数

`to.ts` 提供了优雅的 Promise 异常处理方案：

```typescript
import { to, toValidate, toIf, toWithRetry } from '@/utils/to'

// 基础用法
const [err, user] = await to(fetchUser(id))
if (err) {
  return handleError(err)
}
console.log('用户:', user)

// 表单验证
const [validateErr, isValid] = await toValidate(formRef)
if (validateErr || !isValid) {
  return
}

// 条件执行
const shouldFetch = someCondition
const [err, result] = await toIf(shouldFetch, () => fetchData())

// 带重试机制
const [err, data] = await toWithRetry(
  () => http.get('/api/unstable'),
  3,     // 最大重试次数
  2000   // 重试间隔（毫秒）
)

// 组合使用
const processOrder = async (orderId: string) => {
  // 1. 获取订单
  const [fetchErr, order] = await to(getOrder(orderId))
  if (fetchErr) return [fetchErr, null]

  // 2. 验证订单
  const [validateErr] = await toIf(
    order.status === 'pending',
    () => validateOrder(order)
  )
  if (validateErr) return [validateErr, null]

  // 3. 处理订单（带重试）
  const [processErr, result] = await toWithRetry(
    () => processOrderPayment(order),
    3,
    1000
  )

  return [processErr, result]
}
```

### to 函数实现

```typescript
/**
 * Promise 异常处理包装器
 * @param promise Promise 对象
 * @returns [错误, 数据] 元组
 */
export function to<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[Error, null]>((err: Error) => [err, null])
}

/**
 * 表单验证包装器
 */
export async function toValidate(
  formRef: any
): Promise<[Error | null, boolean]> {
  try {
    const valid = await formRef.validate()
    return [null, valid]
  } catch (err) {
    return [err as Error, false]
  }
}

/**
 * 条件执行包装器
 */
export async function toIf<T>(
  condition: boolean,
  fn: () => Promise<T>
): Promise<[Error | null, T | null]> {
  if (!condition) {
    return [null, null]
  }
  return to(fn())
}

/**
 * 带重试的 Promise 包装器
 */
export async function toWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<[Error | null, T | null]> {
  let lastError: Error | null = null

  for (let i = 0; i <= retries; i++) {
    const [err, data] = await to(fn())

    if (!err) {
      return [null, data]
    }

    lastError = err

    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return [lastError, null]
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

interface CaptchaVo {
  captchaEnabled: boolean
  uuid: string
  img: string
}

/**
 * 用户登录
 */
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

/**
 * 获取验证码
 */
export const getImgCode = (): Result<CaptchaVo> => {
  return http.get<CaptchaVo>(
    '/auth/imgCode',
    {},
    withHeaders({ auth: false }, { timeout: 20000 })
  )
}

/**
 * 获取租户配置
 */
export const getTenantConfig = (): Result<TenantConfigVo> => {
  return http.get<TenantConfigVo>('/auth/getTenantConfig')
}

/**
 * 退出登录
 */
export const logout = (): Result<void> => {
  return http.post('/auth/logout')
}

/**
 * 刷新 Token
 */
export const refreshToken = (): Result<AuthTokenVo> => {
  return http.post<AuthTokenVo>(
    '/auth/refreshToken',
    {},
    withHeaders({ repeatSubmit: false })
  )
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
  sex: string
  avatar: string
  status: string
  deptId: number
  deptName: string
  roleIds: number[]
  roleNames: string[]
}

interface UserQuery {
  pageNum?: number
  pageSize?: number
  userName?: string
  phonenumber?: string
  status?: string
  deptId?: number
}

/**
 * 获取用户列表
 */
export const getUserList = (query: UserQuery): Result<PageResult<User>> => {
  return http.get<PageResult<User>>('/system/user/list', query)
}

/**
 * 获取用户详情
 */
export const getUserInfo = (userId: number): Result<User> => {
  return http.get<User>(`/system/user/${userId}`)
}

/**
 * 新增用户
 */
export const addUser = (data: Partial<User>): Result<void> => {
  return http.post('/system/user', data)
}

/**
 * 修改用户
 */
export const updateUser = (data: Partial<User>): Result<void> => {
  return http.put('/system/user', data)
}

/**
 * 删除用户
 */
export const deleteUser = (userIds: number[]): Result<void> => {
  return http.del(`/system/user/${userIds.join(',')}`)
}

/**
 * 重置用户密码
 */
export const resetUserPwd = (userId: number, password: string): Result<void> => {
  return http.encrypt().put('/system/user/resetPwd', { userId, password })
}

/**
 * 修改用户状态
 */
export const changeUserStatus = (
  userId: number,
  status: string
): Result<void> => {
  return http.put('/system/user/changeStatus', { userId, status })
}

/**
 * 获取用户个人信息
 */
export const getUserProfile = (): Result<User> => {
  return http.get<User>('/system/user/profile')
}

/**
 * 修改用户个人信息
 */
export const updateUserProfile = (data: Partial<User>): Result<void> => {
  return http.put('/system/user/profile', data)
}

/**
 * 修改用户密码
 */
export const updateUserPwd = (
  oldPassword: string,
  newPassword: string
): Result<void> => {
  return http.encrypt().put('/system/user/profile/updatePwd', {
    oldPassword,
    newPassword
  })
}

/**
 * 上传用户头像
 */
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
  createTime: string
}

/**
 * 上传文件
 */
export const uploadFile = (filePath: string): Result<OssFile> => {
  return http.upload<OssFile>({
    url: '/resource/oss/upload',
    filePath,
    name: 'file'
  })
}

/**
 * 批量上传文件
 */
export const uploadFiles = async (filePaths: string[]): Promise<OssFile[]> => {
  const results: OssFile[] = []

  for (const filePath of filePaths) {
    const [err, data] = await uploadFile(filePath)
    if (!err && data) {
      results.push(data)
    }
  }

  return results
}

/**
 * 下载文件
 */
export const downloadFile = (
  ossId: string,
  onProgress?: (progress: number) => void
): Result<UniApp.DownloadSuccessData> => {
  return http.download({
    url: `/resource/oss/download/${ossId}`,
    onProgressUpdate: (res) => {
      onProgress?.(res.progress)
    }
  })
}

/**
 * 删除文件
 */
export const deleteFile = (ossIds: string[]): Result<void> => {
  return http.del(`/resource/oss/${ossIds.join(',')}`)
}

/**
 * 获取文件列表
 */
export const getFileList = (
  query: { pageNum: number; pageSize: number }
): Result<PageResult<OssFile>> => {
  return http.get<PageResult<OssFile>>('/resource/oss/list', query)
}
```

## 最佳实践

### 1. 统一的 API 管理

将所有 API 调用集中管理：

```typescript
// api/index.ts
export * from './system/auth/authApi'
export * from './system/user/userApi'
export * from './system/dict/dictApi'
export * from './resource/ossApi'

// 使用示例
import { userLogin, getUserList, uploadFile } from '@/api'

const [err, token] = await userLogin({ username, password })
```

### 2. 请求封装层

为复杂业务创建封装层：

```typescript
// services/userService.ts
import { getUserInfo, updateUserProfile, uploadAvatar } from '@/api'
import type { User } from '@/types/user'

export const userService = {
  /**
   * 获取完整用户信息（包含部门、角色等）
   */
  async getFullUserInfo(userId: number) {
    const [err, user] = await getUserInfo(userId)
    if (err) return null

    // 可以在这里做数据转换或额外处理
    return {
      ...user,
      displayName: user.nickName || user.userName,
      isAdmin: user.roleNames?.includes('admin')
    }
  },

  /**
   * 更新用户信息（带头像上传）
   */
  async updateProfile(data: Partial<User>, avatarPath?: string) {
    // 先上传头像
    if (avatarPath) {
      const [uploadErr, uploadRes] = await uploadAvatar(avatarPath)
      if (uploadErr) {
        return { success: false, error: '头像上传失败' }
      }
      data.avatar = uploadRes?.imgUrl
    }

    // 更新用户信息
    const [err] = await updateUserProfile(data)
    if (err) {
      return { success: false, error: '信息更新失败' }
    }

    return { success: true }
  }
}
```

### 3. 请求状态管理

使用 Composable 管理请求状态：

```typescript
// composables/useRequest.ts
import { ref, Ref } from 'vue'

interface UseRequestOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useRequest<T, P extends any[]>(
  fn: (...args: P) => Result<T>,
  options: UseRequestOptions<T> = {}
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
      options.onError?.(err)
      return [err, null] as const
    }

    data.value = result
    options.onSuccess?.(result!)
    return [null, result] as const
  }

  return {
    data,
    error,
    loading,
    execute
  }
}

// 使用示例
const { data: users, loading, execute: fetchUsers } = useRequest(getUserList)

onMounted(() => {
  fetchUsers({ pageNum: 1, pageSize: 10 })
})
```

### 4. 错误边界处理

```typescript
// utils/errorBoundary.ts
import { http } from '@/composables/useHttp'

/**
 * 全局错误边界
 */
export const withErrorBoundary = async <T>(
  fn: () => Result<T>,
  fallback?: T
): Promise<T | null> => {
  try {
    const [err, data] = await fn()

    if (err) {
      console.error('请求错误:', err)
      return fallback ?? null
    }

    return data
  } catch (e) {
    console.error('未捕获错误:', e)
    return fallback ?? null
  }
}

// 使用示例
const users = await withErrorBoundary(
  () => http.get<User[]>('/system/user/list'),
  []  // 错误时返回空数组
)
```

### 5. 请求取消

```typescript
// composables/useCancelableRequest.ts
import { ref, onUnmounted } from 'vue'

export function useCancelableRequest() {
  const abortController = ref<AbortController | null>(null)

  const request = async <T>(
    fn: (signal: AbortSignal) => Result<T>
  ): Result<T> => {
    // 取消之前的请求
    abortController.value?.abort()

    // 创建新的控制器
    abortController.value = new AbortController()

    return fn(abortController.value.signal)
  }

  const cancel = () => {
    abortController.value?.abort()
  }

  // 组件卸载时自动取消
  onUnmounted(() => {
    cancel()
  })

  return { request, cancel }
}
```

## 常见问题

### 1. 请求超时

**问题原因：**
- 网络不稳定
- 服务器响应慢
- 请求数据量大

**解决方案：**

```typescript
// 增加超时时间
const [err, data] = await http
  .timeout(60000)  // 60秒
  .post('/api/slow-endpoint', largeData)

// 全局配置默认超时
const customHttp = useHttp({
  timeout: 30000  // 30秒
})

// 针对特定场景配置
const uploadWithLongTimeout = async (filePath: string) => {
  return http.upload({
    url: '/resource/oss/upload',
    filePath,
    name: 'file',
    timeout: 120000  // 2分钟
  })
}
```

### 2. Token 过期处理

**问题原因：**
- Token 已过期
- Token 被服务端注销

**解决方案：**

```typescript
// 方案1: 自动刷新 Token（内置支持）
// HTTP 模块会在收到 401 响应时自动处理

// 方案2: 手动刷新
import { refreshToken, userLogin } from '@/api'
import { useToken } from '@/composables/useToken'

const { setToken, removeToken } = useToken()

const handleTokenExpired = async () => {
  // 尝试刷新 Token
  const [err, data] = await refreshToken()

  if (err) {
    // 刷新失败，需要重新登录
    removeToken()
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }

  // 刷新成功，更新 Token
  setToken(data!.accessToken)
}
```

### 3. 并发请求问题

**问题原因：**
- 多个请求同时发出
- 响应顺序不可控

**解决方案：**

```typescript
// 方案1: 使用 Promise.all
const fetchAllData = async () => {
  const [usersResult, deptResult, roleResult] = await Promise.all([
    http.get('/system/user/list'),
    http.get('/system/dept/list'),
    http.get('/system/role/list')
  ])

  const [usersErr, users] = usersResult
  const [deptErr, depts] = deptResult
  const [roleErr, roles] = roleResult

  // 处理数据...
}

// 方案2: 使用请求 ID 控制
let requestId = 0

const fetchWithId = async () => {
  const currentId = ++requestId

  const [err, data] = await http.get('/api/data')

  // 检查是否是最新请求
  if (currentId !== requestId) {
    return  // 忽略过时的响应
  }

  // 处理数据...
}
```

### 4. 文件上传失败

**问题原因：**
- 文件过大
- 网络中断
- 服务器限制

**解决方案：**

```typescript
// 方案1: 检查文件大小
const MAX_SIZE = 10 * 1024 * 1024  // 10MB

const uploadWithSizeCheck = async (filePath: string) => {
  // 获取文件信息
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

// 方案2: 分片上传（大文件）
const uploadLargeFile = async (filePath: string) => {
  const CHUNK_SIZE = 2 * 1024 * 1024  // 2MB

  // 读取文件
  const fileInfo = await uni.getFileInfo({ filePath })
  const totalChunks = Math.ceil(fileInfo.size / CHUNK_SIZE)

  // 初始化上传
  const [initErr, { uploadId }] = await http.post('/resource/oss/initMultipart', {
    fileName: 'large-file.zip',
    totalChunks
  })

  if (initErr) return [initErr, null]

  // 上传分片
  for (let i = 0; i < totalChunks; i++) {
    const [chunkErr] = await http.upload({
      url: `/resource/oss/uploadPart/${uploadId}/${i}`,
      filePath,
      name: 'chunk',
      formData: { chunkIndex: i }
    })

    if (chunkErr) return [chunkErr, null]
  }

  // 完成上传
  return http.post(`/resource/oss/completeMultipart/${uploadId}`)
}
```

### 5. 跨域问题

**问题原因：**
- H5 环境下跨域限制

**解决方案：**

```typescript
// vite.config.ts 配置代理（开发环境）
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

// 或使用 manifest.json 配置（H5）
{
  "h5": {
    "devServer": {
      "proxy": {
        "/api": {
          "target": "https://api.example.com",
          "changeOrigin": true
        }
      }
    }
  }
}
```

### 6. 请求参数序列化

**问题原因：**
- 复杂对象/数组参数序列化

**解决方案：**

```typescript
// 数组参数
const [err, data] = await http.get('/api/users', {
  ids: [1, 2, 3]  // 自动序列化为 ids=1&ids=2&ids=3
})

// 嵌套对象
const [err, data] = await http.get('/api/search', {
  filter: {
    name: 'test',
    status: 1
  }
})
// 序列化为 filter[name]=test&filter[status]=1

// 自定义序列化
import qs from 'qs'

const params = qs.stringify({
  ids: [1, 2, 3]
}, { arrayFormat: 'comma' })  // ids=1,2,3

const [err, data] = await http.get(`/api/users?${params}`)
```

## 性能优化

### 请求缓存

```typescript
// composables/useRequestCache.ts
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TIME = 5 * 60 * 1000  // 5分钟

export function useCachedRequest<T>(
  key: string,
  fn: () => Result<T>,
  cacheTime = CACHE_TIME
) {
  const getCached = () => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data as T
    }
    return null
  }

  const execute = async (): Result<T> => {
    // 检查缓存
    const cached = getCached()
    if (cached) {
      return [null, cached]
    }

    // 发起请求
    const [err, data] = await fn()

    if (!err && data) {
      // 更新缓存
      cache.set(key, { data, timestamp: Date.now() })
    }

    return [err, data]
  }

  const invalidate = () => {
    cache.delete(key)
  }

  return { execute, invalidate, getCached }
}

// 使用示例
const { execute: fetchDict, invalidate } = useCachedRequest(
  'dict:sys_user_sex',
  () => http.get('/system/dict/data/type/sys_user_sex')
)

const [err, dictData] = await fetchDict()
```

### 请求合并

```typescript
// utils/requestBatcher.ts
class RequestBatcher<T> {
  private queue: Array<{
    id: string
    resolve: (value: T) => void
    reject: (error: Error) => void
  }> = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private batchFn: (ids: string[]) => Result<Record<string, T>>
  private delay: number

  constructor(
    batchFn: (ids: string[]) => Result<Record<string, T>>,
    delay = 50
  ) {
    this.batchFn = batchFn
    this.delay = delay
  }

  async fetch(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, resolve, reject })

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay)
      }
    })
  }

  private async flush() {
    const batch = [...this.queue]
    this.queue = []
    this.timer = null

    const ids = [...new Set(batch.map(item => item.id))]
    const [err, results] = await this.batchFn(ids)

    batch.forEach(item => {
      if (err) {
        item.reject(err)
      } else if (results?.[item.id]) {
        item.resolve(results[item.id])
      } else {
        item.reject(new Error('Data not found'))
      }
    })
  }
}

// 使用示例
const userBatcher = new RequestBatcher<User>(
  (ids) => http.get('/system/user/batchGet', { ids })
)

// 多次调用会合并为一次请求
const user1 = await userBatcher.fetch('1')
const user2 = await userBatcher.fetch('2')
const user3 = await userBatcher.fetch('3')
```

### 请求节流

```typescript
// utils/throttledRequest.ts
import { throttle } from 'lodash-es'

export function createThrottledRequest<T, P extends any[]>(
  fn: (...args: P) => Result<T>,
  wait = 1000
) {
  let lastResult: [Error | null, T | null] = [null, null]

  const throttled = throttle(async (...args: P) => {
    lastResult = await fn(...args)
    return lastResult
  }, wait)

  return async (...args: P): Result<T> => {
    await throttled(...args)
    return lastResult
  }
}

// 使用示例
const throttledSearch = createThrottledRequest(
  (keyword: string) => http.get('/api/search', { keyword }),
  500
)

// 快速连续调用只会执行一次
await throttledSearch('test')
await throttledSearch('test')
await throttledSearch('test')
```

