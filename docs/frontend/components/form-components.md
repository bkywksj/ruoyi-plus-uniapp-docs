# 表单组件

## 介绍

RuoYi-Plus 前端项目提供了一套完整的表单组件体系（AForm 系列），基于 Element Plus 进行深度封装，旨在简化表单开发流程，提供统一的表单交互体验。这套组件系统通过智能化的响应式布局、国际化支持、灵活的配置选项，大幅提升了表单开发效率和代码可维护性。

**核心特性：**

- **统一封装** - 基于 Element Plus 组件二次封装，提供一致的 API 设计和使用体验
- **智能布局** - 内置响应式栅格系统，支持多种布局模式自动适配不同屏幕尺寸
- **国际化支持** - 完整的 i18n 集成，自动翻译标签和占位符文本
- **灵活配置** - 支持表单项包装控制，可独立使用或与表单容器配合
- **类型安全** - 完整的 TypeScript 类型定义，提供准确的代码提示和类型检查
- **字段映射** - 灵活的字段名称映射机制，适配各种数据结构
- **禁用逻辑** - 强大的选项禁用功能，支持单值、数组和函数判断
- **响应模式** - 三种响应式模式（屏幕/容器/模态框），适应不同使用场景
- **扩展性强** - 丰富的插槽支持，满足各种自定义需求
- **AI 增强** - 提供 AI 辅助输入组件，提升用户输入效率

## 组件总览

### 基础输入组件

| 组件 | 说明 | 适用场景 |
|------|------|----------|
| `AFormInput` | 文本输入框 | 文本、文本域、数字、密码输入 |
| `AFormSelect` | 下拉选择器 | 单选、多选，字典数据选择 |
| `AFormCheckbox` | 复选框组 | 多项选择，权限配置 |
| `AFormRadio` | 单选框组 | 互斥选项，状态切换 |
| `AFormSwitch` | 开关 | 布尔值切换，启用禁用 |
| `AFormDate` | 日期选择器 | 日期、时间、日期范围选择 |

### 高级选择组件

| 组件 | 说明 | 适用场景 |
|------|------|----------|
| `AFormCascader` | 级联选择器 | 多级关联数据选择，地址选择 |
| `AFormTreeSelect` | 树形选择器 | 树状结构数据选择，部门选择 |

### 上传组件

| 组件 | 说明 | 适用场景 |
|------|------|----------|
| `AFormImgUpload` | 图片上传 | 图片文件上传，支持预览 |
| `AFormFileUpload` | 文件上传 | 各类文件上传管理 |

### 增强组件

| 组件 | 说明 | 适用场景 |
|------|------|----------|
| `AFormEditor` | 富文本编辑器 | 富文本内容编辑 |
| `AFormMap` | 地图选择器 | 地理位置选择 |
| `AFormInputWithAi` | AI 辅助输入 | AI 生成文本内容 |

## 通用属性

所有表单组件都继承以下通用属性：

### 基础属性

```typescript
interface BaseFormProps {
  /** 绑定值 */
  modelValue?: any

  /** 表单标签文本 */
  label?: string

  /** 标签宽度 */
  labelWidth?: number | string

  /** 表单域字段名 */
  prop?: string

  /** 占位符文本 */
  placeholder?: string

  /** 是否禁用 */
  disabled?: boolean

  /** 组件尺寸 */
  size?: '' | 'default' | 'small' | 'large'

  /** 提示信息 */
  tooltip?: string

  /** 是否显示表单项包装 */
  showFormItem?: boolean
}
```

### 布局属性

```typescript
interface LayoutProps {
  /**
   * 栅格占据的列数
   * - 数字: 固定span值，如 12
   * - 响应式对象: { xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }
   * - 预设字符串: 'auto' - 自动响应式布局
   */
  span?: number | ResponsiveSpan | 'auto'

  /**
   * 响应式模式
   * - 'screen': 基于屏幕尺寸（默认）
   * - 'container': 基于容器尺寸（弹窗推荐）
   * - 'modal-size': 基于 AModal 的 size 属性
   */
  responsiveMode?: 'screen' | 'container' | 'modal-size'

  /** 模态框尺寸（配合 modal-size 模式） */
  modalSize?: 'small' | 'medium' | 'large' | 'xl'
}
```

### 选项数据属性

具有选项列表的组件（Select、Checkbox、Radio 等）支持以下属性：

```typescript
interface OptionsProps {
  /** 选项数据数组 */
  options: any[]

  /** value 字段名称，默认 'value' */
  valueField?: string

  /** label 字段名称，默认 'label' */
  labelField?: string

  /** 禁用字段名称，默认 'status' */
  disabledField?: string

  /** 禁用条件值，默认 '0' */
  disabledValue?: string | number | boolean | Array<any> | ((item: any) => boolean)

  /** 是否使用选项自身的 disabled 属性 */
  useItemDisabled?: boolean
}
```

## AFormInput 输入框

### 基本用法

#### 文本输入

最基础的文本输入框，用于单行文本输入。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础文本输入 -->
      <AFormInput
        v-model="form.userName"
        label="用户名"
        prop="userName"
        :span="12"
        placeholder="请输入用户名"
      />

      <!-- 带字数限制的输入 -->
      <AFormInput
        v-model="form.nickName"
        label="昵称"
        prop="nickName"
        :span="12"
        :maxlength="20"
        show-word-limit
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  userName: '',
  nickName: ''
})
</script>
```

**使用说明：**
- `maxlength` 属性限制输入长度
- `show-word-limit` 显示字数统计
- 默认启用清除按钮，可通过 `clearable` 控制

#### 文本域输入

用于多行文本输入场景。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 自适应高度文本域 -->
    <AFormInput
      v-model="form.remark"
      label="备注"
      prop="remark"
      type="textarea"
      :maxlength="200"
      show-word-limit
      :autosize="{ minRows: 3, maxRows: 10 }"
    />

    <!-- 固定行数文本域 -->
    <AFormInput
      v-model="form.description"
      label="描述"
      prop="description"
      type="textarea"
      :rows="5"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  remark: '',
  description: ''
})
</script>
```

