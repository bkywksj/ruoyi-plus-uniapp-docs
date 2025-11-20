# 路由类型

路由类型通过模块扩展方式扩展 Vue Router 的类型定义,添加自定义属性和功能,支持权限控制、导航配置、外部链接和国际化等特性。

## 介绍

路由类型系统通过 TypeScript 的声明合并(Declaration Merging)机制,扩展了 Vue Router 原生的类型定义,为路由系统添加了自定义属性和功能支持。这使得应用能够实现基于角色和权限的路由访问控制、灵活的导航配置、外部链接集成、国际化支持以及多标签页导航等高级功能。

**核心特性:**

- **类型安全** - 通过 TypeScript 模块扩展提供完整的类型提示和检查
- **权限控制** - 支持基于角色(`roles`)和权限标识(`permissions`)的路由访问控制
- **导航配置** - 灵活控制路由在侧边栏、面包屑和标签栏中的显示行为
- **外部链接** - 支持在路由系统中集成外部链接和第三方页面
- **缓存控制** - 提供路由级别的 KeepAlive 缓存配置
- **国际化支持** - 为路由标题提供多语言支持
- **标签导航** - 专为多标签页导航设计的路由视图类型
- **灵活扩展** - 易于扩展新的路由属性和功能

## 类型定义文件

路由类型定义文件位于 `src/types/router.d.ts`,包含以下主要类型:

### 文件结构

```typescript
import { type LocationQuery, type RouteMeta as VRouteMeta } from 'vue-router'

declare module 'vue-router' {
  // 路由元数据接口
  interface RouteMeta extends VRouteMeta {
    // ...
  }

  // 路由记录基础接口
  interface _RouteRecordBase {
    // ...
  }

  // 路由位置基础接口
  interface _RouteLocationBase {
    // ...
  }

  // 标签视图接口
  interface TagView {
    // ...
  }
}

export {}
```

## 路由元数据类型

### RouteMeta 接口

路由元数据接口扩展了 Vue Router 原生的 `RouteMeta` 类型,添加了自定义属性。

**类型定义:**

```typescript
declare module 'vue-router' {
  interface RouteMeta extends VRouteMeta {
    /** 外部链接 */
    link?: string
    /** 路由标题,显示在侧边栏、面包屑和标签栏 */
    title?: string
    /** 是否固定在标签栏,不可关闭 */
    affix?: boolean
    /** 是否不缓存该路由(默认false) */
    noCache?: boolean
    /** 当路由设置了该属性,则会高亮相对应的侧边栏 */
    activeMenu?: string
    /** 路由图标 */
    icon?: IconCode
    /** 如果设置为false,则不会在breadcrumb面包屑中显示 */
    breadcrumb?: boolean
    /** 国际化键 */
    i18nKey?: string
  }
}
```

### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `link` | `string` | - | 外部链接地址,设置后点击菜单将打开外部链接 |
| `title` | `string` | - | 路由标题,显示在侧边栏、面包屑和标签栏中 |
| `affix` | `boolean` | `false` | 是否固定在标签栏,设置为 `true` 后标签不可关闭 |
| `noCache` | `boolean` | `false` | 是否不缓存该路由,设置为 `true` 则不会被 `<keep-alive>` 缓存 |
| `activeMenu` | `string` | - | 激活菜单路径,设置后当前路由会高亮指定的侧边栏菜单项 |
| `icon` | `IconCode` | - | 路由图标,使用 Iconify 图标或自定义图标 |
| `breadcrumb` | `boolean` | `true` | 是否在面包屑中显示,设置为 `false` 则不显示 |
| `i18nKey` | `string` | - | 国际化键,用于多语言支持 |

### 基本使用示例

**1. 基础路由配置:**

```typescript
import { type RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: Layout,
    meta: {
      title: '用户管理',
      icon: 'user',
      affix: false,
      noCache: false,
      breadcrumb: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/system/user/list.vue'),
        name: 'UserList',
        meta: {
          title: '用户列表',
          icon: 'list',
          i18nKey: 'route.user.list'
        }
      }
    ]
  }
]
```

**2. 外部链接配置:**

```typescript
const externalLinkRoute: RouteRecordRaw = {
  path: '/external-link',
  component: Layout,
  children: [
    {
      path: 'https://github.com',
      meta: {
        title: 'GitHub',
        icon: 'link',
        link: 'https://github.com'
      }
    }
  ]
}
```

**3. 固定标签页配置:**

