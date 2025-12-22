# 路由配置与守卫

## 介绍

路由守卫是 Vue Router 提供的核心机制，用于在路由导航过程中执行自定义逻辑。RuoYi-Plus-UI 构建了一套完整的路由守卫系统，实现了用户认证、权限验证、动态路由生成、进度条控制、页面标题管理等核心功能。

**核心特性：**

- **用户认证** - 基于 Token 的登录状态验证，自动识别已登录和未登录用户
- **权限控制** - 支持权限字符串和角色双重验证，精细化控制路由访问
- **动态路由** - 根据用户权限从后端获取路由配置，动态生成可访问路由表
- **白名单机制** - 支持通配符匹配的白名单路由，无需登录即可访问
- **进度条控制** - 集成 NProgress 进度条，提升页面切换的用户体验
- **页面标题** - 自动设置浏览器标签页标题，支持动态标题模式
- **防重复请求** - 内置防抖机制，避免重复获取用户信息
- **错误处理** - 完善的错误捕获和用户提示机制

## 核心架构

### 守卫系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        路由守卫系统                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  前置守卫   │───▶│  权限检查   │───▶│  后置守卫   │         │
│  │ beforeEach │    │   useAuth   │    │  afterEach  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│        │                  │                  │                  │
│        ▼                  ▼                  ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ 进度条开始  │    │ 动态路由    │    │ 进度条结束  │         │
│  │  NProgress  │    │ 权限过滤    │    │ 设置标题    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  依赖模块                                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ useToken   │ │ useAuth    │ │ useLayout  │ │ permission │   │
│  │ Token管理  │ │ 权限钩子   │ │ 布局状态   │ │ Store      │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 文件结构

```
src/router/
├── router.ts              # 主路由配置文件
├── guard.ts               # 路由守卫配置
└── modules/
    ├── constant.ts        # 静态路由配置
    ├── workflow.ts        # 工作流动态路由
    └── tool.ts            # 工具动态路由
```

### 守卫初始化

路由守卫通过 `setupRouteGuards` 函数进行初始化，该函数在主路由文件中调用：

```typescript
// src/router/router.ts
import { setupRouteGuards } from './guard'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(SystemConfig.app.contextPath),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 设置路由守卫
setupRouteGuards(router)

export default router
```

## 前置守卫 (beforeEach)

### 完整执行流程

前置守卫是路由系统的核心，负责在每次路由切换前执行认证和权限验证逻辑。

```
┌──────────────────────────────────────────────────────────────┐
│                     前置守卫执行流程                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐                                                 │
│  │ 开始    │                                                 │
│  └────┬────┘                                                 │
│       ▼                                                      │
│  ┌─────────────┐                                             │
│  │ 开启进度条  │ NProgress.start()                           │
│  └──────┬──────┘                                             │
│         ▼                                                    │
│  ┌──────────────┐    是    ┌─────────────┐                   │
│  │ 已登录?      ├─────────▶│ 访问登录页? │                   │
│  └──────┬───────┘          └──────┬──────┘                   │
│         │ 否                      │ 是                       │
│         ▼                         ▼                          │
│  ┌──────────────┐          ┌─────────────┐                   │
│  │ 白名单页面?  │          │ 重定向首页  │ next({ path: '/' })│
│  └──────┬───────┘          └─────────────┘                   │
│    是   │ 否                                                 │
│    ▼    ▼                                                    │
│  ┌────┐ ┌──────────────┐                                     │
│  │放行│ │重定向登录页  │ next('/login?redirect=xxx')         │
│  └────┘ └──────────────┘                                     │
│                                                              │
│  ════════════════ 已登录用户流程 ════════════════            │
│                                                              │
│  ┌──────────────┐    是    ┌────┐                            │
│  │ 白名单页面?  ├─────────▶│放行│                            │
│  └──────┬───────┘          └────┘                            │
│         │ 否                                                 │
│         ▼                                                    │
│  ┌──────────────┐    是    ┌──────────────┐                  │
│  │ 已有用户信息?├─────────▶│ 检查路由权限 │                  │
│  └──────┬───────┘          └──────┬───────┘                  │
│         │ 否                      │                          │
│         ▼                         ▼                          │
│  ┌──────────────┐          ┌──────────────┐                  │
│  │ 获取用户信息 │          │ 有权限?放行  │                  │
│  │ 生成动态路由 │          │ 无权限?403   │                  │
│  └──────────────┘          └──────────────┘                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 源码实现详解

```typescript
// src/router/guard.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isHttp, isPathMatch } from '@/utils/validators'
import { type Router } from 'vue-router'
import { showMsgError, showNotifyError } from '@/utils/modal'
import { isReLogin } from '@/composables/useHttp'

// 进度条配置 - 隐藏右上角的加载圆圈
NProgress.configure({ showSpinner: false })

// 白名单列表 - 不需要登录就可以访问的页面
const WHITE_LIST = [
  '/login',           // 登录页
  '/register',        // 注册页
  '/forgotPassword',  // 忘记密码页
  '/socialCallback',  // 社交登录回调
  '/register*',       // 注册相关页面（通配符）
  '/register/*',      // 注册子页面
  '/401',             // 未授权页面
  '/home'             // 前台首页
]

// 路由守卫内部状态 - 防止重复获取用户信息
let isFetchingUserInfo = false

// 是否在白名单中的辅助函数
const isInWhiteList = (path: string) => {
  return WHITE_LIST.some((pattern) => isPathMatch(pattern, path))
}

/**
 * 初始化路由守卫
 * @param router 路由实例
 */
