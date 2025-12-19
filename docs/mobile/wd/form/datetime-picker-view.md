---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/datetimePickerView
---

# DatetimePickerView 日期时间选择器视图

## 介绍

`DatetimePickerView` 日期时间选择器视图是 PickerView 组件的封装,在其内部构建好日期时间选项,提供了嵌入式的日期时间选择功能。与 DatetimePicker 组件不同,DatetimePickerView 不包含弹出层,可以直接嵌入到页面中使用,适合需要固定展示日期选择器的场景。

组件基于 `wdPickerView` 底层实现,内部通过 `getOriginColumns`、`updateColumns` 等方法动态生成日期时间选项。组件支持五种选择类型(year/year-month/date/time/datetime),并提供了完整的列联动计算逻辑,确保年月日之间的数据一致性。

**核心特性:**

- **嵌入式设计** - 直接嵌入页面,无需弹出层,适合固定展示场景
- **多种类型** - 支持 date、year-month、time、datetime、year 五种选择类型
- **智能联动** - 内置 `columnChange` 函数实现列间联动,月份变化自动调整天数
- **范围限制** - 支持设置最小/最大日期(默认前后各10年)及时/分/秒范围
- **自定义格式** - 通过 filter 过滤选项、formatter 格式化显示文本
- **秒级选择** - time 和 datetime 类型支持 `useSecond` 启用秒选择
- **防抖更新** - 使用 debounce 防抖处理 props 变化,避免频繁计算
- **加载状态** - 内置 loading 状态展示,支持自定义加载颜色

**技术实现要点:**

- 使用 `getBoundary` 函数计算最小/最大边界值
- 通过 `getRanges` 函数根据类型生成各列的数值范围
- 使用 `getMonthEndDay` 函数准确计算每月天数(考虑闰年)
- 通过 `correctValue` 函数确保输入值在有效范围内
- 列联动通过 `columnChange` 回调实现,动态更新后续列的数据

## 平台兼容性

| 平台 | 支持情况 | 特殊说明 |
|------|----------|----------|
| 微信小程序 | ✅ 完全支持 | - |
| 支付宝小程序 | ✅ 完全支持 | - |
| H5 | ✅ 完全支持 | - |
| App (iOS) | ✅ 完全支持 | - |
| App (Android) | ✅ 完全支持 | - |
| 抖音小程序 | ✅ 完全支持 | - |

## 基本用法

### 日期选择

