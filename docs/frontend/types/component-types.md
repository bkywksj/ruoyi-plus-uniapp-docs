# 组件类型定义

## 介绍

组件类型定义是 Vue 3 TypeScript 项目中确保类型安全的核心部分。所有业务组件都使用 TypeScript 编写，为 Props、Emits、Slots 等提供完整的类型定义。

**核心特性:**

- **类型安全** - 通过 TypeScript 接口定义组件 Props
- **智能提示** - IDE 提供完整的属性提示和自动补全
- **文档化注释** - 使用 JSDoc 注释为属性添加说明
- **泛型支持** - 支持泛型组件，实现灵活的类型推导
- **默认值定义** - 使用 `withDefaults` 为 Props 提供默认值

## 基础组件类型

### Icon 图标组件

```typescript
/** Icon 图标组件 Props */
interface IconProps {
  /** 图标值(字符串形式) */
  value?: string
  /** 图标代码(IconCode 类型) */
  code?: IconCode
  /** 图标尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string | number
  /** 图标颜色 */
  color?: string
  /** 图标动画效果 */
  animate?: 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'
}

/** 图标代码类型 */
interface IconCode {
  /** 图标类型: font-字体图标, uno-UnoCSS图标 */
  type: 'font' | 'uno'
  /** 图标名称 */
  name: string
}
```

### IconSelect 图标选择器

```typescript
/** IconSelect 图标选择器 Props */
interface IconSelectProps {
  /** 绑定值(v-model) */
  modelValue: string
  /** 选择器宽度 */
  width?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 是否可清空 */
  clearable?: boolean
}

/** IconSelect 图标选择器事件 */
interface IconSelectEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'select', value: string): void
  (e: 'clear'): void
}
```

## 表单组件类型

### AFormInput 输入框组件

```typescript
/** 输入组件的Props接口定义 */
interface AFormInputProps {
  /** 绑定值 */
  modelValue?: string | number | null | undefined
  /** 标签文本 */
  label?: string
  /** 标签宽度 */
  labelWidth?: number | string
  /** 占位符文本 */
  placeholder?: string
  /** 组件宽度 */
  width?: number | string
  /** 表单域model数据字段名 */
  prop?: string
  /** 最大长度 */
  maxlength?: number | string
  /** 是否显示字数统计 */
  showWordLimit?: boolean
  /** 是否显示表单项 */
  showFormItem?: boolean
  /** 是否显示密码可见性切换按钮 */
  showPassword?: boolean
  /** 输入框类型 */
  type?: 'text' | 'textarea' | 'number' | 'password'
  /** 文本域自适应配置 */
  autosize?: { minRows?: number; maxRows?: number }
  /** 组件尺寸 */
  size?: '' | 'default' | 'small' | 'large'
  /** 栅格占据的列数 */
  span?: SpanType
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 文本域行数 */
  rows?: number
  /** 提示信息 */
  tooltip?: string
  /** 数字输入框最小值 */
  min?: number
  /** 数字输入框最大值 */
  max?: number
  /** 数字输入框步长 */
  step?: number
  /** 是否只能输入 step 的倍数 */
  stepStrictly?: boolean
  /** 数值精度 */
  precision?: number
  /** 是否使用控制按钮 */
  controls?: boolean
  /** 控制按钮位置 */
  controlsPosition?: '' | 'right'
  /** 响应式模式 */
  responsiveMode?: 'screen' | 'container' | 'modal-size'
  /** 模态框尺寸 */
  modalSize?: 'small' | 'medium' | 'large' | 'xl'
  /** 是否防止浏览器自动填充 */
  preventAutofill?: boolean
}

/** AFormInput 组件事件定义 */
interface AFormInputEmits {
  (e: 'update:modelValue', value: string | number | null | undefined): void
  (e: 'input', value: string | number | null | undefined): void
  (e: 'blur', value: any): void
  (e: 'change', value: any): void
  (e: 'enter', value: any): void
}
```

### AFormSelect 下拉选择组件

```typescript
/** 下拉选择组件 Props */
interface AFormSelectProps {
  /** 绑定值 */
  modelValue?: string | number | boolean | object | any[]
  /** 标签文本 */
  label?: string
  /** 标签宽度 */
  labelWidth?: number | string
  /** 占位符 */
  placeholder?: string
  /** 表单字段名 */
  prop?: string
  /** 选项数据 */
  options?: SelectOption[]
  /** 是否多选 */
  multiple?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 是否可搜索 */
  filterable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 栅格占据的列数 */
  span?: SpanType
  /** 是否显示表单项 */
  showFormItem?: boolean
  /** 组件尺寸 */
  size?: '' | 'default' | 'small' | 'large'
  /** 提示信息 */
  tooltip?: string
  /** 是否允许用户创建新条目 */
  allowCreate?: boolean
  /** 是否折叠多选标签 */
  collapseTags?: boolean
  /** 多选时最多显示的标签数量 */
  maxCollapseTags?: number
}

/** 选项数据类型 */
interface SelectOption {
  /** 显示文本 */
  label: string
  /** 选项值 */
  value: string | number | boolean
  /** 是否禁用此选项 */
  disabled?: boolean
  /** 选项分组 */
  options?: SelectOption[]
}
```

### AFormFileUpload 文件上传组件

```typescript
/** 文件上传组件 Props */
interface AFormFileUploadProps {
  /** 绑定值,文件列表 */
  modelValue?: string | UploadFile[]
  /** 标签文本 */
  label?: string
  /** 表单字段名 */
  prop?: string
  /** 最大上传数量 */
  limit?: number
  /** 文件大小限制(MB) */
  fileSize?: number
  /** 允许的文件类型 */
  fileType?: string[]
  /** 是否显示文件列表 */
  showFileList?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 栅格占据的列数 */
  span?: SpanType
  /** 上传按钮文字 */
  buttonText?: string
  /** 提示文字 */
  tip?: string
  /** 是否自动上传 */
  autoUpload?: boolean
}

/** 上传文件类型 */
interface UploadFile {
  name: string
  url: string
  size?: number
  type?: string
  status?: 'uploading' | 'success' | 'error'
  percentage?: number
  uid?: number
  raw?: File
}

/** 文件上传组件事件 */
interface AFormFileUploadEmits {
  (e: 'update:modelValue', value: string | UploadFile[]): void
  (e: 'success', file: UploadFile, fileList: UploadFile[]): void
  (e: 'error', error: Error, file: UploadFile): void
  (e: 'remove', file: UploadFile, fileList: UploadFile[]): void
  (e: 'exceed', files: File[], fileList: UploadFile[]): void
}
```

## 业务组件类型

### AModal 模态框组件

```typescript
/** AModal 组件属性接口定义 */
interface AModalProps {
  /** 控制模态框显示/隐藏状态 */
  modelValue: boolean
  /** 模态框模式 */
  mode?: 'dialog' | 'drawer'
  /** 模态框标题 */
  title?: string
  /** 自定义宽度/尺寸 */
  width?: string | number
  /** 预设尺寸 */
  size?: 'small' | 'medium' | 'large' | 'xl'
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否可以通过点击遮罩层关闭 */
  maskClosable?: boolean
  /** 是否可以通过 ESC 键关闭 */
  keyboard?: boolean
  /** 关闭时是否销毁内部元素 */
  destroyOnClose?: boolean
  /** 是否将模态框挂载到 body 元素下 */
  appendToBody?: boolean
  /** 关闭前的回调函数 */
  beforeClose?: (done: () => void) => void
  /** 是否可以拖动(仅对话框模式) */
  movable?: boolean
  /** 抽屉弹出方向 */
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt'
  /** 是否显示底部操作区域 */
  showFooter?: boolean
  /** 底部按钮类型 */
  footerType?: 'default' | 'close-only'
  /** 底部按钮对齐方式 */
  footerAlign?: 'left' | 'center' | 'right'
  /** 内容区域是否显示加载状态 */
  loading?: boolean
  /** 是否全屏显示 */
  fullscreen?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
}

/** AModal 组件事件定义 */
interface AModalEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
}
```

