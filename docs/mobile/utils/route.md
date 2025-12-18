# route 路由工具

## 介绍

`route` 是 UniApp 路由辅助工具，提供页面导航、TabBar 判断、URL 解析等功能。该工具基于 pages.json 配置，提供类型安全的路由操作方法。

**核心特性:**

- **当前页面获取** - 获取当前页面实例和路由信息
- **TabBar 判断** - 判断页面是否为底部导航页面
- **URL 解析** - 解析 URL 路径和查询参数
- **多端兼容** - 兼容 H5、小程序等多平台的编码差异

## 基本用法

### 获取当前页面

使用 `getCurrentPage` 获取当前页面实例：

```typescript
import { getCurrentPage } from '@/utils/route'

// 获取当前页面
const page = getCurrentPage()
console.log('当前页面路径:', page?.route)
console.log('页面参数:', page?.options)
```

### 获取当前路由信息

使用 `getCurrentRoute` 获取完整路由信息：

```typescript
import { getCurrentRoute } from '@/utils/route'

// 获取当前路由
const route = getCurrentRoute()
console.log('路径:', route.path)   // '/pages/user/detail'
console.log('参数:', route.query)  // { id: '123', type: 'vip' }

// 实际应用
const loadUserDetail = async () => {
  const { query } = getCurrentRoute()
  const userId = query.id

  if (userId) {
    const user = await api.getUser(userId)
    userData.value = user
  }
}
```

### 判断 TabBar 页面

使用 `isTabBarPage` 判断指定路径是否为 TabBar 页面：

```typescript
import { isTabBarPage } from '@/utils/route'

// 判断路径是否是 TabBar 页面
console.log(isTabBarPage('/pages/index/index'))  // true
console.log(isTabBarPage('/pages/user/detail'))  // false

// 带斜杠和不带斜杠都支持
console.log(isTabBarPage('pages/index/index'))   // true
console.log(isTabBarPage('/pages/index/index'))  // true
```

### 判断当前页面是否为 TabBar

使用 `isCurrentTabBarPage` 判断当前页面：

```typescript
import { isCurrentTabBarPage } from '@/utils/route'

// 判断当前页面
if (isCurrentTabBarPage()) {
  console.log('当前是 TabBar 页面')
  // 使用 switchTab 导航
} else {
  console.log('当前不是 TabBar 页面')
  // 使用 navigateTo 导航
}
```

### 获取 TabBar 列表

直接获取 TabBar 配置列表：

```typescript
import { tabBarList } from '@/utils/route'

// 获取所有 TabBar 页面
console.log(tabBarList)
// [
//   { pagePath: 'pages/index/index', text: '首页', ... },
//   { pagePath: 'pages/user/index', text: '我的', ... }
// ]

// 遍历 TabBar
tabBarList.forEach(item => {
  console.log(item.pagePath, item.text)
})
```

### URL 解析

使用 `parseUrl` 解析 URL 字符串：

```typescript
import { parseUrl } from '@/utils/route'

// 解析 URL
const result = parseUrl('/pages/auth/login?redirect=%2Fpages%2Fuser%2Findex')
console.log(result.path)   // '/pages/auth/login'
console.log(result.query)  // { redirect: '/pages/user/index' }

// 无参数的 URL
const simple = parseUrl('/pages/index/index')
console.log(simple.path)   // '/pages/index/index'
console.log(simple.query)  // {}

// 多参数 URL
const multi = parseUrl('/pages/detail?id=123&type=vip&source=share')
console.log(multi.query)   // { id: '123', type: 'vip', source: 'share' }
```

## 实际应用场景

### 登录重定向

