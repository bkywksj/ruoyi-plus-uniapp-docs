# 缓存工具 (cache.ts)

浏览器缓存工具集合，提供对浏览器存储机制的完整封装，支持会话级和持久化的数据存储操作。所有缓存键会自动添加应用ID前缀，避免多应用冲突。

## 概述

缓存工具提供两套完整的存储方案：

### 会话缓存 (sessionCache)
基于 `sessionStorage` 的临时数据存储，页面关闭后数据会被清除：
- 基础操作：存取字符串数据
- JSON处理：存取JSON对象数据
- 数据清理：移除指定缓存数据

### 本地缓存 (localCache)
基于 `localStorage` 的持久化数据存储，具有高级功能：
- 基础操作：存取字符串和对象数据
- 过期控制：支持设置缓存有效期
- 自动清理：定期清理过期或损坏的缓存
- 存储统计：提供缓存使用情况统计

## 核心特性

### 自动前缀机制
所有缓存键都会自动添加应用ID前缀，避免不同应用之间的数据冲突：

```typescript
const KEY_PREFIX = `${SystemConfig.app.id}:`

// 实际存储的键名
// 用户输入：'userInfo'
// 实际存储：'myApp:userInfo'
```

### 自动清理机制
本地缓存支持自动清理过期和损坏的数据：

```typescript
// 应用启动时自动清理
setTimeout(() => {
  autoCleanup()
}, 1000)

// 每小时清理一次过期缓存
setInterval(autoCleanup, 60 * 60 * 1000)
```

## 会话缓存 (sessionCache)

基于 `sessionStorage` 的临时存储，页面关闭后数据会被清除。

### set

设置会话缓存。

```typescript
set(key: string, value: string): void
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）
- `value` - 缓存值（仅支持字符串）

**示例：**
```typescript
// 存储用户名
sessionCache.set('userName', 'admin')
// 实际存储的键为 'appId:userName'

// 存储数字需要转为字符串
sessionCache.set('userId', '12345')
sessionCache.set('count', String(42))
```

### get

获取会话缓存。

```typescript
get(key: string): string | null
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）

**返回值：**
- `string | null` - 缓存值或 null

**示例：**
```typescript
// 获取用户名
const userName = sessionCache.get('userName')
if (userName) {
  console.log('用户名:', userName)
}
```

### getNumber

获取数字类型缓存（便捷转换方法）。

```typescript
getNumber(key: string): number | null
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）

**返回值：**
- `number | null` - 数字或 null

**示例：**
```typescript
// 获取数字
sessionCache.set('count', '42')
const count = sessionCache.getNumber('count') // 42
```

### setJSON

设置 JSON 对象到会话缓存。

```typescript
setJSON<T>(key: string, jsonValue: T): void
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）
- `jsonValue` - 要缓存的 JSON 对象

**示例：**
```typescript
// 存储用户信息对象
const userInfo = { id: 1, name: 'admin', role: 'administrator' }
sessionCache.setJSON('userInfo', userInfo)
```

### getJSON

从会话缓存获取 JSON 对象。

```typescript
getJSON<T = any>(key: string): T | null
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）

**返回值：**
- `T | null` - 解析后的 JSON 对象或 null

**示例：**
```typescript
// 获取用户信息对象
const userInfo = sessionCache.getJSON<UserInfo>('userInfo')
if (userInfo) {
  console.log(userInfo.name) // TypeScript 类型安全
}
```

### remove

移除会话缓存项。

```typescript
remove(key: string): void
```

**参数：**
- `key` - 要移除的缓存键（自动添加应用ID前缀）

**示例：**
```typescript
// 移除用户信息
sessionCache.remove('userInfo')
```

### has

检查会话缓存是否存在。

```typescript
has(key: string): boolean
```

**参数：**
- `key` - 缓存键

**返回值：**
- `boolean` - 是否存在

**示例：**
```typescript
if (sessionCache.has('userToken')) {
  // 令牌存在
  proceedWithAuthentication()
}
```

### clearAll

清除所有带有当前应用前缀的会话缓存。

```typescript
clearAll(): void
```

**示例：**
```typescript
// 清除当前应用的所有会话缓存
sessionCache.clearAll()
```

## 本地缓存 (localCache)

基于 `localStorage` 的持久化存储，数据将永久保存，支持过期时间管理和自动清理。

### set

设置本地缓存，支持过期时间。

```typescript
set<T>(key: string, value: T, expireSeconds?: number): void
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）
- `value` - 缓存值
- `expireSeconds` - 过期时间（秒），不传则永不过期

