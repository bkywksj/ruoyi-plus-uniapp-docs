# RightToolbar 右侧工具栏

表格页面右侧工具栏组件，提供刷新、密度调整、列设置、全屏等功能。

## 📋 基础用法

### 简单使用

```vue
<template>
  <div>
    <!-- 表格操作工具栏 -->
    <div class="table-header">
      <div class="table-title">
        <h3>用户管理</h3>
      </div>

      <RightToolbar
        v-model:show-search="showSearch"
        @refresh="handleRefresh"
        @query-table="handleQuery"
      />
    </div>

    <!-- 搜索区域 -->
    <el-form
      v-show="showSearch"
      ref="queryFormRef"
      :model="queryParams"
      inline
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      :size="tableSize"
      border
    >
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import RightToolbar from '@/components/RightToolbar/index.vue'

const showSearch = ref(true)
const tableSize = ref<'large' | 'default' | 'small'>('default')
const tableData = ref([])
const queryParams = reactive({
  username: ''
})

const handleRefresh = () => {
  console.log('刷新数据')
  // 重新获取表格数据
  fetchTableData()
}

const handleQuery = () => {
  console.log('查询数据', queryParams)
  fetchTableData()
}

const resetQuery = () => {
  queryParams.username = ''
  handleQuery()
}

const fetchTableData = () => {
  // 获取表格数据逻辑
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title h3 {
  margin: 0;
  color: var(--el-text-color-primary);
}
</style>
```

### 完整配置

```vue
<template>
  <div>
    <div class="table-header">
      <div class="table-title">
        <h3>数据列表</h3>
        <span class="subtitle">共 {{ total }} 条记录</span>
      </div>

      <RightToolbar
        v-model:show-search="showSearch"
        v-model:columns="tableColumns"
        :show-refresh="true"
        :show-density="true"
        :show-column-setting="true"
        :show-fullscreen="true"
        :show-search-toggle="true"
        @refresh="handleRefresh"
        @density-change="handleDensityChange"
        @column-change="handleColumnChange"
        @fullscreen-change="handleFullscreenChange"
      />
    </div>

    <!-- 搜索表单 -->
    <SearchForm
      v-show="showSearch"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      :size="tableSize"
      border
    >
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.prop"
        v-bind="column"
      />
    </el-table>
  </div>
</template>

<script setup lang="ts">
const showSearch = ref(true)
const tableSize = ref<'large' | 'default' | 'small'>('default')
const total = ref(0)

// 表格列配置
const tableColumns = ref([
  { prop: 'id', label: 'ID', width: '80', visible: true, fixed: true },
  { prop: 'username', label: '用户名', visible: true },
  { prop: 'email', label: '邮箱', visible: true },
  { prop: 'phone', label: '手机号', visible: true },
  { prop: 'status', label: '状态', visible: true },
  { prop: 'createTime', label: '创建时间', visible: false }
])

// 可见列
const visibleColumns = computed(() => {
  return tableColumns.value.filter(col => col.visible)
})

const handleRefresh = () => {
  console.log('刷新数据')
}

const handleDensityChange = (size: string) => {
  tableSize.value = size as any
  console.log('密度变化:', size)
}

const handleColumnChange = (columns: any[]) => {
  tableColumns.value = columns
  console.log('列配置变化:', columns)
}

const handleFullscreenChange = (isFullscreen: boolean) => {
  console.log('全屏状态:', isFullscreen)
}

const handleSearch = (params: any) => {
  console.log('搜索:', params)
}

const handleReset = () => {
  console.log('重置搜索')
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  h3 {
    margin: 0 0 4px 0;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}
</style>
```

## 🎯 组件实现

### RightToolbar 组件

