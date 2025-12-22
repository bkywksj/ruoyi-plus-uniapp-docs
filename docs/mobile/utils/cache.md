# cache 缓存工具

## 介绍

`cache` 是 UniApp 本地存储的高级封装工具，提供统一、类型安全的缓存管理接口。该工具基于 UniApp 的同步 Storage API 实现，充分利用 UniApp 原生的多类型存储和自动序列化特性，支持数据过期时间设置、自动清理过期数据、存储统计分析等高级功能。

**核心特性:**

- **前缀隔离** - 自动为存储键名添加应用 ID 前缀（基于 `SystemConfig.app.id`），避免多应用数据冲突
- **过期机制** - 支持以秒为单位设置数据过期时间，读取时自动判断数据有效性
- **自动清理** - 应用启动时自动清理过期数据，并每 10 分钟执行一次定时清理
- **存储统计** - 获取详细的缓存使用情况，包括占用空间、使用百分比等
- **类型安全** - 完整的 TypeScript 泛型支持，存取时保持原始类型不变
- **同步操作** - 采用同步 API，性能更好，无需 async/await
- **原生类型** - 原生支持字符串、数字、布尔值、对象、数组等多种数据类型

## 架构设计

### 存储结构

缓存工具采用包装器模式存储数据，每个缓存项的实际存储结构如下：

```typescript
interface CacheWrapper<T = any> {
  /** 实际存储的数据 */
  data: T
  /** 过期时间戳（毫秒），undefined 表示永不过期 */
  _expire?: number
}
```

**存储示例：**

```typescript
// 存储调用
cache.set('userInfo', { id: 1, name: '张三' }, 3600)

// 实际存储结构（简化表示）
// 键: "ryplus_uni:userInfo"
// 值: {
//   data: { id: 1, name: '张三' },
//   _expire: 1703001600000  // 当前时间戳 + 3600 * 1000
// }
```

### 键名前缀机制

为避免多应用在同一设备上的数据冲突，缓存工具自动为所有键名添加应用 ID 前缀：

```typescript
// 前缀格式
const KEY_PREFIX = `${SystemConfig.app.id}:`

// 假设 SystemConfig.app.id = 'ryplus_uni'
// 则 KEY_PREFIX = 'ryplus_uni:'

// 存储键转换
cache.set('token', 'abc123')
// 实际存储键: 'ryplus_uni:token'

cache.get('token')
// 实际读取键: 'ryplus_uni:token'
```

**前缀隔离的优势：**

1. **多应用隔离** - 同一设备上安装的多个应用不会互相干扰
2. **清理安全** - `clearAll` 方法只清除当前应用的缓存，不影响其他数据
3. **调试便捷** - 在开发工具中可以快速识别当前应用的缓存数据

### 自动清理机制

缓存工具内置了智能的自动清理机制：

```typescript
// 应用启动时延迟1秒执行首次清理
if (typeof uni !== 'undefined') {
  setTimeout(() => {
    autoCleanup()
    const stats = cache.getStats()
    // 初始化日志
  }, 1000)

  // 每10分钟执行一次定期清理
  setInterval(() => {
    autoCleanup()
  }, 10 * 60 * 1000)
}
```

**清理流程：**

1. 获取所有存储键
2. 筛选带有应用前缀的键
3. 检查每个键的过期时间
4. 删除所有已过期的缓存项
5. 输出清理日志

## 基本用法

### 存储数据

使用 `set` 方法存储数据到本地缓存，支持任意可序列化的数据类型：

```typescript
import { cache } from '@/utils/cache'

// 存储字符串
cache.set('username', 'admin')

// 存储数字
cache.set('visitCount', 100)

// 存储布尔值
cache.set('isFirstVisit', true)

// 存储对象数据
cache.set('userInfo', {
  id: 1,
  name: '张三',
  role: 'admin',
  avatar: '/static/avatar.png'
})

// 存储数组数据
cache.set('menuList', [
  { id: 1, name: '首页', icon: 'home' },
  { id: 2, name: '用户管理', icon: 'user' },
  { id: 3, name: '系统设置', icon: 'setting' }
])

// 存储嵌套复杂对象
cache.set('appState', {
  user: { id: 1, name: '张三' },
  settings: { theme: 'dark', language: 'zh-CN' },
  permissions: ['read', 'write', 'delete']
})
```

**返回值说明：**

`set` 方法返回一个布尔值，表示存储是否成功：

```typescript
// 存储成功返回 true
const success = cache.set('key', 'value')
console.log(success) // true

// 存储失败返回 false（如传入 null 或 undefined）
const failed = cache.set('key', null)
console.log(failed) // false

// 参数校验
const result1 = cache.set(null as any, 'value') // false
const result2 = cache.set('key', undefined) // false
```

### 设置过期时间

通过第三个参数设置数据过期时间（单位：秒）：

```typescript
import { cache } from '@/utils/cache'

// 设置 5 分钟后过期（300秒）
cache.set('verifyCode', '123456', 300)

// 设置 30 分钟后过期（1800秒）
cache.set('formDraft', { title: '草稿' }, 1800)

// 设置 1 小时后过期（3600秒）
cache.set('token', 'abc123', 3600)

// 设置 2 小时后过期
cache.set('sessionData', { login: true }, 2 * 60 * 60)

// 设置 1 天后过期（86400秒）
cache.set('dailyQuota', { used: 0, limit: 100 }, 86400)

// 设置 7 天后过期
cache.set('rememberMe', true, 7 * 24 * 3600)

// 设置 30 天后过期
cache.set('userPreferences', { theme: 'dark' }, 30 * 24 * 3600)

// 永不过期（不传第三个参数或传 undefined）
cache.set('config', { theme: 'dark' })
cache.set('systemInfo', { version: '1.0.0' }, undefined)
```

**过期时间计算原理：**

```typescript
// 内部实现逻辑
const wrapper: CacheWrapper<T> = {
  data: value,
  // 过期时间 = 当前时间戳 + 过期秒数 * 1000
  _expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined
}
```

**常用过期时间常量：**

