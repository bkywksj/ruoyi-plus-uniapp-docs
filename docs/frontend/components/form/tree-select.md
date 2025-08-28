# AFormTreeSelect 树形选择组件

AFormTreeSelect 是一个功能丰富的树形选择组件，基于 Element Plus 的 ElTreeSelect 封装。它适用于层级结构数据的选择，如组织架构、菜单权限、分类目录等场景。

## 基础用法

### 单选模式

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormTreeSelect 
    v-model="queryParams.parentId" 
    :data="treeOptions" 
    label="父级" 
    prop="parentId" 
    @change="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormTreeSelect 
    v-model="form.parentId" 
    :data="deptTree" 
    label="上级部门" 
    prop="parentId"
    :props="{ value: 'deptId', label: 'deptName', children: 'children' }" 
    :span="12" 
  />
</template>

<script setup>
const deptTree = [
  {
    deptId: '1',
    deptName: '总公司',
    children: [
      {
        deptId: '1-1',
        deptName: '技术部',
        children: [
          { deptId: '1-1-1', deptName: '前端组' },
          { deptId: '1-1-2', deptName: '后端组' }
        ]
      },
      {
        deptId: '1-2',
        deptName: '销售部',
        children: [
          { deptId: '1-2-1', deptName: '华北区' },
          { deptId: '1-2-2', deptName: '华南区' }
        ]
      }
    ]
  }
]

const form = reactive({
  parentId: ''
})
</script>
```

### 多选模式

```vue
<template>
  <AFormTreeSelect 
    v-model="form.permissionIds" 
    :data="permissionTree" 
    label="权限" 
    prop="permissionIds"
    :multiple="true" 
    :show-checkbox="true" 
    :span="12" 
  />
</template>

<script setup>
const permissionTree = [
  {
    id: '1',
    label: '系统管理',
    children: [
      {
        id: '1-1',
        label: '用户管理',
        children: [
          { id: '1-1-1', label: '查看用户' },
          { id: '1-1-2', label: '添加用户' },
          { id: '1-1-3', label: '编辑用户' },
          { id: '1-1-4', label: '删除用户' }
        ]
      },
      {
        id: '1-2',
        label: '角色管理',
        children: [
          { id: '1-2-1', label: '查看角色' },
          { id: '1-2-2', label: '分配权限' }
        ]
      }
    ]
  },
  {
    id: '2',
    label: '业务管理',
    children: [
      { id: '2-1', label: '订单管理' },
      { id: '2-2', label: '商品管理' }
    ]
  }
]

const form = reactive({
  permissionIds: []
})
</script>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| Array` | `null` | 绑定值 |
| `data` | `Array` | `[]` | 树形数据源 |
| `props` | `TreeNodeProps` | `{ value: 'id', label: 'label', children: 'children' }` | 节点属性配置 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项 |

### 节点配置属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `valueKey` | `string` | `'id'` | 唯一标识字段 |
| `nodeKey` | `string` | `'id'` | 节点唯一标识 |
| `checkStrictly` | `boolean` | `true` | 是否严格模式 |
| `defaultExpandAll` | `boolean` | `false` | 是否默认展开所有节点 |
| `accordion` | `boolean` | `false` | 是否每次只展开一个节点 |

### 显示属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | - | 占位符文本 |
| `size` | `ElSize` | `''` | 组件尺寸 |
| `clearable` | `boolean` | `true` | 是否可清空 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `filterable` | `boolean` | `false` | 是否可搜索 |

### 多选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `multiple` | `boolean` | `false` | 是否多选 |
| `showCheckbox` | `boolean` | `false` | 是否显示复选框 |
| `checkDescendants` | `boolean` | `false` | 是否级联选择子节点 |
| `onlyCheckChildren` | `boolean` | `false` | 是否只选择子节点 |

### 高级属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lazy` | `boolean` | `false` | 是否懒加载 |
| `load` | `Function` | - | 懒加载方法 |
| `renderAfterExpand` | `boolean` | `true` | 是否展开后渲染子节点 |
| `highlightCurrent` | `boolean` | `false` | 是否高亮当前选中节点 |

## 使用示例

### 带提示信息的树形选择

```vue
<template>
  <AFormTreeSelect 
    v-model="form.parentId" 
    :data="deptTree" 
    label="上级部门" 
    prop="parentId"
    tooltip="选择该部门的上级部门，不选则为顶级部门" 
    :span="12" 
  />
</template>
```