### AOssMediaManager OSS 媒体管理器

```typescript
/** OSS 媒体管理器组件 Props */
interface AOssMediaManagerProps {
  /** 绑定值,选中的文件URL或URL数组 */
  modelValue?: string | string[]
  /** 是否多选模式 */
  multiple?: boolean
  /** 最大选择数量(多选模式下有效) */
  limit?: number
  /** 文件类型过滤 */
  accept?: string[]
  /** 是否显示上传按钮 */
  showUpload?: boolean
  /** 是否显示删除按钮 */
  showDelete?: boolean
  /** 是否禁用 */
  disabled?: boolean
}
```

## 泛型组件类型

### 通用表格组件

```typescript
/**
 * 通用表格组件 Props
 * @template T 表格数据类型
 */
interface TableProps<T = any> {
  /** 表格数据(分页结果) */
  data: PageResult<T>
  /** 字段配置 */
  fields: FieldConfig[]
  /** 是否加载中 */
  loading?: boolean
  /** 是否显示选择框 */
  selection?: boolean
  /** 是否显示序号列 */
  showIndex?: boolean
  /** 表格高度 */
  height?: string | number
  /** 是否显示边框 */
  border?: boolean
  /** 是否显示斑马纹 */
  stripe?: boolean
  /** 表格尺寸 */
  size?: 'large' | 'default' | 'small'
}

/** 分页结果类型 */
interface PageResult<T> {
  rows: T[]
  total: number
}

/** 字段配置类型 */
interface FieldConfig {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
}

/**
 * 通用表格组件事件
 * @template T 表格数据类型
 */
interface TableEmits<T> {
  (e: 'select', rows: T[]): void
  (e: 'row-click', row: T): void
  (e: 'update:query', query: PageQuery): void
  (e: 'sort-change', column: any, prop: string, order: string): void
}
```

### 通用表单组件

```typescript
/**
 * 通用表单组件 Props
 * @template T 表单数据类型
 */
interface FormProps<T = any> {
  /** 表单数据 */
  modelValue: T
  /** 表单模式 */
  mode: 'add' | 'edit' | 'view'
  /** 表单配置 */
  config: FormConfig[]
  /** 表单验证规则 */
  rules?: FormRules
  /** 表单标签宽度 */
  labelWidth?: string | number
  /** 表单尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否禁用所有表单项 */
  disabled?: boolean
  /** 是否显示必填星号 */
  showRequiredAsterisk?: boolean
}

/** 表单配置类型 */
interface FormConfig {
  prop: string
  label: string
  component: 'input' | 'select' | 'date' | 'upload' | 'cascader'
  span?: number
  componentProps?: Record<string, any>
  hidden?: boolean
}

type FormRules = Record<string, FormRule[]>

interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}
```

## 响应式类型定义

### SpanType 响应式栅格类型

```typescript
/**
 * 响应式栅格跨度类型
 * 支持三种形式:
 * 1. 数字: 固定跨度
 * 2. 字符串: 预设配置 'auto'
 * 3. 响应式对象: 不同屏幕尺寸使用不同跨度
 */
type SpanType =
  | number
  | 'auto'
  | {
      xs?: number  // 超小屏 <768px
      sm?: number  // 小屏 ≥768px
      md?: number  // 中屏 ≥992px
      lg?: number  // 大屏 ≥1200px
      xl?: number  // 超大屏 ≥1920px
    }
```

#### 使用示例

```vue
<template>
  <!-- 固定跨度 -->
  <AFormInput label="用户名" v-model="form.userName" :span="12" />

  <!-- 预设响应式 -->
  <AFormInput label="邮箱" v-model="form.email" span="auto" />

  <!-- 自定义响应式 -->
  <AFormInput
    label="手机号"
    v-model="form.phone"
    :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
  />
</template>
```

### ResponsiveMode 响应式模式

```typescript
/** 响应式模式类型 */
type ResponsiveMode =
  | 'screen'      // 基于屏幕尺寸(默认)
  | 'container'   // 基于容器尺寸(弹窗场景推荐)
  | 'modal-size'  // 基于 AModal 的 size 属性

/** 模态框尺寸类型 */
type ModalSize = 'small' | 'medium' | 'large' | 'xl'
```

## Expose 暴露方法类型

```typescript
/** 表单组件暴露的方法 */
interface FormExpose {
  /** 验证表单 */
  validate: () => Promise<boolean>
  /** 验证指定字段 */
  validateField: (props: string[]) => Promise<boolean>
  /** 重置表单 */
  resetFields: () => void
  /** 清空验证结果 */
  clearValidate: () => void
  /** 滚动到指定字段 */
  scrollToField: (prop: string) => void
}
```

### 使用组件实例类型

```vue
<template>
  <BasicForm ref="formRef" v-model="form" :config="formConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormExpose } from '@/components'

const formRef = ref<FormExpose>()

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('验证通过')
  }
}
</script>
```

## 最佳实践

### 1. 使用 interface 而非 type

```typescript
// ✅ 推荐 - interface 可以扩展
interface ButtonProps {
  type?: ButtonType
  size?: ButtonSize
}

// ❌ 不推荐
type ButtonProps = {
  type?: ButtonType
  size?: ButtonSize
}
```

### 2. 为所有 Props 添加 JSDoc 注释

```typescript
interface FormInputProps {
  /**
   * 输入框类型
   * @default 'text'
   */
  type?: 'text' | 'password' | 'number'

  /**
   * 最大长度
   * @default 255
   */
  maxlength?: number
}
```

### 3. 使用 withDefaults 提供默认值

```typescript
const props = withDefaults(defineProps<FormInputProps>(), {
  type: 'text',
  maxlength: 255,
  clearable: true,
  disabled: false
})
```

### 4. 事件定义使用元组语法

```typescript
// ✅ 推荐 - 简洁清晰
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [data: FormData]
  cancel: []
}>()
```

### 5. 泛型组件使用 `script generic`

```vue
<script setup lang="ts" generic="T extends Record<string, any>">
interface TableProps {
  data: T[]
  fields: FieldConfig[]
}

const props = defineProps<TableProps>()

const emit = defineEmits<{
  select: [rows: T[]]
  'row-click': [row: T]
}>()
</script>
```

### 6. 使用联合类型而非字符串

```typescript
// ✅ 推荐 - 类型安全
interface ButtonProps {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
}

// ❌ 不推荐 - 没有类型检查
interface ButtonProps {
  type?: string
  size?: string
}
```

## 常见问题

### 1. Props 默认值设置后仍然是 undefined

**原因:** 没有使用 `withDefaults`，或默认值是对象/数组需要使用工厂函数

**解决:**
```typescript
const props = withDefaults(defineProps<{
  options?: SelectOption[]
  config?: FormConfig
}>(), {
  options: () => [],      // 数组使用工厂函数
  config: () => ({})      // 对象使用工厂函数
})
```

### 2. 泛型组件类型推导失败

**原因:** 没有使用 Vue 3.3+ 的 `generic` 语法

