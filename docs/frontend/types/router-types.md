# 路由类型

路由类型通过模块扩展方式扩展 Vue Router 的类型定义，添加自定义属性和功能。

## 🎯 路由元数据类型

### RouteMeta 接口

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    /** 外部链接 */
    link?: string
    /** 路由标题 */
    title?: string
    /** 是否固定在标签栏 */
    affix?: boolean
    /** 是否不缓存 */
    noCache?: boolean
    /** 高亮侧边栏 */
    activeMenu?: string
    /** 路由图标 */
    icon?: IconCode
    /** 显示面包屑 */
    breadcrumb?: boolean
    /** 国际化键 */
    i18nKey?: string
  }
}
```

### 使用示例

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: Layout,
    meta: {
      title: '用户管理',
      icon: 'user',
      affix: false,
      noCache: false
    },
    children: [...]
  }
]
```

## 📋 路由记录扩展

### _RouteRecordBase 接口

```typescript
declare module 'vue-router' {
  interface _RouteRecordBase {
    /** 是否隐藏 */
    hidden?: boolean
    /** 权限标识 */
    permissions?: string[]
    /** 角色 */
    roles?: string[]
    /** 总是显示根路由 */
    alwaysShow?: boolean
    /** 默认参数 */
    query?: string
    /** 父路由路径 */
    parentPath?: string
  }
}
```

### 使用示例

```typescript
{
  path: '/system/user',
  hidden: false,
  permissions: ['system:user:query'],
  roles: ['admin'],
  alwaysShow: true
}
```

## 🏷️ 标签视图类型

### TagView 接口

```typescript
interface TagView {
  fullPath?: string
  name?: string
  path?: string
  title?: string
  meta?: RouteMeta
  query?: LocationQuery
}
```
