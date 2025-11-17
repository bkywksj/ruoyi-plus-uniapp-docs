# useToken Token管理

## 介绍

`useToken` 是 RuoYi-Plus-UniApp 移动端的认证令牌管理 Composable,基于自定义缓存工具实现 token 的本地持久化管理。它提供了一套完整的令牌存储、获取、删除和认证头部生成功能,是应用认证系统的核心基础设施。

**核心特性:**

- **响应式状态** - 提供响应式的 token 计算属性,支持双向绑定和自动更新
- **持久化存储** - 基于 UniApp 存储 API,自动同步到本地存储,支持多端一致性
- **安全过期** - 默认 7 天过期机制,符合移动端安全最佳实践
- **多格式支持** - 支持 Header 对象格式和 Query 查询字符串格式的认证头部
- **Bearer 标准** - 遵循 OAuth 2.0 Bearer Token 标准,与后端认证系统无缝对接
- **类型安全** - 完整的 TypeScript 类型定义,编译时类型检查
- **轻量高效** - 基于简洁的缓存工具封装,性能开销极小

这个 Composable 是整个应用认证流程的基础,配合 `useAuth` 实现完整的用户登录、令牌刷新、权限校验等功能。通过统一的 API 管理令牌,避免了在各个业务模块中重复实现令牌存取逻辑,提高了代码的可维护性和安全性。

## 基本用法

### 默认用法

最简单的使用方式是直接调用 `useToken()` 获取令牌管理实例,然后使用提供的方法操作令牌。

```vue
<template>
  <view class="token-demo">
    <view class="token-info">
      <text class="label">当前令牌:</text>
      <text class="value">{{ displayToken }}</text>
    </view>

    <view class="actions">
      <button @click="handleGetToken" type="primary">获取令牌</button>
      <button @click="handleSetToken" type="default">设置令牌</button>
      <button @click="handleRemoveToken" type="warn">删除令牌</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useToken } from '@/composables/useToken'

const { token, getToken, setToken, removeToken } = useToken()

// 显示令牌(脱敏处理)
const displayToken = computed(() => {
  const tokenValue = token.value
  if (!tokenValue) return '未设置'
  return tokenValue.length > 20
    ? `${tokenValue.substring(0, 10)}...${tokenValue.substring(tokenValue.length - 10)}`
    : tokenValue
})

// 获取令牌
const handleGetToken = () => {
  const tokenValue = getToken()
  if (tokenValue) {
    uni.showToast({
      title: '令牌已获取',
      icon: 'success',
    })
    console.log('Token:', tokenValue)
  } else {
    uni.showToast({
      title: '令牌不存在',
      icon: 'none',
    })
  }
}

// 设置令牌(模拟登录)
const handleSetToken = () => {
  const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`
  setToken(mockToken)
  uni.showToast({
    title: '令牌已设置',
    icon: 'success',
  })
}

// 删除令牌(模拟登出)
const handleRemoveToken = () => {
  removeToken()
  uni.showToast({
    title: '令牌已删除',
    icon: 'success',
  })
}
</script>

<style lang="scss" scoped>
.token-demo {
  padding: 32rpx;
}

.token-info {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;

  .label {
    font-weight: bold;
    margin-right: 16rpx;
  }

  .value {
    color: #666;
    word-break: break-all;
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  button {
    width: 100%;
  }
}
</style>
```

**使用说明:**
- `getToken()` 方法用于获取当前存储的令牌,返回 `string | null`
- `setToken(token)` 方法用于设置新令牌,自动持久化到本地存储,默认 7 天过期
- `removeToken()` 方法用于删除令牌,清除本地存储
- `token` 计算属性提供响应式访问,支持 `.value` 读取和赋值

### 响应式令牌

使用响应式的 `token` 计算属性,实现令牌的双向绑定和自动更新。

```vue
<template>
  <view class="reactive-token-demo">
    <view class="token-status">
      <text class="status-label">登录状态:</text>
      <text :class="['status-value', isLoggedIn ? 'logged-in' : 'logged-out']">
        {{ isLoggedIn ? '已登录' : '未登录' }}
      </text>
    </view>

    <view v-if="isLoggedIn" class="token-display">
      <text class="label">令牌信息:</text>
      <text class="value">{{ maskedToken }}</text>
    </view>

    <view class="actions">
      <button v-if="!isLoggedIn" @click="handleLogin" type="primary">
        模拟登录
      </button>
      <button v-else @click="handleLogout" type="warn">
        退出登录
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useToken } from '@/composables/useToken'

