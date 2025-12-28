---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/calendarView
---

# CalendarView 日历板

## 介绍

CalendarView 日历板是一个功能强大的嵌入式日历组件，提供日期单选、多选、范围选择、周维度、月维度等多种选择模式。与 Calendar 组件不同，CalendarView 不包含弹出层，可以直接嵌入到页面中使用，适用于需要将日历固定显示在页面某个区域的场景，如预约系统、日程管理、酒店入住等业务场景。

组件基于可滚动的日历面板实现，内部采用月份面板（MonthPanel）和年份面板（YearPanel）两种布局，支持多种选择模式和丰富的自定义选项。组件提供了智能的值格式转换功能，支持时间戳、字符串、智能模式三种值格式，可以根据实际业务场景进行高度定制化封装。

**核心特性:**

- **多种选择模式** - 支持 date（日期）、dates（多日期）、datetime（日期时间）、week（周）、month（月份）五种基础选择类型
- **范围选择** - 支持 daterange（日期范围）、datetimerange（日期时间范围）、weekrange（周范围）、monthrange（月份范围）四种范围选择类型
- **灵活的值格式** - 支持 timestamp（时间戳）、string（字符串）、auto（智能模式）三种值格式，自动处理类型转换
- **日期格式化** - 支持通过 formatter 函数自定义日期项的显示文本、顶部信息、底部信息和样式
- **时间过滤** - datetime 和 datetimerange 类型支持 timeFilter 时间过滤器，可限制可选时间范围
- **可滚动面板** - 支持设置面板高度，自动滚动到选中日期，提供流畅的滚动体验
- **周起始日** - 支持自定义周起始日，可设置为周日（0）或周一（1）
- **范围限制** - 支持设置最小/最大日期范围，范围选择时可限制最大选择天数
- **国际化支持** - 内置多语言支持，星期标签和月份标题自动翻译
- **暗色模式** - 完整支持暗色主题，自动适配系统主题

## 基本用法

### 日期选择

