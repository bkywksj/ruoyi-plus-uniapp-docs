# useAuth

认证与授权组合函数，提供用户认证与权限检查功能，包括权限字符串检查、角色校验和路由访问控制。

## 📋 功能特性

- **用户状态**: 登录状态、管理员类型判断
- **权限检查**: 单个或多个权限检查，支持OR和AND逻辑
- **角色检查**: 单个或多个角色检查，支持OR和AND逻辑
- **租户权限**: 租户上下文中的权限检查
- **路由控制**: 基于权限的路由访问控制

## 🎯 基础用法

### 基本权限检查

```vue
<template>
  <div>
    <!-- 根据权限显示按钮 -->
    <el-button v-if="canAddUser" @click="addUser">
      添加用户
    </el-button>
    
    <!-- 根据角色显示内容 -->
    <div v-if="isEditor">
      编辑器专用内容
    </div>
    
    <!-- 管理员标识 -->
    <el-tag v-if="isSuperAdmin()" type="danger">
      超级管理员
    </el-tag>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, isSuperAdmin } = useAuth()

// 检查特定权限
const canAddUser = hasPermission('system:user:add')

// 检查角色
const isEditor = hasRole('editor')
</script>
```

### 多权限检查

```vue
<template>
  <div>
    <!-- 满足任一权限即可显示 -->
    <el-button v-if="canManageUsers">
      用户管理
    </el-button>
    
    <!-- 必须同时具备所有权限 -->
    <el-button v-if="canFullControl" type="danger">
      完全控制
    </el-button>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasAllPermissions } = useAuth()

// 检查多个权限（满足任一即可）
const canManageUsers = hasPermission([
  'system:user:add', 
  'system:user:update'
])

// 检查多个权限（必须全部满足）
const canFullControl = hasAllPermissions([
  'system:user:add',
  'system:user:update', 
  'system:user:delete'
])
</script>
```

## 👤 用户状态检查

### 登录状态与管理员判断

```vue
<template>
  <div>
    <!-- 登录状态检查 -->
    <div v-if="isLoggedIn">
      <p>欢迎回来！</p>
      
      <!-- 超级管理员 -->
      <el-alert v-if="isSuperAdmin()" 
                title="您是超级管理员" 
                type="warning" />
      
      <!-- 租户管理员 -->
      <el-alert v-if="isTenantAdmin()" 
                title="您是租户管理员" 
                type="info" />
      
      <!-- 任意管理员 -->
      <div v-if="isAnyAdmin()">
        管理员专用功能
      </div>
    </div>
    
    <div v-else>
      请先登录
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  isLoggedIn, 
  isSuperAdmin, 
  isTenantAdmin, 
  isAnyAdmin 
} = useAuth()
</script>
```

### 自定义管理员角色

```vue
<template>
  <div>
    <!-- 使用自定义超级管理员角色 -->
    <div v-if="isCustomSuperAdmin">
      自定义超级管理员内容
    </div>
    
    <!-- 使用自定义租户管理员角色 -->
    <div v-if="isCustomTenantAdmin">
      自定义租户管理员内容  
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { isSuperAdmin, isTenantAdmin } = useAuth()

// 使用自定义角色标识
const isCustomSuperAdmin = isSuperAdmin('customsuperadmin')
const isCustomTenantAdmin = isTenantAdmin('customadmin')
</script>
```

## 🏢 租户权限管理

### 租户上下文权限检查

```vue
<template>
  <div>
    <!-- 当前租户权限 -->
    <el-button v-if="canManageCurrentTenant">
      管理当前租户
    </el-button>
    
    <!-- 指定租户权限 -->
    <el-button v-if="canManageSpecificTenant">
      管理指定租户
    </el-button>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { hasTenantPermission } = useAuth()

// 检查当前租户权限
const canManageCurrentTenant = hasTenantPermission('tenant:user:manage')

// 检查指定租户权限
const canManageSpecificTenant = hasTenantPermission(
  'tenant:user:manage', 
  '123456'  // 指定租户ID
)
</script>
```

## 🛣️ 路由访问控制

### 路由权限检查

