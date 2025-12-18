# useAuth 认证与授权

## 介绍

`useAuth` 是一个用于用户认证与授权管理的组合式函数,提供完整的权限检查、角色校验和路由访问控制功能。该 Composable 封装了系统中所有认证相关的业务逻辑,通过集成用户状态管理简化了权限操作,支持多租户场景下的细粒度权限控制。

**核心特性:**

- **登录状态管理** - 实时监测用户登录状态,自动关联 Token 有效性
- **多级管理员支持** - 区分超级管理员(superadmin)和租户管理员(admin),实现分级权限管理
- **灵活权限检查** - 支持单个权限、多权限 OR 逻辑、多权限 AND 逻辑三种检查模式
- **角色校验系统** - 提供单角色、多角色 OR、多角色 AND 的完整角色检查方案
- **租户权限隔离** - 在多租户架构下实现租户级别的权限隔离和检查
- **路由访问控制** - 基于路由 meta 信息自动过滤用户可访问的路由
- **通配符权限** - 支持 `*:*:*` 通配符权限,简化超级用户权限配置
- **权限豁免机制** - 超级管理员自动豁免所有权限和角色检查
- **响应式设计** - 基于 Pinia Store,用户权限变化自动响应到所有检查点

## 基本用法

### 检查登录状态

```vue
<template>
  <view class="container">
    <view v-if="isLoggedIn" class="user-info">
      <text>欢迎回来,{{ userName }}</text>
      <wd-button @click="handleLogout">退出登录</wd-button>
    </view>
    <view v-else class="login-prompt">
      <text>您还未登录</text>
      <wd-button type="primary" @click="navigateToLogin">立即登录</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { isLoggedIn } = useAuth()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.userName || '用户')

const handleLogout = () => {
  userStore.logout()
  uni.reLaunch({ url: '/pages/login/index' })
}

const navigateToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>
```

`isLoggedIn` 是一个计算属性,基于 `userStore.token` 的存在性和长度判断登录状态,自动响应 Token 变化。

### 检查管理员身份

```vue
<template>
  <view class="admin-panel">
    <!-- 超级管理员面板 -->
    <view v-if="isSuperAdmin()" class="super-admin-tools">
      <text class="title">超级管理员控制面板</text>
      <wd-button type="danger" @click="handleSystemConfig">系统配置</wd-button>
      <wd-button type="danger" @click="handleTenantManage">租户管理</wd-button>
    </view>

    <!-- 租户管理员面板 -->
    <view v-else-if="isTenantAdmin()" class="tenant-admin-tools">
      <text class="title">租户管理面板</text>
      <wd-button type="primary" @click="handleUserManage">用户管理</wd-button>
      <wd-button type="primary" @click="handleRoleManage">角色管理</wd-button>
    </view>

    <!-- 任意管理员 -->
    <view v-else-if="isAnyAdmin()" class="admin-notice">
      <text>您是管理员,拥有管理权限</text>
    </view>

    <view v-else class="normal-user">
      <text>您没有管理员权限</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin, isAnyAdmin } = useAuth()

// 可传入自定义角色标识
// isSuperAdmin('system_admin')
// isTenantAdmin('tenant_manager')
// isAnyAdmin('system_admin', 'tenant_manager')
</script>
```

**管理员检查说明:**
- `isSuperAdmin()` - 检查默认角色 `superadmin`,可传入自定义角色
- `isTenantAdmin()` - 检查默认角色 `admin`,租户管理员仅在其所属租户内拥有管理权限
- `isAnyAdmin()` - 同时检查超级管理员和租户管理员,满足其一即返回 `true`

### 单个权限检查

