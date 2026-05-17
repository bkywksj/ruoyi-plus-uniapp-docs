# User 用户状态

## 介绍

`useUserStore` 是 RuoYi-Plus-UniApp 移动端的核心状态管理模块，负责用户认证、登录、权限管理等关键功能。该模块基于 Pinia 构建，采用组合式 API 风格，提供完整的多平台登录支持。

**核心特性:**

- **多平台登录** - 支持密码登录、小程序一键登录、微信公众号授权登录、短信验证码登录
- **平台自适应** - 自动识别运行环境，提供对应的登录方式
- **Token 管理** - 统一的令牌存储、获取、刷新机制
- **权限控制** - 角色和权限编码管理，支持细粒度权限控制
- **WebSocket 集成** - 登录后自动建立 WebSocket 连接
- **用户信息管理** - 完整的用户信息获取、更新、授权检查

## 架构设计

### Store 结构图

```text
┌─────────────────────────────────────────────────────────────────┐
│                         useUserStore                             │
├─────────────────────────────────────────────────────────────────┤
│  状态 (State)                                                    │
│  ├── token: Ref<string>              用户访问令牌                │
│  ├── userInfo: Ref<SysUserVo>        用户基本信息                │
│  ├── roles: Ref<string[]>            角色编码列表                │
│  ├── permissions: Ref<string[]>      权限编码列表                │
│  ├── authModalVisible: Ref<boolean>  授权弹窗状态                │
│  └── requirePhoneAuth: Ref<boolean>  是否需要手机授权            │
├─────────────────────────────────────────────────────────────────┤
│  计算属性 (Computed)                                             │
│  ├── isLoggedIn: ComputedRef<boolean>  是否已登录                │
│  └── hasUserAuth: ComputedRef<boolean> 是否已完善信息            │
├─────────────────────────────────────────────────────────────────┤
│  方法 (Actions)                                                  │
│  ├── 登录方法: login, loginWithPassword, loginWithMiniapp, etc  │
│  ├── 用户信息: fetchUserInfo, updateNickName, updateAvatar      │
│  ├── 工具方法: getCurrentPlatform, getSupportedLoginMethods     │
│  └── 导航授权: navigateWithUserCheck                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │        依赖模块                │
              ├───────────────────────────────┤
              │  useToken()     Token 管理    │
              │  webSocket      WebSocket 连接 │
              │  SystemConfig   平台配置      │
              │  authApi        认证接口      │
              │  userApi        用户接口      │
              └───────────────────────────────┘
```

### 认证流程图

```text
用户发起登录
     │
     ▼
┌─────────────────┐
│  识别当前平台    │
│  getCurrentPlatform()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  获取支持的     │
│  登录方式       │
│  getSupportedLoginMethods()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  准备登录数据    │
│  prepareLoginData()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  调用登录 API   │
│  userLogin()    │
└────────┬────────┘
         │
    ┌────┴────┐
    │ 成功?   │
    └────┬────┘
    Yes  │  No
    │    └──▶ 返回错误
    ▼
┌─────────────────┐
│  保存 Token     │
│  tokenUtils.setToken()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  初始化 WebSocket│
│  handleInitWebSocket()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  获取用户信息    │
│  fetchUserInfo() │
└─────────────────┘
```

## 基本用法

### 引入与初始化

```typescript
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

// 获取 Store 实例
const userStore = useUserStore()

// 使用 storeToRefs 解构响应式状态
const { token, isLoggedIn, userInfo, roles, permissions } = storeToRefs(userStore)

// 直接解构方法
const { loginWithPassword, loginWithMiniapp, logoutUser } = userStore
```

### 密码登录

```vue
<template>
  <view class="login-form">
    <wd-input v-model="form.userName" placeholder="请输入用户名" />
    <wd-input v-model="form.password" type="password" placeholder="请输入密码" />
    <wd-input v-model="form.code" placeholder="请输入验证码" />
    <wd-button type="primary" @click="handleLogin">登录</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const form = reactive({
  userName: '',
  password: '',
  code: '',
  uuid: ''
})

const handleLogin = async () => {
  uni.showLoading({ title: '登录中...' })

  const [err] = await userStore.loginWithPassword({
    userName: form.userName,
    password: form.password,
    code: form.code,
    uuid: form.uuid
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'error' })
    return
  }

  // 登录成功，获取用户信息
  await userStore.fetchUserInfo()

  uni.showToast({ title: '登录成功', icon: 'success' })
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>
```