**解决:**
```vue
<script setup lang="ts" generic="T extends Record<string, any>">
interface TableProps {
  data: T[]
}
const props = defineProps<TableProps>()
</script>
```

### 3. 响应式 Props 在 computed 中丢失响应性

**原因:** 直接解构 Props

**解决:**
```typescript
const props = defineProps<FormProps>()

// ❌ 错误 - 直接解构会丢失响应性
const { label, disabled } = props

// ✅ 正确 - 在 computed 中访问
const isDisabled = computed(() => props.disabled || props.mode === 'view')

// ✅ 正确 - 使用 toRef
const label = toRef(props, 'label')
```

### 4. 组件 ref 类型不正确

**原因:** 使用了错误的实例类型

**解决:**
```vue
<script setup lang="ts">
// ✅ 正确 - 使用 expose 的接口类型
import type { FormExpose } from '@/components'
const formRef = ref<FormExpose>()

// 或使用 InstanceType
const formRef = ref<InstanceType<typeof BasicForm>>()
</script>
```

### 5. Props 验证器中的类型问题

**原因:** 使用运行时验证而非类型系统

**解决:**
```typescript
// ✅ 正确 - 使用 TypeScript 类型定义
interface Props {
  status?: 'active' | 'inactive' | 'pending'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending'
})
// 不需要 validator,类型系统已经保证了类型安全
```

### 6. Emits 类型定义导致编译错误或运行时异常

**问题描述:**

在定义组件事件类型时，经常会遇到以下错误：
- 类型 `xxx` 不能赋值给类型 `never`
- `emit` 调用时参数类型不匹配
- 事件名称类型推导失败

```typescript
// ❌ 错误的事件定义方式
const emit = defineEmits(['update:modelValue', 'change'])

// 调用时没有类型检查
emit('update:modelValue', value)  // value 是 any 类型
emit('unknownEvent')              // 不存在的事件也不会报错
```

**问题原因:**

1. **使用字符串数组定义事件** - 无法获得类型推导
2. **事件参数类型不明确** - 导致调用时类型检查失效
3. **旧语法与新语法混用** - Vue 3.3+ 推荐使用新的元组语法
4. **复杂参数类型未正确定义** - 特别是对象和数组参数

**解决方案:**

```typescript
// ✅ 方案1: 使用函数签名语法(Vue 3.2)
interface FormEmits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number, oldValue: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'submit', data: FormData): void
  (e: 'cancel'): void
}

const emit = defineEmits<FormEmits>()

// 调用时有完整类型检查
emit('update:modelValue', 'hello')     // ✅ 正确
emit('update:modelValue', 123)         // ✅ 正确
emit('update:modelValue', true)        // ❌ 类型错误: boolean 不能赋值给 string | number
emit('change', 'new', 'old')           // ✅ 正确
emit('unknown')                        // ❌ 类型错误: 事件不存在
```

```typescript
// ✅ 方案2: 使用元组语法(Vue 3.3+ 推荐)
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number, oldValue: string | number]
  blur: [event: FocusEvent]
  submit: [data: FormData]
  cancel: []
}>()

// 元组语法更简洁，类型检查同样严格
emit('change', 'new', 'old')  // ✅ 正确
emit('cancel')                 // ✅ 正确
```

```typescript
// ✅ 方案3: 复杂对象参数的事件定义
interface TableRowData {
  id: string | number
  name: string
  status: 'active' | 'inactive'
  [key: string]: any
}

interface PaginationInfo {
  current: number
  pageSize: number
  total: number
}

const emit = defineEmits<{
  /** 行点击事件 */
  'row-click': [row: TableRowData, index: number]
  /** 行选择变化事件 */
  'selection-change': [rows: TableRowData[]]
  /** 分页变化事件 */
  'pagination-change': [pagination: PaginationInfo]
  /** 排序变化事件 */
  'sort-change': [column: string, order: 'ascending' | 'descending' | null]
}>()
```

```vue
<!-- ✅ 完整组件示例 -->
<script setup lang="ts">
import { ref } from 'vue'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null, option: SelectOption | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  'visible-change': [visible: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false
})

const emit = defineEmits<Emits>()

// 类型安全的事件触发
const handleChange = (value: string | number | null) => {
  const selectedOption = props.options.find(opt => opt.value === value) ?? null
  emit('update:modelValue', value)
  emit('change', value, selectedOption)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleVisibleChange = (visible: boolean) => {
  emit('visible-change', visible)
}
</script>
```

**注意事项:**

1. **优先使用元组语法** - Vue 3.3+ 的元组语法更简洁且类型推导更准确
2. **为每个参数命名** - `[value: string]` 比 `[string]` 可读性更好
3. **添加 JSDoc 注释** - 帮助其他开发者理解事件用途
4. **无参数事件使用空数组** - `cancel: []` 表示没有参数

### 7. 复杂嵌套类型导致循环引用错误

**问题描述:**

在定义树形数据、递归组件或复杂数据结构时，经常遇到循环引用问题：

```typescript
// ❌ 错误: 循环引用导致类型无限递归
type TreeNode = {
  id: string
  name: string
  children: TreeNode[]  // 自引用
  parent: TreeNode      // 如果同时有 parent 和 children，可能导致问题
}

// ❌ 编译错误: Type alias 'TreeNode' circularly references itself
type TreeNode = TreeNode & {
  extra: string
}
```

**问题原因:**

1. **类型别名(type)的自引用限制** - 在某些情况下不支持直接递归
2. **类型别名不支持声明合并** - 无法扩展已有的 type
3. **循环依赖的组件类型** - 组件 A 引用 B，B 又引用 A
4. **过深的嵌套类型** - 导致 TypeScript 编译器性能问题

**解决方案:**

```typescript
// ✅ 方案1: 使用 interface 定义递归类型(推荐)
interface TreeNode {
  id: string | number
  name: string
  children?: TreeNode[]
  parent?: TreeNode
  level?: number
  isLeaf?: boolean
  expanded?: boolean
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  data?: Record<string, any>
}

// interface 支持声明合并,可以扩展
interface TreeNode {
  icon?: string
  customClass?: string
}
```

```typescript
// ✅ 方案2: 使用泛型约束递归类型
interface BaseTreeNode<T = unknown> {
  id: string | number
  name: string
  children?: Array<BaseTreeNode<T> & T>
  data?: T
}

// 扩展基础类型
interface MenuNode extends BaseTreeNode<{
  path: string
  component: string
  permission?: string
}> {
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
}

// 使用示例
const menu: MenuNode = {
  id: 1,
  name: '系统管理',
  icon: 'setting',
  hidden: false,
  data: {
    path: '/system',
    component: 'Layout'
  },
  children: [
    {
      id: 2,
      name: '用户管理',
      icon: 'user',
      hidden: false,
      data: {
        path: '/system/user',
        component: 'system/user/index',
        permission: 'system:user:list'
      }
    }
  ]
}
```

```typescript
// ✅ 方案3: 使用类型工具处理深层嵌套
// 定义一个安全的深度递归类型
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T

type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T

// 限制递归深度,避免无限循环
type TreeNodeWithDepth<D extends number = 5> = D extends 0
  ? { id: string; name: string }
  : {
      id: string
      name: string
      children?: TreeNodeWithDepth<Prev[D]>[]
    }

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

```typescript
// ✅ 方案4: 解决组件间的循环类型依赖
// types/tree.ts
export interface TreeNodeData {
  id: string | number
  name: string
  children?: TreeNodeData[]
}

