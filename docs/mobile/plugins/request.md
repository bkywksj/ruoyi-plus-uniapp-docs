# 网络请求插件

## 介绍

网络请求插件是 RuoYi-Plus-UniApp 框架的核心基础设施之一，基于 `uni.request` 封装了一套功能完善、类型安全的 HTTP 请求服务。该插件采用 Composable 组合式函数模式设计，提供了链式调用 API、请求/响应加密、防重复提交、自动认证、国际化支持等企业级功能。

**核心特性：**

- **类型安全** - 完整的 TypeScript 类型定义，支持泛型响应类型推导，提供良好的 IDE 智能提示
- **链式调用** - 支持 `http.noAuth().encrypt().post(...)` 风格的链式配置，代码简洁优雅
- **请求加密** - 支持 AES + RSA 混合加密，保障敏感数据传输安全
- **防重复提交** - 自动检测并阻止短时间内的重复请求，防止数据重复提交
- **自动认证** - 自动注入 Token 认证头和租户信息，简化业务代码
- **国际化支持** - 自动在请求头中添加语言标识，支持后端返回多语言消息
- **错误处理** - 统一的错误处理机制，自动显示错误提示，支持会话过期自动跳转登录
- **应用初始化等待** - 确保租户等初始化信息就绪后再发送请求
- **文件上传下载** - 支持文件上传和下载，自动处理认证和进度监听

## 基本用法

### 引入与创建实例

使用网络请求插件有两种方式：使用默认实例或创建自定义实例。

```vue
<script lang="ts" setup>
// 方式一：使用默认实例（推荐）
import { http } from '@/composables/useHttp'

// 方式二：创建自定义实例
import { useHttp } from '@/composables/useHttp'
const customHttp = useHttp({
  timeout: 30000,
  header: {
    'X-Custom-Header': 'custom-value'
  }
})
</script>
```

**使用说明：**

- 默认实例 `http` 是预创建的全局实例，满足大多数场景需求
- 自定义实例通过 `useHttp()` 创建，可传入默认配置
- 自定义配置会与链式调用配置、请求时配置进行合并

### GET 请求

GET 请求用于获取数据，参数会自动拼接到 URL 查询字符串中。

```vue
<template>
  <view class="user-list">
    <view v-for="user in users" :key="user.id" class="user-item">
      <text>{{ user.name }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])

const fetchUsers = async () => {
  const [err, data] = await http.get<User[]>('/system/user/list', {
    pageNum: 1,
    pageSize: 10
  })

  if (!err && data) {
    users.value = data
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
```

**技术实现：**

- GET 请求的参数会通过 `objectToQuery` 工具函数转换为查询字符串
- 参数支持嵌套对象和数组，自动进行序列化处理
- 返回值采用 `[error, data]` 元组格式，便于错误处理

### POST 请求

POST 请求用于提交数据，数据会作为请求体发送。

```vue
<template>
  <view class="login-form">
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <button @tap="handleLogin">登录</button>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { http } from '@/composables/useHttp'

interface LoginParams {
  username: string
  password: string
}

interface LoginResult {
  token: string
  expireTime: number
}

const form = reactive<LoginParams>({
  username: '',
  password: ''
})

const handleLogin = async () => {
  const [err, data] = await http.post<LoginResult>('/auth/login', form)

  if (!err && data) {
    console.log('登录成功，Token:', data.token)
    // 保存 Token 并跳转
  }
}
</script>
```

**技术实现：**

- POST 请求默认 Content-Type 为 `application/json;charset=utf-8`
- 请求体会自动进行 JSON 序列化
- POST 请求默认开启防重复提交检测（500ms 内相同请求会被阻止）

### PUT 请求

PUT 请求用于更新数据，通常用于修改已存在的资源。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface UserUpdateParams {
  id: number
  name: string
  email: string
}

