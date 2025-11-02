# useAuth - 认证与权限管理

## 介绍

`useAuth` 是 RuoYi-Plus-UniApp 提供的认证与权限管理组合式函数,基于 Vue 3 Composition API 设计,封装了用户认证、权限检查、角色校验和路由访问控制等功能。它深度集成 Pinia 状态管理,简化了权限相关操作,是构建安全可靠应用的核心工具。

通过 `useAuth`,开发者可以轻松实现基于角色的访问控制(RBAC)、细粒度的权限管理、多租户权限隔离等复杂的权限场景,无需手动处理用户状态和权限逻辑。

**核心特性:**

- **登录状态管理** - 响应式的登录状态检测,自动同步用户登录信息
- **角色类型判断** - 支持超级管理员、租户管理员等多种角色类型识别
- **权限检查** - 提供单个/多个权限检查,支持 OR 和 AND 逻辑组合
- **角色检查** - 灵活的角色校验机制,支持自定义角色标识
- **多租户支持** - 内置租户权限隔离,自动处理租户上下文
- **路由访问控制** - 基于权限的路由过滤和访问控制
- **类型安全** - 完整的 TypeScript 类型定义,提供智能提示
- **零配置** - 开箱即用,无需额外配置

**源码位置**: src/composables/useAuth.ts

参考: src/composables/useAuth.ts:1-355

## 核心概念

### 权限标识

权限标识是一个字符串,用于标识用户可以执行的操作,通常采用 `模块:功能:操作` 的格式:

```typescript
// 权限标识示例
'system:user:add'      // 系统管理 - 用户管理 - 新增用户
'system:user:edit'     // 系统管理 - 用户管理 - 编辑用户
'system:user:delete'   // 系统管理 - 用户管理 - 删除用户
'system:user:query'    // 系统管理 - 用户管理 - 查询用户

// 通配符权限
'*:*:*'                // 所有权限
```

参考: src/composables/useAuth.ts:61

### 角色标识

角色是一组权限的集合,系统预设了两种特殊角色:

- **超级管理员** (`superadmin`): 拥有系统所有权限,不受租户限制
- **租户管理员** (`admin`): 拥有其所属租户内的所有权限

```typescript
// 角色标识
const SUPER_ADMIN = 'superadmin'   // 超级管理员
const TENANT_ADMIN = 'admin'        // 租户管理员

// 自定义角色
'editor'                           // 编辑员
'viewer'                           // 查看员
'operator'                         // 操作员
```

参考: src/composables/useAuth.ts:54-58

### 权限检查逻辑

权限检查遵循以下优先级:

1. **超级管理员豁免**: 超级管理员自动拥有所有权限
2. **通配符权限**: 拥有 `*:*:*` 权限的用户拥有所有权限
3. **具体权限匹配**: 检查用户权限列表中是否包含指定权限

参考: src/composables/useAuth.ts:113-142

## 基本用法

### 引入和初始化

在组件中引入 `useAuth` 并解构所需的方法和状态:

```vue
<template>
  <view class="page">
    <view v-if="isLoggedIn">
      <text>欢迎回来!</text>
      <button v-if="canEdit" @click="handleEdit">编辑</button>
      <button v-if="canDelete" @click="handleDelete">删除</button>
    </view>
    <view v-else>
      <text>请先登录</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn, hasPermission } = useAuth()

// 检查权限
const canEdit = hasPermission('system:user:edit')
const canDelete = hasPermission('system:user:delete')

const handleEdit = () => {
  console.log('执行编辑操作')
}

const handleDelete = () => {
  console.log('执行删除操作')
}
</script>
```

**使用说明:**
- `useAuth()` 必须在组件的 `setup()` 函数或 `<script setup>` 中调用
- 解构的状态和方法可以直接在模板和逻辑中使用
- 响应式状态会自动更新,无需手动刷新

参考: src/composables/useAuth.ts:50-354

### 登录状态检测

使用 `isLoggedIn` 计算属性检测用户是否已登录:

```vue
<template>
  <view class="container">
    <!-- 根据登录状态显示不同内容 -->
    <view v-if="isLoggedIn">
      <text>用户信息</text>
      <text>{{ userInfo.nickname }}</text>
    </view>
    <view v-else>
      <button @click="goToLogin">立即登录</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { isLoggedIn } = useAuth()
const userStore = useUserStore()
const userInfo = userStore.userInfo

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>
```

**使用说明:**
- `isLoggedIn` 是响应式的计算属性,会根据 token 状态自动更新
- 当 token 存在且长度大于 0 时,返回 `true`
- 适用于任何需要判断登录状态的场景

参考: src/composables/useAuth.ts:67-69

### 管理员类型判断

检查用户是否为超级管理员或租户管理员:

```vue
<template>
  <view class="admin-panel">
    <!-- 超级管理员专属功能 -->
    <view v-if="superAdmin" class="super-admin-section">
      <text>超级管理员控制台</text>
      <button @click="manageAllTenants">管理所有租户</button>
      <button @click="systemSettings">系统设置</button>
    </view>

    <!-- 租户管理员功能 -->
    <view v-if="tenantAdmin" class="tenant-admin-section">
      <text>租户管理控制台</text>
      <button @click="manageTenantUsers">管理租户用户</button>
      <button @click="tenantSettings">租户设置</button>
    </view>

    <!-- 任意管理员可见 -->
    <view v-if="anyAdmin" class="admin-section">
      <text>管理员专属功能</text>
    </view>

    <!-- 普通用户功能 -->
    <view v-else class="user-section">
      <text>用户功能</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin, isAnyAdmin } = useAuth()

// 检查是否为超级管理员
const superAdmin = isSuperAdmin()

// 检查是否为租户管理员
const tenantAdmin = isTenantAdmin()

// 检查是否为任意级别的管理员
const anyAdmin = isAnyAdmin()

const manageAllTenants = () => {
  console.log('管理所有租户')
}

const systemSettings = () => {
  console.log('系统设置')
}

const manageTenantUsers = () => {
  console.log('管理租户用户')
}

const tenantSettings = () => {
  console.log('租户设置')
}
</script>
```

