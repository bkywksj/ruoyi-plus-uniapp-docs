# useSelection

表格选择管理组合函数，提供完整的表格行选择状态管理能力，支持单选、多选、跨页选择等多种场景，与 Element Plus 表格组件深度集成。

## 介绍

`useSelection` 是专为 Element Plus Table 组件设计的选择状态管理 Composable，它解决了表格组件在实际业务中常见的选择管理问题：

**核心特性：**

- **跨页选择保持** - 在分页切换时自动保持选中状态，支持大数据量下的批量操作
- **单选/多选模式** - 支持单选和多选两种模式，单选模式自动取消之前的选中项
- **选中状态同步** - 与表格当前数据自动同步，确保勾选状态正确显示
- **批量操作支持** - 提供添加、删除、清空等批量操作方法
- **ID 标识机制** - 通过唯一标识符（rowKey）追踪选中行，避免引用丢失
- **类型安全** - 完整的 TypeScript 泛型支持，确保类型推导正确
- **智能恢复** - 支持异步数据初始化和预选功能
- **动态模式切换** - 运行时可动态切换单选/多选模式

该组合函数的设计理念是将选中状态与表格数据分离管理，通过 ID 集合追踪选中项，而非直接存储行对象引用。这种设计有效解决了分页场景下选中状态丢失的问题。

## 基础用法

### 多选模式

最常用的多选功能，配合 `el-table` 实现批量选择：

```vue
<template>
  <div class="selection-demo">
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button
        type="primary"
        :disabled="selectionItems.length === 0"
        @click="handleBatchDelete"
      >
        批量删除 ({{ selectionItems.length }})
      </el-button>
      <el-button @click="handleClearSelection">清空选择</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userId" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 选中项标签展示 -->
    <div v-if="selectionItems.length > 0" class="selected-tags">
      <h4>已选中 {{ selectionItems.length }} 项：</h4>
      <el-tag
        v-for="item in selectionItems"
        :key="item.userId"
        closable
        class="selected-tag"
        @close="() => selectionRemove(item.userId)"
      >
        {{ item.name }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSelection } from '@/composables/useSelection'
import type { ElTable } from 'element-plus'

// 定义数据类型
interface User {
  userId: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

// 表格引用
const tableRef = ref<InstanceType<typeof ElTable>>()

// 表格数据
const tableData = ref<User[]>([])

// 是否多选模式
const isMultiple = ref(true)

// 使用选择管理
const {
  selectionItems,
  selectionChange,
  selectionRemove,
  selectionClear
} = useSelection<User>('userId', tableRef, tableData, isMultiple)

// 批量删除
const handleBatchDelete = () => {
  const selectedIds = selectionItems.value.map(item => item.userId)
  console.log('要删除的 ID:', selectedIds)
  console.log('要删除的行数据:', selectionItems.value)
  // 执行删除逻辑...
}

// 清空选择
const handleClearSelection = () => {
  selectionClear()
}

// 模拟加载数据
onMounted(() => {
  tableData.value = [
    { userId: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
    { userId: 2, name: '李四', email: 'lisi@example.com', status: 'active' },
    { userId: 3, name: '王五', email: 'wangwu@example.com', status: 'inactive' },
    { userId: 4, name: '赵六', email: 'zhaoliu@example.com', status: 'active' }
  ]
})
</script>

<style scoped>
.selection-demo {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
}

.selected-tags {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.selected-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
```

**使用说明：**
- 第一个参数 `'userId'` 指定行数据的唯一标识字段
- `tableRef` 是表格组件的引用
- `tableData` 是当前页面的数据列表
- `isMultiple` 控制是否为多选模式
- `selectionItems` 包含所有选中行的完整数据对象

### 单选模式

当业务场景只需要选择单条数据时，可以使用单选模式：

```vue
<template>
  <div class="single-selection-demo">
    <div class="current-selection">
      当前选中：{{ selectionItems.length > 0 ? selectionItems[0].name : '无' }}
    </div>

    <el-table ref="tableRef" :data="tableData" highlight-current-row>
      <!-- 单选列使用 radio -->
      <el-table-column width="55">
        <template #default="{ row }">
          <el-radio
            :model-value="selectionItems[0]?.userId || ''"
            :value="row.userId"
            @change="() => selectionChange(row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="department" label="部门" />
    </el-table>

    <div class="actions" v-if="selectionItems.length > 0">
      <el-button @click="selectionClear">取消选择</el-button>
      <el-button type="primary" @click="handleConfirm">确认选择</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Employee {
  userId: number
  name: string
  department: string
}

const tableRef = ref()
const tableData = ref<Employee[]>([
  { userId: 1, name: '张三', department: '研发部' },
  { userId: 2, name: '李四', department: '市场部' },
  { userId: 3, name: '王五', department: '人事部' }
])

// 单选模式配置
const isMultiple = ref(false)

const {
  selectionItems,
  selectionChange,
  selectionClear
} = useSelection<Employee>('userId', tableRef, tableData, isMultiple)

const handleConfirm = () => {
  console.log('确认选择:', selectionItems.value[0])
}
</script>
```