const updateUser = async (userData: UserUpdateParams) => {
  const [err, data] = await http.put<void>('/system/user', userData)

  if (!err) {
    console.log('用户信息更新成功')
  }
}
</script>
```

**技术实现：**

- PUT 请求与 POST 请求类似，也会进行防重复提交检测
- 支持加密传输，可通过链式调用 `http.encrypt().put(...)` 启用

### DELETE 请求

DELETE 请求用于删除资源。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const deleteUser = async (userId: number) => {
  const [err] = await http.del<void>(`/system/user/${userId}`)

  if (!err) {
    console.log('用户删除成功')
  }
}

// 批量删除
const batchDelete = async (ids: number[]) => {
  const [err] = await http.del<void>('/system/user/' + ids.join(','))

  if (!err) {
    console.log('批量删除成功')
  }
}
</script>
```

**使用说明：**

- 使用 `del` 方法而非 `delete`，避免与 JavaScript 保留字冲突
- DELETE 请求参数通常通过 URL 路径传递

## 链式调用 API

链式调用 API 是该插件的核心特性之一，允许以声明式方式配置请求选项，代码更加简洁易读。

### noAuth - 禁用认证

用于不需要登录认证的公开接口。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface CaptchaVo {
  uuid: string
  img: string
}

// 获取验证码（无需登录）
const getCaptcha = async () => {
  const [err, data] = await http.noAuth().get<CaptchaVo>('/auth/imgCode')

  if (!err && data) {
    console.log('验证码UUID:', data.uuid)
  }
}
</script>
```

**技术实现：**

- 调用 `noAuth()` 后，请求头中不会注入 Authorization Token
- 适用于登录、注册、获取验证码等公开接口
- 内部通过设置 `header.auth = false` 实现

### encrypt - 启用加密

用于需要加密传输的敏感数据接口。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface LoginParams {
  username: string
  password: string
  code: string
  uuid: string
}

interface LoginResult {
  token: string
}

// 加密登录请求
const login = async (params: LoginParams) => {
  const [err, data] = await http.noAuth().encrypt().post<LoginResult>('/auth/login', params)

  if (!err && data) {
    console.log('登录成功')
  }
}
</script>
```

**技术实现：**

- 启用加密后，请求数据使用 AES 对称加密
- AES 密钥通过 RSA 公钥加密后放入请求头 `encrypt-key`
- 服务端使用 RSA 私钥解密获取 AES 密钥，再解密请求数据
- 响应数据同样会进行加密，客户端自动解密

### skipWait - 跳过初始化等待

用于不依赖租户等初始化信息的请求。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 应用启动时获取初始配置（无需等待初始化）
const getAppConfig = async () => {
  const [err, data] = await http.noAuth().skipWait().get('/system/config/init')

  if (!err) {
    console.log('应用配置:', data)
  }
}
</script>
```

**技术实现：**

- 默认情况下，请求会等待应用初始化完成（确保租户ID等信息就绪）
- `skipWait()` 跳过此等待，立即发送请求
- 适用于初始化流程中需要发送的请求

### noRepeatSubmit - 禁用防重复提交

用于允许快速连续提交的场景。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 点赞功能（允许快速重复点击）
const toggleLike = async (postId: number) => {
  const [err] = await http.noRepeatSubmit().post(`/post/${postId}/like`)

  if (!err) {
    console.log('点赞状态切换成功')
  }
}
</script>
```

**技术实现：**

- POST 和 PUT 请求默认开启防重复提交（500ms 内相同请求会被阻止）
- `noRepeatSubmit()` 禁用此检测，允许连续发送相同请求
- 防重复提交通过 URL + 请求数据生成唯一 key 进行判断

### noTenant - 禁用租户信息

用于不需要租户隔离的公共接口。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 获取租户列表（无需租户ID）
const getTenantList = async () => {
  const [err, data] = await http.noAuth().noTenant().skipWait().get('/auth/tenant/list')

  if (!err) {
    console.log('租户列表:', data)
  }
}
</script>
```

**技术实现：**

- 默认请求会在请求头中添加 `X-Tenant-Id` 租户标识
- `noTenant()` 禁用此行为，不发送租户信息
- 适用于租户管理、公共配置等跨租户场景

### noMsgError - 禁用错误提示

用于需要自定义错误处理的场景。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'
import { useToast } from '@/wd/components/wd-toast/useToast'

const toast = useToast()

// 自定义错误处理
const checkUsername = async (username: string) => {
  const [err, data] = await http.noAuth().noMsgError().get('/auth/checkUsername', { username })

  if (err) {
    // 自定义错误提示
    if (err.message.includes('已存在')) {
      toast.warning('该用户名已被注册，请换一个')
    } else {
      toast.error('检查失败，请重试')
    }
    return false
  }

  return true
}
</script>
```

