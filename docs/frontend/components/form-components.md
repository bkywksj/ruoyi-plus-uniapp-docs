# 表单组件总览

## 介绍

RuoYi-Plus 前端项目提供了一套完整的表单组件体系,基于 Element Plus 进行二次封装,旨在简化表单开发、提供统一的交互体验和减少重复代码。这些组件以 `AForm` 为前缀命名,包含了输入、选择、上传、编辑器等各类表单控件,支持响应式布局、国际化、自动校验等功能。

**核心特性:**

- **统一封装** - 所有表单组件基于 Element Plus 二次封装,提供一致的 API 设计
- **响应式布局** - 支持基于屏幕尺寸、容器尺寸和模态框尺寸的智能响应式布局
- **开箱即用** - 内置表单项容器 `el-form-item`,支持标签、校验、提示等功能
- **国际化支持** - 集成 i18n,自动处理占位符和标签的多语言显示
- **灵活配置** - 支持显示/隐藏表单项容器、自定义布局、插槽扩展等
- **防自动填充** - 密码输入框支持防浏览器自动填充功能
- **智能提示** - 支持 Tooltip 提示信息,帮助用户理解字段含义
- **AI 增强** - 部分组件支持 AI 辅助输入,提升用户体验

**组件分类:**

表单组件体系包含 13 个核心组件:

1. **基础输入** - AFormInput (文本、数字、密码、文本域)
2. **选择器** - AFormSelect、AFormCascader、AFormTreeSelect
3. **日期时间** - AFormDate
4. **开关选择** - AFormRadio、AFormCheckbox、AFormSwitch
5. **文件上传** - AFormFileUpload、AFormImgUpload
6. **富文本编辑** - AFormEditor
7. **地图选点** - AFormMap
8. **AI 增强** - AFormInputWithAi

**适用场景:**

- 数据录入表单(新增/编辑/详情)
- 搜索筛选表单
- 配置管理表单
- 用户信息表单
- 内容发布表单

---

## 组件架构设计

### 1. 设计理念

表单组件的设计遵循以下核心理念:

**组件化与可复用性:**

每个表单组件都是独立的、可复用的单元,可以在不同的表单场景中灵活使用。组件封装了常见的表单交互逻辑,开发者只需关注业务数据和校验规则。

**渐进式增强:**

- 基础层: Element Plus 原生组件
- 封装层: AForm 系列组件(添加响应式、国际化等)
- 业务层: 页面级表单组合

**配置优于编码:**

通过属性配置即可实现大部分功能,无需编写额外的模板代码。例如响应式布局只需配置 `span` 属性,无需手写媒体查询。

### 2. 统一 Props 设计

所有表单组件都遵循统一的 Props 命名规范:

**核心属性:**

```typescript
interface BaseFormComponentProps {
  // 数据绑定
  modelValue: any                      // v-model 绑定值

  // 表单项配置
  label?: string                       // 标签文本
  prop?: string                        // 表单域字段名
  labelWidth?: number | string         // 标签宽度

  // 布局配置
  span?: SpanType                      // 栅格列数(响应式)
  showFormItem?: boolean               // 是否显示 el-form-item 容器

  // 交互配置
  placeholder?: string                 // 占位符
  disabled?: boolean                   // 是否禁用
  clearable?: boolean                  // 是否可清除
  size?: ComponentSize                 // 组件尺寸

  // 辅助功能
  tooltip?: string                     // 提示信息
  responsiveMode?: ResponsiveMode      // 响应式模式
}
```

**响应式布局属性:**

```typescript
// 支持三种 span 配置方式

// 1. 固定值
span={12}

// 2. 响应式对象
span={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}

// 3. 预设值
span="auto"  // 自动响应式: { xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }
```

**响应式模式:**

```typescript
// 三种响应式模式

// 1. 基于屏幕尺寸(默认)
responsiveMode="screen"

// 2. 基于容器尺寸
responsiveMode="container"

// 3. 基于模态框尺寸
responsiveMode="modal-size"
modalSize="medium"
```

### 3. 统一事件设计

所有表单组件都支持以下标准事件:

```typescript
interface BaseFormComponentEmits {
  // 数据更新事件
  'update:modelValue': (value: any) => void

  // 输入事件
  'input': (value: any) => void

  // 失焦事件
  'blur': (event: FocusEvent) => void

  // 值改变事件
  'change': (value: any) => void
}
```

**事件触发时机:**

- `update:modelValue`: 值变化时立即触发,用于 v-model 双向绑定
- `input`: 用户输入时触发(实时)
- `change`: 值确定变化时触发(失焦或选择完成)
- `blur`: 失去焦点时触发

### 4. 插槽设计

表单组件支持多种插槽用于自定义内容:

```vue
<AFormInput v-model="form.userName" label="用户名">
  <!-- 前缀内容插槽 -->
  <template #prepend>
    <el-icon><User /></el-icon>
  </template>

  <!-- 后缀内容插槽 -->
  <template #append>
    <el-button>搜索</el-button>
  </template>

  <!-- 前缀图标插槽 -->
  <template #prefix>
    <el-icon><Search /></el-icon>
  </template>

  <!-- 后缀图标插槽 -->
  <template #suffix>
    <el-icon><Close /></el-icon>
  </template>
</AFormInput>
```

