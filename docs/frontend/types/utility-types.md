# 工具类型

## 介绍

工具类型(Utility Types)是 TypeScript 提供的一组强大的类型转换工具,用于从现有类型构造新类型。RuoYi-Plus-UniApp 前端项目充分利用了 TypeScript 内置工具类型,并在此基础上定义了一套项目特定的工具类型系统,为 API 交互、UI 控制、数据处理等场景提供完整的类型安全保障。

通过合理使用工具类型,可以显著提升代码的类型安全性、可维护性和开发效率。工具类型让我们能够基于已有类型灵活派生出新类型,避免重复定义,实现类型复用和组合。

**核心价值:**

- **类型安全** - 编译时发现潜在错误,减少运行时异常
- **代码复用** - 基于已有类型派生新类型,避免重复定义
- **自动推导** - 充分利用 TypeScript 的类型推导能力
- **文档作用** - 类型即文档,清晰表达数据结构和约束
- **重构友好** - 类型系统辅助重构,降低改动风险
- **智能提示** - IDE 自动补全和类型提示,提升开发体验

## TypeScript 内置工具类型

### 属性修饰工具类型

这类工具类型用于修改对象类型的属性特性,如可选/必选、只读等。

#### Partial - 所有属性可选

将类型 `T` 的所有属性转换为可选属性。

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

**使用场景:**

1. 表单初始化 - 表单字段可能只填写部分
2. 数据更新 - 只更新部分字段,其他保持不变
3. 配置选项 - 允许用户只配置部分选项

**代码示例:**

```typescript
import type { UserVo } from '@/api/system/user/types'

// 完整的用户对象
interface UserVo {
  userId: string
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  status: string
  createTime: string
}

// 表单数据(部分字段可选)
const formData: Partial<UserVo> = {
  userName: 'admin',
  nickName: '管理员'
  // 其他字段可以不填
}

// 更新用户信息(只更新部分字段)
const updateData: Partial<UserVo> = {
  nickName: '超级管理员',
  email: 'admin@example.com'
}

// 函数参数使用 Partial
function updateUser(userId: string, data: Partial<UserVo>) {
  // 只更新提供的字段
}

updateUser('1', { nickName: '新昵称' })
```

**最佳实践:**

- <Ok/> 用于表单编辑场景,允许只修改部分字段
- <Ok/> 用于配置对象,提供默认值
- <No/> 避免过度使用,可能导致类型过于宽松

#### Required - 所有属性必选

将类型 `T` 的所有属性转换为必选属性,移除可选修饰符 `?`。

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

**使用场景:**

1. 数据提交 - 确保所有必填字段都已提供
2. 严格校验 - 强制要求完整数据
3. 配置校验 - 验证配置对象完整性

**代码示例:**

```typescript
interface UserForm {
  userName?: string
  nickName?: string
  email?: string
  phonenumber?: string
}

// 提交时要求所有字段必填
type UserSubmitData = Required<UserForm>

const submitData: UserSubmitData = {
  userName: 'admin',      // 必填
  nickName: '管理员',      // 必填
  email: 'admin@qq.com',  // 必填
  phonenumber: '13800138000'  // 必填
}

// 配置验证函数
function validateConfig(config: Required<SystemConfig>) {
  // 确保所有配置项都存在
  console.log(config.theme)
  console.log(config.language)
  // 不会出现 undefined
}
```

**最佳实践:**

- <Ok/> 用于数据提交前的类型约束
- <Ok/> 用于配置对象的完整性检查
- <No/> 避免与可选链(`?.`)混用,容易产生困惑

#### Readonly - 所有属性只读

将类型 `T` 的所有属性转换为只读属性,防止修改。

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

**使用场景:**

1. 不可变数据 - 防止意外修改
2. 配置对象 - 运行时配置不应被修改
3. 常量定义 - 定义常量对象

**代码示例:**

```typescript
interface SystemConfig {
  theme: string
  language: string
  pageSize: number
}

// 只读配置(运行时不允许修改)
const config: Readonly<SystemConfig> = {
  theme: 'dark',
  language: 'zh-CN',
  pageSize: 20
}

// ❌ 编译错误: 无法分配到 "theme" ,因为它是只读属性
// config.theme = 'light'

// 深层只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

// 只读常量
const API_CONFIG: Readonly<{
  BASE_URL: string
  TIMEOUT: number
}> = {
  BASE_URL: 'https://api.example.com',
  TIMEOUT: 30000
}
```

