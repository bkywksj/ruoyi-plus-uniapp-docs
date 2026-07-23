# DictTag 字典标签

基于字典数据的标签组件，支持多种显示样式和自动数据获取。

## 基础用法

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

## 组件实现

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

## 增强功能

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

## 使用示例

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

## 常见问题

### 1. 字典标签显示为空或显示原始值

**问题描述**

字典标签组件渲染后显示为空白或只显示原始的字典值（如 "0"、"1"），而不是对应的中文标签文本。

**问题原因**

- 字典类型名称配置错误，与后端不匹配
- 字典数据尚未加载完成，组件已经渲染
- 字典值类型不匹配（数字与字符串）
- 字典数据接口返回格式不符合预期

**解决方案**

```vue
<template>
  <div>
    <!-- 方案1: 添加加载状态判断 -->
    <DictTag
      v-if="dictLoaded"
      dict-type="sys_user_status"
      :value="userStatus"
    />
    <el-skeleton v-else :rows="1" animated />

    <!-- 方案2: 使用 v-show 保持 DOM 结构 -->
    <div v-show="!loading">
      <DictTag
        dict-type="sys_user_status"
        :value="userStatus"
      />
    </div>

    <!-- 方案3: 确保值类型统一为字符串 -->
    <DictTag
      dict-type="sys_user_status"
      :value="String(userStatus)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDictStore } from '@/stores/dict'

const userStatus = ref('0')
const dictLoaded = ref(false)
const loading = ref(true)

const dictStore = useDictStore()

onMounted(async () => {
  // 预加载字典数据
  await dictStore.loadDict('sys_user_status')
  dictLoaded.value = true
  loading.value = false
})
</script>
```

**调试技巧**

```typescript
// 检查字典数据是否正确加载
const { dictData, loading } = useDict('sys_user_status')

watch(dictData, (newData) => {
  console.log('字典数据:', newData)
  console.log('字典类型:', Object.keys(newData))
}, { immediate: true })

// 检查值类型
console.log('当前值:', userStatus.value, typeof userStatus.value)
```

### 2. 字典数据加载与组件渲染不同步

**问题描述**

在页面初次加载时，字典组件先渲染后才获取到字典数据，导致短暂的空白或闪烁现象。

**问题原因**

- 字典数据通过异步请求获取，存在网络延迟
- 组件挂载时机早于数据返回时机
- 未使用合适的加载状态控制

**解决方案**

```vue
<template>
  <div class="dict-container">
    <!-- 方案1: 全局字典预加载 -->
    <Suspense>
      <template #default>
        <DictTag dict-type="sys_user_status" :value="status" />
      </template>
      <template #fallback>
        <el-skeleton :rows="1" animated />
      </template>
    </Suspense>

    <!-- 方案2: 使用 loading 状态 -->
    <div class="dict-wrapper">
      <template v-if="!dictLoading">
        <DictTag dict-type="sys_user_status" :value="status" />
      </template>
      <el-skeleton v-else class="dict-skeleton" :rows="1" animated />
    </div>

    <!-- 方案3: 批量预加载多个字典 -->
    <div v-if="allDictsLoaded">
      <DictTag dict-type="sys_user_status" :value="status" />
      <DictTag dict-type="sys_user_sex" :value="sex" />
      <DictTag dict-type="sys_yes_no" :value="enabled" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDictStore } from '@/stores/dict'

const status = ref('0')
const sex = ref('1')
const enabled = ref('Y')

const dictStore = useDictStore()
const dictLoading = ref(true)
const allDictsLoaded = ref(false)

onMounted(async () => {
  // 批量预加载字典
  await Promise.all([
    dictStore.loadDict('sys_user_status'),
    dictStore.loadDict('sys_user_sex'),
    dictStore.loadDict('sys_yes_no')
  ])

  dictLoading.value = false
  allDictsLoaded.value = true
})
</script>

<style scoped>
.dict-skeleton {
  display: inline-block;
  width: 60px;
  height: 22px;
}
</style>
```

**应用级预加载**

```typescript
// main.ts 或 App.vue
import { useDictStore } from '@/stores/dict'

const app = createApp(App)

// 应用启动时预加载常用字典
app.mount('#app')

const dictStore = useDictStore()
dictStore.preloadDicts([
  'sys_user_status',
  'sys_user_sex',
  'sys_yes_no',
  'sys_normal_disable'
])
```

