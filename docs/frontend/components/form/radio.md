# AFormRadio 单选框组件

AFormRadio 是一个功能完善的单选框组件，基于 Element Plus 的 ElRadio 封装，支持标准单选框和按钮样式，提供灵活的字段映射和禁用条件配置。

## 基础用法

### 标准单选框

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormRadio 
    v-model="queryParams.status" 
    :options="statusOptions" 
    label="状态" 
    prop="status" 
    @change="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormRadio 
    v-model="form.gender" 
    :options="genderOptions" 
    label="性别" 
    prop="gender" 
    :span="12" 
  />
</template>

<script setup>
const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]
</script>
```

### 按钮样式单选框

```vue
<template>
  <AFormRadio 
    v-model="form.type" 
    :options="typeOptions" 
    label="用户类型" 
    prop="type"
    type="button" 
    :span="12" 
  />
</template>

<script setup>
const typeOptions = [
  { label: '个人用户', value: 'personal' },
  { label: '企业用户', value: 'enterprise' },
  { label: '机构用户', value: 'organization' }
]
</script>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| boolean` | - | 绑定值 |
| `options` | `Array<any>` | `[]` | 选项数据 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项包装 |

### 单选框属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'radio' \| 'button'` | `'radio'` | 单选框类型 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `ElSize` | `''` | 组件尺寸 |
| `border` | `boolean` | `false` | 是否显示边框 |

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
  <AFormRadio 
    v-model="form.level" 
    :options="levelList" 
    label="用户等级" 
    prop="level"
    value-field="id" 
    label-field="name" 
    :span="12" 
  />
</template>

<script setup>
const levelList = [
  { id: 1, name: '普通用户', description: '基础功能' },
  { id: 2, name: 'VIP用户', description: '增值服务' },
  { id: 3, name: '超级VIP', description: '全部功能' }
]
</script>
```

### 带提示信息的单选框

```vue
<template>
  <AFormRadio 
    v-model="form.privacy" 
    :options="privacyOptions" 
    label="隐私设置" 
    prop="privacy"
    tooltip="选择您的信息可见范围" 
    :span="12" 
  />
</template>

<script setup>
const privacyOptions = [
  { label: '公开', value: 'public' },
  { label: '仅好友可见', value: 'friends' },
  { label: '仅自己可见', value: 'private' }
]
</script>
```

### 条件禁用选项

```vue
<template>
  <!-- 根据 status 字段禁用 -->
  <AFormRadio 
    v-model="form.planId" 
    :options="planOptions" 
    label="套餐计划" 
    prop="planId"
    value-field="id" 
    label-field="name" 
    disabled-field="status"
    disabled-value="disabled"
    :span="12" 
  />
</template>

<script setup>
const planOptions = [
  { id: 1, name: '基础版', status: 'active' },
  { id: 2, name: '专业版', status: 'disabled' }, // 这个选项会被禁用
  { id: 3, name: '企业版', status: 'active' }
]
</script>
```

### 多值禁用条件

```vue
<template>
  <AFormRadio 
    v-model="form.regionId" 
    :options="regionOptions" 
    label="服务区域" 
    prop="regionId"
    value-field="id" 
    label-field="name" 
    disabled-field="status" 
    :disabled-value="['0', '2']"
    :span="12" 
  />
</template>

<script setup>
const regionOptions = [
  { id: 1, name: '华北地区', status: '1' },
  { id: 2, name: '华东地区', status: '0' }, // 禁用
  { id: 3, name: '华南地区', status: '2' }, // 禁用
  { id: 4, name: '西南地区', status: '1' }
]
</script>
```

### 函数式禁用条件

```vue
<template>
  <AFormRadio 
    v-model="form.shippingMethod" 
    :options="shippingOptions" 
    label="配送方式" 
    prop="shippingMethod"
    value-field="id" 
    label-field="name" 
    :disabled-value="isShippingDisabled"
    :span="12" 
  />
</template>

<script setup>
const shippingOptions = [
  { id: 1, name: '标准配送', available: true, region: 'all' },
  { id: 2, name: '次日达', available: false, region: 'limited' },
  { id: 3, name: '当日达', available: true, region: 'city' }
]

const isShippingDisabled = (option) => {
  // 根据用户地址和服务可用性判断
  return !option.available || (option.region === 'city' && !userInCity.value)
}
</script>
```

### 带边框的单选框

```vue
<template>
  <AFormRadio 
    v-model="form.theme" 
    :options="themeOptions" 
    label="主题设置" 
    prop="theme"
    border
    :span="12" 
  />
</template>

<script setup>
const themeOptions = [
  { label: '浅色主题', value: 'light' },
  { label: '深色主题', value: 'dark' },
  { label: '自动切换', value: 'auto' }
]
</script>
```

### 自定义颜色的单选框

```vue
<template>
  <AFormRadio 
    v-model="form.priority" 
    :options="priorityOptions" 
    label="优先级" 
    prop="priority"
    text-color="#ffffff"
    fill="#f56c6c"
    :span="12" 
  />
</template>

<script setup>
const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
]
</script>
```

### 不含表单项的纯单选框

```vue
<template>
  <AFormRadio 
    v-model="selectedView" 
    :options="viewOptions" 
    :show-form-item="false" 
    type="button"
    @change="handleViewChange"
  />
</template>

<script setup>
const viewOptions = [
  { label: '列表视图', value: 'list' },
  { label: '卡片视图', value: 'card' },
  { label: '表格视图', value: 'table' }
]

const handleViewChange = (value) => {
  // 切换视图逻辑
  console.log('切换到视图:', value)
}
</script>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormRadio 
    v-model="form.notification"
    :options="notificationOptions"
    label="通知设置"
    @change="handleNotificationChange"
  />
</template>

<script setup>
const notificationOptions = [
  { label: '立即通知', value: 'immediate' },
  { label: '每日汇总', value: 'daily' },
  { label: '关闭通知', value: 'disabled' }
]

