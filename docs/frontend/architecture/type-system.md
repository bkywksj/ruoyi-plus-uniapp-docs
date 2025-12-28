# 类型系统

## 概述

Ruoyi-Plus-Uniapp 框架建立了完整的 TypeScript 类型体系，通过统一的类型定义规范、严格的类型检查和合理的类型设计模式，为项目提供了强大的类型安全保障。本文档详细介绍框架中的类型系统设计理念、使用规范和最佳实践。

## 类型系统架构

### 类型分层结构

```
📁 类型系统架构
├── 🌐 全局类型 (global.d.ts)        # 项目通用类型定义
├── 🔧 环境类型 (env.d.ts)           # 环境变量类型声明
├── 🛣️ 路由类型 (router.d.ts)        # 路由系统类型扩展
├── 📡 HTTP类型 (http.d.ts)          # 请求响应类型定义
├── 🎨 组件类型 (element.d.ts)       # UI组件类型声明
└── 📦 业务类型 (各模块Types文件)      # 具体业务实体类型
```

## 核心类型规范

### 1. API 类型定义规范

#### 统一响应格式

```typescript
// 统一的 API 响应类型
declare type Result<T = any> = Promise<[Error | null, T | null]>

// 标准 API 响应结构
declare interface R<T = any> {
  code: number    // 响应状态码
  msg: string     // 响应消息
  data: T         // 响应数据
}

// 分页响应数据类型
declare interface PageResult<T = any> {
  records: T[]    // 数据记录列表
  total: number   // 总记录数
  pages: number   // 总页数
  current: number // 当前页码
  size: number    // 每页大小
  last: boolean   // 是否为最后一页
}
```

#### API 接口类型定义模式

```typescript
// 认证相关类型定义 (authTypes.ts)
export interface CaptchaVo {
  tenantEnabled: boolean    // 是否开启多租户
  tenantTitle: string       // 租户标题
  registerEnabled: boolean  // 是否开启注册
  captchaEnabled: boolean   // 是否开启验证码
  uuid: string             // 验证码唯一标识
  img: string              // 验证码图片（Base64编码）
}

export interface AuthTokenVo {
  access_token: string      // 访问令牌
  refresh_token?: string    // 刷新令牌
  expire_in: number         // 访问令牌有效期（秒）
  refresh_expire_in?: number // 刷新令牌有效期（秒）
  scope?: string           // 令牌权限范围
}

// 联合类型用于多种登录方式
export type LoginRequest = PasswordLoginBody | EmailLoginBody | SmsLoginBody | SocialLoginBody
```

#### 用户相关类型定义模式

```typescript
// 用户查询参数类型
export interface SysUserQuery extends PageQuery {
  userName?: string         // 用户账号
  phone?: string           // 手机号码
  status?: string          // 帐号状态
  deptId?: string | number // 部门id
  roleId?: string | number // 角色id
}

// 用户表单类型
export interface SysUserBo {
  userId?: string | number  // 用户ID
  userName: string         // 用户账号（必填）
  nickName?: string        // 用户昵称
  password: string         // 密码（必填）
  phone?: string          // 手机号码
  email?: string          // 用户邮箱
  status: string          // 帐号状态（必填）
  postIds: string[]       // 岗位id列表（必填）
  roleIds: string[]       // 角色id列表（必填）
}

// 用户视图对象类型
export interface SysUserVo {
  userId: string | number  // 用户ID
  tenantId: string        // 租户id
  userName: string        // 用户账号
  nickName: string        // 用户昵称
  email: string           // 用户邮箱
  phone: string          // 手机号码
  avatar: string         // 头像地址
  status: string         // 帐号状态
  roles: SysRoleVo[]     // 角色列表
  admin: boolean         // 是否管理员
  createTime?: string    // 创建时间
}
```

### 2. 组件 Props 类型规范

#### 表单组件类型定义模式

```typescript
// AFormInput 组件 Props 接口定义
interface AFormInputProps {
  // 基础属性 - 明确类型，支持多种数据类型
  modelValue?: string | number | null | undefined
  label?: string
  placeholder?: string
  
  // 布局属性 - 支持灵活的尺寸设置
  width?: number | string
  labelWidth?: number | string
  span?: number
  
  // 功能属性 - 明确的布尔类型和枚举类型
  showFormItem?: boolean
  showPassword?: boolean
  clearable?: boolean
  disabled?: boolean
  
  // 枚举类型 - 限制可选值
  type?: 'text' | 'textarea' | 'number' | 'password'
  size?: '' | 'default' | 'small' | 'large'
  
  // 复杂类型 - 对象类型的明确定义
  autosize?: { minRows?: number; maxRows?: number }
  
  // 数字输入框特有属性 - 条件类型
  min?: number
  max?: number
  step?: number
  precision?: number
}

// 使用 withDefaults 提供默认值
const props = withDefaults(defineProps<AFormInputProps>(), {
  modelValue: undefined,
  label: '',
  type: 'text',
  clearable: true,
  showFormItem: true,
  autosize: () => ({ minRows: 2, maxRows: 30 })
})
```

### 3. 状态管理类型规范

```typescript
// 用户状态管理类型定义
export const useUserStore = defineStore('user', () => {
  // 明确的状态类型定义
  const token = ref<string>(tokenUtils.getToken())
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 方法的返回类型明确定义
  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    const [err, data] = await userLogin(loginRequest)
    if (err) {
      return [err, null]
    }
    // 类型安全的操作
    tokenUtils.setToken(data.access_token, data.expire_in)
    token.value = data.access_token
    return [null, null]
  }

  const fetchUserInfo = async (): Result<void> => {
    // 类型安全的API调用
    const [err, data] = await getUserInfo()
    if (err) return [err, null]
    
    // 明确的类型操作
    userInfo.value = data.user
    roles.value = data.roles || []
    permissions.value = data.permissions || []
    
    return [null, null]
  }

  return {
    // 状态
    token,
    userInfo,
    roles,
    permissions,
    // 方法
    loginUser,
    fetchUserInfo
  }
})
```

## 类型使用模式

### 1. 泛型的使用场景

#### API 响应泛型

```typescript
// 泛型API函数定义
export const pageUsers = (query: SysUserQuery): Result<PageResult<SysUserVo>> => {
  return http.get<PageResult<SysUserVo>>('/system/user/pageUsers', query)
}

export const getUser = (userId?: string | number): Result<SysUserInfoVo> => {
  return http.get<SysUserInfoVo>(`/system/user/getUser/${parseStrEmpty(userId)}`)
}

// 泛型工具类型
type Optional<T> = {
  [K in keyof T]?: T[K]
}

type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
```

#### 组件泛型