export const setupRouteGuards = (router: Router): void => {
  // 路由前置守卫
  router.beforeEach(async (to, from, next) => {
    // 1. 开始进度条
    NProgress.start()

    // 2. 一次性获取所有需要的 store 实例
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 3. 获取权限钩子
    const { canAccessRoute, isLoggedIn } = useAuth()

    // ==================== 未登录处理逻辑 ====================
    if (!isLoggedIn.value) {
      // 重置状态
      isFetchingUserInfo = false

      // 白名单直接通过
      if (isInWhiteList(to.path)) {
        return next()
      }

      // 非白名单重定向到登录页，并携带重定向参数
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // ==================== 已登录处理逻辑 ====================

    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 白名单页面直接通过
    if (isInWhiteList(to.path)) {
      return next()
    }

    // ==================== 权限验证逻辑 ====================

    // 已加载用户信息，检查路由访问权限
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      } else {
        return next('/403') // 无权限访问，重定向到403页面
      }
    }

    // ==================== 首次加载用户信息 ====================

    // 防止重复获取用户信息
    if (isFetchingUserInfo) {
      return next()
    }

    isFetchingUserInfo = true
    // 标记为正在获取用户信息，此时的401请求不弹框
    isReLogin.show = true

    // 获取用户信息
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      isReLogin.show = false
      showMsgError('登录状态已过期，请重新登录')

      const [logoutErr] = await userStore.logoutUser()
      if (!logoutErr) {
        const redirect = encodeURIComponent(to.fullPath || '/')
        return next(`/login?redirect=${redirect}`)
      } else {
        showNotifyError({
          title: '系统提示',
          message: '后端服务未启动或异常，请检查!',
          duration: 10000
        })
        return next()
      }
    }

    // 获取用户信息成功，重置标记
    isReLogin.show = false

    // 生成动态路由
    const [generateRoutesErr, accessRoutes] = await permissionStore.generateRoutes()
    if (generateRoutesErr) {
      showMsgError(generateRoutesErr)
      return next('/403')
    }

    // 添加动态路由到路由表
    accessRoutes.forEach((route) => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })

    // 检查目标路由是否有权限访问
    if (!canAccessRoute(to)) {
      return next('/403')
    }

    // 使用 hack 方法确保 addRoutes 已完成
    next({
      // @ts-expect-error hack方法
      path: to.path,
      replace: true,
      params: to.params,
      query: to.query,
      hash: to.hash,
      name: to.name as string
    })
  })
}
```

### 关键技术点解析

#### 1. 防重复请求机制

通过 `isFetchingUserInfo` 标志位防止并发请求导致的重复获取用户信息：

```typescript
// 防止重复获取用户信息
let isFetchingUserInfo = false

// 在守卫中使用
if (isFetchingUserInfo) {
  return next() // 已在获取中，直接放行等待
}

isFetchingUserInfo = true

try {
  // 获取用户信息...
} finally {
  isFetchingUserInfo = false
}
```

**使用场景：**
- 用户快速连续点击多个菜单
- 浏览器前进/后退操作
- 页面刷新时的并发路由跳转

#### 2. 登录状态同步标记

通过 `isReLogin.show` 标记控制 HTTP 拦截器中的 401 处理行为：

```typescript
import { isReLogin } from '@/composables/useHttp'

// 获取用户信息前标记
isReLogin.show = true

const [fetchUserErr] = await userStore.fetchUserInfo()

// 获取完成后重置
isReLogin.show = false
```

**作用说明：**
- `isReLogin.show = true`：此时的 401 响应不弹出重新登录对话框
- `isReLogin.show = false`：正常情况下 401 响应会弹出对话框

#### 3. 路由重定向参数传递

登录后自动跳转到原访问页面：

```typescript
// 编码原始路径，包含查询参数和 hash
const redirect = encodeURIComponent(to.fullPath || '/')
return next(`/login?redirect=${redirect}`)

// 登录成功后在登录组件中处理
const route = useRoute()
const redirect = route.query.redirect as string
router.push(redirect ? decodeURIComponent(redirect) : '/')
```

## 后置守卫 (afterEach)

### 功能实现

后置守卫在路由导航完成后执行，负责进度条关闭和页面标题设置：

```typescript
// src/router/guard.ts
router.afterEach((to) => {
  // 结束进度条
  NProgress.done()

  // 设置页面标题
  const layout = useLayout()
  if (to.meta.title) {
    layout.setTitle(to.meta.title as string)
  }
})
```

### 页面标题管理

页面标题通过 `useLayout` 的 `setTitle` 方法进行管理：

```typescript
// src/composables/useLayout.ts
/**
 * 设置当前页面标题
 * @param value 页面标题，为空则不更新
 */
const setTitle = (value: string): void => {
  if (!value) return
  state.title = value
  updateDocumentTitle()
}

/**
 * 更新浏览器标签页标题
 * @description 根据动态标题设置决定显示格式
 * - 启用动态标题: "当前页面标题 - 应用名称"
 * - 禁用动态标题: 使用系统默认标题
 */
const updateDocumentTitle = (): void => {
  document.title = dynamicTitle.value
    ? `${state.title} - ${appTitle}`
    : SystemConfig.ui.title
}
```

**标题显示模式：**

| 模式 | 效果 | 示例 |
|------|------|------|
| 动态标题开启 | `页面标题 - 应用名` | `用户管理 - RuoYi-Plus` |
| 动态标题关闭 | 固定应用名 | `RuoYi-Plus` |

## 白名单机制

### 白名单配置

白名单定义了不需要登录即可访问的页面路径：

```typescript
// 白名单列表
const WHITE_LIST = [
  '/login',           // 登录页
  '/register',        // 注册页
  '/forgotPassword',  // 忘记密码页
  '/socialCallback',  // 社交登录回调
  '/register*',       // 注册相关页面（通配符 - 匹配单段路径）
  '/register/*',      // 注册子页面（通配符 - 匹配子路径）
  '/401',             // 未授权页面
  '/home'             // 前台首页
]
```

### 路径匹配算法

白名单使用 `isPathMatch` 函数进行路径匹配，支持通配符模式：

```typescript
// src/utils/validators.ts
/**
 * 检查路径是否匹配模式
 * @param pattern 匹配模式，支持 * 和 ** 通配符
 * @param path 待检查的路径
 * @returns 是否匹配
 *
 * @example
 * // 精确匹配
 * isPathMatch('/login', '/login')     // true
 * isPathMatch('/login', '/login/sub') // false
 *
 * // * 匹配单段路径
 * isPathMatch('/api/*', '/api/users')           // true
 * isPathMatch('/api/*', '/api/users/details')   // false
 *
 * // ** 匹配多段路径
 * isPathMatch('/api/**', '/api/users/details')  // true
 */
