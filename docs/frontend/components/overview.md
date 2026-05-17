# 组件系统概览

## 介绍

RuoYi-Plus-UI 提供了一套完整的企业级组件库，基于 Vue 3 和 Element Plus 构建，涵盖表格、表单、数据展示、业务组件等多个分类。组件库采用统一的设计规范和 API 风格，支持 TypeScript 类型推断，提供完善的主题定制能力。

**核心特性：**

- **统一设计** - 所有组件遵循统一的设计语言和交互模式，保持视觉一致性
- **类型安全** - 完整的 TypeScript 类型定义，提供智能提示和编译时检查
- **高度可配置** - 丰富的 Props 配置项，支持深度自定义
- **响应式设计** - 支持响应式栅格布局，适配不同屏幕尺寸
- **主题定制** - 基于 CSS 变量的主题系统，支持亮色/暗色模式切换
- **权限集成** - 内置权限控制能力，与系统权限体系无缝集成
- **国际化支持** - 预留国际化接口，支持多语言切换

## 组件目录结构

```text
src/components/
├── AAi/                    # AI 相关组件
│   └── AFormInputWithAi.vue
├── ACard/                  # 数据卡片组件
│   └── ADataCard.vue
├── AChart/                 # 图表组件
│   └── AChart.vue
├── ADetail/                # 详情展示组件
│   └── ADetailDialog.vue
├── AForm/                  # 表单组件集合
│   ├── AFormInput.vue
│   ├── AFormSelect.vue
│   ├── AFormCascader.vue
│   ├── AFormCheckbox.vue
│   ├── AFormRadio.vue
│   ├── AFormSwitch.vue
│   ├── AFormDate.vue
│   ├── AFormEditor.vue
│   ├── AFormFileUpload.vue
│   ├── AFormImgUpload.vue
│   ├── AFormTreeSelect.vue
│   ├── AFormMap.vue
│   ├── AFormTableSelect.vue
│   └── AFormInputWithAi.vue
├── AImportExcel/           # Excel 导入组件
│   └── AImportExcel.vue
├── AModal/                 # 模态框组件
│   └── AModal.vue
├── AOssMediaManager/       # OSS 媒体管理组件
│   └── AOssMediaManager.vue
├── ARecharge/              # 充值组件
│   └── ARecharge.vue
├── AResizablePanels/       # 可调整面板组件
│   └── AResizablePanels.vue
├── ASearchForm/            # 搜索表单组件
│   └── ASearchForm.vue
├── ASelectionTags/         # 选择标签组件
│   └── ASelectionTags.vue
├── ATable/                 # 通用表格组件
│   └── ATable.vue
├── ATableColumnSettings/   # 表格列设置组件
│   └── ATableColumnSettings.vue
├── ATheme/                 # 主题切换组件
│   └── ATheme.vue
├── DictTag/                # 字典标签组件
│   └── DictTag.vue
├── Icon/                   # 图标组件
│   └── Icon.vue
├── IFrameContainer/        # iframe 容器组件
│   └── IFrameContainer.vue
├── ImagePreview/           # 图片预览组件
│   └── ImagePreview.vue
├── Pagination/             # 分页组件
│   └── Pagination.vue
├── TableToolbar/           # 表格工具栏组件
│   └── TableToolbar.vue
└── UserSelect/             # 用户选择组件
    └── UserSelect.vue
```

## 组件分类体系

### 组件统计

| 分类 | 组件数量 | 描述 |
|------|----------|------|
| 表格组件 | 3 | ATable、ATableColumnSettings、TableToolbar |
| 表单组件 | 14 | AFormInput、AFormSelect 等表单控件 |
| 数据展示 | 5 | ADataCard、ADetailDialog、ImagePreview 等 |
| 反馈组件 | 3 | ASearchForm、ASelectionTags、AModal |
| 业务组件 | 5 | AOssMediaManager、ARecharge、AImportExcel 等 |
| 布局组件 | 2 | IFrameContainer、AResizablePanels |
| 基础组件 | 4 | Icon、DictTag、Pagination、ATheme |

### 表格组件

表格组件是管理系统中最核心的数据展示组件，提供强大的数据列表展示和操作能力。

#### ATable 通用表格

