# 搜索表单 (ASearchForm)

## 介绍

ASearchForm 是 RuoYi-Plus-UniApp 前端管理端提供的通用搜索表单容器组件,专为列表页面的搜索功能设计。该组件不仅提供了标准化的表单展示容器,还内置了智能的展开/收起功能、优雅的动画效果,以及自动行数计算等高级特性,极大地提升了用户体验和开发效率。

**核心特性:**

- **智能展开收起** - 当表单项超过 2 行时自动显示展开/收起按钮,减少页面占用空间
- **自动行数计算** - 实时监测表单项布局,自动计算行数并决定是否显示展开按钮
- **优雅动画效果** - 使用 Tailwind CSS 动画类实现流畅的显示/隐藏过渡
- **渐变遮罩效果** - 收起状态下底部显示渐变遮罩,提示用户有更多内容
- **响应式适配** - 支持窗口大小变化时自动重新计算布局
- **双向绑定** - 支持 v-model 绑定表单数据
- **灵活配置** - 支持自定义标题、标签位置、标签宽度等
- **插槽支持** - 支持自定义头部插槽
- **MutationObserver 监听** - 自动监测表单项的动态变化

## 技术实现原理

### 自动行数计算

ASearchForm 使用 `offsetTop` 属性来计算表单项所在的行数:

```typescript
const calculateFormRows = () => {
  const formElement = formContainerRef.value?.querySelector('.el-form')
  if (!formElement) return

  const formItems = formElement.querySelectorAll('.el-form-item')
  if (formItems.length === 0) {
    formRows.value = 0
    return
  }

  // 使用 Set 统计不同 top 值的数量（即行数）
  const topValues = new Set<number>()

  formItems.forEach((item) => {
    const itemTop = Math.round((item as HTMLElement).offsetTop)
    topValues.add(itemTop)
  })

  const currentRow = topValues.size
  formRows.value = currentRow
}
```

**工作原理**:
1. 获取所有表单项的 `offsetTop` 值
2. 使用 `Math.round()` 处理可能的小数偏差
3. 使用 `Set` 去重,统计不同的 top 值
4. Set 的 size 即为行数

### 展开收起逻辑

组件根据行数自动决定是否显示展开/收起按钮:

```typescript
const showCollapseButton = computed(() => {
  return props.collapsible && formRows.value >= 2
})
```

**触发条件**:
- `collapsible` 属性为 `true`(默认)
- 表单项行数 >= 2

### CSS 实现展开收起

收起状态下,通过 CSS 限制表单高度并添加渐变遮罩:

```scss
.search-form-container {
  &.is-collapsed {
    :deep(.el-form) {
      max-height: calc(1 * 40px + 10px); // 仅显示第一行
      overflow: hidden;
      position: relative;

      // 渐变遮罩
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: linear-gradient(to bottom, transparent, var(--el-bg-color));
        pointer-events: none;
      }
    }
  }
}
```

### 动态监听

组件使用多种方式监听布局变化:

**1. 窗口大小变化监听**
```typescript
onMounted(() => {
  window.addEventListener('resize', calculateFormRows)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateFormRows)
})
```

**2. MutationObserver 监听表单项变化**
```typescript
let observer: MutationObserver | null = null

onMounted(() => {
  nextTick(() => {
    const formElement = formContainerRef.value?.querySelector('.el-form')
    if (formElement) {
      observer = new MutationObserver(() => {
        calculateFormRows()
      })
      observer.observe(formElement, {
        childList: true,  // 监听子节点变化
        subtree: true     // 监听所有后代节点
      })
    }
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
```

**3. visible 属性变化监听**
```typescript
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 延迟确保 DOM 完全渲染
      setTimeout(() => {
        calculateFormRows()
      }, 100)
    }
  },
  { immediate: true }
)
```

## 基本用法

### 最简单的用法

