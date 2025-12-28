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

## 常见问题

### 1. 输入框值不更新或双向绑定失效

**问题描述:**

输入框的值在输入后没有响应式更新，或者程序修改数据后输入框显示的内容没有变化，双向绑定看似失效。

**问题原因:**

- `v-model` 绑定的变量不是响应式的
- 直接修改对象的属性而非使用响应式 API
- 在计算属性中错误地使用 `v-model`
- 绑定值的类型与输入框期望类型不匹配
- 使用了非响应式的外部变量

**解决方案:**

```typescript
// ❌ 错误：非响应式变量
let userName = ''

// ✅ 正确：使用 ref 或 reactive
const userName = ref('')

const form = reactive({
  userName: '',
  email: ''
})
```

```vue
<!-- ❌ 错误：直接修改嵌套对象 -->
<script setup>
const data = ref({ user: { name: '' } })

// 这种方式可能导致响应性丢失
const updateName = () => {
  data.value.user = { name: '新名称' }
}
</script>

<!-- ✅ 正确：保持响应式引用 -->
<script setup>
const data = reactive({
  user: {
    name: ''
  }
})

// 直接修改属性
const updateName = () => {
  data.user.name = '新名称'
}
</script>
```

**计算属性的双向绑定:**

```vue
<template>
  <!-- ❌ 错误：只读计算属性 -->
  <AFormInput v-model="fullName" label="全名" />

  <!-- ✅ 正确：可写计算属性 -->
  <AFormInput v-model="fullNameWritable" label="全名" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const firstName = ref('')
const lastName = ref('')

// ❌ 只读，不能作为 v-model 绑定
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ 可写计算属性，支持双向绑定
const fullNameWritable = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value: string) => {
    const parts = value.split(' ')
    firstName.value = parts[0] || ''
    lastName.value = parts.slice(1).join(' ')
  }
})
</script>
```

**类型不匹配问题:**

```vue
<template>
  <!-- ⚠️ 注意：number 类型输入框返回字符串 -->
  <AFormInput
    v-model="form.price"
    type="number"
    label="价格"
    @change="handlePriceChange"
  />
</template>

<script setup lang="ts">
interface Form {
  price: number
}

const form = reactive<Form>({
  price: 0
})

// 处理类型转换
const handlePriceChange = (value: string) => {
  const num = parseFloat(value)
  if (!isNaN(num)) {
    form.price = num
  }
}

// 或者使用自定义转换逻辑
const priceModel = computed({
  get: () => form.price.toString(),
  set: (value: string) => {
    form.price = parseFloat(value) || 0
  }
})
</script>
```

**调试响应性问题:**

```typescript
import { isRef, isReactive, toRaw } from 'vue'

// 检查变量的响应性状态
const debugReactivity = (value: unknown, name: string) => {
  console.group(`[Reactivity Debug] ${name}`)
  console.log('Is Ref:', isRef(value))
  console.log('Is Reactive:', isReactive(value))
  console.log('Raw Value:', toRaw(value))
  console.groupEnd()
}

// 使用
debugReactivity(form, 'form')
debugReactivity(form.userName, 'form.userName')
```

### 2. 表单验证不触发或验证结果不正确

**问题描述:**

输入框填写内容后验证没有执行，或者验证规则配置了但提示信息不显示，表单提交时验证结果不正确。

**问题原因:**

- `prop` 属性未设置或与验证规则的 key 不匹配
- 验证触发时机设置不正确
- 异步验证规则未正确处理
- 表单引用未正确获取
- 动态表单字段验证规则未更新

**解决方案:**

```vue
<template>
  <el-form ref="formRef" :model="form" :rules="rules">
    <!-- ✅ prop 必须与 rules 中的 key 一致 -->
    <AFormInput
      v-model="form.userName"
      label="用户名"
      prop="userName"
    />

    <!-- ❌ 错误：prop 不匹配 -->
    <AFormInput
      v-model="form.email"
      label="邮箱"
      prop="userEmail"  <!-- 应该是 email -->
    />
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: '',
  email: ''
})

// 规则的 key 必须与 prop 一致
const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [  // 必须是 email 而非 userEmail
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}
</script>
```

**验证触发时机:**

