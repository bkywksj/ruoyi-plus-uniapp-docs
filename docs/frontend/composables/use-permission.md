# usePermission 权限管理

权限管理组合函数，提供用户权限验证、角色检查和权限指令等功能。

## 📋 基础用法

### 权限检查

```typescript
import { usePermission } from '@/composables/use-permission'

export default defineComponent({
  setup() {
    const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = usePermission()

    // 检查单个权限
    const canEdit = hasPermission('system:user:edit')
    const canDelete = hasPermission('system:user:delete')

    // 检查角色
    const isAdmin = hasRole('admin')
    const isSuperAdmin = hasRole('super_admin')

    // 检查多个权限（任一）
    const canManage = hasAnyPermission(['system:user:edit', 'system:user:delete'])

    // 检查多个权限（全部）
    const canFullControl = hasAllPermissions(['system:user:add', 'system:user:edit', 'system:user:delete'])

    return {
      canEdit,
      canDelete,
      isAdmin,
      canManage,
      canFullControl
    }
  }
})
```

### 权限指令

```vue
<template>
  <div>
    <!-- 单个权限 -->
    <el-button
      v-permission="'system:user:add'"
      type="primary"
      @click="handleAdd"
    >
      新增用户
    </el-button>

    <!-- 多个权限（任一） -->
    <el-button
      v-permission:any="['system:user:edit', 'system:user:delete']"
      type="warning"
      @click="handleBatch"
    >
      批量操作
    </el-button>

    <!-- 多个权限（全部） -->
    <el-button
      v-permission:all="['system:user:add', 'system:user:edit']"
      type="success"
      @click="handleAdvanced"
    >
      高级操作
    </el-button>

    <!-- 角色检查 -->
    <el-button
      v-role="'admin'"
      type="danger"
      @click="handleAdmin"
    >
      管理员操作
    </el-button>

    <!-- 复合权限检查 -->
    <el-button
      v-if="hasPermission('system:config:edit') && hasRole('admin')"
      type="info"
      @click="handleConfig"
    >
      系统配置
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables/use-permission'

const { hasPermission, hasRole } = usePermission()

const handleAdd = () => {
  console.log('新增用户')
}

const handleBatch = () => {
  console.log('批量操作')
}

const handleAdvanced = () => {
  console.log('高级操作')
}

const handleAdmin = () => {
  console.log('管理员操作')
}

const handleConfig = () => {
  console.log('系统配置')
}
</script>
```

## 🎯 核心功能

### 权限验证函数

```typescript
// composables/use-permission.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export interface PermissionOptions {
  strict?: boolean // 严格模式，默认false
  cache?: boolean // 缓存结果，默认true
}

export function usePermission(options: PermissionOptions = {}) {
  const userStore = useUserStore()
  const { strict = false, cache = true } = options

  // 权限缓存
  const permissionCache = new Map<string, boolean>()
  const roleCache = new Map<string, boolean>()

  // 获取当前用户权限
  const userPermissions = computed(() => userStore.permissions || [])
  const userRoles = computed(() => userStore.roles || [])

  // 是否为超级管理员
  const isSuperAdmin = computed(() =>
    userRoles.value.some(role => role.roleKey === 'admin' || role.roleKey === 'super_admin')
  )

  /**
   * 检查单个权限
   * @param permission 权限标识
   * @returns 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    if (!permission) return false

    // 缓存检查
    if (cache && permissionCache.has(permission)) {
      return permissionCache.get(permission)!
    }

    let hasAuth = false

    // 超级管理员拥有所有权限
    if (!strict && isSuperAdmin.value) {
      hasAuth = true
    } else {
      // 检查具体权限
      hasAuth = userPermissions.value.includes(permission) ||
                userPermissions.value.includes('*:*:*')
    }

    // 缓存结果
    if (cache) {
      permissionCache.set(permission, hasAuth)
    }

    return hasAuth
  }

  /**
   * 检查角色
   * @param role 角色标识
   * @returns 是否有角色
   */
  const hasRole = (role: string): boolean => {
    if (!role) return false

    // 缓存检查
    if (cache && roleCache.has(role)) {
      return roleCache.get(role)!
    }

    const hasRoleAuth = userRoles.value.some(r => r.roleKey === role)

    // 缓存结果
    if (cache) {
      roleCache.set(role, hasRoleAuth)
    }

    return hasRoleAuth
  }

  /**
   * 检查多个权限（任一）
   * @param permissions 权限数组
   * @returns 是否有任一权限
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false
    return permissions.some(permission => hasPermission(permission))
  }

  /**
   * 检查多个权限（全部）
   * @param permissions 权限数组
   * @returns 是否有全部权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false
    return permissions.every(permission => hasPermission(permission))
  }

  /**
   * 检查多个角色（任一）
   * @param roles 角色数组
   * @returns 是否有任一角色
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!roles || roles.length === 0) return false
    return roles.some(role => hasRole(role))
  }

  /**
   * 检查多个角色（全部）
   * @param roles 角色数组
   * @returns 是否有全部角色
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!roles || roles.length === 0) return false
    return roles.every(role => hasRole(role))
  }

  /**
   * 清除权限缓存
   */
  const clearPermissionCache = () => {
    permissionCache.clear()
    roleCache.clear()
  }

  /**
   * 权限变更监听
   */
  const onPermissionChange = (callback: () => void) => {
    watch([userPermissions, userRoles], () => {
      clearPermissionCache()
      callback()
    }, { deep: true })
  }

  return {
    // 权限检查
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,

    // 状态
    isSuperAdmin,
    userPermissions,
    userRoles,

    // 工具方法
    clearPermissionCache,
    onPermissionChange
  }
}
```