**最佳实践:**

- <Ok/> 用于配置对象,防止运行时修改
- <Ok/> 用于 Props 定义,确保不可变性
- <Ok/> 用于常量定义,明确表达不可修改意图
- <No/> 注意只读是浅层的,嵌套对象仍可修改

### 属性选择工具类型

这类工具类型用于从对象类型中选择或排除特定属性。

#### Pick - 选择部分属性

从类型 `T` 中选择指定的属性 `K`,构造新类型。

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

**使用场景:**

1. 提取关键字段 - 只保留需要的字段
2. 精简数据结构 - 减少传输数据量
3. 视图模型 - 创建特定场景的数据模型

**代码示例:**

```typescript
interface UserVo {
  userId: string
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  status: string
  createTime: string
  updateTime: string
}

// 用户基本信息(只包含 id、用户名、昵称)
type UserBasic = Pick<UserVo, 'userId' | 'userName' | 'nickName'>

const userInfo: UserBasic = {
  userId: '1',
  userName: 'admin',
  nickName: '管理员'
}

// 用户列表展示字段
type UserListItem = Pick<
  UserVo,
  'userId' | 'userName' | 'nickName' | 'status' | 'createTime'
>

// 用户选择器(下拉框)
type UserOption = Pick<UserVo, 'userId' | 'userName'>

const options: UserOption[] = [
  { userId: '1', userName: 'admin' },
  { userId: '2', userName: 'user' }
]
```

**最佳实践:**

- <Ok/> 用于创建轻量级视图模型
- <Ok/> 用于 API 请求参数类型
- <Ok/> 用于下拉选择器选项类型
- <Warn/> 提取的字段应该有明确的业务含义

#### Omit - 排除部分属性

从类型 `T` 中排除指定的属性 `K`,保留其余属性。

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

**使用场景:**

1. 排除敏感字段 - 如密码、Token 等
2. 表单数据 - 排除自动生成的字段(如 ID、时间戳)
3. 数据脱敏 - 移除不需要展示的字段

**代码示例:**

```typescript
interface UserBo {
  userId: string
  userName: string
  password: string
  nickName: string
  email: string
  phonenumber: string
  createTime: string
  updateTime: string
}

// 用户信息(排除密码)
type UserWithoutPassword = Omit<UserBo, 'password'>

const userInfo: UserWithoutPassword = {
  userId: '1',
  userName: 'admin',
  nickName: '管理员',
  email: 'admin@qq.com',
  phonenumber: '13800138000',
  createTime: '2024-01-01',
  updateTime: '2024-01-02'
  // password 字段不存在
}

// 新增用户表单(排除自动生成字段)
type UserAddForm = Omit<UserBo, 'userId' | 'createTime' | 'updateTime'>

const addForm: UserAddForm = {
  userName: 'newuser',
  password: '123456',
  nickName: '新用户',
  email: 'newuser@qq.com',
  phonenumber: '13800138001'
}

// 排除多个字段
type UserPublicInfo = Omit<UserBo, 'password' | 'createTime' | 'updateTime'>
```

**最佳实践:**

- <Ok/> 用于排除敏感信息
- <Ok/> 用于表单数据定义
- <Ok/> 用于 API 响应数据清洗
- <Warn/> 优先使用 Pick,Omit 作为补充

### 键值映射工具类型

这类工具类型用于创建键值对映射结构。

#### Record - 键值对类型

构造一个对象类型,键为 `K`,值为 `T`。

```typescript
type Record<K extends keyof any, T> = {
  [P in K]: T
}
```

**使用场景:**

1. 字典/映射 - 创建键值对映射
2. 枚举映射 - 将枚举值映射到描述
3. 配置对象 - 动态键名的配置

**代码示例:**