```typescript
// 表格组件泛型定义
interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
}

interface TableColumn<T> {
  prop: keyof T
  label: string
  width?: number
  formatter?: (row: T, column: TableColumn<T>, cellValue: any) => string
}
```

### 2. 联合类型和交叉类型

```typescript
// 联合类型 - 多种可能的类型
type LoginType = 'password' | 'email' | 'sms' | 'social'
type Status = '0' | '1'  // 启用禁用状态
type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

// 交叉类型 - 合并多个类型
interface BaseEntity {
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

interface UserEntity extends BaseEntity {
  userId: string | number
  userName: string
  nickName: string
}

// 条件类型组合
type LoginBody = {
  authType: LoginType
  code?: string
  uuid?: string
}

type PasswordLogin = LoginBody & {
  authType: 'password'
  userName: string
  password: string
  rememberMe?: boolean
}
```

### 3. 类型守卫和断言

```typescript
// 类型守卫函数
function isPasswordLogin(body: LoginRequest): body is PasswordLoginBody {
  return body.authType === 'password'
}

function isValidUser(user: any): user is SysUserVo {
  return user && typeof user.userId !== 'undefined' && typeof user.userName === 'string'
}

// 使用类型守卫
function processLogin(loginData: LoginRequest) {
  if (isPasswordLogin(loginData)) {
    // 这里 TypeScript 知道 loginData 是 PasswordLoginBody 类型
    console.log(loginData.userName) // 类型安全
  }
}

// 类型断言
const userInfo = data as SysUserVo
const formRef = ref() as Ref<ElFormInstance>
```

### 4. 条件类型的应用

```typescript
// 根据条件返回不同类型
type ApiResponse<T> = T extends void 
  ? { code: number; msg: string } 
  : { code: number; msg: string; data: T }

// 提取属性类型
type UserKeys = keyof SysUserVo  // 'userId' | 'userName' | 'nickName' | ...

// 构造新类型
type PartialUser = Partial<SysUserVo>  // 所有属性可选
type RequiredUser = Required<Pick<SysUserVo, 'userId' | 'userName'>>  // 指定属性必填
```

## 业务类型设计

### 查询参数类型模式

```typescript
// 基础查询参数
interface BaseQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
  searchValue?: string
}

// 具体业务查询参数继承基础查询
interface AdQuery extends BaseQuery {
  id?: string | number
  appid?: string
  adName?: string
  adType?: string
  status?: string
}
```

### 表单对象类型模式

```typescript
// Bo (Business Object) - 业务对象
interface AdBo {
  id?: string | number     // 可选 - 新增时无ID
  appid?: string          // 可选属性
  adName?: string         // 可选属性
  adType?: string         // 可选属性
  status: string          // 必填属性
  sortOrder: number       // 必填属性
}

// Vo (View Object) - 视图对象
interface AdVo {
  id: string | number     // 必填 - 视图对象总是有ID
  appid: string
  adName: string
  adType: string
  status: string
  sortOrder: number
  createTime?: string     // 可选 - 时间字段
  updateTime?: string
}
```

## 类型声明扩展

### Element Plus 类型扩展

```typescript
// 全局组件实例类型
declare global {
  // 表单相关
  declare type ElFormInstance = ep.FormInstance
  declare type ElFormRules = ep.FormRules
  
  // 表格相关
  declare type ElTableInstance = ep.TableInstance
  declare type ElTableColumnCtx<T> = ep.TableColumnCtx<T>
  
  // 上传相关
  declare type ElUploadInstance = ep.UploadInstance
  declare type ElUploadFile = ep.UploadFile
  
  // 样式类型
  declare type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
  declare type ElSize = 'large' | 'default' | 'small'
}
```

### 路由类型扩展

```typescript
// 扩展 Vue Router 类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string          // 路由标题
    icon?: string          // 路由图标
    hidden?: boolean       // 是否隐藏
    permissions?: string[] // 访问权限
    roles?: string[]       // 访问角色
  }
  
  interface TagView {
    fullPath?: string
    name?: string
    path?: string
    title?: string
    meta?: RouteMeta
  }
}
```

## 最佳实践

### 1. 命名约定

```typescript
// 接口命名 - 使用 I 前缀或描述性后缀
interface UserInfo { }          // ✅ 推荐
interface IUserService { }      // ✅ 可选
interface SysUserVo { }         // ✅ 业务对象

// 类型别名命名 - 使用 Type 后缀或描述性名称
type LoginType = 'password' | 'email'    // ✅ 推荐
type UserStatus = '0' | '1'              // ✅ 推荐
type ApiResponseType<T> = Promise<T>     // ✅ 可选

// 泛型参数命名
interface ApiResponse<TData> { }         // ✅ 描述性
interface TableColumn<T, K extends keyof T> { } // ✅ 约束明确
```

### 2. 类型文件组织

```typescript
// 按模块组织类型文件
src/api/
├── system/
│   ├── auth/
│   │   ├── authApi.ts      # API 函数
│   │   └── authTypes.ts    # 类型定义
│   └── user/
│       ├── userApi.ts
│       └── userTypes.ts
└── business/
    └── ad/
        ├── adApi.ts
        └── adTypes.ts

// 类型导出规范
// authTypes.ts
export interface CaptchaVo { }
export interface LoginRequest { }
export interface AuthTokenVo { }

// authApi.ts
import type { CaptchaVo, LoginRequest, AuthTokenVo } from './authTypes'
```

### 3. 类型复用策略

```typescript
// 基础类型定义
interface BaseEntity {
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

// 继承基础类型
interface SysUserVo extends BaseEntity {
  userId: string | number
  userName: string
  // ... 其他属性
}

// 工具类型复用
type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
type UserFormData = PickRequired<SysUserVo, 'userName' | 'status'>
```

### 4. 类型安全检查

```typescript
// 运行时类型检查
function validateUser(user: any): user is SysUserVo {
  return (
    user &&
    typeof user.userId === 'string' &&
    typeof user.userName === 'string' &&
    typeof user.status === 'string'
  )
}

// 使用类型检查
function processUser(userData: unknown) {
  if (validateUser(userData)) {
    // 类型安全的操作
    console.log(userData.userName)
  }
}
```

### 5. 错误处理类型化

```typescript
// 统一的错误处理类型
type ApiError = {
  code: number
  message: string
  details?: any
}

// Result 类型模式
type Result<T, E = ApiError> = Promise<[E | null, T | null]>

// 使用示例
const [error, data] = await getUserInfo()
if (error) {
  // 错误处理
  console.error(error.message)
  return
}
// 成功处理 - data 类型安全
console.log(data.userName)
```

## 性能优化建议

### 1. 类型推断优化