### 权限指令实现

```typescript
// directives/permission.ts
import type { App, DirectiveBinding } from 'vue'
import { usePermission } from '@/composables/use-permission'

// 权限指令类型
interface PermissionBinding extends DirectiveBinding {
  value: string | string[]
  arg?: 'any' | 'all'
}

// 权限指令
export const permissionDirective = {
  mounted(el: HTMLElement, binding: PermissionBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: PermissionBinding) {
    checkPermission(el, binding)
  }
}

// 角色指令
export const roleDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkRole(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkRole(el, binding)
  }
}

// 权限检查
function checkPermission(el: HTMLElement, binding: PermissionBinding) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
  const { value, arg } = binding

  if (!value) {
    return
  }

  let hasAuth = false

  if (typeof value === 'string') {
    hasAuth = hasPermission(value)
  } else if (Array.isArray(value)) {
    if (arg === 'all') {
      hasAuth = hasAllPermissions(value)
    } else {
      hasAuth = hasAnyPermission(value)
    }
  }

  if (!hasAuth) {
    el.style.display = 'none'
    el.setAttribute('disabled', 'true')
  } else {
    el.style.display = ''
    el.removeAttribute('disabled')
  }
}

// 角色检查
function checkRole(el: HTMLElement, binding: DirectiveBinding) {
  const { hasRole, hasAnyRole, hasAllRoles } = usePermission()
  const { value, arg } = binding

  if (!value) {
    return
  }

  let hasAuth = false

  if (typeof value === 'string') {
    hasAuth = hasRole(value)
  } else if (Array.isArray(value)) {
    if (arg === 'all') {
      hasAuth = hasAllRoles(value)
    } else {
      hasAuth = hasAnyRole(value)
    }
  }

  if (!hasAuth) {
    el.style.display = 'none'
    el.setAttribute('disabled', 'true')
  } else {
    el.style.display = ''
    el.removeAttribute('disabled')
  }
}

// 注册指令
export function setupPermissionDirectives(app: App) {
  app.directive('permission', permissionDirective)
  app.directive('role', roleDirective)
}
```

## 🔒 高级权限功能

### 路由权限守卫

```typescript
// router/permission.ts
import { Router } from 'vue-router'
import { usePermission } from '@/composables/use-permission'
import { useUserStore } from '@/stores/user'

export function setupRoutePermission(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const { hasPermission, hasRole } = usePermission()

    // 检查登录状态
    if (!userStore.isLogin && to.path !== '/login') {
      next('/login')
      return
    }

    // 检查路由权限
    if (to.meta?.permission) {
      const permission = to.meta.permission as string
      if (!hasPermission(permission)) {
        next('/403')
        return
      }
    }

    // 检查路由角色
    if (to.meta?.roles) {
      const roles = to.meta.roles as string[]
      const hasRequiredRole = roles.some(role => hasRole(role))
      if (!hasRequiredRole) {
        next('/403')
        return
      }
    }

    next()
  })
}

// 路由元信息类型扩展
declare module 'vue-router' {
  interface RouteMeta {
    permission?: string
    roles?: string[]
    requireAuth?: boolean
  }
}
```