默认类型为 `date`，实现单日期选择。用户点击日期即可完成选择，选中的日期会高亮显示。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" />
    <view class="result">
      选中日期: {{ formatDate(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

// 格式化日期显示
const formatDate = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 32rpx;
}

.result {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**

- 默认显示当前月份前后六个月的日历范围
- 点击日期项即可完成选择
- 选中的日期会以主题色高亮显示
- 自动滚动到当前日期或选中日期的位置

### 多日期选择

设置 `type="dates"` 实现多日期选择，可以选择多个不连续的日期。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="dates" />
    <view class="result">
      选中 {{ value.length }} 个日期
      <view v-for="(date, index) in value" :key="index" class="date-item">
        {{ formatDate(date) }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number[]>([])

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 32rpx;
}

.result {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.date-item {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}
</style>
```

**使用说明:**

- 返回值为时间戳数组
- 再次点击已选中的日期可以取消选择
- 选中的日期会以 `multiple-selected` 样式显示
- 适用于需要选择多个特定日期的场景，如请假日期选择

### 日期时间选择

设置 `type="datetime"` 同时选择日期和时间，日历下方会显示时间选择器。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="datetime" />
    <view class="result">
      选中时间: {{ formatDateTime(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

const formatDateTime = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}
</script>
```

**使用说明:**

- 日历面板下方会显示时间选择器（PickerView）
- 时间选择器默认显示时、分、秒三列
- 可通过 `hide-second` 属性隐藏秒选择
- 可通过 `time-filter` 函数过滤时间选项

### 周选择

设置 `type="week"` 实现周选择，点击任意日期会选中整个周。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="week" />
    <view class="result">
      选中周: {{ formatWeek(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

const formatWeek = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  // 计算周数
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${date.getFullYear()}年 第${weekNumber}周`
}
</script>
```

**使用说明:**

- 返回值为选中周的第一天时间戳
- 整周以范围样式高亮显示
- 支持通过 `first-day-of-week` 设置周起始日
- 适用于周报、周计划等按周统计的场景

### 月选择

设置 `type="month"` 实现月份选择，会切换到年份面板视图。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="month" />
    <view class="result">
      选中月份: {{ formatMonth(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

const formatMonth = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}
</script>
```

**使用说明:**

- 使用年份面板（YearPanel）显示
- 返回值为选中月份第一天的时间戳
- 面板按年份分组显示 12 个月份
- 适用于月报、月度统计等场景

### 日期范围选择

设置 `type="daterange"` 实现日期范围选择，需要选择开始日期和结束日期。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="daterange" />
    <view class="result">
      <view>开始日期: {{ formatDate(value[0]) }}</view>
      <view>结束日期: {{ formatDate(value[1]) }}</view>
      <view v-if="value[0] && value[1]">
        共 {{ getDayCount() }} 天
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getDayCount = () => {
  if (!value.value[0] || !value.value[1]) return 0
  return Math.ceil((value.value[1] - value.value[0]) / (24 * 60 * 60 * 1000)) + 1
}
</script>
```

**使用说明:**

- 返回值为包含开始和结束时间戳的数组 `[startDate, endDate]`
- 第一次点击选择开始日期，第二次点击选择结束日期
- 开始日期显示 `start` 样式，结束日期显示 `end` 样式
- 中间日期显示 `middle` 样式
- 如果结束日期早于开始日期，会自动交换

### 日期时间范围选择

设置 `type="datetimerange"` 实现日期时间范围选择。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="datetimerange" />
    <view class="result">
      <view>开始时间: {{ formatDateTime(value[0]) }}</view>
      <view>结束时间: {{ formatDateTime(value[1]) }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])

const formatDateTime = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>
```

**使用说明:**

- 选择日期后会显示时间选择器
- 时间选择器上方会显示"开始时间"或"结束时间"标签
- 选择开始日期后自动切换到选择结束日期
- 结束日期选择完成后显示结束时间选择器

### 周范围选择

设置 `type="weekrange"` 实现周范围选择。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="weekrange" />
    <view class="result">
      <view>开始周: {{ formatWeekDate(value[0]) }}</view>
      <view>结束周: {{ formatWeekDate(value[1]) }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])

const formatWeekDate = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>
```

**使用说明:**

- 返回值为包含开始周第一天和结束周最后一天时间戳的数组
- 点击任意日期会选中该日期所在的整周
- 周范围会以完整的周为单位高亮显示

### 月范围选择

设置 `type="monthrange"` 实现月份范围选择。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" type="monthrange" />
    <view class="result">
      <view>开始月份: {{ formatMonth(value[0]) }}</view>
      <view>结束月份: {{ formatMonth(value[1]) }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])

const formatMonth = (timestamp: number | null) => {
  if (!timestamp) return '未选择'
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}
</script>
```

**使用说明:**

- 使用年份面板（YearPanel）显示
- 返回值为包含开始月份和结束月份第一天时间戳的数组
- 适用于需要选择连续月份范围的场景

## 高级功能

### 日期范围限制

通过 `min-date` 和 `max-date` 设置可选日期范围，超出范围的日期将被禁用。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="date"
      :min-date="minDate"
      :max-date="maxDate"
    />
    <view class="tip">
      可选范围: {{ formatDate(minDate) }} ~ {{ formatDate(maxDate) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

// 设置可选范围为当前月
const now = new Date()
const minDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).getTime())
const maxDate = ref(new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime())

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>
```

**使用说明:**

- `min-date` 和 `max-date` 均为 13 位时间戳
- 默认范围为当前日期前后各 6 个月
- 超出范围的日期会显示为禁用状态（灰色）
- 时间选择器也会根据日期自动限制可选时间范围

### 最大范围限制

通过 `max-range` 限制范围选择的最大天数，超出时会显示提示。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="daterange"
      :max-range="7"
      range-prompt="最多选择7天"
    />
    <view class="tip">
      最多可选择 7 天
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])
</script>
```

**使用说明:**

- `max-range` 指定最大可选天数
- `range-prompt` 自定义超出范围时的提示文案
- 当选择范围超出限制时，会以 Toast 形式显示提示
- 适用于酒店预订等有最大入住天数限制的场景

### 允许同一天

范围选择时，设置 `allow-same-day` 允许选择同一天作为开始和结束日期。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="daterange"
      allow-same-day
    />
    <view class="tip">
      可以选择同一天作为开始和结束
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])
</script>
```

**使用说明:**

- 默认情况下，范围选择不允许开始和结束为同一天
- 设置 `allow-same-day` 后，双击同一天可以完成选择
- 选择同一天时，返回值数组两个元素相同
- 同一天选择时会显示 `same` 样式

### 周起始日

通过 `first-day-of-week` 设置周起始日，0 为周日，1 为周一。

```vue
<template>
  <view class="demo-container">
    <view class="switch-bar">
      <view
        class="switch-item"
        :class="{ active: firstDay === 0 }"
        @click="firstDay = 0"
      >
        周日开始
      </view>
      <view
        class="switch-item"
        :class="{ active: firstDay === 1 }"
        @click="firstDay = 1"
      >
        周一开始
      </view>
    </view>
    <wd-calendar-view
      v-model="value"
      :first-day-of-week="firstDay"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const firstDay = ref(0)
</script>

<style lang="scss" scoped>
.switch-bar {
  display: flex;
  padding: 24rpx;
  gap: 24rpx;
}

.switch-item {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;

  &.active {
    background: var(--wd-color-primary);
    color: #fff;
  }
}
</style>
```

**使用说明:**

- 默认为 0（周日）
- 设置为 1 表示周一为每周第一天
- 影响星期标题的显示顺序
- 影响周选择模式下的周范围计算

### 日期格式化

通过 `formatter` 函数自定义日期项的显示内容，可以设置顶部信息、底部信息、禁用状态等。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      :formatter="formatter"
      :min-date="minDate"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarDayItem } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref(Date.now())
const minDate = ref(Date.now())

// 节假日数据（示例）
const holidays: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '5-1': '劳动节',
  '6-1': '儿童节',
  '10-1': '国庆',
  '12-25': '圣诞',
}

const formatter = (day: CalendarDayItem): CalendarDayItem => {
  const date = new Date(day.date)
  const now = new Date()
  const month = date.getMonth() + 1
  const dayNum = date.getDate()
  const week = date.getDay()

  // 标记今天
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    day.topInfo = '今天'
  }

  // 标记节假日
  const key = `${month}-${dayNum}`
  if (holidays[key]) {
    day.bottomInfo = holidays[key]
  }

  // 标记周末
  if (week === 0 || week === 6) {
    if (!day.bottomInfo) {
      day.bottomInfo = '休'
    }
  }

  return day
}
</script>
```

**formatter 函数参数说明:**

```typescript
interface CalendarDayItem {
  /** 日期时间戳 */
  date: number
  /** 显示文本（日期数字） */
  text?: number | string
  /** 顶部信息（如：今天） */
  topInfo?: string
  /** 底部信息（如：休、班） */
  bottomInfo?: string
  /** 日期类型 */
  type?: CalendarDayType
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为最后一行 */
  isLastRow?: boolean
}
```

**使用说明:**

- `formatter` 函数接收 `CalendarDayItem` 对象，返回修改后的对象
- 可以设置 `topInfo` 显示在日期上方
- 可以设置 `bottomInfo` 显示在日期下方
- 可以设置 `disabled: true` 禁用特定日期
- 可以修改 `text` 自定义日期显示文本

### 默认时间

通过 `default-time` 设置选中日期所使用的时间。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="datetime"
      default-time="09:00:00"
    />
    <view class="tip">
      默认选中 09:00:00
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

范围选择时可以分别设置开始和结束时间:

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="datetimerange"
      :default-time="['09:00:00', '18:00:00']"
    />
    <view class="tip">
      开始默认 09:00，结束默认 18:00
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<(number | null)[]>([])
</script>
```

**使用说明:**

- 格式为 `HH:mm:ss` 字符串
- 单日期时间选择传入字符串
- 范围选择传入字符串数组 `[开始时间, 结束时间]`
- 默认值为 `00:00:00`

### 时间过滤

通过 `time-filter` 函数过滤时间选项，可以禁用特定时间。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="datetime"
      :time-filter="timeFilter"
    />
    <view class="tip">
      只能选择工作时间 9:00-18:00，每 15 分钟一档
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarTimeFilter } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref(Date.now())

// 只允许选择工作时间 9:00-18:00，每 15 分钟一档
const timeFilter: CalendarTimeFilter = (option) => {
  if (option.type === 'hour') {
    // 限制小时范围 9-18
    return option.values.filter(
      (item) => item.value >= 9 && item.value <= 18
    )
  }

  if (option.type === 'minute') {
    // 只允许 0、15、30、45 分钟
    return option.values.filter(
      (item) => item.value % 15 === 0
    )
  }

  if (option.type === 'second') {
    // 只允许 0 秒
    return option.values.filter(
      (item) => item.value === 0
    )
  }

  return option.values
}
</script>
```

**timeFilter 函数参数说明:**

```typescript
interface CalendarTimeFilterOption {
  /** 类型: hour/minute/second */
  type: 'hour' | 'minute' | 'second'
  /** 可选值列表 */
  values: CalendarItem[]
}

interface CalendarItem {
  /** 显示标签 */
  label: string
  /** 值 */
  value: number
  /** 是否禁用 */
  disabled: boolean
}
```

**使用说明:**

- 函数接收当前列的选项数据
- 返回过滤后的选项数组
- 可以根据 `type` 分别过滤时、分、秒
- 适用于预约系统限制可预约时段

### 隐藏秒选择

设置 `hide-second` 隐藏秒选择，只显示时、分两列。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="datetime"
      hide-second
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

**使用说明:**

- 时间选择器只显示时、分两列
- 秒数会自动设置为 0
- 字符串格式默认变为 `YYYY-MM-DD HH:mm`

### 字符串值格式

设置 `value-format="string"` 使用字符串格式的值，方便与后端接口对接。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view
      v-model="value"
      type="date"
      value-format="string"
      string-format="YYYY-MM-DD"
    />
    <view class="result">
      值类型: {{ typeof value }}
      <view>值: {{ value }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('2024-06-15')
</script>
```

**value-format 可选值:**

| 值 | 说明 |
|---|---|
| `timestamp` | 时间戳模式（默认），返回 13 位毫秒时间戳 |
| `string` | 字符串模式，返回格式化的日期字符串 |
| `auto` | 智能模式，自动识别输入类型并保持一致 |

**string-format 默认值:**

| 日历类型 | 默认格式 |
|---------|---------|
| date/daterange/dates/week/weekrange/month/monthrange | `YYYY-MM-DD` |
| datetime/datetimerange | `YYYY-MM-DD HH:mm:ss` |
| datetime/datetimerange (hide-second) | `YYYY-MM-DD HH:mm` |

**使用说明:**

- 使用 dayjs 进行格式化，支持所有 dayjs 格式
- 范围选择返回字符串数组
- auto 模式会根据输入值类型自动选择输出格式

### 自定义面板高度

通过 `panel-height` 设置可滚动面板的高度。

```vue
<template>
  <view class="demo-container">
    <wd-calendar-view v-model="value" :panel-height="500" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

**使用说明:**

- 单位为 rpx
- 默认值为 756rpx
- datetime 类型会自动减去时间选择器高度（250rpx）
- 建议根据页面布局调整合适的高度

### 显示面板标题

通过 `show-panel-title` 控制是否显示滚动面板的月份标题。

```vue
<template>
  <view class="demo-container">
    <view class="switch-bar">
      <wd-switch v-model="showTitle" />
      <text>显示面板标题</text>
    </view>
    <wd-calendar-view
      v-model="value"
      :show-panel-title="showTitle"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const showTitle = ref(true)
</script>
```

**使用说明:**

- 默认为 true
- 面板标题会随滚动自动更新当前月份
- 关闭后可以减少面板高度占用

### 滚动到选中日期

通过 ref 调用 `scrollIntoView` 方法使选中日期滚动到可视区域。

```vue
<template>
  <view class="demo-container">
    <wd-button @click="scrollToDate">滚动到选中日期</wd-button>
    <wd-calendar-view ref="calendarRef" v-model="value" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const calendarRef = ref()

const scrollToDate = () => {
  calendarRef.value?.scrollIntoView()
}
</script>
```

**使用说明:**

- 组件挂载后会自动滚动到当前日期或选中日期
- 手动调用可以在值变化后重新定位
- 范围选择会尝试将整个范围居中显示

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中值，支持时间戳或字符串 | `CalendarValue` | - |
| type | 日历类型 | `CalendarType` | `date` |
| min-date | 最小日期，13位时间戳格式 | `number` | 六个月前 |
| max-date | 最大日期，13位时间戳格式 | `number` | 六个月后 |
| first-day-of-week | 周起始天，0为周日，1为周一 | `number` | `0` |
| formatter | 日期格式化函数 | `CalendarFormatter` | - |
| max-range | 范围选择时的最大日期范围（天数） | `number` | - |
| range-prompt | 超出最大范围的提示文案 | `string` | - |
| allow-same-day | 范围选择时是否允许选择同一天 | `boolean` | `false` |
| show-panel-title | 是否展示面板标题 | `boolean` | `true` |
| default-time | 选中日期所使用的时间 | `string \| string[]` | `00:00:00` |
| panel-height | 可滚动面板的高度，单位rpx | `number` | `756` |
| time-filter | 时间过滤器函数 | `CalendarTimeFilter` | - |
| hide-second | 是否隐藏秒选择 | `boolean` | `false` |
| immediate-change | 是否在手指松开时立即触发change | `boolean` | `false` |
| value-format | 值格式模式 | `'timestamp' \| 'string' \| 'auto'` | `timestamp` |
| string-format | 字符串格式（value-format为string时生效） | `string` | 根据类型自动选择 |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值变化时触发 | `{ value: CalendarValue }` |
| pickstart | 开始选择时间时触发（datetime类型） | - |
| pickend | 结束选择时间时触发（datetime类型） | - |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| scrollIntoView | 使选中日期滚动到可视区域 | - | - |

### 类型定义

```typescript
/**
 * 日历类型
 * - date: 日期选择
 * - dates: 多日期选择
 * - datetime: 日期时间选择
 * - week: 周选择
 * - month: 月份选择
 * - daterange: 日期范围选择
 * - datetimerange: 日期时间范围选择
 * - weekrange: 周范围选择
 * - monthrange: 月份范围选择
 */
export type CalendarType =
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
 * 日历项类型
 * - '': 普通日期
 * - start: 范围开始
 * - middle: 范围中间
 * - end: 范围结束
 * - selected: 选中（单选）
 * - same: 同一天（范围选择开始结束同一天）
 * - current: 今天
 * - multiple-middle: 多选中间
 * - multiple-selected: 多选选中
 */
export type CalendarDayType =
  | ''
  | 'start'
  | 'middle'
  | 'end'
  | 'selected'
  | 'same'
  | 'current'
  | 'multiple-middle'
  | 'multiple-selected'

/**
 * 日历值类型（支持时间戳或字符串）
 */
export type CalendarValue = number | number[] | string | string[] | null

/**
 * 值格式模式
 * - timestamp: 时间戳模式（默认）
 * - string: 字符串模式
 * - auto: 智能模式（自动识别）
 */
export type CalendarValueFormat = 'timestamp' | 'string' | 'auto'

/**
 * 日历项数据结构
 */
export interface CalendarDayItem {
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
  /** 是否为最后一行 */
  isLastRow?: boolean
}

/**
 * 日期格式化函数类型
 */
export type CalendarFormatter = (day: CalendarDayItem) => CalendarDayItem

/**
 * 日历项接口（时间选择器选项）
 */
export interface CalendarItem {
  /** 显示标签 */
  label: string
  /** 值 */
  value: number
  /** 是否禁用 */
  disabled: boolean
}

/**
 * 时间过滤器选项
 */
interface CalendarTimeFilterOption {
  /** 类型: hour/minute/second */
  type: 'hour' | 'minute' | 'second'
  /** 值列表 */
  values: CalendarItem[]
}

/**
 * 时间过滤器函数类型
 */
export type CalendarTimeFilter = (option: CalendarTimeFilterOption) => CalendarItem[]

/**
 * 日历视图组件实例类型
 */
export type CalendarViewInstance = ComponentPublicInstance<
  WdCalendarViewProps,
  WdCalendarViewExpose
>
```

## 主题定制

组件提供了丰富的 CSS 变量用于主题定制，可通过修改这些变量实现个性化样式。

### CSS 变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-calendar-bg | 日历背景色 | `#ffffff` |
| --wd-calendar-fs | 日历字体大小 | `28rpx` |
| --wd-calendar-week-height | 星期标题高度 | `60rpx` |
| --wd-calendar-week-color | 星期标题颜色 | `rgba(0, 0, 0, 0.45)` |
| --wd-calendar-week-fs | 星期标题字体大小 | `24rpx` |
| --wd-calendar-panel-padding | 面板内边距 | `0 32rpx` |
| --wd-calendar-panel-title-fs | 面板标题字体大小 | `32rpx` |
| --wd-calendar-panel-title-color | 面板标题颜色 | `rgba(0, 0, 0, 0.85)` |
| --wd-calendar-item-height | 日期项高度 | `128rpx` |
| --wd-calendar-item-font-size | 日期字体大小 | `28rpx` |
| --wd-calendar-item-color | 日期文字颜色 | `rgba(0, 0, 0, 0.85)` |
| --wd-calendar-item-disabled-color | 禁用日期颜色 | `rgba(0, 0, 0, 0.25)` |
| --wd-calendar-item-selected-color | 选中日期文字颜色 | `#ffffff` |
| --wd-calendar-item-selected-bg | 选中日期背景色 | `var(--wd-color-primary)` |
| --wd-calendar-item-range-color | 范围中间日期文字颜色 | `var(--wd-color-primary)` |
| --wd-calendar-item-range-bg | 范围中间日期背景色 | `rgba(var(--wd-color-primary-rgb), 0.1)` |
| --wd-calendar-month-title-fs | 月份标题字体大小 | `28rpx` |
| --wd-calendar-month-title-color | 月份标题颜色 | `rgba(0, 0, 0, 0.85)` |

### 自定义主题示例

```vue
<template>
  <view class="custom-calendar">
    <wd-calendar-view v-model="value" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>

<style lang="scss" scoped>
.custom-calendar {
  // 自定义主题色
  --wd-color-primary: #ff6b6b;
  --wd-color-primary-rgb: 255, 107, 107;

  // 自定义日历样式
  --wd-calendar-bg: #fafafa;
  --wd-calendar-item-height: 100rpx;
  --wd-calendar-item-selected-bg: linear-gradient(135deg, #ff6b6b, #ffa500);
  --wd-calendar-item-range-bg: rgba(255, 107, 107, 0.15);

  // 自定义星期标题
  --wd-calendar-week-color: #ff6b6b;
  --wd-calendar-week-height: 80rpx;
}
</style>
```

### 暗色模式

组件内置暗色模式支持，在 `.wot-theme-dark` 类下会自动应用暗色主题样式:

```scss
.wot-theme-dark {
  .wd-month-panel {
    &__title {
      color: $-dark-color;
    }

    &__weeks {
      box-shadow: 0 8rpx 16rpx 0 rgba(255, 255, 255, 0.02);
      color: $-dark-color;
    }

    &__time-label {
      color: $-dark-color;

      &::after {
        background: $-dark-background4;
      }
    }
  }

  .wd-year-panel {
    &__title {
      color: $-dark-color;
      box-shadow: 0px 4px 8px 0 rgba(255, 255, 255, 0.02);
    }
  }
}
```

## 最佳实践

### 1. 预约日期选择

结合格式化函数实现预约系统，标记可预约日期和已约满日期。

```vue
<template>
  <view class="booking-calendar">
    <view class="legend">
      <view class="legend-item">
        <view class="dot available"></view>
        <text>可预约</text>
      </view>
      <view class="legend-item">
        <view class="dot full"></view>
        <text>已约满</text>
      </view>
    </view>
    <wd-calendar-view
      v-model="value"
      :formatter="formatter"
      :min-date="minDate"
    />
    <view v-if="value" class="booking-info">
      <text>已选择: {{ formatDate(value) }}</text>
      <wd-button type="primary" size="small" @click="confirmBooking">
        确认预约
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarDayItem } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref<number | null>(null)
const minDate = ref(Date.now())

// 模拟可预约日期数据（实际应从后端获取）
const availableDates = new Set([1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29])
const fullDates = new Set([2, 9, 16, 23, 30])

const formatter = (day: CalendarDayItem): CalendarDayItem => {
  const date = new Date(day.date)
  const dayNum = date.getDate()

  // 过去的日期禁用
  if (day.date < Date.now()) {
    day.disabled = true
    return day
  }

  if (availableDates.has(dayNum)) {
    day.bottomInfo = '可约'
  } else if (fullDates.has(dayNum)) {
    day.bottomInfo = '约满'
    day.disabled = true
  } else {
    day.disabled = true
  }

  return day
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const confirmBooking = () => {
  if (value.value) {
    uni.showToast({ title: '预约成功', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.booking-calendar {
  padding: 32rpx;
}

.legend {
  display: flex;
  gap: 32rpx;
  margin-bottom: 24rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;

  &.available {
    background: var(--wd-color-success);
  }

  &.full {
    background: var(--wd-color-danger);
  }
}

.booking-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}
</style>
```

### 2. 酒店入住日期选择

实现酒店预订场景的入住/离店日期选择。

```vue
<template>
  <view class="hotel-booking">
    <view class="date-display">
      <view class="date-item">
        <text class="label">入住</text>
        <text class="date">{{ formatCheckIn }}</text>
      </view>
      <view class="nights">
        <text v-if="nights > 0">{{ nights }}晚</text>
      </view>
      <view class="date-item">
        <text class="label">离店</text>
        <text class="date">{{ formatCheckOut }}</text>
      </view>
    </view>
    <wd-calendar-view
      v-model="value"
      type="daterange"
      :formatter="formatter"
      :min-date="minDate"
      :max-range="30"
      range-prompt="最多预订30晚"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { CalendarDayItem } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref<(number | null)[]>([])
const minDate = ref(Date.now())

// 模拟房间价格数据
const priceMap: Record<number, number> = {}
for (let i = 1; i <= 31; i++) {
  // 周末价格较高
  const day = new Date(2024, new Date().getMonth(), i).getDay()
  priceMap[i] = day === 0 || day === 6 ? 588 : 388
}

const formatter = (day: CalendarDayItem): CalendarDayItem => {
  const date = new Date(day.date)
  const dayNum = date.getDate()

  // 显示价格
  if (day.date >= Date.now()) {
    const price = priceMap[dayNum] || 388
    day.bottomInfo = `¥${price}`
  }

  // 标记入住和离店
  if (day.type === 'start') {
    day.bottomInfo = '入住'
  } else if (day.type === 'end') {
    day.bottomInfo = '离店'
  }

  return day
}

const formatCheckIn = computed(() => {
  if (!value.value[0]) return '请选择'
  const date = new Date(value.value[0])
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

const formatCheckOut = computed(() => {
  if (!value.value[1]) return '请选择'
  const date = new Date(value.value[1])
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

const nights = computed(() => {
  if (!value.value[0] || !value.value[1]) return 0
  return Math.ceil((value.value[1] - value.value[0]) / (24 * 60 * 60 * 1000))
})
</script>

<style lang="scss" scoped>
.hotel-booking {
  padding: 32rpx;
}

.date-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  color: #fff;
}

.date-item {
  text-align: center;

  .label {
    font-size: 24rpx;
    opacity: 0.8;
  }

  .date {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 8rpx;
  }
}

.nights {
  font-size: 28rpx;
  padding: 8rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
}
</style>
```

### 3. 会议室预约（时间段选择）

实现带时间选择的会议室预约功能。

```vue
<template>
  <view class="meeting-booking">
    <view class="room-info">
      <text class="room-name">会议室 A</text>
      <text class="room-capacity">可容纳 10 人</text>
    </view>
    <wd-calendar-view
      v-model="value"
      type="datetime"
      :time-filter="timeFilter"
      :min-date="minDate"
      default-time="09:00:00"
      hide-second
    />
    <view v-if="value" class="booking-summary">
      <text>预约时间: {{ formatDateTime(value) }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarTimeFilter } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref<number | null>(null)
const minDate = ref(Date.now())

// 只允许工作时间预约
const timeFilter: CalendarTimeFilter = (option) => {
  if (option.type === 'hour') {
    return option.values.filter(
      (item) => item.value >= 9 && item.value <= 18
    )
  }

  if (option.type === 'minute') {
    // 每 30 分钟一个时段
    return option.values.filter(
      (item) => item.value === 0 || item.value === 30
    )
  }

  return option.values
}

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.meeting-booking {
  padding: 32rpx;
}

.room-info {
  padding: 24rpx;
  background: #f0f9ff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;

  .room-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #1890ff;
  }

  .room-capacity {
    display: block;
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
  }
}

.booking-summary {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>
```

### 4. 打卡日历

实现考勤打卡日历，显示打卡状态。

```vue
<template>
  <view class="attendance-calendar">
    <view class="stats">
      <view class="stat-item">
        <text class="value">{{ normalDays }}</text>
        <text class="label">正常</text>
      </view>
      <view class="stat-item late">
        <text class="value">{{ lateDays }}</text>
        <text class="label">迟到</text>
      </view>
      <view class="stat-item absent">
        <text class="value">{{ absentDays }}</text>
        <text class="label">缺勤</text>
      </view>
    </view>
    <wd-calendar-view
      v-model="selectedDate"
      :formatter="formatter"
      :min-date="minDate"
      :max-date="maxDate"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { CalendarDayItem } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const selectedDate = ref(Date.now())

// 当月范围
const now = new Date()
const minDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).getTime())
const maxDate = ref(new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime())

// 模拟打卡记录
const attendanceData: Record<number, 'normal' | 'late' | 'absent'> = {
  1: 'normal', 2: 'normal', 3: 'late', 4: 'normal', 5: 'normal',
  8: 'normal', 9: 'normal', 10: 'absent', 11: 'normal', 12: 'normal',
  15: 'normal', 16: 'late', 17: 'normal', 18: 'normal', 19: 'normal',
}

const normalDays = computed(() =>
  Object.values(attendanceData).filter(v => v === 'normal').length
)
const lateDays = computed(() =>
  Object.values(attendanceData).filter(v => v === 'late').length
)
const absentDays = computed(() =>
  Object.values(attendanceData).filter(v => v === 'absent').length
)

const formatter = (day: CalendarDayItem): CalendarDayItem => {
  const date = new Date(day.date)
  const dayNum = date.getDate()
  const week = date.getDay()

  // 周末不显示打卡状态
  if (week === 0 || week === 6) {
    day.bottomInfo = '休'
    return day
  }

  // 未来日期不显示
  if (day.date > Date.now()) {
    return day
  }

  const status = attendanceData[dayNum]
  if (status === 'normal') {
    day.bottomInfo = '✓'
  } else if (status === 'late') {
    day.bottomInfo = '迟'
  } else if (status === 'absent') {
    day.bottomInfo = '✗'
  }

  return day
}
</script>

<style lang="scss" scoped>
.attendance-calendar {
  padding: 32rpx;
}

.stats {
  display: flex;
  justify-content: space-around;
  padding: 32rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  text-align: center;

  .value {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: var(--wd-color-success);
  }

  .label {
    font-size: 24rpx;
    color: #666;
  }

  &.late .value {
    color: var(--wd-color-warning);
  }

  &.absent .value {
    color: var(--wd-color-danger);
  }
}
</style>
```

### 5. 与后端接口对接

使用字符串格式与后端 API 对接。

```vue
<template>
  <view class="api-demo">
    <wd-calendar-view
      v-model="dateValue"
      type="daterange"
      value-format="string"
      string-format="YYYY-MM-DD"
      @change="handleChange"
    />
    <view class="api-info">
      <text>请求参数:</text>
      <view class="code">
        {{ JSON.stringify(requestParams, null, 2) }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const dateValue = ref<string[]>(['2024-06-01', '2024-06-15'])

const requestParams = computed(() => ({
  startDate: dateValue.value[0] || '',
  endDate: dateValue.value[1] || '',
}))

const handleChange = async ({ value }: { value: string[] }) => {
  console.log('日期变化:', value)

  // 模拟 API 请求
  if (value[0] && value[1]) {
    try {
      // const res = await api.getDataByDateRange({
      //   startDate: value[0],
      //   endDate: value[1],
      // })
      console.log('请求参数:', requestParams.value)
    } catch (error) {
      console.error('请求失败:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.api-demo {
  padding: 32rpx;
}

.api-info {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.code {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #282c34;
  color: #abb2bf;
  border-radius: 8rpx;
  font-family: monospace;
  font-size: 24rpx;
  white-space: pre;
}
</style>
```

## 常见问题

### 1. 如何获取格式化后的日期字符串?

**问题原因:**
- 默认返回的是 13 位时间戳
- 需要与后端接口对接时通常需要字符串格式

**解决方案:**

使用 `value-format="string"` 配合 `string-format` 属性:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    value-format="string"
    string-format="YYYY-MM-DD"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 现在 value 是字符串类型
const value = ref('2024-06-15')
</script>
```

或者使用 `auto` 模式自动识别:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    value-format="auto"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 输入字符串，输出也是字符串
const value = ref('2024-06-15')
</script>
```

### 2. 如何禁用特定日期?

**问题原因:**
- 某些日期不可选（如已预约、节假日等）
- 需要根据业务逻辑动态禁用

**解决方案:**

通过 `formatter` 函数设置 `disabled` 属性:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    :formatter="formatter"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarDayItem } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref(Date.now())

