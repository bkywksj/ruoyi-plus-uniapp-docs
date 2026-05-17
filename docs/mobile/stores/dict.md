# Dict 字典状态

## 介绍

`useDictStore` 是 RuoYi-Plus-UniApp 移动端的字典数据管理模块，提供统一的字典数据存储、访问和转换功能。字典数据是业务系统中常用的键值对数据，如性别、状态、类型等枚举值，通过集中管理可以实现数据复用和统一维护。

字典管理是业务系统的核心基础设施之一，涉及用户交互、数据展示、表单选择等多个场景。良好的字典管理方案能够降低前后端耦合度，提升开发效率和用户体验。

**核心特性:**

- **集中存储** - 使用 Map 结构存储多个字典类型，O(1) 时间复杂度高效查询
- **双向转换** - 支持值到标签、标签到值的双向转换，满足不同场景需求
- **批量操作** - 支持批量获取标签，减少循环调用，提升渲染效率
- **完整对象获取** - 可获取字典项的完整信息，包括样式类型、排序号等
- **灵活输入** - 支持字典类型名称、响应式引用或字典数据数组作为输入
- **生命周期管理** - 支持单个删除和清空所有字典，便于内存优化
- **缓存优先** - 与 useDict Composable 配合实现智能缓存，减少 API 请求
- **类型安全** - 完整的 TypeScript 类型定义，开发时即可发现错误

## 架构设计

### Store 结构图

```text
┌─────────────────────────────────────────────────────────────────┐
│                        useDictStore                              │
├─────────────────────────────────────────────────────────────────┤
│  State                                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  dict: Map<string, DictItem[]>                              ││
│  │  ┌─────────────────┬────────────────────────────────────┐   ││
│  │  │ sys_user_gender │ [{label:'男',value:'0'}, ...]      │   ││
│  │  ├─────────────────┼────────────────────────────────────┤   ││
│  │  │ sys_enable_status│ [{label:'正常',value:'0'}, ...]   │   ││
│  │  ├─────────────────┼────────────────────────────────────┤   ││
│  │  │ sys_notice_type │ [{label:'通知',value:'1'}, ...]    │   ││
│  │  └─────────────────┴────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Methods                                                         │
│  ┌──────────────┬──────────────┬──────────────┬───────────────┐ │
│  │   getDict    │   setDict    │ getDictLabel │ getDictLabels │ │
│  ├──────────────┼──────────────┼──────────────┼───────────────┤ │
│  │ getDictItem  │ getDictValue │  removeDict  │   cleanDict   │ │
│  └──────────────┴──────────────┴──────────────┴───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流转图

```text
┌─────────────┐    缓存命中     ┌─────────────┐
│  Component  │ ─────────────► │  DictStore  │
│   请求字典   │                │  (Map存储)   │
└──────┬──────┘                └──────┬──────┘
       │                              │
       │ 缓存未命中                    │ 返回数据
       ▼                              ▼
┌─────────────┐    API请求     ┌─────────────┐
│   useDict   │ ─────────────► │   Backend   │
│ Composable  │                │   /dictData │
└──────┬──────┘                └──────┬──────┘
       │                              │
       │ 存入缓存                      │ 返回字典
       ▼                              ▼
┌─────────────────────────────────────────────┐
│              DictStore.setDict()            │
│         缓存字典数据，供后续请求使用           │
└─────────────────────────────────────────────┘
```

### 字典类型枚举

项目预定义了常用的字典类型枚举，便于类型安全的字典访问：

```typescript
/**
 * 字典类型枚举
 */
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
  /** 平台类型 */
  sys_platform_type = 'sys_platform_type',
  /** 用户性别 */
  sys_user_gender = 'sys_user_gender',
  /** 数据权限类型 */
  sys_data_scope = 'sys_data_scope',
}
```

**使用枚举的优势:**

```typescript
// 类型安全，IDE 自动补全
const { sys_user_gender } = useDict(DictTypes.sys_user_gender)

// 避免字符串拼写错误
// ❌ 错误: 'sys_user_gander' 拼写错误但无法检测
// ✅ 正确: DictTypes.sys_user_gender 编译时检测
```

## 基本用法

### 引入与初始化

```typescript
import { useDictStore } from '@/stores/modules/dict'

// 获取 Store 实例
const dictStore = useDictStore()
```

### 设置字典数据

```typescript
// 设置单个字典
dictStore.setDict('sys_user_gender', [
  { label: '男', value: '0', tagType: 'primary' },
  { label: '女', value: '1', tagType: 'danger' },
  { label: '未知', value: '2', tagType: 'info' }
])

