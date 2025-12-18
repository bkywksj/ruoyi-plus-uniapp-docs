# 用户状态管理 (user)

## 介绍

用户状态管理模块(useUserStore)是基于 Pinia 实现的用户认证与权限管理核心模块，负责处理用户身份认证、权限控制和个人信息管理。

**核心特性:**

- **身份认证管理** - 提供完整的登录、注销和身份验证功能，支持多种登录方式
- **权限数据维护** - 存储和管理用户角色(roles)和权限标识(permissions)
- **用户信息存储** - 管理用户基本资料，支持动态更新和持久化
- **Token 管理** - 基于 useToken composable 实现访问令牌的安全存储和过期管理
- **会话持久化** - 通过 localStorage 实现跨标签页共享和刷新后恢复

## 状态定义

### 核心状态

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

export const useUserStore = defineStore('user', () => {
  /** 用户令牌 */
  const token = ref<string>(tokenUtils.getToken())

  /** 用户基本信息 */
  const userInfo = ref<SysUserVo | null>(null)

  /** 用户角色编码集合 */
  const roles = ref<Array<string>>([])

  /** 用户权限编码集合 */
  const permissions = ref<Array<string>>([])
})
```

### 状态说明

| 状态 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `token` | `Ref<string>` | 用户访问令牌 | 空字符串 |
| `userInfo` | `Ref<SysUserVo \| null>` | 用户完整信息对象 | `null` |
| `roles` | `Ref<string[]>` | 角色编码数组 | `[]` |
| `permissions` | `Ref<string[]>` | 权限编码数组 | `[]` |

### SysUserVo 类型定义

```typescript
export interface SysUserVo {
  userId: string | number
  tenantId: string
  deptId: string | number
  userName: string
  nickName: string
  userType: string
  email: string
  phone: string
  gender: string
  avatar: string
  status: string
  loginIp: string
  loginDate: string
  remark: string
  deptName: string
  roles: SysRoleVo[]
  roleIds: any
  postIds: any
  roleId: any
  admin: boolean
  createTime?: string
}
```

## 核心方法

### loginUser - 用户登录

```typescript
const loginUser = async (loginRequest: LoginRequest): Result<void> => {
  const [err, data] = await userLogin(loginRequest)
  if (err) {
    return [err, null]
  }

  // 保存token到localStorage和store
  tokenUtils.setToken(data.access_token, data.expire_in)
  token.value = data.access_token

  return [null, null]
}
```

**支持的登录方式:**

```typescript
// 密码登录
interface PasswordLoginBody extends LoginBody {
  authType: 'password'
  userName: string
  password: string
  code?: string
  uuid?: string
  tenantId?: string
  rememberMe?: boolean
}

// 邮箱登录
interface EmailLoginBody extends LoginBody {
  authType: 'email'
  email: string
  emailCode: string
}

// 短信登录
interface SmsLoginBody extends LoginBody {
  authType: 'sms'
  phone: string
  smsCode: string
}

// 社交登录
interface SocialLoginBody extends LoginBody {
  authType: 'social'
  tenantId: string
  source: string
  socialCode: string
  socialState: string
}

export type LoginRequest =
  | PasswordLoginBody
  | EmailLoginBody
  | SmsLoginBody
  | SocialLoginBody