```vue
<template>
  <view class="user-management">
    <view class="toolbar">
      <wd-button v-if="canAddUser" type="primary" @click="handleAddUser">
        新增用户
      </wd-button>
      <wd-button v-if="canEditUser" type="success" @click="handleEditUser">
        编辑用户
      </wd-button>
      <wd-button v-if="canDeleteUser" type="danger" @click="handleDeleteUser">
        删除用户
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 检查各个操作权限
const canAddUser = computed(() => hasPermission('system:user:add'))
const canEditUser = computed(() => hasPermission('system:user:edit'))
const canDeleteUser = computed(() => hasPermission('system:user:remove'))
</script>
```

**权限检查说明:**
- 权限标识格式为 `模块:功能:操作`,如 `system:user:add`
- 超级管理员自动通过所有权限检查
- 拥有 `*:*:*` 通配符权限的用户自动通过检查
- 建议使用计算属性包装权限检查,实现响应式更新

### 多个权限检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasAllPermissions } = useAuth()

// OR 逻辑: 拥有任一权限即可
const canManageData = computed(() =>
  hasPermission(['system:data:add', 'system:data:edit'])
)

// AND 逻辑: 必须拥有所有权限
const canDataMigration = computed(() =>
  hasAllPermissions([
    'system:data:import',
    'system:data:export',
    'system:data:remove'
  ])
)
</script>
```

### 角色检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole, hasAllRoles } = useAuth()

// 单个角色
const isEditor = computed(() => hasRole('editor'))

// 多个角色(OR 逻辑)
const canManageContent = computed(() =>
  hasRole(['editor', 'reviewer'])
)

// 多个角色(AND 逻辑)
const canFullWorkflow = computed(() =>
  hasAllRoles(['editor', 'reviewer', 'publisher'])
)
</script>
```

### 租户权限检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasTenantPermission, isSuperAdmin, isTenantAdmin } = useAuth()
const userStore = useUserStore()

// 检查当前租户的数据管理权限
const canManageCurrentTenant = computed(() =>
  hasTenantPermission('tenant:data:manage')
)

// 检查指定租户权限(传入租户 ID)
const canManageSpecificTenant = computed(() =>
  hasTenantPermission('tenant:data:manage', 'tenant-123')
)
</script>
```

**租户权限说明:**
- `hasTenantPermission()` 第一个参数为权限标识,第二个参数为租户 ID(可选)
- 不传租户 ID 时默认使用当前用户所属租户
- 超级管理员拥有所有租户的所有权限
- 租户管理员仅在自己的租户内拥有所有权限
- 跨租户操作会被自动拒绝

### 路由访问控制

```vue
<template>
  <view class="navigation">
    <view
      v-for="route in authorizedRoutes"
      :key="route.path"
      class="nav-item"
      @click="navigateTo(route.path)"
    >
      <text>{{ route.title }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { filterAuthorizedRoutes, canAccessRoute } = useAuth()

const allRoutes = [
  {
    path: '/pages/system/user',
    title: '用户管理',
    meta: { permissions: ['system:user:list'] }
  },
  {
    path: '/pages/system/role',
    title: '角色管理',
    meta: { permissions: ['system:role:list'] }
  },
  {
    path: '/pages/system/menu',
    title: '菜单管理',
    meta: { roles: ['admin', 'superadmin'] }
  },
  {
    path: '/pages/tenant/settings',
    title: '租户设置',
    meta: {
      roles: ['admin'],
      permissions: ['tenant:setting:edit']
    }
  }
]

// 过滤出有权限访问的路由
const authorizedRoutes = computed(() =>
  filterAuthorizedRoutes(allRoutes)
)

const navigateTo = (path: string) => {
  uni.navigateTo({ url: path })
}
</script>
```

**路由控制说明:**
- `canAccessRoute()` 检查单个路由是否可访问
- `filterAuthorizedRoutes()` 批量过滤路由数组
- 路由的 `meta.permissions` 定义所需权限
- 路由的 `meta.roles` 定义所需角色
- 同时定义权限和角色时,两者都必须满足
- 没有 `meta` 信息的路由默认可访问
- 超级管理员可访问所有路由

## 高级用法

### 自定义管理员角色

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin, isAnyAdmin } = useAuth()

// 使用自定义超级管理员角色标识
const isCustomSuperAdmin = computed(() =>
  isSuperAdmin('system_super_admin')
)

// 使用自定义租户管理员角色标识
const isCustomTenantAdmin = computed(() =>
  isTenantAdmin('tenant_manager')
)

// 同时检查两种自定义管理员
const isAnyCustomAdmin = computed(() =>
  isAnyAdmin('system_super_admin', 'tenant_manager')
)
</script>
```

### 权限豁免配置

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole } = useAuth()