**单选模式特点：**
- 设置 `isMultiple` 为 `ref(false)` 启用单选模式
- 使用 `el-radio` 组件替代 `type="selection"` 列
- 选中新行时自动取消之前的选中项
- `selectionItems` 始终最多包含一个元素
- 适用于需要选择单条记录进行操作的场景

### 动态切换选择模式

支持运行时在单选和多选模式之间切换：

```vue
<template>
  <div class="dynamic-mode-demo">
    <el-switch
      v-model="isMultiple"
      active-text="多选"
      inactive-text="单选"
      @change="handleModeChange"
    />

    <el-table ref="tableRef" :data="tableData" @selection-change="selectionChange">
      <!-- 多选模式 -->
      <el-table-column v-if="isMultiple" type="selection" width="55" />
      <!-- 单选模式 -->
      <el-table-column v-else width="55">
        <template #default="{ row }">
          <el-radio
            :model-value="selectionItems[0]?.userId || ''"
            :value="row.userId"
            @change="() => selectionChange(row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
    </el-table>

    <div class="selection-info">
      已选择 {{ selectionItems.length }} 项
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Item {
  userId: number
  name: string
}

const tableRef = ref()
const tableData = ref<Item[]>([
  { userId: 1, name: '项目 A' },
  { userId: 2, name: '项目 B' },
  { userId: 3, name: '项目 C' }
])

const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange,
  selectionClear
} = useSelection<Item>('userId', tableRef, tableData, isMultiple)

// 切换模式时清空选择
const handleModeChange = () => {
  selectionClear()
}
</script>
```

## 跨页选择

### 分页场景下的选中保持

`useSelection` 的核心能力之一是支持跨页选择，即在分页切换时保持之前选中的数据：

```vue
<template>
  <div class="pagination-selection">
    <!-- 显示选中信息 -->
    <el-alert
      v-if="selectionItems.length > 0"
      :title="`已选择 ${selectionItems.length} 条数据`"
      type="info"
      :closable="false"
      show-icon
    >
      <template #default>
        <span>已选 ID: {{ selectionItems.map(i => i.id).join(', ') }}</span>
        <el-button link type="primary" @click="handleViewSelected">
          查看详情
        </el-button>
      </template>
    </el-alert>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Article {
  id: number
  title: string
  createTime: string
}

const tableRef = ref()
const tableData = ref<Article[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const isMultiple = ref(true)

// 跨页选择配置
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionClear
} = useSelection<Article>('id', tableRef, tableData, isMultiple)

// 加载数据
const loadData = async () => {
  // 模拟 API 请求
  const response = await fetchArticles({
    page: currentPage.value,
    size: pageSize.value
  })

  tableData.value = response.data.list
  total.value = response.data.total

  // 关键：数据加载后同步选中状态
  await nextTick()
  selectionSync()
}

// 页码改变时的处理
const handlePageChange = () => {
  loadData()
}

// 查看已选数据详情
const handleViewSelected = () => {
  console.log('已选数据详情:', selectionItems.value)
}

// 监听数据变化，自动同步选中状态
watch(tableData, async () => {
  await nextTick()
  selectionSync()
})

// 模拟 API
const fetchArticles = async (params: { page: number; size: number }) => {
  return {
    data: {
      list: Array.from({ length: params.size }, (_, i) => ({
        id: (params.page - 1) * params.size + i + 1,
        title: `文章标题 ${(params.page - 1) * params.size + i + 1}`,
        createTime: new Date().toLocaleString()
      })),
      total: 100
    }
  }
}

// 初始加载
loadData()
</script>
```

**跨页选择核心要点：**

1. **数据加载后同步选中状态** - 使用 `selectionSync` 方法在数据加载后恢复表格的勾选状态
2. **必须等待 DOM 更新** - 使用 `nextTick` 确保表格已渲染新数据
3. **监听数据变化** - 可以使用 `watch` 自动触发同步

### 选中状态同步机制

`selectionSync` 方法的工作原理是遍历当前表格数据，找出已在选中列表中的行，然后调用表格的 `toggleRowSelection` 方法恢复选中状态：