```typescript
// 首页通常固定在标签栏,不可关闭
const indexRoute: RouteRecordRaw = {
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
        affix: true,  // 固定在标签栏
        i18nKey: 'menu.index'
      }
    }
  ]
}
```

**4. 禁用缓存配置:**

```typescript
// 编辑页面通常不缓存,确保每次都是最新数据
const editRoute: RouteRecordRaw = {
  path: '/user/edit/:id',
  component: () => import('@/views/system/user/edit.vue'),
  name: 'UserEdit',
  meta: {
    title: '编辑用户',
    noCache: true,  // 不缓存
    activeMenu: '/user/list'  // 高亮用户列表菜单
  }
}
```

**5. 国际化配置:**

```typescript
const i18nRoute: RouteRecordRaw = {
  path: '/settings',
  component: Layout,
  meta: {
    title: '系统设置',
    icon: 'setting',
    i18nKey: 'route.settings.title'  // 国际化键
  },
  children: [
    {
      path: 'profile',
      component: () => import('@/views/settings/profile.vue'),
      meta: {
        title: '个人资料',
        i18nKey: 'route.settings.profile'
      }
    }
  ]
}
```

### RouteMeta 使用场景

**场景1:侧边栏高亮**

当访问详情或编辑页面时,高亮对应的列表菜单:

```typescript
{
  path: '/user/detail/:id',
  component: () => import('@/views/system/user/detail.vue'),
  hidden: true,  // 不在菜单中显示
  meta: {
    title: '用户详情',
    activeMenu: '/user/list'  // 访问详情页时高亮用户列表菜单
  }
}
```

**场景2:面包屑控制**

某些路由不需要在面包屑中显示:

```typescript
{
  path: '/redirect/:path(.*)',
  component: () => import('@/views/common/redirect.vue'),
  meta: {
    title: '页面重定向',
    noCache: true,
    breadcrumb: false  // 不在面包屑中显示
  }
}
```

**场景3:KeepAlive 缓存控制**

列表页面缓存,详情页面不缓存:

```typescript
{
  path: '/order',
  component: Layout,
  children: [
    {
      path: 'list',
      component: () => import('@/views/order/list.vue'),
      meta: {
        title: '订单列表',
        noCache: false  // 缓存列表页
      }
    },
    {
      path: 'detail/:id',
      component: () => import('@/views/order/detail.vue'),
      meta: {
        title: '订单详情',
        noCache: true  // 不缓存详情页
      }
    }
  ]
}
```

## 路由记录扩展类型

### _RouteRecordBase 接口

扩展路由记录基础属性,添加权限控制、显示控制等自定义属性。

**类型定义:**

```typescript
declare module 'vue-router' {
  interface _RouteRecordBase {
    /** 当设置为true时,该路由不会在侧边栏出现 */
    hidden?: boolean | string | number
    /** 访问路由所需的权限标识 */
    permissions?: string[]
    /** 访问路由所需的角色 */
    roles?: string[]
    /** 总是显示根路由 */
    alwaysShow?: boolean
    /** 访问路由的默认传递参数 */
    query?: string
    /** 父路由路径 */
    parentPath?: string
  }
}
```

### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hidden` | `boolean \| string \| number` | `false` | 是否在侧边栏中隐藏,设置为 `true` 时不显示 |
| `permissions` | `string[]` | - | 访问路由所需的权限标识数组 |
| `roles` | `string[]` | - | 访问路由所需的角色数组 |
| `alwaysShow` | `boolean` | `false` | 是否总是显示根路由,即使只有一个子路由 |
| `query` | `string` | - | 访问路由的默认查询参数(JSON 字符串) |
| `parentPath` | `string` | - | 父路由路径,用于面包屑导航 |

### 使用示例

**1. 权限控制:**

```typescript
import { type RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理' },
    permissions: ['system:manage'],  // 需要系统管理权限
    roles: ['admin'],  // 需要管理员角色
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' },
        permissions: ['system:user:query']  // 需要用户查询权限
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理' },
        permissions: ['system:role:query'],  // 需要角色查询权限
        roles: ['admin', 'super_admin']  // 需要管理员或超级管理员角色
      }
    ]
  }
]
```

**2. 隐藏路由:**

```typescript
// 登录、注册等页面隐藏,不在侧边栏显示
const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/auth/login.vue'),
    hidden: true,  // 隐藏
    meta: { title: '登录' }
  },
  {
    path: '/register',
    component: () => import('@/views/auth/register.vue'),
    hidden: true,
    meta: { title: '注册' }
  }
]
```

