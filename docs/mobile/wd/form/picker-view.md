---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/pickerView
---

# PickerView 选择器视图

## 介绍

PickerView 选择器视图是一个嵌入页面的滚动选择器组件，用于从一组数据中选择单个或多个值。与 Picker 组件不同，PickerView 不包含弹出层，可以直接嵌入到页面中使用，适用于需要将选择器固定显示在页面某个区域的场景。

组件基于原生 `picker-view` 实现，支持单列选择和多列联动选择，提供了丰富的数据格式支持和灵活的列联动回调机制。通过 `columnChange` 属性可以实现省市区等多级联动选择功能。组件内部实现了智能的禁用项跳过逻辑，当选中项被禁用时会自动跳转到最近的可用选项。

**核心特性:**

- **嵌入式设计** - 直接嵌入页面，无需弹出层，适合固定展示场景
- **多列支持** - 支持单列和多列选择，可实现复杂的多级联动
- **灵活数据格式** - 支持字符串数组、对象数组、二维数组等多种数据格式
- **列联动回调** - 提供 columnChange 回调，支持异步数据加载和列间联动
- **禁用选项** - 支持禁用特定选项，禁用项自动跳过选择
- **加载状态** - 内置 loading 状态，适合异步数据场景
- **暗黑模式** - 完整支持暗黑主题，自动适配系统主题
- **虚拟主机** - 启用虚拟主机节点，减少 DOM 层级

### 平台兼容性

| 平台 | 支持情况 | 说明 |
|------|---------|------|
| 微信小程序 | ✅ 完全支持 | 支持 immediateChange |
| 支付宝小程序 | ✅ 完全支持 | 支持 immediateChange |
| 抖音小程序 | ✅ 支持 | 基础功能完整 |
| QQ 小程序 | ✅ 支持 | 基础功能完整 |
| 百度小程序 | ✅ 支持 | 基础功能完整 |
| H5 | ✅ 支持 | 使用模拟实现 |
| App (iOS/Android) | ✅ 支持 | 原生渲染 |

## 基本用法

### 单列选择

最简单的使用方式，传入一维数组作为选项数据。组件会自动将字符串数组转换为标准的列选项格式。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view v-model="value" :columns="columns" />
    <view class="result">当前选择: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('February')
const columns = ref(['January', 'February', 'March', 'April', 'May', 'June'])
</script>

<style lang="scss" scoped>
.picker-demo {
  padding: 32rpx;
}
.result {
  margin-top: 20rpx;
  color: #666;
  font-size: 28rpx;
}
</style>
```

**使用说明:**

- 单列选择时，`v-model` 绑定的值为单个值（字符串、数字或布尔值）
- 传入字符串数组时，value 和 label 默认相同
- 如果 `v-model` 为空或未定义，会自动选中第一项

### 对象数组

使用对象数组时，通过 `valueKey` 和 `labelKey` 指定取值字段。这种方式适合需要区分显示文本和实际值的场景。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="value"
      :columns="columns"
      value-key="id"
      label-key="name"
    />
    <view class="result">选中 ID: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(2)
const columns = ref([
  { id: 1, name: '北京', code: 'BJ' },
  { id: 2, name: '上海', code: 'SH' },
  { id: 3, name: '广州', code: 'GZ' },
  { id: 4, name: '深圳', code: 'SZ' },
  { id: 5, name: '杭州', code: 'HZ' },
])
</script>
```

**使用说明:**

- `value-key` 指定选项对象中作为值的字段，默认为 `value`
- `label-key` 指定选项对象中作为显示文本的字段，默认为 `label`
- 对象可以包含任意额外字段，通过 `getSelects()` 方法可获取完整对象

### 多列选择

传入二维数组实现多列选择，每个子数组代表一列。适用于需要同时选择多个独立值的场景。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view v-model="value" :columns="columns" />
    <view class="result">选中: {{ value.join(' - ') }}</view>
  </view>
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

**使用说明:**

- 多列选择时，`v-model` 绑定的值为数组，数组长度与列数相同
- 每列可以有不同的选项数量
- 各列选择相互独立，不会联动

### 多列联动

通过 `columnChange` 回调实现列间联动，当某一列值变化时动态更新其他列的数据。这是实现省市区选择等级联场景的核心功能。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="value"
      :columns="columns"
      :column-change="handleColumnChange"
    />
    <view class="result">选中: {{ value.join(' / ') }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PickerViewColumnChange } from '@/wd/components/wd-picker-view/wd-picker-view.vue'

