# 状态管理概览

## 介绍

RuoYi-Plus-UniApp 移动端采用 **Pinia** 作为状态管理方案，提供类型安全、模块化的全局状态管理能力。Pinia 是 Vue 官方推荐的状态管理库，具有更简洁的 API、完整的 TypeScript 支持和出色的开发体验。项目采用组合式 API (Composition API) 风格定义 Store，与 Vue 3 的开发模式完美契合，实现了用户认证、字典数据、功能配置、标签栏状态等核心业务的集中管理。

**核心特性:**

- **类型安全** - 完整的 TypeScript 类型推导，所有状态和方法都有明确的类型定义，IDE 智能提示完善
- **模块化设计** - 每个 Store 独立管理特定业务领域的状态，职责单一，便于维护和测试
- **组合式 API** - 使用 `setup` 语法定义 Store，与 Vue 3 Composition API 完美契合
- **轻量高效** - Pinia 核心库仅约 1KB，运行时性能优异，无冗余代码
- **DevTools 支持** - 完整的 Vue DevTools 集成，支持状态追踪、时间旅行调试
- **多平台适配** - 针对 UniApp 多平台特性进行了适配，支持小程序、H5、App 等环境
- **持久化支持** - 通过 Token 工具类实现关键数据的持久化存储

**技术栈版本:**

| 依赖 | 版本 | 说明 |
|------|------|------|
| Pinia | 2.0.36 | Vue 官方状态管理库 |
| Vue | 3.4.21 | 核心框架 |
| TypeScript | 5.7.2 | 类型支持 |

## 架构设计

### 目录结构

```text
src/stores/
├── store.ts              # Pinia 实例创建与导出
└── modules/              # Store 模块目录
    ├── user.ts           # 用户认证状态 (609行)
    ├── dict.ts           # 字典数据状态 (210行)
    ├── feature.ts        # 功能开关状态 (55行)
    └── tabbar.ts         # 标签栏状态 (169行)
```

### Store 模块说明

| 模块 | Store 名称 | 功能描述 | 状态数量 | 方法数量 |
|------|-----------|----------|---------|---------|
| `user` | `useUserStore` | 用户认证、登录、权限管理 | 7 | 15+ |
| `dict` | `useDictStore` | 字典数据存储、访问、转换 | 1 | 7 |
| `feature` | `useFeatureStore` | 系统功能开关配置 | 2 | 2 |
| `tabbar` | `useTabbarStore` | 底部标签栏状态、徽标管理 | 2 | 4 |

### 模块依赖关系

```text
┌─────────────────────────────────────────────────────────────┐
│                        App.vue                               │
│                    (应用初始化入口)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     useFeatureStore                          │
│              (首先初始化，获取系统功能配置)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      useUserStore                            │
│         (用户登录后获取信息、建立 WebSocket 连接)              │
│                           │                                  │
│              ┌────────────┼────────────┐                     │
│              ▼            ▼            ▼                     │
│         useToken     webSocket    useDictStore               │
│       (Token管理)   (实时通信)   (字典数据加载)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     useTabbarStore                           │
│              (页面导航、徽标状态管理)                          │
└─────────────────────────────────────────────────────────────┘
```

## 快速开始

### 1. Pinia 实例配置

项目在 `src/stores/store.ts` 中创建 Pinia 实例：

```typescript
// src/stores/store.ts
import { createPinia } from 'pinia'

// 创建一个 pinia 存储实例
const store = createPinia()

// 导出这个存储实例以便在应用程序的其他部分使用
export default store
```

**说明:**
- 使用 `createPinia()` 创建全局唯一的 Pinia 实例
- 该实例在 `main.ts` 中注册到 Vue 应用
- 所有 Store 模块共享同一个 Pinia 实例

### 2. 在应用中注册

在 `main.ts` 中注册 Pinia：

```typescript
// src/main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './stores/store'

export function createApp() {
  const app = createSSRApp(App)

  // 注册 Pinia 状态管理
  app.use(store)

  return { app }
}
```

**技术说明:**
- UniApp 使用 `createSSRApp` 而非 `createApp`，支持服务端渲染场景
- Pinia 作为 Vue 插件通过 `app.use()` 注册
- 注册后所有组件都可以使用 `useXxxStore()` 访问状态

### 3. 在组件中使用

```vue
<template>
  <view class="user-info">
    <image :src="userInfo?.avatar" class="avatar" />
    <text class="nickname">{{ userInfo?.nickName }}</text>
    <text v-if="isLoggedIn" class="status">已登录</text>
    <text class="roles">角色: {{ roles.join(', ') }}</text>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 使用 storeToRefs 保持响应性
const { userInfo, isLoggedIn, roles, permissions } = storeToRefs(userStore)

// 方法可以直接解构，不需要 storeToRefs
const { loginWithPassword, logoutUser, fetchUserInfo } = userStore

// 执行登录
const handleLogin = async () => {
  const [err] = await loginWithPassword({
    userName: 'admin',
    password: '123456',
    code: '1234',
    uuid: 'uuid-xxx'
  })

  if (!err) {
    // 登录成功后获取用户信息
    await fetchUserInfo()
  }
}
</script>
```

**使用要点:**
- 状态变量使用 `storeToRefs()` 解构，保持响应性
- 方法可以直接从 Store 解构，无需包装
- 异步操作返回 `[err, data]` 元组，便于错误处理

## Store 设计规范

### 组合式 API 风格