### 小程序一键登录

```vue
<template>
  <view class="quick-login">
    <wd-button type="primary" @click="handleQuickLogin">
      微信一键登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const handleQuickLogin = async () => {
  // 检查是否支持小程序登录
  if (!userStore.isSupportedLoginMethod('miniapp')) {
    uni.showToast({ title: '当前环境不支持一键登录', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  const [err] = await userStore.loginWithMiniapp()

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'error' })
    return
  }

  // 获取用户信息
  await userStore.fetchUserInfo()

  uni.showToast({ title: '登录成功', icon: 'success' })
}
</script>
```

### 带用户信息授权的小程序登录

```vue
<template>
  <view class="auth-login">
    <!-- 需要用户授权按钮 -->
    <button
      open-type="getUserInfo"
      @getuserinfo="handleGetUserInfo"
    >
      授权并登录
    </button>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const handleGetUserInfo = async (e: any) => {
  if (!e.detail.userInfo) {
    uni.showToast({ title: '授权失败', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  // 传递用户信息授权数据
  const [err] = await userStore.loginWithMiniapp({
    encryptedData: e.detail.encryptedData,
    iv: e.detail.iv,
    rawData: e.detail.rawData,
    signature: e.detail.signature
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'error' })
    return
  }

  await userStore.fetchUserInfo()
  uni.showToast({ title: '登录成功', icon: 'success' })
}
</script>
```

### 短信验证码登录

```vue
<template>
  <view class="sms-login">
    <wd-input
      v-model="form.phone"
      placeholder="请输入手机号"
      maxlength="11"
    />
    <view class="code-row">
      <wd-input
        v-model="form.smsCode"
        placeholder="请输入验证码"
        maxlength="6"
      />
      <wd-button
        :disabled="countdown > 0"
        @click="sendSmsCode"
      >
        {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
      </wd-button>
    </view>
    <wd-button type="primary" block @click="handleSmsLogin">
      登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { sendSms } from '@/api/system/auth/authApi'

const userStore = useUserStore()

const form = reactive({
  phone: '',
  smsCode: ''
})

const countdown = ref(0)
let timer: NodeJS.Timeout | null = null

// 发送短信验证码
const sendSmsCode = async () => {
  if (!form.phone || form.phone.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  const [err] = await sendSms({ phone: form.phone })

  if (err) {
    uni.showToast({ title: '发送失败', icon: 'error' })
    return
  }

  uni.showToast({ title: '验证码已发送', icon: 'success' })

  // 开始倒计时
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
    }
  }, 1000)
}

// 短信验证码登录
const handleSmsLogin = async () => {
  if (!form.phone || !form.smsCode) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  // 检查当前平台是否支持短信登录
  if (!userStore.isSupportedLoginMethod('sms')) {
    uni.showToast({ title: '当前平台不支持短信登录', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  const [err] = await userStore.login('sms', {
    phone: form.phone,
    smsCode: form.smsCode
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'error' })
    return
  }

  await userStore.fetchUserInfo()
  uni.showToast({ title: '登录成功', icon: 'success' })
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>
```

**使用说明:**
- 短信登录支持平台: 微信小程序 (`mp-weixin`)、普通 H5 (`h5`)
- 验证码有效期通常为 5 分钟
- 倒计时期间按钮禁用，防止重复发送

### 微信公众号 H5 登录

```typescript
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 1. 跳转到微信授权页面
const redirectToWechatAuth = () => {
  const redirectUri = window.location.href
  const authUrl = userStore.getWechatH5AuthUrl(redirectUri, 'login')
  window.location.href = authUrl
}

// 2. 授权回调处理
const handleWechatCallback = async () => {
  // 从 URL 获取授权码
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  if (!code) {
    console.error('未获取到授权码')
    return
  }

  const [err] = await userStore.loginWithMp({
    code,
    state: state || 'login'
  })

  if (err) {
    uni.showToast({ title: '登录失败', icon: 'error' })
    return
  }

  await userStore.fetchUserInfo()
  uni.showToast({ title: '登录成功', icon: 'success' })
}
```

