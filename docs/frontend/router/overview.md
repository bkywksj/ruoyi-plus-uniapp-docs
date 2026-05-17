# 路由总览

本项目基于 Vue Router 4 构建了一套完整的企业级路由系统,支持权限控制、动态路由生成、多层级菜单展示和标签页管理。

## 🎯 核心特性

### 1. 权限路由系统

基于用户角色和权限动态生成可访问路由,实现细粒度的访问控制。

**实现方式**:
- 前端定义完整路由配置
- 后端返回用户权限标识
- 前端根据权限标识过滤路由
- 动态添加可访问路由到路由实例

**优势**:
- ✅ 前端完全掌控路由结构
- ✅ 菜单层级清晰可控
- ✅ 支持细粒度权限控制
- ✅ 灵活的路由配置选项

### 2. 多级嵌套路由

支持无限层级的菜单嵌套结构,适配复杂的企业级应用场景。

```typescript
{
  path: '/system',
  children: [
    {
      path: 'user',
      children: [
        { path: 'list', component: UserList },
        { path: 'detail/:id', component: UserDetail }
      ]
    }
  ]
}
```

### 3. 路由守卫

完整的路由拦截与导航控制机制:

- **前置守卫**: 权限验证、登录检查、动态路由加载
- **后置守卫**: 页面标题设置、进度条控制
- **白名单机制**: 无需登录即可访问的页面列表

### 4. 标签页系统

集成 TagsView 实现多标签页管理:

- 打开/关闭标签页
- 刷新当前标签
- 关闭其他/左侧/右侧标签
- 固定标签(affix)
- 标签页缓存控制

### 5. Keep-Alive 缓存

灵活的页面缓存策略:

```typescript
meta: {
  noCache: true  // 不缓存该页面
}
```

### 6. 国际化支持

完整的多语言菜单标题支持:

```typescript
meta: {
  title: '用户管理',
  i18nKey: 'menu.system.user'
}
```

### 7. 响应式适配

适配桌面和移动端的侧边栏展示,提供统一的导航体验。

## 📂 路由分类

### 常量路由 (constantRoutes)

不需要权限验证,所有用户都可以访问的基础路由。

#### 系统路由

```typescript
// 重定向路由
/redirect/:path(*) - 页面重定向

// 认证路由
/login - 用户登录
/register - 用户注册
/forgotPassword - 忘记密码
/socialCallback - 社交登录回调

// 根路径
/ - 根路径(自动重定向到首页或后台)
```

#### 基础页面

```typescript
/index - 后台首页(固定标签)
/home - 前台首页(可选,配置开启)
/user/profile - 个人中心
```

#### 错误页面

```typescript
/404 - 页面未找到
/401 - 未授权访问
/:pathMatch(.*) - 捕获所有未匹配路由
```

### 动态路由 (dynamicRoutes)

基于用户权限动态生成的路由,由后端接口返回权限标识。

#### 工具路由模块

```typescript
// 代码生成
/tool/genEdit/:tableId - 代码生成配置页

// 测试页面
/tool/test/* - 各类测试和示例页面
```

#### 工作流路由模块

```typescript
// 工作流管理
/workflow/definition - 流程定义
/workflow/instance - 流程实例
/workflow/task - 任务管理
```

## 🗂️ 文件结构

```text
src/router/
├── router.ts               # 路由实例配置
├── guard.ts                # 路由守卫
├── modules/                # 路由模块
│   ├── constant.ts         # 常量路由
│   ├── workflow.ts         # 工作流路由
│   └── tool.ts             # 工具路由
└── utils/                  # 工具函数
    └── createCustomNameComponent.ts
```

### router.ts - 路由实例

```typescript
import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHistory(SystemConfig.app.contextPath),
  routes: constantRoutes,

  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 重置路由
export const resetRouter = () => {
  const newRouter = createRouter({
    history: createWebHistory(SystemConfig.app.contextPath),
    routes: constantRoutes
  })
  router.matcher = newRouter.matcher
}

// 设置路由守卫
setupRouteGuards(router)

export default router
```

