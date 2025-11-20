# 用户状态管理 (user)

## 介绍

用户状态管理模块(useUserStore)是基于 Pinia 实现的用户认证与权限管理核心模块,负责处理用户身份认证、权限控制和个人信息管理,是整个应用安全体系的基础组件。该模块通过 Pinia 的响应式状态管理能力,提供完整的用户会话管理功能,支持登录、注销、权限验证等核心操作。

**核心特性:**

- **身份认证管理** - 提供完整的登录、注销和身份验证功能,支持多种登录方式(密码、邮箱、短信、社交登录)
- **权限数据维护** - 存储和管理用户角色(roles)和权限标识(permissions),为路由守卫和功能权限控制提供数据支持
- **用户信息存储** - 管理用户基本资料(昵称、头像、账号等),支持动态更新和持久化
- **Token 管理** - 基于 useToken composable 实现访问令牌的安全存储、过期管理和自动刷新
- **会话持久化** - 通过 localStorage 实现用户会话的跨标签页共享和刷新后恢复
- **状态同步** - 与路由守卫、权限管理等模块协作,确保应用安全性和一致性

## 状态定义

### 核心状态

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

export const useUserStore = defineStore('user', () => {
  /**
   * 用户令牌
   * @description 用户登录后的访问令牌,用于 API 请求认证
   */
  const token = ref<string>(tokenUtils.getToken())

  /**
   * 用户基本信息
   * @description 用户的基本信息(账号、昵称、头像等)
   */
  const userInfo = ref<SysUserVo | null>(null)

  /**
   * 用户角色编码集合
   * @description 用于判断路由权限和功能权限
   * @example ['admin', 'common']
   */
  const roles = ref<Array<string>>([])

  /**
   * 用户权限编码集合
   * @description 用于判断按钮权限等细粒度权限控制
   * @example ['system:user:list', 'system:user:add']
   */
  const permissions = ref<Array<string>>([])
})
```

### 状态说明

| 状态 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `token` | `Ref<string>` | 用户访问令牌,从 localStorage 自动加载 | 空字符串 |
| `userInfo` | `Ref<SysUserVo \| null>` | 用户完整信息对象 | `null` |
| `roles` | `Ref<string[]>` | 角色编码数组,用于路由级权限控制 | `[]` |
| `permissions` | `Ref<string[]>` | 权限编码数组,用于按钮级权限控制 | `[]` |

### SysUserVo 类型定义

```typescript
/**
 * 用户信息视图类型
 */
export interface SysUserVo {
  /** 用户ID */
  userId: string | number

  /** 租户id */
  tenantId: string

  /** 部门ID */
  deptId: string | number

  /** 用户账号 */
  userName: string

  /** 用户昵称 */
  nickName: string

  /** 用户类型 */
  userType: string

  /** 用户邮箱 */
  email: string

  /** 手机号码 */
  phone: string

  /** 用户性别 */
  gender: string

  /** 头像地址 */
  avatar: string

  /** 帐号状态 */
  status: string

  /** 最后登录IP */
  loginIp: string

  /** 最后登录时间 */
  loginDate: string

  /** 备注 */
  remark: string

  /** 部门名称 */
  deptName: string

  /** 角色列表 */
  roles: SysRoleVo[]

  /** 角色id列表 */
  roleIds: any

  /** 岗位id列表 */
  postIds: any

  /** 角色id */
  roleId: any

  /** 是否管理员 */
  admin: boolean

  /** 创建时间 */
  createTime?: string
}
```

## 核心方法

### loginUser - 用户登录

```typescript
/**
 * 用户登录
 * @param loginRequest 登录信息,包含用户名和密码
 * @returns Promise 登录成功时resolve,失败时reject错误信息
 * @description 调用登录API,成功后保存token
 */
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

**功能说明:**

1. **调用登录 API** - 发送用户名、密码和验证码到后端进行验证
2. **Token 存储** - 登录成功后将访问令牌保存到 localStorage 和 Store 状态
3. **过期时间设置** - 根据后端返回的 `expire_in` 设置 Token 过期时间
4. **错误处理** - 使用 Result 类型统一处理成功和失败情况

**支持的登录方式:**

```typescript
// 密码登录
interface PasswordLoginBody extends LoginBody {
  authType: 'password'
  userName: string
  password: string
  code?: string          // 验证码
  uuid?: string          // 验证码唯一标识
  tenantId?: string      // 租户ID
  rememberMe?: boolean   // 记住密码
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
  source: string         // 第三方平台(wechat/qq/github等)
  socialCode: string
  socialState: string
}

// 统一登录请求类型
export type LoginRequest =
  | PasswordLoginBody
  | EmailLoginBody
  | SmsLoginBody
  | SocialLoginBody
```

### fetchUserInfo - 获取用户信息

