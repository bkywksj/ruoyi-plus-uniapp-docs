# useHttp HTTP 请求管理

## 介绍

`useHttp` 是 RuoYi-Plus-UniApp 提供的 HTTP 请求管理组合式函数(Composable),封装了 UniApp 的网络请求 API,提供了统一的请求拦截、响应处理、错误处理等功能。它是整个应用网络通信的核心模块。

**核心特性:**

- **统一错误处理** - 自动处理网络错误、超时、未授权等常见错误,提供友好的错误提示
- **自动认证管理** - 自动在请求头中添加 Token 认证信息,支持灵活的认证控制
- **多租户支持** - 自动添加租户 ID,支持 SaaS 多租户架构
- **防重复提交** - POST/PUT 请求自动防重复提交,避免用户误操作
- **请求加密** - 支持 RSA + AES 混合加密,保护敏感数据安全
- **响应解密** - 自动解密加密响应,对业务层透明
- **链式调用** - 支持链式配置,代码更简洁优雅
- **TypeScript 支持** - 完整的类型定义,提供类型安全和智能提示
- **文件操作** - 支持文件上传和下载,统一的错误处理
- **国际化支持** - 自动添加语言标识,支持后端国际化响应
- **请求追踪** - 自动生成唯一请求 ID,便于问题排查
- **应用初始化** - 自动等待应用初始化完成,确保租户信息已设置

系统提供了默认的 `http` 实例,可直接使用。也可以通过 `useHttp()` 创建自定义实例,满足不同场景需求。

## 基本用法

### GET 请求

最简单的 GET 请求示例:

```vue
<template>
  <view class="user-list">
    <view v-if="loading" class="loading">加载中...</view>

    <view v-else-if="error" class="error">
      {{ error }}
    </view>

    <view v-else class="list">
      <view v-for="user in users" :key="user.id" class="user-item">
        <text class="name">{{ user.userName }}</text>
        <text class="dept">{{ user.deptName }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  id: string
  userName: string
  deptName: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')

const loadUsers = async () => {
  loading.value = true
  error.value = ''

  const [err, data] = await http.get<User[]>('/system/user/list')

  loading.value = false

  if (err) {
    error.value = err.message
    return
  }

  users.value = data
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.user-list {
  padding: 32rpx;
}

.loading,
.error {
  text-align: center;
  padding: 64rpx;
  color: #999;
}

.error {
  color: #f56c6c;
}

.user-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 8rpx;

  .name {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    margin-bottom: 8rpx;
  }

  .dept {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}
</style>
```

**使用说明:**
- `http.get()` 返回一个 `[error, data]` 元组
- 如果请求成功,`error` 为 `null`,`data` 包含响应数据
- 如果请求失败,`error` 包含错误对象,`data` 为 `null`
- 自动添加认证 Token 和租户 ID
- 错误会自动显示 Toast 提示

### POST 请求

POST 请求用于提交数据:

```vue
<template>
  <view class="create-user">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-form-item label="用户名" prop="userName">
        <wd-input v-model="formData.userName" placeholder="请输入用户名" />
      </wd-form-item>

      <wd-form-item label="邮箱" prop="email">
        <wd-input v-model="formData.email" placeholder="请输入邮箱" />
      </wd-form-item>

      <wd-form-item label="手机号" prop="phone">
        <wd-input v-model="formData.phone" placeholder="请输入手机号" />
      </wd-form-item>

      <wd-button type="primary" block :loading="submitting" @click="handleSubmit">
        提交
      </wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { http } from '@/composables/useHttp'

interface UserForm {
  userName: string
  email: string
  phone: string
}

const formRef = ref()
const submitting = ref(false)

const formData = reactive<UserForm>({
  userName: '',
  email: '',
  phone: ''
})

const rules = {
  userName: [{ required: true, message: '请输入用户名' }],
  email: [{ required: true, message: '请输入邮箱' }],
  phone: [{ required: true, message: '请输入手机号' }]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  submitting.value = true

  const [err, data] = await http.post('/system/user', formData)

  submitting.value = false

  if (err) {
    // 错误已自动显示 Toast
    return
  }

  uni.showToast({
    title: '创建成功',
    icon: 'success'
  })

  // 返回上一页
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.create-user {
  padding: 32rpx;
}
</style>
```

**技术实现:**
- POST 请求自动添加防重复提交保护(1秒内相同请求只允许一次)
- 自动设置 `Content-Type: application/json`
- 请求体会自动 JSON 序列化
- 失败时自动显示错误提示,无需手动处理

### PUT 请求

PUT 请求用于更新数据:

```vue
<template>
  <view class="edit-user">
    <wd-form ref="formRef" :model="formData">
      <wd-form-item label="用户名">
        <wd-input v-model="formData.userName" placeholder="请输入用户名" />
      </wd-form-item>

      <wd-form-item label="状态">
        <wd-select v-model="formData.status" :options="statusOptions" />
      </wd-form-item>

      <wd-button type="primary" block :loading="updating" @click="handleUpdate">
        更新
      </wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { http } from '@/composables/useHttp'

const props = defineProps<{
  userId: string
}>()

const formRef = ref()
const updating = ref(false)
const loading = ref(false)

const formData = reactive({
  userName: '',
  status: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const loadUser = async () => {
  loading.value = true

  const [err, data] = await http.get(`/system/user/${props.userId}`)

  loading.value = false

  if (err) return

  Object.assign(formData, data)
}

const handleUpdate = async () => {
  updating.value = true

  const [err] = await http.put(`/system/user`, formData)

  updating.value = false

  if (err) return

  uni.showToast({
    title: '更新成功',
    icon: 'success'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

onMounted(() => {
  loadUser()
})
</script>

<style lang="scss" scoped>
.edit-user {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- PUT 请求同样支持防重复提交
- 可以返回 `void` 类型,只检查是否成功
- 自动处理认证和租户信息

### DELETE 请求

DELETE 请求用于删除数据:

```vue
<template>
  <view class="user-manage">
    <view v-for="user in users" :key="user.id" class="user-item">
      <view class="info">
        <text class="name">{{ user.userName }}</text>
      </view>

      <wd-button type="danger" size="small" @click="handleDelete(user.id)">
        删除
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  id: string
  userName: string
}