### guard.ts - 路由守卫

```typescript
import NProgress from 'nprogress'

// 白名单
const WHITE_LIST = [
  '/login', '/register', '/forgotPassword',
  '/socialCallback', '/401', '/home'
]

export const setupRouteGuards = (router: Router): void => {
  // 前置守卫
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

    // 已登录访问登录页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 白名单直接通过
    if (isInWhiteList(to.path)) {
      return next()
    }

    // 已加载用户信息,检查权限
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      } else {
        return next('/403')
      }
    }

    // 获取用户信息和权限
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      await userStore.logoutUser()
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    // 生成动态路由
    const [generateRoutesErr, accessRoutes] =
      await permissionStore.generateRoutes()

    if (generateRoutesErr) {
      return next('/403')
    }

    // 添加动态路由
    accessRoutes.forEach((route) => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })

    // 检查权限并跳转
    if (!canAccessRoute(to)) {
      return next('/403')
    }

    next({ ...to, replace: true })
  })

  // 后置守卫
  router.afterEach((to) => {
    NProgress.done()

    // 设置页面标题
    const layout = useLayout()
    if (to.meta.title) {
      layout.setTitle(to.meta.title as string)
    }
  })
}
```

## ⚙️ 路由配置规范

### 基础配置项

```typescript
interface RouteConfig {
  path: string              // 路由路径
  name?: string            // 路由名称(用于缓存和导航)
  component?: Component    // 路由组件
  redirect?: string        // 重定向路径
  children?: RouteConfig[] // 子路由
  hidden?: boolean         // 是否隐藏菜单
  alwaysShow?: boolean     // 是否始终显示根菜单
  roles?: string[]         // 访问角色
  permissions?: string[]   // 访问权限
  query?: string           // 默认查询参数
  meta?: RouteMeta         // 路由元信息
}
```

### 路由元信息 (RouteMeta)

```typescript
interface RouteMeta {
  /** 页面标题 */
  title?: string

  /** 菜单图标 */
  icon?: string

  /** 国际化键值 */
  i18nKey?: string

  /** 是否缓存页面 */
  noCache?: boolean

  /** 激活的父级菜单路径 */
  activeMenu?: string

  /** 是否显示面包屑 */
  breadcrumb?: boolean

  /** 是否固定标签页 */
  affix?: boolean

  /** 徽标数量 */
  badge?: number | string

  /** 是否显示在侧边栏 */
  hidden?: boolean
}
```

### 配置示例

```typescript
// 基础路由
{
  path: '/system/user',
  component: Layout,
  name: 'SystemUser',
  meta: {
    title: '用户管理',
    icon: 'user',
    i18nKey: 'menu.system.user'
  },
  children: [
    {
      path: 'index',
      name: 'UserList',
      component: () => import('@/views/system/user/index.vue'),
      meta: { title: '用户列表' }
    }
  ]
}

// 隐藏的详情页
{
  path: '/system/user',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'detail/:id',
      name: 'UserDetail',
      component: () => import('@/views/system/user/detail.vue'),
      meta: {
        title: '用户详情',
        activeMenu: '/system/user',
        noCache: true
      }
    }
  ]
}

// 固定标签页
{
  path: '/index',
  component: Layout,
  children: [
    {
      path: '',
      name: 'Index',
      component: () => import('@/views/index.vue'),
      meta: {
        title: '首页',
        icon: 'home',
        affix: true
      }
    }
  ]
}
```

### 特殊配置说明

#### hidden: true

路由不会在侧边栏菜单中显示,适用于:
- 详情页面
- 编辑页面
- 系统页面(登录、404等)

```typescript
{
  path: '/system/user/edit/:id',
  hidden: true,
  meta: { activeMenu: '/system/user' }
}
```

#### alwaysShow: true

强制显示为父级菜单,即使只有一个子路由:

```typescript
{
  path: '/system',
  alwaysShow: true,  // 始终显示"系统管理"菜单
  children: [
    { path: 'user', component: UserList }
  ]
}
```

#### redirect: 'noredirect'

面包屑中不可点击:

```typescript
{
  path: '/system',
  redirect: 'noredirect',  // 面包屑不可点击
  children: [...]
}
```

#### activeMenu

指定激活的菜单项,用于详情页高亮父级菜单:

```typescript
{
  path: '/system/user/detail/:id',
  hidden: true,
  meta: {
    activeMenu: '/system/user'  // 高亮"用户管理"菜单
  }
}
```

#### noCache: true

页面不被 keep-alive 缓存:

```typescript
{
  path: '/system/user/edit/:id',
  meta: {
    noCache: true  // 每次都重新加载
  }
}
```

#### affix: true

标签页固定,不可关闭:

```typescript
{
  path: '/index',
  meta: {
    affix: true  // 首页固定标签
  }
}
```

## 🚀 快速开始

### 1. 添加常量路由

在 `router/modules/constant.ts` 中添加:

```typescript
export const constantRoutes: RouteRecordRaw[] = [
  // ... 其他路由

  // 新增路由
  {
    path: '/example',
    component: Layout,
    redirect: '/example/index',
    children: [
      {
        path: 'index',
        name: 'Example',
        component: () => import('@/views/example/index.vue'),
        meta: {
          title: '示例页面',
          icon: 'example',
          affix: false
        }
      }
    ]
  }
]
```

### 2. 添加权限路由

在 `router/modules/tool.ts` 或新建模块中添加:

```typescript
export const toolRoutes: RouteRecordRaw[] = [
  {
    path: '/tool/example',
    component: Layout,
    hidden: true,
    permissions: ['tool:example:view'],
    children: [
      {
        path: 'detail/:id',
        name: 'ExampleDetail',
        component: () => import('@/views/tool/example/detail.vue'),
        meta: {
          title: '示例详情',
          activeMenu: '/tool/example',
          noCache: true
        }
      }
    ]
  }
]
```

### 3. 路由跳转

#### 声明式导航

```vue
<template>
  <!-- 基础跳转 -->
  <router-link to="/example">示例页面</router-link>

  <!-- 命名路由 -->
  <router-link :to="{ name: 'Example' }">示例页面</router-link>

  <!-- 带参数 -->
  <router-link :to="{ name: 'ExampleDetail', params: { id: '1' } }">
    详情
  </router-link>

  <!-- 带查询参数 -->
  <router-link :to="{ path: '/example', query: { tab: 'info' } }">
    示例(info标签)
  </router-link>
</template>
```

#### 编程式导航

```typescript
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 基础跳转
function goToExample() {
  router.push('/example')
}

// 命名路由跳转
function goToDetail(id: string) {
  router.push({
    name: 'ExampleDetail',
    params: { id },
    query: { from: 'list' }
  })
}

// 替换当前路由(不产生历史记录)
function replaceRoute() {
  router.replace('/example')
}

// 后退
function goBack() {
  router.back()
}

// 前进
function goForward() {
  router.forward()
}

// 跳转指定历史记录
function go(n: number) {
  router.go(n)
}
</script>
```

### 4. 路由参数获取

```typescript
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取路径参数
const id = route.params.id  // /detail/123 => id = '123'

// 获取查询参数
const tab = route.query.tab  // /example?tab=info => tab = 'info'

// 获取完整路径
const fullPath = route.fullPath  // /example?tab=info

// 获取路由名称
const routeName = route.name  // 'Example'

// 获取路由元信息
const title = route.meta.title  // '示例页面'

// 监听路由变化
watch(() => route.params.id, (newId) => {
  console.log('ID changed:', newId)
})
</script>
```

### 5. 路由守卫

#### 组件内守卫

```typescript
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开路由前确认
onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定要离开吗?未保存的更改将丢失!')
  if (!answer) return false
})

// 路由更新时(参数变化)
onBeforeRouteUpdate((to, from) => {
  console.log('Route updated:', to.params.id)
})
</script>
```