// 使用自定义超级管理员角色进行权限豁免
const canOperateWithExempt = computed(() =>
  hasPermission('system:data:delete', 'custom_super_admin')
)

// 使用自定义超级管理员角色进行角色豁免
const hasRoleWithExempt = computed(() =>
  hasRole('editor', 'custom_super_admin')
)
</script>
```

`hasPermission()` 和 `hasRole()` 的第二个参数为豁免角色标识,拥有该角色的用户自动通过检查。

### 组合权限和角色检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, hasAllPermissions, hasAllRoles } = useAuth()

// 同时检查权限和角色(OR + AND 组合)
const canAdvancedOperation = computed(() => {
  const hasRequiredPermission = hasPermission([
    'system:data:advanced',
    'system:data:manage'
  ])
  const hasRequiredRole = hasRole(['manager', 'admin'])

  return hasRequiredPermission && hasRequiredRole
})

// 同时检查多个权限和多个角色(AND 逻辑)
const canSensitiveOperation = computed(() => {
  const hasAllRequiredPermissions = hasAllPermissions([
    'system:data:delete',
    'system:data:modify',
    'system:log:delete'
  ])
  const hasAllRequiredRoles = hasAllRoles([
    'security_officer',
    'data_admin'
  ])

  return hasAllRequiredPermissions && hasAllRequiredRoles
})
</script>
```

### 在路由守卫中使用

```typescript
// router/guards.ts
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

export const setupRouterGuard = () => {
  const { canAccessRoute, isLoggedIn } = useAuth()

  uni.addInterceptor('navigateTo', {
    invoke(args: any) {
      const url = args.url
      const route = findRouteByUrl(url)

      // 检查是否需要登录
      if (route?.meta?.requireAuth && !isLoggedIn.value) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/login/index' })
        return false
      }

      // 检查路由访问权限
      if (route && !canAccessRoute(route)) {
        uni.showToast({ title: '无权限访问', icon: 'none' })
        return false
      }

      return true
    }
  })
}

const findRouteByUrl = (url: string) => {
  const routes = [
    {
      path: '/pages/system/user',
      meta: { requireAuth: true, permissions: ['system:user:list'] }
    },
    // ... 更多路由
  ]
  return routes.find(route => url.includes(route.path))
}
```

### 在自定义指令中使用

```typescript
// directives/permission.ts
import { useAuth } from '@/composables/useAuth'

/**
 * 权限指令
 * 用法: v-permission="'system:user:add'"
 * 用法: v-permission="['system:user:add', 'system:user:edit']"
 */
export const vPermission = {
  mounted(el: any, binding: any) {
    const { hasPermission } = useAuth()
    if (!hasPermission(binding.value)) {
      el.style.display = 'none'
    }
  }
}

/**
 * 角色指令
 * 用法: v-role="'admin'"
 * 用法: v-role="['admin', 'editor']"
 */
export const vRole = {
  mounted(el: any, binding: any) {
    const { hasRole } = useAuth()
    if (!hasRole(binding.value)) {
      el.style.display = 'none'
    }
  }
}
```

在组件中使用:

```vue
<template>
  <view class="directive-demo">
    <wd-button v-permission="'system:user:add'" type="primary">新增用户</wd-button>
    <wd-button v-role="'admin'" type="success">管理员功能</wd-button>
    <wd-button v-permission="['system:user:add', 'system:user:edit']">用户管理</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { vPermission, vRole } from '@/directives/permission'
</script>
```