```vue
<!-- components/RightToolbar/index.vue -->
<template>
  <div class="right-toolbar">
    <!-- 搜索切换 -->
    <el-tooltip
      v-if="showSearchToggle"
      content="搜索"
      placement="top"
    >
      <el-button
        circle
        :type="showSearch ? 'primary' : 'default'"
        @click="toggleSearch"
      >
        <el-icon><Search /></el-icon>
      </el-button>
    </el-tooltip>

    <!-- 刷新 -->
    <el-tooltip
      v-if="showRefresh"
      content="刷新"
      placement="top"
    >
      <el-button
        circle
        @click="handleRefresh"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </el-tooltip>

    <!-- 密度调整 -->
    <el-tooltip
      v-if="showDensity"
      content="密度"
      placement="top"
    >
      <el-dropdown
        trigger="click"
        @command="handleDensityChange"
      >
        <el-button circle>
          <el-icon><Grid /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              :class="{ active: density === 'large' }"
              command="large"
            >
              <el-icon><ArrowUp /></el-icon>
              宽松
            </el-dropdown-item>
            <el-dropdown-item
              :class="{ active: density === 'default' }"
              command="default"
            >
              <el-icon><Minus /></el-icon>
              默认
            </el-dropdown-item>
            <el-dropdown-item
              :class="{ active: density === 'small' }"
              command="small"
            >
              <el-icon><ArrowDown /></el-icon>
              紧凑
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-tooltip>

    <!-- 列设置 -->
    <el-tooltip
      v-if="showColumnSetting"
      content="列设置"
      placement="top"
    >
      <el-button
        circle
        @click="columnSettingVisible = true"
      >
        <el-icon><Setting /></el-icon>
      </el-button>
    </el-tooltip>

    <!-- 全屏 -->
    <el-tooltip
      v-if="showFullscreen"
      :content="isFullscreen ? '退出全屏' : '全屏'"
      placement="top"
    >
      <el-button
        circle
        @click="toggleFullscreen"
      >
        <el-icon>
          <FullScreen v-if="!isFullscreen" />
          <Aim v-else />
        </el-icon>
      </el-button>
    </el-tooltip>

    <!-- 列设置弹窗 -->
    <ColumnSetting
      v-model:visible="columnSettingVisible"
      v-model:columns="currentColumns"
      @change="handleColumnChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import ColumnSetting from './ColumnSetting.vue'

interface Column {
  prop: string
  label: string
  visible: boolean
  fixed?: boolean
  width?: string | number
}

interface Props {
  // 显示控制
  showRefresh?: boolean
  showDensity?: boolean
  showColumnSetting?: boolean
  showFullscreen?: boolean
  showSearchToggle?: boolean

  // v-model 绑定
  showSearch?: boolean
  columns?: Column[]
  density?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'update:showSearch', value: boolean): void
  (e: 'update:columns', value: Column[]): void
  (e: 'update:density', value: string): void
  (e: 'refresh'): void
  (e: 'density-change', density: string): void
  (e: 'column-change', columns: Column[]): void
  (e: 'fullscreen-change', isFullscreen: boolean): void
  (e: 'query-table'): void
}

const props = withDefaults(defineProps<Props>(), {
  showRefresh: true,
  showDensity: true,
  showColumnSetting: true,
  showFullscreen: true,
  showSearchToggle: true,
  showSearch: true,
  density: 'default'
})

const emit = defineEmits<Emits>()

// 列设置弹窗
const columnSettingVisible = ref(false)

// 当前列配置
const currentColumns = computed({
  get: () => props.columns || [],
  set: (value) => emit('update:columns', value)
})

// 全屏控制
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// 监听全屏状态变化
watch(isFullscreen, (fullscreen) => {
  emit('fullscreen-change', fullscreen)
})

// 搜索切换
const toggleSearch = () => {
  const newValue = !props.showSearch
  emit('update:showSearch', newValue)
  emit('query-table')
}

// 刷新处理
const handleRefresh = () => {
  emit('refresh')
}

// 密度变更
const handleDensityChange = (density: string) => {
  emit('update:density', density)
  emit('density-change', density)
}

// 列配置变更
const handleColumnChange = (columns: Column[]) => {
  emit('update:columns', columns)
  emit('column-change', columns)
}
</script>

<style lang="scss" scoped>
.right-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-button {
    &.is-circle {
      width: 32px;
      height: 32px;
      padding: 0;

      .el-icon {
        font-size: 16px;
      }
    }
  }

  :deep(.el-dropdown) {
    .el-button {
      &.is-circle {
        width: 32px;
        height: 32px;
        padding: 0;

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }

  :deep(.el-dropdown-menu) {
    .el-dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;

      &.active {
        color: var(--el-color-primary);
        font-weight: 500;
      }

      .el-icon {
        font-size: 14px;
      }
    }
  }
}
</style>
```

