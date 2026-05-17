# route 路由工具

## 介绍

`route` 是 UniApp 路由辅助工具，提供页面导航、TabBar 判断、URL 解析等功能。该工具基于 pages.json 配置，提供类型安全的路由操作方法，是构建复杂导航逻辑的核心工具。

**核心特性:**

- **当前页面获取** - 获取当前页面实例和路由信息
- **TabBar 判断** - 判断页面是否为底部导航页面
- **URL 解析** - 解析 URL 路径和查询参数
- **多端兼容** - 兼容 H5、小程序等多平台的编码差异
- **递归解码** - 支持多层 URL 编码的完全解码
- **类型安全** - 提供完整的 TypeScript 类型定义

## 架构设计

### 路由系统整体架构

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UniApp 路由系统架构                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        pages.json 配置层                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │
│  │  │   pages     │  │ subPackages │  │         tabBar              │  │   │
│  │  │   主包页面   │  │   分包页面   │  │  ┌─────┐ ┌─────┐ ┌─────┐   │  │   │
│  │  │             │  │             │  │  │首页 │ │消息 │ │我的 │   │  │   │
│  │  └─────────────┘  └─────────────┘  │  └─────┘ └─────┘ └─────┘   │  │   │
│  │                                     └─────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         route.ts 工具层                              │   │
│  │                                                                      │   │
│  │  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │   │
│  │  │   页面获取模块     │  │   TabBar 判断模块  │  │   URL 解析模块   │  │   │
│  │  │                   │  │                   │  │                 │  │   │
│  │  │ • getCurrentPage  │  │ • isTabBarPage    │  │ • parseUrl      │  │   │
│  │  │ • getCurrentRoute │  │ • isCurrentTabBar │  │ • fullyDecodeUrl│  │   │
│  │  │                   │  │ • tabBarList      │  │                 │  │   │
│  │  └───────────────────┘  └───────────────────┘  └─────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        UniApp 原生路由 API                           │   │
│  │                                                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────────┐  │   │
│  │  │ navigateTo  │ │ redirectTo  │ │ switchTab  │ │ navigateBack   │  │   │
│  │  │   保留跳转   │ │   替换跳转   │ │  Tab切换   │ │    返回上页     │  │   │
│  │  └─────────────┘ └─────────────┘ └────────────┘ └────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                    getCurrentPages()                         │    │   │
│  │  │              获取当前页面栈（最多10层）                         │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 页面栈管理机制

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           页面栈管理示意图                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  页面栈最大深度: 10 层                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │   navigateTo          redirectTo           switchTab                 │   │
│  │   (入栈操作)           (替换栈顶)           (清空非TabBar页面)          │   │
│  │       │                   │                    │                     │   │
│  │       ▼                   ▼                    ▼                     │   │
│  │   ┌───────┐           ┌───────┐           ┌───────┐                 │   │
│  │   │ 新页面 │←入栈      │ 新页面 │←替换       │TabBar │←切换            │   │
│  │   ├───────┤           ├───────┤           ├───────┤                 │   │
│  │   │ 页面C │           │ 页面B │           │ 页面A │←保留(如果是Tab)   │   │
│  │   ├───────┤           ├───────┤           └───────┘                 │   │
│  │   │ 页面B │           │ 页面A │                                      │   │
│  │   ├───────┤           └───────┘           navigateBack              │   │
│  │   │ 页面A │                               (出栈操作)                  │   │
│  │   └───────┘                                   │                      │   │
│  │                                               ▼                      │   │
│  │                                           ┌───────┐                 │   │
│  │                                           │ 页面B │←出栈，返回此页    │   │
│  │                                           ├───────┤                 │   │
│  │                                           │ 页面A │                  │   │
│  │                                           └───────┘                 │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  reLaunch: 清空所有页面栈，打开新页面                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### TabBar 判断流程

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           isTabBarPage 判断流程                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              输入路径                                        │
│                                │                                            │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │    tabBar 配置存在?    │                               │
│                    └───────────────────────┘                               │
│                           │          │                                      │
│                         是│          │否                                    │
│                           ▼          ▼                                      │
│              ┌─────────────────┐  ┌─────────────────┐                      │
│              │ tabBar.list     │  │   返回 false    │                      │
│              │ 不为空?          │  └─────────────────┘                      │
│              └─────────────────┘                                           │
│                    │          │                                             │
│                  是│          │否                                           │
│                    ▼          ▼                                             │
│       ┌─────────────────┐  ┌─────────────────┐                             │
│       │ 路径以 / 开头?   │  │   返回 false    │                             │
│       └─────────────────┘  └─────────────────┘                             │
│              │          │                                                   │
│            是│          │否                                                 │
│              ▼          │                                                   │
│     ┌─────────────────┐ │                                                  │
│     │  移除开头的 /   │ │                                                  │
│     │ path.substring(1)│ │                                                  │
│     └─────────────────┘ │                                                  │
│              │          │                                                   │
│              └────┬─────┘                                                   │
│                   ▼                                                         │
│       ┌───────────────────────┐                                            │
│       │ 在 tabBar.list 中     │                                            │
│       │ 查找匹配的 pagePath   │                                            │
│       └───────────────────────┘                                            │
│                   │                                                         │
│           ┌──────┴──────┐                                                  │
│           ▼             ▼                                                   │
│     ┌──────────┐  ┌──────────┐                                             │
│     │ 找到匹配  │  │ 未找到   │                                             │
│     │ 返回true │  │ 返回false│                                             │
│     └──────────┘  └──────────┘                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### URL 解析流程

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           parseUrl 解析流程                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  输入: '/pages/user/detail?id=123&name=%E5%BC%A0%E4%B8%89'                  │
│                                │                                            │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │   按 '?' 分割 URL     │                               │
│                    └───────────────────────┘                               │
│                           │          │                                      │
│                     path  │          │  queryStr                           │
│               ┌───────────┘          └───────────┐                         │
│               ▼                                  ▼                         │
│    '/pages/user/detail'            'id=123&name=%E5%BC%A0%E4%B8%89'         │
│               │                                  │                         │
│               │                                  ▼                         │
│               │                    ┌───────────────────────┐               │
│               │                    │   queryStr 存在?      │               │
│               │                    └───────────────────────┘               │
│               │                           │          │                     │
│               │                         是│          │否                   │
│               │                           ▼          ▼                     │
│               │              ┌─────────────────┐  ┌──────────────┐        │
│               │              │ 按 '&' 分割参数  │  │ query = {}   │        │
│               │              └─────────────────┘  └──────────────┘        │
│               │                         │                                  │
│               │                         ▼                                  │
│               │              ┌─────────────────────────────┐              │
│               │              │ 遍历每个 key=value 对        │              │
│               │              │ 按 '=' 分割，递归解码 value  │              │
│               │              └─────────────────────────────┘              │
│               │                         │                                  │
│               │                         ▼                                  │
│               │              ┌─────────────────────────────┐              │
│               │              │ fullyDecodeUrl 递归解码      │              │
│               │              │ %E5%BC%A0%E4%B8%89 → 张三    │              │
│               │              └─────────────────────────────┘              │
│               │                         │                                  │
│               └────────────┬────────────┘                                  │
│                            ▼                                               │
│              ┌──────────────────────────────────┐                          │
│              │  返回 { path, query }             │                          │
│              │  {                                │                          │
│              │    path: '/pages/user/detail',    │                          │
│              │    query: { id: '123', name: '张三' }│                       │
│              │  }                                │                          │
│              └──────────────────────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 递归解码机制

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        fullyDecodeUrl 递归解码流程                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  场景: 多层 URL 编码 (常见于小程序分享、扫码场景)                               │
│                                                                             │
│  输入: '%252Fpages%252Fuser%252Findex'                                      │
│                                │                                            │
│                         第一次递归                                           │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │  以 '%' 开头?          │                               │
│                    │  是 → 执行解码         │                               │
│                    └───────────────────────┘                               │
│                                │                                            │
│                                ▼                                            │
│              decodeURIComponent('%252Fpages%252Fuser%252Findex')            │
│                                │                                            │
│                                ▼                                            │
│              结果: '%2Fpages%2Fuser%2Findex'                                │
│                                │                                            │
│                         第二次递归                                           │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │  以 '%' 开头?          │                               │
│                    │  是 → 执行解码         │                               │
│                    └───────────────────────┘                               │
│                                │                                            │
│                                ▼                                            │
│              decodeURIComponent('%2Fpages%2Fuser%2Findex')                  │
│                                │                                            │
│                                ▼                                            │
│              结果: '/pages/user/index'                                      │
│                                │                                            │
│                         第三次检查                                           │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │  以 '%' 开头?          │                               │
│                    │  否 → 返回结果         │                               │
│                    └───────────────────────┘                               │
│                                │                                            │
│                                ▼                                            │
│              最终结果: '/pages/user/index'                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 源码实现分析