```vue
<template>
  <div>
    <el-menu>
      <el-menu-item 
        v-for="route in accessibleRoutes" 
        :key="route.path"
        :index="route.path">
        {{ route.meta.title }}
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { canAccessRoute, filterAuthorizedRoutes } = useAuth()

const allRoutes = [
  {
    path: '/users',
    meta: { 
      title: '用户管理',
      permissions: ['system:user:list']
    }
  },
  {
    path: '/settings', 
    meta: {
      title: '系统设置',
      roles: ['admin']
    }
  }
]

// 过滤有权限访问的路由
const accessibleRoutes = filterAuthorizedRoutes(allRoutes)

// 单个路由权限检查
const canAccessUserRoute = canAccessRoute(allRoutes[0])
</script>
```

### 路由守卫集成

```javascript
// router/guards.js
import { useAuth } from '@/composables/useAuth'

export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    const { canAccessRoute } = useAuth()
    
    // 检查路由访问权限
    if (canAccessRoute(to)) {
      next()
    } else {
      // 无权限访问，重定向到403页面
      next({ path: '/403' })
    }
  })
}
```

## 🔀 角色与权限组合

### 复杂权限逻辑

```vue
<template>
  <div>
    <!-- 复杂权限组合 -->
    <el-button v-if="canPerformAdvancedOperation">
      高级操作
    </el-button>
    
    <!-- 角色权限组合 -->
    <div v-if="hasManagerAccess">
      经理级别访问权限
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  hasPermission, 
  hasRole, 
  hasAllPermissions,
  hasAllRoles,
  isSuperAdmin 
} = useAuth()

// 复杂权限逻辑：超级管理员或具备特定权限
const canPerformAdvancedOperation = computed(() => {
  return isSuperAdmin() || hasAllPermissions([
    'system:advanced:read',
    'system:advanced:write'
  ])
})

// 角色组合：必须具备经理角色和部门主管角色
const hasManagerAccess = hasAllRoles(['manager', 'department_head'])
</script>
```

## 📚 API 参考

### 用户状态

| 方法 | 类型 | 描述 |
|------|------|------|
| isLoggedIn | ComputedRef\<boolean\> | 当前用户登录状态 |
| isSuperAdmin | (roleToCheck?: string) => boolean | 检查是否为超级管理员 |
| isTenantAdmin | (roleToCheck?: string) => boolean | 检查是否为租户管理员 |
| isAnyAdmin | (roleKey?: string) => boolean | 检查是否为任意级别管理员 |

### 权限检查

| 方法 | 类型 | 描述 |
|------|------|------|
| hasPermission | (permission: string \| string[], superAdminRole?: string) => boolean | 检查是否拥有指定权限 |
| hasAllPermissions | (permissions: string[], superAdminRole?: string) => boolean | 检查是否拥有所有指定权限 |
| hasTenantPermission | (permission: string \| string[], tenantId?: string, superAdminRole?: string, tenantAdminRole?: string) => boolean | 检查租户权限 |

### 角色检查

| 方法 | 类型 | 描述 |
|------|------|------|
| hasRole | (role: string \| string[], superAdminRole?: string) => boolean | 检查是否拥有指定角色 |
| hasAllRoles | (roles: string[], superAdminRole?: string) => boolean | 检查是否拥有所有指定角色 |

### 路由控制

| 方法 | 类型 | 描述 |
|------|------|------|
| canAccessRoute | (route: any, superAdminRole?: string) => boolean | 检查是否有权限访问路由 |
| filterAuthorizedRoutes | (routes: any[], superAdminRole?: string) => any[] | 过滤有权限访问的路由 |

## 🎯 最佳实践

### 权限设计原则

1. **最小权限原则**：用户只获得完成任务所需的最小权限
2. **权限分层**：合理设计权限层级，避免权限过于细化或粗糙
3. **角色抽象**：通过角色管理权限，而不是直接分配权限给用户

### 使用建议

1. **统一权限常量**：定义权限常量，避免硬编码权限字符串
2. **组件级权限**：在组件级别进行权限检查，提升用户体验
3. **路由级权限**：结合路由守卫实现页面级访问控制

### 性能优化

1. **权限缓存**：合理利用权限数据缓存，避免重复请求
2. **延迟加载**：对于复杂权限逻辑，考虑使用计算属性延迟计算
3. **权限预加载**：在用户登录时预加载所有权限数据

### 错误处理

```vue
<script setup>
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

// 带错误处理的权限检查
const checkPermissionSafely = (permission) => {
  try {
    return hasPermission(permission)
  } catch (error) {
    console.warn('权限检查失败:', error)
    return false // 权限检查失败时默认拒绝访问
  }
}
</script>
```