**示例：**
```typescript
// 存储主题设置（永久）
localCache.set('theme', 'dark')
// 实际存储的键为 'appId:theme'

// 存储 token（7天过期）
localCache.set('userToken', 'abc123', 7 * 24 * 3600)
```

### get

获取本地缓存，自动处理过期数据。

```typescript
get<T = any>(key: string): T | null
```

**参数：**
- `key` - 缓存键（自动添加应用ID前缀）

**返回值：**
- `T | null` - 缓存值或 null（过期或无效数据返回 null）

**示例：**
```typescript
// 获取主题设置
const theme = localCache.get<string>('theme') // 'dark'

// 获取可能过期的token
const token = localCache.get<string>('userToken')
if (!token) {
  // token不存在或已过期，需要重新登录
  redirectToLogin()
}
```

### setJSON / getJSON

JSON对象的便捷方法，与 `set/get` 功能相同。

```typescript
setJSON<T>(key: string, jsonValue: T, expireSeconds?: number): void
getJSON<T = any>(key: string): T | null
```

**示例：**
```typescript
// 存储系统配置
const config = { language: 'zh-CN', fontSize: 'medium', autoSave: true }
localCache.setJSON('sysConfig', config)

// 获取系统配置
const sysConfig = localCache.getJSON<SystemConfig>('sysConfig')
if (sysConfig) {
  console.log(sysConfig.language) // TypeScript 类型安全
}
```

### remove

移除本地缓存项。

```typescript
remove(key: string): void
```

**参数：**
- `key` - 要移除的缓存键（自动添加应用ID前缀）

**示例：**
```typescript
// 移除系统配置
localCache.remove('sysConfig')
```

### has

检查本地缓存是否存在且未过期。

```typescript
has(key: string): boolean
```

**参数：**
- `key` - 缓存键

**返回值：**
- `boolean` - 是否存在

**示例：**
```typescript
if (localCache.has('userToken')) {
  // 用户已登录且token未过期
  showUserDashboard()
} else {
  // 需要登录
  redirectToLogin()
}
```

### clearAll

清除所有带有当前应用前缀的本地缓存。

```typescript
clearAll(): void
```

**示例：**
```typescript
// 清除当前应用的所有本地缓存
localCache.clearAll()
```

### cleanup

手动清理过期缓存。

```typescript
cleanup(): void
```

**示例：**
```typescript
// 清理所有过期的本地缓存
localCache.cleanup()
```

### getStats

获取本地缓存统计信息。

```typescript
getStats(): {
  totalKeys: number
  appKeys: number
  usagePercent: number
} | null
```

**返回值：**
- 统计信息对象或 null
    - `totalKeys` - localStorage中的总键数
    - `appKeys` - 当前应用的键数
    - `usagePercent` - 估算的存储使用百分比

**示例：**
```typescript
const stats = localCache.getStats()
if (stats) {
  console.log(`当前使用: ${stats.usagePercent}%`)
  console.log(`应用缓存数量: ${stats.appKeys}`)
  
  if (stats.usagePercent > 80) {
    console.warn('存储空间不足，建议清理缓存')
  }
}
```

## 实际应用场景

### 1. 用户认证状态管理