const users = ref<User[]>([])

const handleDelete = async (userId: string) => {
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '提示',
      content: '确认删除该用户?',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })

  if (!confirmed) return

  const [err] = await http.del(`/system/user/${userId}`)

  if (err) return

  uni.showToast({
    title: '删除成功',
    icon: 'success'
  })

  // 刷新列表
  users.value = users.value.filter(u => u.id !== userId)
}
</script>

<style lang="scss" scoped>
.user-manage {
  padding: 32rpx;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 8rpx;

  .info {
    flex: 1;
  }
}
</style>
```

**技术实现:**
- DELETE 请求参数会拼接到 URL 的查询字符串
- 支持路径参数和查询参数两种方式
- 自动显示操作结果

### 文件上传

上传文件到服务器:

```vue
<template>
  <view class="upload-demo">
    <wd-button @click="chooseImage">选择图片</wd-button>

    <view v-if="uploading" class="uploading">
      上传中...
    </view>

    <image v-if="imageUrl" :src="imageUrl" mode="aspectFit" class="preview" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface UploadResult {
  url: string
  fileName: string
}

const uploading = ref(false)
const imageUrl = ref('')

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadImage(res.tempFilePaths[0])
    }
  })
}

const uploadImage = async (filePath: string) => {
  uploading.value = true

  const [err, data] = await http.upload<UploadResult>({
    url: '/system/oss/upload',
    filePath,
    name: 'file',
    formData: {
      type: 'avatar'
    }
  })

  uploading.value = false

  if (err) {
    console.error('上传失败:', err)
    return
  }

  imageUrl.value = data.url

  uni.showToast({
    title: '上传成功',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.upload-demo {
  padding: 32rpx;
}

.uploading {
  margin-top: 32rpx;
  text-align: center;
  color: #999;
}

.preview {
  width: 100%;
  height: 400rpx;
  margin-top: 32rpx;
  border-radius: 8rpx;
}
</style>
```

**使用说明:**
- `upload()` 方法接受 UniApp 的 `uploadFile` 配置
- 自动添加认证 Token 和语言标识
- 支持 `formData` 传递额外参数
- 返回解析后的 JSON 响应数据

### 文件下载

从服务器下载文件:

```vue
<template>
  <view class="download-demo">
    <wd-button @click="downloadFile" :loading="downloading">
      下载文件
    </wd-button>

    <view v-if="downloadPath" class="success">
      文件已保存: {{ downloadPath }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

const downloading = ref(false)
const downloadPath = ref('')

const downloadFile = async () => {
  downloading.value = true

  const [err, res] = await http.download({
    url: '/system/oss/download/file.pdf'
  })

  downloading.value = false

  if (err) {
    console.error('下载失败:', err)
    return
  }

  downloadPath.value = res.tempFilePath

  uni.showToast({
    title: '下载成功',
    icon: 'success'
  })

  // 保存到相册或打开文件
  // uni.saveFile({ tempFilePath: res.tempFilePath })
}
</script>

<style lang="scss" scoped>
.download-demo {
  padding: 32rpx;
}

.success {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f0f9ff;
  border-radius: 8rpx;
  color: #1890ff;
}
</style>
```

**技术实现:**
- `download()` 方法返回 UniApp 的下载响应
- 包含 `tempFilePath` 临时文件路径
- 需要使用 `uni.saveFile()` 永久保存文件

## 高级用法

### 链式调用 - 禁用认证

某些公开接口不需要认证:

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface CaptchaVo {
  code: string
  img: string
  uuid: string
}

const captcha = ref<CaptchaVo>()

const getCaptcha = async () => {
  // 使用链式调用禁用认证
  const [err, data] = await http.noAuth().get<CaptchaVo>('/auth/imgCode')

  if (err) return

  captcha.value = data
}
</script>
```

**使用说明:**
- `noAuth()` 禁用自动添加 Token
- 适用于登录、注册、验证码等公开接口
- 仍会添加租户 ID(如果已设置)

### 链式调用 - 启用加密

敏感数据请求加密:

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface LoginForm {
  username: string
  password: string
  code: string
  uuid: string
}

interface LoginResult {
  token: string
}

const loginForm: LoginForm = {
  username: 'admin',
  password: 'admin123',
  code: '1234',
  uuid: 'xxx-xxx'
}

const login = async () => {
  // 禁用认证 + 启用加密 + 跳过初始化等待
  const [err, data] = await http
    .noAuth()
    .encrypt()
    .skipWait()
    .post<LoginResult>('/auth/login', loginForm)

  if (err) return

  // 保存 token
  console.log('登录成功:', data.token)
}
</script>
```

**技术实现:**
- `encrypt()` 启用 RSA + AES 混合加密
- 请求体使用 AES 加密
- AES 密钥使用 RSA 公钥加密后放在请求头
- 响应自动解密,对业务层透明

### 链式调用 - 禁用防重复提交

某些场景需要快速重复请求:

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const sendMessage = async (content: string) => {
  // 禁用防重复提交
  const [err] = await http
    .noRepeatSubmit()
    .post('/chat/message', { content })

  if (err) return

  console.log('消息发送成功')
}
</script>
```

**使用说明:**
- 默认 POST/PUT 请求有 1 秒的防重复提交保护
- `noRepeatSubmit()` 可以禁用此保护
- 适用于聊天消息、实时更新等场景

### 链式调用 - 设置超时时间

长时间操作需要更长的超时:

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const exportData = async () => {
  // 设置 60 秒超时
  const [err, data] = await http
    .timeout(60000)
    .post<Blob>('/system/export', { type: 'all' })

  if (err) return

  console.log('导出成功')
}
</script>
```

**技术实现:**
- 默认超时时间为 50 秒
- `timeout(ms)` 可以自定义超时时间
- 超时会触发错误处理,显示"请求超时"提示

### 链式调用 - 禁用错误提示

业务层自定义错误处理:

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

const errorMsg = ref('')

const checkUsername = async (username: string) => {
  // 禁用自动错误提示
  const [err] = await http
    .noMsgError()
    .get('/system/user/check', { username })

  if (err) {
    // 自定义错误处理
    errorMsg.value = '该用户名已存在'
    return false
  }

  errorMsg.value = ''
  return true
}
</script>
```

**使用说明:**
- `noMsgError()` 禁用自动 Toast 错误提示
- 错误仍会返回在 `err` 中
- 适用于表单验证等需要自定义错误显示的场景

### 链式调用 - 组合多个配置

可以同时使用多个链式方法:

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface RegisterForm {
  username: string
  password: string
  email: string
}

const register = async (form: RegisterForm) => {
  // 组合多个配置
  const [err, data] = await http
    .noAuth()           // 禁用认证
    .encrypt()          // 启用加密
    .noRepeatSubmit()   // 禁用防重复提交
    .skipWait()         // 跳过初始化等待
    .timeout(30000)     // 30秒超时
    .post('/auth/register', form)

  if (err) return

  console.log('注册成功:', data)
}
</script>
```

**技术实现:**
- 链式调用可以任意组合
- 顺序无关,配置会合并
- 每次请求后配置自动重置

### 通用配置方法

使用 `config()` 方法一次性配置:

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const sendSms = async (phone: string) => {
  const [err] = await http.config({
    header: {
      auth: false,        // 禁用认证
      repeatSubmit: false // 禁用防重复提交
    },
    timeout: 20000        // 20秒超时
  }).post('/sms/send', { phone })

  if (err) return

  console.log('短信发送成功')
}
</script>
```

**使用说明:**
- `config()` 可以一次性设置多个配置项
- 等价于多个链式调用
- 更适合配置项较多的场景

### 创建自定义实例

创建带有默认配置的 HTTP 实例:

```vue
<script lang="ts" setup>
import { useHttp } from '@/composables/useHttp'

// 创建公开 API 实例(不需要认证)
const publicHttp = useHttp({
  header: {
    auth: false,
    tenant: false
  }
})

// 创建管理员 API 实例(需要特殊头部)
const adminHttp = useHttp({
  header: {
    'X-Admin-Token': 'admin-secret'
  },
  timeout: 60000
})

// 使用自定义实例
const getPublicInfo = async () => {
  const [err, data] = await publicHttp.get('/public/info')
  // ...
}

const getAdminData = async () => {
  const [err, data] = await adminHttp.get('/admin/dashboard')
  // ...
}
</script>
```

**技术实现:**
- `useHttp(config)` 创建新的 HTTP 实例
- 每个实例有独立的默认配置
- 实例配置会与请求配置合并

## 请求配置

### CustomRequestOptions

完整的请求配置选项:

```typescript
interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  /** 查询参数(会拼接到 URL) */
  query?: Record<string, any>

  /** 查询参数(同 query,兼容性) */
  params?: Record<string, any>

  /** 自定义请求头 */
  header?: CustomHeaders

  /** 是否跳过等待应用初始化 */
  skipWait?: boolean

  /** 初始化超时时间(毫秒),默认 10000 */
  initTimeout?: number

  /** 请求超时时间(毫秒),默认 50000 */
  timeout?: number

  /** 请求数据 */
  data?: any
}
```

### CustomHeaders

自定义请求头配置:

```typescript
interface CustomHeaders {
  /** 是否需要认证,默认 true */
  auth?: boolean

  /** 是否需要租户ID,默认 true */
  tenant?: boolean

  /** 是否防止重复提交,默认 true */
  repeatSubmit?: boolean

  /** 是否加密请求数据 */
  isEncrypt?: boolean

  /** 其他自定义头部 */
  [key: string]: any
}
```

**配置说明:**

1. **auth** - 控制是否添加认证 Token
   - `true`(默认): 自动添加 `Authorization` 头
   - `false`: 不添加认证信息,用于公开接口

2. **tenant** - 控制是否添加租户 ID
   - `true`(默认): 自动添加 `X-Tenant-Id` 头
   - `false`: 不添加租户信息,用于非租户接口

3. **repeatSubmit** - 控制防重复提交
   - `true`(默认): POST/PUT 请求 1 秒内相同请求只允许一次
   - `false`: 不限制重复提交

4. **isEncrypt** - 控制请求加密
   - `true`: 启用 RSA + AES 混合加密
   - `false`(默认): 不加密

5. **skipWait** - 控制是否等待初始化
   - `true`: 立即发送请求
   - `false`(默认): 等待应用初始化完成(租户 ID 设置完成)

## API

### useHttp 函数

```typescript
function useHttp(defaultConfig?: CustomRequestOptions): HttpInstance
```

**参数:**
- `defaultConfig` - 默认配置,应用于该实例的所有请求

**返回值:**
- 返回 HTTP 实例对象,包含以下方法

### get 方法

```typescript
function get<T>(
  url: string,
  params?: any,
  config?: CustomRequestOptions
): Result<T>
```

**参数:**
- `url` - 请求 URL
- `params` - 查询参数,会拼接到 URL
- `config` - 请求配置

**返回值:**
- 返回 `Promise<[Error | null, T | null]>` 元组

**示例:**

```typescript
// 基本用法
const [err, users] = await http.get<User[]>('/api/users')

// 带查询参数
const [err, users] = await http.get<User[]>('/api/users', {
  page: 1,
  size: 10
})

// 带配置
const [err, users] = await http.get<User[]>('/api/users', null, {
  timeout: 20000
})
```

### post 方法

```typescript
function post<T>(
  url: string,
  data?: any,
  config?: CustomRequestOptions
): Result<T>
```

**参数:**
- `url` - 请求 URL
- `data` - 请求体数据
- `config` - 请求配置

**返回值:**
- 返回 `Promise<[Error | null, T | null]>` 元组

**示例:**

```typescript
// 基本用法
const [err, user] = await http.post<User>('/api/users', {
  userName: 'admin',
  email: 'admin@example.com'
})

// 带配置
const [err, result] = await http.post('/api/login', loginForm, {
  header: { isEncrypt: true }
})
```

### put 方法

```typescript
function put<T>(
  url: string,
  data?: any,
  config?: CustomRequestOptions
): Result<T>
```

**参数:**
- `url` - 请求 URL
- `data` - 请求体数据
- `config` - 请求配置

**返回值:**
- 返回 `Promise<[Error | null, T | null]>` 元组

**示例:**

```typescript
// 更新用户
const [err] = await http.put<void>('/api/users/123', {
  userName: 'newName'
})

if (!err) {
  console.log('更新成功')
}
```

### del 方法

```typescript
function del<T>(
  url: string,
  params?: any,
  config?: CustomRequestOptions
): Result<T>
```

**参数:**
- `url` - 请求 URL
- `params` - 查询参数
- `config` - 请求配置

**返回值:**
- 返回 `Promise<[Error | null, T | null]>` 元组

**示例:**

```typescript
// 删除用户
const [err] = await http.del<void>('/api/users/123')

// 批量删除
const [err] = await http.del<void>('/api/users', {
  ids: '1,2,3'
})
```

### upload 方法

```typescript
function upload<T>(
  uploadConfig: UniApp.UploadFileOption & CustomRequestOptions
): Result<T>
```

**参数:**
- `uploadConfig` - 上传配置,继承 UniApp 的 UploadFileOption

**返回值:**
- 返回 `Promise<[Error | null, T | null]>` 元组

**示例:**

```typescript
const [err, result] = await http.upload<UploadResult>({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: {
    type: 'image',
    category: 'avatar'
  }
})
```

### download 方法

```typescript
function download(
  downloadConfig: UniApp.DownloadFileOption & CustomRequestOptions
): Result<UniApp.DownloadSuccessData>
```

**参数:**
- `downloadConfig` - 下载配置,继承 UniApp 的 DownloadFileOption

**返回值:**
- 返回 `Promise<[Error | null, DownloadSuccessData | null]>` 元组

**示例:**

```typescript
const [err, res] = await http.download({
  url: '/api/download/report.pdf'
})

if (!err) {
  console.log('文件路径:', res.tempFilePath)
}
```

### 链式调用方法

所有链式方法返回 HTTP 实例,支持继续链式调用:

#### noAuth

禁用认证:

```typescript
function noAuth(): HttpInstance
```

**示例:**

```typescript
const [err, data] = await http.noAuth().get('/public/info')
```

#### encrypt

启用加密:

```typescript
function encrypt(): HttpInstance
```

**示例:**

```typescript
const [err, token] = await http.encrypt().post('/auth/login', form)
```

#### noRepeatSubmit

禁用防重复提交:

```typescript
function noRepeatSubmit(): HttpInstance
```

**示例:**

```typescript
const [err] = await http.noRepeatSubmit().post('/chat/send', message)
```

#### noTenant

禁用租户信息:

```typescript
function noTenant(): HttpInstance
```

**示例:**

```typescript
const [err, data] = await http.noTenant().get('/system/config')
```

#### skipWait

跳过初始化等待:

```typescript
function skipWait(): HttpInstance
```

**示例:**

```typescript
const [err, captcha] = await http.skipWait().get('/auth/captcha')
```

#### noMsgError

禁用错误提示:

```typescript
function noMsgError(): HttpInstance
```

**示例:**

```typescript
const [err] = await http.noMsgError().get('/api/check')
if (err) {
  // 自定义错误处理
}
```

#### timeout

设置超时时间:

```typescript
function timeout(ms: number): HttpInstance
```

**示例:**

```typescript
const [err] = await http.timeout(60000).post('/export', data)
```

#### config

通用配置方法:

```typescript
function config(cfg: CustomRequestOptions): HttpInstance
```

**示例:**

```typescript
const [err, data] = await http.config({
  header: { auth: false },
  timeout: 20000
}).get('/api/data')
```

## 错误处理

### 错误类型

系统定义了以下错误类型:

```typescript
const ErrorMsg = {
  NETWORK: '网络连接失败，请检查网络',
  TIMEOUT: '请求超时，请稍后重试',
  REPEAT_SUBMIT: '数据正在处理，请勿重复提交',
  DECRYPT_FAILED: '响应数据解密失败',
  SESSION_EXPIRED: '未登录或登录已过期~',
  REQUEST_CANCELED: '请求已取消',
  INIT_TIMEOUT: '应用初始化超时，请重试',
  UNKNOWN: '网络错误',
} as const
```

### 错误处理流程

1. **网络错误** - 自动识别超时、网络断开等错误
2. **业务错误** - 根据后端返回的状态码处理
3. **自动提示** - 默认显示 Toast 错误提示
4. **异常抛出** - 错误会通过 `err` 返回,不会中断程序

### 自定义错误处理

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const handleRequest = async () => {
  const [err, data] = await http.noMsgError().get('/api/data')

  if (err) {
    // 根据错误类型自定义处理
    if (err.message.includes('超时')) {
      uni.showModal({
        title: '提示',
        content: '请求超时,是否重试?',
        success: (res) => {
          if (res.confirm) {
            handleRequest() // 重试
          }
        }
      })
      return
    }

    if (err.message.includes('网络')) {
      uni.showToast({
        title: '网络异常,请检查网络连接',
        icon: 'none'
      })
      return
    }

    // 其他错误
    console.error('请求失败:', err)
    return
  }

  // 处理成功数据
  console.log(data)
}
</script>
```

### 未授权处理

当返回 401 状态码时,系统会自动:

1. 调用 `useUserStore().logoutUser()` 清除用户信息
2. 跳转到登录页,并携带当前页面路径作为 `redirect` 参数
3. 显示"未登录或登录已过期"提示
4. 防止重复显示登录提示

```typescript
const handleUnauthorized = async () => {
  if (isReLogin.show) return // 防止重复

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

每个请求会自动添加以下请求头:

1. **Content-Type**: `application/json;charset=utf-8`
2. **Content-Language**: 当前语言(zh-CN/en-US)
3. **X-Request-Id**: 唯一请求 ID(格式: yyyyMMddHHmmssSSS)
4. **Authorization**: Bearer Token(需要认证时)
5. **X-Tenant-Id**: 租户 ID(多租户模式)

```typescript
const header: Record<string, any> = {
  'Content-Type': 'application/json;charset=utf-8',
  'Content-Language': getLanguage(),
  'X-Request-Id': generateRequestId(),
  ...config?.header,
}

// 认证处理
if (config?.header?.auth !== false) {
  Object.assign(header, useToken().getAuthHeaders())
}

// 租户处理
if (config?.header?.tenant !== false) {
  const tenantId = getTenantId()
  if (tenantId) {
    header['X-Tenant-Id'] = tenantId
  }
}
```

### URL 处理

自动处理 URL 的各种情况:

```typescript
// 1. 相对路径自动添加 baseUrl
'/api/users' → 'https://api.example.com/api/users'

// 2. 绝对路径不处理
'https://other.com/api' → 'https://other.com/api'

// 3. 查询参数自动拼接
url: '/api/users'
params: { page: 1, size: 10 }
→ '/api/users?page=1&size=10'

// 4. GET 请求 data 转为查询参数
http.get('/api/users', { status: 'active' })
→ '/api/users?status=active'
```

### 参数处理

支持多种参数传递方式:

```typescript
// 方式1: 使用 params
http.get('/api/users', null, {
  params: { page: 1 }
})

// 方式2: 使用 query
http.get('/api/users', null, {
  query: { page: 1 }
})

// 方式3: GET 直接传参数
http.get('/api/users', { page: 1 })

// 方式4: POST 传请求体
http.post('/api/users', {
  name: 'admin'
})
```

## 响应处理

### 响应数据结构

后端统一返回格式:

```typescript
interface R<T> {
  code: number      // 状态码: 200 成功, 401 未授权, 其他为错误
  msg: string       // 消息
  data: T           // 业务数据
}
```

### 自动解包

`useHttp` 会自动解包 `R<T>` 结构,直接返回 `data`:

```typescript
// 后端返回
{
  code: 200,
  msg: '操作成功',
  data: {
    id: '1',
    name: 'admin'
  }
}

// useHttp 自动解包后
const [err, user] = await http.get<User>('/api/user/1')
// user 就是 { id: '1', name: 'admin' }
```

### 响应解密

如果启用了加密,响应会自动解密:

```typescript
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
    throw new Error(ErrorMsg.DECRYPT_FAILED)
  }
}
```

**解密流程:**
1. 检查响应头是否包含加密密钥
2. 使用 RSA 私钥解密得到 AES 密钥
3. 使用 AES 密钥解密响应体
4. 解析 JSON 返回数据

### 二进制数据处理

下载文件等二进制数据直接返回原始响应:

```typescript
const isBinaryData = (contentType: string): boolean => {
  return (
    contentType.includes('application/octet-stream') ||
    contentType.includes('application/pdf') ||
    contentType.includes('image/') ||
    contentType.includes('video/') ||
    contentType.includes('audio/')
  )
}

// 二进制数据不解包
if (isBinaryData(contentType)) {
  return response as T
}
```

## 加密机制

### 加密流程

使用 RSA + AES 混合加密保护数据:

```
客户端                                服务端
  |                                     |
  | 1. 生成随机 AES 密钥                 |
  | 2. 使用 AES 加密请求数据             |
  | 3. 使用 RSA 公钥加密 AES 密钥        |
  | 4. 发送加密数据和加密密钥            |
  |------------------------------------>|
  |                                     | 5. 使用 RSA 私钥解密 AES 密钥
  |                                     | 6. 使用 AES 解密请求数据
  |                                     | 7. 处理业务逻辑
  |                                     | 8. 使用 AES 加密响应数据
  |<------------------------------------|
  | 9. 使用 AES 解密响应数据             |
  |                                     |
```

### 请求加密实现

```typescript
const encryptRequestData = (data: any, header: Record<string, any>) => {
  if (!SystemConfig.security?.apiEncrypt || !data) return data

  // 1. 生成 AES 密钥
  const aesKey = generateAesKey()

  // 2. 使用 RSA 加密 AES 密钥,放入请求头
  header[ENCRYPT_HEADER] = rsaEncrypt(encodeBase64(aesKey))

  // 3. 使用 AES 加密请求数据
  return typeof data === 'object'
    ? encryptWithAes(JSON.stringify(data), aesKey)
    : encryptWithAes(data, aesKey)
}
```

### 启用加密

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 方式1: 链式调用
const login = async (form: LoginForm) => {
  const [err, token] = await http
    .noAuth()
    .encrypt()
    .post<string>('/auth/login', form)
}

// 方式2: 配置参数
const login2 = async (form: LoginForm) => {
  const [err, token] = await http.post<string>('/auth/login', form, {
    header: {
      auth: false,
      isEncrypt: true
    }
  })
}
</script>
```

## 应用初始化

### 初始化等待

默认情况下,请求会等待应用初始化完成:

```typescript
const waitForAppInitialization = async (config?: CustomRequestOptions): Promise<void> => {
  // 如果配置了跳过等待,直接返回
  if (config?.skipWait) {
    return Promise.resolve()
  }

  // 如果请求不需要租户信息,也跳过等待
  if (config?.header?.tenant === false) {
    return Promise.resolve()
  }

  try {
    await waitForInit(config?.initTimeout || 10000)
  } catch (error) {
    throw new Error(ErrorMsg.INIT_TIMEOUT)
  }
}
```

**等待原因:**
- 确保租户 ID 已从存储中加载
- 确保应用配置已初始化完成
- 避免首次请求缺少租户信息

### 跳过等待

某些请求不需要等待初始化:

```typescript
// 登录请求
const [err, token] = await http
  .skipWait()
  .noAuth()
  .encrypt()
  .post('/auth/login', form)

// 获取验证码
const [err, captcha] = await http
  .skipWait()
  .noAuth()
  .get('/auth/captcha')
```

### 自定义超时

可以自定义初始化超时时间:

```typescript
const [err, data] = await http.get('/api/data', null, {
  initTimeout: 5000  // 5 秒超时
})
```

## 最佳实践

### 1. 使用 TypeScript 类型

定义清晰的接口类型:

```typescript
// types/api.ts
export interface User {
  id: string
  userName: string
  email: string
  status: string
}

export interface PageQuery {
  page: number
  size: number
  keyword?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// 使用时
const [err, result] = await http.get<PageResult<User>>('/api/users', {
  page: 1,
  size: 10
})

if (!err) {
  result.list.forEach(user => {
    console.log(user.userName) // 完整的类型提示
  })
}
```

### 2. 封装 API 模块

将 API 调用封装到独立模块:

```typescript
// api/user.ts
import { http } from '@/composables/useHttp'
import type { User, PageQuery, PageResult } from '@/types/api'

export const userApi = {
  // 获取用户列表
  list: (query: PageQuery) => {
    return http.get<PageResult<User>>('/system/user/list', query)
  },

  // 获取用户详情
  detail: (id: string) => {
    return http.get<User>(`/system/user/${id}`)
  },

  // 创建用户
  create: (data: Partial<User>) => {
    return http.post<User>('/system/user', data)
  },

  // 更新用户
  update: (id: string, data: Partial<User>) => {
    return http.put<void>(`/system/user/${id}`, data)
  },

  // 删除用户
  delete: (id: string) => {
    return http.del<void>(`/system/user/${id}`)
  },
}

// 组件中使用
import { userApi } from '@/api/user'

const loadUsers = async () => {
  const [err, result] = await userApi.list({ page: 1, size: 10 })
  if (!err) {
    console.log(result.list)
  }
}
```

### 3. 统一错误处理

创建错误处理工具函数:

```typescript
// utils/error.ts
export const handleApiError = (err: Error | null, callback?: () => void) => {
  if (!err) return false

  // 特殊错误处理
  if (err.message.includes('未登录')) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return true
  }

  if (err.message.includes('网络')) {
    uni.showModal({
      title: '网络错误',
      content: '请检查网络连接后重试',
      showCancel: false
    })
    return true
  }

  // 执行回调
  callback?.()
  return true
}

// 使用
const deleteUser = async (id: string) => {
  const [err] = await userApi.delete(id)

  if (handleApiError(err, () => {
    // 错误时的回调
    console.log('删除失败')
  })) {
    return
  }

  console.log('删除成功')
}
```

### 4. 请求去重

对于频繁触发的请求,添加去重逻辑:

```typescript
import { ref } from 'vue'

let searchTimer: number | null = null

const searchKeyword = ref('')
const searchResults = ref([])

const handleSearch = async () => {
  // 防抖
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(async () => {
    const [err, data] = await http.get('/api/search', {
      keyword: searchKeyword.value
    })

    if (!err) {
      searchResults.value = data
    }
  }, 500)
}
```

### 5. 请求取消

长时间请求支持取消:

```typescript
import { ref } from 'vue'

const requestTask = ref<UniApp.RequestTask | null>(null)

const loadData = () => {
  requestTask.value = uni.request({
    url: 'https://api.example.com/data',
    success: (res) => {
      console.log(res.data)
    }
  })
}

const cancelRequest = () => {
  if (requestTask.value) {
    requestTask.value.abort()
    requestTask.value = null
  }
}

// 页面卸载时取消请求
onUnmounted(() => {
  cancelRequest()
})
```

### 6. 重试机制

实现自动重试失败的请求:

```typescript
const requestWithRetry = async <T>(
  fn: () => Promise<[Error | null, T | null]>,
  maxRetries = 3,
  delay = 1000
): Promise<[Error | null, T | null]> => {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    const [err, data] = await fn()

    if (!err) {
      return [null, data]
    }

    lastError = err

    // 如果不是网络错误,不重试
    if (!err.message.includes('网络') && !err.message.includes('超时')) {
      break
    }

    // 等待后重试
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  return [lastError, null]
}

// 使用
const loadData = async () => {
  const [err, data] = await requestWithRetry(
    () => http.get<User[]>('/api/users'),
    3,  // 最多重试 3 次
    1000 // 每次延迟 1 秒
  )

  if (err) {
    console.error('重试失败:', err)
    return
  }

  console.log(data)
}
```

### 7. 并发请求控制

限制同时进行的请求数量:

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running = 0
  private maxConcurrent = 3

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.run()
    })
  }

  private async run() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const fn = this.queue.shift()!
      this.running++

      fn().finally(() => {
        this.running--
        this.run()
      })
    }
  }
}

const queue = new RequestQueue()

// 批量请求
const loadMultipleUsers = async (ids: string[]) => {
  const results = await Promise.all(
    ids.map(id =>
      queue.add(() => http.get<User>(`/api/users/${id}`))
    )
  )

  return results.map(([err, data]) => data).filter(Boolean)
}
```

## 常见问题

### 1. 请求未携带 Token

**问题描述:**
请求返回 401 未授权,但用户已登录。

**问题原因:**
- 请求配置了 `auth: false`
- Token 已过期但未清除
- Token 存储失败

**解决方案:**

```typescript
// 方案1: 确保不要禁用认证
const [err, data] = await http.get('/api/protected')
// 不要使用 noAuth()

// 方案2: 检查 Token 是否有效
import { useToken } from '@/composables/useToken'

const token = useToken()
console.log('Token:', token.getToken())
console.log('认证头:', token.getAuthHeaders())

// 方案3: 重新登录
const handleUnauthorized = async () => {
  const userStore = useUserStore()
  await userStore.logoutUser()
  uni.navigateTo({ url: '/pages/auth/login' })
}
```

### 2. 防重复提交误拦截

**问题描述:**
正常操作被识别为重复提交。

**问题原因:**
- 两次请求间隔小于 1 秒
- 请求参数完全相同

**解决方案:**

```typescript
// 方案1: 禁用防重复提交
const [err] = await http
  .noRepeatSubmit()
  .post('/api/message', data)

// 方案2: 添加时间戳使参数不同
const [err] = await http.post('/api/data', {
  ...data,
  timestamp: Date.now()
})

// 方案3: 延迟第二次请求
const submitForm = async () => {
  const [err] = await http.post('/api/form', formData)
  // 等待 1 秒后允许再次提交
  await new Promise(resolve => setTimeout(resolve, 1000))
}
```

### 3. 加密请求失败

**问题描述:**
启用加密后请求返回解密失败错误。

**问题原因:**
- 后端未配置解密
- RSA 公钥/私钥不匹配
- 加密算法版本不一致

**解决方案:**

```typescript
// 方案1: 确认后端支持加密
// 检查 SystemConfig.security.apiEncrypt 配置

// 方案2: 检查 RSA 密钥配置
import { SystemConfig } from '@/systemConfig'
console.log('加密配置:', SystemConfig.security?.apiEncrypt)

// 方案3: 联系后端确认加密算法
// AES: CBC 模式, PKCS7 填充
// RSA: ECB 模式, PKCS1 填充

// 方案4: 暂时禁用加密
const [err, token] = await http
  .noAuth()
  .post('/auth/login', form)
// 不使用 encrypt()
```

### 4. 请求超时

**问题描述:**
请求经常超时,特别是文件上传/下载。

**问题原因:**
- 默认 50 秒超时时间不够
- 网络慢
- 服务器处理慢

**解决方案:**

```typescript
// 方案1: 增加超时时间
const [err, data] = await http
  .timeout(120000) // 120 秒
  .post('/api/export', data)

// 方案2: 文件上传单独设置
const [err, result] = await http.upload({
  url: '/api/upload',
  filePath,
  name: 'file',
  timeout: 180000 // 3 分钟
})

// 方案3: 监听上传进度
const uploadWithProgress = () => {
  const task = uni.uploadFile({
    url: 'https://api.example.com/upload',
    filePath,
    name: 'file',
    timeout: 300000,
    success: (res) => {
      console.log('上传成功')
    }
  })

  task.onProgressUpdate((res) => {
    console.log('上传进度:', res.progress + '%')
  })
}
```

### 5. 应用初始化超时

**问题描述:**
首次进入应用时请求失败,提示"应用初始化超时"。

**问题原因:**
- 租户 ID 加载耗时过长
- 初始化超时时间太短(默认 10 秒)

**解决方案:**

```typescript
// 方案1: 增加初始化超时时间
const [err, data] = await http.get('/api/data', null, {
  initTimeout: 20000 // 20 秒
})

// 方案2: 跳过等待(不推荐,可能丢失租户信息)
const [err, data] = await http
  .skipWait()
  .get('/api/data')

// 方案3: 检查初始化逻辑
// composables/useAppInit.ts
export const waitForInit = async (timeout = 10000): Promise<void> => {
  // 检查租户 ID 加载逻辑
}

// 方案4: 预加载租户信息
// App.vue
onLaunch(async () => {
  await loadTenantInfo()
})
```

### 6. 租户信息缺失

**问题描述:**
多租户模式下请求返回租户信息错误。

**问题原因:**
- 租户 ID 未设置
- 请求禁用了租户信息
- 存储被清除

**解决方案:**

```typescript
// 方案1: 确保租户 ID 已设置
import { getTenantId, setTenantId } from '@/utils/tenant'

console.log('当前租户ID:', getTenantId())

// 如果为空,重新设置
if (!getTenantId()) {
  setTenantId('your-tenant-id')
}

// 方案2: 不要禁用租户信息
const [err, data] = await http.get('/api/data')
// 不要使用 noTenant()

// 方案3: 非租户接口显式禁用
const [err, config] = await http
  .noTenant()
  .get('/system/config')
```

### 7. 响应数据结构不匹配

**问题描述:**
TypeScript 类型与实际响应数据不匹配。

**问题原因:**
- 后端返回结构变更
- 类型定义错误
- 接口版本不一致

**解决方案:**

```typescript
// 方案1: 检查实际响应
const [err, data] = await http.get('/api/users')
console.log('实际响应:', data)

// 方案2: 使用 any 类型临时调试
const [err, data] = await http.get<any>('/api/users')
console.log('字段:', Object.keys(data))

// 方案3: 更新类型定义
interface User {
  id: string
  userName: string
  // 新增字段
  avatar?: string
  createTime?: string
}

// 方案4: 使用可选字段
interface UserResponse {
  id: string
  userName: string
  // 所有其他字段都是可选的
  [key: string]: any
}
```

## 扩展用法

### 请求拦截器

虽然 `useHttp` 不直接提供拦截器,但可以通过包装实现:

```typescript
// utils/http-interceptor.ts
import { http as原始Http } from '@/composables/useHttp'

export const http = {
  async get<T>(...args: Parameters<typeof 原始Http.get>) {
    console.log('[请求拦截] GET', args[0])
    const startTime = Date.now()

    const result = await 原始Http.get<T>(...args)

    console.log('[响应拦截] 耗时:', Date.now() - startTime, 'ms')
    return result
  },

  async post<T>(...args: Parameters<typeof 原始Http.post>) {
    console.log('[请求拦截] POST', args[0], args[1])
    const startTime = Date.now()

    const result = await 原始Http.post<T>(...args)

    console.log('[响应拦截] 耗时:', Date.now() - startTime, 'ms')
    return result
  },

  // 其他方法同理...
}
```

### 全局加载状态

创建全局请求加载状态:

```typescript
// stores/loading.ts
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const count = ref(0)
  const isLoading = computed(() => count.value > 0)

  const start = () => {
    count.value++
  }

  const end = () => {
    count.value = Math.max(0, count.value - 1)
  }

  return { isLoading, start, end }
})

// 包装 http
import { useLoadingStore } from '@/stores/loading'

export const httpWithLoading = {
  async get<T>(...args: Parameters<typeof http.get>) {
    const loading = useLoadingStore()
    loading.start()
    try {
      return await http.get<T>(...args)
    } finally {
      loading.end()
    }
  },
  // 其他方法同理...
}

// App.vue 中显示全局加载
const loading = useLoadingStore()
```

### Mock 数据支持

开发环境使用 Mock 数据:

```typescript
// utils/mock.ts
const isDev = import.meta.env.DEV

export const mockHttp = {
  async get<T>(url: string): Promise<[null, T]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData: Record<string, any> = {
      '/api/users': [
        { id: '1', userName: 'admin' },
        { id: '2', userName: 'user' }
      ],
      '/api/user/1': { id: '1', userName: 'admin', email: 'admin@example.com' }
    }

    return [null, mockData[url] as T]
  },
  // 其他方法...
}

// 使用
const http = isDev ? mockHttp : 原始Http
```

### 请求缓存

实现请求结果缓存:

```typescript
// utils/request-cache.ts
const cache = new Map<string, { data: any; timestamp: number }>()

export const cachedHttp = {
  async get<T>(
    url: string,
    params?: any,
    config?: { cache?: boolean; cacheTime?: number } & CustomRequestOptions
  ): Result<T> {
    const cacheKey = `${url}?${JSON.stringify(params)}`

    // 检查缓存
    if (config?.cache) {
      const cached = cache.get(cacheKey)
      if (cached) {
        const age = Date.now() - cached.timestamp
        const maxAge = config.cacheTime || 60000 // 默认 1 分钟

        if (age < maxAge) {
          console.log('[缓存命中]', cacheKey)
          return [null, cached.data]
        }
      }
    }

    // 请求数据
    const [err, data] = await http.get<T>(url, params, config)

    // 保存缓存
    if (!err && config?.cache) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
    }

    return [err, data]
  },

  // 清除缓存
  clearCache(pattern?: string) {
    if (!pattern) {
      cache.clear()
      return
    }

    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  }
}

// 使用
const [err, users] = await cachedHttp.get<User[]>('/api/users', null, {
  cache: true,
  cacheTime: 300000 // 5 分钟
})
```

---

**文档编写**: 基于 `ruoyi-plus-uniapp-workflow` 项目源码
**最后更新**: 2025-11-17
