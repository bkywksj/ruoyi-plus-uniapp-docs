# 搜索表单 (ASearchForm)

## 介绍

ASearchForm 是 RuoYi-Plus 前端项目中的核心搜索组件，专为列表页面的数据筛选场景设计。该组件封装了搜索表单的常见功能，包括显示隐藏控制、展开收起、动画效果等，极大地提升了开发效率和用户体验。

**核心特性：**

- **v-model 双向绑定** - 支持表单数据的双向绑定，自动同步查询参数
- **智能展开收起** - 当表单项超过2行时，自动显示展开/收起按钮，优化页面空间利用
- **显示隐藏控制** - 通过 `visible` 属性控制搜索表单的显示/隐藏，配合工具栏按钮使用
- **流畅动画效果** - 内置渐入渐出动画，提供流畅的交互体验
- **灵活布局配置** - 支持行内表单和垂直表单，可自定义标签宽度和位置
- **响应式计算** - 自动监测表单项数量和窗口变化，智能计算表单行数
- **丰富的插槽** - 提供 header 插槽，支持自定义表头内容
- **方法暴露** - 暴露 `resetFields`、`expand`、`collapse` 等方法供父组件调用

**适用场景：**

- 列表页面的数据筛选
- 复杂查询条件的管理
- 需要展开收起功能的搜索表单
- 需要动画效果的表单容器

## 基本用法

### 简单搜索表单

最基础的用法，创建一个带标题的搜索表单。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams" title="搜索条件">
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名"
          clearable
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 查询参数
const queryParams = ref({
  userName: '',
  phone: '',
  pageNum: 1,
  pageSize: 10
})

// 查询列表
const handleQuery = () => {
  console.log('查询参数:', queryParams.value)
  // 调用API查询数据
}

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    userName: '',
    phone: '',
    pageNum: 1,
    pageSize: 10
  }
  handleQuery()
}
</script>
```

**使用说明：**
- 使用 `v-model` 绑定查询参数对象
- `title` 属性设置表单标题，显示在卡片头部
- 表单项使用 Element Plus 的 `el-form-item` 组件
- 默认为行内表单（`inline="true"`）

### 控制显示隐藏

通过 `visible` 属性控制搜索表单的显示和隐藏，通常配合工具栏的搜索按钮使用。

```vue
<template>
  <div>
    <!-- 搜索表单 -->
    <ASearchForm v-model="queryParams" :visible="showSearch" title="搜索条件">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
    </ASearchForm>

    <!-- 工具栏 -->
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              :icon="showSearch ? 'ArrowUp' : 'ArrowDown'"
              @click="showSearch = !showSearch"
            >
              {{ showSearch ? '隐藏搜索' : '显示搜索' }}
            </el-button>
          </el-col>
        </el-row>
      </template>

      <!-- 表格内容 -->
      <el-table :data="tableData">
        <!-- ... -->
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showSearch = ref(true)
const queryParams = ref({
  userName: '',
  status: ''
})
const tableData = ref([])
</script>
```

**使用说明：**
- `visible` 属性控制表单的显示/隐藏
- 内置渐入渐出动画，过渡效果流畅
- 通常将 `showSearch` 状态存储在父组件中
- 可通过工具栏按钮切换显示状态

### 使用 AForm 系列组件

推荐使用 AForm 系列组件（AFormInput、AFormSelect 等）简化表单项的编写。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams" :visible="showSearch">
      <AFormInput
        v-model="queryParams.userName"
        label="用户名"
        prop="userName"
        placeholder="请输入用户名"
      />
      <AFormInput
        v-model="queryParams.phone"
        label="手机号"
        prop="phone"
        placeholder="请输入手机号"
      />
      <AFormSelect
        v-model="queryParams.status"
        label="状态"
        prop="status"
        :options="statusOptions"
      />
      <AFormDate
        v-model="dateRange"
        label="创建时间"
        prop="createTime"
        type="daterange"
      />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showSearch = ref(true)
const queryParams = ref({
  userName: '',
  phone: '',
  status: '',
  beginTime: '',
  endTime: ''
})

const dateRange = ref<[Date, Date]>()

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**使用说明：**
- AForm 系列组件自动处理标签、占位符、清空按钮等
- 组件内部已集成 `el-form-item`，无需手动包裹
- 支持响应式布局，自动适配不同屏幕尺寸
- 代码更简洁，开发效率更高

### 带自定义头部

使用 `header` 插槽自定义表单头部内容。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon code="search" class="text-primary" />
            <span class="font-bold">高级搜索</span>
          </div>
          <div>
            <el-button size="small" @click="handleReset">重置</el-button>
            <el-button size="small" type="primary" @click="handleQuery">
              查询
            </el-button>
          </div>
        </div>
      </template>

      <AFormInput v-model="queryParams.keyword" label="关键词" prop="keyword" />
      <AFormSelect v-model="queryParams.category" label="分类" prop="category" :options="categoryOptions" />
      <AFormDate v-model="dateRange" label="日期" prop="date" type="daterange" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const queryParams = ref({
  keyword: '',
  category: '',
  beginTime: '',
  endTime: ''
})

const dateRange = ref<[Date, Date]>()

const categoryOptions = [
  { label: '技术', value: '1' },
  { label: '产品', value: '2' },
  { label: '设计', value: '3' }
]

const handleQuery = () => {
  console.log('查询:', queryParams.value)
}

const handleReset = () => {
  queryParams.value = {
    keyword: '',
    category: '',
    beginTime: '',
    endTime: ''
  }
  dateRange.value = undefined
}
</script>
```