默认类型为 `datetime`,可通过 `type` 属性设置为 `date` 实现纯日期选择。日期类型的值为时间戳(毫秒)。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view v-model="value" type="date" />
    <view class="result">
      选中日期: {{ formatDate(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
</script>

<style lang="scss" scoped>
.result {
  padding: 24rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**

- `type="date"` 只显示年、月、日三列
- 值为时间戳格式(毫秒),可使用 `Date.now()` 获取当前时间
- 默认日期范围为当前年份前后各10年

### 年月选择

设置 `type="year-month"` 实现年月选择,只显示年份和月份两列。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view v-model="value" type="year-month" />
    <view class="result">
      选中年月: {{ formatYearMonth(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

const formatYearMonth = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}
</script>
```

**适用场景:**

- 信用卡有效期选择
- 账单月份筛选
- 报表期间选择

### 年份选择

设置 `type="year"` 实现年份选择,只显示年份一列。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view v-model="value" type="year" />
    <view class="result">
      选中年份: {{ new Date(value).getFullYear() }}年
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

**适用场景:**

- 年度报告选择
- 毕业年份选择
- 历史数据年份筛选

### 时间选择

设置 `type="time"` 实现时间选择,值为字符串格式 `HH:mm` 或 `HH:mm:ss`(启用秒时)。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view v-model="value" type="time" />
    <view class="result">
      选中时间: {{ value }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('09:30')
</script>
```

**注意事项:**

- 时间类型的值为字符串,不是时间戳
- 默认格式为 `HH:mm`(如 "09:30")
- 启用秒选择后格式为 `HH:mm:ss`(如 "09:30:45")

### 日期时间选择

`type="datetime"` 同时选择日期和时间,显示年、月、日、时、分五列。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view v-model="value" type="datetime" />
    <view class="result">
      选中时间: {{ formatDateTime(value) }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}
</script>
```

### 秒级选择

设置 `use-second` 属性启用秒选择,适用于 time 和 datetime 类型。

```vue
<template>
  <view class="demo">
    <!-- 时间类型 + 秒 -->
    <view class="picker-item">
      <text class="label">精确时间:</text>
      <wd-datetime-picker-view v-model="timeValue" type="time" use-second />
    </view>

    <!-- 日期时间类型 + 秒 -->
    <view class="picker-item">
      <text class="label">精确日期时间:</text>
      <wd-datetime-picker-view v-model="datetimeValue" type="datetime" use-second />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const timeValue = ref('09:30:45')
const datetimeValue = ref(Date.now())
</script>

<style lang="scss" scoped>
.picker-item {
  margin-bottom: 40rpx;

  .label {
    display: block;
    padding: 24rpx;
    font-size: 28rpx;
    color: #333;
  }
}
</style>
```

**适用场景:**

- 定时任务精确设置
- 日志时间记录
- 秒杀活动时间配置

### 日期范围限制

通过 `min-date` 和 `max-date` 设置可选日期范围,值为时间戳(毫秒)。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="date"
      :min-date="minDate"
      :max-date="maxDate"
    />
    <view class="info">
      可选范围: 2020-01-01 至 2025-12-31
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
// 2020年1月1日
const minDate = ref(new Date(2020, 0, 1).getTime())
// 2025年12月31日
const maxDate = ref(new Date(2025, 11, 31).getTime())
</script>

<style lang="scss" scoped>
.info {
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}
</style>
```

**边界计算原理:**

组件内部通过 `getBoundary` 函数计算边界值:

1. 当选中年份等于边界年份时,月份范围受限
2. 当选中月份等于边界月份时,日期范围受限
3. 依此类推,形成级联限制

### 时间范围限制

对于 time 类型,可分别设置时/分/秒的范围限制。

```vue
<template>
  <view class="demo">
    <!-- 工作时间选择: 9:00-18:00 -->
    <view class="section">
      <text class="title">工作时间选择 (9:00-18:00)</text>
      <wd-datetime-picker-view
        v-model="workTime"
        type="time"
        :min-hour="9"
        :max-hour="18"
      />
    </view>

    <!-- 预约时间: 每30分钟 -->
    <view class="section">
      <text class="title">午休时间选择 (12:00-13:30)</text>
      <wd-datetime-picker-view
        v-model="lunchTime"
        type="time"
        :min-hour="12"
        :max-hour="13"
        :min-minute="0"
        :max-minute="30"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const workTime = ref('09:00')
const lunchTime = ref('12:00')
</script>

<style lang="scss" scoped>
.section {
  margin-bottom: 40rpx;

  .title {
    display: block;
    padding: 24rpx;
    font-size: 28rpx;
    color: #333;
    background: #f7f8fa;
  }
}
</style>
```

### 秒范围限制

启用秒选择后,可通过 `min-second` 和 `max-second` 限制秒的范围。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="time"
      use-second
      :min-second="0"
      :max-second="30"
    />
    <view class="info">
      秒范围: 0-30秒
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('09:30:00')
</script>
```

### 选项过滤

通过 `filter` 函数过滤不需要的选项,实现自定义的选项逻辑。

```vue
<template>
  <view class="demo">
    <!-- 分钟间隔15分钟 -->
    <view class="section">
      <text class="title">预约时间 (15分钟间隔)</text>
      <wd-datetime-picker-view
        v-model="appointTime"
        type="time"
        :filter="quarterFilter"
      />
    </view>

    <!-- 只显示偶数小时 -->
    <view class="section">
      <text class="title">偶数小时</text>
      <wd-datetime-picker-view
        v-model="evenHourTime"
        type="time"
        :filter="evenHourFilter"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewFilter } from '@/wd'

const appointTime = ref('09:00')
const evenHourTime = ref('10:00')

// 分钟只显示 0、15、30、45
const quarterFilter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'minute') {
    return values.filter((v) => v % 15 === 0)
  }
  return values
}

// 只显示偶数小时
const evenHourFilter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'hour') {
    return values.filter((v) => v % 2 === 0)
  }
  return values
}
</script>
```

**过滤器参数说明:**

| 参数 | 类型 | 说明 |
|------|------|------|
| type | `DatetimePickerViewColumnType` | 列类型: year/month/date/hour/minute/second |
| values | `number[]` | 原始选项数组 |
| 返回值 | `number[]` | 过滤后的选项数组 |

### 自定义格式化

通过 `formatter` 函数自定义选项显示文本,可以添加单位或进行本地化处理。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="date"
      :formatter="formatter"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewFormatter } from '@/wd'

const value = ref(Date.now())

const formatter: DatetimePickerViewFormatter = (type, value) => {
  const units: Record<string, string> = {
    year: '年',
    month: '月',
    date: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  }
  return `${value}${units[type] || ''}`
}
</script>
```

**格式化器参数说明:**

| 参数 | 类型 | 说明 |
|------|------|------|
| type | `string` | 列类型标识 |
| value | `string` | 已经过 padZero 处理的值(如 "01"、"09") |
| 返回值 | `string` | 格式化后的显示文本 |

### 列格式化函数

通过 `column-formatter` 完全自定义列数据,可以返回任意格式的选项数组。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="date"
      :column-formatter="columnFormatter"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewColumnFormatter, DatetimePickerViewInstance } from '@/wd'

