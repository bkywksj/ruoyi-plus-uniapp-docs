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

## 扩展阅读

- Vue 3 Composition API 官方文档
- UniApp API 文档
- TypeScript 官方文档