### 核心模块结构

```typescript
// route.ts 完整源码结构

import pagesConfig from '@/pages.json'

// 从 pages.json 配置中解构出页面配置、分包配置和底部导航配置
const { pages, subPackages, tabBar = { list: [] } } = { ...pagesConfig }

/**
 * 获取当前页面栈中的最后一个页面（即当前页面）
 * @returns 当前页面实例
 */
export const getCurrentPage = () => {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

// 导出底部导航栏配置列表，用于其他模块使用
export const tabBarList = tabBar?.list || []

/**
 * 判断当前页面是否是 tabBar 页面
 * @returns true: 当前页面是 tabBar 页面, false: 当前页面不是 tabBar 页面
 */
export const isCurrentTabBarPage = () => {
  try {
    const lastPage = getCurrentPage()
    const currPath = lastPage?.route

    // 通过遍历 tabBar 配置列表，判断当前页面路径是否匹配
    return Boolean(tabBar?.list?.some((item) => item.pagePath === currPath))
  } catch {
    // 发生异常时返回 false，确保函数稳定性
    return false
  }
}

/**
 * 判断指定页面路径是否是 tabBar 页面
 * @param path 页面路径，如 'pages/index/index'
 * @returns true: 是 tabBar 页面, false: 不是 tabBar 页面
 */
export const isTabBarPage = (path: string) => {
  // 检查是否存在 tabBar 配置
  if (!tabBar) {
    return false
  }

  // 检查 tabBar 列表是否为空
  if (!tabBar.list.length) {
    return false
  }

  // 处理路径格式：移除开头的 '/' 字符
  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // 在 tabBar 列表中查找匹配的页面路径
  return !!tabBar.list.find((e) => e.pagePath === path)
}

/**
 * 递归解码 URL 编码的字符串
 * 确保完全解码多层编码的 URL 参数
 * @param url 需要解码的字符串
 * @returns 完全解码后的字符串
 */
const fullyDecodeUrl = (url: string) => {
  // 如果字符串以 '%' 开头，说明还有编码需要解码
  if (url.startsWith('%')) {
    return fullyDecodeUrl(decodeURIComponent(url))
  }
  return url
}

/**
 * 解析 URL 字符串，提取路径和查询参数
 * @param url 完整的 URL 字符串
 * @returns 包含 path 和 query 的对象
 */
export const parseUrl = (url: string) => {
  // 按 '?' 分割 URL，获取路径和查询字符串
  const [path, queryStr] = url.split('?')

  // 如果没有查询字符串，直接返回路径和空查询对象
  if (!queryStr) {
    return {
      path,
      query: {},
    }
  }

  // 解析查询字符串为对象
  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    // 对查询参数值进行解码，兼容 H5 和小程序平台的编码差异
    query[key] = fullyDecodeUrl(value)
  })

  return { path, query }
}

/**
 * 获取当前页面的完整路由信息
 * 解析当前页面的路径和查询参数
 * @returns 包含 path 和 query 的对象
 */
export const getCurrentRoute = () => {
  const lastPage = getCurrentPage()
  const currRoute = (lastPage as any).$page

  // 经过多端测试，只有 fullPath 属性在各个平台上都比较可靠
  const { fullPath } = currRoute as { fullPath: string }

  return parseUrl(fullPath)
}
```

