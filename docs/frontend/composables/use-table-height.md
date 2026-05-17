# useTableHeight 表格高度自适应

## 介绍

`useTableHeight` 是一个基于 Vue 3 Composition API 实现的表格高度自适应组合函数，用于动态计算和管理 Element Plus 表格组件的高度，确保表格在不同屏幕尺寸、布局状态和内容变化下都能自适应填充可用空间，避免页面出现双滚动条。

**核心特性**:

- **智能高度计算** - 动态计算表格最佳高度，考虑导航栏、标签页、搜索表单、分页等多种页面元素
- **响应式调整** - 自动响应窗口大小、侧边栏状态、页签配置和表单显示状态的变化
- **防抖处理** - 使用不同延迟的防抖策略，避免频繁重复计算，保证性能
- **ResizeObserver 集成** - 使用 ResizeObserver API 监听搜索表单尺寸变化
- **生命周期管理** - 自动添加和移除事件监听器，支持 KeepAlive 组件激活/停用
- **高度调整参数** - 支持自定义高度偏移量，适应各种页面布局场景

该 Composable 在项目中被广泛使用，覆盖了用户管理、角色管理、部门管理、菜单管理、OSS 管理、工作流任务、代码生成等 37+ 个业务页面。

## 架构设计

### 高度计算公式

```text
┌─────────────────────────────────────────────────────────────────┐
│                      浏览器视口 (window.innerHeight)              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Navbar 导航栏 (50px)                                    │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  TagsView 标签页 (34px / 0px - 根据配置)                  │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  页面容器 Padding (16px)                                 │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  搜索表单 (动态高度 - queryFormRef)              │    │    │
│  │  ├─────────────────────────────────────────────────┤    │    │
│  │  │  Card Header 工具栏 (62px)                       │    │    │
│  │  ├─────────────────────────────────────────────────┤    │    │
│  │  │                                                 │    │    │
│  │  │              表格区域 (tableHeight)              │    │    │
│  │  │                                                 │    │    │
│  │  ├─────────────────────────────────────────────────┤    │    │
│  │  │  分页组件 (56px)                                │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  表格容器 Padding + 其他边距 (40px + 18px)               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

tableHeight = window.innerHeight
            - navbarHeight (50px)
            - tagsHeight (34px / 0px)
            - pageContainerPadding (16px)
            - formHeight (动态)
            - cardHeaderHeight (62px)
            - tablePadding (40px)
            - paginationHeight (56px)
            - otherPadding (18px)
            - heightAdjustment (自定义)
```

### 防抖策略

```text
┌─────────────────────────────────────────────────────────────┐
│                     事件触发                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┬────────────┐
         │            │            │            │
         ▼            ▼            ▼            ▼
    窗口调整      侧边栏切换    标签页切换   表单变化
    (resize)    (sidebar)    (tagsView)   (form)
         │            │            │            │
         ▼            ▼            ▼            ▼
    延迟 150ms    延迟 240ms    延迟 100ms   延迟 100ms
         │            │            │            │
         └────────────┴────────────┴────────────┘
                      │
                      ▼
              debouncedCalculateHeight()
                      │
                      ▼
              calculateTableHeight()
                      │
                      ▼
               更新 tableHeight
```

### 状态依赖关系

```text
┌─────────────────────────────────────────────────────────────┐
│                    useTableHeight                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  内部状态                                            │    │
│  │  • tableHeight: Ref<number>                         │    │
│  │  • queryFormRef: Ref<any>                           │    │
│  │  • showSearch: Ref<boolean>                         │    │
│  │  • heightCalculationTimer: number | null            │    │
│  │  • formResizeObserver: ResizeObserver | null        │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  外部依赖                                            │    │
│  │  • useLayout().sidebar.opened                       │    │
│  │  • useLayout().tagsView                             │    │
│  │  • window.innerHeight                               │    │
│  │  • window.addEventListener('resize')                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 基础用法

### 最简单的使用方式

```vue
<template>
  <div class="table-page">
    <!-- 搜索表单 - 必须绑定 queryFormRef -->
    <el-form ref="queryFormRef" v-show="showSearch" :model="queryForm" inline>
      <el-form-item label="用户名">
        <el-input v-model="queryForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click="showSearch = !showSearch">
        {{ showSearch ? '收起' : '展开' }}搜索
      </el-button>
    </div>

    <!-- 表格 - 使用 tableHeight -->
    <el-table :data="tableData" :height="tableHeight" border stripe>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
    />
  </div>
