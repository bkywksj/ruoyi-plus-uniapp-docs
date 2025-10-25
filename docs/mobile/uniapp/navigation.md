# 路由导航

## 概述

uni-app 使用单页面应用模型，页面跳转通过路由导航 API 实现。本文档介绍路由导航的各种方式、参数传递、以及项目中的最佳实践。

## 路由 API

### uni.navigateTo

保留当前页面，跳转到应用内的某个页面，可以使用 `uni.navigateBack` 返回。

```typescript
uni.navigateTo({
  url: '/pages/user/profile?id=123',
  success: (res) => {
    console.log('跳转成功')
  },
  fail: (err) => {
    console.error('跳转失败', err)
  }
})
```

**特点**：
- ✅ 保留当前页面在页面栈中
- ✅ 可以返回上一页
- ✅ 支持传递参数
- ❌ 页面栈最多 10 层

**适用场景**：
- 详情页面
- 表单页面
- 需要返回的页面

### uni.redirectTo

关闭当前页面,跳转到应用内的某个页面。

```typescript
uni.redirectTo({
  url: '/pages/index/index'
})
```

**特点**：
- ✅ 不占用页面栈
- ✅ 无法返回上一页
- ❌ 不能跳转到 tabBar 页面

**适用场景**：
- 登录成功跳转
- 表单提交后跳转
- 不需要返回的页面

### uni.reLaunch

关闭所有页面,打开到应用内的某个页面。

```typescript
uni.reLaunch({
  url: '/pages/index/index'
})
```

**特点**：
- ✅ 清空页面栈
- ✅ 可以跳转到 tabBar 页面
- ✅ 重置应用状态

**适用场景**：
- 退出登录
- 应用重置
- 切换租户/角色

### uni.switchTab

跳转到 tabBar 页面,并关闭其他所有非 tabBar 页面。

```typescript
uni.switchTab({
  url: '/pages/index/index'
})
```

**特点**：
- ✅ 专用于 tabBar 页面
- ❌ 不能传递参数（URL 参数会被忽略）
- ✅ 自动关闭非 tabBar 页面

**适用场景**：
- 切换 tabBar 页面
- 底部导航切换

### uni.navigateBack

关闭当前页面,返回上一页面或多级页面。

```typescript
// 返回上一页
uni.navigateBack()

// 返回上两页
uni.navigateBack({
  delta: 2
})
```

**参数说明**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `delta` | Number | 1 | 返回的页面数 |

**特点**：
- ✅ 返回页面栈中的页面
- ✅ 可以连续返回多页
- ❌ 超出页面栈深度会失败

## 路由参数传递

### 传递简单参数

通过 URL 查询字符串传递参数：

```typescript
// 跳转时传递参数
uni.navigateTo({
  url: '/pages/user/profile?id=123&name=张三'
})
```

```vue
<!-- 目标页面接收参数 -->
<script setup lang="ts">
// 页面加载时接收参数
onLoad((options) => {
  console.log(options.id)    // '123'
  console.log(options.name)  // '张三'
})
</script>
```

### 传递复杂参数

使用项目中的 `objectToQuery` 工具函数：

```typescript
// src/stores/modules/tabbar.ts:94
import { objectToQuery } from '@/utils/string'

const toTab = async (index: number, params?: Record<string, any>) => {
  const query = objectToQuery({
    tab: index.toString(),
    ...params,
  })

  await uni.navigateTo({
    url: `/${TABBAR_PAGE_PATH}?${query}`,
  })
}
```

### 参数编码与解码

项目提供了完整的 URL 解析工具：

```typescript
// src/utils/route.ts:87
export const parseUrl = (url: string) => {
  const [path, queryStr] = url.split('?')

  if (!queryStr) {
    return {
      path,
      query: {},
    }
  }

  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    // 递归解码，支持多层编码
    query[key] = fullyDecodeUrl(value)
  })

  return { path, query }
}
```

**使用示例**：

```typescript
const { path, query } = parseUrl('/pages/user/profile?id=123&name=%E5%BC%A0%E4%B8%89')
console.log(path)   // '/pages/user/profile'
console.log(query)  // { id: '123', name: '张三' }
```

## 路由判断