### 页面实例属性详解

```typescript
/**
 * 页面实例包含的属性（多端差异）
 */
interface PageInstance {
  // 通用属性
  route: string           // 页面路径（不带参数）
  options: object         // 页面参数（onLoad 接收的参数）

  // UniApp 扩展属性
  $page: {
    fullPath: string      // 完整路径（带参数）✅ 多端可靠
    path: string          // 页面路径
    options: object       // 页面参数
    meta: object          // 页面元信息
  }

  // 小程序特有
  __route__: string       // 微信小程序页面路径

  // H5 特有
  $route: {               // Vue Router 路由对象
    path: string
    query: object
    params: object
    fullPath: string
  }
}
```

### 多端差异处理

```typescript
/**
 * 不同平台获取页面信息的方式
 */

// 微信小程序
// - getCurrentPages() 返回的页面实例有 route 和 options 属性
// - 参数编码使用 encodeURIComponent

// H5 平台
// - getCurrentPages() 返回的页面实例有 $route 属性（Vue Router）
// - 参数可能多层编码

// App 平台
// - getCurrentPages() 返回的页面实例有 $page 属性
// - fullPath 包含完整路径和参数

// 统一解决方案：使用 $page.fullPath
const getCurrentRoute = () => {
  const lastPage = getCurrentPage()
  const currRoute = (lastPage as any).$page

  // fullPath 在所有平台都可靠
  // 小程序: /pages/auth/login?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor
  // H5: /pages/auth/login?redirect=%2Fpages%2Froute-interceptor%2Findex%3Fname%3Dfeige%26age%3D30
  const { fullPath } = currRoute as { fullPath: string }

  return parseUrl(fullPath)
}
```

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

