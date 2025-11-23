# 类型系统概览

## 介绍

RuoYi-Plus-UniApp 前端项目采用 TypeScript 构建完整的类型系统,通过全局类型声明、模块扩展和工具类型,提供端到端的类型安全保障。类型系统涵盖 API 交互、UI 组件、路由管理、状态管理等所有核心模块,确保代码质量和开发体验。

**核心特性:**

- **全局类型声明** - 通用类型全局可用,无需频繁导入
- **模块类型扩展** - 扩展第三方库类型定义,增强类型安全
- **严格类型检查** - 启用 TypeScript 严格模式,杜绝类型漏洞
- **自动类型生成** - 自动生成组件、图标、导入等类型定义
- **智能类型推导** - 充分利用 TypeScript 类型推导能力
- **泛型类型支持** - 支持泛型组件和函数,实现灵活的类型复用
- **类型文档完善** - 所有类型都有详细的 JSDoc 注释说明
- **开发工具集成** - 与 VSCode、Vite、ESLint 深度集成

本文档提供类型系统的整体架构说明、类型分类介绍、使用规范和最佳实践。

## 类型系统架构

### 核心类型文件结构

```
src/types/
├── global.d.ts           # 全局类型定义 (API、分页、UI 等)
├── router.d.ts           # Vue Router 类型扩展
├── http.d.ts             # HTTP 请求和响应类型
├── icons.d.ts            # 图标类型 (自动生成)
├── components.d.ts       # 组件类型 (自动生成)
├── auto-imports.d.ts     # 自动导入类型 (自动生成)
├── element.d.ts          # Element Plus 类型扩展
└── env.d.ts              # 环境变量和 Vite 类型
```

### 类型文件说明

#### global.d.ts - 全局类型定义

全局类型文件定义了项目中最常用的类型,这些类型在任何地方都可以直接使用,无需导入。

**主要内容:**
- API 交互类型 (`Result<T>`, `R<T>`, `PageResult<T>`, `PageQuery`)
- UI 控制类型 (`DialogState`, `FieldConfig`, `DictItem`)
- 响应式类型 (`SpanType`, `ResponsiveSpan`)
- 组件实例类型 (`ComponentInternalInstance`)

**设计原则:**
- 全局可用 - 避免频繁 import
- 类型安全 - 为核心功能提供类型保障
- 统一标准 - 确保类型定义一致
- 易于维护 - 集中管理通用类型

#### router.d.ts - 路由类型扩展

扩展 Vue Router 的类型定义,添加项目特定的路由元数据和属性。

**主要内容:**
- `RouteMeta` - 路由元数据扩展
- `_RouteRecordBase` - 路由记录扩展
- `TagView` - 多标签页视图类型

#### http.d.ts - HTTP 类型定义

定义 HTTP 请求和响应的类型,包括自定义请求头、拦截器等。

**主要内容:**
- `CustomHeaders` - 自定义请求头
- `HttpConfig` - HTTP 配置选项
- 请求拦截器和响应拦截器类型

#### icons.d.ts - 图标类型 (自动生成)

由构建工具自动生成的图标类型定义,包含所有可用图标的名称。

**特点:**
- 自动生成 - 扫描图标文件自动生成类型
- 类型安全 - 使用图标时有完整的类型提示
- 支持多种图标库 - Font Icon、UnoCSS Icon

#### components.d.ts - 组件类型 (自动生成)

由 unplugin-vue-components 自动生成,包含所有注册组件的类型定义。

**特点:**
- 自动注册 - 无需手动导入组件
- 类型推导 - 自动推导组件 Props 和 Emits
- 全局可用 - 所有组件全局类型提示

#### auto-imports.d.ts - 自动导入类型 (自动生成)

由 unplugin-auto-import 自动生成,包含自动导入的 API 类型定义。

**特点:**
- Vue API - ref, reactive, computed, watch 等
- Vue Router API - useRouter, useRoute 等
- Pinia API - defineStore, storeToRefs 等
- 自定义 Composables - useAuth, useDict 等

#### element.d.ts - Element Plus 扩展

