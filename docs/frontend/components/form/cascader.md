# AFormCascader 级联选择组件

AFormCascader 是一个功能强大的级联选择组件，基于 Element Plus 的 ElCascader 封装。它支持地区选择、自定义数据结构、多选模式等功能，特别适用于层级数据的选择场景。

## 基础用法

### 地区选择

最常用的场景是中国行政区域的三级联动选择：

```vue
<template>
  <!-- 自动加载中国地区数据 -->
  <AFormCascader 
    v-model="form.areaCode" 
    mode="region" 
    label="地区" 
    prop="areaCode" 
    :span="12" 
  />
  
  <!-- 手动传入地区数据 -->
  <AFormCascader 
    v-model="form.areaCode" 
    :options="regionData" 
    label="地区" 
    prop="areaCode" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
import { regionData } from 'element-china-area-data'

const form = reactive({
  areaCode: ''
})
</script>
```

### 自定义数据结构

支持各种树形结构数据的级联选择：

```vue
<template>
  <!-- 部门级联选择 -->
  <AFormCascader
    v-model="form.deptId"
    :options="deptTree"
    label="部门"
    prop="deptId"
    value-field="id"
    label-field="name"
    children-field="children"
    :span="12"
  />
  
  <!-- 商品分类级联选择 -->
  <AFormCascader
    v-model="form.categoryId"
    :options="categoryTree"
    label="商品分类"
    prop="categoryId"
    value-field="categoryId"
    label-field="categoryName"
    children-field="subCategories"
    :span="12"
  />
</template>

<script lang="ts" setup>
const deptTree = [
  {
    id: '1',
    name: '总公司',
    children: [
      {
        id: '1-1',
        name: '技术部',
        children: [
          { id: '1-1-1', name: '前端组' },
          { id: '1-1-2', name: '后端组' }
        ]
      },
      {
        id: '1-2', 
        name: '销售部',
        children: [
          { id: '1-2-1', name: '华北区' },
          { id: '1-2-2', name: '华南区' }
        ]
      }
    ]
  }
]

const form = reactive({
  deptId: '',
  categoryId: ''
})
</script>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| Array` | - | 绑定值 |
| `mode` | `'region' \| 'cascader'` | `'cascader'` | 组件模式 |
| `options` | `Array` | `[]` | 级联数据源 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项 |

### 字段映射属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `valueField` | `string` | `'value'` | 值字段名 |
| `labelField` | `string` | `'label'` | 标签字段名 |
| `childrenField` | `string` | `'children'` | 子节点字段名 |
| `disabledField` | `string` | `'disabled'` | 禁用字段名 |
| `leafField` | `string` | `'leaf'` | 叶子节点字段名 |

### 显示属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | - | 占位符文本 |
| `separator` | `string` | `' / '` | 选项分隔符 |
| `showAllLevels` | `boolean` | `true` | 是否显示完整路径 |
| `collapseTags` | `boolean` | `false` | 多选时是否折叠标签 |
| `collapseTagsTooltip` | `boolean` | `false` | 是否悬浮显示折叠标签 |

### 行为属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `multiple` | `boolean` | `false` | 是否多选 |
| `checkStrictly` | `boolean` | `false` | 是否严格模式 |
| `emitPath` | `boolean` | `true` | 是否返回完整路径 |
| `lazy` | `boolean` | `false` | 是否懒加载 |
| `filterable` | `boolean` | `false` | 是否可搜索 |
| `clearable` | `boolean` | `true` | 是否可清空 |
| `disabled` | `boolean` | `false` | 是否禁用 |

## 使用示例

### 菜单权限级联选择

```vue
<template>
  <AFormCascader
    v-model="form.menuIds"
    :options="menuTree"
    label="菜单权限"
    prop="menuIds"
    value-field="menuId"
    label-field="menuName"
    children-field="children"
    :multiple="true"
    :show-all-levels="false"
    :span="12"
  />
</template>

<script lang="ts" setup>
const menuTree = [
  {
    menuId: '1',
    menuName: '系统管理',
    children: [
      {
        menuId: '1-1',
        menuName: '用户管理',
        children: [
          { menuId: '1-1-1', menuName: '查看用户' },
          { menuId: '1-1-2', menuName: '添加用户' },
          { menuId: '1-1-3', menuName: '编辑用户' }
        ]
      },
      {
        menuId: '1-2',
        menuName: '角色管理',
        children: [
          { menuId: '1-2-1', menuName: '查看角色' },
          { menuId: '1-2-2', menuName: '分配权限' }
        ]
      }
    ]
  }
]

const form = reactive({
  menuIds: []
})
</script>
```

### 自定义字段映射

```vue
<template>
  <AFormCascader
    v-model="form.orgCode"
    :options="orgData"
    label="组织架构"
    prop="orgCode"
    value-field="code"
    label-field="title"
    children-field="items"
    separator=" → "
    :span="12"
  />
</template>

<script lang="ts" setup>
const orgData = [
  {
    code: 'root',
    title: '集团总部',
    items: [
      {
        code: 'tech',
        title: '技术中心',
        items: [
          { code: 'dev', title: '研发部' },
          { code: 'test', title: '测试部' }
        ]
      },
      {
        code: 'business',
        title: '业务中心',
        items: [
          { code: 'sales', title: '销售部' },
          { code: 'market', title: '市场部' }
        ]
      }
    ]
  }
]
</script>
```

### 带禁用状态的级联选择

```vue
<template>
  <AFormCascader
    v-model="form.regionId"
    :options="regionTree"
    label="业务区域"
    prop="regionId"
    value-field="id"
    label-field="name"
    children-field="children"
    disabled-field="status"
    disabled-value="0"
    :span="12"
  />
</template>

<script lang="ts" setup>
const regionTree = [
  {
    id: '1',
    name: '华北区',
    status: '1',
    children: [
      { id: '1-1', name: '北京', status: '1' },
      { id: '1-2', name: '天津', status: '0' }, // 禁用
      { id: '1-3', name: '河北', status: '1' }
    ]
  },
  {
    id: '2',
    name: '华南区',
    status: '0', // 整个区域禁用
    children: [
      { id: '2-1', name: '广州', status: '1' },
      { id: '2-2', name: '深圳', status: '1' }
    ]
  }
]
</script>
```

### 懒加载级联选择

```vue
<template>
  <AFormCascader
    v-model="form.categoryId"
    :options="categoryOptions"
    label="分类"
    prop="categoryId"
    :lazy="true"
    :load-data="loadCategoryData"
    :span="12"
  />
</template>

<script lang="ts" setup>
const categoryOptions = ref([
  { value: '1', label: '电子产品', leaf: false },
  { value: '2', label: '服装', leaf: false },
  { value: '3', label: '图书', leaf: false }
])

// 懒加载数据
const loadCategoryData = async (node, resolve) => {
  const { level, value } = node
  
  // 模拟API请求
  const children = await fetchCategoryChildren(value, level)
  resolve(children)
}

const fetchCategoryChildren = async (parentId, level) => {
  // 模拟异步数据获取
  return new Promise((resolve) => {
    setTimeout(() => {
      if (level === 1) {
        resolve([
          { value: `${parentId}-1`, label: '子分类1', leaf: false },
          { value: `${parentId}-2`, label: '子分类2', leaf: false }
        ])
      } else if (level === 2) {
        resolve([
          { value: `${parentId}-1`, label: '具体商品1', leaf: true },
          { value: `${parentId}-2`, label: '具体商品2', leaf: true }
        ])
      }
    }, 500)
  })
}
</script>
```

### 获取完整路径信息