**使用说明:**
- `isSuperAdmin()` 检查用户角色中是否包含 `superadmin`
- `isTenantAdmin()` 检查用户角色中是否包含 `admin`
- `isAnyAdmin()` 检查用户是否为超级管理员或租户管理员
- 可以传入自定义角色标识来检查其他管理员类型

参考: src/composables/useAuth.ts:77-102

### 自定义管理员角色

支持自定义管理员角色标识:

```vue
<template>
  <view class="custom-admin-panel">
    <view v-if="customSuperAdmin">
      <text>自定义超级管理员</text>
    </view>
    <view v-if="customTenantAdmin">
      <text>自定义租户管理员</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin } = useAuth()

// 检查自定义超级管理员角色
const customSuperAdmin = isSuperAdmin('custom_super_admin')

// 检查自定义租户管理员角色
const customTenantAdmin = isTenantAdmin('custom_admin')
</script>
```

**使用说明:**
- 传入自定义角色标识字符串
- 适用于有特殊角色命名规范的项目
- 不传参数则使用默认角色标识

参考: src/composables/useAuth.ts:77-91

## 权限检查

### 单个权限检查

使用 `hasPermission` 检查用户是否拥有指定权限:

```vue
<template>
  <view class="user-management">
    <button v-if="canAdd" @click="addUser">新增用户</button>
    <button v-if="canEdit" @click="editUser">编辑用户</button>
    <button v-if="canDelete" @click="deleteUser">删除用户</button>
    <button v-if="canExport" @click="exportUsers">导出用户</button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 检查单个权限
const canAdd = hasPermission('system:user:add')
const canEdit = hasPermission('system:user:edit')
const canDelete = hasPermission('system:user:delete')
const canExport = hasPermission('system:user:export')

const addUser = () => {
  console.log('新增用户')
}

const editUser = () => {
  console.log('编辑用户')
}

const deleteUser = () => {
  console.log('删除用户')
}

const exportUsers = () => {
  console.log('导出用户')
}
</script>
```

**使用说明:**
- 传入权限标识字符串
- 返回 `boolean` 值,表示是否拥有该权限
- 超级管理员自动拥有所有权限
- 拥有 `*:*:*` 通配符权限的用户拥有所有权限

参考: src/composables/useAuth.ts:113-142

### 多个权限检查 (OR 逻辑)

检查用户是否拥有多个权限中的任意一个:

```vue
<template>
  <view class="user-actions">
    <!-- 只要拥有新增、编辑、删除任一权限,就显示管理按钮 -->
    <button v-if="canManageUsers" @click="manageUsers">
      管理用户
    </button>

    <!-- 只要拥有查看或导出权限,就显示查看按钮 -->
    <button v-if="canViewUsers" @click="viewUsers">
      查看用户
    </button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 检查多个权限 (满足任一即可)
const canManageUsers = hasPermission([
  'system:user:add',
  'system:user:edit',
  'system:user:delete'
])

const canViewUsers = hasPermission([
  'system:user:query',
  'system:user:export'
])

const manageUsers = () => {
  console.log('管理用户')
}

const viewUsers = () => {
  console.log('查看用户')
}
</script>
```

**使用说明:**
- 传入权限标识数组
- 只要拥有数组中的任意一个权限,就返回 `true`
- 适用于"满足任一条件"的权限场景
- 数组为空时返回 `false` 并打印警告

参考: src/composables/useAuth.ts:134-138

### 多个权限检查 (AND 逻辑)

检查用户是否拥有所有指定权限:

```vue
<template>
  <view class="advanced-operations">
    <!-- 必须同时拥有编辑和删除权限 -->
    <button v-if="canFullyManage" @click="fullyManageUsers">
      完全管理
    </button>

    <!-- 必须同时拥有查询、新增、编辑权限 -->
    <button v-if="canOperateUsers" @click="operateUsers">
      用户操作
    </button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasAllPermissions } = useAuth()

// 检查是否拥有所有指定权限
const canFullyManage = hasAllPermissions([
  'system:user:edit',
  'system:user:delete'
])

const canOperateUsers = hasAllPermissions([
  'system:user:query',
  'system:user:add',
  'system:user:edit'
])

const fullyManageUsers = () => {
  if (!canFullyManage) {
    uni.showToast({
      title: '权限不足',
      icon: 'none'
    })
    return
  }
  console.log('完全管理用户')
}

const operateUsers = () => {
  console.log('用户操作')
}
</script>
```

**使用说明:**
- 使用 `hasAllPermissions` 方法
- 传入权限标识数组
- 必须拥有数组中的所有权限才返回 `true`
- 适用于"必须同时满足多个条件"的权限场景
- 超级管理员和拥有 `*:*:*` 权限的用户自动满足条件

参考: src/composables/useAuth.ts:227-245

### 函数式权限检查

在函数或方法中动态检查权限:

```vue
<template>
  <view class="user-list">
    <view v-for="user in users" :key="user.id" class="user-item">
      <text>{{ user.name }}</text>
      <button @click="handleEdit(user)">编辑</button>
      <button @click="handleDelete(user)">删除</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: '用户1' },
  { id: 2, name: '用户2' }
])

// 在函数中检查权限
const handleEdit = (user: User) => {
  if (!hasPermission('system:user:edit')) {
    uni.showToast({
      title: '无编辑权限',
      icon: 'none'
    })
    return
  }

  console.log('编辑用户:', user)
  // 执行编辑逻辑
}

const handleDelete = (user: User) => {
  // 删除操作需要同时拥有删除和编辑权限
  if (!hasAllPermissions(['system:user:delete', 'system:user:edit'])) {
    uni.showToast({
      title: '权限不足,需要编辑和删除权限',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '确认删除',
    content: `确定删除用户 ${user.name} 吗?`,
    success: (res) => {
      if (res.confirm) {
        console.log('删除用户:', user)
        // 执行删除逻辑
      }
    }
  })
}
</script>
```

**使用说明:**
- 在函数内部调用权限检查方法
- 根据权限检查结果决定是否执行后续操作
- 权限不足时给出友好提示
- 适用于复杂的业务逻辑场景

参考: src/composables/useAuth.ts:113-142

## 角色检查

### 单个角色检查