扩展 Element Plus 组件库的类型定义。

**主要内容:**
- `ElTagType` - Element Tag 组件类型
- 组件 Props 类型增强
- 组件事件类型增强

#### env.d.ts - 环境变量类型

定义环境变量和 Vite 特定类型。

**主要内容:**
- `ImportMetaEnv` - 环境变量接口
- Vite 静态资源类型
- 模块声明

## 类型分类详解

### 1. API 交互类型

API 交互类型定义了前后端数据交互的标准格式,确保类型安全和一致性。

#### `Result<T>` - 统一响应格式

所有 API 请求都返回 `Result<T>` 类型,使用 await-to-js 模式处理错误。

```typescript
/**
 * 统一 API 响应类型
 * @description 定义所有 API 请求的统一返回格式 [错误, 数据]
 * @template T 响应数据的类型
 */
declare type Result<T = any> = Promise<[Error | null, T | null]>
```

**使用示例:**

```typescript
// API 函数定义
export const getUserInfo = (): Result<UserVo> => {
  return http.get<UserVo>('/system/user/getInfo')
}

// 组件中使用
const [err, data] = await getUserInfo()
if (!err && data) {
  userInfo.value = data
} else {
  console.error('获取用户信息失败:', err)
}
```

**优点:**
- 显式错误处理 - 强制处理错误情况
- 类型安全 - TypeScript 自动推导数据类型
- 代码简洁 - 避免 try-catch 嵌套

#### `R<T>` - 标准 API 响应

后端返回的标准响应结构,包含状态码、消息和数据。

```typescript
/**
 * 标准 API 响应结构
 * @description 后端返回的标准响应格式,包含状态码、消息和数据
 * @template T 数据字段的类型
 */
declare interface R<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}
```

**使用场景:**
- HTTP 拦截器中处理响应
- 需要直接访问状态码和消息时
- 自定义错误处理逻辑

#### `PageResult<T>` - 分页响应

标准化的分页数据结构,与后端 PageResult 保持一致。

```typescript
/**
 * 分页响应数据类型
 * @description 标准化的分页数据结构,与后端 PageResult 保持一致
 * @template T 列表项的类型
 */
declare interface PageResult<T = any> {
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
```

**使用示例:**

```typescript
// API 函数定义
export const pageUsers = (query?: UserQuery): Result<PageResult<UserVo>> => {
  return http.get<PageResult<UserVo>>('/system/user/list', query)
}

// 组件中使用
const tableData = ref<UserVo[]>([])
const total = ref(0)

const loadData = async () => {
  const [err, data] = await pageUsers(queryParams.value)
  if (!err && data) {
    tableData.value = data.records
    total.value = data.total
  }
}
```

#### PageQuery - 分页查询参数

用于后端分页查询的通用参数接口。

```typescript
/**
 * 分页查询基础参数
 * @description 用于后端分页查询的通用参数接口
 */
declare interface PageQuery {
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
```

**使用示例:**

```typescript
// 定义查询参数接口,继承 PageQuery
interface UserQuery extends PageQuery {
  userName?: string
  status?: string
  deptId?: number
}

// 组件中使用
const queryParams = ref<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: ''
})

const handleQuery = () => {
  loadData()
}
```

### 2. UI 控制类型

UI 控制类型用于管理界面元素的状态和配置。

#### DialogState - 弹窗状态

用于管理弹窗的显示状态和基本属性。

```typescript
/**
 * 弹窗状态配置
 * @description 用于管理弹窗的显示状态和基本属性
 */
declare interface DialogState {
  /** 弹窗标题 */
  title?: string
  /** 弹窗是否显示 */
  visible: boolean
}
```

**使用示例:**

```typescript
const dialog = reactive<DialogState>({
  title: '',
  visible: false
})

const handleAdd = () => {
  dialog.title = '新增用户'
  dialog.visible = true
}

const handleEdit = (row: UserVo) => {
  dialog.title = '编辑用户'
  dialog.visible = true
}
```

#### DictItem - 字典项