---

## 核心组件详解

### 1. AFormInput - 输入框组件

#### 组件说明

`AFormInput` 是最常用的表单组件,支持文本、数字、密码、文本域等多种输入类型。基于 Element Plus 的 `el-input` 和 `el-input-number` 封装,提供了响应式布局、国际化、防自动填充等增强功能。

#### 基础用法

**文本输入:**

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 基础文本输入 -->
    <AFormInput
      v-model="form.userName"
      label="用户名"
      prop="userName"
    />

    <!-- 带清除按钮 -->
    <AFormInput
      v-model="form.nickName"
      label="昵称"
      prop="nickName"
      :clearable="true"
    />

    <!-- 自定义占位符 -->
    <AFormInput
      v-model="form.email"
      label="邮箱"
      prop="email"
      placeholder="请输入邮箱地址"
    />
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  userName: '',
  nickName: '',
  email: ''
})
</script>
```

**密码输入:**

```vue
<template>
  <el-form :model="form">
    <!-- 基础密码输入 -->
    <AFormInput
      v-model="form.password"
      label="密码"
      prop="password"
      type="password"
      show-password
    />

    <!-- 防自动填充密码 -->
    <AFormInput
      v-model="form.newPassword"
      label="新密码"
      prop="newPassword"
      type="password"
      show-password
      prevent-autofill
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  password: '',
  newPassword: ''
})
</script>
```

**使用说明:**

- `show-password`: 显示密码可见性切换按钮
- `prevent-autofill`: 防止浏览器自动填充密码,初始设置为只读,聚焦时移除只读

**文本域输入:**

```vue
<template>
  <el-form :model="form">
    <!-- 基础文本域 -->
    <AFormInput
      v-model="form.description"
      label="描述"
      prop="description"
      type="textarea"
      :rows="3"
    />

    <!-- 自适应高度文本域 -->
    <AFormInput
      v-model="form.content"
      label="内容"
      prop="content"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 10 }"
    />

    <!-- 带字数统计 -->
    <AFormInput
      v-model="form.remark"
      label="备注"
      prop="remark"
      type="textarea"
      :maxlength="200"
      show-word-limit
    />
  </el-form>
</template>
```

**使用说明:**

- `rows`: 固定文本域行数
- `autosize`: 自适应高度配置
- `maxlength` + `show-word-limit`: 显示字数统计

**数字输入:**

```vue
<template>
  <el-form :model="form">
    <!-- 基础数字输入 -->
    <AFormInput
      v-model="form.age"
      label="年龄"
      prop="age"
      type="number"
      :min="0"
      :max="150"
    />

    <!-- 带步长的数字输入 -->
    <AFormInput
      v-model="form.price"
      label="价格"
      prop="price"
      type="number"
      :min="0"
      :step="0.01"
      :precision="2"
    />

    <!-- 严格步长 -->
    <AFormInput
      v-model="form.quantity"
      label="数量"
      prop="quantity"
      type="number"
      :min="1"
      :step="5"
      :step-strictly="true"
    />

    <!-- 右侧控制按钮 -->
    <AFormInput
      v-model="form.count"
      label="计数"
      prop="count"
      type="number"
      controls-position="right"
    />
  </el-form>
</template>
```

**使用说明:**

- `min` / `max`: 最小值/最大值
- `step`: 步长
- `precision`: 数值精度(小数位数)
- `step-strictly`: 是否只能输入步长的倍数
- `controls-position`: 控制按钮位置("" 或 "right")

#### 响应式布局

**固定 span:**

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <!-- 固定占据 12 列(50% 宽度) -->
      <AFormInput
        v-model="form.userName"
        label="用户名"
        :span="12"
      />

      <AFormInput
        v-model="form.nickName"
        label="昵称"
        :span="12"
      />
    </el-row>
  </el-form>
</template>
```

**响应式 span:**

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <!-- 完整响应式配置 -->
      <AFormInput
        v-model="form.userName"
        label="用户名"
        :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
      />

      <!-- 部分响应式配置(未指定的使用默认值 24) -->
      <AFormInput
        v-model="form.email"
        label="邮箱"
        :span="{ md: 12, lg: 8 }"
      />

      <!-- 预设响应式配置 -->
      <AFormInput
        v-model="form.phone"
        label="电话"
        span="auto"
      />
    </el-row>
  </el-form>
</template>
```

**响应式断点说明:**

| 断点 | 尺寸 | 设备 |
|------|------|------|
| xs | <768px | 手机 |
| sm | ≥768px | 平板竖屏 |
| md | ≥992px | 平板横屏/小屏电脑 |
| lg | ≥1200px | 普通电脑 |
| xl | ≥1920px | 大屏电脑 |

**响应式模式:**

```vue
<template>
  <!-- 1. 基于屏幕尺寸(默认) -->
  <AFormInput
    v-model="form.userName"
    :span="{ md: 12 }"
    responsive-mode="screen"
  />

  <!-- 2. 基于容器尺寸(弹窗场景推荐) -->
  <el-dialog v-model="visible" width="800px">
    <el-form :model="form">
      <AFormInput
        v-model="form.userName"
        :span="{ md: 12 }"
        responsive-mode="container"
      />
    </el-form>
  </el-dialog>

  <!-- 3. 基于 AModal 尺寸 -->
  <AModal v-model="visible" size="medium">
    <el-form :model="form">
      <AFormInput
        v-model="form.userName"
        :span="{ md: 12 }"
        responsive-mode="modal-size"
        modal-size="medium"
      />
    </el-form>
  </AModal>