```

### fetchUserInfo - 获取用户信息

```typescript
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }

  const user = data.user

  // 处理用户头像
  if (!user.avatar) {
    user.avatar = defAva
  }

  userInfo.value = user
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  return [null, null]
}
```

**返回数据结构:**

```typescript
interface UserInfoVo {
  user: SysUserVo
  roles: string[]
  permissions: string[]
}
```

### logoutUser - 用户注销

```typescript
const logoutUser = async (): Result<void> => {
  const [err] = await userLogout()

  // 清除状态
  token.value = ''
  userInfo.value = null
  roles.value = []
  permissions.value = []

  tokenUtils.removeToken()

  return [err, null]
}
```

### updateAvatar - 更新头像

```typescript
const updateAvatar = (avatarUrl: string): void => {
  if (userInfo.value) {
    userInfo.value.avatar = avatarUrl
  }
}
```

## 基本用法

### 1. 用户登录流程

```vue
<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
    <el-form-item prop="userName">
      <el-input v-model="loginForm.userName" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item prop="password">
      <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
    </el-form-item>

    <el-form-item v-if="captchaEnabled" prop="code">
      <el-input v-model="loginForm.code" placeholder="验证码" />
      <img :src="captchaImg" @click="getCaptcha" />
    </el-form-item>

    <el-button type="primary" :loading="loading" @click="handleLogin">
      登录
    </el-button>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import type { PasswordLoginBody } from '@/api/system/auth/authTypes'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive<PasswordLoginBody>({
  authType: 'password',
  userName: '',
  password: '',
  code: '',
  uuid: '',
  rememberMe: false
})

const handleLogin = async () => {
  await loginFormRef.value?.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    const [err] = await userStore.loginUser(loginForm)
    loading.value = false

    if (err) {
      showMsgError(err.message || '登录失败')
      return
    }

    showMsgSuccess('登录成功')
    const redirect = router.currentRoute.value.query.redirect as string
    await router.push(redirect || '/')
  })
}