```vue
<template>
  <ASearchForm v-model="queryParams" title="搜索条件">
    <AFormInput label="用户名" prop="userName" v-model="queryParams.userName" />
    <AFormInput label="手机号" prop="phone" v-model="queryParams.phone" />
    <AFormSelect label="状态" prop="status" v-model="queryParams.status" :options="statusOptions" />
  </ASearchForm>
</template>

<script setup lang="ts">
const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const statusOptions = [
  { label: '正常', value: '1' },
  { label: '停用', value: '0' }
]
</script>
```

### 不带标题

```vue
<template>
  <ASearchForm v-model="queryParams">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="邮箱" v-model="queryParams.email" />
  </ASearchForm>
</template>
```

### 控制显示/隐藏

```vue
<template>
  <!-- 使用 visible 属性控制显示 -->
  <ASearchForm v-model="queryParams" :visible="showSearch">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
  </ASearchForm>

  <!-- 配合 TableToolbar 使用 -->
  <TableToolbar
    :show-search="showSearch"
    @update:showSearch="showSearch = $event"
  />
</template>

<script setup lang="ts">
const showSearch = ref(true)
const queryParams = ref({
  userName: '',
  phone: ''
})
</script>
```

## 展开/收起功能

### 自动展开收起

当表单项超过 2 行时,自动显示展开/收起按钮:

```vue
<template>
  <ASearchForm v-model="queryParams" title="搜索条件">
    <!-- 第一行 -->
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
    <AFormInput label="邮箱" v-model="queryParams.email" />

    <!-- 第二行 -->
    <AFormSelect label="状态" v-model="queryParams.status" :options="statusOptions" />
    <AFormSelect label="角色" v-model="queryParams.roleId" :options="roleOptions" />
    <AFormDate label="创建时间" v-model="queryParams.dateRange" type="daterange" />
  </ASearchForm>
</template>

<script setup lang="ts">
const queryParams = ref({
  userName: '',
  phone: '',
  email: '',
  status: '',
  roleId: '',
  dateRange: [] as [string, string]
})
</script>
```

**效果说明**:
- 默认收起状态,只显示第一行
- 右下角显示"展开"按钮和向下箭头图标
- 点击后展开显示所有行
- 再次点击收起

### 默认展开

```vue
<template>
  <ASearchForm v-model="queryParams" :default-expanded="true">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
    <AFormInput label="邮箱" v-model="queryParams.email" />
    <AFormInput label="地址" v-model="queryParams.address" />
    <AFormInput label="备注" v-model="queryParams.remark" />
  </ASearchForm>
</template>

<script setup lang="ts">
const queryParams = ref({
  userName: '',
  phone: '',
  email: '',
  address: '',
  remark: ''
})
</script>
```

### 禁用展开收起

```vue
<template>
  <!-- 即使超过2行,也不显示展开按钮 -->
  <ASearchForm v-model="queryParams" :collapsible="false">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
    <AFormInput label="邮箱" v-model="queryParams.email" />
    <AFormInput label="状态" v-model="queryParams.status" />
    <AFormInput label="部门" v-model="queryParams.deptId" />
    <AFormInput label="岗位" v-model="queryParams.postId" />
  </ASearchForm>
</template>
```

### 程序化控制展开收起

```vue
<template>
  <ASearchForm ref="searchFormRef" v-model="queryParams">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
    <AFormInput label="邮箱" v-model="queryParams.email" />
    <AFormInput label="状态" v-model="queryParams.status" />
    <AFormInput label="部门" v-model="queryParams.deptId" />
  </ASearchForm>

  <el-button @click="expand">展开</el-button>
  <el-button @click="collapse">收起</el-button>
</template>

<script setup lang="ts">
const searchFormRef = ref()
const queryParams = ref({
  userName: '',
  phone: '',
  email: '',
  status: '',
  deptId: ''
})

// 展开
const expand = () => {
  searchFormRef.value?.expand()
}

// 收起
const collapse = () => {
  searchFormRef.value?.collapse()
}
</script>
```