### 动态权限更新

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasPermission, isLoggedIn } = useAuth()
const userStore = useUserStore()

// 响应式权限检查
const canManageUser = computed(() =>
  hasPermission('system:user:manage')
)

const handleSwitchTenant = async () => {
  await userStore.switchTenant('new-tenant-id')
  // 权限会自动更新,因为 hasPermission 是响应式的
  uni.showToast({ title: '租户切换成功', icon: 'success' })
}

const handleRefreshPermission = async () => {
  await userStore.refreshUserInfo()
  uni.showToast({ title: '权限刷新成功', icon: 'success' })
}
</script>
```

### 权限缓存优化

```vue
<template>
  <view class="permission-cache-demo">
    <view v-for="item in dataList" :key="item.id" class="data-item">
      <text>{{ item.name }}</text>
      <wd-button v-if="permissionCache.canEdit" size="small" @click="handleEdit(item)">
        编辑
      </wd-button>
      <wd-button v-if="permissionCache.canDelete" size="small" type="danger" @click="handleDelete(item)">
        删除
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const dataList = ref([
  { id: 1, name: '数据1' },
  { id: 2, name: '数据2' },
  // ... 更多数据
])

// 权限缓存 - 避免在循环中重复检查
const permissionCache = computed(() => ({
  canEdit: hasPermission('system:data:edit'),
  canDelete: hasPermission('system:data:remove'),
  canExport: hasPermission('system:data:export'),
}))
</script>
```

## API

### 返回值

`useAuth()` 返回一个包含以下属性和方法的对象:

#### 状态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| isLoggedIn | `ComputedRef<boolean>` | 用户登录状态,基于 Token 判断 |

#### 管理员检查方法

| 方法 | 类型 | 说明 |
|------|------|------|
| isSuperAdmin | `(roleToCheck?: string) => boolean` | 检查是否为超级管理员,默认检查 `superadmin` |
| isTenantAdmin | `(roleToCheck?: string) => boolean` | 检查是否为租户管理员,默认检查 `admin` |
| isAnyAdmin | `(superAdminRole?: string, tenantAdminRole?: string) => boolean` | 检查是否为任意级别的管理员 |

#### 权限检查方法

| 方法 | 类型 | 说明 |
|------|------|------|
| hasPermission | `(permission: string \| string[], superAdminRole?: string) => boolean` | 检查是否拥有指定权限(OR 逻辑) |
| hasTenantPermission | `(permission: string \| string[], tenantId?: string, superAdminRole?: string, tenantAdminRole?: string) => boolean` | 检查租户范围内的权限 |
| hasAllPermissions | `(permissions: string[], superAdminRole?: string) => boolean` | 检查是否拥有所有权限(AND 逻辑) |

#### 角色检查方法

| 方法 | 类型 | 说明 |
|------|------|------|
| hasRole | `(role: string \| string[], superAdminRole?: string) => boolean` | 检查是否拥有指定角色(OR 逻辑) |
| hasAllRoles | `(roles: string[], superAdminRole?: string) => boolean` | 检查是否拥有所有角色(AND 逻辑) |

#### 路由访问控制方法

| 方法 | 类型 | 说明 |
|------|------|------|
| canAccessRoute | `(route: any, superAdminRole?: string) => boolean` | 检查是否有权限访问指定路由 |
| filterAuthorizedRoutes | `(routes: any[], superAdminRole?: string) => any[]` | 过滤出有权限访问的路由数组 |

### 方法详解

#### hasPermission

检查是否拥有指定权限,支持 OR 逻辑。

```typescript
function hasPermission(
  permission: string | string[],
  superAdminRole?: string
): boolean
```

**参数:**
- `permission` - 权限标识字符串或数组
- `superAdminRole?` - 可选,超级管理员角色标识,用于权限豁免

**说明:**
- 单个权限时,检查是否拥有该权限
- 多个权限时,只要拥有其中一个即返回 `true` (OR 逻辑)
- 超级管理员自动通过所有权限检查
- 拥有 `*:*:*` 通配符权限的用户自动通过

#### hasAllPermissions

检查是否拥有所有指定权限,AND 逻辑。

```typescript
function hasAllPermissions(
  permissions: string[],
  superAdminRole?: string
): boolean
```

**说明:**
- 必须拥有数组中的所有权限才返回 `true`
- 使用 `Array.every()` 实现 AND 逻辑
- 超级管理员和通配符权限用户自动通过

#### hasTenantPermission

检查是否在指定租户范围内拥有权限。

```typescript
function hasTenantPermission(
  permission: string | string[],
  tenantId?: string,
  superAdminRole?: string,
  tenantAdminRole?: string
): boolean
```

**参数:**
- `permission` - 权限标识字符串或数组
- `tenantId?` - 可选,租户 ID,默认使用当前用户的租户 ID
- `superAdminRole?` - 可选,超级管理员角色标识
- `tenantAdminRole?` - 可选,租户管理员角色标识

**说明:**
- 超级管理员拥有所有租户的所有权限
- 租户管理员仅在自己的租户内拥有所有权限
- 跨租户操作会被自动拒绝

#### hasRole / hasAllRoles

```typescript
function hasRole(role: string | string[], superAdminRole?: string): boolean
function hasAllRoles(roles: string[], superAdminRole?: string): boolean
```

- `hasRole`: 单个角色检查或多角色 OR 逻辑
- `hasAllRoles`: 多角色 AND 逻辑,必须拥有所有角色

#### canAccessRoute / filterAuthorizedRoutes

```typescript
function canAccessRoute(route: any, superAdminRole?: string): boolean
function filterAuthorizedRoutes(routes: any[], superAdminRole?: string): any[]
```

- `canAccessRoute`: 检查单个路由是否可访问
- `filterAuthorizedRoutes`: 批量过滤路由数组,支持递归过滤子路由

### 常量定义

```typescript
// 超级管理员角色标识
const SUPER_ADMIN = 'superadmin'

