---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/calendarView
---

# CalendarView 日历板

## 介绍

CalendarView 日历板是一个嵌入式日历组件,提供日期单选、多选、范围选择、周维度、月维度等功能。与 Calendar 组件不同,CalendarView 不包含弹出层,可以直接嵌入到页面中使用,适用于需要将日历固定显示在页面某个区域的场景。

组件基于可滚动的日历面板实现,支持多种选择模式和丰富的自定义选项,可以根据实际业务场景进行高度定制化封装。

**核心特性:**

- **多种选择模式** - 支持 date/dates/datetime/week/month 等多种选择类型
- **范围选择** - 支持 daterange/datetimerange/weekrange/monthrange 范围选择
- **灵活的值格式** - 支持时间戳、字符串、智能模式三种值格式
- **日期格式化** - 支持自定义日期项的显示文本和样式
- **时间过滤** - datetime 类型支持时间过滤器
- **可滚动面板** - 支持设置面板高度和自动滚动到选中日期

## 基本用法

### 日期选择

默认类型为 `date`,实现单日期选择。

```vue
<template>
  <wd-calendar-view v-model="value" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 多日期选择

设置 `type="dates"` 实现多日期选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="dates" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 日期时间选择

设置 `type="datetime"` 同时选择日期和时间。

```vue
<template>
  <wd-calendar-view v-model="value" type="datetime" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 周选择

设置 `type="week"` 实现周选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="week" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 月选择

设置 `type="month"` 实现月份选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="month" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 日期范围选择

设置 `type="daterange"` 实现日期范围选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="daterange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 日期时间范围选择

设置 `type="datetimerange"` 实现日期时间范围选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="datetimerange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 周范围选择

设置 `type="weekrange"` 实现周范围选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="weekrange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 月范围选择

设置 `type="monthrange"` 实现月份范围选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="monthrange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 日期范围限制

通过 `min-date` 和 `max-date` 设置可选日期范围。

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="date"
    :min-date="minDate"
    :max-date="maxDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const minDate = ref(new Date(2024, 0, 1).getTime())
const maxDate = ref(new Date(2024, 11, 31).getTime())
</script>
```

### 最大范围限制

通过 `max-range` 限制范围选择的最大天数。

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="daterange"
    :max-range="7"
    range-prompt="最多选择7天"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 允许同一天

范围选择时,设置 `allow-same-day` 允许选择同一天。

```vue
<template>
  <wd-calendar-view v-model="value" type="daterange" allow-same-day />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 周起始日

通过 `first-day-of-week` 设置周起始日,0 为周日,1 为周一。

```vue
<template>
  <wd-calendar-view v-model="value" :first-day-of-week="1" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 日期格式化

通过 `formatter` 函数自定义日期项的显示内容。

```vue
<template>
  <wd-calendar-view v-model="value" :formatter="formatter" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarDayItem } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref(Date.now())

const formatter = (day: CalendarDayItem): CalendarDayItem => {
  const date = new Date(day.date)
  const now = new Date()

  // 标记今天
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    day.topInfo = '今天'
  }

  // 标记周末
  const week = date.getDay()
  if (week === 0 || week === 6) {
    day.bottomInfo = '休'
  }

  return day
}
</script>
```

### 默认时间

通过 `default-time` 设置选中日期所使用的时间。

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="datetime"
    default-time="09:00:00"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

范围选择时可以分别设置开始和结束时间:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="datetimerange"
    :default-time="['09:00:00', '18:00:00']"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
</script>
```

### 时间过滤

通过 `time-filter` 函数过滤时间选项。

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="datetime"
    :time-filter="timeFilter"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarTimeFilter } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref(Date.now())

// 只允许选择工作时间 9:00-18:00
const timeFilter: CalendarTimeFilter = (option) => {
  if (option.type === 'hour') {
    return option.values.filter(
      (item) => item.value >= 9 && item.value <= 18
    )
  }
  return option.values
}
</script>
```

### 隐藏秒选择

设置 `hide-second` 隐藏秒选择。

```vue
<template>
  <wd-calendar-view v-model="value" type="datetime" hide-second />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 字符串值格式

设置 `value-format="string"` 使用字符串格式的值。

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="date"
    value-format="string"
    string-format="YYYY-MM-DD"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('2024-06-15')
</script>
```

### 自定义面板高度

通过 `panel-height` 设置可滚动面板的高度。

```vue
<template>
  <wd-calendar-view v-model="value" :panel-height="500" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中值 | `CalendarValue` | - |
