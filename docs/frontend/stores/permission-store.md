# 权限状态管理 (permission)

## 介绍

权限状态管理模块(usePermissionStore)是基于 Pinia 实现的权限路由管理核心模块,负责动态路由的生成、权限过滤和多布局路由管理,是实现基于角色的访问控制(RBAC)的关键组件。该模块通过从后端获取路由配置并转换为前端可用的路由对象,实现了灵活的权限控制和菜单管理功能。

**核心特性:**

- **动态路由生成** - 从后端 API 获取路由配置,自动构建应用路由结构,支持多级嵌套路由
- **权限过滤机制** - 基于用户角色(roles)和权限标识(permissions)过滤路由,确保用户只能访问有权限的页面
- **多布局支持** - 管理顶部导航、侧边栏等不同布局的路由格式,支持复杂的页面布局需求
- **组件动态加载** - 使用 `import.meta.glob` 实现视图组件的按需加载,优化应用性能
- **路由冲突检测** - 自动检测路由名称重复问题,避免导航异常和 404 错误
- **灵活的路由处理** - 支持 Layout、ParentView、InnerLink 等特殊组件,满足各种布局场景

## 状态定义

### 核心状态

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export const usePermissionStore = defineStore('permission', () => {
  /**
   * 路由记录
   * @description 所有路由配置的集合,包含静态路由和动态添加的路由
   */
  const routes = ref<RouteRecordRaw[]>([])

  /**
   * 动态添加的路由
   * @description 从后端获取并动态添加的路由配置
   */
  const addRoutes = ref<RouteRecordRaw[]>([])

  /**
   * 默认路由
   * @description 用于基础布局的路由配置
   */
  const defaultRoutes = ref<RouteRecordRaw[]>([])

  /**
   * 顶部栏路由
   * @description 用于顶部导航栏显示的路由配置
   */
  const topbarRouters = ref<RouteRecordRaw[]>([])

  /**
   * 侧边栏路由
   * @description 用于侧边栏菜单显示的路由配置
   */
  const sidebarRouters = ref<RouteRecordRaw[]>([])
})
```

### 状态说明

| 状态 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `routes` | `Ref<RouteRecordRaw[]>` | 所有路由的集合(静态+动态) | `[]` |
| `addRoutes` | `Ref<RouteRecordRaw[]>` | 从后端获取的动态路由 | `[]` |
| `defaultRoutes` | `Ref<RouteRecordRaw[]>` | 用于基础布局的路由配置 | `[]` |
| `topbarRouters` | `Ref<RouteRecordRaw[]>` | 顶部导航栏路由配置 | `[]` |
| `sidebarRouters` | `Ref<RouteRecordRaw[]>` | 侧边栏菜单路由配置 | `[]` |

### 路由配置说明

```typescript
/**
 * 路由配置属性说明
 */
interface RouteConfig {
  // 基础属性
  path: string                     // 路由路径
  name: string                     // 路由名称(必填,用于 keep-alive)
  component: Component | string    // 组件或组件路径字符串
  redirect?: string                // 重定向路径
  children?: RouteConfig[]         // 子路由数组

  // 扩展属性
  hidden?: boolean                 // 是否在侧边栏隐藏(默认 false)
  alwaysShow?: boolean             // 是否始终显示根菜单(默认 false)
  query?: string                   // 默认传递的参数
  roles?: string[]                 // 访问路由所需的角色
  permissions?: string[]           // 访问路由所需的权限

  // Meta 属性
  meta?: {
    title: string                  // 路由标题
    icon?: string                  // 路由图标
    noCache?: boolean              // 是否不缓存(默认 false)
    breadcrumb?: boolean           // 是否显示面包屑(默认 true)
    activeMenu?: string            // 高亮的侧边栏菜单路径
    affix?: boolean                // 是否固定在标签页(默认 false)
    i18nKey?: string               // 国际化key
  }
}
```

## 核心方法

### generateRoutes - 生成动态路由

```typescript
/**
 * 生成路由
 * @description 从后端获取路由数据并处理成可用的路由配置
 * @returns 处理后的路由数组Promise
 */
