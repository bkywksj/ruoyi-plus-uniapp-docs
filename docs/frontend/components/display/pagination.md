# Pagination 分页组件

基于Element Plus的增强分页组件，提供更丰富的功能和更好的用户体验。

## 📋 基础用法

### 简单分页

```vue
<template>
  <div>
    <!-- 数据表格 -->
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>

    <!-- 分页组件 -->
    <Pagination
      v-model:current="queryParams.pageNum"
      v-model:size="queryParams.pageSize"
      :total="total"
      @change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/Pagination/index.vue'

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

const total = ref(0)
const tableData = ref([])

const handlePageChange = () => {
  console.log('页码变化:', queryParams.pageNum, queryParams.pageSize)
  // 重新获取数据
  fetchData()
}

const fetchData = async () => {
  // 模拟API调用
  console.log('获取数据...', queryParams)
}
</script>
```

### 完整功能分页

```vue
<template>
  <div>
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="status" label="状态" />
    </el-table>

    <Pagination
      v-model:current="pagination.current"
      v-model:size="pagination.size"
      :total="pagination.total"
      :show-size-changer="true"
      :show-quick-jumper="true"
      :show-total="true"
      :page-sizes="[10, 20, 50, 100]"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      @change="handleChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const handleChange = (page: number) => {
  console.log('页码变化:', page)
  fetchData()
}

const handleSizeChange = (size: number) => {
  console.log('页面大小变化:', size)
  pagination.current = 1 // 重置到第一页
  fetchData()
}

const fetchData = async () => {
  // API调用逻辑
}
</script>
```

## 🎯 组件实现

### Pagination 组件

```vue
<!-- components/Pagination/index.vue -->
<template>
  <div
    v-if="total > 0"
    class="pagination-container"
    :class="{ 'hidden': hidden }"
  >
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      :background="background"
      :small="small"
      :disabled="disabled"
      :hide-on-single-page="hideOnSinglePage"
      :pager-count="pagerCount"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <!-- 额外信息 -->
    <div v-if="showInfo" class="pagination-info">
      <span class="info-text">
        共 {{ total }} 条记录，每页显示 {{ pageSize }} 条
      </span>
      <span v-if="showRange" class="range-text">
        显示第 {{ rangeStart }} - {{ rangeEnd }} 条记录
      </span>
    </div>

    <!-- 快速跳转 -->
    <div v-if="showQuickJumper && !layout.includes('jumper')" class="quick-jumper">
      <span>跳至</span>
      <el-input-number
        v-model="jumpPage"
        :min="1"
        :max="totalPages"
        :controls="false"
        size="small"
        style="width: 80px"
        @keyup.enter="handleJump"
      />
      <span>页</span>
      <el-button size="small" @click="handleJump">跳转</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // v-model 绑定
  current?: number
  size?: number

  // 基础配置
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  small?: boolean
  disabled?: boolean
  hidden?: boolean

  // 显示配置
  hideOnSinglePage?: boolean
  pagerCount?: number
  showInfo?: boolean
  showRange?: boolean
  showQuickJumper?: boolean

  // 自定义配置
  showSizeChanger?: boolean
  showTotal?: boolean
}

interface Emits {
  (e: 'update:current', value: number): void
  (e: 'update:size', value: number): void
  (e: 'change', current: number, size: number): void
  (e: 'current-change', current: number): void
  (e: 'size-change', size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  current: 1,
  size: 10,
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  small: false,
  disabled: false,
  hidden: false,
  hideOnSinglePage: false,
  pagerCount: 7,
  showInfo: false,
  showRange: false,
  showQuickJumper: false,
  showSizeChanger: true,
  showTotal: true
})

const emit = defineEmits<Emits>()

// 双向绑定
const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('update:current', value)
})

const pageSize = computed({
  get: () => props.size,
  set: (value) => emit('update:size', value)
})

// 计算属性
const totalPages = computed(() => Math.ceil(props.total / props.size))

const rangeStart = computed(() => {
  return (props.current - 1) * props.size + 1
})

const rangeEnd = computed(() => {
  return Math.min(props.current * props.size, props.total)
})

// 快速跳转
const jumpPage = ref(props.current)

// 处理页码变化
const handleCurrentChange = (page: number) => {
  emit('update:current', page)
  emit('current-change', page)
  emit('change', page, props.size)
}

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  // 计算新的页码，保持当前数据位置尽量不变
  const newCurrent = Math.min(
    Math.ceil(((props.current - 1) * props.size + 1) / size),
    Math.ceil(props.total / size)
  )

  emit('update:size', size)
  emit('update:current', newCurrent)
  emit('size-change', size)
  emit('change', newCurrent, size)
}

// 快速跳转
const handleJump = () => {
  if (jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    handleCurrentChange(jumpPage.value)
  }
}

// 监听当前页变化，同步快速跳转输入框
watch(() => props.current, (newCurrent) => {
  jumpPage.value = newCurrent
})
</script>

```

## 🔧 高级功能

### 分页状态管理