onMounted(() => {
  getCaptcha()
})
</script>
```

### 2. 路由守卫中获取用户信息

```typescript
export const setupRouteGuards = (router: Router): void => {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const { canAccessRoute, isLoggedIn } = useAuth()

    // 未登录处理
    if (!isLoggedIn.value) {
      if (isInWhiteList(to.path)) {
        return next()
      }
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // 已登录访问登录页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 已加载用户信息
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      }
      return next('/403')
    }

    // 获取用户信息
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      await userStore.logoutUser()
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    // 生成动态路由
    const [, accessRoutes] = await permissionStore.generateRoutes()
    accessRoutes.forEach((route) => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })

    next({ ...to, replace: true })
  })
}
```

### 3. 组件中使用用户信息

```vue
<template>
  <view class="user-profile">
    <el-avatar :size="80" :src="userInfo?.avatar" />
    <view class="user-info">
      <view class="nickname">{{ userInfo?.nickName || '未登录' }}</view>
      <view class="username">@{{ userInfo?.userName }}</view>
    </view>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="手机号码">{{ userInfo?.phone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="用户邮箱">{{ userInfo?.email || '-' }}</el-descriptions-item>
      <el-descriptions-item label="账号状态">
        <el-tag :type="userInfo?.status === '0' ? 'success' : 'danger'">
          {{ userInfo?.status === '0' ? '正常' : '停用' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <el-card class="roles-card">
      <template #header>角色信息</template>
      <el-tag v-for="role in roles" :key="role" type="primary">{{ role }}</el-tag>
    </el-card>
  </view>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const { userInfo, roles, permissions } = storeToRefs(userStore)
</script>
```

### 4. 权限判断

```vue
<template>
  <view class="user-management">
    <view class="toolbar">
      <el-button v-if="hasPermission('system:user:add')" type="primary" @click="handleAdd">
        新增用户
      </el-button>
      <el-button v-if="isAdmin" type="danger" @click="handleClearCache">
        清除缓存
      </el-button>
    </view>

    <el-table :data="tableData">
      <el-table-column prop="userName" label="用户名" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="hasPermission('system:user:edit')" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button v-if="hasPermission('system:user:remove')" type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const { roles, permissions } = storeToRefs(userStore)

const hasPermission = (permission: string): boolean => {
  return permissions.value.includes(permission)
}

const hasAnyPermission = (...perms: string[]): boolean => {
  return perms.some(p => permissions.value.includes(p))
}

const isAdmin = computed(() => roles.value.includes('admin'))
</script>
```

### 5. 用户注销

```vue
<template>
  <el-dropdown @command="handleCommand">
    <span class="user-dropdown">
      <el-avatar :size="32" :src="userInfo?.avatar" />
      <span>{{ userInfo?.nickName }}</span>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">个人中心</el-dropdown-item>
        <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    const confirmed = await showConfirm({ message: '确定要退出登录吗?' })
    if (!confirmed) return

    await userStore.logoutUser()
    showMsgSuccess('退出成功')
    await router.push('/login')
  }
}
</script>
```

### 6. 更新用户头像

```vue
<template>
  <el-upload
    :action="uploadUrl"
    :headers="uploadHeaders"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload"
  >
    <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
    <el-icon v-else><Plus /></el-icon>
  </el-upload>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'
import { useToken } from '@/composables/useToken'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const tokenUtils = useToken()

const uploadUrl = computed(() => `${import.meta.env.VITE_APP_BASE_API}/system/user/profile/avatar`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${tokenUtils.getToken()}`
}))
const avatarUrl = computed(() => userInfo.value?.avatar)

const beforeAvatarUpload = (rawFile) => {
  const isValid = ['image/jpeg', 'image/png'].includes(rawFile.type)
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isValid) {
    showMsgError('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    showMsgError('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    userStore.updateAvatar(response.data.imgUrl)
    showMsgSuccess('头像更新成功')
  }
}
</script>
```

## Token 管理策略

### useToken Composable

```typescript
export const useToken = () => {
  const TOKEN_KEY = 'token'

  const getToken = (): string | null => {
    return localCache.get(TOKEN_KEY)
  }

  const setToken = (accessToken: string, expireSeconds?: number): void => {
    localCache.set(TOKEN_KEY, accessToken, expireSeconds)
  }

  const removeToken = (): void => {
    localCache.remove(TOKEN_KEY)
  }

  const getAuthHeaders = (): Record<string, string> => {
    const tokenValue = getToken()
    if (!tokenValue) return {}
    return { Authorization: `Bearer ${tokenValue}` }
  }

  return { getToken, setToken, removeToken, getAuthHeaders }
}
```

### Token 存储与过期处理

```typescript
// 登录时设置Token和过期时间
const loginUser = async (loginRequest: LoginRequest): Result<void> => {
  const [err, data] = await userLogin(loginRequest)
  if (err) return [err, null]

  // 保存token，设置过期时间(秒)
  tokenUtils.setToken(data.access_token, data.expire_in)
  token.value = data.access_token

  return [null, null]
}

// HTTP 响应拦截器处理401错误
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      await userStore.logoutUser()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### 安全措施

```typescript
// 1. Token 过期时间类型
interface AuthTokenVo {
  access_token: string
  refresh_token?: string
  expire_in: number           // 访问令牌有效期(秒)
  refresh_expire_in?: number  // 刷新令牌有效期(秒)
}

// 2. 单点登录控制
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { code, msg } = error.response.data

      if (code === 401 && msg.includes('已在其他设备登录')) {
        await showConfirm({
          title: '系统提示',
          message: '您的账号已在其他设备登录',
          showCancelButton: false
        })
        const userStore = useUserStore()
        await userStore.logoutUser()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)
```

## 与其他模块协作

### 1. 与 Permission Store 协作

```typescript
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 获取用户信息和权限
  if (userStore.token && userStore.roles.length === 0) {
    await userStore.fetchUserInfo()
  }

  // 基于角色生成动态路由
  const [, accessRoutes] = await permissionStore.generateRoutes()
  accessRoutes.forEach((route) => router.addRoute(route))

  next({ ...to, replace: true })
})
```

### 2. 与 Dict Store 协作

```typescript
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) return [err, null]

  userInfo.value = data.user
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  // 加载用户相关字典
  const dictStore = useDictStore()
  await dictStore.loadDictsByType(['sys_user_sex', 'sys_normal_disable'])

  return [null, null]
}
```

### 3. 与 Theme Store 协作

```typescript
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) return [err, null]

  userInfo.value = data.user
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  // 加载用户主题偏好
  const themeStore = useThemeStore()
  const userThemeConfig = await getUserThemeConfig()
  if (userThemeConfig) {
    themeStore.applyTheme(userThemeConfig)
  }

  return [null, null]
}
```

## 最佳实践

### 1. 在路由守卫中统一处理用户信息获取

```typescript
// ✅ 推荐：在路由守卫中集中处理
export const setupRouteGuards = (router: Router): void => {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    if (userStore.token && userStore.roles.length === 0) {
      const [err] = await userStore.fetchUserInfo()
      if (err) {
        await userStore.logoutUser()
        return next('/login')
      }
    }
    next()
  })
}

