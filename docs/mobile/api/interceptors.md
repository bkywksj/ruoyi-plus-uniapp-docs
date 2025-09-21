# HTTP 拦截器

移动端应用的HTTP请求和响应拦截器，用于统一处理认证、错误处理、数据转换等逻辑。

## 📋 拦截器概览

### 拦截器类型

- **请求拦截器**: 在请求发送前进行处理
- **响应拦截器**: 在响应返回后进行处理
- **错误拦截器**: 专门处理请求和响应错误
- **数据拦截器**: 处理数据加密解密

## 🔧 请求拦截器

### 基础请求拦截

```typescript
// src/utils/request.ts
import { useUserStore } from '@/stores/user'

// 请求拦截器
uni.addInterceptor('request', {
  invoke(args) {
    // 添加基础URL
    if (!args.url.startsWith('http')) {
      args.url = import.meta.env.VITE_APP_BASE_API + args.url
    }

    // 添加请求头
    args.header = {
      'Content-Type': 'application/json',
      ...args.header
    }

    // 添加认证token
    const userStore = useUserStore()
    if (userStore.token) {
      args.header.Authorization = `Bearer ${userStore.token}`
    }

    // 添加设备信息
    const systemInfo = uni.getSystemInfoSync()
    args.header['X-Device-Type'] = systemInfo.platform
    args.header['X-App-Version'] = systemInfo.version
    args.header['X-Client-Type'] = 'mobile'

    // 请求日志
    console.log(`[HTTP Request] ${args.method || 'GET'} ${args.url}`, {
      header: args.header,
      data: args.data
    })

    return args
  },
  fail(err) {
    console.error('[HTTP Request Failed]', err)
    uni.showToast({
      title: '请求失败',
      icon: 'error'
    })
  }
})
```

### 高级请求处理

```typescript
// 请求ID生成器
let requestId = 0
const generateRequestId = () => `req_${Date.now()}_${++requestId}`

// 请求缓存
const requestCache = new Map<string, Promise<any>>()

// 请求去重
function deduplicateRequest(config: any) {
  const key = `${config.method}_${config.url}_${JSON.stringify(config.data)}`

  if (requestCache.has(key)) {
    return requestCache.get(key)
  }

  const request = new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success: resolve,
      fail: reject,
      complete: () => {
        requestCache.delete(key)
      }
    })
  })

  requestCache.set(key, request)
  return request
}

// 请求重试机制
function retryRequest(config: any, maxRetries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let retryCount = 0

    const makeRequest = () => {
      uni.request({
        ...config,
        success: resolve,
        fail: (err: any) => {
          if (retryCount < maxRetries && shouldRetry(err)) {
            retryCount++
            setTimeout(makeRequest, delay * retryCount)
          } else {
            reject(err)
          }
        }
      })
    }

    makeRequest()
  })
}

// 判断是否应该重试
function shouldRetry(error: any): boolean {
  // 网络错误或服务器错误重试
  return error.errMsg?.includes('request:fail') ||
         (error.statusCode >= 500 && error.statusCode < 600)
}
```

### 数据加密处理

```typescript
import { encrypt, decrypt } from '@/utils/crypto'

// 敏感数据加密
function encryptSensitiveData(data: any, config: any) {
  const sensitiveFields = ['password', 'idCard', 'phone', 'bankCard']

  if (config.encrypt && data) {
    const encryptedData = { ...data }

    sensitiveFields.forEach(field => {
      if (encryptedData[field]) {
        encryptedData[field] = encrypt(encryptedData[field])
      }
    })

    return encryptedData
  }

  return data
}

// 请求签名
function signRequest(config: any) {
  if (config.sign) {
    const timestamp = Date.now()
    const nonce = Math.random().toString(36).substr(2)
    const signature = generateSignature(config.data, timestamp, nonce)

    config.header['X-Timestamp'] = timestamp
    config.header['X-Nonce'] = nonce
    config.header['X-Signature'] = signature
  }

  return config
}

function generateSignature(data: any, timestamp: number, nonce: string): string {
  const params = { ...data, timestamp, nonce }
  const sortedKeys = Object.keys(params).sort()
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
  return encrypt(queryString) // 使用加密函数生成签名
}
```