```typescript
// ❌ 避免过度指定类型
const user: SysUserVo = {
  userId: '1' as string | number,  // 不必要的断言
  userName: 'admin' as string      // 不必要的断言
}

// ✅ 利用类型推断
const user: SysUserVo = {
  userId: '1',      // TypeScript 自动推断
  userName: 'admin' // TypeScript 自动推断
}
```

### 2. 条件类型优化

```typescript
// ❌ 复杂的条件类型
type ComplexType<T> = T extends string 
  ? T extends `${string}@${string}` 
    ? EmailType<T> 
    : StringType<T>
  : T extends number 
    ? NumberType<T> 
    : DefaultType<T>

// ✅ 简化的类型定义
type EmailString = `${string}@${string}`
type ProcessedType<T> = T extends EmailString ? EmailType<T> : BasicType<T>
```

## 总结

Ruoyi-Plus-Uniapp 的类型系统通过系统化的设计和规范，实现了：

- **类型安全**: 编译时错误检查，减少运行时错误
- **开发效率**: 智能提示和自动补全，提升开发体验
- **代码质量**: 统一的类型规范，提高代码可读性和维护性
- **扩展性**: 灵活的类型扩展机制，适应业务发展需求

通过遵循本文档中的类型设计模式和最佳实践，可以构建出类型安全、高效且易于维护的 TypeScript 应用程序。

## 常见问题

### 1. 类型推断失效或类型丢失

**问题描述**

在使用 TypeScript 开发过程中，经常遇到变量类型推断失效，原本应该有明确类型的变量变成 `any` 或 `unknown`，导致失去类型检查的保护。

**问题原因**

- 使用了 `any` 类型污染了整个类型链
- API 响应数据未正确声明类型
- 解构赋值时丢失了类型信息
- 使用了动态属性访问破坏了类型推断
- 第三方库缺少类型定义文件

**解决方案**

```typescript
// ❌ 错误示例：使用 any 导致类型丢失
const fetchData = async () => {
  const response: any = await http.get('/api/user')
  // response.data 类型为 any，失去类型检查
  const userName = response.data.userName
  return userName // 类型为 any
}

// ✅ 正确示例：明确声明返回类型
interface UserResponse {
  userId: string
  userName: string
  email: string
  status: string
}

const fetchData = async (): Promise<UserResponse> => {
  const [error, data] = await http.get<UserResponse>('/api/user')
  if (error) {
    throw error
  }
  // data 现在有明确的类型
  return data
}

// ❌ 错误示例：解构时丢失类型
const processData = (response: any) => {
  const { user, roles } = response
  // user 和 roles 都是 any 类型
  return { user, roles }
}

// ✅ 正确示例：使用类型注解保留类型信息
interface ApiResponse {
  user: SysUserVo
  roles: string[]
}

const processData = (response: ApiResponse) => {
  const { user, roles } = response
  // user 是 SysUserVo 类型，roles 是 string[] 类型
  return { user, roles }
}

// ❌ 错误示例：动态属性访问破坏类型推断
const getValue = (obj: Record<string, any>, key: string) => {
  return obj[key] // 返回类型为 any
}

// ✅ 正确示例：使用泛型保留类型
const getValue = <T, K extends keyof T>(obj: T, key: K): T[K] => {
  return obj[key] // 返回类型为 T[K]
}

// 使用示例
interface User {
  id: number
  name: string
  age: number
}

const user: User = { id: 1, name: 'admin', age: 25 }
const name = getValue(user, 'name') // 类型为 string
const age = getValue(user, 'age')   // 类型为 number
```

**类型链污染修复**

```typescript
// 类型污染检测工具
type DetectAny<T> = T extends any
  ? unknown extends T
    ? true
    : false
  : false

// 使用类型检测避免 any 污染
type CheckUserType = DetectAny<SysUserVo> // false - 类型安全
type CheckAnyType = DetectAny<any>        // true - 存在污染

// 逐步修复类型链
// 1. 首先找到 any 的源头
interface LegacyApi {
  getData: () => any  // 这里是污染源
}

// 2. 添加明确的类型定义
interface TypedApi {
  getData: () => Promise<SysUserVo>
}

// 3. 使用类型断言进行临时修复
const legacyData = legacyApi.getData() as SysUserVo

// 4. 使用类型守卫进行运行时验证
function isValidUser(data: unknown): data is SysUserVo {
  if (!data || typeof data !== 'object') return false
  const user = data as Record<string, unknown>
  return (
    typeof user.userId === 'string' &&
    typeof user.userName === 'string'
  )
}

const data = legacyApi.getData()
if (isValidUser(data)) {
  // 这里 data 的类型是 SysUserVo
  console.log(data.userName)
}
```

**第三方库类型补充**

```typescript
// 为缺少类型定义的第三方库创建声明文件
// src/types/third-party.d.ts

declare module 'untyped-library' {
  export interface LibraryConfig {
    option1: string
    option2: number
  }

  export function initialize(config: LibraryConfig): void
  export function getData<T>(): Promise<T>
}

// 使用时就有类型提示了
import { initialize, getData } from 'untyped-library'

initialize({ option1: 'value', option2: 42 })
const result = await getData<SysUserVo>()
```

---

### 2. 泛型约束报错或类型参数无法识别

**问题描述**

使用泛型时遇到类型参数无法正确推断、泛型约束过于严格或过于宽松、以及复杂泛型嵌套导致类型错误等问题。

**问题原因**

- 泛型约束条件设置不当
- 泛型参数位置错误
- 多个泛型参数之间的依赖关系未正确表达
- TypeScript 版本差异导致的泛型行为不一致
- 条件类型中的泛型分发特性理解不足

**解决方案**

```typescript
// ❌ 错误示例：泛型约束过于宽松
const getProperty = <T>(obj: T, key: string) => {
  return obj[key] // 错误：类型"string"的表达式不能用于索引类型"T"
}

// ✅ 正确示例：使用 keyof 约束
const getProperty = <T, K extends keyof T>(obj: T, key: K): T[K] => {
  return obj[key]
}

// ❌ 错误示例：泛型约束过于严格
interface BaseItem {
  id: number
  name: string
}

// 这个约束要求完全匹配 BaseItem，不允许额外属性
const processItem = <T extends BaseItem>(item: T) => {
  return item.id
}

// 调用时可能报错
const extendedItem = { id: 1, name: 'test', extra: 'value' }
processItem(extendedItem) // 可能有类型兼容性问题

// ✅ 正确示例：灵活的泛型约束
interface HasId {
  id: number
}

interface HasName {
  name: string
}

// 使用交叉类型组合约束
const processItem = <T extends HasId & HasName>(item: T): T => {
  console.log(item.id, item.name)
  return item // 保留完整类型信息
}

const extendedItem = { id: 1, name: 'test', extra: 'value' }
const result = processItem(extendedItem)
// result 的类型包含 extra 属性
```