```vue
<template>
  <AFormCascader
    v-model="form.pathId"
    :options="treeData"
    label="路径选择"
    prop="pathId"
    output-format="full"
    @path-change="handlePathChange"
    :span="12"
  />
  
  <div v-if="pathInfo">
    <p>选中路径：{{ pathInfo.labels.join(' / ') }}</p>
    <p>路径值：{{ pathInfo.values.join(' / ') }}</p>
  </div>
</template>

<script lang="ts" setup>
const form = reactive({
  pathId: ''
})

const pathInfo = ref(null)

const handlePathChange = (info) => {
  pathInfo.value = info
  console.log('完整路径信息：', info)
  // info 包含：
  // - labels: 标签数组
  // - values: 值数组  
  // - nodes: 节点对象数组
}
</script>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormCascader
    v-model="form.categoryId"
    :options="categoryOptions"
    label="分类"
    @change="handleChange"
    @expand-change="handleExpandChange"
    @blur="handleBlur"
    @focus="handleFocus"
    @visible-change="handleVisibleChange"
  />
</template>

<script lang="ts" setup>
const handleChange = (value) => {
  console.log('选择变化：', value)
}

const handleExpandChange = (activeNames) => {
  console.log('展开节点变化：', activeNames)
}

const handleBlur = (event) => {
  console.log('失去焦点')
}

const handleFocus = (event) => {
  console.log('获得焦点')
}

const handleVisibleChange = (visible) => {
  console.log('下拉框显示状态：', visible)
}
</script>
```

### 多选事件处理

```vue
<template>
  <AFormCascader
    v-model="selectedCategories"
    :options="categoryOptions"
    label="多选分类"
    :multiple="true"
    @change="handleMultipleChange"
    @remove-tag="handleRemoveTag"
  />
</template>

<script lang="ts" setup>
const selectedCategories = ref([])

const handleMultipleChange = (values) => {
  console.log('多选变化：', values)
  // values 是二维数组，每个元素是一个完整路径
}

const handleRemoveTag = (value) => {
  console.log('移除标签：', value)
}
</script>
```

## 高级功能

### 自定义节点内容

```vue
<template>
  <AFormCascader
    v-model="form.deptId"
    :options="deptTree"
    label="部门"
    :show-form-item="false"
  >
    <template #default="{ node, data }">
      <div class="flex items-center">
        <Icon :code="data.icon" class="mr-1" />
        <span>{{ data.name }}</span>
        <el-tag v-if="data.isNew" size="small" class="ml-1">新</el-tag>
      </div>
    </template>
  </AFormCascader>
</template>

<script lang="ts" setup>
const deptTree = [
  {
    id: '1',
    name: '技术部',
    icon: 'code',
    isNew: true,
    children: [
      { id: '1-1', name: '前端组', icon: 'vue' },
      { id: '1-2', name: '后端组', icon: 'server' }
    ]
  }
]
</script>
```

### 搜索过滤

```vue
<template>
  <AFormCascader
    v-model="form.regionId"
    :options="regionOptions"
    label="地区"
    :filterable="true"
    :filter-method="filterMethod"
    :span="12"
  />
</template>

<script lang="ts" setup>
const filterMethod = (node, keyword) => {
  return node.text.includes(keyword)
}
</script>
```

### 严格模式

```vue
<template>
  <!-- 严格模式：父子节点不关联 -->
  <AFormCascader
    v-model="form.permissions"
    :options="permissionTree"
    label="权限"
    :multiple="true"
    :check-strictly="true"
    :span="12"
  />
  
  <!-- 非严格模式：选中父节点自动选中所有子节点 -->
  <AFormCascader
    v-model="form.departments"
    :options="deptTree"
    label="部门"
    :multiple="true"
    :check-strictly="false"
    :span="12"
  />
</template>
```

## 数据格式处理

### 数据转换

```vue
<script lang="ts" setup>
// 将扁平数据转换为树形结构
const flatToTree = (flatData, parentKey = null) => {
  return flatData
    .filter(item => item.parentId === parentKey)
    .map(item => ({
      ...item,
      children: flatToTree(flatData, item.id)
    }))
}

// 使用示例
const flatDepartments = [
  { id: '1', name: '总公司', parentId: null },
  { id: '1-1', name: '技术部', parentId: '1' },
  { id: '1-1-1', name: '前端组', parentId: '1-1' },
  { id: '1-1-2', name: '后端组', parentId: '1-1' },
  { id: '1-2', name: '销售部', parentId: '1' }
]

const deptTree = computed(() => flatToTree(flatDepartments))
</script>
```

### 值格式转换

```vue
<template>
  <AFormCascader
    v-model="form.categoryPath"
    :options="categoryTree"
    label="分类"
    :emit-path="false"
    @change="handleCategoryChange"
  />
</template>

<script lang="ts" setup>
const form = reactive({
  categoryPath: '' // 只保存最后一级的值
})

const handleCategoryChange = (value, selectedData) => {
  // value: 选中的值
  // selectedData: 完整的节点数据
  console.log('选中值：', value)
  console.log('节点数据：', selectedData)
  
  // 可以获取完整路径
  const fullPath = selectedData.pathValues
  const fullLabels = selectedData.pathLabels
}
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormCascader
    v-model="form.category"
    :options="categoryOptions"
    label="分类"
    class="custom-cascader"
    :span="12"
  />
</template>

<style scoped>
.custom-cascader :deep(.el-cascader) {
  width: 100%;
}

.custom-cascader :deep(.el-cascader__tags) {
  max-height: 80px;
  overflow-y: auto;
}

.custom-cascader :deep(.el-tag) {
  background-color: #f0f9ff;
  border-color: #0ea5e9;
  color: #0ea5e9;
}
</style>
```

### 响应式设计

```vue
<template>
  <AFormCascader
    v-model="form.region"
    :options="regionOptions"
    label="地区"
    :span="responsive.span"
    :size="responsive.size"
    :collapse-tags="responsive.collapseTags"
  />
</template>

<script lang="ts" setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile, isTablet } = useBreakpoint()

const responsive = computed(() => {
  if (isMobile.value) {
    return {
      span: 24,
      size: 'small',
      collapseTags: true
    }
  } else if (isTablet.value) {
    return {
      span: 12,
      size: 'default',
      collapseTags: true
    }
  } else {
    return {
      span: 8,
      size: 'default',
      collapseTags: false
    }
  }
})
</script>
```

## 最佳实践

### 1. 数据结构规范

```vue
<script lang="ts" setup>
// 推荐的数据结构
const standardTreeData = [
  {
    value: 'electronics',      // 唯一值
    label: '电子产品',          // 显示标签
    disabled: false,           // 是否禁用
    children: [
      {
        value: 'phones',
        label: '手机',
        children: [
          { value: 'iphone', label: 'iPhone' },
          { value: 'android', label: '安卓手机' }
        ]
      }
    ]
  }
]
</script>
```

### 2. 性能优化

```vue
<script lang="ts" setup>
// 使用 computed 缓存处理后的数据
const processedOptions = computed(() => {
  return rawData.value.map(item => ({
    ...item,
    disabled: item.status === 0
  }))
})

// 懒加载大数据量
const lazyLoad = ref(true)
const initialOptions = computed(() => {
  return lazyLoad.value ? topLevelOptions.value : allOptions.value
})
</script>
```

