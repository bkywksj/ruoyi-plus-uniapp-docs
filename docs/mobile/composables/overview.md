# 组合式函数概览

## 介绍

RuoYi-Plus-UniApp 提供了一套完整的组合式函数(Composables),基于 Vue 3 Composition API 设计,封装了常用的业务逻辑和功能模块,帮助开发者快速构建功能丰富、可维护性高的移动应用。

**核心特性:**

- **Vue 3 Composition API** - 基于 Vue 3 组合式 API 设计,符合现代前端开发规范
- **TypeScript 支持** - 完整的 TypeScript 类型定义,提供智能提示和类型检查
- **响应式设计** - 充分利用 Vue 3 响应式系统,实现状态自动更新
- **可复用性强** - 组合式函数设计,可在任意组件中灵活复用
- **状态管理集成** - 深度集成 Pinia 状态管理,简化全局状态操作
- **平台兼容** - 完美兼容 UniApp 多平台(H5、微信小程序、支付宝小程序、APP)
- **业务场景丰富** - 覆盖认证、HTTP 请求、支付、字典、WebSocket 等常见业务场景
- **错误处理完善** - 统一的错误处理机制,提高应用稳定性
- **自动资源清理** - 组件卸载时自动清理监听器和连接,避免内存泄漏

## 架构概览

### 组合式函数分类

项目中的组合式函数分为两大类:

```text
composables/
├── 应用级组合式函数 (src/composables/)
│   ├── useAuth.ts          # 认证与权限管理
│   ├── useHttp.ts          # HTTP 请求封装
│   ├── useToken.ts         # Token 管理
│   ├── useDict.ts          # 字典数据管理
│   ├── usePayment.ts       # 支付功能
│   ├── useWebSocket.ts     # WebSocket 连接
│   ├── useEventBus.ts      # 事件总线
│   ├── useTheme.ts         # 主题配置
│   ├── useI18n.ts          # 国际化
│   ├── useShare.ts         # 分享功能
│   ├── useWxShare.ts       # 微信分享
│   ├── useScroll.ts        # 滚动控制
│   ├── useAppInit.ts       # 应用初始化
│   ├── useSubscribe.ts     # 消息订阅
│   └── useImageCompress.ts # 图片压缩(跨端)
│
└── 组件级组合式函数 (src/wd/components/composables/)
    ├── useParent.ts        # 父组件通信
    ├── useChildren.ts      # 子组件管理
    ├── useQueue.ts         # 弹出层队列
    ├── usePopover.ts       # 弹出层控制
    ├── useTouch.ts         # 触摸事件
    ├── useCountDown.ts     # 倒计时
    ├── useCell.ts          # 单元格组件
    ├── useLockScroll.ts    # 滚动锁定
    ├── useRaf.ts           # 动画帧
    ├── useTranslate.ts     # 国际化翻译
    └── useUpload.ts        # 文件上传
```

### 设计原则

**1. 单一职责原则**

每个组合式函数只负责一个特定的功能域:

```typescript
// ✅ 好的设计 - 职责单一
const { hasPermission } = useAuth()     // 只处理权限
const { get, post } = useHttp()         // 只处理请求
const { getToken, setToken } = useToken() // 只处理 Token

// ❌ 不好的设计 - 职责过多
const { login, fetchData, saveToken, checkPermission } = useEverything()
```

**2. 组合优于继承**

通过组合多个小型组合式函数实现复杂功能:

```typescript
// 组合多个 composable 实现复杂业务逻辑
const useUserManagement = () => {
  const { hasPermission } = useAuth()
  const { get, post } = useHttp()
  const { emit } = useEventBus()

  const loadUsers = async () => {
    if (!hasPermission('system:user:list')) {
      throw new Error('无权限')
    }
    const [error, users] = await get('/api/users')
    if (!error) {
      emit('users:loaded', users)
    }
    return users
  }

  return { loadUsers }
}
```

**3. 响应式优先**

所有状态都使用 Vue 3 响应式系统:

```typescript
export const useAuth = () => {
  const userStore = useUserStore()

  // 使用 computed 确保响应性
  const isLoggedIn = computed(() => {
    return userStore.token && userStore.token.length > 0
  })

  return { isLoggedIn }
}
```

**4. 自动资源清理**

组件卸载时自动清理资源:

```typescript
export const useEventBus = () => {
  const unsubscribers: (() => void)[] = []

  const on = (event: string, callback: EventCallback) => {
    const unsubscribe = eventBus.on(event, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  // 组件卸载时自动清理所有监听器
  onUnmounted(() => {
    unsubscribers.forEach((fn) => fn())
    unsubscribers.length = 0
  })

  return { on }
}
```

## 应用级组合式函数

### 1. useAuth - 认证与权限管理

提供用户认证与权限检查功能,包括权限字符串检查、角色校验和路由访问控制。

**核心功能:**

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `isLoggedIn` | 登录状态(响应式) | `ComputedRef<boolean>` |
| `isSuperAdmin` | 检查超级管理员 | `boolean` |
| `isTenantAdmin` | 检查租户管理员 | `boolean` |
| `isAnyAdmin` | 检查任意管理员 | `boolean` |
| `hasPermission` | 检查单个/多个权限(OR) | `boolean` |
| `hasAllPermissions` | 检查所有权限(AND) | `boolean` |
| `hasRole` | 检查单个/多个角色(OR) | `boolean` |
| `hasAllRoles` | 检查所有角色(AND) | `boolean` |
| `hasTenantPermission` | 租户范围权限检查 | `boolean` |
| `canAccessRoute` | 路由访问检查 | `boolean` |
| `filterAuthorizedRoutes` | 过滤授权路由 | `Route[]` |

**内置常量:**

```typescript
const SUPER_ADMIN = 'superadmin'      // 超级管理员角色标识
const TENANT_ADMIN = 'admin'          // 租户管理员角色标识
const ALL_PERMISSION = '*:*:*'        // 通配符权限标识
```

**使用示例:**

```typescript
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, isSuperAdmin, isLoggedIn } = useAuth()

// 响应式登录状态
watchEffect(() => {
  if (isLoggedIn.value) {
    console.log('用户已登录')
  }
})

// 检查单个权限
const canEdit = hasPermission('system:user:edit')

// 检查多个权限(满足任一)
const canManage = hasPermission(['system:user:add', 'system:user:update'])

// 检查所有权限(必须全部满足)
const hasFullControl = hasAllPermissions([
  'system:user:add',
  'system:user:edit',
  'system:user:delete'
])

// 检查角色
const isAdmin = hasRole('admin')

// 检查超级管理员
if (isSuperAdmin()) {
  console.log('拥有所有权限')
}

// 租户权限检查
const canEditInTenant = hasTenantPermission('system:user:edit', 'tenant001')
```

**权限检查逻辑:**

```text
hasPermission 执行流程:
┌─────────────────────────────────────┐
│ 1. 检查权限参数是否有效              │
│    ↓                                │
│ 2. 检查是否为超级管理员              │
│    → 是: 返回 true                  │
│    ↓                                │
│ 3. 检查是否拥有通配符权限 *:*:*      │
│    → 是: 返回 true                  │
│    ↓                                │
│ 4. 遍历权限数组,检查是否匹配         │
│    → 任一匹配: 返回 true            │
│    → 全部不匹配: 返回 false         │
└─────────────────────────────────────┘
```

### 2. useHttp - HTTP 请求管理

提供统一的 HTTP 请求封装,支持请求拦截、响应处理、数据加密、错误处理等功能。

**核心功能:**

| 方法 | 说明 |
|------|------|
| `get<T>()` | GET 请求 |
| `post<T>()` | POST 请求 |
| `put<T>()` | PUT 请求 |
| `del<T>()` | DELETE 请求 |
| `upload()` | 文件上传 |
| `download()` | 文件下载 |

**链式方法:**

| 方法 | 说明 |
|------|------|
| `noAuth()` | 禁用认证(不携带 Token) |
| `encrypt()` | 启用请求/响应加密 |
| `skipWait()` | 跳过等待队列 |
| `timeout(ms)` | 设置超时时间 |
| `header(key, value)` | 添加请求头 |

**使用示例:**

```typescript
import { http } from '@/composables/useHttp'

// 基本 GET 请求
const [error, data] = await http.get<User[]>('/api/users')
if (error) {
  console.error('请求失败:', error)
  return
}
console.log('用户列表:', data)

// POST 请求
const [err, result] = await http.post('/api/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})

// 链式调用 - 禁用认证 + 启用加密
const [loginErr, loginData] = await http
  .noAuth()
  .encrypt()
  .post('/api/login', { username, password })

// 文件上传
const [uploadErr, uploadResult] = await http.upload('/api/upload', {
  file: tempFilePath,
  formData: { type: 'avatar' }
})

// 自定义超时
const [timeoutErr, data] = await http
  .timeout(30000)
  .get('/api/large-data')
```

