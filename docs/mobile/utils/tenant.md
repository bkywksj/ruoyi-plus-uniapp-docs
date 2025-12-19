# tenant 多租户工具

## 介绍

`tenant` 是多租户管理工具，提供租户 ID 的获取、存储和验证功能。该工具支持从多种来源获取租户 ID，包括 URL 参数、App 启动参数和本地存储，适配 UniApp 多端运行环境。

**核心特性:**

- **多来源获取** - 支持从 URL、启动参数、本地存储获取租户 ID
- **平台适配** - 针对 H5、App 等不同平台的特殊处理
- **持久化存储** - 租户 ID 自动持久化到本地存储
- **请求头集成** - 提供获取租户请求头的便捷方法
- **默认值支持** - 未设置时使用默认租户 ID
- **条件编译** - 使用 UniApp 条件编译处理平台差异
- **安全验证** - 提供租户 ID 格式验证功能

## 架构图解

### 多租户数据隔离模型

```
┌─────────────────────────────────────────────────────────────────┐
│                        多租户架构                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   租户A (100001)        租户B (100002)        租户C (100003)    │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│   │ 用户数据     │      │ 用户数据     │      │ 用户数据     │    │
│   │ 业务数据     │      │ 业务数据     │      │ 业务数据     │    │
│   │ 配置数据     │      │ 配置数据     │      │ 配置数据     │    │
│   └─────────────┘      └─────────────┘      └─────────────┘    │
│          │                    │                    │            │
│          └────────────────────┼────────────────────┘            │
│                               │                                 │
│                               ▼                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      API 网关                            │   │
│   │              X-Tenant-Id: 请求头识别                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    共享数据库                            │   │
│   │           tenant_id 字段隔离各租户数据                    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 租户 ID 获取流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     getTenantId() 执行流程                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   开始                                                          │
│    │                                                            │
│    ▼                                                            │
│   ┌─────────────────┐                                           │
│   │ 检查本地存储     │                                           │
│   │ cache.get()     │                                           │
│   └────────┬────────┘                                           │
│            │                                                    │
│       有值? ├──── 是 ────▶ 返回存储的租户 ID                      │
│            │                                                    │
│            ▼ 否                                                  │
│   ┌─────────────────┐                                           │
│   │ H5: 检查 URL    │  ←── #ifdef H5                            │
│   │ 参数 tenantId   │                                           │
│   └────────┬────────┘                                           │
│            │                                                    │
│       有值? ├──── 是 ────▶ 存储并返回 URL 租户 ID                 │
│            │                                                    │
│            ▼ 否                                                  │
│   ┌─────────────────┐                                           │
│   │ App: 检查启动   │  ←── #ifdef APP-PLUS                      │
│   │ 参数            │                                           │
│   └────────┬────────┘                                           │
│            │                                                    │
│       有值? ├──── 是 ────▶ 存储并返回 App 租户 ID                 │
│            │                                                    │
│            ▼ 否                                                  │
│   ┌─────────────────┐                                           │
│   │ 返回默认值       │                                           │
│   │ '000000'        │                                           │
│   └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 请求头注入流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   发起请求    │────▶│  请求拦截器   │────▶│   API 服务    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ getTenantId  │
                     │ 获取租户 ID  │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ isValidTenantId │
                     │ 验证有效性    │
                     └──────────────┘
                            │
                     有效? ──┼──── 是 ────▶ 添加 X-Tenant-Id 头
                            │
                            ▼ 否
                     ┌──────────────┐
                     │ 不添加请求头  │
                     │ 使用默认租户  │
                     └──────────────┘
```

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
1. 优先从本地存储获取（已持久化的租户 ID）
2. H5 平台：从 URL 参数获取
3. App 平台：从启动参数获取
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