// 设置多个字典
dictStore.setDict('sys_normal_disable', [
  { label: '正常', value: '0', tagType: 'success' },
  { label: '停用', value: '1', tagType: 'danger' }
])

dictStore.setDict('sys_yes_no', [
  { label: '是', value: 'Y', tagType: 'success' },
  { label: '否', value: 'N', tagType: 'danger' }
])
```

### 获取字典标签

```vue
<template>
  <view class="user-info">
    <text>性别：{{ genderLabel }}</text>
    <text>状态：{{ statusLabel }}</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 假设用户数据
const user = {
  gender: '0',
  status: '0'
}

// 获取性别标签
const genderLabel = computed(() => {
  return dictStore.getDictLabel('sys_user_gender', user.gender)
})

// 获取状态标签
const statusLabel = computed(() => {
  return dictStore.getDictLabel('sys_normal_disable', user.status)
})
</script>
```

### 在列表中使用

```vue
<template>
  <view class="user-list">
    <view v-for="user in userList" :key="user.id" class="user-item">
      <text class="name">{{ user.nickName }}</text>
      <wd-tag :type="getGenderTagType(user.sex)">
        {{ dictStore.getDictLabel('sys_user_gender', user.sex) }}
      </wd-tag>
      <wd-tag :type="getStatusTagType(user.status)">
        {{ dictStore.getDictLabel('sys_normal_disable', user.status) }}
      </wd-tag>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

const userList = ref([
  { id: 1, nickName: '张三', sex: '0', status: '0' },
  { id: 2, nickName: '李四', sex: '1', status: '1' },
])

// 获取性别标签类型
const getGenderTagType = (value: string) => {
  const item = dictStore.getDictItem('sys_user_gender', value)
  return item?.tagType || 'info'
}

// 获取状态标签类型
const getStatusTagType = (value: string) => {
  const item = dictStore.getDictItem('sys_normal_disable', value)
  return item?.tagType || 'info'
}
</script>
```

## API 详解

### 状态

#### dict

字典数据集合，使用 Map 结构存储。

```typescript
const dict: Ref<Map<string, DictItem[]>>
```

**数据结构示例:**

```typescript
// Map 结构
{
  'sys_user_gender': [
    { label: '男', value: '0', tagType: 'primary' },
    { label: '女', value: '1', tagType: 'danger' }
  ],
  'sys_normal_disable': [
    { label: '正常', value: '0', tagType: 'success' },
    { label: '停用', value: '1', tagType: 'danger' }
  ]
}
```

### 方法

#### getDict

获取指定类型的字典数据。

```typescript
const getDict: (key: string) => DictItem[] | null
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 是 | 字典类型 |

**返回值:** 字典数据数组，不存在时返回 `null`

**使用示例:**

```typescript
// 获取性别字典
const genderDict = dictStore.getDict('sys_user_gender')
// 返回: [{ label: '男', value: '0' }, { label: '女', value: '1' }]

// 获取不存在的字典
const notExist = dictStore.getDict('not_exist')
// 返回: null
```

#### setDict

设置字典数据。

```typescript
const setDict: (key: string, value: DictItem[]) => boolean
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 是 | 字典类型 |
| `value` | `DictItem[]` | 是 | 字典数据数组 |

**返回值:** 设置是否成功

**使用示例:**

```typescript
const success = dictStore.setDict('sys_user_gender', [
  { label: '男', value: '0', tagType: 'primary' },
  { label: '女', value: '1', tagType: 'danger' }
])

console.log(success) // true
```

#### getDictLabel

根据字典值获取对应的标签。

```typescript
const getDictLabel: (
  keyOrData: string | Ref<DictItem[]> | DictItem[],
  value: string | number
) => string
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyOrData` | `string \| Ref<DictItem[]> \| DictItem[]` | 是 | 字典类型或字典数据 |
| `value` | `string \| number` | 是 | 字典值 |

**返回值:** 对应的标签，未找到时返回空字符串

**使用示例:**

```typescript
// 方式1：使用字典类型名称
const label1 = dictStore.getDictLabel('sys_user_gender', '0')
// 返回: '男'

// 方式2：使用字典数据数组
const genderDict = [
  { label: '男', value: '0' },
  { label: '女', value: '1' }
]
const label2 = dictStore.getDictLabel(genderDict, '1')
// 返回: '女'

// 方式3：使用响应式字典数据
const dictRef = ref(genderDict)
const label3 = dictStore.getDictLabel(dictRef, '0')
// 返回: '男'
```

#### getDictLabels

批量获取字典标签。

```typescript
const getDictLabels: (
  keyOrData: string | Ref<DictItem[]>,
  values: (string | number)[]
) => string[]
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyOrData` | `string \| Ref<DictItem[]>` | 是 | 字典类型或字典数据 |
| `values` | `(string \| number)[]` | 是 | 字典值数组 |

**返回值:** 标签数组

**使用示例:**

```typescript
// 批量获取标签
const labels = dictStore.getDictLabels('sys_user_gender', ['0', '1'])
// 返回: ['男', '女']