export const isPathMatch = (pattern: string, path: string): boolean => {
  if (!pattern || !path) return false

  const regexPattern = pattern
    .replace(/\//g, '\\/')           // 转义斜杠
    .replace(/\*\*/g, '__DOUBLE_STAR__')  // 临时替换 **
    .replace(/\*/g, '[^\\/]*')       // * 匹配非斜杠字符
    .replace(/__DOUBLE_STAR__/g, '.*')    // ** 匹配任意字符

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

// 白名单检查函数
const isInWhiteList = (path: string) => {
  return WHITE_LIST.some((pattern) => isPathMatch(pattern, path))
}
```

### 通配符匹配规则

| 通配符 | 说明 | 示例模式 | 匹配路径 |
|--------|------|----------|----------|
| 无 | 精确匹配 | `/login` | `/login` |
| `*` | 匹配单段路径 | `/api/*` | `/api/users`，不匹配 `/api/users/1` |
| `**` | 匹配多段路径 | `/api/**` | `/api/users`，`/api/users/1/profile` |

### 扩展白名单

如需添加自定义白名单路径：

```typescript
// 方式1：直接修改 WHITE_LIST
const WHITE_LIST = [
  // ... 现有配置
  '/public/**',        // 所有公开页面
  '/share/*',          // 分享页面
  '/preview/:id',      // 预览页面（动态路径）
]

// 方式2：从配置文件读取
import { SystemConfig } from '@/systemConfig'

const WHITE_LIST = [
  ...SystemConfig.router.whiteList,
  '/login',
  '/register',
]
```

## 权限验证系统

### useAuth 权限钩子

`useAuth` 是核心权限验证钩子，提供完整的权限检查能力：

```typescript
// src/composables/useAuth.ts
export const useAuth = () => {
  const userStore = useUserStore()

  // 角色标识常量
  const SUPER_ADMIN = 'superadmin'     // 超级管理员
  const TENANT_ADMIN = 'admin'          // 租户管理员
  const ALL_PERMISSION = '*:*:*'        // 全权限标识

  /**
   * 当前用户登录状态
   */
  const isLoggedIn = computed(() => {
    return userStore.token && userStore.token.length > 0
  })

  /**
   * 检查是否为超级管理员
   */
  const isSuperAdmin = (roleToCheck?: string): boolean => {
    const targetRole = roleToCheck || SUPER_ADMIN
    return userStore.roles.includes(targetRole)
  }

  /**
   * 检查是否为租户管理员
   */
  const isTenantAdmin = (roleToCheck?: string): boolean => {
    const targetRole = roleToCheck || TENANT_ADMIN
    return userStore.roles.includes(targetRole)
  }

  /**
   * 检查是否拥有指定权限
   * @param permission 权限标识或权限数组
   * @returns 是否拥有权限（数组为OR逻辑）
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (!permission || permission.length === 0) {
      console.warn('权限参数不能为空')
      return false
    }

    const userPermissions = userStore.permissions

    // 超级管理员拥有所有权限
    if (isSuperAdmin()) return true

    // 检查全权限标识
    if (userPermissions.includes(ALL_PERMISSION)) return true

    // 处理数组情况（OR逻辑）
    if (Array.isArray(permission)) {
      return permission.some(perm => userPermissions.includes(perm))
    }

    return userPermissions.includes(permission)
  }

  /**
   * 检查是否拥有所有指定权限
   * @param permissions 权限数组
   * @returns 是否拥有所有权限（AND逻辑）
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (isSuperAdmin()) return true

    const userPermissions = userStore.permissions
    if (userPermissions.includes(ALL_PERMISSION)) return true

    return permissions.every(perm => userPermissions.includes(perm))
  }

  /**
   * 检查是否拥有指定角色
   * @param role 角色标识或角色数组
   * @returns 是否拥有角色（数组为OR逻辑）
   */
  const hasRole = (role: string | string[]): boolean => {
    if (!role || role.length === 0) {
      console.warn('角色参数不能为空')
      return false
    }

    const userRoles = userStore.roles

    if (isSuperAdmin()) return true

    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r))
    }

    return userRoles.includes(role)
  }

  /**
   * 检查是否有权限访问某个路由
   * @param route 路由对象
   * @returns 是否有权限访问
   */
  const canAccessRoute = (route: any): boolean => {
    if (!route) return false

    // 无权限要求的路由允许访问
    if (!route.meta || (!route.meta.roles && !route.meta.permissions)) {
      return true
    }

    // 超级管理员可以访问任何路由
    if (isSuperAdmin()) return true

    // 检查角色权限
    if (route.meta.roles && route.meta.roles.length > 0) {
      if (!hasRole(route.meta.roles)) return false
    }

    // 检查操作权限
    if (route.meta.permissions && route.meta.permissions.length > 0) {
      if (!hasPermission(route.meta.permissions)) return false
    }

    return true
  }

  return {
    isLoggedIn,
    isSuperAdmin,
    isTenantAdmin,
    hasPermission,
    hasAllPermissions,
    hasRole,
    canAccessRoute
  }
}
```

### 权限验证流程

```
┌─────────────────────────────────────────────────────────────┐
│                      路由权限验证流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                        │
│  │ canAccessRoute  │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐   是   ┌────────┐                     │
│  │ 无权限要求?     ├───────▶│ 允许   │                     │
│  │ (!meta.roles && │        │ 访问   │                     │
│  │  !meta.perms)   │        └────────┘                     │
│  └────────┬────────┘                                        │
│           │ 否                                              │
│           ▼                                                 │
│  ┌─────────────────┐   是   ┌────────┐                     │
│  │ 超级管理员?     ├───────▶│ 允许   │                     │
│  │ isSuperAdmin()  │        │ 访问   │                     │
│  └────────┬────────┘        └────────┘                     │
│           │ 否                                              │
│           ▼                                                 │
│  ┌─────────────────┐   否   ┌────────┐                     │
│  │ 角色验证通过?   ├───────▶│ 拒绝   │                     │
│  │ hasRole()       │        │ 403    │                     │
│  └────────┬────────┘        └────────┘                     │
│           │ 是                                              │
│           ▼                                                 │
│  ┌─────────────────┐   否   ┌────────┐                     │
│  │ 权限验证通过?   ├───────▶│ 拒绝   │                     │
│  │ hasPermission() │        │ 403    │                     │
│  └────────┬────────┘        └────────┘                     │
│           │ 是                                              │
│           ▼                                                 │
│      ┌────────┐                                             │
│      │ 允许   │                                             │
│      │ 访问   │                                             │
│      └────────┘                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 路由权限配置