</template>

<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'

// 使用表格高度自适应
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// 查询表单
const queryForm = ref({
  username: ''
})

// 表格数据
const tableData = ref([])

// 分页配置
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

// 查询方法
const handleQuery = () => {
  console.log('查询:', queryForm.value)
}

// 重置方法
const handleReset = () => {
  queryForm.value = { username: '' }
}

// 新增方法
const handleAdd = () => {
  console.log('新增')
}
</script>
```

**使用说明**:

- `queryFormRef` 必须绑定到搜索表单的 `ref` 属性，用于获取表单高度
- `showSearch` 控制搜索表单的显示/隐藏，切换时会自动重新计算高度
- `tableHeight` 是计算后的表格高度，直接绑定到 `el-table` 的 `height` 属性

### 带高度调整参数

当页面有额外的固定元素时，可以传入 `heightAdjustment` 参数进行调整：

```vue
<template>
  <div class="custom-page">
    <!-- 自定义头部区域 -->
    <div class="page-header" style="height: 60px; background: #f5f7fa;">
      <h2>商品管理</h2>
      <p>这是一个自定义的页面头部</p>
    </div>

    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" v-show="showSearch">
      <!-- 表单内容 -->
    </el-form>

    <!-- 表格区域 -->
    <el-table :data="tableData" :height="tableHeight">
      <!-- 表格列 -->
    </el-table>

    <!-- 分页 -->
    <el-pagination />
  </div>
</template>

<script setup lang="ts">
// 传入 60，表示需要额外减去 60px 高度（自定义头部的高度）
const { tableHeight, queryFormRef, showSearch } = useTableHeight(60)
</script>
```

**参数说明**:

- **正数**: 减少表格高度（当页面有额外元素占用空间时）
- **负数**: 增加表格高度（当页面元素比预期少时）
- **0**: 使用默认计算逻辑

## 高级用法

### 手动触发重新计算

在某些动态内容变化后，可能需要手动重新计算表格高度：

```vue
<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'

const { tableHeight, calculateTableHeight } = useTableHeight()

// 动态加载额外内容后重新计算
const loadExtraContent = async () => {
  await fetchExtraData()

  // 等待 DOM 更新后重新计算
  await nextTick()
  await calculateTableHeight()
}

// 折叠面板展开/收起后重新计算
const onCollapseChange = async () => {
  await nextTick()
  await calculateTableHeight()
}
</script>
```

### 监听高度变化

可以监听 `tableHeight` 的变化来执行额外逻辑：

```vue
<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'

const { tableHeight } = useTableHeight()

// 监听表格高度变化
watch(tableHeight, (newHeight, oldHeight) => {
  console.log(`表格高度变化: ${oldHeight}px -> ${newHeight}px`)

  // 可以在这里执行其他需要的操作
  // 例如：记录日志、触发分析等
})

// 使用 watchEffect 进行响应式处理
watchEffect(() => {
  if (tableHeight.value < 300) {
    console.warn('表格高度过小，可能影响用户体验')
  }
})
</script>
```

### 与 ASearchForm 组件配合

项目中的 `ASearchForm` 组件已经内置了展开/收起功能，与 `useTableHeight` 配合使用：

```vue
<template>
  <div class="page-container">
    <!-- 使用 ASearchForm 组件 -->
    <ASearchForm ref="queryFormRef" v-model="queryParams" :visible="showSearch">
      <AFormInput
        label="用户名"
        v-model="queryParams.username"
        prop="username"
      />
      <AFormSelect
        label="状态"
        v-model="queryParams.status"
        prop="status"
        :options="statusOptions"
      />
      <AFormDate
        label="创建时间"
        v-model="dateRange"
        type="daterange"
      />
    </ASearchForm>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <TableToolbar
            v-model:showSearch="showSearch"
            v-model:columns="visibleColumns"
            :columns="columns"
            @query-table="getList"
          />
        </el-row>
      </template>

      <el-table :data="tableData" :height="tableHeight" border stripe>
        <el-table-column
          v-for="col in visibleColumns"
          :key="col.field"
          :label="col.label"
          :prop="col.field"
          :width="col.width"
        />
      </el-table>

      <APagination
        v-model:page="pagination.page"
        v-model:limit="pagination.size"
        :total="pagination.total"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'