const { token } = useToken()

// 登录状态(根据 token 自动计算)
const isLoggedIn = computed(() => !!token.value)

// 脱敏后的令牌
const maskedToken = computed(() => {
  if (!token.value) return ''
  const t = token.value
  return t.length > 20 ? `${t.substring(0, 8)}****${t.substring(t.length - 8)}` : t
})

// 模拟登录
const handleLogin = () => {
  // 直接赋值给 token.value,自动调用 setToken
  token.value = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Date.now()}.mock`

  uni.showToast({
    title: '登录成功',
    icon: 'success',
  })
}

// 退出登录
const handleLogout = () => {
  // 赋值 null,自动调用 removeToken
  token.value = null

  uni.showToast({
    title: '已退出登录',
    icon: 'success',
  })
}
</script>

<style lang="scss" scoped>
.reactive-token-demo {
  padding: 32rpx;
}

.token-status {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 8rpx;

  .status-label {
    font-weight: bold;
    margin-right: 16rpx;
  }

  .status-value {
    font-size: 28rpx;

    &.logged-in {
      color: #07c160;
    }

    &.logged-out {
      color: #999;
    }
  }
}

.token-display {
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;

  .label {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }

  .value {
    font-size: 26rpx;
    color: #333;
    word-break: break-all;
    font-family: monospace;
  }
}

.actions {
  button {
    width: 100%;
  }
}
</style>
```

**技术实现:**
- `token` 是一个可写的计算属性,支持 getter 和 setter
- 读取时通过 `cache.get(TOKEN_KEY)` 获取最新值
- 写入时自动判断:非空值调用 `setToken()`,空值调用 `removeToken()`
- Vue 的响应式系统会自动追踪 token 的变化,更新所有依赖

### 获取认证头部

使用 `getAuthHeaders()` 方法获取 HTTP 请求认证头部,适用于需要手动构建请求的场景。

```vue
<template>
  <view class="auth-headers-demo">
    <view class="headers-display">
      <text class="label">认证头部:</text>
      <view class="code-block">
        <text>{{ headersJSON }}</text>
      </view>
    </view>

    <view class="actions">
      <button @click="handleFetchData" type="primary">
        发起认证请求
      </button>
      <button @click="handleToggleToken" type="default">
        {{ hasToken ? '删除令牌' : '设置令牌' }}
      </button>
    </view>

    <view v-if="responseData" class="response">
      <text class="label">响应结果:</text>
      <view class="code-block">
        <text>{{ responseJSON }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useToken } from '@/composables/useToken'

const { getToken, setToken, removeToken, getAuthHeaders } = useToken()

const responseData = ref<any>(null)

// 是否有令牌
const hasToken = computed(() => !!getToken())

// 格式化显示认证头部
const headersJSON = computed(() => {
  const headers = getAuthHeaders()
  return Object.keys(headers).length > 0
    ? JSON.stringify(headers, null, 2)
    : '{ } // 无令牌'
})

// 格式化显示响应数据
const responseJSON = computed(() => {
  return responseData.value
    ? JSON.stringify(responseData.value, null, 2)
    : ''
})

// 发起认证请求
const handleFetchData = async () => {
  const headers = getAuthHeaders()

  if (Object.keys(headers).length === 0) {
    uni.showToast({
      title: '请先设置令牌',
      icon: 'none',
    })
    return
  }

  try {
    // 使用 uni.request 发起请求
    const [err, res] = await uni.request({
      url: 'https://api.example.com/user/profile',
      method: 'GET',
      header: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })

    if (err) {
      throw new Error(err.errMsg)
    }

    responseData.value = res.data
    uni.showToast({
      title: '请求成功',
      icon: 'success',
    })
  } catch (error: any) {
    uni.showToast({
      title: error.message || '请求失败',
      icon: 'none',
    })
  }
}

// 切换令牌状态
const handleToggleToken = () => {
  if (hasToken.value) {
    removeToken()
    responseData.value = null
    uni.showToast({
      title: '令牌已删除',
      icon: 'success',
    })
  } else {
    setToken('mock_jwt_token_abc123xyz789')
    uni.showToast({
      title: '令牌已设置',
      icon: 'success',
    })
  }
}
</script>

<style lang="scss" scoped>
.auth-headers-demo {
  padding: 32rpx;
}

.headers-display,
.response {
  margin-bottom: 24rpx;

  .label {
    display: block;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .code-block {
    padding: 24rpx;
    background: #1e1e1e;
    border-radius: 8rpx;
    overflow-x: auto;

    text {
      color: #d4d4d4;
      font-size: 24rpx;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;

  button {
    width: 100%;
  }
}
</style>
```

