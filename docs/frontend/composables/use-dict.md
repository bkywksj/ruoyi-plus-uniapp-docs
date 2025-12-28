# useDict

## 介绍

`useDict` 是一个用于字典数据管理的组合式函数，提供字典数据的获取、缓存和管理功能。该 Composable 与 `useDictStore` 状态管理紧密集成，实现了高效的字典数据加载和缓存策略。

在企业级应用中，字典数据（如状态、类型、性别等枚举值）被广泛使用。`useDict` 提供了统一的解决方案，支持同时获取多个字典类型的数据，优先从缓存获取以减少不必要的 API 请求，并自动将 API 获取的字典数据存入缓存。

**核心特性:**

- **字典获取** - 支持同时获取多个字典类型的数据，使用解构语法方便访问
- **智能缓存** - 优先从 Pinia 状态缓存获取数据，减少重复 API 请求
- **自动缓存** - 自动将 API 获取的字典数据存入全局缓存
- **状态跟踪** - 提供 `dictLoading` 加载状态指示器，便于 UI 展示
- **并行加载** - 多个字典类型并行请求，提高加载效率
- **错误隔离** - 单个字典加载失败不影响其他字典的正常加载
- **类型转换** - 统一转换为标准 `DictItem` 格式，便于 UI 组件使用
- **类型安全** - 提供 `DictTypes` 枚举和 TypeScript 类型定义

---

## 基本用法

### 获取单个字典

最基本的用法是获取单个字典类型的数据：

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

<script lang="ts" setup>
import { reactive } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  gender: ''
})

// 获取单个字典，解构获取字典数据和加载状态
const { sys_user_gender, dictLoading } = useDict(DictTypes.sys_user_gender)
</script>
```

**使用说明:**

- `useDict` 返回一个响应式对象，包含请求的字典数据和加载状态
- 字典类型名称直接作为属性名，值为 `Ref<DictItem[]>`
- `dictLoading` 为 `Ref<boolean>`，`false` 表示加载完毕
- 推荐使用 `DictTypes` 枚举而非字符串字面量

### 获取多个字典

支持同时获取多个字典类型，所有字典并行加载：

```vue
<template>
  <div v-loading="dictLoading">
    <el-form :model="form" label-width="100px">
      <!-- 用户性别 -->
      <el-form-item label="性别">
        <el-select v-model="form.gender" placeholder="请选择">
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
        <el-select v-model="form.status" placeholder="请选择">
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
        <el-select v-model="form.noticeType" placeholder="请选择">
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

<script lang="ts" setup>
import { reactive } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  gender: '',
  status: '',
  noticeType: ''
})

// 同时获取多个字典，使用可变参数
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

**技术说明:**

- 多个字典请求会并行执行，不会阻塞彼此
- `dictLoading` 只有在所有字典加载完成后才会变为 `false`
- 如果某个字典加载失败，不会影响其他字典的正常加载

### 使用字符串参数

也可以直接使用字符串参数：

```vue
<script lang="ts" setup>
import { useDict } from '@/composables/useDict'

// 使用字符串字面量（不推荐，缺少类型检查）
const { sys_user_gender, dictLoading } = useDict('sys_user_gender')

// 推荐使用 DictTypes 枚举
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)
</script>
```

---

## 字典类型枚举

系统预定义的字典类型通过 `DictTypes` 枚举统一管理：

