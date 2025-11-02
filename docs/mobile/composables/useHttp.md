# useHttp - HTTP 请求管理

## 介绍

`useHttp` 是 RuoYi-Plus-UniApp 提供的 HTTP 请求管理组合式函数,基于 UniApp 的网络请求 API 封装,提供了统一的请求/响应处理、错误处理、数据加密解密、认证授权、租户隔离等功能。它是应用与后端 API 交互的核心工具,简化了网络请求的开发工作。

通过 `useHttp`,开发者可以轻松实现链式调用、请求拦截、响应处理、自动重试、防重复提交、数据加密等复杂需求,无需手动处理繁琐的网络请求细节。

**核心特性:**

- **链式调用** - 支持 `.noAuth().encrypt().skipWait()` 等链式配置,代码更优雅
- **自动认证** - 自动添加 Token 和租户信息,无需手动设置请求头
- **数据加密** - 支持 AES + RSA 混合加密,保障数据传输安全
- **防重复提交** - 内置防抖机制,避免用户重复点击提交
- **错误处理** - 统一的错误处理机制,自动处理 401、超时等常见错误
- **类型安全** - 完整的 TypeScript 类型定义,支持泛型返回值
- **文件操作** - 内置 `upload` 和 `download` 方法,简化文件上传下载
- **国际化支持** - 自动添加语言头,支持多语言环境
- **请求 ID 追踪** - 自动生成请求 ID,便于日志追踪和问题排查
- **应用初始化等待** - 自动等待应用初始化完成(租户 ID 设置等),确保请求正确

**源码位置**: src/composables/useHttp.ts

参考: src/composables/useHttp.ts:1-730

## 核心概念

### 请求流程

`useHttp` 的完整请求流程包括以下步骤:

1. **等待应用初始化** - 确保租户 ID 等关键信息已设置(可选)
2. **构建请求选项** - 处理 URL、请求头、参数、认证信息等
3. **防重复提交检查** - POST/PUT 请求自动检查是否重复提交
4. **数据加密** - 根据配置对请求数据进行加密
5. **发送请求** - 调用 UniApp 的 `uni.request` 发送请求
6. **响应解密** - 自动解密加密的响应数据
7. **业务处理** - 根据响应状态码进行业务逻辑处理
8. **错误处理** - 统一处理网络错误、业务错误等

参考: src/composables/useHttp.ts:328-376

### 返回值格式

所有请求方法都返回 `Result<T>` 类型,这是一个元组 `[Error | null, T | null]`:

```typescript
// 成功时: [null, 数据]
const [error, data] = await http.get<User[]>('/api/users')
if (!error) {
  console.log(data) // User[] 类型
}

// 失败时: [Error, null]
const [error2, data2] = await http.post('/api/submit', formData)
if (error2) {
  console.error(error2.message)
}
```

这种模式避免了 try-catch 的使用,代码更简洁清晰。

参考: src/composables/useHttp.ts:417-455

### 链式配置

`useHttp` 支持链式调用配置,可以组合多个配置选项:

```typescript
// 单个配置
const [error, data] = await http.noAuth().post('/api/login', credentials)

// 多个配置组合
const [error2, data2] = await http
  .noAuth()
  .encrypt()
  .skipWait()
  .timeout(30000)
  .post('/api/register', userData)
```

**可用的链式方法:**

- `noAuth()` - 禁用认证(不添加 Token)
- `encrypt()` - 启用数据加密
- `noRepeatSubmit()` - 禁用防重复提交检查
- `noTenant()` - 禁用租户信息(不添加租户 ID)
- `skipWait()` - 跳过应用初始化等待
- `timeout(ms)` - 设置超时时间
- `config(cfg)` - 通用配置方法

参考: src/composables/useHttp.ts:579-663

## 基本用法

### 引入和初始化

使用默认的 `http` 实例或创建自定义实例:

```typescript
// 方式1: 使用默认实例(推荐)
import { http } from '@/composables/useHttp'

// 方式2: 创建自定义实例
import { useHttp } from '@/composables/useHttp'

const customHttp = useHttp({
  timeout: 30000,
  header: {
    'X-Custom-Header': 'value'
  }
})
```

**使用说明:**
- 默认实例 `http` 已经配置好所有必要的选项,可直接使用
- 自定义实例可用于特殊场景,如第三方 API 请求
- 实例配置会作为所有请求的默认配置

参考: src/composables/useHttp.ts:669

### GET 请求

使用 `get` 方法发送 GET 请求:

```vue
<template>
  <view class="user-list">
    <view v-if="loading">加载中...</view>
    <view v-else-if="error" class="error">
      {{ error.message }}
    </view>
    <view v-else>
      <view v-for="user in users" :key="user.id" class="user-item">
        <text>{{ user.name }}</text>
      </view>
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

const loading = ref(false)
const error = ref<Error | null>(null)
const users = ref<User[]>([])

onMounted(async () => {
  loading.value = true

  // 发送 GET 请求
  const [err, data] = await http.get<User[]>('/api/users')

  loading.value = false

  if (err) {
    error.value = err
    return
  }

  users.value = data
})
</script>
```

**使用说明:**
- 第一个参数: 请求 URL(相对路径或绝对路径)
- 第二个参数: 查询参数对象(可选)
- 第三个参数: 请求配置(可选)
- 返回值: `Result<T>` 元组,包含错误和数据

参考: src/composables/useHttp.ts:417-419

### 带参数的 GET 请求

传递查询参数有两种方式:

```vue
<template>
  <view class="search-results">
    <button @click="search">搜索</button>
    <view v-for="item in results" :key="item.id">
      {{ item.title }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface SearchResult {
  id: number
  title: string
}

const results = ref<SearchResult[]>([])

// 方式1: 通过第二个参数传递(推荐)
const search = async () => {
  const [error, data] = await http.get<SearchResult[]>('/api/search', {
    keyword: '搜索词',
    page: 1,
    size: 20
  })

  if (!error) {
    results.value = data
  }
}

// 方式2: 通过配置对象的 query/params 传递
const search2 = async () => {
  const [error, data] = await http.get<SearchResult[]>('/api/search', null, {
    query: {
      keyword: '搜索词',
      page: 1,
      size: 20
    }
  })

  if (!error) {
    results.value = data
  }
}

// 方式3: 直接在 URL 中拼接
const search3 = async () => {
  const [error, data] = await http.get<SearchResult[]>(
    '/api/search?keyword=搜索词&page=1&size=20'
  )

  if (!error) {
    results.value = data
  }
}
</script>
```

**使用说明:**
- 方式1 最简洁,参数会自动转换为查询字符串
- 方式2 适用于需要传递额外配置的场景
- 方式3 适用于参数简单或 URL 已经完整的场景
- 查询参数会自动进行 URL 编码

参考: src/composables/useHttp.ts:196-212

### POST 请求

使用 `post` 方法发送 POST 请求:

```vue
<template>
  <view class="create-user">
    <input v-model="formData.name" placeholder="姓名" />
    <input v-model="formData.email" placeholder="邮箱" />
    <button :disabled="submitting" @click="submitForm">
      {{ submitting ? '提交中...' : '提交' }}
    </button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface UserForm {
  name: string
  email: string
}

interface UserResponse {
  id: number
  name: string
  email: string
}

const submitting = ref(false)
const formData = ref<UserForm>({
  name: '',
  email: ''
})

const submitForm = async () => {
  submitting.value = true

  // 发送 POST 请求
  const [error, user] = await http.post<UserResponse>('/api/users', formData.value)

  submitting.value = false

  if (error) {
    uni.showToast({
      title: error.message,
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '创建成功',
    icon: 'success'
  })

  console.log('创建的用户:', user)
}
</script>
```

**使用说明:**
- 第一个参数: 请求 URL
- 第二个参数: 请求体数据(会自动转换为 JSON)
- 第三个参数: 请求配置(可选)
- POST 请求默认启用防重复提交检查

参考: src/composables/useHttp.ts:429-431

### PUT 请求

使用 `put` 方法发送 PUT 请求,用于更新数据:

```vue
<template>
  <view class="edit-user">
    <input v-model="userData.name" placeholder="姓名" />
    <input v-model="userData.email" placeholder="邮箱" />
    <button @click="updateUser">更新</button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  id: number
  name: string
  email: string
}

const userData = ref<User>({
  id: 123,
  name: '张三',
  email: 'zhangsan@example.com'
})

const updateUser = async () => {
  // 发送 PUT 请求
  const [error, updatedUser] = await http.put<User>(
    `/api/users/${userData.value.id}`,
    userData.value
  )

  if (error) {
    uni.showToast({
      title: '更新失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '更新成功',
    icon: 'success'
  })

  console.log('更新后的用户:', updatedUser)
}
</script>
```

**使用说明:**
- 与 POST 请求类似,但语义上表示更新操作
- 同样支持防重复提交检查
- URL 中通常包含要更新的资源 ID

参考: src/composables/useHttp.ts:441-443

### DELETE 请求

使用 `del` 方法发送 DELETE 请求:

```vue
<template>
  <view class="user-list">
    <view v-for="user in users" :key="user.id" class="user-item">
      <text>{{ user.name }}</text>
      <button @click="deleteUser(user.id)">删除</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: '用户1' },
  { id: 2, name: '用户2' }
])

const deleteUser = async (userId: number) => {
  // 确认删除
  const result = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认删除',
      content: '确定要删除这个用户吗?',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })

  if (!result) return

  // 发送 DELETE 请求
  const [error] = await http.del<void>(`/api/users/${userId}`)

  if (error) {
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    })
    return
  }

  // 从列表中移除
  users.value = users.value.filter(u => u.id !== userId)

  uni.showToast({
    title: '删除成功',
    icon: 'success'
  })
}
</script>
```

**使用说明:**
- 第一个参数: 请求 URL(通常包含要删除的资源 ID)
- 第二个参数: 查询参数(可选,某些 API 可能需要)
- 第三个参数: 请求配置(可选)
- 删除成功通常返回 `void`,只需检查是否有错误

参考: src/composables/useHttp.ts:453-455

## 高级用法

### 链式调用 - 禁用认证

对于不需要认证的请求(如登录、注册),使用 `noAuth()`:

```vue
<template>
  <view class="login">
    <input v-model="credentials.username" placeholder="用户名" />
    <input v-model="credentials.password" type="password" placeholder="密码" />
    <button @click="login">登录</button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  userInfo: {
    id: number
    username: string
  }
}

const credentials = ref<LoginCredentials>({
  username: '',
  password: ''
})

const login = async () => {
  // 登录请求不需要认证
  const [error, result] = await http
    .noAuth()
    .post<LoginResponse>('/api/login', credentials.value)

  if (error) {
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
    return
  }

  // 保存 token
  uni.setStorageSync('token', result.token)

  uni.showToast({
    title: '登录成功',
    icon: 'success'
  })

  // 跳转到首页
  uni.switchTab({ url: '/pages/index/index' })
}
</script>
```

**使用说明:**
- `noAuth()` 会阻止自动添加 Authorization 请求头
- 适用于登录、注册、获取验证码等公开接口
- 链式调用后会影响当前这一次请求

参考: src/composables/useHttp.ts:592-595

### 链式调用 - 数据加密

对于敏感数据,使用 `encrypt()` 启用加密:

```vue
<template>
  <view class="register">
    <input v-model="registerData.username" placeholder="用户名" />
    <input v-model="registerData.password" type="password" placeholder="密码" />
    <button @click="register">注册</button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface RegisterData {
  username: string
  password: string
  email: string
}

const registerData = ref<RegisterData>({
  username: '',
  password: '',
  email: ''
})

const register = async () => {
  // 注册请求使用加密传输
  const [error, result] = await http
    .noAuth()
    .encrypt()
    .post<{ id: number }>('/api/register', registerData.value)

  if (error) {
    uni.showToast({
      title: error.message,
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '注册成功,请登录',
    icon: 'success'
  })

  // 跳转到登录页
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>
```