```typescript
// composables/use-pagination-state.ts
export interface PaginationState {
  current: number
  size: number
  total: number
  showSizeChanger: boolean
  showQuickJumper: boolean
  pageSizes: number[]
}

export function usePaginationState(
  initialState?: Partial<PaginationState>
) {
  const state = reactive<PaginationState>({
    current: 1,
    size: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 50, 100],
    ...initialState
  })

  // 计算属性
  const totalPages = computed(() => Math.ceil(state.total / state.size))
  const offset = computed(() => (state.current - 1) * state.size)
  const hasNext = computed(() => state.current < totalPages.value)
  const hasPrev = computed(() => state.current > 1)

  // 方法
  const setTotal = (total: number) => {
    state.total = total
    // 如果当前页超出范围，调整到最后一页
    if (state.current > totalPages.value && totalPages.value > 0) {
      state.current = totalPages.value
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      state.current = page
      return true
    }
    return false
  }

  const nextPage = () => {
    if (hasNext.value) {
      state.current++
      return true
    }
    return false
  }

  const prevPage = () => {
    if (hasPrev.value) {
      state.current--
      return true
    }
    return false
  }

  const changeSize = (size: number) => {
    // 保持当前数据位置尽量不变
    const currentOffset = offset.value
    state.size = size
    state.current = Math.floor(currentOffset / size) + 1
  }

  const reset = () => {
    state.current = 1
    state.total = 0
  }

  const getRange = () => {
    const start = offset.value + 1
    const end = Math.min(offset.value + state.size, state.total)
    return { start, end }
  }

  return {
    state: readonly(state),
    totalPages,
    offset,
    hasNext,
    hasPrev,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeSize,
    reset,
    getRange
  }
}
```

### 分页数据管理

```typescript
// composables/use-paginated-data.ts
export interface PaginatedData<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

export function usePaginatedData<T>(
  fetchFn: (params: { current: number; size: number; [key: string]: any }) => Promise<PaginatedData<T>>,
  options: {
    immediate?: boolean
    defaultParams?: Record<string, any>
    onSuccess?: (data: PaginatedData<T>) => void
    onError?: (error: any) => void
  } = {}
) {
  const { immediate = true, defaultParams = {}, onSuccess, onError } = options

  const { state: pagination, setTotal, reset } = usePaginationState()
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref<any>(null)

  // 获取数据
  const fetchData = async (extraParams: Record<string, any> = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        current: pagination.current,
        size: pagination.size,
        ...defaultParams,
        ...extraParams
      }

      const result = await fetchFn(params)

      data.value = result.records
      setTotal(result.total)

      onSuccess?.(result)
    } catch (err) {
      error.value = err
      onError?.(err)
      console.error('获取分页数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 刷新当前页
  const refresh = () => {
    fetchData()
  }

  // 重置并重新获取
  const reload = () => {
    reset()
    fetchData()
  }

  // 页码变化处理
  const handlePageChange = (current: number, size: number) => {
    pagination.current = current
    pagination.size = size
    fetchData()
  }

  // 搜索（重置到第一页）
  const search = (searchParams: Record<string, any> = {}) => {
    pagination.current = 1
    fetchData(searchParams)
  }

  // 立即执行
  if (immediate) {
    onMounted(() => {
      fetchData()
    })
  }

  return {
    // 数据状态
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    pagination,

    // 方法
    fetchData,
    refresh,
    reload,
    handlePageChange,
    search
  }
}
```

### 虚拟分页

```typescript
// composables/use-virtual-pagination.ts
export function useVirtualPagination<T>(
  allData: Ref<T[]>,
  pageSize = 10
) {
  const currentPage = ref(1)

  // 计算属性
  const total = computed(() => allData.value.length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize))

  const currentData = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return allData.value.slice(start, end)
  })

  const pagination = computed(() => ({
    current: currentPage.value,
    size: pageSize,
    total: total.value,
    pages: totalPages.value
  }))

  // 方法
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const reset = () => {
    currentPage.value = 1
  }

  return {
    currentData,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    reset
  }
}
```

## 📱 移动端适配

### 响应式分页组件

```vue
<!-- components/ResponsivePagination/index.vue -->
<template>
  <div class="responsive-pagination">
    <!-- 桌面端分页 -->
    <el-pagination
      v-if="!isMobile"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      :background="background"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <!-- 移动端分页 -->
    <div v-else class="mobile-pagination">
      <!-- 页码信息 -->
      <div class="page-info">
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <span>（{{ total }} 条记录）</span>
      </div>

      <!-- 简化控制 -->
      <div class="page-controls">
        <el-button
          :disabled="currentPage <= 1"
          @click="goToPrev"
        >
          上一页
        </el-button>

        <!-- 页码选择器 -->
        <el-select
          v-model="currentPage"
          size="small"
          style="width: 80px"
          @change="handleCurrentChange"
        >
          <el-option
            v-for="page in totalPages"
            :key="page"
            :label="page"
            :value="page"
          />
        </el-select>

        <el-button
          :disabled="currentPage >= totalPages"
          @click="goToNext"
        >
          下一页
        </el-button>
      </div>

      <!-- 每页条数选择 -->
      <div class="size-selector">
        <span>每页</span>
        <el-select
          v-model="pageSize"
          size="small"
          style="width: 80px"
          @change="handleSizeChange"
        >
          <el-option
            v-for="size in pageSizes"
            :key="size"
            :label="size"
            :value="size"
          />
        </el-select>
        <span>条</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core'

const props = defineProps<{
  current: number
  size: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
}>()

const emit = defineEmits<{
  'update:current': [value: number]
  'update:size': [value: number]
  'change': [current: number, size: number]
}>()

// 响应式断点
const breakpoints = useBreakpoints({
  mobile: 768
})

const isMobile = breakpoints.smaller('mobile')

// 双向绑定
const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('update:current', value)
})

const pageSize = computed({
  get: () => props.size,
  set: (value) => emit('update:size', value)
})

// 计算属性
const totalPages = computed(() => Math.ceil(props.total / props.size))

// 方法
const handleCurrentChange = (page: number) => {
  emit('update:current', page)
  emit('change', page, props.size)
}

const handleSizeChange = (size: number) => {
  emit('update:size', size)
  emit('change', props.current, size)
}

const goToPrev = () => {
  if (currentPage.value > 1) {
    handleCurrentChange(currentPage.value - 1)
  }
}

const goToNext = () => {
  if (currentPage.value < totalPages.value) {
    handleCurrentChange(currentPage.value + 1)
  }
}
</script>

```

