# Table 表格

## 介绍

Table 是一个功能丰富的表格组件,用于展示多条结构类似的数据。它支持配置式和子组件式两种使用方式,提供了固定表头、固定列、排序、斑马纹等常用功能,适用于数据列表展示、数据对比分析等场景。

**核心特性:**

- **双模式支持** - 支持配置式(columns)和子组件式(wd-table-col)两种定义列的方式
- **固定表头** - 支持表头固定,内容区域独立滚动
- **固定列** - 支持将重要列固定在左侧,横向滚动时保持可见
- **列排序** - 支持单列排序功能,提供升序、降序、重置三种状态
- **斑马纹** - 支持奇偶行不同背景色,提高数据可读性
- **序号列** - 支持自动生成序号列,可自定义序号列配置
- **自定义渲染** - 支持通过插槽或渲染函数自定义单元格内容
- **行点击事件** - 支持监听行点击事件,便于实现行选择等功能
- **暗黑模式** - 内置暗黑模式样式适配

## 基本用法

### 配置式使用

通过 `columns` 属性定义列配置,`data` 属性传入数据:

```vue
<template>
  <view class="demo">
    <wd-table :columns="columns" :data="tableData" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'age', label: '年龄', width: 100 },
  { prop: 'address', label: '地址', width: 250 }
])

const tableData = ref([
  { name: '张三', age: 28, address: '北京市朝阳区' },
  { name: '李四', age: 32, address: '上海市浦东新区' },
  { name: '王五', age: 25, address: '广州市天河区' },
  { name: '赵六', age: 30, address: '深圳市南山区' }
])
</script>

```

**使用说明:**
- `columns` 数组中每项定义一列,`prop` 对应数据字段,`label` 为列标题
- `data` 数组中每项为一行数据,字段名需与 `prop` 对应
- `width` 设置列宽度,默认单位为 rpx

### 子组件式使用

通过 `wd-table-col` 子组件定义列:

```vue
<template>
  <view class="demo">
    <wd-table :data="tableData">
      <wd-table-col prop="name" label="姓名" :width="150" />
      <wd-table-col prop="age" label="年龄" :width="100" />
      <wd-table-col prop="address" label="地址" :width="250" />
    </wd-table>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tableData = ref([
  { name: '张三', age: 28, address: '北京市朝阳区' },
  { name: '李四', age: 32, address: '上海市浦东新区' },
  { name: '王五', age: 25, address: '广州市天河区' }
])
</script>
```

**使用说明:**
- 子组件式更符合模板式开发习惯
- 每个 `wd-table-col` 组件代表一列

### 边框和斑马纹

通过 `border` 和 `stripe` 属性控制边框和斑马纹显示:

```vue
<template>
  <view class="demo">
    <text class="title">带边框</text>
    <wd-table :columns="columns" :data="tableData" border />

    <text class="title">斑马纹</text>
    <wd-table :columns="columns" :data="tableData" stripe :border="false" />

    <text class="title">边框 + 斑马纹</text>
    <wd-table :columns="columns" :data="tableData" border stripe />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'score', label: '分数', width: 100 }
])

const tableData = ref([
  { name: '张三', score: 95 },
  { name: '李四', score: 88 },
  { name: '王五', score: 92 },
  { name: '赵六', score: 85 }
])
</script>
```

**使用说明:**
- `border` 默认为 `true`,显示边框
- `stripe` 默认为 `true`,显示斑马纹
- 斑马纹使奇数行和偶数行背景色不同

### 显示序号列

通过 `index` 属性启用序号列:

```vue
<template>
  <view class="demo">
    <!-- 默认序号列 -->
    <wd-table :columns="columns" :data="tableData" :index="true" />

    <!-- 自定义序号列配置 -->
    <wd-table
      :columns="columns"
      :data="tableData"
      :index="{ label: '序号', width: 80, align: 'center' }"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'department', label: '部门', width: 150 }
])

const tableData = ref([
  { name: '张三', department: '技术部' },
  { name: '李四', department: '产品部' },
  { name: '王五', department: '设计部' }
])
</script>
```

**使用说明:**
- `index` 设为 `true` 启用默认序号列
- `index` 设为对象可自定义序号列的 `label`、`width`、`align` 等属性
- 序号从 1 开始自动递增

### 固定表头

通过 `fixed-header` 和 `height` 属性实现固定表头:

```vue
<template>
  <view class="demo">
    <wd-table
      :columns="columns"
      :data="tableData"
      :height="400"
      fixed-header
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'status', label: '状态', width: 100 }
])

const tableData = ref([
  { id: 1, name: '张三', status: '在线' },
  { id: 2, name: '李四', status: '离线' },
  { id: 3, name: '王五', status: '在线' },
  { id: 4, name: '赵六', status: '忙碌' },
  { id: 5, name: '钱七', status: '在线' },
  { id: 6, name: '孙八', status: '离线' },
  { id: 7, name: '周九', status: '在线' },
  { id: 8, name: '吴十', status: '忙碌' }
])
</script>
```