```vue
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Product {
  id: number
  name: string
  price: number
  category: string
}

const tableRef = ref()
const tableData = ref<Product[]>([])
const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange,
  selectionSync
} = useSelection<Product>('id', tableRef, tableData, isMultiple)

// 监听数据变化，自动同步选中状态
watch(
  () => tableData.value,
  async (newData) => {
    if (newData.length > 0 && selectionItems.value.length > 0) {
      await nextTick()
      selectionSync()
    }
  },
  { deep: true }
)

// 手动触发同步（例如筛选后）
const handleFilterChange = async () => {
  // 筛选数据...
  await nextTick()
  selectionSync()
}
</script>
```

## 预选数据初始化

### 使用 ID 数组初始化

```vue
<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useSelection } from '@/composables/useSelection'

const {
  selectionItems,
  selectionInit,
  selectionSync
} = useSelection<User>('userId', tableRef, tableData, isMultiple)

onMounted(async () => {
  // 加载表格数据
  await loadTableData()

  // 使用 ID 数组初始化预选项
  await selectionInit([1, 2, 3])

  // 同步表格显示
  await nextTick()
  selectionSync()
})
</script>
```

### 使用对象数组初始化

```vue
<script setup lang="ts">
const { selectionInit, selectionSync } = useSelection<User>(
  'userId',
  tableRef,
  tableData,
  isMultiple
)

onMounted(async () => {
  await loadTableData()

  // 使用完整对象数组初始化
  const preselectedUsers = [
    { userId: 1, name: '张三', email: 'zhang@example.com' },
    { userId: 2, name: '李四', email: 'li@example.com' }
  ]

  await selectionInit(preselectedUsers)
  await nextTick()
  selectionSync()
})
</script>
```

### 使用异步函数初始化

```vue
<script setup lang="ts">
const { selectionInit, selectionSync } = useSelection<User>(
  'userId',
  tableRef,
  tableData,
  isMultiple
)

onMounted(async () => {
  await loadTableData()

  // 使用异步函数获取预选数据
  await selectionInit(async () => {
    const [err, data] = await getUsersByIds([1, 2, 3])
    if (err) {
      console.error('获取预选数据失败:', err)
      return []
    }
    return data
  })

  await nextTick()
  selectionSync()
})
</script>
```

## 选中数据管理

### 移除选中项

从选中列表中移除特定项：

```vue
<template>
  <div class="selection-remove-demo">
    <!-- 已选列表 -->
    <div class="selected-list">
      <h4>已选项目 ({{ selectionItems.length }})</h4>
      <el-tag
        v-for="item in selectionItems"
        :key="item.id"
        closable
        class="selected-tag"
        @close="() => handleRemove(item)"
      >
        {{ item.name }}
      </el-tag>
      <el-button
        v-if="selectionItems.length > 0"
        type="danger"
        size="small"
        @click="handleClearAll"
      >
        清空全部
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Item {
  id: number
  name: string
}

const tableRef = ref()
const tableData = ref<Item[]>([
  { id: 1, name: '项目 A' },
  { id: 2, name: '项目 B' },
  { id: 3, name: '项目 C' },
  { id: 4, name: '项目 D' }
])
const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange,
  selectionRemove,
  selectionClear,
  selectionSync
} = useSelection<Item>('id', tableRef, tableData, isMultiple)

// 移除单个选中项
const handleRemove = async (item: Item) => {
  await selectionRemove(item.id, item)
  await nextTick()
  selectionSync()
}

// 清空全部选中
const handleClearAll = () => {
  selectionClear()
}
</script>

<style scoped>
.selected-list {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.selected-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
```

**移除方法说明：**
- `selectionRemove(key, item)` - 从选中列表中移除指定项
- 第一个参数是 ID 值，第二个参数是对应的行数据对象（可选）
- 移除后需要调用 `selectionSync` 更新表格显示

### 批量操作

选中数据后进行批量编辑操作：