// 用于显示多选值
const selectedValues = ['0', '1', '2']
const selectedLabels = dictStore.getDictLabels('sys_user_gender', selectedValues)
// 返回: ['男', '女', '未知']
```

#### getDictItem

获取字典项的完整对象。

```typescript
const getDictItem: (
  keyOrData: string | DictItem[],
  value: string | number
) => DictItem | null
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyOrData` | `string \| DictItem[]` | 是 | 字典类型或字典数据 |
| `value` | `string \| number` | 是 | 字典值 |

**返回值:** 完整的字典项对象，未找到时返回 `null`

**使用示例:**

```typescript
// 获取完整字典项
const item = dictStore.getDictItem('sys_user_gender', '0')
// 返回: { label: '男', value: '0', tagType: 'primary' }

// 用于获取样式类型
const tagType = item?.tagType || 'info'
```

#### getDictValue

根据标签获取对应的字典值。

```typescript
const getDictValue: (key: string, label: string) => string | number | null
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 是 | 字典类型 |
| `label` | `string` | 是 | 字典标签 |

**返回值:** 对应的字典值，未找到时返回 `null`

**使用示例:**

```typescript
// 根据标签获取值
const value = dictStore.getDictValue('sys_user_gender', '男')
// 返回: '0'

// 用于表单提交
const formData = {
  gender: dictStore.getDictValue('sys_user_gender', selectedLabel)
}
```

#### removeDict

删除指定的字典数据。

```typescript
const removeDict: (key: string) => boolean
```

**参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 是 | 字典类型 |

**返回值:** 删除是否成功

**使用示例:**

```typescript
// 删除字典
const success = dictStore.removeDict('sys_user_gender')
console.log(success) // true
```

#### cleanDict

清空所有字典数据。

```typescript
const cleanDict: () => void
```

**使用示例:**

```typescript
// 清空所有字典
dictStore.cleanDict()
```

## 与 useDict Composable 配合使用

项目提供了 `useDict` Composable 来简化字典的加载和使用，实现了智能缓存和并行加载。

### useDict 实现原理

```typescript
/**
 * 获取字典数据的组合式API
 *
 * 此钩子用于从缓存或API动态获取字典数据，支持同时请求多个字典类型。
 * 返回的对象中包含每个请求的字典类型作为属性，以及加载状态。
 */
export const useDict = (...args: string[]): DataResult => {
  const dictStore = useDictStore()
  // 存储所有字典数据的响应式对象
  const dictObject = reactive<Record<string, DictItem[]>>({})
  // 字典加载状态标志 false代表加载完毕
  const dictLoading = ref(true)

  // 收集所有字典请求的Promise，用于跟踪加载完成状态
  const promises: Promise<void>[] = []

  // 处理每个请求的字典类型
  args.forEach((dictType) => {
    // 初始化为空数组，确保在加载前模板可以正常渲染
    dictObject[dictType] = []

    // 尝试从缓存获取字典
    const cachedDict = dictStore.getDict(dictType)
    let promise: Promise<void>

    if (cachedDict) {
      // 缓存命中，直接使用缓存数据
      dictObject[dictType] = cachedDict
      promise = Promise.resolve()
    } else {
      // 缓存未命中，从API获取数据
      promise = listDictDatasByDictType(dictType).then(([err, data]) => {
        if (err) {
          console.error(`获取字典[${dictType}]失败:`, err)
          return
        }
        // 转换API返回的数据为标准字典格式
        const dictData = data.map(
          (p): DictItem => ({
            label: p.dictLabel,
            value: p.dictValue,
            status: p.status,
            elTagType: p.listClass,
            elTagClass: p.cssClass,
          }),
        )

        dictObject[dictType] = dictData
        dictStore.setDict(dictType, dictData)
      })
    }

    promises.push(promise)
  })

  // 当所有字典请求完成后，更新加载状态
  Promise.all(promises).finally(() => {
    dictLoading.value = false
  })

  return {
    ...toRefs(dictObject),
    dictLoading,
  } as DataResult
}
```

### 基本使用方式