**使用说明:**
- `encrypt()` 会对请求数据进行 AES 加密
- 加密 key 使用 RSA 加密后放在请求头中
- 响应数据也会自动解密
- 需要后端支持加密接口

**技术实现:**
1. 生成随机 AES 密钥
2. 使用 AES 加密请求数据
3. 使用 RSA 公钥加密 AES 密钥
4. 将加密的 AES 密钥放在 `encrypt-key` 请求头中
5. 响应数据使用同样的 AES 密钥解密

参考: src/composables/useHttp.ts:601-604

### 链式调用 - 跳过初始化等待

对于不需要租户信息的请求,使用 `skipWait()`:

```vue
<template>
  <view class="captcha">
    <image :src="captchaImage" mode="aspectFit" />
    <button @click="refreshCaptcha">刷新验证码</button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { http } from '@/composables/useHttp'

interface CaptchaResponse {
  uuid: string
  img: string
}

const captchaImage = ref('')
const captchaUuid = ref('')

const refreshCaptcha = async () => {
  // 获取验证码不需要等待应用初始化
  const [error, captcha] = await http
    .noAuth()
    .skipWait()
    .get<CaptchaResponse>('/api/captcha')

  if (error) {
    console.error('获取验证码失败:', error)
    return
  }

  captchaImage.value = captcha.img
  captchaUuid.value = captcha.uuid
}

onMounted(() => {
  refreshCaptcha()
})
</script>
```

**使用说明:**
- `skipWait()` 会跳过应用初始化等待
- 默认情况下,所有请求会等待租户 ID 等信息初始化完成
- 某些公开接口(如验证码、登录前的配置)不需要租户信息
- 可以提高这些接口的响应速度

参考: src/composables/useHttp.ts:628-631

### 链式调用 - 设置超时时间

使用 `timeout()` 设置请求超时时间:

```vue
<template>
  <view class="file-upload">
    <button @click="uploadLargeFile">上传大文件</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const uploadLargeFile = async () => {
  const filePath = 'temp/large-file.zip'

  // 大文件上传设置较长的超时时间(60秒)
  const [error, result] = await http
    .timeout(60000)
    .upload({
      url: '/api/upload/large',
      filePath,
      name: 'file'
    })

  if (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '上传成功',
    icon: 'success'
  })
}

// 或者对于快速接口设置较短超时
const quickRequest = async () => {
  const [error, data] = await http
    .timeout(5000)
    .get('/api/quick-data')

  if (error) {
    console.error('请求超时或失败:', error)
  }
}
</script>
```

**使用说明:**
- `timeout(ms)` 设置请求超时时间(毫秒)
- 默认超时时间为 50000ms (50秒)
- 超时后会触发错误处理,错误消息为"请求超时,请稍后重试"
- 根据接口特性设置合理的超时时间

参考: src/composables/useHttp.ts:637-640

### 链式调用 - 多个配置组合

可以组合多个链式配置:

```vue
<template>
  <view class="complex-request">
    <button @click="complexRequest">复杂请求</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const complexRequest = async () => {
  // 组合多个配置:
  // - 不需要认证
  // - 启用数据加密
  // - 禁用防重复提交
  // - 跳过初始化等待
  // - 设置 30 秒超时
  const [error, result] = await http
    .noAuth()
    .encrypt()
    .noRepeatSubmit()
    .skipWait()
    .timeout(30000)
    .post('/api/complex-operation', {
      data: 'complex data'
    })

  if (error) {
    console.error('请求失败:', error)
    return
  }

  console.log('请求成功:', result)
}

// 使用 config() 方法一次性配置
const configRequest = async () => {
  const [error, result] = await http
    .config({
      timeout: 30000,
      header: {
        auth: false,
        isEncrypt: true,
        repeatSubmit: false,
        tenant: false
      },
      skipWait: true
    })
    .post('/api/operation', { data: 'test' })

  if (error) {
    console.error('请求失败:', error)
  }
}
</script>
```

**使用说明:**
- 链式方法可以任意组合,顺序不影响结果
- 每个链式方法只影响当前这一次请求
- 请求完成后配置会被重置
- 使用 `config()` 可以一次性设置多个配置

参考: src/composables/useHttp.ts:579-663

### 禁用租户信息

某些接口不需要租户信息,使用 `noTenant()`:

```vue
<template>
  <view class="global-config">
    <button @click="getGlobalConfig">获取全局配置</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface GlobalConfig {
  appName: string
  version: string
  features: string[]
}

const getGlobalConfig = async () => {
  // 全局配置不区分租户
  const [error, config] = await http
    .noTenant()
    .get<GlobalConfig>('/api/config/global')

  if (error) {
    console.error('获取配置失败:', error)
    return
  }

  console.log('全局配置:', config)
}
</script>
```

**使用说明:**
- `noTenant()` 会阻止自动添加 `X-Tenant-Id` 请求头
- 适用于全局配置、系统公告等不区分租户的接口
- 多租户 SaaS 应用中常用

参考: src/composables/useHttp.ts:619-622

### 禁用防重复提交

某些场景需要允许快速重复提交,使用 `noRepeatSubmit()`:

```vue
<template>
  <view class="batch-operations">
    <button @click="batchSubmit">批量提交</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const batchSubmit = async () => {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]

  // 批量提交时禁用防重复提交检查
  const promises = items.map(item =>
    http.noRepeatSubmit().post('/api/items', item)
  )

  const results = await Promise.all(promises)

  const errors = results.filter(([error]) => error)

  if (errors.length > 0) {
    uni.showToast({
      title: `${errors.length} 个请求失败`,
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '全部提交成功',
    icon: 'success'
  })
}
</script>
```

**使用说明:**
- `noRepeatSubmit()` 禁用 500ms 内的防重复提交检查
- 适用于批量操作、轮询请求等场景
- 默认情况下 POST/PUT 请求会检查重复提交

