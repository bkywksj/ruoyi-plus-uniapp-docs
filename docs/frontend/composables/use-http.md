# useHttp

基于 Axios 的 HTTP 请求封装，提供完整的请求拦截、响应处理和错误处理机制。

## 📋 功能特性

- **请求方法**: 封装标准 HTTP 方法 (get, post, put, delete, request)
- **拦截器处理**: 自动处理请求/响应拦截器配置
- **认证管理**: 自动添加 Token 和处理未授权情况
- **数据加密**: 支持请求数据 AES 加密和 RSA 密钥交换
- **防重复提交**: 阻止短时间内重复提交相同数据
- **国际化支持**: 自动添加语言请求头
- **错误处理**: 统一处理各类 HTTP 错误和状态码
- **请求取消**: 支持取消未完成的请求
- **统一返回格式**: 所有请求统一返回 [error, data] 数组格式
- **泛型支持**: 完整的 TypeScript 类型推导

## 🎯 基础用法

### 基本 HTTP 请求

```typescript
import { useHttp } from '@/composables/useHttp'

const http = useHttp()

// GET 请求
const [err, users] = await http.get<User[]>('/api/users')
if (!err) {
  console.log(users) // User[] 类型
}

// POST 请求
const userData = { name: 'John', email: 'john@example.com' }
const [err, user] = await http.post<User>('/api/users', userData)
if (!err) {
  console.log(user) // User 类型
}

// PUT 请求
const [err, updatedUser] = await http.put<User>('/api/users/123', userData)

// DELETE 请求
const [err, result] = await http.del<void>('/api/users/123')
```

### 带参数的 GET 请求

```typescript
// 查询参数会自动转换为 URL 查询字符串
const params = {
  page: 1,
  size: 10,
  keyword: 'search'
}

const [err, data] = await http.get<PageResult<User>>('/api/users', params)
// 实际请求: GET /api/users?page=1&size=10&keyword=search
```

### 自定义请求配置

```typescript
// 使用自定义配置
const [err, data] = await http.request<ApiResponse>({
  method: 'PATCH',
  url: '/api/users/123',
  data: { status: 'active' },
  timeout: 10000,
  headers: {
    'Custom-Header': 'value'
  }
})
```

## 🔧 高级功能

### 文件上传

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('description', 'Upload file')

const [err, result] = await http.post<UploadResult>('/api/upload', formData)
// Content-Type 会自动设置为 multipart/form-data
```

### 下载文件

```typescript
const [err, blob] = await http.get<Blob>('/api/export/users', {}, {
  responseType: 'blob'
})

if (!err) {
  // 处理文件下载
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'users.xlsx'
  a.click()
}
```

### 禁用认证

```typescript
// 某些接口不需要认证（如登录接口）
const [err, token] = await http.post<LoginResult>('/api/login', loginData, {
  headers: { auth: false }
})
```

### 禁用防重复提交

```typescript
// 某些接口允许快速重复提交
const [err, result] = await http.post('/api/heartbeat', {}, {
  headers: { repeatSubmit: false }
})
```

### 启用数据加密

```typescript
// 敏感数据加密传输
const sensitiveData = { password: '123456', idCard: '110101199001011234' }
const [err, result] = await http.post('/api/sensitive', sensitiveData, {
  headers: { isEncrypt: 'true' }
})
```

## 🛡️ 错误处理

### 标准错误处理格式

```typescript
const [err, data] = await http.get<User>('/api/users/123')

if (err) {
  // 处理错误
  console.error('请求失败:', err.message)
  
  // 根据错误类型进行不同处理
  if (err.message.includes('401')) {
    // 未授权，跳转登录
    router.push('/login')
  } else if (err.message.includes('500')) {
    // 服务器错误
    ElMessage.error('服务器错误，请稍后重试')
  }
} else {
  // 请求成功
  console.log('用户信息:', data)
}
```

### HTTP 状态码处理

系统自动处理以下状态码：

- **200**: 请求成功，返回数据
- **401**: 未授权，显示重登录对话框
- **500**: 服务器内部错误，显示错误提示
- **601**: 警告状态，显示警告消息

### 网络错误处理

```typescript
// 网络错误会自动显示友好提示
const [err, data] = await http.get('/api/users')

if (err) {
  // 错误信息已经过处理，包含 URL 信息
  // 例如: "接口连接异常[/api/users]" 或 "接口请求超时[/api/users]"
  console.log(err.message)
}
```

## ⚙️ 请求拦截器功能

### 自动添加的请求头

```typescript
// 每个请求会自动添加以下头部：
{
  'Content-Language': 'zh-CN',     // 当前语言
  'Authorization': 'Bearer token', // 用户令牌
  'X-Tenant-Id': '000000'         // 租户ID
}
```

### 防重复提交机制

```typescript
// 5秒内相同的 POST/PUT 请求会被阻止
const userData = { name: 'John' }