// ❌ 不推荐：在每个组件中获取
export default defineComponent({
  async created() {
    const userStore = useUserStore()
    if (!userStore.userInfo) {
      await userStore.fetchUserInfo()
    }
  }
})
```

### 2. 使用 storeToRefs 保持响应式

```typescript
// ✅ 推荐
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { userInfo, roles, permissions } = storeToRefs(userStore)

// ❌ 不推荐：直接解构会丢失响应式
const { userInfo, roles, permissions } = useUserStore()
```

### 3. 多标签页共享登录状态

```typescript
// 监听 localStorage 变化
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    const userStore = useUserStore()

    if (!e.newValue) {
      // Token被删除，当前标签页也注销
      userStore.logoutUser()
      router.push('/login')
    } else if (e.newValue !== userStore.token) {
      // Token更新，刷新用户信息
      userStore.token = e.newValue
      userStore.fetchUserInfo()
    }
  }
})
```

### 4. 权限判断封装为 Composable

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const userStore = useUserStore()

  const isLoggedIn = computed(() => !!userStore.token)

  const hasPermission = (permission: string): boolean => {
    return userStore.permissions.includes(permission)
  }

  const hasAnyPermission = (...permissions: string[]): boolean => {
    return permissions.some(p => userStore.permissions.includes(p))
  }

  const hasAllPermissions = (...permissions: string[]): boolean => {
    return permissions.every(p => userStore.permissions.includes(p))
  }

  const hasRole = (role: string): boolean => {
    return userStore.roles.includes(role)
  }

  const isAdmin = computed(() => userStore.roles.includes('admin'))

  const canAccessRoute = (route: RouteLocationNormalized): boolean => {
    if (!route.meta?.roles || route.meta.roles.length === 0) {
      return true
    }
    return route.meta.roles.some((role: string) => userStore.roles.includes(role))
  }

  return {
    isLoggedIn,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    canAccessRoute
  }
}
```

### 5. 错误处理和用户反馈

```typescript
const handleLogin = async () => {
  loading.value = true

  try {
    const [err] = await userStore.loginUser(loginForm)

    if (err) {
      if (err.message.includes('验证码')) {
        showMsgError('验证码错误')
        await getCaptcha()
      } else if (err.message.includes('账号或密码')) {
        showMsgError('账号或密码错误')
      } else {
        showMsgError(err.message || '登录失败')
      }
      return
    }

    showMsgSuccess('登录成功')
    await router.push('/')
  } finally {
    loading.value = false
  }
}
```

### 6. 防止重复获取用户信息

```typescript
let isFetchingUserInfo = false

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (userStore.token && userStore.roles.length === 0) {
    if (isFetchingUserInfo) {
      return next()
    }

    isFetchingUserInfo = true
    const [err] = await userStore.fetchUserInfo()
    isFetchingUserInfo = false

    if (err) {
      await userStore.logoutUser()
      return next('/login')
    }

    return next({ ...to, replace: true })
  }

  next()
})
```

## 常见问题

### 1. 刷新页面后用户信息丢失

**问题原因:** Token 存储在 Store 中，页面刷新后状态重置。

**解决方案:**

```typescript
export const useUserStore = defineStore('user', () => {
  const tokenUtils = useToken()

  // ✅ 从 localStorage 自动加载 Token
  const token = ref(tokenUtils.getToken())
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<Array<string>>([])
  const permissions = ref<Array<string>>([])

  return { token, userInfo, roles, permissions }
})

// 路由守卫中自动获取用户信息
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (userStore.token && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  next()
})
```