```typescript
const rules: FormRules = {
  // blur: 失去焦点时验证（适合大多数场景）
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],

  // change: 值改变时验证（适合选择器）
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],

  // 组合触发
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少8位', trigger: ['blur', 'change'] }
  ]
}
```

**异步验证:**

```typescript
// 异步验证用户名是否已存在
const validateUserName = async (
  rule: unknown,
  value: string,
  callback: (error?: Error) => void
) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }

  try {
    const exists = await checkUserNameExists(value)
    if (exists) {
      callback(new Error('用户名已被使用'))
    } else {
      callback()
    }
  } catch (error) {
    callback(new Error('验证失败，请稍后重试'))
  }
}

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUserName, trigger: 'blur' }
  ]
}
```

**动态表单验证:**

```vue
<template>
  <el-form ref="formRef" :model="form" :rules="dynamicRules">
    <AFormInput
      v-model="form.idCard"
      label="身份证号"
      prop="idCard"
      :maxlength="18"
    />

    <el-checkbox v-model="isRequired">设为必填</el-checkbox>
  </el-form>
</template>

<script setup lang="ts">
const isRequired = ref(true)

// 动态生成规则
const dynamicRules = computed<FormRules>(() => ({
  idCard: isRequired.value
    ? [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        { pattern: /^\d{17}[\dXx]$/, message: '身份证格式不正确', trigger: 'blur' }
      ]
    : []
}))

// 规则变化后需要重新验证
watch(isRequired, async () => {
  await nextTick()
  formRef.value?.clearValidate('idCard')
})
</script>
```

**手动触发验证:**

```typescript
// 验证整个表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (valid) {
      // 验证通过，提交表单
      await submitData()
    }
  } catch (error) {
    console.log('验证失败:', error)
    ElMessage.warning('请检查表单填写是否正确')
  }
}

// 验证单个字段
const validateField = async (field: string) => {
  try {
    await formRef.value?.validateField(field)
    return true
  } catch {
    return false
  }
}

// 清除验证状态
const clearValidation = (fields?: string | string[]) => {
  formRef.value?.clearValidate(fields)
}

// 重置表单（包括验证状态）
const resetForm = () => {
  formRef.value?.resetFields()
}
```

### 3. 输入内容格式化后光标位置跳动

**问题描述:**

在输入过程中对内容进行格式化处理（如金额、手机号等），格式化后光标跳到末尾或错误位置，用户体验差。

**问题原因:**

- 格式化操作直接修改了输入值，Vue 更新 DOM 后光标位置丢失
- 未保存和恢复光标位置
- 格式化逻辑影响了字符长度但未相应调整光标

**解决方案:**

```vue
<template>
  <AFormInput
    ref="inputRef"
    v-model="displayValue"
    label="金额"
    prop="amount"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const inputRef = ref()
const rawValue = ref('')
const displayValue = ref('')

// 格式化金额（添加千分位）
const formatAmount = (value: string): string => {
  const num = value.replace(/[^\d.]/g, '')
  const parts = num.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// 去除格式化
const parseAmount = (value: string): string => {
  return value.replace(/,/g, '')
}

const handleInput = async (value: string) => {
  // 获取当前光标位置
  const inputEl = inputRef.value?.$el?.querySelector('input') as HTMLInputElement
  const cursorPosition = inputEl?.selectionStart ?? 0

  // 计算格式化前光标前的逗号数量
  const beforeFormat = value.substring(0, cursorPosition)
  const commasBefore = (beforeFormat.match(/,/g) || []).length

  // 解析并格式化
  const parsed = parseAmount(value)
  const formatted = formatAmount(parsed)

  // 计算格式化后光标应该在的位置
  const commasAfter = (formatted.substring(0, cursorPosition + 1).match(/,/g) || []).length
  const newPosition = cursorPosition + (commasAfter - commasBefore)

  // 更新值
  rawValue.value = parsed
  displayValue.value = formatted

  // 恢复光标位置
  await nextTick()
  if (inputEl) {
    inputEl.setSelectionRange(newPosition, newPosition)
  }
}
</script>
```

**通用的光标位置保持工具:**

