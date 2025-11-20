# 组件类型定义

## 介绍

组件类型定义是 Vue 3 TypeScript 项目中确保类型安全的核心部分。在 RuoYi-Plus-UniApp 前端项目中,所有业务组件都使用 TypeScript 编写,并为 Props、Emits、Slots 等提供完整的类型定义。

**核心特性:**

- **类型安全** - 通过 TypeScript 接口定义组件 Props,确保使用时的类型检查
- **智能提示** - IDE 可以提供完整的属性提示和自动补全
- **文档化注释** - 使用 JSDoc 注释为每个属性添加详细说明
- **泛型支持** - 支持泛型组件,实现更灵活的类型推导
- **默认值定义** - 使用 `withDefaults` 为 Props 提供默认值
- **事件类型** - 为组件事件定义精确的参数类型
- **响应式类型** - 支持响应式 Props 配置,如 `span` 属性的多种类型
- **组合式设计** - Props 接口设计遵循单一职责原则,易于扩展

本文档涵盖项目中常用的组件类型定义模式,包括基础组件、表单组件、业务组件、模态框组件等的完整类型定义示例。

## 基础组件类型

### Icon 图标组件

Icon 组件是最基础的 UI 组件之一,用于显示图标。

#### IconProps 接口定义

```typescript
/**
 * Icon 图标组件 Props
 */
interface IconProps {
  /**
   * 图标值(字符串形式)
   * @example 'user'
   */
  value?: string

  /**
   * 图标代码(IconCode 类型)
   * @example { type: 'font', name: 'user' }
   */
  code?: IconCode

  /**
   * 图标尺寸
   * - 预设尺寸: xs, sm, md, lg, xl, 2xl
   * - 自定义尺寸: 可以是数字或字符串
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string | number

  /**
   * 图标颜色
   * @example '#409EFF' 或 'primary'
   */
  color?: string

  /**
   * 图标动画效果
   * @example 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'
   */
  animate?: AnimateType
}

/**
 * 动画类型定义
 */
type AnimateType = 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'

/**
 * 图标代码类型
 */
interface IconCode {
  /** 图标类型: font-字体图标, uno-UnoCSS图标 */
  type: 'font' | 'uno'
  /** 图标名称 */
  name: string
}
```

#### 使用示例

```vue
<template>
  <div class="icon-demo">
    <!-- 基础用法 -->
    <Icon value="user" />

    <!-- 指定尺寸和颜色 -->
    <Icon value="setting" size="lg" color="#409EFF" />

    <!-- 使用动画 -->
    <Icon value="reload" animate="rotate180" />

    <!-- 使用 IconCode -->
    <Icon :code="{ type: 'font', name: 'user' }" />

    <!-- 自定义尺寸 -->
    <Icon value="star" :size="32" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components'
</script>
```

### IconSelect 图标选择器

图标选择器组件用于在弹窗中选择图标。

#### IconSelectProps 接口定义

```typescript
/**
 * IconSelect 图标选择器 Props
 */
interface IconSelectProps {
  /**
   * 绑定值(v-model)
   * 选中的图标代码
   */
  modelValue: string

  /**
   * 选择器宽度
   * @default '100%'
   */
  width?: string

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 占位符文本
   * @default '请选择图标'
   */
  placeholder?: string

  /**
   * 是否可清空
   * @default true
   */
  clearable?: boolean
}
```

#### IconSelectEmits 接口定义

```typescript
/**
 * IconSelect 图标选择器事件
 */
interface IconSelectEmits {
  /** 更新 modelValue,实现 v-model 双向绑定 */
  (e: 'update:modelValue', value: string): void

  /** 选中图标时触发 */
  (e: 'select', value: string): void

  /** 清空选择时触发 */
  (e: 'clear'): void
}
```

#### 使用示例

```vue
<template>
  <el-form :model="form">
    <el-form-item label="菜单图标">
      <IconSelect
        v-model="form.icon"
        width="200px"
        @select="handleIconSelect"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconSelect } from '@/components'

interface MenuForm {
  name: string
  icon: string
}

const form = ref<MenuForm>({
  name: '',
  icon: ''
})

const handleIconSelect = (value: string) => {
  console.log('选中图标:', value)
}
</script>
```

## 表单组件类型

### AFormInput 输入框组件

AFormInput 是项目中最常用的表单组件之一,支持文本输入、数字输入、文本域等多种类型。

#### AFormInputProps 完整接口