### 不含表单项的简单选择器

```vue
<template>
  <AFormTreeSelect 
    v-model="selectedDept" 
    :data="deptTree" 
    placeholder="请选择部门"
    :show-form-item="false" 
    clearable
  />
</template>
```

### 自定义节点属性

```vue
<template>
  <AFormTreeSelect 
    v-model="form.categoryId" 
    :data="categoryTree" 
    label="商品分类" 
    prop="categoryId"
    :props="{ 
      value: 'categoryId', 
      label: 'categoryName', 
      children: 'subCategories',
      disabled: 'isDisabled'
    }" 
    :span="12" 
  />
</template>

<script setup>
const categoryTree = [
  {
    categoryId: '1',
    categoryName: '电子产品',
    isDisabled: false,
    subCategories: [
      {
        categoryId: '1-1',
        categoryName: '手机',
        isDisabled: false,
        subCategories: [
          { categoryId: '1-1-1', categoryName: 'iPhone', isDisabled: false },
          { categoryId: '1-1-2', categoryName: '华为', isDisabled: true }
        ]
      }
    ]
  }
]
</script>
```

### 可搜索的树形选择

```vue
<template>
  <AFormTreeSelect 
    v-model="form.userId" 
    :data="userTree" 
    label="负责人" 
    prop="userId"
    :filterable="true"
    placeholder="输入姓名搜索用户"
    :span="12" 
  />
</template>
```

### 严格模式与非严格模式

```vue
<template>
  <!-- 严格模式：父子节点不关联 -->
  <AFormTreeSelect 
    v-model="form.strictPermissions" 
    :data="permissionTree" 
    label="严格权限选择" 
    prop="strictPermissions"
    :multiple="true" 
    :show-checkbox="true"
    :check-strictly="true"
    :span="12" 
  />
  
  <!-- 非严格模式：选中父节点会自动选中子节点 -->
  <AFormTreeSelect 
    v-model="form.cascadePermissions" 
    :data="permissionTree" 
    label="级联权限选择" 
    prop="cascadePermissions"
    :multiple="true" 
    :show-checkbox="true"
    :check-strictly="false"
    :span="12" 
  />
</template>
```

### 懒加载树形数据

```vue
<template>
  <AFormTreeSelect 
    v-model="form.deptId" 
    :data="lazyTree" 
    label="部门" 
    prop="deptId"
    :lazy="true"
    :load="loadNode"
    :span="12" 
  />
</template>

<script setup>
const lazyTree = ref([
  { id: '1', label: '一级部门A', leaf: false },
  { id: '2', label: '一级部门B', leaf: false }
])

const loadNode = (node, resolve) => {
  if (node.level === 0) {
    // 加载根节点
    resolve(lazyTree.value)
  } else {
    // 根据节点ID异步加载子节点
    setTimeout(() => {
      const children = [
        { id: `${node.data.id}-1`, label: `${node.data.label}-子部门1`, leaf: true },
        { id: `${node.data.id}-2`, label: `${node.data.label}-子部门2`, leaf: true }
      ]
      resolve(children)
    }, 500)
  }
}
</script>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormTreeSelect 
    v-model="form.deptId" 
    :data="deptTree" 
    label="部门"
    @change="handleChange"
    @visible-change="handleVisibleChange"
    @clear="handleClear"
    @remove-tag="handleRemoveTag"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
const handleChange = (value, data, node) => {
  console.log('选择变化：', { value, data, node })
}

const handleVisibleChange = (visible) => {
  console.log('下拉框显示状态：', visible)
}

const handleClear = () => {
  console.log('清除选择')
}

const handleRemoveTag = (value) => {
  console.log('移除标签：', value)
}

const handleFocus = (event) => {
  console.log('获得焦点')
}

const handleBlur = (event) => {
  console.log('失去焦点')
}
</script>
```

### 节点操作事件

```vue
<template>
  <AFormTreeSelect 
    v-model="form.nodeIds" 
    :data="nodeTree" 
    label="节点选择"
    :multiple="true"
    @node-click="handleNodeClick"
    @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse"
  />
</template>

<script setup>
const handleNodeClick = (data, node, component) => {
  console.log('节点点击：', { data, node })
}

const handleNodeExpand = (data, node, component) => {
  console.log('节点展开：', data.label)
}

const handleNodeCollapse = (data, node, component) => {
  console.log('节点收起：', data.label)
}
</script>
```