const value = ref(['浙江', '杭州'])

// 城市数据映射
const cityData: Record<string, string[]> = {
  '浙江': ['杭州', '宁波', '温州', '绍兴', '嘉兴', '湖州'],
  '江苏': ['南京', '苏州', '无锡', '常州', '徐州', '南通'],
  '广东': ['广州', '深圳', '东莞', '佛山', '珠海', '惠州'],
  '北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
  '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '浦东新区'],
}

// 初始化列数据
const columns = ref([
  Object.keys(cityData),
  cityData['浙江'],
])

/**
 * 列变化回调
 * @param picker - 选择器实例
 * @param selects - 当前选中项
 * @param index - 变化列的索引
 * @param resolve - 完成回调
 */
const handleColumnChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  if (index === 0) {
    // 省份变化时，更新城市列
    const province = (selects as Record<string, any>[])[0].value
    const cities = cityData[province] || []
    // 使用 setColumnData 更新第二列数据，第三个参数 0 表示选中第一项
    picker.setColumnData(1, cities, 0)
  }
  // 数据更新完成后必须调用 resolve
  resolve()
}
</script>
```

**联动机制说明:**

1. `columnChange` 接收四个参数：
   - `picker`: 组件实例，可调用组件方法
   - `selects`: 当前所有列的选中项
   - `index`: 发生变化的列索引
   - `resolve`: 完成回调函数

2. 使用 `picker.setColumnData(columnIndex, data, rowIndex)` 更新列数据：
   - `columnIndex`: 要更新的列索引
   - `data`: 新的列数据
   - `rowIndex`: 更新后选中的行索引，默认为 0

3. **必须调用 resolve()** 来通知组件数据更新完成

### 三级联动

实现省市区三级联动选择。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="value"
      :columns="columns"
      :column-change="handleColumnChange"
    />
    <view class="result">
      地址: {{ value.join(' / ') }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PickerViewColumnChange } from '@/wd/components/wd-picker-view/wd-picker-view.vue'

// 地区数据
const areaData = {
  '浙江': {
    '杭州': ['西湖区', '上城区', '下城区', '江干区', '拱墅区'],
    '宁波': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区'],
  },
  '江苏': {
    '南京': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区'],
    '苏州': ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区'],
  },
}

const value = ref(['浙江', '杭州', '西湖区'])

// 初始化三列数据
const columns = ref([
  Object.keys(areaData),
  Object.keys(areaData['浙江']),
  areaData['浙江']['杭州'],
])

const handleColumnChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  const selectsArr = selects as Record<string, any>[]

  if (index === 0) {
    // 省份变化，更新城市和区县
    const province = selectsArr[0].value
    const cities = Object.keys(areaData[province] || {})
    const firstCity = cities[0] || ''
    const districts = areaData[province]?.[firstCity] || []

    picker.setColumnData(1, cities, 0)
    picker.setColumnData(2, districts, 0)
  } else if (index === 1) {
    // 城市变化，更新区县
    const province = selectsArr[0].value
    const city = selectsArr[1].value
    const districts = areaData[province]?.[city] || []

    picker.setColumnData(2, districts, 0)
  }

  resolve()
}
</script>
```

### 禁用选项

通过 `disabled` 属性禁用特定选项，禁用的选项无法被选中。组件内部会自动跳过禁用项，选中最近的可用选项。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view v-model="value" :columns="columns" />
    <view class="tip">注意: March 和 May 已被禁用</view>
  </view>
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

<style lang="scss" scoped>
.tip {
  margin-top: 20rpx;
  color: #f56c6c;
  font-size: 24rpx;
}
</style>
```

**禁用逻辑说明:**

- 当用户滑动到禁用项时，会自动跳转到最近的可用选项
- 优先查找前面的可用选项，其次查找后面的可用选项
- 如果所有选项都被禁用，保持当前位置不变

### 加载状态

设置 `loading` 属性显示加载状态，适用于异步获取数据的场景。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="value"
      :columns="columns"
      :loading="loading"
      loading-color="#1989fa"
    />
    <wd-button v-if="!loading" @click="refreshData">刷新数据</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const value = ref('')
const columns = ref<string[]>([])
const loading = ref(true)

// 模拟异步加载数据
const loadData = () => {
  loading.value = true

  setTimeout(() => {
    columns.value = ['选项1', '选项2', '选项3', '选项4', '选项5']
    value.value = '选项1'
    loading.value = false
  }, 1500)
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
```

**加载状态说明:**

