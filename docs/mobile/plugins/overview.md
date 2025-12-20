# 插件概览

## 介绍

RuoYi-Plus-UniApp 框架提供了丰富的功能插件,这些插件以 Composables 的形式实现,提供了网络请求、支付、分享、权限、主题、国际化等常用功能。插件设计遵循 Vue 3 Composition API 规范,易于使用和扩展。

**核心特性:**

- **Composition API** - 基于 Vue 3 Composition API 实现
- **TypeScript 支持** - 完整的类型定义和类型推导
- **响应式设计** - 充分利用 Vue 3 响应式系统
- **跨平台兼容** - 支持 H5、小程序、App 多平台
- **开箱即用** - 无需配置即可使用
- **按需引入** - Tree-shaking 友好,减小打包体积

## 插件分类

### 网络通信插件

#### 1. HTTP 请求插件 (useHttp)

基于 Axios 的 HTTP 请求封装,提供请求拦截、响应拦截、错误处理等功能。

**主要功能:**

- 请求/响应拦截器
- 自动 Token 注入
- 统一错误处理
- 请求重试机制
- 文件上传/下载

**使用示例:**

```typescript
import { useHttp } from '@/composables/useHttp'

const { get, post, put, del } = useHttp()

// GET 请求
const [err, data] = await get('/api/user/info')

// POST 请求
const [error, result] = await post('/api/user/create', {
  name: '张三',
  age: 25,
})
```

#### 2. WebSocket 插件 (useWebSocket)

WebSocket 实时通信封装,支持自动重连、心跳检测、消息队列等功能。

**主要功能:**

- 自动连接管理
- 断线自动重连
- 心跳保活机制
- 消息队列缓冲
- 事件订阅

**使用示例:**

```typescript
import { useWebSocket } from '@/composables/useWebSocket'

const {
  connect,
  disconnect,
  send,
  subscribe,
  isConnected,
} = useWebSocket()

// 连接 WebSocket
await connect()

// 订阅消息
subscribe('chat', (message) => {
  console.log('收到聊天消息:', message)
})

// 发送消息
send('chat', { content: 'Hello World' })
```

### 业务功能插件

#### 3. 支付插件 (usePayment)

统一支付接口,支持微信支付、支付宝支付、余额支付等多种支付方式。

**主要功能:**

- 多平台支付适配
- 支付方式自动选择
- 订单创建和支付
- 支付结果查询
- 支付状态轮询

**使用示例:**

```typescript
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay, loading, getPlatformInfo } = usePayment()

// 创建订单并支付
const [err, result] = await createOrderAndPay({
  orderData: {
    productId: '123',
    quantity: 1,
    totalAmount: 100,
  },
  paymentMethod: PaymentMethod.WECHAT,
})
```

#### 4. 分享插件 (useShare)

小程序分享功能封装,支持微信、支付宝等多平台分享。

**主要功能:**

- 分享配置管理
- 动态分享内容
- 分享事件处理
- 多平台适配
- 分享链接追踪

**使用示例:**

```typescript
import { useShare } from '@/composables/useShare'

const { setShareData, triggerShare, handleShareAppMessage } = useShare({
  title: '产品详情',
  enableTimeline: true,
})

// 动态设置分享内容
setShareData({
  title: '精选好物推荐',
  imageUrl: '/static/share.png',
  extraParams: {
    productId: '123',
  },
})

// 触发分享
triggerShare()
```

#### 5. 字典插件 (useDict)

数据字典管理,支持字典缓存、类型转换、选项过滤等功能。

**主要功能:**

- 字典数据缓存
- 字典值转换
- 字典选项获取
- 多字典加载
- 类型安全

**使用示例:**

```typescript
import { useDict } from '@/composables/useDict'

const { dicts, getOptions, getLabel } = await useDict('sys_user_sex', 'sys_yes_no')

// 获取字典选项
const sexOptions = getOptions('sys_user_sex')

// 获取字典标签
const label = getLabel('sys_yes_no', '1') // "是"
```

### 权限管理插件

#### 6. 认证插件 (useAuth)

用户认证和授权管理,提供登录、登出、权限检查等功能。

**主要功能:**

- 用户登录/登出
- Token 管理
- 权限检查
- 角色验证
- 登录状态监听

**使用示例:**

```typescript
import { useAuth } from '@/composables/useAuth'

const {
  login,
  logout,
  hasPermission,
  hasRole,
  isAuthenticated,
} = useAuth()

// 登录
await login({
  username: 'admin',
  password: '123456',
})

// 权限检查
if (hasPermission('system:user:add')) {
  // 有权限
}

// 角色检查
if (hasRole('admin')) {
  // 是管理员
}
```

#### 7. Token 管理插件 (useToken)

访问令牌管理,支持 Token 存储、刷新、过期检测等功能。

**主要功能:**

- Token 存储管理
- Token 自动刷新
- 过期状态检测
- Token 清除
- 多端同步

**使用示例:**

```typescript
import { useToken } from '@/composables/useToken'

const {
  token,
  refreshToken,
  setToken,
  getToken,
  removeToken,
  isTokenExpired,
} = useToken()

// 设置 Token
setToken('your-access-token', 'your-refresh-token')

// 检查是否过期
if (isTokenExpired()) {
  await refreshToken()
}
```