使用 `hasRole` 检查用户是否拥有指定角色:

```vue
<template>
  <view class="role-based-ui">
    <!-- 编辑员专属功能 -->
    <view v-if="isEditor" class="editor-panel">
      <text>编辑员面板</text>
      <button @click="editContent">编辑内容</button>
    </view>

    <!-- 审核员专属功能 -->
    <view v-if="isReviewer" class="reviewer-panel">
      <text>审核员面板</text>
      <button @click="reviewContent">审核内容</button>
    </view>

    <!-- 管理员专属功能 -->
    <view v-if="isManager" class="manager-panel">
      <text>管理员面板</text>
      <button @click="manageSystem">系统管理</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole } = useAuth()

// 检查单个角色
const isEditor = hasRole('editor')
const isReviewer = hasRole('reviewer')
const isManager = hasRole('manager')

const editContent = () => {
  console.log('编辑内容')
}

const reviewContent = () => {
  console.log('审核内容')
}

const manageSystem = () => {
  console.log('系统管理')
}
</script>
```

**使用说明:**
- 传入角色标识字符串
- 返回 `boolean` 值,表示是否拥有该角色
- 超级管理员自动拥有所有角色
- 支持系统预设角色和自定义角色

参考: src/composables/useAuth.ts:193-217

### 多个角色检查 (OR 逻辑)

检查用户是否拥有多个角色中的任意一个:

```vue
<template>
  <view class="content-management">
    <!-- 编辑员或审核员可以访问 -->
    <view v-if="canAccessContent" class="content-panel">
      <text>内容管理</text>
      <button @click="manageContent">管理内容</button>
    </view>

    <!-- 管理员或运维人员可以访问 -->
    <view v-if="canAccessSystem" class="system-panel">
      <text>系统配置</text>
      <button @click="configureSystem">配置系统</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole } = useAuth()

// 检查多个角色 (满足任一即可)
const canAccessContent = hasRole(['editor', 'reviewer'])
const canAccessSystem = hasRole(['manager', 'operator'])

const manageContent = () => {
  console.log('管理内容')
}

const configureSystem = () => {
  console.log('配置系统')
}
</script>
```

**使用说明:**
- 传入角色标识数组
- 只要拥有数组中的任意一个角色,就返回 `true`
- 适用于"满足任一角色"的场景
- 超级管理员自动满足条件

参考: src/composables/useAuth.ts:209-213

### 多个角色检查 (AND 逻辑)

检查用户是否拥有所有指定角色:

```vue
<template>
  <view class="advanced-management">
    <!-- 必须同时拥有编辑员和审核员角色 -->
    <view v-if="canFullyManageContent" class="full-management">
      <text>完全内容管理</text>
      <button @click="fullyManageContent">全权管理</button>
    </view>

    <!-- 必须同时拥有管理员和运维角色 -->
    <view v-if="canFullyManageSystem" class="system-management">
      <text>完全系统管理</text>
      <button @click="fullyManageSystem">系统全权管理</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasAllRoles } = useAuth()

// 检查是否拥有所有指定角色
const canFullyManageContent = hasAllRoles(['editor', 'reviewer'])
const canFullyManageSystem = hasAllRoles(['manager', 'operator'])

const fullyManageContent = () => {
  if (!canFullyManageContent) {
    uni.showToast({
      title: '需要同时拥有编辑员和审核员角色',
      icon: 'none'
    })
    return
  }
  console.log('全权管理内容')
}

const fullyManageSystem = () => {
  console.log('系统全权管理')
}
</script>
```

**使用说明:**
- 使用 `hasAllRoles` 方法
- 传入角色标识数组
- 必须拥有数组中的所有角色才返回 `true`
- 适用于"必须同时拥有多个角色"的场景
- 超级管理员自动满足条件

参考: src/composables/useAuth.ts:255-268

### 角色与权限组合检查

在实际应用中,可能需要同时检查角色和权限:

```vue
<template>
  <view class="complex-permissions">
    <!-- 编辑员角色且拥有发布权限 -->
    <view v-if="canPublish" class="publish-section">
      <button @click="publishContent">发布内容</button>
    </view>

    <!-- 管理员角色且拥有系统配置权限 -->
    <view v-if="canConfigureSystem" class="config-section">
      <button @click="configSystem">系统配置</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasRole, hasPermission } = useAuth()

// 组合检查: 角色 + 权限
const canPublish = computed(() => {
  return hasRole('editor') && hasPermission('content:publish')
})

const canConfigureSystem = computed(() => {
  return hasRole('manager') && hasPermission('system:config')
})

const publishContent = () => {
  if (!canPublish.value) {
    uni.showToast({
      title: '需要编辑员角色和发布权限',
      icon: 'none'
    })
    return
  }
  console.log('发布内容')
}

const configSystem = () => {
  console.log('系统配置')
}
</script>
```

**使用说明:**
- 使用 `computed` 组合多个权限检查
- 可以灵活组合角色检查、权限检查和其他业务逻辑
- 计算属性会自动缓存结果,提高性能
- 响应式更新,状态变化时自动重新计算

参考: src/composables/useAuth.ts:113-217

## 多租户权限

### 租户权限检查

使用 `hasTenantPermission` 检查用户在指定租户内的权限:

```vue
<template>
  <view class="tenant-management">
    <view v-for="tenant in tenants" :key="tenant.id" class="tenant-item">
      <text>{{ tenant.name }}</text>

      <!-- 检查在该租户内的权限 -->
      <button
        v-if="canManageTenantUser(tenant.id)"
        @click="manageTenantUser(tenant.id)"
      >
        管理用户
      </button>

      <button
        v-if="canConfigureTenant(tenant.id)"
        @click="configureTenant(tenant.id)"
      >
        租户配置
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission } = useAuth()

interface Tenant {
  id: string
  name: string
}

const tenants = ref<Tenant[]>([
  { id: '1', name: '租户A' },
  { id: '2', name: '租户B' }
])

// 检查在指定租户内的权限
const canManageTenantUser = (tenantId: string) => {
  return hasTenantPermission('tenant:user:manage', tenantId)
}

const canConfigureTenant = (tenantId: string) => {
  return hasTenantPermission('tenant:config', tenantId)
}

const manageTenantUser = (tenantId: string) => {
  if (!canManageTenantUser(tenantId)) {
    uni.showToast({
      title: '无权限管理该租户用户',
      icon: 'none'
    })
    return
  }
  console.log('管理租户用户:', tenantId)
}

const configureTenant = (tenantId: string) => {
  console.log('配置租户:', tenantId)
}
</script>
```