### 页面栈深度管理

```typescript
import { getCurrentPage } from '@/utils/route'

/**
 * 获取页面栈深度
 */
const getStackDepth = () => {
  return getCurrentPages().length
}

/**
 * 检查页面栈是否接近上限
 */
const isStackNearLimit = () => {
  const MAX_STACK = 10
  const THRESHOLD = 8
  return getStackDepth() >= THRESHOLD
}

/**
 * 安全导航（避免栈溢出）
 */
const safeNavigateTo = (url: string) => {
  if (isStackNearLimit()) {
    // 栈接近上限，使用 redirectTo 替换当前页面
    uni.redirectTo({ url })
  } else {
    uni.navigateTo({ url })
  }
}

/**
 * 返回到指定页面
 */
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
    navigateTo(targetPath)
  }
}
```

### 深度链接处理

```typescript
import { parseUrl, isTabBarPage } from '@/utils/route'

/**
 * 处理深度链接
 * 支持格式: myapp://pages/detail?id=123
 */
const handleDeepLink = (link: string) => {
  // 解析协议
  const protocolMatch = link.match(/^([a-z]+):\/\/(.+)$/)
  if (!protocolMatch) return false

  const [, protocol, pathWithQuery] = protocolMatch

  // 验证协议
  if (protocol !== 'myapp') return false

  // 解析路径
  const { path, query } = parseUrl('/' + pathWithQuery)

  // 构建完整 URL
  const queryStr = Object.entries(query)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  const url = queryStr ? `${path}?${queryStr}` : path

  // 智能导航
  if (isTabBarPage(path)) {
    uni.switchTab({ url: path })  // switchTab 不支持参数
  } else {
    uni.navigateTo({ url })
  }

  return true
}

// 使用示例
handleDeepLink('myapp://pages/user/detail?id=123&source=share')
```

### 路由状态持久化

```typescript
import { getCurrentRoute, parseUrl } from '@/utils/route'

/**
 * 保存当前路由状态
 */
const saveRouteState = () => {
  const { path, query } = getCurrentRoute()
  const state = { path, query, timestamp: Date.now() }
  uni.setStorageSync('lastRoute', JSON.stringify(state))
}

/**
 * 恢复路由状态
 */
const restoreRouteState = () => {
  try {
    const stateStr = uni.getStorageSync('lastRoute')
    if (!stateStr) return null

    const state = JSON.parse(stateStr)
    const { path, query, timestamp } = state

    // 检查是否过期（24小时）
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      uni.removeStorageSync('lastRoute')
      return null
    }

    return { path, query }
  } catch {
    return null
  }
}

/**
 * App 启动时恢复路由
 */
const restoreOnLaunch = () => {
  const state = restoreRouteState()
  if (state) {
    const { path, query } = state
    const queryStr = Object.entries(query)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    const url = queryStr ? `${path}?${queryStr}` : path

    // 延迟跳转，确保首页加载完成
    setTimeout(() => {
      uni.navigateTo({ url })
    }, 100)
  }
}
```