// 租户管理员角色标识
const TENANT_ADMIN = 'admin'

// 通配符权限标识
const ALL_PERMISSION = '*:*:*'
```

## 权限检查流程

### hasPermission 检查流程

```
1. 检查权限参数是否为空
   ├─ 为空 → 输出警告 → 返回 false
   └─ 不为空 → 继续

2. 检查是否为超级管理员
   ├─ 是 → 返回 true (权限豁免)
   └─ 否 → 继续

3. 检查是否拥有通配符权限 (*:*:*)
   ├─ 是 → 返回 true
   └─ 否 → 继续

4. 检查权限参数类型
   ├─ 数组 → 使用 some() 检查是否拥有任一权限
   └─ 字符串 → 直接检查是否拥有该权限

5. 返回检查结果
```

### hasTenantPermission 检查流程

```
1. 获取目标租户 ID
   ├─ 传入租户 ID → 使用传入值
   └─ 未传入 → 使用当前用户租户 ID

2. 检查是否为超级管理员
   ├─ 是 → 返回 true (拥有所有租户权限)
   └─ 否 → 继续

3. 检查租户 ID 是否匹配
   ├─ 不匹配 → 返回 false (跨租户拒绝)
   └─ 匹配 → 继续

4. 检查是否为租户管理员
   ├─ 是 → 返回 true (租户内所有权限)
   └─ 否 → 继续

5. 调用 hasPermission 进行常规权限检查
```

### canAccessRoute 检查流程

```
1. 检查路由对象是否存在
   ├─ 不存在 → 返回 false
   └─ 存在 → 继续

2. 检查路由是否有权限要求
   ├─ 无 meta 或无权限要求 → 返回 true (允许访问)
   └─ 有权限要求 → 继续

3. 检查是否为超级管理员
   ├─ 是 → 返回 true (可访问所有路由)
   └─ 否 → 继续

