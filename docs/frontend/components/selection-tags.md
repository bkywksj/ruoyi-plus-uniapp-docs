# 选择标签 ASelectionTags

## 介绍

ASelectionTags 是一个用于展示选中项的标签列表组件，常用于多选场景下展示已选择的数据项，如用户选择器、角色选择器、权限分配等场景。组件基于 Element Plus 的 `el-tag` 组件封装，提供了更符合业务需求的选择标签功能。

组件主要用于与表格多选功能配合使用，通过标签形式直观展示已选中的数据项，用户可以通过点击标签上的关闭按钮移除单个选项，或通过清空按钮一次性移除所有选项。组件内置了与 `useSelection` 组合函数的完美集成，能够自动同步选择状态，实现跨页选择的标签展示。

**核心特性:**

- **灵活展示** - 支持多种标签类型、尺寸和效果，满足不同视觉需求
- **自定义内容** - 提供插槽支持，可以自定义标签内容、头部和尾部区域
- **智能格式化** - 内置智能文本提取逻辑，自动从常见字段中提取显示文本
- **删除操作** - 支持单个标签删除和批量清空，提供灵活的操作方式
- **无缝集成** - 与 useSelection 组合函数完美配合，实现跨页选择管理
- **可控显示** - 支持通过 visible 属性控制整体显示状态
- **类型安全** - 完整的 TypeScript 类型定义，提供良好的开发体验

## 基本用法

### 简单展示

最基础的用法是传入选中项数组，组件会自动渲染为标签列表。

```vue
<template>
  <div>
    <ASelectionTags :items="selectedItems" @close="handleRemove" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedItems = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const handleRemove = (key: any, item: any) => {
  console.log('移除项:', key, item)
  selectedItems.value = selectedItems.value.filter(i => i.id !== key)
}
</script>
```

组件会自动从对象中提取 `name`、`label`、`title` 等常见字段作为显示文本，无需手动指定格式化函数。

### 自定义主键字段

默认情况下，组件使用 `id` 字段作为唯一标识。如果数据对象使用其他字段作为主键，可以通过 `keyField` 属性指定。

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectedUsers"
      key-field="userId"
      @close="handleRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedUsers = ref([
  { userId: '1001', userName: '管理员' },
  { userId: '1002', userName: '普通用户' }
])

const handleRemove = (userId: string) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.userId !== userId)
}
</script>
```

这在处理用户、角色等业务对象时非常有用，可以适配不同的数据结构。

### 自定义文本格式化

通过 `formatter` 属性可以自定义标签的显示文本，支持组合多个字段或进行格式化处理。

```vue
<template>
  <div>
    <!-- 显示用户名和部门 -->
    <ASelectionTags
      :items="selectedUsers"
      key-field="userId"
      :formatter="formatUserText"
      @close="handleRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  userId: string
  userName: string
  deptName?: string
}

const selectedUsers = ref<User[]>([
  { userId: '1', userName: '张三', deptName: '技术部' },
  { userId: '2', userName: '李四', deptName: '市场部' }
])

const formatUserText = (user: User): string => {
  return user.deptName ? `${user.userName} (${user.deptName})` : user.userName
}

const handleRemove = (userId: string) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.userId !== userId)
}
</script>
```

formatter 函数可以实现复杂的文本格式化逻辑，如添加前缀、后缀、单位等。

### 标签样式配置

组件支持配置标签的类型、尺寸、效果和颜色，提供丰富的视觉呈现。

```vue
<template>
  <div class="space-y-4">
    <!-- 不同类型 -->
    <ASelectionTags :items="items" type="success" />
    <ASelectionTags :items="items" type="primary" />
    <ASelectionTags :items="items" type="warning" />
    <ASelectionTags :items="items" type="danger" />
    <ASelectionTags :items="items" type="info" />

    <!-- 不同效果 -->
    <ASelectionTags :items="items" effect="dark" />
    <ASelectionTags :items="items" effect="light" />
    <ASelectionTags :items="items" effect="plain" />

    <!-- 不同尺寸 -->
    <ASelectionTags :items="items" size="large" />
    <ASelectionTags :items="items" size="default" />
    <ASelectionTags :items="items" size="small" />

    <!-- 自定义颜色 -->
    <ASelectionTags :items="items" color="#f56c6c" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  { id: 1, name: '标签一' },
  { id: 2, name: '标签二' }
])
</script>
```

通过组合不同的样式属性，可以适配各种设计需求和视觉风格。

### 添加头部说明

使用 `header` 插槽可以在标签列表前添加说明文字或其他内容。

```vue
<template>
  <div>
    <ASelectionTags :items="selectedUsers" @close="handleRemove">
      <template #header>
        <div class="text-sm text-gray-500 mb-2">
          已选择用户 ({{ selectedUsers.length }}/10)
        </div>
      </template>
    </ASelectionTags>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedUsers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
])

