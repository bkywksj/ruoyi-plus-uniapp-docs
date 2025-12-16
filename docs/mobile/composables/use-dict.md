# useDict 字典数据管理

## 介绍

`useDict` 是 RuoYi-Plus-UniApp 提供的字典数据管理组合式函数(Composable),用于在组件中便捷地获取和使用系统字典数据。字典数据是系统中常用的配置数据类型,如用户状态、性别、通知类型等枚举值。

**核心特性:**

- **并行加载** - 支持同时加载多个字典类型,通过 `Promise.all()` 实现并行请求,提高加载效率
- **智能缓存** - 基于 Pinia 状态管理,已加载的字典数据会被缓存在内存中,避免重复请求
- **响应式数据** - 返回 Vue 3 响应式引用,字典数据变化时自动更新 UI
- **加载状态** - 提供 `dictLoading` 状态,方便在 UI 中显示加载指示器
- **类型安全** - 使用 TypeScript 枚举定义系统字典类型,提供完整的类型提示和检查
- **容错处理** - 单个字典加载失败不影响其他字典,错误会被捕获并输出到控制台
- **统一转换** - 自动将后端返回的字典数据转换为统一的 `DictItem` 格式,便于前端使用
- **灵活使用** - 可在任何 Vue 组件或其他 Composable 中使用,支持解构赋值

系统预定义了 16 种常用字典类型,涵盖用户管理、系统配置、通知管理等多个功能模块。通过 `DictTypes` 枚举可以获得完整的类型提示,避免手写字典类型字符串导致的错误。

## 基本用法

### 加载单个字典

最简单的用法是加载单个字典类型:

```vue
<template>
  <view class="demo">
    <view v-if="dictLoading">加载中...</view>
    <view v-else>
      <view v-for="item in sys_normal_disable" :key="item.value">
        {{ item.label }}: {{ item.value }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useDict, DictTypes } from '@/composables/useDict'

// 加载系统状态字典
const { sys_normal_disable, dictLoading } = useDict(DictTypes.SYS_NORMAL_DISABLE)
</script>

```

**使用说明:**
- 调用 `useDict()` 并传入字典类型名称
- 使用解构赋值获取字典数据和加载状态
- `sys_normal_disable` 是响应式引用,包含字典项数组
- `dictLoading` 是布尔值响应式引用,指示加载状态
- 字典首次加载时会请求后端 API,后续使用从缓存读取

### 加载多个字典

`useDict` 支持同时加载多个字典,字典会并行请求以提高效率:

```vue
<template>
  <view class="user-form">
    <view v-if="dictLoading" class="loading">加载字典数据中...</view>

    <view v-else class="form">
      <!-- 用户性别选择 -->
      <view class="form-item">
        <text class="label">性别:</text>
        <picker mode="selector" :range="sys_user_sex" range-key="label" @change="handleGenderChange">
          <view class="picker">{{ selectedGender || '请选择性别' }}</view>
        </picker>
      </view>

      <!-- 用户状态选择 -->
      <view class="form-item">
        <text class="label">状态:</text>
        <picker mode="selector" :range="sys_normal_disable" range-key="label" @change="handleStatusChange">
          <view class="picker">{{ selectedStatus || '请选择状态' }}</view>
        </picker>
      </view>

      <!-- 是否选项 -->
      <view class="form-item">
        <text class="label">是否启用:</text>
        <picker mode="selector" :range="sys_yes_no" range-key="label" @change="handleEnableChange">
          <view class="picker">{{ selectedEnable || '请选择' }}</view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

// 并行加载多个字典
const {
  sys_user_sex,           // 用户性别
  sys_normal_disable,     // 系统状态
  sys_yes_no,             // 是否选项
  dictLoading             // 加载状态
} = useDict(
  DictTypes.SYS_USER_SEX,
  DictTypes.SYS_NORMAL_DISABLE,
  DictTypes.SYS_YES_NO
)

const selectedGender = ref('')
const selectedStatus = ref('')
const selectedEnable = ref('')

const handleGenderChange = (e: any) => {
  const index = e.detail.value
  selectedGender.value = sys_user_sex.value[index].label
}

const handleStatusChange = (e: any) => {
  const index = e.detail.value
  selectedStatus.value = sys_normal_disable.value[index].label
}

const handleEnableChange = (e: any) => {
  const index = e.detail.value
  selectedEnable.value = sys_yes_no.value[index].label
}
</script>

```

**技术实现:**
- 传入多个字典类型参数,内部使用 `Promise.all()` 并行加载
- 所有字典加载完成后,`dictLoading` 才会变为 `false`
- 每个字典独立处理错误,单个失败不影响其他字典
- 解构赋值的变量名必须与字典类型名称一致

### 在表单中使用

字典数据常用于表单的下拉选择组件:

```vue
<template>
  <view class="notice-form">
    <wd-form ref="formRef" :model="formData">
      <!-- 通知类型 -->
      <wd-form-item label="通知类型" prop="noticeType">
        <wd-select
          v-model="formData.noticeType"
          :options="sys_notice_type"
          placeholder="请选择通知类型"
          :loading="dictLoading"
        />
      </wd-form-item>

      <!-- 通知状态 -->
      <wd-form-item label="通知状态" prop="status">
        <wd-select
          v-model="formData.status"
          :options="sys_notice_status"
          placeholder="请选择通知状态"
          :loading="dictLoading"
        />
      </wd-form-item>

      <!-- 提交按钮 -->
      <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

interface NoticeForm {
  noticeType: string
  status: string
}

const formRef = ref()
const formData = reactive<NoticeForm>({
  noticeType: '',
  status: ''
})

// 加载表单所需的字典
const {
  sys_notice_type,
  sys_notice_status,
  dictLoading
} = useDict(
  DictTypes.SYS_NOTICE_TYPE,
  DictTypes.SYS_NOTICE_STATUS
)

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('表单数据:', formData)
    // 提交逻辑
  }
}
</script>

```

