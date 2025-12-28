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

## 常见问题

### 1. 选择器值与选项不匹配导致显示为空

**问题描述**

选择器已经设置了值，但下拉框中没有显示对应的选项标签，或者显示的是原始值而不是标签文本。

**问题原因**

- 绑定值与选项中的值数据类型不一致（如字符串 `'1'` 与数字 `1`）
- 选项数据后于绑定值加载，导致匹配失败
- 使用了自定义 valueField 但值字段不存在或拼写错误
- 选项数据格式不正确

**解决方案**

```vue
<!-- ❌ 错误：类型不一致 -->
<script setup>
const form = reactive({
  status: 1  // 数字类型
})

const statusOptions = [
  { label: '启用', value: '1' },  // 字符串类型
  { label: '禁用', value: '0' }
]
</script>

<!-- ✅ 正确：保持类型一致 -->
<script setup>
const form = reactive({
  status: '1'  // 字符串类型
})

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]
</script>
```

**处理后端返回的数值类型**

```typescript
// ✅ 方案1：在接口层统一转换
interface UserForm {
  status: string
}

async function getUserDetail(id: string) {
  const [err, data] = await getUserById(id)
  if (!err && data) {
    // 确保状态值为字符串
    return {
      ...data,
      status: String(data.status)
    }
  }
  return null
}

// ✅ 方案2：选项值与后端保持一致
const statusOptions = computed(() => [
  { label: '启用', value: 1 },   // 使用数字类型匹配后端
  { label: '禁用', value: 0 }
])

// ✅ 方案3：使用类型转换工具
function normalizeSelectValue(
  value: string | number | null | undefined,
  options: Array<{ value: string | number }>
): string | number | undefined {
  if (value === null || value === undefined) return undefined

  // 尝试匹配原始类型
  const exactMatch = options.find(opt => opt.value === value)
  if (exactMatch) return value

  // 尝试字符串匹配
  const stringMatch = options.find(opt => String(opt.value) === String(value))
  if (stringMatch) return stringMatch.value

  return value
}
```

**确保选项数据先于值加载**

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const form = reactive({
  categoryId: ''
})

const categoryOptions = ref<CategoryOption[]>([])
const optionsLoaded = ref(false)

// 先加载选项
onMounted(async () => {
  await loadCategoryOptions()
  optionsLoaded.value = true
  // 选项加载完成后再加载表单数据
  await loadFormData()
})

async function loadCategoryOptions() {
  const [err, data] = await getCategoryList()
  if (!err) {
    categoryOptions.value = data
  }
}

async function loadFormData() {
  const [err, data] = await getFormDetail(formId)
  if (!err) {
    // 此时选项已经加载完成
    Object.assign(form, data)
  }
}
</script>

<template>
  <AFormSelect
    v-model="form.categoryId"
    :options="categoryOptions"
    label="分类"
    :loading="!optionsLoaded"
  />
</template>
```

---

### 2. 多选模式下绑定值类型错误

**问题描述**

多选选择器无法正常工作，选中项无法显示，或者控制台报错提示类型错误。

**问题原因**

- 多选模式下绑定值不是数组类型
- 初始值为 null 或 undefined 而非空数组
- 选项值数组元素类型与绑定值元素类型不一致

**解决方案**

```vue
<!-- ❌ 错误：绑定值不是数组 -->
<script setup>
const form = reactive({
  roles: ''  // 字符串类型
})
</script>

<template>
  <AFormSelect v-model="form.roles" :options="roleOptions" multiple />
</template>

<!-- ✅ 正确：绑定值为数组 -->
<script setup>
const form = reactive({
  roles: [] as string[]  // 数组类型
})
</script>

<template>
  <AFormSelect v-model="form.roles" :options="roleOptions" multiple />
</template>
```

**处理后端返回的逗号分隔字符串**

```typescript
// 后端返回: { roles: "admin,user,viewer" }

interface UserFormVo {
  roles: string  // 后端返回字符串
}

interface UserFormBo {
  roles: string[]  // 前端使用数组
}

// ✅ 数据转换工具
function parseMultiSelectValue(value: string | string[] | null): string[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  return value.split(',').filter(Boolean)
}

function formatMultiSelectValue(value: string[]): string {
  return value.join(',')
}