const value = ref(Date.now())

const columnFormatter: DatetimePickerViewColumnFormatter = (picker: DatetimePickerViewInstance) => {
  // 获取原始列数据
  const originColumns = picker.getOriginColumns()

  // 自定义处理
  return originColumns.map((column) => {
    return column.values.map((val) => {
      let label = String(val).padStart(2, '0')

      // 自定义格式
      switch (column.type) {
        case 'year':
          label = `${val}年`
          break
        case 'month':
          label = `${val}月`
          break
        case 'date':
          label = `${val}日`
          break
      }

      return { label, value: val }
    })
  })
}
</script>
```

### 加载状态

设置 `loading` 显示加载状态,可通过 `loading-color` 自定义颜色。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="date"
      :loading="loading"
      loading-color="#1989fa"
    />

    <wd-button @click="toggleLoading">
      {{ loading ? '取消加载' : '模拟加载' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<number | null>(null)
const loading = ref(false)

const toggleLoading = () => {
  if (loading.value) {
    loading.value = false
    return
  }

  loading.value = true
  value.value = null

  // 模拟异步加载
  setTimeout(() => {
    value.value = Date.now()
    loading.value = false
  }, 2000)
}
</script>
```

### 选择器高度设置

通过 `columns-height` 设置选择器内部滚筒的高度。

```vue
<template>
  <view class="demo">
    <!-- 紧凑高度 -->
    <view class="section">
      <text class="label">紧凑高度 (150)</text>
      <wd-datetime-picker-view
        v-model="value"
        type="date"
        :columns-height="150"
      />
    </view>

    <!-- 默认高度 -->
    <view class="section">
      <text class="label">默认高度 (217)</text>
      <wd-datetime-picker-view
        v-model="value"
        type="date"
      />
    </view>

    <!-- 更高 -->
    <view class="section">
      <text class="label">更高 (300)</text>
      <wd-datetime-picker-view
        v-model="value"
        type="date"
        :columns-height="300"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>
```

### 立即触发变化

