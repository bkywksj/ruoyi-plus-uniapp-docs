# useAuth 认证与授权

## 介绍

`useAuth` 是一个用于用户认证与授权管理的组合式函数,提供完整的权限检查、角色校验和路由访问控制功能。该 Composable 封装了系统中所有认证相关的业务逻辑,通过集成用户状态管理简化了权限操作,支持多租户场景下的细粒度权限控制。

在现代企业级应用中,认证与授权是核心安全机制。`useAuth` 通过统一的 API 接口提供了登录状态检查、管理员类型判断、权限字符串验证、角色校验、租户权限隔离、路由访问控制等完整功能,让开发者可以轻松实现基于角色的访问控制(RBAC)和基于权限的访问控制(PBAC)。

**核心特性:**

- **登录状态管理** - 实时监测用户登录状态,自动关联 Token 有效性
- **多级管理员支持** - 区分超级管理员(superadmin)和租户管理员(admin),实现分级权限管理
- **灵活权限检查** - 支持单个权限、多权限 OR 逻辑、多权限 AND 逻辑三种检查模式
- **角色校验系统** - 提供单角色、多角色 OR、多角色 AND 的完整角色检查方案
- **租户权限隔离** - 在多租户架构下实现租户级别的权限隔离和检查
- **路由访问控制** - 基于路由 meta 信息自动过滤用户可访问的路由
- **通配符权限** - 支持 `*:*:*` 通配符权限,简化超级用户权限配置
- **权限豁免机制** - 超级管理员自动豁免所有权限和角色检查
- **类型安全** - 完整的 TypeScript 类型定义,提供智能代码提示
- **响应式设计** - 基于 Pinia Store,用户权限变化自动响应到所有检查点
- **性能优化** - 使用计算属性缓存登录状态,避免重复计算
- **易于集成** - 简洁的 API 设计,可在组件、路由守卫、指令中无缝使用

## 基本用法

### 检查登录状态

检查用户是否已登录系统,基于 Token 的存在性判断。

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

**使用说明:**
- `isLoggedIn` 是一个计算属性,自动响应 Token 变化
- 基于 `userStore.token` 的存在性和长度判断登录状态
- Token 为空字符串或不存在时返回 `false`
- 适用于页面级别的登录状态判断和条件渲染

### 检查超级管理员

判断当前用户是否为超级管理员,支持自定义角色标识。

```vue
<template>
  <view class="admin-panel">
    <view v-if="isSuperAdmin()" class="super-admin-tools">
      <text class="title">超级管理员控制面板</text>
      <wd-button type="danger" @click="handleSystemConfig">系统配置</wd-button>
      <wd-button type="danger" @click="handleTenantManage">租户管理</wd-button>
      <wd-button type="danger" @click="handleGlobalSettings">全局设置</wd-button>
    </view>
    <view v-else class="normal-user">
      <text>您没有超级管理员权限</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin } = useAuth()

const handleSystemConfig = () => {
  uni.navigateTo({ url: '/pages/admin/system-config' })
}

const handleTenantManage = () => {
  uni.navigateTo({ url: '/pages/admin/tenant-manage' })
}

const handleGlobalSettings = () => {
  uni.navigateTo({ url: '/pages/admin/global-settings' })
}
</script>
```

**使用说明:**
- `isSuperAdmin()` 不传参数时检查默认角色 `superadmin`
- 可传入自定义角色标识: `isSuperAdmin('customsuperadmin')`
- 超级管理员拥有系统所有权限,不受权限和角色限制
- 基于 `userStore.roles` 数组进行角色匹配
- 返回布尔值,可直接用于 `v-if` 条件判断

### 检查租户管理员

判断当前用户是否为租户管理员,适用于多租户场景。

```vue
<template>
  <view class="tenant-panel">
    <view v-if="isTenantAdmin()" class="tenant-admin-tools">
      <text class="title">租户管理面板</text>
      <wd-button type="primary" @click="handleUserManage">用户管理</wd-button>
      <wd-button type="primary" @click="handleRoleManage">角色管理</wd-button>
      <wd-button type="primary" @click="handleTenantSettings">租户设置</wd-button>
    </view>
    <view v-else-if="isAnyAdmin()" class="super-admin-notice">
      <text>您是超级管理员,拥有更高权限</text>
    </view>
    <view v-else class="normal-user">
      <text>您没有租户管理员权限</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isTenantAdmin, isAnyAdmin } = useAuth()

const handleUserManage = () => {
  uni.navigateTo({ url: '/pages/tenant/user-manage' })
}

const handleRoleManage = () => {
  uni.navigateTo({ url: '/pages/tenant/role-manage' })
}

const handleTenantSettings = () => {
  uni.navigateTo({ url: '/pages/tenant/settings' })
}
</script>
```

**使用说明:**
- `isTenantAdmin()` 不传参数时检查默认角色 `admin`
- 可传入自定义角色标识: `isTenantAdmin('tenant_admin')`
- 租户管理员仅在其所属租户内拥有管理权限
- `isAnyAdmin()` 可同时检查超级管理员和租户管理员
- 超级管理员优先级高于租户管理员

### 单个权限检查

检查用户是否拥有指定权限,适用于按钮级别的权限控制。

```vue
<template>
  <view class="user-management">
    <view class="toolbar">
      <wd-button
        v-if="canAddUser"
        type="primary"
        @click="handleAddUser"
      >
        新增用户
      </wd-button>
      <wd-button
        v-if="canEditUser"
        type="success"
        @click="handleEditUser"
      >
        编辑用户
      </wd-button>
      <wd-button
        v-if="canDeleteUser"
        type="danger"
        @click="handleDeleteUser"
      >
        删除用户
      </wd-button>
      <wd-button
        v-if="canExportUser"
        type="info"
        @click="handleExportUser"
      >
        导出数据
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
const canExportUser = computed(() => hasPermission('system:user:export'))

const handleAddUser = () => {
  uni.navigateTo({ url: '/pages/system/user/add' })
}

const handleEditUser = () => {
  // 编辑用户逻辑
  console.log('编辑用户')
}

const handleDeleteUser = () => {
  // 删除用户逻辑
  console.log('删除用户')
}

const handleExportUser = () => {
  // 导出用户逻辑
  console.log('导出用户')
}
</script>
```

**使用说明:**
- 权限标识格式为 `模块:功能:操作`,如 `system:user:add`
- 超级管理员自动通过所有权限检查
- 拥有 `*:*:*` 通配符权限的用户自动通过检查
- 权限参数为空或未定义时会输出警告并返回 `false`
- 建议使用计算属性包装权限检查,实现响应式更新

### 多个权限检查(OR 逻辑)

检查用户是否拥有多个权限中的任意一个,满足其一即可。