用于下拉选择、标签等组件的选项数据,支持 Element Plus 标签样式。

```typescript
/**
 * 字典项配置
 * @description 用于下拉选择、标签等组件的选项数据,支持 Element Plus 标签样式
 */
declare interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element Plus Tag 组件的类型 */
  elTagType?: ElTagType
  /** Element Plus Tag 组件的自定义类名 */
  elTagClass?: string
}
```

**使用示例:**

```typescript
// 定义字典选项
const statusOptions = ref<DictItem[]>([
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' }
])

// 下拉选择使用
<el-select v-model="form.status">
  <el-option
    v-for="item in statusOptions"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>

// 标签显示使用
<el-tag :type="dict.elTagType">{{ dict.label }}</el-tag>
```

#### FieldConfig - 字段配置

用于详情展示、表单等组件的字段配置,支持多种显示类型和自定义渲染。

```typescript
/**
 * 字段配置接口
 * @description 用于详情展示、表单等组件的字段配置,支持多种显示类型和自定义渲染
 */
declare interface FieldConfig {
  /** 字段属性名,支持嵌套如 'user.name' */
  prop: string
  /** 字段显示标签 */
  label: string
  /** 字段占用列数 */
  span?: number
  /** 自定义插槽名称,用于自定义渲染 */
  slot?: string
  /** 自定义格式化函数 */
  formatter?: (value: any, data: any) => string
  /** 数据类型,用于自动格式化 */
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' | 'boolean' | 'array' | 'dict' | 'image' | 'password' | 'html' | 'file'
  /** 字典选项,当type为dict时使用 */
  dictOptions?: DictItem[]
  /** 图片预览配置,当type为image时使用 */
  imageConfig?: {
    width?: number | string
    height?: number | string
    showAll?: boolean
    layout?: 'flex' | 'grid'
    columns?: number
    maxShow?: number
    gap?: number
  }
  /** 是否隐藏字段,支持函数动态判断 */
  hidden?: boolean | ((data: any) => boolean)
  /** 分组名称,设置后会按组分块显示 */
  group?: string
  /** 是否不参与打印,设为true时该字段不会在打印中显示 */
  noPrint?: boolean
}
```

**使用示例:**

```typescript
const detailFields: FieldConfig[] = [
  { prop: 'userName', label: '用户名', type: 'text' },
  { prop: 'email', label: '邮箱', type: 'copyable' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: statusOptions.value },
  { prop: 'createTime', label: '创建时间', type: 'datetime' },
  {
    prop: 'avatar',
    label: '头像',
    type: 'image',
    imageConfig: { width: 100, height: 100 }
  }
]
```

#### FieldVisibilityConfig - 字段可见性

用于控制界面字段的显示/隐藏状态,支持层级结构。

```typescript
/**
 * 字段可见性配置
 * @description 用于控制界面字段的显示/隐藏状态,支持层级结构
 */
declare interface FieldVisibilityConfig {
  /** 字段唯一标识 */
  key: string | number
  /** 字段名称 */
  field: string
  /** 字段显示标签 */
  label: string
  /** 是否可见 */
  visible: boolean
  /** 子字段配置,支持层级结构 */
  children?: Array<FieldVisibilityConfig>
}
```

### 3. 响应式类型

响应式类型用于支持不同屏幕尺寸下的自适应布局。

#### SpanType - 响应式栅格类型

支持固定数字、响应式对象或自动模式的栅格跨度类型。

```typescript
/**
 * Span 属性类型
 * @description 支持固定数字、响应式对象或自动模式
 */
declare type SpanType = number | ResponsiveSpan | 'auto' | undefined
```

#### ResponsiveSpan - 响应式配置

用于栅格布局的响应式配置,支持不同屏幕尺寸下的列数设置。

```typescript
/**
 * 响应式 Span 配置接口
 * @description 用于栅格布局的响应式配置,支持不同屏幕尺寸下的列数设置
 */
declare interface ResponsiveSpan {
  /** 超小屏幕 <768px */
  xs?: number
  /** 小屏幕 ≥768px */
  sm?: number
  /** 中等屏幕 ≥992px */
  md?: number
  /** 大屏幕 ≥1200px */
  lg?: number
  /** 超大屏幕 ≥1920px */
  xl?: number
}
```