// 从接口响应中设置租户
const initTenant = async () => {
  const res = await api.getTenantByAppid(appid)
  if (res.data) {
    setTenantId(res.data)
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

// 切换租户前清除
const switchTenant = (newTenantId: string) => {
  clearTenantId()
  setTenantId(newTenantId)
}
```

### 验证租户 ID

使用 `isValidTenantId` 验证租户 ID 格式：

```typescript
import { isValidTenantId, getTenantId, DEFAULT_TENANT_ID } from '@/utils/tenant'

// 验证租户 ID
console.log(isValidTenantId('100001'))  // true - 有效的租户 ID
console.log(isValidTenantId(''))        // false - 空字符串
console.log(isValidTenantId(null))      // false - null 值
console.log(isValidTenantId('000000'))  // false - 默认值被视为无效

// 验证当前租户
const currentTenantId = getTenantId()
if (isValidTenantId(currentTenantId)) {
  console.log('已设置有效租户')
} else {
  console.log('使用默认租户')
}

// 在业务逻辑中使用
const requireValidTenant = () => {
  if (!isValidTenantId()) {
    uni.showToast({ title: '请先选择租户', icon: 'none' })
    return false
  }
  return true
}
```

## 请求头集成

### 获取租户请求头

使用 `getTenantHeaders` 获取包含租户信息的请求头：

```typescript
import { getTenantHeaders, isValidTenantId } from '@/utils/tenant'

// 获取租户请求头
const headers = getTenantHeaders()
console.log(headers)
// 有效租户: { 'X-Tenant-Id': '100001' }
// 默认租户: {} (空对象)

// 注意：只有有效租户才会返回请求头
// 默认租户 '000000' 不会添加请求头
```

### 在请求拦截器中使用

```typescript
import { getTenantHeaders } from '@/utils/tenant'

// 请求拦截器配置
const requestInterceptor = (config) => {
  // 添加租户请求头
  const tenantHeaders = getTenantHeaders()
  config.headers = {
    ...config.headers,
    ...tenantHeaders
  }
  return config
}

// 使用 useHttp 组合式函数
import { useHttp } from '@/composables/useHttp'

const http = useHttp({
  beforeRequest: (config) => {
    // 自动添加租户请求头
    Object.assign(config.headers, getTenantHeaders())
    return config
  }
})
```

### 完整请求封装示例

```typescript
import { getTenantId, getTenantHeaders, isValidTenantId } from '@/utils/tenant'

// 创建请求实例
const createRequest = () => {
  return {
    baseURL: import.meta.env.VITE_API_BASE_URL,

    // 请求前处理
    beforeRequest: (config) => {
      // 1. 添加租户请求头
      const tenantHeaders = getTenantHeaders()
      config.headers = {
        ...config.headers,
        ...tenantHeaders
      }

      // 2. 某些接口需要在参数中携带租户 ID
      if (config.requireTenantInParams) {
        const tenantId = getTenantId()
        if (config.method === 'GET') {
          config.params = { ...config.params, tenantId }
        } else {
          config.data = { ...config.data, tenantId }
        }
      }

      return config
    },

    // 响应处理
    afterResponse: (response) => {
      // 检查租户权限错误
      if (response.code === 403 && response.msg?.includes('租户')) {
        uni.showToast({ title: '租户权限不足', icon: 'none' })
        // 可能需要重新选择租户
      }
      return response
    }
  }
}
```

## 平台特定获取

### H5 从 URL 获取

在 H5 平台，可以从 URL 参数中获取租户 ID：

```typescript
// URL 示例:
// https://example.com/app?tenantId=100001
// https://example.com/app?redirect=%2Fpages%2Fhome%3FtenantId%3D100001

// 内部实现(条件编译)
// #ifdef H5
const getTenantIdFromUrl = (): string | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search)

    // 直接获取 tenantId 参数
    let tenantId = urlParams.get('tenantId')
    if (tenantId) {
      return tenantId
    }

    // 检查 redirect 参数中是否包含 tenantId
    const redirect = urlParams.get('redirect')
    if (redirect) {
      const decodedRedirect = decodeURIComponent(redirect)
      const [_, query] = decodedRedirect.split('?')
      if (query) {
        const redirectParams = new URLSearchParams(query)
        tenantId = redirectParams.get('tenantId')
        if (tenantId) {
          return tenantId
        }
      }
    }

    return null
  } catch (error) {
    console.warn('从URL获取租户ID失败:', error)
    return null
  }
}
// #endif
```

**支持的 URL 格式：**

| 格式 | 示例 |
|------|------|
| 直接参数 | `?tenantId=100001` |
| 嵌套在 redirect | `?redirect=%2Fpages%2Fhome%3FtenantId%3D100001` |

### App 从启动参数获取

在 App 平台，可以从应用启动参数中获取租户 ID：

```typescript
// 内部实现(条件编译)
// #ifdef APP-PLUS
const getTenantIdFromApp = (): string | null => {
  try {
    // 1. 从启动参数获取
    // 通过 plus.runtime.arguments 获取
    // 格式: tenantId=100001&other=value

    // 2. 从推送消息 payload 获取
    // 推送服务返回的 extra 数据

    // 3. 从自定义 URL Scheme 获取
    // myapp://open?tenantId=100001

    return null
  } catch (error) {
    console.warn('从App启动参数获取租户ID失败:', error)
    return null
  }
}
// #endif
```

**场景示例：**

| 场景 | 说明 |
|------|------|
| 推送消息 | 点击通知打开 App，携带租户参数 |
| URL Scheme | 从外部链接唤起 App，协议携带租户参数 |
| 分享链接 | 从分享链接打开 App |
| 扫码 | 扫描二维码打开 App，URL 携带租户参数 |

### 小程序场景

在小程序平台，租户 ID 通常通过以下方式获取：

```typescript
// 从场景值获取
onLaunch((options) => {
  // 扫码进入
  if (options.scene === 1011 || options.scene === 1012) {
    const query = options.query
    if (query.tenantId) {
      setTenantId(query.tenantId)
    }
  }

  // 分享进入
  if (options.scene === 1007 || options.scene === 1008) {
    const query = options.query
    if (query.tenantId) {
      setTenantId(query.tenantId)
    }
  }
})