### 列设置组件

```vue
<!-- components/RightToolbar/ColumnSetting.vue -->
<template>
  <el-drawer
    v-model="drawerVisible"
    title="列设置"
    direction="rtl"
    size="320px"
    class="column-setting-drawer"
  >
    <div class="column-setting">
      <!-- 操作栏 -->
      <div class="setting-header">
        <el-checkbox
          :model-value="isAllChecked"
          :indeterminate="isIndeterminate"
          @change="handleCheckAll"
        >
          列展示
        </el-checkbox>

        <div class="header-actions">
          <el-button text @click="resetColumns">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <el-divider />

      <!-- 列列表 -->
      <div class="column-list">
        <VueDraggable
          v-model="currentColumns"
          :animation="200"
          ghost-class="ghost"
          @change="handleColumnChange"
        >
          <div
            v-for="column in currentColumns"
            :key="column.prop"
            class="column-item"
            :class="{ disabled: column.fixed }"
          >
            <div class="column-info">
              <el-checkbox
                v-model="column.visible"
                :disabled="column.fixed"
                @change="handleColumnChange"
              >
                {{ column.label }}
              </el-checkbox>

              <div class="column-meta">
                <el-tag v-if="column.fixed" size="small" type="info">
                  固定
                </el-tag>
                <span v-if="column.width" class="width-info">
                  宽度: {{ column.width }}
                </span>
              </div>
            </div>

            <div class="column-actions">
              <el-icon
                v-if="!column.fixed"
                class="drag-handle"
              >
                <Rank />
              </el-icon>
            </div>
          </div>
        </VueDraggable>
      </div>

      <!-- 底部操作 -->
      <div class="setting-footer">
        <el-button @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" @click="handleConfirm">
          确定
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

interface Column {
  prop: string
  label: string
  visible: boolean
  fixed?: boolean
  width?: string | number
}

interface Props {
  visible: boolean
  columns: Column[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:columns', value: Column[]): void
  (e: 'change', columns: Column[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗显示状态
const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 当前列配置（内部状态）
const currentColumns = ref<Column[]>([])

// 原始列配置（用于重置）
const originalColumns = ref<Column[]>([])

// 全选状态
const isAllChecked = computed(() => {
  const visibleColumns = currentColumns.value.filter(col => !col.fixed)
  return visibleColumns.length > 0 && visibleColumns.every(col => col.visible)
})

const isIndeterminate = computed(() => {
  const visibleColumns = currentColumns.value.filter(col => !col.fixed)
  const checkedColumns = visibleColumns.filter(col => col.visible)
  return checkedColumns.length > 0 && checkedColumns.length < visibleColumns.length
})

// 监听弹窗显示，初始化数据
watch(() => props.visible, (visible) => {
  if (visible) {
    currentColumns.value = JSON.parse(JSON.stringify(props.columns))
    originalColumns.value = JSON.parse(JSON.stringify(props.columns))
  }
}, { immediate: true })

// 全选/取消全选
const handleCheckAll = (checked: boolean) => {
  currentColumns.value.forEach(col => {
    if (!col.fixed) {
      col.visible = checked
    }
  })
  handleColumnChange()
}

// 列配置变更
const handleColumnChange = () => {
  // 实时同步到外部
  emit('update:columns', [...currentColumns.value])
  emit('change', [...currentColumns.value])
}

// 重置列设置
const resetColumns = () => {
  currentColumns.value = JSON.parse(JSON.stringify(originalColumns.value))
  handleColumnChange()
}

// 确认
const handleConfirm = () => {
  drawerVisible.value = false
}

// 取消
const handleCancel = () => {
  // 恢复原始状态
  currentColumns.value = JSON.parse(JSON.stringify(originalColumns.value))
  handleColumnChange()
  drawerVisible.value = false
}
</script>

<style lang="scss" scoped>
.column-setting {
  height: 100%;
  display: flex;
  flex-direction: column;

  .setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;

    .header-actions {
      display: flex;
      gap: 8px;

      .el-button {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
  }

  .column-list {
    flex: 1;
    overflow-y: auto;

    .column-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 8px;
      border-radius: 6px;
      transition: background-color 0.2s;
      cursor: move;

      &:hover {
        background-color: var(--el-bg-color-page);
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      &.ghost {
        opacity: 0.5;
        background-color: var(--el-color-primary-light-9);
      }

      .column-info {
        flex: 1;
        min-width: 0;

        .el-checkbox {
          width: 100%;

          :deep(.el-checkbox__label) {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }

        .column-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;

          .width-info {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .column-actions {
        .drag-handle {
          color: var(--el-text-color-placeholder);
          cursor: grab;
          font-size: 16px;

          &:hover {
            color: var(--el-color-primary);
          }

          &:active {
            cursor: grabbing;
          }
        }
      }
    }
  }

  .setting-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style>
```