```typescript
// 用户字典(ID -> 用户对象)
type UserMap = Record<string, UserVo>

const userMap: UserMap = {
  '1': { userId: '1', userName: 'admin', /* ... */ },
  '2': { userId: '2', userName: 'user', /* ... */ }
}

// 状态映射(状态码 -> 状态描述)
type StatusMap = Record<string, string>

const statusMap: StatusMap = {
  '0': '正常',
  '1': '停用'
}

// 权限映射
type PermissionMap = Record<string, boolean>

const permissions: PermissionMap = {
  'system:user:add': true,
  'system:user:edit': true,
  'system:user:delete': false
}

// 表单错误映射
type FormErrors = Record<keyof UserForm, string | undefined>

const errors: FormErrors = {
  userName: '用户名不能为空',
  nickName: undefined,
  email: '邮箱格式不正确'
}
```

**最佳实践:**

- <Ok/> 用于创建映射表
- <Ok/> 用于枚举到描述的转换
- <Ok/> 用于缓存数据结构
- <Warn/> 注意键名类型约束

### 函数相关工具类型

这类工具类型用于提取函数的类型信息。

#### ReturnType - 函数返回类型

提取函数类型 `T` 的返回类型。

```typescript
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any
```

**使用场景:**

1. API 返回类型 - 提取 API 函数返回类型
2. 工具函数 - 基于函数推导类型
3. 类型推导 - 避免重复定义

**代码示例:**

```typescript
import { getUserInfo } from '@/api/system/user'

// 自动推导 API 返回类型
type UserInfo = ReturnType<typeof getUserInfo>

// 提取数据类型
type UserData = Awaited<ReturnType<typeof getUserInfo>>

// 工具函数返回类型
function formatUser(user: UserVo) {
  return {
    id: user.userId,
    name: user.userName,
    displayName: `${user.userName}(${user.nickName})`
  }
}

type FormattedUser = ReturnType<typeof formatUser>

const user: FormattedUser = {
  id: '1',
  name: 'admin',
  displayName: 'admin(管理员)'
}
```

**最佳实践:**

- <Ok/> 用于推导 API 返回类型
- <Ok/> 用于工具函数类型提取
- <Ok/> 避免重复定义类型
- <Warn/> 函数需要明确的返回类型

#### Parameters - 函数参数类型

提取函数类型 `T` 的参数类型,返回元组类型。

```typescript
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never
```

**使用场景:**

1. 参数复用 - 复用函数参数类型
2. 高阶函数 - 包装函数时保持参数类型
3. Mock 数据 - 生成测试数据

**代码示例:**

```typescript
function updateUser(userId: string, data: Partial<UserVo>, options?: {
  silent?: boolean
}) {
  // 更新用户
}

// 提取参数类型
type UpdateUserParams = Parameters<typeof updateUser>
// [string, Partial<UserVo>, { silent?: boolean } | undefined]

// 使用参数类型
const params: UpdateUserParams = [
  '1',
  { nickName: '新昵称' },
  { silent: true }
]

updateUser(...params)

// 提取单个参数类型
type UserId = Parameters<typeof updateUser>[0]  // string
type UserData = Parameters<typeof updateUser>[1]  // Partial<UserVo>

// 高阶函数包装
function withLoading<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log('Loading...')
    const result = fn(...args)
    console.log('Done')
    return result
  }
}
```

**最佳实践:**

- <Ok/> 用于函数参数类型复用
- <Ok/> 用于高阶函数类型定义
- <Ok/> 用于测试用例参数生成
- <Warn/> 元组类型访问需要索引

#### Awaited - Promise 返回类型

递归解包 Promise 类型,提取最终的值类型。

```typescript
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
```

**使用场景:**

1. 异步函数 - 提取 async 函数返回的实际类型
2. Promise 链 - 解包嵌套 Promise
3. API 调用 - 获取接口返回数据类型

**代码示例:**

