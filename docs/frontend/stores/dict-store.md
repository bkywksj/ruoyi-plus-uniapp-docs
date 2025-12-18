# 字典数据状态管理 useDictStore

## 介绍

字典数据状态管理(`useDictStore`)是基于 Pinia 的字典数据管理模块，提供统一的字典数据存储、访问和转换功能。

**核心特性:**

- **集中存储** - 使用 Map 数据结构集中管理所有字典数据
- **快速访问** - 提供多种查询方法，支持按 key 或直接传入数据查询
- **标签转换** - 支持值与显示文本的双向转换
- **动态管理** - 支持运行时动态添加、更新和删除字典数据
- **类型安全** - 完整的 TypeScript 类型支持

## 状态定义

### 字典集合

```typescript
/**
 * 字典数据集合
 * 使用 Map 存储多个字典数据，key 为字典类型，value 为字典选项数组
 */
const dict = ref<Map<string, DictItem[]>>(new Map())
```

**数据结构示例:**

```typescript
{
  'sys_user_gender': [
    { label: '男', value: '0', elTagType: 'primary' },
    { label: '女', value: '1', elTagType: 'success' },
    { label: '未知', value: '2', elTagType: 'info' }
  ],
  'sys_enable_status': [
    { label: '正常', value: '0', elTagType: 'success' },
    { label: '停用', value: '1', elTagType: 'danger' }
  ]
}
```

### 字典项接口

```typescript
/**
 * 字典项接口
 */
declare interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element UI Tag 组件的类型 */
  elTagType?: ElTagType
  /** Element UI Tag 组件的自定义类名 */
  elTagClass?: string
}

type ElTagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'
```

## 核心方法

### 字典访问

#### getDict - 获取字典

```typescript
/**
 * 获取字典
 * @param key 字典key
 * @returns 字典数据数组或null
 */
const getDict = (key: string): DictItem[] | null => {
  if (!key) return null
  return dict.value.get(key) || null
}
```

#### getDictItem - 获取完整字典项

```typescript
/**
 * 获取字典项的完整对象
 * @param keyOrData 字典类型或字典数据
 * @param value 字典值
 * @returns 完整的字典项对象或null
 */
const getDictItem = (keyOrData: string | DictItem[], value: string | number): DictItem | null => {
  let dictData: DictItem[] | undefined

  if (typeof keyOrData === 'string') {
    dictData = getDict(keyOrData)
  } else {
    dictData = keyOrData
  }

  if (!dictData) return null
  return dictData.find((item) => item.value === value) || null
}
```

### 字典设置

#### setDict - 设置字典

```typescript
/**
 * 设置字典
 * @param key 字典key
 * @param value 字典value
 * @returns 是否设置成功
 */
const setDict = (key: string, value: DictItem[]): boolean => {
  if (!key) return false
  try {
    dict.value.set(key, value)
    return true
  } catch (e) {
    console.error('设置字典时发生错误:', e)
    return false
  }
}
```

### 标签转换

#### getDictLabel - 获取标签

```typescript
/**
 * 根据字典类型或字典数据和值获取标签
 * @param keyOrData 字典类型或字典数据
 * @param value 字典值
 * @returns 对应的标签名
 */
const getDictLabel = (keyOrData: string | Ref<DictItem[]> | DictItem[], value: string | number): string => {
  let dictData: Ref<DictItem[]> | undefined

  if (typeof keyOrData === 'string') {
    dictData = ref(getDict(keyOrData))
  } else if (isRef(keyOrData)) {
    dictData = keyOrData
  } else {
    dictData = ref(keyOrData)
  }

  if (!dictData) return ''
  const item = dictData.value.find((item) => item.value === String(value))
  return item ? item.label : ''
}
```

#### getDictLabels - 批量获取标签

```typescript
/**
 * 批量获取字典标签
 * @param keyOrData 字典类型或字典数据
 * @param values 字典值数组
 * @returns 对应的标签数组
 */
const getDictLabels = (keyOrData: string | Ref<DictItem[]>, values: (string | number)[]): string[] => {
  if (!values || values.length === 0) return []

  let dictData: Ref<DictItem[]> | undefined
  if (typeof keyOrData === 'string') {
    dictData = ref(getDict(keyOrData))
  } else {
    dictData = keyOrData
  }

  if (!dictData) return values.map(() => '')

  return values.map((value) => {
    const item = dictData.value.find((item) => item.value === value)
    return item ? item.label : ''
  })
}
```

#### getDictValue - 获取值

