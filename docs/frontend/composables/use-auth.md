# useAuth

认证与授权组合函数，提供用户认证与权限检查功能，包括权限字符串检查、角色校验、租户权限和路由访问控制。

## 功能特性

- **用户状态**: 登录状态、管理员类型判断(超级管理员、租户管理员)
- **权限检查**: 单个或多个权限检查，支持 OR 和 AND 逻辑
- **角色检查**: 单个或多个角色检查，支持 OR 和 AND 逻辑
- **租户权限**: 租户上下文中的权限检查，支持跨租户权限验证
- **路由控制**: 基于权限的路由访问控制和路由过滤
- **权限指令**: 提供完整的 Vue 权限指令集(v-permi、v-role 等)
- **通配符支持**: 支持 `*:*:*` 通配符权限标识
- **类型安全**: 完整的 TypeScript 类型支持

## 基础用法

### 引入和初始化

```vue
<template>
  <div class="permission-demo">
    <!-- 登录状态检查 -->
    <div v-if="isLoggedIn">
      <p>欢迎回来！</p>

      <!-- 权限控制按钮 -->
      <el-button v-if="canAddUser" type="primary" @click="addUser">
        添加用户
      </el-button>

      <!-- 角色控制内容 -->
      <div v-if="isEditor">
        <p>编辑器专用内容</p>
      </div>

      <!-- 管理员标识 -->
      <el-tag v-if="isSuperAdmin()" type="danger">
        超级管理员
      </el-tag>
    </div>

    <div v-else>
      <p>请先登录系统</p>
      <el-button type="primary" @click="goLogin">去登录</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

// 获取认证相关方法
const {
  isLoggedIn,
  hasPermission,
  hasRole,
  isSuperAdmin
} = useAuth()

// 检查特定权限
const canAddUser = hasPermission('system:user:add')

// 检查角色
const isEditor = hasRole('editor')

// 添加用户
const addUser = () => {
  console.log('添加用户')
}

// 跳转登录
const goLogin = () => {
  router.push('/login')
}
</script>
```

**使用说明:**
- `useAuth()` 返回一组认证相关的状态和方法
- `isLoggedIn` 是计算属性，自动响应登录状态变化
- `hasPermission` 和 `hasRole` 返回布尔值，可直接用于 `v-if`
- 所有方法都支持自定义管理员角色标识

### 权限字符串格式

系统使用冒号分隔的三级权限字符串格式:

```typescript
// 权限字符串格式: 模块:资源:操作
const permissions = [
  'system:user:list',      // 系统模块-用户资源-列表操作
  'system:user:add',       // 系统模块-用户资源-新增操作
  'system:user:update',    // 系统模块-用户资源-修改操作
  'system:user:delete',    // 系统模块-用户资源-删除操作
  'system:user:export',    // 系统模块-用户资源-导出操作
  'system:user:import',    // 系统模块-用户资源-导入操作
  'system:role:list',      // 系统模块-角色资源-列表操作
  'system:menu:list',      // 系统模块-菜单资源-列表操作
  'monitor:online:list',   // 监控模块-在线用户-列表操作
  'tool:gen:list',         // 工具模块-代码生成-列表操作
  '*:*:*'                  // 通配符，表示所有权限
]

// 在组件中检查权限
const { hasPermission } = useAuth()

// 单个权限检查
const canViewUsers = hasPermission('system:user:list')
const canAddUser = hasPermission('system:user:add')
const canDeleteUser = hasPermission('system:user:delete')
```

**权限命名规范:**
- 第一级: 模块名称 (system、monitor、tool 等)
- 第二级: 资源名称 (user、role、menu 等)
- 第三级: 操作类型 (list、add、update、delete、export、import 等)

## 用户状态检查

### 登录状态

```vue
<template>
  <div>
    <!-- 根据登录状态显示不同内容 -->
    <template v-if="isLoggedIn">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :src="userInfo.avatar" />
          <span>{{ userInfo.nickname }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="settings">设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>

    <template v-else>
      <el-button type="primary" @click="goLogin">登录</el-button>
      <el-button @click="goRegister">注册</el-button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/modules/user'

const { isLoggedIn } = useAuth()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>
```

**实现原理:**
- `isLoggedIn` 检查 userStore 中的 token 是否存在且非空
- 这是一个计算属性，会自动响应 token 的变化

### 管理员类型判断

```vue
<template>
  <div class="admin-panel">
    <!-- 超级管理员专属功能 -->
    <div v-if="isSuperAdmin()" class="super-admin-section">
      <el-alert title="超级管理员权限" type="warning" :closable="false">
        您拥有系统最高权限，请谨慎操作
      </el-alert>

      <el-card header="系统配置">
        <el-button type="danger" @click="clearCache">清除系统缓存</el-button>
        <el-button type="danger" @click="resetSystem">重置系统</el-button>
      </el-card>
    </div>

    <!-- 租户管理员专属功能 -->
    <div v-else-if="isTenantAdmin()" class="tenant-admin-section">
      <el-alert title="租户管理员权限" type="info" :closable="false">
        您是当前租户的管理员，可以管理租户内的所有资源
      </el-alert>

      <el-card header="租户管理">
        <el-button @click="manageTenantUsers">管理用户</el-button>
        <el-button @click="manageTenantRoles">管理角色</el-button>
      </el-card>
    </div>

    <!-- 普通用户 -->
    <div v-else class="normal-user-section">
      <el-alert title="普通用户" type="success" :closable="false">
        欢迎使用系统
      </el-alert>
    </div>

    <!-- 任意管理员可见 -->
    <div v-if="isAnyAdmin()" class="admin-common-section">
      <el-card header="管理员通用功能">
        <el-button @click="viewLogs">查看日志</el-button>
        <el-button @click="viewStats">查看统计</el-button>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin, isAnyAdmin } = useAuth()

// 系统操作
const clearCache = () => {
  ElMessageBox.confirm('确定要清除系统缓存吗？', '警告', {
    type: 'warning'
  }).then(() => {
    // 清除缓存逻辑
    ElMessage.success('缓存已清除')
  })
}

const resetSystem = () => {
  ElMessageBox.confirm('此操作将重置系统配置，是否继续？', '危险操作', {
    type: 'error',
    confirmButtonText: '确定重置',
    cancelButtonText: '取消'
  }).then(() => {
    // 重置系统逻辑
  })
}

// 租户管理
const manageTenantUsers = () => router.push('/tenant/users')
const manageTenantRoles = () => router.push('/tenant/roles')

// 通用功能
const viewLogs = () => router.push('/admin/logs')
const viewStats = () => router.push('/admin/stats')
</script>
```

