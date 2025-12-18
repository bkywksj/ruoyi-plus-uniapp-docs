---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/selectPicker
---

# SelectPicker 选择器

## 介绍

SelectPicker 选择器是一个功能强大的表单选择组件，支持单选、多选和自定义三种选择模式。

**核心特性:**

- **三种选择模式** - checkbox（多选）、radio（单选）、custom（自定义）
- **搜索过滤功能** - 本地搜索，支持关键词高亮
- **数量限制控制** - 多选模式支持最小/最大选中数量
- **自定义格式化** - displayFormat 函数自定义显示文本
- **确认前校验** - beforeConfirm 钩子函数支持自定义校验
- **表单集成** - 完整支持表单验证
- **滚动定位** - 自动滚动到选中项位置

## 基本用法

### 单选模式

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择城市"
    placeholder="请选择"
    title="请选择城市"
    type="radio"
    :columns="cityList"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' }
])

const handleConfirm = ({ value, selectedItems }: any) => {
  console.log('选中值:', value)
  console.log('选中项:', selectedItems)
}
</script>
```

**使用说明:**
- `type="radio"` 设置为单选模式
- `modelValue` 绑定单个值，类型与 columns 中的 value 类型一致
- 单选模式下可通过 `show-confirm="false"` 隐藏确认按钮，选择后立即确认

### 多选模式

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择水果"
    placeholder="请选择"
    title="请选择水果"
    type="checkbox"
    :columns="fruitList"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<string[]>([])

const fruitList = ref([
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape' }
])
</script>
```

**使用说明:**
- `type="checkbox"` 设置为多选模式
- `modelValue` 必须为数组类型或逗号分隔的字符串
- 多选模式下始终显示确认按钮

### 自定义字段名

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择员工"
    type="radio"
    :columns="employeeList"
    label-key="name"
    value-key="id"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const employeeList = ref([
  { name: '张三', id: 1001, department: '技术部' },
  { name: '李四', id: 1002, department: '产品部' }
])
</script>
```

### 禁用和只读状态

```vue
<template>
  <!-- 禁用状态 -->
  <wd-select-picker v-model="value" :columns="list" disabled />

  <!-- 只读状态 -->
  <wd-select-picker v-model="value" :columns="list" readonly />

  <!-- 错误状态 -->
  <wd-select-picker v-model="value" :columns="list" error />

  <!-- 必填标识 -->
  <wd-select-picker v-model="value" :columns="list" required />
</template>
```

## 高级用法

### 搜索过滤

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择城市"
    type="radio"
    :columns="allCityList"
    filterable
    filter-placeholder="输入城市名称搜索"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const allCityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  // ... 更多城市
])
</script>
```

### 数量限制

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择兴趣"
    title="选择兴趣（最少1个，最多3个）"
    type="checkbox"
    :columns="hobbyList"
    :min="1"
    :max="3"
  />
</template>
```

### 自定义显示格式

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择标签"
    type="checkbox"
    :columns="tagList"
    :display-format="displayTagCount"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<string[]>([])

const tagList = ref([
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: '移动端', value: 'mobile' }
])

const displayTagCount = (items: string[], columns: any[]) => {
  if (!items || items.length === 0) return ''
  return `已选择 ${items.length} 个标签`
}
</script>
```

### 确认前校验

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择课程"
    title="选择课程（至少选择2门）"
    type="checkbox"
    :columns="courseList"
    :before-confirm="validateCourseCount"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<string[]>([])