```typescript
/**
 * 输入组件的Props接口定义
 * @description 定义了输入组件的所有属性和类型
 */
interface AFormInputProps {
  /**
   * 绑定值,支持字符串或数字
   * @default undefined
   */
  modelValue?: string | number | null | undefined

  /**
   * 标签文本
   * @default ''
   */
  label?: string

  /**
   * 标签宽度,支持数字或字符串
   * @default undefined
   */
  labelWidth?: number | string

  /**
   * 占位符文本
   * @default ''
   */
  placeholder?: string

  /**
   * 组件宽度,支持数字或字符串
   * @default undefined
   */
  width?: number | string

  /**
   * 表单域model数据字段名
   * @default ''
   */
  prop?: string

  /**
   * 最大长度
   * @default 255
   */
  maxlength?: number | string

  /**
   * 是否显示字数统计
   * @default false
   */
  showWordLimit?: boolean

  /**
   * 是否显示表单项
   * @default true
   */
  showFormItem?: boolean

  /**
   * 是否显示密码可见性切换按钮
   * @default false
   */
  showPassword?: boolean

  /**
   * 输入框类型
   * @default 'text'
   */
  type?: 'text' | 'textarea' | 'number' | 'password'

  /**
   * 文本域自适应配置
   * @default { minRows: 2, maxRows: 30 }
   */
  autosize?: { minRows?: number; maxRows?: number }

  /**
   * 组件尺寸
   * @default ''
   */
  size?: '' | 'default' | 'small' | 'large'

  /**
   * 栅格占据的列数,支持数字、响应式对象或预设字符串
   * - 数字: 固定span值,如 12
   * - 响应式对象: { xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }
   * - 预设字符串: 'auto' - 自动响应式布局
   * @default undefined
   */
  span?: SpanType

  /**
   * 是否显示清除按钮
   * @default true
   */
  clearable?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 文本域行数
   * @default 3
   */
  rows?: number

  /**
   * 提示信息
   * @default ''
   */
  tooltip?: string

  // 数字输入框特有属性
  /**
   * 数字输入框最小值
   * @default undefined
   */
  min?: number

  /**
   * 数字输入框最大值
   * @default undefined
   */
  max?: number

  /**
   * 数字输入框步长
   * @default 1
   */
  step?: number

  /**
   * 是否只能输入 step 的倍数
   * @default false
   */
  stepStrictly?: boolean

  /**
   * 数值精度
   * @default undefined
   */
  precision?: number

  /**
   * 是否使用控制按钮
   * @default true
   */
  controls?: boolean

  /**
   * 控制按钮位置
   * @default ''
   */
  controlsPosition?: '' | 'right'

  /**
   * 数字输入框尺寸
   * @default ''
   */
  inputNumberSize?: '' | 'default' | 'small' | 'large'

  /**
   * 响应式模式
   * - 'screen': 基于屏幕尺寸
   * - 'container': 基于容器尺寸(弹窗场景推荐)
   * - 'modal-size': 基于 AModal 的 size 属性
   * @default 'screen'
   */
  responsiveMode?: 'screen' | 'container' | 'modal-size'

  /**
   * 当 responsiveMode 为 'modal-size' 时使用
   * 应该传入 AModal 的 size 属性值
   */
  modalSize?: 'small' | 'medium' | 'large' | 'xl'

  /**
   * 是否防止浏览器自动填充
   * 主要用于密码输入框,防止浏览器自动填充密码
   * @default false
   */
  preventAutofill?: boolean
}

/**
 * SpanType 响应式栅格类型
 */
type SpanType =
  | number
  | 'auto'
  | {
      xs?: number
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
```

#### AFormInputEmits 事件接口

```typescript
/**
 * AFormInput 组件事件定义
 */
interface AFormInputEmits {
  /** 更新 modelValue */
  (e: 'update:modelValue', value: string | number | null | undefined): void

  /** 输入时触发 */
  (e: 'input', value: string | number | null | undefined): void

  /** 失去焦点时触发 */
  (e: 'blur', value: any): void

  /** 值改变时触发 */
  (e: 'change', value: any): void

  /** 按下回车键时触发 */
  (e: 'enter', value: any): void
}
```

#### 使用示例

```vue
<template>
  <el-form :model="form" ref="formRef">
    <!-- 基础文本输入 -->
    <AFormInput
      label="用户名"
      v-model="form.userName"
      prop="userName"
      :span="12"
    />

    <!-- 密码输入,防止自动填充 -->
    <AFormInput
      label="密码"
      v-model="form.password"
      prop="password"
      type="password"
      show-password
      prevent-autofill
      :span="12"
    />

    <!-- 文本域,显示字数统计 -->
    <AFormInput
      label="备注"
      v-model="form.remark"
      prop="remark"
      type="textarea"
      :maxlength="200"
      show-word-limit
      :span="24"
    />

    <!-- 数字输入 -->
    <AFormInput
      label="年龄"
      v-model="form.age"
      prop="age"
      type="number"
      :min="0"
      :max="150"
      :span="12"
    />

    <!-- 响应式布局 -->
    <AFormInput
      label="邮箱"
      v-model="form.email"
      prop="email"
      :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
    />

    <!-- 带提示信息 -->
    <AFormInput
      label="手机号"
      v-model="form.phone"
      prop="phone"
      tooltip="请输入11位手机号码"
      :span="12"
    />

    <!-- 使用插槽 -->
    <AFormInput
      label="网址"
      v-model="form.website"
      prop="website"
      :span="12"
    >
      <template #prepend>
        https://
      </template>
    </AFormInput>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

interface UserForm {
  userName: string
  password: string
  remark: string
  age: number
  email: string
  phone: string
  website: string
}

const formRef = ref<FormInstance>()
const form = ref<UserForm>({
  userName: '',
  password: '',
  remark: '',
  age: 0,
  email: '',
  phone: '',
  website: ''
})
</script>
```

