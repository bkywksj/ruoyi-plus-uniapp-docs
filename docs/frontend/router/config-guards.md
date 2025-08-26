# 路由配置与守卫

## 路由守卫机制

路由守卫是控制路由访问权限和用户体验的核心机制，包含用户认证、权限验证、动态路由生成等功能。

### 核心功能

- **用户认证**: 验证用户登录状态
- **权限控制**: 检查用户访问权限
- **动态路由**: 根据权限生成可访问路由
- **状态管理**: 自动获取用户信息和权限数据
- **用户体验**: 进度条、页面标题、路由重定向

## 前置守卫 (beforeEach)

### 执行流程

```typescript
router.beforeEach(async (to, from, next) => {
  // 1. 开启进度条
  NProgress.start()
  
  // 2. 检查用户登录状态
  if (!isLoggedIn.value) {
    // 未登录处理逻辑
    return handleUnauthenticated(to, next)
  }
  
  // 3. 已登录用户处理
  if (to.path === '/login') {
    return next({ path: '/' }) // 重定向到首页
  }
  
  // 4. 白名单检查
  if (isInWhiteList(to.path)) {
    return next()
  }
  
  // 5. 权限验证
  if (userStore.roles.length > 0) {
    return canAccessRoute(to) ? next() : next('/403')
  }
  
  // 6. 获取用户信息和生成动态路由
  await initUserAndRoutes()
  next({ ...to, replace: true })
})
```

### 白名单配置

不需要登录即可访问的页面：

```typescript
const WHITE_LIST = [
  '/login',           // 登录页
  '/register',        // 注册页
  '/socialCallback',  // 社交登录回调
  '/register*',       // 注册相关页面（通配符）
  '/register/*',      // 注册子页面
  '/401',             // 未授权页面
  '/home'             // 前台首页
]

const isInWhiteList = (path: string) => {
  return WHITE_LIST.some(pattern => isPathMatch(pattern, path))
}
```

### 用户信息获取

```typescript
// 防重复获取机制
let isFetchingUserInfo = false

const initUserAndRoutes = async () => {
  if (isFetchingUserInfo) return
  
  isFetchingUserInfo = true
  
  try {
    // 获取用户信息
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      await userStore.logoutUser()
      return next({ path: '/' })
    }
    
    // 生成动态路由
    const [generateRoutesErr, accessRoutes] = await permissionStore.generateRoutes()
    if (generateRoutesErr) {
      return next('/403')
    }
    
    // 添加路由到路由表
    accessRoutes.forEach(route => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })
  } finally {
    isFetchingUserInfo = false
  }
}
```

## 后置守卫 (afterEach)

### 功能实现

```typescript
router.afterEach((to) => {
  // 结束进度条
  NProgress.done()
  
  // 设置页面标题
  const themeStore = useThemeStore()
  if (to.meta.title) {
    themeStore.setTitle(to.meta.title as string)
  }
})
```

## 进度条配置

### NProgress 设置

```typescript
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 进度条配置
NProgress.configure({ 
  showSpinner: false  // 隐藏加载图标
})
```

### 使用场景

- 路由切换时自动显示/隐藏
- 长时间异步操作的视觉反馈
- 提升用户体验的重要工具

## 权限验证

### useAuth 权限钩子

```typescript
const { canAccessRoute, isLoggedIn } = useAuth()

// 检查路由访问权限
if (canAccessRoute(to)) {
  next()
} else {
  next('/403')
}
```

### 权限检查逻辑

```typescript
const canAccessRoute = (route: RouteLocationNormalized) => {
  // 1. 检查路由是否需要权限
  if (!route.meta?.permissions && !route.meta?.roles) {
    return true
  }
  
  // 2. 检查用户权限
  const userPermissions = userStore.permissions
  const userRoles = userStore.roles
  
  // 3. 权限验证
  if (route.meta.permissions) {
    return route.meta.permissions.some(permission => 
      userPermissions.includes(permission)
    )
  }
  
  // 4. 角色验证
  if (route.meta.roles) {
    return route.meta.roles.some(role => 
      userRoles.includes(role)
    )
  }
  
  return false
}
```

## 错误处理

### 常见错误场景

```typescript
// 1. 用户信息获取失败
const [fetchUserErr] = await userStore.fetchUserInfo()
if (fetchUserErr) {
  // 自动注销并重定向
  await userStore.logoutUser()
  return next({ path: '/' })
}

// 2. 动态路由生成失败
const [generateRoutesErr] = await permissionStore.generateRoutes()
if (generateRoutesErr) {
  showMsgError(generateRoutesErr)
  return next('/403')
}

// 3. 网络异常处理
if (!logoutErr) {
  return next({ path: '/' })
} else {
  showNotifyError({
    title: '系统提示',
    message: '后端服务未启动或异常，请检查!',
    duration: 10000
  })
}
```

## 路由重置

### resetRouter 函数

```typescript
export const resetRouter = () => {
  // 创建新的路由实例
  const newRouter = createRouter({
    history: createWebHistory(SystemConfig.app.contextPath),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition
      return { top: 0 }
    }
  })
  
  // 重置路由匹配器
  router.matcher = newRouter.matcher
}
```

### 使用场景

- 用户退出登录时清除动态路由
- 权限变更后重新初始化路由
- 角色切换时更新可访问路由

## 最佳实践

### 1. 路由守卫优化

```typescript
// ❌ 避免在守卫中进行大量同步操作
router.beforeEach((to, from, next) => {
  // 大量同步计算...
  next()
})

// ✅ 使用异步操作和缓存
router.beforeEach(async (to, from, next) => {
  const cachedResult = getCachedResult()
  if (!cachedResult) {
    await computeAsync()
  }
  next()
})
```

### 2. 权限检查缓存

```typescript
// 缓存权限检查结果，避免重复计算
const permissionCache = new Map()

const canAccessRoute = (route) => {
  const cacheKey = `${route.path}-${userStore.roles.join(',')}`
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)
  }
  
  const result = checkPermissions(route)
  permissionCache.set(cacheKey, result)
  return result
}
```

### 3. 导航失败处理

```typescript
// 处理导航失败的情况
router.push('/target').catch(failure => {
  if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
    // 处理导航取消
  }
})
```
