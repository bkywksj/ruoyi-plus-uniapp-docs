---
title: "ATreeFilter 过滤树组件"
description: "ATreeFilter 是带搜索框的通用树组件，基于 el-tree-v2 虚拟滚动，只渲染可视区节点，搜索带防抖，适合部门、目录这类上千节点的大数据量树形结构，解决 el-tree 全量渲染与逐字过滤导致的卡死。"
---
# ATreeFilter 过滤树组件

## 介绍

ATreeFilter 是一个「卡片 + 搜索框 + 树」的通用过滤树组件，用在页面左侧做分类筛选，例如文件管理页的文件夹目录树。它是部门树 ADeptTree 的底座。

组件内部用 Element Plus 的 `el-tree-v2`（虚拟滚动树）替代 `el-tree`：只渲染可视区里的节点，上千个节点也不会一次性生成全部 DOM。搜索输入加了防抖，连续输入时只在停顿后过滤一次，避免每按一个键就把整棵树遍历一遍、阻塞主线程。

**核心特性：**

- **虚拟滚动** - 基于 `el-tree-v2`，只渲染可视区节点，大数据量下展开全部也不卡
- **搜索防抖** - 输入停顿 `debounce` 毫秒后才过滤，默认 300ms
- **默认展开全部** - `el-tree-v2` 本身没有运行时的「展开全部」，组件在挂载和数据变化时主动展开所有父节点
- **受控展开** - 传入 `expandedKeys` 后以它为准，可在增删节点后保持用户原来的展开状态
- **字段映射** - 通过 `treeProps` 适配不同的数据结构，默认取 `id` / `label` / `children` / `disabled`
- **自定义过滤** - 默认按显示文字大小写不敏感匹配，也可传 `filterMethod` 自定义
- **插槽扩展** - `header` 插槽放标题和操作按钮，默认插槽自定义节点内容，`empty` 插槽自定义空状态

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:1-39`

---

## 基本用法

### 最简用法

传入树数据和高度即可。数据默认按 `{ id, label, children }` 结构读取：

```vue
<template>
  <ATreeFilter :data="treeData" :height="400" title="分类" @node-click="handleNodeClick" />
</template>

<script lang="ts" setup>
const treeData = ref([
  {
    id: 1,
    label: '总部',
    children: [
      { id: 11, label: '研发中心', children: [] },
      { id: 12, label: '市场部', children: [] }
    ]
  }
])

const handleNodeClick = (data: any) => {
  console.log('选中节点:', data.id, data.label)
}
</script>
```

**使用说明:**

- `height` 是虚拟滚动区域的高度（像素），`el-tree-v2` 必须知道它才能计算可视区，务必传一个数字
- 传了 `title` 才会渲染卡片表头；不传 `title` 也不用 `header` 插槽时，卡片没有表头
- 点击节点默认只选中、不展开（`expandOnClickNode` 默认 `false`），展开靠节点前的箭头

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:54-90`

### 字段映射

数据字段名不是 `id` / `label` 时，用 `treeProps` 指定。传入的值会与默认映射合并，只写需要改的字段：

```vue
<template>
  <ATreeFilter
    :data="categoryTree"
    :height="400"
    :tree-props="{ value: 'categoryId', label: 'categoryName' }"
    placeholder="请输入分类名称"
  />
</template>

<script lang="ts" setup>
const categoryTree = ref([
  { categoryId: 1, categoryName: '数码', children: [{ categoryId: 2, categoryName: '手机', children: [] }] }
])
</script>
```

**使用说明:**

- 默认映射是 `{ value: 'id', label: 'label', children: 'children', disabled: 'disabled' }`
- `value` 字段是节点的唯一 key，`setCurrentKey`、`expandedKeys` 用的都是它
- 默认的搜索过滤读的也是映射后的 `label` 字段

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:101-108`

### 自定义表头与节点内容

文件管理页的写法：表头放「文件夹」标题和「新建」按钮，节点前加文件夹图标，鼠标悬停时显示增、改、删按钮：

```vue
<template>
  <ATreeFilter
    ref="directoryTreeRef"
    :data="directories"
    :height="directoryTreeHeight"
    placeholder="请输入文件夹名称"
    @node-click="handleDirectorySelect"
  >
    <!-- 表头：标题 + 新建按钮 -->
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold">文件夹</span>
        <el-button type="primary" link @click="handleAddDirectory">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
      </div>
    </template>

    <!-- 自定义节点：图标 + 悬停显示的操作按钮 -->
    <template #default="{ node, data }">
      <div class="w-full flex justify-between items-center group">
        <span>
          <el-icon class="mr-1"><Folder /></el-icon>
          {{ node.label }}
        </span>
        <span class="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <el-button type="primary" link @click.stop="handleRenameDirectory(data)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button type="primary" link @click.stop="handleDeleteDirectory(data)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </span>
      </div>
    </template>
  </ATreeFilter>
