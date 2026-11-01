---
title: "ADeptTree 部门树组件"
description: "ADeptTree 是带搜索框的部门树，基于 ATreeFilter 预置部门字段与文案，虚拟滚动 + 搜索防抖，部门上千个也不卡；用于用户管理等左树右表页面按部门筛选。"
---
# ADeptTree 部门树组件

## 介绍

ADeptTree 是专门展示部门的树组件，用在用户管理、岗位管理、角色分配用户等页面左侧，点击部门后右侧列表按部门筛选。

它是在通用过滤树 ATreeFilter 外面包的一层：部门数据（`SysDeptTreeVo`）的字段正好是 `id` / `label` / `children` / `disabled`，与 ATreeFilter 的默认映射一致，所以不用配字段映射；搜索框占位文字默认就是「请输入部门名称」。虚拟滚动、搜索防抖、默认展开全部这些能力都来自 ATreeFilter。

**核心特性：**

- **开箱即用** - 只要传部门树数据和高度，字段映射和占位文字都已预置
- **虚拟滚动** - 底层是 `el-tree-v2`，只渲染可视区节点，部门数量多也不卡
- **搜索防抖** - 输入停顿 300ms 后才过滤，按部门名称大小写不敏感匹配
- **类型明确** - `node-click` 回调参数是 `SysDeptTreeVo`，取 `data.id` 即部门 ID
- **可重置** - 暴露 `setCurrentKey`，页面「重置」时可清掉树的选中高亮

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:1-65`

---

## 基本用法

### 用户管理页的写法

左侧部门树、右侧用户列表，点击部门后按部门查询：

```vue
<template>
  <AResizablePanels v-model:leftWidth="leftPanelWidth" :min-width="200" :max-width="500">
    <template #left>
      <ADeptTree ref="deptTreeRef" :data="deptOptions" :height="deptTreeHeight" @node-click="handleNodeClick" />
    </template>
    <template #right>
      <!-- 搜索栏与用户表格 -->
    </template>
  </AResizablePanels>
</template>

<script lang="ts" setup>
import { getDeptTreeOptions } from '@/api/system/core/dept/deptApi'
import type { SysDeptTreeVo } from '@/api/system/core/dept/deptTypes'

const leftPanelWidth = ref(260)
const deptTreeRef = ref()
/** 部门树数据 */
const deptOptions = ref<SysDeptTreeVo[]>([])
/** 部门树高度：与右侧搜索栏 + 表格高度联动 */
const deptTreeHeight = computed(() => (queryFormRef.value?.$el?.offsetHeight || 0) + tableHeight.value + 82)

const queryParams = ref({ deptId: undefined as string | number | undefined })

/** 点击部门：按部门查询 */
const handleNodeClick = (data: SysDeptTreeVo) => {
  queryParams.value.deptId = data.id
  handleQuery()
}

/** 加载部门树 */
const loadDeptTree = async () => {
  const [err, data] = await getDeptTreeOptions()
  if (!err) deptOptions.value = data
}

