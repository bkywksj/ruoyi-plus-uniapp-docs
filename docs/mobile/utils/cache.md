# cache 缓存工具

## 介绍

`cache` 是 UniApp 本地存储的封装工具，提供统一的缓存管理接口。该工具基于 UniApp 的 Storage API 实现，支持数据过期时间设置、自动清理过期数据、存储统计等高级功能。

**核心特性:**

- **前缀隔离** - 自动为存储键名添加应用前缀，避免多应用数据冲突
- **过期机制** - 支持设置数据过期时间，自动判断数据有效性
- **自动清理** - 提供过期数据清理功能，释放存储空间
- **存储统计** - 获取缓存使用情况，便于监控和管理
- **类型安全** - 完整的 TypeScript 类型支持

## 基本用法

### 存储数据

使用 `set` 方法存储数据到本地缓存：

```typescript
import { cache } from '@/utils/cache'

// 存储简单数据
cache.set('username', 'admin')

// 存储对象数据
cache.set('userInfo', {
  id: 1,
  name: '张三',
  role: 'admin'
})

// 存储数组数据
cache.set('menuList', [
  { id: 1, name: '首页' },
  { id: 2, name: '用户管理' }
])
```

### 设置过期时间

通过第三个参数设置数据过期时间（秒）：

```typescript
import { cache } from '@/utils/cache'

// 设置 1 小时后过期（3600秒）
cache.set('token', 'abc123', 3600)

// 设置 1 天后过期（86400秒）
cache.set('sessionData', { login: true }, 86400)

// 设置 7 天后过期
cache.set('rememberMe', true, 7 * 24 * 3600)

// 永不过期（不传第三个参数）
cache.set('config', { theme: 'dark' })
```

### 读取数据

使用 `get` 方法读取缓存数据：

```typescript
import { cache } from '@/utils/cache'

// 读取数据
const username = cache.get<string>('username')
console.log(username) // 'admin'

// 读取对象数据（使用泛型指定类型）
interface UserInfo {
  id: number
  name: string
  role: string
}
const userInfo = cache.get<UserInfo>('userInfo')
console.log(userInfo?.name) // '张三'

// 读取不存在的键返回 null
const notExist = cache.get('notExist')
console.log(notExist) // null

// 读取已过期的数据返回 null
const expiredData = cache.get('expiredKey')
console.log(expiredData) // null（如果已过期）
```

### 删除数据

使用 `remove` 方法删除指定缓存：

```typescript
import { cache } from '@/utils/cache'

// 删除单个缓存
cache.remove('token')

// 删除用户相关缓存
cache.remove('userInfo')
cache.remove('permissions')
```

### 检查数据是否存在

使用 `has` 方法检查缓存是否存在且有效：

```typescript
import { cache } from '@/utils/cache'

// 检查缓存是否存在
if (cache.has('token')) {
  console.log('Token 存在且有效')
} else {
  console.log('Token 不存在或已过期')
}

// 条件判断使用
const isLoggedIn = cache.has('userInfo')
```

## 高级功能

### 清空所有缓存

使用 `clearAll` 方法清空应用的所有缓存数据：

```typescript
import { cache } from '@/utils/cache'

// 用户退出登录时清空缓存
const logout = () => {
  cache.clearAll()
  uni.reLaunch({ url: '/pages/login/index' })
}
```

**注意：** `clearAll` 只会清除带有应用前缀的缓存数据，不会影响其他应用或系统的存储数据。

### 清理过期数据

使用 `cleanup` 方法清理所有已过期的缓存数据：

```typescript
import { cache } from '@/utils/cache'

// 手动清理过期数据
const cleanedCount = cache.cleanup()
console.log(`已清理 ${cleanedCount} 条过期数据`)

// 应用启动时自动清理
onLaunch(() => {
  const count = cache.cleanup()
  if (count > 0) {
    console.log(`启动时清理了 ${count} 条过期缓存`)
  }
})
```

### 获取存储统计

使用 `getStats` 方法获取缓存使用统计信息：

```typescript
import { cache } from '@/utils/cache'

// 获取存储统计
const stats = cache.getStats()
console.log('总条目数:', stats.totalItems)
console.log('已过期条目:', stats.expiredItems)
console.log('有效条目:', stats.validItems)

// 显示存储状态
const showStorageInfo = () => {
  const { totalItems, expiredItems, validItems } = cache.getStats()
  uni.showModal({
    title: '存储统计',
    content: `总计: ${totalItems}\n有效: ${validItems}\n过期: ${expiredItems}`,
    showCancel: false
  })
}
```

