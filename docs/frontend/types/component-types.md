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

## 总结

组件类型定义核心要点:

1. **interface 优先** - 使用 interface 定义 Props，便于扩展
2. **JSDoc 注释** - 为所有属性添加详细注释
3. **withDefaults** - 使用 withDefaults 提供默认值
4. **泛型支持** - 使用 generic 语法支持泛型组件
5. **联合类型** - 使用联合类型替代字符串提升类型安全
6. **响应式类型** - SpanType 支持多种响应式配置方式
7. **Expose 类型** - 为暴露方法定义明确类型