// TreeNode.vue - 使用延迟引用
<script setup lang="ts">
import type { TreeNodeData } from '@/types/tree'
import { defineAsyncComponent } from 'vue'

// 延迟加载自身,避免循环引用
const TreeNode = defineAsyncComponent(() => import('./TreeNode.vue'))

interface Props {
  node: TreeNodeData
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})
</script>

<template>
  <div :style="{ paddingLeft: `${level * 20}px` }">
    <span>{{ node.name }}</span>
    <template v-if="node.children?.length">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
      />
    </template>
  </div>
</template>
```

```typescript
// ✅ 方案5: 使用工厂函数创建类型安全的树结构
interface TreeFactory<T extends { id: string | number }> {
  createNode: (data: Omit<T, 'children'>, children?: T[]) => T
  findNode: (tree: T[], id: string | number) => T | undefined
  flattenTree: (tree: T[]) => T[]
  filterTree: (tree: T[], predicate: (node: T) => boolean) => T[]
}

function createTreeFactory<T extends { id: string | number; children?: T[] }>(): TreeFactory<T> {
  return {
    createNode(data, children = []) {
      return { ...data, children } as T
    },

    findNode(tree, id) {
      for (const node of tree) {
        if (node.id === id) return node
        if (node.children?.length) {
          const found = this.findNode(node.children, id)
          if (found) return found
        }
      }
      return undefined
    },

    flattenTree(tree) {
      return tree.reduce<T[]>((acc, node) => {
        acc.push(node)
        if (node.children?.length) {
          acc.push(...this.flattenTree(node.children))
        }
        return acc
      }, [])
    },

    filterTree(tree, predicate) {
      return tree
        .filter(predicate)
        .map(node => ({
          ...node,
          children: node.children?.length
            ? this.filterTree(node.children, predicate)
            : []
        }))
    }
  }
}

// 使用工厂
interface DeptNode {
  id: number
  name: string
  code: string
  parentId: number | null
  children?: DeptNode[]
}

const deptTreeFactory = createTreeFactory<DeptNode>()

const deptTree: DeptNode[] = [
  deptTreeFactory.createNode(
    { id: 1, name: '总公司', code: 'HQ', parentId: null },
    [
      deptTreeFactory.createNode({ id: 2, name: '研发部', code: 'RD', parentId: 1 }),
      deptTreeFactory.createNode({ id: 3, name: '市场部', code: 'MKT', parentId: 1 })
    ]
  )
]
```

### 8. 表单验证规则类型推导不完整

**问题描述:**

在使用 Element Plus 或自定义表单验证时，类型推导经常失效：

```typescript
// ❌ 类型推导问题
const rules = {
  userName: [
    { required: true, message: '请输入用户名' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' }  // type 属性类型报错
  ]
}

// rule 参数是 any 类型,没有类型检查
const validatePass = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}
```

**问题原因:**

1. **Element Plus 的 FormRules 类型定义复杂** - 导致自动推导失败
2. **自定义验证器函数类型不明确** - rule、value、callback 都是 any
3. **规则对象字面量类型收窄** - TypeScript 默认推导为更宽泛的类型
4. **异步验证器类型定义缺失** - Promise 返回类型不明确

**解决方案:**

```typescript
// ✅ 方案1: 导入并使用 Element Plus 类型
import type { FormRules, FormItemRule } from 'element-plus'

// 完整的表单规则类型定义
const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}
```

```typescript
// ✅ 方案2: 类型安全的自定义验证器
import type { FormItemRule } from 'element-plus'
import type { InternalRuleItem, Value } from 'async-validator'

// 定义验证器函数类型
type ValidatorFunction = (
  rule: InternalRuleItem,
  value: Value,
  callback: (error?: string | Error) => void
) => void | Promise<void>

// 类型安全的验证器工厂
function createValidator<T>(
  validate: (value: T, rule: InternalRuleItem) => string | undefined | Promise<string | undefined>
): ValidatorFunction {
  return async (rule, value, callback) => {
    try {
      const error = await validate(value as T, rule)
      if (error) {
        callback(new Error(error))
      } else {
        callback()
      }
    } catch (e) {
      callback(e instanceof Error ? e : new Error(String(e)))
    }
  }
}

// 使用验证器工厂
const validatePassword = createValidator<string>((value) => {
  if (!value) {
    return '请输入密码'
  }
  if (value.length < 6) {
    return '密码长度不能小于6位'
  }
  if (!/[A-Z]/.test(value)) {
    return '密码必须包含大写字母'
  }
  if (!/[0-9]/.test(value)) {
    return '密码必须包含数字'
  }
  return undefined
})

const validateConfirmPassword = (password: Ref<string>) =>
  createValidator<string>((value) => {
    if (!value) {
      return '请再次输入密码'
    }
    if (value !== password.value) {
      return '两次输入密码不一致'
    }
    return undefined
  })
```

```typescript
// ✅ 方案3: 完整的表单类型定义系统
import type { FormRules, FormInstance } from 'element-plus'

// 表单数据类型
interface UserForm {
  userName: string
  nickName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  deptId: number | null
  roleIds: number[]
  status: '0' | '1'
  remark?: string
}

// 表单默认值
const defaultFormData: UserForm = {
  userName: '',
  nickName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  deptId: null,
  roleIds: [],
  status: '0',
  remark: ''
}

