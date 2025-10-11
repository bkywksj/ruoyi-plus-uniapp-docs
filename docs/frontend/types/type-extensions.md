# 类型扩展

通过模块声明扩展第三方库的类型定义。

## 🎯 Vue Router 扩展

### 扩展 RouteMeta

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: IconCode
    affix?: boolean
    noCache?: boolean
  }
}
```

## 📦 Axios 扩展

### 自定义请求配置

```typescript
declare module 'axios' {
  export interface AxiosRequestConfig {
    auth?: boolean
    tenant?: boolean
    repeatSubmit?: boolean
  }
}
```

## 🔧 Element Plus 扩展

### 全局组件类型

```typescript
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Icon: typeof import('@/components/Icon/Icon.vue')['default']
    IconSelect: typeof import('@/components/Icon/IconSelect.vue')['default']
  }
}
```

## 使用示例

```typescript
// 路由中使用扩展属性
const route: RouteRecordRaw = {
  path: '/user',
  meta: {
    title: '用户管理',  // ✅ 类型安全
    icon: 'user'        // ✅ 类型安全
  }
}

// Axios 请求中使用
http.get('/api/user', {
  auth: false,          // ✅ 类型安全
  tenant: true
})
```

## 相关文档

- [类型系统概览](./overview.md)
- [路由类型](./router-types.md)