const { tableHeight, queryFormRef, showSearch } = useTableHeight()

const queryParams = ref({
  username: '',
  status: ''
})

const dateRange = ref([])
const tableData = ref([])

const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

const columns = [
  { field: 'username', label: '用户名', width: 120 },
  { field: 'nickname', label: '昵称', width: 120 },
  { field: 'email', label: '邮箱' },
  { field: 'status', label: '状态', width: 80 },
  { field: 'createTime', label: '创建时间', width: 180 }
]

const visibleColumns = ref([...columns])

const getList = async () => {
  // 获取列表数据
}
</script>
```

### 与可拖拽面板配合

在用户管理等页面，左侧有部门树，需要与 `AResizablePanels` 组件配合：

```vue
<template>
  <div>
    <AResizablePanels
      v-model:leftWidth="leftPanelWidth"
      :min-width="200"
      :max-width="500"
    >
      <!-- 左侧面板：部门树 -->
      <template #left>
        <el-card shadow="hover">
          <el-input v-model="deptName" placeholder="请输入部门名称" />
          <!-- 树的高度需要与表格高度同步 -->
          <el-tree
            :style="{ height: `${queryFormRef?.$el?.offsetHeight + tableHeight + 82}px` }"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </template>

      <!-- 右侧面板：用户列表 -->
      <template #right>
        <ASearchForm ref="queryFormRef" v-model="queryParams" :visible="showSearch">
          <!-- 搜索表单项 -->
        </ASearchForm>

        <el-card shadow="hover">
          <template #header>
            <!-- 工具栏 -->
          </template>

          <el-table :data="userList" :height="tableHeight" border stripe>
            <!-- 表格列 -->
          </el-table>

          <APagination />
        </el-card>
      </template>
    </AResizablePanels>
  </div>
</template>

<script setup lang="ts">
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

const leftPanelWidth = ref(280)
const deptName = ref('')
const deptOptions = ref([])
const userList = ref([])
</script>
```

**技术要点**:

- 左侧树的高度使用公式 `queryFormRef?.$el?.offsetHeight + tableHeight + 82`
- 这确保了左右两侧面板高度保持一致
- `82px` 是 Card Header 等固定元素的高度补偿

### 在 KeepAlive 缓存页面中使用

`useTableHeight` 已经处理了 `onActivated` 生命周期，确保在 KeepAlive 激活时重新计算高度：

```vue
<template>
  <!-- 父组件中使用 KeepAlive -->
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<!-- 子页面组件 -->
<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'

// 自动处理 KeepAlive 激活/停用
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// 如果需要在激活时执行额外逻辑
onActivated(() => {
  console.log('页面被激活，表格高度:', tableHeight.value)
  // 可以在这里刷新数据等
})
</script>
```

**内部实现**:

- `onMounted`: 添加 resize 事件监听，执行初始计算
- `onActivated`: 重新添加 resize 事件监听（从缓存恢复时）
- `onBeforeUnmount`: 移除事件监听，清理定时器和 ResizeObserver

## API

### 函数签名

```typescript
function useTableHeight(heightAdjustment?: number): {
  tableHeight: Ref<number>
  queryFormRef: Ref<any>
  calculateTableHeight: () => Promise<void>
  showSearch: Ref<boolean>
}
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| heightAdjustment | `number` | `0` | 高度调整值。正数减少高度，负数增加高度 |

### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| tableHeight | `Ref<number>` | 计算后的表格高度（像素），最小值为 200px |
| queryFormRef | `Ref<any>` | 查询表单的引用，需要绑定到表单组件的 ref 属性 |
| calculateTableHeight | `() => Promise<void>` | 手动触发高度计算的方法 |
| showSearch | `Ref<boolean>` | 搜索表单的显示状态，初始值为 true |

### 类型定义

