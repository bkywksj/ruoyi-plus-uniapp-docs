# AForm 表单容器组件

AForm 是表单系统的核心容器组件，基于 Element Plus 的 ElForm 封装，提供了统一的表单布局、验证和数据管理功能。配合 ASearchForm 搜索表单，为不同场景提供最佳的表单解决方案。

## 组件概述

### AForm - 通用表单容器

适用于数据录入、编辑等场景的表单容器。

### ASearchForm - 搜索表单容器

专门用于搜索条件输入的表单容器，支持显示/隐藏动画。

## AForm 基础用法

### 标准表单布局

```vue
<template>
  <el-form 
    :model="form" 
    :rules="rules" 
    ref="formRef"
    label-width="100px"
    label-position="right"
  >
    <el-row :gutter="20">
      <AFormInput 
        v-model="form.userName" 
        label="用户名" 
        prop="userName" 
        :span="12" 
      />
      
      <AFormSelect 
        v-model="form.status" 
        :options="statusOptions" 
        label="状态" 
        prop="status" 
        :span="12" 
      />
      
      <AFormDate 
        v-model="form.createTime" 
        label="创建时间" 
        prop="createTime" 
        :span="12" 
      />
      
      <AFormSwitch 
        v-model="form.enabled" 
        label="启用状态" 
        prop="enabled" 
        :span="12" 
      />
    </el-row>
    
    <!-- 操作按钮 -->
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

// 表单数据
const form = reactive({
  userName: '',
  status: '',
  createTime: '',
  enabled: true
})

// 表单引用
const formRef = ref()

// 验证规则
const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 状态选项
const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('表单数据：', form)
    // 提交逻辑
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
}
</script>
```

## ASearchForm 搜索表单

### 基础搜索表单

```vue
<template>
  <ASearchForm 
    v-model="queryParams" 
    :visible="showSearch"
    title="搜索条件"
    @search="handleSearch"
    @reset="handleReset"
  >
    <AFormInput 
      v-model="queryParams.keyword" 
      label="关键词" 
      prop="keyword" 
      @input="handleQuery" 
    />
    
    <AFormSelect 
      v-model="queryParams.status" 
      :options="statusOptions" 
      label="状态" 
      prop="status" 
      @change="handleQuery" 
    />
    
    <AFormDate 
      v-model="queryParams.dateRange" 
      type="daterange" 
      label="时间范围" 
      @change="handleQuery" 
    />
  </ASearchForm>
</template>

<script lang="ts" setup>
const queryParams = reactive({
  keyword: '',
  status: '',
  dateRange: []
})

const showSearch = ref(true)

// 搜索处理
const handleQuery = () => {
  // 防抖搜索逻辑
  console.log('搜索参数：', queryParams)
}

const handleSearch = () => {
  console.log('执行搜索')
}

const handleReset = () => {
  console.log('重置搜索条件')
}
</script>
```

## ASearchForm 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `Record<string, any>` | `{}` | 表单数据模型 |
| `visible` | `boolean` | `true` | 控制显示/隐藏 |
| `inline` | `boolean` | `true` | 是否行内表单 |
| `labelWidth` | `string` | `'auto'` | 标签宽度 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'right'` | 标签位置 |
| `title` | `string` | `''` | 卡片标题 |

## 表单布局模式

### 1. 栅格布局

使用 Element Plus 的栅格系统进行响应式布局：

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <!-- 每行2个字段 -->
      <AFormInput v-model="form.firstName" label="名" :span="12" />
      <AFormInput v-model="form.lastName" label="姓" :span="12" />
      
      <!-- 每行3个字段 -->
      <AFormInput v-model="form.age" label="年龄" :span="8" />
      <AFormSelect v-model="form.gender" label="性别" :span="8" />
      <AFormSelect v-model="form.status" label="状态" :span="8" />
      
      <!-- 单行字段 -->
      <AFormInput v-model="form.address" label="地址" :span="24" />
    </el-row>
  </el-form>
</template>
```

### 2. 响应式布局

根据屏幕尺寸调整布局：

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <AFormInput 
        v-model="form.name" 
        label="姓名" 
        :span="isMobile ? 24 : 12" 
      />
      <AFormInput 
        v-model="form.email" 
        label="邮箱" 
        :span="isMobile ? 24 : 12" 
      />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()
</script>
```

### 3. 垂直布局

适用于较复杂的表单：

```vue
<template>
  <el-form :model="form" label-position="top">
    <AFormInput v-model="form.title" label="标题" />
    <AFormInput v-model="form.content" label="内容" type="textarea" />
    <AFormSelect v-model="form.category" label="分类" :options="categories" />
  </el-form>
</template>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormInput 
      v-model="form.email" 
      label="邮箱" 
      prop="email" 
      type="email" 
    />
    
    <AFormInput 
      v-model="form.password" 
      label="密码" 
      prop="password" 
      type="password" 
    />
    
    <AFormInput 
      v-model="form.confirmPassword" 
      label="确认密码" 
      prop="confirmPassword" 
      type="password" 
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 8, message: '密码长度不能少于8位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    { 
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }
    }
  ]
}
</script>
```

### 动态验证

根据条件动态添加验证规则：

```vue
<template>
  <el-form :model="form" :rules="dynamicRules" ref="formRef">
    <AFormSelect 
      v-model="form.type" 
      label="类型" 
      :options="typeOptions" 
      @change="updateRules" 
    />
    
    <AFormInput 
      v-if="form.type === 'email'" 
      v-model="form.contact" 
      label="邮箱" 
      prop="contact" 
    />
    
    <AFormInput 
      v-if="form.type === 'phone'" 
      v-model="form.contact" 
      label="手机号" 
      prop="contact" 
    />
  </el-form>
</template>

<script lang="ts" setup>
const dynamicRules = computed(() => {
  const rules = {
    type: [{ required: true, message: '请选择类型' }]
  }
  
  if (form.type === 'email') {
    rules.contact = [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '邮箱格式不正确' }
    ]
  } else if (form.type === 'phone') {
    rules.contact = [
      { required: true, message: '请输入手机号' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
    ]
  }
  
  return rules
})
</script>
```

## 表单操作

### 表单提交和验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <!-- 表单字段 -->
    <AFormInput v-model="form.name" label="姓名" prop="name" />
    
    <!-- 操作按钮 -->
    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="submitting">
        提交
      </el-button>
      <el-button @click="resetForm">重置</el-button>
      <el-button @click="validateField">验证单个字段</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const submitting = ref(false)

// 提交表单
const submitForm = async () => {
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      submitting.value = true
      // 调用API提交数据
      await submitData(form)
      ElMessage.success('提交成功')
    }
  } catch (error) {
    console.error('表单验证失败：', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
}

// 验证单个字段
const validateField = () => {
  formRef.value.validateField('name', (valid) => {
    if (valid) {
      ElMessage.success('字段验证通过')
    }
  })
}
</script>
```

### 表单数据处理

```vue
<template>
  <el-form :model="form" ref="formRef">
    <!-- 表单字段 -->
    
    <el-form-item>
      <el-button @click="clearValidate">清除验证</el-button>
      <el-button @click="setFieldValue">设置字段值</el-button>
      <el-button @click="getFormData">获取表单数据</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
// 清除验证信息
const clearValidate = () => {
  formRef.value.clearValidate()
}

// 设置字段值
const setFieldValue = () => {
  form.name = '新的值'
  // 或者批量设置
  Object.assign(form, {
    name: '张三',
    email: 'zhangsan@example.com'
  })
}

// 获取表单数据
const getFormData = () => {
  const data = { ...form }
  console.log('表单数据：', data)
  return data
}
</script>
```