// 通过 appid 获取租户 ID
const initTenantByAppid = async () => {
  // 不同租户使用不同的小程序
  // 通过 appid 反查租户 ID
  const appid = uni.getAccountInfoSync().miniProgram.appId
  const res = await api.getTenantIdByAppid(appid)
  if (res.data) {
    setTenantId(res.data)
  }
}
```

## 应用初始化集成

### 与 useAppInit 集成

```typescript
// composables/useAppInit.ts
import { getTenantIdByAppid } from '@/api/app/home/homeApi'
import { cache } from '@/utils/cache'
import { TENANT_STORAGE_KEY } from '@/utils/tenant'
import { isMp, isWechatOfficialH5, isAlipayOfficialH5 } from '@/utils/platform'

export const useAppInit = () => {
  const initializeApp = async (): Promise<void> => {
    // 需要初始化租户的平台
    if (isWechatOfficialH5 || isAlipayOfficialH5 || isMp) {
      const userStore = useUserStore()

      // 获取当前平台的 appid
      const appid = userStore.getCurrentPlatformAppid()

      // 通过 appid 获取租户 ID
      const [err, data] = await getTenantIdByAppid(appid)

      if (!err && data) {
        cache.set(TENANT_STORAGE_KEY, data)
        console.log('租户ID获取成功:', data)
      } else {
        console.error('获取租户ID失败:', err?.message)
        throw new Error('获取租户ID失败')
      }
    }
  }

  return { initializeApp }
}
```

### App.vue 中初始化

```vue
<script lang="ts" setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { getTenantId, setTenantId } from '@/utils/tenant'
import { isH5, isApp } from '@/utils/platform'

onLaunch(() => {
  initTenant()
})