**泛型参数默认值和条件类型**

```typescript
// 泛型参数默认值
interface ApiResponse<TData = unknown, TError = Error> {
  success: boolean
  data?: TData
  error?: TError
}

// 使用默认值
const response1: ApiResponse = { success: true }
const response2: ApiResponse<SysUserVo> = { success: true, data: user }

// 条件类型中的泛型分发
type ExtractArrayItem<T> = T extends (infer U)[] ? U : T

type ItemType1 = ExtractArrayItem<string[]>  // string
type ItemType2 = ExtractArrayItem<number>    // number

// ❌ 错误示例：条件类型分发导致意外结果
type Wrapped<T> = T extends any ? { value: T } : never

type UnionWrapped = Wrapped<string | number>
// 结果是 { value: string } | { value: number }
// 而不是 { value: string | number }

// ✅ 正确示例：禁用分发行为
type WrappedNoDistribute<T> = [T] extends [any] ? { value: T } : never

type UnionWrappedFixed = WrappedNoDistribute<string | number>
// 结果是 { value: string | number }
```

**复杂泛型嵌套处理**

```typescript
// 复杂的表格列类型定义
interface TableColumn<T, K extends keyof T = keyof T> {
  prop: K
  label: string
  width?: number
  formatter?: (row: T, column: TableColumn<T, K>, value: T[K]) => string
}

// 表格组件 Props
interface TableProps<T extends Record<string, any>> {
  data: T[]
  columns: TableColumn<T>[]
  rowKey?: keyof T
  selection?: boolean
}

// 使用示例
interface UserRow {
  id: number
  name: string
  email: string
  status: '0' | '1'
}

const columns: TableColumn<UserRow>[] = [
  {
    prop: 'name',
    label: '用户名',
    formatter: (row, column, value) => {
      // value 的类型是 string
      return value.toUpperCase()
    }
  },
  {
    prop: 'status',
    label: '状态',
    formatter: (row, column, value) => {
      // value 的类型是 '0' | '1'
      return value === '0' ? '禁用' : '启用'
    }
  }
]

// 泛型工具类型
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K]
}

// 递归类型的深度限制
type RecursiveLimit<T, Depth extends number[] = []> =
  Depth['length'] extends 10
    ? T
    : T extends object
      ? { [K in keyof T]: RecursiveLimit<T[K], [...Depth, 1]> }
      : T
```

---

### 3. Vue 组件 Props 类型检查失败

**问题描述**

Vue 3 组件中使用 TypeScript 定义 Props 时，遇到类型检查失败、默认值类型不匹配、或者 Props 类型无法正确推断等问题。

**问题原因**

- `defineProps` 泛型参数与运行时声明混用
- 对象或数组类型的默认值未使用工厂函数
- Props 类型定义中使用了无法序列化的类型
- `withDefaults` 使用不当
- 可选属性和必填属性的默认值处理不一致

**解决方案**

```typescript
// ❌ 错误示例：混用泛型和运行时声明
const props = defineProps<{
  title: string
  count: number
}>({
  // 不能同时使用泛型和运行时声明
  title: { type: String, required: true }
})

// ✅ 正确示例：纯泛型声明
interface ComponentProps {
  title: string
  count: number
  optional?: string
}

const props = defineProps<ComponentProps>()

// ✅ 正确示例：使用 withDefaults 提供默认值
const props = withDefaults(defineProps<ComponentProps>(), {
  optional: 'default value'
})

// ❌ 错误示例：对象默认值类型错误
interface FormProps {
  formData: {
    name: string
    age: number
  }
  options: string[]
}

const props = withDefaults(defineProps<FormProps>(), {
  formData: { name: '', age: 0 },  // 错误：必须使用工厂函数
  options: ['option1']              // 错误：数组也需要工厂函数
})

// ✅ 正确示例：使用工厂函数返回对象和数组
const props = withDefaults(defineProps<FormProps>(), {
  formData: () => ({ name: '', age: 0 }),
  options: () => ['option1', 'option2']
})
```

**复杂 Props 类型处理**

```typescript
// 条件类型的 Props
interface InputProps {
  type: 'text' | 'number' | 'password'
  modelValue: string | number
  // 根据 type 限制 modelValue 类型（运行时检查）
}

// 使用泛型优化类型关联
interface TypedInputProps<T extends 'text' | 'number' | 'password'> {
  type: T
  modelValue: T extends 'number' ? number : string
}

// 组件中实现类型守卫
const props = defineProps<InputProps>()

// 运行时类型验证
const validateValue = () => {
  if (props.type === 'number' && typeof props.modelValue !== 'number') {
    console.warn('number 类型输入框应该接收 number 类型的值')
  }
}

// Props 继承和扩展
interface BaseFormItemProps {
  label?: string
  labelWidth?: string | number
  required?: boolean
  rules?: FormItemRule[]
}

interface InputSpecificProps {
  maxlength?: number
  minlength?: number
  showWordLimit?: boolean
  clearable?: boolean
}

// 组合 Props 类型
type AFormInputProps = BaseFormItemProps & InputSpecificProps & {
  modelValue?: string | number
  type?: 'text' | 'textarea' | 'number' | 'password'
  placeholder?: string
}

// 使用组合后的类型
const props = withDefaults(defineProps<AFormInputProps>(), {
  type: 'text',
  clearable: true,
  showWordLimit: false
})
```

**Props 验证和类型守卫**

```typescript
// 创建 Props 验证工具
function createPropsValidator<T extends Record<string, any>>(
  props: T,
  validators: {
    [K in keyof T]?: (value: T[K]) => boolean
  }
) {
  const errors: string[] = []

  for (const [key, validator] of Object.entries(validators)) {
    if (validator && !validator(props[key as keyof T])) {
      errors.push(`属性 ${key} 验证失败`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 在组件中使用
const props = defineProps<{
  userId: string | number
  userName: string
  status: '0' | '1'
}>()

onMounted(() => {
  const { isValid, errors } = createPropsValidator(props, {
    userId: (v) => v !== undefined && v !== '',
    userName: (v) => typeof v === 'string' && v.length > 0,
    status: (v) => ['0', '1'].includes(v)
  })

  if (!isValid) {
    console.error('Props 验证失败:', errors)
  }
})

// Emits 类型定义
interface ComponentEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string, oldValue: string): void
  (e: 'submit', data: FormData): void
}

const emit = defineEmits<ComponentEmits>()

// 类型安全的 emit 调用
emit('update:modelValue', 'new value')
emit('change', 'new', 'old')
emit('submit', formData)
```

---

### 4. 联合类型判断不正确或类型收窄失败

**问题描述**

使用联合类型时，类型收窄（Type Narrowing）不生效，导致在条件分支中无法正确识别具体类型，或者类型守卫函数不能正确缩小类型范围。