**技术实现：**

- 默认情况下，请求错误会自动显示 Toast 错误提示
- `noMsgError()` 禁用自动提示，由业务代码自行处理
- 适用于需要特殊错误处理逻辑的场景

### timeout - 设置超时时间

用于需要自定义超时时间的请求。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 长时间运行的报表导出（设置 5 分钟超时）
const exportReport = async (params: any) => {
  const [err, data] = await http.timeout(300000).post('/report/export', params)

  if (!err) {
    console.log('导出成功')
  }
}
</script>
```

**技术实现：**

- 默认超时时间为 50000ms（50秒）
- `timeout(ms)` 可设置自定义超时时间，单位为毫秒
- 超时后会抛出错误，错误消息为"请求超时，请稍后重试"

### config - 通用配置

用于设置多个配置项。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 复杂配置
const complexRequest = async () => {
  const [err, data] = await http.config({
    timeout: 30000,
    header: {
      'X-Custom-Header': 'value',
      auth: false,
      isEncrypt: true
    }
  }).post('/api/complex', { data: 'test' })
}
</script>
```

### 链式组合调用

多个链式方法可以组合使用，配置会依次合并。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  phone: string
  code: string
}

// 注册接口：无需认证 + 加密 + 禁用防重复 + 跳过等待 + 自定义超时
const register = async (params: RegisterParams) => {
  const [err, data] = await http
    .noAuth()
    .encrypt()
    .noRepeatSubmit()
    .skipWait()
    .timeout(30000)
    .post('/auth/register', params)

  if (!err) {
    console.log('注册成功')
  }
}
</script>
```

**技术实现：**

- 链式调用内部使用临时配置对象 `chainConfig` 存储配置
- 每次调用链式方法会合并配置到 `chainConfig`
- 发送请求时，配置按优先级合并：默认配置 < 链式配置 < 请求时配置
- 请求发送后 `chainConfig` 会被重置，不影响下次请求

## 文件上传下载

### 文件上传

使用 `upload` 方法上传文件。

```vue
<template>
  <view class="upload-demo">
    <button @tap="chooseAndUpload">选择并上传图片</button>
    <image v-if="imageUrl" :src="imageUrl" mode="aspectFit" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface UploadResult {
  url: string
  fileName: string
  originalName: string
}

const imageUrl = ref('')

const chooseAndUpload = async () => {
  // 选择图片
  const [chooseErr, chooseRes] = await uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  })

  if (chooseErr || !chooseRes) return

  const tempFilePath = chooseRes.tempFilePaths[0]

  // 上传图片
  const [err, data] = await http.upload<UploadResult>({
    url: '/resource/oss/upload',
    filePath: tempFilePath,
    name: 'file',
    formData: {
      type: 'avatar'
    }
  })

  if (!err && data) {
    imageUrl.value = data.url
    console.log('上传成功:', data.fileName)
  }
}
</script>
```

**技术实现：**

- 基于 `uni.uploadFile` 封装，自动处理 URL 拼接和认证头
- 支持 `formData` 传递额外的表单参数
- 响应数据自动解析为 JSON 并通过统一响应处理
- 默认超时时间 50000ms

### 文件下载

使用 `download` 方法下载文件。

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const downloadFile = async (fileId: string, fileName: string) => {
  const [err, res] = await http.download({
    url: `/resource/oss/download/${fileId}`,
    // 可选：指定保存路径
    // filePath: `${uni.env.USER_DATA_PATH}/${fileName}`
  })

  if (!err && res) {
    console.log('下载成功，临时路径:', res.tempFilePath)

    // 保存到相册（图片）
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          console.log('已保存到相册')
        }
      })
    }

    // 或打开文档
    uni.openDocument({
      filePath: res.tempFilePath,
      showMenu: true
    })
  }
}
</script>
```

**技术实现：**

- 基于 `uni.downloadFile` 封装，自动处理 URL 和认证
- 返回包含 `tempFilePath` 的下载结果
- 状态码非 200 时返回错误

