# TableToolbar 表格工具栏

## 介绍

TableToolbar 是 RuoYi-Plus 前端框架中的核心表格辅助组件,为数据表格提供统一的工具栏操作入口。该组件整合了打印、搜索控制、数据刷新、查询重置和列管理等常用功能,大幅提升表格页面的交互体验和开发效率。

**核心特性:**

- **打印功能** - 支持表格数据导出打印,自动处理图片、日期、字典、货币等多种数据类型
- **搜索控制** - 提供搜索区域的显示/隐藏切换功能,优化页面空间利用
- **数据刷新** - 一键刷新表格数据,保持数据实时性
- **查询重置** - 快速重置所有搜索条件,恢复默认查询状态
- **列管理** - 通过树形弹窗动态控制表格列的显示/隐藏,支持层级结构
- **国际化支持** - 工具提示文本支持中英文自动切换

## 基本用法

### 最简单的使用

最基本的工具栏配置,提供刷新和重置功能:

```vue
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form v-show="showSearch" :model="queryParams">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" />
      </el-form-item>
    </el-form>

    <!-- 表格工具栏 -->
    <TableToolbar
      v-model:showSearch="showSearch"
      @reset-query="resetQuery"
      @query-table="getList"
    />

    <!-- 表格主体 -->
    <el-table :data="tableData">
      <el-table-column prop="userName" label="用户名称" />
      <el-table-column prop="nickName" label="用户昵称" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TableToolbar from '@/components/TableToolbar/TableToolbar.vue'

const showSearch = ref(true)
const queryParams = ref({
  userName: ''
})
const tableData = ref([])

// 获取表格数据
const getList = () => {
  // API 请求逻辑
}

// 重置查询条件
const resetQuery = () => {
  queryParams.value = {
    userName: ''
  }
  getList()
}
</script>
```

**使用说明:**

- `v-model:showSearch` 双向绑定搜索区域显示状态
- `@reset-query` 监听重置按钮点击事件
- `@query-table` 监听刷新按钮点击事件

### 带列管理的工具栏

配置 `columns` 属性启用列显示管理功能:

```vue
<template>
  <div class="app-container">
    <TableToolbar
      v-model:showSearch="showSearch"
      :columns="columns"
      @reset-query="resetQuery"
      @query-table="getList"
    />

    <el-table :data="tableData">
      <el-table-column v-if="columns[0].visible" prop="userId" label="用户ID" />
      <el-table-column v-if="columns[1].visible" prop="userName" label="用户名称" />
      <el-table-column v-if="columns[2].visible" prop="nickName" label="用户昵称" />
      <el-table-column v-if="columns[3].visible" prop="email" label="邮箱" />
      <el-table-column v-if="columns[4].visible" prop="phone" label="手机号" />
      <el-table-column v-if="columns[5].visible" prop="status" label="状态" />
      <el-table-column v-if="columns[6].visible" prop="createTime" label="创建时间" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TableToolbar from '@/components/TableToolbar/TableToolbar.vue'

const showSearch = ref(true)
const tableData = ref([])

// 定义列配置
const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
  { key: 2, field: 'nickName', label: '用户昵称', visible: true, children: [] },
  { key: 3, field: 'email', label: '邮箱', visible: true, children: [] },
  { key: 4, field: 'phone', label: '手机号', visible: false, children: [] },
  { key: 5, field: 'status', label: '状态', visible: true, children: [] },
  { key: 6, field: 'createTime', label: '创建时间', visible: true, children: [] }
])

const getList = () => {
  // API 请求逻辑
}

const resetQuery = () => {
  // 重置逻辑
}
</script>
```

**列配置说明:**

- `key` - 列的唯一标识,必须唯一
- `field` - 列对应的字段名
- `label` - 列显示的标签文本
- `visible` - 列是否可见,默认 `true`
- `children` - 子列配置,支持层级结构

### 层级列管理

支持多层级的列配置,适用于复杂表格:

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    :columns="columns"
    @reset-query="resetQuery"
    @query-table="getList"
  />
</template>

