# HTTP工具

前端HTTP请求工具函数。

## request.ts

基于Axios封装的HTTP请求工具。

```typescript
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const userStore = useUserStore()
    
    // 添加 token
    if (userStore.token) {
      config.headers!.Authorization = `Bearer ${userStore.token}`
    }
    
    // 添加租户ID
    if (userStore.tenantId) {
      config.headers!['X-Tenant-Id'] = userStore.tenantId
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data
    
    if (code === 200) {
      return data
    } else if (code === 401) {
      // token 过期，跳转登录
      const userStore = useUserStore()
      userStore.logout()
      return Promise.reject(new Error('登录已过期'))
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    let message = '网络错误'
    
    if (error.response) {
      const { status, data } = error.response
      message = data?.message || `请求失败 ${status}`
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
```

## API类型定义

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderBy?: string
  isAsc?: boolean
}
```

## 请求封装

```typescript
// utils/request.ts
import service from './http'
import type { ApiResponse, PageResult, PageQuery } from '@/types/api'

// GET 请求
export const get = <T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T> => {
  return service.get(url, { params })
}

// POST 请求
export const post = <T = any>(
  url: string,
  data?: Record<string, any>
): Promise<T> => {
  return service.post(url, data)
}

// PUT 请求
export const put = <T = any>(
  url: string,
  data?: Record<string, any>
): Promise<T> => {
  return service.put(url, data)
}

// DELETE 请求
export const del = <T = any>(url: string): Promise<T> => {
  return service.delete(url)
}

// 分页请求
export const getPage = <T = any>(
  url: string,
  params?: PageQuery & Record<string, any>
): Promise<PageResult<T>> => {
  return service.get(url, { params })
}

// 文件上传
export const upload = (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        const progress = Math.round((event.loaded * 100) / event.total)
        onProgress(progress)
      }
    }
  })
}

// 文件下载
export const download = (
  url: string,
  filename?: string,
  params?: Record<string, any>
): Promise<void> => {
  return service.get(url, {
    params,
    responseType: 'blob'
  }).then((blob) => {
    const link = document.createElement('a')
    const href = window.URL.createObjectURL(blob)
    
    link.href = href
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(href)
  })
}
```

## 使用示例

```typescript
// api/user.ts
import { get, post, put, del, getPage } from '@/utils/request'
import type { PageResult, PageQuery } from '@/types/api'

// 用户信息类型
interface UserInfo {
  userId: number
  username: string
  nickname: string
  email: string
  mobile: string
  avatar: string
  status: string
  createTime: string
}

// 用户查询参数
interface UserQuery extends PageQuery {
  username?: string
  mobile?: string
  status?: string
  beginTime?: string
  endTime?: string
}

// 获取用户列表
export const getUserList = (params: UserQuery): Promise<PageResult<UserInfo>> => {
  return getPage('/system/user/list', params)
}

// 获取用户详情
export const getUserInfo = (userId: number): Promise<UserInfo> => {
  return get(`/system/user/${userId}`)
}

// 新增用户
export const addUser = (data: Partial<UserInfo>): Promise<void> => {
  return post('/system/user', data)
}

// 修改用户
export const updateUser = (data: Partial<UserInfo>): Promise<void> => {
  return put('/system/user', data)
}

// 删除用户
export const deleteUser = (userIds: number[]): Promise<void> => {
  return del(`/system/user/${userIds.join(',')}`)
}
```

## 错误处理

```typescript
// composables/useApi.ts
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useApi<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  options?: {
    immediate?: boolean
    onSuccess?: (data: Awaited<ReturnType<T>>) => void
    onError?: (error: Error) => void
  }
) {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<Awaited<ReturnType<T>> | null>(null)
  
  const execute = async (...args: Parameters<T>) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiFunction(...args)
      data.value = result
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      options?.onError?.(errorObj)
      throw errorObj
    } finally {
      loading.value = false
    }
  }
  
  if (options?.immediate) {
    execute()
  }
  
  return {
    loading,
    error,
    data,
    execute
  }
}

// 使用示例
const { loading, data, execute } = useApi(getUserList, {
  onSuccess: (users) => {
    ElMessage.success(`加载了 ${users.total} 个用户`)
  },
  onError: (error) => {
    console.error('加载用户列表失败:', error)
  }
})
```