## 请求加密

### 加密原理

请求加密采用 AES + RSA 混合加密方案：

1. **客户端请求时**
   - 生成随机 AES 密钥
   - 使用 AES 密钥加密请求数据
   - 使用 RSA 公钥加密 AES 密钥
   - 将加密后的 AES 密钥放入请求头 `encrypt-key`
   - 发送加密后的请求体

2. **服务端处理时**
   - 从请求头获取加密的 AES 密钥
   - 使用 RSA 私钥解密获取 AES 密钥
   - 使用 AES 密钥解密请求数据
   - 处理业务逻辑

3. **服务端响应时**
   - 使用相同 AES 密钥加密响应数据
   - 将加密的 AES 密钥放入响应头

4. **客户端接收时**
   - 从响应头获取加密的 AES 密钥
   - 解密并获取响应数据

### 启用加密

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 方式一：链式调用
const secureLogin = async (params: any) => {
  const [err, data] = await http.noAuth().encrypt().post('/auth/login', params)
}

// 方式二：配置参数
const secureRequest = async (params: any) => {
  const [err, data] = await http.post('/api/sensitive', params, {
    header: {
      isEncrypt: true
    }
  })
}
</script>
```

**配置说明：**

- 加密功能需要服务端配合，确保服务端已配置 RSA 密钥对
- 加密仅对 POST 和 PUT 请求的请求体生效
- 需要在 `SystemConfig.security.apiEncrypt` 中启用加密功能

### 加密配置

在 `systemConfig.ts` 中配置加密选项：

```typescript
// systemConfig.ts
export const SystemConfig = {
  // ... 其他配置
  security: {
    // 是否启用接口加密
    apiEncrypt: true,
    // RSA 公钥（用于加密 AES 密钥）
    rsaPublicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...'
  }
}
```

## 错误处理

### 统一错误处理

插件提供了统一的错误处理机制，自动处理常见的错误场景：

```typescript
// 错误消息定义
const ErrorMsg = {
  NETWORK: '网络连接失败，请检查网络',
  TIMEOUT: '请求超时，请稍后重试',
  REPEAT_SUBMIT: '数据正在处理，请勿重复提交',
  DECRYPT_FAILED: '响应数据解密失败',
  SESSION_EXPIRED: '未登录或登陆已过期~',
  REQUEST_CANCELED: '请求已取消',
  INIT_TIMEOUT: '应用初始化超时，请重试',
  UNKNOWN: '网络错误',
}
```

### 错误处理流程

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const fetchData = async () => {
  const [err, data] = await http.get('/api/data')

  // 方式一：简单判断
  if (err) {
    console.error('请求失败:', err.message)
    return
  }

  // 方式二：详细错误处理
  if (err) {
    if (err.message.includes('网络')) {
      // 网络错误处理
    } else if (err.message.includes('超时')) {
      // 超时处理
    } else if (err.message.includes('过期')) {
      // 登录过期处理
    }
    return
  }

  // 正常处理数据
  console.log('数据:', data)
}
</script>
```

### 会话过期处理

当服务端返回 401 状态码时，会自动处理会话过期：

1. 调用 `userStore.logoutUser()` 清除本地登录状态
2. 获取当前页面路径作为重定向参数
3. 跳转到登录页面 `/pages/auth/login?redirect=${currentPath}`
4. 显示"未登录或登陆已过期~"提示（除非设置了 `noMsgError`）

```typescript
// 会话过期处理逻辑
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

### 自定义错误处理

使用 `noMsgError()` 禁用默认错误提示，实现自定义处理：

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'
import { useToast } from '@/wd/components/wd-toast/useToast'

const toast = useToast()

const submitForm = async (formData: any) => {
  const [err, data] = await http.noMsgError().post('/api/submit', formData)

  if (err) {
    // 自定义错误处理
    const errorMap: Record<string, string> = {
      '用户名已存在': '该用户名已被占用，请更换',
      '验证码错误': '验证码不正确，请重新输入',
      '参数校验失败': '请检查输入的信息是否完整'
    }

    const customMsg = Object.entries(errorMap).find(([key]) =>
      err.message.includes(key)
    )?.[1]

    toast.error(customMsg || err.message)
    return
  }

  toast.success('提交成功')
}
</script>
```