## 高级功能

### 自定义节点内容

```vue
<template>
  <AFormTreeSelect 
    v-model="form.deptId" 
    :data="deptTree" 
    label="部门"
    :show-form-item="false"
  >
    <template #default="{ node, data }">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center">
          <Icon :code="data.icon" class="mr-2" />
          <span>{{ data.label }}</span>
          <el-tag v-if="data.hot" size="small" type="danger" class="ml-2">热门</el-tag>
        </div>
        <span class="text-gray-400 text-xs">{{ data.count }}人</span>
      </div>
    </template>
  </AFormTreeSelect>
</template>

<script setup>
const deptTree = [
  {
    id: '1',
    label: '技术部',
    icon: 'code',
    hot: true,
    count: 25,
    children: [
      { id: '1-1', label: '前端组', icon: 'vue', count: 12 },
      { id: '1-2', label: '后端组', icon: 'server', count: 13 }
    ]
  }
]
</script>
```

### 动态加载和更新

```vue
<template>
  <div>
    <el-button @click="refreshTree">刷新树数据</el-button>
    <el-button @click="expandAll">展开全部</el-button>
    <el-button @click="collapseAll">收起全部</el-button>
    
    <AFormTreeSelect 
      ref="treeSelectRef"
      v-model="form.deptId" 
      :data="dynamicTree" 
      label="动态部门"
      :default-expand-all="expandedAll"
    />
  </div>
</template>

<script setup>
const treeSelectRef = ref()
const expandedAll = ref(false)
const dynamicTree = ref([])

// 刷新树数据
const refreshTree = async () => {
  const data = await fetchDeptTree()
  dynamicTree.value = data
}

// 展开全部节点
const expandAll = () => {
  expandedAll.value = true
  // 手动展开已渲染的节点
  nextTick(() => {
    // 可以通过ref访问内部tree实例的方法
  })
}

// 收起全部节点
const collapseAll = () => {
  expandedAll.value = false
}

onMounted(() => {
  refreshTree()
})
</script>
```

### 批量选择操作

```vue
<template>
  <div>
    <div class="mb-4">
      <el-button @click="selectAll">全选</el-button>
      <el-button @click="clearSelection">清空选择</el-button>
      <el-button @click="selectByLevel">选择同级</el-button>
    </div>
    
    <AFormTreeSelect 
      ref="treeSelectRef"
      v-model="selectedNodes" 
      :data="treeData" 
      label="批量选择"
      :multiple="true"
      :show-checkbox="true"
    />
  </div>
</template>

<script setup>
const selectedNodes = ref([])
const treeSelectRef = ref()

// 全选
const selectAll = () => {
  const allIds = getAllNodeIds(treeData.value)
  selectedNodes.value = allIds
}

// 清空选择
const clearSelection = () => {
  selectedNodes.value = []
}

// 选择同级节点
const selectByLevel = () => {
  // 选择第二级的所有节点
  const level2Ids = getNodeIdsByLevel(treeData.value, 2)
  selectedNodes.value = level2Ids
}

// 递归获取所有节点ID
const getAllNodeIds = (nodes) => {
  const ids = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children?.length) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return ids
}

// 获取指定级别的节点ID
const getNodeIdsByLevel = (nodes, targetLevel, currentLevel = 1) => {
  const ids = []
  
  nodes.forEach(node => {
    if (currentLevel === targetLevel) {
      ids.push(node.id)
    } else if (node.children?.length && currentLevel < targetLevel) {
      ids.push(...getNodeIdsByLevel(node.children, targetLevel, currentLevel + 1))
    }
  })
  
  return ids
}
</script>
```

## 数据处理

### 树形数据转换

