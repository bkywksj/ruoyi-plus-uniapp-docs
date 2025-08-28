# AFormCheckbox 复选框组件

AFormCheckbox 是一个功能丰富的复选框组件，基于 Element Plus 的 ElCheckbox 封装，支持多选、按钮样式、自定义字段映射和单个复选框模式。

## 基础用法

### 多选复选框

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormCheckbox 
    v-model="queryParams.types" 
    :options="typeOptions" 
    label="类型" 
    prop="types" 
    @change="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormCheckbox 
    v-model="form.hobbies" 
    :options="hobbyOptions" 
    label="兴趣爱好" 
    prop="hobbies" 
    :span="12" 
  />
</template>

<script setup>
const typeOptions = [
  { label: '类型1', value: '1' },
  { label: '类型2', value: '2' },
  { label: '类型3', value: '3' }
]

const hobbyOptions = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
  { label: '旅行', value: 'travel' }
]
</script>
```

### 按钮样式复选框

```vue
<template>
  <AFormCheckbox 
    v-model="form.skills" 
    :options="skillOptions" 
    label="技能" 
    prop="skills"
    type="button" 
    :span="12" 
  />
</template>

<script setup>
const skillOptions = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Node.js', value: 'nodejs' }
]
</script>
```

### 单个复选框模式

```vue
<template>
  <!-- 记住密码场景 -->
  <AFormCheckbox 
    v-model="loginForm.rememberMe" 
    :options="[{ label: '记住密码', value: true }]" 
    :single-checkbox="true" 
    :show-form-item="false" 
  />
  
  <!-- 同意协议场景 -->
  <AFormCheckbox 
    v-model="form.agreement" 
    :options="[{ label: '我已阅读并同意用户协议', value: true }]" 
    :single-checkbox="true" 
    prop="agreement"
    :span="24" 
  />
</template>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `Array \| string` | `[]` | 绑定值 |
| `options` | `Array<any>` | `[]` | 选项数据 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项包装 |

### 复选框属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'checkbox' \| 'button'` | `'checkbox'` | 复选框类型 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `ElSize` | `''` | 组件尺寸 |
| `min` | `number` | `0` | 最少选择项数 |
| `max` | `number` | `Infinity` | 最多选择项数 |
| `singleCheckbox` | `boolean` | `false` | 单个复选框模式 |
| `returnArray` | `boolean` | `true` | 是否返回数组格式 |

### 字段映射属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `valueField` | `string` | `'value'` | 值字段名 |
| `labelField` | `string` | `'label'` | 标签字段名 |
| `disabledField` | `string` | `'status'` | 禁用判断字段名 |
| `disabledValue` | `any \| Array \| Function` | `'0'` | 禁用条件值 |
| `useItemDisabled` | `boolean` | `true` | 是否使用选项自身的 disabled 属性 |

### 样式属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `textColor` | `string` | `'#ffffff'` | 选中时的文字颜色 |
| `fill` | `string` | `'#409EFF'` | 选中时的填充色 |
| `labelWidth` | `string \| number` | - | 标签宽度 |
| `tooltip` | `string` | `''` | 提示信息 |

## 使用示例

### 自定义字段映射

```vue
<template>
  <AFormCheckbox 
    v-model="form.roleIds" 
    :options="roleList" 
    label="角色" 
    prop="roleIds"
    value-field="id" 
    label-field="name" 
    :span="12" 
  />
</template>

<script setup>
const roleList = [
  { id: 1, name: '管理员', description: '系统管理权限' },
  { id: 2, name: '编辑者', description: '内容编辑权限' },
  { id: 3, name: '查看者', description: '只读权限' }
]
</script>
```

### 带提示信息的复选框

```vue
<template>
  <AFormCheckbox 
    v-model="form.permissions" 
    :options="permissionOptions" 
    label="权限" 
    prop="permissions"
    tooltip="选择用户可以执行的操作" 
    :span="12" 
  />
</template>

<script setup>
const permissionOptions = [
  { label: '查看数据', value: 'view' },
  { label: '编辑数据', value: 'edit' },
  { label: '删除数据', value: 'delete' },
  { label: '导出数据', value: 'export' }
]
</script>
```