### 应用配置插件

#### 8. 主题插件 (useTheme)

主题管理,支持亮色/暗色模式切换、自定义主题色等功能。

**主要功能:**

- 主题模式切换
- 主题色自定义
- CSS 变量管理
- 主题持久化
- 跟随系统主题

**使用示例:**

```typescript
import { useTheme } from '@/composables/useTheme'

const {
  theme,
  isDark,
  toggleTheme,
  setTheme,
  setPrimaryColor,
} = useTheme()

// 切换主题
toggleTheme()

// 设置主题色
setPrimaryColor('#1890ff')

// 设置为暗色模式
setTheme('dark')
```

#### 9. 国际化插件 (useI18n)

多语言支持,提供语言切换、文本翻译等功能。

**主要功能:**

- 多语言切换
- 文本翻译
- 语言持久化
- 动态加载语言包
- 插值替换

**使用示例:**

```typescript
import { useI18n } from '@/composables/useI18n'

const { locale, t, setLocale } = useI18n()

// 翻译文本
const title = t('common.title')

// 带参数翻译
const welcome = t('common.welcome', { name: '张三' })

// 切换语言
setLocale('en')
```

### 应用生命周期插件

#### 10. 应用初始化插件 (useAppInit)

应用启动初始化,处理租户配置、自动登录等功能。

**主要功能:**

- 应用启动初始化
- 租户信息获取
- 自动登录处理
- 平台适配初始化
- 单例模式保证

**使用示例:**

```typescript
import { useAppInit } from '@/composables/useAppInit'

const { init, isInitialized, tenantId } = useAppInit()

// 初始化应用
await init({
  autoLogin: true,
  fetchTenant: true,
})

// 检查是否已初始化
if (isInitialized.value) {
  console.log('应用已初始化')
}
```

### UI 交互插件

#### 11. 滚动插件 (useScroll)

页面滚动管理,提供滚动监听、回到顶部等功能。

**主要功能:**

- 滚动位置监听
- 滚动到指定位置
- 回到顶部
- 滚动方向检测
- 虚拟滚动支持

**使用示例:**

```typescript
import { useScroll } from '@/composables/useScroll'

const {
  scrollTop,
  scrollDirection,
  scrollToTop,
  scrollTo,
} = useScroll()

// 监听滚动位置
watch(scrollTop, (value) => {
  console.log('当前滚动位置:', value)
})

// 回到顶部
scrollToTop()

// 滚动到指定位置
scrollTo(500)
```

#### 12. 事件总线插件 (useEventBus)

事件发布订阅,实现组件间通信。

**主要功能:**

- 事件发布
- 事件订阅
- 事件取消订阅
- 类型安全
- 自动清理

**使用示例:**

```typescript
import { useEventBus } from '@/composables/useEventBus'

const { on, emit, off } = useEventBus()

// 订阅事件
const unsubscribe = on('user:update', (user) => {
  console.log('用户信息更新:', user)
})

// 发布事件
emit('user:update', { id: 1, name: '张三' })

// 取消订阅
unsubscribe()
```

## 插件使用规范

### 引入方式

```typescript
// 单个引入
import { useHttp } from '@/composables/useHttp'

// 多个引入
import { useAuth, useToken } from '@/composables'
```

### 使用位置

插件主要在以下场景使用:

1. **组件 setup 函数**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { login, logout } = useAuth()
</script>
```

2. **Composables 内部**

```typescript
// src/composables/useCustomLogic.ts
import { useHttp } from '@/composables/useHttp'

export const useCustomLogic = () => {
  const { get, post } = useHttp()

  const fetchData = async () => {
    const [err, data] = await get('/api/data')
    return data
  }

  return { fetchData }
}
```

3. **工具函数**

```typescript
// src/utils/api.ts
import { useHttp } from '@/composables/useHttp'

export const apiUtils = {
  fetchUserList: async () => {
    const { get } = useHttp()
    return await get('/api/users')
  },
}
```

### 最佳实践

#### 1. 避免重复创建

在同一个组件中,避免多次调用同一个插件:

```typescript
// ❌ 不推荐
const handleClick1 = () => {
  const { post } = useHttp()
  post('/api/action1', data)
}

const handleClick2 = () => {
  const { post } = useHttp()
  post('/api/action2', data)
}

// ✅ 推荐
const { post } = useHttp()

const handleClick1 = () => {
  post('/api/action1', data)
}

const handleClick2 = () => {
  post('/api/action2', data)
}
```

#### 2. 响应式数据使用

插件返回的响应式数据使用 `.value` 访问:

```typescript
const { isConnected } = useWebSocket()

// ✅ 正确
if (isConnected.value) {
  console.log('已连接')
}

// ❌ 错误
if (isConnected) { // 这是一个 Ref 对象,不是布尔值
  console.log('已连接')
}
```

#### 3. 清理资源

在组件卸载时,确保清理插件创建的资源:

```vue
<script lang="ts" setup>
import { onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, disconnect } = useWebSocket()

connect()