```typescript
// composables/useCursorPosition.ts
export function useCursorPosition(inputRef: Ref<HTMLInputElement | null>) {
  const savedPosition = ref<number>(0)

  // 保存当前光标位置
  const saveCursorPosition = () => {
    const input = inputRef.value
    if (input) {
      savedPosition.value = input.selectionStart ?? 0
    }
  }

  // 恢复光标位置
  const restoreCursorPosition = async (offset = 0) => {
    await nextTick()
    const input = inputRef.value
    if (input) {
      const position = Math.min(
        savedPosition.value + offset,
        input.value.length
      )
      input.setSelectionRange(position, position)
    }
  }

  // 设置光标到指定位置
  const setCursorPosition = async (position: number) => {
    await nextTick()
    const input = inputRef.value
    if (input) {
      const safePosition = Math.min(position, input.value.length)
      input.setSelectionRange(safePosition, safePosition)
    }
  }

  return {
    savedPosition: readonly(savedPosition),
    saveCursorPosition,
    restoreCursorPosition,
    setCursorPosition
  }
}
```

**手机号格式化示例:**

```vue
<template>
  <AFormInput
    ref="phoneInputRef"
    v-model="phoneDisplay"
    label="手机号"
    prop="phone"
    :maxlength="13"
    @input="handlePhoneInput"
    @keydown="handleKeydown"
  />
</template>

<script setup lang="ts">
const phoneInputRef = ref()
const phoneRaw = ref('')
const phoneDisplay = ref('')

// 格式化手机号：138 1234 5678
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  const part1 = digits.substring(0, 3)
  const part2 = digits.substring(3, 7)
  const part3 = digits.substring(7, 11)

  let result = part1
  if (part2) result += ' ' + part2
  if (part3) result += ' ' + part3

  return result
}

const handlePhoneInput = async (value: string) => {
  const inputEl = phoneInputRef.value?.$el?.querySelector('input')
  const cursor = inputEl?.selectionStart ?? 0

  // 计算光标前的空格数
  const spacesBefore = (value.substring(0, cursor).match(/ /g) || []).length

  // 格式化
  const digits = value.replace(/\D/g, '').substring(0, 11)
  phoneRaw.value = digits
  phoneDisplay.value = formatPhone(digits)

  // 计算新光标位置
  const spacesAfter = (phoneDisplay.value.substring(0, cursor + 1).match(/ /g) || []).length
  const newCursor = cursor + (spacesAfter - spacesBefore)

  await nextTick()
  if (inputEl) {
    inputEl.setSelectionRange(newCursor, newCursor)
  }
}

// 处理退格键删除空格
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    const inputEl = e.target as HTMLInputElement
    const cursor = inputEl.selectionStart ?? 0

    // 如果光标前是空格，额外删除一个字符
    if (phoneDisplay.value[cursor - 1] === ' ') {
      e.preventDefault()
      const newValue = phoneDisplay.value.substring(0, cursor - 2) +
                       phoneDisplay.value.substring(cursor)
      handlePhoneInput(newValue)
    }
  }
}
</script>
```

### 4. 输入框与其他组件联动数据不同步

**问题描述:**

输入框的值变化后，与之联动的其他组件（如下拉选择、日期选择器等）没有及时更新，或者其他组件变化后输入框的状态没有同步。

**问题原因:**

- watch 依赖未正确配置
- 事件处理顺序问题
- 异步更新导致的竞态条件
- 响应式数据结构设计不合理

**解决方案:**

```vue
<template>
  <el-form :model="form">
    <!-- 省份选择 -->
    <AFormSelect
      v-model="form.province"
      label="省份"
      prop="province"
      :options="provinceOptions"
      @change="handleProvinceChange"
    />

    <!-- 城市选择（依赖省份） -->
    <AFormSelect
      v-model="form.city"
      label="城市"
      prop="city"
      :options="cityOptions"
      :disabled="!form.province"
      @change="handleCityChange"
    />

    <!-- 详细地址（依赖省市） -->
    <AFormInput
      v-model="form.address"
      label="详细地址"
      prop="address"
      :placeholder="addressPlaceholder"
      :disabled="!form.city"
    />
  </el-form>
</template>

<script setup lang="ts">
interface Form {
  province: string
  city: string
  address: string
}

const form = reactive<Form>({
  province: '',
  city: '',
  address: ''
})

const provinceOptions = ref<SelectOption[]>([])
const cityOptions = ref<SelectOption[]>([])

// 根据当前选择生成占位符
const addressPlaceholder = computed(() => {
  if (!form.province) return '请先选择省份'
  if (!form.city) return '请先选择城市'
  return '请输入详细地址'
})

// 省份变化时清空后续字段
const handleProvinceChange = async (provinceId: string) => {
  // 清空依赖字段
  form.city = ''
  form.address = ''

  // 加载城市列表
  if (provinceId) {
    cityOptions.value = await loadCities(provinceId)
  } else {
    cityOptions.value = []
  }
}

// 城市变化时清空详细地址
const handleCityChange = (cityId: string) => {
  form.address = ''
}
</script>
```

