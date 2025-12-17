---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/pickerView
---

# PickerView 选择器视图

## 介绍

PickerView 选择器视图是一个嵌入页面的滚动选择器组件,用于从一组数据中选择单个或多个值。与 Picker 组件不同,PickerView 不包含弹出层,可以直接嵌入到页面中使用,适用于需要将选择器固定显示在页面某个区域的场景。

组件基于原生 `picker-view` 实现,支持单列选择和多列联动选择,提供了丰富的数据格式支持和灵活的列联动回调机制。通过 `columnChange` 属性可以实现省市区等多级联动选择功能。

**核心特性:**

- **嵌入式设计** - 直接嵌入页面,无需弹出层,适合固定展示场景
- **多列支持** - 支持单列和多列选择,可实现复杂的多级联动
- **灵活数据格式** - 支持字符串数组、对象数组、二维数组等多种数据格式
- **列联动回调** - 提供 columnChange 回调,支持异步数据加载和列间联动
- **禁用选项** - 支持禁用特定选项,禁用项自动跳过选择
- **加载状态** - 内置 loading 状态,适合异步数据场景

## 基本用法

### 单列选择

最简单的使用方式,传入一维数组作为选项数据。

```vue
<template>
  <wd-picker-view v-model="value" :columns="columns" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('February')
const columns = ref(['January', 'February', 'March', 'April', 'May', 'June'])
</script>
```

### 对象数组

使用对象数组时,通过 `valueKey` 和 `labelKey` 指定取值字段。

```vue
<template>
  <wd-picker-view
    v-model="value"
    :columns="columns"
    value-key="id"
    label-key="name"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(2)
const columns = ref([
  { id: 1, name: '北京' },
  { id: 2, name: '上海' },
  { id: 3, name: '广州' },
  { id: 4, name: '深圳' },
])
</script>
```

### 多列选择

传入二维数组实现多列选择,每个子数组代表一列。

```vue
<template>
  <wd-picker-view v-model="value" :columns="columns" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(['February', 'February'])
const columns = ref([
  ['January', 'February', 'March', 'April', 'May', 'June'],
  ['January', 'February', 'March', 'April', 'May', 'June'],
])
</script>
```

### 多列联动

通过 `columnChange` 回调实现列间联动,当某一列值变化时动态更新其他列的数据。

```vue
<template>
  <wd-picker-view
    v-model="value"
    :columns="columns"
    :column-change="handleColumnChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PickerViewColumnChange } from '@/wd/components/wd-picker-view/wd-picker-view.vue'

const value = ref(['浙江', '杭州'])

const cityData: Record<string, string[]> = {
  '浙江': ['杭州', '宁波', '温州', '绍兴'],
  '江苏': ['南京', '苏州', '无锡', '常州'],
  '广东': ['广州', '深圳', '东莞', '佛山'],
}

const columns = ref([
  Object.keys(cityData),
  cityData['浙江'],
])

const handleColumnChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  if (index === 0) {
    // 省份变化时,更新城市列
    const province = (selects as Record<string, any>[])[0].value
    picker.setColumnData(1, cityData[province] || [], 0)
  }
  resolve()
}
</script>
```

### 禁用选项

通过 `disabled` 属性禁用特定选项,禁用的选项无法被选中。

```vue
<template>
  <wd-picker-view v-model="value" :columns="columns" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('February')
const columns = ref([
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March', disabled: true },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May', disabled: true },
  { label: 'June', value: 'June' },
])
</script>
```

### 加载状态

设置 `loading` 属性显示加载状态,适用于异步获取数据的场景。

```vue
<template>
  <wd-picker-view
    v-model="value"
    :columns="columns"
    :loading="loading"
    loading-color="#1989fa"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const value = ref('')
const columns = ref<string[]>([])
const loading = ref(true)

onMounted(() => {
  // 模拟异步加载
  setTimeout(() => {
    columns.value = ['选项1', '选项2', '选项3']
    value.value = '选项1'
    loading.value = false
  }, 1500)
})
</script>
```

### 自定义高度

通过 `columnsHeight` 属性设置选择器的高度。