Pagination组件为Vue3应用提供了完整的分页解决方案，支持桌面端和移动端的不同展示方式，并提供了丰富的配置选项和数据管理功能。

## 🎨 样式定制

### 主题样式

```scss
// styles/components/pagination.scss
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 0;
  background: var(--el-bg-color);

  // 浮动样式
  &.is-float {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 24px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  // 紧凑模式
  &.is-compact {
    padding: 8px 0;

    :deep(.el-pagination) {
      .el-pager li {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
      }

      .btn-prev,
      .btn-next {
        width: 28px;
        height: 28px;
      }
    }
  }

  // 居中对齐
  &.is-center {
    justify-content: center;
  }

  // 两端对齐
  &.is-between {
    justify-content: space-between;
  }
}

// Element Plus 分页组件样式覆盖
:deep(.el-pagination) {
  // 背景按钮
  &.is-background {
    .el-pager li {
      background-color: var(--el-fill-color-light);
      border-radius: 4px;
      margin: 0 3px;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &.is-active {
        background-color: var(--el-color-primary);
        color: #fff;
      }
    }
  }

  // 前后按钮
  .btn-prev,
  .btn-next {
    border-radius: 4px;
    background-color: var(--el-fill-color-light);

    &:hover:not(:disabled) {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &:disabled {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
    }
  }

  // 每页条数选择器
  .el-pagination__sizes {
    .el-select {
      width: 110px;
    }
  }

  // 页码跳转
  .el-pagination__jump {
    .el-input__inner {
      text-align: center;
    }
  }

  // 总数显示
  .el-pagination__total {
    color: var(--el-text-color-regular);
  }
}

// 暗黑模式
.dark {
  .pagination-container {
    background: var(--el-bg-color);

    &.is-float {
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
    }
  }

  :deep(.el-pagination) {
    &.is-background {
      .el-pager li {
        background-color: var(--el-fill-color);

        &:hover {
          background-color: var(--el-color-primary-light-7);
        }
      }
    }

    .btn-prev,
    .btn-next {
      background-color: var(--el-fill-color);
    }
  }
}
```

### 自定义分页布局

```vue
<template>
  <div class="custom-pagination">
    <!-- 左侧信息区 -->
    <div class="pagination-left">
      <slot name="left">
        <span class="total-info">
          共 <strong>{{ total }}</strong> 条记录
        </span>
      </slot>
    </div>

    <!-- 中间分页区 -->
    <div class="pagination-center">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="layout"
        :background="background"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 右侧操作区 -->
    <div class="pagination-right">
      <slot name="right">
        <el-button-group size="small">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
          <el-button @click="handleFirst" :disabled="currentPage === 1">
            首页
          </el-button>
          <el-button @click="handleLast" :disabled="currentPage === totalPages">
            末页
          </el-button>
        </el-button-group>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'

interface Props {
  current: number
  size: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 20, 50, 100],
  layout: 'prev, pager, next',
  background: true
})

const emit = defineEmits<{
  'update:current': [value: number]
  'update:size': [value: number]
  'change': [current: number, size: number]
  'refresh': []
}>()

const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('update:current', value)
})

const pageSize = computed({
  get: () => props.size,
  set: (value) => emit('update:size', value)
})

const totalPages = computed(() => Math.ceil(props.total / props.size))

const handleCurrentChange = (page: number) => {
  emit('change', page, props.size)
}

const handleSizeChange = (size: number) => {
  emit('change', 1, size)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleFirst = () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
    handleCurrentChange(1)
  }
}

const handleLast = () => {
  if (currentPage.value !== totalPages.value) {
    currentPage.value = totalPages.value
    handleCurrentChange(totalPages.value)
  }
}
</script>

<style lang="scss" scoped>
.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  gap: 16px;
}

.pagination-left {
  .total-info {
    color: var(--el-text-color-regular);

    strong {
      color: var(--el-color-primary);
      margin: 0 4px;
    }
  }
}

.pagination-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.pagination-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

## 🔗 与表格组件集成

### 表格分页封装

```vue
<!-- components/TableWithPagination/index.vue -->
<template>
  <div class="table-with-pagination">
    <!-- 工具栏 -->
    <div v-if="$slots.toolbar" class="table-toolbar">
      <slot name="toolbar" />
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :row-key="rowKey"
      :highlight-current-row="highlightCurrentRow"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <slot />
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-if="showPagination"
      v-model:current="paginationState.current"
      v-model:size="paginationState.size"
      :total="paginationState.total"
      :page-sizes="pageSizes"
      :layout="paginationLayout"
      :background="true"
      class="table-pagination"
      @change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'