onUnmounted(() => {
  disconnect()
})
</script>
```

#### 4. 错误处理

始终处理插件可能抛出的错误:

```typescript
const { get } = useHttp()

try {
  const [err, data] = await get('/api/data')
  if (err) {
    console.error('请求失败:', err)
    return
  }
  // 处理数据
} catch (error) {
  console.error('未预期的错误:', error)
}
```

#### 5. TypeScript 类型

充分利用 TypeScript 类型提示:

```typescript
import type { User } from '@/types/user'

const { get } = useHttp()

// 指定返回类型
const [err, data] = await get<User>('/api/user/info')

if (data) {
  // data 的类型为 User
  console.log(data.username)
}
```

## 插件开发

### 创建自定义插件

创建自定义插件遵循以下规范:

```typescript
// src/composables/useCustomPlugin.ts
import { ref, computed, readonly } from 'vue'

/**
 * 自定义插件
 * @param options 配置选项
 */
export const useCustomPlugin = (options = {}) => {
  // 响应式状态
  const state = ref('initial')
  const loading = ref(false)

  // 计算属性
  const isReady = computed(() => state.value !== 'initial')

  // 方法
  const initialize = async () => {
    loading.value = true
    try {
      // 初始化逻辑
      state.value = 'ready'
    } finally {
      loading.value = false
    }
  }

  const cleanup = () => {
    state.value = 'initial'
  }

  // 返回公共 API
  return {
    // 只读状态
    state: readonly(state),
    loading: readonly(loading),
    isReady,

    // 方法
    initialize,
    cleanup,
  }
}
```

### 插件命名规范

1. **文件命名**: 使用 `use` 前缀,camelCase 命名
   - ✅ `useCustomPlugin.ts`
   - ❌ `customPlugin.ts`
   - ❌ `UseCustomPlugin.ts`

2. **导出名称**: 与文件名一致
   ```typescript
   // useCustomPlugin.ts
   export const useCustomPlugin = () => { ... }
   ```

3. **类型定义**: 使用 `[PluginName]Options` 和 `[PluginName]Return` 命名
   ```typescript
   interface CustomPluginOptions {
     // 选项类型
   }

   interface CustomPluginReturn {
     // 返回类型
   }
   ```

### 插件文档规范

每个插件应该包含:

1. **功能描述**: 简要说明插件用途
2. **API 文档**: 列出所有方法和属性
3. **使用示例**: 提供完整的使用示例
4. **注意事项**: 说明使用限制和注意事项

## 插件列表

### 已实现插件

| 插件名称 | 文件路径 | 功能描述 |
|---------|---------|---------|
| useHttp | `composables/useHttp.ts` | HTTP 请求封装 |
| useWebSocket | `composables/useWebSocket.ts` | WebSocket 实时通信 |
| usePayment | `composables/usePayment.ts` | 统一支付接口 |
| useShare | `composables/useShare.ts` | 小程序分享 |
| useWxShare | `composables/useWxShare.ts` | 微信分享 |
| useAuth | `composables/useAuth.ts` | 用户认证授权 |
| useToken | `composables/useToken.ts` | Token 管理 |
| useTheme | `composables/useTheme.ts` | 主题管理 |
| useI18n | `composables/useI18n.ts` | 国际化 |
| useDict | `composables/useDict.ts` | 数据字典 |
| useAppInit | `composables/useAppInit.ts` | 应用初始化 |
| useScroll | `composables/useScroll.ts` | 滚动管理 |
| useEventBus | `composables/useEventBus.ts` | 事件总线 |
| useSubscribe | `composables/useSubscribe.ts` | 订阅管理 |

### 平台差异说明

部分插件在不同平台有不同实现:

| 插件 | H5 | 小程序 | App | 说明 |
|------|-----|--------|-----|------|
| usePayment | ✅ | ✅ | ✅ | 支付方式自动适配 |
| useShare | ❌ | ✅ | ❌ | 仅小程序支持 |
| useWxShare | ✅ | ✅ | ✅ | 微信环境专用 |
| useWebSocket | ✅ | ✅ | ✅ | 全平台支持 |
| useAuth | ✅ | ✅ | ✅ | 全平台支持 |

## 常见问题

### 1. 插件在 setup 外使用报错

**问题原因:**

部分插件依赖 Vue 3 的 inject/provide,必须在 setup 上下文中使用。

**解决方案:**

```typescript
// ❌ 错误:在 setup 外使用
import { useAuth } from '@/composables/useAuth'
const { login } = useAuth() // 报错

// ✅ 正确:在 setup 中使用
export default {
  setup() {
    const { login } = useAuth()
    return { login }
  },
}
```

### 2. 响应式丢失

**问题原因:**

直接解构响应式对象会导致响应式丢失。

**解决方案:**

```typescript
import { useAuth } from '@/composables/useAuth'

// ❌ 错误:直接解构
const { isAuthenticated } = useAuth()
console.log(isAuthenticated) // 不是响应式

// ✅ 正确:使用 toRefs 或直接使用
import { toRefs } from 'vue'
const auth = useAuth()
const { isAuthenticated } = toRefs(auth)

