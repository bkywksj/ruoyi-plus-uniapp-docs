# HTTP 请求封装

移动端HTTP请求封装，基于uni-app的网络API实现，提供统一的请求接口、拦截器、错误处理和数据加密功能。

## 📋 功能特性

- **统一封装**: 基于uni.request的Promise封装
- **请求拦截**: 自动添加token、租户信息等
- **响应拦截**: 统一处理响应数据和错误
- **数据加密**: 支持请求数据加密和响应解密
- **错误处理**: 统一的错误提示和处理机制
- **Loading管理**: 自动显示和隐藏加载状态
- **重试机制**: 网络失败自动重试

## 🎯 基础用法

### 简单请求

```typescript
import { http } from '@/utils/http'

// GET请求
const getUserInfo = (id: number) => {
  return http.get(`/api/user/${id}`)
}

// POST请求
const createUser = (data: CreateUserRequest) => {
  return http.post('/api/user', data)
}

// PUT请求
const updateUser = (id: number, data: UpdateUserRequest) => {
  return http.put(`/api/user/${id}`, data)
}

// DELETE请求
const deleteUser = (id: number) => {
  return http.delete(`/api/user/${id}`)
}
```

### 带类型的请求

```typescript
import type { UserInfo, ApiResponse, PageResult } from '@/types'

// 单个数据
const getUserInfo = (id: number): Promise<UserInfo> => {
  return http.get<UserInfo>(`/api/user/${id}`)
}

// 分页数据
const getUserList = (params: {
  page: number
  size: number
  keyword?: string
}): Promise<PageResult<UserInfo>> => {
  return http.get<PageResult<UserInfo>>('/api/user/list', params)
}

// 无返回数据
const updateUserStatus = (id: number, status: string): Promise<void> => {
  return http.post<void>(`/api/user/${id}/status`, { status })
}
```

## ⚙️ 配置选项

### 全局配置

```typescript
// utils/http.ts
import { HttpConfig } from '@/types/http'

const config: HttpConfig = {
  // 基础URL
  baseURL: 'https://api.example.com',

  // 超时时间（毫秒）
  timeout: 10000,

  // 是否显示loading
  showLoading: true,

  // loading文本
  loadingText: '加载中...',

  // 是否显示错误提示
  showError: true,

  // 重试次数
  retryCount: 3,

  // 重试延迟（毫秒）
  retryDelay: 1000,

  // 是否加密请求
  encrypt: false,

  // 请求头
  headers: {
    'Content-Type': 'application/json'
  }
}
```

### 单次请求配置

```typescript
// 不显示loading
const getUserInfo = (id: number) => {
  return http.get(`/api/user/${id}`, {}, {
    showLoading: false
  })
}

// 自定义超时时间
const uploadFile = (file: File) => {
  return http.post('/api/upload', file, {
    timeout: 30000,
    loadingText: '上传中...'
  })
}

// 加密请求
const sensitiveOperation = (data: any) => {
  return http.post('/api/sensitive', data, {
    encrypt: true,
    showError: false
  })
}
```

## 🔧 拦截器

### 请求拦截器

```typescript
// utils/http.ts
class HttpClient {
  // 请求拦截器
  private beforeRequest(config: RequestConfig): RequestConfig {
    // 添加token
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    }

    // 添加租户信息
    const tenantId = uni.getStorageSync('tenantId')
    if (tenantId) {
      config.headers = {
        ...config.headers,
        'Tenant-Id': tenantId
      }
    }

    // 添加设备信息
    const systemInfo = uni.getSystemInfoSync()
    config.headers = {
      ...config.headers,
      'Client-Platform': systemInfo.platform,
      'Client-Version': systemInfo.version
    }

    // 数据加密
    if (config.encrypt && config.data) {
      config.data = this.encryptData(config.data)
      config.headers['Content-Encryption'] = 'true'
    }

    console.log('请求配置:', config)
    return config
  }

  // 数据加密
  private encryptData(data: any): string {
    // 使用AES加密
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      'your-secret-key'
    ).toString()
  }
}
```

### 响应拦截器