```typescript
// 建议在项目中定义过期时间常量
export const CacheExpire = {
  /** 1 分钟 */
  MINUTE: 60,
  /** 5 分钟 */
  FIVE_MINUTES: 5 * 60,
  /** 15 分钟 */
  FIFTEEN_MINUTES: 15 * 60,
  /** 30 分钟 */
  HALF_HOUR: 30 * 60,
  /** 1 小时 */
  HOUR: 60 * 60,
  /** 2 小时 */
  TWO_HOURS: 2 * 60 * 60,
  /** 6 小时 */
  SIX_HOURS: 6 * 60 * 60,
  /** 12 小时 */
  HALF_DAY: 12 * 60 * 60,
  /** 1 天 */
  DAY: 24 * 60 * 60,
  /** 7 天 */
  WEEK: 7 * 24 * 60 * 60,
  /** 30 天 */
  MONTH: 30 * 24 * 60 * 60,
  /** 永不过期 */
  PERMANENT: undefined
} as const

// 使用示例
cache.set('token', tokenValue, CacheExpire.TWO_HOURS)
cache.set('rememberMe', true, CacheExpire.WEEK)
cache.set('systemConfig', config, CacheExpire.PERMANENT)
```

### 读取数据

使用 `get` 方法读取缓存数据，支持泛型指定返回类型：

```typescript
import { cache } from '@/utils/cache'

// 读取字符串
const username = cache.get<string>('username')
console.log(username) // 'admin'

// 读取数字
const count = cache.get<number>('visitCount')
console.log(count) // 100

// 读取布尔值
const isFirst = cache.get<boolean>('isFirstVisit')
console.log(isFirst) // true

// 读取对象数据（使用泛型指定类型）
interface UserInfo {
  id: number
  name: string
  role: string
  avatar: string
}
const userInfo = cache.get<UserInfo>('userInfo')
console.log(userInfo?.name) // '张三'

// 读取数组数据
interface MenuItem {
  id: number
  name: string
  icon: string
}
const menuList = cache.get<MenuItem[]>('menuList')
console.log(menuList?.length) // 3

// 读取不存在的键返回 null
const notExist = cache.get('notExistKey')
console.log(notExist) // null

// 读取已过期的数据返回 null（并自动删除）
const expiredData = cache.get('expiredKey')
console.log(expiredData) // null
```

**类型安全使用：**

```typescript
// 定义数据类型
interface AppSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  fontSize: number
}

// 类型安全的读取
const settings = cache.get<AppSettings>('settings')

// TypeScript 会自动推断 settings 的类型为 AppSettings | null
if (settings) {
  console.log(settings.theme) // 类型正确
  console.log(settings.fontSize) // 类型正确
}

// 配合可选链和空值合并运算符
const theme = cache.get<AppSettings>('settings')?.theme ?? 'light'
const fontSize = cache.get<AppSettings>('settings')?.fontSize ?? 14
```

**读取失败处理：**

```typescript
// get 方法在以下情况返回 null：
// 1. 键名为 null 或 undefined
// 2. 键不存在
// 3. 数据已过期
// 4. 数据格式损坏（读取异常）

// 安全的读取模式
const getData = <T>(key: string, defaultValue: T): T => {
  const value = cache.get<T>(key)
  return value !== null ? value : defaultValue
}

// 使用默认值
const theme = getData('theme', 'light')
const count = getData('count', 0)
const list = getData('list', [])
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
cache.remove('roles')

// 批量删除（手动循环）
const keysToRemove = ['key1', 'key2', 'key3']
keysToRemove.forEach(key => cache.remove(key))

// 条件删除
if (cache.has('tempData')) {
  cache.remove('tempData')
}
```

**删除操作的容错性：**

```typescript
// 删除不存在的键不会报错
cache.remove('nonExistentKey') // 安全操作，无任何影响

// 删除 null/undefined 键不会报错
cache.remove(null as any) // 内部会进行参数校验
```

### 检查数据是否存在

使用 `has` 方法检查缓存是否存在且有效（未过期）：

```typescript
import { cache } from '@/utils/cache'

// 检查缓存是否存在
if (cache.has('token')) {
  console.log('Token 存在且有效')
} else {
  console.log('Token 不存在或已过期')
}

// 登录状态判断
const isLoggedIn = cache.has('userInfo')

// 条件判断使用
const needRefresh = !cache.has('cachedData')
if (needRefresh) {
  // 从服务器获取数据
  fetchData()
}

// 组合条件判断
const hasCompleteUserData =
  cache.has('token') &&
  cache.has('userInfo') &&
  cache.has('permissions')
```

**has 方法的实现原理：**

```typescript
// has 方法内部调用 get 方法
has(key: string): boolean {
  return this.get(key) !== null
}

// 这意味着：
// 1. 过期的数据会返回 false
// 2. 检查时如果数据已过期，会自动删除
// 3. 不存在的键返回 false
```

## 高级功能

### 清空所有缓存

使用 `clearAll` 方法清空当前应用的所有缓存数据：

```typescript
import { cache } from '@/utils/cache'

// 用户退出登录时清空缓存
const logout = () => {
  // 清空所有应用缓存
  cache.clearAll()

  // 跳转到登录页
  uni.reLaunch({ url: '/pages/login/index' })
}

// 重置应用状态
const resetApp = () => {
  cache.clearAll()
  uni.showToast({ title: '应用已重置', icon: 'success' })
}

// 开发环境调试
if (process.env.NODE_ENV === 'development') {
  // 快速清理缓存
  uni.$on('clearCache', () => {
    cache.clearAll()
    console.log('缓存已清空')
  })
}
```

**注意事项：**

1. `clearAll` 只会清除带有应用前缀的缓存数据
2. 不会影响其他应用或系统的存储数据
3. 不会影响没有应用前缀的原生 Storage 数据
4. 清除后会输出日志显示清理数量

**安全清理模式：**

```typescript
// 清理前确认
const safeClearAll = async () => {
  const stats = cache.getStats()
  if (!stats) return

  const confirm = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认清除',
      content: `确定要清除 ${stats.appKeys} 条缓存数据吗？`,
      success: (res) => resolve(res.confirm)
    })
  })

  if (confirm) {
    cache.clearAll()
    uni.showToast({ title: '清除成功', icon: 'success' })
  }
}
```