**使用说明:**
- `getAuthHeaders()` 返回 `Record<string, string>` 类型的对象
- 有令牌时返回 `{ Authorization: 'Bearer token值' }`
- 无令牌时返回空对象 `{}`
- 可直接展开到 `uni.request` 的 `header` 参数中
- 符合 OAuth 2.0 Bearer Token 规范

### 获取查询字符串格式

使用 `getAuthQuery()` 方法获取查询字符串格式的认证参数,适用于 WebSocket、文件下载等场景。

```vue
<template>
  <view class="auth-query-demo">
    <view class="query-display">
      <text class="label">认证查询字符串:</text>
      <view class="query-value">
        <text>{{ queryString || '(空)' }}</text>
      </view>
    </view>

    <view class="url-example">
      <text class="label">完整 URL 示例:</text>
      <view class="url-value">
        <text>{{ fullURL }}</text>
      </view>
    </view>

    <view class="actions">
      <button @click="handleDownloadFile" type="primary">
        下载文件(带认证)
      </button>
      <button @click="handleConnectWS" type="default">
        连接 WebSocket
      </button>
      <button @click="handleRefresh" type="warn">
        刷新查询字符串
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useToken } from '@/composables/useToken'

const { getAuthQuery, setToken, getToken } = useToken()

const queryString = ref('')

// 完整 URL(拼接查询字符串)
const fullURL = computed(() => {
  const baseURL = 'https://api.example.com/file/download'
  return queryString.value ? `${baseURL}?${queryString.value}` : baseURL
})

// 刷新查询字符串
const handleRefresh = () => {
  queryString.value = getAuthQuery()
  uni.showToast({
    title: '已刷新',
    icon: 'success',
  })
}

// 下载文件(带认证)
const handleDownloadFile = () => {
  const query = getAuthQuery()

  if (!query) {
    uni.showToast({
      title: '请先设置令牌',
      icon: 'none',
    })
    return
  }

  // 文件下载 URL 需要在查询参数中传递认证信息
  const downloadURL = `https://api.example.com/file/download?fileId=123&${query}`

  uni.downloadFile({
    url: downloadURL,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.showToast({
          title: '下载成功',
          icon: 'success',
        })
        console.log('Downloaded file:', res.tempFilePath)
      }
    },
    fail: (err) => {
      uni.showToast({
        title: '下载失败',
        icon: 'none',
      })
      console.error('Download failed:', err)
    },
  })
}

// 连接 WebSocket(带认证)
const handleConnectWS = () => {
  const query = getAuthQuery()

  if (!query) {
    uni.showToast({
      title: '请先设置令牌',
      icon: 'none',
    })
    return
  }

  // WebSocket URL 需要在查询参数中传递认证信息
  const wsURL = `wss://api.example.com/ws/chat?${query}`

  const socketTask = uni.connectSocket({
    url: wsURL,
    success: () => {
      uni.showToast({
        title: 'WebSocket 连接成功',
        icon: 'success',
      })
    },
    fail: (err) => {
      uni.showToast({
        title: '连接失败',
        icon: 'none',
      })
      console.error('WebSocket connection failed:', err)
    },
  })

  // 监听消息
  socketTask?.onMessage((res) => {
    console.log('Received message:', res.data)
  })
}

// 初始化
onMounted(() => {
  // 确保有令牌用于演示
  const token = getToken()
  if (!token) {
    setToken('demo_token_for_query_string_example')
  }

  // 获取查询字符串
  handleRefresh()
})
</script>

<style lang="scss" scoped>
.auth-query-demo {
  padding: 32rpx;
}

