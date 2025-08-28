# AFormSelect 选择器组件

AFormSelect 是一个功能强大的选择器组件，基于 Element Plus 的 ElSelect 封装，支持单选、多选、自定义字段映射和复杂的禁用条件。

## 基础用法

### 单选选择器

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormSelect 
    v-model="queryParams.status" 
    :options="statusOptions" 
    label="状态" 
    prop="status" 
    @change="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormSelect 
    v-model="form.type" 
    :options="typeOptions" 
    label="类型" 
    prop="type" 
    :span="12" 
  />
</template>

<script setup>
const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

const typeOptions = [
  { label: '普通用户', value: 'normal' },
  { label: '管理员', value: 'admin' },
  { label: '超级管理员', value: 'super_admin' }
]
</script>
```

### 多选选择器

```vue
<template>
  <AFormSelect 
    v-model="form.roles" 
    :options="roleOptions" 
    label="角色" 
    prop="roles"
    multiple
    :span="12" 
  />
</template>

<script setup>
const roleOptions = [
  { label: '用户管理员', value: 'user_admin' },
  { label: '内容管理员', value: 'content_admin' },
  { label: '系统管理员', value: 'system_admin' }
]
</script>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| Array<string \| number>` | `''` | 绑定值 |
| `options` | `Array<any>` | `[]` | 选项数据 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项包装 |

### 选择器属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `multiple` | `boolean` | `false` | 是否多选 |
| `clearable` | `boolean` | `true` | 是否可清空 |
| `filterable` | `boolean` | `false` | 是否可搜索 |
| `placeholder` | `string` | - | 占位符（自动生成） |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `ElSize` | `''` | 组件尺寸 |

### 字段映射属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `valueField` | `string` | `'value'` | 值字段名 |
| `labelField` | `string` | `'label'` | 标签字段名 |
| `disabledField` | `string` | `'status'` | 禁用判断字段名 |
| `disabledValue` | `any \| Array \| Function` | `'0'` | 禁用条件值 |

### 多选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `multipleLimit` | `number` | `0` | 多选时最多选择项目数 |
| `collapseTags` | `boolean` | `false` | 是否折叠多选标签 |
| `collapseTagsTooltip` | `boolean` | `false` | 鼠标悬停时显示所有标签 |

### 样式属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `labelWidth` | `string \| number` | - | 标签宽度 |
| `tooltip` | `string` | `''` | 提示信息 |

## 使用示例

### 自定义字段映射

```vue
<template>
  <AFormSelect 
    v-model="form.userId" 
    :options="userList" 
    label="用户" 
    prop="userId"
    value-field="id" 
    label-field="name" 
    :span="12" 
  />
</template>

<script setup>
const userList = [
  { id: 1, name: '张三', department: '技术部' },
  { id: 2, name: '李四', department: '产品部' },
  { id: 3, name: '王五', department: '设计部' }
]
</script>
```

### 带前缀图标的选择器

```vue
<template>
  <AFormSelect 
    v-model="form.tenantId" 
    :options="tenantList" 
    label="租户" 
    prop="tenantId"
    value-field="tenantId" 
    label-field="companyName" 
  >
    <template #prefix>
      <Icon code="company" />
    </template>
  </AFormSelect>
</template>
```

### 条件禁用选项

```vue
<template>
  <!-- 根据 status 字段禁用 -->
  <AFormSelect 
    v-model="form.postId" 
    :options="postOptions" 
    label="岗位" 
    value-field="postId" 
    label-field="postName" 
    disabled-field="status"
    disabled-value="0"
    :span="12" 
  />
</template>

<script setup>
const postOptions = [
  { postId: 1, postName: '前端开发', status: '1' },
  { postId: 2, postName: '后端开发', status: '0' }, // 这个选项会被禁用
  { postId: 3, postName: 'UI设计师', status: '1' }
]
</script>
```

### 多值禁用条件

```vue
<template>
  <AFormSelect 
    v-model="form.deptId" 
    :options="deptList" 
    label="部门" 
    value-field="deptId" 
    label-field="deptName" 
    disabled-field="status" 
    :disabled-value="['0', '3']"
    :span="12" 
  />
</template>

<script setup>
const deptList = [
  { deptId: 1, deptName: '技术部', status: '1' },
  { deptId: 2, deptName: '产品部', status: '0' }, // 禁用
  { deptId: 3, deptName: '设计部', status: '3' }, // 禁用
  { deptId: 4, deptName: '运营部', status: '1' }
]
</script>
```

### 函数式禁用条件

```vue
<template>
  <AFormSelect 
    v-model="form.goodsId" 
    :options="productList" 
    label="商品" 
    value-field="id" 
    label-field="name" 
    :disabled-value="isProductDisabled"
  />