// 初始化租户
const initTenant = async () => {
  // H5 从 URL 获取
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  const urlTenantId = urlParams.get('tenantId')
  if (urlTenantId) {
    setTenantId(urlTenantId)
    console.log('H5 从 URL 获取租户:', urlTenantId)
    return
  }
  // #endif

  // 小程序通过 appid 获取
  // #ifdef MP
  try {
    const appid = uni.getAccountInfoSync().miniProgram.appId
    const res = await api.getTenantIdByAppid(appid)
    if (res.data) {
      setTenantId(res.data)
      console.log('小程序获取租户:', res.data)
    }
  } catch (error) {
    console.error('获取租户失败:', error)
  }
  // #endif

  console.log('当前租户 ID:', getTenantId())
}
</script>
```

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
  // 验证租户 ID（如果需要手动输入）
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
import { setTenantId, clearTenantId, getTenantId } from '@/utils/tenant'
import { cache } from '@/utils/cache'

// 切换租户
const switchTenant = async (newTenantId: string) => {
  const currentTenantId = getTenantId()

  // 相同租户无需切换
  if (currentTenantId === newTenantId) {
    return
  }

  // 确认切换
  const confirmed = await new Promise((resolve) => {
    uni.showModal({
      title: '切换租户',
      content: '切换租户将清除当前登录状态，确定继续？',
      success: (res) => resolve(res.confirm)
    })
  })

  if (!confirmed) return

  // 清除当前租户数据
  clearTenantId()

  // 清除用户缓存
  cache.clearAll()

  // 设置新租户
  setTenantId(newTenantId)

  // 跳转到登录页
  uni.reLaunch({ url: '/pages/login/index' })
}

// 租户选择列表
const tenantList = ref([
  { id: '100001', name: '总公司' },
  { id: '100002', name: '分公司A' },
  { id: '100003', name: '分公司B' }
])

const onTenantSelect = (tenant) => {
  switchTenant(tenant.id)
}
```

### 请求封装

```typescript
import { getTenantId, getTenantHeaders, isValidTenantId } from '@/utils/tenant'

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
    },

    // 响应后处理
    afterResponse: (response) => {
      // 检查租户相关错误
      if (response.code === 40001) {
        // 租户不存在
        uni.showModal({
          title: '提示',
          content: '租户不存在，请重新选择',
          showCancel: false,
          success: () => {
            uni.reLaunch({ url: '/pages/tenant/select' })
          }
        })
      }
      return response
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
    path: `/pages/index/index?tenantId=${tenantId}`,
    imageUrl: '/static/share.png'
  }
})

// 小程序分享到朋友圈
onShareTimeline(() => {
  const tenantId = getTenantId()
  return {
    title: '精彩应用分享',
    query: `tenantId=${tenantId}`
  }
})

// H5 分享
const shareToWechat = () => {
  const shareUrl = generateShareUrl('/pages/index/index')
  // 调用微信 JS-SDK 分享
  wx.updateAppMessageShareData({
    title: '分享标题',
    desc: '分享描述',
    link: shareUrl,
    imgUrl: 'https://example.com/share.png'
  })
}
```

### 多租户数据缓存

```typescript
import { getTenantId } from '@/utils/tenant'
import { cache } from '@/utils/cache'

// 带租户前缀的缓存 key
const getTenantCacheKey = (key: string): string => {
  const tenantId = getTenantId()
  return `${tenantId}:${key}`
}

// 租户隔离的缓存操作
const tenantCache = {
  get: (key: string) => {
    return cache.get(getTenantCacheKey(key))
  },

  set: (key: string, value: any, expire?: number) => {
    return cache.set(getTenantCacheKey(key), value, expire)
  },

  remove: (key: string) => {
    return cache.remove(getTenantCacheKey(key))
  },

  // 清除当前租户所有缓存
  clearTenant: () => {
    const tenantId = getTenantId()
    const allKeys = cache.getAllKeys()
    allKeys.forEach(key => {
      if (key.startsWith(`${tenantId}:`)) {
        cache.remove(key)
      }
    })
  }
}

// 使用示例
tenantCache.set('userInfo', userInfo)
const cachedUser = tenantCache.get('userInfo')
```

## API

### 常量

| 常量 | 说明 | 值 |
|------|------|------|
| `TENANT_STORAGE_KEY` | 本地存储键名 | `'tenantId'` |
| `DEFAULT_TENANT_ID` | 默认租户 ID | `'000000'` |

### TENANT_CONFIG 对象

```typescript
export const TENANT_CONFIG = {
  STORAGE_KEY: TENANT_STORAGE_KEY,  // 'tenantId'
  DEFAULT_ID: DEFAULT_TENANT_ID,    // '000000'
} as const
```

### 函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `getTenantId` | 获取租户 ID | - | `string` |
| `setTenantId` | 设置租户 ID | `(id: string)` | `void` |
| `clearTenantId` | 清除租户 ID | - | `void` |
| `isValidTenantId` | 验证租户 ID | `(id?: string)` | `boolean` |
| `getTenantHeaders` | 获取租户请求头 | - | `Record<string, string>` |