.query-display,
.url-example {
  margin-bottom: 24rpx;

  .label {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .query-value,
  .url-value {
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    border: 1px dashed #ccc;

    text {
      font-size: 24rpx;
      color: #333;
      word-break: break-all;
      font-family: monospace;
    }
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  button {
    width: 100%;
  }
}
</style>
```

**技术实现:**
- `getAuthQuery()` 内部调用 `getAuthHeaders()` 获取头部对象
- 使用 `objectToQuery()` 工具函数转换为查询字符串格式
- 返回格式: `Authorization=Bearer%20token值`(URL 编码)
- 适用于 WebSocket、文件下载等无法使用 HTTP Header 的场景
- 将认证信息从 Header 转移到 URL 查询参数中

### 登录场景集成

在实际登录流程中使用 `useToken` 管理令牌,配合用户信息存储。

```vue
<template>
  <view class="login-demo">
    <view class="login-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input
          v-model="formData.username"
          placeholder="请输入用户名"
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          class="input"
        />
      </view>

      <button
        @click="handleLogin"
        type="primary"
        :loading="isLoading"
        :disabled="!canSubmit"
        class="login-btn"
      >
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </view>

    <view v-if="userInfo" class="user-info">
      <text class="label">已登录用户信息:</text>
      <view class="info-item">
        <text class="key">用户名:</text>
        <text class="value">{{ userInfo.username }}</text>
      </view>
      <view class="info-item">
        <text class="key">令牌:</text>
        <text class="value">{{ maskedToken }}</text>
      </view>
      <button @click="handleLogout" type="warn" class="logout-btn">
        退出登录
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useToken } from '@/composables/useToken'

interface LoginFormData {
  username: string
  password: string
}

interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
}

const { token, setToken, removeToken } = useToken()

const formData = ref<LoginFormData>({
  username: '',
  password: '',
})

const isLoading = ref(false)
const userInfo = ref<UserInfo | null>(null)

// 是否可以提交
const canSubmit = computed(() => {
  return formData.value.username.trim() !== '' &&
         formData.value.password.trim() !== ''
})

// 脱敏令牌
const maskedToken = computed(() => {
  if (!token.value) return ''
  const t = token.value
  return t.length > 16 ? `${t.substring(0, 6)}****${t.substring(t.length - 6)}` : t
})