在路由 `meta` 中配置权限要求：

```typescript
// 需要特定角色
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  meta: {
    title: '用户管理',
    roles: ['admin', 'system:user']  // OR逻辑，满足其一即可
  }
}

// 需要特定权限
{
  path: '/system/user/add',
  component: () => import('@/views/system/user/add.vue'),
  meta: {
    title: '新增用户',
    permissions: ['system:user:add']  // OR逻辑
  }
}

// 同时需要角色和权限
{
  path: '/system/config',
  component: () => import('@/views/system/config/index.vue'),
  meta: {
    title: '系统配置',
    roles: ['admin'],
    permissions: ['system:config:list']  // 需要同时满足
  }
}
```

### 组件内权限检查

在组件中使用权限钩子：

```vue
<template>
  <div class="user-management">
    <!-- 按钮级别权限控制 -->
    <el-button
      v-if="canAdd"
      type="primary"
      @click="handleAdd"
    >
      新增用户
    </el-button>

    <el-button
      v-if="canExport"
      type="success"
      @click="handleExport"
    >
      导出数据
    </el-button>

    <!-- 使用 v-permi 指令 -->
    <el-button v-permi="['system:user:delete']" type="danger">
      删除
    </el-button>
  </div>
</template>

<script setup lang="ts">
const { hasPermission, hasRole, isSuperAdmin } = useAuth()

// 权限检查
const canAdd = computed(() => hasPermission('system:user:add'))
const canExport = computed(() => hasPermission('system:user:export'))

// 角色检查
const isAdmin = computed(() => hasRole('admin'))

// 超级管理员检查
const showAdvancedOptions = computed(() => isSuperAdmin())
</script>
```

## 动态路由系统

### 路由生成流程

动态路由从后端获取配置并转换为前端路由对象：

```typescript
// src/stores/modules/permission.ts
/**
 * 生成路由
 * @description 从后端获取路由数据并处理成可用的路由配置
 */
const generateRoutes = async (): Result<RouteRecordRaw[]> => {
  // 1. 从后端API获取路由数据
  const [err, data] = await getRouters()
  if (err) {
    return [err, null]
  }

  // 2. 开发环境添加测试菜单
  if (SystemConfig.app.env === 'development') {
    const toolMenuIndex = data.findIndex((item: any) => item.name === 'Tool3')
    if (toolMenuIndex !== -1) {
      data[toolMenuIndex].children.push(...testMenuData)
    }
  }

  // 3. 深拷贝路由数据用于不同处理场景
  const sdata = JSON.parse(JSON.stringify(data))
  const rdata = JSON.parse(JSON.stringify(data))
  const defaultData = JSON.parse(JSON.stringify(data))

  // 4. 处理不同场景的路由格式
  const sidebarRoutes = filterAsyncRouter(sdata)           // 侧边栏路由
  const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)  // 重写路由
  const defaultRoutes = filterAsyncRouter(defaultData)     // 默认路由

  // 5. 处理动态权限路由
  const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
  asyncRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 6. 设置各类路由到store
  setRoutes(rewriteRoutes)
  setSidebarRouters(constantRoutes.concat(sidebarRoutes))
  setDefaultRoutes(sidebarRoutes)
  setTopbarRoutes(defaultRoutes)

  // 7. 路由name重复检查
  duplicateRouteChecker(asyncRoutes, sidebarRoutes)

  return [null, rewriteRoutes]
}
```

### 路由组件转换

将后端返回的组件字符串转换为实际组件：