### 清理过期数据

使用 `cleanup` 方法手动清理所有已过期的缓存数据：

```typescript
import { cache } from '@/utils/cache'

// 手动触发清理
cache.cleanup()

// 应用启动时清理
onLaunch(() => {
  cache.cleanup()
  console.log('已清理过期缓存')
})

// 页面切换时清理（可选）
onShow(() => {
  // 检查是否需要清理
  const stats = cache.getStats()
  if (stats && stats.usagePercent > 80) {
    cache.cleanup()
  }
})

// 定时清理（除了内置的自动清理外）
const startCustomCleanup = () => {
  // 每5分钟清理一次
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}
```

**清理日志：**

```typescript
// cleanup 执行后会输出日志
// 例如: "清理了 5 个过期缓存项"

// 如果没有过期数据，不会输出日志
```

### 获取存储统计

使用 `getStats` 方法获取详细的缓存使用统计信息：

```typescript
import { cache } from '@/utils/cache'

// 获取存储统计
const stats = cache.getStats()

if (stats) {
  console.log('总存储键数:', stats.totalKeys)
  console.log('应用缓存数:', stats.appKeys)
  console.log('当前占用 (KB):', stats.currentSize)
  console.log('存储上限 (KB):', stats.limitSize)
  console.log('使用百分比:', stats.usagePercent + '%')
}

// 存储状态展示
const showStorageInfo = () => {
  const stats = cache.getStats()
  if (!stats) {
    uni.showToast({ title: '获取统计失败', icon: 'none' })
    return
  }

  uni.showModal({
    title: '存储统计',
    content: [
      `应用缓存: ${stats.appKeys} 条`,
      `总存储: ${stats.totalKeys} 条`,
      `已使用: ${(stats.currentSize / 1024).toFixed(2)} KB`,
      `存储上限: ${(stats.limitSize / 1024).toFixed(2)} KB`,
      `使用率: ${stats.usagePercent}%`
    ].join('\n'),
    showCancel: false
  })
}

// 存储预警检查
const checkStorageWarning = () => {
  const stats = cache.getStats()
  if (stats && stats.usagePercent > 90) {
    uni.showModal({
      title: '存储空间不足',
      content: `当前存储使用率已达 ${stats.usagePercent}%，建议清理缓存`,
      confirmText: '立即清理',
      success: (res) => {
        if (res.confirm) {
          cache.cleanup()
          cache.clearAll()
        }
      }
    })
  }
}
```

**统计信息字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| totalKeys | `number` | 存储中的所有键数量（包括其他应用） |
| appKeys | `number` | 当前应用的缓存键数量 |
| currentSize | `number` | 当前已使用的存储空间（字节） |
| limitSize | `number` | 存储空间上限（字节），默认 10MB |
| usagePercent | `number` | 存储使用百分比（0-100） |

### 调试工具：获取原始键名

使用 `getOriginalKey` 方法获取去除前缀后的原始键名（仅用于调试）：

```typescript
import { cache } from '@/utils/cache'

// 假设应用前缀为 'ryplus_uni:'
const prefixedKey = 'ryplus_uni:userInfo'
const originalKey = cache.getOriginalKey(prefixedKey)
console.log(originalKey) // 'userInfo'

// 非前缀键直接返回
const normalKey = cache.getOriginalKey('someKey')
console.log(normalKey) // 'someKey'

// 调试用：列出所有应用缓存
const listAllAppCache = () => {
  const info = uni.getStorageInfoSync()
  const appKeys = info.keys.filter(key =>
    key.startsWith('ryplus_uni:')
  )

  console.log('应用缓存列表:')
  appKeys.forEach(key => {
    const original = cache.getOriginalKey(key)
    console.log(`  - ${original}`)
  })
}
```

## 实际应用场景

### 登录状态管理

```typescript
import { cache } from '@/utils/cache'

// 缓存键常量
const CacheKeys = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  PERMISSIONS: 'permissions',
  ROLES: 'roles'
} as const

// Token 过期时间常量
const TOKEN_EXPIRE = 2 * 60 * 60      // 2小时
const REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60  // 7天

// 登录成功后保存数据
const onLoginSuccess = (loginData: {
  token: string
  refreshToken: string
  userInfo: UserInfo
  permissions: string[]
  roles: string[]
}) => {
  const { token, refreshToken, userInfo, permissions, roles } = loginData

  // 保存 Token（2小时过期）
  cache.set(CacheKeys.TOKEN, token, TOKEN_EXPIRE)

  // 保存刷新 Token（7天过期）
  cache.set(CacheKeys.REFRESH_TOKEN, refreshToken, REFRESH_TOKEN_EXPIRE)

  // 保存用户信息（与 Token 同步过期）
  cache.set(CacheKeys.USER_INFO, userInfo, TOKEN_EXPIRE)

  // 保存权限和角色
  cache.set(CacheKeys.PERMISSIONS, permissions, TOKEN_EXPIRE)
  cache.set(CacheKeys.ROLES, roles, TOKEN_EXPIRE)
}

// 检查登录状态
const isLoggedIn = (): boolean => {
  return cache.has(CacheKeys.TOKEN) && cache.has(CacheKeys.USER_INFO)
}

// 获取 Token
const getToken = (): string | null => {
  return cache.get<string>(CacheKeys.TOKEN)
}

// 获取用户信息
const getUserInfo = (): UserInfo | null => {
  return cache.get<UserInfo>(CacheKeys.USER_INFO)
}

// 检查权限
const hasPermission = (permission: string): boolean => {
  const permissions = cache.get<string[]>(CacheKeys.PERMISSIONS)
  return permissions?.includes(permission) ?? false
}

// 刷新 Token
const refreshTokenHandler = async () => {
  const refreshToken = cache.get<string>(CacheKeys.REFRESH_TOKEN)
  if (!refreshToken) {
    // 刷新 Token 不存在，需要重新登录
    return false
  }

  try {
    const res = await api.refreshToken(refreshToken)
    cache.set(CacheKeys.TOKEN, res.token, TOKEN_EXPIRE)
    return true
  } catch (e) {
    return false
  }
}

// 退出登录
const logout = () => {
  cache.remove(CacheKeys.TOKEN)
  cache.remove(CacheKeys.REFRESH_TOKEN)
  cache.remove(CacheKeys.USER_INFO)
  cache.remove(CacheKeys.PERMISSIONS)
  cache.remove(CacheKeys.ROLES)

  uni.reLaunch({ url: '/pages/login/index' })
}
```

