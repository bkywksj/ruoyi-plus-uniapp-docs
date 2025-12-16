# 选择标签 (ASelectionTags)

## 介绍

ASelectionTags 是一个用于展示已选中项目的标签组件,通常与表格的多选/单选功能配合使用。组件将选中的数据项渲染为可关闭的标签形式,提供直观的视觉反馈和便捷的操作方式。

**核心特性:**

- **标签展示** - 将选中项以标签形式展示,支持自定义显示内容和样式
- **可关闭标签** - 每个标签支持关闭操作,点击关闭图标可移除对应选中项
- **批量清空** - 提供清空按钮,一键清除所有选中项
- **灵活定制** - 支持自定义键字段、文本格式化、标签样式等
- **插槽支持** - 提供 header、default、footer 三个插槽,满足各种布局需求
- **智能显示** - 只在有选中项时显示,避免占用不必要的空间
- **跨页选择** - 配合 `useSelection` 组合函数,支持表格跨页选择场景

该组件广泛应用于用户选择器、角色分配、数据批量操作等需要展示选中项的场景。

## 基本用法

### 简单示例

最基础的用法,展示选中的用户列表。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectedUsers"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface User {
  id: number
  name: string
}

const selectedUsers = ref<User[]>([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const handleRemove = (id: number) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== id)
}
</script>
```

**使用说明:**
- 组件会自动识别常见的显示字段(name、label、title 等)
- 默认使用 `id` 字段作为唯一标识
- 点击标签的关闭图标会触发 `close` 事件
- 只在 `items` 数组不为空时显示组件

### 自定义键字段

当数据对象的唯一标识字段不是 `id` 时,使用 `keyField` 属性指定。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectedRoles"
      key-field="roleId"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Role {
  roleId: string
  roleName: string
}

const selectedRoles = ref<Role[]>([
  { roleId: 'admin', roleName: '管理员' },
  { roleId: 'user', roleName: '普通用户' }
])

const handleRemove = (roleId: string) => {
  selectedRoles.value = selectedRoles.value.filter(role => role.roleId !== roleId)
}
</script>
```

**技术实现:**
- `keyField` 属性默认值为 `'id'`
- 组件内部通过 `item[keyField]` 获取唯一键
- close 事件会同时传递 key 和完整对象两个参数

### 自定义文本格式化

使用 `formatter` 函数自定义每个标签的显示文本。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectedDepts"
      key-field="deptId"
      :formatter="formatDeptName"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Dept {
  deptId: number
  deptName: string
  parentName?: string
}

const selectedDepts = ref<Dept[]>([
  { deptId: 1, deptName: '研发部', parentName: '技术中心' },
  { deptId: 2, deptName: '测试部', parentName: '技术中心' }
])

const formatDeptName = (dept: Dept) => {
  return dept.parentName ? `${dept.parentName} / ${dept.deptName}` : dept.deptName
}

const handleRemove = (deptId: number) => {
  selectedDepts.value = selectedDepts.value.filter(dept => dept.deptId !== deptId)
}
</script>
```

**技术实现:**
- `formatter` 函数接收当前项作为参数,返回显示文本
- 如果不提供 `formatter`,组件会按优先级尝试以下字段:
  - label > name > title > value > text > key > keyField > JSON.stringify(item)
- 自定义格式化可以实现复杂的显示逻辑,如拼接多个字段、添加前缀后缀等

### 禁用关闭功能

通过 `closable` 属性控制标签是否可关闭。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectedItems"
      :closable="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selectedItems = ref([
  { id: 1, name: '已确认项目(不可移除)' },
  { id: 2, name: '已提交项目(不可移除)' }
])
</script>
```

**使用说明:**
- 设置 `closable` 为 `false` 后,标签右侧不会显示关闭图标
- 适用于只读展示场景,或者需要通过其他方式移除选中项的情况

### 自定义标签样式

通过 `type`、`effect`、`size`、`color` 属性自定义标签样式。