**管理员角色说明:**
- **超级管理员 (superadmin)**: 拥有系统所有权限，不受租户限制
- **租户管理员 (admin)**: 拥有所属租户内的所有权限
- **isAnyAdmin()**: 检查是否为任意级别管理员(超级管理员或租户管理员)

### 自定义管理员角色

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin, isAnyAdmin } = useAuth()

// 使用默认角色标识
const isDefaultSuperAdmin = isSuperAdmin()        // 检查 'superadmin' 角色
const isDefaultTenantAdmin = isTenantAdmin()      // 检查 'admin' 角色

// 使用自定义角色标识
const isCustomSuperAdmin = isSuperAdmin('custom_super')  // 检查 'custom_super' 角色
const isCustomTenantAdmin = isTenantAdmin('custom_admin') // 检查 'custom_admin' 角色

// isAnyAdmin 也支持自定义角色
const isCustomAdmin = isAnyAdmin('custom_super')  // 检查是否为 'superadmin' 或 'admin'
</script>
```

**自定义角色标识场景:**
- 多系统共用同一套权限体系时，可能使用不同的管理员角色名称
- 向后兼容旧系统时，可能需要支持历史角色名称
- 实现更细粒度的管理员分级时

## 权限检查

### 单权限检查 (hasPermission)

```vue
<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="actions">
            <!-- 单个权限控制 -->
            <el-button
              v-if="canAdd"
              type="primary"
              @click="handleAdd"
            >
              新增
            </el-button>

            <el-button
              v-if="canExport"
              type="success"
              @click="handleExport"
            >
              导出
            </el-button>

            <el-button
              v-if="canImport"
              type="info"
              @click="handleImport"
            >
              导入
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="userList">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="canEdit"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>

            <el-button
              v-if="canDelete"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 定义各项操作权限
const canAdd = hasPermission('system:user:add')
const canEdit = hasPermission('system:user:update')
const canDelete = hasPermission('system:user:delete')
const canExport = hasPermission('system:user:export')
const canImport = hasPermission('system:user:import')

// 操作方法
const handleAdd = () => {
  // 新增用户逻辑
}

const handleEdit = (row: any) => {
  // 编辑用户逻辑
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    type: 'warning'
  }).then(() => {
    // 删除逻辑
  })
}

const handleExport = () => {
  // 导出逻辑
}

const handleImport = () => {
  // 导入逻辑
}
</script>
```

### 多权限检查 - OR 逻辑

```vue
<template>
  <div>
    <!-- 满足任一权限即可显示 -->
    <el-button v-if="canManageUser" type="primary">
      用户管理
    </el-button>

    <!-- 满足任一角色即可显示 -->
    <el-button v-if="canEditContent" type="success">
      内容编辑
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole } = useAuth()

// 检查多个权限（满足任一即可）- OR 逻辑
const canManageUser = hasPermission([
  'system:user:add',
  'system:user:update',
  'system:user:delete'
])

// 检查多个角色（满足任一即可）- OR 逻辑
const canEditContent = hasRole([
  'editor',
  'writer',
  'admin'
])
</script>
```

**OR 逻辑说明:**
- 当传入数组时，只要用户拥有数组中的任意一个权限/角色，就返回 `true`
- 适用于多个操作共用一个入口的场景

### 多权限检查 - AND 逻辑

```vue
<template>
  <div>
    <!-- 必须同时拥有所有权限 -->
    <el-button
      v-if="canFullControl"
      type="danger"
      @click="handleDangerousOperation"
    >
      高级操作（需要全部权限）
    </el-button>

    <!-- 必须同时拥有所有角色 -->
    <el-button
      v-if="isMultiRoleUser"
      type="warning"
    >
      多角色用户专属
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasAllPermissions, hasAllRoles } = useAuth()

// 检查多个权限（必须全部满足）- AND 逻辑
const canFullControl = hasAllPermissions([
  'system:user:add',
  'system:user:update',
  'system:user:delete',
  'system:user:export'
])

// 检查多个角色（必须全部满足）- AND 逻辑
const isMultiRoleUser = hasAllRoles([
  'manager',
  'auditor'
])

const handleDangerousOperation = () => {
  ElMessageBox.confirm(
    '此操作需要最高权限，确定继续？',
    '安全确认',
    { type: 'warning' }
  ).then(() => {
    // 执行操作
  })
}
</script>
```

**AND 逻辑说明:**
- `hasAllPermissions` 要求用户必须拥有数组中的所有权限才返回 `true`
- `hasAllRoles` 要求用户必须拥有数组中的所有角色才返回 `true`
- 适用于需要多重验证的高安全场景

### 自定义超级管理员豁免

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, hasAllPermissions, hasAllRoles } = useAuth()

// 使用自定义超级管理员角色进行豁免检查
// 当用户拥有 'custom_super' 角色时，直接返回 true

const canManage = hasPermission('system:user:add', 'custom_super')
const canEdit = hasRole('editor', 'custom_super')
const canFullControl = hasAllPermissions(
  ['perm1', 'perm2', 'perm3'],
  'custom_super'
)
const hasMultiRoles = hasAllRoles(
  ['role1', 'role2'],
  'custom_super'
)
</script>
```