### 条件禁用选项

```vue
<template>
  <AFormCheckbox 
    v-model="form.features" 
    :options="featureOptions" 
    label="功能特性" 
    prop="features"
    value-field="id" 
    label-field="name" 
    disabled-field="available"
    :disabled-value="false"
    :span="12" 
  />
</template>

<script setup>
const featureOptions = [
  { id: 1, name: '基础功能', available: true },
  { id: 2, name: '高级分析', available: false }, // 这个选项会被禁用
  { id: 3, name: '数据导出', available: true },
  { id: 4, name: 'API接入', available: false }   // 这个选项会被禁用
]
</script>
```

### 数组类型绑定值

```vue
<template>
  <AFormCheckbox 
    v-model="form.tags" 
    :options="tagOptions" 
    label="标签" 
    prop="tags"
    :return-array="true" 
    :span="12" 
  />
</template>

<script setup>
const form = reactive({
  tags: [] // 绑定数组类型
})

const tagOptions = [
  { label: '紧急', value: 'urgent' },
  { label: '重要', value: 'important' },
  { label: '待办', value: 'todo' },
  { label: '完成', value: 'done' }
]
</script>
```

### 限制选择数量

```vue
<template>
  <AFormCheckbox 
    v-model="form.courses" 
    :options="courseOptions" 
    label="选修课程" 
    prop="courses"
    :min="2" 
    :max="5" 
    tooltip="最少选择2门，最多选择5门课程"
    :span="12" 
  />
</template>

<script setup>
const courseOptions = [
  { label: '高等数学', value: 'math' },
  { label: '大学物理', value: 'physics' },
  { label: '程序设计', value: 'programming' },
  { label: '数据结构', value: 'datastructure' },
  { label: '操作系统', value: 'os' },
  { label: '计算机网络', value: 'network' }
]
</script>
```

### 不含表单项的纯复选框

```vue
<template>
  <AFormCheckbox 
    v-model="selectedFilters" 
    :options="filterOptions" 
    :show-form-item="false" 
    type="button"
    @change="handleFilterChange"
  />
</template>

<script setup>
const filterOptions = [
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'popular' },
  { label: '推荐', value: 'recommended' }
]

const handleFilterChange = (values) => {
  // 根据选择的过滤条件更新列表
  console.log('选中的过滤条件:', values)
}
</script>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormCheckbox 
    v-model="form.notifications"
    :options="notificationOptions"
    label="通知设置"
    @change="handleNotificationChange"
  />
</template>

<script setup>
const notificationOptions = [
  { label: '邮件通知', value: 'email' },
  { label: '短信通知', value: 'sms' },
  { label: '推送通知', value: 'push' },
  { label: '微信通知', value: 'wechat' }
]

const handleNotificationChange = (values) => {
  console.log('通知设置变更:', values)
  
  // 根据选择启用相应的通知服务
  if (values.includes('email')) {
    enableEmailNotification()
  }
  if (values.includes('sms')) {
    enableSMSNotification()
  }
}
</script>
```

### 联动控制