参考: src/composables/useHttp.ts:610-613

## 文件操作

### 文件上传

使用 `upload` 方法上传文件:

```vue
<template>
  <view class="file-upload">
    <button @click="chooseAndUpload">选择并上传图片</button>
    <image v-if="uploadedUrl" :src="uploadedUrl" mode="aspectFit" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface UploadResponse {
  url: string
  filename: string
  size: number
}

const uploadedUrl = ref('')

const chooseAndUpload = async () => {
  // 1. 选择图片
  const chooseResult = await new Promise<string>((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths[0])
      },
      fail: reject
    })
  })

  // 2. 上传图片
  const [error, result] = await http.upload<UploadResponse>({
    url: '/api/upload/image',
    filePath: chooseResult,
    name: 'file',
    formData: {
      type: 'avatar',
      userId: '123'
    }
  })

  if (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    })
    return
  }

  uploadedUrl.value = result.url

  uni.showToast({
    title: '上传成功',
    icon: 'success'
  })
}
</script>
```

**使用说明:**
- `url`: 上传接口地址
- `filePath`: 本地文件路径
- `name`: 文件对应的表单字段名
- `formData`: 附加的表单数据(可选)
- 自动添加认证头和语言头
- 返回值类型通过泛型指定

参考: src/composables/useHttp.ts:467-520

### 带进度的文件上传

虽然当前代码中进度监听被注释,但可以这样实现:

```vue
<template>
  <view class="file-upload">
    <button @click="uploadWithProgress">上传文件</button>
    <progress :percent="uploadProgress" show-info />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useHttp } from '@/composables/useHttp'

const uploadProgress = ref(0)

const uploadWithProgress = async () => {
  const filePath = 'temp/large-file.pdf'

  // 注意: 当前实现不支持进度回调,需要直接使用 uni.uploadFile
  const uploadTask = uni.uploadFile({
    url: 'https://api.example.com/upload',
    filePath,
    name: 'file',
    success: (res) => {
      console.log('上传成功:', res)
    }
  })

  // 监听上传进度
  uploadTask.onProgressUpdate((res) => {
    uploadProgress.value = res.progress
    console.log('上传进度:', res.progress, '%')
  })
}
</script>
```

参考: src/composables/useHttp.ts:512-515

### 文件下载

使用 `download` 方法下载文件:

```vue
<template>
  <view class="file-download">
    <button @click="downloadFile">下载文件</button>
    <progress v-if="downloading" :percent="downloadProgress" show-info />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

const downloading = ref(false)
const downloadProgress = ref(0)

const downloadFile = async () => {
  downloading.value = true

  // 下载文件
  const [error, result] = await http.download({
    url: '/api/download/report.pdf',
    // 可选: 指定保存路径
    // filePath: `${uni.env.USER_DATA_PATH}/report.pdf`
  })

  downloading.value = false

  if (error) {
    uni.showToast({
      title: '下载失败',
      icon: 'none'
    })
    return
  }

  // 下载成功,打开文件
  uni.openDocument({
    filePath: result.tempFilePath,
    success: () => {
      console.log('打开文档成功')
    }
  })
}
</script>
```

**使用说明:**
- `url`: 下载接口地址
- `filePath`: 保存路径(可选,不指定则保存到临时目录)
- 自动添加认证头和语言头
- 返回值包含 `tempFilePath` 临时文件路径

参考: src/composables/useHttp.ts:530-577

### 多文件上传

上传多个文件需要逐个调用 `upload`:

```vue
<template>
  <view class="multi-upload">
    <button @click="chooseAndUploadMultiple">选择并上传多张图片</button>
    <view v-for="(url, index) in uploadedUrls" :key="index">
      <image :src="url" mode="aspectFit" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { http } from '@/composables/useHttp'

interface UploadResponse {
  url: string
}

const uploadedUrls = ref<string[]>([])

const chooseAndUploadMultiple = async () => {
  // 1. 选择多张图片
  const chooseResult = await new Promise<string[]>((resolve, reject) => {
    uni.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: reject
    })
  })

  // 2. 并发上传所有图片
  const uploadPromises = chooseResult.map(filePath =>
    http.upload<UploadResponse>({
      url: '/api/upload/image',
      filePath,
      name: 'file'
    })
  )

  const results = await Promise.all(uploadPromises)

  // 3. 处理结果
  const errors = results.filter(([error]) => error)

  if (errors.length > 0) {
    uni.showToast({
      title: `${errors.length} 张图片上传失败`,
      icon: 'none'
    })
  }

  const successUrls = results
    .filter(([error]) => !error)
    .map(([, data]) => data.url)

  uploadedUrls.value = successUrls

  uni.showToast({
    title: `成功上传 ${successUrls.length} 张图片`,
    icon: 'success'
  })
}
</script>
```

**使用说明:**
- UniApp 不支持一次上传多个文件
- 需要逐个调用 `upload` 方法
- 可以使用 `Promise.all` 并发上传提高效率
- 注意处理部分成功、部分失败的情况

参考: src/composables/useHttp.ts:467-520

## 错误处理

### 统一错误处理

所有请求的错误都会统一处理:

```vue
<template>
  <view class="data-fetching">
    <button @click="fetchData">获取数据</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

interface ApiData {
  id: number
  content: string
}

const fetchData = async () => {
  const [error, data] = await http.get<ApiData>('/api/data')

  // 1. 网络错误
  if (error && error.message.includes('网络连接失败')) {
    console.error('网络错误,请检查网络连接')
    return
  }

  // 2. 超时错误
  if (error && error.message.includes('请求超时')) {
    console.error('请求超时,请稍后重试')
    return
  }

  // 3. 业务错误
  if (error) {
    console.error('业务错误:', error.message)
    return
  }

  // 成功
  console.log('数据:', data)
}
</script>
```

**错误类型:**

