# 权限与动态路由

## 介绍

权限与动态路由系统是 RuoYi-Plus 前端框架的核心安全机制，基于 RBAC（Role-Based Access Control，基于角色的访问控制）模型实现。系统通过用户-角色-权限的三层架构，提供从路由级别到按钮级别的精细化权限控制能力。

**核心特性:**

- **动态路由生成** - 根据用户权限从后端获取菜单数据，动态构建可访问路由
- **多级权限控制** - 支持路由级、组件级、按钮级三层权限控制粒度
- **灵活的权限指令** - 提供 `v-permi`、`v-role`、`v-auth` 等多种权限指令
- **组合式权限验证** - 基于 `useAuth` Composable 的编程式权限检查
- **多角色支持** - 支持用户同时拥有多个角色，权限自动合并
- **租户权限隔离** - 支持多租户场景下的权限隔离控制
- **路由守卫集成** - 与 Vue Router 深度集成，实现自动权限验证
- **白名单机制** - 支持配置无需登录即可访问的页面白名单
- **进度条反馈** - 路由切换时显示进度条，提升用户体验
- **重复路由检测** - 自动检测并警告重复的路由名称配置

## 权限系统架构

### RBAC 权限模型

系统采用经典的 RBAC 权限模型，通过用户、角色、权限三层结构实现权限管理:

```
┌─────────────────────────────────────────────────────────────────┐
│                        权限系统架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐      ┌──────────┐      ┌──────────────────┐     │
│   │   用户   │ ──── │   角色   │ ──── │      权限        │     │
│   │  (User)  │  N:M │  (Role)  │  N:M │  (Permission)    │     │
│   └──────────┘      └──────────┘      └──────────────────┘     │
│        │                 │                     │                │
│        ▼                 ▼                     ▼                │
│   ┌──────────┐      ┌──────────┐      ┌──────────────────┐     │
│   │ userInfo │      │  roles   │      │   permissions    │     │
│   │  userId  │      │ ['admin']│      │ ['system:user:*']│     │
│   │ userName │      │ ['user'] │      │                  │     │
│   └──────────┘      └──────────┘      └──────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**核心概念说明:**

| 概念 | 说明 | 示例 |
|------|------|------|
| 用户 (User) | 系统的实际使用者 | 张三、李四 |
| 角色 (Role) | 权限的集合，用于分组管理 | admin、editor、user |
| 权限 (Permission) | 具体的操作权限标识 | `system:user:add` |

### 权限编码规范

权限编码采用三段式命名规范: `模块:资源:操作`

```typescript
// 权限编码格式
const permissions = [
  'system:user:view',      // 系统模块:用户资源:查看操作
  'system:user:add',       // 系统模块:用户资源:新增操作
  'system:user:update',    // 系统模块:用户资源:修改操作
  'system:user:delete',    // 系统模块:用户资源:删除操作
  'system:user:export',    // 系统模块:用户资源:导出操作
  'system:user:import',    // 系统模块:用户资源:导入操作
  'system:role:view',      // 系统模块:角色资源:查看操作
  'system:role:add',       // 系统模块:角色资源:新增操作
  'monitor:online:view',   // 监控模块:在线用户:查看操作
  'monitor:online:forceLogout', // 监控模块:在线用户:强制退出
]

// 特殊权限标识
const ALL_PERMISSION = '*:*:*'  // 通配符权限，表示拥有所有权限
```

### 角色层级

系统定义了以下角色层级:

| 角色标识 | 角色名称 | 权限说明 |
|----------|----------|----------|
| `superadmin` | 超级管理员 | 拥有所有权限，不受权限限制 |
| `admin` | 租户管理员 | 拥有所属租户内的所有权限 |
| 自定义角色 | 普通角色 | 根据分配的权限进行控制 |

## 用户权限数据结构

### 用户信息接口

```typescript
/**
 * 用户信息接口
 */