### 表单数据暂存

```typescript
import { cache } from '@/utils/cache'

// 表单暂存配置
const FORM_CACHE_PREFIX = 'form_draft_'
const FORM_CACHE_EXPIRE = 30 * 60  // 30分钟

// 表单数据接口
interface FormDraft {
  data: Record<string, any>
  savedAt: number
  pageUrl: string
}

// 保存表单草稿
const saveFormDraft = (formId: string, formData: Record<string, any>) => {
  const draft: FormDraft = {
    data: formData,
    savedAt: Date.now(),
    pageUrl: getCurrentPageUrl()
  }

  const key = `${FORM_CACHE_PREFIX}${formId}`
  const success = cache.set(key, draft, FORM_CACHE_EXPIRE)

  if (success) {
    uni.showToast({
      title: '草稿已保存',
      icon: 'success',
      duration: 1500
    })
  }

  return success
}

// 恢复表单草稿
const restoreFormDraft = (formId: string): Record<string, any> | null => {
  const key = `${FORM_CACHE_PREFIX}${formId}`
  const draft = cache.get<FormDraft>(key)

  if (draft) {
    // 显示恢复提示
    const savedTime = new Date(draft.savedAt).toLocaleTimeString()
    uni.showModal({
      title: '发现草稿',
      content: `检测到 ${savedTime} 保存的草稿，是否恢复？`,
      confirmText: '恢复',
      cancelText: '放弃',
      success: (res) => {
        if (res.cancel) {
          // 用户选择放弃，清除草稿
          clearFormDraft(formId)
        }
      }
    })

    return draft.data
  }

  return null
}

// 清除表单草稿
const clearFormDraft = (formId: string) => {
  const key = `${FORM_CACHE_PREFIX}${formId}`
  cache.remove(key)
}

// 自动保存 Hook
const useAutoSave = (formId: string, formData: Ref<Record<string, any>>) => {
  let saveTimer: number | null = null

  // 监听表单变化，延迟保存
  watch(formData, () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    saveTimer = setTimeout(() => {
      saveFormDraft(formId, formData.value)
    }, 3000) // 3秒无操作后保存
  }, { deep: true })

  // 组件卸载时清理
  onUnmounted(() => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
  })

  return {
    restore: () => restoreFormDraft(formId),
    clear: () => clearFormDraft(formId)
  }
}
```

### API 数据缓存策略

```typescript
import { cache } from '@/utils/cache'

// 缓存策略配置
interface CacheStrategy {
  /** 缓存键 */
  key: string
  /** 过期时间（秒） */
  expire: number
  /** 是否强制刷新 */
  forceRefresh?: boolean
}

// 默认缓存时间配置
const CacheTTL = {
  /** 短期缓存（1分钟）- 频繁变化的数据 */
  SHORT: 60,
  /** 中期缓存（5分钟）- 一般接口数据 */
  MEDIUM: 5 * 60,
  /** 长期缓存（30分钟）- 不常变化的配置 */
  LONG: 30 * 60,
  /** 持久缓存（1天）- 字典数据等 */
  PERSISTENT: 24 * 60 * 60
} as const

// 带缓存的数据获取
const fetchWithCache = async <T>(
  strategy: CacheStrategy,
  fetcher: () => Promise<T>
): Promise<T> => {
  const { key, expire, forceRefresh = false } = strategy

  // 非强制刷新时，先尝试从缓存获取
  if (!forceRefresh) {
    const cached = cache.get<T>(key)
    if (cached !== null) {
      console.log(`[Cache] 命中缓存: ${key}`)
      return cached
    }
  }

  // 缓存未命中或强制刷新，调用接口
  console.log(`[Cache] 请求接口: ${key}`)
  const data = await fetcher()

  // 存入缓存
  cache.set(key, data, expire)

  return data
}

// 使用示例：获取用户列表
const getUserList = (forceRefresh = false) => {
  return fetchWithCache(
    {
      key: 'api:userList',
      expire: CacheTTL.MEDIUM,
      forceRefresh
    },
    async () => {
      const res = await request.get('/api/users')
      return res.data
    }
  )
}

// 使用示例：获取字典数据
const getDictData = (dictType: string) => {
  return fetchWithCache(
    {
      key: `dict:${dictType}`,
      expire: CacheTTL.PERSISTENT
    },
    async () => {
      const res = await request.get(`/api/dict/${dictType}`)
      return res.data
    }
  )
}

// 使用示例：获取系统配置
const getSystemConfig = () => {
  return fetchWithCache(
    {
      key: 'system:config',
      expire: CacheTTL.LONG
    },
    async () => {
      const res = await request.get('/api/system/config')
      return res.data
    }
  )
}

// 清除指定前缀的所有缓存
const clearCacheByPrefix = (prefix: string) => {
  const info = uni.getStorageInfoSync()
  const keysToRemove = info.keys.filter(key =>
    key.includes(prefix)
  )

  keysToRemove.forEach(key => {
    uni.removeStorageSync(key)
  })

  console.log(`清除了 ${keysToRemove.length} 条 ${prefix} 缓存`)
}
```

### 搜索历史记录