### AFormSelect 下拉选择组件

#### AFormSelectProps 接口定义

```typescript
/**
 * 下拉选择组件 Props
 */
interface AFormSelectProps {
  /**
   * 绑定值
   */
  modelValue?: string | number | boolean | object | any[]

  /**
   * 标签文本
   */
  label?: string

  /**
   * 标签宽度
   */
  labelWidth?: number | string

  /**
   * 占位符
   * @default '请选择'
   */
  placeholder?: string

  /**
   * 表单字段名
   */
  prop?: string

  /**
   * 选项数据
   */
  options?: SelectOption[]

  /**
   * 是否多选
   * @default false
   */
  multiple?: boolean

  /**
   * 是否可清空
   * @default true
   */
  clearable?: boolean

  /**
   * 是否可搜索
   * @default false
   */
  filterable?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 栅格占据的列数
   */
  span?: SpanType

  /**
   * 是否显示表单项
   * @default true
   */
  showFormItem?: boolean

  /**
   * 组件尺寸
   */
  size?: '' | 'default' | 'small' | 'large'

  /**
   * 提示信息
   */
  tooltip?: string

  /**
   * 是否允许用户创建新条目
   * @default false
   */
  allowCreate?: boolean

  /**
   * 是否折叠多选标签
   * @default false
   */
  collapseTags?: boolean

  /**
   * 多选时最多显示的标签数量
   */
  maxCollapseTags?: number
}

/**
 * 选项数据类型
 */
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

#### 使用示例

```vue
<template>
  <el-form :model="form">
    <!-- 基础下拉选择 -->
    <AFormSelect
      label="状态"
      v-model="form.status"
      prop="status"
      :options="statusOptions"
      :span="12"
    />

    <!-- 多选 -->
    <AFormSelect
      label="角色"
      v-model="form.roles"
      prop="roles"
      :options="roleOptions"
      multiple
      collapse-tags
      :span="12"
    />

    <!-- 可搜索 -->
    <AFormSelect
      label="部门"
      v-model="form.deptId"
      prop="deptId"
      :options="deptOptions"
      filterable
      :span="12"
    />
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  status: '',
  roles: [],
  deptId: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const roleOptions = [
  { label: '管理员', value: 1 },
  { label: '普通用户', value: 2 },
  { label: '访客', value: 3 }
]

const deptOptions = [
  { label: '研发部', value: 1 },
  { label: '市场部', value: 2 },
  { label: '运营部', value: 3 }
]
</script>
```

### AFormFileUpload 文件上传组件

#### AFormFileUploadProps 接口定义

```typescript
/**
 * 文件上传组件 Props
 */
interface AFormFileUploadProps {
  /**
   * 绑定值,文件列表
   */
  modelValue?: string | UploadFile[]

  /**
   * 标签文本
   */
  label?: string

  /**
   * 表单字段名
   */
  prop?: string

  /**
   * 最大上传数量
   * @default 5
   */
  limit?: number

  /**
   * 文件大小限制(MB)
   * @default 10
   */
  fileSize?: number

  /**
   * 允许的文件类型
   * @example ['jpg', 'png', 'pdf']
   */
  fileType?: string[]

  /**
   * 是否显示文件列表
   * @default true
   */
  showFileList?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 栅格占据的列数
   */
  span?: SpanType

  /**
   * 上传按钮文字
   * @default '选择文件'
   */
  buttonText?: string

  /**
   * 提示文字
   */
  tip?: string

  /**
   * 是否自动上传
   * @default true
   */
  autoUpload?: boolean
}

/**
 * 上传文件类型
 */
interface UploadFile {
  /** 文件名 */
  name: string
  /** 文件URL */
  url: string
  /** 文件大小 */
  size?: number
  /** 文件类型 */
  type?: string
  /** 上传状态 */
  status?: 'uploading' | 'success' | 'error'
  /** 上传进度 */
  percentage?: number
  /** 唯一标识 */
  uid?: number
  /** 原始文件对象 */
  raw?: File
}
```

#### AFormFileUploadEmits 事件接口

```typescript
/**
 * 文件上传组件事件
 */
interface AFormFileUploadEmits {
  /** 更新 modelValue */
  (e: 'update:modelValue', value: string | UploadFile[]): void

  /** 文件上传成功 */
  (e: 'success', file: UploadFile, fileList: UploadFile[]): void

  /** 文件上传失败 */
  (e: 'error', error: Error, file: UploadFile): void

  /** 文件移除 */
  (e: 'remove', file: UploadFile, fileList: UploadFile[]): void

  /** 文件超出限制 */
  (e: 'exceed', files: File[], fileList: UploadFile[]): void
}
```

## 业务组件类型

### AModal 模态框组件

AModal 是项目中统一的模态框组件,支持对话框和抽屉两种模式。

#### AModalProps 完整接口

```typescript
/**
 * AModal 组件属性接口定义
 */
interface AModalProps {
  /**
   * 控制模态框显示/隐藏状态
   */
  modelValue: boolean

  /**
   * 模态框模式: dialog-对话框, drawer-抽屉
   * @default 'dialog'
   */
  mode?: 'dialog' | 'drawer'