## 实际应用场景

### 登录状态管理

```typescript
import { cache } from '@/utils/cache'

// Token 过期时间常量（2小时）
const TOKEN_EXPIRE = 2 * 60 * 60

// 登录成功后保存 Token
const onLoginSuccess = (token: string, userInfo: UserInfo) => {
  cache.set('token', token, TOKEN_EXPIRE)
  cache.set('userInfo', userInfo, TOKEN_EXPIRE)
}

// 检查登录状态
const isLoggedIn = (): boolean => {
  return cache.has('token') && cache.has('userInfo')
}

// 获取 Token
const getToken = (): string | null => {
  return cache.get<string>('token')
}

// 退出登录
const logout = () => {
  cache.remove('token')
  cache.remove('userInfo')
}
```

### 表单数据暂存

```typescript
import { cache } from '@/utils/cache'

// 表单数据暂存（30分钟过期）
const FORM_CACHE_EXPIRE = 30 * 60

// 保存表单草稿
const saveFormDraft = (formData: Record<string, any>) => {
  cache.set('formDraft', formData, FORM_CACHE_EXPIRE)
  uni.showToast({ title: '草稿已保存', icon: 'success' })
}

// 恢复表单草稿
const restoreFormDraft = () => {
  const draft = cache.get<Record<string, any>>('formDraft')
  if (draft) {
    return draft
  }
  return null
}

// 清除表单草稿
const clearFormDraft = () => {
  cache.remove('formDraft')
}
```

### 数据缓存策略

```typescript
import { cache } from '@/utils/cache'

// API 数据缓存（5分钟）
const API_CACHE_EXPIRE = 5 * 60

// 带缓存的数据获取
const fetchWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  expire = API_CACHE_EXPIRE
): Promise<T> => {
  // 先尝试从缓存获取
  const cached = cache.get<T>(key)
  if (cached !== null) {
    console.log('从缓存获取:', key)
    return cached
  }

  // 缓存不存在，调用接口
  console.log('从接口获取:', key)
  const data = await fetcher()

  // 存入缓存
  cache.set(key, data, expire)

  return data
}

// 使用示例
const getUserList = () => {
  return fetchWithCache('userList', async () => {
    const res = await request.get('/api/users')
    return res.data
  })
}
```

### 搜索历史记录

```typescript
import { cache } from '@/utils/cache'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

// 添加搜索历史
const addSearchHistory = (keyword: string) => {
  let history = cache.get<string[]>(HISTORY_KEY) || []

  // 移除重复项
  history = history.filter(item => item !== keyword)

  // 添加到开头
  history.unshift(keyword)

  // 限制数量
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY)
  }

  // 保存（永不过期）
  cache.set(HISTORY_KEY, history)
}

// 获取搜索历史
const getSearchHistory = (): string[] => {
  return cache.get<string[]>(HISTORY_KEY) || []
}

// 清空搜索历史
const clearSearchHistory = () => {
  cache.remove(HISTORY_KEY)
}
```

## API

### 方法列表

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| set | 存储数据 | `(key: string, value: any, expire?: number)` | `void` |
| get | 获取数据 | `<T>(key: string)` | `T \| null` |
| remove | 删除数据 | `(key: string)` | `void` |
| has | 检查是否存在 | `(key: string)` | `boolean` |
| clearAll | 清空所有缓存 | - | `void` |
| cleanup | 清理过期数据 | - | `number` |
| getStats | 获取统计信息 | - | `CacheStats` |

### 类型定义

```typescript
/**
 * 缓存包装器接口
 */
interface CacheWrapper<T = any> {
  /** 实际存储的数据 */
  data: T
  /** 过期时间戳（毫秒），undefined 表示永不过期 */
  _expire?: number
}

/**
 * 缓存统计信息
 */
interface CacheStats {
  /** 总条目数 */
  totalItems: number
  /** 已过期条目数 */
  expiredItems: number
  /** 有效条目数 */
  validItems: number
}

/**
 * 缓存工具对象
 */
interface CacheUtil {
  /**
   * 存储数据到缓存
   * @param key 缓存键名
   * @param value 要存储的数据
   * @param expire 过期时间（秒），不传则永不过期
   */
  set: <T>(key: string, value: T, expire?: number) => void

  /**
   * 从缓存获取数据
   * @param key 缓存键名
   * @returns 缓存数据，不存在或已过期返回 null
   */
  get: <T>(key: string) => T | null

  /**
   * 删除指定缓存
   * @param key 缓存键名
   */
  remove: (key: string) => void

  /**
   * 检查缓存是否存在且有效
   * @param key 缓存键名
   * @returns 存在且有效返回 true
   */
  has: (key: string) => boolean

  /**
   * 清空所有应用缓存
   */
  clearAll: () => void

  /**
   * 清理所有过期缓存
   * @returns 清理的条目数量
   */
  cleanup: () => number

  /**
   * 获取缓存统计信息
   * @returns 统计信息对象
   */
  getStats: () => CacheStats
}
```