通用表格组件，封装了 Element Plus 的 el-table，提供更简洁的配置方式和更丰富的功能。

**核心特性：**

- **配置化列定义** - 通过 columns 数组配置表格列，支持多种列类型
- **内置列类型** - 支持 dict、switch、image、datetime、actions 等多种列类型
- **选择功能** - 支持单选、多选，可配置选择回调
- **分页集成** - 内置分页功能，与数据加载无缝集成
- **排序功能** - 支持多列排序和自定义排序逻辑
- **权限控制** - 操作按钮支持权限配置

**基本用法：**

```vue
<template>
  <ATable
    :data="dataList"
    :columns="columns"
    :loading="isLoading"
    :height="tableHeight"
    show-selection
    show-pagination
    v-model:page="queryParams.pageNum"
    v-model:limit="queryParams.pageSize"
    :total="total"
    @selection-change="handleSelectionChange"
    @pagination="getList"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TableColumnConfig } from '@/components/ATable/types'

const dataList = ref([])
const isLoading = ref(false)
const total = ref(0)
const tableHeight = ref(500)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

// 列配置示例
const columns: TableColumnConfig[] = [
  { prop: 'name', label: '名称', minWidth: 120 },
  {
    prop: 'status',
    label: '状态',
    type: 'dict',
    dictOptions: sys_enable_status,
    width: 100
  },
  {
    prop: 'image',
    label: '图片',
    type: 'image',
    imageConfig: { width: 60, height: 60 }
  },
  {
    prop: 'createTime',
    label: '创建时间',
    type: 'datetime',
    width: 180
  },
  {
    prop: 'actions',
    label: '操作',
    type: 'actions',
    width: 150,
    fixed: 'right',
    actions: [
      { icon: 'View', tooltip: '详情', onClick: handleView },
      {
        icon: 'Edit',
        tooltip: '编辑',
        permission: ['system:xxx:update'],
        onClick: handleEdit
      },
      {
        icon: 'Delete',
        tooltip: '删除',
        type: 'danger',
        permission: ['system:xxx:delete'],
        onClick: handleDelete
      }
    ]
  }
]

const handleSelectionChange = (selection: any[]) => {
  console.log('选中项:', selection)
}

const getList = () => {
  // 加载数据
}
</script>
```

**列类型说明：**

| 类型 | 说明 | 配置项 |
|------|------|--------|
| `default` | 默认文本展示 | - |
| `dict` | 字典标签展示 | `dictOptions` |
| `switch` | 开关控件 | `switchDisabled`, `onSwitchChange` |
| `image` | 图片预览 | `imageConfig: { width, height, showAll }` |
| `datetime` | 日期时间格式化 | - |
| `date` | 日期格式化 | - |
| `actions` | 操作按钮列 | `actions: ActionConfig[]` |
| `slot` | 自定义插槽 | `slot: string` |

**开关列配置：**

```typescript
{
  prop: 'status',
  label: '状态',
  type: 'switch',
  switchDisabled: (row) => row.isSystem === '1',
  onSwitchChange: async (row, newValue) => {
    await updateStatus(row.id, newValue)
  }
}
```

**自定义插槽：**

```vue
<ATable :data="dataList" :columns="columns">
  <template #customSlot="{ row, index }">
    <el-tag :type="row.level === 1 ? 'success' : 'warning'">
      {{ row.customField }}
    </el-tag>
  </template>
</ATable>
```

**Props 属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `Array` | `[]` | 表格数据 |
| `columns` | `TableColumnConfig[]` | `[]` | 列配置数组 |
| `loading` | `boolean` | `false` | 加载状态 |
| `height` | `string \| number` | - | 表格高度 |
| `maxHeight` | `string \| number` | - | 表格最大高度 |
| `stripe` | `boolean` | `true` | 斑马纹 |
| `border` | `boolean` | `true` | 边框 |
| `showSelection` | `boolean` | `false` | 显示选择列 |
| `showIndex` | `boolean` | `false` | 显示序号列 |
| `showPagination` | `boolean` | `false` | 显示分页 |
| `page` | `number` | `1` | 当前页码 |
| `limit` | `number` | `10` | 每页条数 |
| `total` | `number` | `0` | 总条数 |
| `rowKey` | `string` | `'id'` | 行数据唯一标识 |
| `emptyText` | `string` | `'暂无数据'` | 空数据提示 |
| `highlightCurrentRow` | `boolean` | `false` | 高亮当前行 |