// ✅ 在加载和保存时转换
async function loadUserForm(userId: string) {
  const [err, data] = await getUserById(userId)
  if (!err && data) {
    return {
      ...data,
      roles: parseMultiSelectValue(data.roles)
    }
  }
  return null
}

async function saveUserForm(form: UserFormBo) {
  const submitData = {
    ...form,
    roles: formatMultiSelectValue(form.roles)
  }
  return await updateUser(submitData)
}
```

**处理 null/undefined 初始值**

```vue
<script setup lang="ts">
import { reactive, watch } from 'vue'

interface FormData {
  tags: string[]
  categories: number[]
}

// ✅ 确保初始值为空数组
const form = reactive<FormData>({
  tags: [],
  categories: []
})

// ✅ 在赋值时确保类型正确
function setFormData(data: Partial<FormData>) {
  form.tags = data.tags ?? []
  form.categories = data.categories ?? []
}

// ✅ 使用 computed 确保类型安全
const safeRoles = computed({
  get: () => form.roles ?? [],
  set: (val) => { form.roles = val ?? [] }
})
</script>

<template>
  <AFormSelect v-model="safeRoles" :options="roleOptions" multiple />
</template>
```

---

### 3. 远程搜索时选项闪烁或重复请求

**问题描述**

使用远程搜索功能时，下拉选项频繁闪烁，或者同一关键词发起多次请求，导致性能问题和用户体验不佳。

**问题原因**

- 未对搜索输入进行防抖处理
- 快速输入导致多个请求并发，响应顺序不确定
- 未取消之前的请求，旧请求的响应覆盖了新结果
- 搜索方法未正确处理空字符串

**解决方案**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'lodash-es'

const remoteUsers = ref<UserOption[]>([])
const loading = ref(false)
let abortController: AbortController | null = null

// ✅ 带防抖和取消功能的远程搜索
const remoteSearch = debounce(async (query: string) => {
  // 空字符串不搜索
  if (!query.trim()) {
    remoteUsers.value = []
    return
  }

  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  loading.value = true
  try {
    const [err, data] = await searchUsers(query, {
      signal: abortController.signal
    })

    if (!err) {
      remoteUsers.value = data
    }
  } catch (error) {
    // 忽略取消的请求
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }
    console.error('搜索失败:', error)
    remoteUsers.value = []
  } finally {
    loading.value = false
  }
}, 300)

// 清理
onUnmounted(() => {
  if (abortController) {
    abortController.abort()
  }
})
</script>

<template>
  <AFormSelect
    v-model="form.userId"
    :options="remoteUsers"
    label="用户"
    filterable
    remote
    reserve-keyword
    :remote-method="remoteSearch"
    :loading="loading"
    value-field="id"
    label-field="name"
    placeholder="请输入用户名搜索"
  />
</template>
```

**使用请求序列号防止顺序错乱**

```typescript
// ✅ 使用序列号确保响应顺序
let requestSequence = 0

const remoteSearch = debounce(async (query: string) => {
  if (!query.trim()) {
    remoteUsers.value = []
    return
  }

  const currentSequence = ++requestSequence
  loading.value = true

  try {
    const [err, data] = await searchUsers(query)

    // 只处理最新请求的响应
    if (currentSequence !== requestSequence) {
      console.log('忽略过期响应')
      return
    }

    if (!err) {
      remoteUsers.value = data
    }
  } finally {
    if (currentSequence === requestSequence) {
      loading.value = false
    }
  }
}, 300)
```

**封装为可复用的 Composable**