所有 Store 采用 `setup` 函数风格定义，这是 Pinia 推荐的现代写法：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // ========== 状态定义 (State) ==========
  const count = ref(0)
  const name = ref('example')
  const items = ref<ItemType[]>([])

  // ========== 计算属性 (Getters) ==========
  const doubleCount = computed(() => count.value * 2)
  const isEmpty = computed(() => items.value.length === 0)

  // ========== 方法定义 (Actions) ==========
  const increment = () => {
    count.value++
  }

  const asyncAction = async (): Result<DataType> => {
    const [err, result] = await fetchData()
    if (!err) {
      items.value = result
    }
    return [err, result]
  }

  // ========== 返回暴露的内容 ==========
  return {
    // 状态
    count,
    name,
    items,
    // 计算属性
    doubleCount,
    isEmpty,
    // 方法
    increment,
    asyncAction
  }
})
```

**结构说明:**
- **状态定义**: 使用 `ref()` 或 `reactive()` 定义响应式状态
- **计算属性**: 使用 `computed()` 定义派生状态
- **方法定义**: 直接定义函数，支持同步和异步操作
- **返回对象**: 只返回需要对外暴露的状态和方法

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Store 文件 | 小写单数 | `user.ts`, `dict.ts`, `feature.ts` |
| Store 函数 | `use{Name}Store` | `useUserStore`, `useDictStore` |
| 模块常量 | 大写 + `_MODULE` | `USER_MODULE`, `DICT_MODULE` |
| 状态变量 | 小驼峰 | `userInfo`, `isLoggedIn`, `currentTab` |
| 布尔状态 | `is/has/can` 前缀 | `isLoggedIn`, `hasUserAuth`, `initialized` |
| 方法名 | 动词开头小驼峰 | `fetchUserInfo`, `loginUser`, `updateBadge` |
| 异步方法 | 返回 `Result<T>` | `login(): Result<AuthTokenVo>` |

### 类型定义规范

Store 中的状态应明确类型定义：

```typescript
import type { SysUserVo } from '@/api/system/core/user/userTypes'
import type { AuthTokenVo } from '@/api/system/auth/authTypes'

/**
 * 模块常量定义
 */
const USER_MODULE = 'user'

/**
 * 认证配置类型
 */
interface AuthConfig {
  appids: Record<string, string>
  supportedMethods: Record<string, AuthType[]>
}

export const useUserStore = defineStore(USER_MODULE, () => {
  // 明确类型定义，支持 null 表示未初始化
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const token = ref<string>('')

  // 计算属性自动推导类型
  const isLoggedIn = computed(() => {
    return token.value && token.value.length > 0
  })

  // 异步方法返回 Result 类型
  const loginUser = async (data: LoginRequest): Result<AuthTokenVo> => {
    const [err, result] = await userLogin(data)
    if (!err) {
      token.value = result.access_token
    }
    return [err, result]
  }

  return { userInfo, roles, permissions, token, isLoggedIn, loginUser }
})
```

**类型定义要点:**
- 状态使用泛型 `ref<T>()` 明确类型
- 可空状态使用联合类型 `T | null`
- 数组状态使用 `T[]` 或 `Array<T>`
- 异步方法返回 `Result<T>` 统一错误处理

## 各 Store 详解

### useUserStore - 用户状态管理

用户状态管理是整个应用最核心的 Store，负责用户认证、权限控制和多平台登录支持。

#### 状态定义

```typescript
// src/stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  /**
   * 用户令牌
   * 用户登录后的访问令牌，用于 API 请求认证
   */
  const token = ref(tokenUtils.getToken())

  /**
   * 当前用户登录状态
   * 通过检查 token 是否存在判断登录状态
   */
  const isLoggedIn = computed(() => {
    return token && token.value.length > 0
  })

  /**
   * 用户基本信息
   * 包含账号、昵称、头像、部门等信息
   */
  const userInfo = ref<SysUserVo | null>(null)

  /**
   * 用户是否已完善信息
   * 判断用户是否已设置头像和昵称
   */
  const hasUserAuth = computed(() => {
    return !!(userInfo.value?.avatar && userInfo.value?.nickName)
  })

  /**
   * 用户角色编码集合
   * 用于判断路由权限和功能权限
   */
  const roles = ref<string[]>([])

  /**
   * 用户权限编码集合
   * 用于判断按钮权限等细粒度权限控制
   */
  const permissions = ref<string[]>([])

  /**
   * 用户授权弹窗状态
   * 控制授权弹窗的显示/隐藏
   */
  const authModalVisible = ref(false)

  /**
   * 是否需要手机授权
   * 小程序场景下是否需要获取手机号
   */
  const requirePhoneAuth = ref(false)

  // ...
})
```

#### 平台登录配置

```typescript
/**
 * 认证配置
 * 定义各平台的 appid 和支持的登录方式
 */
const AUTH_CONFIG = {
  // 平台对应的 appid
  appids: {
    'mp-weixin': SystemConfig.platforms.wechatMiniAppId,
    'mp-official-account': SystemConfig.platforms.wechatOfficialAppId,
    'mp-toutiao': SystemConfig.platforms.toutiaoMiniAppId,
    'mp-alipay': SystemConfig.platforms.alipayMiniAppId,
  },

  // 平台支持的登录方式
  supportedMethods: {
    'mp-weixin': ['miniapp', 'password', 'sms'] as AuthType[],
    'mp-official-account': ['mp', 'password'] as AuthType[],
    'mp-toutiao': ['miniapp', 'password'] as AuthType[],
    'mp-alipay': ['miniapp', 'password'] as AuthType[],
    h5: ['password', 'sms'] as AuthType[],
    app: ['password'] as AuthType[],
  },
}
```

**支持的登录方式:**

| 平台 | 支持方式 | 说明 |
|------|---------|------|
| 微信小程序 | `miniapp`, `password`, `sms` | 一键登录、密码、短信 |
| 微信公众号 | `mp`, `password` | 网页授权、密码 |
| 抖音小程序 | `miniapp`, `password` | 一键登录、密码 |
| 支付宝小程序 | `miniapp`, `password` | 一键登录、密码 |
| H5 | `password`, `sms` | 密码、短信 |
| App | `password` | 密码登录 |

#### 登录方法

```typescript
/**
 * 密码登录
 * @param loginBody 密码登录数据
 * @returns Promise 登录结果
 */