**使用说明:**
- WD UI 的 `wd-select` 组件直接接受 `DictItem[]` 格式的 options
- 通过 `:loading="dictLoading"` 在字典加载时显示加载状态
- `DictItem` 的 `label` 和 `value` 字段会自动映射到选项的显示文本和值

### 在列表中展示

字典数据也常用于列表数据的标签展示:

```vue
<template>
  <view class="user-list">
    <view v-if="dictLoading" class="loading">加载中...</view>

    <view v-else class="list">
      <view v-for="user in userList" :key="user.userId" class="user-item">
        <view class="user-info">
          <text class="name">{{ user.userName }}</text>
          <text class="dept">{{ user.deptName }}</text>
        </view>

        <view class="user-tags">
          <!-- 性别标签 -->
          <wd-tag :type="getGenderTag(user.sex)">
            {{ getDictLabel(sys_user_sex, user.sex) }}
          </wd-tag>

          <!-- 状态标签 -->
          <wd-tag :type="getStatusTag(user.status)">
            {{ getDictLabel(sys_normal_disable, user.status) }}
          </wd-tag>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'
import { useDictStore } from '@/stores/modules/dict'

interface User {
  userId: string
  userName: string
  deptName: string
  sex: string
  status: string
}

const dictStore = useDictStore()

// 加载用户列表相关字典
const {
  sys_user_sex,
  sys_normal_disable,
  dictLoading
} = useDict(
  DictTypes.SYS_USER_SEX,
  DictTypes.SYS_NORMAL_DISABLE
)

const userList = ref<User[]>([
  { userId: '1', userName: '张三', deptName: '研发部', sex: '0', status: '0' },
  { userId: '2', userName: '李四', deptName: '市场部', sex: '1', status: '1' },
])

// 获取字典标签文本
const getDictLabel = (dict: any, value: string) => {
  const item = dict.value.find((item: any) => item.value === value)
  return item?.label || value
}

// 根据性别获取标签类型
const getGenderTag = (sex: string) => {
  return sex === '0' ? 'primary' : 'success'
}

// 根据状态获取标签类型
const getStatusTag = (status: string) => {
  return status === '0' ? 'success' : 'danger'
}
</script>

```

**技术实现:**
- 通过 `find()` 方法在字典数组中查找对应值的标签文本
- 可以根据字典值返回不同的标签样式
- 字典数据是响应式的,可以在需要时动态更新

### 使用 DictStore 方法

除了 `useDict` 返回的字典数据,还可以使用 `useDictStore` 提供的工具方法:

```vue
<template>
  <view class="dict-demo">
    <view class="section">
      <text class="title">字典标签查询:</text>
      <text class="result">
        性别 '0' 的标签: {{ genderLabel }}
      </text>
    </view>

    <view class="section">
      <text class="title">字典值查询:</text>
      <text class="result">
        标签 '男' 的值: {{ genderValue }}
      </text>
    </view>

    <view class="section">
      <text class="title">批量标签查询:</text>
      <text class="result">
        状态 ['0', '1'] 的标签: {{ statusLabels.join(', ') }}
      </text>
    </view>

    <view class="section">
      <text class="title">获取字典项对象:</text>
      <text class="result">
        性别 '0' 的完整信息: {{ JSON.stringify(genderItem) }}
      </text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 加载字典数据
const { sys_user_sex, sys_normal_disable } = useDict(
  DictTypes.SYS_USER_SEX,
  DictTypes.SYS_NORMAL_DISABLE
)

// 使用 dictStore 方法获取字典标签
const genderLabel = computed(() => {
  return dictStore.getDictLabel(DictTypes.SYS_USER_SEX, '0')
})

// 反向查询:通过标签获取值
const genderValue = computed(() => {
  return dictStore.getDictValue(DictTypes.SYS_USER_SEX, '男')
})

// 批量获取标签
const statusLabels = computed(() => {
  return dictStore.getDictLabels(DictTypes.SYS_NORMAL_DISABLE, ['0', '1'])
})

// 获取完整的字典项对象
const genderItem = computed(() => {
  return dictStore.getDictItem(DictTypes.SYS_USER_SEX, '0')
})
</script>

```

**DictStore 提供的方法:**
- `getDictLabel(key, value)` - 通过字典类型和值获取标签文本
- `getDictValue(key, label)` - 通过字典类型和标签获取值(反向查询)
- `getDictLabels(key, values)` - 批量获取多个值的标签文本
- `getDictItem(key, value)` - 获取完整的字典项对象(包含所有属性)
- `getDict(key)` - 获取整个字典数组
- `setDict(key, value)` - 手动设置字典数据
- `removeDict(key)` - 移除指定字典
- `cleanDict()` - 清空所有字典缓存

### 动态字典类型

虽然推荐使用 `DictTypes` 枚举,但也可以动态传入字典类型字符串:

```vue
<template>
  <view class="dynamic-dict">
    <view class="input-group">
      <input v-model="dictType" placeholder="输入字典类型" />
      <button @click="loadDict">加载字典</button>
    </view>

    <view v-if="loading" class="loading">加载中...</view>

    <view v-else-if="dictData.length > 0" class="dict-list">
      <view v-for="item in dictData" :key="item.value" class="dict-item">
        {{ item.label }}: {{ item.value }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { listDictDatasByDictType } from '@/api/system/dict/data'
import type { DictItem } from '@/stores/modules/dict'

const dictStore = useDictStore()
const dictType = ref('')
const dictData = ref<DictItem[]>([])
const loading = ref(false)

const loadDict = async () => {
  if (!dictType.value) return

  loading.value = true

  try {
    // 先检查缓存
    const cachedDict = dictStore.getDict(dictType.value)
    if (cachedDict) {
      dictData.value = cachedDict
      loading.value = false
      return
    }

    // 加载新字典
    const [err, data] = await listDictDatasByDictType(dictType.value)
    if (err) {
      console.error('加载字典失败:', err)
      return
    }

    // 转换数据格式
    const formattedData = data.map(p => ({
      label: p.dictLabel,
      value: p.dictValue,
      status: p.status,
      elTagType: p.listClass,
      elTagClass: p.cssClass,
    }))

    // 保存到缓存
    dictStore.setDict(dictType.value, formattedData)
    dictData.value = formattedData
  } finally {
    loading.value = false
  }
}
</script>

```

