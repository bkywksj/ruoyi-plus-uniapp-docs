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