**使用 watchEffect 自动追踪依赖:**

```vue
<script setup lang="ts">
// 自动追踪所有依赖
watchEffect(() => {
  // 当 form.userName 变化时自动更新相关状态
  if (form.userName) {
    suggestion.value = generateSuggestion(form.userName)
    isAvailable.value = checkAvailability(form.userName)
  }
})

// 带防抖的依赖追踪
const debouncedCheck = useDebounceFn(async () => {
  if (form.email) {
    const result = await validateEmailFormat(form.email)
    emailValid.value = result.valid
    emailMessage.value = result.message
  }
}, 300)

watch(() => form.email, debouncedCheck)
</script>
```

**处理异步联动:**

```typescript
// composables/useAsyncSync.ts
export function useAsyncSync<T>(
  source: Ref<T>,
  asyncHandler: (value: T) => Promise<void>,
  options: { debounce?: number; immediate?: boolean } = {}
) {
  const { debounce = 0, immediate = false } = options

  const loading = ref(false)
  const error = ref<Error | null>(null)
  let abortController: AbortController | null = null

  const execute = async (value: T) => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    loading.value = true
    error.value = null

    try {
      await asyncHandler(value)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        error.value = e
      }
    } finally {
      loading.value = false
    }
  }

  const debouncedExecute = debounce > 0
    ? useDebounceFn(execute, debounce)
    : execute

  watch(source, debouncedExecute, { immediate })

  return { loading: readonly(loading), error: readonly(error) }
}

// 使用示例
const { loading: syncing } = useAsyncSync(
  () => form.keyword,
  async (keyword) => {
    suggestions.value = await fetchSuggestions(keyword)
  },
  { debounce: 300, immediate: false }
)
```

**表单状态同步管理器:**

```typescript
// composables/useFormSync.ts
export function useFormSync<T extends Record<string, unknown>>(
  form: T,
  syncRules: Record<string, (form: T) => void>
) {
  // 为每个字段设置 watch
  Object.entries(syncRules).forEach(([field, handler]) => {
    watch(
      () => form[field],
      () => {
        handler(form)
      },
      { immediate: false }
    )
  })
}

// 使用示例
useFormSync(form, {
  // 当 type 变化时，清空相关字段
  type: (form) => {
    form.subType = ''
    form.details = ''
  },
  // 当 startDate 变化时，验证结束日期
  startDate: (form) => {
    if (form.endDate && form.startDate > form.endDate) {
      form.endDate = form.startDate
    }
  }
})
```

### 5. 密码输入框安全性问题

**问题描述:**

密码输入框存在安全隐患，如密码明文显示、浏览器自动填充泄露密码、控制台可以获取密码值等。

**问题原因:**

- 未使用 `type="password"`
- 浏览器自动填充策略
- 调试时密码暴露
- 密码强度验证不足
- 密码传输安全问题

**解决方案:**