4. 检查角色要求(meta.roles)
   ├─ 有角色要求但不满足 → 返回 false
   └─ 无角色要求或满足 → 继续

5. 检查权限要求(meta.permissions)
   ├─ 有权限要求但不满足 → 返回 false
   └─ 无权限要求或满足 → 返回 true
```

## 最佳实践

### 1. 使用计算属性缓存权限检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// ✅ 推荐: 使用计算属性
const canAdd = computed(() => hasPermission('system:user:add'))
const canEdit = computed(() => hasPermission('system:user:edit'))
</script>

<template>
  <!-- ✅ 推荐 -->
  <wd-button v-if="canAdd">新增</wd-button>

  <!-- ❌ 不推荐: 直接在模板中调用 -->
  <wd-button v-if="hasPermission('system:user:add')">新增</wd-button>
</template>
```

计算属性会自动缓存结果,避免每次渲染都重新计算。

### 2. 集中管理权限和角色常量

```typescript
// constants/permission.ts
export const PERMISSIONS = {
  USER: {
    LIST: 'system:user:list',
    ADD: 'system:user:add',
    EDIT: 'system:user:edit',
    REMOVE: 'system:user:remove',
  },
  ROLE: {
    LIST: 'system:role:list',
    ADD: 'system:role:add',
    EDIT: 'system:role:edit',
    REMOVE: 'system:role:remove',
  },
} as const

export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  TENANT_ADMIN: 'admin',
  EDITOR: 'editor',
  REVIEWER: 'reviewer',
} as const
```

在组件中使用:

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { PERMISSIONS, ROLES } from '@/constants/permission'

const { hasPermission, hasRole } = useAuth()

// ✅ 推荐: 使用常量
const canAddUser = computed(() => hasPermission(PERMISSIONS.USER.ADD))
const isEditor = computed(() => hasRole(ROLES.EDITOR))
</script>
```

### 3. 封装业务权限逻辑

```typescript
// composables/useUserPermission.ts
import { useAuth } from '@/composables/useAuth'
import { PERMISSIONS } from '@/constants/permission'

export const useUserPermission = () => {
  const { hasPermission, hasAllPermissions } = useAuth()

  const canListUser = computed(() => hasPermission(PERMISSIONS.USER.LIST))
  const canAddUser = computed(() => hasPermission(PERMISSIONS.USER.ADD))
  const canEditUser = computed(() => hasPermission(PERMISSIONS.USER.EDIT))
  const canRemoveUser = computed(() => hasPermission(PERMISSIONS.USER.REMOVE))

  // 组合权限
  const canManageUser = computed(() =>
    hasPermission([PERMISSIONS.USER.ADD, PERMISSIONS.USER.EDIT])
  )
  const canFullManageUser = computed(() =>
    hasAllPermissions([
      PERMISSIONS.USER.ADD,
      PERMISSIONS.USER.EDIT,
      PERMISSIONS.USER.REMOVE
    ])
  )

  return {
    canListUser,
    canAddUser,
    canEditUser,
    canRemoveUser,
    canManageUser,
    canFullManageUser,
  }
}
```

### 4. 批量权限缓存

对于需要检查大量权限的场景:

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { PERMISSIONS } from '@/constants/permission'

const { hasPermission } = useAuth()

// ✅ 推荐: 批量缓存所有权限检查
const permissions = computed(() => ({
  user: {
    list: hasPermission(PERMISSIONS.USER.LIST),
    add: hasPermission(PERMISSIONS.USER.ADD),
    edit: hasPermission(PERMISSIONS.USER.EDIT),
    remove: hasPermission(PERMISSIONS.USER.REMOVE),
  },
  role: {
    list: hasPermission(PERMISSIONS.ROLE.LIST),
    add: hasPermission(PERMISSIONS.ROLE.ADD),
  },
}))
</script>

<template>
  <wd-button v-if="permissions.user.add">新增用户</wd-button>
  <wd-button v-if="permissions.user.edit">编辑用户</wd-button>
  <wd-button v-if="permissions.role.add">新增角色</wd-button>
</template>
```