```typescript
import { getCurrentRoute, parseUrl, isTabBarPage } from '@/utils/route'

// 保存当前页面用于登录后跳转
const saveRedirect = () => {
  const { path, query } = getCurrentRoute()

  // 构建完整路径
  const queryStr = Object.keys(query)
    .map(key => `${key}=${encodeURIComponent(query[key])}`)
    .join('&')

  const fullPath = queryStr ? `${path}?${queryStr}` : path

  // 保存到缓存
  cache.set('loginRedirect', fullPath)
}

// 登录成功后跳转
const redirectAfterLogin = () => {
  const redirect = cache.get<string>('loginRedirect')
  cache.remove('loginRedirect')

  if (redirect) {
    const { path } = parseUrl(redirect)

    if (isTabBarPage(path)) {
      uni.switchTab({ url: redirect })
    } else {
      uni.redirectTo({ url: redirect })
    }
  } else {
    // 默认跳转首页
    uni.switchTab({ url: '/pages/index/index' })
  }
}
```

### 智能导航

```typescript
import { isTabBarPage } from '@/utils/route'

// 智能跳转函数
const navigateTo = (url: string) => {
  const { path } = parseUrl(url)

  if (isTabBarPage(path)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

// 使用示例
navigateTo('/pages/index/index')     // 自动使用 switchTab
navigateTo('/pages/user/detail?id=1') // 自动使用 navigateTo
```

### 页面返回处理

```typescript
import { isCurrentTabBarPage, getCurrentPage } from '@/utils/route'

// 返回上一页或首页
const goBack = () => {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    // 有上一页，正常返回
    uni.navigateBack()
  } else if (isCurrentTabBarPage()) {
    // 当前是 TabBar 页面且无上一页，不做处理
    console.log('已经是 TabBar 页面')
  } else {
    // 无上一页且不是 TabBar，跳转首页
    uni.switchTab({ url: '/pages/index/index' })
  }
}
```

### 路由守卫

```typescript
import { getCurrentRoute, isTabBarPage } from '@/utils/route'

// 页面加载时的权限检查
const checkPageAuth = () => {
  const { path, query } = getCurrentRoute()

  // 白名单页面不检查
  const whiteList = ['/pages/login/index', '/pages/index/index']
  if (whiteList.includes(path)) {
    return true
  }

  // 检查登录状态
  const token = cache.get('token')
  if (!token) {
    // 未登录，跳转登录页
    const redirect = encodeURIComponent(
      path + '?' + new URLSearchParams(query as any).toString()
    )
    uni.redirectTo({
      url: `/pages/login/index?redirect=${redirect}`
    })
    return false
  }

  return true
}
```

### 分享参数处理

```typescript
import { parseUrl } from '@/utils/route'

// 小程序页面加载时处理分享参数
onLoad((options) => {
  // 处理普通参数
  if (options?.id) {
    loadDetail(options.id)
  }

  // 处理 scene 参数（扫码进入）
  if (options?.scene) {
    const decoded = decodeURIComponent(options.scene)
    // scene 格式：id=123&source=qrcode
    const { query } = parseUrl(`?${decoded}`)
    if (query.id) {
      loadDetail(query.id)
    }
  }
})
```

### TabBar 徽标管理

```typescript
import { tabBarList } from '@/utils/route'

// 设置 TabBar 徽标
const setTabBarBadge = (pagePath: string, count: number) => {
  const index = tabBarList.findIndex(item => item.pagePath === pagePath)

  if (index === -1) return

  if (count > 0) {
    uni.setTabBarBadge({
      index,
      text: count > 99 ? '99+' : String(count)
    })
  } else {
    uni.removeTabBarBadge({ index })
  }
}

// 使用示例
setTabBarBadge('pages/message/index', 5)  // 显示徽标 5
setTabBarBadge('pages/message/index', 0)  // 移除徽标
```

## API

### 函数列表

| 函数 | 说明 | 返回值 |
|------|------|--------|
| getCurrentPage | 获取当前页面实例 | `Page` |
| getCurrentRoute | 获取当前路由信息 | `{ path: string, query: Record<string, string> }` |
| isTabBarPage | 判断路径是否是 TabBar 页面 | `boolean` |
| isCurrentTabBarPage | 判断当前页面是否是 TabBar 页面 | `boolean` |
| parseUrl | 解析 URL 字符串 | `{ path: string, query: Record<string, string> }` |

### 常量

| 常量 | 说明 | 类型 |
|------|------|------|
| tabBarList | TabBar 配置列表 | `TabBarItem[]` |

### 类型定义