**3. 总是显示根路由:**

```typescript
// 即使只有一个子路由,也显示父菜单
const workflowRoute: RouteRecordRaw = {
  path: '/workflow',
  component: Layout,
  alwaysShow: true,  // 总是显示根路由
  meta: {
    title: '工作流',
    icon: 'workflow'
  },
  children: [
    {
      path: 'design',
      component: () => import('@/views/workflow/design.vue'),
      meta: { title: '流程设计' }
    }
  ]
}
```

**4. 默认查询参数:**

```typescript
// 访问路由时携带默认参数
const reportRoute: RouteRecordRaw = {
  path: '/report/view',
  component: () => import('@/views/report/view.vue'),
  meta: { title: '报表查看' },
  query: JSON.stringify({ type: 'monthly', year: 2024 })  // 默认参数
}
```

### 权限控制最佳实践

**1. 多层级权限控制:**

```typescript
const multiLevelPermissions: RouteRecordRaw = {
  path: '/finance',
  component: Layout,
  meta: { title: '财务管理' },
  roles: ['admin', 'finance'],  // 父级需要管理员或财务角色
  children: [
    {
      path: 'income',
      component: () => import('@/views/finance/income.vue'),
      meta: { title: '收入管理' },
      permissions: ['finance:income:query']  // 子级需要收入查询权限
    },
    {
      path: 'expense',
      component: () => import('@/views/finance/expense.vue'),
      meta: { title: '支出管理' },
      permissions: ['finance:expense:query']  // 子级需要支出查询权限
    }
  ]
}
```

**2. 组合权限(AND 逻辑):**

```typescript
// 同时需要多个权限
const combinedPermissions: RouteRecordRaw = {
  path: '/audit',
  component: () => import('@/views/audit/index.vue'),
  meta: { title: '审计管理' },
  permissions: ['audit:view', 'audit:export'],  // 需要查看和导出权限
  roles: ['auditor', 'admin']  // 需要审计员或管理员角色
}
```

**3. 权限守卫检查:**

在路由守卫中检查权限:

```typescript
// src/router/guard.ts
router.beforeEach(async (to, from, next) => {
  const { canAccessRoute } = useAuth()

  // 检查路由访问权限
  if (canAccessRoute(to)) {
    next()
  } else {
    next('/403')  // 无权限,跳转403页面
  }
})
```

## 路由位置基础类型

### _RouteLocationBase 接口

扩展路由位置基础属性,用于路由导航和状态管理。

**类型定义:**

```typescript
declare module 'vue-router' {
  interface _RouteLocationBase {
    /** 子路由配置 */
    children?: _RouteRecordBase[]
    /** 路由路径 */
    path?: string
    /** 路由标题 */
    title?: string
  }
}
```

**使用示例:**

```typescript
// 动态路由处理
const handleRoute = (route: _RouteLocationBase) => {
  if (route.children && route.children.length > 0) {
    // 处理子路由
    route.children.forEach(child => {
      console.log(child.path, child.title)
    })
  }
}
```

## 标签视图类型

### TagView 接口

专为多标签页导航设计的路由视图类型,包含标签显示所需的所有信息。

**类型定义:**

```typescript
declare module 'vue-router' {
  interface TagView {
    /** 完整路径,包含参数和查询部分 */
    fullPath?: string
    /** 路由名称 */
    name?: string
    /** 路由路径 */
    path?: string
    /** 路由标题 */
    title?: string
    /** 路由元数据 */
    meta?: RouteMeta
    /** 路由查询参数 */
    query?: LocationQuery
  }
}
```

### TagView 使用示例

**1. 标签视图Store:**

```typescript
// src/stores/tagsView.ts
import { defineStore } from 'pinia'
import { type RouteLocationNormalizedLoaded } from 'vue-router'

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  /**
   * 添加访问过的视图
   */
  const addVisitedView = (route: RouteLocationNormalizedLoaded) => {
    // 如果路由已固定或已存在,不重复添加
    if (visitedViews.value.some(v => v.path === route.path)) return

    const tagView: TagView = {
      fullPath: route.fullPath,
      name: route.name as string,
      path: route.path,
      title: route.meta.title as string || 'no-title',
      meta: { ...route.meta },
      query: { ...route.query }
    }

    visitedViews.value.push(tagView)
  }

  /**
   * 删除访问过的视图
   */
  const delVisitedView = (view: TagView) => {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  /**
   * 删除其他视图
   */
  const delOthersViews = (view: TagView) => {
    visitedViews.value = visitedViews.value.filter(v => {
      return v.meta?.affix || v.path === view.path
    })
  }

  /**
   * 删除所有视图
   */
  const delAllViews = () => {
    visitedViews.value = visitedViews.value.filter(v => v.meta?.affix)
  }

  /**
   * 更新访问过的视图
   */
  const updateVisitedView = (route: RouteLocationNormalizedLoaded) => {
    for (const v of visitedViews.value) {
      if (v.path === route.path) {
        v.query = { ...route.query }
        v.fullPath = route.fullPath
        v.meta = { ...route.meta }
        break
      }
    }
  }

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    delVisitedView,
    delOthersViews,
    delAllViews,
    updateVisitedView
  }
})
```