```typescript
import { cache } from '@/utils/cache'

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY_COUNT = 20
const HISTORY_EXPIRE = 30 * 24 * 60 * 60  // 30天

// 搜索历史项
interface SearchHistoryItem {
  keyword: string
  timestamp: number
  type?: 'text' | 'voice'
}

// 添加搜索历史
const addSearchHistory = (keyword: string, type: 'text' | 'voice' = 'text') => {
  if (!keyword.trim()) return

  let history = cache.get<SearchHistoryItem[]>(SEARCH_HISTORY_KEY) || []

  // 移除重复项
  history = history.filter(item => item.keyword !== keyword)

  // 添加到开头
  history.unshift({
    keyword: keyword.trim(),
    timestamp: Date.now(),
    type
  })

  // 限制数量
  if (history.length > MAX_HISTORY_COUNT) {
    history = history.slice(0, MAX_HISTORY_COUNT)
  }

  // 保存
  cache.set(SEARCH_HISTORY_KEY, history, HISTORY_EXPIRE)
}

// 获取搜索历史
const getSearchHistory = (): SearchHistoryItem[] => {
  return cache.get<SearchHistoryItem[]>(SEARCH_HISTORY_KEY) || []
}

// 删除单条历史
const removeSearchHistoryItem = (keyword: string) => {
  let history = cache.get<SearchHistoryItem[]>(SEARCH_HISTORY_KEY) || []
  history = history.filter(item => item.keyword !== keyword)
  cache.set(SEARCH_HISTORY_KEY, history, HISTORY_EXPIRE)
}

// 清空搜索历史
const clearSearchHistory = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    uni.showModal({
      title: '确认清空',
      content: '确定要清空所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          cache.remove(SEARCH_HISTORY_KEY)
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })
}

// 搜索历史组件 Hook
const useSearchHistory = () => {
  const history = ref<SearchHistoryItem[]>([])

  // 加载历史
  const loadHistory = () => {
    history.value = getSearchHistory()
  }

  // 添加历史
  const add = (keyword: string, type?: 'text' | 'voice') => {
    addSearchHistory(keyword, type)
    loadHistory()
  }

  // 删除单条
  const remove = (keyword: string) => {
    removeSearchHistoryItem(keyword)
    loadHistory()
  }

  // 清空所有
  const clear = async () => {
    const success = await clearSearchHistory()
    if (success) {
      loadHistory()
    }
  }

  // 初始加载
  onMounted(() => {
    loadHistory()
  })

  return {
    history: readonly(history),
    add,
    remove,
    clear
  }
}
```

### 浏览历史记录

```typescript
import { cache } from '@/utils/cache'

const BROWSE_HISTORY_KEY = 'browseHistory'
const MAX_BROWSE_HISTORY = 50
const BROWSE_HISTORY_EXPIRE = 7 * 24 * 60 * 60  // 7天

// 浏览历史项
interface BrowseHistoryItem {
  id: string | number
  title: string
  image?: string
  url: string
  timestamp: number
  extra?: Record<string, any>
}

// 添加浏览记录
const addBrowseHistory = (item: Omit<BrowseHistoryItem, 'timestamp'>) => {
  let history = cache.get<BrowseHistoryItem[]>(BROWSE_HISTORY_KEY) || []

  // 移除重复项（根据 id）
  history = history.filter(h => h.id !== item.id)

  // 添加到开头
  history.unshift({
    ...item,
    timestamp: Date.now()
  })

  // 限制数量
  if (history.length > MAX_BROWSE_HISTORY) {
    history = history.slice(0, MAX_BROWSE_HISTORY)
  }

  cache.set(BROWSE_HISTORY_KEY, history, BROWSE_HISTORY_EXPIRE)
}

// 获取浏览历史
const getBrowseHistory = (): BrowseHistoryItem[] => {
  return cache.get<BrowseHistoryItem[]>(BROWSE_HISTORY_KEY) || []
}

// 按日期分组的浏览历史
const getGroupedBrowseHistory = () => {
  const history = getBrowseHistory()
  const groups: Record<string, BrowseHistoryItem[]> = {}

  history.forEach(item => {
    const date = new Date(item.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })

  return Object.entries(groups).map(([date, items]) => ({
    date,
    items
  }))
}

// 清空浏览历史
const clearBrowseHistory = () => {
  cache.remove(BROWSE_HISTORY_KEY)
}
```

### 用户偏好设置

```typescript
import { cache } from '@/utils/cache'

const USER_PREFERENCES_KEY = 'userPreferences'

// 用户偏好接口
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en-US'
  fontSize: 'small' | 'medium' | 'large'
  pushEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  autoPlayVideo: boolean
  imageQuality: 'low' | 'medium' | 'high' | 'original'
}

// 默认偏好设置
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'zh-CN',
  fontSize: 'medium',
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  autoPlayVideo: false,
  imageQuality: 'high'
}

// 获取用户偏好
const getUserPreferences = (): UserPreferences => {
  const saved = cache.get<Partial<UserPreferences>>(USER_PREFERENCES_KEY)
  return { ...defaultPreferences, ...saved }
}

// 更新用户偏好
const updateUserPreferences = (updates: Partial<UserPreferences>) => {
  const current = getUserPreferences()
  const newPreferences = { ...current, ...updates }

  // 永久保存（不设置过期时间）
  cache.set(USER_PREFERENCES_KEY, newPreferences)

  return newPreferences
}

// 重置用户偏好
const resetUserPreferences = () => {
  cache.set(USER_PREFERENCES_KEY, defaultPreferences)
  return defaultPreferences
}

// 响应式偏好设置 Hook
const usePreferences = () => {
  const preferences = ref<UserPreferences>(getUserPreferences())

  // 更新偏好
  const update = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    preferences.value = updateUserPreferences({ [key]: value })
  }

  // 批量更新
  const batchUpdate = (updates: Partial<UserPreferences>) => {
    preferences.value = updateUserPreferences(updates)
  }

  // 重置
  const reset = () => {
    preferences.value = resetUserPreferences()
  }

  return {
    preferences: readonly(preferences),
    update,
    batchUpdate,
    reset
  }
}
```

### 应用状态持久化