<script lang="ts" setup>
const columns = ref<FieldVisibilityConfig[]>([
  {
    key: 0,
    field: 'basicInfo',
    label: '基本信息',
    visible: true,
    children: [
      { key: 1, field: 'userId', label: '用户ID', visible: true, children: [] },
      { key: 2, field: 'userName', label: '用户名称', visible: true, children: [] },
      { key: 3, field: 'nickName', label: '用户昵称', visible: true, children: [] }
    ]
  },
  {
    key: 4,
    field: 'contactInfo',
    label: '联系信息',
    visible: true,
    children: [
      { key: 5, field: 'email', label: '邮箱', visible: true, children: [] },
      { key: 6, field: 'phone', label: '手机号', visible: true, children: [] }
    ]
  },
  {
    key: 7,
    field: 'status',
    label: '状态',
    visible: true,
    children: []
  }
])
</script>
```

**技术实现:**

- 使用 `el-tree` 组件展示层级结构
- 支持父子节点的关联选择
- `visible` 属性响应式更新

### 带打印功能的工具栏

启用打印功能,自动生成可打印的表格内容:

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    :columns="columns"
    :show-print="true"
    :print-title="'用户列表'"
    :table-data="tableData"
    :table-columns="printColumns"
    @reset-query="resetQuery"
    @query-table="getList"
  />

  <el-table :data="tableData">
    <el-table-column prop="userName" label="用户名称" />
    <el-table-column prop="nickName" label="用户昵称" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column prop="status" label="状态" />
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSearch = ref(true)
const tableData = ref([
  { userName: 'admin', nickName: '管理员', email: 'admin@example.com', status: '1' },
  { userName: 'user', nickName: '普通用户', email: 'user@example.com', status: '0' }
])

// 定义打印列配置
const printColumns = ref<FieldConfig[]>([
  { prop: 'userName', label: '用户名称', type: 'text' },
  { prop: 'nickName', label: '用户昵称', type: 'text' },
  { prop: 'email', label: '邮箱', type: 'text' },
  {
    prop: 'status',
    label: '状态',
    type: 'dict',
    dictOptions: [
      { value: '0', label: '停用' },
      { value: '1', label: '正常' }
    ]
  }
])

const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userName', label: '用户名称', visible: true, children: [] },
  { key: 1, field: 'nickName', label: '用户昵称', visible: true, children: [] },
  { key: 2, field: 'email', label: '邮箱', visible: true, children: [] },
  { key: 3, field: 'status', label: '状态', visible: true, children: [] }
])
</script>
```

**打印功能说明:**

- `show-print="true"` 显示打印按钮
- `print-title` 打印文档标题
- `table-data` 要打印的表格数据
- `table-columns` 打印列配置,支持自定义格式化

### 禁用搜索功能

如果页面不需要搜索功能,可以禁用搜索按钮:

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    :search="false"
    :columns="columns"
    @reset-query="resetQuery"
    @query-table="getList"
  />
</template>
```

**使用说明:**

- `search="false"` 隐藏搜索按钮
- 仍然支持通过 `v-model:showSearch` 控制搜索区域显示

### 自定义按钮间距

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    :columns="columns"
    :gutter="20"
    @reset-query="resetQuery"
    @query-table="getList"
  />
</template>
```

**使用说明:**

- `gutter` 属性控制工具栏按钮组的右边距
- 默认值为 `10px`

## 打印功能详解

### 支持的数据类型

TableToolbar 的打印功能支持自动处理多种数据类型:

```vue
<script lang="ts" setup>
const printColumns = ref<FieldConfig[]>([
  // 文本类型
  { prop: 'userName', label: '用户名称', type: 'text' },

  // 图片类型 - 显示缩略图(30x30)
  { prop: 'avatar', label: '头像', type: 'image' },

  // 日期时间类型 - 自动格式化
  { prop: 'createTime', label: '创建时间', type: 'datetime' },
  { prop: 'birthday', label: '生日', type: 'date' },

  // 开关类型 - '1'/true 显示"启用", 其他显示"禁用"
  { prop: 'status', label: '状态', type: 'switch' },

  // 布尔类型 - 显示"是"/"否"
  { prop: 'isActive', label: '是否激活', type: 'boolean' },

  // 字典类型 - 根据 dictOptions 查找标签
  {
    prop: 'userType',
    label: '用户类型',
    type: 'dict',
    dictOptions: [
      { value: '0', label: '系统用户' },
      { value: '1', label: '普通用户' }
    ]
  },

  // 货币类型 - 添加 ¥ 符号和千分位
  { prop: 'balance', label: '账户余额', type: 'currency' },

  // 数组类型 - 用逗号连接
  { prop: 'roles', label: '角色', type: 'array' },

  // HTML 类型 - 移除标签显示纯文本(限50字符)
  { prop: 'description', label: '描述', type: 'html' },

  // 密码类型 - 显示 "******"
  { prop: 'password', label: '密码', type: 'password' },

  // 自定义格式化
  {
    prop: 'age',
    label: '年龄',
    formatter: (value, row) => `${value} 岁`
  }
])
</script>
```