```typescript
/**
 * 获取用户信息
 * @returns Result
 * @description 调用获取用户信息API,获取用户基本信息、角色和权限
 */
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }

  const user = data.user

  // 处理用户头像
  if (!user.avatar) {
    user.avatar = defAva  // 使用默认头像
  }

  // 设置用户基本信息
  userInfo.value = user

  // 设置角色和权限
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  return [null, null]
}
```

**功能说明:**

1. **获取完整信息** - 从后端获取用户基本资料、角色列表和权限集合
2. **默认头像处理** - 如果用户未设置头像,使用系统默认头像
3. **状态更新** - 更新 Store 中的 userInfo、roles 和 permissions 状态
4. **权限数据准备** - 为路由守卫和权限判断提供数据支持

**返回数据结构:**

```typescript
interface UserInfoVo {
  /** 用户基本信息 */
  user: SysUserVo

  /** 角色标识符列表 */
  roles: string[]

  /** 权限标识符列表 */
  permissions: string[]
}
```

### logoutUser - 用户注销

```typescript
/**
 * 用户注销
 * @returns Result
 * @description 调用注销API,清除用户状态和token
 */
const logoutUser = async (): Result<void> => {
  // 调用注销API
  const [err] = await userLogout()

  // 清除状态
  token.value = ''
  userInfo.value = null
  roles.value = []
  permissions.value = []

  // 移除localStorage中的token
  tokenUtils.removeToken()

  return [err, null]
}
```

**功能说明:**

1. **调用注销 API** - 通知后端清除服务端会话
2. **清空状态** - 重置所有用户相关状态为初始值
3. **删除 Token** - 从 localStorage 中移除访问令牌
4. **错误容忍** - 即使后端注销失败,仍然清除前端状态

### updateAvatar - 更新头像

```typescript
/**
 * 更新用户头像
 * @param avatarUrl 新头像的URL地址
 * @description 更新用户头像
 */
const updateAvatar = (avatarUrl: string): void => {
  if (userInfo.value) {
    userInfo.value.avatar = avatarUrl
  }
}
```

**功能说明:**

- **即时更新** - 动态更新用户头像,无需重新登录
- **响应式更新** - 利用 Vue 3 响应式系统自动更新界面
- **安全检查** - 检查 userInfo 是否存在,避免空指针错误

## 基本用法

### 1. 用户登录流程

完整的用户登录流程实现:

```vue
<template>
  <view class="login-page">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <el-form-item prop="userName">
        <el-input
          v-model="loginForm.userName"
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>

      <el-form-item v-if="captchaEnabled" prop="code">
        <view class="captcha-container">
          <el-input
            v-model="loginForm.code"
            placeholder="请输入验证码"
            maxlength="4"
          />
          <img
            :src="captchaImg"
            @click="getCaptcha"
            class="captcha-image"
          />
        </view>
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="loginForm.rememberMe">
          记住密码
        </el-checkbox>
      </el-form-item>

      <el-button
        type="primary"
        :loading="loading"
        @click="handleLogin"
        class="login-button"
      >
        登录
      </el-button>
    </el-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { getCaptchaImage } from '@/api/system/auth/authApi'
import type { PasswordLoginBody } from '@/api/system/auth/authTypes'
import { showMsgSuccess, showMsgError } from '@/utils/modal'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 登录表单数据
const loginForm = reactive<PasswordLoginBody>({
  authType: 'password',
  userName: '',
  password: '',
  code: '',
  uuid: '',
  rememberMe: false
})

// 验证码配置
const captchaEnabled = ref(true)
const captchaImg = ref('')

// 加载状态
const loading = ref(false)

// 表单验证规则
const loginRules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

/**
 * 获取验证码
 */
const getCaptcha = async () => {
  const [err, data] = await getCaptchaImage()
  if (!err && data) {
    captchaEnabled.value = data.captchaEnabled
    if (captchaEnabled.value) {
      captchaImg.value = `data:image/gif;base64,${data.img}`
      loginForm.uuid = data.uuid
    }
  }
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return

  // 验证表单
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    // 调用登录方法
    const [err] = await userStore.loginUser(loginForm)

    loading.value = false

    if (err) {
      // 登录失败,刷新验证码
      showMsgError(err.message || '登录失败')
      await getCaptcha()
      return
    }

    // 登录成功
    showMsgSuccess('登录成功')

    // 跳转到首页或重定向页面
    const redirect = router.currentRoute.value.query.redirect as string
    await router.push(redirect || '/')
  })
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.captcha-container {
  display: flex;
  gap: 12px;

  :deep(.el-input) {
    flex: 1;
  }
}

.captcha-image {
  width: 100px;
  height: 38px;
  cursor: pointer;
  border-radius: 4px;
}

.login-button {
  width: 100%;
  margin-top: 20px;
}
</style>
```

**使用说明:**

- 表单验证使用 Element Plus 的验证规则
- 支持验证码功能,点击图片刷新
- 登录失败自动刷新验证码
- 支持记住密码功能(可扩展实现)
- 登录成功后自动跳转到重定向页面或首页