</template>
```

#### 插槽使用

```vue
<template>
  <el-form :model="form">
    <!-- 前缀/后缀内容 -->
    <AFormInput v-model="form.website" label="网站">
      <template #prepend>https://</template>
      <template #append>.com</template>
    </AFormInput>

    <!-- 前缀/后缀图标 -->
    <AFormInput v-model="form.search" label="搜索">
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template #suffix>
        <el-icon><Close /></el-icon>
      </template>
    </AFormInput>

    <!-- 后缀按钮 -->
    <AFormInput v-model="form.code" label="验证码">
      <template #append>
        <el-button @click="sendCode">发送验证码</el-button>
      </template>
    </AFormInput>
  </el-form>
</template>
```

#### 高级功能

**提示信息:**

```vue
<template>
  <el-form :model="form">
    <AFormInput
      v-model="form.userName"
      label="用户名"
      tooltip="用户名长度为 4-20 个字符,只能包含字母、数字和下划线"
    />
  </el-form>
</template>
```

**不含表单项容器:**

```vue
<template>
  <!-- 用于搜索栏等不需要表单项容器的场景 -->
  <AFormInput
    v-model="queryParams.keyword"
    placeholder="请输入关键词"
    :show-form-item="false"
  />
</template>
```

**自定义标签宽度:**

```vue
<template>
  <el-form :model="form">
    <!-- 单个组件自定义标签宽度 -->
    <AFormInput
      v-model="form.userName"
      label="用户名"
      label-width="120px"
    />
  </el-form>
</template>
```

#### API

**Props:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number` | - |
| label | 标签文本 | `string` | - |
| prop | 表单域字段名 | `string` | - |
| type | 输入框类型 | `'text' \| 'textarea' \| 'number' \| 'password'` | `'text'` |
| placeholder | 占位符 | `string` | 自动生成 |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | - |
| showFormItem | 是否显示表单项容器 | `boolean` | `true` |
| clearable | 是否可清除 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| maxlength | 最大长度 | `number` | `255` |
| showWordLimit | 是否显示字数统计 | `boolean` | `false` |
| showPassword | 是否显示密码切换按钮 | `boolean` | `false` |
| preventAutofill | 防自动填充 | `boolean` | `false` |
| tooltip | 提示信息 | `string` | - |
| labelWidth | 标签宽度 | `string \| number` | - |
| size | 组件尺寸 | `'large' \| 'default' \| 'small'` | - |
| rows | 文本域行数 | `number` | `3` |
| autosize | 文本域自适应高度 | `{ minRows?: number, maxRows?: number }` | `{ minRows: 2, maxRows: 30 }` |
| min | 数字最小值 | `number` | - |
| max | 数字最大值 | `number` | - |
| step | 数字步长 | `number` | `1` |
| stepStrictly | 是否只能输入步长倍数 | `boolean` | `false` |
| precision | 数字精度 | `number` | - |
| controls | 是否显示数字控制按钮 | `boolean` | `true` |
| controlsPosition | 控制按钮位置 | `'' \| 'right'` | - |

**Events:**

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `(value: string \| number) => void` |
| input | 输入时触发 | `(value: string \| number) => void` |
| blur | 失焦时触发 | `(event: FocusEvent) => void` |
| change | 值改变时触发 | `(value: string \| number) => void` |
| enter | 按下回车时触发 | `(value: string \| number) => void` |
| clear | 清除时触发 | `() => void` |

**Slots:**

| 插槽名 | 说明 |
|--------|------|
| prepend | 输入框前置内容 |
| append | 输入框后置内容 |
| prefix | 输入框头部图标 |
| suffix | 输入框尾部图标 |

---

### 2. AFormSelect - 下拉选择组件

#### 组件说明

`AFormSelect` 是下拉选择组件,基于 Element Plus 的 `el-select` 封装。支持单选、多选、搜索、远程搜索、自定义选项等功能。

#### 基础用法

**单选:**

```vue
<template>
  <el-form :model="form">
    <AFormSelect
      v-model="form.status"
      label="状态"
      prop="status"
      :options="statusOptions"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  status: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**多选:**

```vue
<template>
  <el-form :model="form">
    <AFormSelect
      v-model="form.roles"
      label="角色"
      prop="roles"
      multiple
      :options="roleOptions"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  roles: [] as string[]
})

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '访客', value: 'guest' }
]
</script>
```

**可搜索:**

```vue
<template>
  <el-form :model="form">
    <AFormSelect
      v-model="form.city"
      label="城市"
      prop="city"
      filterable
      :options="cityOptions"
    />
  </el-form>
</template>
```

**可清空:**

```vue
<template>
  <el-form :model="form">
    <AFormSelect
      v-model="form.type"
      label="类型"
      prop="type"
      clearable
      :options="typeOptions"
    />
  </el-form>
