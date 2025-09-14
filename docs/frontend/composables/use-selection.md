# useSelection

表格选择管理组合函数，专为 Element Plus el-table 设计的选择解决方案，统一处理单选和多选模式。

## 📋 功能特性

- **统一接口**: 单选和多选使用相同的API，组件无需关心内部实现
- **跨页选择**: 多选模式下自动保持选中状态，切换页面不丢失选择
- **智能同步**: 自动同步内部状态与表格UI，确保显示一致性
- **灵活移除**: 支持标签移除、批量移除等多种移除方式
- **类型安全**: 完整的 TypeScript 支持，泛型确保类型安全
- **模式切换**: 支持运行时动态切换单选/多选模式

## 🎯 基础用法

### 多选模式

```vue
<template>
  <div>
    <!-- 表格 -->
    <el-table 
      ref="tableRef" 
      :data="userList" 
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
    
    <!-- 选中项标签 -->
    <div v-if="selectionItems.length > 0">
      <h4>已选中 {{ selectionItems.length }} 项：</h4>
      <el-tag 
        v-for="item in selectionItems" 
        :key="item.userId"
        closable
        @close="selectionRemove(item.userId)"
      >
        {{ item.name }}
      </el-tag>
    </div>
    
    <!-- 操作按钮 -->
    <div>
      <el-button @click="selectionClear">清空选择</el-button>
      <el-button 
        @click="handleBatchDelete" 
        :disabled="selectionItems.length === 0"
        type="danger"
      >
        批量删除
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const userList = ref([
  { userId: 1, name: '张三', email: 'zhang@example.com' },
  { userId: 2, name: '李四', email: 'li@example.com' }
])

const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionRemove,
  selectionClear
} = useSelection('userId', tableRef, userList, ref(true)) // true = 多选模式

// 处理批量删除
const handleBatchDelete = () => {
  const selectedIds = selectionItems.value.map(item => item.userId)
  console.log('要删除的ID:', selectedIds)
}

// 页面切换后恢复选中状态
watch(userList, () => {
  nextTick(() => {
    selectionSync() // 同步表格选中状态
  })
})
</script>
```

### 单选模式

```vue
<template>
  <div>
    <!-- 表格 -->
    <el-table ref="tableRef" :data="userList">
      <el-table-column width="55">
        <template #default="{ row }">
          <el-radio 
            :model-value="selectionItems[0]?.userId || ''" 
            :label="row.userId"
            @change="selectionChange(row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
    
    <!-- 当前选中项 -->
    <div v-if="selectionItems.length > 0">
      <h4>当前选中：{{ selectionItems[0].name }}</h4>
      <el-button @click="selectionClear">清空选择</el-button>
    </div>
  </div>
</template>

<script setup>
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const userList = ref([...]) // 用户数据

const {
  selectionItems,
  selectionChange,
  selectionClear
} = useSelection('userId', tableRef, userList, ref(false)) // false = 单选模式
</script>
```

## 🔧 API 参考

### 参数

```typescript
useSelection<T>(
  keyField: keyof T,           // 数据对象的唯一标识字段名
  tableRef: Ref<any>,          // Element Plus 表格实例的引用
  dataListRef: Ref<T[]>,       // 当前页面数据列表的引用
  multiple: Ref<boolean>       // 是否为多选模式 (可选，默认 true)
)
```

### 返回值

```typescript
interface SelectionReturn<T> {
  // 状态
  selectionItems: Ref<T[]>         // 选中的完整对象数组
  selectionIsRestoring: Ref<boolean> // 是否正在恢复选中状态
  
  // 方法
  selectionChange: (selection: T[] | T) => void      // 处理选择变化
  selectionSync: () => Promise<void>                 // 同步表格选中状态
  selectionRemove: (key: any, item?: T) => Promise<void> // 移除选中项
  selectionClear: () => void                         // 清空所有选中项
  selectionInit: (data: any[] | (() => Promise<T[]>)) => Promise<void> // 初始化选中项
}
```

## 🌟 高级用法

### 初始化预选数据