// 或者
const { isAuthenticated } = useAuth()
console.log(isAuthenticated.value) // 正确
```

### 3. 插件状态不同步

**问题原因:**

多个组件使用同一个插件,但状态不共享。

**解决方案:**

使用单例模式或状态管理:

```typescript
// composables/useGlobalState.ts
import { ref } from 'vue'

const globalState = ref(null)

export const useGlobalState = () => {
  return { globalState }
}
```

### 4. 内存泄漏

**问题原因:**

插件创建的资源未正确清理。

**解决方案:**

```typescript
import { onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, disconnect } = useWebSocket()

connect()

// 组件卸载时清理
onUnmounted(() => {
  disconnect()
})
```

### 5. TypeScript 类型错误

**问题原因:**

缺少类型定义或类型不匹配。

**解决方案:**

```typescript
import type { User } from '@/types/user'
import { useHttp } from '@/composables/useHttp'

const { get } = useHttp()

// 指定类型
const [err, data] = await get<User>('/api/user')

if (data) {
  // data 现在有正确的类型
}
```

## 插件架构设计

### 插件分层架构

框架的插件采用分层架构设计，确保职责清晰、易于维护：

```
┌─────────────────────────────────────────┐
│              应用层 (Pages)              │
│  页面组件直接使用 Composables           │
├─────────────────────────────────────────┤
│            业务层 (Business)             │
│  usePayment, useShare, useAuth 等       │
├─────────────────────────────────────────┤
│             通用层 (Common)              │
│  useHttp, useWebSocket, useEventBus 等  │
├─────────────────────────────────────────┤
│             基础层 (Core)                │
│  useToken, useStorage, useConfig 等     │
├─────────────────────────────────────────┤
│            平台层 (Platform)             │
│  平台差异适配、条件编译                  │
└─────────────────────────────────────────┘
```

### 依赖注入模式

使用 Vue 3 的 provide/inject 实现依赖注入：

```typescript
// plugins/injection.ts
import { InjectionKey, provide, inject } from 'vue'

// 定义注入键
export const HTTP_KEY: InjectionKey<ReturnType<typeof useHttp>> = Symbol('http')
export const AUTH_KEY: InjectionKey<ReturnType<typeof useAuth>> = Symbol('auth')

// 提供依赖（在 App.vue 中）
export const providePlugins = () => {
  provide(HTTP_KEY, useHttp())
  provide(AUTH_KEY, useAuth())
}

// 注入依赖（在任意组件中）
export const injectHttp = () => {
  const http = inject(HTTP_KEY)
  if (!http) {
    throw new Error('useHttp 未在上层组件中提供')
  }
  return http
}
```

**使用示例：**

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { providePlugins } from '@/plugins/injection'

providePlugins()
</script>

<!-- 子组件 -->
<script lang="ts" setup>
import { injectHttp } from '@/plugins/injection'

const http = injectHttp()
const { get } = http
</script>
```

### 单例模式实现

对于需要全局共享状态的插件，使用单例模式：

```typescript
// composables/useSingleton.ts
import { ref, Ref } from 'vue'

// 创建单例工厂
function createSingleton<T>(factory: () => T): () => T {
  let instance: T | null = null

  return () => {
    if (!instance) {
      instance = factory()
    }
    return instance
  }
}

// 单例用户状态
const createUserState = () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  const setUser = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
  }

  const clearUser = () => {
    user.value = null
    isLoggedIn.value = false
  }

  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    setUser,
    clearUser
  }
}

export const useUserState = createSingleton(createUserState)
```

### 插件组合模式

多个插件可以组合使用，形成更复杂的业务逻辑：

```typescript
// composables/useUserProfile.ts
import { useHttp } from './useHttp'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

/**
 * 用户资料管理组合插件
 * 组合了 HTTP、认证、提示等多个基础插件
 */
export const useUserProfile = () => {
  const { get, put } = useHttp()
  const { isAuthenticated, userId } = useAuth()
  const { showSuccess, showError } = useToast()

  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)

  // 获取用户资料
  const fetchProfile = async () => {
    if (!isAuthenticated.value) {
      showError('请先登录')
      return
    }

    loading.value = true
    try {
      const [err, data] = await get<UserProfile>(`/api/user/${userId.value}/profile`)
      if (err) {
        showError('获取资料失败')
        return
      }
      profile.value = data
    } finally {
      loading.value = false
    }
  }

  // 更新用户资料
  const updateProfile = async (data: Partial<UserProfile>) => {
    loading.value = true
    try {
      const [err] = await put(`/api/user/${userId.value}/profile`, data)
      if (err) {
        showError('更新失败')
        return false
      }
      showSuccess('更新成功')
      await fetchProfile()
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    profile: readonly(profile),
    loading: readonly(loading),
    fetchProfile,
    updateProfile
  }
}
```

## 插件生命周期

### 生命周期钩子

插件可以响应组件的生命周期事件：