interface Props {
  data: any[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  height?: string | number
  maxHeight?: string | number
  rowKey?: string | ((row: any) => string)
  highlightCurrentRow?: boolean
  showPagination?: boolean
  pageSizes?: number[]
  paginationLayout?: string
  paginationState: {
    current: number
    size: number
    total: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  border: true,
  stripe: true,
  highlightCurrentRow: true,
  showPagination: true,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper'
})

const emit = defineEmits<{
  'page-change': [current: number, size: number]
  'selection-change': [selection: any[]]
  'sort-change': [{ column: any; prop: string; order: string | null }]
}>()

const tableRef = ref<TableInstance>()

// 分页变化
const handlePageChange = (current: number, size: number) => {
  emit('page-change', current, size)
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

// 排序变化
const handleSortChange = ({ column, prop, order }: any) => {
  emit('sort-change', { column, prop, order })
}

// 暴露表格方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => {
    tableRef.value?.toggleRowSelection(row, selected)
  },
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order)
})
</script>

<style lang="scss" scoped>
.table-with-pagination {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-toolbar {
  margin-bottom: 16px;
}

.el-table {
  flex: 1;
}

.table-pagination {
  margin-top: 16px;
  flex-shrink: 0;
}
</style>
```

### 完整使用示例

```vue
<template>
  <div class="user-management">
    <TableWithPagination
      :data="tableData"
      :loading="loading"
      :pagination-state="pagination"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
    >
      <!-- 工具栏 -->
      <template #toolbar>
        <div class="toolbar">
          <el-form :model="queryForm" inline>
            <el-form-item label="用户名">
              <el-input
                v-model="queryForm.username"
                placeholder="请输入用户名"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="queryForm.status" placeholder="请选择" clearable>
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="toolbar-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button
              type="danger"
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 表格列 -->
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" sortable />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'danger'">
            {{ row.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" sortable />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </TableWithPagination>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import TableWithPagination from '@/components/TableWithPagination/index.vue'
import { getUserListApi } from '@/api/system/user'

// 查询表单
const queryForm = reactive({
  username: '',
  status: ''
})

// 分页状态
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref<any[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getUserListApi({
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...queryForm
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 分页变化
const handlePageChange = (current: number, size: number) => {
  pagination.current = current
  pagination.size = size
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryForm.username = ''
  queryForm.status = ''
  pagination.current = 1
  fetchData()
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>
```

## ❓ 常见问题

### 1. 分页与路由同步失败

**问题描述**

在列表页面使用分页后，用户刷新页面或通过浏览器后退返回时，分页状态丢失，总是显示第一页。

**问题原因**

- 分页状态仅保存在组件内部响应式数据中
- 页面刷新时组件重新初始化，状态丢失
- 未将分页参数同步到 URL 查询字符串

**解决方案**

```typescript
// composables/use-route-pagination.ts
import { useRoute, useRouter } from 'vue-router'

export function useRoutePagination(defaultSize = 10) {
  const route = useRoute()
  const router = useRouter()

  // 从 URL 读取分页参数
  const pagination = reactive({
    current: Number(route.query.page) || 1,
    size: Number(route.query.size) || defaultSize,
    total: 0
  })

  // 同步分页参数到 URL
  const syncToRoute = () => {
    router.replace({
      query: {
        ...route.query,
        page: pagination.current.toString(),
        size: pagination.size.toString()
      }
    })
  }

  // 页码变化处理
  const handlePageChange = (current: number, size: number) => {
    pagination.current = current
    pagination.size = size
    syncToRoute()
  }

  // 监听路由变化，更新分页状态
  watch(
    () => route.query,
    (query) => {
      const page = Number(query.page)
      const size = Number(query.size)

      if (page && page !== pagination.current) {
        pagination.current = page
      }
      if (size && size !== pagination.size) {
        pagination.size = size
      }
    },
    { immediate: true }
  )

  return {
    pagination,
    handlePageChange,
    syncToRoute
  }
}
```

```vue
<!-- 使用示例 -->
<template>
  <div>
    <el-table :data="tableData" border>
      <!-- 表格列 -->
    </el-table>

    <Pagination
      v-model:current="pagination.current"
      v-model:size="pagination.size"
      :total="pagination.total"
      @change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoutePagination } from '@/composables/use-route-pagination'

const { pagination, handlePageChange } = useRoutePagination()

const tableData = ref([])

// 监听分页变化自动获取数据
watch(
  () => [pagination.current, pagination.size],
  () => {
    fetchData()
  },
  { immediate: true }
)

const fetchData = async () => {
  const { data } = await getListApi({
    pageNum: pagination.current,
    pageSize: pagination.size
  })
  tableData.value = data.records
  pagination.total = data.total
}
</script>
```

### 2. 删除最后一页最后一条数据后页面空白

**问题描述**

在列表最后一页只有一条数据时，删除该数据后页面显示空白，没有自动跳转到上一页。

**问题原因**

- 删除数据后未检查当前页是否还有数据
- 删除后直接刷新当前页，但该页已不存在数据
- 未处理边界情况：当前页 > 总页数

**解决方案**

```typescript
// composables/use-smart-pagination.ts
export function useSmartPagination() {
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 计算总页数
  const totalPages = computed(() => Math.ceil(pagination.total / pagination.size))

  // 删除后智能调整页码
  const adjustAfterDelete = (deletedCount = 1) => {
    const newTotal = pagination.total - deletedCount

    if (newTotal <= 0) {
      // 所有数据都被删除
      pagination.current = 1
      pagination.total = 0
      return
    }

    pagination.total = newTotal
    const newTotalPages = Math.ceil(newTotal / pagination.size)

    // 如果当前页超出范围，跳转到最后一页
    if (pagination.current > newTotalPages) {
      pagination.current = newTotalPages
    }
  }

  // 批量删除后调整
  const adjustAfterBatchDelete = (deletedIds: any[], currentPageIds: any[]) => {
    // 计算当前页被删除的数量
    const deletedInCurrentPage = deletedIds.filter(id =>
      currentPageIds.includes(id)
    ).length

    const remainingInCurrentPage = currentPageIds.length - deletedInCurrentPage

    // 更新总数
    pagination.total -= deletedIds.length

    // 如果当前页数据全部被删除且不是第一页
    if (remainingInCurrentPage === 0 && pagination.current > 1) {
      pagination.current--
    }

    // 确保当前页不超出范围
    const newTotalPages = Math.ceil(pagination.total / pagination.size)
    if (pagination.current > newTotalPages && newTotalPages > 0) {
      pagination.current = newTotalPages
    }
  }

  return {
    pagination,
    totalPages,
    adjustAfterDelete,
    adjustAfterBatchDelete
  }
}
```

```vue
<script setup lang="ts">
import { useSmartPagination } from '@/composables/use-smart-pagination'
import { ElMessage, ElMessageBox } from 'element-plus'

const { pagination, adjustAfterDelete, adjustAfterBatchDelete } = useSmartPagination()
const tableData = ref([])

// 删除单条
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    type: 'warning'
  })

  await deleteApi(row.id)
  ElMessage.success('删除成功')

  // 智能调整页码
  adjustAfterDelete(1)

  // 重新获取数据
  fetchData()
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }

  await ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
    '提示',
    { type: 'warning' }
  )

  const deletedIds = selectedRows.value.map(row => row.id)
  const currentPageIds = tableData.value.map(row => row.id)

  await batchDeleteApi(deletedIds)
  ElMessage.success('删除成功')

  // 智能调整页码
  adjustAfterBatchDelete(deletedIds, currentPageIds)

  // 清空选择
  selectedRows.value = []

  // 重新获取数据
  fetchData()
}
</script>
```

### 3. 切换每页条数后当前页不正确

**问题描述**

用户在第 5 页查看数据，切换每页条数从 10 条变为 50 条后，当前页码仍为 5，但实际上总页数已经减少，导致显示空白或跳转错误。

**问题原因**

- 切换每页条数时未重新计算当前页码
- 没有考虑用户当前查看的数据行在新分页下的位置
- 直接保持原页码导致超出范围

**解决方案**

```typescript
// composables/use-pagination-size-change.ts
export function usePaginationSizeChange() {
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 智能切换每页条数
  const handleSizeChange = (newSize: number) => {
    // 计算当前查看的第一条数据索引
    const currentFirstIndex = (pagination.current - 1) * pagination.size

    // 计算新的页码（保持查看位置）
    const newCurrent = Math.floor(currentFirstIndex / newSize) + 1

    // 确保不超出范围
    const newTotalPages = Math.ceil(pagination.total / newSize)
    pagination.current = Math.min(newCurrent, Math.max(1, newTotalPages))
    pagination.size = newSize
  }

  // 或者简单策略：切换每页条数后回到第一页
  const handleSizeChangeSimple = (newSize: number) => {
    pagination.size = newSize
    pagination.current = 1
  }

  return {
    pagination,
    handleSizeChange,
    handleSizeChangeSimple
  }
}
```

```vue
<template>
  <Pagination
    v-model:current="pagination.current"
    v-model:size="pagination.size"
    :total="pagination.total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup lang="ts">
const pagination = reactive({
  current: 1,
  size: 10,
  total: 100
})

// 每页条数变化 - 智能计算新页码
const handleSizeChange = (newSize: number) => {
  // 当前查看的数据范围起始位置
  const startIndex = (pagination.current - 1) * pagination.size

  // 计算在新页面大小下的页码
  const newCurrent = Math.floor(startIndex / newSize) + 1

  // 更新分页
  pagination.size = newSize
  pagination.current = Math.max(1, Math.min(newCurrent, Math.ceil(pagination.total / newSize)))

  // 获取数据
  fetchData()
}

// 页码变化
const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchData()
}
</script>
```

### 4. 分页组件在表格数据为空时仍然显示

**问题描述**

表格没有数据时，分页组件仍然显示，显示"共 0 条"和不可用的分页按钮，影响用户体验。

**问题原因**

- 未根据数据总数控制分页组件的显示
- 使用了默认的 `hide-on-single-page` 属性但不适用于零数据情况
- 加载状态和空数据状态未区分处理

**解决方案**

```vue
<template>
  <div class="list-container">
    <el-table :data="tableData" v-loading="loading" border>
      <!-- 表格列 -->
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 方案1：使用 v-if 控制显示 -->
    <Pagination
      v-if="!loading && pagination.total > 0"
      v-model:current="pagination.current"
      v-model:size="pagination.size"
      :total="pagination.total"
      @change="handlePageChange"
    />

    <!-- 方案2：组件内部处理 -->
    <SmartPagination
      v-model:current="pagination.current"
      v-model:size="pagination.size"
      :total="pagination.total"
      :loading="loading"
      :show-when-empty="false"
      @change="handlePageChange"
    />
  </div>