**豁免检查逻辑:**
1. 首先检查用户是否拥有指定的超级管理员角色
2. 如果是超级管理员，直接返回 `true`，跳过后续检查
3. 如果不是超级管理员，则进行正常的权限/角色检查

## 角色检查

### 基本角色检查

```vue
<template>
  <div class="role-based-content">
    <!-- 编辑角色可见 -->
    <div v-if="isEditor" class="editor-section">
      <h3>编辑区域</h3>
      <el-input type="textarea" v-model="content" />
      <el-button type="primary" @click="saveContent">保存</el-button>
    </div>

    <!-- 审核角色可见 -->
    <div v-if="isAuditor" class="auditor-section">
      <h3>审核区域</h3>
      <el-button type="success" @click="approve">通过</el-button>
      <el-button type="danger" @click="reject">驳回</el-button>
    </div>

    <!-- 财务角色可见 -->
    <div v-if="isFinance" class="finance-section">
      <h3>财务区域</h3>
      <el-button @click="viewFinanceReport">查看财务报表</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole } = useAuth()

// 单角色检查
const isEditor = hasRole('editor')
const isAuditor = hasRole('auditor')
const isFinance = hasRole('finance')

const content = ref('')

const saveContent = () => {
  // 保存内容
}

const approve = () => {
  // 审核通过
}

const reject = () => {
  // 审核驳回
}

const viewFinanceReport = () => {
  router.push('/finance/report')
}
</script>
```

### 多角色检查

```vue
<template>
  <div>
    <!-- 管理层角色（OR 逻辑） -->
    <div v-if="isManagement" class="management-section">
      <h3>管理层仪表盘</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <el-statistic title="今日订单" :value="orderCount" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="今日收入" :value="revenue" prefix="¥" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 高级管理员（AND 逻辑） -->
    <div v-if="isSeniorManager" class="senior-section">
      <h3>高级管理权限</h3>
      <el-alert type="warning" :closable="false">
        您同时拥有多个管理角色，可以执行跨部门操作
      </el-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasRole, hasAllRoles } = useAuth()

// 多角色检查 - OR 逻辑
const isManagement = hasRole([
  'ceo',
  'cto',
  'cfo',
  'manager'
])

// 多角色检查 - AND 逻辑
const isSeniorManager = hasAllRoles([
  'manager',
  'department_head'
])

const orderCount = ref(1234)
const revenue = ref(56789)
</script>
```

## 租户权限

### 基本租户权限检查

```vue
<template>
  <div class="tenant-management">
    <!-- 当前租户权限检查 -->
    <el-button
      v-if="canManageCurrentTenantUsers"
      @click="manageUsers"
    >
      管理本租户用户
    </el-button>

    <!-- 显示当前租户信息 -->
    <el-descriptions title="租户信息" :column="2">
      <el-descriptions-item label="租户ID">
        {{ currentTenantId }}
      </el-descriptions-item>
      <el-descriptions-item label="租户名称">
        {{ tenantName }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/modules/user'

const { hasTenantPermission } = useAuth()
const userStore = useUserStore()

// 获取当前租户信息
const currentTenantId = computed(() => userStore.userInfo?.tenantId)
const tenantName = computed(() => userStore.userInfo?.tenantName)

// 检查当前租户权限（不传 tenantId 时使用当前用户的租户）
const canManageCurrentTenantUsers = hasTenantPermission('tenant:user:manage')

const manageUsers = () => {
  router.push('/tenant/users')
}
</script>
```

### 指定租户权限检查

```vue
<template>
  <div class="cross-tenant-operation">
    <el-table :data="tenantList">
      <el-table-column prop="tenantId" label="租户ID" />
      <el-table-column prop="tenantName" label="租户名称" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <!-- 检查是否有权限操作指定租户 -->
          <el-button
            v-if="canOperateTenant(row.tenantId)"
            type="primary"
            link
            @click="manageTenant(row)"
          >
            管理
          </el-button>

          <el-button
            v-else
            type="info"
            link
            disabled
          >
            无权限
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission, isSuperAdmin } = useAuth()

// 租户列表
const tenantList = ref([
  { tenantId: '000001', tenantName: '租户A' },
  { tenantId: '000002', tenantName: '租户B' },
  { tenantId: '000003', tenantName: '租户C' }
])

// 检查是否有权限操作指定租户
const canOperateTenant = (tenantId: string) => {
  // 超级管理员可以操作所有租户
  if (isSuperAdmin()) {
    return true
  }
  // 普通用户只能操作自己所属的租户
  return hasTenantPermission('tenant:user:manage', tenantId)
}

const manageTenant = (tenant: any) => {
  router.push(`/tenant/${tenant.tenantId}/manage`)
}
</script>
```

### 租户权限检查逻辑

```typescript
/**
 * hasTenantPermission 方法的检查逻辑:
 *
 * 1. 如果用户是超级管理员 → 返回 true（可操作所有租户）
 * 2. 如果目标租户不是当前用户所属租户 → 返回 false（不能跨租户操作）
 * 3. 如果用户是租户管理员 → 返回 true（在自己租户内有全部权限）
 * 4. 否则进行正常权限检查
 */

import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission } = useAuth()

// 示例1: 检查当前租户权限
const canManage = hasTenantPermission('tenant:user:manage')

// 示例2: 检查指定租户权限
const canManageOther = hasTenantPermission('tenant:user:manage', '000002')

// 示例3: 使用自定义管理员角色
const canManageCustom = hasTenantPermission(
  'tenant:user:manage',
  '000002',
  'custom_super',    // 超级管理员角色
  'custom_admin'     // 租户管理员角色
)

// 示例4: 多权限检查
const canFullManage = hasTenantPermission([
  'tenant:user:manage',
  'tenant:role:manage'
])
```