```vue
<template>
  <view class="form">
    <!-- 显示加载状态 -->
    <wd-loading v-if="dictLoading" />

    <!-- 性别选择 -->
    <wd-radio-group v-model="form.gender">
      <wd-radio
        v-for="item in sys_user_gender"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </wd-radio>
    </wd-radio-group>

    <!-- 状态选择 -->
    <wd-picker
      :columns="sys_enable_status"
      v-model="form.status"
      label="状态"
    />
  </view>
</template>

<script lang="ts" setup>
import { useDict, DictTypes } from '@/composables/useDict'

// 使用枚举获取多个字典，自动缓存
const {
  sys_user_gender,
  sys_enable_status,
  dictLoading
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

const form = reactive({
  gender: '0',
  status: '0'
})
</script>
```

### 结合 DictStore 方法

```vue
<template>
  <view class="user-detail">
    <!-- 显示字典标签 -->
    <text>性别：{{ genderLabel }}</text>

    <!-- 显示带样式的标签 -->
    <wd-tag :type="genderTagType">{{ genderLabel }}</wd-tag>
  </view>
</template>

<script lang="ts" setup>
import { useDict, DictTypes } from '@/composables/useDict'

const props = defineProps<{
  user: { gender: string }
}>()

// 加载字典
const { sys_user_gender, dictLoading } = useDict(DictTypes.sys_user_gender)

const dictStore = useDictStore()

// 获取标签文本
const genderLabel = computed(() => {
  if (dictLoading.value) return '加载中...'
  return dictStore.getDictLabel('sys_user_gender', props.user.gender)
})

// 获取标签样式
const genderTagType = computed(() => {
  const item = dictStore.getDictItem('sys_user_gender', props.user.gender)
  return item?.elTagType || 'info'
})
</script>
```

## API 集成

### 后端接口

字典数据通过以下 API 从后端获取：

```typescript
// api/system/dict/dictData/dictDataApi.ts

/**
 * 根据字典类型查询字典数据信息
 * @param dictType 字典类型
 * @returns 字典数据数组
 */
export const listDictDatasByDictType = (
  dictType: string
): Result<SysDictDataVo[]> => {
  return http.get<SysDictDataVo[]>(
    `/system/dictData/listDictDatasByDictType/${dictType}`
  )
}

/**
 * 查询字典数据列表（分页）
 */
export const pageDictDatas = (
  query: SysDictDataQuery
): Result<PageResult<SysDictDataVo>> => {
  return http.get<PageResult<SysDictDataVo>>(
    '/system/dictData/pageDictDatas',
    query
  )
}

/**
 * 查询字典数据详细
 */
export const getDictData = (
  dictDataId: string | number
): Result<SysDictDataVo> => {
  return http.get<SysDictDataVo>(
    `/system/dictData/getDictData/${dictDataId}`
  )
}
```

### 后端响应数据结构

```typescript
/**
 * 字典数据 VO
 */
interface SysDictDataVo {
  /** 字典编码 */
  dictCode: number
  /** 字典排序 */
  dictSort: number
  /** 字典标签 */
  dictLabel: string
  /** 字典键值 */
  dictValue: string
  /** 字典类型 */
  dictType: string
  /** 样式属性（其他样式扩展） */
  cssClass: string
  /** 表格回显样式 */
  listClass: string
  /** 是否默认（Y是 N否） */
  isDefault: string
  /** 状态（0正常 1停用） */
  status: string
  /** 备注 */
  remark: string
  /** 创建时间 */
  createTime: string
}
```

### 数据转换

useDict 会将后端返回的数据转换为前端统一的 DictItem 格式：

```typescript
// 后端数据 → 前端格式转换
const dictData = data.map((p): DictItem => ({
  // 显示标签
  label: p.dictLabel,
  // 实际值
  value: p.dictValue,
  // 状态
  status: p.status,
  // Element/WD Tag 组件样式类型
  elTagType: p.listClass,
  // 自定义 CSS 类
  elTagClass: p.cssClass,
}))
```

## 类型定义

### DictItem

```typescript
/**
 * 字典项类型
 */
interface DictItem {
  /** 显示标签 */
  label: string
  /** 字典值 */
  value: string | number
  /** 标签样式类型 */
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 是否默认选中 */
  isDefault?: boolean
  /** 排序号 */
  sort?: number
  /** 备注 */
  remark?: string
}
```

### 完整类型导出

```typescript
// types/dict.ts
export interface DictItem {
  label: string
  value: string | number
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  isDefault?: boolean
  sort?: number
  remark?: string
}

export type DictMap = Map<string, DictItem[]>

export interface DictStore {
  dict: Ref<DictMap>
  getDict: (key: string) => DictItem[] | null
  setDict: (key: string, value: DictItem[]) => boolean
  getDictLabel: (keyOrData: string | Ref<DictItem[]> | DictItem[], value: string | number) => string
  getDictLabels: (keyOrData: string | Ref<DictItem[]>, values: (string | number)[]) => string[]
  getDictItem: (keyOrData: string | DictItem[], value: string | number) => DictItem | null
  getDictValue: (key: string, label: string) => string | number | null
  removeDict: (key: string) => boolean
  cleanDict: () => void
}
```