### 2. 路由守卫中获取用户信息

在路由守卫中自动获取用户信息和权限:

```typescript
import { setupRouteGuards } from '@/router/guard'
import type { Router } from 'vue-router'

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

    // 已登录访问登录页,重定向首页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 白名单直接通过
    if (isInWhiteList(to.path)) {
      return next()
    }

    // 已加载用户信息,检查权限
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      } else {
        return next('/403')
      }
    }

    // 获取用户信息和权限
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      showMsgError('登录状态已过期,请重新登录')
      await userStore.logoutUser()
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // 生成动态路由
    const [generateRoutesErr, accessRoutes] =
      await permissionStore.generateRoutes()

    if (generateRoutesErr) {
      showMsgError(generateRoutesErr)
      return next('/403')
    }

    // 添加动态路由
    accessRoutes.forEach((route) => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })

    // 检查目标路由权限
    if (!canAccessRoute(to)) {
      return next('/403')
    }

    next({ ...to, replace: true })
  })

  router.afterEach((to) => {
    NProgress.done()
    const layout = useLayout()
    if (to.meta.title) {
      layout.setTitle(to.meta.title as string)
    }
  })
}
```

**技术实现:**

1. **登录状态检查** - 通过 `isLoggedIn` composable 检查 token 是否存在
2. **白名单机制** - `/login`、`/register` 等页面无需登录即可访问
3. **延迟加载** - 首次访问时才获取用户信息,避免不必要的请求
4. **角色判断** - 通过 `roles.length > 0` 判断是否已加载权限数据
5. **动态路由** - 获取用户信息后生成对应权限的路由表
6. **错误处理** - Token 失效时自动注销并跳转登录页

### 3. 组件中使用用户信息

在组件中显示和使用用户信息:

```vue
<template>
  <view class="user-profile">
    <!-- 用户头像和基本信息 -->
    <view class="user-header">
      <el-avatar
        :size="80"
        :src="userInfo?.avatar"
        @error="handleAvatarError"
      >
        <img src="@/assets/images/profile.jpg" />
      </el-avatar>

      <view class="user-info">
        <view class="nickname">{{ userInfo?.nickName || '未登录' }}</view>
        <view class="username">@{{ userInfo?.userName }}</view>
        <view class="dept">{{ userInfo?.deptName }}</view>
      </view>
    </view>

    <!-- 用户详细信息 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="手机号码">
        {{ userInfo?.phone || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="用户邮箱">
        {{ userInfo?.email || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="用户性别">
        {{ genderLabel }}
      </el-descriptions-item>
      <el-descriptions-item label="账号状态">
        <el-tag :type="userInfo?.status === '0' ? 'success' : 'danger'">
          {{ userInfo?.status === '0' ? '正常' : '停用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="最后登录IP">
        {{ userInfo?.loginIp || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="最后登录时间">
        {{ userInfo?.loginDate || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 角色和权限信息 -->
    <el-card class="roles-card">
      <template #header>
        <span>角色信息</span>
      </template>
      <el-tag
        v-for="role in roles"
        :key="role"
        type="primary"
        class="role-tag"
      >
        {{ role }}
      </el-tag>
      <el-empty v-if="roles.length === 0" description="暂无角色" />
    </el-card>

    <el-card class="permissions-card">
      <template #header>
        <span>权限列表</span>
      </template>
      <el-tag
        v-for="permission in permissions"
        :key="permission"
        type="info"
        size="small"
        class="permission-tag"
      >
        {{ permission }}
      </el-tag>
      <el-empty v-if="permissions.length === 0" description="暂无权限" />
    </el-card>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 使用 storeToRefs 保持响应式
const { userInfo, roles, permissions } = storeToRefs(userStore)

// 性别标签
const genderLabel = computed(() => {
  const genderMap: Record<string, string> = {
    '0': '男',
    '1': '女',
    '2': '未知'
  }
  return genderMap[userInfo.value?.gender || '2'] || '未知'
})

// 头像加载失败处理
const handleAvatarError = () => {
  console.error('头像加载失败')
}
</script>

<style lang="scss" scoped>
.user-profile {
  padding: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.user-info {
  margin-left: 20px;

  .nickname {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .username {
    color: #909399;
    margin-bottom: 4px;
  }

  .dept {
    color: #606266;
    font-size: 14px;
  }
}

.roles-card,
.permissions-card {
  margin-top: 20px;
}

.role-tag {
  margin: 4px;
}

.permission-tag {
  margin: 4px;
}
</style>
```

**使用说明:**

- 使用 `storeToRefs` 保持解构后的响应式
- 头像支持默认图片和错误处理
- 使用计算属性转换字典值
- 展示角色和权限列表
- 响应式更新,无需手动刷新

### 4. 权限判断