**使用说明:**
- `fixed-header` 默认为 `true`,启用固定表头
- `height` 设置表格高度,超出时内容区域可滚动
- 表头会固定在顶部,不随内容滚动

### 固定列

通过列配置的 `fixed` 属性固定列:

```vue
<template>
  <view class="demo">
    <wd-table :columns="columns" :data="tableData" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 120, fixed: true },
  { prop: 'phone', label: '手机号', width: 200 },
  { prop: 'email', label: '邮箱', width: 250 },
  { prop: 'address', label: '地址', width: 300 },
  { prop: 'remark', label: '备注', width: 200 }
])

const tableData = ref([
  {
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区建国路88号',
    remark: '重要客户'
  },
  {
    name: '李四',
    phone: '13900139000',
    email: 'lisi@example.com',
    address: '上海市浦东新区陆家嘴金融中心',
    remark: '普通客户'
  }
])
</script>
```

**使用说明:**
- 设置 `fixed: true` 的列会固定在左侧
- 横向滚动时,固定列保持可见
- 固定列会显示阴影效果,区分固定区域和滚动区域

### 列排序

通过列配置的 `sortable` 属性启用排序:

```vue
<template>
  <view class="demo">
    <wd-table
      :columns="columns"
      :data="sortedData"
      @sort-method="handleSort"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'age', label: '年龄', width: 100, sortable: true },
  { prop: 'score', label: '分数', width: 100, sortable: true }
])

const tableData = ref([
  { name: '张三', age: 28, score: 95 },
  { name: '李四', age: 32, score: 88 },
  { name: '王五', age: 25, score: 92 },
  { name: '赵六', age: 30, score: 85 }
])

const sortConfig = ref<{ prop: string; direction: number } | null>(null)

const sortedData = computed(() => {
  if (!sortConfig.value || sortConfig.value.direction === 0) {
    return tableData.value
  }

  const { prop, direction } = sortConfig.value
  return [...tableData.value].sort((a, b) => {
    const aVal = a[prop]
    const bVal = b[prop]
    return direction === 1 ? aVal - bVal : bVal - aVal
  })
})

const handleSort = (column: { prop: string; sortDirection: number }) => {
  sortConfig.value = {
    prop: column.prop,
    direction: column.sortDirection
  }
}
</script>
```

**使用说明:**
- 设置 `sortable: true` 的列标题会显示排序按钮
- 点击排序按钮切换排序状态: 无序(0) → 升序(1) → 降序(-1) → 无序(0)
- `sort-method` 事件返回当前排序列信息,需自行实现排序逻辑

### 自定义列宽和对齐

通过 `width` 和 `align` 属性设置列宽和对齐方式:

```vue
<template>
  <view class="demo">
    <wd-table :columns="columns" :data="tableData" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'name', label: '姓名', width: 150, align: 'left' },
  { prop: 'amount', label: '金额', width: 120, align: 'right' },
  { prop: 'status', label: '状态', width: 100, align: 'center' }
])

const tableData = ref([
  { id: 1, name: '订单A', amount: '¥1,280.00', status: '已完成' },
  { id: 2, name: '订单B', amount: '¥3,560.00', status: '处理中' },
  { id: 3, name: '订单C', amount: '¥890.00', status: '待支付' }
])
</script>
```

**使用说明:**
- `width` 设置列宽,默认 200rpx
- `align` 设置对齐方式,可选 `left`、`center`、`right`,默认 `left`

### 自定义行高

通过 `row-height` 属性设置行高:

```vue
<template>
  <view class="demo">
    <wd-table
      :columns="columns"
      :data="tableData"
      :row-height="80"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'title', label: '职位', width: 200 }
])

const tableData = ref([
  { name: '张三', title: '高级工程师' },
  { name: '李四', title: '产品经理' },
  { name: '王五', title: 'UI设计师' }
])
</script>
```

**使用说明:**
- `row-height` 默认为 100rpx
- 单位为 rpx,可根据内容调整

### 自定义渲染(渲染函数)

通过列配置的 `render` 函数自定义单元格内容:

```vue
<template>
  <view class="demo">
    <wd-table :columns="columns" :data="tableData" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  {
    prop: 'status',
    label: '状态',
    width: 120,
    render: (row: any) => {
      const statusMap: Record<string, string> = {
        1: '✅ 已完成',
        2: '⏳ 处理中',
        3: '❌ 已取消'
      }
      return statusMap[row.status] || '未知'
    }
  },
  {
    prop: 'price',
    label: '价格',
    width: 120,
    align: 'right',
    render: (row: any) => `¥${row.price.toFixed(2)}`
  }
])

const tableData = ref([
  { name: '商品A', status: 1, price: 99.9 },
  { name: '商品B', status: 2, price: 199 },
  { name: '商品C', status: 3, price: 59.5 }
])
</script>
```