### 多参数传递方案

```typescript
import { parseUrl } from '@/utils/route'

/**
 * 复杂对象传参方案
 */

// 方案1: JSON 序列化 + URL 编码
const navigateWithObject = (url: string, data: object) => {
  const encoded = encodeURIComponent(JSON.stringify(data))
  uni.navigateTo({ url: `${url}?data=${encoded}` })
}

// 接收参数
const receiveObjectParam = () => {
  const { query } = getCurrentRoute()
  if (query.data) {
    try {
      return JSON.parse(query.data)
    } catch {
      return null
    }
  }
  return null
}

// 方案2: 全局事件总线
const eventChannel = ref<any>(null)

const navigateWithChannel = (url: string, data: object) => {
  uni.navigateTo({
    url,
    success: (res) => {
      res.eventChannel.emit('acceptData', data)
    }
  })
}

// 接收页面
onLoad(() => {
  const eventChannel = getCurrentPages().slice(-1)[0].getOpenerEventChannel()
  eventChannel.on('acceptData', (data) => {
    console.log('接收到数据:', data)
  })
})

// 方案3: 全局状态管理
const useNavigationStore = defineStore('navigation', {
  state: () => ({
    pendingData: null as any
  }),
  actions: {
    setData(data: any) {
      this.pendingData = data
    },
    getData() {
      const data = this.pendingData
      this.pendingData = null
      return data
    }
  }
})

const navigateWithStore = (url: string, data: object) => {
  const store = useNavigationStore()
  store.setData(data)
  uni.navigateTo({ url })
}
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
 * 页面实例扩展
 */
interface PageInstanceExt {
  /** 页面路由路径 */
  route?: string
  /** 页面参数 */
  options?: Record<string, string>
  /** UniApp 扩展的 $page 对象 */
  $page?: {
    fullPath: string
    path: string
    options: Record<string, string>
    meta: Record<string, any>
  }
}

/**
 * 获取当前页面实例
 * @returns 当前页面实例
 */
function getCurrentPage(): PageInstanceExt | undefined

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

### 完整导航工具封装

```typescript
// utils/navigator.ts
import { isTabBarPage, parseUrl, getCurrentRoute } from '@/utils/route'

export interface NavigateOptions {
  /** 跳转方式 */
  type?: 'navigate' | 'redirect' | 'switch' | 'relaunch'
  /** 页面关闭前的回调 */
  beforeLeave?: () => boolean | Promise<boolean>
  /** 导航成功回调 */
  success?: (res: any) => void
  /** 导航失败回调 */
  fail?: (err: any) => void
  /** 传递的数据（通过 eventChannel） */
  data?: Record<string, any>
}

/**
 * 统一导航工具
 */
export const navigator = {
  /**
   * 跳转页面（自动判断 TabBar）
   */
  async to(url: string, options: NavigateOptions = {}) {
    const { type, beforeLeave, success, fail, data } = options

    // 执行离开前回调
    if (beforeLeave) {
      const canLeave = await beforeLeave()
      if (!canLeave) return
    }

    const { path } = parseUrl(url)
    const isTab = isTabBarPage(path)

    // 确定跳转方式
    let method: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch'
    if (type === 'relaunch') {
      method = 'reLaunch'
    } else if (type === 'switch' || isTab) {
      method = 'switchTab'
    } else if (type === 'redirect') {
      method = 'redirectTo'
    } else {
      method = 'navigateTo'
    }

    // 执行跳转
    const navigateOptions: any = {
      url: method === 'switchTab' ? path : url,  // switchTab 不支持参数
      success: (res: any) => {
        // 通过 eventChannel 传递数据
        if (data && res.eventChannel) {
          res.eventChannel.emit('data', data)
        }
        success?.(res)
      },
      fail
    }

    uni[method](navigateOptions)
  },

  /**
   * 替换页面
   */
  replace(url: string, options?: Omit<NavigateOptions, 'type'>) {
    return this.to(url, { ...options, type: 'redirect' })
  },

  /**
   * 返回上一页
   */
  back(delta = 1) {
    uni.navigateBack({ delta })
  },

  /**
   * 返回到指定页面
   */
  backTo(targetPath: string) {
    const pages = getCurrentPages()
    const targetIndex = pages.findIndex(
      page => '/' + page.route === targetPath
    )

    if (targetIndex !== -1) {
      const delta = pages.length - targetIndex - 1
      if (delta > 0) {
        uni.navigateBack({ delta })
      }
    } else {
      this.replace(targetPath)
    }
  },

  /**
   * 重启应用
   */
  relaunch(url: string) {
    return this.to(url, { type: 'relaunch' })
  },

  /**
   * 获取当前路由
   */
  getCurrent() {
    return getCurrentRoute()
  }
}
```

## 最佳实践

### 1. 封装导航工具

```typescript
// ✅ 推荐：封装统一的导航方法
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