```typescript
/**
 * 表格高度自适应 Composable 的返回类型
 */
interface UseTableHeightReturn {
  /**
   * 计算后的表格高度
   * @description 响应式变量，会自动根据页面布局变化更新
   * @default 500
   * @minimum 200
   */
  tableHeight: Ref<number>

  /**
   * 查询表单引用
   * @description 必须绑定到搜索表单组件，用于获取表单高度
   */
  queryFormRef: Ref<FormInstance | null>

  /**
   * 手动计算表格高度
   * @description 在动态内容变化后调用，会等待 nextTick 后执行计算
   * @returns Promise<void>
   */
  calculateTableHeight: () => Promise<void>

  /**
   * 搜索表单显示状态
   * @description 控制搜索表单的显示/隐藏，切换时会自动重新计算表格高度
   * @default true
   */
  showSearch: Ref<boolean>
}
```

### 内部常量

| 常量 | 值 | 说明 |
|------|------|------|
| navbarHeight | 50px | 顶部导航栏高度 |
| tagsHeight | 34px / 0px | 标签页高度，根据 tagsView 配置决定 |
| pageContainerPadding | 16px | 页面容器内边距 (.p-2 = 8px * 2) |
| cardHeaderHeight | 62px | 卡片头部（工具栏区域）高度 |
| tablePadding | 40px | 表格容器内边距和间距 |
| paginationHeight | 56px | 分页组件高度和边距 |
| otherPadding | 18px | 其他元素和边距的补偿值 |
| minHeight | 200px | 表格最小高度 |

### 防抖延迟配置

| 事件 | 延迟时间 | 说明 |
|------|----------|------|
| 窗口调整 (resize) | 150ms | 窗口大小变化时的防抖延迟 |
| 侧边栏切换 (sidebar) | 240ms | 等待侧边栏动画完成 |
| 标签页切换 (tagsView) | 100ms | 标签页配置变化 |
| 搜索表单切换 (showSearch) | 100ms | 搜索表单显示/隐藏 |
| 表单尺寸变化 (ResizeObserver) | 100ms | 表单内容变化 |
| 初始计算 (mounted) | 100ms | 组件挂载后的初始计算 |

## 与 useLayout 集成

`useTableHeight` 内部使用 `useLayout` 获取布局状态，确保表格高度能响应以下变化：

### 监听的布局状态

```typescript
// 侧边栏开关状态
watch(
  () => layout.sidebar.value.opened,
  () => {
    // 侧边栏动画需要较长时间，使用 240ms 延迟
    debouncedCalculateHeight(240)
  }
)

// 标签页显示配置
watch(
  () => layout.tagsView.value,
  () => {
    // 标签页高度变化使用 100ms 延迟
    debouncedCalculateHeight(100)
  }
)
```

### 标签页高度计算

```typescript
// 根据 tagsView 配置决定标签页区域高度
const tagsHeight = layout.tagsView.value ? 34 : 0
```

## ResizeObserver 集成

### 表单尺寸监听

`useTableHeight` 使用 `ResizeObserver` API 监听搜索表单的尺寸变化，这使得以下场景能够正确触发重新计算：

```typescript
// 创建 ResizeObserver 监听表单元素
watch(
  () => queryFormRef.value?.$el,
  (formElement) => {
    // 清理旧的观察器
    if (formResizeObserver) {
      formResizeObserver.disconnect()
      formResizeObserver = null
    }

    // 如果表单元素存在，创建新的观察器
    if (formElement) {
      formResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // 当表单尺寸变化时，重新计算表格高度
          debouncedCalculateHeight(100)
        }
      })
      formResizeObserver.observe(formElement)
    }
  },
  { immediate: true }
)
```

### 触发重新计算的场景

- **表单项增减**: 动态添加或删除表单项
- **表单展开/收起**: ASearchForm 组件的折叠功能
- **响应式布局变化**: 屏幕宽度变化导致表单行数变化
- **内容变化**: 表单项内容导致的高度变化

## 生命周期管理

### 完整的生命周期处理

```typescript
// 组件挂载时
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // 延迟计算以确保 DOM 已完全渲染
  debouncedCalculateHeight(100)
})

// 组件激活时（KeepAlive）
onActivated(() => {
  window.addEventListener('resize', handleResize)
  // 重新计算高度
  debouncedCalculateHeight(100)
})

// 组件卸载前
onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)

  // 清理计时器
  if (heightCalculationTimer !== null) {
    clearTimeout(heightCalculationTimer)
  }

  // 清理 ResizeObserver
  if (formResizeObserver) {
    formResizeObserver.disconnect()
    formResizeObserver = null
  }
})
```

