# AFormInput 输入框组件

AFormInput 是一个功能强大的输入框组件，基于 Element Plus 的 ElInput 封装，提供了统一的表单集成、国际化支持和丰富的配置选项。

## 基础用法

### 基本输入框

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormInput 
    v-model="queryParams.keyword" 
    label="关键词" 
    prop="keyword" 
    @input="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormInput 
    v-model="form.userName" 
    label="用户名" 
    prop="userName" 
    :span="12" 
  />
</template>
```

### 不同输入类型

```vue
<template>
  <!-- 文本输入框 -->
  <AFormInput v-model="form.name" label="姓名" type="text" />
  
  <!-- 密码输入框 -->
  <AFormInput v-model="form.password" label="密码" type="password" />
  
  <!-- 数字输入框 -->
  <AFormInput v-model="form.age" label="年龄" type="number" />
  
  <!-- 文本域 -->
  <AFormInput v-model="form.description" label="描述" type="textarea" :rows="3" />
</template>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | `''` | 绑定值 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名（用于验证） |
| `type` | `string` | `'text'` | 输入框类型 |
| `span` | `number` | - | 栅格占比（1-24） |
| `showFormItem` | `boolean` | `true` | 是否显示表单项包装 |

### 输入框属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | - | 占位符（自动生成） |
| `clearable` | `boolean` | `true` | 是否显示清除按钮 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `maxlength` | `number` | - | 最大输入长度 |
| `size` | `ElSize` | `''` | 输入框尺寸 |

### 文本域属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rows` | `number` | `2` | 文本域行数 |
| `autosize` | `boolean \| object` | `false` | 自适应内容高度 |

### 密码输入框属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showPassword` | `boolean` | `false` | 是否显示密码切换按钮 |

### 样式属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `labelWidth` | `string \| number` | - | 标签宽度 |
| `tooltip` | `string` | `''` | 提示信息 |

## 使用示例

### 带提示信息的输入框

```vue
<template>
  <AFormInput 
    v-model="form.userName" 
    label="用户名" 
    prop="userName" 
    tooltip="用户名长度为4-20位，支持字母、数字和下划线" 
    :maxlength="20"
    :span="12" 
  />
</template>
```

### 带前后缀的输入框

```vue
<template>
  <!-- 带前缀图标 -->
  <AFormInput v-model="form.userName" label="用户名" prop="userName">
    <template #prepend>
      <Icon code="user" />
    </template>
  </AFormInput>
  
  <!-- 带后缀按钮 -->
  <AFormInput v-model="form.website" label="网站" prop="website">
    <template #append>
      <el-button>访问</el-button>
    </template>
  </AFormInput>
</template>
```

### 数字输入框

```vue
<template>
  <AFormInput 
    v-model="form.price" 
    label="价格" 
    prop="price" 
    type="number"
    :min="0"
    :max="999999"
    :precision="2"
  >
    <template #prepend>￥</template>
    <template #append>.00</template>
  </AFormInput>
</template>
```

### 文本域

```vue
<template>
  <AFormInput 
    v-model="form.description" 
    label="描述" 
    prop="description" 
    type="textarea" 
    :rows="4"
    :maxlength="500"
    show-word-limit
    :span="24"
  />
</template>
```

### 自适应文本域

```vue
<template>
  <AFormInput 
    v-model="form.content" 
    label="内容" 
    prop="content" 
    type="textarea" 
    :autosize="{ minRows: 2, maxRows: 6 }"
  />
</template>
```

### 密码输入框

```vue
<template>
  <AFormInput 
    v-model="form.password" 
    label="密码" 
    prop="password" 
    type="password" 
    show-password
    :span="12"
  />
</template>
```

### 只读和禁用状态

```vue
<template>
  <!-- 只读 -->
  <AFormInput 
    v-model="form.id" 
    label="ID" 
    prop="id" 
    readonly 
  />
  
  <!-- 禁用 -->
  <AFormInput 
    v-model="form.createdBy" 
    label="创建人" 
    prop="createdBy" 
    disabled 
  />
</template>
```

### 不含表单项的纯输入框

```vue
<template>
  <AFormInput 
    v-model="searchKeyword" 
    placeholder="搜索..." 
    :show-form-item="false" 
    clearable
  >
    <template #prepend>
      <Icon code="search" />
    </template>
  </AFormInput>
</template>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormInput 
    v-model="form.name"
    label="姓名"
    @blur="handleBlur"
    @focus="handleFocus"
    @change="handleChange"
    @input="handleInput"
    @clear="handleClear"
  />
</template>

<script setup>
const handleBlur = (event) => {
  console.log('失去焦点', event.target.value)
}

const handleFocus = (event) => {
  console.log('获得焦点')
}

const handleChange = (value) => {
  console.log('值改变', value)
}

const handleInput = (value) => {
  console.log('输入中', value)
  // 可用于实时搜索
}

const handleClear = () => {
  console.log('清空内容')
}
</script>
```

### 搜索场景