const handleRemove = (key: any) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== key)
}
</script>
```

header 插槽适合展示选择数量、限制说明、提示信息等辅助内容。

### 清空功能

通过 `onClear` 属性传入清空回调函数，组件会自动显示清空按钮。

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectedItems"
      :on-clear="handleClearAll"
      @close="handleRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const selectedItems = ref([
  { id: 1, name: '项目A' },
  { id: 2, name: '项目B' },
  { id: 3, name: '项目C' }
])

const handleRemove = (key: any) => {
  selectedItems.value = selectedItems.value.filter(i => i.id !== key)
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有选择吗？', '提示')
    selectedItems.value = []
  } catch {
    // 用户取消
  }
}
</script>
```

清空按钮只有在提供了 `onClear` 回调时才会显示，避免不必要的 UI 元素。

### 自定义标签内容

使用默认插槽可以完全自定义标签的显示内容，实现更复杂的展示需求。

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectedUsers"
      key-field="userId"
      @close="handleRemove"
    >
      <template #default="{ item }">
        <div class="flex items-center gap-1">
          <el-avatar :size="20" :src="item.avatar" />
          <span>{{ item.userName }}</span>
          <el-tag v-if="item.online" size="small" type="success">在线</el-tag>
        </div>
      </template>
    </ASelectionTags>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  userId: string
  userName: string
  avatar: string
  online: boolean
}

const selectedUsers = ref<User[]>([
  {
    userId: '1',
    userName: '张三',
    avatar: 'https://example.com/avatar1.jpg',
    online: true
  },
  {
    userId: '2',
    userName: '李四',
    avatar: 'https://example.com/avatar2.jpg',
    online: false
  }
])

const handleRemove = (userId: string) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.userId !== userId)
}
</script>
```

默认插槽接收 `item` 参数，包含当前标签对应的完整数据对象，可以访问对象的所有属性。

### 自定义尾部内容

使用 `footer` 插槽可以在标签列表后添加自定义操作按钮或其他内容，替换默认的清空按钮。

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectedItems"
      @close="handleRemove"
    >
      <template #footer>
        <div class="flex gap-2">
          <el-button size="small" link type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出选择
          </el-button>
          <el-button size="small" link type="danger" @click="handleClearAll">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </template>
    </ASelectionTags>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Delete } from '@element-plus/icons-vue'

const selectedItems = ref([
  { id: 1, name: '数据1' },
  { id: 2, name: '数据2' }
])

const handleRemove = (key: any) => {
  selectedItems.value = selectedItems.value.filter(i => i.id !== key)
}

const handleExport = () => {
  console.log('导出数据:', selectedItems.value)
}

const handleClearAll = () => {
  selectedItems.value = []
}
</script>
```

footer 插槽提供了更灵活的操作区域定制能力。

### 控制显示状态

通过 `visible` 属性可以控制组件的显示和隐藏，支持条件渲染。

```vue
<template>
  <div>
    <el-switch
      v-model="showTags"
      active-text="显示标签"
      inactive-text="隐藏标签"
    />

    <ASelectionTags
      :items="selectedItems"
      :visible="showTags"
      @close="handleRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showTags = ref(true)

const selectedItems = ref([
  { id: 1, name: '项目A' },
  { id: 2, name: '项目B' }
])

const handleRemove = (key: any) => {
  selectedItems.value = selectedItems.value.filter(i => i.id !== key)
}
</script>
```

当 `visible` 为 `false` 或选中项数组为空时，组件不会渲染任何内容。