## 最佳实践

### 1. 应用启动时预加载常用字典

```typescript
// App.vue
<script lang="ts" setup>
import { useDictStore } from '@/stores/modules/dict'
import { getDictDataByTypes } from '@/api/system/dict/dictDataApi'

const dictStore = useDictStore()

// 预加载常用字典
const preloadDicts = async () => {
  const commonDicts = [
    'sys_user_gender',
    'sys_normal_disable',
    'sys_yes_no',
    'sys_notice_type'
  ]

  const [err, data] = await getDictDataByTypes(commonDicts)
  if (!err && data) {
    Object.entries(data).forEach(([key, value]) => {
      dictStore.setDict(key, value)
    })
  }
}

onLaunch(() => {
  preloadDicts()
})
</script>
```

### 2. 创建字典标签组件

```vue
<!-- components/DictTag.vue -->
<template>
  <wd-tag v-if="dictItem" :type="dictItem.tagType || 'info'">
    {{ dictItem.label }}
  </wd-tag>
  <text v-else>{{ value }}</text>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const props = defineProps<{
  type: string
  value: string | number
}>()

const dictStore = useDictStore()

const dictItem = computed(() => {
  return dictStore.getDictItem(props.type, props.value)
})
</script>
```

**使用:**

```vue
<template>
  <view class="user-info">
    <DictTag type="sys_user_gender" :value="user.sex" />
    <DictTag type="sys_normal_disable" :value="user.status" />
  </view>
</template>
```

### 3. 表单选择器集成

```vue
<!-- components/DictSelect.vue -->
<template>
  <wd-picker
    :columns="options"
    :value="modelValue"
    @confirm="handleConfirm"
  >
    <wd-cell
      :title="label"
      :value="displayValue"
      is-link
    />
  </wd-picker>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDictStore } from '@/stores/modules/dict'

const props = defineProps<{
  type: string
  modelValue: string | number
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const dictStore = useDictStore()

// 选项列表
const options = computed(() => {
  const dict = dictStore.getDict(props.type) || []
  return dict.map(item => ({
    label: item.label,
    value: item.value
  }))
})

// 显示值
const displayValue = computed(() => {
  return dictStore.getDictLabel(props.type, props.modelValue) || '请选择'
})

const handleConfirm = ({ value }: { value: string | number }) => {
  emit('update:modelValue', value)
}
</script>
```

### 4. 避免重复请求

```typescript
// 使用缓存标记
const loadedTypes = new Set<string>()

const loadDictIfNeeded = async (type: string) => {
  // 已加载过，跳过
  if (loadedTypes.has(type)) {
    return dictStore.getDict(type)
  }

  // Store 中已有，标记并返回
  const cached = dictStore.getDict(type)
  if (cached) {
    loadedTypes.add(type)
    return cached
  }

  // 从服务器加载
  const [err, data] = await getDictDataByType(type)
  if (!err && data) {
    dictStore.setDict(type, data)
    loadedTypes.add(type)
    return data
  }

  return null
}
```

## 常见问题

### 1. 字典数据未及时更新

**问题原因：** 缓存的字典数据与服务器不同步

**解决方案：**

```typescript
// 强制刷新字典
const refreshDict = async (type: string) => {
  // 先删除旧数据
  dictStore.removeDict(type)

  // 重新加载
  const [err, data] = await getDictDataByType(type)
  if (!err && data) {
    dictStore.setDict(type, data)
  }
}
```

### 2. 字典值类型不匹配

**问题原因：** 后端返回数字，前端使用字符串比较

**解决方案：** `getDictLabel` 内部已处理，将值转换为字符串比较：

```typescript
const item = dictData.value.find((item) => item.value === String(value))
```

### 3. 大量字典数据导致内存占用

**问题原因：** 一次性加载过多字典

**解决方案：**

```typescript
// 1. 按需加载
const loadDictOnDemand = async (types: string[]) => {
  const needLoad = types.filter(type => !dictStore.getDict(type))
  if (needLoad.length > 0) {
    await loadDicts(needLoad)
  }
}

// 2. 定期清理不常用字典
const cleanUnusedDicts = () => {
  const commonDicts = ['sys_user_gender', 'sys_normal_disable']
  dictStore.dict.value.forEach((_, key) => {
    if (!commonDicts.includes(key)) {
      dictStore.removeDict(key)
    }
  })
}
```

### 4. 字典加载时序问题

**问题描述：** 组件渲染时字典数据尚未加载完成，导致显示空白或原始值

