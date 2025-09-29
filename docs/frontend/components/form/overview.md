# 表单组件概览

本章节介绍了完整的表单组件库，这些组件基于 Element Plus 构建，提供了统一的 API 设计和丰富的功能特性。

## 组件列表

### 基础表单组件

- **AForm** - 表单容器，提供统一的表单布局和验证
- **AFormInput** - 输入框组件，支持多种输入类型
- **AFormSelect** - 选择器组件，支持单选和多选
- **AFormRadio** - 单选框组件，支持按钮和标准样式
- **AFormCheckbox** - 复选框组件，支持多种配置
- **AFormSwitch** - 开关组件，适用于布尔值切换
- **AFormDate** - 日期选择组件，支持日期和时间选择

### 高级表单组件

- **AFormCascader** - 级联选择组件，支持地区和自定义数据
- **AFormTreeSelect** - 树形选择组件，适用于层级数据
- **AFormEditor** - 富文本编辑器，支持图片上传和格式化
- **AFormFileUpload** - 文件上传组件，支持多种文件类型
- **AFormImgUpload** - 图片上传组件，专门用于图片处理
- **IconSelect** - 图标选择器，提供可视化图标选择

## 设计原则

### 1. 统一的 API 设计

所有表单组件都遵循相同的属性命名规范：

```vue
<template>
  <!-- 基础属性 -->
  <AFormInput 
    v-model="form.field"
    label="字段名"
    prop="field"
    :span="12"
    tooltip="提示信息"
  />
</template>
```

**通用属性：**
- `modelValue` / `v-model` - 双向绑定值
- `label` - 表单标签
- `prop` - 表单字段名（用于验证）
- `span` - 栅格占比（1-24）
- `tooltip` - 提示信息
- `disabled` - 是否禁用
- `size` - 组件尺寸
- `showFormItem` - 是否显示表单项包装

### 2. 灵活的布局系统

支持三种使用方式：

```vue
<template>
  <!-- 1. 带栅格布局的表单项 -->
  <AFormInput v-model="form.name" label="姓名" prop="name" :span="12" />
  
  <!-- 2. 不带栅格的表单项 -->
  <AFormInput v-model="form.name" label="姓名" prop="name" />
  
  <!-- 3. 纯组件（不包装表单项） -->
  <AFormInput v-model="form.name" :show-form-item="false" />
</template>
```

### 3. 国际化支持

所有组件都支持国际化，会自动翻译标签和占位符：

```vue
<template>
  <!-- 标签和占位符会自动翻译 -->
  <AFormInput v-model="form.userName" label="用户名" prop="userName" />
</template>
```

### 4. 丰富的事件系统

每个组件都提供完整的事件支持：

```vue
<template>
  <AFormInput 
    v-model="form.name"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>
```

## 快速开始

### 基础表单示例

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
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
  </el-form>
</template>

<script setup>
const form = reactive({
  userName: '',
  status: '',
  createTime: '',
  enabled: true
})

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

const rules = {
  userName: [{ required: true, message: '请输入用户名' }],
  status: [{ required: true, message: '请选择状态' }]
}
</script>
```

### 搜索表单示例

```vue
<template>
  <ASearchForm v-model="queryParams" @search="handleSearch" @reset="handleReset">
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
```

## 主要特性

### 1. 智能提示和工具提示

所有组件都支持 `tooltip` 属性，提供额外的帮助信息：

```vue
<template>
  <AFormInput 
    v-model="form.password" 
    type="password" 
    label="密码" 
    tooltip="密码长度至少8位，包含字母和数字" 
  />
</template>
```

### 2. 自定义字段映射

支持灵活的数据结构映射：

```vue
<template>
  <AFormSelect 
    v-model="form.userId" 
    :options="userList" 
    value-field="id" 
    label-field="name" 
    label="用户" 
  />
</template>
```

### 3. 条件禁用

支持复杂的禁用条件：

```vue
<template>
  <AFormSelect 
    v-model="form.roleId" 
    :options="roleList" 
    disabled-field="status" 
    :disabled-value="['0', '3']" 
    label="角色" 
  />
</template>
```

### 4. 插槽支持

大部分组件都支持插槽扩展：

```vue
<template>
  <AFormInput v-model="form.amount" label="金额">
    <template #prepend>￥</template>
    <template #append>.00</template>
  </AFormInput>
</template>
```

## 样式定制

### 1. 全局样式配置

通过 CSS 变量可以全局定制组件样式：

```css
:root {
  --el-color-primary: #409eff;
  --el-border-radius-base: 4px;
  --el-font-size-base: 14px;
}
```

### 2. 组件级样式

每个组件都支持自定义类名和样式：

```vue
<template>
  <AFormInput 
    v-model="form.name" 
    class="custom-input" 
    style="--el-input-border-color: red;" 
  />
</template>
```

## 最佳实践

### 1. 表单验证

结合 Element Plus 的表单验证：

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormInput 
      v-model="form.email" 
      label="邮箱" 
      prop="email" 
      type="email" 
    />
  </el-form>
</template>

<script setup>
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ]
}
</script>
```

### 2. 响应式布局

根据屏幕尺寸调整布局：

```vue
<template>
  <el-row :gutter="20">
    <AFormInput 
      v-model="form.name" 
      label="姓名" 
      :span="isTablet ? 12 : 24" 
    />
  </el-row>
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isTablet } = useBreakpoint()
</script>
```

### 3. 动态表单

根据条件动态显示表单项：

```vue
<template>
  <AFormSelect 
    v-model="form.type" 
    :options="typeOptions" 
    label="类型" 
    @change="handleTypeChange" 
  />
  
  <AFormInput 
    v-if="form.type === 'custom'" 
    v-model="form.customValue" 
    label="自定义值" 
  />
</template>
```

## 组件依赖

所有表单组件都依赖以下库：

- **Vue 3.x** - 核心框架
- **Element Plus** - UI 组件库
- **@vueuse/core** - 工具函数库

部分组件有额外依赖：

- **AFormEditor** - 依赖 `@wangeditor/editor @wangeditor/editor-for-vue` 富文本编辑器
- **AFormCascader** - 可选依赖 `element-china-area-data` 地区数据
- **AFormFileUpload** / **AFormImgUpload** - 需要配置 OSS 上传服务