**技术实现：**
- `type="textarea"` 切换为文本域模式
- `autosize` 属性支持高度自动调整
- `rows` 属性设置固定行数
- 自动高度和固定行数不能同时使用

#### 数字输入

专用于数字输入，支持步进器控制。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础数字输入 -->
      <AFormInput
        v-model="form.age"
        label="年龄"
        prop="age"
        type="number"
        :span="12"
        :min="0"
        :max="150"
      />

      <!-- 带精度控制的数字 -->
      <AFormInput
        v-model="form.price"
        label="价格"
        prop="price"
        type="number"
        :span="12"
        :precision="2"
        :step="0.1"
      />

      <!-- 只允许步长倍数 -->
      <AFormInput
        v-model="form.quantity"
        label="数量"
        prop="quantity"
        type="number"
        :span="12"
        :step="5"
        :step-strictly="true"
      />

      <!-- 控制按钮在右侧 -->
      <AFormInput
        v-model="form.count"
        label="计数"
        prop="count"
        type="number"
        :span="12"
        controls-position="right"
        :width="200"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  age: 0,
  price: 0,
  quantity: 0,
  count: 0
})
</script>
```

**配置项说明：**
- `min` / `max`：设置数值范围
- `step`：设置步进值，默认为 1
- `step-strictly`：是否只能输入步长的倍数
- `precision`：数值精度（小数位数）
- `controls`：是否显示增减按钮，默认 true
- `controls-position`：控制按钮位置，可选 '' 或 'right'

#### 密码输入

安全的密码输入框，支持显示/隐藏切换。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础密码输入 -->
      <AFormInput
        v-model="form.password"
        label="密码"
        prop="password"
        type="password"
        :span="12"
        show-password
      />

      <!-- 防自动填充密码 -->
      <AFormInput
        v-model="form.newPassword"
        label="新密码"
        prop="newPassword"
        type="password"
        :span="12"
        show-password
        prevent-autofill
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  password: '',
  newPassword: ''
})
</script>
```

**安全特性：**
- `show-password` 显示密码可见性切换图标
- `prevent-autofill` 防止浏览器自动填充密码
- 防自动填充通过初始设置 readonly 实现，聚焦时移除

### 响应式布局

#### 固定列数布局

适用于桌面端固定布局场景。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 每行两列 -->
      <AFormInput v-model="form.field1" label="字段1" prop="field1" :span="12" />
      <AFormInput v-model="form.field2" label="字段2" prop="field2" :span="12" />

      <!-- 每行三列 -->
      <AFormInput v-model="form.field3" label="字段3" prop="field3" :span="8" />
      <AFormInput v-model="form.field4" label="字段4" prop="field4" :span="8" />
      <AFormInput v-model="form.field5" label="字段5" prop="field5" :span="8" />

      <!-- 独占一行 -->
      <AFormInput v-model="form.field6" label="字段6" prop="field6" :span="24" type="textarea" />
    </el-row>
  </el-form>
</template>
```

**布局说明：**
- span 值总和为 24 时恰好占满一行
- gutter 属性设置列间距
- 通过 span 值灵活控制布局比例

#### 响应式对象布局

根据屏幕尺寸自动调整布局。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 完整响应式配置 -->
      <AFormInput
        v-model="form.userName"
        label="用户名"
        prop="userName"
        :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
      />

      <!-- 部分响应式配置（未指定的使用默认值 24） -->
      <AFormInput
        v-model="form.email"
        label="邮箱"
        prop="email"
        :span="{ md: 12, lg: 8 }"
      />
    </el-row>
  </el-form>
</template>
```

**断点说明：**
- `xs`：<768px（手机）
- `sm`：≥768px（平板竖屏）
- `md`：≥992px（平板横屏）
- `lg`：≥1200px（桌面）
- `xl`：≥1920px（大屏）

#### 预设响应式布局

使用预设的响应式布局方案。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- auto 预设：自动响应式布局 -->
      <AFormInput v-model="form.userName" label="用户名" prop="userName" span="auto" />
      <AFormInput v-model="form.email" label="邮箱" prop="email" span="auto" />
      <AFormInput v-model="form.phone" label="手机号" prop="phone" span="auto" />
    </el-row>
  </el-form>
</template>
```

**auto 预设布局方案：**
- 手机：单列（24）
- 平板：双列（12）
- 桌面：三列（8）
- 大屏：四列（6）

#### 弹窗场景布局

在弹窗中使用容器响应式模式。

```vue
<template>
  <AModal v-model="visible" title="编辑用户" size="medium">
    <el-form :model="form" label-width="100px">
      <el-row :gutter="16">
        <!-- 基于容器尺寸响应 -->
        <AFormInput
          v-model="form.userName"
          label="用户名"
          prop="userName"
          span="auto"
          responsive-mode="container"
        />

        <!-- 基于模态框 size 响应 -->
        <AFormInput
          v-model="form.email"
          label="邮箱"
          prop="email"
          span="auto"
          responsive-mode="modal-size"
          modal-size="medium"
        />
      </el-row>
    </el-form>
  </AModal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const visible = ref(false)
const form = reactive({
  userName: '',
  email: ''
})
</script>
```

**响应式模式对比：**
- `screen`：基于屏幕宽度，适用于全屏表单
- `container`：基于容器宽度，适用于弹窗、侧边栏
- `modal-size`：基于模态框尺寸属性，更精确的弹窗布局控制

### 插槽支持

#### 前置/后置内容

在输入框前后添加内容。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 前置文本 -->
    <AFormInput v-model="form.website" label="网址" prop="website">
      <template #prepend>
        https://
      </template>
    </AFormInput>

    <!-- 后置文本 -->
    <AFormInput v-model="form.email" label="邮箱" prop="email">
      <template #append>
        @example.com
      </template>
    </AFormInput>

    <!-- 前后置按钮 -->
    <AFormInput v-model="form.searchKey" label="搜索" prop="searchKey">
      <template #prepend>
        <el-button :icon="Search" />
      </template>
      <template #append>
        <el-button type="primary">搜索</el-button>
      </template>
    </AFormInput>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'

const form = reactive({
  website: '',
  email: '',
  searchKey: ''
})
</script>
```