**使用说明：**
- 使用 `header` 插槽完全自定义头部内容
- 可以在头部添加操作按钮、图标等元素
- 适合需要复杂头部布局的场景

## 展开收起功能

### 自动展开收起

当表单项超过2行时，自动显示展开/收起按钮。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams" title="搜索条件">
      <!-- 第一行 -->
      <AFormInput v-model="queryParams.userName" label="用户名" prop="userName" />
      <AFormInput v-model="queryParams.nickName" label="昵称" prop="nickName" />
      <AFormInput v-model="queryParams.email" label="邮箱" prop="email" />

      <!-- 第二行 -->
      <AFormInput v-model="queryParams.phone" label="手机号" prop="phone" />
      <AFormSelect v-model="queryParams.status" label="状态" prop="status" :options="statusOptions" />
      <AFormSelect v-model="queryParams.deptId" label="部门" prop="deptId" :options="deptOptions" />

      <!-- 第三行 -->
      <AFormDate v-model="dateRange" label="创建时间" prop="createTime" type="daterange" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const queryParams = ref({
  userName: '',
  nickName: '',
  email: '',
  phone: '',
  status: '',
  deptId: ''
})

const dateRange = ref<[Date, Date]>()

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const deptOptions = [
  { label: '研发部', value: '1' },
  { label: '市场部', value: '2' },
  { label: '财务部', value: '3' }
]
</script>
```

**使用说明：**
- 表单项超过2行时，自动显示"展开/收起"按钮
- 收起状态下只显示第一行，并添加渐变遮罩效果
- 点击按钮切换展开/收起状态
- 支持响应式，窗口大小变化时重新计算行数

**技术实现：**
- 使用 MutationObserver 监听表单内容变化
- 通过 offsetTop 计算不同行的表单项
- 使用 Set 统计不同 top 值的数量（即行数）
- 窗口 resize 时重新计算行数

### 默认展开

设置 `default-expanded` 为 `true`，表单默认为展开状态。

```vue
<template>
  <div>
    <ASearchForm
      v-model="queryParams"
      title="搜索条件"
      :default-expanded="true"
    >
      <AFormInput v-model="queryParams.userName" label="用户名" />
      <AFormInput v-model="queryParams.phone" label="手机号" />
      <AFormSelect v-model="queryParams.status" label="状态" :options="statusOptions" />
      <AFormDate v-model="dateRange" label="创建时间" type="daterange" />
      <AFormSelect v-model="queryParams.deptId" label="部门" :options="deptOptions" />
      <AFormInput v-model="queryParams.email" label="邮箱" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const queryParams = ref({
  userName: '',
  phone: '',
  status: '',
  deptId: '',
  email: ''
})

const dateRange = ref<[Date, Date]>()

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const deptOptions = [
  { label: '研发部', value: '1' },
  { label: '市场部', value: '2' }
]
</script>
```

**使用说明：**
- `default-expanded="true"` 设置默认展开
- 用户首次访问页面时，表单为展开状态
- 适合重要的筛选条件需要优先展示的场景

### 禁用展开收起

设置 `collapsible` 为 `false`，禁用展开/收起功能。

```vue
<template>
  <div>
    <ASearchForm
      v-model="queryParams"
      title="搜索条件"
      :collapsible="false"
    >
      <AFormInput v-model="queryParams.userName" label="用户名" />
      <AFormInput v-model="queryParams.phone" label="手机号" />
      <AFormSelect v-model="queryParams.status" label="状态" :options="statusOptions" />
      <AFormDate v-model="dateRange" label="创建时间" type="daterange" />
      <AFormInput v-model="queryParams.email" label="邮箱" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const queryParams = ref({
  userName: '',
  phone: '',
  status: '',
  email: ''
})