**Events 事件：**

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `selection-change` | 选择项变化 | `selection: any[]` |
| `pagination` | 分页变化 | - |
| `sort-change` | 排序变化 | `{ prop, order }` |
| `row-click` | 行点击 | `row, column, event` |
| `row-dblclick` | 行双击 | `row, column, event` |
| `current-change` | 当前行变化 | `currentRow, oldCurrentRow` |

#### ATableColumnSettings 表格列设置

表格列设置组件，提供列的显示/隐藏、排序、固定等配置功能。

```vue
<template>
  <ATableColumnSettings
    v-model="columnSettings"
    :columns="columns"
    storage-key="user-table"
  />
</template>
```

#### TableToolbar 表格工具栏

表格工具栏组件，提供新增、删除、导出等常用操作按钮。

```vue
<template>
  <TableToolbar
    :show-add="hasPermission('system:user:add')"
    :show-delete="hasPermission('system:user:delete')"
    :show-export="hasPermission('system:user:export')"
    :delete-disabled="selectedIds.length === 0"
    @add="handleAdd"
    @delete="handleBatchDelete"
    @export="handleExport"
  >
    <template #extra>
      <el-button @click="handleImport">导入</el-button>
    </template>
  </TableToolbar>
</template>
```

### 表单组件

表单组件基于 Element Plus 封装，提供统一的表单控件和响应式布局能力。

#### AFormInput 输入框

增强的输入框组件，支持响应式栅格布局、字数统计、防自动填充等功能。

**基本用法：**

```vue
<template>
  <!-- 基本输入框 -->
  <AFormInput
    label="用户名"
    v-model="form.userName"
    prop="userName"
    :span="12"
  />

  <!-- 响应式布局 -->
  <AFormInput
    label="邮箱"
    v-model="form.email"
    prop="email"
    :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
  />

  <!-- 文本域带字数统计 -->
  <AFormInput
    label="备注"
    v-model="form.remark"
    prop="remark"
    type="textarea"
    :maxlength="200"
    show-word-limit
    :rows="4"
  />

  <!-- 密码输入框 -->
  <AFormInput
    label="密码"
    v-model="form.password"
    prop="password"
    type="password"
    show-password
    prevent-autofill
  />

  <!-- 带图标 -->
  <AFormInput
    label="搜索"
    v-model="form.keyword"
    prop="keyword"
    prefix-icon="Search"
    clearable
  />

  <!-- 带插槽 -->
  <AFormInput label="网址" v-model="form.url" prop="url">
    <template #prepend>https://</template>
    <template #append>.com</template>
  </AFormInput>
</template>
```

**Props 属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | - | 绑定值 |
| `label` | `string` | - | 标签文本 |
| `prop` | `string` | - | 表单域字段名 |
| `span` | `number \| object \| 'auto'` | `24` | 栅格占位格数 |
| `type` | `string` | `'text'` | 输入框类型 |
| `placeholder` | `string` | - | 占位文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `clearable` | `boolean` | `true` | 是否可清空 |
| `showPassword` | `boolean` | `false` | 显示密码切换 |
| `showWordLimit` | `boolean` | `false` | 显示字数统计 |
| `maxlength` | `number` | - | 最大输入长度 |
| `rows` | `number` | `2` | textarea 行数 |
| `prefixIcon` | `string` | - | 前缀图标 |
| `suffixIcon` | `string` | - | 后缀图标 |
| `preventAutofill` | `boolean` | `false` | 防止自动填充 |
| `showFormItem` | `boolean` | `true` | 显示 form-item 容器 |
| `tooltip` | `string` | - | 标签提示文本 |
| `labelWidth` | `string` | - | 标签宽度 |

#### AFormSelect 选择器

增强的下拉选择器组件，支持字典数据自动加载、远程搜索、多选等功能。