**2. 标签视图组件:**

```vue
<template>
  <div class="tags-view-container">
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query }"
        class="tags-view-item"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <el-icon
          v-if="!isAffix(tag)"
          class="el-icon-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </scroll-pane>

    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      trigger="contextmenu"
      @command="handleCommand"
    >
      <span />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon> 刷新
          </el-dropdown-item>
          <el-dropdown-item
            v-if="!isAffix(selectedTag)"
            command="close"
          >
            <el-icon><Close /></el-icon> 关闭
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers">
            <el-icon><CircleClose /></el-icon> 关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <el-icon><CircleClose /></el-icon> 关闭所有
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import { Close, Refresh, CircleClose } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const visitedViews = computed(() => tagsViewStore.visitedViews)
const selectedTag = ref<TagView>({})

// 判断是否是当前激活的标签
const isActive = (tag: TagView) => {
  return tag.path === route.path
}

// 判断是否是固定标签
const isAffix = (tag: TagView) => {
  return tag.meta?.affix
}

// 关闭选中的标签
const closeSelectedTag = (view: TagView) => {
  tagsViewStore.delVisitedView(view)
  if (isActive(view)) {
    toLastView()
  }
}

// 跳转到最后一个视图
const toLastView = () => {
  const latestView = visitedViews.value.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    router.push('/')
  }
}

// 打开右键菜单
const openMenu = (tag: TagView, e: MouseEvent) => {
  selectedTag.value = tag
  // 显示右键菜单
}

// 处理菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'refresh':
      // 刷新当前页面
      router.replace({ path: '/redirect' + selectedTag.value.fullPath })
      break
    case 'close':
      closeSelectedTag(selectedTag.value)
      break
    case 'closeOthers':
      tagsViewStore.delOthersViews(selectedTag.value)
      break
    case 'closeAll':
      tagsViewStore.delAllViews()
      toLastView()
      break
  }
}

// 监听路由变化,添加标签
watch(
  () => route.path,
  () => {
    if (route.name) {
      tagsViewStore.addVisitedView(route)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &.active {
        background-color: var(--el-color-primary);
        color: #fff;
        border-color: var(--el-color-primary);

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
```

**3. 在布局中使用标签视图:**

```vue
<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <sidebar />

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <navbar />

      <!-- 标签视图 -->
      <tags-view v-if="needTagsView" />

      <!-- 主内容 -->
      <app-main />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'

const layout = useLayout()
const needTagsView = computed(() => layout.tagsView.value)
</script>
```

## 路由配置示例

### 基础路由配置

**1. 公共路由(constantRoutes):**

```typescript
// src/router/modules/constant.ts
import { type RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/Layout.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'

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

**2. 动态路由(dynamicRoutes):**

```typescript
// src/router/modules/system.ts
import { type RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/Layout.vue'

export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'system',
      i18nKey: 'route.system'
    },
    permissions: ['system:manage'],
    roles: ['admin'],
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: {
          title: '用户管理',
          icon: 'user',
          i18nKey: 'route.system.user'
        },
        permissions: ['system:user:query']
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        meta: {
          title: '角色管理',
          icon: 'role',
          i18nKey: 'route.system.role'
        },
        permissions: ['system:role:query']
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu/index.vue'),
        name: 'Menu',
        meta: {
          title: '菜单管理',
          icon: 'menu',
          i18nKey: 'route.system.menu'
        },
        permissions: ['system:menu:query']
      }
    ]
  }
]
```

### 路由创建与配置

**1. 主路由文件:**

```typescript
// src/router/router.ts
import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { SystemConfig } from '@/systemConfig'

// 导入各模块路由
import { constantRoutes } from './modules/constant'
import { systemRoutes } from './modules/system'

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(SystemConfig.app.contextPath),
  routes: constantRoutes,
  // 刷新时,滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