#### 全局守卫

```typescript
// main.ts
router.beforeEach((to, from, next) => {
  console.log('Global guard:', to.path)
  next()
})

router.afterEach((to, from) => {
  console.log('After navigation:', to.path)
})
```

## 🔧 动态路由管理

### 权限路由生成

```typescript
// stores/permission.ts
export const usePermissionStore = defineStore('permission', () => {
  const accessRoutes = ref<RouteRecordRaw[]>([])

  /**
   * 根据权限标识过滤路由
   */
  function filterRoutes(
    routes: RouteRecordRaw[],
    permissions: string[]
  ): RouteRecordRaw[] {
    const res: RouteRecordRaw[] = []

    routes.forEach(route => {
      const tmp = { ...route }

      // 检查权限
      if (hasPermission(permissions, tmp)) {
        // 递归过滤子路由
        if (tmp.children) {
          tmp.children = filterRoutes(tmp.children, permissions)
        }
        res.push(tmp)
      }
    })

    return res
  }

  /**
   * 生成可访问路由
   */
  async function generateRoutes(): Promise<Result<RouteRecordRaw[]>> {
    try {
      // 获取用户权限
      const userStore = useUserStore()
      const permissions = userStore.permissions

      // 过滤动态路由
      const routes = filterRoutes(dynamicRoutes, permissions)

      // 添加常量路由
      accessRoutes.value = constantRoutes.concat(routes)

      return [null, routes]
    } catch (error) {
      return [error as Error, null]
    }
  }

  return {
    accessRoutes,
    generateRoutes
  }
})
```

### 动态添加路由

```typescript
// router/guard.ts
router.beforeEach(async (to, from, next) => {
  // 生成动态路由
  const [err, routes] = await permissionStore.generateRoutes()

  if (!err && routes) {
    // 动态添加路由
    routes.forEach(route => {
      router.addRoute(route)
    })

    // 确保路由已添加完成
    next({ ...to, replace: true })
  }
})
```

### 路由重置

```typescript
// 退出登录时重置路由
export const resetRouter = () => {
  const newRouter = createRouter({
    history: createWebHistory(SystemConfig.app.contextPath),
    routes: constantRoutes
  })
  router.matcher = newRouter.matcher
}

// 使用
const userStore = useUserStore()
userStore.logout().then(() => {
  resetRouter()
  router.push('/login')
})
```

## 📦 工具函数

### createCustomNameComponent

创建具有自定义名称的组件,确保 keep-alive 缓存正确识别:

```typescript
import { createCustomNameComponent } from '@/router/utils/createCustomNameComponent'

// 创建组件
const UserComponent = createCustomNameComponent(
  () => import('./UserComponent.vue'),
  { name: 'UserComponent' }
)

// 使用
{
  path: 'user',
  name: 'User',
  component: UserComponent,
  meta: { noCache: false }
}
```

**实现原理**:

```typescript
export function createCustomNameComponent(
  loader: () => Promise<any>,
  options: { name: string }
) {
  return defineAsyncComponent({
    loader,
    onError(error, retry, fail, attempts) {
      if (attempts <= 3) {
        retry()
      } else {
        fail()
      }
    },
    // 设置组件名称
    ...options
  })
}
```

## 🎨 最佳实践

### 1. 路由命名规范

```typescript
// ✅ 推荐
{
  path: '/system/user',
  name: 'SystemUser',          // 大驼峰,模块前缀
  meta: { title: '用户管理' }
}

{
  path: '/system/user/detail/:id',
  name: 'SystemUserDetail',    // 详情页添加Detail后缀
  meta: { title: '用户详情' }
}

// ❌ 不推荐
{
  path: '/system/user',
  name: 'user',                // 小写,可能冲突
  meta: { title: '用户管理' }
}
```

### 2. 路由参数类型