## 请求配置

### CustomRequestOptions 配置项

```typescript
interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  /** 查询参数（会拼接到 URL） */
  query?: Record<string, any>
  /** 查询参数别名 */
  params?: Record<string, any>
  /** 跳过应用初始化等待 */
  skipWait?: boolean
  /** 初始化等待超时时间（毫秒） */
  initTimeout?: number
  /** 请求头配置 */
  header?: {
    /** 是否需要认证，默认 true */
    auth?: boolean
    /** 是否启用加密 */
    isEncrypt?: boolean
    /** 是否检查重复提交，默认 true */
    repeatSubmit?: boolean
    /** 是否需要租户信息，默认 true */
    tenant?: boolean
    /** 其他自定义请求头 */
    [key: string]: any
  }
}
```

### 配置优先级

配置按以下优先级合并（后者覆盖前者）：

1. **默认配置** - `useHttp()` 创建实例时传入的配置
2. **链式配置** - 通过链式调用设置的配置
3. **请求配置** - 发送请求时传入的配置

```vue
<script lang="ts" setup>
import { useHttp } from '@/composables/useHttp'

// 1. 创建实例时的默认配置
const http = useHttp({
  timeout: 30000,
  header: {
    'X-App-Version': '1.0.0'
  }
})

const makeRequest = async () => {
  // 2. 链式调用配置 + 3. 请求时配置
  const [err, data] = await http
    .noAuth()  // 链式配置
    .timeout(60000)  // 链式配置
    .post('/api/data', { foo: 'bar' }, {
      // 请求时配置（最高优先级）
      header: {
        'X-Custom': 'value'
      }
    })
}
</script>
```

### 请求头说明

默认请求头包含：

| 请求头 | 说明 | 示例值 |
|--------|------|--------|
| `Content-Type` | 内容类型 | `application/json;charset=utf-8` |
| `Content-Language` | 当前语言 | `zh-CN` |
| `X-Request-Id` | 请求ID | `20250925142636001` |
| `Authorization` | 认证Token | `Bearer xxx` |
| `X-Tenant-Id` | 租户ID | `000000` |
| `encrypt-key` | 加密密钥 | `Base64(RSA(AES-KEY))` |

## 响应处理

### 标准响应格式

后端接口应返回标准响应格式：

```typescript
interface R<T> {
  /** 响应码，200 表示成功 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}
```

### 响应处理流程

1. **解密处理** - 如果响应头包含 `encrypt-key`，自动解密响应数据
2. **二进制判断** - 如果是二进制数据（图片、PDF等），直接返回原始响应
3. **业务响应处理**
   - `code === 200`：返回 `data` 字段
   - `code === 401`：处理会话过期
   - 其他：抛出错误，使用 `msg` 作为错误消息

### Result 返回类型

所有请求方法返回 `Result<T>` 类型，即 `Promise<[Error | null, T | null]>`：

```typescript
type Result<T> = Promise<[Error | null, T | null]>

// 使用示例
const [err, data] = await http.get<User>('/api/user/1')
// err: Error | null
// data: User | null
```

这种设计避免了 try-catch 嵌套，使错误处理更加简洁。

## API

### useHttp 方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `get` | GET 请求 | `(url, params?, config?)` | `Result<T>` |
| `post` | POST 请求 | `(url, data?, config?)` | `Result<T>` |
| `put` | PUT 请求 | `(url, data?, config?)` | `Result<T>` |
| `del` | DELETE 请求 | `(url, params?, config?)` | `Result<T>` |
| `upload` | 上传文件 | `(uploadConfig)` | `Result<T>` |
| `download` | 下载文件 | `(downloadConfig)` | `Result<DownloadSuccessData>` |
| `request` | 通用请求 | `(config)` | `Result<T>` |

