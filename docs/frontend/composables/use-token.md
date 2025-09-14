# useToken

Token 管理组合函数，基于封装的 cache 工具实现 token 的本地持久化管理。提供 token 的存取、删除和认证头部生成功能。

## 📋 功能特性

- **Token 存储**: 安全的本地持久化存储用户认证令牌
- **过期管理**: 支持设置 token 过期时间，自动清理过期令牌
- **认证头部**: 自动生成标准的认证头部信息
- **查询字符串**: 生成 URL 查询字符串格式的认证信息
- **缓存基础**: 基于统一的缓存工具，确保数据一致性

## 🎯 基础用法

### 基本使用

```vue
<script setup>
import { useToken } from '@/composables/useToken'

const { getToken, setToken, removeToken, getAuthHeaders, getAuthQuery } = useToken()

// 设置 token
const handleLogin = (token) => {
  setToken(token) // 永久存储
  // 或者设置过期时间（秒）
  setToken(token, 7200) // 2小时后过期
}

// 获取 token
const token = getToken()
console.log('当前token:', token)

// 删除 token
const handleLogout = () => {
  removeToken()
  console.log('已清除token')
}
</script>
```

### HTTP 请求中使用

```vue
<script setup>
import { useToken } from '@/composables/useToken'
import axios from 'axios'

const { getAuthHeaders } = useToken()

// 在 HTTP 请求中使用认证头部
const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/api/user/info', {
      headers: {
        ...getAuthHeaders() // { Authorization: 'Bearer token123' }
      }
    })
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
</script>
```

### WebSocket 连接中使用

```vue
<script setup>
import { useToken } from '@/composables/useToken'

const { getAuthQuery } = useToken()

const connectWebSocket = () => {
  const authQuery = getAuthQuery() // "Authorization=Bearer%20token123"
  const wsUrl = `wss://api.example.com/ws?${authQuery}`
  
  const ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket 连接已建立')
  }
}
</script>
```

## 🔧 API 参考

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `getToken` | `() => string \| null` | 获取当前存储的 token |
| `setToken` | `(token: string, expireSeconds?: number) => void` | 设置并持久化 token |
| `removeToken` | `() => void` | 清除存储的 token |
| `getAuthHeaders` | `() => Record<string, string>` | 获取认证头部对象格式 |
| `getAuthQuery` | `() => string` | 获取认证头部查询字符串格式 |

### 方法详解

#### `getToken()`

获取当前存储的 token。

```typescript
const token = getToken()
// 返回: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 或 null
```

#### `setToken(accessToken, expireSeconds?)`

设置并持久化新的 token。

**参数:**
- `accessToken` (string): 要存储的 token 字符串
- `expireSeconds` (number, 可选): 过期时间（秒），不传则永不过期

```typescript
// 永久存储
setToken('your-access-token')

// 设置2小时后过期
setToken('your-access-token', 7200)

// 设置1天后过期
setToken('your-access-token', 24 * 60 * 60)
```

#### `removeToken()`

清除存储的 token。

```typescript
removeToken()
console.log(getToken()) // null
```

#### `getAuthHeaders()`

获取认证头部对象格式，适用于 HTTP 请求。

```typescript
const headers = getAuthHeaders()
// 有token时返回: { Authorization: 'Bearer token123' }
// 无token时返回: {}
```

#### `getAuthQuery()`

获取认证头部的查询字符串格式，适用于 URL 参数或 WebSocket 连接。

```typescript
const queryString = getAuthQuery()
// 有token时返回: "Authorization=Bearer%20token123"
// 无token时返回: ""
```

## 💡 使用场景

### 1. 用户登录

```vue
<script setup>
import { useToken } from '@/composables/useToken'
import { useRouter } from 'vue-router'

const { setToken } = useToken()
const router = useRouter()

const handleLogin = async (credentials) => {
  try {
    const response = await login(credentials)
    const { access_token, expires_in } = response.data
    
    // 存储 token，设置过期时间
    setToken(access_token, expires_in)
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

### 2. 用户登出

```vue
<script setup>
import { useToken } from '@/composables/useToken'
import { useRouter } from 'vue-router'

const { removeToken } = useToken()
const router = useRouter()

const handleLogout = () => {
  // 清除本地 token
  removeToken()
  
  // 跳转到登录页
  router.push('/login')
}
</script>
```

### 3. 路由守卫中使用

```javascript
// router/guards.js
import { useToken } from '@/composables/useToken'

export const authGuard = (to, from, next) => {
  const { getToken } = useToken()
  const token = getToken()
  
  if (to.meta.requiresAuth && !token) {
    // 需要认证但没有token，跳转登录页
    next('/login')
  } else {
    next()
  }
}
```

### 4. HTTP 拦截器中使用

```javascript
// utils/request.js
import axios from 'axios'
import { useToken } from '@/composables/useToken'

const request = axios.create({
  baseURL: '/api'
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const { getAuthHeaders } = useToken()
    const authHeaders = getAuthHeaders()
    
    // 自动添加认证头部
    Object.assign(config.headers, authHeaders)
    
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const { removeToken } = useToken()
      // token失效，清除本地存储
      removeToken()
      // 可以跳转到登录页或显示登录弹窗
    }
    return Promise.reject(error)
  }
)
```

## ⚠️ 注意事项

### 安全性考虑

1. **存储位置**: Token 存储在 `localStorage` 中，注意防范 XSS 攻击
2. **过期处理**: 合理设置 token 过期时间，定期刷新 token
3. **敏感信息**: 不要在 token 中存储敏感的用户信息

### 最佳实践

1. **统一管理**: 在应用入口统一处理 token 的获取和设置
2. **自动刷新**: 实现 token 自动刷新机制，避免用户频繁登录
3. **错误处理**: 妥善处理 token 失效的情况，提供友好的用户体验

```javascript
// 推荐的错误处理方式
const { getToken, removeToken } = useToken()

if (!getToken()) {
  // token不存在，引导用户登录
  showLoginModal()
} else {
  // token存在但可能已过期，由后端验证
  // 如果后端返回401，在拦截器中处理
}
```