**使用说明:**
- 第一个参数: 权限标识(字符串或数组)
- 第二个参数: 租户 ID (可选,默认使用当前用户的租户 ID)
- 超级管理员拥有所有租户的所有权限
- 租户管理员仅在其所属租户内拥有所有权限
- 普通用户仅能操作自己所属租户的数据

参考: src/composables/useAuth.ts:155-182

### 租户隔离

租户权限检查会自动处理租户隔离:

```vue
<template>
  <view class="data-management">
    <button @click="queryCurrentTenantData">查询当前租户数据</button>
    <button @click="queryOtherTenantData">查询其他租户数据</button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'
import { http } from '@/composables/useHttp'

const { hasTenantPermission, isSuperAdmin } = useAuth()
const userStore = useUserStore()

// 查询当前租户数据
const queryCurrentTenantData = async () => {
  // 检查当前租户的查询权限
  if (!hasTenantPermission('data:query')) {
    uni.showToast({
      title: '无权限查询数据',
      icon: 'none'
    })
    return
  }

  // 查询当前租户数据
  const [error, data] = await http.get('/api/tenant/data')

  if (error) {
    console.error('查询失败:', error)
    return
  }

  console.log('当前租户数据:', data)
}

// 查询其他租户数据
const queryOtherTenantData = async () => {
  const otherTenantId = '999'

  // 检查在其他租户的查询权限
  // 只有超级管理员可以访问其他租户的数据
  if (!hasTenantPermission('data:query', otherTenantId)) {
    uni.showToast({
      title: '无权限访问其他租户数据',
      icon: 'none'
    })
    return
  }

  // 超级管理员可以查询任意租户数据
  const [error, data] = await http.get(`/api/tenant/data?tenantId=${otherTenantId}`)

  if (error) {
    console.error('查询失败:', error)
    return
  }

  console.log('其他租户数据:', data)
}
</script>
```

**使用说明:**
- 租户 ID 与当前用户租户 ID 不同时,普通用户和租户管理员无权访问
- 超级管理员不受租户限制,可以访问任意租户数据
- 不传入租户 ID 时,自动使用当前用户的租户 ID
- 租户隔离逻辑自动处理,无需手动判断

参考: src/composables/useAuth.ts:161-182

### 自定义管理员角色的租户权限

支持自定义超级管理员和租户管理员角色标识:

```vue
<template>
  <view class="custom-tenant-management">
    <button @click="accessWithCustomRoles">使用自定义角色访问</button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission } = useAuth()

const accessWithCustomRoles = () => {
  // 使用自定义的超级管理员和租户管理员角色标识
  const hasAccess = hasTenantPermission(
    'tenant:data:access',
    '123',                      // 租户 ID
    'custom_super_admin',       // 自定义超级管理员角色
    'custom_tenant_admin'       // 自定义租户管理员角色
  )

  if (!hasAccess) {
    uni.showToast({
      title: '无权限访问',
      icon: 'none'
    })
    return
  }

  console.log('访问租户数据')
}
</script>
```

**使用说明:**
- 第三个参数: 自定义超级管理员角色标识
- 第四个参数: 自定义租户管理员角色标识
- 适用于有特殊角色命名规范的项目
- 不传入则使用默认角色标识

参考: src/composables/useAuth.ts:155-182

## 路由访问控制

### 路由权限检查

使用 `canAccessRoute` 检查用户是否有权限访问指定路由:

```vue
<template>
  <view class="navigation">
    <view v-for="route in accessibleRoutes" :key="route.path" class="nav-item">
      <view @click="navigateTo(route)">
        {{ route.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { canAccessRoute } = useAuth()

interface RouteConfig {
  path: string
  name: string
  meta?: {
    roles?: string[]
    permissions?: string[]
  }
}

// 定义路由配置
const routes = ref<RouteConfig[]>([
  {
    path: '/pages/user/index',
    name: '用户管理',
    meta: {
      permissions: ['system:user:query']
    }
  },
  {
    path: '/pages/role/index',
    name: '角色管理',
    meta: {
      permissions: ['system:role:query']
    }
  },
  {
    path: '/pages/menu/index',
    name: '菜单管理',
    meta: {
      roles: ['admin']
    }
  },
  {
    path: '/pages/settings/index',
    name: '系统设置',
    meta: {
      roles: ['superadmin'],
      permissions: ['system:settings:config']
    }
  }
])

// 过滤出可访问的路由
const accessibleRoutes = computed(() => {
  return routes.value.filter(route => canAccessRoute(route))
})

const navigateTo = (route: RouteConfig) => {
  if (!canAccessRoute(route)) {
    uni.showToast({
      title: '无权限访问',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({ url: route.path })
}
</script>
```

**使用说明:**
- 路由需要在 `meta` 中定义 `roles` 和/或 `permissions`
- 没有定义权限要求的路由默认允许所有人访问
- 超级管理员可以访问所有路由
- 同时定义角色和权限时,两者都必须满足

**技术实现:**
- 优先检查路由是否存在和是否定义了权限要求
- 按顺序检查超级管理员、角色权限、操作权限
- 所有检查通过后才允许访问

参考: src/composables/useAuth.ts:278-308

### 过滤授权路由

使用 `filterAuthorizedRoutes` 过滤出用户有权限访问的路由列表:

```vue
<template>
  <view class="menu-tree">
    <view v-for="menu in authorizedMenus" :key="menu.path" class="menu-item">
      <view @click="navigateTo(menu)" class="menu-title">
        {{ menu.name }}
      </view>

      <!-- 递归显示子菜单 -->
      <view v-if="menu.children && menu.children.length > 0" class="sub-menu">
        <view
          v-for="child in menu.children"
          :key="child.path"
          class="sub-menu-item"
          @click="navigateTo(child)"
        >
          {{ child.name }}
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { filterAuthorizedRoutes } = useAuth()

interface MenuRoute {
  path: string
  name: string
  meta?: {
    roles?: string[]
    permissions?: string[]
  }
  children?: MenuRoute[]
}

// 定义完整的菜单路由树
const menuRoutes = ref<MenuRoute[]>([
  {
    path: '/pages/system',
    name: '系统管理',
    meta: {
      roles: ['admin']
    },
    children: [
      {
        path: '/pages/system/user',
        name: '用户管理',
        meta: {
          permissions: ['system:user:query']
        }
      },
      {
        path: '/pages/system/role',
        name: '角色管理',
        meta: {
          permissions: ['system:role:query']
        }
      },
      {
        path: '/pages/system/menu',
        name: '菜单管理',
        meta: {
          permissions: ['system:menu:query']
        }
      }
    ]
  },
  {
    path: '/pages/content',
    name: '内容管理',
    meta: {
      roles: ['editor', 'admin']
    },
    children: [
      {
        path: '/pages/content/article',
        name: '文章管理',
        meta: {
          permissions: ['content:article:query']
        }
      },
      {
        path: '/pages/content/category',
        name: '分类管理',
        meta: {
          permissions: ['content:category:query']
        }
      }
    ]
  }
])

// 过滤出有权限的菜单
const authorizedMenus = computed(() => {
  return filterAuthorizedRoutes(menuRoutes.value)
})

const navigateTo = (menu: MenuRoute) => {
  uni.navigateTo({ url: menu.path })
}
</script>

<style lang="scss" scoped>
.menu-tree {
  padding: 32rpx;

  .menu-item {
    margin-bottom: 24rpx;

    .menu-title {
      font-size: 32rpx;
      font-weight: bold;
      padding: 16rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
    }

    .sub-menu {
      margin-top: 12rpx;
      margin-left: 32rpx;

      .sub-menu-item {
        padding: 12rpx;
        font-size: 28rpx;
        border-bottom: 1px solid #eeeeee;
      }
    }
  }
}
</style>
```

**使用说明:**
- 传入路由配置数组
- 自动递归处理子路由
- 返回过滤后的路由数组,仅包含有权限访问的路由
- 适用于动态菜单生成场景

**技术实现:**
- 遍历路由数组,逐个检查访问权限
- 对于有子路由的路由,递归过滤子路由
- 保持原有路由结构,仅过滤掉无权限的路由

参考: src/composables/useAuth.ts:318-334

### 导航守卫

在页面导航前检查权限:

```vue
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 页面加载时检查权限
onLoad(() => {
  // 检查是否有查询权限
  if (!hasPermission('system:user:query')) {
    uni.showToast({
      title: '无权限访问此页面',
      icon: 'none'
    })

    // 返回上一页或跳转到首页
    setTimeout(() => {
      uni.navigateBack({
        fail: () => {
          uni.switchTab({ url: '/pages/index/index' })
        }
      })
    }, 1500)
    return
  }

  // 有权限,加载页面数据
  loadPageData()
})

const loadPageData = () => {
  console.log('加载页面数据')
}
</script>
```

**使用说明:**
- 在 `onLoad` 生命周期中检查权限
- 无权限时给出提示并导航回上一页
- 有权限时正常加载页面数据
- 适用于需要权限保护的页面

参考: src/composables/useAuth.ts:113-142

## API 文档

### 返回值

`useAuth()` 返回一个对象,包含以下状态和方法:

| 名称 | 类型 | 说明 |
|------|------|------|
| `isLoggedIn` | `ComputedRef<boolean>` | 当前用户登录状态 |
| `isSuperAdmin` | `(roleToCheck?: string) => boolean` | 检查是否为超级管理员 |
| `isTenantAdmin` | `(roleToCheck?: string) => boolean` | 检查是否为租户管理员 |
| `isAnyAdmin` | `(superAdminRole?: string, tenantAdminRole?: string) => boolean` | 检查是否为任意级别的管理员 |
| `hasPermission` | `(permission: string \| string[], superAdminRole?: string) => boolean` | 检查是否拥有指定权限 |
| `hasTenantPermission` | `(permission: string \| string[], tenantId?: string, superAdminRole?: string, tenantAdminRole?: string) => boolean` | 检查租户权限 |
| `hasRole` | `(role: string \| string[], superAdminRole?: string) => boolean` | 检查是否拥有指定角色 |
| `hasAllPermissions` | `(permissions: string[], superAdminRole?: string) => boolean` | 检查是否拥有所有指定权限 |
| `hasAllRoles` | `(roles: string[], superAdminRole?: string) => boolean` | 检查是否拥有所有指定角色 |
| `canAccessRoute` | `(route: any, superAdminRole?: string) => boolean` | 检查是否有权限访问路由 |
| `filterAuthorizedRoutes` | `(routes: any[], superAdminRole?: string) => any[]` | 过滤有权限访问的路由 |

参考: src/composables/useAuth.ts:336-353

### 状态

#### isLoggedIn

```typescript
const isLoggedIn: ComputedRef<boolean>
```

**说明**: 计算属性,表示当前用户是否已登录

**返回值**: `boolean` - 登录返回 `true`,未登录返回 `false`

**判断依据**: 检查 `userStore.token` 是否存在且长度大于 0

参考: src/composables/useAuth.ts:67-69

### 方法

#### isSuperAdmin

```typescript
const isSuperAdmin: (roleToCheck?: string) => boolean
```

**说明**: 检查当前用户是否为超级管理员

**参数**:
- `roleToCheck` (可选) - 要检查的超级管理员角色标识,默认为 `'superadmin'`

**返回值**: `boolean` - 是超级管理员返回 `true`,否则返回 `false`

**判断依据**: 检查用户角色列表中是否包含指定的超级管理员角色

参考: src/composables/useAuth.ts:77-80

#### isTenantAdmin

```typescript
const isTenantAdmin: (roleToCheck?: string) => boolean
```

**说明**: 检查当前用户是否为租户管理员

**参数**:
- `roleToCheck` (可选) - 要检查的租户管理员角色标识,默认为 `'admin'`