// 模拟登录 API 调用
const loginApi = async (username: string, password: string) => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // 模拟登录成功返回
  return {
    code: 200,
    data: {
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Date.now()}.mock`,
      userInfo: {
        id: '1001',
        username,
        nickname: `用户_${username}`,
        avatar: 'https://example.com/avatar.png',
      },
    },
    msg: '登录成功',
  }
}

// 登录处理
const handleLogin = async () => {
  if (!canSubmit.value) return

  isLoading.value = true

  try {
    const res = await loginApi(
      formData.value.username,
      formData.value.password
    )

    if (res.code === 200) {
      // 1. 保存令牌
      setToken(res.data.token)

      // 2. 保存用户信息
      userInfo.value = res.data.userInfo

      // 3. 清空表单
      formData.value = { username: '', password: '' }

      uni.showToast({
        title: '登录成功',
        icon: 'success',
      })

      // 4. 跳转到首页(可选)
      // uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none',
    })
  } finally {
    isLoading.value = false
  }
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: (res) => {
      if (res.confirm) {
        // 1. 删除令牌
        removeToken()

        // 2. 清空用户信息
        userInfo.value = null

        uni.showToast({
          title: '已退出登录',
          icon: 'success',
        })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.login-demo {
  padding: 32rpx;
}

.login-form {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .form-item {
    margin-bottom: 24rpx;

    .label {
      display: block;
      font-size: 28rpx;
      margin-bottom: 12rpx;
      color: #333;
    }

    .input {
      width: 100%;
      height: 80rpx;
      padding: 0 24rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      font-size: 28rpx;
    }
  }

  .login-btn {
    width: 100%;
    margin-top: 16rpx;
  }
}

.user-info {
  margin-top: 32rpx;
  padding: 32rpx;
  background: #f8f8f8;
  border-radius: 16rpx;

  .label {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .info-item {
    display: flex;
    margin-bottom: 12rpx;

    .key {
      width: 120rpx;
      color: #666;
    }

    .value {
      flex: 1;
      color: #333;
      word-break: break-all;
    }
  }

  .logout-btn {
    width: 100%;
    margin-top: 24rpx;
  }
}
</style>
```

**使用说明:**
- 登录成功后立即调用 `setToken()` 保存令牌
- 退出登录时调用 `removeToken()` 清除令牌
- 配合用户信息一起管理,保持状态一致性
- 令牌通常在登录接口返回,有效期由后端控制
- 建议同时存储用户信息到 Pinia Store 或其他状态管理库

### HTTP 拦截器集成

在 HTTP 请求拦截器中自动添加认证头部,实现全局认证。

```typescript
// utils/request.ts
import { useToken } from '@/composables/useToken'

/**
 * HTTP 请求拦截器
 */
export const requestInterceptor = (config: UniApp.RequestOptions) => {
  const { getAuthHeaders } = useToken()

  // 自动添加认证头部
  const authHeaders = getAuthHeaders()
  config.header = {
    ...config.header,
    ...authHeaders,
  }

  // 添加其他公共头部
  config.header['Content-Type'] = config.header['Content-Type'] || 'application/json'

  return config
}

/**
 * HTTP 响应拦截器
 */
export const responseInterceptor = (response: UniApp.RequestSuccessCallbackResult) => {
  const { removeToken } = useToken()

  // 处理 401 未授权
  if (response.statusCode === 401) {
    // 清除无效令牌
    removeToken()

    // 跳转到登录页
    uni.showToast({
      title: '登录已过期,请重新登录',
      icon: 'none',
    })

    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/index',
      })
    }, 1500)

    return Promise.reject(new Error('未授权'))
  }

  // 处理其他错误状态码
  if (response.statusCode >= 400) {
    return Promise.reject(new Error(`请求失败: ${response.statusCode}`))
  }

  return response.data
}

/**
 * 封装的请求方法
 */
export const request = <T = any>(options: UniApp.RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const config = requestInterceptor(options)

    uni.request({
      ...config,
      success: (res) => {
        try {
          // 响应拦截
          const data = responseInterceptor(res)
          resolve(data as T)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg))
      },
    })
  })
}
```

```vue
<template>
  <view class="interceptor-demo">
    <view class="demo-section">
      <text class="section-title">HTTP 拦截器演示</text>

      <view class="info-box">
        <text class="info-text">
          所有请求会自动添加认证头部,无需手动处理
        </text>
      </view>

      <button @click="handleFetchUser" type="primary">
        获取用户信息
      </button>

      <button @click="handleFetchOrders" type="default">
        获取订单列表
      </button>
    </view>

    <view v-if="userData" class="result-section">
      <text class="section-title">请求结果</text>
      <view class="code-block">
        <text>{{ JSON.stringify(userData, null, 2) }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { request } from '@/utils/request'

interface User {
  id: string
  username: string
  email: string
}

const userData = ref<any>(null)

// 获取用户信息(自动带认证头部)
const handleFetchUser = async () => {
  try {
    const data = await request<User>({
      url: 'https://api.example.com/user/profile',
      method: 'GET',
    })

    userData.value = data
    uni.showToast({
      title: '获取成功',
      icon: 'success',
    })
  } catch (error: any) {
    uni.showToast({
      title: error.message || '获取失败',
      icon: 'none',
    })
  }
}

// 获取订单列表(自动带认证头部)
const handleFetchOrders = async () => {
  try {
    const data = await request({
      url: 'https://api.example.com/orders',
      method: 'GET',
      data: {
        page: 1,
        pageSize: 10,
      },
    })

    userData.value = data
    uni.showToast({
      title: '获取成功',
      icon: 'success',
    })
  } catch (error: any) {
    uni.showToast({
      title: error.message || '获取失败',
      icon: 'none',
    })
  }
}
</script>

<style lang="scss" scoped>
.interceptor-demo {
  padding: 32rpx;
}

.demo-section {
  margin-bottom: 32rpx;

  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .info-box {
    padding: 24rpx;
    background: #e8f4ff;
    border-left: 4rpx solid #1890ff;
    border-radius: 8rpx;
    margin-bottom: 24rpx;

    .info-text {
      font-size: 26rpx;
      color: #333;
    }
  }

  button {
    width: 100%;
    margin-bottom: 16rpx;
  }
}

.result-section {
  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .code-block {
    padding: 24rpx;
    background: #1e1e1e;
    border-radius: 8rpx;
    overflow-x: auto;

    text {
      color: #d4d4d4;
      font-size: 24rpx;
      font-family: monospace;
      white-space: pre-wrap;
    }
  }
}
</style>
```

**技术实现:**
- 在请求拦截器中调用 `getAuthHeaders()` 获取认证头部
- 自动合并到每个请求的 `header` 中
- 响应拦截器处理 401 状态码,自动清除过期令牌并跳转登录页
- 业务代码无需关心认证头部,专注于业务逻辑
- 统一的错误处理,提升用户体验

## API

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getToken` | 获取当前存储的令牌 | - | `string \| null` |
| `setToken` | 设置并持久化新的令牌 | `accessToken: string` | `void` |
| `removeToken` | 清除存储的令牌 | - | `void` |
| `getAuthHeaders` | 获取认证头部(Record 格式) | - | `Record<string, string>` |
| `getAuthQuery` | 获取认证头部(查询字符串格式) | - | `string` |

### 响应式属性

| 属性名 | 说明 | 类型 |
|--------|------|------|
| `token` | 响应式令牌计算属性,支持读写 | `ComputedRef<string \| null>` |

### 类型定义

```typescript
/**
 * Token 管理钩子返回类型
 */
export interface UseTokenReturn {
  /** 响应式令牌(支持读写) */
  token: WritableComputedRef<string | null>

  /** 获取令牌 */
  getToken: () => string | null

  /** 设置令牌 */
  setToken: (accessToken: string) => void

  /** 移除令牌 */
  removeToken: () => void

  /** 获取认证头部(Record 格式) */
  getAuthHeaders: () => Record<string, string>

  /** 获取认证头部(查询字符串格式) */
  getAuthQuery: () => string
}

/**
 * Token 管理钩子
 */
export const useToken: () => UseTokenReturn
```

### 常量定义

```typescript
/**
 * Token 键名(用于存储)
 */
const TOKEN_KEY = 'token'

/**
 * 默认过期时间(秒)
 */
const DEFAULT_EXPIRY = 7 * 24 * 3600 // 7 天
```

### 依赖接口

```typescript
/**
 * 缓存工具接口(来自 @/utils/cache)
 */
interface CacheUtil {
  /**
   * 获取缓存
   * @param key 键名
   * @returns 缓存值或 null
   */
  get(key: string): string | null

  /**
   * 设置缓存
   * @param key 键名
   * @param value 值
   * @param expire 过期时间(秒)
   * @returns 是否成功
   */
  set(key: string, value: string, expire: number): boolean

  /**
   * 移除缓存
   * @param key 键名
   */
  remove(key: string): void
}

/**
 * 对象转查询字符串工具(来自 @/utils/string)
 */
function objectToQuery(obj: Record<string, any>): string
```

## 最佳实践

### 1. 令牌过期时间设置

移动端令牌的过期时间应该根据安全需求和用户体验平衡设置。

**推荐设置:**

```typescript
// 短期令牌(高安全性场景)
setToken(accessToken, 2 * 3600) // 2 小时

// 中期令牌(一般场景)
setToken(accessToken, 24 * 3600) // 1 天

// 长期令牌(低安全性场景)
setToken(accessToken, 7 * 24 * 3600) // 7 天(默认)

// 超长期令牌(配合刷新令牌)
setToken(refreshToken, 30 * 24 * 3600) // 30 天
```

**注意事项:**
- 金融、支付类应用使用短期令牌(1-2 小时)
- 社交、内容类应用使用中期令牌(1-3 天)
- 工具、效率类应用可使用长期令牌(7-30 天)
- 生产环境应配合令牌刷新机制,访问令牌设置短期,刷新令牌设置长期

### 2. 统一的 HTTP 拦截器

将令牌管理集成到 HTTP 拦截器中,实现全局自动认证,避免在每个请求中重复添加认证头部。

```typescript
// ✅ 推荐:在拦截器中统一处理
import { useToken } from '@/composables/useToken'

export const requestInterceptor = (config: UniApp.RequestOptions) => {
  const { getAuthHeaders } = useToken()

  config.header = {
    ...config.header,
    ...getAuthHeaders(),
  }

  return config
}

// ❌ 不推荐:在每个 API 调用中手动添加
const getUserInfo = async () => {
  const { getAuthHeaders } = useToken()
  const headers = getAuthHeaders() // 重复代码

  return uni.request({
    url: '/api/user/info',
    header: headers,
  })
}
```

### 3. 令牌失效处理

统一处理令牌失效场景,提供良好的用户体验。

```typescript
// ✅ 推荐:统一的令牌失效处理
export const handle401Unauthorized = () => {
  const { removeToken } = useToken()

  // 1. 清除无效令牌
  removeToken()

  // 2. 清除用户信息
  const userStore = useUserStore()
  userStore.logout()

  // 3. 提示用户
  uni.showToast({
    title: '登录已过期,请重新登录',
    icon: 'none',
    duration: 2000,
  })

  // 4. 延迟跳转,让用户看到提示
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/index',
    })
  }, 2000)
}