### 类型定义

```typescript
/**
 * 租户存储键名
 */
export const TENANT_STORAGE_KEY = 'tenantId'

/**
 * 默认租户 ID
 * 表示未指定租户或公共租户
 */
export const DEFAULT_TENANT_ID = '000000'

/**
 * 租户请求头类型
 */
interface TenantHeaders {
  'X-Tenant-Id': string
}

/**
 * 获取当前租户 ID
 *
 * 获取优先级:
 * 1. 本地存储
 * 2. H5: URL 参数
 * 3. App: 启动参数
 * 4. 默认值 '000000'
 *
 * @returns 租户 ID 字符串
 */
export function getTenantId(): string

/**
 * 设置租户 ID
 * 会自动持久化到本地存储
 *
 * @param id - 租户 ID，会自动 trim 处理
 */
export function setTenantId(id: string): void

/**
 * 清除租户 ID
 * 从本地存储中移除
 */
export function clearTenantId(): void

/**
 * 验证租户 ID 是否有效
 *
 * 有效条件:
 * - 非空字符串
 * - trim 后非空
 * - 不等于默认值 '000000'
 *
 * @param id - 待验证的租户 ID，不传则验证当前租户
 * @returns 是否有效
 */
export function isValidTenantId(id?: string): boolean

/**
 * 获取租户请求头对象
 *
 * 只有有效租户才返回请求头
 * 默认租户返回空对象
 *
 * @returns 包含 X-Tenant-Id 的对象或空对象
 */
export function getTenantHeaders(): Record<string, string>

/**
 * 租户配置常量对象
 */
export const TENANT_CONFIG: {
  readonly STORAGE_KEY: string
  readonly DEFAULT_ID: string
}
```

## 源码实现

### 核心函数实现

```typescript
// utils/tenant.ts

import { cache } from '@/utils/cache'

export const TENANT_STORAGE_KEY = 'tenantId'
export const DEFAULT_TENANT_ID = '000000'

/**
 * 设置租户ID
 * 自动 trim 处理，空值不存储
 */
export const setTenantId = (tenantId: string): void => {
  if (tenantId && tenantId.trim()) {
    cache.set(TENANT_STORAGE_KEY, tenantId.trim())
  }
}

/**
 * 清除租户ID
 */
export const clearTenantId = (): void => {
  cache.remove(TENANT_STORAGE_KEY)
}

/**
 * 获取当前租户ID
 * 按优先级从多个来源获取
 */
export const getTenantId = (): string => {
  // 1. 优先从本地存储获取
  let tenantId = cache.get(TENANT_STORAGE_KEY)
  if (tenantId) {
    return tenantId
  }

  // 2. H5环境下从URL参数获取
  // #ifdef H5
  tenantId = getTenantIdFromUrl()
  if (tenantId) {
    setTenantId(tenantId)
    return tenantId
  }
  // #endif

  // 3. App环境下从启动参数获取
  // #ifdef APP-PLUS
  tenantId = getTenantIdFromApp()
  if (tenantId) {
    setTenantId(tenantId)
    return tenantId
  }
  // #endif

  // 4. 返回默认租户ID
  return DEFAULT_TENANT_ID
}

/**
 * 检查是否是有效的租户ID
 * 默认租户被视为无效(需要用户选择具体租户)
 */
export const isValidTenantId = (tenantId?: string): boolean => {
  const id = tenantId || getTenantId()
  return !!(id && id.trim() && id !== DEFAULT_TENANT_ID)
}

/**
 * 获取租户相关的请求头
 * 只有有效租户才添加请求头
 */
export const getTenantHeaders = (): Record<string, string> => {
  const tenantId = getTenantId()
  return isValidTenantId(tenantId) ? { 'X-Tenant-Id': tenantId } : {}
}
```

### 平台特定实现

