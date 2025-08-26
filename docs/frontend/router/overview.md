# 路由总览

## 系统架构

本项目基于 Vue Router 构建了一套完整的路由系统，支持权限控制、动态路由生成和多层级菜单展示。

### 核心特性

- **权限路由**: 基于用户角色和权限动态生成可访问路由
- **多级嵌套**: 支持无限层级的菜单嵌套结构
- **国际化**: 完整的多语言菜单标题支持
- **响应式**: 适配桌面和移动端的侧边栏展示
- **缓存控制**: 灵活的页面缓存策略

## 路由分类

### 常量路由 (constantRoutes)

不需要权限验证，所有用户都可以访问的基础路由：

```typescript
// 登录相关
/login - 用户登录页面
/register - 用户注册页面
/socialCallback - 社交登录回调

// 错误页面
/404 - 页面未找到
/401 - 未授权访问

// 基础页面
/ - 根路径（自动重定向）
/home - 前台首页（条件性）
/index - 后台首页
/user/profile - 个人中心
```

### 动态路由 (dynamicRoutes)

基于用户权限动态生成的路由，包含：

```typescript
// 系统管理路由
/system/user/assignRoles - 用户角色分配
/system/role/assignUsers - 角色用户分配
/system/dict/dictData - 字典数据管理
/system/oss/ossConfig - OSS配置管理

// 开发工具路由
/tool/genEdit - 代码生成配置
```

## 文件结构

```
src/router/
├── index.ts                 # 主路由配置文件
├── guard.ts                 # 路由守卫配置
└── modules/                 # 路由模块
    ├── constant.ts          # 常量路由配置
    ├── system.ts            # 系统管理路由
    └── tool.ts              # 开发工具路由
```

## 路由配置规范

### 基础配置项

```typescript
{
  path: '/example',           // 路由路径
  name: 'Example',           // 路由名称（用于缓存识别）
  component: () => import('@/views/example.vue'),
  redirect: '/example/index', // 重定向路径
  
  // 路由元信息
  meta: {
    title: '页面标题',        // 页面标题
    icon: 'example',         // 菜单图标
    i18nKey: 'menu.example', // 国际化键值
    noCache: true,           // 是否缓存页面
    activeMenu: '/parent',   // 激活的父级菜单
    breadcrumb: false,       // 是否显示面包屑
    affix: true             // 是否固定标签页
  },
  
  // 权限控制
  hidden: true,              // 是否在菜单中隐藏
  alwaysShow: true,          // 是否总是显示根菜单
  roles: ['admin'],          // 访问角色
  permissions: ['system:user:view'] // 访问权限
}
```

### 特殊配置说明

- `hidden: true`: 路由不会在侧边栏菜单中显示
- `alwaysShow: true`: 强制显示为父级菜单，即使只有一个子路由
- `redirect: 'noredirect'`: 面包屑中不可点击
- `activeMenu`: 指定激活的菜单项（用于详情页高亮父级菜单）

## 快速开始

### 1. 添加新的常量路由

在 `router/modules/constant.ts` 中添加：

```typescript
{
  path: '/example',
  component: Layout,
  children: [
    {
      path: 'index',
      name: 'Example',
      component: () => import('@/views/example/index.vue'),
      meta: { title: '示例页面', icon: 'example' }
    }
  ]
}
```

### 2. 添加权限路由

在 `router/modules/system.ts` 或 `tool.ts` 中添加：

```typescript
{
  path: '/system/example',
  component: Layout,
  hidden: true,
  permissions: ['system:example:view'],
  children: [
    {
      path: 'detail/:id',
      component: () => import('@/views/system/example/detail.vue'),
      name: 'ExampleDetail',
      meta: {
        title: '示例详情',
        activeMenu: '/system/example',
        noCache: true
      }
    }
  ]
}
```

### 3. 路由跳转

```typescript
// 基础跳转
router.push('/example')

// 带参数跳转
router.push({
  name: 'ExampleDetail',
  params: { id: '1' },
  query: { tab: 'info' }
})

// 编程式导航
const { push } = useRouter()
push('/example')
```

## 组件生成

对于动态路由组件，可使用 `createCustomNameComponent` 工具：

```typescript
import { createCustomNameComponent } from '@/router/utils/createCustomNameComponent'

// 创建具有自定义名称的组件
const UserComponent = createCustomNameComponent(
  () => import('./UserComponent.vue'),
  { name: 'UserComponent' }
)
```

这确保了组件在 keep-alive 缓存中能被正确识别。