```typescript
/**
 * 字典类型枚举
 * 提供类型安全的字典类型常量
 */
export enum DictTypes {
  /** 审核状态 - 待审核/已通过/已拒绝 */
  sys_audit_status = 'sys_audit_status',

  /** 逻辑标志 - 是/否 */
  sys_boolean_flag = 'sys_boolean_flag',

  /** 显示设置 - 显示/隐藏 */
  sys_display_setting = 'sys_display_setting',

  /** 启用状态 - 正常/停用 */
  sys_enable_status = 'sys_enable_status',

  /** 文件类型 - 图片/文档/视频等 */
  sys_file_type = 'sys_file_type',

  /** 消息类型 - 系统消息/通知消息等 */
  sys_message_type = 'sys_message_type',

  /** 通知状态 - 已读/未读 */
  sys_notice_status = 'sys_notice_status',

  /** 通知类型 - 公告/通知 */
  sys_notice_type = 'sys_notice_type',

  /** 操作结果 - 成功/失败 */
  sys_oper_result = 'sys_oper_result',

  /** 业务操作类型 - 新增/修改/删除/查询等 */
  sys_oper_type = 'sys_oper_type',

  /** 支付方式 - 微信/支付宝/余额等 */
  sys_payment_method = 'sys_payment_method',

  /** 订单状态 - 待支付/已支付/已完成等 */
  sys_order_status = 'sys_order_status',

  /** 平台类型 - PC/移动端/小程序等 */
  sys_platform_type = 'sys_platform_type',

  /** 用户性别 - 男/女/未知 */
  sys_user_gender = 'sys_user_gender',

  /** 数据权限类型 - 全部/本部门/本人等 */
  sys_data_scope = 'sys_data_scope'
}
```

**枚举使用优势:**

1. **类型安全** - 编译时检查，避免拼写错误
2. **代码提示** - IDE 自动补全支持
3. **统一管理** - 集中维护所有字典类型
4. **重构友好** - 修改枚举值会自动更新所有引用

### 添加自定义字典类型

在业务开发中，可以扩展枚举或使用字符串：

```typescript
// 方式1: 扩展 DictTypes 枚举（推荐）
// 在 src/composables/useDict.ts 中添加
export enum DictTypes {
  // ... 现有枚举

  /** 自定义业务字典 */
  biz_order_type = 'biz_order_type',
  biz_product_category = 'biz_product_category'
}

// 方式2: 使用常量对象
const BizDictTypes = {
  ORDER_TYPE: 'biz_order_type',
  PRODUCT_CATEGORY: 'biz_product_category'
} as const

// 方式3: 直接使用字符串（不推荐）
const { biz_order_type } = useDict('biz_order_type')
```

---

## 字典数据结构

### DictItem 接口

字典项的标准数据结构：

```typescript
/**
 * 字典项配置
 * 用于下拉选择、标签等组件的选项数据
 */
declare interface DictItem {
  /** 显示标签文本 */
  label: string

  /** 实际存储的值 */
  value: string

  /** 状态标识 - '0': 启用, '1': 禁用 */
  status?: string

  /** Element Plus Tag 组件的类型 */
  elTagType?: ElTagType

  /** Element Plus Tag 组件的自定义类名 */
  elTagClass?: string
}

/** Element Plus Tag 类型 */
type ElTagType = '' | 'success' | 'warning' | 'info' | 'danger'
```

### DataResult 返回类型

`useDict` 的返回值类型：

```typescript
/**
 * 字典结果接口
 */
interface DataResult {
  /** 字典加载状态，false 代表加载完毕 */
  dictLoading: Ref<boolean>

  /**
   * 索引签名，每个字典类型对应一个响应式数组
   * 通过字典类型名动态访问对应的字典数据
   */
  [key: string]: Ref<DictItem[]>
}
```

### API 响应数据转换

后端 API 返回的字典数据格式与前端 `DictItem` 的映射关系：

```typescript
// API 返回格式
interface DictDataVO {
  dictLabel: string   // -> label
  dictValue: string   // -> value
  status: string      // -> status
  listClass: string   // -> elTagType
  cssClass: string    // -> elTagClass
}

// useDict 内部转换逻辑
const dictData = apiResponse.map((p): DictItem => ({
  label: p.dictLabel,
  value: p.dictValue,
  status: p.status,
  elTagType: p.listClass,
  elTagClass: p.cssClass
}))
```

---

## 缓存机制

### 缓存策略

`useDict` 与 `useDictStore` 配合实现两级缓存：