### 打印列配置

`FieldConfig` 接口定义:

```typescript
interface FieldConfig {
  /** 字段属性名 */
  prop: string

  /** 字段显示标签 */
  label: string

  /** 数据类型 */
  type?: 'text' | 'image' | 'date' | 'datetime' | 'currency' | 'boolean' |
         'array' | 'dict' | 'switch' | 'html' | 'password'

  /** 字典选项(type='dict' 时使用) */
  dictOptions?: Array<{ value: string, label: string }>

  /** 自定义格式化函数 */
  formatter?: (value: any, row: any) => string

  /** 是否不参与打印 */
  noPrint?: boolean
}
```

### 排除特定列

```vue
<script lang="ts" setup>
const printColumns = ref<FieldConfig[]>([
  { prop: 'userName', label: '用户名称', type: 'text' },
  { prop: 'email', label: '邮箱', type: 'text' },

  // 密码字段不打印
  { prop: 'password', label: '密码', type: 'password', noPrint: true },

  // 操作列不打印
  { prop: 'actions', label: '操作', noPrint: true }
])
</script>
```

### 自定义打印处理

如果需要完全自定义打印逻辑,可以监听 `print` 事件:

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    :show-print="true"
    @print="handleCustomPrint"
  />
</template>

<script lang="ts" setup>
import { usePrint } from '@/composables/usePrint'

const { printHtml } = usePrint()

const handleCustomPrint = async () => {
  // 自定义打印内容
  const customHtml = `
    <div>
      <h1>自定义打印标题</h1>
      <p>自定义打印内容...</p>
    </div>
  `

  // 自定义打印样式
  const styles = `
    h1 { color: #409eff; }
    p { font-size: 14px; }
  `

  await printHtml(customHtml, styles)
}
</script>
```

## 列管理详解

### 列配置结构

`FieldVisibilityConfig` 接口定义:

```typescript
interface FieldVisibilityConfig {
  /** 列唯一标识 */
  key: string | number

  /** 列字段名 */
  field: string

  /** 列显示标签 */
  label: string

  /** 是否可见 */
  visible: boolean

  /** 子列配置 */
  children?: FieldVisibilityConfig[]
}
```

### 动态生成列配置

从表格列定义自动生成列配置:

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// 表格列定义
const tableColumns = [
  { prop: 'userId', label: '用户ID' },
  { prop: 'userName', label: '用户名称' },
  { prop: 'nickName', label: '用户昵称' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号' },
  { prop: 'status', label: '状态' }
]

// 自动生成列配置
const columns = ref<FieldVisibilityConfig[]>([])

onMounted(() => {
  columns.value = tableColumns.map((col, index) => ({
    key: index,
    field: col.prop,
    label: col.label,
    visible: true,
    children: []
  }))
})
</script>
```

### 持久化列配置

将列显示状态保存到 localStorage:

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const STORAGE_KEY = 'user-table-columns'

// 从 localStorage 加载列配置
const columns = ref<FieldVisibilityConfig[]>(() => {
  const savedColumns = localStorage.getItem(STORAGE_KEY)
  if (savedColumns) {
    return JSON.parse(savedColumns)
  }

  // 默认列配置
  return [
    { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
    { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
    { key: 2, field: 'nickName', label: '用户昵称', visible: true, children: [] }
  ]
})

// 监听列配置变化,保存到 localStorage
watch(
  () => columns.value,
  (newColumns) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newColumns))
  },
  { deep: true }
)
</script>
```

### 批量操作列显示

```vue
<template>
  <div>
    <el-button @click="showAllColumns">显示所有列</el-button>
    <el-button @click="hideAllColumns">隐藏所有列</el-button>
    <el-button @click="resetColumns">重置列显示</el-button>

    <TableToolbar
      v-model:showSearch="showSearch"
      :columns="columns"
      @reset-query="resetQuery"
      @query-table="getList"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
  { key: 2, field: 'nickName', label: '用户昵称', visible: true, children: [] }
])

