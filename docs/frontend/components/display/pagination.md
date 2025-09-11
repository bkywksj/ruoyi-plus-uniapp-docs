# Pagination 分页组件

基于 Element Plus 封装的分页组件，提供响应式布局、自动滚动、页码管理等功能。

## 基础用法

最简单的使用方式，提供基本的分页功能：

```vue
<template>
  <div>
    <!-- 表格内容 -->
    <el-table :data="tableData">
      <!-- 表格列 -->
    </el-table>
    
    <!-- 分页组件 -->
    <Pagination
      v-model:page="currentPage"
      v-model:limit="pageSize"
      :total="total"
      @pagination="handlePagination"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)
const tableData = ref([])

const handlePagination = ({ page, limit }) => {
  console.log(`当前页: ${page}, 每页条数: ${limit}`)
  // 获取数据逻辑
  fetchData(page, limit)
}

const fetchData = (page, limit) => {
  // API 调用
}
</script>
```

## 自定义布局和样式

自定义分页组件的布局、大小和对齐方式：

```vue
<template>
  <Pagination
    v-model:page="currentPage"
    v-model:limit="pageSize"
    :total="total"
    size="small"
    float="center"
    :background="false"
    layout="prev, pager, next"
    @pagination="handlePagination"
  />
</template>
```

## 自定义每页显示数量选项

通过 `page-sizes` 属性自定义每页显示记录数的选项：

```vue
<template>
  <Pagination
    v-model:page="currentPage"
    v-model:limit="pageSize"
    :total="total"
    :page-sizes="[5, 10, 20, 50, 100]"
    @pagination="handlePagination"
  />
</template>
```

## 移动端适配

组件会自动根据屏幕尺寸进行适配：

```vue
<template>
  <Pagination
    v-model:page="currentPage"
    v-model:limit="pageSize"
    :total="total"
    :pager-count="pagerCount"
    @pagination="handlePagination"
  />
</template>

<script setup>
// pagerCount 会根据屏幕尺寸自动调整
// 移动端: 5个页码按钮
// PC端: 7个页码按钮
</script>
```

## 禁用自动滚动

某些场景下不需要页码切换时的自动滚动：

```vue
<template>
  <Pagination
    v-model:page="currentPage"
    v-model:limit="pageSize"
    :total="total"
    :auto-scroll="false"
    @pagination="handlePagination"
  />
</template>
```

## 使用组件方法

通过 ref 调用组件提供的方法：

```vue
<template>
  <div>
    <el-button @click="goToFirstPage">第一页</el-button>
    <el-button @click="goToLastPage">最后一页</el-button>
    <el-button @click="goToSpecificPage">跳转到第5页</el-button>
    <el-button @click="showPaginationInfo">显示分页信息</el-button>
    
    <Pagination
      ref="paginationRef"
      v-model:page="currentPage"
      v-model:limit="pageSize"
      :total="total"
      @pagination="handlePagination"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const paginationRef = ref()
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)

const goToFirstPage = () => {
  paginationRef.value?.goToFirst()
}

const goToLastPage = () => {
  paginationRef.value?.goToLast()
}

const goToSpecificPage = () => {
  paginationRef.value?.goToPage(5)
}

const showPaginationInfo = () => {
  const info = paginationRef.value?.getPaginationInfo()
  console.log('分页信息:', info)
}

const handlePagination = ({ page, limit }) => {
  fetchData(page, limit)
}
</script>
```

## 条件显示

根据业务需求控制分页组件的显示：