// ❌ 不推荐：每处都写判断逻辑
if (isTabBarPage(path)) {
  uni.switchTab({ url })
} else {
  uni.navigateTo({ url })
}
```

### 2. 路由参数类型安全

```typescript
// ✅ 推荐：定义参数类型
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

// ❌ 不推荐：直接使用 any
const { query } = getCurrentRoute()
const id = query.id  // any
```

### 3. 页面栈管理

```typescript
// ✅ 推荐：检查页面栈深度
const getStackDepth = () => {
  return getCurrentPages().length
}

// 安全导航，避免栈溢出
const safeNavigate = (url: string) => {
  const maxStack = 10
  if (getStackDepth() >= maxStack - 1) {
    // 栈快满了，使用 redirectTo
    uni.redirectTo({ url })
  } else {
    uni.navigateTo({ url })
  }
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
    navigator.replace(targetPath)
  }
}

// ❌ 不推荐：不管栈深度直接导航
uni.navigateTo({ url })  // 可能导致栈溢出
```

### 4. 错误处理

```typescript
// ✅ 推荐：添加错误处理
const safeGetCurrentRoute = () => {
  try {
    return getCurrentRoute()
  } catch (error) {
    console.warn('获取路由信息失败:', error)
    return { path: '', query: {} }
  }
}

const safeIsTabBarPage = (path: string) => {
  try {
    return isTabBarPage(path)
  } catch (error) {
    console.warn('判断 TabBar 失败:', error)
    return false
  }
}

// ❌ 不推荐：不处理异常
const route = getCurrentRoute()  // 可能抛出异常
```

### 5. 防重复跳转

```typescript
// ✅ 推荐：防止重复跳转
let navigating = false

const throttleNavigate = (url: string) => {
  if (navigating) return

  navigating = true
  navigator.to(url)

  setTimeout(() => {
    navigating = false
  }, 500)
}

// 或使用节流
import { throttle } from 'lodash-es'

const throttledNavigate = throttle((url: string) => {
  navigator.to(url)
}, 500)

// ❌ 不推荐：不做防护
const handleClick = () => {
  navigator.to('/pages/detail')  // 快速点击会多次跳转
}
```

### 6. URL 构建规范

```typescript
// ✅ 推荐：使用工具函数构建 URL
const buildUrl = (path: string, query: Record<string, any> = {}) => {
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')

  return params ? `${path}?${params}` : path
}

// 使用
const url = buildUrl('/pages/user/detail', { id: 123, type: 'vip' })
// 结果: /pages/user/detail?id=123&type=vip

// ❌ 不推荐：手动拼接
const url = `/pages/user/detail?id=${id}&type=${type}`  // 可能有编码问题
```

### 7. 路由守卫模式

```typescript
// ✅ 推荐：统一的路由守卫
interface RouteGuard {
  (to: RouteInfo, from: RouteInfo): boolean | string | Promise<boolean | string>
}

const guards: RouteGuard[] = []

const addGuard = (guard: RouteGuard) => {
  guards.push(guard)
  return () => {
    const index = guards.indexOf(guard)
    if (index > -1) guards.splice(index, 1)
  }
}

const runGuards = async (to: RouteInfo, from: RouteInfo) => {
  for (const guard of guards) {
    const result = await guard(to, from)
    if (result === false) return false
    if (typeof result === 'string') {
      navigator.replace(result)
      return false
    }
  }
  return true
}

// 使用
addGuard((to, from) => {
  // 登录检查
  if (to.path.startsWith('/pages/user/') && !isLoggedIn()) {
    return `/pages/login?redirect=${encodeURIComponent(to.path)}`
  }
  return true
})
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