### 内存泄漏防护

- **事件监听器**: 在 `onBeforeUnmount` 中移除 `resize` 事件监听
- **定时器**: 清理防抖定时器，防止组件卸载后仍然执行回调
- **ResizeObserver**: 断开观察器连接，释放资源

## 最佳实践

### 1. 正确绑定 queryFormRef

```vue
<!-- ✅ 正确：绑定到表单组件 -->
<el-form ref="queryFormRef" v-show="showSearch">
  <!-- 表单内容 -->
</el-form>

<!-- ✅ 正确：使用 ASearchForm 组件 -->
<ASearchForm ref="queryFormRef" v-model="queryParams" :visible="showSearch">
  <!-- 表单内容 -->
</ASearchForm>

<!-- ❌ 错误：未绑定 ref -->
<el-form v-show="showSearch">
  <!-- 表单内容 -->
</el-form>

<!-- ❌ 错误：绑定到错误的元素 -->
<div ref="queryFormRef">
  <el-form v-show="showSearch">
    <!-- 表单内容 -->
  </el-form>
</div>
```

### 2. 使用 showSearch 控制表单显示

```vue
<script setup lang="ts">
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// ✅ 正确：使用 Composable 提供的 showSearch
// 切换时会自动触发高度重新计算
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// ❌ 错误：使用自己定义的变量
// 高度变化不会被自动监听
const myShowSearch = ref(true)
</script>
```

### 3. 合理设置 heightAdjustment

```typescript
// 场景1：页面有固定高度的自定义头部（60px）
const { tableHeight } = useTableHeight(60)

// 场景2：页面没有标准的 Card 包装，需要减少扣除的高度
const { tableHeight } = useTableHeight(-40)

// 场景3：有多个固定区域
const HEADER_HEIGHT = 60
const FOOTER_HEIGHT = 40
const { tableHeight } = useTableHeight(HEADER_HEIGHT + FOOTER_HEIGHT)
```

### 4. 动态内容变化时手动重新计算

```vue
<script setup lang="ts">
const { tableHeight, calculateTableHeight } = useTableHeight()

// 场景1：折叠面板展开/收起
const onCollapseChange = async () => {
  await nextTick()
  await calculateTableHeight()
}

// 场景2：Tab 切换显示不同内容
const onTabChange = async (tabName: string) => {
  activeTab.value = tabName
  await nextTick()
  await calculateTableHeight()
}

// 场景3：弹窗关闭后页面内容变化
const onDialogClose = async () => {
  await nextTick()
  await calculateTableHeight()
}
</script>
```

### 5. 避免在计算高度期间频繁操作 DOM

```typescript
// ❌ 不推荐：在循环中触发多次计算
for (const item of items) {
  addItem(item)
  await calculateTableHeight() // 每次循环都计算
}

// ✅ 推荐：批量操作后一次性计算
for (const item of items) {
  addItem(item)
}
await nextTick()
await calculateTableHeight() // 只计算一次
```

### 6. 处理异步数据加载

```vue
<script setup lang="ts">
const { tableHeight, calculateTableHeight } = useTableHeight()
const loading = ref(false)
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const data = await fetchData()
    tableData.value = data

    // 数据加载完成后，如果有动态内容可能影响布局
    // 需要重新计算高度
    await nextTick()
    await calculateTableHeight()
  } finally {
    loading.value = false
  }
}
</script>
```

### 7. 与虚拟滚动配合

```vue
<template>
  <!-- 使用 Element Plus 的虚拟滚动表格 -->
  <el-table-v2
    :data="tableData"
    :height="tableHeight"
    :columns="columns"
    :row-height="48"
  />
</template>

<script setup lang="ts">
const { tableHeight } = useTableHeight()

// 虚拟滚动表格需要明确的高度，tableHeight 正好提供
</script>
```

### 8. 响应式断点处理

```vue
<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { tableHeight, calculateTableHeight } = useTableHeight()
const { width } = useWindowSize()

// 根据屏幕宽度调整布局
const isMobile = computed(() => width.value < 768)

watch(isMobile, async (newValue) => {
  // 移动端/桌面端切换时重新计算
  await nextTick()
  await calculateTableHeight()
})
</script>
```

