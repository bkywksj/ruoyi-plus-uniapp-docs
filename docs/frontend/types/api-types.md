# API 类型

API 类型定义用于前后端数据交互,确保请求和响应的类型安全。

## 🎯 核心 API 类型

### 1. Result 类型

统一的 API 响应格式,采用元组形式处理错误和数据。

```typescript
// 定义
type Result<T = any> = Promise<[Error | null, T | null]>

// 使用场景
export const getUser = (id: string): Result<UserVo> => {
  return http.get<UserVo>(`/system/user/${id}`)
}

// 组件中使用
const [err, data] = await getUser('123')
if (err) {
  console.error('获取用户失败', err)
  return
}
console.log('用户信息', data)
```

**优势**:
- ✅ 强制错误处理(解构时必须处理 err)
- ✅ 类型安全(data 自动推导类型)
- ✅ 简洁优雅(无需 try-catch)
- ✅ 避免异常穿透(不会意外中断程序)
- ✅ 便于测试(明确的错误和数据分离)

### 2. R 类型

后端标准响应结构。

```typescript
// 定义
interface R<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}

// 使用示例
const response: R<UserVo> = {
  code: 200,
  msg: '操作成功',
  data: {
    id: '1',
    username: 'admin',
    nickname: '管理员'
  }
}
```

### 3. PageResult 类型

分页响应数据结构。

```typescript
// 定义
interface PageResult<T = any> {
  /** 数据记录列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 是否为最后一页 */
  last: boolean
}

// 使用示例
export const pageUsers = (query?: UserQuery): Result<PageResult<UserVo>> => {
  return http.get<PageResult<UserVo>>('/system/user/page', query)
}

// 组件中使用
const [err, data] = await pageUsers({ pageNum: 1, pageSize: 10 })
if (!err && data) {
  tableData.value = data.records
  total.value = data.total
  currentPage.value = data.current
}
```

### 4. PageQuery 类型

分页查询参数。

```typescript
// 定义
interface PageQuery {
  /** 当前页码,从1开始 */
  pageNum?: number
  /** 每页显示记录数 */
  pageSize?: number
  /** 排序字段 */
  orderByColumn?: string
  /** 排序方向 asc/desc */
  isAsc?: string
  /** 模糊搜索关键词 */
  searchValue?: string
  /** 扩展查询参数 */
  params?: Record<string, any>
}

// 使用示例
const query: PageQuery = {
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc',
  searchValue: '张三',
  params: {
    beginCreateTime: '2024-01-01',
    endCreateTime: '2024-12-31'
  }
}
```

## 📦 业务对象类型

### 1. BO (Business Object)

业务对象,用于表单提交和业务逻辑处理。

```typescript
// 定义
interface UserBo {
  id?: string | number
  username: string
  nickname: string
  email?: string
  phone?: string
  status: string
  roleIds?: number[]
}

// 使用示例
export const addUser = (data: UserBo): Result<string | number> => {
  return http.post<string | number>('/system/user/add', data)
}

export const updateUser = (data: UserBo): Result<void> => {
  return http.put<void>('/system/user/update', data)
}
```

**命名规范**:
- 新增: `add{EntityName}`
- 修改: `update{EntityName}`
- 接口参数类型: `{EntityName}Bo`

### 2. VO (View Object)

视图对象,用于数据展示。

```typescript
// 定义
interface UserVo {
  id: string | number
  username: string
  nickname: string
  email?: string
  phone?: string
  status: string
  statusName: string
  createTime: string
  updateTime?: string
  roles?: RoleVo[]
  deptName?: string
}

// 使用示例
export const getUser = (id: string): Result<UserVo> => {
  return http.get<UserVo>(`/system/user/${id}`)
}
```

**VO 特点**:
- 包含关联对象(如 `roles`)
- 包含显示名称(如 `statusName`)
- 包含时间戳(如 `createTime`)
- 只读,不用于提交

### 3. Query 类型

查询参数对象,继承 PageQuery。

```typescript
// 定义
interface UserQuery extends PageQuery {
  username?: string
  nickname?: string
  phone?: string
  status?: string
  deptId?: string | number
}

// 使用示例
export const pageUsers = (query?: UserQuery): Result<PageResult<UserVo>> => {
  return http.get<PageResult<UserVo>>('/system/user/page', query)
}
```

## 🔧 HTTP 请求类型

### CustomHeaders 接口

自定义请求头配置。