const loginWithPassword = async (
  loginBody: Omit<PasswordLoginBody, 'authType'>,
): Result<AuthTokenVo> => {
  return await login('password', loginBody)
}

/**
 * 小程序一键登录
 * @param userInfoAuth 可选的用户信息授权数据
 * @returns Promise 登录结果
 */
const loginWithMiniapp = async (userInfoAuth?: {
  encryptedData: string
  iv: string
  rawData: string
  signature: string
}): Result<AuthTokenVo> => {
  if (!isSupportedLoginMethod('miniapp')) {
    return [new Error('当前平台不支持小程序登录'), null]
  }
  return await login('miniapp', userInfoAuth)
}

/**
 * H5 微信授权登录
 * @param params 微信授权回调参数
 * @returns Promise 登录结果
 */
const loginWithMp = async (params: PlatformLoginParams): Result<AuthTokenVo> => {
  if (!isSupportedLoginMethod('mp')) {
    return [new Error('当前平台不支持微信登录'), null]
  }
  return await login('mp', params)
}
```

#### 使用示例

```vue
<template>
  <view class="login-page">
    <!-- 密码登录表单 -->
    <wd-input v-model="form.userName" label="用户名" />
    <wd-input v-model="form.password" label="密码" type="password" />
    <wd-input v-model="form.code" label="验证码" />
    <wd-button @click="handlePasswordLogin">登录</wd-button>

    <!-- 小程序一键登录 -->
    <wd-button v-if="isMiniapp" @click="handleMiniappLogin">
      一键登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import { isMp } from '@/utils/platform'

const userStore = useUserStore()
const isMiniapp = isMp

const form = ref({
  userName: '',
  password: '',
  code: '',
  uuid: ''
})

// 密码登录
const handlePasswordLogin = async () => {
  uni.showLoading({ title: '登录中...' })

  const [err] = await userStore.loginWithPassword({
    userName: form.value.userName,
    password: form.value.password,
    code: form.value.code,
    uuid: form.value.uuid
  })

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'none' })
    return
  }

  // 登录成功，获取用户信息
  await userStore.fetchUserInfo()

  // 跳转到首页
  uni.switchTab({ url: '/pages/index/index' })
}

// 小程序一键登录
const handleMiniappLogin = async () => {
  uni.showLoading({ title: '登录中...' })

  const [err] = await userStore.loginWithMiniapp()

  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'none' })
    return
  }

  await userStore.fetchUserInfo()
  uni.switchTab({ url: '/pages/index/index' })
}
</script>
```

#### WebSocket 集成

用户登录成功后会自动初始化 WebSocket 连接：

```typescript
/**
 * 登录成功后的 WebSocket 处理
 */
const handleInitWebSocket = () => {
  console.log('[用户登录] 登录成功，检查 WebSocket 状态')

  const currentStatus = webSocket.status

  if (currentStatus === 'CLOSED') {
    console.log('[用户登录] WebSocket 未连接，开始初始化')

    const wsInstance = webSocket.initialize(undefined, {
      onConnected: () => {
        console.log('[用户登录] WebSocket 连接建立成功')
      },
      onDisconnected: (code, reason) => {
        console.log('[用户登录] WebSocket 连接断开', { code, reason })
      },
      onError: (error) => {
        console.error('[用户登录] WebSocket 连接错误', error)
      },
      onMessage: (data) => {
        // 消息处理逻辑
      },
    })

    if (wsInstance) {
      webSocket.connect()
    }
  }
}
```

#### 用户信息授权检查

```typescript
/**
 * 检查用户信息并跳转
 * 如果用户没有头像昵称，则根据模式进行授权
 *
 * @param options 跳转参数
 * @param mode 模式：'modal' 弹窗授权 | 'page' 页面跳转授权
 * @param authPagePath 授权页面路径
 */
const navigateWithUserCheck = (
  options?: UniNamespace.NavigateToOptions,
  mode: 'modal' | 'page' = 'modal',
  authPagePath: string = '/pages/auth/auth',
) => {
  if (hasUserAuth.value) {
    // 有用户信息，直接跳转到目标页面
    uni.navigateTo(options)
  } else {
    // 没有用户信息，根据模式处理
    if (mode === 'modal') {
      // 显示授权弹窗
      authModalVisible.value = true
    } else {
      // 跳转到授权页面
      uni.navigateTo({
        url: `${authPagePath}?redirect=${options.url}`,
      })
    }
  }
}
```

### useDictStore - 字典状态管理

字典数据管理 Store，提供统一的字典数据存储、访问和转换功能。

#### 状态定义

```typescript
// src/stores/modules/dict.ts
export const useDictStore = defineStore('dict', () => {
  /**
   * 字典数据集合
   * 使用 Map 存储多个字典数据，key 为字典类型，value 为字典选项数组
   */
  const dict = ref<Map<string, DictItem[]>>(new Map())

  // ...
})
```

#### 核心方法

```typescript
/**
 * 获取字典
 * @param key 字典类型
 * @returns 字典数据数组或 null
 */