## 路由访问控制

### 单个路由权限检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { canAccessRoute } = useAuth()

// 定义路由对象
const userManageRoute = {
  path: '/system/user',
  name: 'UserManage',
  meta: {
    title: '用户管理',
    permissions: ['system:user:list']
  }
}

const roleManageRoute = {
  path: '/system/role',
  name: 'RoleManage',
  meta: {
    title: '角色管理',
    roles: ['admin', 'manager']
  }
}

const mixedRoute = {
  path: '/system/config',
  name: 'SystemConfig',
  meta: {
    title: '系统配置',
    permissions: ['system:config:list'],
    roles: ['admin']
  }
}

// 检查路由访问权限
const canAccessUserManage = canAccessRoute(userManageRoute)
const canAccessRoleManage = canAccessRoute(roleManageRoute)
const canAccessSystemConfig = canAccessRoute(mixedRoute)
</script>
```

**路由权限检查规则:**
1. 如果路由没有 `meta` 或没有权限要求 → 允许访问
2. 如果用户是超级管理员 → 允许访问
3. 如果路由配置了 `meta.roles` → 检查用户是否拥有任一角色
4. 如果路由配置了 `meta.permissions` → 检查用户是否拥有任一权限
5. 同时配置 roles 和 permissions 时，两者都需要满足

### 路由过滤

```vue
<template>
  <div class="sidebar">
    <el-menu :default-active="activeMenu">
      <template v-for="route in authorizedRoutes" :key="route.path">
        <el-sub-menu v-if="route.children?.length" :index="route.path">
          <template #title>
            <el-icon><component :is="route.meta?.icon" /></el-icon>
            <span>{{ route.meta?.title }}</span>
          </template>

          <el-menu-item
            v-for="child in route.children"
            :key="child.path"
            :index="child.path"
            @click="navigateTo(child)"
          >
            {{ child.meta?.title }}
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item
          v-else
          :index="route.path"
          @click="navigateTo(route)"
        >
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <span>{{ route.meta?.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { filterAuthorizedRoutes } = useAuth()

// 所有路由配置
const allRoutes = [
  {
    path: '/dashboard',
    meta: { title: '仪表盘', icon: 'Dashboard' }
  },
  {
    path: '/system',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: '/system/user',
        meta: {
          title: '用户管理',
          permissions: ['system:user:list']
        }
      },
      {
        path: '/system/role',
        meta: {
          title: '角色管理',
          permissions: ['system:role:list']
        }
      },
      {
        path: '/system/menu',
        meta: {
          title: '菜单管理',
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/monitor',
    meta: { title: '系统监控', icon: 'Monitor', roles: ['admin'] },
    children: [
      {
        path: '/monitor/online',
        meta: { title: '在线用户' }
      },
      {
        path: '/monitor/job',
        meta: { title: '定时任务' }
      }
    ]
  }
]

// 过滤出有权限访问的路由
const authorizedRoutes = computed(() => {
  return filterAuthorizedRoutes(allRoutes)
})

const activeMenu = ref('/dashboard')

const navigateTo = (route: any) => {
  router.push(route.path)
  activeMenu.value = route.path
}
</script>
```

### 路由守卫集成

```typescript
// router/guard.ts
import { useAuth } from '@/composables/useAuth'
import type { Router } from 'vue-router'

export function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const { canAccessRoute, isLoggedIn } = useAuth()

    // 白名单路由直接放行
    const whiteList = ['/login', '/register', '/404', '/403']
    if (whiteList.includes(to.path)) {
      next()
      return
    }

    // 未登录跳转登录页
    if (!isLoggedIn.value) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // 检查路由权限
    if (!canAccessRoute(to)) {
      next({ path: '/403' })
      return
    }

    next()
  })
}
```

## 权限指令

系统提供了丰富的 Vue 自定义指令，用于在模板中直接进行权限控制。

### v-permi 指令

基于操作权限控制元素显示，满足任一权限即可显示（OR 逻辑）。

```vue
<template>
  <div>
    <!-- 单个权限 -->
    <el-button v-permi="'system:user:add'">
      添加用户
    </el-button>

    <!-- 多个权限（满足任一即可） -->
    <el-button v-permi="['system:user:add', 'system:user:update']">
      用户管理
    </el-button>
  </div>
</template>
```

### v-role 指令

基于角色权限控制元素，满足任一角色即可显示（OR 逻辑）。

```vue
<template>
  <div>
    <!-- 单个角色 -->
    <el-button v-role="'editor'">
      编辑内容
    </el-button>

    <!-- 多个角色（满足任一即可） -->
    <el-button v-role="['admin', 'editor']">
      内容管理
    </el-button>
  </div>
</template>
```

### v-admin 和 v-superadmin 指令

```vue
<template>
  <div>
    <!-- 任意管理员可见（超级管理员或租户管理员） -->
    <el-button v-admin>
      管理员功能
    </el-button>

    <!-- 仅超级管理员可见 -->
    <el-button v-superadmin type="danger">
      超级管理员专属功能
    </el-button>
  </div>
</template>
```

### v-permi-all 和 v-role-all 指令

必须满足所有条件才显示（AND 逻辑）。

```vue
<template>
  <div>
    <!-- 必须拥有所有权限 -->
    <el-button v-permi-all="['system:user:add', 'system:user:update', 'system:user:delete']">
      高级用户管理
    </el-button>

    <!-- 必须拥有所有角色 -->
    <el-button v-role-all="['admin', 'auditor']">
      高级审核功能
    </el-button>
  </div>