```typescript
import { cache } from '@/utils/cache'

const APP_STATE_KEY = 'appState'
const APP_STATE_EXPIRE = 24 * 60 * 60  // 1天

// 应用状态接口
interface AppState {
  lastVisitedPage: string
  lastVisitedTime: number
  unreadNotifications: number
  cartItemCount: number
  recentModules: string[]
}

// 默认状态
const defaultAppState: AppState = {
  lastVisitedPage: '/pages/index/index',
  lastVisitedTime: 0,
  unreadNotifications: 0,
  cartItemCount: 0,
  recentModules: []
}

// 获取应用状态
const getAppState = (): AppState => {
  const saved = cache.get<Partial<AppState>>(APP_STATE_KEY)
  return { ...defaultAppState, ...saved }
}

// 更新应用状态
const updateAppState = (updates: Partial<AppState>) => {
  const current = getAppState()
  const newState = { ...current, ...updates }
  cache.set(APP_STATE_KEY, newState, APP_STATE_EXPIRE)
  return newState
}

// 记录页面访问
const recordPageVisit = (pageUrl: string) => {
  updateAppState({
    lastVisitedPage: pageUrl,
    lastVisitedTime: Date.now()
  })
}

// 记录最近访问的模块
const recordRecentModule = (moduleId: string) => {
  const state = getAppState()
  let modules = state.recentModules.filter(m => m !== moduleId)
  modules.unshift(moduleId)

  if (modules.length > 5) {
    modules = modules.slice(0, 5)
  }

  updateAppState({ recentModules: modules })
}

// 更新未读通知数
const updateUnreadCount = (count: number) => {
  updateAppState({ unreadNotifications: count })

  // 同步更新 TabBar 徽章
  if (count > 0) {
    uni.setTabBarBadge({
      index: 2,
      text: count > 99 ? '99+' : String(count)
    })
  } else {
    uni.removeTabBarBadge({ index: 2 })
  }
}
```

## API

### 方法列表

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| set | 存储数据 | `<T>(key: string, value: T, expire?: number)` | `boolean` |
| get | 获取数据 | `<T>(key: string)` | `T \| null` |
| remove | 删除数据 | `(key: string)` | `void` |
| has | 检查是否存在 | `(key: string)` | `boolean` |
| clearAll | 清空所有应用缓存 | - | `void` |
| cleanup | 清理过期数据 | - | `void` |
| getStats | 获取统计信息 | - | `CacheStats \| null` |
| getOriginalKey | 获取原始键名 | `(prefixedKey: string)` | `string` |

### 类型定义

```typescript
/**
 * 缓存数据包装器
 * 用于存储实际数据和过期时间
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
  /** 存储中的所有键数量 */
  totalKeys: number
  /** 当前应用的缓存键数量 */
  appKeys: number
  /** 当前已使用的存储空间（字节） */
  currentSize: number
  /** 存储空间上限（字节），默认 10MB */
  limitSize: number
  /** 存储使用百分比（0-100） */
  usagePercent: number
}

/**
 * 缓存工具接口
 */
interface CacheUtil {
  /**
   * 存储数据到缓存
   * @param key 缓存键名
   * @param value 要存储的数据（任意可序列化类型）
   * @param expireSeconds 过期时间（秒），不传则永不过期
   * @returns 存储是否成功
   */
  set: <T>(key: string, value: T, expireSeconds?: number) => boolean

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
   * 清空当前应用的所有缓存
   */
  clearAll: () => void

  /**
   * 清理所有过期缓存
   */
  cleanup: () => void

  /**
   * 获取缓存统计信息
   * @returns 统计信息对象，获取失败返回 null
   */
  getStats: () => CacheStats | null

  /**
   * 获取缓存键的原始名称（移除前缀）
   * @param prefixedKey 带前缀的缓存键
   * @returns 原始缓存键名称
   */
  getOriginalKey: (prefixedKey: string) => string
}
```

### 存储键前缀

缓存工具会自动为所有键名添加应用前缀，前缀格式为 `${SystemConfig.app.id}:`：

```typescript
// 假设 SystemConfig.app.id = 'ryplus_uni'

// 设置时
cache.set('token', 'abc123')
// 实际存储键名: 'ryplus_uni:token'

// 获取时
cache.get('token')
// 实际读取键名: 'ryplus_uni:token'

// 删除时
cache.remove('token')
// 实际删除键名: 'ryplus_uni:token'
```

### 存储限制

不同平台的存储限制不同：

| 平台 | 存储上限 | 单条数据上限 |
|------|---------|-------------|
| 微信小程序 | 10MB | 单个 key 1MB |
| 支付宝小程序 | 10MB | 单个 key 200KB |
| H5 | 5MB（localStorage） | 无明确限制 |
| App | 无限制 | 无限制 |

## 最佳实践

### 1. 定义缓存键常量

将所有缓存键集中管理，避免字符串硬编码：

```typescript
// constants/cacheKeys.ts
export const CacheKeys = {
  // 认证相关
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  PERMISSIONS: 'permissions',
  ROLES: 'roles',

  // 用户偏好
  PREFERENCES: 'preferences',
  THEME: 'theme',
  LANGUAGE: 'language',

  // 业务数据
  SEARCH_HISTORY: 'searchHistory',
  BROWSE_HISTORY: 'browseHistory',
  FORM_DRAFT: 'formDraft',
  CART: 'cart',

  // 系统数据
  DICT_PREFIX: 'dict:',
  API_CACHE_PREFIX: 'api:',

  // 临时数据
  VERIFY_CODE: 'verifyCode',
  TEMP_DATA: 'tempData'
} as const

// 类型导出
export type CacheKey = typeof CacheKeys[keyof typeof CacheKeys]
```

### 2. 封装业务缓存服务

为不同业务场景封装专用的缓存服务：

```typescript
// services/authCache.ts
import { cache } from '@/utils/cache'
import { CacheKeys } from '@/constants/cacheKeys'

const TOKEN_EXPIRE = 2 * 60 * 60  // 2小时

export const authCache = {
  // Token
  setToken: (token: string) => cache.set(CacheKeys.TOKEN, token, TOKEN_EXPIRE),
  getToken: () => cache.get<string>(CacheKeys.TOKEN),
  hasToken: () => cache.has(CacheKeys.TOKEN),
  removeToken: () => cache.remove(CacheKeys.TOKEN),

  // 用户信息
  setUserInfo: (user: UserInfo) => cache.set(CacheKeys.USER_INFO, user, TOKEN_EXPIRE),
  getUserInfo: () => cache.get<UserInfo>(CacheKeys.USER_INFO),

  // 权限
  setPermissions: (perms: string[]) => cache.set(CacheKeys.PERMISSIONS, perms, TOKEN_EXPIRE),
  getPermissions: () => cache.get<string[]>(CacheKeys.PERMISSIONS) || [],

  // 清除所有认证数据
  clearAuth: () => {
    cache.remove(CacheKeys.TOKEN)
    cache.remove(CacheKeys.REFRESH_TOKEN)
    cache.remove(CacheKeys.USER_INFO)
    cache.remove(CacheKeys.PERMISSIONS)
    cache.remove(CacheKeys.ROLES)
  }
}
```