```typescript
// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

/**
 * 遍历后台传来的路由字符串，转换为组件对象
 */
const filterAsyncRouter = (
  asyncRouterMap: RouteRecordRaw[],
  lastRouter?: RouteRecordRaw,
  type = false
): RouteRecordRaw[] => {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children, undefined)
    }

    // 特殊组件处理
    if (route.component?.toString() === 'Layout') {
      route.component = Layout
    } else if (route.component?.toString() === 'ParentView') {
      route.component = ParentView
    } else if (route.component?.toString() === 'InnerLink') {
      route.component = InnerLink
    } else {
      // 动态加载视图组件
      route.component = loadView(route.component, route.name as string)
    }

    // 递归处理子路由
    if (route.children != null && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route.children
      delete route.redirect
    }

    return true
  })
}

/**
 * 加载视图组件
 */
const loadView = (view: any, name: string) => {
  let res
  for (const path in modules) {
    const viewsIndex = path.indexOf('/views/')
    let dir = path.substring(viewsIndex + 7)
    dir = dir.substring(0, dir.lastIndexOf('.vue'))
    if (dir === view) {
      res = createCustomNameComponent(modules[path], { name })
      return res
    }
  }
  return res
}
```

### 路由名称冲突检测

自动检测并提示路由名称冲突：

```typescript
/**
 * 检查路由name是否重复
 * @param localRoutes 本地路由（静态路由）
 * @param routes 动态路由
 */
const duplicateRouteChecker = (localRoutes: Route[], routes: Route[]): void => {
  // 递归展平嵌套路由
  const flatRoutes = (routes: Route[]): Route[] => {
    const res: Route[] = []
    routes.forEach((route) => {
      if (route.children) {
        res.push(...flatRoutes(route.children))
      } else {
        res.push(route)
      }
    })
    return res
  }

  // 合并并展平所有路由
  const allRoutes = flatRoutes([...localRoutes, ...routes])

  // 检查重复的路由名称
  const nameList: string[] = []
  allRoutes.forEach((route) => {
    if (!route.name) return

    const name = route.name.toString()
    if (nameList.includes(name)) {
      const message = `路由名称: [${name}] 重复, 会造成 404`
      console.error(message)
      ElNotification({
        title: '路由名称重复',
        message,
        type: 'error'
      })
      return
    }
    nameList.push(name)
  })
}
```

## 静态路由配置

### 公共路由定义

静态路由是不需要权限即可访问的基础路由：

```typescript
// src/router/modules/constant.ts
export const constantRoutes: RouteRecordRaw[] = [
  // 重定向路由
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/common/redirect.vue'),
        meta: { title: '页面重定向', noCache: true }
      }
    ]
  },

  // 登录页面
  {
    path: '/login',
    component: () => import('@/views/system/auth/login.vue'),
    hidden: true,
    meta: { title: '登录' }
  },

  // 注册页面
  {
    path: '/register',
    component: () => import('@/views/system/auth/register.vue'),
    hidden: true,
    meta: { title: '注册' }
  },

  // 忘记密码页面
  {
    path: '/forgotPassword',
    component: () => import('@/views/system/auth/forgotPassword.vue'),
    hidden: true,
    meta: { title: '忘记密码' }
  },

  // 社交登录回调
  {
    path: '/socialCallback',
    hidden: true,
    component: () => import('@/views/system/auth/socialCallback.vue'),
    meta: { title: '社交登录回调' }
  },

  // 404页面 - 捕获所有未匹配的路由
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/common/404.vue'),
    hidden: true,
    meta: { title: '404 Not Found' }
  },

  // 401未授权页面
  {
    path: '/401',
    component: () => import('@/views/common/401.vue'),
    hidden: true,
    meta: { title: '401 Unauthorized' }
  },

  // 根路径重定向
  {
    path: '/',
    redirect: () => {
      return SystemConfig.app.enableFrontend ? '/home' : '/index'
    }
  },

  // 后台首页
  {
    path: '/index',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '',
        component: () => import('@/views/common/index.vue'),
        name: 'Index',
        meta: {
          title: '首页',
          icon: 'home3',
          affix: true,  // 固定标签
          i18nKey: 'menu.index'
        }
      }
    ]
  },

  // 用户个人中心
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/core/user/profile/profile.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
]
```

### 路由 meta 配置说明

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 页面标题，用于标签页和面包屑显示 |
| `icon` | `string` | 菜单图标名称 |
| `hidden` | `boolean` | 是否在侧边栏隐藏 |
| `noCache` | `boolean` | 是否禁用 keep-alive 缓存 |
| `affix` | `boolean` | 是否固定在标签栏 |
| `breadcrumb` | `boolean` | 是否在面包屑中显示 |
| `activeMenu` | `string` | 高亮的侧边栏菜单路径 |
| `roles` | `string[]` | 允许访问的角色列表 |
| `permissions` | `string[]` | 允许访问的权限列表 |
| `i18nKey` | `string` | 国际化键名 |

## 进度条配置

### NProgress 配置

```typescript
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 进度条配置
NProgress.configure({
  showSpinner: false,  // 隐藏右上角加载圆圈
  minimum: 0.1,        // 最小百分比
  easing: 'ease',      // 动画方式
  speed: 500,          // 递增速度
  trickle: true,       // 自动递增
  trickleSpeed: 200    // 自动递增间隔
})
```

### 自定义进度条样式

```scss
// src/assets/styles/nprogress.scss
#nprogress {
  pointer-events: none;

  .bar {
    background: var(--el-color-primary);
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
  }

  .peg {
    display: block;
    position: absolute;
    right: 0;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px var(--el-color-primary),
                0 0 5px var(--el-color-primary);
    opacity: 1;
    transform: rotate(3deg) translate(0px, -4px);
  }
}
```

### 手动控制进度条

在其他场景使用进度条：

```typescript
import NProgress from 'nprogress'

// 开始进度条
const startLoading = () => {
  NProgress.start()
}

// 设置进度
const setProgress = (n: number) => {
  NProgress.set(n)  // 0.0 - 1.0
}

// 递增进度
const incrementProgress = () => {
  NProgress.inc()   // 随机递增
  NProgress.inc(0.2) // 指定递增量
}

// 结束进度条
const finishLoading = () => {
  NProgress.done()
}

// 文件上传示例
const uploadFile = async (file: File) => {
  NProgress.start()

  try {
    const response = await uploadApi.upload(file, {
      onUploadProgress: (event) => {
        const percent = event.loaded / event.total
        NProgress.set(percent * 0.9)  // 预留10%给后续处理
      }
    })

    NProgress.done()
    return response
  } catch (error) {
    NProgress.done()
    throw error
  }
}
```

