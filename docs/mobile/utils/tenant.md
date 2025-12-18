# tenant 多租户工具

## 介绍

`tenant` 是多租户管理工具，提供租户 ID 的获取、存储和验证功能。该工具支持从多种来源获取租户 ID，包括 URL 参数、App 启动参数和本地存储，适配 UniApp 多端运行环境。

**核心特性:**

- **多来源获取** - 支持从 URL、启动参数、本地存储获取租户 ID
- **平台适配** - 针对 H5、App 等不同平台的特殊处理
- **持久化存储** - 租户 ID 自动持久化到本地存储
- **请求头集成** - 提供获取租户请求头的便捷方法
- **默认值支持** - 未设置时使用默认租户 ID

## 基本用法

### 获取租户 ID

使用 `getTenantId` 获取当前租户 ID：

```typescript
import { getTenantId } from '@/utils/tenant'

// 获取当前租户 ID
const tenantId = getTenantId()
console.log('当前租户:', tenantId) // '000000' 或具体租户 ID
```

**获取优先级：**
1. H5 平台优先从 URL 参数获取
2. App 平台优先从启动参数获取
3. 最后从本地存储获取
4. 都没有则返回默认值 `'000000'`

### 设置租户 ID

使用 `setTenantId` 设置并持久化租户 ID：

```typescript
import { setTenantId } from '@/utils/tenant'

// 设置租户 ID
setTenantId('100001')

// 登录成功后设置租户
const onLoginSuccess = (userInfo) => {
  if (userInfo.tenantId) {
    setTenantId(userInfo.tenantId)
  }
}
```

### 清除租户 ID

使用 `clearTenantId` 清除已存储的租户 ID：

```typescript
import { clearTenantId } from '@/utils/tenant'

// 退出登录时清除租户 ID
const logout = () => {
  clearTenantId()
  // 其他退出逻辑...
}
```

### 验证租户 ID

使用 `isValidTenantId` 验证租户 ID 格式：

```typescript
import { isValidTenantId } from '@/utils/tenant'

// 验证租户 ID
console.log(isValidTenantId('100001'))  // true
console.log(isValidTenantId(''))        // false
console.log(isValidTenantId(null))      // false
console.log(isValidTenantId('000000'))  // true（默认值也是有效的）
```

## 请求头集成

### 获取租户请求头

使用 `getTenantHeaders` 获取包含租户信息的请求头：

```typescript
import { getTenantHeaders } from '@/utils/tenant'

// 获取租户请求头
const headers = getTenantHeaders()
console.log(headers)
// { 'X-Tenant-Id': '100001' }
```

### 在请求拦截器中使用

```typescript
import { getTenantHeaders } from '@/utils/tenant'

// 请求拦截器
request.interceptors.request.use((config) => {
  // 添加租户请求头
  const tenantHeaders = getTenantHeaders()
  config.headers = {
    ...config.headers,
    ...tenantHeaders
  }
  return config
})
```

## 平台特定获取

### H5 从 URL 获取

在 H5 平台，可以从 URL 参数中获取租户 ID：

```typescript
import { getTenantIdFromUrl } from '@/utils/tenant'

// URL: https://example.com/app?tenantId=100001
const tenantId = getTenantIdFromUrl()
console.log(tenantId) // '100001'
```

**支持的 URL 参数名：**
- `tenantId`
- `tenant_id`
- `tenant`

### App 从启动参数获取

在 App 平台，可以从应用启动参数中获取租户 ID：

```typescript
import { getTenantIdFromApp } from '@/utils/tenant'

// 从 App 启动参数获取
const tenantId = getTenantIdFromApp()
if (tenantId) {
  console.log('启动参数中的租户 ID:', tenantId)
}
```

**场景示例：**
- 从推送消息打开 App，携带租户参数
- 从外部链接唤起 App，URL Scheme 携带租户参数
- 从分享链接打开 App

## 实际应用场景

### 多租户登录流程

