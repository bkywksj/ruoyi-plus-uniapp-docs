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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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
<script setup>
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

<script setup>
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

<script setup>
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
<script setup>
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
<script setup>
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

<script setup>
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
