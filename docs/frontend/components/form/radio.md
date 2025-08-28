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