- **网络错误**: "网络连接失败,请检查网络"
- **超时错误**: "请求超时,请稍后重试"
- **重复提交**: "数据正在处理,请勿重复提交"
- **解密失败**: "响应数据解密失败"
- **未登录**: "未登录或登陆已过期~"
- **请求取消**: "请求已取消"
- **初始化超时**: "应用初始化超时,请重试"
- **未知错误**: "网络错误"
- **业务错误**: 后端返回的具体错误消息

参考: src/composables/useHttp.ts:28-37, 306-325

### 401 未授权处理

当接口返回 401 状态码时,会自动处理:

```typescript
// 自动处理流程:
// 1. 显示 "未登录或登陆已过期~" 提示
// 2. 调用 userStore.logoutUser() 清除用户信息
// 3. 跳转到登录页,并传递当前页面路径作为 redirect 参数
// 4. 登录成功后自动跳转回原页面

// 开发者无需手动处理 401 错误
const [error, data] = await http.get('/api/protected-resource')

if (error && error.message.includes('未登录')) {
  // 此时已经自动跳转到登录页
  // 通常不需要额外处理
}
```

**技术实现:**
1. 响应拦截器检测状态码为 401
2. 检查是否已经在显示登录提示(防止重复)
3. 调用 `userStore.logoutUser()` 清除用户状态
4. 获取当前页面路径
5. 跳转到登录页: `/pages/auth/login?redirect=/current/page`
6. 显示 Toast 提示
7. 抛出错误,终止后续处理

参考: src/composables/useHttp.ts:87-103, 292-296

### 自定义错误处理

可以在请求配置中自定义错误处理:

```vue
<template>
  <view class="custom-error-handling">
    <button @click="requestWithCustomError">自定义错误处理</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const requestWithCustomError = async () => {
  const [error, data] = await http.get('/api/data')

  if (error) {
    // 根据错误消息自定义处理
    if (error.message.includes('网络')) {
      uni.showModal({
        title: '网络错误',
        content: '请检查您的网络连接后重试',
        showCancel: false
      })
    } else if (error.message.includes('超时')) {
      uni.showModal({
        title: '请求超时',
        content: '服务器响应较慢,请稍后重试',
        showCancel: false
      })
    } else {
      // 其他错误
      uni.showModal({
        title: '操作失败',
        content: error.message,
        showCancel: false
      })
    }
    return
  }

  // 成功处理
  console.log('数据:', data)
}
</script>
```

参考: src/composables/useHttp.ts:306-325

### 防重复提交错误

快速重复提交会触发防重复提交错误:

```vue
<template>
  <view class="submit-form">
    <button @click="submitForm">提交</button>
  </view>
</template>

<script lang="ts" setup>
import { http } from '@/composables/useHttp'

const submitForm = async () => {
  const formData = { name: 'test' }

  const [error, result] = await http.post('/api/submit', formData)

  if (error) {
    // 检查是否是重复提交错误
    if (error.message.includes('重复提交')) {
      console.log('用户点击过快,请稍后再试')
      // 通常不需要显示错误,因为是用户误操作
      return
    }

    // 其他错误正常处理
    uni.showToast({
      title: error.message,
      icon: 'none'
    })
    return
  }

  console.log('提交成功:', result)
}
</script>
```

**防重复提交机制:**
- 对于 POST/PUT 请求,自动检查 500ms 内是否有相同的请求
- 相同请求定义: URL 和请求数据完全相同
- 触发条件: 500ms 内发起相同请求
- 可以使用 `noRepeatSubmit()` 禁用此功能

参考: src/composables/useHttp.ts:70-82, 236-240

## 请求配置

### CustomRequestOptions 接口

所有请求方法都接受 `CustomRequestOptions` 配置对象:

```typescript
interface CustomRequestOptions {
  // 基础配置
  timeout?: number                    // 超时时间(毫秒)
  header?: Record<string, any>        // 请求头
  dataType?: string                   // 数据类型
  responseType?: string               // 响应类型

  // 自定义配置
  query?: Record<string, any>         // 查询参数(同 params)
  params?: Record<string, any>        // 查询参数(同 query)
  skipWait?: boolean                  // 跳过初始化等待
  initTimeout?: number                // 初始化超时时间

  // 请求头特殊配置
  header?: {
    auth?: boolean                    // 是否需要认证(默认 true)
    tenant?: boolean                  // 是否需要租户信息(默认 true)
    isEncrypt?: boolean               // 是否加密(默认 false)
    repeatSubmit?: boolean            // 是否检查重复提交(默认 true)
    [key: string]: any                // 其他自定义请求头
  }
}
```

**使用示例:**

```typescript
// 完整配置示例
const [error, data] = await http.post('/api/submit', formData, {
  timeout: 30000,
  header: {
    auth: true,
    tenant: true,
    isEncrypt: true,
    repeatSubmit: false,
    'X-Custom-Header': 'custom-value'
  },
  query: {
    page: 1,
    size: 20
  },
  skipWait: false,
  initTimeout: 10000
})
```

参考: src/composables/useHttp.ts:2

### 请求头配置

请求头会自动添加以下信息:

```typescript
// 自动添加的请求头
{
  'Content-Type': 'application/json;charset=utf-8',  // 内容类型
  'Content-Language': 'zh-CN',                       // 语言(自动获取)
  'X-Request-Id': '20250925142636001',               // 请求ID(自动生成)
  'Authorization': 'Bearer <token>',                 // 认证令牌(如果已登录)
  'X-Tenant-Id': '<tenant-id>',                      // 租户ID(如果有)
  'encrypt-key': '<encrypted-aes-key>',              // 加密密钥(如果启用加密)
  ...customHeaders                                   // 自定义请求头
}
```

**请求 ID 格式:**
- 格式: `yyyyMMddHHmmssSSS`
- 示例: `20250925142636001`
- 用途: 日志追踪、问题排查

参考: src/composables/useHttp.ts:214-233, 59-61

### URL 处理

URL 会自动处理:

```typescript
// 1. 相对路径自动添加 baseUrl
'/api/users' => 'https://api.example.com/api/users'

// 2. 绝对路径保持不变
'https://other-api.com/data' => 'https://other-api.com/data'

// 3. 查询参数自动拼接
url: '/api/search'
params: { keyword: '测试', page: 1 }
=> '/api/search?keyword=%E6%B5%8B%E8%AF%95&page=1'

// 4. 已有查询参数自动追加
url: '/api/search?type=user'
params: { keyword: '测试' }
=> '/api/search?type=user&keyword=%E6%B5%8B%E8%AF%95'
```

参考: src/composables/useHttp.ts:191-212

## API 文档

### useHttp 方法

```typescript
const useHttp: (defaultConfig?: CustomRequestOptions) => HttpInstance
```

**说明**: 创建 HTTP 请求实例

**参数**:
- `defaultConfig` (可选) - 默认请求配置,会应用到所有请求

**返回值**: `HttpInstance` 对象,包含所有请求方法

**使用示例**:

```typescript
// 创建自定义实例
const customHttp = useHttp({
  timeout: 30000,
  header: {
    'X-App-Version': '1.0.0'
  }
})
```

参考: src/composables/useHttp.ts:388-666

### HttpInstance 方法

#### get

```typescript
const get: <T = any>(
  url: string,
  params?: any,
  config?: CustomRequestOptions
) => Result<T>
```

**说明**: 发送 GET 请求

**参数**:
- `url` - 请求 URL
- `params` (可选) - 查询参数对象
- `config` (可选) - 请求配置

**返回值**: `` `Result<T>` `` - `[Error | null, T | null]` 元组

**使用示例**:

```typescript
const [error, users] = await http.get<User[]>('/api/users')
const [error2, user] = await http.get<User>('/api/users/123')
const [error3, list] = await http.get<User[]>('/api/users', { page: 1, size: 20 })
```

参考: src/composables/useHttp.ts:417-419

#### post

```typescript
const post: <T = any>(
  url: string,
  data?: any,
  config?: CustomRequestOptions
) => Result<T>
```

**说明**: 发送 POST 请求

**参数**:
- `url` - 请求 URL
- `data` (可选) - 请求体数据
- `config` (可选) - 请求配置

**返回值**: `` `Result<T>` `` - `[Error | null, T | null]` 元组

**使用示例**:

```typescript
const [error, user] = await http.post<User>('/api/users', { name: '张三' })
const [error2, result] = await http.post('/api/submit', formData)
```

参考: src/composables/useHttp.ts:429-431

#### put

```typescript
const put: <T = any>(
  url: string,
  data?: any,
  config?: CustomRequestOptions
) => Result<T>
```

**说明**: 发送 PUT 请求

**参数**:
- `url` - 请求 URL
- `data` (可选) - 请求体数据
- `config` (可选) - 请求配置

**返回值**: `` `Result<T>` `` - `[Error | null, T | null]` 元组

**使用示例**:

```typescript
const [error, user] = await http.put<User>('/api/users/123', { name: '李四' })
```

参考: src/composables/useHttp.ts:441-443

#### del

```typescript
const del: <T = any>(
  url: string,
  params?: any,
  config?: CustomRequestOptions
) => Result<T>
```

**说明**: 发送 DELETE 请求

**参数**:
- `url` - 请求 URL
- `params` (可选) - 查询参数
- `config` (可选) - 请求配置

**返回值**: `` `Result<T>` `` - `[Error | null, T | null]` 元组

**使用示例**:

```typescript
const [error] = await http.del<void>('/api/users/123')
const [error2] = await http.del('/api/users', { ids: [1, 2, 3] })
```

参考: src/composables/useHttp.ts:453-455

#### upload

```typescript
const upload: <T = any>(
  uploadConfig: UniApp.UploadFileOption & CustomRequestOptions
) => Result<T>
```

**说明**: 上传文件

**参数**:
- `uploadConfig` - 上传配置,包含:
  - `url` - 上传接口 URL
  - `filePath` - 本地文件路径
  - `name` - 文件对应的表单字段名
  - `formData` (可选) - 附加的表单数据
  - 其他 `UniApp.UploadFileOption` 配置

**返回值**: `` `Result<T>` `` - `[Error | null, T | null]` 元组

**使用示例**:

```typescript
const [error, result] = await http.upload<UploadResponse>({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: { type: 'avatar' }
})
```

参考: src/composables/useHttp.ts:467-520

#### download

```typescript
const download: (
  downloadConfig: UniApp.DownloadFileOption & CustomRequestOptions
) => Result<UniApp.DownloadSuccessData>
```

**说明**: 下载文件

**参数**:
- `downloadConfig` - 下载配置,包含:
  - `url` - 下载接口 URL
  - `filePath` (可选) - 保存路径
  - 其他 `UniApp.DownloadFileOption` 配置

**返回值**: `` `Result<UniApp.DownloadSuccessData>` `` - `[Error | null, DownloadSuccessData | null]` 元组

**使用示例**:

```typescript
const [error, result] = await http.download({
  url: '/api/download/file.pdf'
})

if (!error) {
  console.log('文件路径:', result.tempFilePath)
}
```

参考: src/composables/useHttp.ts:530-577

#### request

```typescript
const request: <T = any>(
  config: CustomRequestOptions & {
    url: string
    method: UniApp.RequestOptions['method']
  }
) => Result<T>
```

**说明**: 通用请求方法

**参数**:
- `config` - 请求配置,必须包含 `url` 和 `method`

**返回值**: `` `Result<T>` `` - `[Error | null, T | null]` 元组

**使用示例**:

```typescript
const [error, data] = await http.request<User>({
  url: '/api/users/123',
  method: 'GET'
})

const [error2, result] = await http.request({
  url: '/api/submit',
  method: 'POST',
  data: { name: '张三' },
  timeout: 30000
})
```

参考: src/composables/useHttp.ts:649-654

### 链式方法

#### config

```typescript
const config: (cfg: CustomRequestOptions) => HttpInstance
```

**说明**: 通用配置方法