### 禁用删除功能

设置 `closable` 为 `false` 可以禁用标签的删除功能，仅用于展示。

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectedItems"
      :closable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedItems = ref([
  { id: 1, name: '只读标签1' },
  { id: 2, name: '只读标签2' }
])
</script>
```

这在只读模式或预览场景下非常有用，避免用户误操作。

### 与表格选择集成

ASelectionTags 组件与 `useSelection` 组合函数完美配合，实现表格多选场景下的标签展示。

```vue
<template>
  <div>
    <!-- 标签展示区 -->
    <ASelectionTags
      :items="selectionItems"
      key-field="userId"
      :formatter="(user) => user.userName"
      :on-clear="selectionClear"
      @close="selectionRemove"
    />

    <!-- 用户表格 -->
    <el-table
      ref="tableRef"
      :data="userList"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="deptName" label="部门" />
    </el-table>

    <el-pagination
      v-model:current-page="pageNum"
      :total="total"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface User {
  userId: string
  userName: string
  deptName: string
}

const tableRef = ref()
const userList = ref<User[]>([])
const pageNum = ref(1)
const total = ref(0)

// 使用 useSelection 管理选择状态
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionRemove,
  selectionClear
} = useSelection<User>('userId', tableRef, userList, ref(true))

// 页面切换时同步选中状态
const handlePageChange = async () => {
  await fetchUserList()
  await selectionSync()
}

const fetchUserList = async () => {
  // 获取用户列表数据
  // userList.value = ...
}
</script>
```

通过这种集成方式，可以轻松实现跨页多选、标签移除、批量清空等复杂功能。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 要展示的选中项数组 | `any[]` | `[]` |
| closable | 是否可关闭，为 true 时标签右侧会显示关闭图标 | `boolean` | `true` |
| visible | 是否显示组件，为 false 时整个组件将不显示 | `boolean` | `true` |
| type | 标签类型，与 Element Plus Tag 组件类型一致 | `'success' \| 'primary' \| 'warning' \| 'danger' \| 'info'` | `'success'` |
| effect | 标签效果，影响标签的显示效果 | `'light' \| 'dark' \| 'plain'` | `'light'` |
| size | 标签大小，控制标签的尺寸 | `'large' \| 'default' \| 'small'` | `'default'` |
| color | 标签自定义颜色，会覆盖 type 属性设置的颜色 | `string` | `''` |
| keyField | 主键字段名，用于从每个项中提取唯一标识符 | `string` | `'id'` |
| formatter | 文本格式化函数，用于从每个项中提取显示文本 | `(item: any) => string` | 自动提取 |
| onClear | 清空选择的回调函数，提供后会显示清空按钮 | `() => void` | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 点击标签关闭按钮时触发 | `(key: any, item: any)` |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| header | 自定义标签列表头部内容 | - |
| default | 自定义标签内容 | `{ item }` |
| footer | 自定义标签列表尾部内容 | - |

### 类型定义

```typescript
/**
 * ASelectionTags 组件属性接口
 */
interface ASelectionTagsProps {
  /**
   * 要展示的选中项数组
   * 每个项应该是一个对象，包含唯一标识符和显示信息
   */
  items: any[]

  /**
   * 是否可关闭
   * @default true
   */
  closable?: boolean

  /**
   * 是否显示
   * @default true
   */
  visible?: boolean

  /**
   * 标签类型
   * @default 'success'
   */
  type?: 'success' | 'primary' | 'warning' | 'danger' | 'info'

  /**
   * 标签效果
   * @default 'light'
   */
  effect?: 'light' | 'dark' | 'plain'

  /**
   * 标签大小
   * @default 'default'
   */
  size?: 'large' | 'default' | 'small'

  /**
   * 标签颜色
   * @default ''
   */
  color?: string

  /**
   * 主键字段名
   * @default 'id'
   */
  keyField?: string

  /**
   * 文本格式化函数
   */
  formatter?: (item: any) => string

  /**
   * 清空选择的回调函数
   */
  onClear?: () => void
}

/**
 * 默认格式化函数
 * 按优先级尝试提取: label > name > title > value > text > key > keyField > JSON
 */