#### 前缀/后缀图标

在输入框内部添加图标。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 前缀图标 -->
    <AFormInput v-model="form.userName" label="用户名" prop="userName">
      <template #prefix>
        <el-icon><User /></el-icon>
      </template>
    </AFormInput>

    <!-- 后缀图标 -->
    <AFormInput v-model="form.password" label="密码" prop="password" type="password">
      <template #suffix>
        <el-icon><Lock /></el-icon>
      </template>
    </AFormInput>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'

const form = reactive({
  userName: '',
  password: ''
})
</script>
```

### 独立使用

不使用表单项包装，独立使用输入框。

```vue
<template>
  <div class="search-bar">
    <!-- 搜索栏场景 -->
    <AFormInput
      v-model="searchKey"
      placeholder="请输入关键词"
      :show-form-item="false"
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </template>
    </AFormInput>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const searchKey = ref('')

const handleSearch = () => {
  console.log('搜索:', searchKey.value)
}
</script>
```

### AFormInput API

#### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| null \| undefined` | `undefined` |
| label | 标签文本 | `string` | `''` |
| labelWidth | 标签宽度 | `number \| string` | `undefined` |
| placeholder | 占位符 | `string` | `''` |
| prop | 表单域字段名 | `string` | `''` |
| type | 输入框类型 | `'text' \| 'textarea' \| 'number' \| 'password'` | `'text'` |
| maxlength | 最大长度 | `number \| string` | `undefined` |
| showWordLimit | 显示字数统计 | `boolean` | `true` |
| showPassword | 显示密码切换按钮 | `boolean` | `false` |
| showFormItem | 显示表单项包装 | `boolean` | `true` |
| autosize | 文本域自适应高度 | `{ minRows?: number; maxRows?: number }` | `{ minRows: 2, maxRows: 30 }` |
| rows | 文本域行数 | `number` | `3` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清除 | `boolean` | `true` |
| size | 组件尺寸 | `'' \| 'default' \| 'small' \| 'large'` | `''` |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | `undefined` |
| tooltip | 提示信息 | `string` | `''` |
| width | 组件宽度（仅数字输入） | `number \| string` | `undefined` |
| min | 最小值（数字输入） | `number` | `undefined` |
| max | 最大值（数字输入） | `number` | `undefined` |
| step | 步长（数字输入） | `number` | `1` |
| stepStrictly | 只能输入步长倍数 | `boolean` | `false` |
| precision | 数值精度（数字输入） | `number` | `undefined` |
| controls | 显示增减按钮 | `boolean` | `true` |
| controlsPosition | 控制按钮位置 | `'' \| 'right'` | `''` |
| preventAutofill | 防止自动填充 | `boolean` | `false` |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |
| modalSize | 模态框尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `undefined` |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number) => void` |
| input | 输入时触发 | `(value: string \| number) => void` |
| change | 值改变时触发 | `(value: string \| number) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |
| enter | 按下回车时触发 | `(value: string \| number) => void` |
| clear | 点击清除按钮时触发 | `() => void` |

#### Slots

| 插槽名 | 说明 |
|--------|------|
| prepend | 输入框前置内容 |
| append | 输入框后置内容 |
| prefix | 输入框头部图标 |
| suffix | 输入框尾部图标 |

## AFormSelect 下拉选择器

### 基本用法

#### 基础选择

最基础的单选下拉框。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 字典数据选择 -->
      <AFormSelect
        v-model="form.status"
        label="状态"
        prop="status"
        :span="12"
        :options="statusOptions"
      />

      <!-- 自定义字段映射 -->
      <AFormSelect
        v-model="form.userId"
        label="用户"
        prop="userId"
        :span="12"
        :options="userList"
        value-field="id"
        label-field="name"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useDict } from '@/hooks/useDict'

const { sys_normal_disable } = useDict('sys_normal_disable')
const statusOptions = sys_normal_disable

const userList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const form = reactive({
  status: '',
  userId: ''
})
</script>
```

**使用说明：**
- 默认使用 `value` 和 `label` 字段
- 通过 `value-field` 和 `label-field` 自定义字段映射
- 自动启用搜索过滤功能

#### 多选模式

支持选择多个选项。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础多选 -->
      <AFormSelect
        v-model="form.roleIds"
        label="角色"
        prop="roleIds"
        :span="12"
        :options="roleList"
        multiple
        value-field="roleId"
        label-field="roleName"
      />

      <!-- 限制选择数量 -->
      <AFormSelect
        v-model="form.permissions"
        label="权限"
        prop="permissions"
        :span="12"
        :options="permissionList"
        multiple
        :multiple-limit="3"
      />

      <!-- 折叠标签显示 -->
      <AFormSelect
        v-model="form.tags"
        label="标签"
        prop="tags"
        :span="12"
        :options="tagList"
        multiple
        collapse-tags
        collapse-tags-tooltip
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const roleList = ref([
  { roleId: 1, roleName: '管理员' },
  { roleId: 2, roleName: '普通用户' },
  { roleId: 3, roleName: '访客' }
])

const permissionList = ref([
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' },
  { label: '删除', value: 'delete' },
  { label: '导出', value: 'export' }
])

const tagList = ref([
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' }
])

const form = reactive({
  roleIds: [],
  permissions: [],
  tags: []
})
</script>
```