```typescript
// 统一使用 $page.fullPath，各端都可靠
const getCurrentRoute = () => {
  const lastPage = getCurrentPage()
  const currRoute = (lastPage as any).$page
  const { fullPath } = currRoute
  return parseUrl(fullPath)
}
```

### 5. TabBar 页面无法传参？

UniApp 的 `switchTab` 不支持参数，使用以下方案：

```typescript
// 方案1: 全局状态
const userStore = useUserStore()
userStore.setTabData({ id: 123 })
uni.switchTab({ url: '/pages/index/index' })

// 在 TabBar 页面获取
onShow(() => {
  const data = userStore.getTabData()
  if (data) {
    // 处理数据
    userStore.clearTabData()
  }
})

// 方案2: 本地存储
uni.setStorageSync('tabData', JSON.stringify({ id: 123 }))
uni.switchTab({ url: '/pages/index/index' })

// 在 TabBar 页面获取
onShow(() => {
  const dataStr = uni.getStorageSync('tabData')
  if (dataStr) {
    const data = JSON.parse(dataStr)
    uni.removeStorageSync('tabData')
  }
})
```

### 6. 页面栈溢出？

UniApp 页面栈最多 10 层，超出会报错：

```typescript
// 解决方案：检查栈深度
const safeNavigate = (url: string) => {
  const pages = getCurrentPages()
  if (pages.length >= 9) {
    // 使用 redirectTo 替换当前页
    uni.redirectTo({ url })
  } else {
    uni.navigateTo({ url })
  }
}

// 或者定期清理页面栈
const cleanStack = (targetPath: string) => {
  uni.reLaunch({ url: targetPath })
}
```

### 7. 返回上一页数据丢失？

使用页面通信：

```typescript
// 页面 A -> 页面 B，B 返回时传数据给 A

// 页面 A
uni.navigateTo({
  url: '/pages/b',
  events: {
    acceptResult: (data) => {
      console.log('收到返回数据:', data)
    }
  }
})

// 页面 B
const eventChannel = getCurrentPages().slice(-1)[0].getOpenerEventChannel()
eventChannel.emit('acceptResult', { selected: 'option1' })
uni.navigateBack()
```

### 8. 多层嵌套返回问题？

```typescript
// 返回到指定页面
const backToPage = (targetPath: string) => {
  const pages = getCurrentPages()
  let delta = 0

  for (let i = pages.length - 1; i >= 0; i--) {
    if ('/' + pages[i].route === targetPath) {
      delta = pages.length - 1 - i
      break
    }
  }

  if (delta > 0) {
    uni.navigateBack({ delta })
  } else {
    // 目标页面不在栈中
    uni.reLaunch({ url: targetPath })
  }
}

// 使用
backToPage('/pages/order/list')  // 返回到订单列表
```

### 9. 动态 TabBar 场景？

部分场景需要动态显示/隐藏 TabBar 项：

```typescript
// 注意：pages.json 中的 tabBar 配置是静态的
// 动态修改需要使用 uni.hideTabBar/uni.showTabBar

// 隐藏整个 TabBar
uni.hideTabBar()

// 显示 TabBar
uni.showTabBar()

// 隐藏某个 TabBar 红点
uni.hideTabBarRedDot({ index: 1 })

// 如需完全动态的 TabBar，考虑使用自定义 TabBar 组件
```

### 10. 路由参数特殊字符问题？

```typescript
// 问题：参数包含特殊字符
const keyword = 'hello&world=test'

// 错误做法
const url = `/pages/search?keyword=${keyword}`
// 结果: /pages/search?keyword=hello&world=test （解析错误）

// 正确做法
const url = `/pages/search?keyword=${encodeURIComponent(keyword)}`
// 结果: /pages/search?keyword=hello%26world%3Dtest

// parseUrl 会自动解码
const { query } = parseUrl(url)
console.log(query.keyword)  // 'hello&world=test'
```

### 11. App 端深度链接处理？