</template>
```

### v-tenant 指令

基于租户权限控制元素。

```vue
<template>
  <div>
    <!-- 当前租户权限 -->
    <el-button v-tenant="'tenant:user:manage'">
      管理租户用户
    </el-button>

    <!-- 指定租户权限 -->
    <el-button v-tenant="{ permi: 'tenant:user:manage', tenantId: '12345' }">
      管理指定租户
    </el-button>
  </div>
</template>
```

### v-no-permi 和 v-no-role 指令

反向权限控制，有权限/角色时隐藏元素。

```vue
<template>
  <div>
    <!-- 有此权限则隐藏 -->
    <el-alert v-no-permi="'system:user:add'" type="info">
      您没有添加用户的权限，请联系管理员
    </el-alert>

    <!-- 有此角色则隐藏 -->
    <el-button v-no-role="'admin'">
      普通用户操作（管理员不可见）
    </el-button>
  </div>
</template>
```

### v-auth 指令

灵活的权限控制指令，支持多种动作。

```vue
<template>
  <div>
    <!-- 权限控制 + 禁用效果 -->
    <el-button v-auth="{ permi: 'system:user:add', action: 'disable' }">
      添加用户（无权限时禁用）
    </el-button>

    <!-- 角色控制 + 隐藏效果 -->
    <el-button v-auth="{ role: 'editor', action: 'hide' }">
      编辑内容（无权限时隐藏）
    </el-button>

    <!-- 权限控制 + 移除效果（默认） -->
    <el-button v-auth="{ permi: 'system:user:delete', action: 'remove' }">
      删除用户
    </el-button>

    <!-- 权限控制 + 添加类名 -->
    <el-button v-auth="{ permi: 'system:user:add', action: 'class', className: 'no-auth' }">
      添加用户
    </el-button>
  </div>
</template>

<style>
.no-auth {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

**v-auth 指令动作说明:**

| action | 说明 | 效果 |
|--------|------|------|
| `remove` | 移除元素（默认） | 从 DOM 中移除元素 |
| `hide` | 隐藏元素 | 设置 `display: none` |
| `disable` | 禁用元素 | 添加 `disabled` 属性和 `is-disabled` 类 |
| `class` | 添加类名 | 添加指定的 className 或默认的 `no-auth` 类 |

## API 参考

### useAuth 返回值

```typescript
interface UseAuthReturn {
  // 状态
  isLoggedIn: ComputedRef<boolean>

  // 管理员检查
  isSuperAdmin: (roleToCheck?: string) => boolean
  isTenantAdmin: (roleToCheck?: string) => boolean
  isAnyAdmin: (roleKey?: string) => boolean

  // 权限检查
  hasPermission: (permission: string | string[], superAdminRole?: string) => boolean
  hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean
  hasTenantPermission: (
    permission: string | string[],
    tenantId?: string,
    superAdminRole?: string,
    tenantAdminRole?: string
  ) => boolean

  // 角色检查
  hasRole: (role: string | string[], superAdminRole?: string) => boolean
  hasAllRoles: (roles: string[], superAdminRole?: string) => boolean

  // 路由控制
  canAccessRoute: (route: any, superAdminRole?: string) => boolean
  filterAuthorizedRoutes: (routes: any[], superAdminRole?: string) => any[]
}
```

### 方法详细说明

#### isLoggedIn

| 属性 | 说明 |
|------|------|
| 类型 | `ComputedRef<boolean>` |
| 说明 | 当前用户登录状态 |
| 返回值 | 用户已登录返回 `true`，否则返回 `false` |

#### isSuperAdmin(roleToCheck?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| roleToCheck | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 用户拥有指定的超级管理员角色返回 `true` |

#### isTenantAdmin(roleToCheck?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| roleToCheck | `string` | `'admin'` | 租户管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 用户拥有指定的租户管理员角色返回 `true` |

#### isAnyAdmin(roleKey?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| roleKey | `string` | - | 可选的角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 用户是超级管理员或租户管理员返回 `true` |

#### hasPermission(permission, superAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| permission | `string \| string[]` | - | 权限标识或权限数组 |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 拥有任一指定权限返回 `true`（OR 逻辑） |

#### hasAllPermissions(permissions, superAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| permissions | `string[]` | - | 权限标识数组 |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 拥有所有指定权限返回 `true`（AND 逻辑） |

#### hasTenantPermission(permission, tenantId?, superAdminRole?, tenantAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| permission | `string \| string[]` | - | 权限标识 |
| tenantId | `string` | 当前用户租户ID | 目标租户ID |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色 |
| tenantAdminRole | `string` | `'admin'` | 租户管理员角色 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 在指定租户内拥有权限返回 `true` |

#### hasRole(role, superAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| role | `string \| string[]` | - | 角色标识或角色数组 |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 拥有任一指定角色返回 `true`（OR 逻辑） |

#### hasAllRoles(roles, superAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| roles | `string[]` | - | 角色标识数组 |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 拥有所有指定角色返回 `true`（AND 逻辑） |

#### canAccessRoute(route, superAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| route | `any` | - | 路由对象 |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `boolean` | 有权限访问该路由返回 `true` |

#### filterAuthorizedRoutes(routes, superAdminRole?)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| routes | `any[]` | - | 路由数组 |
| superAdminRole | `string` | `'superadmin'` | 超级管理员角色标识 |

| 返回值 | 说明 |
|--------|------|
| `any[]` | 过滤后有权限访问的路由数组 |

## 类型定义

### 完整类型定义

```typescript
/**
 * 用户信息接口
 */
interface UserInfo {
  userId: string | number
  username: string
  nickname: string
  avatar: string
  tenantId: string
  tenantName?: string
  roles: string[]
  permissions: string[]
}

/**
 * 路由元信息接口
 */
interface RouteMeta {
  title?: string
  icon?: string
  permissions?: string[]
  roles?: string[]
  hidden?: boolean
  keepAlive?: boolean
}

/**
 * 路由记录接口
 */
interface RouteRecord {
  path: string
  name?: string
  component?: any
  redirect?: string
  meta?: RouteMeta
  children?: RouteRecord[]
}

/**
 * 权限检查函数类型
 */
type PermissionChecker = (
  permission: string | string[],
  superAdminRole?: string
) => boolean

/**
 * 角色检查函数类型
 */
type RoleChecker = (
  role: string | string[],
  superAdminRole?: string
) => boolean

/**
 * 租户权限检查函数类型
 */
type TenantPermissionChecker = (
  permission: string | string[],
  tenantId?: string,
  superAdminRole?: string,
  tenantAdminRole?: string
) => boolean

/**
 * 管理员检查函数类型
 */
type AdminChecker = (roleToCheck?: string) => boolean

/**
 * 路由访问检查函数类型
 */
type RouteAccessChecker = (
  route: RouteRecord,
  superAdminRole?: string
) => boolean

/**
 * 路由过滤函数类型
 */
type RouteFilter = (
  routes: RouteRecord[],
  superAdminRole?: string
) => RouteRecord[]

/**
 * useAuth 返回类型
 */
interface UseAuthReturn {
  // 状态
  isLoggedIn: ComputedRef<boolean>

  // 管理员检查
  isSuperAdmin: AdminChecker
  isTenantAdmin: AdminChecker
  isAnyAdmin: AdminChecker

  // 权限检查
  hasPermission: PermissionChecker
  hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean
  hasTenantPermission: TenantPermissionChecker

  // 角色检查
  hasRole: RoleChecker
  hasAllRoles: (roles: string[], superAdminRole?: string) => boolean

  // 路由控制
  canAccessRoute: RouteAccessChecker
  filterAuthorizedRoutes: RouteFilter
}

/**
 * v-auth 指令值类型
 */
interface AuthDirectiveValue {
  permi?: string | string[]
  role?: string | string[]
  action?: 'remove' | 'hide' | 'disable' | 'class'
  className?: string
}

/**
 * v-tenant 指令值类型
 */
type TenantDirectiveValue =
  | string
  | string[]
  | { permi: string | string[], tenantId: string }
```

### 常量定义

```typescript
/**
 * 系统常量
 */
const AUTH_CONSTANTS = {
  // 超级管理员角色标识
  SUPER_ADMIN: 'superadmin',

  // 租户管理员角色标识
  TENANT_ADMIN: 'admin',

  // 通配符权限标识
  ALL_PERMISSION: '*:*:*'
}
```

## 高级用法

### 动态权限控制

```vue
<template>
  <div class="dynamic-permission">
    <!-- 动态权限按钮组 -->
    <el-button-group>
      <el-button
        v-for="action in availableActions"
        :key="action.key"
        :type="action.type"
        @click="handleAction(action)"
      >
        {{ action.label }}
      </el-button>
    </el-button-group>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 所有可能的操作
const allActions = [
  { key: 'add', label: '新增', type: 'primary', permission: 'system:user:add' },
  { key: 'edit', label: '编辑', type: 'success', permission: 'system:user:update' },
  { key: 'delete', label: '删除', type: 'danger', permission: 'system:user:delete' },
  { key: 'export', label: '导出', type: 'info', permission: 'system:user:export' }
]

// 根据权限过滤可用操作
const availableActions = computed(() => {
  return allActions.filter(action => hasPermission(action.permission))
})

const handleAction = (action: any) => {
  console.log('执行操作:', action.key)
}
</script>
```

### 权限缓存与优化

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, isSuperAdmin } = useAuth()