```typescript
/**
 * 根据标签获取字典值
 * @param key 字典类型
 * @param label 字典标签
 * @returns 对应的字典值
 */
const getDictValue = (key: string, label: string): string | number | null => {
  const dictData = getDict(key)
  if (!dictData) return null
  const item = dictData.find((item) => item.label === label)
  return item ? item.value : null
}
```

### 字典管理

#### removeDict - 删除字典

```typescript
/**
 * 删除字典
 */
const removeDict = (key: string): boolean => {
  if (!key) return false
  try {
    return dict.value.delete(key)
  } catch (e) {
    console.error('删除字典时发生错误:', e)
    return false
  }
}
```

#### cleanDict - 清空字典

```typescript
/**
 * 清空所有字典数据
 */
const cleanDict = (): void => {
  dict.value.clear()
}
```

## 基本用法

### 1. 在表单中使用

```vue
<template>
  <el-form :model="form">
    <!-- 单选下拉框 -->
    <el-form-item label="性别">
      <el-select v-model="form.gender" placeholder="请选择性别">
        <el-option
          v-for="dict in genderOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </el-form-item>

    <!-- 单选框组 -->
    <el-form-item label="状态">
      <el-radio-group v-model="form.status">
        <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

const form = ref({
  gender: '',
  status: '0',
})

// 字典选项
const genderOptions = computed(() => dictStore.getDict('sys_user_gender') || [])
const statusOptions = computed(() => dictStore.getDict('sys_enable_status') || [])
</script>
```

**使用说明:**

- 使用 `computed` 包装字典数据，确保响应式更新
- 提供默认值 `|| []`，避免字典未加载时报错

### 2. 在表格中显示

```vue
<template>
  <el-table :data="tableData">
    <!-- 普通文本显示 -->
    <el-table-column label="性别" prop="gender">
      <template #default="{ row }">
        {{ dictStore.getDictLabel('sys_user_gender', row.gender) }}
      </template>
    </el-table-column>

    <!-- Tag 标签显示 -->
    <el-table-column label="状态" prop="status">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ dictStore.getDictLabel('sys_enable_status', row.status) }}
        </el-tag>
      </template>
    </el-table-column>

    <!-- 多选标签显示 -->
    <el-table-column label="权限" prop="permissions">
      <template #default="{ row }">
        <el-tag
          v-for="label in dictStore.getDictLabels('sys_permission', row.permissions)"
          :key="label"
          style="margin-right: 5px"
        >
          {{ label }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

const tableData = ref([
  { id: 1, name: '张三', gender: '0', status: '0', permissions: ['1', '2', '3'] },
  { id: 2, name: '李四', gender: '1', status: '1', permissions: ['2', '3'] }
])

const getStatusType = (status: string) => {
  const item = dictStore.getDictItem('sys_enable_status', status)
  return item?.elTagType || 'info'
}
</script>
```

### 3. 动态加载字典

```vue
<template>
  <div v-loading="loading">
    <el-select v-model="selectedType">
      <el-option
        v-for="dict in typeOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/data'

const dictStore = useDictStore()
const loading = ref(false)
const selectedType = ref('')

const typeOptions = computed(() => dictStore.getDict('sys_user_type') || [])

const loadDictData = async () => {
  loading.value = true
  try {
    const [err, data] = await getDictData('sys_user_type')
    if (!err && data) {
      dictStore.setDict('sys_user_type', data)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDictData()
})
</script>
```

### 4. 批量初始化字典

```typescript
// src/composables/useDict.ts
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/data'

/**
 * 批量加载字典
 */
export const useBatchDict = async (dictTypes: string[]) => {
  const dictStore = useDictStore()

  const loadPromises = dictTypes.map(async (type) => {
    if (dictStore.getDict(type)) return

    const [err, data] = await getDictData(type)
    if (!err && data) {
      dictStore.setDict(type, data)
    }
  })

  await Promise.all(loadPromises)
}

// 在 App.vue 中使用
onMounted(async () => {
  await useBatchDict([
    'sys_user_gender',
    'sys_enable_status',
    'sys_yes_no',
    'sys_menu_type'
  ])
})
```

### 5. 字典过滤和排序

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 过滤: 只显示启用的状态
const enabledStatus = computed(() => {
  const allStatus = dictStore.getDict('sys_status')
  if (!allStatus) return []
  return allStatus.filter(item => item.status !== 'disabled')
})

// 排序: 按标签字母排序
const sortedPriority = computed(() => {
  const priority = dictStore.getDict('sys_priority')
  if (!priority) return []
  return [...priority].sort((a, b) => a.label.localeCompare(b.label))
})
</script>
```

### 6. 级联字典

```vue
<template>
  <el-form :model="form">
    <el-form-item label="省份">
      <el-select v-model="form.province" @change="handleProvinceChange">
        <el-option
          v-for="dict in provinceOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="城市">
      <el-select v-model="form.city" :disabled="!form.province">
        <el-option
          v-for="dict in cityOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getCityDict } from '@/api/system/dict/area'

