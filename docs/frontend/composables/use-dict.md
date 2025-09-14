# useDict

字典数据管理组合函数，提供字典数据的获取、缓存和管理功能。

## 📋 功能特性

- **字典获取**: 支持同时获取多个字典类型的数据
- **缓存利用**: 优先从缓存获取数据，减少不必要的API请求
- **自动缓存**: 自动将API获取的字典数据存入缓存
- **状态跟踪**: 提供加载状态指示器
- **并行加载**: 支持多个字典类型的并行请求
- **错误处理**: 单个字典加载失败不影响其他字典的加载
- **类型转换**: 统一转换为标准字典格式

## 🎯 基础用法

### 单个字典使用

```vue
<template>
  <div v-loading="dictLoading">
    <el-select v-model="form.gender" placeholder="请选择性别">
      <el-option
        v-for="dict in sys_user_gender"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
        :disabled="dict.status === '1'"
      />
    </el-select>
  </div>
</template>

<script setup>
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  gender: ''
})

// 获取单个字典
const { sys_user_gender, dictLoading } = useDict(DictTypes.sys_user_gender)
</script>
```

### 多个字典使用

```vue
<template>
  <div v-loading="dictLoading">
    <el-form :model="form">
      <!-- 用户性别 -->
      <el-form-item label="性别">
        <el-select v-model="form.gender">
          <el-option
            v-for="dict in sys_user_gender"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      
      <!-- 启用状态 -->
      <el-form-item label="状态">
        <el-select v-model="form.status">
          <el-option
            v-for="dict in sys_enable_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      
      <!-- 通知类型 -->
      <el-form-item label="通知类型">
        <el-select v-model="form.noticeType">
          <el-option
            v-for="dict in sys_notice_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  gender: '',
  status: '',
  noticeType: ''
})

// 同时获取多个字典
const { 
  sys_user_gender, 
  sys_enable_status, 
  sys_notice_type,
  dictLoading 
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status, 
  DictTypes.sys_notice_type
)
</script>
```

## 🏷️ 字典类型枚举

系统预定义的字典类型：

```typescript
export enum DictTypes {
  /** 审核状态 */
  sys_audit_status = 'sys_audit_status',
  /** 逻辑标志 */
  sys_boolean_flag = 'sys_boolean_flag',
  /** 显示设置 */
  sys_display_setting = 'sys_display_setting',
  /** 启用状态 */
  sys_enable_status = 'sys_enable_status',
  /** 文件类型 */
  sys_file_type = 'sys_file_type',
  /** 消息类型 */
  sys_message_type = 'sys_message_type',
  /** 通知状态 */
  sys_notice_status = 'sys_notice_status',
  /** 通知类型 */
  sys_notice_type = 'sys_notice_type',
  /** 操作结果 */
  sys_oper_result = 'sys_oper_result',
  /** 业务操作类型 */
  sys_oper_type = 'sys_oper_type',
  /** 支付方式 */
  sys_payment_method = 'sys_payment_method',
  /** 订单状态 */
  sys_order_status = 'sys_order_status',
  /** 平台类型 */
  sys_platform_type = 'sys_platform_type',
  /** 用户性别 */
  sys_user_gender = 'sys_user_gender',
  /** 数据权限类型 */
  sys_data_scope = 'sys_data_scope'
}
```

## 🎨 字典项展示

### 带样式的选项

```vue
<template>
  <div>
    <el-select v-model="form.status">
      <el-option
        v-for="dict in sys_enable_status"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value">
        <span :class="dict.elTagClass">
          <el-tag :type="dict.elTagType" size="small">
            {{ dict.label }}
          </el-tag>
        </span>
      </el-option>
    </el-select>
    
    <!-- 显示选中值的标签 -->
    <div v-if="selectedStatusDict" class="mt-2">
      <el-tag :type="selectedStatusDict.elTagType">
        {{ selectedStatusDict.label }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  status: ''
})

const { sys_enable_status, dictLoading } = useDict(DictTypes.sys_enable_status)

// 获取选中状态的字典项
const selectedStatusDict = computed(() => {
  return sys_enable_status.value.find(dict => dict.value === form.status)
})
</script>
```

### 表格中的字典显示