```typescript
// manifest.json 配置
{
  "app-plus": {
    "distribute": {
      "android": {
        "schemes": "myapp"  // 自定义协议
      }
    }
  }
}

// App.vue 中处理
onLaunch((options) => {
  // 处理 scheme 启动
  if (options?.path) {
    handleDeepLink(options.path)
  }
})

// 处理函数
const handleDeepLink = (link: string) => {
  const { path, query } = parseUrl(link)
  // 根据 path 和 query 跳转到对应页面
  if (path.includes('product')) {
    navigator.to(`/pages/product/detail?id=${query.id}`)
  }
}
```

### 12. 获取上一页实例？

```typescript
// 获取上一页实例
const getPrevPage = () => {
  const pages = getCurrentPages()
  if (pages.length < 2) return null
  return pages[pages.length - 2]
}

// 调用上一页的方法
const callPrevPageMethod = (methodName: string, ...args: any[]) => {
  const prevPage = getPrevPage()
  if (prevPage && typeof prevPage[methodName] === 'function') {
    prevPage[methodName](...args)
  }
}

// 使用示例
// 在详情页修改数据后，通知列表页刷新
callPrevPageMethod('refreshList')
```

## 进阶用法

### 路由拦截器

```typescript
// utils/routeInterceptor.ts
import { getCurrentRoute, isTabBarPage, parseUrl } from '@/utils/route'

type InterceptorHandler = (
  url: string,
  options: UniApp.NavigateToOptions
) => boolean | string | Promise<boolean | string>

const interceptors: InterceptorHandler[] = []

/**
 * 添加路由拦截器
 */
export const addRouteInterceptor = (handler: InterceptorHandler) => {
  interceptors.push(handler)
  return () => {
    const index = interceptors.indexOf(handler)
    if (index > -1) interceptors.splice(index, 1)
  }
}

/**
 * 执行拦截器
 */
const runInterceptors = async (url: string, options: any) => {
  for (const interceptor of interceptors) {
    const result = await interceptor(url, options)
    if (result === false) return false
    if (typeof result === 'string') return result
  }
  return true
}

/**
 * 拦截 navigateTo
 */
const originalNavigateTo = uni.navigateTo
uni.navigateTo = async (options) => {
  const result = await runInterceptors(options.url, options)
  if (result === false) return
  if (typeof result === 'string') {
    options.url = result
  }
  return originalNavigateTo.call(uni, options)
}

// 使用示例
addRouteInterceptor(async (url) => {
  // 登录检查
  const { path } = parseUrl(url)
  const needAuth = ['/pages/user/', '/pages/order/']

  if (needAuth.some(p => path.startsWith(p))) {
    const isLoggedIn = !!uni.getStorageSync('token')
    if (!isLoggedIn) {
      return `/pages/login?redirect=${encodeURIComponent(url)}`
    }
  }
  return true
})
```

### 路由动画控制

```typescript
// H5 端路由动画
const navigateWithAnimation = (url: string, animation: 'slide' | 'fade' | 'none' = 'slide') => {
  // #ifdef H5
  uni.navigateTo({
    url,
    animationType: animation === 'slide' ? 'slide-in-right' :
                   animation === 'fade' ? 'fade-in' : 'none',
    animationDuration: 300
  })
  // #endif

  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

// App 端自定义动画
const navigateWithCustomAnimation = (url: string) => {
  // #ifdef APP-PLUS
  uni.navigateTo({
    url,
    animationType: 'zoom-fade-out',
    animationDuration: 400
  })
  // #endif
}
```

### 路由历史管理

```typescript
// utils/routeHistory.ts
interface RouteRecord {
  path: string
  query: Record<string, string>
  timestamp: number
}

const MAX_HISTORY = 50
const history: RouteRecord[] = []

/**
 * 记录路由历史
 */
export const recordRoute = () => {
  const { path, query } = getCurrentRoute()

  // 去重
  const lastRecord = history[history.length - 1]
  if (lastRecord && lastRecord.path === path) return

  history.push({
    path,
    query,
    timestamp: Date.now()
  })

  // 限制历史记录数量
  if (history.length > MAX_HISTORY) {
    history.shift()
  }
}

/**
 * 获取路由历史
 */
export const getRouteHistory = () => [...history]

/**
 * 查找历史中的页面
 */
export const findInHistory = (path: string) => {
  return history.filter(r => r.path === path)
}

/**
 * 获取最近访问的页面
 */
export const getRecentPages = (limit = 10) => {
  return history.slice(-limit).reverse()
}
```

