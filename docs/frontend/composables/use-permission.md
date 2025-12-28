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

## ❓ 常见问题

### 1. 权限指令在动态条件下不更新

**问题描述**

使用 `v-permission` 指令时，当用户权限动态变化后，已渲染的元素没有响应权限变化，导致界面状态与实际权限不一致。

```vue
<!-- 用户权限变化后，按钮状态没有更新 -->
<template>
  <el-button v-permission="'system:user:edit'">编辑用户</el-button>
</template>
```

**问题原因**

- Vue自定义指令的 `updated` 钩子只在元素自身或子节点更新时触发
- 权限数据存储在Pinia Store中，变化时不会自动触发指令更新
- 指令内部缓存了权限检查结果，没有监听权限变化

**解决方案**

使用响应式的 `v-if` 配合权限检查函数替代指令：

```vue
<!-- ❌ 错误：使用指令无法响应权限变化 -->
<template>
  <el-button v-permission="'system:user:edit'">编辑用户</el-button>
</template>

<!-- ✅ 正确：使用 v-if 配合计算属性实现响应式 -->
<template>
  <el-button v-if="canEdit">编辑用户</el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '@/composables/use-permission'

const { hasPermission } = usePermission()

// 使用计算属性确保响应式
const canEdit = computed(() => hasPermission('system:user:edit'))
</script>
```

如果必须使用指令方式，可以通过添加key强制刷新：

```vue
<template>
  <!-- 通过key变化强制指令重新执行 -->
  <el-button
    v-permission="'system:user:edit'"
    :key="permissionVersion"
  >
    编辑用户
  </el-button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const permissionVersion = ref(0)

// 监听权限变化，更新版本号
watch(
  () => userStore.permissions,
  () => {
    permissionVersion.value++
  },
  { deep: true }
)
</script>
```

---

### 2. 权限缓存导致数据不同步

**问题描述**

用户在后台被修改权限后，前端仍然使用缓存的旧权限数据，导致权限验证错误。

```typescript
// 用户权限已被管理员修改，但前端仍显示旧的权限状态
const { hasPermission } = usePermission({ cache: true })

// 返回旧的缓存结果
const canDelete = hasPermission('system:user:delete') // 应该是 false，但返回 true
```

**问题原因**

- 权限数据被缓存在内存或localStorage中，没有及时更新
- 没有建立权限变更的实时通知机制
- 缓存过期策略设置不合理

**解决方案**

实现权限实时同步机制：

```typescript
// composables/use-permission-sync.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermission } from '@/composables/use-permission'

export function usePermissionSync() {
  const userStore = useUserStore()
  const { clearPermissionCache } = usePermission()

  const lastSyncTime = ref<number>(Date.now())
  const SYNC_INTERVAL = 5 * 60 * 1000 // 5分钟同步一次

  let syncTimer: ReturnType<typeof setInterval> | null = null
  let visibilityHandler: (() => void) | null = null

  /**
   * 同步权限数据
   */
  const syncPermissions = async () => {
    try {
      // 清除本地缓存
      clearPermissionCache()

      // 从服务器获取最新权限
      await userStore.getUserInfo()

      lastSyncTime.value = Date.now()
      console.log('[权限同步] 权限数据已更新')
    } catch (error) {
      console.error('[权限同步] 同步失败:', error)
    }
  }

  /**
   * 页面可见性变化时同步权限
   */
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const timeSinceLastSync = Date.now() - lastSyncTime.value

      // 如果距离上次同步超过间隔时间，则同步
      if (timeSinceLastSync > SYNC_INTERVAL) {
        syncPermissions()
      }
    }
  }

  /**
   * 启动权限同步
   */
  const startSync = () => {
    // 定时同步
    syncTimer = setInterval(syncPermissions, SYNC_INTERVAL)

    // 页面可见时同步
    visibilityHandler = handleVisibilityChange
    document.addEventListener('visibilitychange', visibilityHandler)
  }

  /**
   * 停止权限同步
   */
  const stopSync = () => {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
    }

    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = null
    }
  }

  onMounted(() => {
    startSync()
  })

  onUnmounted(() => {
    stopSync()
  })

  return {
    syncPermissions,
    lastSyncTime,
    startSync,
    stopSync
  }
}
```