// 默认列配置
const defaultColumns: FieldVisibilityConfig[] = [
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
  { key: 2, field: 'nickName', label: '用户昵称', visible: false, children: [] }
]

// 显示所有列
const showAllColumns = () => {
  columns.value.forEach(col => {
    col.visible = true
  })
}

// 隐藏所有列
const hideAllColumns = () => {
  columns.value.forEach(col => {
    col.visible = false
  })
}

// 重置为默认配置
const resetColumns = () => {
  columns.value = JSON.parse(JSON.stringify(defaultColumns))
}
</script>
```

## 国际化支持

### 工具提示国际化

TableToolbar 自动根据当前语言显示工具提示文本:

```typescript
// 中文环境
'tooltip.print': '打印'
'tooltip.showSearch': '显示搜索'
'tooltip.hideSearch': '隐藏搜索'
'tooltip.resetSearch': '重置搜索'
'tooltip.refresh': '刷新'
'tooltip.columns': '列设置'

// 英文环境
'tooltip.print': 'Print'
'tooltip.showSearch': 'Show Search'
'tooltip.hideSearch': 'Hide Search'
'tooltip.resetSearch': 'Reset Search'
'tooltip.refresh': 'Refresh'
'tooltip.columns': 'Column Settings'
```

### 列标签国际化

列标签根据语言环境自动切换:

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { LanguageCode } from '@/systemConfig'

const layout = useLayout()

// 根据语言显示不同的列标签
const columns = computed(() => {
  const isZh = layout.language.value === LanguageCode.zh_CN

  return [
    {
      key: 0,
      field: 'userId',
      label: isZh ? '用户ID' : 'User ID',
      visible: true,
      children: []
    },
    {
      key: 1,
      field: 'userName',
      label: isZh ? '用户名称' : 'User Name',
      visible: true,
      children: []
    }
  ]
})
</script>
```

## 与 useTableHeight 配合

TableToolbar 常与 `useTableHeight` Composable 配合使用,实现表格高度自适应:

```vue
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams">
      <el-row :gutter="10">
        <el-col :span="6">
          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入用户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格工具栏 -->
    <TableToolbar
      v-model:showSearch="showSearch"
      :columns="columns"
      @reset-query="resetQuery"
      @query-table="getList"
    />

    <!-- 表格 - 高度自适应 -->
    <el-table
      :data="tableData"
      :height="tableHeight"
      style="width: 100%"
    >
      <el-table-column v-if="columns[0].visible" prop="userId" label="用户ID" />
      <el-table-column v-if="columns[1].visible" prop="userName" label="用户名称" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      @current-change="getList"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TableToolbar from '@/components/TableToolbar/TableToolbar.vue'
import useTableHeight from '@/composables/useTableHeight'

// 使用 useTableHeight
const { tableHeight, queryFormRef, showSearch, calculateTableHeight } = useTableHeight()

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userName: ''
})
const tableData = ref([])
const total = ref(0)

const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] }
])

const getList = () => {
  // API 请求逻辑
  // 请求完成后重新计算表格高度
  nextTick(() => {
    calculateTableHeight()
  })
}

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    userName: ''
  }
  getList()
}
</script>
```

**技术实现:**

- `useTableHeight()` 返回 `showSearch` 响应式变量
- TableToolbar 通过 `v-model:showSearch` 双向绑定
- 切换搜索区域时自动重新计算表格高度

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| showSearch | 是否显示搜索区域 | `boolean` | `true` |
| columns | 列配置选项 | `FieldVisibilityConfig[]` | `[]` |
| search | 是否显示搜索按钮 | `boolean` | `true` |
| gutter | 按钮组间距(px) | `number` | `10` |
| showPrint | 是否显示打印按钮 | `boolean` | `false` |
| printTitle | 打印标题 | `string` | `'数据列表'` |
| tableData | 表格数据(用于打印) | `any[]` | `[]` |
| tableColumns | 表格列配置(用于打印) | `FieldConfig[]` | `[]` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:showSearch | 搜索区域显示状态变化时触发 | `(value: boolean) => void` |
| resetQuery | 点击重置按钮时触发 | `() => void` |
| queryTable | 点击刷新按钮时触发 | `() => void` |
| print | 点击打印按钮时触发 | `() => void` |