const getDict = (key: string): DictItem[] | null => {
  if (!key) return null
  return dict.value.get(key) || null
}

/**
 * 设置字典
 * @param key 字典类型
 * @param value 字典数据数组
 * @returns 是否设置成功
 */
const setDict = (key: string, value: DictItem[]): boolean => {
  if (!key) return false
  try {
    dict.value.set(key, value)
    return true
  } catch (e) {
    console.error('设置字典时发生错误:', e)
    return false
  }
}

/**
 * 根据字典值获取标签
 * @param keyOrData 字典类型或字典数据
 * @param value 字典值
 * @returns 对应的标签名
 */
const getDictLabel = (
  keyOrData: string | Ref<DictItem[]> | DictItem[],
  value: string | number,
): string => {
  let dictData: Ref<DictItem[]> | undefined

  if (typeof keyOrData === 'string') {
    dictData = ref(getDict(keyOrData))
  } else if (isRef(keyOrData)) {
    dictData = keyOrData
  } else {
    dictData = ref(keyOrData)
  }

  if (!dictData) return ''
  const item = dictData.value.find((item) => item.value === String(value))
  return item ? item.label : ''
}

/**
 * 批量获取字典标签
 * @param keyOrData 字典类型或字典数据
 * @param values 字典值数组
 * @returns 对应的标签数组
 */
const getDictLabels = (
  keyOrData: string | Ref<DictItem[]>,
  values: (string | number)[],
): string[] => {
  if (!values || values.length === 0) return []
  // ... 实现逻辑
}

/**
 * 获取字典项的完整对象
 * @param keyOrData 字典类型或字典数据
 * @param value 字典值
 * @returns 完整的字典项对象或 null
 */
const getDictItem = (
  keyOrData: string | DictItem[],
  value: string | number
): DictItem | null => {
  // ... 实现逻辑
}

/**
 * 根据标签获取字典值
 * @param key 字典类型
 * @param label 字典标签
 * @returns 对应的字典值
 */
const getDictValue = (key: string, label: string): string | number | null => {
  const dictData = getDict(key)
  if (!dictData) return null
  const item = dictData.find((item) => item.label === label)
  return item ? item.value : null
}

/**
 * 删除字典
 * @param key 字典类型
 * @returns 是否删除成功
 */
const removeDict = (key: string): boolean => {
  if (!key) return false
  return dict.value.delete(key)
}

/**
 * 清空所有字典
 */
const cleanDict = (): void => {
  dict.value.clear()
}
```

#### 使用示例

```vue
<template>
  <view class="user-form">
    <!-- 使用字典数据渲染下拉选择 -->
    <wd-picker
      v-model="form.gender"
      :columns="genderOptions"
      label="性别"
    />

    <!-- 显示字典标签 -->
    <view class="status">
      状态: {{ dictStore.getDictLabel('sys_enable_status', form.status) }}
    </view>

    <!-- 使用 wd-tag 显示标签样式 -->
    <wd-tag :type="genderItem?.elTagType">
      {{ genderItem?.label }}
    </wd-tag>
  </view>
</template>

<script lang="ts" setup>
import { useDictStore } from '@/stores/modules/dict'
import { useDict } from '@/composables/useDict'

const dictStore = useDictStore()

// 使用 useDict composable 获取字典数据
const { sys_user_gender, sys_enable_status } = useDict(
  'sys_user_gender',
  'sys_enable_status'
)

const form = ref({
  gender: '0',
  status: '0'
})

// 转换为 picker 选项格式
const genderOptions = computed(() => {
  return sys_user_gender.value.map(item => ({
    label: item.label,
    value: item.value
  }))
})

// 获取完整字典项对象（包含样式信息）
const genderItem = computed(() => {
  return dictStore.getDictItem('sys_user_gender', form.value.gender)
})
</script>
```

### useFeatureStore - 功能配置管理

系统功能配置 Store，管理 AI 对话、WebSocket、SSE 等功能的开关状态。

#### 状态定义

```typescript
// src/stores/modules/feature.ts
import { getSystemFeatures, type SystemFeature } from '@/api/common/system/feature/featureApi'

export const useFeatureStore = defineStore('feature', () => {
  /**
   * 功能配置
   * 存储系统各项功能的启用状态
   */
  const features = ref<SystemFeature>({
    langchain4jEnabled: false,  // AI 对话功能
    websocketEnabled: false,    // WebSocket 实时通信
    sseEnabled: false           // Server-Sent Events
  })

  /**
   * 是否已初始化
   * 防止重复调用初始化接口
   */
  const initialized = ref(false)

  // ...
})
```

#### 功能配置类型

```typescript
// src/api/common/system/feature/featureApi.ts
export interface SystemFeature {
  /** LangChain4j AI 功能是否启用 */
  langchain4jEnabled: boolean
  /** WebSocket 是否启用 */
  websocketEnabled: boolean
  /** SSE (Server-Sent Events) 是否启用 */
  sseEnabled: boolean
}
```

#### 核心方法

```typescript
/**
 * 初始化功能配置
 * 从服务端获取功能开关状态，仅在首次调用时执行
 */