</template>
```

#### 字典数据支持

**使用字典数据:**

```vue
<template>
  <el-form :model="form">
    <!-- 通过 dict-type 自动加载字典数据 -->
    <AFormSelect
      v-model="form.status"
      label="状态"
      prop="status"
      dict-type="sys_normal_disable"
    />

    <!-- 通过 options 手动传入选项 -->
    <AFormSelect
      v-model="form.gender"
      label="性别"
      prop="gender"
      :options="dictStore.getDict('sys_user_sex')"
    />
  </el-form>
</template>

<script setup lang="ts">
import { useDictStore } from '@/stores/dict'

const dictStore = useDictStore()

const form = reactive({
  status: '',
  gender: ''
})
</script>
```

#### 远程搜索

```vue
<template>
  <el-form :model="form">
    <AFormSelect
      v-model="form.userId"
      label="用户"
      prop="userId"
      filterable
      remote
      :remote-method="remoteSearchUser"
      :loading="loading"
      :options="userOptions"
    />
  </el-form>
</template>

<script setup lang="ts">
import { getUserList } from '@/api/system/user'

const form = reactive({
  userId: ''
})

const loading = ref(false)
const userOptions = ref([])

const remoteSearchUser = async (query: string) => {
  if (query) {
    loading.value = true
    try {
      const res = await getUserList({ userName: query })
      userOptions.value = res.rows.map(user => ({
        label: user.userName,
        value: user.userId
      }))
    } finally {
      loading.value = false
    }
  } else {
    userOptions.value = []
  }
}
</script>
```

#### 自定义选项模板

```vue
<template>
  <el-form :model="form">
    <AFormSelect
      v-model="form.userId"
      label="用户"
      :options="userOptions"
    >
      <template #default="{ option }">
        <div class="flex items-center">
          <el-avatar :size="24" :src="option.avatar" class="mr-2" />
          <span>{{ option.label }}</span>
          <el-tag v-if="option.isAdmin" type="danger" size="small" class="ml-2">
            管理员
          </el-tag>
        </div>
      </template>
    </AFormSelect>
  </el-form>
</template>
```

#### API

**Props:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| array` | - |
| label | 标签文本 | `string` | - |
| prop | 表单域字段名 | `string` | - |
| options | 选项数据 | `Array<{ label: string, value: any }>` | `[]` |
| multiple | 是否多选 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `true` |
| filterable | 是否可搜索 | `boolean` | `false` |
| remote | 是否远程搜索 | `boolean` | `false` |
| remoteMethod | 远程搜索方法 | `(query: string) => void` | - |
| loading | 是否加载中 | `boolean` | `false` |
| dictType | 字典类型 | `string` | - |
| span | 栅格列数 | `number \| ResponsiveSpan` | - |

**Events:**

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `(value: any) => void` |
| change | 值改变时触发 | `(value: any) => void` |
| blur | 失焦时触发 | `(event: FocusEvent) => void` |
| focus | 聚焦时触发 | `(event: FocusEvent) => void` |
| clear | 清除时触发 | `() => void` |

---

### 3. AFormDate - 日期选择组件

#### 组件说明

`AFormDate` 是日期时间选择组件,基于 Element Plus 的 `el-date-picker` 封装。支持日期、日期范围、日期时间、日期时间范围等多种选择模式。

#### 基础用法

**日期选择:**

```vue
<template>
  <el-form :model="form">
    <!-- 日期选择 -->
    <AFormDate
      v-model="form.birthday"
      label="生日"
      prop="birthday"
      type="date"
    />

    <!-- 日期时间选择 -->
    <AFormDate
      v-model="form.createTime"
      label="创建时间"
      prop="createTime"
      type="datetime"
    />

    <!-- 年份选择 -->
    <AFormDate
      v-model="form.year"
      label="年份"
      prop="year"
      type="year"
    />

    <!-- 月份选择 -->
    <AFormDate
      v-model="form.month"
      label="月份"
      prop="month"
      type="month"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  birthday: '',
  createTime: '',
  year: '',
  month: ''
})
</script>
```

**日期范围选择:**

```vue
<template>
  <el-form :model="form">
    <!-- 日期范围 -->
    <AFormDate
      v-model="form.dateRange"
      label="日期范围"
      type="daterange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />

    <!-- 日期时间范围 -->
    <AFormDate
      v-model="form.datetimeRange"
      label="时间范围"
      type="datetimerange"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
    />

    <!-- 月份范围 -->
    <AFormDate
      v-model="form.monthRange"
      label="月份范围"
      type="monthrange"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  dateRange: [],
  datetimeRange: [],
  monthRange: []
})
</script>
```

#### 日期格式化

```vue
<template>
  <el-form :model="form">
    <!-- 自定义显示格式 -->
    <AFormDate
      v-model="form.date"
      label="日期"
      format="YYYY年MM月DD日"
      value-format="YYYY-MM-DD"
    />

    <!-- 日期时间格式 -->
    <AFormDate
      v-model="form.datetime"
      label="日期时间"
      type="datetime"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
    />
  </el-form>
</template>
```