```typescript
class HttpClient {
  // 响应拦截器
  private afterResponse(response: any, config: RequestConfig): any {
    console.log('响应数据:', response)

    // 数据解密
    if (response.header['content-encryption'] === 'true') {
      response.data = this.decryptData(response.data)
    }

    // 统一响应格式处理
    const { code, data, message } = response.data

    // 成功响应
    if (code === 200) {
      return data
    }

    // 业务错误
    if (code === 401) {
      this.handleUnauthorized()
      throw new Error('未授权访问')
    }

    if (code === 403) {
      this.handleForbidden()
      throw new Error('访问被拒绝')
    }

    // 其他错误
    throw new Error(message || '请求失败')
  }

  // 数据解密
  private decryptData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'your-secret-key')
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  }

  // 处理未授权
  private handleUnauthorized(): void {
    // 清除token
    uni.removeStorageSync('token')

    // 跳转登录页
    uni.navigateTo({
      url: '/pages/auth/login'
    })

    uni.showToast({
      title: '请重新登录',
      icon: 'none'
    })
  }

  // 处理禁止访问
  private handleForbidden(): void {
    uni.showToast({
      title: '没有访问权限',
      icon: 'none'
    })
  }
}
```

## 🚨 错误处理

### 网络错误处理

```typescript
class HttpClient {
  // 错误处理
  private handleError(error: any, config: RequestConfig): void {
    console.error('请求错误:', error)

    let errorMessage = '网络异常，请检查网络连接'

    // 网络错误类型判断
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        errorMessage = '请求超时，请重试'
      } else if (error.errMsg.includes('fail')) {
        errorMessage = '网络连接失败'
      }
    }

    // HTTP状态码错误
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权访问'
          break
        case 403:
          errorMessage = '访问被拒绝'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        default:
          errorMessage = `请求失败(${error.statusCode})`
      }
    }

    // 显示错误提示
    if (config.showError !== false) {
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    }

    // 错误上报
    this.reportError(error, config)
  }

  // 错误上报
  private reportError(error: any, config: RequestConfig): void {
    // 上报到错误监控系统
    const errorInfo = {
      url: config.url,
      method: config.method,
      error: error.message || error.errMsg,
      statusCode: error.statusCode,
      timestamp: Date.now()
    }

    console.log('错误上报:', errorInfo)
    // 实际项目中可以上报到Sentry等错误监控平台
  }
}
```

### 重试机制

```typescript
class HttpClient {
  // 请求重试
  private async requestWithRetry(
    config: RequestConfig,
    retryCount = 0
  ): Promise<any> {
    try {
      return await this.makeRequest(config)
    } catch (error) {
      // 判断是否需要重试
      if (this.shouldRetry(error, retryCount, config)) {
        console.log(`请求失败，第${retryCount + 1}次重试`)

        // 延迟重试
        await this.delay(config.retryDelay || 1000)

        return this.requestWithRetry(config, retryCount + 1)
      }

      throw error
    }
  }

  // 判断是否应该重试
  private shouldRetry(
    error: any,
    retryCount: number,
    config: RequestConfig
  ): boolean {
    // 超过重试次数
    if (retryCount >= (config.retryCount || 3)) {
      return false
    }

    // 网络错误或超时错误可以重试
    if (error.errMsg?.includes('timeout') ||
        error.errMsg?.includes('fail')) {
      return true
    }

    // 5xx错误可以重试
    if (error.statusCode >= 500) {
      return true
    }

    return false
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

## 📱 移动端适配

### 网络状态检测

```typescript
class HttpClient {
  // 检查网络状态
  private checkNetworkStatus(): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            uni.showToast({
              title: '网络不可用',
              icon: 'none'
            })
            reject(new Error('网络不可用'))
          } else {
            resolve()
          }
        },
        fail: () => {
          reject(new Error('获取网络状态失败'))
        }
      })
    })
  }

  // 监听网络状态变化
  private setupNetworkListener(): void {
    uni.onNetworkStatusChange((res) => {
      if (!res.isConnected) {
        uni.showToast({
          title: '网络连接已断开',
          icon: 'none'
        })
      } else {
        console.log('网络已恢复:', res.networkType)
      }
    })
  }
}
```

### 请求队列管理

```typescript
class HttpClient {
  private requestQueue: Map<string, Promise<any>> = new Map()

  // 防重复请求
  private deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // 如果已有相同请求在进行中，返回该请求的Promise
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!
    }

    // 创建新请求
    const promise = requestFn()

    // 加入队列
    this.requestQueue.set(key, promise)

    // 请求完成后从队列中移除
    promise.finally(() => {
      this.requestQueue.delete(key)
    })

    return promise
  }

  // 生成请求key
  private generateRequestKey(config: RequestConfig): string {
    const { method, url, data } = config
    return `${method}:${url}:${JSON.stringify(data || {})}`
  }
}
```

## 🔐 数据加密

### AES加密实现

```typescript
import CryptoJS from 'crypto-js'