**使用示例:**

```typescript
// 固定跨度
<AFormInput label="用户名" v-model="form.userName" :span="12" />

// 预设响应式
<AFormInput label="邮箱" v-model="form.email" span="auto" />

// 自定义响应式
<AFormInput
  label="手机号"
  v-model="form.phone"
  :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
/>
```

### 4. 路由类型

路由类型扩展了 Vue Router 的类型定义,添加了项目特定的元数据和属性。

#### RouteMeta - 路由元数据扩展

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    /** 路由标题 */
    title?: string
    /** 路由图标 */
    icon?: IconCode
    /** 是否固定在标签页 */
    affix?: boolean
    /** 是否缓存页面 */
    noCache?: boolean
    /** 激活的菜单路径 */
    activeMenu?: string
    /** 是否显示面包屑 */
    breadcrumb?: boolean
    /** 国际化键名 */
    i18nKey?: string
    /** 外链地址 */
    link?: string
  }
}
```

#### _RouteRecordBase - 路由记录扩展

```typescript
declare module 'vue-router' {
  interface _RouteRecordBase {
    /** 是否隐藏菜单 */
    hidden?: boolean | string | number
    /** 权限标识数组 */
    permissions?: string[]
    /** 角色数组 */
    roles?: string[]
    /** 总是显示根路由 */
    alwaysShow?: boolean
    /** 默认查询参数 */
    query?: string
    /** 父级路径 */
    parentPath?: string
  }
}
```

#### TagView - 多标签页类型

```typescript
declare module 'vue-router' {
  interface TagView {
    /** 完整路径 */
    fullPath?: string
    /** 路由名称 */
    name?: string
    /** 路由路径 */
    path?: string
    /** 标签标题 */
    title?: string
    /** 路由元数据 */
    meta?: RouteMeta
    /** 查询参数 */
    query?: LocationQuery
  }
}
```

### 5. 组件类型

组件类型定义了 Vue 组件的 Props、Emits 等接口。

#### ComponentInternalInstance - 组件实例

```typescript
/** Vue 组件实例类型 */
declare type ComponentInternalInstance = ComponentInstance
```

**使用示例:**

```typescript
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance() as ComponentInternalInstance
const proxy = instance?.proxy
```

### 6. HTTP 类型

HTTP 类型定义了请求和响应的相关类型。

#### CustomHeaders - 自定义请求头

```typescript
/**
 * 自定义请求头配置
 */
export interface CustomHeaders {
  /** 是否需要认证 */
  auth?: boolean
  /** 是否需要租户信息 */
  tenant?: boolean
  /** 是否防止重复提交 */
  repeatSubmit?: boolean
}
```

**使用示例:**

```typescript
// API 函数中指定自定义请求头
export const login = (data: LoginForm): Result<LoginVo> => {
  return http.post<LoginVo>('/auth/login', data, {
    auth: false,  // 登录接口不需要认证
    tenant: true  // 需要租户信息
  })
}
```

## 类型声明方式

### 1. 全局类型声明

使用 `declare global` 在全局作用域声明类型,无需导入即可使用。

```typescript
// global.d.ts
declare global {
  interface PageResult<T> {
    records: T[]
    total: number
  }

  interface DialogState {
    title?: string
    visible: boolean
  }
}

export {}  // 确保文件是模块
```

**特点:**
- ✅ 无需导入,全局可用
- ✅ 适合通用类型
- ⚠️ 避免命名冲突
- ⚠️ 不要滥用全局类型

**使用场景:**
- API 交互类型 (Result, PageResult)
- UI 控制类型 (DialogState, DictItem)
- 响应式类型 (SpanType, ResponsiveSpan)

### 2. 模块扩展

扩展第三方库的类型定义,增强类型安全。

```typescript
// router.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: IconCode
    permissions?: string[]
  }

  interface _RouteRecordBase {
    hidden?: boolean
    roles?: string[]
  }
}
```

**特点:**
- ✅ 扩展现有类型
- ✅ 保持类型兼容
- ✅ IDE 智能提示
- ✅ 不影响原有类型

**使用场景:**
- 扩展 Vue Router 类型
- 扩展 Element Plus 类型
- 扩展 Axios 类型

### 3. 导出类型

在模块中导出类型供其他模块使用。

```typescript
// http.d.ts
export interface CustomHeaders {
  auth?: boolean
  tenant?: boolean
  repeatSubmit?: boolean
}