```vue
<script setup>
// 扁平数据转树形结构
const flatToTree = (flatData, options = {}) => {
  const { 
    idField = 'id', 
    parentField = 'parentId', 
    childrenField = 'children',
    rootValue = null 
  } = options
  
  const map = new Map()
  const tree = []
  
  // 创建映射
  flatData.forEach(item => {
    map.set(item[idField], { ...item, [childrenField]: [] })
  })
  
  // 构建树形结构
  flatData.forEach(item => {
    const node = map.get(item[idField])
    const parentId = item[parentField]
    
    if (parentId === rootValue) {
      tree.push(node)
    } else {
      const parent = map.get(parentId)
      if (parent) {
        parent[childrenField].push(node)
      }
    }
  })
  
  return tree
}

// 使用示例
const flatDepts = [
  { id: '1', name: '总公司', parentId: null, sort: 1 },
  { id: '1-1', name: '技术部', parentId: '1', sort: 1 },
  { id: '1-1-1', name: '前端组', parentId: '1-1', sort: 1 },
  { id: '1-1-2', name: '后端组', parentId: '1-1', sort: 2 },
  { id: '1-2', name: '销售部', parentId: '1', sort: 2 }
]

const treeData = computed(() => {
  return flatToTree(flatDepts, {
    idField: 'id',
    parentField: 'parentId',
    childrenField: 'children'
  })
})
</script>
```

### 选中状态处理

```vue
<script setup>
// 处理选中状态和回显
const processSelectedValues = (selectedIds, treeData) => {
  const result = []
  
  const findNodes = (nodes, ids) => {
    nodes.forEach(node => {
      if (ids.includes(node.id)) {
        result.push({
          id: node.id,
          label: node.label,
          path: getNodePath(node, treeData)
        })
      }
      
      if (node.children?.length) {
        findNodes(node.children, ids)
      }
    })
  }
  
  findNodes(treeData, selectedIds)
  return result
}

// 获取节点完整路径
const getNodePath = (targetNode, treeData, path = []) => {
  const findPath = (nodes, currentPath) => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.label]
      
      if (node.id === targetNode.id) {
        return newPath
      }
      
      if (node.children?.length) {
        const foundPath = findPath(node.children, newPath)
        if (foundPath) return foundPath
      }
    }
    return null
  }
  
  return findPath(treeData, [])
}
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormTreeSelect 
      v-model="form.deptId" 
      :data="deptTree" 
      label="所属部门" 
      prop="deptId"
      :span="12" 
    />
    
    <AFormTreeSelect 
      v-model="form.permissions" 
      :data="permissionTree" 
      label="权限选择" 
      prop="permissions"
      :multiple="true"
      :span="12" 
    />
  </el-form>
</template>

<script setup>
const rules = {
  deptId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  permissions: [
    { 
      required: true, 
      message: '请选择至少一个权限', 
      trigger: 'change',
      type: 'array',
      min: 1
    }
  ]
}
</script>
```

### 自定义验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormTreeSelect 
      v-model="form.managerId" 
      :data="userTree" 
      label="直属上级" 
      prop="managerId"
    />
  </el-form>
</template>

<script setup>
const validateManager = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择直属上级'))
  } else if (value === form.userId) {
    callback(new Error('不能选择自己作为上级'))
  } else {
    callback()
  }
}

const rules = {
  managerId: [
    { validator: validateManager, trigger: 'change' }
  ]
}
</script>
```

## 样式定制

### 自定义树形选择器样式

```vue
<template>
  <AFormTreeSelect 
    v-model="form.category" 
    :data="categoryTree" 
    label="分类"
    class="custom-tree-select"
    :span="12" 
  />
</template>

<style scoped>
.custom-tree-select :deep(.el-tree-select) {
  width: 100%;
}

.custom-tree-select :deep(.el-select__tags) {
  max-height: 100px;
  overflow-y: auto;
}

.custom-tree-select :deep(.el-tree-node__content) {
  height: 32px;
  font-size: 14px;
}

.custom-tree-select :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.custom-tree-select :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409eff;
}
</style>
```

### 响应式设计

```vue
<template>
  <AFormTreeSelect 
    v-model="form.deptId" 
    :data="deptTree" 
    label="部门"
    :span="responsive.span"
    :size="responsive.size"
    :filterable="responsive.filterable"
  />
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile, isTablet } = useBreakpoint()