**格式说明:**

- `format`: 显示在输入框中的格式
- `value-format`: v-model 绑定值的格式

**常用格式:**

| 格式 | 说明 | 示例 |
|------|------|------|
| YYYY | 四位年份 | 2024 |
| MM | 两位月份 | 01-12 |
| DD | 两位日期 | 01-31 |
| HH | 24小时制小时 | 00-23 |
| mm | 分钟 | 00-59 |
| ss | 秒 | 00-59 |

#### 日期限制

```vue
<template>
  <el-form :model="form">
    <!-- 禁用今天之前的日期 -->
    <AFormDate
      v-model="form.futureDate"
      label="未来日期"
      :disabled-date="disablePastDate"
    />

    <!-- 禁用今天之后的日期 -->
    <AFormDate
      v-model="form.pastDate"
      label="过去日期"
      :disabled-date="disableFutureDate"
    />

    <!-- 限制日期范围 -->
    <AFormDate
      v-model="form.rangeDate"
      label="范围日期"
      :disabled-date="disableDateRange"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  futureDate: '',
  pastDate: '',
  rangeDate: ''
})

// 禁用今天之前的日期
const disablePastDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 禁用今天之后的日期
const disableFutureDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 限制日期范围(最近 30 天)
const disableDateRange = (time: Date) => {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  return time.getTime() < thirtyDaysAgo || time.getTime() > now
}
</script>
```

#### 快捷选项

```vue
<template>
  <el-form :model="form">
    <AFormDate
      v-model="form.dateRange"
      label="日期范围"
      type="daterange"
      :shortcuts="shortcuts"
    />
  </el-form>
</template>

<script setup lang="ts">
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 7 * 24 * 60 * 60 * 1000)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 90 * 24 * 60 * 60 * 1000)
      return [start, end]
    }
  }
]
</script>
```

---

### 4. AFormRadio - 单选框组件

#### 组件说明

`AFormRadio` 是单选框组件,基于 Element Plus 的 `el-radio-group` 封装。支持按钮样式、禁用选项、字典数据等功能。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 基础单选 -->
    <AFormRadio
      v-model="form.gender"
      label="性别"
      prop="gender"
      :options="genderOptions"
    />

    <!-- 按钮样式 -->
    <AFormRadio
      v-model="form.type"
      label="类型"
      prop="type"
      button
      :options="typeOptions"
    />

    <!-- 使用字典数据 -->
    <AFormRadio
      v-model="form.status"
      label="状态"
      prop="status"
      dict-type="sys_normal_disable"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  gender: '1',
  type: '1',
  status: '0'
})

const genderOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' }
]

const typeOptions = [
  { label: '类型一', value: '1' },
  { label: '类型二', value: '2' },
  { label: '类型三', value: '3' }
]
</script>
```

---

### 5. AFormCheckbox - 复选框组件

#### 组件说明

`AFormCheckbox` 是复选框组件,基于 Element Plus 的 `el-checkbox-group` 封装。支持全选、限制选择数量、按钮样式等功能。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 基础复选 -->
    <AFormCheckbox
      v-model="form.hobbies"
      label="爱好"
      prop="hobbies"
      :options="hobbyOptions"
    />

    <!-- 按钮样式 -->
    <AFormCheckbox
      v-model="form.permissions"
      label="权限"
      prop="permissions"
      button
      :options="permissionOptions"
    />

    <!-- 限制选择数量 -->
    <AFormCheckbox
      v-model="form.skills"
      label="技能"
      prop="skills"
      :min="1"
      :max="3"
      :options="skillOptions"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  hobbies: [] as string[],
  permissions: [] as string[],
  skills: [] as string[]
})

const hobbyOptions = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
  { label: '旅行', value: 'travel' }
]

const permissionOptions = [
  { label: '查看', value: 'view' },
  { label: '新增', value: 'create' },
  { label: '编辑', value: 'edit' },
  { label: '删除', value: 'delete' }
]

const skillOptions = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Node.js', value: 'nodejs' }
]
</script>
```

---

### 6. AFormSwitch - 开关组件

#### 组件说明

`AFormSwitch` 是开关组件,基于 Element Plus 的 `el-switch` 封装。常用于启用/禁用、显示/隐藏等二元状态切换。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 基础开关 -->
    <AFormSwitch
      v-model="form.enabled"
      label="启用状态"
      prop="enabled"
    />

    <!-- 自定义文字 -->
    <AFormSwitch
      v-model="form.visible"
      label="是否显示"
      prop="visible"
      active-text="显示"
      inactive-text="隐藏"
    />

    <!-- 自定义值 -->
    <AFormSwitch
      v-model="form.status"
      label="状态"
      prop="status"
      active-value="1"
      inactive-value="0"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  enabled: true,
  visible: false,
  status: '0'
})
</script>
```

---

### 7. AFormCascader - 级联选择组件

#### 组件说明

`AFormCascader` 是级联选择组件,基于 Element Plus 的 `el-cascader` 封装。适用于省市区选择、部门选择等层级数据选择场景。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 基础级联 -->
    <AFormCascader
      v-model="form.region"
      label="地区"
      prop="region"
      :options="regionOptions"
    />

    <!-- 可搜索 -->
    <AFormCascader
      v-model="form.dept"
      label="部门"
      prop="dept"
      filterable
      :options="deptOptions"
    />

    <!-- 仅显示最后一级 -->
    <AFormCascader
      v-model="form.category"
      label="分类"
      prop="category"
      :show-all-levels="false"
      :options="categoryOptions"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  region: [],
  dept: [],
  category: []
})

const regionOptions = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [
          { label: '西湖区', value: 'xihu' },
          { label: '上城区', value: 'shangcheng' }
        ]
      }
    ]
  }
]
</script>
```