  /**
   * 模态框标题
   */
  title?: string

  /**
   * 自定义宽度/尺寸,可以是具体数值或百分比
   */
  width?: string | number

  /**
   * 预设尺寸: small-小, medium-中等, large-大, xl-超大
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'xl'

  // ========== 行为控制相关 ==========
  /**
   * 是否显示关闭按钮
   * @default true
   */
  closable?: boolean

  /**
   * 是否可以通过点击遮罩层关闭
   * @default false
   */
  maskClosable?: boolean

  /**
   * 是否可以通过 ESC 键关闭
   * @default true
   */
  keyboard?: boolean

  /**
   * 关闭时是否销毁内部元素
   * @default true
   */
  destroyOnClose?: boolean

  /**
   * 是否将模态框挂载到 body 元素下
   * @default true
   */
  appendToBody?: boolean

  /**
   * 关闭前的回调函数,可以用来阻止关闭
   */
  beforeClose?: (done: () => void) => void

  /**
   * 是否可以拖动(仅对话框模式有效,全屏模式下无效)
   * @default false
   */
  movable?: boolean

  // ========== 抽屉模式特有属性 ==========
  /**
   * 抽屉弹出方向: ltr-左到右, rtl-右到左, ttb-上到下, btt-下到上
   * @default 'rtl'
   */
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt'

  // ========== 内容控制相关 ==========
  /**
   * 是否显示底部操作区域
   * @default true
   */
  showFooter?: boolean

  /**
   * 底部按钮类型: default-确定+取消, close-only-仅关闭按钮
   * @default 'default'
   */
  footerType?: 'default' | 'close-only'

  /**
   * 底部按钮对齐方式
   * @default 'right'
   */
  footerAlign?: 'left' | 'center' | 'right'

  /**
   * 内容区域是否显示加载状态
   * @default false
   */
  loading?: boolean

  /**
   * 是否全屏显示(仅对话框模式有效)
   * @default false
   */
  fullscreen?: boolean

  // ========== 按钮文本自定义 ==========
  /**
   * 确认按钮文本
   * @default '确定'
   */
  confirmText?: string

  /**
   * 取消按钮文本
   * @default '取消'
   */
  cancelText?: string
}
```

#### AModalEmits 事件接口

```typescript
/**
 * AModal 组件事件定义
 */
interface AModalEmits {
  /** 更新 modelValue,实现 v-model 双向绑定 */
  (e: 'update:modelValue', value: boolean): void

  /** 用户点击确认按钮时触发 */
  (e: 'confirm'): void

  /** 用户点击取消按钮时触发 */
  (e: 'cancel'): void

  /** 模态框开始打开时触发 */
  (e: 'open'): void

  /** 模态框完全打开后触发 */
  (e: 'opened'): void

  /** 模态框开始关闭时触发 */
  (e: 'close'): void

  /** 模态框完全关闭后触发 */
  (e: 'closed'): void
}
```

#### 使用示例

```vue
<template>
  <div>
    <!-- 按钮触发 -->
    <el-button @click="dialogVisible = true">打开对话框</el-button>
    <el-button @click="drawerVisible = true">打开抽屉</el-button>

    <!-- 基础对话框 -->
    <AModal
      v-model="dialogVisible"
      title="新增用户"
      @confirm="handleSubmit"
      @cancel="handleCancel"
    >
      <el-form :model="form" ref="formRef">
        <AFormInput label="用户名" v-model="form.userName" prop="userName" />
        <AFormInput label="邮箱" v-model="form.email" prop="email" />
      </el-form>
    </AModal>

    <!-- 抽屉模式 -->
    <AModal
      v-model="drawerVisible"
      title="用户详情"
      mode="drawer"
      direction="rtl"
      size="large"
      :show-footer="false"
    >
      <UserDetail :user="selectedUser" />
    </AModal>

    <!-- 可拖动对话框 -->
    <AModal
      v-model="movableVisible"
      title="可拖动对话框"
      :movable="true"
      size="small"
    >
      <p>可以拖动标题栏移动此对话框</p>
    </AModal>

    <!-- 全屏对话框 -->
    <AModal
      v-model="fullscreenVisible"
      title="大数据分析"
      :fullscreen="true"
    >
      <DataAnalysis />
    </AModal>

    <!-- 自定义底部 -->
    <AModal v-model="customVisible" title="自定义操作">
      <template #footer>
        <el-button @click="customVisible = false">取消</el-button>
        <el-button type="warning" @click="handleSave">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </template>
      <ContentEditor v-model="content" />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const dialogVisible = ref(false)
const drawerVisible = ref(false)
const movableVisible = ref(false)
const fullscreenVisible = ref(false)
const customVisible = ref(false)

const formRef = ref<FormInstance>()
const form = ref({
  userName: '',
  email: ''
})

const selectedUser = ref(null)
const content = ref('')

