# useToken Token 管理

## 功能概述

`useToken` 是一个专注于用户认证令牌（Token）管理的组合式函数，基于封装的 `localCache` 工具实现 Token 的本地持久化管理。该模块提供 Token 的存取、删除、过期管理以及认证头部生成等功能，是整个应用认证体系的基础设施层。

**核心特性：**

- **安全存储** - 基于 localStorage 的持久化存储，支持应用级隔离
- **过期管理** - 支持设置 Token 过期时间，系统自动清理过期令牌
- **自动前缀** - 所有缓存键自动添加应用 ID 前缀，避免多应用冲突
- **认证头部** - 自动生成标准 Bearer Token 格式的认证头部
- **查询字符串** - 支持生成 URL 编码的认证查询参数
- **类型安全** - 完整的 TypeScript 类型支持

## 架构设计

### 模块架构图

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Token 管理架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  useHttp    │  │ useUserStore│  │  useSSE     │  │  useWS  │ │
│  │  HTTP请求   │  │  用户状态   │  │  SSE推送    │  │ WebSocket│ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
│         │                │                │              │       │
│         ▼                ▼                ▼              ▼       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       useToken                             │  │
│  │  ┌───────────────────────────────────────────────────┐    │  │
│  │  │  getToken    │  setToken   │  removeToken          │    │  │
│  │  │  获取Token   │  设置Token  │  移除Token            │    │  │
│  │  ├───────────────────────────────────────────────────┤    │  │
│  │  │  getAuthHeaders          │  getAuthQuery           │    │  │
│  │  │  获取认证头部(Object)    │  获取认证查询(String)   │    │  │
│  │  └───────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      localCache                            │  │
│  │                   (localStorage 封装)                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  • 自动添加应用前缀 (appId:key)                      │  │  │
│  │  │  • 支持过期时间管理 (_expire 字段)                   │  │  │
│  │  │  • 自动清理过期数据 (每小时清理)                     │  │  │
│  │  │  • 存储空间统计 (getStats)                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    localStorage                            │  │
│  │              (浏览器本地存储 - 5MB限制)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 数据存储格式

Token 在 localStorage 中的实际存储格式：

```typescript
// 存储键格式
`${appId}:token`

// 存储值格式（CacheWrapper）
{
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "_expire": 1703145600000  // 过期时间戳（毫秒），可选
}
```

### 认证流程

```text
┌────────────┐      ┌────────────┐      ┌────────────┐
│  用户登录   │ ───▶ │  设置Token │ ───▶ │  持久化    │
│ loginUser  │      │  setToken  │      │ localStorage│
└────────────┘      └────────────┘      └────────────┘
                          │
                          ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│  API请求   │ ◀─── │  获取Token │ ◀─── │  读取缓存  │
│  useHttp   │      │ getToken   │      │ localStorage│
└────────────┘      └────────────┘      └────────────┘
       │
       ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│  请求头部  │ ◀─── │ 生成认证头 │ ◀─── │  Token值   │
│  headers   │      │getAuthHeaders│    │   Bearer   │
└────────────┘      └────────────┘      └────────────┘
```

## 基础实现

### 源码分析

```typescript
import { objectToQuery } from '@/utils/object'
import { localCache } from '@/utils/cache'

/**
 * Token 管理钩子 (useToken)
 *
 * 基于封装的 cache 工具实现 token 的本地持久化管理。
 *
 * 包含以下功能:
 * - 获取 Token: 获取当前存储的 token (getToken)
 * - 设置 Token: 设置并持久化新的 token (setToken)
 * - 移除 Token: 清除存储的 token (removeToken)
 * - 认证头部: 获取认证头部的不同格式 (getAuthHeaders, getAuthQuery)
 */
export const useToken = () => {
  /**
   * Token 缓存键名
   */
  const TOKEN_KEY = 'token'

  /**
   * 获取 token
   * @returns 当前存储的 token
   */
  const getToken = (): string | null => {
    return localCache.get(TOKEN_KEY)
  }

  /**
   * 设置 token
   * @param accessToken 要存储的 token
   * @param expireSeconds 过期时间（秒），不传则永不过期
   */
  const setToken = (accessToken: string, expireSeconds?: number): void => {
    localCache.set(TOKEN_KEY, accessToken, expireSeconds)
  }

  /**
   * 移除 token
   */
  const removeToken = (): void => {
    localCache.remove(TOKEN_KEY)
  }

  /**
   * 获取认证头部 (Record 格式)
   * @returns 认证头部对象，如果没有 token 则返回空对象
   */
  const getAuthHeaders = (): Record<string, string> => {
    const tokenValue = getToken()
    if (!tokenValue) {
      return {}
    }

    return {
      Authorization: `Bearer ${tokenValue}`
    }
  }

  /**
   * 获取认证头部 (查询字符串格式)
   * @returns 认证头部的查询字符串，如果没有 token 则返回空字符串
   */
  const getAuthQuery = (): string => {
    const headers = getAuthHeaders()
    return objectToQuery(headers)
  }

  return {
    getToken,
    setToken,
    removeToken,
    getAuthHeaders,
    getAuthQuery
  }
}
```