interface UserInfo {
  /** 用户ID */
  userId: number | string
  /** 用户账号 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 用户头像 */
  avatar: string
  /** 用户邮箱 */
  email: string
  /** 手机号码 */
  phonenumber: string
  /** 用户性别 (0男 1女 2未知) */
  sex: string
  /** 所属部门ID */
  deptId: number | string
  /** 所属部门名称 */
  deptName: string
  /** 所属租户ID */
  tenantId: string
  /** 角色编码数组 */
  roles: string[]
  /** 权限编码数组 */
  permissions: string[]
}
```

### 用户状态管理

用户权限信息存储在 Pinia Store 中:

```typescript
// stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  // 用户令牌
  const token = ref<string>('')

  // 用户基本信息
  const userInfo = ref<UserInfo | null>(null)

  // 用户角色列表
  const roles = ref<string[]>([])

  // 用户权限列表
  const permissions = ref<string[]>([])

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (): Result<UserInfo> => {
    const [err, data] = await getUserInfo()
    if (err) {
      return [err, null]
    }

    // 设置用户信息
    userInfo.value = data.user
    roles.value = data.roles || []
    permissions.value = data.permissions || []

    return [null, data.user]
  }

  /**
   * 用户登出
   */
  const logoutUser = async (): Result<void> => {
    const [err] = await logout()

    // 清空用户状态
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []

    // 清除本地存储
    removeToken()

    return [err, null]
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    fetchUserInfo,
    logoutUser
  }
})
```

## 动态路由生成

### 路由生成流程

动态路由生成是权限系统的核心功能，其完整流程如下:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        动态路由生成流程                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐      │
│   │ 1. 获取菜单  │ ──▶ │ 2. 构建路由  │ ──▶ │ 3. 组件动态加载     │      │
│   │   API 请求   │     │   树结构     │     │   loadView()       │      │
│   └─────────────┘     └─────────────┘     └─────────────────────┘      │
│          │                   │                      │                   │
│          ▼                   ▼                      ▼                   │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐      │
│   │ 后端返回菜单 │     │ 递归处理    │     │ import.meta.glob    │      │
│   │   JSON 数据  │     │ 子路由      │     │ 动态导入组件        │      │
│   └─────────────┘     └─────────────┘     └─────────────────────┘      │
│                                                      │                   │
│                                                      ▼                   │
│                              ┌─────────────────────────────────────┐    │
│                              │ 4. 权限过滤                          │    │
│                              │    filterDynamicRoutes()            │    │
│                              └─────────────────────────────────────┘    │
│                                                      │                   │
│                                                      ▼                   │
│                              ┌─────────────────────────────────────┐    │
│                              │ 5. 添加到路由器                       │    │
│                              │    router.addRoute()                │    │
│                              └─────────────────────────────────────┘    │
│                                                      │                   │
│                                                      ▼                   │
│                              ┌─────────────────────────────────────┐    │
│                              │ 6. 重复检测                          │    │
│                              │    duplicateRouteChecker()          │    │
│                              └─────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 路由生成实现

```typescript
// stores/modules/permission.ts
export const usePermissionStore = defineStore('permission', () => {
  // 所有路由配置
  const routes = ref<RouteRecordRaw[]>([])

  // 动态添加的路由
  const addRoutes = ref<RouteRecordRaw[]>([])

  // 侧边栏路由
  const sidebarRouters = ref<RouteRecordRaw[]>([])

  // 顶部栏路由
  const topbarRouters = ref<RouteRecordRaw[]>([])

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
    const sidebarRoutes = filterAsyncRouter(sdata)
    const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)
    const defaultRoutes = filterAsyncRouter(defaultData)

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

  return {
    routes,
    sidebarRouters,
    topbarRouters,
    generateRoutes,
    getRoutes,
    getSidebarRoutes,
    getTopbarRoutes
  }
})
```

### 菜单数据转路由

后端返回的菜单数据需要转换为 Vue Router 可用的路由配置:

```typescript
/**
 * 遍历后台传来的路由字符串，转换为组件对象
 * @param asyncRouterMap 后台传来的路由字符串
 * @param lastRouter 上一级路由
 * @param type 是否是重写路由
 */
const filterAsyncRouter = (
  asyncRouterMap: RouteRecordRaw[],
  lastRouter?: RouteRecordRaw,
  type = false
): RouteRecordRaw[] => {
  return asyncRouterMap.filter((route) => {
    // 处理子路由重写
    if (type && route.children) {
      route.children = filterChildren(route.children, undefined)
    }

    // 处理特殊组件
    if (route.component?.toString() === 'Layout') {
      // 主布局组件
      route.component = Layout
    } else if (route.component?.toString() === 'ParentView') {
      // 父级视图组件（用于多级菜单）
      route.component = ParentView
    } else if (route.component?.toString() === 'InnerLink') {
      // 内嵌链接组件
      route.component = InnerLink
    } else {
      // 动态加载视图组件
      route.component = loadView(route.component, route.name as string)
    }

    // 递归处理子路由
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route.children
      delete route.redirect
    }

    return true
  })
}

/**
 * 过滤子路由，构建完整路径
 */