### 链式方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `noAuth()` | 禁用认证头 | `http.noAuth().get(...)` |
| `encrypt()` | 启用请求加密 | `http.encrypt().post(...)` |
| `skipWait()` | 跳过初始化等待 | `http.skipWait().get(...)` |
| `noRepeatSubmit()` | 禁用防重复提交 | `http.noRepeatSubmit().post(...)` |
| `noTenant()` | 禁用租户信息 | `http.noTenant().get(...)` |
| `noMsgError()` | 禁用错误提示 | `http.noMsgError().post(...)` |
| `timeout(ms)` | 设置超时时间 | `http.timeout(30000).get(...)` |
| `config(cfg)` | 通用配置 | `http.config({...}).post(...)` |

### 类型定义

```typescript
/** HTTP 请求配置选项 */
interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  /** 查询参数 */
  query?: Record<string, any>
  /** 查询参数别名 */
  params?: Record<string, any>
  /** 跳过初始化等待 */
  skipWait?: boolean
  /** 初始化超时时间 */
  initTimeout?: number
  /** 请求头配置 */
  header?: {
    auth?: boolean
    isEncrypt?: boolean
    repeatSubmit?: boolean
    tenant?: boolean
    [key: string]: any
  }
}

/** 请求结果类型 */
type Result<T> = Promise<[Error | null, T | null]>

/** 标准响应格式 */
interface R<T> {
  code: number
  msg: string
  data: T
}

/** HTTP 状态码 */
const HttpCode = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
} as const

/** 上传文件配置 */
type UploadConfig = UniApp.UploadFileOption & CustomRequestOptions

/** 下载文件配置 */
type DownloadConfig = UniApp.DownloadFileOption & CustomRequestOptions
```

## 最佳实践

### 1. 封装业务 API

将相关的 API 请求封装到独立的模块中：

```typescript
// api/user.ts
import { http } from '@/composables/useHttp'

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
}

export interface UserListParams {
  pageNum: number
  pageSize: number
  username?: string
  status?: number
}

export interface PageResult<T> {
  rows: T[]
  total: number
}

/** 获取用户列表 */
export const getUserList = (params: UserListParams) => {
  return http.get<PageResult<User>>('/system/user/list', params)
}

/** 获取用户详情 */
export const getUserInfo = (userId: number) => {
  return http.get<User>(`/system/user/${userId}`)
}

/** 创建用户 */
export const createUser = (data: Partial<User>) => {
  return http.post<void>('/system/user', data)
}

/** 更新用户 */
export const updateUser = (data: User) => {
  return http.put<void>('/system/user', data)
}

/** 删除用户 */
export const deleteUser = (userId: number) => {
  return http.del<void>(`/system/user/${userId}`)
}

/** 批量删除用户 */
export const batchDeleteUsers = (userIds: number[]) => {
  return http.del<void>(`/system/user/${userIds.join(',')}`)
}
```

使用封装的 API：

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getUserList, deleteUser, type User } from '@/api/user'

const users = ref<User[]>([])
const total = ref(0)

const loadUsers = async () => {
  const [err, data] = await getUserList({ pageNum: 1, pageSize: 10 })
  if (!err && data) {
    users.value = data.rows
    total.value = data.total
  }
}

const handleDelete = async (userId: number) => {
  const [err] = await deleteUser(userId)
  if (!err) {
    loadUsers()
  }
}

onMounted(loadUsers)
</script>
```

### 2. 统一错误边界处理

创建错误处理工具函数：

```typescript
// utils/request-helper.ts
import { useToast } from '@/wd/components/wd-toast/useToast'

const toast = useToast()

/** 执行请求并处理结果 */
export const executeRequest = async <T>(
  requestFn: () => Promise<[Error | null, T | null]>,
  options?: {
    successMsg?: string
    errorHandler?: (err: Error) => void
    onSuccess?: (data: T) => void
  }
): Promise<T | null> => {
  const [err, data] = await requestFn()

  if (err) {
    if (options?.errorHandler) {
      options.errorHandler(err)
    }
    return null
  }

  if (options?.successMsg) {
    toast.success(options.successMsg)
  }

  if (options?.onSuccess && data) {
    options.onSuccess(data)
  }

  return data
}
```

使用示例：

```vue
<script lang="ts" setup>
import { executeRequest } from '@/utils/request-helper'
import { createUser } from '@/api/user'