设置 `immediate-change` 在手指松开时立即触发 change 事件,而不是等待滚动完全停止。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="date"
      immediate-change
      @change="handleChange"
    />
    <view class="log">
      变化次数: {{ changeCount }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const changeCount = ref(0)

const handleChange = () => {
  changeCount.value++
}
</script>
```

## 高级用法

### 预约时间选择

结合过滤器和格式化器实现工作时间段选择。

```vue
<template>
  <view class="demo">
    <view class="title">选择预约时间</view>
    <wd-datetime-picker-view
      v-model="appointmentTime"
      type="datetime"
      :min-date="minDate"
      :filter="workTimeFilter"
      :formatter="formatter"
      @change="handleChange"
    />
    <view class="result">
      预约时间: {{ formatResult }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { DatetimePickerViewFilter, DatetimePickerViewFormatter } from '@/wd'

const appointmentTime = ref(Date.now())
const minDate = ref(Date.now()) // 只能选择今天及以后

// 只允许选择工作时间 9:00-18:00,且每30分钟一个时段
const workTimeFilter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'hour') {
    return values.filter((v) => v >= 9 && v <= 18)
  }
  if (type === 'minute') {
    return values.filter((v) => v === 0 || v === 30)
  }
  return values
}

const formatter: DatetimePickerViewFormatter = (type, value) => {
  const units: Record<string, string> = {
    year: '年',
    month: '月',
    date: '日',
    hour: '时',
    minute: '分',
  }
  return `${value}${units[type] || ''}`
}