使用WebSocket实时同步：

```typescript
// composables/use-permission-websocket.ts
import { useWebSocket } from '@/composables/use-websocket'
import { useUserStore } from '@/stores/user'
import { usePermission } from '@/composables/use-permission'

export function usePermissionWebSocket() {
  const userStore = useUserStore()
  const { clearPermissionCache } = usePermission()

  const { connect, onMessage, disconnect } = useWebSocket({
    url: '/ws/permission',
    autoReconnect: true
  })

  // 监听权限变更消息
  onMessage((data) => {
    if (data.type === 'PERMISSION_CHANGED') {
      const { userId, permissions, roles } = data.payload

      // 如果是当前用户的权限变更
      if (userId === userStore.userId) {
        console.log('[权限WebSocket] 收到权限变更通知')

        // 清除缓存
        clearPermissionCache()

        // 更新Store
        userStore.setPermissions(permissions)
        userStore.setRoles(roles)

        // 可选：提示用户
        ElMessage.info('您的权限已更新，页面将自动刷新')
      }
    }
  })

  return {
    connect,
    disconnect
  }
}
```

---

### 3. 超级管理员绕过权限检查的安全问题

**问题描述**

超级管理员默认拥有所有权限，可能导致某些敏感操作被误触发，或者存在安全隐患。

```typescript
// 超级管理员可以执行任何操作，包括危险操作
const { hasPermission, isSuperAdmin } = usePermission()

// 即使没有明确授权，超级管理员也返回 true
hasPermission('system:data:delete-all') // 超级管理员始终返回 true
```

**问题原因**

- 权限系统默认给超级管理员开放所有权限
- 没有针对危险操作的二次确认机制
- 缺少操作审计和风险提示

**解决方案**

实现严格模式和危险操作保护：

```typescript
// composables/use-permission.ts - 扩展版本
export interface PermissionOptions {
  strict?: boolean // 严格模式：超级管理员也需要明确授权
  dangerousPermissions?: string[] // 危险权限列表
  requireConfirm?: boolean // 是否需要二次确认
}

export function usePermission(options: PermissionOptions = {}) {
  const userStore = useUserStore()
  const {
    strict = false,
    dangerousPermissions = [],
    requireConfirm = false
  } = options

  // 默认危险权限列表
  const defaultDangerousPermissions = [
    'system:data:delete-all',
    'system:user:delete-batch',
    'system:config:reset',
    'system:log:clear',
    'system:backup:restore'
  ]

  const allDangerousPermissions = [
    ...defaultDangerousPermissions,
    ...dangerousPermissions
  ]

  /**
   * 检查是否为危险权限
   */
  const isDangerousPermission = (permission: string): boolean => {
    return allDangerousPermissions.some(dp =>
      permission === dp || permission.startsWith(dp)
    )
  }

  /**
   * 严格权限检查（超级管理员也需要明确授权）
   */
  const hasPermissionStrict = (permission: string): boolean => {
    if (!permission) return false

    const userPermissions = userStore.permissions || []

    // 严格模式下，必须明确拥有该权限
    return userPermissions.includes(permission) ||
           userPermissions.includes('*:*:*')
  }

  /**
   * 危险操作权限检查
   */
  const hasDangerousPermission = async (permission: string): Promise<boolean> => {
    // 检查基础权限
    const hasAuth = strict
      ? hasPermissionStrict(permission)
      : hasPermission(permission)

    if (!hasAuth) return false

    // 如果是危险权限，需要二次确认
    if (isDangerousPermission(permission) && requireConfirm) {
      try {
        await ElMessageBox.confirm(
          '此操作属于危险操作，确定要继续吗？',
          '安全确认',
          {
            confirmButtonText: '确定执行',
            cancelButtonText: '取消',
            type: 'warning',
            distinguishCancelAndClose: true
          }
        )

        // 记录操作日志
        console.log(`[权限审计] 用户执行危险操作: ${permission}`)

        return true
      } catch {
        return false
      }
    }

    return true
  }

  return {
    // ... 其他方法
    hasPermissionStrict,
    hasDangerousPermission,
    isDangerousPermission
  }
}
```

使用示例：

