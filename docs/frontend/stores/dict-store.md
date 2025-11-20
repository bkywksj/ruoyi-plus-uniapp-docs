# 字典数据状态管理 useDictStore

## 介绍

字典数据状态管理(`useDictStore`)是基于 Pinia 的字典数据管理模块,提供统一的字典数据存储、访问和转换功能。字典数据是企业应用中常见的数据类型,用于管理下拉选项、状态映射、标签配置等键值对数据,确保数据的一致性和可维护性。

**核心特性:**

- **集中存储** - 使用 Map 数据结构集中管理所有字典数据,提高查询性能
- **快速访问** - 提供多种查询方法,支持按 key 或直接传入数据查询
- **标签转换** - 支持值与显示文本的双向转换,简化界面展示逻辑
- **动态管理** - 支持运行时动态添加、更新和删除字典数据
- **类型安全** - 完整的 TypeScript 类型支持,提供良好的开发体验
- **灵活扩展** - 字典项支持自定义属性,满足特殊业务需求

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
 * 定义单个字典选项的数据结构
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

/**
 * Element Plus Tag 组件类型
 */
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
const getDict = (key: string): DictItem[] | null
```

**功能说明:**
- 根据字典 key 获取完整的字典数据数组
- 如果字典不存在,返回 `null`
- 支持任意自定义的字典类型

**技术实现:**

```typescript
// src/stores/modules/dict.ts:43-48
const getDict = (key: string): DictItem[] | null => {
  if (!key) {
    return null
  }
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
const getDictItem = (
  keyOrData: string | DictItem[],
  value: string | number
): DictItem | null
```

**功能说明:**
- 获取字典项的完整对象,包含所有属性
- 支持通过字典 key 或直接传入字典数据
- 返回完整的 `DictItem` 对象,可访问扩展属性

**技术实现:**

```typescript
// src/stores/modules/dict.ts:137-149
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
const setDict = (key: string, value: DictItem[]): boolean
```

**功能说明:**
- 添加或更新字典数据
- 如果字典 key 已存在,则覆盖原有数据
- 支持动态添加新的字典类型
- 返回操作是否成功

**技术实现:**

```typescript
// src/stores/modules/dict.ts:61-72
const setDict = (key: string, value: DictItem[]): boolean => {
  if (!key) {
    return false
  }
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
const getDictLabel = (
  keyOrData: string | Ref<DictItem[]> | DictItem[],
  value: string | number
): string
```

**功能说明:**
- 根据字典值获取对应的显示标签
- 支持三种参数类型:字典 key、Ref 类型的字典数据、普通字典数组
- 自动处理 Ref 类型,无需手动 `.value`
- 如果找不到对应的值,返回空字符串

**技术实现:**

```typescript
// src/stores/modules/dict.ts:83-98
const getDictLabel = (keyOrData: string | Ref<DictItem[]> | DictItem[], value: string | number): string => {
  let dictData: Ref<DictItem[]> | undefined

  if (typeof keyOrData === 'string') {
    dictData = ref(getDict(keyOrData))
  } else if (isRef(keyOrData)) {
    dictData = keyOrData
  } else {
    // 处理 DictItem[] 类型
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
const getDictLabels = (
  keyOrData: string | Ref<DictItem[]>,
  values: (string | number)[]
): string[]
```

**功能说明:**
- 批量转换多个字典值为标签数组
- 常用于多选场景的标签显示
- 如果某个值找不到对应标签,返回空字符串
- 保持数组顺序不变

**技术实现:**

```typescript
// src/stores/modules/dict.ts:109-126
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
const getDictValue = (key: string, label: string): string | number | null
```

**功能说明:**
- 根据显示标签反查对应的字典值
- 用于表单提交前的数据转换
- 如果找不到对应标签,返回 `null`

**技术实现:**

```typescript
// src/stores/modules/dict.ts:157-163
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
 * @param key 字典key
 * @returns 是否删除成功
 */
const removeDict = (key: string): boolean
```

**功能说明:**
- 删除指定的字典数据
- 常用于清理不再使用的字典
- 返回操作是否成功

**技术实现:**

```typescript
// src/stores/modules/dict.ts:171-181
const removeDict = (key: string): boolean => {
  if (!key) {
    return false
  }
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
 * 清空字典
 * @description 清空所有字典数据
 */
const cleanDict = (): void
```

**功能说明:**
- 清空所有字典数据
- 通常在用户退出登录时调用
- 释放内存,避免数据残留

**技术实现:**

```typescript
// src/stores/modules/dict.ts:188-190
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
        <el-radio
          v-for="dict in statusOptions"
          :key="dict.value"
          :value="dict.value"
        >
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 多选框组 -->
    <el-form-item label="角色">
      <el-checkbox-group v-model="form.roles">
        <el-checkbox
          v-for="dict in roleOptions"
          :key="dict.value"
          :value="dict.value"
        >
          {{ dict.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 表单数据
const form = ref({
  gender: '',
  status: '0',
  roles: []
})

// 字典选项
const genderOptions = computed(() => dictStore.getDict('sys_user_gender') || [])
const statusOptions = computed(() => dictStore.getDict('sys_enable_status') || [])
const roleOptions = computed(() => dictStore.getDict('sys_role') || [])
</script>
```

**使用说明:**
- 使用 `computed` 包装字典数据,确保响应式更新
- 提供默认值 `|| []`,避免字典未加载时报错
- 支持 Element Plus 所有表单组件

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

    <!-- 使用完整字典项 -->
    <el-table-column label="角色" prop="roleId">
      <template #default="{ row }">
        <el-tag
          v-if="getRoleItem(row.roleId)"
          :type="getRoleItem(row.roleId).elTagType"
          :class="getRoleItem(row.roleId).elTagClass"
        >
          {{ getRoleItem(row.roleId).label }}
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

// 表格数据
const tableData = ref([
  { id: 1, name: '张三', gender: '0', status: '0', roleId: '1', permissions: ['1', '2', '3'] },
  { id: 2, name: '李四', gender: '1', status: '1', roleId: '2', permissions: ['2', '3'] }
])

// 获取状态类型
const getStatusType = (status: string) => {
  const item = dictStore.getDictItem('sys_enable_status', status)
  return item?.elTagType || 'info'
}

// 获取角色字典项
const getRoleItem = (roleId: string) => {
  return dictStore.getDictItem('sys_role', roleId)
}
</script>
```

**使用说明:**
- `getDictLabel` 用于简单的文本转换
- `getDictItem` 用于获取完整字典项,访问扩展属性
- `getDictLabels` 用于批量转换,适合多选场景
- 配合 `el-tag` 组件展示状态标签

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

// 字典选项
const typeOptions = computed(() => dictStore.getDict('sys_user_type') || [])

// 加载字典数据
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

// 组件挂载时加载
onMounted(() => {
  loadDictData()
})
</script>
```

**使用说明:**
- 在组件 `onMounted` 时加载字典数据
- 使用 `loading` 状态提升用户体验
- 通过 `setDict` 方法将数据存入 store
- 字典数据在 store 中全局共享

### 4. 批量初始化字典

```typescript
// src/composables/useDict.ts
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/data'

/**
 * 批量加载字典
 * @param dictTypes 字典类型数组
 */
export const useBatchDict = async (dictTypes: string[]) => {
  const dictStore = useDictStore()

  const loadPromises = dictTypes.map(async (type) => {
    // 检查是否已加载
    if (dictStore.getDict(type)) {
      return
    }

    const [err, data] = await getDictData(type)
    if (!err && data) {
      dictStore.setDict(type, data)
    }
  })

  await Promise.all(loadPromises)
}

// 在 App.vue 中使用
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useBatchDict } from '@/composables/useDict'

onMounted(async () => {
  // 应用启动时批量加载常用字典
  await useBatchDict([
    'sys_user_gender',
    'sys_enable_status',
    'sys_yes_no',
    'sys_menu_type',
    'sys_role_type'
  ])
})
</script>
```

**使用说明:**
- 封装批量加载函数,提高代码复用性
- 检查字典是否已加载,避免重复请求
- 使用 `Promise.all` 并发加载,提升性能
- 在应用启动时预加载常用字典

### 5. 字典过滤和排序

```vue
<template>
  <div>
    <!-- 显示启用的状态 -->
    <el-select v-model="form.status">
      <el-option
        v-for="dict in enabledStatus"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      />
    </el-select>

    <!-- 按标签排序显示 -->
    <el-select v-model="form.priority">
      <el-option
        v-for="dict in sortedPriority"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

const form = ref({
  status: '',
  priority: ''
})

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

**使用说明:**
- 使用 `filter` 方法过滤字典项
- 使用 `sort` 方法自定义排序规则
- 使用展开运算符 `[...priority]` 避免修改原数据
- 在 `computed` 中处理,确保响应式更新

### 6. 级联字典

```vue
<template>
  <el-form :model="form">
    <!-- 省份选择 -->
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

    <!-- 城市选择 -->
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

    <!-- 区县选择 -->
    <el-form-item label="区县">
      <el-select v-model="form.district" :disabled="!form.city">
        <el-option
          v-for="dict in districtOptions"
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
import { getCityDict, getDistrictDict } from '@/api/system/dict/area'

const dictStore = useDictStore()

const form = ref({
  province: '',
  city: '',
  district: ''
})

// 省份选项
const provinceOptions = computed(() => dictStore.getDict('sys_province') || [])

// 城市选项 (根据省份)
const cityOptions = computed(() => {
  if (!form.value.province) return []
  return dictStore.getDict(`sys_city_${form.value.province}`) || []
})

// 区县选项 (根据城市)
const districtOptions = computed(() => {
  if (!form.value.city) return []
  return dictStore.getDict(`sys_district_${form.value.city}`) || []
})

// 省份变化处理
const handleProvinceChange = async (provinceId: string) => {
  // 清空下级选项
  form.value.city = ''
  form.value.district = ''

  // 加载城市字典
  const [err, data] = await getCityDict(provinceId)
  if (!err && data) {
    dictStore.setDict(`sys_city_${provinceId}`, data)
  }
}

// 城市变化处理
const handleCityChange = async (cityId: string) => {
  // 清空下级选项
  form.value.district = ''

  // 加载区县字典
  const [err, data] = await getDistrictDict(cityId)
  if (!err && data) {
    dictStore.setDict(`sys_district_${cityId}`, data)
  }
}
</script>
```

**使用说明:**
- 使用不同的字典 key 存储不同级别的数据
- 上级变化时清空下级选项
- 动态加载下级字典数据
- 使用 `disabled` 属性禁用未选择上级的下拉框

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

// 显示状态
dictStore.setDict('sys_show_hide', [
  { label: '显示', value: '0', elTagType: 'primary' },
  { label: '隐藏', value: '1', elTagType: 'info' }
])
```

### 用户相关字典

```typescript
// 用户性别
dictStore.setDict('sys_user_gender', [
  { label: '男', value: '0', elTagType: 'primary' },
  { label: '女', value: '1', elTagType: 'success' },
  { label: '未知', value: '2', elTagType: 'info' }
])

// 用户状态
dictStore.setDict('sys_user_status', [
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' },
  { label: '注销', value: '2', elTagType: 'info' }
])
```

### 菜单相关字典

```typescript
// 菜单类型
dictStore.setDict('sys_menu_type', [
  { label: '目录', value: 'M', elTagType: 'warning' },
  { label: '菜单', value: 'C', elTagType: 'success' },
  { label: '按钮', value: 'F', elTagType: 'info' }
])

// 菜单状态
dictStore.setDict('sys_menu_status', [
  { label: '正常', value: '0', elTagType: 'success' },
  { label: '停用', value: '1', elTagType: 'danger' }
])
```

### 操作日志字典

```typescript
// 操作类型
dictStore.setDict('sys_oper_type', [
  { label: '其他', value: '0', elTagType: 'info' },
  { label: '新增', value: '1', elTagType: 'primary' },
  { label: '修改', value: '2', elTagType: 'success' },
  { label: '删除', value: '3', elTagType: 'danger' },
  { label: '授权', value: '4', elTagType: 'warning' },
  { label: '导出', value: '5', elTagType: 'info' },
  { label: '导入', value: '6', elTagType: 'info' },
  { label: '强退', value: '7', elTagType: 'danger' },
  { label: '生成代码', value: '8', elTagType: 'primary' },
  { label: '清空数据', value: '9', elTagType: 'danger' }
])

// 操作状态
dictStore.setDict('sys_common_status', [
  { label: '成功', value: '0', elTagType: 'success' },
  { label: '失败', value: '1', elTagType: 'danger' }
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
    icon: 'folder',        // 自定义图标
    color: '#E6A23C',      // 自定义颜色
    description: '一级菜单' // 描述信息
  },
  {
    label: '菜单',
    value: 'C',
    elTagType: 'success',
    icon: 'document',
    color: '#67C23A',
    description: '具体功能页面'
  },
  {
    label: '按钮',
    value: 'F',
    elTagType: 'info',
    icon: 'operation',
    color: '#909399',
    description: '页面内操作按钮'
  }
])

// 使用扩展属性
const menuItem = dictStore.getDictItem('sys_menu_type', 'M')
if (menuItem) {
  console.log(menuItem.icon)        // 'folder'
  console.log(menuItem.color)       // '#E6A23C'
  console.log(menuItem.description) // '一级菜单'
}
```

**使用场景:**
- 图标配置: 为不同状态配置不同图标
- 颜色配置: 自定义标签颜色
- 权限控制: 添加权限标识
- 描述信息: 提供详细说明

### 2. 字典缓存策略

```typescript
// src/composables/useDict.ts
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/data'

/**
 * 智能字典加载 Hook
 * 支持缓存检查和过期刷新
 */
export const useSmartDict = () => {
  const dictStore = useDictStore()

  // 字典缓存时间 (毫秒)
  const CACHE_TIME = 30 * 60 * 1000 // 30分钟

  // 缓存时间戳
  const cacheTimestamps = new Map<string, number>()

  /**
   * 加载字典 (带缓存)
   */
  const loadDict = async (dictType: string, force = false) => {
    // 检查缓存
    const existingDict = dictStore.getDict(dictType)
    const cacheTime = cacheTimestamps.get(dictType)
    const now = Date.now()

    // 如果有缓存且未过期,直接返回
    if (existingDict && cacheTime && !force) {
      if (now - cacheTime < CACHE_TIME) {
        return existingDict
      }
    }

    // 加载字典数据
    const [err, data] = await getDictData(dictType)
    if (!err && data) {
      dictStore.setDict(dictType, data)
      cacheTimestamps.set(dictType, now)
      return data
    }

    return null
  }

  /**
   * 刷新字典
   */
  const refreshDict = async (dictType: string) => {
    return await loadDict(dictType, true)
  }

  /**
   * 清除缓存时间戳
   */
  const clearCacheTimestamp = (dictType: string) => {
    cacheTimestamps.delete(dictType)
  }

  return {
    loadDict,
    refreshDict,
    clearCacheTimestamp
  }
}

// 使用示例
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useSmartDict } from '@/composables/useDict'

const { loadDict, refreshDict } = useSmartDict()

onMounted(async () => {
  // 首次加载 (会请求API)
  await loadDict('sys_user_gender')

  // 再次加载 (使用缓存)
  await loadDict('sys_user_gender')

  // 强制刷新
  await refreshDict('sys_user_gender')
})
</script>
```

**缓存策略优势:**
- 减少 API 请求次数
- 提升页面加载速度
- 支持手动刷新
- 可配置缓存时间

### 3. 字典懒加载

```typescript
// src/composables/useLazyDict.ts
import { ref, computed, watch } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/data'

/**
 * 懒加载字典 Hook
 * 只在需要时才加载字典数据
 */
export const useLazyDict = (dictType: string) => {
  const dictStore = useDictStore()
  const loading = ref(false)
  const loaded = ref(false)

  // 字典数据
  const dictData = computed(() => dictStore.getDict(dictType) || [])

  // 加载字典
  const load = async () => {
    if (loaded.value || loading.value) {
      return
    }

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

  // 立即加载
  const loadNow = () => {
    load()
  }

  return {
    dictData,
    loading,
    loaded,
    load,
    loadNow
  }
}

// 使用示例
<template>
  <div>
    <!-- 下拉框展开时加载字典 -->
    <el-select
      v-model="form.gender"
      @visible-change="handleVisibleChange"
    >
      <el-option
        v-for="dict in genderDict.dictData.value"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useLazyDict } from '@/composables/useLazyDict'

const form = ref({ gender: '' })

// 懒加载字典
const genderDict = useLazyDict('sys_user_gender')

// 下拉框展开时加载
const handleVisibleChange = (visible: boolean) => {
  if (visible && !genderDict.loaded.value) {
    genderDict.load()
  }
}
</script>
```

**懒加载优势:**
- 减少初始加载时间
- 按需加载,节省资源
- 提升页面响应速度
- 适合大量字典的场景

### 4. 字典国际化

```typescript
// src/composables/useDictI18n.ts
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDictStore } from '@/stores/modules/dict'
import type { DictItem } from '@/types/global'

/**
 * 字典国际化 Hook
 * 根据当前语言返回对应的字典标签
 */
export const useDictI18n = () => {
  const { locale } = useI18n()
  const dictStore = useDictStore()

  /**
   * 获取国际化字典
   * @param dictType 字典类型
   * @returns 国际化后的字典数据
   */
  const getI18nDict = (dictType: string): DictItem[] => {
    const dict = dictStore.getDict(dictType)
    if (!dict) return []

    // 如果字典项包含 i18n 属性,使用国际化标签
    return dict.map(item => ({
      ...item,
      label: item.i18n?.[locale.value] || item.label
    }))
  }

  return {
    getI18nDict
  }
}

// 字典数据示例 (带国际化)
dictStore.setDict('sys_user_gender', [
  {
    label: '男',
    value: '0',
    elTagType: 'primary',
    i18n: {
      zh_CN: '男',
      en_US: 'Male'
    }
  },
  {
    label: '女',
    value: '1',
    elTagType: 'success',
    i18n: {
      zh_CN: '女',
      en_US: 'Female'
    }
  }
])

// 使用示例
<script lang="ts" setup>
import { computed } from 'vue'
import { useDictI18n } from '@/composables/useDictI18n'

const { getI18nDict } = useDictI18n()

// 自动国际化的字典
const genderOptions = computed(() => getI18nDict('sys_user_gender'))
</script>
```

**国际化优势:**
- 支持多语言展示
- 自动切换语言
- 统一管理翻译
- 提升国际化体验

### 5. 字典搜索和高亮

```vue
<template>
  <div>
    <!-- 搜索框 -->
    <el-input
      v-model="searchText"
      placeholder="搜索..."
      clearable
    />

    <!-- 过滤后的选项 -->
    <el-select v-model="form.type">
      <el-option
        v-for="dict in filteredOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      >
        <!-- 高亮搜索文本 -->
        <span v-html="highlightText(dict.label)"></span>
      </el-option>
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()
const searchText = ref('')
const form = ref({ type: '' })

// 原始字典数据
const allOptions = computed(() => dictStore.getDict('sys_type') || [])

// 过滤选项
const filteredOptions = computed(() => {
  if (!searchText.value) {
    return allOptions.value
  }

  const keyword = searchText.value.toLowerCase()
  return allOptions.value.filter(item =>
    item.label.toLowerCase().includes(keyword) ||
    item.value.toLowerCase().includes(keyword)
  )
})

// 高亮搜索文本
const highlightText = (text: string) => {
  if (!searchText.value) return text

  const regex = new RegExp(`(${searchText.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
</script>

<style scoped>
mark {
  background-color: #ffeb3b;
  padding: 0 2px;
}
</style>
```

**搜索功能特点:**
- 实时搜索过滤
- 关键词高亮显示
- 支持拼音搜索(扩展)
- 提升用户体验

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
      // 加载用户可见的字典
      await loadUserDicts()
    } else {
      // 用户退出,清空字典
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
    // 管理员显示所有角色
    return allRoles
  } else {
    // 普通用户只显示部分角色
    return allRoles.filter(role => role.value !== 'admin')
  }
})
```

**协作关系:**
- User Store 提供用户信息和权限
- Dict Store 根据权限过滤字典
- 共同实现数据权限控制

### 与 API 层

```typescript
// src/api/system/dict/data.ts
import { request } from '@/utils/request'
import type { DictItem } from '@/types/global'
import type { Result } from '@/types/api'

/**
 * 获取字典数据
 * @param dictType 字典类型
 * @returns 字典数据列表
 */
export const getDictData = (dictType: string): Promise<Result<DictItem[]>> => {
  return request({
    url: `/system/dict/data/type/${dictType}`,
    method: 'get'
  })
}

/**
 * 批量获取字典数据
 * @param dictTypes 字典类型数组
 * @returns 字典数据映射
 */
export const getBatchDictData = (
  dictTypes: string[]
): Promise<Result<Record<string, DictItem[]>>> => {
  return request({
    url: '/system/dict/data/batch',
    method: 'post',
    data: { dictTypes }
  })
}

// 使用示例
import { getDictData, getBatchDictData } from '@/api/system/dict/data'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 单个加载
const loadSingleDict = async () => {
  const [err, data] = await getDictData('sys_user_gender')
  if (!err && data) {
    dictStore.setDict('sys_user_gender', data)
  }
}

// 批量加载
const loadBatchDicts = async () => {
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
}
```

**协作关系:**
- API 层提供数据接口
- Dict Store 存储和管理数据
- 封装统一的加载方法

### 与组件

```typescript
// src/components/DictSelect/index.vue
<template>
  <el-select
    v-model="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="dict in dictOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
      :disabled="dict.disabled"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from 'vue'
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
  change: [value: string | number, item: DictItem]
}>()

const dictStore = useDictStore()

// 字典选项
const dictOptions = computed(() => dictStore.getDict(props.dictType) || [])

// 加载字典
const loadDict = async () => {
  if (dictStore.getDict(props.dictType)) {
    return
  }

  const [err, data] = await getDictData(props.dictType)
  if (!err && data) {
    dictStore.setDict(props.dictType, data)
  }
}

// 自动加载
onMounted(() => {
  if (props.autoLoad) {
    loadDict()
  }
})

// 变化处理
const handleChange = (value: string | number) => {
  emit('update:modelValue', value)

  const item = dictStore.getDictItem(props.dictType, value)
  if (item) {
    emit('change', value, item)
  }
}
</script>

// 使用封装的组件
<template>
  <dict-select
    v-model="form.gender"
    dict-type="sys_user_gender"
    placeholder="请选择性别"
    @change="handleGenderChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import DictSelect from '@/components/DictSelect/index.vue'

const form = ref({ gender: '' })

const handleGenderChange = (value: string, item: DictItem) => {
  console.log('选中:', value, item)
}
</script>
```

**组件封装优势:**
- 简化使用代码
- 统一组件样式
- 自动加载字典
- 提供额外功能

## 性能优化

### 1. 懒加载策略

**按需加载字典数据,避免初始化时加载全部:**

```typescript
// ❌ 不推荐: 一次性加载所有字典
const initAllDicts = async () => {
  const allDictTypes = [
    'sys_user_gender', 'sys_enable_status', 'sys_yes_no',
    'sys_menu_type', 'sys_role_type', 'sys_dept_type',
    // ... 50+ 字典类型
  ]
  await Promise.all(allDictTypes.map(loadDict))
}

// ✅ 推荐: 按需加载
const initEssentialDicts = async () => {
  // 只加载必需的字典
  const essentialDicts = [
    'sys_user_gender',
    'sys_enable_status',
    'sys_yes_no'
  ]
  await Promise.all(essentialDicts.map(loadDict))
}

// 其他字典在使用时加载
const loadDictOnDemand = async (dictType: string) => {
  if (!dictStore.getDict(dictType)) {
    await loadDict(dictType)
  }
}
```

### 2. 缓存机制

**使用 Map 提高查询性能,避免重复请求:**

```typescript
// 缓存时间戳
const dictCacheTime = new Map<string, number>()
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟

const loadDictWithCache = async (dictType: string) => {
  const cacheTime = dictCacheTime.get(dictType)
  const now = Date.now()

  // 检查缓存是否有效
  if (cacheTime && (now - cacheTime) < CACHE_DURATION) {
    const cachedDict = dictStore.getDict(dictType)
    if (cachedDict) {
      return cachedDict
    }
  }

  // 加载新数据
  const [err, data] = await getDictData(dictType)
  if (!err && data) {
    dictStore.setDict(dictType, data)
    dictCacheTime.set(dictType, now)
    return data
  }

  return null
}
```

### 3. 批量操作

**批量加载相关字典,合并多个请求:**

```typescript
// ❌ 不推荐: 多次单独请求
const loadDictsSeparately = async () => {
  await getDictData('sys_user_gender')
  await getDictData('sys_enable_status')
  await getDictData('sys_yes_no')
}

// ✅ 推荐: 批量请求
const loadDictsBatch = async () => {
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
}
```

### 4. 虚拟滚动

**处理大量字典选项时使用虚拟滚动:**

```vue
<template>
  <el-select
    v-model="form.city"
    filterable
    remote
    :remote-method="remoteSearchCity"
  >
    <el-option
      v-for="dict in visibleOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()
const form = ref({ city: '' })
const searchKeyword = ref('')

// 所有城市选项 (假设有1000+)
const allCityOptions = computed(() => dictStore.getDict('sys_city') || [])

// 可见选项 (只显示前50个或搜索结果)
const visibleOptions = computed(() => {
  if (searchKeyword.value) {
    return allCityOptions.value
      .filter(item => item.label.includes(searchKeyword.value))
      .slice(0, 50)
  }
  return allCityOptions.value.slice(0, 50)
})

// 远程搜索
const remoteSearchCity = (query: string) => {
  searchKeyword.value = query
}
</script>
```

### 5. 内存管理

**定期清理不再使用的字典数据:**

```typescript
// 记录字典使用时间
const dictUsageTime = new Map<string, number>()

// 更新使用时间
const updateUsageTime = (dictType: string) => {
  dictUsageTime.set(dictType, Date.now())
}

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
setInterval(cleanExpiredDicts, 10 * 60 * 1000) // 每10分钟清理一次
```

## API 文档

### 状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `dict` | `Ref<Map<string, DictItem[]>>` | 字典数据集合,使用 Map 存储 |

### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getDict` | `key: string` | `DictItem[] \| null` | 获取指定类型的字典数据 |
| `setDict` | `key: string, value: DictItem[]` | `boolean` | 设置或更新字典数据 |
| `getDictLabel` | `keyOrData: string \| Ref<DictItem[]> \| DictItem[], value: string \| number` | `string` | 根据值获取对应的标签 |
| `getDictLabels` | `keyOrData: string \| Ref<DictItem[]>, values: (string \| number)[]` | `string[]` | 批量获取多个值的标签 |
| `getDictValue` | `key: string, label: string` | `string \| number \| null` | 根据标签获取对应的值 |
| `getDictItem` | `keyOrData: string \| DictItem[], value: string \| number` | `DictItem \| null` | 获取完整的字典项对象 |
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

/**
 * Element Plus Tag 类型
 */
type ElTagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'
```

## 最佳实践

### 1. 命名规范

```typescript
// ✅ 推荐: 使用统一的命名规则
'sys_user_gender'     // 系统模块_功能_字段
'biz_order_status'    // 业务模块_功能_字段
'dict_menu_type'      // 字典类型_功能_字段

// ❌ 不推荐: 混乱的命名
'gender'              // 太简单,容易冲突
'user_gender_dict'    // 冗余的后缀
'SysUserGender'       // 大小写不统一
```

### 2. 类型安全

```typescript
// 定义字典类型枚举
export enum DictType {
  USER_GENDER = 'sys_user_gender',
  ENABLE_STATUS = 'sys_enable_status',
  YES_NO = 'sys_yes_no',
  MENU_TYPE = 'sys_menu_type'
}

// 使用枚举而非字符串
const genderOptions = dictStore.getDict(DictType.USER_GENDER)
const statusLabel = dictStore.getDictLabel(DictType.ENABLE_STATUS, '0')

// 定义常量映射
export const DICT_KEYS = {
  USER_GENDER: 'sys_user_gender',
  ENABLE_STATUS: 'sys_enable_status'
} as const

// 使用常量
const options = dictStore.getDict(DICT_KEYS.USER_GENDER)
```

### 3. 错误处理

```typescript
// ✅ 推荐: 提供默认值和错误处理
const getDictLabel = (dictType: string, value: string) => {
  try {
    const label = dictStore.getDictLabel(dictType, value)
    return label || '未知' // 提供默认值
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

// ❌ 不推荐: 不处理错误
const label = dictStore.getDictLabel('sys_user_gender', value) // 可能返回空
```

### 4. 更新策略

```typescript
// 定期刷新动态字典
const refreshDynamicDicts = async () => {
  const dynamicDictTypes = [
    'biz_product_category',
    'biz_order_status',
    'biz_logistics_company'
  ]

  for (const dictType of dynamicDictTypes) {
    const [err, data] = await getDictData(dictType)
    if (!err && data) {
      dictStore.setDict(dictType, data)
    }
  }
}

// 每30分钟刷新一次
setInterval(refreshDynamicDicts, 30 * 60 * 1000)

// 用户手动刷新
const handleRefresh = async () => {
  await refreshDynamicDicts()
  ElMessage.success('字典数据已更新')
}
```

### 5. 预加载策略

```typescript
// App.vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getBatchDictData } from '@/api/system/dict/data'

const dictStore = useDictStore()

// 预加载高频字典
const preloadDicts = async () => {
  const highFrequencyDicts = [
    'sys_user_gender',
    'sys_enable_status',
    'sys_yes_no'
  ]

  const [err, data] = await getBatchDictData(highFrequencyDicts)
  if (!err && data) {
    Object.entries(data).forEach(([key, value]) => {
      dictStore.setDict(key, value)
    })
  }
}

onMounted(() => {
  preloadDicts()
})
</script>
```

### 6. 组件封装

```typescript
// 封装字典 Tag 组件
<template>
  <el-tag
    v-if="dictItem"
    :type="dictItem.elTagType"
    :class="dictItem.elTagClass"
  >
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

const dictItem = computed(() =>
  dictStore.getDictItem(props.dictType, props.value)
)
</script>

// 使用
<dict-tag dict-type="sys_enable_status" :value="row.status" />
```

### 7. 国际化支持

```typescript
// 字典国际化结构
interface I18nDictItem extends DictItem {
  i18n?: Record<string, string>
}

// 设置国际化字典
dictStore.setDict('sys_user_gender', [
  {
    label: '男',
    value: '0',
    i18n: {
      zh_CN: '男',
      en_US: 'Male',
      ja_JP: '男性'
    }
  },
  {
    label: '女',
    value: '1',
    i18n: {
      zh_CN: '女',
      en_US: 'Female',
      ja_JP: '女性'
    }
  }
])

// 获取国际化标签
const getI18nLabel = (dictType: string, value: string, locale: string) => {
  const item = dictStore.getDictItem(dictType, value)
  return item?.i18n?.[locale] || item?.label || ''
}
```

### 8. 权限控制

```typescript
// 根据权限过滤字典
const getPermissionBasedDict = (dictType: string, userPerms: string[]) => {
  const allDict = dictStore.getDict(dictType)
  if (!allDict) return []

  return allDict.filter(item => {
    // 如果字典项有权限要求
    if (item.requiredPerm) {
      return userPerms.includes(item.requiredPerm)
    }
    // 没有权限要求,默认显示
    return true
  })
}

// 使用
const roleOptions = computed(() => {
  const userStore = useUserStore()
  return getPermissionBasedDict('sys_role', userStore.permissions)
})
```

### 9. 数据验证

```typescript
// 验证字典值是否有效
const validateDictValue = (dictType: string, value: string) => {
  const dict = dictStore.getDict(dictType)
  if (!dict) {
    return { valid: false, message: '字典不存在' }
  }

  const exists = dict.some(item => item.value === value)
  if (!exists) {
    return { valid: false, message: '字典值无效' }
  }

  return { valid: true }
}

// 在表单验证中使用
const validateGender = (rule: any, value: string, callback: Function) => {
  const result = validateDictValue('sys_user_gender', value)
  if (!result.valid) {
    callback(new Error(result.message))
  } else {
    callback()
  }
}
```

### 10. 监控和日志

```typescript
// 监控字典使用情况
const dictUsageStats = new Map<string, number>()

// 记录字典访问
const trackDictAccess = (dictType: string) => {
  const count = dictUsageStats.get(dictType) || 0
  dictUsageStats.set(dictType, count + 1)
}

// 定期上报统计
const reportUsageStats = () => {
  const stats = Array.from(dictUsageStats.entries())
    .map(([dictType, count]) => ({ dictType, count }))
    .sort((a, b) => b.count - a.count)

  console.log('字典使用统计:', stats)
  // 上报到监控系统
  // reportToMonitor(stats)
}

// 每小时上报一次
setInterval(reportUsageStats, 60 * 60 * 1000)
```

## 常见问题

### 1. 字典数据不更新

**问题描述:**
修改了字典数据,但页面显示的还是旧数据。

**问题原因:**
- 字典数据被缓存,没有重新加载
- 使用了静态数据而非响应式数据
- 没有使用 `computed` 包装字典

**解决方案:**

```typescript
// ❌ 错误: 静态赋值
const genderOptions = dictStore.getDict('sys_user_gender')

// ✅ 正确: 使用 computed
const genderOptions = computed(() => dictStore.getDict('sys_user_gender') || [])

// 手动刷新字典
const refreshDict = async () => {
  const [err, data] = await getDictData('sys_user_gender')
  if (!err && data) {
    dictStore.setDict('sys_user_gender', data)
  }
}
```

### 2. 字典标签显示为空

**问题描述:**
调用 `getDictLabel` 返回空字符串。

**问题原因:**
- 字典数据未加载
- 字典 key 错误
- 值类型不匹配(字符串 vs 数字)

**解决方案:**

```typescript
// 1. 检查字典是否已加载
const dict = dictStore.getDict('sys_user_gender')
console.log('字典数据:', dict)

// 2. 统一值类型
const getDictLabel = (dictType: string, value: string | number) => {
  // 统一转换为字符串
  return dictStore.getDictLabel(dictType, String(value))
}

// 3. 提供默认值
const getLabel = (dictType: string, value: string) => {
  const label = dictStore.getDictLabel(dictType, value)
  return label || '未知'
}
```

### 3. 大量字典加载慢

**问题描述:**
应用启动时加载大量字典,导致页面加载缓慢。

**问题原因:**
- 一次性加载所有字典
- 没有使用懒加载策略
- 没有批量请求接口

**解决方案:**

```typescript
// 1. 只预加载必需字典
const essentialDicts = [
  'sys_user_gender',
  'sys_enable_status'
]
await loadBatchDicts(essentialDicts)

// 2. 其他字典懒加载
const { loadDict } = useLazyDict()

// 3. 使用批量接口
const [err, data] = await getBatchDictData(essentialDicts)
```

### 4. 字典选项顺序混乱

**问题描述:**
字典选项显示顺序不符合预期。

**问题原因:**
- 后端返回数据未排序
- 前端没有处理排序
- 使用了 Map 导致顺序变化

**解决方案:**

```typescript
// 1. 后端排序字段
const [err, data] = await getDictData('sys_user_type')
if (!err && data) {
  // 按 sort 字段排序
  const sortedData = data.sort((a, b) => (a.sort || 0) - (b.sort || 0))
  dictStore.setDict('sys_user_type', sortedData)
}

// 2. 前端自定义排序
const sortedOptions = computed(() => {
  const options = dictStore.getDict('sys_user_type')
  if (!options) return []

  // 按标签排序
  return [...options].sort((a, b) => a.label.localeCompare(b.label))
})
```

### 5. 内存泄漏问题

**问题描述:**
长时间运行后,应用内存占用越来越高。

**问题原因:**
- 字典数据不断累积
- 没有清理过期字典
- 监听器未正确销毁

**解决方案:**

```typescript
// 1. 定期清理字典
const cleanupDicts = () => {
  const now = Date.now()
  const EXPIRY_TIME = 60 * 60 * 1000 // 1小时

  dictUsageTime.forEach((time, dictType) => {
    if (now - time > EXPIRY_TIME) {
      dictStore.removeDict(dictType)
    }
  })
}

// 2. 组件销毁时清理
onUnmounted(() => {
  // 清理特定字典
  dictStore.removeDict('temp_dict_' + componentId)
})

// 3. 用户退出时清空
watch(
  () => userStore.token,
  (token) => {
    if (!token) {
      dictStore.cleanDict()
    }
  }
)
```

## 总结

`useDictStore` 是一个功能完整的字典数据管理模块,提供了字典的存储、访问、转换和管理功能。通过合理使用字典管理,可以大大简化界面数据展示逻辑,提升代码可维护性。

**核心优势:**

1. **集中管理** - 统一存储和管理所有字典数据
2. **快速访问** - 使用 Map 结构,查询性能优秀
3. **灵活转换** - 支持值与标签的双向转换
4. **动态扩展** - 支持运行时添加和更新字典
5. **类型安全** - 完整的 TypeScript 类型支持

**适用场景:**

- 下拉选择框数据源
- 状态标签展示
- 表单选项配置
- 数据字典管理
- 国际化标签转换

通过合理使用字典管理功能,配合缓存策略和懒加载,可以在保证性能的同时,提供优秀的开发体验和用户体验。