```vue
<template>
  <el-form :model="form" :rules="passwordRules">
    <!-- 密码输入框 -->
    <AFormInput
      v-model="form.password"
      label="密码"
      prop="password"
      type="password"
      show-password
      autocomplete="new-password"
      :maxlength="20"
    />

    <!-- 确认密码 -->
    <AFormInput
      v-model="form.confirmPassword"
      label="确认密码"
      prop="confirmPassword"
      type="password"
      show-password
      autocomplete="new-password"
      :maxlength="20"
    />

    <!-- 密码强度指示器 -->
    <div class="password-strength">
      <div
        v-for="level in 4"
        :key="level"
        :class="['strength-bar', { active: passwordStrength >= level }]"
      />
      <span class="strength-text">{{ strengthText }}</span>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const form = reactive({
  password: '',
  confirmPassword: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0

  let strength = 0

  // 长度检查
  if (pwd.length >= 8) strength++

  // 包含小写字母
  if (/[a-z]/.test(pwd)) strength++

  // 包含大写字母
  if (/[A-Z]/.test(pwd)) strength++

  // 包含数字
  if (/\d/.test(pwd)) strength++

  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++

  return Math.min(strength, 4)
})

const strengthText = computed(() => {
  const texts = ['', '弱', '较弱', '中等', '强']
  return texts[passwordStrength.value]
})

// 密码验证规则
const validatePassword = (
  rule: unknown,
  value: string,
  callback: (error?: Error) => void
) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }

  if (value.length < 8) {
    callback(new Error('密码长度至少8位'))
    return
  }

  if (!/[a-z]/.test(value)) {
    callback(new Error('密码需包含小写字母'))
    return
  }

  if (!/[A-Z]/.test(value)) {
    callback(new Error('密码需包含大写字母'))
    return
  }

  if (!/\d/.test(value)) {
    callback(new Error('密码需包含数字'))
    return
  }

  callback()
}

const validateConfirmPassword = (
  rule: unknown,
  value: string,
  callback: (error?: Error) => void
) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }

  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }

  callback()
}

const passwordRules = {
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}
</script>

<style scoped>
.password-strength {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.strength-bar {
  width: 40px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  transition: background-color 0.3s;
}

.strength-bar.active:nth-child(1) { background: #f56c6c; }
.strength-bar.active:nth-child(2) { background: #e6a23c; }
.strength-bar.active:nth-child(3) { background: #409eff; }
.strength-bar.active:nth-child(4) { background: #67c23a; }

.strength-text {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
```

**防止密码泄露:**

```typescript
// 生产环境禁止控制台输出密码
const secureLog = (data: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    const sanitized = { ...data }
    const sensitiveKeys = ['password', 'confirmPassword', 'oldPassword', 'newPassword']

    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '******'
      }
    })

    console.log(sanitized)
  } else {
    console.log(data)
  }
}

// 提交前加密密码
const submitForm = async () => {
  const submitData = {
    ...form,
    password: await encryptPassword(form.password)
  }

  // 清除确认密码字段
  delete submitData.confirmPassword

  await api.register(submitData)
}

// 使用 Web Crypto API 加密
const encryptPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
```

**禁止浏览器自动填充:**

```vue
<template>
  <!-- 方法1：使用 autocomplete="off" -->
  <AFormInput
    v-model="form.password"
    type="password"
    autocomplete="off"
  />

  <!-- 方法2：使用随机 name 属性 -->
  <AFormInput
    v-model="form.password"
    type="password"
    :name="`password_${randomId}`"
    autocomplete="new-password"
  />

  <!-- 方法3：添加隐藏字段欺骗浏览器 -->
  <input type="text" style="display: none" />
  <input type="password" style="display: none" />
  <AFormInput v-model="form.password" type="password" />
</template>

<script setup>
const randomId = Math.random().toString(36).substring(7)
</script>
```

### 6. 文本域自适应高度计算不准确

**问题描述:**

设置了 `autosize` 的文本域高度不正确，初始高度过高或过低，内容变化后高度未自动调整，或者出现滚动条闪烁。

**问题原因:**

- CSS 样式影响了高度计算
- 字体加载时机问题
- 初始值为空时高度计算异常
- 容器宽度变化未触发重新计算
- `line-height` 设置不当

**解决方案:**

```vue
<template>
  <AFormInput
    ref="textareaRef"
    v-model="form.content"
    label="内容"
    prop="content"
    type="textarea"
    :autosize="{ minRows: 2, maxRows: 10 }"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const textareaRef = ref()
const form = reactive({
  content: ''
})

// 手动触发高度重新计算
const resizeTextarea = () => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (textarea) {
    // 重置高度
    textarea.style.height = 'auto'
    // 设置为实际内容高度
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

// 内容变化时调整高度
const handleInput = () => {
  nextTick(resizeTextarea)
}

// 初始化时调整
onMounted(() => {
  // 等待字体加载完成
  document.fonts.ready.then(() => {
    resizeTextarea()
  })
})

// 监听窗口大小变化
const { width } = useWindowSize()
watch(width, () => {
  nextTick(resizeTextarea)
})
</script>

<style scoped>
:deep(.el-textarea__inner) {
  /* 确保 line-height 设置正确 */
  line-height: 1.5;
  /* 避免默认 padding 影响计算 */
  box-sizing: border-box;
}
</style>
```