// 类型安全的规则定义
function createUserFormRules(form: Ref<UserForm>): FormRules {
  return {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '用户名只能包含字母、数字和下划线,且必须以字母开头',
        trigger: 'blur'
      }
    ],
    nickName: [
      { required: true, message: '请输入用户昵称', trigger: 'blur' },
      { max: 30, message: '昵称长度不能超过30个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
      {
        validator: createValidator<string>((value) => {
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return '密码必须包含大小写字母和数字'
          }
          return undefined
        }),
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.value.password) {
            callback(new Error('两次输入密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    deptId: [
      { required: true, message: '请选择部门', trigger: 'change' }
    ],
    roleIds: [
      {
        type: 'array',
        required: true,
        message: '请选择角色',
        trigger: 'change'
      }
    ]
  }
}

// 在组件中使用
const form = ref<UserForm>({ ...defaultFormData })
const formRef = ref<FormInstance>()
const rules = computed(() => createUserFormRules(form))
```

```typescript
// ✅ 方案4: 可复用的验证规则库
// utils/validators.ts

import type { FormItemRule } from 'element-plus'

/** 必填验证 */
export const required = (message: string, trigger: 'blur' | 'change' = 'blur'): FormItemRule => ({
  required: true,
  message,
  trigger
})

/** 长度范围验证 */
export const length = (min: number, max: number, message?: string): FormItemRule => ({
  min,
  max,
  message: message || `长度在 ${min} 到 ${max} 个字符`,
  trigger: 'blur'
})

/** 正则验证 */
export const pattern = (regex: RegExp, message: string): FormItemRule => ({
  pattern: regex,
  message,
  trigger: 'blur'
})

/** 邮箱验证 */
export const email = (message = '邮箱格式不正确'): FormItemRule => ({
  type: 'email',
  message,
  trigger: 'blur'
})

/** 手机号验证 */
export const phone = (message = '手机号格式不正确'): FormItemRule =>
  pattern(/^1[3-9]\d{9}$/, message)

/** URL 验证 */
export const url = (message = 'URL格式不正确'): FormItemRule => ({
  type: 'url',
  message,
  trigger: 'blur'
})

/** 数值范围验证 */
export const range = (min: number, max: number, message?: string): FormItemRule => ({
  type: 'number',
  min,
  max,
  message: message || `数值范围在 ${min} 到 ${max}`,
  trigger: 'blur'
})

// 使用示例
import { required, length, email, phone } from '@/utils/validators'

const rules: FormRules = {
  userName: [required('请输入用户名'), length(2, 20)],
  email: [required('请输入邮箱'), email()],
  phone: [required('请输入手机号'), phone()]
}
```

### 9. 条件类型与 Props 联动实现困难

**问题描述:**

当组件的某些 Props 依赖于其他 Props 的值时，类型定义变得复杂：

```typescript
// ❌ 问题: 无法表达 Props 之间的依赖关系
interface DatePickerProps {
  type: 'date' | 'daterange' | 'datetime' | 'datetimerange'
  modelValue: string | string[]  // 单选是 string,范围选择是 string[]
  // 但 TypeScript 无法根据 type 推导 modelValue 的类型
}
```

**解决方案:**

```typescript
// ✅ 方案1: 使用联合类型区分不同模式
interface DatePickerBase {
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  format?: string
}

interface SingleDatePickerProps extends DatePickerBase {
  type: 'date' | 'datetime'
  modelValue: string | null
}

interface RangeDatePickerProps extends DatePickerBase {
  type: 'daterange' | 'datetimerange'
  modelValue: [string, string] | null
  startPlaceholder?: string
  endPlaceholder?: string
  rangeSeparator?: string
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps

// 类型守卫函数
function isRangePicker(props: DatePickerProps): props is RangeDatePickerProps {
  return props.type === 'daterange' || props.type === 'datetimerange'
}

// 在组件中使用
const props = defineProps<DatePickerProps>()

// 根据类型使用不同的值
if (isRangePicker(props)) {
  // 这里 props.modelValue 类型是 [string, string] | null
  console.log(props.startPlaceholder)  // ✅ 可以访问范围选择器特有属性
} else {
  // 这里 props.modelValue 类型是 string | null
  console.log(props.placeholder)
}
```

```typescript
// ✅ 方案2: 使用泛型实现类型安全的条件 Props
interface FormItemBase<T> {
  modelValue: T
  label?: string
  prop?: string
  disabled?: boolean
}

// 输入框 Props
interface InputFormItem extends FormItemBase<string> {
  component: 'input'
  maxlength?: number
  showWordLimit?: boolean
  type?: 'text' | 'password' | 'textarea'
}

// 数字输入框 Props
interface NumberFormItem extends FormItemBase<number> {
  component: 'number'
  min?: number
  max?: number
  step?: number
  precision?: number
}

// 选择器 Props
interface SelectFormItem<V = string | number> extends FormItemBase<V | V[]> {
  component: 'select'
  options: Array<{ label: string; value: V; disabled?: boolean }>
  multiple?: boolean
  filterable?: boolean
}

// 日期选择器 Props
interface DateFormItem extends FormItemBase<string | [string, string]> {
  component: 'date'
  type?: 'date' | 'daterange' | 'datetime' | 'datetimerange'
  format?: string
}

// 联合类型
type FormItemProps =
  | InputFormItem
  | NumberFormItem
  | SelectFormItem
  | DateFormItem

// 动态表单项组件
function DynamicFormItem(props: FormItemProps) {
  switch (props.component) {
    case 'input':
      // props 类型自动收窄为 InputFormItem
      return renderInput(props)
    case 'number':
      // props 类型自动收窄为 NumberFormItem
      return renderNumber(props)
    case 'select':
      // props 类型自动收窄为 SelectFormItem
      return renderSelect(props)
    case 'date':
      // props 类型自动收窄为 DateFormItem
      return renderDate(props)
  }
}
```

```typescript
// ✅ 方案3: 使用条件类型推导返回值
// 根据输入类型自动推导返回类型
type InferModelValue<T extends FormItemProps> =
  T extends InputFormItem ? string :
  T extends NumberFormItem ? number :
  T extends SelectFormItem<infer V> ? (T extends { multiple: true } ? V[] : V) :
  T extends DateFormItem ? (T extends { type: 'daterange' | 'datetimerange' } ? [string, string] : string) :
  never

// 泛型函数根据配置返回正确类型
function getFormItemValue<T extends FormItemProps>(config: T): InferModelValue<T> {
  return config.modelValue as InferModelValue<T>
}

// 使用示例
const inputConfig: InputFormItem = {
  component: 'input',
  modelValue: 'hello',
  label: '用户名'
}
const inputValue = getFormItemValue(inputConfig)  // 类型: string

const selectConfig: SelectFormItem<number> & { multiple: true } = {
  component: 'select',
  modelValue: [1, 2, 3],
  options: [
    { label: '选项1', value: 1 },
    { label: '选项2', value: 2 },
    { label: '选项3', value: 3 }
  ],
  multiple: true
}
const selectValue = getFormItemValue(selectConfig)  // 类型: number[]
```

```vue
<!-- ✅ 方案4: 完整的条件 Props 组件实现 -->
<script setup lang="ts">
import { computed } from 'vue'

// 基础类型
interface BaseUploadProps {
  disabled?: boolean
  tip?: string
}

// 单文件上传
interface SingleUploadProps extends BaseUploadProps {
  multiple?: false
  modelValue: string | null
}

// 多文件上传
interface MultipleUploadProps extends BaseUploadProps {
  multiple: true
  modelValue: string[]
  limit?: number
}

type UploadProps = SingleUploadProps | MultipleUploadProps

const props = defineProps<UploadProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null | string[]]
}>()

// 根据 multiple 判断是否是多选模式
const isMultiple = computed(() => props.multiple === true)

// 类型安全的值处理
const fileList = computed(() => {
  if (isMultiple.value) {
    return (props as MultipleUploadProps).modelValue
  }
  const value = (props as SingleUploadProps).modelValue
  return value ? [value] : []
})

// 添加文件
const addFile = (url: string) => {
  if (isMultiple.value) {
    const current = (props as MultipleUploadProps).modelValue
    const limit = (props as MultipleUploadProps).limit
    if (limit && current.length >= limit) {
      console.warn('超出最大数量限制')
      return
    }
    emit('update:modelValue', [...current, url])
  } else {
    emit('update:modelValue', url)
  }
}

// 删除文件
const removeFile = (index: number) => {
  if (isMultiple.value) {
    const current = (props as MultipleUploadProps).modelValue
    emit('update:modelValue', current.filter((_, i) => i !== index))
  } else {
    emit('update:modelValue', null)
  }
}
</script>
```

### 10. 插槽类型定义与作用域插槽类型推导

**问题描述:**

定义插槽类型时经常遇到以下问题：

```typescript
// ❌ 插槽类型定义不完整,使用时没有类型提示
// 作用域插槽参数是 any 类型

<template>
  <slot name="item" :data="item" :index="idx" />
</template>

<!-- 使用时 -->
<MyComponent>
  <template #item="{ data, index }">
    <!-- data 和 index 都是 any 类型 -->
  </template>
</MyComponent>
```

**解决方案:**

```typescript
// ✅ 方案1: 使用 defineSlots 定义插槽类型(Vue 3.3+)
<script setup lang="ts">
interface ListItem {
  id: number
  name: string
  status: 'active' | 'inactive'
}

interface Props {
  items: ListItem[]
}

const props = defineProps<Props>()

// 定义插槽类型
defineSlots<{
  /** 默认插槽 */
  default?: () => any
  /** 列表项插槽 */
  item?: (props: { data: ListItem; index: number }) => any
  /** 空状态插槽 */
  empty?: () => any
  /** 头部插槽 */
  header?: (props: { total: number }) => any
  /** 底部插槽 */
  footer?: (props: { selectedCount: number }) => any
}>()
</script>