### 3. 多值字典标签分隔符显示异常

**问题描述**

当传入数组值时，多个标签之间的分隔符位置不正确或根本不显示。

**问题原因**

- 分隔符渲染逻辑位于 v-for 循环内部但条件判断有误
- index 变量作用域问题
- 分隔符与标签样式冲突

**解决方案**

```vue
<template>
  <div class="multi-dict-tags">
    <!-- 方案1: 使用 template 包裹 -->
    <template v-for="(item, index) in displayItems" :key="getItemKey(item, index)">
      <el-tag
        :type="getTagType(item)"
        :size="size"
      >
        {{ formatDisplayText(item) }}
      </el-tag>
      <span
        v-if="separator && index < displayItems.length - 1"
        class="dict-separator"
      >
        {{ separator }}
      </span>
    </template>

    <!-- 方案2: 使用 CSS 伪元素 -->
    <div class="tags-with-separator">
      <el-tag
        v-for="(item, index) in displayItems"
        :key="getItemKey(item, index)"
        :type="getTagType(item)"
        class="dict-tag-item"
      >
        {{ formatDisplayText(item) }}
      </el-tag>
    </div>

    <!-- 方案3: 使用 join 方法处理纯文本场景 -->
    <span v-if="textOnly" class="dict-text">
      {{ displayItems.map(item => formatDisplayText(item)).join(separator) }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: string[]
  separator?: string
  textOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  separator: '、',
  textOnly: false
})
</script>

<style scoped>
.dict-separator {
  margin: 0 4px;
  color: var(--el-text-color-secondary);
}

/* 使用 CSS 实现分隔符 */
.tags-with-separator .dict-tag-item:not(:last-child)::after {
  content: '、';
  margin: 0 4px;
  color: var(--el-text-color-secondary);
}

/* 或使用 gap 属性 */
.tags-with-separator {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
```

### 4. 字典标签颜色与后端配置不一致

**问题描述**

后端配置的字典标签颜色（listClass 或 cssClass）在前端没有正确显示，或者显示的颜色与预期不符。

**问题原因**

- 后端 listClass 值与 Element Plus 的 type 值不完全匹配
- 自定义 cssClass 未在前端定义对应样式
- 颜色映射逻辑缺失或不完整

**解决方案**

```vue
<template>
  <DictTag
    dict-type="sys_user_status"
    :value="status"
    :type-mapping="customTypeMapping"
    :color-mapping="customColorMapping"
    :class-mapping="customClassMapping"
  />
</template>

<script setup lang="ts">
const status = ref('0')

// 自定义类型映射（覆盖 listClass）
const customTypeMapping = {
  '0': 'success',
  '1': 'danger',
  '2': 'warning',
  '3': 'info'
}

// 自定义颜色映射（十六进制颜色）
const customColorMapping = {
  '0': '#67c23a',
  '1': '#f56c6c',
  '2': '#e6a23c',
  '3': '#909399'
}

// 自定义 CSS 类映射
const customClassMapping = {
  '0': 'status-normal',
  '1': 'status-disabled',
  '2': 'status-pending'
}
</script>

<style>
/* 全局样式文件中定义 */
.status-normal {
  --el-tag-bg-color: rgba(103, 194, 58, 0.1);
  --el-tag-border-color: rgba(103, 194, 58, 0.2);
  --el-tag-text-color: #67c23a;
}

.status-disabled {
  --el-tag-bg-color: rgba(245, 108, 108, 0.1);
  --el-tag-border-color: rgba(245, 108, 108, 0.2);
  --el-tag-text-color: #f56c6c;
}

.status-pending {
  --el-tag-bg-color: rgba(230, 162, 60, 0.1);
  --el-tag-border-color: rgba(230, 162, 60, 0.2);
  --el-tag-text-color: #e6a23c;
}
</style>
```

**组件内完善颜色映射逻辑**

```typescript
// 在 DictTag 组件中完善 getTagType 方法
const getTagType = (item: any): string => {
  if (!item) return props.type

  const value = getItemValue(item)

  // 优先使用自定义类型映射
  if (props.typeMapping && props.typeMapping[value]) {
    return props.typeMapping[value]
  }

  // 后端 listClass 到 Element Plus type 的映射
  if (item.listClass) {
    const listClassMap: Record<string, string> = {
      'primary': 'primary',
      'success': 'success',
      'info': 'info',
      'warning': 'warning',
      'danger': 'danger',
      'default': 'info',
      // 兼容可能的其他值
      'green': 'success',
      'red': 'danger',
      'yellow': 'warning',
      'blue': 'primary',
      'gray': 'info'
    }
    return listClassMap[item.listClass] || props.type
  }

  return props.type
}
```