---

### 8. AFormTreeSelect - 树形选择组件

#### 组件说明

`AFormTreeSelect` 是树形选择组件,基于 Element Plus 的 `el-tree-select` 封装。适用于部门选择、菜单选择等树形结构数据选择。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 基础树形选择 -->
    <AFormTreeSelect
      v-model="form.deptId"
      label="部门"
      prop="deptId"
      :data="deptTree"
      node-key="id"
      :props="{ label: 'name', children: 'children' }"
    />

    <!-- 可搜索 -->
    <AFormTreeSelect
      v-model="form.menuId"
      label="菜单"
      prop="menuId"
      filterable
      :data="menuTree"
    />

    <!-- 多选 -->
    <AFormTreeSelect
      v-model="form.roleIds"
      label="角色"
      prop="roleIds"
      multiple
      :data="roleTree"
    />
  </el-form>
</template>
```

---

### 9. AFormFileUpload - 文件上传组件

#### 组件说明

`AFormFileUpload` 是文件上传组件,支持多文件上传、拖拽上传、文件类型限制、文件大小限制等功能。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 基础文件上传 -->
    <AFormFileUpload
      v-model="form.file"
      label="附件"
      prop="file"
    />

    <!-- 多文件上传 -->
    <AFormFileUpload
      v-model="form.files"
      label="多个附件"
      prop="files"
      multiple
      :limit="5"
    />

    <!-- 限制文件类型 -->
    <AFormFileUpload
      v-model="form.document"
      label="文档"
      prop="document"
      accept=".pdf,.doc,.docx"
    />

    <!-- 限制文件大小 -->
    <AFormFileUpload
      v-model="form.attachment"
      label="附件"
      prop="attachment"
      :file-size="10"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  file: '',
  files: [],
  document: '',
  attachment: ''
})
</script>
```

---

### 10. AFormImgUpload - 图片上传组件

#### 组件说明

`AFormImgUpload` 是图片上传组件,支持图片预览、裁剪、多图上传等功能。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <!-- 单图上传 -->
    <AFormImgUpload
      v-model="form.avatar"
      label="头像"
      prop="avatar"
    />

    <!-- 多图上传 -->
    <AFormImgUpload
      v-model="form.images"
      label="相册"
      prop="images"
      multiple
      :limit="9"
    />

    <!-- 限制图片尺寸 -->
    <AFormImgUpload
      v-model="form.banner"
      label="横幅图"
      prop="banner"
      :width="1920"
      :height="500"
    />
  </el-form>
</template>
```

---

### 11. AFormEditor - 富文本编辑器组件

#### 组件说明

`AFormEditor` 是富文本编辑器组件,适用于文章内容、公告内容等富文本编辑场景。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <AFormEditor
      v-model="form.content"
      label="内容"
      prop="content"
      :height="400"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  content: ''
})
</script>
```

---

### 12. AFormMap - 地图选点组件

#### 组件说明

`AFormMap` 是地图选点组件,用于选择地理位置坐标。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <AFormMap
      v-model="form.location"
      label="地址"
      prop="location"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  location: { lng: 120.153576, lat: 30.287459 }
})
</script>
```

---

### 13. AFormInputWithAi - AI 增强输入组件

#### 组件说明

`AFormInputWithAi` 是 AI 增强输入组件,集成 AI 辅助功能,帮助用户快速生成文本内容。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <AFormInputWithAi
      v-model="form.description"
      label="描述"
      prop="description"
      type="textarea"
      ai-prompt="请根据关键词生成产品描述"
    />
  </el-form>
</template>
```

---

## 最佳实践

### 1. 表单布局设计

**栅格布局:**

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="20">
      <!-- 两列布局 -->
      <AFormInput v-model="form.userName" label="用户名" :span="12" />
      <AFormInput v-model="form.nickName" label="昵称" :span="12" />

      <!-- 三列布局 -->
      <AFormInput v-model="form.phone" label="电话" :span="8" />
      <AFormInput v-model="form.email" label="邮箱" :span="8" />
      <AFormSelect v-model="form.gender" label="性别" :span="8" :options="genderOptions" />

      <!-- 全宽布局 -->
      <AFormInput v-model="form.address" label="地址" :span="24" />
    </el-row>
  </el-form>
</template>
```

**响应式布局:**

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <!-- 手机:1列, 平板:2列, 桌面:3列 -->
      <AFormInput
        v-model="form.field1"
        :span="{ xs: 24, sm: 12, md: 8 }"
      />
      <AFormInput
        v-model="form.field2"
        :span="{ xs: 24, sm: 12, md: 8 }"
      />
      <AFormInput
        v-model="form.field3"
        :span="{ xs: 24, sm: 24, md: 8 }"
      />
    </el-row>
  </el-form>
</template>
```