const generateRoutes = async (): Result<RouteRecordRaw[]> => {
  // 1. 从后端API获取路由数据
  const [err, data] = await getRouters()
  if (err) {
    return [err, null]
  }

  // 2. 深拷贝路由数据用于不同处理场景
  const sdata = JSON.parse(JSON.stringify(data))
  const rdata = JSON.parse(JSON.stringify(data))
  const defaultData = JSON.parse(JSON.stringify(data))

  // 3. 处理不同场景的路由格式
  const sidebarRoutes = filterAsyncRouter(sdata)
  const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)
  const defaultRoutes = filterAsyncRouter(defaultData)

  // 4. 处理动态权限路由
  const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
  asyncRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 5. 设置各类路由到store
  setRoutes(rewriteRoutes)
  setSidebarRouters(constantRoutes.concat(sidebarRoutes))
  setDefaultRoutes(sidebarRoutes)
  setTopbarRoutes(defaultRoutes)

  // 6. 路由name重复检查,避免404问题
  duplicateRouteChecker(asyncRoutes, sidebarRoutes)

  return [null, rewriteRoutes]
}
```

**功能说明:**

1. **获取路由数据** - 调用后端 API 获取用户可访问的路由配置
2. **数据深拷贝** - 为不同场景创建独立的路由数据副本,避免相互影响
3. **路由格式处理** - 转换后端路由配置为前端可用的路由对象
4. **权限路由过滤** - 过滤本地定义的动态路由,只保留有权限的路由
5. **状态更新** - 更新 Store 中的各类路由状态
6. **冲突检测** - 检查路由名称重复,防止导航问题

### filterAsyncRouter - 路由转换

```typescript
/**
 * 遍历后台传来的路由字符串,转换为组件对象
 * @param asyncRouterMap 后台传来的路由字符串
 * @param lastRouter 上一级路由,用于构建嵌套路由
 * @param type 是否是重写路由,为true时会对children进行特殊处理
 * @returns 处理后的路由数组
 */
const filterAsyncRouter = (
  asyncRouterMap: RouteRecordRaw[],
  lastRouter?: RouteRecordRaw,
  type = false
): RouteRecordRaw[] => {
  return asyncRouterMap.filter((route) => {
    // 扁平化处理子路由
    if (type && route.children) {
      route.children = filterChildren(route.children, undefined)
    }

    // Layout ParentView 组件特殊处理
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
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route.children
      delete route.redirect
    }

    return true
  })
}
```

**功能说明:**

1. **组件字符串转换** - 将后端返回的组件路径字符串转换为实际的组件对象
2. **特殊组件处理** - 识别并替换 Layout、ParentView、InnerLink 等特殊组件
3. **动态组件加载** - 使用 `loadView` 函数动态加载视图组件
4. **子路由递归** - 递归处理嵌套路由结构
5. **路由扁平化** - 可选的子路由扁平化处理,用于特定布局场景

### filterDynamicRoutes - 权限过滤

```typescript
/**
 * 动态路由遍历,验证是否具备权限
 * @param routes 路由数组
 * @returns 过滤后的路由数组
 */
const filterDynamicRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  const { hasPermission, hasRole } = useAuth()

  routes.forEach((route) => {
    if (route.permissions) {
      // 检查是否有任一所需权限
      if (hasPermission(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      // 检查是否有任一所需角色
      if (hasRole(route.roles)) {
        res.push(route)
      }
    }
  })

  return res
}
```

**功能说明:**

1. **权限判断** - 检查路由的 `permissions` 属性,验证用户是否有访问权限
2. **角色判断** - 检查路由的 `roles` 属性,验证用户是否有对应角色
3. **灵活过滤** - 支持权限和角色两种过滤方式,满足不同的权限控制需求

### loadView - 动态加载组件

```typescript
/**
 * 加载视图组件
 * @param view 视图路径字符串
 * @param name 组件名称
 * @returns 加载的视图组件
 */
const loadView = (view: any, name: string) => {
  // 匹配views里面所有的.vue文件
  const modules = import.meta.glob('./../../views/**/*.vue')

  let res
  for (const path in modules) {
    // 从完整路径中提取视图路径
    const viewsIndex = path.indexOf('/views/')
    let dir = path.substring(viewsIndex + 7)
    dir = dir.substring(0, dir.lastIndexOf('.vue'))

    if (dir === view) {
      // 创建具有自定义名称的组件
      res = createCustomNameComponent(modules[path], { name })
      return res
    }
  }

  return res
}
```

**功能说明:**

1. **组件匹配** - 使用 `import.meta.glob` 匹配 views 目录下的所有 Vue 组件
2. **路径解析** - 从完整路径中提取视图路径,进行路径匹配
3. **自定义名称** - 为组件设置自定义名称,用于 keep-alive 缓存
4. **懒加载** - 实现组件的按需加载,优化应用性能

### duplicateRouteChecker - 路由冲突检测

```typescript
/**
 * 检查路由name是否重复
 * @param localRoutes 本地路由(静态路由)
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

**功能说明:**

1. **路由展平** - 递归展平嵌套路由结构,获取所有路由对象
2. **名称检查** - 检测路由名称的唯一性
3. **错误提示** - 发现重复名称时,控制台输出错误并弹出通知
4. **问题预防** - 避免路由跳转失败、404 错误和导航高亮异常

## 基本用法

### 1. 在路由守卫中生成动态路由

完整的路由守卫集成示例:

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

    // 已加载路由,检查权限
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      } else {
        return next('/403')
      }
    }

    // 获取用户信息
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

**使用说明:**

- 在用户登录成功后,自动获取用户信息和生成动态路由
- 使用 `router.addRoute` 动态添加后端返回的路由
- 通过 `replace: true` 重新进入路由,确保动态路由生效
- 集成权限检查,无权限时跳转到 403 页面

### 2. 在侧边栏组件中使用路由

在侧边栏菜单组件中显示路由:

```vue
<template>
  <el-scrollbar class="sidebar-scrollbar">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :unique-opened="false"
      :collapse-transition="false"
      mode="vertical"
    >
      <sidebar-item
        v-for="route in sidebarRoutes"
        :key="route.path"
        :item="route"
        :base-path="route.path"
      />
    </el-menu>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/modules/permission'
import { useAppStore } from '@/stores/modules/app'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

// 获取侧边栏路由
const sidebarRoutes = computed(() => {
  return permissionStore.getSidebarRoutes()
})

// 侧边栏是否折叠
const isCollapse = computed(() => {
  return !appStore.sidebar.opened
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  // 如果设置了activeMenu,则使用activeMenu作为高亮菜单
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})
</script>

```

**使用说明:**

- 使用 `getSidebarRoutes()` 获取侧边栏路由配置
- 递归渲染多级菜单结构
- 支持菜单折叠和展开
- 自动高亮当前激活的菜单项

### 3. 渲染菜单项组件

递归渲染多级菜单的 SidebarItem 组件:

```vue
<template>
  <view v-if="!item.hidden">
    <!-- 单个子路由 -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <svg-icon
            v-if="onlyOneChild.meta.icon"
            :icon-class="onlyOneChild.meta.icon"
          />
          <template #title>
            <span>{{ onlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!-- 多个子路由 -->
    <el-sub-menu
      v-else
      :index="resolvePath(item.path)"
      popper-append-to-body
    >
      <template #title>
        <svg-icon
          v-if="item.meta && item.meta.icon"
          :icon-class="item.meta.icon"
        />
        <span>{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { type RouteRecordRaw } from 'vue-router'
import { isExternal } from '@/utils/validators'
import AppLink from './Link.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

interface Props {
  item: RouteRecordRaw
  basePath: string
}

const props = defineProps<Props>()

// 唯一显示的子路由
const onlyOneChild = ref<RouteRecordRaw>({} as RouteRecordRaw)

/**
 * 判断是否只有一个显示的子路由
 */
const hasOneShowingChild = (
  children: RouteRecordRaw[] = [],
  parent: RouteRecordRaw
): boolean => {
  const showingChildren = children.filter((item) => {
    if (item.hidden) {
      return false
    } else {
      // 临时设置唯一显示的子路由
      onlyOneChild.value = item
      return true
    }
  })

  // 只有一个子路由时,显示该子路由
  if (showingChildren.length === 1) {
    return true
  }

  // 没有子路由时,显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

/**
 * 解析路径
 */
const resolvePath = (routePath: string): string => {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return props.basePath + '/' + routePath
}
</script>
```

**使用说明:**

- 递归组件,支持多级嵌套菜单
- 自动判断是渲染单个菜单项还是子菜单
- 支持隐藏菜单项(`hidden: true`)
- 支持强制显示父级菜单(`alwaysShow: true`)

### 4. 在顶部导航中使用路由

在顶部导航栏中显示一级菜单:

```vue
<template>
  <view class="topbar-container">
    <el-menu
      :default-active="activeMenu"
      mode="horizontal"
      @select="handleSelect"
    >
      <topbar-item
        v-for="route in topbarRoutes"
        :key="route.path"
        :item="route"
      />
    </el-menu>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/modules/permission'
import TopbarItem from './TopbarItem.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

// 获取顶部导航路由
const topbarRoutes = computed(() => {
  return permissionStore.getTopbarRoutes()
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

/**
 * 处理菜单选择
 */
const handleSelect = (index: string) => {
  if (index) {
    router.push(index)
  }
}
</script>

```

**使用说明:**

- 使用 `getTopbarRoutes()` 获取顶部导航路由
- 水平布局显示一级菜单
- 点击菜单项时跳转到对应路由
- 自动高亮当前激活的菜单

### 5. 获取所有路由

在面包屑或其他组件中使用所有路由:

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/modules/permission'

const route = useRoute()
const permissionStore = usePermissionStore()

// 获取所有路由
const allRoutes = computed(() => {
  return permissionStore.getRoutes()
})

// 生成面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false
  })

  return matched.map((item) => {
    return {
      path: item.path,
      title: item.meta.title as string
    }
  })
})
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="item.path"
      :to="index < breadcrumbs.length - 1 ? { path: item.path } : undefined"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
```

**使用说明:**

- 使用 `getRoutes()` 获取所有路由配置
- 通过 `route.matched` 获取当前路由的匹配路径
- 生成面包屑导航
- 最后一项不可点击

### 6. 重置路由

用户注销时重置路由:

```typescript
import { resetRouter } from '@/router/router'
import { usePermissionStore } from '@/stores/modules/permission'

/**
 * 用户注销
 */
const handleLogout = async () => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 调用注销API
  const [err] = await userStore.logoutUser()

  // 重置路由
  resetRouter()

  // 清空权限路由状态
  permissionStore.setRoutes([])
  permissionStore.setSidebarRouters([])
  permissionStore.setTopbarRoutes([])
  permissionStore.setDefaultRoutes([])

  // 跳转登录页
  await router.push('/login')
}
```

**使用说明:**

- 调用 `resetRouter()` 重置路由器
- 清空 Permission Store 中的路由状态
- 重新登录后会重新生成路由

## 特殊组件处理

### Layout - 主布局组件

```typescript
// 后端返回的路由配置
{
  path: '/system',
  component: 'Layout',  // 字符串形式
  children: [
    {
      path: 'user',
      component: 'system/user/index',
      name: 'User',
      meta: { title: '用户管理', icon: 'user' }
    }
  ]
}

// 转换后的路由对象
{
  path: '/system',
  component: Layout,  // Layout 组件对象
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user/index.vue'),
      name: 'User',
      meta: { title: '用户管理', icon: 'user' }
    }
  ]
}
```

**功能说明:**

- Layout 是主布局组件,包含顶部导航、侧边栏、内容区域等
- 所有一级菜单通常使用 Layout 作为父组件
- 自动处理子路由的渲染和切换

### ParentView - 嵌套路由容器

```typescript
// 后端返回的路由配置
{
  path: '/system',
  component: 'Layout',
  children: [
    {
      path: 'tool',
      component: 'ParentView',  // 中间层级,没有实际视图
      children: [
        {
          path: 'gen',
          component: 'tool/gen/index',
          name: 'Gen',
          meta: { title: '代码生成', icon: 'code' }
        }
      ]
    }
  ]
}

// 转换后的路由对象
{
  path: '/system',
  component: Layout,
  children: [
    {
      path: 'tool',
      component: ParentView,  // 空路由组件
      children: [
        {
          path: 'gen',
          component: () => import('@/views/tool/gen/index.vue'),
          name: 'Gen',
          meta: { title: '代码生成', icon: 'code' }
        }
      ]
    }
  ]
}
```

**功能说明:**

- ParentView 是一个空的路由容器组件,用于多级菜单
- 没有实际的页面内容,只用于组织路由结构
- 允许创建多级嵌套菜单

### InnerLink - iframe 内嵌页面

```typescript
// 后端返回的路由配置
{
  path: '/monitor',
  component: 'Layout',
  children: [
    {
      path: 'swagger',
      component: 'InnerLink',  // iframe 内嵌
      name: 'Swagger',
      meta: {
        title: 'Swagger',
        icon: 'swagger',
        link: 'http://localhost:8080/swagger-ui.html'
      }
    }
  ]
}

// 转换后的路由对象
{
  path: '/monitor',
  component: Layout,
  children: [
    {
      path: 'swagger',
      component: InnerLink,  // iframe 组件
      name: 'Swagger',
      meta: {
        title: 'Swagger',
        icon: 'swagger',
        link: 'http://localhost:8080/swagger-ui.html'
      }
    }
  ]
}
```

**功能说明:**

- InnerLink 是一个 iframe 容器组件
- 用于在系统内嵌入外部页面
- 通过 `meta.link` 指定要嵌入的 URL

## 多布局路由管理

### 侧边栏路由(原始结构)

```typescript
// 保持原始嵌套结构,用于侧边栏菜单渲染
const sidebarRoutes = filterAsyncRouter(sdata)

// 示例结构
[
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'system' },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'peoples' }
      }
    ]
  }
]
```

**使用场景:**

- 侧边栏菜单渲染
- 保持完整的菜单层级结构
- 支持多级嵌套菜单

### 重写路由(扁平化结构)

```typescript
// 扁平化处理,用于实际路由注册
const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)

// 示例结构
[
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'system' }
  },
  {
    path: '/system/user',
    component: () => import('@/views/system/user/index.vue'),
    name: 'User',
    meta: { title: '用户管理', icon: 'user' }
  },
  {
    path: '/system/role',
    component: () => import('@/views/system/role/index.vue'),
    name: 'Role',
    meta: { title: '角色管理', icon: 'peoples' }
  }
]
```

**使用场景:**

- 实际路由注册
- 扁平化结构,避免过深嵌套
- 简化路由匹配逻辑

### 顶部导航路由

```typescript
// 用于顶部导航栏,通常只包含一级菜单
const topbarRoutes = filterAsyncRouter(defaultData)

// 示例结构
[
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'system' },
    children: [...]
  },
  {
    path: '/monitor',
    component: Layout,
    meta: { title: '系统监控', icon: 'monitor' },
    children: [...]
  }
]
```

**使用场景:**

- 顶部导航栏渲染
- 只显示一级菜单
- 点击后切换侧边栏内容

## 路由权限控制

### 基于角色的权限控制

```typescript
// 后端返回的路由配置
{
  path: '/system/user',
  component: 'system/user/index',
  name: 'User',
  meta: {
    title: '用户管理',
    icon: 'user',
    roles: ['admin', 'common']  // 需要的角色
  }
}

// 权限过滤逻辑
const filterDynamicRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  const { hasRole } = useAuth()

  routes.forEach((route) => {
    if (route.roles) {
      // 检查用户是否有任一所需角色
      if (hasRole(route.roles)) {
        res.push(route)
      }
    } else {
      // 没有角色限制,允许访问
      res.push(route)
    }
  })

  return res
}
```

**使用说明:**

- 在路由 `meta` 中配置 `roles` 数组
- 用户必须拥有数组中的任一角色才能访问
- 适用于粗粒度的权限控制

### 基于权限标识的权限控制

```typescript
// 后端返回的路由配置
{
  path: '/system/user',
  component: 'system/user/index',
  name: 'User',
  meta: {
    title: '用户管理',
    icon: 'user',
    permissions: ['system:user:list']  // 需要的权限
  }
}

// 权限过滤逻辑
const filterDynamicRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  const { hasPermission } = useAuth()

  routes.forEach((route) => {
    if (route.permissions) {
      // 检查用户是否有任一所需权限
      if (hasPermission(route.permissions)) {
        res.push(route)
      }
    } else {
      // 没有权限限制,允许访问
      res.push(route)
    }
  })

  return res
}
```

**使用说明:**

- 在路由 `meta` 中配置 `permissions` 数组
- 用户必须拥有数组中的任一权限才能访问
- 适用于细粒度的权限控制

## 与其他模块协作

### 1. 与 User Store 协作

权限路由依赖用户的角色和权限数据:

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

  // 3. 基于用户权限生成动态路由
  if (permissionStore.routes.length === 0) {
    const [err, accessRoutes] = await permissionStore.generateRoutes()
    if (err) {
      return next('/403')
    }

    // 4. 添加动态路由
    accessRoutes.forEach((route) => {
      router.addRoute(route)
    })

    next({ ...to, replace: true })
  } else {
    next()
  }
})
```

**协作要点:**

- User Store 提供 `roles` 和 `permissions` 数据
- Permission Store 基于这些数据过滤和生成路由
- 必须先获取用户信息,再生成路由

### 2. 与 Layout 组件协作

Permission Store 为 Layout 组件提供菜单数据:

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/modules/permission'
import Sidebar from './components/Sidebar/index.vue'
import Topbar from './components/Topbar/index.vue'

const permissionStore = usePermissionStore()

// 侧边栏菜单数据
const sidebarRoutes = computed(() => {
  return permissionStore.getSidebarRoutes()
})

// 顶部导航菜单数据
const topbarRoutes = computed(() => {
  return permissionStore.getTopbarRoutes()
})
</script>

<template>
  <view class="app-wrapper">
    <topbar :routes="topbarRoutes" />
    <view class="main-container">
      <sidebar :routes="sidebarRoutes" />
      <app-main />
    </view>
  </view>
</template>
```

**协作要点:**

- Layout 组件通过 Permission Store 获取菜单数据
- 根据不同布局需求使用不同的路由数据
- 自动响应路由数据的变化

### 3. 与 TagsView Store 协作

Permission Store 提供路由信息用于标签页管理:

```typescript
import { usePermissionStore } from '@/stores/modules/permission'
import { useTagsViewStore } from '@/stores/modules/tagsView'

export const useTagsView = () => {
  const permissionStore = usePermissionStore()
  const tagsViewStore = useTagsViewStore()

  /**
   * 添加标签页
   */
  const addTag = (route: RouteLocationNormalized) => {
    // 检查路由是否允许缓存
    if (route.meta && !route.meta.noCache) {
      tagsViewStore.addVisitedView(route)
      tagsViewStore.addCachedView(route)
    }
  }

  /**
   * 关闭标签页
   */
  const closeTag = (route: RouteLocationNormalized) => {
    tagsViewStore.delVisitedView(route)
    tagsViewStore.delCachedView(route)
  }

  return {
    addTag,
    closeTag
  }
}
```

**协作要点:**

- TagsView 基于路由 `meta.noCache` 决定是否缓存
- 固定标签页(`meta.affix`)不可关闭
- 标签页标题使用路由 `meta.title`

### 4. 与路由守卫协作

Permission Store 与路由守卫协作实现权限控制:

```typescript
import { useAuth } from '@/composables/useAuth'

router.beforeEach(async (to, from, next) => {
  const { canAccessRoute } = useAuth()
  const permissionStore = usePermissionStore()

  // 生成路由后检查权限
  if (permissionStore.routes.length > 0) {
    if (canAccessRoute(to)) {
      return next()
    } else {
      return next('/403')
    }
  }

  // 生成路由
  const [err, accessRoutes] = await permissionStore.generateRoutes()
  if (err) {
    return next('/403')
  }

  accessRoutes.forEach((route) => {
    router.addRoute(route)
  })

  next({ ...to, replace: true })
})
```

**协作要点:**

- 路由守卫调用 `generateRoutes()` 生成路由
- 使用 `canAccessRoute()` 检查路由访问权限
- 动态添加路由后重新进入目标路由

## 性能优化

### 1. 路由懒加载

使用 `import.meta.glob` 实现组件的懒加载:

```typescript
// 匹配所有视图组件
const modules = import.meta.glob('./../../views/**/*.vue')

// 动态加载组件
const loadView = (view: any, name: string) => {
  for (const path in modules) {
    const viewsIndex = path.indexOf('/views/')
    let dir = path.substring(viewsIndex + 7)
    dir = dir.substring(0, dir.lastIndexOf('.vue'))

    if (dir === view) {
      // 创建懒加载组件
      return createCustomNameComponent(modules[path], { name })
    }
  }
}
```

**优化效果:**

- 按需加载组件,减少首屏加载时间
- 提高应用启动速度
- 降低内存占用

### 2. 组件缓存(keep-alive)

配合 keep-alive 实现页面缓存:

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTagsViewStore } from '@/stores/modules/tagsView'

const tagsViewStore = useTagsViewStore()

// 需要缓存的视图名称列表
const cachedViews = computed(() => {
  return tagsViewStore.cachedViews
})
</script>
```

**优化效果:**

- 缓存已访问的页面,切换时无需重新渲染
- 保持页面状态(滚动位置、表单输入等)
- 提升用户体验

**注意事项:**

- 组件 `name` 必须与路由 `name` 一致
- 使用 `meta.noCache: true` 禁用缓存

### 3. 路由数据缓存

避免重复生成路由:

```typescript
const generateRoutes = async (): Result<RouteRecordRaw[]> => {
  // 已生成过路由,直接返回
  if (routes.value.length > 0) {
    return [null, routes.value]
  }

  // 从后端获取路由数据
  const [err, data] = await getRouters()
  if (err) {
    return [err, null]
  }

  // 处理路由...
  // ...

  return [null, rewriteRoutes]
}
```

**优化效果:**

- 避免重复的 API 请求
- 减少路由处理开销
- 提高路由切换速度

### 4. 路由预加载

提前加载可能访问的路由:

```typescript
// 在空闲时间预加载常用路由
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    const commonRoutes = [
      '/system/user',
      '/system/role',
      '/system/menu'
    ]

    commonRoutes.forEach((path) => {
      router.resolve(path)
    })
  })
}
```

**优化效果:**

- 提前加载常用页面的组件
- 减少首次访问时的等待时间
- 提升用户体验

## 最佳实践

### 1. 确保路由名称唯一

**推荐做法** ✅

```typescript
// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/system/user',
    component: () => import('@/views/system/user/index.vue'),
    name: 'SystemUser',  // ✅ 唯一的路由名称
    meta: { title: '用户管理' }
  },
  {
    path: '/monitor/user',
    component: () => import('@/views/monitor/user/index.vue'),
    name: 'MonitorUser',  // ✅ 唯一的路由名称
    meta: { title: '在线用户' }
  }
]
```

**不推荐做法** ❌

```typescript
// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/system/user',
    component: () => import('@/views/system/user/index.vue'),
    name: 'User',  // ❌ 重复的路由名称
    meta: { title: '用户管理' }
  },
  {
    path: '/monitor/user',
    component: () => import('@/views/monitor/user/index.vue'),
    name: 'User',  // ❌ 重复的路由名称
    meta: { title: '在线用户' }
  }
]
```

### 2. 组件名称与路由名称一致

**推荐做法** ✅

```vue
<!-- views/system/user/index.vue -->
<script lang="ts" setup>
defineOptions({
  name: 'SystemUser'  // ✅ 与路由名称一致
})
</script>
```

```typescript
// 路由配置
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  name: 'SystemUser',  // ✅ 与组件名称一致
  meta: { title: '用户管理' }
}
```

**说明:**

- keep-alive 通过组件名称缓存组件
- 组件名称必须与路由名称一致才能正确缓存

### 3. 合理使用路由懒加载

**推荐做法** ✅

```typescript
// 路由配置 - 使用懒加载
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),  // ✅ 懒加载
  name: 'SystemUser',
  meta: { title: '用户管理' }
}
```

**不推荐做法** ❌

```typescript
import UserIndex from '@/views/system/user/index.vue'  // ❌ 同步导入