```typescript
// API 函数
async function getUserInfo(userId: string): Promise<R<UserVo>> {
  return request.get(`/user/${userId}`)
}

// 提取 Promise 返回类型
type UserApiResponse = Awaited<ReturnType<typeof getUserInfo>>  // R<UserVo>

// 提取数据类型
type UserData = Awaited<ReturnType<typeof getUserInfo>>['data']  // UserVo

// 嵌套 Promise
type NestedPromise = Promise<Promise<string>>
type Resolved = Awaited<NestedPromise>  // string

// 异步处理函数
async function processUser(userId: string) {
  const response = await getUserInfo(userId)
  return response.data
}

type ProcessedUser = Awaited<ReturnType<typeof processUser>>  // UserVo

// 实际使用
async function example() {
  const user: Awaited<ReturnType<typeof getUserInfo>> = await getUserInfo('1')
  console.log(user.data.userName)
}
```

**最佳实践:**

- <Ok/> 用于异步函数返回类型提取
- <Ok/> 用于 Promise 链类型推导
- <Ok/> 结合 ReturnType 使用
- <Warn/> 注意 Promise 嵌套层级

## 项目自定义工具类型

### Result - 统一 API 响应类型

统一的 API 请求返回格式,采用 `[Error, Data]` 元组结构。

```typescript
declare type Result<T = any> = Promise<[Error | null, T | null]>
```

**设计理念:**

受 Go 语言错误处理启发,将错误和数据封装在元组中,避免 try-catch,使错误处理更显式。

**使用示例:**

```typescript
import type { UserVo } from '@/api/system/user/types'

// API 函数返回 Result 类型
async function getUserInfo(userId: string): Result<UserVo> {
  try {
    const response = await request.get(`/user/${userId}`)
    return [null, response.data]
  } catch (error) {
    return [error as Error, null]
  }
}

// 使用 Result 类型
async function handleGetUser() {
  const [error, data] = await getUserInfo('1')

  if (error) {
    // 处理错误
    ElMessage.error(error.message)
    return
  }

  // 使用数据(TypeScript 知道 data 不为 null)
  console.log(data.userName)
}
```

**优势:**

1. **显式错误处理** - 强制开发者处理错误
2. **类型安全** - TypeScript 自动推导错误和数据的存在性
3. **避免异常** - 不使用 try-catch,代码更简洁
4. **统一风格** - 所有 API 调用采用一致的错误处理方式

### R - 标准 API 响应结构

后端返回的标准响应格式,包含状态码、消息和数据。

```typescript
declare interface R<T = any> {
  code: number
  msg: string
  data: T
}
```

**使用示例:**

```typescript
// API 返回 R 结构
async function getUserList(): Promise<R<PageResult<UserVo>>> {
  return request.get('/user/list')
}

// 处理响应
async function loadUsers() {
  const response = await getUserList()

  if (response.code === 200) {
    const users = response.data.records
    console.log(users)
  } else {
    ElMessage.error(response.msg)
  }
}

// 泛型使用
type UserListResponse = R<PageResult<UserVo>>
type UserDetailResponse = R<UserVo>
type DeleteResponse = R<void>
```

### PageResult - 分页响应数据

标准化的分页数据结构,与后端 PageResult 保持一致。

```typescript
declare interface PageResult<T = any> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
  last: boolean
}
```

**使用示例:**

```typescript
import type { UserVo } from '@/api/system/user/types'

// 分页响应
type UserPageResult = PageResult<UserVo>

const pageData: UserPageResult = {
  records: [
    { userId: '1', userName: 'admin', /* ... */ },
    { userId: '2', userName: 'user', /* ... */ }
  ],
  total: 100,
  pages: 10,
  current: 1,
  size: 10,
  last: false
}

// 分页查询函数
async function getUserPage(query: PageQuery): Promise<R<PageResult<UserVo>>> {
  return request.get('/user/page', { params: query })
}

// 使用分页数据
async function loadPage() {
  const response = await getUserPage({ pageNum: 1, pageSize: 20 })
  const { records, total } = response.data

  console.log(`共 ${total} 条记录`)
  console.log(`当前页 ${records.length} 条`)
}
```

### PageQuery - 分页查询参数

用于后端分页查询的通用参数接口。

```typescript
declare interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
  searchValue?: string
  params?: Record<string, any>
}
```

**使用示例:**