## 表单配置

### 标签位置

```vue
<template>
  <!-- 标签右对齐（默认） -->
  <ASearchForm v-model="queryParams" label-position="right">
    <AFormInput label="用户名" v-model="queryParams.userName" />
  </ASearchForm>

  <!-- 标签左对齐 -->
  <ASearchForm v-model="queryParams" label-position="left">
    <AFormInput label="用户名" v-model="queryParams.userName" />
  </ASearchForm>

  <!-- 标签在上方 -->
  <ASearchForm v-model="queryParams" label-position="top">
    <AFormInput label="用户名" v-model="queryParams.userName" />
  </ASearchForm>
</template>
```

**说明**:
- `right`: 标签文本在标签区域内右对齐(默认)
- `left`: 标签文本在标签区域内左对齐
- `top`: 标签显示在输入框上方

### 标签宽度

```vue
<template>
  <!-- 自动宽度（默认） -->
  <ASearchForm v-model="queryParams">
    <AFormInput label="用户名" v-model="queryParams.userName" />
  </ASearchForm>

  <!-- 固定宽度 -->
  <ASearchForm v-model="queryParams" label-width="100px">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号码" v-model="queryParams.phone" />
  </ASearchForm>
</template>
```

### 行内/非行内表单

```vue
<template>
  <!-- 行内表单（默认） -->
  <ASearchForm v-model="queryParams" :inline="true">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
  </ASearchForm>

  <!-- 非行内表单（每个表单项占一行） -->
  <ASearchForm v-model="queryParams" :inline="false">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
  </ASearchForm>
</template>
```

## 自定义头部

### 使用 header 插槽

```vue
<template>
  <ASearchForm v-model="queryParams">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon code="search" :size="20" />
          <h5 class="m-0">高级搜索</h5>
        </div>
        <el-button type="primary" size="small" @click="handleReset">
          重置条件
        </el-button>
      </div>
    </template>

    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
    <AFormSelect label="状态" v-model="queryParams.status" :options="statusOptions" />
  </ASearchForm>
</template>

<script setup lang="ts">
const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const handleReset = () => {
  queryParams.value = {
    userName: '',
    phone: '',
    status: ''
  }
}
</script>
```

### 自定义头部样式

```vue
<template>
  <ASearchForm v-model="queryParams">
    <template #header>
      <div class="custom-header">
        <div class="header-left">
          <el-icon class="header-icon">
            <i-ep-search />
          </el-icon>
          <span class="header-title">搜索筛选</span>
          <el-tag type="info" size="small">{{ resultCount }} 条结果</el-tag>
        </div>
        <div class="header-right">
          <el-button type="text" @click="handleSaveFilter">保存筛选</el-button>
          <el-button type="text" @click="handleLoadFilter">加载筛选</el-button>
        </div>
      </div>
    </template>

    <AFormInput label="关键词" v-model="queryParams.keyword" />
    <AFormSelect label="分类" v-model="queryParams.category" :options="categories" />
  </ASearchForm>
</template>

<script setup lang="ts">
const queryParams = ref({
  keyword: '',
  category: ''
})

const resultCount = ref(0)

const handleSaveFilter = () => {
  // 保存筛选条件
  localStorage.setItem('searchFilter', JSON.stringify(queryParams.value))
  ElMessage.success('筛选条件已保存')
}

const handleLoadFilter = () => {
  // 加载筛选条件
  const saved = localStorage.getItem('searchFilter')
  if (saved) {
    queryParams.value = JSON.parse(saved)
    ElMessage.success('筛选条件已加载')
  }
}
</script>

<style scoped lang="scss">
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .header-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }

    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}
</style>
```

## 实战案例