const formatResult = computed(() => {
  const date = new Date(appointmentTime.value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
})

const handleChange = ({ value }: { value: number }) => {
  console.log('预约时间:', new Date(value))
}
</script>

<style lang="scss" scoped>
.title {
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.result {
  padding: 24rpx;
  font-size: 28rpx;
  color: #1890ff;
  background: #e6f7ff;
  border-radius: 8rpx;
  margin: 24rpx;
}
</style>
```

### 生日选择器

限制可选日期范围为合理的年龄区间。

```vue
<template>
  <view class="demo">
    <view class="form-item">
      <text class="label">出生日期</text>
      <wd-datetime-picker-view
        v-model="birthday"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        :formatter="formatter"
      />
    </view>
    <view class="age-info">
      年龄: {{ calculateAge }} 岁
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { DatetimePickerViewFormatter } from '@/wd'

// 默认选中2000年1月1日
const birthday = ref(new Date(2000, 0, 1).getTime())

// 限制年龄在 0-120 岁之间
const currentYear = new Date().getFullYear()
const minDate = ref(new Date(currentYear - 120, 0, 1).getTime())
const maxDate = ref(Date.now())

const formatter: DatetimePickerViewFormatter = (type, value) => {
  const units: Record<string, string> = {
    year: '年',
    month: '月',
    date: '日',
  }
  return `${value}${units[type] || ''}`
}

const calculateAge = computed(() => {
  const birthDate = new Date(birthday.value)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})
</script>

<style lang="scss" scoped>
.form-item {
  .label {
    display: block;
    padding: 24rpx;
    font-size: 28rpx;
    color: #333;
    background: #f7f8fa;
  }
}

.age-info {
  padding: 24rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
}
</style>
```

### 闹钟时间设置

使用秒级选择实现精确的闹钟设置。

```vue
<template>
  <view class="demo">
    <view class="alarm-header">
      <text class="time-display">{{ alarmTime }}</text>
    </view>

    <wd-datetime-picker-view
      v-model="alarmTime"
      type="time"
      use-second
      :formatter="formatter"
    />

    <view class="actions">
      <wd-button type="primary" block @click="setAlarm">
        设置闹钟
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewFormatter } from '@/wd'

const alarmTime = ref('07:00:00')

const formatter: DatetimePickerViewFormatter = (type, value) => {
  const units: Record<string, string> = {
    hour: '时',
    minute: '分',
    second: '秒',
  }
  return `${value}${units[type] || ''}`
}

const setAlarm = () => {
  uni.showToast({
    title: `闹钟已设置: ${alarmTime.value}`,
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.alarm-header {
  padding: 60rpx 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .time-display {
    font-size: 80rpx;
    font-weight: bold;
    color: #fff;
    font-family: 'Courier New', monospace;
  }
}

.actions {
  padding: 40rpx;
}
</style>
```

### 有效期选择

信用卡有效期选择场景。

```vue
<template>
  <view class="demo">
    <view class="card-form">
      <view class="form-item">
        <text class="label">卡片有效期</text>
        <wd-datetime-picker-view
          v-model="expiryDate"
          type="year-month"
          :min-date="minDate"
          :max-date="maxDate"
          :formatter="formatter"
        />
      </view>

      <view class="expiry-display">
        有效期: {{ formatExpiry }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { DatetimePickerViewFormatter } from '@/wd'

const expiryDate = ref(Date.now())

// 有效期范围: 当前月份到10年后
const minDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime())
const maxDate = ref(new Date(new Date().getFullYear() + 10, 11, 31).getTime())

const formatter: DatetimePickerViewFormatter = (type, value) => {
  if (type === 'year') {
    return value.slice(-2) // 只显示年份后两位
  }
  return value
}

const formatExpiry = computed(() => {
  const date = new Date(expiryDate.value)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${month}/${year}`
})
</script>

<style lang="scss" scoped>
.card-form {
  .form-item {
    .label {
      display: block;
      padding: 24rpx;
      font-size: 28rpx;
      color: #333;
    }
  }

  .expiry-display {
    padding: 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    background: #f7f8fa;
    margin: 24rpx;
    border-radius: 8rpx;
  }
}
</style>
```

### 通过 ref 获取选中信息

使用组件实例方法获取选中项的详细信息。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      ref="pickerRef"
      v-model="value"
      type="date"
      :formatter="formatter"
    />

    <view class="actions">
      <wd-button @click="getSelects">获取选中项</wd-button>
      <wd-button @click="getOriginColumns">获取原始列</wd-button>
    </view>

    <view v-if="selectsInfo" class="info-box">
      <text>选中项信息:</text>
      <text>{{ JSON.stringify(selectsInfo, null, 2) }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DatetimePickerViewInstance, DatetimePickerViewFormatter } from '@/wd'

const pickerRef = ref<DatetimePickerViewInstance>()
const value = ref(Date.now())
const selectsInfo = ref<any>(null)

const formatter: DatetimePickerViewFormatter = (type, value) => {
  const units: Record<string, string> = {
    year: '年',
    month: '月',
    date: '日',
  }
  return `${value}${units[type] || ''}`
}

const getSelects = () => {
  const selects = pickerRef.value?.getSelects()
  selectsInfo.value = selects
  console.log('选中项:', selects)
}

const getOriginColumns = () => {
  const columns = pickerRef.value?.getOriginColumns()
  console.log('原始列:', columns)
  uni.showToast({
    title: `共 ${columns?.length} 列`,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
}

.info-box {
  margin: 24rpx;
  padding: 24rpx;
  background: #f7f8fa;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
  white-space: pre-wrap;
}
</style>
```

### 事件监听

监听选择器的各种事件。

```vue
<template>
  <view class="demo">
    <wd-datetime-picker-view
      v-model="value"
      type="datetime"
      @change="handleChange"
      @pickstart="handlePickStart"
      @pickend="handlePickEnd"
    />

    <view class="event-log">
      <text class="title">事件日志:</text>
      <view v-for="(log, index) in logs" :key="index" class="log-item">
        {{ log }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
const logs = ref<string[]>([])

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${msg}`)
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

const handleChange = ({ value }: { value: number | string }) => {
  addLog(`change: ${value}`)
}

const handlePickStart = () => {
  addLog('pickstart: 开始滚动')
}

const handlePickEnd = () => {
  addLog('pickend: 结束滚动')
}
</script>

<style lang="scss" scoped>
.event-log {
  margin: 24rpx;
  padding: 24rpx;
  background: #f7f8fa;
  border-radius: 8rpx;

  .title {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .log-item {
    font-size: 24rpx;
    color: #666;
    padding: 8rpx 0;
    border-bottom: 1rpx solid #eee;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中值,time 类型为字符串,其他类型为时间戳 | `string \| number` | - |
| type | 选择器类型 | `'date' \| 'year-month' \| 'time' \| 'datetime' \| 'year'` | `'datetime'` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载图标颜色 | `string` | `'#4D80F0'` |
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
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值更新时触发(用于 v-model) | `value: string \| number` |
| change | 选中值变化时触发 | `{ value: string \| number, picker: DatetimePickerViewInstance }` |
| pickstart | 开始滚动时触发 | - |
| pickend | 结束滚动时触发 | - |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| updateColumns | 更新并返回列数据 | - | `DatetimePickerViewOption[][]` |
| setColumns | 手动设置列数据 | `columnList: DatetimePickerViewOption[][]` | - |
| getSelects | 获取当前选中项 | - | `Record<string, any>[]` |
| correctValue | 修正输入值到有效范围 | `value: string \| number` | `string \| number` |
| getPickerValue | 将值转换为 picker 数组 | `value: string \| number, type: DateTimeType` | `number[]` |
| getOriginColumns | 获取原始列配置(不含格式化) | - | `{ type: DatetimePickerViewColumnType, values: number[] }[]` |

### 类型定义

```typescript
/**
 * 日期时间类型
 */
export type DateTimeType = 'date' | 'year-month' | 'time' | 'datetime' | 'year'

/**
 * 日期时间选择器列类型
 */
export type DatetimePickerViewColumnType =
  | 'year'
  | 'month'
  | 'date'
  | 'hour'
  | 'minute'
  | 'second'

/**
 * 选项接口
 */
interface DatetimePickerViewOption {
  /** 显示文本 */
  label: string
  /** 选项值 */
  value: number
}

/**
 * 过滤器函数类型
 * @param type 列类型
 * @param values 原始值数组
 * @returns 过滤后的值数组
 */
export type DatetimePickerViewFilter = (
  type: DatetimePickerViewColumnType,
  values: number[],
) => number[]

/**
 * 格式化函数类型
 * @param type 列类型
 * @param value 已 padZero 处理的值字符串
 * @returns 格式化后的显示文本
 */
export type DatetimePickerViewFormatter = (type: string, value: string) => string

/**
 * 列格式化函数类型
 * @param picker 选择器实例
 * @returns 完整的列数据数组
 */
export type DatetimePickerViewColumnFormatter = (
  picker: DatetimePickerViewInstance,
) => DatetimePickerViewOption[][]

/**
 * 组件属性接口
 */
interface WdDatetimePickerViewProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 选中项，当 type 为 time 时为字符串，否则为时间戳 */
  modelValue: string | number
  /** 加载中 */
  loading?: boolean
  /** 加载的颜色 */
  loadingColor?: string
  /** picker内部滚筒高 */
  columnsHeight?: number
  /** 选择器类型 */
  type?: DateTimeType
  /** 自定义过滤选项的函数 */
  filter?: DatetimePickerViewFilter
  /** 自定义选项文案的格式化函数 */
  formatter?: DatetimePickerViewFormatter
  /** 自定义列的格式化函数 */
  columnFormatter?: DatetimePickerViewColumnFormatter
  /** 最小日期 */
  minDate?: number
  /** 最大日期 */
  maxDate?: number
  /** 最小小时 */
  minHour?: number
  /** 最大小时 */
  maxHour?: number
  /** 最小分钟 */
  minMinute?: number
  /** 最大分钟 */
  maxMinute?: number
  /** 是否显示秒选择 */
  useSecond?: boolean
  /** 最小秒数 */
  minSecond?: number
  /** 最大秒数 */
  maxSecond?: number
  /** 是否在手指松开时立即触发 change */
  immediateChange?: boolean
}

/**
 * 组件暴露方法接口
 */
interface DatetimePickerViewExpose {
  updateColumns: () => DatetimePickerViewOption[][]
  setColumns: (columnList: DatetimePickerViewOption[][]) => void
  getSelects: () => Record<string, any> | Record<string, any>[] | undefined
  correctValue: (value: string | number) => string | number
  getPickerValue: (value: string | number, type: DateTimeType) => number[]
  getOriginColumns: () => {
    type: DatetimePickerViewColumnType
    values: number[]
  }[]
}

/**
 * 组件实例类型
 */
export type DatetimePickerViewInstance = ComponentPublicInstance<
  WdDatetimePickerViewProps,
  DatetimePickerViewExpose
>
```

## 主题定制

组件继承 PickerView 的样式变量,可通过以下 CSS 变量进行主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--wd-picker-bg` | 选择器背景色 | `#ffffff` |
| `--wd-picker-column-fs` | 选项字体大小 | `32rpx` |
| `--wd-picker-column-color` | 选项文字颜色 | `#333333` |
| `--wd-picker-column-height` | 选项高度 | `88rpx` |
| `--wd-picker-mask-bg` | 遮罩层背景 | `linear-gradient(...)` |
| `--wd-picker-indicator-border` | 指示器边框 | `1rpx solid #eee` |

### 主题定制示例

```vue
<template>
  <view class="custom-theme">
    <wd-datetime-picker-view v-model="value" type="date" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>

<style lang="scss" scoped>
.custom-theme {
  --wd-picker-bg: #f0f9ff;
  --wd-picker-column-color: #1890ff;
  --wd-picker-column-fs: 28rpx;
}
</style>
```

## 最佳实践

### 1. 正确选择类型

```typescript
// ✅ 根据业务场景选择合适的类型
// 生日选择 → date
<wd-datetime-picker-view type="date" />

// 信用卡有效期 → year-month
<wd-datetime-picker-view type="year-month" />

// 闹钟时间 → time
<wd-datetime-picker-view type="time" />

// 预约时间 → datetime
<wd-datetime-picker-view type="datetime" />

// 年份筛选 → year
<wd-datetime-picker-view type="year" />
```

### 2. 合理设置日期范围

```typescript
// ✅ 根据业务需求设置范围
// 生日选择: 0-120岁
const minDate = new Date(new Date().getFullYear() - 120, 0, 1).getTime()
const maxDate = Date.now()

// 预约时间: 今天到一个月后
const minDate = Date.now()
const maxDate = Date.now() + 30 * 24 * 60 * 60 * 1000

// ❌ 避免范围过大导致选项过多
// 默认前后各10年通常是合适的
```

### 3. 使用过滤器优化体验

```typescript
// ✅ 过滤不可选的选项,而不是禁用
const workTimeFilter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'hour') {
    return values.filter((v) => v >= 9 && v <= 18)
  }
  return values
}

// ✅ 时间间隔过滤
const intervalFilter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'minute') {
    return values.filter((v) => v % 15 === 0) // 15分钟间隔
  }
  return values
}
```

### 4. 格式化提升可读性

```typescript
// ✅ 添加单位使选项更清晰
const formatter: DatetimePickerViewFormatter = (type, value) => {
  const units: Record<string, string> = {
    year: '年',
    month: '月',
    date: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  }
  return `${value}${units[type] || ''}`
}

// ✅ 特殊处理某些值
const formatter: DatetimePickerViewFormatter = (type, value) => {
  if (type === 'hour') {
    const hour = parseInt(value)
    if (hour < 12) return `上午 ${value}时`
    return `下午 ${hour === 12 ? 12 : hour - 12}时`
  }
  return value
}
```

### 5. 处理时间格式转换

```typescript
// ✅ time 类型值为字符串
const timeValue = ref('09:30')
// 使用秒时
const timeWithSecond = ref('09:30:45')

// ✅ 其他类型值为时间戳
const dateValue = ref(Date.now())
const datetimeValue = ref(new Date(2024, 0, 1).getTime())

// ✅ 格式化显示
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
```

## 常见问题

### 1. 时间格式说明

**time 类型**:
- 值为字符串格式
- 默认: `"HH:mm"` (如 `"09:30"`)
- 启用秒: `"HH:mm:ss"` (如 `"09:30:45"`)

**其他类型**:
- 值为时间戳(毫秒)
- 使用 `Date.now()` 获取当前时间
- 使用 `new Date(year, month - 1, day).getTime()` 构造特定日期

### 2. 如何获取格式化后的时间字符串?

```typescript
const pickerRef = ref<DatetimePickerViewInstance>()

// 方法1: 获取选中项信息
const selects = pickerRef.value?.getSelects()
// selects 为数组,每个元素包含 label 和 value

// 方法2: 自己格式化时间戳
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
```

### 3. 日期联动原理

组件内部自动处理年月日的联动:

1. **月份天数计算**: 通过 `getMonthEndDay` 函数计算每月最大天数
2. **边界计算**: 通过 `getBoundary` 函数计算最小/最大边界
3. **列更新**: 通过 `columnChange` 回调更新后续列的数据
4. **值修正**: 当前选中日期超出新范围时,自动修正为最大值

### 4. filter 和 formatter 的区别?

| 函数 | 作用 | 影响 |
|------|------|------|
| filter | 过滤选项,决定哪些值可选 | 减少可选项 |
| formatter | 格式化显示文本 | 只影响显示,不影响值 |

```typescript
// filter: 过滤掉不需要的值
const filter = (type, values) => {
  if (type === 'minute') return values.filter(v => v % 15 === 0)
  return values
}

// formatter: 添加单位
const formatter = (type, value) => {
  return `${value}${type === 'hour' ? '时' : ''}`
}
```

### 5. 如何设置默认值为今天?

```typescript
// 方法1: 使用 Date.now()
const value = ref(Date.now())

// 方法2: 构造今天的开始时间
const today = new Date()
today.setHours(0, 0, 0, 0)
const value = ref(today.getTime())

// 方法3: 时间类型使用当前时间字符串
const now = new Date()
const value = ref(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
```

### 6. 为什么修改 minDate/maxDate 后选项没更新?

组件内部使用 `debounce` 防抖处理 props 变化,会有 50ms 延迟。如果需要立即更新,可以:

```typescript
// 方法1: 同时修改 modelValue 触发重新渲染
minDate.value = newMinDate
value.value = correctValue(value.value) // 触发更新

// 方法2: 使用 nextTick
await nextTick()
pickerRef.value?.updateColumns()
```

### 7. TypeScript 类型报错?

```typescript
// ✅ 正确导入类型
import type {
  DatetimePickerViewInstance,
  DatetimePickerViewFilter,
  DatetimePickerViewFormatter,
  DatetimePickerViewColumnFormatter,
  DateTimeType,
  DatetimePickerViewColumnType
} from '@/wd'

// 组件 ref 类型
const pickerRef = ref<DatetimePickerViewInstance>()

// 过滤器类型
const filter: DatetimePickerViewFilter = (type, values) => {
  return values
}

// 格式化器类型
const formatter: DatetimePickerViewFormatter = (type, value) => {
  return value
}
```

### 8. 如何禁用某些日期?

组件不支持直接禁用日期,可以通过以下方式实现:

```typescript
// 方法1: 使用 filter 过滤掉不可选的日期
const filter: DatetimePickerViewFilter = (type, values) => {
  if (type === 'date') {
    // 过滤掉周末(需要结合当前选中的年月计算)
    return values.filter(day => {
      const date = new Date(currentYear, currentMonth - 1, day)
      return date.getDay() !== 0 && date.getDay() !== 6
    })
  }
  return values
}

// 方法2: 在 change 事件中验证
const handleChange = ({ value }) => {
  if (isDisabledDate(value)) {
    uni.showToast({ title: '该日期不可选', icon: 'none' })
    // 重置为之前的值
  }
}
```

## 总结

`DatetimePickerView` 日期时间选择器视图的核心使用要点:

1. **类型选择** - 根据场景选择 date/year-month/time/datetime/year
2. **值格式** - time 类型为字符串(HH:mm),其他类型为时间戳
3. **范围限制** - 使用 min-date/max-date 和 min-hour/max-hour 等限制可选范围
4. **选项过滤** - 使用 filter 函数过滤不需要的选项
5. **格式化显示** - 使用 formatter 函数自定义选项显示文本
6. **秒级选择** - 设置 use-second 启用秒选择
7. **实例方法** - 通过 ref 获取实例调用 getSelects/updateColumns 等方法
8. **事件监听** - 监听 change/pickstart/pickend 事件处理交互逻辑