**请求拦截器功能:**

- 自动添加 Token 认证头
- 自动添加租户信息
- 防重复提交检测
- 请求数据加密(可选)
- 统一错误处理

### 3. useToken - Token 管理

提供 Token 的存取、删除和认证头部生成功能。

**核心功能:**

| 方法/属性 | 说明 | 类型 |
|----------|------|------|
| `token` | 响应式 Token | `ComputedRef<string \| null>` |
| `getToken()` | 获取 Token | `string \| null` |
| `setToken()` | 设置 Token(7天有效期) | `void` |
| `removeToken()` | 移除 Token | `void` |
| `getAuthHeaders()` | 获取认证头对象 | `Record<string, string>` |
| `getAuthQuery()` | 获取认证查询字符串 | `string` |

**使用示例:**

```typescript
import { useToken } from '@/composables/useToken'

const { token, getToken, setToken, removeToken, getAuthHeaders } = useToken()

// 响应式 Token
watchEffect(() => {
  if (token.value) {
    console.log('Token 已设置')
  }
})

// 设置 Token (自动设置7天过期)
setToken('eyJhbGciOiJIUzI1NiIs...')

// 获取认证头
const headers = getAuthHeaders()
// { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIs...' }

// 登出时移除 Token
const logout = () => {
  removeToken()
  uni.reLaunch({ url: '/pages/login/index' })
}
```

### 4. useDict - 字典数据管理

提供字典数据查询、缓存和标签获取功能,简化字典数据的使用。

**核心功能:**

| 方法 | 说明 |
|------|------|
| `getDict()` | 获取字典数据 |
| `getDictOptions()` | 获取字典选项 |
| `getDictLabel()` | 根据值获取标签 |
| `getDictValue()` | 根据标签获取值 |

**使用示例:**

```typescript
import { useDict } from '@/composables/useDict'

const { getDict, getDictLabel, getDictOptions } = useDict()

// 获取字典数据
const statusDict = await getDict('sys_status')

// 获取标签
const label = getDictLabel('sys_status', '1')  // '正常'

// 获取选项(用于下拉框)
const options = await getDictOptions('sys_status')
// [{ label: '正常', value: '1' }, { label: '停用', value: '0' }]
```

### 5. usePayment - 支付功能管理

提供统一的支付功能封装,支持微信支付、支付宝支付、余额支付等多种支付方式。

**支持的支付方式:**

| 支付方式 | 平台 | 说明 |
|---------|------|------|
| 微信 JSAPI | 微信小程序 | 小程序内支付 |
| 微信 Native | H5 | 扫码支付 |
| 微信 APP | APP | 原生 APP 支付 |
| 微信 H5 | H5 | 手机网页支付 |
| 支付宝 WAP | H5 | 手机网页支付 |
| 支付宝 PAGE | PC | 网页支付 |
| 余额支付 | 全平台 | 账户余额支付 |

**使用示例:**

```typescript
import { usePayment } from '@/composables/usePayment'

const { pay, queryPaymentStatus } = usePayment()

// 发起支付
const handlePay = async () => {
  try {
    await pay({
      orderId: '202401010001',
      paymentMethod: 'wechat',
      amount: 9900  // 单位: 分
    })
    console.log('支付成功')
  } catch (error) {
    console.error('支付失败:', error)
  }
}

// 查询支付状态
const status = await queryPaymentStatus('202401010001')
```

### 6. useWebSocket - WebSocket 连接管理

提供 WebSocket 连接管理功能,支持连接、断开、消息发送、事件监听等。

**核心功能:**

| 方法 | 说明 |
|------|------|
| `connect()` | 建立连接 |
| `disconnect()` | 断开连接 |
| `reconnect()` | 重新连接 |
| `send()` | 发送消息 |
| `on()` | 监听事件 |
| `off()` | 移除监听 |

**特性:**

- 自动重连机制
- 心跳检测保活
- 消息队列(离线消息缓存)
- 连接状态响应式

**使用示例:**

```typescript
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, send, on, disconnect, isConnected } = useWebSocket('wss://example.com/ws')

// 连接
await connect()

// 响应式连接状态
watchEffect(() => {
  console.log('连接状态:', isConnected.value ? '已连接' : '未连接')
})

// 监听消息
on('message', (data) => {
  console.log('收到消息:', data)
})

on('notification', (data) => {
  uni.showToast({ title: data.content })
})

// 发送消息
send({
  type: 'chat',
  content: 'Hello World'
})

// 组件卸载时断开
onUnmounted(() => {
  disconnect()
})
```