```typescript
// useDict 内部实现逻辑
export const useDict = (...args: string[]): DataResult => {
  const dictStore = useDictStore()
  const dictObject = reactive<Record<string, DictItem[]>>({})
  const dictLoading = ref(true)
  const promises: Promise<void>[] = []

  args.forEach((dictType) => {
    // 初始化为空数组
    dictObject[dictType] = []

    // 尝试从缓存获取
    const cachedDict = dictStore.getDict(dictType)

    if (cachedDict) {
      // 缓存命中，直接使用
      dictObject[dictType] = cachedDict
      promises.push(Promise.resolve())
    } else {
      // 缓存未命中，从 API 获取
      const promise = listDictDatasByDictType(dictType).then(([err, data]) => {
        if (err) {
          console.error(`获取字典[${dictType}]失败:`, err)
          return
        }

        // 转换数据格式
        const dictData = data.map((p): DictItem => ({
          label: p.dictLabel,
          value: p.dictValue,
          status: p.status,
          elTagType: p.listClass,
          elTagClass: p.cssClass
        }))

        // 更新响应式对象
        dictObject[dictType] = dictData
        // 存入缓存
        dictStore.setDict(dictType, dictData)
      })

      promises.push(promise)
    }
  })

  // 所有请求完成后更新加载状态
  Promise.all(promises).finally(() => {
    dictLoading.value = false
  })

  return {
    ...toRefs(dictObject),
    dictLoading
  } as DataResult
}
```

### useDictStore 状态管理

字典数据的全局状态管理：

```typescript
import { defineStore } from 'pinia'

export const useDictStore = defineStore('dict', () => {
  // 使用 Map 存储字典数据
  const dict = ref<Map<string, DictItem[]>>(new Map())

  /**
   * 获取字典
   * @param key 字典类型
   * @returns 字典数据数组或 null
   */
  const getDict = (key: string): DictItem[] | null => {
    if (!key) return null
    return dict.value.get(key) || null
  }

  /**
   * 设置字典
   * @param key 字典类型
   * @param value 字典数据数组
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
   * 删除指定字典
   */
  const removeDict = (key: string): boolean => {
    if (!key) return false
    return dict.value.delete(key)
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
    removeDict,
    cleanDict
  }
})
```

### 手动管理缓存

在某些场景下需要手动操作缓存：

```vue
<script lang="ts" setup>
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 清除指定字典缓存（强制下次重新加载）
const refreshDict = (dictType: string) => {
  dictStore.removeDict(dictType)
}

// 清除所有字典缓存
const clearAllDictCache = () => {
  dictStore.cleanDict()
}

// 手动设置字典数据（适用于动态字典）
const setCustomDict = () => {
  dictStore.setDict('custom_dict', [
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2' }
  ])
}
</script>
```

---

## 字典展示

### 带样式的下拉选项

使用字典项的 `elTagType` 显示彩色标签：

```vue
<template>
  <div v-loading="dictLoading">
    <el-select v-model="form.status" placeholder="请选择状态">
      <el-option
        v-for="dict in sys_enable_status"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      >
        <el-tag :type="dict.elTagType" size="small">
          {{ dict.label }}
        </el-tag>
      </el-option>
    </el-select>

    <!-- 显示选中值的标签 -->
    <div v-if="selectedDict" class="mt-4">
      <span>当前状态: </span>
      <el-tag :type="selectedDict.elTagType">
        {{ selectedDict.label }}
      </el-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  status: ''
})

const { sys_enable_status, dictLoading } = useDict(DictTypes.sys_enable_status)

// 获取选中状态的字典项
const selectedDict = computed(() => {
  return sys_enable_status.value.find(dict => dict.value === form.status)
})
</script>
```

### 表格中的字典显示

在表格列中使用字典转换：

```vue
<template>
  <el-table :data="tableData" v-loading="dictLoading || tableLoading" border>
    <el-table-column prop="name" label="姓名" />

    <!-- 性别列 -->
    <el-table-column label="性别" width="100">
      <template #default="{ row }">
        <span>{{ getGenderLabel(row.gender) }}</span>
      </template>
    </el-table-column>

    <!-- 状态列 - 带颜色标签 -->
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="getStatusTagType(row.status)">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </el-table-column>

    <!-- 操作类型列 -->
    <el-table-column label="操作类型" width="120">
      <template #default="{ row }">
        <el-tag :type="getOperTypeItem(row.operType)?.elTagType || 'info'">
          {{ getOperTypeItem(row.operType)?.label || row.operType }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const tableLoading = ref(false)
const tableData = ref([
  { name: '张三', gender: '0', status: '0', operType: '1' },
  { name: '李四', gender: '1', status: '1', operType: '2' }
])

const {
  sys_user_gender,
  sys_enable_status,
  sys_oper_type,
  dictLoading
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status,
  DictTypes.sys_oper_type
)

// 获取性别标签
const getGenderLabel = (value: string): string => {
  const dict = sys_user_gender.value.find(item => item.value === value)
  return dict?.label || value
}

// 获取状态标签
const getStatusLabel = (value: string): string => {
  const dict = sys_enable_status.value.find(item => item.value === value)
  return dict?.label || value
}

// 获取状态标签类型
const getStatusTagType = (value: string): string => {
  const dict = sys_enable_status.value.find(item => item.value === value)
  return dict?.elTagType || ''
}

// 获取操作类型完整对象
const getOperTypeItem = (value: string): DictItem | undefined => {
  return sys_oper_type.value.find(item => item.value === value)
}
</script>
```