### 案例 1: 用户管理搜索

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <ASearchForm ref="searchFormRef" v-model="queryParams" title="搜索条件" :visible="showSearch">
      <AFormInput label="用户名" prop="userName" v-model="queryParams.userName" @input="handleQuery" />
      <AFormInput label="手机号" prop="phone" v-model="queryParams.phone" @input="handleQuery" />
      <AFormInput label="邮箱" prop="email" v-model="queryParams.email" @input="handleQuery" />

      <AFormSelect
        label="状态"
        prop="status"
        v-model="queryParams.status"
        :options="sys_enable_status"
        @change="handleQuery"
      />

      <AFormTreeSelect
        label="部门"
        prop="deptId"
        v-model="queryParams.deptId"
        :options="deptTree"
        :props="{ label: 'deptName', value: 'deptId', children: 'children' }"
        @change="handleQuery"
      />

      <AFormDate
        label="创建时间"
        v-model="dateRange"
        type="daterange"
        @change="handleQuery"
      />
    </ASearchForm>

    <!-- 工具栏 -->
    <TableToolbar
      :show-search="showSearch"
      @update:showSearch="showSearch = $event"
      @resetQuery="resetQuery"
      @queryTable="getList"
    >
      <template #left>
        <el-button type="primary" @click="handleAdd" v-permi="['system:user:add']">
          新增
        </el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
      </template>
    </TableToolbar>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="用户ID" prop="userId" width="100" />
      <el-table-column label="用户名" prop="userName" />
      <el-table-column label="昵称" prop="nickName" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="邮箱" prop="email" />
      <el-table-column label="部门" prop="deptName" />
      <el-table-column label="状态" prop="status">
        <template #default="{ row }">
          <DictTag :options="sys_enable_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { pageUsers, deleteUser } from '@/api/system/core/user/userApi'
import type { SysUserQuery, SysUserVo } from '@/api/system/core/user/userTypes'
import { getDeptTreeOptions } from '@/api/system/core/dept/deptApi'
import { addDateRange } from '@/utils/date'

// 字典
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

// 搜索表单引用
const searchFormRef = ref()

// 是否显示搜索
const showSearch = ref(true)

// 查询参数
const queryParams = ref<SysUserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phone: '',
  email: '',
  status: '',
  deptId: ''
})

// 日期范围
const dateRange = ref<[string, string]>(['', ''])

// 部门树
const deptTree = ref([])

// 表格数据
const tableData = ref<SysUserVo[]>([])
const total = ref(0)
const loading = ref(false)

// 选中数据
const selectedIds = ref<string[]>([])

// 查询列表
const getList = async () => {
  loading.value = true

  queryParams.value.params = {}
  addDateRange(queryParams.value, dateRange.value, 'createTime')

  const [err, data] = await pageUsers(queryParams.value)
  if (!err) {
    tableData.value = data.records || []
    total.value = data.total
  }

  loading.value = false
}

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  dateRange.value = ['', '']
  searchFormRef.value?.resetFields()
  handleQuery()
}

// 加载部门树
const loadDeptTree = async () => {
  const [err, data] = await getDeptTreeOptions()
  if (!err) {
    deptTree.value = data
  }
}

// 选择变化
const handleSelectionChange = (selection: SysUserVo[]) => {
  selectedIds.value = selection.map(item => item.userId)
}

// 新增
const handleAdd = () => {
  // 新增逻辑
}

// 编辑
const handleEdit = (row: SysUserVo) => {
  // 编辑逻辑
}

// 删除
const handleDelete = async (row: SysUserVo) => {
  await ElMessageBox.confirm('确认删除此用户吗?', '提示', { type: 'warning' })
  const [err] = await deleteUser(row.userId)
  if (!err) {
    ElMessage.success('删除成功')
    getList()
  }
}

// 批量删除
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条数据吗?`, '提示', { type: 'warning' })
  // 批量删除逻辑
  ElMessage.success('删除成功')
  getList()
}

// 初始化
onMounted(() => {
  getList()
  loadDeptTree()
})
</script>
```

### 案例 2: 订单管理搜索