```typescript
// composables/useLifecyclePlugin.ts
import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

export const useLifecyclePlugin = (options: PluginOptions = {}) => {
  const { autoInit = true, autoCleanup = true } = options

  const isActive = ref(false)
  const isInitialized = ref(false)

  // 初始化逻辑
  const initialize = async () => {
    if (isInitialized.value) return

    console.log('[Plugin] 初始化')
    // 执行初始化逻辑
    isInitialized.value = true
  }

  // 清理逻辑
  const cleanup = () => {
    console.log('[Plugin] 清理')
    // 执行清理逻辑
    isInitialized.value = false
    isActive.value = false
  }

  // 挂载时自动初始化
  onMounted(() => {
    if (autoInit) {
      initialize()
    }
    isActive.value = true
  })

  // 卸载时自动清理
  onUnmounted(() => {
    if (autoCleanup) {
      cleanup()
    }
  })

  // 页面激活时恢复
  onActivated(() => {
    isActive.value = true
    console.log('[Plugin] 页面激活')
  })

  // 页面失活时暂停
  onDeactivated(() => {
    isActive.value = false
    console.log('[Plugin] 页面失活')
  })

  return {
    isActive: readonly(isActive),
    isInitialized: readonly(isInitialized),
    initialize,
    cleanup
  }
}
```

### 异步初始化

处理需要异步初始化的插件：

```typescript
// composables/useAsyncPlugin.ts
import { ref, onMounted } from 'vue'

interface AsyncPluginOptions {
  immediate?: boolean
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useAsyncPlugin = (options: AsyncPluginOptions = {}) => {
  const { immediate = true, onSuccess, onError } = options

  const isReady = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const initialize = async () => {
    if (isLoading.value || isReady.value) return

    isLoading.value = true
    error.value = null

    try {
      // 模拟异步初始化
      await performAsyncInit()

      isReady.value = true
      onSuccess?.()
    } catch (e) {
      error.value = e as Error
      onError?.(e as Error)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    isReady.value = false
    isLoading.value = false
    error.value = null
  }

  // 立即初始化
  if (immediate) {
    onMounted(initialize)
  }

  return {
    isReady: readonly(isReady),
    isLoading: readonly(isLoading),
    error: readonly(error),
    initialize,
    reset
  }
}

// 使用 Promise.withResolvers 实现等待初始化完成
export const useAwaitablePlugin = () => {
  let resolveInit: () => void
  let rejectInit: (reason: any) => void

  const initPromise = new Promise<void>((resolve, reject) => {
    resolveInit = resolve
    rejectInit = reject
  })

  const initialize = async () => {
    try {
      await performAsyncInit()
      resolveInit()
    } catch (e) {
      rejectInit(e)
    }
  }

  // 等待初始化完成
  const waitForReady = () => initPromise

  return {
    initialize,
    waitForReady
  }
}
```

## 跨平台兼容策略

### 条件编译

使用 UniApp 条件编译处理平台差异：

```typescript
// composables/usePlatformStorage.ts
export const usePlatformStorage = () => {
  const setItem = (key: string, value: string) => {
    // #ifdef H5
    localStorage.setItem(key, value)
    // #endif

    // #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS
    uni.setStorageSync(key, value)
    // #endif
  }

  const getItem = (key: string): string | null => {
    // #ifdef H5
    return localStorage.getItem(key)
    // #endif

    // #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS
    return uni.getStorageSync(key) || null
    // #endif
  }

  const removeItem = (key: string) => {
    // #ifdef H5
    localStorage.removeItem(key)
    // #endif

    // #ifdef MP-WEIXIN || MP-ALIPAY || APP-PLUS
    uni.removeStorageSync(key)
    // #endif
  }

  return { setItem, getItem, removeItem }
}
```

### 平台适配器模式

使用适配器模式统一不同平台的 API：

```typescript
// composables/adapters/paymentAdapter.ts

// 支付适配器接口
interface PaymentAdapter {
  pay(params: PaymentParams): Promise<PaymentResult>
  queryOrder(orderId: string): Promise<OrderStatus>
}

// 微信支付适配器
const wechatPayAdapter: PaymentAdapter = {
  async pay(params) {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      wx.requestPayment({
        ...params,
        success: (res) => resolve({ success: true, data: res }),
        fail: (err) => reject(err)
      })
      // #endif
    })
  },

  async queryOrder(orderId) {
    // 调用后端查询接口
    const { get } = useHttp()
    const [err, data] = await get(`/api/pay/query/${orderId}`)
    return data
  }
}

// 支付宝支付适配器
const alipayAdapter: PaymentAdapter = {
  async pay(params) {
    return new Promise((resolve, reject) => {
      // #ifdef MP-ALIPAY
      my.tradePay({
        ...params,
        success: (res) => resolve({ success: true, data: res }),
        fail: (err) => reject(err)
      })
      // #endif
    })
  },

  async queryOrder(orderId) {
    const { get } = useHttp()
    const [err, data] = await get(`/api/pay/alipay/query/${orderId}`)
    return data
  }
}

// 获取当前平台适配器
export const getPaymentAdapter = (): PaymentAdapter => {
  // #ifdef MP-WEIXIN
  return wechatPayAdapter
  // #endif

  // #ifdef MP-ALIPAY
  return alipayAdapter
  // #endif

  throw new Error('当前平台不支持支付')
}
```

### 平台能力检测

运行时检测平台能力：