- `loading` 为 true 时，会在选择器上方显示半透明遮罩和加载图标
- 可通过 `loading-color` 自定义加载图标颜色
- 加载状态下用户无法操作选择器

### 自定义高度

通过 `columnsHeight` 属性设置选择器的高度。

```vue
<template>
  <view class="picker-demo">
    <view class="picker-item">
      <text class="label">默认高度 (217rpx)</text>
      <wd-picker-view v-model="value1" :columns="columns" />
    </view>

    <view class="picker-item">
      <text class="label">大号高度 (350rpx)</text>
      <wd-picker-view
        v-model="value2"
        :columns="columns"
        :columns-height="350"
      />
    </view>

    <view class="picker-item">
      <text class="label">小号高度 (150rpx)</text>
      <wd-picker-view
        v-model="value3"
        :columns="columns"
        :columns-height="150"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const columns = ref(['January', 'February', 'March', 'April', 'May', 'June'])
const value1 = ref('February')
const value2 = ref('March')
const value3 = ref('April')
</script>

<style lang="scss" scoped>
.picker-item {
  margin-bottom: 40rpx;

  .label {
    display: block;
    margin-bottom: 16rpx;
    color: #333;
    font-size: 28rpx;
    font-weight: 500;
  }
}
</style>
```

### 立即触发变化

设置 `immediate-change` 属性，在手指松开时立即触发 change 事件，而不是等滚动动画结束。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="value"
      :columns="columns"
      :immediate-change="true"
      @change="handleChange"
    />
    <view class="log">变化日志: {{ changeLog }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('February')
const columns = ref(['January', 'February', 'March', 'April', 'May', 'June'])
const changeLog = ref('')

const handleChange = ({ value: newValue }) => {
  changeLog.value = `${new Date().toLocaleTimeString()} - 选中: ${newValue}`
}
</script>
```

**注意:**
- `immediate-change` 仅在微信小程序和支付宝小程序中支持
- 其他平台会在滚动动画结束后触发 change 事件

## 高级用法

### 数字选择器

实现数字范围选择，如年龄、数量等场景。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view v-model="age" :columns="ageColumns" />
    <view class="result">选中年龄: {{ age }} 岁</view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const age = ref(25)

// 生成 1-100 的年龄选项
const ageColumns = computed(() => {
  return Array.from({ length: 100 }, (_, i) => ({
    label: `${i + 1} 岁`,
    value: i + 1,
  }))
})
</script>
```

### 时间选择器

实现简单的时分选择。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="time"
      :columns="timeColumns"
      :column-change="handleTimeChange"
    />
    <view class="result">选中时间: {{ time[0] }}:{{ time[1] }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { PickerViewColumnChange } from '@/wd/components/wd-picker-view/wd-picker-view.vue'

const time = ref(['09', '30'])

// 小时列 (00-23)
const hours = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0'),
}))

// 分钟列 (00-59)
const minutes = Array.from({ length: 60 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0'),
}))

const timeColumns = ref([hours, minutes])

const handleTimeChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  // 时间选择无需联动，直接 resolve
  resolve()
}
</script>
```

### 异步联动加载

对于省市区等需要从服务器异步加载的场景。

```vue
<template>
  <view class="picker-demo">
    <wd-picker-view
      v-model="value"
      :columns="columns"
      :column-change="handleColumnChange"
      :loading="loading"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { PickerViewColumnChange } from '@/wd/components/wd-picker-view/wd-picker-view.vue'

const value = ref<string[]>([])
const columns = ref<any[][]>([])
const loading = ref(true)

// 模拟 API 请求
const fetchProvinces = async () => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve(['浙江', '江苏', '广东'])
    }, 500)
  })
}

const fetchCities = async (province: string) => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      const cityMap: Record<string, string[]> = {
        '浙江': ['杭州', '宁波', '温州'],
        '江苏': ['南京', '苏州', '无锡'],
        '广东': ['广州', '深圳', '东莞'],
      }
      resolve(cityMap[province] || [])
    }, 300)
  })
}

const handleColumnChange: PickerViewColumnChange = async (picker, selects, index, resolve) => {
  if (index === 0) {
    const province = (selects as any[])[0].value
    const cities = await fetchCities(province)
    picker.setColumnData(1, cities, 0)
  }
  resolve()
}