// 在响应拦截器中调用
export const responseInterceptor = (response) => {
  if (response.statusCode === 401) {
    handle401Unauthorized()
    return Promise.reject(new Error('未授权'))
  }

  return response
}

// ❌ 不推荐:在多个地方重复处理 401
// 导致行为不一致,维护困难
```

### 4. 跨组件令牌访问

在多个组件中需要访问令牌时,使用 Composable 而不是全局变量。

```typescript
// ✅ 推荐:使用 Composable
import { useToken } from '@/composables/useToken'

const ComponentA = () => {
  const { token } = useToken()
  // 使用 token
}

const ComponentB = () => {
  const { token } = useToken()
  // 使用同一个 token 实例
}

// ❌ 不推荐:使用全局变量
let globalToken: string | null = null

const ComponentA = () => {
  // 使用 globalToken
  console.log(globalToken)
}

const ComponentB = () => {
  // 修改 globalToken 可能导致其他组件状态不一致
  globalToken = 'new_token'
}
```

### 5. 令牌存储安全

对敏感的令牌信息进行加密存储,提升安全性。

```typescript
// ✅ 推荐:加密存储(生产环境)
import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.VUE_APP_SECRET_KEY

export const setToken = (token: string): void => {
  const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString()
  cache.set(TOKEN_KEY, encrypted, 7 * 24 * 3600)
}