// 使用计算属性缓存权限检查结果
const permissions = computed(() => ({
  canAdd: hasPermission('system:user:add'),
  canEdit: hasPermission('system:user:update'),
  canDelete: hasPermission('system:user:delete'),
  canExport: hasPermission('system:user:export'),
  canImport: hasPermission('system:user:import')
}))

// 使用 computed 缓存复杂权限逻辑
const userCapabilities = computed(() => {
  const isAdmin = isSuperAdmin()

  return {
    // 管理员可以执行所有操作
    canDoAnything: isAdmin,

    // 高级用户可以批量操作
    canBatchOperate: isAdmin || (
      permissions.value.canEdit &&
      permissions.value.canDelete
    ),

    // 可以进行数据导入导出
    canTransferData: isAdmin || (
      permissions.value.canExport &&
      permissions.value.canImport
    )
  }
})
</script>
```

### 权限组合与复用

```typescript
// composables/useUserPermissions.ts
import { useAuth } from '@/composables/useAuth'

/**
 * 用户管理权限组合函数
 * 封装用户管理相关的权限检查逻辑
 */
export const useUserPermissions = () => {
  const { hasPermission, hasAllPermissions, isSuperAdmin } = useAuth()

  // 基础权限
  const canView = computed(() => hasPermission('system:user:list'))
  const canAdd = computed(() => hasPermission('system:user:add'))
  const canEdit = computed(() => hasPermission('system:user:update'))
  const canDelete = computed(() => hasPermission('system:user:delete'))
  const canExport = computed(() => hasPermission('system:user:export'))
  const canImport = computed(() => hasPermission('system:user:import'))
  const canResetPwd = computed(() => hasPermission('system:user:resetPwd'))

  // 组合权限
  const canManage = computed(() => {
    return canAdd.value || canEdit.value || canDelete.value
  })

  const canTransfer = computed(() => {
    return canExport.value || canImport.value
  })

  const hasFullControl = computed(() => {
    return isSuperAdmin() || hasAllPermissions([
      'system:user:add',
      'system:user:update',
      'system:user:delete',
      'system:user:export',
      'system:user:import',
      'system:user:resetPwd'
    ])
  })

  return {
    canView,
    canAdd,
    canEdit,
    canDelete,
    canExport,
    canImport,
    canResetPwd,
    canManage,
    canTransfer,
    hasFullControl
  }
}