## 📨 响应拦截器

### 基础响应拦截

```typescript
// 响应拦截器
uni.addInterceptor('request', {
  returnValue(args) {
    return new Promise((resolve, reject) => {
      // 原始请求
      const originalSuccess = args.success
      const originalFail = args.fail

      args.success = (res: any) => {
        // 响应日志
        console.log(`[HTTP Response] ${res.statusCode} ${args.url}`, res.data)

        // 统一错误处理
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 业务逻辑处理
          const result = handleBusinessLogic(res.data)
          if (originalSuccess) originalSuccess(result)
          resolve(result)
        } else {
          // HTTP错误处理
          const error = handleHttpError(res)
          if (originalFail) originalFail(error)
          reject(error)
        }
      }

      args.fail = (err: any) => {
        // 网络错误处理
        const error = handleNetworkError(err)
        if (originalFail) originalFail(error)
        reject(error)
      }

      // 执行原始请求
      uni.request(args)
    })
  }
})
```

### 业务逻辑处理

```typescript
// 统一业务逻辑处理
function handleBusinessLogic(data: any) {
  // 标准API响应格式
  if (data && typeof data === 'object' && 'code' in data) {
    const { code, msg, data: responseData } = data

    switch (code) {
      case 200:
        // 成功
        return responseData
      case 401:
        // 未授权，跳转登录
        handleUnauthorized()
        throw new Error(msg || '未授权访问')
      case 403:
        // 权限不足
        uni.showToast({
          title: msg || '权限不足',
          icon: 'error'
        })
        throw new Error(msg || '权限不足')
      case 500:
        // 服务器错误
        uni.showToast({
          title: '服务器繁忙，请稍后重试',
          icon: 'error'
        })
        throw new Error(msg || '服务器错误')
      default:
        // 其他业务错误
        uni.showToast({
          title: msg || '操作失败',
          icon: 'error'
        })
        throw new Error(msg || '操作失败')
    }
  }

  // 非标准格式直接返回
  return data
}

// 处理未授权
function handleUnauthorized() {
  const userStore = useUserStore()
  userStore.logout()

  // 跳转到登录页
  uni.reLaunch({
    url: '/pages/login/login'
  })
}
```

### 数据解密处理

```typescript
// 响应数据解密
function decryptResponseData(data: any, config: any) {
  if (config.decrypt && data) {
    try {
      // 解密敏感字段
      const sensitiveFields = ['phone', 'idCard', 'bankCard']
      const decryptedData = { ...data }

      sensitiveFields.forEach(field => {
        if (decryptedData[field] && typeof decryptedData[field] === 'string') {
          try {
            decryptedData[field] = decrypt(decryptedData[field])
          } catch (error) {
            console.warn(`解密字段 ${field} 失败:`, error)
          }
        }
      })

      return decryptedData
    } catch (error) {
      console.error('响应数据解密失败:', error)
      return data
    }
  }

  return data
}

// 数据格式转换
function transformResponseData(data: any, config: any) {
  if (config.transform && typeof config.transform === 'function') {
    return config.transform(data)
  }

  // 默认转换
  if (Array.isArray(data)) {
    return data.map(item => transformItem(item))
  } else if (data && typeof data === 'object') {
    return transformItem(data)
  }

  return data
}

function transformItem(item: any) {
  // 日期字段转换
  const dateFields = ['createTime', 'updateTime', 'startTime', 'endTime']
  dateFields.forEach(field => {
    if (item[field] && typeof item[field] === 'string') {
      item[field] = new Date(item[field])
    }
  })

  // 数字字段转换
  const numberFields = ['sort', 'status', 'id']
  numberFields.forEach(field => {
    if (item[field] && typeof item[field] === 'string' && !isNaN(Number(item[field]))) {
      item[field] = Number(item[field])
    }
  })

  return item
}
```