```vue
<template>
  <div class="app-container">
    <ASearchForm v-model="queryParams" title="订单查询" :default-expanded="true">
      <!-- 基础信息 -->
      <AFormInput label="订单号" v-model="queryParams.orderNo" placeholder="请输入订单号" />
      <AFormInput label="用户名" v-model="queryParams.userName" placeholder="请输入用户名" />
      <AFormInput label="手机号" v-model="queryParams.phone" placeholder="请输入手机号" />

      <!-- 状态筛选 -->
      <AFormSelect
        label="订单状态"
        v-model="queryParams.status"
        :options="orderStatusOptions"
        placeholder="请选择订单状态"
      />

      <AFormSelect
        label="支付方式"
        v-model="queryParams.payType"
        :options="payTypeOptions"
        placeholder="请选择支付方式"
      />

      <!-- 金额范围 -->
      <el-form-item label="订单金额">
        <el-col :span="11">
          <AFormInput v-model="queryParams.minAmount" type="number" placeholder="最小金额" />
        </el-col>
        <el-col :span="2" class="text-center">
          <span>-</span>
        </el-col>
        <el-col :span="11">
          <AFormInput v-model="queryParams.maxAmount" type="number" placeholder="最大金额" />
        </el-col>
      </el-form-item>

      <!-- 时间范围 -->
      <AFormDate
        label="下单时间"
        v-model="queryParams.createTimeRange"
        type="daterange"
        :shortcuts="dateShortcuts"
      />

      <AFormDate
        label="支付时间"
        v-model="queryParams.payTimeRange"
        type="datetimerange"
      />
    </ASearchForm>

    <!-- 工具栏 -->
    <TableToolbar @queryTable="getList" @resetQuery="resetQuery">
      <template #left>
        <el-button type="primary" @click="handleExport">导出</el-button>
        <el-button type="warning" @click="handleBatchRefund" :disabled="!selectedIds.length">
          批量退款
        </el-button>
      </template>
    </TableToolbar>

    <!-- 订单列表 -->
    <el-table :data="orderList" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="订单号" prop="orderNo" width="180" />
      <el-table-column label="用户" prop="userName" />
      <el-table-column label="金额" prop="amount" width="100">
        <template #default="{ row }">
          <span class="text-danger">¥{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status">
        <template #default="{ row }">
          <DictTag :options="orderStatusOptions" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="支付方式" prop="payType" />
      <el-table-column label="下单时间" prop="createTime" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
          <el-button type="danger" link @click="handleRefund(row)">退款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  userName: '',
  phone: '',
  status: '',
  payType: '',
  minAmount: '',
  maxAmount: '',
  createTimeRange: [] as [string, string],
  payTimeRange: [] as [string, string]
})

// 订单状态选项
const orderStatusOptions = [
  { label: '待支付', value: '0' },
  { label: '已支付', value: '1' },
  { label: '已发货', value: '2' },
  { label: '已完成', value: '3' },
  { label: '已取消', value: '4' },
  { label: '已退款', value: '5' }
]

// 支付方式选项
const payTypeOptions = [
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '银行卡', value: 'bank' },
  { label: '余额', value: 'balance' }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(1)
      return [start, end]
    }
  }
]

const orderList = ref([])
const total = ref(0)
const loading = ref(false)
const selectedIds = ref([])

const getList = async () => {
  loading.value = true
  // 查询逻辑
  loading.value = false
}

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    orderNo: '',
    userName: '',
    phone: '',
    status: '',
    payType: '',
    minAmount: '',
    maxAmount: '',
    createTimeRange: [],
    payTimeRange: []
  }
  getList()
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.orderId)
}

const handleExport = () => {
  // 导出逻辑
}

const handleBatchRefund = () => {
  // 批量退款逻辑
}

const handleDetail = (row: any) => {
  // 查看详情
}

const handleRefund = (row: any) => {
  // 退款逻辑
}

onMounted(() => {
  getList()
})
</script>
```