```vue
<template>
  <div class="batch-edit-demo">
    <!-- 批量操作栏 -->
    <el-card class="batch-actions" v-if="selectionItems.length > 0">
      <template #header>
        <span>批量操作 (已选 {{ selectionItems.length }} 项)</span>
      </template>

      <el-form :model="batchForm" inline>
        <el-form-item label="状态">
          <el-select v-model="batchForm.status" placeholder="选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="batchForm.category" placeholder="选择分类">
            <el-option label="类别 A" value="A" />
            <el-option label="类别 B" value="B" />
            <el-option label="类别 C" value="C" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleBatchUpdate">
            应用更改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSelection } from '@/composables/useSelection'

interface Product {
  id: number
  name: string
  status: 'active' | 'inactive'
  category: string
}

const tableRef = ref()
const tableData = ref<Product[]>([
  { id: 1, name: '商品 A', status: 'active', category: 'A' },
  { id: 2, name: '商品 B', status: 'inactive', category: 'B' },
  { id: 3, name: '商品 C', status: 'active', category: 'A' },
  { id: 4, name: '商品 D', status: 'inactive', category: 'C' }
])
const isMultiple = ref(true)

const batchForm = reactive({
  status: '',
  category: ''
})

const {
  selectionItems,
  selectionChange,
  selectionClear
} = useSelection<Product>('id', tableRef, tableData, isMultiple)

// 批量更新
const handleBatchUpdate = async () => {
  if (!batchForm.status && !batchForm.category) {
    ElMessage.warning('请至少选择一项要修改的内容')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要修改选中的 ${selectionItems.value.length} 条数据吗？`,
      '确认操作'
    )

    // 获取选中的 ID 列表
    const selectedIds = selectionItems.value.map(item => item.id)

    // 更新数据
    tableData.value.forEach(item => {
      if (selectedIds.includes(item.id)) {
        if (batchForm.status) {
          item.status = batchForm.status as 'active' | 'inactive'
        }
        if (batchForm.category) {
          item.category = batchForm.category
        }
      }
    })

    ElMessage.success('批量更新成功')

    // 清空选择和表单
    selectionClear()
    batchForm.status = ''
    batchForm.category = ''
  } catch {
    // 用户取消操作
  }
}
</script>
```

## 高级用法

### 用户选择器组件

封装一个可复用的用户选择器组件：

```vue
<!-- UserSelector.vue -->
<template>
  <el-dialog v-model="visible" title="选择用户" width="800px">
    <!-- 搜索栏 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="关键字">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索用户名/邮箱"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="searchForm.department" placeholder="全部" clearable>
          <el-option label="研发部" value="dev" />
          <el-option label="市场部" value="market" />
          <el-option label="人事部" value="hr" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="userList"
      @selection-change="selectionChange"
      max-height="400"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userId" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="department" label="部门" />
    </el-table>

    <!-- 已选区域 -->
    <div class="selected-area" v-if="selectionItems.length > 0">
      <span class="selected-label">已选 {{ selectionItems.length }} 人：</span>
      <el-tag
        v-for="user in selectionItems"
        :key="user.userId"
        closable
        class="user-tag"
        @close="() => selectionRemove(user.userId)"
      >
        {{ user.name }}
      </el-tag>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        确定 ({{ selectionItems.length }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface User {
  userId: number
  name: string
  email: string
  department: string
}

const emit = defineEmits<{
  confirm: [users: User[]]
}>()

const visible = ref(false)
const tableRef = ref()
const userList = ref<User[]>([])
const searchForm = reactive({
  keyword: '',
  department: ''
})
const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange,
  selectionRemove,
  selectionInit,
  selectionSync,
  selectionClear
} = useSelection<User>('userId', tableRef, userList, isMultiple)

// 加载用户列表
const loadUserList = async () => {
  // 模拟 API 请求
  userList.value = [
    { userId: 1, name: '张三', email: 'zhang@example.com', department: '研发部' },
    { userId: 2, name: '李四', email: 'li@example.com', department: '市场部' },
    { userId: 3, name: '王五', email: 'wang@example.com', department: '人事部' },
    { userId: 4, name: '赵六', email: 'zhao@example.com', department: '研发部' },
    { userId: 5, name: '孙七', email: 'sun@example.com', department: '市场部' }
  ]
}

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑...
}

// 打开对话框
const openDialog = async (preselectedUsers: User[] = []) => {
  visible.value = true

  await loadUserList()

  // 初始化预选数据
  if (preselectedUsers.length > 0) {
    await selectionInit(preselectedUsers)
    await nextTick()
    selectionSync()
  }
}

// 确认选择
const handleConfirm = () => {
  emit('confirm', [...selectionItems.value])
  visible.value = false
  selectionClear()
}

// 暴露方法
defineExpose({ openDialog })
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}

.selected-area {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9eb;
  border-radius: 4px;
}

.selected-label {
  margin-right: 12px;
  font-weight: 500;
}

.user-tag {
  margin-right: 8px;
}
</style>
```

**使用选择器组件：**

```vue
<template>
  <div>
    <el-button @click="openUserSelector">选择用户</el-button>

    <div v-if="selectedUsers.length > 0">
      已选择：{{ selectedUsers.map(u => u.name).join(', ') }}
    </div>

    <UserSelector ref="userSelectorRef" @confirm="handleUserConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserSelector from './UserSelector.vue'

interface User {
  userId: number
  name: string
  email: string
  department: string
}

const userSelectorRef = ref()
const selectedUsers = ref<User[]>([])

const openUserSelector = () => {
  // 打开时传入已选用户作为预选
  userSelectorRef.value?.openDialog(selectedUsers.value)
}