### 使用 DictTag 组件

项目提供了 `DictTag` 组件用于字典值的展示：

```vue
<template>
  <el-table :data="tableData" border>
    <el-table-column prop="name" label="姓名" />

    <!-- 使用 DictTag 组件展示字典值 -->
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <DictTag :options="sys_enable_status" :value="row.status" />
      </template>
    </el-table-column>

    <!-- 支持多个值 -->
    <el-table-column label="权限" width="200">
      <template #default="{ row }">
        <DictTag :options="sys_data_scope" :value="row.permissions" />
      </template>
    </el-table-column>

    <!-- 自定义标签类型 -->
    <el-table-column label="性别" width="100">
      <template #default="{ row }">
        <DictTag
          :options="sys_user_gender"
          :value="row.gender"
          tag-type="success"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'
import DictTag from '@/components/DictTag/DictTag.vue'

const tableData = ref([
  { name: '张三', gender: '0', status: '0', permissions: '1,2' },
  { name: '李四', gender: '1', status: '1', permissions: '3' }
])

const {
  sys_user_gender,
  sys_enable_status,
  sys_data_scope
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status,
  DictTypes.sys_data_scope
)
</script>
```

**DictTag 组件特性:**

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `options` | `DictItem[]` | 字典选项数组 | `[]` |
| `value` | `string \| number \| Array` | 要显示的值 | - |
| `mode` | `'dict' \| 'region' \| 'cascader'` | 组件模式 | `'dict'` |
| `separator` | `string` | 值分隔符 | `','` |
| `tagType` | `ElTagType` | 统一标签类型 | `'info'` |
| `showValue` | `boolean` | 是否显示未匹配值 | `true` |

---

## 与 useDictStore 配合使用

### 直接使用 Store 方法

`useDictStore` 提供了更多便捷方法：

```vue
<template>
  <div>
    <p>性别: {{ genderLabel }}</p>
    <p>状态: {{ statusLabels.join(', ') }}</p>

    <el-tag v-if="statusItem" :type="statusItem.elTagType">
      {{ statusItem.label }}
    </el-tag>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'
import { useDictStore } from '@/stores/modules/dict'

// 先加载字典数据
const { sys_user_gender, sys_enable_status } = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

const dictStore = useDictStore()
const userData = { gender: '0', status: '0', permissions: ['1', '2'] }

// 根据值获取标签
const genderLabel = computed(() => {
  return dictStore.getDictLabel(sys_user_gender, userData.gender)
})

// 批量获取标签
const statusLabels = computed(() => {
  return dictStore.getDictLabels(sys_enable_status, userData.permissions)
})

// 获取完整字典项对象
const statusItem = computed(() => {
  return dictStore.getDictItem(sys_enable_status.value, userData.status)
})

// 根据标签获取值
const getValueByLabel = (dictType: string, label: string) => {
  return dictStore.getDictValue(dictType, label)
}
</script>
```

### Store API 详解

```typescript
/**
 * 根据值获取标签
 * @param keyOrData 字典类型或字典数据
 * @param value 字典值
 * @returns 对应的标签名
 */
getDictLabel(keyOrData: string | Ref<DictItem[]> | DictItem[], value: string | number): string

/**
 * 批量获取标签
 * @param keyOrData 字典类型或字典数据
 * @param values 字典值数组
 * @returns 对应的标签数组
 */
getDictLabels(keyOrData: string | Ref<DictItem[]>, values: (string | number)[]): string[]

/**
 * 获取完整字典项对象
 * @param keyOrData 字典类型或字典数据
 * @param value 字典值
 * @returns 完整的字典项对象或 null
 */
getDictItem(keyOrData: string | DictItem[], value: string | number): DictItem | null

/**
 * 根据标签获取值
 * @param key 字典类型
 * @param label 字典标签
 * @returns 对应的字典值
 */
getDictValue(key: string, label: string): string | number | null
```