```typescript
// 定义 (http.d.ts)
export interface CustomHeaders {
  /** 是否需要认证,默认 true */
  auth?: boolean
  /** 是否需要租户ID,默认 true */
  tenant?: boolean
  /** 是否防止重复提交,默认 true */
  repeatSubmit?: boolean
  /** 是否加密请求数据 */
  isEncrypt?: boolean
  /** 其他自定义头部 */
  [key: string]: any
}

// 使用示例
export const login = (data: LoginBo): Result<LoginVo> => {
  return http.post<LoginVo>('/auth/login', data, {
    headers: {
      auth: false,        // 登录接口不需要认证
      tenant: true,
      repeatSubmit: false
    }
  })
}
```

## 📋 API 函数定义规范

### 1. CRUD 操作

```typescript
// 分页查询
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/base/ad/pageAds', query)
}

// 列表查询
export const listAds = (query?: AdQuery): Result<AdVo[]> => {
  return http.get<AdVo[]>('/base/ad/listAds', query)
}

// 详情查询
export const getAd = (id: string | number): Result<AdVo> => {
  return http.get<AdVo>(`/base/ad/getAd/${id}`)
}

// 新增
export const addAd = (data: AdBo): Result<string | number> => {
  return http.post<string | number>('/base/ad/addAd', data)
}

// 修改
export const updateAd = (data: AdBo): Result<void> => {
  return http.put<void>('/base/ad/updateAd', data)
}

// 删除
export const deleteAds = (ids: (string | number)[]): Result<void> => {
  return http.delete<void>(`/base/ad/deleteAds/${ids}`)
}

// 批量操作
export const batchUpdateStatus = (
  ids: (string | number)[],
  status: string
): Result<void> => {
  return http.put<void>('/base/ad/batchUpdateStatus', { ids, status })
}
```

### 2. 文件上传

```typescript
// 单文件上传
export const uploadFile = (file: File): Result<string> => {
  const formData = new FormData()
  formData.append('file', file)
  return http.post<string>('/system/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 多文件上传
export const uploadFiles = (files: File[]): Result<string[]> => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  return http.post<string[]>('/system/uploadMulti', formData)
}

// 带进度的文件上传
export const uploadWithProgress = (
  file: File,
  onProgress: (progress: number) => void
): Result<string> => {
  const formData = new FormData()
  formData.append('file', file)

  return http.post<string>('/system/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      )
      onProgress(percentCompleted)
    }
  })
}
```

### 3. 导出导入

```typescript
// 导出(返回 Blob)
export const exportAds = (query?: AdQuery): Promise<Blob> => {
  return http.get<Blob>('/base/ad/export', query, {
    responseType: 'blob'
  })
}

// 导入
export const importAds = (file: File): Result<void> => {
  const formData = new FormData()
  formData.append('file', file)
  return http.post<void>('/base/ad/import', formData)
}

// 下载模板
export const downloadTemplate = (): Promise<Blob> => {
  return http.get<Blob>('/base/ad/template', {}, {
    responseType: 'blob'
  })
}

// 导出处理示例
async function handleExport() {
  const blob = await exportAds(queryParams.value)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `广告数据_${Date.now()}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}
```

### 4. 特殊操作类型

```typescript
// 启用/禁用
export const changeStatus = (
  id: string | number,
  status: string
): Result<void> => {
  return http.put<void>(`/system/user/changeStatus/${id}`, { status })
}

// 重置密码
export const resetPassword = (
  id: string | number,
  password: string
): Result<void> => {
  return http.put<void>(`/system/user/resetPassword/${id}`, { password })
}

// 修改自己的密码
export const updatePassword = (
  oldPassword: string,
  newPassword: string
): Result<void> => {
  return http.put<void>('/system/user/updatePassword', {
    oldPassword,
    newPassword
  })
}

// 获取验证码
export const getCaptcha = (): Result<CaptchaVo> => {
  return http.get<CaptchaVo>('/auth/captcha')
}

// 发送短信验证码
export const sendSms = (phone: string, scene: string): Result<void> => {
  return http.post<void>('/auth/sendSms', { phone, scene })
}
```

## 🎯 组件中使用 API

### 1. 基础使用

```typescript
<script setup lang="ts">
import { ref } from 'vue'
import { pageAds, getAd, addAd, updateAd, deleteAds } from '@/api/business/base/ad/adApi'
import type { AdVo, AdBo, AdQuery } from '@/api/business/base/ad/types'

// 列表数据
const tableData = ref<AdVo[]>([])
const total = ref(0)
const loading = ref(false)