const handleUserConfirm = (users: User[]) => {
  selectedUsers.value = users
}
</script>
```

### 结合搜索筛选

在带有搜索筛选功能的表格中使用选择功能：

```vue
<template>
  <div class="filter-selection-demo">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="关键字">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索名称"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部状态"
          clearable
          @change="handleSearch"
        >
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 选中信息提示 -->
    <el-alert
      v-if="selectionItems.length > 0"
      type="info"
      :closable="false"
      class="selection-info"
    >
      <template #default>
        已选择 {{ selectionItems.length }} 项
        <el-button link type="primary" @click="handleClearSelection">
          清空选择
        </el-button>
      </template>
    </el-alert>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="filteredData"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Item {
  id: number
  name: string
  status: 'active' | 'inactive'
}

const tableRef = ref()
const allData = ref<Item[]>([
  { id: 1, name: '苹果', status: 'active' },
  { id: 2, name: '香蕉', status: 'inactive' },
  { id: 3, name: '橙子', status: 'active' },
  { id: 4, name: '葡萄', status: 'active' },
  { id: 5, name: '西瓜', status: 'inactive' }
])

const searchForm = reactive({
  keyword: '',
  status: ''
})

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(item => {
    const keywordMatch = !searchForm.keyword ||
      item.name.includes(searchForm.keyword)
    const statusMatch = !searchForm.status ||
      item.status === searchForm.status
    return keywordMatch && statusMatch
  })
})

const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionClear
} = useSelection<Item>('id', tableRef, filteredData, isMultiple)

// 监听筛选结果变化，同步选中状态
watch(
  filteredData,
  async () => {
    await nextTick()
    if (selectionItems.value.length > 0) {
      selectionSync()
    }
  }
)

const handleSearch = () => {
  // 搜索时筛选数据会自动更新（通过 computed）
  // watch 会自动触发选中状态同步
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
}