**使用说明:**
- `render` 函数接收 `row`(行数据) 和 `index`(行索引) 参数
- 返回字符串作为单元格显示内容

### 自定义渲染(插槽)

通过插槽自定义单元格内容:

```vue
<template>
  <view class="demo">
    <wd-table :columns="columns" :data="tableData">
      <template #column-status="{ row }">
        <view :class="['status-tag', `status-${row.status}`]">
          {{ statusText[row.status] }}
        </view>
      </template>
      <template #column-action="{ row, index }">
        <view class="action-buttons">
          <text class="btn edit" @click="handleEdit(row)">编辑</text>
          <text class="btn delete" @click="handleDelete(index)">删除</text>
        </view>
      </template>
    </wd-table>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const statusText: Record<number, string> = {
  1: '启用',
  2: '禁用'
}

const columns = ref([
  { prop: 'name', label: '名称', width: 150 },
  { prop: 'status', label: '状态', width: 100, useSlot: true },
  { prop: 'action', label: '操作', width: 150, useSlot: true }
])

const tableData = ref([
  { name: '配置项A', status: 1 },
  { name: '配置项B', status: 2 },
  { name: '配置项C', status: 1 }
])

const handleEdit = (row: any) => {
  console.log('编辑:', row)
}

const handleDelete = (index: number) => {
  tableData.value.splice(index, 1)
}
</script>

```

**使用说明:**
- 设置 `useSlot: true` 启用插槽模式
- 插槽名称默认为 `column-{prop}`,也可通过 `slotName` 自定义
- 插槽接收 `row`(行数据)、`index`(行索引)、`column`(列配置) 参数

### 行点击事件

监听 `row-click` 事件处理行点击:

```vue
<template>
  <view class="demo">
    <wd-table
      :columns="columns"
      :data="tableData"
      @row-click="handleRowClick"
    />
    <view v-if="selectedRow" class="selected-info">
      已选择: {{ selectedRow.name }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'name', label: '姓名', width: 150 },
  { prop: 'department', label: '部门', width: 150 }
])

const tableData = ref([
  { name: '张三', department: '技术部' },
  { name: '李四', department: '产品部' },
  { name: '王五', department: '设计部' }
])

const selectedRow = ref<any>(null)

const handleRowClick = ({ rowIndex }: { rowIndex: number }) => {
  selectedRow.value = tableData.value[rowIndex]
}
</script>
```

### 隐藏表头

通过 `show-header` 属性控制表头显示:

```vue
<template>
  <view class="demo">
    <wd-table
      :columns="columns"
      :data="tableData"
      :show-header="false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref([
  { prop: 'label', label: '标签', width: 150 },
  { prop: 'value', label: '值', width: 200 }
])

const tableData = ref([
  { label: '姓名', value: '张三' },
  { label: '年龄', value: '28岁' },
  { label: '职业', value: '工程师' }
])
</script>
```

## API

### Table Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | 列配置数组(配置式) | `TableColumn[]` | `[]` |
| data | 表格数据 | `Array<Record<string, any>>` | `[]` |
| border | 是否显示边框 | `boolean` | `true` |
| stripe | 是否显示斑马纹 | `boolean` | `true` |
| height | 表格高度 | `string \| number` | - |
| row-height | 行高 | `string \| number` | `100` |
| show-header | 是否显示表头 | `boolean` | `true` |
| ellipsis | 是否超出省略(最多2行) | `boolean` | `true` |
| index | 是否显示序号列,可传对象自定义配置 | `boolean \| Partial<TableColumn>` | `false` |
| fixed-header | 是否固定表头 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### TableColumn 列配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| prop | 列对应的数据字段 | `string` | - |
| label | 列标题 | `string` | - |
| width | 列宽度 | `string \| number` | `200` |
| sortable | 是否可排序 | `boolean` | `false` |
| fixed | 是否固定列 | `boolean` | `false` |
| align | 对齐方式 | `'left' \| 'center' \| 'right'` | `'left'` |
| sortDirection | 初始排序方向 | `0 \| 1 \| -1` | `0` |
| render | 自定义渲染函数 | `(row: any, index: number) => string` | - |
| useSlot | 是否使用插槽 | `boolean` | `false` |
| slotName | 自定义插槽名称 | `string` | `column-{prop}` |

### Table Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| sort-method | 排序变化时触发 | `column: TableColumn` |
| row-click | 行点击时触发 | `{ rowIndex: number }` |