## API 文档

### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 表单数据模型,通过 v-model 绑定 | `Record<string, any>` | `{}` |
| visible | 控制表单显示/隐藏 | `boolean` | `true` |
| inline | 是否行内表单 | `boolean` | `true` |
| labelWidth | 标签宽度 | `string` | `'auto'` |
| labelPosition | 标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| title | 卡片标题(当没有使用 header 插槽时显示) | `string` | `''` |
| collapsible | 是否启用展开/收起功能(当表单项超过2行时显示) | `boolean` | `true` |
| defaultExpanded | 默认是否展开 | `boolean` | `false` |

### Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 表单数据变化时触发 | `(value: Record<string, any>) => void` |
| search | 搜索事件(预留) | `() => void` |
| reset | 重置事件(预留) | `() => void` |

### Slots 插槽

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 表单内容插槽,放置表单项 | - |
| header | 自定义卡片头部插槽 | - |

### Expose 暴露方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| resetFields | 重置表单字段到初始值 | - | `void` |
| calculateFormRows | 重新计算表单行数 | - | `void` |
| expand | 展开表单 | - | `void` |
| collapse | 收起表单 | - | `void` |
| formRef | 表单引用,可用于直接操作 el-form 实例 | - | `FormInstance` |

## 最佳实践

### 1. 配合 TableToolbar 使用

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <ASearchForm ref="searchFormRef" v-model="queryParams" :visible="showSearch">
      <!-- 表单项 -->
    </ASearchForm>

    <!-- 工具栏 -->
    <TableToolbar
      :show-search="showSearch"
      @update:showSearch="showSearch = $event"
      @resetQuery="resetQuery"
      @queryTable="getList"
    />

    <!-- 表格和分页 -->
  </div>
</template>

<script setup lang="ts">
const showSearch = ref(true)
const searchFormRef = ref()

const resetQuery = () => {
  searchFormRef.value?.resetFields()
  queryParams.value.pageNum = 1
  getList()
}
</script>
```

### 2. 实时搜索

```vue
<template>
  <ASearchForm v-model="queryParams">
    <AFormInput
      label="关键词"
      v-model="queryParams.keyword"
      @input="debouncedSearch"
      placeholder="输入关键词自动搜索"
    />
  </ASearchForm>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const queryParams = ref({
  keyword: ''
})

// 防抖搜索
const debouncedSearch = useDebounceFn(() => {
  getList()
}, 500)

const getList = async () => {
  // 查询逻辑
}
</script>
```

### 3. 保存和恢复搜索条件

```vue
<template>
  <ASearchForm v-model="queryParams">
    <template #header>
      <div class="flex justify-between">
        <h5>搜索条件</h5>
        <div>
          <el-button type="text" @click="saveFilter">保存</el-button>
          <el-button type="text" @click="loadFilter">加载</el-button>
        </div>
      </div>
    </template>

    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
  </ASearchForm>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'user-search-filter'

const queryParams = ref({
  userName: '',
  phone: ''
})

// 保存筛选条件
const saveFilter = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queryParams.value))
  ElMessage.success('筛选条件已保存')
}

// 加载筛选条件
const loadFilter = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      queryParams.value = JSON.parse(saved)
      ElMessage.success('筛选条件已加载')
      getList()
    } catch (e) {
      ElMessage.error('加载失败')
    }
  } else {
    ElMessage.warning('暂无保存的筛选条件')
  }
}

