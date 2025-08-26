# 权限状态管理 (permission)

## 功能概述

权限状态管理模块负责动态路由的生成、权限过滤和多布局路由管理，是实现基于角色的访问控制(RBAC)的核心模块。

## 核心职责

- **动态路由生成**：从后端获取路由配置并转换为前端路由
- **权限过滤**：基于用户角色和权限过滤路由
- **布局管理**：处理顶部导航、侧边栏等不同布局需求
- **组件加载**：动态加载路由对应的视图组件

## 状态定义

```typescript
// 路由状态
routes: RouteRecordRaw[]           // 所有路由（静态+动态）
addRoutes: RouteRecordRaw[]       // 动态添加的路由
defaultRoutes: RouteRecordRaw[]   // 默认路由
topbarRouters: RouteRecordRaw[]   // 顶部导航路由
sidebarRouters: RouteRecordRaw[]  // 侧边栏路由
```

## 核心方法

### generateRoutes - 生成动态路由
```typescript
async generateRoutes(): Result<RouteRecordRaw[]>
```
完整的路由生成流程：
1. 从后端API获取路由配置
2. 转换路由为前端组件对象
3. 处理不同布局场景的路由格式
4. 添加有权限的动态路由
5. 检查路由名称冲突

### filterAsyncRouter - 路由转换
```typescript
filterAsyncRouter(
  asyncRouterMap: RouteRecordRaw[], 
  lastRouter?: RouteRecordRaw, 
  type?: boolean
): RouteRecordRaw[]
```
将后端路由配置转换为前端路由：
- 字符串组件名转换为组件对象
- 处理Layout、ParentView、InnerLink特殊组件
- 递归处理嵌套路由

### filterDynamicRoutes - 权限过滤
```typescript
filterDynamicRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[]
```
基于用户权限过滤路由：
- 检查路由所需permissions
- 验证路由所需roles
- 返回用户有权访问的路由

## 路由组件映射

### 特殊组件处理
```typescript
// Layout组件 - 主布局容器
if (route.component === 'Layout') {
  route.component = Layout
}

// ParentView - 嵌套路由容器
if (route.component === 'ParentView') {
  route.component = ParentView
}

// InnerLink - iframe内嵌页面
if (route.component === 'InnerLink') {
  route.component = InnerLink
}
```

### 动态视图加载
```typescript
// 使用import.meta.glob动态加载视图
const modules = import.meta.glob('./../../views/**/*.vue')

// 根据路径匹配并加载组件
loadView(view: string, name: string)
```

## 多布局路由管理

### 路由类型分配
- **constantRoutes**: 静态路由（登录、404等）
- **sidebarRoutes**: 侧边栏菜单路由
- **topbarRoutes**: 顶部导航路由
- **defaultRoutes**: 默认基础路由

### 布局场景处理
```typescript
// 侧边栏路由 - 保持原始嵌套结构
const sidebarRoutes = filterAsyncRouter(sdata)

// 重写路由 - 扁平化处理
const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)

// 顶部路由 - 用于顶部导航
const defaultRoutes = filterAsyncRouter(defaultData)
```

## 使用示例

### 初始化路由
```typescript
// 在路由守卫中生成路由
router.beforeEach(async (to, from, next) => {
  if (hasToken && !permissionStore.routes.length) {
    const [err, routes] = await permissionStore.generateRoutes()
    if (!err) {
      // 动态添加路由
      routes.forEach(route => router.addRoute(route))
      next({ ...to, replace: true })
    }
  }
})
```

### 获取菜单数据
```typescript
// 侧边栏菜单
const sidebarMenus = computed(() => 
  permissionStore.getSidebarRoutes()
)

// 顶部导航
const topbarMenus = computed(() => 
  permissionStore.getTopbarRoutes()
)
```

## 路由冲突检测

### duplicateRouteChecker
自动检测路由名称重复问题：
- 递归展平所有路由
- 检查name属性唯一性
- 发现冲突时弹出警告

```typescript
// 避免的问题：
// - 路由跳转失败
// - 页面404错误
// - 导航高亮异常
```

## 与其他模块协作

### 与 User Store
- 依赖用户的roles和permissions
- 登录成功后触发路由生成

### 与 TagsView Store
- 提供可访问的路由列表
- 控制哪些页面可以被缓存

### 与 Auth Composable
- 使用hasPermission判断权限
- 使用hasRole验证角色

## 性能优化

1. **路由懒加载**：使用import.meta.glob实现按需加载
2. **组件缓存**：配合keep-alive缓存常用页面
3. **路由复用**：相同组件不同参数的路由复用组件实例
4. **权限缓存**：避免重复的权限计算

## 注意事项

1. **路由名称唯一性**：确保每个路由的name属性唯一
2. **组件命名规范**：组件name要与路由name一致（用于keep-alive）
3. **权限配置位置**：权限配置应在路由meta中定义
4. **动态路由限制**：避免过深的路由嵌套（建议不超过3层）