**多选特性：**
- `multiple` 启用多选模式
- `multiple-limit` 限制可选数量，0 表示不限制
- `collapse-tags` 折叠显示已选标签
- `collapse-tags-tooltip` 鼠标悬停显示所有标签

#### 可创建选项

允许用户输入创建新选项。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormSelect
      v-model="form.tag"
      label="标签"
      prop="tag"
      :span="12"
      :options="tagOptions"
      allow-create
      filterable
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const tagOptions = ref([
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' }
])

const form = reactive({
  tag: ''
})
</script>
```

### 选项禁用

#### 状态字段禁用

根据选项的状态字段禁用。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 默认禁用条件（status === '0'） -->
    <AFormSelect
      v-model="form.postId"
      label="岗位"
      prop="postId"
      :span="12"
      :options="postList"
      value-field="postId"
      label-field="postName"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const postList = ref([
  { postId: 1, postName: '总经理', status: '1' },
  { postId: 2, postName: '项目经理', status: '0' }, // 被禁用
  { postId: 3, postName: '开发工程师', status: '1' }
])

const form = reactive({
  postId: ''
})
</script>
```

#### 自定义禁用字段

指定不同的禁用字段和值。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 自定义禁用条件 -->
    <AFormSelect
      v-model="form.roleId"
      label="角色"
      prop="roleId"
      :span="12"
      :options="roleList"
      value-field="id"
      label-field="roleName"
      disabled-field="isActive"
      :disabled-value="false"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const roleList = ref([
  { id: 1, roleName: '管理员', isActive: true },
  { id: 2, roleName: '已停用角色', isActive: false }, // 被禁用
  { id: 3, roleName: '访客', isActive: true }
])

const form = reactive({
  roleId: ''
})
</script>
```

#### 多值禁用条件

当字段值匹配多个值中的任意一个时禁用。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormSelect
      v-model="form.deptId"
      label="部门"
      prop="deptId"
      :span="12"
      :options="deptList"
      value-field="deptId"
      label-field="deptName"
      disabled-field="status"
      :disabled-value="['0', '3']"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const deptList = ref([
  { deptId: 1, deptName: '研发部', status: '1' },
  { deptId: 2, deptName: '已关闭部门', status: '0' }, // 被禁用
  { deptId: 3, deptName: '待审核部门', status: '3' }, // 被禁用
  { deptId: 4, deptName: '市场部', status: '1' }
])

const form = reactive({
  deptId: ''
})
</script>
```

#### 函数判断禁用

使用自定义函数进行复杂的禁用判断。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormSelect
      v-model="form.goodsId"
      label="商品"
      prop="goodsId"
      :span="12"
      :options="goodsList"
      value-field="id"
      label-field="name"
      :disabled-value="(item) => item.status === '0' || item.stock < 10"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const goodsList = ref([
  { id: 1, name: '商品A', status: '1', stock: 100 },
  { id: 2, name: '商品B（已下架）', status: '0', stock: 50 }, // 被禁用
  { id: 3, name: '商品C（库存不足）', status: '1', stock: 5 }, // 被禁用
  { id: 4, name: '商品D', status: '1', stock: 200 }
])

const form = reactive({
  goodsId: ''
})
</script>
```

**禁用逻辑优先级：**
1. 选项自身的 `disabled` 属性（`useItemDisabled` 为 true 时）
2. `disabled-field` 和 `disabled-value` 的判断
3. 如果都不满足，则不禁用

### 显示选项值

开发模式下显示选项的 value 值，便于调试。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 强制显示选项值 -->
    <AFormSelect
      v-model="form.code"
      label="代码"
      prop="code"
      :span="12"
      :options="codeList"
      :show-value="true"
    />

    <!-- 强制不显示选项值 -->
    <AFormSelect
      v-model="form.name"
      label="名称"
      prop="name"
      :span="12"
      :options="nameList"
      :show-value="false"
    />

    <!-- 自定义显示角色 -->
    <AFormSelect
      v-model="form.type"
      label="类型"
      prop="type"
      :span="12"
      :options="typeList"
      :show-value-roles="['developer', 'tester']"
    />
  </el-form>
</template>
```

**显示逻辑：**
1. 优先使用 `show-value` 属性
2. 其次使用全局布局配置
3. 再根据用户角色判断（`show-value-roles`）
4. 默认不显示

### 前缀图标

在选择器中添加前缀图标。

```vue
<template>
  <el-form :model="loginForm" label-width="100px">
    <AFormSelect
      v-model="loginForm.tenantId"
      label="租户"
      prop="tenantId"
      :options="tenantList"
      value-field="tenantId"
      label-field="companyName"
    >
      <template #prefix>
        <Icon code="company" />
      </template>
    </AFormSelect>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const tenantList = ref([
  { tenantId: '1', companyName: '公司A' },
  { tenantId: '2', companyName: '公司B' }
])

const loginForm = reactive({
  tenantId: ''
})
</script>
```

### AFormSelect API

#### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| Array<string \| number>` | `undefined` |
| label | 标签文本 | `string` | `''` |
| labelWidth | 标签宽度 | `number \| string` | `undefined` |
| placeholder | 占位符 | `string` | `''` |
| prop | 表单域字段名 | `string` | `''` |
| options | 选项数据 | `any[]` | `[]` |
| valueField | value 字段名 | `string` | `'value'` |
| labelField | label 字段名 | `string` | `'label'` |
| disabledField | 禁用字段名 | `string` | `'status'` |
| disabledValue | 禁用条件值 | `string \| number \| boolean \| any[] \| ((item: any) => boolean)` | `'0'` |
| useItemDisabled | 使用选项自身 disabled 属性 | `boolean` | `true` |
| showValue | 显示选项值 | `boolean` | `undefined` |
| showValueRoles | 显示值的角色列表 | `string[]` | `['superadmin', 'admin']` |
| multiple | 多选模式 | `boolean` | `false` |
| multipleLimit | 多选数量限制 | `number` | `0` |
| collapseTags | 折叠标签 | `boolean` | `false` |
| collapseTagsTooltip | 折叠标签提示 | `boolean` | `false` |
| filterable | 可搜索 | `boolean` | `true` |
| allowCreate | 允许创建新选项 | `boolean` | `false` |
| clearable | 可清除 | `boolean` | `true` |
| disabled | 禁用 | `boolean` | `false` |
| size | 组件尺寸 | `'' \| 'default' \| 'small' \| 'large'` | `''` |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | `undefined` |
| width | 组件宽度 | `number \| string` | `undefined` |
| tooltip | 提示信息 | `string` | `''` |
| showFormItem | 显示表单项包装 | `boolean` | `true` |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |
| modalSize | 模态框尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `undefined` |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number \| any[]) => void` |
| change | 值改变时触发 | `(value: string \| number \| any[]) => void` |
| focus | 获得焦点时触发 | `() => void` |
| clear | 点击清除按钮时触发 | `() => void` |
| visible-change | 下拉框显隐状态改变时触发 | `(visible: boolean) => void` |
| remove-tag | 多选模式下移除 tag 时触发 | `(tag: any) => void` |

#### Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 前缀图标 |
| option | 自定义选项内容 |
| empty | 空数据时的内容 |

## AFormCheckbox 复选框

### 基本用法

#### 基础复选框组

多项选择场景。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础复选框组 -->
      <AFormCheckbox
        v-model="form.hobbies"
        label="爱好"
        prop="hobbies"
        :span="12"
        :options="hobbyOptions"
      />

      <!-- 自定义字段映射 -->
      <AFormCheckbox
        v-model="form.roleIds"
        label="角色"
        prop="roleIds"
        :span="12"
        :options="roleList"
        value-field="id"
        label-field="name"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const hobbyOptions = ref([
  { label: '篮球', value: '1' },
  { label: '足球', value: '2' },
  { label: '羽毛球', value: '3' }
])

const roleList = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '编辑' },
  { id: 3, name: '访客' }
])

const form = reactive({
  hobbies: '', // 逗号分隔的字符串
  roleIds: []  // 数组格式
})
</script>
```

**数据格式：**
- 默认返回逗号分隔的字符串，如 `'1,2,3'`
- 设置 `return-array` 为 true 返回数组格式
- 如果 `modelValue` 是数组，自动返回数组格式

#### 按钮样式

使用按钮样式的复选框。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormCheckbox
      v-model="form.permissions"
      label="权限"
      prop="permissions"
      type="button"
      :span="24"
      :options="permissionOptions"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const permissionOptions = ref([
  { label: '查看', value: 'view' },
  { label: '新增', value: 'add' },
  { label: '编辑', value: 'edit' },
  { label: '删除', value: 'delete' },
  { label: '导出', value: 'export' }
])

const form = reactive({
  permissions: ''
})
</script>
```

#### 数量限制

限制可选择的数量范围。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 最少选择2个，最多选择5个 -->
    <AFormCheckbox
      v-model="form.tags"
      label="标签"
      prop="tags"
      :span="24"
      :options="tagOptions"
      :min="2"
      :max="5"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const tagOptions = ref([
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'JavaScript', value: 'js' },
  { label: 'CSS', value: 'css' }
])

const form = reactive({
  tags: ''
})
</script>
```

#### 单个复选框

用于单一的布尔值选择，如"记住密码"。

```vue
<template>
  <el-form :model="loginForm">
    <AFormCheckbox
      v-model="loginForm.rememberMe"
      :options="[{ label: '记住密码', value: true }]"
      single-checkbox
      :show-form-item="false"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const loginForm = reactive({
  rememberMe: false
})
</script>
```

### 选项禁用

复选框组支持与 AFormSelect 相同的禁用逻辑。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 使用 disabled 属性禁用 -->
    <AFormCheckbox
      v-model="form.permissions1"
      label="权限1"
      prop="permissions1"
      :span="24"
      :options="[
        { label: '查看', value: 'view' },
        { label: '编辑（已禁用）', value: 'edit', disabled: true },
        { label: '删除', value: 'delete' }
      ]"
    />

    <!-- 使用状态字段禁用 -->
    <AFormCheckbox
      v-model="form.permissions2"
      label="权限2"
      prop="permissions2"
      :span="24"
      :options="permissionList"
      disabled-field="status"
      disabled-value="0"
    />

    <!-- 使用函数判断禁用 -->
    <AFormCheckbox
      v-model="form.features"
      label="功能"
      prop="features"
      :span="24"
      :options="featureList"
      :disabled-value="(item) => !item.available"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const permissionList = ref([
  { label: '读取', value: 'read', status: '1' },
  { label: '写入（已停用）', value: 'write', status: '0' },
  { label: '执行', value: 'execute', status: '1' }
])

const featureList = ref([
  { label: '功能A', value: 'a', available: true },
  { label: '功能B（不可用）', value: 'b', available: false },
  { label: '功能C', value: 'c', available: true }
])