### 存储键前缀

缓存工具会自动为所有键名添加应用前缀，默认前缀为 `ruoyi_app_`。

```typescript
// 设置时
cache.set('token', 'abc123')
// 实际存储键名: ruoyi_app_token

// 获取时
cache.get('token')
// 实际读取键名: ruoyi_app_token
```

## 最佳实践

### 1. 定义缓存键常量

```typescript
// constants/cacheKeys.ts
export const CacheKeys = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  PERMISSIONS: 'permissions',
  SEARCH_HISTORY: 'searchHistory',
  FORM_DRAFT: 'formDraft',
  SETTINGS: 'settings',
} as const
```

### 2. 封装业务缓存服务

```typescript
// services/cacheService.ts
import { cache } from '@/utils/cache'
import { CacheKeys } from '@/constants/cacheKeys'

// Token 缓存服务
export const tokenCache = {
  set: (token: string, expire = 7200) => {
    cache.set(CacheKeys.TOKEN, token, expire)
  },
  get: () => cache.get<string>(CacheKeys.TOKEN),
  remove: () => cache.remove(CacheKeys.TOKEN),
  has: () => cache.has(CacheKeys.TOKEN),
}

// 用户信息缓存服务
export const userCache = {
  set: (user: UserInfo, expire = 7200) => {
    cache.set(CacheKeys.USER_INFO, user, expire)
  },
  get: () => cache.get<UserInfo>(CacheKeys.USER_INFO),
  remove: () => cache.remove(CacheKeys.USER_INFO),
}
```

### 3. 应用启动时清理过期数据

```typescript
// App.vue
import { cache } from '@/utils/cache'

onLaunch(() => {
  // 清理过期缓存
  const cleanedCount = cache.cleanup()
  if (cleanedCount > 0) {
    console.log(`已清理 ${cleanedCount} 条过期缓存`)
  }
})
```

### 4. 合理设置过期时间

```typescript
// 过期时间常量
const ExpireTimes = {
  SHORT: 5 * 60,        // 5分钟 - 临时数据
  MEDIUM: 30 * 60,      // 30分钟 - 会话数据
  LONG: 2 * 60 * 60,    // 2小时 - Token
  DAY: 24 * 60 * 60,    // 1天 - 用户偏好
  WEEK: 7 * 24 * 60 * 60, // 7天 - 记住登录
  PERMANENT: undefined,  // 永久 - 系统配置
}
```

## 常见问题

### 1. 缓存数据读取为 null？

**可能原因：**
- 数据已过期被自动清理
- 键名拼写错误
- 数据从未被存储

**解决方案：**
```typescript
// 检查缓存是否存在
if (cache.has('myKey')) {
  const data = cache.get('myKey')
} else {
  console.log('缓存不存在或已过期')
}
```

### 2. 如何判断缓存是否过期？

**解决方案：**
`has` 方法会自动判断数据是否过期，过期数据会返回 `false`。

```typescript
// has 方法会自动检查过期
const isValid = cache.has('token')
// isValid 为 false 表示不存在或已过期
```

### 3. 存储空间不足？

**解决方案：**
```typescript
// 定期清理过期数据
cache.cleanup()

// 查看存储统计
const stats = cache.getStats()
if (stats.expiredItems > 10) {
  cache.cleanup()
}
```

### 4. 多端数据同步问题？

由于 UniApp Storage 是本地存储，不同设备间数据无法自动同步。建议：
- 重要数据存储到服务端
- 仅缓存临时数据和用户偏好
- 登录时从服务端同步最新数据

### 5. 存储复杂对象失败？

UniApp Storage 基于 JSON 序列化，不支持存储：
- 函数
- Symbol
- undefined（会被忽略）
- 循环引用对象

```typescript
// 错误示例
cache.set('func', () => {}) // 函数无法存储

// 正确示例
cache.set('config', {
  name: 'app',
  version: '1.0.0'
})
```