**使用说明:**
- 可以在运行时根据用户输入或其他条件动态加载字典
- 手动调用 API 和缓存管理方法
- 适用于字典类型不确定的场景

## 字典类型定义

### DictTypes 枚举

系统预定义了 16 种常用字典类型,通过 `DictTypes` 枚举访问:

```typescript
/**
 * 系统字典类型枚举
 */
export enum DictTypes {
  /** 用户性别 */
  SYS_USER_SEX = 'sys_user_sex',

  /** 菜单状态 */
  SYS_SHOW_HIDE = 'sys_show_hide',

  /** 系统开关 */
  SYS_NORMAL_DISABLE = 'sys_normal_disable',

  /** 系统是否 */
  SYS_YES_NO = 'sys_yes_no',

  /** 通知类型 */
  SYS_NOTICE_TYPE = 'sys_notice_type',

  /** 通知状态 */
  SYS_NOTICE_STATUS = 'sys_notice_status',

  /** 操作类型 */
  SYS_OPER_TYPE = 'sys_oper_type',

  /** 系统状态 */
  SYS_COMMON_STATUS = 'sys_common_status',

  /** 授权类型 */
  SYS_GRANT_TYPE = 'sys_grant_type',

  /** 设备类型 */
  SYS_DEVICE_TYPE = 'sys_device_type',

  /** OSS 预设 ACL */
  SYS_OSS_POLICY_TYPE = 'sys_oss_policy_type',

  /** OSS 文件类型 */
  SYS_OSS_FILE_TYPE = 'sys_oss_file_type',

  /** OSS 桶访问策略 */
  SYS_OSS_ACCESS_POLICY = 'sys_oss_access_policy',

  /** OSS 服务商 */
  SYS_OSS_SERVICE = 'sys_oss_service',

  /** 租户套餐状态 */
  SYS_TENANT_PACKAGE_STATUS = 'sys_tenant_package_status',

  /** 租户状态 */
  SYS_TENANT_STATUS = 'sys_tenant_status',
}
```

**字典类型说明:**

| 字典类型 | 常量名称 | 值 | 用途 |
|---------|---------|---|------|
| 用户性别 | `SYS_USER_SEX` | `'sys_user_sex'` | 用户性别选择(男/女/未知) |
| 菜单状态 | `SYS_SHOW_HIDE` | `'sys_show_hide'` | 菜单显示/隐藏状态 |
| 系统开关 | `SYS_NORMAL_DISABLE` | `'sys_normal_disable'` | 通用启用/停用状态 |
| 系统是否 | `SYS_YES_NO` | `'sys_yes_no'` | 通用是/否选项 |
| 通知类型 | `SYS_NOTICE_TYPE` | `'sys_notice_type'` | 通知公告类型(通知/公告) |
| 通知状态 | `SYS_NOTICE_STATUS` | `'sys_notice_status'` | 通知发布状态(正常/关闭) |
| 操作类型 | `SYS_OPER_TYPE` | `'sys_oper_type'` | 操作日志类型(新增/修改/删除等) |
| 系统状态 | `SYS_COMMON_STATUS` | `'sys_common_status'` | 通用状态(正常/停用) |
| 授权类型 | `SYS_GRANT_TYPE` | `'sys_grant_type'` | OAuth2 授权类型 |
| 设备类型 | `SYS_DEVICE_TYPE` | `'sys_device_type'` | 登录设备类型(PC/Android/iOS等) |
| OSS 预设 ACL | `SYS_OSS_POLICY_TYPE` | `'sys_oss_policy_type'` | OSS 访问控制策略 |
| OSS 文件类型 | `SYS_OSS_FILE_TYPE` | `'sys_oss_file_type'` | 文件类型分类 |
| OSS 桶访问策略 | `SYS_OSS_ACCESS_POLICY` | `'sys_oss_access_policy'` | OSS 存储桶访问策略 |
| OSS 服务商 | `SYS_OSS_SERVICE` | `'sys_oss_service'` | OSS 云服务提供商 |
| 租户套餐状态 | `SYS_TENANT_PACKAGE_STATUS` | `'sys_tenant_package_status'` | 租户套餐启用状态 |
| 租户状态 | `SYS_TENANT_STATUS` | `'sys_tenant_status'` | 租户启用状态 |

### DictItem 数据结构

每个字典项都遵循统一的 `DictItem` 接口:

```typescript
/**
 * 字典项接口
 */
export interface DictItem {
  /** 字典标签(显示文本) */
  label: string

  /** 字典键值(实际值) */
  value: string | number

  /** 状态(0正常 1停用) */
  status?: string

  /** Element Plus Tag 组件类型 */
  elTagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger'

  /** Element Plus Tag 组件 CSS 类名 */
  elTagClass?: string
}
```

**字段说明:**
- `label` - 显示给用户的文本,如 "男"、"女"、"启用"、"停用"
- `value` - 实际存储和传输的值,通常是数字或字符串代码
- `status` - 字典项本身的状态,可用于过滤停用的字典项
- `elTagType` - 用于 Element Plus 或 WD UI Tag 组件的类型,控制颜色
- `elTagClass` - 自定义 CSS 类名,用于更灵活的样式控制