// 路由配置
{
  path: '/system/user',
  component: UserIndex,  // ❌ 同步加载
  name: 'SystemUser',
  meta: { title: '用户管理' }
}
```

### 4. 避免过深的路由嵌套

**推荐做法** ✅

```typescript
// 路由配置 - 2-3 层嵌套
[
  {
    path: '/system',
    component: Layout,
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User'
      }
    ]
  }
]
```

**不推荐做法** ❌

```typescript
// 路由配置 - 过深嵌套(4层+)
[
  {
    path: '/system',
    component: Layout,
    children: [
      {
        path: 'admin',
        component: ParentView,
        children: [
          {
            path: 'manage',
            component: ParentView,
            children: [
              {
                path: 'user',
                component: () => import('@/views/system/admin/manage/user/index.vue'),
                name: 'User'
              }
            ]
          }
        ]
      }
    ]
  }
]
```

**说明:**

- 建议路由嵌套不超过 3 层
- 过深嵌套会增加路由匹配复杂度
- 影响性能和可维护性

### 5. 正确使用 hidden 和 alwaysShow

**推荐做法** ✅

```typescript
// 编辑页面 - 隐藏在菜单中
{
  path: '/system/user/edit/:id',
  component: () => import('@/views/system/user/edit.vue'),
  name: 'UserEdit',
  hidden: true,  // ✅ 隐藏在菜单中
  meta: { title: '编辑用户' }
}