```vue
<template>
  <!-- 基本选择器 -->
  <AFormSelect
    label="状态"
    v-model="form.status"
    prop="status"
    :options="statusOptions"
    :span="12"
  />

  <!-- 字典选择器 -->
  <AFormSelect
    label="用户类型"
    v-model="form.userType"
    prop="userType"
    dict-type="sys_user_type"
    :span="12"
  />

  <!-- 多选 -->
  <AFormSelect
    label="角色"
    v-model="form.roleIds"
    prop="roleIds"
    :options="roleOptions"
    multiple
    collapse-tags
    :span="12"
  />

  <!-- 远程搜索 -->
  <AFormSelect
    label="用户"
    v-model="form.userId"
    prop="userId"
    :remote-method="searchUsers"
    remote
    filterable
    :span="12"
  />
</template>
```

#### AFormCascader 级联选择器

级联选择器组件，支持地区选择、部门选择等层级数据。

```vue
<template>
  <!-- 地区选择 -->
  <AFormCascader
    label="地区"
    v-model="form.area"
    prop="area"
    type="area"
    :span="12"
  />

  <!-- 部门选择 -->
  <AFormCascader
    label="部门"
    v-model="form.deptId"
    prop="deptId"
    :options="deptOptions"
    :props="{ value: 'id', label: 'name', children: 'children' }"
    :span="12"
  />
</template>
```

#### AFormDate 日期选择器

日期和日期范围选择器组件。

```vue
<template>
  <!-- 日期选择 -->
  <AFormDate
    label="生日"
    v-model="form.birthday"
    prop="birthday"
    type="date"
    :span="12"
  />

  <!-- 日期时间选择 -->
  <AFormDate
    label="开始时间"
    v-model="form.startTime"
    prop="startTime"
    type="datetime"
    :span="12"
  />

  <!-- 日期范围 -->
  <AFormDate
    label="时间范围"
    v-model="form.dateRange"
    prop="dateRange"
    type="daterange"
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :span="24"
  />
</template>
```

#### AFormTreeSelect 树形选择器

树形选择器组件，适用于部门、菜单等树形数据选择。

```vue
<template>
  <AFormTreeSelect
    label="上级部门"
    v-model="form.parentId"
    prop="parentId"
    :data="deptTree"
    :props="{ value: 'id', label: 'name', children: 'children' }"
    check-strictly
    :span="12"
  />
</template>
```

#### AFormEditor 富文本编辑器

基于 WangEditor 封装的富文本编辑器组件。

```vue
<template>
  <AFormEditor
    label="内容"
    v-model="form.content"
    prop="content"
    :height="400"
    :span="24"
  />
</template>
```

#### AFormFileUpload 文件上传

通用文件上传组件，支持多种文件类型。

```vue
<template>
  <AFormFileUpload
    label="附件"
    v-model="form.files"
    prop="files"
    accept=".pdf,.doc,.docx,.xls,.xlsx"
    :limit="5"
    :max-size="10"
    :span="24"
  />
</template>
```

#### AFormImgUpload 图片上传

图片上传组件，支持图片预览、裁剪等功能。

```vue
<template>
  <!-- 单图上传 -->
  <AFormImgUpload
    label="头像"
    v-model="form.avatar"
    prop="avatar"
    :limit="1"
    :span="12"
  />

  <!-- 多图上传 -->
  <AFormImgUpload
    label="图片集"
    v-model="form.images"
    prop="images"
    :limit="9"
    list-type="picture-card"
    :span="24"
  />
</template>
```

### 数据展示组件

#### ADataCard 数据卡片

数据指标卡片组件，适用于仪表板和数据看板。

```vue
<template>
  <ADataCard
    title="用户统计"
    icon-code="User"
    :data-list="[
      { label: '今日新增', value: '126', percent: 12.5 },
      { label: '昨日', value: '98', percent: -5.2 },
      { label: '本周', value: '856', percent: 8.3 }
    ]"
    :col-config="{
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6
    }"
  />
</template>
```

**Props 属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 卡片标题 |
| `iconCode` | `string` | - | 图标代码 |
| `dataList` | `DataItem[]` | `[]` | 数据列表 |
| `colConfig` | `object` | - | 响应式栅格配置 |
| `showTrend` | `boolean` | `true` | 显示趋势图标 |