```vue
<template>
  <view class="data-management">
    <view class="toolbar">
      <!-- 拥有新增或编辑权限即可显示 -->
      <wd-button
        v-if="canManageData"
        type="primary"
        @click="handleManageData"
      >
        数据管理
      </wd-button>

      <!-- 拥有导入或导出权限即可显示 -->
      <wd-button
        v-if="canTransferData"
        type="success"
        @click="handleTransferData"
      >
        数据传输
      </wd-button>

      <!-- 拥有查询或列表权限即可显示 -->
      <wd-button
        v-if="canViewData"
        type="info"
        @click="handleViewData"
      >
        查看数据
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 拥有新增或编辑权限
const canManageData = computed(() =>
  hasPermission(['system:data:add', 'system:data:edit'])
)

// 拥有导入或导出权限
const canTransferData = computed(() =>
  hasPermission(['system:data:import', 'system:data:export'])
)

// 拥有查询或列表权限
const canViewData = computed(() =>
  hasPermission(['system:data:query', 'system:data:list'])
)

const handleManageData = () => {
  console.log('数据管理')
}

const handleTransferData = () => {
  console.log('数据传输')
}

const handleViewData = () => {
  console.log('查看数据')
}
</script>
```

**使用说明:**
- 传入权限数组时,只要拥有数组中任一权限即返回 `true`
- 使用 `Array.some()` 实现 OR 逻辑判断
- 适用于多个操作共用一个按钮或功能入口的场景
- 权限数组为空时返回 `false` 并输出警告
- 超级管理员和通配符权限用户自动通过检查

### 多个权限检查(AND 逻辑)

检查用户是否同时拥有多个权限,必须全部满足。

```vue
<template>
  <view class="advanced-operation">
    <view class="toolbar">
      <!-- 必须同时拥有新增和编辑权限 -->
      <wd-button
        v-if="canFullManage"
        type="primary"
        @click="handleFullManage"
      >
        完整管理
      </wd-button>

      <!-- 必须同时拥有导入、导出和删除权限 -->
      <wd-button
        v-if="canDataMigration"
        type="warning"
        @click="handleDataMigration"
      >
        数据迁移
      </wd-button>

      <!-- 必须同时拥有查询、列表和导出权限 -->
      <wd-button
        v-if="canFullReport"
        type="info"
        @click="handleFullReport"
      >
        完整报表
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasAllPermissions } = useAuth()

// 必须同时拥有新增和编辑权限
const canFullManage = computed(() =>
  hasAllPermissions(['system:data:add', 'system:data:edit'])
)

// 必须同时拥有导入、导出和删除权限
const canDataMigration = computed(() =>
  hasAllPermissions([
    'system:data:import',
    'system:data:export',
    'system:data:remove'
  ])
)

// 必须同时拥有查询、列表和导出权限
const canFullReport = computed(() =>
  hasAllPermissions([
    'system:data:query',
    'system:data:list',
    'system:data:export'
  ])
)

const handleFullManage = () => {
  console.log('完整管理')
}

const handleDataMigration = () => {
  console.log('数据迁移')
}

const handleFullReport = () => {
  console.log('完整报表')
}
</script>
```

**使用说明:**
- `hasAllPermissions()` 要求用户必须拥有数组中的所有权限
- 使用 `Array.every()` 实现 AND 逻辑判断
- 适用于需要多个权限组合的高级功能
- 超级管理员和通配符权限用户自动通过检查
- 任一权限缺失即返回 `false`

### 单个角色检查

检查用户是否拥有指定角色,适用于基于角色的访问控制。

```vue
<template>
  <view class="role-based-content">
    <view v-if="isEditor" class="editor-panel">
      <text>编辑器面板</text>
      <wd-button @click="handleEdit">开始编辑</wd-button>
    </view>

    <view v-if="isReviewer" class="reviewer-panel">
      <text>审核员面板</text>
      <wd-button @click="handleReview">开始审核</wd-button>
    </view>

    <view v-if="isPublisher" class="publisher-panel">
      <text>发布员面板</text>
      <wd-button @click="handlePublish">发布内容</wd-button>
    </view>

    <view v-if="!hasAnyRole" class="no-role">
      <text>您没有任何角色权限</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole } = useAuth()

// 检查各个角色
const isEditor = computed(() => hasRole('editor'))
const isReviewer = computed(() => hasRole('reviewer'))
const isPublisher = computed(() => hasRole('publisher'))

const hasAnyRole = computed(() =>
  isEditor.value || isReviewer.value || isPublisher.value
)

const handleEdit = () => {
  console.log('开始编辑')
}

const handleReview = () => {
  console.log('开始审核')
}

const handlePublish = () => {
  console.log('发布内容')
}
</script>
```

**使用说明:**
- 角色标识通常为字符串,如 `editor`、`admin`、`user`
- 超级管理员默认通过所有角色检查
- 角色参数为空或未定义时输出警告并返回 `false`
- 基于 `userStore.roles` 数组进行角色匹配
- 建议使用计算属性缓存角色检查结果

### 多个角色检查(OR 逻辑)

检查用户是否拥有多个角色中的任意一个。

```vue
<template>
  <view class="content-management">
    <view class="toolbar">
      <!-- 编辑员或审核员可见 -->
      <wd-button
        v-if="canManageContent"
        type="primary"
        @click="handleManageContent"
      >
        内容管理
      </wd-button>

      <!-- 审核员或发布员可见 -->
      <wd-button
        v-if="canPublishContent"
        type="success"
        @click="handlePublishContent"
      >
        发布内容
      </wd-button>

      <!-- 编辑员、审核员或发布员可见 -->
      <wd-button
        v-if="canAccessWorkflow"
        type="info"
        @click="handleAccessWorkflow"
      >
        工作流程
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole } = useAuth()

// 编辑员或审核员
const canManageContent = computed(() =>
  hasRole(['editor', 'reviewer'])
)

// 审核员或发布员
const canPublishContent = computed(() =>
  hasRole(['reviewer', 'publisher'])
)

// 编辑员、审核员或发布员
const canAccessWorkflow = computed(() =>
  hasRole(['editor', 'reviewer', 'publisher'])
)

const handleManageContent = () => {
  console.log('内容管理')
}

const handlePublishContent = () => {
  console.log('发布内容')
}

const handleAccessWorkflow = () => {
  console.log('工作流程')
}
</script>
```

**使用说明:**
- 传入角色数组时,只要拥有数组中任一角色即返回 `true`
- 使用 `Array.some()` 实现 OR 逻辑判断
- 适用于多个角色共享相同功能的场景
- 超级管理员自动通过所有角色检查
- 角色数组为空时返回 `false` 并输出警告

### 多个角色检查(AND 逻辑)

检查用户是否同时拥有多个角色,必须全部满足。

```vue
<template>
  <view class="advanced-role-panel">
    <view class="toolbar">
      <!-- 必须同时拥有编辑员和审核员角色 -->
      <wd-button
        v-if="canSelfReview"
        type="primary"
        @click="handleSelfReview"
      >
        自审功能
      </wd-button>

      <!-- 必须同时拥有审核员和发布员角色 -->
      <wd-button
        v-if="canQuickPublish"
        type="success"
        @click="handleQuickPublish"
      >
        快速发布
      </wd-button>

      <!-- 必须同时拥有编辑员、审核员和发布员角色 -->
      <wd-button
        v-if="canFullWorkflow"
        type="warning"
        @click="handleFullWorkflow"
      >
        全流程操作
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasAllRoles } = useAuth()

// 必须同时拥有编辑员和审核员角色
const canSelfReview = computed(() =>
  hasAllRoles(['editor', 'reviewer'])
)

// 必须同时拥有审核员和发布员角色
const canQuickPublish = computed(() =>
  hasAllRoles(['reviewer', 'publisher'])
)

// 必须同时拥有编辑员、审核员和发布员角色
const canFullWorkflow = computed(() =>
  hasAllRoles(['editor', 'reviewer', 'publisher'])
)

const handleSelfReview = () => {
  console.log('自审功能')
}

const handleQuickPublish = () => {
  console.log('快速发布')
}

const handleFullWorkflow = () => {
  console.log('全流程操作')
}
</script>
```