// 单个子路由 - 强制显示父级
{
  path: '/dashboard',
  component: Layout,
  alwaysShow: true,  // ✅ 始终显示父级菜单
  children: [
    {
      path: 'index',
      component: () => import('@/views/dashboard/index.vue'),
      name: 'Dashboard',
      meta: { title: '控制台' }
    }
  ]
}
```

### 6. 使用 redirect 设置默认子路由

**推荐做法** ✅

```typescript
{
  path: '/system',
  component: Layout,
  redirect: '/system/user',  // ✅ 设置默认子路由
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user/index.vue'),
      name: 'User',
      meta: { title: '用户管理' }
    }
  ]
}
```

**说明:**

- 访问 `/system` 时自动重定向到 `/system/user`
- 提升用户体验

### 7. 合理配置路由 meta 信息

**推荐做法** ✅

```typescript
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  name: 'User',
  meta: {
    title: '用户管理',      // ✅ 页面标题
    icon: 'user',           // ✅ 菜单图标
    noCache: false,         // ✅ 允许缓存
    breadcrumb: true,       // ✅ 显示面包屑
    affix: false,           // ✅ 不固定标签页
    roles: ['admin'],       // ✅ 角色权限
    permissions: ['system:user:list']  // ✅ 权限标识
  }
}
```

### 8. 动态路由添加后重新进入

**推荐做法** ✅

```typescript
router.beforeEach(async (to, from, next) => {
  // 生成动态路由
  const [err, accessRoutes] = await permissionStore.generateRoutes()

  if (!err) {
    // 添加动态路由
    accessRoutes.forEach((route) => {
      router.addRoute(route)
    })

    // ✅ 重新进入目标路由,确保动态路由生效
    next({ ...to, replace: true })
  }
})
```

**不推荐做法** ❌

```typescript
router.beforeEach(async (to, from, next) => {
  const [err, accessRoutes] = await permissionStore.generateRoutes()

  if (!err) {
    accessRoutes.forEach((route) => {
      router.addRoute(route)
    })

    // ❌ 直接放行,动态路由可能未生效
    next()
  }
})
```

### 9. 注销时清空路由状态

**推荐做法** ✅

```typescript
const handleLogout = async () => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 注销用户
  await userStore.logoutUser()

  // ✅ 重置路由
  resetRouter()

  // ✅ 清空权限路由状态
  permissionStore.setRoutes([])
  permissionStore.setSidebarRouters([])
  permissionStore.setTopbarRoutes([])

  // 跳转登录页
  await router.push('/login')
}
```

### 10. 使用 storeToRefs 保持响应式

**推荐做法** ✅

```typescript
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/modules/permission'

