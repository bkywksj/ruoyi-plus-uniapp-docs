# useTable 表格管理

表格数据管理组合函数，提供分页、排序、筛选、导出等完整的表格操作功能。

## 📋 基础用法

### 简单表格

```vue
<template>
  <div>
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline>
      <el-form-item label="用户名">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          :disabled="!multipleSelection.length"
          @click="handleBatchEdit"
        >
          <el-icon><Edit /></el-icon>
          批量修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          :disabled="!multipleSelection.length"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="dataList"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="id"
        label="ID"
        width="80"
        sortable="custom"
      />
      <el-table-column
        prop="username"
        label="用户名"
        sortable="custom"
        show-overflow-tooltip
      />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column
        prop="status"
        label="状态"
        width="100"
      >
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
        sortable="custom"
      />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { useTable } from '@/composables/use-table'
import { getUserList, deleteUser, batchDeleteUser } from '@/api/system/user'

// 查询参数
interface QueryParams {
  pageNum: number
  pageSize: number
  username?: string
  status?: string
  orderByColumn?: string
  isAsc?: string
}

const {
  // 数据状态
  loading,
  dataList,
  total,
  queryParams,
  multipleSelection,

  // 核心方法
  getList,
  handleQuery,
  resetQuery,
  handleSelectionChange,
  handleSortChange,

  // 导出功能
  handleExport
} = useTable<QueryParams>({
  // API配置
  fetchApi: getUserList,
  deleteApi: deleteUser,
  batchDeleteApi: batchDeleteUser,

  // 查询参数默认值
  defaultQuery: {
    pageNum: 1,
    pageSize: 10
  },

  // 导出配置
  exportConfig: {
    filename: '用户数据',
    api: exportUserList
  }
})

// 自定义操作
const handleAdd = () => {
  console.log('新增用户')
}

const handleEdit = (row: any) => {
  console.log('编辑用户:', row)
}

const handleDelete = (row: any) => {
  console.log('删除用户:', row)
}

const handleBatchEdit = () => {
  console.log('批量编辑:', multipleSelection.value)
}

const handleBatchDelete = () => {
  console.log('批量删除:', multipleSelection.value)
}

// 初始化数据
onMounted(() => {
  getList()
})
</script>
```

## 🎯 核心功能

### useTable 实现

