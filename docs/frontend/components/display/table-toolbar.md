# TableToolbar 表格工具栏组件

用于表格操作的工具栏组件，提供搜索切换、重置、刷新和列显示配置等功能。

## 基础用法

最简单的使用方式，提供基本的表格操作功能：

```vue
<template>
  <TableToolbar 
    v-model:show-search="showSearch"
    @reset-query="handleReset"
    @query-table="handleQuery"
  />
</template>

<script setup>
import { ref } from 'vue'

const showSearch = ref(true)

const handleReset = () => {
  console.log('重置搜索条件')
}

const handleQuery = () => {
  console.log('刷新表格数据')
}
</script>
```

## 带列配置功能

通过 `columns` 属性配置可控制显示的列：

```vue
<template>
  <TableToolbar 
    v-model:show-search="showSearch"
    :columns="columnConfig"
    @reset-query="handleReset"
    @query-table="handleQuery"
  />
</template>

<script setup>
import { ref } from 'vue'

const showSearch = ref(true)

const columnConfig = ref([
  { key: 'name', label: '姓名', field: 'Name', visible: true },
  { key: 'age', label: '年龄', field: 'Age', visible: true },
  { key: 'email', label: '邮箱', field: 'Email', visible: false },
  { key: 'phone', label: '电话', field: 'Phone', visible: true }
])

const handleReset = () => {
  // 重置搜索表单
}

const handleQuery = () => {
  // 重新获取表格数据
}
</script>
```

## 隐藏搜索按钮

某些场景下不需要搜索功能时，可以隐藏搜索按钮：

```vue
<template>
  <TableToolbar 
    v-model:show-search="showSearch"
    :search="false"
    :columns="columnConfig"
    @reset-query="handleReset"
    @query-table="handleQuery"
  />
</template>
```

## 自定义按钮间距

通过 `gutter` 属性调整工具栏与其他元素的间距：

```vue
<template>
  <div class="table-container">
    <div class="search-area" v-show="showSearch">
      <!-- 搜索表单 -->
    </div>
    <div class="toolbar-container">
      <div class="left-actions">
        <el-button type="primary">新增</el-button>
        <el-button>批量删除</el-button>
      </div>
      <TableToolbar 
        v-model:show-search="showSearch"
        :columns="columnConfig"
        :gutter="20"
        @reset-query="handleReset"
        @query-table="handleQuery"
      />
    </div>
    <!-- 表格内容 -->
  </div>
</template>
```

## 嵌套列配置

支持多级嵌套的列配置结构：

```vue
<template>
  <TableToolbar 
    :columns="nestedColumns"
    @reset-query="handleReset"
    @query-table="handleQuery"
  />
</template>

<script setup>
const nestedColumns = ref([
  {
    key: 'basic',
    label: '基础信息',
    field: 'Basic Info',
    visible: true,
    children: [
      { key: 'name', label: '姓名', field: 'Name', visible: true },
      { key: 'age', label: '年龄', field: 'Age', visible: true }
    ]
  },
  {
    key: 'contact',
    label: '联系信息',
    field: 'Contact Info',
    visible: true,
    children: [
      { key: 'email', label: '邮箱', field: 'Email', visible: false },
      { key: 'phone', label: '电话', field: 'Phone', visible: true }
    ]
  }
])
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| show-search | 是否显示搜索区域（支持 v-model） | `boolean` | — | `true` |
| columns | 列配置选项，用于控制表格列的显示隐藏 | `FieldVisibilityConfig[]` | — | `[]` |
| search | 是否显示搜索切换按钮 | `boolean` | — | `true` |
| gutter | 工具栏右侧边距 | `number` | — | `10` |

### FieldVisibilityConfig 接口

```typescript
interface FieldVisibilityConfig {
  /** 列的唯一标识 */
  key: string | number
  /** 中文标签 */
  label: string
  /** 英文字段名 */
  field: string
  /** 是否可见 */
  visible: boolean
  /** 子级列配置（可选） */
  children?: FieldVisibilityConfig[]
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:show-search | 搜索区域显示状态变化时触发 | `(visible: boolean)` |
| reset-query | 点击重置按钮时触发 | — |
| query-table | 点击刷新按钮时触发 | — |

## 功能按钮

组件提供以下操作按钮：

### 搜索切换按钮
- **图标**：Search
- **功能**：切换搜索区域的显示/隐藏状态
- **提示文本**：根据当前状态显示"显示搜索"或"隐藏搜索"

### 重置按钮
- **图标**：RefreshLeft
- **功能**：重置搜索条件
- **提示文本**：重置搜索

### 刷新按钮
- **图标**：Refresh
- **功能**：刷新表格数据
- **提示文本**：刷新

### 列设置按钮
- **图标**：Setting
- **功能**：配置表格列的显示/隐藏
- **提示文本**：列设置
- **交互方式**：点击弹出树形选择器

## 国际化支持

组件完全支持国际化，会根据当前语言环境自动调整：

- **中文环境**：使用 `label` 字段显示列名
- **英文环境**：使用 `field` 字段显示列名
- **提示文本**：通过 i18n 系统自动翻译

## 特性

- **响应式设计**：支持不同屏幕尺寸的自适应布局
- **国际化支持**：完整的多语言支持
- **列配置管理**：可视化的列显示控制
- **嵌套结构**：支持多级列配置
- **状态同步**：列配置状态实时同步
- **无障碍访问**：完整的键盘导航和屏幕阅读器支持

## 注意事项

1. 组件使用 `v-model:show-search` 进行双向数据绑定
2. `columns` 配置会直接修改原数组对象的 `visible` 属性
3. 列配置弹出框的最小宽度为 200px
4. 树形控件支持父子节点的关联选择
5. 组件会在挂载时根据 `columns` 配置初始化选中状态
6. 按钮间距可以通过 `gutter` 属性进行调整
7. 当 `columns` 数组为空时，列设置按钮会自动隐藏