在组件中判断用户权限:

```vue
<template>
  <view class="user-management">
    <!-- 操作按钮 - 根据权限显示 -->
    <view class="toolbar">
      <el-button
        v-if="hasPermission('system:user:add')"
        type="primary"
        @click="handleAdd"
      >
        新增用户
      </el-button>

      <el-button
        v-if="hasPermission('system:user:export')"
        @click="handleExport"
      >
        导出数据
      </el-button>

      <el-button
        v-if="isAdmin"
        type="danger"
        @click="handleClearCache"
      >
        清除缓存
      </el-button>
    </view>

    <!-- 表格 -->
    <el-table :data="tableData">
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            v-if="hasPermission('system:user:edit')"
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>

          <el-button
            v-if="hasPermission('system:user:remove')"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
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

// 判断是否有指定权限
const hasPermission = (permission: string): boolean => {
  return permissions.value.includes(permission)
}

// 判断是否有任一权限
const hasAnyPermission = (...perms: string[]): boolean => {
  return perms.some(p => permissions.value.includes(p))
}

// 判断是否有全部权限
const hasAllPermissions = (...perms: string[]): boolean => {
  return perms.every(p => permissions.value.includes(p))
}

// 判断是否是管理员
const isAdmin = computed(() => {
  return roles.value.includes('admin')
})

// 判断是否有指定角色
const hasRole = (role: string): boolean => {
  return roles.value.includes(role)
}

// 表格数据(示例)
const tableData = ref([])

// 操作方法
const handleAdd = () => {
  console.log('新增用户')
}

const handleEdit = (row: any) => {
  console.log('编辑用户', row)
}

const handleDelete = (row: any) => {
  console.log('删除用户', row)
}

const handleExport = () => {
  console.log('导出数据')
}

const handleClearCache = () => {
  console.log('清除缓存')
}
</script>
```

**权限判断方法:**

1. **单个权限判断** - `hasPermission('system:user:add')`
2. **任一权限判断** - `hasAnyPermission('system:user:add', 'system:user:edit')`
3. **全部权限判断** - `hasAllPermissions('system:user:add', 'system:user:edit')`
4. **角色判断** - `hasRole('admin')` 或 `isAdmin`

### 5. 用户注销

实现用户注销功能:

```vue
<template>
  <el-dropdown @command="handleCommand">
    <span class="user-dropdown">
      <el-avatar :size="32" :src="userInfo?.avatar" />
      <span class="username">{{ userInfo?.nickName }}</span>
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <el-icon><User /></el-icon>
          个人中心
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <el-icon><Setting /></el-icon>
          个人设置
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { showConfirm, showMsgSuccess } from '@/utils/modal'
import {
  ArrowDown,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

/**
 * 处理下拉菜单命令
 */
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      await router.push('/user/profile')
      break

    case 'settings':
      await router.push('/user/settings')
      break

    case 'logout':
      await handleLogout()
      break
  }
}

/**
 * 处理退出登录
 */
const handleLogout = async () => {
  // 确认对话框
  const confirmed = await showConfirm({
    title: '系统提示',
    message: '确定要退出登录吗?',
    type: 'warning'
  })

  if (!confirmed) return

  // 调用注销方法
  const [err] = await userStore.logoutUser()

  if (err) {
    console.error('注销失败', err)
    // 即使后端注销失败,仍然清除前端状态并跳转登录页
  }

  showMsgSuccess('退出成功')

  // 跳转到登录页
  await router.push('/login')
}
</script>

<style lang="scss" scoped>
.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;

  .username {
    margin: 0 8px;
  }

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
```

**使用说明:**

- 使用 Element Plus Dropdown 组件实现下拉菜单
- 退出前弹出确认对话框
- 调用 `logoutUser` 方法清除状态
- 注销成功后跳转到登录页
- 即使后端注销失败,仍然清除前端状态

### 6. 更新用户头像

实现头像上传和更新功能:

```vue
<template>
  <view class="avatar-upload">
    <el-upload
      class="avatar-uploader"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
    >
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon">
        <Plus />
      </el-icon>
    </el-upload>

    <view class="tips">
      <p>支持 jpg、png 格式,大小不超过 2MB</p>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'
import { useToken } from '@/composables/useToken'
import { showMsgSuccess, showMsgError } from '@/utils/modal'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const tokenUtils = useToken()

// 上传接口地址
const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_APP_BASE_API}/system/user/profile/avatar`
})