```typescript
import { getTenantId, setTenantId, isValidTenantId } from '@/utils/tenant'

// 登录页面
const loginForm = reactive({
  tenantId: '',
  username: '',
  password: ''
})

onMounted(() => {
  // 初始化租户 ID
  loginForm.tenantId = getTenantId()
})

// 登录提交
const handleLogin = async () => {
  // 验证租户 ID
  if (!isValidTenantId(loginForm.tenantId)) {
    uni.showToast({ title: '请输入有效的租户ID', icon: 'none' })
    return
  }

  // 保存租户 ID
  setTenantId(loginForm.tenantId)

  // 调用登录接口
  const result = await login({
    tenantId: loginForm.tenantId,
    username: loginForm.username,
    password: loginForm.password
  })

  // 登录成功
  if (result.code === 200) {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
```

### 租户切换

```typescript
import { setTenantId, clearTenantId } from '@/utils/tenant'

// 切换租户
const switchTenant = async (newTenantId: string) => {
  // 清除当前租户数据
  clearTenantId()

  // 设置新租户
  setTenantId(newTenantId)

  // 清除用户缓存
  cache.clearAll()

  // 重新登录
  uni.reLaunch({ url: '/pages/login/index' })
}

// 租户选择列表
const tenantList = ref([
  { id: '100001', name: '总公司' },
  { id: '100002', name: '分公司A' },
  { id: '100003', name: '分公司B' }
])

const onTenantSelect = (tenant) => {
  uni.showModal({
    title: '切换租户',
    content: `确定切换到"${tenant.name}"吗？`,
    success: (res) => {
      if (res.confirm) {
        switchTenant(tenant.id)
      }
    }
  })
}
```

### 请求封装

```typescript
import { getTenantId, getTenantHeaders } from '@/utils/tenant'

// 创建请求实例
const createRequest = () => {
  const instance = {
    baseURL: import.meta.env.VITE_API_BASE_URL,

    // 请求前处理
    beforeRequest: (config) => {
      // 添加租户请求头
      config.headers = {
        ...config.headers,
        ...getTenantHeaders()
      }

      // 可选：在请求参数中也携带租户 ID
      if (config.method === 'GET') {
        config.params = {
          ...config.params,
          tenantId: getTenantId()
        }
      }

      return config
    }
  }

  return instance
}
```

### 分享链接携带租户

```typescript
import { getTenantId } from '@/utils/tenant'

// 生成分享链接
const generateShareUrl = (path: string) => {
  const tenantId = getTenantId()
  const baseUrl = 'https://example.com/app'

  // 拼接租户参数
  const url = `${baseUrl}${path}?tenantId=${tenantId}`

  return url
}

// 小程序分享
onShareAppMessage(() => {
  const tenantId = getTenantId()
  return {
    title: '邀请你使用',
    path: `/pages/index/index?tenantId=${tenantId}`
  }
})
```

## API

### 常量

| 常量 | 说明 | 值 |
|------|------|------|
| TENANT_STORAGE_KEY | 存储键名 | `'tenantId'` |
| DEFAULT_TENANT_ID | 默认租户 ID | `'000000'` |

### 函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getTenantId | 获取租户 ID | - | `string` |
| setTenantId | 设置租户 ID | `(id: string)` | `void` |
| clearTenantId | 清除租户 ID | - | `void` |
| isValidTenantId | 验证租户 ID | `(id: any)` | `boolean` |
| getTenantHeaders | 获取租户请求头 | - | `Record<string, string>` |
| getTenantIdFromUrl | 从 URL 获取（H5） | - | `string \| null` |
| getTenantIdFromApp | 从启动参数获取（App） | - | `string \| null` |

### 类型定义

```typescript
/**
 * 租户存储键名
 */
const TENANT_STORAGE_KEY = 'tenantId'

/**
 * 默认租户 ID
 */
const DEFAULT_TENANT_ID = '000000'

/**
 * 租户请求头
 */
interface TenantHeaders {
  'X-Tenant-Id': string
}

/**
 * 获取租户 ID
 * 按优先级从多个来源获取
 */
function getTenantId(): string

/**
 * 设置租户 ID
 * @param id 租户 ID
 */
function setTenantId(id: string): void

/**
 * 清除租户 ID
 */
function clearTenantId(): void

/**
 * 验证租户 ID 是否有效
 * @param id 待验证的值
 */
function isValidTenantId(id: any): boolean

/**
 * 获取租户请求头对象
 */
function getTenantHeaders(): TenantHeaders

/**
 * 从 URL 参数获取租户 ID（仅 H5）
 */
function getTenantIdFromUrl(): string | null

/**
 * 从 App 启动参数获取租户 ID（仅 App）
 */
function getTenantIdFromApp(): string | null
```