## 路由重置

### resetRouter 函数

用户退出登录或权限变更时重置路由：

```typescript
// src/router/router.ts
/**
 * 重置路由
 * 用于用户退出登录或者权限变更时
 */
export const resetRouter = () => {
  // 创建新的路由实例，只包含静态路由
  const newRouter = createRouter({
    history: createWebHistory(SystemConfig.app.contextPath),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      return { top: 0 }
    }
  })

  // 重置路由器的 matcher
  // @ts-expect-error: 重置路由器的matcher
  router.matcher = newRouter.matcher
}
```

### 使用场景

```typescript
// 用户退出登录
const logout = async () => {
  await userStore.logoutUser()

  // 重置路由
  resetRouter()

  // 重定向到登录页
  router.push('/login')
}

// 角色切换
const switchRole = async (roleId: string) => {
  await userApi.switchRole(roleId)

  // 重置路由
  resetRouter()

  // 重新获取用户信息和路由
  await userStore.fetchUserInfo()
  await permissionStore.generateRoutes()

  // 刷新当前页面
  router.push({ path: '/' })
}

// 租户切换
const switchTenant = async (tenantId: string) => {
  await tenantApi.switch(tenantId)

  // 重置路由和状态
  resetRouter()
  userStore.resetState()
  permissionStore.resetState()

  // 重新初始化
  router.push('/login')
}
```

## 错误处理

### 用户信息获取失败

```typescript
const [fetchUserErr] = await userStore.fetchUserInfo()
if (fetchUserErr) {
  // 1. 重置登录状态标记
  isReLogin.show = false

  // 2. 显示错误提示
  showMsgError('登录状态已过期，请重新登录')

  // 3. 尝试退出登录
  const [logoutErr] = await userStore.logoutUser()

  if (!logoutErr) {
    // 退出成功，跳转登录页
    const redirect = encodeURIComponent(to.fullPath || '/')
    return next(`/login?redirect=${redirect}`)
  } else {
    // 退出失败，可能是后端服务异常
    showNotifyError({
      title: '系统提示',
      message: '后端服务未启动或异常，请检查!',
      duration: 10000
    })
    return next()
  }
}
```

### 动态路由生成失败

```typescript
const [generateRoutesErr, accessRoutes] = await permissionStore.generateRoutes()
if (generateRoutesErr) {
  // 显示错误信息
  showMsgError(generateRoutesErr)

  // 重定向到403页面
  return next('/403')
}
```

### 路由访问被拒绝

```typescript
// 检查目标路由是否有权限访问
if (!canAccessRoute(to)) {
  // 记录日志
  console.warn(`用户无权访问路由: ${to.path}`)

  // 重定向到403页面
  return next('/403')
}
```

### 导航失败处理

```typescript
import {
  isNavigationFailure,
  NavigationFailureType
} from 'vue-router'

// 处理导航失败
router.push('/target').catch(failure => {
  if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
    // 导航被中止（如守卫返回 false）
    console.log('导航被中止:', failure.to.path)
  }

  if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
    // 导航被取消（如在完成前发生了新导航）
    console.log('导航被取消:', failure.to.path)
  }

  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    // 重复导航到当前位置
    console.log('重复导航:', failure.to.path)
  }
})
```

## 滚动行为控制

### 配置滚动行为

```typescript
const router = createRouter({
  history: createWebHistory(SystemConfig.app.contextPath),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（浏览器后退/前进），恢复到该位置
    if (savedPosition) {
      return savedPosition
    }

    // 如果有锚点，滚动到锚点位置
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    // 默认滚动到顶部
    return { top: 0 }
  }
})
```

### 高级滚动配置

```typescript
scrollBehavior(to, from, savedPosition) {
  // 延迟滚动（等待页面过渡动画完成）
  return new Promise((resolve) => {
    setTimeout(() => {
      if (savedPosition) {
        resolve(savedPosition)
      } else if (to.hash) {
        resolve({
          el: to.hash,
          behavior: 'smooth',
          top: 80 // 考虑固定头部的偏移
        })
      } else {
        resolve({ top: 0, behavior: 'smooth' })
      }
    }, 300) // 与过渡动画时长一致
  })
}
```

## 最佳实践

### 1. 路由守卫性能优化

```typescript
// ❌ 避免在守卫中进行大量同步操作
router.beforeEach((to, from, next) => {
  // 大量同步计算会阻塞路由切换
  const result = heavyComputation()
  next()
})

// ✅ 使用异步操作和缓存
const permissionCache = new Map<string, boolean>()

router.beforeEach(async (to, from, next) => {
  const cacheKey = `${to.path}-${userStore.roles.join(',')}`

  // 优先使用缓存
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey) ? next() : next('/403')
  }

  // 异步检查权限
  const hasAccess = await checkPermissionAsync(to)
  permissionCache.set(cacheKey, hasAccess)

  hasAccess ? next() : next('/403')
})

// 用户角色变更时清除缓存
watch(() => userStore.roles, () => {
  permissionCache.clear()
})
```

### 2. 路由懒加载优化