const permissionStore = usePermissionStore()

// ✅ 使用 storeToRefs 保持响应式
const { sidebarRouters, topbarRouters } = storeToRefs(permissionStore)
```

**不推荐做法** ❌

```typescript
import { usePermissionStore } from '@/stores/modules/permission'

const permissionStore = usePermissionStore()

// ❌ 直接解构会丢失响应式
const { sidebarRouters, topbarRouters } = permissionStore
```

## 常见问题

### 1. 动态路由添加后无法访问

**问题原因:**

- 动态路由添加后没有重新进入路由
- 路由守卫逻辑错误导致死循环

**解决方案:**

```typescript
router.beforeEach(async (to, from, next) => {
  const permissionStore = usePermissionStore()

  // 检查是否已生成路由
  if (permissionStore.routes.length > 0) {
    return next()
  }

  // 生成动态路由
  const [err, accessRoutes] = await permissionStore.generateRoutes()
  if (err) {
    return next('/403')
  }

  // 添加动态路由
  accessRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // ✅ 重新进入目标路由
  next({ ...to, replace: true })
})
```

### 2. 路由名称重复导致 404

**问题原因:**

- 多个路由使用了相同的 `name` 属性
- Vue Router 只会保留最后一个同名路由

**解决方案:**

```typescript
// 使用路由冲突检测
duplicateRouteChecker(localRoutes, dynamicRoutes)