const handleNotificationChange = (value) => {
  console.log('通知设置变更:', value)
  
  // 根据选择执行不同逻辑
  switch(value) {
    case 'immediate':
      enableRealTimeNotification()
      break
    case 'daily':
      setupDailyDigest()
      break
    case 'disabled':
      disableNotifications()
      break
  }
}
</script>
```

### 联动控制

```vue
<template>
  <el-row :gutter="20">
    <AFormRadio 
      v-model="form.paymentType" 
      :options="paymentOptions" 
      label="支付方式" 
      prop="paymentType"
      @change="handlePaymentTypeChange"
      :span="12" 
    />
    
    <AFormRadio 
      v-model="form.installments" 
      :options="installmentOptions" 
      label="分期期数" 
      prop="installments"
      :disabled="form.paymentType !== 'installment'"
      :span="12" 
    />
  </el-row>
</template>

<script setup>
const paymentOptions = [
  { label: '一次性付款', value: 'full' },
  { label: '分期付款', value: 'installment' }
]

const installmentOptions = [
  { label: '3期', value: 3 },
  { label: '6期', value: 6 },
  { label: '12期', value: 12 }
]

const handlePaymentTypeChange = (value) => {
  if (value !== 'installment') {
    form.installments = ''
  }
}
</script>
```

## 高级用法

### 动态选项生成

```vue
<template>
  <AFormRadio 
    v-model="form.difficulty"
    :options="difficultyOptions"
    label="难度等级"
    prop="difficulty"
    value-field="level"
    label-field="name"
  />
</template>

<script setup>
const difficultyOptions = computed(() => {
  const levels = ['简单', '普通', '困难', '专家']
  return levels.map((name, index) => ({
    level: index + 1,
    name: `${name} (${index + 1}星)`,
    description: `适合${name}级别用户`
  }))
})
</script>
```

### 条件显示选项

```vue
<template>
  <AFormRadio 
    v-model="form.accessLevel"
    :options="filteredAccessOptions"
    label="访问权限"
    prop="accessLevel"
  />
</template>

<script setup>
const allAccessOptions = [
  { label: '只读', value: 'read', requiredRole: 'user' },
  { label: '读写', value: 'write', requiredRole: 'editor' },
  { label: '管理', value: 'admin', requiredRole: 'admin' }
]

const filteredAccessOptions = computed(() => {
  return allAccessOptions.filter(option => 
    hasRole(option.requiredRole)
  )
})

const hasRole = (role) => {
  // 检查用户是否有对应角色
  return userRoles.value.includes(role)
}
</script>
```

### 自定义选项模板

```vue
<template>
  <AFormRadio 
    v-model="form.plan"
    :options="planOptions"
    label="订阅计划"
    prop="plan"
    value-field="id"
    label-field="name"
  >
    <template #default="{ option }">
      <div class="flex items-center justify-between w-full">
        <div>
          <div class="font-medium">{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.description }}</div>
        </div>
        <div class="text-right">
          <div class="font-bold text-primary">¥{{ option.price }}/月</div>
          <div class="text-xs text-gray-400">{{ option.features }}项功能</div>
        </div>
      </div>
    </template>
  </AFormRadio>
</template>

<script setup>
const planOptions = [
  {
    id: 1,
    name: '基础版',
    description: '适合个人用户',
    price: 29,
    features: 5
  },
  {
    id: 2,
    name: '专业版',
    description: '适合小团队',
    price: 99,
    features: 15
  },
  {
    id: 3,
    name: '企业版',
    description: '适合大型团队',
    price: 299,
    features: 50
  }
]
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormRadio 
      v-model="form.agreement" 
      :options="agreementOptions" 
      label="用户协议" 
      prop="agreement" 
    />
  </el-form>
</template>

<script setup>
const agreementOptions = [
  { label: '同意', value: true },
  { label: '不同意', value: false }
]