```typescript
// 登录成功后存储用户信息
const handleLogin = async (credentials: LoginForm) => {
  const response = await loginApi(credentials)
  
  if (response.success) {
    // 存储用户信息（会话级）
    sessionCache.setJSON('userInfo', response.user)
    
    // 存储访问令牌（30分钟过期）
    localCache.set('accessToken', response.accessToken, 30 * 60)
    
    // 存储刷新令牌（7天过期）
    localCache.set('refreshToken', response.refreshToken, 7 * 24 * 60 * 60)
    
    // 记住登录状态（如果用户选择）
    if (credentials.rememberMe) {
      localCache.set('rememberUser', 'true', 30 * 24 * 60 * 60) // 30天
    }
  }
}

// 检查登录状态
const checkAuthStatus = () => {
  const accessToken = localCache.get('accessToken')
  const userInfo = sessionCache.getJSON('userInfo')
  
  if (accessToken && userInfo) {
    return { isAuthenticated: true, user: userInfo }
  }
  
  // 尝试使用刷新令牌
  const refreshToken = localCache.get('refreshToken')
  if (refreshToken) {
    return { isAuthenticated: false, canRefresh: true }
  }
  
  return { isAuthenticated: false, canRefresh: false }
}

// 登出处理
const handleLogout = () => {
  // 清除所有认证相关的缓存
  sessionCache.remove('userInfo')
  localCache.remove('accessToken')
  localCache.remove('refreshToken')
  
  // 检查是否需要保留记住登录
  if (!localCache.has('rememberUser')) {
    localCache.remove('lastLoginUser')
  }
}
```

### 2. 应用配置管理

```typescript
interface AppConfig {
  theme: 'light' | 'dark'
  language: string
  pageSize: number
  autoSave: boolean
  notifications: boolean
}

class ConfigManager {
  private static readonly CONFIG_KEY = 'appConfig'
  private static readonly DEFAULT_CONFIG: AppConfig = {
    theme: 'light',
    language: 'zh-CN',
    pageSize: 20,
    autoSave: true,
    notifications: true
  }
  
  // 获取配置（带默认值）
  static getConfig(): AppConfig {
    const stored = localCache.getJSON<AppConfig>(this.CONFIG_KEY)
    return { ...this.DEFAULT_CONFIG, ...stored }
  }
  
  // 更新配置
  static updateConfig(updates: Partial<AppConfig>) {
    const current = this.getConfig()
    const updated = { ...current, ...updates }
    localCache.setJSON(this.CONFIG_KEY, updated)
    
    // 触发配置变更事件
    this.notifyConfigChange(updated)
  }
  
  // 重置为默认配置
  static resetConfig() {
    localCache.setJSON(this.CONFIG_KEY, this.DEFAULT_CONFIG)
    this.notifyConfigChange(this.DEFAULT_CONFIG)
  }
  
  private static notifyConfigChange(config: AppConfig) {
    window.dispatchEvent(new CustomEvent('configChanged', { detail: config }))
  }
}

// 使用示例
const config = ConfigManager.getConfig()
console.log('当前主题:', config.theme)

// 切换主题
ConfigManager.updateConfig({ theme: 'dark' })

// 监听配置变更
window.addEventListener('configChanged', (e: CustomEvent) => {
  console.log('配置已更新:', e.detail)
  applyTheme(e.detail.theme)
})
```

### 3. 表单数据自动保存