<template>
  <div class="list">
    <div class="list-header">
      <slot name="header" :total="items.length" />
    </div>

    <template v-if="items.length">
      <div v-for="(item, index) in items" :key="item.id" class="list-item">
        <slot name="item" :data="item" :index="index">
          <!-- 默认内容 -->
          {{ item.name }}
        </slot>
      </div>
    </template>
    <template v-else>
      <slot name="empty">
        <div class="empty">暂无数据</div>
      </slot>
    </template>

    <div class="list-footer">
      <slot name="footer" :selected-count="0" />
    </div>
  </div>
</template>
```

```typescript
// ✅ 方案2: 表格组件的复杂插槽类型
<script setup lang="ts" generic="T extends Record<string, any>">
interface ColumnConfig<R = T> {
  prop: keyof R | string
  label: string
  width?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  slotName?: string
}

interface Props {
  data: T[]
  columns: ColumnConfig<T>[]
  loading?: boolean
}

const props = defineProps<Props>()

// 泛型插槽类型定义
defineSlots<{
  /** 默认插槽 - 用于自定义整个表格 */
  default?: () => any
  /** 表头插槽 */
  header?: (props: { column: ColumnConfig<T>; columnIndex: number }) => any
  /** 单元格插槽 - 动态插槽名 */
  [key: `cell-${string}`]: (props: {
    row: T
    column: ColumnConfig<T>
    rowIndex: number
    columnIndex: number
    value: any
  }) => any
  /** 展开行插槽 */
  expand?: (props: { row: T; rowIndex: number }) => any
  /** 空状态插槽 */
  empty?: () => any
  /** 加载状态插槽 */
  loading?: () => any
  /** 操作列插槽 */
  actions?: (props: { row: T; rowIndex: number }) => any
}>()
</script>
```

```vue
<!-- ✅ 方案3: 使用插槽的父组件(有完整类型提示) -->
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
}

const users = ref<User[]>([])
</script>

<template>
  <DataTable :data="users" :columns="columns">
    <!-- 单元格插槽 - 有完整的类型提示 -->
    <template #cell-name="{ row, value }">
      <!-- row 类型是 User, value 类型是 any -->
      <span class="user-name">{{ value }}</span>
    </template>

    <template #cell-status="{ row }">
      <!-- row.status 有类型提示: 'active' | 'inactive' -->
      <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
        {{ row.status === 'active' ? '启用' : '禁用' }}
      </el-tag>
    </template>

    <template #cell-createdAt="{ value }">
      {{ formatDate(value) }}
    </template>

    <!-- 操作列插槽 -->
    <template #actions="{ row, rowIndex }">
      <el-button @click="handleEdit(row)">编辑</el-button>
      <el-button type="danger" @click="handleDelete(row.id)">删除</el-button>
    </template>

    <!-- 空状态插槽 -->
    <template #empty>
      <el-empty description="暂无用户数据" />
    </template>
  </DataTable>
</template>
```

```typescript
// ✅ 方案4: 类型安全的渲染函数插槽
import { h, useSlots, type VNode, type Slots } from 'vue'

interface TreeNode {
  id: string
  name: string
  icon?: string
  children?: TreeNode[]
}

interface TreeSlots {
  /** 节点标题插槽 */
  title?: (props: { node: TreeNode; level: number }) => VNode[]
  /** 节点图标插槽 */
  icon?: (props: { node: TreeNode }) => VNode[]
  /** 节点操作插槽 */
  actions?: (props: { node: TreeNode; level: number }) => VNode[]
  /** 空状态插槽 */
  empty?: () => VNode[]
}

// 类型安全的插槽渲染辅助函数
function renderSlot<K extends keyof TreeSlots>(
  slots: Slots,
  name: K,
  props: TreeSlots[K] extends ((props: infer P) => any) ? P : never,
  fallback?: () => VNode
): VNode {
  const slot = slots[name] as TreeSlots[K]
  if (slot && typeof slot === 'function') {
    return h('div', { class: `slot-${name}` }, slot(props as any))
  }
  return fallback ? fallback() : h('span')
}

// 在 setup 中使用
const slots = useSlots() as unknown as TreeSlots

// 渲染节点
function renderNode(node: TreeNode, level: number): VNode {
  return h('div', { class: 'tree-node' }, [
    // 渲染图标插槽
    renderSlot(slots as Slots, 'icon', { node }, () =>
      h('span', { class: 'default-icon' }, '📁')
    ),
    // 渲染标题插槽
    renderSlot(slots as Slots, 'title', { node, level }, () =>
      h('span', { class: 'node-title' }, node.name)
    ),
    // 渲染操作插槽
    renderSlot(slots as Slots, 'actions', { node, level })
  ])
}
```

### 11. 第三方组件类型增强与扩展

**问题描述:**

使用第三方组件库时，经常需要扩展或修改其类型定义：

```typescript
// ❌ 问题: Element Plus 组件缺少某些自定义属性的类型
// ❌ 问题: 二次封装组件时类型丢失
// ❌ 问题: 全局注册的组件没有类型提示
```

**解决方案:**

```typescript
// ✅ 方案1: 扩展 Element Plus 组件类型
// types/element-plus.d.ts

import type { ElTable, ElTableColumn, ElForm, ElFormItem } from 'element-plus'

// 扩展 Table 组件 Props
declare module 'element-plus' {
  interface TableProps<T = any> {
    /** 自定义空数据图标 */
    emptyIcon?: string
    /** 是否显示刷新按钮 */
    showRefresh?: boolean
    /** 刷新回调 */
    onRefresh?: () => void
  }

  interface TableColumnProps<T = any> {
    /** 自定义字典标签类型 */
    dictType?: string
    /** 是否可复制 */
    copyable?: boolean
    /** 自定义渲染函数 */
    render?: (scope: { row: T; $index: number }) => VNode
  }

  interface FormProps {
    /** 表单模式 */
    mode?: 'add' | 'edit' | 'view'
    /** 是否显示冒号 */
    showColon?: boolean
  }
}

export {}
```

```typescript
// ✅ 方案2: 二次封装保留原始类型
// components/ATable/types.ts

import type { TableProps as ElTableProps, TableColumnProps as ElColumnProps } from 'element-plus'

// 继承 Element Plus 类型并扩展
export interface ATableProps<T = any> extends /* @vue-ignore */ Partial<ElTableProps<T>> {
  /** 表格数据 */
  data: T[]
  /** 字段配置 */
  fields: ATableColumn<T>[]
  /** 是否显示分页 */
  pagination?: boolean
  /** 分页配置 */
  paginationConfig?: {
    current: number
    pageSize: number
    total: number
    pageSizes?: number[]
  }
  /** 是否显示操作列 */
  showActions?: boolean
  /** 操作列宽度 */
  actionsWidth?: number
  /** 操作列固定位置 */
  actionsFixed?: 'left' | 'right'
}

export interface ATableColumn<T = any> extends Partial<ElColumnProps<T>> {
  /** 字段名 */
  prop: keyof T | string
  /** 显示标签 */
  label: string
  /** 插槽名称 */
  slotName?: string
  /** 字典类型 */
  dictType?: string
  /** 格式化函数 */
  formatter?: (row: T, column: ATableColumn<T>, cellValue: any, index: number) => string
  /** 是否隐藏 */
  hidden?: boolean
  /** 子列(多级表头) */
  children?: ATableColumn<T>[]
}

