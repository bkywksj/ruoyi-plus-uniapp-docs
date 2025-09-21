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

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding: 16px 0;

  &.hidden {
    display: none;
  }

  .pagination-info {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: var(--el-text-color-regular);

    .info-text {
      margin-bottom: 4px;
    }

    .range-text {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .quick-jumper {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);

    .el-input-number {
      .el-input__inner {
        text-align: center;
      }
    }
  }

  // 响应式布局
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;

    .pagination-info,
    .quick-jumper {
      order: -1;
    }
  }
}

// 自定义分页样式
:deep(.el-pagination) {
  .el-pagination__total {
    font-weight: 500;
  }

  .el-pagination__sizes {
    .el-select {
      margin: 0 8px;
    }
  }

  .el-pager {
    .number {
      &.is-active {
        background-color: var(--el-color-primary);
        color: white;
        font-weight: 500;
      }

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .el-pagination__jump {
    .el-input {
      width: 50px;
      margin: 0 8px;

      .el-input__inner {
        text-align: center;
        padding: 0 8px;
      }
    }
  }
}
</style>
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

<style lang="scss" scoped>
.responsive-pagination {
  .mobile-pagination {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);

    .page-info {
      text-align: center;
      font-size: 14px;
      color: var(--el-text-color-regular);

      span {
        display: block;

        &:first-child {
          font-weight: 500;
          margin-bottom: 4px;
        }

        &:last-child {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .page-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .size-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>
```

Pagination组件为Vue3应用提供了完整的分页解决方案，支持桌面端和移动端的不同展示方式，并提供了丰富的配置选项和数据管理功能。