### DataResult 返回类型

`useDict` 函数的返回类型是动态的,根据传入的字典类型参数生成:

```typescript
/**
 * useDict 返回类型
 */
export type DataResult = {
  /** 字典加载状态 */
  dictLoading: Ref<boolean>
  /** 动态字典数据(根据传入的字典类型参数) */
  [key: string]: Ref<DictItem[]> | Ref<boolean>
}
```

**类型说明:**
- 返回对象包含 `dictLoading` 和所有请求的字典类型
- 每个字典类型对应一个 `Ref<DictItem[]>` 响应式引用
- `dictLoading` 是 `Ref<boolean>`,表示所有字典的加载状态
- 支持 TypeScript 类型推断和自动补全

**使用示例:**

```typescript
// 单个字典
const result1 = useDict(DictTypes.SYS_USER_SEX)
// result1 类型: {
//   sys_user_sex: Ref<DictItem[]>
//   dictLoading: Ref<boolean>
// }

// 多个字典
const result2 = useDict(
  DictTypes.SYS_USER_SEX,
  DictTypes.SYS_NORMAL_DISABLE
)
// result2 类型: {
//   sys_user_sex: Ref<DictItem[]>
//   sys_normal_disable: Ref<DictItem[]>
//   dictLoading: Ref<boolean>
// }
```

## API

### useDict 函数

```typescript
function useDict(...args: string[]): DataResult
```

**参数:**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| ...args | `string[]` | 是 | 字典类型名称,支持传入多个参数 |

**返回值:**

返回一个对象,包含以下属性:

| 属性名 | 类型 | 说明 |
|-------|------|------|
| dictLoading | `Ref<boolean>` | 字典加载状态,所有字典加载完成后变为 `false` |
| [dictType] | `Ref<DictItem[]>` | 每个字典类型对应的响应式数据数组 |

**使用示例:**

```typescript
// 基本用法
const { sys_user_sex, dictLoading } = useDict(DictTypes.SYS_USER_SEX)

// 加载多个字典
const {
  sys_user_sex,
  sys_normal_disable,
  sys_yes_no,
  dictLoading
} = useDict(
  DictTypes.SYS_USER_SEX,
  DictTypes.SYS_NORMAL_DISABLE,
  DictTypes.SYS_YES_NO
)

// 使用字符串(不推荐)
const { my_custom_dict, dictLoading } = useDict('my_custom_dict')
```

### useDictStore 方法

字典 Store 提供以下方法用于字典数据管理:

#### getDict

获取指定类型的完整字典数组:

```typescript
function getDict(key: string): DictItem[] | null
```

**参数:**
- `key` - 字典类型名称

**返回值:**
- 返回字典项数组,如果不存在返回 `null`

**示例:**

```typescript
const dictStore = useDictStore()
const genderDict = dictStore.getDict(DictTypes.SYS_USER_SEX)
// 返回: [{ label: '男', value: '0' }, { label: '女', value: '1' }, ...]
```

#### setDict

手动设置字典数据到缓存:

```typescript
function setDict(key: string, value: DictItem[]): boolean
```

**参数:**
- `key` - 字典类型名称
- `value` - 字典项数组

**返回值:**
- 设置成功返回 `true`,失败返回 `false`

**示例:**

```typescript
const dictStore = useDictStore()
const customDict: DictItem[] = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
]
dictStore.setDict('custom_dict', customDict)
```

#### getDictLabel

通过字典值获取对应的标签文本:

```typescript
function getDictLabel(
  keyOrData: string | Ref<DictItem[]> | DictItem[],
  value: string | number
): string
```

**参数:**
- `keyOrData` - 字典类型名称、响应式字典数组或普通字典数组
- `value` - 要查询的字典值

**返回值:**
- 返回对应的标签文本,找不到返回空字符串

**示例:**

```typescript
const dictStore = useDictStore()

// 方式1: 使用字典类型名称
const label1 = dictStore.getDictLabel(DictTypes.SYS_USER_SEX, '0')
// 返回: '男'

// 方式2: 使用响应式数组
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)
const label2 = dictStore.getDictLabel(sys_user_sex, '0')
// 返回: '男'

// 方式3: 使用普通数组
const dict = [{ label: '选项1', value: '1' }]
const label3 = dictStore.getDictLabel(dict, '1')
// 返回: '选项1'
```

#### getDictLabels

批量获取多个字典值的标签文本:

```typescript
function getDictLabels(
  keyOrData: string | Ref<DictItem[]>,
  values: (string | number)[]
): string[]
```

**参数:**
- `keyOrData` - 字典类型名称或响应式字典数组
- `values` - 要查询的字典值数组

**返回值:**
- 返回标签文本数组,保持与输入值相同的顺序

**示例:**

```typescript
const dictStore = useDictStore()

// 批量查询
const labels = dictStore.getDictLabels(
  DictTypes.SYS_NORMAL_DISABLE,
  ['0', '1']
)
// 返回: ['正常', '停用']

// 结合响应式数组
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)
const genderLabels = dictStore.getDictLabels(sys_user_sex, ['0', '1', '2'])
// 返回: ['男', '女', '未知']
```

#### getDictValue

反向查询:通过标签获取对应的字典值:

```typescript
function getDictValue(
  key: string,
  label: string
): string | number | null
```

**参数:**
- `key` - 字典类型名称
- `label` - 要查询的标签文本

**返回值:**
- 返回对应的字典值,找不到返回 `null`

**示例:**

```typescript
const dictStore = useDictStore()

const value1 = dictStore.getDictValue(DictTypes.SYS_USER_SEX, '男')
// 返回: '0'

const value2 = dictStore.getDictValue(DictTypes.SYS_NORMAL_DISABLE, '停用')
// 返回: '1'

const value3 = dictStore.getDictValue(DictTypes.SYS_YES_NO, '是')
// 返回: 'Y'
```