export interface ATableEmits<T = any> {
  /** 选择变化 */
  (e: 'selection-change', rows: T[]): void
  /** 行点击 */
  (e: 'row-click', row: T, column: any, event: Event): void
  /** 分页变化 */
  (e: 'pagination-change', pagination: { current: number; pageSize: number }): void
  /** 排序变化 */
  (e: 'sort-change', data: { prop: string; order: 'ascending' | 'descending' | null }): void
  /** 刷新 */
  (e: 'refresh'): void
}

export interface ATableExpose<T = any> {
  /** 获取 ElTable 实例 */
  getTableRef: () => InstanceType<typeof import('element-plus')['ElTable']> | undefined
  /** 清空选择 */
  clearSelection: () => void
  /** 切换行选中状态 */
  toggleRowSelection: (row: T, selected?: boolean) => void
  /** 设置当前行 */
  setCurrentRow: (row: T) => void
  /** 刷新数据 */
  refresh: () => void
}
```

```vue
<!-- ✅ 方案3: 封装组件实现 -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, useAttrs } from 'vue'
import { ElTable, ElTableColumn, ElPagination } from 'element-plus'
import type { ATableProps, ATableEmits, ATableExpose, ATableColumn } from './types'

const props = withDefaults(defineProps<ATableProps<T>>(), {
  pagination: true,
  showActions: true,
  actionsWidth: 150,
  actionsFixed: 'right'
})

const emit = defineEmits<ATableEmits<T>>()

const attrs = useAttrs()
const tableRef = ref<InstanceType<typeof ElTable>>()

// 过滤隐藏列
const visibleFields = computed(() =>
  props.fields.filter(field => !field.hidden)
)

// 暴露方法
defineExpose<ATableExpose<T>>({
  getTableRef: () => tableRef.value,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected),
  setCurrentRow: (row) => tableRef.value?.setCurrentRow(row),
  refresh: () => emit('refresh')
})
</script>

<template>
  <div class="a-table">
    <el-table
      ref="tableRef"
      v-bind="attrs"
      :data="data"
      @selection-change="rows => emit('selection-change', rows)"
      @row-click="(row, column, event) => emit('row-click', row, column, event)"
      @sort-change="data => emit('sort-change', data)"
    >
      <el-table-column v-if="selection" type="selection" width="50" />
      <el-table-column v-if="showIndex" type="index" label="序号" width="60" />

      <template v-for="field in visibleFields" :key="field.prop">
        <el-table-column v-bind="field">
          <template v-if="field.slotName || $slots[`cell-${field.prop}`]" #default="scope">
            <slot :name="field.slotName || `cell-${field.prop}`" v-bind="scope" />
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="showActions"
        label="操作"
        :width="actionsWidth"
        :fixed="actionsFixed"
      >
        <template #default="scope">
          <slot name="actions" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="pagination && paginationConfig"
      :current-page="paginationConfig.current"
      :page-size="paginationConfig.pageSize"
      :total="paginationConfig.total"
      :page-sizes="paginationConfig.pageSizes || [10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="size => emit('pagination-change', { current: 1, pageSize: size })"
      @current-change="page => emit('pagination-change', { current: page, pageSize: paginationConfig!.pageSize })"
    />
  </div>
</template>
```

```typescript
// ✅ 方案4: 全局组件类型声明
// types/components.d.ts

import type { ATableProps, ATableExpose } from '@/components/ATable/types'
import type { AModalProps } from '@/components/AModal/types'
import type { AFormProps } from '@/components/AForm/types'

// 声明全局组件类型
declare module 'vue' {
  export interface GlobalComponents {
    /** 高级表格组件 */
    ATable: new <T extends Record<string, any> = any>() => {
      $props: ATableProps<T>
      $slots: {
        default?: () => VNode[]
        actions?: (props: { row: T; $index: number }) => VNode[]
        [key: `cell-${string}`]: (props: { row: T; column: any; $index: number }) => VNode[]
      }
    }
    /** 模态框组件 */
    AModal: typeof import('@/components/AModal/index.vue')['default']
    /** 高级表单组件 */
    AForm: typeof import('@/components/AForm/index.vue')['default']
  }
}

export {}
```

### 12. 类型导出导致打包体积增加

**问题描述:**

不当的类型导出方式可能导致运行时代码被打包：

```typescript
// ❌ 问题: 导出时混合了类型和运行时代码
export { UserForm, type UserFormProps } from './UserForm'
// 可能导致 UserForm 组件被包含在 bundle 中,即使只用了类型

// ❌ 问题: 从入口文件导出所有类型
// index.ts
export * from './components'
export * from './types'
export * from './utils'
// 可能导致 tree-shaking 失效
```

**解决方案:**

```typescript
// ✅ 方案1: 分离类型导出文件
// types/index.ts - 纯类型导出
export type { UserFormProps, UserFormEmits, UserFormExpose } from './user-form'
export type { TableProps, TableColumn, TableEmits } from './table'
export type { ModalProps, ModalEmits } from './modal'
export type { TreeNode, TreeProps } from './tree'

// 在 tsconfig.json 中配置 isolatedModules
{
  "compilerOptions": {
    "isolatedModules": true,
    "verbatimModuleSyntax": true  // TypeScript 5.0+
  }
}
```

```typescript
// ✅ 方案2: 使用 export type 语法
// components/index.ts

// 导出组件(运行时)
export { default as ATable } from './ATable/index.vue'
export { default as AModal } from './AModal/index.vue'
export { default as AForm } from './AForm/index.vue'

// 分离导出类型(仅编译时)
export type { ATableProps, ATableColumn, ATableEmits, ATableExpose } from './ATable/types'
export type { AModalProps, AModalEmits } from './AModal/types'
export type { AFormProps, AFormEmits, AFormExpose } from './AForm/types'
```

```typescript
// ✅ 方案3: 按需导入类型
// 使用时按需导入,避免全量导入

// ❌ 不推荐 - 全量导入
import { type ATableProps, type AModalProps, type AFormProps } from '@/components'

// ✅ 推荐 - 按路径导入
import type { ATableProps } from '@/components/ATable/types'
import type { AModalProps } from '@/components/AModal/types'

// 或使用类型专用入口
import type { ATableProps, AModalProps, AFormProps } from '@/types'
```

```typescript
// ✅ 方案4: 避免在类型中引入运行时依赖
// types/form.ts

// ❌ 不推荐 - 引入了 Element Plus 运行时代码
import { FormInstance, FormItemInstance } from 'element-plus'

export interface FormExpose {
  formRef: FormInstance
  formItemRefs: FormItemInstance[]
}

// ✅ 推荐 - 仅引入类型
import type { FormInstance, FormItemInstance } from 'element-plus'

export interface FormExpose {
  formRef: FormInstance | undefined
  formItemRefs: FormItemInstance[]
}

// 或者使用 InstanceType
export interface FormExpose {
  formRef: InstanceType<typeof import('element-plus')['ElForm']> | undefined
  validate: () => Promise<boolean>
  resetFields: () => void
}
```

```typescript
// ✅ 方案5: 使用 declare 避免运行时导入
// types/global.d.ts

// 声明模块类型而不导入
declare module '@/stores/user' {
  export interface UserInfo {
    id: number
    userName: string
    nickName: string
    avatar: string
    roles: string[]
    permissions: string[]
  }

  export interface UserState {
    token: string
    userInfo: UserInfo | null
    roles: string[]
    permissions: string[]
  }
}