```typescript
// composables/usePlatformCapability.ts
export const usePlatformCapability = () => {
  const capabilities = ref({
    bluetooth: false,
    nfc: false,
    camera: true,
    location: true,
    biometric: false,
    notification: true
  })

  const checkCapabilities = async () => {
    // #ifdef APP-PLUS
    // App 平台检测
    capabilities.value.bluetooth = !!plus.bluetooth
    capabilities.value.nfc = !!plus.nfc
    capabilities.value.biometric = !!plus.fingerprint || !!plus.faceId
    // #endif

    // #ifdef MP-WEIXIN
    // 微信小程序检测
    try {
      const setting = await uni.getSetting()
      capabilities.value.location = !!setting.authSetting['scope.userLocation']
      capabilities.value.camera = !!setting.authSetting['scope.camera']
    } catch (e) {
      console.warn('获取设置失败:', e)
    }
    // #endif

    // #ifdef H5
    // H5 平台检测
    capabilities.value.bluetooth = 'bluetooth' in navigator
    capabilities.value.notification = 'Notification' in window
    capabilities.value.biometric = 'credentials' in navigator
    // #endif
  }

  // 检查单个能力
  const hasCapability = (name: keyof typeof capabilities.value) => {
    return capabilities.value[name]
  }

  // 请求权限
  const requestPermission = async (permission: string): Promise<boolean> => {
    // #ifdef MP-WEIXIN
    try {
      await uni.authorize({ scope: permission })
      return true
    } catch (e) {
      return false
    }
    // #endif

    // #ifdef H5
    if (permission === 'notification') {
      const result = await Notification.requestPermission()
      return result === 'granted'
    }
    return true
    // #endif

    return false
  }

  return {
    capabilities: readonly(capabilities),
    checkCapabilities,
    hasCapability,
    requestPermission
  }
}
```

## 状态管理集成

### 与 Pinia 集成

将插件与 Pinia 状态管理结合：

```typescript
// stores/usePluginStore.ts
import { defineStore } from 'pinia'
import { useHttp } from '@/composables/useHttp'

export const usePluginStore = defineStore('plugin', () => {
  const { get, post } = useHttp()

  // 状态
  const plugins = ref<Plugin[]>([])
  const activePlugin = ref<string | null>(null)
  const loading = ref(false)

  // 获取插件列表
  const fetchPlugins = async () => {
    loading.value = true
    try {
      const [err, data] = await get<Plugin[]>('/api/plugins')
      if (!err && data) {
        plugins.value = data
      }
    } finally {
      loading.value = false
    }
  }

  // 激活插件
  const activatePlugin = async (pluginId: string) => {
    const [err] = await post(`/api/plugins/${pluginId}/activate`)
    if (!err) {
      activePlugin.value = pluginId
    }
    return !err
  }

  // Getters
  const getPlugin = (id: string) => {
    return plugins.value.find(p => p.id === id)
  }

  const isPluginActive = (id: string) => {
    return activePlugin.value === id
  }

  return {
    plugins,
    activePlugin,
    loading,
    fetchPlugins,
    activatePlugin,
    getPlugin,
    isPluginActive
  }
})
```

### 响应式状态同步

确保插件状态与 Store 同步：

```typescript
// composables/useSyncedPlugin.ts
import { watch } from 'vue'
import { useUserStore } from '@/stores/user'

export const useSyncedPlugin = () => {
  const userStore = useUserStore()
  const localState = ref<UserState | null>(null)

  // 同步 Store 状态到本地
  watch(
    () => userStore.user,
    (newUser) => {
      localState.value = newUser ? { ...newUser } : null
    },
    { immediate: true, deep: true }
  )

  // 更新时同步回 Store
  const updateState = (data: Partial<UserState>) => {
    if (localState.value) {
      Object.assign(localState.value, data)
      userStore.updateUser(localState.value)
    }
  }

  return {
    state: localState,
    updateState
  }
}
```

## 错误处理模式

### 全局错误边界

创建插件级别的错误边界：

```typescript
// composables/usePluginErrorBoundary.ts
import { ref, onErrorCaptured } from 'vue'

interface ErrorInfo {
  message: string
  stack?: string
  component?: string
  timestamp: number
}

export const usePluginErrorBoundary = () => {
  const errors = ref<ErrorInfo[]>([])
  const hasError = ref(false)

  // 捕获子组件错误
  onErrorCaptured((err, instance, info) => {
    const errorInfo: ErrorInfo = {
      message: err.message,
      stack: err.stack,
      component: instance?.$options.name,
      timestamp: Date.now()
    }

    errors.value.push(errorInfo)
    hasError.value = true

    // 上报错误
    reportError(errorInfo)

    // 返回 false 阻止错误继续传播
    return false
  })

  // 重置错误状态
  const resetError = () => {
    hasError.value = false
  }

  // 清除所有错误
  const clearErrors = () => {
    errors.value = []
    hasError.value = false
  }

  return {
    errors: readonly(errors),
    hasError: readonly(hasError),
    resetError,
    clearErrors
  }
}
```

### 重试机制

为插件操作添加自动重试：