---

## 高级用法

### 过滤禁用的字典项

只显示启用状态的字典项：

```vue
<template>
  <el-select v-model="form.fileType" placeholder="请选择文件类型">
    <el-option
      v-for="dict in enabledFileTypes"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const form = reactive({
  fileType: ''
})

const { sys_file_type } = useDict(DictTypes.sys_file_type)

// 过滤启用的字典项（status === '0' 表示启用）
const enabledFileTypes = computed(() => {
  return sys_file_type.value.filter(dict => dict.status === '0')
})
</script>
```

### 字典数据排序

对字典数据进行自定义排序：

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const { sys_oper_type } = useDict(DictTypes.sys_oper_type)

// 按值排序
const sortedByValue = computed(() => {
  return [...sys_oper_type.value].sort((a, b) =>
    Number(a.value) - Number(b.value)
  )
})

// 按标签排序
const sortedByLabel = computed(() => {
  return [...sys_oper_type.value].sort((a, b) =>
    a.label.localeCompare(b.label, 'zh-CN')
  )
})

// 自定义排序规则
const customSorted = computed(() => {
  const order = ['1', '3', '2', '4'] // 自定义顺序
  return [...sys_oper_type.value].sort((a, b) => {
    return order.indexOf(a.value) - order.indexOf(b.value)
  })
})
</script>
```

### 字典值转换

在表单提交前转换字典值：

```vue
<script lang="ts" setup>
import { reactive } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'
import { useDictStore } from '@/stores/modules/dict'

const { sys_enable_status } = useDict(DictTypes.sys_enable_status)
const dictStore = useDictStore()

const form = reactive({
  status: '' // 存储值
})

// 获取显示标签
const statusLabel = computed(() => {
  return dictStore.getDictLabel(sys_enable_status, form.status)
})

// 设置值（通过标签）
const setStatusByLabel = (label: string) => {
  const value = dictStore.getDictValue(DictTypes.sys_enable_status, label)
  if (value !== null) {
    form.status = String(value)
  }
}
</script>
```

### 动态加载字典

根据条件动态加载不同字典：

```vue
<template>
  <div>
    <el-radio-group v-model="dictType" @change="handleTypeChange">
      <el-radio label="gender">性别</el-radio>
      <el-radio label="status">状态</el-radio>
    </el-radio-group>

    <el-select
      v-model="selectedValue"
      v-loading="currentDictLoading"
      placeholder="请选择"
    >
      <el-option
        v-for="dict in currentDict"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const dictType = ref<'gender' | 'status'>('gender')
const selectedValue = ref('')

// 预加载所有可能用到的字典
const {
  sys_user_gender,
  sys_enable_status,
  dictLoading
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

// 动态切换当前字典
const currentDict = computed(() => {
  return dictType.value === 'gender'
    ? sys_user_gender.value
    : sys_enable_status.value
})

const currentDictLoading = computed(() => dictLoading.value)

const handleTypeChange = () => {
  selectedValue.value = ''
}
</script>
```

### 自定义字典数据

创建非后端管理的自定义字典：

```vue
<script lang="ts" setup>
import { ref } from 'vue'

// 静态字典数据（不走 API）
const priorityOptions = ref<DictItem[]>([
  { label: '低', value: 'low', elTagType: 'info' },
  { label: '中', value: 'medium', elTagType: 'warning' },
  { label: '高', value: 'high', elTagType: 'danger' }
])

// 动态生成字典数据
const yearOptions = ref<DictItem[]>(
  Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return { label: `${year}年`, value: String(year) }
  })
)