const initFeatures = async (): Promise<void> => {
  if (initialized.value) return

  const [err, data] = await getSystemFeatures()
  if (err) {
    // 接口失败时使用默认值
    features.value.langchain4jEnabled = false
    features.value.websocketEnabled = false
    features.value.sseEnabled = false
  } else {
    features.value = data
  }
  initialized.value = true
}

/**
 * 判断功能是否启用
 * @param featureName 功能名称
 * @returns 是否启用
 */
const isFeatureEnabled = (featureName: keyof SystemFeature): boolean => {
  return features.value[featureName] || false
}
```

#### 使用示例

```vue
<template>
  <view class="feature-demo">
    <!-- 根据功能开关显示 AI 对话入口 -->
    <wd-button
      v-if="featureStore.isFeatureEnabled('langchain4jEnabled')"
      @click="openAiChat"
    >
      AI 智能助手
    </wd-button>

    <!-- WebSocket 实时消息 -->
    <view v-if="featureStore.isFeatureEnabled('websocketEnabled')">
      <wd-badge :value="unreadCount">
        <wd-icon name="message" />
      </wd-badge>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

// 在 App.vue 或页面 onLoad 中初始化
onMounted(async () => {
  await featureStore.initFeatures()
})

const openAiChat = () => {
  uni.navigateTo({ url: '/pages/ai/chat' })
}
</script>
```

#### App.vue 中初始化

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

onLaunch(async () => {
  // 首先初始化功能配置（无需登录）
  await featureStore.initFeatures()

  // 如果有 token，获取用户信息
  if (userStore.token) {
    await userStore.fetchUserInfo()
  }
})
</script>
```

### useTabbarStore - 标签栏状态管理

底部标签栏状态管理，处理页面导航、徽标显示等功能。

#### 状态定义

```typescript
// src/stores/modules/tabbar.ts
import type { WdTabbarItemProps } from '@/wd/components/wd-tabbar-item/wd-tabbar-item.vue'

export const useTabbarStore = defineStore('tabbar', () => {
  /** Tabbar 页面路径 */
  const TABBAR_PAGE_PATH = 'pages/index/index'

  /**
   * 当前激活的标签页索引
   */
  const currentTab = ref(0)

  /**
   * 标签页列表配置
   */
  const tabs = ref<WdTabbarItemProps[]>([
    { title: '首页', icon: 'home', isDot: false, value: 0, loaded: true },
    { title: '点餐', icon: 'shop', isDot: false, value: 0, loaded: false },
    { title: '我的', icon: 'user', isDot: false, value: 0, loaded: false },
  ])

  // ...
})
```

#### 核心方法

```typescript
/**
 * 跳转到指定标签页
 * 智能判断当前环境，决定是切换标签还是页面跳转
 *
 * @param index 标签页索引
 * @param params 可选的跳转参数
 */
const toTab = async (index: number | string, params?: Record<string, any>) => {
  index = isDef(index) ? (typeof index === 'string' ? Number(index) : index) : 0
  if (index < 0 || index >= tabs.value.length) return

  // 更新当前标签页状态
  currentTab.value = index
  // 标记目标页面为已加载
  tabs.value[index].loaded = true

  // 检查是否在 tabbar 页面
  const isInTabbar = getCurrentPage()?.route === TABBAR_PAGE_PATH

  if (!isInTabbar) {
    // 不在 tabbar 页面，需要跳转
    const query = objectToQuery({
      tab: index.toString(),
      ...params,
    })

    await uni.navigateTo({
      url: `/${TABBAR_PAGE_PATH}?${query}`,
    })
  }

  // 清除徽标
  clearBadge(index)
}

/**
 * 更新标签页小红点状态
 * @param index 标签页索引
 * @param isDot 是否显示小红点
 */
const updateDot = (index: number, isDot: boolean) => {
  if (index < 0 || index >= tabs.value.length) return

  tabs.value[index].isDot = isDot
  if (isDot) {
    tabs.value[index].value = 0
  }
}

/**
 * 更新标签页徽章数值
 * @param index 标签页索引
 * @param value 徽章数值
 */
const updateBadge = (index: number, value: number) => {
  if (index < 0 || index >= tabs.value.length) return

  tabs.value[index].value = Math.max(0, value)
  if (value > 0) {
    tabs.value[index].isDot = false
  }
}

/**
 * 清除标签页徽标
 * @param index 标签页索引
 */
const clearBadge = (index: number) => {
  if (index < 0 || index >= tabs.value.length) return

  tabs.value[index].value = 0
  tabs.value[index].isDot = false
}
```

#### 使用示例

```vue
<template>
  <view class="index-page">
    <!-- 页面内容区域 -->
    <swiper
      :current="tabbarStore.currentTab"
      @change="handleSwiperChange"
    >
      <swiper-item v-for="(tab, index) in tabbarStore.tabs" :key="index">
        <component :is="getTabComponent(index)" v-if="tab.loaded" />
      </swiper-item>
    </swiper>

    <!-- 底部标签栏 -->
    <wd-tabbar v-model="tabbarStore.currentTab" fixed>
      <wd-tabbar-item
        v-for="(tab, index) in tabbarStore.tabs"
        :key="index"
        :title="tab.title"
        :icon="tab.icon"
        :is-dot="tab.isDot"
        :value="tab.value"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

// 监听 swiper 切换
const handleSwiperChange = (e: any) => {
  const index = e.detail.current
  tabbarStore.currentTab = index
  tabbarStore.tabs[index].loaded = true
}

// 根据索引获取对应的页面组件
const getTabComponent = (index: number) => {
  const components = ['HomePage', 'OrderPage', 'MinePage']
  return components[index]
}

// 模拟收到新消息，更新徽章
const onNewMessage = (count: number) => {
  tabbarStore.updateBadge(2, count) // 更新"我的"页面徽章
}

// 模拟有新活动，显示小红点
const onNewActivity = () => {
  tabbarStore.updateDot(1, true) // 在"点餐"页面显示小红点
}
</script>
```