```vue
<template>
  <div class="demo">
    <h3>不同类型</h3>
    <ASelectionTags
      :items="items1"
      type="primary"
      @close="handleRemove1"
    />

    <h3>不同效果</h3>
    <ASelectionTags
      :items="items2"
      type="success"
      effect="dark"
      @close="handleRemove2"
    />

    <h3>不同尺寸</h3>
    <ASelectionTags
      :items="items3"
      size="large"
      @close="handleRemove3"
    />

    <h3>自定义颜色</h3>
    <ASelectionTags
      :items="items4"
      color="#f56c6c"
      @close="handleRemove4"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const items1 = ref([{ id: 1, name: '主要标签' }])
const items2 = ref([{ id: 2, name: '成功标签' }])
const items3 = ref([{ id: 3, name: '大号标签' }])
const items4 = ref([{ id: 4, name: '自定义颜色' }])

const handleRemove1 = (id: number) => {
  items1.value = items1.value.filter(item => item.id !== id)
}

const handleRemove2 = (id: number) => {
  items2.value = items2.value.filter(item => item.id !== id)
}

const handleRemove3 = (id: number) => {
  items3.value = items3.value.filter(item => item.id !== id)
}

const handleRemove4 = (id: number) => {
  items4.value = items4.value.filter(item => item.id !== id)
}
</script>
```

**样式属性说明:**
- `type`: 标签类型,可选值为 `'success' | 'info' | 'warning' | 'danger'` (默认 `'success'`)
- `effect`: 标签效果,可选值为 `'dark' | 'light' | 'plain'` (默认 `'light'`)
- `size`: 标签尺寸,可选值为 `'large' | 'default' | 'small'` (默认 `'default'`)
- `color`: 自定义背景色,会覆盖 `type` 设置的颜色

## 高级用法

### 使用清空按钮

通过 `onClear` 回调提供清空功能。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectedUsers"
      key-field="userId"
      :formatter="user => user.userName"
      :on-clear="handleClearAll"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface User {
  userId: number
  userName: string
}

const selectedUsers = ref<User[]>([
  { userId: 1, userName: '张三' },
  { userId: 2, userName: '李四' },
  { userId: 3, userName: '王五' }
])

const handleRemove = (userId: number) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.userId !== userId)
}

const handleClearAll = () => {
  selectedUsers.value = []
}
</script>
```

**技术实现:**
- 只有提供了 `onClear` 回调函数时,才会在标签末尾显示清空按钮
- 清空按钮使用 `el-button` 的 `link` 类型,样式轻量不突兀
- 按钮包含删除图标和"清空选择"文字

### 自定义插槽内容

组件提供 `header`、`default`、`footer` 三个插槽,实现灵活布局。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectedUsers"
      key-field="userId"
      @close="handleRemove"
    >
      <template #header>
        <div class="selection-header">
          <span class="text-sm text-gray-500">已选择用户 ({{ selectedUsers.length }})</span>
        </div>
      </template>

      <template #default="{ item }">
        <span class="custom-tag-content">
          <el-icon class="mr-1"><User /></el-icon>
          {{ item.userName }}
        </span>
      </template>

      <template #footer>
        <el-button size="small" link type="danger" @click="handleClearAll">
          清空全部
        </el-button>
        <el-button size="small" link type="primary" @click="handleExport">
          导出选中
        </el-button>
      </template>
    </ASelectionTags>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { User } from '@element-plus/icons-vue'

interface User {
  userId: number
  userName: string
}

const selectedUsers = ref<User[]>([
  { userId: 1, userName: '张三' },
  { userId: 2, userName: '李四' }
])

const handleRemove = (userId: number) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.userId !== userId)
}

const handleClearAll = () => {
  selectedUsers.value = []
}

const handleExport = () => {
  console.log('导出选中用户:', selectedUsers.value)
}
</script>

```

**插槽说明:**
- `header`: 在标签列表之前显示,常用于添加标题或说明文字
- `default`: 自定义每个标签的内容,作用域插槽提供 `item` 对象
- `footer`: 在标签列表之后显示,常用于添加操作按钮

### 控制显示状态

使用 `visible` 属性控制组件的显示/隐藏。

```vue
<template>
  <div class="demo">
    <el-switch
      v-model="showTags"
      active-text="显示标签"
      inactive-text="隐藏标签"
    />

    <ASelectionTags
      :items="selectedUsers"
      :visible="showTags"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showTags = ref(true)

const selectedUsers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
])

const handleRemove = (id: number) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== id)
}
</script>
```

**使用说明:**
- `visible` 属性默认为 `true`
- 设置为 `false` 时,整个组件不会渲染
- 即使 `visible` 为 `true`,如果 `items` 为空数组,组件也不会显示

## 与 useSelection 集成

### 配合 useSelection 实现跨页选择

ASelectionTags 与 `useSelection` 组合函数完美配合,实现表格跨页多选功能。