```typescript
// composables/useRemoteSearch.ts
import { ref, onUnmounted } from 'vue'
import { debounce } from 'lodash-es'

interface UseRemoteSearchOptions<T> {
  fetcher: (query: string, signal: AbortSignal) => Promise<T[]>
  debounceMs?: number
  minQueryLength?: number
}

export function useRemoteSearch<T>(options: UseRemoteSearchOptions<T>) {
  const { fetcher, debounceMs = 300, minQueryLength = 1 } = options

  const results = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  let abortController: AbortController | null = null

  const search = debounce(async (query: string) => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < minQueryLength) {
      results.value = []
      return
    }

    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    loading.value = true
    try {
      const data = await fetcher(trimmedQuery, abortController.signal)
      results.value = data
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('搜索失败:', error)
        results.value = []
      }
    } finally {
      loading.value = false
    }
  }, debounceMs)

  function clear() {
    results.value = []
    if (abortController) {
      abortController.abort()
    }
  }

  onUnmounted(() => {
    clear()
    search.cancel()
  })

  return {
    results,
    loading,
    search,
    clear
  }
}

// 使用示例
const { results: userOptions, loading, search: searchUsers } = useRemoteSearch({
  fetcher: async (query, signal) => {
    const [err, data] = await getUserList({ keyword: query }, { signal })
    if (err) throw err
    return data.records
  },
  debounceMs: 300,
  minQueryLength: 2
})
```

---

### 4. 选项禁用条件不生效

**问题描述**

设置了 disabledField 和 disabledValue，但选项没有被正确禁用，所有选项都可以选择。

**问题原因**

- disabledField 字段名拼写错误或字段不存在
- disabledValue 类型与选项中的值类型不匹配
- 使用函数形式的 disabledValue 但逻辑错误
- 禁用条件在选项数据变化后未重新计算

**解决方案**

```vue
<!-- ❌ 错误：字段名拼写错误 -->
<AFormSelect
  :options="userList"
  disabled-field="stats"  <!-- 应该是 status -->
  disabled-value="0"
/>

<!-- ❌ 错误：类型不匹配 -->
<script setup>
const userList = [
  { id: 1, name: '张三', status: 0 },  // 数字 0
  { id: 2, name: '李四', status: 1 }
]
</script>

<AFormSelect
  :options="userList"
  disabled-field="status"
  disabled-value="0"  <!-- 字符串 '0'，不匹配 -->
/>

<!-- ✅ 正确：类型一致 -->
<AFormSelect
  :options="userList"
  disabled-field="status"
  :disabled-value="0"  <!-- 数字 0 -->
/>
```

**使用函数形式进行复杂禁用判断**

```vue
<script setup lang="ts">
interface ProductOption {
  id: number
  name: string
  status: string
  stock: number
  expiryDate: string
}

const productList = ref<ProductOption[]>([])

// ✅ 复杂禁用条件使用函数
const isProductDisabled = (item: ProductOption): boolean => {
  // 已下架
  if (item.status === '0') return true

  // 库存不足
  if (item.stock <= 0) return true

  // 已过期
  if (new Date(item.expiryDate) < new Date()) return true

  return false
}
</script>

<template>
  <AFormSelect
    v-model="form.productId"
    :options="productList"
    label="商品"
    value-field="id"
    label-field="name"
    :disabled-value="isProductDisabled"
  />
</template>
```

**处理动态禁用条件**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const userRole = ref('user')
const departmentOptions = ref([
  { id: 1, name: '技术部', level: 1 },
  { id: 2, name: '管理层', level: 3 },
  { id: 3, name: '财务部', level: 2 }
])

// ✅ 根据用户角色动态禁用
const isDeptDisabled = computed(() => {
  return (item: DeptOption) => {
    // 普通用户不能选择管理层部门
    if (userRole.value === 'user' && item.level >= 3) {
      return true
    }
    return false
  }
})
</script>

<template>
  <AFormSelect
    v-model="form.deptId"
    :options="departmentOptions"
    label="部门"
    value-field="id"
    label-field="name"
    :disabled-value="isDeptDisabled"
  />
</template>
```

**调试禁用条件**

```typescript
// ✅ 添加调试日志
const isItemDisabled = (item: any): boolean => {
  const fieldValue = item[disabledField]
  const isDisabled = Array.isArray(disabledValue)
    ? disabledValue.includes(fieldValue)
    : fieldValue === disabledValue

  console.log('禁用检查:', {
    item,
    field: disabledField,
    fieldValue,
    disabledValue,
    result: isDisabled
  })

  return isDisabled
}
```

---

### 5. 联动选择器数据不同步

**问题描述**

在省市联动等场景中，当父级选择器的值变化时，子级选择器的选项未更新，或者子级的值没有被正确清空。

**问题原因**

- 父级变化时未清空子级的值
- 子级选项的加载是异步的，但没有等待完成
- 使用了错误的 watch 依赖
- 选项数据更新后，子级组件没有重新渲染

**解决方案**

```vue
<script setup lang="ts">
import { ref, watch, reactive } from 'vue'

