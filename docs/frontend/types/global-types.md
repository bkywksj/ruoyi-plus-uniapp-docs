# 全局类型

全局类型定义在 `global.d.ts` 中,通过 `declare global` 声明,在项目任何位置都可直接使用无需导入。

## 核心全局类型

### 1. 组件实例类型

```typescript
/** Vue 组件实例类型 */
declare type ComponentInternalInstance = ComponentInstance
```

**使用场景**:
```ts
import { getCurrentInstance } from 'vue'

// 类型断言
const instance = getCurrentInstance()
const typedInstance: ComponentInternalInstance = instance!
console.log(typedInstance.proxy)
```

### 2. API 响应类型

#### `Result<T>`

统一 API 响应类型,Promise 元组格式。

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

#### PageResult`<T>`

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

#### R`<T>`

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

字典项配置,用于下拉选择、标签等组件。

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

字段可见性配置,用于控制界面字段的显示/隐藏。

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
  /** 子字段配置,支持层级结构 */
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

字段配置接口,用于详情展示、表单等组件的字段配置。

```typescript
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
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' |
         'boolean' | 'array' | 'dict' | 'image' | 'password' | 'html' | 'file'
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

响应式 Span 配置,用于栅格布局的响应式配置。

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

Span 属性类型,支持固定数字、响应式对象或自动模式。

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

### 6. 表格配置类型

#### TableColumn

表格列配置类型,用于动态表格组件。

```typescript
interface TableColumn {
  /** 列字段名 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: number | string
  /** 最小列宽 */
  minWidth?: number | string
  /** 是否固定列 */
  fixed?: 'left' | 'right' | boolean
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否显示 */
  visible?: boolean
  /** 是否可排序 */
  sortable?: boolean | 'custom'
  /** 格式化函数 */
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
}
```

**使用示例**:
```typescript
const columns: TableColumn[] = [
  {
    prop: 'username',
    label: '用户名',
    width: 120,
    fixed: 'left',
    align: 'left'
  },
  {
    prop: 'nickname',
    label: '昵称',
    minWidth: 100
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    align: 'center',
    formatter: (row) => {
      const dict = statusOptions.find(d => d.value === row.status)
      return dict?.label || '-'
    }
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 180,
    sortable: true,
    formatter: (row) => {
      return row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  }
]
```

### 7. 树形数据类型

#### TreeNode

树形节点数据类型。

```typescript
interface TreeNode {
  /** 节点ID */
  id: string | number
  /** 节点标签 */
  label: string
  /** 父节点ID */
  parentId?: string | number
  /** 子节点列表 */
  children?: TreeNode[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否默认展开 */
  expanded?: boolean
  /** 其他扩展属性 */
  [key: string]: any
}
```

**使用示例**:
```typescript
const treeData = ref<TreeNode[]>([
  {
    id: 1,
    label: '一级节点',
    children: [
      {
        id: 11,
        label: '二级节点-1',
        children: [
          { id: 111, label: '三级节点-1' },
          { id: 112, label: '三级节点-2' }
        ]
      },
      {
        id: 12,
        label: '二级节点-2',
        disabled: true
      }
    ]
  },
  {
    id: 2,
    label: '一级节点-2'
  }
])

// 树形组件使用
<el-tree
  :data="treeData"
  node-key="id"
  :props="{ label: 'label', children: 'children' }"
/>
```

### 8. 上传文件类型

#### UploadFile

文件上传对象类型。

```typescript
interface UploadFile {
  /** 文件名 */
  name: string
  /** 文件大小(字节) */
  size?: number
  /** 文件类型 */
  type?: string
  /** 文件URL */
  url?: string
  /** 上传状态 */
  status?: 'ready' | 'uploading' | 'success' | 'error'
  /** 上传进度 */
  percentage?: number
  /** 原始文件对象 */
  raw?: File
  /** 响应数据 */
  response?: any
  /** 唯一ID */
  uid?: number
}
```

**使用示例**:
```typescript
const fileList = ref<UploadFile[]>([])

// 上传成功回调
function handleSuccess(response: any, file: UploadFile) {
  file.url = response.data.url
  file.status = 'success'
  fileList.value.push(file)
}

// 上传失败回调
function handleError(error: Error, file: UploadFile) {
  file.status = 'error'
  ElMessage.error(`文件 ${file.name} 上传失败`)
}

// 文件移除
function handleRemove(file: UploadFile) {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}
```

## 全局类型使用技巧

### 1. 无需导入

全局类型声明后可直接使用,无需 import。

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

// 扩展树节点
interface MenuTree extends TreeNode {
  icon?: string
  path?: string
  component?: string
  permission?: string
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

### 4. 泛型约束

使用全局类型作为泛型约束。

```typescript
// 泛型函数,要求参数必须有id和label
function getLabelById<T extends { id: any; label: string }>(
  list: T[],
  id: any
): string | undefined {
  return list.find(item => item.id === id)?.label
}

// 使用DictItem
const label1 = getLabelById(statusOptions, '0')

// 使用TreeNode
const label2 = getLabelById(treeData.value, 1)
```

### 5. 类型守卫

创建类型守卫函数判断数据类型。

```typescript
// 判断是否为分页结果
function isPageResult<T>(data: any): data is PageResult<T> {
  return (
    data &&
    Array.isArray(data.records) &&
    typeof data.total === 'number' &&
    typeof data.current === 'number'
  )
}

// 使用
const result = await apiCall()
if (isPageResult<UserVo>(result)) {
  // result 类型为 PageResult<UserVo>
  console.log('总记录数:', result.total)
  console.log('数据列表:', result.records)
}

// 判断是否为标准响应
function isStandardResponse<T>(data: any): data is R<T> {
  return (
    data &&
    typeof data.code === 'number' &&
    typeof data.msg === 'string' &&
    'data' in data
  )
}
```

## 实际应用案例

### 案例1: 通用表格组件

```typescript
<script setup lang="ts" generic="T">
interface Props {
  // 使用全局类型
  data: PageResult<T>
  fields: FieldConfig[]
  columns: TableColumn[]
  query?: PageQuery
  loading?: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:query', value: PageQuery): void
  (e: 'refresh'): void
  (e: 'selection-change', selection: T[]): void
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

// 每页条数改变
function handleSizeChange(size: number) {
  emit('update:query', {
    ...props.query,
    pageSize: size,
    pageNum: 1
  })
  emit('refresh')
}

// 排序改变
function handleSortChange({ prop, order }: { prop: string; order: string }) {
  emit('update:query', {
    ...props.query,
    orderByColumn: prop,
    isAsc: order === 'ascending' ? 'asc' : 'desc'
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
  formData?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: DialogState]
  'update:formData': [value: Record<string, any>]
  'confirm': []
}>()

const dialogState = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formModel = computed({
  get: () => props.formData || {},
  set: (val) => emit('update:formData', val)
})

// 根据字段配置渲染表单
function renderField(field: FieldConfig) {
  if (field.type === 'dict' && field.dictOptions) {
    return h(ElSelect, {
      modelValue: formModel.value[field.prop],
      'onUpdate:modelValue': (val) => {
        formModel.value[field.prop] = val
      }
    }, () =>
      field.dictOptions!.map(opt =>
        h(ElOption, { label: opt.label, value: opt.value })
      )
    )
  }

  if (field.type === 'datetime') {
    return h(ElDatePicker, {
      modelValue: formModel.value[field.prop],
      'onUpdate:modelValue': (val) => {
        formModel.value[field.prop] = val
      },
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss'
    })
  }

  // 默认文本输入
  return h(ElInput, {
    modelValue: formModel.value[field.prop],
    'onUpdate:modelValue': (val) => {
      formModel.value[field.prop] = val
    }
  })
}
</script>
```

### 案例3: 通用树形选择器

```typescript
<script setup lang="ts">
interface Props {
  /** 树形数据 */
  data: TreeNode[]
  /** 已选中的节点ID */
  modelValue?: (string | number)[]
  /** 是否多选 */
  multiple?: boolean
  /** 是否显示复选框 */
  showCheckbox?: boolean
  /** 是否默认展开所有节点 */
  defaultExpandAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  showCheckbox: false,
  defaultExpandAll: false
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  'node-click': [data: TreeNode, node: any]
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()

// 获取选中的节点
const selectedNodes = computed(() => {
  if (!treeRef.value) return []

  if (props.multiple) {
    return treeRef.value.getCheckedNodes()
  } else {
    const node = treeRef.value.getCurrentNode()
    return node ? [node] : []
  }
})

// 节点点击
function handleNodeClick(data: TreeNode) {
  if (!props.multiple) {
    emit('update:modelValue', [data.id])
  }
  emit('node-click', data, null)
}

// 复选框改变
function handleCheckChange() {
  if (props.multiple) {
    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    emit('update:modelValue', checkedKeys)
  }
}
</script>

<template>
  <el-tree
    ref="treeRef"
    :data="data"
    :show-checkbox="showCheckbox"
    :default-expand-all="defaultExpandAll"
    :props="{ label: 'label', children: 'children' }"
    node-key="id"
    @node-click="handleNodeClick"
    @check-change="handleCheckChange"
  />
</template>
```

### 案例4: 文件上传管理器

```typescript
<script setup lang="ts">
interface Props {
  /** 文件列表 */
  modelValue: UploadFile[]
  /** 最大上传数量 */
  limit?: number
  /** 允许的文件类型 */
  accept?: string
  /** 单个文件最大大小(MB) */
  maxSize?: number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  maxSize: 10
})

const emit = defineEmits<{
  'update:modelValue': [value: UploadFile[]]
  'success': [file: UploadFile]
  'error': [error: Error, file: UploadFile]
}>()

const fileList = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 上传前校验
function handleBeforeUpload(file: File): boolean {
  // 文件大小校验
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  // 文件数量校验
  if (fileList.value.length >= props.limit) {
    ElMessage.error(`最多只能上传 ${props.limit} 个文件`)
    return false
  }

  return true
}

// 上传成功
function handleSuccess(response: any, file: UploadFile) {
  file.url = response.data.url
  file.status = 'success'
  emit('success', file)
}

// 上传失败
function handleError(error: Error, file: UploadFile) {
  file.status = 'error'
  emit('error', error, file)
}

// 文件移除
function handleRemove(file: UploadFile) {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// 文件预览
function handlePreview(file: UploadFile) {
  if (file.url) {
    window.open(file.url)
  }
}
</script>
```

## 全局类型最佳实践

### 1. 合理使用全局类型

仅将通用、频繁使用的类型声明为全局:

```typescript
// ✅ 适合作为全局类型
declare interface PageResult<T> { ... }  // 所有分页接口都用
declare interface PageQuery { ... }       // 所有分页查询都用
declare interface DictItem { ... }        // 字典项到处都用

// ❌ 不适合作为全局类型
declare interface UserEditForm { ... }    // 仅用户编辑页面用
declare interface OrderDetail { ... }      // 仅订单详情用
```

### 2. 避免命名冲突

全局类型命名要有明确语义,避免通用名称:

```typescript
// ❌ 容易冲突的命名
declare interface Data { ... }
declare interface Item { ... }
declare interface Config { ... }

// ✅ 明确的命名
declare interface PageResult<T> { ... }
declare interface DictItem { ... }
declare interface FieldConfig { ... }
```

### 3. 及时更新文档

全局类型变更时,需要:
- 评估影响范围
- 更新相关文档
- 通知团队成员
- 提供迁移指南

### 4. 类型安全优先

```typescript
// ❌ 过度使用 any
const data = ref<any>({})
const list = ref<any[]>([])

// ✅ 使用具体类型
const data = ref<PageResult<UserVo>>()
const list = ref<DictItem[]>([])

// ✅ 未知类型使用 unknown
const data = ref<unknown>()
```

### 5. 泛型优于具体类型

```typescript
// ❌ 为每个实体创建分页类型
interface UserPageResult {
  records: UserVo[]
  total: number
  // ...
}

interface RolePageResult {
  records: RoleVo[]
  total: number
  // ...
}

// ✅ 使用泛型
interface PageResult<T> {
  records: T[]
  total: number
  // ...
}

const userPage = ref<PageResult<UserVo>>()
const rolePage = ref<PageResult<RoleVo>>()
```

### 6. 接口优于类型别名

对于对象结构,优先使用 interface:

```typescript
// ✅ 推荐
declare interface PageResult<T> {
  records: T[]
  total: number
}

// ⚠️ 可以但不推荐
declare type PageResult<T> = {
  records: T[]
  total: number
}
```

### 7. 合理使用可选属性

```typescript
// 必填字段不加问号
interface PageQuery {
  pageNum: number      // 必填
  pageSize: number     // 必填
  orderByColumn?: string  // 可选
  isAsc?: string         // 可选
}
```

### 8. 添加详细注释

```typescript
declare interface FieldConfig {
  /**
   * 字段属性名,支持嵌套路径
   * @example 'user.name' 'address.city'
   */
  prop: string

  /**
   * 字段显示标签
   */
  label: string

  /**
   * 字段类型,用于自动格式化
   * - text: 普通文本
   * - date: 日期格式 YYYY-MM-DD
   * - datetime: 日期时间格式 YYYY-MM-DD HH:mm:ss
   * @default 'text'
   */
  type?: 'text' | 'date' | 'datetime' | ...
}
```

### 9. 导出可复用类型

虽然是全局类型,但也可以通过 export 方便其他项目复用:

```typescript
// global.d.ts
declare global {
  interface PageResult<T> { ... }
  interface PageQuery { ... }
}

// 同时导出,方便其他项目使用
export type { PageResult, PageQuery }
```

### 10. 版本兼容性考虑

全局类型升级时考虑向后兼容:

```typescript
// 旧版本
declare interface PageQuery {
  pageNum?: number
  pageSize?: number
}

// 新版本 - 添加新字段但保持可选
declare interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string  // 新增字段,可选
  isAsc?: string          // 新增字段,可选
}
```

## 总结

全局类型提供了统一的基础类型定义,主要优势:

1. **无需导入** - 在任何文件中直接使用
2. **统一标准** - 确保团队使用相同的类型定义
3. **减少重复** - 避免在多个文件中重复定义相同类型
4. **提升效率** - 减少 import 语句,简化代码
5. **类型安全** - 提供完整的类型检查和智能提示

合理使用全局类型可以大幅提升开发效率和代码质量。