/**
 * 重置路由
 * 用于用户退出登录或者权限变更时
 */
export const resetRouter = () => {
  const newRouter = createRouter({
    history: createWebHistory(SystemConfig.app.contextPath),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      return { top: 0 }
    }
  })
  // 重置路由器的matcher
  router.matcher = newRouter.matcher
}

/** 动态路由,基于用户权限动态去加载 */
export const dynamicRoutes: RouteRecordRaw[] = [...systemRoutes]

export { constantRoutes }
export default router
```

**2. 路由守卫:**

```typescript
// src/router/guard.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { type Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useAuth } from '@/composables/useAuth'

NProgress.configure({ showSpinner: false })

// 白名单
const WHITE_LIST = ['/login', '/register', '/forgotPassword', '/401', '/home']

/**
 * 初始化路由守卫
 */
export const setupRouteGuards = (router: Router): void => {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const { canAccessRoute, isLoggedIn } = useAuth()

    // 没有token
    if (!isLoggedIn.value) {
      if (WHITE_LIST.includes(to.path)) {
        return next()
      }
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // 已登录访问登录页,重定向到首页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 白名单直接通过
    if (WHITE_LIST.includes(to.path)) {
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

    // 获取用户信息
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      await userStore.logoutUser()
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // 生成动态路由
    const [generateRoutesErr, accessRoutes] = await permissionStore.generateRoutes()
    if (generateRoutesErr) {
      return next('/403')
    }

    // 添加动态路由
    accessRoutes.forEach((route) => {
      router.addRoute(route)
    })

    // 检查权限
    if (!canAccessRoute(to)) {
      return next('/403')
    }

    // 确保addRoutes已完成
    next({ ...to, replace: true })
  })

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

## 路由工具函数

### 权限检查

**1. canAccessRoute:**

```typescript
// src/composables/useAuth.ts
import { computed } from 'vue'
import { type RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/user'

export const useAuth = () => {
  const userStore = useUserStore()

  // 是否已登录
  const isLoggedIn = computed(() => {
    return !!userStore.token
  })

  // 检查是否有权限访问路由
  const canAccessRoute = (route: RouteLocationNormalized): boolean => {
    const { permissions, roles } = route

    // 没有权限要求,直接允许访问
    if (!permissions && !roles) {
      return true
    }

    // 检查权限
    if (permissions && permissions.length > 0) {
      const hasPermission = permissions.some(p =>
        userStore.permissions.includes(p)
      )
      if (!hasPermission) return false
    }

    // 检查角色
    if (roles && roles.length > 0) {
      const hasRole = roles.some(r =>
        userStore.roles.includes(r)
      )
      if (!hasRole) return false
    }

    return true
  }

  return {
    isLoggedIn,
    canAccessRoute
  }
}
```

**2. 菜单过滤:**

```typescript
// src/utils/routeUtils.ts
import { type RouteRecordRaw } from 'vue-router'

/**
 * 过滤菜单,只保留有权限的路由
 */
export const filterMenus = (
  routes: RouteRecordRaw[],
  permissions: string[],
  roles: string[]
): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []

  routes.forEach(route => {
    const tmp = { ...route }

    // 检查权限
    if (hasPermission(tmp, permissions, roles)) {
      // 递归过滤子路由
      if (tmp.children) {
        tmp.children = filterMenus(tmp.children, permissions, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * 检查是否有权限
 */
const hasPermission = (
  route: RouteRecordRaw,
  permissions: string[],
  roles: string[]
): boolean => {
  // 路由hidden,跳过
  if (route.hidden) return false

  // 没有权限要求
  if (!route.permissions && !route.roles) return true

  // 检查权限
  if (route.permissions && route.permissions.length > 0) {
    return route.permissions.some(p => permissions.includes(p))
  }

  // 检查角色
  if (route.roles && route.roles.length > 0) {
    return route.roles.some(r => roles.includes(r))
  }

  return false
}
```

## 最佳实践

### 1. 路由命名规范

```typescript
// ✅ 推荐:使用大驼峰命名
{
  path: '/system/user',
  name: 'SystemUser',  // 模块+功能
  component: () => import('@/views/system/user/index.vue')
}

// ❌ 避免:不规范的命名
{
  path: '/system/user',
  name: 'user',  // 太简单,易冲突
  component: () => import('@/views/system/user/index.vue')
}
```

### 2. meta 配置规范

```typescript
// ✅ 推荐:完整的meta配置
{
  path: '/system/user',
  name: 'SystemUser',
  component: () => import('@/views/system/user/index.vue'),
  meta: {
    title: '用户管理',
    icon: 'user',
    affix: false,
    noCache: false,
    breadcrumb: true,
    i18nKey: 'route.system.user'
  }
}

// ❌ 避免:缺少必要配置
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  meta: { title: '用户管理' }  // 缺少图标、国际化等
}
```

### 3. 权限配置规范

```typescript
// ✅ 推荐:清晰的权限配置
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  meta: { title: '用户管理' },
  permissions: ['system:user:query'],  // 查询权限
  roles: ['admin']  // 管理员角色
}

// ❌ 避免:权限过于宽松
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  meta: { title: '用户管理' }
  // 缺少权限控制,所有人都能访问
}
```

### 4. 路由懒加载

```typescript
// ✅ 推荐:使用懒加载
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue')
}

// ❌ 避免:直接导入
import UserView from '@/views/system/user/index.vue'
{
  path: '/system/user',
  component: UserView  // 不利于代码分割
}
```

### 5. 路由重定向

```typescript
// ✅ 推荐:使用redirect
{
  path: '/system',
  component: Layout,
  redirect: '/system/user',  // 重定向到第一个子路由
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user/index.vue')
    }
  ]
}

// ✅ 使用noRedirect禁用面包屑点击
{
  path: '/system',
  component: Layout,
  redirect: 'noRedirect',  // 不可点击
  children: [...]
}
```

## 常见问题

### 1. 路由类型提示不生效

**问题原因:**
- 类型声明文件未被 TypeScript 识别
- tsconfig.json 配置不正确

**解决方案:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client"],
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

### 2. 权限控制不生效

**问题原因:**
- 路由守卫未正确设置
- 权限检查逻辑错误
- 用户信息未正确获取

**解决方案:**

```typescript
// 确保路由守卫已设置
import { setupRouteGuards } from './guard'
setupRouteGuards(router)

// 确保用户信息包含权限和角色
const userStore = useUserStore()
console.log(userStore.permissions)  // 应该有数据
console.log(userStore.roles)  // 应该有数据
```

### 3. 动态路由不显示

**问题原因:**
- 路由未正确添加
- 权限配置错误
- hidden 属性设置错误

**解决方案:**

```typescript
// 检查路由是否正确添加
console.log(router.getRoutes())

// 检查权限配置
const route = router.getRoutes().find(r => r.path === '/system/user')
console.log(route?.permissions)

// 检查hidden属性
console.log(route?.hidden)  // 应该是false或undefined
```

### 4. 标签页不显示或显示错误

**问题原因:**
- TagView 数据不正确
- meta.title 未设置
- 路由name未设置

**解决方案:**

```typescript
// 确保路由有name和meta.title
{
  path: '/system/user',
  name: 'SystemUser',  // 必须设置
  component: () => import('@/views/system/user/index.vue'),
  meta: {
    title: '用户管理'  // 必须设置
  }
}

// 检查TagView数据
const tagsViewStore = useTagsViewStore()
console.log(tagsViewStore.visitedViews)
```

### 5. 路由参数丢失

**问题原因:**
- 路由跳转时未携带参数
- TagView 更新时参数丢失

**解决方案:**

```typescript
// ✅ 正确:携带完整参数
router.push({
  path: '/user/detail',
  query: { id: '123' }
})

// ✅ TagView保存完整路径
const addVisitedView = (route: RouteLocationNormalizedLoaded) => {
  const tagView: TagView = {
    fullPath: route.fullPath,  // 包含query和params
    query: { ...route.query },  // 保存query
    // ...
  }
}
```

## 类型定义完整示例

**router.d.ts 完整示例:**

```typescript
import { type LocationQuery, type RouteMeta as VRouteMeta } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta extends VRouteMeta {
    link?: string
    title?: string
    affix?: boolean
    noCache?: boolean
    activeMenu?: string
    icon?: IconCode
    breadcrumb?: boolean
    i18nKey?: string
  }

  interface _RouteRecordBase {
    hidden?: boolean | string | number
    permissions?: string[]
    roles?: string[]
    alwaysShow?: boolean
    query?: string
    parentPath?: string
  }

  interface _RouteLocationBase {
    children?: _RouteRecordBase[]
    path?: string
    title?: string
  }

  interface TagView {
    fullPath?: string
    name?: string
    path?: string
    title?: string
    meta?: RouteMeta
    query?: LocationQuery
  }
}

export {}
```