</template>
```

```vue
<!-- components/SmartPagination/index.vue -->
<template>
  <transition name="fade">
    <div
      v-if="shouldShow"
      class="smart-pagination"
      :class="{ 'is-loading': loading }"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="layout"
        :background="true"
        :disabled="loading"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  current: number
  size: number
  total: number
  loading?: boolean
  showWhenEmpty?: boolean
  minTotal?: number
  pageSizes?: number[]
  layout?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showWhenEmpty: false,
  minTotal: 1,
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
})

const emit = defineEmits<{
  'update:current': [value: number]
  'update:size': [value: number]
  'change': [current: number, size: number]
}>()

// 是否显示分页
const shouldShow = computed(() => {
  // 加载中时保持之前的显示状态
  if (props.loading) return props.total > 0

  // 根据配置决定空数据时是否显示
  if (props.showWhenEmpty) return true

  // 数据量达到最小阈值才显示
  return props.total >= props.minTotal
})

const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('update:current', value)
})

const pageSize = computed({
  get: () => props.size,
  set: (value) => emit('update:size', value)
})

const handleCurrentChange = (page: number) => {
  emit('change', page, props.size)
}

const handleSizeChange = (size: number) => {
  emit('update:current', 1)
  emit('change', 1, size)
}
</script>

<style lang="scss" scoped>
.smart-pagination {
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;

  &.is-loading {
    opacity: 0.6;
    pointer-events: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 5. 分页状态在多标签页间共享导致冲突

**问题描述**

使用 Keep-alive 缓存的列表页面，在多个标签页中打开同一列表时，分页状态相互影响，导致数据混乱。

**问题原因**

- 多个组件实例共享同一个 Pinia Store 或全局状态
- 路由切换时未正确恢复各自的分页状态
- Keep-alive 缓存导致组件状态被保留

**解决方案**

```typescript
// composables/use-scoped-pagination.ts
const paginationMap = new Map<string, any>()

export function useScopedPagination(scopeKey: string, defaultSize = 10) {
  // 获取或创建该作用域的分页状态
  const getOrCreateState = () => {
    if (!paginationMap.has(scopeKey)) {
      paginationMap.set(scopeKey, reactive({
        current: 1,
        size: defaultSize,
        total: 0
      }))
    }
    return paginationMap.get(scopeKey)
  }

  const pagination = getOrCreateState()

  // 重置该作用域的分页
  const reset = () => {
    pagination.current = 1
    pagination.total = 0
  }

  // 销毁该作用域的分页状态
  const destroy = () => {
    paginationMap.delete(scopeKey)
  }

  return {
    pagination,
    reset,
    destroy
  }
}
```

```vue
<!-- 在组件中使用 -->
<script setup lang="ts">
import { useScopedPagination } from '@/composables/use-scoped-pagination'

// 使用路由路径作为作用域 key
const route = useRoute()
const scopeKey = computed(() => route.fullPath)

const { pagination, reset, destroy } = useScopedPagination(scopeKey.value)

// 监听路由变化，重新获取对应的分页状态
watch(scopeKey, (newKey) => {
  const { pagination: newPagination } = useScopedPagination(newKey)
  Object.assign(pagination, newPagination)
})

// 组件卸载时清理（可选，取决于是否需要缓存）
onUnmounted(() => {
  // 如果不需要缓存分页状态，取消注释下行
  // destroy()
})
</script>
```

```typescript
// 另一种方案：使用路由 meta 存储分页状态
// router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/user/list',
      component: () => import('@/views/user/list.vue'),
      meta: {
        keepAlive: true,
        paginationState: null // 用于存储分页状态
      }
    }
  ]
})

// 在组件中使用
const route = useRoute()

const pagination = computed({
  get: () => route.meta.paginationState || { current: 1, size: 10, total: 0 },
  set: (val) => { route.meta.paginationState = val }
})
```

### 6. 快速连续点击分页导致数据错乱

**问题描述**

用户快速连续点击不同页码时，由于网络请求的异步性，后发的请求可能先返回，导致显示的数据与当前页码不匹配。

**问题原因**

- 每次点击都发起新请求，但未取消之前的请求
- 请求返回顺序不确定
- 未使用请求标识来验证返回数据的有效性

**解决方案**

```typescript
// composables/use-safe-pagination.ts
export function useSafePagination<T>(
  fetchFn: (params: { current: number; size: number }) => Promise<{ records: T[]; total: number }>
) {
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const data = ref<T[]>([])
  const loading = ref(false)

  // 请求标识
  let requestId = 0
  let abortController: AbortController | null = null

  const fetchData = async () => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    // 创建新的取消控制器
    abortController = new AbortController()

    // 记录当前请求 ID
    const currentRequestId = ++requestId

    loading.value = true

    try {
      const result = await fetchFn({
        current: pagination.current,
        size: pagination.size
      })

      // 验证请求是否仍然有效
      if (currentRequestId !== requestId) {
        console.log('请求已过期，忽略结果')
        return
      }

      data.value = result.records
      pagination.total = result.total
    } catch (error) {
      // 忽略取消的请求错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      throw error
    } finally {
      // 只有最新请求才更新 loading 状态
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  // 防抖处理页码变化
  const debouncedFetch = useDebounceFn(fetchData, 150)

  const handlePageChange = (current: number, size: number) => {
    pagination.current = current
    pagination.size = size
    debouncedFetch()
  }

  // 清理
  onUnmounted(() => {
    if (abortController) {
      abortController.abort()
    }
  })

  return {
    data: readonly(data),
    pagination,
    loading: readonly(loading),
    fetchData,
    handlePageChange
  }
}
```

```vue
<template>
  <div>
    <el-table :data="data" v-loading="loading" border>
      <!-- 表格列 -->
    </el-table>

    <Pagination
      v-model:current="pagination.current"
      v-model:size="pagination.size"
      :total="pagination.total"
      :disabled="loading"
      @change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useSafePagination } from '@/composables/use-safe-pagination'
import { getUserListApi } from '@/api/system/user'

const {
  data,
  pagination,
  loading,
  fetchData,
  handlePageChange
} = useSafePagination(async (params) => {
  const response = await getUserListApi({
    pageNum: params.current,
    pageSize: params.size
  })
  return response.data
})

onMounted(() => {
  fetchData()
})
</script>
```

### 7. 分页组件性能问题导致大量数据卡顿

**问题描述**

当总数据量很大（如 10 万条以上）时，分页组件计算页码和渲染变得缓慢，每次点击分页都有明显延迟。

**问题原因**

- 生成过多的页码选项（如下拉跳转列表）
- 计算属性触发过于频繁
- 未对大数据量场景做优化处理

**解决方案**

```vue
<!-- components/LargePagination/index.vue -->
<template>
  <div class="large-pagination">
    <!-- 页码信息 -->
    <div class="pagination-info">
      <span>第 {{ current }} / {{ displayTotalPages }} 页</span>
      <span class="total-text">共 {{ formattedTotal }} 条</span>
    </div>

    <!-- 简化分页控制 -->
    <div class="pagination-controls">
      <el-button
        :disabled="current <= 1"
        @click="goToFirst"
      >
        首页
      </el-button>
      <el-button
        :disabled="current <= 1"
        @click="goToPrev"
      >
        上一页
      </el-button>

      <!-- 页码输入 -->
      <div class="page-input">
        <el-input-number
          v-model="inputPage"
          :min="1"
          :max="totalPages"
          :controls="false"
          size="default"
          @keyup.enter="goToInputPage"
        />
        <el-button @click="goToInputPage">跳转</el-button>
      </div>

      <el-button
        :disabled="current >= totalPages"
        @click="goToNext"
      >
        下一页
      </el-button>
      <el-button
        :disabled="current >= totalPages"
        @click="goToLast"
      >
        末页
      </el-button>
    </div>

    <!-- 每页条数选择 -->
    <div class="size-selector">
      <span>每页</span>
      <el-select v-model="innerSize" @change="handleSizeChange">
        <el-option
          v-for="s in pageSizes"
          :key="s"
          :label="s"
          :value="s"
        />
      </el-select>
      <span>条</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  current: number
  size: number
  total: number
  pageSizes?: number[]
  maxDisplayPages?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [20, 50, 100, 200],
  maxDisplayPages: 9999
})

const emit = defineEmits<{
  'update:current': [value: number]
  'update:size': [value: number]
  'change': [current: number, size: number]
}>()

// 计算属性 - 使用 shallowRef 减少响应式开销
const totalPages = computed(() => Math.ceil(props.total / props.size))

// 显示的总页数（避免显示过大数字）
const displayTotalPages = computed(() => {
  if (totalPages.value > props.maxDisplayPages) {
    return `${props.maxDisplayPages}+`
  }
  return totalPages.value.toString()
})

// 格式化总数
const formattedTotal = computed(() => {
  if (props.total >= 10000) {
    return `${(props.total / 10000).toFixed(1)}万`
  }
  return props.total.toLocaleString()
})

const inputPage = ref(props.current)
const innerSize = ref(props.size)

// 监听外部变化
watch(() => props.current, (val) => {
  inputPage.value = val
})

watch(() => props.size, (val) => {
  innerSize.value = val
})

// 页面导航方法
const goToFirst = () => {
  emit('update:current', 1)
  emit('change', 1, props.size)
}

const goToPrev = () => {
  const newPage = Math.max(1, props.current - 1)
  emit('update:current', newPage)
  emit('change', newPage, props.size)
}

const goToNext = () => {
  const newPage = Math.min(totalPages.value, props.current + 1)
  emit('update:current', newPage)
  emit('change', newPage, props.size)
}

const goToLast = () => {
  emit('update:current', totalPages.value)
  emit('change', totalPages.value, props.size)
}

const goToInputPage = () => {
  const page = Math.max(1, Math.min(inputPage.value, totalPages.value))
  inputPage.value = page
  emit('update:current', page)
  emit('change', page, props.size)
}

const handleSizeChange = (size: number) => {
  emit('update:size', size)
  emit('update:current', 1)
  emit('change', 1, size)
}
</script>

<style lang="scss" scoped>
.large-pagination {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-regular);

  .total-text {
    color: var(--el-text-color-secondary);
  }
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input-number {
    width: 80px;
  }
}

.size-selector {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-select {
    width: 100px;
  }
}
</style>
```

### 8. 服务端分页参数格式不兼容

**问题描述**

后端接口使用不同的分页参数命名（如 `page`/`pageNo`/`pageNum`、`limit`/`pageSize`/`size`），需要频繁转换参数格式。

**问题原因**

- 不同后端服务使用不同的分页参数规范
- 前后端未统一分页参数命名
- 缺乏统一的参数转换层

**解决方案**

```typescript
// utils/pagination-adapter.ts

// 定义不同的分页参数格式
export interface StandardPagination {
  current: number
  size: number
  total?: number
}

export interface PageNumFormat {
  pageNum: number
  pageSize: number
  total?: number
}

export interface PageFormat {
  page: number
  limit: number
  total?: number
}

export interface OffsetFormat {
  offset: number
  limit: number
  total?: number
}

// 分页适配器
export class PaginationAdapter {
  // 标准格式转 pageNum/pageSize
  static toPageNum(pagination: StandardPagination): PageNumFormat {
    return {
      pageNum: pagination.current,
      pageSize: pagination.size,
      total: pagination.total
    }
  }

  // 标准格式转 page/limit
  static toPageLimit(pagination: StandardPagination): PageFormat {
    return {
      page: pagination.current,
      limit: pagination.size,
      total: pagination.total
    }
  }

  // 标准格式转 offset/limit
  static toOffset(pagination: StandardPagination): OffsetFormat {
    return {
      offset: (pagination.current - 1) * pagination.size,
      limit: pagination.size,
      total: pagination.total
    }
  }

  // pageNum/pageSize 转标准格式
  static fromPageNum(data: PageNumFormat): StandardPagination {
    return {
      current: data.pageNum,
      size: data.pageSize,
      total: data.total
    }
  }

  // page/limit 转标准格式
  static fromPageLimit(data: PageFormat): StandardPagination {
    return {
      current: data.page,
      size: data.limit,
      total: data.total
    }
  }

  // offset/limit 转标准格式
  static fromOffset(data: OffsetFormat, limit: number): StandardPagination {
    return {
      current: Math.floor(data.offset / limit) + 1,
      size: limit,
      total: data.total
    }
  }
}

// 创建适配后的请求函数
export function createPaginatedRequest<T, P extends StandardPagination>(
  requestFn: (params: any) => Promise<any>,
  format: 'pageNum' | 'pageLimit' | 'offset' = 'pageNum'
) {
  return async (pagination: P, extraParams?: Record<string, any>) => {
    let paginationParams: any

    switch (format) {
      case 'pageNum':
        paginationParams = PaginationAdapter.toPageNum(pagination)
        break
      case 'pageLimit':
        paginationParams = PaginationAdapter.toPageLimit(pagination)
        break
      case 'offset':
        paginationParams = PaginationAdapter.toOffset(pagination)
        break
    }

    const response = await requestFn({
      ...paginationParams,
      ...extraParams
    })

    return {
      records: response.data?.records || response.data?.list || [],
      total: response.data?.total || 0
    }
  }
}
```

```typescript
// api/user.ts
import { createPaginatedRequest } from '@/utils/pagination-adapter'
import request from '@/utils/request'

// 用户列表接口使用 pageNum/pageSize 格式
export const getUserList = createPaginatedRequest(
  (params) => request.get('/api/user/list', { params }),
  'pageNum'
)

// 订单列表接口使用 page/limit 格式
export const getOrderList = createPaginatedRequest(
  (params) => request.get('/api/order/list', { params }),
  'pageLimit'
)

// 日志列表接口使用 offset/limit 格式
export const getLogList = createPaginatedRequest(
  (params) => request.get('/api/log/list', { params }),
  'offset'
)
```

```vue
<!-- 使用示例 -->
<script setup lang="ts">
import { getUserList } from '@/api/user'

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const fetchData = async () => {
  const { records, total } = await getUserList(
    pagination,
    { status: '1' } // 额外参数
  )
  tableData.value = records
  pagination.total = total
}
</script>
```