## 最佳实践

### 1. 应用启动时初始化

```typescript
// App.vue
import { getTenantId, setTenantId, getTenantIdFromUrl, getTenantIdFromApp } from '@/utils/tenant'
import { isH5, isApp } from '@/utils/platform'

onLaunch(() => {
  // H5 从 URL 获取租户 ID
  if (isH5) {
    const urlTenantId = getTenantIdFromUrl()
    if (urlTenantId) {
      setTenantId(urlTenantId)
    }
  }

  // App 从启动参数获取租户 ID
  if (isApp) {
    const appTenantId = getTenantIdFromApp()
    if (appTenantId) {
      setTenantId(appTenantId)
    }
  }

  console.log('当前租户 ID:', getTenantId())
})
```

### 2. 封装租户服务

```typescript
// services/tenantService.ts
import {
  getTenantId,
  setTenantId,
  clearTenantId,
  isValidTenantId,
  getTenantHeaders,
  DEFAULT_TENANT_ID
} from '@/utils/tenant'

export const tenantService = {
  // 获取当前租户
  getCurrent: () => getTenantId(),

  // 设置租户
  set: (id: string) => {
    if (!isValidTenantId(id)) {
      throw new Error('无效的租户 ID')
    }
    setTenantId(id)
  },

  // 清除租户
  clear: () => clearTenantId(),

  // 是否是默认租户
  isDefault: () => getTenantId() === DEFAULT_TENANT_ID,

  // 获取请求头
  getHeaders: () => getTenantHeaders(),

  // 验证
  validate: (id: any) => isValidTenantId(id)
}
```

### 3. 与状态管理集成

```typescript
// stores/tenant.ts
import { defineStore } from 'pinia'
import { getTenantId, setTenantId, clearTenantId } from '@/utils/tenant'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenantId: getTenantId(),
    tenantInfo: null as TenantInfo | null
  }),

  getters: {
    isLoaded: (state) => !!state.tenantInfo
  },

  actions: {
    // 设置租户 ID
    setTenantId(id: string) {
      this.tenantId = id
      setTenantId(id)
    },

    // 加载租户信息
    async loadTenantInfo() {
      const res = await api.getTenantInfo(this.tenantId)
      this.tenantInfo = res.data
    },

    // 清除租户
    clear() {
      this.tenantId = ''
      this.tenantInfo = null
      clearTenantId()
    }
  }
})
```

## 常见问题

### 1. 租户 ID 获取不到？

**可能原因：**
- 未设置租户 ID
- URL 参数名称不匹配
- 本地存储被清除

**解决方案：**
```typescript
// 检查各来源
console.log('URL 租户:', getTenantIdFromUrl())
console.log('App 租户:', getTenantIdFromApp())
console.log('存储租户:', uni.getStorageSync(TENANT_STORAGE_KEY))
console.log('最终租户:', getTenantId())
```

### 2. 切换租户后数据未更新？

**原因：** 租户切换后需要重新加载数据

**解决方案：**
```typescript
const switchTenant = async (newTenantId: string) => {
  setTenantId(newTenantId)

  // 清除所有缓存
  cache.clearAll()

  // 重新加载用户信息
  await userStore.loadUserInfo()

  // 重新加载权限
  await permissionStore.loadPermissions()

  // 刷新当前页面数据
  refreshPageData()
}
```

### 3. H5 刷新后租户 ID 丢失？

**原因：** URL 参数只在首次访问时存在

**解决方案：** 首次获取到租户 ID 后立即存储
```typescript
onMounted(() => {
  const urlTenantId = getTenantIdFromUrl()
  if (urlTenantId) {
    setTenantId(urlTenantId) // 持久化到本地存储
  }
})
```

### 4. 如何支持免租户模式？

```typescript
// 判断是否启用多租户
const isMultiTenant = import.meta.env.VITE_MULTI_TENANT === 'true'

// 获取请求头时判断
const getRequestHeaders = () => {
  const headers = {}

  if (isMultiTenant) {
    Object.assign(headers, getTenantHeaders())
  }

  return headers
}
```