**问题原因：** 异步加载与同步渲染的时序冲突

**解决方案：**

```vue
<template>
  <view class="user-info">
    <!-- 方案1：使用加载状态 -->
    <wd-skeleton v-if="dictLoading" :rows="1" />
    <text v-else>{{ genderLabel }}</text>

    <!-- 方案2：提供默认值 -->
    <text>{{ genderLabel || user.gender }}</text>

    <!-- 方案3：使用 v-show 避免闪烁 -->
    <text v-show="!dictLoading">{{ genderLabel }}</text>
  </view>
</template>

<script lang="ts" setup>
const { sys_user_gender, dictLoading } = useDict(DictTypes.sys_user_gender)

const genderLabel = computed(() => {
  return dictStore.getDictLabel('sys_user_gender', user.gender)
})
</script>
```

### 5. 多组件重复请求同一字典

**问题描述：** 多个组件同时使用同一字典，导致重复 API 请求

**问题原因：** 并发请求时缓存还未写入

**解决方案：**

```typescript
// 使用请求去重
const pendingRequests = new Map<string, Promise<void>>()

const loadDictWithDedup = async (dictType: string) => {
  // 检查缓存
  if (dictStore.getDict(dictType)) {
    return
  }

  // 检查是否有进行中的请求
  if (pendingRequests.has(dictType)) {
    return pendingRequests.get(dictType)
  }

  // 创建新请求
  const promise = listDictDatasByDictType(dictType)
    .then(([err, data]) => {
      if (!err && data) {
        const dictData = data.map((p) => ({
          label: p.dictLabel,
          value: p.dictValue,
          elTagType: p.listClass,
        }))
        dictStore.setDict(dictType, dictData)
      }
    })
    .finally(() => {
      pendingRequests.delete(dictType)
    })

  pendingRequests.set(dictType, promise)
  return promise
}
```

### 6. 字典数据与后端不同步

**问题描述：** 管理员修改了字典数据，但前端缓存的是旧数据

**解决方案：**

```typescript
// 方案1：用户登录时清空字典缓存
const handleLogin = async () => {
  // 清空旧的字典数据
  dictStore.cleanDict()

  // 执行登录逻辑
  await login()

  // 预加载常用字典
  await preloadCommonDicts()
}

// 方案2：定时刷新（适合实时性要求高的场景）
let refreshTimer: number | null = null

const startDictRefresh = (interval = 5 * 60 * 1000) => {
  refreshTimer = setInterval(() => {
    dictStore.cleanDict()
    // 重新加载当前页面需要的字典
    reloadCurrentPageDicts()
  }, interval)
}

const stopDictRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 方案3：监听 WebSocket 消息刷新
const handleDictUpdate = (message: { type: string; dictType: string }) => {
  if (message.type === 'DICT_UPDATE') {
    dictStore.removeDict(message.dictType)
  }
}
```

## 性能优化

### 1. 预加载策略

在应用启动时预加载常用字典，避免使用时的等待：

```typescript
// App.vue 或 main.ts
const preloadCommonDicts = async () => {
  const commonDicts = [
    DictTypes.sys_user_gender,
    DictTypes.sys_enable_status,
    DictTypes.sys_notice_type,
    DictTypes.sys_boolean_flag,
  ]

  // 并行加载所有常用字典
  await Promise.all(
    commonDicts.map(async (dictType) => {
      if (!dictStore.getDict(dictType)) {
        const [err, data] = await listDictDatasByDictType(dictType)
        if (!err && data) {
          const dictData = data.map((p) => ({
            label: p.dictLabel,
            value: p.dictValue,
            elTagType: p.listClass,
          }))
          dictStore.setDict(dictType, dictData)
        }
      }
    })
  )

  console.log('常用字典预加载完成')
}

onLaunch(async () => {
  await preloadCommonDicts()
})
```

### 2. 批量获取优化

对于需要渲染多个字典值的列表，使用批量方法减少函数调用：

```typescript
// ❌ 低效：循环中多次调用
const labels = userList.map(user =>
  dictStore.getDictLabel('sys_user_gender', user.gender)
)

// ✅ 高效：一次批量获取
const genderValues = userList.map(user => user.gender)
const labels = dictStore.getDictLabels('sys_user_gender', genderValues)
```

### 3. 计算属性缓存

利用 Vue 的计算属性缓存机制，避免重复计算：

```typescript
// ❌ 每次渲染都会执行
const getLabel = (value: string) => {
  return dictStore.getDictLabel('sys_user_gender', value)
}

// ✅ 使用计算属性缓存
const genderLabel = computed(() => {
  return dictStore.getDictLabel('sys_user_gender', user.value.gender)
})
```