// 上传请求头
const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${tokenUtils.getToken()}`
  }
})

// 当前头像URL
const avatarUrl = computed(() => {
  return userInfo.value?.avatar
})

/**
 * 上传前校验
 */
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 检查文件类型
  const isJPG = rawFile.type === 'image/jpeg'
  const isPNG = rawFile.type === 'image/png'

  if (!isJPG && !isPNG) {
    showMsgError('头像图片只能是 JPG 或 PNG 格式!')
    return false
  }

  // 检查文件大小
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isLt2M) {
    showMsgError('头像图片大小不能超过 2MB!')
    return false
  }

  return true
}

/**
 * 上传成功回调
 */
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  if (response.code === 200) {
    // 更新Store中的头像
    userStore.updateAvatar(response.data.imgUrl)
    showMsgSuccess('头像更新成功')
  } else {
    showMsgError(response.msg || '头像上传失败')
  }
}
</script>

<style lang="scss" scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.tips {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;

  p {
    margin: 0;
  }
}
</style>
```

**使用说明:**

- 使用 Element Plus Upload 组件实现文件上传
- 上传前校验文件类型和大小
- 自动添加认证 Token 到请求头
- 上传成功后调用 `updateAvatar` 更新Store状态
- 头像立即更新,无需刷新页面

## Token 管理策略

### useToken Composable

用户状态管理基于 `useToken` composable 实现 Token 的持久化管理:

```typescript
/**
 * Token 管理钩子 (useToken)
 */
export const useToken = () => {
  /**
   * Token 缓存键名
   */
  const TOKEN_KEY = 'token'

  /**
   * 获取 token
   */
  const getToken = (): string | null => {
    return localCache.get(TOKEN_KEY)
  }

  /**
   * 设置 token
   * @param accessToken 要存储的 token
   * @param expireSeconds 过期时间(秒),不传则永不过期
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

### Token 存储机制

**存储位置:**

- 使用 `localStorage` 存储 Token
- 键名: `token`
- 支持设置过期时间

**过期处理:**

```typescript
// 登录时设置Token和过期时间
const loginUser = async (loginRequest: LoginRequest): Result<void> => {
  const [err, data] = await userLogin(loginRequest)
  if (err) {
    return [err, null]
  }

  // 保存token,设置过期时间(秒)
  tokenUtils.setToken(data.access_token, data.expire_in)
  token.value = data.access_token

  return [null, null]
}
```

**自动刷新机制:**

```typescript
// HTTP 请求拦截器中检查Token过期
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokenUtils = useToken()
    const token = tokenUtils.getToken()

    if (token && config.headers.auth !== false) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  }
)

// HTTP 响应拦截器中处理401错误
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期,清除状态并跳转登录
      const userStore = useUserStore()
      await userStore.logoutUser()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### 安全措施

**1. HTTPS 传输**

```typescript
// 仅在 HTTPS 环境下存储敏感信息
const setToken = (token: string, expireSeconds?: number): void => {
  // 生产环境检查HTTPS
  if (import.meta.env.PROD && location.protocol !== 'https:') {
    console.warn('Token should only be stored over HTTPS')
  }

  localCache.set(TOKEN_KEY, token, expireSeconds)
}
```

**2. Token 过期时间**

```typescript
// 后端返回的Token过期时间(秒)
interface AuthTokenVo {
  access_token: string
  refresh_token?: string
  expire_in: number           // 访问令牌有效期(秒)
  refresh_expire_in?: number  // 刷新令牌有效期(秒)
}

// 建议的过期时间设置
// - 访问令牌: 2小时(7200秒)
// - 刷新令牌: 7天(604800秒)
```

**3. 防止 XSS 攻击**

```typescript
// 避免在URL中传递Token
// ❌ 错误示例
const downloadUrl = `/api/download?token=${token}`

// ✅ 正确示例 - 使用请求头
const downloadFile = async () => {
  const response = await http.get('/api/download', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
```

**4. 单点登录控制**

```typescript
// 后端实现单点登录
// 同一账号在多个设备登录时,旧设备的Token自动失效

// 前端检测Token失效
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { code, msg } = error.response.data

      // 检查是否是被踢下线
      if (code === 401 && msg.includes('已在其他设备登录')) {
        showConfirm({
          title: '系统提示',
          message: '您的账号已在其他设备登录,当前会话已失效',
          type: 'warning',
          showCancelButton: false
        }).then(() => {
          const userStore = useUserStore()
          userStore.logoutUser()
          router.push('/login')
        })
      }
    }
    return Promise.reject(error)
  }
)
```

## 与其他模块协作

### 1. 与 Permission Store 协作

用户登录后触发权限路由加载:

```typescript
// 路由守卫中的协作流程
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 1. 检查登录状态
  if (!userStore.token) {
    return next('/login')
  }

  // 2. 获取用户信息和权限
  if (userStore.roles.length === 0) {
    const [err] = await userStore.fetchUserInfo()
    if (err) {
      await userStore.logoutUser()
      return next('/login')
    }
  }

  // 3. 基于角色生成动态路由
  const [err, accessRoutes] = await permissionStore.generateRoutes()
  if (err) {
    return next('/403')
  }

  // 4. 添加动态路由
  accessRoutes.forEach((route) => {
    router.addRoute(route)
  })

  next({ ...to, replace: true })
})
```