// 从其他 API 转换为字典格式
const loadDeptOptions = async () => {
  const [err, data] = await getDeptList()
  if (!err) {
    return data.map(dept => ({
      label: dept.deptName,
      value: String(dept.deptId),
      status: dept.status
    }))
  }
  return []
}
</script>
```

---

## 封装组件

### DictSelect 选择器

封装通用的字典选择器组件：

```vue
<!-- src/components/DictSelect/DictSelect.vue -->
<template>
  <el-select
    v-model="modelValue"
    v-loading="dictLoading"
    :placeholder="placeholder"
    :disabled="disabled"
    :multiple="multiple"
    :clearable="clearable"
    @update:modelValue="handleChange"
  >
    <el-option
      v-for="dict in filteredOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
      :disabled="dict.status === '1'"
    >
      <span v-if="showTag">
        <el-tag :type="dict.elTagType" size="small">
          {{ dict.label }}
        </el-tag>
      </span>
      <span v-else>{{ dict.label }}</span>
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useDict } from '@/composables/useDict'

interface Props {
  /** 绑定值 */
  modelValue: string | string[]
  /** 字典类型 */
  dictType: string
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 是否显示标签样式 */
  showTag?: boolean
  /** 是否过滤禁用项 */
  filterDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  clearable: true,
  showTag: false,
  filterDisabled: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  'change': [value: string | string[], item: DictItem | DictItem[] | undefined]
}>()

// 动态获取字典
const dictResult = useDict(props.dictType)
const dictLoading = toRef(dictResult, 'dictLoading')
const dictData = computed(() => dictResult[props.dictType]?.value || [])

// 过滤禁用项
const filteredOptions = computed(() => {
  if (props.filterDisabled) {
    return dictData.value.filter(item => item.status !== '1')
  }
  return dictData.value
})

const handleChange = (value: string | string[]) => {
  emit('update:modelValue', value)

  // 获取选中的字典项
  const items = Array.isArray(value)
    ? value.map(v => dictData.value.find(item => item.value === v))
    : dictData.value.find(item => item.value === value)

  emit('change', value, items as any)
}
</script>
```

**使用封装组件:**

```vue
<template>
  <el-form :model="form">
    <el-form-item label="状态">
      <DictSelect
        v-model="form.status"
        dict-type="sys_enable_status"
        show-tag
        @change="handleStatusChange"
      />
    </el-form-item>

    <el-form-item label="权限">
      <DictSelect
        v-model="form.permissions"
        dict-type="sys_data_scope"
        multiple
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import DictSelect from '@/components/DictSelect/DictSelect.vue'

const form = reactive({
  status: '',
  permissions: []
})

const handleStatusChange = (value: string, item: DictItem | undefined) => {
  console.log('选中值:', value)
  console.log('字典项:', item)
}
</script>
```

### DictRadio 单选组

```vue
<!-- src/components/DictRadio/DictRadio.vue -->
<template>
  <el-radio-group
    v-model="modelValue"
    v-loading="dictLoading"
    :disabled="disabled"
    @update:modelValue="handleChange"
  >
    <component
      :is="button ? 'el-radio-button' : 'el-radio'"
      v-for="dict in filteredOptions"
      :key="dict.value"
      :label="dict.value"
      :disabled="dict.status === '1'"
    >
      {{ dict.label }}
    </component>
  </el-radio-group>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useDict } from '@/composables/useDict'

interface Props {
  modelValue: string
  dictType: string
  disabled?: boolean
  button?: boolean
  filterDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  button: false,
  filterDisabled: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string, item: DictItem | undefined]
}>()

const dictResult = useDict(props.dictType)
const dictLoading = toRef(dictResult, 'dictLoading')
const dictData = computed(() => dictResult[props.dictType]?.value || [])

const filteredOptions = computed(() => {
  if (props.filterDisabled) {
    return dictData.value.filter(item => item.status !== '1')
  }
  return dictData.value
})