const handleSubmit = async (formData: any) => {
  await executeRequest(
    () => createUser(formData),
    {
      successMsg: '创建成功',
      onSuccess: () => {
        // 刷新列表
      }
    }
  )
}
</script>
```

### 3. 请求重试机制

实现简单的请求重试：

```typescript
// utils/retry.ts
export const withRetry = async <T>(
  requestFn: () => Promise<[Error | null, T | null]>,
  maxRetries = 3,
  delay = 1000
): Promise<[Error | null, T | null]> => {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    const [err, data] = await requestFn()

    if (!err) {
      return [null, data]
    }

    lastError = err

    // 如果是认证错误，不重试
    if (err.message.includes('过期') || err.message.includes('401')) {
      break
    }

    // 等待后重试
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  return [lastError, null]
}
```

使用示例：

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'
import { withRetry } from '@/utils/retry'

const fetchWithRetry = async () => {
  const [err, data] = await withRetry(
    () => http.get('/api/unstable-endpoint'),
    3,  // 最多重试 3 次
    1000  // 初始延迟 1 秒
  )

  if (!err) {
    console.log('数据:', data)
  }
}
</script>
```

### 4. 请求取消

使用 AbortController 实现请求取消（H5 端）：

```vue
<script lang="ts" setup>
import { ref, onUnmounted } from 'vue'
import { http } from '@/composables/useHttp'

const abortController = ref<AbortController | null>(null)

const searchUsers = async (keyword: string) => {
  // 取消上一次请求
  if (abortController.value) {
    abortController.value.abort()
  }

  // 创建新的 AbortController
  abortController.value = new AbortController()

  const [err, data] = await http.get('/api/users/search', { keyword }, {
    // H5 端支持
    signal: abortController.value.signal
  } as any)

  if (!err) {
    console.log('搜索结果:', data)
  }
}

onUnmounted(() => {
  // 组件卸载时取消未完成的请求
  abortController.value?.abort()
})
</script>
```

### 5. 请求缓存

实现简单的请求缓存：

```typescript
// utils/cache.ts
interface CacheItem<T> {
  data: T
  expireTime: number
}

const cache = new Map<string, CacheItem<any>>()

export const withCache = async <T>(
  key: string,
  requestFn: () => Promise<[Error | null, T | null]>,
  ttl = 60000  // 缓存时间，默认 1 分钟
): Promise<[Error | null, T | null]> => {
  const now = Date.now()
  const cached = cache.get(key)

  // 检查缓存是否有效
  if (cached && cached.expireTime > now) {
    return [null, cached.data]
  }

  // 发送请求
  const [err, data] = await requestFn()

  // 缓存成功的结果
  if (!err && data) {
    cache.set(key, {
      data,
      expireTime: now + ttl
    })
  }

  return [err, data]
}

// 清除缓存
export const clearCache = (key?: string) => {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
```

使用示例：

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'
import { withCache, clearCache } from '@/utils/cache'

// 缓存配置数据 5 分钟
const getConfig = () => {
  return withCache(
    'app-config',
    () => http.get('/system/config'),
    5 * 60 * 1000
  )
}

// 强制刷新配置
const refreshConfig = async () => {
  clearCache('app-config')
  return getConfig()
}
</script>
```

## 常见问题

### 1. 请求报 "未登录或登陆已过期" 但实际已登录

**问题原因：**
- Token 已过期但本地未清除
- Token 格式不正确
- 请求发送时 Token 尚未获取到

**解决方案：**

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 检查 Token 状态
const checkAndRequest = async () => {
  const userStore = useUserStore()

  // 确保已登录
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  // 检查 Token 是否过期
  if (userStore.isTokenExpired) {
    // 尝试刷新 Token
    await userStore.refreshToken()
  }

  // 发送请求
  const [err, data] = await http.get('/api/data')
}
</script>
```

### 2. POST 请求被拦截提示 "请勿重复提交"

**问题原因：**
- 500ms 内发送了相同的请求（相同 URL + 相同数据）
- 用户快速重复点击按钮

**解决方案：**