**返回值**: `boolean` - 是租户管理员返回 `true`,否则返回 `false`

**判断依据**: 检查用户角色列表中是否包含指定的租户管理员角色

参考: src/composables/useAuth.ts:88-91

#### isAnyAdmin

```typescript
const isAnyAdmin: (superAdminRole?: string, tenantAdminRole?: string) => boolean
```

**说明**: 检查当前用户是否为任意级别的管理员(超级管理员或租户管理员)

**参数**:
- `superAdminRole` (可选) - 超级管理员角色标识,默认为 `'superadmin'`
- `tenantAdminRole` (可选) - 租户管理员角色标识,默认为 `'admin'`

**返回值**: `boolean` - 是任意管理员返回 `true`,否则返回 `false`

**判断依据**: 检查用户是否为超级管理员或租户管理员

参考: src/composables/useAuth.ts:100-102

#### hasPermission

```typescript
const hasPermission: (permission: string | string[], superAdminRole?: string) => boolean
```

**说明**: 检查当前用户是否拥有指定权限

**参数**:
- `permission` - 权限标识字符串或权限标识数组
- `superAdminRole` (可选) - 超级管理员角色标识,用于权限豁免检查

**返回值**: `boolean` - 拥有权限返回 `true`,否则返回 `false`

**检查逻辑**:
1. 权限参数为空时返回 `false` 并打印警告
2. 超级管理员自动拥有所有权限
3. 拥有 `*:*:*` 通配符权限的用户拥有所有权限
4. 权限数组时,只要拥有其中任意一个权限即返回 `true`
5. 单个权限时,检查用户权限列表中是否包含该权限

参考: src/composables/useAuth.ts:113-142

#### hasTenantPermission

```typescript
const hasTenantPermission: (
  permission: string | string[],
  tenantId?: string,
  superAdminRole?: string,
  tenantAdminRole?: string
) => boolean
```

**说明**: 检查当前用户是否在指定租户范围内拥有权限

**参数**:
- `permission` - 权限标识字符串或权限标识数组
- `tenantId` (可选) - 租户 ID,不提供则使用当前用户的租户 ID
- `superAdminRole` (可选) - 超级管理员角色标识
- `tenantAdminRole` (可选) - 租户管理员角色标识

**返回值**: `boolean` - 在指定租户内拥有权限返回 `true`,否则返回 `false`

**检查逻辑**:
1. 超级管理员拥有所有租户的所有权限
2. 检查目标租户 ID 是否与当前用户租户 ID 一致
3. 租户管理员在自己的租户内拥有所有权限
4. 普通用户在自己的租户内按正常权限检查

参考: src/composables/useAuth.ts:155-182

#### hasRole

```typescript
const hasRole: (role: string | string[], superAdminRole?: string) => boolean
```

**说明**: 检查当前用户是否拥有指定角色

**参数**:
- `role` - 角色标识字符串或角色标识数组
- `superAdminRole` (可选) - 超级管理员角色标识,用于角色豁免检查

**返回值**: `boolean` - 拥有角色返回 `true`,否则返回 `false`

**检查逻辑**:
1. 角色参数为空时返回 `false` 并打印警告
2. 超级管理员默认拥有所有角色
3. 角色数组时,只要拥有其中任意一个角色即返回 `true`
4. 单个角色时,检查用户角色列表中是否包含该角色

参考: src/composables/useAuth.ts:193-217

#### hasAllPermissions

```typescript
const hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean
```

**说明**: 检查当前用户是否拥有所有指定权限

**参数**:
- `permissions` - 权限标识数组
- `superAdminRole` (可选) - 超级管理员角色标识

**返回值**: `boolean` - 拥有所有权限返回 `true`,否则返回 `false`

**检查逻辑**:
1. 超级管理员拥有所有权限
2. 拥有 `*:*:*` 通配符权限的用户拥有所有权限
3. 检查是否拥有数组中的所有权限(AND 逻辑)

参考: src/composables/useAuth.ts:227-245

#### hasAllRoles

```typescript
const hasAllRoles: (roles: string[], superAdminRole?: string) => boolean
```

**说明**: 检查当前用户是否拥有所有指定角色

**参数**:
- `roles` - 角色标识数组
- `superAdminRole` (可选) - 超级管理员角色标识

**返回值**: `boolean` - 拥有所有角色返回 `true`,否则返回 `false`

**检查逻辑**:
1. 超级管理员拥有所有角色
2. 检查是否拥有数组中的所有角色(AND 逻辑)

参考: src/composables/useAuth.ts:255-268

#### canAccessRoute

```typescript
const canAccessRoute: (route: any, superAdminRole?: string) => boolean
```

**说明**: 检查当前用户是否有权限访问指定路由

**参数**:
- `route` - 路由对象,需包含 `meta` 字段,其中可定义 `roles` 和 `permissions`
- `superAdminRole` (可选) - 超级管理员角色标识

**返回值**: `boolean` - 有权限访问返回 `true`,否则返回 `false`

**检查逻辑**:
1. 路由不存在返回 `false`
2. 路由没有 `meta` 或没有定义权限要求,允许访问
3. 超级管理员可以访问任何路由
4. 检查角色权限(`meta.roles`)
5. 检查操作权限(`meta.permissions`)
6. 所有检查通过才允许访问

**路由配置示例**:
```typescript
{
  path: '/pages/user/index',
  name: '用户管理',
  meta: {
    roles: ['admin'],                    // 需要的角色
    permissions: ['system:user:query']   // 需要的权限
  }
}
```

参考: src/composables/useAuth.ts:278-308

#### filterAuthorizedRoutes

```typescript
const filterAuthorizedRoutes: (routes: any[], superAdminRole?: string) => any[]
```

**说明**: 从路由数组中过滤出当前用户有权限访问的路由

**参数**:
- `routes` - 路由配置数组
- `superAdminRole` (可选) - 超级管理员角色标识

**返回值**: `any[]` - 过滤后的路由数组

**处理逻辑**:
1. 路由数组为空或不存在返回空数组
2. 遍历路由数组,检查每个路由的访问权限
3. 如果路由有子路由,递归过滤子路由
4. 返回过滤后的路由数组