```typescript
// H5 平台: 从 URL 获取租户 ID
// #ifdef H5
const getTenantIdFromUrl = (): string | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search)

    // 直接获取 tenantId 参数
    let tenantId = urlParams.get('tenantId')
    if (tenantId) {
      return tenantId
    }

    // 检查 redirect 参数中是否包含 tenantId
    // 用于 OAuth 回调等场景
    const redirect = urlParams.get('redirect')
    if (redirect) {
      const decodedRedirect = decodeURIComponent(redirect)
      const [_, query] = decodedRedirect.split('?')
      if (query) {
        const redirectParams = new URLSearchParams(query)
        tenantId = redirectParams.get('tenantId')
        if (tenantId) {
          return tenantId
        }
      }
    }

    return null
  } catch (error) {
    console.warn('从URL获取租户ID失败:', error)
    return null
  }
}
// #endif

// App 平台: 从启动参数获取租户 ID
// #ifdef APP-PLUS
const getTenantIdFromApp = (): string | null => {
  try {
    // 可扩展的获取方式:
    // 1. plus.runtime.arguments - 启动参数
    // 2. 推送消息 payload
    // 3. URL Scheme 参数
    return null
  } catch (error) {
    console.warn('从App启动参数获取租户ID失败:', error)
    return null
  }
}
// #endif
```

## 最佳实践

### 1. 应用启动时初始化

```typescript
// App.vue
import { getTenantId, setTenantId } from '@/utils/tenant'
import { isH5, isApp, isMp } from '@/utils/platform'

onLaunch(async (options) => {
  // 小程序: 从启动参数获取
  if (isMp && options.query?.tenantId) {
    setTenantId(options.query.tenantId)
  }

  // 如果没有租户 ID，尝试通过 appid 获取
  if (!isValidTenantId()) {
    await initTenantByAppid()
  }

  console.log('应用启动，当前租户:', getTenantId())
})

const initTenantByAppid = async () => {
  try {
    // #ifdef MP
    const appid = uni.getAccountInfoSync().miniProgram.appId
    // #endif
    // #ifdef H5
    const appid = import.meta.env.VITE_WECHAT_APPID
    // #endif

    const res = await api.getTenantIdByAppid(appid)
    if (res.data) {
      setTenantId(res.data)
    }
  } catch (error) {
    console.error('获取租户失败:', error)
  }
}
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
    if (!id || !id.trim()) {
      throw new Error('无效的租户 ID')
    }
    setTenantId(id)
  },

  // 清除租户
  clear: () => clearTenantId(),

  // 是否是默认租户
  isDefault: () => getTenantId() === DEFAULT_TENANT_ID,

  // 是否已设置有效租户
  isValid: () => isValidTenantId(),

  // 获取请求头
  getHeaders: () => getTenantHeaders(),

  // 验证
  validate: (id: any) => isValidTenantId(id),

  // 切换租户
  switch: async (newId: string) => {
    clearTenantId()
    setTenantId(newId)
    // 可以在这里添加切换后的初始化逻辑
  }
}
```

### 3. 与状态管理集成

```typescript
// stores/tenant.ts
import { defineStore } from 'pinia'
import { getTenantId, setTenantId, clearTenantId, isValidTenantId } from '@/utils/tenant'

interface TenantInfo {
  id: string
  name: string
  logo?: string
  domain?: string
}

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenantId: getTenantId(),
    tenantInfo: null as TenantInfo | null,
    loading: false
  }),

  getters: {
    // 是否已加载租户信息
    isLoaded: (state) => !!state.tenantInfo,

    // 是否是有效租户
    isValid: (state) => isValidTenantId(state.tenantId),

    // 租户名称
    tenantName: (state) => state.tenantInfo?.name || '默认租户'
  },

  actions: {
    // 设置租户 ID
    setTenantId(id: string) {
      this.tenantId = id
      setTenantId(id)
    },

    // 加载租户信息
    async loadTenantInfo() {
      if (!isValidTenantId(this.tenantId)) {
        return
      }

      this.loading = true
      try {
        const res = await api.getTenantInfo(this.tenantId)
        this.tenantInfo = res.data
      } catch (error) {
        console.error('加载租户信息失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 切换租户
    async switchTenant(id: string) {
      this.tenantId = id
      setTenantId(id)
      this.tenantInfo = null
      await this.loadTenantInfo()
    },

    // 清除租户
    clear() {
      this.tenantId = ''
      this.tenantInfo = null
      clearTenantId()
    }
  },

  persist: {
    // 持久化配置
    paths: ['tenantId']
  }
})
```