**自定义自适应高度实现:**

```typescript
// composables/useAutoResize.ts
export function useAutoResize(
  textareaRef: Ref<HTMLTextAreaElement | null>,
  options: {
    minRows?: number
    maxRows?: number
    lineHeight?: number
  } = {}
) {
  const { minRows = 2, maxRows = Infinity, lineHeight = 24 } = options

  const minHeight = minRows * lineHeight
  const maxHeight = maxRows === Infinity ? Infinity : maxRows * lineHeight

  const resize = () => {
    const textarea = textareaRef.value
    if (!textarea) return

    // 获取样式信息
    const style = getComputedStyle(textarea)
    const paddingTop = parseFloat(style.paddingTop)
    const paddingBottom = parseFloat(style.paddingBottom)
    const borderTop = parseFloat(style.borderTopWidth)
    const borderBottom = parseFloat(style.borderBottomWidth)
    const extra = paddingTop + paddingBottom + borderTop + borderBottom

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto'

    // 计算目标高度
    const scrollHeight = textarea.scrollHeight
    const targetHeight = Math.max(
      minHeight + extra,
      Math.min(scrollHeight, maxHeight + extra)
    )

    textarea.style.height = `${targetHeight}px`

    // 如果超出最大高度，显示滚动条
    textarea.style.overflowY = scrollHeight > maxHeight + extra ? 'auto' : 'hidden'
  }

  // 防抖处理
  const debouncedResize = useDebounceFn(resize, 50)

  return { resize, debouncedResize }
}
```

**处理 CSS 样式冲突:**

```vue
<style scoped>
.custom-textarea :deep(.el-textarea__inner) {
  /* 重置可能影响计算的样式 */
  resize: none;
  overflow-y: hidden;
  transition: height 0.2s ease;

  /* 确保 padding 和 border 正确 */
  padding: 8px 12px;
  border: 1px solid #dcdfe6;

  /* 统一 line-height */
  line-height: 1.5;

  /* 使用系统字体避免加载延迟 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 聚焦时防止高度跳动 */
.custom-textarea :deep(.el-textarea__inner:focus) {
  outline: none;
  border-color: #409eff;
}
</style>
```

### 7. 输入框焦点控制异常

**问题描述:**

需要在特定时机自动聚焦输入框但不生效，或者焦点被意外抢走，弹窗中的输入框无法获得焦点等。

**问题原因:**

- DOM 还未渲染完成就尝试聚焦
- 其他元素抢夺焦点
- 弹窗动画导致焦点设置失败
- 使用了错误的元素引用
- 移动端虚拟键盘弹出影响

**解决方案:**

```vue
<template>
  <el-dialog v-model="visible" @opened="handleDialogOpened">
    <AFormInput
      ref="nameInputRef"
      v-model="form.name"
      label="姓名"
      prop="name"
    />
  </el-dialog>
</template>

<script setup lang="ts">
const nameInputRef = ref()
const visible = ref(false)

// 等待弹窗动画完成后聚焦
const handleDialogOpened = () => {
  focusInput()
}

// 聚焦输入框
const focusInput = async () => {
  await nextTick()

  // 获取实际的 input 元素
  const inputEl = nameInputRef.value?.$el?.querySelector('input')
  if (inputEl) {
    // 延迟一帧确保 DOM 完全就绪
    requestAnimationFrame(() => {
      inputEl.focus()
    })
  }
}

// 打开弹窗并聚焦
const openDialog = () => {
  visible.value = true
  // 注意：不要在这里调用 focusInput，应该在 @opened 中调用
}
</script>
```

**通用的焦点管理工具:**