const handleSubmit = async () => {
  await formRef.value?.validate()
  // 提交逻辑
  dialogVisible.value = false
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleSave = () => {
  // 保存草稿逻辑
}

const handlePublish = () => {
  // 发布逻辑
  customVisible.value = false
}
</script>
```

### AOssMediaManager OSS 媒体管理器

#### AOssMediaManagerProps 接口定义

```typescript
/**
 * OSS 媒体管理器组件 Props
 */
interface AOssMediaManagerProps {
  /**
   * 绑定值,选中的文件URL或URL数组
   */
  modelValue?: string | string[]

  /**
   * 是否多选模式
   * @default false
   */
  multiple?: boolean

  /**
   * 最大选择数量(多选模式下有效)
   * @default 9
   */
  limit?: number

  /**
   * 文件类型过滤
   * @example ['image', 'video', 'audio', 'document']
   */
  accept?: string[]

  /**
   * 是否显示上传按钮
   * @default true
   */
  showUpload?: boolean

  /**
   * 是否显示删除按钮
   * @default true
   */
  showDelete?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
}
```

## 泛型组件类型

### 通用表格组件

泛型组件允许在使用时指定具体的数据类型,实现更强的类型推导。

#### TableProps 泛型接口

```typescript
/**
 * 通用表格组件 Props
 * @template T 表格数据类型
 */
interface TableProps<T = any> {
  /**
   * 表格数据(分页结果)
   */
  data: PageResult<T>

  /**
   * 字段配置
   */
  fields: FieldConfig[]

  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean

  /**
   * 是否显示选择框
   * @default false
   */
  selection?: boolean

  /**
   * 是否显示序号列
   * @default false
   */
  showIndex?: boolean

  /**
   * 表格高度
   */
  height?: string | number

  /**
   * 是否显示边框
   * @default false
   */
  border?: boolean

  /**
   * 是否显示斑马纹
   * @default true
   */
  stripe?: boolean

  /**
   * 表格尺寸
   * @default 'default'
   */
  size?: 'large' | 'default' | 'small'
}

/**
 * 分页结果类型
 */
interface PageResult<T> {
  /** 数据列表 */
  rows: T[]
  /** 总记录数 */
  total: number
}

/**
 * 字段配置类型
 */
interface FieldConfig {
  /** 字段名 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: string | number
  /** 最小宽度 */
  minWidth?: string | number
  /** 是否固定列 */
  fixed?: 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 自定义渲染函数 */
  formatter?: (row: any, column: any, cellValue: any) => string
}
```

#### TableEmits 泛型接口

```typescript
/**
 * 通用表格组件事件
 * @template T 表格数据类型
 */
interface TableEmits<T> {
  /** 选择行时触发 */
  (e: 'select', rows: T[]): void

  /** 点击行时触发 */
  (e: 'row-click', row: T): void

  /** 查询条件改变 */
  (e: 'update:query', query: PageQuery): void

  /** 排序改变 */
  (e: 'sort-change', column: any, prop: string, order: string): void
}
```

#### 泛型组件使用示例

```vue
<template>
  <BasicTable
    :data="tableData"
    :fields="tableFields"
    :loading="loading"
    selection
    show-index
    @select="handleSelect"
    @row-click="handleRowClick"
  />
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref } from 'vue'
import type { PageResult, FieldConfig } from '@/types'

/**
 * 用户数据类型
 */
interface User {
  userId: number
  userName: string
  email: string
  status: string
  createTime: string
}

// 指定泛型类型
const tableData = ref<PageResult<User>>({
  rows: [],
  total: 0
})