export const getToken = (): string | null => {
  const encrypted = cache.get(TOKEN_KEY)
  if (!encrypted) return null

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    return null
  }
}

// ❌ 不推荐:明文存储(开发环境可接受)
export const setToken = (token: string): void => {
  cache.set(TOKEN_KEY, token, 7 * 24 * 3600)
}
```

## 常见问题

### 1. 令牌设置后无法获取

**问题原因:**
- 存储空间已满,`cache.set()` 返回 `false`
- 令牌过期时间设置错误
- 存储 API 权限不足(某些小程序平台)

**解决方案:**

```typescript
// 方案 1: 检查存储结果
const { setToken, getToken } = useToken()

const token = 'your_access_token'
setToken(token)

// 立即验证是否设置成功
const savedToken = getToken()
if (!savedToken) {
  console.error('Token setting failed')

  // 尝试清理旧数据
  uni.clearStorageSync()

  // 重新设置
  setToken(token)
}

// 方案 2: 检查存储空间
uni.getStorageInfo({
  success: (res) => {
    const { currentSize, limitSize } = res
    const usagePercent = (currentSize / limitSize) * 100

    if (usagePercent > 90) {
      console.warn('Storage is almost full:', usagePercent.toFixed(2) + '%')

      // 清理过期数据
      cleanExpiredData()
    }
  },
})
```

### 2. 令牌在某些平台无法持久化

**问题原因:**
- 小程序隐私模式或无痕浏览模式
- 用户禁用了存储权限
- 某些平台的存储 API 限制

**解决方案:**

```typescript
// 方案 1: 检测存储可用性
const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__'
    uni.setStorageSync(testKey, 'test')
    const value = uni.getStorageSync(testKey)
    uni.removeStorageSync(testKey)

    return value === 'test'
  } catch (error) {
    console.error('Storage not available:', error)
    return false
  }
}

// 在设置令牌前检查
if (!isStorageAvailable()) {
  uni.showModal({
    title: '提示',
    content: '您的浏览器存储功能不可用,可能影响登录状态保持',
    showCancel: false,
  })
}

// 方案 2: 降级到 sessionStorage(H5 平台)
export const setTokenWithFallback = (accessToken: string): void => {
  try {
    const success = cache.set(TOKEN_KEY, accessToken, 7 * 24 * 3600)

    if (!success) {
      // #ifdef H5
      sessionStorage.setItem(TOKEN_KEY, accessToken)
      console.warn('Using sessionStorage as fallback')
      // #endif
    }
  } catch (error) {
    console.error('Token storage failed:', error)
  }
}
```

### 3. 多标签页令牌同步问题

**问题原因:**
- H5 平台的 `storage` 事件只在其他标签页修改时触发
- 当前标签页的修改不会触发自身的 `storage` 事件
- 小程序不支持标签页间通信

**解决方案:**

```typescript
// 方案 1: 使用 BroadcastChannel API(H5)
class TokenSyncManager {
  private channel: BroadcastChannel | null = null