### 3. 表单验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormCascader
      v-model="form.category"
      :options="categoryOptions"
      label="分类"
      prop="category"
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  category: [
    { 
      required: true, 
      message: '请选择分类',
      trigger: 'change',
      type: 'array',
      min: 1
    }
  ]
}
</script>
```

## 注意事项

1. **数据格式**：确保数据结构正确，特别是 `children` 字段的层级关系
2. **字段映射**：使用自定义字段时，确保 `valueField`、`labelField` 等属性设置正确
3. **性能考虑**：对于大数据量，建议使用懒加载模式
4. **值的类型**：注意 `emitPath` 属性会影响返回值的格式（数组 vs 单值）
5. **多选模式**：多选时返回的是二维数组，每个元素代表一个完整的选择路径

## 常见问题

### 1. 级联选择器初始值回显失败

**问题描述**

编辑表单时，级联选择器传入初始值后无法正确显示选中的路径，显示为空或只显示值而不是标签。

**问题原因**

- 初始值格式与 `emitPath` 配置不匹配
- options数据异步加载，初始值设置时数据还未就绪
- 值类型不一致（字符串vs数字）
- 数据源中找不到对应的节点
- 懒加载模式下中间节点未展开

**解决方案**

```vue
<template>
  <AFormCascader
    v-model="formData.categoryPath"
    :options="categoryOptions"
    label="分类"
    prop="categoryPath"
    :emit-path="true"
    :key="cascaderKey"
  />
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface CategoryNode {
  value: string
  label: string
  children?: CategoryNode[]
}

const formData = ref({
  categoryPath: [] as string[]
})

const categoryOptions = ref<CategoryNode[]>([])
const cascaderKey = ref(0)
const isDataReady = ref(false)

// ❌ 错误做法 - 数据未加载完就设置初始值
const wrongInit = async () => {
  formData.value.categoryPath = ['electronics', 'phones', 'iphone']
  // 此时 categoryOptions 可能为空
  categoryOptions.value = await fetchCategories()
}

// ✅ 正确做法 - 确保数据加载后再设置值
const correctInit = async (editData?: { categoryPath: string[] }) => {
  // 1. 先加载选项数据
  categoryOptions.value = await fetchCategories()
  isDataReady.value = true

  // 2. 等待DOM更新
  await nextTick()

  // 3. 设置初始值
  if (editData?.categoryPath) {
    formData.value.categoryPath = editData.categoryPath
  }

  // 4. 强制刷新组件（某些情况下需要）
  cascaderKey.value++
}

// 初始化表单数据的函数
const initFormData = async (editData: { categoryId: string }) => {
  // 加载选项
  categoryOptions.value = await fetchCategories()

  // 根据叶子节点值反查完整路径
  const path = findPathByValue(categoryOptions.value, editData.categoryId)

  if (path) {
    formData.value.categoryPath = path
  }
}

/**
 * 根据叶子节点值查找完整路径
 */
function findPathByValue(
  nodes: CategoryNode[],
  targetValue: string,
  currentPath: string[] = []
): string[] | null {
  for (const node of nodes) {
    const newPath = [...currentPath, node.value]

    if (node.value === targetValue) {
      return newPath
    }

    if (node.children?.length) {
      const result = findPathByValue(node.children, targetValue, newPath)
      if (result) return result
    }
  }

  return null
}

/**
 * 值类型标准化处理
 */
function normalizeValue(value: any, options: CategoryNode[]): string[] {
  if (!value) return []

  // 如果已经是数组，检查类型一致性
  if (Array.isArray(value)) {
    // 确保值类型与数据源一致
    const sampleValue = findFirstLeafValue(options)
    const valueType = typeof sampleValue

    return value.map(v => {
      if (valueType === 'string' && typeof v === 'number') {
        return String(v)
      }
      if (valueType === 'number' && typeof v === 'string') {
        return Number(v)
      }
      return v
    })
  }

  // 如果是单值，需要查找完整路径
  return findPathByValue(options, String(value)) || []
}

function findFirstLeafValue(nodes: CategoryNode[]): any {
  for (const node of nodes) {
    if (!node.children?.length) {
      return node.value
    }
    const result = findFirstLeafValue(node.children)
    if (result !== undefined) return result
  }
  return undefined
}

// 模拟API
const fetchCategories = async (): Promise<CategoryNode[]> => {
  return [
    {
      value: 'electronics',
      label: '电子产品',
      children: [
        {
          value: 'phones',
          label: '手机',
          children: [
            { value: 'iphone', label: 'iPhone' },
            { value: 'android', label: '安卓手机' }
          ]
        }
      ]
    }
  ]
}

onMounted(() => {
  correctInit()
})
</script>
```

**懒加载模式下的回显处理**：

```typescript
interface LazyLoadCascaderProps {
  modelValue: string[]
  lazyLoad: (node: any, resolve: Function) => void
}

/**
 * 懒加载级联选择器回显管理器
 */
class LazyCascaderEchoManager {
  private loadedNodes = new Map<string, any>()
  private loadFn: (parentValue: string | null) => Promise<any[]>

  constructor(loadFn: (parentValue: string | null) => Promise<any[]>) {
    this.loadFn = loadFn
  }

  /**
   * 预加载路径上的所有节点
   */
  async preloadPath(pathValues: string[]): Promise<any[]> {
    const nodes: any[] = []

    // 从根节点开始，逐级加载
    let parentValue: string | null = null

    for (const value of pathValues) {
      // 检查是否已加载
      if (!this.loadedNodes.has(parentValue || 'root')) {
        const children = await this.loadFn(parentValue)
        this.loadedNodes.set(parentValue || 'root', children)
      }

      const siblings = this.loadedNodes.get(parentValue || 'root') || []
      const currentNode = siblings.find((n: any) => n.value === value)

      if (currentNode) {
        nodes.push(currentNode)
        parentValue = value
      } else {
        console.warn(`节点 ${value} 未找到`)
        break
      }
    }

    return nodes
  }

  /**
   * 获取已加载的根节点
   */
  getRootOptions(): any[] {
    return this.loadedNodes.get('root') || []
  }
}

// 使用示例
const echoManager = new LazyCascaderEchoManager(async (parentValue) => {
  const response = await api.getCategoryChildren(parentValue)
  return response.data
})

const initWithLazyLoad = async (pathValues: string[]) => {
  // 预加载路径
  await echoManager.preloadPath(pathValues)

  // 设置根选项
  categoryOptions.value = echoManager.getRootOptions()

  // 设置值
  await nextTick()
  formData.value.categoryPath = pathValues
}
```

---

### 2. 异步加载时级联路径中断

**问题描述**

使用懒加载模式时，展开父节点后子节点不显示，或展开到某一级后无法继续展开，控制台可能有错误。

**问题原因**

- `lazyLoad` 回调函数的 `resolve` 未正确调用
- 返回的数据格式不符合预期
- 网络请求失败未处理
- `leaf` 字段未正确设置导致叶子节点仍显示展开图标
- 异步竞态条件导致数据覆盖

**解决方案**

```vue
<template>
  <AFormCascader
    v-model="formData.regionPath"
    :options="regionOptions"
    label="地区"
    prop="regionPath"
    :lazy="true"
    :load-data="handleLazyLoad"
    :props="cascaderProps"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface RegionNode {
  value: string
  label: string
  leaf?: boolean
  children?: RegionNode[]
}

const formData = ref({
  regionPath: [] as string[]
})

const regionOptions = ref<RegionNode[]>([])

// 级联配置
const cascaderProps = {
  lazy: true,
  lazyLoad: handleLazyLoad,
  value: 'value',
  label: 'label',
  children: 'children',
  leaf: 'leaf'
}

// 请求计数器，用于处理竞态
const requestCounter = ref(0)

/**
 * 懒加载处理函数
 */