```typescript
// composables/use-table.ts
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface TableConfig<T = any> {
  // API配置
  fetchApi: (params: any) => Promise<any>
  deleteApi?: (id: string | number) => Promise<any>
  batchDeleteApi?: (ids: (string | number)[]) => Promise<any>

  // 查询参数
  defaultQuery?: Partial<T>

  // 分页配置
  pagination?: {
    pageNum?: number
    pageSize?: number
    pageSizes?: number[]
  }

  // 导出配置
  exportConfig?: {
    filename?: string
    api?: (params: any) => Promise<any>
    headers?: string[]
    transform?: (data: any[]) => any[]
  }

  // 其他配置
  immediate?: boolean // 是否立即执行查询
  showMessage?: boolean // 是否显示操作提示
}

export function useTable<QueryParams = any>(config: TableConfig<QueryParams>) {
  const {
    fetchApi,
    deleteApi,
    batchDeleteApi,
    defaultQuery = {},
    pagination = {},
    exportConfig,
    immediate = true,
    showMessage = true
  } = config

  // 数据状态
  const loading = ref(false)
  const dataList = ref<any[]>([])
  const total = ref(0)
  const multipleSelection = ref<any[]>([])

  // 查询参数
  const queryParams = reactive({
    pageNum: pagination.pageNum || 1,
    pageSize: pagination.pageSize || 10,
    ...defaultQuery
  } as QueryParams & { pageNum: number; pageSize: number })

  // 分页大小选项
  const pageSizes = computed(() =>
    pagination.pageSizes || [10, 20, 50, 100]
  )

  /**
   * 获取数据列表
   */
  const getList = async (resetPage = false) => {
    if (resetPage) {
      queryParams.pageNum = 1
    }

    loading.value = true

    try {
      const response = await fetchApi(queryParams)

      if (response.code === 200) {
        dataList.value = response.data?.records || response.data || []
        total.value = response.data?.total || 0
      } else {
        if (showMessage) {
          ElMessage.error(response.msg || '获取数据失败')
        }
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      if (showMessage) {
        ElMessage.error('获取数据失败')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询
   */
  const handleQuery = () => {
    getList(true)
  }

  /**
   * 重置查询
   */
  const resetQuery = () => {
    Object.assign(queryParams, {
      pageNum: 1,
      pageSize: pagination.pageSize || 10,
      ...defaultQuery
    })
    getList()
  }

  /**
   * 选择变更
   */
  const handleSelectionChange = (selection: any[]) => {
    multipleSelection.value = selection
  }

  /**
   * 排序变更
   */
  const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
    if (sort.order) {
      ;(queryParams as any).orderByColumn = sort.prop
      ;(queryParams as any).isAsc = sort.order === 'ascending' ? 'asc' : 'desc'
    } else {
      delete (queryParams as any).orderByColumn
      delete (queryParams as any).isAsc
    }
    getList()
  }

  /**
   * 删除单行
   */
  const handleDelete = async (row: any, idField = 'id') => {
    if (!deleteApi) {
      console.warn('未配置删除API')
      return
    }

    try {
      await ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      loading.value = true
      const response = await deleteApi(row[idField])

      if (response.code === 200) {
        if (showMessage) {
          ElMessage.success('删除成功')
        }
        await getList()
      } else {
        if (showMessage) {
          ElMessage.error(response.msg || '删除失败')
        }
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        if (showMessage) {
          ElMessage.error('删除失败')
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async (idField = 'id') => {
    if (!batchDeleteApi) {
      console.warn('未配置批量删除API')
      return
    }

    if (multipleSelection.value.length === 0) {
      ElMessage.warning('请选择要删除的数据')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${multipleSelection.value.length} 条记录吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      loading.value = true
      const ids = multipleSelection.value.map(item => item[idField])
      const response = await batchDeleteApi(ids)

      if (response.code === 200) {
        if (showMessage) {
          ElMessage.success('删除成功')
        }
        multipleSelection.value = []
        await getList()
      } else {
        if (showMessage) {
          ElMessage.error(response.msg || '删除失败')
        }
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
        if (showMessage) {
          ElMessage.error('批量删除失败')
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出数据
   */
  const handleExport = async () => {
    if (!exportConfig?.api) {
      console.warn('未配置导出API')
      return
    }

    try {
      await ElMessageBox.confirm('确定导出数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })

      loading.value = true

      // 导出全部数据（不分页）
      const exportParams = { ...queryParams }
      delete (exportParams as any).pageNum
      delete (exportParams as any).pageSize

      const response = await exportConfig.api(exportParams)

      // 处理文件下载
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${exportConfig.filename || '数据导出'}_${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      if (showMessage) {
        ElMessage.success('导出成功')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('导出失败:', error)
        if (showMessage) {
          ElMessage.error('导出失败')
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据
   */
  const refresh = () => {
    getList()
  }

  // 立即执行查询
  if (immediate) {
    onMounted(() => {
      getList()
    })
  }

  return {
    // 数据状态
    loading,
    dataList,
    total,
    queryParams,
    multipleSelection,
    pageSizes,

    // 核心方法
    getList,
    handleQuery,
    resetQuery,
    handleSelectionChange,
    handleSortChange,

    // 删除操作
    handleDelete,
    handleBatchDelete,

    // 导出功能
    handleExport,

    // 工具方法
    refresh
  }
}
```

## 🔄 高级功能

### 表格缓存