```typescript
// 表单自动保存管理器
class FormAutoSave {
  private saveTimer: number | null = null
  private readonly SAVE_DELAY = 2000 // 2秒延迟保存
  
  constructor(
    private formId: string,
    private expireMinutes: number = 30
  ) {}
  
  // 保存表单数据
  saveFormData(data: Record<string, any>) {
    // 清除之前的定时器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    
    // 延迟保存，避免频繁写入
    this.saveTimer = window.setTimeout(() => {
      const key = `form_draft_${this.formId}`
      const saveData = {
        data,
        timestamp: Date.now()
      }
      
      localCache.setJSON(key, saveData, this.expireMinutes * 60)
      console.log('表单数据已自动保存')
    }, this.SAVE_DELAY)
  }
  
  // 恢复表单数据
  restoreFormData(): Record<string, any> | null {
    const key = `form_draft_${this.formId}`
    const saved = localCache.getJSON<{
      data: Record<string, any>
      timestamp: number
    }>(key)
    
    if (saved) {
      const age = Date.now() - saved.timestamp
      console.log(`发现${Math.round(age / 1000)}秒前的草稿`)
      return saved.data
    }
    
    return null
  }
  
  // 清除草稿
  clearDraft() {
    const key = `form_draft_${this.formId}`
    localCache.remove(key)
    
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
  }
}

// 使用示例
const autoSave = new FormAutoSave('user_profile_form', 60) // 60分钟过期

// 表单输入时自动保存
const handleFormChange = (formData: any) => {
  autoSave.saveFormData(formData)
}

// 页面加载时恢复数据
const restoreData = autoSave.restoreFormData()
if (restoreData) {
  const shouldRestore = confirm('发现未保存的表单数据，是否恢复？')
  if (shouldRestore) {
    fillFormWithData(restoreData)
  } else {
    autoSave.clearDraft()
  }
}
```

### 4. API响应缓存

```typescript
// API响应缓存管理器
class ApiCache {
  private static readonly CACHE_PREFIX = 'api_cache_'
  
  // 缓存API响应
  static cacheResponse(
    endpoint: string, 
    params: Record<string, any>, 
    response: any, 
    ttlMinutes: number = 5
  ) {
    const cacheKey = this.generateCacheKey(endpoint, params)
    const cacheData = {
      response,
      cachedAt: Date.now(),
      endpoint,
      params
    }
    
    localCache.setJSON(cacheKey, cacheData, ttlMinutes * 60)
  }
  
  // 获取缓存的响应
  static getCachedResponse(endpoint: string, params: Record<string, any>) {
    const cacheKey = this.generateCacheKey(endpoint, params)
    const cached = localCache.getJSON<{
      response: any
      cachedAt: number
      endpoint: string
      params: Record<string, any>
    }>(cacheKey)
    
    if (cached) {
      const age = Math.round((Date.now() - cached.cachedAt) / 1000)
      console.log(`使用${age}秒前的缓存数据`)
      return cached.response
    }
    
    return null
  }
  
  // 生成缓存键
  private static generateCacheKey(endpoint: string, params: Record<string, any>): string {
    const paramStr = JSON.stringify(params, Object.keys(params).sort())
    const hash = this.simpleHash(endpoint + paramStr)
    return `${this.CACHE_PREFIX}${hash}`
  }
  
  // 简单哈希函数
  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }
  
  // 清理特定endpoint的缓存
  static clearEndpointCache(endpoint: string) {
    const stats = localCache.getStats()
    if (!stats) return
    
    // 这里需要遍历所有键，实际项目中可考虑更高效的实现
    console.log(`清理${endpoint}相关缓存`)
  }
}

// API调用包装器
const cachedApiCall = async <T>(
  endpoint: string, 
  params: Record<string, any> = {},
  options: { ttl?: number, useCache?: boolean } = {}
): Promise<T> => {
  const { ttl = 5, useCache = true } = options
  
  // 尝试获取缓存
  if (useCache) {
    const cached = ApiCache.getCachedResponse(endpoint, params)
    if (cached) {
      return cached
    }
  }
  
  // 发起API请求
  console.log('发起API请求:', endpoint)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  }).then(res => res.json())
  
  // 缓存响应
  if (useCache && response.success) {
    ApiCache.cacheResponse(endpoint, params, response, ttl)
  }
  
  return response
}

// 使用示例
const getUserList = (page: number, pageSize: number) => {
  return cachedApiCall('/api/users', { page, pageSize }, { ttl: 10 })
}

const getUserDetail = (userId: number) => {
  return cachedApiCall(`/api/user/${userId}`, {}, { ttl: 30 })
}
```