```vue
<template>
  <el-row :gutter="20">
    <AFormCheckbox 
      v-model="form.modules" 
      :options="moduleOptions" 
      label="功能模块" 
      prop="modules"
      @change="handleModuleChange"
      :span="12" 
    />
    
    <AFormCheckbox 
      v-model="form.subFeatures" 
      :options="filteredSubFeatures" 
      label="子功能" 
      prop="subFeatures"
      :disabled="form.modules.length === 0"
      :span="12" 
    />
  </el-row>
</template>

<script setup>
const moduleOptions = [
  { label: '用户管理', value: 'user' },
  { label: '内容管理', value: 'content' },
  { label: '系统设置', value: 'system' }
]

const allSubFeatures = [
  { label: '用户列表', value: 'user-list', module: 'user' },
  { label: '用户权限', value: 'user-permission', module: 'user' },
  { label: '文章管理', value: 'article', module: 'content' },
  { label: '分类管理', value: 'category', module: 'content' },
  { label: '系统配置', value: 'config', module: 'system' }
]

const filteredSubFeatures = computed(() => {
  return allSubFeatures.filter(feature => 
    form.modules.includes(feature.module)
  )
})

const handleModuleChange = (modules) => {
  // 清除不相关的子功能选择
  form.subFeatures = form.subFeatures.filter(subFeature => {
    const feature = allSubFeatures.find(f => f.value === subFeature)
    return feature && modules.includes(feature.module)
  })
}
</script>
```

## 高级用法

### 全选/反选功能

```vue
<template>
  <div>
    <!-- 全选控制 -->
    <el-checkbox 
      v-model="checkAll" 
      :indeterminate="isIndeterminate" 
      @change="handleCheckAllChange"
    >
      全选
    </el-checkbox>
    
    <el-divider />
    
    <!-- 选项列表 -->
    <AFormCheckbox 
      v-model="form.selectedItems" 
      :options="itemOptions" 
      label="选择项目" 
      :show-form-item="false"
      @change="handleItemChange"
    />
  </div>
</template>

<script setup>
const itemOptions = [
  { label: '项目A', value: 'a' },
  { label: '项目B', value: 'b' },
  { label: '项目C', value: 'c' },
  { label: '项目D', value: 'd' }
]

const checkAll = ref(false)
const isIndeterminate = ref(false)

const handleCheckAllChange = (checked) => {
  form.selectedItems = checked ? itemOptions.map(item => item.value) : []
  isIndeterminate.value = false
}

const handleItemChange = (values) => {
  const checkedCount = values.length
  checkAll.value = checkedCount === itemOptions.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < itemOptions.length
}
</script>
```

### 分组复选框

```vue
<template>
  <div>
    <div v-for="group in groupedOptions" :key="group.category" class="mb-4">
      <h4 class="mb-2">{{ group.category }}</h4>
      <AFormCheckbox 
        v-model="form.selectedByGroup[group.category]" 
        :options="group.items" 
        :show-form-item="false"
        @change="handleGroupChange"
      />
    </div>
  </div>
</template>

<script setup>
const groupedOptions = [
  {
    category: '前端技术',
    items: [
      { label: 'Vue.js', value: 'vue' },
      { label: 'React', value: 'react' },
      { label: 'Angular', value: 'angular' }
    ]
  },
  {
    category: '后端技术',
    items: [
      { label: 'Node.js', value: 'nodejs' },
      { label: 'Python', value: 'python' },
      { label: 'Java', value: 'java' }
    ]
  }
]

const form = reactive({
  selectedByGroup: {
    '前端技术': [],
    '后端技术': []
  }
})

const handleGroupChange = (values) => {
  // 处理分组选择变化
  console.log('分组选择变化:', form.selectedByGroup)
}
</script>
```

### 动态选项加载

```vue
<template>
  <AFormCheckbox 
    v-model="form.categories"
    :options="categoryOptions"
    label="分类"
    prop="categories"
    :loading="loadingCategories"
    @visible-change="handleVisibleChange"
  />
</template>

<script setup>
const categoryOptions = ref([])
const loadingCategories = ref(false)

const loadCategories = async () => {
  if (categoryOptions.value.length > 0) return
  
  loadingCategories.value = true
  try {
    const categories = await getCategories()
    categoryOptions.value = categories
  } finally {
    loadingCategories.value = false
  }
}

const handleVisibleChange = (visible) => {
  if (visible) {
    loadCategories()
  }
}
</script>
```

### 条件显示选项