// 或者手动确保路由名称唯一
const routes: RouteRecordRaw[] = [
  {
    path: '/system/user',
    name: 'SystemUser',  // ✅ 添加模块前缀
    component: () => import('@/views/system/user/index.vue')
  },
  {
    path: '/monitor/user',
    name: 'MonitorUser',  // ✅ 添加模块前缀
    component: () => import('@/views/monitor/user/index.vue')
  }
]
```

### 3. keep-alive 缓存不生效

**问题原因:**

- 组件 `name` 与路由 `name` 不一致
- 路由配置了 `meta.noCache: true`

**解决方案:**

```vue
<!-- UserIndex.vue -->
<script lang="ts" setup>
defineOptions({
  name: 'SystemUser'  // ✅ 与路由名称一致
})
</script>
```

```typescript
// 路由配置
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  name: 'SystemUser',  // ✅ 与组件名称一致
  meta: {
    title: '用户管理',
    noCache: false  // ✅ 允许缓存
  }
}
```

### 4. 菜单不显示或显示错误

**问题原因:**

- 路由配置了 `hidden: true`
- 路由没有 `meta.title` 属性
- 用户没有访问权限

**解决方案:**

```typescript
// 检查路由配置
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  name: 'SystemUser',
  hidden: false,  // ✅ 确保不隐藏
  meta: {
    title: '用户管理',  // ✅ 必须有标题
    icon: 'user'
  },
  roles: ['admin'],  // 检查用户是否有此角色
  permissions: ['system:user:list']  // 检查用户是否有此权限
}
```

### 5. 刷新页面后菜单消失

**问题原因:**

- Permission Store 状态在页面刷新后丢失
- 路由守卫未正确重新生成路由

**解决方案:**

```typescript
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 有 token 但路由为空,重新生成路由
  if (userStore.token && permissionStore.routes.length === 0) {
    // 确保有用户信息
    if (userStore.roles.length === 0) {
      await userStore.fetchUserInfo()
    }

    // 重新生成路由
    const [err, accessRoutes] = await permissionStore.generateRoutes()
    if (!err) {
      accessRoutes.forEach((route) => {
        router.addRoute(route)
      })
      return next({ ...to, replace: true })
    }
  }

  next()
})
```

## API

### 状态

| 名称 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `routes` | `Ref<RouteRecordRaw[]>` | 所有路由的集合(静态+动态) | `[]` |
| `addRoutes` | `Ref<RouteRecordRaw[]>` | 从后端获取的动态路由 | `[]` |
| `defaultRoutes` | `Ref<RouteRecordRaw[]>` | 用于基础布局的路由配置 | `[]` |
| `topbarRouters` | `Ref<RouteRecordRaw[]>` | 顶部导航栏路由配置 | `[]` |
| `sidebarRouters` | `Ref<RouteRecordRaw[]>` | 侧边栏菜单路由配置 | `[]` |

### 方法

| 名称 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `generateRoutes` | `()` | `Result<RouteRecordRaw[]>` | 生成动态路由 |
| `getRoutes` | `()` | `RouteRecordRaw[]` | 获取所有路由 |
| `getDefaultRoutes` | `()` | `RouteRecordRaw[]` | 获取默认路由 |
| `getSidebarRoutes` | `()` | `RouteRecordRaw[]` | 获取侧边栏路由 |
| `getTopbarRoutes` | `()` | `RouteRecordRaw[]` | 获取顶部导航路由 |
| `setRoutes` | `(routes: RouteRecordRaw[])` | `void` | 设置路由 |
| `setDefaultRoutes` | `(routes: RouteRecordRaw[])` | `void` | 设置默认路由 |
| `setSidebarRouters` | `(routes: RouteRecordRaw[])` | `void` | 设置侧边栏路由 |
| `setTopbarRoutes` | `(routes: RouteRecordRaw[])` | `void` | 设置顶部导航路由 |

### 工具函数

| 名称 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `filterAsyncRouter` | `(asyncRouterMap, lastRouter?, type?)` | `RouteRecordRaw[]` | 转换路由配置 |
| `filterDynamicRoutes` | `(routes)` | `RouteRecordRaw[]` | 权限过滤路由 |
| `loadView` | `(view, name)` | `Component` | 动态加载组件 |
| `duplicateRouteChecker` | `(localRoutes, routes)` | `void` | 检测路由冲突 |

## 总结

权限状态管理模块是整个应用权限控制的核心,通过 Pinia 实现了完整的动态路由管理功能。本文档详细介绍了:

**核心功能:**
- 动态路由生成和权限过滤
- 多布局路由管理
- 组件动态加载和路由冲突检测

**技术实现:**
- 基于 Pinia 的响应式状态管理
- 使用 `import.meta.glob` 实现懒加载
- 支持 Layout、ParentView、InnerLink 特殊组件
- 路由名称重复检测机制

**模块协作:**
- 与 User Store 协作获取用户权限
- 与 Layout 组件协作渲染菜单
- 与 TagsView Store 协作管理标签页
- 与路由守卫协作实现权限控制

**最佳实践:**
- 确保路由名称唯一
- 组件名称与路由名称一致
- 合理使用路由懒加载
- 避免过深的路由嵌套
- 正确使用 hidden 和 alwaysShow
- 动态路由添加后重新进入
- 注销时清空路由状态

通过遵循本文档的规范和最佳实践,可以构建灵活、高效、易维护的权限路由系统。