```typescript
// ❌ 直接导入所有组件
import UserList from '@/views/system/user/index.vue'
import RoleList from '@/views/system/role/index.vue'

// ✅ 使用动态导入实现懒加载
const routes = [
  {
    path: '/system/user',
    component: () => import('@/views/system/user/index.vue')
  },
  {
    path: '/system/role',
    // 使用 webpackChunkName 分组打包
    component: () => import(/* webpackChunkName: "system" */ '@/views/system/role/index.vue')
  }
]

// ✅ 使用预加载提升用户体验
const prefetchRoute = (path: string) => {
  const route = router.getRoutes().find(r => r.path === path)
  if (route?.components?.default) {
    // 触发组件预加载
    const component = route.components.default
    if (typeof component === 'function') {
      component()
    }
  }
}

// 鼠标悬停时预加载
onMouseEnter(() => {
  prefetchRoute('/system/user')
})
```

### 3. 路由元信息类型安全

```typescript
// src/types/router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 菜单图标 */
    icon?: string
    /** 是否隐藏菜单 */
    hidden?: boolean
    /** 是否禁用缓存 */
    noCache?: boolean
    /** 是否固定标签 */
    affix?: boolean
    /** 面包屑显示 */
    breadcrumb?: boolean
    /** 高亮菜单路径 */
    activeMenu?: string
    /** 允许的角色 */
    roles?: string[]
    /** 允许的权限 */
    permissions?: string[]
    /** 国际化键 */
    i18nKey?: string
  }
}

// 使用时享受类型提示
const route = useRoute()
console.log(route.meta.title)  // string | undefined
console.log(route.meta.roles)  // string[] | undefined
```

### 4. 统一的权限指令

```typescript
// src/directives/permission.ts
import type { Directive, DirectiveBinding } from 'vue'

/**
 * 权限指令
 * @example
 * v-permi="['system:user:add']"
 * v-permi="{ value: ['system:user:add'], mode: 'disabled' }"
 */
export const permi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = useAuth()

    const value = binding.value
    const permissions = Array.isArray(value) ? value : value?.value
    const mode = value?.mode || 'hidden' // hidden | disabled

    if (!permissions || permissions.length === 0) {
      console.warn('v-permi: 权限参数不能为空')
      return
    }

    if (!hasPermission(permissions)) {
      if (mode === 'disabled') {
        el.setAttribute('disabled', 'disabled')
        el.classList.add('is-disabled')
      } else {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

// 角色指令
export const role: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasRole } = useAuth()

    const roles = binding.value

    if (!roles || roles.length === 0) {
      console.warn('v-role: 角色参数不能为空')
      return
    }

    if (!hasRole(roles)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

### 5. 路由过渡动画

```vue
<!-- src/layouts/components/AppMain/AppMain.vue -->
<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="transitionName"
        mode="out-in"
        @before-enter="beforeEnter"
        @after-leave="afterLeave"
      >
        <keep-alive :include="cachedViews">
          <component
            :is="Component"
            :key="route.fullPath"
          />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">
const layout = useLayout()

const cachedViews = computed(() => layout.cachedViews.value)
const transitionName = computed(() =>
  layout.animationEnable.value ? 'fade-transform' : ''
)

const beforeEnter = () => {
  // 页面进入前的处理
}

const afterLeave = () => {
  // 页面离开后的清理
}
</script>

<style lang="scss" scoped>
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

## 常见问题

### 1. 路由重复导航警告

**问题描述：**
```
Avoided redundant navigation to current location: "/xxx"
```

**问题原因：**
- 多次点击同一个菜单链接
- 编程式导航到当前路由

**解决方案：**
```typescript
// 方案1：捕获并忽略重复导航错误
router.push('/target').catch((err) => {
  if (err.name !== 'NavigationDuplicated') {
    throw err
  }
})

// 方案2：导航前检查
const navigateTo = (path: string) => {
  if (router.currentRoute.value.path !== path) {
    router.push(path)
  }
}

// 方案3：使用 replace 替代 push
router.replace('/target')
```

### 2. 动态路由 404 问题

**问题描述：**
刷新页面后，动态路由页面显示 404。

**问题原因：**
- 动态路由尚未添加时就进行了匹配
- 路由名称冲突

**解决方案：**
```typescript
// 确保 404 路由放在最后
const constantRoutes: RouteRecordRaw[] = [
  // ... 其他路由

  // 404 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/common/404.vue'),
    hidden: true
  }
]

// 动态添加路由后使用 replace 重新匹配
next({
  path: to.path,
  replace: true,
  params: to.params,
  query: to.query
})
```

### 3. 页面缓存不生效

**问题描述：**
设置了 `keep-alive`，但页面仍然会重新加载。

**问题原因：**
- 组件没有设置 `name`
- `name` 与路由配置不一致
- 缓存视图列表未正确维护

**解决方案：**
```typescript
// 1. 确保组件设置了 name
defineOptions({
  name: 'UserList'  // 必须与路由 name 一致
})

// 2. 使用 createCustomNameComponent 动态设置名称
const loadView = (view: any, name: string) => {
  for (const path in modules) {
    if (matchPath(path, view)) {
      // 创建具有自定义名称的组件
      return createCustomNameComponent(modules[path], { name })
    }
  }
}

// 3. 确保缓存视图正确添加
const { addCachedView, delCachedView } = useLayout()

// 添加到缓存
addCachedView(route)

// 从缓存移除
delCachedView(route)
```

### 4. 权限更新后菜单未刷新

**问题描述：**
用户权限变更后，侧边栏菜单没有更新。

**解决方案：**
```typescript
// 1. 重置路由和状态
const refreshPermissions = async () => {
  // 重置路由
  resetRouter()

  // 清空权限状态
  const permissionStore = usePermissionStore()
  permissionStore.$reset()

  // 重新获取用户信息
  await userStore.fetchUserInfo()

  // 重新生成路由
  const [err, routes] = await permissionStore.generateRoutes()
  if (!err) {
    routes.forEach(route => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })
  }

  // 刷新当前页面
  router.replace({
    path: '/redirect' + router.currentRoute.value.fullPath
  })
}
```