### 5. 字典选择器与表单验证冲突

**问题描述**

DictSelect 组件在表单中使用时，清空选择后验证不触发，或者验证消息显示位置不正确。

**问题原因**

- el-select 的 change 事件与 el-form-item 的 validate 触发时机不匹配
- clearable 清空时未正确触发 blur 事件
- 自定义组件未正确透传验证相关属性

**解决方案**

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="用户状态" prop="status">
      <DictSelect
        v-model="formData.status"
        dict-type="sys_user_status"
        placeholder="请选择状态"
        @change="handleStatusChange"
        @clear="handleStatusClear"
      />
    </el-form-item>

    <el-form-item label="用户性别" prop="sex">
      <DictRadio
        v-model="formData.sex"
        dict-type="sys_user_sex"
        @change="() => validateField('sex')"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const formData = reactive({
  status: '',
  sex: ''
})

const formRules: FormRules = {
  status: [
    { required: true, message: '请选择用户状态', trigger: ['change', 'blur'] }
  ],
  sex: [
    { required: true, message: '请选择用户性别', trigger: 'change' }
  ]
}

// 手动触发字段验证
const validateField = (field: string) => {
  formRef.value?.validateField(field)
}

// 状态变化时触发验证
const handleStatusChange = (value: string | undefined) => {
  // 延迟验证确保值已更新
  nextTick(() => {
    validateField('status')
  })
}

// 清空时触发验证
const handleStatusClear = () => {
  nextTick(() => {
    validateField('status')
  })
}
</script>
```

**在 DictSelect 组件中增强验证支持**

```vue
<!-- components/DictSelect/index.vue -->
<template>
  <el-select
    v-model="currentValue"
    v-bind="$attrs"
    :validate-event="validateEvent"
    @change="handleChange"
    @clear="handleClear"
    @blur="handleBlur"
  >
    <!-- 选项内容 -->
  </el-select>
</template>

<script setup lang="ts">
interface Props {
  // ... 其他属性
  validateEvent?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined, item?: DictData): void
  (e: 'clear'): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  validateEvent: true
})

const emit = defineEmits<Emits>()