### 2. 表单校验

**基础校验:**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormInput
      v-model="form.userName"
      label="用户名"
      prop="userName"
    />

    <AFormInput
      v-model="form.email"
      label="邮箱"
      prop="email"
    />

    <AFormInput
      v-model="form.phone"
      label="电话"
      prop="phone"
    />
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: '',
  email: '',
  phone: ''
})

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value?.validate()
  // 提交逻辑
}
</script>
```

**自定义校验:**

```vue
<script setup lang="ts">
// 自定义密码校验
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于 6 位'))
  } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

// 确认密码校验
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}
</script>
```

### 3. 表单联动

**选项联动:**

```vue
<template>
  <el-form :model="form">
    <!-- 省份选择 -->
    <AFormSelect
      v-model="form.provinceId"
      label="省份"
      :options="provinceOptions"
      @change="handleProvinceChange"
    />

    <!-- 城市选择(根据省份动态加载) -->
    <AFormSelect
      v-model="form.cityId"
      label="城市"
      :options="cityOptions"
      :disabled="!form.provinceId"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  provinceId: '',
  cityId: ''
})

const provinceOptions = ref([])
const cityOptions = ref([])

const handleProvinceChange = async (provinceId: string) => {
  // 重置城市选择
  form.cityId = ''
  // 加载城市列表
  cityOptions.value = await getCityList(provinceId)
}
</script>
```

**显示/隐藏联动:**

```vue
<template>
  <el-form :model="form">
    <AFormRadio
      v-model="form.type"
      label="类型"
      :options="typeOptions"
    />

    <!-- 根据类型显示不同的字段 -->
    <AFormInput
      v-if="form.type === '1'"
      v-model="form.option1"
      label="选项1"
    />

    <AFormInput
      v-if="form.type === '2'"
      v-model="form.option2"
      label="选项2"
    />
  </el-form>
</template>
```

### 4. 表单重置和回显

**表单重置:**

```vue
<template>
  <el-form :model="form" ref="formRef">
    <AFormInput v-model="form.userName" label="用户名" prop="userName" />
    <AFormInput v-model="form.email" label="邮箱" prop="email" />

    <el-button @click="handleReset">重置</el-button>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: '',
  email: ''
})

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

**表单回显:**

```vue
<script setup lang="ts">
import { getUserInfo } from '@/api/system/user'

const form = reactive({
  userId: '',
  userName: '',
  email: '',
  phone: ''
})

// 编辑时回显数据
const handleEdit = async (userId: string) => {
  const data = await getUserInfo(userId)
  // 使用 Object.assign 回显数据
  Object.assign(form, data)
}
</script>
```

### 5. 性能优化

**按需加载组件:**

```typescript
// 异步加载富文本编辑器
const AFormEditor = defineAsyncComponent(() =>
  import('@/components/AForm/AFormEditor.vue')
)
```

**大表单分步加载:**

```vue
<template>
  <el-steps :active="currentStep">
    <el-step title="基本信息" />
    <el-step title="详细信息" />
    <el-step title="附加信息" />
  </el-steps>

  <!-- 步骤 1 -->
  <el-form v-if="currentStep === 0" :model="form">
    <AFormInput v-model="form.userName" label="用户名" />
    <AFormInput v-model="form.email" label="邮箱" />
  </el-form>

  <!-- 步骤 2 -->
  <el-form v-if="currentStep === 1" :model="form">
    <AFormInput v-model="form.address" label="地址" />
    <AFormInput v-model="form.company" label="公司" />
  </el-form>

  <!-- 步骤 3 -->
  <el-form v-if="currentStep === 2" :model="form">
    <AFormImgUpload v-model="form.avatar" label="头像" />
    <AFormFileUpload v-model="form.attachment" label="附件" />
  </el-form>
</template>
```

---

## 常见问题

### 1. 表单项不显示

**问题描述:**

使用表单组件后,页面上不显示任何内容。

**原因分析:**

- 没有设置 `span` 属性且没有包裹在 `el-row` 中
- `showFormItem` 设置为 `false` 但没有提供布局容器
- 组件导入路径错误

**解决方案:**

```vue
<!-- ❌ 错误:没有 span 且没有 el-row -->
<el-form :model="form">
  <AFormInput v-model="form.userName" label="用户名" />
</el-form>

<!-- ✅ 正确:添加 span 或 el-row -->
<el-form :model="form">
  <el-row :gutter="20">
    <AFormInput v-model="form.userName" label="用户名" :span="24" />
  </el-row>
</el-form>

<!-- ✅ 或者:不使用 span -->
<el-form :model="form">
  <AFormInput v-model="form.userName" label="用户名" :show-form-item="true" />
</el-form>
```

### 2. 响应式布局不生效

**问题描述:**

设置了响应式 `span`,但在不同屏幕尺寸下没有变化。

**原因分析:**

- 响应式模式设置错误
- 在弹窗中使用了 `screen` 模式
- 父容器宽度限制导致断点判断错误

**解决方案:**