### 3. 应用启动时清理过期数据

虽然缓存工具内置了自动清理，但建议在应用启动时主动执行一次：

```typescript
// App.vue
import { cache } from '@/utils/cache'

onLaunch(() => {
  // 清理过期缓存
  cache.cleanup()

  // 检查存储状态
  const stats = cache.getStats()
  if (stats) {
    console.log(`缓存初始化: ${stats.appKeys} 条, 使用率 ${stats.usagePercent}%`)

    // 存储空间预警
    if (stats.usagePercent > 80) {
      console.warn('存储空间使用率较高，建议清理')
    }
  }
})
```

### 4. 合理设置过期时间

根据数据特性设置合适的过期时间：

```typescript
// 过期时间策略常量
export const CacheExpireStrategy = {
  // 临时数据（几分钟）
  TEMPORARY: {
    VERIFY_CODE: 5 * 60,      // 验证码 5分钟
    FORM_DRAFT: 30 * 60,      // 表单草稿 30分钟
    TEMP_DATA: 10 * 60        // 临时数据 10分钟
  },

  // 会话数据（几小时）
  SESSION: {
    TOKEN: 2 * 60 * 60,       // Token 2小时
    USER_INFO: 2 * 60 * 60,   // 用户信息 2小时
    API_CACHE: 5 * 60         // API缓存 5分钟
  },

  // 持久数据（几天到永久）
  PERSISTENT: {
    REFRESH_TOKEN: 7 * 24 * 60 * 60,  // 刷新Token 7天
    PREFERENCES: undefined,            // 用户偏好 永久
    SEARCH_HISTORY: 30 * 24 * 60 * 60, // 搜索历史 30天
    DICT_DATA: 24 * 60 * 60            // 字典数据 1天
  }
} as const

// 使用示例
cache.set('token', tokenValue, CacheExpireStrategy.SESSION.TOKEN)
cache.set('preferences', prefs, CacheExpireStrategy.PERSISTENT.PREFERENCES)
```

### 5. 类型安全的泛型使用

始终使用泛型确保类型安全：

```typescript
// 定义数据接口
interface Product {
  id: number
  name: string
  price: number
}

// 类型安全的缓存操作
const setProducts = (products: Product[]) => {
  cache.set<Product[]>('products', products)
}

const getProducts = (): Product[] => {
  return cache.get<Product[]>('products') || []
}

// 使用时类型自动推断
const products = getProducts()
products.forEach(p => {
  console.log(p.name)  // TypeScript 知道 p 是 Product 类型
})
```

### 6. 错误处理和降级

处理缓存操作可能出现的异常：

```typescript
// 安全的缓存读取
const safeGet = <T>(key: string, defaultValue: T): T => {
  try {
    const value = cache.get<T>(key)
    return value !== null ? value : defaultValue
  } catch (e) {
    console.error(`缓存读取失败 [${key}]:`, e)
    return defaultValue
  }
}

// 安全的缓存写入
const safeSet = <T>(key: string, value: T, expire?: number): boolean => {
  try {
    return cache.set(key, value, expire)
  } catch (e) {
    console.error(`缓存写入失败 [${key}]:`, e)
    return false
  }
}

// 带重试的缓存操作
const setWithRetry = <T>(
  key: string,
  value: T,
  expire?: number,
  maxRetries = 3
): boolean => {
  for (let i = 0; i < maxRetries; i++) {
    if (cache.set(key, value, expire)) {
      return true
    }
    console.warn(`缓存写入重试 [${key}]: 第 ${i + 1} 次`)
  }
  return false
}
```

## 常见问题

### 1. 缓存数据读取为 null？

**可能原因：**
- 数据已过期被自动清理
- 键名拼写错误
- 数据从未被存储
- 存储时 value 为 null 或 undefined

**解决方案：**

```typescript
// 方案1：使用 has 方法预检查
if (cache.has('myKey')) {
  const data = cache.get('myKey')
  // 使用数据
} else {
  console.log('缓存不存在或已过期')
  // 重新获取数据
}

// 方案2：使用默认值
const getData = <T>(key: string, defaultValue: T): T => {
  const value = cache.get<T>(key)
  return value !== null ? value : defaultValue
}

const config = getData('config', { theme: 'light' })

// 方案3：调试查看实际存储
const debugCache = (key: string) => {
  const info = uni.getStorageInfoSync()
  const prefix = 'ryplus_uni:'
  const fullKey = `${prefix}${key}`

  console.log('所有存储键:', info.keys)
  console.log('目标键存在:', info.keys.includes(fullKey))

  if (info.keys.includes(fullKey)) {
    const raw = uni.getStorageSync(fullKey)
    console.log('原始数据:', raw)
  }
}
```

### 2. 如何判断缓存是否过期？

**解决方案：**

`has` 和 `get` 方法会自动判断数据是否过期，过期数据会返回 `false` 或 `null`：

```typescript
// has 方法自动检查过期
const isValid = cache.has('token')
// isValid 为 false 表示不存在或已过期

// get 方法返回 null 表示过期或不存在
const data = cache.get('token')
if (data === null) {
  // 数据不存在或已过期
}

// 手动检查过期时间（仅调试用）
const checkExpireTime = (key: string) => {
  const prefix = 'ryplus_uni:'
  const fullKey = `${prefix}${key}`

  try {
    const wrapper = uni.getStorageSync(fullKey)
    if (wrapper && wrapper._expire) {
      const expireDate = new Date(wrapper._expire)
      const now = new Date()

      console.log('过期时间:', expireDate.toLocaleString())
      console.log('当前时间:', now.toLocaleString())
      console.log('是否过期:', wrapper._expire < Date.now())
    } else {
      console.log('该缓存永不过期')
    }
  } catch (e) {
    console.log('缓存不存在')
  }
}
```