```vue
<template>
  <div>
    <el-table :data="tableData" v-loading="dictLoading">
      <el-table-column prop="name" label="姓名" />
      
      <el-table-column label="性别">
        <template #default="{ row }">
          <el-tag>{{ getGenderLabel(row.gender) }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { useDict, DictTypes } from '@/composables/useDict'

const tableData = ref([
  { name: '张三', gender: '0', status: '0' },
  { name: '李四', gender: '1', status: '1' }
])

const { 
  sys_user_gender, 
  sys_enable_status,
  dictLoading 
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

// 获取性别标签
const getGenderLabel = (value) => {
  const dict = sys_user_gender.value.find(item => item.value === value)
  return dict?.label || value
}

// 获取状态标签
const getStatusLabel = (value) => {
  const dict = sys_enable_status.value.find(item => item.value === value)
  return dict?.label || value
}

// 获取状态标签类型
const getStatusTagType = (value) => {
  const dict = sys_enable_status.value.find(item => item.value === value)
  return dict?.elTagType || ''
}
</script>
```

## 🔄 高级用法

### 条件加载字典

```vue
<template>
  <div>
    <el-radio-group v-model="userType" @change="handleUserTypeChange">
      <el-radio label="admin">管理员</el-radio>
      <el-radio label="user">普通用户</el-radio>
    </el-radio-group>
    
    <div v-if="showPermissionSelect" v-loading="dictLoading">
      <el-select v-model="form.permissions" multiple>
        <el-option
          v-for="dict in permissions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { useDict, DictTypes } from '@/composables/useDict'

const userType = ref('user')
const form = reactive({
  permissions: []
})

const showPermissionSelect = computed(() => userType.value === 'admin')

// 条件性加载字典
const dictParams = computed(() => {
  return showPermissionSelect.value ? [DictTypes.sys_data_scope] : []
})

const { dictLoading, ...dictData } = useDict(...dictParams.value)

// 权限字典
const permissions = computed(() => {
  return dictData[DictTypes.sys_data_scope]?.value || []
})

const handleUserTypeChange = () => {
  form.permissions = []
}
</script>
```

### 字典数据处理

```vue
<template>
  <div>
    <el-select v-model="form.fileType" @change="handleFileTypeChange">
      <el-option
        v-for="dict in enabledFileTypes"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      />
    </el-select>
    
    <div v-if="selectedFileTypeInfo" class="mt-2">
      <p>已选择: {{ selectedFileTypeInfo.label }}</p>
      <p>状态: {{ selectedFileTypeInfo.status === '0' ? '启用' : '禁用' }}</p>
    </div>
  </div>
</template>

<script setup>
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  fileType: ''
})

const { sys_file_type, dictLoading } = useDict(DictTypes.sys_file_type)

// 过滤启用的文件类型
const enabledFileTypes = computed(() => {
  return sys_file_type.value.filter(dict => dict.status === '0')
})

// 获取选中文件类型的详细信息
const selectedFileTypeInfo = computed(() => {
  return sys_file_type.value.find(dict => dict.value === form.fileType)
})

const handleFileTypeChange = (value) => {
  console.log('文件类型变更:', value)
}
</script>
```

## 📚 API 参考

### useDict 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| ...args | string[] | 需要获取的字典类型数组 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| dictLoading | Ref\<boolean\> | 字典加载状态，false代表加载完毕 |
| [dictType] | Ref\<DictItem[]\> | 动态属性，每个字典类型对应一个响应式数组 |

### DictItem 类型

```typescript
interface DictItem {
  label: string      // 显示标签
  value: string      // 实际值
  status: string     // 状态 ('0': 启用, '1': 禁用)
  elTagType: string  // Element Plus 标签类型
  elTagClass: string // 自定义CSS类
}
```

### 字典类型定义

```typescript
interface DataResult {
  dictLoading: Ref<boolean>
  [key: string]: DictItem[]
}
```

## 🎯 最佳实践

### 缓存策略

1. **合理利用缓存**: 字典数据会自动缓存，避免重复请求相同字典
2. **缓存清理**: 必要时可手动清理字典缓存
3. **预加载**: 对于常用字典，可在应用启动时预加载

### 性能优化

1. **按需加载**: 只获取当前需要的字典类型
2. **并行请求**: 多个字典会并行加载，提高加载效率
3. **错误隔离**: 单个字典加载失败不会影响其他字典

### 使用建议

1. **统一管理**: 使用 `DictTypes` 枚举统一管理字典类型
2. **状态检查**: 使用 `dictLoading` 提供友好的加载体验
3. **异常处理**: 妥善处理字典数据不存在的情况

### 组件封装

```vue
<!-- DictSelect.vue -->
<template>
  <el-select 
    v-model="modelValue" 
    v-loading="dictLoading"
    @update:modelValue="$emit('update:modelValue', $event)">
    <el-option
      v-for="dict in dictData"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
      :disabled="dict.status === '1'"
    />
  </el-select>
</template>

<script setup>
import { useDict } from '@/composables/useDict'

interface Props {
  modelValue: string
  dictType: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { dictLoading, ...dictData } = useDict(props.dictType)
const currentDict = computed(() => dictData[props.dictType]?.value || [])
</script>
```