#### getDictItem

获取完整的字典项对象:

```typescript
function getDictItem(
  keyOrData: string | DictItem[],
  value: string | number
): DictItem | null
```

**参数:**
- `keyOrData` - 字典类型名称或普通字典数组
- `value` - 要查询的字典值

**返回值:**
- 返回完整的 `DictItem` 对象,找不到返回 `null`

**示例:**

```typescript
const dictStore = useDictStore()

const item = dictStore.getDictItem(DictTypes.SYS_USER_SEX, '0')
// 返回: {
//   label: '男',
//   value: '0',
//   status: '0',
//   elTagType: 'primary',
//   elTagClass: ''
// }

// 使用字典项的所有属性
if (item) {
  console.log(`标签: ${item.label}`)
  console.log(`值: ${item.value}`)
  console.log(`标签类型: ${item.elTagType}`)
}
```

#### removeDict

从缓存中移除指定字典:

```typescript
function removeDict(key: string): boolean
```

**参数:**
- `key` - 字典类型名称

**返回值:**
- 移除成功返回 `true`,失败返回 `false`

**示例:**

```typescript
const dictStore = useDictStore()

// 移除单个字典
dictStore.removeDict(DictTypes.SYS_USER_SEX)

// 下次调用 useDict 时会重新加载
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)
```

#### cleanDict

清空所有字典缓存:

```typescript
function cleanDict(): void
```

**参数:**
- 无

**返回值:**
- 无

**示例:**

```typescript
const dictStore = useDictStore()

// 清空所有字典缓存
dictStore.cleanDict()

// 所有字典都需要重新加载
```

## 源码实现

### useDict 实现原理

`useDict` 的核心实现逻辑:

```typescript
import { reactive, ref, toRefs } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { listDictDatasByDictType } from '@/api/system/dict/data'
import type { DictItem } from '@/stores/modules/dict'

export const useDict = (...args: string[]): DataResult => {
  const dictStore = useDictStore()
  const dictObject = reactive<Record<string, DictItem[]>>({})
  const dictLoading = ref(true)
  const promises: Promise<void>[] = []

  args.forEach((dictType) => {
    // 初始化字典数据为空数组
    dictObject[dictType] = []

    // 检查缓存
    const cachedDict = dictStore.getDict(dictType)
    let promise: Promise<void>

    if (cachedDict) {
      // 使用缓存数据
      dictObject[dictType] = cachedDict
      promise = Promise.resolve()
    } else {
      // 从API加载
      promise = listDictDatasByDictType(dictType).then(([err, data]) => {
        if (err) {
          console.error(`获取字典[${dictType}]失败:`, err)
          return
        }

        // 转换数据格式
        const dictData = data.map(
          (p): DictItem => ({
            label: p.dictLabel,
            value: p.dictValue,
            status: p.status,
            elTagType: p.listClass,
            elTagClass: p.cssClass,
          }),
        )

        // 更新响应式对象和缓存
        dictObject[dictType] = dictData
        dictStore.setDict(dictType, dictData)
      })
    }

    promises.push(promise)
  })

  // 等待所有字典加载完成
  Promise.all(promises).finally(() => {
    dictLoading.value = false
  })

  // 返回响应式引用
  return {
    ...toRefs(dictObject),
    dictLoading,
  } as DataResult
}
```

**实现要点:**

1. **响应式数据管理**
   - 使用 `reactive()` 创建响应式对象存储所有字典数据
   - 使用 `toRefs()` 将响应式对象转换为独立的 ref,支持解构赋值
   - `dictLoading` 使用 `ref()` 创建独立的响应式引用

2. **缓存策略**
   - 每次加载前先检查 dictStore 中是否有缓存
   - 有缓存直接使用,无缓存才请求 API
   - API 返回后同时更新响应式对象和 dictStore 缓存

3. **并行加载**
   - 使用 `Promise.all()` 并行加载所有字典
   - 每个字典独立处理,失败不影响其他字典
   - 所有 Promise 完成后统一设置 `dictLoading` 为 `false`

4. **错误处理**
   - 单个字典加载失败只打印错误,不中断流程
   - 失败的字典保持为空数组,不影响页面渲染

5. **数据转换**
   - 将后端返回的字典数据转换为统一的 `DictItem` 格式
   - 映射字段: `dictLabel` → `label`, `dictValue` → `value`

### DictStore 实现原理

字典 Store 使用 Map 数据结构管理缓存:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DictItem } from './types'