const tableFields: FieldConfig[] = [
  { prop: 'userId', label: '用户ID', width: 100 },
  { prop: 'userName', label: '用户名', minWidth: 120 },
  { prop: 'email', label: '邮箱', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const loading = ref(false)

// 事件处理函数会自动推导类型
const handleSelect = (rows: User[]) => {
  console.log('选中的用户:', rows)
}

const handleRowClick = (row: User) => {
  console.log('点击的用户:', row.userName)
}
</script>
```

### 通用表单组件

#### FormProps 泛型接口

```typescript
/**
 * 通用表单组件 Props
 * @template T 表单数据类型
 */
interface FormProps<T = any> {
  /**
   * 表单数据
   */
  modelValue: T

  /**
   * 表单模式
   */
  mode: 'add' | 'edit' | 'view'

  /**
   * 表单配置
   */
  config: FormConfig[]

  /**
   * 表单验证规则
   */
  rules?: FormRules

  /**
   * 表单标签宽度
   * @default '100px'
   */
  labelWidth?: string | number

  /**
   * 表单尺寸
   * @default 'default'
   */
  size?: 'large' | 'default' | 'small'

  /**
   * 是否禁用所有表单项
   * @default false
   */
  disabled?: boolean

  /**
   * 是否显示必填星号
   * @default true
   */
  showRequiredAsterisk?: boolean
}

/**
 * 表单配置类型
 */
interface FormConfig {
  /** 字段名 */
  prop: string
  /** 标签文本 */
  label: string
  /** 组件类型 */
  component: 'input' | 'select' | 'date' | 'upload' | 'cascader'
  /** 栅格跨度 */
  span?: number
  /** 组件属性 */
  componentProps?: Record<string, any>
  /** 是否隐藏 */
  hidden?: boolean
}

/**
 * 表单验证规则类型
 */
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

#### FormEmits 泛型接口

```typescript
/**
 * 通用表单组件事件
 * @template T 表单数据类型
 */
interface FormEmits<T> {
  /** 更新 modelValue */
  (e: 'update:modelValue', value: T): void

  /** 提交表单 */
  (e: 'submit', data: T): void

  /** 取消操作 */
  (e: 'cancel'): void

  /** 重置表单 */
  (e: 'reset'): void
}
```

## 响应式类型定义

### SpanType 响应式栅格类型

项目中广泛使用响应式栅格布局,通过 `SpanType` 类型定义支持多种配置方式。

```typescript
/**
 * 响应式栅格跨度类型
 * 支持三种形式:
 * 1. 数字: 固定跨度,如 12
 * 2. 字符串: 预设配置,如 'auto'
 * 3. 响应式对象: 不同屏幕尺寸使用不同跨度
 */
type SpanType =
  | number
  | 'auto'
  | {
      /** 超小屏 <768px */
      xs?: number
      /** 小屏 ≥768px */
      sm?: number
      /** 中屏 ≥992px */
      md?: number
      /** 大屏 ≥1200px */
      lg?: number
      /** 超大屏 ≥1920px */
      xl?: number
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

  <!-- 部分屏幕自定义,其他使用默认值24 -->
  <AFormInput
    label="地址"
    v-model="form.address"
    :span="{ md: 12, lg: 8 }"
  />
</template>
```

### ResponsiveMode 响应式模式

```typescript
/**
 * 响应式模式类型
 * 用于控制组件根据什么维度进行响应式布局
 */
type ResponsiveMode =
  | 'screen'      // 基于屏幕尺寸(默认)
  | 'container'   // 基于容器尺寸(弹窗场景推荐)
  | 'modal-size'  // 基于 AModal 的 size 属性

/**
 * 模态框尺寸类型
 */
type ModalSize = 'small' | 'medium' | 'large' | 'xl'
```

#### 响应式配置示例

```vue
<template>
  <AModal v-model="visible" size="large">
    <el-form :model="form">
      <!-- 基于屏幕尺寸响应 -->
      <AFormInput
        label="用户名"
        v-model="form.userName"
        responsive-mode="screen"
        :span="{ md: 12 }"
      />

      <!-- 基于容器尺寸响应 -->
      <AFormInput
        label="邮箱"
        v-model="form.email"
        responsive-mode="container"
        :span="{ md: 12 }"
      />

      <!-- 基于弹窗尺寸响应 -->
      <AFormInput
        label="手机号"
        v-model="form.phone"
        responsive-mode="modal-size"
        modal-size="large"
        :span="12"
      />
    </el-form>
  </AModal>
</template>
```

## Slots 插槽类型定义

### 组件插槽类型

虽然 Vue 3 没有为插槽提供专门的类型定义语法,但可以通过 JSDoc 注释说明插槽的用途。

```typescript
/**
 * 表单组件插槽
 */
interface FormSlots {
  /**
   * 默认插槽,表单内容
   * @slot default
   */
  default?: () => VNode[]

  /**
   * 表单底部操作按钮
   * @slot footer
   * @param {Object} scope - 插槽作用域
   * @param {Function} scope.submit - 提交表单方法
   * @param {Function} scope.reset - 重置表单方法
   */
  footer?: (scope: { submit: () => void; reset: () => void }) => VNode[]

  /**
   * 表单前置内容
   * @slot prepend
   */
  prepend?: () => VNode[]

  /**
   * 表单后置内容
   * @slot append
   */
  append?: () => VNode[]
}
```

### 作用域插槽使用示例

```vue
<template>
  <BasicForm v-model="form" :config="formConfig">
    <!-- 默认插槽 -->
    <template #default>
      <AFormInput label="自定义字段" v-model="form.custom" />
    </template>

    <!-- 作用域插槽 - 自定义底部 -->
    <template #footer="{ submit, reset }">
      <el-button @click="reset">重置</el-button>
      <el-button type="warning" @click="handleSave">保存草稿</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </template>

    <!-- 前置内容插槽 -->
    <template #prepend>
      <el-alert title="请填写完整信息" type="info" :closable="false" />
    </template>
  </BasicForm>
</template>
```

## Expose 暴露方法类型

### 组件暴露方法的类型定义

使用 `defineExpose` 暴露组件方法时,可以定义明确的类型。

```typescript
/**
 * 表单组件暴露的方法
 */
interface FormExpose {
  /**
   * 验证表单
   * @returns Promise<boolean> 验证是否通过
   */
  validate: () => Promise<boolean>

  /**
   * 验证指定字段
   * @param props 字段名数组
   */
  validateField: (props: string[]) => Promise<boolean>

  /**
   * 重置表单
   */
  resetFields: () => void

  /**
   * 清空验证结果
   */
  clearValidate: () => void

  /**
   * 滚动到指定字段
   * @param prop 字段名
   */
  scrollToField: (prop: string) => void
}
```

### 使用组件实例类型

```vue
<template>
  <BasicForm ref="formRef" v-model="form" :config="formConfig" />
  <el-button @click="handleSubmit">提交</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormExpose } from '@/components'

// 使用 InstanceType 获取组件实例类型
const formRef = ref<FormExpose>()

const handleSubmit = async () => {
  // TypeScript 会提供完整的类型提示和检查
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('验证通过')
  }
}
</script>
```

## 最佳实践

### 1. 使用 interface 而非 type

对于组件 Props,优先使用 `interface` 而非 `type`,因为 `interface` 可以被扩展和合并。

```typescript
// ✅ 推荐
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

### 4. 事件定义使用箭头函数语法

```typescript
// ✅ 推荐 - 更简洁清晰
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [data: FormData]
  cancel: []
}>()

// ❌ 不推荐 - 函数重载语法较繁琐
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: FormData): void
  (e: 'cancel'): void
}
const emit = defineEmits<Emits>()
```

### 5. 泛型组件使用 `script generic`

对于需要泛型的组件,使用 Vue 3.3+ 的 `generic` 特性:

```vue
<script setup lang="ts" generic="T extends Record<string, any>">
interface TableProps {
  data: T[]
  fields: FieldConfig[]
}