**微信授权登录流程:**
1. 用户点击登录按钮，调用 `getWechatH5AuthUrl()` 生成授权链接
2. 页面跳转到微信授权页面，用户确认授权
3. 微信回调带上 `code` 参数返回应用
4. 应用获取 `code`，调用 `loginWithMp()` 完成登录

## 状态管理

### 状态列表

| 状态 | 类型 | 说明 |
|------|------|------|
| `token` | `Ref<string>` | 用户访问令牌 |
| `isLoggedIn` | `ComputedRef<boolean>` | 是否已登录 |
| `userInfo` | `Ref<SysUserVo \| null>` | 用户基本信息 |
| `hasUserAuth` | `ComputedRef<boolean>` | 是否已完善用户信息 |
| `roles` | `Ref<string[]>` | 用户角色编码列表 |
| `permissions` | `Ref<string[]>` | 用户权限编码列表 |
| `authModalVisible` | `Ref<boolean>` | 授权弹窗显示状态 |
| `requirePhoneAuth` | `Ref<boolean>` | 是否需要手机授权 |

### 状态使用示例

```vue
<template>
  <view class="user-profile">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="not-logged">
      <wd-button @click="goLogin">去登录</wd-button>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="logged">
      <image :src="userInfo?.avatar" class="avatar" />
      <text class="nickname">{{ userInfo?.nickName || '未设置昵称' }}</text>
      <text class="phone">{{ userInfo?.phonenumber }}</text>

      <!-- 角色标签 -->
      <view class="roles">
        <wd-tag v-for="role in roles" :key="role" type="primary">
          {{ role }}
        </wd-tag>
      </view>

      <!-- 权限检查 -->
      <wd-button
        v-if="hasPermission('system:user:edit')"
        @click="editProfile"
      >
        编辑资料
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { isLoggedIn, userInfo, roles, permissions } = storeToRefs(userStore)

// 权限检查
const hasPermission = (permission: string) => {
  return permissions.value.includes(permission) || permissions.value.includes('*:*:*')
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const editProfile = () => {
  uni.navigateTo({ url: '/pages/profile/edit' })
}
</script>
```

## API 详解

### 登录方法

#### login

统一登录入口，根据认证类型调用不同的登录策略。

```typescript
const login: (authType: AuthType, params?: any) => Promise<Result<AuthTokenVo>>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `authType` | `AuthType` | 是 | 认证类型 |
| `params` | `any` | 否 | 登录参数 |

**AuthType 类型:**

```typescript
type AuthType = 'password' | 'sms' | 'miniapp' | 'mp'
```

#### loginWithPassword

密码登录方法。

```typescript
const loginWithPassword: (loginBody: Omit<PasswordLoginBody, 'authType'>) => Promise<Result<AuthTokenVo>>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userName` | `string` | 是 | 用户名 |
| `password` | `string` | 是 | 密码 |
| `code` | `string` | 否 | 验证码 |
| `uuid` | `string` | 否 | 验证码 UUID |

**使用示例:**

```typescript
const [err, data] = await userStore.loginWithPassword({
  userName: 'admin',
  password: '123456',
  code: '1234',
  uuid: 'uuid-xxx'
})

if (err) {
  console.error('登录失败:', err.message)
} else {
  console.log('登录成功')
}
```

#### loginWithMiniapp

小程序一键登录方法。

```typescript
const loginWithMiniapp: (userInfoAuth?: {
  encryptedData: string
  iv: string
  rawData: string
  signature: string
}) => Promise<Result<AuthTokenVo>>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `encryptedData` | `string` | 否 | 加密的用户数据 |
| `iv` | `string` | 否 | 加密算法的初始向量 |
| `rawData` | `string` | 否 | 不包括敏感信息的原始数据 |
| `signature` | `string` | 否 | 数据签名 |

#### loginWithMp

微信公众号 H5 登录方法。