### 判断是否为 TabBar 页面

```typescript
// src/utils/route.ts:40
export const isTabBarPage = (path: string) => {
  if (!tabBar) {
    return false
  }

  if (!tabBar.list.length) {
    return false
  }

  // 处理路径格式
  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // 在 tabBar 列表中查找匹配的页面路径
  return !!tabBar.list.find((e) => e.pagePath === path)
}
```

**使用示例**：

```typescript
import { isTabBarPage } from '@/utils/route'

if (isTabBarPage('/pages/index/index')) {
  uni.switchTab({ url: '/pages/index/index' })
} else {
  uni.navigateTo({ url: '/pages/index/index' })
}
```

### 判断当前页面是否为 TabBar 页面

```typescript
// src/utils/route.ts:22
export const isCurrentTabBarPage = () => {
  try {
    const lastPage = getCurrentPage()
    const currPath = lastPage?.route

    return Boolean(tabBar?.list?.some((item) => item.pagePath === currPath))
  } catch {
    return false
  }
}
```

### 获取当前页面信息

```typescript
// src/utils/route.ts:10
export const getCurrentPage = () => {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}
```

**使用示例**：

```typescript
import { getCurrentPage } from '@/utils/route'

const currentPage = getCurrentPage()
console.log(currentPage?.route)      // 页面路径
console.log(currentPage?.options)    // 页面参数
```

### 获取当前路由信息

```typescript
// src/utils/route.ts:120
export const getCurrentRoute = () => {
  const lastPage = getCurrentPage()
  const currRoute = (lastPage as any).$page
  const { fullPath } = currRoute as { fullPath: string }

  return parseUrl(fullPath)
}
```

**使用示例**：

```typescript
import { getCurrentRoute } from '@/utils/route'

const { path, query } = getCurrentRoute()
console.log(path)   // '/pages/auth/login'
console.log(query)  // { redirect: '/pages/demo/index' }
```

## 项目实践

### 登录跳转与重定向

登录成功后跳转到指定页面：

```typescript
// src/composables/useHttp.ts:87
const handleUnauthorized = async () => {
  if (isReLogin.show) return

  isReLogin.show = true

  try {
    const userStore = useUserStore()
    await userStore.logoutUser()

    // 获取当前页面路径作为登录后的重定向地址
    const currentPath = `/${getCurrentPage()?.route}`
    uni.navigateTo({
      url: `/pages/auth/login?redirect=${currentPath}`,
    })
  } finally {
    isReLogin.show = false
  }
}
```

登录页面处理重定向：

```vue
<script setup lang="ts">
onLoad((options) => {
  const redirect = options.redirect || '/pages/index/index'

  // 登录成功后跳转
  const handleLoginSuccess = () => {
    if (isTabBarPage(redirect)) {
      uni.switchTab({ url: redirect })
    } else {
      uni.redirectTo({ url: redirect })
    }
  }
})
</script>
```

### TabBar 页面切换

项目中使用自定义 TabBar，通过 store 管理跳转：

```typescript
// src/stores/modules/tabbar.ts:80
const toTab = async (index: number, params?: Record<string, any>) => {
  index = isDef(index) ? (typeof index === 'string' ? Number(index) : index) : 0
  if (index < 0 || index >= tabs.value.length) return

  currentTab.value = index
  tabs.value[index].loaded = true

  // 检查是否在 tabbar 页面
  const isInTabbar = getCurrentPage()?.route === TABBAR_PAGE_PATH

  if (!isInTabbar) {
    // 不在 tabbar 页面，需要跳转
    const query = objectToQuery({
      tab: index.toString(),
      ...params,
    })

    await uni.navigateTo({
      url: `/${TABBAR_PAGE_PATH}?${query}`,
    })
  }

  clearBadge(index)
}
```

**使用示例**：

```vue
<script setup lang="ts">
import { useTabbarStore } from '@/stores/modules/tabbar'

const tabbarStore = useTabbarStore()

// 跳转到购物车
const goToCart = () => {
  tabbarStore.toTab(2)
}

// 跳转到我的页面并传递参数
const goToMyWithParams = () => {
  tabbarStore.toTab(3, { showOrders: true })
}
</script>
```