### 类型定义

```typescript
/**
 * 列显示配置接口
 */
declare interface FieldVisibilityConfig {
  /** 列唯一标识 */
  key: string | number
  /** 列字段名 */
  field: string
  /** 列显示标签 */
  label: string
  /** 是否可见 */
  visible: boolean
  /** 子列配置 */
  children?: FieldVisibilityConfig[]
}

/**
 * 打印列配置接口
 */
declare interface FieldConfig {
  /** 字段属性名 */
  prop: string
  /** 字段显示标签 */
  label: string
  /** 列占用数 */
  span?: number
  /** 自定义插槽名称 */
  slot?: string
  /** 自定义格式化函数 */
  formatter?: (value: any, data: any) => string
  /** 数据类型 */
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency' |
         'boolean' | 'array' | 'dict' | 'image' | 'password' |
         'html' | 'file' | 'switch'
  /** 字典选项 */
  dictOptions?: DictItem[]
  /** 图片预览配置 */
  imageConfig?: any
  /** 是否隐藏字段 */
  hidden?: boolean | ((data: any) => boolean)
  /** 分组名称 */
  group?: string
  /** 是否不参与打印 */
  noPrint?: boolean
}

/**
 * 字典项接口
 */
interface DictItem {
  /** 字典值 */
  value: string | number
  /** 字典标签 */
  label: string
  /** 标签样式 */
  tagType?: 'success' | 'info' | 'warning' | 'danger'
}

/**
 * TableToolbar 组件Props接口
 */
interface TableToolbarProps {
  /** 是否显示搜索区域 */
  showSearch?: boolean
  /** 列配置选项 */
  columns?: FieldVisibilityConfig[]
  /** 是否显示搜索按钮 */
  search?: boolean
  /** 按钮组间距 */
  gutter?: number
  /** 是否显示打印按钮 */
  showPrint?: boolean
  /** 打印标题 */
  printTitle?: string
  /** 表格数据(用于打印) */
  tableData?: any[]
  /** 表格列配置(用于打印) */
  tableColumns?: FieldConfig[]
}
```

## 主题定制

### CSS 变量

TableToolbar 使用 Element Plus 主题变量:

```scss
// 按钮颜色
--el-button-default-background-color: #ffffff;
--el-button-default-border-color: #dcdfe6;
--el-button-default-text-color: #606266;

// Tooltip 颜色
--el-tooltip-bg-color: #303133;
--el-tooltip-text-color: #ffffff;

// 树形控件
--el-tree-node-hover-bg-color: #f5f7fa;
--el-tree-text-color: #606266;
```

### 自定义样式

```vue
<style scoped>
/* 自定义工具栏按钮样式 */
:deep(.el-button.is-circle) {
  width: 36px;
  height: 36px;
  padding: 8px;
  transition: all 0.3s;
}

:deep(.el-button.is-circle:hover) {
  background-color: var(--el-color-primary);
  color: #fff;
  border-color: var(--el-color-primary);
}

/* 自定义列设置弹窗样式 */
:deep(.el-popover) {
  min-width: 220px;
  max-height: 400px;
}

/* 自定义树形控件样式 */
:deep(.el-tree-node__content) {
  height: 32px;
  padding: 4px 0;
}

:deep(.el-tree-node__label) {
  font-size: 14px;
}
</style>
```

### 暗黑模式适配

```scss
.dark {
  .table-toolbar {
    :deep(.el-button) {
      background-color: #2a2a2a;
      border-color: #3a3a3a;
      color: #e5e5e5;

      &:hover {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: #fff;
      }
    }

    :deep(.el-popover) {
      background-color: #2a2a2a;
      border-color: #3a3a3a;
    }

    :deep(.el-tree) {
      background-color: transparent;
      color: #e5e5e5;
    }
  }
}
```

## 最佳实践

### 1. 合理配置列显示

```vue
<script lang="ts" setup>
// ✅ 推荐: 为每列设置合适的默认显示状态
const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: false, children: [] }, // 技术字段默认隐藏
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
  { key: 2, field: 'nickName', label: '用户昵称', visible: true, children: [] },
  { key: 3, field: 'createTime', label: '创建时间', visible: true, children: [] }
])

// ❌ 不推荐: 所有列都默认显示,可能造成信息过载
const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] },
  { key: 2, field: 'internalCode', label: '内部编码', visible: true, children: [] }, // 技术字段
  { key: 3, field: 'lastLoginIp', label: '最后登录IP', visible: true, children: [] } // 次要信息
])
</script>
```