```vue
<template>
  <div class="demo">
    <ASearchForm ref="queryFormRef" v-model="queryParams">
      <AFormInput label="用户名" v-model="queryParams.userName" prop="userName" />
    </ASearchForm>

    <el-card>
      <template #header>
        <ASelectionTags
          :items="selectionItems"
          key-field="userId"
          :formatter="user => user.userName"
          @close="selectionRemove"
        >
          <template #footer>
            <el-button size="small" link type="primary" @click="selectionClear">
              <el-icon><Delete /></el-icon>
              清空选择
            </el-button>
          </template>
        </ASelectionTags>
      </template>

      <el-table
        ref="tableRef"
        :data="userList"
        @selection-change="selectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="用户名" prop="userName" />
        <el-table-column label="邮箱" prop="email" />
      </el-table>

      <Pagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface User {
  userId: number
  userName: string
  email: string
}

interface QueryParams {
  pageNum: number
  pageSize: number
  userName?: string
}

const tableRef = ref()
const userList = ref<User[]>([])
const queryParams = ref<QueryParams>({
  pageNum: 1,
  pageSize: 10
})
const total = ref(0)

// 使用 useSelection 管理选择状态
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionRemove,
  selectionClear
} = useSelection('userId', tableRef, userList, ref(true))

const getList = async () => {
  // 模拟API请求
  const response = await fetch(`/api/users?page=${queryParams.value.pageNum}`)
  const data = await response.json()

  userList.value = data.records
  total.value = data.total

  // 同步选中状态
  await selectionSync()
}

// 初始化加载
getList()
</script>
```

**集成说明:**
- `useSelection` 提供完整的选择状态管理
- `selectionItems` 包含所有选中的完整对象
- `selectionRemove` 支持通过标签关闭移除选中项
- `selectionClear` 提供清空所有选择功能
- `selectionSync` 在翻页后同步表格选中状态

### 用户选择器完整示例

实际业务场景中的用户选择器实现。

```vue
<template>
  <AModal v-model="dialog.visible" title="选择用户" size="xl">
    <AResizablePanels v-model:leftWidth="leftPanelWidth">
      <template #left>
        <el-card shadow="hover">
          <template #header>部门筛选</template>
          <el-tree
            :data="deptTree"
            @node-click="handleDeptClick"
          />
        </el-card>
      </template>

      <template #right>
        <ASearchForm ref="queryFormRef" v-model="queryParams">
          <AFormInput label="用户名称" v-model="queryParams.userName" prop="userName" />
          <AFormInput label="手机号码" v-model="queryParams.phone" prop="phone" />
        </ASearchForm>

        <el-card>
          <template #header>
            <ASelectionTags
              :items="selectedUsers"
              key-field="userId"
              :formatter="user => user.userName"
              :on-clear="clearAllSelection"
              @close="handleTagClose"
            />
          </template>

          <el-table
            ref="userTableRef"
            :data="userList"
            @selection-change="handleSelectionChange"
            @select="handleSelect"
            @select-all="handleSelectAll"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="用户名" prop="userName" />
            <el-table-column label="昵称" prop="nickName" />
            <el-table-column label="部门" prop="deptName" />
          </el-table>

          <Pagination
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
          />
        </el-card>
      </template>
    </AResizablePanels>

    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        确定（{{ selectedUserIds.size }}）
      </el-button>
    </template>
  </AModal>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'

interface User {
  userId: number
  userName: string
  nickName: string
  deptName: string
}

const dialog = ref({
  visible: false
})

const leftPanelWidth = ref(220)
const userTableRef = ref()
const userList = ref<User[]>([])
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phone: '',
  deptId: undefined
})
const total = ref(0)

// 选中管理
const selectedUserIds = ref<Set<number>>(new Set())
const selectedUsers = ref<User[]>([])

const addSelectedUser = (user: User) => {
  selectedUserIds.value.add(user.userId)
  if (!selectedUsers.value.find(u => u.userId === user.userId)) {
    selectedUsers.value.push(user)
  }
}

const removeSelectedUser = (userId: number) => {
  selectedUserIds.value.delete(userId)
  selectedUsers.value = selectedUsers.value.filter(u => u.userId !== userId)

  nextTick(() => {
    updateCurrentPageSelection()
  })
}

const handleTagClose = (userId: number) => {
  removeSelectedUser(userId)
}

const clearAllSelection = () => {
  selectedUserIds.value.clear()
  selectedUsers.value = []
  userTableRef.value?.clearSelection()
}

const updateCurrentPageSelection = () => {
  if (!userTableRef.value) return

  userList.value.forEach(user => {
    const isSelected = selectedUserIds.value.has(user.userId)
    userTableRef.value.toggleRowSelection(user, isSelected)
  })
}

const handleSelect = (selection: User[], row: User) => {
  const isSelected = selection.includes(row)
  if (isSelected) {
    addSelectedUser(row)
  } else {
    removeSelectedUser(row.userId)
  }
}

const handleSelectAll = (selection: User[]) => {
  if (selection.length === 0) {
    userList.value.forEach(user => removeSelectedUser(user.userId))
  } else {
    userList.value.forEach(user => addSelectedUser(user))
  }
}

const handleSelectionChange = (selection: User[]) => {
  // 处理选择变化
}

const getList = async () => {
  // 加载用户列表
  await nextTick()
  updateCurrentPageSelection()
}

const handleConfirm = () => {
  emit('confirm', Array.from(selectedUserIds.value))
  dialog.value.visible = false
}

const cancel = () => {
  dialog.value.visible = false
  clearAllSelection()
}

const emit = defineEmits(['confirm'])

defineExpose({
  show: () => {
    dialog.value.visible = true
    getList()
  }
})
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 要展示的选中项数组 | `any[]` | - |
| closable | 是否可关闭,为 true 时标签右侧显示关闭图标 | `boolean` | `true` |
| visible | 是否显示组件 | `boolean` | `true` |
| type | 标签类型,影响颜色和外观 | `'success' \| 'info' \| 'warning' \| 'danger'` | `'success'` |
| effect | 标签效果 | `'dark' \| 'light' \| 'plain'` | `'light'` |
| size | 标签尺寸 | `'large' \| 'default' \| 'small'` | `'default'` |
| color | 自定义标签背景色,会覆盖 type 设置的颜色 | `string` | `''` |
| keyField | 主键字段名,用于提取唯一标识符 | `string` | `'id'` |
| formatter | 文本格式化函数,用于自定义显示内容 | `(item: any) => string` | 自动提取 |
| onClear | 清空选择的回调函数,提供此函数会显示清空按钮 | `() => void` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 点击标签关闭图标时触发 | `(key: any, item: any)` |

**事件参数说明:**
- `key`: 被关闭项的唯一标识(通过 `keyField` 提取)
- `item`: 被关闭项的完整对象

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| header | 标签列表之前的内容,常用于标题或说明 | - |
| default | 自定义标签内容 | `{ item: any }` |
| footer | 标签列表之后的内容,常用于操作按钮 | - |

### 类型定义

```typescript
/**
 * Element Plus 标签类型
 */
