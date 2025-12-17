---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/datetimePickerView
---

# DatetimePickerView 日期时间选择器视图

## 介绍

DatetimePickerView 日期时间选择器视图是 PickerView 组件的封装,在其内部构建好日期时间选项,提供了嵌入式的日期时间选择功能。与 DatetimePicker 组件不同,DatetimePickerView 不包含弹出层,可以直接嵌入到页面中使用。

组件支持多种时间类型选择,包括年、年月、日期、时间、日期时间等,并提供了丰富的自定义选项,如过滤器、格式化函数、时间范围限制等。

**核心特性:**

- **嵌入式设计** - 直接嵌入页面,无需弹出层,适合固定展示场景
- **多种类型** - 支持 date、year-month、time、datetime、year 五种选择类型
- **范围限制** - 支持设置最小/最大日期、时/分/秒范围
- **自定义格式** - 支持自定义过滤器和格式化函数
- **秒选择** - time 和 datetime 类型支持秒级选择
- **智能联动** - 日期列自动联动,如月份变化自动调整天数

## 基本用法

### 日期选择

默认类型为 `datetime`,可通过 `type` 属性设置为 `date` 实现纯日期选择。

```vue
<template>
  <wd-datetime-picker-view v-model="value" type="date" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 年月选择

设置 `type="year-month"` 实现年月选择。

```vue
<template>
  <wd-datetime-picker-view v-model="value" type="year-month" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 年份选择

设置 `type="year"` 实现年份选择。

```vue
<template>
  <wd-datetime-picker-view v-model="value" type="year" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 时间选择

设置 `type="time"` 实现时间选择,值为字符串格式 `HH:mm` 或 `HH:mm:ss`。

```vue
<template>
  <wd-datetime-picker-view v-model="value" type="time" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('09:30')
</script>
```

### 日期时间选择

`type="datetime"` 同时选择日期和时间。

```vue
<template>
  <wd-datetime-picker-view v-model="value" type="datetime" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 秒级选择

设置 `use-second` 属性启用秒选择,适用于 time 和 datetime 类型。

```vue
<template>
  <wd-datetime-picker-view v-model="value" type="time" use-second />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('09:30:45')
</script>
```

### 日期范围限制

通过 `min-date` 和 `max-date` 设置可选日期范围。

```vue
<template>
  <wd-datetime-picker-view
    v-model="value"
    type="date"
    :min-date="minDate"
    :max-date="maxDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const minDate = ref(new Date(2020, 0, 1).getTime())
const maxDate = ref(new Date(2025, 11, 31).getTime())
</script>
```

### 时间范围限制

对于 time 类型,可设置时分秒的范围限制。

```vue
<template>
  <wd-datetime-picker-view
    v-model="value"
    type="time"
    :min-hour="8"
    :max-hour="18"
    :min-minute="0"
    :max-minute="59"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('09:30')
</script>
```

### 选项过滤

通过 `filter` 函数过滤不需要的选项。

```vue
<template>
  <wd-datetime-picker-view
    v-model="value"
    type="time"
    :filter="filter"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewFilter } from '@/wd/components/wd-datetime-picker-view/wd-datetime-picker-view.vue'

const value = ref('09:00')

// 分钟只显示 00、15、30、45
const filter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'minute') {
    return values.filter((v) => v % 15 === 0)
  }
  return values
}
</script>
```

### 自定义格式化

通过 `formatter` 函数自定义选项显示文本。

```vue
<template>
  <wd-datetime-picker-view
    v-model="value"
    type="date"
    :formatter="formatter"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewFormatter } from '@/wd/components/wd-datetime-picker-view/wd-datetime-picker-view.vue'

const value = ref(Date.now())

const formatter: DatetimePickerViewFormatter = (type, value) => {
  switch (type) {
    case 'year':
      return `${value}年`
    case 'month':
      return `${value}月`
    case 'date':
      return `${value}日`
    case 'hour':
      return `${value}时`
    case 'minute':
      return `${value}分`
    case 'second':
      return `${value}秒`
    default:
      return value
  }
}
</script>
```

### 加载状态

设置 `loading` 显示加载状态。