```typescript
// 基础分页查询
const query: PageQuery = {
  pageNum: 1,
  pageSize: 20
}

// 带排序的查询
const sortedQuery: PageQuery = {
  pageNum: 1,
  pageSize: 20,
  orderByColumn: 'createTime',
  isAsc: 'desc'
}

// 带搜索的查询
const searchQuery: PageQuery = {
  pageNum: 1,
  pageSize: 20,
  searchValue: 'admin'
}

// 扩展查询参数
interface UserQuery extends PageQuery {
  userName?: string
  status?: string
  deptId?: string
}

const userQuery: UserQuery = {
  pageNum: 1,
  pageSize: 20,
  status: '0',
  deptId: '100'
}
```

### DialogState - 弹窗状态配置

用于管理弹窗的显示状态和基本属性。

```typescript
declare interface DialogState {
  title?: string
  visible: boolean
}
```

**使用示例:**

```typescript
import { reactive } from 'vue'

// 弹窗状态
const dialog = reactive<DialogState>({
  title: '新增用户',
  visible: false
})

// 打开弹窗
function openDialog(title: string) {
  dialog.title = title
  dialog.visible = true
}

// 关闭弹窗
function closeDialog() {
  dialog.visible = false
}

// 多个弹窗
const addDialog = reactive<DialogState>({ title: '新增', visible: false })
const editDialog = reactive<DialogState>({ title: '编辑', visible: false })
const detailDialog = reactive<DialogState>({ title: '详情', visible: false })
```

### DictItem - 字典项配置

用于下拉选择、标签等组件的选项数据。

```typescript
declare interface DictItem {
  label: string
  value: string
  status?: string
  elTagType?: ElTagType
  elTagClass?: string
}
```

**使用示例:**

```typescript
// 状态字典
const statusDict: DictItem[] = [
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' }
]

// 性别字典
const sexDict: DictItem[] = [
  { label: '男', value: '0' },
  { label: '女', value: '1' },
  { label: '未知', value: '2' }
]

// 在 Select 组件中使用
<el-select v-model="form.status">
  <el-option
    v-for="item in statusDict"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>

// 字典标签
function getDictLabel(value: string, dict: DictItem[]): string {
  return dict.find(item => item.value === value)?.label || '-'
}
```

### FieldConfig - 字段配置接口

用于详情展示、表单等组件的字段配置。

```typescript
declare interface FieldConfig {
  prop: string
  label: string
  span?: number
  slot?: string
  formatter?: (value: any, data: any) => string
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' |
         'boolean' | 'array' | 'dict' | 'image' | 'password' | 'html' | 'file'
  dictOptions?: DictItem[]
  imageConfig?: {
    width?: number | string
    height?: number | string
    showAll?: boolean
    layout?: 'flex' | 'grid'
    columns?: number
    maxShow?: number
    gap?: number
  }
  hidden?: boolean | ((data: any) => boolean)
  group?: string
  noPrint?: boolean
}
```

**使用示例:**

```typescript
// 用户详情字段配置
const userFields: FieldConfig[] = [
  { prop: 'userId', label: '用户ID', type: 'copyable' },
  { prop: 'userName', label: '用户名', type: 'text' },
  { prop: 'nickName', label: '昵称', type: 'text' },
  { prop: 'email', label: '邮箱', type: 'text' },
  {
    prop: 'sex',
    label: '性别',
    type: 'dict',
    dictOptions: [
      { label: '男', value: '0' },
      { label: '女', value: '1' }
    ]
  },
  {
    prop: 'avatar',
    label: '头像',
    type: 'image',
    imageConfig: {
      width: 100,
      height: 100
    }
  },
  { prop: 'createTime', label: '创建时间', type: 'datetime' },
  { prop: 'updateTime', label: '更新时间', type: 'datetime' }
]
```

### SpanType / ResponsiveSpan - 响应式列数

支持固定数字、响应式对象或自动模式的栅格布局配置。

```typescript
declare interface ResponsiveSpan {
  xs?: number  // <768px
  sm?: number  // ≥768px
  md?: number  // ≥992px
  lg?: number  // ≥1200px
  xl?: number  // ≥1920px
}

declare type SpanType = number | ResponsiveSpan | 'auto' | undefined
```

**使用示例:**