```typescript
const loginWithMp: (params: PlatformLoginParams) => Promise<Result<AuthTokenVo>>
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | `string` | 是 | 微信授权码 |
| `state` | `string` | 否 | 状态参数 |

### 用户信息方法

#### fetchUserInfo

获取当前登录用户的详细信息。

```typescript
const fetchUserInfo: () => Promise<Result<UserInfoVo>>
```

**返回数据结构:**

```typescript
interface UserInfoVo {
  user: SysUserVo      // 用户基本信息
  roles: string[]      // 角色编码列表
  permissions: string[] // 权限编码列表
}

interface SysUserVo {
  userId: number
  userName: string
  nickName: string
  avatar: string
  phonenumber: string
  email: string
  sex: string
  // ... 其他字段
}
```

**使用示例:**

```typescript
const [err, data] = await userStore.fetchUserInfo()

if (!err) {
  console.log('用户信息:', data.user)
  console.log('角色列表:', data.roles)
  console.log('权限列表:', data.permissions)
}
```

#### updateNickName

更新用户昵称（仅更新本地状态）。

```typescript
const updateNickName: (nickName: string) => void
```

#### updateAvatar

更新用户头像（仅更新本地状态）。

```typescript
const updateAvatar: (avatarUrl: string) => void
```

**使用示例:**

```typescript
// 上传头像后更新本地状态
const handleAvatarUpload = async (url: string) => {
  // 调用 API 更新服务器数据
  await updateUserAvatar(url)

  // 更新本地状态
  userStore.updateAvatar(url)
}
```

### 登出方法

#### logoutUser

用户注销，清除所有用户状态。

```typescript
const logoutUser: () => Promise<Result<R<void>>>
```

**功能说明:**
1. 断开 WebSocket 连接
2. 调用注销 API
3. 清除 token、用户信息、角色、权限
4. 移除本地存储的 token

**使用示例:**

```typescript
const handleLogout = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logoutUser()
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}
```

### 平台工具方法

#### getCurrentPlatform

获取当前运行平台类型。

```typescript
const getCurrentPlatform: () => PlatformType

type PlatformType =
  | 'mp-weixin'           // 微信小程序
  | 'mp-official-account' // 微信公众号 H5
  | 'mp-toutiao'          // 抖音小程序
  | 'mp-alipay'           // 支付宝小程序
  | 'h5'                  // 普通 H5
  | 'app'                 // App
```

#### getCurrentPlatformAppid

获取当前平台的 AppID。

```typescript
const getCurrentPlatformAppid: () => string
```

#### getSupportedLoginMethods

获取当前平台支持的登录方式。

```typescript
const getSupportedLoginMethods: () => AuthType[]
```

**使用示例:**

```typescript
const methods = userStore.getSupportedLoginMethods()
// 微信小程序返回: ['miniapp', 'password', 'sms']
// H5 返回: ['password', 'sms']
```

#### isSupportedLoginMethod

检查当前平台是否支持指定登录方式。

```typescript
const isSupportedLoginMethod: (method: AuthType) => boolean
```

**使用示例:**

```typescript
// 动态显示登录选项
const showMiniappLogin = userStore.isSupportedLoginMethod('miniapp')
const showSmsLogin = userStore.isSupportedLoginMethod('sms')
```

#### getWechatH5AuthUrl

生成微信公众号授权链接。

```typescript
const getWechatH5AuthUrl: (redirectUri: string, state?: 'login' | 'snsapi_userinfo') => string
```

### 导航与授权检查

#### navigateWithUserCheck

带用户信息检查的页面跳转。

```typescript
const navigateWithUserCheck: (
  options?: UniNamespace.NavigateToOptions & NavigateToOptions,
  mode?: 'modal' | 'page',
  authPagePath?: string
) => void
```

**参数说明:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `NavigateToOptions` | - | 跳转参数 |
| `mode` | `'modal' \| 'page'` | `'modal'` | 授权模式 |
| `authPagePath` | `string` | `'/pages/auth/auth'` | 授权页面路径 |

**使用示例:**

```typescript
// 跳转前检查用户信息是否完善
const goToOrder = () => {
  userStore.navigateWithUserCheck(
    { url: '/pages/order/create' },
    'modal' // 信息不完善时弹出授权弹窗
  )
}