```vue
<template>
  <wd-picker-view
    v-model="value"
    :columns="columns"
    :columns-height="300"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('February')
const columns = ref(['January', 'February', 'March', 'April', 'May', 'June'])
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中项的值 | `string \| number \| boolean \| Array` | - |
| columns | 选择器数据,支持字符串数组、对象数组、二维数组 | `Array` | `[]` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载图标颜色,十六进制格式 | `string` | `#4D80F0` |
| columns-height | 选择器内部滚筒高度,单位 rpx | `number` | `217` |
| value-key | 选项对象中 value 对应的 key | `string` | `value` |
| label-key | 选项对象中展示文本对应的 key | `string` | `label` |
| immediate-change | 是否在手指松开时立即触发 change 事件 | `boolean` | `false` |
| column-change | 列变化回调函数,用于实现列间联动 | `PickerViewColumnChange` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中项变化时触发 | `{ picker: PickerViewExpose, value: PickerViewValue, index: number }` |
| pickstart | 开始滚动时触发 | - |
| pickend | 结束滚动时触发 | - |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| getSelects | 获取所有列选中项 | - | `Record<string, any> \| Record<string, any>[]` |
| getValues | 获取所有列的选中值 | - | `PickerViewValue` |
| getLabels | 获取所有列选中项的 label | - | `string[]` |
| getColumnData | 获取某一列的选项 | `columnIndex: number` | `Record<string, string>[]` |
| getColumnsData | 获取所有列数据 | - | `Record<string, string>[][]` |
| getColumnIndex | 获取某一列的选中项下标 | `columnIndex: number` | `number` |
| getSelectedIndex | 获取选中索引数组 | - | `number[]` |
| setColumnData | 设置某一列的数据 | `columnIndex: number, data: Array, rowIndex?: number` | - |
| resetColumns | 重置列数据 | `columns: Array` | - |

### 类型定义

```typescript
/**
 * 列选项数据项接口
 */
interface ColumnItem {
  /** 选项值 */
  value?: string | number | boolean
  /** 选项标签 */
  label?: string
  /** 是否禁用 */
  disabled?: boolean
  [key: string]: any
}

/**
 * 选择器值类型
 */
type PickerViewValue = string | number | boolean | Array<string | number | boolean>

/**
 * 列变化回调函数类型
 */
type PickerViewColumnChange = (
  pickerView: WdPickerViewExpose,
  selects: Record<string, any> | Record<string, any>[],
  index: number,
  resolve: () => void,
) => void

/**
 * 组件暴露接口
 */
interface WdPickerViewExpose {
  getSelects: () => Record<string, any> | Record<string, any>[]
  getValues: () => PickerViewValue
  setColumnData: (columnIndex: number, data: Array, rowIndex?: number) => void
  getColumnsData: () => Record<string, string>[][]
  getColumnData: (columnIndex: number) => Record<string, string>[]
  getColumnIndex: (columnIndex: number) => number
  getLabels: () => string[]
  getSelectedIndex: () => number[]
  resetColumns: (columns: Array) => void
}
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-picker-bg | 选择器背景色 | `#ffffff` |
| --wd-picker-mask | 选择器遮罩背景 | 渐变色 |
| --wd-picker-loading-bg | 加载状态背景色 | `rgba(255, 255, 255, 0.8)` |
| --wd-picker-column-fs | 选项字体大小 | `32rpx` |
| --wd-picker-column-color | 选项文字颜色 | `#333333` |
| --wd-picker-column-disabled-color | 禁用选项文字颜色 | `#c0c4cc` |
| --wd-picker-column-padding | 选项内边距 | `0 20rpx` |

### 暗黑模式

组件已适配暗黑模式,在暗黑主题下会自动切换样式:

```scss
.wot-theme-dark {
  .wd-picker-view {
    // 暗黑模式下的样式自动适配
  }
}
```

## 最佳实践

### 1. 异步联动加载

对于省市区等需要异步加载的场景,在 columnChange 中使用 resolve 回调:

```vue
<script lang="ts" setup>
const handleColumnChange: PickerViewColumnChange = async (picker, selects, index, resolve) => {
  if (index === 0) {
    // 异步加载城市数据
    const cities = await fetchCities(selects[0].value)
    picker.setColumnData(1, cities, 0)
  }
  // 数据加载完成后调用 resolve
  resolve()
}
</script>
```

### 2. 表单集成

在表单中使用时,可以通过 getValues 方法获取当前选中值:

```vue
<template>
  <wd-picker-view ref="pickerRef" v-model="value" :columns="columns" />
  <wd-button @click="handleSubmit">提交</wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const pickerRef = ref()
const value = ref('')

const handleSubmit = () => {
  const selectedValue = pickerRef.value?.getValues()
  const selectedLabels = pickerRef.value?.getLabels()
  console.log('选中值:', selectedValue)
  console.log('选中标签:', selectedLabels)
}
</script>
```

## 常见问题

### 1. 如何获取选中项的完整信息?

使用 `getSelects` 方法可以获取选中项的完整对象信息:

```typescript
const pickerRef = ref()

// 获取选中项完整信息
const selects = pickerRef.value?.getSelects()
console.log(selects) // { label: 'xxx', value: 'xxx', ... }
```

### 2. 多列联动时如何处理异步数据?

确保在 columnChange 回调中正确使用 resolve:

```typescript
const handleColumnChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  // 异步操作
  fetchData().then((data) => {
    picker.setColumnData(1, data, 0)
    resolve() // 数据准备好后调用
  })
}
```

### 3. 如何动态更新选项数据?

直接修改 columns 响应式数据即可:

```typescript
// 动态更新列数据
columns.value = newColumns
```