// 页面加载时自动恢复
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      queryParams.value = JSON.parse(saved)
    } catch (e) {
      // 忽略解析错误
    }
  }
  getList()
})
</script>
```

### 4. 动态表单项

```vue
<template>
  <ASearchForm v-model="queryParams">
    <AFormInput label="用户名" v-model="queryParams.userName" />

    <!-- 根据权限显示 -->
    <AFormSelect
      v-if="hasPermission('system:user:query:all')"
      label="部门"
      v-model="queryParams.deptId"
      :options="deptOptions"
    />

    <!-- 根据条件显示 -->
    <AFormDate
      v-if="queryParams.status === '1'"
      label="激活时间"
      v-model="queryParams.activeTime"
    />

    <!-- 动态添加的筛选项 -->
    <template v-for="filter in dynamicFilters" :key="filter.field">
      <AFormInput
        v-if="filter.type === 'input'"
        :label="filter.label"
        v-model="queryParams[filter.field]"
      />
      <AFormSelect
        v-else-if="filter.type === 'select'"
        :label="filter.label"
        v-model="queryParams[filter.field]"
        :options="filter.options"
      />
    </template>
  </ASearchForm>

  <el-button @click="addFilter">添加筛选条件</el-button>
</template>

<script setup lang="ts">
const queryParams = ref({
  userName: '',
  deptId: '',
  status: '',
  activeTime: ''
})

const dynamicFilters = ref<any[]>([])

const addFilter = () => {
  ElMessageBox.prompt('请输入筛选字段名', '添加筛选', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    dynamicFilters.value.push({
      field: value,
      label: value,
      type: 'input'
    })
    queryParams.value[value] = ''
  })
}
</script>
```

### 5. 搜索历史

```vue
<template>
  <ASearchForm v-model="queryParams">
    <AFormInput label="关键词" v-model="queryParams.keyword">
      <template #append>
        <el-dropdown @command="handleHistorySelect">
          <el-button>
            <el-icon><i-ep-clock /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in searchHistory"
                :key="index"
                :command="item"
              >
                {{ item }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="clearHistory">
                清空历史
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </AFormInput>
  </ASearchForm>
</template>

<script setup lang="ts">
const HISTORY_KEY = 'search-history'
const MAX_HISTORY = 10

const queryParams = ref({
  keyword: ''
})

const searchHistory = ref<string[]>([])

// 加载搜索历史
const loadHistory = () => {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) {
    try {
      searchHistory.value = JSON.parse(saved)
    } catch (e) {
      searchHistory.value = []
    }
  }
}

// 保存搜索历史
const saveHistory = (keyword: string) => {
  if (!keyword.trim()) return

  // 移除重复项
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到开头
  searchHistory.value.unshift(keyword)

  // 限制数量
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
  }

  // 保存到本地存储
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
}

// 选择历史记录
const handleHistorySelect = (keyword: string) => {
  queryParams.value.keyword = keyword
  getList()
}

// 清空历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
  ElMessage.success('历史记录已清空')
}

// 搜索时保存历史
watch(() => queryParams.value.keyword, (newVal) => {
  if (newVal) {
    saveHistory(newVal)
  }
})

onMounted(() => {
  loadHistory()
})
</script>
```

## 常见问题

### 1. 展开/收起按钮不显示

**问题原因**:
- 表单项不足2行
- `collapsible` 设置为 `false`
- 表单项还未完全渲染

**解决方案**:

```vue
<script setup lang="ts">
const searchFormRef = ref()

// 方案1: 确保表单项足够多
// 至少需要能形成2行才会显示展开按钮

// 方案2: 检查 collapsible 属性
// <ASearchForm :collapsible="true">

// 方案3: 手动触发行数计算
onMounted(() => {
  nextTick(() => {
    searchFormRef.value?.calculateFormRows()
  })
})

// 方案4: 监听数据变化后重新计算
watch(() => dataLoaded.value, () => {
  nextTick(() => {
    searchFormRef.value?.calculateFormRows()
  })
})
</script>
```

### 2. 表单项动态变化后行数计算不准确

**问题原因**:
- MutationObserver 可能有延迟
- DOM 更新未完成

**解决方案**:

```vue
<script setup lang="ts">
const searchFormRef = ref()