```vue
<template>
  <el-button
    v-if="canDeleteAll"
    type="danger"
    @click="handleDeleteAll"
  >
    清空所有数据
  </el-button>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables/use-permission'

const { hasDangerousPermission } = usePermission({
  strict: true,
  requireConfirm: true
})

const canDeleteAll = computed(() =>
  hasPermissionStrict('system:data:delete-all')
)

const handleDeleteAll = async () => {
  // 危险操作需要二次确认
  const confirmed = await hasDangerousPermission('system:data:delete-all')

  if (confirmed) {
    // 执行删除操作
    await deleteAllData()
  }
}
</script>
```

---

### 4. 多标签页之间权限状态不同步

**问题描述**

用户在一个标签页中退出登录或权限被修改，其他标签页仍保持旧的权限状态。

```typescript
// 标签页A：用户退出登录
userStore.logout()

// 标签页B：仍然可以操作（权限状态未同步）
const { hasPermission } = usePermission()
hasPermission('system:user:edit') // 仍然返回 true
```

**问题原因**

- 每个标签页有独立的JavaScript运行环境
- Pinia Store状态不能跨标签页自动同步
- localStorage变化需要手动监听

**解决方案**

使用BroadcastChannel实现跨标签页同步：

```typescript
// composables/use-permission-broadcast.ts
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermission } from '@/composables/use-permission'

interface PermissionMessage {
  type: 'LOGOUT' | 'PERMISSION_UPDATE' | 'LOGIN'
  payload?: {
    permissions?: string[]
    roles?: string[]
    timestamp?: number
  }
}

export function usePermissionBroadcast() {
  const userStore = useUserStore()
  const { clearPermissionCache } = usePermission()

  let channel: BroadcastChannel | null = null

  /**
   * 初始化广播频道
   */
  const initChannel = () => {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('[权限广播] 浏览器不支持 BroadcastChannel')
      return
    }

    channel = new BroadcastChannel('permission_sync')

    channel.onmessage = (event: MessageEvent<PermissionMessage>) => {
      handleMessage(event.data)
    }
  }

  /**
   * 处理接收到的消息
   */
  const handleMessage = (message: PermissionMessage) => {
    switch (message.type) {
      case 'LOGOUT':
        // 其他标签页退出登录，当前标签页也退出
        console.log('[权限广播] 收到退出登录通知')
        userStore.logout()
        window.location.href = '/login'
        break

      case 'PERMISSION_UPDATE':
        // 权限更新
        console.log('[权限广播] 收到权限更新通知')
        if (message.payload) {
          clearPermissionCache()
          if (message.payload.permissions) {
            userStore.setPermissions(message.payload.permissions)
          }
          if (message.payload.roles) {
            userStore.setRoles(message.payload.roles)
          }
        }
        break

      case 'LOGIN':
        // 其他标签页登录，刷新当前页面
        console.log('[权限广播] 收到登录通知')
        window.location.reload()
        break
    }
  }

  /**
   * 广播消息
   */
  const broadcast = (message: PermissionMessage) => {
    if (channel) {
      channel.postMessage(message)
    }
  }

  /**
   * 广播退出登录
   */
  const broadcastLogout = () => {
    broadcast({ type: 'LOGOUT' })
  }

  /**
   * 广播权限更新
   */
  const broadcastPermissionUpdate = (
    permissions: string[],
    roles: string[]
  ) => {
    broadcast({
      type: 'PERMISSION_UPDATE',
      payload: {
        permissions,
        roles,
        timestamp: Date.now()
      }
    })
  }

  /**
   * 广播登录
   */
  const broadcastLogin = () => {
    broadcast({ type: 'LOGIN' })
  }

  /**
   * 销毁频道
   */
  const destroyChannel = () => {
    if (channel) {
      channel.close()
      channel = null
    }
  }

  onMounted(() => {
    initChannel()
  })

  onUnmounted(() => {
    destroyChannel()
  })

  return {
    broadcastLogout,
    broadcastPermissionUpdate,
    broadcastLogin
  }
}
```

在登录/退出逻辑中集成广播：