**使用说明:**
- `hasAllRoles()` 要求用户必须拥有数组中的所有角色
- 使用 `Array.every()` 实现 AND 逻辑判断
- 适用于需要多角色组合的复杂权限场景
- 超级管理员自动通过所有角色检查
- 任一角色缺失即返回 `false`

### 租户权限检查

在多租户场景下检查租户级别的权限,实现租户隔离。

```vue
<template>
  <view class="tenant-data-panel">
    <view class="toolbar">
      <!-- 当前租户的数据管理权限 -->
      <wd-button
        v-if="canManageCurrentTenant"
        type="primary"
        @click="handleManageCurrentTenant"
      >
        管理本租户数据
      </wd-button>

      <!-- 租户管理员可管理本租户所有数据 -->
      <view v-if="isTenantAdminRole" class="admin-notice">
        <text>您是租户管理员,拥有本租户所有权限</text>
      </view>

      <!-- 超级管理员可管理所有租户数据 -->
      <view v-if="isSuperAdminRole" class="super-notice">
        <text>您是超级管理员,可管理所有租户</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasTenantPermission, isSuperAdmin, isTenantAdmin } = useAuth()
const userStore = useUserStore()

// 检查当前租户的数据管理权限
const canManageCurrentTenant = computed(() =>
  hasTenantPermission('tenant:data:manage')
)

// 检查是否为租户管理员
const isTenantAdminRole = computed(() => isTenantAdmin())

// 检查是否为超级管理员
const isSuperAdminRole = computed(() => isSuperAdmin())

const handleManageCurrentTenant = () => {
  const tenantId = userStore.userInfo?.tenantId
  console.log('管理租户数据:', tenantId)
}
</script>
```

**使用说明:**
- `hasTenantPermission()` 第一个参数为权限标识,第二个参数为租户 ID(可选)
- 不传租户 ID 时默认使用当前用户所属租户
- 超级管理员拥有所有租户的所有权限
- 租户管理员仅在自己的租户内拥有所有权限
- 普通用户仅能操作自己所属租户的数据
- 跨租户操作会被自动拒绝,返回 `false`

### 路由访问控制

基于路由配置的权限信息过滤可访问的路由。

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

// 定义所有路由
const allRoutes = [
  {
    path: '/pages/system/user',
    title: '用户管理',
    meta: {
      permissions: ['system:user:list']
    }
  },
  {
    path: '/pages/system/role',
    title: '角色管理',
    meta: {
      permissions: ['system:role:list']
    }
  },
  {
    path: '/pages/system/menu',
    title: '菜单管理',
    meta: {
      roles: ['admin', 'superadmin']
    }
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

**使用说明:**
- `canAccessRoute()` 检查单个路由是否可访问
- `filterAuthorizedRoutes()` 批量过滤路由数组
- 路由的 `meta.permissions` 定义所需权限
- 路由的 `meta.roles` 定义所需角色
- 同时定义权限和角色时,两者都必须满足
- 没有 `meta` 信息的路由默认可访问
- 超级管理员可访问所有路由
- 支持子路由递归过滤

## 高级用法

### 自定义管理员角色

支持自定义超级管理员和租户管理员的角色标识。

```vue
<template>
  <view class="custom-admin-panel">
    <view v-if="isCustomSuperAdmin" class="super-panel">
      <text>自定义超级管理员面板</text>
    </view>

    <view v-if="isCustomTenantAdmin" class="tenant-panel">
      <text>自定义租户管理员面板</text>
    </view>

    <view v-if="isAnyCustomAdmin" class="admin-panel">
      <text>通用管理面板</text>
    </view>
  </view>
</template>

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

**技术实现:**
- 所有管理员相关方法都支持自定义角色标识参数
- `isSuperAdmin(roleToCheck)` 可传入自定义超级管理员角色
- `isTenantAdmin(roleToCheck)` 可传入自定义租户管理员角色
- `isAnyAdmin(superAdminRole, tenantAdminRole)` 可传入两种自定义角色
- 不传参数时使用默认值 `superadmin` 和 `admin`
- 适用于需要自定义角色体系的场景

### 权限豁免配置

为特定操作配置权限豁免,允许指定角色绕过权限检查。

```vue
<template>
  <view class="permission-exempt-panel">
    <wd-button
      v-if="canOperateWithExempt"
      type="primary"
      @click="handleOperation"
    >
      特权操作
    </wd-button>
  </view>
</template>

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

const handleOperation = () => {
  console.log('执行特权操作')
}
</script>
```

**技术实现:**
- `hasPermission()` 和 `hasRole()` 的第二个参数为豁免角色标识
- 拥有豁免角色的用户自动通过权限和角色检查
- 不传豁免角色参数时使用默认超级管理员 `superadmin`
- 豁免机制在权限检查的最开始就会生效
- 适用于需要特殊权限控制的高级场景

### 组合权限和角色检查

同时检查权限和角色,实现更精细的访问控制。

```vue
<template>
  <view class="combined-check-panel">
    <wd-button
      v-if="canAdvancedOperation"
      type="primary"
      @click="handleAdvancedOperation"
    >
      高级操作
    </wd-button>

    <wd-button
      v-if="canSensitiveOperation"
      type="danger"
      @click="handleSensitiveOperation"
    >
      敏感操作
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, hasAllPermissions, hasAllRoles } = useAuth()

// 同时检查权限和角色(OR 逻辑)
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

const handleAdvancedOperation = () => {
  console.log('执行高级操作')
}

const handleSensitiveOperation = () => {
  console.log('执行敏感操作')
}
</script>
```

**技术实现:**
- 通过逻辑运算符组合多个权限和角色检查
- 使用 `&&` 实现所有条件都必须满足
- 使用 `||` 实现满足任一条件即可
- 可以任意组合 OR 和 AND 逻辑
- 建议封装复杂的权限检查逻辑到计算属性中

### 在路由守卫中使用

在路由导航守卫中进行权限检查,实现页面级别的访问控制。

```typescript
// router/guards.ts
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

/**
 * 全局路由守卫
 */
export const setupRouterGuard = () => {
  const { canAccessRoute, isLoggedIn } = useAuth()
  const userStore = useUserStore()

  // 路由前置守卫
  uni.addInterceptor('navigateTo', {
    invoke(args: any) {
      const url = args.url
      const route = findRouteByUrl(url)

      // 检查是否需要登录
      if (route?.meta?.requireAuth && !isLoggedIn.value) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        uni.navigateTo({ url: '/pages/login/index' })
        return false
      }

      // 检查路由访问权限
      if (route && !canAccessRoute(route)) {
        uni.showToast({
          title: '无权限访问',
          icon: 'none'
        })
        return false
      }

      return true
    }
  })
}

/**
 * 根据 URL 查找路由配置
 */