// 在动态添加/删除表单项后手动触发计算
const addFormItem = () => {
  // 添加表单项逻辑
  formItems.value.push({ field: 'newField', label: '新字段' })

  // 等待 DOM 更新后重新计算
  nextTick(() => {
    setTimeout(() => {
      searchFormRef.value?.calculateFormRows()
    }, 100)
  })
}
</script>
```

### 3. 重置表单后值未清空

**问题原因**:
- 使用了自定义组件,未正确处理重置
- 表单项没有设置 `prop` 属性

**解决方案**:

```vue
<template>
  <ASearchForm ref="searchFormRef" v-model="queryParams">
    <!-- 确保每个表单项都有 prop 属性 -->
    <AFormInput label="用户名" prop="userName" v-model="queryParams.userName" />
    <AFormInput label="手机号" prop="phone" v-model="queryParams.phone" />
  </ASearchForm>
</template>

<script setup lang="ts">
const searchFormRef = ref()

// 初始值
const initialQueryParams = {
  userName: '',
  phone: ''
}

// 查询参数
const queryParams = ref({ ...initialQueryParams })

// 重置方法
const resetQuery = () => {
  // 方式1: 使用组件提供的 resetFields 方法
  searchFormRef.value?.resetFields()

  // 方式2: 手动重置到初始值
  queryParams.value = { ...initialQueryParams }

  // 重新查询
  getList()
}
</script>
```

### 4. 在弹窗中使用时行数计算错误

**问题原因**:
- 弹窗未完全打开时就计算行数
- 弹窗宽度变化影响布局

**解决方案**:

```vue
<template>
  <AModal v-model="dialogVisible" @opened="handleDialogOpened">
    <ASearchForm ref="searchFormRef" v-model="queryParams">
      <!-- 表单项 -->
    </ASearchForm>
  </AModal>
</template>

<script setup lang="ts">
const dialogVisible = ref(false)
const searchFormRef = ref()

// 在弹窗完全打开后重新计算
const handleDialogOpened = () => {
  nextTick(() => {
    setTimeout(() => {
      searchFormRef.value?.calculateFormRows()
    }, 200) // 延迟确保布局完成
  })
}
</script>
```

### 5. 搜索表单与 URL 参数同步

**问题原因**:
- 需要将搜索条件保存到 URL,实现分享和书签功能

**解决方案**:

```vue
<template>
  <ASearchForm v-model="queryParams">
    <AFormInput label="用户名" v-model="queryParams.userName" @input="syncToUrl" />
    <AFormInput label="手机号" v-model="queryParams.phone" @input="syncToUrl" />
  </ASearchForm>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const router = useRouter()

const queryParams = ref({
  userName: '',
  phone: ''
})

// 从 URL 加载参数
const loadFromUrl = () => {
  const { userName, phone } = route.query
  if (userName) queryParams.value.userName = userName as string
  if (phone) queryParams.value.phone = phone as string
}

// 同步到 URL (防抖)
const syncToUrl = useDebounceFn(() => {
  router.replace({
    query: {
      ...route.query,
      userName: queryParams.value.userName || undefined,
      phone: queryParams.value.phone || undefined
    }
  })
}, 500)

// 初始化时从 URL 加载
onMounted(() => {
  loadFromUrl()
  getList()
})
</script>
```

## 总结

ASearchForm 是一个功能强大且易用的搜索表单容器组件,提供了:

**核心功能**:
- <Ok/> 智能展开/收起功能
- <Ok/> 自动行数计算
- <Ok/> 动态布局监听
- <Ok/> 优雅的动画效果
- <Ok/> 双向数据绑定
- <Ok/> 灵活的配置选项

**适用场景**:
- 列表页面搜索
- 数据筛选
- 高级搜索
- 条件查询

**最佳实践**:
- 与 TableToolbar 配合使用
- 实现实时搜索
- 保存和恢复搜索条件
- 支持搜索历史
- 与 URL 参数同步

通过合理使用 ASearchForm,可以快速构建出功能完善、用户体验优秀的搜索功能。