interface AreaForm {
  provinceId: string
  cityId: string
  districtId: string
}

const form = reactive<AreaForm>({
  provinceId: '',
  cityId: '',
  districtId: ''
})

const provinces = ref<Option[]>([])
const cities = ref<Option[]>([])
const districts = ref<Option[]>([])

const loadingCities = ref(false)
const loadingDistricts = ref(false)

// ✅ 监听省份变化，更新城市列表
watch(
  () => form.provinceId,
  async (newProvinceId, oldProvinceId) => {
    // 清空下级选择
    form.cityId = ''
    form.districtId = ''
    cities.value = []
    districts.value = []

    if (!newProvinceId) return

    loadingCities.value = true
    try {
      const [err, data] = await getCities(newProvinceId)
      if (!err) {
        cities.value = data
      }
    } finally {
      loadingCities.value = false
    }
  }
)

// ✅ 监听城市变化，更新区县列表
watch(
  () => form.cityId,
  async (newCityId) => {
    // 清空下级选择
    form.districtId = ''
    districts.value = []

    if (!newCityId) return

    loadingDistricts.value = true
    try {
      const [err, data] = await getDistricts(newCityId)
      if (!err) {
        districts.value = data
      }
    } finally {
      loadingDistricts.value = false
    }
  }
)

// ✅ 初始化加载省份
onMounted(async () => {
  const [err, data] = await getProvinces()
  if (!err) {
    provinces.value = data
  }
})
</script>

<template>
  <el-row :gutter="20">
    <AFormSelect
      v-model="form.provinceId"
      :options="provinces"
      label="省份"
      prop="provinceId"
      :span="8"
    />

    <AFormSelect
      v-model="form.cityId"
      :options="cities"
      label="城市"
      prop="cityId"
      :disabled="!form.provinceId"
      :loading="loadingCities"
      :span="8"
    />

    <AFormSelect
      v-model="form.districtId"
      :options="districts"
      label="区县"
      prop="districtId"
      :disabled="!form.cityId"
      :loading="loadingDistricts"
      :span="8"
    />
  </el-row>
</template>
```

**封装为联动选择器 Composable**

```typescript
// composables/useCascadeSelect.ts
import { ref, watch, onMounted } from 'vue'

interface CascadeLevel {
  value: Ref<string>
  options: Ref<Option[]>
  loading: Ref<boolean>
  fetcher: (parentValue?: string) => Promise<Option[]>
  parentLevel?: CascadeLevel
}

export function useCascadeSelect(levels: CascadeLevel[]) {
  // 设置层级关系
  levels.forEach((level, index) => {
    if (index > 0) {
      level.parentLevel = levels[index - 1]
    }
  })

  // 监听每个层级的变化
  levels.forEach((level, index) => {
    if (level.parentLevel) {
      watch(
        () => level.parentLevel!.value.value,
        async (parentValue) => {
          // 清空当前及下级的值和选项
          for (let i = index; i < levels.length; i++) {
            levels[i].value.value = ''
            levels[i].options.value = []
          }

          if (!parentValue) return

          level.loading.value = true
          try {
            level.options.value = await level.fetcher(parentValue)
          } finally {
            level.loading.value = false
          }
        }
      )
    }
  })

  // 初始化第一级
  onMounted(async () => {
    const firstLevel = levels[0]
    firstLevel.loading.value = true
    try {
      firstLevel.options.value = await firstLevel.fetcher()
    } finally {
      firstLevel.loading.value = false
    }
  })

  // 回填数据方法
  async function setValues(values: string[]) {
    for (let i = 0; i < Math.min(values.length, levels.length); i++) {
      const level = levels[i]

      // 如果有父级，先加载选项
      if (i > 0 && values[i - 1]) {
        level.loading.value = true
        try {
          level.options.value = await level.fetcher(values[i - 1])
        } finally {
          level.loading.value = false
        }
      }

      level.value.value = values[i] || ''
    }
  }

  return { setValues }
}

// 使用示例
const provinceId = ref('')
const cityId = ref('')
const districtId = ref('')