export const useDictStore = defineStore('dict', () => {
  // 使用 Map 存储字典数据
  const dict = ref<Map<string, DictItem[]>>(new Map())

  /**
   * 获取字典
   */
  const getDict = (key: string): DictItem[] | null => {
    if (!key) return null
    return dict.value.get(key) || null
  }

  /**
   * 设置字典
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

  /**
   * 获取字典标签
   */
  const getDictLabel = (
    keyOrData: string | Ref<DictItem[]> | DictItem[],
    value: string | number,
  ): string => {
    let dictData: DictItem[] | null = null

    if (typeof keyOrData === 'string') {
      dictData = getDict(keyOrData)
    } else if (isRef(keyOrData)) {
      dictData = keyOrData.value
    } else {
      dictData = keyOrData
    }

    if (!dictData || dictData.length === 0) return ''

    const item = dictData.find((item) => String(item.value) === String(value))
    return item?.label || ''
  }

  /**
   * 批量获取字典标签
   */
  const getDictLabels = (
    keyOrData: string | Ref<DictItem[]>,
    values: (string | number)[],
  ): string[] => {
    return values.map((value) => getDictLabel(keyOrData, value))
  }

  /**
   * 获取字典项对象
   */
  const getDictItem = (
    keyOrData: string | DictItem[],
    value: string | number,
  ): DictItem | null => {
    let dictData: DictItem[] | null = null

    if (typeof keyOrData === 'string') {
      dictData = getDict(keyOrData)
    } else {
      dictData = keyOrData
    }

    if (!dictData || dictData.length === 0) return null

    const item = dictData.find((item) => String(item.value) === String(value))
    return item || null
  }

  /**
   * 反向查询:通过标签获取值
   */
  const getDictValue = (key: string, label: string): string | number | null => {
    const dictData = getDict(key)
    if (!dictData || dictData.length === 0) return null

    const item = dictData.find((item) => item.label === label)
    return item?.value ?? null
  }

  /**
   * 移除字典
   */
  const removeDict = (key: string): boolean => {
    if (!key) return false
    try {
      dict.value.delete(key)
      return true
    } catch (e) {
      console.error('移除字典时发生错误:', e)
      return false
    }
  }

  /**
   * 清空所有字典
   */
  const cleanDict = (): void => {
    dict.value.clear()
  }

  return {
    dict,
    getDict,
    setDict,
    getDictLabel,
    getDictLabels,
    getDictItem,
    getDictValue,
    removeDict,
    cleanDict,
  }
})
```

**实现要点:**

1. **Map 数据结构**
   - 使用 `Map<string, DictItem[]>` 存储字典数据
   - Map 相比普通对象,查询性能更好,支持任意类型的键

2. **灵活的参数类型**
   - `getDictLabel` 等方法支持多种参数类型
   - 可以传入字典类型名称(string)、响应式数组(Ref)或普通数组
   - 提高方法的复用性和灵活性

3. **类型转换**
   - 值比较时统一转换为字符串: `String(item.value) === String(value)`
   - 避免数字和字符串比较的问题

4. **错误处理**
   - 关键方法使用 try-catch 捕获异常
   - 返回布尔值指示操作是否成功

## 最佳实践

### 1. 优先使用 DictTypes 枚举

**推荐做法 ✅:**

```typescript
import { useDict, DictTypes } from '@/composables/useDict'

const { sys_user_sex, dictLoading } = useDict(DictTypes.SYS_USER_SEX)
```

**不推荐做法 ❌:**

```typescript
const { sys_user_sex, dictLoading } = useDict('sys_user_sex')
```

**理由:**
- 使用枚举可以获得完整的 TypeScript 类型提示
- 避免拼写错误
- 便于代码重构和维护

### 2. 合理使用缓存

字典数据会被自动缓存,无需在每个组件中重复加载:

```vue
<!-- 组件 A -->
<script lang="ts" setup>
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX) // 第一次加载,请求API
</script>

<!-- 组件 B -->
<script lang="ts" setup>
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX) // 使用缓存,不请求API
</script>
```

**缓存清理时机:**
- 用户退出登录时清空: `dictStore.cleanDict()`
- 字典数据更新后刷新: `dictStore.removeDict(key)` 后重新加载
- 应用启动时不需要清空,缓存在内存中

### 3. 处理加载状态

在字典数据加载完成前,禁用表单提交或显示占位符:

```vue
<template>
  <view class="form">
    <!-- 方式1: 显示加载提示 -->
    <view v-if="dictLoading" class="loading">加载字典数据中...</view>

    <!-- 方式2: 禁用表单 -->
    <wd-form v-else :model="formData">
      <wd-form-item label="性别">
        <wd-select
          v-model="formData.sex"
          :options="sys_user_sex"
          :loading="dictLoading"
        />
      </wd-form-item>

      <wd-button type="primary" :disabled="dictLoading" @click="handleSubmit">
        提交
      </wd-button>
    </wd-form>
  </view>
</template>
```

### 4. 批量加载性能优化

一次性加载表单所需的所有字典,而不是在多个地方分别加载:

**推荐做法 ✅:**

```typescript
// 在页面或表单组件中一次性加载所有需要的字典
const {
  sys_user_sex,
  sys_normal_disable,
  sys_yes_no,
  sys_notice_type,
  dictLoading
} = useDict(
  DictTypes.SYS_USER_SEX,
  DictTypes.SYS_NORMAL_DISABLE,
  DictTypes.SYS_YES_NO,
  DictTypes.SYS_NOTICE_TYPE
)
```

**不推荐做法 ❌:**

```typescript
// 在不同的子组件中分别加载
// 组件1
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)

// 组件2
const { sys_normal_disable } = useDict(DictTypes.SYS_NORMAL_DISABLE)

// 组件3
const { sys_yes_no } = useDict(DictTypes.SYS_YES_NO)
```

### 5. 使用 dictStore 工具方法

在计算属性或方法中使用 dictStore 工具方法,代码更简洁:

**推荐做法 ✅:**

```typescript
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

const genderText = computed(() => {
  return dictStore.getDictLabel(DictTypes.SYS_USER_SEX, user.value.sex)
})
```

**不推荐做法 ❌:**

```typescript
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)