### 5. 路由守卫死循环

**问题描述：**
页面无限刷新或跳转。

**问题原因：**
- 守卫中的 `next()` 调用逻辑有误
- 重定向目标也触发了守卫

**解决方案：**
```typescript
// ❌ 错误写法 - 可能导致死循环
router.beforeEach((to, from, next) => {
  if (!isLoggedIn.value) {
    next('/login')  // 如果 /login 也触发守卫且条件不满足...
  }
  next()
})

// ✅ 正确写法 - 使用 return 确保只调用一次 next
router.beforeEach((to, from, next) => {
  if (!isLoggedIn.value) {
    // 白名单检查，避免循环
    if (isInWhiteList(to.path)) {
      return next()
    }
    return next('/login')
  }
  return next()
})
```

### 6. 多标签页缓存问题

**问题描述：**
同一路由不同参数的页面缓存冲突。

**解决方案：**
```vue
<!-- 使用完整路径作为 key -->
<router-view v-slot="{ Component, route }">
  <keep-alive :include="cachedViews">
    <component
      :is="Component"
      :key="route.fullPath"  <!-- 使用 fullPath 而非 path -->
    />
  </keep-alive>
</router-view>

<script setup lang="ts">
// 缓存时使用唯一标识
const addView = (view: RouteLocationNormalized) => {
  // 对于动态路由，生成唯一的缓存键
  const cacheKey = view.matched.some(m => m.path.includes(':'))
    ? `${view.name}-${JSON.stringify(view.params)}`
    : view.name as string

  if (!cachedViews.value.includes(cacheKey)) {
    cachedViews.value.push(cacheKey)
  }
}
</script>
```

## 类型定义

### 路由守卫相关类型

```typescript
// src/types/router.ts
import type {
  RouteLocationNormalized,
  RouteRecordRaw,
  NavigationGuardNext
} from 'vue-router'

/**
 * 路由守卫上下文
 */
export interface GuardContext {
  /** 目标路由 */
  to: RouteLocationNormalized
  /** 来源路由 */
  from: RouteLocationNormalized
  /** 导航控制函数 */
  next: NavigationGuardNext
}

/**
 * 权限路由记录
 */
export interface PermissionRoute extends RouteRecordRaw {
  /** 权限标识数组 */
  permissions?: string[]
  /** 角色标识数组 */
  roles?: string[]
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否总是显示 */
  alwaysShow?: boolean
  /** 子路由 */
  children?: PermissionRoute[]
}

/**
 * 路由元信息
 */
export interface RouteMeta {
  /** 页面标题 */
  title?: string
  /** 菜单图标 */
  icon?: string
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否禁用缓存 */
  noCache?: boolean
  /** 是否固定标签 */
  affix?: boolean
  /** 面包屑显示 */
  breadcrumb?: boolean
  /** 高亮菜单 */
  activeMenu?: string
  /** 角色列表 */
  roles?: string[]
  /** 权限列表 */
  permissions?: string[]
  /** 国际化键 */
  i18nKey?: string
}

/**
 * 白名单配置
 */
export interface WhiteListConfig {
  /** 路径模式 */
  pattern: string
  /** 描述 */
  description?: string
}

/**
 * 路由守卫配置
 */
export interface GuardConfig {
  /** 白名单 */
  whiteList: string[]
  /** 登录页路径 */
  loginPath: string
  /** 首页路径 */
  homePath: string
  /** 403页面路径 */
  forbiddenPath: string
  /** 是否启用进度条 */
  enableProgress: boolean
  /** 是否启用动态标题 */
  enableDynamicTitle: boolean
}
```

### 权限相关类型

```typescript
// src/types/permission.ts

/**
 * 权限检查选项
 */
export interface PermissionCheckOptions {
  /** 超级管理员角色标识 */
  superAdminRole?: string
  /** 租户管理员角色标识 */
  tenantAdminRole?: string
  /** 是否使用 AND 逻辑（默认 OR） */
  requireAll?: boolean
}

/**
 * 权限钩子返回值
 */
export interface UseAuthReturn {
  /** 是否已登录 */
  isLoggedIn: ComputedRef<boolean>
  /** 是否为超级管理员 */
  isSuperAdmin: (roleToCheck?: string) => boolean
  /** 是否为租户管理员 */
  isTenantAdmin: (roleToCheck?: string) => boolean
  /** 是否为任意管理员 */
  isAnyAdmin: (roleKey?: string) => boolean
  /** 检查权限（OR逻辑） */
  hasPermission: (permission: string | string[], superAdminRole?: string) => boolean
  /** 检查权限（AND逻辑） */
  hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean
  /** 检查角色（OR逻辑） */
  hasRole: (role: string | string[], superAdminRole?: string) => boolean
  /** 检查角色（AND逻辑） */
  hasAllRoles: (roles: string[], superAdminRole?: string) => boolean
  /** 检查路由访问权限 */
  canAccessRoute: (route: any, superAdminRole?: string) => boolean
  /** 过滤授权路由 */
  filterAuthorizedRoutes: (routes: any[], superAdminRole?: string) => any[]
}
```

## 总结

RuoYi-Plus-UI 的路由守卫系统提供了完整的路由控制能力：

1. **前置守卫**：处理用户认证、权限验证、动态路由生成
2. **后置守卫**：管理进度条状态和页面标题
3. **白名单机制**：支持通配符的免登录路径配置
4. **权限系统**：基于角色和权限的双重验证
5. **动态路由**：从后端获取配置动态生成路由
6. **错误处理**：完善的异常捕获和用户提示
7. **状态管理**：与 Pinia Store 深度集成

通过合理配置和使用路由守卫，可以构建安全、高效、用户体验良好的企业级应用。
