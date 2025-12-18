# DictTag 字典标签

基于字典数据的标签组件，支持多种显示样式和自动数据获取。

## 📋 基础用法

### 简单使用

```vue
<template>
  <div>
    <!-- 用户状态标签 -->
    <DictTag
      dict-type="sys_user_status"
      :value="userStatus"
    />

    <!-- 性别标签 -->
    <DictTag
      dict-type="sys_user_sex"
      :value="userSex"
      type="info"
    />

    <!-- 是否标签 -->
    <DictTag
      dict-type="sys_yes_no"
      :value="isEnabled"
      :show-value="false"
    />
  </div>
</template>

<script setup lang="ts">
const userStatus = ref('0') // 0-正常 1-停用
const userSex = ref('1')    // 0-男 1-女 2-未知
const isEnabled = ref('Y')  // Y-是 N-否
</script>
```

### 多值显示

```vue
<template>
  <div>
    <!-- 单个值 -->
    <DictTag
      dict-type="sys_user_status"
      value="0"
    />

    <!-- 多个值 -->
    <DictTag
      dict-type="sys_user_status"
      :value="['0', '1']"
      separator="、"
    />

    <!-- 数组对象 -->
    <DictTag
      dict-type="sys_role"
      :value="userRoles"
      value-key="roleId"
      label-key="roleName"
    />
  </div>
</template>

<script setup lang="ts">
const userRoles = ref([
  { roleId: '1', roleName: '管理员' },
  { roleId: '2', roleName: '普通用户' }
])
</script>
```

## 🎯 组件实现

### DictTag 组件

```vue
<!-- components/DictTag/index.vue -->
<template>
  <span class="dict-tag">
    <!-- 单个标签 -->
    <template v-if="!isMultiple">
      <el-tag
        v-if="displayItem"
        :type="getTagType(displayItem)"
        :size="size"
        :effect="effect"
        :round="round"
        :closable="closable"
        :disable-transitions="disableTransitions"
        :color="getTagColor(displayItem)"
        :class="getTagClass(displayItem)"
        @close="handleClose"
      >
        <slot :item="displayItem" :value="currentValue">
          {{ formatDisplayText(displayItem) }}
        </slot>
      </el-tag>
      <span v-else class="dict-tag-empty">
        {{ emptyText }}
      </span>
    </template>

    <!-- 多个标签 -->
    <template v-else>
      <template v-if="displayItems.length > 0">
        <el-tag
          v-for="(item, index) in displayItems"
          :key="getItemKey(item, index)"
          :type="getTagType(item)"
          :size="size"
          :effect="effect"
          :round="round"
          :closable="closable"
          :disable-transitions="disableTransitions"
          :color="getTagColor(item)"
          :class="getTagClass(item)"
          @close="() => handleClose(item, index)"
        >
          <slot :item="item" :value="getItemValue(item)" :index="index">
            {{ formatDisplayText(item) }}
          </slot>
        </el-tag>
        <span v-if="separator && index < displayItems.length - 1" class="separator">
          {{ separator }}
        </span>
      </template>
      <span v-else class="dict-tag-empty">
        {{ emptyText }}
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { useDict } from '@/composables/use-dict'

interface DictData {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault: 'Y' | 'N'
  status: '0' | '1'
  remark?: string
}

interface Props {
  // 字典配置
  dictType: string
  value?: string | number | string[] | number[] | any[]

  // 多值配置
  valueKey?: string
  labelKey?: string
  separator?: string

  // 显示配置
  showValue?: boolean
  showLabel?: boolean
  emptyText?: string

  // 标签样式
  type?: 'success' | 'info' | 'warning' | 'danger'
  size?: 'large' | 'default' | 'small'
  effect?: 'dark' | 'light' | 'plain'
  round?: boolean
  closable?: boolean
  disableTransitions?: boolean

  // 自定义样式
  colorMapping?: Record<string, string>
  typeMapping?: Record<string, string>
  classMapping?: Record<string, string>
}

interface Emits {
  (e: 'close', item: any, index?: number): void
}

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
  showLabel: true,
  emptyText: '-',
  type: 'primary',
  size: 'default',
  effect: 'light',
  round: false,
  closable: false,
  disableTransitions: false,
  separator: ' '
})

const emit = defineEmits<Emits>()

// 获取字典数据
const { dictData, loading } = useDict(props.dictType)

// 当前值处理
const currentValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return null
  }
  return props.value
})

// 是否多值
const isMultiple = computed(() => {
  return Array.isArray(currentValue.value)
})

// 获取字典项
const getDictItem = (value: string | number): DictData | null => {
  if (loading.value || !dictData.value[props.dictType]) {
    return null
  }

  const items = dictData.value[props.dictType]
  return items.find(item => item.dictValue === String(value)) || null
}

// 单个显示项
const displayItem = computed(() => {
  if (isMultiple.value || currentValue.value === null) {
    return null
  }

  // 如果是对象，直接返回
  if (typeof currentValue.value === 'object') {
    return currentValue.value
  }

  // 查找字典项
  return getDictItem(currentValue.value)
})

// 多个显示项
const displayItems = computed(() => {
  if (!isMultiple.value || !currentValue.value) {
    return []
  }

  const values = currentValue.value as any[]
  return values.map(val => {
    // 如果是对象，直接返回
    if (typeof val === 'object') {
      return val
    }
    // 查找字典项
    return getDictItem(val)
  }).filter(Boolean)
})

// 获取项的键值
const getItemKey = (item: any, index: number): string => {
  if (!item) return String(index)

  if (props.valueKey && item[props.valueKey]) {
    return String(item[props.valueKey])
  }

  if (item.dictValue) {
    return item.dictValue
  }

  return String(index)
}

// 获取项的值
const getItemValue = (item: any): string => {
  if (!item) return ''

  if (props.valueKey && item[props.valueKey]) {
    return String(item[props.valueKey])
  }

  if (item.dictValue) {
    return item.dictValue
  }

  return String(item)
}

// 格式化显示文本
const formatDisplayText = (item: any): string => {
  if (!item) return props.emptyText

  let text = ''

  // 获取标签文本
  if (props.showLabel) {
    if (props.labelKey && item[props.labelKey]) {
      text = item[props.labelKey]
    } else if (item.dictLabel) {
      text = item.dictLabel
    } else {
      text = String(item)
    }
  }

  // 获取值文本
  if (props.showValue) {
    const value = getItemValue(item)
    if (text) {
      text += ` (${value})`
    } else {
      text = value
    }
  }

  return text || props.emptyText
}

// 获取标签类型
const getTagType = (item: any): string => {
  if (!item) return props.type

  const value = getItemValue(item)

  // 自定义类型映射
  if (props.typeMapping && props.typeMapping[value]) {
    return props.typeMapping[value]
  }

  // 根据字典配置的listClass
  if (item.listClass) {
    const classMap: Record<string, string> = {
      'primary': 'primary',
      'success': 'success',
      'info': 'info',
      'warning': 'warning',
      'danger': 'danger',
      'default': 'info'
    }
    return classMap[item.listClass] || props.type
  }

  // 默认类型映射（可根据业务调整）
  const defaultTypeMap: Record<string, string> = {
    '0': 'success',  // 正常
    '1': 'danger',   // 停用
    'Y': 'success',  // 是
    'N': 'info',     // 否
  }

  return defaultTypeMap[value] || props.type
}

// 获取标签颜色
const getTagColor = (item: any): string | undefined => {
  if (!item) return undefined

  const value = getItemValue(item)

  // 自定义颜色映射
  if (props.colorMapping && props.colorMapping[value]) {
    return props.colorMapping[value]
  }

  // 根据字典配置的cssClass
  if (item.cssClass) {
    // 这里可以根据cssClass返回对应的颜色
    return undefined
  }

  return undefined
}

// 获取标签CSS类
const getTagClass = (item: any): string => {
  if (!item) return ''

  const value = getItemValue(item)
  const classes: string[] = []

  // 自定义类映射
  if (props.classMapping && props.classMapping[value]) {
    classes.push(props.classMapping[value])
  }

  // 字典配置的CSS类
  if (item.cssClass) {
    classes.push(item.cssClass)
  }

  // 字典配置的List类
  if (item.listClass) {
    classes.push(`dict-${item.listClass}`)
  }

  return classes.join(' ')
}

// 关闭处理
const handleClose = (item?: any, index?: number) => {
  emit('close', item, index)
}
</script>

```

