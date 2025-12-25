# useHttp

基于 Axios 的 HTTP 请求封装组合函数，提供完整的请求拦截、响应处理、错误处理和安全机制。该组合函数是前端与后端通信的核心工具，集成了认证管理、数据加密、防重复提交、国际化等企业级功能。

## 📋 功能特性

- **请求方法封装**: 封装标准 HTTP 方法（GET、POST、PUT、DELETE、REQUEST）
- **链式调用 API**: 支持链式调用配置，如 `http.noAuth().encrypt().post(...)`
- **请求拦截器**: 自动处理认证 Token、租户 ID、国际化语言、请求 ID 等
- **响应拦截器**: 统一处理响应数据、状态码、错误消息
- **认证管理**: 自动添加 Token，处理 401 未授权情况
- **数据加密**: 支持 AES 加密请求数据和 RSA 密钥交换
- **防重复提交**: 阻止 5 秒内重复提交相同数据
- **国际化支持**: 自动添加 `Content-Language` 请求头
- **错误处理**: 统一处理网络错误、超时、各类 HTTP 状态码
- **统一返回格式**: 所有请求统一返回 `[error, data]` 数组格式
- **TypeScript 支持**: 完整的泛型类型推导

## 🎯 快速开始

### 安装与导入

```typescript
import { useHttp, http } from '@/composables/useHttp'
```

### 最简用法

```typescript
// 使用全局实例
import { http } from '@/composables/useHttp'

// GET 请求
const [err, users] = await http.get<User[]>('/api/users')
if (!err) {
  console.log('用户列表:', users)
}

// POST 请求
const [err, user] = await http.post<User>('/api/users', { name: 'John' })
if (!err) {
  console.log('创建成功:', user)
}
```

## 📐 核心概念

### 统一返回格式

所有请求方法都返回 `Result<T>` 类型，即 `[Error | null, T | null]` 元组：

```typescript
type Result<T> = Promise<[Error, null] | [null, T]>

// 使用示例
const [err, data] = await http.get<User>('/api/user/1')

if (err) {
  // 请求失败，err 是 Error 对象
  console.error('请求失败:', err.message)
} else {
  // 请求成功，data 是响应数据
  console.log('用户信息:', data)
}
```

这种模式的优势：
- **无需 try-catch**: 错误通过返回值处理，代码更简洁
- **类型安全**: TypeScript 能正确推导 data 的类型
- **统一处理**: 所有请求的错误处理方式一致

### HTTP 状态码处理

系统自动处理以下状态码：

| 状态码 | 含义 | 处理方式 |
|--------|------|----------|
| `200` | 请求成功 | 返回响应数据 |
| `401` | 未授权 | 显示重新登录对话框 |
| `500` | 服务器错误 | 显示错误消息 |
| `601` | 警告状态 | 显示警告消息 |
| 其他 | 其他错误 | 显示通知错误 |

### 请求头配置

系统会自动添加以下请求头：

```typescript
{
  'Content-Type': 'application/json;charset=utf-8',
  'Content-Language': 'zh-CN',           // 当前语言
  'Authorization': 'Bearer xxx',          // 用户令牌
  'X-Tenant-Id': '000000',               // 租户ID
  'X-Request-Id': '20250529120000000'    // 请求ID（用于日志追踪）
}
```

## 🔧 基础用法

### GET 请求

```typescript
import { http } from '@/composables/useHttp'

// 简单 GET 请求
const [err, users] = await http.get<User[]>('/api/users')
if (!err) {
  console.log('用户列表:', users)
}

// 带查询参数的 GET 请求
const params = {
  page: 1,
  size: 10,
  keyword: 'search'
}
const [err, data] = await http.get<PageResult<User>>('/api/users', params)
// 实际请求: GET /api/users?page=1&size=10&keyword=search

// 带配置的 GET 请求
const [err, data] = await http.get<User>('/api/user/1', null, {
  timeout: 10000,
  headers: { 'Custom-Header': 'value' }
})
```

### POST 请求

```typescript
import { http } from '@/composables/useHttp'

// 简单 POST 请求
const userData = { name: 'John', email: 'john@example.com' }
const [err, user] = await http.post<User>('/api/users', userData)
if (!err) {
  console.log('创建成功:', user)
}

// 带配置的 POST 请求
const [err, result] = await http.post<Result>('/api/upload', formData, {
  timeout: 60000,
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

### PUT 请求

```typescript
import { http } from '@/composables/useHttp'