### 缓存层实现

`useToken` 依赖的 `localCache` 缓存工具核心实现：

```typescript
// 缓存键前缀，防止多应用冲突
const KEY_PREFIX = `${SystemConfig.app.id}:`

/**
 * 数据包装器，用于本地缓存支持过期时间
 */
interface CacheWrapper<T = any> {
  data: T
  _expire?: number // 过期时间戳（毫秒）
}

/**
 * 设置本地缓存
 * @param key 缓存键（自动添加应用ID前缀）
 * @param value 缓存值
 * @param expireSeconds 过期时间（秒），不传则永不过期
 */
set<T>(key: string, value: T, expireSeconds?: number): void {
  if (!localStorage || key == null || value == null) {
    return
  }
  try {
    const prefixedKey = getPrefixedKey(key)
    const wrapper: CacheWrapper<T> = {
      data: value,
      _expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined
    }
    localStorage.setItem(prefixedKey, JSON.stringify(wrapper))
  } catch (e) {
    console.error('缓存设置失败:', e)
  }
}

/**
 * 获取本地缓存
 * @param key 缓存键（自动添加应用ID前缀）
 * @returns 缓存值或 null（过期或无效数据返回 null）
 */
get<T = any>(key: string): T | null {
  if (!localStorage || key == null) {
    return null
  }
  try {
    const prefixedKey = getPrefixedKey(key)
    const value = localStorage.getItem(prefixedKey)
    if (value == null) {
      return null
    }
    const wrapper: CacheWrapper<T> = JSON.parse(value)
    if (!wrapper || typeof wrapper !== 'object') {
      this.remove(key)
      return null
    }
    // 检查是否过期
    if (wrapper._expire && wrapper._expire < Date.now()) {
      this.remove(key)
      return null
    }
    return wrapper.data as T
  } catch (e) {
    console.error(`缓存获取失败 [${key}]:`, e)
    this.remove(key)
    return null
  }
}
```

## API 详解

### getToken - 获取 Token

获取当前存储的认证令牌。

```typescript
const getToken = (): string | null
```

**返回值：**
- `string` - Token 字符串（未过期时）
- `null` - Token 不存在或已过期

**使用示例：**

```typescript
import { useToken } from '@/composables/useToken'

const { getToken } = useToken()

// 基本使用
const token = getToken()
console.log('当前Token:', token)
// 返回: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 或 null

// 检查登录状态
const isLoggedIn = !!getToken()

// 条件判断
if (getToken()) {
  console.log('用户已登录')
} else {
  console.log('用户未登录，需要跳转到登录页')
}
```

**技术要点：**
- 自动检查 Token 是否过期
- 过期时自动清除缓存并返回 null
- 损坏的缓存数据会被自动清理

### setToken - 设置 Token

设置并持久化新的认证令牌。

```typescript
const setToken = (accessToken: string, expireSeconds?: number): void
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `accessToken` | `string` | 是 | 要存储的 Token 字符串 |
| `expireSeconds` | `number` | 否 | 过期时间（秒），不传则永不过期 |

**使用示例：**

```typescript
import { useToken } from '@/composables/useToken'

const { setToken } = useToken()

// 永久存储（不推荐用于生产环境）
setToken('your-access-token')

// 设置 2 小时后过期（7200秒）
setToken('your-access-token', 7200)