const handleChange = (value: string) => {
  emit('update:modelValue', value)
  const item = dictData.value.find(d => d.value === value)
  emit('change', value, item)
}
</script>
```

---

## API 参考

### useDict 函数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `...args` | `string[]` | 是 | 需要获取的字典类型数组 |

**返回值 (DataResult):**

| 属性 | 类型 | 说明 |
|------|------|------|
| `dictLoading` | `Ref<boolean>` | 加载状态，`false` 表示加载完毕 |
| `[dictType]` | `Ref<DictItem[]>` | 动态属性，每个字典类型对应一个响应式数组 |

### DictItem 接口

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `label` | `string` | 是 | 显示标签 |
| `value` | `string` | 是 | 实际值 |
| `status` | `string` | 否 | 状态标识 (`'0'`: 启用, `'1'`: 禁用) |
| `elTagType` | `ElTagType` | 否 | Element Plus 标签类型 |
| `elTagClass` | `string` | 否 | 自定义 CSS 类名 |

### useDictStore 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getDict` | `key: string` | `DictItem[] \| null` | 获取指定字典 |
| `setDict` | `key: string, value: DictItem[]` | `boolean` | 设置字典数据 |
| `getDictLabel` | `keyOrData, value` | `string` | 根据值获取标签 |
| `getDictLabels` | `keyOrData, values[]` | `string[]` | 批量获取标签 |
| `getDictItem` | `keyOrData, value` | `DictItem \| null` | 获取完整字典项 |
| `getDictValue` | `key, label` | `string \| number \| null` | 根据标签获取值 |
| `removeDict` | `key: string` | `boolean` | 删除指定字典 |
| `cleanDict` | - | `void` | 清空所有字典 |

---

## 最佳实践

### 1. 使用枚举管理字典类型

```typescript
// ✅ 推荐：使用 DictTypes 枚举
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

// ❌ 不推荐：使用字符串字面量
const { sys_enable_status } = useDict('sys_enable_status')
```

### 2. 合理利用缓存

```typescript
// ✅ 首次加载后，后续组件使用同一字典会命中缓存
// 组件 A
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

// 组件 B（会命中缓存，不发送 API 请求）
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

// ✅ 需要强制刷新时
const dictStore = useDictStore()
dictStore.removeDict('sys_enable_status')
const { sys_enable_status } = useDict(DictTypes.sys_enable_status) // 重新加载
```

### 3. 统一使用加载状态

```vue
<template>
  <!-- ✅ 推荐：使用 dictLoading 显示加载状态 -->
  <el-select v-model="value" v-loading="dictLoading">
    <el-option v-for="item in options" ... />
  </el-select>

  <!-- ❌ 不推荐：不处理加载状态 -->
  <el-select v-model="value">
    <el-option v-for="item in options" ... />
  </el-select>
</template>
```

### 4. 过滤禁用项

```typescript
// ✅ 推荐：在下拉框中过滤禁用项
const enabledOptions = computed(() => {
  return dict.value.filter(item => item.status !== '1')
})

// ✅ 或者在选项上禁用
<el-option :disabled="dict.status === '1'" />
```

### 5. 封装业务组件

```vue
<!-- ✅ 推荐：封装通用字典组件 -->
<DictSelect v-model="form.status" dict-type="sys_enable_status" />

<!-- ❌ 不推荐：每次都重复写相同代码 -->
<el-select v-model="form.status">
  <el-option v-for="dict in sys_enable_status" ... />
</el-select>
```

---

## 常见问题

### 1. 字典数据为空

**问题:** 使用字典时数据始终为空数组。

**原因:**
- 字典类型名称拼写错误
- 后端未配置对应的字典数据
- API 请求失败

**解决方案:**

```typescript
// 检查字典类型名称
const { sys_enable_status, dictLoading } = useDict(DictTypes.sys_enable_status)

// 监听加载完成
watch(dictLoading, (loading) => {
  if (!loading) {
    console.log('字典数据:', sys_enable_status.value)
    if (sys_enable_status.value.length === 0) {
      console.warn('字典数据为空，请检查后端配置')
    }
  }
})
```

### 2. 字典加载慢

**问题:** 页面首次加载时字典数据加载缓慢。

**解决方案:**

```typescript
// 方案1: 在应用启动时预加载常用字典
// main.ts 或 App.vue
const preloadDicts = async () => {
  const commonDicts = [
    DictTypes.sys_enable_status,
    DictTypes.sys_user_gender,
    DictTypes.sys_boolean_flag
  ]
  useDict(...commonDicts)
}

// 方案2: 使用骨架屏或加载指示器
<template>
  <el-skeleton v-if="dictLoading" :rows="1" />
  <el-select v-else v-model="value">...</el-select>
</template>
```