// 更新用户信息
const updateData = { name: 'John Updated', email: 'john.updated@example.com' }
const [err, user] = await http.put<User>('/api/users/123', updateData)
if (!err) {
  console.log('更新成功:', user)
}
```

### DELETE 请求

```typescript
import { http } from '@/composables/useHttp'

// 删除用户
const [err, result] = await http.del<void>('/api/users/123')
if (!err) {
  console.log('删除成功')
}

// 带参数的删除请求
const [err, result] = await http.del('/api/users', { ids: [1, 2, 3] })
```

### 自定义请求

```typescript
import { http } from '@/composables/useHttp'

// 使用 request 方法发送自定义请求
const [err, data] = await http.request<User>({
  method: 'PATCH',
  url: '/api/users/123',
  data: { status: 'active' },
  timeout: 10000,
  headers: { 'Custom-Header': 'value' }
})

if (!err) {
  console.log('更新成功:', data)
}
```

## 🔗 链式调用 API

useHttp 支持链式调用配置，使代码更加简洁和语义化。

### noAuth - 禁用认证

用于不需要认证的接口（如登录、注册）：

```typescript
import { http } from '@/composables/useHttp'

// 登录接口不需要认证
const [err, token] = await http.noAuth().post<LoginResult>('/api/login', {
  username: 'admin',
  password: '123456'
})

// 获取验证码不需要认证
const [err, captcha] = await http.noAuth().get<CaptchaResult>('/api/captcha')
```

### encrypt - 启用加密

用于传输敏感数据：

```typescript
import { http } from '@/composables/useHttp'

// 敏感数据加密传输
const sensitiveData = {
  password: '123456',
  idCard: '110101199001011234',
  bankCard: '6222021234567890123'
}

const [err, result] = await http.encrypt().post('/api/sensitive', sensitiveData)
```

### noRepeatSubmit - 禁用防重复提交

用于允许快速重复提交的接口：

```typescript
import { http } from '@/composables/useHttp'

// 心跳接口允许快速重复调用
const [err, result] = await http.noRepeatSubmit().post('/api/heartbeat', {})

// 实时搜索允许快速重复调用
const [err, data] = await http.noRepeatSubmit().get('/api/search', { keyword })
```

### noTenant - 禁用租户信息

用于不需要租户隔离的接口：

```typescript
import { http } from '@/composables/useHttp'

// 获取系统配置（不区分租户）
const [err, config] = await http.noTenant().get('/api/system/config')
```

### noMsgError - 禁用错误提示

用于业务层自定义错误处理：

```typescript
import { http } from '@/composables/useHttp'

// 禁用自动错误提示，自行处理错误
const [err, data] = await http.noMsgError().get('/api/check-status')

if (err) {
  // 自定义错误处理逻辑
  if (err.message.includes('404')) {
    console.log('资源不存在，进行其他操作')
  } else {
    ElMessage.error('自定义错误消息')
  }
}
```

### timeout - 设置超时时间

用于需要自定义超时的接口：

```typescript
import { http } from '@/composables/useHttp'

// 文件上传设置较长超时
const [err, result] = await http.timeout(120000).post('/api/upload', formData)

// 快速接口设置较短超时
const [err, data] = await http.timeout(5000).get('/api/ping')
```

### config - 通用配置

用于设置任意 Axios 配置：

```typescript
import { http } from '@/composables/useHttp'

// 自定义配置
const [err, data] = await http.config({
  timeout: 30000,
  headers: {
    'Custom-Header': 'value',
    'Another-Header': 'another-value'
  },
  responseType: 'blob'
}).get('/api/export')
```

### 链式调用组合

多个链式方法可以组合使用：

```typescript
import { http } from '@/composables/useHttp'

// 组合多个配置
const [err, result] = await http
  .noAuth()           // 禁用认证
  .encrypt()          // 启用加密
  .noRepeatSubmit()   // 禁用防重复提交
  .timeout(30000)     // 设置超时
  .post('/api/register', userData)

// 另一个组合示例
const [err, data] = await http
  .noTenant()
  .noMsgError()
  .timeout(5000)
  .get('/api/health-check')