### 7. useEventBus - 事件总线

提供组件间的事件通信功能,支持发布订阅模式的事件管理。

**核心功能:**

| 方法 | 说明 |
|------|------|
| `on()` | 监听事件(自动清理) |
| `once()` | 一次性监听(自动清理) |
| `emit()` | 发送事件 |
| `off()` | 移除监听 |
| `getListenerCount()` | 获取监听器数量 |

**预定义事件名:**

```typescript
const EventNames = {
  // 页面相关
  PAGE_BACK: 'pageBack',
  TAB_CHANGED: 'tabChanged',
  PAGE_REFRESH: 'pageRefresh',

  // 用户相关
  USER_LOGIN: 'userLogin',
  USER_LOGOUT: 'userLogout',
  USER_PROFILE_UPDATED: 'userProfileUpdated',

  // 系统相关
  NETWORK_STATUS_CHANGED: 'networkStatusChanged',
  API_ERROR: 'apiError',
}
```

**使用示例:**

```typescript
import { useEventBus, EventNames } from '@/composables/useEventBus'

// 组件 A: 监听事件
const { on, EventNames } = useEventBus()

on(EventNames.USER_PROFILE_UPDATED, (userData) => {
  console.log('用户信息更新:', userData)
  refreshUserInfo()
})

// 组件 B: 发送事件
const { emit, EventNames } = useEventBus()

const updateProfile = async () => {
  await saveProfile()
  emit(EventNames.USER_PROFILE_UPDATED, { name: '新名字' })
}
```

### 8. useTheme - 主题配置

提供统一的主题配置管理,支持默认主题、全局覆盖和局部定制。

**优先级:** 默认主题 < 全局覆盖 < 局部覆盖

**核心功能:**

| 方法/属性 | 说明 |
|----------|------|
| `themeVars` | 响应式主题变量 |
| `setGlobalTheme()` | 设置全局主题 |
| `resetGlobalTheme()` | 重置全局主题 |
| `getCurrentTheme()` | 获取当前主题配置 |

**使用示例:**

```typescript
import { useTheme } from '@/composables/useTheme'

// 基础使用
const { themeVars } = useTheme()

// 局部定制
const { themeVars } = useTheme({
  colorTheme: '#ff4757',
  buttonPrimaryBgColor: '#ff4757'
})

// 全局主题管理
const { setGlobalTheme, resetGlobalTheme } = useTheme()

// 切换暗色主题
const toggleDarkMode = () => {
  setGlobalTheme({
    colorTheme: '#1a1a2e',
    messageBoxTitleColor: '#ffffff',
    messageBoxContentColor: '#cccccc'
  })
}

// 重置为默认主题
const resetTheme = () => {
  resetGlobalTheme()
}
```

**默认主题变量:**

```typescript
const DEFAULT_THEME = {
  // 基础色彩
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',

  // Loading 组件
  loadingSize: '40rpx',

  // MessageBox 组件
  messageBoxTitleColor: '#333333',
  messageBoxContentColor: '#666666',

  // Notify 组件
  notifyPadding: '24rpx 32rpx',
  notifyFontSize: '28rpx',

  // 导航栏
  navbarTitleFontSize: '32rpx',
  navbarTitleFontWeight: 'normal',
}
```

### 9. 其他应用级组合式函数

| 组合式函数 | 说明 | 主要功能 |
|-----------|------|---------|
| `useShare` | 分享功能 | 页面分享配置 |
| `useWxShare` | 微信分享 | 微信特定分享功能 |
| `useScroll` | 滚动控制 | 滚动位置、方向检测 |
| `useI18n` | 国际化 | 多语言支持 |
| `useAppInit` | 应用初始化 | 启动初始化流程 |
| `useSubscribe` | 消息订阅 | 小程序消息订阅 |
| `useImageCompress` | 图片压缩 | 跨端图片压缩、wd-upload 上传前自动压缩 |

## 组件级组合式函数

这些组合式函数主要用于 WD UI 组件库内部,提供组件间通信和状态管理功能。

### 1. useParent - 父组件通信

用于子组件注册到父组件中,建立父子组件关系。

**功能特性:**

- 自动注册和注销
- 获取父组件实例
- 获取在兄弟组件中的索引位置
- 组件卸载时自动清理

**使用示例:**