const findRouteByUrl = (url: string) => {
  // 路由配置查找逻辑
  const routes = [
    {
      path: '/pages/system/user',
      meta: {
        requireAuth: true,
        permissions: ['system:user:list']
      }
    },
    // ... 更多路由
  ]

  return routes.find(route => url.includes(route.path))
}
```

**技术实现:**
- 在 `uni.addInterceptor` 中使用 `useAuth` 进行权限检查
- `isLoggedIn` 检查用户登录状态
- `canAccessRoute()` 检查路由访问权限
- 权限不足时显示提示并阻止导航
- 未登录时重定向到登录页
- 适用于全局路由拦截场景

### 在自定义指令中使用

创建自定义权限指令,简化模板中的权限判断。

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
    const permission = binding.value

    if (!hasPermission(permission)) {
      // 隐藏元素
      el.style.display = 'none'

      // 或者移除元素
      // el.parentNode?.removeChild(el)
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
    const role = binding.value

    if (!hasRole(role)) {
      el.style.display = 'none'
    }
  }
}
```

在组件中使用指令:

```vue
<template>
  <view class="directive-demo">
    <!-- 使用权限指令 -->
    <wd-button v-permission="'system:user:add'" type="primary">
      新增用户
    </wd-button>

    <!-- 使用角色指令 -->
    <wd-button v-role="'admin'" type="success">
      管理员功能
    </wd-button>

    <!-- 多个权限(OR) -->
    <wd-button v-permission="['system:user:add', 'system:user:edit']">
      用户管理
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
// 注册指令
import { vPermission, vRole } from '@/directives/permission'
</script>
```

**技术实现:**
- 自定义指令在元素挂载时检查权限
- 无权限时隐藏或移除 DOM 元素
- 支持单个和多个权限/角色
- 比 `v-if` 更简洁,减少模板代码
- 注意:在 UniApp 中使用自定义指令需要配置编译选项

### 动态权限更新

处理用户权限动态变化的场景,如切换租户、刷新权限等。

```vue
<template>
  <view class="dynamic-permission-panel">
    <view class="user-info">
      <text>当前租户: {{ currentTenantName }}</text>
      <text>当前角色: {{ currentRoles }}</text>
    </view>

    <view class="toolbar">
      <wd-button
        v-if="canManageUser"
        type="primary"
        @click="handleManageUser"
      >
        用户管理
      </wd-button>

      <wd-button type="info" @click="handleSwitchTenant">
        切换租户
      </wd-button>

      <wd-button type="success" @click="handleRefreshPermission">
        刷新权限
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasPermission, isLoggedIn } = useAuth()
const userStore = useUserStore()

// 响应式权限检查
const canManageUser = computed(() =>
  hasPermission('system:user:manage')
)

const currentTenantName = computed(() =>
  userStore.userInfo?.tenantName || '未知'
)

const currentRoles = computed(() =>
  userStore.roles.join(', ')
)

const handleManageUser = () => {
  console.log('用户管理')
}

const handleSwitchTenant = async () => {
  // 切换租户
  await userStore.switchTenant('new-tenant-id')

  // 权限会自动更新,因为 hasPermission 是响应式的
  uni.showToast({
    title: '租户切换成功',
    icon: 'success'
  })
}

const handleRefreshPermission = async () => {
  // 刷新用户权限
  await userStore.refreshUserInfo()

  uni.showToast({
    title: '权限刷新成功',
    icon: 'success'
  })
}
</script>
```

**技术实现:**
- 所有权限检查都基于 Pinia Store 的响应式数据
- 权限或角色变化时,计算属性自动重新计算
- 使用 `computed()` 包装权限检查以实现响应式
- 切换租户或刷新权限后,UI 自动更新
- 无需手动刷新或重新检查权限

### 权限缓存优化

对高频权限检查进行缓存优化,提升性能。

```vue
<template>
  <view class="permission-cache-demo">
    <view
      v-for="item in dataList"
      :key="item.id"
      class="data-item"
    >
      <text>{{ item.name }}</text>
      <wd-button
        v-if="permissionCache.canEdit"
        size="small"
        @click="handleEdit(item)"
      >
        编辑
      </wd-button>
      <wd-button
        v-if="permissionCache.canDelete"
        size="small"
        type="danger"
        @click="handleDelete(item)"
      >
        删除
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 数据列表
const dataList = ref([
  { id: 1, name: '数据1' },
  { id: 2, name: '数据2' },
  { id: 3, name: '数据3' },
  // ... 更多数据
])

// 权限缓存
const permissionCache = computed(() => ({
  canEdit: hasPermission('system:data:edit'),
  canDelete: hasPermission('system:data:remove'),
  canExport: hasPermission('system:data:export'),
  canImport: hasPermission('system:data:import'),
}))

const handleEdit = (item: any) => {
  console.log('编辑:', item.name)
}

const handleDelete = (item: any) => {
  console.log('删除:', item.name)
}
</script>
```

**性能优化:**
- 使用单个计算属性缓存所有权限检查结果
- 避免在循环中重复调用权限检查方法
- 计算属性会自动缓存,只在依赖变化时重新计算
- 减少不必要的权限检查次数
- 对于大数据列表场景性能提升明显

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
| isSuperAdmin | `(roleToCheck?: string) => boolean` | 检查是否为超级管理员 |
| isTenantAdmin | `(roleToCheck?: string) => boolean` | 检查是否为租户管理员 |
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

#### isLoggedIn

用户登录状态的计算属性。

```typescript
const isLoggedIn: ComputedRef<boolean>
```

**返回值:**
- `boolean` - 用户是否已登录

**说明:**
- 基于 `userStore.token` 的存在性和长度判断
- Token 为空字符串或不存在时返回 `false`
- 自动响应 Token 变化

**示例:**
```typescript
const { isLoggedIn } = useAuth()

if (isLoggedIn.value) {
  console.log('用户已登录')
} else {
  console.log('用户未登录')
}
```

#### isSuperAdmin

检查当前用户是否为超级管理员。

```typescript
function isSuperAdmin(roleToCheck?: string): boolean
```

**参数:**
- `roleToCheck?` - 可选,要检查的超级管理员角色标识,默认为 `'superadmin'`

**返回值:**
- `boolean` - 是否为超级管理员

**说明:**
- 默认检查角色 `superadmin`
- 支持自定义超级管理员角色标识
- 基于 `userStore.roles` 数组进行匹配
- 超级管理员拥有所有权限

**示例:**
```typescript
const { isSuperAdmin } = useAuth()

// 检查默认超级管理员角色
if (isSuperAdmin()) {
  console.log('是超级管理员')
}

// 检查自定义超级管理员角色
if (isSuperAdmin('system_admin')) {
  console.log('是系统管理员')
}
```

#### isTenantAdmin

检查当前用户是否为租户管理员。

```typescript
function isTenantAdmin(roleToCheck?: string): boolean
```

**参数:**
- `roleToCheck?` - 可选,要检查的租户管理员角色标识,默认为 `'admin'`

**返回值:**
- `boolean` - 是否为租户管理员

**说明:**
- 默认检查角色 `admin`
- 支持自定义租户管理员角色标识
- 租户管理员仅在其所属租户内拥有管理权限
- 基于 `userStore.roles` 数组进行匹配

**示例:**
```typescript
const { isTenantAdmin } = useAuth()

// 检查默认租户管理员角色
if (isTenantAdmin()) {
  console.log('是租户管理员')
}

// 检查自定义租户管理员角色
if (isTenantAdmin('tenant_manager')) {
  console.log('是租户管理器')
}
```