### 3. 存储空间不足？

**解决方案：**

```typescript
// 方案1：定期清理过期数据
cache.cleanup()

// 方案2：检查并清理大量过期数据
const smartCleanup = () => {
  const stats = cache.getStats()
  if (!stats) return

  // 使用率超过70%时清理
  if (stats.usagePercent > 70) {
    cache.cleanup()

    // 如果清理后仍然超过90%，清空所有缓存
    const newStats = cache.getStats()
    if (newStats && newStats.usagePercent > 90) {
      cache.clearAll()
      console.warn('存储空间严重不足，已清空所有缓存')
    }
  }
}

// 方案3：减少存储数据量
const compressData = (data: any[]): any[] => {
  // 只保留必要字段
  return data.map(item => ({
    id: item.id,
    name: item.name
    // 移除不必要的大字段
  }))
}

// 方案4：使用更短的过期时间
const SHORTER_EXPIRE = 5 * 60  // 5分钟
cache.set('largeData', data, SHORTER_EXPIRE)
```

### 4. 多端数据同步问题？

由于 UniApp Storage 是本地存储，不同设备间数据无法自动同步：

**解决方案：**

```typescript
// 方案1：仅缓存临时数据，重要数据存服务端
const saveToServer = async (key: string, data: any) => {
  // 保存到服务端
  await api.saveUserData(key, data)
  // 同时缓存本地
  cache.set(key, data)
}

// 方案2：登录时从服务端同步
const syncDataFromServer = async () => {
  const serverData = await api.getUserData()

  // 更新本地缓存
  cache.set('userInfo', serverData.userInfo)
  cache.set('preferences', serverData.preferences)
  cache.set('permissions', serverData.permissions)
}

// 方案3：使用时间戳判断数据新旧
interface SyncData {
  data: any
  updatedAt: number
}

const setWithTimestamp = (key: string, data: any) => {
  cache.set<SyncData>(key, {
    data,
    updatedAt: Date.now()
  })
}

const syncWithServer = async (key: string) => {
  const local = cache.get<SyncData>(key)
  const server = await api.getData(key)

  // 使用较新的数据
  if (!local || server.updatedAt > local.updatedAt) {
    cache.set(key, server)
    return server.data
  }
  return local.data
}
```

### 5. 存储复杂对象失败？

UniApp Storage 基于 JSON 序列化，某些数据类型无法存储：

**不支持的数据类型：**
- 函数 (Function)
- Symbol
- undefined（会被忽略）
- 循环引用对象
- Map、Set 等特殊对象
- Date 对象（存储后变成字符串）

**解决方案：**

```typescript
// 错误示例
cache.set('func', () => {})  // 函数无法存储
cache.set('symbol', Symbol('key'))  // Symbol 无法存储
cache.set('circular', obj)  // obj 有循环引用

// 正确示例：只存储可序列化数据
cache.set('config', {
  name: 'app',
  version: '1.0.0'
})

// 处理 Date 对象
const saveWithDate = (key: string, data: { createdAt: Date }) => {
  cache.set(key, {
    ...data,
    createdAt: data.createdAt.getTime()  // 转为时间戳
  })
}

const getWithDate = (key: string) => {
  const data = cache.get(key)
  if (data) {
    return {
      ...data,
      createdAt: new Date(data.createdAt)  // 还原 Date
    }
  }
  return null
}

// 处理 Map 和 Set
const saveMap = (key: string, map: Map<string, any>) => {
  cache.set(key, Array.from(map.entries()))
}

const getMap = (key: string): Map<string, any> => {
  const entries = cache.get<[string, any][]>(key)
  return entries ? new Map(entries) : new Map()
}
```

### 6. 缓存键命名冲突？

当多个功能模块使用相同的键名时会发生冲突：

**解决方案：**

```typescript
// 方案1：使用命名空间前缀
const createNamespacedCache = (namespace: string) => ({
  set: <T>(key: string, value: T, expire?: number) =>
    cache.set(`${namespace}:${key}`, value, expire),
  get: <T>(key: string) =>
    cache.get<T>(`${namespace}:${key}`),
  remove: (key: string) =>
    cache.remove(`${namespace}:${key}`),
  has: (key: string) =>
    cache.has(`${namespace}:${key}`)
})

// 使用
const userCache = createNamespacedCache('user')
const orderCache = createNamespacedCache('order')

userCache.set('list', userList)  // 实际键: user:list
orderCache.set('list', orderList)  // 实际键: order:list

// 方案2：使用常量管理所有键名
export const CacheKeys = {
  USER_LIST: 'user:list',
  ORDER_LIST: 'order:list',
  // ...
} as const
```

### 7. 性能优化建议

```typescript
// 1. 避免频繁读写
// 错误：循环中每次都读写缓存
for (let i = 0; i < 100; i++) {
  const data = cache.get('myData')
  data.items[i] = newItem
  cache.set('myData', data)
}

// 正确：读取一次，修改完再写入一次
const data = cache.get('myData')
for (let i = 0; i < 100; i++) {
  data.items[i] = newItem
}
cache.set('myData', data)

// 2. 大数据分片存储
const saveLargeData = (data: any[], chunkSize = 100) => {
  const chunks = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const key = `data_chunk_${Math.floor(i / chunkSize)}`
    cache.set(key, chunk)
    chunks.push(key)
  }
  cache.set('data_chunks_index', chunks)
}

// 3. 延迟写入（防抖）
const debouncedSet = (() => {
  let timer: number | null = null
  let pending: { key: string; value: any; expire?: number } | null = null

  return (key: string, value: any, expire?: number) => {
    pending = { key, value, expire }

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (pending) {
        cache.set(pending.key, pending.value, pending.expire)
        pending = null
      }
    }, 300)
  }
})()
```