type DefaultFormatter = (item: any, keyField: string) => string
```

## 主题定制

### CSS 变量

ASelectionTags 组件的样式主要依赖 Element Plus 的 Tag 组件，可以通过覆盖 Element Plus 的 CSS 变量来定制主题。

```css
/* 覆盖标签颜色 */
:root {
  --el-tag-bg-color: #f0f9ff;
  --el-tag-border-color: #b3d8ff;
  --el-tag-text-color: #409eff;
  --el-tag-hover-color: #66b1ff;
}

/* 暗黑模式 */
html.dark {
  --el-tag-bg-color: #1d2127;
  --el-tag-border-color: #30363d;
  --el-tag-text-color: #c9d1d9;
}
```

### 自定义样式

可以通过全局样式或局部样式来调整标签的间距、圆角等属性。

```vue
<template>
  <div class="custom-selection-tags">
    <ASelectionTags :items="items" />
  </div>
</template>

<style scoped>
.custom-selection-tags :deep(.el-tag) {
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 16px;
  padding: 0 16px;
}

.custom-selection-tags :deep(.el-tag .el-icon) {
  margin-left: 6px;
}
</style>
```

### 响应式设计

在不同屏幕尺寸下调整标签的显示。

```vue
<template>
  <div class="responsive-tags">
    <ASelectionTags
      :items="items"
      :size="tagSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

const tagSize = computed(() => {
  if (width.value < 768) return 'small'
  if (width.value < 1024) return 'default'
  return 'large'
})

const items = ref([
  { id: 1, name: '标签1' },
  { id: 2, name: '标签2' }
])
</script>

<style scoped>
@media (max-width: 768px) {
  .responsive-tags :deep(.el-tag) {
    margin-right: 4px;
    margin-bottom: 4px;
  }
}
</style>
```

## 最佳实践

### 1. 配合 useSelection 使用

ASelectionTags 组件设计之初就是为了与 `useSelection` 组合函数配合使用，这是最推荐的用法。

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectionItems"
      key-field="userId"
      :formatter="(user) => user.userName"
      :on-clear="selectionClear"
      @close="selectionRemove"
    >
      <template #header>
        <span class="text-sm text-gray-500 mb-2 block">
          已选择 {{ selectionItems.length }} 个用户
        </span>
      </template>
    </ASelectionTags>

    <el-table
      ref="tableRef"
      :data="userList"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userName" label="用户名" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const userList = ref([])

const {
  selectionItems,
  selectionChange,
  selectionRemove,
  selectionClear
} = useSelection('userId', tableRef, userList, ref(true))
</script>
```

这种方式能够自动处理跨页选择、状态同步等复杂逻辑。

### 2. 合理使用格式化函数

对于复杂的显示需求，使用 `formatter` 函数而不是插槽，可以保持代码简洁。

```typescript
// ✅ 推荐：使用 formatter
const formatter = (user: User) => {
  const parts = [user.userName]
  if (user.deptName) parts.push(`(${user.deptName})`)
  if (user.roleName) parts.push(`[${user.roleName}]`)
  return parts.join(' ')
}

// ❌ 不推荐：简单场景使用插槽会增加代码复杂度
```

只有在需要渲染图标、头像等非文本内容时，才使用默认插槽。

### 3. 提供清空确认

在清空操作前提供二次确认，避免用户误操作。

```typescript
import { ElMessageBox } from 'element-plus'

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要清空已选择的 ${selectionItems.value.length} 项吗？`,
      '清空确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    selectionClear()
  } catch {
    // 用户取消操作
  }
}
```

### 4. 处理大量选中项

当选中项数量很多时，考虑限制显示数量或提供折叠功能。

```vue
<template>
  <div>
    <ASelectionTags
      :items="displayItems"
      @close="handleRemove"
    >
      <template #header>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">
            已选择 {{ selectedItems.length }} 项
            <span v-if="selectedItems.length > maxDisplay">
              (仅显示前 {{ maxDisplay }} 项)
            </span>
          </span>
          <el-button
            v-if="selectedItems.length > maxDisplay"
            size="small"
            link
            @click="showAll = !showAll"
          >
            {{ showAll ? '收起' : '展开全部' }}
          </el-button>
        </div>
      </template>
    </ASelectionTags>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedItems = ref([/* ... 大量数据 */])