type ElTagType = 'success' | 'info' | 'warning' | 'danger'

/**
 * Element Plus 标签效果
 */
type ElEffect = 'dark' | 'light' | 'plain'

/**
 * Element Plus 组件尺寸
 */
type ElSize = 'large' | 'default' | 'small'

/**
 * ASelectionTags 组件的属性接口
 */
interface ASelectionTagsProps {
  /**
   * 要展示的选中项数组
   * 每个项应该是一个对象,包含唯一标识符和显示信息
   */
  items: any[]

  /**
   * 是否可关闭
   * 为 true 时,标签右侧会显示关闭图标,点击后会触发 close 事件
   * @default true
   */
  closable?: boolean

  /**
   * 是否显示
   * 为 false 时,整个组件将不显示
   * @default true
   */
  visible?: boolean

  /**
   * 标签类型
   * 影响标签的颜色和外观,与 Element Plus 的 Tag 组件类型一致
   * @default 'success'
   */
  type?: ElTagType

  /**
   * 标签效果
   * 影响标签的显示效果,可选 'light'、'dark' 或 'plain'
   * @default 'light'
   */
  effect?: ElEffect

  /**
   * 标签大小
   * 控制标签的尺寸,可选 'large'、'default' 或 'small'
   * @default 'default'
   */
  size?: ElSize

  /**
   * 标签颜色
   * 自定义标签的背景色,会覆盖 type 属性设置的颜色
   * @default ''
   */
  color?: string

  /**
   * 主键字段名
   * 用于从每个项中提取唯一标识符的字段名
   * @default 'id'
   */
  keyField?: string

  /**
   * 文本格式化函数
   * 用于从每个项中提取显示文本的函数
   * 如果未提供,将尝试从常见字段中获取显示文本
   * @param item 当前项
   * @returns 显示文本
   * @default 自动从常见字段提取
   */
  formatter?: (item: any) => string