onMounted(loadDeptTree)
</script>
```

**使用说明:**

- 部门树数据来自 `getDeptTreeOptions()`，返回值直接赋给 `data`
- `height` 是虚拟滚动区域的高度（像素），必须是数字；左树右表时让它跟右侧内容联动，两边底部才能对齐
- 示例里的 `queryFormRef`、`tableHeight`、`handleQuery` 是页面自己的搜索栏、表格高度和查询方法

参考: `plus-ui/src/views/system/core/user/user.vue:5-14`、`plus-ui/src/views/system/core/user/user.vue:313-333`

### 重置时清掉选中

页面「重置」按钮除了清空查询条件，还要清掉树上高亮的部门：

```typescript
/** 重置按钮 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.value.pageNum = 1
  queryParams.value.deptId = undefined
  // 传 undefined 清空选中
  deptTreeRef.value?.setCurrentKey(undefined)
  handleQuery()
}
```

参考: `plus-ui/src/views/system/core/user/user.vue:301-311`

### 带表头

传 `title` 显示卡片表头；要在表头放按钮，用 `header` 插槽：

```vue
<template>
  <!-- 只要标题 -->
  <ADeptTree :data="deptOptions" :height="400" title="部门" />

  <!-- 标题 + 按钮 -->
  <ADeptTree :data="deptOptions" :height="400">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold">部门</span>
        <el-button type="primary" link @click="loadDeptTree">刷新</el-button>
      </div>
    </template>
  </ADeptTree>
</template>
```

**使用说明:**

- 不传 `title` 也不用 `header` 插槽时不显示表头（用户管理页就是这样）
- ADeptTree 只透传 `header` 插槽；要自定义节点内容（图标、操作按钮）请直接用 ATreeFilter

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:14-17`

---

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 部门树数据（必填） | `SysDeptTreeVo[]` | — |
| height | 虚拟滚动区域高度（px） | `number` | `500` |
| title | 卡片表头标题，不传则不渲染表头 | `string` | — |
| placeholder | 搜索框占位文字 | `string` | `'请输入部门名称'` |
| debounce | 搜索防抖时长（ms） | `number` | `300` |
| item-size | 单个节点高度（px） | `number` | `30` |
| default-expand-all | 是否默认展开全部 | `boolean` | `true` |

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:26-49`

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| node-click | 点击部门 | `data: SysDeptTreeVo` |

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:51-54`

### Slots

| 插槽名 | 说明 |
|--------|------|
| header | 卡片表头，传了它就不再显示 `title` |

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:14-17`

### 暴露方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| setCurrentKey | 设置高亮的部门，传 `undefined` 清空选中 | `key?: string \| number` |
| filter | 立即按关键词过滤（不经过防抖，也不改搜索框里的文字） | `value: string` |

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:59-65`

### 类型定义

```typescript
/** 部门树节点（getDeptTreeOptions 的返回项） */
export interface SysDeptTreeVo {
  /** 部门 ID */
  id: number | string
  /** 部门名称 */
  label: string
  /** 父部门 ID */
  parentId: number | string
  /** 排序 */
  weight: number
  /** 子部门 */
  children: SysDeptTreeVo[]
  /** 是否禁用 */
  disabled: boolean
}
```

参考: `plus-ui/src/api/system/core/dept/deptTypes.ts:109-122`

---

## 与 ATreeFilter 的区别

| 需求 | 用哪个 |
|------|--------|
| 部门树，点击后按部门筛选 | ADeptTree |
| 部门之外的树（目录、分类、区域） | ATreeFilter |
| 要改字段映射（数据不是 `id` / `label`） | ATreeFilter |
| 要自定义节点内容、受控展开、自定义过滤方法 | ATreeFilter |
| 要监听节点展开 / 折叠 | ATreeFilter |

ADeptTree 只开放了部门场景常用的几个属性，其余能力（`tree-props`、`expanded-keys`、`filter-method`、默认插槽、`node-expand` / `node-collapse` 事件、`setExpandedKeys`）都在 ATreeFilter 上。

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:3-13`

---

## 常见问题

### 1. 树是空白的

**问题原因:**

- `height` 是 `0` 或不是数字，虚拟滚动没有可视区，一个节点也不渲染
- 部门数据还没加载回来，或接口报错

**解决方案:**

```typescript
// 高度保底，避免依赖的元素未挂载时算出 0
const deptTreeHeight = computed(() => Math.max(300, (queryFormRef.value?.$el?.offsetHeight || 0) + tableHeight.value + 82))
```

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:59-60`

### 2. 部门很多，不想默认全部展开

**问题原因:**

- `default-expand-all` 默认为 `true`

**解决方案:**

```vue
<template>
  <ADeptTree :data="deptOptions" :height="400" :default-expand-all="false" />
</template>
```

虚拟滚动下展开全部也不会卡，关掉只是为了让列表更短。

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:39-48`