async function handleLazyLoad(
  node: { level: number; value: any; data: RegionNode },
  resolve: (nodes: RegionNode[]) => void
) {
  const currentRequest = ++requestCounter.value

  // ❌ 错误做法 - 不处理错误，不设置leaf
  // const wrongLoad = async (node, resolve) => {
  //   const data = await api.getChildren(node.value)
  //   resolve(data)
  // }

  try {
    // 根据层级获取数据
    let children: RegionNode[] = []

    if (node.level === 0) {
      // 加载省份
      children = await fetchProvinces()
    } else if (node.level === 1) {
      // 加载城市
      children = await fetchCities(node.value)
    } else if (node.level === 2) {
      // 加载区县 - 标记为叶子节点
      children = await fetchDistricts(node.value)
      children = children.map(item => ({ ...item, leaf: true }))
    } else {
      // 超过3级，返回空数组
      children = []
    }

    // 检查是否是最新请求
    if (currentRequest !== requestCounter.value) {
      console.log('请求已过期，跳过处理')
      return
    }

    // 标准化数据格式
    const normalizedChildren = normalizeNodes(children, node.level)

    resolve(normalizedChildren)
  } catch (error) {
    console.error('加载子节点失败:', error)
    ElMessage.error('加载数据失败，请重试')

    // 出错时必须调用resolve，否则会一直loading
    resolve([])
  }
}

/**
 * 标准化节点数据
 */
function normalizeNodes(nodes: any[], level: number): RegionNode[] {
  const maxLevel = 3 // 最大层级

  return nodes.map(node => ({
    value: String(node.value ?? node.code ?? node.id),
    label: String(node.label ?? node.name ?? node.title),
    // 根据层级判断是否为叶子节点
    leaf: level >= maxLevel - 1 || node.leaf === true || node.isLeaf === true,
    // 保留原始数据供后续使用
    ...node
  }))
}

/**
 * 带重试的懒加载
 */
function createRetryLazyLoad(
  loadFn: (parentValue: any, level: number) => Promise<RegionNode[]>,
  maxRetries = 3,
  retryDelay = 1000
) {
  return async (
    node: { level: number; value: any },
    resolve: (nodes: RegionNode[]) => void
  ) => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const children = await loadFn(node.value, node.level)
        resolve(children)
        return
      } catch (error) {
        lastError = error as Error
        console.warn(`加载失败，第 ${attempt} 次重试...`)

        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, retryDelay * attempt))
        }
      }
    }

    console.error('加载失败，已达最大重试次数', lastError)
    resolve([])
  }
}

// 模拟API
const fetchProvinces = async (): Promise<RegionNode[]> => {
  await new Promise(r => setTimeout(r, 300))
  return [
    { value: '11', label: '北京市' },
    { value: '31', label: '上海市' },
    { value: '44', label: '广东省' }
  ]
}

const fetchCities = async (provinceCode: string): Promise<RegionNode[]> => {
  await new Promise(r => setTimeout(r, 300))
  if (provinceCode === '44') {
    return [
      { value: '4401', label: '广州市' },
      { value: '4403', label: '深圳市' }
    ]
  }
  return []
}

const fetchDistricts = async (cityCode: string): Promise<RegionNode[]> => {
  await new Promise(r => setTimeout(r, 300))
  return [
    { value: `${cityCode}01`, label: '区县1', leaf: true },
    { value: `${cityCode}02`, label: '区县2', leaf: true }
  ]
}
</script>
```

---

### 3. 动态更改数据源后选中值清空

**问题描述**

根据条件动态切换级联选择器的数据源后，之前选中的值被自动清空，或者显示异常。

**问题原因**

- 数据源变更触发组件重新渲染
- 新数据源中不存在之前选中的节点
- 响应式更新触发了值的重置逻辑
- 组件内部watch监听了options变化并清空值

**解决方案**

```vue
<template>
  <div>
    <!-- 类型选择 -->
    <el-radio-group v-model="categoryType" @change="handleTypeChange">
      <el-radio label="product">商品分类</el-radio>
      <el-radio label="service">服务分类</el-radio>
    </el-radio-group>

    <!-- 级联选择器 -->
    <AFormCascader
      v-model="formData.categoryPath"
      :options="currentOptions"
      label="分类"
      prop="categoryPath"
      :key="cascaderKey"
      @change="handleCascaderChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

type CategoryType = 'product' | 'service'

interface CategoryNode {
  value: string
  label: string
  children?: CategoryNode[]
}

interface FormData {
  categoryPath: string[]
  productPath: string[]  // 商品分类路径
  servicePath: string[]  // 服务分类路径
}

const categoryType = ref<CategoryType>('product')
const cascaderKey = ref(0)

// 分开存储不同类型的选中值
const formData = ref<FormData>({
  categoryPath: [],
  productPath: [],
  servicePath: []
})

// 不同类型的选项数据
const productOptions = ref<CategoryNode[]>([
  {
    value: 'electronics',
    label: '电子产品',
    children: [
      { value: 'phone', label: '手机' },
      { value: 'computer', label: '电脑' }
    ]
  }
])

const serviceOptions = ref<CategoryNode[]>([
  {
    value: 'consulting',
    label: '咨询服务',
    children: [
      { value: 'legal', label: '法律咨询' },
      { value: 'finance', label: '财务咨询' }
    ]
  }
])

// 根据类型返回对应选项
const currentOptions = computed(() => {
  return categoryType.value === 'product'
    ? productOptions.value
    : serviceOptions.value
})

/**
 * 处理类型切换
 * 保存当前值，切换后恢复对应类型的值
 */
const handleTypeChange = async (newType: CategoryType) => {
  const oldType = newType === 'product' ? 'service' : 'product'

  // 保存旧类型的选中值
  if (oldType === 'product') {
    formData.value.productPath = [...formData.value.categoryPath]
  } else {
    formData.value.servicePath = [...formData.value.categoryPath]
  }

  // 等待选项更新
  await nextTick()

  // 恢复新类型的选中值
  if (newType === 'product') {
    formData.value.categoryPath = [...formData.value.productPath]
  } else {
    formData.value.categoryPath = [...formData.value.servicePath]
  }

  // 强制刷新组件
  cascaderKey.value++
}

/**
 * 级联选择变化处理
 */
const handleCascaderChange = (value: string[]) => {
  // 同步更新到对应类型的存储
  if (categoryType.value === 'product') {
    formData.value.productPath = [...value]
  } else {
    formData.value.servicePath = [...value]
  }
}
</script>
```

**使用防抖避免频繁切换问题**：

```typescript
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface CascaderValueManager<T extends string | number> {
  currentValue: Ref<T[]>
  setOptions: (options: any[]) => void
  getValue: () => T[]
}

/**
 * 级联选择器值管理器
 * 处理动态数据源切换时的值保留问题
 */
function useCascaderValueManager<T extends string | number>(): CascaderValueManager<T> {
  const currentValue = ref<T[]>([]) as Ref<T[]>
  const optionsCache = ref<any[]>([])
  const pendingValue = ref<T[] | null>(null)

  // 防抖更新
  const debouncedUpdate = useDebounceFn(() => {
    if (pendingValue.value && validatePath(pendingValue.value, optionsCache.value)) {
      currentValue.value = pendingValue.value
    }
    pendingValue.value = null
  }, 100)

  /**
   * 验证路径是否在选项中存在
   */
  function validatePath(path: T[], options: any[]): boolean {
    let currentLevel = options

    for (const value of path) {
      const node = currentLevel.find(n => n.value === value)
      if (!node) return false
      currentLevel = node.children || []
    }

    return true
  }

  /**
   * 设置新的选项数据
   */
  function setOptions(options: any[]) {
    optionsCache.value = options

    // 检查当前值是否有效
    if (currentValue.value.length > 0) {
      if (!validatePath(currentValue.value, options)) {
        // 尝试查找部分匹配的路径
        const validPath = findValidSubPath(currentValue.value, options)
        pendingValue.value = validPath
        debouncedUpdate()
      }
    }
  }

  /**
   * 查找有效的子路径
   */
  function findValidSubPath(path: T[], options: any[]): T[] {
    const validPath: T[] = []
    let currentLevel = options

    for (const value of path) {
      const node = currentLevel.find(n => n.value === value)
      if (!node) break
      validPath.push(value)
      currentLevel = node.children || []
    }

    return validPath
  }

  return {
    currentValue,
    setOptions,
    getValue: () => currentValue.value
  }
}
```

---

### 4. 搜索过滤功能不生效或结果不正确

**问题描述**

启用 `filterable` 后，输入关键词无法搜索到期望的选项，或者搜索结果显示不正确。

**问题原因**

- 自定义 `filterMethod` 返回值逻辑错误
- 搜索字段与 `labelField` 配置不一致
- 大小写敏感问题
- 搜索范围未包含子节点
- 拼音搜索未实现

**解决方案**

```vue
<template>
  <AFormCascader
    v-model="formData.deptPath"
    :options="deptOptions"
    label="部门"
    prop="deptPath"
    :filterable="true"
    :filter-method="customFilter"
    :debounce="300"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DeptNode {
  value: string
  label: string
  pinyin?: string
  pinyinShort?: string
  children?: DeptNode[]
}