### 4. 路由守卫集成

```typescript
// router/guards.ts
import { getTenantId, isValidTenantId } from '@/utils/tenant'

// 需要租户的页面白名单
const tenantRequiredPages = [
  '/pages/order/list',
  '/pages/user/profile',
  '/pages/data/dashboard'
]

// 租户选择页面
const tenantSelectPage = '/pages/tenant/select'

// 页面跳转拦截
export const setupTenantGuard = () => {
  // 拦截页面跳转
  const originalNavigateTo = uni.navigateTo
  uni.navigateTo = (options) => {
    const url = options.url.split('?')[0]

    // 检查是否需要有效租户
    if (tenantRequiredPages.includes(url) && !isValidTenantId()) {
      uni.showToast({ title: '请先选择租户', icon: 'none' })
      return originalNavigateTo({
        url: tenantSelectPage
      })
    }

    return originalNavigateTo(options)
  }
}
```

### 5. 错误处理

```typescript
// 租户相关错误码
const TENANT_ERROR_CODES = {
  NOT_FOUND: 40001,      // 租户不存在
  EXPIRED: 40002,        // 租户已过期
  DISABLED: 40003,       // 租户已禁用
  NO_PERMISSION: 40004   // 无租户权限
}

// 响应拦截处理
const handleTenantError = (code: number, message: string) => {
  switch (code) {
    case TENANT_ERROR_CODES.NOT_FOUND:
      uni.showModal({
        title: '租户不存在',
        content: '该租户不存在，请重新选择',
        showCancel: false,
        success: () => {
          clearTenantId()
          uni.reLaunch({ url: '/pages/tenant/select' })
        }
      })
      break

    case TENANT_ERROR_CODES.EXPIRED:
      uni.showModal({
        title: '租户已过期',
        content: '该租户服务已过期，请联系管理员',
        showCancel: false
      })
      break

    case TENANT_ERROR_CODES.DISABLED:
      uni.showModal({
        title: '租户已禁用',
        content: '该租户已被禁用，请联系管理员',
        showCancel: false
      })
      break

    case TENANT_ERROR_CODES.NO_PERMISSION:
      uni.showToast({ title: '无权访问该租户', icon: 'none' })
      break

    default:
      uni.showToast({ title: message || '租户错误', icon: 'none' })
  }
}
```

## 常见问题

### 1. 租户 ID 获取不到？

**可能原因：**
- 未设置租户 ID
- URL 参数名称不匹配
- 本地存储被清除
- 条件编译问题

**解决方案：**

```typescript
// 调试：检查各来源
const debugTenant = () => {
  console.log('=== 租户调试信息 ===')

  // 检查本地存储
  const stored = uni.getStorageSync(TENANT_STORAGE_KEY)
  console.log('本地存储:', stored)

  // H5 检查 URL
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  console.log('URL tenantId:', urlParams.get('tenantId'))
  // #endif

  // 最终结果
  console.log('getTenantId():', getTenantId())
  console.log('isValidTenantId():', isValidTenantId())
}
```

### 2. 切换租户后数据未更新？

**原因：** 租户切换后需要重新加载数据

**解决方案：**

```typescript
const switchTenant = async (newTenantId: string) => {
  // 1. 设置新租户
  setTenantId(newTenantId)

  // 2. 清除所有缓存
  cache.clearAll()

  // 3. 重置状态管理
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  userStore.$reset()
  permissionStore.$reset()

  // 4. 重新登录或刷新数据
  await userStore.loadUserInfo()
  await permissionStore.loadPermissions()

  // 5. 刷新当前页面
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.$vm?.refresh) {
    currentPage.$vm.refresh()
  }
}
```

### 3. H5 刷新后租户 ID 丢失？

**原因：** URL 参数只在首次访问时存在

**解决方案：**