## 🔧 扩展功能

### 工具栏配置

```typescript
// types/toolbar.ts
export interface ToolbarConfig {
  showRefresh?: boolean
  showDensity?: boolean
  showColumnSetting?: boolean
  showFullscreen?: boolean
  showSearchToggle?: boolean
  showExport?: boolean
  showImport?: boolean
  customButtons?: ToolbarButton[]
}

export interface ToolbarButton {
  key: string
  icon: string
  tooltip: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}

// composables/use-toolbar.ts
export function useToolbar(config: ToolbarConfig = {}) {
  const {
    showRefresh = true,
    showDensity = true,
    showColumnSetting = true,
    showFullscreen = true,
    showSearchToggle = true,
    showExport = false,
    showImport = false,
    customButtons = []
  } = config

  const toolbarState = reactive({
    showSearch: true,
    density: 'default' as 'large' | 'default' | 'small',
    isFullscreen: false
  })

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  // 监听全屏状态
  watch(isFullscreen, (fullscreen) => {
    toolbarState.isFullscreen = fullscreen
  })

  const handleRefresh = () => {
    // 刷新逻辑
  }

  const handleDensityChange = (density: string) => {
    toolbarState.density = density as any
  }

  const toggleSearch = () => {
    toolbarState.showSearch = !toolbarState.showSearch
  }

  return {
    toolbarState,
    config: {
      showRefresh,
      showDensity,
      showColumnSetting,
      showFullscreen,
      showSearchToggle,
      showExport,
      showImport,
      customButtons
    },
    actions: {
      handleRefresh,
      handleDensityChange,
      toggleSearch,
      toggleFullscreen
    }
  }
}
```

### 工具栏预设

```typescript
// presets/toolbar-presets.ts
export const toolbarPresets = {
  // 基础预设
  basic: {
    showRefresh: true,
    showDensity: false,
    showColumnSetting: false,
    showFullscreen: false,
    showSearchToggle: true
  },

  // 标准预设
  standard: {
    showRefresh: true,
    showDensity: true,
    showColumnSetting: true,
    showFullscreen: false,
    showSearchToggle: true
  },

  // 完整预设
  full: {
    showRefresh: true,
    showDensity: true,
    showColumnSetting: true,
    showFullscreen: true,
    showSearchToggle: true,
    showExport: true,
    showImport: true
  },

  // 只读预设
  readonly: {
    showRefresh: true,
    showDensity: true,
    showColumnSetting: true,
    showFullscreen: true,
    showSearchToggle: true,
    showExport: true,
    showImport: false
  }
}

// 使用预设
export function createToolbar(preset: keyof typeof toolbarPresets, overrides: Partial<ToolbarConfig> = {}) {
  return {
    ...toolbarPresets[preset],
    ...overrides
  }
}
```

RightToolbar组件为表格页面提供了标准化的工具栏解决方案，支持多种功能配置和自定义扩展，提升了用户操作体验。