```vue
<template>
  <AFormCheckbox 
    v-model="form.permissions"
    :options="availablePermissions"
    label="权限"
    prop="permissions"
    value-field="code"
    label-field="name"
  />
</template>

<script setup>
const allPermissions = [
  { code: 'user:view', name: '查看用户', level: 1 },
  { code: 'user:edit', name: '编辑用户', level: 2 },
  { code: 'user:delete', name: '删除用户', level: 3 },
  { code: 'system:config', name: '系统配置', level: 4 }
]

const availablePermissions = computed(() => {
  return allPermissions.filter(permission => 
    permission.level <= currentUserLevel.value
  )
})
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormCheckbox 
      v-model="form.interests" 
      :options="interestOptions" 
      label="兴趣爱好" 
      prop="interests" 
    />
  </el-form>
</template>

<script setup>
const interestOptions = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
  { label: '旅行', value: 'travel' }
]

const rules = {
  interests: [
    { 
      required: true, 
      type: 'array', 
      min: 1, 
      message: '请至少选择一个兴趣爱好', 
      trigger: 'change' 
    }
  ]
}
</script>
```

### 数量限制验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormCheckbox 
      v-model="form.skills" 
      :options="skillOptions" 
      label="技能" 
      prop="skills"
      :min="2" 
      :max="4" 
    />
  </el-form>
</template>

<script setup>
const rules = {
  skills: [
    { 
      required: true, 
      type: 'array', 
      min: 2, 
      max: 4, 
      message: '请选择2-4项技能', 
      trigger: 'change' 
    }
  ]
}
</script>
```

### 自定义验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormCheckbox 
      v-model="form.workdays" 
      :options="weekdayOptions" 
      label="工作日" 
      prop="workdays" 
    />
    
    <AFormCheckbox 
      v-model="form.worktime" 
      :options="worktimeOptions" 
      label="工作时间" 
      prop="worktime" 
    />
  </el-form>
</template>

<script setup>
const weekdayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 }
]

const worktimeOptions = [
  { label: '全天', value: 'fulltime' },
  { label: '半天', value: 'parttime' }
]

const validateWorkSchedule = (rule, value, callback) => {
  if (form.workdays.includes(6) || form.workdays.includes(7)) {
    if (!form.worktime.includes('parttime')) {
      callback(new Error('周末工作建议选择半天工作时间'))
    }
  }
  callback()
}

const rules = {
  workdays: [
    { required: true, type: 'array', min: 1, message: '请选择工作日' }
  ],
  worktime: [
    { required: true, type: 'array', min: 1, message: '请选择工作时间' },
    { validator: validateWorkSchedule, trigger: 'change' }
  ]
}
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormCheckbox 
    v-model="form.themes"
    :options="themeOptions"
    label="主题"
    class="custom-checkbox"
  />
</template>

<style scoped>
.custom-checkbox :deep(.el-checkbox) {
  margin-right: 20px;
  margin-bottom: 10px;
}

.custom-checkbox :deep(.el-checkbox__label) {
  color: #606266;
  font-weight: 500;
}

.custom-checkbox :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #409eff;
}

.custom-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #67c23a;
  border-color: #67c23a;
}
</style>
```

### 响应式布局

```vue
<template>
  <AFormCheckbox 
    v-model="form.features"
    :options="featureOptions"
    label="功能特性"
    :span="isMobile ? 24 : 12"
    :type="isMobile ? 'checkbox' : 'button'"
  />
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'
const { isMobile } = useBreakpoint()
</script>
```

## 实际应用场景

### 权限设置

```vue
<template>
  <el-form :model="roleForm" :rules="rules">
    <AFormCheckbox 
      v-model="roleForm.permissions"
      :options="permissionTree"
      label="权限设置"
      prop="permissions"
      value-field="id"
      label-field="name"
      :span="24"
    />
  </el-form>
</template>

<script setup>
const permissionTree = [
  { id: 1, name: '用户管理 - 查看用户列表' },
  { id: 2, name: '用户管理 - 新增用户' },
  { id: 3, name: '用户管理 - 编辑用户' },
  { id: 4, name: '用户管理 - 删除用户' },
  { id: 5, name: '内容管理 - 查看内容' },
  { id: 6, name: '内容管理 - 编辑内容' }
]

const roleForm = reactive({
  permissions: []
})
</script>
```