const form = reactive({
  permissions1: '',
  permissions2: '',
  features: ''
})
</script>
```

### AFormCheckbox API

#### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| Array<string \| number> \| boolean` | `''` |
| label | 标签文本 | `string` | `''` |
| labelWidth | 标签宽度 | `number \| string` | `undefined` |
| prop | 表单域字段名 | `string` | `''` |
| options | 选项数据 | `any[]` | `[]` |
| valueField | value 字段名 | `string` | `'value'` |
| labelField | label 字段名 | `string` | `'label'` |
| disabledField | 禁用字段名 | `string` | `'status'` |
| disabledValue | 禁用条件值 | `string \| number \| boolean \| any[] \| ((item: any) => boolean)` | `'0'` |
| useItemDisabled | 使用选项自身 disabled 属性 | `boolean` | `true` |
| type | 复选框类型 | `'checkbox' \| 'button'` | `'checkbox'` |
| border | 是否显示边框 | `boolean` | `false` |
| size | 组件尺寸 | `'' \| 'default' \| 'small' \| 'large'` | `''` |
| disabled | 禁用 | `boolean` | `false` |
| min | 最小勾选数量 | `number` | `undefined` |
| max | 最大勾选数量 | `number` | `undefined` |
| textColor | 选中时文字颜色 | `string` | `'#ffffff'` |
| fill | 选中时填充色 | `string` | `'#409EFF'` |
| returnArray | 返回数组格式 | `boolean` | `false` |
| singleCheckbox | 单个复选框模式 | `boolean` | `false` |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | `undefined` |
| tooltip | 提示信息 | `string` | `''` |
| showFormItem | 显示表单项包装 | `boolean` | `true` |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |
| modalSize | 模态框尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `undefined` |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| any[] \| boolean) => void` |
| change | 值改变时触发 | `(value: string \| any[] \| boolean) => void` |

## AFormRadio 单选框

### 基本用法

#### 基础单选框组

互斥选项的单选场景。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础单选框组 -->
      <AFormRadio
        v-model="form.status"
        label="状态"
        prop="status"
        :span="12"
        :options="statusOptions"
      />

      <!-- 自定义字段映射 -->
      <AFormRadio
        v-model="form.gender"
        label="性别"
        prop="gender"
        :span="12"
        :options="genderList"
        value-field="id"
        label-field="name"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const statusOptions = ref([
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
])

const genderList = ref([
  { id: '1', name: '男' },
  { id: '2', name: '女' }
])

const form = reactive({
  status: '1',
  gender: '1'
})
</script>
```

#### 按钮样式

使用按钮样式的单选框。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormRadio
      v-model="form.type"
      label="类型"
      prop="type"
      type="button"
      :span="24"
      :options="typeOptions"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const typeOptions = ref([
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

const form = reactive({
  type: 'all'
})
</script>
```

### AFormRadio API

#### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| boolean` | `undefined` |
| label | 标签文本 | `string` | `''` |
| labelWidth | 标签宽度 | `number \| string` | `undefined` |
| prop | 表单域字段名 | `string` | `''` |
| options | 选项数据 | `any[]` | `[]` |
| valueField | value 字段名 | `string` | `'value'` |
| labelField | label 字段名 | `string` | `'label'` |
| disabledField | 禁用字段名 | `string` | `'status'` |
| disabledValue | 禁用条件值 | `string \| number \| boolean \| any[] \| ((item: any) => boolean)` | `'0'` |
| useItemDisabled | 使用选项自身 disabled 属性 | `boolean` | `true` |
| type | 单选框类型 | `'radio' \| 'button'` | `'radio'` |
| border | 是否显示边框 | `boolean` | `false` |
| size | 组件尺寸 | `'' \| 'default' \| 'small' \| 'large'` | `''` |
| disabled | 禁用 | `boolean` | `false` |
| textColor | 选中时文字颜色 | `string` | `'#ffffff'` |
| fill | 选中时填充色 | `string` | `'#409EFF'` |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | `undefined` |
| tooltip | 提示信息 | `string` | `''` |
| showFormItem | 显示表单项包装 | `boolean` | `true` |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |
| modalSize | 模态框尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `undefined` |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number \| boolean) => void` |
| change | 值改变时触发 | `(value: string \| number \| boolean) => void` |

## AFormDate 日期选择器

### 基本用法

#### 日期选择

选择单个日期。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础日期选择 -->
      <AFormDate
        v-model="form.birthday"
        label="生日"
        prop="birthday"
        :span="12"
      />

      <!-- 日期时间选择 -->
      <AFormDate
        v-model="form.appointmentTime"
        label="预约时间"
        prop="appointmentTime"
        type="datetime"
        :span="12"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  birthday: '',
  appointmentTime: ''
})
</script>
```

#### 日期范围选择

选择日期范围。

```vue
<template>
  <el-form :model="queryParams" label-width="100px">
    <el-row :gutter="16">
      <!-- 日期范围 -->
      <AFormDate
        v-model="queryParams.dateRange"
        label="日期范围"
        prop="dateRange"
        type="daterange"
        :span="12"
      />

      <!-- 日期时间范围 -->
      <AFormDate
        v-model="queryParams.datetimeRange"
        label="时间范围"
        prop="datetimeRange"
        type="datetimerange"
        :span="12"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const queryParams = reactive({
  dateRange: [],
  datetimeRange: []
})
</script>
```

#### 快捷选项

提供常用的快捷日期选择。

```vue
<template>
  <el-form :model="queryParams" label-width="100px">
    <AFormDate
      v-model="queryParams.date"
      label="日期"
      prop="date"
      type="daterange"
      :span="12"
      :shortcuts="dateShortcuts"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  }
]

const queryParams = reactive({
  date: []
})
</script>
```

### AFormDate API

#### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| any[]` | `undefined` |
| label | 标签文本 | `string` | `''` |
| labelWidth | 标签宽度 | `number \| string` | `undefined` |
| placeholder | 占位符 | `string` | `''` |
| prop | 表单域字段名 | `string` | `''` |
| type | 日期类型 | `'date' \| 'datetime' \| 'daterange' \| 'datetimerange' \| 'week' \| 'month' \| 'year'` | `'date'` |
| format | 显示格式 | `string` | `undefined` |
| valueFormat | 值格式 | `string` | `undefined` |
| width | 组件宽度 | `number \| string` | `240` |
| disabled | 禁用 | `boolean` | `false` |
| readonly | 只读 | `boolean` | `false` |
| editable | 可输入 | `boolean` | `true` |
| clearable | 可清除 | `boolean` | `true` |
| size | 组件尺寸 | `'' \| 'default' \| 'small' \| 'large'` | `''` |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | `undefined` |
| tooltip | 提示信息 | `string` | `''` |
| startPlaceholder | 开始日期占位符 | `string` | `'开始日期'` |
| endPlaceholder | 结束日期占位符 | `string` | `'结束日期'` |
| rangeSeparator | 范围分隔符 | `string` | `'-'` |
| shortcuts | 快捷选项 | `DateShortcut[]` | `undefined` |
| disabledDate | 禁用日期函数 | `(date: Date) => boolean` | `undefined` |
| defaultValue | 默认显示日期 | `Date` | `undefined` |
| defaultTime | 默认时间 | `Date \| [Date, Date]` | `undefined` |
| unlinkPanels | 取消面板联动 | `boolean` | `false` |
| showFormItem | 显示表单项包装 | `boolean` | `true` |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |
| modalSize | 模态框尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `undefined` |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number \| any[]) => void` |
| change | 值改变时触发 | `(value: string \| number \| any[]) => void` |
| blur | 失去焦点时触发 | `() => void` |
| focus | 获得焦点时触发 | `() => void` |
| calendar-change | 日历改变时触发 | `(value: [Date, Date]) => void` |
| panel-change | 面板改变时触发 | `(value: Date, mode: string) => void` |
| visible-change | 显隐状态改变时触发 | `(visible: boolean) => void` |

## AFormSwitch 开关

### 基本用法

用于布尔值的开关切换。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 基础开关 -->
      <AFormSwitch
        v-model="form.enabled"
        label="启用状态"
        prop="enabled"
        :span="12"
      />

      <!-- 自定义文本 -->
      <AFormSwitch
        v-model="form.showDetail"
        label="显示详情"
        prop="showDetail"
        :span="12"
        active-text="显示"
        inactive-text="隐藏"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  enabled: true,
  showDetail: false
})
</script>
```