// 在组件中使用
import type { UserInfo } from '@/stores/user'

const userInfo = ref<UserInfo | null>(null)
```

```json
// ✅ 方案6: Vite 配置优化类型导入
// vite.config.ts
{
  "build": {
    "rollupOptions": {
      "treeshake": {
        "moduleSideEffects": false,
        "propertyReadSideEffects": false
      }
    }
  },
  "esbuild": {
    "treeShaking": true,
    "ignoreAnnotations": false
  }
}
```

### 13. 动态组件类型推导失败

**问题描述:**

使用动态组件 (`<component :is="...">`) 时，类型推导经常失效：

```vue
<!-- ❌ 动态组件没有类型检查 -->
<template>
  <component :is="currentComponent" v-bind="componentProps" />
</template>

<script setup lang="ts">
// componentProps 是 any 类型,没有类型检查
const componentProps = ref({})
</script>
```

**解决方案:**

```typescript
// ✅ 方案1: 使用联合类型定义组件映射
import AInput from './AInput.vue'
import ASelect from './ASelect.vue'
import ADatePicker from './ADatePicker.vue'
import ACascader from './ACascader.vue'

// 定义组件映射类型
const componentMap = {
  input: AInput,
  select: ASelect,
  date: ADatePicker,
  cascader: ACascader
} as const

type ComponentType = keyof typeof componentMap
type ComponentInstance = typeof componentMap[ComponentType]

// Props 类型映射
interface ComponentPropsMap {
  input: {
    modelValue: string
    placeholder?: string
    maxlength?: number
    type?: 'text' | 'password' | 'textarea'
  }
  select: {
    modelValue: string | number | string[] | number[]
    options: Array<{ label: string; value: string | number }>
    multiple?: boolean
    filterable?: boolean
  }
  date: {
    modelValue: string | [string, string]
    type?: 'date' | 'daterange' | 'datetime'
    format?: string
  }
  cascader: {
    modelValue: (string | number)[]
    options: CascaderOption[]
    props?: { checkStrictly?: boolean; multiple?: boolean }
  }
}

// 类型安全的动态组件
interface DynamicFormItem<T extends ComponentType = ComponentType> {
  type: T
  prop: string
  label: string
  props: ComponentPropsMap[T]
}
```

```vue
<!-- ✅ 方案2: 类型安全的动态组件实现 -->
<script setup lang="ts">
import { computed, type Component } from 'vue'
import AInput from './AInput.vue'
import ASelect from './ASelect.vue'
import ADatePicker from './ADatePicker.vue'

// 组件映射
const componentMap: Record<string, Component> = {
  input: AInput,
  select: ASelect,
  date: ADatePicker
}

// Props 类型
interface InputProps {
  modelValue: string
  placeholder?: string
}

interface SelectProps {
  modelValue: string | number
  options: Array<{ label: string; value: string | number }>
}

interface DateProps {
  modelValue: string
  format?: string
}

// 联合类型
type FormItemConfig =
  | { type: 'input'; props: InputProps }
  | { type: 'select'; props: SelectProps }
  | { type: 'date'; props: DateProps }

interface Props {
  config: FormItemConfig
}

const props = defineProps<Props>()

// 获取组件
const currentComponent = computed(() => componentMap[props.config.type])

// Props 类型安全
const componentProps = computed(() => props.config.props)
</script>

<template>
  <component :is="currentComponent" v-bind="componentProps" />
</template>
```

```typescript
// ✅ 方案3: 使用泛型工厂函数
type FormFieldType = 'input' | 'select' | 'date' | 'cascader' | 'upload'

interface FormFieldBase {
  prop: string
  label: string
  span?: number
  hidden?: boolean
}

interface InputField extends FormFieldBase {
  type: 'input'
  componentProps?: {
    placeholder?: string
    maxlength?: number
    showWordLimit?: boolean
  }
}

interface SelectField extends FormFieldBase {
  type: 'select'
  componentProps: {
    options: Array<{ label: string; value: string | number }>
    multiple?: boolean
    filterable?: boolean
  }
}

interface DateField extends FormFieldBase {
  type: 'date'
  componentProps?: {
    type?: 'date' | 'daterange'
    format?: string
    valueFormat?: string
  }
}

type FormField = InputField | SelectField | DateField

// 类型安全的字段创建函数
function createField<T extends FormFieldType>(
  type: T,
  config: Omit<Extract<FormField, { type: T }>, 'type'>
): Extract<FormField, { type: T }> {
  return { type, ...config } as Extract<FormField, { type: T }>
}

// 使用
const fields: FormField[] = [
  createField('input', {
    prop: 'userName',
    label: '用户名',
    componentProps: { placeholder: '请输入用户名', maxlength: 20 }
  }),
  createField('select', {
    prop: 'status',
    label: '状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  }),
  createField('date', {
    prop: 'createTime',
    label: '创建时间',
    componentProps: { type: 'daterange', format: 'YYYY-MM-DD' }
  })
]
```

```vue
<!-- ✅ 方案4: 使用渲染函数实现类型安全的动态组件 -->
<script setup lang="ts">
import { h, computed, type VNode, type Component } from 'vue'
import AInput from './AInput.vue'
import ASelect from './ASelect.vue'

interface FieldRenderContext<T = any> {
  value: T
  onChange: (value: T) => void
  disabled: boolean
}

interface FieldRenderer<T = any> {
  (context: FieldRenderContext<T>): VNode
}

// 内置渲染器
const fieldRenderers: Record<string, FieldRenderer> = {
  input: ({ value, onChange, disabled }) =>
    h(AInput, {
      modelValue: value,
      'onUpdate:modelValue': onChange,
      disabled
    }),

  select: ({ value, onChange, disabled }) =>
    h(ASelect, {
      modelValue: value,
      'onUpdate:modelValue': onChange,
      disabled
    })
}

// 自定义渲染器类型
type CustomRenderer<T> = (context: FieldRenderContext<T>) => VNode

// 字段配置
interface FieldConfig<T = any> {
  prop: string
  label: string
  type?: string
  render?: CustomRenderer<T>
}

interface Props {
  fields: FieldConfig[]
  modelValue: Record<string, any>
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

// 渲染字段
const renderField = (field: FieldConfig): VNode => {
  const context: FieldRenderContext = {
    value: props.modelValue[field.prop],
    onChange: (value) => {
      emit('update:modelValue', {
        ...props.modelValue,
        [field.prop]: value
      })
    },
    disabled: props.disabled ?? false
  }

  // 优先使用自定义渲染器
  if (field.render) {
    return field.render(context)
  }

  // 使用内置渲染器
  const renderer = field.type ? fieldRenderers[field.type] : undefined
  if (renderer) {
    return renderer(context)
  }

  // 默认渲染
  return h('span', context.value)
}
</script>

<template>
  <div class="dynamic-form">
    <div v-for="field in fields" :key="field.prop" class="form-item">
      <label>{{ field.label }}</label>
      <component :is="() => renderField(field)" />
    </div>
  </div>
</template>
```

## 总结

组件类型定义核心要点:

1. **interface 优先** - 使用 interface 定义 Props，便于扩展
2. **JSDoc 注释** - 为所有属性添加详细注释
3. **withDefaults** - 使用 withDefaults 提供默认值
4. **泛型支持** - 使用 generic 语法支持泛型组件
5. **联合类型** - 使用联合类型替代字符串提升类型安全
6. **响应式类型** - SpanType 支持多种响应式配置方式
7. **Expose 类型** - 为暴露方法定义明确类型