**问题原因**

- 类型守卫函数返回值类型声明错误
- 使用了错误的类型检查方式
- 对象的可辨识联合类型缺少共同的辨识属性
- 异步操作导致类型收窄失效
- 赋值操作重置了类型收窄的结果

**解决方案**

```typescript
// ❌ 错误示例：类型收窄失效
interface Dog {
  type: 'dog'
  bark: () => void
}

interface Cat {
  type: 'cat'
  meow: () => void
}

type Animal = Dog | Cat

const processAnimal = (animal: Animal) => {
  // 直接调用方法会报错
  animal.bark() // 错误：类型"Animal"上不存在属性"bark"
}

// ✅ 正确示例：使用辨识属性进行类型收窄
const processAnimal = (animal: Animal) => {
  if (animal.type === 'dog') {
    // TypeScript 知道这里 animal 是 Dog 类型
    animal.bark()
  } else {
    // TypeScript 知道这里 animal 是 Cat 类型
    animal.meow()
  }
}

// ❌ 错误示例：类型守卫返回值类型错误
function isDog(animal: Animal): boolean {
  return animal.type === 'dog'
}

const processWithGuard = (animal: Animal) => {
  if (isDog(animal)) {
    // 类型仍然是 Animal，没有收窄
    animal.bark() // 错误
  }
}

// ✅ 正确示例：使用 is 关键字定义类型守卫
function isDog(animal: Animal): animal is Dog {
  return animal.type === 'dog'
}

const processWithGuard = (animal: Animal) => {
  if (isDog(animal)) {
    // 类型正确收窄为 Dog
    animal.bark() // 正确
  }
}
```

**复杂联合类型处理**

```typescript
// 登录请求的联合类型
interface PasswordLogin {
  authType: 'password'
  userName: string
  password: string
  rememberMe?: boolean
}

interface EmailLogin {
  authType: 'email'
  email: string
  code: string
}

interface SmsLogin {
  authType: 'sms'
  phone: string
  code: string
}

interface SocialLogin {
  authType: 'social'
  source: string
  code: string
  state: string
}

type LoginRequest = PasswordLogin | EmailLogin | SmsLogin | SocialLogin

// 类型守卫函数集合
const loginGuards = {
  isPassword: (req: LoginRequest): req is PasswordLogin =>
    req.authType === 'password',
  isEmail: (req: LoginRequest): req is EmailLogin =>
    req.authType === 'email',
  isSms: (req: LoginRequest): req is SmsLogin =>
    req.authType === 'sms',
  isSocial: (req: LoginRequest): req is SocialLogin =>
    req.authType === 'social'
}

// 使用 switch 进行穷尽性检查
const processLogin = (request: LoginRequest) => {
  switch (request.authType) {
    case 'password':
      return handlePasswordLogin(request.userName, request.password)
    case 'email':
      return handleEmailLogin(request.email, request.code)
    case 'sms':
      return handleSmsLogin(request.phone, request.code)
    case 'social':
      return handleSocialLogin(request.source, request.code)
    default:
      // 穷尽性检查：如果有未处理的类型，这里会报错
      const _exhaustiveCheck: never = request
      throw new Error(`未处理的登录类型: ${_exhaustiveCheck}`)
  }
}
```

**异步操作中的类型收窄**

```typescript
// ❌ 错误示例：异步操作后类型收窄失效
interface LoadingState {
  status: 'loading'
}

interface SuccessState {
  status: 'success'
  data: SysUserVo
}

interface ErrorState {
  status: 'error'
  error: Error
}

type AsyncState = LoadingState | SuccessState | ErrorState

const state = ref<AsyncState>({ status: 'loading' })

const fetchData = async () => {
  if (state.value.status === 'success') {
    // 在这个分支中，state.value 是 SuccessState
    console.log(state.value.data.userName)

    await someAsyncOperation()

    // 异步操作后，类型收窄失效
    // state.value 可能已经变化
    console.log(state.value.data.userName) // 可能报错
  }
}

// ✅ 正确示例：保存类型收窄后的引用
const fetchData = async () => {
  const currentState = state.value

  if (currentState.status === 'success') {
    // currentState 是 SuccessState 类型
    const userData = currentState.data

    await someAsyncOperation()

    // userData 仍然是类型安全的
    console.log(userData.userName)

    // 如果需要使用最新状态，重新检查
    if (state.value.status === 'success') {
      console.log(state.value.data.userName)
    }
  }
}

// 使用计算属性封装类型收窄
const userData = computed(() => {
  if (state.value.status === 'success') {
    return state.value.data
  }
  return null
})

// 类型守卫组合使用
const isLoaded = computed(() => state.value.status === 'success')

watchEffect(() => {
  if (isLoaded.value && state.value.status === 'success') {
    // 双重检查确保类型安全
    console.log(state.value.data.userName)
  }
})
```

**in 操作符类型收窄**

```typescript
// 使用 in 操作符进行类型收窄
interface AdminUser {
  role: 'admin'
  permissions: string[]
  manageUsers: () => void
}

interface NormalUser {
  role: 'user'
  preferences: Record<string, any>
}

type User = AdminUser | NormalUser

const processUser = (user: User) => {
  // 使用 in 操作符检查属性
  if ('permissions' in user) {
    // TypeScript 知道这里是 AdminUser
    user.manageUsers()
    console.log(user.permissions)
  } else {
    // TypeScript 知道这里是 NormalUser
    console.log(user.preferences)
  }
}

// 结合 typeof 和 instanceof
const processValue = (value: string | number | Date | null) => {
  if (value === null) {
    return 'null'
  }

  if (typeof value === 'string') {
    return value.toUpperCase()
  }

  if (typeof value === 'number') {
    return value.toFixed(2)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  // 穷尽性检查
  const _exhaustive: never = value
  return _exhaustive
}
```

---

### 5. API 响应类型与实际数据不匹配

**问题描述**

定义的 API 响应类型与后端实际返回的数据结构不匹配，导致运行时错误、属性访问失败或数据格式异常。

**问题原因**

- 后端接口更新后前端类型未同步更新
- 后端返回的字段名称与类型定义不一致（驼峰 vs 下划线）
- 可空字段处理不当
- 数值类型与字符串类型混用
- 嵌套对象结构不匹配

**解决方案**