```typescript
// composables/use-table-cache.ts
export function useTableCache(cacheKey: string) {
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟

  /**
   * 保存表格数据到缓存
   */
  const saveTableCache = (data: {
    list: any[]
    total: number
    queryParams: any
    timestamp: number
  }) => {
    const cacheData = {
      ...data,
      timestamp: Date.now()
    }
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
  }

  /**
   * 从缓存获取表格数据
   */
  const getTableCache = () => {
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (!cached) return null

      const data = JSON.parse(cached)

      // 检查缓存是否过期
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        clearTableCache()
        return null
      }

      return data
    } catch (error) {
      console.error('获取表格缓存失败:', error)
      return null
    }
  }

  /**
   * 清除表格缓存
   */
  const clearTableCache = () => {
    sessionStorage.removeItem(cacheKey)
  }

  return {
    saveTableCache,
    getTableCache,
    clearTableCache
  }
}

// 带缓存的表格Hook
export function useTableWithCache<T>(
  cacheKey: string,
  config: TableConfig<T>
) {
  const { saveTableCache, getTableCache, clearTableCache } = useTableCache(cacheKey)

  const tableHook = useTable({
    ...config,
    immediate: false
  })

  // 扩展getList方法以支持缓存
  const originalGetList = tableHook.getList
  const getList = async (resetPage = false, useCache = true) => {
    // 如果重置页面或不使用缓存，直接请求
    if (resetPage || !useCache) {
      await originalGetList(resetPage)
      saveTableCache({
        list: tableHook.dataList.value,
        total: tableHook.total.value,
        queryParams: tableHook.queryParams,
        timestamp: Date.now()
      })
      return
    }

    // 尝试从缓存获取
    const cached = getTableCache()
    if (cached) {
      tableHook.dataList.value = cached.list
      tableHook.total.value = cached.total
      Object.assign(tableHook.queryParams, cached.queryParams)
      return
    }

    // 缓存未命中，请求数据
    await originalGetList()
    saveTableCache({
      list: tableHook.dataList.value,
      total: tableHook.total.value,
      queryParams: tableHook.queryParams,
      timestamp: Date.now()
    })
  }

  // 初始化时尝试使用缓存
  onMounted(() => {
    getList()
  })

  return {
    ...tableHook,
    getList,
    clearTableCache
  }
}
```

### 表格状态管理

```typescript
// composables/use-table-state.ts
export interface TableState {
  selectedRows: any[]
  expandedRows: any[]
  columnWidths: Record<string, number>
  sortConfig: {
    prop?: string
    order?: 'ascending' | 'descending'
  }
  filterConfig: Record<string, any>
}

export function useTableState(tableId: string) {
  const state = ref<TableState>({
    selectedRows: [],
    expandedRows: [],
    columnWidths: {},
    sortConfig: {},
    filterConfig: {}
  })

  // 状态持久化key
  const storageKey = `table_state_${tableId}`

  /**
   * 保存表格状态
   */
  const saveState = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.value))
    } catch (error) {
      console.error('保存表格状态失败:', error)
    }
  }

  /**
   * 恢复表格状态
   */
  const restoreState = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        state.value = { ...state.value, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('恢复表格状态失败:', error)
    }
  }

  /**
   * 清除表格状态
   */
  const clearState = () => {
    state.value = {
      selectedRows: [],
      expandedRows: [],
      columnWidths: {},
      sortConfig: {},
      filterConfig: {}
    }
    localStorage.removeItem(storageKey)
  }

  /**
   * 更新选中行
   */
  const updateSelectedRows = (rows: any[]) => {
    state.value.selectedRows = rows
    saveState()
  }

  /**
   * 更新展开行
   */
  const updateExpandedRows = (rows: any[]) => {
    state.value.expandedRows = rows
    saveState()
  }

  /**
   * 更新列宽
   */
  const updateColumnWidth = (prop: string, width: number) => {
    state.value.columnWidths[prop] = width
    saveState()
  }

  /**
   * 更新排序配置
   */
  const updateSort = (prop?: string, order?: 'ascending' | 'descending') => {
    state.value.sortConfig = { prop, order }
    saveState()
  }

  /**
   * 更新过滤配置
   */
  const updateFilter = (filters: Record<string, any>) => {
    state.value.filterConfig = filters
    saveState()
  }

  // 初始化时恢复状态
  onMounted(() => {
    restoreState()
  })

  return {
    state,
    saveState,
    restoreState,
    clearState,
    updateSelectedRows,
    updateExpandedRows,
    updateColumnWidth,
    updateSort,
    updateFilter
  }
}
```

### 虚拟滚动表格

```typescript
// composables/use-virtual-table.ts
export interface VirtualTableConfig {
  itemHeight: number
  visibleCount: number
  bufferCount?: number
}

export function useVirtualTable<T>(
  data: Ref<T[]>,
  config: VirtualTableConfig
) {
  const { itemHeight, visibleCount, bufferCount = 5 } = config

  const containerRef = ref<HTMLElement>()
  const scrollTop = ref(0)

  // 计算可见数据
  const visibleData = computed(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferCount)
    const endIndex = Math.min(
      data.value.length,
      startIndex + visibleCount + bufferCount * 2
    )

    return {
      startIndex,
      endIndex,
      items: data.value.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight
    }
  })

  // 总高度
  const totalHeight = computed(() => data.value.length * itemHeight)

  /**
   * 处理滚动
   */
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      const targetScrollTop = Math.max(0, index * itemHeight)
      containerRef.value.scrollTop = targetScrollTop
    }
  }

  /**
   * 滚动到顶部
   */
  const scrollToTop = () => {
    scrollToIndex(0)
  }

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    scrollToIndex(data.value.length - 1)
  }

  return {
    containerRef,
    visibleData,
    totalHeight,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom
  }
}
```