const props = defineProps<TableProps>()

// T 的类型会从使用处自动推导
const emit = defineEmits<{
  select: [rows: T[]]
  'row-click': [row: T]
}>()
</script>
```

### 6. 复杂类型抽取为独立类型

```typescript
// types/form.ts
export interface FormConfig {
  prop: string
  label: string
  component: ComponentType
  span?: number
}

export type ComponentType = 'input' | 'select' | 'date' | 'upload'

// 组件中导入使用
import type { FormConfig, ComponentType } from '@/types/form'
```

### 7. 使用联合类型而非字符串

```typescript
// ✅ 推荐 - 类型安全,有自动补全
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

### 8. 响应式 Props 使用 toRef

在 setup 中使用 Props 的响应式值时,使用 `toRef`:

```typescript
const props = defineProps<ButtonProps>()

// ✅ 推荐 - 保持响应性
const size = toRef(props, 'size')

// ❌ 不推荐 - 丢失响应性
const size = props.size
```

### 9. 可选链和空值合并优化代码

```typescript
// ✅ 推荐
const handleSubmit = () => {
  formRef.value?.validate()
  const width = props.width ?? '100%'
}

// ❌ 不推荐
const handleSubmit = () => {
  if (formRef.value) {
    formRef.value.validate()
  }
  const width = props.width ? props.width : '100%'
}
```

### 10. 使用严格的 null 检查

确保 `tsconfig.json` 中启用严格模式:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

## 常见问题

### 1. Props 默认值设置后仍然是 undefined

**问题原因:**
- 使用 `defineProps` 时没有使用 `withDefaults`
- 默认值是对象或数组,需要使用工厂函数

**解决方案:**

```typescript
// ❌ 错误 - 没有默认值
const props = defineProps<{
  options?: SelectOption[]
  config?: FormConfig
}>()

// ✅ 正确 - 使用 withDefaults
const props = withDefaults(defineProps<{
  options?: SelectOption[]
  config?: FormConfig
}>(), {
  options: () => [],      // 数组使用工厂函数
  config: () => ({})      // 对象使用工厂函数
})
```

### 2. 泛型组件类型推导失败

**问题原因:**
- 没有使用 Vue 3.3+ 的 `generic` 语法
- 泛型约束不正确

**解决方案:**

```vue
<!-- ❌ 错误 - 没有使用 generic -->
<script setup lang="ts">
interface TableProps<T> {
  data: T[]
}
// 类型 T 无法推导
</script>

<!-- ✅ 正确 - 使用 generic -->
<script setup lang="ts" generic="T extends Record<string, any>">
interface TableProps {
  data: T[]
}

const props = defineProps<TableProps>()
// T 会从使用处自动推导
</script>
```

### 3. Emits 事件参数类型不匹配

**问题原因:**
- 事件定义和触发时的参数不一致
- 使用了错误的事件名

**解决方案:**

```typescript
// 定义
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [data: FormData]
}>()

// ✅ 正确使用
emit('update:modelValue', 'hello')
emit('submit', formData)

// ❌ 错误 - 参数类型不匹配
emit('update:modelValue', 123)  // 类型错误: number 不能赋值给 string

// ❌ 错误 - 事件名拼写错误
emit('updateModelValue', 'hello')  // 类型错误: 事件不存在
```

### 4. 响应式 Props 在 computed 中丢失响应性

**问题原因:**
- 直接解构 Props
- 在 computed 外部访问 Props

**解决方案:**

```typescript
const props = defineProps<FormProps>()

// ❌ 错误 - 直接解构会丢失响应性
const { label, disabled } = props

// ✅ 正确 - 在 computed 中访问
const isDisabled = computed(() => props.disabled || props.mode === 'view')

// ✅ 正确 - 使用 toRef
const label = toRef(props, 'label')
const disabled = toRef(props, 'disabled')
```

### 5. 组件 ref 类型不正确

**问题原因:**
- 使用了错误的实例类型
- 组件没有正确 expose 方法

**解决方案:**