#### isAnyAdmin

检查当前用户是否为任意级别的管理员。

```typescript
function isAnyAdmin(
  superAdminRole?: string,
  tenantAdminRole?: string
): boolean
```

**参数:**
- `superAdminRole?` - 可选,超级管理员角色标识,默认为 `'superadmin'`
- `tenantAdminRole?` - 可选,租户管理员角色标识,默认为 `'admin'`

**返回值:**
- `boolean` - 是否为任意级别的管理员

**说明:**
- 同时检查超级管理员和租户管理员
- 满足其一即返回 `true`
- 支持自定义两种管理员的角色标识

**示例:**
```typescript
const { isAnyAdmin } = useAuth()

// 检查默认管理员角色
if (isAnyAdmin()) {
  console.log('是管理员(超级或租户)')
}

// 检查自定义管理员角色
if (isAnyAdmin('system_admin', 'tenant_manager')) {
  console.log('是自定义管理员')
}
```

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

**返回值:**
- `boolean` - 是否拥有权限

**说明:**
- 单个权限时,检查是否拥有该权限
- 多个权限时,只要拥有其中一个即返回 `true` (OR 逻辑)
- 超级管理员自动通过所有权限检查
- 拥有 `*:*:*` 通配符权限的用户自动通过
- 权限参数为空时输出警告并返回 `false`

**示例:**
```typescript
const { hasPermission } = useAuth()

// 单个权限
const canAdd = hasPermission('system:user:add')

// 多个权限(OR 逻辑)
const canManage = hasPermission(['system:user:add', 'system:user:edit'])

// 自定义超级管理员豁免
const canDelete = hasPermission('system:user:remove', 'system_admin')
```

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

**返回值:**
- `boolean` - 是否在指定租户内拥有权限

**说明:**
- 超级管理员拥有所有租户的所有权限
- 租户管理员仅在自己的租户内拥有所有权限
- 普通用户仅能操作自己所属租户的数据
- 跨租户操作会被自动拒绝

**示例:**
```typescript
const { hasTenantPermission } = useAuth()

// 检查当前租户权限
const canManageCurrentTenant = hasTenantPermission('tenant:data:manage')

// 检查指定租户权限
const canManageSpecificTenant = hasTenantPermission(
  'tenant:data:manage',
  'tenant-123'
)

// 自定义管理员角色
const canManageWithCustomRole = hasTenantPermission(
  'tenant:data:manage',
  undefined,
  'system_admin',
  'tenant_manager'
)
```

#### hasRole

检查是否拥有指定角色,支持 OR 逻辑。

```typescript
function hasRole(
  role: string | string[],
  superAdminRole?: string
): boolean
```

**参数:**
- `role` - 角色标识字符串或数组
- `superAdminRole?` - 可选,超级管理员角色标识,用于角色豁免

**返回值:**
- `boolean` - 是否拥有角色

**说明:**
- 单个角色时,检查是否拥有该角色
- 多个角色时,只要拥有其中一个即返回 `true` (OR 逻辑)
- 超级管理员自动通过所有角色检查
- 角色参数为空时输出警告并返回 `false`

**示例:**
```typescript
const { hasRole } = useAuth()

// 单个角色
const isEditor = hasRole('editor')

// 多个角色(OR 逻辑)
const canManage = hasRole(['editor', 'reviewer'])

// 自定义超级管理员豁免
const hasSpecialRole = hasRole('special_role', 'system_admin')
```

#### hasAllPermissions

检查是否拥有所有指定权限,AND 逻辑。

```typescript
function hasAllPermissions(
  permissions: string[],
  superAdminRole?: string
): boolean
```

**参数:**
- `permissions` - 权限标识数组
- `superAdminRole?` - 可选,超级管理员角色标识

**返回值:**
- `boolean` - 是否拥有所有权限

**说明:**
- 必须拥有数组中的所有权限才返回 `true`
- 使用 `Array.every()` 实现 AND 逻辑
- 超级管理员和通配符权限用户自动通过
- 任一权限缺失即返回 `false`

**示例:**
```typescript
const { hasAllPermissions } = useAuth()

// 必须同时拥有新增和编辑权限
const canFullManage = hasAllPermissions([
  'system:user:add',
  'system:user:edit'
])

// 必须拥有三个权限
const canDataMigration = hasAllPermissions([
  'system:data:import',
  'system:data:export',
  'system:data:remove'
])
```

#### hasAllRoles

检查是否拥有所有指定角色,AND 逻辑。

```typescript
function hasAllRoles(
  roles: string[],
  superAdminRole?: string
): boolean
```

**参数:**
- `roles` - 角色标识数组
- `superAdminRole?` - 可选,超级管理员角色标识

**返回值:**
- `boolean` - 是否拥有所有角色

**说明:**
- 必须拥有数组中的所有角色才返回 `true`
- 使用 `Array.every()` 实现 AND 逻辑
- 超级管理员自动通过
- 任一角色缺失即返回 `false`

**示例:**
```typescript
const { hasAllRoles } = useAuth()

// 必须同时拥有编辑员和审核员角色
const canSelfReview = hasAllRoles(['editor', 'reviewer'])

// 必须拥有三个角色
const canFullWorkflow = hasAllRoles([
  'editor',
  'reviewer',
  'publisher'
])
```

#### canAccessRoute

检查是否有权限访问指定路由。

```typescript
function canAccessRoute(
  route: any,
  superAdminRole?: string
): boolean
```

**参数:**
- `route` - 路由对象,包含 `meta` 信息
- `superAdminRole?` - 可选,超级管理员角色标识

**返回值:**
- `boolean` - 是否有权限访问

**说明:**
- 根据路由的 `meta.roles` 和 `meta.permissions` 检查权限
- 没有 `meta` 或权限要求的路由默认可访问
- 超级管理员可访问任何路由
- 同时定义角色和权限时,两者都必须满足

**示例:**
```typescript
const { canAccessRoute } = useAuth()

const route = {
  path: '/pages/system/user',
  meta: {
    roles: ['admin'],
    permissions: ['system:user:list']
  }
}

if (canAccessRoute(route)) {
  console.log('可以访问该路由')
}
```

#### filterAuthorizedRoutes

过滤出有权限访问的路由数组。

```typescript
function filterAuthorizedRoutes(
  routes: any[],
  superAdminRole?: string
): any[]
```

**参数:**
- `routes` - 路由对象数组
- `superAdminRole?` - 可选,超级管理员角色标识

**返回值:**
- `any[]` - 过滤后的路由数组

**说明:**
- 递归过滤路由及其子路由
- 使用 `canAccessRoute()` 检查每个路由
- 自动处理子路由的递归过滤
- 超级管理员可访问所有路由

**示例:**
```typescript
const { filterAuthorizedRoutes } = useAuth()

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
  }
]

const authorizedRoutes = filterAuthorizedRoutes(allRoutes)
console.log('有权限访问的路由:', authorizedRoutes)
```

## 常量定义

### 角色常量

```typescript
// 超级管理员角色标识
const SUPER_ADMIN = 'superadmin'

// 租户管理员角色标识
const TENANT_ADMIN = 'admin'
```

### 权限常量