```typescript
// composables/useRetry.ts
interface RetryOptions {
  maxRetries?: number
  delay?: number
  backoff?: boolean
  onRetry?: (attempt: number, error: Error) => void
}

export const useRetry = () => {
  const retry = async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = true,
      onRetry
    } = options

    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        if (attempt < maxRetries) {
          onRetry?.(attempt + 1, lastError)

          // 计算延迟时间（指数退避）
          const waitTime = backoff
            ? delay * Math.pow(2, attempt)
            : delay

          await sleep(waitTime)
        }
      }
    }

    throw lastError!
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  return { retry }
}

// 使用示例
const { retry } = useRetry()

const fetchWithRetry = async () => {
  return await retry(
    async () => {
      const [err, data] = await get('/api/unstable-endpoint')
      if (err) throw err
      return data
    },
    {
      maxRetries: 3,
      delay: 1000,
      onRetry: (attempt) => {
        console.log(`重试第 ${attempt} 次...`)
      }
    }
  )
}
```

### 降级处理

当插件功能不可用时的降级策略：

```typescript
// composables/useFallback.ts
interface FallbackOptions<T> {
  primary: () => Promise<T>
  fallback: () => Promise<T>
  shouldFallback?: (error: Error) => boolean
}

export const useFallback = () => {
  const withFallback = async <T>(options: FallbackOptions<T>): Promise<T> => {
    const {
      primary,
      fallback,
      shouldFallback = () => true
    } = options

    try {
      return await primary()
    } catch (error) {
      if (shouldFallback(error as Error)) {
        console.warn('主要方法失败，使用降级方案:', error)
        return await fallback()
      }
      throw error
    }
  }

  return { withFallback }
}

// 使用示例
const { withFallback } = useFallback()

const getLocation = async () => {
  return await withFallback({
    // 主要方法：使用高精度定位
    primary: async () => {
      return await uni.getLocation({ type: 'gcj02', isHighAccuracy: true })
    },
    // 降级方法：使用 IP 定位
    fallback: async () => {
      const { get } = useHttp()
      const [err, data] = await get('/api/location/ip')
      return data
    },
    // 判断是否需要降级
    shouldFallback: (error) => {
      return error.message.includes('定位失败')
    }
  })
}
```

## 性能优化

### 懒加载插件

按需加载插件以减少初始加载时间：

```typescript
// composables/useLazyPlugin.ts
import { shallowRef, triggerRef } from 'vue'

export const useLazyPlugin = <T>(loader: () => Promise<T>) => {
  const plugin = shallowRef<T | null>(null)
  const loading = ref(false)
  const loaded = ref(false)

  const load = async (): Promise<T> => {
    if (loaded.value && plugin.value) {
      return plugin.value
    }

    loading.value = true
    try {
      plugin.value = await loader()
      loaded.value = true
      triggerRef(plugin)
      return plugin.value
    } finally {
      loading.value = false
    }
  }

  return {
    plugin,
    loading: readonly(loading),
    loaded: readonly(loaded),
    load
  }
}

// 使用示例：懒加载地图插件
const { plugin: mapPlugin, load: loadMap, loaded } = useLazyPlugin(async () => {
  // 动态导入地图 SDK
  const { default: AMap } = await import('@amap/amap-jsapi-loader')
  await AMap.load({
    key: 'your-key',
    version: '2.0'
  })
  return window.AMap
})

// 需要时才加载
const initMap = async () => {
  const AMap = await loadMap()
  const map = new AMap.Map('container')
}
```

### 缓存策略

为插件数据添加缓存：

```typescript
// composables/useCachedPlugin.ts
interface CacheOptions {
  ttl?: number // 缓存时间（毫秒）
  key?: string
  storage?: 'memory' | 'local' | 'session'
}

const memoryCache = new Map<string, { data: any; expiry: number }>()

export const useCachedPlugin = <T>(options: CacheOptions = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 默认5分钟
    key = 'default',
    storage = 'memory'
  } = options

  const getFromCache = (): T | null => {
    if (storage === 'memory') {
      const cached = memoryCache.get(key)
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T
      }
      memoryCache.delete(key)
      return null
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage
    const cached = storageObj.getItem(key)
    if (cached) {
      const { data, expiry } = JSON.parse(cached)
      if (expiry > Date.now()) {
        return data as T
      }
      storageObj.removeItem(key)
    }
    return null
  }

  const setToCache = (data: T) => {
    const expiry = Date.now() + ttl

    if (storage === 'memory') {
      memoryCache.set(key, { data, expiry })
      return
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage
    storageObj.setItem(key, JSON.stringify({ data, expiry }))
  }

  const clearCache = () => {
    if (storage === 'memory') {
      memoryCache.delete(key)
      return
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage
    storageObj.removeItem(key)
  }

  // 带缓存的数据获取
  const fetchWithCache = async (fetcher: () => Promise<T>): Promise<T> => {
    // 先检查缓存
    const cached = getFromCache()
    if (cached !== null) {
      return cached
    }

    // 缓存未命中，获取新数据
    const data = await fetcher()
    setToCache(data)
    return data
  }

  return {
    getFromCache,
    setToCache,
    clearCache,
    fetchWithCache
  }
}
```

### 防抖节流

为高频操作添加防抖节流：