const handleClearSelection = () => {
  selectionClear()
}
</script>
```

### 选择变化回调统计

监听选择变化并计算统计信息：

```vue
<template>
  <div class="selection-statistics-demo">
    <el-table
      ref="tableRef"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格">
        <template #default="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="库存" />
    </el-table>

    <!-- 统计信息 -->
    <div class="statistics" v-if="selectionItems.length > 0">
      <el-descriptions :column="4" border>
        <el-descriptions-item label="选中数量">
          {{ selectionItems.length }} 件
        </el-descriptions-item>
        <el-descriptions-item label="总价值">
          ¥{{ totalPrice.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="平均价格">
          ¥{{ averagePrice.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="总库存">
          {{ totalQuantity }} 件
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface Product {
  id: number
  name: string
  price: number
  quantity: number
}

const tableRef = ref()
const tableData = ref<Product[]>([
  { id: 1, name: '商品 A', price: 99.00, quantity: 50 },
  { id: 2, name: '商品 B', price: 199.00, quantity: 30 },
  { id: 3, name: '商品 C', price: 299.00, quantity: 20 },
  { id: 4, name: '商品 D', price: 399.00, quantity: 10 }
])
const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange
} = useSelection<Product>('id', tableRef, tableData, isMultiple)

// 计算选中商品总价
const totalPrice = computed(() => {
  return selectionItems.value.reduce((sum, item) => sum + item.price, 0)
})

// 计算平均价格
const averagePrice = computed(() => {
  if (selectionItems.value.length === 0) return 0
  return totalPrice.value / selectionItems.value.length
})

// 计算总库存
const totalQuantity = computed(() => {
  return selectionItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 自定义选择变化处理
const handleSelectionChange = (selection: Product[]) => {
  // 调用内置的处理方法
  selectionChange(selection)

  // 执行自定义逻辑
  console.log('选中项变化:', selection.length)

  // 可以在这里触发其他操作
  // 例如：发送统计数据到后端、更新其他组件状态等
}
</script>

<style scoped>
.statistics {
  margin-top: 20px;
}
</style>
```

### 树形表格选择

支持树形结构表格的选择功能：

```vue
<template>
  <div class="tree-selection-demo">
    <el-button @click="handleBatchOperation" :disabled="selectionItems.length === 0">
      批量操作 ({{ selectionItems.length }})
    </el-button>

    <el-table
      ref="tableRef"
      :data="treeData"
      row-key="id"
      default-expand-all
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="level" label="层级" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface TreeNode {
  id: number
  name: string
  level: number
  children?: TreeNode[]
}

const tableRef = ref()
const treeData = ref<TreeNode[]>([
  {
    id: 1,
    name: '一级节点 1',
    level: 1,
    children: [
      { id: 11, name: '二级节点 1-1', level: 2 },
      { id: 12, name: '二级节点 1-2', level: 2 },
      {
        id: 13,
        name: '二级节点 1-3',
        level: 2,
        children: [
          { id: 131, name: '三级节点 1-3-1', level: 3 },
          { id: 132, name: '三级节点 1-3-2', level: 3 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '一级节点 2',
    level: 1,
    children: [
      { id: 21, name: '二级节点 2-1', level: 2 },
      { id: 22, name: '二级节点 2-2', level: 2 }
    ]
  }
])

// 将树形数据展平用于 useSelection
const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
  const result: TreeNode[] = []
  const traverse = (items: TreeNode[]) => {
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  traverse(nodes)
  return result
}

const flatData = computed(() => flattenTree(treeData.value))
const isMultiple = ref(true)

const {
  selectionItems,
  selectionChange
} = useSelection<TreeNode>('id', tableRef, flatData, isMultiple)

const handleBatchOperation = () => {
  console.log('选中的节点 ID:', selectionItems.value.map(i => i.id))
  console.log('选中的节点数据:', selectionItems.value)
}
</script>
```

## API 参考

### useSelection 参数

```typescript
useSelection<T>(
  keyField: keyof T,           // 数据对象的唯一标识字段名
  tableRef: Ref<any>,          // Element Plus 表格实例的引用
  dataListRef: Ref<T[]>,       // 当前页面数据列表的引用
  multiple?: Ref<boolean>      // 是否为多选模式（可选，默认 true）
)
```

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| keyField | 行数据的唯一标识字段名 | `keyof T` | - |
| tableRef | el-table 组件的引用 | `Ref<any>` | - |
| dataListRef | 当前表格数据的响应式引用 | `Ref<T[]>` | - |
| multiple | 是否多选模式 | `Ref<boolean>` | `ref(true)` |

### 返回值

| 属性/方法 | 说明 | 类型 |
|----------|------|------|
| selectionItems | 选中行的完整数据数组（响应式） | `Ref<T[]>` |
| selectionIsRestoring | 是否正在恢复选中状态 | `Ref<boolean>` |
| selectionChange | 处理表格选择变化事件 | `(selection: T[] \| T) => void` |
| selectionSync | 同步表格选中状态显示 | `() => Promise<void>` |
| selectionInit | 初始化选中状态 | `(data: any[] \| (() => Promise<T[]>)) => Promise<void>` |
| selectionRemove | 移除指定选中项 | `(key: any, item?: T) => Promise<void>` |
| selectionClear | 清空所有选中项 | `() => void` |

### 方法详解

#### selectionChange

处理表格选择变化事件，根据模式（单选/多选）更新内部选中状态。

```typescript
// 多选模式 - 绑定到 @selection-change
<el-table @selection-change="selectionChange">

// 单选模式 - 在 radio 的 @change 中调用
<el-radio @change="() => selectionChange(row)">
```

#### selectionSync

同步表格的勾选状态显示，通常在以下场景调用：
- 分页切换后
- 筛选条件变化后
- 初始化预选数据后

```typescript
const { selectionSync } = useSelection(...)

// 数据加载后同步
const loadData = async () => {
  const data = await fetchData()
  tableData.value = data
  await nextTick()
  await selectionSync()
}
```

#### selectionInit

初始化选中状态，支持三种方式：

```typescript
const { selectionInit } = useSelection(...)

// 方式 1：ID 数组
await selectionInit([1, 2, 3])

// 方式 2：对象数组
await selectionInit([{ id: 1, name: '...' }, { id: 2, name: '...' }])

// 方式 3：异步函数
await selectionInit(async () => {
  const data = await fetchPreselectedData()
  return data
})
```

#### selectionRemove

从选中列表中移除指定项。

```typescript
const { selectionRemove, selectionSync } = useSelection(...)

// 移除选中项
await selectionRemove(userId, userRow)

// 同步表格显示
await nextTick()
await selectionSync()
```

#### selectionClear

清空所有选中项，会自动调用表格的 `clearSelection` 方法。

```typescript
const { selectionClear } = useSelection(...)

const handleClear = () => {
  selectionClear()
}
```

### 类型定义

```typescript
/**
 * useSelection 返回值类型
 */
interface UseSelectionReturn<T> {
  /** 选中的完整对象数组 */
  selectionItems: Ref<T[]>

  /** 是否正在恢复选中状态 */
  selectionIsRestoring: Ref<boolean>

  /** 处理选择变化 */
  selectionChange: (selection: T[] | T) => void

  /** 同步表格选中状态 */
  selectionSync: () => Promise<void>

  /** 移除选中项 */
  selectionRemove: (key: any, item?: T) => Promise<void>

  /** 清空所有选中项 */
  selectionClear: () => void

  /** 初始化选中项 */
  selectionInit: (data: any[] | (() => Promise<T[]>)) => Promise<void>
}

/**
 * 使用示例
 */
interface User {
  userId: number
  name: string
  email: string
}

const tableRef = ref<InstanceType<typeof ElTable>>()
const tableData = ref<User[]>([])
const isMultiple = ref(true)

const {
  selectionItems,      // Ref<User[]>
  selectionChange,     // (selection: User[] | User) => void
  selectionSync,       // () => Promise<void>
  selectionRemove,     // (key: number, item?: User) => Promise<void>
  selectionClear,      // () => void
  selectionInit        // (data: number[] | User[] | (() => Promise<User[]>)) => Promise<void>
} = useSelection<User>('userId', tableRef, tableData, isMultiple)
```

## 最佳实践

### 1. 正确处理分页同步

分页切换时必须在数据加载后同步选中状态：

```typescript
// ✅ 正确做法
const loadPageData = async () => {
  const data = await fetchData(pageParams)
  tableData.value = data.list

  // 必须等待 DOM 更新
  await nextTick()

  // 同步选中状态
  await selectionSync()
}

// ❌ 错误做法：忘记同步
const loadPageData = async () => {
  const data = await fetchData(pageParams)
  tableData.value = data.list
  // 缺少 selectionSync 调用，导致选中状态丢失
}
```

### 2. 配合确认对话框使用

批量操作前应该让用户确认：

```typescript
// ✅ 推荐做法
const handleBatchDelete = async () => {
  if (selectionItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectionItems.value.length} 条数据吗？此操作不可撤销！`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    const ids = selectionItems.value.map(item => item.id)
    await deleteApi(ids)

    ElMessage.success('删除成功')
    selectionClear()
    await loadData()
  } catch {
    // 用户取消
  }
}
```

### 3. 使用 TypeScript 泛型

始终为 `useSelection` 提供泛型参数以获得类型安全：

```typescript
// ✅ 推荐：提供泛型参数
interface User {
  userId: number
  name: string
  email: string
}

const { selectionItems } = useSelection<User>('userId', tableRef, tableData, isMultiple)
// selectionItems 的类型为 Ref<User[]>

// ❌ 不推荐：不提供泛型
const { selectionItems } = useSelection('userId', tableRef, tableData, isMultiple)
// selectionItems 的类型为 Ref<unknown[]>
```

### 4. 单选多选模式切换

切换模式时清空之前的选择：

```typescript
// ✅ 正确做法
const isMultiple = ref(true)

watch(isMultiple, () => {
  selectionClear()
})

// ❌ 错误做法：不清空选择
const isMultiple = ref(true)
// 切换模式但不清空，可能导致状态不一致
```

### 5. 条件禁用选择框

根据行数据条件禁用某些行的选择：

```vue
<template>
  <el-table
    :data="tableData"
    @selection-change="selectionChange"
  >
    <el-table-column
      type="selection"
      width="55"
      :selectable="checkSelectable"
    />
    <!-- 其他列 -->
  </el-table>
</template>

<script setup lang="ts">
// 根据行状态决定是否可选
const checkSelectable = (row: Item) => {
  // 已完成或已删除的项不可选
  return row.status !== 'completed' && row.status !== 'deleted'
}
</script>
```

### 6. 避免选择恢复时的闪烁

使用 `selectionIsRestoring` 避免恢复选中状态时的视觉闪烁：

```vue
<template>
  <el-table
    v-loading="loading || selectionIsRestoring"
    :data="tableData"
    @selection-change="selectionChange"
  >
    <!-- 表格列 -->
  </el-table>
</template>

<script setup lang="ts">
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionIsRestoring
} = useSelection<User>('userId', tableRef, tableData, isMultiple)
</script>
```

## 常见问题

### 1. 分页后选中状态丢失

**问题描述：** 切换分页后，之前选中的数据勾选状态消失。

**解决方案：**

```typescript
const loadData = async () => {
  const res = await fetchData({ page, size })
  tableData.value = res.data.list

  // 关键：加载数据后同步选中状态
  await nextTick()
  await selectionSync()
}
```

### 2. 表格引用未定义

**问题描述：** 调用 `selectionSync` 时报错表格引用未定义。

**解决方案：**

```typescript
// 确保表格引用正确定义
const tableRef = ref<InstanceType<typeof ElTable>>()

// 确保在模板中正确绑定
// <el-table ref="tableRef" ...>
```

### 3. 单选模式下仍可多选

**问题描述：** 设置单选模式后表格仍然显示复选框。

**原因分析：** 单选模式需要使用 `el-radio` 组件，而不是 `type="selection"` 列。

**解决方案：**

```vue
<template>
  <el-table ref="tableRef" :data="tableData">
    <!-- 单选模式使用 radio -->
    <el-table-column width="55">
      <template #default="{ row }">
        <el-radio
          :model-value="selectionItems[0]?.userId || ''"
          :value="row.userId"
          @change="() => selectionChange(row)"
        >
          &nbsp;
        </el-radio>
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 4. 初始化预选数据不生效

**问题描述：** 调用 `selectionInit` 后表格没有显示勾选状态。

**解决方案：**

```typescript
onMounted(async () => {
  // 1. 先加载表格数据
  await loadTableData()

  // 2. 初始化预选
  await selectionInit([1, 2, 3])

  // 3. 必须等待 DOM 更新后同步
  await nextTick()
  await selectionSync()
})
```

### 5. 移除选中项后表格仍显示勾选

**问题描述：** 调用 `selectionRemove` 后，内部状态更新了，但表格勾选框仍然勾选。

**解决方案：**

```typescript
const handleRemove = async (item: Item) => {
  // 移除选中项
  await selectionRemove(item.id, item)

  // 必须同步表格显示
  await nextTick()
  await selectionSync()
}
```

### 6. keyField 字段不存在导致报错

**问题描述：** 使用的 keyField 在数据对象中不存在。

**解决方案：**

```typescript
interface User {
  userId: number  // 注意字段名
  name: string
}

// ✅ 使用正确的字段名
const { selectionItems } = useSelection<User>('userId', ...)

// ❌ 字段名不匹配
const { selectionItems } = useSelection<User>('id', ...)  // 数据中没有 id 字段
```

## 完整示例

### 综合管理页面

```vue
<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="actions">
            <el-button type="primary" @click="handleAdd">新增用户</el-button>
            <el-button
              type="danger"
              :disabled="selectionItems.length === 0"
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectionItems.length }})
            </el-button>
          </div>
        </div>
      </template>

      <!-- 选中信息 -->
      <el-alert
        v-if="selectionItems.length > 0"
        :title="`已选择 ${selectionItems.length} 条数据`"
        type="info"
        :closable="false"
        show-icon
        class="selection-alert"
      >
        <el-button link type="primary" @click="handleClearSelection">
          清空选择
        </el-button>
      </el-alert>

      <!-- 数据表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading || selectionIsRestoring"
        :data="tableData"
        @selection-change="selectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pageParams.page"
        v-model:page-size="pageParams.size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSelection } from '@/composables/useSelection'
import type { ElTable } from 'element-plus'

// 类型定义
interface User {
  userId: number
  username: string
  email: string
  status: 'active' | 'inactive'
  createTime: string
}

// 表格引用
const tableRef = ref<InstanceType<typeof ElTable>>()

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<User[]>([])

// 分页参数
const pageParams = reactive({
  page: 1,
  size: 10
})
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  username: '',
  status: ''
})

// 选择管理
const isMultiple = ref(true)
const {
  selectionItems,
  selectionIsRestoring,
  selectionChange,
  selectionSync,
  selectionClear
} = useSelection<User>('userId', tableRef, tableData, isMultiple)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟 API 请求
    const res = await fetchUsers({
      ...pageParams,
      ...searchForm
    })
    tableData.value = res.data.list
    total.value = res.data.total

    // 同步选中状态
    await nextTick()
    await selectionSync()
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 模拟 API
const fetchUsers = async (params: any) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const list = Array.from({ length: params.size }, (_, i) => ({
    userId: (params.page - 1) * params.size + i + 1,
    username: `user_${(params.page - 1) * params.size + i + 1}`,
    email: `user${(params.page - 1) * params.size + i + 1}@example.com`,
    status: Math.random() > 0.5 ? 'active' : 'inactive' as 'active' | 'inactive',
    createTime: new Date().toLocaleString()
  }))
  return { data: { list, total: 100 } }
}

// 搜索
const handleSearch = () => {
  pageParams.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  pageParams.page = 1
  loadData()
}

// 分页变化
const handlePageChange = () => {
  loadData()
}

// 清空选择
const handleClearSelection = () => {
  selectionClear()
}

// 新增
const handleAdd = () => {
  console.log('打开新增对话框')
}

// 编辑
const handleEdit = (row: User) => {
  console.log('编辑用户:', row)
}

// 删除单条
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '删除确认', { type: 'warning' })
    // 执行删除...
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 取消
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectionItems.value.length} 个用户吗？`,
      '批量删除确认',
      { type: 'warning' }
    )
    // 执行批量删除...
    const ids = selectionItems.value.map(item => item.userId)
    console.log('删除用户 ID:', ids)

    ElMessage.success('批量删除成功')
    selectionClear()
    loadData()
  } catch {
    // 取消
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-alert {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
```

这个综合示例展示了 `useSelection` 在实际业务场景中的完整用法，包括：
- 搜索筛选与选择状态保持
- 分页与跨页选择
- 批量操作（删除）
- 选择状态同步
- 加载状态处理
- 类型安全的 TypeScript 用法
