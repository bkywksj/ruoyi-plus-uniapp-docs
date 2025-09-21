# 接口配置

移动端API接口配置说明。

## 配置文件

### 环境配置 (env.js)

```javascript
// 开发环境
const development = {
  API_BASE_URL: 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_COUNT: 3
}

// 生产环境
const production = {
  API_BASE_URL: 'https://api.example.com',
  TIMEOUT: 10000,
  RETRY_COUNT: 3
}

// 导出配置
const config = process.env.NODE_ENV === 'production' ? production : development
export default config
```

### 请求配置 (request.js)

```javascript
import config from './env.js'

// 请求基础配置
const requestConfig = {
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
  header: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// 创建请求实例
const request = uni.createRequestTask(requestConfig)

export default request
```

## 拦截器配置

### 请求拦截器

```javascript
// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }

    // 添加租户ID
    const tenantId = uni.getStorageSync('tenantId')
    if (tenantId) {
      config.header['X-Tenant-Id'] = tenantId
    }

    // 显示加载状态
    uni.showLoading({
      title: '加载中...'
    })

    return config
  },
  (error) => {
    uni.hideLoading()
    return Promise.reject(error)
  }
)
```

### 响应拦截器

```javascript
// 响应拦截器
request.interceptors.response.use(
  (response) => {
    uni.hideLoading()

    const { code, message, data } = response.data

    // 成功响应
    if (code === 200) {
      return data
    }

    // token过期，跳转登录
    if (code === 401) {
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.reLaunch({
        url: '/pages/auth/login'
      })
      return Promise.reject(new Error('登录已过期'))
    }

    // 其他错误
    uni.showToast({
      title: message || '请求失败',
      icon: 'none'
    })

    return Promise.reject(new Error(message))
  },
  (error) => {
    uni.hideLoading()

    let message = '网络错误'

    if (error.response) {
      // 服务器响应错误
      message = error.response.data?.message || '服务器错误'
    } else if (error.request) {
      // 网络连接错误
      message = '网络连接失败'
    }

    uni.showToast({
      title: message,
      icon: 'none'
    })

    return Promise.reject(error)
  }
)
```

## 请求重试

```javascript
// 请求重试配置
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // 网络错误或5xx错误时重试
    return !error.response || error.response.status >= 500
  }
}

// 重试函数
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await request(config)
  } catch (error) {
    if (retryCount < retryConfig.retries && retryConfig.retryCondition(error)) {
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay))
      return retryRequest(config, retryCount + 1)
    }
    throw error
  }
}
```