const courseList = ref([
  { label: 'Vue 3', value: 'vue3' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' }
])

const validateCourseCount = (value: string[], resolve: (isPass: boolean) => void) => {
  if (!value || value.length < 2) {
    uni.showToast({ title: '请至少选择2门课程', icon: 'none' })
    resolve(false)
  } else {
    resolve(true)
  }
}
</script>
```

### 加载状态

```vue
<template>
  <wd-select-picker
    v-model="value"
    label="选择部门"
    type="radio"
    :columns="departmentList"
    :loading="isLoading"
    loading-color="#4D80F0"
    @open="loadDepartments"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const isLoading = ref(false)
const departmentList = ref<any[]>([])

const loadDepartments = async () => {
  if (departmentList.value.length > 0) return
  isLoading.value = true

  setTimeout(() => {
    departmentList.value = [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' }
    ]
    isLoading.value = false
  }, 1500)
}
</script>
```

### 自定义模式

```vue
<template>
  <wd-select-picker
    v-model="customValue"
    label="选择日期范围"
    type="custom"
    :display-format="formatDateRange"
  >
    <template #content="{ value, updateValue, confirm, close }">
      <view class="custom-date-picker">
        <view class="date-input">
          <text>开始:</text>
          <input
            type="date"
            :value="value?.startDate || ''"
            @input="e => updateValue({ ...value, startDate: e.detail.value })"
          />
        </view>
        <view class="date-input">
          <text>结束:</text>
          <input
            type="date"
            :value="value?.endDate || ''"
            @input="e => updateValue({ ...value, endDate: e.detail.value })"
          />
        </view>
        <wd-button size="small" @click="confirm">确定</wd-button>
      </view>
    </template>
  </wd-select-picker>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const customValue = ref<any>({ startDate: '', endDate: '' })

const formatDateRange = (value: any) => {
  if (!value || !value.startDate || !value.endDate) return ''
  return `${value.startDate} 至 ${value.endDate}`
}
</script>
```

**content 插槽参数:**
- `value`: 当前值
- `updateValue(newValue)`: 更新值的方法
- `confirm()`: 确认选择
- `close()`: 关闭选择器

### 表单验证

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-select-picker
      v-model="formData.city"
      label="选择城市"
      type="radio"
      :columns="cityList"
      prop="city"
    />

    <wd-select-picker
      v-model="formData.hobbies"
      label="选择兴趣"
      type="checkbox"
      :columns="hobbyList"
      prop="hobbies"
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formRef = ref()

const formData = ref({
  city: '',
  hobbies: []
})

const rules = {
  city: [{ required: true, message: '请选择城市' }],
  hobbies: [{ required: true, message: '请至少选择一个兴趣' }]
}
</script>
```

### 自定义插槽

```vue
<template>
  <!-- 自定义标签插槽 -->
  <wd-select-picker
    v-model="value"
    :columns="list"
    use-label-slot
  >
    <template #label>
      <view class="custom-label">
        <wd-icon name="location" size="32rpx" />
        <text>城市</text>
      </view>
    </template>
  </wd-select-picker>

  <!-- 完全自定义显示 -->
  <wd-select-picker
    v-model="value"
    :columns="list"
    use-default-slot
  >
    <view class="custom-field">
      <text>选择</text>
      <wd-icon name="arrow-right" />
    </view>
  </wd-select-picker>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 选中项绑定值 | `string \| number \| boolean \| array \| any` | - |
| type | 选择器类型 | `'checkbox' \| 'radio' \| 'custom'` | `'checkbox'` |
| columns | 选项列表数据 | `Record<string, any>[]` | `[]` |
| value-key | value 对应的 key | `string` | `'value'` |
| label-key | 展示文本对应的 key | `string` | `'label'` |
| label | 选择器左侧文案 | `string` | - |
| label-width | 标题宽度 | `string` | - |
| placeholder | 占位符 | `string` | `'请选择'` |
| title | 弹出层标题 | `string` | `'请选择'` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| required | 是否显示必填标识 | `boolean` | `false` |
| error | 是否为错误状态 | `boolean` | `false` |
| align-right | 值靠右展示 | `boolean` | `false` |
| size | 单元格大小 | `string` | - |
| select-size | 选项组尺寸 | `CheckSize` | - |
| checked-color | 选中的颜色 | `string` | - |
| min | 最小选中数量（多选） | `number` | `0` |
| max | 最大选中数量（多选） | `number` | `0` |
| filterable | 是否可搜索 | `boolean` | `false` |
| filter-placeholder | 搜索框占位符 | `string` | `'搜索'` |
| ellipsis | 是否超出隐藏 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| scroll-into-view | 是否滚动到选中项 | `boolean` | `true` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载颜色 | `string` | `'#4D80F0'` |
| display-format | 自定义展示格式化函数 | `SelectPickerDisplayFormat` | - |
| before-confirm | 确认前校验函数 | `SelectPickerBeforeConfirm` | - |
| show-confirm | 是否显示确认按钮 | `boolean` | `true` |
| confirm-button-text | 确认按钮文案 | `string` | `'确认'` |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| z-index | 弹窗层级 | `number` | `100` |
| safe-area-inset-bottom | 是否设置底部安全距离 | `boolean` | `true` |
| use-label-slot | 是否使用 label 插槽 | `boolean` | `false` |
| use-default-slot | 是否使用默认插槽 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| auto-confirm | 是否自动确认（自定义模式） | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 选中值变化时触发 | `value` |
| change | 选择器值改变时触发 | `{ value }` |
| confirm | 确认选择时触发 | `{ value, selectedItems }` |
| cancel | 取消选择时触发 | - |
| clear | 清空选择时触发 | - |
| open | 打开选择器时触发 | - |
| close | 关闭选择器时触发 | - |
| custom-change | 自定义值变化时触发 | `{ value }` |
| custom-confirm | 自定义确认时触发 | `{ value }` |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 完全自定义选择器内容 | - |
| label | 自定义标签内容 | - |
| content | 自定义选择内容（custom 模式） | `{ value, updateValue, confirm, close }` |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open | 打开选择器弹框 | - |
| close | 关闭选择器弹框 | - |
| updateValue | 更新自定义值 | `value: any` |
| confirmCustom | 手动确认自定义选择 | - |

### 类型定义

```typescript
/** 选择器类型 */
export type SelectPickerType = 'checkbox' | 'radio' | 'custom'

/** 显示格式化函数类型 */
export type SelectPickerDisplayFormat = (
  items: string | number | boolean | (string | number | boolean)[] | any,
  columns: Record<string, any>[]
) => string

/** 确认前校验函数类型 */
export type SelectPickerBeforeConfirm = (
  value: string | number | boolean | (string | number | boolean)[] | any,
  resolve: (isPass: boolean) => void
) => void
```

## 主题定制

```scss
// 单元格相关变量
$-cell-padding: 32rpx;
$-cell-title-color: #262626;
$-cell-title-fs: 28rpx;
$-cell-value-color: #909399;
$-cell-arrow-color: #c5c5c5;
$-cell-required-color: #fa4350;

// 输入框相关变量
$-input-cell-label-width: 160rpx;
$-input-placeholder-color: #c5c5c5;
$-input-disabled-color: #c5c5c5;
$-input-error-color: #fa4350;

// 主题色
$-color-theme: #4D80F0;
```

## 最佳实践

### 1. 合理选择类型

```vue
<!-- ✅ 单选场景使用 radio -->
<wd-select-picker v-model="gender" type="radio" :columns="genderList" />

<!-- ✅ 多选场景使用 checkbox -->
<wd-select-picker v-model="skills" type="checkbox" :columns="skillList" />

<!-- ✅ 复杂逻辑使用 custom -->
<wd-select-picker v-model="dateRange" type="custom">
  <template #content="{ updateValue, confirm }">
    <!-- 自定义内容 -->
  </template>
</wd-select-picker>
```

### 2. 大数据量优化

```vue
<!-- ✅ 启用搜索和滚动定位 -->
<wd-select-picker
  v-model="city"
  :columns="allCityList"
  filterable
  :scroll-into-view="true"
/>

<!-- ✅ 异步加载数据 -->
<wd-select-picker
  v-model="department"
  :columns="departmentList"
  :loading="isLoading"
  @open="loadDepartments"
/>
```

### 3. 数量限制配合提示

```vue
<!-- ✅ 在标题中说明限制 -->
<wd-select-picker
  v-model="courses"
  title="选择课程（最少2门，最多5门）"
  type="checkbox"
  :columns="courseList"
  :min="2"
  :max="5"
/>
```

## 常见问题

### 1. 多选模式初始值不生效

**原因:** `modelValue` 类型不正确

**解决:**
```typescript
// ✅ 使用数组格式
const selectedTags = ref<string[]>(['tag1', 'tag2'])

// ✅ 或使用逗号分隔的字符串
const selectedTags = ref('tag1,tag2')
```

### 2. 自定义字段名后显示异常

**原因:** `label-key` 和 `value-key` 指定的字段名不存在于数据中

**解决:**
```vue
<wd-select-picker
  label-key="name"
  value-key="id"
  :columns="[
    { name: '张三', id: 1 },  // 字段名与 key 一致
    { name: '李四', id: 2 }
  ]"