```typescript
// 通配符权限标识
const ALL_PERMISSION = '*:*:*'
```

**说明:**
- `SUPER_ADMIN`: 超级管理员的默认角色标识
- `TENANT_ADMIN`: 租户管理员的默认角色标识
- `ALL_PERMISSION`: 通配符权限,拥有此权限的用户自动通过所有权限检查

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

6. 返回检查结果
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

6. 返回检查结果
```

## 最佳实践

### 1. 使用计算属性缓存权限检查

在模板中频繁使用的权限检查应该使用计算属性缓存。

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// ✅ 推荐: 使用计算属性
const canAdd = computed(() => hasPermission('system:user:add'))
const canEdit = computed(() => hasPermission('system:user:edit'))
const canDelete = computed(() => hasPermission('system:user:remove'))
</script>

<template>
  <!-- ✅ 推荐 -->
  <wd-button v-if="canAdd">新增</wd-button>

  <!-- ❌ 不推荐: 直接在模板中调用 -->
  <wd-button v-if="hasPermission('system:user:add')">新增</wd-button>
</template>
```

**原因:**
- 计算属性会自动缓存结果
- 避免每次渲染都重新计算
- 提升性能,特别是在大型列表中

### 2. 集中管理权限和角色常量

将权限和角色标识集中定义在常量文件中。

```typescript
// constants/permission.ts
/**
 * 系统权限常量
 */
export const PERMISSIONS = {
  // 用户管理
  USER: {
    LIST: 'system:user:list',
    ADD: 'system:user:add',
    EDIT: 'system:user:edit',
    REMOVE: 'system:user:remove',
    EXPORT: 'system:user:export',
  },

  // 角色管理
  ROLE: {
    LIST: 'system:role:list',
    ADD: 'system:role:add',
    EDIT: 'system:role:edit',
    REMOVE: 'system:role:remove',
  },

  // 菜单管理
  MENU: {
    LIST: 'system:menu:list',
    ADD: 'system:menu:add',
    EDIT: 'system:menu:edit',
    REMOVE: 'system:menu:remove',
  },
} as const

/**
 * 系统角色常量
 */
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  TENANT_ADMIN: 'admin',
  EDITOR: 'editor',
  REVIEWER: 'reviewer',
  PUBLISHER: 'publisher',
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

// ❌ 不推荐: 硬编码字符串
const canAddUser2 = computed(() => hasPermission('system:user:add'))
</script>
```

**优势:**
- 避免拼写错误
- 便于维护和重构
- 提供类型提示
- 统一权限标识

### 3. 封装业务权限逻辑

将复杂的业务权限逻辑封装到独立的 Composable 中。

```typescript
// composables/useUserPermission.ts
import { useAuth } from '@/composables/useAuth'
import { PERMISSIONS } from '@/constants/permission'

/**
 * 用户管理权限 Composable
 */
export const useUserPermission = () => {
  const { hasPermission, hasAllPermissions } = useAuth()

  // 单个权限
  const canListUser = computed(() =>
    hasPermission(PERMISSIONS.USER.LIST)
  )
  const canAddUser = computed(() =>
    hasPermission(PERMISSIONS.USER.ADD)
  )
  const canEditUser = computed(() =>
    hasPermission(PERMISSIONS.USER.EDIT)
  )
  const canRemoveUser = computed(() =>
    hasPermission(PERMISSIONS.USER.REMOVE)
  )
  const canExportUser = computed(() =>
    hasPermission(PERMISSIONS.USER.EXPORT)
  )

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
    canExportUser,
    canManageUser,
    canFullManageUser,
  }
}
```

在组件中使用:

```vue
<script lang="ts" setup>
import { useUserPermission } from '@/composables/useUserPermission'

const {
  canAddUser,
  canEditUser,
  canRemoveUser,
  canManageUser
} = useUserPermission()
</script>

<template>
  <wd-button v-if="canAddUser">新增</wd-button>
  <wd-button v-if="canEditUser">编辑</wd-button>
  <wd-button v-if="canRemoveUser">删除</wd-button>
</template>
```

**优势:**
- 业务逻辑集中管理
- 组件代码更简洁
- 便于复用和测试
- 易于维护

### 4. 结合路由守卫实现页面级权限控制

在路由守卫中使用 `useAuth` 进行页面级别的权限检查。

```typescript
// router/guards/permission.ts
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

/**
 * 权限路由守卫
 */
export const setupPermissionGuard = () => {
  const { canAccessRoute, isLoggedIn } = useAuth()
  const userStore = useUserStore()

  // 白名单路由(无需登录)
  const whiteList = [
    '/pages/login/index',
    '/pages/register/index',
    '/pages/404/index',
  ]

  uni.addInterceptor('navigateTo', {
    invoke(args: any) {
      const url = args.url.split('?')[0] // 去除查询参数

      // 白名单路由直接放行
      if (whiteList.includes(url)) {
        return true
      }

      // 检查登录状态
      if (!isLoggedIn.value) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        uni.navigateTo({ url: '/pages/login/index' })
        return false
      }

      // 检查路由权限
      const route = findRouteConfig(url)
      if (route && !canAccessRoute(route)) {
        uni.showToast({
          title: '无权限访问此页面',
          icon: 'none'
        })
        return false
      }

      return true
    }
  })
}

/**
 * 查找路由配置
 */
const findRouteConfig = (url: string) => {
  // 从路由配置中查找
  const routes = [
    {
      path: '/pages/system/user',
      meta: {
        requireAuth: true,
        permissions: ['system:user:list']
      }
    },
    // ... 更多路由配置
  ]

  return routes.find(r => url.includes(r.path))
}
```

### 5. 使用 OR 和 AND 逻辑的最佳场景

理解何时使用 OR 逻辑(hasPermission)和 AND 逻辑(hasAllPermissions)。

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { PERMISSIONS } from '@/constants/permission'

const { hasPermission, hasAllPermissions } = useAuth()

// ✅ OR 逻辑: 适用于"拥有任一权限即可"的场景
// 场景: 用户只要能新增或编辑,就显示"数据管理"入口
const canAccessDataManagement = computed(() =>
  hasPermission([PERMISSIONS.USER.ADD, PERMISSIONS.USER.EDIT])
)

// ✅ AND 逻辑: 适用于"必须同时拥有多个权限"的场景
// 场景: 数据迁移需要同时拥有导入、导出和删除权限
const canDataMigration = computed(() =>
  hasAllPermissions([
    PERMISSIONS.USER.IMPORT,
    PERMISSIONS.USER.EXPORT,
    PERMISSIONS.USER.REMOVE
  ])
)