const handleClear = () => {
  emit('update:modelValue', undefined)
  emit('clear')
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>
```

### 6. 字典数据缓存与更新同步问题

**问题描述**

后台管理员修改了字典数据后，前端页面仍然显示旧的字典值，需要刷新页面才能看到最新数据。

**问题原因**

- 字典数据被缓存在 Pinia store 中，没有自动更新机制
- 多个浏览器标签页之间缓存不同步
- 没有设置合理的缓存过期策略

**解决方案**

```typescript
// stores/dict.ts
import { defineStore } from 'pinia'

interface DictCacheItem {
  data: DictData[]
  timestamp: number
  expireTime: number
}

export const useDictStore = defineStore('dict', {
  state: () => ({
    dictCache: new Map<string, DictCacheItem>(),
    defaultExpireTime: 5 * 60 * 1000 // 5分钟过期
  }),

  actions: {
    // 获取字典数据（带缓存检查）
    async getDict(dictType: string, forceRefresh = false): Promise<DictData[]> {
      const cached = this.dictCache.get(dictType)
      const now = Date.now()

      // 检查缓存是否有效
      if (!forceRefresh && cached && now < cached.timestamp + cached.expireTime) {
        return cached.data
      }

      // 从服务器获取最新数据
      const data = await this.fetchDictFromServer(dictType)

      // 更新缓存
      this.dictCache.set(dictType, {
        data,
        timestamp: now,
        expireTime: this.defaultExpireTime
      })

      return data
    },

    // 强制刷新指定字典
    async refreshDict(dictType: string): Promise<DictData[]> {
      return this.getDict(dictType, true)
    },

    // 刷新所有字典
    async refreshAllDicts(): Promise<void> {
      const dictTypes = Array.from(this.dictCache.keys())
      await Promise.all(dictTypes.map(type => this.refreshDict(type)))
    },

    // 清除指定字典缓存
    clearDictCache(dictType: string): void {
      this.dictCache.delete(dictType)
    },

    // 清除所有缓存
    clearAllCache(): void {
      this.dictCache.clear()
    }
  }
})
```

**跨标签页同步**

```typescript
// composables/use-dict-sync.ts
import { onMounted, onUnmounted } from 'vue'
import { useDictStore } from '@/stores/dict'

export function useDictSync() {
  const dictStore = useDictStore()
  let channel: BroadcastChannel | null = null

  onMounted(() => {
    // 创建广播通道
    channel = new BroadcastChannel('dict-sync-channel')

    // 监听其他标签页的更新通知
    channel.onmessage = (event) => {
      const { type, dictType } = event.data

      if (type === 'dict-updated') {
        // 刷新指定字典
        dictStore.refreshDict(dictType)
      } else if (type === 'dict-all-updated') {
        // 刷新所有字典
        dictStore.refreshAllDicts()
      }
    }
  })

  onUnmounted(() => {
    channel?.close()
  })

  // 通知其他标签页字典已更新
  const notifyDictUpdate = (dictType?: string) => {
    channel?.postMessage({
      type: dictType ? 'dict-updated' : 'dict-all-updated',
      dictType
    })
  }

  return {
    notifyDictUpdate
  }
}
```

**在管理页面使用**

```vue
<template>
  <div class="dict-management">
    <!-- 字典管理表单 -->
    <el-button @click="handleSave">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { useDictSync } from '@/composables/use-dict-sync'
import { useDictStore } from '@/stores/dict'

const dictStore = useDictStore()
const { notifyDictUpdate } = useDictSync()

const handleSave = async () => {
  // 保存字典数据到后端
  await saveDictData()

  // 刷新本地缓存
  await dictStore.refreshDict('sys_user_status')

  // 通知其他标签页更新
  notifyDictUpdate('sys_user_status')

  ElMessage.success('保存成功')
}
</script>
```

### 7. 虚拟列表中字典标签的性能问题

**问题描述**

在大数据量表格（使用虚拟滚动）中，每行都有字典标签组件，滚动时出现卡顿或标签闪烁。

**问题原因**

- 每个 DictTag 组件都独立调用 useDict，造成重复的响应式开销
- 虚拟滚动快速创建/销毁组件，字典查找频繁
- 没有对字典查找结果进行缓存优化

**解决方案**

```vue
<template>
  <el-table-v2
    :columns="columns"
    :data="tableData"
    :width="800"
    :height="600"
  >
    <template #cell="{ column, row }">
      <template v-if="column.key === 'status'">
        <!-- 使用优化版本的字典标签 -->
        <DictTagOptimized
          :dict-map="statusDictMap"
          :value="row.status"
        />
      </template>
    </template>
  </el-table-v2>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDictStore } from '@/stores/dict'

const dictStore = useDictStore()

// 预先获取并转换为 Map 结构
const statusDictMap = ref<Map<string, DictData>>(new Map())

onMounted(async () => {
  const dictList = await dictStore.getDict('sys_user_status')
  // 转换为 Map 以实现 O(1) 查找
  statusDictMap.value = new Map(
    dictList.map(item => [item.dictValue, item])
  )
})
</script>
```

**优化版 DictTag 组件**

```vue
<!-- components/DictTagOptimized/index.vue -->
<template>
  <el-tag
    v-if="dictItem"
    :type="tagType"
    :size="size"
  >
    {{ dictItem.dictLabel }}
  </el-tag>
  <span v-else class="dict-tag-empty">{{ emptyText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  dictMap: Map<string, DictData>
  value: string | number
  size?: 'large' | 'default' | 'small'
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  emptyText: '-'
})

// 直接从 Map 中查找，O(1) 时间复杂度
const dictItem = computed(() => {
  return props.dictMap.get(String(props.value)) || null
})

const tagType = computed(() => {
  if (!dictItem.value) return 'info'

  const typeMap: Record<string, string> = {
    'primary': 'primary',
    'success': 'success',
    'info': 'info',
    'warning': 'warning',
    'danger': 'danger'
  }

  return typeMap[dictItem.value.listClass || ''] || 'info'
})
</script>
```

**使用 memoization 优化**

```typescript
// utils/dict-memo.ts
import { memoize } from 'lodash-es'