## 常见问题

### 1. 表格高度计算不正确

**问题原因**:
- `queryFormRef` 未正确绑定
- 页面有额外的固定元素未计入
- DOM 未完全渲染时就进行计算

**解决方案**:

```vue
<script setup lang="ts">
const { tableHeight, queryFormRef, calculateTableHeight } = useTableHeight()

// 确保正确绑定
onMounted(() => {
  console.log('queryFormRef:', queryFormRef.value)
  console.log('表单高度:', queryFormRef.value?.$el?.offsetHeight)
})

// 如果有额外元素，使用 heightAdjustment
const { tableHeight } = useTableHeight(80) // 减去额外 80px
</script>

<template>
  <!-- 确保 ref 绑定正确 -->
  <el-form ref="queryFormRef" v-show="showSearch">
    <!-- 表单内容 -->
  </el-form>
</template>
```

### 2. 切换搜索表单时高度不更新

**问题原因**:
- 未使用 Composable 提供的 `showSearch`
- 使用了自定义的显示状态变量

**解决方案**:

```vue
<script setup lang="ts">
// ✅ 使用 Composable 提供的 showSearch
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// ❌ 不要使用自定义变量
// const myShow = ref(true)
</script>

<template>
  <!-- ✅ 使用 showSearch -->
  <el-form ref="queryFormRef" v-show="showSearch">
    <!-- 表单内容 -->
  </el-form>
</template>
```

### 3. 侧边栏切换时表格闪烁

**问题原因**:
- 侧边栏动画时间与高度计算延迟不匹配
- 计算触发过早，在动画完成前就更新了高度

**解决方案**:

内部已处理，侧边栏切换使用 240ms 延迟，等待动画完成：

```typescript
// useTableHeight 内部已处理
watch(
  () => layout.sidebar.value.opened,
  () => {
    // 240ms 延迟等待侧边栏动画完成
    debouncedCalculateHeight(240)
  }
)
```

如果仍有问题，可以在页面中添加过渡效果：

```css
.el-table {
  transition: height 0.3s ease;
}
```

### 4. KeepAlive 缓存页面高度异常

**问题原因**:
- 页面从缓存恢复时，resize 事件监听器已被移除
- 布局状态可能已发生变化

**解决方案**:

Composable 已处理 `onActivated` 生命周期：

```typescript
// useTableHeight 内部已处理
onActivated(() => {
  window.addEventListener('resize', handleResize)
  debouncedCalculateHeight(100)
})
```

如果需要额外处理：

```vue
<script setup lang="ts">
const { tableHeight, calculateTableHeight } = useTableHeight()

onActivated(async () => {
  // 页面激活时刷新数据
  await fetchData()
  // 确保高度正确
  await nextTick()
  await calculateTableHeight()
})
</script>
```

### 5. 动态表单项导致高度不正确

**问题原因**:
- ResizeObserver 可能未及时触发
- 表单项变化后 DOM 更新有延迟

**解决方案**:

```vue
<script setup lang="ts">
const { tableHeight, calculateTableHeight } = useTableHeight()
const formItems = ref([])

// 动态添加/删除表单项后重新计算
watch(
  () => formItems.value.length,
  async () => {
    await nextTick()
    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 50))
    await calculateTableHeight()
  }
)
</script>
```

### 6. 表格高度过小

**问题原因**:
- 视口高度太小
- 页面元素过多，占用了大部分空间

**解决方案**:

Composable 内部有最小高度保护（200px）：

```typescript
// 内部实现
tableHeight.value = Math.max(availableHeight, 200)
```

如果需要更大的最小高度：

```vue
<script setup lang="ts">
const { tableHeight: rawTableHeight } = useTableHeight()

// 自定义最小高度
const tableHeight = computed(() => Math.max(rawTableHeight.value, 400))
</script>
```

### 7. 打印时表格高度异常

**问题原因**:
- 打印时 `window.innerHeight` 可能不正确
- 打印样式与屏幕样式不同

**解决方案**:

```css
@media print {
  .el-table {
    height: auto !important;
    max-height: none !important;
  }

  .el-table__body-wrapper {
    height: auto !important;
    overflow: visible !important;
  }
}
```

### 8. 表格与其他组件高度同步