// 在组件中使用
// <script lang="ts" setup>
// import { useUserPermissions } from '@/composables/useUserPermissions'
//
// const { canAdd, canEdit, canDelete, hasFullControl } = useUserPermissions()
// </script>
```

### 权限变更监听

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/modules/user'

const { hasPermission, isLoggedIn } = useAuth()
const userStore = useUserStore()

// 监听登录状态变化
watch(isLoggedIn, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    console.log('用户已登录，重新检查权限')
    checkPermissions()
  } else if (!newValue && oldValue) {
    console.log('用户已登出')
    clearPermissionCache()
  }
})

// 监听权限列表变化
watch(
  () => userStore.permissions,
  (newPermissions) => {
    console.log('权限列表已更新:', newPermissions)
    // 可以在这里触发界面更新或其他逻辑
  },
  { deep: true }
)

const checkPermissions = () => {
  // 重新检查关键权限
  const criticalPermissions = [
    'system:user:list',
    'system:role:list',
    'system:menu:list'
  ]

  criticalPermissions.forEach(perm => {
    console.log(`${perm}: ${hasPermission(perm) ? '有' : '无'}`)
  })
}

const clearPermissionCache = () => {
  // 清理权限相关缓存
}
</script>
```

## 最佳实践

### 1. 权限常量统一管理

```typescript
// constants/permissions.ts

/**
 * 系统用户权限常量
 */
export const USER_PERMISSIONS = {
  LIST: 'system:user:list',
  ADD: 'system:user:add',
  UPDATE: 'system:user:update',
  DELETE: 'system:user:delete',
  EXPORT: 'system:user:export',
  IMPORT: 'system:user:import',
  RESET_PWD: 'system:user:resetPwd'
} as const

/**
 * 系统角色权限常量
 */
export const ROLE_PERMISSIONS = {
  LIST: 'system:role:list',
  ADD: 'system:role:add',
  UPDATE: 'system:role:update',
  DELETE: 'system:role:delete',
  EXPORT: 'system:role:export'
} as const

/**
 * 系统菜单权限常量
 */
export const MENU_PERMISSIONS = {
  LIST: 'system:menu:list',
  ADD: 'system:menu:add',
  UPDATE: 'system:menu:update',
  DELETE: 'system:menu:delete'
} as const

/**
 * 角色常量
 */
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  TENANT_ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const

// 在组件中使用
// import { USER_PERMISSIONS, ROLES } from '@/constants/permissions'
// const canAdd = hasPermission(USER_PERMISSIONS.ADD)
// const isManager = hasRole(ROLES.MANAGER)
```

### 2. 组件级权限封装

```vue
<!-- components/PermissionButton.vue -->
<template>
  <el-button
    v-if="hasAccess"
    v-bind="$attrs"
    :type="type"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

interface Props {
  permission?: string | string[]
  role?: string | string[]
  requireAll?: boolean
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  disabled: false,
  requireAll: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { hasPermission, hasAllPermissions, hasRole, hasAllRoles } = useAuth()

const hasAccess = computed(() => {
  // 检查权限
  if (props.permission) {
    if (props.requireAll && Array.isArray(props.permission)) {
      return hasAllPermissions(props.permission)
    }
    return hasPermission(props.permission)
  }

  // 检查角色
  if (props.role) {
    if (props.requireAll && Array.isArray(props.role)) {
      return hasAllRoles(props.role)
    }
    return hasRole(props.role)
  }

  // 没有权限要求，默认显示
  return true
})

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<!-- 使用示例 -->
<!--
<PermissionButton
  permission="system:user:add"
  type="primary"
  @click="handleAdd"
>
  新增用户
</PermissionButton>

<PermissionButton
  :permission="['perm1', 'perm2']"
  :require-all="true"
  type="danger"
>
  高级操作
</PermissionButton>
-->
```

### 3. 权限与业务逻辑分离

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, isSuperAdmin } = useAuth()

// ❌ 不推荐：权限检查混在业务逻辑中
const handleDelete = async (id: number) => {
  if (!hasPermission('system:user:delete')) {
    ElMessage.error('您没有删除权限')
    return
  }

  // 删除逻辑...
}

// ✅ 推荐：权限检查与业务逻辑分离
const canDelete = hasPermission('system:user:delete')

const handleDeleteBetter = async (id: number) => {
  // 直接执行业务逻辑，权限控制在 UI 层完成
  const result = await deleteUser(id)
  if (result) {
    ElMessage.success('删除成功')
    loadData()
  }
}

// 在模板中
// <el-button v-if="canDelete" @click="handleDeleteBetter(row.id)">删除</el-button>
</script>
```

### 4. 多层级权限检查

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, isSuperAdmin, hasTenantPermission } = useAuth()

/**
 * 多层级权限检查示例
 *
 * 业务场景：用户管理功能
 * - 超级管理员：可以管理所有租户的用户
 * - 租户管理员：可以管理本租户的用户
 * - 普通用户：只能查看和编辑自己
 */
const checkUserManagePermission = (targetUserId: number, targetTenantId: string) => {
  // 1. 超级管理员拥有所有权限
  if (isSuperAdmin()) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canResetPwd: true
    }
  }

  // 2. 检查租户权限
  const inSameTenant = hasTenantPermission('tenant:user:manage', targetTenantId)

  if (!inSameTenant) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canResetPwd: false
    }
  }

  // 3. 检查具体操作权限
  return {
    canView: hasPermission('system:user:list'),
    canEdit: hasPermission('system:user:update'),
    canDelete: hasPermission('system:user:delete'),
    canResetPwd: hasPermission('system:user:resetPwd')
  }
}
</script>
```