/>
```

### 3. 自定义模式值未更新

**原因:** 未使用插槽参数的 `updateValue` 方法

**解决:**
```vue
<template #content="{ value, updateValue, confirm }">
  <!-- ✅ 使用 updateValue 更新值 -->
  <view @click="updateValue(value + 1)">{{ value }}</view>
  <wd-button @click="confirm">确认</wd-button>
</template>
```

### 4. 搜索过滤不生效

**原因:** `label-key` 指定的字段不是字符串类型

**解决:** 确保 `label-key` 指定的字段是字符串类型

### 5. 表单验证不触发

**原因:** 缺少 `prop` 属性

**解决:**
```vue
<wd-form :model="formData" :rules="rules">
  <!-- ✅ 添加 prop 属性 -->
  <wd-select-picker v-model="formData.city" prop="city" />
</wd-form>
```

## 注意事项

1. **类型匹配** - `checkbox` 使用数组，`radio` 使用基本类型，`custom` 使用任意类型
2. **字段名一致** - `label-key` 和 `value-key` 指定的字段必须存在于 `columns` 中
3. **数量限制** - `min` 和 `max` 仅在 `checkbox` 模式下生效
4. **搜索字段** - 启用 `filterable` 时，`label-key` 指定的字段必须是字符串
5. **自定义模式** - 必须通过 `updateValue` 方法更新值，不能直接修改 `modelValue`
6. **确认按钮** - `show-confirm` 仅在 `radio` 或 `custom` 时生效
7. **表单验证** - 必须设置 `prop` 属性才能正确关联验证规则
8. **加载颜色** - `loading-color` 必须使用完整十六进制格式（如 `#4D80F0`）

## 总结

SelectPicker 核心要点:

1. **三种模式** - radio（单选）、checkbox（多选）、custom（自定义）
2. **搜索过滤** - filterable 启用搜索功能
3. **数量限制** - min/max 控制多选数量
4. **格式化** - displayFormat 自定义显示文本
5. **校验** - beforeConfirm 确认前校验
6. **表单集成** - prop 属性关联表单验证