**问题原因**:
- 左右面板或多个表格需要保持同步高度
- 不同组件使用不同的高度计算

**解决方案**:

```vue
<script setup lang="ts">
const { tableHeight, queryFormRef } = useTableHeight()

// 左侧面板高度与表格同步
const leftPanelHeight = computed(() => {
  const formHeight = queryFormRef.value?.$el?.offsetHeight || 0
  // 加上工具栏和边距的补偿
  return formHeight + tableHeight.value + 82
})
</script>

<template>
  <div class="left-panel" :style="{ height: `${leftPanelHeight}px` }">
    <!-- 左侧内容 -->
  </div>

  <div class="right-panel">
    <el-form ref="queryFormRef" />
    <el-table :height="tableHeight" />
  </div>
</template>
```

## 性能优化

### 防抖机制

所有触发高度重新计算的事件都使用防抖处理：

```typescript
let heightCalculationTimer: number | null = null

const debouncedCalculateHeight = (delay: number = 100) => {
  // 清除之前的定时器
  if (heightCalculationTimer !== null) {
    clearTimeout(heightCalculationTimer)
  }

  // 设置新的定时器
  heightCalculationTimer = window.setTimeout(() => {
    calculateTableHeight()
    heightCalculationTimer = null
  }, delay)
}
```

### 避免不必要的重新计算

```typescript
// 计算高度时使用 nextTick 确保 DOM 已更新
const calculateTableHeight = async () => {
  await nextTick()

  // 获取各元素高度
  const formHeight = queryFormRef.value?.$el?.offsetHeight || 0

  // 计算可用高度
  const availableHeight = window.innerHeight - /* ... */

  // 只在高度变化时更新
  if (tableHeight.value !== Math.max(availableHeight, 200)) {
    tableHeight.value = Math.max(availableHeight, 200)
  }
}
```

### 资源清理

```typescript
onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)

  // 清理定时器
  if (heightCalculationTimer !== null) {
    clearTimeout(heightCalculationTimer)
    heightCalculationTimer = null
  }

  // 断开 ResizeObserver
  if (formResizeObserver) {
    formResizeObserver.disconnect()
    formResizeObserver = null
  }
})
```

## 使用场景统计

`useTableHeight` 在项目中被广泛使用，覆盖以下业务模块：

### 系统管理模块

- 用户管理 (`system/core/user/user.vue`)
- 角色管理 (`system/core/role/role.vue`)
- 菜单管理 (`system/core/menu/menu.vue`)
- 部门管理 (`system/core/dept/dept.vue`)
- 岗位管理 (`system/core/post/post.vue`)
- 参数配置 (`system/config/config.vue`)
- 通知公告 (`system/config/notice.vue`)
- 在线用户 (`system/monitor/online/online.vue`)
- 操作日志 (`system/monitor/operLog/operLog.vue`)
- 登录日志 (`system/monitor/loginLog/loginLog.vue`)

### 租户管理模块

- 租户管理 (`system/tenant/tenant.vue`)
- 租户套餐 (`system/tenant/tenantPackage.vue`)

### OSS 管理模块

- OSS 文件管理 (`system/oss/oss.vue`)
- OSS 配置管理 (`system/oss/OssConfig.vue`)

### 工作流模块

- 流程定义 (`workflow/processDefinition/processDefinition.vue`)
- 流程实例 (`workflow/processInstance/processInstance.vue`)
- 我的待办 (`workflow/task/taskWaiting.vue`)
- 我的已办 (`workflow/task/taskFinish.vue`)
- 我的文档 (`workflow/task/myDocument.vue`)
- 抄送列表 (`workflow/task/taskCopyList.vue`)
- 全部待办 (`workflow/task/allTaskWaiting.vue`)
- 请假管理 (`workflow/leave/leave.vue`)

### 代码生成模块

- 代码生成 (`tool/gen/gen.vue`)
- 编辑表结构 (`tool/gen/editTable.vue`)

### 业务模块

- 广告管理 (`business/base/ad/ad.vue`)
- 支付配置 (`business/base/payment/payment.vue`)
- 平台配置 (`business/base/platform/platform.vue`)
- 商品管理 (`business/mall/goods/goods.vue`)
- 订单管理 (`business/mall/order/order.vue`)

统计：**37+ 个业务页面**使用了 `useTableHeight` Composable。

