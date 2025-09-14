# useTableHeight

表格高度自适应组合函数，基于 Vue Composition API 实现表格高度的自适应计算和响应式管理。

## 📋 功能特性

- **高度计算**: 动态计算表格的最佳高度，确保内容完整显示
- **响应式调整**: 响应窗口大小、侧边栏状态、页签配置和表单显示状态变化
- **防抖处理**: 避免短时间内重复计算表格高度
- **生命周期管理**: 自动添加和移除事件监听器
- **搜索表单管理**: 提供表单引用和显示状态控制
- **高度调整**: 支持自定义高度调整值

## 🎯 基础用法

### 基本使用

```vue
<template>
  <div class="table-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" v-show="showSearch">
      <el-form-item>
        <el-input placeholder="搜索关键词" />
      </el-form-item>
    </el-form>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button @click="showSearch = !showSearch">
        {{ showSearch ? '隐藏' : '显示' }}搜索
      </el-button>
    </div>
    
    <!-- 表格 -->
    <el-table 
      :data="tableData" 
      :height="tableHeight"
      style="width: 100%"
    >
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" />
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      :total="total"
    />
  </div>
</template>

<script setup>
import { useTableHeight } from '@/composables/useTableHeight'

const { tableHeight, queryFormRef, showSearch } = useTableHeight()

const tableData = ref([
  { name: '张三', age: 25 },
  { name: '李四', age: 30 }
])

const currentPage = ref(1)
const total = ref(100)
</script>
```

### 带高度调整参数

```vue
<template>
  <div class="custom-table">
    <!-- 自定义头部区域，需要额外减去80px高度 -->
    <div class="custom-header" style="height: 80px;">
      自定义头部内容
    </div>
    
    <el-form ref="queryFormRef" v-show="showSearch">
      <!-- 表单内容 -->
    </el-form>
    
    <el-table :height="tableHeight" :data="tableData">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>

<script setup>
// 传入80，表示需要额外减去80px高度
const { tableHeight, queryFormRef, showSearch } = useTableHeight(80)
</script>
```

## 🔧 API 参考

### 函数签名

```typescript
useTableHeight(heightAdjustment?: number): {
  tableHeight: Ref<number>
  queryFormRef: Ref<any>
  calculateTableHeight: () => Promise<void>
  showSearch: Ref<boolean>
}
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| heightAdjustment | `number` | `0` | 高度调整值，正数减少高度，负数增加高度 |

### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| tableHeight | `Ref<number>` | 计算后的表格高度 |
| queryFormRef | `Ref<any>` | 查询表单的引用，用于获取表单高度 |
| calculateTableHeight | `Function` | 手动触发高度计算的方法 |
| showSearch | `Ref<boolean>` | 搜索表单的显示状态 |

## 💡 高级用法

### 手动重新计算高度

```vue
<script setup>
const { tableHeight, calculateTableHeight } = useTableHeight()

// 在某些动态内容变化后手动重新计算
const onContentChanged = async () => {
  await nextTick()
  await calculateTableHeight()
}
</script>
```

### 监听高度变化

```vue
<script setup>
const { tableHeight } = useTableHeight()

// 监听表格高度变化
watch(tableHeight, (newHeight) => {
  console.log('表格高度变化:', newHeight)
})
</script>
```

### 结合其他组件

```vue
<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>用户列表</span>
        <el-button @click="showSearch = !showSearch">
          切换搜索
        </el-button>
      </div>
    </template>
    
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" v-show="showSearch" inline>
      <el-form-item label="用户名">
        <el-input v-model="queryForm.username" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary">查询</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 表格 -->
    <el-table 
      :data="tableData" 
      :height="tableHeight"
      border
      stripe
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-card>
</template>

<script setup>
import { useTableHeight } from '@/composables/useTableHeight'

// 使用表格高度自适应，card 头部需要额外减去一些高度
const { tableHeight, queryFormRef, showSearch } = useTableHeight(20)

const queryForm = ref({
  username: ''
})

const tableData = ref([])
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

const handleEdit = (row) => {
  console.log('编辑', row)
}

const handleDelete = (row) => {
  console.log('删除', row)
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  // 重新加载数据
}

const handleCurrentChange = (current) => {
  pagination.value.current = current
  // 重新加载数据
}
</script>
```

## ⚠️ 注意事项

### 1. 查询表单引用
确保将 `queryFormRef` 正确绑定到查询表单组件：

```vue
<el-form ref="queryFormRef" v-show="showSearch">
  <!-- 表单内容 -->
</el-form>
```

### 2. 高度调整参数
`heightAdjustment` 参数的含义：
- **正数**: 减少表格高度（当页面有额外元素占用空间时）
- **负数**: 增加表格高度（当页面元素比预期少时）
- **0**: 使用默认计算逻辑

### 3. 响应式变化
组合函数会自动监听以下变化：
- 窗口大小变化
- 侧边栏展开/收起
- 页签显示/隐藏配置
- 搜索表单显示/隐藏

### 4. 防抖处理
高度计算使用了防抖处理，避免频繁触发：
- 窗口调整: 150ms 延迟
- 侧边栏变化: 240ms 延迟（等待动画完成）
- 其他变化: 100ms 延迟

## 🎨 样式建议

```css
.table-container {
  padding: 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-pagination {
  margin-top: 16px;
  text-align: right;
}
```

通过使用 `useTableHeight`，可以让表格在不同屏幕尺寸和布局变化下都能保持最佳的显示效果。