// 设置 1 天后过期（86400秒）
setToken('your-access-token', 24 * 60 * 60)

// 设置 7 天后过期
setToken('your-access-token', 7 * 24 * 60 * 60)

// 根据后端返回的过期时间设置
const loginResponse = {
  access_token: 'eyJhbGciOiJIUzI1NiIs...',
  expire_in: 7200 // 后端返回的过期秒数
}
setToken(loginResponse.access_token, loginResponse.expire_in)
```

**技术要点：**
- 过期时间为相对时间（秒），会自动转换为绝对时间戳存储
- 实际存储格式：`{ data: token, _expire: timestamp }`
- 空值检查：accessToken 为空时不执行存储

### removeToken - 移除 Token

清除存储的认证令牌。

```typescript
const removeToken = (): void
```

**使用示例：**

```typescript
import { useToken } from '@/composables/useToken'

const { removeToken, getToken } = useToken()

// 基本使用
removeToken()
console.log(getToken()) // null

// 用户登出时清除
const handleLogout = async () => {
  // 调用登出 API
  await logoutApi()

  // 清除本地 Token
  removeToken()

  // 跳转到登录页
  router.push('/login')
}
```

**技术要点：**
- 从 localStorage 中完全移除 Token
- 调用后 `getToken()` 返回 null
- 不会影响其他缓存数据

### getAuthHeaders - 获取认证头部

获取认证头部对象格式，适用于 HTTP 请求。

```typescript
const getAuthHeaders = (): Record<string, string>
```

**返回值：**
- Token 存在时：`{ Authorization: 'Bearer token123' }`
- Token 不存在时：`{}`

**使用示例：**

```typescript
import { useToken } from '@/composables/useToken'
import axios from 'axios'

const { getAuthHeaders } = useToken()

// 基本使用
const headers = getAuthHeaders()
console.log(headers)
// 有Token: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIs...' }
// 无Token: {}

// 在 HTTP 请求中使用
const fetchUserInfo = async () => {
  const response = await axios.get('/api/user/info', {
    headers: {
      ...getAuthHeaders()
    }
  })
  return response.data
}

// 与其他头部合并
const customRequest = async () => {
  const response = await axios.post('/api/data', data, {
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'value',
      ...getAuthHeaders()
    }
  })
  return response.data
}
```

**技术要点：**
- 使用标准 Bearer Token 格式
- 返回空对象时不影响请求头合并
- 实时读取 Token，确保获取最新值

### getAuthQuery - 获取认证查询字符串

获取认证头部的查询字符串格式，适用于 URL 参数或 WebSocket 连接。

```typescript
const getAuthQuery = (): string
```

**返回值：**
- Token 存在时：`"Authorization=Bearer%20token123"`
- Token 不存在时：`""`

**使用示例：**

```typescript
import { useToken } from '@/composables/useToken'

const { getAuthQuery } = useToken()

// 基本使用
const queryString = getAuthQuery()
console.log(queryString)
// 有Token: "Authorization=Bearer%20eyJhbGciOiJIUzI1NiIs..."
// 无Token: ""

// WebSocket 连接中使用
const connectWebSocket = () => {
  const authQuery = getAuthQuery()
  const wsUrl = authQuery
    ? `wss://api.example.com/ws?${authQuery}`
    : 'wss://api.example.com/ws'

  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket 连接已建立')
  }

  return ws
}

// SSE 连接中使用
const connectSSE = () => {
  const authQuery = getAuthQuery()
  const sseUrl = `/api/sse/messages?${authQuery}`

  const eventSource = new EventSource(sseUrl)
  return eventSource
}

// 下载文件时使用
const downloadFile = (fileId: string) => {
  const authQuery = getAuthQuery()
  const downloadUrl = `/api/files/${fileId}/download?${authQuery}`

  // 创建隐藏的 a 标签触发下载
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = ''
  link.click()
}
```

**技术要点：**
- 使用 `objectToQuery` 工具进行 URL 编码
- 空格会被编码为 `%20`
- 返回空字符串时需要注意 URL 拼接

## 集成场景

### 与 useUserStore 集成

用户状态管理中的 Token 管理：

```typescript
// stores/modules/user.ts
import { useToken } from '@/composables/useToken'