// ✅ 组合使用: 复杂权限场景
// 场景: 高级功能需要同时满足权限和角色要求
const canAdvancedFeature = computed(() => {
  const hasRequiredPermissions = hasAllPermissions([
    PERMISSIONS.USER.ADD,
    PERMISSIONS.USER.EDIT,
    PERMISSIONS.USER.REMOVE
  ])
  const hasRequiredRole = hasRole(['admin', 'manager'])

  return hasRequiredPermissions && hasRequiredRole
})
</script>
```

### 6. 处理权限变化的响应式更新

确保权限变化时 UI 自动更新。

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasPermission } = useAuth()
const userStore = useUserStore()

// ✅ 推荐: 使用计算属性实现响应式
const canAddUser = computed(() => hasPermission('system:user:add'))

// 刷新权限的方法
const refreshPermissions = async () => {
  try {
    // 重新获取用户信息和权限
    await userStore.refreshUserInfo()

    // 计算属性会自动更新,无需手动刷新
    uni.showToast({
      title: '权限已更新',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '权限更新失败',
      icon: 'error'
    })
  }
}

// 切换租户的方法
const switchTenant = async (tenantId: string) => {
  try {
    await userStore.switchTenant(tenantId)

    // 计算属性会自动更新,UI 会重新渲染
    uni.showToast({
      title: '租户切换成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '租户切换失败',
      icon: 'error'
    })
  }
}
</script>

<template>
  <view>
    <!-- UI 会自动响应权限变化 -->
    <wd-button v-if="canAddUser">新增用户</wd-button>

    <wd-button @click="refreshPermissions">刷新权限</wd-button>
    <wd-button @click="switchTenant('new-tenant')">切换租户</wd-button>
  </view>
</template>
```

### 7. 性能优化:批量权限缓存

对于需要检查大量权限的场景,使用批量缓存优化性能。

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
    export: hasPermission(PERMISSIONS.USER.EXPORT),
  },
  role: {
    list: hasPermission(PERMISSIONS.ROLE.LIST),
    add: hasPermission(PERMISSIONS.ROLE.ADD),
    edit: hasPermission(PERMISSIONS.ROLE.EDIT),
    remove: hasPermission(PERMISSIONS.ROLE.REMOVE),
  },
}))

// ❌ 不推荐: 每个权限单独定义计算属性
const canListUser = computed(() => hasPermission(PERMISSIONS.USER.LIST))
const canAddUser = computed(() => hasPermission(PERMISSIONS.USER.ADD))
// ... 更多单独的计算属性
</script>

<template>
  <view>
    <!-- 使用批量缓存的权限 -->
    <wd-button v-if="permissions.user.add">新增用户</wd-button>
    <wd-button v-if="permissions.user.edit">编辑用户</wd-button>
    <wd-button v-if="permissions.user.remove">删除用户</wd-button>

    <wd-button v-if="permissions.role.add">新增角色</wd-button>
  </view>
</template>
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

// 1. 检查登录状态
console.log('是否登录:', isLoggedIn.value)
console.log('Token:', userStore.token)

// 2. 检查权限列表
console.log('用户权限:', userStore.permissions)

// 3. 检查权限标识
const permission = 'system:user:add'
console.log('检查权限:', permission)
console.log('权限结果:', hasPermission(permission))