```vue
<template>
  <button :disabled="loading" @tap="handleSubmit">
    {{ loading ? '提交中...' : '提交' }}
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

const loading = ref(false)

const handleSubmit = async () => {
  if (loading.value) return

  loading.value = true
  try {
    // 方式一：添加时间戳使请求唯一
    const [err, data] = await http.post('/api/submit', {
      ...formData,
      _t: Date.now()
    })

    // 方式二：禁用防重复检测
    // const [err, data] = await http.noRepeatSubmit().post('/api/submit', formData)
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. 请求超时但网络正常

**问题原因：**
- 默认超时时间 50 秒不够用
- 服务端处理时间过长
- 大文件上传/下载

**解决方案：**

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 方式一：单个请求设置超时
const longRequest = async () => {
  const [err, data] = await http.timeout(120000).post('/api/long-task', params)
}

// 方式二：创建长超时实例
const longHttp = useHttp({ timeout: 120000 })
const result = await longHttp.post('/api/long-task', params)

// 方式三：上传/下载单独设置
const uploadLargeFile = async (filePath: string) => {
  const [err, data] = await http.upload({
    url: '/api/upload',
    filePath,
    name: 'file',
    timeout: 300000  // 5 分钟
  })
}
</script>
```

### 4. 加密请求失败提示 "响应数据解密失败"

**问题原因：**
- RSA 公钥配置错误
- 服务端未开启加密或配置不匹配
- 响应数据格式异常

**解决方案：**

```typescript
// 1. 检查 systemConfig.ts 中的配置
export const SystemConfig = {
  security: {
    apiEncrypt: true,
    // 确保公钥正确且与服务端私钥匹配
    rsaPublicKey: '...'
  }
}

// 2. 确认服务端已开启加密
// 后端 application.yml
// api:
//   encrypt:
//     enabled: true

// 3. 检查是否所有加密接口都需要加密
// 某些接口可能不需要加密
const [err, data] = await http.post('/api/public', params)  // 不加密
const [err2, data2] = await http.encrypt().post('/api/sensitive', params)  // 加密
```

### 5. 应用启动时请求失败提示 "应用初始化超时"

**问题原因：**
- 应用初始化流程未完成（获取租户信息等）
- 初始化超时时间太短
- 网络问题导致初始化失败

**解决方案：**

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 方式一：跳过初始化等待（用于初始化流程中的请求）
const getInitConfig = async () => {
  const [err, data] = await http.noAuth().skipWait().get('/system/config/init')
}

// 方式二：增加初始化等待超时时间
const normalRequest = async () => {
  const [err, data] = await http.get('/api/data', null, {
    initTimeout: 20000  // 20 秒
  })
}

// 方式三：检查初始化状态
import { waitForInit } from '@/composables/useAppInit'

const safeRequest = async () => {
  try {
    await waitForInit(15000)
    const [err, data] = await http.get('/api/data')
  } catch (e) {
    console.error('初始化失败，请重启应用')
  }
}
</script>
```

### 6. 微信小程序请求被拦截

**问题原因：**
- 请求域名未在微信后台配置
- 使用了 HTTP 而非 HTTPS
- 域名未备案

**解决方案：**

1. 在微信公众平台配置合法域名
   - 登录微信公众平台
   - 开发 → 开发设置 → 服务器域名
   - 添加 request 合法域名

2. 开发环境临时解决
   - 微信开发者工具 → 详情 → 本地设置
   - 勾选"不校验合法域名..."

3. 确保使用 HTTPS
   ```typescript
   // systemConfig.ts
   export const SystemConfig = {
     api: {
       baseUrl: 'https://api.example.com'  // 必须是 HTTPS
     }
   }
   ```

### 7. 如何获取完整的响应对象

**问题场景：**
需要获取响应头或状态码等信息。

**解决方案：**

```vue
<script lang="ts" setup>
import { http } from '@/composables/useHttp'

// 下载文件时可以获取完整响应
const downloadWithHeaders = async () => {
  const [err, res] = await http.download({
    url: '/api/download/file'
  })

  if (!err && res) {
    console.log('状态码:', res.statusCode)
    console.log('临时路径:', res.tempFilePath)
  }
}

// 对于普通请求，二进制数据会返回完整响应
const getBinaryData = async () => {
  const [err, res] = await http.get('/api/image/1', null, {
    responseType: 'arraybuffer'
  })

  // res 是完整的响应对象
}
</script>
```