## 🔧 增强功能

### 字典选择器

```vue
<!-- components/DictSelect/index.vue -->
<template>
  <el-select
    v-model="currentValue"
    v-bind="$attrs"
    :loading="loading"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    @change="handleChange"
  >
    <el-option
      v-for="item in options"
      :key="item.dictValue"
      :label="item.dictLabel"
      :value="item.dictValue"
      :disabled="item.status === '1'"
    >
      <div class="dict-option">
        <span class="option-label">{{ item.dictLabel }}</span>
        <el-tag
          v-if="showTag"
          :type="getOptionType(item)"
          size="small"
          class="option-tag"
        >
          {{ item.dictValue }}
        </el-tag>
      </div>
    </el-option>

    <template v-if="showEmpty && options.length === 0" #empty>
      <div class="empty-data">
        <el-icon><DocumentRemove /></el-icon>
        <span>暂无数据</span>
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts">
interface Props {
  dictType: string
  modelValue?: string | number
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  showTag?: boolean
  showEmpty?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined, item?: DictData): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  clearable: true,
  filterable: true,
  showTag: false,
  showEmpty: true
})

const emit = defineEmits<Emits>()

// 获取字典数据
const { dictData, loading } = useDict(props.dictType)

// 选项列表
const options = computed(() => {
  if (loading.value || !dictData.value[props.dictType]) {
    return []
  }

  return dictData.value[props.dictType]
    .filter(item => item.status === '0') // 只显示正常状态
    .sort((a, b) => a.dictSort - b.dictSort) // 按排序字段排序
})

// 双向绑定
const currentValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 获取选项类型
const getOptionType = (item: DictData): string => {
  const typeMap: Record<string, string> = {
    '0': 'success',
    '1': 'danger',
    'Y': 'success',
    'N': 'info'
  }
  return typeMap[item.dictValue] || 'info'
}

// 值变化处理
const handleChange = (value: string | number | undefined) => {
  const selectedItem = options.value.find(item => item.dictValue === String(value))
  emit('change', value, selectedItem)
}
</script>

```