#### 从其他页面跳转到指定标签

```typescript
// 在订单详情页跳转到"我的"标签页
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

const goToMyPage = () => {
  // 带参数跳转
  tabbarStore.toTab(2, { showOrders: true })
}
```

## 类型定义

### 全局类型定义

```typescript
// src/types/global.d.ts

/**
 * 统一 API 响应类型
 * 定义所有 API 请求的统一返回格式 [错误, 数据]
 */
declare type Result<T = any> = Promise<[Error | null, T | null]>

/**
 * 分页响应数据类型
 */
declare interface PageResult<T = any> {
  /** 数据记录列表 */
  rows: T[]
  /** 总记录数 */
  total: number
}

/**
 * 字典项配置
 * 用于下拉选择、标签等组件的选项数据
 */
declare interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element UI Tag 组件的类型 */
  elTagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Element UI Tag 组件的自定义类名 */
  elTagClass?: string
}
```

### Store 相关类型

```typescript
// 用户信息类型
interface SysUserVo {
  userId: number
  userName: string
  nickName: string
  avatar: string
  email?: string
  phone?: string
  sex?: string
  deptId?: number
  deptName?: string
  createTime?: string
}

// 用户信息响应类型
interface UserInfoVo {
  user: SysUserVo
  roles: string[]
  permissions: string[]
}

// 登录请求类型
type LoginRequest =
  | PasswordLoginBody
  | SmsLoginBody
  | MiniappLoginBody
  | WechatOfficialAccountLoginBody

// 密码登录请求体
interface PasswordLoginBody {
  authType: 'password'
  userName: string
  password: string
  code?: string
  uuid?: string
}

// 小程序登录请求体
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

// 系统功能配置类型
interface SystemFeature {
  langchain4jEnabled: boolean
  websocketEnabled: boolean
  sseEnabled: boolean
}

// 标签页项配置类型
interface WdTabbarItemProps {
  title: string
  icon: string
  isDot: boolean
  value: number
  loaded: boolean
}
```

## 最佳实践

### 1. 使用 storeToRefs 保持响应性

在模板中使用 Store 状态时，必须使用 `storeToRefs` 保持响应性：

```typescript
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// ✅ 正确：使用 storeToRefs 解构状态
const { userInfo, isLoggedIn, roles } = storeToRefs(userStore)

// ✅ 正确：方法可以直接解构
const { loginWithPassword, logoutUser, fetchUserInfo } = userStore

// ❌ 错误：直接解构状态会丢失响应性
// const { userInfo } = userStore  // userInfo 不再是响应式的
```

### 2. 在 Composable 中封装复杂 Store 逻辑

将复杂的 Store 操作封装到 Composable 中，提高代码复用性：

```typescript
// composables/useAuth.ts
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

export function useAuth() {
  const userStore = useUserStore()
  const { isLoggedIn, userInfo, roles, permissions } = storeToRefs(userStore)

  /**
   * 统一登录入口
   */
  const login = async (credentials: LoginCredentials) => {
    uni.showLoading({ title: '登录中...' })

    const [err] = await userStore.loginWithPassword(credentials)

    uni.hideLoading()

    if (!err) {
      await userStore.fetchUserInfo()
      uni.showToast({ title: '登录成功', icon: 'success' })
      return true
    }

    uni.showToast({ title: err.message, icon: 'none' })
    return false
  }

  /**
   * 统一登出入口
   */
  const logout = async () => {
    await userStore.logoutUser()
    uni.reLaunch({ url: '/pages/login/login' })
  }

  /**
   * 检查权限
   */
  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission) ||
           permissions.value.includes('*:*:*')
  }

  /**
   * 检查角色
   */
  const hasRole = (role: string) => {
    return roles.value.includes(role) ||
           roles.value.includes('admin')
  }

  return {
    isLoggedIn,
    userInfo,
    roles,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole
  }
}
```

### 3. Store 职责单一化

每个 Store 应只负责一个业务领域，避免职责混乱：

```typescript
// ✅ 推荐：职责单一
useUserStore()    // 只管理用户认证相关
useDictStore()    // 只管理字典数据
useCartStore()    // 只管理购物车相关
useOrderStore()   // 只管理订单相关

// ❌ 不推荐：职责混乱
useAppStore()     // 包含用户、字典、设置、购物车等所有状态
```

### 4. 避免在 Store 中直接操作 UI

Store 应专注于状态管理，UI 操作应在组件或 Composable 中处理：

```typescript
// ❌ 不推荐：在 Store 中处理 UI
const loginUser = async () => {
  uni.showLoading({ title: '登录中...' })  // 不应该在 Store 中
  const result = await api.login()
  uni.hideLoading()  // 不应该在 Store 中
  return result
}

// ✅ 推荐：Store 只处理状态
const loginUser = async (data: LoginRequest): Result<AuthTokenVo> => {
  const [err, result] = await userLogin(data)
  if (!err) {
    token.value = result.access_token
  }
  return [err, result]
}

// 组件中处理 UI
const handleLogin = async () => {
  uni.showLoading({ title: '登录中...' })
  const [err] = await userStore.loginUser(loginData)
  uni.hideLoading()

  if (err) {
    uni.showToast({ title: err.message, icon: 'none' })
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
```