```typescript
// ✅ 推荐 - 使用路径参数
{
  path: '/user/detail/:id',
  name: 'UserDetail'
}
router.push({ name: 'UserDetail', params: { id: '123' } })

// ⚠️ 注意 - 查询参数会显示在URL
{
  path: '/user/detail',
  name: 'UserDetail'
}
router.push({ name: 'UserDetail', query: { id: '123' } })
// URL: /user/detail?id=123
```

### 3. 详情页路由

```typescript
// ✅ 推荐配置
{
  path: '/system/user',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'detail/:id',
      name: 'UserDetail',
      component: () => import('@/views/system/user/detail.vue'),
      meta: {
        title: '用户详情',
        activeMenu: '/system/user',  // 高亮父级菜单
        noCache: true               // 不缓存
      }
    }
  ]
}
```

### 4. 权限控制

```typescript
// ✅ 推荐 - 使用权限标识
{
  path: '/system/user',
  permissions: ['system:user:view'],  // 权限标识
  children: [...]
}

// ✅ 推荐 - 使用角色
{
  path: '/admin',
  roles: ['admin'],  // 仅管理员可访问
  children: [...]
}
```

### 5. 路由懒加载

```typescript
// ✅ 推荐 - 按需加载
{
  path: '/example',
  component: () => import('@/views/example/index.vue')
}

// ✅ 推荐 - 分组加载
{
  path: '/system/user',
  component: () => import(
    /* webpackChunkName: "system" */
    '@/views/system/user/index.vue'
  )
}

// ❌ 不推荐 - 同步加载(会增加初始包体积)
import UserList from '@/views/system/user/index.vue'
{
  path: '/system/user',
  component: UserList
}
```

### 6. 避免路由重复

```typescript
// ✅ 推荐 - 使用 catch 捕获错误
router.push('/example').catch(err => {
  if (err.name !== 'NavigationDuplicated') {
    console.error(err)
  }
})

// ✅ 推荐 - 判断是否需要跳转
if (route.path !== '/example') {
  router.push('/example')
}
```

### 7. 路由元信息类型安全

```typescript
// router.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    i18nKey?: string
    noCache?: boolean
    activeMenu?: string
    breadcrumb?: boolean
    affix?: boolean
  }
}
```

### 8. 路由过渡动画

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="route.meta.transition || 'fade'"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 9. 路由错误处理

```typescript
router.onError((error) => {
  console.error('Router error:', error)

  // 导航失败
  if (error.name === 'NavigationCancelled') {
    console.log('Navigation cancelled')
  }

  // 导航重复
  if (error.name === 'NavigationDuplicated') {
    console.log('Navigation duplicated')
  }

  // 组件加载失败
  if (error.message.includes('Failed to fetch')) {
    ElMessage.error('页面加载失败,请刷新重试')
  }
})
```

### 10. 路由性能优化

```typescript
// ✅ 推荐 - 路由懒加载 + 分组
const routes = [
  {
    path: '/system',
    component: () => import(
      /* webpackChunkName: "system" */
      '@/views/system/index.vue'
    )
  }
]

// ✅ 推荐 - 预加载关键路由
router.beforeResolve((to, from, next) => {
  // 预加载下一个可能访问的路由
  if (to.path === '/user/list') {
    import('@/views/user/detail.vue')
  }
  next()
})

// ✅ 推荐 - 使用 keep-alive 缓存列表页
{
  path: '/user/list',
  meta: { noCache: false }  // 缓存列表页
}

{
  path: '/user/detail/:id',
  meta: { noCache: true }   // 不缓存详情页
}
```

## 📚 总结

路由系统是前端应用的核心基础设施,本项目的路由设计具有以下特点:

1. **权限控制** - 基于权限标识的动态路由生成
2. **灵活配置** - 丰富的路由配置选项
3. **性能优化** - 懒加载和缓存策略
4. **开发友好** - 清晰的文件结构和命名规范
5. **类型安全** - TypeScript 类型定义
6. **易于扩展** - 模块化的路由配置

合理使用路由系统可以提升应用的性能、安全性和用户体验。