// 初始化
onMounted(async () => {
  const provinces = await fetchProvinces()
  const cities = await fetchCities(provinces[0])

  columns.value = [provinces, cities]
  value.value = [provinces[0], cities[0]]
  loading.value = false
})
</script>
```

### 表单集成

在表单中使用，通过 ref 获取选择器实例调用方法。

```vue
<template>
  <view class="form-demo">
    <wd-picker-view
      ref="pickerRef"
      v-model="formData.city"
      :columns="cityColumns"
    />

    <view class="form-actions">
      <wd-button type="primary" @click="handleSubmit">提交</wd-button>
      <wd-button @click="handleReset">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { WdPickerViewExpose } from '@/wd/components/wd-picker-view/wd-picker-view.vue'

const pickerRef = ref<WdPickerViewExpose>()

const formData = reactive({
  city: '上海',
})

const cityColumns = ref([
  { label: '北京', value: '北京', code: 'BJ' },
  { label: '上海', value: '上海', code: 'SH' },
  { label: '广州', value: '广州', code: 'GZ' },
  { label: '深圳', value: '深圳', code: 'SZ' },
])

const handleSubmit = () => {
  // 获取选中值
  const value = pickerRef.value?.getValues()
  // 获取选中项完整信息
  const select = pickerRef.value?.getSelects()
  // 获取选中项的 label
  const label = pickerRef.value?.getLabels()

  console.log('提交数据:', {
    value,
    select,
    label,
  })

  uni.showToast({
    title: `已选择: ${label?.[0]}`,
    icon: 'success',
  })
}

const handleReset = () => {
  formData.city = '北京'
}
</script>

<style lang="scss" scoped>
.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中项的值，单列时为单值，多列时为数组 | `string \| number \| boolean \| Array` | - |
| columns | 选择器数据，支持字符串数组、对象数组、二维数组 | `Array` | `[]` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载图标颜色，需使用完整十六进制格式 | `string` | `#4D80F0` |
| columns-height | 选择器内部滚筒高度，单位 rpx | `number` | `217` |
| value-key | 选项对象中 value 对应的 key | `string` | `value` |
| label-key | 选项对象中展示文本对应的 key | `string` | `label` |
| immediate-change | 是否在手指松开时立即触发 change 事件（仅微信/支付宝小程序） | `boolean` | `false` |
| column-change | 列变化回调函数，用于实现列间联动 | `PickerViewColumnChange` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中项变化时触发 | `{ picker: WdPickerViewExpose, value: PickerViewValue, index: number }` |
| pickstart | 开始滚动时触发 | - |
| pickend | 结束滚动时触发 | - |

### Methods

通过 ref 获取组件实例后可调用以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| getSelects | 获取所有列选中项的完整对象 | - | `Record<string, any> \| Record<string, any>[]` |
| getValues | 获取所有列的选中值 | - | `PickerViewValue` |
| getLabels | 获取所有列选中项的 label | - | `string[]` |
| getColumnData | 获取某一列的选项数据 | `columnIndex: number` | `Record<string, string>[]` |
| getColumnsData | 获取所有列数据 | - | `Record<string, string>[][]` |
| getColumnIndex | 获取某一列的选中项下标 | `columnIndex: number` | `number` |
| getSelectedIndex | 获取所有列的选中索引数组 | - | `number[]` |
| setColumnData | 设置某一列的数据 | `columnIndex: number, data: Array, rowIndex?: number` | - |
| resetColumns | 重置所有列数据 | `columns: Array` | - |

### 类型定义