## 📊 表格工具组件

### 表格工具栏

```vue
<!-- TableToolbar.vue -->
<template>
  <div class="table-toolbar">
    <div class="toolbar-left">
      <slot name="left" />
    </div>

    <div class="toolbar-right">
      <el-tooltip content="刷新" placement="top">
        <el-button circle @click="$emit('refresh')">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="密度" placement="top">
        <el-dropdown @command="handleDensityChange">
          <el-button circle>
            <el-icon><Grid /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :class="{ active: density === 'large' }"
                command="large"
              >
                宽松
              </el-dropdown-item>
              <el-dropdown-item
                :class="{ active: density === 'default' }"
                command="default"
              >
                默认
              </el-dropdown-item>
              <el-dropdown-item
                :class="{ active: density === 'small' }"
                command="small"
              >
                紧凑
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>

      <el-tooltip content="列设置" placement="top">
        <el-button circle @click="columnSettingVisible = true">
          <el-icon><Setting /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="全屏" placement="top">
        <el-button circle @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- 列设置弹窗 -->
    <el-drawer
      v-model="columnSettingVisible"
      title="列设置"
      direction="rtl"
      size="300px"
    >
      <div class="column-setting">
        <div class="setting-header">
          <el-checkbox
            :model-value="isAllChecked"
            :indeterminate="isIndeterminate"
            @change="handleCheckAll"
          >
            列展示
          </el-checkbox>
          <el-button text @click="resetColumns">重置</el-button>
        </div>

        <el-divider />

        <div class="column-list">
          <div
            v-for="column in columnConfig"
            :key="column.prop"
            class="column-item"
          >
            <el-checkbox
              v-model="column.visible"
              @change="handleColumnChange"
            >
              {{ column.label }}
            </el-checkbox>
            <el-icon class="drag-handle">
              <Rank />
            </el-icon>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
interface Column {
  prop: string
  label: string
  visible: boolean
  fixed?: boolean
}

interface Props {
  columns: Column[]
  density?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'refresh'): void
  (e: 'density-change', density: string): void
  (e: 'column-change', columns: Column[]): void
}

const props = withDefaults(defineProps<Props>(), {
  density: 'default'
})

const emit = defineEmits<Emits>()

const density = ref(props.density)
const columnSettingVisible = ref(false)
const columnConfig = ref<Column[]>([...props.columns])

// 全选状态
const isAllChecked = computed(() =>
  columnConfig.value.every(col => col.visible)
)

const isIndeterminate = computed(() => {
  const checkedCount = columnConfig.value.filter(col => col.visible).length
  return checkedCount > 0 && checkedCount < columnConfig.value.length
})

/**
 * 密度变更
 */
const handleDensityChange = (command: string) => {
  density.value = command as any
  emit('density-change', command)
}

/**
 * 全选/取消全选
 */
const handleCheckAll = (checked: boolean) => {
  columnConfig.value.forEach(col => {
    if (!col.fixed) {
      col.visible = checked
    }
  })
  handleColumnChange()
}

/**
 * 列显示变更
 */
const handleColumnChange = () => {
  emit('column-change', [...columnConfig.value])
}

/**
 * 重置列设置
 */
const resetColumns = () => {
  columnConfig.value = [...props.columns]
  handleColumnChange()
}

/**
 * 全屏切换
 */
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

// 监听columns变化
watch(
  () => props.columns,
  (newColumns) => {
    columnConfig.value = [...newColumns]
  },
  { deep: true }
)
</script>

<style scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.column-setting {
  .setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .column-list {
    .column-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      cursor: move;

      &:hover {
        background-color: var(--el-bg-color-page);
      }

      .drag-handle {
        color: var(--el-text-color-placeholder);
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }
    }
  }
}

.active {
  color: var(--el-color-primary);
  font-weight: bold;
}
</style>
```

useTable组合函数为Vue3应用提供了完整的表格管理解决方案，支持分页、排序、筛选、导出等常用功能，并提供了缓存、虚拟滚动等高级特性。