```typescript
import { useParent } from '@/wd/components/composables/useParent'
import type { InjectionKey } from 'vue'

interface FormContext {
  validate: () => Promise<boolean>
  resetFields: () => void
}

const FORM_KEY: InjectionKey<FormContext> = Symbol('form')

// 在子组件中使用
const { parent, index } = useParent<FormContext>(FORM_KEY)

if (parent) {
  // 调用父组件方法
  await parent.validate()
  console.log('当前索引:', index.value)
}
```

### 2. useChildren - 子组件管理

用于父组件管理多个子组件,提供注册、注销和排序功能。

**典型使用场景:**

- 表单组件管理表单项
- 标签页组件管理标签项
- 菜单组件管理菜单项

**使用示例:**

```typescript
import { useChildren } from '@/wd/components/composables/useChildren'

const FORM_KEY: InjectionKey<FormContext> = Symbol('form')

// 在父组件中使用
const { children, linkChildren } = useChildren<FormItemInstance>(FORM_KEY)

// 建立链接并提供上下文
linkChildren({
  validate: () => validateAllFields(),
  resetFields: () => resetAllFields()
})

// 访问所有子组件
const validateAll = async () => {
  for (const child of children) {
    await child.validate()
  }
}
```

### 3. useQueue - 弹出层队列

管理多个弹出层组件的显示队列,确保同一时间只显示一个弹出层。

**使用场景:**

- Toast 消息队列
- Dialog 弹窗管理
- Popup 弹出层控制

### 4. useTouch - 触摸事件

封装触摸事件处理,提供滑动方向检测和手势识别。

**功能特性:**

- 触摸开始/移动/结束事件
- 滑动方向检测
- 滑动距离计算
- 滑动速度检测

### 5. useCountDown - 倒计时

提供倒计时功能,支持毫秒级精度。

**使用场景:**

- 短信验证码倒计时
- 活动倒计时
- 支付超时倒计时

### 6. useLockScroll - 滚动锁定

锁定页面滚动,通常用于弹窗打开时防止背景滚动。

## 类型定义

### 通用类型

```typescript
/**
 * 异步请求返回元组类型
 * [错误对象, 数据对象]
 */
type AsyncResult<T> = [Error | null, T | null]

/**
 * 权限检查参数类型
 */
type PermissionParam = string | string[]

/**
 * 角色检查参数类型
 */
type RoleParam = string | string[]
```

### useAuth 类型

```typescript
interface UseAuthReturn {
  /** 登录状态 */
  isLoggedIn: ComputedRef<boolean>

  /** 检查超级管理员 */
  isSuperAdmin: (roleToCheck?: string) => boolean

  /** 检查租户管理员 */
  isTenantAdmin: (roleToCheck?: string) => boolean

  /** 检查任意管理员 */
  isAnyAdmin: (superAdminRole?: string, tenantAdminRole?: string) => boolean

  /** 检查权限(OR 逻辑) */
  hasPermission: (permission: PermissionParam, superAdminRole?: string) => boolean

  /** 检查权限(AND 逻辑) */
  hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean

  /** 检查角色(OR 逻辑) */
  hasRole: (role: RoleParam, superAdminRole?: string) => boolean

  /** 检查角色(AND 逻辑) */
  hasAllRoles: (roles: string[], superAdminRole?: string) => boolean

  /** 租户权限检查 */
  hasTenantPermission: (
    permission: PermissionParam,
    tenantId?: string,
    superAdminRole?: string,
    tenantAdminRole?: string
  ) => boolean

  /** 路由访问检查 */
  canAccessRoute: (route: any, superAdminRole?: string) => boolean

  /** 过滤授权路由 */
  filterAuthorizedRoutes: (routes: any[], superAdminRole?: string) => any[]
}
```

### useToken 类型

```typescript
interface UseTokenReturn {
  /** 响应式 Token */
  token: ComputedRef<string | null>

  /** 获取 Token */
  getToken: () => string | null

  /** 设置 Token */
  setToken: (accessToken: string) => void

  /** 移除 Token */
  removeToken: () => void

  /** 获取认证头对象 */
  getAuthHeaders: () => Record<string, string>

  /** 获取认证查询字符串 */
  getAuthQuery: () => string
}
```

### useEventBus 类型