```vue
<!-- ❌ 错误:弹窗中使用 screen 模式 -->
<el-dialog v-model="visible">
  <AFormInput
    v-model="form.userName"
    :span="{ md: 12 }"
    responsive-mode="screen"
  />
</el-dialog>

<!-- ✅ 正确:弹窗中使用 container 或 modal-size 模式 -->
<el-dialog v-model="visible" width="800px">
  <AFormInput
    v-model="form.userName"
    :span="{ md: 12 }"
    responsive-mode="container"
  />
</el-dialog>

<!-- ✅ 或者:使用 AModal -->
<AModal v-model="visible" size="medium">
  <AFormInput
    v-model="form.userName"
    :span="{ md: 12 }"
    responsive-mode="modal-size"
    modal-size="medium"
  />
</AModal>
```

### 3. v-model 双向绑定失效

**问题描述:**

修改表单值后,界面不更新或者界面修改后数据不更新。

**原因分析:**

- 使用了普通对象而不是响应式对象
- 属性名拼写错误
- 嵌套对象没有响应式

**解决方案:**

```vue
<script setup lang="ts">
// ❌ 错误:普通对象
let form = {
  userName: ''
}

// ✅ 正确:使用 reactive
const form = reactive({
  userName: ''
})

// ✅ 或者:使用 ref
const userName = ref('')

// ❌ 错误:嵌套对象不响应式
const form = reactive({
  user: {
    name: ''  // 这个对象本身不是响应式的
  }
})

// ✅ 正确:使用 toRef 或完整响应式
const form = reactive({
  user: reactive({
    name: ''
  })
})
</script>
```

### 4. 表单校验不触发

**问题描述:**

设置了校验规则,但提交时不进行校验。

**原因分析:**

- `prop` 属性未设置或与 `rules` 中的键名不匹配
- 没有调用 `validate` 方法
- 校验规则配置错误

**解决方案:**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <!-- ❌ 错误:没有 prop -->
    <AFormInput v-model="form.userName" label="用户名" />

    <!-- ✅ 正确:添加 prop -->
    <AFormInput v-model="form.userName" label="用户名" prop="userName" />

    <el-button @click="handleSubmit">提交</el-button>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: ''
})

const rules: FormRules = {
  // ✅ 键名必须与 prop 一致
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  // ✅ 提交前进行校验
  try {
    await formRef.value?.validate()
    // 校验通过,提交数据
    console.log('提交数据:', form)
  } catch (error) {
    // 校验失败
    console.error('校验失败')
  }
}
</script>
```

### 5. 密码被浏览器自动填充

**问题描述:**

密码输入框被浏览器自动填充,影响用户体验。

**原因分析:**

浏览器的自动填充功能会记住密码并自动填入。

**解决方案:**

```vue
<template>
  <el-form :model="form">
    <!-- ✅ 使用 prevent-autofill 属性 -->
    <AFormInput
      v-model="form.password"
      label="密码"
      prop="password"
      type="password"
      show-password
      prevent-autofill
    />

    <!-- ✅ 或者添加假的密码框(隐藏) -->
    <input type="password" style="display:none" />
    <AFormInput
      v-model="form.password"
      label="密码"
      type="password"
      show-password
    />
  </el-form>
</template>
```

### 6. 下拉选择选项不显示

**问题描述:**

AFormSelect 组件下拉列表为空或选项不显示。

**原因分析:**

- `options` 数据格式错误
- 选项的 `label` 和 `value` 字段名不匹配
- 异步数据未正确加载

**解决方案:**

```vue
<template>
  <el-form :model="form">
    <!-- ❌ 错误:数据格式不正确 -->
    <AFormSelect
      v-model="form.status"
      :options="['选项1', '选项2']"
    />

    <!-- ✅ 正确:使用对象数组 -->
    <AFormSelect
      v-model="form.status"
      :options="[
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]"
    />

    <!-- ✅ 或者:使用字典数据 -->
    <AFormSelect
      v-model="form.status"
      dict-type="sys_normal_disable"
    />
  </el-form>
</template>
```

---

## 总结

### 核心优势

1. **统一封装** - 基于 Element Plus 二次封装,API 设计一致
2. **响应式布局** - 支持多种响应式模式,适应不同场景
3. **开箱即用** - 内置表单项容器,自动处理标签、校验、提示
4. **功能丰富** - 支持字典数据、国际化、AI 增强等高级功能
5. **灵活扩展** - 支持插槽、自定义模板、事件监听等扩展方式

### 使用建议

1. **合理使用响应式** - 根据场景选择合适的响应式模式
2. **统一表单校验** - 使用 FormRules 统一管理校验规则
3. **优化大表单** - 使用分步表单、按需加载减少性能开销
4. **规范属性配置** - 保持 prop、label 等属性命名一致性
5. **注重用户体验** - 合理使用提示信息、防自动填充等功能

### 学习路径

1. **基础阶段** - 掌握常用表单组件的基本用法
2. **进阶阶段** - 学习响应式布局、表单校验、联动等功能
3. **高级阶段** - 了解组件设计原理、性能优化、自定义扩展

通过合理使用表单组件体系,可以大幅提升表单开发效率,减少重复代码,提供一致的用户体验。