// 缓存字典查找结果
export const memoizedGetDictLabel = memoize(
  (dictType: string, value: string, dictData: Record<string, DictData[]>) => {
    const items = dictData[dictType]
    if (!items) return null
    return items.find(item => item.dictValue === value)?.dictLabel || null
  },
  // 自定义缓存 key
  (dictType, value, dictData) => `${dictType}:${value}:${Object.keys(dictData).length}`
)

// 清除缓存
export const clearDictMemoCache = () => {
  memoizedGetDictLabel.cache.clear?.()
}
```

### 8. 字典组件的国际化支持问题

**问题描述**

系统需要支持多语言，但字典标签只显示中文，切换语言后字典内容没有变化。

**问题原因**

- 字典数据存储在后端，默认只有中文标签
- 前端没有建立字典值与国际化 key 的映射关系
- 语言切换时没有重新加载对应语言的字典

**解决方案**

```vue
<template>
  <DictTag
    dict-type="sys_user_status"
    :value="status"
    :label-formatter="formatDictLabel"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 格式化字典标签（支持国际化）
const formatDictLabel = (item: DictData) => {
  // 优先使用国际化 key
  const i18nKey = `dict.${item.dictType}.${item.dictValue}`
  const translated = t(i18nKey)

  // 如果翻译 key 存在则使用翻译，否则使用原始标签
  return translated !== i18nKey ? translated : item.dictLabel
}
</script>
```

**国际化语言文件配置**

```typescript
// locales/zh-CN.ts
export default {
  dict: {
    sys_user_status: {
      '0': '正常',
      '1': '停用'
    },
    sys_user_sex: {
      '0': '男',
      '1': '女',
      '2': '未知'
    }
  }
}

// locales/en-US.ts
export default {
  dict: {
    sys_user_status: {
      '0': 'Normal',
      '1': 'Disabled'
    },
    sys_user_sex: {
      '0': 'Male',
      '1': 'Female',
      '2': 'Unknown'
    }
  }
}
```

**封装支持国际化的字典组件**

```vue
<!-- components/DictTagI18n/index.vue -->
<template>
  <el-tag
    v-if="displayItem"
    :type="getTagType(displayItem)"
    :size="size"
  >
    {{ getLocalizedLabel(displayItem) }}
  </el-tag>
  <span v-else class="dict-tag-empty">{{ emptyText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDict } from '@/composables/use-dict'

interface Props {
  dictType: string
  value: string | number
  size?: 'large' | 'default' | 'small'
  emptyText?: string
  useI18n?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  emptyText: '-',
  useI18n: true
})

const { t, te } = useI18n()
const { dictData, loading } = useDict(props.dictType)

const displayItem = computed(() => {
  if (loading.value || !dictData.value[props.dictType]) {
    return null
  }
  const items = dictData.value[props.dictType]
  return items.find(item => item.dictValue === String(props.value)) || null
})

const getLocalizedLabel = (item: DictData): string => {
  if (!props.useI18n) {
    return item.dictLabel
  }

  const i18nKey = `dict.${item.dictType}.${item.dictValue}`

  // 检查翻译 key 是否存在
  if (te(i18nKey)) {
    return t(i18nKey)
  }

  // 回退到原始标签
  return item.dictLabel
}

const getTagType = (item: DictData): string => {
  const typeMap: Record<string, string> = {
    'primary': 'primary',
    'success': 'success',
    'info': 'info',
    'warning': 'warning',
    'danger': 'danger'
  }
  return typeMap[item.listClass || ''] || 'info'
}
</script>
```

**监听语言变化刷新字典**

```typescript
// composables/use-dict-i18n.ts
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDictStore } from '@/stores/dict'

export function useDictI18n() {
  const { locale } = useI18n()
  const dictStore = useDictStore()

  // 监听语言变化
  watch(locale, async (newLocale) => {
    // 清除旧缓存
    dictStore.clearAllCache()

    // 如果后端支持多语言字典，可以携带语言参数重新请求
    // await dictStore.loadDictsByLocale(newLocale)

    // 或者触发组件重新渲染
    dictStore.$patch({ refreshKey: Date.now() })
  })
}
```

DictTag及相关字典组件为Vue3应用提供了完整的字典数据展示和选择解决方案，支持多种样式配置和自动数据获取，提升了开发效率和用户体验。