```typescript
// composables/useFocus.ts
export function useFocus(targetRef: Ref<HTMLElement | ComponentPublicInstance | null>) {
  const isFocused = ref(false)

  // 聚焦元素
  const focus = async (options?: FocusOptions) => {
    await nextTick()

    const element = getElement(targetRef.value)
    if (element && 'focus' in element) {
      // 使用 requestAnimationFrame 确保在下一帧执行
      return new Promise<boolean>((resolve) => {
        requestAnimationFrame(() => {
          try {
            (element as HTMLElement).focus(options)
            resolve(true)
          } catch {
            resolve(false)
          }
        })
      })
    }
    return false
  }

  // 失焦
  const blur = async () => {
    await nextTick()

    const element = getElement(targetRef.value)
    if (element && 'blur' in element) {
      (element as HTMLElement).blur()
    }
  }

  // 获取实际的 HTML 元素
  const getElement = (target: unknown): HTMLElement | null => {
    if (!target) return null

    // 如果是组件实例，查找内部的 input 元素
    if ('$el' in (target as object)) {
      const componentEl = (target as ComponentPublicInstance).$el
      return componentEl?.querySelector?.('input, textarea') ?? componentEl
    }

    // 直接是 HTML 元素
    if (target instanceof HTMLElement) {
      return target
    }

    return null
  }

  // 监听焦点状态
  const onFocus = () => { isFocused.value = true }
  const onBlur = () => { isFocused.value = false }

  onMounted(() => {
    const element = getElement(targetRef.value)
    if (element) {
      element.addEventListener('focus', onFocus)
      element.addEventListener('blur', onBlur)
    }
  })

  onUnmounted(() => {
    const element = getElement(targetRef.value)
    if (element) {
      element.removeEventListener('focus', onFocus)
      element.removeEventListener('blur', onBlur)
    }
  })

  return {
    isFocused: readonly(isFocused),
    focus,
    blur
  }
}

// 使用示例
const inputRef = ref()
const { focus, isFocused } = useFocus(inputRef)

onMounted(() => {
  focus()
})
```

**处理焦点被抢夺的情况:**

```typescript
// 焦点锁定：防止焦点被其他元素抢走
export function useFocusLock(containerRef: Ref<HTMLElement | null>) {
  const previousActiveElement = ref<Element | null>(null)

  // 保存当前焦点并锁定到容器内
  const lock = () => {
    previousActiveElement.value = document.activeElement

    // 监听焦点变化
    document.addEventListener('focusin', handleFocusIn)
  }

  // 解锁焦点
  const unlock = () => {
    document.removeEventListener('focusin', handleFocusIn)

    // 恢复之前的焦点
    if (previousActiveElement.value instanceof HTMLElement) {
      previousActiveElement.value.focus()
    }
  }

  // 焦点进入事件处理
  const handleFocusIn = (event: FocusEvent) => {
    const container = containerRef.value
    if (!container) return

    const target = event.target as HTMLElement

    // 如果焦点移出容器，强制拉回
    if (!container.contains(target)) {
      event.preventDefault()

      // 找到容器内第一个可聚焦元素
      const focusable = container.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
  }

  return { lock, unlock }
}
```

### 8. 搜索输入框性能问题

**问题描述:**

搜索输入框每次输入都触发请求导致性能问题，搜索结果显示延迟，大量请求导致后端压力过大，旧请求的结果覆盖新请求。

**问题原因:**

- 未使用防抖或节流
- 未取消过期的请求
- 搜索结果缓存策略不当
- 请求并发控制不足

**解决方案:**