const dateRange = ref<[Date, Date]>()

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**使用说明：**
- `collapsible="false"` 禁用展开/收起功能
- 即使表单项超过2行，也不显示展开/收起按钮
- 所有表单项始终完全展示
- 适合表单项较少或必须全部显示的场景

### 手动控制展开收起

通过 ref 调用组件暴露的 `expand` 和 `collapse` 方法手动控制展开收起。

```vue
<template>
  <div>
    <div class="mb-4">
      <el-button @click="expandForm">展开表单</el-button>
      <el-button @click="collapseForm">收起表单</el-button>
    </div>

    <ASearchForm
      ref="searchFormRef"
      v-model="queryParams"
      title="搜索条件"
    >
      <AFormInput v-model="queryParams.userName" label="用户名" />
      <AFormInput v-model="queryParams.phone" label="手机号" />
      <AFormSelect v-model="queryParams.status" label="状态" :options="statusOptions" />
      <AFormDate v-model="dateRange" label="创建时间" type="daterange" />
      <AFormInput v-model="queryParams.email" label="邮箱" />
      <AFormSelect v-model="queryParams.deptId" label="部门" :options="deptOptions" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 搜索表单引用
const searchFormRef = ref()

const queryParams = ref({
  userName: '',
  phone: '',
  status: '',
  email: '',
  deptId: ''
})

const dateRange = ref<[Date, Date]>()

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const deptOptions = [
  { label: '研发部', value: '1' },
  { label: '市场部', value: '2' }
]

// 展开表单
const expandForm = () => {
  searchFormRef.value?.expand()
}

// 收起表单
const collapseForm = () => {
  searchFormRef.value?.collapse()
}
</script>
```

**使用说明：**
- 通过 `ref` 获取组件实例
- 调用 `expand()` 方法展开表单
- 调用 `collapse()` 方法收起表单
- 适合需要编程式控制展开收起的场景

## 布局配置

### 垂直表单布局

设置 `inline` 为 `false`，使用垂直表单布局。

```vue
<template>
  <div>
    <ASearchForm
      v-model="queryParams"
      title="搜索条件"
      :inline="false"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="queryParams.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" class="w-full">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">搜索</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const queryParams = ref({
  userName: '',
  phone: '',
  email: '',
  status: ''
})
</script>
```

**使用说明：**
- `inline="false"` 设置为垂直布局
- `label-width` 设置标签宽度，垂直布局时建议设置固定宽度
- 每个表单项独占一行
- 适合表单项较少或需要更清晰布局的场景

### 标签位置配置

通过 `label-position` 设置标签位置。