const dictStore = useDictStore()

const form = ref({ province: '', city: '' })

const provinceOptions = computed(() => dictStore.getDict('sys_province') || [])

const cityOptions = computed(() => {
  if (!form.value.province) return []
  return dictStore.getDict(`sys_city_${form.value.province}`) || []
})

const handleProvinceChange = async (provinceId: string) => {
  form.value.city = ''

  const [err, data] = await getCityDict(provinceId)
  if (!err && data) {
    dictStore.setDict(`sys_city_${provinceId}`, data)
  }
}
</script>
```

## 常见字典类型

### 系统通用字典

```typescript
// 是/否
dictStore.setDict('sys_yes_no', [
  { label: '是', value: '1', elTagType: 'success' },
  { label: '否', value: '0', elTagType: 'info' }
])

// 启用状态
dictStore.setDict('sys_enable_status', [
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' }
])

// 用户性别
dictStore.setDict('sys_user_gender', [
  { label: '男', value: '0', elTagType: 'primary' },
  { label: '女', value: '1', elTagType: 'success' },
  { label: '未知', value: '2', elTagType: 'info' }
])

// 菜单类型
dictStore.setDict('sys_menu_type', [
  { label: '目录', value: 'M', elTagType: 'warning' },
  { label: '菜单', value: 'C', elTagType: 'success' },
  { label: '按钮', value: 'F', elTagType: 'info' }
])
```

## 高级用法

### 1. 字典扩展属性

```typescript
// 定义带扩展属性的字典
dictStore.setDict('sys_menu_type', [
  {
    label: '目录',
    value: 'M',
    elTagType: 'warning',
    icon: 'folder',
    color: '#E6A23C',
    description: '一级菜单'
  },
  {
    label: '菜单',
    value: 'C',
    elTagType: 'success',
    icon: 'document',
    color: '#67C23A',
    description: '具体功能页面'
  }
])

// 使用扩展属性
const menuItem = dictStore.getDictItem('sys_menu_type', 'M')
if (menuItem) {
  console.log(menuItem.icon)        // 'folder'
  console.log(menuItem.description) // '一级菜单'
}
```

### 2. 字典缓存策略

```typescript
// src/composables/useDict.ts
export const useSmartDict = () => {
  const dictStore = useDictStore()
  const CACHE_TIME = 30 * 60 * 1000 // 30分钟
  const cacheTimestamps = new Map<string, number>()

  const loadDict = async (dictType: string, force = false) => {
    const existingDict = dictStore.getDict(dictType)
    const cacheTime = cacheTimestamps.get(dictType)
    const now = Date.now()

    // 如果有缓存且未过期，直接返回
    if (existingDict && cacheTime && !force) {
      if (now - cacheTime < CACHE_TIME) return existingDict
    }

    const [err, data] = await getDictData(dictType)
    if (!err && data) {
      dictStore.setDict(dictType, data)
      cacheTimestamps.set(dictType, now)
      return data
    }

    return null
  }

  const refreshDict = async (dictType: string) => {
    return await loadDict(dictType, true)
  }

  return { loadDict, refreshDict }
}
```

### 3. 字典懒加载

```typescript
export const useLazyDict = (dictType: string) => {
  const dictStore = useDictStore()
  const loading = ref(false)
  const loaded = ref(false)

  const dictData = computed(() => dictStore.getDict(dictType) || [])

  const load = async () => {
    if (loaded.value || loading.value) return

    loading.value = true
    try {
      const [err, data] = await getDictData(dictType)
      if (!err && data) {
        dictStore.setDict(dictType, data)
        loaded.value = true
      }
    } finally {
      loading.value = false
    }
  }

  return { dictData, loading, loaded, load }
}

// 使用示例 - 下拉框展开时加载
const genderDict = useLazyDict('sys_user_gender')

const handleVisibleChange = (visible: boolean) => {
  if (visible && !genderDict.loaded.value) {
    genderDict.load()
  }
}
```

### 4. 字典国际化

```typescript
export const useDictI18n = () => {
  const { locale } = useI18n()
  const dictStore = useDictStore()

  const getI18nDict = (dictType: string): DictItem[] => {
    const dict = dictStore.getDict(dictType)
    if (!dict) return []

    return dict.map(item => ({
      ...item,
      label: item.i18n?.[locale.value] || item.label
    }))
  }

  return { getI18nDict }
}