```typescript
/**
 * TabBar 配置项
 */
interface TabBarItem {
  /** 页面路径 */
  pagePath: string
  /** 文字 */
  text: string
  /** 默认图标 */
  iconPath?: string
  /** 选中图标 */
  selectedIconPath?: string
}

/**
 * 路由信息
 */
interface RouteInfo {
  /** 页面路径 */
  path: string
  /** 查询参数 */
  query: Record<string, string>
}

/**
 * 获取当前页面实例
 * @returns 当前页面实例
 */
function getCurrentPage(): Page | undefined

/**
 * 获取当前路由信息
 * @returns 包含 path 和 query 的对象
 */
function getCurrentRoute(): RouteInfo

/**
 * 判断路径是否是 TabBar 页面
 * @param path 页面路径
 * @returns 是否是 TabBar 页面
 */
function isTabBarPage(path: string): boolean

/**
 * 判断当前页面是否是 TabBar 页面
 * @returns 是否是 TabBar 页面
 */
function isCurrentTabBarPage(): boolean

/**
 * 解析 URL 字符串
 * @param url URL 字符串
 * @returns 包含 path 和 query 的对象
 */
function parseUrl(url: string): RouteInfo
```

## 最佳实践

### 1. 封装导航工具

```typescript
// utils/navigator.ts
import { isTabBarPage, parseUrl } from '@/utils/route'

export const navigator = {
  // 跳转页面
  to(url: string) {
    const { path } = parseUrl(url)
    if (isTabBarPage(path)) {
      uni.switchTab({ url })
    } else {
      uni.navigateTo({ url })
    }
  },

  // 替换页面
  replace(url: string) {
    const { path } = parseUrl(url)
    if (isTabBarPage(path)) {
      uni.switchTab({ url })
    } else {
      uni.redirectTo({ url })
    }
  },

  // 返回
  back(delta = 1) {
    uni.navigateBack({ delta })
  },

  // 重启
  relaunch(url: string) {
    uni.reLaunch({ url })
  }
}
```

### 2. 路由参数类型安全

```typescript
// 定义页面参数类型
interface UserDetailQuery {
  id: string
  type?: 'normal' | 'vip'
}

// 获取类型安全的参数
const getTypedQuery = <T extends Record<string, string>>(): T => {
  const { query } = getCurrentRoute()
  return query as T
}

// 使用
const query = getTypedQuery<UserDetailQuery>()
console.log(query.id)   // string
console.log(query.type) // 'normal' | 'vip' | undefined
```

### 3. 页面栈管理

```typescript
import { getCurrentPage } from '@/utils/route'

// 获取页面栈深度
const getStackDepth = () => {
  return getCurrentPages().length
}

// 返回到指定页面
const backToPage = (targetPath: string) => {
  const pages = getCurrentPages()
  const targetIndex = pages.findIndex(
    page => '/' + page.route === targetPath
  )

  if (targetIndex !== -1) {
    const delta = pages.length - targetIndex - 1
    uni.navigateBack({ delta })
  } else {
    // 目标页面不在栈中，直接跳转
    navigator.replace(targetPath)
  }
}
```

## 常见问题

### 1. getCurrentPage 返回 undefined？

**原因：** 页面栈为空，通常在应用刚启动时

**解决方案：**
```typescript
const page = getCurrentPage()
if (!page) {
  console.warn('页面栈为空')
  return
}
```

### 2. 路由参数编码问题？

`parseUrl` 会自动解码 URL 编码的参数，支持多层编码：

```typescript
// 自动解码
const result = parseUrl('/page?redirect=%252Fpages%252Findex')
// query.redirect = '/pages/index'（已完全解码）
```

### 3. isTabBarPage 判断不准确？

确保传入的路径格式正确：
```typescript
// 以下都能正确判断
isTabBarPage('pages/index/index')   // ✅
isTabBarPage('/pages/index/index')  // ✅

// 错误格式
isTabBarPage('/pages/index')        // ❌ 路径不完整
```

### 4. H5 和小程序路由差异？

`getCurrentRoute` 已处理多端差异，返回统一格式的路由信息。