```typescript
/**
 * 列选项数据项接口
 */
interface ColumnItem {
  /** 选项值 */
  value?: string | number | boolean
  /** 选项标签（显示文本） */
  label?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 其他自定义字段 */
  [key: string]: any
}

/**
 * 选择器值类型
 * - 单列时为单个值
 * - 多列时为数组
 */
type PickerViewValue = string | number | boolean | Array<string | number | boolean>

/**
 * 列变化回调函数类型
 * @param pickerView - 选择器视图实例
 * @param selects - 当前选中项，单列为对象，多列为数组
 * @param index - 发生变化的列索引
 * @param resolve - 完成回调，异步操作完成后必须调用
 */
type PickerViewColumnChange = (
  pickerView: WdPickerViewExpose,
  selects: Record<string, any> | Record<string, any>[],
  index: number,
  resolve: () => void,
) => void

/**
 * 组件实例类型
 */
type PickerViewInstance = ComponentPublicInstance<WdPickerViewProps, WdPickerViewExpose>

/**
 * 组件暴露接口
 */
interface WdPickerViewExpose {
  /** 获取所有列选中项 */
  getSelects: () => Record<string, any> | Record<string, any>[]
  /** 获取所有列的选中值 */
  getValues: () => PickerViewValue
  /** 设置列数据 */
  setColumnData: (
    columnIndex: number,
    data: Array<string | number | ColumnItem | Array<string | number | ColumnItem>>,
    rowIndex?: number,
  ) => void
  /** 获取所有列数据 */
  getColumnsData: () => Record<string, string>[][]
  /** 获取某一列的选项 */
  getColumnData: (columnIndex: number) => Record<string, string>[]
  /** 获取某一列的选中项下标 */
  getColumnIndex: (columnIndex: number) => number
  /** 获取所有列选中项的 label */
  getLabels: () => string[]
  /** 获取选中索引数组 */
  getSelectedIndex: () => number[]
  /** 重置列数据为指定列数据 */
  resetColumns: (
    columns: (string | number | string[] | number[] | ColumnItem | ColumnItem[])[],
  ) => void
}

/**
 * 组件属性接口
 */
interface WdPickerViewProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 加载状态 */
  loading?: boolean
  /** 加载的颜色，只能使用十六进制的色值写法 */
  loadingColor?: string
  /** picker 内部滚筒高度 */
  columnsHeight?: number
  /** 选项对象中，value 对应的 key */
  valueKey?: string
  /** 选项对象中，展示的文本对应的 key */
  labelKey?: string
  /** 是否在手指松开时立即触发 change 事件 */
  immediateChange?: boolean
  /** 选中项 */
  modelValue: PickerViewValue
  /** 选择器数据 */
  columns?: Array<string | number | ColumnItem | Array<number> | Array<string> | Array<ColumnItem>>
  /** 列变化回调 */
  columnChange?: PickerViewColumnChange
}

/**
 * 组件事件接口
 */
interface WdPickerViewEmits {
  /** 选中项变化时触发 */
  change: [{ picker: WdPickerViewExpose; value: PickerViewValue; index: number }]
  /** 开始滚动时触发 */
  pickstart: []
  /** 结束滚动时触发 */
  pickend: []
  /** 更新选中值 */
  'update:modelValue': [value: PickerViewValue]
}
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-picker-bg | 选择器背景色 | `#ffffff` |
| --wd-picker-mask | 选择器遮罩背景（渐变） | `linear-gradient(...)` |
| --wd-picker-loading-bg | 加载状态背景色 | `rgba(255, 255, 255, 0.8)` |
| --wd-picker-column-fs | 选项字体大小 | `32rpx` |
| --wd-picker-column-color | 选项文字颜色 | `#333333` |
| --wd-picker-column-disabled-color | 禁用选项文字颜色 | `#c0c4cc` |
| --wd-picker-column-padding | 选项内边距 | `0 20rpx` |

### 自定义样式示例

```vue
<template>
  <view class="custom-picker">
    <wd-picker-view v-model="value" :columns="columns" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('February')
const columns = ref(['January', 'February', 'March', 'April', 'May', 'June'])
</script>

<style lang="scss" scoped>
.custom-picker {
  // 自定义背景色
  --wd-picker-bg: #f5f7fa;
  // 自定义字体大小
  --wd-picker-column-fs: 36rpx;
  // 自定义文字颜色
  --wd-picker-column-color: #409eff;
  // 自定义禁用颜色
  --wd-picker-column-disabled-color: #dcdfe6;
}
</style>
```

### 暗黑模式

组件已适配暗黑模式，在暗黑主题下会自动切换样式：

```scss
// 暗黑模式下的样式自动适配
.wot-theme-dark {
  .wd-picker-view {
    // 背景色自动切换为暗色
    // 文字颜色自动切换为亮色
    // 禁用颜色自动调整
  }
}
```

## 最佳实践

### 1. 异步联动加载

对于省市区等需要异步加载的场景，在 columnChange 中正确使用 resolve 回调：

```vue
<script lang="ts" setup>
const handleColumnChange: PickerViewColumnChange = async (picker, selects, index, resolve) => {
  if (index === 0) {
    try {
      // 显示加载状态（可选）
      loading.value = true

      // 异步加载城市数据
      const cities = await fetchCities((selects as any[])[0].value)

      // 更新列数据
      picker.setColumnData(1, cities, 0)
    } finally {
      loading.value = false
    }
  }

  // 数据加载完成后必须调用 resolve
  resolve()
}
</script>
```

### 2. 表单数据提取

使用组件方法获取完整的选中信息：