const provinces = ref<Option[]>([])
const cities = ref<Option[]>([])
const districts = ref<Option[]>([])

const loadingProvinces = ref(false)
const loadingCities = ref(false)
const loadingDistricts = ref(false)

const { setValues } = useCascadeSelect([
  {
    value: provinceId,
    options: provinces,
    loading: loadingProvinces,
    fetcher: async () => {
      const [err, data] = await getProvinces()
      return err ? [] : data
    }
  },
  {
    value: cityId,
    options: cities,
    loading: loadingCities,
    fetcher: async (provinceId) => {
      const [err, data] = await getCities(provinceId!)
      return err ? [] : data
    }
  },
  {
    value: districtId,
    options: districts,
    loading: loadingDistricts,
    fetcher: async (cityId) => {
      const [err, data] = await getDistricts(cityId!)
      return err ? [] : data
    }
  }
])

// 编辑时回填数据
async function loadEditData() {
  const [err, data] = await getDetail(id)
  if (!err) {
    await setValues([data.provinceId, data.cityId, data.districtId])
  }
}
```

---

### 6. 大量选项导致下拉卡顿

**问题描述**

当选项数量很大（如数百或数千个）时，打开下拉框或搜索时出现明显的卡顿和延迟。

**问题原因**

- 一次性渲染所有选项的 DOM 节点
- 每个选项都是复杂的组件，渲染开销大
- 搜索过滤在前端进行，大数据量下性能差
- 未使用虚拟滚动技术

**解决方案**

```vue
<!-- ✅ 方案1：使用远程搜索，减少前端数据量 -->
<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'lodash-es'

const users = ref<UserOption[]>([])
const loading = ref(false)

const searchUsers = debounce(async (query: string) => {
  if (!query) {
    users.value = []
    return
  }

  loading.value = true
  try {
    // 后端搜索，只返回匹配的前 50 条
    const [err, data] = await getUserList({
      keyword: query,
      pageSize: 50
    })
    if (!err) {
      users.value = data.records
    }
  } finally {
    loading.value = false
  }
}, 300)
</script>

<template>
  <AFormSelect
    v-model="form.userId"
    :options="users"
    label="用户"
    filterable
    remote
    :remote-method="searchUsers"
    :loading="loading"
    value-field="id"
    label-field="name"
    placeholder="请输入用户名搜索"
  />
</template>
```

**使用虚拟滚动**

```vue
<!-- ✅ 方案2：使用 Element Plus 的虚拟化选择器 -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const allUsers = ref<UserOption[]>([])
const keyword = ref('')

// 前端过滤
const filteredUsers = computed(() => {
  if (!keyword.value) return allUsers.value
  const lowerKeyword = keyword.value.toLowerCase()
  return allUsers.value.filter(user =>
    user.name.toLowerCase().includes(lowerKeyword)
  )
})
</script>

<template>
  <el-select-v2
    v-model="form.userId"
    :options="filteredUsers"
    filterable
    placeholder="请选择用户"
    :props="{
      value: 'id',
      label: 'name'
    }"
    style="width: 100%"
  />