#### ADetailDialog 详情对话框

通用详情展示对话框，支持分组展示和自定义渲染。

```vue
<template>
  <ADetailDialog
    v-model="showDetail"
    title="用户详情"
    :data="userInfo"
    :fields="detailFields"
    :width="800"
  />
</template>

<script lang="ts" setup>
const detailFields = [
  { prop: 'userName', label: '用户名' },
  { prop: 'nickName', label: '昵称' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号' },
  {
    prop: 'status',
    label: '状态',
    type: 'dict',
    dictType: 'sys_normal_disable'
  },
  { prop: 'createTime', label: '创建时间', type: 'datetime' },
  { prop: 'remark', label: '备注', span: 24 }
]
</script>
```

#### ImagePreview 图片预览

图片预览组件，支持图片列表预览和缩放。

```vue
<template>
  <!-- 单图预览 -->
  <ImagePreview :src="imageUrl" :width="100" :height="100" />

  <!-- 多图预览 -->
  <ImagePreview
    :src="imageList"
    :width="80"
    :height="80"
    :show-all="true"
  />
</template>
```

### 反馈组件

#### ASearchForm 搜索表单

带动画效果的搜索表单容器，支持展开/收起。

```vue
<template>
  <ASearchForm
    v-model="queryParams"
    title="查询条件"
    :show-expand="true"
    :default-expand="false"
    @search="handleQuery"
    @reset="handleReset"
  >
    <AFormInput label="用户名" v-model="queryParams.userName" prop="userName" />
    <AFormSelect label="状态" v-model="queryParams.status" prop="status" :options="statusOptions" />
    <AFormDate label="创建时间" v-model="queryParams.dateRange" prop="dateRange" type="daterange" />
  </ASearchForm>
</template>
```

#### ASelectionTags 选择标签

多选内容的标签化展示组件。

```vue
<template>
  <ASelectionTags
    v-model="selectedItems"
    :max-tags="5"
    closable
    @close="handleTagClose"
  />
</template>
```

#### AModal 模态框

增强的模态框组件，支持全屏、拖拽等功能。

```vue
<template>
  <AModal
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    :width="600"
    :fullscreen="false"
    :draggable="true"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <el-form ref="formRef" :model="form" :rules="rules">
      <!-- 表单内容 -->
    </el-form>
  </AModal>
</template>
```

### 业务组件

#### AOssMediaManager OSS 媒体管理

OSS 媒体资源管理组件，提供文件上传、浏览、选择等功能。

```vue
<template>
  <AOssMediaManager
    v-model="selectedFiles"
    :accept="['image/*', 'video/*']"
    :multiple="true"
    :max-count="9"
    @select="handleSelect"
  />
</template>
```

#### ARecharge 充值组件

在线充值组件，支持微信支付等支付方式。

```vue
<template>
  <ARecharge
    v-model="visible"
    :amount-options="[10, 50, 100, 200, 500]"
    :min-amount="1"
    :max-amount="10000"
    @success="handleRechargeSuccess"
  />
</template>
```

#### AImportExcel Excel 导入

Excel 文件导入组件，支持模板下载和数据预览。

```vue
<template>
  <AImportExcel
    v-model="showImport"
    :template-url="templateUrl"
    :upload-url="uploadUrl"
    @success="handleImportSuccess"
  />
</template>
```

#### UserSelect 用户选择器

用户选择组件，支持搜索和多选。

```vue
<template>
  <UserSelect
    v-model="form.userIds"
    :multiple="true"
    :limit="10"
    placeholder="请选择用户"
  />
</template>
```

### 布局组件

#### IFrameContainer iframe 容器

增强的 iframe 容器组件，支持加载状态和通信。

```vue
<template>
  <IFrameContainer
    :src="externalUrl"
    :height="600"
    :loading="isLoading"
    @load="handleLoad"
  />
</template>
```

#### AResizablePanels 可调整面板

可调整大小的面板布局组件。

```vue
<template>
  <AResizablePanels
    :min-size="200"
    :max-size="600"
    :default-size="300"
  >
    <template #left>
      左侧面板内容
    </template>
    <template #right>
      右侧面板内容
    </template>
  </AResizablePanels>
</template>
```

### 基础组件