// 跳转到授权页面模式
const goToProfile = () => {
  userStore.navigateWithUserCheck(
    { url: '/pages/profile/index' },
    'page' // 信息不完善时跳转到授权页面
  )
}
```

## 平台配置

### 认证配置结构

```typescript
const AUTH_CONFIG = {
  // 各平台 AppID
  appids: {
    'mp-weixin': SystemConfig.platforms.wechatMiniAppId,
    'mp-official-account': SystemConfig.platforms.wechatOfficialAppId,
    'mp-toutiao': SystemConfig.platforms.toutiaoMiniAppId,
    'mp-alipay': SystemConfig.platforms.alipayMiniAppId,
  },

  // 各平台支持的登录方式
  supportedMethods: {
    'mp-weixin': ['miniapp', 'password', 'sms'],
    'mp-official-account': ['mp', 'password'],
    'mp-toutiao': ['miniapp', 'password'],
    'mp-alipay': ['miniapp', 'password'],
    'h5': ['password', 'sms'],
    'app': ['password'],
  },
}
```

### 平台登录方式对照表

| 平台 | 支持的登录方式 | 说明 |
|------|----------------|------|
| 微信小程序 | `miniapp`, `password`, `sms` | 推荐使用一键登录 |
| 微信公众号 H5 | `mp`, `password` | 网页授权登录 |
| 抖音小程序 | `miniapp`, `password` | 抖音账号登录 |
| 支付宝小程序 | `miniapp`, `password` | 支付宝账号登录 |
| 普通 H5 | `password`, `sms` | 传统表单登录 |
| App | `password` | 密码登录 |

## WebSocket 集成

用户登录成功后，Store 会自动初始化 WebSocket 连接：

```typescript
const handleInitWebSocket = () => {
  console.log('[用户登录] 登录成功，检查WebSocket状态')

  const currentStatus = webSocket.status

  if (currentStatus === 'CLOSED') {
    const wsInstance = webSocket.initialize(undefined, {
      onConnected: () => {
        console.log('[用户登录] WebSocket连接建立成功')
      },
      onDisconnected: (code, reason) => {
        console.log('[用户登录] WebSocket连接断开', { code, reason })
      },
      onError: (error) => {
        console.error('[用户登录] WebSocket连接错误', error)
      },
      onMessage: (data) => {
        // 处理消息
      },
    })

    if (wsInstance) {
      webSocket.connect()
    }
  }
}
```

## 类型定义

### 登录相关类型

```typescript
/**
 * 认证类型
 */
type AuthType = 'password' | 'sms' | 'miniapp' | 'mp'

/**
 * 平台类型
 */
type PlatformType =
  | 'mp-weixin'
  | 'mp-official-account'
  | 'mp-toutiao'
  | 'mp-alipay'
  | 'h5'
  | 'app'

/**
 * 密码登录请求体
 */
interface PasswordLoginBody {
  authType: 'password'
  userName: string
  password: string
  code?: string
  uuid?: string
}

/**
 * 短信登录请求体
 */
interface SmsLoginBody {
  authType: 'sms'
  phone: string
  smsCode: string
}

/**
 * 小程序登录请求体
 */
interface MiniappLoginBody {
  authType: 'miniapp'
  platformCode: string
  platform: PlatformType
  appid: string
  encryptedData?: string
  iv?: string
  rawData?: string
  signature?: string
}

/**
 * 微信公众号登录请求体
 */
interface WechatOfficialAccountLoginBody {
  authType: 'mp'
  platform: PlatformType
  appid: string
  state?: string
  platformCode: string
}

/**
 * 认证令牌响应
 */
interface AuthTokenVo {
  access_token: string
  expires_in?: number
}
```

### 用户信息类型

```typescript
/**
 * 用户信息响应
 */
interface UserInfoVo {
  user: SysUserVo
  roles: string[]
  permissions: string[]
}

/**
 * 系统用户信息
 */
interface SysUserVo {
  userId: number
  deptId: number
  userName: string
  nickName: string
  userType: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  status: string
  loginIp: string
  loginDate: string
  createBy: string
  createTime: string
  remark: string
}
```

## 最佳实践

### 1. 登录状态持久化

应用启动时自动恢复登录状态：

```typescript
// App.vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