```vue
<template>
  <BasicForm ref="formRef" />
</template>

<script setup lang="ts">
// ❌ 错误 - 使用 any
const formRef = ref<any>()

// ❌ 错误 - 使用组件类型
const formRef = ref<typeof BasicForm>()

// ✅ 正确 - 使用 InstanceType 或 expose 的接口类型
import type { FormExpose } from '@/components'
const formRef = ref<FormExpose>()

// 或者使用 InstanceType
const formRef = ref<InstanceType<typeof BasicForm>>()
</script>
```

### 6. 联合类型 Props 类型收窄问题

**问题原因:**
- 没有正确使用类型守卫
- TypeScript 无法自动收窄联合类型

**解决方案:**

```typescript
interface InputProps {
  modelValue: string | number | null
  type: 'text' | 'number'
}

const props = defineProps<InputProps>()

// ❌ 错误 - TypeScript 无法确定具体类型
const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    // val 的类型是 string | number | null
  }
})

// ✅ 正确 - 使用类型守卫
const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (props.type === 'number' && typeof val === 'number') {
      emit('update:modelValue', val)
    } else if (typeof val === 'string') {
      emit('update:modelValue', val)
    }
  }
})
```

### 7. 插槽作用域类型定义

**问题原因:**
- 插槽没有类型提示
- 作用域参数类型不明确

**解决方案:**

```vue
<!-- 定义组件 -->
<template>
  <div>
    <slot name="item" :row="row" :index="index" />
  </div>
</template>

<script setup lang="ts" generic="T">
interface Props {
  data: T[]
}

// 虽然无法直接为插槽定义类型,但可以通过 JSDoc 说明
/**
 * @slot item - 项目插槽
 * @slot item.row - 当前行数据 T
 * @slot item.index - 当前行索引 number
 */
</script>

<!-- 使用组件 -->
<template>
  <DataList :data="users">
    <!-- TypeScript 会推导出 row 的类型为 User -->
    <template #item="{ row, index }">
      {{ row.userName }} - {{ index }}
    </template>
  </DataList>
</template>
```

### 8. Props 验证器中的类型问题

**问题原因:**
- validator 函数的参数类型不明确
- 返回值不是 boolean

**解决方案:**

```typescript
// ❌ 错误 - 参数类型不明确
const props = defineProps({
  status: {
    type: String,
    validator: (value) => {
      return ['active', 'inactive'].includes(value)
    }
  }
})

// ✅ 正确 - 使用 TypeScript 接口定义
interface Props {
  status?: 'active' | 'inactive' | 'pending'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending'
})

// 不需要 validator,类型系统已经保证了类型安全
```

### 9. 动态组件类型问题

**问题原因:**
- 动态组件的 Props 类型无法推导
- `component :is` 使用时丢失类型

**解决方案:**

```vue
<template>
  <component
    :is="currentComponent"
    v-bind="componentProps"
  />
</template>

<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import FormInput from './FormInput.vue'
import FormSelect from './FormSelect.vue'

type ComponentType = typeof FormInput | typeof FormSelect

const currentComponent = shallowRef<ComponentType>(FormInput)

// ✅ 使用类型断言或条件类型
const componentProps = computed(() => {
  if (currentComponent.value === FormInput) {
    return {
      modelValue: '',
      type: 'text'
    } as InstanceType<typeof FormInput>['$props']
  } else {
    return {
      modelValue: '',
      options: []
    } as InstanceType<typeof FormSelect>['$props']
  }
})
</script>
```

### 10. 递归组件类型定义

**问题原因:**
- 递归组件的 Props 类型引用自身
- TypeScript 无法处理循环引用

**解决方案:**

```typescript
/**
 * 树形节点数据类型
 */
interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]  // 递归引用
}

/**
 * 树形组件 Props
 */
interface TreeProps {
  /**
   * 树形数据
   */
  data: TreeNode[]

  /**
   * 节点唯一标识字段名
   * @default 'id'
   */
  nodeKey?: string

  /**
   * 默认展开的节点
   */
  defaultExpandedKeys?: (string | number)[]
}

// 使用时 TypeScript 能正确处理递归类型
const treeData: TreeNode[] = [
  {
    id: 1,
    label: '一级节点',
    children: [
      {
        id: 11,
        label: '二级节点',
        children: []
      }
    ]
  }
]
```

## 总结

本文档详细介绍了 RuoYi-Plus-UniApp 前端项目中的组件类型定义规范和最佳实践,涵盖:

1. **基础组件类型** - Icon、IconSelect 等基础UI组件的类型定义
2. **表单组件类型** - AFormInput、AFormSelect、AFormFileUpload 等完整的表单组件类型
3. **业务组件类型** - AModal、AOssMediaManager 等业务组件的详细类型定义
4. **泛型组件类型** - 支持泛型的 Table、Form 等通用组件的类型实现
5. **响应式类型** - SpanType、ResponsiveMode 等响应式布局相关类型
6. **Slots 和 Expose** - 插槽和暴露方法的类型定义方式
7. **最佳实践** - 10 条组件类型定义的最佳实践
8. **常见问题** - 10 个常见问题及解决方案

通过遵循这些类型定义规范,可以确保项目中的组件具有良好的类型安全性和开发体验。