// 禁用周末
const formatter = (day: CalendarDayItem): CalendarDayItem => {
  const date = new Date(day.date)
  const week = date.getDay()

  if (week === 0 || week === 6) {
    day.disabled = true
  }

  return day
}
</script>
```

### 3. 月/周选择的值格式是什么?

**问题原因:**
- 月选择和周选择返回的不是具体日期
- 需要了解返回值的具体含义

**解决方案:**

- **月选择**: 返回该月第一天 00:00:00 的时间戳
- **周选择**: 返回该周第一天 00:00:00 的时间戳（根据 `first-day-of-week` 设置）
- **范围选择**: 返回包含开始和结束时间戳的数组 `[start, end]`

```typescript
// 月选择
const monthValue = ref(Date.now())
// 选择 2024年6月 → 返回 1717171200000 (2024-06-01 00:00:00)

// 周选择
const weekValue = ref(Date.now())
// 选择某一周 → 返回该周第一天的时间戳

// 月范围选择
const monthRangeValue = ref<number[]>([])
// 选择 2024年6月 ~ 2024年8月 → 返回 [1717171200000, 1722441600000]
```

### 4. 日历滚动卡顿怎么办?

**问题原因:**
- 日期范围过大导致渲染节点过多
- 复杂的 formatter 函数影响性能

**解决方案:**

1. 限制日期范围:

```vue
<template>
  <wd-calendar-view
    v-model="value"
    :min-date="minDate"
    :max-date="maxDate"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