### 5. 异步操作统一返回 Result 类型

所有异步操作统一返回 `Result<T>` 类型，便于错误处理：

```typescript
// Store 方法定义
const fetchUserInfo = async (): Result<UserInfoVo> => {
  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }
  userInfo.value = data.user
  roles.value = data.roles
  permissions.value = data.permissions
  return [null, data]
}

// 组件中使用
const loadUserInfo = async () => {
  const [err, data] = await userStore.fetchUserInfo()

  if (err) {
    console.error('获取用户信息失败:', err.message)
    // 处理错误逻辑
    return
  }

  // 使用 data 进行后续操作
  console.log('用户信息:', data)
}
```

### 6. 使用计算属性处理派生状态

对于需要根据现有状态计算的值，使用 `computed` 而非方法：

```typescript
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<string[]>([])

  // ✅ 推荐：使用 computed 处理派生状态
  const isLoggedIn = computed(() => token.value.length > 0)

  const hasUserAuth = computed(() => {
    return !!(userInfo.value?.avatar && userInfo.value?.nickName)
  })

  const isAdmin = computed(() => {
    return roles.value.includes('admin')
  })

  const displayName = computed(() => {
    return userInfo.value?.nickName || userInfo.value?.userName || '游客'
  })

  // ❌ 不推荐：使用方法获取派生状态
  // const isLoggedIn = () => token.value.length > 0

  return {
    token,
    userInfo,
    roles,
    isLoggedIn,
    hasUserAuth,
    isAdmin,
    displayName
  }
})
```

## 常见问题

### 1. Store 状态在页面切换后丢失

**问题原因:**
- 小程序页面栈机制导致组件重新创建
- 页面被销毁后重新进入时状态未恢复

**解决方案:**

在 App.vue 的 `onLaunch` 中初始化必要的 Store：

```vue
<!-- App.vue -->
<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import { useFeatureStore } from '@/stores/modules/feature'
import { useDictStore } from '@/stores/modules/dict'

const userStore = useUserStore()
const featureStore = useFeatureStore()
const dictStore = useDictStore()

onLaunch(async () => {
  // 1. 初始化功能配置（无需登录）
  await featureStore.initFeatures()

  // 2. 如果有 token，恢复用户状态
  if (userStore.token) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      // Token 失效，清除状态
      await userStore.logoutUser()
    }
  }

  // 3. 预加载常用字典数据
  // 可以通过 useDict composable 自动加载
})
</script>
```

### 2. 多个组件同时修改状态导致冲突

**问题原因:**
- 并发操作导致状态不一致
- 直接修改 Store 状态而非通过方法

**解决方案:**

通过 Store 方法统一管理状态修改：

```typescript
// Store 定义
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  // ✅ 推荐：通过方法修改状态
  const addItem = (item: CartItem) => {
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push(item)
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.quantity = Math.max(0, quantity)
    }
  }

  return { items, total, addItem, updateQuantity }
})

// 组件中使用
const cartStore = useCartStore()

// ✅ 正确：通过方法修改
cartStore.addItem(newItem)
cartStore.updateQuantity(itemId, 5)

// ❌ 错误：直接修改状态
// cartStore.items.push(newItem)
// cartStore.items[0].quantity = 5
```

### 3. TypeScript 类型推导不完整

**问题原因:**
- Store 返回类型未正确定义
- 使用了 `any` 类型

**解决方案:**

确保所有返回值都有明确类型：

```typescript
import type { SysUserVo, UserInfoVo } from '@/api/system/core/user/userTypes'

export const useUserStore = defineStore('user', () => {
  // 明确泛型类型
  const data = ref<SysUserVo | null>(null)
  const list = ref<SysUserVo[]>([])

  // 明确返回类型
  const fetchData = async (): Result<UserInfoVo> => {
    const [err, result] = await getUserInfo()
    if (!err) {
      data.value = result.user
    }
    return [err, result]
  }

  // 计算属性自动推导
  const hasData = computed(() => data.value !== null)

  return {
    data,
    list,
    hasData,
    fetchData
  }
})
```

### 4. Store 在非组件环境中使用

**问题原因:**
- 在 Pinia 实例创建前调用 Store
- 在独立的工具函数中使用 Store

**解决方案:**

确保在 Pinia 实例创建后使用，或在函数内部调用：

```typescript
// ❌ 错误：在模块顶层调用
// const userStore = useUserStore()  // Pinia 可能还未初始化

// ✅ 正确：在函数内部调用
export function checkAuth() {
  const userStore = useUserStore()
  return userStore.isLoggedIn
}

// ✅ 正确：在组件 setup 中调用
export default defineComponent({
  setup() {
    const userStore = useUserStore()
    // ...
  }
})

// ✅ 正确：在 Composable 中调用
export function useAuth() {
  const userStore = useUserStore()
  // ...
}
```

### 5. 字典数据加载时机问题

**问题原因:**
- 组件渲染时字典数据尚未加载完成
- 字典数据请求失败未处理

**解决方案:**

使用 `useDict` Composable 处理异步加载：

```typescript
// composables/useDict.ts
export function useDict(...dictTypes: string[]) {
  const dictStore = useDictStore()
  const result: Record<string, Ref<DictItem[]>> = {}

  dictTypes.forEach(type => {
    result[type] = ref<DictItem[]>([])

    // 检查是否已缓存
    const cached = dictStore.getDict(type)
    if (cached) {
      result[type].value = cached
    } else {
      // 异步加载
      loadDict(type).then(data => {
        dictStore.setDict(type, data)
        result[type].value = data
      })
    }
  })

  return result
}

// 组件中使用
const { sys_user_gender, sys_enable_status } = useDict(
  'sys_user_gender',
  'sys_enable_status'
)

// 模板中安全使用（空数组不会报错）
// <wd-picker :columns="sys_user_gender" />
```