#### Icon 图标

统一的图标组件，支持 Iconify 和 Iconfont。

```vue
<template>
  <!-- Iconify 图标 -->
  <Icon icon="ep:home" :size="24" color="#409eff" />

  <!-- Iconfont 图标 -->
  <Icon icon="icon-elevator3" :size="20" />
</template>
```

#### DictTag 字典标签

字典值标签展示组件。

```vue
<template>
  <DictTag :options="statusOptions" :value="row.status" />
</template>
```

#### Pagination 分页

分页组件，支持多种布局配置。

```vue
<template>
  <Pagination
    v-model:page="queryParams.pageNum"
    v-model:limit="queryParams.pageSize"
    :total="total"
    :page-sizes="[10, 20, 50, 100]"
    @pagination="getList"
  />
</template>
```

#### ATheme 主题切换

主题切换组件，支持亮色/暗色模式。

```vue
<template>
  <ATheme />
</template>
```

## 组件通信模式

### Props 向下传递

```vue
<ATable :data="dataList" :columns="columns" :loading="isLoading" />
```

### Events 向上冒泡

```vue
<ATable
  @selection-change="handleSelectionChange"
  @pagination="handlePagination"
/>
```

### v-model 双向绑定

```vue
<AFormInput v-model="form.name" />
<AModal v-model="visible" />
```

### Provide/Inject 跨层级

```typescript
// 父组件
provide('tableConfig', { stripe: true, border: true })

// 子组件
const tableConfig = inject('tableConfig')
```

### 插槽自定义

```vue
<ATable :columns="columns">
  <template #status="{ row }">
    <el-tag :type="row.status === 1 ? 'success' : 'danger'">
      {{ row.status === 1 ? '启用' : '禁用' }}
    </el-tag>
  </template>
</ATable>
```

## 响应式设计

### 栅格系统

表单组件支持响应式栅格配置：

```vue
<AFormInput
  label="用户名"
  v-model="form.userName"
  :span="{
    xs: 24,   // <768px
    sm: 24,   // ≥768px
    md: 12,   // ≥992px
    lg: 8,    // ≥1200px
    xl: 6     // ≥1920px
  }"
/>
```

### 预设响应式配置

```vue
<!-- 使用预设配置 -->
<AFormInput label="用户名" v-model="form.userName" span="auto" />
```

### 断点定义

| 断点 | 尺寸范围 | 典型设备 |
|------|----------|----------|
| `xs` | `<768px` | 手机 |
| `sm` | `≥768px` | 平板竖屏 |
| `md` | `≥992px` | 平板横屏 |
| `lg` | `≥1200px` | 笔记本 |
| `xl` | `≥1920px` | 大屏显示器 |

## 主题定制

### CSS 变量

```css
:root {
  --el-color-primary: #409EFF;
  --el-color-success: #67C23A;
  --el-color-warning: #E6A23C;
  --el-color-danger: #F56C6C;
  --el-color-info: #909399;
}
```

### 暗色模式

```css
html.dark {
  --el-bg-color: #141414;
  --el-bg-color-overlay: #1d1e1f;
  --el-text-color-primary: #E5EAF3;
  --el-border-color: #4C4D4F;
}
```

### 组件样式覆盖

```scss
// 自定义表格样式
.a-table-wrapper {
  .el-table {
    --el-table-header-bg-color: var(--el-fill-color-light);

    th {
      font-weight: 600;
    }
  }
}
```

## 权限控制

### 按钮权限

```vue
<TableToolbar
  :show-add="hasPermission('system:user:add')"
  :show-edit="hasPermission('system:user:edit')"
  :show-delete="hasPermission('system:user:delete')"
/>
```

### 操作列权限

```typescript
const columns = [
  {
    prop: 'actions',
    type: 'actions',
    actions: [
      {
        icon: 'Edit',
        tooltip: '编辑',
        permission: ['system:user:edit'],
        onClick: handleEdit
      }
    ]
  }
]
```

## 性能优化

### 虚拟滚动

```vue
<ATable
  :data="largeDataList"
  virtual-scroll
  :item-height="48"
/>
```

### 懒加载

```vue
<AFormTreeSelect
  :data="treeData"
  :load="loadChildren"
  lazy
/>
```