```typescript
// 首次获取到租户 ID 后立即存储
onMounted(() => {
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  const urlTenantId = urlParams.get('tenantId')
  if (urlTenantId) {
    setTenantId(urlTenantId) // 持久化到本地存储

    // 可选：清除 URL 中的参数
    const newUrl = window.location.pathname + window.location.hash
    window.history.replaceState({}, document.title, newUrl)
  }
  // #endif
})
```

### 4. 如何支持免租户模式？

```typescript
// 环境变量控制
const isMultiTenant = import.meta.env.VITE_MULTI_TENANT === 'true'

// 条件获取请求头
const getRequestHeaders = () => {
  const headers: Record<string, string> = {}

  // 添加 token
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 多租户模式才添加租户头
  if (isMultiTenant) {
    Object.assign(headers, getTenantHeaders())
  }

  return headers
}

// 条件验证租户
const validateTenant = () => {
  if (!isMultiTenant) {
    return true // 非多租户模式直接通过
  }
  return isValidTenantId()
}
```

### 5. 小程序如何获取租户 ID？

```typescript
// 方案1: 通过 appid 获取
const getTenantByAppid = async () => {
  const accountInfo = uni.getAccountInfoSync()
  const appid = accountInfo.miniProgram.appId

  const res = await api.getTenantIdByAppid(appid)
  if (res.data) {
    setTenantId(res.data)
  }
}

// 方案2: 从场景值获取
onLaunch((options) => {
  if (options.query?.tenantId) {
    setTenantId(options.query.tenantId)
  }
})

// 方案3: 从分享参数获取
onLoad((query) => {
  if (query.tenantId) {
    setTenantId(query.tenantId)
  }
})
```

### 6. 如何实现租户信息缓存？

```typescript
import { getTenantId } from '@/utils/tenant'

// 带租户隔离的缓存
const tenantCache = {
  _getKey(key: string): string {
    const tenantId = getTenantId()
    return `tenant:${tenantId}:${key}`
  },

  get<T>(key: string): T | null {
    return cache.get(this._getKey(key))
  },

  set(key: string, value: any, expire?: number): void {
    cache.set(this._getKey(key), value, expire)
  },

  remove(key: string): void {
    cache.remove(this._getKey(key))
  }
}

// 使用
tenantCache.set('userList', users, 3600)
const cachedUsers = tenantCache.get<User[]>('userList')
```

### 7. 多租户下如何处理 WebSocket？

```typescript
import { getTenantId } from '@/utils/tenant'
import { webSocket } from '@/composables/useWebSocket'

// WebSocket 连接时携带租户信息
const initWebSocket = () => {
  const tenantId = getTenantId()
  const wsUrl = `${WS_BASE_URL}?tenantId=${tenantId}`

  webSocket.initialize(wsUrl, {
    onConnected: () => {
      console.log('WebSocket 已连接，租户:', tenantId)
    }
  })
}

// 切换租户时重连
const onTenantSwitch = (newTenantId: string) => {
  setTenantId(newTenantId)

  // 断开并重连 WebSocket
  webSocket.disconnect()
  initWebSocket()
}
```

### 8. 如何处理租户过期？

```typescript
// 响应拦截器中处理
const handleResponse = (response) => {
  // 租户过期错误码
  if (response.code === 40002) {
    uni.showModal({
      title: '服务已过期',
      content: '您的租户服务已过期，请联系管理员续费',
      showCancel: false,
      confirmText: '我知道了'
    })

    // 可选：跳转到过期提示页
    // uni.reLaunch({ url: '/pages/error/tenant-expired' })

    return Promise.reject(new Error('租户已过期'))
  }

  return response
}
```

## 总结

多租户工具核心要点：

| 要点 | 说明 |
|------|------|
| **获取优先级** | 本地存储 → URL 参数(H5) → 启动参数(App) → 默认值 |
| **默认值** | `'000000'` 表示未指定租户 |
| **请求头** | 有效租户添加 `X-Tenant-Id` 请求头 |
| **验证逻辑** | 默认租户被视为无效，需要用户选择具体租户 |
| **持久化** | 设置租户后自动存储到本地 |
| **平台适配** | 使用条件编译处理 H5、App、小程序差异 |
| **状态同步** | 切换租户后需清除缓存并重新加载数据 |
| **错误处理** | 处理租户不存在、过期、禁用等错误 |