### 2. 多标签页登录状态不同步

**问题原因:** 一个标签页注销后，其他标签页的 Store 状态未更新。

**解决方案:**

```typescript
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    const userStore = useUserStore()
    const router = useRouter()

    if (!e.newValue) {
      userStore.token = ''
      userStore.userInfo = null
      userStore.roles = []
      userStore.permissions = []
      router.push('/login')
    } else if (e.newValue !== userStore.token) {
      userStore.token = e.newValue
      userStore.fetchUserInfo()
    }
  }
})
```

### 3. Token 过期后未自动跳转登录

**问题原因:** HTTP 响应拦截器未正确处理 401 状态码。

**解决方案:**

```typescript
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      const router = useRouter()

      await userStore.logoutUser()
      const redirect = encodeURIComponent(router.currentRoute.value.fullPath)
      await router.push({ path: '/login', query: { redirect } })
      showMsgError('登录已过期，请重新登录')
    }
    return Promise.reject(error)
  }
)
```

### 4. 注销后动态路由仍然可访问

**问题原因:** 注销时未清除动态路由。

**解决方案:**

```typescript
export const resetRouter = (): void => {
  const router = useRouter()
  const permissionStore = usePermissionStore()

  permissionStore.routes.forEach((route) => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })
  permissionStore.routes = []
}

const logoutUser = async (): Result<void> => {
  const [err] = await userLogout()

  token.value = ''
  userInfo.value = null
  roles.value = []
  permissions.value = []

  resetRouter()
  tokenUtils.removeToken()

  return [err, null]
}
```

## API

### 状态

| 名称 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `token` | `Ref<string>` | 用户访问令牌 | 从 localStorage 加载 |
| `userInfo` | `Ref<SysUserVo \| null>` | 用户基本信息 | `null` |
| `roles` | `Ref<string[]>` | 用户角色编码数组 | `[]` |
| `permissions` | `Ref<string[]>` | 用户权限编码数组 | `[]` |

### 方法

| 名称 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `loginUser` | `(loginRequest: LoginRequest)` | `Result<void>` | 用户登录 |
| `fetchUserInfo` | `()` | `Result<void>` | 获取用户信息 |
| `logoutUser` | `()` | `Result<void>` | 用户注销 |
| `updateAvatar` | `(avatarUrl: string)` | `void` | 更新用户头像 |

### 类型定义

```typescript
export interface SysUserVo {
  userId: string | number
  tenantId: string
  deptId: string | number
  userName: string
  nickName: string
  userType: string
  email: string
  phone: string
  gender: string
  avatar: string
  status: string
  loginIp: string
  loginDate: string
  remark: string
  deptName: string
  roles: SysRoleVo[]
  roleIds: any
  postIds: any
  roleId: any
  admin: boolean
  createTime?: string
}

export interface UserInfoVo {
  user: SysUserVo
  roles: string[]
  permissions: string[]
}

export type LoginRequest =
  | PasswordLoginBody
  | EmailLoginBody
  | SmsLoginBody
  | SocialLoginBody

export interface PasswordLoginBody extends LoginBody {
  authType: 'password'
  userName: string
  password: string
  code?: string
  uuid?: string
  tenantId?: string
  rememberMe?: boolean
}

export interface AuthTokenVo {
  access_token: string
  refresh_token?: string
  expire_in: number
  refresh_expire_in?: number
  scope?: string
}

type Result<T = any> = Promise<[Error | null, T | null]>
```

## 总结

用户状态管理模块核心要点:

1. **身份认证** - 登录、注销、Token 管理
2. **权限控制** - roles 和 permissions 数据维护
3. **状态持久化** - localStorage 存储 Token
4. **响应式更新** - 使用 storeToRefs 保持响应式
5. **模块协作** - 与 Permission/Dict/Theme Store 协作
6. **安全措施** - Token 过期处理、单点登录控制