</template>
```

**分页加载选项**

```vue
<!-- ✅ 方案3：滚动加载更多选项 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const users = ref<UserOption[]>([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 50

async function loadUsers() {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const [err, data] = await getUserList({
      page: currentPage.value,
      pageSize
    })
    if (!err) {
      users.value.push(...data.records)
      hasMore.value = users.value.length < data.total
      currentPage.value++
    }
  } finally {
    loading.value = false
  }
}

function handleVisibleChange(visible: boolean) {
  if (visible && users.value.length === 0) {
    loadUsers()
  }
}

// 监听下拉框滚动，加载更多
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadUsers()
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <el-select
    v-model="form.userId"
    filterable
    placeholder="请选择用户"
    :loading="loading"
    @visible-change="handleVisibleChange"
  >
    <div
      class="select-options-container"
      @scroll="handleScroll"
    >
      <el-option
        v-for="user in users"
        :key="user.id"
        :label="user.name"
        :value="user.id"
      />
      <div v-if="loading" class="loading-tip">加载中...</div>
      <div v-else-if="!hasMore" class="no-more-tip">没有更多了</div>
    </div>
  </el-select>
</template>

<style scoped>
.select-options-container {
  max-height: 300px;
  overflow-y: auto;
}

.loading-tip,
.no-more-tip {
  text-align: center;
  padding: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
```

**优化选项渲染**

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'

// ✅ 使用 shallowRef 减少响应式开销
const options = shallowRef<Option[]>([])

function updateOptions(newOptions: Option[]) {
  options.value = newOptions
}
</script>

<template>
  <AFormSelect
    v-model="form.value"
    :options="options"
    label="选项"
  >
    <!-- ✅ 简化选项模板，减少渲染复杂度 -->
    <template #default="{ option }">
      <span>{{ option.label }}</span>
    </template>
  </AFormSelect>
</template>
```

---

### 7. 选择器在弹窗中显示异常

**问题描述**

在 Dialog 或 Drawer 等弹窗组件中使用选择器时，下拉菜单被遮挡、位置偏移或无法正常滚动。

**问题原因**

- 下拉菜单默认挂载在 body 下，但弹窗有自己的滚动容器
- 弹窗的 z-index 与下拉菜单冲突
- 弹窗内容区域有 overflow 限制
- teleport 目标元素不正确

**解决方案**

```vue
<!-- ✅ 方案1：设置 popper-append-to-body 为 false -->
<template>
  <el-dialog v-model="visible" title="编辑用户">
    <AFormSelect
      v-model="form.status"
      :options="statusOptions"
      label="状态"
      :popper-append-to-body="false"
    />
  </el-dialog>
</template>
```

**设置合适的 z-index**

```vue
<!-- ✅ 方案2：设置下拉菜单的 z-index -->
<template>
  <el-dialog v-model="visible" title="编辑用户">
    <AFormSelect
      v-model="form.status"
      :options="statusOptions"
      label="状态"
      :popper-options="{
        modifiers: [
          {
            name: 'zIndex',
            enabled: true,
            phase: 'write',
            fn: ({ state }) => {
              state.styles.popper.zIndex = 3000
            }
          }
        ]
      }"
    />
  </el-dialog>
</template>
```

**使用 teleport 指定挂载位置**

```vue
<!-- ✅ 方案3：指定下拉菜单挂载到弹窗内 -->
<template>
  <el-dialog v-model="visible" title="编辑用户">
    <div ref="dialogContentRef" class="dialog-content">
      <AFormSelect
        v-model="form.status"
        :options="statusOptions"
        label="状态"
        :teleported="false"
      />
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog-content {
  position: relative;
}

/* 确保下拉菜单不被截断 */
.dialog-content :deep(.el-select__popper) {
  position: absolute;
}
</style>
```

**处理弹窗滚动问题**

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'

const dialogVisible = ref(false)
const selectVisible = ref(false)

// ✅ 在下拉菜单打开时禁止弹窗滚动
watch(selectVisible, (visible) => {
  const dialogBody = document.querySelector('.el-dialog__body')
  if (dialogBody) {
    dialogBody.style.overflow = visible ? 'visible' : 'auto'
  }
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="编辑">
    <el-form>
      <AFormSelect
        v-model="form.category"
        :options="categoryOptions"
        label="分类"
        @visible-change="(val) => selectVisible = val"
      />
    </el-form>
  </el-dialog>
</template>
```

**全局配置解决方案**

```typescript
// main.ts
import { ElConfigProvider } from 'element-plus'

// ✅ 全局设置 z-index
app.provide('elConfigProvider', {
  zIndex: 2000
})

// 或在 App.vue 中
<template>
  <el-config-provider :z-index="2000">
    <router-view />
  </el-config-provider>
</template>
```

---

### 8. 表单重置时选择器值未正确清空

**问题描述**

调用表单的 resetFields 方法后，选择器的值没有被重置为初始状态，或者多选选择器重置后显示异常。

**问题原因**

- 表单初始值在组件挂载后才设置，导致 resetFields 重置到错误的值
- 多选选择器的初始值不是数组类型
- 使用了响应式对象但没有正确初始化
- resetFields 只重置有 prop 属性的字段

**解决方案**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

// ❌ 错误：初始值在 onMounted 中设置
const form = reactive({
  status: '',
  roles: []
})

onMounted(async () => {
  // 这时设置的值会被当作初始值
  form.status = '1'
  form.roles = ['admin']
})

// ✅ 正确：在定义时就设置好初始值
interface FormData {
  status: string
  roles: string[]
  categoryId: string
}

const initialFormData: FormData = {
  status: '',
  roles: [],
  categoryId: ''
}

const form = reactive<FormData>({ ...initialFormData })

// 自定义重置方法
function resetForm() {
  // 重置为初始值
  Object.assign(form, { ...initialFormData })

  // 同时重置表单验证状态
  formRef.value?.resetFields()
}
</script>

<template>
  <el-form ref="formRef" :model="form">
    <AFormSelect
      v-model="form.status"
      :options="statusOptions"
      label="状态"
      prop="status"
    />

    <AFormSelect
      v-model="form.roles"
      :options="roleOptions"
      label="角色"
      prop="roles"
      multiple
    />

    <el-button @click="resetForm">重置</el-button>
  </el-form>
</template>
```

**处理编辑模式下的重置**

```vue
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = defineProps<{
  mode: 'add' | 'edit'
  editData?: FormData
}>()

const formRef = ref<FormInstance>()

// 根据模式确定初始值
const getInitialForm = (): FormData => ({
  status: '',
  roles: [],
  categoryId: ''
})

const form = reactive<FormData>(getInitialForm())

// 保存原始数据用于重置
const originalData = ref<FormData>(getInitialForm())

// 监听编辑数据变化
watch(
  () => props.editData,
  (data) => {
    if (data && props.mode === 'edit') {
      Object.assign(form, data)
      // 保存原始数据
      originalData.value = { ...data }
    }
  },
  { immediate: true }
)

function resetForm() {
  if (props.mode === 'edit') {
    // 编辑模式：重置为原始数据
    Object.assign(form, { ...originalData.value })
  } else {
    // 新增模式：重置为空值
    Object.assign(form, getInitialForm())
  }

  // 清除验证状态
  formRef.value?.clearValidate()
}

function clearForm() {
  // 完全清空表单
  Object.assign(form, getInitialForm())
  formRef.value?.resetFields()
}
</script>
```

**封装表单状态管理**

```typescript
// composables/useFormState.ts
import { reactive, ref, toRaw } from 'vue'
import type { FormInstance } from 'element-plus'

interface UseFormStateOptions<T> {
  initialData: T
  formRef: Ref<FormInstance | undefined>
}

export function useFormState<T extends Record<string, any>>(
  options: UseFormStateOptions<T>
) {
  const { initialData, formRef } = options

  const form = reactive<T>({ ...initialData })
  const originalData = ref<T>({ ...initialData })
  const isDirty = ref(false)

  // 监听表单变化
  watch(
    () => form,
    () => {
      isDirty.value = JSON.stringify(toRaw(form)) !== JSON.stringify(originalData.value)
    },
    { deep: true }
  )

  // 设置表单数据
  function setFormData(data: Partial<T>) {
    Object.assign(form, data)
    originalData.value = { ...toRaw(form) }
    isDirty.value = false
  }

  // 重置为原始数据
  function resetToOriginal() {
    Object.assign(form, { ...originalData.value })
    formRef.value?.clearValidate()
    isDirty.value = false
  }

  // 重置为初始空值
  function resetToInitial() {
    Object.assign(form, { ...initialData })
    originalData.value = { ...initialData }
    formRef.value?.resetFields()
    isDirty.value = false
  }

  // 获取表单数据
  function getFormData(): T {
    return toRaw(form)
  }

  return {
    form,
    isDirty,
    setFormData,
    resetToOriginal,
    resetToInitial,
    getFormData
  }
}

// 使用示例
const formRef = ref<FormInstance>()

const {
  form,
  isDirty,
  setFormData,
  resetToOriginal,
  resetToInitial
} = useFormState({
  initialData: {
    status: '',
    roles: [] as string[],
    categoryId: ''
  },
  formRef
})

// 加载编辑数据
async function loadEditData(id: string) {
  const [err, data] = await getDetail(id)
  if (!err) {
    setFormData({
      ...data,
      roles: data.roles?.split(',') ?? []
    })
  }
}
```