```vue
<template>
  <div class="search-container">
    <AFormInput
      v-model="keyword"
      placeholder="搜索..."
      clearable
      :show-form-item="false"
      @input="handleInput"
      @clear="handleClear"
    >
      <template #prefix>
        <el-icon :class="{ spinning: searching }">
          <component :is="searching ? 'Loading' : 'Search'" />
        </el-icon>
      </template>
    </AFormInput>

    <!-- 搜索结果 -->
    <div v-if="showResults" class="search-results">
      <div v-if="searching" class="loading">搜索中...</div>
      <template v-else-if="results.length">
        <div
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @click="handleSelect(item)"
        >
          <span v-html="highlightKeyword(item.name)" />
        </div>
      </template>
      <div v-else-if="keyword && !results.length" class="no-results">
        无搜索结果
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface SearchItem {
  id: string
  name: string
}

const keyword = ref('')
const results = ref<SearchItem[]>([])
const searching = ref(false)
const showResults = ref(false)

// 用于取消过期请求
let abortController: AbortController | null = null

// 搜索缓存
const searchCache = new Map<string, SearchItem[]>()

// 带防抖的搜索
const debouncedSearch = useDebounceFn(async (value: string) => {
  if (!value.trim()) {
    results.value = []
    searching.value = false
    return
  }

  // 检查缓存
  if (searchCache.has(value)) {
    results.value = searchCache.get(value)!
    searching.value = false
    return
  }

  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  try {
    const response = await searchApi(value, {
      signal: abortController.signal
    })

    // 缓存结果
    searchCache.set(value, response)

    // 只有当关键词仍然匹配时才更新结果
    if (keyword.value === value) {
      results.value = response
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('搜索失败:', error)
    }
  } finally {
    searching.value = false
  }
}, 300)

const handleInput = (value: string) => {
  showResults.value = true

  if (value.trim()) {
    searching.value = true
    debouncedSearch(value)
  } else {
    results.value = []
    searching.value = false
  }
}

const handleClear = () => {
  results.value = []
  showResults.value = false
}

const handleSelect = (item: SearchItem) => {
  keyword.value = item.name
  showResults.value = false
  emit('select', item)
}

// 高亮匹配的关键词
const highlightKeyword = (text: string): string => {
  if (!keyword.value) return text

  const regex = new RegExp(`(${escapeRegExp(keyword.value)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 清理缓存
const clearCache = () => {
  searchCache.clear()
}

// 定时清理过期缓存
setInterval(() => {
  if (searchCache.size > 100) {
    // 只保留最近的 50 个缓存
    const entries = Array.from(searchCache.entries())
    searchCache.clear()
    entries.slice(-50).forEach(([key, value]) => {
      searchCache.set(key, value)
    })
  }
}, 60000)

const emit = defineEmits<{
  select: [item: SearchItem]
}>()
</script>

<style scoped>
.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.result-item {
  padding: 10px 15px;
  cursor: pointer;
}

.result-item:hover {
  background: #f5f7fa;
}

.result-item :deep(mark) {
  background: #ffc107;
  padding: 0 2px;
}

.loading,
.no-results {
  padding: 20px;
  text-align: center;
  color: #909399;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

**高级搜索管理器:**

```typescript
// composables/useSearch.ts
export function useSearch<T>(
  searchFn: (keyword: string, signal: AbortSignal) => Promise<T[]>,
  options: {
    debounce?: number
    cacheSize?: number
    minLength?: number
  } = {}
) {
  const { debounce = 300, cacheSize = 50, minLength = 1 } = options

  const keyword = ref('')
  const results = ref<T[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // LRU 缓存
  const cache = new Map<string, { data: T[]; timestamp: number }>()
  const CACHE_TTL = 5 * 60 * 1000 // 5分钟过期

  let abortController: AbortController | null = null

  // 清理过期缓存
  const cleanCache = () => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }

    // 保持缓存大小
    while (cache.size > cacheSize) {
      const oldestKey = cache.keys().next().value
      if (oldestKey) cache.delete(oldestKey)
    }
  }

  // 执行搜索
  const search = async (value: string) => {
    keyword.value = value
    error.value = null

    if (value.length < minLength) {
      results.value = []
      return
    }

    // 检查缓存
    const cached = cache.get(value)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results.value = cached.data
      return
    }

    // 取消之前的请求
    abortController?.abort()
    abortController = new AbortController()

    loading.value = true

    try {
      const data = await searchFn(value, abortController.signal)

      // 只有关键词匹配时才更新
      if (keyword.value === value) {
        results.value = data
        cache.set(value, { data, timestamp: Date.now() })
        cleanCache()
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        error.value = e
      }
    } finally {
      loading.value = false
    }
  }

  const debouncedSearch = useDebounceFn(search, debounce)

  // 重置
  const reset = () => {
    keyword.value = ''
    results.value = []
    error.value = null
    abortController?.abort()
  }

  // 清除缓存
  const clearCache = () => {
    cache.clear()
  }

  return {
    keyword,
    results: readonly(results),
    loading: readonly(loading),
    error: readonly(error),
    search: debouncedSearch,
    reset,
    clearCache
  }
}

// 使用示例
const {
  keyword,
  results,
  loading,
  search
} = useSearch(
  (keyword, signal) => api.searchUsers(keyword, { signal }),
  { debounce: 300, cacheSize: 100, minLength: 2 }
)
```