### 用户信息检查跳转

在需要用户信息的场景下，检查后再跳转：

```typescript
// src/stores/modules/user.ts:534
const navigateWithUserCheck = (
  options?: UniNamespace.NavigateToOptions & NavigateToOptions,
  mode: 'modal' | 'page' = 'modal',
  authPagePath: string = '/pages/auth/auth',
) => {
  if (isDef(options?.url)) {
    if (hasUserAuth.value) {
      // 有用户信息，直接跳转
      uni.navigateTo(options)
    } else {
      // 没有用户信息，根据模式处理
      if (mode === 'modal') {
        authModalVisible.value = true
      } else {
        // 跳转到授权页面，带上重定向参数
        const authUrl = `${authPagePath}?redirect=${options.url}`
        uni.navigateTo({
          ...options,
          url: authUrl,
        })
      }
    }
  }
}
```

**使用示例**：

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 需要用户信息的跳转
const goToProfile = () => {
  userStore.navigateWithUserCheck({
    url: '/pages/user/profile'
  }, 'page')  // 使用页面模式
}
</script>
```

## 路由拦截

### 拦截器示例

虽然 uni-app 没有内置路由拦截器，但可以通过封装实现：

```typescript
/**
 * 路由拦截器
 */
export const navigateToWithCheck = (options: UniNamespace.NavigateToOptions) => {
  const userStore = useUserStore()

  // 检查登录状态
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: `/pages/auth/login?redirect=${options.url}`
    })
    return
  }

  // 检查权限
  if (!hasPermission(options.url)) {
    uni.showToast({
      title: '无权限访问',
      icon: 'none'
    })
    return
  }

  // 通过检查，跳转
  uni.navigateTo(options)
}
```

## 页面栈管理

### 获取页面栈

```typescript
const pages = getCurrentPages()
console.log(pages.length)  // 当前页面栈深度
console.log(pages[0])      // 第一个页面
console.log(pages[pages.length - 1])  // 当前页面
```

### 页面栈限制

**小程序和 H5**：
- 最多 10 层页面栈
- 超过 10 层时 `navigateTo` 会失败

**解决方案**：

```typescript
const navigateToSafe = (options: UniNamespace.NavigateToOptions) => {
  const pages = getCurrentPages()

  if (pages.length >= 10) {
    // 页面栈已满，使用 redirectTo
    uni.redirectTo(options)
  } else {
    uni.navigateTo(options)
  }
}
```

### 清空页面栈

```typescript
// 返回到首页并清空页面栈
uni.reLaunch({
  url: '/pages/index/index'
})
```

## 编程式导航封装

### 统一导航方法

```typescript
export const navigateTo = (url: string, params?: Record<string, any>) => {
  let fullUrl = url

  if (params) {
    const query = objectToQuery(params)
    fullUrl += (url.includes('?') ? '&' : '?') + query
  }

  if (isTabBarPage(url)) {
    return uni.switchTab({ url: fullUrl })
  }

  return uni.navigateTo({ url: fullUrl })
}
```

**使用示例**：

```typescript
// 自动判断是否为 tabBar 页面
navigateTo('/pages/index/index')

// 传递参数
navigateTo('/pages/user/profile', { id: 123, name: '张三' })
```

## 导航组件

### wd-navbar 导航栏

项目使用自定义导航栏组件：

```vue
<template>
  <wd-navbar
    title="用户资料"
    show-back
    @click-left="handleBack"
  />
</template>

<script setup lang="ts">
const handleBack = () => {
  uni.navigateBack()
}
</script>
```

### wd-navbar 返回逻辑

```typescript
// src/wd/components/wd-navbar/wd-navbar.vue
const handleClickLeft = () => {
  emit('click-left')

  if (props.showBack) {
    // 默认返回上一页
    uni.navigateBack()
  }
}
```

## 最佳实践

### 1. 选择合适的导航方式

```typescript
// ✅ 推荐：根据场景选择
// 详情页面 - 保留上一页
uni.navigateTo({ url: '/pages/product/detail?id=123' })

// 登录成功 - 不需要返回
uni.redirectTo({ url: '/pages/index/index' })