### 5. OR 和 AND 逻辑使用场景

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasAllPermissions, hasRole } = useAuth()

// ✅ OR 逻辑: 适用于"拥有任一权限即可"的场景
// 场景: 多个操作共用一个入口
const canAccessDataManagement = computed(() =>
  hasPermission(['system:data:add', 'system:data:edit'])
)

// ✅ AND 逻辑: 适用于"必须同时拥有多个权限"的场景
// 场景: 高级功能需要多个权限组合
const canDataMigration = computed(() =>
  hasAllPermissions([
    'system:data:import',
    'system:data:export',
    'system:data:remove'
  ])
)

// ✅ 复杂组合: (权限1 OR 权限2) AND (角色1 OR 角色2)
const canComplexOperation = computed(() => {
  const hasAnyPermission = hasPermission(['system:data:manage', 'system:data:admin'])
  const hasAnyRole = hasRole(['manager', 'admin'])
  return hasAnyPermission && hasAnyRole
})
</script>
```

## 常见问题

### 1. 为什么权限检查总是返回 false?

**问题原因:**
- 用户未登录或 Token 已过期
- 用户权限列表为空或未正确加载
- 权限标识拼写错误
- 权限数据未正确存储到 Pinia Store

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasPermission, isLoggedIn } = useAuth()
const userStore = useUserStore()

// 调试检查
console.log('是否登录:', isLoggedIn.value)
console.log('Token:', userStore.token)
console.log('用户权限:', userStore.permissions)
console.log('检查权限结果:', hasPermission('system:user:add'))

// 确保权限数据已加载
onMounted(async () => {
  if (isLoggedIn.value && userStore.permissions.length === 0) {
    await userStore.getUserInfo()
  }
})
</script>
```

### 2. 租户权限检查失败

**问题原因:**
- 当前用户的租户 ID 与目标租户 ID 不匹配
- 用户信息中缺少租户 ID
- 尝试跨租户操作但不是超级管理员

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasTenantPermission, isSuperAdmin } = useAuth()
const userStore = useUserStore()

const checkTenantPermission = () => {
  const currentTenantId = userStore.userInfo?.tenantId
  console.log('当前租户 ID:', currentTenantId)

  if (!currentTenantId) {
    console.error('用户信息中缺少租户 ID')
    return false
  }

  if (isSuperAdmin()) {
    console.log('超级管理员,拥有所有租户权限')
    return true
  }

  return hasTenantPermission('tenant:data:manage')
}
</script>
```

### 3. 路由权限过滤后所有路由都消失

**问题原因:**
- 路由配置的权限要求过于严格
- 用户没有任何匹配的权限或角色

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { filterAuthorizedRoutes, isSuperAdmin } = useAuth()

const allRoutes = [
  {
    path: '/pages/home',
    title: '首页',
    // ✅ 首页不设置权限要求,所有人可访问
  },
  {
    path: '/pages/system/user',
    title: '用户管理',
    meta: { permissions: ['system:user:list'] }
  },
]

const authorizedRoutes = computed(() => {
  if (isSuperAdmin()) return allRoutes

  const filtered = filterAuthorizedRoutes(allRoutes)

  // 至少保留首页
  if (filtered.length === 0) {
    return allRoutes.filter(r => r.path === '/pages/home')
  }

  return filtered
})
</script>
```

### 4. 权限更新后 UI 没有响应

**问题原因:**
- 权限检查没有使用计算属性
- 直接在模板中调用权限检查方法

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// ✅ 正确: 使用计算属性
const canAddUser = computed(() => hasPermission('system:user:add'))

// ❌ 错误: 直接赋值(不响应式)
// const canAddUser = hasPermission('system:user:add')
</script>

