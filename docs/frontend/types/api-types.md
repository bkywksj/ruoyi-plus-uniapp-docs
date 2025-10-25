# API 类型

API 类型定义用于前后端数据交互，确保请求和响应的类型安全。

## 🎯 核心 API 类型

### 1. Result 类型

统一的 API 响应格式，采用元组形式处理错误和数据。

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

**优势**：
- ✅ 强制错误处理（解构时必须处理 err）
- ✅ 类型安全（data 自动推导类型）
- ✅ 简洁优雅（无需 try-catch）

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
  /** 当前页码，从1开始 */
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

业务对象，用于表单提交和业务逻辑处理。

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

### 2. VO (View Object)

视图对象，用于数据展示。

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

### 3. Query 类型

查询参数对象，继承 PageQuery。

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
  /** 是否需要认证，默认 true */
  auth?: boolean
  /** 是否需要租户ID，默认 true */
  tenant?: boolean
  /** 是否防止重复提交，默认 true */
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
```

### 3. 导出导入

```typescript
// 导出（返回 Blob）
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

## ✅ API 类型最佳实践

1. **明确返回类型**：所有 API 函数必须指定返回类型
2. **使用 Result 包装**：统一使用 `Result<T>` 处理异步响应
3. **BO/VO 分离**：提交用 BO，展示用 VO
4. **Query 继承 PageQuery**：查询参数统一继承分页参数
5. **类型导出**：在 types.ts 中集中导出业务类型
6. **错误处理**：始终处理 Result 的错误情况
7. **泛型约束**：合理使用泛型提供类型推导

## 🔗 相关文档

- [类型系统概览](./overview.md)
- [全局类型](./global-types.md)

完整的 API 类型定义确保前后端数据交互的类型安全。