export const useUserStore = defineStore('user', () => {
  // 获取 Token 工具实例
  const tokenUtils = useToken()

  // 从缓存初始化 Token 状态
  const token = ref(tokenUtils.getToken())

  /**
   * 用户登录
   */
  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    const [err, data] = await userLogin(loginRequest)
    if (err) {
      return [err, null]
    }

    // 保存 Token 到 localStorage 和 Store
    tokenUtils.setToken(data.access_token, data.expire_in)
    token.value = data.access_token

    return [null, null]
  }

  /**
   * 用户登出
   */
  const logoutUser = async (): Result<void> => {
    const [err] = await userLogout()

    // 清除状态
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []

    // 移除 localStorage 中的 Token
    tokenUtils.removeToken()

    return [err, null]
  }

  return {
    token,
    loginUser,
    logoutUser
  }
})
```

### 与 useHttp 集成

HTTP 请求中自动注入认证头部：

```typescript
// composables/useHttp.ts
import { useToken } from '@/composables/useToken'

const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: SystemConfig.api.baseUrl,
    timeout: 50000,
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    ...config
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 设置国际化
      config.headers['Content-Language'] = getLanguage()

      // 添加请求 ID 用于日志链路追踪
      config.headers['X-Request-Id'] = formatDate(new Date(), 'yyyyMMddHHmmssSSS')

      // 是否需要认证（默认需要）
      if (config.headers?.auth !== false) {
        // 自动附加认证头部
        Object.assign(config.headers, useToken().getAuthHeaders())
      }

      // 是否需要附加租户 ID
      if (config.headers?.tenant !== false) {
        const tenantId = getTenantId()
        if (tenantId) {
          config.headers['X-Tenant-Id'] = tenantId
        }
      }

      return config
    },
    (error) => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )

  return instance
}
```

### 与 useSSE 集成

SSE 服务端推送连接认证：

```typescript
// composables/useSSE.ts
import { useToken } from '@/composables/useToken'

export const useSSE = () => {
  const { getAuthQuery } = useToken()

  /**
   * 创建 SSE 连接
   */
  const connect = (url: string) => {
    // 拼接认证参数
    const authQuery = getAuthQuery()
    const fullUrl = authQuery ? `${url}?${authQuery}` : url

    const eventSource = new EventSource(fullUrl)

    eventSource.onopen = () => {
      console.log('SSE 连接已建立')
    }

    eventSource.onerror = (error) => {
      console.error('SSE 连接错误:', error)
    }

    return eventSource
  }

  return { connect }
}
```

### 与 useWS 集成

WebSocket 连接认证：

```typescript
// composables/useWS.ts
import { useToken } from '@/composables/useToken'

export const useWS = () => {
  const { getAuthQuery } = useToken()

  /**
   * 创建 WebSocket 连接
   */
  const connect = (url: string) => {
    // 拼接认证参数
    const authQuery = getAuthQuery()
    const wsUrl = authQuery ? `${url}?${authQuery}` : url

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket 连接已建立')
    }

    ws.onclose = () => {
      console.log('WebSocket 连接已关闭')
    }

    ws.onerror = (error) => {
      console.error('WebSocket 连接错误:', error)
    }

    return ws
  }

  return { connect }
}
```

### 与文件上传组件集成

文件上传时自动携带认证头部：

```vue
<!-- AImportExcel.vue -->
<template>
  <el-upload
    ref="uploadRef"
    :headers="upload.headers"
    :action="computedUploadUrl"
    :auto-upload="false"
  >
    <!-- 上传区域 -->
  </el-upload>
</template>

<script lang="ts" setup>
import { useToken } from '@/composables/useToken'

// 上传配置
const upload = ref({
  headers: useToken().getAuthHeaders(), // 获取认证头部
  url: props.importUrl ? SystemConfig.api.baseUrl + props.importUrl : ''
})
</script>
```

### 与下载服务集成

文件下载时携带认证信息：

```typescript
// composables/useDownload.ts
import { useToken } from '@/composables/useToken'