// 只显示前后 3 个月
const now = new Date()
const minDate = ref(new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime())
const maxDate = ref(new Date(now.getFullYear(), now.getMonth() + 3, 0).getTime())
</script>
```

2. 优化 formatter 函数:

```typescript
// ❌ 不推荐：在 formatter 中进行复杂计算
const formatter = (day: CalendarDayItem): CalendarDayItem => {
  // 每次渲染都会执行，影响性能
  const result = heavyCalculation(day.date)
  day.bottomInfo = result
  return day
}

// ✅ 推荐：预先计算好数据
const preCalculatedData = ref<Map<number, string>>(new Map())

onMounted(() => {
  // 组件挂载时一次性计算
  calculateData()
})

const formatter = (day: CalendarDayItem): CalendarDayItem => {
  // 直接从缓存读取
  day.bottomInfo = preCalculatedData.value.get(day.date)
  return day
}
```

### 5. 如何实现日期联动?

**问题原因:**
- 结束日期不能早于开始日期
- 需要根据开始日期动态限制结束日期

**解决方案:**

监听值变化并动态调整:

```vue
<template>
  <view class="date-range">
    <view class="date-picker">
      <text>开始日期</text>
      <wd-calendar-view
        v-model="startDate"
        :max-date="endDate || maxDate"
        @change="onStartChange"
      />
    </view>
    <view class="date-picker">
      <text>结束日期</text>
      <wd-calendar-view
        v-model="endDate"
        :min-date="startDate || minDate"
        @change="onEndChange"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const startDate = ref<number | null>(null)