</template>

<script setup>
const productList = [
  { id: 1, name: '商品A', status: '1', stock: 100 },
  { id: 2, name: '商品B', status: '0', stock: 0 }, // 下架且无库存
  { id: 3, name: '商品C', status: '1', stock: 5 }   // 库存较少
]

const isProductDisabled = (item) => {
  return item.status === '0' || item.stock < 10
}
</script>
```

### 多选模式

```vue
<template>
  <AFormSelect 
    v-model="form.permissions" 
    :options="permissionOptions" 
    label="权限" 
    prop="permissions"
    multiple
    collapse-tags
    collapse-tags-tooltip
    :multiple-limit="5"
    :span="12" 
  />
</template>

<script setup>
const form = reactive({
  permissions: [] // 多选时绑定数组
})

const permissionOptions = [
  { label: '用户查看', value: 'user:view' },
  { label: '用户新增', value: 'user:add' },
  { label: '用户编辑', value: 'user:edit' },
  { label: '用户删除', value: 'user:delete' }
]
</script>
```

### 可搜索选择器

```vue
<template>
  <AFormSelect 
    v-model="form.cityId" 
    :options="cityOptions" 
    label="城市" 
    prop="cityId"
    filterable
    value-field="code" 
    label-field="name" 
    :span="12" 
  />
</template>

<script setup>
const cityOptions = [
  { code: '110000', name: '北京市' },
  { code: '120000', name: '天津市' },
  { code: '310000', name: '上海市' },
  { code: '500000', name: '重庆市' }
]
</script>
```

### 带提示信息的选择器

```vue
<template>
  <AFormSelect 
    v-model="form.level" 
    :options="levelOptions" 
    label="用户等级" 
    prop="level"
    tooltip="不同等级享有不同的权限和优惠" 
    :span="12" 
  />
</template>
```

### 不含表单项的纯选择器

```vue
<template>
  <AFormSelect 
    v-model="selectedStatus" 
    :options="statusOptions" 
    placeholder="选择状态..." 
    :show-form-item="false" 
    @change="handleStatusChange"
  />
</template>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormSelect 
    v-model="form.category"
    :options="categoryOptions"
    label="分类"
    @change="handleChange"
    @visible-change="handleVisibleChange"
    @remove-tag="handleRemoveTag"
    @clear="handleClear"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
const handleChange = (value) => {
  console.log('选择变化:', value)
  // 可以根据选择更新其他字段
}

const handleVisibleChange = (visible) => {
  console.log('下拉框显示状态:', visible)
}

const handleRemoveTag = (removedValue) => {
  console.log('移除标签:', removedValue)
}

const handleClear = () => {
  console.log('清空选择')
}
</script>
```

### 联动选择

```vue
<template>
  <el-row :gutter="20">
    <AFormSelect 
      v-model="form.provinceId" 
      :options="provinces" 
      label="省份" 
      prop="provinceId"
      @change="handleProvinceChange"
      :span="12" 
    />
    
    <AFormSelect 
      v-model="form.cityId" 
      :options="cities" 
      label="城市" 
      prop="cityId"
      :disabled="!form.provinceId"
      :span="12" 
    />
  </el-row>
</template>

<script setup>
const provinces = ref([
  { value: '11', label: '北京市' },
  { value: '31', label: '上海市' }
])

const cities = ref([])

const handleProvinceChange = async (provinceId) => {
  // 清空城市选择
  form.cityId = ''
  
  if (provinceId) {
    // 加载对应省份的城市数据
    cities.value = await getCitiesByProvince(provinceId)
  } else {
    cities.value = []
  }
}
</script>
```

## 高级用法

### 远程搜索

```vue
<template>
  <AFormSelect 
    v-model="form.userId"
    :options="remoteUsers"
    label="用户"
    prop="userId"
    filterable
    remote
    reserve-keyword
    placeholder="请输入用户名搜索"
    :remote-method="remoteSearch"
    :loading="loading"
    value-field="id"
    label-field="name"
  />
</template>

<script setup>
const remoteUsers = ref([])
const loading = ref(false)

const remoteSearch = debounce(async (query) => {
  if (query !== '') {
    loading.value = true
    try {
      const users = await searchUsers(query)
      remoteUsers.value = users
    } finally {
      loading.value = false
    }
  } else {
    remoteUsers.value = []
  }
}, 300)
</script>
```

### 自定义选项模板

```vue
<template>
  <AFormSelect 
    v-model="form.userId"
    :options="userOptions"
    label="用户"
    value-field="id"
    label-field="name"
  >
    <template #default="{ option }">
      <div class="flex items-center">
        <el-avatar :size="24" :src="option.avatar" />
        <div class="ml-2">
          <div>{{ option.name }}</div>
          <div class="text-xs text-gray-500">{{ option.department }}</div>
        </div>
      </div>
    </template>
  </AFormSelect>
