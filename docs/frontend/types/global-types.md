# 全局类型

全局类型定义在 `global.d.ts` 中，通过 `declare global` 声明，在项目任何位置都可直接使用无需导入。

## 🎯 核心全局类型

### 1. 组件实例类型

```typescript
/** Vue 组件实例类型 */
declare type ComponentInternalInstance = ComponentInstance
```

**使用场景**:
```typescript
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance() as ComponentInternalInstance
console.log(instance.proxy)
```

### 2. API 响应类型

#### Result<T>

统一 API 响应类型，Promise 元组格式。

```typescript
declare type Result<T = any> = Promise<[Error | null, T | null]>
```

**使用示例**:
```typescript
// API 定义
export const getUser = (id: string): Result<UserVo> => {
  return http.get<UserVo>(`/user/${id}`)
}

// 组件使用
const [err, data] = await getUser('123')
if (err) {
  console.error('获取失败', err)
  return
}
console.log('用户数据', data)  // data 类型为 UserVo | null
```

#### PageResult<T>

分页响应数据结构。

```typescript
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

**使用示例**:
```typescript
// API 定义
export const pageUsers = (query?: UserQuery): Result<PageResult<UserVo>> => {
  return http.get<PageResult<UserVo>>('/user/page', query)
}

// 组件使用
const tableData = ref<UserVo[]>([])
const total = ref(0)

const [err, data] = await pageUsers({ pageNum: 1, pageSize: 10 })
if (!err && data) {
  tableData.value = data.records
  total.value = data.total
}
```

#### R<T>

后端标准响应结构。

```typescript
declare interface R<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}
```

**使用场景**:
```typescript
// HTTP拦截器中处理
axios.interceptors.response.use(response => {
  const res: R = response.data

  if (res.code === 200) {
    return [null, res.data]  // 转换为 Result 格式
  }

  return [new Error(res.msg), null]
})
```

#### PageQuery

分页查询参数。

```typescript
declare interface PageQuery {
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
```

**使用示例**:
```typescript
// 查询参数
const queryParams = ref<PageQuery>({
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc',
  searchValue: '张三',
  params: {
    beginCreateTime: '2024-01-01',
    endCreateTime: '2024-12-31'
  }
})
```

### 3. UI 控制类型

#### DictItem

字典项配置，用于下拉选择、标签等组件。

```typescript
declare interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element UI Tag 组件的类型 */
  elTagType?: ElTagType
  /** Element UI Tag 组件的自定义类名 */
  elTagClass?: string
}
```

**使用示例**:
```typescript
// 定义字典数据
const statusOptions: DictItem[] = [
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' }
]

// 下拉选择
<el-select v-model="form.status">
  <el-option
    v-for="item in statusOptions"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>

// 标签显示
<el-tag :type="statusOptions.find(v => v.value === status)?.elTagType">
  {{ statusOptions.find(v => v.value === status)?.label }}
</el-tag>
```

#### DialogState

弹窗状态配置。

```typescript
declare interface DialogState {
  /** 弹窗标题 */
  title?: string
  /** 弹窗是否显示 */
  visible: boolean
}
```

**使用示例**:
```typescript
const dialogState = ref<DialogState>({
  title: '',
  visible: false
})

// 打开新增弹窗
function handleAdd() {
  dialogState.value = {
    title: '新增用户',
    visible: true
  }
}

// 打开编辑弹窗
function handleEdit(row: UserVo) {
  dialogState.value = {
    title: '编辑用户',
    visible: true
  }
  form.value = { ...row }
}

// 关闭弹窗
function handleClose() {
  dialogState.value.visible = false
}
```

#### FieldVisibilityConfig

字段可见性配置，用于控制界面字段的显示/隐藏。

```typescript
declare interface FieldVisibilityConfig {
  /** 字段唯一标识 */
  key: string | number
  /** 字段名称 */
  field: string
  /** 字段显示标签 */
  label: string
  /** 是否可见 */
  visible: boolean
  /** 子字段配置，支持层级结构 */
  children?: Array<FieldVisibilityConfig>
}
```

**使用示例**:
```typescript
const fieldConfig = ref<FieldVisibilityConfig[]>([
  {
    key: 1,
    field: 'username',
    label: '用户名',
    visible: true
  },
  {
    key: 2,
    field: 'userInfo',
    label: '用户信息',
    visible: true,
    children: [
      { key: 21, field: 'nickname', label: '昵称', visible: true },
      { key: 22, field: 'email', label: '邮箱', visible: false }
    ]
  }
])

// 根据配置渲染字段
<div v-for="field in fieldConfig" :key="field.key">
  <div v-if="field.visible">
    <label>{{ field.label }}</label>
    <span>{{ data[field.field] }}</span>
  </div>