### 防抖搜索

```vue
<AFormSelect
  :remote-method="searchUsers"
  :remote-debounce="300"
  remote
  filterable
/>
```

## 最佳实践

### 1. 统一使用组件库

```typescript
// ✅ 推荐：使用封装组件
<AFormInput label="用户名" v-model="form.userName" />

// ❌ 不推荐：直接使用 Element Plus
<el-form-item label="用户名">
  <el-input v-model="form.userName" />
</el-form-item>
```

### 2. 合理配置列类型

```typescript
// ✅ 使用内置列类型
{ prop: 'status', type: 'dict', dictOptions: statusList }

// ❌ 手动渲染
{ prop: 'status', slot: 'status' }
```

### 3. 充分利用响应式

```vue
<!-- ✅ 使用响应式配置 -->
<AFormInput :span="{ md: 12, lg: 8 }" />

<!-- ❌ 固定宽度 -->
<AFormInput :span="8" />
```

### 4. 权限前置检查

```typescript
// ✅ 权限控制
const showEditBtn = computed(() => hasPermission('system:user:edit'))

// ❌ 无权限控制
const showEditBtn = true
```

## 常见问题

### 1. 表格数据不更新

**问题原因：** 直接修改数组元素而非替换数组

**解决方案：**

```typescript
// ✅ 正确：替换整个数组
dataList.value = [...newData]

// ❌ 错误：直接修改
dataList.value[0].name = 'new name'
```

### 2. 表单验证不触发

**问题原因：** prop 属性未正确设置

**解决方案：**

```vue
<!-- ✅ 正确：设置 prop -->
<AFormInput label="用户名" v-model="form.userName" prop="userName" />

<!-- ❌ 错误：未设置 prop -->
<AFormInput label="用户名" v-model="form.userName" />
```

### 3. 响应式布局不生效

**问题原因：** 未正确配置 span 对象

**解决方案：**

```vue
<!-- ✅ 正确：对象配置 -->
<AFormInput :span="{ xs: 24, md: 12 }" />

<!-- ❌ 错误：字符串配置 -->
<AFormInput span="{ xs: 24, md: 12 }" />
```

### 4. 图标不显示

**问题原因：** 图标名称格式不正确

**解决方案：**

```vue
<!-- ✅ Iconify 格式 -->
<Icon icon="ep:home" />

<!-- ✅ Iconfont 格式 -->
<Icon icon="icon-elevator3" />

<!-- ❌ 错误格式 -->
<Icon icon="home" />
```

### 5. 选择器数据为空

**问题原因：** 字典数据未加载

**解决方案：**

```typescript
// 确保字典数据已加载
const { sys_user_type } = toRefs(useDict('sys_user_type'))
```

## API 速查表

### 表格组件

| 组件 | 主要 Props | 主要 Events |
|------|-----------|-------------|
| `ATable` | `data`, `columns`, `loading`, `showSelection` | `selection-change`, `pagination` |
| `TableToolbar` | `showAdd`, `showDelete`, `showExport` | `add`, `delete`, `export` |
| `Pagination` | `page`, `limit`, `total` | `pagination` |

### 表单组件

| 组件 | 主要 Props | 特殊功能 |
|------|-----------|----------|
| `AFormInput` | `modelValue`, `label`, `prop`, `span` | 响应式布局、字数统计 |
| `AFormSelect` | `modelValue`, `options`, `dictType` | 字典加载、远程搜索 |
| `AFormDate` | `modelValue`, `type` | 日期/时间/范围选择 |
| `AFormTreeSelect` | `modelValue`, `data` | 树形数据选择 |
| `AFormEditor` | `modelValue`, `height` | 富文本编辑 |
| `AFormImgUpload` | `modelValue`, `limit` | 图片上传预览 |

### 展示组件

| 组件 | 主要 Props | 用途 |
|------|-----------|------|
| `ADataCard` | `title`, `dataList`, `iconCode` | 数据指标展示 |
| `ADetailDialog` | `data`, `fields` | 详情信息展示 |
| `ImagePreview` | `src`, `width`, `height` | 图片预览 |
| `DictTag` | `options`, `value` | 字典标签 |