const filterChildren = (
  childrenMap: RouteRecordRaw[],
  lastRouter?: RouteRecordRaw
): RouteRecordRaw[] => {
  let children: RouteRecordRaw[] = []

  childrenMap.forEach((el) => {
    // 构建完整子路由路径
    el.path = lastRouter ? `${lastRouter.path}/${el.path}` : el.path

    if (el.children?.length && el.component?.toString() === 'ParentView') {
      // ParentView组件的子路由需要特殊处理
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })

  return children
}
```

### 组件动态加载

使用 Vite 的 `import.meta.glob` 实现组件动态加载:

```typescript
// 匹配views目录下所有.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

/**
 * 加载视图组件
 * @param view 视图路径字符串
 * @param name 组件名称
 */
const loadView = (view: any, name: string) => {
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

/**
 * 创建自定义名称组件
 * 用于确保组件有正确的name属性，支持keep-alive缓存
 */
const createCustomNameComponent = (
  loader: () => Promise<any>,
  options: { name: string }
) => {
  return defineAsyncComponent({
    loader,
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    delay: 200,
    timeout: 30000,
    onError(error, retry, fail, attempts) {
      if (attempts <= 3) {
        retry()
      } else {
        fail()
      }
    }
  })
}
```

### 权限过滤

根据用户权限过滤动态路由:

```typescript
/**
 * 动态路由遍历，验证是否具备权限
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

### 重复路由检测

防止路由名称重复导致的导航问题:

```typescript
/**
 * 检查路由name是否重复
 * @param localRoutes 本地静态路由
 * @param routes 动态路由
 */
const duplicateRouteChecker = (
  localRoutes: Route[],
  routes: Route[]
): void => {
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

## 路由守卫

### 守卫配置

路由守卫负责控制路由访问权限和用户状态验证:

```typescript
// router/guard.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 进度条配置
NProgress.configure({ showSpinner: false })

// 白名单列表 - 不需要登录就可以访问的页面
const WHITE_LIST = [
  '/login',
  '/register',
  '/forgotPassword',
  '/socialCallback',
  '/register*',
  '/register/*',
  '/401',
  '/home'
]

// 路由守卫内部状态 - 防止重复获取用户信息
let isFetchingUserInfo = false

/**
 * 检查路径是否在白名单中
 */
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
    // 开始进度条
    NProgress.start()

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const { canAccessRoute, isLoggedIn } = useAuth()

    // 未登录状态处理
    if (!isLoggedIn.value) {
      isFetchingUserInfo = false

      // 白名单直接通过
      if (isInWhiteList(to.path)) {
        return next()
      }

      // 重定向到登录页
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // 已登录状态处理
    // 访问登录页时重定向到首页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 白名单页面直接通过
    if (isInWhiteList(to.path)) {
      return next()
    }

    // 已加载用户信息，检查路由访问权限
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      } else {
        return next('/403')
      }
    }

    // 防止重复获取用户信息
    if (isFetchingUserInfo) {
      return next()
    }

    isFetchingUserInfo = true
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
      }
      return next()
    }

    isReLogin.show = false

    // 生成动态路由
    const [generateRoutesErr, accessRoutes] = await permissionStore.generateRoutes()
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

    // 检查目标路由是否有权限访问
    if (!canAccessRoute(to)) {
      return next('/403')
    }

    // 确保addRoutes已完成
    next({
      path: to.path,
      replace: true,
      params: to.params,
      query: to.query,
      hash: to.hash,
      name: to.name as string
    })
  })

  // 路由后置守卫
  router.afterEach((to) => {
    // 结束进度条
    NProgress.done()

    // 设置页面标题
    const layout = useLayout()
    if (to.meta.title) {
      layout.setTitle(to.meta.title as string)
    }
  })
}
```

### 守卫验证流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        路由守卫验证流程                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐                                                      │
│   │ 用户访问路由  │                                                      │
│   └──────┬───────┘                                                      │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐     是      ┌─────────────┐                          │
│   │ 检查登录状态  │ ──────────▶ │ 检查白名单   │                          │
│   └──────┬───────┘             └──────┬──────┘                          │
│          │ 否                          │                                 │
│          ▼                             ▼                                 │
│   ┌──────────────┐     是      ┌─────────────┐     否                   │
│   │ 在白名单中?   │ ──────────▶ │  直接访问    │ ◀────┐                   │
│   └──────┬───────┘             └─────────────┘      │                   │
│          │ 否                                        │                   │
│          ▼                                           │                   │
│   ┌──────────────┐                                   │                   │
│   │ 跳转登录页    │                                   │                   │
│   └──────────────┘                                   │                   │
│                                                      │                   │
│          ┌───────────────────────────────────────────┘                   │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐     是      ┌─────────────┐                          │
│   │ 已有角色信息? │ ──────────▶ │ 检查路由权限 │                          │
│   └──────┬───────┘             └──────┬──────┘                          │
│          │ 否                          │                                 │
│          ▼                             ▼                                 │
│   ┌──────────────┐             ┌─────────────┐     否                   │
│   │ 获取用户信息  │             │   有权限?    │ ──────▶ 403页面          │
│   └──────┬───────┘             └──────┬──────┘                          │
│          │                             │ 是                              │
│          ▼                             ▼                                 │
│   ┌──────────────┐             ┌─────────────┐                          │
│   │ 生成动态路由  │ ──────────▶ │  允许访问    │                          │
│   └──────────────┘             └─────────────┘                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 静态路由配置

### 公共路由

不受权限控制的静态路由配置:

```typescript
// router/modules/constant.ts
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

  // 404页面
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

  // 首页
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
          affix: true,
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

### 路由配置属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `path` | `string` | 路由路径 |
| `name` | `string` | 路由名称（必须唯一） |
| `component` | `Component` | 路由组件 |
| `redirect` | `string` | 重定向路径 |
| `hidden` | `boolean` | 是否在侧边栏隐藏 |
| `alwaysShow` | `boolean` | 是否总是显示根路由 |
| `permissions` | `string[]` | 所需权限列表 |
| `roles` | `string[]` | 所需角色列表 |

### 路由 Meta 配置

| Meta 属性 | 类型 | 说明 |
|-----------|------|------|
| `title` | `string` | 页面标题 |
| `icon` | `string` | 图标名称 |
| `noCache` | `boolean` | 是否禁用缓存 |
| `breadcrumb` | `boolean` | 是否在面包屑显示 |
| `affix` | `boolean` | 是否固定在标签栏 |
| `activeMenu` | `string` | 激活的菜单路径 |
| `i18nKey` | `string` | 国际化键值 |
| `permissions` | `string[]` | 路由访问权限 |
| `roles` | `string[]` | 路由访问角色 |

## 权限验证机制

### useAuth Composable

`useAuth` 是权限验证的核心 Composable，提供丰富的权限检查方法:

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const userStore = useUserStore()

  // 特殊角色标识
  const SUPER_ADMIN = 'superadmin'
  const TENANT_ADMIN = 'admin'
  const ALL_PERMISSION = '*:*:*'

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
   * 检查是否为任意级别管理员
   */
  const isAnyAdmin = (roleKey?: string): boolean => {
    if (roleKey) {
      return roleKey === SUPER_ADMIN || roleKey === TENANT_ADMIN
    }
    return isSuperAdmin() || isTenantAdmin()
  }

  /**
   * 检查是否拥有指定权限（OR逻辑）
   */
  const hasPermission = (
    permission: string | string[],
    superAdminRole?: string
  ): boolean => {
    if (!permission || permission.length === 0) {
      console.warn('权限参数不能为空')
      return false
    }

    const userPermissions = userStore.permissions

    // 超级管理员拥有所有权限
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    // 通配符权限
    if (userPermissions.includes(ALL_PERMISSION)) {
      return true
    }

    // 数组：满足任一权限
    if (Array.isArray(permission)) {
      return permission.some(perm => userPermissions.includes(perm))
    }

    // 单个权限检查
    return userPermissions.includes(permission)
  }

  /**
   * 检查是否拥有所有指定权限（AND逻辑）
   */
  const hasAllPermissions = (
    permissions: string[],
    superAdminRole?: string
  ): boolean => {
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    const userPermissions = userStore.permissions

    if (userPermissions.includes(ALL_PERMISSION)) {
      return true
    }

    return permissions.every(perm => userPermissions.includes(perm))
  }

  /**
   * 检查是否拥有指定角色（OR逻辑）
   */
  const hasRole = (
    role: string | string[],
    superAdminRole?: string
  ): boolean => {
    if (!role || role.length === 0) {
      console.warn('角色参数不能为空')
      return false
    }

    const userRoles = userStore.roles

    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r))
    }

    return userRoles.includes(role)
  }

  /**
   * 检查是否拥有所有指定角色（AND逻辑）
   */
  const hasAllRoles = (
    roles: string[],
    superAdminRole?: string
  ): boolean => {
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    const userRoles = userStore.roles
    return roles.every(role => userRoles.includes(role))
  }

  /**
   * 租户范围内的权限检查
   */
  const hasTenantPermission = (
    permission: string | string[],
    tenantId?: string,
    superAdminRole?: string,
    tenantAdminRole?: string
  ): boolean => {
    const targetTenantId = tenantId || userStore.userInfo?.tenantId

    // 超级管理员拥有所有租户权限
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    // 只能操作自己所属租户
    if (targetTenantId !== userStore.userInfo?.tenantId) {
      return false
    }

    // 租户管理员在自己租户内拥有所有权限
    if (isTenantAdmin(tenantAdminRole)) {
      return true
    }

    return hasPermission(permission, superAdminRole)
  }

  /**
   * 检查是否有权限访问某个路由
   */
  const canAccessRoute = (
    route: any,
    superAdminRole?: string
  ): boolean => {
    if (!route) {
      return false
    }

    // 无权限要求则允许访问
    if (!route.meta || (!route.meta.roles && !route.meta.permissions)) {
      return true
    }

    // 超级管理员可以访问任何路由
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    // 检查角色权限
    if (route.meta.roles?.length > 0) {
      if (!hasRole(route.meta.roles, superAdminRole)) {
        return false
      }
    }

    // 检查操作权限
    if (route.meta.permissions?.length > 0) {
      if (!hasPermission(route.meta.permissions, superAdminRole)) {
        return false
      }
    }

    return true
  }

  /**
   * 过滤有权限访问的路由
   */
  const filterAuthorizedRoutes = (
    routes: any[],
    superAdminRole?: string
  ): any[] => {
    if (!routes?.length) {
      return []
    }

    return routes.filter((route) => {
      const hasAccess = canAccessRoute(route, superAdminRole)

      if (hasAccess && route.children?.length > 0) {
        route.children = filterAuthorizedRoutes(route.children, superAdminRole)
      }

      return hasAccess
    })
  }

  return {
    // 状态
    isLoggedIn,
    isSuperAdmin,
    isTenantAdmin,
    isAnyAdmin,

    // 权限检查
    hasPermission,
    hasAllPermissions,
    hasTenantPermission,

    // 角色检查
    hasRole,
    hasAllRoles,

    // 路由控制
    canAccessRoute,
    filterAuthorizedRoutes
  }
}
```

### 使用示例

```vue
<template>
  <div class="user-management">
    <!-- 条件渲染 -->
    <div v-if="canAdd" class="toolbar">
      <el-button type="primary" @click="handleAdd">
        新增用户
      </el-button>
    </div>

    <!-- 表格操作列 -->
    <el-table :data="tableData">
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
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasAllPermissions, isSuperAdmin } = useAuth()

// 单个权限检查
const canAdd = computed(() => hasPermission('system:user:add'))
const canEdit = computed(() => hasPermission('system:user:update'))
const canDelete = computed(() => hasPermission('system:user:delete'))

// 多个权限检查（满足任一）
const canOperate = computed(() =>
  hasPermission(['system:user:update', 'system:user:delete'])
)

// 多个权限检查（全部满足）
const canFullControl = computed(() =>
  hasAllPermissions(['system:user:add', 'system:user:update', 'system:user:delete'])
)

// 管理员检查
const isAdmin = computed(() => isSuperAdmin())
</script>
```

## 权限指令

### 指令概览

系统提供多种权限指令，用于声明式的权限控制:

| 指令 | 说明 | 逻辑 |
|------|------|------|
| `v-permi` | 操作权限控制 | OR |
| `v-role` | 角色权限控制 | OR |
| `v-permi-all` | 必须满足所有权限 | AND |
| `v-role-all` | 必须满足所有角色 | AND |
| `v-admin` | 仅管理员可见 | - |
| `v-superadmin` | 仅超级管理员可见 | - |
| `v-tenant` | 租户权限控制 | - |
| `v-no-permi` | 有权限时隐藏 | OR |
| `v-no-role` | 有角色时隐藏 | OR |
| `v-auth` | 灵活权限控制 | 可配置 |

### v-permi 指令

基于操作权限控制元素显示:

```vue
<template>
  <!-- 单个权限 -->
  <el-button v-permi="'system:user:add'">
    添加用户
  </el-button>

  <!-- 多个权限（满足其一即可） -->
  <el-button v-permi="['system:user:add', 'system:user:update']">
    用户管理
  </el-button>
</template>
```

**实现原理:**

```typescript
export const permi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = useAuth()
    const { value } = binding

    if (!value) {
      throw new Error('权限值不能为空')
    }

    if (!hasPermission(value)) {
      // 无权限时移除元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
```

### v-role 指令

基于角色控制元素显示:

```vue
<template>
  <!-- 单个角色 -->
  <el-button v-role="'editor'">
    编辑内容
  </el-button>

  <!-- 多个角色（满足其一即可） -->
  <el-button v-role="['admin', 'editor']">
    内容管理
  </el-button>
</template>
```

### v-permi-all 指令

必须满足所有权限:

```vue
<template>
  <!-- 必须同时拥有 add 和 update 权限 -->
  <el-button v-permi-all="['system:user:add', 'system:user:update']">
    高级用户管理
  </el-button>
</template>
```

### v-admin / v-superadmin 指令

管理员专属元素:

```vue
<template>
  <!-- 任意管理员可见 -->
  <el-button v-admin>
    管理员功能
  </el-button>

  <!-- 仅超级管理员可见 -->
  <el-button v-superadmin>
    超级管理员功能
  </el-button>
</template>
```

### v-tenant 指令

租户范围内的权限控制:

```vue
<template>
  <!-- 当前租户下的权限 -->
  <el-button v-tenant="'system:user:add'">
    添加用户
  </el-button>

  <!-- 指定租户下的权限 -->
  <el-button v-tenant="{ permi: 'system:user:add', tenantId: '12345' }">
    添加用户
  </el-button>
</template>
```

### v-no-permi / v-no-role 指令

反向权限控制:

```vue
<template>
  <!-- 有管理员角色时隐藏 -->
  <el-button v-no-role="'admin'">
    普通用户功能
  </el-button>

  <!-- 有删除权限时隐藏 -->
  <div v-no-permi="'system:user:delete'">
    您没有删除权限
  </div>
</template>
```

### v-auth 指令

灵活的权限控制，支持多种动作:

```vue
<template>
  <!-- 禁用元素（而非隐藏） -->
  <el-button v-auth="{ permi: 'system:user:add', action: 'disable' }">
    添加用户
  </el-button>

  <!-- 隐藏元素 -->
  <el-button v-auth="{ role: 'editor', action: 'hide' }">
    编辑内容
  </el-button>

  <!-- 添加自定义类名 -->
  <div v-auth="{ permi: 'vip', action: 'class', className: 'no-vip' }">
    VIP 内容
  </div>
</template>
```

**支持的动作:**

| 动作 | 说明 |
|------|------|
| `remove` | 移除元素（默认） |
| `hide` | 隐藏元素 (`display: none`) |
| `disable` | 禁用元素 |
| `class` | 添加指定类名 |

**实现原理:**

```typescript
const applyAction = (
  el: HTMLElement,
  action?: string,
  className?: string
): void => {
  switch (action) {
    case 'remove':
      el.parentNode && el.parentNode.removeChild(el)
      break

    case 'hide':
      el.style.display = 'none'
      break

    case 'disable':
      el.setAttribute('disabled', 'disabled')
      el.classList.add('is-disabled')
      // 阻止点击事件
      const stopClick = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
      }
      el.addEventListener('click', stopClick, true)
      break

    case 'class':
      el.classList.add(className || 'no-auth')
      break

    default:
      el.parentNode && el.parentNode.removeChild(el)
  }
}
```

## API 参考

### useAuth 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `isLoggedIn` | `ComputedRef<boolean>` | 用户登录状态 |
| `isSuperAdmin` | `(role?: string) => boolean` | 检查是否超级管理员 |
| `isTenantAdmin` | `(role?: string) => boolean` | 检查是否租户管理员 |
| `isAnyAdmin` | `(role?: string) => boolean` | 检查是否任意管理员 |
| `hasPermission` | `(perm: string \| string[], role?: string) => boolean` | 权限检查（OR） |
| `hasAllPermissions` | `(perms: string[], role?: string) => boolean` | 权限检查（AND） |
| `hasTenantPermission` | `(perm: string \| string[], tenantId?: string, ...) => boolean` | 租户权限检查 |
| `hasRole` | `(role: string \| string[], adminRole?: string) => boolean` | 角色检查（OR） |
| `hasAllRoles` | `(roles: string[], adminRole?: string) => boolean` | 角色检查（AND） |
| `canAccessRoute` | `(route: any, role?: string) => boolean` | 路由访问检查 |
| `filterAuthorizedRoutes` | `(routes: any[], role?: string) => any[]` | 过滤授权路由 |

### usePermissionStore 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `routes` | `Ref<RouteRecordRaw[]>` | 所有路由配置 |
| `sidebarRouters` | `Ref<RouteRecordRaw[]>` | 侧边栏路由 |
| `topbarRouters` | `Ref<RouteRecordRaw[]>` | 顶部栏路由 |
| `getRoutes` | `() => RouteRecordRaw[]` | 获取所有路由 |
| `getSidebarRoutes` | `() => RouteRecordRaw[]` | 获取侧边栏路由 |
| `getTopbarRoutes` | `() => RouteRecordRaw[]` | 获取顶部栏路由 |
| `generateRoutes` | `() => Result<RouteRecordRaw[]>` | 生成动态路由 |
| `setSidebarRouters` | `(routes: RouteRecordRaw[]) => void` | 设置侧边栏路由 |

### 类型定义

```typescript
/**
 * 路由配置扩展
 */
interface RouteRecordRawExtend extends RouteRecordRaw {
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否总是显示 */
  alwaysShow?: boolean
  /** 所需权限列表 */
  permissions?: string[]
  /** 所需角色列表 */
  roles?: string[]
}

/**
 * 路由 Meta 扩展
 */
interface RouteMeta {
  /** 页面标题 */
  title?: string
  /** 图标 */
  icon?: string
  /** 禁用缓存 */
  noCache?: boolean
  /** 面包屑显示 */
  breadcrumb?: boolean
  /** 固定标签 */
  affix?: boolean
  /** 激活菜单 */
  activeMenu?: string
  /** 国际化键 */
  i18nKey?: string
  /** 权限列表 */
  permissions?: string[]
  /** 角色列表 */
  roles?: string[]
}

/**
 * v-auth 指令配置
 */
interface AuthDirectiveValue {
  /** 权限标识 */
  permi?: string | string[]
  /** 角色标识 */
  role?: string | string[]
  /** 动作类型 */
  action?: 'remove' | 'hide' | 'disable' | 'class'
  /** 自定义类名 */
  className?: string
}

/**
 * v-tenant 指令配置
 */
interface TenantDirectiveValue {
  /** 权限标识 */
  permi: string | string[]
  /** 租户ID */
  tenantId?: string
}
```

## 最佳实践

### 1. 权限命名规范

遵循统一的权限命名规范，便于管理和维护:

```typescript
// ✅ 推荐：三段式命名
const permissions = [
  'system:user:view',     // 模块:资源:操作
  'system:user:add',
  'system:user:update',
  'system:user:delete',
  'system:user:export',
  'system:role:view',
  'monitor:online:view',
]

// ❌ 避免：不规范的命名
const badPermissions = [
  'addUser',              // 没有命名空间
  'user_delete',          // 混合命名风格
  'SystemUserView',       // 没有分隔符
]
```

### 2. 合理使用权限粒度

根据场景选择合适的权限控制粒度:

```vue
<template>
  <!-- 路由级权限：在路由配置中控制 -->
  <!-- 页面级权限：在页面入口控制 -->
  <div v-if="hasAccess">
    <page-content />
  </div>

  <!-- 按钮级权限：精确控制操作按钮 -->
  <el-button v-permi="'system:user:add'">新增</el-button>
  <el-button v-permi="'system:user:update'">编辑</el-button>
  <el-button v-permi="'system:user:delete'">删除</el-button>

  <!-- 数据级权限：在API层面控制 -->
</template>
```

### 3. 避免硬编码权限

使用常量或枚举管理权限标识:

```typescript
// ✅ 推荐：使用常量
export const UserPermissions = {
  VIEW: 'system:user:view',
  ADD: 'system:user:add',
  UPDATE: 'system:user:update',
  DELETE: 'system:user:delete',
  EXPORT: 'system:user:export',
} as const

// 使用
const canAdd = hasPermission(UserPermissions.ADD)

// ❌ 避免：硬编码
const canAdd = hasPermission('system:user:add')
```

### 4. 权限与业务逻辑分离

将权限检查与业务逻辑分离，提高可维护性:

```typescript
// ✅ 推荐：封装权限检查
const useUserPermissions = () => {
  const { hasPermission } = useAuth()

  return {
    canView: computed(() => hasPermission(UserPermissions.VIEW)),
    canAdd: computed(() => hasPermission(UserPermissions.ADD)),
    canEdit: computed(() => hasPermission(UserPermissions.UPDATE)),
    canDelete: computed(() => hasPermission(UserPermissions.DELETE)),
  }
}

// 在组件中使用
const { canAdd, canEdit, canDelete } = useUserPermissions()

// ❌ 避免：直接在模板中写权限判断
// <el-button v-if="hasPermission('system:user:add')">
```

### 5. 路由权限配置

在路由配置中正确设置权限:

```typescript
// ✅ 推荐：使用 meta 配置权限
{
  path: '/system/user',
  component: Layout,
  meta: {
    title: '用户管理',
    permissions: ['system:user:view']
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/system/user/index.vue'),
      name: 'UserList',
      meta: {
        title: '用户列表',
        permissions: ['system:user:view']
      }
    },
    {
      path: 'add',
      component: () => import('@/views/system/user/add.vue'),
      name: 'UserAdd',
      hidden: true,
      meta: {
        title: '新增用户',
        permissions: ['system:user:add'],
        activeMenu: '/system/user'
      }
    }
  ]
}
```

## 常见问题

### 1. 动态路由刷新后 404

**问题原因:**
- 动态路由在刷新后丢失
- 路由守卫中动态添加路由后直接跳转

**解决方案:**

```typescript
// 使用 replace: true 确保路由正确跳转
router.beforeEach(async (to, from, next) => {
  // ... 生成路由逻辑

  // 添加动态路由
  accessRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 使用 replace 重新导航
  next({
    path: to.path,
    replace: true,  // 关键：使用 replace
    params: to.params,
    query: to.query
  })
})
```

### 2. 权限指令不生效

**问题原因:**
- 指令未正确注册
- 权限值为空或格式错误
- 用户权限数据未加载

**解决方案:**

```typescript
// 1. 确保指令已全局注册
// main.ts
import { permi, role, auth } from '@/directives/permission'

app.directive('permi', permi)
app.directive('role', role)
app.directive('auth', auth)

// 2. 检查权限值格式
// ✅ 正确
<el-button v-permi="'system:user:add'">
<el-button v-permi="['system:user:add', 'system:user:update']">

// ❌ 错误
<el-button v-permi="system:user:add">  // 缺少引号
<el-button v-permi="">  // 空值

// 3. 确保权限数据已加载
const userStore = useUserStore()
await userStore.fetchUserInfo()
```

### 3. 路由名称重复导致的问题

**问题原因:**
- 前端定义的路由名与后端返回的路由名重复
- 动态添加的路由间存在重复

**解决方案:**

```typescript
// 系统会自动检测并警告重复的路由名称
// 开发时注意控制台的警告信息

// 确保每个路由都有唯一的 name
{
  path: '/system/user',
  name: 'SystemUser',  // 使用模块前缀确保唯一
  children: [
    {
      path: 'list',
      name: 'SystemUserList',  // 完整路径作为名称
    }
  ]
}
```

### 4. 权限缓存问题

**问题原因:**
- 用户权限变更后未刷新缓存
- 退出登录后权限未清除

**解决方案:**

```typescript
// 权限变更后重新获取用户信息
const refreshPermissions = async () => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 重新获取用户信息
  await userStore.fetchUserInfo()

  // 重新生成路由
  await permissionStore.generateRoutes()
}

// 退出登录时清除所有状态
const logout = async () => {
  const userStore = useUserStore()
  await userStore.logoutUser()

  // 重置路由
  resetRouter()

  // 跳转登录页
  router.push('/login')
}
```

### 5. 多租户权限隔离

**问题原因:**
- 租户间权限未正确隔离
- 切换租户后权限未更新

**解决方案:**

```typescript
// 使用租户权限检查
const { hasTenantPermission } = useAuth()

// 检查当前租户权限
const canOperate = hasTenantPermission('system:user:add')

// 检查指定租户权限
const canOperateInTenant = hasTenantPermission(
  'system:user:add',
  'tenant-123'  // 指定租户ID
)

// 租户切换后刷新权限
const switchTenant = async (tenantId: string) => {
  // 切换租户逻辑
  await changeTenant(tenantId)

  // 重新获取用户信息（包含新租户的权限）
  await userStore.fetchUserInfo()

  // 重新生成路由
  await permissionStore.generateRoutes()
}
```

### 6. 动态权限更新

**问题原因:**
- 后台修改权限后前端未同步
- 需要实时更新权限状态

**解决方案:**

```typescript
// 使用 WebSocket 监听权限变更
const setupPermissionListener = () => {
  const ws = useWebSocket()

  ws.on('permission:changed', async (data) => {
    if (data.userId === userStore.userId) {
      // 权限已变更，重新获取
      await refreshPermissions()

      // 提示用户
      ElMessage.info('您的权限已更新')

      // 检查当前页面是否还有权限
      const { canAccessRoute } = useAuth()
      if (!canAccessRoute(router.currentRoute.value)) {
        router.push('/403')
      }
    }
  })
}
```

### 7. SSR/SSG 兼容性

**问题原因:**
- 服务端渲染时无法获取用户状态
- 权限指令在服务端不生效

**解决方案:**

```typescript
// 在客户端才执行权限检查
const permi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // SSR 兼容：只在客户端执行
    if (typeof window === 'undefined') {
      return
    }

    const { hasPermission } = useAuth()
    const { value } = binding

    if (!hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

// 使用 onMounted 进行权限检查
onMounted(() => {
  const { canAccessRoute } = useAuth()
  if (!canAccessRoute(route)) {
    router.push('/403')
  }
})
```