### 2. 打印配置与表格列保持一致

```vue
<script lang="ts" setup>
// ✅ 推荐: 从表格列定义生成打印配置
const tableColumnsConfig = [
  { prop: 'userName', label: '用户名称', type: 'text' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: statusOptions },
  { prop: 'createTime', label: '创建时间', type: 'datetime' }
]

const columns = ref<FieldVisibilityConfig[]>(
  tableColumnsConfig.map((col, index) => ({
    key: index,
    field: col.prop,
    label: col.label,
    visible: true,
    children: []
  }))
)

const printColumns = ref<FieldConfig[]>(tableColumnsConfig)

// ❌ 不推荐: 表格列和打印配置不一致
const columns = ref([...]) // 10 列
const printColumns = ref([...]) // 6 列,缺少部分列
</script>
```

### 3. 持久化用户偏好设置

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

// ✅ 推荐: 保存用户的列显示偏好
const STORAGE_KEY = 'user-list-columns-config'

const loadColumns = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    return JSON.parse(saved)
  }
  return getDefaultColumns()
}

const columns = ref<FieldVisibilityConfig[]>(loadColumns())

watch(
  () => columns.value,
  (newColumns) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newColumns))
  },
  { deep: true }
)
</script>
```

### 4. 响应式处理列变化

```vue
<template>
  <el-table :data="tableData">
    <el-table-column
      v-for="col in visibleColumns"
      :key="col.field"
      :prop="col.field"
      :label="col.label"
    />
  </el-table>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// ✅ 推荐: 使用计算属性动态获取可见列
const visibleColumns = computed(() => {
  return columns.value.filter(col => col.visible)
})

// ❌ 不推荐: 手动维护每列的 v-if
// <el-table-column v-if="columns[0].visible" ... />
// <el-table-column v-if="columns[1].visible" ... />
</script>
```

### 5. 事件处理解耦

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    :columns="columns"
    @reset-query="handleReset"
    @query-table="handleQuery"
    @print="handlePrint"
  />
</template>

<script lang="ts" setup>
// ✅ 推荐: 将业务逻辑封装到独立的处理函数
const handleReset = () => {
  resetQueryParams()
  getList()
  ElMessage.success('已重置搜索条件')
}

const handleQuery = async () => {
  try {
    await getList()
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

const handlePrint = () => {
  // 自定义打印逻辑
}

// ❌ 不推荐: 内联复杂逻辑
// @reset-query="queryParams = {}; getList()"
</script>
```

## 常见问题

### 1. 列显示状态不更新

**问题原因:**

- 忘记在表格列上绑定 `v-if` 或 `v-show`
- 列配置的 `key` 不唯一

**解决方案:**

```vue
<template>
  <!-- ✅ 正确: 绑定 visible 状态 -->
  <el-table :data="tableData">
    <el-table-column
      v-if="columns[0].visible"
      prop="userId"
      label="用户ID"
    />
  </el-table>

  <!-- ❌ 错误: 没有绑定 visible -->
  <el-table :data="tableData">
    <el-table-column prop="userId" label="用户ID" />
  </el-table>
</template>

<script lang="ts" setup>
// ✅ 确保每列的 key 唯一
const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 1, field: 'userName', label: '用户名称', visible: true, children: [] }
])

// ❌ 错误: key 重复
const columns = ref<FieldVisibilityConfig[]>([
  { key: 0, field: 'userId', label: '用户ID', visible: true, children: [] },
  { key: 0, field: 'userName', label: '用户名称', visible: true, children: [] } // key 重复
])
</script>
```

### 2. 打印功能不生效

**问题原因:**

- 没有传递 `tableData` 或 `tableColumns`
- 浏览器阻止了打印弹窗
- 打印列配置错误

**解决方案:**

```vue
<template>
  <!-- ✅ 正确: 传递完整的打印配置 -->
  <TableToolbar
    :show-print="true"
    :print-title="'用户列表'"
    :table-data="tableData"
    :table-columns="printColumns"
    @print="handlePrint"
  />
</template>

<script lang="ts" setup>
// 确保数据和列配置都已准备好
const tableData = ref([...])
const printColumns = ref<FieldConfig[]>([
  { prop: 'userName', label: '用户名称', type: 'text' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: [...] }
])

// 如果需要自定义打印,监听 print 事件
const handlePrint = () => {
  console.log('开始打印', tableData.value, printColumns.value)
}
</script>
```