参考: src/composables/useAuth.ts:318-334

### 常量

```typescript
// 超级管理员角色标识
const SUPER_ADMIN = 'superadmin'

// 租户管理员角色标识
const TENANT_ADMIN = 'admin'

// 通配符权限标识
const ALL_PERMISSION = '*:*:*'
```

参考: src/composables/useAuth.ts:54-61

## 最佳实践

### 1. 使用计算属性缓存权限检查结果

避免在模板中重复调用权限检查方法,使用计算属性缓存结果:

```vue
<template>
  <view class="operations">
    <button v-if="canAdd" @click="add">新增</button>
    <button v-if="canEdit" @click="edit">编辑</button>
    <button v-if="canDelete" @click="del">删除</button>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// ✅ 推荐: 使用计算属性
const canAdd = computed(() => hasPermission('system:user:add'))
const canEdit = computed(() => hasPermission('system:user:edit'))
const canDelete = computed(() => hasPermission('system:user:delete'))

// ❌ 不推荐: 在模板中直接调用
// <button v-if="hasPermission('system:user:add')" @click="add">新增</button>
</script>
```

**优势**:
- 计算属性会缓存结果,避免重复计算
- 响应式更新,状态变化时自动重新计算
- 代码更清晰,易于维护

### 2. 权限不足时给出友好提示

在权限检查失败时,给用户明确的提示信息:

```typescript
// ✅ 推荐: 给出明确的提示
const handleDelete = (id: number) => {
  if (!hasPermission('system:user:delete')) {
    uni.showToast({
      title: '您没有删除权限,请联系管理员',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 执行删除操作
  deleteUser(id)
}

// ❌ 不推荐: 静默失败
const handleDelete = (id: number) => {
  if (!hasPermission('system:user:delete')) {
    return
  }
  deleteUser(id)
}
```

### 3. 组合多个权限检查

对于复杂的业务场景,使用计算属性组合多个权限检查:

```typescript
// ✅ 推荐: 清晰的组合逻辑
const canPublish = computed(() => {
  // 必须是编辑员角色,且拥有发布权限
  return hasRole('editor') && hasPermission('content:publish')
})

const canManageContent = computed(() => {
  // 编辑员或审核员,且拥有管理权限
  return (
    (hasRole('editor') || hasRole('reviewer')) &&
    hasPermission('content:manage')
  )
})

// ❌ 不推荐: 复杂的内联判断
// <button v-if="hasRole('editor') && hasPermission('content:publish')" @click="publish">发布</button>
```

### 4. 路由守卫集中处理

在页面级别集中处理权限检查,避免在多个子组件中重复检查:

```vue
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// ✅ 推荐: 在页面级别统一检查
onLoad(() => {
  if (!hasPermission('system:user:query')) {
    uni.showToast({
      title: '无权限访问',
      icon: 'none'
    })
    uni.navigateBack()
    return
  }

  // 页面有权限,加载数据
  loadData()
})

// ❌ 不推荐: 在每个子组件中分别检查
// 每个子组件都检查一次权限,浪费性能
</script>
```

### 5. 避免硬编码权限字符串

使用常量或枚举定义权限标识,避免硬编码:

```typescript
// ✅ 推荐: 使用常量
// constants/permissions.ts
export const USER_PERMISSIONS = {
  ADD: 'system:user:add',
  EDIT: 'system:user:edit',
  DELETE: 'system:user:delete',
  QUERY: 'system:user:query',
  EXPORT: 'system:user:export'
} as const

// 组件中使用
import { USER_PERMISSIONS } from '@/constants/permissions'

const canAdd = computed(() => hasPermission(USER_PERMISSIONS.ADD))
const canEdit = computed(() => hasPermission(USER_PERMISSIONS.EDIT))

// ❌ 不推荐: 硬编码字符串
const canAdd = computed(() => hasPermission('system:user:add'))
const canEdit = computed(() => hasPermission('system:user:edit'))
```

**优势**:
- 统一管理权限标识,避免拼写错误
- 便于全局搜索和重构
- 类型安全,IDE 支持智能提示

### 6. 结合 v-if 和 disabled 双重控制

对于敏感操作,既要隐藏按钮(v-if),又要禁用按钮(disabled):

```vue
<template>
  <view class="operations">
    <!-- ✅ 推荐: 完全隐藏无权限的按钮 -->
    <button v-if="canDelete" :disabled="deleting" @click="handleDelete">
      {{ deleting ? '删除中...' : '删除' }}
    </button>

    <!-- ❌ 不推荐: 仅禁用按钮,用户仍能看到 -->
    <button :disabled="!canDelete || deleting" @click="handleDelete">
      删除
    </button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const canDelete = computed(() => hasPermission('system:user:delete'))
const deleting = ref(false)

const handleDelete = () => {
  if (!canDelete.value) return

  deleting.value = true
  // 执行删除操作
  setTimeout(() => {
    deleting.value = false
  }, 1000)
}
</script>
```

### 7. 租户权限检查优先使用 hasTenantPermission

在多租户场景中,优先使用 `hasTenantPermission` 而非手动判断:

```typescript
// ✅ 推荐: 使用 hasTenantPermission
const canAccessTenantData = (tenantId: string) => {
  return hasTenantPermission('data:access', tenantId)
}

// ❌ 不推荐: 手动判断租户和权限
const canAccessTenantData = (tenantId: string) => {
  const userStore = useUserStore()
  if (isSuperAdmin()) return true
  if (userStore.userInfo?.tenantId !== tenantId) return false
  if (isTenantAdmin()) return true
  return hasPermission('data:access')
}
```

**优势**:
- 租户隔离逻辑已封装,无需重复实现
- 代码更简洁,减少出错可能
- 自动处理超级管理员和租户管理员的特殊逻辑

## 常见问题

### 1. 权限检查不生效

**问题原因**:
- 用户 Store 未正确初始化
- 用户信息未加载或加载失败
- 权限数据不正确

**解决方案**:

```typescript
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasPermission } = useAuth()
const userStore = useUserStore()

// 1. 确保用户已登录
if (!userStore.token) {
  console.error('用户未登录')
  uni.navigateTo({ url: '/pages/login/index' })
}

// 2. 检查用户信息是否加载
if (!userStore.userInfo) {
  console.error('用户信息未加载')
  await userStore.getUserInfo()
}

// 3. 检查权限数据
console.log('用户权限:', userStore.permissions)
console.log('用户角色:', userStore.roles)

// 4. 执行权限检查
const canEdit = hasPermission('system:user:edit')
console.log('是否有编辑权限:', canEdit)
```

参考: src/composables/useAuth.ts:67-69

### 2. 超级管理员权限不生效

**问题原因**:
- 角色标识不匹配(默认为 `superadmin`)
- 用户角色列表中不包含超级管理员角色

**解决方案**:

```typescript
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { isSuperAdmin, hasPermission } = useAuth()
const userStore = useUserStore()

// 1. 检查用户角色列表
console.log('用户角色列表:', userStore.roles)

// 2. 检查是否包含超级管理员角色
if (!userStore.roles.includes('superadmin')) {
  console.error('用户不是超级管理员')
}

// 3. 如果使用自定义角色标识,传入正确的角色名
const isSuperAdminUser = isSuperAdmin('custom_super_admin')

// 4. 权限检查时也需要传入自定义角色标识
const canEdit = hasPermission('system:user:edit', 'custom_super_admin')
```

参考: src/composables/useAuth.ts:77-80

### 3. 租户权限隔离失效

**问题原因**:
- 未使用 `hasTenantPermission` 方法
- 租户 ID 获取错误
- 租户管理员角色标识不匹配

**解决方案**:

```typescript
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasTenantPermission, isSuperAdmin, isTenantAdmin } = useAuth()
const userStore = useUserStore()

// 1. 检查当前用户租户 ID
console.log('当前用户租户ID:', userStore.userInfo?.tenantId)

// 2. 检查是否为租户管理员
console.log('是否为租户管理员:', isTenantAdmin())
console.log('用户角色列表:', userStore.roles)

// 3. 使用 hasTenantPermission 检查权限
const targetTenantId = '123'
const canAccess = hasTenantPermission('data:access', targetTenantId)

// 4. 如果使用自定义租户管理员角色
const canAccessCustom = hasTenantPermission(
  'data:access',
  targetTenantId,
  'custom_super_admin',
  'custom_tenant_admin'
)

// 5. 调试租户权限逻辑
if (!canAccess) {
  console.log('租户权限检查失败')
  console.log('是否为超级管理员:', isSuperAdmin())
  console.log('目标租户ID:', targetTenantId)
  console.log('当前用户租户ID:', userStore.userInfo?.tenantId)
  console.log('租户ID是否匹配:', targetTenantId === userStore.userInfo?.tenantId)
  console.log('是否为租户管理员:', isTenantAdmin())
}
```

参考: src/composables/useAuth.ts:155-182

### 4. 路由过滤后子路由丢失

**问题原因**:
- 父路由无权限时,子路由也会被过滤
- 路由配置中权限定义不正确

**解决方案**:

```typescript
import { useAuth } from '@/composables/useAuth'

const { filterAuthorizedRoutes } = useAuth()

// 1. 检查父路由权限配置
const routes = [
  {
    path: '/pages/system',
    name: '系统管理',
    meta: {
      // ❌ 父路由定义了严格的权限,子路由可能全被过滤
      roles: ['admin']
    },
    children: [
      {
        path: '/pages/system/user',
        name: '用户管理',
        meta: {
          permissions: ['system:user:query']
        }
      }
    ]
  }
]

// 2. 解决方案: 父路由不定义权限,仅在子路由定义
const routesFixed = [
  {
    path: '/pages/system',
    name: '系统管理',
    // ✅ 父路由不定义权限
    children: [
      {
        path: '/pages/system/user',
        name: '用户管理',
        meta: {
          // ✅ 仅在子路由定义具体权限
          permissions: ['system:user:query']
        }
      },
      {
        path: '/pages/system/role',
        name: '角色管理',
        meta: {
          permissions: ['system:role:query']
        }
      }
    ]
  }
]

const authorizedRoutes = filterAuthorizedRoutes(routesFixed)
console.log('过滤后的路由:', authorizedRoutes)

// 3. 或者父路由使用宽松的权限条件
const routesAlternative = [
  {
    path: '/pages/system',
    name: '系统管理',
    meta: {
      // ✅ 使用 OR 逻辑,满足任一子路由权限即可访问父路由
      permissions: [
        'system:user:query',
        'system:role:query',
        'system:menu:query'
      ]
    },
    children: [
      {
        path: '/pages/system/user',
        name: '用户管理',
        meta: {
          permissions: ['system:user:query']
        }
      }
    ]
  }
]
```

参考: src/composables/useAuth.ts:318-334

### 5. 响应式状态不更新

**问题原因**:
- 解构响应式对象导致响应性丢失
- 直接使用 `.value` 赋值给普通变量

**解决方案**:

```vue
<template>
  <view class="user-status">
    <!-- ✅ 正确: 直接使用响应式状态 -->
    <text v-if="isLoggedIn">已登录</text>

    <!-- ❌ 错误: 使用普通变量,不会响应式更新 -->
    <text v-if="loggedIn">已登录</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn, hasPermission } = useAuth()

// ❌ 错误: 解构后赋值给普通变量,丢失响应性
const loggedIn = isLoggedIn.value

// ✅ 正确: 使用 computed 包装
const loggedInComputed = computed(() => isLoggedIn.value)

// ✅ 正确: 直接使用原始响应式状态
// 在模板中使用 isLoggedIn

// ✅ 正确: 在函数中访问最新值
const checkLogin = () => {
  if (isLoggedIn.value) {
    console.log('当前已登录')
  }
}
</script>
```

**最佳实践**:
- 在模板中直接使用 `useAuth()` 返回的响应式状态
- 需要组合逻辑时使用 `computed`
- 在函数中使用时访问 `.value` 获取最新值

参考: src/composables/useAuth.ts:67-69

---

通过合理使用 `useAuth` 组合式函数,可以轻松实现复杂的权限管理需求,构建安全可靠的应用系统。

参考: src/composables/useAuth.ts:1-355