```typescript
interface EventCallback {
  (...args: any[]): void
}

interface UseEventBusReturn {
  /** 事件名称常量 */
  EventNames: typeof EventNames

  /** 监听事件(自动清理) */
  on: (event: string, callback: EventCallback) => () => void

  /** 一次性监听(自动清理) */
  once: (event: string, callback: EventCallback) => () => void

  /** 移除监听 */
  off: (event: string, callback?: EventCallback) => void

  /** 发送事件 */
  emit: (event: string, ...args: any[]) => boolean

  /** 获取监听器数量 */
  getListenerCount: (event: string) => number
}

interface EventPayloads {
  [EventNames.TAB_CHANGED]: {
    from: number
    to: number
  }
  [EventNames.NETWORK_STATUS_CHANGED]: {
    isConnected: boolean
    networkType?: string
  }
}
```

### useParent / useChildren 类型

```typescript
type ParentProvide<T> = T & {
  link: (child: ComponentInternalInstance) => void
  unlink: (child: ComponentInternalInstance) => void
  children: ComponentPublicInstance[]
  internalChildren: ComponentInternalInstance[]
}

interface UseParentReturn<T> {
  parent: ParentProvide<T> | null
  index: Ref<number> | ComputedRef<number>
}

interface UseChildrenReturn<Child> {
  children: Child[]
  linkChildren: (value?: any) => void
}
```

## 使用示例

### 基本使用

```vue
<template>
  <view class="container">
    <view v-if="canEdit">
      <wd-button @click="handleEdit">编辑</wd-button>
    </view>
    <view v-else>
      <text>无编辑权限</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const canEdit = hasPermission('system:user:edit')

const handleEdit = () => {
  // 编辑逻辑
}
</script>
```

### 组合使用

```vue
<template>
  <view class="user-list">
    <view v-if="loading">加载中...</view>
    <view v-else-if="error">{{ error.message }}</view>
    <view v-else>
      <view v-for="user in users" :key="user.id">
        {{ user.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { http } from '@/composables/useHttp'

interface User {
  id: number
  name: string
  email: string
}

const { hasPermission } = useAuth()

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

const loadData = async () => {
  if (!hasPermission('data:list')) {
    error.value = new Error('无权限访问')
    return
  }

  loading.value = true
  const [err, data] = await http.get<User[]>('/api/users')
  loading.value = false

  if (err) {
    error.value = err
    return
  }

  users.value = data || []
}

onMounted(() => {
  loadData()
})
</script>
```

### 跨组件通信

```vue
<!-- PageA.vue - 发送事件 -->
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'

const { emit, EventNames } = useEventBus()

const updateUserProfile = async () => {
  // 更新用户信息...
  emit(EventNames.USER_PROFILE_UPDATED, { name: '新名字' })
}
</script>

<!-- PageB.vue - 监听事件 -->
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'

const { on, EventNames } = useEventBus()

// 自动在组件卸载时清理
on(EventNames.USER_PROFILE_UPDATED, (userData) => {
  console.log('用户信息已更新:', userData)
  refreshData()
})
</script>
```

### 自定义组合式函数

```typescript
// composables/useUserManagement.ts
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { http } from '@/composables/useHttp'
import { useEventBus } from '@/composables/useEventBus'

interface User {
  id: number
  name: string
  status: string
}

export const useUserManagement = () => {
  const { hasPermission } = useAuth()
  const { emit, EventNames } = useEventBus()

  const users = ref<User[]>([])
  const loading = ref(false)

  const canEdit = computed(() => hasPermission('system:user:edit'))
  const canDelete = computed(() => hasPermission('system:user:delete'))

  const loadUsers = async () => {
    if (!hasPermission('system:user:list')) {
      throw new Error('无权限')
    }

    loading.value = true
    const [error, data] = await http.get<User[]>('/api/users')
    loading.value = false

    if (error) {
      throw error
    }

    users.value = data || []
    return users.value
  }

  const updateUser = async (id: number, data: Partial<User>) => {
    const [error] = await http.put(`/api/users/${id}`, data)
    if (!error) {
      emit(EventNames.PAGE_REFRESH)
      await loadUsers()
    }
    return !error
  }

  const deleteUser = async (id: number) => {
    const [error] = await http.del(`/api/users/${id}`)
    if (!error) {
      await loadUsers()
    }
    return !error
  }

  return {
    users,
    loading,
    canEdit,
    canDelete,
    loadUsers,
    updateUser,
    deleteUser
  }
}
```

## 最佳实践

### 1. 按需导入

```typescript
// ✅ 推荐 - 按需导入
import { useAuth } from '@/composables/useAuth'
const { hasPermission } = useAuth()

// ❌ 不推荐 - 全量导入
import * as composables from '@/composables'
```