### 6. WebSocket 连接状态管理

**问题原因:**
- 页面切换时 WebSocket 状态不一致
- 重复连接或未正确断开

**解决方案:**

在 UserStore 中统一管理 WebSocket 生命周期：

```typescript
// 登录成功后自动连接
const loginUser = async (loginRequest: LoginRequest): Result<AuthTokenVo> => {
  const [err, data] = await userLogin(loginRequest)
  if (!err) {
    tokenUtils.setToken(data.access_token)
    token.value = data.access_token

    // 登录成功后初始化 WebSocket
    handleInitWebSocket()
  }
  return [err, data]
}

// 登出时断开连接
const logoutUser = async (): Result<R<void>> => {
  // 先断开 WebSocket 连接
  webSocket.disconnect()

  // 调用登出 API
  const [err, data] = await userLogout()

  // 清除状态
  token.value = ''
  userInfo.value = null
  roles.value = []
  permissions.value = []
  tokenUtils.removeToken()

  return [err, data]
}
```

## 调试技巧

### Vue DevTools 集成

Pinia 完全支持 Vue DevTools，可以：

1. **查看所有 Store 状态** - 在 DevTools 的 Pinia 面板中查看
2. **追踪状态变化** - 实时监控状态修改
3. **时间旅行调试** - 回溯到之前的状态
4. **手动修改状态** - 直接在 DevTools 中编辑状态测试

### 日志调试

在开发环境添加状态变化日志：

```typescript
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<SysUserVo | null>(null)

  // 开发环境日志
  if (import.meta.env.DEV) {
    watch(token, (newVal, oldVal) => {
      console.log('[UserStore] token changed:', {
        from: oldVal?.slice(0, 20) + '...',
        to: newVal?.slice(0, 20) + '...'
      })
    })

    watch(userInfo, (newVal, oldVal) => {
      console.log('[UserStore] userInfo changed:', {
        from: oldVal?.nickName,
        to: newVal?.nickName
      })
    }, { deep: true })
  }

  return { token, userInfo }
})
```

### 状态持久化调试

```typescript
// 检查 Token 存储状态
const tokenUtils = useToken()

console.log('当前 Token:', tokenUtils.getToken())
console.log('Token 是否有效:', tokenUtils.getToken()?.length > 0)

// 手动清除存储调试
tokenUtils.removeToken()
uni.clearStorageSync()
```

### 请求拦截器调试

```typescript
// 在 HTTP 拦截器中添加调试信息
http.interceptors.request.use((config) => {
  const userStore = useUserStore()
  console.log('[HTTP Request]', {
    url: config.url,
    hasToken: !!userStore.token,
    isLoggedIn: userStore.isLoggedIn
  })
  return config
})
```

## 性能优化

### 1. 按需加载 Store

避免在应用启动时加载所有 Store：

```typescript
// ❌ 不推荐：启动时加载所有 Store
import { useUserStore } from '@/stores/modules/user'
import { useCartStore } from '@/stores/modules/cart'
import { useOrderStore } from '@/stores/modules/order'
// ... 更多 Store

// ✅ 推荐：在需要时加载
// 只在用户模块中导入 useUserStore
// 只在购物车模块中导入 useCartStore
```

### 2. 避免不必要的响应式

```typescript
// ❌ 不推荐：将大对象完全响应式化
const bigData = ref<HugeObject>(hugeObject)

// ✅ 推荐：只响应式化必要的部分
const selectedId = ref<string>('')
const bigData = shallowRef<HugeObject>(hugeObject)  // 浅层响应式
```

### 3. 使用 shallowRef 优化大数据

```typescript
export const useDictStore = defineStore('dict', () => {
  // 使用 shallowRef，字典数据变化时不需要深度响应
  const dict = shallowRef<Map<string, DictItem[]>>(new Map())

  const setDict = (key: string, value: DictItem[]) => {
    const newMap = new Map(dict.value)
    newMap.set(key, value)
    dict.value = newMap  // 触发更新
  }

  return { dict, setDict }
})
```

### 4. 计算属性缓存

```typescript
// ✅ 使用 computed 缓存计算结果
const filteredItems = computed(() => {
  return items.value.filter(item => item.status === 'active')
})

// ❌ 避免在模板中直接调用方法（每次渲染都会执行）
// <view v-for="item in getFilteredItems()">
```

## 扩展阅读

本文档详细介绍了 RuoYi-Plus-UniApp 移动端的 Pinia 状态管理架构。如需了解更多细节，请参考以下源码文件：

- **Pinia 实例**: `plus-uniapp/src/stores/store.ts`
- **用户状态**: `plus-uniapp/src/stores/modules/user.ts`
- **字典状态**: `plus-uniapp/src/stores/modules/dict.ts`
- **功能配置**: `plus-uniapp/src/stores/modules/feature.ts`
- **标签栏状态**: `plus-uniapp/src/stores/modules/tabbar.ts`
- **类型定义**: `plus-uniapp/src/types/global.d.ts`
- **字典 Composable**: `plus-uniapp/src/composables/useDict.ts`
- **认证 Composable**: `plus-uniapp/src/composables/useAuth.ts`