## 最佳实践

### 1. 搜索表单场景

搜索栏中的表单项不需要响应式布局。

```vue
<template>
  <el-form :model="queryParams" :inline="true">
    <!-- 不设置 span，横向排列 -->
    <AFormInput
      v-model="queryParams.userName"
      label="用户名"
      prop="userName"
      placeholder="请输入用户名"
      @keyup.enter="handleQuery"
    />

    <AFormSelect
      v-model="queryParams.status"
      label="状态"
      prop="status"
      :options="statusOptions"
      @change="handleQuery"
    />

    <AFormDate
      v-model="queryParams.dateRange"
      label="创建时间"
      prop="dateRange"
      type="daterange"
      @change="handleQuery"
    />

    <el-form-item>
      <el-button type="primary" @click="handleQuery">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>
```

### 2. 编辑表单场景

编辑表单需要响应式布局，适配不同屏幕。

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-row :gutter="16">
      <!-- 使用 auto 预设自动响应式 -->
      <AFormInput v-model="form.userName" label="用户名" prop="userName" span="auto" />
      <AFormInput v-model="form.nickName" label="昵称" prop="nickName" span="auto" />
      <AFormSelect v-model="form.gender" label="性别" prop="gender" :options="genderOptions" span="auto" />
      <AFormInput v-model="form.phone" label="手机号" prop="phone" span="auto" />
      <AFormInput v-model="form.email" label="邮箱" prop="email" span="auto" />
      <AFormCheckbox v-model="form.roleIds" label="角色" prop="roleIds" :options="roleList" :span="24" />
      <AFormInput v-model="form.remark" label="备注" prop="remark" type="textarea" :span="24" />
    </el-row>
  </el-form>
</template>
```

### 3. 弹窗表单场景

弹窗表单使用容器响应式模式。

```vue
<template>
  <AModal v-model="visible" title="新增用户" size="large">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="16">
        <!-- 使用 container 模式，基于弹窗宽度响应 -->
        <AFormInput
          v-model="form.userName"
          label="用户名"
          prop="userName"
          span="auto"
          responsive-mode="container"
        />
        <!-- 其他字段... -->
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </AModal>
</template>
```

### 4. 字典数据使用

结合字典 Hook 使用。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <AFormSelect
        v-model="form.status"
        label="状态"
        prop="status"
        :span="12"
        :options="sys_normal_disable"
      />

      <AFormSelect
        v-model="form.userType"
        label="用户类型"
        prop="userType"
        :span="12"
        :options="sys_user_type"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useDict } from '@/hooks/useDict'

const { sys_normal_disable, sys_user_type } = useDict('sys_normal_disable', 'sys_user_type')

const form = reactive({
  status: '',
  userType: ''
})
</script>
```

### 5. 动态禁用控制

根据条件动态禁用表单项。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <AFormRadio
        v-model="form.type"
        label="类型"
        prop="type"
        :span="12"
        :options="typeOptions"
        @change="handleTypeChange"
      />

      <!-- 根据类型动态禁用 -->
      <AFormInput
        v-model="form.code"
        label="编码"
        prop="code"
        :span="12"
        :disabled="form.type !== 'custom'"
      />

      <AFormSelect
        v-model="form.categoryId"
        label="分类"
        prop="categoryId"
        :span="12"
        :options="categoryList"
        :disabled="form.type === 'system'"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const typeOptions = [
  { label: '系统', value: 'system' },
  { label: '自定义', value: 'custom' }
]

const form = reactive({
  type: 'system',
  code: '',
  categoryId: ''
})

const handleTypeChange = (value: string) => {
  if (value === 'system') {
    form.code = 'SYS_'
  } else {
    form.code = ''
  }
}
</script>
```

## 常见问题

### 1. 如何处理表单验证？

表单组件的 `prop` 属性用于表单验证。

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-row :gutter="16">
      <AFormInput
        v-model="form.userName"
        label="用户名"
        prop="userName"
        :span="12"
      />

      <AFormInput
        v-model="form.email"
        label="邮箱"
        prop="email"
        :span="12"
      />
    </el-row>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: '',
  email: ''
})

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('表单验证通过', form)
      // 提交表单数据
    }
  })
}
</script>
```