### 2. 类型安全

```typescript
// ✅ 推荐 - 使用泛型指定类型
interface User {
  id: number
  name: string
}

const [error, users] = await http.get<User[]>('/api/users')

// ❌ 不推荐 - 不指定类型
const [error, users] = await http.get('/api/users')
```

### 3. 响应式使用

```typescript
// ✅ 推荐 - 正确使用响应式
const { isLoggedIn } = useAuth()

watchEffect(() => {
  if (isLoggedIn.value) {
    console.log('已登录')
  }
})

// ❌ 不推荐 - 直接访问值失去响应性
const loggedIn = isLoggedIn.value
```

### 4. 错误处理

```typescript
// ✅ 推荐 - 使用元组模式处理错误
const [error, data] = await http.get('/api/users')

if (error) {
  console.error('请求失败:', error)
  uni.showToast({ title: error.message, icon: 'none' })
  return
}

// 使用数据
console.log('用户列表:', data)

// ❌ 不推荐 - 使用 try-catch
try {
  const data = await someAsyncFunction()
} catch (error) {
  console.error(error)
}
```

### 5. 资源清理

```typescript
// ✅ 推荐 - 使用自动清理的组合式函数
const { on } = useEventBus()
on('event', handler)  // 组件卸载时自动清理

// 或手动清理
const { connect, disconnect } = useWebSocket(url)
onMounted(() => connect())
onUnmounted(() => disconnect())
```

### 6. 组合复用

```typescript
// ✅ 推荐 - 创建自定义组合式函数封装业务逻辑
export const useOrderManagement = () => {
  const { hasPermission } = useAuth()
  const { get, post } = useHttp()

  const canCreate = computed(() => hasPermission('order:create'))

  const createOrder = async (orderData: OrderData) => {
    if (!canCreate.value) {
      throw new Error('无权限创建订单')
    }
    return post('/api/orders', orderData)
  }

  return { canCreate, createOrder }
}
```

## 注意事项

### 1. 必须在 setup 中使用

```typescript
// ✅ 正确
export default defineComponent({
  setup() {
    const { hasPermission } = useAuth() // ✓ 正确
    return { hasPermission }
  }
})

// ❌ 错误
export default defineComponent({
  methods: {
    checkPermission() {
      const { hasPermission } = useAuth() // ✗ 错误
      return hasPermission('some:permission')
    }
  }
})
```

### 2. 避免响应式丢失

```typescript
// ❌ 错误 - 解构会丢失响应性
const { isLoggedIn } = useAuth()
const loggedIn = isLoggedIn.value // 丢失响应性

// ✅ 正确 - 使用 computed 保持响应性
const { isLoggedIn } = useAuth()
const loggedIn = computed(() => isLoggedIn.value)
```

### 3. 异步初始化

```typescript
// ✅ 正确 - 等待连接完成
const { connect, send } = useWebSocket('wss://example.com/ws')

onMounted(async () => {
  await connect() // 等待连接完成
  send({ type: 'hello' })
})

// ❌ 错误 - 未等待完成
const { connect, send } = useWebSocket('wss://example.com/ws')
connect() // 未等待完成
send({ type: 'hello' }) // 可能失败
```

### 4. 避免内存泄漏

```typescript
// ✅ 正确 - 清理资源
const { connect, disconnect } = useWebSocket('wss://example.com/ws')

onMounted(() => connect())
onUnmounted(() => disconnect()) // 清理连接

// ❌ 错误 - 未清理资源
const { connect } = useWebSocket('wss://example.com/ws')
onMounted(() => connect())
// 组件销毁时连接仍然存在
```

### 5. Store 依赖顺序

```typescript
// ✅ 正确 - 在 app.use(pinia) 之后使用
const { hasPermission } = useAuth() // Store 已初始化

// ❌ 错误 - 在 Store 初始化前使用
// 可能导致获取不到用户信息
```

### 6. 平台差异处理

```typescript
// 处理平台差异
const { platform } = uni.getSystemInfoSync()

if (platform === 'mp-weixin') {
  // 微信小程序特定逻辑
} else if (platform === 'h5') {
  // H5 特定逻辑
}
```

## 扩展开发

### 创建自定义组合式函数