</template>
```

### 动态选项加载

```vue
<template>
  <AFormSelect 
    v-model="form.productId"
    :options="productOptions"
    label="商品"
    prop="productId"
    :loading="loadingProducts"
    @visible-change="handleVisibleChange"
  />
</template>

<script setup>
const productOptions = ref([])
const loadingProducts = ref(false)

const loadProducts = async () => {
  if (productOptions.value.length > 0) return
  
  loadingProducts.value = true
  try {
    const products = await getProducts()
    productOptions.value = products
  } finally {
    loadingProducts.value = false
  }
}

const handleVisibleChange = (visible) => {
  if (visible) {
    loadProducts()
  }
}
</script>
```

### 分组选项

```vue
<template>
  <AFormSelect 
    v-model="form.roleId"
    :options="groupedRoles"
    label="角色"
    prop="roleId"
    value-field="id"
    label-field="name"
  >
    <template #default="{ option }">
      <el-option-group
        v-if="option.options"
        :key="option.label"
        :label="option.label"
      >
        <el-option
          v-for="item in option.options"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          :disabled="item.disabled"
        />
      </el-option-group>
      <span v-else>{{ option.name }}</span>
    </template>
  </AFormSelect>
</template>

<script setup>
const groupedRoles = [
  {
    label: '系统角色',
    options: [
      { id: 1, name: '超级管理员', disabled: false },
      { id: 2, name: '系统管理员', disabled: false }
    ]
  },
  {
    label: '业务角色',
    options: [
      { id: 3, name: '业务管理员', disabled: false },
      { id: 4, name: '普通用户', disabled: false }
    ]
  }
]
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormSelect 
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
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}
</script>
```

### 多选验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormSelect 
      v-model="form.tags" 
      :options="tagOptions" 
      label="标签" 
      prop="tags"
      multiple
    />
  </el-form>
</template>

<script setup>
const rules = {
  tags: [
    { 
      required: true, 
      type: 'array', 
      min: 1, 
      message: '请至少选择一个标签', 
      trigger: 'change' 
    }
  ]
}
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormSelect 
    v-model="form.theme"
    :options="themeOptions"
    label="主题"
    class="custom-select"
  />
</template>

<style scoped>
.custom-select :deep(.el-select) {
  --el-select-border-color-hover: #409eff;
}

.custom-select :deep(.el-select__tags) {
  max-width: calc(100% - 30px);
}
</style>
```

### 响应式布局

```vue
<template>
  <AFormSelect 
    v-model="form.status"
    :options="statusOptions"
    label="状态"
    :span="isMobile ? 24 : 8"
  />
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'
const { isMobile } = useBreakpoint()
</script>
```

## 最佳实践

### 1. 合理设置选项数量

```vue
<template>
  <!-- 选项较少时，使用普通选择器 -->
  <AFormSelect v-model="form.gender" :options="genderOptions" />
  
  <!-- 选项较多时，启用搜索功能 -->
  <AFormSelect 
    v-model="form.cityId" 
    :options="cityOptions" 
    filterable
  />
</template>
```

### 2. 优化多选体验

```vue
<template>
  <AFormSelect 
    v-model="form.skills"
    :options="skillOptions"
    label="技能"
    multiple
    collapse-tags
    collapse-tags-tooltip
    :multiple-limit="10"
  />
</template>
```

### 3. 提供清晰的状态反馈

```vue
<template>
  <AFormSelect 
    v-model="form.departmentId"
    :options="departments"
    label="部门"
    :loading="loadingDepts"
    placeholder="正在加载部门..."
  />
</template>
```

### 4. 合理的字段映射

```vue
<template>
  <!-- 保持字段名的语义化 -->
  <AFormSelect 
    v-model="form.managerId"
    :options="managers"
    label="直属经理"
    value-field="employeeId"
    label-field="employeeName"
  />
</template>
```

## 注意事项

1. **数据类型一致性**：确保绑定值与选项值的数据类型一致
2. **多选模式**：多选时绑定值必须是数组类型
3. **禁用条件**：复杂的禁用逻辑建议使用函数形式
4. **性能优化**：大量选项时考虑使用虚拟滚动或远程搜索
5. **无障碍访问**：为重要的选择器设置合适的 label 和提示信息