// 退出登录 - 清空页面栈
uni.reLaunch({ url: '/pages/auth/login' })

// TabBar 切换
uni.switchTab({ url: '/pages/index/index' })

// ❌ 不推荐：不合适的导航方式
// TabBar 页面使用 navigateTo
uni.navigateTo({ url: '/pages/index/index' })  // 错误
```

### 2. 参数传递规范

```typescript
// ✅ 推荐：使用工具函数处理参数
import { objectToQuery } from '@/utils/string'

const params = {
  id: 123,
  name: '张三',
  tags: ['tag1', 'tag2']  // 复杂类型需要序列化
}

uni.navigateTo({
  url: `/pages/user/profile?${objectToQuery(params)}`
})

// ❌ 不推荐：手动拼接 URL
uni.navigateTo({
  url: '/pages/user/profile?id=123&name=张三'  // 未编码，可能出错
})
```

### 3. 路由判断

```typescript
// ✅ 推荐：使用工具函数判断
import { isTabBarPage } from '@/utils/route'

const goto = (url: string) => {
  if (isTabBarPage(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

// ❌ 不推荐：硬编码判断
const goto = (url: string) => {
  if (url === '/pages/index/index' || url === '/pages/my/index') {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}
```

### 4. 错误处理

```typescript
// ✅ 推荐：处理导航失败
uni.navigateTo({
  url: '/pages/user/profile?id=123',
  success: () => {
    console.log('跳转成功')
  },
  fail: (err) => {
    console.error('跳转失败', err)
    // 降级处理
    uni.redirectTo({ url: '/pages/index/index' })
  }
})
```

### 5. 页面栈管理

```typescript
// ✅ 推荐：检查页面栈深度
const navigateSafe = (url: string) => {
  const pages = getCurrentPages()

  if (pages.length >= 9) {
    // 页面栈快满了，使用 redirectTo
    uni.redirectTo({ url })
  } else {
    uni.navigateTo({ url })
  }
}
```

## 常见问题

### 1. switchTab 无法传递参数？

**问题**：
```typescript
// 参数会被忽略
uni.switchTab({
  url: '/pages/index/index?tab=2'
})
```

**解决方案**：
使用全局状态管理或事件总线：

```typescript
// 方案 1：使用 Pinia Store
const tabbarStore = useTabbarStore()
tabbarStore.toTab(2)

// 方案 2：使用事件总线
uni.$emit('switchTab', { tab: 2 })
```

### 2. navigateTo 页面栈已满？

**问题**：
```
navigateTo:fail page limit exceeded
```

**解决方案**：

```typescript
// 检查页面栈深度
const pages = getCurrentPages()
if (pages.length >= 10) {
  uni.redirectTo({ url })  // 使用 redirectTo
} else {
  uni.navigateTo({ url })
}
```

### 3. URL 参数中文乱码？

**问题**：
```typescript
uni.navigateTo({
  url: '/pages/user/profile?name=张三'  // 中文未编码
})
```

**解决方案**：

```typescript
// 使用 encodeURIComponent 编码
const name = encodeURIComponent('张三')
uni.navigateTo({
  url: `/pages/user/profile?name=${name}`
})

// 或使用项目工具函数
import { objectToQuery } from '@/utils/string'
uni.navigateTo({
  url: `/pages/user/profile?${objectToQuery({ name: '张三' })}`
})
```

### 4. 如何获取上一个页面？

**解决方案**：

```typescript
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]

if (prevPage) {
  // 调用上一页面的方法
  prevPage.$vm.refreshData()
}
```

### 5. 返回时刷新上一页面？

**解决方案**：

```typescript
// 方案 1：使用事件总线
// 目标页面
onShow(() => {
  uni.$on('refreshData', refreshData)
})

onUnload(() => {
  uni.$off('refreshData')
})

// 当前页面返回前
onUnload(() => {
  uni.$emit('refreshData')
})

// 方案 2：使用页面栈
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]
if (prevPage?.$vm?.refreshData) {
  prevPage.$vm.refreshData()
}
uni.navigateBack()
```

## 相关文档

- [生命周期](./lifecycle.md) - 页面生命周期
- [页面配置 (pages.json)](./pages-config.md) - 路由配置