```typescript
// composables/useThrottledPlugin.ts
import { ref, watch } from 'vue'

interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

export const useThrottledPlugin = () => {
  // 防抖
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timer: ReturnType<typeof setTimeout> | null = null

    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn(...args)
        timer = null
      }, delay)
    }
  }

  // 节流
  const throttle = <T extends (...args: any[]) => any>(
    fn: T,
    interval: number,
    options: ThrottleOptions = {}
  ): ((...args: Parameters<T>) => void) => {
    const { leading = true, trailing = true } = options
    let lastTime = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    return (...args: Parameters<T>) => {
      const now = Date.now()

      if (!lastTime && !leading) {
        lastTime = now
      }

      const remaining = interval - (now - lastTime)

      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        fn(...args)
        lastTime = now
      } else if (!timer && trailing) {
        timer = setTimeout(() => {
          fn(...args)
          lastTime = leading ? Date.now() : 0
          timer = null
        }, remaining)
      }
    }
  }

  // 创建防抖响应式值
  const useDebouncedRef = <T>(value: T, delay: number) => {
    const debouncedValue = ref(value) as Ref<T>
    const rawValue = ref(value) as Ref<T>

    const updateDebounced = debounce((newValue: T) => {
      debouncedValue.value = newValue
    }, delay)

    watch(rawValue, (newValue) => {
      updateDebounced(newValue)
    })

    return {
      value: rawValue,
      debouncedValue: readonly(debouncedValue)
    }
  }

  return {
    debounce,
    throttle,
    useDebouncedRef
  }
}
```

## 插件测试

### 单元测试

使用 Vitest 测试插件：

```typescript
// composables/__tests__/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../useAuth'

// Mock HTTP 请求
vi.mock('../useHttp', () => ({
  useHttp: () => ({
    post: vi.fn().mockResolvedValue([null, { token: 'mock-token' }]),
    get: vi.fn().mockResolvedValue([null, { userId: 1, username: 'admin' }])
  })
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully', async () => {
    const { login, isAuthenticated } = useAuth()

    await login({ username: 'admin', password: '123456' })

    expect(isAuthenticated.value).toBe(true)
  })

  it('should logout correctly', async () => {
    const { login, logout, isAuthenticated } = useAuth()

    await login({ username: 'admin', password: '123456' })
    logout()

    expect(isAuthenticated.value).toBe(false)
  })

  it('should check permission correctly', async () => {
    const { hasPermission, setPermissions } = useAuth()

    setPermissions(['user:read', 'user:write'])

    expect(hasPermission('user:read')).toBe(true)
    expect(hasPermission('user:delete')).toBe(false)
  })
})
```

### 集成测试

测试插件与组件的集成：

```typescript
// composables/__tests__/usePayment.integration.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import PaymentButton from '@/components/PaymentButton.vue'

describe('Payment Integration', () => {
  it('should complete payment flow', async () => {
    const wrapper = mount(PaymentButton, {
      props: {
        orderId: '123',
        amount: 100
      }
    })

    // 点击支付按钮
    await wrapper.find('button').trigger('click')

    // 等待支付流程完成
    await wrapper.vm.$nextTick()

    // 验证支付成功
    expect(wrapper.emitted('success')).toBeTruthy()
  })
})
```

## 调试技巧

### 开发者工具集成

```typescript
// composables/useDevTools.ts
export const useDevTools = () => {
  const isDev = import.meta.env.DEV

  const log = (namespace: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[${namespace}]`, ...args)
    }
  }

  const warn = (namespace: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[${namespace}]`, ...args)
    }
  }

  const time = (label: string) => {
    if (isDev) {
      console.time(label)
    }
  }

  const timeEnd = (label: string) => {
    if (isDev) {
      console.timeEnd(label)
    }
  }

  // 性能标记
  const mark = (name: string) => {
    if (isDev && performance?.mark) {
      performance.mark(name)
    }
  }

  const measure = (name: string, startMark: string, endMark: string) => {
    if (isDev && performance?.measure) {
      performance.measure(name, startMark, endMark)
    }
  }

  return {
    log,
    warn,
    time,
    timeEnd,
    mark,
    measure
  }
}
```

## 总结

插件系统的核心要点：

| 特性 | 说明 |
|------|------|
| Composition API | 基于 Vue 3 Composition API 实现，代码组织清晰 |
| TypeScript | 完整的类型定义，提供良好的开发体验 |
| 响应式 | 充分利用 Vue 3 响应式系统 |
| 跨平台 | 支持条件编译，适配多平台 |
| 可组合 | 插件可以相互组合，构建复杂功能 |
| 可测试 | 易于编写单元测试和集成测试 |
| 性能优化 | 支持懒加载、缓存、防抖节流等优化策略 |
| 错误处理 | 完善的错误边界和重试机制 |

**开发建议：**

1. **遵循规范** - 使用 `use` 前缀命名插件
2. **类型优先** - 定义完整的 TypeScript 类型
3. **单一职责** - 每个插件只负责一个功能
4. **组合复用** - 通过组合构建复杂功能
5. **错误处理** - 始终处理可能的错误情况
6. **性能意识** - 避免不必要的响应式开销
7. **测试覆盖** - 为关键功能编写测试