```typescript
// 固定列数
const fixedSpan: SpanType = 8  // 固定占 8 列

// 响应式列数
const responsiveSpan: SpanType = {
  xs: 24,  // 手机全宽
  sm: 12,  // 平板半宽
  md: 8,   // 桌面三分之一
  lg: 6,   // 大屏四分之一
  xl: 4    // 超大屏六分之一
}

// 自动模式
const autoSpan: SpanType = 'auto'

// 在组件中使用
interface FormItemConfig {
  prop: string
  label: string
  span?: SpanType
}

const formItems: FormItemConfig[] = [
  {
    prop: 'userName',
    label: '用户名',
    span: { xs: 24, md: 12 }  // 手机全宽,桌面半宽
  },
  {
    prop: 'nickName',
    label: '昵称',
    span: { xs: 24, md: 12 }
  }
]
```

### FieldVisibilityConfig - 字段可见性配置

用于控制界面字段的显示/隐藏状态,支持层级结构。

```typescript
declare interface FieldVisibilityConfig {
  key: string | number
  field: string
  label: string
  visible: boolean
  children?: Array<FieldVisibilityConfig>
}
```

**使用示例:**

```typescript
// 表格列可见性配置
const columnVisibility: FieldVisibilityConfig[] = [
  {
    key: 'userId',
    field: 'userId',
    label: '用户ID',
    visible: true
  },
  {
    key: 'userName',
    field: 'userName',
    label: '用户名',
    visible: true
  },
  {
    key: 'nickName',
    field: 'nickName',
    label: '昵称',
    visible: true
  },
  {
    key: 'status',
    field: 'status',
    label: '状态',
    visible: false
  }
]

// 层级结构
const treeVisibility: FieldVisibilityConfig[] = [
  {
    key: 'basic',
    field: 'basic',
    label: '基本信息',
    visible: true,
    children: [
      { key: 'userName', field: 'userName', label: '用户名', visible: true },
      { key: 'nickName', field: 'nickName', label: '昵称', visible: true }
    ]
  },
  {
    key: 'contact',
    field: 'contact',
    label: '联系方式',
    visible: false,
    children: [
      { key: 'email', field: 'email', label: '邮箱', visible: true },
      { key: 'phonenumber', field: 'phonenumber', label: '手机号', visible: true }
    ]
  }
]
```

## 高级使用技巧

### 类型组合

组合多个工具类型实现复杂类型转换。

```typescript
// 部分字段必选,其他可选
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

type UserFormData = PartialExcept<UserVo, 'userName' | 'nickName'>

// 部分字段可选,其他必选
type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>

// 深层 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

### 条件类型

根据条件选择不同的类型。

```typescript
// 提取对象类型的属性
type ObjectKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never
}[keyof T]

// 提取函数类型的属性
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

// 非空类型
type NonNullable<T> = T extends null | undefined ? never : T
```

### 映射类型

创建基于已有类型的新类型。

```typescript
// 属性名添加前缀
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K]
}

type PrefixedUser = Prefixed<UserVo, 'user_'>
// { user_userId: string, user_userName: string, ... }

// 属性名转换为 Getter
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type UserGetters = Getters<UserVo>
// { getUserId: () => string, getUserName: () => string, ... }
```

## 最佳实践

### 1. 优先使用内置工具类型

**<Ok/> 推荐:**

```typescript
type UserBasic = Pick<UserVo, 'userId' | 'userName' | 'nickName'>
```

**<No/> 不推荐:**

```typescript
type UserBasic = {
  userId: string
  userName: string
  nickName: string
}
```

**原因:** 使用工具类型可以自动同步源类型的变化。

### 2. 合理使用类型推导

**<Ok/> 推荐:**

```typescript
type UserData = Awaited<ReturnType<typeof getUserInfo>>
```

**<No/> 不推荐:**

```typescript
type UserData = R<UserVo>  // 手动定义
```

**原因:** 类型推导可以减少手动维护,自动保持一致性。

### 3. 避免过度使用 Partial

**<Ok/> 推荐:**

```typescript
interface UserUpdateData {
  nickName?: string
  email?: string
}
```

**<No/> 不推荐:**

```typescript
type UserUpdateData = Partial<UserVo>  // 过于宽松
```

**原因:** Partial 会让所有字段可选,可能导致类型过于宽松。

### 4. 使用 Readonly 保护数据

**<Ok/> 推荐:**

```typescript
const config: Readonly<SystemConfig> = { /* ... */ }
```

**<No/> 不推荐:**

```typescript
const config: SystemConfig = { /* ... */ }
```

**原因:** Readonly 明确表达不可修改的意图,防止意外修改。

### 5. 组合工具类型实现复杂需求

**<Ok/> 推荐:**

```typescript
type UserUpdateForm = Omit<Required<Partial<UserVo>>, 'userId' | 'createTime'>
```

**原因:** 组合工具类型可以实现复杂的类型转换。

## 常见问题

### 1. Pick 和 Omit 的选择

**问题:** 什么时候用 Pick,什么时候用 Omit?

**解答:**

- **字段较少时用 Pick** - 明确指定需要的字段
- **字段较多时用 Omit** - 排除少数不需要的字段

```typescript
// ✅ 字段较少用 Pick
type UserBasic = Pick<UserVo, 'userId' | 'userName' | 'nickName'>