  /**
   * 清空选择的回调函数
   * 当用户点击清空按钮时调用
   * 如果提供了此函数,将显示清空按钮
   */
  onClear?: () => void
}
```

## 最佳实践

### 1. 合理选择键字段

根据数据结构选择合适的唯一标识字段。

```vue
<template>
  <!-- ✅ 推荐: 明确指定键字段 -->
  <ASelectionTags
    :items="selectedUsers"
    key-field="userId"
    @close="handleRemove"
  />

  <!-- ❌ 不推荐: 数据使用非 id 字段但不指定 keyField -->
  <ASelectionTags
    :items="selectedUsers"
    @close="handleRemove"
  />
</template>

<script lang="ts" setup>
// 如果唯一标识不是 id,必须指定 keyField
interface User {
  userId: number  // 唯一标识是 userId 而不是 id
  userName: string
}
</script>
```

### 2. 使用格式化函数提升用户体验

为用户提供更清晰的信息展示。

```vue
<template>
  <!-- ✅ 推荐: 使用格式化函数展示多个字段 -->
  <ASelectionTags
    :items="selectedUsers"
    key-field="userId"
    :formatter="formatUserInfo"
    @close="handleRemove"
  />

  <!-- ❌ 不推荐: 只显示单一字段 -->
  <ASelectionTags
    :items="selectedUsers"
    key-field="userId"
    @close="handleRemove"
  />
</template>

<script lang="ts" setup>
interface User {
  userId: number
  userName: string
  deptName: string
}

// 推荐: 组合多个字段提供更多信息
const formatUserInfo = (user: User) => {
  return `${user.userName} (${user.deptName})`
}
</script>
```

### 3. 配合 useSelection 实现跨页选择

使用 `useSelection` 简化跨页选择逻辑。

```vue
<template>
  <!-- ✅ 推荐: 使用 useSelection 管理选择状态 -->
  <ASelectionTags
    :items="selectionItems"
    key-field="userId"
    @close="selectionRemove"
  >
    <template #footer>
      <el-button size="small" link type="primary" @click="selectionClear">
        清空选择
      </el-button>
    </template>
  </ASelectionTags>
</template>

<script lang="ts" setup>
import { useSelection } from '@/composables/useSelection'

const {
  selectionItems,
  selectionRemove,
  selectionClear
} = useSelection('userId', tableRef, userList, ref(true))
</script>
```

### 4. 提供清空功能

对于多选场景,提供清空功能提升用户体验。

```vue
<template>
  <!-- ✅ 推荐: 提供清空按钮 -->
  <ASelectionTags
    :items="selectedItems"
    :on-clear="handleClearAll"
    @close="handleRemove"
  />

  <!-- 或使用 footer 插槽自定义 -->
  <ASelectionTags
    :items="selectedItems"
    @close="handleRemove"
  >
    <template #footer>
      <el-button size="small" link type="danger" @click="handleClearAll">
        <el-icon><Delete /></el-icon>
        清空全部
      </el-button>
    </template>
  </ASelectionTags>
</template>
```

### 5. 使用 TypeScript 增强类型安全

明确定义数据类型,避免运行时错误。

```typescript
// ✅ 推荐: 定义明确的接口
interface User {
  userId: number
  userName: string
  email: string
}

const selectedUsers = ref<User[]>([])

const handleRemove = (userId: number) => {
  selectedUsers.value = selectedUsers.value.filter(
    user => user.userId !== userId
  )
}

// ❌ 不推荐: 使用 any 类型
const selectedUsers = ref<any[]>([])
```

## 常见问题

### 1. 标签不显示或显示不正确

**问题原因:**
- `items` 数组为空
- `visible` 属性设置为 `false`
- `keyField` 设置不正确,导致 `v-for` 的 `:key` 异常
- 数据对象缺少显示字段

**解决方案:**

```vue
<template>
  <div class="demo">
    <!-- 1. 确保 items 不为空 -->
    <div v-if="selectedUsers.length === 0">暂无选中项</div>
    <ASelectionTags
      v-else
      :items="selectedUsers"
      key-field="userId"
      :formatter="formatUser"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selectedUsers = ref([
  { userId: 1, userName: '张三' }  // 确保数据结构正确
])

// 2. 确保 keyField 对应的字段存在
// 3. 提供格式化函数确保有内容显示
const formatUser = (user: any) => {
  return user.userName || user.name || '未知用户'
}