</template>
```

**使用说明:**

- 默认插槽拿到的是 `el-tree-v2` 的 `{ node, data }`：`node.label` 是显示文字，`data` 是原始节点数据
- 节点里的按钮要加 `@click.stop`，否则点按钮也会触发 `node-click`
- 不传默认插槽时用 `el-tree-v2` 的默认渲染（只显示文字）

参考: `plus-ui/src/views/system/oss/oss.vue:8-50`

### 受控展开：增删节点后保持展开状态

目录树在新建、重命名、删除文件夹后要重新加载数据。如果用默认的「展开全部」，每次刷新都会把用户手动折叠的节点又展开。文件管理页的做法是自己记录展开的节点，用 `expandedKeys` 受控：

```vue
<template>
  <ATreeFilter
    :data="directories"
    :height="400"
    :expanded-keys="expandedKeys"
    @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse"
  />
</template>

<script lang="ts" setup>
const directories = ref<any[]>([])
/** 展开的节点 key */
const expandedKeys = ref<(string | number)[]>([])

const handleNodeExpand = (data: any) => {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id)
  }
}

const handleNodeCollapse = (data: any) => {
  const index = expandedKeys.value.indexOf(data.id)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
  }
}
</script>
```

**使用说明:**

- 传了 `expandedKeys`（哪怕是空数组）就以它为准，`defaultExpandAll` 不再生效
- 组件在挂载时、以及 `data` 被**整体替换**时按 `expandedKeys` 重新展开，所以重新加载数据后用户原来的展开状态还在

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:152-169`、`plus-ui/src/views/system/oss/oss.vue:426`、`plus-ui/src/views/system/oss/oss.vue:654-668`

### 自定义过滤方法

默认过滤是「显示文字包含关键词，忽略大小写」。需要按其他字段搜索（如编码、拼音首字母）时传 `filterMethod`：

```vue
<template>
  <ATreeFilter :data="treeData" :height="400" placeholder="名称或编码" :filter-method="filterByNameOrCode" />
</template>

<script lang="ts" setup>
const treeData = ref<any[]>([])

/** 名称或编码命中都显示 */
const filterByNameOrCode = (query: string, data: any) => {
  if (!query) return true
  const q = query.toLowerCase()
  return String(data.label).toLowerCase().includes(q) || String(data.code ?? '').toLowerCase().includes(q)
}
</script>
```

**使用说明:**

- 返回 `true` 的节点显示，`false` 的隐藏
- 关键词为空时要返回 `true`，否则清空搜索框后整棵树都不见了
- 传了 `filterMethod` 就完全替代默认过滤，不会再按 `label` 匹配

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:116-125`

### 重置选中

页面「重置」按钮要连同树的选中高亮一起清掉，用暴露的 `setCurrentKey` 传 `undefined`：

```vue
<template>
  <ATreeFilter ref="treeFilterRef" :data="treeData" :height="400" @node-click="handleNodeClick" />
  <el-button @click="resetQuery">重置</el-button>
</template>

<script lang="ts" setup>
const treeFilterRef = ref()
const treeData = ref<any[]>([])
const queryParams = ref({ categoryId: undefined as number | undefined })

const handleNodeClick = (data: any) => {
  queryParams.value.categoryId = data.id
}

const resetQuery = () => {
  queryParams.value.categoryId = undefined
  treeFilterRef.value?.setCurrentKey(undefined)
}
</script>
```

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:171-181`