// 查询参数
const queryParams = ref<AdQuery>({
  pageNum: 1,
  pageSize: 10
})

// 查询列表
async function getList() {
  loading.value = true
  const [err, data] = await pageAds(queryParams.value)
  loading.value = false

  if (err) {
    console.error('查询失败', err)
    return
  }

  if (data) {
    tableData.value = data.records
    total.value = data.total
  }
}

// 新增/修改
async function handleSubmit(form: AdBo) {
  const api = form.id ? updateAd : addAd
  const [err] = await api(form)

  if (err) {
    ElMessage.error('操作失败')
    return
  }

  ElMessage.success('操作成功')
  getList()
}

// 删除
async function handleDelete(ids: (string | number)[]) {
  const [err] = await deleteAds(ids)

  if (err) {
    ElMessage.error('删除失败')
    return
  }

  ElMessage.success('删除成功')
  getList()
}
</script>
```

### 2. 错误处理

```typescript
// 统一错误处理
async function handleRequest<T>(
  request: Result<T>,
  successMsg?: string,
  errorMsg?: string
): Promise<T | null> {
  const [err, data] = await request

  if (err) {
    ElMessage.error(errorMsg || '操作失败')
    return null
  }

  if (successMsg) {
    ElMessage.success(successMsg)
  }

  return data
}

// 使用
const data = await handleRequest(
  getAd('123'),
  undefined,
  '获取详情失败'
)

if (data) {
  form.value = data
}
```

### 3. 并发请求

```typescript
// 同时请求多个接口
async function initData() {
  const [
    [err1, userData],
    [err2, roleData],
    [err3, deptData]
  ] = await Promise.all([
    getUser('123'),
    getRoleList(),
    getDeptTree()
  ])

  if (err1 || err2 || err3) {
    ElMessage.error('数据加载失败')
    return
  }

  // 处理数据
  user.value = userData
  roleOptions.value = roleData || []
  deptTree.value = deptData || []
}
```

### 4. 防抖节流请求

```typescript
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// 防抖搜索
const debouncedSearch = useDebounceFn((keyword: string) => {
  queryParams.value.searchValue = keyword
  queryParams.value.pageNum = 1
  getList()
}, 500)

// 节流滚动加载
const throttledLoadMore = useThrottleFn(async () => {
  if (loading.value || !hasMore.value) return

  queryParams.value.pageNum++
  const [err, data] = await pageAds(queryParams.value)

  if (!err && data) {
    tableData.value.push(...data.records)
    hasMore.value = !data.last
  }
}, 1000)
```

### 5. 轮询请求

```typescript
import { useIntervalFn } from '@vueuse/core'

// 轮询查询订单状态
const { pause, resume } = useIntervalFn(async () => {
  const [err, data] = await getOrderStatus(orderId.value)

  if (!err && data) {
    orderStatus.value = data.status

    // 支付成功或失败时停止轮询
    if (data.status === 'SUCCESS' || data.status === 'FAILED') {
      pause()
    }
  }
}, 2000)

// 组件卸载时停止轮询
onUnmounted(() => {
  pause()
})
```

## 📝 类型定义文件示例

### adApi.ts

```typescript
import type { Result, PageResult } from '@/types/global'
import type { AdVo, AdBo, AdQuery } from './types'
import http from '@/utils/http'

/**
 * 广告配置 API
 */

// 分页查询
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/base/ad/pageAds', query)
}

// 详情查询
export const getAd = (id: string | number): Result<AdVo> => {
  return http.get<AdVo>(`/base/ad/getAd/${id}`)
}

// 新增
export const addAd = (data: AdBo): Result<string | number> => {
  return http.post<string | number>('/base/ad/addAd', data)
}

// 修改
export const updateAd = (data: AdBo): Result<void> => {
  return http.put<void>('/base/ad/updateAd', data)
}

// 删除
export const deleteAds = (ids: (string | number)[]): Result<void> => {
  return http.delete<void>(`/base/ad/deleteAds/${ids}`)
}
```

### types.ts

```typescript
/**
 * 广告配置业务对象
 */
export interface AdBo {
  id?: string | number
  adName: string
  adPosition: string
  adLink?: string
  adImage?: string
  adSort?: number
  status: string
  beginTime?: string
  endTime?: string
}

/**
 * 广告配置视图对象
 */
export interface AdVo {
  id: string | number
  adName: string
  adPosition: string
  adPositionName: string
  adLink?: string
  adImage?: string
  adSort: number
  status: string
  statusName: string
  beginTime?: string
  endTime?: string
  createTime: string
}