### 5. 购物车状态管理

```typescript
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

class ShoppingCart {
  private static readonly CART_KEY = 'shopping_cart'
  private static readonly EXPIRE_DAYS = 7
  
  // 获取购物车
  static getCart(): CartItem[] {
    return localCache.getJSON<CartItem[]>(this.CART_KEY) || []
  }
  
  // 添加商品
  static addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    const cart = this.getCart()
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id)
    
    if (existingIndex >= 0) {
      // 更新数量
      cart[existingIndex].quantity += quantity
    } else {
      // 添加新商品
      cart.push({ ...item, quantity })
    }
    
    this.saveCart(cart)
    this.notifyCartChange()
  }
  
  // 更新商品数量
  static updateQuantity(itemId: number, quantity: number) {
    const cart = this.getCart()
    const itemIndex = cart.findIndex(item => item.id === itemId)
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1) // 删除商品
      } else {
        cart[itemIndex].quantity = quantity
      }
      
      this.saveCart(cart)
      this.notifyCartChange()
    }
  }
  
  // 移除商品
  static removeItem(itemId: number) {
    const cart = this.getCart().filter(item => item.id !== itemId)
    this.saveCart(cart)
    this.notifyCartChange()
  }
  
  // 清空购物车
  static clearCart() {
    localCache.remove(this.CART_KEY)
    this.notifyCartChange()
  }
  
  // 获取统计信息
  static getCartStats() {
    const cart = this.getCart()
    return {
      itemCount: cart.length,
      totalQuantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }
  }
  
  // 保存购物车
  private static saveCart(cart: CartItem[]) {
    localCache.setJSON(this.CART_KEY, cart, this.EXPIRE_DAYS * 24 * 60 * 60)
  }
  
  // 通知购物车变更
  private static notifyCartChange() {
    const stats = this.getCartStats()
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: stats }))
  }
}

// 使用示例
// 添加商品到购物车
ShoppingCart.addItem({
  id: 1,
  name: 'iPhone 15',
  price: 5999,
  image: 'iphone15.jpg'
}, 2)

// 监听购物车变更
window.addEventListener('cartChanged', (e: CustomEvent) => {
  const { itemCount, totalAmount } = e.detail
  updateCartBadge(itemCount)
  updateCartTotal(totalAmount)
})

// 获取购物车统计
const stats = ShoppingCart.getCartStats()
console.log(`购物车中有${stats.itemCount}种商品，共${stats.totalQuantity}件`)
```

## 高级功能

### 缓存同步机制

```typescript
// 跨标签页缓存同步
class CacheSync {
  private static listeners = new Map<string, Function[]>()
  
  // 监听缓存变更
  static listen(key: string, callback: (newValue: any) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(callback)
    
    // 监听storage事件（跨标签页）
    window.addEventListener('storage', (e) => {
      if (e.key === `${SystemConfig.app.id}:${key}`) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : null
        callback(newValue)
      }
    })
  }
  
  // 设置缓存并通知
  static setAndNotify(key: string, value: any, expire?: number) {
    localCache.set(key, value, expire)
    
    // 通知当前页面的监听器
    const callbacks = this.listeners.get(key) || []
    callbacks.forEach(callback => callback(value))
  }
}

// 使用示例
CacheSync.listen('theme', (newTheme) => {
  console.log('主题已在其他标签页中更改为:', newTheme)
  applyTheme(newTheme)
})
```

### 缓存压缩