```typescript
// stores/user.ts
import { usePermissionBroadcast } from '@/composables/use-permission-broadcast'

export const useUserStore = defineStore('user', () => {
  // ...

  const { broadcastLogout, broadcastLogin, broadcastPermissionUpdate } = usePermissionBroadcast()

  /**
   * 登录
   */
  const login = async (credentials: LoginParams) => {
    const result = await loginApi(credentials)

    // 设置用户信息
    setUserInfo(result.user)
    setPermissions(result.permissions)
    setRoles(result.roles)

    // 广播登录事件
    broadcastLogin()

    return result
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      // 清除本地状态
      clearUserInfo()

      // 广播退出事件
      broadcastLogout()
    }
  }

  return {
    login,
    logout,
    // ...
  }
})
```

---

### 5. 路由守卫中使用 usePermission 报错

**问题描述**

在路由守卫中调用 `usePermission` 时，抛出 "getActivePinia was called with no active Pinia" 错误。

```typescript
// router/permission.ts
import { usePermission } from '@/composables/use-permission'

router.beforeEach((to, from, next) => {
  // ❌ 错误：Pinia 未初始化
  const { hasPermission } = usePermission()

  if (to.meta?.permission) {
    if (!hasPermission(to.meta.permission)) {
      next('/403')
      return
    }
  }

  next()
})
```

**问题原因**

- 路由守卫在Vue应用初始化之前或之外执行
- `usePermission` 内部依赖 Pinia Store，需要在正确的上下文中调用
- 组合函数需要在setup函数或其他组合函数内部调用

**解决方案**

在路由守卫中直接访问Store实例：

```typescript
// router/permission.ts
import type { Router } from 'vue-router'
import { useUserStoreWithout } from '@/stores/user'

/**
 * 设置路由权限守卫
 * 需要在 pinia 初始化之后调用
 */
export function setupRoutePermission(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 使用不依赖当前组件上下文的Store访问方式
    const userStore = useUserStoreWithout()

    // 检查登录状态
    if (!userStore.token) {
      if (to.path !== '/login') {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      next()
      return
    }

    // 检查路由权限
    if (to.meta?.permission) {
      const permission = to.meta.permission as string
      const hasAuth = checkPermission(userStore, permission)

      if (!hasAuth) {
        next('/403')
        return
      }
    }

    // 检查路由角色
    if (to.meta?.roles) {
      const roles = to.meta.roles as string[]
      const hasRole = checkRoles(userStore, roles)

      if (!hasRole) {
        next('/403')
        return
      }
    }

    next()
  })
}

/**
 * 检查权限（不使用组合函数）
 */
function checkPermission(userStore: ReturnType<typeof useUserStoreWithout>, permission: string): boolean {
  const permissions = userStore.permissions || []
  const roles = userStore.roles || []

  // 超级管理员
  const isSuperAdmin = roles.some(role =>
    role.roleKey === 'admin' || role.roleKey === 'super_admin'
  )

  if (isSuperAdmin) return true

  // 检查权限
  return permissions.includes(permission) || permissions.includes('*:*:*')
}

/**
 * 检查角色
 */
function checkRoles(userStore: ReturnType<typeof useUserStoreWithout>, requiredRoles: string[]): boolean {
  const roles = userStore.roles || []
  return requiredRoles.some(role =>
    roles.some(r => r.roleKey === role)
  )
}
```

Store需要提供不依赖上下文的访问方式：

```typescript
// stores/user.ts
import { createPinia } from 'pinia'
import type { App } from 'vue'

// 单例 Pinia 实例
let pinia: ReturnType<typeof createPinia>

export function setupStore(app: App) {
  pinia = createPinia()
  app.use(pinia)
}

/**
 * 获取不依赖组件上下文的 Store 实例
 * 用于路由守卫等非组件环境
 */
export function useUserStoreWithout() {
  return useUserStore(pinia)
}

export const useUserStore = defineStore('user', () => {
  // ... Store 实现
})
```

---

### 6. 权限指令和 v-if 优先级冲突

**问题描述**

同时使用 `v-permission` 和 `v-if` 时，出现逻辑冲突或指令不生效的问题。

```vue
<!-- 问题：v-if 为 false 时，v-permission 也不会执行 -->
<template>
  <el-button
    v-if="showButton"
    v-permission="'system:user:edit'"
    @click="handleEdit"
  >
    编辑
  </el-button>
</template>
```