## 搜索表单特性

### 显示/隐藏控制

```vue
<template>
  <div>
    <!-- 控制按钮 -->
    <el-button @click="toggleSearch">
      {{ showSearch ? '隐藏' : '显示' }}搜索条件
    </el-button>
    
    <!-- 搜索表单 -->
    <ASearchForm 
      v-model="queryParams" 
      :visible="showSearch"
      title="搜索条件"
    >
      <!-- 搜索字段 -->
    </ASearchForm>
  </div>
</template>

<script lang="ts" setup>
const showSearch = ref(true)

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}
</script>
```

### 自定义表单头部

```vue
<template>
  <ASearchForm v-model="queryParams">
    <template #header>
      <div class="flex items-center justify-between">
        <h5 class="m-0">高级搜索</h5>
        <el-button size="small" @click="exportData">
          导出结果
        </el-button>
      </div>
    </template>
    
    <!-- 搜索字段 -->
  </ASearchForm>
</template>
```

### 搜索表单引用和方法

```vue
<template>
  <ASearchForm 
    ref="searchFormRef" 
    v-model="queryParams"
    @reset="handleReset"
  >
    <!-- 搜索字段 -->
  </ASearchForm>
</template>

<script lang="ts" setup>
const searchFormRef = ref()

// 重置搜索条件
const handleReset = () => {
  searchFormRef.value.resetFields()
  // 执行搜索
  handleQuery()
}

// 外部调用重置方法
const externalReset = () => {
  searchFormRef.value.resetFields()
}
</script>
```

## 最佳实践

### 1. 表单字段组织

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <!-- 基础信息 -->
      <el-col :span="24">
        <h4>基础信息</h4>
      </el-col>
      <AFormInput v-model="form.name" label="姓名" :span="12" />
      <AFormInput v-model="form.email" label="邮箱" :span="12" />
      
      <!-- 详细信息 -->
      <el-col :span="24">
        <h4>详细信息</h4>
      </el-col>
      <AFormDate v-model="form.birthDate" label="出生日期" :span="12" />
      <AFormSelect v-model="form.gender" label="性别" :span="12" />
    </el-row>
  </el-form>