```vue
<template>
  <Pagination
    v-model:page="currentPage"
    v-model:limit="pageSize"
    :total="total"
    :hidden="total <= 10"
    @pagination="handlePagination"
  />
</template>

<script setup>
// 当总记录数小于等于10时自动隐藏分页组件
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| total | 总记录数 | `number` | — | `0` |
| page | 当前页码（支持 v-model） | `number` | — | `1` |
| limit | 每页显示记录数（支持 v-model） | `number` | — | `20` |
| page-sizes | 可选的每页显示记录数 | `number[]` | — | `[10, 50, 1000, 2147483647]` |
| pager-count | 页码按钮的数量 | `number` | — | 根据屏幕宽度自适应 |
| size | 组件大小 | `ElSize` | `large` / `default` / `small` | — |
| layout | 分页布局 | `string` | — | `'total, sizes, prev, pager, next, jumper'` |
| background | 是否为分页按钮添加背景色 | `boolean` | — | `true` |
| auto-scroll | 切换页码时是否自动滚动到顶部 | `boolean` | — | `true` |
| scroll-duration | 滚动动画持续时间（毫秒） | `number` | — | `800` |
| hidden | 是否隐藏分页组件 | `boolean` | — | `false` |
| float | 分页组件的对齐方式 | `string` | `left` / `right` / `center` | `right` |
| reset-on-size-change | 页码超出范围时是否重置到第一页 | `boolean` | — | `true` |

### PaginationEvent 接口

```typescript
interface PaginationEvent {
  /** 当前页码 */
  page: number
  /** 每页显示记录数 */
  limit: number
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:page | 页码变化时触发 | `(page: number)` |
| update:limit | 每页显示记录数变化时触发 | `(limit: number)` |
| pagination | 分页参数变化时触发（推荐使用） | `(event: PaginationEvent)` |
| size-change | 每页显示记录数变化时触发 | `(size: number)` |
| current-change | 当前页码变化时触发 | `(current: number)` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| goToPage | 跳转到指定页码 | `(page: number)` | — |
| goToFirst | 跳转到第一页 | — | — |
| goToLast | 跳转到最后一页 | — | — |
| getPaginationInfo | 获取当前分页信息 | — | `PaginationInfo` |

### PaginationInfo 接口

```typescript
interface PaginationInfo {
  /** 当前页码 */
  currentPage: number
  /** 每页显示记录数 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
}
```

## 响应式特性

组件具有完整的响应式适配能力：

### 桌面端 (> 991px)
- 显示完整的分页信息（总数、每页显示数、跳转器）
- 默认显示 7 个页码按钮
- 右对齐布局

### 移动端 (≤ 991px)
- 自动隐藏总数和跳转器信息
- 默认显示 5 个页码按钮
- 居中对齐布局
- 减少内边距以适配小屏幕

### 小屏幕 (≤ 768px)
- 进一步优化间距
- 分页按钮居中显示
- 隐藏非必要信息

## 自动滚动功能

组件内置智能滚动功能：

- **触发时机**：页码或每页显示数变化时
- **滚动目标**：页面顶部（scrollTop: 0）
- **动画效果**：平滑滚动动画
- **持续时间**：可配置，默认 800ms
- **开关控制**：可通过 `auto-scroll` 属性禁用

## 特性

- **双向数据绑定**：支持 v-model 语法糖
- **响应式设计**：自动适配不同屏幕尺寸
- **智能重置**：页码超出范围时自动重置
- **自动滚动**：页码切换时平滑滚动到顶部
- **灵活布局**：支持多种对齐方式和布局选项
- **完整事件**：提供丰富的事件回调
- **方法暴露**：提供编程式导航方法
- **条件显示**：支持根据数据量自动隐藏

## 样式说明

组件采用现代化的分页设计：

- 清爽的间距和对齐
- 响应式的布局调整
- 平滑的动画过渡
- 移动端优化的交互体验
- 支持主题定制

## 最佳实践

1. **推荐使用 `pagination` 事件**而不是单独监听 `size-change` 和 `current-change`
2. **合理设置 `page-sizes`**，避免选项过多造成用户困扰
3. **在数据较少时使用 `hidden` 属性**自动隐藏分页组件
4. **移动端场景下考虑简化 `layout`**，只保留必要的分页元素
5. **使用组件方法进行编程式导航**，提升用户体验

## 注意事项

1. 组件会在总记录数为 0 时自动隐藏
2. `page-sizes` 数组中的 `2147483647` 表示"全部"选项
3. 页码超出范围时会自动调整到有效范围内
4. 自动滚动功能使用 `nextTick` 确保 DOM 更新完成
5. 移动端会自动隐藏部分分页信息以适配小屏幕
6. 组件使用 `useMediaQuery` 进行响应式检测