const genderText = computed(() => {
  const item = sys_user_sex.value.find(item => item.value === user.value.sex)
  return item?.label || ''
})
```

### 6. 字典数据过滤

过滤停用的字典项:

```typescript
import { computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const { sys_notice_type } = useDict(DictTypes.SYS_NOTICE_TYPE)

// 只显示启用的字典项
const activeNoticeTypes = computed(() => {
  return sys_notice_type.value.filter(item => item.status === '0')
})
```

### 7. 自定义字典加载

对于自定义字典类型,可以手动加载并缓存:

```typescript
import { ref } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { listDictDatasByDictType } from '@/api/system/dict/data'
import type { DictItem } from '@/stores/modules/dict'

const dictStore = useDictStore()
const loading = ref(false)

const loadCustomDict = async (dictType: string) => {
  // 先检查缓存
  const cached = dictStore.getDict(dictType)
  if (cached) {
    return cached
  }

  loading.value = true
  try {
    const [err, data] = await listDictDatasByDictType(dictType)
    if (err) {
      console.error('加载字典失败:', err)
      return []
    }

    const dictData: DictItem[] = data.map(p => ({
      label: p.dictLabel,
      value: p.dictValue,
      status: p.status,
      elTagType: p.listClass,
      elTagClass: p.cssClass,
    }))

    // 保存到缓存
    dictStore.setDict(dictType, dictData)
    return dictData
  } finally {
    loading.value = false
  }
}
```

## 常见问题

### 1. 字典数据不更新

**问题描述:**
在后台修改了字典数据,但前端页面显示的仍是旧数据。

**问题原因:**
- 字典数据被缓存在 dictStore 中
- 页面刷新前不会重新加载字典

**解决方案:**

```typescript
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 方案1: 清除指定字典缓存
const refreshDict = (dictType: string) => {
  dictStore.removeDict(dictType)
  // 重新加载字典
  useDict(dictType)
}

// 方案2: 清空所有字典缓存
const refreshAllDict = () => {
  dictStore.cleanDict()
  // 重新加载需要的字典
}

// 方案3: 在用户手动刷新时清除
onMounted(() => {
  // 从路由参数判断是否需要刷新字典
  if (route.query.refreshDict) {
    dictStore.removeDict(DictTypes.SYS_USER_SEX)
  }

  const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)
})
```

### 2. 解构赋值变量名错误

**问题描述:**
解构赋值时变量名写错,导致获取不到字典数据。

**错误示例:**

```typescript
// ❌ 错误:变量名与字典类型不一致
const { userSex } = useDict(DictTypes.SYS_USER_SEX)
console.log(userSex.value) // undefined
```

**正确示例:**

```typescript
// ✅ 正确:变量名必须与字典类型一致
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)
console.log(sys_user_sex.value) // 字典数据

// ✅ 如果需要重命名,使用别名
const { sys_user_sex: userSex } = useDict(DictTypes.SYS_USER_SEX)
console.log(userSex.value) // 字典数据
```

### 3. 字典加载失败

**问题描述:**
控制台出现"获取字典[xxx]失败"的错误提示。

**问题原因:**
- 字典类型不存在于后端系统中
- 网络请求失败
- 后端接口返回错误

**解决方案:**

```typescript
import { ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

// 方案1: 提供默认值
const { sys_user_sex, dictLoading } = useDict(DictTypes.SYS_USER_SEX)

const safeDict = computed(() => {
  return sys_user_sex.value.length > 0 ? sys_user_sex.value : [
    { label: '男', value: '0' },
    { label: '女', value: '1' },
  ]
})

// 方案2: 错误处理
const loadDictWithError = async (dictType: string) => {
  try {
    const { [dictType]: dictData, dictLoading } = useDict(dictType)

    // 等待加载完成
    await new Promise(resolve => {
      const unwatch = watch(dictLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve(null)
        }
      })
    })

    if (dictData.value.length === 0) {
      throw new Error(`字典 ${dictType} 加载失败或为空`)
    }

    return dictData.value
  } catch (error) {
    console.error('字典加载错误:', error)
    // 显示错误提示
    uni.showToast({
      title: '字典数据加载失败',
      icon: 'none'
    })
    return []
  }
}
```

### 4. 在非组件中使用

**问题描述:**
在工具函数或其他非组件文件中使用 `useDict` 报错。

**问题原因:**
- `useDict` 依赖 Vue 的响应式系统,必须在 setup 或组合式函数中调用
- 在普通函数中无法使用 Vue 的响应式 API

**解决方案:**

```typescript
// ❌ 错误:在普通函数中调用
function formatUserGender(sex: string) {
  const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)
  // 错误:useDict 不能在非响应式上下文中调用
}

// ✅ 方案1:使用 dictStore
import { useDictStore } from '@/stores/modules/dict'

function formatUserGender(sex: string): string {
  const dictStore = useDictStore()
  return dictStore.getDictLabel(DictTypes.SYS_USER_SEX, sex)
}

// ✅ 方案2:创建组合式函数
export function useUserFormatter() {
  const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)

  const formatGender = (sex: string) => {
    const dictStore = useDictStore()
    return dictStore.getDictLabel(sys_user_sex, sex)
  }

  return {
    formatGender
  }
}

// 在组件中使用
const { formatGender } = useUserFormatter()
```

### 5. 字典值类型不匹配

**问题描述:**
字典值是数字类型,但比较时使用字符串导致匹配失败。

**问题原因:**
- 后端返回的 `dictValue` 可能是字符串或数字
- 业务数据的值也可能是字符串或数字
- 类型不一致导致 `===` 比较失败

**解决方案:**

`getDictLabel` 等方法内部已经处理了类型转换:

```typescript
// dictStore 内部实现
const getDictLabel = (keyOrData, value) => {
  // ...
  const item = dictData.find((item) => String(item.value) === String(value))
  return item?.label || ''
}

// 使用时无需担心类型问题
const label1 = dictStore.getDictLabel(DictTypes.SYS_USER_SEX, '0')   // ✅
const label2 = dictStore.getDictLabel(DictTypes.SYS_USER_SEX, 0)     // ✅
const label3 = dictStore.getDictLabel(DictTypes.SYS_NORMAL_DISABLE, 1)  // ✅
```

**手动比较时注意类型转换:**

```typescript
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)

// ❌ 错误:可能因为类型不匹配找不到
const item1 = sys_user_sex.value.find(item => item.value === user.sex)