| type | 日历类型 | `CalendarType` | `date` |
| min-date | 最小日期,时间戳格式 | `number` | 六个月前 |
| max-date | 最大日期,时间戳格式 | `number` | 六个月后 |
| first-day-of-week | 周起始天,0为周日,1为周一 | `number` | `0` |
| formatter | 日期格式化函数 | `CalendarFormatter` | - |
| max-range | 范围选择时的最大日期范围 | `number` | - |
| range-prompt | 超出最大范围的提示文案 | `string` | - |
| allow-same-day | 范围选择时是否允许选择同一天 | `boolean` | `false` |
| show-panel-title | 是否展示面板标题 | `boolean` | `true` |
| default-time | 选中日期所使用的时间 | `string \| string[]` | `00:00:00` |
| panel-height | 可滚动面板的高度,单位rpx | `number` | `756` |
| time-filter | 时间过滤器函数 | `CalendarTimeFilter` | - |
| hide-second | 是否隐藏秒选择 | `boolean` | `false` |
| immediate-change | 是否在手指松开时立即触发change | `boolean` | `false` |
| value-format | 值格式模式 | `'timestamp' \| 'string' \| 'auto'` | `timestamp` |
| string-format | 字符串格式 | `string` | 根据类型自动选择 |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值变化时触发 | `{ value: CalendarValue }` |
| pickstart | 开始选择时间时触发 | - |
| pickend | 结束选择时间时触发 | - |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| scrollIntoView | 使选中日期滚动到可视区域 | - | - |

### 类型定义

```typescript
/**
 * 日历类型
 */
type CalendarType =
  | 'date'
  | 'dates'
  | 'datetime'
  | 'week'
  | 'month'
  | 'daterange'
  | 'datetimerange'
  | 'weekrange'
  | 'monthrange'

/**
 * 日历值类型
 */
type CalendarValue = number | number[] | string | string[] | null

/**
 * 日历项数据结构
 */
interface CalendarDayItem {
  /** 日期时间戳 */
  date: number
  /** 显示文本 */
  text?: number | string
  /** 顶部信息 */
  topInfo?: string
  /** 底部信息 */
  bottomInfo?: string
  /** 日期类型 */
  type?: CalendarDayType
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 日期格式化函数类型
 */
type CalendarFormatter = (day: CalendarDayItem) => CalendarDayItem

/**
 * 时间过滤器函数类型
 */
type CalendarTimeFilter = (option: CalendarTimeFilterOption) => CalendarItem[]

/**
 * 时间过滤器选项
 */
interface CalendarTimeFilterOption {
  type: 'hour' | 'minute' | 'second'
  values: CalendarItem[]
}

/**
 * 日历项接口
 */
interface CalendarItem {
  label: string
  value: number
  disabled: boolean
}
```

## 主题定制

组件样式继承自 Calendar 组件,可通过以下 CSS 变量进行主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-calendar-bg | 日历背景色 | `#ffffff` |
| --wd-calendar-item-height | 日期项高度 | `128rpx` |
| --wd-calendar-item-font-size | 日期字体大小 | `28rpx` |
| --wd-calendar-item-color | 日期文字颜色 | `#333333` |
| --wd-calendar-item-selected-color | 选中日期文字颜色 | `#ffffff` |
| --wd-calendar-item-selected-bg | 选中日期背景色 | `var(--wd-color-primary)` |

## 最佳实践

### 1. 预约日期选择

结合格式化函数标记可预约日期:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    :formatter="formatter"
    :min-date="minDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const minDate = ref(Date.now())

// 可预约的日期(示例)
const availableDates = [1, 3, 5, 8, 10, 15, 20, 25]

const formatter = (day: any) => {
  const date = new Date(day.date)
  const dayNum = date.getDate()

  if (availableDates.includes(dayNum)) {
    day.bottomInfo = '可约'
  } else {
    day.disabled = true
  }

  return day
}
</script>
```

### 2. 酒店入住日期

实现入住/离店日期选择:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    type="daterange"
    :formatter="formatter"
    :min-date="minDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])
const minDate = ref(Date.now())

const formatter = (day: any) => {
  if (day.type === 'start') {
    day.bottomInfo = '入住'
  } else if (day.type === 'end') {
    day.bottomInfo = '离店'
  }
  return day
}
</script>
```

## 常见问题

### 1. 如何获取格式化后的日期字符串?

使用 `value-format="string"` 配合 `string-format` 属性:

```vue
<wd-calendar-view
  v-model="value"
  value-format="string"
  string-format="YYYY年MM月DD日"
/>
```

### 2. 如何禁用特定日期?

通过 `formatter` 函数设置 `disabled` 属性:

```typescript
const formatter = (day) => {
  const date = new Date(day.date)
  // 禁用周末
  if (date.getDay() === 0 || date.getDay() === 6) {
    day.disabled = true
  }
  return day
}
```

### 3. 月/周选择的值格式是什么?

- 月选择: 返回该月第一天的时间戳
- 周选择: 返回该周第一天的时间戳
- 范围选择: 返回包含开始和结束时间戳的数组