### 4. Map 结构优势

DictStore 使用 Map 而非普通对象存储字典数据，具有以下性能优势：

```typescript
// Map vs Object 性能对比
// Map: O(1) 查找，保持插入顺序，无原型污染
// Object: O(1) 查找，但有原型链查找开销

// 使用 Map 的好处
const dict = new Map<string, DictItem[]>()

// 1. 直接支持任意类型的 key
dict.set('sys_user_gender', [...])

// 2. 内置 size 属性
console.log(dict.size) // 直接获取字典数量

// 3. 遍历性能更好
dict.forEach((value, key) => {
  console.log(key, value)
})

// 4. 清空更高效
dict.clear()
```

## 调试技巧

### 1. 查看当前字典缓存

```typescript
// 在控制台查看所有缓存的字典
const dictStore = useDictStore()
console.log('当前缓存的字典类型:', [...dictStore.dict.value.keys()])
console.log('字典数据:', Object.fromEntries(dictStore.dict.value))
```

### 2. 监控字典加载

```typescript
// 添加加载日志
const useDictWithLog = (...args: string[]) => {
  console.log('[Dict] 请求加载:', args)

  const startTime = Date.now()
  const result = useDict(...args)

  watch(result.dictLoading, (loading) => {
    if (!loading) {
      console.log(`[Dict] 加载完成，耗时: ${Date.now() - startTime}ms`)
      args.forEach(type => {
        const data = result[type]
        console.log(`[Dict] ${type}:`, data?.length || 0, '项')
      })
    }
  })

  return result
}
```

### 3. 字典数据验证

```typescript
// 验证字典数据完整性
const validateDict = (dictType: string) => {
  const dictData = dictStore.getDict(dictType)

  if (!dictData) {
    console.warn(`[Dict] ${dictType} 未加载`)
    return false
  }

  const issues: string[] = []

  dictData.forEach((item, index) => {
    if (!item.label) {
      issues.push(`项 ${index}: 缺少 label`)
    }
    if (item.value === undefined || item.value === null) {
      issues.push(`项 ${index}: 缺少 value`)
    }
  })

  if (issues.length > 0) {
    console.warn(`[Dict] ${dictType} 数据问题:`, issues)
    return false
  }

  console.log(`[Dict] ${dictType} 验证通过，共 ${dictData.length} 项`)
  return true
}
```

### 4. Vue DevTools 集成

DictStore 基于 Pinia，可以直接在 Vue DevTools 中查看和修改：

```text
1. 打开 Vue DevTools
2. 切换到 "Pinia" 标签
3. 选择 "dict" Store
4. 查看 dict 状态（Map 结构）
5. 可以直接修改状态进行调试
```

## 高级用法

### 1. 自定义字典组件

创建通用的字典展示组件：

```vue
<!-- components/DictDisplay.vue -->
<template>
  <view class="dict-display">
    <!-- 标签模式 -->
    <wd-tag
      v-if="mode === 'tag' && dictItem"
      :type="tagType"
      :class="dictItem.elTagClass"
    >
      {{ dictItem.label }}
    </wd-tag>

    <!-- 文本模式 -->
    <text v-else-if="mode === 'text'">
      {{ label }}
    </text>

    <!-- 徽标模式 -->
    <wd-badge
      v-else-if="mode === 'badge'"
      :type="tagType"
      :value="label"
    />

    <!-- 默认：显示原始值 -->
    <text v-else class="dict-fallback">{{ value }}</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 字典类型 */
  type: string
  /** 字典值 */
  value: string | number
  /** 显示模式 */
  mode?: 'tag' | 'text' | 'badge'
  /** 默认标签类型 */
  defaultTagType?: string
}>(), {
  mode: 'tag',
  defaultTagType: 'info'
})

const dictStore = useDictStore()

const dictItem = computed(() => {
  return dictStore.getDictItem(props.type, props.value)
})

const label = computed(() => {
  return dictItem.value?.label || String(props.value)
})

const tagType = computed(() => {
  return dictItem.value?.elTagType || props.defaultTagType
})
</script>

<style lang="scss" scoped>
.dict-fallback {
  color: #999;
}
</style>
```

**使用示例：**

```vue
<template>
  <view class="user-list">
    <view v-for="user in users" :key="user.id" class="user-item">
      <text>{{ user.name }}</text>

      <!-- 标签模式 -->
      <DictDisplay type="sys_user_gender" :value="user.gender" />

      <!-- 文本模式 -->
      <DictDisplay
        type="sys_enable_status"
        :value="user.status"
        mode="text"
      />
    </view>
  </view>
</template>
```

### 2. 字典选择器封装