**协作要点:**

- User Store 提供 `roles` 和 `permissions` 数据
- Permission Store 基于这些数据过滤和生成路由
- 用户注销时,Permission Store 同步重置路由

### 2. 与 Dict Store 协作

登录后加载用户相关字典数据:

```typescript
// 在用户信息获取成功后加载字典
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }

  // 设置用户信息
  userInfo.value = data.user
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  // 加载用户相关字典
  const dictStore = useDictStore()
  await dictStore.loadDictsByType([
    'sys_user_sex',      // 性别字典
    'sys_normal_disable', // 状态字典
    'sys_user_type'      // 用户类型字典
  ])

  return [null, null]
}
```

**协作要点:**

- 登录后自动加载用户相关字典
- 根据权限过滤字典项
- 字典数据用于表单选项和数据展示

### 3. 与 Theme Store 协作

加载和保存用户的主题偏好:

```typescript
// 获取用户信息后加载主题设置
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }

  // 设置用户信息
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

// 用户更新主题时保存到后端
const updateUserTheme = async (themeConfig: ThemeConfig) => {
  const themeStore = useThemeStore()

  // 应用主题
  themeStore.applyTheme(themeConfig)

  // 保存到后端
  const [err] = await saveUserThemeConfig(themeConfig)
  if (err) {
    showMsgError('主题保存失败')
  }
}
```

**协作要点:**

- 登录后加载用户的主题配置
- 主题变更时保存到后端
- 用户注销时重置为默认主题

### 4. 与 Layout Store 协作

控制布局显示和页面标题:

```typescript
// 路由后置守卫中设置页面标题
router.afterEach((to) => {
  const layout = useLayout()
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    const title = `${to.meta.title} - ${userStore.userInfo?.nickName || '管理系统'}`
    layout.setTitle(title)
  }

  // 添加面包屑
  layout.setBreadcrumb(to.matched)
})
```

**协作要点:**

- 页面标题包含用户昵称
- 根据用户权限显示/隐藏菜单项
- 用户注销时重置布局状态

## 最佳实践

### 1. 在路由守卫中统一处理用户信息获取

**推荐做法** ✅

```typescript
// 在路由守卫中集中处理
export const setupRouteGuards = (router: Router): void => {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 统一获取用户信息
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
```

**不推荐做法** ❌

```typescript
// 在每个组件中获取
export default defineComponent({
  async created() {
    const userStore = useUserStore()

    // ❌ 不要在组件中重复获取
    if (!userStore.userInfo) {
      await userStore.fetchUserInfo()
    }
  }
})
```

### 2. 登录失败时清理残留状态

**推荐做法** ✅

```typescript
const handleLogin = async () => {
  // 登录前清理旧状态
  if (userStore.token) {
    await userStore.logoutUser()
  }

  const [err] = await userStore.loginUser(loginForm)

  if (err) {
    // 登录失败,清理可能的残留状态
    await userStore.logoutUser()
    showMsgError(err.message)
    return
  }

  // 登录成功
  await router.push('/')
}
```

### 3. 使用 storeToRefs 保持响应式

**推荐做法** ✅

```typescript
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// ✅ 使用 storeToRefs 解构
const { userInfo, roles, permissions } = storeToRefs(userStore)

// 在模板中使用,保持响应式
<span>{{ userInfo?.nickName }}</span>
```

**不推荐做法** ❌

```typescript
// ❌ 直接解构会丢失响应式
const { userInfo, roles, permissions } = useUserStore()

// 在模板中使用,无法响应变化
<span>{{ userInfo?.nickName }}</span>
```

### 4. 多标签页共享登录状态

**推荐做法** ✅

```typescript
// 使用 localStorage 存储 Token,自动跨标签页共享
export const useToken = () => {
  const getToken = (): string | null => {
    return localCache.get('token')
  }

  const setToken = (token: string, expireSeconds?: number): void => {
    localCache.set('token', token, expireSeconds)
  }
}

// 监听 localStorage 变化
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    const userStore = useUserStore()

    if (!e.newValue) {
      // Token被删除,当前标签页也注销
      userStore.logoutUser()
      router.push('/login')
    } else {
      // Token更新,刷新用户信息
      userStore.token = e.newValue
      userStore.fetchUserInfo()
    }
  }
})
```

### 5. 缓存用户信息,避免重复请求

**推荐做法** ✅

```typescript
const fetchUserInfo = async (): Result<void> => {
  // 如果已有用户信息且roles不为空,直接返回
  if (userInfo.value && roles.value.length > 0) {
    return [null, null]
  }

  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }

  userInfo.value = data.user
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  return [null, null]
}
```

### 6. 权限判断封装为 Composable