### 筛选条件

```vue
<template>
  <div class="filter-panel">
    <AFormCheckbox 
      v-model="filters.categories"
      :options="categoryOptions"
      label="分类"
      :show-form-item="false"
      type="button"
      @change="handleFilter"
    />
    
    <AFormCheckbox 
      v-model="filters.tags"
      :options="tagOptions"
      label="标签"
      :show-form-item="false"
      @change="handleFilter"
    />
  </div>
</template>

<script setup>
const filters = reactive({
  categories: [],
  tags: []
})

const handleFilter = () => {
  // 应用筛选条件
  applyFilters(filters)
}
</script>
```

### 批量操作

```vue
<template>
  <div>
    <!-- 批量选择 -->
    <AFormCheckbox 
      v-model="selectedItems"
      :options="itemList"
      label="选择项目"
      value-field="id"
      label-field="title"
      :show-form-item="false"
    />
    
    <!-- 批量操作按钮 -->
    <div class="mt-4" v-if="selectedItems.length > 0">
      <el-button @click="batchDelete" type="danger">
        批量删除 ({{ selectedItems.length }})
      </el-button>
      <el-button @click="batchExport" type="primary">
        批量导出
      </el-button>
    </div>
  </div>
</template>

<script setup>
const selectedItems = ref([])

const batchDelete = () => {
  // 批量删除逻辑
  console.log('删除项目:', selectedItems.value)
}

const batchExport = () => {
  // 批量导出逻辑
  console.log('导出项目:', selectedItems.value)
}
</script>
```

## 最佳实践

### 1. 合理组织选项

```vue
<template>
  <!-- 按重要性排序 -->
  <AFormCheckbox 
    v-model="form.notifications"
    :options="notificationOptions"
    label="通知设置"
  />
</template>

<script setup>
const notificationOptions = [
  { label: '系统通知', value: 'system' },     // 重要的放前面
  { label: '安全警报', value: 'security' },
  { label: '营销推广', value: 'marketing' },   // 次要的放后面
  { label: '社交动态', value: 'social' }
]
</script>
```

### 2. 提供合理默认值

```vue
<template>
  <AFormCheckbox 
    v-model="form.preferences"
    :options="preferenceOptions"
    label="偏好设置"
  />
</template>

<script setup>
const form = reactive({
  preferences: ['email'] // 设置默认选中邮件通知
})

const preferenceOptions = [
  { label: '邮件通知', value: 'email' },
  { label: '短信通知', value: 'sms' },
  { label: '推送通知', value: 'push' }
]
</script>
```

### 3. 适当的选项数量

```vue
<template>
  <!-- 选项较多时考虑分组或分页 -->
  <div v-if="allSkills.length > 15">
    <el-tabs v-model="activeTab">
      <el-tab-pane 
        v-for="group in skillGroups" 
        :key="group.name"
        :label="group.name" 
        :name="group.name"
      >
        <AFormCheckbox 
          v-model="form.skills"
          :options="group.skills"
          :show-form-item="false"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

### 4. 清晰的状态反馈

```vue
<template>
  <AFormCheckbox 
    v-model="form.modules"
    :options="moduleOptions"
    label="功能模块"
    :disabled="loading"
    tooltip="选择需要启用的功能模块"
  />
  
  <div v-if="form.modules.length > 0" class="mt-2 text-sm text-gray-600">
    已选择 {{ form.modules.length }} 个模块
  </div>
</template>
```

## 注意事项

1. **数据格式**：默认返回数组格式，单个复选框可设置 `returnArray: false`
2. **性能优化**：选项较多时考虑虚拟滚动或分组显示
3. **用户体验**：提供全选/反选功能，显示已选数量
4. **表单验证**：确保验证规则的 `type` 设置为 `array`
5. **无障碍访问**：为复选框组提供清晰的组标签和描述