---

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 树数据（必填） | `any[]` | — |
| tree-props | 字段映射，与默认值合并 | `TreeFieldProps` | `{}` |
| height | 虚拟滚动区域高度（px） | `number` | `500` |
| title | 卡片表头标题，不传则不渲染表头 | `string` | — |
| placeholder | 搜索框占位文字 | `string` | `'请输入关键词'` |
| debounce | 搜索防抖时长（ms），只在组件创建时读取一次 | `number` | `300` |
| item-size | 单个节点高度（px） | `number` | `30` |
| default-expand-all | 是否默认展开全部，传了 `expanded-keys` 时不生效 | `boolean` | `true` |
| expanded-keys | 受控的展开节点 key 列表 | `Array<string \| number>` | — |
| expand-on-click-node | 点击节点是否展开 / 折叠 | `boolean` | `false` |
| highlight-current | 是否高亮当前选中节点 | `boolean` | `true` |
| filter-method | 自定义过滤方法 | `(query: string, data: any, node: any) => boolean` | — |

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:54-90`

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| node-click | 点击节点 | `data: any, node: any, event?: MouseEvent` |
| node-expand | 展开节点 | `data: any, node: any` |
| node-collapse | 折叠节点 | `data: any, node: any` |

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:92-99`

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| header | 卡片表头，传了它就不再显示 `title` | — |
| default | 自定义节点内容 | `{ node, data }` |
| empty | 无数据时的内容 | — |

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:3-38`

### 暴露方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| setCurrentKey | 设置高亮节点，传 `undefined` 清空选中 | `key?: string \| number` |
| filter | 立即按关键词过滤（不经过防抖，也不改搜索框里的文字） | `value: string` |
| setExpandedKeys | 设置展开的节点 | `keys: Array<string \| number>` |
| getTreeRef | 获取内部 `el-tree-v2` 实例，用于调用组件没有封装的方法 | — |

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:171-181`

### 类型定义

```typescript
/** 字段映射配置（el-tree-v2 的 props，value 为节点唯一 key） */
interface TreeFieldProps {
  value?: string
  label?: string
  children?: string
  disabled?: string
}
```

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:46-52`

---

## 最佳实践

### 1. 高度跟随右侧内容联动

左树右表的页面里，树的高度应和右侧「搜索栏 + 表格」一致，否则两边底部对不齐。用户管理页和文件管理页都用计算属性算高度：

```typescript
/** 树的虚拟滚动高度：搜索栏高度 + 表格高度 + 表头等固定部分 */
const treeHeight = computed(() => (queryFormRef.value?.$el?.offsetHeight || 0) + tableHeight.value + 82)
```

搜索栏展开 / 收起、窗口缩放时表格高度变化，树的高度会跟着变。

参考: `plus-ui/src/views/system/oss/oss.vue:429`

### 2. 和可拖拽面板一起用

左侧树放进 `AResizablePanels` 的 `left` 插槽，用户可以拖动分隔条调整树的宽度：

```vue
<template>
  <AResizablePanels v-model:leftWidth="leftPanelWidth" :min-width="180" :max-width="400">
    <template #left>
      <ATreeFilter :data="treeData" :height="treeHeight" @node-click="handleNodeClick" />
    </template>
    <template #right>
      <!-- 搜索栏与表格 -->
    </template>
  </AResizablePanels>
</template>
```

参考: `plus-ui/src/views/system/oss/oss.vue:5-16`

### 3. 部门树直接用 ADeptTree

部门树的字段、占位文字都已在 ADeptTree 里配好，部门场景用 ADeptTree，其余树形数据（目录、分类、区域）用 ATreeFilter。

参考: `plus-ui/src/components/ADeptTree/ADeptTree.vue:1-19`

---

## 常见问题

### 1. 树是空白的，数据明明有

**问题原因:**

- `height` 传成了 `0` 或非数字。`el-tree-v2` 按高度计算可视区，高度为 0 时一个节点都不渲染
- 用计算属性算高度时，依赖的元素（如搜索栏）还没挂载，算出了很小的值

**解决方案:**

```typescript
// 依赖的元素还没挂载时，用 Math.max 保底一个最小高度
const treeHeight = computed(() => Math.max(300, (queryFormRef.value?.$el?.offsetHeight || 0) + tableHeight.value + 82))
```

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:59-60`

### 2. 往数据里 push 了节点，没有自动展开

**问题原因:**

- 组件监听的是 `data` 的引用，只有整体替换数组时才重新应用展开状态；在原数组上 `push` / `splice` 不会触发

**解决方案:**

```typescript
// 重新加载后整体赋值
const [err, res] = await getTreeData()
if (!err) treeData.value = res
```

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:168-169`

### 3. 改了 debounce 没有效果

**问题原因:**

- 防抖函数在组件创建时用当时的 `debounce` 值生成，之后再改这个属性不会生效

**解决方案:**

- 在模板里直接写死需要的值（如 `:debounce="500"`）；确实要动态切换时，给组件加 `key` 让它重新创建

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:132-133`

### 4. 传了 default-expand-all 还是没展开

**问题原因:**

- 同时传了 `expanded-keys`。只要传了它（包括空数组），展开状态就以它为准

**解决方案:**

- 二选一：要「展开全部」就别传 `expanded-keys`；要受控展开就自己维护 `expanded-keys`

参考: `plus-ui/src/components/ATreeFilter/ATreeFilter.vue:159-166`