## ❌ 错误处理拦截器

### HTTP错误处理

```typescript
function handleHttpError(response: any) {
  const { statusCode, data } = response
  let message = '请求失败'

  switch (statusCode) {
    case 400:
      message = '请求参数错误'
      break
    case 401:
      message = '未授权访问'
      handleUnauthorized()
      break
    case 403:
      message = '权限不足'
      break
    case 404:
      message = '请求的资源不存在'
      break
    case 405:
      message = '请求方法不允许'
      break
    case 408:
      message = '请求超时'
      break
    case 429:
      message = '请求过于频繁'
      break
    case 500:
      message = '服务器内部错误'
      break
    case 502:
      message = '网关错误'
      break
    case 503:
      message = '服务不可用'
      break
    case 504:
      message = '网关超时'
      break
    default:
      message = data?.msg || `请求失败 (${statusCode})`
  }

  const error = new Error(message)
  Object.assign(error, { statusCode, data, type: 'HTTP_ERROR' })

  // 显示错误提示
  if (statusCode !== 401) { // 401错误已在handleUnauthorized中处理
    uni.showToast({
      title: message,
      icon: 'error'
    })
  }

  return error
}
```

### 网络错误处理

```typescript
function handleNetworkError(error: any) {
  let message = '网络连接失败'
  let type = 'NETWORK_ERROR'

  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      message = '请求超时，请检查网络连接'
      type = 'TIMEOUT_ERROR'
    } else if (error.errMsg.includes('fail')) {
      message = '网络连接失败，请检查网络设置'
      type = 'CONNECTION_ERROR'
    } else if (error.errMsg.includes('abort')) {
      message = '请求已取消'
      type = 'ABORT_ERROR'
    }
  }

  const networkError = new Error(message)
  Object.assign(networkError, { ...error, type })

  // 显示错误提示
  uni.showToast({
    title: message,
    icon: 'error'
  })

  return networkError
}

// 网络状态监听
function setupNetworkMonitor() {
  uni.onNetworkStatusChange((res) => {
    if (!res.isConnected) {
      uni.showToast({
        title: '网络连接已断开',
        icon: 'error'
      })
    } else {
      // 网络恢复时重试失败的请求
      retryFailedRequests()
    }
  })
}

// 重试失败的请求
const failedRequests: any[] = []

function retryFailedRequests() {
  failedRequests.forEach(request => {
    uni.request(request)
  })
  failedRequests.length = 0
}
```

## 🔄 请求取消机制

### 请求取消实现

```typescript
// 请求取消控制器
class RequestCancelController {
  private requestTasks = new Map<string, any>()

  // 创建可取消的请求
  createCancelableRequest(config: any) {
    const requestId = generateRequestId()

    const requestTask = uni.request({
      ...config,
      success: (res) => {
        this.requestTasks.delete(requestId)
        config.success?.(res)
      },
      fail: (err) => {
        this.requestTasks.delete(requestId)
        config.fail?.(err)
      }
    })

    this.requestTasks.set(requestId, requestTask)
    return { requestId, requestTask }
  }

  // 取消指定请求
  cancelRequest(requestId: string) {
    const requestTask = this.requestTasks.get(requestId)
    if (requestTask) {
      requestTask.abort()
      this.requestTasks.delete(requestId)
    }
  }

  // 取消所有请求
  cancelAllRequests() {
    this.requestTasks.forEach(requestTask => {
      requestTask.abort()
    })
    this.requestTasks.clear()
  }

  // 取消指定URL的请求
  cancelRequestsByUrl(url: string) {
    this.requestTasks.forEach((requestTask, requestId) => {
      if (requestTask.url === url) {
        requestTask.abort()
        this.requestTasks.delete(requestId)
      }
    })
  }
}

// 全局请求取消控制器
export const requestCancelController = new RequestCancelController()
```