class HttpEncryption {
  private readonly secretKey = 'your-aes-secret-key'
  private readonly iv = CryptoJS.enc.Utf8.parse('your-iv-string')

  // 加密数据
  encrypt(data: any): string {
    const jsonStr = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonStr, this.secretKey, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    return encrypted.toString()
  }

  // 解密数据
  decrypt(encryptedData: string): any {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8)
    return JSON.parse(jsonStr)
  }

  // 生成签名
  generateSignature(data: any, timestamp: number): string {
    const sortedKeys = Object.keys(data).sort()
    const signStr = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&') + `&timestamp=${timestamp}`

    return CryptoJS.MD5(signStr + this.secretKey).toString()
  }
}
```

## 📊 使用示例

### 实际业务场景

```vue
<template>
  <view class="user-list-page">
    <wd-search
      v-model="searchKeyword"
      @search="handleSearch"
      @clear="handleClear"
    />

    <wd-loadmore
      :state="loadState"
      @reload="loadUserList">

      <wd-cell-group>
        <wd-cell
          v-for="user in userList"
          :key="user.id"
          :title="user.name"
          :label="user.email"
          is-link
          @click="handleUserClick(user)"
        />
      </wd-cell-group>
    </wd-loadmore>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserList, deleteUser } from '@/api/user/userApi'
import type { UserInfo } from '@/types/user'

const userList = ref<UserInfo[]>([])
const searchKeyword = ref('')
const loadState = ref<'loading' | 'finished' | 'error'>('loading')

// 加载用户列表
const loadUserList = async () => {
  try {
    loadState.value = 'loading'

    const response = await getUserList({
      page: 1,
      size: 20,
      keyword: searchKeyword.value
    })

    userList.value = response.records
    loadState.value = 'finished'
  } catch (error) {
    console.error('加载失败:', error)
    loadState.value = 'error'
  }
}

// 搜索用户
const handleSearch = () => {
  loadUserList()
}

// 清空搜索
const handleClear = () => {
  searchKeyword.value = ''
  loadUserList()
}

// 用户点击
const handleUserClick = (user: UserInfo) => {
  uni.navigateTo({
    url: `/pages/user/detail?id=${user.id}`
  })
}

onMounted(() => {
  loadUserList()
})
</script>
```

### 文件上传

```typescript
// api/upload/uploadApi.ts
import { http } from '@/utils/http'

interface UploadResponse {
  url: string
  fileName: string
  fileSize: number
}

/**
 * 上传文件
 * @param filePath 文件路径
 * @param onProgress 上传进度回调
 */
export const uploadFile = (
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: `${http.baseURL}/api/upload`,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          resolve(data.data)
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })

    // 监听上传进度
    if (onProgress) {
      uploadTask.onProgressUpdate((res) => {
        onProgress(res.progress)
      })
    }
  })
}
```

## 📚 API参考

### HttpClient类

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| get | GET请求 | `(url, params?, config?)` | `` `Promise<T>` `` |
| post | POST请求 | `(url, data?, config?)` | `` `Promise<T>` `` |
| put | PUT请求 | `(url, data?, config?)` | `` `Promise<T>` `` |
| delete | DELETE请求 | `(url, config?)` | `` `Promise<T>` `` |
| upload | 文件上传 | `(url, filePath, config?)` | `` `Promise<T>` `` |
| download | 文件下载 | `(url, config?)` | `` `Promise<T>` `` |

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| baseURL | `string` | `''` | 基础URL |
| timeout | `number` | `10000` | 超时时间（毫秒） |
| showLoading | `boolean` | `true` | 是否显示loading |
| showError | `boolean` | `true` | 是否显示错误提示 |
| retryCount | `number` | `3` | 重试次数 |
| encrypt | `boolean` | `false` | 是否加密 |

## 🎯 最佳实践

1. **统一接口**: 所有API请求都通过http工具类
2. **类型安全**: 使用TypeScript定义接口参数和返回值
3. **错误处理**: 合理处理网络错误和业务错误
4. **性能优化**: 使用防重复请求和缓存机制
5. **安全性**: 敏感数据使用加密传输
6. **用户体验**: 提供loading状态和错误提示