// ✅ 字段较多用 Omit
type UserWithoutSensitive = Omit<UserVo, 'password'>
```

### 2. Partial 导致类型过于宽松

**问题:** 使用 Partial 后所有字段都可选,如何约束?

**解答:** 使用类型组合,部分字段必选。

```typescript
// 问题: 所有字段都可选
type UserForm = Partial<UserVo>

// 解决: userName 和 nickName 必填,其他可选
type UserForm = Partial<UserVo> & Pick<UserVo, 'userName' | 'nickName'>

// 或使用自定义工具类型
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>
type UserForm = PartialExcept<UserVo, 'userName' | 'nickName'>
```

### 3. Record 键名类型约束

**问题:** Record 的键名类型如何约束?

**解答:**

```typescript
// ❌ 键名过于宽松
type UserMap = Record<string, UserVo>

// ✅ 使用联合类型约束键名
type UserId = '1' | '2' | '3'
type UserMap = Record<UserId, UserVo>

// ✅ 使用模板字符串类型
type UserMap = Record<`user_${number}`, UserVo>
```

### 4. Awaited 不解包自定义 Promise

**问题:** Awaited 无法解包自定义的类 Promise 对象?

**解答:** 确保对象实现了 `PromiseLike` 接口。

```typescript
interface MyPromise<T> extends PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>
}

type Result = Awaited<MyPromise<string>>  // string
```

### 5. 深层 Readonly 问题

**问题:** Readonly 只能让第一层属性只读,嵌套对象仍可修改?

**解答:** 使用 DeepReadonly 工具类型。

```typescript
// 浅层只读
type ShallowReadonly = Readonly<UserVo>

// 深层只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

type FullReadonly = DeepReadonly<UserVo>
```

## 类型调试技巧

### 1. 查看类型结果

```typescript
// 使用 type 关键字查看推导结果
type Test = Pick<UserVo, 'userId' | 'userName'>
// 鼠标悬停可以看到结果

// 使用 Expand 工具类型展开
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
type TestExpanded = Expand<Test>
```

### 2. 类型断言

```typescript
// 断言类型正确
const user = {} as UserVo

// 使用 satisfies 检查类型
const config = {
  theme: 'dark',
  language: 'zh-CN'
} satisfies SystemConfig
```

### 3. 条件类型调试

```typescript
// 使用 Extract 和 Exclude 调试
type Test1 = Extract<'a' | 'b' | 'c', 'a' | 'b'>  // 'a' | 'b'
type Test2 = Exclude<'a' | 'b' | 'c', 'a' | 'b'>  // 'c'
```

## 总结

工具类型是 TypeScript 类型系统的重要组成部分,掌握工具类型的使用可以显著提升开发效率和代码质量:

1. **内置工具类型** - 熟练使用 Partial、Required、Pick、Omit、Record 等
2. **项目类型** - 理解 Result、R、PageResult 等项目特定类型
3. **类型组合** - 灵活组合工具类型实现复杂需求
4. **类型推导** - 充分利用 TypeScript 的类型推导能力
5. **最佳实践** - 遵循最佳实践,写出类型安全的代码
