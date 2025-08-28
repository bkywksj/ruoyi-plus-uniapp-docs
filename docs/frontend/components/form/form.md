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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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

<script setup>
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
<script setup>
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