<template>
  <!-- ✅ 正确: 使用计算属性 -->
  <wd-button v-if="canAddUser">新增用户</wd-button>

  <!-- ❌ 错误: 直接调用方法(每次渲染都执行) -->
  <!-- <wd-button v-if="hasPermission('system:user:add')">新增用户</wd-button> -->
</template>
```

### 5. 超级管理员无法通过权限检查

**问题原因:**
- 用户角色列表中缺少超级管理员角色
- 超级管理员角色标识不匹配

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { isSuperAdmin, hasPermission } = useAuth()
const userStore = useUserStore()

// 检查用户角色列表
console.log('用户角色:', userStore.roles)
console.log('是否为超级管理员(默认):', isSuperAdmin())
console.log('是否为超级管理员(自定义):', isSuperAdmin('system_admin'))

// 确保角色列表中包含正确的角色
if (!userStore.roles.includes('superadmin')) {
  console.error('角色列表中缺少 superadmin 角色')
}
</script>
```

### 6. 多角色或多权限检查逻辑混淆

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasAllPermissions } = useAuth()

// ✅ OR 逻辑: 拥有任一权限即可
const canManageData = computed(() =>
  hasPermission(['perm1', 'perm2']) // 满足其一
)

// ✅ AND 逻辑: 必须拥有所有权限
const canDataMigration = computed(() =>
  hasAllPermissions(['perm1', 'perm2']) // 必须全部满足
)

// ❌ 错误: 使用 hasPermission 想要 AND 逻辑
const wrongAndLogic = computed(() =>
  hasPermission(['perm1', 'perm2']) // 这是 OR 逻辑,不是 AND!
)
</script>
```

### 7. 在循环中重复检查权限导致性能问题

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const dataList = ref([/* 1000+ 条数据 */])

// ✅ 正确: 提前缓存权限检查结果
const permissions = computed(() => ({
  canEdit: hasPermission('system:data:edit'),
  canDelete: hasPermission('system:data:remove'),
}))
</script>

<template>
  <view v-for="item in dataList" :key="item.id">
    <text>{{ item.name }}</text>
    <!-- ✅ 使用缓存的权限检查结果 -->
    <wd-button v-if="permissions.canEdit" size="small">编辑</wd-button>
    <wd-button v-if="permissions.canDelete" size="small" type="danger">删除</wd-button>
  </view>
</template>
```

## 类型定义

### UserStore 相关类型

```typescript
interface UserInfo {
  userId: string
  userName: string
  nickName: string
  tenantId: string
  tenantName: string
  [key: string]: any
}

interface UserStore {
  token: string
  userInfo: UserInfo | null
  permissions: string[]
  roles: string[]
  getUserInfo: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
  logout: () => void
}
```

### 路由相关类型

```typescript
interface RouteMeta {
  requireAuth?: boolean
  roles?: string[]
  permissions?: string[]
  [key: string]: any
}

interface RouteConfig {
  path: string
  title?: string
  meta?: RouteMeta
  children?: RouteConfig[]
}
```

### 返回值类型

```typescript
interface UseAuthReturn {
  // 状态
  isLoggedIn: ComputedRef<boolean>

  // 管理员检查
  isSuperAdmin: (roleToCheck?: string) => boolean
  isTenantAdmin: (roleToCheck?: string) => boolean
  isAnyAdmin: (superAdminRole?: string, tenantAdminRole?: string) => boolean

  // 权限检查
  hasPermission: (permission: string | string[], superAdminRole?: string) => boolean
  hasTenantPermission: (
    permission: string | string[],
    tenantId?: string,
    superAdminRole?: string,
    tenantAdminRole?: string
  ) => boolean
  hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean

  // 角色检查
  hasRole: (role: string | string[], superAdminRole?: string) => boolean
  hasAllRoles: (roles: string[], superAdminRole?: string) => boolean

  // 路由访问控制
  canAccessRoute: (route: any, superAdminRole?: string) => boolean
  filterAuthorizedRoutes: (routes: any[], superAdminRole?: string) => any[]
}
```