**推荐做法** ✅

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const userStore = useUserStore()

  /**
   * 判断是否登录
   */
  const isLoggedIn = computed(() => {
    return !!userStore.token
  })

  /**
   * 判断是否有指定权限
   */
  const hasPermission = (permission: string): boolean => {
    return userStore.permissions.includes(permission)
  }

  /**
   * 判断是否有任一权限
   */
  const hasAnyPermission = (...permissions: string[]): boolean => {
    return permissions.some(p => userStore.permissions.includes(p))
  }

  /**
   * 判断是否有全部权限
   */
  const hasAllPermissions = (...permissions: string[]): boolean => {
    return permissions.every(p => userStore.permissions.includes(p))
  }

  /**
   * 判断是否有指定角色
   */
  const hasRole = (role: string): boolean => {
    return userStore.roles.includes(role)
  }

  /**
   * 判断是否是管理员
   */
  const isAdmin = computed(() => {
    return userStore.roles.includes('admin')
  })

  /**
   * 判断是否可以访问路由
   */
  const canAccessRoute = (route: RouteLocationNormalized): boolean => {
    // 没有定义角色,允许访问
    if (!route.meta?.roles || route.meta.roles.length === 0) {
      return true
    }

    // 检查是否有任一角色
    return route.meta.roles.some((role: string) =>
      userStore.roles.includes(role)
    )
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

**使用示例:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const {
  isLoggedIn,
  hasPermission,
  isAdmin
} = useAuth()
</script>

<template>
  <view>
    <el-button
      v-if="hasPermission('system:user:add')"
      @click="handleAdd"
    >
      新增
    </el-button>

    <el-button
      v-if="isAdmin"
      type="danger"
      @click="handleDanger"
    >
      危险操作
    </el-button>
  </view>
</template>
```

### 7. 错误处理和用户反馈

**推荐做法** ✅

```typescript
const handleLogin = async () => {
  loading.value = true

  try {
    const [err] = await userStore.loginUser(loginForm)

    if (err) {
      // 根据错误类型给出不同提示
      if (err.message.includes('验证码')) {
        showMsgError('验证码错误,请重新输入')
        await getCaptcha() // 刷新验证码
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

### 8. Token 过期自动跳转

**推荐做法** ✅

```typescript
// HTTP 响应拦截器
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      const router = useRouter()

      // 清除用户状态
      await userStore.logoutUser()

      // 显示提示
      showMsgError('登录已过期,请重新登录')

      // 跳转登录页,携带当前页面地址
      const currentPath = router.currentRoute.value.fullPath
      const redirect = encodeURIComponent(currentPath)
      await router.push(`/login?redirect=${redirect}`)
    }

    return Promise.reject(error)
  }
)
```

### 9. 防止重复获取用户信息

**推荐做法** ✅

```typescript
// 路由守卫中使用标记防止重复请求
let isFetchingUserInfo = false

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 需要获取用户信息
  if (userStore.token && userStore.roles.length === 0) {
    // 已在获取中,直接放行
    if (isFetchingUserInfo) {
      return next()
    }

    // 标记为获取中
    isFetchingUserInfo = true

    const [err] = await userStore.fetchUserInfo()

    // 重置标记
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

### 10. 性能优化 - 按需加载用户信息

**推荐做法** ✅

```typescript
// 仅在需要时加载完整用户信息
const loadFullUserInfo = async () => {
  const userStore = useUserStore()

  // 已有完整信息,直接返回
  if (userStore.userInfo && userStore.roles.length > 0) {
    return
  }

  // 加载完整信息
  const [err] = await userStore.fetchUserInfo()
  if (err) {
    console.error('加载用户信息失败', err)
  }
}

// 在需要的页面调用
onMounted(() => {
  loadFullUserInfo()
})
```

## 常见问题

### 1. 刷新页面后用户信息丢失

**问题原因:**

- Token 存储在 Store 中,页面刷新后 Store 状态重置
- 未从 localStorage 恢复 Token

**解决方案:**

```typescript
// 在 Store 初始化时从 localStorage 加载 Token
export const useUserStore = defineStore('user', () => {
  const tokenUtils = useToken()

  // ✅ 从 localStorage 自动加载 Token
  const token = ref(tokenUtils.getToken())

  // 其他状态初始化为空,在路由守卫中自动获取
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<Array<string>>([])
  const permissions = ref<Array<string>>([])

  return {
    token,
    userInfo,
    roles,
    permissions,
    // ... 方法
  }
})

// 在路由守卫中检查并获取用户信息
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 有 Token 但没有用户信息,自动获取
  if (userStore.token && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }

  next()
})
```

### 2. 多标签页登录状态不同步

**问题原因:**

- Token 存储在 localStorage 中,但 Store 状态独立
- 一个标签页注销后,其他标签页的 Store 状态未更新

**解决方案:**

```typescript
// 监听 localStorage 变化事件
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    const userStore = useUserStore()
    const router = useRouter()

    if (!e.newValue) {
      // Token 被删除(用户在其他标签页注销)
      userStore.token = ''
      userStore.userInfo = null
      userStore.roles = []
      userStore.permissions = []

      // 跳转到登录页
      router.push('/login')
    } else if (e.newValue !== userStore.token) {
      // Token 更新(用户在其他标签页登录)
      userStore.token = e.newValue
      userStore.fetchUserInfo()
    }
  }
})
```

### 3. Token 过期后未自动跳转登录

**问题原因:**

- HTTP 响应拦截器未正确处理 401 状态码
- 路由跳转时未携带重定向参数

**解决方案:**

```typescript
// HTTP 响应拦截器
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 检查 401 状态码
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      const router = useRouter()

      // 清除用户状态
      await userStore.logoutUser()

      // 获取当前页面路径
      const currentRoute = router.currentRoute.value
      const redirect = encodeURIComponent(currentRoute.fullPath)

      // 跳转登录页,携带重定向参数
      await router.push({
        path: '/login',
        query: { redirect }
      })

      // 显示提示
      showMsgError('登录已过期,请重新登录')
    }

    return Promise.reject(error)
  }
)
```

### 4. 权限判断不生效

**问题原因:**

- 用户信息未加载完成就进行权限判断
- 权限数据为空数组

**解决方案:**

```typescript
// 在路由守卫中确保用户信息已加载
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const { canAccessRoute } = useAuth()

  // 需要权限的路由
  if (to.meta.requiresAuth) {
    // 未登录
    if (!userStore.token) {
      return next('/login')
    }

    // 已登录但未加载权限
    if (userStore.roles.length === 0) {
      const [err] = await userStore.fetchUserInfo()
      if (err) {
        await userStore.logoutUser()
        return next('/login')
      }
    }

    // 检查权限
    if (!canAccessRoute(to)) {
      return next('/403')
    }
  }

  next()
})