</div>
```

### 4. 字段配置类型

#### FieldConfig

字段配置接口，用于详情展示、表单等组件的字段配置。

```typescript
declare interface FieldConfig {
  /** 字段属性名，支持嵌套如 'user.name' */
  prop: string
  /** 字段显示标签 */
  label: string
  /** 字段占用列数 */
  span?: number
  /** 自定义插槽名称，用于自定义渲染 */
  slot?: string
  /** 自定义格式化函数 */
  formatter?: (value: any, data: any) => string
  /** 数据类型，用于自动格式化 */
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' |
         'boolean' | 'array' | 'dict' | 'image' | 'password' | 'html'
  /** 字典选项，当type为dict时使用 */
  dictOptions?: DictItem[]
  /** 图片预览配置，当type为image时使用 */
  imageConfig?: {
    width?: number | string
    height?: number | string
    showAll?: boolean
    layout?: 'flex' | 'grid'
    columns?: number
    maxShow?: number
    gap?: number
  }
  /** 是否隐藏字段，支持函数动态判断 */
  hidden?: boolean | ((data: any) => boolean)
  /** 分组名称，设置后会按组分块显示 */
  group?: string
  /** 是否不参与打印，设为true时该字段不会在打印中显示 */
  noPrint?: boolean
}
```

**使用示例**:
```typescript
const fields: FieldConfig[] = [
  {
    prop: 'username',
    label: '用户名',
    span: 12,
    type: 'copyable'  // 可复制
  },
  {
    prop: 'status',
    label: '状态',
    span: 12,
    type: 'dict',
    dictOptions: statusOptions
  },
  {
    prop: 'createTime',
    label: '创建时间',
    span: 12,
    type: 'datetime'
  },
  {
    prop: 'avatar',
    label: '头像',
    span: 12,
    type: 'image',
    imageConfig: {
      width: 100,
      height: 100
    }
  },
  {
    prop: 'password',
    label: '密码',
    span: 12,
    type: 'password',  // 密码脱敏
    hidden: (data) => data.role !== 'admin'  // 仅管理员可见
  }
]
```

### 5. 响应式类型

#### ResponsiveSpan

响应式 Span 配置，用于栅格布局的响应式配置。

```typescript
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

#### SpanType

Span 属性类型，支持固定数字、响应式对象或自动模式。

```typescript
declare type SpanType = number | ResponsiveSpan | 'auto' | undefined
```

**使用示例**:
```typescript
// 固定列数
const span1: SpanType = 12

// 响应式配置
const span2: SpanType = {
  xs: 24,  // 手机全宽
  sm: 12,  // 平板半宽
  md: 8,   // 桌面三分之一
  lg: 6,   // 大屏四分之一
  xl: 4    // 超大屏六分之一
}

// 自动模式
const span3: SpanType = 'auto'

// 组件使用
<el-col :span="span1">固定12列</el-col>
<el-col v-bind="span2">响应式</el-col>
```

## 🔧 全局类型使用技巧

### 1. 无需导入

全局类型声明后可直接使用，无需 import。

```typescript
// ✅ 直接使用
const pageData = ref<PageResult<UserVo>>()
const query = ref<PageQuery>({ pageNum: 1, pageSize: 10 })
const dialog = ref<DialogState>({ visible: false })

// ❌ 不需要导入
// import type { PageResult, PageQuery } from '@/types/global'
```

### 2. 类型扩展

可以基于全局类型扩展新类型。

```typescript
// 扩展分页查询
interface UserQuery extends PageQuery {
  username?: string
  status?: string
}

// 扩展字典项
interface ExtendedDictItem extends DictItem {
  icon?: string
  color?: string
}
```

### 3. 类型组合

组合多个全局类型构建复杂类型。

```typescript
interface TableState<T = any> {
  data: PageResult<T>
  query: PageQuery
  loading: boolean
  selected: T[]
}

// 使用
const userTable = ref<TableState<UserVo>>({
  data: { records: [], total: 0, pages: 0, current: 1, size: 10, last: false },
  query: { pageNum: 1, pageSize: 10 },
  loading: false,
  selected: []
})
```

## 📋 实际应用案例

### 案例1: 通用表格组件

```typescript
<script setup lang="ts" generic="T">
interface Props {
  // 使用全局类型
  data: PageResult<T>
  fields: FieldConfig[]
  query?: PageQuery
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:query', value: PageQuery): void
  (e: 'refresh'): void
}

const emit = defineEmits<Emits>()

// 分页改变
function handlePageChange(page: number) {
  emit('update:query', {
    ...props.query,
    pageNum: page
  })
  emit('refresh')
}
</script>
```

### 案例2: 通用表单对话框

```typescript
<script setup lang="ts">
interface Props {
  modelValue: DialogState
  fields: FieldConfig[]
  dictMap?: Record<string, DictItem[]>
}

const props = defineProps<Props>()

const dialogState = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 根据字段配置渲染表单
function renderField(field: FieldConfig) {
  if (field.type === 'dict' && field.dictOptions) {
    return h(ElSelect, {}, () =>
      field.dictOptions!.map(opt =>
        h(ElOption, { label: opt.label, value: opt.value })
      )
    )
  }
  // ... 其他类型处理
}
</script>
```

## ✅ 全局类型最佳实践

1. **合理使用全局类型**: 仅将通用、频繁使用的类型声明为全局
2. **避免命名冲突**: 全局类型命名要有明确语义，避免通用名称
3. **及时更新**: 全局类型变更时，需评估影响范围
4. **文档化**: 为全局类型添加详细注释说明用途
5. **类型安全**: 优先使用具体类型，避免过度使用 any

## 🔗 相关文档

- [类型系统概览](./overview.md)
- [API 类型](./api-types.md)
- [组件类型](./component-types.md)
- [工具类型](./utility-types.md)

全局类型提供了统一的基础类型定义，简化了类型导入，提升了开发效率。