### 5. 错误处理与降级

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, isLoggedIn } = useAuth()

/**
 * 安全的权限检查包装器
 */
const safeHasPermission = (permission: string | string[]): boolean => {
  try {
    // 检查登录状态
    if (!isLoggedIn.value) {
      console.warn('用户未登录，权限检查返回 false')
      return false
    }

    return hasPermission(permission)
  } catch (error) {
    console.error('权限检查失败:', error)
    // 权限检查失败时，默认拒绝访问（安全降级）
    return false
  }
}

/**
 * 带日志的权限检查
 */
const hasPermissionWithLog = (
  permission: string | string[],
  context?: string
): boolean => {
  const result = hasPermission(permission)

  if (import.meta.env.DEV) {
    console.log(
      `[Permission Check] ${context || ''} | ` +
      `Permission: ${JSON.stringify(permission)} | ` +
      `Result: ${result}`
    )
  }

  return result
}
</script>
```

## 常见问题

### 1. 权限检查结果不更新

**问题描述:**
权限数据更新后，已渲染的权限检查结果没有自动更新。

**原因分析:**
- `hasPermission` 返回的是普通布尔值，不是响应式的
- 权限检查结果没有使用 computed 包装

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// ❌ 错误：直接调用，不会响应式更新
const canAdd = hasPermission('system:user:add')

// ✅ 正确：使用 computed 包装
const canAddReactive = computed(() => hasPermission('system:user:add'))
</script>
```

### 2. 权限指令在动态组件上不生效

**问题描述:**
在动态渲染的组件上使用 v-permi 指令，权限控制不生效。

**原因分析:**
权限指令在 `mounted` 钩子中执行，动态组件可能在指令执行前就已经渲染。

**解决方案:**

```vue
<template>
  <!-- 方案1：使用 v-if 配合权限检查 -->
  <component
    v-if="hasPermission(item.permission)"
    :is="item.component"
  />

  <!-- 方案2：使用 key 强制重新渲染 -->
  <component
    :is="item.component"
    :key="item.permission + Date.now()"
    v-permi="item.permission"
  />
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()
</script>
```

### 3. 超级管理员角色判断不准确

**问题描述:**
系统使用了自定义的管理员角色名称，但 `isSuperAdmin()` 判断不正确。

**原因分析:**
默认的超级管理员角色标识是 `'superadmin'`，如果系统使用了其他名称，需要传入自定义角色。

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, hasPermission } = useAuth()

// 使用自定义超级管理员角色
const isAdmin = isSuperAdmin('custom_superadmin')

// 在权限检查中使用自定义角色
const canManage = hasPermission('system:user:manage', 'custom_superadmin')
</script>
```

### 4. 路由权限检查时机问题

**问题描述:**
在路由守卫中进行权限检查时，用户数据还未加载完成。

**原因分析:**
路由守卫执行时机早于用户数据获取。

**解决方案:**

```typescript
// router/guard.ts
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/modules/user'

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const { canAccessRoute, isLoggedIn } = useAuth()

  // 白名单直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // 未登录跳转登录
  if (!isLoggedIn.value) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 确保用户信息已加载
  if (!userStore.permissions.length) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      await userStore.logout()
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 检查路由权限
  if (!canAccessRoute(to)) {
    next({ path: '/403' })
    return
  }

  next()
})
```

### 5. 租户权限跨域问题

**问题描述:**
在多租户系统中，用户尝试操作其他租户的数据时权限判断错误。

**原因分析:**
`hasTenantPermission` 方法会检查目标租户是否与当前用户所属租户一致。

**解决方案:**

```vue
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission, isSuperAdmin } = useAuth()

const canOperateUser = (targetTenantId: string) => {
  // 超级管理员可以操作所有租户
  if (isSuperAdmin()) {
    return true
  }

  // 普通用户只能操作同租户数据
  return hasTenantPermission('tenant:user:manage', targetTenantId)
}

// 在操作前检查权限
const handleEdit = (user: User) => {
  if (!canOperateUser(user.tenantId)) {
    ElMessage.error('您没有权限操作该租户的用户')
    return
  }

  // 执行编辑操作
}
</script>
```

### 6. 权限指令与 v-if 冲突

**问题描述:**
同时使用 v-if 和 v-permi 指令时，元素显示逻辑不符合预期。

**原因分析:**
Vue 指令执行有优先级，v-if 优先于自定义指令执行。

**解决方案:**

```vue
<template>
  <!-- 方案1：只使用 v-if（推荐） -->
  <el-button v-if="showButton && canAdd" @click="handleAdd">
    新增
  </el-button>

  <!-- 方案2：使用 template 包装 -->
  <template v-if="showButton">
    <el-button v-permi="'system:user:add'" @click="handleAdd">
      新增
    </el-button>
  </template>
</template>

<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const showButton = ref(true)
const canAdd = computed(() => hasPermission('system:user:add'))
</script>
```

## 注意事项

1. **权限检查时机**: 确保在权限检查前用户数据已加载完成
2. **响应式处理**: 如果需要权限结果响应式更新，使用 computed 包装
3. **指令限制**: 权限指令只在元素挂载时执行一次，动态权限变化不会自动更新
4. **角色与权限**: 超级管理员默认拥有所有权限和角色，租户管理员在本租户内有管理权限
5. **安全降级**: 权限检查失败时应默认拒绝访问
6. **性能优化**: 复杂权限逻辑使用 computed 缓存结果
7. **调试模式**: 开发环境可启用权限检查日志辅助调试