// 字典数据示例（带国际化）
dictStore.setDict('sys_user_gender', [
  {
    label: '男',
    value: '0',
    i18n: { zh_CN: '男', en_US: 'Male' }
  },
  {
    label: '女',
    value: '1',
    i18n: { zh_CN: '女', en_US: 'Female' }
  }
])
```

## 与其他模块协作

### 与 User Store

```typescript
import { useUserStore } from '@/stores/modules/user'
import { useDictStore } from '@/stores/modules/dict'

const userStore = useUserStore()
const dictStore = useDictStore()

// 用户登录后加载权限相关字典
watch(
  () => userStore.token,
  async (token) => {
    if (token) {
      await loadUserDicts()
    } else {
      dictStore.cleanDict()
    }
  }
)

// 根据角色过滤字典项
const roleBasedDict = computed(() => {
  const allRoles = dictStore.getDict('sys_role')
  if (!allRoles) return []

  const userRoles = userStore.roles
  if (userRoles.includes('admin')) {
    return allRoles
  } else {
    return allRoles.filter(role => role.value !== 'admin')
  }
})
```

### 与 API 层

```typescript
// src/api/system/dict/data.ts
export const getDictData = (dictType: string): Promise<Result<DictItem[]>> => {
  return request({
    url: `/system/dict/data/type/${dictType}`,
    method: 'get'
  })
}

export const getBatchDictData = (
  dictTypes: string[]
): Promise<Result<Record<string, DictItem[]>>> => {
  return request({
    url: '/system/dict/data/batch',
    method: 'post',
    data: { dictTypes }
  })
}
```

### 封装字典组件

```vue
<!-- src/components/DictSelect/index.vue -->
<template>
  <el-select v-model="modelValue" :placeholder="placeholder" :disabled="disabled">
    <el-option
      v-for="dict in dictOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/data'