### 3. 搜索区域切换后表格高度异常

**问题原因:**

- 没有使用 `useTableHeight` Composable
- 切换后没有重新计算高度

**解决方案:**

```vue
<script lang="ts" setup>
import { watch, nextTick } from 'vue'
import useTableHeight from '@/composables/useTableHeight'

const { tableHeight, showSearch, calculateTableHeight } = useTableHeight()

// ✅ 监听 showSearch 变化,重新计算高度
watch(showSearch, () => {
  nextTick(() => {
    calculateTableHeight()
  })
})
</script>
```

### 4. 列配置持久化失败

**问题原因:**

- localStorage 存储限制
- 列配置包含不可序列化的数据(如函数)

**解决方案:**

```typescript
// ✅ 只保存必要的配置信息
const saveColumns = () => {
  const simpleColumns = columns.value.map(col => ({
    key: col.key,
    field: col.field,
    label: col.label,
    visible: col.visible
    // 不保存 children 等复杂结构
  }))

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simpleColumns))
  } catch (error) {
    console.error('保存列配置失败:', error)
    // 可以尝试使用 sessionStorage 或 IndexedDB
  }
}
```

### 5. 打印样式错乱

**问题原因:**

- 打印内容宽度超出纸张
- 表格列数过多

**解决方案:**

```typescript
// 自定义打印样式,适配纸张尺寸
const printWithCustomStyles = async () => {
  const { printHtml } = usePrint()

  const styles = `
    @page {
      size: A4 landscape; /* 横向打印 */
      margin: 1cm;
    }

    table {
      width: 100%;
      table-layout: fixed; /* 固定布局 */
      font-size: 10px; /* 缩小字体 */
    }

    td, th {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap; /* 超长文本省略 */
    }
  `

  await printHtml(printHtml, styles)
}
```

### 6. 层级列配置不生效

**问题原因:**

- `children` 数组未正确初始化
- 树形控件配置错误

**解决方案:**

```typescript
// ✅ 正确的层级结构
const columns = ref<FieldVisibilityConfig[]>([
  {
    key: 0,
    field: 'basicInfo',
    label: '基本信息',
    visible: true,
    children: [ // 必须是数组
      { key: 1, field: 'userId', label: '用户ID', visible: true, children: [] },
      { key: 2, field: 'userName', label: '用户名称', visible: true, children: [] }
    ]
  }
])

// ❌ 错误: children 不是数组
const columns = ref<FieldVisibilityConfig[]>([
  {
    key: 0,
    field: 'basicInfo',
    label: '基本信息',
    visible: true
    // children 未定义或为 null
  }
])
```

## 性能优化

### 大数据量打印优化

```typescript
// 分页打印大量数据
const printLargeData = async () => {
  const CHUNK_SIZE = 100 // 每页打印100条

  for (let i = 0; i < tableData.value.length; i += CHUNK_SIZE) {
    const chunk = tableData.value.slice(i, i + CHUNK_SIZE)
    await printTableWithData(chunk, printColumns.value, `用户列表 (第${i / CHUNK_SIZE + 1}页)`)
  }
}
```

### 列配置缓存

```typescript
// 使用 computed 缓存可见列
const visibleColumns = computed(() => {
  return columns.value.filter(col => col.visible)
})

// 避免重复计算
const columnMap = computed(() => {
  return new Map(
    columns.value.map(col => [col.field, col])
  )
})
```

## 总结

TableToolbar 是 RuoYi-Plus 前端框架中不可或缺的表格辅助组件,提供了完整的表格操作工具栏功能:

1. **功能完整** - 打印、搜索、刷新、重置、列管理一应俱全
2. **易于集成** - 简单的 Props 和 Events 设计,快速集成到任何表格页面
3. **灵活扩展** - 支持自定义打印逻辑、列配置持久化等扩展需求
4. **国际化** - 完整的中英文支持
5. **类型安全** - 完整的 TypeScript 类型定义

合理使用 TableToolbar 可以显著提升数据表格的用户体验和开发效率,建议在所有表格页面中统一使用此组件。