```vue
<template>
  <AFormInput 
    v-model="queryParams.keyword" 
    label="搜索关键词" 
    prop="keyword"
    @input="handleSearch"
    @keyup.enter="handleEnterSearch"
    clearable
  >
    <template #append>
      <el-button @click="handleSearch" :icon="Search" />
    </template>
  </AFormInput>
</template>

<script setup>
import { debounce } from 'lodash-es'

// 防抖搜索
const handleSearch = debounce(() => {
  // 执行搜索逻辑
  console.log('搜索:', queryParams.keyword)
}, 300)

const handleEnterSearch = () => {
  // 立即搜索
  handleSearch.flush()
}
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormInput 
      v-model="form.userName" 
      label="用户名" 
      prop="userName" 
      :span="12" 
    />
    
    <AFormInput 
      v-model="form.email" 
      label="邮箱" 
      prop="email" 
      type="email"
      :span="12" 
    />
  </el-form>
</template>

<script setup>
const form = reactive({
  userName: '',
  email: ''
})

const rules = {
  userName: [
    { required: true, message: '请输入用户名' },
    { min: 4, max: 20, message: '用户名长度为4-20位' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ]
}
</script>
```

### 自定义验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormInput 
      v-model="form.phone" 
      label="手机号" 
      prop="phone" 
      maxlength="11" 
    />
  </el-form>
</template>

<script setup>
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号格式'))
  } else {
    callback()
  }
}

const rules = {
  phone: [{ validator: validatePhone, trigger: 'blur' }]
}
</script>
```

## 高级用法

### 格式化输入

```vue
<template>
  <AFormInput 
    v-model="form.amount" 
    label="金额" 
    prop="amount"
    @input="formatAmount"
  />
</template>

<script setup>
const formatAmount = (value) => {
  // 只允许输入数字和小数点
  const formatted = value.replace(/[^\d.]/g, '')
  form.amount = formatted
}
</script>
```

### 实时搜索

```vue
<template>
  <AFormInput 
    v-model="searchKeyword" 
    placeholder="搜索用户..." 
    @input="handleSearch"
    :show-form-item="false"
    clearable
  />
  
  <ul v-if="searchResults.length">
    <li v-for="user in searchResults" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>

<script setup>
import { debounce } from 'lodash-es'

const searchKeyword = ref('')
const searchResults = ref([])

const handleSearch = debounce(async (keyword) => {
  if (!keyword.trim()) {
    searchResults.value = []
    return
  }
  
  // 调用搜索 API
  const results = await searchUsers(keyword)
  searchResults.value = results
}, 300)

watch(searchKeyword, handleSearch)
</script>
```

### 动态禁用

```vue
<template>
  <AFormInput 
    v-model="form.adminCode" 
    label="管理员代码" 
    prop="adminCode"
    :disabled="!isAdmin"
    :placeholder="isAdmin ? '请输入管理员代码' : '仅管理员可编辑'"
  />
</template>

<script setup>
const isAdmin = computed(() => {
  return user.value?.role === 'admin'
})
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormInput 
    v-model="form.name" 
    label="姓名" 
    class="custom-input"
    :span="12" 
  />
</template>

<style scoped>
.custom-input :deep(.el-input__inner) {
  border-radius: 20px;
  border-color: #409eff;
}

.custom-input :deep(.el-input__inner:focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
```

### 响应式布局

```vue
<template>
  <AFormInput 
    v-model="form.name" 
    label="姓名" 
    :span="isMobile ? 24 : 12" 
  />
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()
</script>
```

## 国际化

组件自动支持国际化，会根据 `prop` 和 `label` 属性进行翻译：

```vue
<template>
  <!-- 标签会自动翻译为对应语言 -->
  <AFormInput v-model="form.userName" label="用户名" prop="userName" />
  <!-- 占位符也会自动生成并翻译 -->
</template>
```

## 最佳实践

### 1. 合理使用占位符

```vue
<template>
  <!-- 不好的做法 - 占位符重复了标签信息 -->
  <AFormInput 
    v-model="form.name" 
    label="姓名" 
    placeholder="请输入姓名" 
  />
  
  <!-- 好的做法 - 占位符提供额外信息 -->
  <AFormInput 
    v-model="form.name" 
    label="姓名" 
    placeholder="如：张三" 
  />
</template>
```

### 2. 适当的输入限制

```vue
<template>
  <!-- 为用户体验考虑，设置合理的长度限制 -->
  <AFormInput 
    v-model="form.title" 
    label="标题" 
    :maxlength="50"
    show-word-limit
  />
</template>
```

### 3. 提供清晰的反馈

```vue
<template>
  <AFormInput 
    v-model="form.password" 
    label="密码" 
    type="password"
    tooltip="密码至少8位，包含大小写字母和数字"
    show-password
  />
</template>
```

### 4. 合理的表单布局

```vue
<template>
  <el-row :gutter="20">
    <!-- 短字段使用较小的span -->
    <AFormInput v-model="form.age" label="年龄" :span="8" />
    <AFormInput v-model="form.gender" label="性别" :span="8" />
    <AFormInput v-model="form.status" label="状态" :span="8" />
    
    <!-- 长字段使用较大的span -->
    <AFormInput v-model="form.address" label="地址" :span="24" />
  </el-row>
</template>
```

## 注意事项

1. **性能优化**：对于搜索等高频操作，记得使用防抖
2. **表单验证**：确保设置了正确的 `prop` 属性以便验证生效
3. **无障碍访问**：重要的输入框要有清晰的标签和提示
4. **移动端适配**：在小屏幕设备上合理调整 `span` 值
5. **数据类型**：`number` 类型的输入框返回的值是字符串，需要手动转换