export interface HttpConfig {
  baseURL: string
  timeout: number
}
```

**使用:**

```typescript
import type { CustomHeaders, HttpConfig } from '@/types/http'

const headers: CustomHeaders = {
  auth: true,
  tenant: true
}
```

**特点:**
- ✅ 显式导入,清晰明确
- ✅ 避免全局污染
- ✅ 适合模块专用类型

### 4. 命名空间

使用命名空间组织相关类型。

```typescript
// api.d.ts
declare namespace API {
  interface User {
    id: number
    name: string
  }

  interface LoginParams {
    username: string
    password: string
  }

  interface LoginResult {
    token: string
    user: User
  }
}
```

**使用:**

```typescript
const user: API.User = {
  id: 1,
  name: '张三'
}

const loginParams: API.LoginParams = {
  username: 'admin',
  password: '123456'
}
```

## 类型使用规范

### 1. 类型导入规范

```typescript
// ✅ 推荐: 使用 type 关键字导入类型
import type { IconCode } from '@/types/icons'
import type { UserVo } from '@/api/system/user/types'

// ✅ 推荐: 混合导入
import { ref, computed, type Ref, type ComputedRef } from 'vue'

// ✅ 全局类型无需导入
const result: PageResult<UserVo> = {
  records: [],
  total: 0,
  pages: 0,
  current: 1,
  size: 10,
  last: false
}

// ❌ 避免: 默认导入类型
import IconCode from '@/types/icons'

// ❌ 避免: 不使用 type 关键字
import { IconCode } from '@/types/icons'
```

### 2. 组件 Props 类型

```typescript
// ✅ 推荐: 使用 interface 定义 Props
interface UserFormProps {
  modelValue: UserBo
  mode: 'add' | 'edit' | 'view'
  disabled?: boolean
}

const props = defineProps<UserFormProps>()

// ✅ 推荐: 使用 withDefaults 提供默认值
const props = withDefaults(defineProps<UserFormProps>(), {
  mode: 'add',
  disabled: false
})

// ❌ 避免: 使用 type 定义 Props
type UserFormProps = {
  modelValue: UserBo
  mode: 'add' | 'edit' | 'view'
}

// ❌ 避免: 不定义类型
const props = defineProps({
  modelValue: Object,
  mode: String
})
```

### 3. 事件类型定义

```typescript
// ✅ 推荐: 使用箭头函数语法
const emit = defineEmits<{
  'update:modelValue': [value: UserBo]
  submit: [data: UserBo]
  cancel: []
}>()

// ✅ 可选: 使用接口定义
interface UserFormEmits {
  (e: 'update:modelValue', value: UserBo): void
  (e: 'submit', data: UserBo): void
  (e: 'cancel'): void
}

const emit = defineEmits<UserFormEmits>()

// ❌ 避免: 不定义类型
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
```

### 4. Ref 类型定义

```typescript
// ✅ 推荐: 自动推导
const count = ref(0)  // Ref<number>
const name = ref('')  // Ref<string>

// ✅ 推荐: 显式声明复杂类型
const user = ref<UserVo | null>(null)
const list = ref<AdVo[]>([])
const form = ref<UserBo>({} as UserBo)

// ✅ 推荐: 组件实例类型
import type { FormInstance } from 'element-plus'
const formRef = ref<FormInstance>()

// ❌ 避免: 使用 any
const data = ref<any>({})
const result = ref<any>(null)
```

### 5. Reactive 类型定义

```typescript
// ✅ 推荐: 自动推导
const state = reactive({
  loading: false,
  data: [] as UserVo[]
})