// ✅ 正确:统一转换为字符串比较
const item2 = sys_user_sex.value.find(item =>
  String(item.value) === String(user.sex)
)
```

### 6. 字典项过多导致性能问题

**问题描述:**
某些字典项数量很多(如省市区字典),导致选择器渲染卡顿。

**解决方案:**

```vue
<template>
  <view class="cascader-demo">
    <!-- 使用级联选择器代替单个下拉框 -->
    <wd-cascader
      v-model="selectedArea"
      :options="areaTree"
      :loading="dictLoading"
      placeholder="请选择地区"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDict } from '@/composables/useDict'

// 加载省市区字典
const { sys_area } = useDict('sys_area')

// 转换为树形结构
const areaTree = computed(() => {
  const provinces = sys_area.value.filter(item => item.level === 1)

  return provinces.map(province => ({
    label: province.label,
    value: province.value,
    children: getCities(province.value)
  }))
})

const getCities = (provinceCode: string) => {
  return sys_area.value
    .filter(item => item.parentCode === provinceCode)
    .map(city => ({
      label: city.label,
      value: city.value,
      children: getDistricts(city.value)
    }))
}

const getDistricts = (cityCode: string) => {
  return sys_area.value
    .filter(item => item.parentCode === cityCode)
    .map(district => ({
      label: district.label,
      value: district.value
    }))
}
</script>
```

**优化建议:**
- 使用虚拟滚动组件渲染大量选项
- 使用级联选择器分级加载
- 添加搜索功能,减少显示的选项数量
- 考虑懒加载,按需加载下级选项

## 扩展用法

### 自定义字典类型

除了系统预定义的 16 种字典类型,还可以添加自定义字典:

```typescript
// 1. 在 DictTypes 枚举中添加新类型(可选,推荐)
export enum DictTypes {
  // ... 系统字典类型

  // 自定义字典类型
  CUSTOM_ORDER_STATUS = 'custom_order_status',
  CUSTOM_PAYMENT_METHOD = 'custom_payment_method',
}

// 2. 在组件中使用
const {
  custom_order_status,
  custom_payment_method,
  dictLoading
} = useDict(
  DictTypes.CUSTOM_ORDER_STATUS,
  DictTypes.CUSTOM_PAYMENT_METHOD
)
```

### 字典数据预加载

在应用启动时预加载常用字典,提升用户体验:

```typescript
// stores/modules/app.ts
import { defineStore } from 'pinia'
import { useDict, DictTypes } from '@/composables/useDict'

export const useAppStore = defineStore('app', () => {
  const isReady = ref(false)

  const init = async () => {
    // 预加载常用字典
    const {
      sys_user_sex,
      sys_normal_disable,
      sys_yes_no,
      dictLoading
    } = useDict(
      DictTypes.SYS_USER_SEX,
      DictTypes.SYS_NORMAL_DISABLE,
      DictTypes.SYS_YES_NO
    )

    // 等待字典加载完成
    await new Promise(resolve => {
      const unwatch = watch(dictLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve(null)
        }
      })
    })

    isReady.value = true
  }

  return {
    isReady,
    init
  }
})

// main.ts
import { useAppStore } from '@/stores/modules/app'

const app = createApp(App)
const appStore = useAppStore()

// 应用启动时初始化
appStore.init().then(() => {
  app.mount('#app')
})
```

### 字典数据国际化

支持多语言字典:

```typescript
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDict, DictTypes } from '@/composables/useDict'

const { locale } = useI18n()
const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)

// 根据当前语言转换字典标签
const localizedGenderDict = computed(() => {
  return sys_user_sex.value.map(item => ({
    ...item,
    label: translateLabel(item.value, locale.value)
  }))
})

const translateLabel = (value: string | number, lang: string) => {
  const translations: Record<string, Record<string, string>> = {
    '0': { 'zh-CN': '男', 'en-US': 'Male' },
    '1': { 'zh-CN': '女', 'en-US': 'Female' },
    '2': { 'zh-CN': '未知', 'en-US': 'Unknown' },
  }

  return translations[value]?.[lang] || String(value)
}
```

### 字典数据统计

统计字典使用情况:

```typescript
import { computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const { sys_user_sex } = useDict(DictTypes.SYS_USER_SEX)

// 统计各选项的使用次数
const genderStats = computed(() => {
  const stats: Record<string, number> = {}

  userList.value.forEach(user => {
    const key = user.sex
    stats[key] = (stats[key] || 0) + 1
  })

  return sys_user_sex.value.map(item => ({
    label: item.label,
    value: item.value,
    count: stats[item.value] || 0,
    percentage: ((stats[item.value] || 0) / userList.value.length * 100).toFixed(2)
  }))
})
```

### 字典数据导出

将字典数据导出为 Excel 或其他格式:

```typescript
import { useDictStore } from '@/stores/modules/dict'
import { DictTypes } from '@/composables/useDict'

const dictStore = useDictStore()

const exportDictToExcel = (dictType: string) => {
  const dict = dictStore.getDict(dictType)
  if (!dict) {
    uni.showToast({ title: '字典不存在', icon: 'none' })
    return
  }

  // 转换为 Excel 数据格式
  const excelData = [
    ['标签', '键值', '状态', '标签类型'],
    ...dict.map(item => [
      item.label,
      item.value,
      item.status === '0' ? '正常' : '停用',
      item.elTagType || ''
    ])
  ]

  // 使用 xlsx 库导出
  // import * as XLSX from 'xlsx'
  // const ws = XLSX.utils.aoa_to_sheet(excelData)
  // const wb = XLSX.utils.book_new()
  // XLSX.utils.book_append_sheet(wb, ws, dictType)
  // XLSX.writeFile(wb, `${dictType}.xlsx`)
}

// 导出所有字典
const exportAllDict = () => {
  Object.values(DictTypes).forEach(dictType => {
    exportDictToExcel(dictType)
  })
}
```

---

**文档编写**: 基于 `ruoyi-plus-uniapp-workflow` 项目源码
**最后更新**: 2025-11-16