const handleRemove = (userId: number) => {
  selectedUsers.value = selectedUsers.value.filter(
    user => user.userId !== userId
  )
}
</script>
```

### 2. close 事件无法正确移除选中项

**问题原因:**
- `keyField` 设置不正确,导致 key 值不匹配
- 移除逻辑中的字段名与 `keyField` 不一致
- ID 类型不匹配(如字符串 vs 数字)

**解决方案:**

```vue
<template>
  <ASelectionTags
    :items="selectedUsers"
    key-field="userId"
    @close="handleRemove"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface User {
  userId: number
  userName: string
}

const selectedUsers = ref<User[]>([
  { userId: 1, userName: '张三' },
  { userId: 2, userName: '李四' }
])

// ✅ 正确: close 事件的 key 参数就是 userId
const handleRemove = (userId: number, item: User) => {
  selectedUsers.value = selectedUsers.value.filter(
    user => user.userId !== userId
  )
}

// ❌ 错误: 使用了错误的字段名
const handleRemoveWrong = (id: number) => {
  selectedUsers.value = selectedUsers.value.filter(
    user => user.id !== id  // 应该使用 userId
  )
}
</script>
```

**类型不匹配处理:**

```typescript
// 如果存在类型不匹配问题,统一转换为字符串比较
const handleRemove = (userId: any, item: User) => {
  selectedUsers.value = selectedUsers.value.filter(
    user => String(user.userId) !== String(userId)
  )
}
```

### 3. 跨页选择状态丢失

**问题原因:**
- 翻页后没有同步表格选中状态
- 选中状态只存储在表格中,没有独立管理
- 切换页面时清空了选择

**解决方案:**

使用 `useSelection` 组合函数管理跨页选择状态。

```vue
<template>
  <div class="demo">
    <ASelectionTags
      :items="selectionItems"
      key-field="userId"
      @close="selectionRemove"
    />

    <el-table
      ref="tableRef"
      :data="userList"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="用户名" prop="userName" />
    </el-table>

    <Pagination
      v-model:page="queryParams.pageNum"
      :total="total"
      @pagination="handlePageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const userList = ref([])

// 使用 useSelection 管理跨页选择
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionRemove
} = useSelection('userId', tableRef, userList, ref(true))

const handlePageChange = async () => {
  await getList()
  // 关键: 翻页后同步选中状态
  await selectionSync()
}

const getList = async () => {
  // 加载数据
}
</script>
```

### 4. 清空按钮不显示

**问题原因:**
- 没有提供 `onClear` 回调函数
- 使用了自定义 `footer` 插槽但没有添加清空按钮

**解决方案:**

```vue
<template>
  <!-- 方式1: 使用 onClear 属性,组件自动显示清空按钮 -->
  <ASelectionTags
    :items="selectedUsers"
    :on-clear="handleClearAll"
    @close="handleRemove"
  />

  <!-- 方式2: 使用 footer 插槽自定义清空按钮 -->
  <ASelectionTags
    :items="selectedUsers"
    @close="handleRemove"
  >
    <template #footer>
      <el-button size="small" link type="primary" @click="handleClearAll">
        <el-icon><Delete /></el-icon>
        清空选择
      </el-button>
    </template>
  </ASelectionTags>
</template>

<script lang="ts" setup>
const handleClearAll = () => {
  selectedUsers.value = []
  // 如果使用了表格选择,还需要清空表格状态
  tableRef.value?.clearSelection()
}
</script>
```

### 5. 自定义标签内容不生效

**问题原因:**
- 插槽使用不正确
- 作用域插槽参数获取错误

**解决方案:**

```vue
<template>
  <!-- ✅ 正确: 使用作用域插槽并正确获取 item -->
  <ASelectionTags
    :items="selectedUsers"
    key-field="userId"
    @close="handleRemove"
  >
    <template #default="{ item }">
      <span class="custom-content">
        <el-avatar :size="20" :src="item.avatar" />
        <span class="ml-2">{{ item.userName }}</span>
      </span>
    </template>
  </ASelectionTags>

  <!-- ❌ 错误: 没有使用作用域插槽 -->
  <ASelectionTags
    :items="selectedUsers"
    key-field="userId"
    @close="handleRemove"
  >
    <template #default>
      <span>固定内容</span>  <!-- 无法访问 item -->
    </template>
  </ASelectionTags>
</template>

<script lang="ts" setup>
interface User {
  userId: number
  userName: string
  avatar: string
}

const selectedUsers = ref<User[]>([])

const handleRemove = (userId: number) => {
  selectedUsers.value = selectedUsers.value.filter(
    user => user.userId !== userId
  )
}
</script>

```