```typescript
// composables/useCustomFeature.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 自定义功能组合式函数
 * @description 详细说明功能和用途
 * @returns 返回值说明
 */
export const useCustomFeature = () => {
  // 1. 响应式状态
  const state = ref({
    count: 0,
    loading: false
  })

  // 2. 计算属性
  const doubleCount = computed(() => state.value.count * 2)

  // 3. 方法定义
  const increment = () => {
    state.value.count++
  }

  const asyncAction = async () => {
    state.value.loading = true
    try {
      // 异步操作
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      state.value.loading = false
    }
  }

  // 4. 生命周期钩子
  onMounted(() => {
    console.log('组合式函数已挂载')
  })

  onUnmounted(() => {
    console.log('组合式函数已卸载')
    // 清理逻辑
  })

  // 5. 返回公开 API
  return {
    state: readonly(state), // 只读状态
    doubleCount,
    increment,
    asyncAction
  }
}
```

### 命名规范

| 规范项 | 说明 | 示例 |
|-------|------|------|
| 文件命名 | `use` 前缀 + 功能名称 | `useAuth.ts`, `useHttp.ts` |
| 导出命名 | 与文件名保持一致 | `export const useAuth = () => {}` |
| 返回值 | 对象形式,包含状态和方法 | `return { state, method }` |
| 类型定义 | 完整的 TypeScript 类型 | `interface UseAuthReturn {}` |

### 组合式函数最佳实践模板

```typescript
/**
 * 组合式函数描述
 * @description 详细说明功能和用途
 * @param options 配置选项
 * @returns 返回值说明
 *
 * @example
 * ```typescript
 * const { state, method } = useFeature({ option: true })
 * ```
 */
export const useFeature = (options?: FeatureOptions) => {
  // 1. 响应式状态
  const state = ref<State>(getInitialState(options))

  // 2. 计算属性
  const computedValue = computed(() => {
    return processState(state.value)
  })

  // 3. 方法定义
  const method = async () => {
    // 方法实现
  }

  // 4. 生命周期钩子
  onMounted(() => {
    // 初始化逻辑
  })

  onUnmounted(() => {
    // 清理逻辑
  })

  // 5. 返回公开 API
  return {
    // 只读状态(防止外部修改)
    state: readonly(state),

    // 计算属性
    computedValue,

    // 方法
    method
  }
}
```

## 常见问题

### 1. 组合式函数在 Options API 中无法使用?

组合式函数必须在 `setup()` 函数或 `<script setup>` 中调用。如需在 Options API 中使用,可以在 `setup()` 中调用并返回:

```typescript
export default defineComponent({
  setup() {
    const { hasPermission } = useAuth()
    return { hasPermission }
  },
  methods: {
    checkPermission(perm: string) {
      return this.hasPermission(perm)
    }
  }
})
```

### 2. 为什么响应式数据不更新?

常见原因:

1. 解构时丢失响应性
2. 直接赋值而非修改 `.value`
3. 在异步回调中访问了过期的值

```typescript
// 解决方案: 使用 computed 或 toRefs
const { isLoggedIn } = useAuth()

// 方式1: computed
const loggedIn = computed(() => isLoggedIn.value)

// 方式2: toRefs (如果返回的是响应式对象)
const { state } = useFeature()
const { count } = toRefs(state)
```

### 3. 如何在组合式函数中访问组件实例?

```typescript
import { getCurrentInstance } from 'vue'

export const useComponentInfo = () => {
  const instance = getCurrentInstance()

  const getComponentName = () => {
    return instance?.type.name || 'Unknown'
  }

  return { getComponentName }
}
```

### 4. 如何处理组合式函数的依赖注入?

```typescript
// 提供者组件
const { linkChildren } = useChildren(FORM_KEY)
linkChildren({
  validate: () => Promise.resolve(true)
})

// 消费者组件
const { parent } = useParent(FORM_KEY)
if (parent) {
  await parent.validate()
}
```

### 5. 如何在组合式函数中处理错误?

```typescript
export const useAsyncData = () => {
  const error = ref<Error | null>(null)
  const data = ref(null)

  const fetchData = async () => {
    try {
      const [err, result] = await http.get('/api/data')
      if (err) {
        error.value = err
        return
      }
      data.value = result
    } catch (e) {
      error.value = e as Error
    }
  }

  return { data, error, fetchData }
}
```

---

通过合理使用这些组合式函数,可以大幅提升开发效率,减少重复代码,提高代码可维护性。组合式函数的设计遵循 Vue 3 的最佳实践,充分利用响应式系统和组合式 API 的优势,为移动端应用开发提供强大支持。