// 在组件中使用计算属性
const hasEditPermission = computed(() => {
  const userStore = useUserStore()

  // 确保权限数据已加载
  if (userStore.permissions.length === 0) {
    return false
  }

  return userStore.permissions.includes('system:user:edit')
})
```

### 5. 注销后动态路由仍然可访问

**问题原因:**

- 注销时未清除动态路由
- Vue Router 的 `addRoute` 无法移除已添加的路由

**解决方案:**

```typescript
// 在 router 中添加重置路由的方法
export const resetRouter = (): void => {
  const router = useRouter()
  const permissionStore = usePermissionStore()

  // 获取所有动态路由
  const dynamicRoutes = permissionStore.routes

  // 移除动态路由
  dynamicRoutes.forEach((route) => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })

  // 清空权限路由
  permissionStore.routes = []
}

// 在用户注销时调用
const logoutUser = async (): Result<void> => {
  const [err] = await userLogout()

  // 清除状态
  token.value = ''
  userInfo.value = null
  roles.value = []
  permissions.value = []

  // 重置路由
  resetRouter()

  // 移除 Token
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
/**
 * 用户信息视图类型
 */
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

/**
 * 用户信息响应类型
 */
export interface UserInfoVo {
  user: SysUserVo
  roles: string[]
  permissions: string[]
}

/**
 * 登录请求类型
 */
export type LoginRequest =
  | PasswordLoginBody
  | EmailLoginBody
  | SmsLoginBody
  | SocialLoginBody

/**
 * 密码登录对象
 */
export interface PasswordLoginBody extends LoginBody {
  authType: 'password'
  userName: string
  password: string
  code?: string
  uuid?: string
  tenantId?: string
  rememberMe?: boolean
}

/**
 * 认证令牌响应对象
 */
export interface AuthTokenVo {
  access_token: string
  refresh_token?: string
  expire_in: number
  refresh_expire_in?: number
  scope?: string
}

/**
 * Result 类型
 */
type Result<T = any> = Promise<[Error | null, T | null]>
```

## 总结

用户状态管理模块是整个应用安全体系的核心,通过 Pinia 实现了完整的用户认证和权限管理功能。本文档详细介绍了:

**核心功能:**
- 用户登录、注销和身份验证
- Token 管理和持久化
- 用户信息存储和更新
- 角色和权限管理

**技术实现:**
- 基于 Pinia 的响应式状态管理
- 使用 useToken composable 管理 Token
- 支持多种登录方式(密码、邮箱、短信、社交)
- localStorage 实现会话持久化

**模块协作:**
- 与 Permission Store 协作生成动态路由
- 与 Dict Store 协作加载字典数据
- 与 Theme Store 协作管理主题配置
- 与 Layout Store 协作控制页面布局

**最佳实践:**
- 在路由守卫中统一获取用户信息
- 使用 storeToRefs 保持响应式
- 实现多标签页状态同步
- 封装权限判断 composable
- 合理的错误处理和用户反馈

通过遵循本文档的规范和最佳实践,可以构建安全、高效、用户体验良好的用户认证系统。