```typescript
// 大数据缓存压缩（概念示例）
class CompressedCache {
  // 压缩存储
  static setCompressed(key: string, data: any, expire?: number) {
    try {
      const jsonStr = JSON.stringify(data)
      
      // 简单压缩：移除多余空格
      const compressed = jsonStr.replace(/\s+/g, ' ')
      
      localCache.set(`compressed_${key}`, compressed, expire)
      
      console.log(`压缩率: ${((1 - compressed.length / jsonStr.length) * 100).toFixed(1)}%`)
    } catch (error) {
      console.error('压缩存储失败:', error)
    }
  }
  
  // 解压获取
  static getCompressed<T>(key: string): T | null {
    try {
      const compressed = localCache.get<string>(`compressed_${key}`)
      if (compressed) {
        return JSON.parse(compressed)
      }
      return null
    } catch (error) {
      console.error('解压获取失败:', error)
      return null
    }
  }
}
```

## 性能监控

### 缓存性能分析

```typescript
class CachePerformance {
  private static hitCount = 0
  private static missCount = 0
  
  // 记录缓存命中
  static recordHit() {
    this.hitCount++
  }
  
  // 记录缓存未命中
  static recordMiss() {
    this.missCount++
  }
  
  // 获取命中率
  static getHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? (this.hitCount / total) * 100 : 0
  }
  
  // 重置统计
  static resetStats() {
    this.hitCount = 0
    this.missCount = 0
  }
  
  // 输出性能报告
  static getReport() {
    const total = this.hitCount + this.missCount
    const hitRate = this.getHitRate()
    
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalRequests: total,
      hitRate: hitRate.toFixed(2) + '%'
    }
  }
}

// 集成到缓存操作中
const enhancedGet = <T>(key: string): T | null => {
  const value = localCache.get<T>(key)
  
  if (value !== null) {
    CachePerformance.recordHit()
  } else {
    CachePerformance.recordMiss()
  }
  
  return value
}
```

## 注意事项

### 1. 存储限制
- **容量限制**：localStorage通常有5-10MB的限制
- **监控使用量**：定期检查 `getStats()` 返回的使用情况
- **清理策略**：及时清理不需要的缓存数据

### 2. 数据安全
- **敏感数据**：不要在缓存中存储密码等敏感信息
- **加密存储**：敏感数据应先加密再存储
- **清理机制**：登出时要清理相关缓存

### 3. 浏览器兼容性
- **兼容性检查**：在不支持localStorage的环境中会静默失败
- **异常处理**：存储空间不足时会抛出异常
- **隐私模式**：某些浏览器隐私模式下localStorage可能不可用

### 4. 性能考虑
- **JSON序列化**：大对象的序列化/反序列化会影响性能
- **频繁操作**：避免频繁的存储操作
- **数据大小**：单个存储项不宜过大

## 常见问题

### 1. 缓存数据丢失

**问题描述：**

在某些情况下，存储的缓存数据会意外丢失。

**可能原因：**
- 用户清除了浏览器数据
- 隐私模式下 localStorage 不持久化
- 缓存设置了过期时间已到期
- 存储空间已满导致写入失败

**解决方案：**

```typescript
// 检查缓存是否可用
const isCacheAvailable = (): boolean => {
  try {
    const testKey = '__cache_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// 使用前检查
if (!isCacheAvailable()) {
  console.warn('本地存储不可用，将使用内存缓存')
  // 降级到内存缓存
}
```

### 2. 跨域缓存隔离

**问题描述：**

不同子域名之间无法共享 localStorage 缓存数据。

**解决方案：**

```typescript
// 使用 postMessage 跨域通信
window.parent.postMessage({
  type: 'CACHE_SYNC',
  key: 'sharedData',
  value: data
}, 'https://parent-domain.com')
```

### 3. JSON 解析失败

**问题描述：**

获取缓存数据时 JSON.parse 抛出异常。

**解决方案：**

```typescript
// 安全的 JSON 解析
const safeGetJSON = <T>(key: string, fallback: T): T => {
  try {
    const value = localCache.getJSON<T>(key)
    return value ?? fallback
  } catch {
    localCache.remove(key) // 清除损坏的数据
    return fallback
  }
}
```