const endDate = ref<number | null>(null)

const now = new Date()
const minDate = ref(now.getTime())
const maxDate = ref(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).getTime())

const onStartChange = ({ value }: { value: number }) => {
  // 如果开始日期晚于结束日期，清空结束日期
  if (endDate.value && value > endDate.value) {
    endDate.value = null
  }
}

const onEndChange = ({ value }: { value: number }) => {
  // 如果结束日期早于开始日期，清空开始日期
  if (startDate.value && value < startDate.value) {
    startDate.value = null
  }
}
</script>
```

### 6. 时间选择器不显示?

**问题原因:**
- 只有 `datetime` 和 `datetimerange` 类型才会显示时间选择器
- 需要先选择日期才会显示时间选择器

**解决方案:**

确保使用正确的类型:

```vue
<template>
  <!-- ✅ 正确：使用 datetime 类型 -->
  <wd-calendar-view v-model="value" type="datetime" />

  <!-- ❌ 错误：date 类型不会显示时间选择器 -->
  <wd-calendar-view v-model="value" type="date" />
</template>
```

对于 `datetimerange` 类型，需要先选择日期:

```vue
<template>
  <wd-calendar-view v-model="value" type="datetimerange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 点击第一个日期后会显示"开始时间"选择器
// 点击第二个日期后会显示"结束时间"选择器
const value = ref<(number | null)[]>([])
</script>
```

### 7. 如何获取组件实例调用方法?

**问题原因:**
- 需要手动调用 `scrollIntoView` 等方法
- 需要获取组件内部状态

**解决方案:**

使用 `ref` 获取组件实例:

```vue
<template>
  <wd-button @click="scrollToToday">滚动到今天</wd-button>
  <wd-calendar-view ref="calendarRef" v-model="value" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CalendarViewInstance } from '@/wd/components/wd-calendar-view/wd-calendar-view.vue'

const value = ref(Date.now())
const calendarRef = ref<CalendarViewInstance>()

const scrollToToday = () => {
  // 先设置值为今天
  value.value = Date.now()
  // 然后滚动到可视区域
  calendarRef.value?.scrollIntoView()
}
</script>
```