### 3. 字典值类型不匹配

**问题:** 表单值与字典值比较时匹配不上。

**原因:** 字典值始终为字符串类型，但表单值可能为数字。

**解决方案:**

```typescript
// ✅ 确保值类型一致
const form = reactive({
  status: '' // 使用字符串类型
})

// 或者在比较时转换类型
const selectedDict = computed(() => {
  return dictData.value.find(item => item.value === String(form.status))
})
```

### 4. 响应式丢失

**问题:** 解构后的字典数据失去响应式。

**解决方案:**

```typescript
// ✅ useDict 内部已使用 toRefs，解构后仍是响应式
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)
// sys_enable_status 是 Ref<DictItem[]>，保持响应式

// ⚠️ 注意：不要直接解构 .value
const data = sys_enable_status.value // 这不是响应式的
```

### 5. 多个组件重复请求

**问题:** 多个组件同时使用相同字典导致重复 API 请求。

**原因:** 组件几乎同时初始化，缓存还未写入。

**解决方案:**

```typescript
// 方案1: 在父组件统一加载
// ParentComponent.vue
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)
provide('sys_enable_status', sys_enable_status)

// ChildComponent.vue
const sys_enable_status = inject('sys_enable_status')

// 方案2: 预加载（推荐）
// 在路由守卫或应用初始化时加载
router.beforeEach(async () => {
  useDict(DictTypes.sys_enable_status)
})
```

### 6. 刷新字典缓存

**问题:** 后端字典数据更新后，前端仍显示旧数据。

**解决方案:**

```typescript
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

// 刷新单个字典
const refreshDict = (dictType: string) => {
  dictStore.removeDict(dictType)
  // 重新获取
  useDict(dictType)
}

// 刷新所有字典（谨慎使用）
const refreshAllDicts = () => {
  dictStore.cleanDict()
  // 重新加载需要的字典
}
```

### 7. 表格筛选使用字典

**问题:** 如何在表格筛选器中使用字典数据。

**解决方案:**

```vue
<template>
  <el-table :data="tableData">
    <el-table-column
      prop="status"
      label="状态"
      :filters="statusFilters"
      :filter-method="filterStatus"
    >
      <template #default="{ row }">
        <DictTag :options="sys_enable_status" :value="row.status" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

// 转换为表格筛选器格式
const statusFilters = computed(() => {
  return sys_enable_status.value.map(item => ({
    text: item.label,
    value: item.value
  }))
})

// 筛选方法
const filterStatus = (value: string, row: any) => {
  return row.status === value
}
</script>
```

---

## 类型定义

```typescript
import type { Ref } from 'vue'

/**
 * 字典项接口
 */
declare interface DictItem {
  /** 显示标签 */
  label: string
  /** 实际值 */
  value: string
  /** 状态 ('0': 启用, '1': 禁用) */
  status?: string
  /** Element Plus Tag 类型 */
  elTagType?: '' | 'success' | 'warning' | 'info' | 'danger'
  /** 自定义 CSS 类名 */
  elTagClass?: string
}

/**
 * 字典返回结果接口
 */
interface DataResult {
  /** 加载状态 */
  dictLoading: Ref<boolean>
  /** 动态字典数据 */
  [key: string]: Ref<DictItem[]> | Ref<boolean>
}

/**
 * 字典类型枚举
 */
export enum DictTypes {
  sys_audit_status = 'sys_audit_status',
  sys_boolean_flag = 'sys_boolean_flag',
  sys_display_setting = 'sys_display_setting',
  sys_enable_status = 'sys_enable_status',
  sys_file_type = 'sys_file_type',
  sys_message_type = 'sys_message_type',
  sys_notice_status = 'sys_notice_status',
  sys_notice_type = 'sys_notice_type',
  sys_oper_result = 'sys_oper_result',
  sys_oper_type = 'sys_oper_type',
  sys_payment_method = 'sys_payment_method',
  sys_order_status = 'sys_order_status',
  sys_platform_type = 'sys_platform_type',
  sys_user_gender = 'sys_user_gender',
  sys_data_scope = 'sys_data_scope'
}

/**
 * useDict 函数签名
 */
export declare function useDict(...args: string[]): DataResult
```