### 字典单选框组

```vue
<!-- components/DictRadio/index.vue -->
<template>
  <el-radio-group
    v-model="currentValue"
    v-bind="$attrs"
    @change="handleChange"
  >
    <component
      :is="radioComponent"
      v-for="item in options"
      :key="item.dictValue"
      :value="item.dictValue"
      :disabled="item.status === '1'"
      :border="border"
    >
      {{ item.dictLabel }}
    </component>
  </el-radio-group>
</template>

<script setup lang="ts">
interface Props {
  dictType: string
  modelValue?: string | number
  radioType?: 'radio' | 'button'
  border?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined, item?: DictData): void
}

const props = withDefaults(defineProps<Props>(), {
  radioType: 'radio',
  border: false
})

const emit = defineEmits<Emits>()

// 获取字典数据
const { dictData, loading } = useDict(props.dictType)

// 单选框组件类型
const radioComponent = computed(() => {
  return props.radioType === 'button' ? 'el-radio-button' : 'el-radio'
})

// 选项列表
const options = computed(() => {
  if (loading.value || !dictData.value[props.dictType]) {
    return []
  }

  return dictData.value[props.dictType]
    .filter(item => item.status === '0')
    .sort((a, b) => a.dictSort - b.dictSort)
})

// 双向绑定
const currentValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 值变化处理
const handleChange = (value: string | number | undefined) => {
  const selectedItem = options.value.find(item => item.dictValue === String(value))
  emit('change', value, selectedItem)
}
</script>
```

### 字典复选框组

```vue
<!-- components/DictCheckbox/index.vue -->
<template>
  <el-checkbox-group
    v-model="currentValue"
    v-bind="$attrs"
    @change="handleChange"
  >
    <component
      :is="checkboxComponent"
      v-for="item in options"
      :key="item.dictValue"
      :value="item.dictValue"
      :disabled="item.status === '1'"
      :border="border"
    >
      {{ item.dictLabel }}
    </component>
  </el-checkbox-group>
</template>

<script setup lang="ts">
interface Props {
  dictType: string
  modelValue?: (string | number)[]
  checkboxType?: 'checkbox' | 'button'
  border?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: (string | number)[]): void
  (e: 'change', value: (string | number)[], items: DictData[]): void
}

const props = withDefaults(defineProps<Props>(), {
  checkboxType: 'checkbox',
  border: false,
  modelValue: () => []
})

const emit = defineEmits<Emits>()

// 获取字典数据
const { dictData, loading } = useDict(props.dictType)

// 复选框组件类型
const checkboxComponent = computed(() => {
  return props.checkboxType === 'button' ? 'el-checkbox-button' : 'el-checkbox'
})

// 选项列表
const options = computed(() => {
  if (loading.value || !dictData.value[props.dictType]) {
    return []
  }

  return dictData.value[props.dictType]
    .filter(item => item.status === '0')
    .sort((a, b) => a.dictSort - b.dictSort)
})

// 双向绑定
const currentValue = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

// 值变化处理
const handleChange = (value: (string | number)[]) => {
  const selectedItems = options.value.filter(item =>
    value.includes(item.dictValue)
  )
  emit('change', value, selectedItems)
}
</script>
```

## 📊 使用示例

### 表格中使用

```vue
<template>
  <el-table :data="tableData">
    <el-table-column prop="username" label="用户名" />

    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <DictTag
          dict-type="sys_user_status"
          :value="row.status"
        />
      </template>
    </el-table-column>

    <el-table-column prop="sex" label="性别">
      <template #default="{ row }">
        <DictTag
          dict-type="sys_user_sex"
          :value="row.sex"
          type="info"
          size="small"
        />
      </template>
    </el-table-column>

    <el-table-column prop="roles" label="角色">
      <template #default="{ row }">
        <DictTag
          dict-type="sys_role"
          :value="row.roleIds"
          separator="、"
        />
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 表单中使用

```vue
<template>
  <el-form :model="formData">
    <el-form-item label="状态" prop="status">
      <DictSelect
        v-model="formData.status"
        dict-type="sys_user_status"
        placeholder="请选择状态"
      />
    </el-form-item>

    <el-form-item label="性别" prop="sex">
      <DictRadio
        v-model="formData.sex"
        dict-type="sys_user_sex"
        radio-type="button"
      />
    </el-form-item>

    <el-form-item label="权限" prop="permissions">
      <DictCheckbox
        v-model="formData.permissions"
        dict-type="sys_permission"
        checkbox-type="button"
      />
    </el-form-item>
  </el-form>
</template>
```

DictTag及相关字典组件为Vue3应用提供了完整的字典数据展示和选择解决方案，支持多种样式配置和自动数据获取，提升了开发效率和用户体验。