// ✅ 推荐: 使用 interface
interface FormState {
  name: string
  age: number
  email: string
}

const form = reactive<FormState>({
  name: '',
  age: 0,
  email: ''
})

// ✅ 推荐: 复杂状态
interface QueryState {
  pageNum: number
  pageSize: number
  params: UserQuery
}

const query = reactive<QueryState>({
  pageNum: 1,
  pageSize: 10,
  params: {}
})
```

### 6. Computed 类型定义

```typescript
// ✅ 推荐: 自动推导
const fullName = computed(() => {
  return `${user.value.firstName} ${user.value.lastName}`
})  // ComputedRef<string>

// ✅ 推荐: 显式声明
const total = computed<number>(() => {
  return list.value.reduce((sum, item) => sum + item.amount, 0)
})

// ✅ 推荐: 可写计算属性
const inputValue = computed<string>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
```

### 7. 函数类型定义

```typescript
// ✅ 推荐: 显式声明参数和返回类型
function getUser(id: number): Promise<UserVo> {
  return http.get<UserVo>(`/system/user/${id}`)
}

// ✅ 推荐: 箭头函数
const handleSubmit = async (data: UserBo): Promise<void> => {
  const [err] = await saveUser(data)
  if (!err) {
    message.success('保存成功')
  }
}

// ✅ 推荐: 使用泛型
function getData<T>(url: string): Promise<T> {
  return http.get<T>(url)
}

// ❌ 避免: 不声明类型
function getUser(id) {
  return http.get(`/system/user/${id}`)
}
```

## 类型最佳实践

### 1. 复用业务类型

定义可复用的基础类型,通过继承和组合实现类型复用。

```typescript
// ✅ 定义基础实体类型
interface BaseEntity {
  id?: string | number
  createTime?: string
  createBy?: string
  updateTime?: string
  updateBy?: string
}

// ✅ 继承基础类型
interface UserBo extends BaseEntity {
  userName: string
  email: string
  status: string
}

interface UserVo extends BaseEntity {
  userName: string
  email: string
  status: string
  statusName: string
  deptName: string
}

// ✅ 使用 Omit 排除字段
type UserCreateBo = Omit<UserBo, 'id' | 'createTime' | 'updateTime'>

// ✅ 使用 Pick 选择字段
type UserListItem = Pick<UserVo, 'id' | 'userName' | 'email' | 'status'>
```

### 2. 类型守卫

使用类型守卫函数进行运行时类型检查。

```typescript
// ✅ 定义类型守卫函数
function isUserVo(obj: any): obj is UserVo {
  return obj && typeof obj.userName === 'string' && typeof obj.email === 'string'
}

function isPageResult<T>(obj: any): obj is PageResult<T> {
  return obj && Array.isArray(obj.records) && typeof obj.total === 'number'
}

// ✅ 使用类型守卫
const data: unknown = await fetchData()

if (isUserVo(data)) {
  console.log(data.userName)  // 类型安全
  console.log(data.email)     // 类型安全
}

if (isPageResult<UserVo>(data)) {
  data.records.forEach(user => {
    console.log(user.userName)  // 类型安全
  })
}
```

### 3. 泛型约束

使用泛型约束提高类型安全性和灵活性。

```typescript
// ✅ 约束泛型必须有特定属性
function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key]
}

// 使用
const user = { name: '张三', age: 20 }
const name = getProperty(user, 'name')  // string
const age = getProperty(user, 'age')    // number

// ✅ 约束泛型必须继承特定接口
interface HasId {
  id: string | number
}

function findById<T extends HasId>(list: T[], id: string | number): T | undefined {
  return list.find(item => item.id === id)
}

// ✅ 多个泛型参数
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 }
}
```

### 4. 联合类型和交叉类型

```typescript
// ✅ 联合类型 - 多选一
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
type FormMode = 'add' | 'edit' | 'view'
type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

// ✅ 交叉类型 - 合并多个类型
type UserWithPermissions = UserVo & {
  permissions: string[]
  roles: string[]
}