</template>
```

### 2. 表单状态管理

```vue
<template>
  <el-form :model="form">
    <!-- 表单字段 -->
    
    <el-form-item>
      <el-button 
        type="primary" 
        @click="submitForm" 
        :loading="loading"
        :disabled="!isFormValid"
      >
        {{ editMode ? '更新' : '创建' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const loading = ref(false)
const editMode = computed(() => !!form.id)

// 表单验证状态
const isFormValid = computed(() => {
  return form.name && form.email && form.status
})
</script>
```

### 3. 表单数据初始化

```vue
<script lang="ts" setup>
// 默认表单数据
const defaultForm = {
  name: '',
  email: '',
  status: '1',
  enabled: true
}

// 表单数据
const form = reactive({ ...defaultForm })

// 初始化表单
const initForm = (data = {}) => {
  Object.assign(form, defaultForm, data)
}

// 编辑时初始化
const edit = (id) => {
  getUserById(id).then(user => {
    initForm(user)
  })
}
</script>
```

## 注意事项

1. **表单验证**：确保所有需要验证的字段都设置了正确的 `prop` 属性
2. **响应式布局**：在不同屏幕尺寸下合理调整 `span` 值
3. **性能优化**：对于复杂表单，考虑使用 `v-show` 而不是 `v-if` 来切换字段显示
4. **数据重置**：使用 `resetFields()` 方法重置表单时，确保初始值设置正确
5. **搜索防抖**：搜索表单的输入事件建议使用防抖处理，提升用户体验

## 常见问题

### 1. 表单验证不生效或触发时机不正确

**问题描述**

表单验证规则已配置,但验证不触发、触发时机不对,或者验证结果与预期不符。

**问题原因**

- `prop` 属性与 `rules` 对象的键名不匹配
- `trigger` 触发时机配置不正确
- 表单字段使用了 `v-if` 动态切换导致验证状态丢失
- 嵌套属性路径未正确设置
- 表单组件未正确绑定 `v-model`

**解决方案**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <!-- 错误示例：prop 与 rules 键名不匹配 -->
    <!-- <AFormInput v-model="form.userName" prop="username" /> -->

    <!-- 正确示例：确保 prop 与 rules 键名完全一致 -->
    <AFormInput
      v-model="form.userName"
      label="用户名"
      prop="userName"
    />

    <!-- 嵌套属性的正确写法 -->
    <AFormInput
      v-model="form.address.city"
      label="城市"
      prop="address.city"
    />

    <!-- 数组项的正确写法 -->
    <template v-for="(item, index) in form.contacts" :key="index">
      <AFormInput
        v-model="item.phone"
        :label="`联系人${index + 1}电话`"
        :prop="`contacts.${index}.phone`"
      />
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface FormData {
  userName: string
  address: {
    city: string
    district: string
  }
  contacts: Array<{
    name: string
    phone: string
  }>
}

const formRef = ref<FormInstance>()

const form = reactive<FormData>({
  userName: '',
  address: {
    city: '',
    district: ''
  },
  contacts: [
    { name: '', phone: '' }
  ]
})

// 验证规则的键名必须与 prop 完全一致
const rules = reactive<FormRules<FormData>>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  // 嵌套属性使用点号分隔
  'address.city': [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  // 动态生成数组项验证规则
  'contacts.0.phone': [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
})

// 动态添加数组项验证规则
const addContactRules = (index: number) => {
  rules[`contacts.${index}.phone`] = [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 验证特定字段的正确方式
const validateField = async (prop: string) => {
  try {
    await formRef.value?.validateField(prop)
    return true
  } catch (error) {
    return false
  }
}

// 完整表单验证
const submitForm = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (valid) {
      console.log('验证通过', form)
    }
  } catch (error) {
    console.log('验证失败', error)
  }
}
</script>
```

**触发时机最佳实践**

```typescript
// 不同控件类型的推荐触发时机
const rules: FormRules = {
  // 输入框：失焦时验证
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],

  // 选择器：值变化时验证
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],

  // 复杂验证：多触发时机
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'change'] },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],

  // 实时验证（如密码强度）
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: validatePasswordStrength,
      trigger: 'input' // 输入时实时验证
    }
  ]
}
```

---

### 2. 动态表单字段验证规则不更新

**问题描述**

使用 `v-if` 或 `v-show` 控制表单字段的显示隐藏时,验证规则不能正确应用或残留旧的验证状态。

**问题原因**

- `v-if` 切换时组件重新挂载,但验证状态未同步清除
- 动态规则使用响应式对象但未正确触发更新
- 条件渲染时未及时清除隐藏字段的验证错误

**解决方案**

```vue
<template>
  <el-form :model="form" :rules="dynamicRules" ref="formRef">
    <!-- 基础字段 -->
    <AFormSelect
      v-model="form.contactType"
      label="联系方式类型"
      prop="contactType"
      :options="contactTypeOptions"
      @change="handleContactTypeChange"
    />

    <!-- 动态字段：使用 v-show 保持组件状态 -->
    <AFormInput
      v-show="form.contactType === 'email'"
      v-model="form.email"
      label="邮箱"
      prop="email"
      key="email-field"
    />

    <AFormInput
      v-show="form.contactType === 'phone'"
      v-model="form.phone"
      label="手机号"
      prop="phone"
      key="phone-field"
    />

    <!-- 复杂条件：使用 v-if 但需手动管理验证状态 -->
    <template v-if="showAdvancedOptions">
      <AFormInput
        v-model="form.company"
        label="公司名称"
        prop="company"
      />
      <AFormInput
        v-model="form.position"
        label="职位"
        prop="position"
      />
    </template>

    <el-button @click="toggleAdvanced">
      {{ showAdvancedOptions ? '隐藏' : '显示' }}高级选项
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface FormData {
  contactType: 'email' | 'phone' | ''
  email: string
  phone: string
  company: string
  position: string
}

const formRef = ref<FormInstance>()
const showAdvancedOptions = ref(false)

const form = reactive<FormData>({
  contactType: '',
  email: '',
  phone: '',
  company: '',
  position: ''
})

// 使用 computed 创建动态验证规则
const dynamicRules = computed<FormRules<FormData>>(() => {
  const baseRules: FormRules<FormData> = {
    contactType: [
      { required: true, message: '请选择联系方式类型', trigger: 'change' }
    ]
  }

  // 根据联系方式类型动态添加规则
  if (form.contactType === 'email') {
    baseRules.email = [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
  } else if (form.contactType === 'phone') {
    baseRules.phone = [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ]
  }

  // 高级选项规则
  if (showAdvancedOptions.value) {
    baseRules.company = [
      { required: true, message: '请输入公司名称', trigger: 'blur' }
    ]
    baseRules.position = [
      { required: true, message: '请输入职位', trigger: 'blur' }
    ]
  }

  return baseRules
})

// 联系方式类型变化时清除验证状态和值
const handleContactTypeChange = async (value: string) => {
  // 清除不相关字段的值
  if (value === 'email') {
    form.phone = ''
    await nextTick()
    formRef.value?.clearValidate('phone')
  } else if (value === 'phone') {
    form.email = ''
    await nextTick()
    formRef.value?.clearValidate('email')
  }
}

// 切换高级选项时清除验证状态
const toggleAdvanced = async () => {
  showAdvancedOptions.value = !showAdvancedOptions.value

  if (!showAdvancedOptions.value) {
    // 隐藏时清除相关字段的值和验证状态
    form.company = ''
    form.position = ''
    await nextTick()
    formRef.value?.clearValidate(['company', 'position'])
  }
}

// 监听动态规则变化,重新验证已填写的字段
watch(
  () => form.contactType,
  async () => {
    await nextTick()
    // 如果当前字段有值,触发重新验证
    if (form.contactType === 'email' && form.email) {
      formRef.value?.validateField('email')
    } else if (form.contactType === 'phone' && form.phone) {
      formRef.value?.validateField('phone')
    }
  }
)

// 提交时只验证当前可见的字段
const submitForm = async () => {
  if (!formRef.value) return

  // 获取当前需要验证的字段列表
  const fieldsToValidate: string[] = ['contactType']

  if (form.contactType === 'email') {
    fieldsToValidate.push('email')
  } else if (form.contactType === 'phone') {
    fieldsToValidate.push('phone')
  }

  if (showAdvancedOptions.value) {
    fieldsToValidate.push('company', 'position')
  }

  try {
    // 只验证指定字段
    await Promise.all(
      fieldsToValidate.map(field => formRef.value!.validateField(field))
    )
    console.log('验证通过', form)
  } catch (error) {
    console.log('验证失败', error)
  }
}
</script>
```

**使用 FormItem 的 key 属性强制重新渲染**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <!-- 使用 key 强制重新挂载组件,自动重置验证状态 -->
    <el-form-item
      v-if="form.type === 'personal'"
      :key="`personal-${resetKey}`"
      label="身份证号"
      prop="idCard"
    >
      <el-input v-model="form.idCard" />
    </el-form-item>

    <el-form-item
      v-if="form.type === 'company'"
      :key="`company-${resetKey}`"
      label="统一社会信用代码"
      prop="creditCode"
    >
      <el-input v-model="form.creditCode" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const resetKey = ref(0)

// 切换类型时增加 key,强制重新渲染
const handleTypeChange = () => {
  resetKey.value++
}
</script>
```

---

### 3. 表单重置后数据未正确恢复初始值

**问题描述**

调用 `resetFields()` 方法后,表单数据未恢复到期望的初始值,或者部分字段未被重置。

**问题原因**

- `resetFields()` 只能恢复到组件挂载时的初始值
- 动态设置的初始值在组件挂载后才赋值,不会被识别为初始值
- 使用 `Object.assign` 或展开运算符时,引用被替换
- 嵌套对象的初始值设置不正确

**解决方案**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormInput v-model="form.name" label="姓名" prop="name" />
    <AFormInput v-model="form.email" label="邮箱" prop="email" />
    <AFormSelect v-model="form.status" label="状态" prop="status" :options="statusOptions" />

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
      <el-button @click="resetToDefault">重置为默认</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import type { FormInstance } from 'element-plus'

interface FormData {
  id?: number
  name: string
  email: string
  status: string
}

// 定义默认值常量（不可变）
const DEFAULT_FORM: Readonly<FormData> = Object.freeze({
  name: '',
  email: '',
  status: '1'
})

const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number>()

// 表单数据（使用函数创建新对象,避免引用问题）
const createInitialForm = (): FormData => ({ ...DEFAULT_FORM })
const form = reactive<FormData>(createInitialForm())

// 保存初始值的快照（用于编辑模式）
let initialSnapshot: FormData = { ...form }

// 初始化表单数据（编辑模式）
const initForm = async (id: number) => {
  isEdit.value = true
  editId.value = id

  try {
    // 从 API 获取数据
    const data = await getUserById(id)

    // 直接修改 reactive 对象的属性,保持引用
    Object.keys(data).forEach(key => {
      if (key in form) {
        (form as any)[key] = data[key]
      }
    })

    // 保存初始快照
    initialSnapshot = { ...form }

    // 关键：等待 DOM 更新后清除验证状态
    await nextTick()
    formRef.value?.clearValidate()
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

// 重置表单（使用 Element Plus 的 resetFields）
const resetForm = () => {
  // resetFields 恢复到组件挂载时的值
  formRef.value?.resetFields()
}

// 重置为默认值（自定义重置）
const resetToDefault = () => {
  // 直接修改属性,保持 reactive 引用
  Object.assign(form, DEFAULT_FORM)
  // 清除验证状态
  formRef.value?.clearValidate()
}

// 重置为初始快照（编辑模式下恢复到加载时的值）
const resetToInitial = () => {
  Object.assign(form, initialSnapshot)
  formRef.value?.clearValidate()
}

// 完全重置（用于新建模式）
const fullReset = () => {
  isEdit.value = false
  editId.value = undefined
  Object.assign(form, DEFAULT_FORM)
  initialSnapshot = { ...DEFAULT_FORM }
  formRef.value?.clearValidate()
}

// 对话框场景下的表单管理
interface DialogProps {
  visible: boolean
  editData?: FormData
}

const props = defineProps<DialogProps>()

// 监听对话框打开
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.editData) {
        // 编辑模式：用传入的数据初始化
        Object.assign(form, props.editData)
        isEdit.value = true
      } else {
        // 新建模式：使用默认值
        Object.assign(form, DEFAULT_FORM)
        isEdit.value = false
      }
      // 保存快照
      initialSnapshot = { ...form }

      // 清除之前的验证状态
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  },
  { immediate: true }
)
</script>
```

**处理嵌套对象的重置**

```vue
<script setup lang="ts">
interface AddressForm {
  province: string
  city: string
  district: string
  detail: string
}

interface FormData {
  name: string
  address: AddressForm
  tags: string[]
}

// 默认值必须包含嵌套结构
const DEFAULT_FORM: Readonly<FormData> = Object.freeze({
  name: '',
  address: Object.freeze({
    province: '',
    city: '',
    district: '',
    detail: ''
  }),
  tags: []
})

// 深拷贝函数
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// 创建初始表单（使用深拷贝）
const form = reactive<FormData>(deepClone(DEFAULT_FORM))

// 重置为默认值（使用深拷贝）
const resetToDefault = () => {
  const defaultData = deepClone(DEFAULT_FORM)

  // 递归赋值保持响应性
  Object.keys(defaultData).forEach(key => {
    const value = defaultData[key as keyof FormData]
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // 数组：清空后重新填充
        const arr = form[key as keyof FormData] as unknown as any[]
        arr.length = 0
        arr.push(...value)
      } else {
        // 对象：递归赋值
        Object.assign(form[key as keyof FormData], value)
      }
    } else {
      (form as any)[key] = value
    }
  })

  formRef.value?.clearValidate()
}

// 使用 lodash 的 cloneDeep 更可靠
import { cloneDeep, merge } from 'lodash-es'

const resetFormWithLodash = () => {
  const defaultData = cloneDeep(DEFAULT_FORM)
  // merge 会保持目标对象的引用
  merge(form, defaultData)
  formRef.value?.clearValidate()
}
</script>
```

---

### 4. 表单联动导致的循环更新问题

**问题描述**

多个表单字段之间存在联动关系时,值的变化触发相互更新,导致无限循环或性能问题。

**问题原因**

- watch 监听多个字段时形成循环依赖
- 联动逻辑在更新时又触发了新的联动
- computed 属性中同时读写响应式数据
- 异步联动操作的时序问题

**解决方案**

```vue
<template>
  <el-form :model="form" ref="formRef">
    <!-- 省市区联动 -->
    <AFormSelect
      v-model="form.province"
      label="省份"
      prop="province"
      :options="provinceOptions"
      @change="handleProvinceChange"
    />

    <AFormSelect
      v-model="form.city"
      label="城市"
      prop="city"
      :options="cityOptions"
      :disabled="!form.province"
      @change="handleCityChange"
    />

    <AFormSelect
      v-model="form.district"
      label="区县"
      prop="district"
      :options="districtOptions"
      :disabled="!form.city"
    />

    <!-- 价格联动 -->
    <AFormInput
      v-model="form.unitPrice"
      label="单价"
      prop="unitPrice"
      type="number"
    />

    <AFormInput
      v-model="form.quantity"
      label="数量"
      prop="quantity"
      type="number"
    />

    <AFormInput
      v-model="form.totalPrice"
      label="总价"
      prop="totalPrice"
      type="number"
      :disabled="autoCalculate"
    />

    <el-checkbox v-model="autoCalculate">自动计算总价</el-checkbox>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, watchEffect } from 'vue'
import { debounce } from 'lodash-es'

interface FormData {
  province: string
  city: string
  district: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

const form = reactive<FormData>({
  province: '',
  city: '',
  district: '',
  unitPrice: 0,
  quantity: 0,
  totalPrice: 0
})

const autoCalculate = ref(true)

// 省市区选项
const provinceOptions = ref<SelectOption[]>([])
const cityOptions = ref<SelectOption[]>([])
const districtOptions = ref<SelectOption[]>([])

// 使用标志位防止循环更新
let isUpdating = false

// 省份变化处理
const handleProvinceChange = async (province: string) => {
  if (isUpdating) return

  isUpdating = true
  try {
    // 清空下级选项和值
    form.city = ''
    form.district = ''
    cityOptions.value = []
    districtOptions.value = []

    if (province) {
      // 加载城市选项
      cityOptions.value = await getCitiesByProvince(province)
    }
  } finally {
    isUpdating = false
  }
}

// 城市变化处理
const handleCityChange = async (city: string) => {
  if (isUpdating) return

  isUpdating = true
  try {
    // 清空下级
    form.district = ''
    districtOptions.value = []

    if (city) {
      // 加载区县选项
      districtOptions.value = await getDistrictsByCity(city)
    }
  } finally {
    isUpdating = false
  }
}

// 价格联动：使用 watchEffect 自动追踪依赖
watchEffect(() => {
  if (autoCalculate.value && !isUpdating) {
    // 计算总价（只读取,不会形成循环）
    const calculated = form.unitPrice * form.quantity

    // 使用 queueMicrotask 延迟更新,避免同步循环
    queueMicrotask(() => {
      if (form.totalPrice !== calculated) {
        form.totalPrice = calculated
      }
    })
  }
})

// 更安全的方式：使用 computed 只读属性 + 手动同步
const calculatedTotal = computed(() => form.unitPrice * form.quantity)

// 使用防抖处理联动更新
const syncTotalPrice = debounce(() => {
  if (autoCalculate.value) {
    form.totalPrice = calculatedTotal.value
  }
}, 100)

// 监听依赖项变化
watch(
  () => [form.unitPrice, form.quantity, autoCalculate.value],
  () => {
    syncTotalPrice()
  },
  { flush: 'post' } // 在 DOM 更新后执行
)

// 复杂联动场景：使用状态机
type LinkageState = 'idle' | 'updating-province' | 'updating-city' | 'updating-price'

const linkageState = ref<LinkageState>('idle')

const handleComplexLinkage = async (field: string, value: any) => {
  // 检查是否正在进行其他联动
  if (linkageState.value !== 'idle') {
    return
  }

  switch (field) {
    case 'province':
      linkageState.value = 'updating-province'
      try {
        form.city = ''
        form.district = ''
        await loadCities(value)
      } finally {
        linkageState.value = 'idle'
      }
      break

    case 'city':
      linkageState.value = 'updating-city'
      try {
        form.district = ''
        await loadDistricts(value)
      } finally {
        linkageState.value = 'idle'
      }
      break

    case 'unitPrice':
    case 'quantity':
      linkageState.value = 'updating-price'
      try {
        if (autoCalculate.value) {
          form.totalPrice = form.unitPrice * form.quantity
        }
      } finally {
        linkageState.value = 'idle'
      }
      break
  }
}
</script>
```

**使用 VueUse 的 watchDebounced 和 watchThrottled**

```vue
<script setup lang="ts">
import { watchDebounced, watchThrottled, pausableWatch } from '@vueuse/core'

// 防抖监听：适用于输入联动
watchDebounced(
  () => form.keyword,
  async (keyword) => {
    if (keyword) {
      const suggestions = await searchSuggestions(keyword)
      suggestionList.value = suggestions
    }
  },
  { debounce: 300 }
)

// 节流监听：适用于频繁更新
watchThrottled(
  () => form.quantity,
  (quantity) => {
    // 更新库存信息
    checkStock(quantity)
  },
  { throttle: 500 }
)

// 可暂停的监听：用于临时禁用联动
const { pause, resume } = pausableWatch(
  () => form.province,
  async (province) => {
    await loadCities(province)
  }
)

// 批量更新时暂停监听
const batchUpdate = async (data: FormData) => {
  pause() // 暂停联动

  Object.assign(form, data)

  await nextTick()
  resume() // 恢复联动
}
</script>
```

---

### 5. 大型表单性能卡顿问题

**问题描述**

表单包含大量字段（如 50+ 个）或复杂的动态字段时,出现明显的输入延迟、渲染卡顿。

**问题原因**

- 所有字段同时渲染,DOM 节点过多
- 每次输入都触发整个表单的响应式更新
- 验证规则计算复杂或频繁执行
- 过度使用 computed 和 watch

**解决方案**

```vue
<template>
  <el-form :model="form" ref="formRef">
    <!-- 分组渲染：只渲染当前激活的分组 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane
        v-for="group in formGroups"
        :key="group.key"
        :label="group.label"
        :name="group.key"
        lazy
      >
        <!-- 使用 v-show 而非 v-if 保持状态 -->
        <div v-show="activeTab === group.key">
          <template v-for="field in group.fields" :key="field.prop">
            <component
              :is="getFieldComponent(field.type)"
              v-model="form[field.prop]"
              v-bind="field.props"
            />
          </template>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 虚拟滚动：用于长列表字段 -->
    <el-virtual-list
      v-if="dynamicFields.length > 20"
      :data="dynamicFields"
      :item-size="60"
      :height="400"
    >
      <template #default="{ item, index }">
        <AFormInput
          v-model="form.dynamicValues[index]"
          :label="item.label"
          :prop="`dynamicValues.${index}`"
        />
      </template>
    </el-virtual-list>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, shallowReactive, markRaw } from 'vue'

// 使用 shallowReactive 减少深层响应式开销
const form = shallowReactive({
  // 基础字段正常响应
  name: '',
  email: '',

  // 大量动态字段使用普通数组
  dynamicValues: [] as string[],

  // 复杂对象使用 markRaw 标记为非响应式
  metadata: markRaw({
    createTime: new Date(),
    config: { /* 大量配置 */ }
  })
})

// 使用 shallowRef 存储组件选项（避免深层响应式）
const fieldComponents = shallowRef({
  input: AFormInput,
  select: AFormSelect,
  date: AFormDate
})

// 懒加载表单分组
const formGroups = ref([
  {
    key: 'basic',
    label: '基础信息',
    fields: [
      { type: 'input', prop: 'name', props: { label: '姓名' } },
      { type: 'input', prop: 'email', props: { label: '邮箱' } }
    ]
  },
  {
    key: 'detail',
    label: '详细信息',
    fields: [/* ... */],
    // 延迟加载字段配置
    loadFields: async () => {
      const config = await loadFieldConfig('detail')
      return config.fields
    }
  }
])

// 按需加载分组字段
const activeTab = ref('basic')
const loadedTabs = new Set(['basic'])

watch(activeTab, async (tab) => {
  if (!loadedTabs.has(tab)) {
    const group = formGroups.value.find(g => g.key === tab)
    if (group?.loadFields) {
      group.fields = await group.loadFields()
      loadedTabs.add(tab)
    }
  }
})

// 优化验证：延迟验证
const validateFieldDebounced = debounce(async (prop: string) => {
  await formRef.value?.validateField(prop)
}, 300)

// 批量验证优化：分批验证避免阻塞
const validateInBatches = async (props: string[], batchSize = 5) => {
  const batches: string[][] = []
  for (let i = 0; i < props.length; i += batchSize) {
    batches.push(props.slice(i, i + batchSize))
  }

  for (const batch of batches) {
    await Promise.all(
      batch.map(prop => formRef.value?.validateField(prop))
    )
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
</script>
```

**使用 Web Worker 处理复杂验证**

```typescript
// validation.worker.ts
self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data

  if (type === 'validate') {
    const results = validateFormData(data)
    self.postMessage({ type: 'result', results })
  }
}

function validateFormData(data: any) {
  const errors: Record<string, string> = {}

  // 复杂验证逻辑
  if (data.idCard && !validateIdCard(data.idCard)) {
    errors.idCard = '身份证号格式不正确'
  }

  if (data.bankCard && !validateBankCard(data.bankCard)) {
    errors.bankCard = '银行卡号格式不正确'
  }

  // ... 更多验证

  return errors
}
```

```vue
<script setup lang="ts">
// 使用 Web Worker 执行复杂验证
const worker = new Worker(new URL('./validation.worker.ts', import.meta.url))

const validateWithWorker = () => {
  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      if (e.data.type === 'result') {
        resolve(e.data.results)
      }
    }
    worker.postMessage({ type: 'validate', data: toRaw(form) })
  })
}

// 提交时使用 Worker 验证
const submitForm = async () => {
  const errors = await validateWithWorker()

  if (Object.keys(errors).length === 0) {
    // 验证通过
    await submitData(form)
  } else {
    // 显示错误
    Object.entries(errors).forEach(([field, message]) => {
      ElMessage.error(message as string)
    })
  }
}
</script>
```

**组件级别优化**

```vue
<template>
  <!-- 使用 v-memo 缓存不变的部分 -->
  <el-form :model="form">
    <template v-for="field in fields" :key="field.prop">
      <div v-memo="[form[field.prop], field.disabled]">
        <AFormInput
          v-model="form[field.prop]"
          v-bind="field"
        />
      </div>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 异步加载复杂组件
const HeavyEditor = defineAsyncComponent({
  loader: () => import('@/components/HeavyEditor.vue'),
  loadingComponent: () => h('div', 'Loading...'),
  delay: 200
})

// 使用 KeepAlive 缓存表单分组
</script>
```

---

### 6. 表单组件值与API格式不匹配

**问题描述**

前端表单组件的值格式与后端API期望的格式不一致,如日期格式、枚举值、嵌套结构等。

**问题原因**

- 日期选择器返回 Date 对象,API 需要字符串
- 多选返回数组,API 需要逗号分隔的字符串
- 树形选择器返回数组,API 需要最后一级的值
- 开关返回布尔值,API 需要 0/1 数字

**解决方案**

```vue
<template>
  <el-form :model="form" ref="formRef">
    <!-- 日期字段 -->
    <AFormDate
      v-model="form.createTime"
      label="创建时间"
      prop="createTime"
      type="datetime"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
    />

    <!-- 日期范围字段 -->
    <AFormDate
      v-model="form.dateRange"
      label="时间范围"
      prop="dateRange"
      type="daterange"
    />

    <!-- 多选字段 -->
    <AFormSelect
      v-model="form.tags"
      label="标签"
      prop="tags"
      :options="tagOptions"
      multiple
    />

    <!-- 级联选择 -->
    <AFormCascader
      v-model="form.region"
      label="地区"
      prop="region"
      :options="regionOptions"
    />

    <!-- 开关 -->
    <AFormSwitch
      v-model="form.enabled"
      label="启用"
      prop="enabled"
    />

    <el-button @click="submitForm">提交</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import dayjs from 'dayjs'

// 表单数据（前端格式）
interface FormData {
  createTime: string
  dateRange: [string, string] | null
  tags: string[]
  region: string[]
  enabled: boolean
}

// API 数据（后端格式）
interface ApiData {
  createTime: string
  startTime: string
  endTime: string
  tags: string
  regionCode: string
  enabled: number
}

const form = reactive<FormData>({
  createTime: '',
  dateRange: null,
  tags: [],
  region: [],
  enabled: true
})

// 数据转换器：前端 -> API
const transformFormToApi = (formData: FormData): ApiData => {
  return {
    // 日期保持格式
    createTime: formData.createTime,

    // 日期范围拆分
    startTime: formData.dateRange?.[0] || '',
    endTime: formData.dateRange?.[1] || '',

    // 数组转字符串
    tags: formData.tags.join(','),

    // 级联取最后一级
    regionCode: formData.region[formData.region.length - 1] || '',

    // 布尔转数字
    enabled: formData.enabled ? 1 : 0
  }
}

// 数据转换器：API -> 前端
const transformApiToForm = (apiData: ApiData): FormData => {
  return {
    createTime: apiData.createTime,

    // 合并日期范围
    dateRange: apiData.startTime && apiData.endTime
      ? [apiData.startTime, apiData.endTime]
      : null,

    // 字符串转数组
    tags: apiData.tags ? apiData.tags.split(',') : [],

    // 需要根据 regionCode 反查完整路径
    region: [], // 需要异步获取

    // 数字转布尔
    enabled: apiData.enabled === 1
  }
}

// 编辑时初始化表单
const initFormForEdit = async (id: number) => {
  const apiData = await getDataById(id)
  const formData = transformApiToForm(apiData)

  // 反查级联路径
  if (apiData.regionCode) {
    formData.region = await getRegionPath(apiData.regionCode)
  }

  Object.assign(form, formData)
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const apiData = transformFormToApi(form)
  await saveData(apiData)
}
</script>
```

**使用转换层封装复杂转换逻辑**

```typescript
// transformers/form.ts
import dayjs from 'dayjs'

type TransformDirection = 'toApi' | 'toForm'

interface TransformRule {
  toApi: (value: any) => any
  toForm: (value: any) => any
}

// 预定义转换规则
export const transformRules: Record<string, TransformRule> = {
  // 日期时间转换
  datetime: {
    toApi: (value: Date | string) => {
      if (!value) return ''
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    },
    toForm: (value: string) => {
      if (!value) return ''
      return value // 或返回 Date 对象
    }
  },

  // 日期范围转换
  dateRange: {
    toApi: (value: [string, string] | null) => ({
      startTime: value?.[0] || '',
      endTime: value?.[1] || ''
    }),
    toForm: (value: { startTime: string; endTime: string }) => {
      if (!value.startTime || !value.endTime) return null
      return [value.startTime, value.endTime] as [string, string]
    }
  },

  // 数组转字符串
  arrayToString: {
    toApi: (value: any[]) => value?.join(',') || '',
    toForm: (value: string) => value ? value.split(',') : []
  },

  // 布尔转数字
  boolToNumber: {
    toApi: (value: boolean) => value ? 1 : 0,
    toForm: (value: number) => value === 1
  },

  // 级联选择器
  cascader: {
    toApi: (value: string[]) => value?.[value.length - 1] || '',
    toForm: async (value: string, getPath: (code: string) => Promise<string[]>) => {
      if (!value) return []
      return await getPath(value)
    }
  }
}

// 自动转换器
export function createTransformer<F, A>(
  fieldMappings: Record<keyof F, {
    apiField?: string | string[]
    rule?: keyof typeof transformRules
    custom?: TransformRule
  }>
) {
  return {
    toApi(formData: F): A {
      const result: any = {}

      for (const [formField, mapping] of Object.entries(fieldMappings)) {
        const value = formData[formField as keyof F]
        const rule = mapping.rule ? transformRules[mapping.rule] : mapping.custom
        const transformed = rule ? rule.toApi(value) : value

        if (mapping.apiField) {
          if (Array.isArray(mapping.apiField)) {
            // 一对多映射
            Object.assign(result, transformed)
          } else {
            result[mapping.apiField] = transformed
          }
        } else {
          result[formField] = transformed
        }
      }

      return result as A
    },

    toForm(apiData: A): F {
      const result: any = {}

      for (const [formField, mapping] of Object.entries(fieldMappings)) {
        const rule = mapping.rule ? transformRules[mapping.rule] : mapping.custom
        let value: any

        if (mapping.apiField) {
          if (Array.isArray(mapping.apiField)) {
            // 一对多映射的逆转换
            value = mapping.apiField.reduce((acc, field) => {
              acc[field] = apiData[field as keyof A]
              return acc
            }, {})
          } else {
            value = apiData[mapping.apiField as keyof A]
          }
        } else {
          value = apiData[formField as keyof A]
        }

        result[formField] = rule ? rule.toForm(value) : value
      }

      return result as F
    }
  }
}

// 使用示例
const userFormTransformer = createTransformer<FormData, ApiData>({
  createTime: { rule: 'datetime' },
  dateRange: { apiField: ['startTime', 'endTime'], rule: 'dateRange' },
  tags: { rule: 'arrayToString' },
  region: { apiField: 'regionCode', rule: 'cascader' },
  enabled: { rule: 'boolToNumber' }
})

// 使用
const apiData = userFormTransformer.toApi(form)
const formData = userFormTransformer.toForm(apiData)
```

---

### 7. 多步骤表单数据管理混乱

**问题描述**

多步骤向导式表单中,步骤之间的数据共享、验证和状态管理变得复杂,容易出现数据丢失或不一致。

**问题原因**

- 各步骤组件独立管理状态,数据不同步
- 步骤切换时验证状态丢失
- 步骤返回修改时数据未正确回显
- 最终提交时数据合并不完整

**解决方案**

```vue
<!-- StepForm.vue - 多步骤表单容器 -->
<template>
  <div class="step-form">
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" finish-status="success">
      <el-step
        v-for="step in steps"
        :key="step.key"
        :title="step.title"
        :description="step.description"
        :status="getStepStatus(step.key)"
      />
    </el-steps>

    <!-- 步骤内容 -->
    <div class="step-content">
      <keep-alive>
        <component
          :is="currentStepComponent"
          ref="stepFormRef"
          :model-value="formData"
          :readonly="isReadonly"
          @update:model-value="updateFormData"
        />
      </keep-alive>
    </div>

    <!-- 步骤操作按钮 -->
    <div class="step-actions">
      <el-button v-if="currentStep > 0" @click="prevStep">
        上一步
      </el-button>
      <el-button
        v-if="currentStep < steps.length - 1"
        type="primary"
        @click="nextStep"
        :loading="validating"
      >
        下一步
      </el-button>
      <el-button
        v-if="currentStep === steps.length - 1"
        type="primary"
        @click="submitForm"
        :loading="submitting"
      >
        提交
      </el-button>
      <el-button @click="saveAsDraft">保存草稿</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, provide, markRaw } from 'vue'
import StepBasicInfo from './steps/StepBasicInfo.vue'
import StepContactInfo from './steps/StepContactInfo.vue'
import StepBusinessInfo from './steps/StepBusinessInfo.vue'
import StepConfirm from './steps/StepConfirm.vue'

// 表单数据类型
interface StepFormData {
  // 基础信息
  basic: {
    name: string
    type: string
    category: string
  }
  // 联系信息
  contact: {
    email: string
    phone: string
    address: string
  }
  // 业务信息
  business: {
    description: string
    budget: number
    deadline: string
  }
}

// 步骤配置
const steps = [
  {
    key: 'basic',
    title: '基础信息',
    description: '填写基础信息',
    component: markRaw(StepBasicInfo)
  },
  {
    key: 'contact',
    title: '联系信息',
    description: '填写联系方式',
    component: markRaw(StepContactInfo)
  },
  {
    key: 'business',
    title: '业务信息',
    description: '填写业务详情',
    component: markRaw(StepBusinessInfo)
  },
  {
    key: 'confirm',
    title: '确认提交',
    description: '确认并提交',
    component: markRaw(StepConfirm)
  }
]

const currentStep = ref(0)
const validating = ref(false)
const submitting = ref(false)
const stepFormRef = ref<any>()
const isReadonly = ref(false)

// 集中管理的表单数据
const formData = reactive<StepFormData>({
  basic: {
    name: '',
    type: '',
    category: ''
  },
  contact: {
    email: '',
    phone: '',
    address: ''
  },
  business: {
    description: '',
    budget: 0,
    deadline: ''
  }
})

// 步骤验证状态
const stepValidation = reactive<Record<string, boolean>>({
  basic: false,
  contact: false,
  business: false
})

// 当前步骤组件
const currentStepComponent = computed(() => steps[currentStep.value].component)

// 当前步骤的数据键
const currentStepKey = computed(() => steps[currentStep.value].key)

// 获取步骤状态
const getStepStatus = (stepKey: string) => {
  const stepIndex = steps.findIndex(s => s.key === stepKey)
  if (stepIndex < currentStep.value) {
    return stepValidation[stepKey] ? 'success' : 'error'
  }
  if (stepIndex === currentStep.value) {
    return 'process'
  }
  return 'wait'
}

// 更新表单数据
const updateFormData = (data: Partial<StepFormData>) => {
  Object.assign(formData, data)
}

// 验证当前步骤
const validateCurrentStep = async (): Promise<boolean> => {
  if (!stepFormRef.value?.validate) {
    return true
  }

  try {
    validating.value = true
    const valid = await stepFormRef.value.validate()
    stepValidation[currentStepKey.value] = valid
    return valid
  } catch (error) {
    stepValidation[currentStepKey.value] = false
    return false
  } finally {
    validating.value = false
  }
}

// 下一步
const nextStep = async () => {
  const valid = await validateCurrentStep()
  if (valid) {
    currentStep.value++
  } else {
    ElMessage.warning('请完善当前步骤的信息')
  }
}

// 上一步
const prevStep = () => {
  currentStep.value--
}

// 跳转到指定步骤（仅允许跳转到已完成的步骤）
const goToStep = (index: number) => {
  if (index < currentStep.value) {
    currentStep.value = index
  }
}

// 提交表单
const submitForm = async () => {
  // 验证所有步骤
  const allValid = Object.values(stepValidation).every(v => v)
  if (!allValid) {
    ElMessage.error('请完善所有步骤的信息')
    // 跳转到第一个未验证的步骤
    const firstInvalidStep = Object.entries(stepValidation)
      .find(([, valid]) => !valid)
    if (firstInvalidStep) {
      const index = steps.findIndex(s => s.key === firstInvalidStep[0])
      if (index !== -1) {
        currentStep.value = index
      }
    }
    return
  }

  try {
    submitting.value = true
    await submitData(formData)
    ElMessage.success('提交成功')
    emit('success', formData)
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 保存草稿
const saveAsDraft = async () => {
  const draft = {
    currentStep: currentStep.value,
    formData: JSON.parse(JSON.stringify(formData)),
    stepValidation: { ...stepValidation }
  }

  await saveDraft(draft)
  ElMessage.success('草稿已保存')
}

// 恢复草稿
const restoreDraft = async () => {
  const draft = await getDraft()
  if (draft) {
    currentStep.value = draft.currentStep
    Object.assign(formData, draft.formData)
    Object.assign(stepValidation, draft.stepValidation)
  }
}

// 提供上下文给子步骤组件
provide('stepFormContext', {
  formData,
  currentStep,
  stepValidation,
  goToStep,
  isReadonly
})

// 初始化时尝试恢复草稿
onMounted(() => {
  restoreDraft()
})
</script>
```

**单个步骤组件示例**

```vue
<!-- steps/StepBasicInfo.vue -->
<template>
  <el-form
    :model="localData"
    :rules="rules"
    ref="formRef"
    :disabled="readonly"
    label-width="120px"
  >
    <AFormInput
      v-model="localData.name"
      label="名称"
      prop="name"
      :span="12"
    />
    <AFormSelect
      v-model="localData.type"
      label="类型"
      prop="type"
      :options="typeOptions"
      :span="12"
      @change="handleTypeChange"
    />
    <AFormSelect
      v-model="localData.category"
      label="分类"
      prop="category"
      :options="categoryOptions"
      :span="12"
    />
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, inject } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface BasicInfo {
  name: string
  type: string
  category: string
}

interface Props {
  modelValue: { basic: BasicInfo }
  readonly?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [data: { basic: BasicInfo }]
}>()

const formRef = ref<FormInstance>()

// 本地数据（双向绑定）
const localData = reactive<BasicInfo>({
  name: '',
  type: '',
  category: ''
})

// 同步父组件数据到本地
watch(
  () => props.modelValue.basic,
  (newVal) => {
    if (newVal) {
      Object.assign(localData, newVal)
    }
  },
  { immediate: true, deep: true }
)

// 同步本地数据到父组件
watch(
  localData,
  (newVal) => {
    emit('update:modelValue', {
      ...props.modelValue,
      basic: { ...newVal }
    })
  },
  { deep: true }
)

// 验证规则
const rules: FormRules<BasicInfo> = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 类型选项
const typeOptions = ref([
  { label: '类型A', value: 'A' },
  { label: '类型B', value: 'B' }
])

// 分类选项（根据类型联动）
const categoryOptions = ref<SelectOption[]>([])

const handleTypeChange = async (type: string) => {
  localData.category = ''
  categoryOptions.value = await getCategoriesByType(type)
}

// 暴露验证方法给父组件
const validate = async () => {
  return await formRef.value?.validate()
}

defineExpose({ validate })
</script>
```

---

### 8. 表单组件异步校验与提交冲突

**问题描述**

表单包含异步校验器（如唯一性检查）时,用户快速点击提交按钮可能导致提交在校验完成前执行,或者多次校验请求并发导致结果不一致。

**问题原因**

- 异步校验未完成时触发了表单提交
- 多次输入导致多个校验请求并发,最后完成的不一定是最新的
- 校验请求无取消机制,组件卸载后仍执行回调
- 校验状态与输入值不同步

**解决方案**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <!-- 需要异步校验的字段 -->
    <el-form-item label="用户名" prop="userName">
      <el-input
        v-model="form.userName"
        @blur="handleUserNameBlur"
        :suffix-icon="validatingUserName ? 'Loading' : undefined"
      />
      <span v-if="validatingUserName" class="validating-tip">
        正在检查用户名...
      </span>
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="form.email"
        @blur="handleEmailBlur"
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="submitting"
        :disabled="isValidating"
      >
        {{ isValidating ? '校验中...' : '提交' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface FormData {
  userName: string
  email: string
}

const formRef = ref<FormInstance>()
const submitting = ref(false)
const validatingUserName = ref(false)
const validatingEmail = ref(false)

// 当前正在进行的校验请求
let currentUserNameValidation: AbortController | null = null
let currentEmailValidation: AbortController | null = null

const form = reactive<FormData>({
  userName: '',
  email: ''
})

// 整体校验状态
const isValidating = computed(() =>
  validatingUserName.value || validatingEmail.value
)

// 创建可取消的异步校验器
const createAsyncValidator = (
  apiCall: (value: string, signal: AbortSignal) => Promise<boolean>,
  validatingRef: Ref<boolean>,
  controllerRef: { current: AbortController | null }
) => {
  return async (rule: any, value: string): Promise<void> => {
    if (!value) {
      return Promise.resolve()
    }

    // 取消之前的请求
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    // 创建新的取消控制器
    const controller = new AbortController()
    controllerRef.current = controller

    validatingRef.value = true

    try {
      const isValid = await apiCall(value, controller.signal)

      // 检查是否被取消
      if (controller.signal.aborted) {
        return Promise.resolve() // 被取消时不返回错误
      }

      if (!isValid) {
        return Promise.reject(new Error(rule.message))
      }

      return Promise.resolve()
    } catch (error) {
      // 忽略取消导致的错误
      if ((error as Error).name === 'AbortError') {
        return Promise.resolve()
      }
      return Promise.reject(error)
    } finally {
      // 只有当前请求未被取消时才更新状态
      if (!controller.signal.aborted) {
        validatingRef.value = false
        controllerRef.current = null
      }
    }
  }
}

// 检查用户名是否存在
const checkUserNameExists = async (userName: string, signal: AbortSignal): Promise<boolean> => {
  const response = await fetch(`/api/check-username?name=${userName}`, { signal })
  const data = await response.json()
  return !data.exists // 不存在返回 true（校验通过）
}

// 检查邮箱是否存在
const checkEmailExists = async (email: string, signal: AbortSignal): Promise<boolean> => {
  const response = await fetch(`/api/check-email?email=${email}`, { signal })
  const data = await response.json()
  return !data.exists
}

// 用户名校验器引用
const userNameControllerRef = { current: null as AbortController | null }
const emailControllerRef = { current: null as AbortController | null }

// 验证规则
const rules: FormRules<FormData> = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    {
      asyncValidator: createAsyncValidator(
        checkUserNameExists,
        validatingUserName,
        userNameControllerRef
      ),
      message: '用户名已存在',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
    {
      asyncValidator: createAsyncValidator(
        checkEmailExists,
        validatingEmail,
        emailControllerRef
      ),
      message: '邮箱已被注册',
      trigger: 'blur'
    }
  ]
}

// 手动触发用户名校验（用于即时反馈）
const handleUserNameBlur = () => {
  if (form.userName) {
    formRef.value?.validateField('userName')
  }
}

const handleEmailBlur = () => {
  if (form.email) {
    formRef.value?.validateField('email')
  }
}

// 提交表单（等待所有异步校验完成）
const submitForm = async () => {
  // 等待进行中的校验完成
  if (isValidating.value) {
    ElMessage.info('正在校验,请稍候...')
    return
  }

  try {
    submitting.value = true

    // 执行完整的表单校验
    const valid = await formRef.value?.validate()

    if (valid) {
      // 再次确认没有进行中的校验
      if (isValidating.value) {
        ElMessage.warning('请等待校验完成')
        return
      }

      await submitData(form)
      ElMessage.success('提交成功')
    }
  } catch (error) {
    console.error('表单校验失败', error)
  } finally {
    submitting.value = false
  }
}

// 组件卸载时取消所有进行中的请求
onUnmounted(() => {
  if (userNameControllerRef.current) {
    userNameControllerRef.current.abort()
  }
  if (emailControllerRef.current) {
    emailControllerRef.current.abort()
  }
})
</script>

<style scoped>
.validating-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
```

**使用 VueUse 简化异步校验管理**

```vue
<script setup lang="ts">
import { useDebounceFn, useAsyncState, watchDebounced } from '@vueuse/core'

// 使用 useDebounceFn 包装校验函数
const debouncedCheckUserName = useDebounceFn(async (userName: string) => {
  const response = await fetch(`/api/check-username?name=${userName}`)
  const data = await response.json()
  return !data.exists
}, 500)

// 使用 useAsyncState 管理异步状态
const { state: userNameValid, isLoading: checkingUserName, execute: checkUserName } = useAsyncState(
  async (userName: string) => {
    if (!userName) return true
    return await debouncedCheckUserName(userName)
  },
  true,
  { immediate: false }
)

// 监听用户名变化,触发校验
watchDebounced(
  () => form.userName,
  async (userName) => {
    if (userName && userName.length >= 3) {
      await checkUserName(0, userName)
    }
  },
  { debounce: 500 }
)

// 动态规则:根据异步校验结果
const dynamicRules = computed(() => ({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (checkingUserName.value) {
          return Promise.reject(new Error('正在校验...'))
        }
        if (!userNameValid.value) {
          return Promise.reject(new Error('用户名已存在'))
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}))
</script>
```

**封装通用的异步校验 Hook**

```typescript
// composables/useAsyncValidator.ts
import { ref, onUnmounted } from 'vue'

interface AsyncValidatorOptions {
  debounceMs?: number
  cacheTime?: number
}

export function useAsyncValidator<T = string>(
  validator: (value: T, signal: AbortSignal) => Promise<boolean>,
  errorMessage: string,
  options: AsyncValidatorOptions = {}
) {
  const { debounceMs = 300, cacheTime = 5000 } = options

  const isValidating = ref(false)
  const lastValidValue = ref<T | null>(null)
  const lastValidResult = ref<boolean | null>(null)
  const lastValidTime = ref<number>(0)

  let controller: AbortController | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (controller) {
      controller.abort()
      controller = null
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  const asyncValidatorFn = async (rule: any, value: T): Promise<void> => {
    if (!value) {
      return Promise.resolve()
    }

    // 检查缓存
    if (
      lastValidValue.value === value &&
      lastValidResult.value !== null &&
      Date.now() - lastValidTime.value < cacheTime
    ) {
      return lastValidResult.value
        ? Promise.resolve()
        : Promise.reject(new Error(errorMessage))
    }

    // 取消之前的请求
    cancel()

    return new Promise((resolve, reject) => {
      debounceTimer = setTimeout(async () => {
        controller = new AbortController()
        isValidating.value = true

        try {
          const isValid = await validator(value, controller.signal)

          // 更新缓存
          lastValidValue.value = value
          lastValidResult.value = isValid
          lastValidTime.value = Date.now()

          isValid ? resolve() : reject(new Error(errorMessage))
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            reject(error)
          } else {
            resolve() // 取消的请求不报错
          }
        } finally {
          isValidating.value = false
          controller = null
        }
      }, debounceMs)
    })
  }

  onUnmounted(cancel)

  return {
    asyncValidator: asyncValidatorFn,
    isValidating,
    cancel,
    clearCache: () => {
      lastValidValue.value = null
      lastValidResult.value = null
      lastValidTime.value = 0
    }
  }
}

// 使用示例
const { asyncValidator, isValidating } = useAsyncValidator(
  async (userName: string, signal) => {
    const res = await fetch(`/api/check?name=${userName}`, { signal })
    const data = await res.json()
    return !data.exists
  },
  '用户名已存在',
  { debounceMs: 500, cacheTime: 10000 }
)

const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { asyncValidator, trigger: 'blur' }
  ]
}
```