**问题原因**

- Vue指令执行顺序固定：`v-if` 优先级高于自定义指令
- 当 `v-if` 为 false 时，元素不会被渲染，指令也不会执行
- 指令操作的是DOM元素，与Vue的条件渲染有本质区别

**解决方案**

方案一：使用组件包装器：

```vue
<template>
  <!-- 使用权限组件包装 -->
  <PermissionWrapper permission="system:user:edit">
    <el-button v-if="showButton" @click="handleEdit">
      编辑
    </el-button>
  </PermissionWrapper>
</template>

<script setup lang="ts">
import PermissionWrapper from '@/components/PermissionWrapper.vue'
</script>
```

方案二：组合条件判断：

```vue
<template>
  <!-- 将权限检查和其他条件组合 -->
  <el-button
    v-if="showButton && canEdit"
    @click="handleEdit"
  >
    编辑
  </el-button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePermission } from '@/composables/use-permission'

const { hasPermission } = usePermission()

const showButton = ref(true)
const canEdit = computed(() => hasPermission('system:user:edit'))
</script>
```

方案三：创建组合条件组合函数：

```typescript
// composables/use-conditional-permission.ts
import { computed, Ref, MaybeRef, unref } from 'vue'
import { usePermission } from '@/composables/use-permission'

interface ConditionalPermissionOptions {
  permission?: string | string[]
  role?: string | string[]
  condition?: MaybeRef<boolean>
  requireAll?: boolean
}

export function useConditionalPermission(options: ConditionalPermissionOptions) {
  const {
    permission,
    role,
    condition,
    requireAll = false
  } = options

  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles
  } = usePermission()

  /**
   * 综合判断是否显示
   */
  const shouldShow = computed(() => {
    // 自定义条件判断
    if (condition !== undefined && !unref(condition)) {
      return false
    }

    // 权限判断
    if (permission) {
      let hasAuth = false

      if (typeof permission === 'string') {
        hasAuth = hasPermission(permission)
      } else {
        hasAuth = requireAll
          ? hasAllPermissions(permission)
          : hasAnyPermission(permission)
      }

      if (!hasAuth) return false
    }

    // 角色判断
    if (role) {
      let hasRoleAuth = false

      if (typeof role === 'string') {
        hasRoleAuth = hasRole(role)
      } else {
        hasRoleAuth = requireAll
          ? hasAllRoles(role)
          : hasAnyRole(role)
      }

      if (!hasRoleAuth) return false
    }

    return true
  })

  return shouldShow
}
```

使用示例：

```vue
<template>
  <el-button v-if="shouldShowEdit" @click="handleEdit">
    编辑
  </el-button>

  <el-button v-if="shouldShowDelete" type="danger" @click="handleDelete">
    删除
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConditionalPermission } from '@/composables/use-conditional-permission'

const isSelected = ref(false)

// 编辑按钮：需要权限 + 选中状态
const shouldShowEdit = useConditionalPermission({
  permission: 'system:user:edit',
  condition: isSelected
})

// 删除按钮：需要权限 + 管理员角色
const shouldShowDelete = useConditionalPermission({
  permission: 'system:user:delete',
  role: 'admin'
})
</script>
```

---

### 7. 动态权限变更后菜单没有更新

**问题描述**

用户权限被动态修改后，侧边栏菜单没有相应更新，仍显示旧的菜单项。

```typescript
// 权限更新了，但菜单没有刷新
userStore.setPermissions(['system:user:view']) // 移除了编辑权限

// 菜单中仍然显示编辑菜单项
```

**问题原因**

- 菜单数据在首次加载时生成并缓存
- 权限变更时没有触发菜单重新过滤
- 计算属性依赖没有正确设置

**解决方案**

确保菜单与权限联动：