export const useDownload = () => {
  const { getAuthHeaders, getAuthQuery } = useToken()

  /**
   * 通过 Blob 方式下载文件
   */
  const download = async (filename: string, url: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeaders()
      }
    })

    if (!response.ok) {
      throw new Error('下载失败')
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.click()

    window.URL.revokeObjectURL(downloadUrl)
  }

  /**
   * 通过 URL 直接下载（适用于支持 URL 认证的接口）
   */
  const downloadByUrl = (url: string) => {
    const authQuery = getAuthQuery()
    const downloadUrl = authQuery ? `${url}?${authQuery}` : url

    window.open(downloadUrl, '_blank')
  }

  return { download, downloadByUrl }
}
```

## 使用场景

### 1. 用户登录

```vue
<template>
  <div class="login-form">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToken } from '@/composables/useToken'
import { login } from '@/api/auth'

const router = useRouter()
const { setToken } = useToken()

const loading = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true

  try {
    const response = await login(loginForm.value)
    const { access_token, expire_in } = response.data

    // 存储 Token，设置过期时间
    setToken(access_token, expire_in)

    // 跳转到首页或重定向页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')

    ElMessage.success('登录成功')
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>
```

### 2. 用户登出

```vue
<template>
  <el-dropdown @command="handleCommand">
    <div class="user-info">
      <el-avatar :src="userInfo.avatar" />
      <span>{{ userInfo.nickName }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">个人中心</el-dropdown-item>
        <el-dropdown-item command="settings">设置</el-dropdown-item>
        <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useToken } from '@/composables/useToken'
import { useUserStore } from '@/stores'
import { logout } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const { removeToken } = useToken()

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    // 调用后端登出接口
    await logout()
  } catch (error) {
    // 即使后端接口失败，也继续清理本地状态
    console.warn('登出接口调用失败', error)
  } finally {
    // 清除本地 Token
    removeToken()

    // 清除用户状态
    userStore.$reset()

    // 跳转到登录页
    router.push('/login')

    ElMessage.success('已安全退出')
  }
}
</script>
```

### 3. 路由守卫

```typescript
// router/guards.ts
import { Router } from 'vue-router'
import { useToken } from '@/composables/useToken'
import { useUserStore } from '@/stores'

/**
 * 认证路由守卫
 */