interface Props {
  modelValue: string | number
  dictType: string
  placeholder?: string
  disabled?: boolean
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  autoLoad: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const dictStore = useDictStore()

const dictOptions = computed(() => dictStore.getDict(props.dictType) || [])

const loadDict = async () => {
  if (dictStore.getDict(props.dictType)) return

  const [err, data] = await getDictData(props.dictType)
  if (!err && data) {
    dictStore.setDict(props.dictType, data)
  }
}

onMounted(() => {
  if (props.autoLoad) loadDict()
})
</script>

<!-- 使用封装的组件 -->
<dict-select v-model="form.gender" dict-type="sys_user_gender" placeholder="请选择性别" />
```

## 性能优化

### 1. 懒加载策略

```typescript
// ❌ 不推荐: 一次性加载所有字典
const initAllDicts = async () => {
  const allDictTypes = ['sys_user_gender', 'sys_enable_status', /* ... 50+ */]
  await Promise.all(allDictTypes.map(loadDict))
}

// ✅ 推荐: 只预加载必需字典，其他按需加载
const initEssentialDicts = async () => {
  const essentialDicts = ['sys_user_gender', 'sys_enable_status', 'sys_yes_no']
  await Promise.all(essentialDicts.map(loadDict))
}
```

### 2. 批量请求

```typescript
// ❌ 不推荐: 多次单独请求
await getDictData('sys_user_gender')
await getDictData('sys_enable_status')
await getDictData('sys_yes_no')

// ✅ 推荐: 批量请求
const [err, data] = await getBatchDictData([
  'sys_user_gender',
  'sys_enable_status',
  'sys_yes_no'
])

if (!err && data) {
  Object.entries(data).forEach(([key, value]) => {
    dictStore.setDict(key, value)
  })
}
```

### 3. 内存管理

```typescript
// 记录字典使用时间
const dictUsageTime = new Map<string, number>()

// 清理过期字典
const cleanExpiredDicts = () => {
  const now = Date.now()
  const EXPIRY_TIME = 60 * 60 * 1000 // 1小时

  dictUsageTime.forEach((time, dictType) => {
    if (now - time > EXPIRY_TIME) {
      dictStore.removeDict(dictType)
      dictUsageTime.delete(dictType)
    }
  })
}

// 定期清理
setInterval(cleanExpiredDicts, 10 * 60 * 1000)
```

## API 文档

### 状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `dict` | `Ref<Map<string, DictItem[]>>` | 字典数据集合 |

### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getDict` | `key: string` | `DictItem[] \| null` | 获取指定类型的字典数据 |
| `setDict` | `key: string, value: DictItem[]` | `boolean` | 设置或更新字典数据 |
| `getDictLabel` | `keyOrData, value` | `string` | 根据值获取对应的标签 |
| `getDictLabels` | `keyOrData, values` | `string[]` | 批量获取多个值的标签 |
| `getDictValue` | `key: string, label: string` | `string \| number \| null` | 根据标签获取对应的值 |
| `getDictItem` | `keyOrData, value` | `DictItem \| null` | 获取完整的字典项对象 |
| `removeDict` | `key: string` | `boolean` | 删除指定的字典数据 |
| `cleanDict` | - | `void` | 清空所有字典数据 |

### 类型定义

```typescript
/**
 * 字典项接口
 */
declare interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element UI Tag 组件的类型 */
  elTagType?: ElTagType
  /** Element UI Tag 组件的自定义类名 */
  elTagClass?: string
  /** 扩展属性 */
  [key: string]: any
}

type ElTagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'
```

## 最佳实践

### 1. 命名规范

```typescript
// ✅ 推荐: 统一的命名规则
'sys_user_gender'     // 系统模块_功能_字段
'biz_order_status'    // 业务模块_功能_字段

// ❌ 不推荐
'gender'              // 太简单，容易冲突
'SysUserGender'       // 大小写不统一
```

### 2. 类型安全

```typescript
// 定义字典类型枚举
export enum DictType {
  USER_GENDER = 'sys_user_gender',
  ENABLE_STATUS = 'sys_enable_status',
  YES_NO = 'sys_yes_no'
}

// 使用枚举而非字符串
const genderOptions = dictStore.getDict(DictType.USER_GENDER)
```

### 3. 错误处理

```typescript
// ✅ 推荐: 提供默认值和错误处理
const getDictLabelSafe = (dictType: string, value: string) => {
  try {
    const label = dictStore.getDictLabel(dictType, value)
    return label || '未知'
  } catch (error) {
    console.error(`获取字典标签失败: ${dictType}`, error)
    return '错误'
  }
}

// ✅ 推荐: 检查字典是否存在
const genderOptions = computed(() => {
  const dict = dictStore.getDict('sys_user_gender')
  if (!dict || dict.length === 0) {
    return [{ label: '暂无数据', value: '', disabled: true }]
  }
  return dict
})
```

### 4. 组件封装

```vue
<!-- 封装字典 Tag 组件 -->
<template>
  <el-tag v-if="dictItem" :type="dictItem.elTagType">
    {{ dictItem.label }}
  </el-tag>
  <span v-else>{{ defaultText }}</span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

interface Props {
  dictType: string
  value: string | number
  defaultText?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultText: '-'
})

const dictStore = useDictStore()
const dictItem = computed(() => dictStore.getDictItem(props.dictType, props.value))
</script>

<!-- 使用 -->
<dict-tag dict-type="sys_enable_status" :value="row.status" />
```

## 常见问题

### 1. 字典数据不更新

**问题原因:** 使用了静态数据而非响应式数据

```typescript
// ❌ 错误: 静态赋值
const genderOptions = dictStore.getDict('sys_user_gender')

// ✅ 正确: 使用 computed
const genderOptions = computed(() => dictStore.getDict('sys_user_gender') || [])
```

### 2. 字典标签显示为空

**问题原因:** 字典数据未加载或值类型不匹配

```typescript
// 1. 检查字典是否已加载
const dict = dictStore.getDict('sys_user_gender')
console.log('字典数据:', dict)

// 2. 统一值类型
const getDictLabel = (dictType: string, value: string | number) => {
  return dictStore.getDictLabel(dictType, String(value))
}
```

### 3. 大量字典加载慢

**解决方案:** 只预加载必需字典，其他按需加载

```typescript
// 预加载必需字典
const essentialDicts = ['sys_user_gender', 'sys_enable_status']
await loadBatchDicts(essentialDicts)

// 其他字典懒加载
const { loadDict } = useLazyDict()
```

### 4. 内存泄漏问题

**解决方案:** 定期清理不使用的字典，用户退出时清空

```typescript
// 用户退出时清空
watch(() => userStore.token, (token) => {
  if (!token) {
    dictStore.cleanDict()
  }
})
```

## 总结

`useDictStore` 是一个功能完整的字典数据管理模块：

**核心优势:**

1. **集中管理** - 统一存储和管理所有字典数据
2. **快速访问** - 使用 Map 结构，查询性能优秀
3. **灵活转换** - 支持值与标签的双向转换
4. **动态扩展** - 支持运行时添加和更新字典
5. **类型安全** - 完整的 TypeScript 类型支持

**适用场景:**

- 下拉选择框数据源
- 状态标签展示
- 表单选项配置
- 数据字典管理
- 国际化标签转换