const showAll = ref(false)
const maxDisplay = 10

const displayItems = computed(() => {
  return showAll.value
    ? selectedItems.value
    : selectedItems.value.slice(0, maxDisplay)
})

const handleRemove = (key: any) => {
  selectedItems.value = selectedItems.value.filter(i => i.id !== key)
}
</script>
```

### 5. 统一主键字段命名

在整个项目中统一使用相同的主键字段命名，可以减少配置工作。

```typescript
// ✅ 推荐：项目中统一使用 id 作为主键
interface BaseEntity {
  id: string | number
  // ...
}

// 或者使用类型映射统一处理
type WithKey<T, K extends string> = T & Record<K, string | number>
```

## 常见问题

### 1. 标签没有显示

**问题原因:**
- items 数组为空
- visible 属性设置为 false
- 数据对象中没有可识别的显示字段

**解决方案:**

```vue
<script setup lang="ts">
// 1. 确保 items 数组有数据
console.log('items:', items.value)

// 2. 检查 visible 属性
const visible = ref(true)

// 3. 提供 formatter 函数显式指定显示字段
const formatter = (item: any) => {
  return item.customField || '未命名'
}
</script>
```

### 2. close 事件回调参数不正确

**问题原因:**
- 没有理解 close 事件返回两个参数 (key, item)
- keyField 设置不正确导致 key 值异常

**解决方案:**

```vue
<script setup lang="ts">
// close 事件返回两个参数
const handleRemove = (key: any, item: any) => {
  console.log('主键:', key)      // keyField 对应的值
  console.log('完整对象:', item) // 完整的数据对象

  // 使用 key 进行删除（推荐）
  selectedItems.value = selectedItems.value.filter(i => i.userId !== key)

  // 或使用 item 进行删除
  selectedItems.value = selectedItems.value.filter(i => i !== item)
}
</script>
```

### 3. 标签内容显示为 [object Object]

**问题原因:**
- 数据对象没有常见的文本字段 (label/name/title 等)
- 未提供 formatter 函数进行文本提取

**解决方案:**

```vue
<script setup lang="ts">
// 方案1: 提供 formatter 函数
const formatter = (item: any) => {
  return item.customName || item.displayText || String(item.id)
}

// 方案2: 使用默认插槽自定义显示
</script>

<template>
  <ASelectionTags :items="items">
    <template #default="{ item }">
      {{ item.customName }}
    </template>
  </ASelectionTags>
</template>
```

### 4. 清空按钮不显示

**问题原因:**
- 未提供 `onClear` 属性

**解决方案:**

```vue
<template>
  <!-- 方案1: 提供 onClear 回调 -->
  <ASelectionTags
    :items="items"
    :on-clear="handleClear"
  />

  <!-- 方案2: 使用 footer 插槽自定义清空按钮 -->
  <ASelectionTags :items="items">
    <template #footer>
      <el-button size="small" link type="danger" @click="handleClear">
        清空选择
      </el-button>
    </template>
  </ASelectionTags>
</template>

<script setup lang="ts">
const handleClear = () => {
  items.value = []
}
</script>
```

### 5. 与 useSelection 集成后状态不同步

**问题原因:**
- 未调用 `selectionSync` 同步表格状态
- 分页切换后未重新同步
- keyField 设置不一致

**解决方案:**

```vue
<script setup lang="ts">
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const userList = ref([])

// 确保 keyField 一致
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionRemove,
  selectionClear
} = useSelection('userId', tableRef, userList, ref(true))

// 数据加载完成后同步状态
const loadData = async () => {
  await fetchUserList()
  await nextTick()
  await selectionSync() // ✅ 关键：同步表格选中状态
}

// 分页切换时同步
const handlePageChange = async () => {
  await loadData()
}
</script>

<template>
  <!-- keyField 保持一致 -->
  <ASelectionTags
    :items="selectionItems"
    key-field="userId"
    @close="selectionRemove"
  />
</template>
```

确保在数据加载完成、分页切换、标签移除等操作后正确调用相关方法进行状态同步。