  constructor() {
    // #ifdef H5
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('token_sync')

      this.channel.onmessage = (event) => {
        const { type, token } = event.data

        if (type === 'token_update') {
          const { setToken } = useToken()
          setToken(token)
        } else if (type === 'token_remove') {
          const { removeToken } = useToken()
          removeToken()
        }
      }
    }
    // #endif
  }

  syncTokenUpdate(token: string) {
    // #ifdef H5
    this.channel?.postMessage({
      type: 'token_update',
      token,
    })
    // #endif
  }

  syncTokenRemove() {
    // #ifdef H5
    this.channel?.postMessage({
      type: 'token_remove',
    })
    // #endif
  }
}

// 使用示例
const syncManager = new TokenSyncManager()

export const setToken = (token: string) => {
  cache.set(TOKEN_KEY, token, 7 * 24 * 3600)
  syncManager.syncTokenUpdate(token)
}

// 方案 2: 使用轮询检查(兼容性方案)
let lastToken: string | null = null

setInterval(() => {
  const currentToken = cache.get(TOKEN_KEY)

  if (currentToken !== lastToken) {
    console.log('Token changed, updating...')
    lastToken = currentToken

    // 触发令牌变化事件
    uni.$emit('token:changed', currentToken)
  }
}, 5000) // 每 5 秒检查一次
```

### 4. 令牌过期后未自动跳转登录页

**问题原因:**
- 响应拦截器未正确处理 401 状态码
- 多个请求同时返回 401,导致重复跳转
- 当前页面是 tabBar 页面,`uni.reLaunch` 无法跳转

**解决方案:**

```typescript
// 方案 1: 防止重复跳转
let isRedirecting = false

export const handle401 = () => {
  if (isRedirecting) {
    console.log('Already redirecting, skip')
    return
  }

  isRedirecting = true

  const { removeToken } = useToken()
  removeToken()

  uni.showToast({
    title: '登录已过期',
    icon: 'none',
    duration: 1500,
  })

  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/index',
      success: () => {
        isRedirecting = false
      },
      fail: () => {
        isRedirecting = false
      },
    })
  }, 1500)
}

// 方案 2: 处理 tabBar 页面跳转
export const redirectToLogin = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage?.route || ''

  // 检查当前是否是 tabBar 页面
  const tabBarPages = [
    'pages/index/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/user/index',
  ]

  if (tabBarPages.includes(currentRoute)) {
    // 当前是 tabBar 页面,使用 navigateTo
    uni.navigateTo({
      url: '/pages/login/index',
    })
  } else {
    // 非 tabBar 页面,使用 reLaunch
    uni.reLaunch({
      url: '/pages/login/index',
    })
  }
}
```

### 5. 令牌被恶意读取的安全问题

**问题原因:**
- 令牌明文存储在 localStorage/缓存中
- 跨站脚本攻击(XSS)导致令牌泄露
- 开发者工具可直接查看存储内容

**解决方案:**

```typescript
// 方案 1: 使用加密存储
import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.VUE_APP_SECRET_KEY || 'your_secret_key'

export const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString()
}

export const decryptToken = (encrypted: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const setToken = (token: string): void => {
  const encrypted = encryptToken(token)
  cache.set(TOKEN_KEY, encrypted, 7 * 24 * 3600)
}

export const getToken = (): string | null => {
  const encrypted = cache.get(TOKEN_KEY)
  if (!encrypted) return null

  try {
    return decryptToken(encrypted)
  } catch (error) {
    console.error('Token decryption failed:', error)
    return null
  }
}

// 方案 2: 添加 XSS 防护
// 过滤用户输入
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// 方案 3: 使用短期令牌 + 定期刷新
// 访问令牌设置极短有效期(15 分钟)
setToken(accessToken, 15 * 60)

// 每 10 分钟自动刷新访问令牌
setInterval(async () => {
  const newToken = await refreshAccessToken()
  if (newToken) {
    setToken(newToken, 15 * 60)
  }
}, 10 * 60 * 1000)
```

## 使用示例总结

本文档提供了 `useToken` 的完整使用示例,涵盖以下场景:

**基本用法:**
- 默认用法 - 基础的令牌存取操作
- 响应式令牌 - 使用计算属性实现双向绑定
- 获取认证头部 - HTTP 请求认证头部获取
- 获取查询字符串格式 - WebSocket/文件下载场景
- 登录场景集成 - 完整的登录流程
- HTTP 拦截器集成 - 全局自动认证

所有示例都基于真实的源码实现,可以直接在项目中使用。