```typescript
// composables/use-dynamic-menu.ts
import { computed, watch, ref } from 'vue'
import { useUserStore } from '@/stores/user'
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

export function useDynamicMenu() {
  const userStore = useUserStore()
  const { hasPermission, hasAnyRole, clearPermissionCache } = usePermission()

  // 原始菜单数据（从后端获取）
  const rawMenus = ref<MenuItem[]>([])

  // 菜单版本号，用于强制刷新
  const menuVersion = ref(0)

  // 过滤后的菜单（响应式）
  const filteredMenus = computed(() => {
    // 触发依赖：版本号、权限列表、角色列表
    const _ = menuVersion.value
    const __ = userStore.permissions
    const ___ = userStore.roles

    return filterMenusByPermission(rawMenus.value)
  })

  /**
   * 根据权限过滤菜单
   */
  function filterMenusByPermission(menus: MenuItem[]): MenuItem[] {
    return menus
      .filter(menu => {
        // 隐藏状态
        if (menu.hidden) return false

        // 权限检查
        if (menu.permission && !hasPermission(menu.permission)) {
          return false
        }

        // 角色检查
        if (menu.roles && menu.roles.length > 0 && !hasAnyRole(menu.roles)) {
          return false
        }

        return true
      })
      .map(menu => ({
        ...menu,
        children: menu.children
          ? filterMenusByPermission(menu.children)
          : undefined
      }))
      .filter(menu => {
        // 移除空的父菜单
        if (menu.children) {
          return menu.children.length > 0
        }
        return true
      })
  }

  /**
   * 设置原始菜单数据
   */
  const setRawMenus = (menus: MenuItem[]) => {
    rawMenus.value = menus
  }

  /**
   * 强制刷新菜单
   */
  const refreshMenus = () => {
    clearPermissionCache()
    menuVersion.value++
  }

  // 监听权限变化，自动刷新菜单
  watch(
    [() => userStore.permissions, () => userStore.roles],
    () => {
      refreshMenus()
    },
    { deep: true }
  )

  return {
    rawMenus,
    filteredMenus,
    setRawMenus,
    refreshMenus
  }
}
```

在布局组件中使用：

```vue
<!-- Layout.vue -->
<template>
  <div class="layout">
    <Sidebar :menus="filteredMenus" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDynamicMenu } from '@/composables/use-dynamic-menu'
import { getMenusApi } from '@/api/menu'

const { filteredMenus, setRawMenus } = useDynamicMenu()

onMounted(async () => {
  // 获取菜单数据
  const menus = await getMenusApi()
  setRawMenus(menus)
})
</script>
```

---

### 8. 大量权限时性能问题

**问题描述**

当用户拥有大量权限（如1000+个）时，权限检查变得缓慢，影响页面渲染性能。

```typescript
// 大量权限时，每次检查都需要遍历
const permissions = ['perm:1', 'perm:2', ... , 'perm:1000']

// 频繁调用性能差
hasPermission('perm:500') // 需要遍历500次才能找到
hasPermission('perm:999') // 需要遍历999次
```

**问题原因**

- 权限列表使用数组存储，查找时间复杂度为 O(n)
- 每次渲染都会触发多次权限检查
- 没有使用高效的数据结构

**解决方案**

使用Set优化权限查找：