```

## 🔒 安全功能

### 认证管理

系统自动处理认证 Token：

```typescript
// 请求拦截器自动添加认证头
if (config.headers?.auth !== false) {
  Object.assign(config.headers, useToken().getAuthHeaders())
}
```

认证头格式：
```typescript
{
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### 401 未授权处理

当收到 401 状态码时，系统会显示重新登录对话框：

```typescript
// 响应拦截器处理 401
if (code === 401) {
  // 显示确认对话框
  const [err] = await showConfirm(
    '登录状态已过期，您可以继续留在该页面，或者重新登录',
    '系统提示',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )

  if (!err) {
    // 用户点击重新登录
    await userStore.logoutUser()
    resetRouter()
    router.replace({
      path: '/login',
      query: { redirect: encodeURIComponent(router.currentRoute.value.fullPath) }
    })
  }
}
```

### 数据加密

系统支持 AES + RSA 混合加密：

```typescript
// 启用加密的请求
const [err, result] = await http.encrypt().post('/api/sensitive', {
  password: '123456',
  idCard: '110101199001011234'
})
```

加密流程：
1. 生成随机 AES 密钥
2. 使用 RSA 公钥加密 AES 密钥
3. 使用 AES 加密请求数据
4. 将加密后的 AES 密钥放入请求头 `encrypt-key`
5. 服务器使用 RSA 私钥解密 AES 密钥
6. 使用 AES 密钥解密请求数据

### 防重复提交

系统自动阻止 5 秒内的重复 POST/PUT 请求：

```typescript
// 防重复提交逻辑
if (config.headers?.repeatSubmit !== false &&
    (config.method === 'post' || config.method === 'put')) {
  const requestObj = {
    url: config.url,
    data: JSON.stringify(config.data),
    time: new Date().getTime()
  }

  const cache = sessionCache.getJSON('repeatSubmitCache')
  if (cache) {
    const interval = 5000 // 5秒内视为重复提交
    if (cache.data === requestObj.data &&
        requestObj.time - cache.time < interval &&
        cache.url === requestObj.url) {
      return Promise.reject(new Error('数据正在处理，请勿重复提交'))
    }
  }

  sessionCache.setJSON('repeatSubmitCache', requestObj)
}
```

## 🌐 国际化支持

系统自动添加语言请求头：

```typescript
// 请求拦截器添加语言头
config.headers['Content-Language'] = getLanguage()

// 可能的值
// 'zh-CN' - 简体中文
// 'en-US' - 英语
// 'zh-TW' - 繁体中文
```

## 🏢 多租户支持

系统自动处理租户 ID：

```typescript
// 请求拦截器添加租户头
if (config.headers?.tenant !== false) {
  const tenantId = getTenantId()
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId
  }
}
```

租户 ID 获取优先级：
1. URL 查询参数 `?tenantId=xxx`
2. redirect 参数中的 tenantId
3. 本地缓存中的 tenantId
4. 默认值 `'000000'`

## 📁 文件操作

### 文件上传

```vue
<template>
  <el-upload
    action=""
    :auto-upload="false"
    :on-change="handleFileChange"
    :file-list="fileList"
  >
    <el-button type="primary">选择文件</el-button>
  </el-upload>
  <el-button @click="handleUpload" :loading="uploading">上传</el-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'
import type { UploadFile } from 'element-plus'

interface UploadResult {
  url: string
  fileName: string
}

const fileList = ref<UploadFile[]>([])
const uploading = ref(false)

const handleFileChange = (file: UploadFile) => {
  fileList.value = [file]
}

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }

  const file = fileList.value[0].raw
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)
  formData.append('description', '文件描述')

  uploading.value = true

  const [err, result] = await http
    .timeout(120000)  // 上传超时设置为2分钟
    .post<UploadResult>('/api/upload', formData)

  uploading.value = false

  if (!err) {
    ElMessage.success('上传成功')
    console.log('文件URL:', result.url)
    fileList.value = []
  }
}
</script>
```

### 文件下载

```typescript
import { http } from '@/composables/useHttp'

// 下载文件
const downloadFile = async (fileName: string) => {
  const [err, blob] = await http.config({
    responseType: 'blob'
  }).get<Blob>('/api/download', { fileName })

  if (!err && blob) {
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// 导出 Excel
const exportExcel = async () => {
  const [err, blob] = await http.config({
    responseType: 'blob',
    timeout: 60000
  }).post<Blob>('/api/export/users', {
    ids: [1, 2, 3],
    format: 'xlsx'
  })

  if (!err && blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }
}
```

## 📱 在组件中使用

### 数据加载

```vue
<template>
  <div class="user-list">
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @current-change="loadUsers"
      @size-change="loadUsers"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

interface PageResult<T> {
  list: T[]
  total: number
}

const users = ref<User[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loadUsers = async () => {
  loading.value = true

  const [err, data] = await http.get<PageResult<User>>('/api/users', {
    page: pagination.page,
    size: pagination.size
  })

  loading.value = false

  if (!err) {
    users.value = data.list
    pagination.total = data.total
  }
}

const handleEdit = (user: User) => {
  console.log('编辑用户:', user)
}

const handleDelete = async (user: User) => {
  const [err] = await http.del(`/api/users/${user.id}`)
  if (!err) {
    ElMessage.success('删除成功')
    loadUsers()
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

### 表单提交

```vue
<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { http } from '@/composables/useHttp'

interface UserForm {
  id?: number
  username: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<UserForm>({
  username: '',
  email: '',
  phone: '',
  status: 'active'
})

const isEdit = computed(() => !!form.id)

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const open = (user?: UserForm) => {
  if (user) {
    Object.assign(form, user)
  } else {
    resetForm()
  }
  visible.value = true
}

const resetForm = () => {
  form.id = undefined
  form.username = ''
  form.email = ''
  form.phone = ''
  form.status = 'active'
  formRef.value?.resetFields()
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true

  let err
  if (isEdit.value) {
    [err] = await http.put(`/api/users/${form.id}`, form)
  } else {
    [err] = await http.post('/api/users', form)
  }

  submitting.value = false

  if (!err) {
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    visible.value = false
    resetForm()
    emit('success')
  }
}

defineExpose({ open })
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

// 使用自定义实例
const [err, data] = await customHttp.get('/custom-endpoint')
```

### 访问原始 Axios 实例

```typescript
import { http } from '@/composables/useHttp'

// 访问底层 axios 实例进行高级配置
http.axios.interceptors.request.use((config) => {
  // 自定义请求拦截器
  console.log('请求:', config.url)
  return config
})

http.axios.interceptors.response.use((response) => {
  // 自定义响应拦截器
  console.log('响应:', response.status)
  return response
})
```

## 🎯 API 封装最佳实践

### 统一 API 模块

```typescript
// api/user.ts
import { http } from '@/composables/useHttp'

export interface User {
  id: number
  username: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

export interface UserQuery {
  page?: number
  size?: number
  keyword?: string
  status?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface CreateUserDto {
  username: string
  email: string
  phone: string
  password: string
}

export interface UpdateUserDto {
  username?: string
  email?: string
  phone?: string
  status?: string
}

/**
 * 用户 API
 */
export const userApi = {
  /**
   * 获取用户列表
   */
  getList(params?: UserQuery) {
    return http.get<PageResult<User>>('/api/users', params)
  },

  /**
   * 获取用户详情
   */
  getDetail(id: number) {
    return http.get<User>(`/api/users/${id}`)
  },

  /**
   * 创建用户
   */
  create(data: CreateUserDto) {
    return http.post<User>('/api/users', data)
  },

  /**
   * 更新用户
   */
  update(id: number, data: UpdateUserDto) {
    return http.put<User>(`/api/users/${id}`, data)
  },

  /**
   * 删除用户
   */
  delete(id: number) {
    return http.del<void>(`/api/users/${id}`)
  },

  /**
   * 批量删除用户
   */
  batchDelete(ids: number[]) {
    return http.del<void>('/api/users/batch', { ids })
  },

  /**
   * 修改用户状态
   */
  updateStatus(id: number, status: string) {
    return http.put<void>(`/api/users/${id}/status`, { status })
  },

  /**
   * 重置密码（需要加密）
   */
  resetPassword(id: number, password: string) {
    return http.encrypt().put<void>(`/api/users/${id}/password`, { password })
  },

  /**
   * 导出用户列表
   */
  export(params?: UserQuery) {
    return http.config({ responseType: 'blob' }).get<Blob>('/api/users/export', params)
  }
}
```

### 使用 API 模块

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { userApi, type User, type UserQuery } from '@/api/user'

const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)

const query: UserQuery = {
  page: 1,
  size: 10
}

const loadUsers = async () => {
  loading.value = true

  const [err, data] = await userApi.getList(query)

  loading.value = false

  if (!err) {
    users.value = data.list
    total.value = data.total
  }
}

const deleteUser = async (id: number) => {
  const [err] = await userApi.delete(id)
  if (!err) {
    ElMessage.success('删除成功')
    loadUsers()
  }
}

const exportUsers = async () => {
  const [err, blob] = await userApi.export(query)
  if (!err && blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

## 📚 API 参考

### useHttp 函数

```typescript
function useHttp(initialConfig?: AxiosRequestConfig): HttpInstance
```

### HttpInstance 接口

```typescript
interface HttpInstance {
  /**
   * 发送 GET 请求
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Result<T>

  /**
   * 发送 POST 请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Result<T>

  /**
   * 发送 PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Result<T>

  /**
   * 发送 DELETE 请求
   */
  del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Result<T>

  /**
   * 发送自定义请求
   */
  request<T = any>(config: AxiosRequestConfig): Result<T>

  /**
   * 底层 Axios 实例
   */
  axios: AxiosInstance

  // 链式调用方法
  config(cfg: AxiosRequestConfig): HttpInstance
  noAuth(): HttpInstance
  encrypt(): HttpInstance
  noRepeatSubmit(): HttpInstance
  noTenant(): HttpInstance
  noMsgError(): HttpInstance
  timeout(ms: number): HttpInstance
}
```

### Result 类型

```typescript
type Result<T> = Promise<[Error, null] | [null, T]>
```

### 请求配置选项

```typescript
interface RequestConfig extends AxiosRequestConfig {
  headers?: {
    /**
     * 是否需要认证，默认 true
     */
    auth?: boolean

    /**
     * 是否需要防重复提交，默认 true
     */
    repeatSubmit?: boolean

    /**
     * 是否启用加密，设为 'true' 启用
     */
    isEncrypt?: string

    /**
     * 是否需要租户信息，默认 true
     */
    tenant?: boolean
  }

  /**
   * 是否禁用错误提示
   */
  noMsgError?: boolean
}
```

### 常量定义

```typescript
/**
 * HTTP 状态码
 */
const HttpCode = {
  SUCCESS: 200,           // 成功
  UNAUTHORIZED: 401,      // 未授权
  INTERNAL_SERVER_ERROR: 500,  // 服务器错误
  WARN: 601              // 警告
} as const

/**
 * 错误消息
 */
const ErrorMsg = {
  NETWORK: '接口连接异常',
  TIMEOUT: '接口请求超时',
  REPEAT_SUBMIT: '数据正在处理，请勿重复提交',
  DECRYPT_FAILED: '响应数据解密失败',
  SESSION_EXPIRED: '无效的会话，或者会话已过期，请重新登录。',
  UNKNOWN: '网络错误'
} as const
```

## 🎯 最佳实践

### 1. 使用类型安全的 API

```typescript
// ✅ 推荐：使用泛型指定返回类型
const [err, users] = await http.get<User[]>('/api/users')
if (!err) {
  // users 具有完整的类型信息
  users.forEach(user => console.log(user.name))
}

// ❌ 不推荐：不使用泛型
const [err, data] = await http.get('/api/users')
// data 是 any 类型，没有类型检查
```

### 2. 统一错误处理

```typescript
// 创建统一的错误处理函数
const handleApiError = (err: Error, defaultMsg = '操作失败') => {
  const message = err.message

  if (message.includes('401') || message.includes('会话已过期')) {
    // 跳转登录（useHttp 已自动处理）
    return
  }

  if (message.includes('403')) {
    ElMessage.error('权限不足')
    return
  }

  if (message.includes('Network Error')) {
    ElMessage.error('网络连接失败，请检查网络')
    return
  }

  ElMessage.error(defaultMsg)
}

// 使用
const [err, data] = await http.noMsgError().get('/api/users')
if (err) {
  handleApiError(err, '加载用户失败')
}
```

### 3. 请求取消（AbortController）

```typescript
import { ref, onUnmounted } from 'vue'
import { http } from '@/composables/useHttp'

const controller = ref<AbortController | null>(null)

const loadData = async () => {
  // 取消之前的请求
  controller.value?.abort()

  // 创建新的 AbortController
  controller.value = new AbortController()

  const [err, data] = await http.config({
    signal: controller.value.signal
  }).get('/api/data')

  if (!err) {
    console.log('数据:', data)
  }
}

// 组件卸载时取消请求
onUnmounted(() => {
  controller.value?.abort()
})
```

### 4. 并发请求

```typescript
import { http } from '@/composables/useHttp'

// 并发请求多个接口
const loadDashboard = async () => {
  const [usersResult, ordersResult, statsResult] = await Promise.all([
    http.get<User[]>('/api/users'),
    http.get<Order[]>('/api/orders'),
    http.get<Stats>('/api/stats')
  ])

  const [usersErr, users] = usersResult
  const [ordersErr, orders] = ordersResult
  const [statsErr, stats] = statsResult

  if (!usersErr) console.log('用户:', users)
  if (!ordersErr) console.log('订单:', orders)
  if (!statsErr) console.log('统计:', stats)
}
```

### 5. 请求重试

```typescript
import { http } from '@/composables/useHttp'

// 带重试的请求
const fetchWithRetry = async <T>(
  fetcher: () => Result<T>,
  maxRetries = 3,
  delay = 1000
): Result<T> => {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    const [err, data] = await fetcher()

    if (!err) {
      return [null, data]
    }

    lastError = err

    // 如果是认证错误，不重试
    if (err.message.includes('401')) {
      break
    }

    // 等待后重试
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  return [lastError!, null]
}

// 使用
const [err, data] = await fetchWithRetry(() =>
  http.get<User[]>('/api/users')
)
```

## ❓ 常见问题

### 1. 如何处理登录接口

**问题**: 登录接口不需要认证，如何发送请求？

**解决方案**: 使用 `noAuth()` 链式方法

```typescript
const [err, result] = await http.noAuth().post<LoginResult>('/api/login', {
  username: 'admin',
  password: '123456'
})
```

### 2. 如何上传文件

**问题**: 上传文件时 Content-Type 如何设置？

**解决方案**: 使用 FormData，系统会自动处理 Content-Type

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('description', '文件描述')

// Content-Type 会自动设置为 multipart/form-data
const [err, result] = await http.post('/api/upload', formData)
```

### 3. 如何下载文件

**问题**: 如何下载二进制文件？

**解决方案**: 设置 responseType 为 blob

```typescript
const [err, blob] = await http.config({
  responseType: 'blob'
}).get<Blob>('/api/download', { fileName: 'test.pdf' })

if (!err && blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'test.pdf'
  a.click()
  URL.revokeObjectURL(url)
}
```

### 4. 如何禁用错误提示

**问题**: 某些接口需要自定义错误处理，如何禁用自动错误提示？

**解决方案**: 使用 `noMsgError()` 链式方法

```typescript
const [err, data] = await http.noMsgError().get('/api/check')

if (err) {
  // 自定义错误处理
  if (err.message.includes('404')) {
    // 特殊处理
  } else {
    ElMessage.error('自定义错误消息')
  }
}
```

### 5. 如何处理防重复提交

**问题**: 某些接口需要快速重复调用，如何禁用防重复提交？

**解决方案**: 使用 `noRepeatSubmit()` 链式方法

```typescript
// 实时搜索允许快速重复调用
const [err, data] = await http.noRepeatSubmit().get('/api/search', { keyword })
```

### 6. 如何设置请求超时

**问题**: 某些接口需要更长的超时时间，如何设置？

**解决方案**: 使用 `timeout()` 链式方法

```typescript
// 文件上传设置 2 分钟超时
const [err, result] = await http.timeout(120000).post('/api/upload', formData)
```

## ⚠️ 注意事项

1. **GET 请求参数**: GET 请求的 params 会自动转换为 URL 查询字符串

2. **FormData**: 上传文件时使用 FormData，Content-Type 会自动设置

3. **错误处理**: 所有网络错误都会自动显示用户友好的提示信息（除非使用 noMsgError）

4. **重复请求**: 系统会自动阻止 5 秒内的重复 POST/PUT 请求

5. **认证状态**: 401 状态会自动触发重新登录流程

6. **租户隔离**: 请求会自动携带当前租户 ID

7. **加密功能**: 需要后端配合实现 RSA/AES 解密

8. **请求 ID**: 每个请求会自动生成唯一的请求 ID，用于日志追踪