```vue
<script lang="ts" setup>
const handleSubmit = () => {
  // 获取选中值 - 用于提交
  const value = pickerRef.value?.getValues()

  // 获取选中项的 label - 用于显示
  const labels = pickerRef.value?.getLabels()

  // 获取选中项完整对象 - 用于获取额外信息
  const selects = pickerRef.value?.getSelects()

  // 多列时 selects 是数组，单列时是对象
  if (Array.isArray(selects)) {
    console.log('省:', selects[0])
    console.log('市:', selects[1])
  }
}
</script>
```

### 3. 动态更新选项

使用响应式数据或 resetColumns 方法动态更新选项：

```vue
<script lang="ts" setup>
// 方式1: 直接修改响应式数据
const updateColumns = () => {
  columns.value = newColumns
}

// 方式2: 使用 resetColumns 方法
const resetPicker = () => {
  pickerRef.value?.resetColumns(newColumns)
}

// 方式3: 使用 setColumnData 更新单列
const updateSingleColumn = () => {
  pickerRef.value?.setColumnData(0, newColumnData, 0)
}
</script>
```

### 4. 性能优化

对于大量数据的选择器，建议：

```vue
<script lang="ts" setup>
import { computed } from 'vue'

// 使用计算属性生成选项数据
const columns = computed(() => {
  // 只在依赖变化时重新计算
  return generateColumns(props.data)
})

// 避免在模板中直接生成大量数据
// ❌ 不推荐
// <wd-picker-view :columns="Array.from({length: 1000}, (_, i) => i)" />

// ✅ 推荐
// <wd-picker-view :columns="columns" />
</script>
```

## 常见问题

### 1. 如何获取选中项的完整信息？

使用 `getSelects` 方法可以获取选中项的完整对象信息：

```typescript
const pickerRef = ref()

// 获取选中项完整信息
const selects = pickerRef.value?.getSelects()

// 单列选择器返回单个对象
// { label: 'xxx', value: 'xxx', disabled: false, ... }

// 多列选择器返回数组
// [{ label: 'xxx', value: 'xxx' }, { label: 'yyy', value: 'yyy' }]
```

### 2. 多列联动时如何处理异步数据？

确保在 columnChange 回调中正确使用 resolve：

```typescript
const handleColumnChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  // 异步操作
  fetchData().then((data) => {
    picker.setColumnData(1, data, 0)
    // 数据准备好后调用 resolve
    resolve()
  }).catch(() => {
    // 出错时也要调用 resolve
    resolve()
  })
}
```

### 3. 如何动态更新选项数据？

有多种方式更新选项数据：

```typescript
// 方式1: 直接修改 columns 响应式数据
columns.value = newColumns

// 方式2: 使用 resetColumns 方法
pickerRef.value?.resetColumns(newColumns)

// 方式3: 使用 setColumnData 更新单列
pickerRef.value?.setColumnData(columnIndex, newData, 0)
```

### 4. 为什么设置的值没有生效？

请检查以下几点：

1. **值类型匹配**: 确保 v-model 的值类型与 columns 中的 value 类型一致
2. **值存在性**: 确保设置的值在 columns 中存在
3. **多列格式**: 多列选择时 v-model 应为数组

```typescript
// 单列 - 值为单个值
const value = ref('option1')

// 多列 - 值为数组
const value = ref(['option1', 'option2'])

// 对象数组 - 确保 valueKey 正确
const value = ref(1) // 如果 valueKey 是 'id'
```

### 5. immediateChange 在某些平台不生效？

`immediate-change` 属性仅在微信小程序和支付宝小程序中支持。在其他平台上，change 事件会在滚动动画结束后触发。

### 6. 禁用项无法选中的逻辑是什么？

当用户滑动到禁用项时，组件会自动跳转到最近的可用选项：
- 优先查找当前位置之前的可用选项
- 如果前面没有，则查找后面的可用选项
- 如果全部禁用，保持当前位置

### 7. 如何实现日期选择？

可以结合多列联动实现日期选择：

```typescript
const years = Array.from({ length: 50 }, (_, i) => 1990 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)

const getDays = (year: number, month: number) => {
  const days = new Date(year, month, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
}

const handleColumnChange: PickerViewColumnChange = (picker, selects, index, resolve) => {
  if (index === 0 || index === 1) {
    const year = (selects as any[])[0].value
    const month = (selects as any[])[1].value
    const days = getDays(year, month)
    picker.setColumnData(2, days, 0)
  }
  resolve()
}
```