```vue
<template>
  <wd-datetime-picker-view
    v-model="value"
    type="date"
    :loading="loading"
    loading-color="#1989fa"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const value = ref<number | null>(null)
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    value.value = Date.now()
    loading.value = false
  }, 1500)
})
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中值,time 类型为字符串,其他类型为时间戳 | `string \| number` | - |
| type | 选择器类型 | `'date' \| 'year-month' \| 'time' \| 'datetime' \| 'year'` | `datetime` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载图标颜色 | `string` | `#4D80F0` |
| columns-height | 选择器内部滚筒高度 | `number` | `217` |
| min-date | 最小日期,时间戳格式 | `number` | 十年前 |
| max-date | 最大日期,时间戳格式 | `number` | 十年后 |
| min-hour | 最小小时,time 类型生效 | `number` | `0` |
| max-hour | 最大小时,time 类型生效 | `number` | `23` |
| min-minute | 最小分钟,time 类型生效 | `number` | `0` |
| max-minute | 最大分钟,time 类型生效 | `number` | `59` |
| use-second | 是否显示秒选择 | `boolean` | `false` |
| min-second | 最小秒数 | `number` | `0` |
| max-second | 最大秒数 | `number` | `59` |
| filter | 选项过滤函数 | `DatetimePickerViewFilter` | - |
| formatter | 选项格式化函数 | `DatetimePickerViewFormatter` | - |
| column-formatter | 列格式化函数 | `DatetimePickerViewColumnFormatter` | - |
| immediate-change | 是否在手指松开时立即触发 change | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值变化时触发 | `{ value: string \| number, picker: DatetimePickerViewInstance }` |
| pickstart | 开始滚动时触发 | - |
| pickend | 结束滚动时触发 | - |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| updateColumns | 更新列数据 | - | `DatetimePickerViewOption[][]` |
| setColumns | 手动设置列数据 | `columnList: DatetimePickerViewOption[][]` | - |
| getSelects | 获取当前选中项 | - | `Record<string, any>[]` |
| correctValue | 修正输入值 | `value: string \| number` | `string \| number` |
| getPickerValue | 获取 picker 值数组 | `value: string \| number, type: DateTimeType` | `number[]` |
| getOriginColumns | 获取原始列配置 | - | `{ type: string, values: number[] }[]` |

### 类型定义

```typescript
/**
 * 日期时间类型
 */
type DateTimeType = 'date' | 'year-month' | 'time' | 'datetime' | 'year'

/**
 * 日期时间选择器列类型
 */
type DatetimePickerViewColumnType = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second'

/**
 * 选项接口
 */
interface DatetimePickerViewOption {
  label: string
  value: number
}

/**
 * 过滤器函数类型
 */
type DatetimePickerViewFilter = (
  type: DatetimePickerViewColumnType,
  values: number[],
) => number[]

/**
 * 格式化函数类型
 */
type DatetimePickerViewFormatter = (type: string, value: string) => string

/**
 * 列格式化函数类型
 */
type DatetimePickerViewColumnFormatter = (
  picker: DatetimePickerViewInstance,
) => DatetimePickerViewOption[][]
```

## 主题定制

组件继承 PickerView 的样式变量,可通过以下 CSS 变量进行主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-picker-bg | 选择器背景色 | `#ffffff` |
| --wd-picker-column-fs | 选项字体大小 | `32rpx` |
| --wd-picker-column-color | 选项文字颜色 | `#333333` |

## 最佳实践

### 1. 预约时间选择

结合过滤器实现工作时间段选择:

```vue
<template>
  <wd-datetime-picker-view
    v-model="value"
    type="datetime"
    :min-date="minDate"
    :filter="workTimeFilter"
    :formatter="formatter"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const minDate = ref(Date.now())

// 只允许选择工作时间 9:00-18:00
const workTimeFilter = (type: string, values: number[]) => {
  if (type === 'hour') {
    return values.filter((v) => v >= 9 && v <= 18)
  }
  return values
}

const formatter = (type: string, value: string) => {
  const units: Record<string, string> = {
    year: '年',
    month: '月',
    date: '日',
    hour: '时',
    minute: '分',
  }
  return `${value}${units[type] || ''}`
}
</script>
```

### 2. 生日选择器

限制可选日期范围:

```vue
<template>
  <wd-datetime-picker-view
    v-model="birthday"
    type="date"
    :min-date="minDate"
    :max-date="maxDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const birthday = ref(new Date(2000, 0, 1).getTime())
// 限制年龄在 0-120 岁之间
const minDate = ref(new Date(new Date().getFullYear() - 120, 0, 1).getTime())
const maxDate = ref(Date.now())
</script>
```

## 常见问题

### 1. 时间格式说明

- **time 类型**: 值为字符串格式,如 `"09:30"` 或 `"09:30:45"`(启用秒时)
- **其他类型**: 值为时间戳(毫秒),如 `1640000000000`

### 2. 如何获取格式化后的时间字符串?

```typescript
const pickerRef = ref()

// 获取选中项信息
const selects = pickerRef.value?.getSelects()
// selects 为数组,每个元素包含 label 和 value
```

### 3. 日期联动原理

组件内部自动处理年月日的联动:
- 修改年份或月份时,会自动调整天数范围(如2月只有28/29天)
- 当前选中的日期如果超出新范围,会自动修正为最大值