/**
 * 广告配置查询参数
 */
export interface AdQuery extends PageQuery {
  adName?: string
  adPosition?: string
  status?: string
}
```

## 🔄 请求与响应拦截

### 请求拦截器

```typescript
// http.ts
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
})

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token
    const token = useUserStore().getToken()
    if (token && config.headers.auth !== false) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加租户 ID
    const tenantId = useUserStore().getTenantId()
    if (tenantId && config.headers.tenant !== false) {
      config.headers['Tenant-Id'] = tenantId
    }

    // 防重复提交
    if (config.headers.repeatSubmit !== false) {
      const url = config.url
      const data = JSON.stringify(config.data)
      const requestKey = `${url}_${data}`
      const lastRequest = sessionStorage.getItem(requestKey)

      if (lastRequest && Date.now() - Number(lastRequest) < 1000) {
        return Promise.reject(new Error('请勿重复提交'))
      }

      sessionStorage.setItem(requestKey, String(Date.now()))
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### 响应拦截器

```typescript
// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const res: R = response.data

    // 处理文件下载
    if (response.config.responseType === 'blob') {
      return response.data
    }

    // 处理业务错误码
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')

      // 401 未授权
      if (res.code === 401) {
        useUserStore().logout()
        router.push('/login')
      }

      return [new Error(res.msg), null]
    }

    // 成功返回
    return [null, res.data]
  },
  (error) => {
    let message = '请求失败'

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          message = data.msg || '请求参数错误'
          break
        case 401:
          message = '未授权,请重新登录'
          useUserStore().logout()
          router.push('/login')
          break
        case 403:
          message = '没有权限访问该资源'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = data.msg || '请求失败'
      }
    } else if (error.request) {
      message = '网络请求失败,请检查网络连接'
    }

    ElMessage.error(message)
    return [error, null]
  }
)
```

## 🎨 高级用法

### 1. 泛型 API 函数

```typescript
// 通用 CRUD 工厂函数
function createCrudApi<VO, BO, Query extends PageQuery = PageQuery>(
  baseUrl: string
) {
  return {
    page: (query?: Query): Result<PageResult<VO>> => {
      return http.get<PageResult<VO>>(`${baseUrl}/page`, query)
    },

    list: (query?: Query): Result<VO[]> => {
      return http.get<VO[]>(`${baseUrl}/list`, query)
    },

    get: (id: string | number): Result<VO> => {
      return http.get<VO>(`${baseUrl}/${id}`)
    },

    add: (data: BO): Result<string | number> => {
      return http.post<string | number>(baseUrl, data)
    },

    update: (data: BO): Result<void> => {
      return http.put<void>(baseUrl, data)
    },

    delete: (ids: (string | number)[]): Result<void> => {
      return http.delete<void>(`${baseUrl}/${ids}`)
    }
  }
}

// 使用
const userApi = createCrudApi<UserVo, UserBo, UserQuery>('/system/user')

// 调用
const [err, data] = await userApi.page({ pageNum: 1, pageSize: 10 })
```

### 2. API 组合与复用

```typescript
// 基础 API 函数
const baseApi = {
  changeStatus: (id: string | number, status: string): Result<void> => {
    return http.put<void>(`/base/changeStatus/${id}`, { status })
  },

  batchDelete: (ids: (string | number)[]): Result<void> => {
    return http.delete<void>(`/base/batchDelete/${ids}`)
  }
}

// 继承基础 API
const userApi = {
  ...baseApi,
  ...createCrudApi<UserVo, UserBo, UserQuery>('/system/user'),

  // 用户特有的方法
  resetPassword: (id: string | number): Result<void> => {
    return http.put<void>(`/system/user/resetPassword/${id}`)
  },

  assignRoles: (userId: string | number, roleIds: number[]): Result<void> => {
    return http.put<void>(`/system/user/assignRoles/${userId}`, { roleIds })
  }
}
```

### 3. 缓存与优化

```typescript
import { useStorage } from '@vueuse/core'

// API 缓存包装器
function withCache<T>(
  apiFunc: () => Result<T>,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000 // 5分钟
): Result<T> {
  const cached = useStorage<{ data: T; timestamp: number }>(cacheKey, null)

  // 检查缓存是否有效
  if (cached.value && Date.now() - cached.value.timestamp < ttl) {
    return Promise.resolve([null, cached.value.data])
  }

  // 请求新数据
  return apiFunc().then(([err, data]) => {
    if (!err && data) {
      cached.value = {
        data,
        timestamp: Date.now()
      }
    }
    return [err, data]
  })
}

// 使用
const getDictList = (): Result<DictItem[]> => {
  return withCache(
    () => http.get<DictItem[]>('/system/dict/list'),
    'dict_list',
    10 * 60 * 1000 // 10分钟缓存
  )
}
```

## ✅ API 类型最佳实践

### 1. 明确返回类型

所有 API 函数必须指定返回类型:

```typescript
// ✅ 正确
export const getUser = (id: string): Result<UserVo> => {
  return http.get<UserVo>(`/system/user/${id}`)
}

// ❌ 错误 - 缺少返回类型
export const getUser = (id: string) => {
  return http.get(`/system/user/${id}`)
}
```

### 2. 使用 Result 包装

统一使用 `Result<T>` 处理异步响应:

```typescript
// ✅ 正确
const [err, data] = await getUser('123')
if (err) {
  console.error('获取失败', err)
  return
}

// ❌ 错误 - 使用 try-catch
try {
  const data = await getUser('123')
} catch (err) {
  console.error('获取失败', err)
}
```

### 3. BO/VO 分离

提交用 BO,展示用 VO:

```typescript
// ✅ 正确
interface UserBo {
  username: string
  password: string
  roleIds: number[]
}

interface UserVo {
  id: string
  username: string
  nickname: string
  roles: RoleVo[]
}

// ❌ 错误 - 混用
interface User {
  id?: string
  username: string
  password?: string
  roleIds?: number[]
  roles?: RoleVo[]
}
```

### 4. Query 继承 PageQuery

查询参数统一继承分页参数:

```typescript
// ✅ 正确
interface UserQuery extends PageQuery {
  username?: string
  status?: string
}

// ❌ 错误 - 重复定义分页参数
interface UserQuery {
  pageNum?: number
  pageSize?: number
  username?: string
  status?: string
}
```

### 5. 类型导出

在 types.ts 中集中导出业务类型:

```typescript
// types.ts
export interface UserVo { ... }
export interface UserBo { ... }
export interface UserQuery { ... }
export interface RoleVo { ... }

// api.ts
import type { UserVo, UserBo, UserQuery } from './types'
```

### 6. 错误处理

始终处理 Result 的错误情况:

```typescript
// ✅ 正确
const [err, data] = await getUser('123')
if (err) {
  ElMessage.error('获取用户失败')
  return
}

// ❌ 错误 - 未处理错误
const [, data] = await getUser('123')
tableData.value = data.records  // data 可能为 null
```

### 7. 泛型约束

合理使用泛型提供类型推导:

```typescript
// ✅ 正确
function request<T>(url: string): Result<T> {
  return http.get<T>(url)
}

// 使用时自动推导类型
const [err, user] = await request<UserVo>('/system/user/1')

// ❌ 错误 - 返回 any
function request(url: string): Promise<any> {
  return http.get(url)
}
```

### 8. 命名规范

API 函数命名应符合语义:

```typescript
// ✅ 正确命名
getUser          // 获取单个
pageUsers        // 分页查询
listUsers        // 列表查询
addUser          // 新增
updateUser       // 修改
deleteUsers      // 删除(复数表示可批量)
changeUserStatus // 修改状态

// ❌ 错误命名
fetchUser        // 不明确
userList         // 应该是动词开头
saveUser         // 不明确是新增还是修改
```

### 9. 参数简化

当只有一个参数时,可以直接传递:

```typescript
// ✅ 推荐
export const getUser = (id: string | number): Result<UserVo> => {
  return http.get<UserVo>(`/system/user/${id}`)
}

// ⚠️ 可以但不推荐
export const getUser = (params: { id: string | number }): Result<UserVo> => {
  return http.get<UserVo>(`/system/user/${params.id}`)
}
```

### 10. 请求配置

将请求配置抽取为常量:

```typescript
// config.ts
export const API_TIMEOUT = 30000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// http.ts
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT
})
```

## 📚 总结

API 类型系统提供了完整的前后端交互类型安全保障:

1. **Result 类型** - 统一的异步错误处理模式
2. **业务对象分离** - BO/VO 各司其职,提升类型安全
3. **泛型支持** - 灵活的类型推导和复用
4. **拦截器增强** - 统一处理认证、错误、防重
5. **最佳实践** - 规范化的 API 定义和使用方式

完整的 API 类型定义确保前后端数据交互的类型安全和开发效率。