```typescript
// ❌ 错误示例：类型定义与实际数据不匹配
interface UserVo {
  userId: number       // 后端可能返回 string
  userName: string
  createTime: Date     // 后端返回的是 string
  roles: RoleVo[]      // 后端可能返回 null
}

// ✅ 正确示例：使用兼容性更强的类型定义
interface UserVo {
  userId: string | number   // 兼容两种类型
  userName: string
  createTime: string        // 使用字符串，前端解析
  roles: RoleVo[] | null    // 明确可能为 null
}

// 更好的做法：定义严格类型 + 转换函数
interface UserApiResponse {
  user_id: string
  user_name: string
  create_time: string
  roles: RoleApiResponse[] | null
}

interface UserVo {
  userId: string
  userName: string
  createTime: Date
  roles: RoleVo[]
}

// 类型转换函数
function transformUserResponse(response: UserApiResponse): UserVo {
  return {
    userId: response.user_id,
    userName: response.user_name,
    createTime: new Date(response.create_time),
    roles: response.roles?.map(transformRoleResponse) ?? []
  }
}
```

**运行时类型验证**

```typescript
// 使用 zod 进行运行时类型验证
import { z } from 'zod'

// 定义 schema
const UserVoSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  userName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['0', '1']),
  roles: z.array(z.object({
    roleId: z.union([z.string(), z.number()]),
    roleName: z.string()
  })).nullable().transform(v => v ?? [])
})

// 从 schema 推导类型
type UserVo = z.infer<typeof UserVoSchema>

// API 请求封装
async function fetchUser(userId: string): Promise<UserVo> {
  const [error, response] = await http.get(`/api/user/${userId}`)

  if (error) {
    throw error
  }

  // 运行时验证
  const result = UserVoSchema.safeParse(response)

  if (!result.success) {
    console.error('API 响应类型验证失败:', result.error)
    throw new Error('数据格式错误')
  }

  return result.data
}

// 自定义验证函数（不依赖第三方库）
function validateUserVo(data: unknown): data is UserVo {
  if (!data || typeof data !== 'object') {
    return false
  }

  const obj = data as Record<string, unknown>

  // 必填字段验证
  if (typeof obj.userId !== 'string' && typeof obj.userId !== 'number') {
    console.warn('userId 类型错误')
    return false
  }

  if (typeof obj.userName !== 'string') {
    console.warn('userName 类型错误')
    return false
  }

  if (!['0', '1'].includes(obj.status as string)) {
    console.warn('status 值错误')
    return false
  }

  // 可选字段验证
  if (obj.email !== undefined && typeof obj.email !== 'string') {
    console.warn('email 类型错误')
    return false
  }

  return true
}
```

**API 响应包装器**

```typescript
// 创建类型安全的 API 响应处理器
class ApiResponseHandler<T> {
  private validators: ((data: unknown) => boolean)[] = []
  private transformers: ((data: any) => any)[] = []

  addValidator(validator: (data: unknown) => boolean): this {
    this.validators.push(validator)
    return this
  }

  addTransformer(transformer: (data: any) => any): this {
    this.transformers.push(transformer)
    return this
  }

  process(data: unknown): T {
    // 验证
    for (const validator of this.validators) {
      if (!validator(data)) {
        throw new Error('API 响应验证失败')
      }
    }

    // 转换
    let result = data
    for (const transformer of this.transformers) {
      result = transformer(result)
    }

    return result as T
  }
}

// 使用示例
const userHandler = new ApiResponseHandler<UserVo>()
  .addValidator((data) => !!data && typeof data === 'object')
  .addValidator((data: any) => typeof data.userName === 'string')
  .addTransformer((data) => ({
    ...data,
    createTime: new Date(data.createTime),
    roles: data.roles ?? []
  }))

// 在 API 函数中使用
async function getUser(userId: string): Promise<UserVo> {
  const [error, response] = await http.get(`/api/user/${userId}`)

  if (error) throw error

  return userHandler.process(response)
}

// 分页响应处理
interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

function createPageHandler<T>(
  itemValidator: (item: unknown) => item is T
): (data: unknown) => PageResult<T> {
  return (data: unknown): PageResult<T> => {
    if (!data || typeof data !== 'object') {
      throw new Error('无效的分页响应')
    }

    const page = data as Record<string, unknown>

    if (!Array.isArray(page.records)) {
      throw new Error('records 必须是数组')
    }

    const validRecords = page.records.filter(itemValidator)

    if (validRecords.length !== page.records.length) {
      console.warn('部分记录验证失败')
    }

    return {
      records: validRecords,
      total: Number(page.total) || 0,
      current: Number(page.current) || 1,
      size: Number(page.size) || 10
    }
  }
}
```

---

### 6. 导入类型时循环依赖问题

**问题描述**

多个模块之间相互导入类型定义时，出现循环依赖错误，导致类型无法正确解析或运行时报错。

**问题原因**

- 类型定义和运行时代码混合在同一文件中
- 模块之间存在双向依赖
- 类型和值的导入方式使用不当
- 接口继承形成循环链

**解决方案**

```typescript
// ❌ 错误示例：循环依赖
// userTypes.ts
import { DeptVo } from './deptTypes'  // 导入部门类型

export interface UserVo {
  userId: string
  dept: DeptVo  // 用户包含部门
}

// deptTypes.ts
import { UserVo } from './userTypes'  // 导入用户类型

export interface DeptVo {
  deptId: string
  leader: UserVo  // 部门包含负责人
}

// ✅ 正确示例：使用 type 关键字导入
// userTypes.ts
import type { DeptVo } from './deptTypes'  // 使用 type 导入

export interface UserVo {
  userId: string
  dept: DeptVo
}

// deptTypes.ts
import type { UserVo } from './userTypes'  // 使用 type 导入

export interface DeptVo {
  deptId: string
  leader: UserVo
}

// ✅ 更好的做法：提取共享类型到独立文件
// sharedTypes.ts - 基础类型定义
export interface BaseEntity {
  id: string | number
  createTime?: string
  updateTime?: string
}

// userTypes.ts
import type { BaseEntity } from './sharedTypes'

export interface UserVo extends BaseEntity {
  userId: string
  userName: string
  deptId?: string  // 使用 ID 引用，而不是完整对象
}

export interface UserWithDept extends UserVo {
  dept?: DeptVo  // 可选的部门信息
}

// 前向声明
export interface DeptVo extends BaseEntity {
  deptId: string
  deptName: string
  leaderId?: string
}
```

**类型聚合模式**

```typescript
// types/index.ts - 类型聚合文件
// 按顺序导出，避免循环依赖

// 1. 首先导出基础类型
export * from './base'

// 2. 然后导出不依赖其他业务类型的类型
export * from './auth'
export * from './common'

// 3. 最后导出可能有依赖的类型
export * from './user'
export * from './dept'
export * from './role'

// types/base.ts
export interface BaseEntity {
  id: string | number
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

// types/user.ts
import type { BaseEntity, PageQuery } from './base'

export interface UserVo extends BaseEntity {
  userId: string
  userName: string
  nickName: string
  email?: string
  phone?: string
  status: '0' | '1'
  // 使用 ID 引用关联实体
  deptId?: string
  roleIds?: string[]
}

export interface UserQuery extends PageQuery {
  userName?: string
  phone?: string
  status?: string
  deptId?: string
}
```