// ✅ 条件类型
type NonNullable<T> = T extends null | undefined ? never : T
type ExtractStrings<T> = T extends string ? T : never

// ✅ 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

### 5. 类型断言

谨慎使用类型断言,优先使用类型守卫。

```typescript
// ✅ 合理使用 as 断言
const user = {} as UserVo
const element = document.querySelector('.btn') as HTMLButtonElement

// ✅ 使用 ! 非空断言 (确定不为 null)
const name = user.name!
const element = document.querySelector('.btn')!

// ✅ 使用类型守卫代替断言
if (isUserVo(data)) {
  // TypeScript 自动推导 data 为 UserVo
  console.log(data.userName)
}

// ❌ 避免: 双重断言 (危险)
const data = user as any as AdVo

// ❌ 避免: 不必要的断言
const count: number = ref(0) as Ref<number>
```

### 6. 枚举和常量

```typescript
// ✅ 使用 const enum (编译时内联)
const enum UserStatus {
  NORMAL = '0',
  DISABLED = '1'
}

// ✅ 使用 as const 创建字面量类型
const USER_STATUS = {
  NORMAL: '0',
  DISABLED: '1'
} as const

type UserStatusValue = typeof USER_STATUS[keyof typeof USER_STATUS]

// ✅ 使用联合类型代替枚举
type UserStatus = '0' | '1'

// 使用
const status: UserStatus = '0'
```

### 7. 类型推导优化

充分利用 TypeScript 的类型推导能力。

```typescript
// ✅ 利用类型推导
const user = {
  name: '张三',
  age: 20,
  email: 'zhangsan@example.com'
}  // 自动推导为 { name: string; age: number; email: string }

// ✅ 函数返回类型推导
function getUser() {
  return {
    name: '张三',
    age: 20
  }
}  // 返回类型自动推导为 { name: string; age: number }

// ✅ 数组类型推导
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]  // Array<{ id: number; name: string }>

// ✅ 条件推导
const value = condition ? 'yes' : 'no'  // 'yes' | 'no'
```

### 8. 严格类型检查

启用 TypeScript 严格模式,提高代码质量。

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 9. 类型文档化

为类型添加详细的 JSDoc 注释。

```typescript
/**
 * 用户信息接口
 * @description 用户的详细信息,包含基本信息和扩展信息
 */
interface UserVo {
  /**
   * 用户ID
   * @example 1
   */
  id: number

  /**
   * 用户名
   * @example 'admin'
   */
  userName: string

  /**
   * 邮箱地址
   * @example 'admin@example.com'
   */
  email: string

  /**
   * 用户状态
   * @description 0-正常 1-停用
   * @default '0'
   */
  status: '0' | '1'
}
```

### 10. 避免常见陷阱

```typescript
// ❌ 避免: 使用 any
const data: any = {}

// ✅ 正确: 使用 unknown
const data: unknown = {}
if (typeof data === 'object' && data !== null) {
  // 类型守卫后安全使用
}

// ❌ 避免: 过度使用可选链
const name = user?.profile?.name?.firstName?.value

// ✅ 正确: 合理使用可选链
const name = user?.profile?.name ?? 'Unknown'

// ❌ 避免: 直接解构 Props
const { user, loading } = props

// ✅ 正确: 使用 toRef
const user = toRef(props, 'user')
const loading = toRef(props, 'loading')
```

## 类型检查工具

### 1. VSCode 配置

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. ESLint TypeScript 规则

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/eslint-config-typescript'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn'
  }
}
```

### 3. 类型检查命令

```bash
# 类型检查
npm run type-check

# 类型检查(监听模式)
npm run type-check:watch

# 构建时类型检查
npm run build
```

## 总结

RuoYi-Plus-UniApp 的类型系统通过全局类型声明、模块扩展、严格类型检查等方式,为项目提供了完整的类型安全保障。开发时应遵循类型使用规范和最佳实践,充分利用 TypeScript 的类型推导和类型守卫能力,避免使用 any 等不安全的类型,确保代码质量和开发体验。