## 完整示例

### 标准列表页面模板

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <ASearchForm ref="queryFormRef" v-model="queryParams" :visible="showSearch">
      <AFormInput
        label="名称"
        v-model="queryParams.name"
        prop="name"
        @input="handleQuery"
      />
      <AFormSelect
        label="状态"
        v-model="queryParams.status"
        prop="status"
        :options="statusOptions"
        @change="handleQuery"
      />
      <AFormDate
        label="创建时间"
        v-model="dateRange"
        type="daterange"
        @change="handleQuery"
      />
    </ASearchForm>

    <!-- 表格卡片 -->
    <el-card shadow="hover">
      <!-- 工具栏 -->
      <template #header>
        <el-row :gutter="10" class="mb-2">
          <el-col :span="1.5" v-permi="['system:xxx:add']">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5" v-permi="['system:xxx:update']">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="!single"
              @click="handleUpdate()"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5" v-permi="['system:xxx:delete']">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="!selected"
              @click="handleDelete()"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5" v-permi="['system:xxx:export']">
            <el-button type="warning" plain icon="Download" @click="handleExport">
              导出
            </el-button>
          </el-col>
          <TableToolbar
            v-model:showSearch="showSearch"
            v-model:columns="visibleColumns"
            :columns="columns"
            @reset-query="resetQuery"
            @query-table="getList"
          />
        </el-row>
      </template>

      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :height="tableHeight"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          v-for="col in visibleColumns"
          :key="col.field"
          :label="col.label"
          :prop="col.field"
          :width="col.width"
          :align="col.align || 'center'"
          :show-overflow-tooltip="col.showOverflowTooltip !== false"
        >
          <template v-if="col.slot" #default="scope">
            <slot :name="col.slot" :row="scope.row" :index="scope.$index" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-permi="['system:xxx:update']"
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
            >
              修改
            </el-button>
            <el-button
              v-permi="['system:xxx:delete']"
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <APagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <EditDialog ref="editDialogRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'
import { useDict } from '@/composables/useDict'
import { useDownload } from '@/composables/useDownload'
import { showConfirm, showMsgSuccess } from '@/utils/modal'
import { listXxx, delXxx, exportXxx } from '@/api/xxx'
import EditDialog from './EditDialog.vue'

// 表格高度自适应
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// 字典数据
const { sys_normal_disable: statusOptions } = useDict('sys_normal_disable')

// 下载工具
const { download } = useDownload()

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  name: '',
  status: ''
})

// 时间范围
const dateRange = ref([])

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 选择项
const selectionItems = ref([])
const single = computed(() => selectionItems.value.length === 1)
const selected = computed(() => selectionItems.value.length > 0)

// 表格列配置
const columns = [
  { field: 'id', label: 'ID', width: 80 },
  { field: 'name', label: '名称' },
  { field: 'status', label: '状态', width: 100, slot: 'status' },
  { field: 'createTime', label: '创建时间', width: 180 }
]
const visibleColumns = ref([...columns])

// 编辑弹窗引用
const editDialogRef = ref()

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams.value,
      beginCreateTime: dateRange.value?.[0],
      endCreateTime: dateRange.value?.[1]
    }
    const { rows, total: t } = await listXxx(params)
    tableData.value = rows
    total.value = t
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 20,
    name: '',
    status: ''
  }
  dateRange.value = []
  handleQuery()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectionItems.value = selection
}

// 新增
const handleAdd = () => {
  editDialogRef.value?.open('add')
}

// 修改
const handleUpdate = (row?: any) => {
  const id = row?.id || selectionItems.value[0]?.id
  editDialogRef.value?.open('edit', id)
}

// 删除
const handleDelete = async (row?: any) => {
  const ids = row?.id ? [row.id] : selectionItems.value.map((item) => item.id)

  await showConfirm(`确定要删除选中的 ${ids.length} 条数据吗？`)

  await delXxx(ids)
  showMsgSuccess('删除成功')
  getList()
}

// 导出
const handleExport = () => {
  download('/xxx/export', queryParams.value, 'xxx_export.xlsx')
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px;
}
</style>
```

这个完整示例展示了 `useTableHeight` 在实际业务页面中的标准使用方式，包括搜索表单、工具栏、表格、分页和弹窗等完整功能。