### 动态菜单生成

```typescript
// composables/use-menu.ts
import { computed } from 'vue'
import { usePermission } from '@/composables/use-permission'

export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  permission?: string
  roles?: string[]
  children?: MenuItem[]
  hidden?: boolean
}

export function useMenu() {
  const { hasPermission, hasAnyRole } = usePermission()

  // 原始菜单数据
  const rawMenus = ref<MenuItem[]>([])

  // 过滤后的菜单
  const filteredMenus = computed(() => {
    return filterMenusByPermission(rawMenus.value)
  })

  /**
   * 根据权限过滤菜单
   */
  function filterMenusByPermission(menus: MenuItem[]): MenuItem[] {
    return menus
      .filter(menu => {
        // 检查权限
        if (menu.permission && !hasPermission(menu.permission)) {
          return false
        }

        // 检查角色
        if (menu.roles && !hasAnyRole(menu.roles)) {
          return false
        }

        // 检查隐藏状态
        if (menu.hidden) {
          return false
        }

        return true
      })
      .map(menu => ({
        ...menu,
        children: menu.children ? filterMenusByPermission(menu.children) : undefined
      }))
      .filter(menu => {
        // 如果有子菜单，但子菜单为空，则隐藏父菜单
        if (menu.children) {
          return menu.children.length > 0
        }
        return true
      })
  }

  /**
   * 设置菜单数据
   */
  const setMenus = (menus: MenuItem[]) => {
    rawMenus.value = menus
  }

  /**
   * 查找菜单项
   */
  const findMenuItem = (path: string): MenuItem | null => {
    const findInMenus = (menus: MenuItem[]): MenuItem | null => {
      for (const menu of menus) {
        if (menu.path === path) {
          return menu
        }
        if (menu.children) {
          const found = findInMenus(menu.children)
          if (found) return found
        }
      }
      return null
    }

    return findInMenus(filteredMenus.value)
  }

  return {
    rawMenus,
    filteredMenus,
    setMenus,
    findMenuItem
  }
}
```

### 权限缓存管理

```typescript
// composables/use-permission-cache.ts
import { useStorage } from '@vueuse/core'

interface PermissionCache {
  permissions: string[]
  roles: string[]
  timestamp: number
  version: string
}

export function usePermissionCache() {
  const CACHE_KEY = 'permission_cache'
  const CACHE_DURATION = 30 * 60 * 1000 // 30分钟

  // 持久化缓存
  const cache = useStorage<PermissionCache | null>(CACHE_KEY, null)

  /**
   * 保存权限缓存
   */
  const savePermissionCache = (permissions: string[], roles: string[], version = '1.0') => {
    cache.value = {
      permissions,
      roles,
      timestamp: Date.now(),
      version
    }
  }

  /**
   * 获取权限缓存
   */
  const getPermissionCache = (): { permissions: string[]; roles: string[] } | null => {
    if (!cache.value) {
      return null
    }

    // 检查缓存是否过期
    const isExpired = Date.now() - cache.value.timestamp > CACHE_DURATION
    if (isExpired) {
      clearPermissionCache()
      return null
    }

    return {
      permissions: cache.value.permissions,
      roles: cache.value.roles
    }
  }

  /**
   * 清除权限缓存
   */
  const clearPermissionCache = () => {
    cache.value = null
  }

  /**
   * 检查缓存版本
   */
  const checkCacheVersion = (version: string): boolean => {
    return cache.value?.version === version
  }

  /**
   * 刷新权限缓存
   */
  const refreshPermissionCache = async () => {
    try {
      // 从服务器获取最新权限信息
      const userStore = useUserStore()
      await userStore.getUserInfo()

      // 更新缓存
      savePermissionCache(
        userStore.permissions,
        userStore.roles.map(role => role.roleKey)
      )

      return true
    } catch (error) {
      console.error('刷新权限缓存失败:', error)
      return false
    }
  }

  return {
    savePermissionCache,
    getPermissionCache,
    clearPermissionCache,
    checkCacheVersion,
    refreshPermissionCache
  }
}
```