```typescript
// composables/use-optimized-permission.ts
import { computed, shallowRef, watch } from 'vue'
import { useUserStore } from '@/stores/user'

export function useOptimizedPermission() {
  const userStore = useUserStore()

  // 使用 Set 存储权限，查找时间复杂度 O(1)
  const permissionSet = shallowRef<Set<string>>(new Set())
  const roleSet = shallowRef<Set<string>>(new Set())

  // 通配符权限
  const hasWildcard = shallowRef(false)
  const isSuperAdmin = shallowRef(false)

  /**
   * 初始化权限集合
   */
  const initPermissionSet = () => {
    const permissions = userStore.permissions || []
    const roles = userStore.roles || []

    // 构建权限Set
    permissionSet.value = new Set(permissions)

    // 构建角色Set
    roleSet.value = new Set(roles.map(r => r.roleKey))

    // 检查通配符权限
    hasWildcard.value = permissions.includes('*:*:*')

    // 检查超级管理员
    isSuperAdmin.value = roleSet.value.has('admin') ||
                         roleSet.value.has('super_admin')
  }

  // 监听权限变化，重建Set
  watch(
    [() => userStore.permissions, () => userStore.roles],
    () => {
      initPermissionSet()
    },
    { deep: true, immediate: true }
  )

  /**
   * 高性能权限检查 O(1)
   */
  const hasPermission = (permission: string): boolean => {
    if (!permission) return false

    // 超级管理员和通配符权限直接返回
    if (isSuperAdmin.value || hasWildcard.value) {
      return true
    }

    // Set查找 O(1)
    return permissionSet.value.has(permission)
  }

  /**
   * 高性能角色检查 O(1)
   */
  const hasRole = (role: string): boolean => {
    if (!role) return false
    return roleSet.value.has(role)
  }

  /**
   * 批量权限检查（任一）
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false

    if (isSuperAdmin.value || hasWildcard.value) {
      return true
    }

    // 提前终止的some更高效
    return permissions.some(p => permissionSet.value.has(p))
  }

  /**
   * 批量权限检查（全部）
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false

    if (isSuperAdmin.value || hasWildcard.value) {
      return true
    }

    return permissions.every(p => permissionSet.value.has(p))
  }

  /**
   * 权限前缀匹配（支持通配符）
   */
  const hasPermissionPrefix = (prefix: string): boolean => {
    if (!prefix) return false

    if (isSuperAdmin.value || hasWildcard.value) {
      return true
    }

    // 遍历Set进行前缀匹配
    for (const perm of permissionSet.value) {
      if (perm.startsWith(prefix)) {
        return true
      }
    }

    return false
  }

  /**
   * 获取权限统计信息
   */
  const getStats = () => ({
    permissionCount: permissionSet.value.size,
    roleCount: roleSet.value.size,
    isSuperAdmin: isSuperAdmin.value,
    hasWildcard: hasWildcard.value
  })

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionPrefix,
    isSuperAdmin: computed(() => isSuperAdmin.value),
    getStats
  }
}
```

使用记忆化进一步优化：

```typescript
// composables/use-memoized-permission.ts
import { useOptimizedPermission } from './use-optimized-permission'

export function useMemoizedPermission() {
  const {
    hasPermission: baseHasPermission,
    hasRole: baseHasRole,
    hasAnyPermission: baseHasAnyPermission,
    hasAllPermissions: baseHasAllPermissions,
    ...rest
  } = useOptimizedPermission()

  // 权限检查结果缓存
  const permissionCache = new Map<string, boolean>()
  const roleCache = new Map<string, boolean>()
  const multiPermCache = new Map<string, boolean>()

  /**
   * 带缓存的权限检查
   */
  const hasPermission = (permission: string): boolean => {
    if (permissionCache.has(permission)) {
      return permissionCache.get(permission)!
    }

    const result = baseHasPermission(permission)
    permissionCache.set(permission, result)
    return result
  }

  /**
   * 带缓存的角色检查
   */
  const hasRole = (role: string): boolean => {
    if (roleCache.has(role)) {
      return roleCache.get(role)!
    }

    const result = baseHasRole(role)
    roleCache.set(role, result)
    return result
  }

  /**
   * 带缓存的批量权限检查
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    const cacheKey = `any:${permissions.sort().join(',')}`

    if (multiPermCache.has(cacheKey)) {
      return multiPermCache.get(cacheKey)!
    }

    const result = baseHasAnyPermission(permissions)
    multiPermCache.set(cacheKey, result)
    return result
  }

  /**
   * 带缓存的批量权限检查
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    const cacheKey = `all:${permissions.sort().join(',')}`

    if (multiPermCache.has(cacheKey)) {
      return multiPermCache.get(cacheKey)!
    }

    const result = baseHasAllPermissions(permissions)
    multiPermCache.set(cacheKey, result)
    return result
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    permissionCache.clear()
    roleCache.clear()
    multiPermCache.clear()
  }

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    clearCache,
    ...rest
  }
}
```

性能对比：

```typescript
// 性能测试
const permissions = Array.from({ length: 1000 }, (_, i) => `perm:${i}`)

// ❌ 原始数组查找 - 平均 O(n/2)
// 1000次查找约需 500,000 次比较

// ✅ Set查找 - O(1)
// 1000次查找约需 1,000 次哈希计算

// ✅ 带缓存的Set查找 - 首次O(1)，后续O(1)缓存读取
// 重复查找零成本
```