onLaunch(async () => {
  // token 已从 localStorage 恢复
  if (userStore.token) {
    // 验证 token 有效性并获取用户信息
    const [err] = await userStore.fetchUserInfo()
    if (err) {
      // token 失效，清除并跳转登录
      await userStore.logoutUser()
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
})
</script>
```

### 2. 登录拦截器

在路由或请求中检查登录状态：

```typescript
// 页面访问前检查
const checkLogin = () => {
  const userStore = useUserStore()

  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return false
  }
  return true
}

// HTTP 请求拦截
const requestInterceptor = (config: RequestConfig) => {
  const userStore = useUserStore()

  if (userStore.token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${userStore.token}`
    }
  }

  return config
}
```

### 3. 权限控制

基于角色和权限的访问控制：

```typescript
// composables/usePermission.ts
export function usePermission() {
  const userStore = useUserStore()
  const { roles, permissions } = storeToRefs(userStore)

  // 检查是否有指定角色
  const hasRole = (role: string | string[]) => {
    const roleList = Array.isArray(role) ? role : [role]
    return roleList.some(r => roles.value.includes(r))
  }

  // 检查是否有指定权限
  const hasPermission = (permission: string | string[]) => {
    // 超级管理员
    if (permissions.value.includes('*:*:*')) {
      return true
    }

    const permList = Array.isArray(permission) ? permission : [permission]
    return permList.some(p => permissions.value.includes(p))
  }

  return {
    hasRole,
    hasPermission
  }
}
```

## 常见问题

### 1. 小程序登录获取 code 失败

**问题原因：** 网络问题或小程序未正确配置

**解决方案：**

```typescript
const getMiniappCode = async (): Promise<string> => {
  try {
    const res = await uni.login()
    if (!res.code) {
      throw new Error('获取授权码失败')
    }
    return res.code
  } catch (error) {
    console.error('小程序登录失败:', error)
    // 提示用户检查网络
    uni.showToast({
      title: '网络异常，请重试',
      icon: 'none'
    })
    throw error
  }
}
```

### 2. Token 过期处理

**问题原因：** Token 有效期结束

**解决方案：** 在 HTTP 拦截器中处理 401 错误：

```typescript
const responseInterceptor = async (response: Response) => {
  if (response.statusCode === 401) {
    const userStore = useUserStore()
    await userStore.logoutUser()

    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    })

    uni.reLaunch({ url: '/pages/login/login' })
  }
  return response
}
```

### 3. 多端登录状态同步

**问题原因：** 同一账号在多个设备登录

**解决方案：** 通过 WebSocket 接收登出通知：

```typescript
webSocket.on('forceLogout', async () => {
  const userStore = useUserStore()
  await userStore.logoutUser()

  uni.showModal({
    title: '提示',
    content: '您的账号在其他设备登录，请重新登录',
    showCancel: false,
    success: () => {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  })
})
```

### 4. 用户信息不完整导致功能受限

**问题原因：** 用户登录后未完善头像、昵称等信息

**解决方案：** 使用 `navigateWithUserCheck` 检查并引导授权：

```typescript
// 在需要完整用户信息的操作前检查
const submitOrder = () => {
  const userStore = useUserStore()

  if (!userStore.hasUserAuth) {
    // 显示授权弹窗
    userStore.authModalVisible = true
    return
  }

  // 继续提交订单
  doSubmitOrder()
}

// 或者使用封装方法
const goToCheckout = () => {
  userStore.navigateWithUserCheck(
    { url: '/pages/checkout/index' },
    'modal'
  )
}
```

### 5. 平台识别错误

**问题原因：** 在微信开发者工具中调试 H5 可能被误识别

**解决方案：** 检查 User-Agent 或使用条件编译：

```typescript
// 强制指定平台（仅用于调试）
const forceH5Platform = () => {
  // #ifdef H5
  console.log('当前为 H5 平台')
  // #endif

  // #ifdef MP-WEIXIN
  console.log('当前为微信小程序')
  // #endif
}

// 调试时打印平台信息
console.log('当前平台:', userStore.getCurrentPlatform())
console.log('支持的登录方式:', userStore.getSupportedLoginMethods())
```

## 调试技巧

### 开发环境调试

```typescript
// 在 Store 中添加调试日志
const login = async (authType: AuthType, params: any = {}): Result<AuthTokenVo> => {
  console.log('[UserStore] 开始登录', { authType, params })

  try {
    const loginData = await prepareLoginData(authType, params)
    console.log('[UserStore] 登录数据准备完成', loginData)

    const result = await loginUser(loginData)
    console.log('[UserStore] 登录结果', result)

    return result
  } catch (error) {
    console.error('[UserStore] 登录异常', error)
    return [error as Error, null]
  }
}
```

### Vue DevTools 集成

```typescript
// main.ts 中启用 Pinia DevTools
import { createPinia } from 'pinia'

const pinia = createPinia()

// 开发环境启用调试
if (import.meta.env.DEV) {
  pinia.use(({ store }) => {
    store.$subscribe((mutation, state) => {
      console.log(`[Pinia] ${mutation.storeId} 状态变更:`, mutation.type)
    })
  })
}

app.use(pinia)
```

### 状态快照

```typescript
// 导出当前状态用于调试
const exportState = () => {
  const userStore = useUserStore()

  return {
    token: userStore.token ? '***' : null, // 隐藏敏感信息
    isLoggedIn: userStore.isLoggedIn,
    hasUserAuth: userStore.hasUserAuth,
    roles: userStore.roles,
    permissions: userStore.permissions,
    platform: userStore.getCurrentPlatform(),
    supportedMethods: userStore.getSupportedLoginMethods()
  }
}

// 在控制台查看
console.table(exportState())
```

## 性能优化

### 1. 避免重复获取用户信息

```typescript
// ❌ 不推荐：每次进入页面都获取
onShow(async () => {
  await userStore.fetchUserInfo()
})

// ✅ 推荐：只在必要时获取
onShow(async () => {
  // 如果已有用户信息，不重复获取
  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
})
```

### 2. 使用 storeToRefs 优化响应式

```typescript
// ❌ 不推荐：直接解构会丢失响应式
const { isLoggedIn, userInfo } = userStore

// ✅ 推荐：使用 storeToRefs 保持响应式
import { storeToRefs } from 'pinia'

const { isLoggedIn, userInfo } = storeToRefs(userStore)
```

### 3. 按需加载登录模块

```typescript
// 登录页面按需加载 Store
const LoginPage = defineAsyncComponent(async () => {
  const { useUserStore } = await import('@/stores/modules/user')
  // ...
  return import('./LoginPage.vue')
})
```

### 4. Token 刷新优化

```typescript
// 在请求拦截器中实现无感刷新
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

// 处理 401 错误
const handle401 = async (config: RequestConfig) => {
  if (isRefreshing) {
    // 等待 Token 刷新完成
    return new Promise(resolve => {
      addRefreshSubscriber((token: string) => {
        config.header.Authorization = `Bearer ${token}`
        resolve(request(config))
      })
    })
  }

  isRefreshing = true

  try {
    const newToken = await refreshToken()
    onTokenRefreshed(newToken)
    config.header.Authorization = `Bearer ${newToken}`
    return request(config)
  } finally {
    isRefreshing = false
  }
}
```

## 安全注意事项

### Token 存储安全

```typescript
// 1. 不要在日志中打印完整 Token
console.log('用户已登录:', userStore.isLoggedIn)
// ❌ console.log('Token:', userStore.token)

// 2. 使用 HTTPS 传输
// 确保 API 请求使用 HTTPS 协议

// 3. 设置合理的 Token 过期时间
// 建议 access_token: 2小时，refresh_token: 7天
```

### 敏感信息处理

```typescript
// 密码加密传输（如果后端支持）
import { encryptByRsa } from '@/utils/crypto'

const handleSecureLogin = async () => {
  const encryptedPassword = encryptByRsa(form.password)

  await userStore.loginWithPassword({
    userName: form.userName,
    password: encryptedPassword,
    code: form.code,
    uuid: form.uuid
  })
}
```

### 权限校验

```typescript
// 前端权限校验（辅助，非安全保障）
const canAccessAdmin = () => {
  const userStore = useUserStore()

  // 检查是否有管理员角色
  if (!userStore.roles.includes('admin')) {
    uni.showToast({ title: '无权限访问', icon: 'none' })
    return false
  }

  return true
}

// 重要：后端必须做权限校验，前端仅做 UI 控制
```