## 🎨 权限组件

### 权限包装器组件

```vue
<!-- PermissionWrapper.vue -->
<template>
  <slot v-if="hasAuth" />
  <slot v-else name="fallback">
    <div v-if="showFallback" class="permission-fallback">
      {{ fallbackText }}
    </div>
  </slot>
</template>

<script setup lang="ts">
interface Props {
  permission?: string | string[]
  role?: string | string[]
  requireAll?: boolean
  showFallback?: boolean
  fallbackText?: string
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false,
  showFallback: false,
  fallbackText: '暂无权限'
})

const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermission()

const hasAuth = computed(() => {
  let hasPermissionAuth = true
  let hasRoleAuth = true

  // 检查权限
  if (props.permission) {
    if (typeof props.permission === 'string') {
      hasPermissionAuth = hasPermission(props.permission)
    } else {
      hasPermissionAuth = props.requireAll
        ? hasAllPermissions(props.permission)
        : hasAnyPermission(props.permission)
    }
  }

  // 检查角色
  if (props.role) {
    if (typeof props.role === 'string') {
      hasRoleAuth = hasRole(props.role)
    } else {
      hasRoleAuth = props.requireAll
        ? hasAllRoles(props.role)
        : hasAnyRole(props.role)
    }
  }

  return hasPermissionAuth && hasRoleAuth
})
</script>

<style scoped>
.permission-fallback {
  padding: 16px;
  text-align: center;
  color: #999;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
```

### 使用权限组件

```vue
<template>
  <div>
    <!-- 基础权限控制 -->
    <PermissionWrapper permission="system:user:add">
      <el-button type="primary">新增用户</el-button>
    </PermissionWrapper>

    <!-- 多权限控制（任一） -->
    <PermissionWrapper
      :permission="['system:user:edit', 'system:user:delete']"
      show-fallback
      fallback-text="无编辑或删除权限"
    >
      <el-button type="warning">编辑用户</el-button>
      <template #fallback>
        <el-button disabled>操作受限</el-button>
      </template>
    </PermissionWrapper>

    <!-- 多权限控制（全部） -->
    <PermissionWrapper
      :permission="['system:user:add', 'system:user:edit']"
      require-all
    >
      <el-button type="success">高级操作</el-button>
    </PermissionWrapper>

    <!-- 角色控制 -->
    <PermissionWrapper role="admin">
      <el-button type="danger">管理员功能</el-button>
    </PermissionWrapper>

    <!-- 权限和角色组合 -->
    <PermissionWrapper
      permission="system:config:edit"
      role="admin"
    >
      <el-button type="info">系统配置</el-button>
    </PermissionWrapper>
  </div>
</template>
```

## 📊 权限统计和监控

### 权限使用统计

```typescript
// composables/use-permission-analytics.ts
export function usePermissionAnalytics() {
  const permissionUsage = ref<Map<string, number>>(new Map())
  const roleUsage = ref<Map<string, number>>(new Map())

  /**
   * 记录权限使用
   */
  const recordPermissionUsage = (permission: string) => {
    const count = permissionUsage.value.get(permission) || 0
    permissionUsage.value.set(permission, count + 1)
  }

  /**
   * 记录角色使用
   */
  const recordRoleUsage = (role: string) => {
    const count = roleUsage.value.get(role) || 0
    roleUsage.value.set(role, count + 1)
  }

  /**
   * 获取权限使用统计
   */
  const getPermissionStats = () => {
    return Array.from(permissionUsage.value.entries())
      .map(([permission, count]) => ({ permission, count }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * 获取角色使用统计
   */
  const getRoleStats = () => {
    return Array.from(roleUsage.value.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * 清除统计数据
   */
  const clearStats = () => {
    permissionUsage.value.clear()
    roleUsage.value.clear()
  }

  return {
    recordPermissionUsage,
    recordRoleUsage,
    getPermissionStats,
    getRoleStats,
    clearStats
  }
}
```

usePermission组合函数为Vue3应用提供了完整的权限管理解决方案，支持细粒度的权限控制、角色验证和动态权限更新。