**延迟加载类型**

```typescript
// 使用接口合并解决复杂的循环依赖
// types/declarations.ts
export interface UserVo {
  userId: string
  userName: string
}

export interface DeptVo {
  deptId: string
  deptName: string
}

// types/user-extended.ts
import type { DeptVo } from './declarations'

// 使用声明合并扩展接口
declare module './declarations' {
  interface UserVo {
    dept?: DeptVo
    roles?: RoleVo[]
  }
}

export interface RoleVo {
  roleId: string
  roleName: string
}

// types/dept-extended.ts
import type { UserVo } from './declarations'

declare module './declarations' {
  interface DeptVo {
    leader?: UserVo
    children?: DeptVo[]
  }
}

// 使用时导入扩展后的类型
import type { UserVo, DeptVo } from './declarations'
import './user-extended'
import './dept-extended'

// 现在 UserVo 包含 dept 和 roles
// DeptVo 包含 leader 和 children
```

**运行时与类型分离**

```typescript
// ❌ 错误示例：类型和运行时代码混合
// userService.ts
import { DeptService } from './deptService'

export interface UserVo {
  userId: string
  dept: DeptVo
}

export class UserService {
  private deptService = new DeptService()

  async getUser(id: string): Promise<UserVo> {
    // ...
  }
}

// ✅ 正确示例：分离类型和实现
// types/user.ts - 纯类型定义
export interface UserVo {
  userId: string
  deptId?: string
}

// types/dept.ts - 纯类型定义
export interface DeptVo {
  deptId: string
  leaderId?: string
}

// services/userService.ts - 运行时代码
import type { UserVo } from '@/types/user'
import type { DeptVo } from '@/types/dept'
import { deptService } from './deptService'

export class UserService {
  async getUserWithDept(id: string): Promise<UserVo & { dept?: DeptVo }> {
    const user = await this.getUser(id)
    const dept = user.deptId
      ? await deptService.getDept(user.deptId)
      : undefined
    return { ...user, dept }
  }
}
```

---

### 7. 全局类型声明不生效或冲突

**问题描述**

在 `.d.ts` 文件中定义的全局类型在项目其他文件中无法识别，或者与其他类型声明产生冲突，导致类型错误。

**问题原因**

- `.d.ts` 文件中使用了 `import/export` 语句，变成了模块
- `tsconfig.json` 中的 `include` 配置未包含声明文件
- 多个声明文件定义了同名类型
- 声明合并规则理解错误
- 第三方库类型与自定义类型冲突

**解决方案**

```typescript
// ❌ 错误示例：使用 import 导致文件变成模块
// types/global.d.ts
import { SysUserVo } from '@/api/system/user/userTypes'

// 这个 declare global 不会生效，因为文件已经是模块了
declare global {
  interface Window {
    currentUser: SysUserVo
  }
}

// ✅ 正确示例：使用 import type 或类型引用
// types/global.d.ts
/// <reference types="vite/client" />

// 方法1：使用三斜线指令引用类型
/// <reference path="./user.d.ts" />

declare global {
  interface Window {
    currentUser: SysUserVo
  }

  // 全局类型声明
  type Result<T = any> = Promise<[Error | null, T | null]>

  interface R<T = any> {
    code: number
    msg: string
    data: T
  }
}

// 方法2：在模块文件中正确声明全局类型
// types/global.d.ts
export {}  // 使文件成为模块

declare global {
  // 使用 typeof import 引用模块类型
  type AppRouter = typeof import('@/router')['default']

  // 内联类型定义
  interface PageResult<T = any> {
    records: T[]
    total: number
    current: number
    size: number
  }
}
```

**tsconfig.json 配置**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["vite/client", "node"],
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "src/**/*.d.ts",
    "types/**/*.d.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

**类型声明合并**

```typescript
// 声明合并规则
// 1. 接口合并：同名接口会合并属性
interface User {
  id: string
  name: string
}

interface User {
  email: string
  phone: string
}

// 合并后的 User 接口包含所有属性
const user: User = {
  id: '1',
  name: 'admin',
  email: 'admin@example.com',
  phone: '13800138000'
}

// 2. 模块扩展：扩展第三方库类型
// types/vue-router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // 扩展路由元信息
    title?: string
    icon?: string
    hidden?: boolean
    noCache?: boolean
    permissions?: string[]
  }
}

// 3. 命名空间扩展
// types/element-plus.d.ts
declare module 'element-plus' {
  // 扩展 Element Plus 类型
  export interface FormItemRule {
    // 自定义规则属性
    asyncValidator?: (
      rule: FormItemRule,
      value: any,
      callback: (error?: Error) => void
    ) => Promise<void>
  }
}
```

**处理类型冲突**

```typescript
// ❌ 错误示例：类型名称冲突
// types/global.d.ts
declare type Result = { success: boolean }

// api/types.ts
export type Result<T> = Promise<[Error | null, T | null]>  // 与全局 Result 冲突

// ✅ 正确示例：使用命名空间隔离
// types/global.d.ts
declare namespace App {
  interface Result {
    success: boolean
    message?: string
  }

  interface Config {
    apiBase: string
    timeout: number
  }
}

// api/types.ts
export namespace Api {
  export type Result<T> = Promise<[Error | null, T | null]>

  export interface Response<T> {
    code: number
    msg: string
    data: T
  }
}

// 使用时明确指定命名空间
const appResult: App.Result = { success: true }
const apiResult: Api.Result<string> = Promise.resolve([null, 'data'])

// 使用别名解决冲突
import { Result as ApiResult } from '@/api/types'

type LocalResult = App.Result

function handleResults(
  appResult: LocalResult,
  apiResult: ApiResult<string>
) {
  // ...
}
```

**环境类型声明**

```typescript
// types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'staging'
  readonly VITE_APP_MOCK: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 使用环境变量时有类型提示
const apiBase = import.meta.env.VITE_APP_BASE_API
const isDev = import.meta.env.VITE_APP_ENV === 'development'

// types/shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明静态资源模块
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}
```

---

### 8. 复杂类型导致 IDE 性能下降

**问题描述**

使用过于复杂的类型定义（深度嵌套、递归类型、大量条件类型）导致 TypeScript 语言服务响应缓慢，IDE 卡顿，类型检查时间过长。

**问题原因**

- 递归类型没有深度限制
- 条件类型嵌套过深
- 泛型参数过多
- 联合类型成员过多
- 映射类型处理大型对象

**解决方案**