```vue
<script setup>
const { selectionInit } = useSelection(...)

// 方式1：使用ID数组初始化
onMounted(async () => {
  await selectionInit([1, 2, 3]) // 预选ID为1,2,3的项
})

// 方式2：使用对象数组初始化
onMounted(async () => {
  const preselectedData = [
    { userId: 1, name: '张三' },
    { userId: 2, name: '李四' }
  ]
  await selectionInit(preselectedData)
})

// 方式3：使用异步函数初始化
onMounted(async () => {
  await selectionInit(async () => {
    const [err, data] = await getUsersByIds([1, 2, 3])
    return err ? [] : data
  })
})
</script>
```

### 分页场景处理

```vue
<script setup>
const currentPage = ref(1)
const userList = ref([])

// 切换页面时同步选中状态
const handlePageChange = async (page) => {
  currentPage.value = page
  await loadUserList() // 加载新页面数据
  await nextTick()
  await selectionSync() // 恢复选中状态
}

// 监听数据变化自动同步
watch(userList, async () => {
  await nextTick()
  await selectionSync()
})
</script>
```

### 动态切换选择模式

```vue
<template>
  <div>
    <el-switch 
      v-model="isMultiple" 
      active-text="多选"
      inactive-text="单选"
    />
    
    <el-table ref="tableRef" :data="userList">
      <!-- 多选 -->
      <el-table-column 
        v-if="isMultiple" 
        type="selection" 
        width="55" 
      />
      <!-- 单选 -->
      <el-table-column v-else width="55">
        <template #default="{ row }">
          <el-radio 
            :model-value="selectionItems[0]?.userId || ''" 
            :label="row.userId"
            @change="selectionChange(row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
const isMultiple = ref(true)

const { selectionItems, selectionChange, selectionClear } = 
  useSelection('userId', tableRef, userList, isMultiple)

// 切换模式时清空选择
watch(isMultiple, () => {
  selectionClear()
})
</script>
```

## 📝 使用场景

### 用户选择器

```vue
<!-- UserSelector.vue -->
<template>
  <el-dialog v-model="visible" title="选择用户">
    <el-table ref="tableRef" :data="userList" @selection-change="selectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="department" label="部门" />
    </el-table>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        确定 ({{ selectionItems.length }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const emit = defineEmits(['confirm'])

const { selectionItems, selectionChange, selectionInit } = 
  useSelection('userId', tableRef, userList)

// 打开时初始化预选数据
const openDialog = (preselectedUsers = []) => {
  visible.value = true
  nextTick(() => {
    selectionInit(preselectedUsers)
  })
}

const handleConfirm = () => {
  emit('confirm', selectionItems.value)
  visible.value = false
}

defineExpose({ openDialog })
</script>
```

### 批量操作

```vue
<template>
  <div>
    <!-- 批量操作工具栏 -->
    <div class="batch-toolbar" v-show="selectionItems.length > 0">
      <span>已选择 {{ selectionItems.length }} 项</span>
      <el-button @click="batchDelete" type="danger">批量删除</el-button>
      <el-button @click="batchExport">批量导出</el-button>
      <el-button @click="selectionClear">取消选择</el-button>
    </div>
    
    <!-- 表格 -->
    <el-table ref="tableRef" :data="dataList" @selection-change="selectionChange">
      <el-table-column type="selection" width="55" />
      <!-- 其他列 -->
    </el-table>
  </div>
</template>

<script setup>
const { selectionItems, selectionChange, selectionClear } = 
  useSelection('id', tableRef, dataList)

const batchDelete = async () => {
  const ids = selectionItems.value.map(item => item.id)
  await ElMessageBox.confirm(`确定删除选中的 ${ids.length} 项吗？`)
  // 执行删除操作...
  selectionClear()
}
</script>
```

## ⚠️ 注意事项

1. **keyField 必须唯一**: 确保用作唯一标识的字段在数据中是唯一的
2. **表格引用**: tableRef 必须正确引用到 el-table 实例
3. **事件绑定**: 多选模式需要绑定 `@selection-change`，单选模式需要在 radio 上绑定 `@change`
4. **状态同步**: 数据更新后调用 `selectionSync()` 恢复选中状态
5. **内存清理**: 组件销毁时会自动清理，无需手动处理