```vue
<template>
  <div>
    <div class="mb-4">
      <el-radio-group v-model="labelPosition">
        <el-radio label="left">左对齐</el-radio>
        <el-radio label="right">右对齐</el-radio>
        <el-radio label="top">顶部对齐</el-radio>
      </el-radio-group>
    </div>

    <ASearchForm
      v-model="queryParams"
      title="搜索条件"
      :label-position="labelPosition"
      label-width="100px"
    >
      <AFormInput v-model="queryParams.userName" label="用户名" />
      <AFormInput v-model="queryParams.phone" label="手机号" />
      <AFormSelect v-model="queryParams.status" label="状态" :options="statusOptions" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const labelPosition = ref<'left' | 'right' | 'top'>('right')

const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**使用说明：**
- `label-position="left"` - 标签文本左对齐（标签区域内靠左）
- `label-position="right"` - 标签文本右对齐（标签区域内靠右，默认值）
- `label-position="top"` - 标签位于表单项顶部
- 推荐使用默认的 `right` 对齐，视觉效果更好

### 自定义标签宽度

通过 `label-width` 设置标签宽度。

```vue
<template>
  <div>
    <ASearchForm
      v-model="queryParams"
      title="搜索条件"
      label-width="120px"
    >
      <AFormInput v-model="queryParams.userName" label="用户名称" />
      <AFormInput v-model="queryParams.phoneNumber" label="联系电话" />
      <AFormInput v-model="queryParams.emailAddress" label="电子邮箱地址" />
      <AFormSelect v-model="queryParams.accountStatus" label="账号状态" :options="statusOptions" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const queryParams = ref({
  userName: '',
  phoneNumber: '',
  emailAddress: '',
  accountStatus: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**使用说明：**
- `label-width` 可设置为固定值（如 `120px`）或 `auto`
- 默认为 `auto`，自动计算标签宽度
- 当标签文字长度不一时，建议设置固定宽度保持对齐
- 单位可以是 `px`、`%`、`rem` 等

## 方法调用

### 重置表单

调用 `resetFields` 方法重置表单字段到初始值。

```vue
<template>
  <div>
    <ASearchForm ref="searchFormRef" v-model="queryParams" title="搜索条件">
      <AFormInput v-model="queryParams.userName" label="用户名" prop="userName" />
      <AFormInput v-model="queryParams.phone" label="手机号" prop="phone" />
      <AFormSelect v-model="queryParams.status" label="状态" prop="status" :options="statusOptions" />
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchFormRef = ref()

const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const handleQuery = () => {
  console.log('查询参数:', queryParams.value)
}

const handleReset = () => {
  // 调用 resetFields 方法重置表单
  searchFormRef.value?.resetFields()
  // 重置后重新查询
  handleQuery()
}
</script>
```

**使用说明：**
- 通过 `ref` 获取组件实例
- 调用 `resetFields()` 方法重置所有表单字段
- 重置后会触发 `reset` 事件
- 注意：表单项必须设置 `prop` 属性才能被重置

### 重新计算行数

调用 `calculateFormRows` 方法手动重新计算表单行数。

```vue
<template>
  <div>
    <div class="mb-4">
      <el-button @click="addFormItem">添加表单项</el-button>
      <el-button @click="recalculateRows">重新计算行数</el-button>
    </div>

    <ASearchForm ref="searchFormRef" v-model="queryParams" title="搜索条件">
      <AFormInput v-model="queryParams.userName" label="用户名" />
      <AFormInput v-model="queryParams.phone" label="手机号" />

      <AFormInput
        v-if="showExtraFields"
        v-model="queryParams.email"
        label="邮箱"
      />
      <AFormSelect
        v-if="showExtraFields"
        v-model="queryParams.status"
        label="状态"
        :options="statusOptions"
      />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchFormRef = ref()
const showExtraFields = ref(false)

const queryParams = ref({
  userName: '',
  phone: '',
  email: '',
  status: ''
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const addFormItem = () => {
  showExtraFields.value = true
  // 添加表单项后，重新计算行数
  setTimeout(() => {
    recalculateRows()
  }, 100)
}

const recalculateRows = () => {
  searchFormRef.value?.calculateFormRows()
}
</script>
```

**使用说明：**
- 当动态添加或删除表单项时，可能需要手动重新计算行数
- 调用 `calculateFormRows()` 方法触发重新计算
- 组件内部已自动监听表单项变化，大多数情况下无需手动调用
- 使用 MutationObserver 自动监测 DOM 变化

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 表单数据模型，通过 v-model 绑定 | `Record<string, any>` | `{}` |
| visible | 控制表单显示/隐藏 | `boolean` | `true` |
| inline | 是否行内表单 | `boolean` | `true` |
| labelWidth | 标签宽度 | `string` | `'auto'` |
| labelPosition | 标签位置：`left` - 左对齐、`right` - 右对齐、`top` - 顶部 | `'left' \| 'right' \| 'top'` | `'right'` |
| title | 卡片标题（当没有使用 header 插槽时显示） | `string` | `''` |
| collapsible | 是否启用展开/收起功能（当表单项超过2行时显示） | `boolean` | `true` |
| defaultExpanded | 默认是否展开 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 表单数据更新时触发 | `value: Record<string, any>` |
| reset | 调用 resetFields 方法时触发 | - |

### Methods

通过 ref 调用组件实例的方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| resetFields | 重置表单字段到初始值 | - | - |
| calculateFormRows | 重新计算表单行数 | - | - |
| expand | 展开表单 | - | - |
| collapse | 收起表单 | - | - |
| formRef | 获取 el-form 表单实例 | - | `FormInstance` |

**使用示例：**

```typescript
import { ref } from 'vue'

const searchFormRef = ref()

// 重置表单
searchFormRef.value?.resetFields()

// 重新计算行数
searchFormRef.value?.calculateFormRows()

// 展开表单
searchFormRef.value?.expand()

// 收起表单
searchFormRef.value?.collapse()

// 获取 el-form 实例
const formInstance = searchFormRef.value?.formRef
formInstance?.validate((valid) => {
  if (valid) {
    console.log('表单验证通过')
  }
})
```

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 表单内容插槽，放置表单项 | - |
| header | 卡片头部插槽，自定义表头内容 | - |

**使用示例：**

```vue
<template>
  <ASearchForm v-model="queryParams">
    <!-- header 插槽 -->
    <template #header>
      <div class="custom-header">
        <h3>自定义标题</h3>
        <el-button>操作</el-button>
      </div>
    </template>

    <!-- default 插槽 -->
    <AFormInput v-model="queryParams.userName" label="用户名" />
    <AFormInput v-model="queryParams.phone" label="手机号" />
  </ASearchForm>
</template>
```

## 最佳实践

### 1. 配合 TableToolbar 使用

将搜索表单与表格工具栏配合使用，实现完整的列表页功能。

```vue
<template>
  <div>
    <!-- 搜索表单 -->
    <ASearchForm ref="queryFormRef" v-model="queryParams" :visible="showSearch">
      <AFormInput
        v-model="queryParams.userName"
        label="用户名"
        prop="userName"
        @input="handleQuery"
      />
      <AFormInput
        v-model="queryParams.phone"
        label="手机号"
        prop="phone"
        @input="handleQuery"
      />
      <AFormSelect
        v-model="queryParams.status"
        label="状态"
        prop="status"
        :options="sys_normal_disable"
        @change="handleQuery"
      />
      <AFormDate
        v-model="dateRange"
        label="创建时间"
        prop="createTime"
        type="daterange"
        @change="handleQuery"
      />
    </ASearchForm>

    <!-- 数据表格 -->
    <el-card shadow="hover">
      <!-- 工具栏 -->
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="selectedIds.length !== 1"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="selectedIds.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>

          <!-- TableToolbar 工具栏 -->
          <TableToolbar
            v-model:showSearch="showSearch"
            @refresh="getList"
          />
        </el-row>
      </template>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="用户名" prop="userName" />
        <el-table-column label="手机号" prop="phone" />
        <el-table-column label="状态" prop="status">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleUpdate(row)">
              修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <Pagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 搜索表单引用
const queryFormRef = ref()

// 是否显示搜索
const showSearch = ref(true)

// 加载状态
const loading = ref(false)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phone: '',
  status: '',
  beginTime: '',
  endTime: ''
})

// 日期范围
const dateRange = ref<[Date, Date]>()

// 用户列表数据
const userList = ref([])
const total = ref(0)

// 选中的ID列表
const selectedIds = ref<number[]>([])

// 状态选项
const sys_normal_disable = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    // 处理日期范围
    if (dateRange.value) {
      queryParams.beginTime = dateRange.value[0].toISOString()
      queryParams.endTime = dateRange.value[1].toISOString()
    } else {
      queryParams.beginTime = ''
      queryParams.endTime = ''
    }

    // 调用API
    // const res = await getUserList(queryParams)
    // userList.value = res.rows
    // total.value = res.total
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  dateRange.value = undefined
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 选择改变
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  console.log('新增')
}

// 修改
const handleUpdate = (row?: any) => {
  console.log('修改', row)
}

// 删除
const handleDelete = (row?: any) => {
  console.log('删除', row)
}

// 初始化
getList()
</script>
```

**最佳实践要点：**
- 搜索表单使用 `v-model` 绑定查询参数
- 配合 TableToolbar 组件实现搜索显示/隐藏
- 表单项变化时触发 `@input` 或 `@change` 事件自动搜索
- 使用 `ref` 调用 `resetFields` 方法重置表单
- 日期范围需要单独处理为 `beginTime` 和 `endTime`

### 2. 使用字典数据

在搜索表单中使用字典数据作为选项。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams" :visible="showSearch">
      <AFormSelect
        v-model="queryParams.status"
        label="用户状态"
        prop="status"
        :options="sys_normal_disable"
        dict-type="sys_normal_disable"
      />
      <AFormSelect
        v-model="queryParams.sex"
        label="性别"
        prop="sex"
        :options="sys_user_sex"
        dict-type="sys_user_sex"
      />
      <AFormSelect
        v-model="queryParams.userType"
        label="用户类型"
        prop="userType"
        :options="sys_user_type"
        dict-type="sys_user_type"
      />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 从字典store获取字典数据
const sys_normal_disable = dictStore.getDict('sys_normal_disable')
const sys_user_sex = dictStore.getDict('sys_user_sex')
const sys_user_type = dictStore.getDict('sys_user_type')

const showSearch = ref(true)

const queryParams = ref({
  status: '',
  sex: '',
  userType: ''
})
</script>
```

**最佳实践要点：**
- 使用字典 store 统一管理字典数据
- 字典数据格式为 `{ label: string, value: string }`
- AFormSelect 组件自动适配字典数据格式
- 可以设置 `dict-type` 属性标识字典类型

### 3. 响应式布局适配

使用 AForm 系列组件的响应式布局功能，适配不同屏幕尺寸。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams" :visible="showSearch" title="搜索条件">
      <!-- 使用 span 控制占用列数 -->
      <AFormInput
        v-model="queryParams.userName"
        label="用户名"
        prop="userName"
        :span="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
      />
      <AFormInput
        v-model="queryParams.phone"
        label="手机号"
        prop="phone"
        :span="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
      />
      <AFormSelect
        v-model="queryParams.status"
        label="状态"
        prop="status"
        :options="statusOptions"
        :span="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
      />
      <AFormDate
        v-model="dateRange"
        label="创建时间"
        prop="createTime"
        type="daterange"
        :span="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
      />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showSearch = ref(true)

const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const dateRange = ref<[Date, Date]>()

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**最佳实践要点：**
- 使用 `span` 属性配置响应式布局
- 小屏幕（xs）每行1个表单项，占满24格
- 中屏幕（sm）每行2个表单项，各占12格
- 大屏幕（md、lg、xl）每行4个表单项，各占6格
- 自动适配不同屏幕尺寸，提升用户体验

### 4. 复杂查询条件

处理复杂的查询条件，包括多选、范围查询等。

```vue
<template>
  <div>
    <ASearchForm v-model="queryParams" :visible="showSearch" title="高级搜索">
      <!-- 文本输入 -->
      <AFormInput
        v-model="queryParams.keyword"
        label="关键词"
        prop="keyword"
        placeholder="支持用户名、手机号、邮箱"
      />

      <!-- 单选下拉 -->
      <AFormSelect
        v-model="queryParams.deptId"
        label="部门"
        prop="deptId"
        :options="deptOptions"
        placeholder="请选择部门"
      />

      <!-- 多选下拉 -->
      <AFormSelect
        v-model="queryParams.roleIds"
        label="角色"
        prop="roleIds"
        :options="roleOptions"
        placeholder="请选择角色"
        multiple
      />

      <!-- 日期范围 -->
      <AFormDate
        v-model="createTimeRange"
        label="创建时间"
        prop="createTime"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />

      <!-- 数值范围 -->
      <el-form-item label="年龄范围" class="search-form-item">
        <el-row :gutter="10">
          <el-col :span="11">
            <el-input-number
              v-model="queryParams.minAge"
              :min="0"
              :max="150"
              placeholder="最小年龄"
              class="w-full"
            />
          </el-col>
          <el-col :span="2" class="text-center">-</el-col>
          <el-col :span="11">
            <el-input-number
              v-model="queryParams.maxAge"
              :min="0"
              :max="150"
              placeholder="最大年龄"
              class="w-full"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 复选框组 -->
      <el-form-item label="标签" class="search-form-item">
        <el-checkbox-group v-model="queryParams.tags">
          <el-checkbox label="VIP">VIP</el-checkbox>
          <el-checkbox label="活跃">活跃</el-checkbox>
          <el-checkbox label="新用户">新用户</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showSearch = ref(true)

const queryParams = ref({
  keyword: '',
  deptId: '',
  roleIds: [],
  beginCreateTime: '',
  endCreateTime: '',
  minAge: undefined,
  maxAge: undefined,
  tags: []
})

const createTimeRange = ref<[Date, Date]>()

const deptOptions = [
  { label: '研发部', value: '1' },
  { label: '市场部', value: '2' },
  { label: '财务部', value: '3' }
]

const roleOptions = [
  { label: '管理员', value: '1' },
  { label: '普通用户', value: '2' },
  { label: 'VIP用户', value: '3' }
]
</script>
```

**最佳实践要点：**
- 关键词搜索支持多字段匹配
- 多选使用 `multiple` 属性
- 范围查询需要两个字段（开始和结束）
- 复杂表单项可以直接使用 `el-form-item`
- 数据提交前需要处理范围值和数组值

### 5. 性能优化

针对大量表单项的性能优化。

```vue
<template>
  <div>
    <ASearchForm
      v-model="queryParams"
      :visible="showSearch"
      title="搜索条件"
      :default-expanded="false"
    >
      <!-- 常用查询条件 - 第一行 -->
      <AFormInput v-model="queryParams.userName" label="用户名" />
      <AFormInput v-model="queryParams.phone" label="手机号" />
      <AFormSelect v-model="queryParams.status" label="状态" :options="statusOptions" />

      <!-- 不常用查询条件 - 第二行及以后 -->
      <AFormInput v-model="queryParams.email" label="邮箱" />
      <AFormInput v-model="queryParams.idCard" label="身份证号" />
      <AFormSelect v-model="queryParams.deptId" label="部门" :options="deptOptions" />
      <AFormSelect v-model="queryParams.postId" label="岗位" :options="postOptions" />
      <AFormDate v-model="createTimeRange" label="创建时间" type="daterange" />
      <AFormDate v-model="loginTimeRange" label="登录时间" type="daterange" />
    </ASearchForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const showSearch = ref(true)

// 使用 reactive 而不是 ref 包裹整个对象
const queryParams = reactive({
  userName: '',
  phone: '',
  status: '',
  email: '',
  idCard: '',
  deptId: '',
  postId: '',
  beginCreateTime: '',
  endCreateTime: '',
  beginLoginTime: '',
  endLoginTime: ''
})

const createTimeRange = ref<[Date, Date]>()
const loginTimeRange = ref<[Date, Date]>()

const statusOptions = ref([
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
])

const deptOptions = ref([])
const postOptions = ref([])
</script>
```

**性能优化要点：**
- 将常用查询条件放在第一行，不常用的放在后面
- 设置 `default-expanded="false"`，默认收起不常用条件
- 使用 `reactive` 代替 `ref` 包裹大对象，减少 proxy 嵌套
- 选项数据使用 `ref` 独立管理
- 避免在表单项中使用复杂计算属性
- 大量选项使用虚拟滚动（el-select 的 `virtual` 属性）

## 常见问题

### 1. 表单项无法被重置

**问题原因：**
- 表单项缺少 `prop` 属性
- 使用了非 Element Plus 表单组件
- 表单数据结构不匹配

**解决方案：**

```vue
<!-- ❌ 错误：缺少 prop 属性 -->
<ASearchForm ref="formRef" v-model="queryParams">
  <AFormInput v-model="queryParams.userName" label="用户名" />
</ASearchForm>

<!-- ✅ 正确：添加 prop 属性 -->
<ASearchForm ref="formRef" v-model="queryParams">
  <AFormInput
    v-model="queryParams.userName"
    label="用户名"
    prop="userName"
  />
</ASearchForm>

<script setup lang="ts">
import { ref } from 'vue'

const formRef = ref()
const queryParams = ref({
  userName: ''
})

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

**技术说明：**
- `prop` 属性对应 `v-model` 中的字段名
- `resetFields` 方法依赖 `prop` 属性定位字段
- AForm 系列组件会自动传递 `prop` 属性到内部的 `el-form-item`

### 2. 展开收起按钮不显示

**问题原因：**
- 表单项少于2行
- 设置了 `collapsible="false"`
- 使用了非行内表单（`inline="false"`）
- 表单项动态加载未及时计算行数

**解决方案：**

```vue
<template>
  <ASearchForm
    ref="formRef"
    v-model="queryParams"
    :inline="true"
    :collapsible="true"
  >
    <!-- 确保有足够的表单项（超过2行） -->
    <AFormInput v-model="queryParams.field1" label="字段1" />
    <AFormInput v-model="queryParams.field2" label="字段2" />
    <AFormInput v-model="queryParams.field3" label="字段3" />
    <AFormInput v-model="queryParams.field4" label="字段4" />
    <AFormInput v-model="queryParams.field5" label="字段5" />
  </ASearchForm>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const formRef = ref()
const queryParams = ref({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
})

// 动态加载表单项后，手动触发行数计算
onMounted(() => {
  setTimeout(() => {
    formRef.value?.calculateFormRows()
  }, 100)
})
</script>
```

**技术说明：**
- 展开收起功能仅在行内表单（`inline="true"`）且行数 ≥ 2 时显示
- 动态表单项需要延迟执行 `calculateFormRows()`
- 组件内部使用 MutationObserver 自动监听，但某些情况下需要手动触发

### 3. 日期范围无法绑定

**问题原因：**
- 查询参数中没有对应的日期字段
- 日期格式转换问题
- 未正确处理日期范围到开始时间和结束时间的转换

**解决方案：**

```vue
<template>
  <ASearchForm v-model="queryParams">
    <AFormDate
      v-model="dateRange"
      label="创建时间"
      prop="createTime"
      type="daterange"
      @change="handleDateChange"
    />
  </ASearchForm>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const queryParams = ref({
  beginTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
})

const dateRange = ref<[Date, Date]>()

// 方法1：使用 @change 事件处理
const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates && dates.length === 2) {
    queryParams.value.beginTime = dates[0].toISOString().split('T')[0]
    queryParams.value.endTime = dates[1].toISOString().split('T')[0]
  } else {
    queryParams.value.beginTime = ''
    queryParams.value.endTime = ''
  }
}

// 方法2：使用 watch 监听
watch(dateRange, (newValue) => {
  if (newValue && newValue.length === 2) {
    queryParams.value.beginTime = newValue[0].toISOString().split('T')[0]
    queryParams.value.endTime = newValue[1].toISOString().split('T')[0]
  } else {
    queryParams.value.beginTime = ''
    queryParams.value.endTime = ''
  }
})
</script>
```

**技术说明：**
- 日期范围组件返回数组 `[Date, Date]`
- 后端通常需要两个独立字段：`beginTime` 和 `endTime`
- 需要手动转换日期格式为字符串
- 清空日期时要同时清空开始和结束时间

### 4. 表单动画不生效

**问题原因：**
- 缺少动画相关的样式文件
- `visible` 属性未正确绑定
- 浏览器不支持 CSS transition

**解决方案：**

```vue
<template>
  <div>
    <!-- 确保 visible 绑定到响应式变量 -->
    <ASearchForm v-model="queryParams" :visible="showSearch">
      <AFormInput v-model="queryParams.userName" label="用户名" />
    </ASearchForm>

    <el-button @click="toggleSearch">切换搜索</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 使用 ref 定义响应式变量
const showSearch = ref(true)

const queryParams = ref({
  userName: ''
})

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}
</script>
```

**技术说明：**
- 组件内部使用 `searchAnimate` 定义动画类
- 动画通过 `transition` 组件实现
- 确保 `visible` 绑定到响应式数据
- 检查是否正确导入了 `@/composables/useAnimation`

### 5. 表单验证不工作

**问题原因：**
- 未设置表单验证规则
- 表单项缺少 `prop` 属性
- 未正确调用验证方法

**解决方案：**

```vue
<template>
  <ASearchForm ref="formRef" v-model="queryParams">
    <el-form-item
      label="用户名"
      prop="userName"
      :rules="[
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ]"
    >
      <el-input v-model="queryParams.userName" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </ASearchForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref()
const queryParams = ref({
  userName: ''
})

const handleSubmit = async () => {
  // 获取 el-form 实例
  const formInstance = formRef.value?.formRef as FormInstance

  if (!formInstance) return

  // 执行验证
  const valid = await formInstance.validate().catch(() => false)

  if (valid) {
    console.log('验证通过，提交数据:', queryParams.value)
  } else {
    console.log('验证失败')
  }
}
</script>
```

**技术说明：**
- 验证规则设置在 `el-form-item` 的 `rules` 属性上
- 必须设置 `prop` 属性才能关联验证规则
- 通过 `formRef.value.formRef` 获取内部的 `el-form` 实例
- 调用 `validate()` 方法执行验证

### 6. 行数计算不准确

**问题原因：**
- 表单项使用了自定义样式影响布局
- 响应式布局导致行数动态变化
- 表单项动态加载时机问题

**解决方案：**

```vue
<template>
  <ASearchForm
    ref="formRef"
    v-model="queryParams"
    :collapsible="true"
  >
    <!-- 使用标准的 AForm 组件，避免自定义样式 -->
    <AFormInput
      v-model="queryParams.userName"
      label="用户名"
      :span="{ xs: 24, sm: 12, md: 8 }"
    />
    <AFormInput
      v-model="queryParams.phone"
      label="手机号"
      :span="{ xs: 24, sm: 12, md: 8 }"
    />
    <AFormSelect
      v-model="queryParams.status"
      label="状态"
      :options="statusOptions"
      :span="{ xs: 24, sm: 12, md: 8 }"
    />
  </ASearchForm>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const formRef = ref()
const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const statusOptions = ref([])

// 监听窗口大小变化
let resizeTimer: any = null
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    formRef.value?.calculateFormRows()
  }, 200)
})

// 选项数据加载后重新计算
watch(statusOptions, () => {
  setTimeout(() => {
    formRef.value?.calculateFormRows()
  }, 100)
})

onMounted(() => {
  // 确保DOM完全渲染后计算行数
  setTimeout(() => {
    formRef.value?.calculateFormRows()
  }, 200)
})
</script>
```

**技术说明：**
- 组件内部自动监听窗口 resize 事件
- 使用 MutationObserver 监听 DOM 变化
- 动态内容变化后需要延迟触发 `calculateFormRows()`
- 避免在表单项上使用会影响布局的自定义样式
- 使用防抖处理高频的重新计算请求

## 总结

通过本文档，你已经学习了：

1. ✅ **基本用法** - 创建搜索表单，控制显示隐藏，使用 AForm 组件
2. ✅ **展开收起** - 自动展开收起，默认展开，禁用功能，手动控制
3. ✅ **布局配置** - 垂直布局，标签位置，标签宽度
4. ✅ **方法调用** - 重置表单，重新计算行数，展开/收起控制
5. ✅ **API 文档** - Props、Events、Methods、Slots 完整说明
6. ✅ **最佳实践** - 配合工具栏使用，字典数据，响应式布局，复杂查询，性能优化
7. ✅ **常见问题** - 6 个常见问题及详细解决方案

**下一步建议：**

- 在实际项目中使用 ASearchForm 组件，熟悉各种功能
- 结合 TableToolbar、Pagination 组件构建完整的列表页
- 学习 AForm 系列组件，提升表单开发效率
- 掌握响应式布局，适配不同屏幕尺寸

开始使用 ASearchForm 优化你的列表页面吧！🚀