**参数**:
- `cfg` - 请求配置对象

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, data] = await http.config({
  timeout: 20000,
  header: { auth: false }
}).post('/api/data', payload)
```

参考: src/composables/useHttp.ts:583-586

#### noAuth

```typescript
const noAuth: () => HttpInstance
```

**说明**: 禁用认证(不添加 Authorization 头)

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, result] = await http.noAuth().post('/api/login', credentials)
```

参考: src/composables/useHttp.ts:592-595

#### encrypt

```typescript
const encrypt: () => HttpInstance
```

**说明**: 启用数据加密

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, result] = await http.encrypt().post('/api/sensitive', data)
```

参考: src/composables/useHttp.ts:601-604

#### noRepeatSubmit

```typescript
const noRepeatSubmit: () => HttpInstance
```

**说明**: 禁用防重复提交检查

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, result] = await http.noRepeatSubmit().post('/api/batch', items)
```

参考: src/composables/useHttp.ts:610-613

#### noTenant

```typescript
const noTenant: () => HttpInstance
```

**说明**: 禁用租户信息(不添加 X-Tenant-Id 头)

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, config] = await http.noTenant().get('/api/global-config')
```

参考: src/composables/useHttp.ts:619-622

#### skipWait

```typescript
const skipWait: () => HttpInstance
```

**说明**: 跳过应用初始化等待

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, captcha] = await http.skipWait().get('/api/captcha')
```

参考: src/composables/useHttp.ts:628-631

#### timeout

```typescript
const timeout: (ms: number) => HttpInstance
```

**说明**: 设置超时时间

**参数**:
- `ms` - 超时时间(毫秒)

**返回值**: `HttpInstance` - 支持继续链式调用

**使用示例**:

```typescript
const [error, data] = await http.timeout(60000).get('/api/large-data')
```

参考: src/composables/useHttp.ts:637-640

### 常量

```typescript
// HTTP 状态码
const HttpCode = {
  SUCCESS: 200,
  UNAUTHORIZED: 401
} as const

// 错误消息
const ErrorMsg = {
  NETWORK: '网络连接失败,请检查网络',
  TIMEOUT: '请求超时,请稍后重试',
  REPEAT_SUBMIT: '数据正在处理,请勿重复提交',
  DECRYPT_FAILED: '响应数据解密失败',
  SESSION_EXPIRED: '未登录或登陆已过期~',
  REQUEST_CANCELED: '请求已取消',
  INIT_TIMEOUT: '应用初始化超时,请重试',
  UNKNOWN: '网络错误'
} as const

// 加密请求头名称
const ENCRYPT_HEADER = 'encrypt-key'

// 请求 ID 请求头名称
const REQUEST_ID_HEADER = 'X-Request-Id'
```

参考: src/composables/useHttp.ts:22-43

## 最佳实践

### 1. 使用 Result 元组解构

始终使用元组解构接收请求结果,避免 try-catch:

```typescript
// ✅ 推荐: 使用元组解构
const [error, users] = await http.get<User[]>('/api/users')

if (error) {
  console.error('请求失败:', error.message)
  return
}

console.log('用户列表:', users)

// ❌ 不推荐: 使用 try-catch
try {
  const users = await http.get<User[]>('/api/users')
  console.log(users)
} catch (error) {
  console.error(error)
}
```

**优势**:
- 代码更简洁,无需 try-catch 块
- 错误处理更明确
- 类型推断更准确

### 2. 指定泛型类型

始终为请求指定返回值类型,提高类型安全:

```typescript
// ✅ 推荐: 指定泛型类型
interface User {
  id: number
  name: string
  email: string
}

const [error, users] = await http.get<User[]>('/api/users')
// users 的类型是 User[]

// ❌ 不推荐: 不指定类型
const [error2, users2] = await http.get('/api/users')
// users2 的类型是 any
```

### 3. 链式调用代替配置对象

对于简单配置,使用链式调用更简洁:

```typescript
// ✅ 推荐: 链式调用
const [error, result] = await http
  .noAuth()
  .encrypt()
  .post('/api/login', credentials)

// ❌ 不推荐: 配置对象(过于冗长)
const [error2, result2] = await http.post('/api/login', credentials, {
  header: {
    auth: false,
    isEncrypt: true
  }
})
```

### 4. 公开接口使用自定义实例

对于不需要认证的接口,创建专用实例:

```typescript
// ✅ 推荐: 创建公开接口实例
const publicHttp = useHttp({
  header: {
    auth: false
  }
})

// 所有公开接口都使用这个实例
const [error, captcha] = await publicHttp.get('/api/captcha')
const [error2, config] = await publicHttp.get('/api/config')

// ❌ 不推荐: 每次都调用 noAuth()
const [error3, captcha2] = await http.noAuth().get('/api/captcha')
const [error4, config2] = await http.noAuth().get('/api/config')
```

### 5. 统一错误提示处理

创建统一的错误提示函数:

```typescript
// utils/error.ts
export const showError = (error: Error | null) => {
  if (!error) return

  let title = error.message

  // 自定义错误消息
  if (title.includes('网络')) {
    title = '网络连接失败'
  } else if (title.includes('超时')) {
    title = '请求超时'
  } else if (title.includes('重复提交')) {
    // 重复提交不显示提示
    return
  }

  uni.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}

// 组件中使用
import { showError } from '@/utils/error'

const [error, data] = await http.get('/api/data')
showError(error)

if (!error) {
  console.log('数据:', data)
}
```

### 6. 合理设置超时时间

根据接口特性设置合理的超时时间:

```typescript
// ✅ 推荐: 根据接口特性设置
// 快速接口 - 5秒超时
const [error1, data1] = await http.timeout(5000).get('/api/quick')

// 普通接口 - 使用默认 50 秒
const [error2, data2] = await http.get('/api/normal')

// 文件上传 - 60秒超时
const [error3, result3] = await http.timeout(60000).upload({...})

// ❌ 不推荐: 所有接口都用相同超时时间
```

### 7. 批量请求使用 Promise.all

需要并发多个请求时,使用 `Promise.all`:

```typescript
// ✅ 推荐: 并发请求
const [
  [error1, users],
  [error2, roles],
  [error3, permissions]
] = await Promise.all([
  http.get<User[]>('/api/users'),
  http.get<Role[]>('/api/roles'),
  http.get<Permission[]>('/api/permissions')
])

// 检查错误
if (error1 || error2 || error3) {
  console.error('部分请求失败')
  return
}

// ❌ 不推荐: 串行请求(速度慢)
const [error1, users] = await http.get<User[]>('/api/users')
const [error2, roles] = await http.get<Role[]>('/api/roles')
const [error3, permissions] = await http.get<Permission[]>('/api/permissions')
```

**注意**: 批量操作(如批量提交)需要禁用防重复提交:

```typescript
const promises = items.map(item =>
  http.noRepeatSubmit().post('/api/submit', item)
)

const results = await Promise.all(promises)
```

## 常见问题

### 1. 请求返回 401 自动跳转登录页

**问题原因**:
- Token 过期或无效
- 后端接口返回 401 状态码
- 自动触发登录页跳转

**解决方案**:

这是正常的安全机制,无需额外处理。如果需要自定义行为,可以在请求前检查 Token:

```typescript
import { useUserStore } from '@/stores/user'
import { http } from '@/composables/useHttp'

const userStore = useUserStore()

// 检查 Token 是否有效
if (!userStore.token) {
  uni.showToast({
    title: '请先登录',
    icon: 'none'
  })
  uni.navigateTo({ url: '/pages/login/index' })
  return
}

// Token 有效,发送请求
const [error, data] = await http.get('/api/protected-resource')
```

参考: src/composables/useHttp.ts:87-103

### 2. 加密请求失败

**问题原因**:
- 后端未开启加密支持
- RSA 公钥配置错误
- 加密算法不匹配

**解决方案**:

```typescript
// 1. 检查系统配置中是否开启了加密
// src/systemConfig.ts
export const SystemConfig = {
  security: {
    apiEncrypt: true  // 确保开启
  }
}

// 2. 检查 RSA 公钥配置
// src/utils/rsa.ts
const PUBLIC_KEY = '...' // 确保与后端一致

// 3. 确认后端支持加密
const [error, result] = await http.encrypt().post('/api/login', credentials)

if (error && error.message.includes('解密失败')) {
  console.error('加密配置错误,请检查公钥和后端配置')
}
```

参考: src/composables/useHttp.ts:106-137

### 3. 文件上传失败

**问题原因**:
- 文件路径错误
- 文件大小超限
- 表单字段名不匹配
- 后端接口配置错误

**解决方案**:

```typescript
// 1. 确保文件路径正确
uni.chooseImage({
  count: 1,
  success: async (res) => {
    const filePath = res.tempFilePaths[0]

    // 检查文件是否存在
    uni.getFileInfo({
      filePath,
      success: (info) => {
        console.log('文件大小:', info.size, '字节')

        // 检查文件大小(例如限制 5MB)
        if (info.size > 5 * 1024 * 1024) {
          uni.showToast({
            title: '文件大小不能超过 5MB',
            icon: 'none'
          })
          return
        }

        // 上传文件
        uploadFile(filePath)
      },
      fail: (err) => {
        console.error('文件不存在:', err)
      }
    })
  }
})

const uploadFile = async (filePath: string) => {
  // 2. 确认表单字段名与后端一致
  const [error, result] = await http.upload({
    url: '/api/upload',
    filePath,
    name: 'file',  // 与后端 @RequestParam("file") 一致
    formData: {
      type: 'image'
    }
  })

  if (error) {
    console.error('上传失败:', error.message)

    // 3. 检查具体错误
    if (error.message.includes('400')) {
      console.error('参数错误,检查表单字段名')
    } else if (error.message.includes('413')) {
      console.error('文件过大')
    } else if (error.message.includes('415')) {
      console.error('文件类型不支持')
    }
    return
  }

  console.log('上传成功:', result)
}
```

参考: src/composables/useHttp.ts:467-520

### 4. 请求初始化超时

**问题原因**:
- 应用初始化时间过长
- 租户 ID 获取失败
- 默认超时时间(10秒)不够

**解决方案**:

```typescript
// 方式1: 增加初始化超时时间
const [error, data] = await http.get('/api/data', null, {
  initTimeout: 20000  // 增加到 20 秒
})

// 方式2: 跳过初始化等待(适用于不需要租户信息的接口)
const [error2, config] = await http
  .skipWait()
  .get('/api/global-config')

// 方式3: 确保应用初始化正常完成
// 检查 app.vue 中的初始化逻辑
import { useAppInit } from '@/composables/useAppInit'

onLaunch(async () => {
  await useAppInit()  // 确保初始化完成
})
```

参考: src/composables/useHttp.ts:158-174

### 5. 租户 ID 未添加到请求头

**问题原因**:
- 租户 ID 未正确设置
- 请求配置中禁用了租户信息
- 应用初始化未完成

**解决方案**:

```typescript
import { getTenantId } from '@/utils/tenant'
import { http } from '@/composables/useHttp'

// 1. 检查租户 ID 是否已设置
const tenantId = getTenantId()
console.log('当前租户 ID:', tenantId)

if (!tenantId) {
  console.error('租户 ID 未设置')
  // 检查应用初始化逻辑
}

// 2. 确认请求未禁用租户信息
const [error, data] = await http.get('/api/data')
// ✅ 正确: 会自动添加租户 ID

const [error2, data2] = await http.noTenant().get('/api/data')
// ❌ 禁用了租户信息

// 3. 等待初始化完成
const [error3, data3] = await http.get('/api/data', null, {
  skipWait: false  // 确保等待初始化(默认值)
})
```

参考: src/composables/useHttp.ts:227-233

---

通过合理使用 `useHttp` 组合式函数,可以轻松实现复杂的网络请求需求,构建高效、安全、可维护的应用。

参考: src/composables/useHttp.ts:1-730