```typescript
// ❌ 错误示例：无限递归类型
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>  // 无限递归
    : T[K]
}

// 对于深层嵌套对象，这会导致严重的性能问题
interface DeepObject {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            // ... 更多层级
          }
        }
      }
    }
  }
}

type SlowType = DeepReadonly<DeepObject>  // 非常慢

// ✅ 正确示例：添加递归深度限制
type DeepReadonlyWithLimit<T, Depth extends any[] = []> =
  Depth['length'] extends 5
    ? T  // 达到深度限制，停止递归
    : T extends object
      ? T extends Function
        ? T
        : { readonly [K in keyof T]: DeepReadonlyWithLimit<T[K], [...Depth, any]> }
      : T

type FastType = DeepReadonlyWithLimit<DeepObject>  // 快速完成
```

**优化条件类型**

```typescript
// ❌ 错误示例：复杂的条件类型链
type ComplexConditional<T> =
  T extends string
    ? T extends `${infer A}-${infer B}`
      ? A extends `${number}`
        ? B extends `${number}`
          ? [number, number]
          : [number, string]
        : B extends `${number}`
          ? [string, number]
          : [string, string]
      : string
    : T extends number
      ? T extends 0
        ? 'zero'
        : T extends 1
          ? 'one'
          : 'many'
      : never

// ✅ 正确示例：拆分为多个简单类型
type ParseFirst<T extends string> =
  T extends `${infer A}-${string}`
    ? A extends `${number}` ? number : string
    : string

type ParseSecond<T extends string> =
  T extends `${string}-${infer B}`
    ? B extends `${number}` ? number : string
    : string

type ParsePair<T extends string> = [ParseFirst<T>, ParseSecond<T>]

// 使用更简单的类型
type SimpleResult = ParsePair<'123-abc'>  // [number, string]
```

**减少联合类型成员**

```typescript
// ❌ 错误示例：过大的联合类型
type AllHTMLElements =
  | 'div' | 'span' | 'p' | 'a' | 'button' | 'input' | 'select' | 'textarea'
  | 'form' | 'label' | 'table' | 'tr' | 'td' | 'th' | 'thead' | 'tbody'
  | 'ul' | 'ol' | 'li' | 'dl' | 'dt' | 'dd'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'header' | 'footer' | 'nav' | 'main' | 'section' | 'article' | 'aside'
  // ... 更多元素

// 对每个联合成员进行条件类型检查非常慢
type ElementProps<T extends AllHTMLElements> =
  T extends 'input' ? InputProps :
  T extends 'button' ? ButtonProps :
  // ... 每个元素都需要检查

// ✅ 正确示例：使用映射类型
interface ElementPropsMap {
  input: InputProps
  button: ButtonProps
  select: SelectProps
  textarea: TextareaProps
  // ... 其他元素
}

type ElementProps<T extends keyof ElementPropsMap> = ElementPropsMap[T]

// 使用索引访问类型代替条件类型
type InputElementProps = ElementPropsMap['input']  // 快速
```

**缓存复杂类型计算**

```typescript
// ❌ 错误示例：重复计算复杂类型
interface ComplexData {
  users: UserVo[]
  roles: RoleVo[]
  permissions: PermissionVo[]
  config: ConfigVo
}

// 每次使用都会重新计算
function process1(data: DeepReadonly<ComplexData>) { }
function process2(data: DeepReadonly<ComplexData>) { }
function process3(data: DeepReadonly<ComplexData>) { }

// ✅ 正确示例：使用类型别名缓存
type ReadonlyComplexData = DeepReadonly<ComplexData>

function process1(data: ReadonlyComplexData) { }
function process2(data: ReadonlyComplexData) { }
function process3(data: ReadonlyComplexData) { }

// 预计算常用的复杂类型
type UserFormData = Required<Pick<UserVo, 'userName' | 'status'>> &
                    Partial<Omit<UserVo, 'userName' | 'status'>>

// 创建类型工具库
namespace TypeUtils {
  export type PickRequired<T, K extends keyof T> =
    Required<Pick<T, K>> & Partial<Omit<T, K>>

  export type MakeOptional<T, K extends keyof T> =
    Omit<T, K> & Partial<Pick<T, K>>

  export type Nullable<T> = T | null | undefined
}

// 使用预定义的工具类型
type OptionalUserForm = TypeUtils.MakeOptional<UserVo, 'userId' | 'createTime'>
```

**性能监控和优化建议**

```typescript
// tsconfig.json 性能优化配置
{
  "compilerOptions": {
    // 跳过库检查，加快编译速度
    "skipLibCheck": true,

    // 使用增量编译
    "incremental": true,

    // 指定类型根目录，减少搜索范围
    "typeRoots": ["./node_modules/@types", "./src/types"],

    // 只包含必要的库类型
    "types": ["vite/client", "node"]
  },

  // 减少 include 范围
  "include": ["src/**/*"],

  // 排除不需要类型检查的目录
  "exclude": [
    "node_modules",
    "dist",
    "**/*.js",
    "**/*.spec.ts"
  ]
}

// 类型性能检测工具
// 使用 @typescript/analyze-trace 分析类型检查性能
// npx tsc --generateTrace ./trace
// npx @typescript/analyze-trace ./trace

// IDE 性能优化
// 1. 禁用自动导入建议（对于大型项目）
// 2. 使用项目引用拆分大型项目
// 3. 配置 tsserver 内存限制

// 项目引用示例
// tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/api" }
  ]
}

// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true
  }
}
```

**简化复杂业务类型**

```typescript
// ❌ 错误示例：过度设计的类型系统
type FormField<
  TValue,
  TValidators extends Validator<TValue>[],
  TFormatter extends Formatter<TValue>,
  TParser extends Parser<TValue>,
  TDisabled extends boolean,
  TRequired extends boolean,
  TVisible extends boolean
> = {
  value: TValue
  validators: TValidators
  formatter: TFormatter
  parser: TParser
  disabled: TDisabled
  required: TRequired
  visible: TVisible
}

// ✅ 正确示例：简化的类型设计
interface FormField<T = any> {
  value: T
  rules?: FormItemRule[]
  formatter?: (value: T) => string
  parser?: (value: string) => T
  disabled?: boolean
  required?: boolean
  visible?: boolean
}

// 使用简单的条件配置
interface FieldConfig {
  type: 'input' | 'select' | 'date' | 'number'
  props?: Record<string, any>
}

// 类型推断而不是显式类型参数
function createField<T>(defaultValue: T, config?: Partial<FormField<T>>): FormField<T> {
  return {
    value: defaultValue,
    ...config
  }
}

// 使用时 TypeScript 自动推断类型
const nameField = createField('', { required: true })  // FormField<string>
const ageField = createField(0, { rules: [{ min: 0, max: 150 }] })  // FormField<number>
```