### Table Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 默认插槽,用于放置 wd-table-col 组件 | - |
| column-{prop} | 自定义列内容插槽 | `{ row, index, column }` |

### TableCol Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| prop | 列对应的数据字段 | `string` | - |
| label | 列标题 | `string` | - |
| width | 列宽度 | `string \| number` | `200` |
| sortable | 是否可排序 | `boolean` | `false` |
| fixed | 是否固定列 | `boolean` | `false` |
| align | 对齐方式 | `'left' \| 'center' \| 'right'` | `'left'` |
| custom-class | 自定义样式类 | `string` | `''` |
| custom-style | 自定义样式 | `string` | `''` |

### TableCol Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| value | 自定义单元格内容 | `{ row, index }` |

### 类型定义

```typescript
/** 对齐方式类型 */
type AlignType = 'left' | 'center' | 'right'

/** 排序方向类型: 0-无序, 1-升序, -1-降序 */
type SortDirection = 0 | 1 | -1

/** 表格列配置接口 */
interface TableColumn {
  /** 列对应字段 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: string | number
  /** 是否可排序 */
  sortable?: boolean
  /** 对齐方式 */
  align?: AlignType
  /** 排序方向 */
  sortDirection?: SortDirection
  /** 是否固定列 */
  fixed?: boolean
  /** 自定义渲染函数 */
  render?: (row: any, index: number) => string
  /** 插槽名称 */
  slotName?: string
  /** 是否使用插槽 */
  useSlot?: boolean
}
```

## 主题定制

### CSS 变量

Table 组件提供以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-table-color | 表格文字颜色 | `rgba(0, 0, 0, 0.9)` |
| --wot-table-bg | 表格背景颜色 | `#ffffff` |
| --wot-table-stripe-bg | 斑马纹背景颜色 | `#f3f3f3` |
| --wot-table-border-color | 边框颜色 | `#ececec` |
| --wot-table-font-size | 字体大小 | `26rpx` |

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <wd-table
      :columns="columns"
      :data="tableData"
      custom-class="custom-table"
    />
  </view>
</template>

<style lang="scss">
.custom-table {
  --wot-table-color: #333;
  --wot-table-bg: #fafafa;
  --wot-table-stripe-bg: #f0f0f0;
  --wot-table-border-color: #e0e0e0;
  --wot-table-font-size: 28rpx;
}
</style>
```

## 最佳实践

### 1. 合理设置列宽

根据内容类型设置合适的列宽:

```vue
<script lang="ts" setup>
const columns = ref([
  { prop: 'id', label: 'ID', width: 80, align: 'center' },      // ID 列较窄
  { prop: 'name', label: '名称', width: 150 },                   // 名称适中
  { prop: 'description', label: '描述', width: 300 },            // 描述较宽
  { prop: 'price', label: '价格', width: 100, align: 'right' }, // 金额右对齐
  { prop: 'status', label: '状态', width: 80, align: 'center' } // 状态居中
])
</script>
```

### 2. 大数据量优化

对于大数据量,建议设置固定高度并启用固定表头:

```vue
<template>
  <wd-table
    :columns="columns"
    :data="tableData"
    :height="600"
    fixed-header
    :row-height="80"
  />
</template>
```

### 3. 排序与数据联动

排序时建议使用计算属性处理数据:

```vue
<script lang="ts" setup>
const sortConfig = ref({ prop: '', direction: 0 })

const sortedData = computed(() => {
  if (!sortConfig.value.prop || sortConfig.value.direction === 0) {
    return tableData.value
  }
  return [...tableData.value].sort((a, b) => {
    // 排序逻辑
  })
})
</script>
```

## 常见问题

### 1. 列宽不生效

**问题原因:**
- 所有列宽总和小于表格容器宽度时,列会自动扩展

**解决方案:**
确保列宽总和大于等于容器宽度,或设置合理的列宽。

### 2. 固定列显示异常

**问题原因:**
- 固定列需要有明确的宽度

**解决方案:**

```vue
<script lang="ts" setup>
const columns = ref([
  { prop: 'name', label: '姓名', width: 120, fixed: true }, // 固定列必须设置宽度
  { prop: 'other', label: '其他', width: 200 }
])
</script>
```

### 3. 排序不生效

**问题原因:**
- 未监听 `sort-method` 事件实现排序逻辑

**解决方案:**
组件只负责触发排序事件,排序逻辑需自行实现。

### 4. 自定义内容不显示

**问题原因:**
- 配置式使用插槽时未设置 `useSlot: true`

**解决方案:**

```vue
<script lang="ts" setup>
const columns = ref([
  { prop: 'status', label: '状态', width: 100, useSlot: true }
])
</script>
```