### 页面级请求管理

```typescript
// 页面组合函数：自动管理页面请求
export function usePageRequests() {
  const controller = new RequestCancelController()

  // 页面卸载时取消所有请求
  onUnmounted(() => {
    controller.cancelAllRequests()
  })

  // 创建页面级请求
  const request = (config: any) => {
    return controller.createCancelableRequest(config)
  }

  // 手动取消请求
  const cancelRequest = (requestId: string) => {
    controller.cancelRequest(requestId)
  }

  // 取消所有请求
  const cancelAllRequests = () => {
    controller.cancelAllRequests()
  }

  return {
    request,
    cancelRequest,
    cancelAllRequests
  }
}

// 使用示例
export default defineComponent({
  setup() {
    const { request, cancelAllRequests } = usePageRequests()

    const fetchData = async () => {
      const { requestId } = request({
        url: '/api/data',
        success: (res) => {
          console.log('数据获取成功', res.data)
        }
      })
      return requestId
    }

    return {
      fetchData,
      cancelAllRequests
    }
  }
})
```

## 📊 请求监控和统计

### 请求性能监控

```typescript
// 请求性能监控
class RequestMonitor {
  private metrics = new Map<string, any>()

  startRequest(requestId: string, config: any) {
    this.metrics.set(requestId, {
      url: config.url,
      method: config.method || 'GET',
      startTime: Date.now(),
      size: this.calculateRequestSize(config.data)
    })
  }

  endRequest(requestId: string, response?: any, error?: any) {
    const metric = this.metrics.get(requestId)
    if (metric) {
      metric.endTime = Date.now()
      metric.duration = metric.endTime - metric.startTime
      metric.success = !error
      metric.statusCode = response?.statusCode
      metric.responseSize = this.calculateResponseSize(response?.data)

      // 记录到本地存储或发送到监控服务
      this.recordMetric(metric)
      this.metrics.delete(requestId)
    }
  }

  private calculateRequestSize(data: any): number {
    if (!data) return 0
    return new Blob([JSON.stringify(data)]).size
  }

  private calculateResponseSize(data: any): number {
    if (!data) return 0
    return new Blob([JSON.stringify(data)]).size
  }

  private recordMetric(metric: any) {
    // 保存到本地存储
    const metrics = uni.getStorageSync('request_metrics') || []
    metrics.push(metric)

    // 只保留最近100条记录
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100)
    }

    uni.setStorageSync('request_metrics', metrics)

    // 性能警告
    if (metric.duration > 5000) {
      console.warn(`慢请求警告: ${metric.url} 耗时 ${metric.duration}ms`)
    }
  }

  // 获取性能统计
  getPerformanceStats() {
    const metrics = uni.getStorageSync('request_metrics') || []

    return {
      totalRequests: metrics.length,
      successRate: metrics.filter((m: any) => m.success).length / metrics.length,
      averageDuration: metrics.reduce((sum: number, m: any) => sum + m.duration, 0) / metrics.length,
      slowRequests: metrics.filter((m: any) => m.duration > 3000),
      errorRequests: metrics.filter((m: any) => !m.success)
    }
  }
}

export const requestMonitor = new RequestMonitor()
```

### 使用示例

```typescript
// 在拦截器中集成监控
uni.addInterceptor('request', {
  invoke(args) {
    const requestId = generateRequestId()
    args.requestId = requestId

    // 开始监控
    requestMonitor.startRequest(requestId, args)

    return args
  },
  success(res, args) {
    // 结束监控
    requestMonitor.endRequest(args.requestId, res)
    return res
  },
  fail(err, args) {
    // 记录错误
    requestMonitor.endRequest(args.requestId, undefined, err)
    return err
  }
})

// 获取性能统计
const stats = requestMonitor.getPerformanceStats()
console.log('请求性能统计:', stats)
```

HTTP拦截器为移动端应用提供了统一的请求处理机制，确保了数据安全、错误处理和性能监控的一致性。