const responsive = computed(() => {
  if (isMobile.value) {
    return {
      span: 24,
      size: 'small',
      filterable: true
    }
  } else if (isTablet.value) {
    return {
      span: 12,
      size: 'default',
      filterable: true
    }
  } else {
    return {
      span: 8,
      size: 'default',
      filterable: false
    }
  }
})
</script>
```

## 最佳实践

### 1. 数据结构优化

```vue
<script setup>
// 推荐的数据结构
const optimizedTreeData = [
  {
    id: 'dept-001',           // 唯一ID
    label: '技术部',          // 显示标签
    value: 'dept-001',        // 选择值（可与id相同）
    disabled: false,          // 是否禁用
    children: [
      {
        id: 'team-001',
        label: '前端组',
        value: 'team-001',
        disabled: false,
        // 可添加自定义属性
        icon: 'vue',
        memberCount: 8,
        leader: '张三'
      }
    ]
  }
]
</script>
```

### 2. 性能优化

```vue
<script setup>
// 使用 computed 缓存处理后的数据
const processedTreeData = computed(() => {
  return rawTreeData.value.map(dept => ({
    ...dept,
    disabled: dept.status === 'inactive',
    children: dept.children?.map(child => ({
      ...child,
      disabled: child.status === 'inactive'
    }))
  }))
})

// 大数据量时启用虚拟滚动（如果组件支持）
const virtualScrollOptions = {
  itemHeight: 32,
  maxHeight: 300
}
</script>
```

### 3. 搜索优化

```vue
<template>
  <AFormTreeSelect 
    v-model="form.nodeId" 
    :data="searchableTree" 
    label="节点选择"
    :filterable="true"
    :filter-node-method="filterNode"
  />
</template>

<script setup>
// 自定义搜索方法
const filterNode = (value, data) => {
  if (!value) return true
  
  // 支持拼音搜索
  return data.label.toLowerCase().includes(value.toLowerCase()) ||
         data.pinyin?.toLowerCase().includes(value.toLowerCase()) ||
         data.id.includes(value)
}

// 为数据添加搜索字段
const searchableTree = computed(() => {
  return addSearchFields(rawTreeData.value)
})

const addSearchFields = (nodes) => {
  return nodes.map(node => ({
    ...node,
    pinyin: generatePinyin(node.label), // 生成拼音
    children: node.children ? addSearchFields(node.children) : []
  }))
}
</script>
```

### 4. 权限控制

```vue
<template>
  <AFormTreeSelect 
    v-model="form.accessibleMenus" 
    :data="filteredMenuTree" 
    label="可访问菜单"
    :multiple="true"
    :show-checkbox="true"
  />
</template>

<script setup>
// 根据用户权限过滤树形数据
const filteredMenuTree = computed(() => {
  return filterTreeByPermission(menuTree.value, userPermissions.value)
})

const filterTreeByPermission = (nodes, permissions) => {
  return nodes
    .filter(node => permissions.includes(node.permission))
    .map(node => ({
      ...node,
      children: node.children ? 
        filterTreeByPermission(node.children, permissions) : []
    }))
    .filter(node => node.children?.length > 0 || !node.children) // 过滤空父节点
}
</script>
```

### 5. 状态管理

```vue
<script setup>
// 统一的树形数据管理
const useTreeData = () => {
  const treeData = ref([])
  const loading = ref(false)
  const selectedNodes = ref([])
  
  const loadTreeData = async () => {
    loading.value = true
    try {
      const data = await fetchTreeData()
      treeData.value = data
    } catch (error) {
      console.error('加载树形数据失败：', error)
    } finally {
      loading.value = false
    }
  }
  
  const refreshTreeData = () => {
    loadTreeData()
  }
  
  const getSelectedNodesInfo = () => {
    return selectedNodes.value.map(id => findNodeById(treeData.value, id))
  }
  
  return {
    treeData: readonly(treeData),
    loading: readonly(loading),
    selectedNodes,
    loadTreeData,
    refreshTreeData,
    getSelectedNodesInfo
  }
}

// 在组件中使用
const { treeData, loading, loadTreeData } = useTreeData()

onMounted(() => {
  loadTreeData()
})
</script>
```

## 注意事项

1. **数据结构**：确保树形数据的层级关系正确，避免循环引用
2. **性能考虑**：大数据量时考虑使用懒加载或虚拟滚动
3. **多选模式**：注意 `checkStrictly` 属性对父子节点关联关系的影响
4. **节点属性**：使用 `props` 属性正确映射数据字段
5. **搜索功能**：启用搜索时考虑性能影响，必要时使用防抖
6. **表单验证**：多选模式下注意验证规则的 `type` 应该设置为 `array`
7. **样式定制**：深度选择器（`:deep()`）用于修改内部组件样式
8. **事件处理**：区分节点选择事件和节点操作事件，避免重复触发