```vue
<!-- components/DictPicker.vue -->
<template>
  <wd-picker
    v-model="innerValue"
    :columns="columns"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const props = withDefaults(defineProps<{
  /** 字典类型 */
  type: string
  /** 绑定值 */
  modelValue: string | number
  /** 标签 */
  label?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 值字段 */
  valueKey?: string
  /** 标签字段 */
  labelKey?: string
}>(), {
  placeholder: '请选择',
  valueKey: 'value',
  labelKey: 'label'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [item: DictItem | null]
}>()

// 加载字典
const dictResult = useDict(props.type)
const dictData = computed(() => dictResult[props.type] || [])

// 内部值
const innerValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  innerValue.value = val
})

// 选项列表
const columns = computed(() => {
  return dictData.value.map(item => ({
    label: item[props.labelKey],
    value: item[props.valueKey]
  }))
})

// 确认选择
const handleConfirm = ({ value }: { value: string | number }) => {
  emit('update:modelValue', value)

  const item = dictData.value.find(d => d.value === value)
  emit('change', item || null)
}
</script>
```

### 3. 批量字典加载工具

```typescript
// utils/dictLoader.ts
import { useDictStore } from '@/stores/modules/dict'
import { listDictDatasByDictType } from '@/api/system/dict/dictData/dictDataApi'

/**
 * 批量加载字典
 */
export async function batchLoadDicts(
  dictTypes: string[],
  options?: {
    force?: boolean  // 是否强制刷新
    onProgress?: (loaded: number, total: number) => void
  }
) {
  const dictStore = useDictStore()
  const { force = false, onProgress } = options || {}

  // 过滤需要加载的字典
  const toLoad = force
    ? dictTypes
    : dictTypes.filter(type => !dictStore.getDict(type))

  if (toLoad.length === 0) {
    return { success: true, loaded: 0 }
  }

  let loaded = 0
  const errors: Array<{ type: string; error: any }> = []

  // 并行加载
  await Promise.all(
    toLoad.map(async (dictType) => {
      try {
        const [err, data] = await listDictDatasByDictType(dictType)

        if (err) {
          errors.push({ type: dictType, error: err })
        } else if (data) {
          const dictData = data.map((p) => ({
            label: p.dictLabel,
            value: p.dictValue,
            status: p.status,
            elTagType: p.listClass,
            elTagClass: p.cssClass,
          }))
          dictStore.setDict(dictType, dictData)
        }
      } catch (error) {
        errors.push({ type: dictType, error })
      } finally {
        loaded++
        onProgress?.(loaded, toLoad.length)
      }
    })
  )

  return {
    success: errors.length === 0,
    loaded: loaded - errors.length,
    errors
  }
}

/**
 * 获取字典加载状态
 */
export function getDictLoadStatus(dictTypes: string[]) {
  const dictStore = useDictStore()

  return dictTypes.map(type => ({
    type,
    loaded: !!dictStore.getDict(type),
    count: dictStore.getDict(type)?.length || 0
  }))
}
```

## 注意事项

### 1. 内存管理

```typescript
// 长时间运行的应用应定期清理不常用字典
const COMMON_DICTS = new Set([
  'sys_user_gender',
  'sys_enable_status',
  'sys_boolean_flag'
])

// 页面切换时清理非常用字典
onHide(() => {
  dictStore.dict.value.forEach((_, key) => {
    if (!COMMON_DICTS.has(key)) {
      dictStore.removeDict(key)
    }
  })
})
```

### 2. 值类型一致性

```typescript
// 后端可能返回数字，前端使用字符串
// getDictLabel 内部会将 value 转为字符串比较
const label = dictStore.getDictLabel('sys_user_gender', 0)  // ✅ 有效
const label = dictStore.getDictLabel('sys_user_gender', '0') // ✅ 有效

// 但设置字典时建议统一为字符串
const dictData = data.map(p => ({
  label: p.dictLabel,
  value: String(p.dictValue), // 统一转为字符串
}))
```

### 3. 响应式注意

```typescript
// 直接解构会失去响应式
const { sys_user_gender } = useDict(DictTypes.sys_user_gender)
// sys_user_gender 是响应式的 Ref

// 在模板中直接使用
<wd-radio v-for="item in sys_user_gender" :key="item.value">

// 在 script 中需要 .value
watch(sys_user_gender, (newVal) => {
  console.log('字典数据变化:', newVal)
})
```

### 4. SSR 兼容性

```typescript
// 服务端渲染时需要注意字典加载时机
if (process.client) {
  // 仅在客户端加载字典
  const { sys_user_gender } = useDict(DictTypes.sys_user_gender)
}

// 或使用 onMounted 确保在客户端执行
onMounted(() => {
  loadDicts()
})
```