const formData = ref({
  deptPath: [] as string[]
})

const deptOptions = ref<DeptNode[]>([
  {
    value: '1',
    label: '技术中心',
    pinyin: 'jishuzhongxin',
    pinyinShort: 'jszx',
    children: [
      {
        value: '1-1',
        label: '前端开发部',
        pinyin: 'qianduankaifabu',
        pinyinShort: 'qdkfb'
      },
      {
        value: '1-2',
        label: '后端开发部',
        pinyin: 'houduankaifabu',
        pinyinShort: 'hdkfb'
      }
    ]
  },
  {
    value: '2',
    label: '产品中心',
    pinyin: 'chanpinzhongxin',
    pinyinShort: 'cpzx',
    children: [
      {
        value: '2-1',
        label: '产品设计部',
        pinyin: 'chanpinshejib',
        pinyinShort: 'cpsjb'
      }
    ]
  }
])

/**
 * 自定义搜索过滤方法
 * @param node 当前节点
 * @param keyword 搜索关键词
 */
function customFilter(node: { text: string; data: DeptNode }, keyword: string): boolean {
  // ❌ 错误做法 - 只匹配label
  // return node.text.includes(keyword)

  // ✅ 正确做法 - 多字段匹配
  const searchKeyword = keyword.toLowerCase().trim()

  if (!searchKeyword) return true

  const data = node.data

  // 匹配多个字段
  const matchFields = [
    data.label,           // 中文名称
    data.pinyin,          // 全拼
    data.pinyinShort,     // 简拼
    data.value            // 值
  ]

  return matchFields.some(field => {
    if (!field) return false
    return field.toLowerCase().includes(searchKeyword)
  })
}
</script>
```

**完整的搜索增强实现**：

```typescript
import pinyin from 'pinyin'

interface SearchableNode {
  value: string
  label: string
  searchText?: string
  children?: SearchableNode[]
}

/**
 * 级联搜索增强器
 */
class CascaderSearchEnhancer {
  private searchIndex = new Map<string, Set<string>>()

  /**
   * 为选项数据添加搜索字段
   */
  enhanceOptions(options: SearchableNode[]): SearchableNode[] {
    return this.processNodes(options)
  }

  private processNodes(nodes: SearchableNode[]): SearchableNode[] {
    return nodes.map(node => ({
      ...node,
      searchText: this.generateSearchText(node.label),
      children: node.children ? this.processNodes(node.children) : undefined
    }))
  }

  /**
   * 生成搜索文本（包含拼音）
   */
  private generateSearchText(label: string): string {
    const texts = [label.toLowerCase()]

    try {
      // 全拼
      const fullPinyin = pinyin(label, { style: pinyin.STYLE_NORMAL })
        .flat()
        .join('')
      texts.push(fullPinyin)

      // 首字母
      const firstLetters = pinyin(label, { style: pinyin.STYLE_FIRST_LETTER })
        .flat()
        .join('')
      texts.push(firstLetters)
    } catch (e) {
      // 拼音库可能不存在
    }

    return texts.join('|')
  }

  /**
   * 创建过滤方法
   */
  createFilterMethod() {
    return (node: { text: string; data: SearchableNode }, keyword: string): boolean => {
      const searchKeyword = keyword.toLowerCase().trim()
      if (!searchKeyword) return true

      const searchText = node.data.searchText || node.text.toLowerCase()
      return searchText.includes(searchKeyword)
    }
  }