### 2. 如何实现表单项联动？

通过监听值的变化实现联动效果。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="16">
      <!-- 省份选择 -->
      <AFormSelect
        v-model="form.provinceId"
        label="省份"
        prop="provinceId"
        :span="12"
        :options="provinceList"
        @change="handleProvinceChange"
      />

      <!-- 城市选择（根据省份联动） -->
      <AFormSelect
        v-model="form.cityId"
        label="城市"
        prop="cityId"
        :span="12"
        :options="cityList"
        :disabled="!form.provinceId"
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const provinceList = ref([
  { value: '1', label: '广东省' },
  { value: '2', label: '浙江省' }
])

const cityList = ref<any[]>([])

const form = reactive({
  provinceId: '',
  cityId: ''
})

const handleProvinceChange = (value: string) => {
  // 清空城市选择
  form.cityId = ''

  // 加载对应省份的城市列表
  if (value === '1') {
    cityList.value = [
      { value: '101', label: '广州市' },
      { value: '102', label: '深圳市' }
    ]
  } else if (value === '2') {
    cityList.value = [
      { value: '201', label: '杭州市' },
      { value: '202', label: '宁波市' }
    ]
  }
}
</script>
```

### 3. 如何处理多选值的类型问题？

多选组件支持字符串和数组两种格式。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 返回逗号分隔的字符串 -->
    <AFormCheckbox
      v-model="form.hobbies"
      label="爱好"
      prop="hobbies"
      :span="24"
      :options="hobbyOptions"
    />

    <!-- 返回数组格式 -->
    <AFormCheckbox
      v-model="form.permissions"
      label="权限"
      prop="permissions"
      :span="24"
      :options="permissionOptions"
      return-array
    />

    <!-- 自动判断（modelValue 是数组则返回数组） -->
    <AFormSelect
      v-model="form.roleIds"
      label="角色"
      prop="roleIds"
      :span="24"
      :options="roleList"
      multiple
    />
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const hobbyOptions = ref([
  { label: '篮球', value: '1' },
  { label: '足球', value: '2' }
])

const permissionOptions = ref([
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' }
])

const roleList = ref([
  { value: 1, label: '管理员' },
  { value: 2, label: '编辑' }
])

const form = reactive({
  hobbies: '',      // 字符串: "1,2"
  permissions: [],  // 数组: ['view', 'edit']
  roleIds: []       // 数组: [1, 2]
})
</script>
```

### 4. 如何自定义表单项宽度？

不同场景的宽度控制方法。

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 方式1: 通过 span 控制（推荐） -->
    <el-row :gutter="16">
      <AFormInput v-model="form.field1" label="字段1" prop="field1" :span="12" />
      <AFormInput v-model="form.field2" label="字段2" prop="field2" :span="8" />
    </el-row>

    <!-- 方式2: 通过 width 属性控制（数字输入框、选择器） -->
    <AFormInput
      v-model="form.age"
      label="年龄"
      prop="age"
      type="number"
      :width="200"
    />

    <AFormSelect
      v-model="form.status"
      label="状态"
      prop="status"
      :options="statusOptions"
      :width="300"
    />

    <!-- 方式3: 通过 CSS 控制 -->
    <AFormDate
      v-model="form.date"
      label="日期"
      prop="date"
      class="custom-width"
    />
  </el-form>
</template>

<style scoped>
.custom-width {
  width: 280px;
}
</style>
```

### 5. 如何实现表单重置？

使用 Element Plus 的表单重置方法。

```vue
<template>
  <el-form :model="form" ref="formRef" label-width="100px">
    <el-row :gutter="16">
      <AFormInput v-model="form.userName" label="用户名" prop="userName" :span="12" />
      <AFormSelect v-model="form.status" label="状态" prop="status" :options="statusOptions" :span="12" />
    </el-row>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: '',
  status: ''
})

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

### 6. 如何在搜索栏中快速触发查询？

监听输入框回车和选择器变化事件。

```vue
<template>
  <el-form :model="queryParams" :inline="true">
    <!-- 输入框回车触发 -->
    <AFormInput
      v-model="queryParams.userName"
      label="用户名"
      placeholder="请输入用户名"
      @keyup.enter="handleQuery"
    />

    <!-- 选择器变化触发 -->
    <AFormSelect
      v-model="queryParams.status"
      label="状态"
      :options="statusOptions"
      @change="handleQuery"
    />

    <!-- 日期选择器变化触发 -->
    <AFormDate
      v-model="queryParams.dateRange"
      label="创建时间"
      type="daterange"
      @change="handleQuery"
    />

    <el-form-item>
      <el-button type="primary" @click="handleQuery">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const queryParams = reactive({
  userName: '',
  status: '',
  dateRange: []
})

const handleQuery = () => {
  console.log('查询参数:', queryParams)
  // 调用查询接口
}

const handleReset = () => {
  queryParams.userName = ''
  queryParams.status = ''
  queryParams.dateRange = []
  handleQuery()
}
</script>
```

## 总结

RuoYi-Plus 的表单组件体系提供了完整的表单解决方案，通过统一的 API 设计和灵活的配置选项，大幅简化了表单开发流程。

**核心优势：**

1. **开发效率高** - 减少重复代码，统一表单交互逻辑
2. **响应式友好** - 内置多种响应式布局方案，自动适配设备
3. **类型安全** - 完整的 TypeScript 支持，减少运行时错误
4. **扩展性强** - 丰富的插槽和事件，满足各种定制需求
5. **国际化完善** - 自动翻译标签和占位符，支持多语言

**使用建议：**

- 搜索栏不设置 `span`，使用行内布局
- 编辑表单使用 `span="auto"` 实现自动响应式
- 弹窗表单使用 `responsive-mode="container"` 适配弹窗尺寸
- 多选组件根据后端要求选择字符串或数组格式
- 合理使用禁用条件和字段映射功能，减少数据转换代码