const rules = {
  agreement: [
    { 
      required: true, 
      message: '请选择是否同意用户协议', 
      trigger: 'change' 
    },
    {
      validator: (rule, value, callback) => {
        if (value !== true) {
          callback(new Error('必须同意用户协议才能继续'))
        } else {
          callback()
        }
      },
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
    <AFormRadio 
      v-model="form.riskLevel" 
      :options="riskOptions" 
      label="风险偏好" 
      prop="riskLevel" 
    />
    
    <AFormRadio 
      v-model="form.investAmount" 
      :options="amountOptions" 
      label="投资金额" 
      prop="investAmount" 
    />
  </el-form>
</template>

<script setup>
const riskOptions = [
  { label: '保守型', value: 'conservative' },
  { label: '稳健型', value: 'moderate' },
  { label: '积极型', value: 'aggressive' }
]

const amountOptions = [
  { label: '10万以下', value: 'low' },
  { label: '10-50万', value: 'medium' },
  { label: '50万以上', value: 'high' }
]

const validateInvestment = (rule, value, callback) => {
  if (form.riskLevel === 'conservative' && form.investAmount === 'high') {
    callback(new Error('保守型投资者不建议选择高额投资'))
  } else {
    callback()
  }
}

const rules = {
  riskLevel: [
    { required: true, message: '请选择风险偏好', trigger: 'change' }
  ],
  investAmount: [
    { required: true, message: '请选择投资金额', trigger: 'change' },
    { validator: validateInvestment, trigger: 'change' }
  ]
}
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormRadio 
    v-model="form.size"
    :options="sizeOptions"
    label="尺寸"
    class="custom-radio"
  />
</template>

<style scoped>
.custom-radio :deep(.el-radio) {
  margin-right: 30px;
  margin-bottom: 10px;
}

.custom-radio :deep(.el-radio__label) {
  color: #606266;
  font-weight: 500;
}

.custom-radio :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #409eff;
}
</style>
```

### 响应式布局

```vue
<template>
  <AFormRadio 
    v-model="form.layout"
    :options="layoutOptions"
    label="布局方式"
    :span="isMobile ? 24 : 12"
    :type="isMobile ? 'radio' : 'button'"
  />
</template>

<script setup>
import { useBreakpoint } from '@/composables/useBreakpoint'
const { isMobile } = useBreakpoint()
</script>
```

## 最佳实践

### 1. 选项数量控制

```vue
<template>
  <!-- 选项较少时使用单选框 -->
  <AFormRadio 
    v-model="form.gender" 
    :options="genderOptions" 
    label="性别"
  />
  
  <!-- 选项较多时考虑使用选择器 -->
  <AFormSelect 
    v-if="countryOptions.length > 8"
    v-model="form.country" 
    :options="countryOptions" 
    label="国家"
  />
</template>
```

### 2. 合适的选项排序

```vue
<template>
  <!-- 按使用频率排序 -->
  <AFormRadio 
    v-model="form.frequency"
    :options="frequencyOptions"
    label="使用频率"
  />
</template>

<script setup>
const frequencyOptions = [
  { label: '每天', value: 'daily' },      // 最常用的放前面
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '很少', value: 'rarely' }
]
</script>
```

### 3. 提供默认值

```vue
<template>
  <AFormRadio 
    v-model="form.privacy"
    :options="privacyOptions"
    label="隐私设置"
  />
</template>

<script setup>
const form = reactive({
  privacy: 'friends' // 设置合理的默认值
})

const privacyOptions = [
  { label: '公开', value: 'public' },
  { label: '仅好友', value: 'friends' },
  { label: '仅自己', value: 'private' }
]
</script>
```

### 4. 清晰的选项描述

```vue
<template>
  <AFormRadio 
    v-model="form.backup"
    :options="backupOptions"
    label="备份策略"
    tooltip="选择适合您的数据备份方式"
  />
</template>

<script setup>
const backupOptions = [
  { label: '实时备份 - 数据变化时立即备份', value: 'realtime' },
  { label: '每日备份 - 每天凌晨自动备份', value: 'daily' },
  { label: '手动备份 - 仅在手动触发时备份', value: 'manual' }
]
</script>
```

## 注意事项

1. **数据类型**：确保绑定值与选项值的数据类型一致
2. **选项数量**：单选框适用于2-7个选项，超过建议使用选择器
3. **默认选择**：为用户体验考虑，通常应该有默认选中项
4. **禁用逻辑**：复杂的禁用条件建议使用函数形式
5. **无障碍访问**：确保所有选项都有清晰的标签描述

## 常见问题

### 1. 单选框选中状态与数据不同步

**问题描述：**

单选框选中状态与 `v-model` 绑定的数据不一致，点击后视图没有更新或数据没有改变。

```vue
<template>
  <AFormRadio
    v-model="form.status"
    :options="statusOptions"
    label="状态"
  />
</template>

<script setup>
// 问题代码：数据类型不匹配
const form = reactive({
  status: 1  // number 类型
})

const statusOptions = [
  { label: '启用', value: '1' },  // string 类型
  { label: '禁用', value: '0' }   // string 类型
]
</script>
```

**问题原因：**

- 绑定值与选项值的数据类型不一致（number vs string）
- 使用了非响应式对象作为绑定值
- 选项数据后于组件渲染，导致初始状态不正确
- 在 `computed` 或 `watch` 中错误地处理了值

**解决方案：**

```typescript
// ❌ 错误：数据类型不匹配
const form = reactive({
  status: 1  // number
})
const statusOptions = [
  { label: '启用', value: '1' },  // string
  { label: '禁用', value: '0' }   // string
]

// ✅ 正确：确保数据类型一致
const form = reactive({
  status: '1'  // string，与选项值类型一致
})

// 或者修改选项值类型
const statusOptions = [
  { label: '启用', value: 1 },  // number
  { label: '禁用', value: 0 }   // number
]

// ✅ 正确：使用类型转换工具
interface RadioOption<T = string | number> {
  label: string
  value: T
  disabled?: boolean
}

function normalizeRadioValue<T>(
  value: any,
  options: RadioOption<T>[],
  defaultValue: T
): T {
  // 尝试严格匹配
  const exactMatch = options.find(opt => opt.value === value)
  if (exactMatch) return exactMatch.value

  // 尝试类型转换后匹配
  const stringValue = String(value)
  const stringMatch = options.find(opt => String(opt.value) === stringValue)
  if (stringMatch) return stringMatch.value

  // 返回默认值
  return defaultValue
}

// 使用
const form = reactive({
  status: normalizeRadioValue(apiData.status, statusOptions, '1')
})
```

---

### 2. 动态选项更新后选中值丢失

**问题描述：**

当选项数据从接口加载或动态更新后，之前选中的值丢失或变成未选中状态。

```vue
<template>
  <AFormRadio
    v-model="form.categoryId"
    :options="categoryOptions"
    label="分类"
    value-field="id"
    label-field="name"
  />
</template>

<script setup>
const form = reactive({
  categoryId: 5  // 编辑时有初始值
})

const categoryOptions = ref([])

onMounted(async () => {
  // 问题：加载选项后，之前的选中值可能丢失
  categoryOptions.value = await fetchCategories()
})
</script>
```

**问题原因：**

- 选项数据异步加载，组件初始化时选项为空
- 选项更新后触发了值的重置
- 选项 ID 与绑定值不匹配（数据类型或值本身）
- 编辑模式下表单数据和选项数据的加载顺序问题

**解决方案：**

```typescript
// ❌ 错误：选项和表单数据加载顺序不确定
onMounted(async () => {
  categoryOptions.value = await fetchCategories()
  form.categoryId = editData.categoryId  // 可能在选项加载前设置
})

// ✅ 正确：使用加载管理器确保顺序
class FormDataLoader<T extends Record<string, any>> {
  private form: T
  private optionsMap: Map<string, Ref<any[]>> = new Map()
  private loadPromises: Map<string, Promise<any>> = new Map()
  private isInitialized = ref(false)

  constructor(initialForm: T) {
    this.form = reactive(initialForm) as T
  }

  /**
   * 注册选项加载器
   */
  registerOptions(
    fieldName: string,
    optionsRef: Ref<any[]>,
    loader: () => Promise<any[]>
  ): void {
    this.optionsMap.set(fieldName, optionsRef)

    const loadPromise = loader().then(options => {
      optionsRef.value = options
      return options
    })

    this.loadPromises.set(fieldName, loadPromise)
  }

  /**
   * 初始化表单数据（在选项加载完成后）
   */
  async initFormData(data: Partial<T>): Promise<void> {
    // 等待所有选项加载完成
    await Promise.all(this.loadPromises.values())

    // 验证并设置表单数据
    for (const [key, value] of Object.entries(data)) {
      const optionsRef = this.optionsMap.get(key)

      if (optionsRef) {
        // 验证值是否在选项中存在
        const isValidValue = this.validateValueInOptions(
          value,
          optionsRef.value,
          key
        )

        if (isValidValue) {
          ;(this.form as any)[key] = value
        } else {
          console.warn(`值 ${value} 不在 ${key} 的选项中`)
          // 可选：设置默认值
          const defaultValue = this.getDefaultValue(optionsRef.value, key)
          ;(this.form as any)[key] = defaultValue
        }
      } else {
        ;(this.form as any)[key] = value
      }
    }

    this.isInitialized.value = true
  }

  private validateValueInOptions(
    value: any,
    options: any[],
    fieldName: string
  ): boolean {
    // 根据字段名获取配置（如 valueField）
    const valueField = this.getValueField(fieldName)
    return options.some(opt => opt[valueField] === value)
  }

  private getValueField(fieldName: string): string {
    // 可以配置不同字段的 valueField
    const fieldConfig: Record<string, string> = {
      categoryId: 'id',
      status: 'value'
    }
    return fieldConfig[fieldName] || 'value'
  }

  private getDefaultValue(options: any[], fieldName: string): any {
    const valueField = this.getValueField(fieldName)
    return options[0]?.[valueField] ?? null
  }

  getForm(): T {
    return this.form
  }

  isReady(): Ref<boolean> {
    return this.isInitialized
  }
}

// 使用示例
const loader = new FormDataLoader({
  categoryId: null,
  status: null
})

const categoryOptions = ref<any[]>([])
const statusOptions = ref<any[]>([])

loader.registerOptions('categoryId', categoryOptions, () => fetchCategories())
loader.registerOptions('status', statusOptions, () => fetchStatusList())

// 编辑模式
if (editId) {
  const editData = await fetchEditData(editId)
  await loader.initFormData(editData)
}

const form = loader.getForm()
const isFormReady = loader.isReady()
```

```vue
<!-- 在模板中使用 -->
<template>
  <div v-if="isFormReady">
    <AFormRadio
      v-model="form.categoryId"
      :options="categoryOptions"
      label="分类"
      value-field="id"
      label-field="name"
    />
  </div>
  <el-skeleton v-else :rows="1" />
</template>
```

---

### 3. 单选框在表单验证时不触发校验

**问题描述：**

单选框值变化后，表单验证规则没有被触发，错误提示不显示或不消失。

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormRadio
      v-model="form.agreement"
      :options="agreementOptions"
      label="用户协议"
      prop="agreement"
    />
    <!-- 错误提示不显示 -->
  </el-form>
</template>

<script setup>
const rules = {
  agreement: [
    { required: true, message: '请选择是否同意', trigger: 'change' }
  ]
}
</script>
```

**问题原因：**

- `prop` 属性值与 `rules` 中的字段名不匹配
- 组件没有正确触发 el-form-item 的验证
- 验证触发时机配置错误
- 组件包装层影响了验证事件的传播

**解决方案：**

```typescript
// ❌ 错误：prop 与 rules 字段不匹配
<AFormRadio
  v-model="form.agree"  // 绑定 agree
  prop="agreement"       // 但 prop 是 agreement
/>
const rules = {
  agreement: [...]       // rules 也是 agreement
}

// ✅ 正确：确保 prop 与 v-model 和 rules 一致
<AFormRadio
  v-model="form.agreement"
  prop="agreement"
/>
const rules = {
  agreement: [
    { required: true, message: '请选择是否同意', trigger: 'change' }
  ]
}

// ✅ 正确：手动触发验证（当自动触发失效时）
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormRadio
      v-model="form.agreement"
      :options="agreementOptions"
      label="用户协议"
      prop="agreement"
      @change="handleAgreementChange"
    />
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

const handleAgreementChange = async (value: any) => {
  // 手动触发该字段的验证
  try {
    await formRef.value?.validateField('agreement')
  } catch {
    // 验证失败，错误会显示在表单项下方
  }
}

// 或者使用防抖处理频繁变化
import { useDebounceFn } from '@vueuse/core'

const validateAgreement = useDebounceFn(async () => {
  await formRef.value?.validateField('agreement')
}, 300)

const handleAgreementChange = (value: any) => {
  validateAgreement()
}
</script>

// ✅ 正确：封装验证增强组件
interface ValidatedRadioProps {
  modelValue: any
  options: any[]
  label: string
  prop: string
  rules?: any[]
}

const ValidatedRadio = defineComponent({
  name: 'ValidatedRadio',
  props: {
    modelValue: { required: true },
    options: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    prop: { type: String, required: true },
    rules: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const formItem = inject<any>('elFormItem', null)

    const handleChange = (value: any) => {
      emit('update:modelValue', value)
      emit('change', value)

      // 触发 el-form-item 的验证
      nextTick(() => {
        formItem?.validate?.('change')
      })
    }

    return () => (
      <AFormRadio
        modelValue={props.modelValue}
        options={props.options}
        label={props.label}
        prop={props.prop}
        onChange={handleChange}
      />
    )
  }
})
```

---

### 4. 按钮样式单选框无法正确显示选中状态

**问题描述：**

使用 `type="button"` 时，按钮样式单选框的选中状态显示不正确，或样式与预期不符。

```vue
<template>
  <AFormRadio
    v-model="form.viewType"
    :options="viewOptions"
    type="button"
    label="视图类型"
  />
  <!-- 按钮不显示选中状态 -->
</template>
```

**问题原因：**

- CSS 样式被覆盖或冲突
- 组件库版本不兼容
- 自定义主题影响了按钮样式
- `fill` 和 `textColor` 属性值无效

**解决方案：**

```vue
<!-- ❌ 错误：颜色值格式不正确 -->
<AFormRadio
  type="button"
  fill="primary"
  text-color="white"
/>

<!-- ✅ 正确：使用正确的颜色值格式 -->
<AFormRadio
  v-model="form.viewType"
  :options="viewOptions"
  type="button"
  fill="#409EFF"
  text-color="#ffffff"
  label="视图类型"
/>

<script setup lang="ts">
// ✅ 正确：动态主题色
import { useCssVar } from '@vueuse/core'

const primaryColor = useCssVar('--el-color-primary')

const buttonRadioConfig = computed(() => ({
  fill: primaryColor.value || '#409EFF',
  textColor: '#ffffff'
}))
</script>

<template>
  <AFormRadio
    v-model="form.viewType"
    :options="viewOptions"
    type="button"
    :fill="buttonRadioConfig.fill"
    :text-color="buttonRadioConfig.textColor"
    label="视图类型"
  />
</template>

<style scoped>
/* ✅ 正确：修复可能的样式冲突 */
:deep(.el-radio-group) {
  display: inline-flex;
  flex-wrap: wrap;
}

:deep(.el-radio-button) {
  --el-radio-button-checked-bg-color: var(--el-color-primary);
  --el-radio-button-checked-text-color: #ffffff;
  --el-radio-button-checked-border-color: var(--el-color-primary);
}

:deep(.el-radio-button__inner) {
  border-radius: 0;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
}

/* 选中状态强制样式 */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
  color: #ffffff !important;
  box-shadow: -1px 0 0 0 var(--el-color-primary) !important;
}
</style>
```

```typescript
// ✅ 正确：创建自定义按钮样式单选框组件
interface ButtonRadioOption {
  label: string
  value: string | number
  disabled?: boolean
  icon?: string
}

interface ButtonRadioProps {
  modelValue: string | number
  options: ButtonRadioOption[]
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const ButtonRadioGroup = defineComponent({
  name: 'ButtonRadioGroup',
  props: {
    modelValue: { type: [String, Number], required: true },
    options: { type: Array as PropType<ButtonRadioOption[]>, default: () => [] },
    size: { type: String as PropType<ButtonRadioProps['size']>, default: 'default' },
    disabled: { type: Boolean, default: false },
    variant: { type: String as PropType<ButtonRadioProps['variant']>, default: 'primary' }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const variantColors = {
      primary: { bg: '#409EFF', text: '#ffffff' },
      success: { bg: '#67C23A', text: '#ffffff' },
      warning: { bg: '#E6A23C', text: '#ffffff' },
      danger: { bg: '#F56C6C', text: '#ffffff' },
      info: { bg: '#909399', text: '#ffffff' }
    }

    const currentColors = computed(() => variantColors[props.variant])

    const handleChange = (value: string | number) => {
      emit('update:modelValue', value)
      emit('change', value)
    }

    return () => (
      <el-radio-group
        modelValue={props.modelValue}
        size={props.size}
        disabled={props.disabled}
        fill={currentColors.value.bg}
        textColor={currentColors.value.text}
        onChange={handleChange}
      >
        {props.options.map(option => (
          <el-radio-button
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.icon && <el-icon class="mr-1"><component is={option.icon} /></el-icon>}
            {option.label}
          </el-radio-button>
        ))}
      </el-radio-group>
    )
  }
})
```

---

### 5. 禁用条件函数不生效

**问题描述：**

使用函数作为 `disabledValue` 时，禁用逻辑不生效或报错。

```vue
<template>
  <AFormRadio
    v-model="form.deliveryType"
    :options="deliveryOptions"
    :disabled-value="isDeliveryDisabled"
    label="配送方式"
  />
</template>

<script setup>
// 问题：函数没有正确执行
const isDeliveryDisabled = (option) => {
  return option.price > userBalance.value
}
</script>
```

**问题原因：**

- 函数引用丢失或 `this` 指向错误
- 响应式依赖没有被正确追踪
- 函数参数接收格式与组件传递不匹配
- 禁用判断在选项渲染前执行

**解决方案：**

```typescript
// ❌ 错误：函数内部依赖没有响应式更新
const isDeliveryDisabled = (option) => {
  return option.price > userBalance  // userBalance 不是响应式
}

// ✅ 正确：确保响应式依赖正确
const userBalance = ref(100)

const isDeliveryDisabled = (option: DeliveryOption): boolean => {
  // 使用 .value 访问响应式值
  return option.price > userBalance.value
}

// ✅ 正确：使用 computed 包装禁用逻辑
const deliveryOptions = ref([
  { label: '标准配送', value: 'standard', price: 10 },
  { label: '次日达', value: 'next_day', price: 30 },
  { label: '当日达', value: 'same_day', price: 50 }
])

const processedDeliveryOptions = computed(() => {
  return deliveryOptions.value.map(option => ({
    ...option,
    // 在 computed 中处理禁用状态
    disabled: option.price > userBalance.value
  }))
})

// ✅ 正确：完整的禁用条件管理器
interface DisableCondition<T> {
  field: keyof T
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'custom'
  value?: any
  customFn?: (option: T) => boolean
}

class OptionDisableManager<T extends Record<string, any>> {
  private conditions: DisableCondition<T>[] = []
  private globalDisabled = ref(false)

  /**
   * 添加禁用条件
   */
  addCondition(condition: DisableCondition<T>): this {
    this.conditions.push(condition)
    return this
  }

  /**
   * 设置全局禁用
   */
  setGlobalDisabled(disabled: boolean): void {
    this.globalDisabled.value = disabled
  }

  /**
   * 检查选项是否禁用
   */
  isDisabled(option: T): boolean {
    // 全局禁用优先
    if (this.globalDisabled.value) {
      return true
    }

    // 检查所有条件
    return this.conditions.some(condition => {
      return this.evaluateCondition(option, condition)
    })
  }

  private evaluateCondition(option: T, condition: DisableCondition<T>): boolean {
    const { field, operator, value, customFn } = condition
    const optionValue = option[field]

    switch (operator) {
      case 'eq':
        return optionValue === value
      case 'neq':
        return optionValue !== value
      case 'gt':
        return optionValue > value
      case 'lt':
        return optionValue < value
      case 'gte':
        return optionValue >= value
      case 'lte':
        return optionValue <= value
      case 'in':
        return Array.isArray(value) && value.includes(optionValue)
      case 'notIn':
        return Array.isArray(value) && !value.includes(optionValue)
      case 'custom':
        return customFn ? customFn(option) : false
      default:
        return false
    }
  }

  /**
   * 获取禁用判断函数（用于组件 props）
   */
  getDisabledFn(): (option: T) => boolean {
    return (option: T) => this.isDisabled(option)
  }

  /**
   * 处理选项列表
   */
  processOptions(options: T[]): (T & { disabled: boolean })[] {
    return options.map(option => ({
      ...option,
      disabled: this.isDisabled(option)
    }))
  }
}

// 使用示例
interface DeliveryOption {
  label: string
  value: string
  price: number
  available: boolean
  region: string
}

const disableManager = new OptionDisableManager<DeliveryOption>()

// 添加多个禁用条件
disableManager
  .addCondition({
    field: 'available',
    operator: 'eq',
    value: false
  })
  .addCondition({
    field: 'price',
    operator: 'gt',
    value: computed(() => userBalance.value).value
  })
  .addCondition({
    field: 'region',
    operator: 'custom',
    customFn: (option) => {
      // 自定义逻辑：检查用户所在区域
      return option.region === 'city' && !userInCity.value
    }
  })

// 在模板中使用
const processedOptions = computed(() =>
  disableManager.processOptions(deliveryOptions.value)
)
```

---

### 6. 自定义字段映射导致选项无法渲染

**问题描述：**

配置了 `valueField` 和 `labelField` 后，选项无法正确渲染或显示为空。

```vue
<template>
  <AFormRadio
    v-model="form.deptId"
    :options="deptOptions"
    value-field="deptId"
    label-field="deptName"
    label="部门"
  />
  <!-- 选项显示为空 -->
</template>

<script setup>
const deptOptions = [
  { id: 1, name: '技术部' },  // 字段名不匹配
  { id: 2, name: '市场部' }
]
</script>
```

**问题原因：**

- 配置的字段名与实际数据字段名不匹配
- 字段名拼写错误或大小写不一致
- 嵌套对象字段访问方式错误
- 数据结构变化但字段映射未更新

**解决方案：**

```typescript
// ❌ 错误：字段映射与实际数据不匹配
const deptOptions = [
  { id: 1, name: '技术部' }  // 实际是 id 和 name
]

<AFormRadio
  value-field="deptId"      // 但配置的是 deptId
  label-field="deptName"    // 和 deptName
/>

// ✅ 正确：确保字段映射与数据一致
<AFormRadio
  v-model="form.deptId"
  :options="deptOptions"
  value-field="id"
  label-field="name"
  label="部门"
/>

// ✅ 正确：使用数据转换器
interface FieldMapping {
  value: string | ((item: any) => any)
  label: string | ((item: any) => string)
  disabled?: string | ((item: any) => boolean)
}

function mapOptionsFields<T extends Record<string, any>>(
  options: T[],
  mapping: FieldMapping
): Array<{ value: any; label: string; disabled?: boolean; _raw: T }> {
  return options.map(option => {
    const getValue = (field: string | ((item: any) => any), item: any) => {
      if (typeof field === 'function') {
        return field(item)
      }
      // 支持点号分隔的嵌套字段
      return field.split('.').reduce((obj, key) => obj?.[key], item)
    }

    const getLabel = (field: string | ((item: any) => string), item: any): string => {
      if (typeof field === 'function') {
        return field(item)
      }
      return String(getValue(field, item) ?? '')
    }

    const getDisabled = (
      field: string | ((item: any) => boolean) | undefined,
      item: any
    ): boolean => {
      if (!field) return false
      if (typeof field === 'function') {
        return field(item)
      }
      const value = getValue(field, item)
      return value === true || value === '0' || value === 0
    }

    return {
      value: getValue(mapping.value, option),
      label: getLabel(mapping.label, option),
      disabled: getDisabled(mapping.disabled, option),
      _raw: option  // 保留原始数据
    }
  })
}

// 使用示例
const rawDeptOptions = [
  { id: 1, name: '技术部', status: '1' },
  { id: 2, name: '市场部', status: '0' }
]

const deptOptions = computed(() =>
  mapOptionsFields(rawDeptOptions, {
    value: 'id',
    label: 'name',
    disabled: (item) => item.status === '0'
  })
)

// 支持嵌套字段
const userOptions = [
  { user: { id: 1, profile: { name: '张三' } }, active: true },
  { user: { id: 2, profile: { name: '李四' } }, active: false }
]

const mappedUserOptions = computed(() =>
  mapOptionsFields(userOptions, {
    value: 'user.id',
    label: 'user.profile.name',
    disabled: (item) => !item.active
  })
)

// ✅ 正确：创建字段映射调试工具
function debugFieldMapping<T extends Record<string, any>>(
  options: T[],
  valueField: string,
  labelField: string
): void {
  console.group('字段映射调试')

  console.log('配置的字段:', { valueField, labelField })

  if (options.length === 0) {
    console.warn('选项数组为空')
    console.groupEnd()
    return
  }

  const firstOption = options[0]
  console.log('第一个选项的字段:', Object.keys(firstOption))
  console.log('第一个选项数据:', firstOption)

  const hasValueField = valueField in firstOption
  const hasLabelField = labelField in firstOption

  if (!hasValueField) {
    console.error(`值字段 "${valueField}" 不存在于选项中`)
    console.log('可用的字段:', Object.keys(firstOption))
  }

  if (!hasLabelField) {
    console.error(`标签字段 "${labelField}" 不存在于选项中`)
    console.log('可用的字段:', Object.keys(firstOption))
  }

  if (hasValueField && hasLabelField) {
    console.log('✅ 字段映射正确')
    console.log('映射结果预览:', options.slice(0, 3).map(opt => ({
      value: opt[valueField],
      label: opt[labelField]
    })))
  }

  console.groupEnd()
}

// 开发环境调试
if (import.meta.env.DEV) {
  debugFieldMapping(deptOptions, 'deptId', 'deptName')
}
```

---

### 7. 单选框组与其他表单组件联动失效

**问题描述：**

单选框选择后，联动的其他表单组件没有正确更新或重置。

```vue
<template>
  <AFormRadio
    v-model="form.userType"
    :options="userTypeOptions"
    label="用户类型"
    @change="handleUserTypeChange"
  />

  <AFormSelect
    v-model="form.subType"
    :options="subTypeOptions"
    label="子类型"
  />
</template>

<script setup>
// 问题：切换用户类型后，子类型选项没有更新
const handleUserTypeChange = (value) => {
  form.subType = ''  // 重置子类型
  // 子类型选项应该根据用户类型变化
}
</script>
```

**问题原因：**

- 联动逻辑执行顺序问题
- 选项更新没有触发响应式更新
- 重置值时机不正确
- watch 监听器配置错误

**解决方案：**

```typescript
// ❌ 错误：联动逻辑不完整
const handleUserTypeChange = (value) => {
  form.subType = ''  // 只重置了值，但选项没变
}

// ✅ 正确：完整的联动管理器
interface CascadeConfig {
  source: string
  target: string
  optionsLoader: (sourceValue: any) => Promise<any[]> | any[]
  resetOnChange?: boolean
  defaultValue?: any
}

class FormCascadeManager<T extends Record<string, any>> {
  private form: T
  private cascades: Map<string, CascadeConfig[]> = new Map()
  private optionsRefs: Map<string, Ref<any[]>> = new Map()
  private loadingRefs: Map<string, Ref<boolean>> = new Map()

  constructor(form: T) {
    this.form = form
  }

  /**
   * 注册级联关系
   */
  registerCascade(config: CascadeConfig): this {
    const existing = this.cascades.get(config.source) || []
    existing.push(config)
    this.cascades.set(config.source, existing)

    // 创建选项引用
    if (!this.optionsRefs.has(config.target)) {
      this.optionsRefs.set(config.target, ref([]))
      this.loadingRefs.set(config.target, ref(false))
    }

    return this
  }

  /**
   * 获取目标字段的选项
   */
  getOptions(target: string): Ref<any[]> {
    return this.optionsRefs.get(target) || ref([])
  }

  /**
   * 获取加载状态
   */
  getLoading(target: string): Ref<boolean> {
    return this.loadingRefs.get(target) || ref(false)
  }

  /**
   * 处理源字段变化
   */
  async handleSourceChange(source: string, value: any): Promise<void> {
    const cascades = this.cascades.get(source)
    if (!cascades) return

    // 并行处理所有级联目标
    await Promise.all(
      cascades.map(async (cascade) => {
        const { target, optionsLoader, resetOnChange = true, defaultValue = '' } = cascade
        const optionsRef = this.optionsRefs.get(target)
        const loadingRef = this.loadingRefs.get(target)

        if (!optionsRef || !loadingRef) return

        // 重置目标值
        if (resetOnChange) {
          ;(this.form as any)[target] = defaultValue
        }

        // 加载新选项
        loadingRef.value = true

        try {
          const newOptions = await optionsLoader(value)
          optionsRef.value = newOptions

          // 如果有默认值且在新选项中
          if (defaultValue !== '' && newOptions.length > 0) {
            const hasDefault = newOptions.some(
              (opt: any) => opt.value === defaultValue
            )
            if (!hasDefault) {
              ;(this.form as any)[target] = newOptions[0]?.value ?? ''
            }
          }
        } catch (error) {
          console.error(`加载 ${target} 选项失败:`, error)
          optionsRef.value = []
        } finally {
          loadingRef.value = false
        }

        // 递归处理下级级联
        await this.handleSourceChange(target, (this.form as any)[target])
      })
    )
  }

  /**
   * 创建变化处理函数
   */
  createChangeHandler(source: string): (value: any) => Promise<void> {
    return async (value: any) => {
      await this.handleSourceChange(source, value)
    }
  }

  /**
   * 初始化所有级联（用于编辑模式）
   */
  async initializeCascades(initialValues: Partial<T>): Promise<void> {
    // 按依赖顺序处理
    const processed = new Set<string>()

    const processField = async (field: string) => {
      if (processed.has(field)) return
      processed.add(field)

      // 找到以该字段为目标的级联
      for (const [source, cascades] of this.cascades.entries()) {
        for (const cascade of cascades) {
          if (cascade.target === field && !processed.has(source)) {
            // 先处理源字段
            await processField(source)
          }
        }
      }

      // 处理该字段作为源的级联
      const sourceValue = initialValues[field as keyof T] ?? (this.form as any)[field]
      if (sourceValue !== undefined && sourceValue !== '') {
        await this.handleSourceChange(field, sourceValue)
      }
    }

    // 处理所有源字段
    for (const source of this.cascades.keys()) {
      await processField(source)
    }
  }
}

// 使用示例
const form = reactive({
  userType: '',
  subType: '',
  detailType: ''
})

const cascadeManager = new FormCascadeManager(form)

// 注册三级联动
cascadeManager
  .registerCascade({
    source: 'userType',
    target: 'subType',
    optionsLoader: async (userType) => {
      if (!userType) return []
      const res = await api.getSubTypes(userType)
      return res.data.map(item => ({
        label: item.name,
        value: item.id
      }))
    },
    resetOnChange: true
  })
  .registerCascade({
    source: 'subType',
    target: 'detailType',
    optionsLoader: async (subType) => {
      if (!subType) return []
      const res = await api.getDetailTypes(subType)
      return res.data.map(item => ({
        label: item.name,
        value: item.id
      }))
    },
    resetOnChange: true
  })

const subTypeOptions = cascadeManager.getOptions('subType')
const detailTypeOptions = cascadeManager.getOptions('detailType')
const subTypeLoading = cascadeManager.getLoading('subType')
const detailTypeLoading = cascadeManager.getLoading('detailType')

// 在模板中使用
<template>
  <AFormRadio
    v-model="form.userType"
    :options="userTypeOptions"
    label="用户类型"
    @change="cascadeManager.createChangeHandler('userType')"
  />

  <AFormSelect
    v-model="form.subType"
    :options="subTypeOptions"
    :loading="subTypeLoading"
    label="子类型"
    @change="cascadeManager.createChangeHandler('subType')"
  />

  <AFormSelect
    v-model="form.detailType"
    :options="detailTypeOptions"
    :loading="detailTypeLoading"
    label="详细类型"
  />
</template>

// 编辑模式初始化
if (isEdit) {
  await cascadeManager.initializeCascades(editData)
}
```

---

### 8. 大量选项时单选框性能问题

**问题描述：**

当选项数量较多（如 50+ 个）时，单选框渲染缓慢或交互卡顿。

```vue
<template>
  <AFormRadio
    v-model="form.cityId"
    :options="cityOptions"
    label="城市"
  />
  <!-- 300+ 个城市选项，渲染很慢 -->
</template>
```

**问题原因：**

- 大量 DOM 元素同时渲染
- 每个选项都创建响应式绑定
- 没有使用虚拟滚动
- 选项数据结构过于复杂

**解决方案：**

```typescript
// ❌ 错误：直接渲染大量选项
<AFormRadio
  v-model="form.cityId"
  :options="allCities"  // 300+ 选项
/>

// ✅ 正确：选项数量多时使用搜索选择器
<template>
  <el-form-item label="城市">
    <template v-if="cityOptions.length <= 10">
      <!-- 少量选项使用单选框 -->
      <AFormRadio
        v-model="form.cityId"
        :options="cityOptions"
        :show-form-item="false"
      />
    </template>
    <template v-else>
      <!-- 大量选项使用可搜索选择器 -->
      <el-select
        v-model="form.cityId"
        filterable
        placeholder="请选择城市"
      >
        <el-option
          v-for="city in cityOptions"
          :key="city.value"
          :label="city.label"
          :value="city.value"
        />
      </el-select>
    </template>
  </el-form-item>
</template>

// ✅ 正确：使用分组展示
interface GroupedOption {
  group: string
  options: Array<{ label: string; value: any }>
}

function groupOptions<T extends Record<string, any>>(
  options: T[],
  groupField: string,
  valueField: string = 'value',
  labelField: string = 'label'
): GroupedOption[] {
  const groups = new Map<string, GroupedOption>()

  for (const option of options) {
    const groupName = option[groupField] || '其他'

    if (!groups.has(groupName)) {
      groups.set(groupName, {
        group: groupName,
        options: []
      })
    }

    groups.get(groupName)!.options.push({
      label: option[labelField],
      value: option[valueField]
    })
  }

  return Array.from(groups.values())
}

// 分组城市选项
const groupedCities = computed(() =>
  groupOptions(cityList.value, 'province', 'id', 'name')
)

// ✅ 正确：使用虚拟列表单选框
import { useVirtualList } from '@vueuse/core'

const VirtualRadioList = defineComponent({
  name: 'VirtualRadioList',
  props: {
    modelValue: { type: [String, Number], required: true },
    options: { type: Array as PropType<any[]>, default: () => [] },
    itemHeight: { type: Number, default: 36 },
    containerHeight: { type: Number, default: 300 },
    searchable: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const searchKeyword = ref('')

    const filteredOptions = computed(() => {
      if (!searchKeyword.value) return props.options
      const keyword = searchKeyword.value.toLowerCase()
      return props.options.filter(opt =>
        opt.label.toLowerCase().includes(keyword)
      )
    })

    const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
      filteredOptions,
      {
        itemHeight: props.itemHeight
      }
    )

    // 选中时滚动到对应位置
    const scrollToSelected = () => {
      const index = filteredOptions.value.findIndex(
        opt => opt.value === props.modelValue
      )
      if (index >= 0) {
        scrollTo(index)
      }
    }

    onMounted(scrollToSelected)
    watch(() => props.modelValue, scrollToSelected)

    const handleSelect = (value: any) => {
      emit('update:modelValue', value)
      emit('change', value)
    }

    return () => (
      <div class="virtual-radio-list">
        {props.searchable && (
          <el-input
            v-model={searchKeyword.value}
            placeholder="搜索选项..."
            prefix-icon="Search"
            clearable
            class="mb-2"
          />
        )}

        <div
          {...containerProps}
          style={{ height: `${props.containerHeight}px`, overflow: 'auto' }}
        >
          <div {...wrapperProps}>
            {list.value.map(({ data: option, index }) => (
              <div
                key={option.value}
                class={[
                  'virtual-radio-item',
                  { 'is-selected': option.value === props.modelValue }
                ]}
                style={{ height: `${props.itemHeight}px` }}
                onClick={() => handleSelect(option.value)}
              >
                <el-radio
                  modelValue={props.modelValue}
                  value={option.value}
                >
                  {option.label}
                </el-radio>
              </div>
            ))}
          </div>
        </div>

        <div class="virtual-radio-footer">
          共 {filteredOptions.value.length} 个选项
          {searchKeyword.value && ` (搜索: "${searchKeyword.value}")`}
        </div>
      </div>
    )
  }
})

// ✅ 正确：使用懒加载选项
const useLazyRadioOptions = (
  loader: (page: number, pageSize: number, search?: string) => Promise<{
    items: any[]
    total: number
  }>,
  pageSize: number = 50
) => {
  const options = ref<any[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const searchKeyword = ref('')
  const total = ref(0)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true

    try {
      const result = await loader(
        currentPage.value,
        pageSize,
        searchKeyword.value
      )

      options.value = [...options.value, ...result.items]
      total.value = result.total
      hasMore.value = options.value.length < result.total
      currentPage.value++
    } finally {
      loading.value = false
    }
  }

  const search = async (keyword: string) => {
    searchKeyword.value = keyword
    options.value = []
    currentPage.value = 1
    hasMore.value = true
    await loadMore()
  }

  const reset = () => {
    options.value = []
    currentPage.value = 1
    hasMore.value = true
    searchKeyword.value = ''
  }

  // 初始加载
  loadMore()

  return {
    options: readonly(options),
    loading: readonly(loading),
    hasMore: readonly(hasMore),
    total: readonly(total),
    loadMore,
    search,
    reset
  }
}

// 使用
const {
  options: cityOptions,
  loading,
  hasMore,
  loadMore
} = useLazyRadioOptions(async (page, pageSize, search) => {
  const res = await api.getCities({ page, pageSize, search })
  return {
    items: res.data.list.map(city => ({
      label: city.name,
      value: city.id
    })),
    total: res.data.total
  }
})
```

```vue
<!-- 带懒加载的选择组件 -->
<template>
  <div class="lazy-radio-container">
    <el-input
      v-model="searchInput"
      placeholder="搜索城市..."
      @input="handleSearch"
      clearable
    />

    <div
      class="radio-list"
      ref="listRef"
      @scroll="handleScroll"
    >
      <el-radio-group v-model="form.cityId">
        <el-radio
          v-for="city in cityOptions"
          :key="city.value"
          :value="city.value"
        >
          {{ city.label }}
        </el-radio>
      </el-radio-group>

      <div v-if="loading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>

      <div v-if="!hasMore && cityOptions.length > 0" class="no-more">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core'

const searchInput = ref('')

const handleSearch = useDebounceFn((value: string) => {
  search(value)
}, 300)

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const threshold = 50

  if (target.scrollHeight - target.scrollTop - target.clientHeight < threshold) {
    loadMore()
  }
}
</script>

<style scoped>
.lazy-radio-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
```