  /**
   * 高亮匹配文本
   */
  highlightMatch(text: string, keyword: string): string {
    if (!keyword) return text

    const regex = new RegExp(`(${this.escapeRegex(keyword)})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

/**
 * 树形结构搜索
 * 搜索所有层级的节点
 */
function searchTreeNodes(
  nodes: SearchableNode[],
  keyword: string,
  matchFn: (node: SearchableNode, keyword: string) => boolean
): SearchableNode[] {
  const results: SearchableNode[] = []

  function traverse(nodeList: SearchableNode[], parentPath: SearchableNode[] = []) {
    for (const node of nodeList) {
      const currentPath = [...parentPath, node]

      if (matchFn(node, keyword)) {
        // 找到匹配项，添加完整路径
        results.push({
          ...node,
          _matchPath: currentPath.map(n => n.label).join(' / ')
        } as any)
      }

      if (node.children?.length) {
        traverse(node.children, currentPath)
      }
    }
  }

  traverse(nodes)
  return results
}
```

---

### 5. 多选模式下父子节点联动关系混乱

**问题描述**

多选模式下，勾选父节点不会自动勾选子节点，或者勾选子节点不会影响父节点状态，`checkStrictly` 配置似乎不生效。

**问题原因**

- `checkStrictly` 属性设置位置不正确
- 属性传递方式错误（应在props配置对象中）
- 对父子联动逻辑理解有误
- 组件版本差异导致API不同

**解决方案**

```vue
<template>
  <div>
    <!-- 联动模式：选中父节点自动选中所有子节点 -->
    <AFormCascader
      v-model="linkedSelection"
      :options="deptTree"
      label="联动选择"
      :multiple="true"
      :props="linkedProps"
    />

    <!-- 严格模式：父子节点独立选择 -->
    <AFormCascader
      v-model="strictSelection"
      :options="deptTree"
      label="独立选择"
      :multiple="true"
      :props="strictProps"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface DeptNode {
  value: string
  label: string
  children?: DeptNode[]
}

// ✅ 正确做法 - 在props配置对象中设置checkStrictly
const linkedProps = {
  multiple: true,
  checkStrictly: false,  // 父子联动
  emitPath: true,
  value: 'value',
  label: 'label',
  children: 'children'
}

const strictProps = {
  multiple: true,
  checkStrictly: true,  // 父子独立
  emitPath: true,
  value: 'value',
  label: 'label',
  children: 'children'
}

// ❌ 错误做法 - 直接在组件上设置（可能不生效）
// <AFormCascader :check-strictly="true" />

const linkedSelection = ref<string[][]>([])
const strictSelection = ref<string[][]>([])

const deptTree = ref<DeptNode[]>([
  {
    value: 'tech',
    label: '技术部',
    children: [
      {
        value: 'frontend',
        label: '前端组',
        children: [
          { value: 'vue', label: 'Vue团队' },
          { value: 'react', label: 'React团队' }
        ]
      },
      {
        value: 'backend',
        label: '后端组',
        children: [
          { value: 'java', label: 'Java团队' },
          { value: 'go', label: 'Go团队' }
        ]
      }
    ]
  }
])
</script>
```

**手动实现父子联动逻辑**：

```typescript
import { ref, watch, Ref } from 'vue'

interface TreeNode {
  value: string
  label: string
  children?: TreeNode[]
}

/**
 * 级联多选联动管理器
 */
class CascaderCheckManager {
  private nodeMap = new Map<string, TreeNode>()
  private parentMap = new Map<string, string>()  // 子节点 -> 父节点
  private childrenMap = new Map<string, string[]>()  // 父节点 -> 子节点列表

  constructor(options: TreeNode[]) {
    this.buildMaps(options)
  }

  private buildMaps(nodes: TreeNode[], parentValue?: string) {
    for (const node of nodes) {
      this.nodeMap.set(node.value, node)

      if (parentValue) {
        this.parentMap.set(node.value, parentValue)

        const siblings = this.childrenMap.get(parentValue) || []
        siblings.push(node.value)
        this.childrenMap.set(parentValue, siblings)
      }

      if (node.children?.length) {
        this.buildMaps(node.children, node.value)
      }
    }
  }

  /**
   * 获取所有子孙节点
   */
  getDescendants(value: string): string[] {
    const descendants: string[] = []
    const directChildren = this.childrenMap.get(value) || []

    for (const child of directChildren) {
      descendants.push(child)
      descendants.push(...this.getDescendants(child))
    }

    return descendants
  }

  /**
   * 获取所有祖先节点
   */
  getAncestors(value: string): string[] {
    const ancestors: string[] = []
    let current = this.parentMap.get(value)

    while (current) {
      ancestors.unshift(current)
      current = this.parentMap.get(current)
    }

    return ancestors
  }

  /**
   * 处理选中父节点 - 自动选中所有子孙节点
   */
  selectWithChildren(
    currentSelection: string[][],
    selectedPath: string[]
  ): string[][] {
    const newSelection = [...currentSelection]
    const targetValue = selectedPath[selectedPath.length - 1]

    // 获取所有子孙节点
    const descendants = this.getDescendants(targetValue)

    // 为每个子孙节点构建完整路径
    for (const descendant of descendants) {
      const path = [...this.getAncestors(descendant), descendant]
      if (!this.pathExists(newSelection, path)) {
        newSelection.push(path)
      }
    }

    return newSelection
  }

  /**
   * 处理取消选中父节点 - 自动取消所有子孙节点
   */
  deselectWithChildren(
    currentSelection: string[][],
    deselectedPath: string[]
  ): string[][] {
    const targetValue = deselectedPath[deselectedPath.length - 1]
    const descendants = new Set(this.getDescendants(targetValue))

    // 过滤掉所有子孙节点的选择
    return currentSelection.filter(path => {
      const lastValue = path[path.length - 1]
      return !descendants.has(lastValue)
    })
  }

  /**
   * 更新父节点状态
   * 当所有子节点都选中时，自动选中父节点
   */
  updateParentStatus(
    currentSelection: string[][],
    changedPath: string[]
  ): string[][] {
    let newSelection = [...currentSelection]
    const parentValue = this.parentMap.get(changedPath[changedPath.length - 1])

    if (!parentValue) return newSelection

    const siblings = this.childrenMap.get(parentValue) || []
    const selectedSiblings = newSelection.filter(path => {
      const lastValue = path[path.length - 1]
      return siblings.includes(lastValue)
    })

    if (selectedSiblings.length === siblings.length) {
      // 所有兄弟节点都选中，自动选中父节点
      const parentPath = this.getAncestors(siblings[0])
      parentPath.push(parentValue)

      if (!this.pathExists(newSelection, parentPath)) {
        newSelection.push(parentPath)
        // 递归检查更上层父节点
        newSelection = this.updateParentStatus(newSelection, parentPath)
      }
    }

    return newSelection
  }

  private pathExists(selection: string[][], path: string[]): boolean {
    return selection.some(s =>
      s.length === path.length && s.every((v, i) => v === path[i])
    )
  }
}

// Vue组合式函数
export function useCascaderCheckManager(options: Ref<TreeNode[]>) {
  const manager = ref<CascaderCheckManager>()

  watch(options, (newOptions) => {
    manager.value = new CascaderCheckManager(newOptions)
  }, { immediate: true })

  return {
    selectWithChildren: (selection: string[][], path: string[]) =>
      manager.value?.selectWithChildren(selection, path) || selection,
    deselectWithChildren: (selection: string[][], path: string[]) =>
      manager.value?.deselectWithChildren(selection, path) || selection,
    updateParentStatus: (selection: string[][], path: string[]) =>
      manager.value?.updateParentStatus(selection, path) || selection
  }
}
```

---

### 6. 自定义字段映射导致选项无法展开

**问题描述**

使用自定义的 `valueField`、`labelField`、`childrenField` 后，级联面板无法正常展开子节点，或显示为空。

**问题原因**

- 字段名配置错误或拼写错误
- 字段值类型不一致
- 配置传递方式错误（应在props对象中）
- 嵌套数据的字段名不一致
- children字段为空数组而非undefined

**解决方案**

```vue
<template>
  <AFormCascader
    v-model="formData.orgPath"
    :options="normalizedOptions"
    label="组织架构"
    prop="orgPath"
    :props="cascaderProps"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 后端返回的原始数据结构
interface OriginalOrgNode {
  orgId: number
  orgName: string
  orgCode: string
  subOrgs?: OriginalOrgNode[]
  isActive: boolean
}

// 级联选择器需要的标准数据结构
interface CascaderNode {
  value: string | number
  label: string
  disabled?: boolean
  children?: CascaderNode[]
}

const formData = ref({
  orgPath: [] as (string | number)[]
})

// 原始数据
const originalData = ref<OriginalOrgNode[]>([
  {
    orgId: 1,
    orgName: '集团总部',
    orgCode: 'HQ',
    isActive: true,
    subOrgs: [
      {
        orgId: 11,
        orgName: '技术中心',
        orgCode: 'TECH',
        isActive: true,
        subOrgs: [
          { orgId: 111, orgName: '研发部', orgCode: 'RD', isActive: true },
          { orgId: 112, orgName: '测试部', orgCode: 'QA', isActive: false }
        ]
      }
    ]
  }
])

// ✅ 正确做法1：使用props配置字段映射
const cascaderProps = {
  value: 'orgId',
  label: 'orgName',
  children: 'subOrgs',
  disabled: 'isDisabled',  // 注意：disabled需要是布尔值
  emitPath: true
}

// ✅ 正确做法2：在数据层面进行标准化
const normalizedOptions = computed(() => {
  return normalizeTree(originalData.value)
})

/**
 * 递归标准化树形数据
 */
function normalizeTree(nodes: OriginalOrgNode[]): CascaderNode[] {
  return nodes.map(node => ({
    value: node.orgId,
    label: node.orgName,
    disabled: !node.isActive,
    // 确保children处理正确
    children: node.subOrgs?.length
      ? normalizeTree(node.subOrgs)
      : undefined  // 使用undefined而非空数组，避免显示展开箭头
  }))
}

// ❌ 错误做法 - children为空数组会导致显示展开箭头但无内容
// children: node.subOrgs || []
</script>
```

**通用数据适配器**：

```typescript
interface FieldMapping {
  value: string
  label: string
  children: string
  disabled?: string
  leaf?: string
}

interface TreeAdapterOptions {
  fieldMapping: FieldMapping
  disabledValue?: any  // 当disabled字段等于此值时禁用
  leafCheck?: (node: any) => boolean  // 自定义叶子节点判断
}

/**
 * 树形数据适配器
 * 将任意字段名的树形数据转换为级联选择器标准格式
 */
class TreeDataAdapter {
  private options: TreeAdapterOptions

  constructor(options: TreeAdapterOptions) {
    this.options = {
      ...options,
      disabledValue: options.disabledValue ?? false
    }
  }

  /**
   * 适配数据
   */
  adapt<T extends Record<string, any>>(data: T[]): CascaderNode[] {
    return this.processNodes(data)
  }

  private processNodes<T extends Record<string, any>>(nodes: T[]): CascaderNode[] {
    const { fieldMapping, disabledValue, leafCheck } = this.options

    return nodes.map(node => {
      const value = this.getValue(node, fieldMapping.value)
      const label = this.getValue(node, fieldMapping.label)
      const childrenData = this.getValue(node, fieldMapping.children)
      const disabledField = fieldMapping.disabled
        ? this.getValue(node, fieldMapping.disabled)
        : false

      // 判断是否禁用
      const disabled = disabledField === disabledValue

      // 判断是否为叶子节点
      const isLeaf = leafCheck
        ? leafCheck(node)
        : !childrenData || (Array.isArray(childrenData) && childrenData.length === 0)

      const result: CascaderNode = {
        value,
        label: String(label),
        disabled
      }

      // 只有非叶子节点才添加children属性
      if (!isLeaf && Array.isArray(childrenData) && childrenData.length > 0) {
        result.children = this.processNodes(childrenData)
      }

      return result
    })
  }

  /**
   * 支持嵌套路径获取值，如 'org.name'
   */
  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj)
  }
}

// 使用示例
const adapter = new TreeDataAdapter({
  fieldMapping: {
    value: 'orgId',
    label: 'orgName',
    children: 'subOrgs',
    disabled: 'status'
  },
  disabledValue: 0,  // status为0时禁用
  leafCheck: (node) => !node.subOrgs?.length
})

const cascaderOptions = adapter.adapt(originalData.value)
```

---

### 7. emitPath与后端数据格式不匹配

**问题描述**

后端接口期望接收单个值（叶子节点ID），但级联选择器返回的是完整路径数组；或者后端返回的是单值，级联选择器期望的是路径数组。

**问题原因**

- `emitPath` 配置与业务需求不匹配
- 前后端数据格式约定不一致
- 表单提交时未进行数据转换
- 编辑回显时未将单值转换为路径

**解决方案**

```vue
<template>
  <AFormCascader
    v-model="cascaderValue"
    :options="categoryOptions"
    label="分类"
    prop="category"
    :emit-path="true"
    @change="handleCascaderChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface CategoryNode {
  value: string
  label: string
  children?: CategoryNode[]
}

// 后端期望的数据格式
interface BackendFormData {
  categoryId: string  // 只需要叶子节点ID
  categoryPath?: string  // 可选：完整路径字符串
}

// 前端级联选择器使用的值（路径数组）
const cascaderValue = ref<string[]>([])

// 后端表单数据
const backendData = ref<BackendFormData>({
  categoryId: '',
  categoryPath: ''
})

const categoryOptions = ref<CategoryNode[]>([
  {
    value: 'electronics',
    label: '电子产品',
    children: [
      {
        value: 'phones',
        label: '手机',
        children: [
          { value: 'iphone', label: 'iPhone' },
          { value: 'android', label: '安卓手机' }
        ]
      }
    ]
  }
])

/**
 * 级联选择器值变化处理
 * 将路径数组转换为后端需要的格式
 */
const handleCascaderChange = (pathArray: string[]) => {
  if (!pathArray?.length) {
    backendData.value.categoryId = ''
    backendData.value.categoryPath = ''
    return
  }

  // 提取叶子节点值
  backendData.value.categoryId = pathArray[pathArray.length - 1]

  // 可选：保存完整路径（用逗号分隔）
  backendData.value.categoryPath = pathArray.join(',')

  // 或者获取完整标签路径
  const labels = getPathLabels(pathArray, categoryOptions.value)
  console.log('完整路径标签:', labels.join(' / '))
}

/**
 * 根据值数组获取标签数组
 */
function getPathLabels(pathValues: string[], options: CategoryNode[]): string[] {
  const labels: string[] = []
  let currentLevel = options

  for (const value of pathValues) {
    const node = currentLevel.find(n => n.value === value)
    if (node) {
      labels.push(node.label)
      currentLevel = node.children || []
    }
  }

  return labels
}

/**
 * 表单提交前的数据转换
 */
const prepareSubmitData = () => {
  return {
    ...backendData.value,
    // 确保只提交必要的字段
    categoryId: cascaderValue.value[cascaderValue.value.length - 1] || ''
  }
}

/**
 * 编辑时的数据回显
 * 将后端的单值转换为路径数组
 */
const initFromBackend = async (data: { categoryId: string }) => {
  if (!data.categoryId) {
    cascaderValue.value = []
    return
  }

  // 根据叶子节点ID查找完整路径
  const path = findPathByLeafValue(categoryOptions.value, data.categoryId)

  if (path) {
    cascaderValue.value = path
  } else {
    console.warn(`未找到节点: ${data.categoryId}`)
    cascaderValue.value = []
  }
}

/**
 * 根据叶子节点值查找完整路径
 */
function findPathByLeafValue(
  nodes: CategoryNode[],
  targetValue: string,
  currentPath: string[] = []
): string[] | null {
  for (const node of nodes) {
    const newPath = [...currentPath, node.value]

    if (node.value === targetValue) {
      return newPath
    }

    if (node.children?.length) {
      const result = findPathByLeafValue(node.children, targetValue, newPath)
      if (result) return result
    }
  }

  return null
}
</script>
```

**数据格式转换工具类**：

```typescript
interface CascaderDataConverter {
  pathToLeaf: (path: string[]) => string
  leafToPath: (leaf: string, options: CategoryNode[]) => string[]
  pathToString: (path: string[], separator?: string) => string
  stringToPath: (pathString: string, separator?: string) => string[]
}

/**
 * 创建级联数据转换器
 */
function createCascaderConverter(options: CategoryNode[]): CascaderDataConverter {
  // 构建值到路径的映射
  const valueToPathMap = new Map<string, string[]>()

  function buildMap(nodes: CategoryNode[], currentPath: string[] = []) {
    for (const node of nodes) {
      const path = [...currentPath, node.value]
      valueToPathMap.set(node.value, path)

      if (node.children?.length) {
        buildMap(node.children, path)
      }
    }
  }

  buildMap(options)

  return {
    /**
     * 路径数组 -> 叶子节点值
     */
    pathToLeaf(path: string[]): string {
      return path[path.length - 1] || ''
    },

    /**
     * 叶子节点值 -> 路径数组
     */
    leafToPath(leaf: string): string[] {
      return valueToPathMap.get(leaf) || []
    },

    /**
     * 路径数组 -> 字符串
     */
    pathToString(path: string[], separator = ','): string {
      return path.join(separator)
    },

    /**
     * 字符串 -> 路径数组
     */
    stringToPath(pathString: string, separator = ','): string[] {
      return pathString ? pathString.split(separator) : []
    }
  }
}

// Vue组合式函数
export function useCascaderConverter(optionsRef: Ref<CategoryNode[]>) {
  const converter = computed(() => createCascaderConverter(optionsRef.value))

  return {
    toLeafValue: (path: string[]) => converter.value.pathToLeaf(path),
    toPathArray: (leaf: string) => converter.value.leafToPath(leaf),
    toPathString: (path: string[], sep?: string) => converter.value.pathToString(path, sep),
    fromPathString: (str: string, sep?: string) => converter.value.stringToPath(str, sep)
  }
}
```

---

### 8. 大数据量级联选择器卡顿

**问题描述**

当级联选择器的数据量较大（如几千个节点）时，打开下拉面板或展开节点时出现明显卡顿。

**问题原因**

- 一次性渲染大量DOM节点
- 未使用懒加载模式
- 搜索过滤时遍历整个树
- 频繁的响应式更新
- 未使用虚拟滚动

**解决方案**

```vue
<template>
  <AFormCascader
    v-model="formData.areaCode"
    :options="visibleOptions"
    label="地区"
    prop="areaCode"
    :lazy="true"
    :load-data="lazyLoadChildren"
    :filterable="true"
    :filter-method="optimizedFilter"
    :props="cascaderProps"
    :debounce="300"
  />
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'

interface AreaNode {
  value: string
  label: string
  leaf?: boolean
  children?: AreaNode[]
  _loaded?: boolean
}

const formData = ref({
  areaCode: [] as string[]
})

// 使用shallowRef减少响应式开销
const allOptions = shallowRef<AreaNode[]>([])
const visibleOptions = shallowRef<AreaNode[]>([])

// 缓存已加载的子节点
const childrenCache = new Map<string, AreaNode[]>()

const cascaderProps = {
  lazy: true,
  value: 'value',
  label: 'label',
  children: 'children',
  leaf: 'leaf'
}

/**
 * 懒加载子节点
 */
const lazyLoadChildren = async (
  node: { level: number; value: string; data: AreaNode },
  resolve: (nodes: AreaNode[]) => void
) => {
  const parentValue = node.value

  // 检查缓存
  if (childrenCache.has(parentValue)) {
    resolve(childrenCache.get(parentValue)!)
    return
  }

  try {
    // 分批加载数据
    const children = await fetchChildrenWithPagination(parentValue, node.level)

    // 标记叶子节点
    const processedChildren = children.map(child => ({
      ...child,
      leaf: node.level >= 2  // 3级为叶子节点
    }))

    // 缓存数据
    childrenCache.set(parentValue, processedChildren)

    resolve(processedChildren)
  } catch (error) {
    console.error('加载失败:', error)
    resolve([])
  }
}

/**
 * 分页加载子节点
 */
async function fetchChildrenWithPagination(
  parentValue: string | null,
  level: number
): Promise<AreaNode[]> {
  const pageSize = 100
  const allChildren: AreaNode[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await fetchAreaData({
      parentCode: parentValue,
      page,
      pageSize
    })

    allChildren.push(...response.data)
    hasMore = response.hasMore
    page++

    // 防止无限循环
    if (page > 100) break
  }

  return allChildren
}

/**
 * 优化的搜索过滤
 * 使用索引加速搜索
 */
const searchIndex = new Map<string, AreaNode>()

function buildSearchIndex(nodes: AreaNode[], parentPath: string = '') {
  for (const node of nodes) {
    const key = `${parentPath}/${node.value}`
    searchIndex.set(node.label.toLowerCase(), node)
    searchIndex.set(node.value.toLowerCase(), node)

    if (node.children?.length) {
      buildSearchIndex(node.children, key)
    }
  }
}

const optimizedFilter = (() => {
  let lastKeyword = ''
  let lastResults: Set<string> | null = null

  return (node: { text: string; data: AreaNode }, keyword: string): boolean => {
    const searchKeyword = keyword.toLowerCase().trim()

    if (!searchKeyword) return true

    // 使用缓存的搜索结果
    if (keyword === lastKeyword && lastResults) {
      return lastResults.has(node.data.value)
    }

    // 简单匹配
    return node.text.toLowerCase().includes(searchKeyword)
  }
})()

/**
 * 虚拟滚动支持
 * 只渲染可见区域的选项
 */
class VirtualCascaderPanel {
  private containerHeight = 300
  private itemHeight = 34
  private buffer = 5

  private scrollTop = 0
  private visibleRange = { start: 0, end: 0 }

  constructor(private nodes: AreaNode[]) {
    this.calculateVisibleRange()
  }

  onScroll(scrollTop: number) {
    this.scrollTop = scrollTop
    this.calculateVisibleRange()
  }

  private calculateVisibleRange() {
    const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.buffer)
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    const end = Math.min(this.nodes.length, start + visibleCount + this.buffer * 2)

    this.visibleRange = { start, end }
  }

  getVisibleNodes(): AreaNode[] {
    return this.nodes.slice(this.visibleRange.start, this.visibleRange.end)
  }

  getTotalHeight(): number {
    return this.nodes.length * this.itemHeight
  }

  getOffsetTop(): number {
    return this.visibleRange.start * this.itemHeight
  }
}

/**
 * 数据分片加载
 * 初始只加载第一级
 */
const initOptions = async () => {
  // 只加载第一级数据
  const rootNodes = await fetchAreaData({ parentCode: null, level: 0 })

  visibleOptions.value = rootNodes.map(node => ({
    ...node,
    leaf: false  // 非叶子节点
  }))
}

// 模拟API
async function fetchAreaData(params: {
  parentCode: string | null
  page?: number
  pageSize?: number
  level?: number
}): Promise<{ data: AreaNode[]; hasMore: boolean }> {
  await new Promise(r => setTimeout(r, 100))

  // 模拟数据
  const mockData: AreaNode[] = []
  for (let i = 0; i < 10; i++) {
    mockData.push({
      value: `${params.parentCode || 'root'}_${i}`,
      label: `选项 ${i + 1}`
    })
  }

  return { data: mockData, hasMore: false }
}

onMounted(() => {
  initOptions()
})
</script>
```

**性能优化策略总结**：

```typescript
/**
 * 级联选择器性能优化器
 */
class CascaderPerformanceOptimizer {
  /**
   * 1. 数据扁平化缓存
   * 将树形结构扁平化，加速查找
   */
  private flattenedCache = new Map<string, {
    node: AreaNode
    path: string[]
    depth: number
  }>()

  /**
   * 2. 搜索结果缓存
   */
  private searchCache = new Map<string, AreaNode[]>()
  private readonly MAX_CACHE_SIZE = 100

  /**
   * 3. 防抖搜索
   */
  private searchDebounceTimer: number | null = null

  /**
   * 4. 分批渲染
   */
  async batchRender(
    nodes: AreaNode[],
    batchSize = 50,
    onBatch: (batch: AreaNode[]) => void
  ) {
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize)
      onBatch(batch)

      // 让出主线程
      await new Promise(r => requestAnimationFrame(r))
    }
  }

  /**
   * 5. Web Worker 后台搜索
   */
  createSearchWorker(): Worker {
    const workerCode = `
      let treeData = [];

      self.onmessage = function(e) {
        if (e.data.type === 'init') {
          treeData = e.data.data;
        } else if (e.data.type === 'search') {
          const results = searchTree(treeData, e.data.keyword);
          self.postMessage({ type: 'result', data: results });
        }
      };

      function searchTree(nodes, keyword, path = []) {
        const results = [];
        for (const node of nodes) {
          const currentPath = [...path, node.value];
          if (node.label.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({ ...node, _path: currentPath });
          }
          if (node.children) {
            results.push(...searchTree(node.children, keyword, currentPath));
          }
        }
        return results;
      }
    `

    const blob = new Blob([workerCode], { type: 'application/javascript' })
    return new Worker(URL.createObjectURL(blob))
  }

  /**
   * 6. 内存优化 - 使用WeakRef缓存
   */
  private nodeWeakRefs = new Map<string, WeakRef<AreaNode>>()

  cacheNode(value: string, node: AreaNode) {
    this.nodeWeakRefs.set(value, new WeakRef(node))
  }

  getNode(value: string): AreaNode | undefined {
    return this.nodeWeakRefs.get(value)?.deref()
  }

  /**
   * 7. 清理过期缓存
   */
  cleanupCache() {
    // 清理搜索缓存
    if (this.searchCache.size > this.MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(this.searchCache.keys())
        .slice(0, this.searchCache.size - this.MAX_CACHE_SIZE)
      keysToDelete.forEach(key => this.searchCache.delete(key))
    }

    // 清理WeakRef中已被GC的引用
    for (const [key, ref] of this.nodeWeakRefs) {
      if (!ref.deref()) {
        this.nodeWeakRefs.delete(key)
      }
    }
  }
}