export const setupAuthGuard = (router: Router) => {
  // 白名单路由（无需登录）
  const whiteList = ['/login', '/register', '/forgot-password', '/404', '/403']

  router.beforeEach(async (to, from, next) => {
    const { getToken } = useToken()
    const userStore = useUserStore()
    const token = getToken()

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 系统名称` : '系统名称'

    // 有 Token
    if (token) {
      if (to.path === '/login') {
        // 已登录，跳转到首页
        next({ path: '/' })
      } else {
        // 检查是否已获取用户信息
        if (userStore.roles.length === 0) {
          try {
            // 获取用户信息
            await userStore.fetchUserInfo()
            // 动态添加路由
            await setupDynamicRoutes()
            // 重新导航到目标路由
            next({ ...to, replace: true })
          } catch (error) {
            // 获取用户信息失败，清除 Token 并跳转登录
            useToken().removeToken()
            next({ path: '/login', query: { redirect: to.fullPath } })
          }
        } else {
          next()
        }
      }
    } else {
      // 无 Token
      if (whiteList.includes(to.path)) {
        // 在白名单中，直接进入
        next()
      } else {
        // 不在白名单中，跳转登录页
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    }
  })
}
```

### 4. HTTP 拦截器

```typescript
// utils/request.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useToken } from '@/composables/useToken'
import { useRouter } from 'vue-router'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { getAuthHeaders } = useToken()

    // 自动添加认证头部
    const authHeaders = getAuthHeaders()
    Object.assign(config.headers, authHeaders)

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data

    if (code === 200) {
      return data
    }

    // 处理业务错误
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token 失效
      const { removeToken } = useToken()
      removeToken()

      // 显示重新登录提示
      ElMessageBox.confirm(
        '登录状态已过期，请重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 跳转登录页
        const router = useRouter()
        router.push('/login')
      })

      return Promise.reject(new Error('登录已过期'))
    }

    // 其他错误
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
```

### 5. Token 自动刷新

```typescript
// composables/useTokenRefresh.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useToken } from '@/composables/useToken'
import { refreshToken } from '@/api/auth'

export const useTokenRefresh = () => {
  const { getToken, setToken } = useToken()

  let refreshTimer: number | null = null

  /**
   * 解析 JWT Token 获取过期时间
   */
  const getTokenExpireTime = (): number | null => {
    const token = getToken()
    if (!token) return null

    try {
      // JWT Token 结构：header.payload.signature
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded.exp * 1000 // 转换为毫秒
    } catch {
      return null
    }
  }

  /**
   * 计算 Token 剩余有效时间
   */
  const getTokenRemainingTime = (): number => {
    const expireTime = getTokenExpireTime()
    if (!expireTime) return 0
    return Math.max(0, expireTime - Date.now())
  }

  /**
   * 刷新 Token
   */
  const doRefreshToken = async () => {
    try {
      const [err, data] = await refreshToken()
      if (!err && data) {
        setToken(data.access_token, data.expire_in)
        console.log('Token 已自动刷新')
        scheduleRefresh()
      }
    } catch (error) {
      console.error('Token 刷新失败:', error)
    }
  }

  /**
   * 安排下次刷新
   */
  const scheduleRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    const remainingTime = getTokenRemainingTime()

    // Token 剩余时间小于 5 分钟时不再刷新
    if (remainingTime < 5 * 60 * 1000) {
      return
    }

    // 在 Token 过期前 10 分钟刷新
    const refreshTime = remainingTime - 10 * 60 * 1000

    refreshTimer = window.setTimeout(() => {
      doRefreshToken()
    }, Math.max(0, refreshTime))
  }

  onMounted(() => {
    scheduleRefresh()
  })

  onUnmounted(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
  })

  return {
    getTokenRemainingTime,
    doRefreshToken
  }
}
```

### 6. 多标签页同步

```typescript
// composables/useTokenSync.ts
import { onMounted, onUnmounted } from 'vue'
import { useToken } from '@/composables/useToken'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

export const useTokenSync = () => {
  const { getToken } = useToken()
  const userStore = useUserStore()
  const router = useRouter()

  /**
   * 处理 storage 事件（其他标签页的 Token 变化）
   */
  const handleStorageChange = (event: StorageEvent) => {
    // 检查是否是 Token 相关的变化
    if (!event.key?.includes('token')) return

    const currentToken = getToken()
    const storeToken = userStore.token

    // Token 被删除（其他标签页登出）
    if (!currentToken && storeToken) {
      ElMessageBox.alert(
        '您已在其他标签页退出登录',
        '提示',
        {
          confirmButtonText: '确定',
          callback: () => {
            userStore.$reset()
            router.push('/login')
          }
        }
      )
      return
    }

    // Token 被更新（其他标签页登录或刷新 Token）
    if (currentToken && currentToken !== storeToken) {
      // 更新本地状态
      userStore.token = currentToken
      // 重新获取用户信息
      userStore.fetchUserInfo()
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handleStorageChange)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })
}
```

## 类型定义

### 完整类型定义

```typescript
/**
 * useToken 返回类型
 */
interface UseTokenReturn {
  /**
   * 获取当前存储的 Token
   * @returns Token 字符串或 null
   */
  getToken: () => string | null

  /**
   * 设置并持久化 Token
   * @param accessToken 要存储的 Token 字符串
   * @param expireSeconds 过期时间（秒），不传则永不过期
   */
  setToken: (accessToken: string, expireSeconds?: number) => void

  /**
   * 移除存储的 Token
   */
  removeToken: () => void

  /**
   * 获取认证头部对象
   * @returns 包含 Authorization 字段的对象，或空对象
   */
  getAuthHeaders: () => Record<string, string>

  /**
   * 获取认证查询字符串
   * @returns URL 编码的认证参数，或空字符串
   */
  getAuthQuery: () => string
}

/**
 * 缓存包装器接口
 */
interface CacheWrapper<T = any> {
  /** 实际数据 */
  data: T
  /** 过期时间戳（毫秒） */
  _expire?: number
}

/**
 * 认证头部类型
 */
type AuthHeaders = {
  Authorization: `Bearer ${string}`
} | Record<string, never>
```

### 使用类型定义

```typescript
import type { UseTokenReturn } from '@/composables/useToken'

// 类型安全的使用方式
const tokenUtils: UseTokenReturn = useToken()

// 获取 Token（可能为 null）
const token: string | null = tokenUtils.getToken()

// 设置 Token
tokenUtils.setToken('token-string', 7200)

// 获取认证头部
const headers: Record<string, string> = tokenUtils.getAuthHeaders()
```

## 最佳实践

### 1. 统一 Token 管理入口

```typescript
// ✅ 好的实践：通过 useUserStore 统一管理
const userStore = useUserStore()
await userStore.loginUser(credentials)  // 内部调用 setToken
await userStore.logoutUser()            // 内部调用 removeToken

// ❌ 避免：在多处直接调用 useToken
// 组件A
useToken().setToken(token)
// 组件B
useToken().removeToken()
// 这样会导致状态不同步
```

### 2. 合理设置过期时间

```typescript
// ✅ 好的实践：使用后端返回的过期时间
const { access_token, expire_in } = loginResponse
setToken(access_token, expire_in)

// ✅ 好的实践：根据业务需求设置合理的过期时间
setToken(token, 2 * 60 * 60)  // 2小时
setToken(token, 24 * 60 * 60) // 1天

// ❌ 避免：永久存储敏感的 Token
setToken(token) // 没有过期时间，Token 永不过期
```

### 3. Token 失效处理

```typescript
// ✅ 好的实践：统一处理 401 错误
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const { removeToken } = useToken()
      removeToken()

      // 避免重复弹窗
      if (!isReLogin.show) {
        isReLogin.show = true
        showReLoginDialog()
      }
    }
    return Promise.reject(error)
  }
)
```

### 4. 安全性考虑

```typescript
// ✅ 好的实践：HTTPS 传输
// 确保所有 API 请求通过 HTTPS 进行

// ✅ 好的实践：避免在 URL 中传递 Token（除非必要）
// 优先使用 Header 传递
fetch(url, {
  headers: getAuthHeaders()
})

// ❌ 避免：在日志中输出完整 Token
console.log('Token:', token) // 敏感信息泄露风险

// ✅ 好的实践：脱敏处理
console.log('Token:', token ? `${token.slice(0, 10)}...` : 'null')
```

### 5. 组件实例管理

```typescript
// ✅ 好的实践：在 Store 中复用实例
export const useUserStore = defineStore('user', () => {
  // 创建一次，复用实例
  const tokenUtils = useToken()

  const loginUser = async () => {
    tokenUtils.setToken(token, expireIn)
  }

  const logoutUser = async () => {
    tokenUtils.removeToken()
  }
})

// ❌ 避免：每次调用都创建新实例
const loginUser = async () => {
  useToken().setToken(token)  // 每次都创建新实例
}
```

### 6. 错误边界处理

```typescript
// ✅ 好的实践：优雅处理 Token 缺失
const fetchData = async () => {
  const token = getToken()

  if (!token) {
    // Token 不存在，引导用户登录
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  // 继续请求
  const data = await api.getData()
}
```

## 常见问题

### 1. Token 设置后无法获取

**问题描述：** 调用 `setToken` 后立即调用 `getToken` 返回 null。

**原因分析：**
- Token 值为空或 undefined
- localStorage 不可用（隐私模式）
- 存储空间已满

**解决方案：**

```typescript
// 检查 Token 是否有效
const setTokenSafely = (token: string, expire?: number) => {
  if (!token || typeof token !== 'string') {
    console.error('Token 值无效')
    return false
  }

  try {
    setToken(token, expire)

    // 验证是否存储成功
    const savedToken = getToken()
    if (savedToken !== token) {
      console.error('Token 存储失败')
      return false
    }

    return true
  } catch (error) {
    console.error('Token 存储异常:', error)
    return false
  }
}

// 检查 localStorage 可用性
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}
```

### 2. Token 突然失效

**问题描述：** Token 在过期时间前突然失效。

**原因分析：**
- 用户手动清除浏览器缓存
- 其他标签页登出
- 服务端主动使 Token 失效
- 系统时间不一致

**解决方案：**

```typescript
// 监听 storage 事件同步状态
window.addEventListener('storage', (event) => {
  if (event.key?.includes('token') && !event.newValue) {
    // Token 被清除
    handleTokenInvalid()
  }
})

// 统一的 Token 失效处理
const handleTokenInvalid = () => {
  userStore.$reset()
  router.push('/login')
  ElMessage.warning('登录已过期，请重新登录')
}
```

### 3. 多应用 Token 冲突

**问题描述：** 同域名下多个应用的 Token 互相覆盖。

**原因分析：**
- 多个应用使用相同的 Token 键名
- 未配置应用前缀

**解决方案：**

```typescript
// 确保 SystemConfig.app.id 在不同应用中唯一
// systemConfig.ts
export const SystemConfig = {
  app: {
    id: 'ruoyi-admin'  // 应用唯一标识
  }
}

// 缓存键会自动添加前缀
// 实际存储键：ruoyi-admin:token
```

### 4. 隐私模式下 Token 无法存储

**问题描述：** 在浏览器隐私模式下，Token 无法持久化。

**原因分析：**
- 隐私模式下 localStorage 可能被禁用或有容量限制
- 关闭窗口后数据自动清除

**解决方案：**

```typescript
// 添加降级策略
const setTokenWithFallback = (token: string, expire?: number) => {
  try {
    // 尝试使用 localStorage
    setToken(token, expire)
  } catch (error) {
    console.warn('localStorage 不可用，使用内存存储')
    // 降级到内存存储（仅当前会话有效）
    memoryStorage.set('token', token)
  }
}

// 内存存储（降级方案）
const memoryStorage: Map<string, any> = new Map()
```

### 5. Token 刷新竞态问题

**问题描述：** 多个请求同时检测到 Token 即将过期，触发多次刷新。

**原因分析：**
- 并发请求同时检测 Token 状态
- 刷新请求未加锁

**解决方案：**

```typescript
// 使用锁机制避免并发刷新
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const refreshTokenWithLock = async () => {
  if (isRefreshing) {
    // 正在刷新，返回一个等待刷新完成的 Promise
    return new Promise<string>((resolve) => {
      addRefreshSubscriber(resolve)
    })
  }

  isRefreshing = true

  try {
    const [err, data] = await refreshToken()
    if (!err && data) {
      setToken(data.access_token, data.expire_in)
      onRefreshed(data.access_token)
      return data.access_token
    }
    throw new Error('刷新失败')
  } finally {
    isRefreshing = false
  }
}
```

### 6. SSR/SSG 环境下的兼容性

**问题描述：** 服务端渲染时 localStorage 不可用。

**原因分析：**
- Node.js 环境中没有 localStorage 对象
- 服务端渲染阶段无法访问浏览器 API

**解决方案：**

```typescript
// 环境检测
const isClient = typeof window !== 'undefined'

const getToken = (): string | null => {
  if (!isClient) {
    return null // 服务端返回 null
  }
  return localCache.get(TOKEN_KEY)
}

const setToken = (token: string, expire?: number): void => {
  if (!isClient) {
    return // 服务端不执行存储
  }
  localCache.set(TOKEN_KEY, token, expire)
}
```

## API 总览

### useToken 返回值

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getToken` | - | `string \| null` | 获取当前 Token |
| `setToken` | `(token: string, expire?: number)` | `void` | 设置 Token |
| `removeToken` | - | `void` | 移除 Token |
| `getAuthHeaders` | - | `Record<string, string>` | 获取认证头部对象 |
| `getAuthQuery` | - | `string` | 获取认证查询字符串 |

### 依赖的缓存 API

| 方法 | 说明 |
|------|------|
| `localCache.get(key)` | 获取缓存值，自动检查过期 |
| `localCache.set(key, value, expire?)` | 设置缓存值，支持过期时间 |
| `localCache.remove(key)` | 移除缓存项 |
| `localCache.has(key)` | 检查缓存是否存在 |
| `localCache.clearAll()` | 清除所有应用缓存 |
| `localCache.cleanup()` | 手动清理过期缓存 |
| `localCache.getStats()` | 获取存储统计信息 |

### 存储格式

| 项目 | 格式 | 示例 |
|------|------|------|
| 存储键 | `${appId}:token` | `ruoyi-admin:token` |
| 存储值 | `{ data, _expire? }` | `{ "data": "eyJ...", "_expire": 1703145600000 }` |
| 认证头部 | `Bearer ${token}` | `Bearer eyJhbGciOiJIUzI1NiIs...` |
| 查询字符串 | URL 编码 | `Authorization=Bearer%20eyJ...` |