// 4. 确保权限数据已加载
onMounted(async () => {
  if (isLoggedIn.value && userStore.permissions.length === 0) {
    console.log('权限列表为空,重新加载用户信息')
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
  // 1. 检查用户租户 ID
  const currentTenantId = userStore.userInfo?.tenantId
  console.log('当前租户 ID:', currentTenantId)

  if (!currentTenantId) {
    console.error('用户信息中缺少租户 ID')
    return false
  }

  // 2. 检查是否为超级管理员
  if (isSuperAdmin()) {
    console.log('超级管理员,拥有所有租户权限')
    return true
  }

  // 3. 检查租户权限
  const permission = 'tenant:data:manage'
  const hasPermission = hasTenantPermission(permission)
  console.log('租户权限检查结果:', hasPermission)

  // 4. 跨租户检查(会失败)
  const otherTenantId = 'other-tenant-id'
  const crossTenantPermission = hasTenantPermission(permission, otherTenantId)
  console.log('跨租户权限:', crossTenantPermission) // 应该为 false

  return hasPermission
}
</script>
```

### 3. 路由权限过滤后所有路由都消失

**问题原因:**
- 路由配置的权限要求过于严格
- 用户没有任何匹配的权限或角色
- `filterAuthorizedRoutes` 递归过滤子路由时出错

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { filterAuthorizedRoutes, isSuperAdmin } = useAuth()
const userStore = useUserStore()

const allRoutes = [
  {
    path: '/pages/home',
    title: '首页',
    // ✅ 首页不设置权限要求,所有人可访问
  },
  {
    path: '/pages/system/user',
    title: '用户管理',
    meta: {
      permissions: ['system:user:list']
    }
  },
]

const authorizedRoutes = computed(() => {
  // 1. 检查是否为超级管理员
  if (isSuperAdmin()) {
    console.log('超级管理员,返回所有路由')
    return allRoutes
  }

  // 2. 检查用户权限
  console.log('用户权限:', userStore.permissions)
  console.log('用户角色:', userStore.roles)

  // 3. 过滤路由
  const filtered = filterAuthorizedRoutes(allRoutes)
  console.log('过滤后的路由:', filtered)

  // 4. 至少保留首页
  if (filtered.length === 0) {
    console.warn('没有可访问的路由,返回首页')
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
- Pinia Store 的数据未正确更新

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { hasPermission } = useAuth()
const userStore = useUserStore()

// ✅ 正确: 使用计算属性
const canAddUser = computed(() => hasPermission('system:user:add'))

// ❌ 错误: 直接赋值(不响应式)
// const canAddUser = hasPermission('system:user:add')

const refreshPermissions = async () => {
  console.log('刷新前的权限:', userStore.permissions)

  // 刷新用户信息
  await userStore.refreshUserInfo()

  console.log('刷新后的权限:', userStore.permissions)

  // 计算属性会自动重新计算
  console.log('UI 会自动更新')
}
</script>

<template>
  <!-- ✅ 正确: 使用计算属性 -->
  <wd-button v-if="canAddUser">新增用户</wd-button>

  <!-- ❌ 错误: 直接调用方法(每次渲染都执行) -->
  <!-- <wd-button v-if="hasPermission('system:user:add')">新增用户</wd-button> -->

  <wd-button @click="refreshPermissions">刷新权限</wd-button>
</template>
```

### 5. 超级管理员无法通过权限检查

**问题原因:**
- 用户角色列表中缺少超级管理员角色
- 超级管理员角色标识不匹配
- 使用了自定义角色标识但未正确传参

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { isSuperAdmin, hasPermission } = useAuth()
const userStore = useUserStore()

const debugSuperAdmin = () => {
  // 1. 检查用户角色列表
  console.log('用户角色:', userStore.roles)

  // 2. 检查默认超级管理员角色
  const isDefaultSuperAdmin = isSuperAdmin()
  console.log('是否为超级管理员(默认):', isDefaultSuperAdmin)

  // 3. 检查自定义超级管理员角色
  const customRole = 'system_admin'
  const isCustomSuperAdmin = isSuperAdmin(customRole)
  console.log(`是否为超级管理员(${customRole}):`, isCustomSuperAdmin)

  // 4. 确保角色列表中包含正确的角色
  if (!userStore.roles.includes('superadmin')) {
    console.error('角色列表中缺少 superadmin 角色')
  }

  // 5. 使用自定义角色时,确保传递正确的参数
  const permission = 'system:user:add'
  const hasPermWithCustomRole = hasPermission(permission, customRole)
  console.log('使用自定义角色的权限检查:', hasPermWithCustomRole)
}

onMounted(() => {
  debugSuperAdmin()
})
</script>
```

### 6. 多角色或多权限检查逻辑混淆

**问题原因:**
- 混淆了 OR 逻辑和 AND 逻辑
- 不清楚何时使用 `hasPermission` 和 `hasAllPermissions`
- 错误地组合了多个权限检查方法

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasAllPermissions, hasRole, hasAllRoles } = useAuth()

// ✅ OR 逻辑: 拥有任一权限即可
// 使用场景: 多个操作共用一个入口
const canManageData = computed(() =>
  hasPermission(['system:data:add', 'system:data:edit']) // 满足其一
)

// ✅ AND 逻辑: 必须拥有所有权限
// 使用场景: 高级功能需要多个权限组合
const canDataMigration = computed(() =>
  hasAllPermissions([
    'system:data:import',
    'system:data:export',
    'system:data:remove'
  ]) // 必须全部满足
)

// ✅ 权限 + 角色组合(AND)
// 使用场景: 既需要权限又需要角色
const canSensitiveOperation = computed(() => {
  const hasRequiredPermission = hasPermission('system:sensitive:operate')
  const hasRequiredRole = hasRole(['admin', 'security_officer'])
  return hasRequiredPermission && hasRequiredRole // 两者都要满足
})

// ✅ 复杂组合: (权限1 OR 权限2) AND (角色1 OR 角色2)
const canComplexOperation = computed(() => {
  const hasAnyPermission = hasPermission([
    'system:data:manage',
    'system:data:admin'
  ]) // 满足任一权限
  const hasAnyRole = hasRole(['manager', 'admin']) // 满足任一角色
  return hasAnyPermission && hasAnyRole // 权限和角色都要满足
})

// ❌ 错误: 使用 hasPermission 想要 AND 逻辑
const wrongAndLogic = computed(() =>
  hasPermission(['perm1', 'perm2']) // 这是 OR 逻辑,不是 AND!
)

// ✅ 正确: 使用 hasAllPermissions 实现 AND 逻辑
const correctAndLogic = computed(() =>
  hasAllPermissions(['perm1', 'perm2']) // 这才是 AND 逻辑
)
</script>
```

### 7. 在循环中重复检查权限导致性能问题

**问题原因:**
- 在 `v-for` 循环中每个元素都调用权限检查
- 没有使用计算属性缓存权限检查结果
- 大数据列表场景下性能损耗明显

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const dataList = ref([
  { id: 1, name: '数据1' },
  { id: 2, name: '数据2' },
  { id: 3, name: '数据3' },
  // ... 1000+ 条数据
])

// ❌ 错误: 在循环中重复检查权限
// <wd-button v-for="item in dataList" v-if="hasPermission('system:data:edit')">

// ✅ 正确: 提前缓存权限检查结果
const permissions = computed(() => ({
  canEdit: hasPermission('system:data:edit'),
  canDelete: hasPermission('system:data:remove'),
  canExport: hasPermission('system:data:export'),
}))
</script>

<template>
  <view class="data-list">
    <view
      v-for="item in dataList"
      :key="item.id"
      class="data-item"
    >
      <text>{{ item.name }}</text>

      <!-- ✅ 使用缓存的权限检查结果 -->
      <wd-button v-if="permissions.canEdit" size="small">
        编辑
      </wd-button>
      <wd-button v-if="permissions.canDelete" size="small" type="danger">
        删除
      </wd-button>
    </view>
  </view>
</template>
```

## 类型定义

### UserStore 相关类型

```typescript
/**
 * 用户信息接口
 */
interface UserInfo {
  /** 用户 ID */
  userId: string
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 租户 ID */
  tenantId: string
  /** 租户名称 */
  tenantName: string
  /** 其他用户信息 */
  [key: string]: any
}

/**
 * 用户 Store 接口
 */
interface UserStore {
  /** 访问令牌 */
  token: string
  /** 用户信息 */
  userInfo: UserInfo | null
  /** 用户权限列表 */
  permissions: string[]
  /** 用户角色列表 */
  roles: string[]
  /** 获取用户信息 */
  getUserInfo: () => Promise<void>
  /** 刷新用户信息 */
  refreshUserInfo: () => Promise<void>
  /** 切换租户 */
  switchTenant: (tenantId: string) => Promise<void>
  /** 退出登录 */
  logout: () => void
}
```

### 路由相关类型

```typescript
/**
 * 路由 Meta 信息
 */
interface RouteMeta {
  /** 是否需要登录 */
  requireAuth?: boolean
  /** 所需角色 */
  roles?: string[]
  /** 所需权限 */
  permissions?: string[]
  /** 其他 meta 信息 */
  [key: string]: any
}

/**
 * 路由配置接口
 */
interface RouteConfig {
  /** 路由路径 */
  path: string
  /** 路由标题 */
  title?: string
  /** 路由 meta 信息 */
  meta?: RouteMeta
  /** 子路由 */
  children?: RouteConfig[]
}
```

### 返回值类型

```typescript
/**
 * useAuth 返回值类型
 */
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

## 使用示例汇总

### 基础权限控制

```vue
<template>
  <view class="page">
    <!-- 登录状态检查 -->
    <view v-if="isLoggedIn">
      <text>欢迎,{{ userName }}</text>
    </view>

    <!-- 单个权限 -->
    <wd-button v-if="canAddUser" @click="handleAdd">
      新增用户
    </wd-button>

    <!-- 多个权限(OR) -->
    <wd-button v-if="canManageUser" @click="handleManage">
      用户管理
    </wd-button>

    <!-- 多个权限(AND) -->
    <wd-button v-if="canFullManage" @click="handleFullManage">
      完整管理
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const { isLoggedIn, hasPermission, hasAllPermissions } = useAuth()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.userName)

const canAddUser = computed(() =>
  hasPermission('system:user:add')
)

const canManageUser = computed(() =>
  hasPermission(['system:user:add', 'system:user:edit'])
)

const canFullManage = computed(() =>
  hasAllPermissions(['system:user:add', 'system:user:edit', 'system:user:remove'])
)
</script>
```

### 角色控制

```vue
<template>
  <view class="page">
    <!-- 管理员面板 -->
    <view v-if="isSuperAdmin()" class="admin-panel">
      <text>超级管理员面板</text>
    </view>

    <!-- 租户管理 -->
    <view v-if="isTenantAdmin()" class="tenant-panel">
      <text>租户管理面板</text>
    </view>

    <!-- 角色检查 -->
    <view v-if="isEditor" class="editor-panel">
      <text>编辑器面板</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin, hasRole } = useAuth()

const isEditor = computed(() => hasRole('editor'))
</script>
```

### 租户权限控制

```vue
<template>
  <view class="page">
    <wd-button
      v-if="canManageTenant"
      @click="handleManageTenant"
    >
      管理本租户数据
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission } = useAuth()

const canManageTenant = computed(() =>
  hasTenantPermission('tenant:data:manage')
)
</script>
```

### 路由权限控制

```vue
<template>
  <view class="navigation">
    <view
      v-for="route in authorizedRoutes"
      :key="route.path"
      @click="navigateTo(route.path)"
    >
      {{ route.title }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { filterAuthorizedRoutes } = useAuth()

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
]

const authorizedRoutes = computed(() =>
  filterAuthorizedRoutes(allRoutes)
)

const navigateTo = (path: string) => {
  uni.navigateTo({ url: path })
}
</script>
```