await http.post('/api/users', userData) // 成功
await http.post('/api/users', userData) // 被阻止: "数据正在处理，请勿重复提交"
```

## 🔒 数据加密

### 启用加密传输

```typescript
// 在系统配置中启用 API 加密
SystemConfig.security.apiEncrypt = true

// 标记需要加密的请求
const [err, result] = await http.post('/api/sensitive-data', data, {
  headers: { isEncrypt: 'true' }
})
```

### 加密流程

1. 生成 AES 密钥
2. 使用 RSA 加密 AES 密钥
3. 使用 AES 加密请求数据
4. 服务器使用相同密钥解密响应数据

## 📱 在组件中使用

### 基本用法

```vue
<template>
  <div>
    <el-button @click="loadUsers" :loading="loading">
      加载用户
    </el-button>
    <el-table :data="users" v-loading="loading">
      <!-- 表格列定义 -->
    </el-table>
  </div>
</template>

<script setup>
import { useHttp } from '@/composables/useHttp'

const http = useHttp()
const users = ref<User[]>([])
const loading = ref(false)

const loadUsers = async () => {
  loading.value = true
  
  const [err, data] = await http.get<User[]>('/api/users')
  
  loading.value = false
  
  if (!err) {
    users.value = data
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})
</script>
```

### 表单提交

```vue
<template>
  <el-form @submit.prevent="handleSubmit">
    <el-form-item label="用户名">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        提交
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { useHttp } from '@/composables/useHttp'

const http = useHttp()
const submitting = ref(false)
const form = reactive({
  username: '',
  email: ''
})

const handleSubmit = async () => {
  submitting.value = true
  
  const [err, result] = await http.post<User>('/api/users', form)
  
  submitting.value = false
  
  if (!err) {
    ElMessage.success('创建成功')
    // 处理成功逻辑
  }
}
</script>
```

## 🏗️ 自定义配置

### 创建自定义 HTTP 实例

```typescript
import { useHttp } from '@/composables/useHttp'

// 创建具有自定义配置的实例
const customHttp = useHttp({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'Custom-Header': 'value'
  }
})

const [err, data] = await customHttp.get('/custom-endpoint')
```

### 访问原始 Axios 实例

```typescript
const http = useHttp()

// 访问底层 axios 实例进行高级配置
http.axios.interceptors.request.use(config => {
  // 自定义请求拦截器
  return config
})
```

## 🎯 最佳实践

### 1. 类型安全

```typescript
// 定义接口类型
interface User {
  id: number
  name: string
  email: string
}

interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// 使用泛型确保类型安全
const [err, users] = await http.get<PageResult<User>>('/api/users')
if (!err) {
  // users 具有完整的类型信息
  console.log(users.list[0].name) // TypeScript 类型检查
}
```

### 2. 错误处理策略

```typescript
// 统一错误处理函数
const handleApiError = (err: Error, defaultMsg: string = '操作失败') => {
  if (err.message.includes('401')) {
    // 跳转登录
    router.push('/login')
  } else if (err.message.includes('403')) {
    ElMessage.error('权限不足')
  } else {
    ElMessage.error(defaultMsg)
  }
}

// 使用统一错误处理
const [err, data] = await http.get('/api/users')
if (err) {
  handleApiError(err, '加载用户失败')
}
```

### 3. 请求封装

```typescript
// 封装常用的 API 请求
export const userApi = {
  async getUsers(params: UserQuery) {
    return await http.get<PageResult<User>>('/api/users', params)
  },
  
  async createUser(data: CreateUserDto) {
    return await http.post<User>('/api/users', data)
  },
  
  async updateUser(id: number, data: UpdateUserDto) {
    return await http.put<User>(`/api/users/${id}`, data)
  },
  
  async deleteUser(id: number) {
    return await http.del<void>(`/api/users/${id}`)
  }
}
```

## ⚠️ 注意事项

1. **GET 请求参数**: GET 请求的 params 会自动转换为 URL 查询字符串
2. **FormData**: 上传文件时 Content-Type 会自动设置，无需手动指定
3. **错误处理**: 所有网络错误都会自动显示用户友好的提示信息
4. **重复请求**: 系统会自动阻止 5 秒内的重复 POST/PUT 请求
5. **认证状态**: 401 状态会自动触发重新登录流程
6. **租户隔离**: 请求会自动携带当前租户 ID
